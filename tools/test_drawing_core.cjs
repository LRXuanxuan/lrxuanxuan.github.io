'use strict';

// Development only: NODE_PATH may point to an installed @napi-rs/canvas.
// No test dependency is loaded by the deployed website.
const assert = require('node:assert/strict');
const { createCanvas, ImageData, loadImage } = require('@napi-rs/canvas');
const core = require('../assets/drawing-studio/core.js');

function blank(w, h, rgba = [0, 0, 0, 0]) {
  const image = new ImageData(w, h);
  for (let i = 0; i < image.data.length; i += 4) image.data.set(rgba, i);
  return image;
}
function put(image, x, y, rgba) { image.data.set(rgba, (y * image.width + x) * 4); }
function get(image, x, y) { return Array.from(image.data.subarray((y * image.width + x) * 4, (y * image.width + x + 1) * 4)); }
function clone(image) { return new ImageData(new Uint8ClampedArray(image.data), image.width, image.height); }
function ring() {
  const image = blank(7, 7, [255, 255, 255, 255]);
  for (let y = 1; y <= 5; y++) for (let x = 1; x <= 5; x++) if (x === 1 || x === 5 || y === 1 || y === 5) put(image, x, y, [0, 0, 0, 255]);
  return image;
}
function countAlpha(image, x) {
  let n = 0;
  for (let y = 0; y < image.height; y++) if (get(image, x, y)[3] >= 128) n++;
  return n;
}

