/* Small, deterministic image operations for drawing studies. No DOM or network access. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ColorBlockStudyCore = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var linear = new Float64Array(256);
  var grayTable = new Uint8Array(4097);
  var i;
  for (i = 0; i < 256; i++) {
    var s = i / 255;
    linear[i] = s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }
  for (i = 0; i <= 4096; i++) {
    var y = i / 4096;
    grayTable[i] = Math.round(255 * (y <= 0.0031308 ? 12.92 * y : 1.055 * Math.pow(y, 1 / 2.4) - 0.055));
  }

  function clamp(value, low, high, fallback) {
    value = Number(value);
    return Number.isFinite(value) ? Math.max(low, Math.min(high, value)) : fallback;
  }

  function pixelCount(w, h) {
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) {
      throw new RangeError('Image dimensions must be positive integers.');
    }
    return w * h;
  }

  function requireLength(data, n) {
    if (!data || data.length < n) throw new RangeError('Image data is shorter than its dimensions.');
  }

  function luminance(r, g, b) {
    return 0.2126729 * linear[r] + 0.7151522 * linear[g] + 0.0721750 * linear[b];
  }

  /* CIE L* with the sRGB/D65 reference white (Y_n = 1). */
  function lightness(r, g, b) {
    var y = luminance(r, g, b);
    return Math.min(100, y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y);
  }

  function lightnessToY(l) {
    return l > 8 ? Math.pow((l + 16) / 116, 3) : l * 27 / 24389;
  }

  function normalLevels(levels) {
    return levels === 2 || levels === 5 ? levels : 3;
  }

  function valueThresholds(levels, dark, light) {
    levels = normalLevels(levels);
    dark = clamp(dark, 1, 99, 35);
    light = clamp(light, 1, 99, 72);
    if (levels === 2) return [dark];
    if (dark > light) { var swap = dark; dark = light; light = swap; }
    if (light === dark) light = Math.min(99.5, dark + 0.5);
    return levels === 5 ? [dark * 0.5, dark, light, (light + 100) * 0.5] : [dark, light];
  }

  /* Group assignment is independent of the output palette; changing a swatch cannot move pixels. */
  function valueIndices(rgb, w, h, levels, dark, light) {
    var n = pixelCount(w, h);
    requireLength(rgb, n * 3);
    var cuts = valueThresholds(levels, dark, light).map(lightnessToY);
    var out = new Uint8Array(n);
    for (var p = 0, o = 0; p < n; p++, o += 3) {
      var y = luminance(rgb[o], rgb[o + 1], rgb[o + 2]);
      var group = 0;
      while (group < cuts.length && y >= cuts[group]) group++;
      out[p] = group;
    }
    return out;
  }

  function defaultValuePalette(levels) {
    levels = normalLevels(levels);
    var values = levels === 2 ? [30, 240] : (levels === 5 ? [24, 78, 137, 195, 245] : [30, 145, 240]);
    return values.map(function (v) { return { r: v, g: v, b: v, mode: 'normal' }; });
  }

  /* Same linear-light luminance -> sRGB-gray convention as the existing tool. */
  function grayValues(rgb) {
    requireLength(rgb, 3);
    var n = Math.floor(rgb.length / 3);
    var out = new Uint8Array(n);
    for (var p = 0, o = 0; p < n; p++, o += 3) {
      var y = luminance(rgb[o], rgb[o + 1], rgb[o + 2]);
      out[p] = grayTable[Math.max(0, Math.min(4096, Math.round(y * 4096)))];
    }
    return out;
  }

  /* Optional color-range heuristic, not a face/skin detector; also matches some warm objects. */
  function skinColorHint(r, g, b) {
    if (0.299 * r + 0.587 * g + 0.114 * b <= 50) return false;
    var cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    var cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
  }

  /* Grayscale mask: 0 = ink, 255 = paper. Pass pre-smoothed RGB when smoothing is wanted. */
  function blackMask(rgb, w, h, threshold, protectSkin) {
    var n = pixelCount(w, h);
    requireLength(rgb, n * 3);
    var cut = lightnessToY(clamp(threshold, 0, 100, 25));
    var out = new Uint8ClampedArray(n);
    for (var p = 0, o = 0; p < n; p++, o += 3) {
      var black = luminance(rgb[o], rgb[o + 1], rgb[o + 2]) < cut;
      if (black && protectSkin && skinColorHint(rgb[o], rgb[o + 1], rgb[o + 2])) black = false;
      out[p] = black ? 0 : 255;
    }
    return out;
  }

  /* Nearest labels, not interpolated colors: preserves region identity on export. */
  function resizeIndicesNearest(indices, srcW, srcH, dstW, dstH) {
    var sourceN = pixelCount(srcW, srcH);
    var destN = pixelCount(dstW, dstH);
    requireLength(indices, sourceN);
    var out = new Uint8Array(destN);
    var xs = new Uint32Array(dstW);
    for (var x = 0; x < dstW; x++) xs[x] = Math.min(srcW - 1, Math.floor((x + 0.5) * srcW / dstW));
    for (var y = 0; y < dstH; y++) {
      var row = Math.min(srcH - 1, Math.floor((y + 0.5) * srcH / dstH)) * srcW;
      for (var xx = 0; xx < dstW; xx++) out[y * dstW + xx] = indices[row + xs[xx]];
    }
    return out;
  }

  /*
   * Strokes are replayable vectors: {tool, radius, points:[[x,y], ...]}.
   * Points use image coordinates in [0,1]; radius is a fraction of min(width,height).
   * Output is a new grayscale mask. Erase/keep restore the original input mask,
   * not the result of an earlier stroke. kind is a default-tool hint ('line'/'black').
   */
  function applyStrokes(mask, w, h, strokes, kind) {
    var n = pixelCount(w, h);
    requireLength(mask, n);
    var out = new Uint8ClampedArray(n);
    out.set(mask.subarray ? mask.subarray(0, n) : mask.slice(0, n));
    if (!strokes || !strokes.length) return out;
    var known = { black: true, white: true, erase: true, 'line-keep': true, 'line-remove': true, 'line-soft': true };

    function change(p, tool) {
      if (tool === 'black') out[p] = 0;
      else if (tool === 'white' || tool === 'line-remove') out[p] = 255;
      else if (tool === 'line-soft') out[p] = Math.max(mask[p], 160);
      else out[p] = mask[p];
    }

    function capsule(ax, ay, bx, by, radius, tool) {
      var x0 = Math.max(0, Math.ceil(Math.min(ax, bx) - radius));
      var x1 = Math.min(w - 1, Math.floor(Math.max(ax, bx) + radius));
      var y0 = Math.max(0, Math.ceil(Math.min(ay, by) - radius));
      var y1 = Math.min(h - 1, Math.floor(Math.max(ay, by) + radius));
      var dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      var rr = radius * radius;
      for (var yy = y0; yy <= y1; yy++) {
        for (var xx = x0; xx <= x1; xx++) {
          var t = len2 ? Math.max(0, Math.min(1, ((xx - ax) * dx + (yy - ay) * dy) / len2)) : 0;
          var ex = xx - (ax + t * dx), ey = yy - (ay + t * dy);
          if (ex * ex + ey * ey <= rr) change(yy * w + xx, tool);
        }
      }
    }

    for (var s = 0; s < strokes.length; s++) {
      var stroke = strokes[s];
      if (!stroke || !Array.isArray(stroke.points)) continue;
      var tool = stroke.tool || (kind === 'black' ? 'black' : 'line-keep');
      if (!known[tool]) continue;
      var r = clamp(stroke.radius, 0, 2, 0.01) * Math.min(w, h);
      if (!r) continue;
      r = Math.max(0.5, r);
      var prev = null;
      for (var q = 0; q < stroke.points.length; q++) {
        var point = stroke.points[q];
        if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) { prev = null; continue; }
        var px = point[0] * (w - 1), py = point[1] * (h - 1);
        if (prev) capsule(prev[0], prev[1], px, py, r, tool);
        else capsule(px, py, px, py, r, tool);
        prev = [px, py];
      }
    }
    return out;
  }

  return {
    lightness: lightness,
    grayValues: grayValues,
    valueThresholds: valueThresholds,
    valueIndices: valueIndices,
    defaultValuePalette: defaultValuePalette,
    blackMask: blackMask,
    resizeIndicesNearest: resizeIndicesNearest,
    applyStrokes: applyStrokes
  };
});
