/* Local geometric marks, system-font text and procedural fills. No assets. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DrawingMarks = api;
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null, function () {
  'use strict';
  var KINDS = ['none', 'solid', 'horizontal', 'vertical', 'diagonal', 'crosshatch', 'dots', 'sprinkles', 'checker', 'paper', 'stipple', 'weave', 'riso-sparse', 'riso-medium', 'riso-dense', 'riso-wet-light', 'riso-wet-medium', 'riso-wet-dense', 'linear', 'radial', 'reflected'];
  var FONTS = 'system-ui, "Microsoft YaHei", "PingFang SC", sans-serif';
  var tiles = new Map();
  var risoField, risoWetField;
  function number(value, fallback) { return Number.isFinite(+value) ? +value : fallback; }
  function clamp(value, low, high) { return Math.min(high, Math.max(low, value)); }
  function newCanvas(ctx, width, height) {
    var source = ctx.canvas, c;
    if (source && source.ownerDocument) c = source.ownerDocument.createElement('canvas');
    else if (typeof OffscreenCanvas !== 'undefined') c = new OffscreenCanvas(width, height);
    else if (source && source.constructor) { try { c = new source.constructor(width, height); } catch (_) {} }
    if (!c || typeof c.getContext !== 'function') throw new Error('当前环境无法建立材质画布。');
    c.width = width; c.height = height; return c;
  }
  function color(ctx, value, fallback) {
    if (typeof value !== 'string' || !value || value.length > 150) return fallback;
    ctx.save(); ctx.fillStyle = fallback; ctx.fillStyle = value;
    var result = ctx.fillStyle; ctx.restore(); return typeof result === 'string' ? result : fallback;
  }
  function transparent(color) {
    if (/^#[a-f\d]{6}$/i.test(color)) return color + '00';
    if (/^#[a-f\d]{8}$/i.test(color)) return color.slice(0, 7) + '00';
    var rgb = /^rgba?\(([^)]+)\)$/i.exec(color);
    if (rgb) return 'rgba(' + rgb[1].split(',').slice(0, 3).join(',') + ',0)';
    return 'rgba(0,0,0,0)';
  }
  function normalizedBounds(bounds, constrain) {
    bounds = bounds || {};
    var x = clamp(number(bounds.x, 0), -65536, 65536), y = clamp(number(bounds.y, 0), -65536, 65536);
    var w = clamp(number(bounds.width, 0), -16384, 16384), h = clamp(number(bounds.height, 0), -16384, 16384);
    if (constrain) { var side = Math.max(Math.abs(w), Math.abs(h)); w = (w < 0 ? -1 : 1) * side; h = (h < 0 ? -1 : 1) * side; }
    return { x: w < 0 ? x + w : x, y: h < 0 ? y + h : y, width: Math.abs(w), height: Math.abs(h) };
  }
  function clippedBounds(ctx, bounds, padding) {
    var x = Math.max(0, Math.floor(bounds.x - padding)), y = Math.max(0, Math.floor(bounds.y - padding));
    var right = Math.min(ctx.canvas.width, Math.ceil(bounds.x + bounds.width + padding));
    var bottom = Math.min(ctx.canvas.height, Math.ceil(bounds.y + bounds.height + padding));
    return right > x && bottom > y ? { x: x, y: y, width: right - x, height: bottom - y } : null;
  }
  function styleObject(style, fallback) {
    if (style == null || style === false || style === 'none') return { kind: 'none' };
    if (typeof style === 'string') return { kind: 'solid', foreground: style };
    if (typeof style !== 'object' || Array.isArray(style)) return { kind: 'solid', foreground: fallback || '#263544' };
    return style;
  }
  function hasPaint(style) { return styleObject(style).kind !== 'none'; }

  // Indexed noise keeps each mark fixed while colors or variation amounts change.
  function markNoise(index, channel) {
    var n = Math.imul(index + 1, 0x45d9f3b) ^ Math.imul(channel + 2027, 0x27d4eb2d);
    n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
    n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function markScale(index, amount) { return 1 + (markNoise(index, 1) * 2 - 1) * 0.55 * amount; }
  function wrapMark(ctx, side, x, y, pad, paint) {
    for (var dx = -side; dx <= side; dx += side) for (var dy = -side; dy <= side; dy += side) {
      if (x + dx + pad < 0 || x + dx - pad > side || y + dy + pad < 0 || y + dy - pad > side) continue;
      ctx.save(); ctx.translate(x + dx, y + dy); paint(); ctx.restore();
    }
  }
  function speckledTile(ctx, kind, side, cell, line, palette, sizeVariation, shapeVariation) {
    var seed = 2027;
    function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
    var count = Math.round(side / cell);
    for (var row = 0; row < count; row++) for (var col = 0; col < count; col++) {
      var grains = kind === 'paper' ? 10 : 2;
      for (var i = 0; i < grains; i++) {
        var x = (col + random()) * cell, y = (row + random()) * cell;
        var radius = Math.min(cell * 0.4, line * (0.22 + 0.42 * random()));
        var rx = kind === 'paper' ? radius * 1.7 : radius, ry = kind === 'paper' ? radius * 0.38 : radius;
        var angle = random() - 0.5;
        if (palette) {
          var index = (row * count + col) * grains + i, scale = markScale(index, sizeVariation);
          var aspect = (markNoise(index, 2) * 2 - 1) * 0.38 * shapeVariation;
          rx *= scale * (1 + aspect); ry *= scale * (1 - aspect);
          angle += (markNoise(index, 3) * 2 - 1) * shapeVariation;
          ctx.fillStyle = palette[index % palette.length];
        }
        var pad = Math.max(rx, ry);
        ctx.globalAlpha = kind === 'paper' ? 0.12 + 0.33 * random() : 0.68 + 0.32 * random();
        // Wrap clipped flecks at the opposite edge so repeats have no seam.
        var xs = x < pad ? [x, x + side] : x > side - pad ? [x, x - side] : [x];
        var ys = y < pad ? [y, y + side] : y > side - pad ? [y, y - side] : [y];
        for (var px of xs) for (var py of ys) {
          ctx.beginPath(); ctx.ellipse(px, py, rx, ry, angle, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // One lazy, periodic field gives irregular ink clusters and fine dry gaps.
  // The three densities threshold the same field, so changing density adds ink
  // without shuffling the texture. This is a procedural effect, not brush data.
  function risoNoise() {
    if (risoField) return risoField;
    var seed = 0x5249534f;
    function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
    function grid(size) {
      var values = new Float32Array(size * size);
      for (var i = 0; i < values.length; i++) values[i] = random();
      return values;
    }
    function sample(values, size, x, y) {
      var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      var x0 = ix % size, x1 = (ix + 1) % size, y0 = (iy % size) * size, y1 = ((iy + 1) % size) * size;
      return (values[y0 + x0] * (1 - fx) + values[y0 + x1] * fx) * (1 - fy) +
        (values[y1 + x0] * (1 - fx) + values[y1 + x1] * fx) * fy;
    }
    var grains = grid(128), patches = grid(16);
    risoField = new Float32Array(256 * 256);
    for (var y = 0; y < 256; y++) for (var x = 0; x < 256; x++) {
      risoField[y * 256 + x] = 0.68 * sample(grains, 128, (x + 0.5) / 2, (y + 0.5) / 2) +
        0.22 * random() + 0.10 * sample(patches, 16, (x + 0.5) / 16, (y + 0.5) / 16);
    }
    return risoField;
  }
  // Wet-print source previews have rounded droplets at low ink levels, joined
  // translucent ink at medium levels, and a continuous mottled film at high
  // levels. Use a separate smooth periodic field, not softened dry speckles.
  function risoWetNoise() {
    if (risoWetField) return risoWetField;
    var seed = 0x57455452, noise = new Float32Array(256 * 256), horizontal = new Float32Array(256 * 256);
    for (var i = 0; i < noise.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; noise[i] = seed / 4294967296;
    }
    // A wrapped binomial blur gives rounded correlated droplets without a
    // visible square grid. The two temporary arrays are released afterwards.
    for (var y = 0; y < 256; y++) for (var x = 0; x < 256; x++) {
      var row = y * 256;
      horizontal[row + x] = (noise[row + ((x - 2) & 255)] + 4 * noise[row + ((x - 1) & 255)] +
        6 * noise[row + x] + 4 * noise[row + ((x + 1) & 255)] + noise[row + ((x + 2) & 255)]) / 16;
    }
    risoWetField = new Float32Array(256 * 256);
    for (var y = 0; y < 256; y++) for (var x = 0; x < 256; x++) {
      var i = y * 256 + x, smooth = (horizontal[((y - 2) & 255) * 256 + x] +
        4 * horizontal[((y - 1) & 255) * 256 + x] + 6 * horizontal[i] +
        4 * horizontal[((y + 1) & 255) * 256 + x] + horizontal[((y + 2) & 255) * 256 + x]) / 16;
      risoWetField[i] = clamp(0.5 + 2.15 * (smooth - 0.5) + 0.025 * (noise[i] - 0.5), 0, 1);
    }
    return risoWetField;
  }
  function risoTile(ctx, kind, spacing, thickness, foreground, background, transparentBackground) {
    var wet = kind.indexOf('riso-wet-') === 0;
    var field = wet ? risoWetNoise() : risoNoise(), image = ctx.createImageData(256, 256), pixels = image.data;
    var base = kind === 'riso-sparse' ? 0.59 : kind === 'riso-medium' ? 0.49 : 0.39;
    // This ratio survives layer scaling; spacing changes density, while the
    // pattern transform below controls grain size in local canvas coordinates.
    var threshold = clamp(base + 0.13 * Math.log(spacing / (7 * thickness)), 0.12, 0.90);
    var wetShift = 0.22 * Math.log(spacing / (7 * thickness));
    for (var i = 0; i < field.length; i++) {
      pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = 255;
      var amount = (field[i] - threshold) / 0.075;
      if (wet) {
        // Keep the three response curves ordered even at maximum grain size
        // and minimum spacing. Negative input still allows real ink gaps.
        var ink = Math.min(1, field[i] - wetShift);
        amount = kind === 'riso-wet-light' ? (ink - 0.58) / 0.5 : kind === 'riso-wet-medium' ? (ink - 0.05) / 1.1 :
          (0.64 + 0.34 * ink) * clamp((ink + 0.10) / 0.15, 0, 1);
      }
      pixels[i * 4 + 3] = Math.round(255 * clamp(amount, 0, 1));
    }
    ctx.putImageData(image, 0, 0);
    ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = foreground; ctx.fillRect(0, 0, 256, 256);
    if (!transparentBackground) {
      ctx.globalCompositeOperation = 'destination-over'; ctx.fillStyle = background; ctx.fillRect(0, 0, 256, 256);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function wovenTile(ctx, cell, line) {
    var width = Math.min(cell * 0.68, line), gap = Math.min(cell / 2, width / 2 + Math.max(0.65, width * 0.36));
    for (var row = 0; row < 2; row++) for (var col = 0; col < 2; col++) {
      var x = col * cell, y = row * cell, mid = cell / 2;
      if ((row + col) % 2) {
        ctx.fillRect(x + mid - width / 2, y, width, cell);
        ctx.fillRect(x, y + mid - width / 2, mid - gap, width);
        ctx.fillRect(x + mid + gap, y + mid - width / 2, mid - gap, width);
      } else {
        ctx.fillRect(x, y + mid - width / 2, cell, width);
        ctx.fillRect(x + mid - width / 2, y, width, mid - gap);
        ctx.fillRect(x + mid - width / 2, y + mid + gap, width, mid - gap);
      }
    }
  }

  // These small periodic tiles are used only for multi-color or varied patterns.
  // The original single-color, zero-variation branch below remains unchanged.
  function variedTile(ctx, kind, side, cells, line, palette, sizeVariation, shapeVariation) {
    var cell = side / cells, tau = Math.PI * 2;
    function ink(index) { return palette[index % palette.length]; }
    function wave(index, position) {
      return cell * 0.13 * shapeVariation * Math.sin(tau * position / side + tau * markNoise(index, 4));
    }
    function stripe(vertical, index, start, end, center, width, wrap) {
      ctx.fillStyle = ctx.strokeStyle = ink(index);
      ctx.lineWidth = width; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      for (var offset = wrap ? -side : 0; offset <= (wrap ? side : 0); offset += side) {
        if (!shapeVariation) {
          if (vertical) ctx.fillRect(center + offset - width / 2, start, width, end - start);
          else ctx.fillRect(start, center + offset - width / 2, end - start, width);
        } else {
          ctx.beginPath();
          var steps = Math.max(3, Math.ceil((end - start) / cell * 5));
          for (var j = 0; j <= steps; j++) {
            var along = start + (end - start) * j / steps, across = center + offset + wave(index, along);
            var px = vertical ? across : along, py = vertical ? along : across;
            if (!j) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }
    }
    if (kind === 'horizontal' || kind === 'vertical' || kind === 'crosshatch') {
      for (var i = 0; i < cells; i++) {
        if (kind !== 'vertical') stripe(false, i, -cell, side + cell, i * cell, line * markScale(i, sizeVariation), true);
        if (kind !== 'horizontal') stripe(true, i + cells, -cell, side + cell, i * cell, line * markScale(i + cells, sizeVariation), true);
      }
      return;
    }
    if (kind === 'paper' || kind === 'stipple') {
      speckledTile(ctx, kind, side, cell, line, palette, sizeVariation, shapeVariation); return;
    }
    for (var row = 0; row < cells; row++) for (var col = 0; col < cells; col++) {
      var index = row * cells + col, scale = markScale(index, sizeVariation);
      var x = (col + 0.5) * cell, y = (row + 0.5) * cell;
      ctx.fillStyle = ctx.strokeStyle = ink(index);
      if (kind === 'dots') {
        var radius = line / 2 * scale, aspect = (markNoise(index, 2) * 2 - 1) * 0.38 * shapeVariation;
        var rx = radius * (1 + aspect), ry = radius * (1 - aspect), angle = tau * markNoise(index, 3);
        wrapMark(ctx, side, x, y, Math.max(rx, ry), function () {
          ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, angle, 0, tau); ctx.fill();
        });
      } else if (kind === 'sprinkles') {
        x += (markNoise(index, 5) * 2 - 1) * cell * 0.4;
        y += (markNoise(index, 6) * 2 - 1) * cell * 0.4;
        var width = line * scale, length = Math.min(line * 2.6, cell * 0.68) * scale;
        length *= 1 + (markNoise(index, 2) * 2 - 1) * 0.35 * shapeVariation;
        var bend = length * (markNoise(index, 3) * 2 - 1) * 0.28 * shapeVariation;
        var turn = tau * markNoise(index, 7);
        wrapMark(ctx, side, x, y, length / 2 + width / 2 + Math.abs(bend), function () {
          ctx.rotate(turn); ctx.lineWidth = width; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-length / 2, 0); ctx.quadraticCurveTo(0, bend, length / 2, 0); ctx.stroke();
        });
      } else if (kind === 'checker') {
        if ((row + col) % 2) continue;
        ctx.fillStyle = ink((row * cells + col) / 2 | 0);
        var half = cell / 2 * (1 + (scale - 1) * 0.55), corner = shapeVariation * 0.22, points = [];
        for (var v = 0; v < 4; v++) {
          points.push([(v === 0 || v === 3 ? -half : half) + (markNoise(index, 10 + v * 2) * 2 - 1) * cell * 0.10 * shapeVariation,
            (v < 2 ? -half : half) + (markNoise(index, 11 + v * 2) * 2 - 1) * cell * 0.10 * shapeVariation]);
        }
        wrapMark(ctx, side, x, y, half + cell * 0.15, function () {
          if (!shapeVariation) { ctx.fillRect(-half, -half, half * 2, half * 2); return; }
          ctx.beginPath();
          for (var j = 0; j < 4; j++) {
            var prev = points[(j + 3) % 4], here = points[j], next = points[(j + 1) % 4];
            var ax = here[0] + (prev[0] - here[0]) * corner, ay = here[1] + (prev[1] - here[1]) * corner;
            if (!j) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
            ctx.quadraticCurveTo(here[0], here[1], here[0] + (next[0] - here[0]) * corner, here[1] + (next[1] - here[1]) * corner);
          }
          ctx.closePath(); ctx.fill();
        });
      } else if (kind === 'weave') {
        var horizontal = Math.min(cell * 0.68, line * markScale(row, sizeVariation));
        var vertical = Math.min(cell * 0.68, line * markScale(col + cells, sizeVariation));
        var gapX = Math.min(cell * 0.46, vertical / 2 + Math.max(0.65, vertical * 0.36));
        var gapY = Math.min(cell * 0.46, horizontal / 2 + Math.max(0.65, horizontal * 0.36));
        var crossX = clamp(x + wave(col + cells, y), col * cell + gapX, (col + 1) * cell - gapX);
        var crossY = clamp(y + wave(row, x), row * cell + gapY, (row + 1) * cell - gapY);
        if ((row + col) % 2) {
          stripe(true, col + cells, row * cell, (row + 1) * cell, x, vertical, false);
          stripe(false, row, col * cell, crossX - gapX, y, horizontal, false);
          stripe(false, row, crossX + gapX, (col + 1) * cell, y, horizontal, false);
        } else {
          stripe(false, row, col * cell, (col + 1) * cell, y, horizontal, false);
          stripe(true, col + cells, row * cell, crossY - gapY, x, vertical, false);
          stripe(true, col + cells, crossY + gapY, (row + 1) * cell, x, vertical, false);
        }
      }
    }
  }

  /**
   * Coordinates/spacing/thickness are LOCAL canvas pixels. Pass the same bounds
   * for each preview/commit. Linear angle 0 points right, 90 points down; radial
   * runs from the center to the farthest corner. Transparent background also
   * makes the second gradient stop transparent.
   */
  function fillStyle(ctx, style, bounds) {
    style = styleObject(style); var kind = KINDS.indexOf(style.kind) >= 0 ? style.kind : 'solid';
    if (kind === 'none') return null;
    var fg = color(ctx, style.foreground, '#263544'), bg = color(ctx, style.background, '#ffffff');
    if (kind === 'solid') return fg;
    var box = normalizedBounds(bounds), x = box.x, y = box.y, w = Math.max(1, box.width), h = Math.max(1, box.height);
    var angle = number(style.angle, kind === 'diagonal' || kind === 'crosshatch' ? 45 : 0) * Math.PI / 180;
    var gradient;
    if (kind === 'linear' || kind === 'reflected') {
      var dx = Math.cos(angle), dy = Math.sin(angle), half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;
      gradient = ctx.createLinearGradient(x + w / 2 - dx * half, y + h / 2 - dy * half, x + w / 2 + dx * half, y + h / 2 + dy * half);
    } else if (kind === 'radial') {
      gradient = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.hypot(w, h) / 2);
    }
    if (gradient) {
      var endColor = style.transparentBackground ? transparent(fg) : bg;
      gradient.addColorStop(0, kind === 'reflected' ? endColor : fg);
      if (kind === 'reflected') gradient.addColorStop(0.5, fg);
      gradient.addColorStop(1, endColor);
      return gradient;
    }

    var spacing = clamp(number(style.spacing, 14), 2, 256), thickness = clamp(number(style.thickness, 2), 0.25, spacing);
    var base = kind === 'diagonal' ? 'horizontal' : kind, riso = kind.indexOf('riso-') === 0;
    var palette = [];
    if (!riso && Array.isArray(style.colors)) style.colors.slice(0, 6).forEach(function (entry) {
      var selected = color(ctx, entry, fg); if (palette.indexOf(selected) < 0) palette.push(selected);
    });
    if (!palette.length) palette = [fg];
    fg = palette[0];
    var sizeVariation = riso ? 0 : clamp(number(style.variationSize, 0), 0, 1);
    var shapeVariation = riso ? 0 : clamp(number(style.variationShape, 0), 0, 1);
    var varied = !riso && (base === 'sprinkles' || palette.length > 1 || sizeVariation > 0 || shapeVariation > 0);
    var cells = base === 'checker' || base === 'weave' ? 2 : base === 'paper' || base === 'stipple' ? 6 : 1;
    if (varied) cells = base === 'paper' || base === 'stipple' || base === 'sprinkles' ? 6 :
      Math.max(sizeVariation || shapeVariation ? 6 : 1, palette.length * (base === 'checker' || base === 'weave' ? 2 : 1));
    var key = JSON.stringify([base, fg, bg, !!style.transparentBackground, spacing, thickness, palette, sizeVariation, shapeVariation]);
    var tile = tiles.get(key);
    if (!tile) {
      var side = riso ? 256 : clamp(Math.ceil(spacing * cells), 2, 256), cell = side / cells, unit = cell / spacing;
      tile = newCanvas(ctx, side, side); var tc = tile.getContext('2d');
      if (!riso && !style.transparentBackground) { tc.fillStyle = bg; tc.fillRect(0, 0, side, side); }
      tc.fillStyle = fg; var line = thickness * unit;
      if (varied) variedTile(tc, base, side, cells, line, palette, sizeVariation, shapeVariation);
      else {
        // Repeat boundary-centered stripes, so neighboring tiles meet seamlessly.
        if (base === 'horizontal' || base === 'crosshatch') { tc.fillRect(0, -line / 2, side, line); tc.fillRect(0, side - line / 2, side, line); }
        if (base === 'vertical' || base === 'crosshatch') { tc.fillRect(-line / 2, 0, line, side); tc.fillRect(side - line / 2, 0, line, side); }
        if (base === 'dots') { tc.beginPath(); tc.arc(side / 2, side / 2, line / 2, 0, Math.PI * 2); tc.fill(); }
        if (base === 'checker') { tc.fillRect(0, 0, cell, cell); tc.fillRect(cell, cell, cell, cell); }
        if (base === 'weave') wovenTile(tc, cell, line);
        if (base === 'paper' || base === 'stipple') speckledTile(tc, base, side, cell, line);
      }
      if (riso) risoTile(tc, kind, spacing, thickness, fg, bg, !!style.transparentBackground);
      tiles.set(key, tile); if (tiles.size > 8) tiles.delete(tiles.keys().next().value);
    }
    var pattern = ctx.createPattern(tile, 'repeat');
    if (!pattern) throw new Error('当前环境无法生成材质填充。');
    var rotation = riso || ['horizontal', 'vertical', 'paper', 'stipple', 'sprinkles'].includes(kind) ? 0 : angle;
    var scale = riso ? thickness / 2 : spacing * cells / tile.width, c = Math.cos(rotation) * scale, s = Math.sin(rotation) * scale;
    if (typeof pattern.setTransform === 'function') pattern.setTransform({ a: c, b: s, c: -s, d: c, e: x, f: y });
    return pattern;
  }

  // Fill+outline at opacity<1 are first composed together, then applied once.
  // The application normally passes opacity=1 and composites its preview layer.
  function paintOnce(ctx, bounds, opacity, paint) {
    if (!bounds || opacity <= 0) return null;
    if (opacity >= 1) { ctx.save(); try { paint(ctx); } finally { ctx.restore(); } }
    else {
      var temp = newCanvas(ctx, bounds.width, bounds.height), tc = temp.getContext('2d');
      tc.translate(-bounds.x, -bounds.y); paint(tc);
      ctx.save(); ctx.globalAlpha *= opacity; ctx.drawImage(temp, bounds.x, bounds.y); ctx.restore();
    }
    return bounds;
  }
  function directionalPoints(options, lineWidth) {
    var x = clamp(number(options.x, 0), -65536, 65536), y = clamp(number(options.y, 0), -65536, 65536);
    var dx = clamp(number(options.width, 0), -16384, 16384), dy = clamp(number(options.height, 0), -16384, 16384);
    var length = Math.hypot(dx, dy);
    if (length < 0.01) return null;
    if (options.constrain) {
      var angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * Math.PI / 4;
      dx = Math.cos(angle) * length; dy = Math.sin(angle) * length;
    }
    if (options.type === 'line') return [[x, y], [x + dx, y + dy]];
    var ux = dx / length, uy = dy / length;
    var shaft = Math.min(length * 0.085, Math.max(2, length * 0.035, lineWidth));
    var head = Math.min(length * 0.27, shaft * 2.8), neck = length - Math.min(length * 0.43, Math.max(shaft * 3.6, length * 0.23));
    function point(along, offset) { return [x + along * ux - offset * uy, y + along * uy + offset * ux]; }
    return [point(0, shaft), point(neck, shaft), point(neck, head), point(length, 0),
      point(neck, -head), point(neck, -shaft), point(0, -shaft)];
  }
  function pointsBox(points) {
    var xs = points.map(function (p) { return p[0]; }), ys = points.map(function (p) { return p[1]; });
    var x = Math.min.apply(null, xs), y = Math.min.apply(null, ys);
    return { x: x, y: y, width: Math.max.apply(null, xs) - x, height: Math.max.apply(null, ys) - y };
  }
  const polygons = {
    pentagon: [[.5,0],[1,.38],[.81,1],[.19,1],[0,.38]],
    octagon: [[.29,0],[.71,0],[1,.29],[1,.71],[.71,1],[.29,1],[0,.71],[0,.29]],
    trapezoid: [[.23,0],[.77,0],[1,1],[0,1]],
    parallelogram: [[.25,0],[1,0],[.75,1],[0,1]],
    bolt: [[.41,0],[.94,0],[.64,.40],[.95,.40],[.17,1],[.39,.55],[.05,.55]],
    sparkle: [[.5,0],[.63,.36],[1,.5],[.63,.64],[.5,1],[.37,.64],[0,.5],[.37,.36]]
  };
  function shapePath(ctx, type, box, vertices) {
    var x = box.x, y = box.y, w = box.width, h = box.height;
    ctx.beginPath();
    if (Object.hasOwn(polygons, type)) vertices = polygons[type].map(([px, py]) => [x + px * w, y + py * h]);
    if (vertices) {
      ctx.moveTo(vertices[0][0], vertices[0][1]);
      for (var v = 1; v < vertices.length; v++) ctx.lineTo(vertices[v][0], vertices[v][1]);
      if (type === 'line') return;
    } else if (type === 'roundRect') {
      var corner = Math.min(w, h) * 0.20;
      ctx.moveTo(x + corner, y); ctx.lineTo(x + w - corner, y); ctx.quadraticCurveTo(x + w, y, x + w, y + corner);
      ctx.lineTo(x + w, y + h - corner); ctx.quadraticCurveTo(x + w, y + h, x + w - corner, y + h);
      ctx.lineTo(x + corner, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - corner);
      ctx.lineTo(x, y + corner); ctx.quadraticCurveTo(x, y, x + corner, y);
    } else if (type === 'diamond') {
      ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w / 2, y + h); ctx.lineTo(x, y + h / 2);
    } else if (type === 'hexagon') {
      ctx.moveTo(x + w / 4, y); ctx.lineTo(x + w * 0.75, y); ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w * 0.75, y + h); ctx.lineTo(x + w / 4, y + h); ctx.lineTo(x, y + h / 2);
    } else if (type === 'ellipse') ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (type === 'triangle') { ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); }
    else if (type === 'star') {
      var points = [], left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
      for (var i = 0; i < 10; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.22 : 0.5, px = Math.cos(a) * r, py = Math.sin(a) * r;
        points.push([px, py]); left = Math.min(left, px); right = Math.max(right, px); top = Math.min(top, py); bottom = Math.max(bottom, py);
      }
      points.forEach(function (point, index) {
        var px = x + (point[0] - left) / (right - left) * w, py = y + (point[1] - top) / (bottom - top) * h;
        if (!index) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
    } else if (type === 'drop') {
      ctx.moveTo(x + w * .55, y);
      ctx.bezierCurveTo(x + w * .60,y + h * .27,x + w,y + h * .43,x + w,y + h * .68);
      ctx.bezierCurveTo(x + w,y + h * 1.1,x,y + h * 1.12,x,y + h * .70);
      ctx.bezierCurveTo(x,y + h * .47,x + w * .40,y + h * .25,x + w * .55,y);
    } else if (type === 'cloud') {
      ctx.moveTo(x + .19*w,y + .88*h);
      ctx.bezierCurveTo(x - .03*w,y + .88*h,x - .04*w,y + .40*h,x + .19*w,y + .39*h);
      ctx.bezierCurveTo(x + .18*w,y + .04*h,x + .51*w,y - .10*h,x + .64*w,y + .19*h);
      ctx.bezierCurveTo(x + .80*w,y + .04*h,x + .94*w,y + .25*h,x + .89*w,y + .42*h);
      ctx.bezierCurveTo(x + 1.06*w,y + .46*h,x + 1.02*w,y + .87*h,x + .81*w,y + .88*h);
    } else if (type === 'heart') {
      ctx.moveTo(x + w * 0.5, y + h * 0.25);
      ctx.bezierCurveTo(x + w * 0.4, y, x, y, x, y + h * 0.32);
      ctx.bezierCurveTo(x, y + h * 0.57, x + w * 0.28, y + h * 0.82, x + w * 0.5, y + h);
      ctx.bezierCurveTo(x + w * 0.72, y + h * 0.82, x + w, y + h * 0.57, x + w, y + h * 0.32);
      ctx.bezierCurveTo(x + w, y, x + w * 0.6, y, x + w * 0.5, y + h * 0.25);
    } else ctx.rect(x, y, w, h);
    ctx.closePath();
  }
  const frameKinds = ['frameGallery', 'frameDeco', 'frameFilm', 'frameCorners'];
  function paintFrame(ctx, opts) {
    const b = normalizedBounds(opts, opts.constrain), side = Math.min(b.width, b.height);
    if (side < 1) return null;
    const edge = Math.min(side * .26, Math.max(.5, number(opts.frameWidth, 10)));
    const main = color(ctx, opts.frameColor, '#354953'), accent = color(ctx, opts.frameAccent, '#d4b583');
    return paintOnce(ctx, clippedBounds(ctx, b, 1), clamp(number(opts.opacity, 1), 0, 1), paint => {
      paint.translate(b.x, b.y);
      const w = b.width, h = b.height;
      paint.beginPath(); paint.rect(0, 0, w, h); paint.clip();
      function rule(inset, thickness, ink) {
        paint.strokeStyle = ink; paint.lineWidth = thickness;
        paint.strokeRect(inset, inset, w - 2 * inset, h - 2 * inset);
      }
      if (opts.type === 'frameCorners') {
        const arm = Math.min(side / 3, edge * 4);
        for (const [x,y,sx,sy] of [[0,0,1,1],[w,0,-1,1],[0,h,1,-1],[w,h,-1,-1]]) {
          paint.save(); paint.translate(x,y); paint.scale(sx,sy); paint.fillStyle = main;
          paint.fillRect(0,0,arm,edge*.38); paint.fillRect(0,0,edge*.38,arm);
          paint.fillStyle = accent; paint.fillRect(edge*.75,edge*.75,edge*.5,edge*.5); paint.restore();
        }
      } else if (opts.type === 'frameFilm') {
        paint.fillStyle = main;
        paint.fillRect(0,0,w,edge); paint.fillRect(0,h-edge,w,edge);
        rule(edge*.09,edge*.18, main);
        const n = Math.min(256,Math.max(2,Math.floor(w / (edge * 1.7)))), pitch=w/n;
        paint.fillStyle = accent;
        for (let i=0;i<n;i++) for (const y of [edge*.30,h-edge*.70]) {
          paint.fillRect((i+.27)*pitch,y,.46*pitch,edge*.40);
        }
      } else if (opts.type === 'frameDeco') {
        rule(edge*.17,edge*.25,main); rule(edge*.76,edge*.1,accent);
        const extent = Math.min(edge*2,side*.33);
        for (const [x,y,sx,sy] of [[0,0,1,1],[w,0,-1,1],[0,h,1,-1],[w,h,-1,-1]]) {
          paint.save(); paint.translate(x,y); paint.scale(sx,sy);
          paint.strokeStyle=accent; paint.lineWidth=edge*.15; paint.lineJoin='bevel';
          paint.beginPath(); paint.moveTo(0,extent); paint.lineTo(extent,0); paint.stroke();
          paint.fillStyle=main; paint.fillRect(edge*.6,edge*.6,edge*.46,edge*.46); paint.restore();
        }
      } else {
        rule(edge*.5,edge,main); rule(edge*.86,edge*.21,accent); rule(edge*1.12,edge*.12,main);
      }
    });
  }
  /** Returns a clipped pixel rectangle suitable for one undo patch, or null. */
  function paintShape(ctx, options) {
    options = options || {};
    if (frameKinds.includes(options.type)) return paintFrame(ctx, options);
    var fill = options.fill === undefined ? '#263544' : options.fill, stroke = options.stroke;
    var lineWidth = clamp(number(options.strokeWidth, 2), 0, 512), opacity = clamp(number(options.opacity, 1), 0, 1);
    var vertices, box;
    if (options.type === 'line' || options.type === 'arrow') {
      vertices = directionalPoints(options, lineWidth);
      if (!vertices) return null;
      box = pointsBox(vertices);
      if (options.type === 'line') { stroke = hasPaint(stroke) ? stroke : fill; fill = null; }
    } else {
      box = normalizedBounds(options, !!options.constrain);
      if (box.width < 0.01 || box.height < 0.01) return null;
    }
    var filled = hasPaint(fill), outlined = hasPaint(stroke) && lineWidth > 0;
    if (!filled && !outlined) return null;
    var bounds = clippedBounds(ctx, box, outlined ? lineWidth / 2 + 2 : 1);
    return paintOnce(ctx, bounds, opacity, function (paint) {
      paint.lineWidth = lineWidth; paint.lineJoin = 'round'; paint.lineCap = 'round';
      shapePath(paint, options.type, box, vertices);
      if (filled) { paint.fillStyle = fillStyle(paint, fill, box); paint.fill(); }
      if (outlined) { paint.strokeStyle = fillStyle(paint, stroke, box); paint.stroke(); }
    });
  }

  const textBoxKinds = ['caption', 'balloon', 'ribbon', 'fold', 'bookplate'];
  function paintTextBox(paint, style, rect, pad, surface, accent) {
    const { x,y,width:w,height:h } = rect;
    const fold = Math.min(pad * 1.6, h * .35, w * .2);
    const radius = Math.min(pad, h / 3);
    paint.save(); paint.translate(x,y); paint.fillStyle = surface;
    paint.strokeStyle = accent; paint.lineWidth = Math.max(.6, pad*.13); paint.lineJoin = 'round';
    paint.beginPath();
    if (style === 'balloon') {
      const tail = Math.min(w*.3, pad*2.7);
      paint.moveTo(radius,0); paint.arcTo(w,0,w,h,radius); paint.arcTo(w,h,0,h,radius);
      paint.lineTo(tail+pad,h); paint.lineTo(tail-pad*.65,h+pad*.9); paint.lineTo(tail-pad*.3,h);
      paint.arcTo(0,h,0,0,radius); paint.arcTo(0,0,w,0,radius);
    } else if (style === 'ribbon') {
      const notch = Math.min(pad*.65,w*.1);
      paint.moveTo(0,0); paint.lineTo(w,0); paint.lineTo(w-notch,h/2); paint.lineTo(w,h);
      paint.lineTo(0,h); paint.lineTo(notch,h/2);
    } else if (style === 'fold') {
      paint.moveTo(0,0); paint.lineTo(w-fold,0); paint.lineTo(w,fold); paint.lineTo(w,h); paint.lineTo(0,h);
    } else paint.rect(0,0,w,h);
    paint.closePath(); paint.fill();
    if (style !== 'caption') paint.stroke();
    paint.fillStyle = accent;
    if (style === 'caption') paint.fillRect(0,0,Math.max(1,pad*.38),h);
    if (style === 'fold') {
      paint.beginPath(); paint.moveTo(w-fold,0); paint.lineTo(w,fold); paint.lineTo(w-fold,fold); paint.fill();
    }
    if (style === 'bookplate') {
      const inset = pad*.36;
      paint.strokeRect(inset,inset,w-2*inset,h-2*inset);
      for (const cx of [inset,w-inset]) for (const cy of [inset,h-inset]) {
        paint.beginPath(); paint.arc(cx,cy,Math.max(.7,pad*.18),0,Math.PI*2); paint.fill();
      }
    }
    paint.restore();
  }

  /**
   * Text anchor x/y is the top of the line box; align is left/center/right.
   * lineHeight is a font-size multiplier. Fonts are system fallbacks only.
   * Returns conservative glyph coverage (including outlines), clipped to canvas.
   */
  function paintText(ctx, options) {
    options = options || {}; var text = typeof options.text === 'string' ? options.text.replace(/\r\n?/g, '\n') : '';
    if (!text.trim()) return null;
    var lines = text.split('\n');
    if (text.length > 2000 || lines.length > 30) throw new Error('文字请控制在 2000 字符、30 行以内。');
    var size = clamp(number(options.size, 32), 4, 1024), lineHeight = clamp(number(options.lineHeight, 1.3), 0.6, 4);
    var x = clamp(number(options.x, 0), -65536, 65536), y = clamp(number(options.y, 0), -65536, 65536);
    var family = typeof options.fontFamily === 'string' && options.fontFamily.length <= 300 && !/[\n\r;{}]/.test(options.fontFamily) ? options.fontFamily : FONTS;
    var font = (options.italic ? 'italic ' : '') + (options.bold ? '700 ' : '400 ') + size + 'px ' + family;
    var align = options.align === 'center' || options.align === 'right' ? options.align : 'left';
    var fill = options.fill === undefined ? '#263544' : options.fill, stroke = options.stroke;
    var lineWidth = clamp(number(options.strokeWidth, 1), 0, 512), opacity = clamp(number(options.opacity, 1), 0, 1);
    var filled = hasPaint(fill), outlined = hasPaint(stroke) && lineWidth > 0;
    if (!filled && !outlined) return null;
    ctx.save(); ctx.font = size + 'px ' + FONTS; ctx.font = font; font = ctx.font;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    var measurements = lines.map(function (line) { return ctx.measureText(line); });
    var ascent = Math.max(size * 0.8, ...measurements.map(function (m) { return number(m.actualBoundingBoxAscent, 0); }));
    var left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    var placements = lines.map(function (line, index) {
      var m = measurements[index], width = m.width, px = x - (align === 'center' ? width / 2 : align === 'right' ? width : 0), baseline = y + ascent + index * size * lineHeight;
      if (line.trim()) {
        // Some Canvas/font-fallback combinations report only the first font run
        // in actualBoundingBox*. Keep the complete advance and font metrics too,
        // or a Chinese/Latin line can be cropped when composited from its patch.
        var overhang = options.italic ? size * 0.25 : 0;
        left = Math.min(left, px - Math.max(number(m.actualBoundingBoxLeft, 0), overhang));
        right = Math.max(right, px + Math.max(number(m.actualBoundingBoxRight, width), width + overhang));
        top = Math.min(top, baseline - Math.max(number(m.actualBoundingBoxAscent, 0), number(m.fontBoundingBoxAscent, size)));
        bottom = Math.max(bottom, baseline + Math.max(number(m.actualBoundingBoxDescent, 0), number(m.fontBoundingBoxDescent, size * 0.25)));
      }
      return { text: line, x: px, y: baseline };
    }); ctx.restore();
    if (!Number.isFinite(left) || right <= left || bottom <= top) return null;
    var box = { x: left, y: top, width: right - left, height: bottom - top };
    const framed = textBoxKinds.includes(options.boxStyle), pad = Math.max(2, size * .43);
    const backing = framed ? { x: left-pad*1.55, y: top-pad*.65, width: box.width+pad*3.1, height: box.height+pad*1.3 } : box;
    const extent = options.boxStyle === 'balloon' ? { ...backing, height: backing.height + pad } : backing;
    var bounds = clippedBounds(ctx, extent, Math.max(outlined ? lineWidth / 2 + 2 : 1, framed ? pad*.15 + 1 : 1));
    return paintOnce(ctx, bounds, opacity, function (paint) {
      if (framed) paintTextBox(paint, options.boxStyle, backing, pad, color(paint,options.boxColor,'#fff4df'), color(paint,options.boxAccent,'#886d52'));
      paint.font = font; paint.textBaseline = 'alphabetic'; paint.textAlign = 'left'; paint.lineWidth = lineWidth; paint.lineJoin = 'round';
      if (filled) paint.fillStyle = fillStyle(paint, fill, box);
      if (outlined) paint.strokeStyle = fillStyle(paint, stroke, box);
      placements.forEach(function (line) { if (outlined) paint.strokeText(line.text, line.x, line.y); if (filled) paint.fillText(line.text, line.x, line.y); });
    });
  }
  return { fillStyle: fillStyle, paintShape: paintShape, paintText: paintText, normalizedBounds: normalizedBounds, frameKinds: frameKinds };
});