async function main() {
  // Closed linework and separate fill layer: only the interior should change.
  const sample = ring(), target = blank(7, 7);
  let fill = core.floodFill(target, sample, 3, 3, [240, 40, 30, 255], { tolerance: 0 });
  assert.equal(fill.changed, 9);
  assert.deepEqual(fill.bounds, { x: 2, y: 2, width: 3, height: 3 });
  assert.deepEqual(get(target, 2, 2), [240, 40, 30, 255]);
  assert.equal(get(target, 0, 0)[3], 0);
  assert.equal(get(target, 1, 3)[3], 0);
  assert.deepEqual(get(sample, 3, 3), [255, 255, 255, 255]);

  const inPlace = ring();
  core.floodFill(inPlace, inPlace, 3, 3, [1, 2, 3, 255], { tolerance: 0 });
  assert.deepEqual(get(inPlace, 4, 4), [1, 2, 3, 255]);
  assert.deepEqual(get(inPlace, 0, 0), [255, 255, 255, 255]);

  // Invisible RGB must not split an otherwise entirely transparent region.
  const hidden = blank(512, 256, [200, 120, 90, 0]);
  put(hidden, 100, 100, [1, 2, 3, 0]);
  fill = core.floodFill(hidden, hidden, 0, 0, [30, 40, 50, 128], { tolerance: 0 });
  assert.equal(fill.changed, 512 * 256);
  assert.deepEqual(get(hidden, 100, 100), [30, 40, 50, 128]);

  const checker = blank(2, 2, [0, 0, 0, 255]);
  put(checker, 0, 0, [255, 255, 255, 255]); put(checker, 1, 1, [255, 255, 255, 255]);
  fill = core.floodFill(checker, checker, 0, 0, [200, 0, 0, 255], { tolerance: 0 });
  assert.equal(fill.changed, 1, 'diagonal contact is not a four-connected region');
  assert.deepEqual(get(checker, 1, 1), [255, 255, 255, 255]);

  const cut = ring();
  fill = core.floodFill(cut, cut, 0, 0, [0, 0, 0, 255], { tolerance: 0, contiguous: false, erase: true });
  assert.equal(fill.changed, 33);
  assert.deepEqual(get(cut, 3, 3), [255, 255, 255, 0], 'cutout changes alpha, not hidden RGB');
  assert.deepEqual(get(cut, 1, 3), [0, 0, 0, 255]);

  const blue = blank(1, 1, [0, 0, 255, 255]);
  core.floodFill(blue, blue, 0, 0, [255, 0, 0, 128], { tolerance: 0 });
  assert.deepEqual(get(blue, 0, 0), [128, 0, 127, 255], 'fill opacity is source-over');

  const little = blank(5, 5, [0, 0, 0, 255]); put(little, 2, 2, [255, 255, 255, 255]);
  const expanded = blank(5, 5);
  fill = core.floodFill(expanded, little, 2, 2, [0, 100, 100, 255], { tolerance: 0, expand: 1 });
  assert.equal(fill.changed, 9); assert.deepEqual(fill.bounds, { x: 1, y: 1, width: 3, height: 3 });

  // Compare irregular fill topology with an independent, simple BFS oracle.
  let seed = 173;
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  for (let trial = 0; trial < 100; trial++) {
    const image = blank(23, 19), out = blank(23, 19), bits = new Uint8Array(23 * 19);
    for (let i = 0; i < bits.length; i++) { bits[i] = random() > 0.35 ? 1 : 0; put(image, i % 23, Math.floor(i / 23), bits[i] ? [255, 255, 255, 255] : [0, 0, 0, 255]); }
    const sx = Math.floor(random() * 23), sy = Math.floor(random() * 19), wanted = bits[sy * 23 + sx];
    const visited = new Set([sy * 23 + sx]), queue = [sy * 23 + sx];
    for (let j = 0; j < queue.length; j++) {
      const index = queue[j], x = index % 23, y = Math.floor(index / 23);
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= 23 || ny >= 19) continue;
        const ni = ny * 23 + nx;
        if (!visited.has(ni) && bits[ni] === wanted) { visited.add(ni); queue.push(ni); }
      }
    }
    fill = core.floodFill(out, image, sx, sy, [80, 100, 120, 255], { tolerance: 0 });
    assert.equal(fill.changed, visited.size, 'flood topology trial ' + trial);
    for (let i = 0; i < bits.length; i++) assert.equal(out.data[i * 4 + 3] > 0, visited.has(i));
  }

  const red = blank(1, 1, [255, 0, 0, 92]);
  core.adjust(red, { hue: 120 }); assert.deepEqual(get(red, 0, 0), [0, 255, 0, 92]);
  core.adjust(red, { saturation: -100 }); assert.equal(red.data[0], red.data[1]); assert.equal(red.data[1], red.data[2]);
  core.adjust(red, { lightness: 100 }); assert.deepEqual(get(red, 0, 0), [255, 255, 255, 92]);

  // Pressure changes G-pen width, not fineliner width. Lift-off has no full-force blob.
  function strokeImage(brush, stabilize = 0) {
    const canvas = createCanvas(160, 80), ctx = canvas.getContext('2d');
    const stroke = core.makeStroke(ctx, { brush, size: 24, color: '#0f2030', pressure: true, stabilizer: stabilize });
    stroke.start({ x: 15, y: 40, pressure: 0.12, pointerType: 'pen', time: 0 });
    stroke.move({ x: 55, y: 40, pressure: 0.12, pointerType: 'pen', time: 20 });
    stroke.move({ x: 100, y: 40, pressure: 0.9, pointerType: 'pen', time: 40 });
    stroke.move({ x: 130, y: 40, pressure: 0.9, pointerType: 'pen', time: 60 });
    stroke.end({ x: 135, y: 40, pressure: 0, pointerType: 'pen', time: 64 });
    assert.ok(stroke.bounds && stroke.bounds.width > 100);
    return ctx.getImageData(0, 0, 160, 80);
  }
  const gpen = strokeImage('gpen');
  assert.ok(countAlpha(gpen, 30) < countAlpha(gpen, 120) / 2);
  assert.ok(countAlpha(gpen, 135) <= 24, 'pen-up zero pressure must not widen the tail');
  const fineliner = strokeImage('fineliner'); assert.equal(countAlpha(fineliner, 30), countAlpha(fineliner, 120));
  const squarePreset = core.brushPresets.find(item => item.id === 'plainSquare');
  assert.equal(squarePreset.opacity, 1);
  const square = strokeImage('plainSquare');
  assert.equal(countAlpha(square, 30), 24); assert.equal(countAlpha(square, 120), 24);
  assert.equal(get(square, 4, 29)[3], 255, 'square nib fills the outer corner at the starting point');
  const squareCtx = createCanvas(64, 64).getContext('2d');
  const squareStroke = core.makeStroke(squareCtx, {brush:'plainSquare', size:6, color:'#aa5522'});
  squareStroke.start({x:8.35,y:8.35}); squareStroke.move({x:48.35,y:40.35}); squareStroke.end();
  const subpixelSquare = squareCtx.getImageData(0,0,64,64);
  assert.ok(subpixelSquare.data.some((v,i)=>i%4===3 && v>0 && v<255), 'continuous square nib keeps antialiased subpixel placement');
  assert.equal(get(subpixelSquare,28,24)[3],255,'long diagonal is filled continuously');
  const binary = strokeImage('binary');
  assert.ok(Array.from(binary.data).filter((_, i) => i % 4 === 3).every(a => a === 0 || a === 255), 'binary edge must be hard');
  const pixel = strokeImage('pixel');
  assert.ok(Array.from(pixel.data).filter((_, i) => i % 4 === 3).every(a => a === 0 || a === 255));
  assert.equal(countAlpha(pixel, 30), 24);
  const stable = strokeImage('gpen', 85); assert.ok(get(stable, 134, 40)[3] > 0, 'stabilizer catches up to the final coordinate');
  const dots = createCanvas(16, 16), dotCtx = dots.getContext('2d');
  const dot = core.makeStroke(dotCtx, { brush: 'fineliner', size: 4 }); dot.start({ x: 8, y: 8 }); dot.end();
  assert.ok(dotCtx.getImageData(8, 8, 1, 1).data[3] > 0, 'a click is a visible dot');

  // Sampled tips must deposit the same stroke under sparse/coalesced
  // events. Verify real alpha coverage including clicks and undo patch bounds.
  for (const brush of ['fountain']) {
    const preset = core.brushPresets.find(item => item.id === brush);
    function totalInk(pressure, steps) {
      const ctx = createCanvas(180, 84).getContext('2d');
      const pen = core.makeStroke(ctx, { brush, size: preset.size, color: '#194661' });
      const point = x => ({ x, y: 42, pointerType: 'pen', pressure });
      pen.start(point(38));
      if (steps) for (let i = 1; i <= steps; i++) pen.move(point(38 + 100 * i / steps));
      pen.end();
      const data = ctx.getImageData(0, 0, 180, 84).data, bounds = pen.bounds;
      let sum = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i]) {
        const index = (i - 3) / 4, x = index % 180, y = Math.floor(index / 180);
        assert.ok(x >= bounds.x && x < bounds.x + bounds.width && y >= bounds.y && y < bounds.y + bounds.height, brush + ' bounds');
        sum += data[i];
      }
      return sum;
    }
    assert.ok(totalInk(1, 0) > 0, brush + ' click');
    const heavy = totalInk(1, 1), light = totalInk(0.12, 1);
    assert.ok(Math.abs(heavy - totalInk(1, 100)) < heavy * 0.005, brush + ' sampling density');
    assert.ok(heavy > light, brush + ' pressure response');
  }
  // Imported source collections have separate pixel/pressure/grain regressions
  // in test_drawing_chuishi.cjs; retired original texture brushes are not restored.

  // Rasterize actual SVG output to independently check holes, topology and alpha.
  async function raster(svg, w, h) {
    const canvas = createCanvas(w, h), ctx = canvas.getContext('2d');
    const image = await loadImage(Buffer.from(svg)); ctx.drawImage(image, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }
  const art = blank(64, 48);
  for (let y = 5; y < 38; y++) for (let x = 5; x < 48; x++) if (x < 13 || x >= 40 || y < 13 || y >= 30) put(art, x, y, [240, 60, 30, 255]);
  put(art, 52, 20, [30, 60, 220, 128]);
  const vector = core.vectorize(art, { colors: 2, simplify: 0 });
  assert.match(vector.svg, /<path /); assert.match(vector.svg, /fill-rule="evenodd"/); assert.doesNotMatch(vector.svg, /<image|base64/i);
  const rendered = await raster(vector.svg, 64, 48);
  assert.equal(get(rendered, 25, 20)[3], 0, 'transparent interior hole survives');
  assert.deepEqual(get(rendered, 8, 20), [240, 60, 30, 255]);
  assert.equal(get(rendered, 1, 1)[3], 0); assert.equal(get(rendered, 52, 20)[3], 128, 'semi-transparent trace keeps an opacity level');
  assert.ok(vector.contours >= 3);

  for (let trial = 0; trial < 15; trial++) {
    const mosaic = blank(17, 13);
    for (let i = 0; i < mosaic.width * mosaic.height; i++) {
      const choice = Math.floor(random() * 3);
      if (choice) put(mosaic, i % mosaic.width, Math.floor(i / mosaic.width), choice === 1 ? [220, 20, 30, 255] : [20, 80, 220, 255]);
    }
    const traced = core.vectorize(mosaic, { colors: 2, simplify: 0 });
    const actual = await raster(traced.svg, 17, 13);
    assert.deepEqual(Array.from(actual.data), Array.from(mosaic.data), 'shared corners/disconnected shapes, trial ' + trial);
  }
  const empty = core.vectorize(blank(16, 16, [255, 255, 255, 255]), { mode: 'mono', threshold: 100 });
  assert.equal(empty.paths, 0); assert.equal(empty.points, 0);
  const resized = core.vectorize(blank(400, 200, [0, 0, 0, 255]), { maxSize: 64, simplify: 0 });
  assert.equal(resized.width, 400); assert.equal(resized.workingWidth, 64); assert.match(resized.svg, /viewBox="0 0 64 32"/);
  const noise = blank(350, 350);
  for (let y = 0; y < 350; y++) for (let x = 0; x < 350; x++) put(noise, x, y, (x + y) % 2 ? [255, 255, 255, 255] : [0, 0, 0, 255]);
  assert.throws(() => core.vectorize(noise, { colors: 2, simplify: 0, maxSize: 512 }), /细节过多|节点过多/);

  console.log('Drawing core: fill topology, cutout, alpha, pressure strokes, stabilization, HSL and actual SVG rasterization passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
