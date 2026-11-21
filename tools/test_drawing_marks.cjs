'use strict';
// Developer-only native Canvas tests; no browser, fonts or runtime dependencies
// are added to the website. Install @napi-rs/canvas in the test environment.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createCanvas } = require('@napi-rs/canvas');
const marks = require('../assets/drawing-studio/marks.js');
function make(w = 180, h = 140) { const canvas = createCanvas(w, h); return { canvas, ctx: canvas.getContext('2d') }; }
function pixels(canvas) { return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data; }
function at(canvas, x, y) { return Array.from(canvas.getContext('2d').getImageData(x, y, 1, 1).data); }
function hash(canvas) { return crypto.createHash('sha256').update(pixels(canvas)).digest('hex'); }
function coverage(canvas) {
  const d = pixels(canvas); let left = canvas.width, top = canvas.height, right = -1, bottom = -1, count = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { const p = i / 4, x = p % canvas.width, y = Math.floor(p / canvas.width); left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); count++; }
  return { left, top, right, bottom, count };
}
function assertCovered(canvas, bounds, label) {
  const c = coverage(canvas); assert.ok(c.count > 0, label + ' must produce real pixels');
  assert.ok(bounds, label + ' must return bounds');
  assert.ok(c.left >= bounds.x && c.top >= bounds.y && c.right < bounds.x + bounds.width && c.bottom < bounds.y + bounds.height,
    label + ' returned bounds must include all pixels: ' + JSON.stringify({ c, bounds }));
}
function alphaCount(canvas, threshold = 128) { const d = pixels(canvas); let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] >= threshold) n++; return n; }

for (const type of ['rect', 'ellipse', 'star', 'triangle', 'heart', 'roundRect', 'diamond', 'hexagon']) {
  const { canvas, ctx } = make();
  const bounds = marks.paintShape(ctx, { type, x: 15, y: 15, width: 110, height: 90, fill: '#d43d28', stroke: '#213446', strokeWidth: 3 });
  assertCovered(canvas, bounds, type);
  assert.ok(at(canvas, 70, 65)[3] > 0, type + ' includes its body');
  assert.equal(at(canvas, 2, 2)[3], 0);
  if (type !== 'rect') assert.equal(at(canvas, 17, 17)[3], 0, type + ' must not be a disguised rectangular fill');
}

// Axis-aligned and reverse drags have a valid one-dimensional bounding box.
for (const type of ['line', 'arrow']) for (const [dx, dy] of [[-65, 0], [0, 45], [65, -25], [-55, -42]]) {
  const { canvas, ctx } = make(), x = 90, y = 70;
  const bounds = marks.paintShape(ctx, { type, x, y, width: dx, height: dy, fill: '#34383f', strokeWidth: 4 });
  assertCovered(canvas, bounds, type + ' reverse or axial drag');
  assert.ok(at(canvas, Math.round(x + dx / 2), Math.round(y + dy / 2))[3] > 0);
  if (type === 'arrow' && !dy) {
    assert.ok(at(canvas, x - 52, y + 7)[3] > 0, 'wide arrowhead follows leftward drag');
    assert.equal(at(canvas, x - 5, y + 8)[3], 0, 'shaft stays narrow');
  }
}
{
  const { canvas, ctx } = make();
  marks.paintShape(ctx, { type: 'line', x: 18, y: 32, width: 90, height: 8, constrain: true, fill: '#ffff00', stroke: '#124688', strokeWidth: 3 });
  assert.deepEqual(at(canvas, 60, 32), [18, 70, 136, 255], 'stroke color wins, Shift snaps the line to horizontal');
  assert.equal(at(canvas, 60, 37)[3], 0);
}

// Empty outline interiors and transparent material holes remain alpha=0.
{
  const { canvas, ctx } = make();
  const bounds = marks.paintShape(ctx, { type: 'ellipse', x: 20, y: 20, width: 90, height: 60, fill: { kind: 'none' }, stroke: '#000000', strokeWidth: 4 });
  assertCovered(canvas, bounds, 'empty ellipse outline'); assert.equal(at(canvas, 65, 50)[3], 0); assert.equal(at(canvas, 20, 50)[3], 255);
}

