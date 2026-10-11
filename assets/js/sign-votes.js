/* Private, one-vote-per-sign preferences. Nothing is sent to a server. */
(() => {
  'use strict';
  const storageKey = 'rc-sign-votes-v1';
  let fallback = {};
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
    catch (_) { return false; }
  }
  function get(quote) {
    if (!quote?.id) return null;
    return read()[String(quote.id)]?.vote || null;
  }
  function vote(quote,kind) {
    if (!quote?.id || !['like','dislike'].includes(kind)) return {ok:false,vote:null};
    const store=read(),id=String(quote.id);
    const next=store[id]?.vote===kind?null:kind;
    if (next) store[id]=clean({...quote,id,vote:next,updatedAt:new Date().toISOString()});
    else delete store[id];
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