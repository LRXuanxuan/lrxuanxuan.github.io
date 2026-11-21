/* Local single-current-artwork storage; run with fake-indexeddb on NODE_PATH. */
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
function open(indexedDB, version = 3) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, version);
    request.onupgradeneeded = () => {
      if (version <= 2) {
        if (!request.result.objectStoreNames.contains('drafts'))
          request.result.createObjectStore('drafts', { keyPath: 'id' }).createIndex('savedAt', 'savedAt');
        if (version === 2 && !request.result.objectStoreNames.contains('current'))
          request.result.createObjectStore('current').createIndex('stamp', 'stamp');
      }
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
async function oldDatabase(version = 1) {
  const factory = new IDBFactory(), db = await open(factory, version);
  const stores = version === 2 ? ['drafts', 'current'] : ['drafts'];
  const tx = db.transaction(stores, 'readwrite');
  for (const [i, id] of ['oldest', 'middle', 'latest'].entries())
    tx.objectStore('drafts').put({ id, savedAt: i + 1, project: { title: id, image: new Blob([id]) } });
  if (version === 2)
    tx.objectStore('current').put({ project: { title: 'keep-current', image: new Blob(['present']) }, stamp: 'v2-stamp', savedAt: 55 }, 'artwork');
  await finished(tx); db.close(); return factory;
}
async function inspect(factory) {
  const db = await open(factory, 3);
  const stores = Array.from(db.objectStoreNames);
  const tx = db.transaction('current'), record = tx.objectStore('current').get('artwork');
  await finished(tx); db.close();
  return { stores, record: record.result };
}
const isConflict = error => error?.code === 'CURRENT_CONFLICT';

async function main() {
  // Old v1 multi-draft history is intentionally discarded, not migrated.
  const factory = await oldDatabase(), first = tab(factory), second = tab(factory);
  const [a, b] = await Promise.all([first.readCurrent(), second.readCurrent()]);
  assert.equal(a.project, null); assert.equal(a.stamp, null);
  assert.equal(b.project, null); assert.equal(b.stamp, null);
  assert.deepEqual((await inspect(factory)).stores, ['current']);
  assert.equal(typeof first.list, 'undefined');
  assert.equal(typeof first.load, 'undefined');
  assert.equal(typeof first.save, 'undefined');
  assert.equal(typeof first.latest, 'undefined');
  assert.equal(typeof first.remove, 'undefined');

  // Concurrent initial saves and revisions use the same atomic stamp barrier.
  const initialWrites = await Promise.allSettled([
    first.writeCurrent({ title: 'first' }, null),
    second.writeCurrent({ title: 'second' }, null)
  ]);
  assert.equal(initialWrites.filter(v => v.status === 'fulfilled').length, 1);
  assert.ok(isConflict(initialWrites.find(v => v.status === 'rejected').reason));
  const initial = await first.readCurrent();
  assert.equal(initial.project.title, initialWrites[0].status === 'fulfilled' ? 'first' : 'second');
  const [seenFirst, seenSecond] = await Promise.all([first.readCurrent(), second.readCurrent()]);
  const writes = await Promise.allSettled([
    first.writeCurrent({ title: 'updated-first' }, seenFirst.stamp),
    second.writeCurrent({ title: 'updated-second' }, seenSecond.stamp)
  ]);
  assert.equal(writes.filter(v => v.status === 'fulfilled').length, 1);
  assert.ok(isConflict(writes.find(v => v.status === 'rejected').reason));
  const winner = await first.readCurrent();
  assert.notEqual(winner.stamp, initial.stamp);
  const tomb = await second.writeCurrent(null, winner.stamp);
  assert.notEqual(tomb.stamp, winner.stamp);
  await assert.rejects(first.writeCurrent({ title: 'stale' }, winner.stamp), isConflict);
  const reopened = await tab(factory).readCurrent();
  assert.equal(reopened.project, null); assert.equal(reopened.stamp, tomb.stamp);
  assert.deepEqual((await inspect(factory)).stores, ['current']);

  await assert.rejects(first.writeCurrent({ title: 'forgot token' }), /stamp/);
  const project = { title: 'after clear', layers: [{ name: 'one' }] };
  const pending = first.writeCurrent(project, reopened.stamp);
  project.layers[0].name = 'changed after save';
  const saved = await pending;
  assert.equal((await first.readCurrent()).project.layers[0].name, 'one');
  await assert.rejects(first.writeCurrent({ bad: () => {} }, saved.stamp));
  assert.equal((await first.readCurrent()).stamp, saved.stamp);
  console.log('PASS v1 drafts purged, two-tab atomic compare/swap, tombstone and snapshot isolation');

  // Existing v2 current artwork survives the upgrade, but leftover drafts do not.
  const factoryV2 = await oldDatabase(2), fromV2 = tab(factoryV2);
  const preserved = await fromV2.readCurrent();
  assert.equal(preserved.stamp, 'v2-stamp');
  assert.equal(preserved.project.title, 'keep-current');
  assert.equal(await preserved.project.image.text(), 'present');
  const upgraded = await inspect(factoryV2);
  assert.deepEqual(upgraded.stores, ['current']);
  assert.equal(upgraded.record.project.title, 'keep-current');
  const updated = await fromV2.writeCurrent({ title: 'still editing' }, preserved.stamp);
  assert.equal((await fromV2.readCurrent()).project.title, 'still editing');
  assert.notEqual(updated.stamp, preserved.stamp);
  console.log('PASS v2 current artwork preserved while old drafts are deleted');

  // A failed current-artwork write rolls back, retains the previous image and can retry.
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (...args) {
    const request = put.apply(this, args);
    if (this.name === 'current')
      request.addEventListener('success', () => this.transaction.abort(), { once: true });
    return request;
  };
  try {
    await assert.rejects(fromV2.writeCurrent({ title: 'failed' }, updated.stamp));
    assert.equal((await fromV2.readCurrent()).project.title, 'still editing');
  } finally { IDBObjectStore.prototype.put = put; }
  assert.equal((await fromV2.writeCurrent({ title: 'recovered' }, updated.stamp)).stamp.length > 0, true);
  const clean = tab(new IDBFactory()), initialClean = await clean.readCurrent();
  assert.equal(initialClean.stamp, null); assert.equal(initialClean.project, null);
  const cleared = await clean.writeCurrent(null, null);
  assert.ok(cleared.stamp);
  await assert.rejects(clean.writeCurrent({ title: 'stale first tab' }, null), isConflict);
  console.log('PASS failed saves preserve current artwork; empty database and tombstone work');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
