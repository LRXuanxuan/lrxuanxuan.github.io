/* Development-only Canvas/DOM regression for per-brush texture controls.
 * Uses the existing local drawing harness; no browser or test dependency ships.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules \
 *   node tools/test_drawing_brush_texture.cjs
 * Optional one-off upgrade check: DRAWING_TEXTURE_BASELINE=/path/to/old/brushes-chuishi.js
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const native = require('@napi-rs/canvas');
const core = require('../assets/drawing-studio/core.js');
const imported = require('../assets/drawing-studio/brushes-chuishi.js');
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const harnessSource = fs.readFileSync(harnessFile, 'utf8');
const boundary = harnessSource.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'Drawing harness has an explicit suite boundary');
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(harnessSource.slice(0, boundary) +
  '\nmodule.exports = { openStudio, errors, pixels, hash, inkStats, eventually };', harnessFile);
const { openStudio, errors, pixels, hash, inkStats, eventually } = harness.exports;
const live = new Set();
const filter = process.env.DRAWING_TEST_FILTER && new RegExp(process.env.DRAWING_TEST_FILTER, 'i');
let passed = 0;
async function test(name, fn) {
  if (filter && !filter.test(name)) return;
  await fn(); passed++; console.log('PASS ' + name);
}

function render(id, options = {}, engine = core) {
  const canvas = native.createCanvas(320, 160), ctx = canvas.getContext('2d');
  const stroke = engine.makeStroke(ctx, { brush: id, size: 48, color: '#b83020',
    pressure: false, stabilizer: 0, ...options });
  const point = (x, time) => ({ x, y: 80, time, pointerType: 'pen', pressure: .8 });
  stroke.start(point(36, 0)); stroke.move(point(280, 700)); stroke.end(point(280, 700));
  stroke.flush();
  const out = { data: pixels(canvas), stats: inkStats(canvas), bounds: stroke.bounds };
  out.hash = hash(out.data); canvas.width = canvas.height = 1;
  return out;
}

function uiFor(dom) {
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const value = doc.getElementById(id); assert.ok(value, id); return value; };
  const edit = (id, value) => {
    el(id).value = String(value);
    el(id).dispatchEvent(new win.Event('input', { bubbles: true }));
    el(id).dispatchEvent(new win.Event('change', { bubbles: true }));
  };
  const tool = id => doc.querySelector('[data-tool="' + id + '"]').click();
  const active = () => app.getLayer(app.inspect().activeId);
  const values = () => [+el('brushTextureScale').value / 100, +el('brushTextureDensity').value / 100];
  const setTexture = (scale, density) => {
    edit('brushTextureScale', scale * 100); edit('brushTextureDensity', density * 100);
  };
  function pointer(type, x, y, time = 0) {
    const display = el('drawingCanvas'), bounds = display.getBoundingClientRect();
    display.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true,
      pointerId: 1, pointerType: 'pen', button: 0, buttons: type === 'pointerup' ? 0 : 1,
      pressure: type === 'pointerup' ? 0 : .8, timeStamp: time,
      clientX: bounds.left + x / display.width * bounds.width,
      clientY: bounds.top + y / display.height * bounds.height }));
  }
  function draw() {
    pointer('pointerdown', 22, 60); pointer('pointermove', 170, 60, 300);
    pointer('pointerup', 170, 60, 300); app.render();
  }
  async function fresh(id) {
    await app.newDocument({ width: 192, height: 128, paper: 'transparent', title: 'Texture regression' });
    tool('brush'); edit('brushKind', id); edit('brushSize', 36); edit('brushOpacity', 100); edit('stabilizer', 0);
    el('penPressure').checked = false; el('penPressure').dispatchEvent(new win.Event('change', { bubbles: true }));
  }
  return { win, doc, app, el, edit, tool, active, values, setTexture, pointer, draw, fresh };
}

async function studio(configure) {
  const dom = await openStudio(undefined, configure); live.add(dom); return uiFor(dom);
}
function close(ui) { ui.win.close(); for (const dom of live) if (dom.window === ui.win) live.delete(dom); }

async function main() {
  await test('Texture controls cover paper grain and embedded tip texture, while plain pens stay plain', () => {
    for (const id of ['chuishi-hatching-grain', 'haiguai-pencil-soft', 'dongdong-rough-inking', 'dongdong-soft-texture']) {
      assert.equal(core.brushPresets.find(p => p.id === id).textureControls, true, id);
    }
    for (const id of ['gpen', 'fineliner', 'plainSquare', 'fountain', 'wetMix', 'smudge', 'binary', 'pixel', 'haiguai-airbrush']) {
      assert.ok(!core.brushPresets.find(p => p.id === id).textureControls, id);
      assert.equal(render(id).hash, render(id, { textureScale: 4, textureDensity: .25 }).hash,
        id + ' must not acquire a new grain or change its pixels');
    }
  });

  await test('Default texture values preserve every imported brush and deterministic repeated strokes', () => {
    let baseline;
    if (process.env.DRAWING_TEXTURE_BASELINE) {
      const engineFile = path.resolve(__dirname, '../assets/drawing-studio/brushes-chuishi.js');
      const old = new Module(engineFile, module); old.filename = engineFile; old.paths = module.paths;
      old._compile(fs.readFileSync(process.env.DRAWING_TEXTURE_BASELINE, 'utf8'), engineFile); baseline = old.exports;
    }
    for (const preset of imported.presets) {
      const original = render(preset.id);
      assert.equal(original.hash, render(preset.id, { textureScale: 1, textureDensity: 1 }).hash, preset.id);
      if (baseline) assert.equal(original.hash, render(preset.id, {}, baseline).hash, preset.id + ' matches the pre-upgrade engine');
    }
  });

  await test('Scale changes grain detail within the same stroke envelope', () => {
    for (const id of ['chuishi-hatching-grain', 'haiguai-pencil-soft', 'dongdong-rough-inking', 'dongdong-soft-texture',
      'chuishi-jiayou-inking', 'chuishi-linework']) {
      // These two source papers are fully covered at their original threshold;
      // first expose their grain with density, then compare its spatial scale.
      const textureDensity = ['chuishi-jiayou-inking', 'chuishi-linework'].includes(id) ? .5 : 1;
      const fine = render(id, { textureScale: .5, textureDensity }), coarse = render(id, { textureScale: 2.5, textureDensity });
      assert.notEqual(fine.hash, coarse.hash, id + ' responds to texture scale');
      assert.deepEqual(fine.bounds, coarse.bounds, id + ' retains its original pen footprint');
      assert.ok(fine.stats.count > 0 && coarse.stats.count > 0, id + ' remains drawable');
      assert.ok(coarse.stats.height <= 50 && fine.stats.height <= 50, id + ' does not enlarge the pen width');
    }
  });

  await test('Density increases actual ink coverage without merely fading the whole stroke', () => {
    for (const { id } of core.brushPresets.filter(p => p.textureControls)) {
      const sparse = render(id, { textureDensity: .25 }), normal = render(id), dense = render(id, { textureDensity: 2 });
      assert.ok(sparse.stats.count > 0, id + ' remains visible at the minimum density');
      assert.ok(sparse.stats.alphaSum < normal.stats.alphaSum && normal.stats.alphaSum <= dense.stats.alphaSum,
        id + ' ink coverage must increase with density');
      assert.ok(sparse.stats.count < dense.stats.count, id + ' adds occupied pixels instead of scaling only opacity');
      assert.deepEqual(sparse.bounds, dense.bounds, id + ' density does not enlarge the stroke');
    }
  });

  await test('Extreme and nonfinite parameters remain bounded and do not poison the texture caches', () => {
    const id = 'haiguai-pencil-soft';
    assert.equal(render(id, { textureScale: -100, textureDensity: -100 }).hash,
      render(id, { textureScale: .25, textureDensity: .25 }).hash);
    assert.equal(render(id, { textureScale: 1000000, textureDensity: 1000000 }).hash,
      render(id, { textureScale: 4, textureDensity: 2 }).hash);
    for (const value of [NaN, Infinity, -Infinity, 'invalid'])
      assert.equal(render(id, { textureScale: value, textureDensity: value }).hash, render(id).hash);
    for (let i = 0; i < 20; i++) {
      const options = { textureScale: .25 + i * .15, textureDensity: .25 + i * .08 };
      render(id, options); render('dongdong-soft-texture', options);
    }
    const caches = imported.diagnostics();
    assert.ok(caches.maskEntries <= 20 && caches.tintEntries <= 12 && caches.grainEntries <= 14);
    assert.ok(caches.textureTipEntries <= 8);
    assert.ok(caches.canvasBytes < 12 * 1024 * 1024, 'Texture edits retain the existing bounded cache budget');
  });

  const ui = await studio();
  await test('The deployed controls appear only for supported brushes and refresh the real sample', async () => {
    await ui.fresh('haiguai-pencil-soft');
    assert.equal(ui.el('brushTextureControls').hidden, false);
    await eventually(() => inkStats(ui.el('brushPreview')).count > 0, 'Initial preview is painted');
    // Wait for the sample scheduled by fresh() before comparing a parameter edit.
    await new Promise(resolve => ui.win.requestAnimationFrame(resolve));
    const before = hash(pixels(ui.el('brushPreview')));
    ui.setTexture(2.5, .5);
    await eventually(() => hash(pixels(ui.el('brushPreview'))) !== before, 'Changing texture repaints the actual sample');
    assert.match(ui.el('brushTextureScaleValue').textContent, /250%/);
    assert.match(ui.el('brushTextureDensityValue').textContent, /50%/);
    assert.equal(ui.app.inspect().size, 36, 'Texture control leaves pen size alone');
    assert.equal(ui.app.inspect().opacity, 1, 'Texture density leaves global concentration alone');
    for (const tool of ['eraser', 'fill', 'shape', 'text', 'hand']) {
      ui.tool(tool); assert.equal(ui.el('brushTextureControls').hidden, true, tool);
    }
    ui.tool('brush'); assert.equal(ui.el('brushTextureControls').hidden, false);
    ui.edit('brushKind', 'gpen'); assert.equal(ui.el('brushTextureControls').hidden, true);
    ui.edit('brushKind', 'dongdong-soft-texture'); assert.equal(ui.el('brushTextureControls').hidden, false);
  });

  await test('Brush preferences remain independent through switching, new artwork, reset and page restart', async () => {
    ui.edit('brushKind', 'haiguai-pencil-soft'); ui.setTexture(2.5, .5);
    ui.edit('brushKind', 'dongdong-rough-inking'); ui.setTexture(.5, 1.75);
    await ui.app.newDocument({ width: 96, height: 96, paper: 'transparent' });
    ui.edit('brushKind', 'haiguai-pencil-soft'); assert.deepEqual(ui.values(), [2.5, .5]);
    ui.edit('brushKind', 'dongdong-rough-inking'); assert.deepEqual(ui.values(), [.5, 1.75]);
    ui.el('resetBrushProfile').click(); assert.deepEqual(ui.values(), [1, 1]);
    ui.edit('brushKind', 'haiguai-pencil-soft'); assert.deepEqual(ui.values(), [2.5, .5]);
    const saved = Object.fromEntries(Array.from({ length: ui.win.localStorage.length }, (_, i) => {
      const key = ui.win.localStorage.key(i); return [key, ui.win.localStorage.getItem(key)];
    }));
    const restarted = await studio(win => { for (const [key, value] of Object.entries(saved)) win.localStorage.setItem(key, value); });
    assert.equal(restarted.app.inspect().brush, 'haiguai-pencil-soft'); assert.deepEqual(restarted.values(), [2.5, .5]);
    restarted.edit('brushKind', 'dongdong-rough-inking'); assert.deepEqual(restarted.values(), [1, 1]); close(restarted);
  });

  await test('Gallery previews use each brush saved texture settings', async () => {
    ui.edit('brushKind', 'haiguai-pencil-soft'); ui.setTexture(2.5, .5); ui.el('brushSample').click();
    const card = ui.doc.querySelector('[data-brush-preset="haiguai-pencil-soft"]');
    await eventually(() => card.dataset.sampleProfile && JSON.parse(card.dataset.sampleProfile).textureScale === 2.5,
      'The gallery paints the saved profile', 20000);
    const before = hash(pixels(card.querySelector('canvas')));
    ui.el('brushDialog').close(); ui.setTexture(.5, 1.75); ui.el('brushSample').click();
    await eventually(() => JSON.parse(card.dataset.sampleProfile || '{}').textureScale === .5,
      'The gallery invalidates only the changed profile', 20000);
    assert.notEqual(hash(pixels(card.querySelector('canvas'))), before); ui.el('brushDialog').close();
  });

  await test('Project files transfer texture settings while existing device preferences retain priority', async () => {
    await ui.fresh('haiguai-pencil-soft'); ui.setTexture(2.5, .5); ui.draw();
    const saved = JSON.parse(await ui.app.exportProject()), painted = hash(pixels(ui.active().canvas));
    assert.equal(saved.settings.textureScale, 2.5); assert.equal(saved.settings.textureDensity, .5);
    const other = await studio(); await other.app.loadProject(saved);
    assert.deepEqual(other.values(), [2.5, .5]); assert.equal(hash(pixels(other.active().canvas)), painted);
    other.setTexture(.5, 1.75); await other.app.loadProject(saved);
    assert.deepEqual(other.values(), [.5, 1.75], 'Loading an artwork does not overwrite this device brush preferences');
    const exported = JSON.parse(await other.app.exportProject());
    assert.equal(exported.settings.textureScale, .5); assert.equal(exported.settings.textureDensity, 1.75);
    close(other);
    const old = structuredClone(saved); delete old.settings.textureScale; delete old.settings.textureDensity;
    const clean = await studio(); await clean.app.loadProject(old); assert.deepEqual(clean.values(), [1, 1]); close(clean);
  });

  await test('Untrusted project texture fields normalize before use', async () => {
    const saved = JSON.parse(await ui.app.exportProject());
    for (const [scale, density, expected] of [[-100, 999, [.25, 2]], ['bad', null, [1, 1]], [1e100, -1e100, [4, .25]]]) {
      const fresh = await studio();
      saved.settings.textureScale = scale; saved.settings.textureDensity = density;
      await fresh.app.loadProject(saved); assert.deepEqual(fresh.values(), expected); close(fresh);
    }
  });

  await test('Adjusted strokes preserve single-step undo, alpha, whole-stroke erase and saved pixels', async () => {
    for (const id of ['haiguai-pencil-soft', 'dongdong-soft-texture']) {
      await ui.fresh(id); ui.setTexture(1, 1); ui.edit('brushOpacity', 57); ui.draw();
      const defaultStroke = hash(pixels(ui.active().canvas));
      await ui.fresh(id); ui.setTexture(2.5, .5); ui.edit('brushOpacity', 57);
      const before = hash(pixels(ui.active().canvas)), history = ui.app.inspect().history; ui.draw();
      const after = hash(pixels(ui.active().canvas));
      assert.notEqual(before, after); assert.notEqual(defaultStroke, after, 'The actual drawing path uses the texture settings');
      assert.equal(ui.app.inspect().history, history + 1);
      assert.ok(inkStats(ui.active().canvas).maxAlpha <= 146, 'Global concentration still composites once');
      assert.equal(ui.app.inspect().strokeCount, 1);
      ui.app.undo(); assert.equal(hash(pixels(ui.active().canvas)), before);
      ui.app.redo(); assert.equal(hash(pixels(ui.active().canvas)), after);
      await ui.app.loadProject(await ui.app.exportProject());
      assert.equal(hash(pixels(ui.active().canvas)), after); assert.deepEqual(ui.values(), [2.5, .5]);
      ui.tool('eraser'); ui.edit('eraserMode', 'stroke'); ui.edit('brushSize', 100);
      ui.pointer('pointerdown', 95, 60); ui.pointer('pointerup', 95, 60); ui.app.render();
      assert.equal(ui.app.inspect().strokeCount, 0); assert.equal(hash(pixels(ui.active().canvas)), before);
      ui.app.undo(); assert.equal(hash(pixels(ui.active().canvas)), after);
    }
  });

  assert.deepEqual(errors, [], 'No asynchronous Canvas or DOM errors');
  console.log('Brush texture regression: ' + passed + ' checks passed.');
}

main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => { for (const dom of live) dom.window.close(); });
