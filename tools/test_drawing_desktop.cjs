/* Development-only native-adapter contracts. Runs the real desktop/desktop.js
 * with mocked Tauri IPC/events and DOM; no native dialog or WebView2 is launched.
 * NODE_PATH=<jsdom node_modules> node tools/test_drawing_desktop.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const source = fs.readFileSync(path.resolve(__dirname, '../desktop/desktop.js'), 'utf8');
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const flush = () => new Promise(resolve => setImmediate(resolve));
const live = new Set();
function harness(options = {}) {
  const failures = [], calls = [], anchors = [], revoked = [], blobs = new Map(), handlers = new Map(), timers = new Map();
  const console = new VirtualConsole(); console.on('jsdomError', error => failures.push(error));
  const dom = new JSDOM('<!doctype html><html><body><div id="canvas"></div></body></html>', {
    url: 'https://tauri.localhost/drawing-studio.html', runScripts: 'dangerously', virtualConsole: console
  });
  live.add(dom);
  const win = dom.window; let nextURL = 0, nextTimer = 0;
  win.document.body.inert = false;
  win.URL.createObjectURL = blob => { const url = 'blob:https://tauri.localhost/export-' + ++nextURL; blobs.set(url, blob); return url; };
  win.URL.revokeObjectURL = url => { revoked.push(url); blobs.delete(url); };
  win.setTimeout = (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; };
  win.clearTimeout = id => timers.delete(id);
  win.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  win.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new win.Event('close')); };
  win.HTMLAnchorElement.prototype.click = function () { anchors.push({ url: this.href, name: this.download }); options.anchor?.(this); };
  win.__TAURI__ = {
    core: { invoke: async (command, args) => {
      calls.push({ command, args });
      if (options.invoke) return options.invoke(command, args);
      return command === 'prepare_download' ? true : undefined;
    } },
    event: { listen: (name, fn) => {
      handlers.set(name, fn);
      return options.listening?.(name) || Promise.resolve(() => handlers.delete(name));
    } }
  };
  win.eval(source);
  return {
    win, calls, anchors, revoked, blobs, handlers, timers, failures,
    emit: (name, payload = {}) => handlers.get(name)?.({ payload }),
    fireTimers: delay => { for (const [id, timer] of [...timers]) if (timer.delay === delay) { timers.delete(id); timer.fn(); } },
    count: command => calls.filter(call => call.command === command).length,
    blob: () => new win.Blob(['actual export fixture'], { type: 'image/png' }),
    dispose: () => { assert.deepEqual(failures, []); dom.window.close(); live.delete(dom); }
  };
}
let passed = 0;
async function test(name, run) { await run(); passed++; console.log('PASS ' + name); }
async function main() {
  await test('Save chooser keeps the Blob alive and cancellation never becomes success', async () => {
    const choice = deferred(), h = harness({ invoke: command => command === 'prepare_download' ? choice.promise : undefined });
    try {
      const saving = h.win.DrawingDesktop.save(h.blob(), '画作.png'); await flush();
      assert.equal(h.count('prepare_download'), 1); assert.equal(h.blobs.size, 1);
      assert.equal(h.anchors.length, 0); assert.equal(h.revoked.length, 0);
      assert.equal([...h.timers.values()].filter(timer => timer.delay === 10000).length, 0, 'Chooser time must not consume the launch watchdog');
      h.fireTimers(10000); assert.equal(h.revoked.length, 0);
      choice.resolve(false); assert.equal(await saving, false);
      assert.equal(h.blobs.size, 0); assert.equal(h.anchors.length, 0);
      assert.equal(h.win.document.getElementById('desktopStatus'), null);
    } finally { h.dispose(); }
  });

  await test('Actual finished event resolves saving; started clears the launch timeout', async () => {
    const h = harness();
    try {
      let completed = false;
      const saving = h.win.DrawingDesktop.save(h.blob(), '图层.png').then(result => { completed = true; return result; });
      await flush();
      assert.equal(h.anchors.length, 1); assert.equal(completed, false); assert.equal(h.revoked.length, 0);
      const url = h.anchors[0].url;
      await h.emit('lightdraw-download-started', { url });
      assert.equal([...h.timers.values()].filter(timer => timer.delay === 10000).length, 0);
      h.fireTimers(10000); await flush(); assert.equal(completed, false); assert.equal(h.count('cancel_download'), 0);
      await h.emit('lightdraw-download-finished', { url, success: true, path: 'C:\\Art\\图层.png' });
      assert.equal(await saving, true); assert.equal(h.blobs.size, 0);
      assert.match(h.win.document.getElementById('desktopStatus').textContent, /已保存.*图层\.png/);
    } finally { h.dispose(); }
  });

  await test('Download failure and failure to start reject and clean pending grants', async () => {
    const h = harness();
    try {
      const failed = h.win.DrawingDesktop.save(h.blob(), 'fail.png');
      const rejection = assert.rejects(failed, /文件没有保存成功/);
      await flush(); await h.emit('lightdraw-download-finished', { url: h.anchors.at(-1).url, success: false });
      await rejection; assert.equal(h.blobs.size, 0); assert.ok(h.count('cancel_download') > 0);
      const stalled = h.win.DrawingDesktop.save(h.blob(), 'stall.png');
      const timeout = assert.rejects(stalled, /系统没有开始保存文件/);
      await flush(); h.fireTimers(10000); await timeout;
      assert.equal(h.blobs.size, 0); assert.equal(h.win.document.getElementById('desktopStatus'), null);
    } finally { h.dispose(); }
  });

  await test('Ready waits until the close and download listeners are registered', async () => {
    const registration = deferred(), h = harness({ listening: name => name === 'lightdraw-close-requested' ? registration.promise : undefined });
    try {
      const ready = h.win.DrawingDesktop.ready(); await flush(); assert.equal(h.count('desktop_ready'), 0);
      registration.resolve(() => {}); await ready; assert.equal(h.count('desktop_ready'), 1);
    } finally { h.dispose(); }
  });

  await test('Close waits for prepareToClose, refuses busy work, and only then requests native exit', async () => {
    const finish = deferred(), h = harness({ invoke: command => command === 'finish_close' ? finish.promise : undefined }), preparation = deferred(); let attempts = 0;
    try {
      h.win.DrawingStudio = { prepareToClose: () => { attempts++; return preparation.promise; } };
      const closing = h.emit('lightdraw-close-requested'); await flush();
      assert.equal(attempts, 1); assert.equal(h.count('finish_close'), 0);
      assert.equal(h.win.document.body.inert, true, 'Editing must be blocked throughout preparation');
      await h.emit('lightdraw-close-requested'); assert.equal(attempts, 1, 'Repeated close clicks must share the in-flight preparation');
      preparation.resolve(false); await closing;
      assert.equal(h.count('finish_close'), 0); assert.match(h.win.document.getElementById('desktopStatus').textContent, /先完成当前操作/);
      assert.equal(h.win.document.body.inert, false, 'A refused close must restore editing');
      h.win.DrawingStudio.prepareToClose = async () => true;
      const exiting = h.emit('lightdraw-close-requested'); await flush(); assert.equal(h.count('finish_close'), 1);
      assert.equal(h.win.document.body.inert, true, 'No new stroke may start while native exit IPC is pending');
      finish.resolve(); await exiting; assert.equal(h.win.document.body.inert, true, 'Successful exit keeps editing blocked until the process closes');
    } finally { h.dispose(); }
  });

  await test('Failed closing keeps one recovery dialog and exits only after explicit discard', async () => {
    const h = harness(); let attempts = 0;
    try {
      h.win.DrawingStudio = { prepareToClose: async () => { attempts++; throw new Error('Disk quota reached'); } };
      await h.emit('lightdraw-close-requested'); await h.emit('lightdraw-close-requested');
      assert.equal(h.count('finish_close'), 0); assert.equal(h.win.document.querySelectorAll('dialog').length, 1);
      assert.equal(attempts, 1, 'Repeated closing must focus the existing recovery dialog');
      assert.equal(h.win.document.body.inert, false, 'The recovery dialog must remain usable');
      let dialog = h.win.document.querySelector('dialog'); assert.match(dialog.textContent, /Disk quota reached/);
      dialog.querySelectorAll('button')[0].click(); assert.equal(h.win.document.querySelector('dialog'), null); assert.equal(h.count('finish_close'), 0);
      await h.emit('lightdraw-close-requested'); dialog = h.win.document.querySelector('dialog');
      dialog.querySelectorAll('button')[1].click(); await flush(); assert.equal(h.count('finish_close'), 1);
      assert.equal(h.win.document.querySelector('dialog'), null);
    } finally { h.dispose(); }
  });

  await test('Native refusal after saving restores editing and retains the window', async () => {
    const h = harness({ invoke: command => { if (command === 'finish_close') throw new Error('Another export is still saving'); } });
    try {
      h.win.DrawingStudio = { prepareToClose: async () => true };
      await h.emit('lightdraw-close-requested');
      assert.equal(h.count('finish_close'), 1); assert.equal(h.win.document.body.inert, false);
      assert.match(h.win.document.getElementById('desktopStatus').textContent, /Another export is still saving/);
      assert.equal(h.win.document.querySelector('dialog'), null);
    } finally { h.dispose(); }
  });

  await test('External links use native browser opening while modified studio links preserve the bridge', async () => {
    const h = harness(), partnered = [];
    try {
      h.win.DrawingBridge = { openStudio: url => partnered.push(url) };
      const doc = h.win.document;
      doc.body.insertAdjacentHTML('beforeend', '<a id="local" href="/color-block-studio.html" data-studio-switch><span>练习室</span></a><a id="external" href="https://lrxuanxuan.github.io/playthings/"><span>网站</span></a>');
      function click(id, type = 'click', options = {}) {
        const event = new h.win.MouseEvent(type, { bubbles: true, cancelable: true, ...options });
        const target = doc.getElementById(id).firstElementChild || doc.getElementById(id);
        target.dispatchEvent(event);
        return event;
      }
      assert.equal(click('external').defaultPrevented, true); await flush();
      assert.equal(h.count('open_external'), 1);
      assert.equal(h.calls.find(call => call.command === 'open_external').args.url, 'https://lrxuanxuan.github.io/playthings/');
      assert.equal(click('local').defaultPrevented, true);
      assert.equal(click('local', 'click', { ctrlKey: true }).defaultPrevented, true);
      assert.equal(click('local', 'click', { shiftKey: true }).defaultPrevented, true);
      assert.equal(click('local', 'auxclick', { button: 1 }).defaultPrevented, true);
      assert.equal(partnered.length, 4); assert.ok(partnered.every(url => url === 'https://tauri.localhost/color-block-studio.html'));
      assert.equal(click('local', 'contextmenu', { button: 2 }).defaultPrevented, true);
      const menu = new h.win.MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
      doc.getElementById('canvas').dispatchEvent(menu); assert.equal(menu.defaultPrevented, false, 'Adapter must leave the drawing canvas right-click handler untouched');
      assert.equal(h.count('open_external'), 1);
    } finally { h.dispose(); }
  });
  console.log('Desktop adapter contracts: ' + passed + ' checks passed.');
}
main().catch(error => {
  for (const dom of live) dom.window.close();
  console.error(error); process.exitCode = 1;
});
