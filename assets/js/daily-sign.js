/* Explicit redraws only. The server-rendered daily quote always survives reloads. */
(() => {
  const root = document.querySelector('.rc-daily-sign');
  if (!root) return;
  const button = root.querySelector('[data-sign-draw]');
  const reset = root.querySelector('[data-sign-reset]');
  const status = root.querySelector('[data-sign-status]');
  const text = root.querySelector('blockquote');
  const source = root.querySelector('.rc-sign-source');
  const initialText = text.textContent;
  const initialSource = source.cloneNode(true);
  const records = globalThis.RCSignRecords;
  const aspects = globalThis.RCSignAspects;
  const aspectSlot = root.querySelector('[data-sign-aspect]');
  const showAspect = quote => {
    if (!aspects || !aspectSlot) return;
    aspectSlot.replaceChildren(aspects.badge(quote));
  };
  const recentKey = 'rc-sign-recent-authors-v1';
  const initialQuote = {text:initialText,book:root.dataset.book||'',author:root.dataset.author||'',chapter:root.dataset.chapter||'',readerLink:root.dataset.readerLink||'',aspect:root.dataset.aspect||''};
  showAspect(initialQuote);
  if (records) {
    records.add(initialQuote,'daily',root.dataset.date);
    records.migrate(root.dataset.pool).catch(()=>{});
  }
  const storageKey = 'rc-sign-drawn-v2';
  let seen = new Set();
  let poolPromise;
  let draws = 0;
  let recentAuthors = [];
  try { seen = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch (_) { /* In-memory fallback. */ }
  function uniform() {
    if (globalThis.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      return values[0] / 4294967296;
    }
    return Math.random();
  }
  function load() {
    if (!poolPromise) {
      poolPromise = fetch(root.dataset.pool, {cache:'no-cache'}).then(response => {
        if (!response.ok) throw new Error('pool');
        return response.json();
      }).then(data => {
        if (!Array.isArray(data.quotes) || !data.quotes.length) throw new Error('empty');
        return data.quotes;
      }).catch(error => { poolPromise = null; throw error; });
    }
    return poolPromise;
  }
  function pick(available) {
    const authorKey = quote => records ? records.authorKey(quote) : quote.author;
    try { recentAuthors=JSON.parse(localStorage.getItem(recentKey)||'[]'); } catch (_) {}
    if (!Array.isArray(recentAuthors)) recentAuthors=[];
    const initialAuthor=authorKey(initialQuote);
    const last=recentAuthors.slice(-3);
    let eligible=available.filter(quote=>!last.includes(authorKey(quote)) && authorKey(quote)!==initialAuthor);
    if(!eligible.length) eligible=available.filter(quote=>authorKey(quote)!==last[last.length-1]);
    if(!eligible.length) eligible=available;
    const groups = new Map();
    for (const quote of eligible) {
      if (!groups.has(quote.book)) groups.set(quote.book, {weight:Number(quote.weight)||1, quotes:[]});
      groups.get(quote.book).quotes.push(quote);
    }
    const books = [...groups.values()];
    const quoteWeight = quote => Number(quote.quoteWeight) > 0 ? Number(quote.quoteWeight) : 1;
    for (const book of books) book.weight *= book.quotes.reduce((sum,q)=>sum+quoteWeight(q),0)/book.quotes.length;
    let ticket = uniform() * books.reduce((sum, book) => sum + book.weight, 0);
    let selected = books[books.length - 1];
    for (const book of books) {
      ticket -= book.weight;
      if (ticket < 0) { selected = book; break; }
    }
    let quoteTicket=uniform()*selected.quotes.reduce((sum,q)=>sum+quoteWeight(q),0);
    for (const quote of selected.quotes) { quoteTicket-=quoteWeight(quote); if(quoteTicket<0) return quote; }
    return selected.quotes[selected.quotes.length-1];
  }
  function render(quote) {
    text.textContent = quote.text;
    showAspect(quote);
    source.replaceChildren(document.createTextNode(`—— ${quote.author}《${quote.book}》`));
    if (/^https:\/\/weread\.qq\.com\//.test(quote.readerLink || '')) {
      const link = document.createElement('a');
      link.href = quote.readerLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label','在微信读书中打开本书');
      link.textContent = ' ↗';
      source.append(link);
    }
  }
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = '正在抽签喵…';
    try {
      const pool = await load();
      try {
        for (const id of JSON.parse(localStorage.getItem(storageKey) || '[]')) seen.add(id);
      } catch (_) { /* Keep per-tab records when storage is unavailable. */ }
      const available = pool.filter(q => q.text !== initialText && q.text !== text.textContent && !seen.has(q.id));
      if (!available.length) {
        status.textContent = '这一轮已经抽完啦，清空记录后再抽喵。';
        root.querySelector('[data-sign-clear]').hidden = false;
        return;
      }
      const quote = pick(available);
      render(quote);
      recentAuthors.push(records ? records.authorKey(quote) : quote.author);
      recentAuthors=recentAuthors.slice(-6);
      try { localStorage.setItem(recentKey,JSON.stringify(recentAuthors)); } catch (_) {}
      const persisted=records ? records.add(quote) : true;
      seen.add(quote.id);
      try { localStorage.setItem(storageKey,JSON.stringify([...seen])); } catch (_) { /* Remain usable. */ }
      draws += 1;
      reset.hidden = false;
      status.textContent = `重抽第 ${draws} 次 · ${pool.length} 段候选喵${persisted ? '' : ' · 签册暂存于本页'}`;
    } catch (_) {
      status.textContent = '暂时没有抽到，稍后再试喵。';
    } finally { button.disabled = false; }
  });
  reset.addEventListener('click', () => {
    text.textContent = initialText;
    showAspect(initialQuote);
    source.replaceChildren(...[...initialSource.childNodes].map(node => node.cloneNode(true)));
    reset.hidden = true;
    status.textContent = '已回到今日日签喵。';
  });
  root.querySelector('[data-sign-clear]').addEventListener('click', event => {
    seen.clear();
    try { localStorage.removeItem(storageKey); } catch (_) { /* In-memory fallback. */ }
    event.currentTarget.hidden = true;
    status.textContent = '重抽记录已清空，可以再抽啦。';
  });
  button.hidden = false;
})();