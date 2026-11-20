/* Native Canvas/DOM contract tests; this does not launch or control a browser. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const native = require('@napi-rs/canvas');
const dom = new JSDOM('<!doctype html><div id="picker"></div><main id="workspace"><aside id="panel"><div id="handle"></div></aside><section id="draw" style="flex-grow:1"></section><aside id="settings"></aside></main>', { url: 'https://drawing.test/', runScripts: 'outside-only', pretendToBeVisual: true });
const win = dom.window, doc = win.document, backing = new WeakMap(), errors = [];
win.addEventListener('error', event => errors.push(event.error || event.message));
win.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type !== '2d') return null;
  if (!backing.has(this)) backing.set(this, native.createCanvas(this.width, this.height));
  return backing.get(this).getContext('2d');
};
win.HTMLElement.prototype.setPointerCapture = function (id) { this.captured = id; };
win.HTMLElement.prototype.hasPointerCapture = function (id) { return this.captured === id; };
win.HTMLElement.prototype.releasePointerCapture = function (id) { if (this.captured === id) this.captured = null; };
let workspaceWidth = 1200;
function rect(left, top, width, height) { return { left, top, x: left, y: top, right: left + width, bottom: top + height, width, height, toJSON() {} }; }
win.HTMLElement.prototype.getBoundingClientRect = function () {
  if (this.id === 'workspace') return rect(0, 0, workspaceWidth, 700);
  if (this.id === 'panel') return rect(0, 0, parseFloat(doc.getElementById('workspace').style.getPropertyValue('--ref-width')) || 286, 700);
  if (this.id === 'settings') return rect(960, 0, this.style.display === 'none' ? 0 : 240, 700);
  if (this.id === 'draw') return rect(286, 0, 674, 700);
  if (this.dataset.dcc === 'plane') return rect(20, 20, 200, 150);
  if (this.dataset.dcc === 'hue') return rect(20, 185, 200, 16);
  return rect(0, 0, 0, 0);
};
win.eval(fs.readFileSync(path.resolve(__dirname, '../assets/drawing-studio/color-controls.js'), 'utf8'));
const API = win.DrawingColorControls;
const query = name => doc.querySelector('[data-dcc="' + name + '"]');
const key = (target, name, shift = false) => target.dispatchEvent(new win.KeyboardEvent('keydown', { key: name, shiftKey: shift, bubbles: true, cancelable: true }));
function pointer(target, name, x, y, id = 1) {
  const event = new win.MouseEvent(name, { button: 0, clientX: x, clientY: y, bubbles: true, cancelable: true });
  Object.defineProperty(event, 'pointerId', { value: id }); Object.defineProperty(event, 'pointerType', { value: 'pen' });
  target.dispatchEvent(event);
}
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
async function main() {
  await test('HSV primaries and RGB round-trip preserve actual color values', () => {
    assert.equal(API.colorMath.normalize('abc'), '#aabbcc'); assert.equal(API.colorMath.normalize(['#ffffff']), null);
    const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255], [0, 0, 0], [38, 53, 68], [212, 125, 190]];
    for (const rgb of colors) { const hsv = API.colorMath.rgbToHsv(rgb, 210); assert.deepEqual(Array.from(API.colorMath.hsvToRgb(hsv.h, hsv.s, hsv.v)), rgb); }
    assert.deepEqual(Array.from(API.colorMath.hsvToRgb(120, 1, 1)), [0, 255, 0]);
  });
  let changes = [], picker, pickerBusy = false;
  picker = API.create({ host: doc.getElementById('picker'), getColor: () => '#3060d0', getDisabled: () => pickerBusy,
    onChange(hex, detail) { changes.push({ hex, detail }); picker.setColor(hex); } });
  await test('External setColor synchronizes HEX/RGB without a callback feedback loop', () => {
    assert.equal(changes.length, 0); picker.setColor('#d24232');
    assert.equal(picker.getColor(), '#d24232'); assert.equal(query('hex').value, '#D24232');
    assert.equal(query('r').value, '210'); assert.equal(query('g').value, '66'); assert.equal(query('b').value, '50'); assert.equal(changes.length, 0);
  });
  await test('Plane coordinates independently select saturation and brightness and emit a commit', () => {
    picker.setColor('#ff0000'); changes = [];
    pointer(query('plane'), 'pointerdown', 120, 95); pointer(query('plane'), 'pointerup', 120, 95);
    assert.equal(picker.getColor(), '#804040'); assert.equal(query('plane').captured, null);
    assert.ok(changes.some(c => !c.detail.commit)); assert.equal(changes.at(-1).detail.commit, true);
    const data = query('plane').querySelector('canvas').getContext('2d').getImageData(128, 83, 1, 1).data;
    assert.ok(Math.abs(data[0] - 128) < 3 && Math.abs(data[1] - 64) < 3, 'The actual plane color agrees with sampled HSV');
  });
  await test('Hue survives black/white echoes and becomes visible when brightness/saturation increases', () => {
    picker.setColor('#0000ff'); picker.setColor('#000000'); assert.equal(picker.getHSV().h, 240);
    key(query('hue'), 'ArrowRight', true); assert.equal(picker.getColor(), '#000000'); assert.equal(picker.getHSV().h, 255);
    key(query('plane'), 'ArrowUp', true); assert.ok(picker.getColor() !== '#000000'); assert.equal(picker.getHSV().h, 255);
    picker.setColor('#ffffff'); assert.equal(picker.getHSV().h, 255); key(query('plane'), 'ArrowRight', true);
    assert.ok(picker.getColor() !== '#ffffff'); assert.equal(picker.getHSV().h, 255);
    key(query('plane'), 'Home'); assert.equal(picker.getHSV().s, 0); key(query('plane'), 'End'); assert.equal(picker.getHSV().s, 1);
  });
  await test('HEX/RGB editing validates fields and propagates only valid explicit colors', () => {
    query('hex').value = '#3a8'; query('hex').dispatchEvent(new win.Event('change', { bubbles: true })); assert.equal(picker.getColor(), '#33aa88');
    query('r').value = '0'; query('r').dispatchEvent(new win.Event('input', { bubbles: true })); assert.equal(picker.getColor(), '#00aa88');
    const before = picker.getColor(); query('g').value = '300'; query('g').dispatchEvent(new win.Event('change', { bubbles: true }));
    assert.equal(picker.getColor(), before); assert.equal(query('g').getAttribute('aria-invalid'), 'true');
    query('hex').value = 'nope'; key(query('hex'), 'Enter'); assert.equal(picker.getColor(), before); assert.equal(query('hex').getAttribute('aria-invalid'), 'true');
    query('hex').value = '123456'; key(query('hex'), 'Enter'); assert.equal(picker.getColor(), '#123456'); assert.equal(query('hex').hasAttribute('aria-invalid'), false);
  });
  await test('Color pointer capture finishes on blur and respects disabled work', () => {
    changes = []; pointer(query('hue'), 'pointerdown', 120, 190, 7); assert.equal(query('hue').captured, 7);
    win.dispatchEvent(new win.Event('blur')); assert.equal(query('hue').captured, null); assert.equal(changes.at(-1).detail.commit, true);
    const before = picker.getColor(), count = changes.length; pickerBusy = true;
    pointer(query('plane'), 'pointerdown', 200, 20, 8); key(query('hue'), 'Home'); assert.equal(picker.getColor(), before); assert.equal(changes.length, count); pickerBusy = false;
  });
  let resizeEvents = [], splitBusy = false;
  const workspace = doc.getElementById('workspace'), panel = doc.getElementById('panel'), handle = doc.getElementById('handle');
  const splitter = API.installReferenceSplitter({ workspace, panel, handle, getDisabled: () => splitBusy, onResize(width, detail) { resizeEvents.push({ width, detail }); } });
  await test('Reference width clamps to available drawing space and provides keyboard limits', () => {
    assert.deepEqual({ ...splitter.getBounds() }, { min: 200, max: 624 }); assert.equal(splitter.setWidth(900), 624);
    key(handle, 'Home'); assert.equal(splitter.getWidth(), 200); key(handle, 'ArrowRight'); assert.equal(splitter.getWidth(), 210);
    key(handle, 'ArrowRight', true); assert.equal(splitter.getWidth(), 250); key(handle, 'End'); assert.equal(splitter.getWidth(), 624);
    assert.equal(handle.getAttribute('aria-orientation'), 'vertical'); assert.equal(handle.getAttribute('aria-valuenow'), '624');
  });
  await test('Divider captures pointer, commits final coordinates, and cleans up on blur', () => {
    splitter.setWidth(286); resizeEvents = [];
    pointer(handle, 'pointerdown', 286, 100, 12); pointer(handle, 'pointermove', 360, 100, 12); pointer(handle, 'pointerup', 390, 100, 12);
    assert.equal(splitter.getWidth(), 390); assert.equal(splitter.isDragging(), false); assert.equal(handle.captured, null);
    assert.equal(resizeEvents[0].detail.phase, 'start'); assert.equal(resizeEvents.at(-1).detail.phase, 'end');
    pointer(handle, 'pointerdown', 390, 100, 13); pointer(handle, 'pointermove', 420, 100, 13); win.dispatchEvent(new win.Event('blur'));
    assert.equal(splitter.getWidth(), 420); assert.equal(doc.body.classList.contains('dcc-resizing-reference'), false);
  });
  await test('Narrow overlay width stays inside the viewport and disabled drag leaves layout unchanged', () => {
    panel.style.position = 'absolute'; workspaceWidth = 360; splitter.refresh(); assert.equal(splitter.getWidth(), 312);
    assert.deepEqual({ ...splitter.getBounds() }, { min: 200, max: 312 }); splitBusy = true;
    key(handle, 'Home'); pointer(handle, 'pointerdown', 312, 100, 14); pointer(handle, 'pointermove', 210, 100, 14); pointer(handle, 'pointerup', 210, 100, 14);
    assert.equal(splitter.getWidth(), 312); assert.equal(splitter.isDragging(), false); splitBusy = false;
  });
  await test('Destroy removes picker and event behavior without retaining pointer capture', () => {
    picker.destroy(); assert.equal(doc.querySelector('.dcc-picker'), null);
    splitter.destroy(); const before = splitter.getWidth(); key(handle, 'Home'); assert.equal(splitter.getWidth(), before);
    assert.deepEqual(errors, []);
  });
  dom.window.close(); console.log('\n' + passed + ' color controls / divider contract checks passed.');
}
main().catch(error => { console.error(error.stack || error); dom.window.close(); process.exitCode = 1; });
