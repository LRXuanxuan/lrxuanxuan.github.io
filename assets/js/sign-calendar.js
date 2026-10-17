/* Date-stable daily sign selector; independent of GitHub Actions deployment timing.
   Keep selection formula in sync with tools/update_daily_sign.py. */
(() => {
  'use strict';
  function day(date=new Date()) {
    const parts=new Intl.DateTimeFormat('en-US',{
      timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'
    }).formatToParts(date);
    const value=type=>parts.find(x=>x.type===type)?.value||'01';
    return value('year')+'-'+value('month')+'-'+value('day');
  }
  function hash(value) {
    let n=2166136261;
    for(let i=0;i<value.length;i++) {
      n^=value.charCodeAt(i);
      n=Math.imul(n,16777619);
    }
    return (n>>>0)/4294967296;
  }
  function choose(quotes,date) {
    if(!Array.isArray(quotes)||!quotes.length)throw Error('empty-quote-pool');
    // Site-owner revision: preserve the originally selected October 18 ID.
    if(date==='2026-10-18') {
      const corrected=quotes.find(q=>q.id==='5a0914acfb3c5e3339371528175f93947a13a6a4944873dba09012591fd5c7fb');
      if(corrected)return corrected;
    }
    const groups=new Map();
    for(const quote of quotes) {
      if(!groups.has(quote.book))groups.set(quote.book,{weight:Number(quote.weight)||1,items:[]});
      groups.get(quote.book).items.push(quote);
    }
    const books=[...groups.values()];
    const quoteWeight=q=>Number(q.quoteWeight)>0?Number(q.quoteWeight):1;
    for(const book of books) {
      book.weight*=book.items.reduce((sum,q)=>sum+quoteWeight(q),0)/book.items.length;
    }
    let ticket=hash('rc-daily-sign-v1|'+date+'|book')*books.reduce((s,x)=>s+x.weight,0);
    let selected=books[books.length-1];
    for(const book of books) {
      ticket-=book.weight;
      if(ticket<0){selected=book;break;}
    }
    ticket=hash('rc-daily-sign-v1|'+date+'|quote')*
      selected.items.reduce((s,q)=>s+quoteWeight(q),0);
    for(const quote of selected.items) {
      ticket-=quoteWeight(quote);
      if(ticket<0)return quote;
    }
    return selected.items[selected.items.length-1];
  }
  function nextMidnightDelay() {
    const today=day();
    // Beijing midnight of tomorrow is 16:00 UTC today.
    const next=Date.parse(today+'T00:00:00Z')+16*60*60*1000;
    return Math.max(50,next-Date.now()+100);
  }
  globalThis.RCSignCalendar={day,choose,nextMidnightDelay};
})();
