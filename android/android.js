/* Android-only adapter; injected into the bundled pages, never the website. */
(function (root) {
  'use strict';
  const native = root.LightdrawNative;
  if (!native || typeof native.postMessage !== 'function') return;
  const CHUNK_BYTES = 192 * 1024;
  const MAX_BYTES = 512 * 1024 * 1024;
  const MAX_PRINT_BYTES = 24 * 1024 * 1024;
  const pending = new Map();
  let sequence = 0, queuedExports = 0, saving = Promise.resolve(), closing = false;

  function request(action, data) {
    const id = Date.now().toString(36) + '-' + (++sequence).toString(36);
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      try { native.postMessage(JSON.stringify({ id, action, ...data })); }
      catch (error) { pending.delete(id); reject(error); }
    });
  }

  native.onmessage = function (event) {
    let message;
    try { message = JSON.parse(event.data); } catch (_) { return; }
    const entry = message && pending.get(message.id);
    if (!entry || typeof message.ok !== 'boolean') return;
    pending.delete(message.id);
    if (message.ok) entry.resolve(message.result);
    else entry.reject(new Error(message.error || '安卓操作没有完成，请重试。'));
  };

  function message(text) {
    let box = document.getElementById('androidStatus');
    if (!box) {
      box = document.createElement('div');
      box.id = 'androidStatus'; box.setAttribute('role', 'status');
      box.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);max-width:90vw;padding:10px 14px;background:#243f4c;color:#fff;border-radius:9px;z-index:99999;font:13px/1.6 system-ui,sans-serif;overflow-wrap:anywhere;pointer-events:none';
      document.body.appendChild(box);
    }
    box.textContent = String(text); box.hidden = false;
    clearTimeout(message.timer);
    message.timer = setTimeout(() => { box.hidden = true; }, 6500);
  }

  function base64(buffer) {
    const bytes = new Uint8Array(buffer);
    let result = '';
    // Bound each apply() call, including on WebViews with a small argument stack.
    for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    return root.btoa(result);
  }

  async function transfer(blob, filename, mode) {
    if (!(blob instanceof Blob)) throw new TypeError('导出内容无效。');
    if (blob.size > (mode === 'print' ? MAX_PRINT_BYTES : MAX_BYTES)) {
      throw new Error(mode === 'print' ? '参考卡过大，请先导出图片后打印。' : '文件超过安卓单次导出上限（512 MiB），请缩小画布或移除过大的参考后重试。');
    }
    // Do not read the Blob before the user has chosen a destination.
    const accepted = await request('begin', {
      filename: String(filename || '轻绘.png'), mime: blob.type || 'application/octet-stream',
      size: blob.size, mode
    });
    if (accepted === false) return false;
    const token = accepted && accepted.token;
    if (typeof token !== 'string' || !token) throw new Error('系统没有建立保存会话。');
    try {
      for (let offset = 0; offset < blob.size; offset += CHUNK_BYTES) {
        const part = blob.slice(offset, Math.min(offset + CHUNK_BYTES, blob.size));
        const data = base64(await part.arrayBuffer());
        const written = await request('chunk', { token, offset, data });
        if (written !== offset + part.size) throw new Error('保存进度不一致，文件没有完整写入。');
      }
      const saved = await request('end', { token });
      if (saved !== true) throw new Error('系统没有确认文件保存成功。');
      return true;
    } catch (error) {
      await request('cancel', { token }).catch(() => {});
      throw error;
    }
  }

  function enqueue(blob, filename, mode) {
    queuedExports++;
    const job = saving.then(() => transfer(blob, filename, mode));
    saving = job.catch(() => {});
    return job.finally(() => { queuedExports--; });
  }

  root.DrawingDesktop = {
    save(blob, filename) { return enqueue(blob, filename, 'save'); },
    print(blob, title) { return enqueue(blob, String(title || '参考卡') + '.png', 'print'); },
    ready() { return request('ready'); }
  };

  root.LightdrawAndroid = {
    async requestClose(nonce) {
      if (closing) return;
      closing = true;
      const oldInert = document.body.inert;
      try {
        const dialog = document.querySelector('dialog[open]');
        if (dialog) {
          const cancelled = new Event('cancel', { cancelable: true });
          if (dialog.dispatchEvent(cancelled)) dialog.close();
          await request('close-result', { nonce, result: 'handled' });
          return;
        }
        if (queuedExports) {
          await request('close-result', { nonce, result: 'busy', message: '正在保存文件，请完成后再退出。' });
          return;
        }
        const app = root.DrawingStudio;
        if (!app || typeof app.prepareToClose !== 'function') {
          await request('close-result', { nonce, result: 'busy', message: '画室正在准备，请稍后再退出。' });
          return;
        }
        document.body.inert = true;
        const saved = await app.prepareToClose();
        await request('close-result', { nonce, result: saved ? 'ready' : 'busy', message: saved ? '' : '请先完成当前操作，再退出画室。' });
      } catch (error) {
        document.body.inert = oldInert;
        await request('close-result', { nonce, result: 'error', message: error.message || String(error) }).catch(() => {});
      } finally {
        document.body.inert = oldInert;
        closing = false;
      }
    },
    background() {
      const app = root.DrawingStudio;
      if (app && typeof app.prepareToClose === 'function' && !closing) {
        app.prepareToClose().catch(error => message(error.message || String(error)));
      }
    }
  };

  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || event.defaultPrevented) return;
    if (link.hasAttribute('data-studio-switch')) {
      event.preventDefault();
      try { root.DrawingBridge.openStudio(link.href); }
      catch (error) { message(error.message || String(error)); }
      return;
    }
    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.origin === location.origin || !['https:', 'http:'].includes(url.protocol)) return;
    event.preventDefault();
    request('external', { url: url.href }).catch(error => message(error.message || String(error)));
  }, true);
})(window);
