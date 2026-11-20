/* Lightweight, local raster drawing primitives. No framework or network access. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DrawingCore = api;
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null, function () {
  'use strict';

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function number(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
  function validImage(image) {
    if (!image || !Number.isInteger(image.width) || !Number.isInteger(image.height) ||
        image.width < 1 || image.height < 1 || !image.data || image.data.length !== image.width * image.height * 4) {
      throw new Error('图像数据无效。');
    }
  }
  function emptyBounds() { return { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }; }
  function include(bounds, x0, y0, x1, y1) {
    bounds.left = Math.min(bounds.left, x0); bounds.top = Math.min(bounds.top, y0);
    bounds.right = Math.max(bounds.right, x1); bounds.bottom = Math.max(bounds.bottom, y1);
  }
  function rectangle(bounds, width, height) {
    if (!Number.isFinite(bounds.left)) return null;
    var x = clamp(Math.floor(bounds.left), 0, width), y = clamp(Math.floor(bounds.top), 0, height);
    var right = clamp(Math.ceil(bounds.right), 0, width), bottom = clamp(Math.ceil(bounds.bottom), 0, height);
    return right > x && bottom > y ? { x: x, y: y, width: right - x, height: bottom - y } : null;
  }

  /**
   * Paint one opaque stroke into a separate transparent canvas. Apply the user's
   * opacity ONCE when compositing that canvas, or overlapping stamps darken it.
   * Eraser emits an opaque black mask; composite using destination-out.
   * Point time is PointerEvent.timeStamp in ms. Non-pen pointers have full width.
   */
  function makeStroke(ctx, options) {
    options = options || {};
    var brush = /^(gpen|binary|pixel|fineliner|eraser)$/.test(options.brush) ? options.brush : 'gpen';
    var size = clamp(number(options.size, 8), 0.5, 512);
    var stabilized = clamp(number(options.stabilizer, 0), 0, 100);
    var usePressure = options.pressure !== false && (brush === 'gpen' || brush === 'binary' || brush === 'eraser');
    var color = brush === 'eraser' ? '#000000' : (options.color || '#20242b');
    var bounds = emptyBounds(), last = null, lastRaw = null, finished = false;
    var pressure = 1;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = color; ctx.strokeStyle = color;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = brush !== 'pixel' && brush !== 'binary';

    function getPoint(point, ending) {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
      var isPen = point.pointerType === 'pen';
      var p = clamp(number(point.pressure, 0.5), 0, 1);
      // pointerup normally has pressure=0; do not reinterpret it as full force.
      if (isPen && p > 0) pressure = p;
      else if (!isPen) pressure = 1;
      if (!isPen || !usePressure) p = 1;
      else if (p <= 0) p = ending && last ? last.pressure : Math.min(pressure, 0.05);
      return { x: point.x, y: point.y, pressure: p, time: number(point.time, number(point.timeStamp, NaN)) };
    }
    function widthAt(point) {
      return size * (usePressure ? (0.06 + 0.94 * Math.pow(point.pressure, 0.72)) : 1);
    }
    function circle(x, y, radius) {
      ctx.beginPath(); ctx.arc(x, y, Math.max(0.2, radius), 0, Math.PI * 2); ctx.fill();
      include(bounds, x - radius - 1, y - radius - 1, x + radius + 1, y + radius + 1);
    }
    function hardCircle(x, y, radius) {
      // Test pixel centers; integer fillRect spans have no antialiased edge.
      radius = Math.max(0.5, radius);
      var cy = Math.floor(y) + 0.5, cx = Math.floor(x) + 0.5;
      var minY = Math.ceil(cy - radius - 0.5), maxY = Math.floor(cy + radius - 0.5);
      for (var yy = minY; yy <= maxY; yy++) {
        var dy = yy + 0.5 - cy, half = Math.sqrt(Math.max(0, radius * radius - dy * dy));
        var minX = Math.ceil(cx - half - 0.5), maxX = Math.floor(cx + half - 0.5);
        if (maxX >= minX) ctx.fillRect(minX, yy, maxX - minX + 1, 1);
      }
      include(bounds, cx - radius - 1, cy - radius - 1, cx + radius + 1, cy + radius + 1);
    }
    function pixelStamp(x, y) {
      var n = Math.max(1, Math.round(size)), xx = Math.floor(x) - Math.floor(n / 2), yy = Math.floor(y) - Math.floor(n / 2);
      ctx.fillRect(xx, yy, n, n); include(bounds, xx, yy, xx + n, yy + n);
    }
    function drawSegment(a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
      var ra = widthAt(a) / 2, rb = widthAt(b) / 2;
      if (brush === 'pixel') {
        var x0 = Math.floor(a.x), y0 = Math.floor(a.y), x1 = Math.floor(b.x), y1 = Math.floor(b.y);
        var ax = Math.abs(x1 - x0), ay = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = ax + ay;
        while (true) {
          pixelStamp(x0, y0);
          if (x0 === x1 && y0 === y1) break;
          var twice = 2 * err;
          if (twice >= ay) { err += ay; x0 += sx; }
          if (twice <= ax) { err += ax; y0 += sy; }
        }
      } else if (brush === 'binary') {
        var count = Math.max(1, Math.ceil(distance / Math.max(0.5, Math.min(2, Math.min(ra, rb) * 0.4))));
        for (var i = 0; i <= count; i++) {
          var t = i / count; hardCircle(a.x + dx * t, a.y + dy * t, ra + (rb - ra) * t);
        }
      } else if (distance < 0.001) {
        circle(b.x, b.y, rb);
      } else if (brush === 'fineliner') {
        ctx.lineWidth = size; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        include(bounds, Math.min(a.x, b.x) - ra - 1, Math.min(a.y, b.y) - ra - 1,
          Math.max(a.x, b.x) + rb + 1, Math.max(a.y, b.y) + rb + 1);
      } else {
        // A tapered ribbon plus round caps. Interpolated radii avoid disconnected
        // dots even when a tablet delivers a long/coalesced movement.
        var nx = -dy / distance, ny = dx / distance;
        ctx.beginPath();
        ctx.moveTo(a.x + nx * ra, a.y + ny * ra); ctx.lineTo(b.x + nx * rb, b.y + ny * rb);
        ctx.lineTo(b.x - nx * rb, b.y - ny * rb); ctx.lineTo(a.x - nx * ra, a.y - ny * ra);
        ctx.closePath(); ctx.fill(); circle(a.x, a.y, ra); circle(b.x, b.y, rb);
      }
    }
    function start(point) {
      if (finished || last) return;
      last = getPoint(point, false); if (!last) return;
      lastRaw = last; drawSegment(last, last);
    }
    function move(point) {
      if (finished) return;
      if (!last) { start(point); return; }
      var raw = getPoint(point, false); if (!raw) return;
      var alpha = 1;
      if (stabilized > 0 && brush !== 'pixel') {
        var dt = raw.time - lastRaw.time;
        if (Number.isFinite(dt) && dt > 0) alpha = 1 - Math.exp(-clamp(dt, 0.1, 100) / (stabilized * 0.55));
        else {
          // Distance-based fallback when callers do not supply event timestamps.
          var step = Math.hypot(raw.x - lastRaw.x, raw.y - lastRaw.y);
          alpha = 1 - Math.exp(-Math.max(0.1, step) / (1 + stabilized * 0.22));
        }
      }
      var next = { x: last.x + (raw.x - last.x) * alpha, y: last.y + (raw.y - last.y) * alpha,
        pressure: last.pressure + (raw.pressure - last.pressure) * Math.max(0.15, alpha), time: raw.time };
      drawSegment(last, next); last = next; lastRaw = raw;
    }
    function end(point) {
      if (finished) return;
      if (!last && point) start(point);
      if (last) {
        var raw = point ? getPoint(point, true) : lastRaw;
        if (raw) { drawSegment(last, raw); last = raw; }
      }
      finished = true;
    }
    return { start: start, move: move, end: end,
      get bounds() { return rectangle(bounds, ctx.canvas.width, ctx.canvas.height); } };
  }

  /**
   * Membership is computed from sample before target is touched. This allows a
   * merged-layer sample with a different empty destination layer, and also makes
   * target===sample safe. RGBA uses 0..255 for every channel, including alpha.
   */
  function floodFill(target, sample, x, y, rgba, options) {
    validImage(target); validImage(sample);
    if (target.width !== sample.width || target.height !== sample.height) throw new Error('填充取样与图层尺寸不同。');
    options = options || {};
    var width = target.width, height = target.height, n = width * height;
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || y < 0 || x >= width || y >= height || !Number.isFinite(x + y)) return { changed: 0, bounds: null };
    var source = sample.data, pixels = target.data, start = y * width + x, si = start * 4;
    var tolerance = clamp(number(options.tolerance, 16), 0, 255);
    var seedAlpha = source[si + 3], sa = seedAlpha / 255;
    var seedR = source[si] * sa, seedG = source[si + 1] * sa, seedB = source[si + 2] * sa;
    var mask = new Uint8Array(n), selected = emptyBounds();
    function matches(index) {
      var p = index * 4, alpha = source[p + 3];
      if (Math.abs(alpha - seedAlpha) > tolerance) return false;
      if (alpha === 0 && seedAlpha === 0) return true; // hidden RGB is irrelevant
      var a = alpha / 255;
      return Math.max(Math.abs(source[p] * a - seedR), Math.abs(source[p + 1] * a - seedG), Math.abs(source[p + 2] * a - seedB)) <= tolerance;
    }
    function select(index, xx, yy) { mask[index] = 1; include(selected, xx, yy, xx + 1, yy + 1); }
    if (options.contiguous === false) {
      for (var p = 0; p < n; p++) if (matches(p)) select(p, p % width, Math.floor(p / width));
    } else {
      var stack = [start];
      while (stack.length) {
        var seed = stack.pop();
        if (mask[seed]) continue;
        if (!matches(seed)) { mask[seed] = 2; continue; }
        var yy = Math.floor(seed / width), left = seed % width;
        while (left > 0 && !mask[yy * width + left - 1] && matches(yy * width + left - 1)) left--;
        var above = false, below = false;
        for (var xx = left; xx < width; xx++) {
          var at = yy * width + xx;
          if (mask[at]) break;
          if (!matches(at)) { mask[at] = 2; break; }
          select(at, xx, yy);
          if (yy > 0) {
            var up = at - width, upMatch = !mask[up] && matches(up);
            if (upMatch && !above) stack.push(up);
            if (!upMatch && !mask[up]) mask[up] = 2;
            above = upMatch;
          }
          if (yy < height - 1) {
            var down = at + width, downMatch = !mask[down] && matches(down);
            if (downMatch && !below) stack.push(down);
            if (!downMatch && !mask[down]) mask[down] = 2;
            below = downMatch;
          }
        }
      }
    }
    var selection = rectangle(selected, width, height);
    if (!selection) return { changed: 0, bounds: null };
    var expand = Math.round(clamp(number(options.expand, 0), 0, 2));
    if (expand) {
      var dilated = new Uint8Array(n);
      for (var my = selection.y; my < selection.y + selection.height; my++) {
        for (var mx = selection.x; mx < selection.x + selection.width; mx++) {
          if (mask[my * width + mx] !== 1) continue;
          for (var dy = Math.max(0, my - expand); dy <= Math.min(height - 1, my + expand); dy++) {
            dilated.fill(1, dy * width + Math.max(0, mx - expand), dy * width + Math.min(width - 1, mx + expand) + 1);
          }
        }
      }
      mask = dilated;
      selection = { x: Math.max(0, selection.x - expand), y: Math.max(0, selection.y - expand),
        width: Math.min(width, selection.x + selection.width + expand) - Math.max(0, selection.x - expand),
        height: Math.min(height, selection.y + selection.height + expand) - Math.max(0, selection.y - expand) };
    }
    rgba = rgba || [0, 0, 0, 255];
    var red = clamp(number(rgba[0], 0), 0, 255), green = clamp(number(rgba[1], 0), 0, 255), blue = clamp(number(rgba[2], 0), 0, 255);
    var alphaIn = clamp(number(rgba[3], 255), 0, 255) / 255, changed = 0, actual = emptyBounds();
    if (alphaIn === 0) return { changed: 0, bounds: null };
    for (var fy = selection.y; fy < selection.y + selection.height; fy++) {
      for (var fx = selection.x; fx < selection.x + selection.width; fx++) {
        var index = fy * width + fx; if (mask[index] !== 1) continue;
        var offset = index * 4, r0 = pixels[offset], g0 = pixels[offset + 1], b0 = pixels[offset + 2], a0 = pixels[offset + 3];
        if (options.erase) pixels[offset + 3] = Math.round(a0 * (1 - alphaIn));
        else {
          var oldPart = a0 / 255 * (1 - alphaIn), outAlpha = alphaIn + oldPart;
          pixels[offset] = Math.round((red * alphaIn + r0 * oldPart) / outAlpha);
          pixels[offset + 1] = Math.round((green * alphaIn + g0 * oldPart) / outAlpha);
          pixels[offset + 2] = Math.round((blue * alphaIn + b0 * oldPart) / outAlpha);
          pixels[offset + 3] = Math.round(outAlpha * 255);
        }
        if (r0 !== pixels[offset] || g0 !== pixels[offset + 1] || b0 !== pixels[offset + 2] || a0 !== pixels[offset + 3]) {
          changed++; include(actual, fx, fy, fx + 1, fy + 1);
        }
      }
    }
    return { changed: changed, bounds: rectangle(actual, width, height) };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var hi = Math.max(r, g, b), lo = Math.min(r, g, b), delta = hi - lo, light = (hi + lo) / 2;
    if (!delta) return [0, 0, light];
    var sat = delta / (1 - Math.abs(2 * light - 1));
    var hue = hi === r ? ((g - b) / delta + (g < b ? 6 : 0)) : hi === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    return [hue / 6, sat, light];
  }
  function hslToRgb(h, s, l) {
    h = ((h % 1) + 1) % 1;
    var chroma = (1 - Math.abs(2 * l - 1)) * s, h6 = h * 6, x = chroma * (1 - Math.abs(h6 % 2 - 1)), m = l - chroma / 2;
    var r = 0, g = 0, b = 0;
    if (h6 < 1) { r = chroma; g = x; } else if (h6 < 2) { r = x; g = chroma; }
    else if (h6 < 3) { g = chroma; b = x; } else if (h6 < 4) { g = x; b = chroma; }
    else if (h6 < 5) { r = x; b = chroma; } else { r = chroma; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }
  /** In-place HSL: hue in degrees, saturation multiplier, additive lightness. */
  function adjust(image, options) {
    validImage(image); options = options || {};
    var hue = clamp(number(options.hue, 0), -180, 180) / 360;
    var sat = 1 + clamp(number(options.saturation, 0), -100, 100) / 100;
    var light = clamp(number(options.lightness, 0), -100, 100) / 100;
    if (!hue && sat === 1 && !light) return image;
    var data = image.data;
    for (var i = 0; i < data.length; i += 4) {
      if (!data[i + 3]) continue;
      var hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
      var rgb = hslToRgb(hsl[0] + hue, clamp(hsl[1] * sat, 0, 1), clamp(hsl[2] + light, 0, 1));
      data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2];
    }
    return image;
  }
  function hex(rgb) {
    return '#' + rgb.slice(0, 3).map(function (c) { return clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0'); }).join('');
  }

  // Weighted median-cut in a small RGB histogram. Deterministic and sufficient
  // for a local, finite-color trace; no remote model or full photograph tracer.
  function quantize(data, colorCount, alphaThreshold) {
    var counts = new Uint32Array(32768), reds = new Uint32Array(32768), greens = new Uint32Array(32768), blues = new Uint32Array(32768);
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < alphaThreshold) continue;
      var key = (data[i] >> 3) * 1024 + (data[i + 1] >> 3) * 32 + (data[i + 2] >> 3);
      counts[key]++; reds[key] += data[i]; greens[key] += data[i + 1]; blues[key] += data[i + 2];
    }
    var bins = [];
    for (var k = 0; k < 32768; k++) if (counts[k]) bins.push({ key: k, n: counts[k], r: reds[k] / counts[k], g: greens[k] / counts[k], b: blues[k] / counts[k] });
    function box(items) {
      var low = [255, 255, 255], high = [0, 0, 0], weight = 0;
      items.forEach(function (p) {
        var v = [p.r, p.g, p.b]; weight += p.n;
        for (var c = 0; c < 3; c++) { low[c] = Math.min(low[c], v[c]); high[c] = Math.max(high[c], v[c]); }
      });
      var ranges = high.map(function (v, c) { return v - low[c]; }), channel = ranges.indexOf(Math.max.apply(null, ranges));
      return { items: items, weight: weight, channel: channel, score: items.length > 1 ? ranges[channel] * Math.cbrt(weight) : -1 };
    }
    var boxes = bins.length ? [box(bins)] : [];
    while (boxes.length < colorCount && boxes.length) {
      var chosen = 0;
      for (var j = 1; j < boxes.length; j++) if (boxes[j].score > boxes[chosen].score) chosen = j;
      var b = boxes[chosen]; if (b.score <= 0) break;
      var field = ['r', 'g', 'b'][b.channel]; b.items.sort(function (a, z) { return a[field] - z[field]; });
      var cumulative = 0, mid = 1;
      for (var t = 0; t < b.items.length - 1; t++) { cumulative += b.items[t].n; mid = t + 1; if (cumulative >= b.weight / 2) break; }
      boxes.splice(chosen, 1, box(b.items.slice(0, mid)), box(b.items.slice(mid)));
    }
    var palette = boxes.map(function (b) {
      var r = 0, g = 0, blue = 0;
      b.items.forEach(function (p) { r += p.r * p.n; g += p.g * p.n; blue += p.b * p.n; });
      return [Math.round(r / b.weight), Math.round(g / b.weight), Math.round(blue / b.weight)];
    });
    var lookup = new Int16Array(32768); lookup.fill(-1);
    bins.forEach(function (bin) {
      var best = 0, bestDistance = Infinity;
      palette.forEach(function (p, index) {
        var distance = (p[0] - bin.r) ** 2 + (p[1] - bin.g) ** 2 + (p[2] - bin.b) ** 2;
        if (distance < bestDistance) { bestDistance = distance; best = index; }
      });
      lookup[bin.key] = best;
    });
    return { palette: palette, lookup: lookup };
  }
  function pointDistanceSq(point, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var t = dx || dy ? clamp(((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy), 0, 1) : 0;
    var x = a[0] + t * dx, y = a[1] + t * dy;
    return (point[0] - x) ** 2 + (point[1] - y) ** 2;
  }
  function simplifyOpen(points, epsilon) {
    if (points.length < 3) return points;
    var keep = new Uint8Array(points.length), stack = [[0, points.length - 1]], sq = epsilon * epsilon;
    keep[0] = 1; keep[points.length - 1] = 1;
    while (stack.length) {
      var pair = stack.pop(), first = pair[0], last = pair[1], furthest = -1, distance = sq;
      for (var i = first + 1; i < last; i++) {
        var d = pointDistanceSq(points[i], points[first], points[last]);
        if (d > distance) { distance = d; furthest = i; }
      }
      if (furthest !== -1) { keep[furthest] = 1; stack.push([first, furthest], [furthest, last]); }
    }
    return points.filter(function (_, i) { return keep[i]; });
  }
  function area(points) {
    var sum = 0;
    for (var i = 0; i < points.length; i++) { var a = points[i], b = points[(i + 1) % points.length]; sum += a[0] * b[1] - b[0] * a[1]; }
    return sum / 2;
  }
  function simplifyRing(points, epsilon) {
    // First remove exact collinearity without changing any pixel boundary.
    var clean = points.filter(function (p, i) {
      var before = points[(i + points.length - 1) % points.length], after = points[(i + 1) % points.length];
      return (p[0] - before[0]) * (after[1] - p[1]) !== (p[1] - before[1]) * (after[0] - p[0]);
    });
    if (clean.length < 4 || !epsilon) return clean.length >= 3 ? clean : points;
    var farthest = 1, max = -1;
    for (var i = 1; i < clean.length; i++) {
      var d = (clean[i][0] - clean[0][0]) ** 2 + (clean[i][1] - clean[0][1]) ** 2;
      if (d > max) { farthest = i; max = d; }
    }
    var first = simplifyOpen(clean.slice(0, farthest + 1), epsilon);
    var second = simplifyOpen(clean.slice(farthest).concat([clean[0]]), epsilon);
    var simplified = first.slice(0, -1).concat(second.slice(0, -1));
    // Preserve small holes/rings and orientation; aggressive simplification can
    // otherwise turn a one-pixel hole into a degenerate line.
    if (simplified.length < 3 || area(simplified) * area(clean) <= 0 || Math.abs(area(clean)) <= 4) return clean;
    return simplified;
  }
  function pathText(points) {
    var text = 'M' + points[0][0] + ' ' + points[0][1];
    for (var i = 1; i < points.length; i++) {
      var p = points[i], prev = points[i - 1];
      text += p[0] === prev[0] ? 'V' + p[1] : p[1] === prev[1] ? 'H' + p[0] : 'L' + p[0] + ' ' + p[1];
    }
    return text + 'Z';
  }

  /**
   * Trace region boundaries into real SVG paths. Transparent holes use evenodd.
   * Semi-transparent pixels retain 8 quantized opacity levels. Coordinates are
   * sampled at maxSize; SVG dimensions retain the original image proportions.
   * This is finite-color raster tracing, not semantic/Bezier vector drawing.
   */
  function vectorize(image, options) {
    validImage(image); options = options || {};
    var maxSize = Math.round(clamp(number(options.maxSize, 768), 64, 1600));
    var scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    var width = Math.max(1, Math.round(image.width * scale)), height = Math.max(1, Math.round(image.height * scale));
    var source = image.data, data;
    if (width === image.width && height === image.height) data = source;
    else {
      data = new Uint8ClampedArray(width * height * 4);
      for (var yy = 0; yy < height; yy++) for (var xx = 0; xx < width; xx++) {
        var sx = Math.min(image.width - 1, Math.floor((xx + 0.5) * image.width / width));
        var sy = Math.min(image.height - 1, Math.floor((yy + 0.5) * image.height / height));
        var from = (sy * image.width + sx) * 4, to = (yy * width + xx) * 4;
        data[to] = source[from]; data[to + 1] = source[from + 1]; data[to + 2] = source[from + 2]; data[to + 3] = source[from + 3];
      }
    }
    var alphaThreshold = clamp(number(options.alphaThreshold, 24), 1, 254);
    var mono = options.mode === 'mono', threshold = clamp(number(options.threshold, 160), 0, 255);
    var result = mono ? { palette: [[0, 0, 0]], lookup: null } : quantize(data, Math.round(clamp(number(options.colors, 8), 2, 24)), alphaThreshold);
    var palette = result.palette, labels = new Int16Array(width * height); labels.fill(-1);
    for (var p = 0; p < labels.length; p++) {
      var q = p * 4, alpha = data[q + 3]; if (alpha < alphaThreshold) continue;
      if (mono && data[q] * 0.2126 + data[q + 1] * 0.7152 + data[q + 2] * 0.0722 > threshold) continue;
      var color = mono ? 0 : result.lookup[(data[q] >> 3) * 1024 + (data[q + 1] >> 3) * 32 + (data[q + 2] >> 3)];
      var opacity = clamp(Math.round(alpha / 32), 1, 8) - 1;
      labels[p] = color * 8 + opacity;
    }
    var groups = new Map(), edgeCount = 0, stride = width + 1;
    var EDGE_LIMIT = 400000, POINT_LIMIT = 160000;
    function edge(group, vertex, direction) {
      if (++edgeCount > EDGE_LIMIT) throw new Error('画面细节过多，SVG 会过大。请降低矢量化分辨率或色数后重试。');
      var edges = groups.get(group); if (!edges) { edges = new Map(); groups.set(group, edges); }
      edges.set(vertex, (edges.get(vertex) || 0) | (1 << direction));
    }
    for (var y = 0; y < height; y++) for (var x = 0; x < width; x++) {
      var id = y * width + x, label = labels[id]; if (label < 0) continue;
      if (y === 0 || labels[id - width] !== label) edge(label, y * stride + x, 0);
      if (x === width - 1 || labels[id + 1] !== label) edge(label, y * stride + x + 1, 1);
      if (y === height - 1 || labels[id + width] !== label) edge(label, (y + 1) * stride + x + 1, 2);
      if (x === 0 || labels[id - 1] !== label) edge(label, (y + 1) * stride + x, 3);
    }
    var epsilon = clamp(number(options.simplify, 0.5), 0, 2), paths = [], pointCount = 0, contourCount = 0;
    var offsets = [1, stride, -1, -stride];
    groups.forEach(function (edges, group) {
      var contours = [];
      edges.forEach(function (_, start) {
        while (edges.get(start)) {
          var firstMask = edges.get(start), direction = 0;
          while (!(firstMask & (1 << direction))) direction++;
          var current = start, ring = [], guard = 0;
          do {
            ring.push([current % stride, Math.floor(current / stride)]);
            var remaining = edges.get(current) & ~(1 << direction);
            if (remaining) edges.set(current, remaining); else edges.delete(current);
            current += offsets[direction];
            if (current === start) break;
            var nextMask = edges.get(current) || 0, order = [(direction + 1) % 4, direction, (direction + 3) % 4, (direction + 2) % 4], next = -1;
            for (var i = 0; i < 4; i++) if (nextMask & (1 << order[i])) { next = order[i]; break; }
            if (next < 0 || ++guard > EDGE_LIMIT) throw new Error('无法闭合矢量轮廓，请降低细节后重试。');
            direction = next;
          } while (current !== start);
          var simplified = simplifyRing(ring, epsilon);
          if (simplified.length < 3) continue;
          pointCount += simplified.length; contourCount++;
          if (pointCount > POINT_LIMIT) throw new Error('矢量节点过多。请降低分辨率、减少色数或提高简化程度。');
          contours.push(pathText(simplified));
        }
      });
      if (contours.length) {
        var opacity = Math.min(255, ((group % 8) + 1) * 32) / 255;
        paths.push('<path fill="' + hex(palette[Math.floor(group / 8)]) + '"' +
          (opacity < 1 ? ' fill-opacity="' + opacity.toFixed(4) + '"' : '') +
          ' fill-rule="evenodd" d="' + contours.join('') + '"/>');
      }
    });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + image.width + '" height="' + image.height +
      '" viewBox="0 0 ' + width + ' ' + height + '">\n' + paths.join('\n') + '\n</svg>';
    return { svg: svg, width: image.width, height: image.height, workingWidth: width, workingHeight: height,
      colors: palette.map(hex), paths: paths.length, points: pointCount, contours: contourCount };
  }

  /**
   * Match the workspace's CSS hue-rotate(...) saturate(...) brightness(...).
   * These operations use non-premultiplied, gamma-encoded sRGB (not HSL).
   * Clamp after each filter primitive, retaining float precision until the last
   * write. Alpha is unchanged. See W3C Filter Effects 1, sections 9.6 and 13.1:
   * https://drafts.csswg.org/filter-effects-1/#feColorMatrixElement
   * https://drafts.csswg.org/filter-effects-1/#brightnessEquivalent
   */
  function adjustFilter(image, options) {
    validImage(image); options = options || {};
    var degrees = clamp(number(options.hue, 0), -180, 180);
    var saturation = 1 + clamp(number(options.saturation, 0), -100, 100) / 100;
    var brightness = 1 + clamp(number(options.lightness, 0), -100, 100) / 100;
    if (!degrees && saturation === 1 && brightness === 1) return image;
    var angle = degrees * Math.PI / 180, cosine = Math.cos(angle), sine = Math.sin(angle);
    var h00 = .213 + .787 * cosine - .213 * sine;
    var h01 = .715 - .715 * cosine - .715 * sine;
    var h02 = .072 - .072 * cosine + .928 * sine;
    var h10 = .213 - .213 * cosine + .143 * sine;
    var h11 = .715 + .285 * cosine + .140 * sine;
    var h12 = .072 - .072 * cosine - .283 * sine;
    var h20 = .213 - .213 * cosine - .787 * sine;
    var h21 = .715 - .715 * cosine + .715 * sine;
    var h22 = .072 + .928 * cosine + .072 * sine;
    var inverseSaturation = 1 - saturation, data = image.data;
    for (var i = 0; i < data.length; i += 4) {
      if (!data[i + 3]) continue;
      var r = data[i], g = data[i + 1], b = data[i + 2];
      if (degrees) {
        var hr = clamp(h00 * r + h01 * g + h02 * b, 0, 255);
        var hg = clamp(h10 * r + h11 * g + h12 * b, 0, 255);
        var hb = clamp(h20 * r + h21 * g + h22 * b, 0, 255);
        r = hr; g = hg; b = hb;
      }
      if (saturation !== 1) {
        var gray = (.213 * r + .715 * g + .072 * b) * inverseSaturation;
        r = clamp(gray + saturation * r, 0, 255);
        g = clamp(gray + saturation * g, 0, 255);
        b = clamp(gray + saturation * b, 0, 255);
      }
      data[i] = Math.round(clamp(r * brightness, 0, 255));
      data[i + 1] = Math.round(clamp(g * brightness, 0, 255));
      data[i + 2] = Math.round(clamp(b * brightness, 0, 255));
    }
    return image;
  }

  return { makeStroke: makeStroke, floodFill: floodFill, vectorize: vectorize, adjust: adjust, adjustFilter: adjustFilter,
    rgbToHsl: rgbToHsl, hslToRgb: hslToRgb };
});
