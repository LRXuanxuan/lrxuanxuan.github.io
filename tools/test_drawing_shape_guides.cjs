/* Dev-only integration for line guides and four-corner shape perspective.
 * Uses the deployed DOM and real Canvas pixels, without starting a browser/device.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules node tools/test_drawing_shape_guides.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const harnessFile = path.join(__dirname, 'test_drawing_shape_editing.cjs');
const source = fs.readFileSync(harnessFile, 'utf8');
const boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'Shape integration helpers have a suite boundary');
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { uiFor, openStudio, errors, pixel, pixels, hash, decoded };', harnessFile);
const { uiFor, openStudio, errors, pixel, pixels, hash, decoded } = harness.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const near = (actual, expected, label, tolerance = .00001) => assert.ok(Math.abs(actual - expected) < tolerance, `${label}: ${actual} ≈ ${expected}`);
const nearPoint = (actual, expected, label) => { near(actual.x, expected.x, label + ' x'); near(actual.y, expected.y, label + ' y'); };
const vector = op => ({ x: op.shape.width, y: op.shape.height });
const cross = (a, b) => a.x * b.y - a.y * b.x;
const dot = (a, b) => a.x * b.x + a.y * b.y;
const live = [];
let passed = 0;
const testFilter = process.env.SHAPE_GUIDE_TEST_FILTER && new RegExp(process.env.SHAPE_GUIDE_TEST_FILTER, 'i');
async function test(name, fn) { if (testFilter && !testFilter.test(name)) return; await fn(); passed++; console.log('PASS ' + name); }

async function main() {
  const dom = await openStudio(); live.push(dom);
  const ui = uiFor(dom);
  const { win, doc, app, el, state, active, shapes, tool, edit, check, key, pointer, drag, selectAt, insert, fresh, digest } = ui;
  const latest = () => shapes().at(-1);
  async function freshLine() {
    await fresh(); edit('shapeKind', 'line'); edit('lineRelation', 'free');
    check('shapeStroke', true); edit('shapeStrokeColor', '#e02020'); edit('shapeStrokeWidth', 4);
  }
  async function perspectiveRect() {
    await fresh(); const op = insert([[20, 20], [120, 100]]);
    edit('shapeTransform', 'perspective'); return op;
  }

  await test('Parallel and perpendicular insertion project onto a non-axis-aligned reference line', async () => {
    await freshLine(); const reference = insert([[20, 20], [100, 60]]);
    el('lineSetReference').click(); assert.match(el('lineReferenceHint').textContent, /基准/);
    edit('lineRelation', 'parallel'); const parallel = insert([[30, 80], [110, 90]]);
    near(cross(vector(reference), vector(parallel)), 0, 'Parallel cross product');
    near(parallel.shape.width, 68, 'Projected parallel dx'); near(parallel.shape.height, 34, 'Projected parallel dy');
    assert.ok(pixel(active().canvas, 64, 97)[3] > 0, 'Projected line has actual painted pixels');
    edit('lineRelation', 'perpendicular'); const perpendicular = insert([[120, 48], [130, 105]]);
    near(dot(vector(reference), vector(perpendicular)), 0, 'Perpendicular dot product');
    near(perpendicular.shape.width, -20.8, 'Projected perpendicular dx'); near(perpendicular.shape.height, 41.6, 'Projected perpendicular dy');
    const before = digest(); app.undo(); assert.equal(shapes().length, 2); app.redo(); assert.deepEqual(digest(), before);
  });

  await test('Free lines remain free and a missing or deleted explicit reference never silently becomes horizontal', async () => {
    await freshLine(); edit('lineRelation', 'parallel');
    const emptyHistory = state().history; tool('shape'); el('shapeInsertNew').click(); drag([[20, 20], [90, 45]]);
    assert.equal(shapes().length, 0); assert.equal(state().history, emptyHistory);
    assert.match(el('status').textContent + el('lineReferenceHint').textContent, /基准|参考/);
    edit('lineRelation', 'free'); const reference = insert([[20, 20], [100, 60]]);
    el('lineSetReference').click(); edit('lineRelation', 'free');
    const other = insert([[20, 100], [90, 75]]);
    near(other.shape.width, 70, 'Free dx'); near(other.shape.height, -25, 'Free dy');
    edit('shapeObject', reference.id); el('shapeDelete').click();
    assert.equal(shapes().length, 1);
    edit('lineRelation', 'parallel'); const before = digest(), history = state().history;
    el('shapeInsertNew').click(); drag([[30, 30], [110, 40]]);
    assert.deepEqual(digest(), before); assert.equal(state().history, history);
    assert.match(el('status').textContent + el('lineReferenceHint').textContent, /基准|失效|重新/);
  });

  await test('Line guides read the latest reference geometry across transformed layers', async () => {
    await freshLine(); const reference = insert([[20, 20], [100, 60]]), referenceLayer = active();
    el('lineSetReference').click();
    drag([[100, 60], [60, 100]]);
    const updated = shapes().find(op => op.id === reference.id);
    near(updated.shape.width, 40, 'Updated basis dx'); near(updated.shape.height, 80, 'Updated basis dy');
    referenceLayer.x = 10; referenceLayer.y = 8; referenceLayer.scale = 1.5;
    const referencePixels = hash(pixels(referenceLayer.canvas));
    app.addLayer(); const target = active(); target.x = 4; target.y = 6; target.scale = 1.25;
    edit('lineRelation', 'parallel'); const result = insert([[60, 30], [130, 100]]);
    near(result.shape.width * target.scale, 42, 'World projected dx');
    near(result.shape.height * target.scale, 84, 'World projected dy');
    near(cross({ x: updated.shape.width * referenceLayer.scale, y: updated.shape.height * referenceLayer.scale },
      { x: result.shape.width * target.scale, y: result.shape.height * target.scale }), 0, 'World-space parallel relation');
    assert.equal(hash(pixels(referenceLayer.canvas)), referencePixels, 'Using a guide does not alter its layer');
  });

  await test('Perspective corner preview is temporary and commits a real quadrilateral in one undo step', async () => {
    await perspectiveRect(); const before = digest(), history = state().history;
    drag([[20, 20], [44, 32]], false);
    assert.deepEqual(digest(), before, 'Dragging a perspective handle keeps committed pixels and geometry intact');
    pointer('pointerup', 44, 32); app.render();
    assert.equal(state().history, history + 1); assert.equal(el('shapeMode').value, 'select');
    const quad = latest().shape.quad;
    assert.equal(quad.length, 4);
    [{ x: 44, y: 32 }, { x: 120, y: 20 }, { x: 120, y: 100 }, { x: 20, y: 100 }]
      .forEach((point, index) => nearPoint(quad[index], point, 'Corner ' + index));
    assert.equal(pixel(active().canvas, 22, 22)[3], 0, 'The old rectangular corner is removed from the actual layer');
    assert.deepEqual(pixel(active().canvas, 70, 60), [224, 32, 32, 255]);
    const warped = digest(); app.undo(); assert.deepEqual(digest(), before); app.redo(); assert.deepEqual(digest(), warped);
    const exported = (await decoded(await app.exportRaster('png', true))).canvas;
    assert.equal(hash(pixels(exported)), hash(pixels(active().canvas)), 'Perspective handles are absent from exports');
  });

  await test('Crossed perspective corners are rejected and Esc cancels a valid pending corner move', async () => {
    await perspectiveRect(); const before = digest(), history = state().history;
    drag([[20, 20], [140, 110]]);
    assert.deepEqual(digest(), before); assert.equal(state().history, history, 'An invalid quad never creates a history entry');
    assert.equal(state().drawing, false);
    drag([[20, 20], [44, 32]], false); key('Escape'); app.render();
    assert.deepEqual(digest(), before); assert.equal(state().history, history); assert.equal(state().drawing, false);
  });

  await test('Moving and normal resizing preserve an existing perspective relation', async () => {
    await perspectiveRect(); drag([[20, 20], [44, 32]]);
    const quad = plain(latest().shape.quad);
    edit('shapeTransform', 'resize'); drag([[120, 100], [140, 116]]);
    latest().shape.quad.forEach((point, index) => nearPoint(point,
      { x: 20 + (quad[index].x - 20) * 1.2, y: 20 + (quad[index].y - 20) * 1.2 }, 'Resized perspective ' + index));
    const resized = plain(latest().shape.quad);
    drag([[80, 60], [90, 66]]);
    latest().shape.quad.forEach((point, index) => nearPoint(point,
      { x: resized[index].x + 10, y: resized[index].y + 6 }, 'Moved perspective ' + index));
  });

  await test('Perspective copies have independent corners and survive project reopening', async () => {
    await perspectiveRect(); drag([[20, 20], [44, 32]]);
    const original = latest(), originalQuad = plain(original.shape.quad);
    el('shapeDuplicate').click(); app.render(); const copy = latest();
    assert.notEqual(copy.id, original.id); assert.notEqual(copy.shape.quad, original.shape.quad);
    const dx = copy.shape.quad[0].x - originalQuad[0].x, dy = copy.shape.quad[0].y - originalQuad[0].y;
    assert.ok(dx !== 0 || dy !== 0);
    copy.shape.quad.forEach((point, index) => nearPoint(point,
      { x: originalQuad[index].x + dx, y: originalQuad[index].y + dy }, 'Copied corner ' + index));
    const copiedQuad = plain(copy.shape.quad); edit('shapeTransform', 'perspective');
    drag([[copiedQuad[0].x, copiedQuad[0].y], [copiedQuad[0].x + 5, copiedQuad[0].y + 5]]);
    assert.deepEqual(plain(shapes()[0].shape.quad), originalQuad, 'Editing the copy does not change the original corner array');
    const before = digest(), project = await app.serializeProject(); await app.loadProject(project); app.render();
    assert.deepEqual(digest(), before); edit('shapeMode', 'select'); edit('shapeObject', copy.id);
    assert.equal(el('shapeDuplicate').disabled, false);
  });

  await test('Reset perspective restores the unwarped shape with a reversible history entry', async () => {
    await perspectiveRect(); const straight = digest(); drag([[20, 20], [44, 32]]);
    const warped = digest(), history = state().history;
    el('shapeResetPerspective').click(); app.render();
    assert.equal(state().history, history + 1);
    assert.equal(hash(pixels(active().canvas)), straight.pixels);
    assert.ok(!latest().shape.quad, 'Reset removes the optional projective quadrilateral');
    app.undo(); assert.deepEqual(digest(), warped);
  });

  await test('Perspective expansion keeps later brush strokes above the shape in newly occupied tiles', async () => {
    await fresh(); insert([[20, 20], [80, 70]]);
    tool('brush'); edit('brushKind', 'binary'); edit('brushSize', 6); edit('stabilizer', 0); edit('inkColor', '#2040e0'); edit('brushOpacity', 100);
    drag([[10, 50], [150, 50]]);
    selectAt(40, 32); edit('shapeTransform', 'perspective');
    drag([[80, 20], [132, 12]]); drag([[80, 70], [128, 100]]);
    assert.deepEqual(pixel(active().canvas, 100, 50), [32, 64, 224, 255], 'The later brush line survives shape expansion across a tile boundary');
    assert.deepEqual(pixel(active().canvas, 100, 40), [224, 32, 32, 255], 'The perspective shape actually occupies the expanded area');
  });

  await test('Changing color after scaling a layer preserves local stroke and material dimensions', async () => {
    await fresh(); check('shapeStroke', true); edit('shapeStrokeWidth', 40); edit('shapeStrokeColor', '#e02020');
    edit('materialKind', 'horizontal'); edit('materialSpacing', 50); edit('materialThickness', 12); check('materialTransparent', true);
    const original = insert([[24, 24], [120, 100]]);
    const before = plain(original.shape); edit('layerScale', 300);
    edit('shapeObject', original.id); edit('inkColor', '#2040e0'); edit('shapeStrokeColor', '#2040e0');
    el('shapeApplyStyle').click(); app.render(); const after = latest().shape;
    assert.equal(after.strokeWidth, before.strokeWidth, 'A clamped screen control does not shrink the stored local outline');
    assert.equal(after.fill.spacing, before.fill.spacing, 'Changing color does not alter the local pattern pitch');
    assert.equal(after.fill.thickness, before.fill.thickness, 'Changing color does not alter the local pattern thickness');
    assert.notEqual(after.stroke, before.stroke); assert.notEqual(after.fill.foreground, before.fill.foreground);
  });

  await test('A 40% full-canvas frame remains 40% when only its color is changed', async () => {
    await fresh(); edit('shapeKind', 'frameGallery'); edit('frameWidth', 12);
    edit('frameColor', '#354953'); edit('frameAccent', '#d4b583'); edit('brushOpacity', 40);
    el('applyCanvasFrame').click(); app.render();
    assert.equal(state().layers.length, 2); assert.equal(shapes().length, 1, 'The full-canvas shortcut also retains an editable shape');
    const before = pixel(el('drawingCanvas'), 2, 64)[3], effectiveOpacity = latest().opacity * active().opacity;
    near(effectiveOpacity, .4, 'Original frame opacity'); assert.ok(Math.abs(before - 102) <= 1);
    edit('frameColor', '#e02020'); el('shapeApplyStyle').click(); app.render();
    near(latest().opacity * active().opacity, .4, 'Recolored frame opacity');
    assert.ok(Math.abs(pixel(el('drawingCanvas'), 2, 64)[3] - before) <= 1, 'Recoloring does not multiply 40% by 40%');
    const project = await app.serializeProject(); await app.loadProject(project); app.render();
    assert.ok(Math.abs(pixel(el('drawingCanvas'), 2, 64)[3] - before) <= 1);
  });

  await test('Six-color sugar shapes restore their own settings and survive outline edits, perspective, copies and project reopening', async () => {
    await fresh({ width: 256, height: 192 });
    const colors = ['#e02020', '#20a050', '#2040e0', '#e5a020', '#8625c5', '#27b9c5'];
    edit('materialKind', 'sprinkles'); check('materialFollowInk', false); edit('materialForeground', colors[0]);
    edit('materialColorCount', 6); colors.slice(1).forEach((color, index) => edit('materialColor' + (index + 2), color));
    check('materialTransparent', true); edit('materialSpacing', 18); edit('materialThickness', 6);
    check('materialNatural', true); edit('materialVariationSize', 58); edit('materialVariationShape', 37);
    check('shapeStroke', true); edit('shapeStrokeWidth', 2); edit('shapeStrokeColor', '#364352');
    const original = insert([[24, 24], [224, 168]]), fill = plain(original.shape.fill);
    assert.deepEqual(fill.colors, colors); near(fill.variationSize, .58, 'Recorded size variation'); near(fill.variationShape, .37, 'Recorded shape variation');
    const rgba = pixels(active().canvas), seen = new Set();
    for (let i = 0; i < rgba.length; i += 4) if (rgba[i + 3] === 255) {
      const hex = '#' + Array.from(rgba.slice(i, i + 3), value => value.toString(16).padStart(2, '0')).join('');
      if (colors.includes(hex)) seen.add(hex);
    }
    assert.equal(seen.size, 6, 'All six colors are present in actual sugar-shape pixels');
    const interior = () => hash(Buffer.from(active().canvas.getContext('2d').getImageData(40, 40, 168, 112).data));
    const originalInterior = interior();

    // A different pending palette must not leak into an older shape when it is
    // reselected. Reading the same settings without this detour misses the bug.
    edit('materialColorCount', 1); edit('materialColor2', '#000000');
    check('materialNatural', false); edit('materialVariationSize', 0); edit('materialVariationShape', 0);
    edit('shapeObject', original.id);
    assert.equal(el('materialColorCount').value, '6'); assert.equal(el('materialNatural').checked, true);
    assert.equal(el('materialVariationSize').value, '58'); assert.equal(el('materialVariationShape').value, '37');
    colors.slice(1).forEach((color, index) => assert.equal(el('materialColor' + (index + 2)).value, color));
    edit('shapeStrokeColor', '#172b55'); el('shapeApplyStyle').click(); app.render();
    assert.deepEqual(plain(latest().shape.fill), fill, 'Changing only the outline preserves the complete original palette and variation');
    assert.equal(interior(), originalInterior, 'The unchanged sugar fill remains pixel-identical inside the outline');

    edit('shapeTransform', 'perspective'); drag([[24, 24], [60, 44]]);
    assert.ok(latest().shape.quad); assert.deepEqual(plain(latest().shape.fill), fill);
    assert.equal(pixel(active().canvas, 26, 26)[3], 0, 'Perspective is actually applied to the sugar shape');
    el('shapeDuplicate').click(); app.render();
    const copy = latest(); assert.notEqual(copy.id, original.id);
    assert.deepEqual(plain(copy.shape.fill), fill); assert.notEqual(copy.shape.fill.colors, shapes()[0].shape.fill.colors);
    const before = digest(), project = await app.serializeProject(); await app.loadProject(project); app.render();
    assert.deepEqual(digest(), before, 'Portable reopening preserves both colored perspective shapes and exact pixels');
    edit('materialColorCount', 1); check('materialNatural', false); edit('shapeMode', 'select'); edit('shapeObject', copy.id);
    assert.equal(el('materialColorCount').value, '6'); assert.equal(el('materialNatural').checked, true);
    assert.equal(el('materialVariationSize').value, '58'); assert.equal(el('materialVariationShape').value, '37');
    edit('shapeStrokeColor', '#6a2048'); el('shapeApplyStyle').click(); app.render();
    assert.deepEqual(plain(latest().shape.fill), fill, 'A later edit after reopening still preserves all six colors');
    assert.deepEqual(plain(shapes()[0].shape.fill), fill, 'Editing the copy never mutates the original palette');
  });

  assert.deepEqual(errors, [], 'No runtime script errors');
  console.log(`Line guide / perspective integration: ${passed}/${passed} passed.`);
}
main().then(() => live.forEach(dom => dom.window.close())).catch(error => {
  console.error(error); live.forEach(dom => dom.window.close()); process.exitCode = 1;
});
