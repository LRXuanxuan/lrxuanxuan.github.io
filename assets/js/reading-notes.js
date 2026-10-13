/* 阅读摘录 v2：本地优先，手动同步 GitHub 私有仓库。无第三方依赖、不自动上传。 */
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
  var MAX_DELETED = 10000, REMOTE_FILE = "reading-notes.json", MAX_REMOTE_BYTES = 3 * 1024 * 1024;
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
  function readDeleted(value) {
    var result = Object.create(null);
    if (!value || typeof value !== "object" || Array.isArray(value)) return result;
    var pairs = Object.entries(value);
    if (pairs.length > MAX_DELETED) throw Error("删除记录超出上限");
    pairs.forEach(function (pair) {
      if (/^[a-zA-Z0-9_-]{3,90}$/.test(pair[0]) &&
          Number.isSafeInteger(pair[1]) && pair[1] > 0) result[pair[0]] = pair[1];
    });
    return result;
  }
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {notes:Array.isArray(d.notes) ? d.notes.filter(valid).slice(0,MAX_NOTES) : [],
        deleted:readDeleted(d.deleted)};
    } catch (_) { return {notes:[],deleted:Object.create(null)}; }
  }
  var state = load(), notes = state.notes, deleted = state.deleted;
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({version:2,notes:notes,deleted:deleted}));
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
      quote:s.quote,parts:s.parts,comment:comment,created:Date.now(),updated:Date.now()};
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
    var old=n.comment, oldTime=n.updated;
    n.comment=text.slice(0,MAX_COMMENT);n.updated=Date.now();
    if(!save()){n.comment=old;n.updated=oldTime;return false;}return true;
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
        var old=notes.slice(), prior=deleted[n.id];
        deleted[n.id]=Date.now();notes=notes.filter(function(e){return e.id!==n.id;});
        if(!save()){notes=old;if(prior===undefined)delete deleted[n.id];else deleted[n.id]=prior;return;}
        repaint();showList();
      }));
      li.append(actions);list.append(li);
    });
  }
  function exportNotes() {
    var json=JSON.stringify({version:2,exportedAt:new Date().toISOString(),notes:notes,deleted:deleted},null,2);
    var url=URL.createObjectURL(new Blob([json],{type:"application/json;charset=utf-8"}));
    var a=make("a");a.href=url;a.download="reading-notes-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);
  }
  function importNotes(file) {
    if(!file||file.size>3*1024*1024){alert("请选择不大于 3 MB 的笔记 JSON 备份。");return;}
    file.text().then(function(text){
      var obj=JSON.parse(text);
      if(!obj||(obj.version!==1&&obj.version!==2)||!Array.isArray(obj.notes))throw Error("格式不正确");
      var received=obj.notes.filter(valid), ids=new Set(notes.map(function(n){return n.id;}));
      var added=received.filter(function(n){return !ids.has(n.id);}).slice(0,MAX_NOTES-notes.length);
      var before=notes.slice(), oldDeleted=Object.assign(Object.create(null),deleted);
      added.forEach(function(n){if(deleted[n.id]){n.updated=Date.now();delete deleted[n.id];}});
      notes=notes.concat(added);
      if(!save()){notes=before;deleted=oldDeleted;return;}
      repaint();showList();alert("导入完成：新增 "+added.length+" 条（重复笔记已跳过）。");
    }).catch(function(){alert("读取失败：请使用本站导出的 JSON 备份。");});
  }

  // 只接受用户明确指定的私有仓库。令牌仅在 input 中，绝不写入本地存储/仓库。
  function noteTime(n) {
    return Number.isSafeInteger(n.updated) && n.updated > 0 ? n.updated :
      (Number.isSafeInteger(n.created) && n.created > 0 ? n.created : 0);
  }
  function normalizeRemote(doc) {
    if (!doc || (doc.version !== 1 && doc.version !== 2) || !Array.isArray(doc.notes) ||
        doc.notes.length > MAX_NOTES || !doc.notes.every(valid))
      throw Error("私库备份格式无效或摘录数量超限，请先手动备份并检查。");
    return {notes:doc.notes,deleted:readDeleted(doc.deleted)};
  }
  function mergeStores(a,b) {
    var entries=new Map(), removed=Object.create(null);
    a.notes.forEach(function(n){entries.set(n.id,n);});
    b.notes.forEach(function(n){
      var old=entries.get(n.id);
      if(!old || noteTime(n)>noteTime(old))entries.set(n.id,n);
    });
    [a.deleted,b.deleted].forEach(function(obj){
      Object.entries(obj).forEach(function(pair){
        if(!removed[pair[0]] || pair[1]>removed[pair[0]])removed[pair[0]]=pair[1];
      });
    });
    if(Object.keys(removed).length>MAX_DELETED)throw Error("删除记录超出上限，请先导出备份。");
    var merged=Array.from(entries.values()).filter(function(n){
      return !removed[n.id] || noteTime(n)>removed[n.id];
    });
    if(merged.length>MAX_NOTES)throw Error("合并后摘录超出 "+MAX_NOTES+" 条上限，请先导出整理。");
    return {notes:merged,deleted:removed};
  }
  function applyStore(result) {
    var previousNotes=notes, previousDeleted=deleted;
    notes=result.notes;deleted=result.deleted;
    if(!save()){notes=previousNotes;deleted=previousDeleted;return false;}
    repaint();showList();return true;
  }
  function utf8ToBase64(value) {
    var bytes=new TextEncoder().encode(value), str="";
    for(var i=0;i<bytes.length;i+=8192)
      str+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));
    return btoa(str);
  }
  function base64ToUtf8(value) {
    var bin=atob(value.replace(/\\s/g,"")), bytes=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    return new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  }
  function syncPanel() {
    var pane=make("details","rn-sync");
    pane.append(make("summary",null,"☁ 私库同步（手动）"));
    pane.append(make("p","rn-hint","将全部作品摘录保存到你自己的 GitHub 私有仓库。默认仅存本机；点击按钮才访问 GitHub。"));
    var fields=make("div","rn-sync-fields");
    var repoLabel=make("label",null,"私有仓库（用户名/仓库名）");
    var repoInput=make("input","rn-sync-input");
    repoInput.type="text";repoInput.value="LRXuanxuan/reading-notes-private";
    repoInput.autocomplete="off";repoInput.spellcheck=false;
    repoLabel.append(repoInput);fields.append(repoLabel);
    var tokenLabel=make("label",null,"GitHub fine-grained token（仅本页临时使用）");
    var tokenInput=make("input","rn-sync-input");
    tokenInput.type="password";tokenInput.placeholder="粘贴只授权该私库 Contents 读写的令牌";
    tokenInput.autocomplete="off";tokenInput.spellcheck=false;
    tokenLabel.append(tokenInput);fields.append(tokenLabel);pane.append(fields);
    var help=make("p","rn-hint");
    help.append("首次使用：先在 GitHub ");
    var newRepo=make("a",null,"创建私有仓库");
    newRepo.href="https://github.com/new";newRepo.target="_blank";newRepo.rel="noopener noreferrer";help.append(newRepo);
    help.append("（勾选 Private 和 Add README），再");
    var newToken=make("a",null,"创建细粒度令牌");
    newToken.href="https://github.com/settings/personal-access-tokens/new";
    newToken.target="_blank";newToken.rel="noopener noreferrer";help.append(newToken);
    help.append("（仅该仓库、Contents: Read and write）。不要将令牌发送给他人或填写到公开文件。");
    pane.append(help);
    var status=make("p","rn-sync-status","尚未同步。令牌不会被网站保存，关闭/刷新页面后需重新输入。");
    status.setAttribute("role","status");status.setAttribute("aria-live","polite");
    function showStatus(message){status.textContent=message;}
    var actions=make("div","rn-actions"), push=btn("↑ 合并并同步到私库",function(){run("push");});
    var pull=btn("↓ 从私库合并到本机",function(){run("pull");});
    actions.append(push,pull);pane.append(actions);pane.append(status);
    async function run(mode) {
      var full=repoInput.value.trim(), token=tokenInput.value.trim();
      if(!/^[A-Za-z0-9-]{1,39}\\/[A-Za-z0-9_.-]{1,100}$/.test(full)) {
        showStatus("请填写有效的 GitHub 用户名/仓库名。");return;
      }
      if(!token){showStatus("请先输入私库的细粒度访问令牌。");return;}
      var endpoint="https://api.github.com/repos/"+full;
      var headers={"Accept":"application/vnd.github+json",
        "Authorization":"Bearer "+token,"X-GitHub-Api-Version":"2022-11-28"};
      async function api(url,options) {
        var response=await fetch(url,Object.assign({headers:headers,cache:"no-store"},options||{}));
        if(!response.ok){
          var message=response.status===401?"令牌无效或已失效":
            response.status===403?"访问被拒绝：请检查私库权限、令牌有效期或 API 限额":
            response.status===409?"私库已被其他设备更新，请重新点击同步":
            response.status===404?"仓库或文件不可访问：确认私库存在且令牌已授权":
            "GitHub API 返回 HTTP "+response.status;
          var err=Error(message);err.status=response.status;throw err;
        }
        return response.json();
      }
      push.disabled=true;pull.disabled=true;
      showStatus("正在核对私库权限并"+(mode==="push"?"合并同步":"读取摘录")+"……");
      try {
        var info=await api(endpoint);
        if(info.private!==true)throw Error("安全限制：目标仓库不是 Private，已阻止上传或读取。");
        var fileUrl=endpoint+"/contents/"+REMOTE_FILE;
        var file=null;
        try {file=await api(fileUrl);}catch(error){if(error.status!==404)throw error;}
        if(mode==="pull"&&!file)throw Error("私库尚无摘录文件，可先点击「合并并同步到私库」。");
        if(file && (file.size>MAX_REMOTE_BYTES || typeof file.content!=="string"))
          throw Error("远端摘录文件过大或不是普通文件，已停止同步。");
        var remote=file?normalizeRemote(JSON.parse(base64ToUtf8(file.content))):
          {notes:[],deleted:Object.create(null)};
        // 发送之前重新读取本地状态，避免把本页的其他操作遗漏。
        var merged=mergeStores({notes:notes,deleted:deleted},remote);
        if(mode==="push"){
          var content=JSON.stringify({version:2,notes:merged.notes,deleted:merged.deleted},null,2);
          if(new TextEncoder().encode(content).length>MAX_REMOTE_BYTES)
            throw Error("合并后的文件超过 3 MB，请先导出整理。");
          var body={message:"Backup private reading notes",content:utf8ToBase64(content)};
          if(file)body.sha=file.sha;
          await api(fileUrl,{method:"PUT",headers:Object.assign({},headers,{"Content-Type":"application/json"}),
            body:JSON.stringify(body)});
        }
        // 若同步过程中用户又新建/编辑了摘录，不要覆盖这些改动。
        var current=mergeStores({notes:notes,deleted:deleted},merged);
        if(!applyStore(current))throw Error("GitHub 操作完成，但本地保存失败：请先导出备份。");
        showStatus(mode==="push"?
          "私库同步完成，共 "+merged.notes.length+" 条摘录。若同步时又修改了笔记，请再次同步。":
          "已从私库合并到本机，目前共 "+current.notes.length+" 条摘录；不会删除本机独有内容。");
      } catch(error) {
        showStatus("同步失败："+(error&&error.message?error.message:"请检查网络与授权后重试"));
      } finally {push.disabled=false;pull.disabled=false;}
    }
    return pane;
  }
  function buildUI() {
    notebook=make("details","rn-notebook");
    notebook.id="reading-notes";
    summary=make("summary");notebook.append(summary);
    notebook.append(make("p","rn-hint",index?
      "本书各章节的摘录汇总于此。点击摘录可回到原文；默认保存在当前浏览器；可手动同步至私人仓库。":
      (reader && reader.querySelectorAll("[data-story-lang]").length === 1 ?
      "选中正文即可「划波浪线」或「写笔记」。点击摘录可回到原句；默认仅存本机，可手动私库同步。":
      "选中正文即可「划波浪线」或「写笔记」。中英文分别记载，点击摘录可回到原句；默认仅存本机，可手动私库同步。")));
    var actions=make("div","rn-actions");
    actions.append(btn("↓ 导出 JSON 备份",exportNotes));
    var picker=make("input");picker.type="file";picker.accept=".json,application/json";picker.hidden=true;
    picker.addEventListener("change",function(){if(picker.files&&picker.files[0])importNotes(picker.files[0]);picker.value="";});
    actions.append(btn("↑ 导入 JSON 备份",function(){picker.click();}));
    actions.append(picker);notebook.append(actions);
    notebook.append(syncPanel());
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
