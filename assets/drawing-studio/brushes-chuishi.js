/* Native Canvas adaptations of the supplied brush archives. The source values
 * and embedded masks are retained in the data modules. Missing Procreate stock
 * assets, speed calibration, wet transfer and dual blend enums are approximated;
 * this is deliberately not a Procreate renderer. No network/runtime dependency. */
(function (root, factory) {
  'use strict';
  var common = typeof module === 'object' && module.exports;
  var api = factory(common ? require('./brushes-chuishi-data.js') : root.DrawingChuishiData,
    common ? require('./brushes-haiguai-data.js') : root.DrawingHaiguaiData,
    common ? require('./brushes-dongdong-data.js') : root.DrawingDongdongData);
  if (common) module.exports = api;
  if (root) root.DrawingChuishiBrushes = api;
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null, function () {
  'use strict';
  var presets = [], masks = {}, maskCache = new Map(), tintCache = new Map(), grainCache = new Map(), curveCache = new WeakMap();
  for (var d = 0; d < arguments.length; d++) if (arguments[d]) {
    presets = presets.concat(arguments[d].brushes || []);
    Object.assign(masks, arguments[d].masks || {});
  }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function num(n, fallback) { return Number.isFinite(Number(n)) ? Number(n) : fallback; }
  function val(s, key, fallback) { return num(s[key], fallback === undefined ? 0 : fallback); }
  function bounded(cache, key, value, limit) {
    if (cache.has(key)) cache.delete(key);
    cache.set(key, value);
    while (cache.size > limit) cache.delete(cache.keys().next().value);
    return value;
  }
  function cached(cache, key) {
    var value = cache.get(key);
    if (value) { cache.delete(key); cache.set(key, value); }
    return value;
  }
  function canvas(ctx, w, h) {
    var out;
    if (ctx.canvas.ownerDocument) out = ctx.canvas.ownerDocument.createElement('canvas');
    else if (typeof OffscreenCanvas !== 'undefined') out = new OffscreenCanvas(w, h);
    else out = new ctx.canvas.constructor(w, h);
    out.width = w; out.height = h; return out;
  }
  function paint(out) { return out.getContext('2d', { willReadFrequently: true }); }
  function hashString(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function noise(x, y, seed) {
    var h = Math.imul(x + 713, 374761393) ^ Math.imul(y + 193, 668265263) ^ seed;
    h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function curve(curveValue, p) {
    var original = Array.isArray(curveValue) ? curveValue : curveValue && curveValue.xy;
    var points = original && curveCache.get(original);
    if (!points && original) {
      // NSKeyedArchiver sometimes lists the end point before interior knots.
      // Sort a copy, preserving the source evidence in the data module.
      points = original.slice().sort(function (a, b) { return a[0] - b[0]; }); curveCache.set(original, points);
    }
    if (!points || points.length < 2) return p;
    for (var i = 1; i < points.length; i++) if (p <= points[i][0]) {
      var a = points[i - 1], b = points[i], t = (p - a[0]) / Math.max(1e-9, b[0] - a[0]);
      return clamp(a[1] + (b[1] - a[1]) * t, 0, 1);
    }
    return clamp(points[points.length - 1][1], 0, 1);
  }
  function decodeMask(ctx, key) {
    var hit = cached(maskCache, key); if (hit) return hit;
    var source = masks[key]; if (!source) return null;
    var w = source.width, h = source.height;
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 256 || h > 256) throw new Error('笔刷蒙版尺寸无效。');
    var encoded = typeof atob === 'function' ? atob(source.data) : Buffer.from(source.data, 'base64').toString('binary');
    var out = canvas(ctx, w, h), p = paint(out), image = p.createImageData(w, h), cursor = 0;
    for (var i = 0; i < encoded.length; i += 2) {
      var run = encoded.charCodeAt(i), alpha = encoded.charCodeAt(i + 1);
      if (!run || !Number.isFinite(alpha) || cursor + run > w * h) throw new Error('笔刷蒙版数据无效。');
      for (var j = 0; j < run; j++, cursor++) {
        image.data[cursor * 4] = image.data[cursor * 4 + 1] = image.data[cursor * 4 + 2] = 255;
        image.data[cursor * 4 + 3] = alpha;
      }
    }
    if (cursor !== w * h) throw new Error('笔刷蒙版数据不完整。');
    p.putImageData(image, 0, 0); return bounded(maskCache, key, out, 20);
  }
  function shape(ctx, brush) {
    if (brush.mask) return decodeMask(ctx, brush.mask);
    var name = brush.shapeFallback || brush.source.bundledShapePath || 'Brush-Preset-Hard.png', key = 'shape:' + name;
    var hit = cached(maskCache, key); if (hit) return hit;
    var side = 128, out = canvas(ctx, side, side), p = paint(out), image = p.createImageData(side, side), seed = hashString(name);
    var soft = /Ultra-Soft|Intense-Water/i.test(name), medium = /Medium-Hard/i.test(name);
    var round = /(?:Preset-Hard|Small-Point)/i.test(name), oval = /Oval/i.test(name);
    var brick = /Brick|Acrylic-Dab|Flat-Brush|Calligraphy/i.test(name), flat = /Flat-Brush|Calligraphy/i.test(name);
    var dots = /Weary-Dots/i.test(name), scribble = /Scribble|Distressed/i.test(name);
    var spots = [];
    if (dots) for (var q = 0; q < 39; q++) {
      var theta = noise(q, 0, seed) * Math.PI * 2, r = Math.sqrt(noise(q, 1, seed)) * .83;
      spots.push([Math.cos(theta) * r, Math.sin(theta) * r, .022 + .078 * noise(q, 2, seed)]);
    }
    for (var y = 0; y < side; y++) for (var x = 0; x < side; x++) {
      var u = (x + .5 - side / 2) / (side / 2), v = (y + .5 - side / 2) / (side / 2);
      var radius = Math.hypot(u, v), fine = noise(x, y, seed), coarse = noise(x >> 2, y >> 2, seed), a;
      if (soft) a = Math.pow(Math.max(0, 1 - radius), 2.8);
      else if (medium) a = clamp((1 - radius) / .23, 0, 1);
      else if (round) a = clamp((.97 - radius) * side / 2, 0, 1);
      else if (oval) a = clamp((1 - Math.hypot(u, v / .58)) * side / 2, 0, 1);
      else if (dots) {
        a = 0;
        for (var k = 0; k < spots.length; k++) a = Math.max(a, clamp((spots[k][2] - Math.hypot(u - spots[k][0], v - spots[k][1])) * side / 2, 0, 1));
      } else if (brick) {
        var yy = /Calligraphy/i.test(name) ? (v + u * .38) : v;
        var depth = flat ? .33 : .70;
        var edge = Math.min(.90 - Math.abs(u), depth + .055 * Math.sin(x * 1.7) + .05 * coarse - Math.abs(yy));
        a = clamp(edge * 28, 0, 1) * (.68 + .32 * fine);
      } else {
        var edgeNoise = .065 * Math.sin(Math.atan2(v, u) * 11) + .07 * coarse;
        var squash = /Chinese|Ink2|Paint-Dab/i.test(name) ? .70 : .86;
        a = clamp((.89 + edgeNoise - Math.hypot(u, v / squash)) * 25, 0, 1);
        a *= scribble ? (fine < .17 ? 0 : .48 + .52 * fine) : (.72 + .28 * fine);
      }
      var index = (y * side + x) * 4;
      image.data[index] = image.data[index + 1] = image.data[index + 2] = 255; image.data[index + 3] = Math.round(255 * a);
    }
    p.putImageData(image, 0, 0); return bounded(maskCache, key, out, 20);
  }
  function colorShape(ctx, brush, color, diameter) {
    var resolution = clamp(Math.ceil(diameter * 1.25 / 8) * 8, 8, 192);
    var key = (brush.mask || brush.shapeFallback || brush.source.bundledShapePath) + ':' + color + ':' + resolution;
    var hit = cached(tintCache, key); if (hit) return hit;
    var mask = shape(ctx, brush), ratio = resolution / Math.max(mask.width, mask.height);
    var out = canvas(ctx, Math.max(1, Math.round(mask.width * ratio)), Math.max(1, Math.round(mask.height * ratio))), p = paint(out);
    p.fillStyle = color; p.fillRect(0, 0, out.width, out.height); p.globalCompositeOperation = 'destination-in'; p.drawImage(mask, 0, 0, out.width, out.height);
    return bounded(tintCache, key, out, 12);
  }
  function dotContact(ctx, brush) {
    var mask = shape(ctx, brush);
    if (mask.dotContact !== undefined) return mask.dotContact;
    // The six dots lie in a horizontal row in the supplied mask, which turns
    // perpendicular to travel. Their ink contact length is one dot's vertical
    // alpha integral, not the width of the entire six-dot bounding box.
    var pixels = paint(mask).getImageData(0, 0, mask.width, mask.height).data, longest = 0;
    for (var x = 0; x < mask.width; x++) {
      var sum = 0;
      for (var y = 0; y < mask.height; y++) sum += pixels[(y * mask.width + x) * 4 + 3] / 255;
      longest = Math.max(longest, sum);
    }
    mask.dotContact = clamp(longest / Math.max(mask.width, mask.height), .001, 1);
    return mask.dotContact;
  }
  function grain(ctx, brush) {
    var s = brush.source, name = brush.grainFallback || s.bundledGrainPath || '';
    if (!brush.grainMask && (!name || /Blank/i.test(name))) return null;
    var key = (brush.grainMask || name) + ':' + [s.grainDepth, s.textureContrast, s.textureBrightness, s.textureInverted].join(':');
    var hit = cached(grainCache, key); if (hit) return hit;
    var side = 128, out = canvas(ctx, side, side), p = paint(out), image = p.createImageData(side, side), seed = hashString(name);
    var original = brush.grainMask ? decodeMask(ctx, brush.grainMask) : null, raw;
    if (original) { p.drawImage(original, 0, 0, side, side); raw = p.getImageData(0, 0, side, side).data; }
    var depth = clamp(val(s, 'grainDepth', 1), 0, 1), contrast = clamp(val(s, 'textureContrast'), -1, 1), brightness = clamp(val(s, 'textureBrightness'), -1, 1);
    for (var y = 0; y < side; y++) for (var x = 0; x < side; x++) {
      var fine = noise(x, y, seed), coarse = noise(x >> 2, y >> 2, seed), n;
      if (raw) n = raw[(y * side + x) * 4 + 3] / 255;
      else if (/Thread/i.test(name)) n = .42 + .28 * Math.sin(x * .93 + .5 * Math.sin(y * .35)) + .30 * fine;
      else if (/Glitch/i.test(name)) n = .18 + .48 * noise(x >> 3, y, seed) + .34 * fine;
      else if (/Gouache|Wash|Stain|Sponge/i.test(name)) n = .65 * coarse + .35 * fine;
      else if (/Charcoal|Bonobo|Oil-Pastel|Dirty/i.test(name)) n = .36 * coarse + .64 * fine;
      else n = .22 * coarse + .78 * fine;
      if (s.textureInverted) n = 1 - n;
      n = clamp((n - .5) * (1 + contrast * .85) + .5 + brightness * .22, 0, 1);
      // Fixed paper holes survive overlapping dabs. Semitransparent tooth alone
      // would fill to solid ink with the source's nearly-zero stamp spacing.
      var threshold = .10 + depth * .22, alpha = n < threshold ? 0 : 1;
      var i = (y * side + x) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = 255; image.data[i + 3] = Math.round(alpha * 255);
    }
    out.grainAlpha = new Uint8Array(side * side);
    for (var g = 0; g < out.grainAlpha.length; g++) out.grainAlpha[g] = image.data[g * 4 + 3];
    p.putImageData(image, 0, 0); return bounded(grainCache, key, out, 14);
  }
  function rgba(color) {
    var match = /^#([0-9a-f]{6})$/i.exec(color), packed = match ? parseInt(match[1], 16) : 0x20242b;
    return [packed >> 16, (packed >> 8) & 255, packed & 255];
  }
  function css(rgb) { return 'rgb(' + rgb.map(function (n) { return Math.round(clamp(n, 0, 255)); }).join(',') + ')'; }
  function makeStroke(ctx, options) {
    options = options || {};
    var preset = presets.find(function (p) { return p.id === options.brush; });
    if (!preset) throw new Error('找不到这支导入笔刷。');
    var source = preset.source, size = clamp(num(options.size, preset.size), .5, 512), stabilizer = clamp(num(options.stabilizer, 0), 0, 100);
    var color = options.color || '#20242b', pressureEnabled = options.pressure !== false, ink = rgba(color), carried = ink.slice();
    var glow = preset.id === 'haiguai-glow-airbrush', outline = /^haiguai-outline/.test(preset.id);
    var bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }, dirty = null, textureDirty = null;
    var last = null, lastRaw = null, lastDab = null, finished = false, untilDab = 0, angle = 0, seed = 1, travel = 0;
    var components = [preset];
    if (preset.secondary && !outline) components.push(preset.secondary);
    var work = null, workPaint = null;
    var componentState = components.map(function (b) {
      var texture = grain(ctx, b);
      var s = b.source, scale = clamp(.25 + Math.sqrt(Math.max(0, val(s, 'textureScale', 1))) * .72, .28, 3.5);
      scale *= Math.pow(clamp(size / 32, .25, 8), .35 * clamp(val(s, 'textureZoom', 1), 0, 1));
      return { brush: b, tip: colorShape(ctx, b, color, size), texture: texture, grainScale: scale, pattern: null,
        contact: /hatching/.test(preset.id) ? dotContact(ctx, b) : .62 };
    });
    var paperStates = componentState.filter(function (state) { return !!state.texture; });
    // Only hollow brushes retain inner geometry. Six numbers per segment plus
    // spatial index, not another document-sized raster. Ordinary brushes do not.
    var inner = outline ? [] : null, innerGrid = outline ? new Map() : null;
    var innerRatio = outline ? clamp(val(preset.secondary.source, 'maxSize', .5) / Math.max(.001, val(source, 'maxSize', 1)), .05, .97) : 0;
    // The shared stroke canvas must remain neutral for the next tool.
    // Additive glow is scoped to each saved/restored dab below.
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = true;
    function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
    function include(l, t, r, b) {
      bounds.left = Math.min(bounds.left, l); bounds.top = Math.min(bounds.top, t); bounds.right = Math.max(bounds.right, r); bounds.bottom = Math.max(bounds.bottom, b);
      if (!preset.samplesLayer && !outline) {
        if (!textureDirty) textureDirty = { left: l, top: t, right: r, bottom: b };
        else { textureDirty.left = Math.min(textureDirty.left, l); textureDirty.top = Math.min(textureDirty.top, t); textureDirty.right = Math.max(textureDirty.right, r); textureDirty.bottom = Math.max(textureDirty.bottom, b); }
      }
    }
    function point(p, ending) {
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
      var pen = p.pointerType === 'pen', force = clamp(num(p.pressure, .5), 0, 1);
      if (!pen || !pressureEnabled) force = 1;
      else if (force <= 0) force = ending && last ? last.pressure : .03;
      return { x: p.x, y: p.y, pressure: force, time: num(p.time, num(p.timeStamp, NaN)),
        tiltX: pen ? clamp(num(p.tiltX, 0), -89, 89) : 0, tiltY: pen ? clamp(num(p.tiltY, 0), -89, 89) : 0 };
    }
    function tilt(p) { return clamp(Math.hypot(p.tiltX, p.tiltY) / 75, 0, 1); }
    function speedFactor(s, key, speed) {
      var amount = clamp(val(s, key), -1, 1), fast = speed / (speed + .18 + size * .018);
      return 1 - Math.abs(amount) * .88 * (amount >= 0 ? fast : 1 - fast);
    }
    function diameter(b, p, speed) {
      var s = b.source, force = curve(s.dynamicsPressureSizeCurve, p.pressure), amount = clamp(val(s, 'dynamicsPressureSize'), -1, 1);
      var minimum = clamp(val(s, 'minSize') / Math.max(.001, val(s, 'maxSize', 1)), .025, .8);
      var response = amount >= 0 ? force : 1 - force;
      var factor = 1 - Math.abs(amount) * (1 - minimum) * (1 - response);
      factor *= speedFactor(s, 'dynamicsSpeedSize', speed);
      factor *= 1 + clamp(val(s, 'dynamicsTiltSize'), -1, 1) * tilt(p);
      return clamp(size * factor, .35, 640);
    }
    function opacityAt(s, p, speed) {
      var amount = clamp(val(s, 'dynamicsPressureOpacity'), -1, 1), pressure = curve(s.dynamicsPressureOpacityCurve, p.pressure);
      var response = amount >= 0 ? pressure : 1 - pressure;
      var opacity = (1 - Math.abs(amount) * (1 - response)) * speedFactor(s, 'dynamicsSpeedOpacity', speed);
      opacity *= 1 - clamp(val(s, 'dynamicsTiltOpacity'), 0, 1) * tilt(p) * .82;
      return clamp(opacity, Math.max(.005, val(s, 'minOpacity')), Math.max(.005, val(s, 'maxOpacity', 1)));
    }
    function spacing(b, diameter) {
      // Archive spacing approaches zero in many presets. Canvas uses a 4%
      // minimum with distance-normalized flow to avoid thousands of redundant
      // bitmap copies per short stroke. Six-dot tips need closer sampling.
      var s = b.source, ratio = clamp(.04 + Math.sqrt(Math.max(0, val(s, 'plotSpacing'))) * .28, .04, .18);
      if (/hatching/.test(preset.id)) ratio = .006;
      return Math.max(.20, diameter * ratio);
    }
    function pickColor(p, d, direction, distance) {
      var amount = clamp(val(source, 'dynamicsMix'), 0, 1); if (!preset.samplesLayer || !amount) return color;
      var ahead = d * .30, x = Math.round(p.x + Math.cos(direction) * ahead), y = Math.round(p.y + Math.sin(direction) * ahead);
      var left = clamp(x - 2, 0, ctx.canvas.width), top = clamp(y - 2, 0, ctx.canvas.height);
      var w = Math.min(5, ctx.canvas.width - left), h = Math.min(5, ctx.canvas.height - top);
      if (w > 0 && h > 0) {
        var pixels = ctx.getImageData(left, top, w, h).data, sum = 0, rgb = [0, 0, 0];
        for (var i = 0; i < pixels.length; i += 4) { var a = pixels[i + 3] / 255; sum += a; for (var k = 0; k < 3; k++) rgb[k] += pixels[i + k] * a; }
        var uptake = (1 - Math.exp(-Math.max(.25, distance) / Math.max(.5, d * .32))) * amount * (sum / (w * h));
        if (sum) for (var c = 0; c < 3; c++) carried[c] += (rgb[c] / sum - carried[c]) * uptake;
      }
      var reload = 1 - Math.exp(-Math.max(.1, distance) / Math.max(1, size * 10));
      for (var n = 0; n < 3; n++) carried[n] += (ink[n] - carried[n]) * reload;
      return css(carried);
    }
    function dab(p, speed, direction) {
      var mainDiameter = diameter(preset, p, speed), step = spacing(preset, mainDiameter), distance = lastDab ? Math.hypot(p.x - lastDab.x, p.y - lastDab.y) : step;
      travel += distance;
      var mixedColor = pickColor(p, mainDiameter, direction, distance);
      for (var component = 0; component < componentState.length; component++) {
        var state = componentState[component], b = state.brush, s = b.source;
        var d = diameter(b, p, speed) * (component ? .72 : 1), count = 1 + Math.min(3, Math.round(val(s, 'shapeCount') * 8));
        for (var copy = 0; copy < count; copy++) {
          var dd = d * (1 - clamp(val(s, 'dynamicsJitterSize'), 0, 1) * .45 * random());
          var rotation = val(s, 'shapeAngle') + direction * clamp(val(s, 'shapeRotation'), -1, 1);
          if (s.shapeAzimuth && Math.hypot(p.tiltX, p.tiltY) > 5) rotation = val(s, 'shapeAngle') + Math.atan2(Math.tan(p.tiltY * Math.PI / 180), Math.tan(p.tiltX * Math.PI / 180));
          rotation += (random() - .5) * Math.PI * clamp(val(s, 'shapeScatter'), 0, 2);
          var scatter = clamp(val(s, 'plotJitter'), 0, 2) * dd * .16;
          var x = p.x + (random() - .5) * scatter, y = p.y + (random() - .5) * scatter;
          var roundness = clamp(val(s, 'shapeRoundness', 1), .08, 1);
          var minRound = clamp(val(s, 'dynamicsPressureShapeRoundnessMinimum', 1), .08, 1);
          roundness *= minRound + (1 - minRound) * p.pressure;
          var tip = state.tip, longest = Math.max(tip.width, tip.height), sx = dd / longest, sy = sx * roundness;
          if (s.shapeFlipXJitter && random() < .5) sx = -sx;
          if (s.shapeFlipYJitter && random() < .5) sy = -sy;
          var alpha = opacityAt(s, p, speed) * (1 - clamp(val(s, 'dynamicsJitterOpacity'), 0, 1) * .45 * random());
          var contact = state.contact * (/hatching/.test(preset.id) ? roundness * count : 1);
          var target = clamp(alpha * .985, .004, .985), flow = 1 - Math.pow(1 - target, step / Math.max(.3, dd * contact));
          if (component) flow *= .42;
          if (glow) flow *= .45;
          var falling = val(s, 'dynamicsFalloff'); if (falling > 0) flow *= Math.exp(-travel * falling / Math.max(1, size * 8));
          if ((state.texture && preset.samplesLayer) || mixedColor !== color) {
            // Only paint that samples an existing layer needs per-dab masking.
            // Match its current screen-independent diameter, rather than
            // repeatedly cloning a 256px source for a 6px pen nib.
            var workSide = clamp(Math.ceil(dd * 1.5 / 8) * 8, 16, 128);
            var workWidth = Math.max(1, Math.round(workSide * tip.width / longest)), workHeight = Math.max(1, Math.round(workSide * tip.height / longest));
            if (!work) { work = canvas(ctx, workWidth, workHeight); workPaint = paint(work); }
            if (work.width !== workWidth || work.height !== workHeight) { work.width = workWidth; work.height = workHeight; }
            var localSx = sx * tip.width / work.width, localSy = sy * tip.height / work.height;
            workPaint.setTransform(1, 0, 0, 1, 0, 0); workPaint.globalCompositeOperation = 'source-over'; workPaint.globalAlpha = 1;
            workPaint.clearRect(0, 0, work.width, work.height);
            if (mixedColor !== color) {
              workPaint.drawImage(tip, 0, 0, work.width, work.height);
              workPaint.globalCompositeOperation = 'source-in'; workPaint.fillStyle = mixedColor; workPaint.fillRect(0, 0, work.width, work.height);
            } else workPaint.drawImage(tip, 0, 0, work.width, work.height);
            if (state.texture) {
              if (!state.pattern) state.pattern = workPaint.createPattern(state.texture, 'repeat');
              var scale = state.grainScale;
              var cosine = Math.cos(rotation), sine = Math.sin(rotation);
              if (state.pattern.setTransform) state.pattern.setTransform({ a: cosine * scale / localSx, b: -sine * scale / localSy, c: sine * scale / localSx, d: cosine * scale / localSy,
                e: work.width / 2 + (-cosine * x - sine * y) / localSx, f: work.height / 2 + (sine * x - cosine * y) / localSy });
              workPaint.globalCompositeOperation = 'destination-in'; workPaint.fillStyle = state.pattern; workPaint.fillRect(0, 0, work.width, work.height);
            }
            tip = work; sx = localSx; sy = localSy;
          }
          ctx.save(); ctx.globalAlpha = clamp(flow, 0, 1); ctx.globalCompositeOperation = glow ? 'lighter' : 'source-over';
          ctx.translate(x, y); ctx.rotate(rotation); ctx.scale(sx, sy); ctx.drawImage(tip, -tip.width / 2, -tip.height / 2); ctx.restore();
          var pad = Math.hypot(tip.width * sx, tip.height * sy) / 2 + 2;
          include(x - pad, y - pad, x + pad, y + pad);
        }
      }
      lastDab = p; return step;
    }
    function capsule(a, b, ra, rb) {
      var dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
      if (length) {
        var nx = -dy / length, ny = dx / length;
        ctx.moveTo(a.x + nx * ra, a.y + ny * ra); ctx.lineTo(a.x - nx * ra, a.y - ny * ra);
        ctx.lineTo(b.x - nx * rb, b.y - ny * rb); ctx.lineTo(b.x + nx * rb, b.y + ny * rb); ctx.closePath();
      }
      ctx.moveTo(a.x + ra, a.y); ctx.arc(a.x, a.y, ra, 0, Math.PI * 2);
      ctx.moveTo(b.x + rb, b.y); ctx.arc(b.x, b.y, rb, 0, Math.PI * 2);
    }
    function indexInner(item, index) {
      var radius = Math.max(item[4], item[5]) + 2;
      var left = Math.floor((Math.min(item[0], item[2]) - radius) / 128), right = Math.floor((Math.max(item[0], item[2]) + radius) / 128);
      var top = Math.floor((Math.min(item[1], item[3]) - radius) / 128), bottom = Math.floor((Math.max(item[1], item[3]) + radius) / 128);
      for (var y = top; y <= bottom; y++) for (var x = left; x <= right; x++) {
        var key = x + ':' + y, list = innerGrid.get(key); if (!list) { list = new Set(); innerGrid.set(key, list); } list.add(index);
      }
    }
    function outlineSegment(a, b, speed) {
      var ra = diameter(preset, a, speed) / 2, rb = diameter(preset, b, speed) / 2;
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = opacityAt(source, b, speed); ctx.fillStyle = color;
      ctx.beginPath(); capsule(a, b, ra, rb); ctx.fill(); ctx.restore();
      var pad = Math.max(ra, rb) + 2, box = { left: Math.min(a.x, b.x) - pad, top: Math.min(a.y, b.y) - pad, right: Math.max(a.x, b.x) + pad, bottom: Math.max(a.y, b.y) + pad };
      include(box.left, box.top, box.right, box.bottom);
      if (!dirty) dirty = box; else { dirty.left = Math.min(dirty.left, box.left); dirty.top = Math.min(dirty.top, box.top); dirty.right = Math.max(dirty.right, box.right); dirty.bottom = Math.max(dirty.bottom, box.bottom); }
      var item = [a.x, a.y, b.x, b.y, ra * innerRatio, rb * innerRatio];
      var previous = inner[inner.length - 1];
      if (previous && Math.hypot(previous[2] - item[0], previous[3] - item[1]) < 1e-6 && Math.abs(previous[5] - item[4]) < 1e-5) {
        var dx = item[2] - previous[0], dy = item[3] - previous[1], length = Math.hypot(dx, dy);
        var before = Math.hypot(item[0] - previous[0], item[1] - previous[1]);
        var deviation = length ? Math.abs((item[0] - previous[0]) * dy - (item[1] - previous[1]) * dx) / length : Infinity;
        if (length > before && deviation < .015 && Math.abs(item[4] - (previous[4] + (item[5] - previous[4]) * before / length)) < .005) {
          previous[2] = item[2]; previous[3] = item[3]; previous[5] = item[5]; indexInner(previous, inner.length - 1); return;
        }
      }
      inner.push(item); indexInner(item, inner.length - 1);
    }
    function applyPaper() {
      if (!textureDirty) return;
      var box = textureDirty; textureDirty = null;
      if (!paperStates.length || preset.samplesLayer) return;
      var left = clamp(Math.floor(box.left), 0, ctx.canvas.width), right = clamp(Math.ceil(box.right), 0, ctx.canvas.width);
      var top = clamp(Math.floor(box.top), 0, ctx.canvas.height), bottom = clamp(Math.ceil(box.bottom), 0, ctx.canvas.height);
      if (right <= left || bottom <= top) return;
      // A binary paper stencil is idempotent: rendering an additional pointer
      // event cannot progressively attenuate an earlier part of this stroke.
      // Chunked readback bounds transient storage even for a very long segment.
      for (var row = top; row < bottom; row += 128) {
        var image = ctx.getImageData(left, row, right - left, Math.min(128, bottom - row)), pixels = image.data;
        for (var yy = 0; yy < image.height; yy++) for (var xx = 0; xx < image.width; xx++) {
          var i = (yy * image.width + xx) * 4; if (!pixels[i + 3]) continue;
          var x = left + xx, y = row + yy;
          for (var k = 0; k < paperStates.length; k++) {
            var state = paperStates[k], tile = state.texture, scale = state.grainScale;
            var gx = ((Math.floor((x + .5) / scale) % tile.width) + tile.width) % tile.width;
            var gy = ((Math.floor((y + .5) / scale) % tile.height) + tile.height) % tile.height;
            // The second paper texture modulates the dual brush rather than
            // replacing the first; its proprietary blend enum is not guessed.
            if (!tile.grainAlpha[gy * tile.width + gx] && (!k || noise(x, y, 719) < .42)) { pixels[i + 3] = 0; break; }
          }
        }
        ctx.putImageData(image, left, row);
      }
    }
    function flush() {
      applyPaper();
      if (!outline || !dirty) return;
      var ids = new Set();
      for (var y = Math.floor(dirty.top / 128); y <= Math.floor(dirty.bottom / 128); y++) for (var x = Math.floor(dirty.left / 128); x <= Math.floor(dirty.right / 128); x++) {
        var list = innerGrid.get(x + ':' + y); if (list) list.forEach(function (id) { ids.add(id); });
      }
      ctx.save(); ctx.beginPath(); ctx.rect(dirty.left, dirty.top, dirty.right - dirty.left, dirty.bottom - dirty.top); ctx.clip();
      ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.beginPath();
      ids.forEach(function (i) { var a = inner[i]; capsule({ x: a[0], y: a[1] }, { x: a[2], y: a[3] }, a[4], a[5]); });
      ctx.fill(); ctx.restore(); dirty = null;
    }
    function segment(a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy); if (distance < 1e-8) return;
      var dt = b.time - a.time, speed = Number.isFinite(dt) && dt > 0 ? distance / dt : 0;
      var nextAngle = Math.atan2(dy, dx);
      while (nextAngle - angle > Math.PI) nextAngle -= 2 * Math.PI;
      while (nextAngle - angle < -Math.PI) nextAngle += 2 * Math.PI;
      angle = nextAngle;
      if (outline) { outlineSegment(a, b, speed); return; }
      while (untilDab <= distance + 1e-7) {
        var t = Math.min(1, untilDab / distance), sample = { x: a.x + dx * t, y: a.y + dy * t, pressure: a.pressure + (b.pressure - a.pressure) * t,
          time: a.time + dt * t, tiltX: a.tiltX + (b.tiltX - a.tiltX) * t, tiltY: a.tiltY + (b.tiltY - a.tiltY) * t };
        untilDab += dab(sample, speed, angle);
      }
      untilDab -= distance;
    }
    function start(p) {
      if (finished || last) return; last = point(p, false); if (!last) return; lastRaw = last;
      seed = (Math.imul(Math.floor(last.x), 2654435761) ^ Math.imul(Math.floor(last.y), 2246822519) ^ Math.floor(num(last.time, 0))) >>> 0;
      if (outline) { outlineSegment(last, last, 0); flush(); } else untilDab = dab(last, 0, 0);
    }
    function move(p) {
      if (finished) return; if (!last) { start(p); return; }
      var raw = point(p, false); if (!raw) return;
      var alpha = 1;
      if (stabilizer > 0) {
        var dt = raw.time - lastRaw.time;
        alpha = Number.isFinite(dt) && dt > 0 ? 1 - Math.exp(-clamp(dt, .1, 100) / (stabilizer * .55))
          : 1 - Math.exp(-Math.max(.1, Math.hypot(raw.x - lastRaw.x, raw.y - lastRaw.y)) / (1 + stabilizer * .22));
      }
      var next = { x: last.x + (raw.x - last.x) * alpha, y: last.y + (raw.y - last.y) * alpha,
        pressure: last.pressure + (raw.pressure - last.pressure) * Math.max(.15, alpha), time: raw.time, tiltX: raw.tiltX, tiltY: raw.tiltY };
      segment(last, next); last = next; lastRaw = raw;
    }
    function end(p) {
      if (finished) return;
      if (!last && p) start(p);
      if (last) {
        var raw = p ? point(p, true) : lastRaw;
        if (raw) { segment(last, raw); last = raw; }
      }
      flush(); finished = true;
      // Inner geometry cannot be needed after end; the completed raster is the
      // only content retained by the application's undo/stroke-record system.
      if (inner) { inner.length = 0; innerGrid.clear(); }
    }
    return { start: start, move: move, end: end, flush: flush, get bounds() {
      if (!Number.isFinite(bounds.left)) return null;
      var x = clamp(Math.floor(bounds.left), 0, ctx.canvas.width), y = clamp(Math.floor(bounds.top), 0, ctx.canvas.height);
      var right = clamp(Math.ceil(bounds.right), 0, ctx.canvas.width), bottom = clamp(Math.ceil(bounds.bottom), 0, ctx.canvas.height);
      return right > x && bottom > y ? { x: x, y: y, width: right - x, height: bottom - y } : null;
    } };
  }
  return { presets: presets, makeStroke: makeStroke, diagnostics: function () {
    var bytes = 0; [maskCache, tintCache, grainCache].forEach(function (cache) { cache.forEach(function (c) { bytes += c.width * c.height * 4; }); });
    return { maskEntries: maskCache.size, tintEntries: tintCache.size, grainEntries: grainCache.size, canvasBytes: bytes };
  } };
});
