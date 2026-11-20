/* Local drawing drafts. No image or project data leaves this browser. */
(function () {
  'use strict';

  const DB_NAME = 'rc-drawing-studio-v1';
  const STORE = 'drafts';
  const MAX_DRAFTS = 4;
  let databasePromise = null;
  let mutationQueue = Promise.resolve();
  let lastTimestamp = 0;

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
        request = window.indexedDB.open(DB_NAME, 1);
      } catch (error) {
        reject(failure('浏览器未允许本地草稿存储，请导出工程文件保存。', error));
        return;
      }
      request.onupgradeneeded = function () {
        const db = request.result;
        const store = db.objectStoreNames.contains(STORE)
          ? request.transaction.objectStore(STORE)
          : db.createObjectStore(STORE, { keyPath: 'id' });
        if (!store.indexNames.contains('savedAt')) {
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
      request.onsuccess = function () {
        const db = request.result;
        if (settled) {
          db.close();
          return;
        }
        settled = true;
        db.onversionchange = function () {
          db.close();
          databasePromise = null;
        };
        db.onclose = function () { databasePromise = null; };
        resolve(db);
      };
      request.onerror = function () {
        if (settled) return;
        settled = true;
        reject(failure('无法打开本地草稿，请导出工程文件保存。', request.error));
      };
      request.onblocked = function () {
        if (settled) return;
        settled = true;
        reject(failure('其他旧页面占用了草稿存储；关闭旧画板后可重试。'));
      };
    });
    databasePromise = pending;
    pending.catch(function () {
      if (databasePromise === pending) databasePromise = null;
    });
    return pending;
  }

  // Resolve writes on transaction completion, never just on request success.
  function transaction(db, mode, operation) {
    return new Promise(function (resolve, reject) {
      let tx;
      let output;
      let error;
      try {
        tx = db.transaction(STORE, mode);
        tx.oncomplete = function () { resolve(output); };
        tx.onabort = function () {
          reject(error || tx.error || failure('草稿存储事务被中断。'));
        };
        tx.onerror = function (event) {
          error = event.target.error || tx.error;
        };
        operation(tx.objectStore(STORE), function (value) { output = value; });
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
    // One failed save must not prevent later saves or reads from working.
    mutationQueue = pending.then(function () {}, function () {});
    return pending;
  }

  function validId(id) {
    if (typeof id !== 'string' || !id.trim() || id.length > 180) {
      throw new TypeError('草稿 id 必须为非空字符串，且不超过 180 个字符。');
    }
    return id;
  }

  function summary(record) {
    const project = record.project || {};
    return {
      id: record.id,
      savedAt: record.savedAt,
      title: String(project.title || project.name || '未命名画作').slice(0, 160),
      width: Number(project.width) || 0,
      height: Number(project.height) || 0,
      layerCount: Array.isArray(project.layers) ? project.layers.length : 0
    };
  }

  function trimDrafts(db) {
    return transaction(db, 'readwrite', function (store) {
      let count = 0;
      const cursor = store.index('savedAt').openCursor(null, 'prev');
      cursor.onsuccess = function () {
        const entry = cursor.result;
        if (!entry) return;
        count += 1;
        if (count > MAX_DRAFTS) entry.delete();
        entry.continue();
      };
    });
  }

  function save(id, project) {
    let record;
    try {
      validId(id);
      if (!project || typeof project !== 'object' || Array.isArray(project)) {
        throw new TypeError('草稿必须是完整的工程对象。');
      }
      // Snapshot at invocation, before queuing. This does not transfer/detach any
      // buffers or mutate the caller. Blobs remain Blobs, not base64 strings.
      const snapshot = structuredClone(project);
      lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
      record = { id: id, project: snapshot, savedAt: lastTimestamp };
    } catch (error) {
      return Promise.reject(error);
    }
    return serialize(async function () {
      const db = await openDatabase();
      try {
        await transaction(db, 'readwrite', function (store) { store.put(record); });
      } catch (error) {
        throw failure('草稿未能保存，画面仍在内存中；请导出工程文件。', error);
      }
      // Pruning only starts after the new record is durably committed. A quota
      // or cloning failure above can never delete an older saved project.
      try {
        await trimDrafts(db);
      } catch (error) {
        const committed = failure('草稿已保存，但清理旧草稿失败；可稍后重试。', error);
        committed.saved = true;
        committed.id = id;
        throw committed;
      }
      return summary(record);
    });
  }

  function load(id) {
    try { validId(id); } catch (error) { return Promise.reject(error); }
    return mutationQueue.then(async function () {
      const db = await openDatabase();
      return transaction(db, 'readonly', function (store, done) {
        const request = store.get(id);
        request.onsuccess = function () { done(request.result || null); };
      });
    });
  }

  function latest() {
    return mutationQueue.then(async function () {
      const db = await openDatabase();
      return transaction(db, 'readonly', function (store, done) {
        const request = store.index('savedAt').openCursor(null, 'prev');
        request.onsuccess = function () {
          done(request.result ? request.result.value : null);
        };
      });
    });
  }

  function list() {
    return mutationQueue.then(async function () {
      const db = await openDatabase();
      return transaction(db, 'readonly', function (store, done) {
        const records = [];
        const request = store.index('savedAt').openCursor(null, 'prev');
        request.onsuccess = function () {
          const cursor = request.result;
          if (!cursor) {
            done(records);
            return;
          }
          records.push(summary(cursor.value));
          cursor.continue();
        };
      });
    });
  }

  function remove(id) {
    try { validId(id); } catch (error) { return Promise.reject(error); }
    return serialize(async function () {
      const db = await openDatabase();
      return transaction(db, 'readwrite', function (store) { store.delete(id); });
    });
  }

  window.DrawingStorage = Object.freeze({ save: save, latest: latest, list: list, load: load, remove: remove });
})();
