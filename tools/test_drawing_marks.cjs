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

for (const type of ['rect', 'ellipse', 'star', 'triangle', 'heart']) {
  const { canvas, ctx } = make();
  const bounds = marks.paintShape(ctx, { type, x: 15, y: 15, width: 110, height: 90, fill: '#d43d28', stroke: '#213446', strokeWidth: 3 });
  assertCovered(canvas, bounds, type);
  assert.ok(at(canvas, 70, 65)[3] > 0, type + ' includes its body');
  assert.equal(at(canvas, 2, 2)[3], 0);
  if (type !== 'rect') assert.equal(at(canvas, 17, 17)[3], 0, type + ' must not be a disguised rectangular fill');
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
{
  const sparse = make(96, 96), dense = make(96, 96), thick = make(96, 96);
  const fill = { ...baseStyle, kind: 'horizontal', transparentBackground: true };
  marks.paintShape(sparse.ctx, { type: 'rect', width: 96, height: 96, fill });
  marks.paintShape(dense.ctx, { type: 'rect', width: 96, height: 96, fill: { ...fill, spacing: 6 } });
  marks.paintShape(thick.ctx, { type: 'rect', width: 96, height: 96, fill: { ...fill, thickness: 5 } });
  assert.ok(alphaCount(dense.canvas) > alphaCount(sparse.canvas) * 1.8, 'Spacing controls material density');
  assert.ok(alphaCount(thick.canvas) > alphaCount(sparse.canvas) * 1.8, 'Thickness controls line coverage');
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

console.log('Drawing marks: five shapes, reverse/square/circle bounds, material alpha/density, gradients, group opacity and English/CJK text passed.');
