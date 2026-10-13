/* Read-only view of the shared workbook export. No duplicate recommendation data. */
(() => {
  'use strict';
  const root = document.getElementById('workbook-table');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const el = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const safe = url => typeof url === 'string' && (/^https?:\/\//i.test(url) || /^\/(?!\/)/.test(url));
  const link = (text, url) => {
    if (!safe(url)) return null;
    const a = el('a', text); a.href = url;
    if (/^https?:\/\//i.test(url)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  };
  const appendLink = (parent, text, url) => { const a = link(text, url); if (a) parent.append(a); };
  const checked = value => /[☑✅✓✔]|^(?:true|1|是|已略读|已精读|已读)$/i.test(String(value || '').trim());
  let records = [], headers = [], page = 0;
  function fullText(parent, text) {
    // Links remain usable, while all workbook content is inserted as text.
    const pattern = /https?:\/\/[^\s<>\[\]"。；，）]+/g;
    let start = 0;
    for (const match of text.matchAll(pattern)) {
      parent.append(document.createTextNode(text.slice(start, match.index)));
      const url = match[0].replace(/[).,;:`]+$/, '');
      appendLink(parent, url, url);
      parent.append(document.createTextNode(match[0].slice(url.length)));
      start = match.index + match[0].length;
    }
    parent.append(document.createTextNode(text.slice(start)));
  }
  function openRecord(record, field) {
    const dialog = $('wt-detail');
    $('wt-detail-title').textContent = record.title;
    $('wt-detail-meta').textContent = `${record.date} · ${record.sheet} 第 ${record.row} 行`;
    const links = $('wt-detail-links'); links.replaceChildren();
    appendLink(links, '本篇论文与证据', record.paper_url);
    appendLink(links, record.full_translation_label || '本篇全文翻译', record.full_translation_url);
    const dl = $('wt-detail-fields'); dl.replaceChildren();
    for (const header of headers) {
      const dt = el('dt', header); const dd = el('dd');
      fullText(dd, record.fields[header] || '—');
      if (safe(record.hyperlinks[header])) appendLink(dd, '打开单元格链接', record.hyperlinks[header]);
      if (header === field) dt.classList.add('wt-selected-field');
      dl.append(dt, dd);
    }
    dialog.showModal();
  }
  function filtered() {
    const query = $('wt-query').value.trim().toLowerCase();
    const date = $('wt-date').value, reading = $('wt-reading').value;
    return records.filter(r => (!query || r.title.toLowerCase().includes(query)) && (!date || r.date === date) &&
      (!reading || (reading === 'skimmed' ? checked(r.fields['是否略读']) : reading === 'studied' ? checked(r.fields['是否精读']) :
        !checked(r.fields['是否略读']) && !checked(r.fields['是否精读']))));
  }
  function render() {
    const result = filtered(), size = Number($('wt-size').value);
    const pages = Math.max(1, Math.ceil(result.length / size));
    page = Math.max(0, Math.min(page, pages - 1));
    const start = page * size, rows = result.slice(start, start + size);
    const body = $('wt-grid').querySelector('tbody'); body.replaceChildren();
    for (const record of rows) {
      const tr = el('tr'); tr.id = `workbook-row-${record.row}`; tr.dataset.paperId = record.id;
      for (const header of headers) {
        const td = el('td'); const button = el('button', undefined, 'wt-cell'); button.type = 'button';
        button.setAttribute('aria-label', `展开第 ${record.row} 行的${header}`);
        button.append(el('span', record.fields[header] || '—', 'wt-cell-text'));
        button.addEventListener('click', () => openRecord(record, header)); td.append(button); tr.append(td);
      }
      body.append(tr);
    }
    $('wt-count').textContent = `共 ${records.length} 条推荐 · 匹配 ${result.length} 条${result.length ? ` · 当前显示 ${start + 1}–${start + rows.length}` : ''}`;
    $('wt-page').textContent = `第 ${page + 1} / ${pages} 页`;
    $('wt-first').disabled = $('wt-prev').disabled = page === 0;
    $('wt-last').disabled = $('wt-next').disabled = page >= pages - 1 || !result.length;
    $('wt-empty').hidden = result.length > 0;
    $('wt-scroll').hidden = !result.length;
    $('wt-scroll').scrollTop = 0;
    const params = new URLSearchParams();
    if ($('wt-query').value) params.set('q', $('wt-query').value);
    if ($('wt-date').value) params.set('date', $('wt-date').value);
    if ($('wt-reading').value) params.set('reading', $('wt-reading').value);
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : ''));
  }
  fetch(root.dataset.source, {cache: 'no-cache'}).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }).then(data => {
    const sheet = data.sheets[0];
    if (!sheet || !sheet.headers.includes('标题')) throw new Error('主表身份列缺失');
    headers = sheet.headers.filter(Boolean);
    records = data.papers.filter(r => r.sheet === sheet.name).sort((a, b) => a.row - b.row);
    if (records.length !== sheet.count) throw new Error('主表条数不一致');
    const head = el('tr');
    headers.forEach(header => { const th = el('th', header); th.scope = 'col'; head.append(th); });
    $('wt-grid').querySelector('thead').replaceChildren(head);
    $('wt-source').textContent = `${data.source} · ${sheet.name} · ${headers.length} 列 · 最新推荐 ${data.latest_date} · 与工作簿更新同步`;
    [...new Set(records.map(r => r.date))].sort().reverse().forEach(date => {
      const option = el('option', date); option.value = date; $('wt-date').append(option);
    });
    const params = new URLSearchParams(location.search);
    $('wt-query').value = params.get('q') || ''; $('wt-date').value = params.get('date') || '';
    $('wt-reading').value = params.get('reading') || '';
    $('wt-filters').addEventListener('submit', event => event.preventDefault());
    $('wt-filters').addEventListener('input', () => { page = 0; render(); });
    $('wt-filters').addEventListener('reset', () => setTimeout(() => { page = 0; render(); }, 0));
    $('wt-first').addEventListener('click', () => { page = 0; render(); });
    $('wt-prev').addEventListener('click', () => { page--; render(); });
    $('wt-next').addEventListener('click', () => { page++; render(); });
    $('wt-last').addEventListener('click', () => { page = Number.MAX_SAFE_INTEGER; render(); });
    $('wt-close').addEventListener('click', () => $('wt-detail').close());
    $('wt-detail').addEventListener('click', event => { if (event.target === $('wt-detail')) $('wt-detail').close(); });
    render();
  }).catch(error => { $('wt-source').textContent = `推荐表格暂时无法加载：${error.message}`; });
})();
