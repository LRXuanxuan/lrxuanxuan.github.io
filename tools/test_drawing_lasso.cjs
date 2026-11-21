/* Development-only real Canvas/DOM checks for lasso fill and Close Gap wiring.
 * No browser or hardware is started; these dependencies never ship with the app.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules node tools/test_drawing_lasso.cjs
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
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixel, pixels, hash };', harnessFile);
const { openStudio, errors, pixel, pixels, hash } = harness.exports;
let passed = 0;
const live = [];
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }

async function main() {
  const dom = await openStudio(); live.push(dom);
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const value = doc.getElementById(id); assert.ok(value, id); return value; };
  const state = () => app.inspect();
  const active = () => app.getLayer(state().activeId);
  const tool = name => doc.querySelector('[data-tool="' + name + '"]').click();
  const edit = (id, value) => {
    el(id).value = String(value);
    el(id).dispatchEvent(new win.Event('input', { bubbles: true }));
    el(id).dispatchEvent(new win.Event('change', { bubbles: true }));
  };
  const check = (id, checked) => {
    el(id).checked = checked; el(id).dispatchEvent(new win.Event('change', { bubbles: true }));
  };
  function pointer(type, x, y, extra = {}) {
    const drawing = el('drawingCanvas'), rect = drawing.getBoundingClientRect();
    drawing.dispatchEvent(new win.PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 41, pointerType: 'mouse', isPrimary: true,
      button: 0, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
      pressure: type === 'pointerup' ? 0 : .5,
      clientX: rect.left + x / drawing.width * rect.width,
      clientY: rect.top + y / drawing.height * rect.height, ...extra
    }));
  }
  function drag(points, release = true) {
    pointer('pointerdown', ...points[0]);
    points.slice(1).forEach(point => pointer('pointermove', ...point));
    if (release) pointer('pointerup', ...points[points.length - 1]);
    app.render();
  }
  async function fresh() {
    await app.newDocument({ width: 128, height: 96, title: '套索填充回归', paper: 'transparent' });
    tool('fill'); edit('fillScope', 'lasso'); edit('brushOpacity', 100);
    edit('inkColor', '#e02020'); edit('materialKind', 'solid'); check('materialFollowInk', true);
    check('materialTransparent', false); check('contiguous', true); edit('fillExpand', 0);
  }
  const triangle = [[16, 16], [104, 16], [16, 80]];

  await test('Lasso is a fill-scope option, previews a polygon, and commits one undoable fill on release', async () => {
    await fresh();
    assert.ok(Array.from(el('fillScope').options).some(o => o.value === 'lasso' && /套索/.test(o.textContent)));
    assert.equal(doc.querySelectorAll('[data-tool="lasso"]').length, 0, 'No extra toolbar tool is added');
    assert.equal(el('matchControls').hidden, true);
    const before = hash(pixels(active().canvas)), history = state().history;
    drag(triangle, false);
    assert.equal(state().drawing, true);
    assert.equal(hash(pixels(active().canvas)), before, 'Preview must not change layer pixels');
    assert.ok(pixel(el('drawingCanvas'), 28, 28)[3] > 0, 'The pending polygon is visible');
    pointer('pointerup', ...triangle[2]); app.render();
    assert.equal(state().drawing, false); assert.equal(state().history, history + 1);
    assert.deepEqual(pixel(active().canvas, 28, 28), [224, 32, 32, 255]);
    assert.equal(pixel(active().canvas, 100, 75)[3], 0, 'Bounding-box exterior is not filled');
    assert.equal(pixel(active().canvas, 4, 4)[3], 0);
    const result = hash(pixels(active().canvas));
    app.undo(); assert.equal(hash(pixels(active().canvas)), before);
    app.redo(); assert.equal(hash(pixels(active().canvas)), result);
  });

  await test('Concave and even-odd loops preserve their notches and holes', async () => {
    await fresh();
    drag([[12, 12], [110, 12], [110, 34], [42, 34], [42, 82], [12, 82]]);
    assert.ok(pixel(active().canvas, 24, 60)[3] > 0);
    assert.equal(pixel(active().canvas, 82, 60)[3], 0, 'Concave notch stays empty');
    await fresh();
    drag([[12, 12], [112, 12], [112, 84], [12, 84], [12, 12],
      [42, 34], [82, 34], [82, 64], [42, 64], [42, 34], [12, 12]]);
    assert.ok(pixel(active().canvas, 96, 48)[3] > 0);
    assert.equal(pixel(active().canvas, 62, 48)[3], 0, 'Nested lasso loop remains an even-odd hole');
  });

  await test('Layer transforms and opacity apply once, without changing another layer', async () => {
    await fresh(); const lower = active();
    lower.canvas.getContext('2d').fillStyle = '#0000ff'; lower.canvas.getContext('2d').fillRect(0, 0, 128, 96);
    const lowerPixels = hash(pixels(lower.canvas)); app.addLayer();
    const layer = active(); layer.x = 10; layer.y = 8; layer.scale = 2;
    edit('layerOpacity', 60); edit('brushOpacity', 50);
    drag([[30, 28], [90, 28], [30, 76]]);
    const center = pixel(layer.canvas, 15, 15);
    // Canvas stores premultiplied channels; reading a half-transparent pixel
    // can round its straight RGB by one byte without changing the opacity.
    [224, 32, 32].forEach((value, channel) => assert.ok(Math.abs(center[channel] - value) <= 1));
    assert.ok(Math.abs(center[3] - 128) <= 1, 'Tool opacity is applied exactly once');
    assert.equal(pixel(layer.canvas, 42, 30)[3], 0, 'Points are interpreted in transformed layer coordinates');
    assert.equal(layer.opacity, .6); assert.equal(layer.scale, 2); assert.equal(layer.x, 10); assert.equal(layer.y, 8);
    assert.equal(hash(pixels(lower.canvas)), lowerPixels, 'Other layers remain byte-identical');
  });

  await test('Center gradient and patterned materials stay inside the lasso', async () => {
    await fresh(); check('materialFollowInk', false);
    edit('materialForeground', '#ff0000'); edit('materialBackground', '#0000ff'); edit('materialKind', 'radial');
    drag([[16, 12], [112, 12], [112, 84], [16, 84]]);
    const center = pixel(active().canvas, 64, 48), corner = pixel(active().canvas, 18, 14);
    assert.ok(center[0] > corner[0] + 100); assert.ok(corner[2] > center[2] + 100);
    assert.equal(pixel(active().canvas, 4, 4)[3], 0);
    await fresh(); edit('materialKind', 'horizontal'); edit('materialSpacing', 12); edit('materialThickness', 2);
    check('materialTransparent', true); drag(triangle);
    const alphas = [];
    for (let y = 22; y < 50; y++) alphas.push(pixel(active().canvas, 26, y)[3]);
    assert.ok(alphas.some(a => a === 0) && alphas.some(a => a > 0), 'Patterned lasso has real transparent spacing');
    assert.equal(pixel(active().canvas, 100, 75)[3], 0);
  });

  await test('Esc, cancellation, lost capture, blur and tool changes discard the preview', async () => {
    const cancel = [
      () => doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
      () => pointer('pointercancel', 16, 80),
      () => pointer('lostpointercapture', 16, 80),
      () => win.dispatchEvent(new win.Event('blur')),
      () => tool('brush')
    ];
    for (const action of cancel) {
      await fresh(); const before = hash(pixels(active().canvas)), history = state().history;
      drag(triangle, false); action(); app.render();
      assert.equal(state().drawing, false); assert.equal(state().history, history);
      assert.equal(hash(pixels(active().canvas)), before);
      assert.equal(pixel(el('drawingCanvas'), 28, 28)[3], 0, 'Cancelled preview is cleared from the display');
    }
    await fresh(); const history = state().history;
    drag([[40, 40]]); assert.equal(state().history, history, 'A tap cannot fill a polygon');
    drag([[20, 20], [80, 20]]); assert.equal(state().history, history, 'A line cannot fill a polygon');
  });

  await test('Hidden or locked layers reject lasso; committed pixels survive project reopening', async () => {
    await fresh(); const layer = active(), history = state().history;
    layer.locked = true; drag(triangle); assert.equal(state().history, history); assert.equal(state().drawing, false);
    layer.locked = false; layer.visible = false; drag(triangle);
    assert.equal(state().history, history); assert.equal(hash(pixels(layer.canvas)), hash(new Uint8ClampedArray(128 * 96 * 4)));
    layer.visible = true; drag(triangle);
    const result = hash(pixels(layer.canvas));
    const saved = await app.serializeProject(); await app.loadProject(saved); app.render();
    assert.equal(hash(pixels(active().canvas)), result);
  });

  if (!process.env.LIGHTDRAW_TEST_LASSO_ONLY) await test('Close Gap controls are scoped, bounded, and drive both solid and material fill masks', async () => {
    await fresh(); assert.equal(el('closeGapField').hidden, true);
    edit('fillScope', 'match'); assert.equal(el('closeGapField').hidden, false);
    assert.equal(el('closeGap').value, '0'); edit('closeGapNumber', 99); assert.equal(el('closeGap').value, '32');
    edit('closeGapNumber', -3); assert.equal(el('closeGap').value, '0');
    edit('closeGap', 6); assert.equal(el('closeGapNumber').value, '6');
    check('contiguous', false); assert.equal(el('closeGapField').hidden, true);
    check('contiguous', true); tool('cutout'); assert.equal(el('closeGapField').hidden, true);
    tool('fill'); edit('fillScope', 'match');
    const lines = active(), ctx = lines.canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(16, 16, 96, 1); ctx.fillRect(16, 80, 96, 1);
    ctx.fillRect(16, 16, 1, 65); ctx.fillRect(111, 16, 1, 65); ctx.clearRect(60, 16, 6, 1);
    const lineHash = hash(pixels(lines.canvas)); app.addLayer(); el('layerDown').click();
    edit('fillSample', 'visible'); edit('tolerance', 0); edit('closeGap', 0);
    pointer('pointerdown', 40, 40); pointer('pointerup', 40, 40);
    assert.ok(pixel(active().canvas, 2, 2)[3] > 0, 'Zero retains the original open-boundary fill'); app.undo();
    edit('closeGap', 6);
    pointer('pointerdown', 40, 40); pointer('pointerup', 40, 40);
    assert.ok(pixel(active().canvas, 40, 40)[3] > 0); assert.equal(pixel(active().canvas, 2, 2)[3], 0);
    assert.equal(hash(pixels(lines.canvas)), lineHash); app.undo();
    edit('materialKind', 'radial'); check('materialFollowInk', false);
    edit('materialForeground', '#ff0000'); edit('materialBackground', '#0000ff');
    pointer('pointerdown', 40, 40); pointer('pointerup', 40, 40);
    assert.ok(pixel(active().canvas, 40, 40)[3] > 0); assert.equal(pixel(active().canvas, 2, 2)[3], 0);
    assert.equal(hash(pixels(lines.canvas)), lineHash, 'Gap detection never writes onto the line-art layer');
  });

  assert.deepEqual(errors, [], 'No runtime script errors');
  console.log(`Lasso/Close Gap app integration: ${passed}/${passed} passed.`);
}
main().then(() => live.forEach(dom => dom.window.close())).catch(error => {
  console.error(error); live.forEach(dom => dom.window.close()); process.exitCode = 1;
});
