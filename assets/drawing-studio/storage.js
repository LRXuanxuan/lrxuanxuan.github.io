/* One current artwork per browser; obsolete draft history is discarded on upgrade. */
(function () {
  'use strict';

  const DB_NAME = 'rc-drawing-studio-v1';
  const CURRENT_STORE = 'current';
  const CURRENT_KEY = 'artwork';
  const LEGACY_STORE = 'drafts';
  let databasePromise = null;
  let mutationQueue = Promise.resolve();

  function failure(message, cause) {
    const error = new Error(message);
    if (cause) error.cause = cause;
    return error;
  }

  function openDatabase() {
    if (databasePromise) return databasePromise;
    const pending = new Promise(function (resolve, reject) {
      let request;
      let settled = false;
      try {
        if (!window.indexedDB) throw new Error('IndexedDB unavailable');
        request = window.indexedDB.open(DB_NAME, 3);
      } catch (error) {
        reject(failure('浏览器未允许本机续画存储，请导出工程文件保存。', error));
        return;
      }
      request.onupgradeneeded = function () {
        const db = request.result;
        // Requested cleanup, performed atomically by IndexedDB's version upgrade.
        // Delete only obsolete multi-draft history. Never delete the current artwork.
        if (db.objectStoreNames.contains(LEGACY_STORE)) db.deleteObjectStore(LEGACY_STORE);
        if (!db.objectStoreNames.contains(CURRENT_STORE)) {
          db.createObjectStore(CURRENT_STORE).createIndex('stamp', 'stamp');
        }
      };
      request.onsuccess = function () {
        const db = request.result;
        if (settled) { db.close(); return; }
        settled = true;
        db.onversionchange = function () { db.close(); databasePromise = null; };
        db.onclose = function () { databasePromise = null; };
        resolve(db);
      };
      request.onerror = function () {
        if (settled) return;
        settled = true;
        reject(failure('无法打开本机续画，请导出工程文件保存。', request.error));
      };
      request.onblocked = function () {
        if (settled) return;
        settled = true;
        reject(failure('其他旧页面占用了本机续画存储；关闭旧画板后可重试。'));
      };
    });
    databasePromise = pending;
    pending.catch(function () {
      if (databasePromise === pending) databasePromise = null;
    });
    return pending;
  }

  // Resolve writes on transaction completion, never just request success.
  function runTransaction(db, stores, mode, operation) {
    return new Promise(function (resolve, reject) {
      let tx;
      let output;
      let error;
      try {
        tx = db.transaction(stores, mode);
        tx.oncomplete = function () { resolve(output); };
        tx.onabort = function () {
          reject(error || tx.error || failure('本机存储事务被中断。'));
        };
        tx.onerror = function (event) {
          error = error || event.target.error || tx.error;
        };
        operation(tx, function (value) { output = value; }, function (reason) {
          error = reason;
          tx.abort();
        });
      } catch (cause) {
        error = cause;
        if (tx) {
          try { tx.abort(); } catch (_) { /* Already inactive. */ }
        }
        reject(cause);
      }
    });
  }

  function serialize(operation) {
    const pending = mutationQueue.then(operation);
    // One failed write must not block later reads or saves.
    mutationQueue = pending.then(function () {}, function () {});
    return pending;
  }

  function newStamp() {
    if (window.crypto.randomUUID) return window.crypto.randomUUID();
    return Array.from(window.crypto.getRandomValues(new Uint32Array(4)), part => part.toString(16).padStart(8, '0')).join('');
  }

  function readCurrent() {
    // Keep read as a write-queue barrier; old drafts are never restored.
    return serialize(async function () {
      const db = await openDatabase();
      return runTransaction(db, CURRENT_STORE, 'readonly', function (tx, done) {
        const request = tx.objectStore(CURRENT_STORE).get(CURRENT_KEY);
        request.onsuccess = function () {
          done(request.result || { project: null, stamp: null, savedAt: 0 });
        };
      });
    });
  }

  function currentConflict() {
    const error = failure('另一页面已更新当前画作，请重新读取后再保存。');
    error.code = 'CURRENT_CONFLICT';
    return error;
  }

  function writeCurrent(project, expectedStamp) {
    let snapshot;
    try {
      if (expectedStamp !== null && (typeof expectedStamp !== 'string' || !expectedStamp))
        throw new TypeError('请传入读取当前画作时得到的 stamp。');
      if (project !== null && (!project || typeof project !== 'object' || Array.isArray(project)))
        throw new TypeError('当前画作必须是完整的工程对象或 null。');
      snapshot = structuredClone(project);
    } catch (error) { return Promise.reject(error); }
    return serialize(async function () {
      const db = await openDatabase();
      return runTransaction(db, CURRENT_STORE, 'readwrite', function (tx, done, abort) {
        const current = tx.objectStore(CURRENT_STORE);
        // Read only keys, not large artwork blobs, to check the last revision.
        const request = current.index('stamp').openKeyCursor();
        request.onsuccess = function () {
          if ((request.result?.key ?? null) !== expectedStamp) { abort(currentConflict()); return; }
          const stamp = newStamp(), savedAt = Date.now();
          current.put({ project: snapshot, stamp, savedAt }, CURRENT_KEY);
          done({ stamp, savedAt });
        };
      });
    });
  }

  window.DrawingStorage = Object.freeze({ readCurrent, writeCurrent });
})();
