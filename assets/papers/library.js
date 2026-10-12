/* Source text is inserted via textContent; only HTTP(S) and site paths become links. */
(() => {
  'use strict';
  const root = document.getElementById('paper-library');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const make = (tag, text, cls) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el; };
  const safe = url => typeof url === 'string' && (/^https?:\/\//i.test(url) || /^\/(?!\/)/.test(url));
  const anchor = (text, url) => { if (!safe(url)) return null; const a = make('a', text); a.href = url.replace(/^http:\/\/jmlr\.org\//,'https://jmlr.org/'); if (/^https?:/.test(url)) {a.target='_blank';a.rel='noopener noreferrer';} return a; };
  let data, view = 'papers', limit = 20;
  const query = new URLSearchParams(location.search); $('pl-query').value=query.get('q')||'';
  function appendLink(parent, text, url) { const a=anchor(text,url); if (a) parent.append(a); }
  function card(p) {
    const c=make('article',undefined,'pl-card'); c.id='paper-'+p.id;
    const m=make('div',undefined,'pl-meta'); m.append(make('span',p.date)); m.append(make('span',p.fields['契合方向']||'研究阅读','pl-pill'));m.append(make('span',p.status));c.append(m);
    const heading=make('h3');appendLink(heading,p.title,p.paper_url);c.append(heading);c.append(make('p',p.fields['推荐理由']||p.fields['内容']?.slice(0,220)||'', 'pl-reason'));
    const links=make('div',undefined,'pl-links');
    for (const a of p.hosted_pdfs) appendLink(links,'下载 PDF','/'+a.site_path);
    p.pdf_sources.forEach((u,i)=>appendLink(links,p.hosted_pdfs.length?'原始 PDF 来源':(i?'PDF 来源 '+(i+1):'PDF / 原文'),u));
    p.github.forEach((u,i)=>appendLink(links,i?'GitHub '+(i+1):'GitHub 仓库',u));
    if (p.report_entry_url) appendLink(links,'本篇日报与证据',p.paper_report_url);
    appendLink(links,p.full_translation_label||'全文翻译（待补齐）',p.full_translation_url||p.paper_url+'#paper-translation');
    p.translations.filter(t=>t.scope!=='全文中英文对照').forEach(t=>appendLink(links,'本篇历史译文',t.url));c.append(links);
    if(!p.github.length)c.append(make('small',p.fields['代码/数据状态']||'未记录公开代码状态','pl-meta'));
    const d=make('details');d.append(make('summary','展开方法、结果、证据及表格全部字段'));
    const dl=make('dl');Object.entries(p.fields).forEach(([k,v])=>{dl.append(make('dt',k));const dd=make('dd',v||'—');const url=p.hyperlinks[k];if(url){dd.append(document.createTextNode(' '));appendLink(dd,'打开链接',url);}dl.append(dd);});
    d.append(dl);
    if(p.report_section){const section=make('details');section.append(make('summary','日报中的逐篇说明'));section.append(make('div',p.report_section,'pl-section'));d.append(section);}
    const more=make('div',undefined,'pl-links');p.links.forEach((u,i)=>appendLink(more,'证据 '+(i+1),u));d.append(more);
    for(const a of p.hosted_pdfs){const att=make('p',`${a.title} · ${a.authors||''} · 未修改原文。`,'pl-meta');appendLink(att,'原文授权',a.license_url);d.append(att);}
    d.append(make('small',`来源：${data.source} · ${p.sheet} 第 ${p.row} 行 · 全文译稿：${p.translation_status}`,'pl-meta'));c.append(d);return c;
  }
  function render() {
    const q=$('pl-query').value.trim().toLowerCase(), day=$('pl-date').value, status=$('pl-status').value, code=$('pl-code').checked;
    const source=view==='papers'?data.papers:data[view];
    const result=source.filter(p=>(!query.get('paper')||view!=='papers'||p.id===query.get('paper'))&&(!day||p.date===day)&&(!q||p.title.toLowerCase().includes(q))&&(view!=='papers'||((!status||p.status===status)&&(!code||p.github.length))));
    $('pl-count').textContent=`${view==='papers'?'论文记录':view==='reports'?'日报':'译文'} ${result.length} ${view==='papers'?'条':'份'} · 默认按日期由新到旧`;
    const dest=$('pl-results');dest.replaceChildren();
    for (const p of result.slice(0,limit)) {
      if(view==='papers')dest.append(card(p));
      else {const c=make('article',undefined,'pl-card');c.append(make('div',p.date+(p.scope?' · '+p.scope:''),'pl-meta'));c.append(make('h3',p.title));const links=make('div',undefined,'pl-links');appendLink(links,view==='reports'?'阅读完整日报':'阅读译文',p.url);appendLink(links,'下载 Markdown',p.download);c.append(links);dest.append(c);}
    }
    if(!result.length)dest.append(make('p','没有匹配记录，请调整筛选条件。'));
    $('pl-more').hidden=result.length<=limit;
    $('pl-status').disabled=view!=='papers';$('pl-code').disabled=view!=='papers';
  }
  fetch(root.dataset.source,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(json=>{
    data=json;
    // A standalone translation may be added after the bulk library index was generated.
    // Reconcile its display state here without rewriting the large generated JSON catalogue.
    const translatedPaper = data.papers.find(p => p.id === 'f01eb39a8eaa1174');
    if (translatedPaper && !/已完成/.test(translatedPaper.translation_status || '')) {
      translatedPaper.full_translation_label = '全文中文译文（已完成）';
      translatedPaper.full_translation_url = '/papers/items/f01eb39a8eaa1174/#paper-translation';
      translatedPaper.translation_status = '全文译稿已发布（CC BY-NC-SA 4.0）';
      if (!data.translations.some(t => t.url === translatedPaper.full_translation_url)) {
        data.translations.unshift({
          date: '2026-10-12',
          title: 'Zero-Shot Frequency Generalization for Radio Map Prediction via Cross-Attention Physics-Residual Learning',
          scope: '全文中文译文',
          url: translatedPaper.full_translation_url,
          download: 'https://raw.githubusercontent.com/LRXuanxuan/lrxuanxuan.github.io/main/papers/items/f01eb39a8eaa1174.md'
        });
      }
      if (data.translation_progress) {
        data.translation_progress.completed = (data.translation_progress.completed || 0) + 1;
        data.translation_progress.public_full_text = (data.translation_progress.public_full_text || 0) + 1;
      }
    }
    const stats=$('pl-stats');stats.replaceChildren();
    const progress=data.translation_progress;
    [[data.total,'推荐记录'],[Object.keys(data.dates).length,'推荐日期'],[data.reports.length,'每日报告'],[progress?`${progress.completed}/${progress.target}`:'0','全文验收通过'],[progress?.public_full_text||0,'可公开全文译文']].forEach(([n,label])=>{const s=make('div',undefined,'pl-stat');s.append(make('strong',String(n)),make('span',label));stats.append(s);});
    Object.entries(data.dates).forEach(([date,n])=>{const o=make('option',date+' · '+n+'篇');o.value=date;$('pl-date').append(o);});
    [...new Set(data.papers.map(p=>p.status))].sort().forEach(s=>{const o=make('option',s);o.value=s;$('pl-status').append(o);});
    if(query.get('date'))$('pl-date').value=query.get('date');
    $('pl-filters').addEventListener('submit',e=>e.preventDefault());$('pl-filters').addEventListener('input',()=>{query.delete('paper');limit=20;render();});$('pl-filters').addEventListener('reset',()=>setTimeout(()=>{query.delete('paper');limit=20;render();},0));
    root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;limit=20;root.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));render();}));
    $('pl-more').addEventListener('click',()=>{limit+=20;render();});render();
  }).catch(err=>{$('pl-stats').textContent='论文库暂时无法加载：'+err.message;});
})();