// Shift/constrain keeps the drag anchor and direction, and locks width=height.
assert.deepEqual(marks.normalizedBounds({ x: 120, y: 110, width: -50, height: -20 }, true), { x: 70, y: 60, width: 50, height: 50 });
for (const type of ['rect', 'ellipse']) {
  const a = make(), b = make();
  marks.paintShape(a.ctx, { type, x: 120, y: 110, width: -50, height: -20, constrain: true, fill: '#111111' });
  marks.paintShape(b.ctx, { type, x: 70, y: 60, width: 50, height: 50, fill: '#111111' });
  assert.equal(hash(a.canvas), hash(b.canvas), type + ' reverse drag equals its normalized square/circle');
  const c = coverage(a.canvas); assert.equal(c.right - c.left, c.bottom - c.top);
}

const baseStyle = { foreground: '#14283c', background: '#f0dcbc', spacing: 12, thickness: 2, angle: 0 };
for (const kind of ['horizontal', 'vertical', 'diagonal', 'crosshatch', 'dots']) {
  const { canvas, ctx } = make(96, 96);
  const style = { ...baseStyle, kind, angle: kind === 'diagonal' ? 45 : 0, thickness: kind === 'dots' ? 4 : 2 };
  const bounds = marks.paintShape(ctx, { type: 'rect', x: 0, y: 0, width: 96, height: 96, fill: style }); assertCovered(canvas, bounds, kind);
  assert.equal(alphaCount(canvas), 96 * 96, kind + ' opaque background covers the shape');
  if (kind === 'horizontal') { assert.ok(at(canvas, 6, 12)[0] < 80); assert.ok(at(canvas, 6, 6)[0] > 220); }
  if (kind === 'vertical') { assert.ok(at(canvas, 12, 6)[0] < 80); assert.ok(at(canvas, 6, 6)[0] > 220); }
  if (kind === 'diagonal') { assert.ok(at(canvas, 12, 12)[0] < 80); assert.ok(at(canvas, 12, 18)[0] > 200); }
  if (kind === 'crosshatch') { assert.ok(at(canvas, 12, 6)[0] < 80); assert.ok(at(canvas, 6, 12)[0] < 80); assert.ok(at(canvas, 6, 6)[0] > 220); }
  if (kind === 'dots') { assert.ok(at(canvas, 6, 6)[0] < 80); assert.ok(at(canvas, 18, 18)[0] < 80); assert.ok(at(canvas, 0, 0)[0] > 220); }
  const transparent = make(96, 96); marks.paintShape(transparent.ctx, { type: 'rect', x: 0, y: 0, width: 96, height: 96, fill: { ...style, transparentBackground: true } });
  assert.ok(alphaCount(transparent.canvas) > 0 && alphaCount(transparent.canvas) < 96 * 96 / 2, kind + ' transparent gaps are real holes');
}
for (const kind of ['checker', 'paper', 'stipple', 'weave']) {
  const preview = make(96, 96), shape = make(96, 96), box = { x: 0, y: 0, width: 96, height: 96 };
  const style = { ...baseStyle, kind, transparentBackground: true };
  preview.ctx.fillStyle = marks.fillStyle(preview.ctx, style, box); preview.ctx.fillRect(0, 0, 96, 96);
  const bounds = marks.paintShape(shape.ctx, { type: 'rect', ...box, fill: style });
  assertCovered(shape.canvas, bounds, kind);
  assert.equal(hash(preview.canvas), hash(shape.canvas), kind + ' preview and mark share the same pattern');
  const covered = alphaCount(shape.canvas, 1);
  assert.ok(covered > 0 && covered < 96 * 96, kind + ' has transparent gaps');
  if (kind === 'checker') { assert.equal(at(shape.canvas, 6, 6)[3], 255); assert.equal(at(shape.canvas, 18, 6)[3], 0); }
}
{
  const sparse = make(96, 96), dense = make(96, 96), thick = make(96, 96);
  const fill = { ...baseStyle, kind: 'horizontal', transparentBackground: true };
  marks.paintShape(sparse.ctx, { type: 'rect', width: 96, height: 96, fill });
  marks.paintShape(dense.ctx, { type: 'rect', width: 96, height: 96, fill: { ...fill, spacing: 6 } });
  marks.paintShape(thick.ctx, { type: 'rect', width: 96, height: 96, fill: { ...fill, thickness: 5 } });
  assert.ok(alphaCount(dense.canvas) > alphaCount(sparse.canvas) * 1.8, 'Spacing controls material density');
  assert.ok(alphaCount(thick.canvas) > alphaCount(sparse.canvas) * 1.8, 'Thickness controls line coverage');
}

