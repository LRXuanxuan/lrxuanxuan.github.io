/* Local drawing workspace. No analytics, remote processing or user-file uploads. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = selector => Array.from(document.querySelectorAll(selector));
  const Core = window.DrawingCore, Marks = window.DrawingMarks;
  const MAX_PIXELS = 12000000, LAYER_PIXELS = 36000000, MAX_LAYERS = 16;
  const HISTORY_BYTES = 48 * 1024 * 1024, PROJECT_BYTES = 160 * 1024 * 1024;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const number = (v, fallback) => Number.isFinite(+v) ? +v : fallback;
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
  let art, ref, activePointer = null, refPointer = null, spacePan = false, busy = 0;
  let view = { zoom: 1, x: 0, y: 0 }, refView = { zoom: 1, x: 0, y: 0 };
  let tool = 'brush', brush = 'gpen', ink = '#263544', size = 8, opacity = 1, stabilizer = 20;
  let pressureEnabled = true, touchDraw = false, refPicking = false, recentColors = [];
  let undoStack = [], redoStack = [], frame = 0, transactions = new Map();
  let revision = 0, savedRevision = 0, sessionUsed = false, draftId = uid(), saveTimer = 0, savePromise = null;
  let referenceCache = null, referenceVersion = 0, referenceCacheVersion = -1, lastReferenceKey = '';
  let toastTimer = 0, savingErrorShown = false, vectorResult = null, vectorKey = '', vectorURL = '';
  let lastPressure = 0, lastPointerType = 'mouse', fileSavedRevision = -1;
  let colorPicker = null, referenceSplitter = null, lastReferencePort = null;
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
    textContent: '轻绘 Drawing', textFont: 'system', textSize: 48, textLineHeight: 1.3, textBold: false, textItalic: false, textAlign: 'left', textUseMaterial: false,
    materialKind: 'solid', materialFollowInk: true, materialForeground: '#263544', materialBackground: '#ffffff', materialTransparent: false, materialSpacing: 14, materialThickness: 2, materialAngle: 45
  };
  function normalizeMarkSettings(value) {
    value = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const next = { ...MARK_DEFAULTS };
    for (const key of Object.keys(next)) if (typeof next[key] === 'boolean' && typeof value[key] === 'boolean') next[key] = value[key];
    const enums = { shapeKind: ['rect', 'ellipse', 'star', 'triangle', 'heart'], textFont: Object.keys(MARK_FONTS), textAlign: ['left', 'center', 'right'], materialKind: ['solid', 'horizontal', 'vertical', 'diagonal', 'crosshatch', 'dots', 'linear', 'radial'] };
    for (const key of Object.keys(enums)) if (enums[key].includes(value[key])) next[key] = value[key];
    for (const key of ['shapeStrokeColor', 'materialForeground', 'materialBackground']) if (typeof value[key] === 'string' && /^#[a-f0-9]{6}$/i.test(value[key])) next[key] = value[key].toLowerCase();
    for (const [key, lo, hi] of [['shapeStrokeWidth', .5, 80], ['textSize', 8, 360], ['textLineHeight', .8, 3], ['materialSpacing', 4, 100], ['materialThickness', 1, 24], ['materialAngle', 0, 180]]) {
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
    const s = readMarkSettings(), gradient = s.materialKind === 'linear' || s.materialKind === 'radial', pattern = !gradient && s.materialKind !== 'solid';
    $('materialName').textContent = $('materialKind').selectedOptions[0].textContent;
    $('materialPatternOptions').hidden = !pattern; $('materialAngleField').hidden = !['diagonal', 'crosshatch', 'linear'].includes(s.materialKind);
    $('materialBackField').hidden = s.materialKind === 'solid'; $('materialBackFromInk').hidden = s.materialKind === 'solid'; $('materialTransparentLabel').hidden = s.materialKind === 'solid';
    $('materialFrontLabel').textContent = gradient ? '起始颜色' : s.materialKind === 'solid' ? '填充颜色' : '线 / 点颜色'; $('materialBackLabel').textContent = gradient ? '末尾颜色' : '背景颜色';
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
  function download(blob, name) {
    const a = document.createElement('a'), url = URL.createObjectURL(blob);
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function filename(name) { return String(name || '未命名画作').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 80).trim() || '未命名画作'; }
  function createLayer(name) {
    return { id: uid(), name: name || '图层 ' + (art ? art.layers.length + 1 : 1), visible: true, locked: false, opacity: 1, x: 0, y: 0, scale: 1, canvas: canvas(art.width, art.height) };
  }
  const activeLayer = () => art.layers.find(layer => layer.id === art.activeId) || art.layers[0];
  function metadata(layer) { return { id: layer.id, name: layer.name, visible: layer.visible, locked: layer.locked, opacity: layer.opacity, x: layer.x, y: layer.y, scale: layer.scale }; }
  function snapshot() {
    return { title: art.title, width: art.width, height: art.height, paper: art.paper, paperColor: art.paperColor, tone: { ...art.tone }, activeId: art.activeId, layers: art.layers.map(layer => ({ ...layer })) };
  }
  function setGeometry() {
    resize(display, art.width, art.height); resize(composite, art.width, art.height);
    resize(strokeCanvas, art.width, art.height); resize(liveCanvas, art.width, art.height);
    surface.style.width = art.width + 'px'; surface.style.height = art.height + 'px';
    $('documentSize').textContent = art.width + ' × ' + art.height;
  }
  function restoreSnapshot(state) {
    const dimensionsChanged = !art || art.width !== state.width || art.height !== state.height;
    art = { ...state, tone: { ...state.tone }, layers: state.layers.map(layer => ({ ...layer })) };
    setGeometry(); if (dimensionsChanged) fit(); sync(); render();
  }
  function memory() {
    const live = new Set(art.layers.map(l => l.canvas)), seen = new Set(); let total = 0;
    for (const entry of undoStack.concat(redoStack)) {
      if (entry.kind === 'pixels') total += entry.before.data.byteLength + entry.after.data.byteLength;
      else for (const state of [entry.before, entry.after]) for (const layer of state.layers) {
        if (!live.has(layer.canvas) && !seen.has(layer.canvas)) { seen.add(layer.canvas); total += layer.canvas.width * layer.canvas.height * 4; }
      }
    }
    return total;
  }
  function changed() {
    revision++; sessionUsed = true; vectorKey = ''; savingErrorShown = false;
    $('canvasHint').hidden = true; $('saveStatus').textContent = '待保存';
    clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveDraft().catch(notifySaveError); }, 1400);
  }
  function addHistory(entry) {
    undoStack.push(entry); redoStack = [];
    while (undoStack.length > 40 || (undoStack.length > 1 && memory() > HISTORY_BYTES)) undoStack.shift();
    changed(); syncHistory(); syncLayers();
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
    else { const layer = art.layers.find(l => l.id === entry.layerId); if (layer) context(layer.canvas).putImageData(redo ? entry.after : entry.before, entry.x, entry.y); }
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
  function paperColor() { return art.paper === 'warm' ? '#f7f3e9' : art.paper === 'custom' ? art.paperColor : '#ffffff'; }
  function toneFilter() { return 'hue-rotate(' + art.tone.hue + 'deg) saturate(' + (100 + art.tone.saturation) + '%) brightness(' + (100 + art.tone.lightness) + '%)'; }
  function compositeLayers(includeStroke = true) {
    const ctx = context(composite); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, art.width, art.height);
    for (const layer of art.layers) {
      if (!layer.visible || layer.opacity <= 0) continue;
      let source = layer.canvas;
      if (includeStroke && activePointer && ['stroke', 'shape', 'text'].includes(activePointer.kind) && activePointer.layerId === layer.id) {
        clear(liveCanvas); const live = context(liveCanvas); live.drawImage(layer.canvas, 0, 0);
        live.save(); live.globalAlpha = activePointer.opacity; live.globalCompositeOperation = activePointer.erase ? 'destination-out' : 'source-over'; live.drawImage(strokeCanvas, 0, 0); live.restore(); source = liveCanvas;
      }
      ctx.save(); ctx.globalAlpha = layer.opacity; ctx.translate(layer.x, layer.y); ctx.scale(layer.scale, layer.scale); ctx.imageSmoothingEnabled = false; ctx.drawImage(source, 0, 0); ctx.restore();
    }
    return composite;
  }
  function renderArtwork(target, transparent = false, includeStroke = true) {
    resize(target, art.width, art.height); clear(target);
    const ctx = context(target), source = compositeLayers(includeStroke);
    if (!transparent && art.paper !== 'transparent') { ctx.fillStyle = paperColor(); ctx.fillRect(0, 0, art.width, art.height); }
    ctx.save();
    const adjusted = art.tone.hue || art.tone.saturation || art.tone.lightness;
    if (adjusted && typeof ctx.filter === 'string') { ctx.filter = toneFilter(); ctx.drawImage(source, 0, 0); }
    else if (adjusted) { const data = context(source).getImageData(0, 0, art.width, art.height); Core.adjustFilter(data, art.tone); context(source).putImageData(data, 0, 0); ctx.drawImage(source, 0, 0); }
    else ctx.drawImage(source, 0, 0);
    ctx.restore(); return target;
  }
  function render() { if (!art) return; renderArtwork(display); updateView(); }
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
    const p = documentPoint(e); return { x: (p.x - layer.x) / layer.scale, y: (p.y - layer.y) / layer.scale, pressure: number(e.pressure, 0.5), pointerType: e.pointerType || 'mouse', time: e.timeStamp };
  }
  function updatePressure(e) {
    lastPointerType = e.pointerType || 'mouse'; lastPressure = clamp(number(e.pressure, 0), 0, 1);
    $('pressureStatus').textContent = lastPointerType === 'pen' ? '数位笔 · 压力 ' + Math.round(lastPressure * 100) + '%' : lastPointerType === 'touch' ? '触摸 · ' + (touchDraw ? '绘画' : '平移') : '鼠标 · 固定笔宽';
  }
  function canDraw() {
    const layer = activeLayer(); if (layer.locked) { notify('当前图层已锁定，请先解锁或换一层。'); return false; }
    if (!layer.visible) { notify('当前图层已隐藏，请先显示或换一层。'); return false; } return true;
  }
  function cursor(e) {
    updatePressure(e);
    const r = viewport.getBoundingClientRect(), c = $('brushCursor'), mode = spacePan ? 'hand' : e.altKey ? 'picker' : tool;
    viewport.dataset.cursor = mode;
    c.hidden = !['brush', 'eraser'].includes(mode) || e.pointerType === 'touch';
    c.style.left = (e.clientX - r.left) + 'px'; c.style.top = (e.clientY - r.top) + 'px';
    const d = Math.max(3, size * view.zoom); c.style.width = d + 'px'; c.style.height = d + 'px'; c.classList.toggle('square', brush === 'pixel' && mode === 'brush');
  }
  function pickFrom(c, x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= c.width || y >= c.height) return;
    const p = context(c).getImageData(x, y, 1, 1).data;
    if (p[3] === 0) { status('这里是透明像素'); return; }
    setInk('#' + Array.from(p.slice(0, 3), v => v.toString(16).padStart(2, '0')).join(''), true); status('已取色 ' + ink.toUpperCase());
  }
  function markOptions(kind, layer) {
    const s = readMarkSettings(), fill = materialStyle(s, layer.scale);
    if (kind === 'shape') return { type: s.shapeKind, constrain: s.shapeConstrain, fill: s.shapeFill ? fill : null, stroke: s.shapeStroke ? s.shapeStrokeColor : null, strokeWidth: s.shapeStrokeWidth / layer.scale, opacity: 1 };
    return { text: s.textContent, size: s.textSize / layer.scale, fontFamily: MARK_FONTS[s.textFont], bold: s.textBold, italic: s.textItalic, align: s.textAlign, lineHeight: s.textLineHeight, fill: s.textUseMaterial ? fill : ink, stroke: null, opacity: 1 };
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
  function commitPreview(pointer, layer, rawBounds, label) {
    const b = clippedBounds(rawBounds); if (!b) return false;
    const ctx = context(layer.canvas), before = ctx.getImageData(b.x, b.y, b.width, b.height);
    ctx.save(); ctx.globalAlpha = pointer.opacity; ctx.globalCompositeOperation = pointer.erase ? 'destination-out' : 'source-over'; ctx.drawImage(strokeCanvas, b.x, b.y, b.width, b.height, b.x, b.y, b.width, b.height); ctx.restore();
    const after = ctx.getImageData(b.x, b.y, b.width, b.height);
    if (!after.data.some((v, i) => v !== before.data[i])) return false;
    activePointer = null; addHistory({ kind: 'pixels', layerId: layer.id, x: b.x, y: b.y, before, after, label }); remember(ink); return true;
  }
  function pointerDown(e) {
    if (busy || activePointer || document.querySelector('dialog[open]') || (e.button !== 0 && e.button !== 1 && e.button !== 5)) return;
    e.preventDefault(); viewport.focus({ preventScroll: true }); updatePressure(e);
    const point = documentPoint(e), inside = point.x >= 0 && point.y >= 0 && point.x < art.width && point.y < art.height;
    const mode = e.button === 1 || spacePan || (e.pointerType === 'touch' && !touchDraw) ? 'hand' : e.altKey ? 'picker' : (e.button === 5 || (e.buttons & 32)) ? 'eraser' : tool;
    if (mode === 'hand') activePointer = { id: e.pointerId, kind: 'pan', clientX: e.clientX, clientY: e.clientY, x: view.x, y: view.y };
    else if (!inside) return;
    else if (mode === 'picker') { render(); pickFrom(display, point.x, point.y); return; }
    else {
      if (!canDraw()) return;
      const layer = activeLayer();
      if (mode === 'fill' || mode === 'cutout') { fillAt(point, mode === 'cutout'); return; }
      if (mode === 'move') activePointer = { id: e.pointerId, kind: 'move', origin: point, x: layer.x, y: layer.y, layerId: layer.id, before: snapshot() };
      else if (mode === 'shape' || mode === 'text') {
        const options = markOptions(mode, layer);
        if (mode === 'text' && !options.text.trim()) { notify('请先在右侧输入文字。'); return; }
        if (mode === 'shape' && !options.fill && !options.stroke) { notify('请至少启用填充或描边。'); return; }
        const p = strokePoint(e, layer); activePointer = { id: e.pointerId, kind: mode, layerId: layer.id, origin: p, last: p, options, opacity, bounds: null };
        previewMark(activePointer, p, e.shiftKey);
      }
      else {
        clear(strokeCanvas); const stroke = Core.makeStroke(context(strokeCanvas), { brush: mode === 'eraser' ? 'eraser' : brush, size: size / layer.scale, color: ink, pressure: pressureEnabled, stabilizer });
        const p = strokePoint(e, layer); stroke.start(p);
        activePointer = { id: e.pointerId, kind: 'stroke', layerId: layer.id, stroke, opacity, erase: mode === 'eraser', last: p };
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
    for (const item of events && events.length ? events : [e]) { const p = strokePoint(item, layer); activePointer.stroke.move(p); activePointer.last = p; }
    requestRender();
  }
  function finishPointer(e) {
    if (!activePointer || (e && e.pointerId != null && e.pointerId !== activePointer.id)) return;
    const pointer = activePointer, layer = art.layers.find(l => l.id === pointer.layerId);
    if (pointer.kind === 'stroke' && layer) {
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
    try { if (viewport.hasPointerCapture(pointer.id)) viewport.releasePointerCapture(pointer.id); } catch (_) {}
    render();
  }
  function fillAt(point, erase) {
    const layer = activeLayer(), x = Math.floor((point.x - layer.x) / layer.scale), y = Math.floor((point.y - layer.y) / layer.scale);
    if (x < 0 || y < 0 || x >= art.width || y >= art.height) return;
    const ctx = context(layer.canvas), target = ctx.getImageData(0, 0, art.width, art.height);
    let sample = target;
    if (!erase && $('fillSample').value === 'visible') {
      const source = compositeLayers(false); resize(sampleCanvas, art.width, art.height); clear(sampleCanvas);
      const sx = context(sampleCanvas); sx.save(); sx.imageSmoothingEnabled = false; sx.scale(1 / layer.scale, 1 / layer.scale); sx.translate(-layer.x, -layer.y); sx.drawImage(source, 0, 0); sx.restore(); sample = sx.getImageData(0, 0, art.width, art.height);
    }
    const fill = materialStyle(readMarkSettings(), layer.scale);
    const fillOptions = { tolerance: +$('tolerance').value, contiguous: $('contiguous').checked, expand: +$('fillExpand').value, erase };
    if (!erase && fill.kind !== 'solid') {
      const mask = ctx.createImageData(art.width, art.height), selection = Core.floodFill(mask, sample, x, y, [255, 255, 255, 255], fillOptions);
      if (!selection.bounds) { status('这里没有可填充的区域'); return; }
      const b = selection.bounds, temp = context(strokeCanvas); clear(strokeCanvas); temp.putImageData(mask, 0, 0);
      temp.save(); temp.globalCompositeOperation = 'source-in'; temp.fillStyle = Marks.fillStyle(temp, fill, b); temp.fillRect(b.x, b.y, b.width, b.height); temp.restore();
      const painted = commitPreview({ opacity, erase: false }, layer, b, '材质填充'); clear(strokeCanvas); render();
      status(painted ? '材质已填充到 ' + layer.name : '这里没有需要改变的像素'); if (painted) remember(fill.foreground); return;
    }
    const beforeFull = new Uint8ClampedArray(target.data);
    const fillColor = erase ? ink : fill.foreground;
    const rgba = [parseInt(fillColor.slice(1, 3), 16), parseInt(fillColor.slice(3, 5), 16), parseInt(fillColor.slice(5, 7), 16), Math.round(opacity * 255)];
    const result = Core.floodFill(target, sample, x, y, rgba, fillOptions);
    if (!result.changed || !result.bounds) { status('这里没有需要改变的像素'); return; }
    const b = result.bounds, before = ctx.createImageData(b.width, b.height), after = ctx.createImageData(b.width, b.height);
    for (let row = 0; row < b.height; row++) {
      const start = ((b.y + row) * art.width + b.x) * 4, end = start + b.width * 4;
      before.data.set(beforeFull.subarray(start, end), row * b.width * 4); after.data.set(target.data.subarray(start, end), row * b.width * 4);
    }
    ctx.putImageData(after, b.x, b.y); addHistory({ kind: 'pixels', layerId: layer.id, x: b.x, y: b.y, before, after, label: erase ? '抠除背景' : '油漆桶填充' }); render();
    status(erase ? '已抠除相近背景 · 可用橡皮修边，或撤销' : '已填充到 ' + layer.name); if (!erase) remember(fillColor);
  }

  function syncLayers() {
    if (!art) return;
    const list = $('layerList'); list.replaceChildren(); $('layerCount').textContent = art.layers.length;
    art.layers.slice().reverse().forEach(layer => {
      const row = document.createElement('div'); row.className = 'layer-row' + (layer.id === art.activeId ? ' active' : '') + (!layer.visible ? ' hidden-layer' : ''); row.setAttribute('role', 'listitem');
      const visible = document.createElement('button'); visible.className = 'layer-visibility'; visible.textContent = layer.visible ? '◉' : '○'; visible.title = layer.visible ? '隐藏图层' : '显示图层'; visible.setAttribute('aria-label', visible.title + ' ' + layer.name); visible.setAttribute('aria-pressed', String(layer.visible));
      visible.addEventListener('click', () => { if (!busy) mutate(() => { layer.visible = !layer.visible; }, '切换图层显示'); });
      const select = document.createElement('button'); select.className = 'layer-select'; select.setAttribute('aria-label', '选中 ' + layer.name); select.setAttribute('aria-pressed', String(layer.id === art.activeId));
      const thumb = canvas(31, 31); thumb.className = 'layer-thumb'; thumb.setAttribute('aria-hidden', 'true');
      const scale = Math.min(31 / art.width, 31 / art.height); context(thumb).drawImage(layer.canvas, (31 - art.width * scale) / 2, (31 - art.height * scale) / 2, art.width * scale, art.height * scale);
      const label = document.createElement('div'), name = document.createElement('span'), info = document.createElement('small'); name.textContent = layer.name; info.textContent = Math.round(layer.opacity * 100) + '% · ' + Math.round(layer.scale * 100) + '%'; label.append(name, info); select.append(thumb, label); select.addEventListener('click', () => selectLayer(layer.id));
      const lock = document.createElement('button'); lock.className = 'layer-lock'; lock.textContent = layer.locked ? '锁' : '·'; lock.title = layer.locked ? '解锁图层' : '锁定图层'; lock.setAttribute('aria-label', lock.title + ' ' + layer.name); lock.setAttribute('aria-pressed', String(layer.locked)); lock.addEventListener('click', () => { if (!busy) mutate(() => { layer.locked = !layer.locked; }, '切换图层锁定'); });
      row.append(visible, select, lock); list.append(row);
    });
    const layer = activeLayer(), index = art.layers.indexOf(layer);
    $('layerName').value = layer.name; $('layerOpacity').value = Math.round(layer.opacity * 100); $('layerOpacityValue').textContent = Math.round(layer.opacity * 100) + '%';
    $('layerScale').value = Math.round(layer.scale * 100); $('layerScaleValue').textContent = Math.round(layer.scale * 100) + '%';
    $('layerUp').disabled = index === art.layers.length - 1; $('layerDown').disabled = index === 0;
  }
  function sync() {
    syncHistory(); syncLayers();
    $('canvasWidth').value = art.width; $('canvasHeight').value = art.height; $('paper').value = art.paper; $('paperColor').value = art.paperColor; $('paperColorLabel').hidden = art.paper !== 'custom';
    for (const key of ['hue', 'saturation', 'lightness']) { $(key).value = art.tone[key]; $(key + 'Value').textContent = art.tone[key] + (key === 'hue' ? '°' : ''); }
    document.title = (art.title === '未命名画作' ? '轻绘' : art.title + ' · 轻绘') + ' · 本地画室';
  }
  function selectLayer(id) {
    if (busy || !art.layers.some(layer => layer.id === id)) return;
    finishPointer(); art.activeId = id; syncLayers(); status('当前图层 · ' + activeLayer().name);
  }
  function addLayer() {
    layerBudget(art.layers.length + 1); let added;
    mutate(() => { added = createLayer(); const index = art.layers.indexOf(activeLayer()); art.layers.splice(index + 1, 0, added); art.activeId = added.id; }, '新建图层'); return added.id;
  }
  function setTool(value) {
    if (busy) return; finishPointer(); tool = value;
    all('[data-tool]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tool === tool)));
    $('shapeSettings').hidden = tool !== 'shape'; $('textSettings').hidden = tool !== 'text'; $('materialSection').hidden = !['fill', 'shape', 'text'].includes(tool);
    $('fillSettings').hidden = tool !== 'fill' && tool !== 'cutout'; $('fillSampleLabel').hidden = tool === 'cutout';
    $('fillHint').textContent = tool === 'cutout' ? '点当前图层的背景抠除相近颜色。透明纸张与抠除已有白底是独立操作。' : '填充到当前图层，可在线稿下方另建上色层。';
    if (tool === 'shape' || tool === 'text') { togglePanel('settings', true); $('settingsPanel').querySelector('.settings-scroll').scrollTop = 0; }
    viewport.dataset.cursor = tool; $('brushCursor').hidden = true;
    status(({ brush: '画笔 · ' + $('brushKind').selectedOptions[0].textContent, eraser: '橡皮 · 擦除当前图层', fill: '填充 · 点选区域上色，可选择材质', shape: '形状 · 拖动预览，松手放置；Shift 锁定比例', text: '文字 · 先输入内容，再点击或拖动放置', picker: '取色 · 点击画作，或从参考图取色', move: '移层 · 拖动当前图层', hand: '平移 · 拖动画布', cutout: '抠图 · 点击当前图层的背景' })[tool]);
  }
  function swatches(container, colors) {
    container.replaceChildren();
    colors.forEach(color => {
      const button = document.createElement('button'); button.style.setProperty('--swatch', color); button.title = color.toUpperCase(); button.setAttribute('aria-label', '取色 ' + color.toUpperCase()); button.setAttribute('aria-pressed', String(color.toLowerCase() === ink.toLowerCase())); button.dataset.color = color;
      button.addEventListener('click', () => setInk(color, true)); container.append(button);
    });
  }
  function setInk(value, rememberIt = false) {
    if (typeof value !== 'string') throw new Error('请输入有效的颜色文本。');
    if (/^#[a-f0-9]{3}$/i.test(value)) value = '#' + value.slice(1).split('').map(c => c + c).join('');
    if (!/^#[a-f0-9]{6}$/i.test(value)) throw new Error('请输入 #RRGGBB 格式的颜色。');
    ink = value.toLowerCase(); $('inkColor').value = ink;
    all('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color.toLowerCase() === ink)));
    if (colorPicker) colorPicker.setColor(ink); updateMaterialUI();
    if (rememberIt) remember(ink);
  }
  function remember(color) { recentColors = [color, ...recentColors.filter(c => c !== color)].slice(0, 12); swatches($('recentSwatches'), recentColors); }
  function setBrush(value) {
    finishPointer(); brush = value;
    $('brushHint').textContent = ({ gpen: 'G 笔随压力改变粗细。鼠标保持固定笔宽。', fineliner: '针管笔保持等宽，适合小场景、线描与排线。', binary: '二值笔使用硬边圆笔尖，适合清楚利落的勾线。', pixel: '像素笔按整数网格落笔，方形笔尖、无抗锯齿。' })[brush];
    if (tool !== 'eraser') setTool('brush'); updateView();
  }
  function togglePanel(name, force) {
    if (document.body.classList.contains('focus-mode')) toggleFocus(false);
    const key = name === 'reference' ? 'reference-hidden' : 'settings-hidden';
    const hidden = force == null ? !document.body.classList.contains(key) : !force;
    document.body.classList.toggle(key, hidden);
    if (!hidden && window.innerWidth <= 650) document.body.classList.add(name === 'reference' ? 'settings-hidden' : 'reference-hidden');
    $('showReference').setAttribute('aria-pressed', String(!document.body.classList.contains('reference-hidden'))); $('showSettings').setAttribute('aria-pressed', String(!document.body.classList.contains('settings-hidden')));
    requestAnimationFrame(() => { fitReference(); });
  }
  function toggleFocus(force) {
    const enabled = force == null ? !document.body.classList.contains('focus-mode') : force;
    document.body.classList.toggle('focus-mode', enabled); $('focusMode').setAttribute('aria-pressed', String(enabled)); $('focusMode').textContent = enabled ? '展开' : '专注';
    requestAnimationFrame(() => { fitReference(); });
  }
  function createReference() {
    let instance;
    instance = new window.DrawingReference({
      onChange: () => { if (ref === instance) referenceChanged(); },
      onError: message => { if (ref === instance) status(message); },
      onStatus: message => { if (ref === instance) status(message || '参考已就绪'); }
    }); return instance;
  }
  function referenceChanged(mark = true) {
    const info = ref.getInfo(), source = ref.getCanvas(), out = $('referenceCanvas');
    if (source) { resize(out, source.width, source.height); clear(out); context(out).drawImage(source, 0, 0); }
    out.hidden = !source; $('referenceEmpty').hidden = !!source; $('pdfNavigation').hidden = !info.isPDF;
    $('pdfPage').value = info.page; $('pdfPage').max = info.pageCount; $('pdfPageCount').textContent = info.pageCount;
    $('pdfPrevious').disabled = info.page <= 1; $('pdfNext').disabled = info.page >= info.pageCount;
    $('referenceCount').value = info.count || 8;
    all('[data-ref-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.refMode === info.mode)));
    const suffix = info.importedStudy ? (info.sourceMode === 'black' ? ' · 含练习室局部压黑' : ' · 来自归纳练习室') : '';
    $('referenceName').textContent = source ? info.name + suffix : '尚未放入参考'; $('referenceName').title = $('referenceName').textContent;
    const key = info.name + '/' + info.width + '/' + info.height + '/' + info.page;
    if (key !== lastReferenceKey) { lastReferenceKey = key; fitReference(); } else updateReferenceView();
    renderReferencePalette(); referenceVersion++; referenceCache = null;
    if (mark) changed();
  }
  function renderReferencePalette() {
    if (!ref) return; const info = ref.getInfo(); swatches($('referenceSwatches'), info.palettes[$('referencePalette').value] || []);
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
  async function referenceFile(file) {
    if (!file) return; if (file.size > 80 * 1024 * 1024) throw new Error('参考文件超过 80 MB，请先精简 PDF 或压缩图片，给画作和工程留一些空间。');
    togglePanel('reference', true); await ref.load(file); fitReference(); status('参考已放好 · 拖动移动，滚轮缩放');
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

  function newDocument(options = {}) {
    finishPointer(); settleTransactions();
    const dimensions = validSize(options.width || 1280, options.height || 960);
    art = { ...dimensions, title: String(options.title || '未命名画作').slice(0, 60), paper: options.paper === 'transparent' ? 'transparent' : 'white', paperColor: '#f7f3e9', tone: { hue: 0, saturation: 0, lightness: 0 }, layers: [], activeId: '' };
    art.layers.push(createLayer('图层 1')); art.activeId = art.layers[0].id;
    undoStack = []; redoStack = []; transactions.clear(); revision = 0; savedRevision = 0; fileSavedRevision = -1; sessionUsed = false; draftId = uid();
    clearTimeout(saveTimer); $('saveStatus').textContent = '本机草稿'; $('canvasHint').hidden = false;
    setGeometry(); sync(); render(); fit(); status('新画布 · ' + art.width + ' × ' + art.height); return art.activeId;
  }
  async function serializeProject() {
    const state = snapshot(), version = referenceVersion;
    const layersPromise = Promise.all(state.layers.map(async layer => ({ ...metadata(layer), image: await blobFromCanvas(layer.canvas) })));
    let bundle = null;
    if (ref && ref.getCanvas()) {
      if (referenceCache && referenceCacheVersion === version) bundle = referenceCache;
      else { bundle = await ref.exportBundle(); if (referenceVersion === version) { referenceCache = bundle; referenceCacheVersion = version; } }
    }
    return { format: 'lrxdraw', version: 1, title: state.title, width: state.width, height: state.height, paper: state.paper, paperColor: state.paperColor, tone: state.tone, activeId: state.activeId, layers: await layersPromise, reference: bundle,
      settings: { ink, brush, size, opacity, stabilizer, pressureEnabled, recentColors: recentColors.slice(0, 12), marks: readMarkSettings() } };
  }
  function notifySaveError(error) {
    $('saveStatus').textContent = '草稿未保存';
    if (!savingErrorShown) { savingErrorShown = true; notify('本机草稿暂时无法保存，请点“存工程”保留画作。' + (error && error.message ? ' ' + error.message : '')); }
  }
  async function saveDraft() {
    if (savePromise) return savePromise;
    if (!sessionUsed || revision <= savedRevision || activePointer) return;
    savePromise = (async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = revision, id = draftId; $('saveStatus').textContent = '正在保存…';
        const project = await serializeProject();
        if (id !== draftId) return;
        if (r !== revision || activePointer) continue;
        try { await window.DrawingStorage.save(id, project); }
        catch (error) { if (!error.saved) throw error; }
        if (id === draftId) savedRevision = r;
        $('saveStatus').textContent = revision === r ? '草稿已存本机' : '待保存'; $('restoreDraft').hidden = false;
        if (revision === r) return;
      }
      clearTimeout(saveTimer); saveTimer = setTimeout(() => saveDraft().catch(notifySaveError), 1400);
    })();
    try { return await savePromise; } finally { savePromise = null; }
  }
  async function flushDraft() {
    finishPointer(); settleTransactions(); clearTimeout(saveTimer);
    if (revision <= fileSavedRevision) return;
    if (savePromise) await savePromise;
    if (sessionUsed && revision > savedRevision) await saveDraft();
    if (sessionUsed && revision > savedRevision) throw new Error('当前画作还没有保存完成，请先点“存工程”再切换。');
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
    if (!match || !['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(match[1]) || (mime && match[1] !== mime)) throw new Error('工程包含不支持的文件格式。');
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
      selectedMode: ['original', 'gray', 'color', 'line'].includes(bundle.selectedMode) ? bundle.selectedMode : 'original', importedStudy: bundle.importedStudy !== false, sourceMode: ['value', 'color', 'line', 'black'].includes(bundle.sourceMode) ? bundle.sourceMode : '', page: number(bundle.page, 1), count: clamp(number(bundle.count, 8), 2, 24), sourceFile: bundle.sourceFile ? decodeBlob(bundle.sourceFile, 'application/pdf') : null };
  }
  async function loadProject(project) {
    finishPointer();
    if (typeof project === 'string') { if (project.length > PROJECT_BYTES * 1.4) throw new Error('工程文件过大。'); project = JSON.parse(project); }
    if (!project || project.format !== 'lrxdraw' || project.version !== 1 || !Array.isArray(project.layers) || !project.layers.length) throw new Error('这不是可识别的 .lrxdraw 工程。');
    const dimensions = validSize(project.width, project.height); layerBudget(project.layers.length, dimensions.width, dimensions.height);
    const next = { ...dimensions, title: String(project.title || '未命名画作').slice(0, 60), paper: ['white', 'transparent', 'warm', 'custom'].includes(project.paper) ? project.paper : 'white', paperColor: typeof project.paperColor === 'string' && /^#[a-f0-9]{6}$/i.test(project.paperColor) ? project.paperColor : '#f7f3e9', tone: {}, layers: [], activeId: String(project.activeId || '') };
    for (const key of ['hue', 'saturation', 'lightness']) next.tone[key] = clamp(number(project.tone && project.tone[key], 0), key === 'hue' ? -180 : -100, key === 'hue' ? 180 : 100);
    const ids = new Set(); let total = 0;
    for (const value of project.layers) {
      if (!value || typeof value.id !== 'string' || value.id.length > 100 || ids.has(value.id)) throw new Error('工程图层标识无效。'); ids.add(value.id);
      const blob = decodeBlob(value.image, 'image/png'); total += blob.size; if (total > PROJECT_BYTES) throw new Error('工程图层占用过大。');
      await checkLayerPNG(blob, next.width, next.height); const image = await loadImage(blob), c = canvas(next.width, next.height); context(c).drawImage(image, 0, 0);
      next.layers.push({ id: value.id, name: String(value.name || '图层').slice(0, 40), visible: value.visible !== false, locked: !!value.locked, opacity: clamp(number(value.opacity, 1), 0, 1), x: clamp(number(value.x, 0), -65536, 65536), y: clamp(number(value.y, 0), -65536, 65536), scale: clamp(number(value.scale, 1), .1, 3), canvas: c });
    }
    if (!ids.has(next.activeId)) next.activeId = next.layers[0].id;
    const inputSettings = project.settings && typeof project.settings === 'object' ? project.settings : {};
    const settings = {
      ink: typeof inputSettings.ink === 'string' && /^#[a-f0-9]{6}$/i.test(inputSettings.ink) ? inputSettings.ink : '#263544',
      brush: typeof inputSettings.brush === 'string' && ['gpen', 'fineliner', 'binary', 'pixel'].includes(inputSettings.brush) ? inputSettings.brush : 'gpen',
      size: clamp(typeof inputSettings.size === 'number' ? number(inputSettings.size, 8) : 8, 1, 240),
      opacity: clamp(typeof inputSettings.opacity === 'number' ? number(inputSettings.opacity, 1) : 1, .01, 1),
      stabilizer: clamp(typeof inputSettings.stabilizer === 'number' ? number(inputSettings.stabilizer, 20) : 20, 0, 100),
      pressureEnabled: inputSettings.pressureEnabled !== false,
      recentColors: Array.isArray(inputSettings.recentColors) ? inputSettings.recentColors.filter(c => typeof c === 'string' && /^#[a-f0-9]{6}$/i.test(c)).slice(0, 12) : [],
      marks: normalizeMarkSettings(inputSettings.marks)
    };
    const bundle = await decodeReference(project.reference), candidate = createReference();
    let canonicalBundle = null;
    try { if (bundle) { await candidate.loadBundle(bundle); canonicalBundle = await candidate.exportBundle(); } } catch (error) { candidate.destroy(); throw error; }
    if (ref) ref.destroy(); ref = candidate; art = next;
    undoStack = []; redoStack = []; transactions.clear(); clearTimeout(saveTimer); revision = 0; savedRevision = 0; fileSavedRevision = -1; sessionUsed = false; draftId = uid();
    setInk(settings.ink); applyMarkSettings(settings.marks); brush = settings.brush; $('brushKind').value = brush;
    size = settings.size; opacity = settings.opacity; stabilizer = settings.stabilizer; pressureEnabled = settings.pressureEnabled;
    recentColors = settings.recentColors;
    $('brushSize').value = size; $('brushOpacity').value = Math.round(opacity * 100); $('brushOpacityValue').textContent = Math.round(opacity * 100) + '%'; $('stabilizer').value = stabilizer; $('stabilizerValue').textContent = stabilizer; $('penPressure').checked = pressureEnabled; swatches($('recentSwatches'), recentColors);
    setGeometry(); sync(); setBrush(brush); render(); fit(); lastReferenceKey = ''; referenceChanged(false); referenceCache = canonicalBundle; referenceCacheVersion = referenceVersion;
    $('saveStatus').textContent = '已打开 · 等待编辑'; $('canvasHint').hidden = true; status('已打开工程 · ' + art.title); return true;
  }
  async function showDrafts() {
    const records = await window.DrawingStorage.list(), list = $('draftList'); list.replaceChildren();
    if (!records.length) { list.textContent = '还没有保存的本机草稿。'; }
    for (const item of records) {
      const row = document.createElement('div'); row.className = 'draft-item'; const label = document.createElement('div'), title = document.createElement('strong'), info = document.createElement('small');
      title.textContent = item.title || '未命名画作'; info.textContent = new Date(item.savedAt).toLocaleString('zh-CN') + ' · ' + item.width + ' × ' + item.height + ' · ' + item.layerCount + ' 层'; label.append(title, info);
      const button = document.createElement('button'); button.textContent = '打开'; button.addEventListener('click', safe(async () => {
        await work(async () => { const record = await window.DrawingStorage.load(item.id); if (!record) throw new Error('这份草稿已不存在。'); await flushDraft(); await loadProject(record.project); $('draftDialog').close(); }, '正在恢复草稿…');
      })); row.append(label, button); list.append(row);
    }
    $('draftDialog').showModal();
  }
  async function exportRaster(type, transparent = false, quality = .92) {
    finishPointer(); const mime = type.startsWith('image/') ? type : 'image/' + (type === 'jpg' ? 'jpeg' : type), out = canvas(art.width, art.height);
    renderArtwork(out, transparent || (mime === 'image/jpeg' && art.paper === 'transparent'), false);
    if (mime === 'image/jpeg') { const ctx = context(out); ctx.save(); ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = paperColor(); ctx.fillRect(0, 0, art.width, art.height); ctx.restore(); }
    return blobFromCanvas(out, mime, quality);
  }
  function exportSettings() {
    const format = $('exportFormat').value, vector = format === 'svg'; $('qualityLabel').hidden = format !== 'jpeg' && format !== 'webp'; $('vectorSettings').hidden = !vector; $('exportTransparentLabel').hidden = format === 'jpeg';
    $('vectorThresholdLabel').hidden = $('vectorMode').value !== 'mono'; $('vectorColors').disabled = $('vectorMode').value === 'mono';
    $('exportNote').textContent = format === 'jpeg' ? 'JPEG 不支持透明，会使用当前纸张颜色（透明画布用白色）。' : '只导出画作，不包含参考图、面板或棋盘格。';
    $('exportSubmit').textContent = vector ? '导出 SVG' : '导出图片';
  }
  async function buildVector() {
    const options = { colors: +$('vectorColors').value, mode: $('vectorMode').value, threshold: +$('vectorThreshold').value, maxSize: +$('vectorSize').value, simplify: +$('vectorSimplify').value, alphaThreshold: 12 };
    const key = JSON.stringify([revision, draftId, $('exportTransparent').checked, art.paper, options]);
    if (vectorResult && vectorKey === key) return vectorResult;
    const out = canvas(art.width, art.height); renderArtwork(out, $('exportTransparent').checked, false); const data = context(out).getImageData(0, 0, art.width, art.height);
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
    on(id, 'input', () => { beginTransaction(id); apply(+$(id).value); requestRender(); });
    on(id, 'change', () => { if (!transactions.has(id)) { beginTransaction(id); apply(+$(id).value); } endTransaction(id, label); });
  }
  function dialogOpen() { return !!document.querySelector('dialog[open]'); }
  function editable(target) { return target && target.closest && target.closest('input,textarea,select,[contenteditable="true"]'); }
  function saveProjectFile() {
    return work(async () => {
      settleTransactions(); const r = revision, text = await exportProject();
      download(new Blob([text], { type: 'application/json' }), filename(art.title) + '.lrxdraw'); fileSavedRevision = r; status('工程已导出 · 保留图层与参考');
      saveDraft().catch(notifySaveError);
    }, '正在打包工程…');
  }
  function wireEvents() {
    all('[data-tool]').forEach(button => button.addEventListener('click', () => setTool(button.dataset.tool)));
    on('brushKind', 'change', () => setBrush($('brushKind').value));
    on('brushSize', 'change', () => { size = clamp(Math.round(number($('brushSize').value, 8)), 1, 240); $('brushSize').value = size; });
    on('brushOpacity', 'input', () => { opacity = +$('brushOpacity').value / 100; $('brushOpacityValue').textContent = Math.round(opacity * 100) + '%'; });
    on('stabilizer', 'input', () => { stabilizer = +$('stabilizer').value; $('stabilizerValue').textContent = stabilizer; });
    on('penPressure', 'change', () => { pressureEnabled = $('penPressure').checked; });
    on('touchDraw', 'change', () => { touchDraw = $('touchDraw').checked; });
    on('inkColor', 'input', () => setInk($('inkColor').value)); on('inkColor', 'change', () => remember(ink));
    on('rememberColor', 'click', () => remember(ink));
    for (const key of Object.keys(MARK_DEFAULTS)) {
      const update = () => {
        if (key === 'materialForeground') $('materialFollowInk').checked = false;
        if (key === 'textFont') $('textContent').style.fontFamily = MARK_FONTS[$('textFont').value] || MARK_FONTS.system;
        updateMaterialUI();
      };
      on(key, 'input', update); on(key, 'change', update);
    }
    on('shapeStrokeFromInk', 'click', () => { $('shapeStrokeColor').value = ink; });
    on('materialBackFromInk', 'click', () => { $('materialBackground').value = ink; updateMaterialUI(); });
    on('palettePreset', 'change', () => { const preset = window.DrawingPalettes.find(p => p.id === $('palettePreset').value); swatches($('presetSwatches'), preset ? preset.colors : []); });
    on('tolerance', 'input', () => { $('toleranceValue').textContent = $('tolerance').value; });
    on('undo', 'click', undo); on('redo', 'click', redo);
    on('addLayer', 'click', addLayer);
    on('duplicateLayer', 'click', () => {
      layerBudget(art.layers.length + 1); mutate(() => { const source = activeLayer(), copy = { ...source, id: uid(), name: (source.name + ' 副本').slice(0, 40), canvas: canvas(art.width, art.height), locked: false }; context(copy.canvas).drawImage(source.canvas, 0, 0); art.layers.splice(art.layers.indexOf(source) + 1, 0, copy); art.activeId = copy.id; }, '复制图层');
    });
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
    for (const key of ['hue', 'saturation', 'lightness']) bindRange(key, value => { art.tone[key] = value; $(key + 'Value').textContent = value + (key === 'hue' ? '°' : ''); }, '整体调色');
    on('resetTone', 'click', () => mutate(() => { art.tone = { hue: 0, saturation: 0, lightness: 0 }; }, '恢复原色'));
    on('paper', 'change', () => mutate(() => { art.paper = $('paper').value; }, '画布背景'));
    on('paperColor', 'input', () => { beginTransaction('paperColor'); art.paperColor = $('paperColor').value; requestRender(); });
    on('paperColor', 'change', () => endTransaction('paperColor', '背景颜色'));
    on('resizeCanvas', 'click', () => {
      const dimensions = validSize($('canvasWidth').value, $('canvasHeight').value); layerBudget(art.layers.length, dimensions.width, dimensions.height);
      if (dimensions.width === art.width && dimensions.height === art.height) return;
      mutate(() => {
        art.layers = art.layers.map(layer => { const c = canvas(dimensions.width, dimensions.height); context(c).drawImage(layer.canvas, 0, 0); return { ...layer, canvas: c }; }); art.width = dimensions.width; art.height = dimensions.height; setGeometry(); fit();
      }, '更改画布尺寸');
    });
    on('zoomIn', 'click', () => zoomTo(view.zoom * 1.25)); on('zoomOut', 'click', () => zoomTo(view.zoom / 1.25)); on('zoomLabel', 'click', () => zoomTo(1)); on('fitCanvas', 'click', fit);
    viewport.addEventListener('pointerdown', e => { try { pointerDown(e); } catch (error) { activePointer = null; notify(error); } });
    viewport.addEventListener('pointermove', e => { try { pointerMove(e); } catch (error) { finishPointer(); notify(error); } });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) viewport.addEventListener(name, e => finishPointer(e));
    viewport.addEventListener('pointerleave', () => { $('brushCursor').hidden = true; });
    viewport.addEventListener('contextmenu', e => e.preventDefault());
    viewport.addEventListener('wheel', e => { e.preventDefault(); if (activePointer) return; const r = viewport.getBoundingClientRect(); zoomTo(view.zoom * Math.exp(-clamp(e.deltaY, -100, 100) * .002), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    window.addEventListener('blur', () => { finishPointer(); refPointer = null; spacePan = false; $('brushCursor').hidden = true; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { finishPointer(); settleTransactions(); saveDraft().catch(notifySaveError); } });
    on('showReference', 'click', () => togglePanel('reference')); on('hideReference', 'click', () => togglePanel('reference', false));
    on('showSettings', 'click', () => togglePanel('settings')); on('hideSettings', 'click', () => togglePanel('settings', false));
    on('focusMode', 'click', () => toggleFocus());
    on('referenceWidth', 'input', () => { if (referenceSplitter) referenceSplitter.setWidth($('referenceWidth').value); });
    on('referenceOpen', 'click', () => $('referenceFile').click());
    on('referenceFile', 'change', async () => { const file = $('referenceFile').files[0]; $('referenceFile').value = ''; await work(() => referenceFile(file), '正在读取参考…'); });
    all('[data-ref-mode]').forEach(button => button.addEventListener('click', safe(() => ref.setMode(button.dataset.refMode))));
    on('referencePalette', 'change', renderReferencePalette);
    on('referenceCount', 'change', () => work(() => ref.setCount($('referenceCount').value), '正在归纳色卡…'));
    on('pdfPrevious', 'click', () => ref.setPage(ref.getInfo().page - 1)); on('pdfNext', 'click', () => ref.setPage(ref.getInfo().page + 1));
    on('pdfPage', 'change', () => ref.setPage($('pdfPage').value));
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
    all('[data-size]').forEach(button => button.addEventListener('click', () => { const values = button.dataset.size.split(','); $('newWidth').value = values[0]; $('newHeight').value = values[1]; }));
    on('newForm', 'submit', async e => { e.preventDefault(); validSize($('newWidth').value, $('newHeight').value); await work(async () => { await flushDraft(); newDocument({ width: +$('newWidth').value, height: +$('newHeight').value, title: $('newTitle').value, paper: $('newTransparent').checked ? 'transparent' : 'white' }); $('newDialog').close(); }, '正在准备新画布…'); });
    on('saveProject', 'click', saveProjectFile); on('openProject', 'click', () => $('projectFile').click());
    on('projectFile', 'change', async () => {
      const file = $('projectFile').files[0]; $('projectFile').value = ''; if (!file) return;
      if (file.size > PROJECT_BYTES) throw new Error('工程文件超过 160 MB，请使用较小的工程。');
      await work(async () => { const text = new TextDecoder().decode(await blobArray(file)), project = JSON.parse(text); await flushDraft(); await loadProject(project); }, '正在打开工程…');
    });
    on('restoreDraft', 'click', showDrafts);
    on('exportOpen', 'click', () => { finishPointer(); settleTransactions(); $('exportName').value = art.title; $('exportTransparent').checked = art.paper === 'transparent'; exportSettings(); $('exportDialog').showModal(); });
    on('exportFormat', 'change', exportSettings); on('vectorMode', 'change', exportSettings);
    on('quality', 'input', () => { $('qualityValue').textContent = $('quality').value + '%'; });
    on('vectorThreshold', 'input', () => { $('vectorThresholdValue').textContent = $('vectorThreshold').value; });
    on('vectorPreview', 'click', previewVector);
    on('exportForm', 'submit', async e => {
      e.preventDefault(); await work(async () => {
        const format = $('exportFormat').value, name = filename($('exportName').value); let blob, extension;
        if (format === 'svg') { const result = await buildVector(); blob = new Blob([result.svg], { type: 'image/svg+xml' }); extension = 'svg'; }
        else { blob = await exportRaster(format, $('exportTransparent').checked, +$('quality').value / 100); extension = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[blob.type] || 'png'; }
        download(blob, name + '.' + extension); $('exportDialog').close(); status('已导出 ' + extension.toUpperCase() + ' · ' + (blob.size / 1024).toFixed(1) + ' KB');
        if (format !== 'svg' && blob.type !== 'image/' + format) notify('当前浏览器改用了 ' + extension.toUpperCase() + ' 格式，文件扩展名已对应调整。');
      }, '正在导出画作…');
    });
    on('themeToggle', 'click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('theme', theme); } catch (_) {}
    });
    window.addEventListener('storage', event => {
      if (event.key === 'theme' || event.key === null) { try { const t = localStorage.getItem('theme'); document.documentElement.dataset.theme = t === 'light' || t === 'dark' ? t : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (_) {} }
    });
    document.addEventListener('keydown', e => {
      if (dialogOpen() || editable(e.target) || busy) return;
      const key = e.key.toLowerCase(), command = e.ctrlKey || e.metaKey;
      if (key === 'escape' && activePointer && ['shape', 'text'].includes(activePointer.kind)) { e.preventDefault(); finishPointer(); return; }
      if (command && key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (command && key === 'y') { e.preventDefault(); redo(); return; }
      if (command && key === 's') { e.preventDefault(); saveProjectFile().catch(notify); return; }
      if (command || e.altKey) return;
      if (key === 'tab') { if (e.target === viewport || e.target === document.body || e.target === display) { e.preventDefault(); toggleFocus(); } return; }
      if (key === ' ') { if (e.target.closest && e.target.closest('button,a,summary')) return; e.preventDefault(); spacePan = true; viewport.dataset.cursor = 'hand'; return; }
      if (e.target.closest && e.target.closest('button,a,summary')) return;
      const tools = { b: 'brush', e: 'eraser', g: 'fill', i: 'picker', v: 'move', h: 'hand', u: 'shape', t: 'text' };
      if (tools[key]) { e.preventDefault(); setTool(tools[key]); }
      else if (key === '[' || key === ']') { e.preventDefault(); size = clamp(Math.round(size + (key === '[' ? -1 : 1) * Math.max(1, size * .15)), 1, 240); $('brushSize').value = size; }
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
    if (!Core || !Marks || !window.DrawingColorControls || !window.DrawingReference || !window.DrawingStorage) { notify('画板组件未加载完整，请刷新页面。'); return; }
    window.DrawingPalettes.forEach(preset => { const option = document.createElement('option'); option.value = preset.id; option.textContent = preset.name; $('palettePreset').append(option); });
    swatches($('presetSwatches'), window.DrawingPalettes[0].colors); setInk(ink);
    ref = createReference(); newDocument(); wireEvents();
    colorPicker = window.DrawingColorControls.create({ host: $('colorPicker'), getColor: () => ink, getDisabled: () => !!busy || !!activePointer, onChange: (hex, detail) => { if (!busy) setInk(hex, !!detail.commit); } });
    referenceSplitter = window.DrawingColorControls.installReferenceSplitter({ workspace: $('workspace'), panel: $('referencePanel'), handle: $('referenceSplitter'), getDisabled: () => !!busy || !!activePointer || !!refPointer, onResize: width => {
      const bounds = referenceSplitter ? referenceSplitter.getBounds() : { min: 220, max: 640 }; $('referenceWidth').min = bounds.min; $('referenceWidth').max = bounds.max; $('referenceWidth').value = width;
    } });
    referenceSplitter.refresh(); updateMaterialUI();
    if (window.innerWidth <= 900) document.body.classList.add('settings-hidden');
    if (window.innerWidth <= 650) document.body.classList.add('reference-hidden');
    $('showSettings').setAttribute('aria-pressed', String(window.innerWidth > 900)); $('showReference').setAttribute('aria-pressed', String(window.innerWidth > 650));
    referenceChanged(false); fit();
    // Exposed for local contract tests and inspection; no external services use it.
    window.DrawingStudio = {
      inspect: () => ({ width: art.width, height: art.height, title: art.title, paper: art.paper, paperColor: art.paperColor, tone: { ...art.tone }, view: { ...view }, layers: art.layers.map(metadata), activeId: art.activeId, tool, brush, ink, size, opacity, stabilizer, pressure: lastPressure, pointerType: lastPointerType, dirty: revision > savedRevision, history: undoStack.length, redo: redoStack.length, revision, savedRevision, draftId, drawing: !!activePointer, reference: ref.getInfo() }),
      newDocument, addLayer, selectLayer, undo, redo, render, exportRaster, exportProject, loadProject, serializeProject,
      get ref() { return ref; }, getLayer: id => art.layers.find(layer => layer.id === id), saveDraft, setTool, setInk
    };
    try { const drafts = await window.DrawingStorage.list(); $('restoreDraft').hidden = !drafts.length; if (drafts.length) status('有本机草稿 · 可在底部恢复'); } catch (_) { $('saveStatus').textContent = '请保存工程备份'; }
    const url = new URL(location.href), token = url.searchParams.get('reference');
    if (token) {
      try {
        const bundle = await window.DrawingBridge.take(token); if (!bundle) throw new Error('参考传递已过期或已读取，请回练习室重新点“带参考去画画”。');
        await ref.loadBundle(bundle); togglePanel('reference', true); fitReference(); status('已接收练习室参考 · 点色卡就能开始画');
      } catch (error) { notify(error); }
      url.searchParams.delete('reference'); try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch (_) {}
    }
  }
  initialize().catch(notify);
})();
