/* Local personal draws and shared daily signatures remain separate. */
(() => {
  // v2 starts a clean redraw archive after the 2026-10 semantic retagging.
  const key = 'rc-sign-archive-v2';
  const legacyKey = 'rc-sign-archive-v1';
  const resetMarker = 'rc-sign-aspects-reviewed-v1';
  // Bumping this marker re-runs the one-time refresh of stored snapshots from the pool.
  // v2 (2026-10-31): finish the lyric/film sign text revisions and sync archived rows by id.
  const bibliographyMarker = 'rc-sign-typography-clean-v2';
  let memory = [];
  const fields = ['text','book','author','chapter','readerLink','aspect'];
  // This executes in either home or archive, on the first visit after deployment.
  // Keep historical daily entries, discard old personal redraws and old draw-order state.
  function retireOldDraws() {
    try {
      if (localStorage.getItem(resetMarker) === 'done') return;
      let legacy = [];
      try { legacy = JSON.parse(localStorage.getItem(legacyKey) || '[]'); } catch (_) {}
      let preserved = [];
      if (Array.isArray(legacy)) preserved = legacy.filter(row => row && row.kind === 'daily' && typeof row.text === 'string' && typeof row.book === 'string' && row.date).map(row => ({...row,aspect:''}));
      let current = [];
      try { current = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
      if (!Array.isArray(current)) current = [];
      const ids = new Set(current.map(row => [row.date,row.kind,row.id || row.text,row.book].join('\\u0001')));
      for (const row of preserved) {
        const id = [row.date,row.kind,row.id || row.text,row.book].join('\\u0001');
        if (!ids.has(id)) { current.push(row); ids.add(id); }
      }
      localStorage.setItem(key,JSON.stringify(current));
      localStorage.removeItem(legacyKey);
      localStorage.removeItem('rc-sign-drawn-v1');
      localStorage.removeItem('rc-sign-drawn-v2');
      localStorage.removeItem('rc-sign-recent-authors-v1');
      localStorage.setItem(resetMarker,'done');
    } catch (_) { /* Browsers with disabled storage still function in memory. */ }
  }
  retireOldDraws();
  function dateNow() {
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get = name => parts.find(part=>part.type===name).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function read() {
    try {
      const data=JSON.parse(localStorage.getItem(key)||'[]');
      if(Array.isArray(data)) {
        memory=data.filter(row=>row&&typeof row.text==='string'&&typeof row.book==='string'&&row.kind!=='legacy'&&row.date);
        if(memory.length!==data.length)save(memory);
      }
    } catch (_) {}
    return memory;
  }
  function save(rows) {
    memory=rows;
    try { localStorage.setItem(key,JSON.stringify(rows)); return true; } catch (_) { return false; }
  }
  function identity(row) { return [row.date||'',row.kind,row.id||row.text].join('\u0001'); }
  function add(quote, kind='redraw', date=dateNow(), timestamp=new Date().toISOString()) {
    const row={id:quote.id||quote.text,date,kind,timestamp};
    for(const field of fields) row[field]=String(quote[field]||'');
    if(!row.text||!row.book||kind==='legacy'||!date) return false;
    const rows=read().slice();
    const existing=rows.findIndex(item=>identity(item)===identity(row));
    if(existing<0) rows.push(row);
    else rows[existing]={...rows[existing],...row,timestamp:rows[existing].timestamp||row.timestamp};
    return save(rows);
  }
  async function migrate(poolUrl) {
    // Upgrade previously saved local signatures to the cleaned bibliography once.
    // Keep the original draw dates, kind, timestamps and storage identifiers.
    if (!poolUrl) return;
    const existing=read();
    let alreadyClean=false;
    try { alreadyClean=localStorage.getItem(bibliographyMarker)==='done'; } catch (_) {}
    const missingAspect=existing.some(row=>row.kind==='daily'&&!row.aspect);
    if(alreadyClean&&!missingAspect) return;
    if(!existing.length||(existing.length===1&&existing[0].kind==='daily'&&
       existing[0].date===dateNow()&&!missingAspect)) {
      try { localStorage.setItem(bibliographyMarker,'done'); } catch (_) {}
      return;
    }
    const response=await fetch(poolUrl,{cache:'no-cache'});
    if(!response.ok) throw new Error('bibliography-pool');
    const payload=await response.json();
    if(!Array.isArray(payload.quotes)) throw new Error('bibliography-format');
    const byId=new Map(),byExact=new Map(),byText=new Map();
    for(const quote of payload.quotes) {
      if(quote.id) byId.set(quote.id,quote);
      byExact.set(quote.book+'\u0001'+quote.text,quote);
      const same=byText.get(quote.text)||[];
      same.push(quote);byText.set(quote.text,same);
    }
    let dirty=false;
    const revised=read().map(row=>{
      const candidates=byText.get(row.text)||[];
      const source=byId.get(row.id)||byExact.get(row.book+'\u0001'+row.text)||
        (candidates.length===1?candidates[0]:null);
      if(!source) return row;
      const updated={...row};
      for(const field of ['text','book','author','chapter','aspect']) {
        if(typeof source[field]==='string'&&updated[field]!==source[field]){
          updated[field]=source[field];dirty=true;
        }
      }
      return updated;
    });
    if(dirty) {
      const unique=new Map();
      for(const row of revised) unique.set([row.date,row.kind,row.text].join('\u0001'),row);
      save([...unique.values()]);
    }
    try { localStorage.setItem(bibliographyMarker,'done'); } catch (_) {}
  }
  function authorKey(quote) {
    const value=`${quote.author||''} ${quote.book||''}`.replace(/\[[^\]]*\]|【[^】]*】|（[^）]*）|\([^)]*\)/g,'').trim();
    const aliases=[['斯特普尔顿',/斯[特塔]普尔顿|Stapledon|造星主|Star.?Maker/i],['阿瑟·克拉克',/阿瑟.*克拉克|亚瑟.*克拉克|Arthur.*Clarke|Clarke.*Arthur/i],['雨果',/维克多.*雨果|Victor.*Hugo|^雨果\s/i],['罗曼·罗兰',/罗曼.*罗兰|Romain.*Rolland/i],['列宁',/^列宁\s|列宁(?:选集|全集|文集|著作)/],['毛泽东',/^毛泽东\s|毛泽东(?:选集|全集|文集|著作)/]];
    const alias=aliases.find(([,pattern])=>pattern.test(value));
    if(alias) return alias[0];
    return String(quote.author||quote.book).replace(/\[[^\]]*\]|【[^】]*】|（[^）]*）|\([^)]*\)|[\s·•"“”]/g,'').toLowerCase();
  }
  globalThis.RCSignRecords={key,dateNow,read,save,add,migrate,authorKey,identity};
})();