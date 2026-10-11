/* Private, one-vote-per-sign preferences. Nothing is sent to a server. */
(() => {
  'use strict';
  const storageKey = 'rc-sign-votes-v1';
  let fallback = {};
  let storageUnavailable = false;
  function identity(quote) {
    if (quote?.id) return String(quote.id);
    // Text-derived fallback makes server-rendered daily quotes work without
    // downloading the entire quote pool or needing a server-side quote ID.
    let a=2166136261,b=0x9e3779b9;
    for (const letter of String(quote?.text||'')) {
      const n=letter.charCodeAt(0);
      a=Math.imul(a^n,16777619);
      b=Math.imul(b^(n>>>8),2246822519);
    }
    return 'text:'+(a>>>0).toString(16)+(b>>>0).toString(16);
  }
  function clean(row) {
    if (!row || typeof row !== 'object' || !['like','dislike'].includes(row.vote)) return null;
    const id = String(row.id || '').trim();
    if (!id || id.length > 160 || typeof row.text !== 'string' || !row.text || row.text.length > 6000) return null;
    const compact = (field,max) => String(row[field] || '').slice(0,max);
    const updatedAt = typeof row.updatedAt === 'string' && !Number.isNaN(Date.parse(row.updatedAt))
      ? row.updatedAt : new Date().toISOString();
    return {
      id, vote:row.vote, text:row.text,
      book:compact('book',350), author:compact('author',180),
      chapter:compact('chapter',350), aspect:compact('aspect',40),
      updatedAt
    };
  }
  function read() {
    if (storageUnavailable) return {...fallback};
    try {
      const value=localStorage.getItem(storageKey);
      if (!value) { fallback={}; return {}; }
      const parsed=JSON.parse(value);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {...fallback};
      const safe={};
      for (const entry of Object.values(parsed)) {
        const item=clean(entry);
        if (item) safe[item.id]=item;
      }
      fallback=safe;
      return safe;
    } catch (_) { return {...fallback}; }
  }
  function write(value) {
    fallback={...value};
    try { localStorage.setItem(storageKey,JSON.stringify(value)); return true; }
    catch (_) { storageUnavailable=true; return false; }
  }
  function prior(store,quote) {
    const id=identity(quote);
    const direct=store[id];
    if (direct) return direct;
    // Only unique full-text matches (the pool currently has no duplicate texts).
    return Object.values(store).find(item=>item.text===quote?.text)||null;
  }
  function get(quote) {
    if (!quote?.text) return null;
    return prior(read(),quote)?.vote||null;
  }
  function vote(quote,kind) {
    if (!quote?.text || !['like','dislike'].includes(kind)) return {ok:false,vote:null};
    const store=read(),id=identity(quote),previous=prior(store,quote);
    const next=previous?.vote===kind?null:kind;
    if (previous) delete store[previous.id];
    if (next) store[id]=clean({...quote,id,vote:next,updatedAt:new Date().toISOString()});
    return {ok:write(store),vote:next};
  }
  function entries() {
    return Object.values(read()).sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt));
  }
  function totals() {
    const items=entries();
    return {like:items.filter(x=>x.vote==='like').length,dislike:items.filter(x=>x.vote==='dislike').length};
  }
  // The export is manually downloaded by the owner; no analytics endpoint exists.
  function exportData() {
    return {format:'rc-sign-votes',version:1,exportedAt:new Date().toISOString(),votes:entries()};
  }
  function importData(input) {
    if (!input || input.format!=='rc-sign-votes'||input.version!==1||
        !Array.isArray(input.votes)||input.votes.length>10000) throw Error('format');
    const normalized=[];
    for (const row of input.votes) {
      const valid=clean(row);
      if (!valid) throw Error('invalid-vote');
      normalized.push(valid);
    }
    const merged=read();
    for (const entry of normalized) {
      if (!merged[entry.id] || entry.updatedAt>=merged[entry.id].updatedAt) merged[entry.id]=entry;
    }
    return {ok:write(merged),imported:normalized.length};
  }
  globalThis.RCSignVotes={storageKey,get,vote,entries,totals,exportData,importData};
})();