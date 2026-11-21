/* Development-only pixel and app regressions for imported brush adaptations.
 * Uses real native Canvas plus the existing local DOM harness; this is not a
 * physical stylus, browser GPU, or Procreate/画世界 engine fidelity test.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules \
 *   node tools/test_drawing_chuishi.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const native = require('@napi-rs/canvas');
const core = require('../assets/drawing-studio/core.js');
const importedEngine = require('../assets/drawing-studio/brushes-chuishi.js');
const marks = require('../assets/drawing-studio/marks.js');
const chuishi = require('../assets/drawing-studio/brushes-chuishi-data.js');
const haiguai = require('../assets/drawing-studio/brushes-haiguai-data.js');
const dongdong = require('../assets/drawing-studio/brushes-dongdong-data.js');
const datasets = [chuishi, haiguai, dongdong];
const presets = datasets.flatMap(data => data.brushes);
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const source = fs.readFileSync(harnessFile, 'utf8');
const boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'Integration harness has an explicit suite boundary');
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixel, pixels, hash, inkStats, eventually };', harnessFile);
const { openStudio, errors, pixel, pixels, hash, inkStats, eventually } = harness.exports;
const live = [];
const temporaryCanvases = new Set();
let passed = 0;
function release(canvas) { canvas.width = canvas.height = 1; temporaryCanvases.delete(canvas); }
async function test(name, fn) {
  try { await fn(); passed++; console.log('PASS ' + name); }
  finally {
    // Native Skia image snapshots are not fully charged to V8's heap budget.
    // Explicitly release test-only targets when all their pixel assertions are
    // complete, as the app resets/reuses its stroke surface between operations.
    for (const canvas of temporaryCanvases) release(canvas);
  }
}

function render(id, options = {}) {
  const width = options.width || 320, height = options.height || 180;
  const canvas = native.createCanvas(width, height), ctx = canvas.getContext('2d');
  temporaryCanvases.add(canvas);
  if (options.base) options.base(ctx);
  const stroke = (options.engine || core).makeStroke(ctx, { brush: id, size: options.size || 36, color: options.color || '#bc3020',
    pressure: options.pressure !== false, stabilizer: options.stabilizer || 0 });
  const points = options.points || [
    { x: 32, y: 88, pressure: .55, time: 0 },
    { x: 100, y: 65, pressure: .75, time: 130 },
    { x: 190, y: 110, pressure: .95, time: 280 },
    { x: 280, y: 80, pressure: .65, time: 450 }
  ];
  const expanded = points.map(point => ({ pointerType: options.pointerType || 'pen', ...point }));
  stroke.start(expanded[0]);
  for (const point of expanded.slice(1)) stroke.move(point);
  stroke.end({ ...expanded[expanded.length - 1], pressure: options.endPressure ?? 0 });
  stroke.flush();
  return { canvas, stroke, data: pixels(canvas), stats: inkStats(canvas) };
}

function line(force = .8, duration = 400, segments = 1) {
  return Array.from({ length: segments + 1 }, (_, i) => ({ x: 40 + 240 * i / segments, y: 90,
    pressure: force, time: duration * i / segments }));
}

function alphaMass(image, x0 = 0, x1 = image.width) {
  const p = pixels(image); let mass = 0;
  for (let y = 0; y < image.height; y++) for (let x = x0; x < x1; x++) mass += p[(y * image.width + x) * 4 + 3];
  return mass;
}

function alphaDifference(a, b) {
  assert.equal(a.length, b.length); let difference = 0, mass = 0;
  for (let i = 3; i < a.length; i += 4) { difference += Math.abs(a[i] - b[i]); mass += Math.max(a[i], b[i]); }
  return difference / Math.max(1, mass);
}

function verticalTracks(canvas, x0 = 140, x1 = 180) {
  const p = pixels(canvas), rows = [];
  for (let y = 0; y < canvas.height; y++) {
    let alpha = 0; for (let x = x0; x < x1; x++) alpha += p[(y * canvas.width + x) * 4 + 3];
    rows.push(alpha / (x1 - x0));
  }
  let tracks = 0, inside = false;
  for (const alpha of rows) { if (alpha > 12 && !inside) tracks++; inside = alpha > 12; }
  return tracks;
}

function readMask(mask) {
  assert.equal(mask.encoding, 'rle8');
  const encoded = Buffer.from(mask.data, 'base64');
  assert.equal(encoded.length % 2, 0);
  const alpha = new Uint8Array(mask.width * mask.height); let offset = 0;
  for (let i = 0; i < encoded.length; i += 2) {
    assert.ok(encoded[i] > 0, 'Runs are nonzero');
    assert.ok(offset + encoded[i] <= alpha.length, 'Mask RLE must not exceed its declared dimensions');
    alpha.fill(encoded[i + 1], offset, offset + encoded[i]); offset += encoded[i];
  }
  assert.equal(offset, alpha.length); return alpha;
}

function engineWithDongdong(data) {
  const file = path.join(__dirname, '../assets/drawing-studio/brushes-chuishi.js');
  const instance = new Module(file, module); instance.filename = file; instance.paths = module.paths;
  const originalRequire = instance.require.bind(instance);
  instance.require = id => id === './brushes-dongdong-data.js' ? data : originalRequire(id);
  instance._compile(fs.readFileSync(file, 'utf8'), file); return instance.exports;
}

function uiFor(dom) {
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const item = doc.getElementById(id); assert.ok(item, id); return item; };
  const edit = (id, value) => {
    const input = el(id); input.value = String(value);
    input.dispatchEvent(new win.Event('input', { bubbles: true }));
    input.dispatchEvent(new win.Event('change', { bubbles: true }));
  };
  const tool = value => doc.querySelector('[data-tool="' + value + '"]').click();
  const active = () => app.getLayer(app.inspect().activeId);
  function pointer(type, point) {
    const display = el('drawingCanvas'), bounds = display.getBoundingClientRect();
    display.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1,
      pointerType: 'pen', button: 0, buttons: type === 'pointerup' ? 0 : 1,
      pressure: type === 'pointerup' ? 0 : .8, timeStamp: point[2] || 0,
      clientX: bounds.left + point[0] / display.width * bounds.width,
      clientY: bounds.top + point[1] / display.height * bounds.height }));
  }
  function draw(points = [[22, 60, 0], [170, 60, 300]]) {
    pointer('pointerdown', points[0]); for (const p of points.slice(1)) pointer('pointermove', p);
    pointer('pointerup', points[points.length - 1]); app.render();
  }
  function fresh(id, size = 24) {
    app.newDocument({ width: 192, height: 128, paper: 'transparent', title: '导入笔刷回归' });
    tool('brush'); edit('brushKind', id); edit('brushSize', size); edit('brushOpacity', 100);
    edit('stabilizer', 0); edit('inkColor', '#d43224');
  }
  return { win, doc, app, el, edit, tool, active, draw, fresh };
}

async function main() {
  await test('Imported collections keep file order and only the eight requested original brushes remain', () => {
    assert.equal(chuishi.brushes.length, 13); assert.equal(haiguai.brushes.length, 15); assert.equal(dongdong.brushes.length, 20);
    assert.equal(core.brushPresets.length, 56);
    assert.equal(new Set(core.brushPresets.map(p => p.id)).size, 56);
    for (const id of ['stoneChalk', 'softRound', 'squarePaint']) assert.ok(!core.brushPresets.some(p => p.id === id));
    for (const preset of presets) assert.ok(core.brushPresets.some(p => p.id === preset.id), preset.id);
    for (const id of ['gpen', 'fineliner', 'plainSquare', 'fountain', 'wetMix', 'smudge', 'binary', 'pixel'])
      assert.ok(core.brushPresets.some(p => p.id === id), 'Existing brush remains: ' + id);
    assert.deepEqual(core.brushPresets.slice(0, 8).map(p => [p.id, p.group]), [
      ['gpen', '勾线'], ['fineliner', '勾线'], ['plainSquare', '勾线'], ['fountain', '勾线'],
      ['wetMix', '混色与推抹'], ['smudge', '混色与推抹'], ['binary', '硬边与像素'], ['pixel', '硬边与像素']
    ]);
    const imported = new Set(presets.map(p => p.id));
    assert.equal(core.brushPresets.filter(p => !imported.has(p.id)).length, 8);
    for (const data of datasets) {
      const ids = new Set(data.brushes.map(p => p.id));
      assert.deepEqual(core.brushPresets.filter(p => ids.has(p.id)).map(p => p.id), data.brushes.map(p => p.id));
    }
  });

  await test('Embedded masks decode within bounded dimensions and preserve a transparent exterior', () => {
    assert.equal(Object.keys(chuishi.masks).length, 6, 'Identical six-dot masks are deduplicated');
    for (const data of datasets) for (const [id, mask] of Object.entries(data.masks)) {
      assert.ok(Number.isInteger(mask.width) && mask.width > 0 && mask.width <= 256, id);
      assert.ok(Number.isInteger(mask.height) && mask.height > 0 && mask.height <= 256, id);
      const alpha = readMask(mask); assert.ok(alpha.some(a => a > 0), id + ' has nonzero samples');
    }
    const brush = chuishi.brushes.find(p => p.id === 'chuishi-manuscript'), mask = chuishi.masks[brush.mask], alpha = readMask(mask);
    assert.equal(alpha[0], 0); assert.equal(alpha[mask.width - 1], 0);
    assert.equal(alpha[alpha.length - 1], 0, 'Inferred black-on-white correction must not paint a filled square');
    assert.ok(alpha[Math.floor(mask.height / 2) * mask.width + Math.floor(mask.width / 2)] > 100);
  });

  await test('Every imported brush paints visible pixels and bounds cover all affected pixels', () => {
    for (const preset of presets) {
      const result = render(preset.id);
      assert.ok(result.stats.count > 60, preset.id + ' paints visible pixels');
      assert.ok(result.stroke.bounds, preset.id + ' exposes dirty bounds');
      const b = result.stroke.bounds;
      assert.ok(result.stats.left >= b.x && result.stats.top >= b.y && result.stats.right < b.x + b.width && result.stats.bottom < b.y + b.height,
        preset.id + ' dirty bounds cover the actual ink');
      release(result.canvas);
    }
  });

  await test('The original six-dot nib produces six parallel hatching tracks, with a distinct grain variant', () => {
    const clean = render('chuishi-hatching', { size: 96, points: line(1, 800) });
    const grain = render('chuishi-hatching-grain', { size: 96, points: line(1, 800) });
    assert.equal(verticalTracks(clean.canvas), 6);
    assert.ok(clean.stats.maxAlpha >= 170, 'Sparse six-dot tips must not dilute ink as though their entire bounding box were solid');
    assert.notEqual(hash(clean.data), hash(grain.data));
    assert.ok(grain.stats.count > 0 && alphaMass(grain.canvas, 120, 200) > 0);
  });

  await test('Pressure changes width while disabled pressure and mouse pressure values remain stable', () => {
    const id = 'chuishi-multipurpose-2';
    const light = render(id, { size: 50, points: line(.15, 600) });
    const heavy = render(id, { size: 50, points: line(.95, 600) });
    assert.ok(alphaMass(heavy.canvas, 120, 220) > alphaMass(light.canvas, 120, 220) * 1.8);
    const disabledLight = render(id, { size: 50, points: line(.15, 600), pressure: false });
    const disabledHeavy = render(id, { size: 50, points: line(.95, 600), pressure: false });
    assert.equal(hash(disabledLight.data), hash(disabledHeavy.data));
    const mouseLight = render(id, { size: 50, points: line(.15, 600), pointerType: 'mouse' });
    const mouseHeavy = render(id, { size: 50, points: line(.95, 600), pointerType: 'mouse' });
    assert.equal(hash(mouseLight.data), hash(mouseHeavy.data));
  });

  await test('Speed dynamics change the speed-pencil stroke, including its size and deposited ink', () => {
    const slow = render('chuishi-speed-pencil', { size: 48, points: line(.8, 1200) });
    const fast = render('chuishi-speed-pencil', { size: 48, points: line(.8, 80) });
    assert.notEqual(hash(slow.data), hash(fast.data));
    assert.ok(alphaMass(slow.canvas, 100, 250) > alphaMass(fast.canvas, 100, 250) * 1.15,
      'Positive source speed dynamics make fast strokes thinner and fainter');
  });

  await test('Pointer-up zero pressure preserves the last pressure without adding a full-width tail', () => {
    for (const id of ['chuishi-jiayou-inking-2', 'chuishi-manuscript', 'chuishi-mercury', 'chuishi-hatching']) {
      const zero = render(id, { size: 40, points: line(.22, 500), endPressure: 0 });
      const held = render(id, { size: 40, points: line(.22, 500), endPressure: .22 });
      assert.equal(hash(zero.data), hash(held.data), id);
    }
  });

  await test('Arc-length spacing is independent of a straight stroke being split across pointer events', () => {
    for (const id of ['chuishi-jiayou-inking-2', 'chuishi-hatching-grain', 'chuishi-mercury', 'chuishi-speed-pencil']) {
      const few = render(id, { size: 32, points: line(.72, 600, 1) });
      const many = render(id, { size: 32, points: line(.72, 600, 30) });
      assert.ok(alphaDifference(few.data, many.data) < .025, id + ' should not depend on event reporting frequency');
    }
  });

  await test('Square brush picks up existing blue into a red stroke and leaves distant pixels untouched', () => {
    const result = render('chuishi-square', { size: 42, color: '#f00000', points: line(.9, 800, 20),
      base: ctx => { ctx.fillStyle = '#0000f0'; ctx.fillRect(25, 65, 100, 50); ctx.fillStyle = '#00a040'; ctx.fillRect(2, 2, 10, 10); } });
    assert.deepEqual(pixel(result.canvas, 5, 5), [0, 160, 64, 255]);
    let carriedBlue = false;
    for (let x = 130; x < 180; x++) for (let y = 70; y < 110; y++) {
      const p = pixel(result.canvas, x, y);
      if (p[3] > 30 && p[2] > 12 && p[0] > 12) carriedBlue = true;
    }
    assert.ok(carriedBlue, 'A red-only stamp cannot pass the pickup test outside the original blue patch');
  });

  await test('Mercury retains a separately configured secondary tip and nonlinear pressure curve', () => {
    const mercury = chuishi.brushes.find(p => p.id === 'chuishi-mercury');
    assert.ok(mercury.secondary && mercury.secondary.source, 'Sub01 is an active second brush');
    const curve = mercury.source.dynamicsPressureSizeCurve;
    assert.ok((curve.xy || curve).some(p => p[0] > 0 && p[0] < 1 && Math.abs(p[0] - p[1]) > .01));
    assert.notEqual(hash(render(mercury.id, { size: 30, points: line(.3) }).data), hash(render(mercury.id, { size: 30, points: line(.8) }).data));
  });

  await test('Dongdong retains both dual brushes, its real grain image and distinct custom tips', () => {
    const rough = dongdong.brushes.find(p => p.id === 'dongdong-rough-inking');
    const soft = dongdong.brushes.find(p => p.id === 'dongdong-soft-texture');
    assert.ok(rough.secondary && soft.secondary, 'Both source dual brushes remain represented');
    assert.ok(rough.grainMask && dongdong.masks[rough.grainMask], 'Actual embedded Grain.png is available to the renderer');
    const grain = readMask(dongdong.masks[rough.grainMask]);
    assert.ok(new Set(grain).size > 5, 'Embedded grain retains its variable grayscale samples');
    assert.equal(rough.source.textureInverted, true, 'Grain inversion remains an explicit source setting');
    for (const id of ['dongdong-smooth-fill-1', 'dongdong-smooth-fill-2', 'dongdong-sharp-corner']) {
      const preset = dongdong.brushes.find(p => p.id === id);
      assert.ok(preset.mask && dongdong.masks[preset.mask], id + ' uses its uploaded source tip');
    }
    const smooth = render('dongdong-smooth-inking', { size: 30, points: line(.6, 600) });
    const roughStroke = render(rough.id, { size: 30, points: line(.6, 600) });
    assert.notEqual(hash(smooth.data), hash(roughStroke.data));
    assert.notEqual(hash(render('dongdong-smooth-fill-1').data), hash(render('dongdong-sharp-corner').data));
    const neutralData = structuredClone(dongdong), mask = neutralData.masks[rough.grainMask], runs = [];
    for (let remaining = mask.width * mask.height; remaining > 0;) {
      const count = Math.min(255, remaining); runs.push(count, 128); remaining -= count;
    }
    mask.data = Buffer.from(runs).toString('base64');
    const neutralStroke = render(rough.id, { size: 30, points: line(.6, 600), engine: engineWithDongdong(neutralData) });
    assert.notEqual(hash(roughStroke.data), hash(neutralStroke.data), 'Replacing the embedded grain changes the rendered pixels');
  });

  await test('Pressure curve point order does not change rendering or mutate archived source values', () => {
    const id = 'dongdong-smooth-inking', sourceBrush = dongdong.brushes.find(p => p.id === id);
    const before = JSON.stringify(sourceBrush.source.dynamicsPressureSizeCurve);
    const sortedData = structuredClone(dongdong), sortedBrush = sortedData.brushes.find(p => p.id === id);
    sortedBrush.source.dynamicsPressureSizeCurve.sort((a, b) => a[0] - b[0]);
    const original = render(id, { size: 36, points: line(.37, 600) });
    const sorted = render(id, { size: 36, points: line(.37, 600), engine: engineWithDongdong(sortedData) });
    assert.equal(hash(original.data), hash(sorted.data), 'An intermediate curve point stored after (1,1) must still apply');
    assert.equal(JSON.stringify(sourceBrush.source.dynamicsPressureSizeCurve), before);
    const linearData = structuredClone(dongdong);
    linearData.brushes.find(p => p.id === id).source.dynamicsPressureSizeCurve = [[0, 0], [1, 1]];
    const linear = render(id, { size: 36, points: line(.37, 600), engine: engineWithDongdong(linearData) });
    assert.notEqual(hash(original.data), hash(linear.data), 'The intermediate source control point affects the stroke');
  });

  await test('Sea-monster solid and fineliner differ from soft pencil and airbrush responses', () => {
    const id = 'haiguai-solid-no-pressure';
    const light = render(id, { size: 36, points: line(.1, 500) });
    const heavy = render(id, { size: 36, points: line(.9, 500) });
    assert.equal(hash(light.data), hash(heavy.data), 'Source pressure size and opacity are both zero');
    // The supplied "solid/no-pressure" brush still contains speed-opacity and
    // opacity-jitter settings; filled interior does not mean a forced alpha255.
    assert.ok(heavy.stats.maxAlpha >= 240 && pixel(heavy.canvas, 160, 90)[3] >= 225,
      'Solid brush has a well-covered interior while retaining its source dynamics');
    const fineliner = render('haiguai-fineliner', { size: 24, points: line(.8, 500) });
    const pencil = render('haiguai-pencil-soft', { size: 24, points: line(.8, 500) });
    const airbrush = render('haiguai-airbrush', { size: 64, points: line(.8, 500) });
    assert.notEqual(hash(fineliner.data), hash(pencil.data));
    assert.ok(airbrush.stats.height > fineliner.stats.height, 'Large airbrush has a wider soft footprint');
    const column = Array.from({ length: 80 }, (_, i) => pixel(airbrush.canvas, 160, 50 + i)[3]);
    assert.ok(new Set(column.filter(a => a > 0 && a < 255)).size > 12, 'Airbrush has a real graduated alpha edge');
  });

  await test('Dual outline brushes create hollow continuous strokes with different border widths', () => {
    const wide = render('haiguai-outline', { size: 48, points: line(1, 600) });
    const fine = render('haiguai-outline-fine', { size: 48, points: line(1, 600) });
    assert.equal(pixel(wide.canvas, 160, 90)[3], 0, 'Stroke interior remains transparent after overlapping dabs');
    assert.equal(pixel(fine.canvas, 160, 90)[3], 0);
    assert.equal(verticalTracks(wide.canvas), 2, 'A straight outline has two separate sides');
    assert.equal(verticalTracks(fine.canvas), 2);
    assert.ok(alphaMass(wide.canvas, 120, 200) > alphaMass(fine.canvas, 120, 200) * 1.15);
  });

  await test('Glow airbrush adds light to existing paint while ordinary airbrush deposits its chosen color', () => {
    const base = ctx => { ctx.fillStyle = '#404040'; ctx.fillRect(0, 0, 320, 180); };
    const ordinary = render('haiguai-airbrush', { size: 60, color: '#e01008', points: line(.7, 600), base });
    const glow = render('haiguai-glow-airbrush', { size: 60, color: '#e01008', points: line(.7, 600), base });
    const normalPixel = pixel(ordinary.canvas, 160, 90), glowPixel = pixel(glow.canvas, 160, 90);
    assert.ok(glowPixel[0] > 64 && glowPixel[1] >= 64 && glowPixel[2] >= 64);
    assert.ok(normalPixel[1] < 64 && normalPixel[2] < 64, 'Source-over red darkens the original green/blue channels');
    assert.notDeepEqual(normalPixel, glowPixel); assert.deepEqual(pixel(glow.canvas, 5, 5), [64, 64, 64, 255]);
  });

  await test('Finishing glow restores ordinary compositing for the next filled and outlined shape', () => {
    const used = render('haiguai-glow-airbrush', { size: 60, points: line(.7, 600) }).canvas;
    const usedPaint = used.getContext('2d');
    usedPaint.clearRect(0, 0, used.width, used.height); // Reuses the app's stroke-surface contract; clear does not reset drawing state.
    const fresh = native.createCanvas(used.width, used.height); temporaryCanvases.add(fresh);
    const shape = { type: 'rect', x: 40, y: 50, width: 130, height: 60, fill: '#d63224', stroke: '#2040e0', strokeWidth: 14, opacity: 1 };
    marks.paintShape(usedPaint, shape); marks.paintShape(fresh.getContext('2d'), shape);
    assert.equal(hash(pixels(used)), hash(pixels(fresh)), 'A previous glowing stroke must not make shape fill/outline overlap additive');
    assert.equal(usedPaint.globalCompositeOperation, 'source-over');
  });

  await test('Brush caches stay bounded after all imported shapes and textures have been used', () => {
    const stats = importedEngine.diagnostics();
    assert.ok(stats.maskEntries <= 20 && stats.tintEntries <= 12 && stats.grainEntries <= 14);
    assert.ok(stats.canvasBytes < 12 * 1024 * 1024, 'Cached tips cannot grow with every preset or color');
  });

  const dom = await openStudio(); live.push(dom); const ui = uiFor(dom);
  const { app, doc, el, edit, tool, active, draw, fresh } = ui;
  await test('The app lists every imported brush and renders real preview canvases in its brush library', async () => {
    el('brushSample').click();
    assert.ok(el('brushDialog').open);
    assert.equal(doc.querySelectorAll('[data-brush-preset]').length, core.brushPresets.length);
    await eventually(() => doc.querySelectorAll('[data-brush-preset][data-sample-profile]').length === core.brushPresets.length,
      'The fallback gallery finishes its small batches without leaving blank previews', 20000);
    for (const preset of presets) {
      const option = Array.from(el('brushKind').options).find(o => o.value === preset.id);
      assert.ok(option && option.textContent === preset.name, preset.id);
      const button = doc.querySelector('[data-brush-preset="' + preset.id + '"]');
      assert.ok(button); assert.ok(inkStats(button.querySelector('canvas')).count > 0, preset.id + ' preview');
    }
    assert.ok(!el('brushDialog').textContent.includes('吹石参考 · 原创'));
    el('brushDialog').close();
  });

  await test('Imported strokes keep one undo step, whole-stroke erasure, opacity and project pixels', async () => {
    for (const id of ['chuishi-hatching-grain', 'chuishi-mercury', 'haiguai-inking', 'dongdong-rough-inking']) {
      fresh(id, 35); edit('brushOpacity', 57); const before = hash(pixels(active().canvas));
      const history = app.inspect().history; draw(); const painted = hash(pixels(active().canvas));
      assert.notEqual(painted, before); assert.equal(app.inspect().history, history + 1);
      assert.equal(app.inspect().strokeCount, 1); assert.ok(inkStats(active().canvas).maxAlpha <= 146, 'Global opacity applies once');
      app.undo(); assert.equal(hash(pixels(active().canvas)), before); app.redo(); assert.equal(hash(pixels(active().canvas)), painted);
      const project = await app.exportProject(); await app.loadProject(project);
      assert.equal(app.inspect().brush, id); assert.equal(app.inspect().opacity, .57);
      assert.equal(hash(pixels(active().canvas)), painted); assert.equal(app.inspect().strokeCount, 1);
      tool('eraser'); edit('eraserMode', 'stroke'); edit('brushSize', 80); edit('brushOpacity', 100); edit('stabilizer', 0);
      draw([[95, 60, 0]]); assert.equal(app.inspect().strokeCount, 0); assert.equal(inkStats(active().canvas).count, 0);
      app.undo(); assert.equal(hash(pixels(active().canvas)), painted); app.redo(); assert.equal(inkStats(active().canvas).count, 0);
    }
  });

  await test('The square mixing brush commits one reversible operation and survives project reopening', async () => {
    fresh('chuishi-square', 32);
    const ctx = active().canvas.getContext('2d'); ctx.fillStyle = '#2040d0'; ctx.fillRect(18, 42, 70, 36);
    const before = hash(pixels(active().canvas)), history = app.inspect().history;
    draw(); const after = hash(pixels(active().canvas)); assert.notEqual(after, before);
    assert.equal(app.inspect().history, history + 1);
    app.undo(); assert.equal(hash(pixels(active().canvas)), before); app.redo(); assert.equal(hash(pixels(active().canvas)), after);
    await app.loadProject(await app.exportProject()); assert.equal(hash(pixels(active().canvas)), after); assert.equal(app.inspect().brush, 'chuishi-square');
  });

  await test('Outline interiors preserve underlying paint through undo, export and reopening', async () => {
    fresh('haiguai-outline', 40); const ctx = active().canvas.getContext('2d');
    ctx.fillStyle = '#2040d0'; ctx.fillRect(0, 0, 192, 128); const before = hash(pixels(active().canvas));
    draw(); const after = hash(pixels(active().canvas)); assert.notEqual(after, before);
    assert.deepEqual(pixel(active().canvas, 95, 60), [32, 64, 208, 255], 'Hollowing may not erase the layer underneath');
    app.undo(); assert.equal(hash(pixels(active().canvas)), before); app.redo(); assert.equal(hash(pixels(active().canvas)), after);
    await app.loadProject(await app.exportProject()); assert.equal(hash(pixels(active().canvas)), after);
    tool('eraser'); edit('eraserMode', 'stroke'); edit('brushSize', 80); draw([[95, 60, 0]]);
    assert.equal(hash(pixels(active().canvas)), before, 'Whole-stroke removal returns the intact underlying paint');
  });

  assert.deepEqual(errors, [], 'No asynchronous Canvas or page errors');
  console.log('Imported brush regression: ' + passed + ' checks passed.');
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { for (const dom of live) dom.window.close(); });
