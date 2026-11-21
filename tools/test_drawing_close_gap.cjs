/* Focused Close Gap regressions on real RGBA pixels/native Canvas masks.
 * NODE_PATH=/path/to/runtime/node_modules node tools/test_drawing_close_gap.cjs
 * --skip-large omits the single 12 MP resource check during implementation work.
 * No browser, device, network, or application dependencies are shipped by this test.
 */
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { createCanvas, ImageData } = require('@napi-rs/canvas');
const Core = require('../assets/drawing-studio/core.js');
const Marks = require('../assets/drawing-studio/marks.js');
const INK = [18, 24, 32, 255], PAINT = [220, 50, 80, 255], CLEAR = [0, 0, 0, 0], WHITE = [255, 255, 255, 255];
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function blank(width, height, color = CLEAR) {
  const image = new ImageData(width, height);
  if (color.some(value => value)) for (let p = 0; p < image.data.length; p += 4) image.data.set(color, p);
  return image;
}
const clone = image => new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
const digest = image => crypto.createHash('sha256').update(image.data).digest('hex');
const put = (image, x, y, color) => image.data.set(color, (y * image.width + x) * 4);
const get = (image, x, y) => Array.from(image.data.subarray((y * image.width + x) * 4, (y * image.width + x + 1) * 4));
function rectangle(image, left, top, right, bottom, color = INK) {
  for (let x = left; x <= right; x++) { put(image, x, top, color); put(image, x, bottom, color); }
  for (let y = top; y <= bottom; y++) { put(image, left, y, color); put(image, right, y, color); }
}
function box({ side = 'top', gap = 4, background = CLEAR, ink = INK, hole = false } = {}) {
  const image = blank(96, 80, background); rectangle(image, 16, 12, 79, 67, ink);
  for (let i = 0; i < gap; i++) {
    const point = side === 'top' ? [40 + i, 12] : side === 'bottom' ? [40 + i, 67]
      : side === 'left' ? [16, 32 + i] : [79, 32 + i];
    put(image, ...point, background);
  }
  if (hole) rectangle(image, 36, 28, 59, 51, ink);
  return image;
}
function diamond(sign) {
  const image = blank(96, 80);
  for (let dx = -28; dx <= 28; dx++) {
    const distance = 28 - Math.abs(dx); put(image, 48 + dx, 40 - distance, INK); put(image, 48 + dx, 40 + distance, INK);
  }
  for (let step = 10; step < 14; step++) put(image, 48 + sign * step, 12 + step, CLEAR);
  return image;
}
function fill(sample, options = {}, seed = [48, 40], color = PAINT, target = blank(sample.width, sample.height)) {
  const result = Core.floodFill(target, sample, ...seed, color, { tolerance: 0, ...options });
  return { target, result };
}
function preservesLineMask(sample, target) {
  for (let i = 0; i < sample.data.length; i += 4) {
    if (sample.data[i + 3]) assert.equal(target.data[i + 3], 0, 'Fill must not paint the sampled line pixels');
  }
}

test('Zero remains the original leaking flood; four-pixel horizontal/vertical gaps close only at the needed setting', () => {
  for (const side of ['top', 'bottom', 'left', 'right']) {
    const sample = box({ side }), sourceHash = digest(sample);
    const legacy = fill(sample), disabled = fill(sample, { closeGap: 0 });
    assert.equal(digest(disabled.target), digest(legacy.target)); assert.deepEqual(disabled.result, legacy.result);
    assert.deepEqual(get(disabled.target, 3, 3), PAINT, side + ': open contour leaks with Close Gap off');
    const tooSmall = fill(sample, { closeGap: 3 });
    assert.deepEqual(get(tooSmall.target, 3, 3), PAINT, side + ': a larger opening must stay open');
    const closed = fill(sample, { closeGap: 4 });
    assert.deepEqual(get(closed.target, 48, 40), PAINT); assert.equal(get(closed.target, 3, 3)[3], 0);
    assert.ok(closed.result.changed > 2500 && closed.result.changed < 4000, 'Closing a gap keeps the enclosed region usable');
    assert.equal(digest(sample), sourceHash); preservesLineMask(sample, closed.target);
  }
});

