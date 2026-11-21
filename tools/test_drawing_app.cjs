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
    if (this.id === 'workspace') return rect(0, 120, 1280, 600);
    if (this.id === 'referencePanel') {
      const workspace = this.ownerDocument.getElementById('workspace');
      const width = parseFloat(workspace?.style.getPropertyValue('--ref-width')) || 286;
      return rect(0, 120, width, 600);
    }
    if (this.id === 'settingsPanel') return rect(1040, 120, 240, 600);
    if (this.id === 'canvasViewport') return rect(VIEWPORT.left, VIEWPORT.top, VIEWPORT.width, VIEWPORT.height);
    if (this.id === 'referenceView') return rect(14, 180, 260, 360);
    if (this.dataset?.dcc === 'plane') return rect(1050, 340, 224, 160);
    if (this.dataset?.dcc === 'hue') return rect(1050, 510, 224, 18);
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
function inkStats(canvas) {
  const data = pixels(canvas); let count = 0, maxAlpha = 0, alphaSum = 0;
  let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const alpha = data[(y * canvas.width + x) * 4 + 3];
    if (!alpha) continue;
    count++; alphaSum += alpha; maxAlpha = Math.max(maxAlpha, alpha);
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return { count, alphaSum, maxAlpha, left, right, top, bottom, width: count ? right - left + 1 : 0, height: count ? bottom - top + 1 : 0 };
}
const plain = object => JSON.parse(JSON.stringify(object));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function eventually(check, message, ms = 3000) {
  const deadline = Date.now() + ms;
  do { if (check()) return; await wait(15); } while (Date.now() < deadline);
  assert.ok(check(), message);
}
const testFilter = process.env.DRAWING_TEST_FILTER && new RegExp(process.env.DRAWING_TEST_FILTER, 'i');
async function test(name, run) { if (testFilter && !testFilter.test(name)) return; await run(); passed++; console.log('PASS ' + name); }
async function decoded(blob) {
  const bytes = Buffer.from(await blob.arrayBuffer()), image = await native.loadImage(bytes);
  const canvas = native.createCanvas(image.width, image.height); canvas.getContext('2d').drawImage(image, 0, 0);
  return { canvas, bytes, type: blob.type };
}

async function openStudio(database = new IDBFactory(), configure = () => {}) {
  const console = new VirtualConsole(); console.on('jsdomError', error => errors.push(error.stack || String(error)));
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'drawing-studio.html'), 'utf8'), {
    url: 'https://drawing-app.test/drawing-studio.html', runScripts: 'dangerously', resources: new LocalResources(),
    // Legacy drawing suites deliberately exercise mouse brush input. Production defaults
    // to pen-only; individual tests can delete/override this fixture in configure().
    pretendToBeVisual: true, beforeParse(win) {
      installShims(win); win.indexedDB = database;
      win.localStorage.setItem('lrx-drawing-pen-only-brush-v1', 'off');
      configure(win);
    }, virtualConsole: console
  });
  const win = dom.window;
  await new Promise(resolve => win.addEventListener('load', resolve, { once: true }));
  if (errors.length) throw new Error('Startup errors:\n' + errors.join('\n'));
  await eventually(() => !!win.DrawingStudio, 'DrawingStudio API should initialize');
  return dom;
}

