/* Personal paper reading markers. No accounts, tracking, or remote writes. */
(() => {
  'use strict';
  const STORE = 'rc-paper-marks-v1';
  const FLAGS = [
    { bit: 1, name: '已略读' },
    { bit: 2, name: '已精读' },
    { bit: 4, name: '已参考' },
    { bit: 8, name: '收藏' }
  ];
  const validId = id => typeof id === 'string' && /^[a-f0-9]{16}$/i.test(id);
  let state = read();

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(STORE) || '{}');
      if (!value || Array.isArray(value) || typeof value !== 'object') return {};
      return value;
    } catch (_) { return {}; }
  }

  function bits(id) {
    const n = state[id];
    return Number.isInteger(n) && n >= 0 && n <= 15 ? n : 0;
  }

  function refresh() {
    document.querySelectorAll('.pm-marks[data-paper-id]').forEach(toolbar => {
      const current = bits(toolbar.dataset.paperId);
      toolbar.querySelectorAll('button[data-pm-bit]').forEach(button => {
        const active = Boolean(current & Number(button.dataset.pmBit));
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('is-set', active);
        if (button.dataset.pmBit === '8') {
          button.querySelector('.pm-star').textContent = active ? '★' : '☆';
        }
      });
    });
  }

  function toggle(id, bit, toolbar) {
    const previous = bits(id);
    const next = previous ^ bit;
    if (next) state[id] = next;
    else delete state[id];
    let saved = false;
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      saved = true;
    } catch (_) { /* Private mode or storage quota. */ }
    refresh();
    window.dispatchEvent(new Event('paper-marks-changed'));
    if (!saved) {
      const note = toolbar.querySelector('.pm-note');
      note.textContent = '本地存储不可用，刷新后标记可能丢失';
    }
  }

  function createToolbar(id) {
    if (!validId(id)) return null;
    const toolbar = document.createElement('div');
    toolbar.className = 'pm-marks';
    toolbar.dataset.paperId = id;
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', '论文阅读与收藏标记');
    FLAGS.forEach(flag => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.pmBit = String(flag.bit);
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('title', '点击切换：' + flag.name + '（保存在此浏览器）');
      if (flag.bit === 8) {
        const star = document.createElement('span');
        star.className = 'pm-star';
        star.setAttribute('aria-hidden', 'true');
        star.textContent = '☆';
        button.append(star, document.createTextNode(' ' + flag.name));
      } else button.textContent = flag.name;
      button.addEventListener('click', () => toggle(id, flag.bit, toolbar));
      toolbar.append(button);
    });
    const note = document.createElement('span');
    note.className = 'pm-note';
    note.setAttribute('role', 'status');
    note.setAttribute('aria-live', 'polite');
    toolbar.append(note);
    refresh();
    // If constructed before insertion (for example, a freshly rendered card),
    // apply current flags explicitly. refresh() only visits attached nodes.
    const selected = bits(id);
    toolbar.querySelectorAll('button[data-pm-bit]').forEach(button => {
      const active = Boolean(selected & Number(button.dataset.pmBit));
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-set', active);
      if (button.dataset.pmBit === '8') button.querySelector('.pm-star').textContent = active ? '★' : '☆';
    });
    return toolbar;
  }

  function mountDetail() {
    const match = location.pathname.match(/^\/papers\/items\/([a-f0-9]{16})\/?(?:index\.html)?$/i);
    if (!match) return;
    const body = document.querySelector('main article .content') ||
      document.querySelector('#main-wrapper .content') ||
      document.querySelector('article .content');
    if (!body || body.querySelector('.pm-detail')) return;
    const row = document.createElement('div');
    row.className = 'pm-detail';
    const toolbar = createToolbar(match[1]);
    if (!toolbar) return;
    row.append(toolbar);
    body.prepend(row);
  }

  window.PaperMarks = Object.freeze({ createToolbar, getMask: bits });
  window.addEventListener('storage', event => {
    if (event.key !== STORE && event.key !== null) return;
    state = read();
    refresh();
    window.dispatchEvent(new Event('paper-marks-changed'));
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountDetail, { once: true });
  } else mountDetail();
})();
