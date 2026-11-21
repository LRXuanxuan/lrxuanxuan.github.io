/* Development-only native Canvas regressions for editable shape provenance. */
'use strict';
const assert = require('node:assert/strict');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const Records = require('../assets/drawing-studio/stroke-records.js');
const Marks = require('../assets/drawing-studio/marks.js');
const ctx = c => c.getContext('2d');
const pixel = (c, x, y) => Array.from(ctx(c).getImageData(x, y, 1, 1).data);
const pixels = c => Buffer.from(ctx(c).getImageData(0, 0, c.width, c.height).data);
const shape = (extra = {}) => ({ type: 'rect', x: 12, y: 12, width: 36, height: 36, constrain: false,
  fill: { kind: 'solid', foreground: '#e02020', background: '#ffffff', spacing: 14, thickness: 2, angle: 45, transparentBackground: false },
  stroke: null, strokeWidth: 2, frameColor: '#354953', frameAccent: '#d4b583', frameWidth: 12, opacity: 1, ...extra });
function surface(width = 192, height = 96) { return { canvas: createCanvas(width, height), strokeRecords: null }; }
function sourceFor(layer, value) {
  const source = createCanvas(layer.canvas.width, layer.canvas.height);
  return { source, bounds: Marks.paintShape(ctx(source), value) };
}
function addShape(layer, id, value = shape(), opacity = 1) {
  const { source, bounds } = sourceFor(layer, value), before = layer.strokeRecords;
  layer.strokeRecords = Records.append(before, layer.canvas, source, bounds, { id, kind: 'overlay', shape: value, opacity });
  assert.notEqual(layer.strokeRecords, before, 'A visible shape receives a retained identity');
  ctx(layer.canvas).save(); ctx(layer.canvas).globalAlpha = opacity; ctx(layer.canvas).drawImage(source, 0, 0); ctx(layer.canvas).restore();
  return layer.strokeRecords;
}
function addRect(layer, id, kind, color, box, opacity = 1) {
  const source = createCanvas(layer.canvas.width, layer.canvas.height);
  ctx(source).fillStyle = color; ctx(source).fillRect(box.x, box.y, box.width, box.height);
  layer.strokeRecords = Records.append(layer.strokeRecords, layer.canvas, source, box, { id, kind, opacity });
  const paint = ctx(layer.canvas); paint.save(); paint.globalAlpha = opacity;
  paint.globalCompositeOperation = kind === 'erase' ? 'destination-out' : 'source-over'; paint.drawImage(source, 0, 0); paint.restore();
}
function replace(layer, id, value, opacity = 1) {
  const { source, bounds } = sourceFor(layer, value);
  const result = Records.replaceShape(layer.strokeRecords, layer.canvas, source, bounds, id, value, opacity);
  assert.ok(result, 'Replacement produces a bounded sparse patch');
  Records.render(result.state, layer.canvas, result.keys); layer.strokeRecords = Records.clean(result.state); return result;
}
function removeShape(layer, id) {
  const result = Records.removeShape(layer.strokeRecords, id); assert.ok(result);
  Records.render(result.state, layer.canvas, result.keys); layer.strokeRecords = Records.clean(result.state); return result;
}
async function importState(state, target) {
  return Records.importBundle(Records.exportBundle(state), target, value => value, blob => blob.arrayBuffer());
}
let passed = 0;
async function test(name, run) { await run(); passed++; console.log('PASS ' + name); }
async function main() {
  await test('Shape-only layers retain editable identity and deeply immutable material data', () => {
    const layer = surface(), input = shape(); input.fill.colors = ['#e02020', '#2040e0']; input.fill.jitter = { size: .2, enabled: true };
    addShape(layer, 'shape-1', input);
    assert.equal(Records.count(layer.strokeRecords), 0); assert.equal(Records.hasEditable(layer.strokeRecords), true);
    assert.ok(Records.clean(layer.strokeRecords)); const op = layer.strokeRecords.operations[0];
    assert.equal(op.kind, 'overlay'); assert.notEqual(op.shape, input); assert.ok(Object.isFrozen(op.shape.fill.colors));
    input.x = 80; input.fill.colors[0] = '#000000'; input.fill.jitter.size = 1;
    assert.equal(op.shape.x, 12); assert.equal(op.shape.fill.colors[0], '#e02020'); assert.equal(op.shape.fill.jitter.size, .2);
    assert.equal(Records.hit(layer.strokeRecords, 24, 24, 1), null); assert.equal(Records.hitShape(layer.strokeRecords, 24, 24, 1), 'shape-1');
  });
  await test('Move replays later drawing and partial erasure while restoring both old and new areas', () => {
    const layer = surface(); ctx(layer.canvas).fillStyle = '#ffff80'; ctx(layer.canvas).fillRect(0, 0, 192, 96);
    addShape(layer, 'shape-1');
    addRect(layer, 'stroke-1', 'stroke', '#2040e0', { x: 0, y: 28, width: 192, height: 8 });
    addRect(layer, 'erase-1', 'erase', '#000000', { x: 130, y: 8, width: 12, height: 45 }, .5);
    const before = layer.strokeRecords, oldBase = before.base, original = pixels(layer.canvas), erasedAlpha = pixel(layer.canvas, 134, 20)[3];
    const result = replace(layer, 'shape-1', shape({ x: 128 }));
    assert.ok(result.keys.has('0,0') && result.keys.has('128,0'));
    assert.deepEqual(pixel(layer.canvas, 20, 20), [255, 255, 128, 255], 'The original underlying paint is restored');
    assert.deepEqual(pixel(layer.canvas, 145, 20), [224, 32, 32, 255]);
    assert.deepEqual(pixel(layer.canvas, 20, 30), [32, 64, 224, 255], 'Later stroke stays at old position');
    assert.deepEqual(pixel(layer.canvas, 145, 30), [32, 64, 224, 255], 'Later stroke stays above the moved shape');
    assert.equal(pixel(layer.canvas, 134, 20)[3], erasedAlpha, 'Replay preserves the direct Canvas partial-erasure result');
    assert.equal(before.operations[0].shape.x, 12); assert.equal(before.base, oldBase);
    Records.render(before, layer.canvas); assert.deepEqual(pixels(layer.canvas), original, 'The previous immutable state can replay an undo');
  });
  await test('Moving to fresh tiles captures their original base and deleting clears the last shape', () => {
    const layer = surface(); ctx(layer.canvas).fillStyle = '#00b050'; ctx(layer.canvas).fillRect(140, 18, 9, 9);
    const background = pixels(layer.canvas); addShape(layer, 'shape-1');
    const result = replace(layer, 'shape-1', shape({ x: 128 }));
    assert.ok(result.keys.has('0,0') && result.keys.has('128,0'));
    assert.equal(pixel(layer.canvas, 20, 20)[3], 0);
    removeShape(layer, 'shape-1'); assert.equal(layer.strokeRecords, null); assert.deepEqual(pixels(layer.canvas), background);
  });
  await test('Shape hits respect upper shapes, later overlays and erased holes; whole erasure stays stroke-only', () => {
    const layer = surface(); addShape(layer, 'lower'); addShape(layer, 'upper', shape({ x: 22, y: 22, width: 15, height: 15 }));
    assert.equal(Records.hitShape(layer.strokeRecords, 28, 28, 1), 'upper');
    addRect(layer, 'stroke-1', 'stroke', '#2040e0', { x: 0, y: 26, width: 192, height: 6 });
    assert.equal(Records.hitShape(layer.strokeRecords, 28, 28, .75), null); assert.equal(Records.hit(layer.strokeRecords, 28, 28, 1), 'stroke-1');
    const removed = Records.remove(layer.strokeRecords, new Set(['stroke-1'])); Records.render(removed.state, layer.canvas, removed.keys);
    layer.strokeRecords = Records.clean(removed.state); assert.equal(Records.count(layer.strokeRecords), 0);
    assert.equal(Records.hitShape(layer.strokeRecords, 28, 28, 1), 'upper');
    addRect(layer, 'erase-1', 'erase', '#000000', { x: 22, y: 22, width: 15, height: 15 });
    assert.equal(Records.hitShape(layer.strokeRecords, 28, 28, 1), null);
    addRect(layer, 'overlay-1', 'overlay', '#00ff00', { x: 10, y: 10, width: 10, height: 10 });
    assert.equal(Records.hitShape(layer.strokeRecords, 15, 15, 1), null);
    assert.equal(Records.hitShape(layer.strokeRecords, 42, 42, 1), 'lower');
  });
  await test('Layer copies and shape copies edit independently without mutating shared snapshots', () => {
    const original = surface(); addShape(original, 'shape-1'); const saved = original.strokeRecords, originalPixels = pixels(original.canvas);
    const duplicate = surface(); ctx(duplicate.canvas).drawImage(original.canvas, 0, 0); duplicate.strokeRecords = saved;
    replace(duplicate, 'shape-1', shape({ x: 85, fill: { kind: 'solid', foreground: '#2040e0' } }));
    assert.equal(original.strokeRecords, saved); assert.deepEqual(pixels(original.canvas), originalPixels);
    assert.equal(saved.operations[0].shape.fill.foreground, '#e02020');
    addShape(original, 'shape-copy', shape({ x: 128 })); const firstOp = original.strokeRecords.operations[0];
    replace(original, 'shape-copy', shape({ x: 120, width: 60, height: 60 }));
    assert.equal(original.strokeRecords.operations[0], firstOp); assert.equal(firstOp.shape.width, 36);
  });
  await test('Opacity applies once and transparency within decorative frames remains a hole', () => {
    const layer = surface(); addShape(layer, 'translucent', shape(), .4);
    assert.ok(Math.abs(pixel(layer.canvas, 20, 20)[3] - 102) <= 1);
    replace(layer, 'translucent', shape({ x: 90, width: 64, height: 64 }), .4);
    assert.equal(pixel(layer.canvas, 20, 20)[3], 0); assert.ok(Math.abs(pixel(layer.canvas, 100, 20)[3] - 102) <= 1);
    replace(layer, 'translucent', shape({ type: 'frameGallery', x: 90, width: 64, height: 64 }), .4);
    assert.equal(pixel(layer.canvas, 122, 44)[3], 0); assert.ok(pixel(layer.canvas, 92, 20)[3] > 0);
    assert.equal(Records.hitShape(layer.strokeRecords, 122, 44, 1), null);
  });
  await test('PNG and bundle round-trip preserves shape-only state and new JSON material fields', async () => {
    const layer = surface(); const input = shape({ type: 'ellipse', x: 15, width: 58, height: 44 }); input.fill.colors = ['#e02020', '#2040e0'];
    addShape(layer, 'shape-1', input, .65); addRect(layer, 'erase-1', 'erase', '#000000', { x: 34, y: 20, width: 12, height: 40 }, .3);
    const png = await loadImage(layer.canvas.toBuffer('image/png')), restored = surface(); ctx(restored.canvas).drawImage(png, 0, 0);
    restored.strokeRecords = await importState(layer.strokeRecords, restored.canvas);
    assert.deepEqual(restored.strokeRecords.operations[0].shape, layer.strokeRecords.operations[0].shape);
    assert.notEqual(restored.strokeRecords.operations[0].shape, layer.strokeRecords.operations[0].shape);
    assert.equal(Records.count(restored.strokeRecords), 0); assert.ok(Records.hasEditable(restored.strokeRecords));
    assert.deepEqual(pixels(restored.canvas), pixels(layer.canvas)); replace(restored, 'shape-1', { ...restored.strokeRecords.operations[0].shape, x: 120 }, .65);
    assert.ok(Records.hitShape(restored.strokeRecords, 140, 35, 1));
    const legacy = surface(); addRect(legacy, 'old-stroke', 'stroke', '#000000', { x: 10, y: 10, width: 20, height: 20 });
    assert.equal(Records.count(await importState(legacy.strokeRecords, legacy.canvas)), 1, 'Existing version-1 bundles still load');
  });
  await test('Cancelled, invalid and oversized replacements preserve all original pixels and records', () => {
    const layer = surface(), originalShape = shape(); addShape(layer, 'shape-1', originalShape);
    const before = layer.strokeRecords, image = pixels(layer.canvas), empty = createCanvas(192, 96);
    assert.equal(Records.replaceShape(before, layer.canvas, empty, { x: 0, y: 0, width: 192, height: 96 }, 'shape-1', shape(), 1), null);
    assert.equal(Records.replaceShape(before, layer.canvas, empty, { x: 0, y: 0, width: 1, height: 1 }, 'shape-1', shape({ x: Infinity }), 1), null);
    assert.equal(Records.removeShape(before, 'missing'), null); assert.equal(layer.strokeRecords, before); assert.deepEqual(pixels(layer.canvas), image);
    const large = surface(1536, 1536); addShape(large, 'small'); const prior = large.strokeRecords;
    const next = shape({ x: 0, y: 0, width: 1536, height: 1536 }), painted = sourceFor(large, next);
    assert.equal(Records.replaceShape(prior, large.canvas, painted.source, painted.bounds, 'small', next, 1), null);
    assert.equal(Records.append(prior, large.canvas, painted.source, painted.bounds, { id: 'huge', kind: 'overlay', shape: next, opacity: 1 }), prior);
    assert.equal(large.strokeRecords, prior); assert.deepEqual(pixel(large.canvas, 20, 20), [224, 32, 32, 255]);
  });
  await test('Imported shape metadata rejects invalid geometry and bounded non-JSON material payloads', async () => {
    const layer = surface(); addShape(layer, 'shape-1'); const bundle = Records.exportBundle(layer.strokeRecords);
    const broken = patch => ({ ...bundle, operations: bundle.operations.map(op => ({ ...op, ...patch })) });
    for (const value of [shape({ x: NaN }), shape({ width: 20000 }), shape({ fill: { colors: Array(1000).fill('#ffffff') } }), shape({ fill: { number: Infinity } }), shape({ fill: JSON.parse('{"__proto__": {"polluted": true}}') })]) {
      assert.equal(Records.normalizeShape(value), null);
      await assert.rejects(Records.importBundle(broken({ shape: value }), layer.canvas, x => x, b => b.arrayBuffer()), /记录无效/);
    }
    await assert.rejects(Records.importBundle(broken({ kind: 'erase' }), layer.canvas, x => x, b => b.arrayBuffer()), /记录无效/);
    assert.equal({}.polluted, undefined); assert.equal(Records.normalizeShape(shape({ opacity: .5 })), null);
  });
  await test('Operation limits bake old identities without altering the artwork or dropping newer shapes', () => {
    const layer = surface(64, 64);
    for (let i = 0; i < 130; i++) { addShape(layer, 'shape-' + i, shape({ x: 4 + i % 10, y: 4, width: 12, height: 12 }), .2); Records.limit([layer]); }
    const before = pixels(layer.canvas); assert.equal(layer.strokeRecords.operations.length, Records.MAX_OPERATIONS);
    assert.equal(layer.strokeRecords.operations[0].id, 'shape-2'); assert.equal(Records.count(layer.strokeRecords), 0);
    Records.render(layer.strokeRecords, layer.canvas); assert.deepEqual(pixels(layer.canvas), before);
    assert.equal(Records.hitShape(layer.strokeRecords, 15, 10, 1), 'shape-129');
  });
  console.log(passed + ' editable-shape core regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
