/* Development-only DOM/Canvas integration tests. This never starts a browser.
 * npm install --prefix /tmp/drawing-studio-test jsdom@26 fake-indexeddb@6 @napi-rs/canvas
 * NODE_PATH=/tmp/drawing-studio-test/node_modules node tools/test_drawing_app.cjs
 * If canvas is already supplied by the runtime, its node_modules can instead
 * be appended to NODE_PATH. No test dependencies are shipped to the website.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { Blob, File } = require('node:buffer');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');
const { IDBFactory } = require('fake-indexeddb');
const native = require('@napi-rs/canvas');
const ROOT = path.resolve(__dirname, '..');
const errors = [], requests = [], downloads = [];
const nativeCanvases = new WeakMap();
const VIEWPORT = { left: 300, top: 120, width: 800, height: 600 };
let passed = 0;
let liveWindow = null;
let workerRuns = 0;

function ensureCanvas(element) {
  let entry = nativeCanvases.get(element);
  if (!entry) {
    entry = { canvas: native.createCanvas(Math.max(1, element.width), Math.max(1, element.height)) };
    nativeCanvases.set(element, entry);
  }
  return entry;
}
function nativeSource(source) { return source?.tagName === 'CANVAS' ? ensureCanvas(source).canvas : source; }
function rect(left, top, width, height) { return { left, top, x: left, y: top, width, height, right: left + width, bottom: top + height, toJSON() { return this; } }; }
function surfaceRect(element, parentRect, defaultWidth, defaultHeight) {
  const transform = element.style.transform || '';
  const translate = transform.match(/translate(?:3d)?\(\s*([-\d.]+)px[,\s]+([-\d.]+)px/);
  const scale = Number(transform.match(/scale\(\s*([-\d.]+)/)?.[1]) || 1;
  const x = translate ? Number(translate[1]) : parseFloat(element.style.left) || 0;
  const y = translate ? Number(translate[2]) : parseFloat(element.style.top) || 0;
  const width = parseFloat(element.style.width) || defaultWidth, height = parseFloat(element.style.height) || defaultHeight;
  return rect(parentRect.left + x, parentRect.top + y, width * scale, height * scale);
}
class LocalResources extends ResourceLoader {
  fetch(url) {
    const parsed = new URL(url); requests.push(parsed.pathname);
    assert.equal(parsed.hostname, 'drawing-app.test', 'No unexpected external dependency');
    const file = path.resolve(ROOT, '.' + decodeURIComponent(parsed.pathname));
    assert.ok(file.startsWith(ROOT + path.sep), 'Resource must stay in this project');
    const result = fs.existsSync(file) ? Promise.resolve(fs.readFileSync(file)) : Promise.reject(new Error('Missing local resource ' + file));
    result.abort = () => {}; return result;
  }
}
function installShims(win) {
  win.Blob = Blob; win.File = File; win.structuredClone = structuredClone;
  win.indexedDB = new IDBFactory();
  win.TextEncoder = TextEncoder; win.TextDecoder = TextDecoder;
  win.matchMedia = query => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  win.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
  win.scrollTo = () => {}; win.confirm = () => true; win.alert = message => errors.push('Unexpected alert: ' + message);
  win.ImageData = native.ImageData; win.Path2D = native.Path2D; win.DOMMatrix = native.DOMMatrix;
  win.FileReader = class extends win.EventTarget {
    constructor() { super(); this.result = null; this.error = null; this.readyState = 0; }
    run(file, convert) {
      this.readyState = 1;
      Promise.resolve(file.arrayBuffer()).then(bytes => {
        this.result = convert(bytes); this.readyState = 2;
        const event = new win.Event('load'); this.onload?.(event); this.dispatchEvent(event);
        const end = new win.Event('loadend'); this.onloadend?.(end); this.dispatchEvent(end);
      }, error => {
        this.error = error; this.readyState = 2;
        const event = new win.Event('error'); this.onerror?.(event); this.dispatchEvent(event);
      });
    }
    readAsArrayBuffer(file) { this.run(file, bytes => bytes); }
    readAsDataURL(file) { this.run(file, bytes => 'data:' + (file.type || 'application/octet-stream') + ';base64,' + Buffer.from(bytes).toString('base64')); }
    readAsText(file) { this.run(file, bytes => Buffer.from(bytes).toString('utf8')); }
  };
  const blobs = new Map(); let nextBlob = 0;
  win.URL.createObjectURL = blob => { const url = 'blob:local-drawing-' + ++nextBlob; blobs.set(url, blob); return url; };
  win.URL.revokeObjectURL = url => blobs.delete(url);
  win.fetch = async value => {
    if (blobs.has(value)) return { ok: true, blob: async () => blobs.get(value), arrayBuffer: async () => blobs.get(value).arrayBuffer() };
    assert.ok(typeof value === 'string' && value.startsWith('data:'), 'Integration harness permits only local data/blob fetch');
    const split = value.indexOf(','), meta = value.slice(5, split), type = meta.split(';')[0];
    const bytes = /;base64$/.test(meta) ? Buffer.from(value.slice(split + 1), 'base64') : Buffer.from(decodeURIComponent(value.slice(split + 1)));
    return { ok: true, blob: async () => new Blob([bytes], { type }), arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
  };
  win.Image = class extends native.Image {
    set src(value) {
      if (typeof value === 'string' && blobs.has(value)) {
        blobs.get(value).arrayBuffer().then(bytes => { super.src = Buffer.from(bytes); }, error => this.onerror?.(error)); return;
      }
      if (typeof value === 'string' && value.startsWith('/assets/')) value = fs.readFileSync(path.join(ROOT, value));
      if (typeof value === 'string' && value.startsWith('https://drawing-app.test/')) value = fs.readFileSync(path.join(ROOT, new URL(value).pathname));
      super.src = value;
    }
    get src() { return super.src; }
  };
  win.createImageBitmap = async source => {
    const image = await native.loadImage(Buffer.from(await source.arrayBuffer())); image.close = () => {}; return image;
  };
  win.PointerEvent = class extends win.MouseEvent {
    constructor(type, options = {}) {
      super(type, options);
      for (const [key, value] of Object.entries({ pointerId: 1, pointerType: 'mouse', isPrimary: true, pressure: type === 'pointerup' ? 0 : 0.5,
        width: 1, height: 1, tiltX: 0, tiltY: 0, ...options })) {
        if (!['bubbles', 'cancelable', 'clientX', 'clientY', 'button', 'buttons', 'altKey', 'ctrlKey', 'shiftKey', 'metaKey', 'view'].includes(key)) {
          try { Object.defineProperty(this, key, { configurable: true, value }); } catch (_) {}
        }
      }
    }
    getCoalescedEvents() { return []; }
  };
  const capture = new WeakMap();
  win.Element.prototype.setPointerCapture = function (id) { const set = capture.get(this) || new Set(); set.add(id); capture.set(this, set); };
  win.Element.prototype.hasPointerCapture = function (id) { return capture.get(this)?.has(id) || false; };
  win.Element.prototype.releasePointerCapture = function (id) { capture.get(this)?.delete(id); };
  win.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  win.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new win.Event('close')); };
  // Run the deployed worker module in an isolated JS realm and use real
  // structured-clone transfer semantics. This is a protocol test, not a browser.
  win.Worker = class {
    constructor(url) {
      this.url = new URL(String(url)); this.stopped = false;
      const worker = this;
      const sandbox = { console: global.console, postMessage(value) {
        const data = structuredClone(value);
        queueMicrotask(() => { if (!worker.stopped) worker.onmessage?.({ data }); });
      } };
      sandbox.self = sandbox;
      sandbox.importScripts = (...urls) => {
        for (const value of urls) {
          const parsed = new URL(value, worker.url); assert.equal(parsed.hostname, 'drawing-app.test');
          const file = path.resolve(ROOT, '.' + parsed.pathname); assert.ok(file.startsWith(ROOT + path.sep));
          requests.push(parsed.pathname); vm.runInContext(fs.readFileSync(file, 'utf8'), worker.context, { filename: parsed.pathname });
        }
      };
      this.context = vm.createContext(sandbox); this.sandbox = sandbox;
      const file = path.resolve(ROOT, '.' + this.url.pathname); assert.ok(file.startsWith(ROOT + path.sep));
      requests.push(this.url.pathname); vm.runInContext(fs.readFileSync(file, 'utf8'), this.context, { filename: this.url.pathname });
    }
    postMessage(value, transfer = []) {
      // N-API image buffers are native/external and Node refuses to detach them;
      // browser ImageData buffers are detachable. Copy into a normal JS buffer,
      // then exercise the same transfer-list contract and verify detachment.
      assert.equal(transfer.length, 1); assert.equal(transfer[0], value.image.data.buffer);
      const input = { ...value, image: { ...value.image, data: new Uint8ClampedArray(value.image.data) } };
      const data = structuredClone(input, { transfer: [input.image.data.buffer] });
      assert.equal(input.image.data.byteLength, 0); workerRuns++;
      queueMicrotask(() => {
        if (this.stopped) return;
        try { this.sandbox.onmessage({ data }); } catch (error) { this.onerror?.(error); }
      });
    }
    terminate() { this.stopped = true; }
  };
  win.HTMLAnchorElement.prototype.click = function () {
    if (this.download) { downloads.push({ name: this.download, url: this.href, blob: blobs.get(this.href) }); return; }
    this.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true }));
  };
  const proto = win.HTMLCanvasElement.prototype;
  for (const property of ['width', 'height']) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, property);
    Object.defineProperty(proto, property, {
      configurable: true, enumerable: true, get() { return descriptor.get.call(this); },
      set(value) { descriptor.set.call(this, value); const entry = nativeCanvases.get(this); if (entry) entry.canvas[property] = Math.max(1, descriptor.get.call(this)); }
    });
  }
  proto.getContext = function (type) {
    if (type !== '2d') return null;
    const entry = ensureCanvas(this), element = this;
    if (!entry.context) {
      const context = entry.canvas.getContext('2d');
      entry.context = new Proxy(context, {
        get(target, key) {
          if (key === 'canvas') return element;
          if (key === 'drawImage') return (source, ...args) => target.drawImage(nativeSource(source), ...args);
          if (key === 'createPattern') return (source, ...args) => target.createPattern(nativeSource(source), ...args);
          const value = Reflect.get(target, key, target); return typeof value === 'function' ? value.bind(target) : value;
        },
        set(target, key, value) { return Reflect.set(target, key, value, target); }
      });
    }
    return entry.context;
  };
  proto.toDataURL = function (type = 'image/png', quality) { return ensureCanvas(this).canvas.toDataURL(type, quality); };
  proto.toBlob = function (callback, type = 'image/png', quality = 0.92) {
    // N-API takes JPEG/WebP encoder quality in percent; browser quality is 0..1.
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(type)) type = 'image/png';
    const bytes = ensureCanvas(this).canvas.toBuffer(type, type === 'image/png' ? undefined : Math.round(quality * 100));
    win.setTimeout(() => callback(new Blob([bytes], { type })), 0);
  };
  const originalRect = win.HTMLElement.prototype.getBoundingClientRect;
  win.HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.id === 'canvasViewport') return rect(VIEWPORT.left, VIEWPORT.top, VIEWPORT.width, VIEWPORT.height);
    if (this.id === 'referenceView') return rect(14, 180, 260, 360);
    if (this.id === 'canvasSurface') {
      const canvas = this.querySelector('canvas'); return surfaceRect(this, rect(VIEWPORT.left, VIEWPORT.top, VIEWPORT.width, VIEWPORT.height), canvas.width, canvas.height);
    }
    if (this.id === 'drawingCanvas') return this.parentElement.getBoundingClientRect();
    if (this.id === 'referenceCanvas') return surfaceRect(this, rect(14, 180, 260, 360), this.width, this.height);
    return originalRect.call(this);
  };
  Object.defineProperty(win.HTMLElement.prototype, 'clientWidth', { get() { return this.id === 'canvasViewport' ? VIEWPORT.width : this.id === 'referenceView' ? 260 : parseInt(this.style.width) || 0; } });
  Object.defineProperty(win.HTMLElement.prototype, 'clientHeight', { get() { return this.id === 'canvasViewport' ? VIEWPORT.height : this.id === 'referenceView' ? 360 : parseInt(this.style.height) || 0; } });
  win.addEventListener('error', event => errors.push(event.error?.stack || event.message));
  win.addEventListener('unhandledrejection', event => errors.push(String(event.reason)));
}

const hash = data => crypto.createHash('sha256').update(data).digest('hex');
function pixels(canvas) { return Buffer.from(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data); }
function pixel(canvas, x, y) { return Array.from(canvas.getContext('2d').getImageData(x, y, 1, 1).data); }
const plain = object => JSON.parse(JSON.stringify(object));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function eventually(check, message, ms = 3000) {
  const deadline = Date.now() + ms;
  do { if (check()) return; await wait(15); } while (Date.now() < deadline);
  assert.ok(check(), message);
}
async function test(name, run) { await run(); passed++; console.log('PASS ' + name); }
async function decoded(blob) {
  const bytes = Buffer.from(await blob.arrayBuffer()), image = await native.loadImage(bytes);
  const canvas = native.createCanvas(image.width, image.height); canvas.getContext('2d').drawImage(image, 0, 0);
  return { canvas, bytes, type: blob.type };
}

async function main() {
  const console = new VirtualConsole(); console.on('jsdomError', error => errors.push(error.stack || String(error)));
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'drawing-studio.html'), 'utf8'), {
    url: 'https://drawing-app.test/drawing-studio.html', runScripts: 'dangerously', resources: new LocalResources(),
    pretendToBeVisual: true, beforeParse: installShims, virtualConsole: console
  });
  const win = dom.window, doc = win.document; liveWindow = win;
  await new Promise(resolve => win.addEventListener('load', resolve, { once: true }));
  if (errors.length) throw new Error('Startup errors:\n' + errors.join('\n'));
  await eventually(() => !!win.DrawingStudio, 'DrawingStudio API should initialize');
  const app = win.DrawingStudio;
  const element = id => { const item = doc.getElementById(id); assert.ok(item, 'Missing UI element ' + id); return item; };
  const click = id => element(id).click();
  const select = (id, value) => { const input = element(id); input.value = String(value); input.dispatchEvent(new win.Event('change', { bubbles: true })); };
  const edit = (id, value) => { const input = element(id); input.value = String(value); input.dispatchEvent(new win.Event('input', { bubbles: true })); input.dispatchEvent(new win.Event('change', { bubbles: true })); };
  const check = (id, value) => { const input = element(id); input.checked = value; input.dispatchEvent(new win.Event('change', { bubbles: true })); };
  const tool = name => { const item = doc.querySelector('[data-tool="' + name + '"]'); assert.ok(item, 'Missing tool ' + name); item.click(); };
  const state = () => plain(app.inspect());
  const active = () => app.getLayer(state().activeId);
  const display = () => element('drawingCanvas');
  const settle = async () => { await wait(35); app.render(); await wait(20); };
  async function fresh(width = 128, height = 96, paper = 'transparent') {
    await app.newDocument({ width, height, title: 'Integration test', paper });
    tool('brush'); select('brushKind', 'fineliner'); edit('brushSize', 6); edit('brushOpacity', 100); edit('stabilizer', 0); edit('inkColor', '#d43224');
    await settle();
  }
  function pointer(type, x, y, extra = {}) {
    const bounds = display().getBoundingClientRect();
    const event = new win.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', isPrimary: true,
      clientX: bounds.left + x / display().width * bounds.width, clientY: bounds.top + y / display().height * bounds.height,
      button: 0, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1, pressure: type === 'pointerup' ? 0 : 0.5, ...extra });
    display().dispatchEvent(event); return event;
  }
  async function stroke(points, extra = {}) {
    pointer('pointerdown', points[0][0], points[0][1], extra);
    for (const point of points.slice(1)) pointer('pointermove', point[0], point[1], extra);
    const last = points[points.length - 1]; pointer('pointerup', last[0], last[1], { ...extra, pressure: 0 });
    await settle();
  }
  function seedLayer(layer, color, x = 0, y = 0, width = state().width, height = state().height) {
    const ctx = layer.canvas.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(x, y, width, height);
  }

  await test('Initial page loads entirely locally and defers the PDF component', async () => {
    assert.equal(state().width, 1280); assert.equal(state().height, 960); assert.equal(state().layers.length, 1);
    assert.ok(requests.includes('/assets/drawing-studio/core.js'));
    assert.ok(!requests.some(url => /pdf(?:\.worker)?\.mjs|vendor\/pdfjs/.test(url)), 'PDF must not load on an empty image-free startup');
    assert.ok(element('palettePreset').options.length >= 6); assert.ok(element('presetSwatches').querySelectorAll('button').length > 0);
  });

  await test('Transparent canvas, stroke opacity and per-stroke undo/redo retain actual pixels', async () => {
    await fresh(); assert.equal(pixel(display(), 0, 0)[3], 0);
    edit('brushOpacity', 40); await stroke([[20, 35], [80, 35], [45, 35]]);
    const layer = active(), drawn = hash(pixels(layer.canvas));
    assert.ok(pixel(layer.canvas, 40, 35)[3] >= 98 && pixel(layer.canvas, 40, 35)[3] <= 105, 'Self-overlap is composited at 40% once');
    assert.ok(state().history >= 1); await app.undo(); await settle(); assert.equal(pixel(active().canvas, 40, 35)[3], 0);
    await app.redo(); await settle(); assert.equal(hash(pixels(active().canvas)), drawn);
    assert.equal(pixel(display(), 120, 90)[3], 0);
  });

  await test('All four brush choices draw and eraser modifies alpha without painting white', async () => {
    for (const brush of ['gpen', 'fineliner', 'binary', 'pixel']) {
      await fresh(); select('brushKind', brush); await stroke([[15, 40], [110, 40]]);
      assert.ok(pixel(active().canvas, 60, 40)[3] > 0, brush + ' must connect the stroke');
      if (brush === 'binary' || brush === 'pixel') assert.ok(Array.from(pixels(active().canvas)).filter((_, i) => i % 4 === 3).every(alpha => alpha === 0 || alpha === 255));
    }
    tool('eraser'); edit('brushSize', 15); await stroke([[60, 40]]);
    assert.equal(pixel(active().canvas, 60, 40)[3], 0); assert.equal(pixel(display(), 60, 40)[3], 0);
    assert.ok(pixel(active().canvas, 25, 40)[3] > 0);
  });

  await test('Pointer coordinates remain correct after zoom and pan, with touch disabled by default', async () => {
    await fresh(); click('zoomIn'); click('zoomIn'); await settle();
    const start = state().view; tool('hand'); await stroke([[20, 20], [35, 28]]); assert.notDeepEqual(state().view, start);
    tool('brush'); await stroke([[40, 25], [90, 65]]);
    assert.ok(pixel(active().canvas, 40, 25)[3] > 0); assert.ok(pixel(active().canvas, 90, 65)[3] > 0);
    const before = hash(pixels(active().canvas)); await stroke([[15, 80], [100, 80]], { pointerType: 'touch', pressure: 1, pointerId: 9 });
    assert.equal(hash(pixels(active().canvas)), before, 'Palm/touch must not paint by default');
    check('touchDraw', true); await stroke([[15, 80], [100, 80]], { pointerType: 'touch', pressure: 1, pointerId: 9 });
    assert.notEqual(hash(pixels(active().canvas)), before);
  });

  await test('Pen pressure reaches the brush and cancelled/foreign pointers cannot leave it stuck', async () => {
    await fresh(); select('brushKind', 'gpen'); edit('brushSize', 24);
    pointer('pointerdown', 15, 35, { pointerType: 'pen', pointerId: 7, pressure: 0.1 });
    pointer('pointermove', 45, 35, { pointerType: 'pen', pointerId: 7, pressure: 0.1 });
    pointer('pointermove', 90, 35, { pointerType: 'pen', pointerId: 7, pressure: 0.9 });
    pointer('pointermove', 110, 35, { pointerType: 'pen', pointerId: 7, pressure: 0.9 });
    pointer('pointerup', 110, 35, { pointerType: 'pen', pointerId: 7, pressure: 0 }); await settle();
    const data = active().canvas.getContext('2d').getImageData(0, 0, 128, 96).data;
    const vertical = x => { let count = 0; for (let y = 0; y < 96; y++) if (data[(y * 128 + x) * 4 + 3] >= 128) count++; return count; };
    assert.ok(vertical(30) < vertical(100) / 2, 'The app must forward real pen pressure rather than a fixed default');
    pointer('pointerdown', 25, 75, { pointerType: 'pen', pointerId: 7, pressure: 0.5 });
    pointer('pointermove', 45, 75, { pointerType: 'pen', pointerId: 7, pressure: 0.5 });
    pointer('pointermove', 90, 85, { pointerType: 'touch', pointerId: 8, pressure: 1 });
    pointer('pointercancel', 45, 75, { pointerType: 'pen', pointerId: 7, pressure: 0 }); await settle();
    assert.equal(pixel(active().canvas, 90, 85)[3], 0, 'Unrelated touch must not join the pen stroke');
    select('brushKind', 'fineliner'); edit('brushSize', 4); await stroke([[90, 75], [110, 75]]);
    assert.ok(pixel(active().canvas, 100, 75)[3] > 0, 'New strokes must still work after pointercancel');
  });

  await test('Layer ordering, opacity and scale are real, reversible composition changes', async () => {
    await fresh(); const bottomId = state().activeId; seedLayer(active(), '#ff0000', 15, 15, 50, 50);
    await app.addLayer(); const topId = state().activeId; seedLayer(active(), '#0000ff', 30, 30, 50, 50); await settle();
    assert.deepEqual(pixel(display(), 40, 40), [0, 0, 255, 255]);
    edit('layerOpacity', 50); await settle(); const mixed = pixel(display(), 40, 40);
    assert.ok(Math.abs(mixed[0] - 127) <= 2 && Math.abs(mixed[2] - 128) <= 2);
    await app.undo(); await settle(); assert.deepEqual(pixel(display(), 40, 40), [0, 0, 255, 255]);
    click('layerDown'); await settle(); assert.deepEqual(pixel(display(), 40, 40), [255, 0, 0, 255]);
    await app.undo(); await settle(); assert.deepEqual(pixel(display(), 40, 40), [0, 0, 255, 255]);
    edit('layerScale', 150); await settle(); assert.equal(state().layers.find(layer => layer.id === topId).scale, 1.5);
    await app.undo(); await settle(); assert.equal(state().layers.find(layer => layer.id === topId).scale, 1);
    click('deleteLayer'); await settle(); assert.equal(state().layers.length, 1); assert.equal(state().layers[0].id, bottomId);
    await app.undo(); await settle(); assert.equal(state().layers.length, 2); assert.ok(app.getLayer(topId));
  });

  await test('Drawing into a moved/scaled layer and locking it use the correct local coordinates', async () => {
    await fresh(); seedLayer(active(), '#324f67', 12, 12, 8, 8);
    tool('move'); await stroke([[35, 30], [45, 38]]); edit('layerScale', 150); await settle();
    const meta = state().layers.find(layer => layer.id === state().activeId);
    assert.equal(meta.scale, 1.5); tool('brush'); edit('inkColor', '#ff0000');
    await stroke([[meta.x + 45 * meta.scale, meta.y + 40 * meta.scale], [meta.x + 60 * meta.scale, meta.y + 45 * meta.scale]]);
    assert.ok(pixel(active().canvas, 45, 40)[0] > 200 && pixel(active().canvas, 45, 40)[3] > 0);
    const drawn = hash(pixels(active().canvas));
    doc.querySelector('.layer-row.active .layer-lock').click();
    await stroke([[50, 75], [90, 75]]); assert.equal(hash(pixels(active().canvas)), drawn, 'Locked layer ignores drawing');
    doc.querySelector('.layer-row.active .layer-lock').click();
    doc.querySelector('.layer-row.active .layer-visibility').click();
    await stroke([[50, 75], [90, 75]]); assert.equal(hash(pixels(active().canvas)), drawn, 'Hidden layer ignores drawing');
  });

  await test('Canvas resize crops from the origin and undo restores the discarded pixels', async () => {
    await fresh(); await stroke([[15, 20], [110, 80]]);
    const before = hash(pixels(active().canvas));
    edit('canvasWidth', 64); edit('canvasHeight', 48); click('resizeCanvas'); await settle();
    assert.equal(state().width, 64); assert.equal(state().height, 48); assert.ok(pixel(active().canvas, 15, 20)[3] > 0);
    await app.undo(); await settle(); assert.equal(state().width, 128); assert.equal(state().height, 96);
    assert.equal(hash(pixels(active().canvas)), before); assert.ok(pixel(active().canvas, 110, 80)[3] > 0);
  });

  await test('Merged-layer bucket closes on linework and cutout removes only the chosen region', async () => {
    await fresh(); const lineId = state().activeId, ctx = active().canvas.getContext('2d');
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 4; ctx.strokeRect(24, 24, 70, 45); await app.addLayer();
    const fillId = state().activeId; click('layerDown'); select('fillSample', 'visible'); select('fillExpand', '0'); edit('tolerance', 10);
    tool('fill'); await stroke([[45, 45]]);
    assert.ok(pixel(app.getLayer(fillId).canvas, 45, 45)[3] > 0); assert.equal(pixel(app.getLayer(fillId).canvas, 5, 5)[3], 0);
    assert.deepEqual(pixel(app.getLayer(lineId).canvas, 24, 35), [0, 0, 0, 255]);
    const before = hash(pixels(app.getLayer(fillId).canvas)); tool('cutout'); await stroke([[45, 45]]);
    assert.equal(pixel(app.getLayer(fillId).canvas, 45, 45)[3], 0);
    await app.undo(); await settle(); assert.equal(hash(pixels(app.getLayer(fillId).canvas)), before);
  });

  await test('PNG/WebP/JPEG are genuine formats with correct transparency and flattened JPEG', async () => {
    await fresh(); await stroke([[20, 20], [90, 60]]);
    for (const mime of ['image/png', 'image/webp', 'image/jpeg']) {
      const out = await decoded(await app.exportRaster(mime, true, 0.95));
      assert.equal(out.type, mime); assert.equal(out.canvas.width, 128); assert.equal(out.canvas.height, 96);
      if (mime === 'image/png') assert.equal(out.bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      if (mime === 'image/webp') assert.equal(out.bytes.toString('ascii', 8, 12), 'WEBP');
      if (mime === 'image/jpeg') { assert.equal(out.bytes.subarray(0, 2).toString('hex'), 'ffd8'); assert.equal(pixel(out.canvas, 125, 90)[3], 255); }
      else assert.equal(pixel(out.canvas, 125, 90)[3], 0);
    }
    select('paper', 'warm'); await settle();
    const withPaper = await decoded(await app.exportRaster('image/png', false, 1));
    assert.equal(pixel(withPaper.canvas, 125, 90)[3], 255);
    const noPaper = await decoded(await app.exportRaster('image/png', true, 1)); assert.equal(pixel(noPaper.canvas, 125, 90)[3], 0);
  });

  await test('Non-destructive overall color adjustment agrees with exported PNG', async () => {
    await fresh(); seedLayer(active(), '#d04020', 20, 20, 40, 30); const original = hash(pixels(active().canvas));
    edit('hue', 120); edit('saturation', -35); edit('lightness', 12); await settle();
    assert.equal(hash(pixels(active().canvas)), original, 'Adjustments must not overwrite the layer');
    const exportImage = await decoded(await app.exportRaster('image/png', true, 1));
    assert.deepEqual(pixel(exportImage.canvas, 30, 30), pixel(display(), 30, 30));
    assert.notDeepEqual(pixel(display(), 30, 30), pixel(active().canvas, 30, 30));
    assert.equal(pixel(exportImage.canvas, 0, 0)[3], 0);
  });

  await test('SVG preview and export UI produce an actual local path file', async () => {
    await fresh(); seedLayer(active(), '#346551', 20, 20, 60, 45); await settle();
    click('exportOpen'); select('exportFormat', 'svg'); check('exportTransparent', true);
    select('vectorSimplify', '0'); click('vectorPreview');
    await eventually(() => !element('vectorPreviewWrap').hidden, 'Vector preview should be displayed');
    assert.ok(workerRuns > 0, 'The deployed worker module must receive a pixel-transfer request');
    assert.ok(requests.includes('/assets/drawing-studio/vector-worker.js'));
    assert.match(element('vectorStats').textContent, /组路径/);
    const before = downloads.length;
    element('exportForm').dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
    await eventually(() => downloads.length > before, 'SVG export should create a downloadable local file');
    const saved = downloads.at(-1); assert.match(saved.name, /\.svg$/); assert.equal(saved.blob.type, 'image/svg+xml');
    const text = await saved.blob.text(); assert.match(text, /<path /); assert.doesNotMatch(text, /<image|base64/i);
    element('exportDialog').close();
  });

  await test('Layer image import, reference modes and project round-trip preserve editable state', async () => {
    await fresh(); await stroke([[12, 12], [70, 65]]); const firstId = state().activeId;
    const image = native.createCanvas(40, 30), ctx = image.getContext('2d'); ctx.fillStyle = '#e8c290'; ctx.fillRect(0, 0, 40, 30); ctx.fillStyle = '#324f67'; ctx.fillRect(4, 4, 15, 15);
    const file = new File([image.toBuffer('image/png')], 'test-reference.png', { type: 'image/png' });
    await app.ref.load(file); await settle(); assert.equal(app.ref.getInfo().width, 40);
    for (const mode of ['original', 'gray', 'color', 'line']) {
      doc.querySelector('[data-ref-mode="' + mode + '"]').click(); await settle();
      assert.equal(app.ref.getInfo().mode, mode); assert.ok(app.ref.getCanvas());
    }
    assert.ok(element('referenceSwatches').querySelectorAll('button').length > 0);
    click('referenceToLayer'); await eventually(() => state().layers.length === 2, 'Reference should create a new editable image layer'); await settle();
    edit('layerOpacity', 70); edit('layerScale', 120); edit('hue', 20); await settle();
    const expectedState = state(), expectedLayerHashes = new Map(expectedState.layers.map(layer => [layer.id, hash(pixels(app.getLayer(layer.id).canvas))]));
    const expectedDisplay = hash(pixels(display()));
    const internal = await app.serializeProject(); assert.ok(internal.layers.every(layer => layer.image instanceof Blob));
    const json = await app.exportProject(); assert.equal(typeof json, 'string'); assert.match(json, /\$blob/);
    await fresh(64, 64); await app.loadProject(JSON.parse(json)); await settle();
    assert.equal(state().width, 128); assert.equal(state().height, 96); assert.equal(state().layers.length, 2);
    for (const layer of state().layers) assert.equal(hash(pixels(app.getLayer(layer.id).canvas)), expectedLayerHashes.get(layer.id));
    assert.ok(app.getLayer(firstId)); assert.deepEqual(state().tone, expectedState.tone); assert.equal(hash(pixels(display())), expectedDisplay);
    assert.equal(app.ref.getInfo().name, 'test-reference.png'); assert.equal(app.ref.getInfo().mode, 'line');
    await win.DrawingStorage.save('integration-roundtrip', internal);
    const stored = await win.DrawingStorage.load('integration-roundtrip'); assert.ok(stored?.project?.layers[0].image instanceof Blob);
  });

  await test('Invalid project dimensions fail without destroying the open artwork', async () => {
    const internal = await app.serializeProject(), before = hash(pixels(display())), beforeWidth = state().width;
    const malformed = { ...internal, width: -5 };
    await assert.rejects(app.loadProject(malformed)); await settle();
    assert.equal(state().width, beforeWidth); assert.equal(hash(pixels(display())), before);
  });

  await test('Malformed color value types are normalized or rejected before replacing the open artwork', async () => {
    const good = await app.serializeProject();
    assert.ok(good.reference?.palettes, 'This regression includes an actual saved reference');
    const cases = [
      project => { project.settings.ink = ['#ff0000']; },
      project => { project.settings.recentColors = [['#ff0000'], '#123456']; },
      project => { project.reference.palettes.color = [['#ff0000'], '#123456']; },
      project => { project.reference.palettes.gray = [['#808080'], '#404040']; },
      project => {
        project.settings.ink = ['#ff0000']; project.settings.recentColors = [['#ff0000']];
        project.reference.palettes.color = [['#ff0000']]; project.reference.palettes.gray = [['#808080']];
      }
    ];
    const protectedState = () => {
      const current = state();
      return { width: current.width, height: current.height, title: current.title, paper: current.paper,
        tone: current.tone, layers: current.layers, activeId: current.activeId, ink: current.ink, brush: current.brush,
        reference: current.reference, pixels: hash(pixels(display())) };
    };
    const validColor = value => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);
    for (let i = 0; i < cases.length; i++) {
      const candidate = structuredClone(good); candidate.title = 'Malformed color case ' + i; cases[i](candidate);
      const before = protectedState(); let rejection = null;
      try { await app.loadProject(candidate); } catch (error) { rejection = error; }
      await settle();
      if (rejection) {
        assert.deepEqual(protectedState(), before, 'A rejected project must not partially replace artwork/settings: case ' + i);
      } else {
        assert.equal(state().title, candidate.title, 'A normalized project should finish opening: case ' + i);
        const normalized = await app.serializeProject();
        assert.ok(validColor(normalized.settings.ink), 'Active ink must be a scalar HEX string');
        assert.ok(normalized.settings.recentColors.every(validColor), 'Recent colors must contain only scalar HEX strings');
        assert.ok(normalized.reference.palettes.color.every(validColor), 'Reference color palette must contain only scalar HEX strings');
        assert.ok(normalized.reference.palettes.gray.every(validColor), 'Reference gray palette must contain only scalar HEX strings');
        assert.ok(element('referenceSwatches').querySelectorAll('button').length > 0, 'Reference colors must remain usable');
        assert.equal(hash(pixels(display())), before.pixels, 'Malformed optional colors must not alter artwork pixels');
      }
    }
    await app.loadProject(good); await settle();
  });

  await test('Focus mode and keyboard shortcuts respect editing controls', async () => {
    click('focusMode'); assert.equal(element('focusMode').getAttribute('aria-pressed'), 'true');
    click('focusMode'); assert.equal(element('focusMode').getAttribute('aria-pressed'), 'false');
    element('layerName').focus(); const before = state().tool;
    element('layerName').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'e', bubbles: true, cancelable: true }));
    assert.equal(state().tool, before, 'Typing a layer name must not select eraser');
    element('layerName').blur(); doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'e', bubbles: true, cancelable: true }));
    assert.equal(state().tool, 'eraser');
  });

  if (errors.length) throw new Error('DOM runtime errors:\n' + errors.join('\n'));
  dom.window.close();
  global.console.log('Drawing application integration: ' + passed + ' checks passed.');
}
main().catch(error => {
  if (liveWindow) console.error('Last UI status:', liveWindow.document.getElementById('status')?.textContent, '|', liveWindow.document.getElementById('toast')?.textContent);
  liveWindow?.close(); console.error(error); process.exitCode = 1;
});
