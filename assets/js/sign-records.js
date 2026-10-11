/* Local personal draws and shared daily signatures remain separate. */
(() => {
  const key = 'rc-sign-archive-v1';
  let memory = [];
  const fields = ['text','book','author','chapter','readerLink','aspect'];
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
  function identity(row) { return [row.date||'',row.kind,row.id||row.text,row.book].join('\u0001'); }
  function add(quote, kind='redraw', date=dateNow(), timestamp=new Date().toISOString()) {
    const row={id:quote.id||quote.text,date,kind,timestamp};
    for(const field of fields) row[field]=String(quote[field]||'');
    if(!row.text||!row.book||kind==='legacy'||!date) return false;
    const rows=read().slice();
    if(!rows.some(item=>identity(item)===identity(row))) rows.push(row);
    return save(rows);
  }
  async function migrate(poolUrl) {
    // Unknown-date legacy signatures were removed at the user's request.
    read();
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