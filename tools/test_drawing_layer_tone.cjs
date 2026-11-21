/* Real DOM/native-Canvas regressions for non-destructive layer/global tone.
 * NODE_PATH=/path/to/jsdom-and-fake-indexeddb:/path/to/runtime/node_modules node tools/test_drawing_layer_tone.cjs
 * Reuses the local harness without running its unrelated suite or starting a browser.
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
const harness = new Module(harnessFile, module); harness.filename = harnessFile; harness.paths = module.paths;
harness._compile(source.slice(0, boundary) + '\nmodule.exports = { openStudio, errors, pixel, pixels, hash, decoded };', harnessFile);
const { openStudio, errors, pixel, pixels, hash, decoded } = harness.exports;
const neutral = () => ({ hue: 0, saturation: 0, lightness: 0 });
const plain = value => JSON.parse(JSON.stringify(value));
let passed = 0, dom;
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
function records(records) {
  if (!records) return null;
  const tiles = values => Array.from(values, ([key, tile]) => ({ key, x: tile.x, y: tile.y,
    width: tile.width, height: tile.height, bytes: hash(Buffer.from(tile.image.data)) }));
  return { width: records.width, height: records.height, base: tiles(records.base),
    operations: Array.from(records.operations, op => ({ id: op.id, kind: op.kind, opacity: op.opacity, tiles: tiles(op.tiles) })) };
}
function alpha(canvas) {
  const data = pixels(canvas), out = Buffer.alloc(data.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + 3];
  return out;
}

async function main() {
  dom = await openStudio();
  const win = dom.window, doc = win.document, app = win.DrawingStudio;
  const el = id => { const value = doc.getElementById(id); assert.ok(value, id); return value; };
  const state = () => plain(app.inspect()), active = () => app.getLayer(state().activeId);
  const tool = name => doc.querySelector('[data-tool="' + name + '"]').click();
  function input(id, value) {
    const field = el(id); if (field.type === 'checkbox') field.checked = value; else field.value = String(value);
    field.dispatchEvent(new win.Event('input', { bubbles: true }));
  }
  const change = id => el(id).dispatchEvent(new win.Event('change', { bubbles: true }));
  const edit = (id, value) => { input(id, value); change(id); };
  const scope = value => edit('toneScope', value);
  const tone = values => { for (const [key, value] of Object.entries(values)) edit(key, value); app.render(); };
  const controls = () => Object.fromEntries(['hue', 'saturation', 'lightness'].map(key => [key, Number(el(key).value)]));
  function pointer(type, x, y) {
    const canvas = el('drawingCanvas'), rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true,
      pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0,
      buttons: type === 'pointerup' ? 0 : 1, pressure: type === 'pointerup' ? 0 : .5,
      clientX: rect.left + x / canvas.width * rect.width, clientY: rect.top + y / canvas.height * rect.height }));
  }
  function stroke(points) {
    pointer('pointerdown', ...points[0]); points.slice(1).forEach(point => pointer('pointermove', ...point));
    pointer('pointerup', ...points[points.length - 1]); app.render();
  }
  function paint(layer, color, x, y, width, height) {
    const ctx = layer.canvas.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(x, y, width, height);
  }
  async function fresh() {
    await app.newDocument({ width: 96, height: 80, title: '图层调色回归', paper: 'custom', paperColor: '#f6edcf', paperOpacity: 70, paperTexture: 'none' });
    tool('brush'); edit('brushKind', 'binary'); edit('brushSize', 6); edit('brushOpacity', 100);
    edit('stabilizer', 0); edit('inkColor', '#406080'); scope('all');
  }
  async function separated() {
    await fresh(); const a = active();
    paint(a, '#406080', 8, 12, 28, 28); paint(a, 'rgba(64,96,128,0.5)', 8, 44, 28, 16);
    stroke([[12, 32], [32, 32]]);
    app.addLayer(); const b = active(); paint(b, '#b06030', 56, 12, 28, 28);
    edit('inkColor', '#b06030'); stroke([[60, 32], [80, 32]]); app.render();
    return { a, b };
  }
  const raster = async (transparent = true) => (await decoded(await app.exportRaster('png', transparent))).canvas;
  function capture() {
    app.render(); const s = state();
    return { activeId: s.activeId, tone: s.tone, paper: s.paper, paperColor: s.paperColor, paperOpacity: s.paperOpacity,
      layers: s.layers.map(meta => { const layer = app.getLayer(meta.id); return { ...meta,
        pixels: hash(pixels(layer.canvas)), records: records(layer.strokeRecords) }; }), display: hash(pixels(el('drawingCanvas'))) };
  }

  await test('Current-layer tone changes only its rendered colors, retaining paper, alpha, raw pixels and stroke records', async () => {
    const { a, b } = await separated(); app.selectLayer(a.id); scope('current');
    const baseline = await raster(), onPaper = await raster(false), original = capture();
    const aCanvas = a.canvas, bCanvas = b.canvas, aRecords = a.strokeRecords, bRecords = b.strokeRecords;
    tone({ lightness: 50 }); const adjusted = await raster();
    assert.deepEqual(pixel(adjusted, 20, 20), [96, 144, 192, 255]);
    assert.deepEqual(pixel(adjusted, 65, 20), pixel(baseline, 65, 20));
    assert.deepEqual(alpha(adjusted), alpha(baseline));
    assert.deepEqual(pixel(await raster(false), 0, 0), pixel(onPaper, 0, 0));
    assert.deepEqual(state().tone, neutral()); assert.deepEqual(plain(app.getLayer(b.id).tone), neutral());
    tone({ hue: 43, saturation: -28 }); assert.notEqual(hash(pixels(await raster())), hash(pixels(adjusted)));
    for (const [layer, canvas, record] of [[a, aCanvas, aRecords], [b, bCanvas, bRecords]]) {
      const current = app.getLayer(layer.id), before = original.layers.find(item => item.id === layer.id);
      assert.equal(current.canvas, canvas); assert.equal(current.strokeRecords, record);
      assert.equal(hash(pixels(current.canvas)), before.pixels); assert.deepEqual(records(current.strokeRecords), before.records);
    }
    el('resetTone').click(); assert.equal(hash(pixels(await raster())), hash(pixels(baseline)));
    assert.deepEqual(plain(active().tone), neutral());
  });

  await test('Global tone still adjusts the composited artwork once, excluding paper and preserving transparency', async () => {
    await fresh(); paint(active(), '#c83228', 8, 8, 64, 50);
    app.addLayer(); paint(active(), 'rgba(40,200,60,0.5)', 24, 20, 50, 40); app.render();
    const before = await raster(), paperBefore = pixel(await raster(false), 0, 0);
    const overlap = pixel(before, 40, 32); scope('all'); tone({ lightness: 100 });
    const after = await raster();
    assert.deepEqual(pixel(after, 40, 32), overlap.map((value, i) => i === 3 ? value : Math.min(255, value * 2)),
      'Brightening before blending would clip the separate layers and produce different overlap colors');
    assert.deepEqual(alpha(after), alpha(before)); assert.deepEqual(pixel(await raster(false), 0, 0), paperBefore);
    assert.equal(state().tone.lightness, 100);
    for (const layer of state().layers) assert.deepEqual(layer.tone, neutral());
  });

  await test('Selecting layers and scope synchronizes the controls; reset affects only the chosen scope', async () => {
    const { a, b } = await separated(); const aTone = { hue: 23, saturation: -10, lightness: 12 };
    const bTone = { hue: -41, saturation: 15, lightness: -6 }, globalTone = { hue: 34, saturation: 12, lightness: 20 };
    scope('current'); app.selectLayer(a.id); tone(aTone); app.selectLayer(b.id); tone(bTone);
    scope('all'); tone(globalTone); app.selectLayer(a.id); assert.deepEqual(controls(), globalTone);
    scope('current'); assert.deepEqual(controls(), aTone); assert.equal(state().toneScope, 'current');
    app.selectLayer(b.id); assert.deepEqual(controls(), bTone);
    el('resetTone').click(); assert.deepEqual(controls(), neutral()); assert.deepEqual(plain(active().tone), neutral());
    assert.deepEqual(plain(app.getLayer(a.id).tone), aTone); assert.deepEqual(state().tone, globalTone);
    scope('all'); assert.deepEqual(controls(), globalTone); el('resetTone').click();
    assert.deepEqual(state().tone, neutral()); assert.deepEqual(plain(app.getLayer(a.id).tone), aTone);
  });

  await test('Tone gestures keep immutable prior values and exact undo/redo across layer or scope switches', async () => {
    const { a, b } = await separated(); app.selectLayer(a.id); scope('current');
    tone({ hue: 15, saturation: -10, lightness: 7 }); const before = capture(), priorTone = active().tone, priorValue = plain(priorTone);
    const history = state().history; input('hue', 41); input('hue', 63); change('hue'); const after = capture();
    assert.equal(state().history, history + 1); assert.deepEqual(plain(priorTone), priorValue);
    app.undo(); assert.deepEqual(capture(), before); assert.deepEqual(controls(), priorValue);
    app.redo(); assert.deepEqual(capture(), after);
    input('lightness', 22); app.selectLayer(b.id); assert.deepEqual(controls(), neutral());
    tone({ hue: -38 }); app.undo();
    assert.deepEqual(plain(app.getLayer(b.id).tone), neutral()); assert.equal(app.getLayer(a.id).tone.lightness, 22);
    app.undo(); assert.equal(app.getLayer(a.id).tone.lightness, 7);
    app.selectLayer(a.id); input('saturation', 18); scope('all'); assert.deepEqual(controls(), neutral());
    tone({ lightness: 11 }); app.undo(); assert.deepEqual(state().tone, neutral()); assert.equal(app.getLayer(a.id).tone.saturation, 18);
    app.undo(); assert.equal(app.getLayer(a.id).tone.saturation, -10); assert.equal(state().toneScope, 'all', 'Scope selection itself is not artwork undo');
  });

  await test('Copied layer tone is independent while both raw canvases and recorded strokes remain intact', async () => {
    const { a } = await separated(); app.selectLayer(a.id); scope('current'); tone({ hue: 24, saturation: -35, lightness: 7 });
    const sourceTone = plain(a.tone), raw = hash(pixels(a.canvas)), provenance = records(a.strokeRecords);
    el('duplicateLayer').click(); const copy = active(); assert.notEqual(copy.id, a.id); assert.notEqual(copy.canvas, a.canvas);
    assert.notEqual(copy.tone, app.getLayer(a.id).tone); assert.deepEqual(plain(copy.tone), sourceTone);
    tone({ hue: -75, lightness: 31 }); const copiedTone = plain(active().tone);
    assert.deepEqual(plain(app.getLayer(a.id).tone), sourceTone);
    app.selectLayer(a.id); tone({ saturation: 45 }); assert.deepEqual(plain(app.getLayer(copy.id).tone), copiedTone);
    for (const id of [a.id, copy.id]) {
      assert.equal(hash(pixels(app.getLayer(id).canvas)), raw); assert.deepEqual(records(app.getLayer(id).strokeRecords), provenance);
    }
  });

  await test('Merge bakes both layer tones and transforms once, stays globally editable, and undoes losslessly', async () => {
    await fresh(); const lower = active(); paint(lower, 'rgba(100,70,30,0.65)', 8, 12, 40, 24);
    edit('inkColor', '#c04a2a'); edit('brushOpacity', 45); stroke([[12, 28], [60, 28]]);
    Object.assign(lower, { x: 6, y: 5, scale: 1.25, opacity: .65 });
    scope('current'); tone({ hue: 33, saturation: -20, lightness: 18 });
    app.addLayer(); const upper = active(); paint(upper, 'rgba(20,90,180,0.7)', 20, 22, 40, 30);
    edit('inkColor', '#185ed0'); edit('brushOpacity', 80); stroke([[40, 10], [40, 64]]);
    Object.assign(upper, { x: 8, y: 10, scale: .75, opacity: .55 }); tone({ hue: -52, saturation: 16, lightness: -8 });
    app.addLayer(); const other = active(); edit('inkColor', '#1ca065'); edit('brushOpacity', 100); stroke([[78, 68], [89, 68]]);
    const withoutGlobal = hash(pixels(await raster()));
    scope('all'); tone({ hue: 29, saturation: -12, lightness: 8 });
    app.selectLayer(upper.id); scope('current'); const before = capture(), global = state().tone;
    const png = hash(pixels(await raster())), paper = hash(pixels(await raster(false))), history = state().history;
    el('mergeLayerDown').click(); const merged = capture();
    assert.equal(state().layers.length, 2); assert.equal(active().id, upper.id);
    assert.deepEqual(plain(active().tone), neutral()); assert.deepEqual(controls(), neutral()); assert.deepEqual(state().tone, global);
    assert.equal(active().strokeRecords, null); assert.equal(pixel(active().canvas, 0, 0)[3], 0);
    assert.equal(pixel(active().canvas, 84, 68)[3], 0, 'Unrelated layer is not baked into the pair');
    assert.equal(hash(pixels(await raster())), png); assert.equal(hash(pixels(await raster(false))), paper);
    assert.equal(state().history, history + 1);
    app.undo(); assert.deepEqual(capture(), before);
    app.redo(); assert.deepEqual(capture(), merged);
    assert.deepEqual(capture().layers.find(layer => layer.id === other.id), before.layers.find(layer => layer.id === other.id));
    scope('all'); el('resetTone').click(); assert.equal(hash(pixels(await raster())), withoutGlobal, 'Global correction was never baked into the merged pixels');
  });

  await test('Legacy projects default missing layer tones to zero; new tone/scope metadata and pixels round-trip', async () => {
    const { a, b } = await separated(); scope('all'); tone({ hue: 17, saturation: 15, lightness: 3 });
    const original = capture(), legacy = JSON.parse(await app.exportProject());
    legacy.layers.forEach(layer => { delete layer.tone; }); delete legacy.settings.toneScope;
    scope('current'); await app.loadProject(legacy);
    assert.equal(state().toneScope, 'all'); assert.deepEqual(capture(), original);
    for (const layer of state().layers) assert.deepEqual(layer.tone, neutral());
    scope('current'); app.selectLayer(a.id); tone({ hue: -10, saturation: 3, lightness: 8 });
    app.selectLayer(b.id); tone({ hue: 33, saturation: 12, lightness: 9 }); const updated = capture();
    const saved = JSON.parse(await app.exportProject()); assert.equal(saved.settings.toneScope, 'current');
    assert.deepEqual(saved.layers.find(layer => layer.id === a.id).tone, { hue: -10, saturation: 3, lightness: 8 });
    await app.loadProject(saved); assert.equal(state().toneScope, 'current'); assert.deepEqual(capture(), updated);
    assert.deepEqual(controls(), { hue: 33, saturation: 12, lightness: 9 });
    const portable = await app.serializeProject(), prior = plain(active().tone);
    portable.layers.find(layer => layer.id === active().id).tone.hue = -179;
    assert.deepEqual(plain(active().tone), prior, 'Serialized metadata must not alias mutable live tone');
  });

  await test('Fill-palette shortcut picks the actual foreground while preserving tool, lasso scope and background', async () => {
    await fresh(); tool('fill'); edit('fillScope', 'lasso'); edit('materialFollowInk', false);
    edit('materialForeground', '#5a7ab3'); edit('materialBackground', '#f0ead2');
    const width = win.innerWidth;
    Object.defineProperty(win, 'innerWidth', { configurable: true, value: 600 });
    try {
      el('fillPalette').click(); assert.equal(el('paletteLibrary').hidden, false);
      assert.equal(el('paletteLibrary').closest('details').open, true); assert.equal(doc.body.classList.contains('settings-hidden'), false);
      const swatch = doc.querySelector('#presetSwatches button[data-color]') || doc.querySelector('#baseSwatches button[data-color]');
      assert.ok(swatch); const chosen = swatch.dataset.color.toLowerCase(); swatch.click();
      assert.equal(state().tool, 'fill'); assert.equal(el('fillScope').value, 'lasso');
      assert.equal(state().ink, chosen); assert.equal(el('materialFollowInk').checked, true);
      assert.equal(el('materialForeground').value, chosen); assert.equal(el('materialBackground').value, '#f0ead2');
      assert.equal(doc.body.classList.contains('settings-hidden'), true);
    } finally { Object.defineProperty(win, 'innerWidth', { configurable: true, value: width }); }
  });

  await test('Canvas without native filter uses bounded real pixel strips, preserves raw data/alpha and still merges correctly', async () => {
    const tracked = new Set(), reads = []; let measuring = false;
    const fallback = await openStudio(undefined, window => {
      const proto = window.HTMLCanvasElement.prototype, original = proto.getContext, wrapped = new WeakMap();
      proto.getContext = function (type, ...args) {
        const context = original.call(this, type, ...args); if (!context) return context;
        if (!wrapped.has(context)) wrapped.set(context, new Proxy(context, {
          get(target, key) {
            if (key === 'filter') return undefined;
            if (key === 'getImageData') return (x, y, width, height, ...rest) => {
              if (measuring && tracked.has(target.canvas)) reads.push({ canvas: target.canvas, y, height });
              return target.getImageData(x, y, width, height, ...rest);
            };
            return Reflect.get(target, key);
          },
          set(target, key, value) {
            assert.notEqual(key, 'filter', 'The fallback must not silently use a native filter');
            return Reflect.set(target, key, value);
          }
        }));
        return wrapped.get(context);
      };
    });
    try {
      const f = fallback.window.DrawingStudio, document = fallback.window.document;
      const field = id => document.getElementById(id);
      function editFallback(id, value) {
        field(id).value = String(value);
        field(id).dispatchEvent(new fallback.window.Event('input', { bubbles: true }));
        field(id).dispatchEvent(new fallback.window.Event('change', { bubbles: true }));
      }
      const png = async () => (await decoded(await f.exportRaster('png', true))).canvas;
      await f.newDocument({ width: 64, height: 272, paper: 'transparent', title: '无原生滤镜' });
      const a = f.getLayer(f.inspect().activeId); paint(a, '#406080', 4, 4, 24, 264);
      f.addLayer(); const b = f.getLayer(f.inspect().activeId); paint(b, 'rgba(96,48,24,0.5)', 36, 4, 24, 264);
      tracked.add(a.canvas); tracked.add(b.canvas);
      const rawA = hash(pixels(a.canvas)), rawB = hash(pixels(b.canvas)), original = await png();
      f.setToneScope('current'); f.selectLayer(a.id); editFallback('lightness', 50);
      f.selectLayer(b.id); editFallback('hue', -20); editFallback('saturation', 10);
      measuring = true; f.render(); measuring = false;
      assert.ok(reads.length >= 6); assert.ok(reads.every(read => read.height <= 128));
      for (const canvas of tracked) assert.ok(reads.some(read => read.canvas === canvas && read.y + read.height === 272), 'The last short strip is rendered too');
      const adjusted = await png();
      for (const y of [20, 150, 260]) assert.deepEqual(pixel(adjusted, 16, y), [96, 144, 192, 255]);
      assert.deepEqual(alpha(adjusted), alpha(original));
      assert.equal(hash(pixels(a.canvas)), rawA); assert.equal(hash(pixels(b.canvas)), rawB);
      f.setToneScope('all'); editFallback('hue', 27); editFallback('lightness', 12);
      const beforeMerge = hash(pixels(await png())); f.selectLayer(b.id); f.mergeLayerDown();
      assert.deepEqual(plain(f.getLayer(f.inspect().activeId).tone), neutral());
      assert.equal(hash(pixels(await png())), beforeMerge);
      f.undo(); assert.equal(hash(pixels(f.getLayer(a.id).canvas)), rawA); assert.equal(hash(pixels(f.getLayer(b.id).canvas)), rawB);
      field('resetTone').click(); f.setToneScope('current');
      f.selectLayer(a.id); field('resetTone').click(); f.selectLayer(b.id); field('resetTone').click();
      reads.length = 0; measuring = true; f.render(); measuring = false;
      assert.equal(reads.length, 0, 'Neutral layers do not retain a CPU filtering workload');
      assert.equal(hash(pixels(await png())), hash(pixels(original)));
    } finally { measuring = false; fallback.window.close(); }
  });

  assert.deepEqual(errors, [], 'No page/resource errors during layer tone regressions');
  console.log('\n' + passed + ' layer-tone/palette regressions passed (DOM/native Canvas; not browser or device validation).');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom?.window.close());
