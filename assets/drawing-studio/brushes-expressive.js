/* Original procedural brushes for 轻绘. No third-party brush code or assets. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DrawingExpressiveBrushes = api;
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null, function () {
  'use strict';

  var TAU = Math.PI * 2, TILE = 64, PAPER = 128, CELL_LIMIT = 8192, paper = null;
  var definitions = [
    ['charcoal-side', '侧锋炭条', '干性', 38, .88, .075, true, '宽扁侧锋铺出纸纹明暗，压得越重覆盖越实。'],
    ['charcoal-chip', '碎炭', '干性', 28, .90, .09, true, '棱角炭块与粗碎纸纹，适合粗粝阴影。'],
    ['wax', '蜡粉彩', '干性', 30, .92, .075, true, '圆润蜡质色块中留出纸面细孔，可叠色。'],
    ['rake', '扇形排笔', '线束', 36, .90, .065, false, '七道连续笔线沿笔路张合成扇，压感控制展开宽度。'],
    ['fur', '轻绒毛', '线束', 32, .90, .15, false, '顺着行笔方向牵出短弯毛，适合绒边与草丝。'],
    ['bristle', '干鬃刷', '线束', 42, .92, .06, true, '分明的硬鬃拖痕与间歇枯墨，关闭纹理保留毛束。'],
    ['halftone', '网点笔', '颗粒', 42, 1, .12, false, '稳定网格上的印刷圆点，压感改变点径与覆盖。'],
    ['splatter', '墨滴飞溅', '颗粒', 46, .90, .34, false, '大墨滴带着远近小滴，适合喷溅与粗糙边缘。'],
    ['stardust', '星尘', '颗粒', 50, .90, .26, false, '细碎光点夹着四角星，使用当前选中的颜色。'],
    ['chain', '链纹笔', '装饰', 26, 1, .34, false, '交替的椭圆空心链环，弯曲时沿着笔路转向。'],
    ['wave', '波纹排线', '装饰', 30, .95, .055, false, '三道连续波纹跟随笔路，波长不受事件频率影响。'],
    ['feather', '羽状线', '装饰', 32, .95, .17, false, '细中轴两侧长出斜向羽枝，适合羽饰与叶脉。'],
    ['smoke', '烟丝', '气氛', 42, .80, .055, false, '数束轻透烟带缓慢交错，转弯时顺着笔势流动。'],
    ['cloud', '云团', '气氛', 68, .75, .18, true, '柔软云瓣连成蓬松轮廓，内部细纹可独立关闭。'],
    ['flame', '焰舌', '气氛', 44, .85, .43, false, '弯尖火舌拖出浅色内焰，保留所选颜色。']
  ];
  var presets = definitions.map(function (row) {
    return { id: 'expressive-' + row[0], name: row[1], group: '趣味·' + row[2],
      size: row[3], opacity: row[4], stabilizer: 0, pressureEnabled: true,
      textureControls: row[6], textureScale: 1, textureDensity: 1,
      samplesLayer: false, hint: row[7] };
  });
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function number(v, fallback) { return Number.isFinite(v) ? v : fallback; }
  function smooth(v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); }
  function hash(v) {
    v = Math.imul(v ^ (v >>> 16), 0x7feb352d);
    v = Math.imul(v ^ (v >>> 15), 0x846ca68b);
    return (v ^ (v >>> 16)) >>> 0;
  }
  function makePaper() {
    if (paper) return;
    paper = new Uint8Array(PAPER * PAPER);
    for (var i = 0; i < paper.length; i++) paper[i] = hash(i ^ 0x6c726478) >>> 24;
  }
  function grain(x, y, soft) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
    var x0 = ix & 127, x1 = (ix + 1) & 127, y0 = (iy & 127) * PAPER, y1 = ((iy + 1) & 127) * PAPER;
    var a = paper[y0 + x0], b = paper[y0 + x1], c = paper[y1 + x0], d = paper[y1 + x1];
    // A small crisp component keeps dry paper granular instead of blurry noise.
    var interpolated = (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
    return (soft ? interpolated : .35 * a + .65 * interpolated) / 255;
  }
  function inkOf(value) {
    var hex = /^#([\da-f]{6})$/i.exec(value || '');
    var short = /^#([\da-f]{3})$/i.exec(value || '');
    if (short) hex = [null, short[1].replace(/./g, function (c) { return c + c; })];
    var packed = hex ? parseInt(hex[1], 16) : 0x263544;
    return [packed >>> 16, (packed >>> 8) & 255, packed & 255];
  }
  function colorOf(ink) { return 'rgb(' + ink.join(',') + ')'; }

  function makeStroke(ctx, options) {
    options = options || {};
    var index = presets.findIndex(function (p) { return p.id === options.brush; });
    if (index < 0) throw new Error('找不到这支趣味笔刷。');
    var preset = presets[index], kind = definitions[index][0];
    var size = clamp(number(options.size, preset.size), .5, 512);
    var stabilizer = clamp(number(options.stabilizer, 0), 0, 100), pressureEnabled = options.pressure !== false;
    var textureScale = clamp(number(options.textureScale, 1), 0, 4);
    var textureDensity = clamp(number(options.textureDensity, 1), 0, 2);
    var textureOff = textureScale === 0 || textureDensity === 0;
    if (textureScale > 0) textureScale = Math.max(.01, textureScale);
    var ink = inkOf(options.color), color = colorOf(ink);
    var pale = colorOf(ink.map(function (c) { return Math.round(c + (255 - c) * .48); }));
    if (preset.textureControls) makePaper();
    var width = ctx.canvas.width, height = ctx.canvas.height, columns = Math.ceil(width / TILE);
    var tiles = new Map(), dirty = new Set(), cells = new Map(), tracks = [];
    var bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    var step = Math.max(.45, size * definitions[index][5]);
    var last = null, lastRaw = null, lastSample = null, finished = false;
    var total = 0, nextSample = 1, serial = 0, angle = null, seed = 1;
    var grid = Math.max(3.5, size * .16), gridColumns = Math.ceil(width / grid) + 2, scratch = null;
    // The app composites options.opacity once for the whole stroke. It must
    // never also multiply these intrinsic material/particle alpha values.
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    function random(channel) { return hash(seed ^ Math.imul(serial + 1, 0x9e3779b1) ^ Math.imul(channel + 1, 0x85ebca6b)) / 4294967296; }
    function fixed(channel) { return hash(seed ^ Math.imul(channel + 1, 0x27d4eb2d)) / 4294967296; }
    function include(l, t, r, b) {
      bounds.left = Math.min(bounds.left, l); bounds.top = Math.min(bounds.top, t);
      bounds.right = Math.max(bounds.right, r); bounds.bottom = Math.max(bounds.bottom, b);
    }
    function includePoints(points, pad) {
      var xs = points.map(function (p) { return p.x; }), ys = points.map(function (p) { return p.y; });
      include(Math.min.apply(null, xs) - pad, Math.min.apply(null, ys) - pad,
        Math.max.apply(null, xs) + pad, Math.max.apply(null, ys) + pad);
    }
    function point(p, ending) {
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
      var force = clamp(number(p.pressure, .5), 0, 1);
      if (p.pointerType !== 'pen' || !pressureEnabled) force = 1;
      else if (force <= 0) force = ending && lastRaw ? lastRaw.pressure : .03;
      return { x: p.x, y: p.y, pressure: force, time: number(p.time, number(p.timeStamp, NaN)) };
    }
    function diameter(p) { return size * (.16 + .84 * Math.pow(p.pressure, .72)); }
    function circle(x, y, r, alpha, fill) {
      if (!(r > 0)) return;
      ctx.globalAlpha = alpha; ctx.fillStyle = fill || color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      include(x - r - 1, y - r - 1, x + r + 1, y + r + 1);
    }
    function line(a, b, weight, alpha, fill) {
      ctx.globalAlpha = alpha; ctx.strokeStyle = fill || color; ctx.lineWidth = Math.max(.2, weight);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      includePoints([a, b], Math.max(.2, weight) / 2 + 1.5);
    }
    function ellipse(p, rx, ry, rotation, weight, alpha) {
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = Math.max(.3, weight);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, Math.max(.1, rx), Math.max(.1, ry), rotation, 0, TAU); ctx.stroke();
      var r = Math.max(rx, ry) + weight / 2 + 1.5;
      include(p.x - r, p.y - r, p.x + r, p.y + r);
    }
    function polygon(points, alpha, fill) {
      ctx.globalAlpha = alpha; ctx.fillStyle = fill || color;
      ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.closePath(); ctx.fill(); includePoints(points, 1);
    }
    function leaf(root, tip, bend, breadth, alpha, fill) {
      var dx = tip.x - root.x, dy = tip.y - root.y, len = Math.hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len;
      var a = { x: root.x + nx * breadth / 2, y: root.y + ny * breadth / 2 };
      var b = { x: root.x - nx * breadth / 2, y: root.y - ny * breadth / 2 };
      var c1 = { x: root.x + dx * .28 + nx * (bend + breadth * .25), y: root.y + dy * .28 + ny * (bend + breadth * .25) };
      var c2 = { x: root.x + dx * .76 + nx * bend, y: root.y + dy * .76 + ny * bend };
      var c3 = { x: root.x + dx * .70 + nx * (bend - breadth * .12), y: root.y + dy * .70 + ny * (bend - breadth * .12) };
      var c4 = { x: root.x + dx * .25 + nx * (bend - breadth * .45), y: root.y + dy * .25 + ny * (bend - breadth * .45) };
      ctx.globalAlpha = alpha; ctx.fillStyle = fill || color;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, tip.x, tip.y);
      ctx.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, b.x, b.y);
      var cap = { x: root.x - dx / len * breadth * .22, y: root.y - dy / len * breadth * .22 };
      ctx.quadraticCurveTo(cap.x, cap.y, a.x, a.y); ctx.closePath(); ctx.fill();
      includePoints([a, b, c1, c2, c3, c4, cap, tip], 1);
    }
    function tileAt(tx, ty) {
      var key = ty * columns + tx, tile = tiles.get(key);
      if (!tile) {
        var x = tx * TILE, y = ty * TILE;
        tile = { x: x, y: y, width: Math.min(TILE, width - x), height: Math.min(TILE, height - y), mask: new Uint8Array(TILE * TILE) };
        tiles.set(key, tile);
      }
      return tile;
    }
    function maskTip(cx, cy, rx, ry, rotation, alpha, softness, shape) {
      rx = Math.max(.32, rx); ry = Math.max(.32, ry);
      var radius = Math.max(rx, ry) + 1;
      var left = Math.max(0, Math.floor(cx - radius)), top = Math.max(0, Math.floor(cy - radius));
      var right = Math.min(width, Math.ceil(cx + radius)), bottom = Math.min(height, Math.ceil(cy + radius));
      if (right <= left || bottom <= top) return;
      include(left, top, right, bottom);
      var co = Math.cos(rotation), si = Math.sin(rotation);
      for (var ty = Math.floor(top / TILE); ty <= Math.floor((bottom - 1) / TILE); ty++) {
        for (var tx = Math.floor(left / TILE); tx <= Math.floor((right - 1) / TILE); tx++) {
          var tile = tileAt(tx, ty), changed = false;
          var x0 = Math.max(left, tile.x), y0 = Math.max(top, tile.y);
          var x1 = Math.min(right, tile.x + tile.width), y1 = Math.min(bottom, tile.y + tile.height);
          for (var y = y0; y < y1; y++) {
            for (var x = x0; x < x1; x++) {
              var dx = x + .5 - cx, dy = y + .5 - cy;
              var u = Math.abs((dx * co + dy * si) / rx), v = Math.abs((-dx * si + dy * co) / ry), distance;
              if (shape === 'flat') distance = Math.pow(u * u * u * u + v * v * v * v, .25);
              else if (shape === 'chip') distance = Math.max(u * .92 + v * .30, v * .93 + u * .22, u * .58 + v * .65);
              else distance = Math.hypot(u, v);
              // Half a pixel of area coverage keeps subpixel nibs visible.
              var antialias = 1 / Math.min(rx, ry);
              var coverage = Math.round(255 * alpha * smooth((1 + antialias * .5 - distance) / (softness + antialias)));
              var offset = (y - tile.y) * TILE + x - tile.x;
              if (coverage > tile.mask[offset]) { tile.mask[offset] = coverage; changed = true; }
            }
          }
          if (changed) dirty.add(tile);
        }
      }
    }
    function textureAt(x, y) {
      if (textureOff) return 1;
      var period = (kind === 'charcoal-chip' ? 3.9 : kind === 'wax' ? 1.8 : kind === 'cloud' ? 4.5 : 1.35) * textureScale;
      var n = grain(x / period, y / period, kind === 'cloud'), threshold = .50 - .22 * (textureDensity - 1);
      var coverage = smooth((n - threshold) * 4 + .5);
      if (kind === 'cloud') return .88 + .12 * smooth((n - threshold) * 2 + .5);
      if (kind === 'wax') return .16 + .84 * coverage;
      return .025 + .975 * coverage;
    }
    function flush() {
      if (!dirty.size) return;
      if (!scratch) scratch = ctx.createImageData(TILE, TILE);
      dirty.forEach(function (tile) {
        var data = scratch.data;
        for (var y = 0; y < tile.height; y++) {
          for (var x = 0; x < tile.width; x++) {
            var i = y * TILE + x, pixel = i * 4;
            data[pixel] = ink[0]; data[pixel + 1] = ink[1]; data[pixel + 2] = ink[2];
            data[pixel + 3] = Math.round(tile.mask[i] * textureAt(tile.x + x, tile.y + y));
          }
        }
        // Only this stroke's transparent work canvas is touched. No readback
        // or whole-layer allocation is needed for the continuous max mask.
        ctx.putImageData(scratch, tile.x, tile.y, 0, 0, tile.width, tile.height);
      });
      dirty.clear();
    }
    function emit(p, direction, travel) {
      var d = diameter(p), tx = Math.cos(direction), ty = Math.sin(direction), nx = -ty, ny = tx;
      var i, j, a, b, r, offset, now, prior, alpha;
      if (kind === 'charcoal-side') {
        maskTip(p.x, p.y, d * .57, d * .22, -.48, .78 + p.pressure * .22, .10, 'flat');
      } else if (kind === 'charcoal-chip') {
        maskTip(p.x, p.y, d * .48, d * .39, -.33, .84 + p.pressure * .16, .085, 'chip');
      } else if (kind === 'wax') {
        maskTip(p.x, p.y, d * .5, d * .46, -.20, .92, .07, 'round');
      } else if (kind === 'cloud') {
        for (i = 0; i < 4; i++) {
          a = i * 2.1 + Math.sin(travel / Math.max(1, size) * .8) * .55;
          offset = i === 0 ? 0 : d * .26;
          maskTip(p.x + Math.cos(a) * offset, p.y + Math.sin(a) * offset,
            d * (i === 0 ? .48 : .35), d * (i === 0 ? .41 : .32), a, .66, .40, 'round');
        }
      } else if (kind === 'rake' || kind === 'bristle' || kind === 'wave' || kind === 'smoke') {
        var count = kind === 'rake' ? 7 : kind === 'bristle' ? 15 : 3;
        for (i = 0; i < count; i++) {
          var unit = count > 1 ? i / (count - 1) * 2 - 1 : 0;
          var weight = Math.max(.35, d * (kind === 'smoke' ? .12 : kind === 'bristle' ? .012 + fixed(i + 50) * .026 : .027));
          if (kind === 'wave') offset = unit * d * .25 + Math.sin(travel / Math.max(1, size) * TAU * .62 + i * .8) * d * .15;
          else if (kind === 'smoke') offset = unit * d * .18 + Math.sin(travel / Math.max(1, size) * 1.9 + i * 2.1) * d * .27;
          else if (kind === 'rake') offset = unit * d * .52 * (.24 + .76 * Math.pow(Math.sin(travel / Math.max(1, size) * Math.PI / 1.35), 2));
          else offset = unit * d * .43 + (fixed(i + 90) - .5) * d * .055;
          now = { x: p.x + nx * offset, y: p.y + ny * offset };
          prior = tracks[i];
          var visible = kind !== 'bristle' || textureOff || grain(travel / (Math.max(.01, textureScale) * 3.4), i * 7.3) > .50 - textureDensity * .20;
          alpha = kind === 'smoke' ? .16 : kind === 'bristle' ? .65 + fixed(i + 120) * .3 : .94;
          if (visible) {
            if (prior) {
              if (kind === 'smoke') line(prior, now, weight * 2.3, .035);
              line(prior, now, weight, alpha);
            } else circle(now.x, now.y, weight / 2, alpha);
          }
          // Advancing through a dry gap prevents a later segment joining over it.
          tracks[i] = now;
        }
      } else if (kind === 'fur') {
        for (i = 0; i < 5; i++) {
          offset = (random(i * 5) - .5) * d * .85;
          a = { x: p.x + nx * offset, y: p.y + ny * offset };
          var length = d * (.32 + random(i * 5 + 1) * .48);
          var spread = (random(i * 5 + 2) - .5) * d * .45;
          b = { x: a.x - tx * length + nx * spread, y: a.y - ty * length + ny * spread };
          leaf(a, b, (random(i * 5 + 3) - .5) * d * .19, Math.max(.55, d * .035), .55 + random(i * 5 + 4) * .4);
        }
      } else if (kind === 'halftone') {
        r = d * .53;
        // A fixed document grid lets adjacent strokes extend the same screen.
        // The bounded memo only avoids redundant circles; evicted cells still
        // paint normally on revisiting, rather than dropping long-stroke ink.
        var gx0 = Math.max(-1, Math.ceil((p.x - r - grid / 2) / grid));
        var gx1 = Math.min(Math.ceil(width / grid), Math.floor((p.x + r - grid / 2) / grid));
        var gy0 = Math.max(-1, Math.ceil((p.y - r - grid / 2) / grid));
        var gy1 = Math.min(Math.ceil(height / grid), Math.floor((p.y + r - grid / 2) / grid)), anyDot = false;
        for (var gy = gy0; gy <= gy1; gy++) {
          for (var gx = gx0; gx <= gx1; gx++) {
            var cx = (gx + .5) * grid, cy = (gy + .5) * grid;
            var dot = Math.min(grid * (.18 + p.pressure * .18), r - Math.hypot(cx - p.x, cy - p.y));
            if (dot <= .08) continue;
            anyDot = true;
            var key = (gy + 1) * gridColumns + gx + 1, old = cells.get(key) || 0;
            if (dot > old + .025) {
              circle(cx, cy, dot, 1);
              if (!cells.has(key) && cells.size >= CELL_LIMIT) cells.delete(cells.keys().next().value);
              cells.set(key, dot);
            }
          }
        }
        if (!anyDot && d < grid * 1.5) circle(p.x, p.y, Math.max(.23, d * .18), 1);
      } else if (kind === 'splatter' || kind === 'stardust') {
        for (i = 0; i < 11; i++) {
          a = random(i * 7) * TAU;
          var reach = Math.sqrt(random(i * 7 + 1)) * d * (kind === 'splatter' ? .78 : .65);
          var px = p.x + Math.cos(a) * reach, py = p.y + Math.sin(a) * reach;
          r = kind === 'splatter' ? d * (i < 2 ? .09 + random(i * 7 + 2) * .07 : .012 + random(i * 7 + 2) * .035) : d * (.012 + random(i * 7 + 2) * .028);
          if (kind === 'stardust' && i === 0) {
            var star = [], rotation = random(i * 7 + 3) * .6;
            for (j = 0; j < 8; j++) {
              b = rotation + j * Math.PI / 4;
              var lengthStar = j % 2 ? d * .018 : d * .095;
              star.push({ x: px + Math.cos(b) * lengthStar, y: py + Math.sin(b) * lengthStar });
            }
            polygon(star, .92);
          } else if (kind === 'splatter' && i < 2) {
            var drop = [];
            for (j = 0; j < 9; j++) {
              b = j / 9 * TAU; var radiusDrop = r * (.78 + random(i * 7 + 30 + j) * .3);
              drop.push({ x: px + Math.cos(b) * radiusDrop, y: py + Math.sin(b) * radiusDrop });
            }
            polygon(drop, .94);
          } else circle(px, py, Math.max(.20, r), .55 + random(i * 7 + 4) * .43);
        }
      } else if (kind === 'chain') {
        ellipse(p, d * (serial % 2 ? .24 : .37), d * (serial % 2 ? .35 : .20), direction, Math.max(.6, d * .045), .95);
      } else if (kind === 'feather') {
        if (lastSample) line(lastSample, p, Math.max(.45, d * .025), .95);
        else circle(p.x, p.y, Math.max(.3, d * .014), .95);
        for (i = -1; i <= 1; i += 2) {
          a = { x: p.x, y: p.y };
          b = { x: p.x - tx * d * .53 + nx * d * .47 * i, y: p.y - ty * d * .53 + ny * d * .47 * i };
          leaf(a, b, d * .045 * i, Math.max(.55, d * .035), .88);
        }
      } else if (kind === 'flame') {
        for (i = 0; i < 2; i++) {
          offset = (i - .5) * d * .27;
          a = { x: p.x + nx * offset, y: p.y + ny * offset };
          var tail = d * (1.35 + random(i * 4) * .85);
          var sway = Math.sin(travel / Math.max(1, size) * 2.2 + i * 2) * d * .43;
          b = { x: a.x - tx * tail + nx * sway, y: a.y - ty * tail + ny * sway };
          var curl = (random(i * 4 + 1) - .5) * d * .85;
          leaf(a, b, curl, d * .28, .28);
          var inner = { x: a.x + (b.x - a.x) * .74, y: a.y + (b.y - a.y) * .74 };
          leaf(a, inner, curl * .60, d * .10, .26, pale);
        }
      }
      lastSample = { x: p.x, y: p.y, pressure: p.pressure, travel: travel };
      serial++;
      ctx.globalAlpha = 1;
    }
    function aim(target) {
      if (angle === null) angle = target;
      else {
        var turn = target - angle;
        while (turn > Math.PI) turn -= TAU;
        while (turn < -Math.PI) turn += TAU;
        angle += turn * .38;
      }
      return angle;
    }
    function segment(a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
      if (distance < 1e-9) return;
      var end = total + distance, target = Math.atan2(dy, dx);
      while (nextSample * step <= end + 1e-7) {
        var travel = nextSample * step, t = clamp((travel - total) / distance, 0, 1);
        emit({ x: a.x + dx * t, y: a.y + dy * t, pressure: a.pressure + (b.pressure - a.pressure) * t }, aim(target), travel);
        nextSample++;
      }
      total = end;
    }
    function start(p) {
      if (finished || last) return;
      last = point(p, false); if (!last) return;
      lastRaw = last;
      seed = Number.isFinite(options.seed) ? options.seed >>> 0 : hash(Math.round(last.x * 16) ^ Math.imul(Math.round(last.y * 16), 65537) ^ Math.imul(index + 1, 0x9e3779b1));
      emit(last, 0, 0);
    }
    function move(p) {
      if (finished) return;
      if (!last) { start(p); return; }
      var raw = point(p, false); if (!raw) return;
      var alpha = 1;
      if (stabilizer > 0) {
        var dt = raw.time - lastRaw.time;
        alpha = Number.isFinite(dt) && dt > 0 ? 1 - Math.exp(-clamp(dt, .1, 100) / (stabilizer * .55)) :
          1 - Math.exp(-Math.max(.1, Math.hypot(raw.x - lastRaw.x, raw.y - lastRaw.y)) / (1 + stabilizer * .22));
      }
      var next = { x: last.x + (raw.x - last.x) * alpha, y: last.y + (raw.y - last.y) * alpha,
        pressure: last.pressure + (raw.pressure - last.pressure) * Math.max(.15, alpha), time: raw.time };
      segment(last, next); last = next; lastRaw = raw;
    }
    function end(p) {
      if (finished) return;
      if (!last && p) start(p);
      if (last) {
        var raw = p ? point(p, true) : lastRaw;
        if (raw) { segment(last, raw); last = raw; }
        // A partial final interval closes contours without one stamp per event.
        // Scatter/chain stamps keep their fixed count and natural open ending.
        if (lastSample && total - lastSample.travel > 1e-6 && kind !== 'splatter' && kind !== 'stardust' && kind !== 'chain') {
          var direction = angle === null ? 0 : angle;
          emit(last, direction, total);
        }
      }
      flush(); finished = true;
      tiles.clear(); dirty.clear(); cells.clear(); tracks.length = 0; scratch = null;
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
    return { start: start, move: move, end: end, flush: flush, samplesLayer: false,
      get bounds() {
        if (!Number.isFinite(bounds.left)) return null;
        var x = clamp(Math.floor(bounds.left), 0, width), y = clamp(Math.floor(bounds.top), 0, height);
        var right = clamp(Math.ceil(bounds.right), 0, width), bottom = clamp(Math.ceil(bounds.bottom), 0, height);
        return right > x && bottom > y ? { x: x, y: y, width: right - x, height: bottom - y } : null;
      }
    };
  }
  function diagnostics() {
    return { cacheEntries: paper ? 1 : 0, cacheLimit: 1, cacheBytes: paper ? paper.byteLength : 0, cacheByteLimit: PAPER * PAPER, cellCacheLimit: CELL_LIMIT };
  }
  return { presets: presets, makeStroke: makeStroke, diagnostics: diagnostics };
});
