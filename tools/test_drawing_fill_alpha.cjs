/* Real Canvas regressions for translucent colour and transparent fill.
 * Development-only dependencies; no browser, device or runtime bundle is added.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules node tools/test_drawing_fill_alpha.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const source = fs.readFileSync(harnessFile, 'utf8');
const boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0);
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixel, pixels, hash, decoded };', harnessFile);
const { openStudio, errors, pixel, pixels, hash, decoded } = harness.exports;
let dom, passed = 0;
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
const near = (actual, expected, tolerance = 1) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is near ${expected}`);

async function main() {
  dom = await openStudio();
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const value = doc.getElementById(id); assert.ok(value, id); return value; };
  const state = () => app.inspect(), active = () => app.getLayer(state().activeId);
  const tool = name => doc.querySelector('[data-tool="' + name + '"]').click();
  function edit(id, value) {
    const field = el(id);
    if (field.type === 'checkbox') field.checked = value;
    else field.value = String(value);
    field.dispatchEvent(new win.Event('input', { bubbles: true }));
    field.dispatchEvent(new win.Event('change', { bubbles: true }));
  }
  function pointer(type, x, y) {
    const drawing = el('drawingCanvas'), rect = drawing.getBoundingClientRect();
    drawing.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true,
      pointerId: 73, pointerType: 'mouse', isPrimary: true, button: 0,
      buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
      pressure: type === 'pointerup' ? 0 : .5,
      clientX: rect.left + x / drawing.width * rect.width,
      clientY: rect.top + y / drawing.height * rect.height }));
  }
  const triangle = [[16, 16], [108, 16], [16, 82]];
  function drag(points = triangle, release = true) {
    pointer('pointerdown', ...points[0]);
    points.slice(1).forEach(p => pointer('pointermove', ...p));
    if (release) pointer('pointerup', ...points[points.length - 1]);
    app.render();
  }
  function fill(scope) {
    edit('fillScope', scope);
    if (scope === 'lasso') drag();
    else { pointer('pointerdown', 40, 40); pointer('pointerup', 40, 40); app.render(); }
  }
  function paint(layer, color, x = 0, y = 0, width = 128, height = 96) {
    const ctx = layer.canvas.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(x, y, width, height);
  }
  async function fresh() {
    await app.newDocument({ width: 128, height: 96, title: '透明填充回归', paper: 'transparent' });
    tool('fill');
    for (const [id, value] of Object.entries({ fillPaintMode: 'color', fillOpacity: 100,
      fillScope: 'match', fillSample: 'current', fillExpand: 0, closeGap: 0,
      contiguous: true, tolerance: 0, materialKind: 'solid', materialFollowInk: true,
      materialTransparent: false, inkColor: '#e02020' })) edit(id, value);
  }

  await test('Colour opacity is explicit, synchronized and paints real alpha on an empty layer', async () => {
    await fresh();
    assert.equal(el('fillOpacity').min, '0'); assert.equal(el('fillOpacity').max, '100');
    edit('fillOpacity', 50); near(Number(el('brushOpacity').value), 50, 0);
    const history = state().history; fill('match');
    const p = pixel(active().canvas, 40, 40);
    near(p[0], 224); near(p[1], 32); near(p[2], 32); near(p[3], 128);
    assert.equal(state().history, history + 1);
    app.undo(); assert.equal(pixel(active().canvas, 40, 40)[3], 0);
    app.redo(); near(pixel(active().canvas, 40, 40)[3], 128);
    edit('brushOpacity', 35); assert.equal(el('fillOpacity').value, '35');
    const raster = (await decoded(await app.exportRaster('png', true))).canvas;
    near(pixel(raster, 40, 40)[3], 128);
  });

  await test('Translucent colour over an opaque base mixes colour without making an accidental hole', async () => {
    await fresh(); paint(active(), '#0000ff'); edit('fillOpacity', 50); fill('match');
    const p = pixel(active().canvas, 40, 40), amount = Math.round(.5 * 255) / 255;
    near(p[0], 224 * amount); near(p[1], 32 * amount);
    near(p[2], 32 * amount + 255 * (1 - amount));
    assert.equal(p[3], 255, 'source-over preserves the opaque base alpha');
  });

  await test('Transparent match fill closes a line-art gap but only erases the current layer', async () => {
    await fresh(); paint(active(), '#e02020'); const colourId = active().id;
    app.addLayer(); const lines = active();
    paint(lines, '#000000', 20, 16, 72, 1); paint(lines, '#000000', 20, 75, 72, 1);
    paint(lines, '#000000', 20, 16, 1, 60); paint(lines, '#000000', 91, 16, 1, 60);
    lines.canvas.getContext('2d').clearRect(50, 16, 3, 1);
    const lineHash = hash(pixels(lines.canvas)); app.selectLayer(colourId);
    edit('fillPaintMode', 'transparent'); edit('fillOpacity', 50);
    edit('fillSample', 'visible'); edit('closeGap', 3);
    const before = hash(pixels(active().canvas)), history = state().history;
    fill('match'); near(pixel(active().canvas, 40, 40)[3], 128);
    assert.equal(pixel(active().canvas, 4, 4)[3], 255, 'The exterior is not erased through the gap');
    assert.equal(hash(pixels(lines.canvas)), lineHash, 'Independent line art is immutable');
    assert.equal(state().history, history + 1);
    const after = hash(pixels(active().canvas));
    app.undo(); assert.equal(hash(pixels(active().canvas)), before);
    app.redo(); assert.equal(hash(pixels(active().canvas)), after);
  });

  await test('Full-strength lasso makes a hole, half strength erases once, and cancellation is harmless', async () => {
    await fresh(); paint(active(), '#0000ff'); const lower = active(), lowerHash = hash(pixels(lower.canvas));
    app.addLayer(); paint(active(), '#e02020');
    const upperId = active().id, before = hash(pixels(active().canvas)), history = state().history;
    edit('fillPaintMode', 'transparent'); fill('lasso');
    assert.equal(pixel(active().canvas, 28, 28)[3], 0);
    assert.equal(pixel(active().canvas, 110, 80)[3], 255);
    assert.deepEqual(pixel(el('drawingCanvas'), 28, 28), [0, 0, 255, 255], 'Lower layer shows through');
    assert.equal(hash(pixels(lower.canvas)), lowerHash); assert.equal(state().history, history + 1);
    app.undo(); assert.equal(state().activeId, upperId); assert.equal(hash(pixels(active().canvas)), before);
    edit('fillOpacity', 50); fill('lasso'); near(pixel(active().canvas, 28, 28)[3], 128);
    const half = hash(pixels(active().canvas)), halfHistory = state().history;
    drag(triangle, false); pointer('pointercancel', 16, 82); app.render();
    assert.equal(hash(pixels(active().canvas)), half); assert.equal(state().history, halfHistory);
  });

  await test('Inked and whole-layer transparency do not square the original alpha', async () => {
    for (const scope of ['inked', 'layer']) {
      await fresh(); paint(active(), 'rgba(224,32,32,0.5)', 12, 12, 96, 72);
      edit('fillPaintMode', 'transparent'); edit('fillOpacity', 50);
      const originalAlpha = pixel(active().canvas, 40, 40)[3], history = state().history;
      fill(scope); near(pixel(active().canvas, 40, 40)[3], originalAlpha / 2);
      assert.equal(pixel(active().canvas, 3, 3)[3], 0); assert.equal(state().history, history + 1);
      app.undo(); near(pixel(active().canvas, 40, 40)[3], originalAlpha, 0);
    }
  });

  await test('Zero strength and empty-layer transparent fill make no history in all four scopes', async () => {
    for (const scope of ['match', 'lasso', 'inked', 'layer']) {
      await fresh(); paint(active(), '#e02020'); edit('fillOpacity', 0);
      const before = hash(pixels(active().canvas)), history = state().history;
      for (const mode of ['color', 'transparent']) {
        edit('fillPaintMode', mode); fill(scope);
        assert.equal(hash(pixels(active().canvas)), before); assert.equal(state().history, history);
      }
      await fresh(); edit('fillPaintMode', 'transparent'); const emptyHistory = state().history;
      fill(scope); assert.equal(state().history, emptyHistory); assert.equal(pixel(active().canvas, 40, 40)[3], 0);
    }
  });

  await test('Gradients and pattern transparency act as cutout masks and survive project reopening', async () => {
    await fresh(); paint(active(), '#e02020');
    edit('fillPaintMode', 'transparent'); edit('materialKind', 'radial'); edit('materialTransparent', true);
    fill('layer');
    const center = pixel(active().canvas, 64, 48)[3], middle = pixel(active().canvas, 96, 48)[3], corner = pixel(active().canvas, 1, 1)[3];
    assert.ok(center < 10 && middle > center && corner > middle, 'A central hole fades into the original edge');
    const savedHash = hash(pixels(active().canvas));
    const project = await app.serializeProject(); await app.loadProject(project); app.render();
    assert.equal(hash(pixels(active().canvas)), savedHash);
    const raster = (await decoded(await app.exportRaster('png', true))).canvas;
    assert.equal(pixel(raster, 64, 48)[3], center);
    await fresh(); paint(active(), '#e02020'); edit('fillPaintMode', 'transparent');
    edit('materialKind', 'horizontal'); edit('materialTransparent', true);
    // A broad line has an opaque interior even after pattern antialiasing;
    // narrow three-pixel samples may contain only partially covered pixels.
    edit('materialSpacing', 12); edit('materialThickness', 6); fill('layer');
    const alphas = Array.from({ length: 36 }, (_, y) => pixel(active().canvas, 40, 20 + y)[3]);
    assert.ok(alphas.some(a => a === 0), 'Pattern lines make holes');
    assert.ok(alphas.some(a => a === 255), 'Transparent pattern spaces leave existing pixels intact');
  });

  await test('Gradient alpha and eraser strength each multiply a translucent destination exactly once', async () => {
    await fresh(); paint(active(), 'rgba(224,32,32,0.5)');
    const originalAlpha = pixel(active().canvas, 64, 48)[3];
    edit('fillPaintMode', 'transparent'); edit('fillOpacity', 50);
    edit('materialKind', 'radial'); edit('materialTransparent', true); fill('layer');
    const radius = Math.hypot(128 / 2, 96 / 2);
    for (const [x, y] of [[64, 48], [96, 48], [1, 1]]) {
      const distance = Math.hypot(x + .5 - 64, y + .5 - 48);
      const maskAlpha = Math.max(0, 1 - distance / radius);
      const expected = originalAlpha * (1 - .5 * maskAlpha);
      near(pixel(active().canvas, x, y)[3], expected, 2);
    }
  });

  await test('Palette shortcut returns to colour fill without losing lasso scope or gradient edge', async () => {
    await fresh(); edit('fillScope', 'lasso'); edit('fillPaintMode', 'transparent');
    edit('materialKind', 'radial'); edit('materialBackground', '#2846ab'); edit('materialFollowInk', false);
    el('fillPalette').click();
    const swatch = doc.querySelector('#paletteLibrary [data-color]'); assert.ok(swatch);
    const color = swatch.dataset.color; swatch.click();
    assert.equal(state().tool, 'fill'); assert.equal(el('fillScope').value, 'lasso');
    assert.equal(el('fillPaintMode').value, 'color'); assert.equal(el('materialFollowInk').checked, true);
    assert.equal(el('inkColor').value, color.toLowerCase()); assert.equal(el('materialBackground').value, '#2846ab');
    assert.equal(el('materialKind').value, 'radial');
    drag(); assert.ok(pixel(active().canvas, 28, 28)[3] > 0, 'Selected swatch actually paints rather than erases');
  });

  assert.deepEqual(errors, [], 'No runtime script errors');
  console.log(`Transparent fill integration: ${passed}/${passed} passed.`);
}
main().then(() => dom?.window.close()).catch(error => {
  console.error(error); dom?.window.close(); process.exitCode = 1;
});
