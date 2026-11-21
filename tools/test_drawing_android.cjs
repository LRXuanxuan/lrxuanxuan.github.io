/* Runs the real Android JS adapter against a controlled native-message peer.
 * These are bridge protocol contracts, not Android/WebView or SAF dialog tests.
 * NODE_PATH=<jsdom node_modules> node tools/test_drawing_android.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Blob } = require('node:buffer');
const { JSDOM, VirtualConsole } = require('jsdom');
const source = fs.readFileSync(path.resolve(__dirname, '../android/android.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const watched = promise => { promise.catch(() => {}); return promise; };
const live = new Set();

function harness(options = {}) {
  const calls = [], consumed = new Set(), waiting = [], failures = [], listeners = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => failures.push(error));
  const dom = new JSDOM('<!doctype html><html><body><main id="canvas"></main></body></html>', {
    url: options.url || 'https://appassets.androidplatform.net/drawing-studio.html',
    runScripts: 'dangerously', virtualConsole: console
  });
  live.add(dom);
  const win = dom.window;
  win.Blob = Blob;
  win.TextEncoder = TextEncoder;
  win.TextDecoder = TextDecoder;
  win.structuredClone = structuredClone;
  win.document.body.inert = false;
  win.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  win.HTMLDialogElement.prototype.close = function () { this.open = false; };
  const bridge = {
    onmessage: null,
    addEventListener(name, callback) { if (name === 'message') listeners.push(callback); },
    postMessage(text) {
      const request = JSON.parse(text);
      assert.equal(typeof request.id, 'string');
      assert.equal(typeof request.action, 'string');
      assert.ok(!calls.some(call => call.id === request.id), 'Native request IDs must be unique');
      calls.push(request);
      options.post?.(request);
      for (let index = waiting.length - 1; index >= 0; index--) {
        const waiter = waiting[index];
        if (waiter.action === request.action && waiter.match(request)) {
          waiting.splice(index, 1); consumed.add(request.id); waiter.resolve(request); break;
        }
      }
    }
  };
  if (!options.noBridge) win.LightdrawNative = bridge;
  win.eval(source);
  function reply(request, result, error) {
    const event = { data: JSON.stringify(error ? { id: request.id, ok: false, error } : { id: request.id, ok: true, result }) };
    if (bridge.onmessage) bridge.onmessage(event);
    for (const listener of listeners) listener(event);
  }
  return {
    win, calls, reply,
    take(action, match = () => true) {
      const existing = calls.find(call => !consumed.has(call.id) && call.action === action && match(call));
      if (existing) { consumed.add(existing.id); return Promise.resolve(existing); }
      return new Promise((resolve, reject) => waiting.push({ action, match, resolve, reject }));
    },
    count: action => calls.filter(call => call.action === action).length,
    save: (bytes, name = '练习.png', mime = 'image/png') => watched(win.DrawingDesktop.save(new Blob([bytes], { type: mime }), name)),
    dispose() {
      for (const waiter of waiting) waiter.reject(new Error('Harness closed'));
      dom.window.close(); live.delete(dom);
      assert.deepEqual(failures, []);
    }
  };
}

let passed = 0;
async function test(name, run) {
  let timer;
  try {
    await Promise.race([run(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Timed out: ' + name)), 5000); })]);
    passed++; console.log('PASS ' + name);
  } finally { clearTimeout(timer); }
}

async function completeSmallSave(h, saving, token = 'export-token') {
  const begin = await h.take('begin'); h.reply(begin, { token });
  if (begin.size) {
    const chunk = await h.take('chunk');
    h.reply(chunk, Buffer.from(chunk.data, 'base64').length);
  }
  const end = await h.take('end'); h.reply(end, true);
  assert.equal(await saving, true);
}

async function main() {
  await test('Chooser cancellation preserves false and never reads or sends export bytes', async () => {
    const h = harness();
    try {
      const blob = new Blob(['cancel fixture'], { type: 'image/png' });
      let reads = 0;
      const slice = blob.slice.bind(blob);
      blob.slice = (...args) => { reads++; return slice(...args); };
      const saving = watched(h.win.DrawingDesktop.save(blob, '取消.png'));
      const begin = await h.take('begin');
      await flush();
      assert.equal(reads, 0); assert.equal(h.count('chunk'), 0); assert.equal(h.count('end'), 0);
      h.reply(begin, false);
      assert.equal(await saving, false);
      assert.equal(reads, 0); assert.equal(h.count('chunk'), 0); assert.equal(h.count('end'), 0);
    } finally { h.dispose(); }
  });

  await test('Bytes stream in acknowledged order and success waits for the final native write', async () => {
    const h = harness();
    try {
      const bytes = Uint8Array.from({ length: 192 * 1024 * 2 + 37 }, (_, i) => (i * 71 + 19) % 256);
      let settled = false;
      const saving = watched(h.save(bytes).then(value => { settled = true; return value; }));
      const begin = await h.take('begin');
      assert.equal(begin.size, bytes.length); assert.equal(begin.mode, 'save');
      h.reply(begin, { token: 'bytes-session' });
      const chunks = [];
      let written = 0;
      while (written < bytes.length) {
        const request = await h.take('chunk');
        assert.equal(request.token, 'bytes-session'); assert.equal(request.offset, written);
        const chunk = Buffer.from(request.data, 'base64');
        assert.ok(chunk.length > 0 && chunk.length <= 192 * 1024);
        assert.deepEqual(chunk, Buffer.from(bytes.subarray(written, written + chunk.length)));
        await flush();
        assert.equal(h.count('chunk'), chunks.length + 1, 'Only one chunk may await an ACK');
        h.reply({ id: 'unrelated-reply' }, written + chunk.length);
        await flush(); assert.equal(h.count('chunk'), chunks.length + 1);
        chunks.push(chunk); written += chunk.length; h.reply(request, written);
      }
      const end = await h.take('end');
      assert.equal(end.token, 'bytes-session');
      assert.deepEqual(Buffer.concat(chunks), Buffer.from(bytes));
      await flush(); assert.equal(settled, false, 'Sending the last bytes does not mean the file is saved');
      h.reply(end, true);
      assert.equal(await saving, true);
    } finally { h.dispose(); }
  });

  await test('A provider write error rejects, cancels its session, and releases the next queued save', async () => {
    const h = harness();
    try {
      const first = h.save('first'), second = h.save('second');
      const rejection = assert.rejects(first, /provider full/);
      const begin = await h.take('begin'); h.reply(begin, { token: 'failed-session' });
      await flush(); assert.equal(h.count('begin'), 1, 'One page must serialize its chooser requests');
      const chunk = await h.take('chunk'); h.reply(chunk, undefined, 'provider full');
      const cancel = await h.take('cancel'); assert.equal(cancel.token, 'failed-session'); h.reply(cancel, true);
      await rejection;
      assert.equal(h.count('end'), 0, 'Failed data must never be finalized');
      await completeSmallSave(h, second, 'second-session');
    } finally { h.dispose(); }
  });

  await test('Empty exports finalize normally and one canceled chooser does not cancel a queued export', async () => {
    const h = harness();
    try {
      const first = h.save('first'), second = h.save('');
      const begin = await h.take('begin');
      await flush(); assert.equal(h.count('begin'), 1);
      h.reply(begin, false); assert.equal(await first, false);
      const next = await h.take('begin'); assert.equal(next.size, 0); h.reply(next, { token: 'empty-session' });
      const end = await h.take('end'); assert.equal(end.token, 'empty-session');
      assert.equal(h.count('chunk'), 0); h.reply(end, true); assert.equal(await second, true);
    } finally { h.dispose(); }
  });

  await test('A final flush or close failure never becomes a successful export', async () => {
    const h = harness();
    try {
      const saving = h.save('saved bytes');
      const rejected = assert.rejects(saving, /close failed/);
      const begin = await h.take('begin'); h.reply(begin, { token: 'close-failure' });
      const chunk = await h.take('chunk'); h.reply(chunk, Buffer.from(chunk.data, 'base64').length);
      const end = await h.take('end'); h.reply(end, undefined, 'close failed');
      const cancel = await h.take('cancel');
      // A failed native write may already have disposed its transfer. Preserve
      // the original write error even when cleanup reports an expired session.
      h.reply(cancel, undefined, 'session already ended');
      await rejected;
    } finally { h.dispose(); }
  });

  await test('Exit remains busy while chooser work or another export is queued', async () => {
    const h = harness(); let preparations = 0;
    try {
      h.win.DrawingStudio = { prepareToClose: async () => { preparations++; return true; } };
      const first = h.save('first'), second = h.save('second');
      const begin = await h.take('begin');
      const close = h.win.LightdrawAndroid.requestClose('pending-files');
      const refusal = await h.take('close-result');
      assert.equal(refusal.result, 'busy'); assert.equal(preparations, 0);
      h.reply(refusal, true); await close;
      h.reply(begin, false); assert.equal(await first, false);
      const next = await h.take('begin'); h.reply(next, false); assert.equal(await second, false);
    } finally { h.dispose(); }
  });

  await test('Close reports busy and failures without discarding work, then waits for a successful save', async () => {
    const h = harness();
    try {
      h.win.DrawingStudio = { prepareToClose: async () => false };
      const busy = h.win.LightdrawAndroid.requestClose('busy-close');
      const refused = await h.take('close-result');
      assert.equal(refused.nonce, 'busy-close'); assert.equal(refused.result, 'busy');
      h.reply(refused, true); await busy;
      assert.equal(h.win.document.body.inert, false);
      h.win.DrawingStudio.prepareToClose = async () => { throw new Error('quota reached'); };
      const failing = h.win.LightdrawAndroid.requestClose('failed-close');
      const failed = await h.take('close-result');
      assert.equal(failed.result, 'error'); assert.match(failed.message, /quota reached/);
      h.reply(failed, true); await failing;
      assert.equal(h.win.document.body.inert, false);
      const commit = deferred();
      h.win.DrawingStudio.prepareToClose = () => commit.promise;
      const pending = h.win.LightdrawAndroid.requestClose('saved-close');
      await flush(); assert.equal(h.count('close-result'), 2);
      assert.equal(h.win.document.body.inert, true, 'No stroke may begin while exit saving is in flight');
      commit.resolve(true);
      const ready = await h.take('close-result'); assert.equal(ready.nonce, 'saved-close'); assert.equal(ready.result, 'ready');
      h.reply(ready, true); await pending;
    } finally { h.dispose(); }
  });

  await test('Back dismisses an open page dialog before considering application exit', async () => {
    const h = harness(); let preparations = 0;
    try {
      h.win.DrawingStudio = { prepareToClose: async () => { preparations++; return true; } };
      const dialog = h.win.document.createElement('dialog');
      h.win.document.body.appendChild(dialog); dialog.showModal();
      const closing = h.win.LightdrawAndroid.requestClose('dialog-back');
      const handled = await h.take('close-result');
      assert.equal(handled.result, 'handled'); assert.equal(dialog.open, false);
      assert.equal(preparations, 0); h.reply(handled, true); await closing;
      dialog.showModal(); dialog.addEventListener('cancel', event => event.preventDefault());
      const guarded = h.win.LightdrawAndroid.requestClose('guarded-dialog');
      const retained = await h.take('close-result');
      assert.equal(retained.result, 'handled'); assert.equal(dialog.open, true);
      assert.equal(preparations, 0); h.reply(retained, true); await guarded;
    } finally { h.dispose(); }
  });

  await test('A browser without the native bridge retains its normal website behavior', async () => {
    const h = harness({ noBridge: true, url: 'https://lrxuanxuan.github.io/drawing-studio.html' });
    try {
      assert.equal(h.win.DrawingDesktop, undefined);
      assert.equal(h.win.LightdrawAndroid, undefined);
      assert.equal(h.calls.length, 0);
    } finally { h.dispose(); }
  });
  console.log('Android adapter contracts: ' + passed + ' checks passed. Native Android behavior needs separate device/emulator checks.');
}

main().catch(error => {
  for (const dom of live) dom.window.close();
  console.error(error); process.exitCode = 1;
});