// Riso densities share a stable ink field, and remain real alpha textures.
{
  const means = [], sourceTiles = [];
  const box = { x: 23, y: 17, width: 256, height: 256 };
  const fill = { foreground: '#ff48b1', background: '#e9dfc7', spacing: 14, thickness: 2, transparentBackground: true };
  function meanAlpha(canvas) {
    const d = pixels(canvas); let total = 0;
    for (let i = 3; i < d.length; i += 4) total += d[i];
    return total / (255 * canvas.width * canvas.height);
  }
  for (const kind of ['riso-sparse', 'riso-medium', 'riso-dense']) {
    const preview = make(302, 290), committed = make(302, 290), style = { ...fill, kind };
    const originalCreate = preview.ctx.createPattern.bind(preview.ctx);
    preview.ctx.createPattern = function (tile, repetition) {
      assert.ok(tile.width <= 256 && tile.height <= 256, 'Riso uses a bounded reusable tile');
      sourceTiles.push(tile); return originalCreate(tile, repetition);
    };
    preview.ctx.fillStyle = marks.fillStyle(preview.ctx, style, box);
    preview.ctx.fillRect(box.x, box.y, box.width, box.height);
    marks.paintShape(committed.ctx, { type: 'rect', ...box, fill: style });
    assert.equal(hash(preview.canvas), hash(committed.canvas), kind + ' preview and committed fill are identical');
    assert.equal(at(committed.canvas, 0, 0)[3], 0, kind + ' stays within the actual shape');
    preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height);
    preview.ctx.fillStyle = marks.fillStyle(preview.ctx, style, box);
    preview.ctx.fillRect(box.x, box.y, box.width, box.height);
    assert.equal(sourceTiles.at(-1), sourceTiles.at(-2), 'Repeated preview reuses the tile');
    assert.equal(hash(preview.canvas), hash(committed.canvas), 'Rendering does not reshuffle grains');
    const cropped = make(256, 256); cropped.ctx.drawImage(committed.canvas, box.x, box.y, 256, 256, 0, 0, 256, 256);
    means.push(meanAlpha(cropped.canvas));
    const d = pixels(cropped.canvas);
    assert.ok(d.some((v, i) => i % 4 === 3 && v === 0), kind + ' retains transparent dry gaps');
    assert.ok(d.some((v, i) => i % 4 === 3 && v > 0 && v < 255), kind + ' retains partial ink coverage');

    const backed = make(256, 256), expected = make(256, 256);
    backed.ctx.fillStyle = marks.fillStyle(backed.ctx, { ...style, transparentBackground: false }, { width: 256, height: 256 });
    backed.ctx.fillRect(0, 0, 256, 256);
    expected.ctx.fillStyle = fill.background; expected.ctx.fillRect(0, 0, 256, 256);
    expected.ctx.fillStyle = marks.fillStyle(expected.ctx, style, { width: 256, height: 256 }); expected.ctx.fillRect(0, 0, 256, 256);
    const actualPixels = pixels(backed.canvas), expectedPixels = pixels(expected.canvas);
    for (let y = 2; y < 254; y++) for (let x = 2; x < 254; x++) for (let channel = 0; channel < 4; channel++) {
      const i = (y * 256 + x) * 4 + channel;
      assert.ok(Math.abs(actualPixels[i] - expectedPixels[i]) <= 2, kind + ' respects both the chosen ink and background colors');
    }
    assert.equal(alphaCount(backed.canvas, 255), 256 * 256, 'An opaque background covers all gaps');

    const mask = make(300, 300);
    mask.ctx.save(); mask.ctx.beginPath(); mask.ctx.rect(20, 20, 260, 260); mask.ctx.rect(100, 100, 100, 100); mask.ctx.clip('evenodd');
    mask.ctx.fillStyle = marks.fillStyle(mask.ctx, style, { x: 20, y: 20, width: 260, height: 260 }); mask.ctx.fillRect(0, 0, 300, 300); mask.ctx.restore();
    assert.equal(at(mask.canvas, 150, 150)[3], 0, 'A hole in the fill mask remains empty');
    assert.equal(at(mask.canvas, 10, 150)[3], 0, 'Pattern cannot paint outside the fill mask');
    assert.ok(alphaCount(mask.canvas, 1) > 1000, 'The selected region receives ink');
  }
  assert.ok(means[0] > 0.10 && means[0] < 0.30, 'Sparse leaves a light texture');
  assert.ok(means[1] > means[0] + 0.15 && means[2] > means[1] + 0.15, 'Three densities are visibly separated');
  assert.ok(means[2] < 0.85, 'Dense still contains dry gaps');

  function painted(style, size = 256) {
    const result = make(size, size); marks.paintShape(result.ctx, { type: 'rect', width: size, height: size, fill: style }); return result.canvas;
  }
  const medium = { ...fill, kind: 'riso-medium' }, normal = painted(medium);
  assert.ok(meanAlpha(painted({ ...medium, spacing: 7 })) > meanAlpha(normal) + 0.12, 'Smaller spacing adds ink');
  assert.ok(meanAlpha(painted({ ...medium, spacing: 28 })) < meanAlpha(normal) - 0.12, 'Larger spacing leaves more dry paper');
  assert.ok(Math.abs(meanAlpha(painted({ ...medium, spacing: 28, thickness: 4 }, 512)) - meanAlpha(normal)) < 0.015,
    'Scaling both spacing and thickness changes grain size without changing density');
  const changedInk = painted({ ...medium, foreground: '#005fa8' });
  const a = pixels(normal), b = pixels(changedInk);
  for (let i = 3; i < a.length; i += 4) assert.equal(a[i], b[i], 'Picking another ink color preserves the texture mask');
  assert.notEqual(hash(normal), hash(changedInk));
  for (let i = 0; i < 12; i++) painted({ ...medium, foreground: '#' + (0x220001 + i * 0x101).toString(16) });
  assert.equal(hash(painted(medium)), hash(normal), 'Recreating an evicted texture preserves its exact grains');
}

