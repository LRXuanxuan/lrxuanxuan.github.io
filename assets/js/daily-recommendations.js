/* Personal daily trio. Static curated pool + date-stable choices + browser-local feedback.
   No external services, cookies or tracking. Archives record IDs; keep published IDs immutable. */
(() => {
  'use strict';
  const home = document.querySelector('[data-rc-recommendations]');
  const archive = document.querySelector('[data-rc-rec-archive]');
  if (!home && !archive) return;
  const root = home || archive;
  const poolUrl = root.dataset.pool;
  const storageKey = 'rc-daily-recommendations-v1';
  const kinds = ['song', 'book', 'film'];
  const votes = ['like', 'meh', 'dislike', 'seen'];
  const voteNames = {like: '♡ 喜欢', meh: '～ 一般', dislike: '× 不喜欢', seen: '✓ 接触过'};
  const kindNames = {song: '♪ 今日歌曲', book: '◇ 今日书籍', film: '▣ 今日电影'};
  const seenNames = {song: '✓ 听过', book: '✓ 读过', film: '✓ 看过'};
  let pool, state = {version: 1, days: {}, votes: {}}, storageOK = true, archiveLimit = 14;

  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = String(text);
    return node;
  };
  function localDay() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const field = key => parts.find(part => part.type === key)?.value || '01';
    return field('year') + '-' + field('month') + '-' + field('day');
  }
  function validDate(day) { return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(day + 'T00:00:00Z')); }
  function hash(value) {
    let n = 2166136261;
    for (let i = 0; i < value.length; i++) {
      n ^= value.charCodeAt(i);
      n = Math.imul(n, 16777619);
    }
    return n >>> 0;
  }
  function rng(seed) {
    let value = hash(seed) || 1;
    return () => {
      value += 0x6D2B79F5;
      let n = value;
      n = Math.imul(n ^ (n >>> 15), n | 1);
      n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
      return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
    };
  }
  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (raw && typeof raw === 'object') {
        if (raw.days && typeof raw.days === 'object' && !Array.isArray(raw.days)) state.days = raw.days;
        if (raw.votes && typeof raw.votes === 'object' && !Array.isArray(raw.votes)) state.votes = raw.votes;
      }
    } catch (_) { storageOK = false; }
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); storageOK = true; }
    catch (_) { storageOK = false; }
    return storageOK;
  }
  function allItems() {
    return kinds.flatMap(kind => pool.items[kind] || []);
  }
  function decide(kind, date, used, previous) {
    const all = pool.items[kind];
    if (!Array.isArray(all) || !all.length) return null;
    let choices = all.filter(item => !used.has(item.id));
    if (!choices.length) {
      // A finite curated pool eventually cycles, but not within the last 14 days.
      const recent = new Set(previous.slice(-14));
      choices = all.filter(item => !recent.has(item.id) && state.votes[item.id] !== 'seen');
      if (!choices.length) choices = all.filter(item => !recent.has(item.id));
      if (!choices.length) choices = all;
    }
    const opinions = allItems().filter(item => ['like', 'meh', 'dislike'].includes(state.votes[item.id]));
    const recentItems = previous.slice(-3).map(id => all.find(item => item.id === id)).filter(Boolean);
    const weights = choices.map(item => {
      let score = 0;
      for (const opinion of opinions) {
        const label = state.votes[opinion.id];
        const related = item.tags.filter(tag => opinion.tags.includes(tag)).length;
        const sameCreator = item.creator === opinion.creator ? 1 : 0;
        const effect = label === 'like' ? 0.65 : label === 'dislike' ? -0.85 : -0.08;
        score += effect * (related + 0.45 * sameCreator);
      }
      for (const recentItem of recentItems)
        score -= 0.35 * item.tags.filter(tag => recentItem.tags.includes(tag)).length;
      // Preserve diversity: every candidate keeps a nonzero exploration probability.
      return 0.45 + Math.exp(Math.max(-2.2, Math.min(2.0, score)));
    });
    const random = rng('rc-trio-v1|' + date + '|' + kind)();
    let needle = random * weights.reduce((sum, weight) => sum + weight, 0);
    for (let i = 0; i < choices.length; i++) {
      needle -= weights[i];
      if (needle < 0) return choices[i];
    }
    return choices[choices.length - 1];
  }
  function ensureDays() {
    const start = pool.starts || '2026-10-11';
    const today = localDay();
    const existing = {
      song: new Set(), book: new Set(), film: new Set()
    };
    const previous = {song: [], book: [], film: []};
    const ordered = Object.keys(state.days).filter(validDate).sort();
    for (const date of ordered) for (const kind of kinds) {
      const id = state.days[date]?.[kind];
      if (typeof id === 'string') existing[kind].add(id);
      if (typeof id === 'string' && date < today) previous[kind].push(id);
    }
    let cursor = Date.parse(start + 'T00:00:00Z');
    const end = Date.parse(today + 'T00:00:00Z');
    let dirty = false;
    // A deliberately bounded backfill; normally only a few missing dates.
    for (let count = 0; cursor <= end && count < 7305; cursor += 86400000, count++) {
      const date = new Date(cursor).toISOString().slice(0, 10);
      if (!state.days[date] || typeof state.days[date] !== 'object') { state.days[date] = {}; dirty = true; }
      for (const kind of kinds) {
        const id = state.days[date][kind];
        if (typeof id !== 'string' || !pool.items[kind].some(item => item.id === id)) {
          const item = decide(kind, date, existing[kind], previous[kind]);
          if (item) {state.days[date][kind] = item.id; existing[kind].add(item.id); dirty = true;}
        }
        if (!previous[kind].includes(state.days[date][kind])) previous[kind].push(state.days[date][kind]);
      }
    }
    if (dirty) save();
  }
  function byId(kind, id) {
    return pool.items[kind].find(item => item.id === id);
  }
  function vote(id, choice) {
    state.votes[id] = state.votes[id] === choice ? '' : choice;
    if (!state.votes[id]) delete state.votes[id];
    const ok = save();
    if (home) renderHome();
    if (archive) renderArchive();
    const message = ok ? '已记下偏好，之后的推荐会参考它喵。' : '评价暂存在当前页面；浏览器未允许保存。';
    for (const area of [home, archive]) {
      const status = area?.querySelector('[data-rec-status]');
      if (status) status.textContent = message;
    }
  }
  function makeEntry(kind, item) {
    const entry = make('article', 'rc-rec-entry');
    entry.append(make('p', 'rc-rec-kind', kindNames[kind]));
    entry.append(make('div', 'rc-rec-title', item.title));
    entry.append(make('div', 'rc-rec-creator', item.creator));
    const tags = make('div', 'rc-rec-tags');
    for (const tag of item.tags.slice(0, 3)) tags.append(make('span', 'rc-rec-tag', tag));
    entry.append(tags);
    entry.append(make('p', 'rc-rec-note', item.note));
    const actions = make('div', 'rc-rec-actions');
    actions.setAttribute('role', 'group');
    actions.setAttribute('aria-label', item.title + '的私人评价');
    for (const choice of votes) {
      const button = make('button', '', choice === 'seen' ? seenNames[kind] : voteNames[choice]);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(state.votes[item.id] === choice));
      button.title = '只保存在当前浏览器，再点一次撤销';
      button.addEventListener('click', () => vote(item.id, choice));
      actions.append(button);
    }
    entry.append(actions);
    return entry;
  }
  function renderHome() {
    if (!home) return;
    const today = localDay();
    const time = home.querySelector('[data-rec-date]') || home.closest('.fm-daily-picks')?.querySelector('[data-rec-date]');
    if (time) { time.textContent = today.replaceAll('-', '.'); time.dateTime = today; }
    const list = home.querySelector('[data-rec-list]');
    if (!list) return;
    list.replaceChildren();
    const day = state.days[today] || {};
    for (const kind of kinds) {
      const item = byId(kind, day[kind]);
      if (item) list.append(makeEntry(kind, item));
    }
  }
  function renderArchive() {
    if (!archive) return;
    const list = archive.querySelector('[data-rec-archive-list]');
    const more = archive.querySelector('[data-rec-more]');
    if (!list) return;
    // History is collapsed by default. Do not build hundreds of cards while closed.
    const fold = archive.closest('details.rc-rec-history');
    if (fold && !fold.open) return;
    const dates = Object.keys(state.days).filter(date => validDate(date) && date < localDay()).sort().reverse();
    list.replaceChildren();
    if (!dates.length) list.append(make('p', 'rc-rec-empty', '往日推荐会从明天开始积累喵。'));
    for (const date of dates.slice(0, archiveLimit)) {
      const day = make('section', 'rc-rec-day');
      day.append(make('h3', '', date.replaceAll('-', '.')));
      const entries = make('div', 'rc-rec-items');
      for (const kind of kinds) {
        const item = byId(kind, state.days[date]?.[kind]);
        if (item) entries.append(makeEntry(kind, item));
      }
      day.append(entries);
      list.append(day);
    }
    if (more) more.hidden = archiveLimit >= dates.length;
    const count = archive.querySelector('[data-rec-count]');
    if (count) count.textContent = '已归档 ' + dates.length + ' 天的推荐；喜好只保存在本浏览器。';
  }
  function setStatus(message) {
    const status = archive?.querySelector('[data-rec-status]');
    if (status) status.textContent = message;
  }
  function setupArchive() {
    if (!archive) return;
    const fold = archive.closest('details.rc-rec-history');
    fold?.addEventListener('toggle', () => {
      if (fold.open) renderArchive();
    });
    archive.querySelector('[data-rec-more]')?.addEventListener('click', () => {
      archiveLimit += 14; renderArchive();
    });
    archive.querySelector('[data-rec-export]')?.addEventListener('click', () => {
      const payload = {version: 1, exportedAt: new Date().toISOString(), days: state.days, votes: state.votes};
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const link = make('a');
      link.href = url;
      link.download = 'ruixuan-daily-recommendations-' + localDay() + '.json';
      document.body.append(link);
      link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('已生成推荐档案备份。');
    });
    const input = archive.querySelector('[data-rec-import-input]');
    archive.querySelector('[data-rec-import]')?.addEventListener('click', () => input?.click());
    input?.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        if (file.size > 4 * 1024 * 1024) throw Error('large');
        const imported = JSON.parse(await file.text());
        if (!imported || imported.version !== 1 ||
          !imported.days || typeof imported.days !== 'object' || Array.isArray(imported.days) ||
          !imported.votes || typeof imported.votes !== 'object' || Array.isArray(imported.votes)) throw Error('format');
        const validIds = new Set(allItems().map(item => item.id));
        const incomingDays = Object.entries(imported.days).slice(0, 12000);
        for (const [date, picks] of incomingDays) {
          if (!validDate(date) || date < pool.starts || date > localDay() ||
              !picks || typeof picks !== 'object') continue;
          const accepted = {};
          for (const kind of kinds) if (typeof picks[kind] === 'string' &&
            pool.items[kind].some(item => item.id === picks[kind])) accepted[kind] = picks[kind];
          if (Object.keys(accepted).length) state.days[date] = {...state.days[date], ...accepted};
        }
        for (const [id, label] of Object.entries(imported.votes).slice(0, 50000)) {
          if (validIds.has(id) && votes.includes(label)) state.votes[id] = label;
        }
        const ok = save();
        ensureDays();
        renderArchive();
        setStatus(ok ? '已合并导入的推荐与评价记录。' : '已导入到当前页面，但浏览器无法持久保存。');
      } catch (_) {setStatus('导入失败：请使用本页面导出的 JSON 文件。');}
      finally {input.value = '';}
    });
  }
  read();
  fetch(poolUrl, {cache: 'no-cache'}).then(response => {
    if (!response.ok) throw Error('pool');
    return response.json();
  }).then(data => {
    if (!data.items || !kinds.every(kind => Array.isArray(data.items[kind]))) throw Error('pool');
    pool = data;
    ensureDays();
    setupArchive();
    renderHome();
    renderArchive();
    window.addEventListener('storage', event => {
      if (event.key === storageKey) {read(); ensureDays(); renderHome(); renderArchive();}
    });
    if (home) window.setInterval(() => {ensureDays(); renderHome();}, 60000);
  }).catch(() => {
    const host = home?.querySelector('[data-rec-list]') || archive?.querySelector('[data-rec-archive-list]');
    if (host) host.textContent = '推荐库暂时没有加载成功，刷新页面可以重试喵。';
  });
})();
