/* Explicit redraws only. The server-rendered daily quote always survives reloads. */
(() => {
  const root = document.querySelector('.rc-daily-sign');
  if (!root) return;
  const button = root.querySelector('[data-sign-draw]');
  const reset = root.querySelector('[data-sign-reset]');
  const status = root.querySelector('[data-sign-status]');
  const text = root.querySelector('blockquote');
  const source = root.querySelector('.rc-sign-source');
  let initialText = text.textContent;
  let initialSource = source.cloneNode(true);
  const records = globalThis.RCSignRecords;
  const calendar = globalThis.RCSignCalendar;
  const votes = globalThis.RCSignVotes;
  const voteStatus = root.querySelector('[data-vote-status]');
  const voteButtons = {
    like:root.querySelector('[data-sign-like]'),
    dislike:root.querySelector('[data-sign-dislike]')
  };
  const aspects = globalThis.RCSignAspects;
  const aspectSlot = root.querySelector('[data-sign-aspect]');
  const showAspect = quote => {
    if (!aspects || !aspectSlot) return;
    aspectSlot.replaceChildren(aspects.badge(quote));
  };
  const recentKey = 'rc-sign-recent-authors-v1';
  let initialQuote = {id:root.dataset.signId||'',text:initialText,book:root.dataset.book||'',author:root.dataset.author||'',chapter:root.dataset.chapter||'',readerLink:root.dataset.readerLink||'',aspect:root.dataset.aspect||''};
  let currentQuote=initialQuote;
  function showVotes(quote) {
    const active=votes?.get(quote);
    for(const [kind,button] of Object.entries(voteButtons)) {
      if(!button) continue;
      button.setAttribute('aria-pressed',String(active===kind));
      button.title=active===kind?'再点一下可撤销':'只在你的浏览器保存';
    }
  }
  for(const [kind,button] of Object.entries(voteButtons)) {
    button?.addEventListener('click',()=>{
      if(!votes) return;
      const result=votes.vote(currentQuote,kind);
      showVotes(currentQuote);
      voteStatus.textContent=!result.ok?'仅在此页面暂存，请检查浏览器存储设置':
        result.vote==='like'?'收到这份喜欢啦 ♡':result.vote==='dislike'?'记下这次不喜欢啦 🐾':'已悄悄撤销评价';
    });
  }
  if(votes) window.addEventListener('storage',event=>{
    if(event.key===votes.storageKey) showVotes(currentQuote);
  });
  showAspect(initialQuote);
  showVotes(initialQuote);
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
    currentQuote=quote;
    text.textContent = quote.text;
    showVotes(quote);
    voteStatus.textContent='';
    showAspect(quote);
    if ((quote.chapter || '').startsWith('演唱：')) {
      source.replaceChildren(document.createTextNode('——《'+quote.book+'》 '));
      const meta=document.createElement('small');
      meta.textContent='｜'+quote.chapter+'｜作词：'+quote.author;
      source.append(meta);
    } else {
      source.replaceChildren(document.createTextNode(`—— ${quote.author}《${quote.book}》`));
    }
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
    currentQuote=initialQuote;
    showVotes(initialQuote);
    voteStatus.textContent='';
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

  // The static HTML is an accessible fallback. The live sign follows Beijing
  // midnight even if GitHub Actions is delayed or the page remains open.
  if (calendar) {
    let refreshing=null;
    let nextTimer=null;
    const clock=root.querySelector('.rc-sign-heading time');
    function refreshDay() {
      const today=calendar.day();
      if(today===root.dataset.date) return Promise.resolve();
      if(refreshing) return refreshing;
      refreshing=load().then(pool=>{
        // In the unlikely event that midnight passes during the fetch, don't
        // install a sign for the wrong day.
        if(calendar.day()!==today) return;
        const chosen=calendar.choose(pool,today);
        root.dataset.date=today;
        root.dataset.signId=chosen.id||'';
        if(clock){clock.dateTime=today;clock.textContent=today.replace(/-/g,'.');}
        initialQuote={...chosen};
        initialText=chosen.text;
        render(chosen);
        initialSource=source.cloneNode(true);
        reset.hidden=true;
        if(records)records.add(chosen,'daily',today);
        status.textContent='';
      }).catch(()=>{
        status.textContent='正在等候今日日签更新，可稍后再试喵。';
      }).finally(()=>{refreshing=null;});
      return refreshing;
    }
    function scheduleNext() {
      if(nextTimer!==null)clearTimeout(nextTimer);
      const waiting=calendar.day()===root.dataset.date;
      nextTimer=setTimeout(()=>{
        refreshDay().finally(scheduleNext);
      },waiting?calendar.nextMidnightDelay():60000);
    }
    refreshDay().finally(scheduleNext);
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden)refreshDay().finally(scheduleNext);
    });
    window.addEventListener('focus',()=>refreshDay().finally(scheduleNext));
  }
})();