/* Native-only adapter. The website never loads this file. */
(function (root) {
  'use strict';
  const native = root.__TAURI__;
  if (!native || !native.core || !native.event) return;
  const invoke = native.core.invoke;
  const downloads = new Map();
  let closing = false, closeDialog = null;

  function message(text) {
    let box = document.getElementById('desktopStatus');
    if (!box) {
      box = document.createElement('div');
      box.id = 'desktopStatus';
      box.setAttribute('role', 'status');
      box.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);max-width:min(650px,90vw);padding:10px 16px;background:#243f4c;color:#fff;border-radius:10px;box-shadow:0 3px 18px #0003;z-index:99999;font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere;pointer-events:none';
      document.body.appendChild(box);
    }
    box.hidden = false;
    box.textContent = text;
    clearTimeout(message.timer);
    message.timer = setTimeout(() => { box.hidden = true; }, 7000);
  }

  const listening = Promise.all([
    native.event.listen('lightdraw-download-started', event => {
      const entry = downloads.get(event.payload && event.payload.url);
      if (!entry) return;
      entry.started = true;
      clearTimeout(entry.timer);
    }),
    native.event.listen('lightdraw-download-finished', event => {
      const result = event.payload || {}, entry = downloads.get(result.url);
      if (!entry) return;
      clearTimeout(entry.timer);
      downloads.delete(result.url);
      URL.revokeObjectURL(result.url);
      if (result.success) {
        message('已保存' + (result.path ? '：' + result.path : ''));
        entry.resolve(true);
      } else entry.reject(new Error('文件没有保存成功，请重新导出并选择可写入的位置。'));
    })
  ]);
  // Prevent an early native event subscription error from becoming unhandled.
  listening.catch(() => {});

  async function save(blob, suggestedName) {
    if (!(blob instanceof Blob)) throw new TypeError('导出内容无效。');
    await listening;
    const url = URL.createObjectURL(blob);
    let entry;
    const finished = new Promise((resolve, reject) => {
      entry = { resolve, reject, started: false, timer: null };
      downloads.set(url, entry);
    });
    finished.catch(() => {});
    try {
      const accepted = await invoke('prepare_download', { url, suggestedName: String(suggestedName || '轻绘.png') });
      if (!accepted) {
        downloads.delete(url);
        URL.revokeObjectURL(url);
        return false;
      }
      // Register before clicking: a very small download may finish immediately.
      entry.timer = setTimeout(() => {
        if (entry.started || !downloads.has(url)) return;
        downloads.delete(url);
        URL.revokeObjectURL(url);
        invoke('cancel_download', { url }).catch(() => {});
        entry.reject(new Error('系统没有开始保存文件，请重新导出。'));
      }, 10000);
      const link = document.createElement('a');
      link.href = url;
      link.download = String(suggestedName || '轻绘.png');
      document.body.appendChild(link);
      link.click();
      link.remove();
      return await finished;
    } catch (error) {
      clearTimeout(entry.timer);
      downloads.delete(url);
      URL.revokeObjectURL(url);
      await invoke('cancel_download', { url }).catch(() => {});
      throw error;
    }
  }

  function failedClose(error) {
    if (closeDialog) { closeDialog.focus(); return; }
    const dialog = document.createElement('dialog');
    closeDialog = dialog;
    dialog.style.cssText = 'max-width:420px;padding:24px;border:1px solid #becbd1;border-radius:14px;font:15px/1.65 system-ui,sans-serif';
    const title = document.createElement('h2'); title.textContent = '还没有保存成功';
    const text = document.createElement('p');
    text.textContent = (error && error.message ? error.message : String(error)) + '。可以继续绘画，先用“存工程”备份到电脑。';
    const stay = document.createElement('button'); stay.textContent = '继续绘画';
    const leave = document.createElement('button'); leave.textContent = '放弃本次未保存内容并退出';
    stay.style.cssText = leave.style.cssText = 'padding:8px 12px;margin:5px;border:1px solid #aebfc8;border-radius:7px;background:transparent;color:inherit;font:inherit';
    function dismiss() { dialog.close(); dialog.remove(); closeDialog = null; }
    stay.addEventListener('click', dismiss);
    leave.addEventListener('click', async () => {
      dismiss();
      try { await invoke('finish_close'); }
      catch (failure) { message(String(failure)); }
    });
    dialog.addEventListener('cancel', () => { dialog.remove(); closeDialog = null; });
    dialog.append(title, text, stay, leave);
    document.body.appendChild(dialog); dialog.showModal(); stay.focus();
  }

  const closingListener = native.event.listen('lightdraw-close-requested', async () => {
    if (closeDialog) { closeDialog.focus(); return; }
    if (closing) return;
    closing = true;
    const wasInert = document.body.inert;
    document.body.inert = true;
    let exiting = false;
    try {
      let saved;
      try {
        const app = root.DrawingStudio;
        if (!app || typeof app.prepareToClose !== 'function') {
          message('画室正在准备，请稍后再关闭。'); return;
        }
        saved = await app.prepareToClose();
      } catch (error) { document.body.inert = wasInert; failedClose(error); return; }
      if (!saved) { message('请先完成当前操作，再关闭画室。'); return; }
      try { await invoke('finish_close'); exiting = true; }
      catch (error) { message(String(error)); }
    } finally {
      if (!exiting) document.body.inert = wasInert;
      closing = false;
    }
  });
  closingListener.catch(() => {});

  root.DrawingDesktop = {
    save,
    async ready() {
      await Promise.all([listening, closingListener]);
      await invoke('desktop_ready');
    }
  };

  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || event.defaultPrevented) return;
    if (link.hasAttribute('data-studio-switch')) {
      // Desktop has one main drawing window. Modified clicks must keep the pair too.
      event.preventDefault();
      try { root.DrawingBridge.openStudio(link.href); }
      catch (error) { message(error.message || String(error)); }
      return;
    }
    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.origin === location.origin) return;
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
    event.preventDefault();
    invoke('open_external', { url: url.href }).catch(error => message(String(error)));
  }, true);
  document.addEventListener('auxclick', event => {
    const link = event.target.closest && event.target.closest('a[data-studio-switch]');
    if (!link || event.button !== 1) return;
    event.preventDefault();
    try { root.DrawingBridge.openStudio(link.href); }
    catch (error) { message(error.message || String(error)); }
  }, true);
  document.addEventListener('contextmenu', event => {
    if (event.target.closest && event.target.closest('a[data-studio-switch]')) event.preventDefault();
  }, true);
})(window);
