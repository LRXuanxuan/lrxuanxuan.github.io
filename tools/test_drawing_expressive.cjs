/* Development-only real Canvas / DOM checks for the independent expressive brushes.
 * Uses the existing local test harness; it does not test physical pen hardware.
 * NODE_PATH=/tmp/lightdraw-tests/node_modules:$CODEX_PRIMARY_RUNTIME_NODE_MODULES \
 *   node tools/test_drawing_expressive.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const native = require('@napi-rs/canvas');
const core = require('../assets/drawing-studio/core.js');
const expressive = require('../assets/drawing-studio/brushes-expressive.js');
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const source = fs.readFileSync(harnessFile, 'utf8');
const boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'The existing harness exposes its suite boundary');
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) +
  '\nmodule.exports = { openStudio, errors, pixels, hash, inkStats, eventually };', harnessFile);
const { openStudio, errors, pixels, hash, inkStats, eventually } = harness.exports;
const live = new Set(), surfaces = new Set();
const filter = process.env.DRAWING_TEST_FILTER && new RegExp(process.env.DRAWING_TEST_FILTER, 'i');
let passed = 0;

async function test(name, fn) {
  if (filter && !filter.test(name)) return;
  try { await fn(); passed++; console.log('PASS ' + name); }
  finally { for (const canvas of surfaces) canvas.width = canvas.height = 1; surfaces.clear(); }
}
function canvas(width = 400, height = 256) {
  const out = native.createCanvas(width, height); surfaces.add(out); return out;
}
function line(pressure = .8, segments = 1) {
  return Array.from({ length: segments + 1 }, (_, i) => ({ x: 64 + 272 * i / segments,
    y: 128, pressure, time: 600 * i / segments }));
}
function render(id, options = {}) {
  const target = canvas(options.width || 400, options.height || 256);
  const ctx = target.getContext('2d');
  if (options.noLayerRead) ctx.getImageData = () => { throw new Error('An ordinary brush cannot sample its destination layer'); };
  const stroke = (options.engine || core).makeStroke(ctx, {
    brush: id, size: options.size ?? 40, color: '#b83020', pressure: options.pressure !== false,
    stabilizer: 0, textureScale: options.textureScale, textureDensity: options.textureDensity,
    opacity: options.opacity
  });
  const points = (options.points || [
    { x: 64, y: 128, pressure: .55, time: 0 },
    { x: 140, y: 94, pressure: .75, time: 180 },
    { x: 240, y: 155, pressure: .95, time: 370 },
    { x: 336, y: 115, pressure: .65, time: 600 }
  ]).map(point => ({ pointerType: options.pointerType || 'pen', ...point }));
  stroke.start(points[0]);
  for (const point of points.slice(1)) stroke.move(point);
  stroke.end({ ...points[points.length - 1], pressure: options.endPressure ?? 0 });
  stroke.flush();
  // A no-read guard is only active during painting; pixel inspection is a test operation.
  if (options.noLayerRead) delete ctx.getImageData;
  const data = pixels(target), stats = inkStats(target);
  return { canvas: target, stroke, data, stats, hash: hash(data), bounds: stroke.bounds };
}
function alphaDifference(a, b) {
  assert.equal(a.length, b.length); let difference = 0, mass = 0;
  for (let i = 3; i < a.length; i += 4) { difference += Math.abs(a[i] - b[i]); mass += Math.max(a[i], b[i]); }
  return difference / Math.max(1, mass);
}
function containsInk(result, message) {
  const b = result.bounds, s = result.stats;
  assert.ok(s.count > 0, message + ' paints visible pixels');
  assert.ok(b && Object.values(b).every(Number.isFinite), message + ' has finite dirty bounds');
  assert.ok(b.x <= s.left && b.y <= s.top && b.x + b.width > s.right && b.y + b.height > s.bottom,
    message + ' bounds must contain all drawn pixels, including scattered tips and antialiasing: ' +
    JSON.stringify({ bounds: b, ink: s }));
  assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.width <= result.canvas.width && b.y + b.height <= result.canvas.height,
    message + ' dirty bounds stay clipped to the working canvas');
}
function uiFor(dom) {
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const item = doc.getElementById(id); assert.ok(item, id); return item; };
  const edit = (id, value) => {
    el(id).value = String(value);
    el(id).dispatchEvent(new win.Event('input', { bubbles: true }));
    el(id).dispatchEvent(new win.Event('change', { bubbles: true }));
  };
  const tool = id => doc.querySelector('[data-tool="' + id + '"]').click();
  const active = () => app.getLayer(app.inspect().activeId);
  function pointer(type, point) {
    const display = el('drawingCanvas'), bounds = display.getBoundingClientRect();
    display.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1,
      pointerType: 'pen', button: 0, buttons: type === 'pointerup' ? 0 : 1,
      pressure: type === 'pointerup' ? 0 : .8, timeStamp: point[2] || 0,
      clientX: bounds.left + point[0] / display.width * bounds.width,
      clientY: bounds.top + point[1] / display.height * bounds.height }));
  }
  function draw(points = [[60, 96, 0], [250, 96, 500]]) {
    pointer('pointerdown', points[0]); for (const p of points.slice(1)) pointer('pointermove', p);
    pointer('pointerup', points[points.length - 1]); app.render();
  }
  async function fresh(id) {
    await app.newDocument({ width: 320, height: 192, paper: 'transparent', title: 'Expressive brush regression' });
    tool('brush'); edit('brushKind', id); edit('brushSize', 36); edit('brushOpacity', 100);
    edit('stabilizer', 0); edit('inkColor', '#b83020');
    el('penPressure').checked = false; el('penPressure').dispatchEvent(new win.Event('change', { bubbles: true }));
    edit('brushTextureScale', 100); edit('brushTextureDensity', 100);
  }
  const textureValues = () => [+el('brushTextureScale').value / 100, +el('brushTextureDensity').value / 100];
  return { win, doc, app, el, edit, tool, active, draw, fresh, textureValues };
}
async function studio(configure) {
  const dom = await openStudio(undefined, configure); live.add(dom); return uiFor(dom);
}
function close(ui) { ui.win.close(); for (const dom of live) if (dom.window === ui.win) live.delete(dom); }

async function main() {
  await test('Fifteen new brushes register without replacing the retained drawing tools', () => {
    assert.equal(expressive.presets.length, 15);
    assert.equal(new Set(core.brushPresets.map(p => p.id)).size, core.brushPresets.length);
    assert.equal(core.brushPresets.length, 59 + expressive.presets.length);
    for (const id of ['gpen', 'fineliner', 'plainSquare', 'fountain', 'wetMix', 'smudge', 'binary', 'pixel',
      'watercolorWet', 'watercolorGlaze', 'watercolorDry', 'chuishi-square', 'haiguai-outline', 'dongdong-soft-texture'])
      assert.ok(core.brushPresets.some(p => p.id === id), id + ' remains available');
    for (const preset of expressive.presets) {
      assert.ok(core.brushPresets.some(p => p.id === preset.id));
      assert.ok(!preset.samplesLayer, preset.id + ' remains an ordinary recorded stroke');
    }
  });

  await test('Every brush paints taps, turning strokes and clipped edges with complete dirty bounds', () => {
    for (const { id } of expressive.presets) {
      containsInk(render(id), id + ' curved line');
      containsInk(render(id, { points: [{ x: 200, y: 128, pressure: .8, time: 0 }] }), id + ' tap');
      containsInk(render(id, { size: 1, points: [{ x: 200.25, y: 128.25, pressure: .8, time: 0 }] }), id + ' one-pixel tap');
      containsInk(render(id, { points: [
        { x: 2, y: 2, pressure: 1, time: 0 }, { x: 72, y: 2, pressure: 1, time: 200 },
        { x: 2, y: 65, pressure: 1, time: 400 }
      ] }), id + ' clipped corner');
    }
  });

  await test('The core routes to repeatable distinct brush renderers without destination sampling', () => {
    const results = [];
    for (const { id } of expressive.presets) {
      const result = render(id, { noLayerRead: true }); results.push({ id, ...result });
      assert.equal(result.hash, render(id).hash, id + ' determinism');
      assert.equal(result.hash, render(id, { engine: expressive }).hash, id + ' core dispatch');
    }
    for (let i = 0; i < results.length; i++) for (let j = i + 1; j < results.length; j++)
      assert.ok(alphaDifference(results[i].data, results[j].data) > .06,
        results[i].id + ' and ' + results[j].id + ' need materially different ink patterns');
  });

  await test('Sparse and dense input keep the same continuous spacing and particle density', () => {
    for (const { id } of expressive.presets) {
      const sparse = render(id, { points: line(.8, 1) }), dense = render(id, { points: line(.8, 80) });
      const difference = alphaDifference(sparse.data, dense.data);
      assert.ok(difference < .04, id + ' resampling difference ' + difference);
      const ratio = dense.stats.alphaSum / sparse.stats.alphaSum;
      assert.ok(ratio > .97 && ratio < 1.03, id + ' event density changes paint amount: ' + ratio);
    }
  });

  await test('Halftone dots align to the document across strokes with different starting points', () => {
    const a = render('expressive-halftone', { points: line(.8) });
    const b = render('expressive-halftone', { points: line(.8).map(p => ({ ...p, y: p.y + 4 })) });
    const center = result => result.canvas.getContext('2d').getImageData(120, 120, 160, 17).data;
    assert.ok(alphaDifference(center(a), center(b)) < .05,
      'A second stroke must continue the same dot grid inside the shared painted area');
  });

  await test('Pen pressure responds, pointer-up zero does not burst, and mouse fallback stays full width', () => {
    for (const { id } of expressive.presets) {
      const light = render(id, { points: line(.15) }), firm = render(id, { points: line(.95) });
      assert.ok(firm.stats.alphaSum > light.stats.alphaSum * 1.15, id + ' responds to pen force');
      assert.equal(light.hash, render(id, { points: line(.15), endPressure: .15 }).hash,
        id + ' pen-up zero must not add a full-width ending');
      assert.equal(render(id, { pointerType: 'mouse', points: line(0) }).hash,
        render(id, { pointerType: 'mouse', points: line(1), endPressure: 1 }).hash,
        id + ' non-pen pressure does not thin mouse input');
    }
  });

  await test('Texture controls affect only internal texture and either zero endpoint keeps ink', () => {
    assert.ok(expressive.presets.some(p => p.textureControls), 'Dry media expose supported texture parameters');
    for (const preset of expressive.presets) {
      const normal = render(preset.id);
      if (!preset.textureControls) {
        assert.equal(render(preset.id, { textureScale: 0, textureDensity: 0 }).hash, normal.hash,
          preset.id + ' geometric structure is not erased by texture settings');
        continue;
      }
      const off = render(preset.id, { textureScale: 0, textureDensity: 0 });
      containsInk(off, preset.id + ' texture off');
      assert.notEqual(normal.hash, off.hash, preset.id + ' removes internal paper texture');
      for (const [textureScale, textureDensity] of [[0, 1], [1, 0], [0, 2], [4, 0]])
        assert.equal(render(preset.id, { textureScale, textureDensity }).hash, off.hash,
          preset.id + ' either zero disables the same texture');
      const fine = render(preset.id, { textureScale: .5 }), coarse = render(preset.id, { textureScale: 3 });
      assert.notEqual(fine.hash, coarse.hash, preset.id + ' responds to texture scale');
      if (preset.id === 'expressive-bristle') {
        // Its first/last bristle segments may be dry. This can move the actual
        // dirty rectangle a pixel without changing nib width or sampling space.
        for (const key of ['x', 'y', 'width', 'height'])
          assert.ok(Math.abs(fine.bounds[key] - coarse.bounds[key]) <= 2,
            preset.id + ' texture must not enlarge or move the bristle geometry');
      } else assert.deepEqual(fine.bounds, coarse.bounds, preset.id + ' scale keeps the same brush footprint');
      const sparse = render(preset.id, { textureDensity: .25 }), dense = render(preset.id, { textureDensity: 2 });
      assert.ok(dense.stats.count >= sparse.stats.count, preset.id + ' density does not remove occupied pixels');
      assert.ok(dense.stats.alphaSum > sparse.stats.alphaSum, preset.id + ' density increases deposited ink');
      // Soft cloud texture can keep a continuous translucent base. In that case
      // distinguish a changing spatial texture from merely scaling the whole stroke.
      if (dense.stats.count === sparse.stats.count) {
        const ratios = [];
        for (let i = 3; i < sparse.data.length; i += 4)
          if (sparse.data[i] >= 30) ratios.push(dense.data[i] / sparse.data[i]);
        ratios.sort((a, b) => a - b);
        assert.ok(ratios.length > 100 && ratios[Math.floor(ratios.length * .9)] - ratios[Math.floor(ratios.length * .1)] > .04,
          preset.id + ' density changes local texture rather than multiplying one alpha across the stroke');
      }
    }
  });

  await test('Finishing a brush leaves the reused stroke canvas ready for ordinary opaque drawing', () => {
    for (const { id } of expressive.presets) {
      const used = render(id).canvas, ctx = used.getContext('2d');
      ctx.clearRect(0, 0, used.width, used.height); ctx.fillStyle = '#123456'; ctx.fillRect(40, 50, 90, 60);
      const fresh = canvas(), clean = fresh.getContext('2d'); clean.fillStyle = '#123456'; clean.fillRect(40, 50, 90, 60);
      assert.equal(hash(pixels(used)), hash(pixels(fresh)), id + ' must restore compositing, alpha and transform');
    }
  });

  await test('Rendering different brushes and textures retains only the bounded paper cache', () => {
    for (const { id } of expressive.presets.filter(p => p.textureControls))
      for (const textureScale of [.5, 2.5]) render(id, { textureScale, textureDensity: .5 });
    const stats = expressive.diagnostics();
    assert.ok(stats.cacheEntries <= 1 && stats.cacheBytes <= 16 * 1024,
      'Persistent cache is at most one 128 by 128 byte noise field');
  });

  const ui = await studio();
  await test('The app lists and previews all new brushes with appropriate controls', async () => {
    ui.el('brushSample').click();
    await eventually(() => expressive.presets.every(p =>
      ui.doc.querySelector('[data-brush-preset="' + p.id + '"]')?.dataset.sampleProfile),
      'New library samples finish through the ordinary frame queue', 20000);
    for (const p of expressive.presets) {
      const card = ui.doc.querySelector('[data-brush-preset="' + p.id + '"]');
      assert.ok(inkStats(card.querySelector('canvas')).count > 0, p.id + ' library preview');
      assert.ok(Array.from(ui.el('brushKind').options).some(o => o.value === p.id && o.textContent === p.name));
      ui.edit('brushKind', p.id);
      assert.equal(ui.el('brushTextureControls').hidden, !p.textureControls, p.id + ' texture controls');
    }
    ui.el('brushDialog').close();
  });

  await test('All new brushes preserve one-step history, stroke identity, concentration and saved pixels', async () => {
    for (const { id } of expressive.presets) {
      await ui.fresh(id); ui.draw(); const full = inkStats(ui.active().canvas);
      await ui.fresh(id); ui.edit('brushOpacity', 50);
      const blank = hash(pixels(ui.active().canvas)), history = ui.app.inspect().history;
      ui.draw(); const painted = hash(pixels(ui.active().canvas)), half = inkStats(ui.active().canvas);
      assert.ok(half.count > 0 && half.maxAlpha <= 128, id + ' composites the 50% stroke once');
      const ratio = half.alphaSum / full.alphaSum;
      assert.ok(ratio > .48 && ratio < .52, id + ' opacity must not be squared: ' + ratio);
      assert.equal(ui.app.inspect().history, history + 1); assert.equal(ui.app.inspect().strokeCount, 1);
      ui.app.undo(); assert.equal(hash(pixels(ui.active().canvas)), blank);
      ui.app.redo(); assert.equal(hash(pixels(ui.active().canvas)), painted);
      const project = await ui.app.exportProject(); await ui.app.loadProject(project);
      assert.equal(ui.app.inspect().brush, id); assert.equal(hash(pixels(ui.active().canvas)), painted);
      assert.equal(ui.app.inspect().strokeCount, 1, id + ' identity survives project round-trip');
      // Hit an actual painted pixel so a hollow or widely scattered brush is tested fairly.
      const data = pixels(ui.active().canvas); let pixelIndex = -1;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 10) { pixelIndex = (i - 3) / 4; break; }
      assert.ok(pixelIndex >= 0);
      ui.tool('eraser'); ui.edit('eraserMode', 'stroke'); ui.edit('brushSize', 8); ui.edit('brushOpacity', 100);
      ui.draw([[pixelIndex % 320 + .5, Math.floor(pixelIndex / 320) + .5, 0]]);
      assert.equal(ui.app.inspect().strokeCount, 0, id + ' can be erased as one stroke');
      assert.equal(hash(pixels(ui.active().canvas)), blank, id + ' erasing one particle removes every disconnected part');
      ui.app.undo(); assert.equal(hash(pixels(ui.active().canvas)), painted);
    }
  });

  await test('New brush zero texture settings survive per-brush preferences, restart and project transfer', async () => {
    const textured = expressive.presets.filter(p => p.textureControls);
    assert.ok(textured.length >= 2);
    await ui.fresh(textured[0].id); ui.edit('brushTextureScale', 0); ui.edit('brushTextureDensity', 125); ui.draw();
    const project = await ui.app.exportProject(), painted = hash(pixels(ui.active().canvas));
    ui.edit('brushKind', textured[1].id); ui.edit('brushTextureScale', 200); ui.edit('brushTextureDensity', 0);
    ui.edit('brushKind', textured[0].id); assert.deepEqual(ui.textureValues(), [0, 1.25]);
    const saved = Object.fromEntries(Array.from({ length: ui.win.localStorage.length }, (_, i) => {
      const key = ui.win.localStorage.key(i); return [key, ui.win.localStorage.getItem(key)];
    }));
    const restarted = await studio(win => { for (const [key, value] of Object.entries(saved)) win.localStorage.setItem(key, value); });
    assert.equal(restarted.app.inspect().brush, textured[0].id); assert.deepEqual(restarted.textureValues(), [0, 1.25]);
    restarted.edit('brushKind', textured[1].id); assert.deepEqual(restarted.textureValues(), [2, 0]); close(restarted);
    const transferred = await studio(); await transferred.app.loadProject(project);
    assert.equal(transferred.app.inspect().brush, textured[0].id); assert.deepEqual(transferred.textureValues(), [0, 1.25]);
    assert.equal(hash(pixels(transferred.active().canvas)), painted); close(transferred);
  });

  assert.deepEqual(errors, [], 'No asynchronous Canvas or DOM errors');
  console.log('Expressive brush regression: ' + passed + ' checks passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => { for (const dom of live) dom.window.close(); for (const c of surfaces) c.width = c.height = 1; });
