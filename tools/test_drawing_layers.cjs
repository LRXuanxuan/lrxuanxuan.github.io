/* Dev-only layer regressions using the deployed DOM/app and a real Canvas backend.
 * No browser/device is started, and none of these dependencies ship with the app.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules node tools/test_drawing_layers.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const Records = require('../assets/drawing-studio/stroke-records.js');
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const source = fs.readFileSync(harnessFile, 'utf8');
const boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'Integration harness has an explicit suite boundary');
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixel, pixels, hash, decoded };', harnessFile);
const { openStudio, errors, pixel, pixels, hash, decoded } = harness.exports;
let passed = 0;
const live = [];
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
const plain = value => JSON.parse(JSON.stringify(value));

// Include actual immutable tile bytes, not only the number of recorded strokes.
// Import deliberately regenerates operation order, so it is not a portable ID.
function recordDigest(records) {
  if (!records) return null;
  const tiles = values => Array.from(values, ([key, p]) => ({ key, x: p.x, y: p.y,
    width: p.width, height: p.height, pixels: hash(Buffer.from(p.image.data)) }));
  return { width: records.width, height: records.height, base: tiles(records.base),
    operations: Array.from(records.operations, op => ({ id: op.id, kind: op.kind,
      opacity: op.opacity, tiles: tiles(op.tiles) })) };
}
function uiFor(dom) {
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const value = doc.getElementById(id); assert.ok(value, id); return value; };
  const state = () => plain(app.inspect());
  const active = () => app.getLayer(state().activeId);
  const tool = name => { const button = doc.querySelector('[data-tool="' + name + '"]'); assert.ok(button); button.click(); };
  const input = (id, value) => { el(id).value = String(value); el(id).dispatchEvent(new win.Event('input', { bubbles: true })); };
  const edit = (id, value) => { input(id, value); el(id).dispatchEvent(new win.Event('change', { bubbles: true })); };
  function pointer(type, x, y) {
    const drawing = el('drawingCanvas'), rect = drawing.getBoundingClientRect();
    drawing.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true,
      pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0,
      buttons: type === 'pointerup' ? 0 : 1, pressure: type === 'pointerup' ? 0 : .5,
      clientX: rect.left + x / drawing.width * rect.width,
      clientY: rect.top + y / drawing.height * rect.height }));
  }
  function stroke(points) {
    pointer('pointerdown', ...points[0]);
    points.slice(1).forEach(point => pointer('pointermove', ...point));
    pointer('pointerup', ...points[points.length - 1]); app.render();
  }
  async function fresh(options = {}) {
    await app.newDocument({ width: 96, height: 80, title: '图层回归', paper: 'transparent', ...options });
    tool('brush'); edit('brushKind', 'binary'); edit('brushSize', 6);
    edit('brushOpacity', 100); edit('stabilizer', 0); edit('inkColor', '#e02020');
  }
  function capture() {
    app.render(); const current = state();
    const { width, height, title, paper, paperColor, paperOpacity, paperTexture, textureStrength, tone, activeId } = current;
    return { width, height, title, paper, paperColor, paperOpacity, paperTexture, textureStrength, tone, activeId,
      layers: current.layers.map(metadata => { const layer = app.getLayer(metadata.id);
        return { ...metadata, pixels: hash(pixels(layer.canvas)), records: recordDigest(layer.strokeRecords) }; }),
      display: hash(pixels(el('drawingCanvas'))) };
  }
  const raster = async transparent => (await decoded(await app.exportRaster('png', transparent))).canvas;
  function paint(layer, color, x, y, w, h) {
    const ctx = layer.canvas.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  }
  function row(id) {
    app.selectLayer(id); const value = doc.querySelector('.layer-row.active'); assert.ok(value); return value;
  }
  function visibilityButton() {
    const button = doc.querySelector('.layer-row.active .layer-visibility'); assert.ok(button); return button;
  }
  function toggleVisibility() { visibilityButton().click(); }
  function assertVisibilityAction(show) {
    const button = visibilityButton(), expected = show ? /显示/ : /隐藏/;
    assert.ok(button.querySelector('svg'), 'Visibility uses an eye icon');
    assert.match(button.title, expected); assert.match(button.getAttribute('aria-label'), expected);
  }
  return { app, win, doc, el, state, active, tool, input, edit, pointer, stroke, fresh, capture, raster, paint, row, toggleVisibility, assertVisibilityAction };
}

async function main() {
  const dom = await openStudio(); live.push(dom);
  const ui = uiFor(dom);
  const { app, win, doc, el, state, active, tool, input, edit, pointer, stroke, fresh,
    capture, raster, paint, row, toggleVisibility, assertVisibilityAction } = ui;

  await test('Copy preserves transformed hidden pixels and full stroke records; undo and edits remain independent', async () => {
    await fresh(); stroke([[12, 24], [68, 24]]); edit('inkColor', '#2040e0');
    edit('brushOpacity', 65); stroke([[42, 8], [42, 62]]);
    edit('layerOpacity', 62); edit('layerScale', 75);
    tool('move'); stroke([[48, 36], [57, 30]]);
    toggleVisibility(); row(active().id).querySelector('.layer-lock').click();
    const original = active(), originalPixels = hash(pixels(original.canvas));
    const originalRecords = recordDigest(original.strokeRecords), before = capture(), history = state().history;
    assert.equal(Records.count(original.strokeRecords), 2);
    el('duplicateLayer').click(); const copy = active(), copied = capture();
    assert.notEqual(copy.id, original.id); assert.notEqual(copy.canvas, original.canvas);
    assert.equal(hash(pixels(copy.canvas)), originalPixels);
    assert.deepEqual(recordDigest(copy.strokeRecords), originalRecords);
    for (const key of ['visible', 'opacity', 'x', 'y', 'scale']) assert.equal(copy[key], original[key], key);
    assert.equal(copy.locked, false, 'A copied layer can be edited without unlocking its original');
    assert.equal(state().layers.findIndex(layer => layer.id === copy.id), state().layers.findIndex(layer => layer.id === original.id) + 1);
    assert.equal(state().history, history + 1);
    app.undo(); assert.deepEqual(capture(), before);
    app.redo(); assert.deepEqual(capture(), copied);
    toggleVisibility(); tool('eraser'); edit('eraserMode', 'stroke');
    stroke([[copy.x + 24 * copy.scale, copy.y + 24 * copy.scale]]);
    assert.equal(Records.count(active().strokeRecords), 1);
    assert.notEqual(hash(pixels(active().canvas)), originalPixels);
    assert.equal(hash(pixels(app.getLayer(original.id).canvas)), originalPixels);
    assert.deepEqual(recordDigest(app.getLayer(original.id).strokeRecords), originalRecords);
    assert.equal(app.getLayer(original.id).visible, false); assert.equal(app.getLayer(original.id).locked, true);
  });

  await test('Copy finishes the active stroke and settles the opacity gesture before its own history step', async () => {
    await fresh(); const originalId = active().id;
    pointer('pointerdown', 14, 30); pointer('pointermove', 74, 30);
    assert.equal(state().drawing, true); el('duplicateLayer').click();
    assert.equal(state().drawing, false); assert.equal(Records.count(active().strokeRecords), 1);
    const finished = hash(pixels(app.getLayer(originalId).canvas));
    assert.equal(hash(pixels(active().canvas)), finished);
    app.undo(); assert.equal(state().layers.length, 1); assert.equal(active().id, originalId);
    assert.equal(hash(pixels(active().canvas)), finished); assert.equal(Records.count(active().strokeRecords), 1);
    input('layerOpacity', 37); el('duplicateLayer').click();
    assert.equal(active().opacity, .37); app.undo();
    assert.equal(state().layers.length, 1); assert.equal(active().opacity, .37);
    app.undo(); assert.equal(active().opacity, 1, 'The prior parameter gesture has a separate, correct undo');
    assert.equal(hash(pixels(active().canvas)), finished);
  });

  await test('Copy over the portable stroke-record budget is rejected without retiring records or changing pixels/history', async () => {
    await fresh({ width: 512, height: 512 });
    const original = active(), canvas = original.canvas;
    const mark = doc.createElement('canvas'); mark.width = 512; mark.height = 512;
    const ink = mark.getContext('2d'), target = canvas.getContext('2d');
    // Eight real full-area operations plus their shared base occupy 9 MiB.
    // This is valid below the 16 MiB live/portable limit; a second layer would
    // decode to 18 MiB even though immutable records could share RAM while open.
    for (let i = 0; i < 8; i++) {
      ink.fillStyle = i % 2 ? '#2864bc' : '#df482a'; ink.fillRect(0, 0, 512, 512);
      original.strokeRecords = Records.append(original.strokeRecords, canvas, mark,
        { x: 0, y: 0, width: 512, height: 512 }, { kind: 'stroke', opacity: 1, id: 'copy-budget-' + i });
      target.drawImage(mark, 0, 0);
    }
    const bytes = Records.bytes([original.strokeRecords]), records = original.strokeRecords;
    assert.equal(bytes, 9 * 1024 * 1024); assert.ok(bytes <= Records.MAX_BYTES && bytes * 2 > Records.MAX_BYTES);
    assert.equal(Records.count(records), 8);
    const before = capture(), history = state().history;
    assert.throws(() => app.duplicateLayer(), /整笔记录.*限额/);
    el('duplicateLayer').click();
    assert.deepEqual(capture(), before); assert.equal(state().history, history);
    assert.equal(state().layers.length, 1); assert.equal(active().canvas, canvas);
    assert.equal(active().strokeRecords, records); assert.equal(Records.bytes([records]), bytes);
    assert.equal(Records.count(records), 8, 'Budget rejection must not silently retire old source strokes');
  });

  await test('Hide/show retains pixels and provenance across undo, redo and portable project reopening', async () => {
    await fresh(); paint(active(), '#e6ae58', 4, 4, 24, 24);
    stroke([[8, 16], [24, 16]]); app.addLayer(); edit('inkColor', '#2040e0');
    stroke([[12, 48], [76, 48]]); edit('layerOpacity', 55);
    const topId = active().id, topPixels = hash(pixels(active().canvas));
    const shown = capture(), history = state().history;
    assertVisibilityAction(false); assert.ok(pixel(el('drawingCanvas'), 40, 48)[3] > 0);
    toggleVisibility(); const hidden = capture();
    assertVisibilityAction(true); assert.equal(active().visible, false); assert.equal(state().history, history + 1);
    assert.equal(hash(pixels(active().canvas)), topPixels); assert.equal(Records.count(active().strokeRecords), 1);
    assert.equal(pixel(el('drawingCanvas'), 40, 48)[3], 0);
    assert.equal(row(topId).querySelector('.layer-visibility').getAttribute('aria-pressed'), 'false');
    app.undo(); assert.deepEqual(capture(), shown); assertVisibilityAction(false);
    app.redo(); assert.deepEqual(capture(), hidden); assertVisibilityAction(true);
    await app.loadProject(await app.exportProject()); assert.deepEqual(capture(), hidden);
    row(topId).querySelector('.layer-visibility').click();
    assert.deepEqual(capture(), shown); assertVisibilityAction(false);
  });

  // Seed imported-looking translucent pixels before drawing actual recorded strokes.
  // Transform setup is a fixture; merge itself is always invoked through deployed UI/API.
  async function mergeFixture() {
    await fresh({ paper: 'custom', paperColor: '#ecd7b8', paperOpacity: 70, paperTexture: 'none' });
    const lower = active(); paint(lower, 'rgba(220,64,20,0.65)', 8, 12, 40, 24);
    edit('brushOpacity', 45); stroke([[12, 28], [60, 28]]);
    Object.assign(lower, { x: 6, y: 5, scale: 1.25, opacity: .65 });
    app.addLayer(); const upper = active(); paint(upper, 'rgba(35,82,218,0.7)', 20, 22, 40, 30);
    edit('inkColor', '#185ed0'); edit('brushOpacity', 80); stroke([[40, 10], [40, 64]]);
    Object.assign(upper, { x: 8, y: 10, scale: .75, opacity: .55 });
    app.addLayer(); const untouched = active(); edit('inkColor', '#1ca065');
    edit('brushOpacity', 100); stroke([[78, 68], [89, 68]]);
    app.selectLayer(upper.id); app.render();
    return { lower, upper, untouched };
  }

  await test('Merge keeps translucent transformed artwork exact and excludes paper, other layers and global tone', async () => {
    const { lower, upper, untouched } = await mergeFixture();
    const raw = await raster(true), rawHash = hash(pixels(raw));
    assert.ok(pixel(raw, 35, 35)[3] > 0 && pixel(raw, 35, 35)[3] < 255, 'Fixture has a translucent overlap');
    edit('hue', 37); edit('saturation', -24); edit('lightness', 18);
    const tone = state().tone, toned = hash(pixels(await raster(true))), paper = hash(pixels(await raster(false)));
    assert.notEqual(toned, rawHash, 'Tone really changes pixels in this backend');
    const untouchedBefore = capture().layers.find(layer => layer.id === untouched.id), history = state().history;
    assert.equal(el('mergeLayerDown').disabled, false); el('mergeLayerDown').click();
    assert.equal(state().history, history + 1); assert.equal(state().layers.length, 2);
    assert.equal(active().id, upper.id); assert.equal(active().name, upper.name); assert.equal(app.getLayer(lower.id), undefined);
    assert.equal(active().visible, true); assert.equal(active().locked, false);
    assert.deepEqual([active().opacity, active().x, active().y, active().scale], [1, 0, 0, 1]);
    assert.equal(active().strokeRecords, null); assert.deepEqual(state().tone, tone);
    assert.equal(pixel(active().canvas, 0, 0)[3], 0, 'The paper is not baked into the merged raster');
    assert.equal(pixel(active().canvas, 84, 68)[3], 0, 'An unrelated upper stroke is not baked into the pair');
    assert.deepEqual(capture().layers.find(layer => layer.id === untouched.id), untouchedBefore);
    assert.equal(hash(pixels(await raster(true))), toned);
    assert.equal(hash(pixels(await raster(false))), paper);
    el('resetTone').click(); assert.equal(hash(pixels(await raster(true))), rawHash, 'Changing tone after merge does not reveal baked-in adjustments');
  });

  await test('One merge undo/redo restores exact layer pixels, transforms and record bytes; merged project round-trips', async () => {
    const { lower, upper } = await mergeFixture(); edit('hue', -23); edit('lightness', 12);
    const before = capture(), lowerCanvas = lower.canvas, upperCanvas = upper.canvas;
    const lowerRecords = lower.strokeRecords, upperRecords = upper.strokeRecords, history = state().history;
    el('mergeLayerDown').click(); const merged = capture(), mergedCanvas = active().canvas;
    assert.equal(state().history, history + 1); assert.notEqual(mergedCanvas, lowerCanvas); assert.notEqual(mergedCanvas, upperCanvas);
    app.undo(); assert.deepEqual(capture(), before); assert.equal(state().history, history);
    assert.equal(app.getLayer(lower.id).canvas, lowerCanvas); assert.equal(app.getLayer(upper.id).canvas, upperCanvas);
    assert.equal(app.getLayer(lower.id).strokeRecords, lowerRecords); assert.equal(app.getLayer(upper.id).strokeRecords, upperRecords);
    app.redo(); assert.deepEqual(capture(), merged); assert.equal(active().canvas, mergedCanvas);
    await app.loadProject(await app.exportProject()); assert.deepEqual(capture(), merged);
    assert.equal(active().strokeRecords, null);
  });

  await test('Hidden/locked neighbors and the bottom layer are guarded; icon hints follow selection and visibility', async () => {
    await fresh(); stroke([[12, 20], [70, 20]]); const bottom = active().id;
    app.addLayer(); stroke([[12, 40], [70, 40]]); const middle = active().id;
    app.addLayer(); stroke([[12, 60], [70, 60]]); const top = active().id;
    for (const id of ['duplicateLayer', 'mergeLayerDown']) {
      const button = el(id); assert.ok(button.querySelector('svg'), id + ' uses an icon');
      assert.ok(button.title); assert.ok(button.getAttribute('aria-label'));
    }
    function blocked(reason) {
      assert.equal(el('mergeLayerDown').disabled, true);
      assert.match(el('mergeLayerDown').title, reason);
      const before = capture(), history = state().history;
      app.mergeLayerDown();
      el('mergeLayerDown').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
      assert.deepEqual(capture(), before); assert.equal(state().history, history);
    }
    app.selectLayer(bottom); blocked(/最底|下方|下层|最低/);
    app.selectLayer(top); assert.equal(el('mergeLayerDown').disabled, false);
    assert.match(el('mergeLayerDown').getAttribute('aria-label'), /合并/);
    row(top).querySelector('.layer-lock').click(); blocked(/锁/);
    row(top).querySelector('.layer-lock').click(); assert.equal(el('mergeLayerDown').disabled, false);
    toggleVisibility(); assertVisibilityAction(true); blocked(/隐藏|显示|可见/);
    toggleVisibility(); assertVisibilityAction(false); assert.equal(el('mergeLayerDown').disabled, false);
    row(middle).querySelector('.layer-visibility').click(); app.selectLayer(top); blocked(/隐藏|显示|可见/);
    assert.equal(state().layers.length, 3, 'The merge must not skip a hidden immediate neighbor');
    row(middle).querySelector('.layer-visibility').click(); row(middle).querySelector('.layer-lock').click();
    app.selectLayer(top); blocked(/锁/);
    row(middle).querySelector('.layer-lock').click(); app.selectLayer(top); assert.equal(el('mergeLayerDown').disabled, false);
    app.selectLayer(bottom); blocked(/最底|下方|下层|最低/);
  });

  await test('Merge finishes an in-progress stroke and separates the pending opacity transaction from merge undo', async () => {
    await fresh(); stroke([[12, 20], [70, 20]]); const lowerId = active().id;
    app.addLayer(); const upperId = active().id; edit('inkColor', '#2040e0');
    pointer('pointerdown', 18, 48); pointer('pointermove', 76, 48);
    assert.equal(state().drawing, true); el('mergeLayerDown').click(); assert.equal(state().drawing, false);
    assert.equal(state().layers.length, 1); assert.ok(pixel(active().canvas, 40, 48)[3] > 0);
    app.undo(); assert.equal(state().layers.length, 2); assert.equal(active().id, upperId);
    assert.equal(Records.count(app.getLayer(upperId).strokeRecords), 1); assert.equal(Records.count(app.getLayer(lowerId).strokeRecords), 1);
    input('layerOpacity', 43); app.render(); const pending = capture();
    el('mergeLayerDown').click(); assert.equal(state().layers.length, 1);
    app.undo(); assert.deepEqual(capture(), pending); assert.equal(active().opacity, .43);
    app.undo(); assert.equal(active().opacity, 1); assert.equal(state().layers.length, 2);
  });

  assert.deepEqual(errors, [], 'No page/resource errors during real Canvas regressions');
  console.log('\n' + passed + ' layer regressions passed (DOM/native Canvas; not browser or device validation).');
}
main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => { for (const dom of live) dom.window.close(); });