test('Both slanted openings close without a horizontal/vertical-only shortcut', () => {
  for (const sign of [-1, 1]) {
    const sample = diamond(sign);
    assert.deepEqual(get(fill(sample, { closeGap: 0 }).target, 3, 3), PAINT, 'The removed diagonal pixels really open the contour');
    assert.deepEqual(get(fill(sample, { closeGap: 3 }).target, 3, 3), PAINT, 'A four-step diagonal gap must not close at three');
    const closed = fill(sample, { closeGap: 4 });
    assert.deepEqual(get(closed.target, 48, 40), PAINT); assert.equal(get(closed.target, 3, 3)[3], 0);
    assert.ok(closed.result.changed > 1000, 'The diamond interior was not replaced with virtual linework');
    preservesLineMask(sample, closed.target);
  }
});

test('Transparent linework, invisible RGB and a closed inner hole retain their topology and source pixels', () => {
  const sample = box({ hole: true }), sourceHash = digest(sample);
  const closed = fill(sample, { closeGap: 4 }, [24, 40]);
  assert.deepEqual(get(closed.target, 24, 40), PAINT); assert.equal(get(closed.target, 48, 40)[3], 0);
  assert.equal(get(closed.target, 3, 3)[3], 0); preservesLineMask(sample, closed.target);
  assert.equal(digest(sample), sourceHash);
  const hiddenRGB = clone(sample);
  for (let i = 0; i < hiddenRGB.data.length; i += 4) if (!hiddenRGB.data[i + 3]) {
    hiddenRGB.data[i] = i % 251; hiddenRGB.data[i + 1] = 190; hiddenRGB.data[i + 2] = (i * 17) % 251;
  }
  assert.equal(digest(fill(hiddenRGB, { closeGap: 4 }, [24, 40]).target), digest(closed.target), 'Invisible RGB cannot invent fill barriers');
});

test('Semi-transparent boundaries obey tolerance; fill opacity remains ordinary source-over', () => {
  const sample = box({ ink: [0, 0, 0, 96] }), before = digest(sample);
  const constrained = fill(sample, { closeGap: 4, tolerance: 95 }, [48, 40], [255, 0, 0, 128]);
  assert.deepEqual(get(constrained.target, 48, 40), [255, 0, 0, 128]); assert.equal(get(constrained.target, 3, 3)[3], 0);
  const permissive = fill(sample, { closeGap: 4, tolerance: 96 });
  assert.deepEqual(get(permissive.target, 3, 3), PAINT, 'A line within tolerance is not an invented obstacle');
  const blue = blank(96, 80, [0, 0, 255, 255]);
  fill(sample, { closeGap: 4, tolerance: 0 }, [48, 40], [255, 0, 0, 128], blue);
  assert.deepEqual(get(blue, 48, 40), [128, 0, 127, 255]); assert.deepEqual(get(blue, 3, 3), [0, 0, 255, 255]);
  assert.equal(digest(sample), before);
});

test('In-place sampling equals a frozen independent sample, without recoloring linework or the exterior', () => {
  const sample = box({ background: WHITE }), originalHash = digest(sample), inPlace = clone(sample), separate = clone(sample);
  const inplaceResult = Core.floodFill(inPlace, inPlace, 48, 40, [255, 0, 0, 128], { tolerance: 0, closeGap: 4 });
  const separateResult = fill(sample, { closeGap: 4 }, [48, 40], [255, 0, 0, 128], separate).result;
  assert.deepEqual(inplaceResult, separateResult); assert.equal(digest(inPlace), digest(separate));
  assert.deepEqual(get(inPlace, 48, 40), [255, 127, 127, 255]); assert.deepEqual(get(inPlace, 3, 3), WHITE);
  for (let i = 0; i < sample.data.length; i += 4) if (sample.data[i] === INK[0] && sample.data[i + 1] === INK[1]) {
    assert.deepEqual(inPlace.data.subarray(i, i + 4), sample.data.subarray(i, i + 4));
  }
  assert.equal(digest(sample), originalHash);
});

