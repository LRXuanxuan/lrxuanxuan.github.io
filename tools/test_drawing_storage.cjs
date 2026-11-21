/* Local current-artwork storage. Run with fake-indexeddb on NODE_PATH. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const { IDBFactory, IDBObjectStore } = require('fake-indexeddb');
const script = fs.readFileSync(path.join(__dirname, '../assets/drawing-studio/storage.js'), 'utf8');
const DB = 'rc-drawing-studio-v1';
function tab(indexedDB) {
  const window = { indexedDB, crypto: webcrypto };
  vm.runInNewContext(script, { window, structuredClone });
  return window.DrawingStorage;
}
function open(indexedDB, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, version);
    request.onupgradeneeded = () => {
      if (version === 1) request.result.createObjectStore('drafts', { keyPath: 'id' }).createIndex('savedAt', 'savedAt');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function finished(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error);
  });
}
async function legacyDB() {
  const factory = new IDBFactory(), db = await open(factory, 1);
  const tx = db.transaction('drafts', 'readwrite');
  for (const [i, id] of ['oldest', 'middle', 'latest'].entries()) {
    tx.objectStore('drafts').put({ id, savedAt: i + 1, project: { title: id, image: new Blob([id]) } });
  }
  await finished(tx); db.close(); return factory;
}
async function rawKeys(factory, name) {
  const db = await open(factory, 2);
  const tx = db.transaction(name), keys = tx.objectStore(name).getAllKeys();
  await finished(tx); db.close(); return keys.result;
}
const isConflict = error => error?.code === 'CURRENT_CONFLICT';
async function main() {
  const factory = await legacyDB(), first = tab(factory), second = tab(factory);
  await assert.rejects(first.writeCurrent({ title: 'unread' }, null), isConflict);
  const [a,b] = await Promise.all([first.readCurrent(), second.readCurrent()]);
  assert.equal(a.stamp, b.stamp); assert.ok(a.stamp); assert.equal(a.savedAt, 3);
  assert.equal(a.project.title, 'latest'); assert.equal(await a.project.image.text(), 'latest');
  assert.deepEqual(await rawKeys(factory, 'drafts'), ['middle', 'oldest']);
  assert.deepEqual(await rawKeys(factory, 'current'), ['artwork']);
  const writes = await Promise.allSettled([first.writeCurrent({ title: 'first' }, a.stamp), second.writeCurrent({ title: 'second' }, b.stamp)]);
  assert.equal(writes.filter(v => v.status === 'fulfilled').length, 1);
  assert.ok(isConflict(writes.find(v => v.status === 'rejected').reason));
  const winner = await first.readCurrent(); assert.notEqual(winner.stamp, a.stamp);
  assert.equal(winner.project.title, writes[0].status === 'fulfilled' ? 'first' : 'second');
  const tomb = await second.writeCurrent(null, winner.stamp);
  assert.notEqual(tomb.stamp, winner.stamp);
  await assert.rejects(first.writeCurrent({ title: 'stale' }, winner.stamp), isConflict);
  const reopened = await tab(factory).readCurrent();
  assert.equal(reopened.project, null); assert.equal(reopened.stamp, tomb.stamp);
  assert.deepEqual(await rawKeys(factory, 'drafts'), ['middle','oldest']);
  await assert.rejects(first.writeCurrent({ title: 'forgot token' }), /stamp/);
  const project = { title: 'after clear', layers: [{ name: 'one' }] };
  const pending = first.writeCurrent(project, reopened.stamp);
  project.layers[0].name = 'changed after save';
  const saved = await pending;
  assert.equal((await first.readCurrent()).project.layers[0].name, 'one');
  assert.deepEqual(await rawKeys(factory, 'current'), ['artwork']);
  await assert.rejects(first.writeCurrent({ bad: () => {} }, saved.stamp));
  assert.equal((await first.readCurrent()).stamp, saved.stamp);
  console.log('PASS v1 migration, two-tab atomic compare and swap, tombstone, single current slot, snapshot and retry');
  const brokenFactory = await legacyDB(), broken = tab(brokenFactory);
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    const request = put.apply(this,args);
    if (this.name === 'current') request.addEventListener('success', () => this.transaction.abort(), { once: true });
    return request;
  };
  try {
    await assert.rejects(broken.readCurrent());
    assert.deepEqual(await rawKeys(brokenFactory, 'drafts'), ['latest','middle','oldest']);
    assert.deepEqual(await rawKeys(brokenFactory, 'current'), []);
    await assert.rejects(first.writeCurrent(null,saved.stamp));
    assert.equal((await second.readCurrent()).project.title,'after clear');
  } finally { IDBObjectStore.prototype.put = put; }
  assert.equal((await broken.readCurrent()).project.title, 'latest');
  const clean = tab(new IDBFactory()), initial = await clean.readCurrent();
  assert.equal(initial.stamp, null); assert.equal(initial.project, null);
  const clear = await clean.writeCurrent(null,null);
  assert.ok(clear.stamp); await assert.rejects(clean.writeCurrent({title:'stale first tab'},null),isConflict);
  console.log('PASS failed migration/write rollback, migration retry, pristine storage and tombstone before first edit');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