// Wet print uses connected translucent ink, distinct from dry speckles.
{
  const kinds = ['riso-wet-light', 'riso-wet-medium', 'riso-wet-dense'];
  const style = { foreground: '#00838a', background: '#f4e9d3', transparentBackground: true, spacing: 14, thickness: 2 };
  function render(kind, options = {}) {
    const result = make(256, 256);
    result.ctx.fillStyle = marks.fillStyle(result.ctx, { ...style, kind, ...options }, { width: 256, height: 256 });
    result.ctx.fillRect(0, 0, 256, 256); return result.canvas;
  }
  function stats(canvas) {
    const d = pixels(canvas); let total = 0, variation = 0, gaps = 0;
    for (let i = 3; i < d.length; i += 4) {
      total += d[i]; gaps += d[i] === 0;
      if ((i >> 2) % 256 < 255) variation += Math.abs(d[i] - d[i + 4]);
    }
    return { mean: total / (65536 * 255), variation: variation / (256 * 255), gaps };
  }
  const canvases = kinds.map(kind => render(kind)), values = canvases.map(stats);
  assert.ok(values[0].mean > 0.02 && values[0].mean < 0.15 && values[0].gaps > 1000, 'Light wet ink leaves isolated faint droplets');
  assert.ok(values[1].mean > 0.30 && values[1].mean < 0.55, 'Medium wet ink has a translucent body');
  assert.ok(values[2].mean > 0.70 && values[2].mean < 0.95 && values[2].gaps < 100, 'Dense wet ink retains an almost continuous translucent film');
  const dry = render('riso-medium');
  assert.ok(values[1].variation < stats(dry).variation * 0.5, 'Wet ink forms smoother connected pools, not recolored dry grains');
  assert.notEqual(hash(canvases[1]), hash(dry), 'Wet and dry have different spatial ink distributions');

  // Ordered concentration must hold for every pixel, including extreme ratios.
  for (const options of [{}, { spacing: 4, thickness: 4 }, { spacing: 4, thickness: 24 }, { spacing: 100, thickness: 1 }]) {
    const data = kinds.map(kind => pixels(render(kind, options)));
    for (let i = 3; i < data[0].length; i += 4) {
      assert.ok(data[0][i] <= data[1][i], 'Light never exceeds medium at any grain/spacing setting');
      assert.ok(data[1][i] <= data[2][i], 'Medium never exceeds dense at any grain/spacing setting');
    }
  }
  assert.ok(stats(render(kinds[2], { spacing: 100, thickness: 1 })).gaps > 1000, 'Larger wet spacing can open real gaps');
  for (let index = 0; index < kinds.length; index++) {
    const kind = kinds[index], committed = make(256, 256), options = { ...style, kind };
    marks.paintShape(committed.ctx, { type: 'rect', width: 256, height: 256, fill: options });
    assert.equal(hash(committed.canvas), hash(canvases[index]), 'Wet preview and committed shape are identical');
    assert.equal(hash(render(kind)), hash(canvases[index]), 'Wet ink remains fixed across repeated previews');
    assert.equal(alphaCount(render(kind, { transparentBackground: false }), 255), 65536, 'Wet background color covers its gaps');
    const recolored = pixels(render(kind, { foreground: '#914e72' })), original = pixels(canvases[index]);
    for (let i = 3; i < original.length; i += 4) assert.equal(recolored[i], original[i], 'Wet recoloring preserves alpha');
  }
  for (let i = 0; i < 12; i++) render(kinds[1], { foreground: '#' + (0x330001 + i * 0x101).toString(16) });
  assert.equal(hash(render(kinds[1])), hash(canvases[1]), 'Wet cache eviction cannot change its seeded texture');
}