test('Expansion follows the sealed selection, and native gradient masking preserves the hole and exterior', () => {
  const sample = box({ hole: true }), sourceHash = digest(sample);
  const base = fill(sample, { closeGap: 4 }, [24, 40], WHITE);
  const expanded = fill(sample, { closeGap: 4, expand: 2 }, [24, 40], WHITE);
  assert.ok(expanded.result.changed > base.result.changed); assert.equal(get(expanded.target, 16, 40)[3], 255, 'Expansion reaches under the sampled outline');
  assert.equal(get(expanded.target, 48, 40)[3], 0); assert.equal(get(expanded.target, 3, 3)[3], 0);
  for (let i = 3; i < base.target.data.length; i += 4) if (base.target.data[i]) assert.equal(expanded.target.data[i], 255);
  const canvas = createCanvas(96, 80), ctx = canvas.getContext('2d'); ctx.putImageData(expanded.target, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = Marks.fillStyle(ctx, { kind: 'radial', foreground: '#ff0000', background: '#0000ff' }, expanded.result.bounds);
  ctx.fillRect(0, 0, 96, 80); const material = ctx.getImageData(0, 0, 96, 80);
  assert.ok(get(material, 24, 40)[3] > 0); assert.ok(get(material, 69, 48)[3] > 0);
  for (let i = 3; i < material.data.length; i += 4) if (!expanded.target.data[i]) assert.equal(material.data[i], 0, 'A material must never escape its flood mask');
  assert.equal(get(material, 48, 40)[3], 0); assert.equal(get(material, 3, 3)[3], 0);
  assert.equal(digest(sample), sourceHash);
});

test('Global color replacement and cutout ignore Close Gap entirely', () => {
  const sample = box({ gap: 0, background: WHITE, hole: true });
  for (const options of [{ contiguous: false }, { erase: true }, { contiguous: false, erase: true }]) {
    const off = clone(sample), enabled = clone(sample);
    const a = fill(sample, { ...options, closeGap: 0 }, [24, 40], [50, 80, 110, 128], off);
    const b = fill(sample, { ...options, closeGap: 32 }, [24, 40], [50, 80, 110, 128], enabled);
    assert.deepEqual(a.result, b.result); assert.equal(digest(off), digest(enabled));
  }
  const open = box({ background: WHITE }), off = clone(open), enabled = clone(open);
  fill(open, { erase: true, closeGap: 0 }, [48, 40], [0, 0, 0, 255], off);
  fill(open, { erase: true, closeGap: 4 }, [48, 40], [0, 0, 0, 255], enabled);
  assert.equal(digest(off), digest(enabled)); assert.equal(get(enabled, 3, 3)[3], 0, 'Cutout still follows its original open region');
});

test('A seed on a virtual closure is a safe no-op, never an exterior flood', () => {
  const sample = box(), original = digest(sample), target = blank(96, 80, [21, 56, 90, 73]), before = digest(target);
  const outcome = fill(sample, { closeGap: 4 }, [41, 12], PAINT, target);
  assert.equal(outcome.result.changed, 0); assert.equal(outcome.result.bounds, null);
  assert.equal(outcome.result.reason, 'gapBlocked'); assert.equal(outcome.result.gapBlocked, true);
  assert.equal(digest(target), before); assert.equal(digest(sample), original);
});

if (!process.argv.includes('--skip-large')) test('One 12 MP canvas seals a gap with bounded scratch memory and work', () => {
  const sample = blank(4000, 3000), target = blank(4000, 3000);
  rectangle(sample, 1000, 800, 2799, 2199);
  for (let x = 1900; x < 1912; x++) put(sample, x, 800, CLEAR);
  const initial = process.memoryUsage(), start = performance.now();
  const outcome = fill(sample, { closeGap: 32 }, [2000, 1500], PAINT, target);
  const elapsed = performance.now() - start, after = process.memoryUsage();
  assert.deepEqual(get(target, 2000, 1500), PAINT); assert.equal(get(target, 5, 5)[3], 0);
  assert.ok(outcome.result.changed > 2000000 && outcome.result.changed < 2600000);
  assert.deepEqual(get(sample, 1000, 1500), INK); assert.deepEqual(get(sample, 1905, 800), CLEAR);
  assert.ok(elapsed < 20000, '12 MP closing should not scale with every radius-sized neighborhood');
  assert.ok(after.heapUsed - initial.heapUsed < 128 * 1024 * 1024, 'Scratch selection data should not become a per-pixel JS object graph');
  assert.ok(after.arrayBuffers - initial.arrayBuffers < 128 * 1024 * 1024, 'Scratch typed arrays must remain bounded at 12 MP');
  console.log('  12 MP: ' + elapsed.toFixed(1) + ' ms; RSS ' + (after.rss / 1048576).toFixed(1) + ' MiB; heap growth ' + ((after.heapUsed - initial.heapUsed) / 1048576).toFixed(1) + ' MiB; buffer growth ' + ((after.arrayBuffers - initial.arrayBuffers) / 1048576).toFixed(1) + ' MiB');
});

console.log('\n' + passed + ' Close Gap regressions passed' + (process.argv.includes('--skip-large') ? ' (12 MP check omitted)' : '') + '.');
