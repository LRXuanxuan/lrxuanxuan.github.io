/* Development-only shape editing integration with the deployed DOM/app and real Canvas pixels.
 * This does not start a browser or claim hardware validation. Dependencies stay out of the site.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules node tools/test_drawing_shape_editing.cjs
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
assert.ok(boundary > 0, 'The existing integration harness has a suite boundary');
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixel, pixels, hash, decoded };', harnessFile);
const { openStudio, errors, pixel, pixels, hash, decoded } = harness.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const live = [];
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }

function uiFor(dom) {
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const element = doc.getElementById(id); assert.ok(element, id); return element; };
  const state = () => app.inspect();
  const active = () => app.getLayer(state().activeId);
  const shapes = () => Array.from(active().strokeRecords?.operations || []).filter(op => op.shape);
  const tool = value => { const button = doc.querySelector('[data-tool="' + value + '"]'); assert.ok(button); button.click(); };
  const edit = (id, value) => {
    el(id).value = String(value);
    el(id).dispatchEvent(new win.Event('input', { bubbles: true }));
    el(id).dispatchEvent(new win.Event('change', { bubbles: true }));
  };
  const check = (id, value) => { el(id).checked = value; el(id).dispatchEvent(new win.Event('change', { bubbles: true })); };
  const key = (value, extra = {}, target = doc) => target.dispatchEvent(new win.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...extra }));
  function pointer(type, x, y, extra = {}) {
    const drawing = el('drawingCanvas'), rect = drawing.getBoundingClientRect();
    drawing.dispatchEvent(new win.PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 51, pointerType: 'mouse', isPrimary: true,
      button: 0, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
      pressure: type === 'pointerup' ? 0 : .5,
      clientX: rect.left + x / drawing.width * rect.width,
      clientY: rect.top + y / drawing.height * rect.height, ...extra
    }));
  }
  function drag(points, release = true, extra = {}) {
    pointer('pointerdown', ...points[0], extra);
    points.slice(1).forEach(point => pointer('pointermove', ...point, extra));
    if (release) pointer('pointerup', ...points[points.length - 1], extra);
    app.render();
  }
  function selectAt(x, y) { tool('shape'); edit('shapeMode', 'select'); drag([[x, y]]); }
  function insert(points, extra = {}) {
    tool('shape'); el('shapeInsertNew').click(); drag(points, true, extra);
    assert.ok(shapes().length, 'Inserting creates a persistent shape record');
    return shapes().at(-1);
  }
  async function fresh(options = {}) {
    await app.newDocument({ width: 160, height: 128, title: '形状编辑回归', paper: 'transparent', ...options });
    tool('shape'); edit('shapeMode', 'insert'); edit('shapeKind', 'rect');
    check('shapeConstrain', false); check('shapeFill', true); check('shapeStroke', false);
    edit('materialKind', 'solid'); check('materialFollowInk', true); check('materialTransparent', false);
    edit('inkColor', '#e02020'); edit('brushOpacity', 100);
  }
  const digest = () => ({ pixels: hash(pixels(active().canvas)), shapes: shapes().map(op => ({ id: op.id, opacity: op.opacity, shape: plain(op.shape) })) });
  return { win, doc, app, el, state, active, shapes, tool, edit, check, key, pointer, drag, selectAt, insert, fresh, digest };
}

async function main() {
  const dom = await openStudio(); live.push(dom);
  const ui = uiFor(dom);
  const { win, doc, app, el, state, active, shapes, tool, edit, check, key, pointer, drag, selectAt, insert, fresh, digest } = ui;

  await test('Insertion retains editable geometry, selects the shape, and excludes guides from PNG export', async () => {
    await fresh(); const history = state().history;
    const shape = insert([[24, 24], [72, 64]]);
    assert.equal(shapes().length, 1); assert.equal(state().history, history + 1);
    assert.equal(el('shapeMode').value, 'select');
    assert.equal(el('shapeDuplicate').disabled, false); assert.equal(el('shapeDelete').disabled, false);
    assert.deepEqual([shape.shape.x, shape.shape.y, shape.shape.width, shape.shape.height], [24, 24, 48, 40]);
    assert.deepEqual(pixel(active().canvas, 48, 44), [224, 32, 32, 255]);
    assert.equal(Records.count(active().strokeRecords), 0, 'Shape identity does not masquerade as a brush stroke');
    const exported = (await decoded(await app.exportRaster('png', true))).canvas;
    assert.equal(hash(pixels(exported)), hash(pixels(active().canvas)), 'Selection handles never become artwork pixels');
    assert.equal(pixel(exported, 24, 20)[3], 0);
  });

  await test('Moving previews without mutating pixels, clears the old position, and uses one undo step', async () => {
    await fresh(); insert([[24, 24], [72, 64]]);
    const before = digest(), history = state().history;
    drag([[48, 44], [100, 70]], false);
    assert.equal(state().drawing, true); assert.deepEqual(digest(), before, 'Pending movement leaves committed records and pixels intact');
    assert.ok(pixel(el('drawingCanvas'), 100, 70)[3] > 0, 'New position is visible before release');
    pointer('pointerup', 100, 70); app.render();
    const moved = digest();
    assert.equal(state().history, history + 1);
    assert.deepEqual([shapes()[0].shape.x, shapes()[0].shape.y], [76, 50]);
    assert.equal(pixel(active().canvas, 40, 40)[3], 0, 'Old shape pixels are removed');
    assert.deepEqual(pixel(active().canvas, 100, 70), [224, 32, 32, 255]);
    app.undo(); assert.deepEqual(digest(), before);
    app.redo(); assert.deepEqual(digest(), moved);
  });

  await test('Corner handles resize shape geometry; Shift retains the original aspect ratio', async () => {
    await fresh(); insert([[24, 24], [72, 64]]);
    const before = digest(), history = state().history;
    drag([[72, 64], [108, 96]]);
    assert.equal(state().history, history + 1);
    assert.deepEqual([shapes()[0].shape.x, shapes()[0].shape.y, shapes()[0].shape.width, shapes()[0].shape.height], [24, 24, 84, 72]);
    assert.deepEqual(pixel(active().canvas, 100, 90), [224, 32, 32, 255]);
    app.undo(); assert.deepEqual(digest(), before);
    selectAt(48, 44);
    drag([[72, 64], [114, 83]], true, { shiftKey: true });
    const resized = shapes()[0].shape;
    assert.ok(Math.abs(resized.width / resized.height - 48 / 40) < .0001, 'Constrained resize preserves the selected shape ratio');
    assert.equal(resized.x, 24); assert.equal(resized.y, 24);
  });

  await test('Style application changes only the selected shape and remains separately undoable', async () => {
    await fresh(); insert([[24, 24], [88, 80]]);
    const before = digest(), history = state().history;
    edit('shapeKind', 'ellipse'); check('materialFollowInk', false);
    edit('materialForeground', '#2040e0'); edit('brushOpacity', 50);
    assert.deepEqual(digest(), before, 'Picking settings waits for the explicit Apply action');
    el('shapeApplyStyle').click(); app.render();
    assert.equal(state().history, history + 1); assert.equal(shapes()[0].shape.type, 'ellipse');
    const center = pixel(active().canvas, 56, 52);
    [32, 64, 224].forEach((value, i) => assert.ok(Math.abs(center[i] - value) <= 1));
    assert.ok(Math.abs(center[3] - 128) <= 1, 'Shape opacity is composited exactly once');
    assert.equal(pixel(active().canvas, 25, 25)[3], 0, 'Old rectangular corners do not survive the ellipse style change');
    const after = digest(); app.undo(); assert.deepEqual(digest(), before); app.redo(); assert.deepEqual(digest(), after);
  });

  await test('Copies use independent IDs and settings; Delete and keyboard duplicate each create one history step', async () => {
    await fresh(); const original = insert([[20, 20], [60, 56]]), originalShape = plain(original.shape);
    const originalId = original.id, before = digest(), history = state().history;
    el('shapeDuplicate').click(); app.render();
    assert.equal(shapes().length, 2); assert.equal(state().history, history + 1);
    const copy = shapes().at(-1); assert.notEqual(copy.id, originalId);
    assert.notEqual(copy.shape, original.shape); assert.notEqual(copy.shape.fill, original.shape.fill);
    assert.ok(copy.shape.x !== originalShape.x || copy.shape.y !== originalShape.y, 'A copy is offset so it can be picked immediately');
    check('materialFollowInk', false); edit('materialForeground', '#2040e0'); el('shapeApplyStyle').click();
    assert.deepEqual(plain(shapes()[0].shape), originalShape, 'Editing a copy cannot alter its original');
    const copyId = shapes().at(-1).id, styled = digest();
    const historyBeforeDelete = state().history; key('Delete'); app.render();
    assert.equal(state().history, historyBeforeDelete + 1); assert.equal(shapes().length, 1); assert.equal(shapes()[0].id, originalId);
    assert.equal(hash(pixels(active().canvas)), before.pixels, 'Deleting the copy exposes the original unchanged');
    app.undo(); assert.deepEqual(digest(), styled); assert.equal(shapes().at(-1).id, copyId);
    selectAt(35, 30); const count = shapes().length, historyBeforeKey = state().history;
    key('d', { ctrlKey: true }); assert.equal(shapes().length, count + 1); assert.equal(state().history, historyBeforeKey + 1);
    app.undo(); assert.equal(shapes().length, count);
    const text = el('textContent'); text.focus(); key('d', { ctrlKey: true }, text);
    assert.equal(shapes().length, count, 'Text inputs keep their own keyboard behavior'); el('canvasViewport').focus();
  });

  await test('The object list selects a fully covered shape while preserving the later shape above it', async () => {
    await fresh(); const lower = insert([[24, 24], [72, 64]]);
    edit('inkColor', '#2040e0'); const upper = insert([[24, 24], [72, 64]]);
    assert.equal(shapes().length, 2); assert.notEqual(lower.id, upper.id);
    edit('shapeObject', lower.id);
    assert.equal(el('shapeObject').value, lower.id);
    check('materialFollowInk', false); edit('materialForeground', '#20a050'); el('shapeApplyStyle').click();
    assert.deepEqual(pixel(active().canvas, 48, 44), [32, 64, 224, 255], 'Editing an obscured shape keeps later content on top');
    edit('shapeObject', upper.id); el('shapeDelete').click(); app.render();
    assert.deepEqual(pixel(active().canvas, 48, 44), [32, 160, 80, 255], 'Removing the upper shape reveals the updated lower shape');
  });

  await test('Moving an earlier shape preserves later brush strokes and the original compositing order', async () => {
    await fresh(); insert([[20, 20], [72, 64]]);
    tool('brush'); edit('brushKind', 'binary'); edit('brushSize', 6); edit('stabilizer', 0); edit('inkColor', '#2040e0'); edit('brushOpacity', 100);
    drag([[8, 44], [150, 44]]); const strokeId = active().strokeRecords.operations.find(op => op.kind === 'stroke').id;
    const before = digest(); selectAt(36, 30); drag([[36, 30], [100, 30]]);
    assert.deepEqual(pixel(active().canvas, 40, 44), [32, 64, 224, 255], 'Old position retains the later brush line');
    assert.deepEqual(pixel(active().canvas, 100, 44), [32, 64, 224, 255], 'Later brush line stays above the moved shape');
    assert.deepEqual(pixel(active().canvas, 100, 30), [224, 32, 32, 255]);
    assert.equal(pixel(active().canvas, 36, 30)[3], 0);
    assert.equal(active().strokeRecords.operations.find(op => op.kind === 'stroke').id, strokeId);
    app.undo(); assert.deepEqual(digest(), before); app.redo();
    selectAt(100, 30); el('shapeDelete').click(); app.render();
    assert.deepEqual(pixel(active().canvas, 100, 44), [32, 64, 224, 255]); assert.equal(pixel(active().canvas, 100, 30)[3], 0);
  });

  await test('Local erasure remains ordered and whole erasure of the last stroke keeps shape records', async () => {
    await fresh(); insert([[20, 20], [100, 84]]);
    tool('eraser'); edit('eraserMode', 'local'); edit('brushSize', 8); edit('brushOpacity', 100); edit('stabilizer', 0);
    drag([[60, 28], [60, 76]]);
    assert.equal(pixel(active().canvas, 60, 48)[3], 0);
    selectAt(36, 36); drag([[36, 36], [56, 36]]);
    assert.equal(pixel(active().canvas, 60, 48)[3], 0, 'Later erase mask remains applied at its canvas location');
    assert.deepEqual(pixel(active().canvas, 90, 48), [224, 32, 32, 255]);
    tool('brush'); edit('brushKind', 'binary'); edit('brushSize', 6); edit('inkColor', '#2040e0'); edit('brushOpacity', 100); edit('stabilizer', 0);
    drag([[15, 106], [140, 106]]); assert.equal(Records.count(active().strokeRecords), 1);
    tool('eraser'); edit('eraserMode', 'stroke'); drag([[80, 106]]);
    assert.equal(Records.count(active().strokeRecords), 0); assert.equal(shapes().length, 1, 'The only remaining editable object is retained');
    selectAt(90, 48); assert.equal(el('shapeDuplicate').disabled, false);
  });

  await test('Layer transforms map pointer movement to local shape geometry and protect other layers', async () => {
    await fresh(); const lower = active(), paint = lower.canvas.getContext('2d');
    paint.fillStyle = '#33aa66'; paint.fillRect(2, 2, 16, 16); const lowerHash = hash(pixels(lower.canvas));
    app.addLayer(); const layer = active(); layer.x = 12; layer.y = 8; layer.scale = 1.5;
    insert([[36, 32], [96, 80]]);
    assert.deepEqual([shapes()[0].shape.x, shapes()[0].shape.y, shapes()[0].shape.width, shapes()[0].shape.height], [16, 16, 40, 32]);
    drag([[66, 56], [96, 74]]);
    assert.deepEqual([shapes()[0].shape.x, shapes()[0].shape.y], [36, 28]);
    assert.equal(hash(pixels(lower.canvas)), lowerHash); assert.equal(layer.x, 12); assert.equal(layer.y, 8); assert.equal(layer.scale, 1.5);
    const before = digest(), history = state().history;
    for (const property of ['locked', 'visible']) {
      layer[property] = property === 'locked';
      el('shapeDuplicate').click(); el('shapeApplyStyle').click(); el('shapeDelete').click(); drag([[96, 74], [116, 94]]);
      assert.deepEqual(digest(), before); assert.equal(state().history, history);
      layer[property] = property !== 'locked';
    }
  });

  await test('Esc, pointer cancellation, lost capture, blur and switching tools discard pending transforms', async () => {
    const actions = [
      () => key('Escape'), () => pointer('pointercancel', 110, 80),
      () => pointer('lostpointercapture', 110, 80), () => win.dispatchEvent(new win.Event('blur')), () => tool('brush')
    ];
    for (const action of actions) {
      await fresh(); insert([[24, 24], [72, 64]]); const before = digest(), history = state().history;
      drag([[48, 44], [110, 80]], false); assert.equal(state().drawing, true);
      action(); app.render(); assert.equal(state().drawing, false);
      assert.deepEqual(digest(), before); assert.equal(state().history, history);
    }
  });

  await test('Reverse horizontal arrows retain directed endpoints when moved', async () => {
    await fresh(); edit('shapeKind', 'arrow');
    const shape = insert([[110, 36], [30, 36]]);
    assert.equal(shape.shape.width, -80); assert.equal(shape.shape.height, 0);
    drag([[74, 36], [84, 80]]);
    assert.equal(shapes()[0].shape.x, 120); assert.equal(shapes()[0].shape.y, 80);
    assert.equal(shapes()[0].shape.width, -80); assert.equal(shapes()[0].shape.height, 0);
    assert.ok(pixel(active().canvas, 84, 80)[3] > 0); assert.equal(pixel(active().canvas, 74, 36)[3], 0);
  });

  await test('Portable project roundtrip retains geometry and permits another edit after reopening', async () => {
    await fresh(); insert([[24, 24], [72, 64]]); drag([[48, 44], [104, 74]]);
    const before = digest(), project = await app.serializeProject();
    await app.loadProject(project); app.render(); assert.deepEqual(digest(), before);
    selectAt(104, 74); assert.equal(el('shapeDuplicate').disabled, false);
    drag([[104, 74], [88, 94]]); assert.notEqual(digest().pixels, before.pixels);
    app.undo(); assert.deepEqual(digest(), before);
  });

  await test('Legacy raster-only artwork remains intact without inventing editable shape identities', async () => {
    await fresh(); insert([[24, 24], [72, 64]]);
    const before = hash(pixels(active().canvas)), project = await app.serializeProject();
    project.layers.forEach(layer => { delete layer.strokes; });
    await app.loadProject(project); app.render();
    assert.equal(hash(pixels(active().canvas)), before); assert.equal(shapes().length, 0);
    selectAt(48, 44); assert.equal(el('shapeDuplicate').disabled, true); assert.equal(el('shapeDelete').disabled, true);
    assert.match(el('shapeEditHint').textContent, /没有可编辑形状/);
  });

  await test('Current artwork auto-save reopens with selectable shapes', async () => {
    const isolated = await openStudio(); live.push(isolated);
    const first = uiFor(isolated); await first.fresh(); first.insert([[24, 24], [72, 64]]);
    await first.app.saveDraft(); const before = first.digest();
    const reopened = await openStudio(isolated.window.indexedDB); live.push(reopened);
    const second = uiFor(reopened); assert.deepEqual(second.digest(), before);
    second.selectAt(48, 44); assert.equal(second.el('shapeDuplicate').disabled, false);
    second.drag([[48, 44], [104, 76]]); assert.notEqual(second.digest().pixels, before.pixels);
  });

  assert.deepEqual(errors, [], 'No runtime script errors');
  console.log(`Editable shape app integration: ${passed}/${passed} passed.`);
}
main().then(() => live.forEach(dom => dom.window.close())).catch(error => {
  console.error(error); live.forEach(dom => dom.window.close()); process.exitCode = 1;
});