// A shape-bound gradient follows the shape rectangle, not the whole canvas.
{
  const { canvas, ctx } = make(160, 100), fill = { kind: 'linear', foreground: '#ff0000', background: '#0000ff', angle: 0 };
  marks.paintShape(ctx, { type: 'rect', x: 32, y: 16, width: 96, height: 48, fill });
  assert.ok(at(canvas, 34, 40)[0] > 240 && at(canvas, 34, 40)[2] < 15);
  assert.ok(at(canvas, 125, 40)[2] > 240 && at(canvas, 125, 40)[0] < 15); assert.equal(at(canvas, 10, 40)[3], 0);
  const faded = make(160, 100); marks.paintShape(faded.ctx, { type: 'rect', x: 32, y: 16, width: 96, height: 48, fill: { ...fill, transparentBackground: true } });
  assert.ok(at(faded.canvas, 80, 40)[3] > 110 && at(faded.canvas, 80, 40)[3] < 140); assert.ok(at(faded.canvas, 80, 40)[0] > 240);
  const radial = make(160, 100); marks.paintShape(radial.ctx, { type: 'rect', x: 32, y: 16, width: 96, height: 48, fill: { ...fill, kind: 'radial' } });
  assert.ok(at(radial.canvas, 80, 40)[0] > 240); assert.ok(at(radial.canvas, 34, 18)[2] > 210);
  const mirrored = make(160, 100); marks.paintShape(mirrored.ctx, { type: 'rect', x: 32, y: 16, width: 96, height: 48, fill: { ...fill, kind: 'reflected', transparentBackground: true } });
  assert.ok(at(mirrored.canvas, 80, 40)[3] > 248);
  assert.ok(at(mirrored.canvas, 33, 40)[3] < 15 && at(mirrored.canvas, 126, 40)[3] < 15);
}

// At 40% shape opacity, fill/outline overlap must never become 64%.
{
  const { canvas, ctx } = make();
  marks.paintShape(ctx, { type: 'rect', x: 20, y: 20, width: 90, height: 70, fill: '#000000', stroke: '#000000', strokeWidth: 12, opacity: 0.4 });
  const d = pixels(canvas); let max = 0; for (let i = 3; i < d.length; i += 4) max = Math.max(max, d[i]);
  assert.ok(max >= 100 && max <= 103, 'Opacity is applied once to the complete mark');
}

