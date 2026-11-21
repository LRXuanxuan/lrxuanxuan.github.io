/* Local drawing workspace. No analytics, remote processing or user-file uploads. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const compactReference = window.matchMedia('(max-width: 1024px), (max-width: 1440px) and (pointer: coarse)');
  const all = selector => Array.from(document.querySelectorAll(selector));
  const Core = window.DrawingCore, Marks = window.DrawingMarks, Strokes = window.DrawingStrokeRecords;
  const MAX_PIXELS = 12000000, LAYER_PIXELS = 36000000, MAX_LAYERS = 16;
  const HISTORY_BYTES = 48 * 1024 * 1024, PROJECT_BYTES = 160 * 1024 * 1024;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const number = (v, fallback) => Number.isFinite(+v) ? +v : fallback;
  function normalizeTone(value) {
    return { hue: clamp(number(value && value.hue, 0), -180, 180),
      saturation: clamp(number(value && value.saturation, 0), -100, 100),
      lightness: clamp(number(value && value.lightness, 0), -100, 100) };
  }
  const adjustedTone = tone => !!(tone && (tone.hue || tone.saturation || tone.lightness));
  const uid = () => window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));
  function canvas(w = 1, h = 1) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  const context = c => c.getContext('2d', { willReadFrequently: true });
  function resize(c, w, h) { if (c.width !== w) c.width = w; if (c.height !== h) c.height = h; }
  function clear(c) { const x = context(c); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); }
  function validSize(w, h) {
    w = Math.round(+w); h = Math.round(+h);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 32 || h < 32 || w > 4096 || h > 4096 || w * h > MAX_PIXELS) throw new Error('画布单边需为 32–4096 px，总像素不超过 1200 万。');
    return { width: w, height: h };
  }
  function layerBudget(count, w = art.width, h = art.height) {
    if (count > MAX_LAYERS || count * w * h > LAYER_PIXELS) throw new Error('图层达到本机轻量限额。请减小画布，或保存工程后减少图层。');
  }
  const display = $('drawingCanvas'), viewport = $('canvasViewport'), surface = $('canvasSurface');
  const composite = canvas(), strokeCanvas = canvas(), liveCanvas = canvas(), sampleCanvas = canvas();
  let toneScratch = null, toneScope = 'all';
  let art, ref, activePointer = null, refPointer = null, spacePan = false, busy = 0;
  let view = { zoom: 1, x: 0, y: 0 }, refView = { zoom: 1, x: 0, y: 0 };
  let tool = 'brush', brush = 'gpen', ink = '#263544', size = 8, opacity = 1, stabilizer = 20;
  let textureScale = 1, textureDensity = 1;
  let pressureEnabled = true, touchDraw = false, penOnlyBrush = true, refPicking = false, recentColors = [], fillPalettePending = false;
  // A device-local preference, not an artwork setting. New installations start with mouse brushing disabled.
  const penOnlyBrushKey = 'lrx-drawing-pen-only-brush-v1';
  try { penOnlyBrush = localStorage.getItem(penOnlyBrushKey) !== 'off'; } catch (_) {}
  let eraserMode = 'local';
  try { if (localStorage.getItem('lrx-drawing-eraser-mode-v1') === 'stroke') eraserMode = 'stroke'; } catch (_) {}
  let undoStack = [], redoStack = [], frame = 0, transactions = new Map();
  let revision = 0, savedRevision = 0, sessionUsed = false, draftId = uid(), saveTimer = 0, savePromise = null;
  let currentStamp = null, currentReady = false, switchingCurrent = false, currentConflict = false;
  let initialized = false, closePromise = null;
  let referenceCache = null, referenceVersion = 0, referenceCacheVersion = -1, lastReferenceKey = '';
  let pendingPDFPage = null;
  let toastTimer = 0, savingErrorShown = false, vectorResult = null, vectorKey = '', vectorURL = '';
  let lastPressure = 0, lastPointerType = 'mouse', fileSavedRevision = -1;
  let colorPicker = null, colorLibrary = null, referenceSplitter = null, lastReferencePort = null;
  let sampleFrame = 0, galleryFrame = 0, galleryObserver = null;
  const gallerySamples = new Map();
  const brushKey = 'lrx-drawing-brush-v1:';
  const brushProfiles = new Map();
  const eraserPreset = { id: 'eraser', size: 18, opacity: 1, stabilizer: 12 };
  let brushStorageWarning = false, refreshBrushAfterStroke = false;
  function textureSetting(value, maximum) {
    return Number.isFinite(value) ? clamp(Math.round(value * 20) / 20, .25, maximum) : 1;
  }
  function brushProfile(preset) {
    let saved = brushProfiles.get(preset.id);
    if (!saved) {
      try { saved = JSON.parse(localStorage.getItem(brushKey + preset.id)); } catch (_) {}
    }
    const setting = (key, min, max) => Number.isFinite(saved?.[key]) ? clamp(saved[key], min, max) : preset[key];
    return { size: setting('size', 1, 240), opacity: setting('opacity', .01, 1),
      stabilizer: setting('stabilizer', 0, 100), pressureEnabled: (saved?.pressureEnabled ?? preset.pressureEnabled) !== false,
      textureScale: textureSetting(setting('textureScale', .25, 4), 4),
      textureDensity: textureSetting(setting('textureDensity', .25, 2), 2) };
  }
  function storeBrushProfile() {
    if (tool !== 'brush' && tool !== 'eraser') return;
    const id = tool === 'eraser' ? 'eraser' : brush;
    const profile = { size, opacity, stabilizer, pressureEnabled, textureScale, textureDensity };
    brushProfiles.set(id, profile);
    try { localStorage.setItem(brushKey + id, JSON.stringify(profile)); } catch (_) {
      if (!brushStorageWarning) { brushStorageWarning = true; notify('浏览器未能保存笔刷偏好，本次打开画室期间仍会记住。'); }
    }
  }
  function refreshActiveBrushProfile() {
    const preset = tool === 'eraser' ? eraserPreset : Core.brushPresets.find(p => p.id === brush);
    if (tool === 'brush' || tool === 'eraser') applyBrushProfile(brushProfile(preset));
  }
  function applyBrushProfile(profile) {
    ({ size, opacity, stabilizer, pressureEnabled } = profile);
    textureScale = textureSetting(profile.textureScale, 4); textureDensity = textureSetting(profile.textureDensity, 2);
    $('brushSize').value = size; syncOpacityUI();
    $('stabilizer').value = stabilizer; $('stabilizerValue').textContent = stabilizer;
    $('penPressure').checked = pressureEnabled; syncBrushTextureUI(); scheduleBrushSample();
  }
  function syncBrushTextureUI() {
    const preset = Core.brushPresets.find(p => p.id === brush), enabled = tool === 'brush' && !!preset?.textureControls;
    $('brushTextureControls').hidden = !enabled;
    $('brushTextureHint').textContent = '100% 为原效果。粗细越大纹理越粗，密度越高落墨越密；每支笔分别记住。' + (preset?.textureHint || '');
    for (const [id, value] of [['brushTextureScale', textureScale], ['brushTextureDensity', textureDensity]]) {
      const percent = Math.round(value * 100);
      $(id).disabled = !enabled; $(id).value = percent;
      $(id + 'Value').textContent = percent + '%'; $(id).setAttribute('aria-valuetext', percent + '%');
    }
  }
  function syncOpacityUI() {
    const minimum = tool === 'fill' ? 0 : .01;
    opacity = clamp(number(opacity, 1), minimum, 1);
    const value = Math.round(opacity * 100);
    $('brushOpacity').min = tool === 'fill' ? 0 : 1;
    $('brushOpacity').value = value; $('brushOpacityValue').textContent = value + '%';
    $('fillOpacity').value = value; $('fillOpacityValue').textContent = value + '%';
  }
  const MARK_FONTS = {
    system: 'system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif',
    yahei: '"Microsoft YaHei", "PingFang SC", sans-serif', heiti: '"SimHei", "Heiti SC", sans-serif',
    song: '"SimSun", "Songti SC", serif', kai: '"KaiTi", "Kaiti SC", "STKaiti", serif',
    fangsong: '"FangSong", "STFangsong", serif', arial: 'Arial, "Helvetica Neue", sans-serif',
    times: '"Times New Roman", Times, "Songti SC", serif', georgia: 'Georgia, "Times New Roman", serif',
    mono: 'Consolas, "Courier New", monospace'
  };
  const MARK_DEFAULTS = {
    shapeKind: 'rect', shapeConstrain: false, shapeFill: true, shapeStroke: true, shapeStrokeColor: '#263544', shapeStrokeWidth: 2,
    frameColor: '#354953', frameAccent: '#d4b583', frameWidth: 12,
    textBoxStyle: 'none', textBoxColor: '#fff4df', textBoxAccent: '#886d52',
    textContent: '轻绘 Drawing', textFont: 'system', textSize: 48, textLineHeight: 1.3, textBold: false, textItalic: false, textAlign: 'left', textUseMaterial: false,
    materialKind: 'solid', materialFollowInk: true, materialForeground: '#263544', materialBackground: '#ffffff', materialTransparent: false, materialSpacing: 14, materialThickness: 2, materialAngle: 45
  };
  function normalizeMarkSettings(value) {
    value = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const next = { ...MARK_DEFAULTS };
    for (const key of Object.keys(next)) if (typeof next[key] === 'boolean' && typeof value[key] === 'boolean') next[key] = value[key];
    const enums = { shapeKind: Array.from($('shapeKind').options, o => o.value), textBoxStyle: Array.from($('textBoxStyle').options, o => o.value), textFont: Object.keys(MARK_FONTS), textAlign: ['left', 'center', 'right'], materialKind: Array.from($('materialKind').options, o => o.value) };
    for (const key of Object.keys(enums)) if (enums[key].includes(value[key])) next[key] = value[key];
    for (const key of ['shapeStrokeColor', 'materialForeground', 'materialBackground', 'frameColor', 'frameAccent', 'textBoxColor', 'textBoxAccent']) if (typeof value[key] === 'string' && /^#[a-f0-9]{6}$/i.test(value[key])) next[key] = value[key].toLowerCase();
    for (const [key, lo, hi] of [['shapeStrokeWidth', .5, 80], ['frameWidth', 1, 240], ['textSize', 8, 360], ['textLineHeight', .8, 3], ['materialSpacing', 4, 100], ['materialThickness', 1, 24], ['materialAngle', 0, 180]]) {
      if (typeof value[key] === 'number' || typeof value[key] === 'string') next[key] = clamp(number(value[key], next[key]), lo, hi);
    }
    if (typeof value.textContent === 'string') next.textContent = value.textContent.slice(0, 1200).split(/\r?\n/).slice(0, 20).join('\n');
    return next;
  }
  function readMarkSettings() {
    const value = {};
    for (const key of Object.keys(MARK_DEFAULTS)) value[key] = typeof MARK_DEFAULTS[key] === 'boolean' ? $(key).checked : $(key).value;
    return normalizeMarkSettings(value);
  }
  function applyMarkSettings(value) {
    const settings = normalizeMarkSettings(value);
    for (const key of Object.keys(settings)) { if (typeof settings[key] === 'boolean') $(key).checked = settings[key]; else $(key).value = settings[key]; }
    updateMaterialUI();
  }
  function materialStyle(settings = readMarkSettings(), scale = 1) {
    return { kind: settings.materialKind, foreground: settings.materialFollowInk ? ink : settings.materialForeground, background: settings.materialBackground, transparentBackground: settings.materialTransparent, spacing: settings.materialSpacing / scale, thickness: settings.materialThickness / scale, angle: settings.materialAngle };
  }
  function updateMaterialUI() {
    if (!Marks) return;
    const s = readMarkSettings(), centered = s.materialKind === 'radial', gradient = ['linear', 'reflected', 'radial'].includes(s.materialKind), pattern = !gradient && s.materialKind !== 'solid', riso = s.materialKind.startsWith('riso-'), wetRiso = s.materialKind.startsWith('riso-wet-');
    $('materialName').textContent = $('materialKind').selectedOptions[0].textContent;
    $('materialPatternOptions').hidden = !pattern; $('materialAngleField').hidden = !['diagonal', 'crosshatch', 'linear', 'reflected', 'checker', 'weave'].includes(s.materialKind);
    $('materialThickness').closest('label').hidden = s.materialKind === 'checker';
    $('materialThicknessLabel').textContent = riso ? '颗粒大小' : '线宽 / 点径';
    $('materialSpacingLabel').textContent = riso ? '颗粒间距（越小越密）' : '间距（越小越密）';
    $('materialThickness').setAttribute('aria-label', riso ? (wetRiso ? '湿印颗粒大小' : '干印颗粒大小') : '材质粗细');
    $('materialSpacing').setAttribute('aria-label', riso ? (wetRiso ? '湿印颗粒间距' : '干印颗粒间距') : '材质间距');
    $('materialHint').textContent = riso ? (wetRiso ? '三档湿印颗粒' : '三档干印颗粒') + '，可调大小与间距。透明背景适合另建图层叠加；油漆桶、形状和文字均可使用。' : '适用于油漆桶与形状；文字也可启用。透明背景保留原有像素，适合另建图层叠加排线。';
    $('shapeConstraintText').textContent = ['line', 'arrow'].includes(s.shapeKind) ? '方向吸附到 45°' : '固定 1:1 比例';
    const isFrame = Marks.frameKinds.includes(s.shapeKind);
    $('shapePaintFields').hidden = isFrame; $('frameFields').hidden = !isFrame;
    $('textBoxColors').hidden = s.textBoxStyle === 'none';
    if (tool === 'shape' || tool === 'text') renderMarkSample(s);
    $('materialBackField').hidden = s.materialKind === 'solid'; $('materialBackFromInk').hidden = s.materialKind === 'solid'; $('materialTransparentLabel').hidden = s.materialKind === 'solid';
    const frontLabel = centered ? '中心颜色' : gradient ? '起始颜色' : s.materialKind === 'solid' ? '填充颜色' : riso ? '油墨颜色' : '纹理颜色';
    const backLabel = centered ? '边缘颜色' : gradient ? '末尾颜色' : '背景颜色', transparentLabel = centered ? '边缘透明' : '背景透明';
    $('materialFrontLabel').textContent = frontLabel; $('materialBackLabel').textContent = backLabel;
    $('materialForeground').setAttribute('aria-label', frontLabel); $('materialBackground').setAttribute('aria-label', backLabel);
    $('materialBackFromInk').textContent = centered ? '用当前颜色作边缘' : '用当前颜色作背景';
    $('materialTransparentText').textContent = transparentLabel; $('materialTransparent').setAttribute('aria-label', transparentLabel);
    $('materialThicknessValue').textContent = s.materialThickness + ' px'; $('materialSpacingValue').textContent = s.materialSpacing + ' px'; $('materialAngleValue').textContent = s.materialAngle + '°';
    if (s.materialFollowInk) $('materialForeground').value = ink;
    const preview = $('materialPreview'), ctx = context(preview); clear(preview); ctx.fillStyle = Marks.fillStyle(ctx, materialStyle(s), { x: 0, y: 0, width: preview.width, height: preview.height }); ctx.fillRect(0, 0, preview.width, preview.height);
  }
  function status(text) { $('status').textContent = text || '准备好了'; }
  function notify(message) {
    const text = message instanceof Error ? message.message : String(message);
    status(text); $('toast').textContent = text; $('toast').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5200);
  }
  function safe(fn) { return event => { if (busy) { if (event) event.preventDefault(); return; } try { Promise.resolve(fn(event)).catch(notify); } catch (error) { notify(error); } }; }
  function on(id, event, fn) { $(id).addEventListener(event, safe(fn)); }
  async function work(fn, message) {
    if (busy) return;
    finishPointer(); busy++; document.body.classList.add('busy');
    const controls = all('button,input,select,textarea').map(element => [element, element.disabled]);
    controls.forEach(([element]) => { element.disabled = true; });
    if (message) status(message);
    try { await tick(); return await fn(); }
    finally { busy--; document.body.classList.remove('busy'); controls.forEach(([element, disabled]) => { element.disabled = disabled; }); if (art) sync(); }
  }
  function blobFromCanvas(c, type = 'image/png', quality) {
    return new Promise((resolve, reject) => {
      try { c.toBlob(blob => blob ? resolve(blob) : reject(new Error('图片编码失败，请先保存工程后重试。')), type, quality); }
      catch (error) { reject(error); }
    });
  }
  function blobArray(blob) {
    if (blob.arrayBuffer) return blob.arrayBuffer();
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('文件读取失败。')); reader.readAsArrayBuffer(blob); });
  }
  function blobDataURL(blob) {
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('文件读取失败。')); reader.readAsDataURL(blob); });
  }
  function loadImage(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob), image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片无法读取，请使用 PNG、JPEG 或 WebP。')); };
      image.src = url;
    });
  }
  async function download(blob, name) {
    if (window.DrawingDesktop) return window.DrawingDesktop.save(blob, name);
    const a = document.createElement('a'), url = URL.createObjectURL(blob);
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  }
  function filename(name) { return String(name || '未命名画作').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 80).trim() || '未命名画作'; }
  function createLayer(name, dimensions = art) {
    return { id: uid(), name: name || '图层 ' + (art ? art.layers.length + 1 : 1), visible: true, locked: false, opacity: 1, x: 0, y: 0, scale: 1, tone: normalizeTone(), strokeRecords: null, canvas: canvas(dimensions.width, dimensions.height) };
  }
  const activeLayer = () => art.layers.find(layer => layer.id === art.activeId) || art.layers[0];
  function metadata(layer) { return { id: layer.id, name: layer.name, visible: layer.visible, locked: layer.locked, opacity: layer.opacity, x: layer.x, y: layer.y, scale: layer.scale, tone: normalizeTone(layer.tone) }; }
  function snapshot() {
    return { title: art.title, width: art.width, height: art.height, paperPpi: art.paperPpi, paper: art.paper, paperColor: art.paperColor, paperOpacity: art.paperOpacity, paperTexture: art.paperTexture, textureStrength: art.textureStrength, tone: { ...art.tone }, activeId: art.activeId, layers: art.layers.map(layer => ({ ...layer, tone: normalizeTone(layer.tone) })) };
  }
  function setGeometry() {
    resize(display, art.width, art.height); resize(composite, art.width, art.height);
    resize(strokeCanvas, art.width, art.height); resize(liveCanvas, art.width, art.height);
    if (toneScratch && (toneScratch.width !== art.width || toneScratch.height !== art.height)) resize(toneScratch, 1, 1);
    surface.style.width = art.width + 'px'; surface.style.height = art.height + 'px';
    $('documentSize').textContent = art.width + ' × ' + art.height;
    window.DrawingCanvasPresets.syncCanvas(art.width, art.height, art.paperPpi);
  }
  function restoreSnapshot(state) {
    const dimensionsChanged = !art || art.width !== state.width || art.height !== state.height;
    art = { ...state, tone: { ...state.tone }, layers: state.layers.map(layer => ({ ...layer, tone: normalizeTone(layer.tone) })) };
    setGeometry(); if (dimensionsChanged) fit(); sync(); render();
  }
  const recordSnapshot = () => art.layers.map(layer => ({ id: layer.id, state: layer.strokeRecords || null }));
  function restoreRecords(records) {
    if (!records) return;
    const states = new Map(records.map(item => [item.id, item.state]));
    for (const layer of art.layers) if (states.has(layer.id)) layer.strokeRecords = states.get(layer.id);
  }
  function memory() {
    const live = new Set(art.layers.map(l => l.canvas)), seen = new Set(); let total = 0;
    const records = art.layers.map(layer => layer.strokeRecords);
    for (const entry of undoStack.concat(redoStack)) {
      if (entry.kind === 'pixels' || entry.kind === 'tiles') {
        if (entry.kind === 'pixels') total += entry.before.data.byteLength + entry.after.data.byteLength;
        else for (const p of entry.patches) total += p.before.image.data.byteLength + p.after.image.data.byteLength;
        for (const snapshot of [entry.recordsBefore, entry.recordsAfter]) if (snapshot) records.push(...snapshot.map(item => item.state));
      } else for (const state of [entry.before, entry.after]) for (const layer of state.layers) {
        records.push(layer.strokeRecords);
        if (!live.has(layer.canvas) && !seen.has(layer.canvas)) { seen.add(layer.canvas); total += layer.canvas.width * layer.canvas.height * 4; }
      }
    }
    return total + Strokes.bytes(records, new Set(), true);
  }
  function changed() {
    revision++; sessionUsed = true; vectorKey = ''; savingErrorShown = false;
    $('canvasHint').hidden = true;
    if (currentConflict) { $('saveStatus').textContent = '另一标签页已更新 · 请存工程'; return; }
    $('saveStatus').textContent = '待保存';
    if (!saveTimer && !savePromise) scheduleSave();
  }
  function scheduleSave(delay = 0) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = 0; saveDraft().catch(notifySaveError); }, delay);
  }
  function addHistory(entry) {
    undoStack.push(entry); redoStack = [];
    trimHistory();
    changed(); syncHistory(); syncLayers();
  }
  function trimHistory() {
    while (undoStack.length > 40 || (undoStack.length > 1 && memory() > HISTORY_BYTES)) undoStack.shift();
    while (redoStack.length > 1 && memory() > HISTORY_BYTES) redoStack.shift();
  }
  function mutate(fn, label) {
    finishPointer(); const before = snapshot(); fn(); addHistory({ kind: 'state', before, after: snapshot(), label }); sync(); requestRender();
  }
  function beginTransaction(key) { if (!transactions.has(key)) { finishPointer(); transactions.set(key, snapshot()); } }
  function endTransaction(key, label) {
    if (!transactions.has(key)) return;
    const before = transactions.get(key); transactions.delete(key);
    addHistory({ kind: 'state', before, after: snapshot(), label }); sync(); requestRender();
  }
  function settleTransactions() { for (const key of Array.from(transactions.keys())) endTransaction(key, '参数调整'); }
  function applyEntry(entry, redo) {
    if (entry.kind === 'state') restoreSnapshot(redo ? entry.after : entry.before);
    else {
      const layer = art.layers.find(l => l.id === entry.layerId);
      if (layer) {
        if (entry.kind === 'tiles') for (const p of entry.patches) { const value = redo ? p.after : p.before; context(layer.canvas).putImageData(value.image, value.x, value.y); }
        else context(layer.canvas).putImageData(redo ? entry.after : entry.before, entry.x, entry.y);
      }
      restoreRecords(redo ? entry.recordsAfter : entry.recordsBefore);
    }
    changed(); sync(); render();
  }
  function undo() {
    if (busy) return; finishPointer(); settleTransactions(); if (!undoStack.length) return;
    const entry = undoStack.pop(); redoStack.push(entry); applyEntry(entry, false); status('已撤销 · ' + entry.label);
  }
  function redo() {
    if (busy) return; finishPointer(); if (!redoStack.length) return;
    const entry = redoStack.pop(); undoStack.push(entry); applyEntry(entry, true); status('已重做 · ' + entry.label);
  }
  function syncHistory() { $('undo').disabled = !undoStack.length; $('redo').disabled = !redoStack.length; }
  function toneFilter(tone = art.tone) { return 'hue-rotate(' + tone.hue + 'deg) saturate(' + (100 + tone.saturation) + '%) brightness(' + (100 + tone.lightness) + '%)'; }
  function drawToned(ctx, source, tone, ...destination) {
    if (!adjustedTone(tone)) { ctx.drawImage(source, ...destination); return; }
    if (typeof ctx.filter === 'string') {
      ctx.save(); ctx.filter = toneFilter(tone); ctx.drawImage(source, ...destination); ctx.restore(); return;
    }
    // Only older Canvas implementations need this scratch. Reuse one canvas,
    // bounded by the document's 12MP limit, with at most 128 rows of RGBA at a
    // time (2MiB at the maximum width). Original pixels and records stay intact.
    if (!toneScratch) toneScratch = canvas();
    resize(toneScratch, source.width, source.height);
    const from = context(source), to = context(toneScratch);
    for (let y = 0; y < source.height; y += 128) {
      const data = from.getImageData(0, y, source.width, Math.min(128, source.height - y));
      Core.adjustFilter(data, tone); to.putImageData(data, 0, y);
    }
    ctx.drawImage(toneScratch, ...destination);
  }
  function applyStrokePatch(ctx, pointer, b) {
    ctx.save(); ctx.globalAlpha = pointer.opacity;
    if (pointer.sampledLayer) {
      // Interpolate between the original and edited RGBA, including transparent
      // pixels at a smudged edge. Both contributions are premultiplied.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000'; ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.globalCompositeOperation = 'lighter';
    } else ctx.globalCompositeOperation = pointer.erase ? 'destination-out' : pointer.atop ? 'source-atop' : 'source-over';
    ctx.drawImage(strokeCanvas, b.x, b.y, b.width, b.height, b.x, b.y, b.width, b.height);
    ctx.restore();
  }
  function compositeLayers(includeStroke = true) {
    const ctx = context(composite); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, art.width, art.height);
    for (const layer of art.layers) {
      if (!layer.visible || layer.opacity <= 0) continue;
      let source = layer.canvas;
      if (includeStroke && activePointer && activePointer.kind === 'stroke-erase' && activePointer.layerId === layer.id && activePointer.preview) {
        clear(liveCanvas); context(liveCanvas).drawImage(layer.canvas, 0, 0);
        Strokes.render(activePointer.preview.state, liveCanvas, activePointer.preview.keys); source = liveCanvas;
      } else if (includeStroke && activePointer && ['stroke', 'shape', 'text'].includes(activePointer.kind) && activePointer.layerId === layer.id) {
        if (activePointer.stroke) activePointer.stroke.flush();
        clear(liveCanvas); const live = context(liveCanvas); live.drawImage(layer.canvas, 0, 0);
        const patch = activePointer.sampledLayer ? activePointer.stroke.bounds : { x: 0, y: 0, width: art.width, height: art.height };
        if (patch) applyStrokePatch(live, activePointer, patch);
        source = liveCanvas;
      }
      ctx.save(); ctx.globalAlpha = layer.opacity; ctx.translate(layer.x, layer.y); ctx.scale(layer.scale, layer.scale); ctx.imageSmoothingEnabled = false; drawToned(ctx, source, layer.tone, 0, 0); ctx.restore();
    }
    return composite;
  }
  function renderArtwork(target, transparent = false, includeStroke = true) {
    resize(target, art.width, art.height); clear(target);
    const ctx = context(target), source = compositeLayers(includeStroke);
    if (!transparent) window.DrawingPaper.fill(ctx, art.width, art.height, art);
    ctx.save();
    const adjusted = art.tone.hue || art.tone.saturation || art.tone.lightness;
    if (adjusted && typeof ctx.filter === 'string') { ctx.filter = toneFilter(); ctx.drawImage(source, 0, 0); }
    else if (adjusted) { const data = context(source).getImageData(0, 0, art.width, art.height); Core.adjustFilter(data, art.tone); context(source).putImageData(data, 0, 0); ctx.drawImage(source, 0, 0); }
    else ctx.drawImage(source, 0, 0);
    ctx.restore(); return target;
  }
  function render() { if (!art) return; renderArtwork(display); previewLasso(); updateView(); }
  function requestRender() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; render(); }); }
  function updateView() {
    surface.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.zoom + ')';
    surface.classList.toggle('pixel-view', brush === 'pixel' || view.zoom >= 3);
    $('zoomLabel').textContent = Math.round(view.zoom * 100) + '%';
  }
  function fit() {
    if (!art) return;
    const r = viewport.getBoundingClientRect(), w = r.width || 640, h = r.height || 480;
    view.zoom = clamp(Math.min((w - 56) / art.width, (h - 56) / art.height), 0.03, 8);
    view.x = (w - art.width * view.zoom) / 2; view.y = (h - art.height * view.zoom) / 2; updateView();
  }
  function zoomTo(next, anchorX, anchorY) {
    const r = viewport.getBoundingClientRect(); next = clamp(next, 0.03, 24);
    const x = anchorX == null ? r.width / 2 : anchorX, y = anchorY == null ? r.height / 2 : anchorY;
    view.x = x - (x - view.x) * next / view.zoom; view.y = y - (y - view.y) * next / view.zoom; view.zoom = next; updateView();
  }
  function documentPoint(e) {
    const r = viewport.getBoundingClientRect(); return { x: (e.clientX - r.left - view.x) / view.zoom, y: (e.clientY - r.top - view.y) / view.zoom };
  }
  function strokePoint(e, layer) {
    const p = documentPoint(e); return { x: (p.x - layer.x) / layer.scale, y: (p.y - layer.y) / layer.scale, pressure: number(e.pressure, 0.5), pointerType: e.pointerType || 'mouse', time: e.timeStamp, tiltX: number(e.tiltX, 0), tiltY: number(e.tiltY, 0), twist: number(e.twist, 0) };
  }
  function mouseBrushPans(e) {
    // Only mouse input with the actual brush selected is re-routed. Keep Alt-picking
    // and the auxiliary-button eraser, and never change other editing tools.
    return penOnlyBrush && tool === 'brush' && (e.pointerType || 'mouse') === 'mouse'
      && !e.altKey && e.button !== 5 && !(e.buttons & 32);
  }
  function updatePressure(e) {
    lastPointerType = e.pointerType || 'mouse'; lastPressure = clamp(number(e.pressure, 0), 0, 1);
    $('pressureStatus').textContent = lastPointerType === 'pen' ? '数位笔 · 压力 ' + Math.round(lastPressure * 100) + '%' : lastPointerType === 'touch' ? '触摸 · ' + (touchDraw ? '绘画' : '平移') : penOnlyBrush && tool === 'brush' ? '鼠标 · 画笔改为平移' : '鼠标 · 固定笔宽';
  }
  function canDraw() {
    const layer = activeLayer(); if (layer.locked) { notify('当前图层已锁定，请先解锁或换一层。'); return false; }
    if (!layer.visible) { notify('当前图层已隐藏，请先显示或换一层。'); return false; } return true;
  }
  function cursor(e) {
    updatePressure(e);
    const r = viewport.getBoundingClientRect(), c = $('brushCursor'), mode = spacePan ? 'hand' : e.altKey ? 'picker' : mouseBrushPans(e) ? 'hand' : tool;
    viewport.dataset.cursor = mode;
    c.hidden = !['brush', 'eraser'].includes(mode) || e.pointerType === 'touch';
    c.style.left = (e.clientX - r.left) + 'px'; c.style.top = (e.clientY - r.top) + 'px';
    const d = Math.max(3, size * view.zoom); c.style.width = d + 'px'; c.style.height = d + 'px'; c.classList.toggle('square', (brush === 'pixel' || brush === 'plainSquare') && mode === 'brush');
  }
  function pickFrom(c, x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= c.width || y >= c.height) return;
    const p = context(c).getImageData(x, y, 1, 1).data;
    if (p[3] === 0) { status('这里是透明像素'); return; }
    setInk('#' + Array.from(p.slice(0, 3), v => v.toString(16).padStart(2, '0')).join(''), true); status('已取色 ' + ink.toUpperCase());
  }
  function markOptions(kind, layer, s = readMarkSettings()) {
    const fill = materialStyle(s, layer.scale);
    if (kind === 'shape') return { type: s.shapeKind, constrain: s.shapeConstrain, fill: s.shapeFill ? fill : null, stroke: s.shapeStroke ? s.shapeStrokeColor : null, strokeWidth: s.shapeStrokeWidth / layer.scale, frameColor: s.frameColor, frameAccent: s.frameAccent, frameWidth: s.frameWidth / layer.scale, opacity: 1 };
    return { text: s.textContent, size: s.textSize / layer.scale, fontFamily: MARK_FONTS[s.textFont], bold: s.textBold, italic: s.textItalic, align: s.textAlign, lineHeight: s.textLineHeight, fill: s.textUseMaterial ? fill : ink, stroke: null, opacity: 1, boxStyle: s.textBoxStyle, boxColor: s.textBoxColor, boxAccent: s.textBoxAccent };
  }
  function renderMarkSample(s) {
    const sample = $(tool === 'shape' ? 'shapePreview' : 'textBoxPreview');
    clear(sample);
    const opts = markOptions(tool, { scale: 1 }, s);
    if (tool === 'shape') {
      const isFrame = Marks.frameKinds.includes(opts.type), w = isFrame ? 136 : 66, h = 42;
      Marks.paintShape(context(sample), { ...opts, frameWidth: Math.min(opts.frameWidth, 7), strokeWidth: Math.min(opts.strokeWidth, 6),
        x: (sample.width-w)/2, y: 9, width: w, height: h, constrain: false });
    } else {
      const text = (opts.text.split('\n').find(line => line.trim()) || '文字预览').slice(0, 10);
      Marks.paintText(context(sample), { ...opts, x: sample.width / 2, y: 20, text, size: 16, align: 'center' });
    }
  }
  function frameCanvas() {
    const options = markOptions('shape', { scale: 1 });
    if (!Marks.frameKinds.includes(options.type)) return;
    layerBudget(art.layers.length + 1);
    mutate(() => {
      const layer = createLayer('画框 · ' + $('shapeKind').selectedOptions[0].textContent);
      Marks.paintShape(context(layer.canvas), { ...options, x: 0, y: 0, width: art.width, height: art.height, constrain: false });
      layer.opacity = opacity; art.layers.push(layer); art.activeId = layer.id;
    }, '添加整张画框');
    status('画框已加入独立图层');
  }
  function previewMark(pointer, point, shift) {
    clear(strokeCanvas); pointer.last = point;
    if (pointer.kind === 'shape') {
      pointer.bounds = Marks.paintShape(context(strokeCanvas), { ...pointer.options, x: pointer.origin.x, y: pointer.origin.y, width: point.x - pointer.origin.x, height: point.y - pointer.origin.y, constrain: pointer.options.constrain || !!shift });
    } else pointer.bounds = Marks.paintText(context(strokeCanvas), { ...pointer.options, x: point.x, y: point.y });
    requestRender();
  }
  function clippedBounds(bounds) {
    if (!bounds || ![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite)) return null;
    const x = clamp(Math.floor(bounds.x), 0, art.width), y = clamp(Math.floor(bounds.y), 0, art.height);
    const right = clamp(Math.ceil(bounds.x + bounds.width), 0, art.width), bottom = clamp(Math.ceil(bounds.y + bounds.height), 0, art.height);
    return right > x && bottom > y ? { x, y, width: right - x, height: bottom - y } : null;
  }
  function addLassoPoint(pointer, point, force = false) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
    const last = pointer.points[pointer.points.length - 1], distance = last ? Math.hypot(point.x - last.x, point.y - last.y) : Infinity;
    if (distance === 0 || (!force && distance < pointer.spacing)) return;
    pointer.points.push({ x: point.x, y: point.y });
    // Bound a long pen gesture without losing its start or current endpoint.
    // Coalesced input is sampled in screen pixels, then thinned only at the cap.
    if (pointer.points.length > 2048) {
      const points = [pointer.points[0]];
      for (let i = 2; i < pointer.points.length - 1; i += 2) points.push(pointer.points[i]);
      points.push(pointer.points[pointer.points.length - 1]); pointer.points = points; pointer.spacing *= 2;
    }
  }
  function traceLasso(ctx, points) {
    ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    if (points.length > 2) ctx.closePath();
  }
  function lassoBounds(points) {
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const p of points) { left = Math.min(left, p.x); top = Math.min(top, p.y); right = Math.max(right, p.x); bottom = Math.max(bottom, p.y); }
    return clippedBounds({ x: left, y: top, width: right - left, height: bottom - top });
  }
  function previewLasso() {
    const pointer = activePointer;
    if (!pointer || pointer.kind !== 'lasso' || pointer.points.length < 2) return;
    const layer = art.layers.find(l => l.id === pointer.layerId);
    if (!layer) return;
    // This guide lives only on the display, never in a layer or an export.
    const ctx = context(display), unit = view.zoom * layer.scale;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, layer.x, layer.y); ctx.scale(layer.scale, layer.scale);
    traceLasso(ctx, pointer.points); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const bounds = pointer.points.length > 2 ? lassoBounds(pointer.points) : null;
    if (bounds) {
      ctx.globalAlpha = pointer.opacity * layer.opacity * .3;
      ctx.fillStyle = Marks.fillStyle(ctx, pointer.fill, bounds); ctx.fill('evenodd'); ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3 / unit; ctx.stroke();
    ctx.strokeStyle = '#243f4c'; ctx.lineWidth = 1.25 / unit; ctx.setLineDash([5 / unit, 4 / unit]); ctx.stroke(); ctx.restore();
  }
  function commitLasso(pointer, layer) {
    if (pointer.points.length < 3 || !layer.visible || layer.locked || pointer.opacity <= 0) return false;
    const bounds = lassoBounds(pointer.points); if (!bounds) return false;
    const paint = context(strokeCanvas); clear(strokeCanvas);
    // Bake fill strength into coverage once, then composite the mask at alpha 1.
    paint.save(); paint.globalAlpha = pointer.opacity; paint.globalCompositeOperation = 'source-over';
    traceLasso(paint, pointer.points); paint.clip('evenodd');
    paint.fillStyle = Marks.fillStyle(paint, pointer.fill, bounds);
    paint.fillRect(bounds.x, bounds.y, bounds.width, bounds.height); paint.restore();
    const changed = commitPreview({ ...pointer, opacity: 1 }, layer, bounds, pointer.erase ? '套索透明填充' : '套索填充');
    if (changed && !pointer.erase) remember(pointer.fill.foreground);
    return changed;
  }
  function commitPreview(pointer, layer, rawBounds, label) {
    const b = clippedBounds(rawBounds); if (!b) return false;
    const ctx = context(layer.canvas), before = ctx.getImageData(b.x, b.y, b.width, b.height), recordsBefore = recordSnapshot();
    const preserve = !pointer.sampledLayer && !pointer.resetRecords;
    const nextRecords = preserve ? Strokes.append(layer.strokeRecords, layer.canvas, strokeCanvas, b,
      { id: uid(), kind: pointer.erase ? 'erase' : pointer.kind === 'stroke' ? 'stroke' : 'overlay', opacity: pointer.opacity }) : null;
    applyStrokePatch(ctx, pointer, b);
    const after = ctx.getImageData(b.x, b.y, b.width, b.height);
    // Two opaque, identical strokes still are two pen-down actions. Keeping
    // their provenance lets whole erasure remove the upper one independently.
    const newIdentity = preserve && !pointer.erase && nextRecords !== layer.strokeRecords && (nextRecords || layer.strokeRecords);
    if (!newIdentity && !after.data.some((v, i) => v !== before.data[i])) return false;
    layer.strokeRecords = nextRecords; Strokes.limit(art.layers);
    activePointer = null; addHistory({ kind: 'pixels', layerId: layer.id, x: b.x, y: b.y, before, after, recordsBefore, recordsAfter: recordSnapshot(), label }); remember(ink); return true;
  }
  function eraseWholeAt(pointer, point) {
    const previous = pointer.last || point, distance = Math.hypot(point.x - previous.x, point.y - previous.y);
    const steps = Math.max(1, Math.ceil(distance / Math.max(1, Math.min(8, pointer.radius * .75))));
    let changed = false;
    for (let i = 1; i <= steps; i++) {
      const x = previous.x + (point.x - previous.x) * i / steps, y = previous.y + (point.y - previous.y) * i / steps;
      // Always hit-test the gesture's initial stack. Repeated events over a
      // crossing cannot peel off another stroke revealed by this same gesture.
      const id = Strokes.hit(pointer.initial, x, y, pointer.radius);
      if (id && !pointer.removed.has(id)) { pointer.removed.add(id); changed = true; }
    }
    pointer.last = point;
    if (changed) { pointer.preview = Strokes.remove(pointer.initial, pointer.removed); requestRender(); }
  }
  function finishWholeErase(pointer, layer) {
    if (!pointer.preview || !pointer.removed.size || !layer.visible || layer.locked) return;
    const recordsBefore = recordSnapshot(), before = Strokes.capture(pointer.initial, layer.canvas, pointer.preview.keys);
    Strokes.render(pointer.preview.state, layer.canvas, pointer.preview.keys);
    const after = Strokes.capture(pointer.initial, layer.canvas, pointer.preview.keys);
    layer.strokeRecords = Strokes.clean(pointer.preview.state);
    activePointer = null;
    addHistory({ kind: 'tiles', layerId: layer.id, patches: before.map((p, i) => ({ before: p, after: after[i] })), recordsBefore, recordsAfter: recordSnapshot(), label: '整笔擦除' });
    status('已整笔擦除 ' + pointer.removed.size + ' 笔 · 可撤销');
  }
  function pointerDown(e) {
    if (busy || activePointer || document.querySelector('dialog[open]') || (e.button !== 0 && e.button !== 1 && e.button !== 5)) return;
    e.preventDefault(); viewport.focus({ preventScroll: true }); updatePressure(e);
    const point = documentPoint(e), inside = point.x >= 0 && point.y >= 0 && point.x < art.width && point.y < art.height;
    const mode = e.button === 1 || spacePan || (e.pointerType === 'touch' && !touchDraw) || mouseBrushPans(e) ? 'hand' : e.altKey ? 'picker' : (e.button === 5 || (e.buttons & 32)) ? 'eraser' : tool;
    if (mode === 'hand') {
      if (e.pointerType === 'touch' && !touchDraw && tool !== 'hand') status('手指平移 · 在面板顶部开启“手指绘画”可落笔');
      else if (mouseBrushPans(e)) status('鼠标平移 · 画笔仅限数位笔；橡皮和其他工具仍可用鼠标');
      activePointer = { id: e.pointerId, kind: 'pan', clientX: e.clientX, clientY: e.clientY, x: view.x, y: view.y };
    }
    else if (!inside) return;
    else if (mode === 'picker') { render(); pickFrom(display, point.x, point.y); return; }
    else {
      if (!canDraw()) return;
      const layer = activeLayer();
      if (mode === 'fill' && $('fillScope').value === 'lasso') {
        clear(strokeCanvas);
        activePointer = { id: e.pointerId, kind: 'lasso', layerId: layer.id, points: [], spacing: Math.max(.25, 2 / (view.zoom * layer.scale)),
          fill: materialStyle(readMarkSettings(), layer.scale), opacity, erase: $('fillPaintMode').value === 'transparent', resetRecords: true };
        addLassoPoint(activePointer, strokePoint(e, layer), true); viewport.classList.add('drawing'); requestRender();
      }
      else if (mode === 'fill' || mode === 'cutout') { fillAt(point, mode === 'cutout'); return; }
      else if (mode === 'move') activePointer = { id: e.pointerId, kind: 'move', origin: point, x: layer.x, y: layer.y, layerId: layer.id, before: snapshot() };
      else if (mode === 'eraser' && eraserMode === 'stroke') {
        if (!Strokes.count(layer.strokeRecords)) { notify('当前层没有可追溯笔画，请改用“局部”橡皮。'); return; }
        const p = strokePoint(e, layer);
        activePointer = { id: e.pointerId, kind: 'stroke-erase', layerId: layer.id, initial: layer.strokeRecords, removed: new Set(), preview: null, radius: size / (2 * layer.scale), last: p };
        eraseWholeAt(activePointer, p); viewport.classList.add('drawing');
      }
      else if (mode === 'shape' || mode === 'text') {
        const options = markOptions(mode, layer);
        if (mode === 'text' && !options.text.trim()) { notify('请先在右侧输入文字。'); return; }
        if (mode === 'shape' && !Marks.frameKinds.includes(options.type) && !options.fill && !options.stroke) { notify('请至少启用填充或描边。'); return; }
        const p = strokePoint(e, layer); activePointer = { id: e.pointerId, kind: mode, layerId: layer.id, origin: p, last: p, options, opacity, bounds: null };
        previewMark(activePointer, p, e.shiftKey);
      }
      else {
        clear(strokeCanvas);
        const sampledLayer = mode === 'brush' && Core.brushPresets.some(p => p.id === brush && p.samplesLayer);
        const paint = context(strokeCanvas);
        if (sampledLayer) paint.drawImage(layer.canvas, 0, 0);
        const stroke = Core.makeStroke(paint, { brush: mode === 'eraser' ? 'eraser' : brush, size: size / layer.scale, color: ink, pressure: pressureEnabled, stabilizer, textureScale, textureDensity });
        const p = strokePoint(e, layer); stroke.start(p);
        activePointer = { id: e.pointerId, kind: 'stroke', layerId: layer.id, stroke, opacity, sampledLayer, erase: mode === 'eraser', last: p };
        viewport.classList.add('drawing'); requestRender();
      }
    }
    try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
  }
  function pointerMove(e) {
    cursor(e); if (!activePointer || e.pointerId !== activePointer.id) return;
    e.preventDefault();
    if (activePointer.kind === 'pan') { view.x = activePointer.x + e.clientX - activePointer.clientX; view.y = activePointer.y + e.clientY - activePointer.clientY; updateView(); return; }
    const layer = art.layers.find(l => l.id === activePointer.layerId); if (!layer) return;
    if (activePointer.kind === 'move') { const p = documentPoint(e); layer.x = activePointer.x + p.x - activePointer.origin.x; layer.y = activePointer.y + p.y - activePointer.origin.y; requestRender(); return; }
    if (activePointer.kind === 'shape' || activePointer.kind === 'text') { previewMark(activePointer, strokePoint(e, layer), e.shiftKey); return; }
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    for (const item of events && events.length ? events : [e]) {
      const p = strokePoint(item, layer);
      if (activePointer.kind === 'lasso') addLassoPoint(activePointer, p);
      else if (activePointer.kind === 'stroke-erase') eraseWholeAt(activePointer, p);
      else { activePointer.stroke.move(p); activePointer.last = p; }
    }
    requestRender();
  }
  function finishPointer(e) {
    if (!activePointer || (e && e.pointerId != null && e.pointerId !== activePointer.id)) return;
    const pointer = activePointer, layer = art.layers.find(l => l.id === pointer.layerId);
    if (pointer.kind === 'lasso' && layer) {
      try {
        if (e && e.type === 'pointerup') {
          addLassoPoint(pointer, strokePoint(e, layer), true);
          status(commitLasso(pointer, layer) ? (pointer.erase ? '套索已擦淡或镂空 ' : '套索已填充到 ') + layer.name + ' · 可撤销' : '套索范围没有需要改变的像素');
        } else status('已取消套索');
      } catch (error) { notify(error); }
    } else if (pointer.kind === 'stroke-erase' && layer) {
      if (e && e.type === 'pointerup') eraseWholeAt(pointer, strokePoint(e, layer));
      finishWholeErase(pointer, layer);
    } else if (pointer.kind === 'stroke' && layer) {
      const end = e && Number.isFinite(e.clientX) && e.type === 'pointerup' ? strokePoint(e, layer) : pointer.last;
      pointer.stroke.end(end);
      commitPreview(pointer, layer, pointer.stroke.bounds, pointer.erase ? '擦除' : '笔画');
    } else if ((pointer.kind === 'shape' || pointer.kind === 'text') && layer) {
      if (e && e.type === 'pointerup') {
        previewMark(pointer, strokePoint(e, layer), e.shiftKey);
        if (commitPreview(pointer, layer, pointer.bounds, pointer.kind === 'shape' ? '插入形状' : '插入文字')) status((pointer.kind === 'shape' ? '形状' : '文字') + '已落在 ' + layer.name + ' · 可撤销');
      } else status('已取消放置');
    } else if (pointer.kind === 'move' && layer && (layer.x !== pointer.x || layer.y !== pointer.y)) {
      activePointer = null; addHistory({ kind: 'state', before: pointer.before, after: snapshot(), label: '移动图层' });
    }
    activePointer = null; viewport.classList.remove('drawing'); clear(strokeCanvas);
    if (refreshBrushAfterStroke) { refreshBrushAfterStroke = false; refreshActiveBrushProfile(); }
    try { if (viewport.hasPointerCapture(pointer.id)) viewport.releasePointerCapture(pointer.id); } catch (_) {}
    render();
  }
  function fillAt(point, erase) {
    const layer = activeLayer(), x = Math.floor((point.x - layer.x) / layer.scale), y = Math.floor((point.y - layer.y) / layer.scale);
    if (x < 0 || y < 0 || x >= art.width || y >= art.height) return;
    const fill = materialStyle(readMarkSettings(), layer.scale), scope = $('fillScope').value;
    const remove = !erase && $('fillPaintMode').value === 'transparent';
    if (opacity <= 0) { status('当前强度为 0，像素保持不变'); return; }
    if (!erase && scope === 'lasso') return;
    if (!erase && scope !== 'match') {
      let bounds = { x: 0, y: 0, width: art.width, height: art.height };
      if (scope === 'inked') {
        const ctx = context(layer.canvas);
        let left = art.width, top = art.height, right = -1, bottom = -1;
        for (let y0 = 0; y0 < art.height; y0 += 128) {
          const rows = Math.min(128, art.height - y0);
          const rgba = ctx.getImageData(0, y0, art.width, rows).data;
          for (let row = 0, alpha = 3; row < rows; row++) {
            for (let col = 0; col < art.width; col++, alpha += 4) {
              if (!rgba[alpha]) continue;
              left = Math.min(left, col); right = Math.max(right, col);
              top = Math.min(top, y0 + row); bottom = y0 + row;
            }
          }
        }
        if (right < 0) { status('当前层还没有可改色的笔迹'); return; }
        bounds = { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
      }
      // Paint a coverage mask once. Destination-out already multiplies by the
      // existing alpha, so a second mask from the layer would square it.
      clear(strokeCanvas); const paint = context(strokeCanvas);
      paint.save(); paint.globalAlpha = opacity; paint.globalCompositeOperation = 'source-over';
      paint.fillStyle = Marks.fillStyle(paint, fill, bounds);
      paint.fillRect(bounds.x, bounds.y, bounds.width, bounds.height); paint.restore();
      const label = remove ? '透明填充' : scope === 'inked' ? '为已有笔迹填色' : '填充整个图层';
      const painted = commitPreview({ opacity: 1, erase: remove, atop: !remove && scope === 'inked', resetRecords: true }, layer, bounds, label);
      clear(strokeCanvas); render();
      if (painted && !remove) remember(fill.foreground);
      status(painted ? label + ' · ' + layer.name : '这里没有需要改变的像素'); return;
    }
    const ctx = context(layer.canvas), target = ctx.getImageData(0, 0, art.width, art.height);
    let sample = target;
    if (!erase && $('fillSample').value === 'visible') {
      const source = compositeLayers(false); resize(sampleCanvas, art.width, art.height); clear(sampleCanvas);
      const sx = context(sampleCanvas); sx.save(); sx.imageSmoothingEnabled = false; sx.scale(1 / layer.scale, 1 / layer.scale); sx.translate(-layer.x, -layer.y); sx.drawImage(source, 0, 0); sx.restore(); sample = sx.getImageData(0, 0, art.width, art.height);
    }
    const fillOptions = { tolerance: +$('tolerance').value, contiguous: $('contiguous').checked, expand: +$('fillExpand').value, erase,
      closeGap: !erase && scope === 'match' && $('contiguous').checked ? clamp(Math.round(number($('closeGap').value, 0)), 0, 32) : 0 };
    if (!erase && (remove || fill.kind !== 'solid')) {
      const mask = ctx.createImageData(art.width, art.height), selection = Core.floodFill(mask, sample, x, y, [255, 255, 255, Math.round(opacity * 255)], fillOptions);
      if (!selection.bounds) { status(selection.reason === 'gapBlocked' ? '闭合间隙挡住了起点，请减小数值或换个点。' : '这里没有可填充的区域'); return; }
      const b = selection.bounds, temp = context(strokeCanvas); clear(strokeCanvas); temp.putImageData(mask, 0, 0);
      temp.save(); temp.globalAlpha = 1; temp.globalCompositeOperation = 'source-in'; temp.fillStyle = Marks.fillStyle(temp, fill, b); temp.fillRect(b.x, b.y, b.width, b.height); temp.restore();
      const painted = commitPreview({ opacity: 1, erase: remove, resetRecords: true }, layer, b, remove ? '透明填充' : '材质填充'); clear(strokeCanvas); render();
      status(painted ? (remove ? '已擦淡或镂空 ' : '材质已填充到 ') + layer.name : '这里没有需要改变的像素'); if (painted && !remove) remember(fill.foreground); return;
    }
    const beforeFull = new Uint8ClampedArray(target.data);
    const fillColor = erase ? ink : fill.foreground;
    const rgba = [parseInt(fillColor.slice(1, 3), 16), parseInt(fillColor.slice(3, 5), 16), parseInt(fillColor.slice(5, 7), 16), Math.round(opacity * 255)];
    const result = Core.floodFill(target, sample, x, y, rgba, fillOptions);
    if (!result.changed || !result.bounds) { status(result.reason === 'gapBlocked' ? '闭合间隙挡住了起点，请减小数值或换个点。' : '这里没有需要改变的像素'); return; }
    const b = result.bounds, before = ctx.createImageData(b.width, b.height), after = ctx.createImageData(b.width, b.height);
    for (let row = 0; row < b.height; row++) {
      const start = ((b.y + row) * art.width + b.x) * 4, end = start + b.width * 4;
      before.data.set(beforeFull.subarray(start, end), row * b.width * 4); after.data.set(target.data.subarray(start, end), row * b.width * 4);
    }
    const recordsBefore = recordSnapshot(); layer.strokeRecords = null;
    ctx.putImageData(after, b.x, b.y); addHistory({ kind: 'pixels', layerId: layer.id, x: b.x, y: b.y, before, after, recordsBefore, recordsAfter: recordSnapshot(), label: erase ? '抠除背景' : '油漆桶填充' }); render();
    status(erase ? '已抠除相近背景 · 可用橡皮修边，或撤销' : '已填充到 ' + layer.name); if (!erase) remember(fillColor);
  }

  function syncLayers() {
    if (!art) return;
    const list = $('layerList'); list.replaceChildren(); $('layerCount').textContent = art.layers.length;
    art.layers.slice().reverse().forEach(layer => {
      const row = document.createElement('div'); row.className = 'layer-row' + (layer.id === art.activeId ? ' active' : '') + (!layer.visible ? ' hidden-layer' : ''); row.setAttribute('role', 'listitem');
      const visible = document.createElement('button'); visible.className = 'layer-visibility'; visible.title = layer.visible ? '隐藏图层' : '显示图层'; visible.setAttribute('aria-label', visible.title + ' ' + layer.name); visible.setAttribute('aria-pressed', String(layer.visible));
      visible.innerHTML = '<svg class="studio-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href="' + (layer.visible ? '#si-eye' : '#si-eye-off') + '"/></svg>';
      visible.addEventListener('click', safe(() => toggleLayerVisibility(layer.id)));
      const select = document.createElement('button'); select.className = 'layer-select'; select.setAttribute('aria-label', '选中 ' + layer.name); select.setAttribute('aria-pressed', String(layer.id === art.activeId));
      const thumb = canvas(31, 31); thumb.className = 'layer-thumb'; thumb.setAttribute('aria-hidden', 'true');
      const scale = Math.min(31 / art.width, 31 / art.height); drawToned(context(thumb), layer.canvas, layer.tone, (31 - art.width * scale) / 2, (31 - art.height * scale) / 2, art.width * scale, art.height * scale);
      const label = document.createElement('div'), name = document.createElement('span'), info = document.createElement('small'); name.textContent = layer.name; info.textContent = Math.round(layer.opacity * 100) + '% · ' + Math.round(layer.scale * 100) + '%'; label.append(name, info); select.append(thumb, label); select.addEventListener('click', () => selectLayer(layer.id));
      const lock = document.createElement('button'); lock.className = 'layer-lock'; lock.textContent = layer.locked ? '锁' : '·'; lock.title = layer.locked ? '解锁图层' : '锁定图层'; lock.setAttribute('aria-label', lock.title + ' ' + layer.name); lock.setAttribute('aria-pressed', String(layer.locked)); lock.addEventListener('click', () => { if (!busy) mutate(() => { layer.locked = !layer.locked; }, '切换图层锁定'); });
      row.append(visible, select, lock); list.append(row);
    });
    const layer = activeLayer(), index = art.layers.indexOf(layer);
    $('layerName').value = layer.name; $('layerOpacity').value = Math.round(layer.opacity * 100); $('layerOpacityValue').textContent = Math.round(layer.opacity * 100) + '%';
    $('layerScale').value = Math.round(layer.scale * 100); $('layerScaleValue').textContent = Math.round(layer.scale * 100) + '%';
    $('layerUp').disabled = index === art.layers.length - 1; $('layerDown').disabled = index === 0;
    const reason = mergeLayerReason(layer), merge = $('mergeLayerDown');
    const hint = reason || '仅保留画布内像素；合并前笔迹改用局部橡皮，可撤销。';
    merge.disabled = !!busy || !!reason; merge.title = '向下合并 · ' + hint; merge.parentElement.title = merge.title;
    $('layerActionHint').textContent = hint;
    syncEraser(); syncTone();
  }
  function sync() {
    syncHistory(); syncLayers();
    if (ref) syncReferenceNavigation();
    $('paper').value = art.paper; $('paperColor').value = art.paperColor; $('paperTexture').value = art.paperTexture;
    for (const id of ['paperOpacity', 'textureStrength']) { $(id).value = art[id]; $(id + 'Value').value = art[id] + '%'; }
    window.DrawingPaper.syncCurrent();
    document.title = (art.title === '未命名画作' ? '轻绘' : art.title + ' · 轻绘') + ' · 本地画室';
  }
  function toneOwner() { return toneScope === 'current' ? activeLayer() : art; }
  function syncTone() {
    const tone = normalizeTone(toneOwner().tone); $('toneScope').value = toneScope;
    for (const key of ['hue', 'saturation', 'lightness']) { $(key).value = tone[key]; $(key + 'Value').textContent = tone[key] + (key === 'hue' ? '°' : ''); }
    $('toneHint').textContent = toneScope === 'current'
      ? '当前：' + activeLayer().name + '。先调本层，再应用整体调色。'
      : '调整全部可见图层的合成结果，纸张保持原色。';
    $('resetTone').title = toneScope === 'current' ? '只重置选中图层的调色' : '只重置所有图层的整体调色';
    if (toneScratch && !art.layers.some(layer => adjustedTone(layer.tone))) resize(toneScratch, 1, 1);
  }
  function setToneScope(value) {
    if (busy) return;
    const next = value === 'current' ? 'current' : 'all';
    finishPointer(); settleTransactions(); toneScope = next; syncTone();
  }
  function selectLayer(id) {
    if (busy || !art.layers.some(layer => layer.id === id)) return;
    finishPointer(); settleTransactions(); art.activeId = id; syncLayers(); status('当前图层 · ' + activeLayer().name);
  }
  function addLayer() {
    finishPointer(); settleTransactions();
    layerBudget(art.layers.length + 1); let added;
    mutate(() => { added = createLayer(); const index = art.layers.indexOf(activeLayer()); art.layers.splice(index + 1, 0, added); art.activeId = added.id; }, '新建图层'); return added.id;
  }
  function duplicateLayer() {
    if (busy) return false;
    finishPointer(); settleTransactions(); layerBudget(art.layers.length + 1);
    const source = activeLayer();
    // Portable projects decode each layer separately. Check that budget before
    // copying, so adding a copy never retires the original layer's stroke records.
    const recordBytes = art.layers.reduce((sum, layer) => sum + Strokes.bytes([layer.strokeRecords]), 0);
    if (recordBytes + Strokes.bytes([source.strokeRecords]) > Strokes.MAX_BYTES) {
      throw new Error('整笔记录已达轻量限额，暂不能完整复制。请先合并或减少图层后重试。');
    }
    const copy = { ...source, id: uid(), name: (source.name + ' 副本').slice(0, 40), canvas: canvas(art.width, art.height), tone: normalizeTone(source.tone), locked: false };
    context(copy.canvas).drawImage(source.canvas, 0, 0);
    // The sparse records are immutable; pixels are always copied independently.
    mutate(() => { art.layers.splice(art.layers.indexOf(source) + 1, 0, copy); art.activeId = copy.id; }, '复制图层');
    status('已复制 · ' + source.name); return copy.id;
  }
  function toggleLayerVisibility(id = art.activeId) {
    if (busy) return false;
    finishPointer(); settleTransactions();
    const layer = art.layers.find(item => item.id === id); if (!layer) return false;
    mutate(() => { layer.visible = !layer.visible; }, '切换图层显示');
    status((layer.visible ? '已显示 · ' : '已隐藏 · ') + layer.name); return true;
  }
  function mergeLayerReason(layer = activeLayer()) {
    const index = art.layers.indexOf(layer), lower = art.layers[index - 1];
    if (!lower) return '当前已是最下方图层';
    if (!layer.visible) return '当前图层已隐藏，请先显示';
    if (layer.locked) return '当前图层已锁定，请先解锁';
    if (!lower.visible) return '下方图层已隐藏，请先显示';
    if (lower.locked) return '下方图层已锁定，请先解锁';
    return '';
  }
  function mergeLayerDown() {
    if (busy) return false;
    finishPointer(); settleTransactions();
    const upper = activeLayer(), reason = mergeLayerReason(upper);
    if (reason) { notify('无法合并 · ' + reason); return false; }
    const index = art.layers.indexOf(upper), lower = art.layers[index - 1];
    const merged = { ...upper, canvas: canvas(art.width, art.height), x: 0, y: 0, scale: 1, opacity: 1, tone: normalizeTone(), strokeRecords: null };
    const ctx = context(merged.canvas);
    // Bake only these two layers in artwork coordinates. Keep their old canvases
    // intact for undo; paper, global tone and other layers are composed later.
    for (const layer of [lower, upper]) {
      ctx.save(); ctx.globalAlpha = layer.opacity; ctx.translate(layer.x, layer.y);
      ctx.scale(layer.scale, layer.scale); ctx.imageSmoothingEnabled = false;
      drawToned(ctx, layer.canvas, layer.tone, 0, 0); ctx.restore();
    }
    mutate(() => { art.layers.splice(index - 1, 2, merged); art.activeId = merged.id; }, '向下合并图层');
    notify('已向下合并 · 合并前笔迹请用局部橡皮，可撤销'); return merged.id;
  }
  function setTool(value, keepProfile = false) {
    if (busy && !keepProfile) return; finishPointer();
    if (!['brush', 'eraser', 'fill', 'cutout', 'picker', 'move', 'hand', 'shape', 'text'].includes(value)) value = 'brush';
    if (value !== tool) fillPalettePending = false;
    if (value !== tool && !keepProfile && (value === 'brush' || value === 'eraser')) {
      applyBrushProfile(brushProfile(value === 'eraser' ? eraserPreset : Core.brushPresets.find(p => p.id === brush)));
    }
    tool = value;
    all('[data-tool]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tool === tool)));
    $('shapeSettings').hidden = tool !== 'shape'; $('textSettings').hidden = tool !== 'text'; $('materialSection').hidden = !['fill', 'shape', 'text'].includes(tool);
    $('fillSettings').hidden = tool !== 'fill' && tool !== 'cutout'; $('fillSampleLabel').hidden = tool === 'cutout';
    updateFillScope();
    $('strokeSettings').hidden = !['brush', 'eraser', 'fill', 'cutout'].includes(tool);
    $('brushControls').hidden = !['brush', 'eraser'].includes(tool);
    $('brushSample').hidden = tool !== 'brush'; $('brushHint').hidden = tool !== 'brush';
    $('strokeSettingsTitle').textContent = tool === 'fill' || tool === 'cutout' ? '选区边界' : '笔触';
    $('brushName').hidden = tool !== 'brush';
    syncBrushTextureUI();
    syncEraser();
    if (['shape', 'text', 'fill', 'cutout'].includes(tool)) {
      if (window.innerWidth > 650) togglePanel('settings', true);
      $('settingsPanel').querySelector('.settings-scroll').scrollTop = 0;
    }
    if (tool === 'fill') $('materialSection').open = true;
    if (tool === 'shape' || tool === 'text') updateMaterialUI();
    viewport.dataset.cursor = tool; $('brushCursor').hidden = true;
    status(({ brush: '画笔 · ' + $('brushKind').selectedOptions[0].textContent + (penOnlyBrush ? ' · 鼠标左键平移' : ''), eraser: eraserMode === 'stroke' ? '整笔橡皮 · 轻触或扫过当前层笔画' : '局部橡皮 · 擦除当前图层像素', fill: $('fillScope').value === 'lasso' ? '套索填充 · 拖动圈出区域，松手填色；Esc 取消' : '填充 · 点选区域上色，可选择材质', shape: '形状 · 拖动预览，松手放置；Shift 锁定比例', text: '文字 · 先输入内容，再点击或拖动放置', picker: '取色 · 点击画作，或从参考图取色', move: '移层 · 拖动当前图层', hand: '平移 · 拖动画布', cutout: '抠图 · 点击当前图层的背景' })[tool]);
  }
  function syncEraser() {
    const whole = tool === 'eraser' && eraserMode === 'stroke';
    $('eraserModeField').hidden = tool !== 'eraser'; $('eraserMode').value = eraserMode;
    $('eraserHint').hidden = tool !== 'eraser';
    $('brushControls').hidden = !['brush', 'eraser'].includes(tool) || whole;
    document.querySelector('.brush-opacity').hidden = whole;
    $('eraserHint').textContent = whole
      ? '整笔删除当前层的一次落笔，交叉处只选最上面一笔。本层可追溯 ' + Strokes.count(activeLayer().strokeRecords) + ' 笔。旧图、填色/抠图/混色或裁切前的笔迹请用局部橡皮。'
      : '沿经过的位置擦除像素，大小、浓度和压感均有效。';
  }
  function updateFillScope() {
    const cutout = tool === 'cutout', scope = $('fillScope').value;
    $('fillScopeLabel').hidden = cutout; $('matchControls').hidden = !cutout && scope !== 'match';
    $('fillPalette').hidden = cutout;
    const gapEnabled = tool === 'fill' && scope === 'match' && $('contiguous').checked;
    $('closeGapField').hidden = !gapEnabled; $('closeGap').disabled = !gapEnabled; $('closeGapNumber').disabled = !gapEnabled;
    $('fillHint').textContent = cutout ? '点击背景，抠除当前图层中的相近颜色。'
      : { match: '点击色块填充，可以在线稿下方另建上色层。', lasso: '拖动圈出区域，松手自动闭合填色；Esc 取消。支持当前材质与浓度。', inked: '点击画布，为当前层所有笔迹换色，保留透明边缘。', layer: '点击画布，把所选颜色或材质铺满当前图层。' }[scope];
    updateFillPaintUI();
  }
  function updateFillPaintUI() {
    const transparent = $('fillPaintMode').value === 'transparent';
    $('fillPaintControls').hidden = tool !== 'fill';
    $('fillPaintMode').disabled = tool !== 'fill'; $('fillOpacity').disabled = tool !== 'fill';
    $('fillOpacityLabel').textContent = transparent ? '擦除强度' : '不透明度';
    $('fillOpacity').setAttribute('aria-label', transparent ? '透明填充擦除强度' : '填充不透明度');
    $('fillPaintHint').textContent = transparent
      ? '只改当前图层：100% 挖空，降低强度擦淡；材质的透明部分保留。'
      : '在透明图层降低不透明度，可绘制透光色块。已有底色请用透明模式擦淡。';
    syncOpacityUI();
  }
  function syncCloseGap(source, commit = false) {
    if (!Number.isFinite(source.valueAsNumber) && !commit) return;
    const value = clamp(Math.round(Number.isFinite(source.valueAsNumber) ? source.valueAsNumber : +$('closeGap').value), 0, 32);
    $('closeGap').value = value; $('closeGapNumber').value = value;
    $('closeGap').setAttribute('aria-valuetext', value ? value + ' 像素' : '关闭');
  }
  function swatches(container, colors) {
    container.replaceChildren();
    colors.forEach(entry => {
      const sample = typeof entry === 'string' ? { hex: entry } : entry, color = sample.hex;
      const button = document.createElement('button'); button.type = 'button';
      if (sample.code) button.textContent = sample.code;
      button.style.setProperty('--swatch', color); button.title = [...new Set([sample.code, sample.name, sample.officialName, color.toUpperCase()].filter(Boolean))].join(' · ');
      button.setAttribute('aria-label', '取色 ' + button.title); button.setAttribute('aria-pressed', String(color.toLowerCase() === ink.toLowerCase())); button.dataset.color = color;
      button.addEventListener('click', () => setInk(color, true)); container.append(button);
    });
  }
  function setInk(value, rememberIt = false) {
    if (typeof value !== 'string') throw new Error('请输入有效的颜色文本。');
    if (/^#[a-f0-9]{3}$/i.test(value)) value = '#' + value.slice(1).split('').map(c => c + c).join('');
    if (!/^#[a-f0-9]{6}$/i.test(value)) throw new Error('请输入 #RRGGBB 格式的颜色。');
    const fillPick = fillPalettePending && tool === 'fill' && rememberIt;
    if (fillPick) { fillPalettePending = false; $('materialFollowInk').checked = true; $('fillPaintMode').value = 'color'; }
    ink = value.toLowerCase(); $('inkColor').value = ink;
    all('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color.toLowerCase() === ink)));
    if (colorPicker) colorPicker.setColor(ink);
    if (colorLibrary) colorLibrary.syncInk();
    scheduleBrushSample(); updateMaterialUI();
    if (rememberIt) remember(ink);
    if (fillPick) updateFillPaintUI();
    if (fillPick && window.innerWidth <= 650) togglePanel('settings', false);
  }
  function remember(color) { recentColors = [color, ...recentColors.filter(c => c !== color)].slice(0, 12); swatches($('recentSwatches'), recentColors); }
  function drawBrushSample(sample, settings) {
    const ctx = context(sample); clear(sample);
    sample.style.opacity = settings.opacity;
    if (Core.brushPresets.some(p => p.id === settings.brush && p.samplesLayer)) {
      const w = sample.width, h = sample.height;
      ctx.fillStyle = '#db766c'; ctx.fillRect(14, h * .18, w * .33, h * .55);
      ctx.fillStyle = '#5083c2'; ctx.fillRect(14 + w * .33, h * .18, w * .34, h * .55);
    }
    const stroke = Core.makeStroke(ctx, { ...settings, size: Math.min(settings.size, 32) });
    let point;
    for (let i = 0; i <= 72; i++) {
      const t = i / 72;
      point = { x: 19 + t * (sample.width - 38), y: sample.height / 2 - 10 * Math.sin(t * 2 * Math.PI), time: i * 6, pressure: .06 + .93 * Math.sin(Math.PI * t), pointerType: 'pen' };
      if (i) stroke.move(point); else stroke.start(point);
    }
    stroke.end(point);
  }
  function scheduleBrushSample() {
    if (sampleFrame) return;
    sampleFrame = requestAnimationFrame(() => {
      sampleFrame = 0;
      drawBrushSample($('brushPreview'), { brush, size, opacity, color: ink, pressure: pressureEnabled, stabilizer, textureScale, textureDensity });
    });
  }
  function queueBrushCard(button) {
    const preset = Core.brushPresets.find(p => p.id === button.dataset.brushPreset);
    const profile = brushProfile(preset), signature = JSON.stringify(profile);
    if (button.dataset.sampleProfile === signature) return;
    gallerySamples.set(button, { preset, profile, signature });
    if (!galleryFrame) galleryFrame = requestAnimationFrame(paintBrushCards);
  }
  function paintBrushCards() {
    galleryFrame = 0;
    if (!$('brushDialog').open) { gallerySamples.clear(); return; }
    // Paint only a small batch between frames, so opening a larger collection
    // never blocks scrolling/selection while every preview is generated.
    for (let i = 0; i < 2 && gallerySamples.size; i++) {
      const [button, { preset, profile, signature }] = gallerySamples.entries().next().value;
      gallerySamples.delete(button);
      drawBrushSample(button.querySelector('canvas'), { ...profile, brush: preset.id, color: '#294358', pressure: profile.pressureEnabled });
      button.dataset.sampleProfile = signature;
    }
    if (gallerySamples.size) galleryFrame = requestAnimationFrame(paintBrushCards);
  }
  function openBrushLibrary() {
    const gallery = $('brushGallery');
    if (!gallery.childElementCount) {
      const sections = new Map();
      Core.brushPresets.forEach(preset => {
        if (!sections.has(preset.group)) {
          const heading = document.createElement('h3'), grid = document.createElement('div');
          heading.textContent = preset.group; grid.className = 'brush-grid';
          gallery.append(heading, grid); sections.set(preset.group, grid);
        }
        const item = document.createElement('button'), sample = canvas(190, 52), label = document.createElement('span');
        item.type = 'button'; item.dataset.brushPreset = preset.id; item.title = preset.hint;
        sample.setAttribute('aria-hidden', 'true'); label.textContent = preset.name;
        item.append(sample, label); sections.get(preset.group).append(item);
        item.addEventListener('click', () => {
          $('brushDialog').close(); $('brushKind').value = preset.id; setBrush(preset.id, true);
        });
      });
    }
    if (!galleryObserver && window.IntersectionObserver) {
      galleryObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          entry.target.dataset.sampleVisible = String(entry.isIntersecting);
          if (entry.isIntersecting) queueBrushCard(entry.target);
          else gallerySamples.delete(entry.target);
        }
      }, { root: $('brushDialog'), rootMargin: '80px' });
      all('[data-brush-preset]').forEach(button => galleryObserver.observe(button));
    }
    $('brushDialog').showModal();
    all('[data-brush-preset]').forEach(button => {
      const id = button.dataset.brushPreset, preset = Core.brushPresets.find(p => p.id === id), profile = brushProfile(preset);
      button.title = preset.hint + ' · ' + profile.size + ' px · 浓度 ' + Math.round(profile.opacity * 100) + '% · 防抖 ' + profile.stabilizer;
      if (preset.textureControls) button.title += ' · 纹理粗细 ' + Math.round(profile.textureScale * 100) + '% · 密度 ' + Math.round(profile.textureDensity * 100) + '%';
      button.setAttribute('aria-pressed', String(id === brush));
      if (!galleryObserver || button.dataset.sampleVisible === 'true') queueBrushCard(button);
    });
  }
  function setBrush(value, recall = false) {
    finishPointer(); brush = Core.resolveBrushId(value);
    const preset = Core.brushPresets.find(p => p.id === brush);
    $('brushKind').value = brush;
    if (recall) applyBrushProfile(brushProfile(preset));
    try { localStorage.setItem(brushKey + 'selected', brush); } catch (_) {}
    $('brushName').textContent = preset.name; $('brushHint').textContent = preset.hint;
    setTool('brush', true);
    if (!recall) storeBrushProfile();
    updateView(); scheduleBrushSample();
  }
  function togglePanel(name, force) {
    if (document.body.classList.contains('focus-mode')) toggleFocus(false);
    const key = name === 'reference' ? 'reference-hidden' : 'settings-hidden';
    const hidden = force == null ? !document.body.classList.contains(key) : !force;
    if (name === 'settings' && hidden) fillPalettePending = false;
    document.body.classList.toggle(key, hidden);
    if (!hidden && window.innerWidth <= 650) document.body.classList.add(name === 'reference' ? 'settings-hidden' : 'reference-hidden');
    $('showReference').setAttribute('aria-pressed', String(!document.body.classList.contains('reference-hidden'))); $('showSettings').setAttribute('aria-pressed', String(!document.body.classList.contains('settings-hidden')));
    requestAnimationFrame(() => { fitReference(); });
  }
  function toggleFocus(force) {
    const enabled = force == null ? !document.body.classList.contains('focus-mode') : force;
    document.body.classList.toggle('focus-mode', enabled); $('focusMode').setAttribute('aria-pressed', String(enabled)); $('focusLabel').textContent = enabled ? '展开' : '专注';
    requestAnimationFrame(() => { fitReference(); });
  }
  function createReference() {
    let instance;
    instance = new window.DrawingReference({
      paletteId: colorLibrary ? colorLibrary.getPreset() : 'sketch36-set',
      onChange: () => { if (ref === instance) referenceChanged(); },
      onError: message => { if (ref === instance) status(message); },
      onStatus: message => { if (ref === instance) status(message || '参考已就绪'); }
    }); return instance;
  }
  function referenceChanged(mark = true) {
    const info = ref.getInfo(), source = ref.getCanvas(), out = $('referenceCanvas');
    if (source) { resize(out, source.width, source.height); clear(out); context(out).drawImage(source, 0, 0); }
    const referenceContent = $('referenceContent'), referencePort = $('referenceView');
    referenceContent.classList.toggle('has-reference', !!source);
    referencePort.style.aspectRatio = source && source.width > 0 && source.height > 0 ? source.width + ' / ' + source.height : '';
    out.hidden = !source; $('referenceEmpty').hidden = !!source; syncReferenceNavigation();
    $('referenceCount').value = info.count || 8;
    const copic = info.mode === 'copic';
    $('referenceCopicControls').hidden = !copic;
    $('referenceCopicPreset').value = info.paletteId;
    $('referenceCopicMethod').textContent = info.paletteMethod === 'color' ? '按色彩匹配 · 固定保留黑白' : '按明暗匹配 · 使用套装原色，保留黑白';
    $('referencePaletteTitle').textContent = copic ? '概括用色' : '参考色卡';
    $('referencePalette').hidden = $('referenceCountLabel').hidden = copic;
    if (colorLibrary) colorLibrary.setPreset(info.paletteId, false);
    all('[data-ref-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.refMode === info.mode)));
    const suffix = info.importedStudy ? (info.sourceMode === 'black' ? ' · 含练习室局部压黑' : ' · 来自归纳练习室') : '';
    $('referenceName').textContent = source ? info.name + suffix : '尚未放入参考'; $('referenceName').title = $('referenceName').textContent;
    const key = info.name + '/' + info.width + '/' + info.height + '/' + info.page;
    if (key !== lastReferenceKey) { lastReferenceKey = key; referenceContent.scrollTop = 0; fitReference(); } else updateReferenceView();
    renderReferencePalette(); referenceVersion++; referenceCache = null;
    if (mark) changed();
  }
  function syncReferenceNavigation() {
    const info = ref.getInfo(); $('pdfNavigation').hidden = !info.isPDF;
    const page = pendingPDFPage?.reference === ref ? pendingPDFPage.page : info.page;
    $('pdfPage').value = page; $('pdfPage').max = info.pageCount; $('pdfPageCount').textContent = info.pageCount;
    $('pdfFirst').disabled = $('pdfPrevious').disabled = !info.isPDF || page <= 1;
    $('pdfLast').disabled = $('pdfNext').disabled = !info.isPDF || page >= info.pageCount;
    $('pdfSaveNote').hidden = !info.externalPDF;
    $('pdfRelink').hidden = !info.externalPDF || info.isPDF;
    if (info.externalPDF) $('pdfSaveNote').textContent = '第 ' + info.page + ' / ' + info.pageCount + ' 页 · 工程与草稿保留当前页，重开后选择原 PDF 可继续翻页。';
  }
  async function jumpPDF(value) {
    const info = ref.getInfo(), n = Number(value);
    if (!info.isPDF || !Number.isFinite(n) || String(value).trim() === '') { syncReferenceNavigation(); return; }
    const page = clamp(Math.round(n), 1, info.pageCount);
    if (pendingPDFPage?.reference === ref && pendingPDFPage.page === page) return;
    const request = { reference: ref, page }; pendingPDFPage = request;
    syncReferenceNavigation();
    try { await request.reference.setPage(page); }
    finally { if (pendingPDFPage === request) { pendingPDFPage = null; syncReferenceNavigation(); } }
  }
  function renderReferencePalette() {
    if (!ref) return; const info = ref.getInfo(), copic = info.mode === 'copic';
    const container = $('referenceSwatches'), preset = window.DrawingPalettes.find(p => p.id === info.paletteId);
    container.classList.toggle('copic-swatches', copic);
    if (copic) container.style.setProperty('--palette-columns', String(preset?.columns || 6));
    else container.style.removeProperty('--palette-columns');
    swatches(container, copic ? info.paletteSwatches : info.palettes[$('referencePalette').value] || []);
  }
  function updateCopicPalette(id, show = false) {
    return work(() => {
      ref.setPalette(id);
      if (show) { ref.setMode('copic'); togglePanel('reference', true); }
      status(ref.getCanvas() ? (ref.getInfo().mode === 'copic' ? '色卡概括已更新 · 点下方色号取色' : '已选择 ' + ref.getInfo().paletteName) : '请在左侧放入图片或 PDF。');
    }, '正在更新概括色卡…');
  }
  function fitReference() {
    if (!ref || !ref.getCanvas()) return;
    const source = ref.getCanvas(), r = $('referenceView').getBoundingClientRect(); if (!r.width || !r.height) return;
    refView.zoom = clamp(Math.min((r.width - 16) / source.width, (r.height - 16) / source.height), .02, 8);
    refView.x = (r.width - source.width * refView.zoom) / 2; refView.y = (r.height - source.height * refView.zoom) / 2; lastReferencePort = { width: r.width, height: r.height }; updateReferenceView();
  }
  function resizeReferenceView() {
    const r = $('referenceView').getBoundingClientRect(); if (!r.width || !r.height || refPointer) return;
    const previous = lastReferencePort; lastReferencePort = { width: r.width, height: r.height };
    if (!ref || !ref.getCanvas()) return;
    if (!previous || !previous.width || !previous.height) { fitReference(); return; }
    const source = ref.getCanvas(), oldFit = Math.min((previous.width - 16) / source.width, (previous.height - 16) / source.height), nextFit = Math.min((r.width - 16) / source.width, (r.height - 16) / source.height);
    if (!(oldFit > 0 && nextFit > 0)) return;
    const focalX = (previous.width / 2 - refView.x) / refView.zoom, focalY = (previous.height / 2 - refView.y) / refView.zoom;
    refView.zoom = clamp(refView.zoom * nextFit / oldFit, .02, 20); refView.x = r.width / 2 - focalX * refView.zoom; refView.y = r.height / 2 - focalY * refView.zoom; updateReferenceView();
  }
  function updateReferenceView() { $('referenceCanvas').style.transform = 'translate(' + refView.x + 'px,' + refView.y + 'px) scale(' + refView.zoom + ')'; }
  function zoomReference(next, x, y) {
    if (!ref.getCanvas()) return; const r = $('referenceView').getBoundingClientRect(); x = x == null ? r.width / 2 : x; y = y == null ? r.height / 2 : y; next = clamp(next, .02, 20);
    refView.x = x - (x - refView.x) * next / refView.zoom; refView.y = y - (y - refView.y) * next / refView.zoom; refView.zoom = next; updateReferenceView();
  }
  async function referenceFile(file, relink = false) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name || '') && file.size > 80 * 1024 * 1024) throw new Error('参考图片超过 80 MiB，请先压缩图片。');
    togglePanel('reference', true);
    if (await ref.load(file, relink)) {
      fitReference(); status(relink ? '已关联原 PDF · 可继续翻页' : '参考已放好 · 拖动移动，滚轮缩放');
    }
  }
  async function importImageLayer(file) {
    if (!file) return; layerBudget(art.layers.length + 1);
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')) return referenceFile(file);
    if (file.size > 60 * 1024 * 1024) throw new Error('图片文件过大，请先压缩到 60 MB 以内。');
    const image = await loadImage(file); addSourceLayer(image, (file.name || '导入图片').replace(/\.[^.]+$/, ''));
  }
  function addSourceLayer(image, name) {
    layerBudget(art.layers.length + 1); mutate(() => {
      const layer = createLayer(String(name || '参考图层').slice(0, 40)), w = image.naturalWidth || image.width, h = image.naturalHeight || image.height;
      const scale = Math.min(art.width / w, art.height / h, 1); context(layer.canvas).drawImage(image, (art.width - w * scale) / 2, (art.height - h * scale) / 2, w * scale, h * scale);
      art.layers.push(layer); art.activeId = layer.id;
    }, '导入图片图层');
  }

  function blankArtwork(options) {
    const dimensions = validSize(options.width || 1280, options.height || 960);
    const layer = createLayer('图层 1', dimensions);
    return { ...dimensions, title: String(options.title || '未命名画作').slice(0, 60), ...window.DrawingPaper.settings(options), paperPpi: window.DrawingCanvasPresets.paperPpi(options.paperPpi), tone: { hue: 0, saturation: 0, lightness: 0 }, layers: [layer], activeId: layer.id };
  }
  function newDocument(options = {}, prepared = blankArtwork(options)) {
    finishPointer(); settleTransactions(); art = prepared;
    undoStack = []; redoStack = []; transactions.clear(); revision = 0; savedRevision = 0; fileSavedRevision = -1; sessionUsed = false; draftId = uid();
    clearTimeout(saveTimer); saveTimer = 0; $('saveStatus').textContent = '自动保留当前作品'; $('canvasHint').hidden = false;
    setGeometry(); sync(); render(); fit(); status('新画布 · ' + art.width + ' × ' + art.height); return art.activeId;
  }
  async function serializeProject(state = snapshot(), includeReference = true) {
    const version = referenceVersion;
    const selectedBrush = brush, selectedInk = ink, selectedToneScope = toneScope;
    const brushSettings = tool === 'brush' ? { size, opacity, stabilizer, pressureEnabled, textureScale, textureDensity }
      : brushProfile(Core.brushPresets.find(p => p.id === selectedBrush));
    const layersPromise = Promise.all(state.layers.map(async layer => {
      const strokes = Strokes.exportBundle(layer.strokeRecords);
      return { ...metadata(layer), ...(strokes ? { strokes } : {}), image: await blobFromCanvas(layer.canvas) };
    }));
    let bundle = null;
    if (includeReference && ref && ref.getCanvas()) {
      if (referenceCache && referenceCacheVersion === version) bundle = referenceCache;
      else { bundle = await ref.exportBundle(); if (referenceVersion === version) { referenceCache = bundle; referenceCacheVersion = version; } }
    }
    const layers = await layersPromise;
    // Cached immutable tile Blobs avoid re-encoding every stroke at autosave;
    // their bytes also count against the existing history budget.
    trimHistory(); syncHistory();
    return { format: 'lrxdraw', version: 1, title: state.title, width: state.width, height: state.height, paperPpi: state.paperPpi, paper: state.paper, paperColor: state.paperColor, paperOpacity: state.paperOpacity, paperTexture: state.paperTexture, textureStrength: state.textureStrength, tone: state.tone, activeId: state.activeId, layers, reference: bundle,
      settings: { ink: selectedInk, brush: selectedBrush, ...brushSettings, eraserMode, toneScope: selectedToneScope, recentColors: recentColors.slice(0, 12), marks: readMarkSettings() } };
  }
  function notifySaveError(error) {
    if (error?.code === 'CURRENT_CONFLICT') {
      currentConflict = true;
      $('saveStatus').textContent = '另一标签页已更新 · 请存工程';
      if (!savingErrorShown) { savingErrorShown = true; notify('另一标签页已更改当前作品。这一页仍可另存工程，刷新后可接回最新作品。'); }
      return;
    }
    $('saveStatus').textContent = '本机未保存';
    if (!savingErrorShown) { savingErrorShown = true; notify('本机草稿暂时无法保存，请点“存工程”保留画作。' + (error && error.message ? ' ' + error.message : '')); }
  }
  async function writeCurrent(project) {
    if (!currentReady) {
      const current = await window.DrawingStorage.readCurrent();
      if (current.project) throw Object.assign(new Error('本机已有当前作品，请刷新后重新打开。'), { code: 'CURRENT_CONFLICT' });
      currentStamp = current.stamp; currentReady = true;
    }
    try { currentStamp = (await window.DrawingStorage.writeCurrent(project, currentStamp)).stamp; }
    catch (error) { if (error.code === 'CURRENT_CONFLICT') notifySaveError(error); throw error; }
  }
  async function saveDraft() {
    if (savePromise) return savePromise;
    if (switchingCurrent || currentConflict || !sessionUsed || revision <= savedRevision) return;
    if (activePointer) { scheduleSave(200); return; }
    savePromise = (async () => {
      const r = revision, id = draftId; $('saveStatus').textContent = '正在保存…';
      const project = await serializeProject();
      if (switchingCurrent || id !== draftId) return;
      await writeCurrent(project);
      if (id === draftId) {
        savedRevision = r;
        $('saveStatus').textContent = revision === r ? '已保存到本机' : '待保存';
        if (revision !== r) scheduleSave(160);
      }
    })();
    try { return await savePromise; } finally { savePromise = null; }
  }
  async function prepareToClose() {
    if (closePromise) return closePromise;
    if (!initialized || busy || switchingCurrent || pendingPDFPage) return false;
    closePromise = work(async () => {
      settleTransactions();
      if (refPointer) {
        try { $('referenceView').releasePointerCapture(refPointer.id); } catch (_) {}
        refPointer = null;
      }
      spacePan = false;
      clearTimeout(saveTimer); saveTimer = 0;
      try {
        if (!currentReady) throw new Error('当前作品尚未读取完成，请稍后再关闭，或先另存工程。');
        for (;;) {
          if (currentConflict) throw Object.assign(new Error('另一窗口已更新当前作品，请先另存工程。'), { code: 'CURRENT_CONFLICT' });
          // An earlier autosave may contain an older revision. Drain it, then
          // serialize again until the last stroke and parameter changes commit.
          if (savePromise || (sessionUsed && revision > savedRevision)) {
            await saveDraft();
            clearTimeout(saveTimer); saveTimer = 0;
            continue;
          }
          // This also waits for storage operations queued outside saveDraft.
          const current = await window.DrawingStorage.readCurrent();
          if (current.stamp !== currentStamp) throw Object.assign(new Error('另一窗口已更新当前作品，请先另存工程。'), { code: 'CURRENT_CONFLICT' });
          if (savePromise || (sessionUsed && revision > savedRevision)) continue;
          return !switchingCurrent && !pendingPDFPage && !activePointer && !transactions.size;
        }
      } catch (error) {
        notifySaveError(error); throw error;
      }
    }, '正在保存当前作品…');
    try { return await closePromise; } finally { closePromise = null; }
  }
  async function replaceCurrent(action) {
    finishPointer(); settleTransactions(); switchingCurrent = true; clearTimeout(saveTimer); saveTimer = 0;
    try { if (savePromise) await savePromise.catch(() => {}); return await action(); }
    finally {
      switchingCurrent = false;
      if (!currentConflict && sessionUsed && revision > savedRevision) scheduleSave(200);
    }
  }
  async function openCurrentProject(project) {
    await replaceCurrent(async () => {
      await loadProject(project, true);
      $('saveStatus').textContent = '已保存到本机';
    });
  }
  async function replaceWithBlank(options, discard = false) {
    await replaceCurrent(async () => {
      const next = blankArtwork(options);
      const project = discard ? null : await serializeProject(next, false);
      if (project) { project.settings.recentColors = []; project.settings.marks = { ...MARK_DEFAULTS }; }
      await writeCurrent(project);
      ref.destroy(); ref = createReference(); referenceCache = null; lastReferenceKey = ''; pendingPDFPage = null;
      recentColors = []; swatches($('recentSwatches'), recentColors); applyMarkSettings(MARK_DEFAULTS);
      newDocument(options, next); referenceChanged(false);
      $('saveStatus').textContent = discard ? '自动保留当前作品' : '已保存到本机';
      if (discard) status('作品已丢弃 · 新画布');
    });
  }
  async function encodeValues(value) {
    if (value instanceof Blob) return { $blob: await blobDataURL(value) };
    if (Array.isArray(value)) return Promise.all(value.map(encodeValues));
    if (value && typeof value === 'object') {
      const out = {}; for (const key of Object.keys(value)) { if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') out[key] = await encodeValues(value[key]); } return out;
    } return value;
  }
  async function exportProject() {
    const project = await serializeProject();
    function bytes(value) { if (value instanceof Blob) return value.size; if (Array.isArray(value)) return value.reduce((n, v) => n + bytes(v), 0); if (value && typeof value === 'object') return Object.values(value).reduce((n, v) => n + bytes(v), 0); return 0; }
    if (bytes(project) * 1.34 > PROJECT_BYTES - 1024 * 1024) throw new Error('工程超过 160 MB，请先精简参考 PDF 或减少图层。当前画作仍保留在页面中。');
    const text = JSON.stringify(await encodeValues(project));
    if (new Blob([text]).size > PROJECT_BYTES) throw new Error('工程超过 160 MB，请先精简参考或减少图层。');
    return text;
  }
  function decodeBlob(value, mime) {
    if (value instanceof Blob) {
      if (mime && value.type !== mime) throw new Error('工程图片格式不正确。');
      if (value.size > PROJECT_BYTES) throw new Error('工程中的文件过大。'); return value;
    }
    if (!value || typeof value.$blob !== 'string' || value.$blob.length > PROJECT_BYTES * 1.4) throw new Error('工程缺少有效的图片数据。');
    const match = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=\r\n]+)$/i.exec(value.$blob);
    if (!match || (!['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(match[1]) && !(mime === 'application/octet-stream' && match[1] === mime)) || (mime && match[1] !== mime)) throw new Error('工程包含不支持的文件格式。');
    const raw = atob(match[2]), bytes = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return new Blob([bytes], { type: match[1] });
  }
  async function checkLayerPNG(blob, w, h) {
    const bytes = new Uint8Array(await blobArray(blob.slice(0, 24)));
    if (bytes.length < 24 || bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) throw new Error('工程图层不是有效 PNG。');
    const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (data.getUint32(16) !== w || data.getUint32(20) !== h) throw new Error('工程图层尺寸与画布不符。');
  }
  async function decodeReference(bundle) {
    if (!bundle) return null;
    if (bundle.version !== 1 || !bundle.views) throw new Error('工程参考数据无效。');
    const colors = values => Array.isArray(values) ? values.filter(c => typeof c === 'string' && /^#[a-f0-9]{6}$/i.test(c)).slice(0, 32) : [];
    return { version: 1, name: String(bundle.name || '参考图').slice(0, 180), original: decodeBlob(bundle.original), views: { gray: decodeBlob(bundle.views.gray), color: decodeBlob(bundle.views.color), line: decodeBlob(bundle.views.line) }, palettes: { color: colors(bundle.palettes && bundle.palettes.color), gray: colors(bundle.palettes && bundle.palettes.gray) },
      selectedMode: ['original', 'gray', 'color', 'line', 'copic'].includes(bundle.selectedMode) ? bundle.selectedMode : 'original', paletteId: window.DrawingPalettes.some(p => p.id === bundle.paletteId) ? bundle.paletteId : 'sketch36-set', importedStudy: bundle.importedStudy !== false, sourceMode: ['value', 'color', 'line', 'black'].includes(bundle.sourceMode) ? bundle.sourceMode : '', page: number(bundle.page, 1), pageCount: bundle.pageCount, externalPDF: bundle.externalPDF ? { size: bundle.externalPDF.size, fingerprint: bundle.externalPDF.fingerprint } : null, count: clamp(number(bundle.count, 8), 2, 24), sourceFile: bundle.sourceFile ? decodeBlob(bundle.sourceFile, 'application/pdf') : null };
  }
  async function loadProject(project, saveAsCurrent = false) {
    finishPointer();
    if (typeof project === 'string') { if (project.length > PROJECT_BYTES * 1.4) throw new Error('工程文件过大。'); project = JSON.parse(project); }
    if (!project || project.format !== 'lrxdraw' || project.version !== 1 || !Array.isArray(project.layers) || !project.layers.length) throw new Error('这不是可识别的 .lrxdraw 工程。');
    const dimensions = validSize(project.width, project.height); layerBudget(project.layers.length, dimensions.width, dimensions.height);
    const next = { ...dimensions, title: String(project.title || '未命名画作').slice(0, 60), ...window.DrawingPaper.settings(project), tone: normalizeTone(project.tone), layers: [], activeId: String(project.activeId || '') };
    next.paperPpi = window.DrawingCanvasPresets.paperPpi(project.paperPpi);
    const ids = new Set(), layerImages = []; let total = 0;
    for (const value of project.layers) {
      if (!value || typeof value.id !== 'string' || value.id.length > 100 || ids.has(value.id)) throw new Error('工程图层标识无效。'); ids.add(value.id);
      const blob = decodeBlob(value.image, 'image/png'); total += blob.size; if (total > PROJECT_BYTES) throw new Error('工程图层占用过大。');
      if (saveAsCurrent) layerImages.push(blob);
      await checkLayerPNG(blob, next.width, next.height); const image = await loadImage(blob), c = canvas(next.width, next.height); context(c).drawImage(image, 0, 0);
      const strokeRecords = await Strokes.importBundle(value.strokes, c, decodeBlob, blobArray);
      next.layers.push({ id: value.id, name: String(value.name || '图层').slice(0, 40), visible: value.visible !== false, locked: !!value.locked, opacity: clamp(number(value.opacity, 1), 0, 1), x: clamp(number(value.x, 0), -65536, 65536), y: clamp(number(value.y, 0), -65536, 65536), scale: clamp(number(value.scale, 1), .1, 3), tone: normalizeTone(value.tone), canvas: c, strokeRecords });
      if (Strokes.bytes(next.layers.map(layer => layer.strokeRecords)) > Strokes.MAX_BYTES) throw new Error('工程的整笔记录超过 16 MiB 轻量限额。');
    }
    if (!ids.has(next.activeId)) next.activeId = next.layers[0].id;
    const inputSettings = project.settings && typeof project.settings === 'object' ? project.settings : {};
    const importedBrush = Core.brushPresets.find(p => p.id === Core.resolveBrushId(inputSettings.brush));
    const importedNumber = (key, min, max) => Number.isFinite(inputSettings[key])
      ? clamp(inputSettings[key], min, max) : importedBrush[key];
    const settings = {
      ink: typeof inputSettings.ink === 'string' && /^#[a-f0-9]{6}$/i.test(inputSettings.ink) ? inputSettings.ink : '#263544',
      brush: importedBrush.id, size: importedNumber('size', 1, 240),
      opacity: importedNumber('opacity', .01, 1), stabilizer: importedNumber('stabilizer', 0, 100),
      pressureEnabled: inputSettings.pressureEnabled !== false,
      textureScale: textureSetting(inputSettings.textureScale, 4), textureDensity: textureSetting(inputSettings.textureDensity, 2),
      eraserMode: inputSettings.eraserMode === 'stroke' ? 'stroke' : 'local',
      toneScope: inputSettings.toneScope === 'current' ? 'current' : 'all',
      recentColors: Array.isArray(inputSettings.recentColors) ? inputSettings.recentColors.filter(c => typeof c === 'string' && /^#[a-f0-9]{6}$/i.test(c)).slice(0, 12) : [],
      marks: normalizeMarkSettings(inputSettings.marks)
    };
    const bundle = await decodeReference(project.reference), candidate = createReference();
    let canonicalBundle = null;
    try {
      if (bundle) { await candidate.loadBundle(bundle); canonicalBundle = await candidate.exportBundle(); }
      if (saveAsCurrent) {
        const layers = next.layers.map((layer, index) => {
          const strokes = Strokes.exportBundle(layer.strokeRecords);
          return { ...metadata(layer), ...(strokes ? { strokes } : {}), image: layerImages[index] };
        });
        await writeCurrent({ format: 'lrxdraw', version: 1, ...next, layers, reference: canonicalBundle,
          settings });
      }
    } catch (error) { candidate.destroy(); throw error; }
    if (ref) ref.destroy(); ref = candidate; art = next;
    undoStack = []; redoStack = []; transactions.clear(); clearTimeout(saveTimer); saveTimer = 0; revision = 0; savedRevision = 0; fileSavedRevision = -1; sessionUsed = false; draftId = uid();
    eraserMode = settings.eraserMode; toneScope = settings.toneScope;
    setInk(settings.ink); applyMarkSettings(settings.marks); brush = settings.brush; $('brushKind').value = brush;
    applyBrushProfile(brushProfile({ ...settings, id: brush }));
    recentColors = settings.recentColors;
    $('brushSize').value = size; $('brushOpacity').value = Math.round(opacity * 100); $('brushOpacityValue').textContent = Math.round(opacity * 100) + '%'; $('stabilizer').value = stabilizer; $('stabilizerValue').textContent = stabilizer; $('penPressure').checked = pressureEnabled; swatches($('recentSwatches'), recentColors);
    setGeometry(); sync(); setBrush(brush); render(); fit(); lastReferenceKey = ''; referenceChanged(false); referenceCache = canonicalBundle; referenceCacheVersion = referenceVersion;
    $('saveStatus').textContent = '已打开 · 等待编辑'; $('canvasHint').hidden = true; status('已打开工程 · ' + art.title); return true;
  }
  async function exportRaster(type, transparent = false, quality = .92) {
    finishPointer(); const mime = type.startsWith('image/') ? type : 'image/' + (type === 'jpg' ? 'jpeg' : type), out = canvas(art.width, art.height);
    renderArtwork(out, transparent && mime !== 'image/jpeg', false);
    if (mime === 'image/jpeg') { const ctx = context(out); ctx.save(); ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, art.width, art.height); ctx.restore(); }
    const ppi = art.paperPpi, blob = await blobFromCanvas(out, mime, quality);
    return mime === 'image/png' && ppi ? window.DrawingCanvasPresets.setPngDensity(blob, ppi) : blob;
  }
  function exportSettings() {
    const format = $('exportFormat').value, vector = format === 'svg'; $('qualityLabel').hidden = format !== 'jpeg' && format !== 'webp'; $('vectorSettings').hidden = !vector; $('exportTransparentLabel').hidden = format === 'jpeg';
    $('vectorThresholdLabel').hidden = $('vectorMode').value !== 'mono'; $('vectorColors').disabled = $('vectorMode').value === 'mono';
    const notes = [];
    if (art.paperPpi) notes.push(format === 'png'
      ? 'PNG 将写入 ' + art.paperPpi + ' ppi 打印密度。'
      : '此格式按画布像素尺寸导出。需要保留纸张打印密度时请选择 PNG。');
    if (vector && art.paperTexture !== 'none' && art.textureStrength > 0 && !$('exportTransparent').checked)
      notes.push('画作导出为矢量路径，纸纹使用内嵌的重复纹理小样。');
    if (format === 'jpeg') notes.push('JPEG 将透明部分衬为白色。');
    $('exportNote').textContent = notes.join(' ');
    $('exportSubmit').textContent = vector ? '导出 SVG' : '导出图片';
  }
  async function buildVector() {
    const options = { colors: +$('vectorColors').value, mode: $('vectorMode').value, threshold: +$('vectorThreshold').value, maxSize: +$('vectorSize').value, simplify: +$('vectorSimplify').value, alphaThreshold: 12 };
    const key = JSON.stringify([revision, draftId, $('exportTransparent').checked, art.paper, options]);
    if (vectorResult && vectorKey === key) return vectorResult;
    const out = canvas(art.width, art.height); renderArtwork(out, true, false); const data = context(out).getImageData(0, 0, art.width, art.height);
    let result;
    if (typeof Worker === 'function' && location.protocol !== 'file:') {
      result = await new Promise((resolve, reject) => {
        const worker = new Worker(new URL('assets/drawing-studio/vector-worker.js?v=20261120-1', document.baseURI));
        const timeout = setTimeout(() => { worker.terminate(); reject(new Error('矢量化用时较长，请降低细节分辨率或色数。')); }, 45000);
        worker.onmessage = event => { clearTimeout(timeout); worker.terminate(); event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.result); };
        worker.onerror = () => { clearTimeout(timeout); worker.terminate(); reject(new Error('矢量化组件未能加载，请刷新页面后重试。')); };
        worker.postMessage({ image: { data: data.data, width: data.width, height: data.height }, options }, [data.data.buffer]);
      });
    } else { await tick(); result = Core.vectorize(data, options); }
    if (!$('exportTransparent').checked) {
      const background = window.DrawingPaper.svgBackground(art, result.workingWidth / art.width, result.workingHeight / art.height);
      result.svg = result.svg.replace(/(<svg[^>]*>)/, '$1' + background);
    }
    vectorResult = result; vectorKey = key; return result;
  }
  async function previewVector() {
    await work(async () => {
      const result = await buildVector(); if (vectorURL) URL.revokeObjectURL(vectorURL); vectorURL = URL.createObjectURL(new Blob([result.svg], { type: 'image/svg+xml' }));
      $('vectorPreviewImage').src = vectorURL; $('vectorPreviewWrap').hidden = false;
      $('vectorStats').textContent = result.colors.length + ' 色 · ' + result.paths + ' 组路径 · ' + result.points + ' 个节点 · ' + (new Blob([result.svg]).size / 1024).toFixed(1) + ' KB'; status('矢量预览已生成');
    }, '正在描摹矢量轮廓…');
  }

  function bindRange(id, apply, label) {
    on(id, 'input', () => { const value = +$(id).value; beginTransaction(id); $(id).value = value; apply(value); requestRender(); });
    on(id, 'change', () => { if (!transactions.has(id)) { const value = +$(id).value; beginTransaction(id); $(id).value = value; apply(value); } endTransaction(id, label); });
  }
  function dialogOpen() { return !!document.querySelector('dialog[open]'); }
  function editable(target) { return target && target.closest && target.closest('input,textarea,select,[contenteditable="true"]'); }
  function saveProjectFile() {
    return work(async () => {
      settleTransactions(); const r = revision, text = await exportProject();
      if (!await download(new Blob([text], { type: 'application/json' }), window.studioExportName() + '.lrxdraw')) { status('已取消保存工程'); return false; }
      fileSavedRevision = r; status('工程已导出 · 保留图层与参考');
      saveDraft().catch(notifySaveError);
      return true;
    }, '正在打包工程…');
  }
  function wireEvents() {
    all('[data-tool]').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
    on('eraserMode', 'change', () => {
      finishPointer(); eraserMode = $('eraserMode').value === 'stroke' ? 'stroke' : 'local';
      try { localStorage.setItem('lrx-drawing-eraser-mode-v1', eraserMode); } catch (_) {}
      syncEraser(); status(eraserMode === 'stroke' ? '整笔橡皮 · 一次擦除可撤销' : '局部橡皮 · 沿位置擦除像素');
    });
    on('brushKind', 'change', () => setBrush($('brushKind').value, true));
    on('brushSample', 'click', openBrushLibrary);
    for (const id of ['brushSize', 'brushOpacity', 'stabilizer', 'penPressure', 'brushTextureScale', 'brushTextureDensity']) {
      $(id).addEventListener('input', scheduleBrushSample);
      $(id).addEventListener('change', scheduleBrushSample);
    }
    on('brushSize', 'input', () => {
      const value = $('brushSize').valueAsNumber;
      if (Number.isInteger(value) && value >= 1 && value <= 240) { size = value; storeBrushProfile(); }
    });
    on('brushSize', 'change', () => {
      const field = $('brushSize');
      size = Number.isFinite(field.valueAsNumber) ? clamp(Math.round(field.valueAsNumber), 1, 240) : size;
      field.value = size; storeBrushProfile();
    });
    on('brushOpacity', 'input', () => { opacity = +$('brushOpacity').value / 100; syncOpacityUI(); storeBrushProfile(); });
    on('fillOpacity', 'input', () => { opacity = +$('fillOpacity').value / 100; syncOpacityUI(); });
    on('fillOpacity', 'change', () => { opacity = +$('fillOpacity').value / 100; syncOpacityUI(); });
    on('fillPaintMode', 'change', () => { finishPointer(); updateFillPaintUI(); });
    on('stabilizer', 'input', () => { stabilizer = +$('stabilizer').value; $('stabilizerValue').textContent = stabilizer; storeBrushProfile(); });
    on('penPressure', 'change', () => { pressureEnabled = $('penPressure').checked; storeBrushProfile(); });
    for (const id of ['brushTextureScale', 'brushTextureDensity']) {
      const update = () => {
        if ($(id).disabled) return;
        if (id === 'brushTextureScale') textureScale = textureSetting($(id).valueAsNumber / 100, 4);
        else textureDensity = textureSetting($(id).valueAsNumber / 100, 2);
        syncBrushTextureUI(); storeBrushProfile();
      };
      on(id, 'input', update); on(id, 'change', update);
    }
    on('resetBrushProfile', 'click', () => {
      const preset = tool === 'eraser' ? eraserPreset : Core.brushPresets.find(p => p.id === brush);
      applyBrushProfile({ ...preset, pressureEnabled: preset.pressureEnabled !== false }); storeBrushProfile(); status('已恢复这支笔的推荐参数');
    });
    on('touchDraw', 'change', () => { touchDraw = $('touchDraw').checked; });
    on('penOnlyBrush', 'change', () => {
      finishPointer();
      penOnlyBrush = $('penOnlyBrush').checked;
      try { localStorage.setItem(penOnlyBrushKey, penOnlyBrush ? 'on' : 'off'); } catch (_) {}
      $('brushCursor').hidden = true;
      status(penOnlyBrush ? '画笔仅限数位笔 · 鼠标左键平移；其他工具不受影响' : '鼠标画笔已启用 · 鼠标和数位笔都能画');
    });
    on('inkColor', 'input', () => setInk($('inkColor').value)); on('inkColor', 'change', () => remember(ink));
    for (const key of Object.keys(MARK_DEFAULTS)) {
      const update = () => {
        if (key === 'materialForeground') $('materialFollowInk').checked = false;
        if (key === 'textFont') $('textContent').style.fontFamily = MARK_FONTS[$('textFont').value] || MARK_FONTS.system;
        updateMaterialUI();
      };
      on(key, 'input', update); on(key, 'change', update);
    }
    on('shapeStrokeFromInk', 'click', () => { $('shapeStrokeColor').value = ink; });
    on('applyCanvasFrame', 'click', frameCanvas);
    on('materialBackFromInk', 'click', () => { $('materialBackground').value = ink; updateMaterialUI(); });
    on('tolerance', 'input', () => { $('toleranceValue').textContent = $('tolerance').value; });
    on('fillScope', 'change', () => { finishPointer(); updateFillScope(); });
    on('fillPalette', 'click', () => {
      if (tool !== 'fill') return;
      finishPointer(); fillPalettePending = true;
      $('paletteLibrary').closest('details').open = true;
      togglePanel('settings', true);
      document.querySelector('[data-color-mode="paletteLibrary"]').click();
      requestAnimationFrame(() => {
        $('paletteLibrary').scrollIntoView?.({ block: 'start' });
        $('palettePreset').focus({ preventScroll: true });
      });
      status('点选色卡作为填充颜色，保留当前填充范围与材质。');
    });
    on('contiguous', 'change', updateFillScope);
    for (const id of ['closeGap', 'closeGapNumber']) {
      on(id, 'input', () => syncCloseGap($(id)));
      on(id, 'change', () => syncCloseGap($(id), true));
    }
    on('undo', 'click', undo); on('redo', 'click', redo);
    on('addLayer', 'click', addLayer);
    on('duplicateLayer', 'click', duplicateLayer);
    on('mergeLayerDown', 'click', mergeLayerDown);
    on('deleteLayer', 'click', () => mutate(() => { const index = art.layers.indexOf(activeLayer()); art.layers.splice(index, 1); if (!art.layers.length) art.layers.push(createLayer('图层 1')); art.activeId = art.layers[Math.max(0, index - 1)].id; }, '删除图层'));
    for (const [id, delta] of [['layerUp', 1], ['layerDown', -1]]) on(id, 'click', () => { const i = art.layers.indexOf(activeLayer()), j = i + delta; if (j < 0 || j >= art.layers.length) return; mutate(() => { [art.layers[i], art.layers[j]] = [art.layers[j], art.layers[i]]; }, '图层排序'); });
    on('layerName', 'change', () => { const name = $('layerName').value.trim().slice(0, 40) || '未命名图层'; if (name !== activeLayer().name) mutate(() => { activeLayer().name = name; }, '图层改名'); });
    bindRange('layerOpacity', value => { activeLayer().opacity = value / 100; $('layerOpacityValue').textContent = value + '%'; }, '图层透明度');
    bindRange('layerScale', value => {
      const layer = activeLayer(), scale = value / 100; layer.x += art.width * (layer.scale - scale) / 2; layer.y += art.height * (layer.scale - scale) / 2; layer.scale = scale; $('layerScaleValue').textContent = value + '%';
    }, '图层缩放');
    on('resetLayerTransform', 'click', () => mutate(() => { const layer = activeLayer(); layer.x = 0; layer.y = 0; layer.scale = 1; }, '图层复位'));
    on('importLayer', 'click', () => $('layerFile').click());
    on('layerFile', 'change', async () => { const file = $('layerFile').files[0]; $('layerFile').value = ''; await work(() => importImageLayer(file), '正在放入图层…'); });
    on('toneScope', 'change', () => setToneScope($('toneScope').value));
    for (const key of ['hue', 'saturation', 'lightness']) bindRange(key, value => {
      const owner = toneOwner(); owner.tone = { ...normalizeTone(owner.tone), [key]: value };
      $(key + 'Value').textContent = value + (key === 'hue' ? '°' : '');
    }, '调色');
    on('resetTone', 'click', () => {
      finishPointer(); settleTransactions();
      mutate(() => { toneOwner().tone = normalizeTone(); }, toneScope === 'current' ? '恢复选中图层原色' : '恢复整体原色');
    });
    on('paper', 'change', () => mutate(() => {
      art.paper = $('paper').value;
      if (art.paper === 'transparent') art.paperOpacity = 0;
      else if (art.paper !== 'custom') {
        art.paperColor = art.paper === 'warm' ? '#f7f3e9' : '#ffffff';
        if (art.paperOpacity === 0) art.paperOpacity = 100;
      }
    }, '底色预设'));
    on('paperTexture', 'change', () => mutate(() => { art.paperTexture = $('paperTexture').value; }, '纸纹'));
    for (const id of ['paperOpacity', 'textureStrength']) bindRange(id, value => {
      art[id] = value;
      if (id === 'paperOpacity' && art.paper === 'transparent' && value > 0) art.paper = 'custom';
      $(id + 'Value').value = value + '%';
    }, id === 'paperOpacity' ? '底色不透明度' : '纹理强度');
    on('paperColor', 'input', () => { beginTransaction('paperColor'); art.paperColor = $('paperColor').value; art.paper = $('paper').value = 'custom'; requestRender(); });
    on('paperColor', 'change', () => endTransaction('paperColor', '背景颜色'));
    on('resizeCanvas', 'click', () => {
      const dimensions = validSize($('canvasWidth').value, $('canvasHeight').value); layerBudget(art.layers.length, dimensions.width, dimensions.height);
      const paperPpi = window.DrawingCanvasPresets.resizePpi();
      const resized = dimensions.width !== art.width || dimensions.height !== art.height;
      if (!resized && paperPpi === art.paperPpi) return;
      mutate(() => {
        art.paperPpi = paperPpi;
        if (resized) {
          art.layers = art.layers.map(layer => { const c = canvas(dimensions.width, dimensions.height); context(c).drawImage(layer.canvas, 0, 0); return { ...layer, canvas: c, strokeRecords: null }; });
          art.width = dimensions.width; art.height = dimensions.height;
        }
        setGeometry();
        if (resized) fit();
      }, '更改画布尺寸');
    });
    on('zoomIn', 'click', () => zoomTo(view.zoom * 1.25)); on('zoomOut', 'click', () => zoomTo(view.zoom / 1.25)); on('zoomLabel', 'click', () => zoomTo(1)); on('fitCanvas', 'click', fit);
    viewport.addEventListener('pointerdown', e => { try { pointerDown(e); } catch (error) { activePointer = null; notify(error); } });
    viewport.addEventListener('pointermove', e => { try { pointerMove(e); } catch (error) { finishPointer(); notify(error); } });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) viewport.addEventListener(name, e => finishPointer(e));
    viewport.addEventListener('pointerleave', () => { $('brushCursor').hidden = true; });
    viewport.addEventListener('contextmenu', safe(e => {
      e.preventDefault();
      // Only a secondary mouse/pen click undoes; keyboard menus and touch holds do not.
      if (e.button === 2 && e.pointerType !== 'touch' && !dialogOpen()) undo();
    }));
    viewport.addEventListener('wheel', e => { e.preventDefault(); if (activePointer) return; const r = viewport.getBoundingClientRect(); zoomTo(view.zoom * Math.exp(-clamp(e.deltaY, -100, 100) * .002), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    window.addEventListener('blur', () => { finishPointer(); refPointer = null; spacePan = false; $('brushCursor').hidden = true; });
    function saveOnLeave() { finishPointer(); settleTransactions(); saveDraft().catch(notifySaveError); }
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveOnLeave(); });
    window.addEventListener('pagehide', saveOnLeave);
    on('showReference', 'click', () => togglePanel('reference')); on('hideReference', 'click', () => togglePanel('reference', false));
    on('showSettings', 'click', () => togglePanel('settings')); on('hideSettings', 'click', () => togglePanel('settings', false));
    on('focusMode', 'click', () => toggleFocus());
    on('referenceWidth', 'input', () => { if (referenceSplitter) referenceSplitter.setWidth($('referenceWidth').value); });
    on('referenceOpen', 'click', () => $('referenceFile').click());
    on('referenceFile', 'change', async () => { const file = $('referenceFile').files[0]; $('referenceFile').value = ''; await work(() => referenceFile(file), '正在读取参考…'); });
    all('[data-ref-mode]').forEach(button => button.addEventListener('click', safe(() => button.dataset.refMode === 'copic' ? updateCopicPalette(colorLibrary.getPreset(), true) : ref.setMode(button.dataset.refMode))));
    on('referenceCopicPreset', 'change', () => updateCopicPalette($('referenceCopicPreset').value));
    on('previewPalette', 'click', () => updateCopicPalette(colorLibrary.getPreset(), true));
    on('referencePalette', 'change', renderReferencePalette);
    on('referenceCount', 'change', () => work(() => ref.setCount($('referenceCount').value), '正在归纳色卡…'));
    on('pdfFirst', 'click', () => jumpPDF(1)); on('pdfLast', 'click', () => jumpPDF(ref.getInfo().pageCount));
    const requestedPage = () => pendingPDFPage?.reference === ref ? pendingPDFPage.page : ref.getInfo().page;
    on('pdfPrevious', 'click', () => jumpPDF(requestedPage() - 1)); on('pdfNext', 'click', () => jumpPDF(requestedPage() + 1));
    on('pdfPage', 'change', () => jumpPDF($('pdfPage').value));
    on('pdfPage', 'keydown', e => { if (e.key === 'Enter') { e.preventDefault(); return jumpPDF(e.currentTarget.value); } });
    on('pdfRelink', 'click', () => $('pdfLinkFile').click());
    on('pdfLinkFile', 'change', () => { const file = $('pdfLinkFile').files[0]; $('pdfLinkFile').value = ''; return work(() => referenceFile(file, true), '正在关联原 PDF…'); });
    on('referenceFit', 'click', fitReference); on('referenceZoomIn', 'click', () => zoomReference(refView.zoom * 1.25)); on('referenceZoomOut', 'click', () => zoomReference(refView.zoom / 1.25));
    on('referencePick', 'click', () => { refPicking = !refPicking; $('referencePick').setAttribute('aria-pressed', String(refPicking)); $('referenceView').classList.toggle('picking', refPicking); });
    on('referenceToLayer', 'click', () => { const source = ref.getCanvas(); if (source) addSourceLayer(source, '参考 · ' + ref.getInfo().mode); else notify('请先放入参考图。'); });
    on('referenceRemove', 'click', () => { ref.destroy(); ref = createReference(); lastReferenceKey = ''; referenceChanged(); });
    const refPort = $('referenceView');
    refPort.addEventListener('pointerdown', e => {
      if (busy || e.button !== 0 || !ref.getCanvas()) return; e.preventDefault();
      const r = refPort.getBoundingClientRect();
      if (refPicking || e.altKey || tool === 'picker') { pickFrom($('referenceCanvas'), (e.clientX - r.left - refView.x) / refView.zoom, (e.clientY - r.top - refView.y) / refView.zoom); return; }
      refPointer = { id: e.pointerId, clientX: e.clientX, clientY: e.clientY, x: refView.x, y: refView.y }; try { refPort.setPointerCapture(e.pointerId); } catch (_) {}
    });
    refPort.addEventListener('pointermove', e => { if (!refPointer || refPointer.id !== e.pointerId) return; refView.x = refPointer.x + e.clientX - refPointer.clientX; refView.y = refPointer.y + e.clientY - refPointer.clientY; updateReferenceView(); });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) refPort.addEventListener(name, e => { if (refPointer && refPointer.id === e.pointerId) refPointer = null; });
    refPort.addEventListener('wheel', e => { e.preventDefault(); const r = refPort.getBoundingClientRect(); zoomReference(refView.zoom * Math.exp(-clamp(e.deltaY, -100, 100) * .002), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    for (const [zone, asReference] of [[$('referencePanel'), true], [viewport, false]]) {
      zone.addEventListener('dragover', e => { if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) { e.preventDefault(); zone.classList.add('drop-active'); } });
      zone.addEventListener('dragleave', e => { if (!zone.contains(e.relatedTarget)) zone.classList.remove('drop-active'); });
      zone.addEventListener('drop', safe(async e => {
        e.preventDefault(); e.stopPropagation(); zone.classList.remove('drop-active'); const file = e.dataTransfer.files[0];
        if (file) await work(() => asReference ? referenceFile(file) : importImageLayer(file), '正在读取图片…');
      }));
    }
    document.addEventListener('dragover', e => e.preventDefault()); document.addEventListener('drop', e => e.preventDefault());
    document.addEventListener('paste', safe(async e => {
      if (editable(e.target) || dialogOpen()) return;
      const item = Array.from(e.clipboardData && e.clipboardData.items || []).find(v => v.kind === 'file' && /^(image\/|application\/pdf)/.test(v.type));
      if (item) { e.preventDefault(); await work(() => referenceFile(item.getAsFile()), '正在粘贴参考…'); }
    }));
    all('[data-close]').forEach(button => button.addEventListener('click', safe(() => $(button.dataset.close).close())));
    on('helpOpen', 'click', () => $('helpDialog').showModal());
    on('newDocument', 'click', () => $('newDialog').showModal());
    on('newForm', 'submit', async e => {
      e.preventDefault();
      const options = { width: +$('newWidth').value, height: +$('newHeight').value, paperPpi: window.DrawingCanvasPresets.newPpi(), title: $('newTitle').value, paper: $('newPaperColor').value === '#ffffff' ? 'white' : 'custom', paperColor: $('newPaperColor').value, paperOpacity: +$('newPaperOpacity').value, paperTexture: $('newPaperTexture').value, textureStrength: +$('newTextureStrength').value };
      await work(async () => { await replaceWithBlank(options); $('newDialog').close(); }, '正在准备新画布…');
    });
    on('wastebasket', 'click', () => $('wastebasketDialog').showModal());
    on('discardWork', 'click', () => work(async () => {
      await replaceWithBlank({}, true); $('wastebasketDialog').close();
    }, '正在丢弃整幅作品…'));
    on('saveProject', 'click', saveProjectFile); on('openProject', 'click', () => $('projectFile').click());
    on('projectFile', 'change', async () => {
      const file = $('projectFile').files[0]; $('projectFile').value = ''; if (!file) return;
      if (file.size > PROJECT_BYTES) throw new Error('工程文件超过 160 MB，请使用较小的工程。');
      await work(async () => { const text = new TextDecoder().decode(await blobArray(file)); await openCurrentProject(JSON.parse(text)); }, '正在打开工程…');
    });
    on('exportOpen', 'click', () => { finishPointer(); settleTransactions(); $('exportName').value = $('exportName').defaultValue = window.studioExportName(); $('exportTransparent').checked = art.paperOpacity === 0 && (art.paperTexture === 'none' || art.textureStrength === 0); exportSettings(); $('exportDialog').showModal(); });
    on('exportFormat', 'change', exportSettings); on('vectorMode', 'change', exportSettings); on('exportTransparent', 'change', exportSettings);
    on('quality', 'input', () => { $('qualityValue').textContent = $('quality').value + '%'; });
    on('vectorThreshold', 'input', () => { $('vectorThresholdValue').textContent = $('vectorThreshold').value; });
    on('vectorPreview', 'click', previewVector);
    on('exportForm', 'submit', async e => {
      e.preventDefault(); await work(async () => {
        const input = $('exportName'), format = $('exportFormat').value;
        const name = input.value.trim() && input.value !== input.defaultValue ? filename(input.value) : window.studioExportName(); let blob, extension;
        if (format === 'svg') { const result = await buildVector(); blob = new Blob([result.svg], { type: 'image/svg+xml' }); extension = 'svg'; }
        else { blob = await exportRaster(format, $('exportTransparent').checked, +$('quality').value / 100); extension = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[blob.type] || 'png'; }
        if (!await download(blob, name + '.' + extension)) { status('已取消导出'); return; }
        $('exportDialog').close(); status('已导出 ' + extension.toUpperCase() + ' · ' + (blob.size / 1024).toFixed(1) + ' KB');
        if (format !== 'svg' && blob.type !== 'image/' + format) notify('当前浏览器改用了 ' + extension.toUpperCase() + ' 格式，文件扩展名已对应调整。');
      }, '正在导出画作…');
    });
    on('themeToggle', 'click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('theme', theme); } catch (_) {}
    });
    window.addEventListener('storage', event => {
      if (event.key === null) brushProfiles.clear();
      if (event.key?.startsWith(brushKey) && event.key !== brushKey + 'selected') {
        const id = event.key.slice(brushKey.length); brushProfiles.delete(id);
        if (id === (tool === 'eraser' ? 'eraser' : brush)) {
          if (activePointer) refreshBrushAfterStroke = true; else refreshActiveBrushProfile();
        }
      }
      if (event.key === penOnlyBrushKey || event.key === null) {
        try {
          const next = (event.key === null ? localStorage.getItem(penOnlyBrushKey) : event.newValue) !== 'off';
          if (penOnlyBrush !== next) finishPointer();
          penOnlyBrush = next; $('penOnlyBrush').checked = next;
        } catch (_) {}
      }
      if (event.key === 'theme' || event.key === null) { try { const t = localStorage.getItem('theme'); document.documentElement.dataset.theme = t === 'light' || t === 'dark' ? t : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (_) {} }
    });
    document.addEventListener('keydown', e => {
      if (e.key.toLowerCase() === 'escape' && activePointer && ['shape', 'text', 'lasso'].includes(activePointer.kind)) { e.preventDefault(); finishPointer(); return; }
      if (dialogOpen() || editable(e.target) || busy) return;
      const key = e.key.toLowerCase(), command = e.ctrlKey || e.metaKey;
      if (command && key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (command && key === 'y') { e.preventDefault(); redo(); return; }
      if (command && key === 's') { e.preventDefault(); saveProjectFile().catch(notify); return; }
      if (command || e.altKey) return;
      if (key === 'tab') { if (e.target === viewport || e.target === document.body || e.target === display) { e.preventDefault(); toggleFocus(); } return; }
      if (key === ' ') { if (e.target.closest && e.target.closest('button,a,summary')) return; e.preventDefault(); spacePan = true; viewport.dataset.cursor = 'hand'; return; }
      if (e.target.closest && e.target.closest('button,a,summary')) return;
      const tools = { b: 'brush', e: 'eraser', g: 'fill', i: 'picker', v: 'move', h: 'hand', u: 'shape', t: 'text' };
      if (tools[key]) { e.preventDefault(); setTool(tools[key]); }
      else if (key === '[' || key === ']') { e.preventDefault(); size = clamp(Math.round(size + (key === '[' ? -1 : 1) * Math.max(1, size * .15)), 1, 240); $('brushSize').value = size; storeBrushProfile(); scheduleBrushSample(); }
      else if (key === '0') fit(); else if (key === '1') zoomTo(1);
    });
    document.addEventListener('keyup', e => { if (e.key === ' ') { spacePan = false; viewport.dataset.cursor = tool; } });
    window.addEventListener('beforeunload', e => { finishPointer(); settleTransactions(); if (sessionUsed && revision > Math.max(savedRevision, fileSavedRevision)) { e.preventDefault(); e.returnValue = ''; } });
    if (window.ResizeObserver) {
      new ResizeObserver(() => { if (!activePointer) fit(); }).observe(viewport);
      new ResizeObserver(resizeReferenceView).observe(refPort);
    } else window.addEventListener('resize', () => { fit(); resizeReferenceView(); });
  }
  async function initialize() {
    if (!Core?.brushPresets || !window.DrawingChuishiBrushes || !window.DrawingChuishiData || !window.DrawingHaiguaiData || !window.DrawingDongdongData || !Marks || !Strokes || !window.DrawingPalettes || !window.DrawingPaletteMap || !window.DrawingColorLibrary || !window.DrawingCanvasPresets || !window.DrawingPaper || !window.DrawingColorControls || !window.DrawingReference || !window.DrawingStorage) { notify('画板组件未加载完整，请刷新页面。'); return; }
    const groups = new Map();
    for (const preset of Core.brushPresets) {
      if (!groups.has(preset.group)) {
        const group = document.createElement('optgroup'); group.label = preset.group;
        groups.set(preset.group, group); $('brushKind').append(group);
      }
      const option = document.createElement('option'); option.value = preset.id; option.textContent = preset.name;
      groups.get(preset.group).append(option);
    }
    colorLibrary = window.DrawingColorLibrary({ swatches, getInk: () => ink, setInk, onPresetChange: id => { if (ref) updateCopicPalette(id).catch(notify); } }); setInk(ink);
    $('referenceCopicPreset').append(...Array.from($('palettePreset').children, group => group.cloneNode(true)));
    try {
      const last = localStorage.getItem(brushKey + 'selected');
      if (last) brush = Core.resolveBrushId(last);
    } catch (_) {}
    $('brushKind').value = brush;
    $('penOnlyBrush').checked = penOnlyBrush;
    ref = createReference(); newDocument(); wireEvents(); setBrush(brush, true);
    colorPicker = window.DrawingColorControls.create({ host: $('colorPicker'), getColor: () => ink, getDisabled: () => !!busy || !!activePointer, onChange: (hex, detail) => { if (!busy) setInk(hex, !!detail.commit); } });
    referenceSplitter = window.DrawingColorControls.installReferenceSplitter({ workspace: $('workspace'), panel: $('referencePanel'), handle: $('referenceSplitter'), getDisabled: () => !!busy || !!activePointer || !!refPointer, onResize: width => {
      const bounds = referenceSplitter ? referenceSplitter.getBounds() : { min: 220, max: 640 }; $('referenceWidth').min = bounds.min; $('referenceWidth').max = bounds.max; $('referenceWidth').value = width;
    } });
    referenceSplitter.refresh(); updateMaterialUI();
    for (const [media, panel, button] of [
      [compactReference, 'reference', $('showReference')],
      [window.matchMedia('(max-width: 900px)'), 'settings', $('showSettings')]
    ]) {
      const hide = () => { document.body.classList.add(panel + '-hidden'); button.setAttribute('aria-pressed', 'false'); };
      if (media.matches) hide();
      media.addEventListener?.('change', event => { if (event.matches) hide(); });
    }
    referenceChanged(false); fit();
    await work(async () => {
      try {
        const current = await window.DrawingStorage.readCurrent();
        currentStamp = current.stamp; currentReady = true;
        if (current.project) {
          await loadProject(current.project);
          $('saveStatus').textContent = '已保存到本机'; status('接着画 · ' + art.title);
        }
      } catch (error) { notifySaveError(error); }
    }, '正在读取当前作品…');
    // Exposed for local contract tests and inspection; no external services use it.
    window.DrawingStudio = {
      inspect: () => ({ width: art.width, height: art.height, title: art.title, paper: art.paper, paperColor: art.paperColor, paperOpacity: art.paperOpacity, paperTexture: art.paperTexture, textureStrength: art.textureStrength, tone: { ...art.tone }, toneScope, view: { ...view }, layers: art.layers.map(metadata), activeId: art.activeId, tool, brush, ink, size, opacity, stabilizer, eraserMode, penOnlyBrush, strokeCount: Strokes.count(activeLayer().strokeRecords), strokeBytes: Strokes.bytes(art.layers.map(layer => layer.strokeRecords)), historyBytes: memory(), pressure: lastPressure, pointerType: lastPointerType, dirty: revision > savedRevision, history: undoStack.length, redo: redoStack.length, revision, savedRevision, draftId, drawing: !!activePointer, reference: ref.getInfo() }),
      newDocument, addLayer, selectLayer, duplicateLayer, mergeLayerDown, toggleLayerVisibility, setToneScope, undo, redo, render, exportRaster, exportProject, loadProject, serializeProject,
      get ref() { return ref; }, getLayer: id => art.layers.find(layer => layer.id === id), saveDraft, prepareToClose, setTool, setInk
    };
    async function acceptReference(token) {
      if (busy || activePointer || refPointer) throw new Error('轻绘正在操作中，请先完成当前操作后重试。');
      await work(async () => {
        const bundle = await window.DrawingBridge.take(token);
        await ref.loadBundle(bundle);
        if (!compactReference.matches) togglePanel('reference', true);
        fitReference(); status(document.body.classList.contains('reference-hidden') ? '已收到参考 · 点「参考」查看' : '已接收练习室参考 · 点色卡就能开始画');
      }, '正在接收练习室参考…');
    }
    window.DrawingBridge.setReceiver(acceptReference);
    window.addEventListener('studio-navigation-error', e => notify(e.detail));
    const url = new URL(location.href), token = url.searchParams.get('reference');
    if (token) {
      try {
        await acceptReference(token);
      } catch (error) { notify(error); }
      url.searchParams.delete('reference'); try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch (_) {}
    }
    initialized = true;
    if (window.DrawingDesktop) await window.DrawingDesktop.ready();
  }
  initialize().catch(notify);
})();
