(() => {
  const root=document.querySelector('.rc-sign-archive');
  const records=globalThis.RCSignRecords;
  const aspects=globalThis.RCSignAspects;
  const votes=globalThis.RCSignVotes;
  const calendar=globalThis.RCSignCalendar;
  if(!root||!records) return;
  const list=root.querySelector('[data-archive-local]');
  const staticDaily=root.querySelector('[data-archive-daily]');
  const status=root.querySelector('[data-archive-status]');
  const filter=root.querySelector('[data-archive-filter]');
  const voteTotal=root.querySelector('[data-votes-total]');
  function updateVoteSummary() {
    if(!votes||!voteTotal) return;
    const summary=votes.totals();
    voteTotal.textContent=`私人评价：♡ 喜欢 ${summary.like} 条 · 🐾 不喜欢 ${summary.dislike} 条（仅存在此浏览器）`;
  }
  function voteControls(quote) {
    const group=document.createElement('div');
    group.className='rc-sign-votes';group.setAttribute('role','group');
    group.setAttribute('aria-label','这条签文的私人评价');
    const buttons={};
    const refresh=()=>{
      const picked=votes.get(quote);
      for(const [kind,button] of Object.entries(buttons)){
        button.setAttribute('aria-pressed',String(picked===kind));
        button.title=picked===kind?'再点一次可撤销':'只在本机保存';
      }
    };
    for(const [kind,caption,label] of [['like','♡ 贴贴','喜欢这句日签'],['dislike','🐾 踩踩','不喜欢这句日签']]) {
      const button=document.createElement('button');
      button.type='button';button.textContent=caption;
      button.setAttribute('aria-label',label);
      button.dataset[kind==='like'?'signLike':'signDislike']='';
      button.addEventListener('click',()=>{
        const response=votes.vote(quote,kind);
        refresh();updateVoteSummary();
        if(!response.ok) status.textContent='评价暂存在本页，浏览器没有允许持久保存。';
      });
      buttons[kind]=button;group.append(button);
    }
    refresh();return group;
  }
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
    // Do not build hundreds of DOM cards while the archive is folded.
    if(!root.open) return;
    const mode=filter.value;
    // Sort by Beijing calendar date first, then the actual redraw timestamp.
    // Older imports may have no timestamp; fall back to reverse archive insertion
    // order so the latest saved redraw still appears above earlier ones.
    // The daily default belongs to 00:00, not the time its page was opened.
    const rows=all()
      .map((row,index)=>({row,index}))
      .filter(({row})=>mode==='all'||(mode==='redraw'?row.kind==='redraw':row.kind==='daily'))
      .sort((a,b)=>{
        const byDay=b.row.date.localeCompare(a.row.date);
        if(byDay) return byDay;
        if(a.row.kind!==b.row.kind) return a.row.kind==='redraw'?-1:1;
        const aTime=Date.parse(a.row.timestamp||'');
        const bTime=Date.parse(b.row.timestamp||'');
        if(Number.isFinite(aTime)&&Number.isFinite(bTime)&&aTime!==bTime)
          return bTime-aTime;
        if(Number.isFinite(aTime)!==Number.isFinite(bTime))
          return Number.isFinite(bTime)?1:-1;
        return b.index-a.index;
      })
      .map(({row})=>row);
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
        article.append(kind,text,source);
        if(votes) article.append(voteControls(quote));
        section.append(article);
      }
      list.append(section);
    }
    if(!rows.length) {const p=document.createElement('p');p.textContent='还没有这一类签，回首页抽一句喵。';list.append(p);}
    status.textContent=`签册共 ${all().length} 段 · 当前显示 ${rows.length} 段`;
    updateVoteSummary();
  }
  filter.addEventListener('change',render);
  root.querySelector('[data-archive-import-button]').addEventListener('click',()=>root.querySelector('[data-archive-import]').click());
  root.querySelector('[data-votes-export]').addEventListener('click',()=>{
    if(!votes)return;
    const exportFile=new Blob([JSON.stringify(votes.exportData(),null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(exportFile);
    const link=document.createElement('a');link.href=url;
    link.download=`日签私人评价-${records.dateNow()}.json`;
    link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent='已准备好评价文件，记得留作备份喵。';
  });
  root.querySelector('[data-votes-import-button]').addEventListener('click',()=>root.querySelector('[data-votes-import]').click());
  root.querySelector('[data-votes-import]').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try {
      if(file.size>3*1024*1024)throw Error('size');
      const result=votes.importData(JSON.parse(await file.text()));
      render();
      status.textContent=result.ok?`已恢复 ${result.imported} 条评价喵。`:'导入结果只能暂存在本页，请检查浏览器存储。';
    } catch (_) {status.textContent='评价文件格式不符合要求，未导入。';}
    event.target.value='';
  });
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
  window.addEventListener('storage',event=>{if(event.key===records.key||event.key===votes?.storageKey)render();});
  let archiveInitialized=false;
  let refreshMissingDays=()=>Promise.resolve();
  function revealLinkedArchive() {
    if(location.hash==='#rc-archive-title') root.open=true;
  }
  root.addEventListener('toggle',()=>{
    if(!root.open){list.replaceChildren();return;}
    render();
    if(!archiveInitialized) {
      archiveInitialized=true;
      records.migrate(root.dataset.pool).then(render).catch(()=>{
        status.textContent='旧签暂未加载，请稍后刷新；已有签册仍保留。';
      });
    }
    refreshMissingDays();
  });
  window.addEventListener('hashchange',revealLinkedArchive);
  revealLinkedArchive();
  // The hash target is in the summary. It can open automatically when linked
  // from the homepage, but regular visits leave the native details folded.
  if(root.open) root.dispatchEvent(new Event('toggle'));

  // GitHub's nightly job normally publishes the official archive. When the
  // queue is delayed, derive missing dates locally so the archive still shows
  // the new Beijing date immediately. Published rows always take precedence.
  if(calendar) {
    let updating=null,dayTimer=null;
    async function addMissingDays() {
      if(!root.open)return;
      if(updating)return updating;
      const today=calendar.day();
      const existing=new Set(daily.map(row=>row.date));
      const missing=[];
      const start=Date.parse('2026-10-12T00:00:00Z');
      const end=Date.parse(today+'T00:00:00Z');
      for(let point=start;point<=end&&missing.length<7305;point+=86400000) {
        const date=new Date(point).toISOString().slice(0,10);
        if(!existing.has(date))missing.push(date);
      }
      if(!missing.length)return;
      updating=fetch(root.dataset.pool,{cache:'no-cache'})
        .then(response=>{if(!response.ok)throw Error('sign-pool');return response.json();})
        .then(data=>{
          if(!Array.isArray(data.quotes)||!data.quotes.length)throw Error('sign-pool');
          for(const date of missing) {
            if(date>calendar.day()||daily.some(row=>row.date===date))continue;
            const q=calendar.choose(data.quotes,date);
            daily.push({...q,date});
          }
          render();
        }).catch(()=>{
          status.textContent='正式日签归档稍有延迟，稍后刷新即可。';
        }).finally(()=>{updating=null;});
      return updating;
    }
    function schedule() {
      if(dayTimer!==null)clearTimeout(dayTimer);
      dayTimer=setTimeout(()=>addMissingDays().finally(schedule),
        calendar.nextMidnightDelay());
    }
    refreshMissingDays=()=>Promise.resolve(addMissingDays());
    refreshMissingDays().finally(schedule);
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden)refreshMissingDays().finally(schedule);
    });
  }
})();