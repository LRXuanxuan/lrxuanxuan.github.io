/* Focused native-Canvas checks for multicolour patterns and natural variation.
 * Development-only: NODE_PATH=/path/to/@napi-rs/canvas node tools/test_drawing_pattern_variation.cjs
 * No test dependencies or generated pictures are shipped to the website.
 */
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createCanvas } = require('@napi-rs/canvas');
const marks = require('../assets/drawing-studio/marks.js');
const PATTERNS = ['horizontal', 'vertical', 'diagonal', 'crosshatch', 'dots', 'checker', 'weave', 'paper', 'stipple'];
const COLORS = ['#e02030', '#20c050', '#3050e0', '#d0b020', '#b020c0', '#20b0c0'];
const RGB = COLORS.map(color => [1, 3, 5].map(at => parseInt(color.slice(at, at + 2), 16)));
const BASE = { foreground: COLORS[0], background: '#f4eee2', transparentBackground: true, spacing: 24, thickness: 7, angle: 0 };
let passed = 0;
function test(name, run) { run(); passed++; console.log('PASS ' + name); }
function pixels(canvas) { return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data; }
function hash(canvas) { return crypto.createHash('sha256').update(pixels(canvas)).digest('hex'); }
function render(style, width = 384, height = 384) {
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  ctx.fillStyle = marks.fillStyle(ctx, { ...BASE, ...style }, { width, height }); ctx.fillRect(0, 0, width, height);
  return canvas;
}
function alphaSum(canvas) { const d = pixels(canvas); let sum = 0; for (let i = 3; i < d.length; i += 4) sum += d[i]; return sum; }
function capture(style) {
  const canvas = createCanvas(48, 48), ctx = canvas.getContext('2d'), nativePattern = ctx.createPattern.bind(ctx);
  let tile;
  ctx.createPattern = (source, repetition) => { tile = source; return nativePattern(source, repetition); };
  ctx.fillStyle = marks.fillStyle(ctx, { ...BASE, ...style }, { width: 48, height: 48 }); ctx.fillRect(0, 0, 48, 48);
  return { canvas, tile };
}
function components(canvas) {
  const d = pixels(canvas), width = canvas.width, height = canvas.height, seen = new Uint8Array(width * height), found = [];
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || d[start * 4 + 3] < 128) continue;
    const queue = [start], points = []; seen[start] = 1;
    let edge = false;
    for (let index = 0; index < queue.length; index++) {
      const pos = queue[index], x = pos % width, y = Math.floor(pos / width); points.push([x + .5, y + .5]);
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) edge = true;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, next = ny * width + nx;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height || seen[next] || d[next * 4 + 3] < 128) continue;
        seen[next] = 1; queue.push(next);
      }
    }
    if (!edge && points.length >= 4) {
      const mx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
      const my = points.reduce((sum, p) => sum + p[1], 0) / points.length;
      let xx = 0, xy = 0, yy = 0;
      for (const [x, y] of points) { xx += (x - mx) ** 2; xy += (x - mx) * (y - my); yy += (y - my) ** 2; }
      const trace = xx + yy, difference = Math.hypot(xx - yy, 2 * xy);
      found.push({ points, x: mx, y: my, area: points.length, aspect: Math.sqrt((trace + difference) / Math.max(1e-8, trace - difference)) });
    }
  }
  return found;
}

test('Omitted variation, explicit zero and a single foreground colour have identical pixels', () => {
  for (const kind of PATTERNS) for (const transparentBackground of [true, false]) {
    const style = { kind, transparentBackground }, original = hash(render(style));
    assert.equal(hash(render({ ...style, variationSize: 0, variationShape: 0 })), original, kind + ' zero variation');
    assert.equal(hash(render({ ...style, colors: [COLORS[0]], variationSize: 0, variationShape: 0 })), original, kind + ' single colour');
  }
});

test('Every supported pattern shows all selected colours without losing transparent gaps', () => {
  for (const kind of [...PATTERNS, 'sprinkles']) {
    const canvas = render({ kind, colors: COLORS }, 576, 576), d = pixels(canvas), seen = new Set();
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 20) continue;
      RGB.forEach((channels, index) => {
        if (channels.every((value, channel) => Math.abs(d[i + channel] - value) <= 7)) seen.add(index);
      });
    }
    assert.equal(seen.size, COLORS.length, kind + ' exposes all six user-selected colours');
    assert.ok(d.some((v, i) => i % 4 === 3 && v === 0), kind + ' still has a transparent background');
  }
});

