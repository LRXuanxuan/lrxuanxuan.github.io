/* Same-origin, short-lived handoff. No images or preferences leave this browser. */
(function (root) {
  'use strict';
  var DB = 'rc-drawing-transfer-v1', STORE = 'transfers', DAY = 86400000;
  function open() {
    return new Promise(function (resolve, reject) {
      if (!root.indexedDB) { reject(new Error('浏览器未开放本地存储，请先导出参考图片，再到轻绘中打开。')); return; }
      var request = root.indexedDB.open(DB, 1);
      request.onupgradeneeded = function () { request.result.createObjectStore(STORE, { keyPath: 'id' }); };
      request.onerror = function () { reject(new Error('无法使用本地参考传递，请检查浏览器的存储权限。')); };
      request.onblocked = function () { reject(new Error('本地参考库被另一个页面占用，请关闭旧页面后重试。')); };
      request.onsuccess = function () { resolve(request.result); };
    });
  }
  function token() {
    var bytes = new Uint8Array(16);
    if (root.crypto && root.crypto.getRandomValues) root.crypto.getRandomValues(bytes);
    else for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.from(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  async function put(bundle) {
    if (!bundle || bundle.version !== 1 || !(bundle.original instanceof Blob)) throw new Error('参考图数据不完整。');
    var db = await open(), id = token();
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE, 'readwrite'), store = tx.objectStore(STORE), now = Date.now();
      var cursor = store.openCursor();
      cursor.onsuccess = function () {
        var item = cursor.result;
        if (item) { if (!item.value.createdAt || now - item.value.createdAt > DAY) item.delete(); item.continue(); }
      };
      store.put({ id: id, createdAt: now, bundle: bundle });
      tx.oncomplete = function () { db.close(); resolve(id); };
      tx.onerror = tx.onabort = function () { db.close(); reject(new Error('参考图没有保存成功；本地存储空间可能不足。请导出图片后手动载入。')); };
    });
  }
  async function take(id) {
    if (!/^[a-f0-9]{32}$/.test(String(id || ''))) throw new Error('参考链接无效，请从练习室重新传递。');
    var db = await open();
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE, 'readwrite'), store = tx.objectStore(STORE), found = null;
      var req = store.get(id);
      req.onsuccess = function () {
        var item = req.result;
        if (item) { if (Date.now() - item.createdAt <= DAY) found = item.bundle; store.delete(id); }
      };
      tx.oncomplete = function () {
        db.close();
        if (found) resolve(found);
        else reject(new Error('参考已领取或已过期。请在同一浏览器中从练习室重新点击“带参考去画画”。'));
      };
      tx.onerror = tx.onabort = function () { db.close(); reject(new Error('本地参考读取失败，请从练习室重新传递。')); };
    });
  }
  root.DrawingBridge = { put: put, take: take };
})(window);
