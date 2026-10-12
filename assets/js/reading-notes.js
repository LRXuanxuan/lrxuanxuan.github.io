/* 本地阅读摘录 v1：原文波浪线、随笔、作品目录汇总、JSON 备份。无依赖、无联网。 */
(function () {
  "use strict";
  var path = location.pathname;
  if (!path.endsWith("/")) path += "/";
  function workOf(p) {
    var m = p.match(/^\/translations\/([a-z0-9-]+)\/(?:[a-z0-9-]+\/)?$/);
    if (m) return "/translations/" + m[1] + "/";
    return /^\/posts\/[a-z0-9-]+\/$/.test(p) ? p : null;
  }
  var book = workOf(path);
  if (!book) return;
  var index = path === book && path.startsWith("/translations/");
  var reader = document.getElementById("stapledon-reader");
  var host = document.querySelector("#post-content") || document.querySelector("article .content");
  var textRoot = reader || (!index ? host : null);
  if (!host && !reader) return;
  var holder = reader || host;
  var KEY = "lrx-reading-notes-v1", MAX_NOTES = 2500, MAX_QUOTE = 2000, MAX_COMMENT = 4000;
  var nativeHighlight = !!(window.CSS && CSS.highlights && typeof window.Highlight === "function");
  var notebook, list, summary, empty, pop, active = null;
  function valid(n) {
    return n && typeof n.id === "string" && /^[a-zA-Z0-9_-]{3,90}$/.test(n.id) &&
      typeof n.page === "string" && n.page.length < 180 &&
      n.book === workOf(n.page) && (n.lang === "zh" || n.lang === "en") &&
      typeof n.quote === "string" && n.quote.length > 0 && n.quote.length <= MAX_QUOTE + 100 &&
      typeof n.title === "string" && n.title.length <= 200 &&
      typeof n.comment === "string" && n.comment.length <= MAX_COMMENT &&
      Array.isArray(n.parts) && n.parts.length >= 1 && n.parts.length <= 60 &&
      n.parts.every(function (s) {
        return Number.isInteger(s.block) && s.block >= 0 && s.block < 100000 &&
          Number.isInteger(s.start) && s.start >= 0 && s.start < 200000 &&
          Number.isInteger(s.end) && s.end > s.start && s.end < 200000 &&
          typeof s.text === "string" && s.text.length === s.end - s.start && s.text.length <= MAX_QUOTE;
      });
  }
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || "{}");
      return Array.isArray(d.notes) ? d.notes.filter(valid).slice(0, MAX_NOTES) : [];
    } catch (_) { return []; }
  }
  var notes = load();
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({version:1,notes:notes}));
      return true;
    } catch (_) {
      alert("无法保存笔记：浏览器可能禁用了本地存储，或存储空间已满。请先导出备份。");
      return false;
    }
  }
  function make(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function btn(txt, fn) {
    var b = make("button","rn-btn",txt);
    b.type = "button"; b.addEventListener("click",fn); return b;
  }
  function contentBlocks(lang) {
    if (!textRoot) return [];
    var scope = reader ? reader.querySelector('[data-story-lang="' + lang + '"]') : textRoot;
    if (!scope) return [];
    return Array.from(scope.querySelectorAll("p,h2,h3,h4,li,blockquote")).filter(function (el) {
      return !(el.matches("li,blockquote") && el.querySelector("p,li")) &&
        !el.closest(".rn-notebook,.rn-float,nav,aside,.footnotes,.stapledon-chapter-nav");
    });
  }
  function createRange(el,start,end) {
    if (start < 0 || end <= start) return null;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, pos=0, a=null,b=null,x=0,y=0;
    while ((n=w.nextNode())) {
      var next=pos+n.length;
      if (!a && start < next) { a=n; x=start-pos; }
      if (a && end <= next) { b=n; y=end-pos; break; }
      pos=next;
    }
    if (!a || !b) return null;
    var r=document.createRange(); r.setStart(a,x); r.setEnd(b,y); return r;
  }
  function locate(part, elements) {
    var el=elements[part.block], at=-1;
    if (el) {
      var str=el.textContent;
      if (str.slice(part.start,part.end) === part.text) at=part.start;
      else at=str.indexOf(part.text);
    }
    if (at<0) {
      var found=[];
      elements.forEach(function (e,i) {
        var x=e.textContent.indexOf(part.text);
        if (x>=0 && e.textContent.indexOf(part.text,x+1)<0) found.push({el:e,at:x,i:i});
      });
      if (found.length===1) { el=found[0].el; at=found[0].at; }
    }
    return at<0 ? null : createRange(el,at,at+part.text.length);
  }
  function ranges(n) {
    if (n.page !== path || !textRoot) return [];
    var els=contentBlocks(n.lang);
    return n.parts.map(function (p) { return locate(p,els); }).filter(Boolean);
  }
  function resetMarks() {
    if (!textRoot) return;
    textRoot.querySelectorAll("span.rn-wave").forEach(function (el) {
      el.replaceWith(document.createTextNode(el.textContent));
    });
    contentBlocks("zh").concat(contentBlocks("en")).forEach(function (e) { e.normalize(); });
  }
  function wrap(r) {
    var common=r.commonAncestorContainer, base=common.nodeType===1?common:common.parentNode;
    var w=document.createTreeWalker(base,NodeFilter.SHOW_TEXT), matches=[], n;
    while ((n=w.nextNode())) {
      if (!n.length || !r.intersectsNode(n)) continue;
      var a=n===r.startContainer?r.startOffset:0, b=n===r.endContainer?r.endOffset:n.length;
      if (a<b) matches.push({n:n,a:a,b:b});
    }
    matches.reverse().forEach(function (m) {
      var n=m.n;
      if (m.b<n.length) n.splitText(m.b);
      if (m.a) n=n.splitText(m.a);
      var s=make("span","rn-wave"); n.replaceWith(s); s.appendChild(n);
    });
  }
  function repaint() {
    if (!textRoot) return;
    if (!nativeHighlight) resetMarks();
    var all=notes.filter(function(n){return n.page===path;}).flatMap(ranges);
    if (nativeHighlight) {
      CSS.highlights.delete("rn-saved-waves");
      if (all.length) CSS.highlights.set("rn-saved-waves",new Highlight(...all));
    } else {
      all.sort(function(a,b){return b.compareBoundaryPoints(Range.START_TO_START,a);});
      all.forEach(wrap);
    }
  }
  function selected() {
    if (!textRoot) return null;
    var s=window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount!==1) return null;
    var r=s.getRangeAt(0);
    if (!textRoot.contains(r.commonAncestorContainer)) return null;
    var lang="zh";
    if (reader) {
      var a=r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement;
      var z=r.endContainer.nodeType===1?r.endContainer:r.endContainer.parentElement;
      var left=a && a.closest("[data-story-lang]"),right=z && z.closest("[data-story-lang]");
      if (!left || left!==right || left.hidden) return null;
      lang=left.dataset.storyLang==="en"?"en":"zh";
    }
    var parts=[],chunks=[],total=0,els=contentBlocks(lang);
    els.forEach(function(el,i){
      if (!r.intersectsNode(el)) return;
      try {
        var whole=document.createRange(); whole.selectNodeContents(el);
        var part=r.cloneRange();
        if (part.compareBoundaryPoints(Range.START_TO_START,whole)<0)
          part.setStart(whole.startContainer,whole.startOffset);
        if (part.compareBoundaryPoints(Range.END_TO_END,whole)>0)
          part.setEnd(whole.endContainer,whole.endOffset);
        if (part.collapsed) return;
        var prior=document.createRange(); prior.selectNodeContents(el);
        prior.setEnd(part.startContainer,part.startOffset);
        var start=prior.toString().length, txt=part.toString();
        if (!txt.trim()) return;
        total+=txt.length;
        parts.push({block:i,start:start,end:start+txt.length,text:txt});
        chunks.push(txt);
      } catch (_) {}
    });
    if (!parts.length || parts.length>60 || total>MAX_QUOTE || !total) return null;
    return {lang:lang,parts:parts,quote:chunks.join("\n")};
  }
  function hidePop(){if(pop)pop.classList.remove("rn-show");active=null;}
  function add(withComment) {
    var s=active;
    hidePop();
    if(!s) return;
    if (notes.length>=MAX_NOTES) { alert("笔记条数已达到上限，请导出备份并整理。"); return; }
    var comment="";
    if (withComment) {
      var input=prompt("写下你的笔记（可以记录单词、翻译、感想；取消则不保存）：","");
      if (input===null) return;
      comment=input.slice(0,MAX_COMMENT);
    }
    if (notes.some(function(n){return n.page===path && n.lang===s.lang && JSON.stringify(n.parts)===JSON.stringify(s.parts);})) {
      alert("这段文字已经标记过啦。可以在摘录列表中修改笔记。"); return;
    }
    var title=(document.querySelector("h1")||{}).textContent||document.title||"网页";
    var n={id:"rn-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9),
      book:book,page:path,title:title.trim().slice(0,200),lang:s.lang,
      quote:s.quote,parts:s.parts,comment:comment,created:Date.now()};
    notes.push(n);
    if(!save()) {notes.pop();return;}
    try {window.getSelection().removeAllRanges();}catch(_){}
    repaint();showList();
  }
  function popup() {
    pop=make("div","rn-float");
    pop.setAttribute("role","toolbar");pop.setAttribute("aria-label","选中文字后的摘录操作");
    pop.append(btn("〰 划波浪线",function(){add(false);}));
    pop.append(btn("✎ 写笔记",function(){add(true);}));
    document.body.appendChild(pop);
    pop.addEventListener("mousedown",function(e){e.preventDefault();});
    function show() {
      if (document.activeElement && pop.contains(document.activeElement)) return;
      var s=selected();
      if (!s) {hidePop();return;}
      active=s;
      var r=window.getSelection().getRangeAt(0), box=r.getBoundingClientRect();
      var x=Math.max(8,Math.min(window.innerWidth-245,box.left)), y=box.top-46;
      if(y<8)y=Math.min(window.innerHeight-52,box.bottom+8);
      pop.style.left=Math.round(x)+"px";pop.style.top=Math.round(y)+"px";
      pop.classList.add("rn-show");
    }
    document.addEventListener("mouseup",function(e){if(!pop.contains(e.target)) show();});
    document.addEventListener("keyup",function(e){if(e.key==="Shift"||e.key==="ArrowLeft"||e.key==="ArrowRight")show();});
    document.addEventListener("touchend",function(e){if(!pop.contains(e.target))setTimeout(show,120);},{passive:true});
    document.addEventListener("scroll",hidePop,true);
    document.addEventListener("keydown",function(e){if(e.key==="Escape")hidePop();});
  }
  function titleOf(n){
    if(n.page===book)return "全书目录";
    return n.title.replace(/^\s*/,"").replace(/\s*[-|]\s*.*$/,"").slice(0,90);
  }
  function jump(n) {
    if(n.page!==path) {location.href=n.page+"?rn="+encodeURIComponent(n.id);return;}
    if(reader){
      var b=document.querySelector('[data-stapledon-lang="'+n.lang+'"]');
      if(b && b.getAttribute("aria-pressed")!=="true")b.click();
    }
    var rs=ranges(n);
    if(!rs.length) {alert("原文可能已有调整，暂时无法自动定位；摘录文字仍保留在笔记里。");return;}
    var t=rs[0].startContainer,el=t.nodeType===1?t:t.parentElement;
    if(el) el.scrollIntoView({behavior:"smooth",block:"center"});
  }
  function noteSet(n,text) {
    var old=n.comment;n.comment=text.slice(0,MAX_COMMENT);
    if(!save()){n.comment=old;return false;}return true;
  }
  function showList() {
    if(!list)return;
    var subset=notes.filter(function(n){return n.book===book && (index||n.page===path);})
      .sort(function(a,b){return (b.created||0)-(a.created||0);});
    summary.textContent="〰 "+(index?"本书摘录":"本页摘录")+"（"+subset.length+"）";
    list.replaceChildren();
    if(!subset.length){list.append(make("p","rn-empty",index?"还没有摘录。进入任一章节，选择喜欢的句子就能收藏在这里。":"还没有摘录。用鼠标或触屏选中文字，即可划线或写笔记。"));return;}
    subset.forEach(function(n){
      var li=make("li","rn-entry");
      var quote=make("button","rn-jump",n.quote);quote.type="button";quote.title="定位到原文";
      quote.addEventListener("click",function(){jump(n);});li.append(quote);
      var date=Number.isFinite(n.created)?new Date(n.created).toLocaleDateString("zh-CN"):"";
      li.append(make("div","rn-meta",titleOf(n)+" · "+(n.lang==="en"?"English":"中文")+(date?" · "+date:"")));
      if(n.comment)li.append(make("div","rn-comment",n.comment));
      var actions=make("div","rn-inline");
      actions.append(btn(n.comment?"修改笔记":"添加笔记",function(){
        var next=prompt("笔记：",n.comment);
        if(next!==null && noteSet(n,next))showList();
      }));
      actions.append(btn("复制",function(){
        var value=n.quote+(n.comment?"\n\n"+n.comment:"");
        if(navigator.clipboard && navigator.clipboard.writeText)
          navigator.clipboard.writeText(value).catch(function(){prompt("复制以下内容：",value);});
        else prompt("复制以下内容：",value);
      }));
      actions.append(btn("删除",function(){
        if(!confirm("删除这条划线与笔记？"))return;
        var old=notes.slice();notes=notes.filter(function(e){return e.id!==n.id;});
        if(!save()){notes=old;return;}
        repaint();showList();
      }));
      li.append(actions);list.append(li);
    });
  }
  function exportNotes() {
    var json=JSON.stringify({version:1,exportedAt:new Date().toISOString(),notes:notes},null,2);
    var url=URL.createObjectURL(new Blob([json],{type:"application/json;charset=utf-8"}));
    var a=make("a");a.href=url;a.download="reading-notes-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);
  }
  function importNotes(file) {
    if(!file||file.size>3*1024*1024){alert("请选择不大于 3 MB 的笔记 JSON 备份。");return;}
    file.text().then(function(text){
      var obj=JSON.parse(text);
      if(!obj||obj.version!==1||!Array.isArray(obj.notes))throw Error("格式不正确");
      var received=obj.notes.filter(valid), ids=new Set(notes.map(function(n){return n.id;}));
      var added=received.filter(function(n){return !ids.has(n.id);}).slice(0,MAX_NOTES-notes.length);
      var before=notes.slice();notes=notes.concat(added);
      if(!save()){notes=before;return;}
      repaint();showList();alert("导入完成：新增 "+added.length+" 条（重复笔记已跳过）。");
    }).catch(function(){alert("读取失败：请使用本站导出的 JSON 备份。");});
  }
  function buildUI() {
    notebook=make("details","rn-notebook");
    notebook.id="reading-notes";
    summary=make("summary");notebook.append(summary);
    notebook.append(make("p","rn-hint",index?
      "本书各章节的中文与英文摘录汇总于此。点击摘录可回到原文；笔记只存在当前浏览器。":
      "选中正文即可「划波浪线」或「写笔记」。中英文分别记载，点击摘录可回到原句；数据仅存本机浏览器。"));
    var actions=make("div","rn-actions");
    actions.append(btn("↓ 导出 JSON 备份",exportNotes));
    var picker=make("input");picker.type="file";picker.accept=".json,application/json";picker.hidden=true;
    picker.addEventListener("change",function(){if(picker.files&&picker.files[0])importNotes(picker.files[0]);picker.value="";});
    actions.append(btn("↑ 导入 JSON 备份",function(){picker.click();}));
    actions.append(picker);notebook.append(actions);
    list=make("ul","rn-list");notebook.append(list);
    if(index && host){
      var heading=Array.from(host.querySelectorAll("h2")).find(function(e){return /目录|篇目/.test(e.textContent);}) || host.querySelector("h2");
      if(heading) host.insertBefore(notebook,heading);
      else host.appendChild(notebook);
    } else {
      holder.insertAdjacentElement("afterend",notebook);
      var nav=document.querySelector(".stapledon-chapter-nav");
      if(nav){
        var quick=make("a","rn-quick","〰 查看摘录");
        quick.href="#reading-notes";
        quick.addEventListener("click",function(){notebook.open=true;});
        nav.append(quick);
      }
    }
    showList();
  }
  buildUI();
  if(textRoot) {repaint();popup();}
  var rn=new URLSearchParams(location.search).get("rn");
  if(rn) {
    var target=notes.find(function(n){return n.id===rn && n.page===path;});
    if(target)window.addEventListener("load",function(){setTimeout(function(){jump(target);},90);},{once:true});
  }
})();