test('Size and shape variation each change the pattern and remain deterministic after eviction', () => {
  for (const kind of [...PATTERNS, 'sprinkles']) {
    const regular = hash(render({ kind, colors: COLORS.slice(0, 3) }));
    const resized = hash(render({ kind, colors: COLORS.slice(0, 3), variationSize: .7 }));
    const reshaped = hash(render({ kind, colors: COLORS.slice(0, 3), variationShape: .7 }));
    assert.notEqual(resized, regular, kind + ' size control works');
    assert.notEqual(reshaped, regular, kind + ' shape control works');
    assert.notEqual(reshaped, resized, kind + ' size and shape are independent controls');
    for (let i = 0; i < 10; i++) render({ kind: 'dots', spacing: 12 + i, colors: COLORS.slice(0, 2) }, 48, 48);
    assert.equal(hash(render({ kind, colors: COLORS.slice(0, 3), variationSize: .7 })), resized, kind + ' stable after cache eviction');
    assert.equal(hash(render({ kind, colors: COLORS.slice(0, 3), variationShape: .7 })), reshaped, kind + ' stable after cache eviction');
  }
});

test('Natural water dots have measurable size diversity and rounded noncircular shapes', () => {
  const style = { kind: 'dots', spacing: 32, thickness: 12 };
  const regular = components(render(style)), resized = components(render({ ...style, variationSize: .8 }));
  const reshaped = components(render({ ...style, variationShape: .8 }));
  assert.ok(regular.length > 50 && resized.length > 50 && reshaped.length > 50, 'Isolated dots remain recognizable');
  const areas = resized.map(c => c.area);
  assert.ok(Math.max(...areas) > Math.min(...areas) * 1.5, 'Size variation changes component areas');
  assert.ok(reshaped.some(c => c.aspect > 1.15), 'Shape variation produces more than perfect circles');
  assert.ok(reshaped.every(c => c.aspect < 3.5), 'Water dots stay compact rather than becoming long spikes');
});

test('Sugar sprinkles are elongated, rounded short marks with more than one direction', () => {
  const canvas = render({ kind: 'sprinkles', spacing: 40, thickness: 5 }, 640, 640), shapes = components(canvas);
  const isolated = shapes.filter(c => c.area > 30 && c.area < 230);
  assert.ok(isolated.length > 30, 'Scattered individual sprinkles are visible');
  assert.ok(isolated.filter(c => c.aspect > 1.8).length > isolated.length * .8, 'Sprinkles are short rods, not dots');
  const extents = isolated.map(c => {
    const xs = c.points.map(p => p[0]), ys = c.points.map(p => p[1]);
    return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  });
  assert.ok(extents.some(c => c.width > c.height * 1.3) && extents.some(c => c.height > c.width * 1.3), 'Sprinkles lie in varied directions');
  let ends = 0, centres = 0;
  for (const component of isolated) {
    let xx = 0, xy = 0, yy = 0;
    for (const [x, y] of component.points) { xx += (x - component.x) ** 2; xy += (x - component.x) * (y - component.y); yy += (y - component.y) ** 2; }
    const angle = Math.atan2(2 * xy, xx - yy) / 2;
    const projected = component.points.map(([x, y]) => (x - component.x) * Math.cos(angle) + (y - component.y) * Math.sin(angle));
    const low = Math.min(...projected), high = Math.max(...projected), length = high - low, mid = (high + low) / 2;
    ends += projected.filter(p => p < low + .18 * length || p > high - .18 * length).length;
    centres += projected.filter(p => Math.abs(p - mid) < .18 * length).length;
  }
  assert.ok(ends < centres * .96, 'Rod tips narrow smoothly compared with their centres, as rounded caps do');
  const tile = capture({ kind: 'sprinkles', spacing: 40, thickness: 5 }).tile;
  const context = tile.getContext('2d'), d = pixels(tile);
  assert.ok(d.some((v, i) => i % 4 === 3 && v > 0 && v < 255), 'Smooth edges use real alpha antialiasing');
  assert.ok(context, 'Generated pattern is a real Canvas source');
});

