/* Development-only contracts for the deployed study-page export functions.
 * Uses the real function sources with small rendering/dialog fixtures. This is
 * not a WebView2 or native file-dialog test, and adds no shipped dependency.
 * node tools/test_studio_desktop_exports.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { Blob } = require('node:buffer');
const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'color-block-studio.html'), 'utf8');
const study = fs.readFileSync(path.join(root, 'assets/color-block-studio/studio-study.js'), 'utf8');
function between(source, start, end) {
  const begin = source.indexOf(start), finish = source.indexOf(end, begin + start.length);
  assert.ok(begin >= 0 && finish > begin, 'Deployed function boundaries must exist: ' + start);
  return source.slice(begin, finish);
}
const functions = [
  between(page, '  async function downloadBlob(', '  function nextFrame('),
  between(page, '  async function exportPNG(', '  async function renderFullRes('),
  between(page, '  async function exportOriginal(', '  function drawSwatch('),
  between(page, '  async function exportCard(', '  /* ---------------- 保存'),
  between(page, '  async function doSave(', '  function openSaveModal('),
  between(page, '  async function startBatch(', '  function bytesToBase64('),
  between(study, '      async function exportLineOriginal(', '      function fitCanvas(')
].join('\n');
const filename = '2026年11月21日14时05分';
function harness() {
  const toasts = [], anchors = [], blob = new Blob(['png fixture'], { type: 'image/png' });
  const control = (value = '') => ({ value, checked: false, disabled: false, hidden: false, textContent: '', style: {} });
  const state = { ready: true, name: 'reference', workW: 100, workH: 60, naturalW: 400, naturalH: 300, img: {}, line: false, gray: false, k: 12 };
  const els = { resultCanvas: {}, saveOriginal: control(), saveLine: control(), saveBlock: control(), saveCard: control(), saveModal: control(),
    batchSize: control('1600'), batchUnified: control(), batchCards: control(), batchPalette: control(), batchOriginal: control(),
    batchStart: control(), batchCancel: control(), batchProgressWrap: control(), batchBar: control(), batchStatus: control() };
  els.saveBlock.checked = true;
  const context = vm.createContext({
    Blob, Uint8Array, console: { error() {} }, setTimeout() { return 0; },
    URL: { createObjectURL: () => 'blob:study-export-fixture', revokeObjectURL() {} },
    window: { studioExportName: () => filename },
    document: { body: { appendChild() {} }, createElement: () => ({ style: {}, remove() {}, click() { anchors.push(this.download); } }) },
    state, s: state, els, study: { inspect: () => ({ showA: false }) },
    toast: message => toasts.push(message), showBusy() {}, hideBusy() {}, nextFrame: async () => {},
    paletteLabel: () => '色彩', canvasToBlob: async () => blob, buildReferenceCard: () => ({}),
    renderFullRes: async () => ({ canvas: {}, w: 400, h: 300 }),
    buildSaveEntries: async () => [{ name: 'reference.png', folder: '色块', data: new Uint8Array([1, 2, 3]), type: 'image/png' }],
    makeZipBlob: () => new Blob(['zip fixture'], { type: 'application/zip' }), zipSafe: value => value,
    batchRunning: false, batchCancelFlag: false, batchFiles: [{}],
    runBatch: async () => ({ count: 1, skipped: [], zipBlob: new Blob(['zip fixture'], { type: 'application/zip' }), zipBytes: new Uint8Array(11), name: 'reference.zip' }),
    mode: 'line', names: { line: '线稿' }
  });
  vm.runInContext(functions, context, { filename: 'deployed-study-export-functions.js' });
  context.h = { toast: context.toast, showBusy: context.showBusy, hideBusy: context.hideBusy, downloadBlob: context.downloadBlob, canvasToBlob: context.canvasToBlob };
  return { context, toasts, anchors, blob };
}
let passed = 0;
async function test(name, run) { await run(); passed++; console.log('PASS ' + name); }
async function main() {
  await test('Browser download preserves the generated filename and local anchor', async () => {
    const { context, anchors, blob } = harness();
    assert.equal(await context.downloadBlob(blob, 'original.png'), filename + '.png');
    assert.deepEqual(anchors, [filename + '.png']);
  });
  await test('Native helper returns a filename only after a completed write, false on cancel, and rejects failures', async () => {
    const { context, anchors, blob } = harness(); let finish, completed = false;
    context.window.DrawingDesktop = { save: (value, name) => {
      assert.equal(value, blob); assert.equal(name, filename + '.png'); return new Promise(resolve => { finish = resolve; });
    } };
    const pending = context.downloadBlob(blob, 'original.png').then(value => { completed = true; return value; });
    await Promise.resolve(); assert.equal(completed, false);
    finish(true); assert.equal(await pending, filename + '.png');
    context.window.DrawingDesktop.save = async () => false;
    assert.equal(await context.downloadBlob(blob, 'original.png'), false);
    context.window.DrawingDesktop.save = async () => { throw new Error('Native write failed'); };
    await assert.rejects(context.downloadBlob(blob, 'original.png'), /Native write failed/);
    assert.equal(anchors.length, 0);
  });
  for (const entry of ['exportPNG', 'exportOriginal', 'exportCard', 'exportLineOriginal', 'doSave', 'startBatch']) {
    await test(entry + ' waits for native saving and keeps cancellation distinct from success', async () => {
      const { context, toasts, anchors } = harness(); let release, called;
      const started = new Promise(resolve => { called = resolve; });
      context.window.DrawingDesktop = { save: () => { called(); return new Promise(resolve => { release = resolve; }); } };
      const pending = context[entry](); await started;
      assert.equal(toasts.length, 0, 'No success toast is allowed before the write completes');
      release(false); await pending;
      assert.equal(toasts.length, 1); assert.match(toasts[0], /已取消/); assert.doesNotMatch(toasts[0], /已导出|已保存|已下载/);
      assert.equal(anchors.length, 0); assert.equal(context.batchRunning, false);
      toasts.length = 0; context.window.DrawingDesktop.save = async () => true;
      await context[entry]();
      assert.equal(toasts.length, 1); assert.match(toasts[0], /已导出|已保存|已下载|已按原图比例导出/);
      assert.doesNotMatch(toasts[0], /Promise|false/);
    });
  }
  await test('Multiple selection ZIP cancellation does not claim that its entries were saved', async () => {
    const { context, toasts } = harness();
    context.buildSaveEntries = async () => [{ name: 'a.png', folder: '色块', data: new Uint8Array(1) }, { name: 'b.png', folder: '线稿', data: new Uint8Array(1) }];
    context.window.DrawingDesktop = { save: async () => false };
    await context.doSave(); assert.deepEqual(toasts, ['已取消保存']);
  });
  await test('Native write rejection reaches the UI as an export failure', async () => {
    const { context, toasts } = harness();
    context.window.DrawingDesktop = { save: async () => { throw new Error('Disk full'); } };
    await context.exportPNG(); assert.deepEqual(toasts, ['导出失败：Disk full']);
  });
  // Parse every inline script as well as exercising the extracted entry points.
  for (const match of page.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) if (match[1].trim()) new vm.Script(match[1]);
  console.log('Study desktop export contracts: ' + passed + ' checks passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
