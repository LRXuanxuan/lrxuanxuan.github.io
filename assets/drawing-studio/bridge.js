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
  // A pair is local to these two windows. Independent drawing sessions never receive a handoff.
  var partner = null, receiver = null, requestedPath = '';
  function matches(page, path) {
    try { return page && !page.closed && page.location.origin === location.origin && page.location.pathname === path; }
    catch (_) { return false; }
  }
  function openStudio(href) {
    var url = new URL(href, location.href);
    var drawing = new URL('drawing-studio.html', location.href), study = new URL('color-block-studio.html', location.href);
    if (url.origin !== location.origin || ![drawing.pathname, study.pathname].includes(url.pathname)) throw new Error('画室地址无效。');
    var opening = false;
    try { opening = partner && !partner.closed && requestedPath === url.pathname && partner.location.href === 'about:blank'; } catch (_) {}
    if (!opening && !matches(partner, url.pathname)) {
      var opener = root.opener;
      if (matches(opener, url.pathname) && opener.DrawingBridge && opener.DrawingBridge.hasPartner(root)) partner = opener;
      else partner = root.open(url.href, '_blank');
      requestedPath = url.pathname;
    }
    if (!partner) throw new Error('请允许本站打开画室标签页。当前作品仍在此页。');
    partner.focus();
    return partner;
  }
  async function sendReference(page, id) {
    var path = new URL('drawing-studio.html', location.href).pathname;
    var deadline = Date.now() + 20000;
    do {
      if (page.closed) throw new Error('轻绘标签页已关闭，请再点一次传送。');
      if (matches(page, path) && page.DrawingBridge && page.DrawingBridge.canReceive()) {
        return page.DrawingBridge.receive(id, root);
      }
      await new Promise(function (resolve) { setTimeout(resolve, 100); });
    } while (Date.now() < deadline);
    throw new Error('轻绘尚未就绪，请检查轻绘标签页后重试。');
  }
  function receive(id, from) {
    var path = new URL('color-block-studio.html', location.href).pathname;
    if (!matches(from, path) || (from !== partner && (from !== root.opener || !from.DrawingBridge.hasPartner(root)))) {
      throw new Error('请从与当前画室配对的练习室发送参考。');
    }
    partner = from;
    return receiver(id);
  }
  if (root.document) root.document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[data-studio-switch]');
    if (!link || event.defaultPrevented || event.button || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    try { openStudio(link.href); }
    catch (error) { root.dispatchEvent(new CustomEvent('studio-navigation-error', { detail: error.message })); }
  });
  root.DrawingBridge = {
    put: put, take: take, openStudio: openStudio, sendReference: sendReference,
    hasPartner: function (page) { return partner === page; },
    setReceiver: function (fn) { receiver = fn; },
    canReceive: function () { return typeof receiver === 'function'; }, receive: receive
  };
})(window);