test('Fine and thick sugar sprinkles remain longer with evenly separated visible marks', () => {
  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
  for (const [thickness, spacing] of [[2, 14], [6, 22]]) {
    const canvas = render({ kind: 'sprinkles', thickness, spacing }, spacing * 36, spacing * 36);
    const shapes = components(canvas).filter(c => c.x > spacing && c.y > spacing && c.x < canvas.width - spacing && c.y < canvas.height - spacing);
    const isolated = shapes.filter(c => c.aspect > 1.6 && c.area < Math.max(60, thickness * spacing * 2));
    const lengths = isolated.map(component => {
      let xx = 0, xy = 0, yy = 0;
      for (const [x, y] of component.points) { xx += (x - component.x) ** 2; xy += (x - component.x) * (y - component.y); yy += (y - component.y) ** 2; }
      const angle = Math.atan2(2 * xy, xx - yy) / 2;
      const projected = component.points.map(([x, y]) => (x - component.x) * Math.cos(angle) + (y - component.y) * Math.sin(angle));
      return Math.max(...projected) - Math.min(...projected) + 1;
    }).sort((a, b) => a - b);
    assert.ok(lengths.length > 100 && lengths[Math.floor(lengths.length / 2)] > thickness * 3.75,
      thickness + '/' + spacing + ' keeps visibly elongated rods at both tested densities');
    const nearest = shapes.map((shape, index) => Math.min(...shapes.filter((_, other) => index !== other).map(other => Math.hypot(other.x - shape.x, other.y - shape.y))));
    const average = mean(nearest), deviation = Math.sqrt(mean(nearest.map(value => (value - average) ** 2)));
    assert.ok(deviation / average < .18 && Math.min(...nearest) > spacing * .55,
      thickness + '/' + spacing + ' limits large empty gaps and crowded groups in the visible distribution');
  }
});

test('Colour order, array edits and both variation amounts are part of the bounded tile cache', () => {
  const style = { kind: 'dots', colors: COLORS.slice(0, 3), variationSize: .3, variationShape: .2 };
  const first = capture(style), repeated = capture({ ...style, colors: [...style.colors] });
  assert.equal(first.tile, repeated.tile, 'Repeated settings reuse the same tile');
  const reordered = capture({ ...style, colors: [...style.colors].reverse() });
  assert.notEqual(first.tile, reordered.tile); assert.notEqual(hash(first.tile), hash(reordered.tile));
  assert.notEqual(first.tile, capture({ ...style, variationSize: .6 }).tile);
  assert.notEqual(first.tile, capture({ ...style, variationShape: .6 }).tile);
  assert.equal(hash(render({ kind: 'dots', colors: COLORS })), hash(render({ kind: 'dots', colors: [...COLORS, '#ffffff', '#000000'] })), 'Only the first six colours are used');
  style.colors[0] = '#000000'; assert.notEqual(first.tile, capture(style).tile, 'Edited input array is read afresh');
  const saved = hash(first.tile);
  for (let i = 0; i < 9; i++) capture({ kind: 'sprinkles', spacing: 17 + i, colors: COLORS });
  assert.equal(hash(first.tile), saved, 'Existing pattern sources are never mutated');
  assert.notEqual(capture({ kind: 'dots', colors: COLORS.slice(0, 3), variationSize: .3, variationShape: .2 }).tile, first.tile, 'At most eight cached tiles are retained');
});

test('Pattern boundaries repeat without creating an empty seam', () => {
  for (const kind of ['sprinkles', 'dots', 'paper', 'stipple']) {
    const { tile } = capture({ kind, colors: COLORS, variationSize: .5, variationShape: .5, spacing: 17, thickness: 6 });
    const d = pixels(tile), side = tile.width;
    let seamX = 0, seamY = 0, maxX = 0, maxY = 0;
    for (let y = 0; y < side; y++) seamX += Math.abs(d[(y * side) * 4 + 3] - d[(y * side + side - 1) * 4 + 3]);
    for (let x = 0; x < side; x++) seamY += Math.abs(d[x * 4 + 3] - d[((side - 1) * side + x) * 4 + 3]);
    for (let line = 1; line < side; line++) {
      let dx = 0, dy = 0;
      for (let i = 0; i < side; i++) {
        dx += Math.abs(d[(i * side + line) * 4 + 3] - d[(i * side + line - 1) * 4 + 3]);
        dy += Math.abs(d[(line * side + i) * 4 + 3] - d[((line - 1) * side + i) * 4 + 3]);
      }
      maxX = Math.max(maxX, dx); maxY = Math.max(maxY, dy);
    }
    assert.ok(seamX <= maxX * 1.25 + 255 && seamY <= maxY * 1.25 + 255, kind + ' wrap has no unusually sharp discontinuity');
  }
});

