/* Development-only watercolor pixel and DOM regressions.
 * Uses the existing native Canvas/jsdom harness, with no browser or shipped
 * test dependencies. This tests the explicit persistently-wet-paper model;
 * it does not claim a time-dependent physical fluid simulation.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules \
 *   node tools/test_drawing_watercolor.cjs
 * Optional upgrade check: DRAWING_WATERCOLOR_BASELINE=/path/to/old/watercolor.js
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const native = require('@napi-rs/canvas');
const core = require('../assets/drawing-studio/core.js');
const harnessFile = path.join(__dirname, 'test_drawing_app.cjs');
const source = fs.readFileSync(harnessFile, 'utf8');
const boundary = source.indexOf('\nasync function main() {');
assert.ok(boundary > 0, 'Integration harness has an explicit suite boundary');
const harness = new Module(harnessFile, module);
harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) +
  '\nmodule.exports = { openStudio, errors, pixel, pixels, hash, inkStats, eventually };', harnessFile);
const { openStudio, errors, pixel, pixels, hash, inkStats, eventually } = harness.exports;
const ids = ['watercolorWet', 'watercolorGlaze', 'watercolorDry'];
const effectKeys = ['watercolorEdge', 'watercolorBloom', 'watercolorVariation'];
const filter = process.env.DRAWING_TEST_FILTER && new RegExp(process.env.DRAWING_TEST_FILTER, 'i');
const extraWindows = new Set();
let passed = 0, live;
async function test(name, fn) {
  if (filter && !filter.test(name)) return;
  await fn(); passed++; console.log('PASS ' + name);
}
const preset = id => core.brushPresets.find(item => item.id === id);
const point = (x, y, time = 0, pressure = 1) => ({ x, y, time, pressure, pointerType: 'pen' });

function paint(target, id, points, options = {}, engine = core) {
  const work = native.createCanvas(target.width, target.height), ctx = work.getContext('2d');
  const sampled = !!preset(id)?.samplesLayer;
  if (sampled) ctx.drawImage(target, 0, 0);
  const brush = engine.makeStroke(ctx, { brush: id, size: 40, color: '#c04430',
    stabilizer: 0, pressure: false, textureScale: 1, textureDensity: 1, ...options });
  brush.start(points[0]); points.slice(1).forEach(p => brush.move(p)); brush.end(points.at(-1)); brush.flush();
  const b = brush.bounds, dst = target.getContext('2d');
  if (b) {
    dst.save(); dst.globalAlpha = options.opacity ?? 1;
    if (sampled) {
      dst.globalCompositeOperation = 'destination-out'; dst.fillStyle = '#000';
      dst.fillRect(b.x, b.y, b.width, b.height); dst.globalCompositeOperation = 'lighter';
    }
    dst.drawImage(work, b.x, b.y, b.width, b.height, b.x, b.y, b.width, b.height); dst.restore();
  }
  work.width = work.height = 1;
  return b;
}
function line(id, options = {}, steps = 1, engine = core) {
  const c = native.createCanvas(256, 128), points = [];
  for (let i = 0; i <= steps; i++) points.push(point(28 + 200 * i / steps, 64, 600 * i / steps, options.penPressure ?? .8));
  const bounds = paint(c, id, points, options, engine);
  return { canvas: c, bounds, stats: inkStats(c), hash: hash(pixels(c)) };
}
function regionAlpha(c, x, y, w, h) {
  const d = c.getContext('2d').getImageData(x, y, w, h).data; let sum = 0;
  for (let i = 3; i < d.length; i += 4) sum += d[i];
  return sum / (w * h);
}
function regionColor(c, x, y, w = 6, h = 6) {
  const d = c.getContext('2d').getImageData(x, y, w, h).data, out = [0, 0, 0, 0];
  for (let i = 0; i < d.length; i += 4) {
    out[0] += d[i] * d[i + 3]; out[1] += d[i + 1] * d[i + 3]; out[2] += d[i + 2] * d[i + 3]; out[3] += d[i + 3];
  }
  if (out[3]) for (let i = 0; i < 3; i++) out[i] /= out[3];
  out[3] /= w * h; return out;
}
function uiFor(dom) {
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const value = doc.getElementById(id); assert.ok(value, id); return value; };
  const edit = (id, value) => {
    el(id).value = String(value); el(id).dispatchEvent(new win.Event('input', { bubbles: true }));
    el(id).dispatchEvent(new win.Event('change', { bubbles: true }));
  };
  const tool = id => doc.querySelector('[data-tool="' + id + '"]').click();
  const active = () => app.getLayer(app.inspect().activeId);
  function pointer(type, x, y, extra = {}) {
    const drawing = el('drawingCanvas'), rect = drawing.getBoundingClientRect();
    drawing.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true,
      pointerId: 1, pointerType: 'pen', button: 0, buttons: type === 'pointerup' ? 0 : 1,
      pressure: type === 'pointerup' ? 0 : .8,
      clientX: rect.left + x / drawing.width * rect.width,
      clientY: rect.top + y / drawing.height * rect.height, ...extra }));
  }
  function stroke(points) {
    pointer('pointerdown', ...points[0]); points.slice(1).forEach(p => pointer('pointermove', ...p));
    pointer('pointerup', ...points.at(-1)); app.render();
  }
  async function fresh(id) {
    await app.newDocument({ width: 192, height: 128, paper: 'transparent', title: '水彩回归' });
    tool('brush'); edit('brushKind', id); edit('brushSize', 40); edit('brushOpacity', 100);
    edit('stabilizer', 0); edit('inkColor', '#c04430');
    el('penPressure').checked = false; el('penPressure').dispatchEvent(new win.Event('change', { bubbles: true }));
  }
  return { win, doc, app, el, edit, tool, active, pointer, stroke, fresh };
}
async function extraStudio(configure) {
  const dom = await openStudio(undefined, configure); extraWindows.add(dom); return uiFor(dom);
}
function closeExtra(ui) {
  for (const dom of extraWindows) if (dom.window === ui.win) { dom.window.close(); extraWindows.delete(dom); }
}

async function main() {
  await test('Three watercolor presets use separate wet-mixing and dry-stroke contracts', () => {
    assert.equal(new Set(core.brushPresets.map(p => p.id)).size, core.brushPresets.length);
    for (const id of ids) {
      const p = preset(id); assert.ok(p, id); assert.match(p.group, /水彩/);
      assert.ok(p.name && p.hint); assert.equal(core.resolveBrushId(id), id);
      assert.equal(p.watercolor, true); assert.equal(p.textureControls, true);
    }
    assert.equal(preset('watercolorWet').samplesLayer, true);
    assert.ok(!preset('watercolorGlaze').samplesLayer); assert.ok(!preset('watercolorDry').samplesLayer);
  });

  await test('Watercolor deposits translucent textured pigment and preserves unpainted transparency', () => {
    const hashes = [];
    for (const id of ids) {
      const result = line(id); hashes.push(result.hash);
      assert.ok(result.stats.count > 300, id + ' deposits visible pigment');
      assert.equal(pixel(result.canvas, 2, 2)[3], 0, id + ' does not paint a white paper rectangle');
      assert.ok(result.stats.maxAlpha > 15 && result.stats.maxAlpha < 255, id + ' retains a translucent wash');
      const data = result.canvas.getContext('2d').getImageData(55, 58, 145, 12).data;
      const alpha = new Set(); for (let i = 3; i < data.length; i += 4) alpha.add(data[i]);
      assert.ok(alpha.size > 8, id + ' has paper-scale variation inside the stroke');
      assert.ok(result.bounds && result.bounds.width > 190 && result.bounds.height < 100, id + ' returns localized bounds');
    }
    assert.equal(new Set(hashes).size, 3, 'The presets are not aliases for the same raster brush');
  });

  await test('Dry glazing deepens actual overlap between separate pen-downs', () => {
    for (const id of ['watercolorGlaze', 'watercolorDry']) {
      const c = native.createCanvas(192, 128);
      paint(c, id, [point(25, 64), point(167, 64, 400)]);
      const one = regionAlpha(c, 88, 58, 16, 12), outside = regionAlpha(c, 40, 58, 16, 12);
      paint(c, id, [point(96, 22), point(96, 106, 400)]);
      const overlap = regionAlpha(c, 88, 58, 16, 12);
      assert.ok(overlap > one + 8, id + ' overlap adds a second transparent glaze');
      assert.equal(regionAlpha(c, 40, 58, 16, 12), outside, id + ' leaves nonoverlapping paint intact');
    }
  });

  await test('Pressure and sparse pointer sampling preserve a continuous watercolor path', () => {
    for (const id of ids) {
      const sparse = line(id), dense = line(id, {}, 80);
      assert.ok(Math.abs(sparse.stats.alphaSum - dense.stats.alphaSum) / sparse.stats.alphaSum < .06,
        id + ' pigment deposition is distance-driven, not event-count-driven');
      for (let x = 40; x < 220; x += 10) assert.ok(regionAlpha(sparse.canvas, x, 56, 4, 16) > 2, id + ' has no sampled-event gaps');
      const light = line(id, { pressure: true, penPressure: .15 }), heavy = line(id, { pressure: true, penPressure: .95 });
      assert.ok(heavy.stats.alphaSum > light.stats.alphaSum * 1.2, id + ' reacts to actual pen pressure');
    }
  });

  await test('Large nibs and off-canvas paths return clipped finite patches without stray pixels', () => {
    for (const id of ids) {
      const c = native.createCanvas(64, 48);
      const b = paint(c, id, [point(-25, -12), point(9, 8, 80), point(75, 55, 300)], { size: 240 });
      assert.ok(b && Number.isFinite(b.x + b.y + b.width + b.height), id);
      assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.width <= 64 && b.y + b.height <= 48, id + ' clips its patch');
      assert.ok(inkStats(c).count > 0, id + ' remains paintable at the canvas boundary');
    }
  });

  await test('Water amount, paper grain scale and density each change actual watercolor marks', () => {
    for (const id of ids) {
      const baseline = line(id);
      assert.notEqual(line(id, { watercolorWater: 0 }).hash, line(id, { watercolorWater: 1 }).hash, id + ' water amount');
      assert.notEqual(line(id, { textureScale: .5 }).hash, line(id, { textureScale: 3 }).hash, id + ' paper scale');
      assert.notEqual(line(id, { textureDensity: .25 }).hash, line(id, { textureDensity: 2 }).hash, id + ' grain density');
      assert.equal(line(id, { textureScale: 1, textureDensity: 1, watercolorWater: preset(id).watercolorWater }).hash,
        baseline.hash, id + ' explicit defaults keep the original mark');
    }
  });

  await test('Zero texture scale or density removes paper grain without removing watercolor ink', () => {
    for (const id of ids) {
      const quiet = { watercolorEdge: 0, watercolorBloom: 0, watercolorVariation: 0 };
      const disabled = line(id, { ...quiet, textureScale: 0 });
      assert.ok(disabled.stats.count > 300, id + ' retains a drawable brush');
      assert.ok(disabled.stats.maxAlpha > 15 && disabled.stats.maxAlpha < 255, id + ' preserves the translucent wash');
      assert.equal(pixel(disabled.canvas, 2, 2)[3], 0, id + ' keeps the surrounding paper transparent');
      assert.deepEqual(disabled.bounds, line(id, quiet).bounds, id + ' keeps its pen footprint');
      for (const [textureScale, textureDensity] of [[0, 0], [0, .05], [0, 2], [.05, 0], [1, 0], [4, 0]]) {
        assert.equal(line(id, { ...quiet, textureScale, textureDensity }).hash, disabled.hash,
          id + ' uses one texture-off result independently of the other knob');
      }
      const data = disabled.canvas.getContext('2d').getImageData(55, 58, 145, 12).data;
      const alpha = new Set(); for (let i = 3; i < data.length; i += 4) alpha.add(data[i]);
      assert.equal(alpha.size, 1, id + ' has no residual interior paper grain with independent effects disabled');
      for (const key of effectKeys) {
        assert.notEqual(line(id, { ...quiet, textureScale: 0, [key]: 1 }).hash, disabled.hash,
          id + ' keeps the independent ' + key + ' control active');
      }
      assert.equal(line(id, { textureScale: 0, textureDensity: 2 }).hash,
        line(id, { textureScale: 4, textureDensity: 0 }).hash,
        id + ' uses the same off result with its independent effects at their normal settings');
    }
  });

  await test('Sub-25-percent watercolor texture settings stay finite, distinct and drawable', () => {
    for (const id of ids) for (const textureScale of [.05, .1, .2, 1, 4]) {
      const hashes = [];
      for (const textureDensity of [.05, .1, .2, .25]) {
        const result = line(id, { textureScale, textureDensity }); hashes.push(result.hash);
        assert.ok(result.stats.count > 0, id + ' remains visible at ' + textureScale + '/' + textureDensity);
        assert.ok(result.bounds && Object.values(result.bounds).every(Number.isFinite), id + ' returns finite bounds');
      }
      assert.equal(new Set(hashes).size, hashes.length, id + ' continues adjusting density below the old minimum');
    }
    for (const watercolorWater of [0, 1]) {
      const result = line('watercolorDry', { textureScale: .05, textureDensity: .05, watercolorWater });
      assert.ok(result.stats.count > 0, 'Drybrush water extremes remain drawable at 5% texture settings');
    }
  });

  await test('Watercolor texture parameters distinguish an explicit zero from invalid fields', () => {
    for (const id of ids) {
      const normal = line(id).hash;
      for (const value of [undefined, null, '', '0', false, NaN, Infinity, -Infinity]) {
        assert.equal(line(id, { textureScale: value, textureDensity: value }).hash, normal,
          id + ' defaults invalid texture input ' + String(value));
      }
      assert.equal(line(id, { textureScale: -100, textureDensity: -100 }).hash,
        line(id, { textureScale: 0, textureDensity: 0 }).hash, id + ' clamps negative values to off');
      assert.equal(line(id, { textureScale: 1e100, textureDensity: 1e100 }).hash,
        line(id, { textureScale: 4, textureDensity: 2 }).hash, id + ' bounds large values');
      const tiny = line(id, { textureScale: Number.MIN_VALUE, textureDensity: Number.MIN_VALUE });
      assert.equal(tiny.hash, line(id, { textureScale: .01, textureDensity: .01 }).hash,
        id + ' avoids infinite texture sampling coordinates');
      assert.ok(tiny.stats.count > 0 && Object.values(tiny.bounds).every(Number.isFinite),
        id + ' remains drawable with tiny positive API values');
    }
  });

  await test('Existing watercolor texture values preserve pre-upgrade pixels', () => {
    if (!process.env.DRAWING_WATERCOLOR_BASELINE) return;
    const engineFile = path.resolve(__dirname, '../assets/drawing-studio/watercolor.js');
    const old = new Module(engineFile, module); old.filename = engineFile; old.paths = module.paths;
    old._compile(fs.readFileSync(process.env.DRAWING_WATERCOLOR_BASELINE, 'utf8'), engineFile);
    for (const id of ids) for (const [textureScale, textureDensity] of [[1, 1], [.25, .25], [.5, .75], [2, 1.5], [4, 2]]) {
      const options = { textureScale, textureDensity };
      assert.equal(line(id, options).hash, line(id, options, 1, old.exports).hash,
        id + ' preserves its existing ' + textureScale + '/' + textureDensity + ' result');
    }
  });

  await test('Ragged edges, watermarks and uneven pigment have independent pixel effects', () => {
    for (const id of ids) {
      const quiet = { watercolorEdge: 0, watercolorBloom: 0, watercolorVariation: 0 };
      const flat = line(id, quiet).hash;
      for (const key of effectKeys) {
        assert.notEqual(line(id, { ...quiet, [key]: 1 }).hash, flat, id + ' independently enables ' + key);
      }
    }
  });

  live = await openStudio(); const ui = uiFor(live);

  await test('Water controls appear only for watercolors and repaint the live sample', async () => {
    for (const id of ids) {
      await ui.fresh(id); assert.equal(ui.el('watercolorControls').hidden, false);
      assert.equal(ui.el('watercolorWater').disabled, false); assert.equal(ui.el('brushTextureControls').hidden, false);
      assert.equal(+ui.el('watercolorWater').value, Math.round(preset(id).watercolorWater * 100));
      for (const key of effectKeys) {
        assert.equal(ui.el(key).disabled, false, key);
        assert.equal(+ui.el(key).value, Math.round(preset(id)[key] * 100), id + ' default ' + key);
      }
    }
    await ui.fresh('watercolorWet');
    await eventually(() => inkStats(ui.el('brushPreview')).count > 0, 'The watercolor sample is rendered');
    await new Promise(resolve => ui.win.requestAnimationFrame(resolve));
    const before = hash(pixels(ui.el('brushPreview'))); ui.edit('watercolorWater', 10);
    await eventually(() => hash(pixels(ui.el('brushPreview'))) !== before, 'Water amount refreshes the actual sample');
    assert.equal(ui.el('watercolorWaterValue').textContent, '10%');
    assert.equal(ui.el('watercolorWater').getAttribute('aria-valuetext'), '10%');
    assert.equal(ui.app.inspect().size, 40, 'Water amount does not silently resize the brush');
    assert.equal(ui.app.inspect().opacity, 1, 'Water amount does not replace global concentration');
    for (const tool of ['eraser', 'fill', 'shape', 'text', 'hand']) {
      ui.tool(tool); assert.equal(ui.el('watercolorControls').hidden, true, tool);
      assert.equal(ui.el('watercolorWater').disabled, true, tool);
      for (const key of effectKeys) assert.equal(ui.el(key).disabled, true, tool + ' ' + key);
    }
    ui.tool('brush'); ui.edit('brushKind', 'gpen'); assert.equal(ui.el('watercolorControls').hidden, true);
    ui.edit('brushKind', 'haiguai-pencil-soft'); assert.equal(ui.el('watercolorControls').hidden, true);
    ui.edit('brushKind', 'watercolorWet'); ui.el('resetBrushProfile').click();
  });

  await test('Per-brush water amounts survive switching and restart, with independent reset', async () => {
    for (const [id, value] of [['watercolorWet', 90], ['watercolorGlaze', 30], ['watercolorDry', 5]]) {
      ui.edit('brushKind', id); ui.edit('watercolorWater', value);
    }
    await ui.app.newDocument({ width: 96, height: 96, paper: 'transparent' });
    for (const [id, value] of [['watercolorWet', 90], ['watercolorGlaze', 30], ['watercolorDry', 5]]) {
      ui.edit('brushKind', id); assert.equal(+ui.el('watercolorWater').value, value, id);
    }
    ui.edit('brushKind', 'watercolorGlaze'); ui.el('resetBrushProfile').click();
    assert.equal(+ui.el('watercolorWater').value, 40);
    ui.edit('brushKind', 'watercolorWet'); assert.equal(+ui.el('watercolorWater').value, 90);
    const saved = Object.fromEntries(Array.from({ length: ui.win.localStorage.length }, (_, i) => {
      const key = ui.win.localStorage.key(i); return [key, ui.win.localStorage.getItem(key)];
    }));
    const restarted = await extraStudio(win => { for (const [key, value] of Object.entries(saved)) win.localStorage.setItem(key, value); });
    for (const [id, value] of [['watercolorWet', 90], ['watercolorGlaze', 40], ['watercolorDry', 5]]) {
      restarted.edit('brushKind', id); assert.equal(+restarted.el('watercolorWater').value, value, id + ' restart');
    }
    closeExtra(restarted);
    for (const id of ids) { ui.edit('brushKind', id); ui.el('resetBrushProfile').click(); }
  });

  await test('Watercolor effect controls keep independent values and reset only the selected brush', async () => {
    await ui.fresh('watercolorWet');
    for (const [key, value] of [['watercolorWater', 20], ['watercolorEdge', 80], ['watercolorBloom', 10], ['watercolorVariation', 60]])
      ui.edit(key, value);
    ui.edit('watercolorEdge', 25);
    for (const [key, value] of [['watercolorWater', 20], ['watercolorEdge', 25], ['watercolorBloom', 10], ['watercolorVariation', 60]])
      assert.equal(+ui.el(key).value, value, key + ' remains independent');
    ui.edit('brushKind', 'watercolorGlaze');
    for (const key of effectKeys) ui.edit(key, 0);
    ui.edit('brushKind', 'watercolorWet');
    for (const [key, value] of [['watercolorEdge', 25], ['watercolorBloom', 10], ['watercolorVariation', 60]])
      assert.equal(+ui.el(key).value, value, key + ' is remembered per brush');
    ui.el('resetBrushProfile').click();
    for (const key of ['watercolorWater', ...effectKeys])
      assert.equal(+ui.el(key).value, Math.round(preset('watercolorWet')[key] * 100), key + ' resets to its recommendation');
    ui.edit('brushKind', 'watercolorGlaze');
    for (const key of effectKeys) assert.equal(+ui.el(key).value, 0, 'Resetting wet brush cannot change ' + key + ' on dry glaze');
    ui.el('resetBrushProfile').click();
  });
  await test('The brush selector exposes all watercolors and keeps lower layers isolated', async () => {
    for (const id of ids) assert.ok(Array.from(ui.el('brushKind').options).some(o => o.value === id), id);
    await ui.fresh('watercolorWet');
    const lower = ui.active(), lowerCtx = lower.canvas.getContext('2d');
    lowerCtx.fillStyle = '#18d548'; lowerCtx.fillRect(0, 0, 192, 128);
    const lowerHash = hash(pixels(lower.canvas)); ui.app.addLayer();
    ui.stroke([[24, 64], [170, 64]]);
    assert.equal(hash(pixels(lower.canvas)), lowerHash, 'Wet paint cannot pick up or alter another layer');
    const painted = regionColor(ui.active().canvas, 67, 61);
    assert.ok(painted[0] > painted[1] * 1.5 && painted[3] > 0, 'An empty upper layer receives the chosen pigment: ' + JSON.stringify(painted));
    assert.equal(pixel(ui.active().canvas, 4, 4)[3], 0, 'Wet paint preserves upper-layer transparency');
  });

  await test('Wet watercolor mixes previous pen-downs and undo/redo restores exact RGBA', async () => {
    await ui.fresh('watercolorWet');
    ui.edit('inkColor', '#eab934'); ui.stroke([[24, 64], [169, 64]]);
    const yellow = hash(pixels(ui.active().canvas)), originalCrossing = pixel(ui.active().canvas, 96, 64);
    const outside = pixel(ui.active().canvas, 35, 64);
    ui.edit('inkColor', '#2456bc'); const history = ui.app.inspect().history;
    ui.stroke([[96, 22], [96, 106]]);
    const blended = hash(pixels(ui.active().canvas)), crossing = pixel(ui.active().canvas, 96, 64);
    assert.notDeepEqual(crossing, originalCrossing, 'The wet intersection changes the previous yellow');
    assert.ok(crossing[3] > 0 && crossing[1] > crossing[0], 'Yellow and blue produce a chromatic green-leaning blend');
    const blueOnly = native.createCanvas(192, 128);
    paint(blueOnly, 'watercolorWet', [point(96, 22), point(96, 106, 400)], { color: '#2456bc',
      watercolorWater: +ui.el('watercolorWater').value / 100,
      ...Object.fromEntries(effectKeys.map(key => [key, +ui.el(key).value / 100])) });
    assert.ok(crossing[3] <= Math.max(originalCrossing[3], pixel(blueOnly, 96, 64)[3]) + 3,
      'A wet intersection blends pigment instead of adding a dry transparent layer');
    assert.deepEqual(pixel(ui.active().canvas, 35, 64), outside, 'Remote pigment remains untouched');
    assert.equal(ui.app.inspect().history, history + 1, 'One complete wet stroke is one undo entry');
    assert.equal(ui.app.inspect().strokeCount, 0, 'Mixed pixels are not mislabeled as independent erasable strokes');
    ui.app.undo(); assert.equal(hash(pixels(ui.active().canvas)), yellow);
    ui.app.redo(); assert.equal(hash(pixels(ui.active().canvas)), blended);
  });

  await test('Global concentration is applied once and dry strokes keep whole-stroke provenance', async () => {
    for (const id of ids) {
      await ui.fresh(id); ui.edit('brushOpacity', 50);
      ui.stroke([[24, 64], [168, 64], [24, 64], [168, 64]]);
      assert.ok(inkStats(ui.active().canvas).maxAlpha <= 128, id + ' does not multiply opacity at each stamp');
      if (id === 'watercolorWet') continue;
      assert.equal(ui.app.inspect().strokeCount, 1, id + ' preserves one pen-down identity');
      const before = hash(pixels(ui.active().canvas)); ui.tool('eraser'); ui.edit('eraserMode', 'stroke');
      ui.edit('brushSize', 8); ui.stroke([[80, 64]]);
      assert.equal(inkStats(ui.active().canvas).count, 0, id + ' can be erased as a complete stroke');
      ui.app.undo(); assert.equal(hash(pixels(ui.active().canvas)), before);
    }
  });

  await test('Wet mixing uses restored pixels after erase, project reload and new artwork', async () => {
    await ui.fresh('watercolorWet'); ui.edit('inkColor', '#eab934'); ui.stroke([[24, 64], [168, 64]]);
    const saved = await ui.app.serializeProject(), savedHash = hash(pixels(ui.active().canvas));
    ui.edit('inkColor', '#2456bc'); ui.stroke([[96, 22], [96, 106]]);
    const expected = hash(pixels(ui.active().canvas));
    await ui.app.loadProject(saved); assert.equal(hash(pixels(ui.active().canvas)), savedHash);
    assert.equal(ui.app.inspect().brush, 'watercolorWet');
    ui.edit('inkColor', '#2456bc'); ui.stroke([[96, 22], [96, 106]]);
    assert.equal(hash(pixels(ui.active().canvas)), expected, 'Reopened pigments mix exactly like the same current pixels');
    ui.tool('eraser'); ui.edit('eraserMode', 'local'); ui.edit('brushSize', 60); ui.edit('brushOpacity', 100); ui.stroke([[96, 64]]);
    assert.equal(pixel(ui.active().canvas, 96, 64)[3], 0);
    ui.tool('brush'); ui.edit('inkColor', '#c04430'); ui.stroke([[90, 64], [102, 64]]);
    const red = pixel(ui.active().canvas, 96, 64);
    assert.ok(red[0] > red[1], 'A cleared center cannot resurrect cached yellow or blue pigment');
    await ui.fresh('watercolorWet'); ui.edit('inkColor', '#2456bc'); ui.stroke([[96, 22], [96, 106]]);
    const blue = pixel(ui.active().canvas, 96, 64);
    assert.ok(blue[2] > blue[0] * 1.5, 'New artwork has no pigment carried from the previous document');
  });

  await test('Watercolor settings and pixels survive a portable project round trip', async () => {
    for (const id of ids) {
      await ui.fresh(id); ui.edit('brushSize', 47); ui.edit('brushOpacity', 63);
      ui.edit('watercolorWater', 85);
      ui.edit('watercolorEdge', 25); ui.edit('watercolorBloom', 80); ui.edit('watercolorVariation', 55);
      if (preset(id).textureControls) {
        ui.edit('brushTextureScale', 175); ui.edit('brushTextureDensity', 75);
      }
      ui.stroke([[25, 50], [155, 80]]);
      const before = hash(pixels(ui.active().canvas)), count = ui.app.inspect().strokeCount;
      const project = await ui.app.serializeProject();
      await ui.app.newDocument({ width: 64, height: 64, paper: 'transparent' }); await ui.app.loadProject(project);
      assert.equal(hash(pixels(ui.active().canvas)), before, id);
      assert.equal(ui.app.inspect().brush, id); assert.equal(ui.app.inspect().size, 47);
      assert.equal(ui.app.inspect().opacity, .63); assert.equal(ui.app.inspect().strokeCount, count);
      assert.equal(+ui.el('watercolorWater').value, 85);
      assert.deepEqual(effectKeys.map(key => +ui.el(key).value), [25, 80, 55]);
    }
  });

  await test('Portable water settings transfer to a clean device while local brush choices retain priority', async () => {
    await ui.fresh('watercolorGlaze'); ui.edit('watercolorWater', 65); ui.stroke([[25, 64], [165, 64]]);
    const saved = JSON.parse(await ui.app.exportProject()); assert.equal(saved.settings.watercolorWater, .65);
    const other = await extraStudio(); await other.app.loadProject(saved);
    assert.equal(+other.el('watercolorWater').value, 65);
    other.edit('watercolorWater', 20); await other.app.loadProject(saved);
    assert.equal(+other.el('watercolorWater').value, 20, 'Existing device settings win over an imported project');
    assert.equal((await other.app.serializeProject()).settings.watercolorWater, .2); closeExtra(other);
    for (const id of ids) {
      const legacy = structuredClone(saved); legacy.settings.brush = id; delete legacy.settings.watercolorWater;
      const clean = await extraStudio(); await clean.app.loadProject(legacy);
      assert.equal(+clean.el('watercolorWater').value, Math.round(preset(id).watercolorWater * 100), id + ' missing setting uses preset');
      closeExtra(clean);
    }
  });

  await test('Untrusted project water amounts normalize to safe bounds or their brush default', async () => {
    const saved = JSON.parse(await ui.app.exportProject()); saved.settings.brush = 'watercolorWet';
    for (const [value, expected] of [[-1000, 0], [1000, 100], ['invalid', 70], [null, 70], [.478, 50]]) {
      const clean = await extraStudio(); saved.settings.watercolorWater = value; await clean.app.loadProject(saved);
      assert.equal(+clean.el('watercolorWater').value, expected, String(value)); closeExtra(clean);
    }
  });

  await test('Effect settings transfer to a clean device, with bounded legacy and malformed inputs', async () => {
    await ui.fresh('watercolorWet');
    ui.edit('watercolorEdge', 15); ui.edit('watercolorBloom', 75); ui.edit('watercolorVariation', 90);
    const saved = JSON.parse(await ui.app.exportProject());
    assert.deepEqual(effectKeys.map(key => saved.settings[key]), [.15, .75, .9]);
    const other = await extraStudio(); await other.app.loadProject(saved);
    assert.deepEqual(effectKeys.map(key => +other.el(key).value), [15, 75, 90]);
    other.edit('watercolorBloom', 0); await other.app.loadProject(saved);
    assert.deepEqual(effectKeys.map(key => +other.el(key).value), [15, 0, 90], 'Existing independent device choices remain');
    closeExtra(other);
    const legacy = structuredClone(saved); for (const key of effectKeys) delete legacy.settings[key];
    const clean = await extraStudio(); await clean.app.loadProject(legacy);
    assert.deepEqual(effectKeys.map(key => +clean.el(key).value), effectKeys.map(key => Math.round(preset('watercolorWet')[key] * 100)));
    closeExtra(clean);
    for (const [values, expected] of [[[-99, 99, .478], [0, 100, 50]], [['bad', null, false],
      effectKeys.map(key => Math.round(preset('watercolorWet')[key] * 100))]]) {
      const target = await extraStudio(); effectKeys.forEach((key, i) => { saved.settings[key] = values[i]; });
      await target.app.loadProject(saved); assert.deepEqual(effectKeys.map(key => +target.el(key).value), expected);
      closeExtra(target);
    }
  });

  assert.deepEqual(errors, [], 'No Canvas/DOM resource or runtime errors');
  console.log('Watercolor regressions passed: ' + passed);
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; })
  .finally(() => { if (live) live.window.close(); for (const dom of extraWindows) dom.window.close(); });
