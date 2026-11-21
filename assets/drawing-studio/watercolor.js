/* Watercolor on a continuously wet sheet, transparent glazing, and drybrush.
 * A wet stroke edits a working copy of its current layer; it never holds hidden
 * pigment after committing. Glaze/dry strokes use a transparent working canvas.
 * All three build one continuous coverage field, so neither input-event rate
 * nor overlapping round stamps produces extra layers or rings within a stroke.
 * Spectral.js 3.0.0 supplies MIT-licensed approximate pigment mixing. */
(function (root, factory) {
  'use strict';
  var common = typeof module === 'object' && module.exports;
  var api = factory(common ? require('./vendor/spectral/spectral.js') : root && root.spectral);
  if (common) module.exports = api;
  if (root) root.DrawingWatercolor = api;
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null, function (Spectral) {
  'use strict';

  var presets = [
    { id: 'watercolorWet', name: '湿水彩 · 融色', group: '水彩', size: 48, opacity: .8, stabilizer: 12,
      watercolor: true, watercolorWater: .7, watercolorEdge: .3, watercolorBloom: .2, watercolorVariation: .25, textureControls: true, samplesLayer: true,
      hint: '持续湿纸：本层颜色相接时柔和融色，不会按时间晾干。换色后仍可融合；线稿可放在另一图层。' },
    { id: 'watercolorGlaze', name: '干水彩 · 罩染', group: '水彩', size: 42, opacity: .68, stabilizer: 12,
      watercolor: true, watercolorWater: .4, watercolorEdge: .3, watercolorBloom: .15, watercolorVariation: .25, textureControls: true,
      hint: '一笔一层透明罩染。抬笔后再画，交叠处颜色加深，保留清晰而略有积色的边缘。' },
    { id: 'watercolorDry', name: '枯笔水彩 · 颗粒', group: '水彩', size: 36, opacity: .76, stabilizer: 10,
      watercolor: true, watercolorWater: .15, watercolorEdge: .35, watercolorBloom: .1, watercolorVariation: .3, textureControls: true,
      hint: '较少水分让颜料擦过纸纹高处，留下断续颗粒和露白。压重可铺宽，抬笔后能够叠色。' }
  ];
  var TILE = 64, PAPER = 256, PAPER_MASK = PAPER - 1;
  var paper = null, cloud = null, edges = null;
  var colors = new Map(), mixtures = new Map();
  var COLOR_LIMIT = 256, MIX_LIMIT = 4096;
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function number(n, fallback) { return Number.isFinite(Number(n)) ? Number(n) : fallback; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function hash(x, y, seed) {
    var h = Math.imul(x + 713, 374761393) ^ Math.imul(y + 193, 668265263) ^ seed;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function noise(x, y, period, seed) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
    var x0 = ((ix % period) + period) % period, x1 = (x0 + 1) % period;
    var y0 = ((iy % period) + period) % period, y1 = (y0 + 1) % period;
    return (hash(x0, y0, seed) * (1 - fx) + hash(x1, y0, seed) * fx) * (1 - fy) +
      (hash(x0, y1, seed) * (1 - fx) + hash(x1, y1, seed) * fx) * fy;
  }
  function makePaper() {
    if (paper) return;
    paper = new Uint8Array(PAPER * PAPER); cloud = new Uint8Array(paper.length); edges = new Uint8Array(paper.length);
    for (var y = 0; y < PAPER; y++) for (var x = 0; x < PAPER; x++) {
      var i = y * PAPER + x;
      // Small depressions clustered into fibers; a second, broad field supplies
      // the pooling/mottling. Both repeat seamlessly in paper coordinates.
      var fine = noise(x / 2, y / 2, 128, 13579), middle = noise(x / 8, y / 8, 32, 8243);
      paper[i] = Math.round(255 * clamp(.5 + (fine - .5) * .95 + (middle - .5) * .55, 0, 1));
      // Different integer wave directions keep the 256 px field periodic but
      // remove the straight contour bands of interpolated grid noise. Smooth
      // domain warping breaks regular wave shapes into organic water blooms.
      var tau = 2 * Math.PI / PAPER;
      var wx = x + 17 * Math.sin(tau * (2 * x + y) + .4) + 9 * Math.sin(tau * (x - 3 * y) + 1.7);
      var wy = y + 14 * Math.sin(tau * (-x + 2 * y) + 2.2) + 11 * Math.sin(tau * (3 * x + 2 * y) + .8);
      var waves = .26 * Math.sin(tau * (3 * wx + 2 * wy) + .7) + .22 * Math.sin(tau * (wx - 5 * wy) + 2.1) +
        .17 * Math.sin(tau * (-4 * wx + 3 * wy) + 4.2) + .13 * Math.sin(tau * (5 * wx + wy) + 5.4) +
        .09 * Math.sin(tau * (2 * wx + 7 * wy) + 1.6) + .07 * Math.sin(tau * (-7 * wx + 2 * wy) + 3.1) +
        .04 * Math.sin(tau * (7 * wx + 5 * wy) + .2) + .02 * Math.sin(tau * (8 * wx - 4 * wy) + 5.9);
      cloud[i] = Math.round(255 * clamp(.5 + .42 * waves, 0, 1));
      edges[i] = Math.round(255 * noise(x / 16, y / 16, 16, 27183));
    }
  }
  function paperAt(field, x, y) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var x0 = ix & PAPER_MASK, x1 = (ix + 1) & PAPER_MASK, y0 = (iy & PAPER_MASK) * PAPER, y1 = ((iy + 1) & PAPER_MASK) * PAPER;
    return ((field[y0 + x0] * (1 - fx) + field[y0 + x1] * fx) * (1 - fy) +
      (field[y1 + x0] * (1 - fx) + field[y1 + x1] * fx) * fy) / 255;
  }
  function putBounded(cache, key, value, limit) {
    cache.set(key, value);
    if (cache.size > limit) cache.delete(cache.keys().next().value);
    return value;
  }
  function spectralColor(r, g, b) {
    var key = (r << 16) | (g << 8) | b, found = colors.get(key);
    if (found) return found;
    return putBounded(colors, key, new Spectral.Color([r, g, b]), COLOR_LIMIT);
  }
  function pigment(r, g, b, ink, inkColor, amount) {
    if (amount >= .999) return ink;
    // Identical paint should stay identical, not wander after multiple RGB /
    // reconstructed-reflectance round trips on a wet sheet.
    if (Math.abs(r - ink[0]) + Math.abs(g - ink[1]) + Math.abs(b - ink[2]) < 7) return ink;
    var rr = clamp(Math.round(r / 8) * 8, 0, 255), gg = clamp(Math.round(g / 8) * 8, 0, 255), bb = clamp(Math.round(b / 8) * 8, 0, 255);
    var t = clamp(Math.round(amount * 32), 1, 31), packed = (rr << 16) | (gg << 8) | bb;
    var key = packed + ':' + ink.join(',') + ':' + t, hit = mixtures.get(key);
    if (hit) return hit;
    var out = Spectral.mix([spectralColor(rr, gg, bb), 1 - t / 32], [inkColor, t / 32]).sRGB;
    return putBounded(mixtures, key, [out[0], out[1], out[2]], MIX_LIMIT);
  }
  function rectangle(b, width, height) {
    if (!Number.isFinite(b.left)) return null;
    var x = clamp(Math.floor(b.left), 0, width), y = clamp(Math.floor(b.top), 0, height);
    var right = clamp(Math.ceil(b.right), 0, width), bottom = clamp(Math.ceil(b.bottom), 0, height);
    return right > x && bottom > y ? { x: x, y: y, width: right - x, height: bottom - y } : null;
  }

  function makeStroke(ctx, options) {
    options = options || {};
    var preset = presets.find(function (item) { return item.id === options.brush; }) || presets[0];
    var wet = preset.id === 'watercolorWet', dry = preset.id === 'watercolorDry';
    if (wet && (!Spectral || !Spectral.Color || !Spectral.mix)) throw new Error('水彩混色组件未加载，请刷新画室。');
    makePaper();
    var width = ctx.canvas.width, height = ctx.canvas.height;
    var size = clamp(number(options.size, preset.size), .5, 512), stabilized = clamp(number(options.stabilizer, preset.stabilizer), 0, 100);
    var usePressure = options.pressure !== false, water = clamp(number(options.watercolorWater, preset.watercolorWater), 0, 1);
    var edge = clamp(number(options.watercolorEdge, preset.watercolorEdge), 0, 1);
    var bloom = clamp(number(options.watercolorBloom, preset.watercolorBloom), 0, 1);
    var variation = clamp(number(options.watercolorVariation, preset.watercolorVariation), 0, 1);
    var scale = clamp(number(options.textureScale, 1), .25, 4), density = clamp(number(options.textureDensity, 1), .25, 2);
    var match = /^#([a-f\d]{6})$/i.exec(options.color || '#263544'), packed = match ? parseInt(match[1], 16) : 0x263544;
    var ink = [packed >> 16, (packed >> 8) & 255, packed & 255], inkColor = wet ? spectralColor(ink[0], ink[1], ink[2]) : null;
    var tiles = new Map(), dirty = new Set(), columns = Math.ceil(width / TILE);
    var bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    var last = null, lastRaw = null, sample = null, untilDab = 0, pressure = 1, ended = false;
    // A mild extra feather and a gentler middle range leave ordinary washes
    // with rounder caps. Maximum edge character and true drybrush stay intact.
    var contourEdge = dry ? edge : edge * (.5 + .5 * edge);
    var softness = wet ? .20 + water * .25 : dry ? .10 + water * .08 : .11 + water * .13;
    var baseAlpha = wet ? .45 - water * .15 : dry ? .65 - water * .15 : .52 - water * .16;
    var ridgeStrength = edge * (wet ? .16 + water * .05 : dry ? .08 : .30 - water * .08);
    var threshold = (dry ? .49 - water * .12 : wet ? .19 - water * .06 : .24 - water * .07) - Math.log2(density) * .18;
    var bleedRadius = Math.max(1, Math.min(9, size * (.012 + water * .06)));

    function tileAt(tx, ty) {
      if (tx < 0 || ty < 0 || tx * TILE >= width || ty * TILE >= height) return null;
      var key = ty * columns + tx, tile = tiles.get(key);
      if (!tile) {
        var x = tx * TILE, y = ty * TILE, w = Math.min(TILE, width - x), h = Math.min(TILE, height - y);
        tile = { key: key, x: x, y: y, width: w, height: h, mask: new Uint8Array(w * h),
          base: wet ? ctx.getImageData(x, y, w, h).data : null, pickup: null, sampled: null };
        tiles.set(key, tile);
      }
      return tile;
    }
    function basePixel(x, y, out, factor) {
      x = Math.floor(x); y = Math.floor(y);
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      var tile = tileAt(Math.floor(x / TILE), Math.floor(y / TILE));
      var i = ((y - tile.y) * tile.width + x - tile.x) * 4, a = tile.base[i + 3] / 255 * factor;
      out[0] += tile.base[i] * a; out[1] += tile.base[i + 1] * a; out[2] += tile.base[i + 2] * a; out[3] += a;
    }
    function pickupAt(tile, x, y) {
      // Neighborhood diffusion is sampled on a 4 px grid and cached for this
      // stroke. Its source is immutable original RGBA, even across tile edges.
      if (!tile.pickup) { tile.pickup = new Float32Array(16 * 16 * 4); tile.sampled = new Uint8Array(16 * 16); }
      var gx = Math.floor((x - tile.x) / 4), gy = Math.floor((y - tile.y) / 4), cell = gy * 16 + gx, i = cell * 4;
      if (!tile.sampled[cell]) {
        var sum = [0, 0, 0, 0], sx = tile.x + gx * 4 + 1.5, sy = tile.y + gy * 4 + 1.5;
        basePixel(sx, sy, sum, .36);
        basePixel(sx - bleedRadius, sy, sum, .16); basePixel(sx + bleedRadius, sy, sum, .16);
        basePixel(sx, sy - bleedRadius, sum, .16); basePixel(sx, sy + bleedRadius, sum, .16);
        if (sum[3]) { tile.pickup[i] = sum[0] / sum[3]; tile.pickup[i + 1] = sum[1] / sum[3]; tile.pickup[i + 2] = sum[2] / sum[3]; }
        tile.pickup[i + 3] = sum[3]; tile.sampled[cell] = 1;
      }
      return i;
    }
    function pointOf(point, ending) {
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
      var pen = point.pointerType === 'pen', p = clamp(number(point.pressure, .5), 0, 1);
      if (pen && p > 0) pressure = p;
      else if (!pen) pressure = 1;
      if (!pen || !usePressure) p = 1;
      else if (p <= 0) p = ending && last ? last.pressure : Math.min(pressure, .05);
      return { x: point.x, y: point.y, pressure: p, time: number(point.time, number(point.timeStamp, NaN)) };
    }
    function dab(point) {
      var diameter = size * (usePressure ? .12 + .88 * Math.pow(point.pressure, .72) : 1), r = Math.max(.25, diameter / 2);
      var outer = r * (1 + contourEdge * .08) + 1, left = Math.max(0, Math.floor(point.x - outer)), top = Math.max(0, Math.floor(point.y - outer));
      var right = Math.min(width, Math.ceil(point.x + outer)), bottom = Math.min(height, Math.ceil(point.y + outer));
      sample = point;
      if (right <= left || bottom <= top) return Math.max(.45, diameter * .12);
      bounds.left = Math.min(bounds.left, left); bounds.top = Math.min(bounds.top, top);
      bounds.right = Math.max(bounds.right, right); bounds.bottom = Math.max(bounds.bottom, bottom);
      for (var ty = Math.floor(top / TILE); ty <= Math.floor((bottom - 1) / TILE); ty++) {
        for (var tx = Math.floor(left / TILE); tx <= Math.floor((right - 1) / TILE); tx++) {
          var tile = tileAt(tx, ty), changed = false;
          var x0 = Math.max(left, tile.x), y0 = Math.max(top, tile.y), x1 = Math.min(right, tile.x + tile.width), y1 = Math.min(bottom, tile.y + tile.height);
          for (var y = y0; y < y1; y++) {
            var dy = (y + .5 - point.y) / r, row = (y - tile.y) * tile.width;
            for (var x = x0; x < x1; x++) {
              var index = row + x - tile.x;
              if (tile.mask[index] === 255) continue;
              var dx = (x + .5 - point.x) / r, distance2 = dx * dx + dy * dy;
              if (distance2 > 1.18) continue;
              var jitter = (edges[(y & PAPER_MASK) * PAPER + (x & PAPER_MASK)] / 255 - .5) * contourEdge * .16;
              var v = smooth((1 + jitter - Math.sqrt(distance2)) / Math.max(softness, 1 / Math.max(1, r)));
              var coverage = Math.round(255 * v);
              if (coverage > tile.mask[index]) { tile.mask[index] = coverage; changed = true; }
            }
          }
          if (changed) dirty.add(tile.key);
        }
      }
      return Math.max(.45, diameter * .12);
    }
    function segment(a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
      if (!distance) return;
      while (untilDab <= distance + 1e-7) {
        var t = Math.min(1, untilDab / distance);
        untilDab += dab({ x: a.x + dx * t, y: a.y + dy * t, pressure: a.pressure + (b.pressure - a.pressure) * t,
          time: a.time + (b.time - a.time) * t });
      }
      untilDab -= distance;
    }
    function flush() {
      if (!dirty.size) return;
      var keys = Array.from(dirty); dirty.clear();
      for (var k = 0; k < keys.length; k++) {
        var tile = tiles.get(keys[k]), image = ctx.createImageData(tile.width, tile.height), out = image.data;
        if (wet) out.set(tile.base);
        for (var y = 0; y < tile.height; y++) for (var x = 0; x < tile.width; x++) {
          var cell = y * tile.width + x, m = tile.mask[cell] / 255;
          if (!m) continue;
          var px = tile.x + x, py = tile.y + y, i = cell * 4;
          var tooth = paperAt(paper, px / scale, py / scale), pool = paperAt(cloud, px / scale, py / scale);
          var grain = smooth((tooth - threshold) / (dry ? .21 : .27));
          if (!dry) {
            // A wet wash fills the valleys of the sheet. Ordinary wet/glazing
            // defaults should show slight pigment grain, not dry chalk holes.
            // The low end of density can still expose genuinely sparse paper.
            var floor = (wet ? .96 : .92) * smooth((density - .25) / .75);
            grain = floor + (1 - floor) * grain;
          }
          // Only the union's outer transition receives a rim: covered stamp
          // edges disappear as the next dab joins the continuous body.
          var ridge = smooth((m - .30) / .45) * (1 - smooth((m - .87) / .13));
          var concentration = 1 + variation * 1.65 * (pool - .5);
          // Broad contour bands make a pale bloom with a modest pigment rim.
          // They belong to the paper, not to the sequence of circular dabs.
          var waterRim = Math.exp(-Math.pow((pool - .51) / .045, 2));
          var waterTrace = 1 + bloom * (.36 * waterRim - .64 * smooth((pool - .51) / .15));
          var paint = clamp(m * (baseAlpha * concentration * waterTrace + ridgeStrength * ridge) * grain, 0, 1);
          if (!paint) continue;
          if (!wet) {
            out[i] = ink[0]; out[i + 1] = ink[1]; out[i + 2] = ink[2]; out[i + 3] = Math.round(255 * paint);
            continue;
          }
          var oldAlpha = tile.base[i + 3] / 255, nr = ink[0], ng = ink[1], nb = ink[2];
          var pickupIndex = pickupAt(tile, px, py), pickup = tile.pickup, spread = water * .43;
          var oldMass = oldAlpha * (1 - spread) + pickup[pickupIndex + 3] * spread;
          if (oldMass > .001) {
            var centerWeight = oldAlpha * (1 - spread), sideWeight = pickup[pickupIndex + 3] * spread;
            var rr = (tile.base[i] * centerWeight + pickup[pickupIndex] * sideWeight) / oldMass;
            var gg = (tile.base[i + 1] * centerWeight + pickup[pickupIndex + 1] * sideWeight) / oldMass;
            var bb = (tile.base[i + 2] * centerWeight + pickup[pickupIndex + 2] * sideWeight) / oldMass;
            var mixed = pigment(rr, gg, bb, ink, inkColor, paint / (paint + oldMass));
            nr = mixed[0]; ng = mixed[1]; nb = mixed[2];
          }
          // Re-wet pigment joins the existing wash instead of adding another
          // transparency layer. Sparse paper pores retain already present ink.
          var alpha = Math.max(oldAlpha, paint, pickup[pickupIndex + 3] * water * .22 * m * grain);
          out[i] = nr; out[i + 1] = ng; out[i + 2] = nb; out[i + 3] = Math.round(255 * alpha);
        }
        ctx.putImageData(image, tile.x, tile.y);
      }
    }
    function start(point) {
      if (ended || last) return;
      last = pointOf(point, false); if (!last) return;
      lastRaw = last; untilDab = dab(last);
    }
    function move(point) {
      if (ended) return;
      if (!last) { start(point); return; }
      var raw = pointOf(point, false); if (!raw) return;
      var amount = 1;
      if (stabilized > 0) {
        var dt = raw.time - lastRaw.time;
        if (Number.isFinite(dt) && dt > 0) amount = 1 - Math.exp(-clamp(dt, .1, 100) / (stabilized * .55));
        else amount = 1 - Math.exp(-Math.max(.1, Math.hypot(raw.x - lastRaw.x, raw.y - lastRaw.y)) / (1 + stabilized * .22));
      }
      var next = { x: last.x + (raw.x - last.x) * amount, y: last.y + (raw.y - last.y) * amount,
        pressure: last.pressure + (raw.pressure - last.pressure) * Math.max(.15, amount), time: raw.time };
      segment(last, next); last = next; lastRaw = raw;
    }
    function end(point) {
      if (ended) return;
      if (!last && point) start(point);
      if (last) {
        var raw = point ? pointOf(point, true) : lastRaw;
        if (raw) {
          segment(last, raw);
          if (!sample || Math.hypot(raw.x - sample.x, raw.y - sample.y) > 1e-6) dab(raw);
          last = raw;
        }
      }
      flush(); ended = true;
      // No pigment/coverage buffer survives a completed stroke. Undo and
      // project restoration therefore only have the visible layer to restore.
      tiles.clear(); dirty.clear();
    }
    return { start: start, move: move, end: end, flush: flush,
      get bounds() { return rectangle(bounds, width, height); } };
  }
  return { presets: presets, makeStroke: makeStroke,
    cacheStats: function () { return { paperBytes: paper ? paper.byteLength + cloud.byteLength + edges.byteLength : 0,
      colors: colors.size, mixtures: mixtures.size, colorLimit: COLOR_LIMIT, mixtureLimit: MIX_LIMIT }; } };
});
