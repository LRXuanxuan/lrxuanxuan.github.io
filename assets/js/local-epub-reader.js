/* 本机 EPUB 文字阅读器：不发送文件、不依赖第三方 ZIP 库，仅展示纯文本。 */
(function () {
  "use strict";
  var input = document.getElementById("boy-dog-file");
  var status = document.getElementById("boy-dog-status");
  var nav = document.getElementById("boy-dog-chapters");
  var root = document.getElementById("stapledon-reader");
  if (!input || !status || !nav || !root) return;
  var MAX_FILE = 8 * 1024 * 1024;
  var MAX_ENTRY = 4 * 1024 * 1024;
  function fail(message) { throw new Error(message); }
  function read16(view, i) { return view.getUint16(i, true); }
  function read32(view, i) { return view.getUint32(i, true); }
  function zipEntries(buffer) {
    var view = new DataView(buffer), bytes = new Uint8Array(buffer);
    var end = -1;
    for (var i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
      if (read32(view, i) === 0x06054b50) { end = i; break; }
    }
    if (end < 0 || read16(view, end + 4) !== 0 || read16(view, end + 6) !== 0)
      fail("EPUB 压缩目录无效或包含多个磁盘卷。");
    var count = read16(view, end + 10), offset = read32(view, end + 16);
    if (count > 2000 || offset >= buffer.byteLength) fail("EPUB 目录数量或位置异常。");
    var entries = new Map(), decoder = new TextDecoder("utf-8");
    for (var k = 0; k < count; k++) {
      if (offset + 46 > buffer.byteLength || read32(view, offset) !== 0x02014b50)
        fail("EPUB 目录损坏。");
      var method = read16(view, offset + 10), size = read32(view, offset + 20);
      var length = read32(view, offset + 24), n = read16(view, offset + 28);
      var x = read16(view, offset + 30), c = read16(view, offset + 32);
      var local = read32(view, offset + 42);
      if (offset + 46 + n + x + c > buffer.byteLength) fail("EPUB 文件名长度异常。");
      var name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + n));
      if (name && !name.includes("..") && !name.startsWith("/") && !entries.has(name))
        entries.set(name, {method:method,size:size,length:length,local:local,flags:read16(view,offset+8)});
      offset += 46 + n + x + c;
    }
    async function get(name) {
      var e = entries.get(name);
      if (!e) fail("EPUB 缺少内容文件：" + name);
      if (e.size > MAX_ENTRY || e.length > MAX_ENTRY || (e.flags & 1))
        fail("EPUB 内容过大或已加密。");
      var at = e.local;
      if (at + 30 > buffer.byteLength || read32(view, at) !== 0x04034b50)
        fail("EPUB 压缩数据损坏。");
      at += 30 + read16(view, at + 26) + read16(view, at + 28);
      if (at + e.size > buffer.byteLength) fail("EPUB 数据长度异常。");
      var raw = bytes.subarray(at, at + e.size);
      if (e.method === 0) return decoder.decode(raw);
      if (e.method !== 8 || typeof DecompressionStream === "undefined")
        fail("浏览器不支持这种 EPUB 解压格式；请使用较新的 Chrome、Firefox 或 Safari。");
      var stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      var result = await new Response(stream).arrayBuffer();
      if (result.byteLength > MAX_ENTRY) fail("解压后的正文过大。");
      return decoder.decode(result);
    }
    return {get:get};
  }
  function xml(source) {
    var doc = new DOMParser().parseFromString(source, "application/xml");
    if (doc.querySelector("parsererror")) fail("EPUB 的 XML 格式有误。");
    return doc;
  }
  function joinPath(base, name) {
    var parts = (base + name).split("/"), out = [];
    parts.forEach(function (part) {
      if (!part || part === ".") return;
      if (part === "..") out.pop(); else out.push(part);
    });
    return out.join("/");
  }
  async function parseBook(file) {
    if (!file || file.size > MAX_FILE) fail("请选择不大于 8 MB 的 EPUB 文件。");
    var zip = zipEntries(await file.arrayBuffer());
    var container = xml(await zip.get("META-INF/container.xml"));
    var rootfile = container.getElementsByTagName("rootfile")[0];
    if (!rootfile) fail("没有找到 EPUB 的目录文件。");
    var opfPath = rootfile.getAttribute("full-path");
    if (!opfPath) fail("EPUB 缺少目录路径。");
    var opf = xml(await zip.get(opfPath));
    var title = Array.from(opf.getElementsByTagName("*")).find(function (e) {
      return e.localName === "title";
    });
    var creator = Array.from(opf.getElementsByTagName("*")).find(function (e) {
      return e.localName === "creator";
    });
    if (!title || !/a boy and his dog/i.test(title.textContent) ||
        !creator || !/ellison/i.test(creator.textContent))
      fail("这不是《A Boy and His Dog》的 EPUB；请重新选择对应原文。");
    var base = opfPath.includes("/") ? opfPath.slice(0,opfPath.lastIndexOf("/") + 1) : "";
    var manifest = new Map();
    Array.from(opf.getElementsByTagName("item")).forEach(function (item) {
      manifest.set(item.getAttribute("id"), {
        href:item.getAttribute("href") || "",
        type:item.getAttribute("media-type") || ""
      });
    });
    var spine = Array.from(opf.getElementsByTagName("itemref")), pieces = [];
    for (var k = 0; k < spine.length; k++) {
      var item = manifest.get(spine[k].getAttribute("idref"));
      if (!item || !/html|xhtml/.test(item.type) || !item.href) continue;
      var doc = new DOMParser().parseFromString(await zip.get(joinPath(base, decodeURIComponent(item.href.split("#")[0]))), "text/html");
      doc.querySelectorAll("script,style,svg,nav,header,footer").forEach(function (el) { el.remove(); });
      var paragraphs = Array.from(doc.querySelectorAll("h1,h2,h3,h4,p,blockquote,li")).filter(function (el) {
        return !el.querySelector("h1,h2,h3,h4,p,blockquote,li");
      }).map(function (el) {
        return el.textContent.replace(/\s+/g, " ").trim();
      }).filter(Boolean);
      pieces.push.apply(pieces, paragraphs);
      if (pieces.length > 10000) fail("EPUB 段落数异常。");
    }
    if (pieces.length < 20) fail("未能从 EPUB 中读取到有效正文。");
    return pieces;
  }
  function render(pieces) {
    var container = document.createElement("div");
    container.dataset.storyLang = "en";
    var chapters = document.createDocumentFragment();
    var roman = /^(?:I|II|III|IV|V|VI|VII|VIII|IX|X)$/;
    var started = false, chapter = 0;
    pieces.forEach(function (part) {
      if (roman.test(part)) {
        started = true; chapter++;
        var h = document.createElement("h2");
        h.id = "chapter-" + chapter;
        h.textContent = "Part " + part;
        container.append(h);
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = part;
        chapters.append(a);
      } else if (started) {
        var p = document.createElement("p");
        p.textContent = part;
        container.append(p);
      }
    });
    if (chapter !== 10) fail("EPUB 章节划分与此版本不同（预期 I—X 十节），请检查文件版本。");
    root.replaceChildren(container);
    nav.replaceChildren(chapters);
    nav.hidden = false;
    status.textContent = "读取完成：十节原文已在本机展开。选择句子即可划线或写笔记。";
    window.dispatchEvent(new Event("reading-notes-content-ready"));
  }
  input.addEventListener("change", async function () {
    if (!input.files || !input.files[0]) return;
    status.textContent = "正在浏览器本地读取 EPUB……";
    try { render(await parseBook(input.files[0])); }
    catch (err) {
      status.textContent = "未能读取：" + (err && err.message ? err.message : "文件格式不支持");
    }
    input.value = "";
  });
})();