test('Explicit background and path holes retain their alpha semantics', () => {
  for (const kind of ['sprinkles', 'dots', 'checker', 'crosshatch']) {
    const fill = { ...BASE, kind, colors: COLORS, variationSize: .5, variationShape: .5 };
    const canvas = createCanvas(240, 180), ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.rect(12, 12, 216, 156); ctx.rect(80, 50, 80, 80);
    ctx.fillStyle = marks.fillStyle(ctx, fill, { x: 12, y: 12, width: 216, height: 156 }); ctx.fill('evenodd');
    assert.equal(ctx.getImageData(100, 90, 1, 1).data[3], 0, kind + ' path hole remains empty');
    assert.equal(ctx.getImageData(2, 2, 1, 1).data[3], 0, kind + ' exterior remains empty');
    assert.ok(alphaSum(canvas) > 0, kind + ' paints the selected area');
    const opaque = render({ ...fill, transparentBackground: false }, 120, 120), d = pixels(opaque);
    assert.ok(d.every((v, i) => i % 4 !== 3 || v === 255), kind + ' explicit background is opaque');
    assert.ok(d.some((v, i) => i % 4 === 0 && v === 244 && d[i + 1] === 238 && d[i + 2] === 226), kind + ' retains the requested background');
  }
});

test('Layer scale compensation preserves actual water-dot spacing', () => {
  const style = { ...BASE, kind: 'dots', colors: COLORS.slice(0, 3), spacing: 24, thickness: 8 };
  const normal = render(style, 288, 288), scaled = createCanvas(288, 288), ctx = scaled.getContext('2d');
  ctx.scale(2, 2); ctx.fillStyle = marks.fillStyle(ctx, { ...style, spacing: 12, thickness: 4 }, { width: 144, height: 144 }); ctx.fillRect(0, 0, 144, 144);
  const a = components(normal), b = components(scaled);
  assert.equal(a.length, b.length, 'Layer scaling neither doubles nor halves the number of dots');
  a.forEach(p => { assert.ok(b.some(q => Math.hypot(p.x - q.x, p.y - q.y) < .75), 'Dot centres are preserved in document coordinates'); });
});

test('Malformed and extreme options stay finite, bounded and do not change gradients or Riso', () => {
  for (const kind of [...PATTERNS, 'sprinkles']) for (const style of [
    { colors: null, variationSize: NaN, variationShape: Infinity, spacing: Infinity, thickness: NaN },
    { colors: ['not-a-colour', null, {}, ...COLORS, '#ffffff'], variationSize: -10, variationShape: 99, spacing: 1e8, thickness: 1e8 },
    { colors: COLORS, variationSize: 1, variationShape: 1, spacing: 2, thickness: .25 }
  ]) {
    const { tile } = capture({ kind, ...style });
    assert.ok(tile.width > 0 && tile.height > 0 && tile.width <= 256 && tile.height <= 256, kind + ' tile fits the 256 px resource bound');
  }
  for (const kind of ['linear', 'radial', 'reflected', 'riso-medium', 'riso-wet-medium']) {
    assert.equal(hash(render({ kind })), hash(render({ kind, colors: COLORS, variationSize: 1, variationShape: 1 })), kind + ' keeps its existing rendering contract');
  }
});

