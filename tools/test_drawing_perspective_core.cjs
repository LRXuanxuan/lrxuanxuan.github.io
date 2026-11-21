/* Development-only real Canvas tests for bounded projective shape rendering. */
'use strict';
const assert = require('node:assert/strict');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const Marks = require('../assets/drawing-studio/marks.js');
const Records = require('../assets/drawing-studio/stroke-records.js');
const context = canvas => canvas.getContext('2d');
const pixel = (canvas, x, y) => Array.from(context(canvas).getImageData(x, y, 1, 1).data);
const pixels = canvas => Buffer.from(context(canvas).getImageData(0, 0, canvas.width, canvas.height).data);
const quad = () => [{ x: 32, y: 16 }, { x: 160, y: 16 }, { x: 128, y: 144 }, { x: 64, y: 144 }];
const options = (extra = {}) => ({ type: 'rect', x: 0, y: 0, width: 128, height: 128, constrain: false,
  fill: { kind: 'solid', foreground: '#ff00ff', background: '#ffffff', spacing: 12, thickness: 3, angle: 0, transparentBackground: false },
  stroke: null, strokeWidth: 2, frameColor: '#31536f', frameAccent: '#d8b488', frameWidth: 12, opacity: 1, quad: quad(), ...extra });
function image(shape, renderOptions, width = 192, height = 170) {
  const canvas = createCanvas(width, height), bounds = Marks.paintShape(context(canvas), shape, renderOptions);
  return { canvas, bounds };
}
function assertCovered(canvas, bounds) {
  assert.ok(bounds); const rgba = pixels(canvas);
  let total = 0;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (rgba[(y * canvas.width + x) * 4 + 3]) {
    total++; assert.ok(x >= bounds.x && y >= bounds.y && x < bounds.x + bounds.width && y < bounds.y + bounds.height,
      'All painted pixels belong to the returned undo rectangle');
  }
  assert.ok(total > 0); return total;
}
function append(layer, id, shape) {
  const drawn = image(shape, undefined, layer.canvas.width, layer.canvas.height);
  layer.strokeRecords = Records.append(layer.strokeRecords, layer.canvas, drawn.canvas, drawn.bounds, { id, kind: 'overlay', shape, opacity: 1 });
  assert.ok(layer.strokeRecords); context(layer.canvas).drawImage(drawn.canvas, 0, 0); return drawn;
}
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
async function main() {
  await test('Quad validation rejects folds, degeneracy, unbounded coordinates and non-numeric values', () => {
    assert.equal(Marks.validQuad(quad()), true); assert.equal(Marks.validQuad(quad().reverse()), true);
    const bad = [[], quad().slice(1), [quad()[0], quad()[2], quad()[1], quad()[3]],
      [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 3 }, { x: 0, y: 10 }],
      [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 0, y: 10 }],
      quad().map((p, i) => i ? p : { x: Infinity, y: 0 }), quad().map((p, i) => i ? p : { x: 70000, y: 0 }),
      quad().map((p, i) => i ? p : { x: '32', y: 16 })];
    for (const q of bad) { assert.equal(Marks.validQuad(q), false); assert.equal(Records.normalizeShape(options({ quad: q })), null); }
    assert.equal(Records.normalizeShape(options({ type: 'line' })), null);
  });
  await test('True homography maps the source midline projectively rather than by bilinear corner averaging', () => {
    // For this trapezoid, v maps to Y=(272v+16)/(1+v); v=.5 is at
    // Y=101.333..., while averaging the four destination corners gives Y=80.
    const gradient = options({ fill: { kind: 'linear', foreground: '#000000', background: '#ffffff', angle: 90 } });
    const drawn = image(gradient); assertCovered(drawn.canvas, drawn.bounds);
    assert.ok(Math.abs(pixel(drawn.canvas, 96, 101)[0] - 128) <= 2);
    assert.ok(Math.abs(pixel(drawn.canvas, 96, 80)[0] - 86) <= 2);
    assert.equal(pixel(drawn.canvas, 10, 80)[3], 0);
  });
  await test('An ellipse projects to a smooth tilted plane with transparent exterior and no dark fringes', () => {
    const drawn = image(options({ type: 'ellipse' })); assertCovered(drawn.canvas, drawn.bounds);
    assert.equal(pixel(drawn.canvas, 96, 101)[3], 255);
    assert.equal(pixel(drawn.canvas, 51, 101)[3], 0); assert.equal(pixel(drawn.canvas, 140, 101)[3], 0);
    assert.ok(pixel(drawn.canvas, 56, 101)[3] > 240); assert.ok(pixel(drawn.canvas, 136, 101)[3] > 240);
    assert.equal(pixel(drawn.canvas, 34, 18)[3], 0, 'The ellipse does not fill its perspective frame corners');
    const rgba = pixels(drawn.canvas); let softened = 0;
    for (let i = 0; i < rgba.length; i += 4) if (rgba[i + 3] > 12 && rgba[i + 3] < 244) {
      softened++; assert.ok(rgba[i] >= 250 && rgba[i + 1] <= 2 && rgba[i + 2] >= 250, 'Interpolation uses premultiplied color');
    }
    assert.ok(softened > 20, 'The projected curve retains antialias coverage');
  });
  await test('Every closed geometry and all four decorative frames use the same warp and retain their bounds', () => {
    const types = ['rect', 'roundRect', 'ellipse', 'triangle', 'diamond', 'hexagon', 'pentagon', 'octagon', 'parallelogram',
      'trapezoid', 'star', 'heart', 'sparkle', 'bolt', 'cloud', 'drop', ...Marks.frameKinds];
    for (const type of types) {
      const drawn = image(options({ type, stroke: '#18394c', strokeWidth: 5 })); assertCovered(drawn.canvas, drawn.bounds);
      if (Marks.frameKinds.includes(type)) assert.equal(pixel(drawn.canvas, 96, 101)[3], 0, type + ' keeps its transparent inner area');
    }
  });
  await test('Stroke padding is projected outside the four corners and source coordinates may be off the target canvas', () => {
    const shape = options({ x: 8000, y: -4000, width: 128, height: 128, fill: null, stroke: '#ff00ff', strokeWidth: 16 });
    const drawn = image(shape); assertCovered(drawn.canvas, drawn.bounds);
    assert.ok(drawn.bounds.x < 32 && drawn.bounds.y < 16);
    assert.ok(pixel(drawn.canvas, 95, 12)[3] > 0, 'The outer half of the top stroke is not clipped to the quad');
    assert.equal(pixel(drawn.canvas, 96, 101)[3], 0);
  });
  await test('Opacity and transparent gradient alpha apply once without mesh seams or alpha squaring', () => {
    const solid = image(options({ opacity: .4, stroke: '#ff00ff', strokeWidth: 8 }));
    assert.ok(Math.abs(pixel(solid.canvas, 96, 80)[3] - 102) <= 1);
    const data = pixels(solid.canvas); for (let i = 3; i < data.length; i += 4) assert.ok(data[i] <= 103);
    const fade = image(options({ opacity: .4, fill: { kind: 'linear', foreground: '#ff00ff', background: '#ffffff', angle: 90, transparentBackground: true } }));
    assert.ok(Math.abs(pixel(fade.canvas, 96, 101)[3] - 51) <= 2);
    assert.ok(pixel(fade.canvas, 96, 40)[3] > pixel(fade.canvas, 96, 101)[3]);
    const ctx = context(createCanvas(192, 170)); ctx.globalAlpha = .5;
    Marks.paintShape(ctx, options({ opacity: .5 })); assert.ok(Math.abs(pixel(ctx.canvas, 96, 80)[3] - 64) <= 1);
  });
  await test('Pattern rows follow perspective compression and gradients/materials remain deterministic', () => {
    const stripes = options({ fill: { kind: 'horizontal', foreground: '#ff00ff', background: '#ffffff', transparentBackground: true, spacing: 32, thickness: 6 } });
    const drawn = image(stripes);
    for (const y of [16, 67, 101, 126]) assert.ok(pixel(drawn.canvas, 96, y)[3] > 60, 'Projected source stripe at Y=' + y);
    for (const y of [40, 83, 114, 136]) assert.equal(pixel(drawn.canvas, 96, y)[3], 0, 'Transparent gap stays between warped stripes');
    for (const kind of ['dots', 'checker', 'radial', 'riso-sparse', 'riso-wet-medium']) {
      const shape = options({ type: 'heart', fill: { kind, foreground: '#31536f', background: '#ffffff', spacing: 14, thickness: 2, angle: 45, transparentBackground: true } });
      const first = image(shape), again = image(shape); assertCovered(first.canvas, first.bounds); assert.deepEqual(pixels(first.canvas), pixels(again.canvas));
    }
  });
  await test('Preview pixel budgets bound both reusable scratch canvases; no-quad rendering stays identical', () => {
    const target = createCanvas(2200, 1500), created = [];
    target.ownerDocument = { createElement: name => { assert.equal(name, 'canvas'); const c = createCanvas(1, 1); created.push(c); return c; } };
    const large = options({ width: 2000, height: 1400, quad: [{ x: 50, y: 20 }, { x: 2100, y: 40 }, { x: 1880, y: 1450 }, { x: 300, y: 1400 }] });
    assert.ok(Marks.paintShape(context(target), large, { maxPixels: 65536 }));
    assert.equal(created.length, 2); for (const c of created) assert.ok(c.width * c.height <= 65536 && c.width <= 2048 && c.height <= 2048);
    context(target).clearRect(0, 0, target.width, target.height);
    assert.ok(Marks.paintShape(context(target), large, { maxPixels: 4096 })); assert.equal(created.length, 2, 'The same scratch canvases are reused');
    for (const c of created) assert.ok(c.width * c.height <= 4096);
    for (const type of ['ellipse', 'heart', 'cloud', 'frameGallery', 'frameDeco']) {
      const flat = options({ type, x: 20, y: 20, width: 100, height: 100 }); delete flat.quad;
      assert.deepEqual(pixels(image(flat).canvas), pixels(image(flat, { maxPixels: 4096 }).canvas));
    }
  });
  await test('Invalid or horizon-crossing quads fail before touching destination pixels', () => {
    const target = createCanvas(192, 170), paint = context(target); paint.fillStyle = '#aaccff'; paint.fillRect(0, 0, 192, 170);
    const before = pixels(target), crossing = quad(); [crossing[1], crossing[2]] = [crossing[2], crossing[1]];
    assert.equal(Marks.paintShape(paint, options({ quad: crossing })), null); assert.deepEqual(pixels(target), before);
    const horizon = [{ x: 20, y: 20 }, { x: 120, y: 20 }, { x: 70.5, y: 120 }, { x: 69.5, y: 120 }];
    assert.equal(Marks.validQuad(horizon), true); assert.equal(Marks.paintShape(paint, options({ width: 100, height: 100, quad: horizon })), null);
    assert.deepEqual(pixels(target), before);
  });
  await test('Quad metadata is immutable, survives PNG/project round-trip and can move without changing other marks', async () => {
    const layer = { canvas: createCanvas(256, 192), strokeRecords: null }, input = options({ type: 'ellipse' });
    append(layer, 'mirror', input); const original = layer.strokeRecords, originalQuad = input.quad.map(p => ({ ...p }));
    input.quad[0].x = -20; assert.deepEqual(original.operations[0].shape.quad, originalQuad);
    assert.ok(Object.isFrozen(original.operations[0].shape.quad) && Object.isFrozen(original.operations[0].shape.quad[0]));
    const ink = createCanvas(256, 192); context(ink).fillStyle = '#2040e0'; context(ink).fillRect(0, 80, 256, 8);
    layer.strokeRecords = Records.append(layer.strokeRecords, layer.canvas, ink, { x: 0, y: 80, width: 256, height: 8 }, { id: 'later', kind: 'stroke', opacity: 1 });
    context(layer.canvas).drawImage(ink, 0, 0);
    const bundle = Records.exportBundle(layer.strokeRecords), png = await loadImage(layer.canvas.toBuffer('image/png'));
    const loaded = createCanvas(256, 192); context(loaded).drawImage(png, 0, 0);
    const imported = await Records.importBundle(bundle, loaded, blob => blob, blob => blob.arrayBuffer());
    assert.deepEqual(imported.operations[0].shape.quad, originalQuad);
    const movedShape = { ...imported.operations[0].shape, quad: originalQuad.map(p => ({ x: p.x + 60, y: p.y + 20 })) };
    const moved = image(movedShape, undefined, 256, 192);
    const result = Records.replaceShape(imported, loaded, moved.canvas, moved.bounds, 'mirror', movedShape, 1); assert.ok(result);
    const before = Records.capture(result.state, loaded, result.keys);
    Records.render(result.state, loaded, result.keys);
    assert.deepEqual(pixel(loaded, 120, 84), [32, 64, 224, 255], 'A later stroke remains above the transformed shape');
    assert.equal(pixel(loaded, 60, 100)[3], 0, 'Old shape position is cleared');
    assert.ok(pixel(loaded, 156, 121)[3] > 240);
    const clean = Records.clean(result.state), restored = await Records.importBundle(Records.exportBundle(clean), loaded, blob => blob, blob => blob.arrayBuffer());
    assert.deepEqual(restored.operations[0].shape.quad, movedShape.quad);
    for (const patch of before) context(loaded).putImageData(patch.image, patch.x, patch.y);
    assert.deepEqual(pixels(loaded), pixels(layer.canvas), 'Undo patches recover original pixels including newly touched tiles');
  });
  console.log(passed + ' perspective core regressions passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