// Real system-font rendering, including CJK, multiline, italics and alignment.
for (const align of ['left', 'center', 'right']) {
  const { canvas, ctx } = make(360, 180);
  const bounds = marks.paintText(ctx, { text: 'Hello 轻绘\n中文与 Canvas', x: align === 'left' ? 15 : align === 'center' ? 180 : 345, y: 15,
    size: 30, fontFamily: 'Arial, "Microsoft YaHei", sans-serif', bold: true, italic: true, align, lineHeight: 1.4,
    fill: { kind: 'linear', foreground: '#ef4433', background: '#30678b', angle: 0 }, stroke: '#222222', strokeWidth: 1.5 });
  assertCovered(canvas, bounds, 'system text ' + align); assert.ok(bounds.height > 50); assert.ok(coverage(canvas).count > 250);
}
{
  const a = make(320, 160), b = make(320, 160);
  const opts = { text: 'MMMM', x: 15, y: 15, size: 70, fontFamily: 'sans-serif', bold: true, fill: '#000000' };
  marks.paintText(a.ctx, opts);
  const bounds = marks.paintText(b.ctx, { ...opts, fill: { kind: 'horizontal', foreground: '#000000', spacing: 8, thickness: 2, transparentBackground: true } });
  assertCovered(b.canvas, bounds, 'transparent textured glyphs');
  assert.ok(alphaCount(b.canvas) > 100 && alphaCount(b.canvas) < alphaCount(a.canvas) * 0.6);
}
{
  const { canvas, ctx } = make(130, 90);
  const bounds = marks.paintText(ctx, { text: '中文 ABC', x: -15, y: -5, size: 32, fontFamily: 'sans-serif', fill: '#000000', opacity: 0.5 });
  assertCovered(canvas, bounds, 'partially clipped text'); assert.equal(bounds.x, 0);
  assert.equal(marks.paintText(ctx, { text: ' \n  ' }), null);
  assert.equal(marks.paintShape(ctx, { type: 'rect', width: 40, height: 40, fill: null, stroke: null }), null);
  assert.throws(() => marks.paintText(ctx, { text: 'a'.repeat(2001) }), /2000/);
  assert.throws(() => marks.paintText(ctx, { text: Array(31).fill('a').join('\n') }), /30/);
}

{
  const hashes = new Set();
  for (const type of ['pentagon','octagon','parallelogram','trapezoid','bolt','sparkle','cloud','drop']) {
    const {canvas,ctx}=make();
    const bounds=marks.paintShape(ctx,{type,x:25,y:23,width:112,height:86,fill:'#ad4c32'});
    assertCovered(canvas,bounds,type); hashes.add(hash(canvas));
  }
  assert.equal(hashes.size,8);
  for (const type of marks.frameKinds) {
    const {canvas,ctx}=make();
    const bounds=marks.paintShape(ctx,{type,x:20,y:14,width:130,height:90,frameColor:'#ab4433',frameAccent:'#ffd900',frameWidth:12});
    assertCovered(canvas,bounds,type);
    assert.equal(at(canvas,80,60)[3],0,type+' keeps artwork visible through the centre');
    const d=pixels(canvas);
    assert(d.some((v,i)=>i%4===0&&v===171&&d[i+3]===255));
    assert(d.some((v,i)=>i%4===0&&v===255&&d[i+1]===217&&d[i+3]===255));
    hashes.add(hash(canvas));
  }
  assert.equal(hashes.size,12);
  const cards=new Set();
  for (const boxStyle of ['caption','balloon','ribbon','fold','bookplate']) {
    const {canvas,ctx}=make(300,200);
    const bounds=marks.paintText(ctx,{text:'题记\nNotes',x:50,y:40,size:23,boxStyle,boxColor:'#fcded0',boxAccent:'#ae4815',fill:'#222222'});
    assertCovered(canvas,bounds,boxStyle); cards.add(hash(canvas));
  }
  assert.equal(cards.size,5);
}
console.log('Drawing marks: geometry, frames, text boxes, directed marks, material alpha/density, Riso dry/wet fills, gradients, group opacity and English/CJK text passed.');
