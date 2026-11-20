/* Small native color picker and reference-panel divider. No external assets. */
(function (root) {
  'use strict';
  var clamp = function (n, lo, hi) { return Math.max(lo, Math.min(hi, n)); };
  function normalize(value) {
    if (typeof value !== 'string') return null;
    value = value.trim().toLowerCase(); if (value[0] !== '#') value = '#' + value;
    if (/^#[0-9a-f]{3}$/.test(value)) value = '#' + value.slice(1).split('').map(function (v) { return v + v; }).join('');
    return /^#[0-9a-f]{6}$/.test(value) ? value : null;
  }
  function toHex(rgb) { return '#' + rgb.map(function (v) { return clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0'); }).join(''); }
  function hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360; s = clamp(s, 0, 1); v = clamp(v, 0, 1);
    var c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    var values = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return values.map(function (n) { return Math.round((n + m) * 255); });
  }
  function rgbToHsv(rgb, previousHue, previousSaturation) {
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, h = previousHue || 0;
    if (delta) h = 60 * (max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4);
    return { h: ((h % 360) + 360) % 360, s: max ? delta / max : (previousSaturation == null ? 0 : previousSaturation), v: max };
  }
  function create(options) {
    options = options || {};
    var host = options.host;
    if (!host || !host.appendChild) throw new Error('调色盘需要一个有效的容器。');
    var doc = host.ownerDocument, view = doc.defaultView || root, node = doc.createElement('div');
    node.className = 'dcc-picker';
    node.innerHTML = '<div class="dcc-plane" data-dcc="plane" tabindex="0" role="slider" aria-label="调色盘饱和度与明亮度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
      '<canvas width="256" height="166" aria-hidden="true"></canvas><span class="dcc-dot" aria-hidden="true"></span></div>' +
      '<div class="dcc-hue" data-dcc="hue" tabindex="0" role="slider" aria-label="调色盘色相" aria-valuemin="0" aria-valuemax="359" aria-valuenow="0">' +
      '<canvas width="360" height="18" aria-hidden="true"></canvas><span class="dcc-hue-marker" aria-hidden="true"></span></div>' +
      '<div class="dcc-readout"><span data-dcc="preview" class="dcc-preview" aria-hidden="true"></span><span data-dcc="values"></span></div>' +
      '<div class="dcc-inputs"><label class="dcc-hex-label">HEX<input data-dcc="hex" type="text" maxlength="7" spellcheck="false" autocomplete="off" aria-label="调色盘HEX"></label>' +
      '<label>R<input data-dcc="r" type="number" min="0" max="255" step="1" inputmode="numeric" aria-label="调色盘红色分量"></label>' +
      '<label>G<input data-dcc="g" type="number" min="0" max="255" step="1" inputmode="numeric" aria-label="调色盘绿色分量"></label>' +
      '<label>B<input data-dcc="b" type="number" min="0" max="255" step="1" inputmode="numeric" aria-label="调色盘蓝色分量"></label></div>' +
      '<p class="dcc-instructions">横向调浓淡，纵向调明亮。方向键微调，Shift 加快。</p><p class="dcc-error" data-dcc="error" role="status" hidden></p>';
    host.appendChild(node);
    var query = function (name) { return node.querySelector('[data-dcc="' + name + '"]'); };
    var plane = query('plane'), hue = query('hue'), hexInput = query('hex'), rgbInputs = ['r', 'g', 'b'].map(query);
    var planeCanvas = plane.querySelector('canvas'), hueCanvas = hue.querySelector('canvas');
    var dot = plane.querySelector('.dcc-dot'), hueMarker = hue.querySelector('.dcc-hue-marker');
    var current = '#263544', hsv = { h: 210, s: 0.44, v: 0.27 }, pointer = null, dead = false, listeners = [], lastPaintedHue = -1;
    function bind(target, name, fn, settings) { target.addEventListener(name, fn, settings); listeners.push(function () { target.removeEventListener(name, fn, settings); }); }
    function disabled() { return dead || !!(options.getDisabled && options.getDisabled()); }
    function error(message, input) {
      query('error').textContent = message || ''; query('error').hidden = !message;
      [hexInput].concat(rgbInputs).forEach(function (field) { field.removeAttribute('aria-invalid'); if (field.setCustomValidity) field.setCustomValidity(''); });
      if (input && message) { input.setAttribute('aria-invalid', 'true'); if (input.setCustomValidity) input.setCustomValidity(message); }
    }
    function paintHue() {
      var ctx = hueCanvas.getContext('2d'), gradient = ctx.createLinearGradient(0, 0, 360, 0);
      ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'].forEach(function (color, i) { gradient.addColorStop(i / 6, color); });
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, 360, 18);
    }
    function paintPlane() {
      if (Math.abs(lastPaintedHue - hsv.h) < 0.001) return;
      lastPaintedHue = hsv.h;
      var ctx = planeCanvas.getContext('2d'), w = planeCanvas.width, h = planeCanvas.height;
      ctx.fillStyle = toHex(hsvToRgb(hsv.h, 1, 1)); ctx.fillRect(0, 0, w, h);
      var white = ctx.createLinearGradient(0, 0, w, 0); white.addColorStop(0, '#ffffff'); white.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = white; ctx.fillRect(0, 0, w, h);
      var black = ctx.createLinearGradient(0, 0, 0, h); black.addColorStop(0, 'rgba(0,0,0,0)'); black.addColorStop(1, '#000000');
      ctx.fillStyle = black; ctx.fillRect(0, 0, w, h);
    }
    function render() {
      paintPlane();
      dot.style.left = (hsv.s * 100) + '%'; dot.style.top = ((1 - hsv.v) * 100) + '%';
      hueMarker.style.left = (hsv.h / 360 * 100) + '%';
      var h = Math.round(hsv.h), s = Math.round(hsv.s * 100), v = Math.round(hsv.v * 100);
      plane.setAttribute('aria-valuenow', String(s)); plane.setAttribute('aria-valuetext', '色相 ' + h + ' 度，饱和度 ' + s + '%，明亮度 ' + v + '%；左右调整饱和度，上下调整明亮度');
      hue.setAttribute('aria-valuenow', String(Math.min(359, h))); hue.setAttribute('aria-valuetext', h + ' 度');
      query('values').textContent = 'H ' + h + '° · S ' + s + '% · V ' + v + '%'; query('preview').style.background = current;
      hexInput.value = current.toUpperCase();
      var rgb = [1, 3, 5].map(function (at) { return parseInt(current.slice(at, at + 2), 16); });
      rgbInputs.forEach(function (input, index) { input.value = rgb[index]; });
    }
    function publish(source, commit) {
      current = toHex(hsvToRgb(hsv.h, hsv.s, hsv.v)); error(''); render();
      if (options.onChange) options.onChange(current, { source: source, commit: !!commit });
    }
    function setColor(value) {
      var normalized = normalize(value); if (!normalized || dead) return false;
      // External echoes cannot erase the selected hue at black/white or cause loops.
      if (normalized !== current) {
        current = normalized;
        hsv = rgbToHsv([1, 3, 5].map(function (at) { return parseInt(current.slice(at, at + 2), 16); }), hsv.h, hsv.s);
      }
      error(''); render(); return true;
    }
    function sample(event, kind) {
      var target = kind === 'hue' ? hue : plane, rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var x = clamp((event.clientX - rect.left) / rect.width, 0, 1), y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      if (kind === 'hue') hsv.h = Math.min(359.999, x * 360);
      else { hsv.s = x; hsv.v = 1 - y; }
      publish(kind, false);
    }
    function end(event) {
      if (!pointer || (event && event.pointerId != null && event.pointerId !== pointer.id)) return;
      if (event && event.type === 'pointerup' && !disabled()) sample(event, pointer.kind);
      var active = pointer; pointer = null;
      if (active.target.hasPointerCapture && active.target.hasPointerCapture(active.id)) try { active.target.releasePointerCapture(active.id); } catch (_) {}
      if (!dead && options.onChange) options.onChange(current, { source: active.kind, commit: true });
    }
    [plane, hue].forEach(function (target) {
      var kind = target === hue ? 'hue' : 'plane';
      bind(target, 'pointerdown', function (event) {
        if (disabled() || pointer || event.button !== 0) return;
        event.preventDefault(); event.stopPropagation(); target.focus({ preventScroll: true });
        pointer = { id: event.pointerId, target: target, kind: kind };
        if (target.setPointerCapture) try { target.setPointerCapture(event.pointerId); } catch (_) {}
        sample(event, kind);
      });
      bind(target, 'pointermove', function (event) { if (pointer && pointer.id === event.pointerId && !disabled()) { event.preventDefault(); sample(event, pointer.kind); } });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) { bind(target, name, end); });
      bind(target, 'keydown', function (event) {
        if (disabled() || event.ctrlKey || event.metaKey || event.altKey) return;
        var key = event.key, step = event.shiftKey ? 0.1 : 0.01;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].indexOf(key) < 0) return;
        event.preventDefault(); event.stopPropagation();
        if (kind === 'hue') {
          var degrees = event.shiftKey ? 15 : 1;
          if (key === 'Home') hsv.h = 0;
          else if (key === 'End') hsv.h = 359;
          else hsv.h = (hsv.h + (['ArrowLeft', 'ArrowDown', 'PageDown'].indexOf(key) >= 0 ? -degrees : degrees) + 360) % 360;
        } else if (key === 'Home') hsv.s = 0;
        else if (key === 'End') hsv.s = 1;
        else if (key === 'ArrowLeft') hsv.s = clamp(hsv.s - step, 0, 1);
        else if (key === 'ArrowRight') hsv.s = clamp(hsv.s + step, 0, 1);
        else hsv.v = clamp(hsv.v + (key === 'ArrowDown' || key === 'PageDown' ? -step : step), 0, 1);
        publish(kind, true);
      });
    });
    bind(view, 'blur', function () { end(); });
    bind(doc, 'visibilitychange', function () { if (doc.hidden) end(); });
    function commitHex() {
      if (disabled()) return;
      var normalized = normalize(hexInput.value);
      if (!normalized) { error('请输入 #RRGGBB 或 #RGB，例如 #3F789C。', hexInput); return; }
      setColor(normalized); if (options.onChange) options.onChange(current, { source: 'hex', commit: true });
    }
    bind(hexInput, 'change', commitHex);
    bind(hexInput, 'keydown', function (event) { if (event.key === 'Enter') { event.preventDefault(); commitHex(); } else if (event.key === 'Escape') { setColor(current); hexInput.blur(); } });
    function rgbChanged(input, commit) {
      if (disabled()) return;
      var values = rgbInputs.map(function (field) { return field.value; });
      if (values.some(function (value) { return !/^\d{1,3}$/.test(value) || +value > 255; })) { if (commit) error('R、G、B 都需要是 0–255 的整数。', input); return; }
      setColor(toHex(values.map(Number))); if (options.onChange) options.onChange(current, { source: 'rgb', commit: commit });
    }
    rgbInputs.forEach(function (input) { bind(input, 'input', function () { rgbChanged(input, false); }); bind(input, 'change', function () { rgbChanged(input, true); }); });
    paintHue();
    var initial = normalize(options.getColor ? options.getColor() : '#263544') || '#263544';
    current = ''; setColor(initial);
    return { setColor: setColor, getColor: function () { return current; }, getHSV: function () { return { h: hsv.h, s: hsv.s, v: hsv.v }; },
      destroy: function () { if (dead) return; dead = true; end(); listeners.forEach(function (remove) { remove(); }); node.remove(); } };
  }
  function installReferenceSplitter(options) {
    options = options || {};
    var workspace = options.workspace, panel = options.panel, handle = options.handle;
    if (!workspace || !panel || !handle) throw new Error('参考分隔条需要工作区、面板和拖动手柄。');
    var doc = panel.ownerDocument, view = doc.defaultView || root, active = null, frame = 0, listeners = [], dead = false, width = 0, observer;
    panel.classList.add('dcc-reference-host'); handle.classList.add('dcc-splitter');
    handle.tabIndex = 0; handle.setAttribute('role', 'separator'); handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('aria-label', '参考区宽度，左右拖动或使用方向键调整'); handle.title = '拖动调整参考区宽度 · 左右键微调 · Home / End';
    if (panel.id) handle.setAttribute('aria-controls', panel.id);
    function bind(target, name, fn, settings) { target.addEventListener(name, fn, settings); listeners.push(function () { target.removeEventListener(name, fn, settings); }); }
    function getWidth() { var actual = panel.getBoundingClientRect().width; return Math.round(actual > 0 ? actual : width || parseFloat(view.getComputedStyle(panel).width) || 286); }
    function getBounds() {
      var space = workspace.getBoundingClientRect().width || view.innerWidth || 1024;
      var position = view.getComputedStyle(panel).position, overlay = position === 'absolute' || position === 'fixed', others = 0;
      if (!overlay) Array.from(workspace.children).forEach(function (child) {
        if (child === panel || child === handle) return;
        var style = view.getComputedStyle(child);
        if (style.display === 'none' || style.position === 'absolute' || style.position === 'fixed' || +style.flexGrow > 0) return;
        others += child.getBoundingClientRect().width;
      });
      var reserve = overlay ? 48 : Math.min(340, Math.max(220, space * 0.28));
      var max = Math.round(Math.max(120, Math.min(720, space - others - reserve))), min = Math.min(200, max);
      return { min: min, max: max };
    }
    function attrs(bounds) { handle.setAttribute('aria-valuemin', String(bounds.min)); handle.setAttribute('aria-valuemax', String(bounds.max)); handle.setAttribute('aria-valuenow', String(width)); handle.setAttribute('aria-valuetext', width + ' 像素'); }
    function emit(phase, previous) { if (options.onResize) options.onResize(width, { phase: phase, previousWidth: previous, delta: width - previous }); }
    function setWidth(value, phase) {
      if (dead) return getWidth();
      var bounds = getBounds(), previous = getWidth();
      width = Math.round(clamp(Number.isFinite(+value) ? +value : previous, bounds.min, bounds.max));
      workspace.style.setProperty('--ref-width', width + 'px'); attrs(bounds); emit(phase || 'api', previous); return width;
    }
    function disabled() { return dead || handle.getAttribute('aria-disabled') === 'true' || !!(options.getDisabled && options.getDisabled()); }
    function flush() { frame = 0; if (active && !disabled()) setWidth(active.width + active.lastX - active.x, 'move'); }
    function end(event) {
      if (!active || (event && event.pointerId != null && event.pointerId !== active.id)) return;
      if (event && event.type === 'pointerup' && Number.isFinite(event.clientX)) active.lastX = event.clientX;
      if (frame) { view.cancelAnimationFrame(frame); frame = 0; }
      flush();
      var captured = active; active = null; doc.body.classList.remove('dcc-resizing-reference');
      if (handle.hasPointerCapture && handle.hasPointerCapture(captured.id)) try { handle.releasePointerCapture(captured.id); } catch (_) {}
      emit('end', width);
    }
    bind(handle, 'pointerdown', function (event) {
      if (disabled() || active || event.button !== 0) return;
      event.preventDefault(); event.stopPropagation(); handle.focus({ preventScroll: true });
      width = getWidth(); active = { id: event.pointerId, x: event.clientX, lastX: event.clientX, width: width };
      doc.body.classList.add('dcc-resizing-reference');
      if (handle.setPointerCapture) try { handle.setPointerCapture(event.pointerId); } catch (_) {}
      emit('start', width);
    });
    bind(handle, 'pointermove', function (event) { if (active && active.id === event.pointerId && !disabled()) { event.preventDefault(); active.lastX = event.clientX; if (!frame) frame = view.requestAnimationFrame(flush); } });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) { bind(handle, name, end); });
    bind(view, 'blur', function () { end(); });
    bind(doc, 'visibilitychange', function () { if (doc.hidden) end(); });
    bind(handle, 'keydown', function (event) {
      if (disabled() || event.ctrlKey || event.metaKey || event.altKey) return;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) < 0) return;
      event.preventDefault(); event.stopPropagation(); var bounds = getBounds(), step = event.shiftKey ? 40 : 10;
      setWidth(event.key === 'Home' ? bounds.min : event.key === 'End' ? bounds.max : getWidth() + (event.key === 'ArrowLeft' ? -step : step), 'keyboard');
    });
    function refresh() { if (!dead && !active) setWidth(getWidth(), 'resize'); }
    bind(view, 'resize', refresh);
    if (view.ResizeObserver) { observer = new view.ResizeObserver(refresh); observer.observe(workspace); }
    width = getWidth(); var initialBounds = getBounds(); width = Math.round(clamp(width, initialBounds.min, initialBounds.max)); attrs(initialBounds);
    return { setWidth: setWidth, getWidth: getWidth, getBounds: getBounds, refresh: refresh, isDragging: function () { return !!active; },
      destroy: function () { if (dead) return; end(); dead = true; listeners.forEach(function (remove) { remove(); }); if (observer) observer.disconnect(); panel.classList.remove('dcc-reference-host'); handle.classList.remove('dcc-splitter'); } };
  }
  root.DrawingColorControls = { create: create, installReferenceSplitter: installReferenceSplitter, colorMath: { normalize: normalize, hsvToRgb: hsvToRgb, rgbToHsv: rgbToHsv } };
})(window);
