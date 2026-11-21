/* Dev-only real Canvas/DOM regressions for bounded whole-stroke erasure.
 * Reuses the existing local jsdom/native-canvas harness without running its suite.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules node tools/test_drawing_strokes.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const native = require('@napi-rs/canvas');
const Records = require('../assets/drawing-studio/stroke-records.js');
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const source = fs.readFileSync(harnessFile, 'utf8');
const boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'Integration harness has an explicit suite boundary');
const harness = new Module(harnessFile, module); harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixel, pixels, hash, decoded, wait, IDBFactory };', harnessFile);
const { openStudio, errors, pixel, pixels, hash, decoded, wait, IDBFactory } = harness.exports;
let passed = 0, live = [];
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
function harnessUI(dom) {
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const value = doc.getElementById(id); assert.ok(value, id); return value; };
  const edit = (id, value) => { const field = el(id); field.value = String(value); field.dispatchEvent(new win.Event('input', { bubbles: true })); field.dispatchEvent(new win.Event('change', { bubbles: true })); };
  const check = (id, value) => { el(id).checked = value; el(id).dispatchEvent(new win.Event('change', { bubbles: true })); };
  const tool = name => doc.querySelector('[data-tool="' + name + '"]').click();
  const active = () => app.getLayer(app.inspect().activeId);
  function pointer(type, x, y, extra = {}) {
    const drawing = el('drawingCanvas'), rect = drawing.getBoundingClientRect();
    drawing.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse',
      button: 0, buttons: type === 'pointerup' ? 0 : 1, pressure: type === 'pointerup' ? 0 : .5,
      clientX: rect.left + x / drawing.width * rect.width, clientY: rect.top + y / drawing.height * rect.height, ...extra }));
  }
  function stroke(points) {
    pointer('pointerdown', ...points[0]); points.slice(1).forEach(p => pointer('pointermove', ...p)); pointer('pointerup', ...points[points.length - 1]); app.render();
  }
  function fresh(w = 128, h = 96) {
    app.newDocument({ width: w, height: h, paper: 'transparent', title: '笔画回归' });
    tool('brush'); edit('brushKind', 'fineliner'); edit('brushSize', 8); edit('brushOpacity', 100); edit('stabilizer', 0); edit('inkColor', '#e02020');
  }
  function eraser(mode, size = 3, opacity = 100) { tool('eraser'); edit('eraserMode', mode); edit('brushSize', size); edit('brushOpacity', opacity); edit('stabilizer', 0); }
  function drawCross() {
    stroke([[15, 48], [112, 48]]); edit('inkColor', '#2040e0'); stroke([[64, 12], [64, 84]]);
  }
  return { app, win, doc, el, edit, check, tool, active, pointer, stroke, fresh, eraser, drawCross };
}
async function main() {
  const dom = await openStudio(); live.push(dom); const ui = harnessUI(dom);
  const { app, win, doc, el, edit, check, tool, active, pointer, stroke, fresh, eraser, drawCross } = ui;

  await test('Intersecting strokes keep real pen-down identity; one gesture never peels the lower stroke', () => {
    fresh(); drawCross(); const before = hash(pixels(active().canvas)), history = app.inspect().history;
    assert.equal(app.inspect().strokeCount, 2);
    eraser('stroke'); pointer('pointerdown', 64, 48);
    for (let i = 0; i < 5; i++) pointer('pointermove', 64, 48);
    pointer('pointerup', 64, 48); app.render();
    assert.equal(app.inspect().history, history + 1); assert.equal(app.inspect().strokeCount, 1);
    assert.deepEqual(pixel(active().canvas, 64, 48), [224, 32, 32, 255]);
    assert.equal(pixel(active().canvas, 64, 18)[3], 0); assert.equal(pixel(active().canvas, 25, 48)[3], 255);
    const erased = hash(pixels(active().canvas)); app.undo(); assert.equal(hash(pixels(active().canvas)), before); assert.equal(app.inspect().strokeCount, 2);
    app.redo(); assert.equal(hash(pixels(active().canvas)), erased); assert.equal(app.inspect().strokeCount, 1);
    stroke([[64, 48]]); assert.equal(app.inspect().strokeCount, 0); assert.equal(pixel(active().canvas, 25, 48)[3], 0);
  });

  await test('Identical opaque strokes and same-color overlays retain separate provenance even without pixel changes', () => {
    fresh(); edit('brushKind', 'binary'); edit('brushSize', 8); edit('stabilizer', 0);
    stroke([[15, 48], [112, 48]]); const one = hash(pixels(active().canvas)); stroke([[15, 48], [112, 48]]);
    assert.equal(hash(pixels(active().canvas)), one); assert.equal(app.inspect().strokeCount, 2);
    eraser('stroke'); stroke([[40, 48]]); assert.equal(hash(pixels(active().canvas)), one); assert.equal(app.inspect().strokeCount, 1);
    app.undo(); assert.equal(app.inspect().strokeCount, 2); app.redo(); assert.equal(app.inspect().strokeCount, 1);
    stroke([[40, 48]]); assert.equal(pixel(active().canvas, 40, 48)[3], 0);
    fresh(); edit('brushSize', 32); stroke([[15, 48], [112, 48]]); const covered = hash(pixels(active().canvas));
    tool('shape'); edit('shapeKind', 'rect'); check('shapeFill', true); check('shapeStroke', false); edit('materialKind', 'solid'); check('materialFollowInk', true);
    stroke([[75, 42], [95, 54]]); assert.equal(hash(pixels(active().canvas)), covered);
    eraser('stroke', 2); stroke([[30, 48]]); assert.equal(pixel(active().canvas, 30, 48)[3], 0);
    assert.deepEqual(pixel(active().canvas, 85, 48), [224, 32, 32, 255], 'Same-color geometry survives removal of the original covering stroke');
  });

  await test('A quick sweep deletes separate touched strokes in one history step, keeping untouched strokes', () => {
    fresh(); for (const y of [18, 45, 74]) stroke([[18, y], [110, y]]);
    eraser('stroke', 3); const before = hash(pixels(active().canvas)), history = app.inspect().history;
    stroke([[40, 10], [40, 54]]);
    assert.equal(app.inspect().history, history + 1); assert.equal(app.inspect().strokeCount, 1);
    assert.equal(pixel(active().canvas, 70, 18)[3], 0); assert.equal(pixel(active().canvas, 70, 45)[3], 0); assert.equal(pixel(active().canvas, 70, 74)[3], 255);
    app.undo(); assert.equal(hash(pixels(active().canvas)), before); assert.equal(app.inspect().strokeCount, 3);
  });

  await test('Local erasure remains an ordered mask when another intersecting stroke is removed', () => {
    fresh(); drawCross(); eraser('local', 22); stroke([[64, 48]]);
    assert.equal(pixel(active().canvas, 64, 48)[3], 0);
    const local = hash(pixels(active().canvas)); eraser('stroke'); stroke([[64, 20]]);
    assert.equal(pixel(active().canvas, 64, 48)[3], 0, 'Whole erasure must not resurrect the locally erased crossing');
    assert.equal(pixel(active().canvas, 35, 48)[3], 255); assert.equal(pixel(active().canvas, 64, 20)[3], 0);
    app.undo(); assert.equal(hash(pixels(active().canvas)), local); app.redo(); assert.equal(pixel(active().canvas, 64, 48)[3], 0);
    const noHit = hash(pixels(active().canvas)), history = app.inspect().history; stroke([[64, 48]]);
    assert.equal(hash(pixels(active().canvas)), noHit); assert.equal(app.inspect().history, history, 'An erased hole is not a stroke hit');
    fresh(); drawCross(); eraser('local', 20, 50); stroke([[64, 48]]); const survivingAlpha = pixel(active().canvas, 64, 48)[3];
    eraser('stroke'); stroke([[64, 20]]);
    const p = pixel(active().canvas, 64, 48); assert.ok(p[0] >= 220 && p[2] < 36); assert.equal(p[3], survivingAlpha, 'Replay preserves the same partial erasure as the direct Canvas operation');
    assert.ok(p[3] > 0 && p[3] < 255);
  });

  await test('Disconnected-looking parts of one stroke disappear together without connected-component guesses', () => {
    fresh(); stroke([[20, 20], [110, 20], [110, 76], [20, 76]]);
    edit('inkColor', '#2040e0'); stroke([[65, 10], [65, 86]]);
    eraser('local', 16); stroke([[110, 48]]); eraser('stroke'); stroke([[35, 20]]);
    assert.equal(pixel(active().canvas, 35, 76)[3], 0, 'The other disconnected part has the same original stroke ID');
    assert.equal(pixel(active().canvas, 65, 48)[3], 255, 'A crossing stroke remains independent');
  });

  await test('Layer transforms, copied provenance and hidden/locked guards preserve layer isolation', () => {
    fresh(); stroke([[20, 40], [100, 40]]); const originalId = active().id, original = hash(pixels(active().canvas));
    edit('layerScale', 150); const transformed = { ...active() };
    eraser('stroke'); stroke([[transformed.x + 60 * transformed.scale, transformed.y + 40 * transformed.scale]]);
    assert.equal(app.inspect().strokeCount, 0); app.undo(); assert.equal(hash(pixels(active().canvas)), original);
    el('duplicateLayer').click(); const copy = active().id; assert.notEqual(copy, originalId); assert.equal(app.inspect().strokeCount, 1);
    stroke([[transformed.x + 60 * transformed.scale, transformed.y + 40 * transformed.scale]]);
    assert.equal(app.inspect().strokeCount, 0); assert.equal(hash(pixels(app.getLayer(originalId).canvas)), original);
    app.selectLayer(originalId);
    doc.querySelector('.layer-row.active .layer-lock').click(); const locked = hash(pixels(active().canvas)), history = app.inspect().history;
    stroke([[transformed.x + 60 * transformed.scale, transformed.y + 40 * transformed.scale]]);
    assert.equal(hash(pixels(active().canvas)), locked); assert.equal(app.inspect().history, history);
    doc.querySelector('.layer-row.active .layer-lock').click(); doc.querySelector('.layer-row.active .layer-visibility').click();
    const hiddenHistory = app.inspect().history; stroke([[transformed.x + 60 * transformed.scale, transformed.y + 40 * transformed.scale]]);
    assert.equal(hash(pixels(active().canvas)), locked); assert.equal(app.inspect().history, hiddenHistory);
  });

  await test('Shape overlays survive stroke removal and opaque overlays block selecting hidden ink', () => {
    fresh(); stroke([[15, 48], [112, 48]]); tool('shape'); edit('shapeKind', 'rect'); check('shapeFill', true); check('shapeStroke', false);
    check('materialFollowInk', true); edit('materialKind', 'solid'); edit('inkColor', '#20a050'); stroke([[75, 20], [115, 75]]);
    eraser('stroke', 2); const before = hash(pixels(active().canvas)); stroke([[90, 48]]);
    assert.equal(hash(pixels(active().canvas)), before, 'Opaque shape is not a selectable pen stroke');
    stroke([[30, 48]]); assert.equal(pixel(active().canvas, 30, 48)[3], 0); assert.deepEqual(pixel(active().canvas, 90, 48), [32, 160, 80, 255]);
  });

  await test('Pixel-dependent fills, cutout and mixing retire provenance; undo restores it, raster still erases locally', () => {
    fresh(); stroke([[15, 48], [112, 48]]); const red = hash(pixels(active().canvas));
    tool('fill'); edit('fillScope', 'inked'); edit('inkColor', '#20a050'); stroke([[35, 48]]);
    assert.equal(app.inspect().strokeCount, 0); const filled = hash(pixels(active().canvas)); eraser('stroke'); stroke([[35, 48]]);
    assert.equal(hash(pixels(active().canvas)), filled);
    eraser('local', 10); stroke([[35, 48]]); assert.equal(pixel(active().canvas, 35, 48)[3], 0);
    app.undo(); app.undo(); assert.equal(hash(pixels(active().canvas)), red); assert.equal(app.inspect().strokeCount, 1);
    eraser('stroke'); stroke([[60, 48]]); assert.equal(app.inspect().strokeCount, 0);
    fresh(); stroke([[15, 48], [112, 48]]); tool('cutout'); edit('tolerance', 0); stroke([[40, 48]]); assert.equal(app.inspect().strokeCount, 0); app.undo(); assert.equal(app.inspect().strokeCount, 1);
    tool('brush'); edit('brushKind', 'wetMix'); edit('brushOpacity', 100); edit('brushSize', 20); edit('inkColor', '#20e040'); stroke([[20, 48], [75, 48]]);
    assert.equal(app.inspect().strokeCount, 0); app.undo(); assert.equal(app.inspect().strokeCount, 1);
  });

  await test('Canvas cropping retires provenance without reviving trimmed content on later resize', () => {
    fresh(); stroke([[20, 40], [112, 40]]); const original = hash(pixels(active().canvas));
    edit('canvasWidth', 64); edit('canvasHeight', 96); el('resizeCanvas').click(); assert.equal(app.inspect().strokeCount, 0);
    app.undo(); assert.equal(hash(pixels(active().canvas)), original); assert.equal(app.inspect().strokeCount, 1); app.redo();
    edit('canvasWidth', 128); el('resizeCanvas').click(); assert.equal(pixel(active().canvas, 100, 40)[3], 0); assert.equal(app.inspect().strokeCount, 0);
    eraser('local', 10); stroke([[30, 40]]); assert.equal(pixel(active().canvas, 30, 40)[3], 0);
  });

  await test('Project JSON, PNG export and immutable cached blob serialization preserve whole/local erasure', async () => {
    fresh(); drawCross(); eraser('local', 20, 50); stroke([[64, 48]]); eraser('stroke');
    const baseline = hash(pixels(active().canvas)), survivingAlpha = pixel(active().canvas, 64, 48)[3], a = await app.serializeProject(), b = await app.serializeProject();
    assert.equal(a.layers[0].strokes.patches[0].data, b.layers[0].strokes.patches[0].data, 'Unchanged tile Blob is cached between autosaves');
    const json = await app.exportProject(), parsed = JSON.parse(json); assert.ok(parsed.layers[0].strokes.operations.length >= 3);
    assert.ok(parsed.layers[0].strokes.patches[0].data.$blob.startsWith('data:application/octet-stream;base64,'));
    await app.loadProject(parsed); assert.equal(hash(pixels(active().canvas)), baseline); assert.equal(app.inspect().strokeCount, 2); assert.equal(app.inspect().eraserMode, 'stroke');
    eraser('stroke'); stroke([[64, 20]]); assert.equal(pixel(active().canvas, 64, 20)[3], 0); assert.equal(pixel(active().canvas, 64, 48)[3], survivingAlpha);
    const output = await decoded(await app.exportRaster('png', true)); assert.equal(hash(pixels(output.canvas)), hash(pixels(active().canvas)));
    const saved = await app.exportProject(); await app.loadProject(saved); eraser('stroke'); stroke([[30, 48]]); assert.equal(app.inspect().strokeCount, 0);
    assert.equal(pixel(active().canvas, 30, 48)[3], 0);
  });

  await test('Underlying imported pixels and cross-tile erasure survive export, reopening and selective removal', async () => {
    fresh(192, 128); const base = active().canvas.getContext('2d'); base.fillStyle = '#d0bf95'; base.fillRect(0, 0, 192, 128);
    stroke([[10, 64], [182, 64]]); edit('inkColor', '#2040e0'); edit('brushOpacity', 60); stroke([[96, 10], [96, 118]]);
    eraser('local', 20); stroke([[96, 64]]); const before = hash(pixels(active().canvas));
    await app.loadProject(await app.exportProject()); assert.equal(hash(pixels(active().canvas)), before);
    eraser('stroke', 2); stroke([[96, 20]]);
    assert.deepEqual(pixel(active().canvas, 96, 20), [208, 191, 149, 255], 'Base image reappears under the removed blue stroke');
    assert.deepEqual(pixel(active().canvas, 30, 64), [224, 32, 32, 255]); assert.equal(pixel(active().canvas, 96, 64)[3], 0);
    const removed = hash(pixels(active().canvas)); app.undo(); assert.equal(hash(pixels(active().canvas)), before); app.redo(); assert.equal(hash(pixels(active().canvas)), removed);
    await app.loadProject(await app.exportProject()); eraser('stroke', 2); stroke([[30, 64]]);
    assert.deepEqual(pixel(active().canvas, 30, 64), [208, 191, 149, 255]); assert.equal(pixel(active().canvas, 96, 64)[3], 0, 'Neither stroke removal revives the erased base pixels');
  });

  await test('Malformed stroke records fail before replacing current artwork; old raster remains usable', async () => {
    fresh(); drawCross(); const project = JSON.parse(await app.exportProject()), original = hash(pixels(active().canvas)), id = active().id;
    project.layers[0].strokes.operations[0].opacity = [1];
    await assert.rejects(app.loadProject(project), /整笔记录/); assert.equal(active().id, id); assert.equal(hash(pixels(active().canvas)), original);
    const oversized = JSON.parse(await app.exportProject()); oversized.layers[0].strokes.patches[0].data.$blob = 'data:application/octet-stream;base64,' + 'A'.repeat(250000);
    const originalAtob = win.atob; let oversizedDecode = false;
    win.atob = input => { if (input.length > 40000) { oversizedDecode = true; throw new Error('Oversized tile reached decoder'); } return originalAtob(input); };
    try { await assert.rejects(app.loadProject(oversized), /整笔记录/); } finally { win.atob = originalAtob; }
    assert.equal(oversizedDecode, false); assert.equal(hash(pixels(active().canvas)), original);
    const old = JSON.parse(await app.exportProject()); delete old.layers[0].strokes;
    old.layers[0].pendingPath = { nodes: [{ x: 5, y: 5 }] }; old.settings.resumePen = true; old.settings.tool = 'pen';
    await app.loadProject(old); assert.equal(app.inspect().tool, 'brush'); assert.equal(app.inspect().strokeCount, 0); assert.equal(hash(pixels(active().canvas)), original);
    eraser('stroke'); stroke([[64, 48]]); assert.equal(hash(pixels(active().canvas)), original);
    eraser('local', 12); stroke([[64, 48]]); assert.equal(pixel(active().canvas, 64, 48)[3], 0);
  });

  await test('128-operation retirement keeps pixels and immutable historical states; aggregate tiles stay within 16 MiB', () => {
    const target = native.createCanvas(64, 64), sourceCanvas = native.createCanvas(64, 64), paint = sourceCanvas.getContext('2d'), layer = { canvas: target, strokeRecords: null };
    let first;
    for (let i = 0; i < 131; i++) {
      paint.clearRect(0, 0, 64, 64); paint.fillStyle = '#e02020'; paint.fillRect(i % 64, 10 + Math.floor(i / 64), 1, 1);
      layer.strokeRecords = Records.append(layer.strokeRecords, target, sourceCanvas, { x: i % 64, y: 10 + Math.floor(i / 64), width: 1, height: 1 }, { kind: 'stroke', opacity: 1, id: 'mark-' + i });
      target.getContext('2d').drawImage(sourceCanvas, 0, 0); if (!i) first = layer.strokeRecords; Records.limit([layer]);
    }
    assert.equal(Records.count(layer.strokeRecords), 128); assert.equal(pixel(target, 0, 10)[3], 255); assert.equal(Records.hit(layer.strokeRecords, .5, 10.5, .75), null);
    const earlier = native.createCanvas(64, 64); Records.render(first, earlier); assert.equal(pixel(earlier, 0, 10)[3], 255); assert.equal(pixel(earlier, 1, 10)[3], 0);
    const rawBytes = Records.bytes([first]); Records.exportBundle(first);
    assert.equal(Records.bytes([first, first], new Set(), true), rawBytes * 2, 'Cached immutable Blob bytes are counted once alongside their RGBA buffer');
    const layers = [0, 1].map(() => ({ canvas: native.createCanvas(256, 128), strokeRecords: null }));
    const full = native.createCanvas(256, 128); full.getContext('2d').fillRect(0, 0, 256, 128);
    for (let i = 0; i < 75; i++) for (const item of layers) {
      item.strokeRecords = Records.append(item.strokeRecords, item.canvas, full, { x: 0, y: 0, width: 256, height: 128 }, { kind: 'stroke', opacity: .3, id: 'budget-' + i });
      item.canvas.getContext('2d').save(); item.canvas.getContext('2d').globalAlpha = .3; item.canvas.getContext('2d').drawImage(full, 0, 0); item.canvas.getContext('2d').restore(); Records.limit(layers);
      assert.ok(Records.bytes(layers.map(item => item.strokeRecords)) <= Records.MAX_BYTES);
    }
    assert.ok(layers.some(item => Records.count(item.strokeRecords) < 75));
    const duplicate = { canvas: native.createCanvas(256, 128), strokeRecords: layers[1].strokeRecords };
    duplicate.canvas.getContext('2d').drawImage(layers[1].canvas, 0, 0); layers.push(duplicate); Records.limit(layers);
    assert.ok(layers.reduce((n, item) => n + Records.bytes([item.strokeRecords]), 0) <= Records.MAX_BYTES, 'Copied layers reserve independent decoded project bytes');
    assert.ok(app.inspect().historyBytes >= app.inspect().strokeBytes, 'History accounting includes provenance buffer memory');
  });

  await test('Automatic current-work restoration retains independent stroke IDs and local erasure masks', async () => {
    const database = new IDBFactory(), first = await openStudio(database); live.push(first); const one = harnessUI(first);
    one.fresh(); one.drawCross(); one.eraser('local', 20); one.stroke([[64, 48]]); await one.app.saveDraft(); const before = hash(pixels(one.active().canvas));
    first.window.close(); live = live.filter(value => value !== first);
    const second = await openStudio(database); live.push(second); const two = harnessUI(second);
    assert.equal(hash(pixels(two.active().canvas)), before); assert.equal(two.app.inspect().strokeCount, 2);
    two.eraser('stroke'); two.stroke([[64, 20]]); assert.equal(pixel(two.active().canvas, 64, 48)[3], 0); assert.equal(pixel(two.active().canvas, 30, 48)[3], 255);
  });
  assert.deepEqual(errors, [], 'No asynchronous page or canvas errors');
  console.log('Whole-stroke regression: ' + passed + ' checks passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { for (const dom of live) dom.window.close(); });
