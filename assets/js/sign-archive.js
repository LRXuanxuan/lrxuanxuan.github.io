(() => {
  const root=document.querySelector('.rc-sign-archive');
  const records=globalThis.RCSignRecords;
  const aspects=globalThis.RCSignAspects;
  if(!root||!records) return;
  const list=root.querySelector('[data-archive-local]');
  const staticDaily=root.querySelector('[data-archive-daily]');
  const status=root.querySelector('[data-archive-status]');
  const filter=root.querySelector('[data-archive-filter]');
  let daily=[];
  try { daily=JSON.parse(document.getElementById('rc-daily-archive-data').textContent||'[]'); } catch (_) {}
  if(!Array.isArray(daily)) daily=[];
  const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'');
  function all() {
    const combined=[...daily.map(q=>({...q,kind:'daily'})),...records.read()];
    const seen=new Set();
    return combined.filter(row=>{
      if(!row||!row.text||!row.book||!['daily','redraw'].includes(row.kind)||!validDate(row.date)) return false;
      const identity=[row.date,row.kind,row.text].join('\u0001');
      if(seen.has(identity)) return false;
      seen.add(identity);return true;
    });
  }
  function render() {
    const mode=filter.value;
    const rows=all().filter(row=>mode==='all'||(mode==='redraw'?row.kind!=='daily':row.kind==='daily'));
    rows.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.timestamp||'').localeCompare(String(b.timestamp||'')));
    list.replaceChildren();
    staticDaily.hidden=true;
    const groups=new Map();
    for(const row of rows) {const date=row.date||'旧签（日期未记录）';if(!groups.has(date))groups.set(date,[]);groups.get(date).push(row);}
    for(const [date,quotes] of groups) {
      const section=document.createElement('section');section.className='rc-archive-day';
      const heading=document.createElement('h3');heading.textContent=date;
      const count=document.createElement('span');count.textContent=`${quotes.length} 段`;heading.append(count);section.append(heading);
      for(const quote of quotes) {
        const article=document.createElement('article');article.className='rc-archive-quote';
        const kind=document.createElement('span');kind.className='rc-archive-kind';kind.textContent=quote.kind==='daily'?'默认日签':quote.kind==='legacy'?'旧版重抽签':'重抽签';
        const text=document.createElement('blockquote');text.textContent=quote.text;
        const source=document.createElement('p');source.textContent=`—— ${quote.author||''}《${quote.book}》`;
        if(/^https:\/\/weread\.qq\.com\//.test(quote.readerLink||'')) {const a=document.createElement('a');a.href=quote.readerLink;a.target='_blank';a.rel='noopener noreferrer';a.textContent=' ↗';a.setAttribute('aria-label','在微信读书中打开本书');source.append(a);}
        if (aspects) {
          const aspect=aspects.get(quote);
          article.style.setProperty('--rc-aspect-color',aspect.color);
          const tag=aspects.badge(quote,true);
          tag.classList.add('rc-archive-aspect');
          kind.append(tag);
        }
        article.append(kind,text,source);section.append(article);
      }
      list.append(section);
    }
    if(!rows.length) {const p=document.createElement('p');p.textContent='还没有这一类签，回首页抽一句喵。';list.append(p);}
    status.textContent=`签册共 ${all().length} 段 · 当前显示 ${rows.length} 段`;
  }
  filter.addEventListener('change',render);
  root.querySelector('[data-archive-import-button]').addEventListener('click',()=>root.querySelector('[data-archive-import]').click());
  root.querySelector('[data-archive-export]').addEventListener('click',()=>{
    const data={version:1,exportedAt:new Date().toISOString(),records:all()};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=`我的签册-${records.dateNow()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  root.querySelector('[data-archive-import]').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>10*1024*1024)throw Error('size');
      const data=JSON.parse(await file.text());
      if(data.version!==1||!Array.isArray(data.records)||data.records.length>20000)throw Error('format');
      data.records=data.records.filter(row=>!row||row.kind!=='legacy');
      // Validate the entire import before any writes.
      if(data.records.some(row=>!row||typeof row.text!=='string'||!row.text||row.text.length>2000||typeof row.book!=='string'||!row.book||!validDate(row.date)||!['daily','redraw'].includes(row.kind)))throw Error('record');
      let persisted=true;
      for(const row of data.records) persisted=records.add(row,row.kind,row.date,row.timestamp||null)&&persisted;
      render();status.textContent=persisted?'导入完成，重复的签已自动合并喵。':'已导入本页；浏览器未允许保存，请导出备份喵。';
    } catch (_) {status.textContent='没有导入成功，请选择导出的签册 JSON 文件。';}
    event.target.value='';
  });
  window.addEventListener('storage',event=>{if(event.key===records.key)render();});
  render();
  records.migrate(root.dataset.pool).then(render).catch(()=>{status.textContent='旧签暂未加载，请稍后刷新；已有签册仍保留。';});
})();