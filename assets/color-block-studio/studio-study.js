/* Drawing practice controller. All image processing and edits stay in this browser. */
(function (root) {
  'use strict';
  root.ColorBlockStudy = {
    create: function (a) {
      var s = a.state, e = a.els, h = a.helpers, old = a.legacy;
      var core = root.ColorBlockStudyCore;
      var $ = function (id) { return document.getElementById(id); };
      var list = function (selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };
      var clone = function (v) { return JSON.parse(JSON.stringify(v)); };
      var mode = 'value', levels = 3, dark = 35, light = 72;
      var lock = true, isolate = false, colorGray = false, tool = 'inspect', brushSize = 18, blackOnly = true;
      var idxKey = '', modeStates = {}, strokes = { line: [], black: [] };
      var undo = [], redo = [], present = null, restoring = false, loading = false, transaction = false;
      var compare = null, showA = false, imageVersion = 0, monoCache = null;
      var zoom = 1, panX = 0, panY = 0, panEnabled = false, pointer = null, paintFrame = 0;
      var activeLesson = null, lessonStep = 0, lessonVisited = {}, loadToken = 0;
      var names = { value: '明暗归纳', color: '色彩归纳', line: '线条取舍', black: '局部压黑' };
      var hints = {
        value: '先看亮、灰、暗的大形。分界调整区域归属，色板调整每组画多深。',
        color: '先用少量颜色概括。固定分块后只改色，比较冷暖、明度和面积的关系。',
        line: '自动提取的是线条候选。先看外轮廓与遮挡，再减掉不必要的花纹和碎线。',
        black: '先看黑块能否读清姿态，再补黑或留白。保留关键间隙，避免整片糊成一团。'
      };
      var overlay = document.createElement('canvas');
      overlay.id = 'studyOverlay'; overlay.hidden = true; overlay.setAttribute('aria-hidden', 'true');
      e.canvasWrap.appendChild(overlay);
      var overview = document.createElement('canvas');
      overview.id = 'studyOverview'; overview.width = 108; overview.height = 108;
      overview.hidden = true; overview.title = '整体小稿：缩小后检查大形与黑白关系';
      e.viewer.appendChild(overview);
      var cursor = document.createElement('span');
      cursor.id = 'studyCursor'; cursor.hidden = true; e.viewer.appendChild(cursor);
      var sourceCanvas = document.createElement('canvas');
      var originalRGBA = null;

      function packedMode() {
        return {
          palette: clone(s.palette), indices: s.indices, idxKey: idxKey,
          counts: s.counts, k: s.k, blur: s.blur, minRegion: s.minRegion, smooth: s.smooth,
          selected: s.selected, paletteAuto: s.paletteAuto,
          lineParams: clone(s.lineParams), hatch: clone(s.hatch), black: clone(s.black)
        };
      }
      function unpackedMode(p) {
        s.palette = clone(p.palette); s.indices = p.indices; s.counts = p.counts; idxKey = p.idxKey;
        ['k', 'blur', 'minRegion', 'smooth', 'selected', 'paletteAuto'].forEach(function (key) { s[key] = p[key]; });
        s.lineParams = clone(p.lineParams); s.hatch = clone(p.hatch); s.black = clone(p.black);
        s.workRGB = null; s.workRGBKey = ''; s.mapLUTKey = ''; monoCache = null;
      }
      function snapshot() {
        var slots = {};
        Object.keys(modeStates).forEach(function (key) { slots[key] = modeStates[key]; });
        return {
          mode: mode, current: packedMode(), modes: slots, levels: levels, dark: dark, light: light,
          lock: lock, blackOnly: blackOnly, strokes: clone(strokes), seed: s.seed, lessonVisited: clone(lessonVisited)
        };
      }
      function signature(p) {
        var q = p.current;
        return JSON.stringify({ mode: p.mode, levels: p.levels, dark: p.dark, light: p.light,
          lock: p.lock, blackOnly: p.blackOnly, strokes: p.strokes, seed: p.seed,
          palette: q.palette, k: q.k, blur: q.blur, minRegion: q.minRegion, smooth: q.smooth,
          line: q.lineParams, hatch: q.hatch, black: q.black, idxKey: q.idxKey });
      }
      function trimHistory() {
        while (undo.length > 20) undo.shift();
        function bytes() {
          var arrays = new Set(), total = 0;
          undo.concat(redo, present ? [present] : [], compare ? [compare.snapshot] : []).forEach(function (p) {
            [p.current].concat(Object.keys(p.modes).map(function (k) { return p.modes[k]; })).forEach(function (m) {
              if (m.indices && !arrays.has(m.indices)) { arrays.add(m.indices); total += m.indices.byteLength; }
            });
          });
          return total;
        }
        while (undo.length > 1 && bytes() > 48 * 1024 * 1024) undo.shift();
      }
      function commit() {
        if (!s.ready || restoring || loading || transaction || (pointer && pointer.stroke)) return;
        var next = snapshot();
        if (present && (signature(next) !== signature(present) || next.current.indices !== present.current.indices)) {
          undo.push(present); redo = []; showA = false;
        }
        present = next; trimHistory(); syncToolbar(); updateOverlay();
      }
      function restore(p) {
        restoring = true; mode = p.mode; levels = p.levels; dark = p.dark; light = p.light;
        lock = p.lock; blackOnly = p.blackOnly; strokes = clone(p.strokes); s.seed = p.seed;
        lessonVisited = clone(p.lessonVisited || {});
        modeStates = {};
        Object.keys(p.modes).forEach(function (key) { modeStates[key] = p.modes[key]; });
        unpackedMode(p.current); s.gray = mode === 'value'; s.line = mode === 'line' || mode === 'black';
        showA = false; isolate = false; tool = 'inspect'; transaction = false;
        if (activeLesson) lessonStep = activeLesson.steps.findIndex(function (step) { return step.mode === mode; });
        syncControls(); render(); restoring = false; present = snapshot(); syncToolbar(); renderLessonSteps();
      }
      function undoStep() {
        settle(); if (!undo.length) return;
        var p = undo.pop(); redo.push(present); restore(p);
      }
      function redoStep() {
        settle(); if (!redo.length) return;
        var p = redo.pop(); undo.push(present); restore(p);
      }
      function settle() {
        if (!s.ready) return;
        transaction = false; render(); commit();
      }
      function syncToolbar() {
        $('undoStudy').disabled = !undo.length;
        $('redoStudy').disabled = !redo.length;
        $('saveAB').disabled = !s.ready;
        $('showAB').disabled = !compare;
        $('showAB').setAttribute('aria-pressed', String(showA));
        $('showAB').textContent = showA ? '返回 B' : '查看 A';
        $('studyCompareStatus').textContent = showA ? ('方案 A · ' + compare.name + ' · 只读') : (compare ? '当前 B · A 已记录' : '');
        ['exportBtn', 'exportBtnTop', 'exportOrigBtn', 'cardBtn', 'printBtn', 'printBtnTop', 'saveBtn', 'saveBtnTop'].forEach(function (id) {
          if ($(id)) $(id).disabled = !s.ready || showA;
        });
      }
      function syncControls() {
        old.updateModeUi();
        document.body.dataset.studyMode = mode;
        list('[data-study-mode]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.studyMode === mode)); });
        list('[data-study-panel]').forEach(function (p) { p.hidden = p.dataset.studyPanel !== mode; });
        list('[data-study-for]').forEach(function (p) { p.hidden = p.dataset.studyFor.split(' ').indexOf(mode) < 0; });
        list('[data-value-levels]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.valueLevels === levels)); });
        list('[data-study-tool]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b.dataset.studyTool === tool));
          if (b.dataset.studyTool === 'black') b.textContent = mode === 'line' ? '补画线条' : '补黑';
        });
        $('studyHint').textContent = hints[mode];
        $('studyValueHelp').textContent = levels === 5
          ? '分界采用 L* 明度：' + core.valueThresholds(5, dark, light).map(function (n) { return Math.round(n * 10) / 10; }).join(' / ') + '。外侧两级自动细分；色板只决定输出灰阶。'
          : '分界采用 L* 明度（0 暗—100 亮），决定区域归属；下方色板决定每组画多深。';
        $('valueDark').value = dark; $('valueLight').value = light;
        $('valueDarkVal').textContent = dark + ' L*'; $('valueLightVal').textContent = light + ' L*';
        $('valueLightField').hidden = levels === 2;
        $('lockRegions').checked = lock; $('isolateGroup').checked = isolate; $('blackOnly').checked = blackOnly;
        $('studyColorGray').checked = colorGray;
        $('studyBrushTools').hidden = !s.line;
        $('studyBrushHint').textContent = mode === 'line'
          ? '在结果图上操作：保留会恢复原候选，减弱变浅灰；补画可以勾出你认为必要的线。'
          : '补黑连接需要强调的暗形，留白保护关键间隙；擦除修改可恢复此处的阈值候选。';
        $('studyBrushSizeVal').textContent = brushSize + ' px';
        $('remapBtn').disabled = !s.ready;
        e.kRange.value = s.k; e.kVal.textContent = s.k;
        e.blurRange.value = s.blur; e.blurVal.textContent = s.blur;
        e.minRange.value = s.minRegion; e.minVal.textContent = s.minRegion; e.smoothChk.checked = s.smooth > 0;
        h.syncLineInputs(); h.syncHatchUi(); h.syncBlackUi();
        e.canvasWrap.classList.toggle('study-brushing', s.line && tool !== 'inspect' && !showA && !panEnabled);
        e.canvasWrap.classList.toggle('study-panning', panEnabled);
        $('studyPan').setAttribute('aria-pressed', String(panEnabled));
        e.autoBadge.textContent = names[mode];
        e.lineRatio.textContent = mode === 'black' ? '阈值候选' : '边缘候选';
        e.exportOrigBtn.title = '保持当前分块与局部修改，按原图比例导出（长边上限 6000 px）';
        e.cardBtn.textContent = '导出当前练习参考卡';
        e.delColorBtn.hidden = mode === 'value'; e.addColorBtn.hidden = mode !== 'color';
        e.evenGrayBtn.hidden = mode !== 'value' || !s.ready;
        e.pickBtn.hidden = mode !== 'color';
        if ($('studyMergeTarget')) updateMergeOptions();
        if ($('studyZoomLabel')) $('studyZoomLabel').textContent = Math.round(zoom * 100) + '%';
        syncToolbar();
      }
      function colorKey() {
        return [mode, s.workW, s.workH, s.blur, s.minRegion, s.smooth, s.palette.length,
          mode === 'value' ? levels + ':' + dark + ':' + light : (lock ? 'fixed' : s.palette.map(h.toHex).join(','))].join('|');
      }
      function recolor() {
        if (s.line || !s.ready || !s.palette.length || !s.imageData) return;
        var t = performance.now(), key = colorKey(), k = s.palette.length;
        if (!s.indices || idxKey !== key) {
          var src = s.blur ? root.blurRGB(s.baseRGB, s.workW, s.workH, s.blur) : s.baseRGB;
          var indices = mode === 'value' ? core.valueIndices(src, s.workW, s.workH, levels, dark, light)
            : root.mapIndices(src, s.workW, s.workH, root.buildMapLUT(s.palette, a.labLUT));
          if (s.smooth) root.smoothEdges(indices, s.workW, s.workH, k, s.smooth);
          if (s.minRegion > 1) root.mergeSmallRegions(indices, s.workW, s.workH, k, s.minRegion);
          s.indices = indices; idxKey = key;
        }
        s.counts = root.countPalette(s.indices, k);
        root.paintFromIndices(s.indices, s.palette, s.imageData.data);
        e.resultCanvas.getContext('2d').putImageData(s.imageData, 0, 0);
        s.lastRecolorMs = performance.now() - t;
        h.renderPalette(); h.updateStatus(); updateDisplay(); commit();
      }
      function extract() {
        if (s.line) { computeLine(); return; }
        if (!s.ready) { h.toast('先载入一张图片，或选择一张示例'); return; }
        s.indices = null; idxKey = '';
        if (mode === 'value') {
          s.palette = core.defaultValuePalette(levels); s.k = levels; s.selected = 0; s.paletteAuto = true;
          recolor();
        } else old.extractAndRecolor();
        syncControls();
      }
      function monoBase() {
        var key = JSON.stringify([imageVersion, mode, s.lineParams, s.hatch, s.black, blackOnly]);
        if (monoCache && monoCache.key === key) return monoCache;
        var w = s.workW, hh = s.workH, gray = h.ensureLineGray(), n = w * hh;
        var lineGray = null, blackGray = null;
        if (mode === 'line' || !blackOnly) {
          var binary = root.lineArtWithHatch(gray, s.baseRGB, false, w, hh, s.lineParams, h.getHatchParams(), { enabled: false });
          lineGray = new Uint8ClampedArray(n);
          for (var i = 0; i < n; i++) lineGray[i] = binary[i] ? 0 : 255;
        }
        if (mode === 'black' || s.black.enabled) {
          var rgb = root.blurRGB(s.baseRGB, w, hh, Math.max(1, Math.round(Math.max(w, hh) / 1000)));
          blackGray = core.blackMask(rgb, w, hh, s.black.threshold, s.black.protectSkin);
        }
        monoCache = { key: key, line: lineGray, black: blackGray };
        return monoCache;
      }
      function monoResult() {
        var base = monoBase(), w = s.workW, hh = s.workH, n = w * hh, out;
        if (mode === 'line') {
          out = base.line;
          if (base.black) {
            out = new Uint8ClampedArray(out);
            for (var i = 0; i < n; i++) out[i] = Math.min(out[i], base.black[i]);
          }
          return core.applyStrokes(out, w, hh, strokes.line, 'line');
        }
        out = base.black;
        if (!blackOnly && base.line) {
          var lines = core.applyStrokes(base.line, w, hh, strokes.line, 'line');
          out = new Uint8ClampedArray(out);
          for (var j = 0; j < n; j++) out[j] = Math.min(out[j], lines[j]);
        }
        return core.applyStrokes(out, w, hh, strokes.black, 'black');
      }
      function computeLine() {
        if (!s.ready || !s.line) return;
        var t = performance.now(), values = monoResult(), blackPixels = 0;
        for (var i = 0, o = 0; i < values.length; i++, o += 4) {
          var v = values[i];
          s.imageData.data[o] = v; s.imageData.data[o + 1] = v; s.imageData.data[o + 2] = v; s.imageData.data[o + 3] = 255;
          if (v === 0) blackPixels++;
        }
        e.resultCanvas.getContext('2d').putImageData(s.imageData, 0, 0);
        s.lineMs = performance.now() - t; s.lineRatioVal = blackPixels / values.length;
        h.updateStatus();
        e.statusText.textContent = names[mode] + ' · ' + (mode === 'black' ? '分界 ' + s.black.threshold + ' L*' : '线条候选') + ' · 局部修改 ' + strokes[mode].length + ' 笔';
        $('studyMetrics').textContent = '当前纯黑面积 ' + (s.lineRatioVal * 100).toFixed(1) + '% · ' + strokes[mode].length + ' 笔修改。面积只作观察记录，没有固定合格比例。';
        updateDisplay(); commit();
      }
      function render() { if (s.line) computeLine(); else recolor(); }
      function setMode(next) {
        if (next === 'gray') next = 'value';
        if (!names[next]) return;
        if (next === mode) { syncControls(); return; }
        if (s.ready) modeStates[mode] = packedMode();
        mode = next; showA = false; isolate = false; colorGray = false; tool = 'inspect';
        s.gray = mode === 'value'; s.line = mode === 'line' || mode === 'black'; s.pickMode = false; h.updatePickUi();
        monoCache = null; s.workRGB = null; s.workRGBKey = '';
        if (modeStates[mode]) unpackedMode(modeStates[mode]);
        else {
          s.indices = null; idxKey = ''; s.paletteAuto = true; s.selected = 0;
          if (mode === 'value') { s.k = levels; s.palette = core.defaultValuePalette(levels); s.black.enabled = false; s.hatch.enabled = false; }
          if (mode === 'color') { s.k = 6; s.palette = []; s.black.enabled = false; s.hatch.enabled = false; }
          if (mode === 'line') { s.hatch.enabled = false; s.black.enabled = false; }
          if (mode === 'black') { s.hatch.enabled = false; s.black.enabled = true; s.black.protectSkin = false; }
        }
        if (activeLesson) lessonStep = activeLesson.steps.findIndex(function (step) { return step.mode === mode; });
        syncControls();
        if (s.ready) { if (!s.line && !s.palette.length) extract(); else render(); }
        renderLessonSteps(); applyView();
      }
      function applyImage(src, name, file) {
        loading = true; imageVersion++; monoCache = null; modeStates = {}; idxKey = '';
        strokes = { line: [], black: [] }; undo = []; redo = []; present = null; compare = null; showA = false;
        activeLesson = null; lessonStep = 0; lessonVisited = {}; isolate = false; colorGray = false; tool = 'inspect';
        zoom = 1; panX = panY = 0; pointer = null; transaction = false;
        s.indices = null; s.palette = mode === 'value' ? core.defaultValuePalette(levels) : [];
        s.gray = mode === 'value'; s.line = mode === 'line' || mode === 'black';
        if (mode === 'black') { s.black.enabled = true; s.black.protectSkin = false; }
        old.applyImage(src, name, file);
        sourceCanvas.width = s.workW; sourceCanvas.height = s.workH;
        sourceCanvas.getContext('2d').drawImage(e.origCanvas, 0, 0);
        originalRGBA = sourceCanvas.getContext('2d').getImageData(0, 0, s.workW, s.workH).data;
        overlay.width = s.workW; overlay.height = s.workH;
        loading = false; present = snapshot(); syncControls(); updateDisplay(); renderLessons(); renderLessonSteps(); fitCanvas();
      }
      function applyView() {
        old.applyView(); updateOverlay();
        list('#viewResult,#viewSplit,#viewOrig').forEach(function (b) { b.setAttribute('aria-pressed', String(b.classList.contains('on'))); });
      }
      function updateOverlay() {
        if (!s.ready) { overlay.hidden = true; return; }
        overview.hidden = false;
        var small = overview.getContext('2d'), scale = Math.min(100 / s.workW, 100 / s.workH);
        small.fillStyle = '#969696'; small.fillRect(0, 0, 108, 108);
        small.drawImage(showA && compare ? compare.canvas : e.resultCanvas, (108 - s.workW * scale) / 2, (108 - s.workH * scale) / 2, s.workW * scale, s.workH * scale);
        overlay.hidden = !(showA || (s.view !== 'orig' && ((isolate && !s.line && s.indices && s.selected >= 0) || (colorGray && mode === 'color'))));
        if (overlay.hidden) return;
        var ctx = overlay.getContext('2d');
        if (showA && compare) {
          ctx.clearRect(0, 0, overlay.width, overlay.height); ctx.drawImage(compare.canvas, 0, 0);
        } else if (colorGray && mode === 'color' && !isolate) {
          var grayData = ctx.createImageData(s.workW, s.workH);
          for (var go = 0; go < grayData.data.length; go += 4) {
            var gv = root.rgbToGrayValue(s.imageData.data[go], s.imageData.data[go + 1], s.imageData.data[go + 2]);
            grayData.data[go] = grayData.data[go + 1] = grayData.data[go + 2] = gv;
            grayData.data[go + 3] = s.imageData.data[go + 3];
          }
          ctx.putImageData(grayData, 0, 0);
        } else if (originalRGBA) {
          var data = ctx.createImageData(s.workW, s.workH);
          for (var i = 0, o = 0; i < s.indices.length; i++, o += 4) {
            var on = s.indices[i] === s.selected;
            data.data[o] = on ? originalRGBA[o] : Math.round(originalRGBA[o] * 0.13 + 164 * 0.87);
            data.data[o + 1] = on ? originalRGBA[o + 1] : Math.round(originalRGBA[o + 1] * 0.13 + 164 * 0.87);
            data.data[o + 2] = on ? originalRGBA[o + 2] : Math.round(originalRGBA[o + 2] * 0.13 + 164 * 0.87);
            data.data[o + 3] = 255;
          }
          ctx.putImageData(data, 0, 0);
        }
        overlay.style.clipPath = (!showA && s.view === 'split') ? 'inset(0 0 0 ' + (s.split * 100).toFixed(2) + '%)' : 'none';
      }
      function updateDisplay() {
        if (!s.ready) return;
        updateOverlay(); updateMergeOptions(); syncToolbar();
      }
      function selectPalette(i) { old.selectPalette(i); updateOverlay(); updateMergeOptions(); }
      function updateMergeOptions() {
        var sel = $('studyMergeTarget'); if (!sel) return;
        var previous = sel.value; sel.textContent = '';
        s.palette.forEach(function (p, i) {
          if (i === s.selected) return;
          var opt = document.createElement('option'); opt.value = i; opt.textContent = '第 ' + (i + 1) + ' 色 · ' + h.toHex(p); sel.appendChild(opt);
        });
        if (Array.prototype.some.call(sel.options, function (o) { return o.value === previous; })) sel.value = previous;
        $('studyMerge').disabled = !s.ready || s.palette.length < 2 || s.line || mode !== 'color';
      }
      function mergeGroup() {
        var from = s.selected, to = +$('studyMergeTarget').value;
        if (!s.indices || from < 0 || from === to || s.palette.length < 2) return;
        var next = new Uint8Array(s.indices.length);
        for (var i = 0; i < next.length; i++) {
          var index = s.indices[i] === from ? to : s.indices[i]; next[i] = index > from ? index - 1 : index;
        }
        s.palette.splice(from, 1); s.indices = next; s.selected = to > from ? to - 1 : to; s.k = s.palette.length;
        s.paletteAuto = false; idxKey = colorKey(); recolor(); syncControls(); h.toast('已合并所选两组，其他区域保持不变');
      }
      function copyResultCanvas() {
        var c = document.createElement('canvas'); c.width = s.workW; c.height = s.workH;
        c.getContext('2d').drawImage(e.resultCanvas, 0, 0); return c;
      }
      function renderBlockForSave() {
        if (!s.ready) return null;
        if (!s.line) { render(); return { canvas: copyResultCanvas(), palette: clone(s.palette), counts: s.counts }; }
        var p = modeStates.color || modeStates.value;
        if (p && p.indices && p.palette.length) {
          var c = document.createElement('canvas'); c.width = s.workW; c.height = s.workH;
          var ctx = c.getContext('2d'), data = ctx.createImageData(s.workW, s.workH);
          root.paintFromIndices(p.indices, p.palette, data.data); ctx.putImageData(data, 0, 0);
          return { canvas: c, palette: clone(p.palette), counts: root.countPalette(p.indices, p.palette.length) };
        }
        return old.renderBlockForSave();
      }
      function renderLineForSave() {
        if (!s.ready) return null;
        if (s.line) { computeLine(); return copyResultCanvas(); }
        var p = modeStates.line;
        var saved = snapshot(); restoring = true;
        mode = 'line'; s.line = true; s.gray = false;
        if (p) unpackedMode(p);
        else { s.hatch.enabled = false; s.black.enabled = false; monoCache = null; }
        computeLine();
        var result = copyResultCanvas(); restore(saved); return result;
      }
      async function renderFullRes() {
        // Preserve exactly the decisions shown in the work canvas, including locked regions and strokes.
        render();
        var factor = Math.min(1, 6000 / Math.max(s.naturalW, s.naturalH));
        var w = Math.max(1, Math.round(s.naturalW * factor)), hh = Math.max(1, Math.round(s.naturalH * factor));
        var c = document.createElement('canvas'); c.width = w; c.height = hh;
        var ctx = c.getContext('2d');
        if (!s.line && s.indices) {
          var idx = core.resizeIndicesNearest(s.indices, s.workW, s.workH, w, hh), out = ctx.createImageData(w, hh);
          root.paintFromIndices(idx, s.palette, out.data); ctx.putImageData(out, 0, 0);
        } else {
          ctx.imageSmoothingEnabled = false; ctx.drawImage(e.resultCanvas, 0, 0, w, hh);
        }
        return { canvas: c, w: w, h: hh };
      }
      async function exportLineOriginal() {
        if (!s.ready) return;
        h.showBusy('正在导出当前练习…');
        try {
          var result = await renderFullRes();
          h.downloadBlob(await h.canvasToBlob(result.canvas), s.name + '_' + names[mode] + '_' + result.w + 'x' + result.h + '.png');
          h.toast('已按原图比例导出，保留当前取舍');
        } catch (err) { h.toast('导出失败：' + err.message); } finally { h.hideBusy(); }
      }
      function fitCanvas() {
        old.fitCanvas();
        e.canvasWrap.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
        if ($('studyZoomLabel')) $('studyZoomLabel').textContent = Math.round(zoom * 100) + '%';
      }
      function renderBatch(rgb, w, hh, opts) {
        var n = w * hh, values, pal, indices, src;
        if (opts.line) {
          var gray = new Uint8Array(n);
          for (var i = 0, o = 0; i < n; i++, o += 3) gray[i] = root.rgbToGrayValue(rgb[o], rgb[o + 1], rgb[o + 2]);
          var black = null;
          if (mode === 'black' || s.black.enabled) {
            src = root.blurRGB(rgb, w, hh, Math.max(1, Math.round(Math.max(w, hh) / 1000)));
            black = core.blackMask(src, w, hh, s.black.threshold, s.black.protectSkin);
          }
          if (mode === 'black' && blackOnly) values = black;
          else {
            var mask = root.lineArtWithHatch(gray, rgb, false, w, hh, s.lineParams, h.getHatchParams(), { enabled: false });
            values = new Uint8ClampedArray(n);
            for (var j = 0; j < n; j++) values[j] = Math.min(mask[j] ? 0 : 255, black ? black[j] : 255);
          }
          var count = 0; for (var z = 0; z < n; z++) if (values[z] === 0) count++;
          return { values: values, ratio: count / n, line: true };
        }
        src = s.blur ? root.blurRGB(rgb, w, hh, s.blur) : rgb;
        if (opts.gray) {
          pal = opts.unified && opts.basePalette && opts.basePalette.length === levels ? clone(opts.basePalette) : core.defaultValuePalette(levels);
          indices = core.valueIndices(src, w, hh, levels, dark, light);
        } else {
          pal = opts.unified && opts.basePalette && opts.basePalette.length ? clone(opts.basePalette)
            : root.extractPalette(src, w, hh, opts.k, (s.seed + opts.index) >>> 0, a.labLUT);
          indices = root.mapIndices(src, w, hh, root.buildMapLUT(pal, a.labLUT));
        }
        if (s.smooth) root.smoothEdges(indices, w, hh, pal.length, s.smooth);
        if (s.minRegion > 1) root.mergeSmallRegions(indices, w, hh, pal.length, s.minRegion);
        return { palette: pal, indices: indices, counts: root.countPalette(indices, pal.length) };
      }
      function eventPoint(ev) {
        var r = e.canvasWrap.getBoundingClientRect();
        return [Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height))];
      }
      function moveCursor(ev) {
        var r = e.viewer.getBoundingClientRect();
        cursor.hidden = !s.line || tool === 'inspect' || panEnabled || showA || ev.pointerType === 'touch';
        cursor.style.width = cursor.style.height = brushSize + 'px';
        cursor.style.left = (ev.clientX - r.left) + 'px'; cursor.style.top = (ev.clientY - r.top) + 'px';
      }
      function flushStroke() {
        paintFrame = 0; if (s.ready && s.line) computeLine();
      }
      function pointerDown(ev) {
        if (!s.ready || ev.button > 0 || (ev.target.closest && ev.target.closest('#divider'))) return;
        if (panEnabled) {
          pointer = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, panX: panX, panY: panY };
        } else if (s.line && tool !== 'inspect' && !showA) {
          if (s.view === 'orig') { s.view = 'result'; applyView(); }
          if (s.view === 'split' && eventPoint(ev)[0] < s.split) { h.toast('请在分隔线右侧的结果图上修改'); return; }
          var rect = e.canvasWrap.getBoundingClientRect();
          var stroke = { tool: tool, radius: brushSize / (2 * Math.min(rect.width, rect.height)), points: [eventPoint(ev)] };
          strokes[mode].push(stroke); pointer = { id: ev.pointerId, stroke: stroke };
          flushStroke();
        } else return;
        ev.preventDefault(); ev.stopImmediatePropagation();
        if (e.canvasWrap.setPointerCapture) e.canvasWrap.setPointerCapture(ev.pointerId);
      }
      function pointerMove(ev) {
        moveCursor(ev); if (!pointer || pointer.id !== ev.pointerId) return;
        if (pointer.stroke) {
          var p = eventPoint(ev), prev = pointer.stroke.points[pointer.stroke.points.length - 1];
          if (Math.abs(p[0] - prev[0]) + Math.abs(p[1] - prev[1]) > 0.0004) pointer.stroke.points.push(p);
          if (!paintFrame) paintFrame = requestAnimationFrame(flushStroke);
        } else { panX = pointer.panX + ev.clientX - pointer.x; panY = pointer.panY + ev.clientY - pointer.y; fitCanvas(); }
        ev.preventDefault();
      }
      function pointerUp(ev) {
        if (!pointer || (ev.pointerId != null && pointer.id !== ev.pointerId)) return;
        var painted = !!pointer.stroke; pointer = null;
        if (paintFrame) cancelAnimationFrame(paintFrame); paintFrame = 0;
        if (painted) { computeLine(); commit(); }
      }
      function renderLessons() {
        var node = $('lessonList'); node.textContent = ''; node.hidden = !!activeLesson;
        $('lessonChange').hidden = !activeLesson;
        (root.ColorBlockLessons || []).forEach(function (lesson) {
          var button = document.createElement('button'); button.type = 'button'; button.className = 'study-lesson';
          button.dataset.lessonId = lesson.id; button.setAttribute('aria-pressed', String(!!activeLesson && lesson.id === activeLesson.id));
          var img = document.createElement('img'); img.src = lesson.thumbnail; img.alt = lesson.alt; img.loading = 'lazy'; img.width = 160; img.height = 240;
          var title = document.createElement('strong'); title.textContent = lesson.title;
          var focus = document.createElement('span'); focus.textContent = lesson.focus;
          button.appendChild(img); button.appendChild(title); button.appendChild(focus);
          button.addEventListener('click', function () { loadLesson(lesson); }); node.appendChild(button);
        });
      }
      function renderLessonSteps() {
        var node = $('lessonSteps'); node.textContent = ''; if (!activeLesson) return;
        var title = document.createElement('h3'); title.textContent = activeLesson.title; node.appendChild(title);
        var nav = document.createElement('div'); nav.className = 'study-steps-nav';
        activeLesson.steps.forEach(function (step, i) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'study-step'; b.dataset.lessonStep = i;
          b.setAttribute('aria-pressed', String(lessonStep === i)); b.textContent = step.title;
          b.addEventListener('click', function () { applyLessonStep(i, false); }); nav.appendChild(b);
        }); node.appendChild(nav);
        var step = activeLesson.steps[lessonStep]; if (!step) return;
        var instruction = document.createElement('p'); instruction.className = 'study-lesson-note'; instruction.textContent = step.instruction; node.appendChild(instruction);
        var reason = document.createElement('p'); reason.className = 'study-reason'; reason.textContent = '为什么这样练：' + step.reason; node.appendChild(reason);
        var reset = document.createElement('button'); reset.type = 'button'; reset.className = 'btn ghost sm'; reset.id = 'lessonResetStep'; reset.textContent = '恢复本步起点';
        reset.addEventListener('click', function () { applyLessonStep(lessonStep, true); }); node.appendChild(reset);
        var source = document.createElement('p'); source.className = 'study-source'; source.textContent = activeLesson.source; node.appendChild(source);
      }
      function applyLessonStep(i, reset) {
        if (!activeLesson || !activeLesson.steps[i]) return;
        var step = activeLesson.steps[i], settings = step.settings || {};
        var wasRestoring = restoring; restoring = true;
        setMode(step.mode); lessonStep = i;
        if (!lessonVisited[step.mode] || reset) {
          if (settings.levels) { levels = settings.levels; s.k = levels; s.palette = core.defaultValuePalette(levels); }
          if (settings.dark != null) dark = settings.dark;
          if (settings.light != null) light = settings.light;
          if (settings.k) s.k = settings.k;
          if (settings.blur != null) s.blur = settings.blur;
          if (settings.threshold != null) s.black.threshold = settings.threshold;
          if (settings.lineAmount != null) s.lineParams.amount = settings.lineAmount;
          if (s.line) strokes[mode] = [];
          if (mode === 'line') { s.hatch.enabled = false; s.black.enabled = false; }
          if (mode === 'black') { s.black.enabled = true; s.black.protectSkin = false; blackOnly = true; }
          s.indices = null; idxKey = ''; monoCache = null;
          if (!s.line) extract(); else computeLine();
          lessonVisited[step.mode] = true;
        }
        restoring = wasRestoring; syncControls(); render(); renderLessonSteps(); commit();
      }
      function loadLesson(lesson) {
        var token = ++loadToken;
        h.showBusy('正在载入练习示例…');
        var img = new Image();
        img.onload = function () {
          if (token !== loadToken) return;
          try {
            applyImage(img, lesson.title, null); activeLesson = lesson; lessonVisited = {}; applyLessonStep(0, true);
            undo = []; redo = []; present = snapshot(); renderLessons(); renderLessonSteps(); syncToolbar();
            h.toast('示例已载入：按四个步骤观察和修改');
          } catch (err) { h.toast('示例载入失败：' + err.message); }
          finally { h.hideBusy(); }
        };
        img.onerror = function () { if (token === loadToken) { h.hideBusy(); h.toast('示例暂时无法载入，可以选择本机图片继续'); } };
        img.src = lesson.image;
      }
      function bind() {
        list('[data-study-mode]').forEach(function (b) { b.addEventListener('click', function () { settle(); setMode(b.dataset.studyMode); }); });
        list('[data-value-levels]').forEach(function (b) { b.addEventListener('click', function () {
          levels = +b.dataset.valueLevels; s.k = levels; s.palette = core.defaultValuePalette(levels); s.selected = 0;
          s.indices = null; idxKey = ''; syncControls(); render();
        }); });
        function thresholds(ev) {
          if (ev.target.id === 'valueDark') { dark = +ev.target.value; if (dark >= light) light = Math.min(99, dark + 1); }
          else { light = +ev.target.value; if (light <= dark) dark = Math.max(1, light - 1); }
          syncControls(); render();
        }
        $('valueDark').addEventListener('input', thresholds); $('valueLight').addEventListener('input', thresholds);
        $('lockRegions').addEventListener('change', function () { lock = $('lockRegions').checked; idxKey = colorKey(); render(); });
        $('remapBtn').addEventListener('click', function () { s.indices = null; idxKey = ''; recolor(); h.toast('已按当前色板重新划分区域'); });
        $('isolateGroup').addEventListener('change', function () { isolate = $('isolateGroup').checked; showA = false; colorGray = false; $('studyColorGray').checked = false; applyView(); syncToolbar(); });
        $('studyColorGray').addEventListener('change', function () { colorGray = this.checked; isolate = false; $('isolateGroup').checked = false; showA = false; applyView(); syncToolbar(); });
        list('[data-study-tool]').forEach(function (b) { b.addEventListener('click', function () {
          tool = b.dataset.studyTool; showA = false; panEnabled = false; s.pickMode = false; h.updatePickUi(); syncControls(); applyView();
        }); });
        $('studyBrushSize').addEventListener('input', function () { brushSize = +this.value; $('studyBrushSizeVal').textContent = brushSize + ' px'; });
        $('blackOnly').addEventListener('change', function () { blackOnly = this.checked; monoCache = null; computeLine(); });
        $('undoStudy').addEventListener('click', undoStep); $('redoStudy').addEventListener('click', redoStep);
        $('saveAB').addEventListener('click', function () {
          settle(); if (!s.ready) return; compare = { snapshot: snapshot(), canvas: copyResultCanvas(), name: names[mode] };
          showA = false; syncToolbar(); updateOverlay(); h.toast('已记为 A，可以继续修改 B 再对照');
        });
        $('showAB').addEventListener('click', function () {
          if (!compare) return; showA = !showA; if (showA) { s.view = 'result'; isolate = false; } applyView(); syncControls();
        });
        list('[data-canvas-tone]').forEach(function (b) { b.addEventListener('click', function () {
          e.viewer.dataset.canvasTone = b.dataset.canvasTone;
          list('[data-canvas-tone]').forEach(function (n) { n.setAttribute('aria-pressed', String(n === b)); });
        }); });
        e.viewer.dataset.canvasTone = 'neutral';
        $('studyMerge').addEventListener('click', mergeGroup);
        $('studyZoomIn').addEventListener('click', function () { zoom = Math.min(6, zoom + 0.5); fitCanvas(); });
        $('studyZoomOut').addEventListener('click', function () { zoom = Math.max(1, zoom - 0.5); if (zoom === 1) panX = panY = 0; fitCanvas(); });
        $('studyFit').addEventListener('click', function () { zoom = 1; panX = panY = 0; panEnabled = false; fitCanvas(); syncControls(); $('studyPan').setAttribute('aria-pressed', 'false'); });
        $('studyPan').addEventListener('click', function () { panEnabled = !panEnabled; this.setAttribute('aria-pressed', String(panEnabled)); syncControls(); });
        $('lessonStarter').addEventListener('click', function () { if (root.ColorBlockLessons && root.ColorBlockLessons[0]) loadLesson(root.ColorBlockLessons[0]); });
        $('lessonChange').addEventListener('click', function () { $('lessonList').hidden = !$('lessonList').hidden; });
        e.canvasWrap.addEventListener('pointerdown', pointerDown, true);
        e.canvasWrap.addEventListener('pointermove', pointerMove);
        e.canvasWrap.addEventListener('pointerup', pointerUp);
        e.canvasWrap.addEventListener('pointercancel', pointerUp);
        e.canvasWrap.addEventListener('lostpointercapture', pointerUp);
        e.canvasWrap.addEventListener('pointerleave', function () { cursor.hidden = true; });
        // One slider gesture is one undo step, including debounced legacy controls.
        $('panel').addEventListener('input', function (ev) {
          if (ev.target.matches('input[type="range"], input[type="color"]') && ev.target.id !== 'studyBrushSize') transaction = true;
        }, true);
        $('panel').addEventListener('change', function (ev) {
          if (transaction || ev.target.matches('input,select')) setTimeout(function () { settle(); }, 0);
        });
        document.addEventListener('keydown', function (ev) {
          if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
          if (!(ev.ctrlKey || ev.metaKey)) return;
          if (ev.key.toLowerCase() === 'z') { ev.preventDefault(); if (ev.shiftKey) redoStep(); else undoStep(); }
          else if (ev.key.toLowerCase() === 'y') { ev.preventDefault(); redoStep(); }
        });
      }

      s.gray = true; s.line = false; s.k = levels; s.black.protectSkin = false;
      return {
        init: function () { bind(); renderLessons(); syncControls(); },
        recolor: recolor, computeLinePreview: computeLine, extractAndRecolor: extract,
        setMode: setMode, applyImage: applyImage, updateModeUi: syncControls, applyView: applyView,
        selectPalette: selectPalette, fitCanvas: fitCanvas,
        renderBlockForSave: renderBlockForSave, renderLineForSave: renderLineForSave,
        renderFullRes: renderFullRes, exportLineOriginal: exportLineOriginal,
        renderBatch: renderBatch,
        deleteSelectedColor: function () { s.indices = null; idxKey = ''; old.deleteSelectedColor(); syncControls(); },
        addSmartColor: function () { s.indices = null; idxKey = ''; old.addSmartColor(); syncControls(); },
        inspect: function () { return { mode: mode, levels: levels, dark: dark, light: light, lock: lock, blackOnly: blackOnly,
          strokes: clone(strokes), undo: undo.length, redo: redo.length, hasA: !!compare, showA: showA, zoom: zoom,
          lesson: activeLesson && activeLesson.id, lessonStep: lessonStep,
          indicesCount: s.indices ? s.indices.length : 0 }; },
        test: { setMode: setMode, undo: undoStep, redo: redoStep, settle: settle,
          indices: function () { return s.indices ? Array.from(s.indices) : null; },
          stroke: function (st) { if (!s.line) throw new Error('Choose line or black'); strokes[mode].push(clone(st)); computeLine(); },
          values: function (n, d, l) { levels = n; dark = d; light = l; s.k = n; s.palette = core.defaultValuePalette(n); s.indices = null; idxKey = ''; render(); syncControls(); },
          remap: function () { s.indices = null; idxKey = ''; render(); },
          lesson: function (id) { var found = (root.ColorBlockLessons || []).find(function (item) { return item.id === id; }); if (found) loadLesson(found); }
        }
      };
    }
  };
})(window);
