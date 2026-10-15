/* Lightweight per-flag GitHub sharing; local marks remain the primary interactive store. */
(() => {
  'use strict';
  if (!window.PaperMarks) return;
  const STORE = 'rc-paper-marks-v1';
  const META = 'rc-paper-marks-sync-v1';
  const BITS = [1, 2, 4, 8];
  const REMOTE_URL = 'https://api.github.com/repos/LRXuanxuan/lrxuanxuan.github.io/contents/assets/data/paper-marks-shared.json';
  const isId = id => /^[a-f0-9]{16}$/i.test(id);
  const validTime = n => Number.isSafeInteger(n) && n >= 0 && n <= 4102444800000;
  const empty = () => Object.create(null);
  const cleanMask = n => Number.isInteger(n) && n >= 0 && n <= 15 ? n : 0;

  function readMasks() {
    const out = empty();
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || '{}');
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        for (const [id, mask] of Object.entries(raw)) {
          if (isId(id) && cleanMask(mask) !== 0) out[id.toLowerCase()] = mask;
        }
      }
    } catch (_) {}
    return out;
  }

  function normalize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('标记记录格式不正确');
    if (Object.keys(input).length > 30000) throw Error('标记数量超出上限');
    const out = empty();
    for (const [id, value] of Object.entries(input)) {
      if (!isId(id) || !value || typeof value !== 'object' || Array.isArray(value)) continue;
      const mask = cleanMask(value.mask);
      if (!Array.isArray(value.times) || value.times.length !== 4 || !value.times.every(validTime)) continue;
      out[id.toLowerCase()] = { mask, times: value.times.slice() };
    }
    return out;
  }

  let meta;
  try {
    meta = normalize(JSON.parse(localStorage.getItem(META) || '{}'));
  } catch (_) {
    meta = empty();
  }

  // Capture legacy local-only marks without discarding any existing selections.
  function captureLocalChanges() {
    const current = readMasks();
    let changed = false;
    const now = Date.now();
    for (const id of new Set([...Object.keys(meta), ...Object.keys(current)])) {
      const next = current[id] || 0;
      const previous = meta[id] || { mask: 0, times: [0, 0, 0, 0] };
      const times = previous.times.slice();
      BITS.forEach((bit, i) => {
        if ((previous.mask & bit) !== (next & bit)) times[i] = Math.max(now, times[i] + 1);
      });
      if (!meta[id] && !next) continue;
      if (!meta[id] || previous.mask !== next) {
        meta[id] = { mask: next, times };
        changed = true;
      }
    }
    if (changed) {
      try { localStorage.setItem(META, JSON.stringify(meta)); }
      catch (_) { /* Export/sync will surface storage failures. */ }
    }
  }

  captureLocalChanges();
  window.addEventListener('paper-marks-changed', captureLocalChanges);
  window.addEventListener('storage', event => {
    if (event.key !== STORE && event.key !== META && event.key !== null) return;
    try { meta = normalize(JSON.parse(localStorage.getItem(META) || '{}')); }
    catch (_) { meta = empty(); }
    captureLocalChanges();
  });

  function snapshot() {
    captureLocalChanges();
    return { version: 1, updatedAt: new Date().toISOString(), marks: meta };
  }

  function merge(remote) {
    if (!remote || remote.version !== 1) throw Error('云端标记版本不兼容');
    const incoming = normalize(remote.marks);
    captureLocalChanges();
    const current = readMasks();
    const next = empty();
    const merged = empty();
    let differing = 0;
    for (const id of new Set([...Object.keys(meta), ...Object.keys(incoming)])) {
      const a = meta[id] || { mask: 0, times: [0, 0, 0, 0] };
      const b = incoming[id] || { mask: 0, times: [0, 0, 0, 0] };
      const times = [];
      let mask = 0;
      BITS.forEach((bit, i) => {
        const aa = Boolean(a.mask & bit), bb = Boolean(b.mask & bit);
        if (b.times[i] > a.times[i] ? bb : a.times[i] > b.times[i] ? aa : (aa || bb)) mask |= bit;
        times.push(Math.max(a.times[i], b.times[i]));
      });
      merged[id] = { mask, times };
      if (mask) next[id] = mask;
      if ((current[id] || 0) !== mask) differing += 1;
    }
    // Keep the historic browser-local format so cards, filters and detail pages agree.
    localStorage.setItem(META, JSON.stringify(merged));
    localStorage.setItem(STORE, JSON.stringify(next));
    meta = merged;
    window.PaperMarks.reload();
    return differing;
  }

  window.PaperMarksSync = Object.freeze({ snapshot, merge });

  const panel = document.getElementById('pm-sync-panel');
  if (!panel) return;
  const status = document.getElementById('pm-sync-status');
  const tokenField = document.getElementById('pm-sync-token');
  const pullButton = document.getElementById('pm-sync-pull');
  const pushButton = document.getElementById('pm-sync-push');
  const say = message => { status.textContent = message; };
  const busy = value => { pullButton.disabled = value; pushButton.disabled = value; };

  async function fetchRemote(token = '') {
    const headers = { Accept: 'application/vnd.github+json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const response = await fetch(REMOTE_URL + '?ref=main', { headers, cache: 'no-store' });
    if (!response.ok) throw Error('GitHub 读取失败（HTTP ' + response.status + '）');
    const item = await response.json();
    if (!item.sha || item.encoding !== 'base64' || typeof item.content !== 'string') throw Error('共享文件格式不正确');
    const decoded = atob(item.content.replace(/\s/g, ''));
    const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
    return { sha: item.sha, data: JSON.parse(new TextDecoder().decode(bytes)) };
  }

  async function pull() {
    busy(true);
    say('正在读取公开标记…');
    try {
      const remote = await fetchRemote();
      const count = merge(remote.data);
      say('读取完成：更新本机 ' + count + ' 篇论文的标记。现有本机数据已按每项标记的修改时间合并。');
    } catch (error) { say('读取失败：' + error.message); }
    finally { busy(false); }
  }

  async function push() {
    const token = tokenField.value.trim();
    if (!token) {
      say('请先填写仅授权本博客仓库 Contents 读写的 GitHub fine-grained token。令牌不会被保存。');
      return;
    }
    busy(true);
    say('正在合并本机与 GitHub 记录…');
    try {
      const remote = await fetchRemote(token);
      merge(remote.data);
      const doc = JSON.stringify(snapshot(), null, 2) + '\n';
      if (doc.length > 1024 * 1024) throw Error('共享标记过大，请先整理');
      const bytes = new TextEncoder().encode(doc);
      let encoded = '';
      for (const byte of bytes) encoded += String.fromCharCode(byte);
      const response = await fetch(REMOTE_URL, {
        method: 'PUT',
        headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'chore(papers): sync public reading flags',
          content: btoa(encoded),
          sha: remote.sha,
          branch: 'main'
        })
      });
      if (!response.ok) {
        if (response.status === 409 || response.status === 422) throw Error('远端刚好有其他更新，请重新点击同步（HTTP ' + response.status + '）');
        throw Error('GitHub 写入失败（HTTP ' + response.status + '），检查令牌仓库与 Contents 写入权限');
      }
      say('共享成功！GitHub 中的 paper-marks-shared.json 已更新；我之后可以直接读取。');
    } catch (error) { say('共享未完成：' + error.message); }
    finally { tokenField.value = ''; busy(false); }
  }

  pullButton.addEventListener('click', pull);
  pushButton.addEventListener('click', push);
})();