async function integration() {
  const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
  const harnessFile = path.join(__dirname, 'test_drawing_app.cjs'), source = fs.readFileSync(harnessFile, 'utf8');
  const boundary = source.indexOf('\nasync function main() {');
  assert.ok(boundary > 0, 'Existing DOM/native-Canvas harness has an explicit suite boundary');
  const harness = new Module(harnessFile, module); harness.filename = harnessFile; harness.paths = module.paths;
  harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixels, hash, pixel };', harnessFile);
  const { openStudio, errors, pixels: domPixels, hash: domHash, pixel } = harness.exports;
  const dom = await openStudio();
  try {
    const win = dom.window, doc = win.document, app = win.DrawingStudio;
    const el = id => { const field = doc.getElementById(id); assert.ok(field, id); return field; };
    const active = () => app.getLayer(app.inspect().activeId);
    const previewHash = () => domHash(domPixels(el('materialPreview')));
    const layerHash = () => domHash(domPixels(active().canvas));
    function edit(id, value) {
      const field = el(id);
      if (field.type === 'checkbox') field.checked = value; else field.value = String(value);
      field.dispatchEvent(new win.Event('input', { bubbles: true }));
      field.dispatchEvent(new win.Event('change', { bubbles: true }));
    }
    function pointer(type, x, y) {
      const canvas = el('drawingCanvas'), rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true,
        pointerId: 91, pointerType: 'mouse', isPrimary: true, button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX: rect.left + x / canvas.width * rect.width,
        clientY: rect.top + y / canvas.height * rect.height }));
    }
    assert.equal(el('materialNatural').checked, false, 'Natural variation defaults off in an actual new UI');
    assert.equal(el('materialColorCount').value, '1', 'Single colour is the default');
    app.setTool('fill'); edit('materialKind', 'dots');
    const before = previewHash();
    edit('materialVariationSize', 83); edit('materialVariationShape', 61);
    assert.equal(previewHash(), before, 'Disabled variation ignores remembered nonzero sliders');
    assert.equal(el('materialVariationOptions').hidden, true);
    edit('materialNatural', true); assert.notEqual(previewHash(), before);
    assert.equal(el('materialVariationOptions').hidden, false);
    edit('materialNatural', false); assert.equal(previewHash(), before, 'Turning variation off restores the regular pattern');
    passed++; console.log('PASS UI defaults off and disables both variation effects while retaining their values');

    await app.newDocument({ width: 256, height: 192, title: '糖针参数往返验证', paper: 'transparent' });
    app.setTool('fill');
    const values = { fillPaintMode: 'color', fillScope: 'lasso', fillOpacity: 100,
      materialKind: 'sprinkles', materialFollowInk: false, materialForeground: COLORS[0], materialBackground: '#f4eee2',
      materialTransparent: true, materialThickness: 5, materialSpacing: 22, materialColorCount: 6,
      materialColor2: COLORS[1], materialColor3: COLORS[2], materialColor4: COLORS[3], materialColor5: COLORS[4], materialColor6: COLORS[5],
      materialNatural: true, materialVariationSize: 58, materialVariationShape: 37 };
    for (const [id, value] of Object.entries(values)) edit(id, value);
    assert.equal(el('materialColorOptions').hidden, false);
    assert.equal(el('materialColor6Field').hidden, false);
    edit('inkColor', '#2848b0'); el('materialColor2FromInk').click();
    assert.equal(el('materialColor2').value, '#2848b0');
    assert.equal(el('materialForeground').value, COLORS[0]); assert.equal(el('materialColor3').value, COLORS[2]);
    assert.equal(el('materialBackground').value, '#f4eee2', 'Copying the current ink changes only the selected palette slot');
    edit('materialColor2', COLORS[1]);
    const empty = layerHash(), history = app.inspect().history;
    pointer('pointerdown', 12, 12);
    for (const [x, y] of [[244, 12], [244, 180], [12, 180]]) pointer('pointermove', x, y);
    pointer('pointerup', 12, 180); app.render();
    const painted = layerHash(); assert.notEqual(painted, empty);
    assert.equal(pixel(active().canvas, 2, 2)[3], 0, 'Actual lasso exterior is transparent');
    assert.equal(app.inspect().history, history + 1, 'Lasso deposits one undoable operation');
    app.undo(); assert.equal(layerHash(), empty); app.redo(); assert.equal(layerHash(), painted);
    const project = await app.serializeProject();
    for (const key of Object.keys(values).filter(key => key.startsWith('material'))) assert.equal(project.settings.marks[key], values[key], key + ' is saved');
    await app.newDocument({ width: 64, height: 64, paper: 'transparent' });
    edit('materialNatural', false); edit('materialColorCount', 1); edit('materialKind', 'solid');
    await app.loadProject(project); app.render();
    assert.equal(layerHash(), painted, 'Reopening a project preserves actual filled pixels');
    for (const key of Object.keys(values).filter(key => key.startsWith('material'))) {
      const field = el(key); assert.equal(field.type === 'checkbox' ? field.checked : field.value, typeof values[key] === 'boolean' ? values[key] : String(values[key]), key + ' is restored');
    }
    passed++; console.log('PASS Multicolour sugar fill preserves lasso alpha, undo/redo, and every saved project setting');

    edit('materialNatural', false); const regular = previewHash(), disabledProject = await app.serializeProject();
    edit('materialNatural', true); await app.loadProject(disabledProject);
    assert.equal(el('materialNatural').checked, false); assert.equal(el('materialVariationSize').value, '58');
    assert.equal(el('materialVariationShape').value, '37'); assert.equal(previewHash(), regular);
    for (const kind of ['solid', 'linear', 'radial', 'riso-medium']) {
      edit('materialKind', kind); assert.equal(el('materialColorOptions').hidden, true); assert.equal(el('materialNaturalField').hidden, true);
    }
    edit('materialKind', 'dots'); assert.equal(el('materialColorOptions').hidden, false);
    assert.equal(el('materialColorCount').value, '6'); assert.equal(el('materialNatural').checked, false);
    assert.deepEqual(errors, [], 'No DOM runtime errors');
    passed++; console.log('PASS Disabled variation survives project reopen and unsupported materials hide irrelevant controls');
  } finally { dom.window.close(); }
}

integration().then(() => console.log('Pattern variation: ' + passed + '/' + passed + ' native-Canvas and DOM checks passed.')).catch(error => {
  console.error(error); process.exitCode = 1;
});