async function main() {
  const dom = await openStudio(), win = dom.window, doc = win.document; liveWindow = win;
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


  await test('Six quick colors include accessible pure white without changing palette presets', async () => {
    const buttons = Array.from(element('baseSwatches').querySelectorAll('button'));
    assert.deepEqual(buttons.map(button => button.dataset.color), [
      '#000000', '#3f271f', '#75503b', '#3a3a3a', '#808080', '#ffffff'
    ], 'Six standard colors stay ordered and independent of preset swatches');
    assert.ok(buttons.every(button => button.textContent === ''), 'Quick colors remain unlabeled visually');
    assert.match(buttons[5].getAttribute('aria-label'), /纯白/, 'White swatch keeps an accessible label');
    const css = fs.readFileSync(path.join(ROOT, 'assets/drawing-studio/style.css'), 'utf8');
    assert.match(css, /\\.palette-basics\\s*\\{[^}]*grid-template-columns:\\s*repeat\\(6,/,
      'Six quick colors fit in a single CSS grid row');
    buttons[5].click();
    assert.equal(state().ink, '#ffffff', 'Clicking white selects the pure white brush color');
    assert.match(element('inkReadout').textContent, /纯白/, 'White is recognized as a quick color');
  });

  await test('Pen-only brush defaults on and preserves mouse editing tools, pen pressure and opt-out', async () => {
    const prefKey = 'lrx-drawing-pen-only-brush-v1';
    const isolated = await openStudio(new IDBFactory(), w => w.localStorage.removeItem(prefKey));
    const w = isolated.window, d = w.document, api = w.DrawingStudio;
    const field = id => d.getElementById(id);
    const image = () => api.getLayer(api.inspect().activeId).canvas;
    const choose = mode => d.querySelector('[data-tool="' + mode + '"]').click();
    const finger = (type, x, y, extra = {}) => {
      const c = field('drawingCanvas'), r = c.getBoundingClientRect();
      c.dispatchEvent(new w.PointerEvent(type, {
        bubbles: true, cancelable: true, pointerId: 77, pointerType: 'mouse',
        button: 0, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
        clientX: r.left + x / c.width * r.width, clientY: r.top + y / c.height * r.height,
        pressure: type === 'pointerup' ? 0 : .5, ...extra
      }));
    };
    const drag = (points, extra = {}) => {
      finger('pointerdown', ...points[0], extra);
      for (const p of points.slice(1)) finger('pointermove', ...p, extra);
      finger('pointerup', ...points[points.length - 1], { ...extra, pressure: 0 });
      api.render();
    };
    const editField = (id, value) => {
      field(id).value = value;
      field(id).dispatchEvent(new w.Event('change', { bubbles: true }));
    };
    try {
      await api.newDocument({ width: 128, height: 96, paper: 'transparent' });
      assert.equal(field('penOnlyBrush').checked, true, 'A fresh installation enables this by default');
      assert.equal(api.inspect().penOnlyBrush, true);
      const blank = hash(pixels(image())), viewBefore = { ...api.inspect().view };
      drag([[15, 25], [65, 25]]);
      assert.equal(hash(pixels(image())), blank, 'Mouse brush never writes pixels');
      assert.equal(api.inspect().history, 0, 'Mouse pan does not add undo steps');
      assert.notEqual(api.inspect().view.x, viewBefore.x, 'Mouse drag pans the viewport instead');
      drag([[25, 48], [95, 48]], { pointerType: 'pen', pressure: .7 });
      assert.ok(inkStats(image()).count > 0, 'A real pen-pointer event still paints');
      const afterPen = inkStats(image()).count;
      choose('eraser');
      drag([[25, 48], [95, 48]]);
      assert.ok(inkStats(image()).count < afterPen, 'Mouse eraser remains usable when pen-only brush is on');
      choose('fill'); editField('fillScope', 'layer');
      const beforeFill = api.inspect().history;
      drag([[35, 30]]);
      assert.ok(api.inspect().history > beforeFill, 'Mouse fill still creates undoable pixels');
      choose('shape');
      const beforeShape = api.inspect().history;
      drag([[15, 14], [40, 30]]);
      assert.ok(api.inspect().history > beforeShape, 'Mouse can still place shapes');
      choose('move');
      const beforeMove = api.getLayer(api.inspect().activeId).x;
      drag([[15, 20], [25, 20]]);
      assert.notEqual(api.getLayer(api.inspect().activeId).x, beforeMove, 'Mouse can still move layers');
      choose('brush');
      const fromMouse = hash(pixels(image())), pickerHistory = api.inspect().history;
      drag([[30, 30]], { altKey: true });
      assert.equal(hash(pixels(image())), fromMouse, 'Alt+mouse remains a picker, not a brush');
      assert.equal(api.inspect().history, pickerHistory);
      field('penOnlyBrush').checked = false;
      field('penOnlyBrush').dispatchEvent(new w.Event('change', { bubbles: true }));
      assert.equal(api.inspect().penOnlyBrush, false);
      assert.equal(w.localStorage.getItem(prefKey), 'off');
      await api.newDocument({ width: 128, height: 96, paper: 'transparent' });
      drag([[22, 36], [87, 36]]);
      assert.ok(inkStats(image()).count > 0, 'Disabling the option restores mouse brush drawing');
      field('penOnlyBrush').checked = true;
      field('penOnlyBrush').dispatchEvent(new w.Event('change', { bubbles: true }));
      assert.equal(w.localStorage.getItem(prefKey), 'on');
      const beforeTouch = hash(pixels(image()));
      drag([[30, 65], [60, 65]], { pointerType: 'touch' });
      assert.equal(hash(pixels(image())), beforeTouch, 'Touch still pans by default independently of pen-only mode');
      field('touchDraw').checked = true;
      field('touchDraw').dispatchEvent(new w.Event('change', { bubbles: true }));
      drag([[30, 70], [80, 70]], { pointerType: 'touch' });
      assert.notEqual(hash(pixels(image())), beforeTouch, 'Explicit finger-draw continues to work');
    } finally { isolated.window.close(); }
    const saved = await openStudio(new IDBFactory(), w => w.localStorage.setItem(prefKey, 'off'));
    try {
      assert.equal(saved.window.DrawingStudio.inspect().penOnlyBrush, false, 'Off preference survives startup');
      assert.equal(saved.window.document.getElementById('penOnlyBrush').checked, false);
    } finally { saved.window.close(); }
  });

  await test('Desktop close drains an older autosave and commits the final stroke, slider and layer movement', async () => {
    await fresh();
    const layer = active(), encode = layer.canvas.toBlob.bind(layer.canvas);
    let releaseEncoder, holdOnce = true, closed = false;
    layer.canvas.toBlob = (callback, ...args) => encode(blob => {
      if (holdOnce) { holdOnce = false; releaseEncoder = () => callback(blob); }
      else callback(blob);
    }, ...args);
    try {
      pointer('pointerdown', 10, 15); pointer('pointermove', 50, 15); pointer('pointerup', 50, 15);
      const older = app.saveDraft();
      await eventually(() => !!releaseEncoder, 'First revision must be held in its real PNG encoder');
      const slider = element('layerOpacity'); slider.value = '42'; slider.dispatchEvent(new win.Event('input', { bubbles: true }));
      pointer('pointerdown', 15, 45); pointer('pointermove', 65, 45);
      assert.equal(state().drawing, true);
      const closing = app.prepareToClose().then(result => { closed = true; return result; });
      await wait(25);
      assert.equal(closed, false, 'Closing cannot finish while an older save is still serializing');
      assert.equal(state().drawing, false); assert.ok(doc.body.classList.contains('busy'));
      const expected = hash(pixels(layer.canvas)), finalRevision = state().revision;
      pointer('pointerdown', 80, 70); pointer('pointerup', 90, 70);
      assert.equal(state().revision, finalRevision, 'New drawing is blocked while closing is saving');
      releaseEncoder(); releaseEncoder = null;
      await older;
      assert.equal(await closing, true);
      assert.equal(state().savedRevision, finalRevision); assert.equal(state().dirty, false);
      const stored = (await win.DrawingStorage.readCurrent()).project;
      assert.equal(stored.layers[0].opacity, .42);
      assert.equal(hash((await decoded(stored.layers[0].image)).canvas.getContext('2d').getImageData(0, 0, 128, 96).data), expected);
      tool('move'); pointer('pointerdown', 30, 30); pointer('pointermove', 42, 39);
      assert.equal(await app.prepareToClose(), true);
      const moved = (await win.DrawingStorage.readCurrent()).project.layers[0];
      assert.ok(Math.abs(moved.x - 12) < 1e-8); assert.ok(Math.abs(moved.y - 9) < 1e-8);
    } finally { if (releaseEncoder) releaseEncoder(); layer.canvas.toBlob = encode; }
  });

  await test('Desktop close waits for the storage queue and keeps failed saves open for retry', async () => {
    await fresh();
    const storage = win.DrawingStorage;
    let releaseRead, completed = false;
    win.DrawingStorage = { ...storage, readCurrent: () => new Promise(resolve => { releaseRead = async () => resolve(await storage.readCurrent()); }) };
    try {
      const closing = app.prepareToClose().then(result => { completed = true; return result; });
      await eventually(() => !!releaseRead, 'Close must enter the storage queue barrier');
      await wait(20); assert.equal(completed, false);
      await releaseRead(); assert.equal(await closing, true);
      win.DrawingStorage = { ...storage, writeCurrent: async () => { throw new Error('Desktop test quota failure'); } };
      pointer('pointerdown', 10, 10); pointer('pointermove', 50, 30);
      await assert.rejects(app.prepareToClose(), /Desktop test quota failure/);
      assert.equal(state().drawing, false); assert.equal(state().dirty, true);
      assert.equal(doc.body.classList.contains('busy'), false);
      assert.ok(inkStats(active().canvas).count > 0, 'Failed closing save must retain pixels');
      win.DrawingStorage = storage;
      assert.equal(await app.prepareToClose(), true); assert.equal(state().dirty, false);
    } finally { win.DrawingStorage = storage; }
  });

  await test('Desktop project exports only count as saved after the native write completes', async () => {
    await fresh();
    const storage = win.DrawingStorage, before = downloads.length;
    let finishSave, calls = 0;
    win.DrawingStorage = { ...storage, writeCurrent: async () => { throw new Error('Desktop export quota fixture'); } };
    win.DrawingDesktop = { save: async () => { calls++; return false; }, ready: async () => {} };
    function unloadBlocked() {
      const event = new win.Event('beforeunload', { cancelable: true }); win.dispatchEvent(event); return event.defaultPrevented;
    }
    try {
      await stroke([[15, 25], [70, 25]]);
      assert.equal(state().dirty, true); assert.equal(unloadBlocked(), true);
      click('saveProject');
      await eventually(() => calls === 1 && !doc.body.classList.contains('busy'), 'Canceled native save must finish without a success state');
      assert.match(element('status').textContent, /已取消保存工程/);
      assert.equal(unloadBlocked(), true, 'Canceled file save must not mark the revision as exported');
      win.DrawingDesktop.save = (blob, name) => {
        calls++; assert.equal(blob.type, 'application/json'); assert.match(name, /\.lrxdraw$/);
        return new Promise(resolve => { finishSave = resolve; });
      };
      click('saveProject'); await eventually(() => !!finishSave, 'Native writer must receive the real project Blob');
      assert.equal(await app.prepareToClose(), false, 'A pending export is busy, so closing must be refused');
      assert.equal(unloadBlocked(), true); assert.doesNotMatch(element('status').textContent, /工程已导出/);
      finishSave(true); finishSave = null;
      await eventually(() => !doc.body.classList.contains('busy'), 'Successful native write must release the UI');
      assert.match(element('status').textContent, /工程已导出/); assert.equal(unloadBlocked(), false);
      assert.equal(downloads.length, before, 'Desktop exports must not create browser anchor downloads');
    } finally {
      if (finishSave) finishSave(false);
      delete win.DrawingDesktop; win.DrawingStorage = storage; await app.saveDraft();
    }
  });

  await test('Desktop raster cancellation preserves the export dialog and browser fallback still downloads', async () => {
    await fresh();
    const before = downloads.length;
    win.DrawingDesktop = { save: async () => false, ready: async () => {} };
    try {
      click('exportOpen'); select('exportFormat', 'png');
      element('exportForm').dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
      await eventually(() => !doc.body.classList.contains('busy'), 'Canceled raster export must release the UI');
      assert.equal(element('exportDialog').open, true); assert.match(element('status').textContent, /已取消导出/);
      assert.equal(downloads.length, before);
      delete win.DrawingDesktop;
      element('exportForm').dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
      await eventually(() => downloads.length === before + 1 && !doc.body.classList.contains('busy'), 'Web fallback must preserve normal local downloads');
      assert.equal(element('exportDialog').open, false); assert.match(downloads.at(-1).name, /\.png$/);
    } finally { delete win.DrawingDesktop; element('exportDialog').close(); }
  });

  await test('Desktop ready is signaled after restoring the saved artwork and exposing the closing API', async () => {
    await fresh(92, 68); await stroke([[12, 18], [64, 41]]); await app.prepareToClose();
    const original = state(); let ready = false;
    const restored = await openStudio(win.indexedDB, other => {
      other.DrawingDesktop = { save: async () => false, ready: async () => {
        assert.equal(other.DrawingStudio.inspect().width, original.width);
        assert.equal(other.DrawingStudio.inspect().height, original.height);
        assert.equal(other.DrawingStudio.inspect().activeId, original.activeId);
        assert.equal(other.document.body.classList.contains('busy'), false);
        assert.equal(await other.DrawingStudio.prepareToClose(), true);
        ready = true;
      } };
    });
    try { await eventually(() => ready, 'Native ready callback must run only after automatic restoration'); }
    finally { restored.window.close(); }
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

  await test('Canvas right-click undoes once without adding a dot; other context menus do not undo', async () => {
    await fresh(); await stroke([[15, 25], [75, 25]]);
    const first = hash(pixels(active().canvas));
    await stroke([[15, 65], [75, 65]]);
    const second = hash(pixels(active().canvas)), count = state().history;
    pointer('pointerdown', 100, 80, { button: 2, buttons: 2 });
    pointer('pointermove', 110, 85, { button: 2, buttons: 2 });
    assert.equal(state().drawing, false); assert.equal(hash(pixels(active().canvas)), second);
    const menu = new win.MouseEvent('contextmenu', { button: 2, bubbles: true, cancelable: true });
    display().dispatchEvent(menu); pointer('pointerup', 110, 85, { button: 2, buttons: 0 }); await settle();
    assert.equal(menu.defaultPrevented, true); assert.equal(state().history, count - 1);
    assert.equal(hash(pixels(active().canvas)), first); assert.equal(state().redo, 1);
    click('redo'); await settle(); assert.equal(hash(pixels(active().canvas)), second);
    display().dispatchEvent(new win.MouseEvent('contextmenu', { button: 0, bubbles: true, cancelable: true }));
    display().dispatchEvent(new win.PointerEvent('contextmenu', { button: 2, pointerType: 'touch', bubbles: true, cancelable: true }));
    doc.body.dispatchEvent(new win.MouseEvent('contextmenu', { button: 2, bubbles: true, cancelable: true }));
    element('helpDialog').showModal();
    display().dispatchEvent(new win.MouseEvent('contextmenu', { button: 2, bubbles: true, cancelable: true }));
    element('helpDialog').close();
    assert.equal(state().history, count); assert.equal(hash(pixels(active().canvas)), second);
  });

  await test('Right-click finishes and undoes an active stroke and is safe on empty history', async () => {
    await fresh();
    display().dispatchEvent(new win.MouseEvent('contextmenu', { button: 2, bubbles: true, cancelable: true }));
    assert.equal(state().history, 0); assert.equal(state().drawing, false);
    await stroke([[15, 25], [75, 25]]);
    const first = hash(pixels(active().canvas)), count = state().history;
    pointer('pointerdown', 15, 65); pointer('pointermove', 75, 65);
    assert.equal(state().drawing, true);
    display().dispatchEvent(new win.MouseEvent('contextmenu', { button: 2, bubbles: true, cancelable: true }));
    pointer('pointerup', 75, 65); await settle();
    assert.equal(state().drawing, false); assert.equal(state().history, count);
    assert.equal(hash(pixels(active().canvas)), first); assert.equal(state().redo, 1);
  });

  await test('Brush preferences restore independently and export uses Beijing year-day-month time', async () => {
    await fresh(); select('brushKind', 'marker'); edit('brushSize', 47); edit('brushOpacity', 38);
    edit('stabilizer', 62); check('penPressure', false);
    select('brushKind', 'pencil'); edit('brushSize', 5); edit('brushOpacity', 82);
    select('brushKind', 'marker');
    assert.deepEqual([state().size,state().opacity,state().stabilizer,element('penPressure').checked], [47,.38,62,false]);
    tool('eraser'); edit('brushSize', 18); tool('brush'); assert.equal(state().size,47);
    click('resetBrushProfile'); select('brushKind','pencil'); assert.equal(state().size,5);
    assert.equal(state().opacity,.82); click('resetBrushProfile');
    assert.equal(win.studioExportName(new Date('2026-11-20T16:07:00Z')), '2026年21日11月00时07分');
  });

  await test('Saved brush profiles survive new artwork and override older project settings without replacing its ink', async () => {
    const profile = () => [state().size, state().opacity, state().stabilizer, element('penPressure').checked];
    await fresh(); select('brushKind', 'squarePaint');
    edit('brushSize', 37); edit('brushOpacity', 52); edit('stabilizer', 26); check('penPressure', false);
    select('brushKind', 'gouache'); edit('brushSize', 19); edit('brushOpacity', 83);
    const other = profile();
    await app.newDocument({width: 96, height: 96, paper: 'transparent'});
    select('brushKind', 'squarePaint'); assert.deepEqual(profile(), [37,.52,26,false]);
    const old = await app.serializeProject();
    old.settings = { ...old.settings, brush: 'squarePaint', ink: '#287040', size: 92, opacity: .29, stabilizer: 1, pressureEnabled: true };
    await app.loadProject(old);
    assert.deepEqual(profile(), [37,.52,26,false], 'personal settings win when a project has an older copy');
    assert.equal(state().ink, '#287040', 'the project restores its global ink');
    select('brushKind', 'gouache'); assert.deepEqual(profile(), other); assert.equal(state().ink, '#287040');
    select('brushKind', 'squarePaint'); click('resetBrushProfile');
    const recommended = win.DrawingCore.brushPresets.find(p => p.id === 'squarePaint');
    assert.deepEqual(profile(), [recommended.size, recommended.opacity, recommended.stabilizer, true]);
    select('brushKind', 'gouache'); assert.deepEqual(profile(), other, 'reset affects just the selected brush');
    old.settings.brush = 'spatter'; await app.loadProject(old);
    assert.deepEqual(profile(), [92,.29,1,true], 'a legacy project seeds an unused brush');
    assert.deepEqual(await app.serializeProject().then(p => [p.settings.brush,p.settings.size,p.settings.ink]), ['spatter',92,'#287040']);
    click('resetBrushProfile'); select('brushKind','gouache'); click('resetBrushProfile');
  });

  await test('A saved preference from another tab applies after the active stroke finishes', async () => {
    await fresh(); select('brushKind', 'plainSquare'); edit('brushSize', 9); edit('brushOpacity', 100); edit('stabilizer', 0);
    pointer('pointerdown', 12, 42, {pointerId: 4}); pointer('pointermove', 48, 42, {pointerId: 4});
    const key = 'lrx-drawing-brush-v1:plainSquare';
    const profile = JSON.stringify({size: 41, opacity: .47, stabilizer: 32, pressureEnabled: false});
    win.localStorage.setItem(key, profile); win.dispatchEvent(new win.StorageEvent('storage', {key, newValue: profile}));
    assert.equal(state().size, 9); assert.equal(state().opacity, 1); assert.ok(state().drawing);
    pointer('pointermove', 100, 42, {pointerId: 4}); pointer('pointerup', 100, 42, {pointerId: 4}); await settle();
    assert.deepEqual([state().size,state().opacity,state().stabilizer,element('penPressure').checked], [41,.47,32,false]);
    assert.equal(pixel(active().canvas, 78, 32)[3], 0, 'remote wide brush did not alter the gesture');
    assert.equal(pixel(active().canvas, 78, 42)[3], 255, 'stroke opacity was also frozen');
    click('resetBrushProfile');
  });

  await test('A valid typed size and slider changes save on input before blur or release', async () => {
    await fresh(); select('brushKind','fountain');
    const inputOnly = (id, value) => {
      const node = element(id); node.value = value;
      node.dispatchEvent(new win.Event('input', {bubbles:true}));
    };
    inputOnly('brushSize','61'); inputOnly('brushOpacity','46'); inputOnly('stabilizer','77');
    const getSaved = () => JSON.parse(win.localStorage.getItem('lrx-drawing-brush-v1:fountain'));
    assert.deepEqual(getSaved(), {size:61, opacity:.46, stabilizer:77, pressureEnabled:true});
    for (const invalid of ['', '260', '5.5']) {
      inputOnly('brushSize',invalid);
      assert.equal(element('brushSize').value,invalid,'intermediate typing remains editable');
      assert.equal(getSaved().size,61,'an unfinished or out-of-range number does not replace a valid preference');
    }
    select('brushKind','gpen'); select('brushKind','fountain');
    assert.equal(element('brushSize').value,'61'); assert.equal(state().opacity,.46); assert.equal(state().stabilizer,77);
    click('resetBrushProfile');
  });

  await test('Path pen is removed while the soft fountain brush and old raster projects remain usable', async () => {
    await fresh();
    assert.equal(doc.querySelector('[data-tool="pen"]'), null);
    assert.equal(doc.getElementById('penOverlay'), null);
    assert.equal(doc.getElementById('penQuick'), null);
    assert.ok(Array.from(element('brushKind').options).some(option => option.value === 'fountain' && option.textContent.includes('软尖钢笔')));
    select('brushKind', 'fountain'); await stroke([[15, 35], [105, 60]]);
    const before = hash(pixels(active().canvas));
    const project = JSON.parse(await app.exportProject());
    project.settings.tool = 'pen';
    project.layers[0].pendingPath = { version: 1, layerId: project.layers[0].id, nodes: [{ x: 10, y: 10 }, { x: 50, y: 20 }] };
    await app.loadProject(project);
    assert.equal(state().tool, 'brush'); assert.equal(state().brush, 'fountain');
    assert.equal(hash(pixels(active().canvas)), before, 'Removing the editing tool must retain committed pixels');
    const history = state().history;
    for (const key of ['p', 'Enter']) doc.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    assert.equal(state().history, history); assert.equal(hash(pixels(active().canvas)), before);
  });

  await test('All brush presets paint and eraser modifies alpha without painting white', async () => {
    const brushes = ['gpen', 'fineliner', 'plainSquare', 'fountain', 'wetMix', 'smudge', 'stoneChalk', 'softRound', 'squarePaint', 'patinaInk', 'patinaGrain', 'pencil', 'charcoal', 'marker', 'brushMarker', 'dry', 'airbrush',
      'gouache', 'wash', 'spatter', 'maru', 'hairHatch', 'screentone', 'sparkle', 'binary', 'pixel'];
    assert.deepEqual(Array.from(element('brushKind').options, option => option.value).sort(), [...brushes].sort());
    for (const brush of brushes) {
      await fresh(); select('brushKind', brush); await stroke([[15, 40], [110, 40]]);
      const middle = active().canvas.getContext('2d').getImageData(46, 0, 28, 96).data;
      assert.equal(middle.some((value, i) => i % 4 === 3 && value > 0), brush !== 'smudge', brush + ' deposits ink only if it carries color');
      if (brush === 'binary' || brush === 'pixel') assert.ok(Array.from(pixels(active().canvas)).filter((_, i) => i % 4 === 3).every(alpha => alpha === 0 || alpha === 255));
    }
    tool('eraser'); edit('brushSize', 15); await stroke([[60, 40]]);
    assert.equal(pixel(active().canvas, 60, 40)[3], 0); assert.equal(pixel(display(), 60, 40)[3], 0);
    assert.ok(pixel(active().canvas, 25, 40)[3] > 0);
  });

  await test('Wet mix and smudge pick up active-layer color, preserve isolation, and undo cleanly', async () => {
    for (const kind of ['wetMix', 'smudge']) {
      await fresh(); const under = active().canvas.getContext('2d');
      under.fillStyle = '#00ff00'; under.fillRect(0,0,128,96);
      const lower = active().canvas, previous = hash(pixels(lower));
      app.addLayer(); const paint = active().canvas.getContext('2d');
      paint.fillStyle = '#ff0000'; paint.fillRect(8,16,48,64);
      paint.fillStyle = '#0000ff'; paint.fillRect(56,16,40,64);
      const before = hash(pixels(active().canvas)); select('brushKind',kind);
      edit('brushSize',22); edit('brushOpacity',100); edit('stabilizer',0);
      edit('inkColor',kind === 'smudge' ? '#00ff00' : '#ff0000');
      await stroke([[18,40],[48,40],[78,40],[117,40]]);
      const blended = pixel(active().canvas,61,40), after = hash(pixels(active().canvas));
      assert.ok(blended[0]>45 && blended[2]>45 && blended[1]<15, kind + ' red and blue produce a chromatic transition');
      assert.ok(pixel(active().canvas,101,40)[3]>0, kind + ' carries paint across an alpha edge');
      assert.equal(hash(pixels(lower)),previous, 'lower layer is untouched');
      await app.undo(); assert.equal(hash(pixels(active().canvas)),before);
      await app.redo(); assert.equal(hash(pixels(active().canvas)),after);
    }
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
    await fresh(); select('brushKind', 'gpen'); edit('brushSize', 24); edit('stabilizer', 0);
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

  await test('Paper presets, PNG print metadata and old pixel-only projects round-trip', async () => {
    await fresh();
    const field = (scope, key) => element(scope + 'FormatControls').querySelector('[data-format="' + key + '"]');
    const choose = (scope, key, value) => {
      const control = field(scope, key);
      control.value = value;
      control.dispatchEvent(new win.Event('change', { bubbles: true }));
    };
    click('newDocument');
    choose('new', 'preset', 'a4');
    assert.deepEqual([element('newWidth').value, element('newHeight').value], ['2480', '3508']);
    choose('new', 'preset', 'a3');
    assert.ok(field('new', 'density').querySelector('[value="300"]').disabled);
    choose('new', 'preset', 'bookmark');
    choose('new', 'density', '150');
    element('newForm').dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
    await eventually(() => !element('newDialog').open, 'The new paper canvas should open');
    assert.deepEqual([state().width, state().height], [295, 886]);
    assert.equal(field('canvas', 'preset').value, 'bookmark');
    seedLayer(active(), '#2367ab', 2, 3, 1, 1);
    const { bytes, canvas } = await decoded(await app.exportRaster('png', true));
    assert.deepEqual([canvas.width, canvas.height], [295, 886]);
    assert.deepEqual(pixel(canvas, 2, 3), [35, 103, 171, 255]);
    const types = [];
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
      types.push(type);
      if (type === 'pHYs') {
        assert.equal(length, 9);
        // 150 ppi rounds to 5906 pixels/metre. The fixture includes the known chunk CRC.
        assert.equal(bytes.subarray(offset + 8, offset + 21).toString('hex'), '000017120000171201679fd252');
      }
      offset += 12 + length;
    }
    assert.equal(types.filter(type => type === 'pHYs').length, 1);
    assert.ok(types.indexOf('pHYs') < types.indexOf('IDAT'));
    const saved = JSON.parse(await app.exportProject());
    assert.equal(saved.paperPpi, 150);
    choose('canvas', 'preset', 'custom');
    click('resizeCanvas');
    assert.equal((await app.serializeProject()).paperPpi, null, 'Pixel-only format clears the density even at the same dimensions');
    await app.undo();
    assert.equal(field('canvas', 'preset').value, 'bookmark');
    await app.redo();
    assert.equal(field('canvas', 'preset').value, 'custom');
    await app.loadProject(saved);
    assert.equal(field('canvas', 'density').value, '150');
    delete saved.paperPpi;
    await app.loadProject(saved);
    assert.equal((await app.serializeProject()).paperPpi, null, 'Old projects keep their pixel dimensions without inferring print metadata');
    assert.equal(field('canvas', 'preset').value, 'custom');
  });

  await test('Paper samples are real reversible backgrounds with transparent export and exact sampling', async () => {
    await fresh(96, 64, 'white');
    const artPixels = hash(pixels(active().canvas)), paperPixels = new Set();
    const samples = Array.from(element('paperGallery').querySelectorAll('button'));
    assert.equal(samples.length, 8);
    for (const button of samples) {
      button.click(); await settle();
      assert.equal(button.getAttribute('aria-pressed'), 'true');
      assert.equal(state().paperTexture, button.dataset.paper);
      assert.equal(hash(pixels(active().canvas)), artPixels);
      const current = hash(pixels(display())); paperPixels.add(current);
      assert.equal(hash(pixels((await decoded(await app.exportRaster('png'))).canvas)), current);
      assert.ok(new Set(pixels(display()).filter((_, i) => i % 4 === 0)).size > 8, 'Real tonal variation');
    }
    assert.equal(paperPixels.size, 8);
    const last = state().paperTexture, view = hash(pixels(display()));
    const expected = pixel(display(), 30, 25).slice(0, 3).map(v => v.toString(16).padStart(2, '0')).join('');
    tool('picker'); pointer('pointerdown', 30.25, 25.25);
    assert.equal(state().ink.toLowerCase(), '#' + expected);
    assert.equal(pixel((await decoded(await app.exportRaster('png', true))).canvas, 30, 25)[3], 0);
    await app.undo(); assert.notEqual(state().paperTexture, last);
    await app.redo(); await settle(); assert.equal(hash(pixels(display())), view);
    const saved = await app.exportProject(); await fresh(); await app.loadProject(saved); await settle();
    assert.equal(state().paperTexture, last); assert.equal(hash(pixels(display())), view);
    assert.equal(hash(pixels(active().canvas)), artPixels);
  });

  await test('Independent paper colour, relief and alpha survive exports, undo and legacy projects', async () => {
    await fresh(96, 96);
    edit('paperColor', '#4c729a'); edit('paperOpacity', 40);
    await settle();
    const source = pixel(display(), 2, 2);
    assert.equal(source[3], 102);
    assert.ok(Math.abs(source[2] - 154) <= 2);
    select('paperTexture', 'cotton'); edit('textureStrength', 24); await settle();
    const current = hash(pixels(display()));
    assert.equal(state().paperColor, '#4c729a');
    assert.equal(state().paperOpacity, 40);
    assert.equal(state().textureStrength, 24);
    assert.equal(hash(pixels((await decoded(await app.exportRaster('png'))).canvas)), current);
    edit('paperOpacity', 0); await settle();
    const onlyRelief = pixels(display());
    assert.ok(onlyRelief.some((v, i) => i % 4 === 3 && v > 0 && v < 255));
    edit('textureStrength', 0); await settle();
    assert.ok(pixels(display()).every((v, i) => i % 4 !== 3 || v === 0));
    await app.undo(); await app.undo(); await settle(); assert.equal(hash(pixels(display())), current);
    const data = JSON.parse(await app.exportProject()); await fresh(); await app.loadProject(data); await settle();
    assert.equal(hash(pixels(display())), current);
    for (const key of ['paperOpacity', 'paperTexture', 'textureStrength']) delete data[key];
    data.paper = 'kraft'; data.paperColor = '#f7f3e9';
    await app.loadProject(data); await settle();
    assert.equal(state().paperTexture, 'kraft'); assert.equal(state().paperColor, '#c19b6c');
    assert.equal(state().paperOpacity, 100); assert.equal(state().textureStrength, 100);
    data.paper = 'transparent'; await app.loadProject(data); await settle();
    assert.equal(state().paperOpacity, 0); assert.equal(state().paperTexture, 'none');
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

  await test('Preset matching methods and five unlabeled line colors work across palette brands', async () => {
    await fresh();
    assert.equal(doc.getElementById('swatchSearch'), null, 'The withdrawn swatch search is not left in the UI');
    const colorPresets = new Set(['sketch12-set', 'sketch36-set', 'sketchcomic24-set', 'sketch-chart', 'supervision-artists50', 'supervision-gray60', 'supervision-cinema60', 'holbein-yufuko12', 'holbein-nanakami12', 'holbein-lemon12', 'pilot-iroshizuku30']);
    doc.querySelector('[data-palette-layout="compact"]').click();
    for (const preset of win.DrawingPalettes) {
      select('palettePreset', preset.id); await settle();
      const info = app.ref.getInfo();
      assert.equal(info.paletteId, preset.id); assert.equal(element('referenceCopicPreset').value, preset.id);
      assert.equal(info.paletteMethod, colorPresets.has(preset.id) ? 'color' : 'gray', preset.name);
      assert.equal(element('presetSwatches').querySelectorAll('button').length, preset.swatches.length);
      assert.equal(element('presetSwatches').querySelectorAll('.marker-chips').length, 1, 'Compact cards use one continuous grid');
      assert.deepEqual(Array.from(element('baseSwatches').querySelectorAll('button'), button => button.dataset.color), ['#000000', '#3f271f', '#75503b', '#3a3a3a', '#808080']);
      assert.ok(Array.from(element('baseSwatches').querySelectorAll('button')).every(button => button.textContent === '' && button.getAttribute('aria-label')), 'Quick line colors have no visible labels but retain accessible names');
      assert.equal(element('presetSwatches').contains(element('baseSwatches')), false, 'Quick line colors must not break palette row counts');
    }
    for (const [id, count] of [['sketch12-set', 12], ['sketch36-set', 36]]) {
      select('palettePreset', id); await settle();
      assert.equal(element('presetSwatches').querySelectorAll('button').length, count);
    }
    for (const button of element('baseSwatches').querySelectorAll('button')) {
      button.click();
      assert.equal(element('inkColor').value, button.dataset.color, 'Each unlabeled quick color selects the actual ink');
    }
    select('palettePreset', 'supervision-artists50'); await settle();
    for (const [name, first] of [['莫奈', 121], ['穆夏', 141]]) {
      const colors = win.DrawingPalettes.find(p => p.id === 'supervision-artists50').groups.find(g => g.name === name).swatches;
      const buttons = Array.from(element('presetSwatches').querySelectorAll('button'));
      assert.deepEqual(Array.from(colors, c => c.code), Array.from({ length: 10 }, (_, i) => String(first + i)));
      assert.equal(new Set(colors.map(c => c.hex)).size, 10, 'Each numbered swatch stays independently selectable');
      for (const color of [colors[0], colors[9]]) {
        const button = buttons.find(button => button.textContent === color.code && button.dataset.color === color.hex);
        assert.ok(button, 'Swatch label uses the user-specified number: ' + color.code);
        button.click(); assert.equal(element('inkColor').value, color.hex);
      }
    }
  });

  await test('Super Vision keeps ten-color groups and five columns while Holbein, Pilot and Copic use six', async () => {
    await fresh();
    const image = native.createCanvas(12, 4), ctx = image.getContext('2d');
    ['#000000', '#de7c91', '#ffffff'].forEach((color, index) => {
      ctx.fillStyle = color; ctx.fillRect(index * 4, 0, 4, 4);
    });
    await app.ref.load(new File([image.toBuffer('image/png')], 'palette-columns.png', { type: 'image/png' }));
    click('previewPalette'); await settle();
    assert.equal(app.ref.getInfo().mode, 'copic');
    const library = element('presetSwatches'), reference = element('referenceSwatches');
    const order = container => Array.from(container.querySelectorAll('button'), button => [button.textContent, button.dataset.color]);
    function checkColumnsAndBasics(columns) {
      for (const container of [library, reference]) {
        assert.equal(container.style.getPropertyValue('--palette-columns'), String(columns), container.id);
      }
      assert.ok(reference.classList.contains('copic-swatches'));
      const basics = element('baseSwatches');
      assert.deepEqual(Array.from(basics.querySelectorAll('button'), button => button.dataset.color), ['#000000', '#3f271f', '#75503b', '#3a3a3a', '#808080']);
      assert.equal(basics.hidden, false); assert.equal(library.contains(basics), false);
      for (const hex of ['#000000', '#ffffff']) {
        assert.ok(reference.querySelector('[data-color="' + hex + '"]'), 'Reference summary always retains ' + hex);
      }
    }
    for (const [id, groupCount, menu] of [['supervision-artists50', 5, 'palettePreset'], ['supervision-gray60', 6, 'referenceCopicPreset'], ['supervision-cinema60', 6, 'palettePreset']]) {
      const preset = win.DrawingPalettes.find(item => item.id === id);
      assert.ok(preset, 'Missing Super Vision preset ' + id);
      select(menu, id); await settle();
      assert.equal(element('palettePreset').value, id); assert.equal(element('referenceCopicPreset').value, id);
      doc.querySelector('[data-palette-layout="grouped"]').click(); await settle();
      const groups = Array.from(library.querySelectorAll('.marker-row'));
      assert.equal(groups.length, groupCount);
      assert.equal(library.querySelectorAll('.marker-chips').length, groupCount);
      groups.forEach(group => assert.equal(group.querySelectorAll('.marker-chips > button').length, 10, 'Each original mini-series occupies two five-color rows'));
      assert.deepEqual(groups.map(group => group.querySelector('span').textContent), Array.from(preset.groups, group => group.name));
      const groupedOrder = order(library);
      assert.equal(groupedOrder.length, groupCount * 10);
      assert.deepEqual(groupedOrder, Array.from(preset.swatches, color => [color.code, color.hex]));
      checkColumnsAndBasics(5);
      doc.querySelector('[data-palette-layout="compact"]').click(); await settle();
      assert.equal(library.querySelectorAll('.marker-chips').length, 1, 'Compact mode has one uninterrupted grid');
      assert.equal(library.querySelectorAll('.marker-row > span').length, 0, 'Compact mode has no group breaks');
      assert.deepEqual(order(library), groupedOrder, 'Switching layout preserves original color order');
      checkColumnsAndBasics(5);
      for (const color of [preset.swatches[0], preset.swatches.at(-1)]) {
        const button = Array.from(library.querySelectorAll('button')).find(button => button.textContent === color.code && button.dataset.color === color.hex);
        assert.ok(button, 'Displayed source-order swatches remain selectable: ' + id + ' ' + color.code);
        button.click(); assert.equal(element('inkColor').value, color.hex);
      }
    }
    doc.querySelector('[data-ref-mode="original"]').click(); await settle();
    assert.equal(reference.classList.contains('copic-swatches'), false);
    assert.equal(reference.style.getPropertyValue('--palette-columns'), '', 'Ordinary extracted reference colors keep their original layout');
    for (const palette of ['gray', 'color']) {
      select('referencePalette', palette);
      assert.deepEqual(Array.from(reference.querySelectorAll('button'), button => button.dataset.color), plain(app.ref.getInfo().palettes[palette]));
    }
    doc.querySelector('[data-ref-mode="copic"]').click(); await settle();
    checkColumnsAndBasics(5);
    for (const [id, count] of [['sketch12-set', 12], ['holbein-yufuko12', 12], ['holbein-nanakami12', 12], ['holbein-lemon12', 12], ['pilot-iroshizuku30', 30]]) {
      select('referenceCopicPreset', id); await settle();
      assert.equal(element('palettePreset').value, id);
      for (const layout of ['grouped', 'compact']) {
        doc.querySelector('[data-palette-layout="' + layout + '"]').click(); await settle();
        checkColumnsAndBasics(6);
        assert.equal(library.querySelectorAll('button').length, count, id + ' retains its selected colors');
        if (id.startsWith('holbein-')) assert.equal(library.querySelectorAll('.marker-chips').length, 1, 'Each artist selection stays in two rows of six');
        if (id === 'pilot-iroshizuku30') assert.equal(library.querySelectorAll('.marker-chips').length, layout === 'compact' ? 1 : 5);
      }
    }
    // New drawing canvases retain reference settings, so restore the mode this
    // UI exercise changed before the next test loads its reference fixture.
    doc.querySelector('[data-ref-mode="original"]').click(); await settle();
  });

  await test('Copic reference UI uses only its palette, synchronizes menus and restores projects without a redundant image', async () => {
    await fresh(); await stroke([[10, 10], [80, 60]]);
    const artHash = hash(pixels(active().canvas)), artHistory = state().history;
    const image = native.createCanvas(48, 32), ctx = image.getContext('2d');
    ['#000000', '#ffffff', '#ea8c67', '#1da7ca', '#85b43d', '#352154', '#edbf47', '#9c667e'].forEach((color, index) => {
      ctx.fillStyle = color; ctx.fillRect(index * 6, 0, 6, 32);
    });
    ctx.clearRect(0, 0, 2, 2);
    ctx.clearRect(2, 0, 2, 2); ctx.fillStyle = 'rgba(80,110,150,.5)'; ctx.fillRect(2, 0, 2, 2);
    const file = new File([image.toBuffer('image/png')], 'copic-ui-reference.png', { type: 'image/png' });
    await app.ref.load(file); await settle();
    const original = pixels(app.ref.getCanvas()), originalHash = hash(original);
    select('palettePreset', 'sketch12-set'); await settle(); click('previewPalette');
    assert.ok(doc.body.classList.contains('busy'), 'Mapping starts within the existing protected work operation');
    display().dispatchEvent(new win.MouseEvent('contextmenu', { button: 2, bubbles: true, cancelable: true }));
    assert.equal(state().history, artHistory, 'A right-click while the app is busy must not undo artwork');
    await eventually(() => !doc.body.classList.contains('busy') && app.ref.getInfo().mode === 'copic', 'Preview action should show the mapped reference');
    await settle();
    let info = app.ref.getInfo();
    assert.equal(info.paletteId, 'sketch12-set'); assert.equal(info.paletteMethod, 'color');
    assert.equal(element('referenceCopicControls').hidden, false);
    assert.equal(element('referencePalette').hidden, true); assert.equal(element('referenceCountLabel').hidden, true);
    assert.equal(doc.querySelector('[data-ref-mode="copic"]').getAttribute('aria-pressed'), 'true');
    const allowed = new Set(['#000000', '#ffffff', ...win.DrawingPalettes.find(p => p.id === 'sketch12-set').colors]);
    const mapped = pixels(app.ref.getCanvas());
    for (let i = 0; i < mapped.length; i += 4) {
      assert.equal(mapped[i + 3], original[i + 3], 'Reference alpha survives the mapping');
      if (mapped[i + 3] === 255) assert.ok(allowed.has('#' + mapped.subarray(i, i + 3).toString('hex')), 'Mapped pixels stay inside the selected card plus black/white');
    }
    assert.ok(info.palettes.copic.includes('#000000')); assert.ok(info.palettes.copic.includes('#ffffff'));
    const useColor = Array.from(element('referenceSwatches').querySelectorAll('button')).find(button => !['#000000', '#ffffff'].includes(button.dataset.color));
    assert.ok(useColor, 'This varied reference should use at least one actual Copic color');
    useColor.click(); assert.equal(state().ink, useColor.dataset.color); assert.equal(element('inkColor').value, useColor.dataset.color);
    doc.querySelector('[data-ref-mode="original"]').click(); await settle();
    assert.equal(hash(pixels(app.ref.getCanvas())), originalHash, 'Returning to original must not show the quantized pixels');
    doc.querySelector('[data-ref-mode="copic"]').click(); await settle();
    select('referenceCopicPreset', 'sketch6-set-portrait'); await settle();
    info = app.ref.getInfo();
    assert.equal(info.paletteId, 'sketch6-set-portrait'); assert.equal(info.paletteMethod, 'gray');
    assert.equal(element('palettePreset').value, info.paletteId, 'Choosing on the reference panel updates the painting palette');
    assert.equal(hash(pixels(active().canvas)), artHash); assert.equal(state().history, artHistory, 'Reference mapping does not edit artwork or undo history');
    const mappedHash = hash(pixels(app.ref.getCanvas())), internal = await app.serializeProject();
    assert.equal(internal.reference.selectedMode, 'copic'); assert.equal(internal.reference.paletteId, info.paletteId);
    assert.deepEqual(Object.keys(internal.reference.views).sort(), ['color', 'gray', 'line']);
    assert.equal(Object.hasOwn(internal.reference.views, 'copic'), false, 'The derived preview is regenerated instead of saving another full PNG');
    const json = JSON.parse(await app.exportProject());
    assert.equal(Object.hasOwn(json.reference.views, 'copic'), false);
    await fresh(64, 64); await app.loadProject(json); await settle();
    info = app.ref.getInfo();
    assert.equal(info.mode, 'copic'); assert.equal(info.paletteId, 'sketch6-set-portrait'); assert.equal(info.paletteMethod, 'gray');
    assert.equal(element('referenceCopicPreset').value, info.paletteId); assert.equal(element('palettePreset').value, info.paletteId);
    assert.equal(hash(pixels(app.ref.getCanvas())), mappedHash); assert.equal(hash(pixels(active().canvas)), artHash);
    assert.ok(info.palettes.copic.includes('#000000')); assert.ok(info.palettes.copic.includes('#ffffff'));
    doc.querySelector('[data-ref-mode="original"]').click(); await settle();
    assert.equal(hash(pixels(app.ref.getCanvas())), originalHash);
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

  await test('Reference preview matches portrait and landscape images without cropping or altering artwork', async () => {
    await fresh(); await stroke([[18, 18], [80, 55]]);
    const originalPixels = hash(pixels(active().canvas)), history = state().history;
    const refContent = element('referenceContent'), refView = element('referenceView');
    async function place(width, height, name) {
      const image = native.createCanvas(width, height), ctx = image.getContext('2d');
      ctx.fillStyle = '#547392'; ctx.fillRect(0, 0, width, height);
      await app.ref.load(new File([image.toBuffer('image/png')], name, { type: 'image/png' }));
      await settle();
    }
    await place(90, 180, 'portrait-study.png');
    assert.equal(refContent.classList.contains('has-reference'), true);
    assert.equal(refView.style.aspectRatio, '90 / 180', 'Portrait reference uses its actual width and height');
    doc.querySelector('[data-ref-mode="gray"]').click(); await settle();
    assert.equal(refView.style.aspectRatio, '90 / 180', 'Switching reference mode must preserve its proportions');
    await place(200, 100, 'landscape-study.png');
    assert.equal(refView.style.aspectRatio, '200 / 100', 'Next reference replaces the preview aspect ratio');
    assert.equal(hash(pixels(active().canvas)), originalPixels);
    assert.equal(state().history, history, 'Reference layout changes must not alter drawing history');
    click('referenceRemove'); await settle();
    assert.equal(refContent.classList.contains('has-reference'), false);
    assert.equal(refView.style.aspectRatio, '', 'Empty reference falls back to flexible placeholder');
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

  // These checks drive deployed controls and pointer handlers, then inspect real
  // Canvas pixels. DOM geometry is supplied above; this is not browser layout QA.
  const markDefaults = {
    shapeKind: 'rect', shapeConstrain: false, shapeFill: true, shapeStroke: false,
    shapeStrokeColor: '#253546', shapeStrokeWidth: 4,
    frameColor: '#354953', frameAccent: '#d4b583', frameWidth: 12,
    textBoxStyle: 'none', textBoxColor: '#fff4df', textBoxAccent: '#886d52',
    textContent: 'Hi\nDrawing', textFont: 'mono', textSize: 18, textLineHeight: 1.5,
    textBold: false, textItalic: false, textAlign: 'left', textUseMaterial: false,
    materialKind: 'solid', materialFollowInk: false, materialForeground: '#ff0000',
    materialBackground: '#0000ff', materialTransparent: false,
    materialSpacing: 12, materialThickness: 3, materialAngle: 45
  };
  function markField(id, value) {
    const input = element(id);
    if (input.type === 'checkbox') check(id, value);
    else if (input.tagName === 'SELECT') select(id, value);
    else edit(id, value);
  }
  function markValues() {
    return Object.fromEntries(Object.keys(markDefaults).map(id => {
      const input = element(id);
      return [id, input.type === 'checkbox' ? input.checked : /^(number|range)$/.test(input.type) ? Number(input.value) : input.value];
    }));
  }
  async function freshMarks() {
    await fresh(); check('touchDraw', false);
    for (const [id, value] of Object.entries(markDefaults)) markField(id, value);
    await settle();
  }
  const keyOn = (target, key, extra = {}) => target.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra }));

  await test('Shape preview is temporary, shrinks cleanly and commits frozen paint as one undo step', async () => {
    assert.ok(requests.includes('/assets/drawing-studio/marks.js'));
    assert.ok(requests.includes('/assets/drawing-studio/color-controls.js'));
    await freshMarks(); edit('brushOpacity', 40); tool('shape');
    const before = hash(pixels(active().canvas)), history = state().history;
    pointer('pointerdown', 12, 12); pointer('pointermove', 108, 82); await settle();
    assert.equal(hash(pixels(active().canvas)), before, 'Preview must leave persistent layer pixels untouched');
    assert.ok(pixel(display(), 95, 70)[3] > 0, 'Preview must be visible through normal compositing');
    pointer('pointermove', 72, 52); await settle();
    assert.equal(pixel(display(), 95, 70)[3], 0, 'Moving a corner inward must erase the previous preview');
    const preview = hash(pixels(display()));
    edit('materialForeground', '#0000ff'); edit('brushOpacity', 80);
    pointer('pointerup', 72, 52); await settle();
    assert.equal(state().history, history + 1, 'A complete drag adds exactly one pixel operation');
    assert.equal(hash(pixels(display())), preview, 'Pointer-down style and opacity must remain frozen until commit');
    assert.deepEqual(pixel(active().canvas, 35, 30), [255, 0, 0, 102]);
    const painted = hash(pixels(active().canvas)); await app.undo(); await settle();
    assert.equal(hash(pixels(active().canvas)), before);
    await app.redo(); await settle(); assert.equal(hash(pixels(active().canvas)), painted);
  });

  await test('Every geometric choice, reverse drag, equal proportions and separate outline reach the canvas', async () => {
    const distinct = new Set();
    for (const kind of ['rect', 'ellipse', 'star', 'triangle', 'heart']) {
      await freshMarks(); select('shapeKind', kind); tool('shape'); await stroke([[100, 78], [22, 18]]);
      const stats = inkStats(active().canvas);
      assert.ok(stats.count > 500, kind + ' should produce a substantial shape');
      assert.ok(stats.left >= 20 && stats.right <= 102 && stats.top >= 16 && stats.bottom <= 80, 'Reverse-drag bounds must be normalized');
      distinct.add(hash(pixels(active().canvas)));
    }
    assert.equal(distinct.size, 5, 'Five shape choices must not be aliases for one rectangle');
    await freshMarks(); check('shapeConstrain', true); tool('shape'); await stroke([[92, 78], [28, 32]]);
    const square = inkStats(active().canvas); assert.ok(Math.abs(square.width - square.height) <= 1);
    await freshMarks(); check('shapeFill', false); check('shapeStroke', true); edit('shapeStrokeColor', '#0000ff');
    edit('shapeStrokeWidth', 6); tool('shape'); await stroke([[20, 20], [100, 75]]);
    assert.equal(pixel(active().canvas, 60, 45)[3], 0, 'Outline-only shape leaves its interior transparent');
    assert.deepEqual(pixel(active().canvas, 60, 20), [0, 0, 255, 255]);
  });

  await test('Shape and text cancellations discard previews without pixels or undo entries', async () => {
    for (const kind of ['shape', 'text']) for (const cancellation of ['pointercancel', 'lostpointercapture', 'blur', 'escape', 'switch']) {
      await freshMarks(); tool(kind); const before = hash(pixels(active().canvas)), history = state().history;
      pointer('pointerdown', 18, 18); pointer('pointermove', 70, 45); await settle();
      assert.equal(hash(pixels(active().canvas)), before, 'Preview remains off the persistent layer');
      if (cancellation === 'blur') win.dispatchEvent(new win.Event('blur'));
      else if (cancellation === 'escape') keyOn(doc, 'Escape');
      else if (cancellation === 'switch') tool('brush');
      else pointer(cancellation, 70, 45);
      await settle();
      assert.equal(state().drawing, false, kind + ' must release its pointer after ' + cancellation);
      assert.equal(hash(pixels(active().canvas)), before, kind + ' cancellation must not commit pixels: ' + cancellation);
      assert.equal(state().history, history, kind + ' cancellation must not add undo: ' + cancellation);
      assert.equal(inkStats(display()).count, 0, 'Cancelled overlay must disappear from the composited view');
    }
  });
  await test('Colored artwork frame and caption box survive undo, export and editable project restoration', async () => {
    await freshMarks(); tool('shape'); select('shapeKind','frameGallery');
    edit('frameColor','#b34837'); edit('frameAccent','#ffcb1a'); edit('frameWidth',8);
    assert.equal(element('frameFields').hidden,false);
    click('applyCanvasFrame'); await settle();
    assert.equal(state().layers.length,2); assert.deepEqual(pixel(active().canvas,2,48),[179,72,55,255]);
    assert.equal(pixel(active().canvas,64,48)[3],0);
    await app.undo(); await settle(); assert.equal(state().layers.length,1);
    await app.redo(); await settle(); assert.equal(state().layers.length,2);
    tool('text'); select('textBoxStyle','balloon'); edit('textBoxColor','#ffe4c4'); edit('textBoxAccent','#ad2f41');
    edit('textContent','Hi'); edit('textSize',15);
    const before=hash(pixels(active().canvas)); await stroke([[38,32]]); const after=hash(pixels(active().canvas));
    assert.notEqual(before,after); await app.undo(); await settle(); assert.equal(hash(pixels(active().canvas)),before);
    await app.redo(); await settle(); assert.equal(hash(pixels(active().canvas)),after);
    const exported=await app.exportRaster('png',true); assert.ok(exported.size>0);
    const project=await app.exportProject(); await freshMarks(); await app.loadProject(project);
    assert.equal(element('textBoxStyle').value,'balloon'); assert.equal(element('textBoxColor').value,'#ffe4c4');
    assert.equal(element('shapeKind').value,'frameGallery'); assert.equal(element('frameAccent').value,'#ffcb1a');
    assert.equal(hash(pixels(active().canvas)),after);
  });

  await test('New tools honor moved/scaled layer coordinates and locked/hidden layer guards', async () => {
    await freshMarks(); tool('move'); await stroke([[20, 20], [30, 26]]); edit('layerScale', 150); await settle();
    const meta = state().layers.find(layer => layer.id === state().activeId);
    const world = (x, y) => [meta.x + x * meta.scale, meta.y + y * meta.scale];
    tool('shape'); await stroke([world(20, 20), world(60, 45)]);
    assert.deepEqual(pixel(active().canvas, 40, 30), [255, 0, 0, 255]);
    assert.equal(pixel(active().canvas, 5, 5)[3], 0);
    for (const kind of ['shape', 'text']) {
      tool(kind); doc.querySelector('.layer-row.active .layer-lock').click();
      const locked = hash(pixels(active().canvas)); await stroke([[40, 30], [85, 65]]);
      assert.equal(hash(pixels(active().canvas)), locked, kind + ' must not paint a locked layer');
      doc.querySelector('.layer-row.active .layer-lock').click(); doc.querySelector('.layer-row.active .layer-visibility').click();
      const hidden = hash(pixels(active().canvas)); await stroke([[40, 30], [85, 65]]);
      assert.equal(hash(pixels(active().canvas)), hidden, kind + ' must not paint a hidden layer');
      doc.querySelector('.layer-row.active .layer-visibility').click();
    }
  });

  await test('System-font multiline text is rasterized once, remains literal and survives undo/export', async () => {
    await freshMarks(); edit('textContent', '<b>Hi</b>\nWacom 123'); edit('textSize', 14); edit('textLineHeight', 1.8);
    check('textBold', true); check('textItalic', true); edit('brushOpacity', 60); tool('text');
    const htmlBefore = doc.querySelectorAll('b').length, history = state().history;
    await stroke([[8, 12]]); const stats = inkStats(active().canvas), painted = hash(pixels(active().canvas));
    assert.ok(stats.count > 100 && stats.height > 24, 'Text should paint actual glyphs on more than one line');
    assert.ok(stats.maxAlpha >= 150 && stats.maxAlpha <= 154, 'Text opacity must be applied once');
    assert.equal(doc.querySelectorAll('b').length, htmlBefore, 'Text content is never interpreted as markup');
    assert.equal(state().history, history + 1);
    const exported = await decoded(await app.exportRaster('image/png', true, 1));
    assert.equal(hash(pixels(exported.canvas)), painted, 'PNG contains the same rasterized letters');
    await app.undo(); await settle(); assert.equal(inkStats(active().canvas).count, 0);
    await app.redo(); await settle(); assert.equal(hash(pixels(active().canvas)), painted);
    edit('textContent', ' \n '); const noText = hash(pixels(active().canvas)), noTextHistory = state().history;
    await stroke([[30, 20]]); assert.equal(hash(pixels(active().canvas)), noText); assert.equal(state().history, noTextHistory);
  });

  await test('Pattern bucket respects merged-layer topology and transparent gaps without touching linework', async () => {
    await freshMarks(); const lineId = state().activeId, ctx = active().canvas.getContext('2d');
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 4; ctx.strokeRect(18, 14, 94, 68); ctx.strokeRect(48, 34, 26, 28);
    const linework = hash(pixels(active().canvas)); await app.addLayer(); const fillId = state().activeId; click('layerDown');
    select('fillSample', 'visible'); select('fillExpand', '0'); edit('tolerance', 10); check('materialTransparent', true); tool('fill');
    const results = new Set();
    for (const kind of ['horizontal', 'vertical', 'diagonal', 'crosshatch', 'dots']) {
      select('materialKind', kind); const beforeHistory = state().history; await stroke([[31, 26]]);
      const out = app.getLayer(fillId).canvas, stats = inkStats(out);
      assert.ok(stats.count > 100 && stats.count < 5200, kind + ' should have visible marks and transparent gaps');
      assert.equal(pixel(out, 4, 4)[3], 0, 'The enclosing selection must not leak outward');
      assert.equal(pixel(out, 60, 48)[3], 0, 'A closed inner hole must not be filled by a bounding rectangle');
      assert.equal(hash(pixels(app.getLayer(lineId).canvas)), linework, 'Sampled linework must stay untouched');
      assert.equal(state().history, beforeHistory + 1); results.add(hash(pixels(out)));
      await app.undo(); await settle(); assert.equal(inkStats(app.getLayer(fillId).canvas).count, 0);
    }
    assert.ok(results.size >= 4, 'Pattern choices must lead to different rendered material');
    select('materialKind', 'horizontal'); edit('materialThickness', 1); edit('materialSpacing', 16); await stroke([[31, 26]]);
    const thin = inkStats(active().canvas).alphaSum; await app.undo(); await settle();
    edit('materialThickness', 4); await stroke([[31, 26]]); const thick = inkStats(active().canvas).alphaSum;
    assert.ok(thick > thin * 2, 'Thickness input must increase actual pattern coverage'); await app.undo(); await settle();
    edit('materialThickness', 1); edit('materialSpacing', 8); await stroke([[31, 26]]);
    assert.ok(inkStats(active().canvas).alphaSum > thin * 1.5, 'Smaller spacing must make lines denser');
  });

  await test('Linear/radial material uses both endpoint colors and preserves chosen opacity', async () => {
    for (const kind of ['linear', 'radial']) {
      await freshMarks(); select('materialKind', kind); edit('materialAngle', 0); select('fillSample', 'current');
      select('fillExpand', '0'); edit('brushOpacity', 40); tool('fill'); await stroke([[64, 48]]);
      const source = active().canvas, center = pixel(source, 64, 48), left = pixel(source, 3, 48), right = pixel(source, 124, 48);
      assert.equal(center[3], 102); assert.equal(left[3], 102); assert.equal(right[3], 102);
      if (kind === 'linear') {
        assert.ok(left[0] > 220 && left[2] < 35, 'Linear start should use the foreground color');
        assert.ok(right[2] > 220 && right[0] < 35, 'Linear end should use the background color');
        assert.ok(center[0] > 90 && center[2] > 90, 'Linear midpoint should interpolate the colors');
      } else {
        const corner = pixel(source, 2, 2);
        assert.ok(center[0] > center[2] + 150, 'Radial center should use the foreground color');
        assert.ok(corner[2] > corner[0] + 150, 'Radial outer area should use the background color');
      }
      const painted = hash(pixels(source)); await app.undo(); await settle(); assert.equal(inkStats(active().canvas).count, 0);
      await app.redo(); await settle(); assert.equal(hash(pixels(active().canvas)), painted);
    }
  });

  await test('HSV editor, swatches and native color controls synchronize without changing independent background', async () => {
    await freshMarks(); check('materialFollowInk', true); edit('materialBackground', '#1a2b3c');
    const host = element('colorPicker'), field = name => { const node = host.querySelector('[data-dcc="' + name + '"]'); assert.ok(node); return node; };
    field('hex').value = '#3a7'; field('hex').dispatchEvent(new win.Event('change', { bubbles: true }));
    assert.equal(state().ink, '#33aa77'); assert.equal(element('inkColor').value, '#33aa77'); assert.equal(field('hex').value.toLowerCase(), '#33aa77');
    assert.equal(element('materialForeground').value, '#33aa77'); assert.equal(element('materialBackground').value, '#1a2b3c');
    assert.ok(element('recentSwatches').querySelector('[data-color="#33aa77"]'), 'Committed picker colors join the recent swatches');
    edit('inkColor', '#112233'); assert.equal(field('hex').value.toLowerCase(), '#112233');
    assert.deepEqual(['r', 'g', 'b'].map(name => Number(field(name).value)), [17, 34, 51]);
    const previousPreset = element('palettePreset').value;
    select('palettePreset', 'sketch-chart'); await settle();
    const swatch = Array.from(element('presetSwatches').querySelectorAll('button')).find(button => button.textContent === 'E49');
    assert.ok(swatch, 'The full card keeps every Copic code available after search is withdrawn'); swatch.click();
    assert.equal(field('hex').value.toLowerCase(), swatch.dataset.color.toLowerCase());
    assert.equal(swatch.getAttribute('aria-pressed'), 'true');
    assert.ok(element('inkReadout').textContent.includes('E49'));
    click('rememberColor'); assert.ok(element('savedSwatches').querySelector('[data-color="' + swatch.dataset.color + '"]'));
    click('rememberColor'); assert.equal(element('savedSwatches').querySelectorAll('button').length, 0);
    select('palettePreset', previousPreset); await settle();
    check('materialFollowInk', false); edit('materialForeground', '#aa44bb');
    field('hex').value = '#8ac'; field('hex').dispatchEvent(new win.Event('change', { bubbles: true }));
    assert.equal(state().ink, '#88aacc'); assert.equal(element('materialForeground').value, '#aa44bb');
    assert.equal(element('materialBackground').value, '#1a2b3c'); click('materialBackFromInk');
    assert.equal(element('materialBackground').value, '#88aacc', 'Explicit background action copies ink without changing foreground');
    edit('inkColor', '#000000'); const hue = field('hue'); keyOn(hue, 'Home'); keyOn(hue, 'ArrowRight', { shiftKey: true });
    assert.equal(Number(hue.getAttribute('aria-valuenow')), 15, 'Black does not erase a newly selected hue through the app echo');
    assert.equal(state().ink, '#000000');
  });

  await test('Reference divider drag/keyboard clamps width while preserving drawing and reference state', async () => {
    await freshMarks(); await stroke([[15, 15], [90, 65]]);
    if (doc.body.classList.contains('reference-hidden')) click('showReference');
    assert.notEqual(win.getComputedStyle(element('referencePanel')).display, 'none', 'Resize gesture starts with a visible reference panel');
    const splitter = element('referenceSplitter'), workspace = element('workspace');
    const before = { pixels: hash(pixels(active().canvas)), history: state().history, reference: plain(app.ref.getInfo()) };
    const width = () => Number(splitter.getAttribute('aria-valuenow'));
    const send = (type, x) => splitter.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 22, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY: 250 }));
    const start = width(); send('pointerdown', 286); send('pointermove', 386); send('pointerup', 386); await settle();
    assert.ok(width() > start, 'Dragging the actual separator should widen the reference panel');
    assert.equal(parseFloat(workspace.style.getPropertyValue('--ref-width')), width());
    assert.equal(Number(element('referenceWidth').value), width(), 'Range and drag handle expose one shared width');
    keyOn(splitter, 'End'); assert.equal(width(), Number(splitter.getAttribute('aria-valuemax')));
    keyOn(splitter, 'Home'); assert.equal(width(), Number(splitter.getAttribute('aria-valuemin')));
    const minimum = width(); keyOn(splitter, 'ArrowRight'); assert.equal(width(), minimum + 10);
    send('pointerdown', 220); send('pointermove', 250); send('pointercancel', 250); await settle();
    const stopped = width(); send('pointermove', 500); await settle(); assert.equal(width(), stopped, 'Cancel releases the resize gesture');
    assert.equal(doc.body.classList.contains('dcc-resizing-reference'), false);
    assert.equal(hash(pixels(active().canvas)), before.pixels); assert.equal(state().history, before.history);
    assert.deepEqual(plain(app.ref.getInfo()), before.reference, 'Resizing reference layout never replaces its source or page');
  });

  await test('Shape/text/material options and their artwork survive project round-trip and old projects still open', async () => {
    await freshMarks(); select('shapeKind', 'ellipse'); select('materialKind', 'dots'); edit('materialSpacing', 9);
    edit('materialThickness', 3); check('materialTransparent', true); tool('shape'); await stroke([[12, 12], [105, 80]]);
    assert.equal(pixel(active().canvas, 12, 12)[3], 0, 'Shape material must be clipped to the ellipse');
    tool('text'); edit('textContent', 'Layer\n2026'); select('textFont', 'arial'); edit('textSize', 16);
    edit('textLineHeight', 1.7); check('textBold', true); check('textItalic', true); select('textAlign', 'center');
    check('textUseMaterial', true); select('materialKind', 'linear'); edit('materialAngle', 30); check('materialTransparent', false);
    edit('materialForeground', '#dd6633'); edit('materialBackground', '#2255aa'); await stroke([[64, 20]]);
    const expected = markValues(), painted = hash(pixels(active().canvas)), displayed = hash(pixels(display()));
    const json = await app.exportProject(); await freshMarks(); await app.loadProject(JSON.parse(json)); await settle();
    assert.deepEqual(markValues(), expected, 'Every new saved option is restored through actual form controls');
    assert.equal(hash(pixels(active().canvas)), painted); assert.equal(hash(pixels(display())), displayed);
    const legacy = JSON.parse(json); legacy.settings = {}; await app.loadProject(legacy); await settle();
    assert.equal(hash(pixels(active().canvas)), painted, 'Missing optional mark settings never changes existing image pixels');
    assert.equal(element('shapeKind').value, 'rect'); assert.equal(element('materialKind').value, 'solid'); assert.equal(element('textFont').value, 'system');
  });

  await test('File-input loading restores PDF navigation from current page state after work finishes', async () => {
    // Deliberately stub document loading, not rendering: this regression concerns
    // work() restoring stale disabled flags after the file-input event completes.
    // Real PDF decoding and browser-worker rendering have separate verification.
    const reference = app.ref, input = element('referenceFile');
    const original = { load: reference.load, getInfo: reference.getInfo, setPage: reference.setPage };
    const filesDescriptor = Object.getOwnPropertyDescriptor(input, 'files');
    let imported = false, page = 1, loadCalls = 0, releaseLoad;
    const pendingLoad = new Promise(resolve => { releaseLoad = resolve; });
    reference.getInfo = function () {
      const info = original.getInfo.call(this);
      return imported ? { ...info, name: 'two-pages-navigation.pdf', isPDF: true, page, pageCount: 2 } : info;
    };
    reference.load = async function (file) {
      loadCalls++; assert.equal(file.type, 'application/pdf'); await pendingLoad;
      imported = true; page = 1; this.options.onChange(this.getInfo()); return true;
    };
    reference.setPage = async function (number) {
      page = Math.max(1, Math.min(2, Number(number))); this.options.onChange(this.getInfo()); return true;
    };
    try {
      assert.equal(reference.getInfo().isPDF, false, 'The initial reference is an image, so PDF controls start disabled');
      assert.equal(element('pdfNext').disabled, true); assert.equal(element('pdfPrevious').disabled, true);
      Object.defineProperty(input, 'files', { configurable: true, value: [new File(['navigation state fixture'], 'two-pages-navigation.pdf', { type: 'application/pdf' })] });
      input.dispatchEvent(new win.Event('change', { bubbles: true }));
      await eventually(() => loadCalls === 1 && doc.body.classList.contains('busy'), 'The real file-input handler must enter work()');
      assert.equal(element('referenceOpen').disabled, true, 'Controls are blocked while the asynchronous import is pending');
      releaseLoad();
      await eventually(() => imported && !doc.body.classList.contains('busy'), 'The import must finish before checking restored controls');
      assert.equal(element('pdfNavigation').hidden, false); assert.equal(element('pdfPageCount').textContent, '2');
      assert.equal(element('pdfPage').value, '1'); assert.equal(element('pdfPrevious').disabled, true);
      assert.equal(element('pdfNext').disabled, false, 'Finally must recompute navigation instead of restoring the stale disabled flag');
      assert.equal(element('referenceOpen').disabled, false);
      click('pdfNext'); await settle();
      assert.equal(page, 2, 'The enabled Next button must reach the reference page handler');
      assert.equal(element('pdfPage').value, '2'); assert.equal(element('pdfPrevious').disabled, false); assert.equal(element('pdfNext').disabled, true);
      click('pdfPrevious'); await settle();
      assert.equal(page, 1); assert.equal(element('pdfPrevious').disabled, true); assert.equal(element('pdfNext').disabled, false);
      click('pdfLast'); await settle(); assert.equal(page, 2); assert.equal(element('pdfLast').disabled, true);
      click('pdfFirst'); await settle(); assert.equal(page, 1); assert.equal(element('pdfFirst').disabled, true);
      element('pdfPage').value = '2'; keyOn(element('pdfPage'), 'Enter'); await settle(); assert.equal(page, 2);
      element('pdfPage').value = ''; keyOn(element('pdfPage'), 'Enter'); await settle();
      assert.equal(element('pdfPage').value, '2', 'An empty page number leaves the current page intact');
      assert.ok(!requests.some(url => /vendor\/pdfjs/.test(url)), 'The navigation regression must not pretend to exercise the PDF engine');
    } finally {
      releaseLoad(); Object.assign(reference, original);
      if (filesDescriptor) Object.defineProperty(input, 'files', filesDescriptor); else delete input.files;
      reference.options.onChange(reference.getInfo());
    }
  });

  await test('Current work reopens with the same pixels, reference and paper; discarded work cannot return from a stale tab', async () => {
    await fresh(106, 78);
    await stroke([[10, 14], [72, 53]]);
    const base = state().activeId, overlay = app.addLayer();
    await stroke([[51, 62], [84, 28]]);
    select('paperTexture', 'linen'); edit('paperOpacity', 53); edit('textureStrength', 64);
    const source = native.createCanvas(13, 9), ctx = source.getContext('2d');
    ctx.fillStyle = '#784e32'; ctx.fillRect(0, 0, 13, 9);
    await app.ref.load(new File([source.toBuffer('image/png')], 'resume-reference.png', { type: 'image/png' }));
    // Exercise the automatic save and the normal lifecycle hook, without calling saveDraft().
    win.dispatchEvent(new win.Event('pagehide'));
    await eventually(() => !state().dirty, 'Finished artwork changes must reach automatic storage');
    const original = state(), expectedBase = hash(pixels(app.getLayer(base).canvas)), expectedOverlay = hash(pixels(app.getLayer(overlay).canvas));
    assert.equal((await win.DrawingStorage.readCurrent()).project.title, original.title);
    assert.deepEqual(Array.from(await win.DrawingStorage.list(), row => row.id), ['integration-roundtrip'], 'New work must not create extra legacy history');

    const opened = [];
    function checkRestored(studio) {
      const restored = studio.inspect();
      for (const key of ['width', 'height', 'title', 'paperColor', 'paperTexture', 'paperOpacity', 'textureStrength', 'activeId']) assert.equal(restored[key], original[key], key);
      assert.equal(restored.layers.length, 2); assert.equal(restored.reference.name, 'resume-reference.png');
      assert.equal(hash(pixels(studio.getLayer(base).canvas)), expectedBase);
      assert.equal(hash(pixels(studio.getLayer(overlay).canvas)), expectedOverlay);
    }
    async function reopen() { const result = await openStudio(win.indexedDB); opened.push(result); return result.window; }
    let releaseEncoder;
    try {
      const other = await reopen(), current = other.DrawingStudio, otherDoc = other.document;
      checkRestored(current); checkRestored(app);
      otherDoc.getElementById('wastebasket').click();
      assert.equal(otherDoc.getElementById('wastebasketDialog').open, true);
      otherDoc.querySelector('#wastebasketDialog [data-close]').click();
      assert.equal(otherDoc.getElementById('wastebasketDialog').open, false);
      checkRestored(current);

      const storage = other.DrawingStorage, saved = await storage.readCurrent();
      other.DrawingStorage = { ...storage, writeCurrent: async () => { throw new Error('Test storage quota reached'); } };
      otherDoc.getElementById('wastebasket').click(); otherDoc.getElementById('discardWork').click();
      await eventually(() => otherDoc.getElementById('toast').textContent.includes('Test storage quota reached'), 'Storage failure should be visible');
      checkRestored(current); assert.equal((await storage.readCurrent()).stamp, saved.stamp);
      assert.equal(otherDoc.getElementById('wastebasketDialog').open, true);
      otherDoc.querySelector('#wastebasketDialog [data-close]').click(); other.DrawingStorage = storage;

      // Hold an actual PNG encoder callback until another tab commits the discard.
      const baseCanvas = app.getLayer(base).canvas, encode = baseCanvas.toBlob.bind(baseCanvas);
      baseCanvas.toBlob = (callback, ...args) => encode(blob => { releaseEncoder = () => callback(blob); }, ...args);
      app.addLayer();
      const pending = app.saveDraft().catch(() => {});
      await eventually(() => !!releaseEncoder, 'Old tab should start serializing its changed layers');
      otherDoc.getElementById('wastebasket').click(); otherDoc.getElementById('discardWork').click();
      await eventually(() => !otherDoc.getElementById('wastebasketDialog').open && current.inspect().layers.length === 1, 'Discard should switch to a fresh work');
      assert.equal(current.ref.getCanvas(), null); assert.equal(inkStats(current.getLayer(current.inspect().activeId).canvas).count, 0);
      const tombstone = await other.DrawingStorage.readCurrent();
      assert.ok(tombstone.stamp); assert.equal(tombstone.project, null);
      releaseEncoder(); releaseEncoder = null;
      baseCanvas.toBlob = encode;
      await pending; win.dispatchEvent(new win.Event('pagehide')); await wait(70);
      assert.equal((await other.DrawingStorage.readCurrent()).stamp, tombstone.stamp, 'Old asynchronous saves cannot revive discarded drawings');
      assert.equal(state().layers.length, 3, 'Conflict preserves old tab pixels so the user can export them');
      assert.equal(hash(pixels(app.getLayer(base).canvas)), expectedBase);
      const clean = await reopen();
      assert.equal(clean.DrawingStudio.inspect().layers.length, 1); assert.equal(clean.DrawingStudio.ref.getCanvas(), null);
      assert.notEqual(clean.DrawingStudio.inspect().title, original.title);
      assert.equal((await clean.DrawingStorage.readCurrent()).project, null);
      assert.ok(await clean.DrawingStorage.load('integration-roundtrip'), 'Pre-existing legacy work remains accessible');

      const importFile = element('projectFile'), foreign = new File([await clean.DrawingStudio.exportProject()], 'different-work.lrxdraw', {type: 'application/json'});
      Object.defineProperty(importFile, 'files', { configurable: true, value: [foreign] });
      const beforeImport = state();
      importFile.dispatchEvent(new win.Event('change', { bubbles: true }));
      assert.ok(doc.body.classList.contains('busy'), 'The real file picker started decoding the replacement project');
      await eventually(() => !doc.body.classList.contains('busy') && /另一/.test(element('status').textContent), 'Stale import must tell the user another page updated their work');
      assert.deepEqual(state().layers, beforeImport.layers);
      assert.equal(state().draftId, beforeImport.draftId); assert.equal(state().activeId, beforeImport.activeId);
      assert.equal(state().title, beforeImport.title); assert.equal(state().reference.name, 'resume-reference.png');
      assert.equal(hash(pixels(app.getLayer(base).canvas)), expectedBase); assert.equal(hash(pixels(app.getLayer(overlay).canvas)), expectedOverlay);
      assert.equal((await clean.DrawingStorage.readCurrent()).stamp, tombstone.stamp);
    } finally {
      if (releaseEncoder) releaseEncoder(); for (const page of opened) page.window.close();
    }
  });

  if (errors.length) throw new Error('DOM runtime errors:\n' + errors.join('\n'));
  dom.window.close();
  global.console.log('Drawing application integration: ' + passed + ' checks passed.');
}
main().catch(error => {
  if (liveWindow) console.error('Last UI status:', liveWindow.document.getElementById('status')?.textContent, '|', liveWindow.document.getElementById('toast')?.textContent);
  liveWindow?.close(); console.error(error); process.exitCode = 1;
});
