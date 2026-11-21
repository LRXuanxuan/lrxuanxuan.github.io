/* Focused center-gradient regressions: deployed app/DOM with real Canvas pixels.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules node tools/test_drawing_gradients.cjs
 * This does not start a browser/device or run the unrelated application suite.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const source = fs.readFileSync(harnessFile, 'utf8');
const boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'Integration harness has an explicit suite boundary');
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixel, pixels, hash };', harnessFile);
const { openStudio, errors, pixel, pixels, hash } = harness.exports;
let passed = 0, dom;
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }

async function main() {
  dom = await openStudio();
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const value = doc.getElementById(id); assert.ok(value, id); return value; };
  const active = () => app.getLayer(app.inspect().activeId);
  const tool = name => doc.querySelector('[data-tool="' + name + '"]').click();
  function edit(id, value) {
    const field = el(id);
    if (field.type === 'checkbox') field.checked = value;
    else field.value = String(value);
    field.dispatchEvent(new win.Event('input', { bubbles: true }));
    field.dispatchEvent(new win.Event('change', { bubbles: true }));
  }
  function pointer(type, x, y) {
    const canvas = el('drawingCanvas'), rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true,
      pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0,
      buttons: type === 'pointerup' ? 0 : 1, pressure: type === 'pointerup' ? 0 : .5,
      clientX: rect.left + x / canvas.width * rect.width,
      clientY: rect.top + y / canvas.height * rect.height }));
  }
  function gesture(points) {
    pointer('pointerdown', ...points[0]); points.slice(1).forEach(point => pointer('pointermove', ...point));
    pointer('pointerup', ...points[points.length - 1]); app.render();
  }
  async function fresh() {
    await app.newDocument({ width: 128, height: 96, title: '中心渐变回归', paper: 'transparent' });
    for (const [id, value] of Object.entries({ shapeKind: 'rect', shapeFill: true, shapeStroke: false,
      shapeConstrain: false, materialKind: 'radial', materialFollowInk: false,
      materialForeground: '#ff0000', materialBackground: '#0000ff', materialTransparent: false,
      materialAngle: 73, brushOpacity: 100, fillScope: 'match', fillSample: 'current',
      fillExpand: 0, contiguous: true, tolerance: 0 })) edit(id, value);
    tool('shape');
  }
  function radialLabels() {
    assert.equal(el('materialKind').value, 'radial');
    assert.equal(el('materialKind').selectedOptions[0].textContent, '中心渐变');
    assert.equal(el('materialName').textContent, '中心渐变');
    assert.equal(el('materialFrontLabel').textContent, '中心颜色');
    assert.equal(el('materialBackLabel').textContent, '边缘颜色');
    assert.match(el('materialForeground').getAttribute('aria-label'), /中心/);
    assert.match(el('materialBackground').getAttribute('aria-label'), /边缘/);
    assert.equal(el('materialTransparentText').textContent, '边缘透明');
    assert.match(el('materialTransparent').getAttribute('aria-label'), /边缘透明/);
    assert.equal(el('materialBackFromInk').textContent, '用当前颜色作边缘');
    assert.equal(el('materialAngleField').hidden, true);
    assert.equal(el('materialPatternOptions').hidden, true);
  }

  await test('Center labels, native color controls and edge-color action switch cleanly back to linear', async () => {
    await fresh(); radialLabels();
    const foreground = el('materialForeground').value;
    app.setInk('#29a663'); el('materialBackFromInk').click();
    assert.equal(el('materialBackground').value, '#29a663');
    assert.equal(el('materialForeground').value, foreground, 'Choosing the edge color leaves the center independent');
    edit('materialKind', 'linear');
    assert.equal(el('materialFrontLabel').textContent, '起始颜色');
    assert.equal(el('materialBackLabel').textContent, '末尾颜色');
    assert.equal(el('materialTransparentText').textContent, '背景透明');
    assert.equal(el('materialBackFromInk').textContent, '用当前颜色作背景');
    assert.equal(el('materialAngleField').hidden, false);
    assert.equal(el('materialAngle').value, '73', 'Hiding direction did not overwrite the saved linear angle');
    assert.doesNotMatch(el('materialForeground').getAttribute('aria-label'), /中心/);
    assert.doesNotMatch(el('materialBackground').getAttribute('aria-label'), /边缘/);
    assert.doesNotMatch(el('materialTransparent').getAttribute('aria-label'), /边缘/);
  });

  await test('Actual shape pixels progress from center to outer color, then fade toward the farthest corners', async () => {
    await fresh(); gesture([[12, 12], [116, 84]]);
    let canvas = active().canvas;
    const center = pixel(canvas, 64, 48), middle = pixel(canvas, 40, 48), side = pixel(canvas, 16, 48), corner = pixel(canvas, 13, 13);
    assert.ok(center[0] > 240 && center[2] < 15); assert.ok(corner[2] > 230 && corner[0] < 25);
    assert.ok(center[0] > middle[0] && middle[0] > side[0]);
    assert.ok(center[2] < middle[2] && middle[2] < side[2]);
    for (const point of [center, middle, side, corner]) assert.equal(point[3], 255);
    assert.deepEqual(pixel(canvas, 91, 48), pixel(canvas, 64, 75), 'Equal distances use equal colors in both axes');
    assert.equal(pixel(canvas, 11, 48)[3], 0); assert.equal(pixel(canvas, 117, 48)[3], 0);
    app.undo(); edit('materialTransparent', true); gesture([[12, 12], [116, 84]]);
    canvas = active().canvas;
    const faded = [[64, 48], [40, 48], [16, 48], [13, 13]].map(([x, y]) => pixel(canvas, x, y));
    assert.ok(faded[0][3] > 245 && faded[3][3] < 20);
    for (let i = 1; i < faded.length; i++) assert.ok(faded[i - 1][3] > faded[i][3], 'Alpha decreases with radius');
    for (const point of faded) { assert.ok(point[0] > 245); assert.equal(point[2], 0, 'Transparent edge does not introduce the unused blue endpoint'); }
  });

  await test('Center gradients stay inside ellipse and bucket masks, leaving closed holes and linework untouched', async () => {
    await fresh(); edit('shapeKind', 'ellipse'); gesture([[12, 12], [116, 84]]);
    let canvas = active().canvas, bytes = pixels(canvas);
    assert.equal(pixel(canvas, 64, 48)[3], 255);
    for (let y = 0; y < 96; y++) for (let x = 0; x < 128; x++) {
      const distance = ((x + .5 - 64) / 52) ** 2 + ((y + .5 - 48) / 36) ** 2;
      if (distance > 1.06) assert.equal(bytes[(y * 128 + x) * 4 + 3], 0, 'No color escapes the ellipse');
    }
    await fresh(); const lineId = active().id, ctx = active().canvas.getContext('2d');
    ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeRect(18, 14, 94, 68); ctx.strokeRect(48, 34, 26, 28);
    const linework = hash(pixels(active().canvas)); app.addLayer(); const fillId = active().id; el('layerDown').click();
    edit('fillSample', 'visible'); tool('fill'); gesture([[31, 26]]);
    canvas = app.getLayer(fillId).canvas; bytes = pixels(canvas);
    assert.ok(pixel(canvas, 31, 26)[3] > 0); assert.ok(pixel(canvas, 92, 70)[3] > 0);
    for (let y = 0; y < 96; y++) for (let x = 0; x < 128; x++) {
      if (x < 18 || x >= 112 || y < 14 || y >= 82 || (x > 50 && x < 72 && y > 36 && y < 60)) {
        assert.equal(bytes[(y * 128 + x) * 4 + 3], 0, 'Bucket material must honor the region mask and inner hole');
      }
    }
    assert.equal(hash(pixels(app.getLayer(lineId).canvas)), linework);
  });

  await test('Legacy radial project identity and colors survive loading and another portable save', async () => {
    await fresh(); edit('materialTransparent', true); gesture([[12, 12], [116, 84]]);
    const original = hash(pixels(active().canvas)), oldProject = JSON.parse(await app.exportProject());
    assert.equal(oldProject.version, 1); assert.equal(oldProject.settings.marks.materialKind, 'radial');
    // All these persisted fields existed before the display-name change.
    const legacyMarks = oldProject.settings.marks;
    edit('materialKind', 'linear'); edit('materialForeground', '#00ff00');
    await app.loadProject(oldProject); radialLabels();
    assert.equal(hash(pixels(active().canvas)), original);
    const saved = JSON.parse(await app.exportProject());
    assert.equal(saved.settings.marks.materialKind, 'radial');
    assert.deepEqual(saved.settings.marks, legacyMarks);
    assert.equal(el('materialForeground').value, '#ff0000'); assert.equal(el('materialBackground').value, '#0000ff');
    assert.equal(el('materialTransparent').checked, true);
  });

  assert.deepEqual(errors, [], 'No page/resource errors during focused gradient regressions');
  console.log('\n' + passed + ' center-gradient regressions passed (DOM/native Canvas; not browser or device validation).');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
