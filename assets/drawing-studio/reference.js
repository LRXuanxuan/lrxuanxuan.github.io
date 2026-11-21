/* Local reference rendering. PDF.js is loaded only after a PDF is selected. */
(function (root) {
  'use strict';
  var script = document.currentScript;
  var PDF_BASE = new URL('vendor/pdfjs/', script && script.src ? script.src : new URL('assets/drawing-studio/reference.js', document.baseURI)).href;
  var pdfModule, MAX_SIDE = 1600, MODES = ['original', 'gray', 'color', 'line', 'copic'];
  var DEFAULT_PALETTE = 'sketch36-set';
  var EMBED_PDF_BYTES = 80 * 1024 * 1024, MAX_PDF_BYTES = 1024 * 1024 * 1024;
  var yieldFrame = function () { return new Promise(function (resolve) { setTimeout(resolve, 0); }); };
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function context(c) { return c.getContext('2d', { willReadFrequently: true }); }
  function hex(rgb) { return '#' + rgb.map(function (v) { return Math.round(v).toString(16).padStart(2, '0'); }).join(''); }
  function grayValue(r, g, b) { return Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722); }
  function validPalette(values) { return Array.isArray(values) ? values.filter(function (v) { return typeof v === 'string' && /^#[a-f0-9]{6}$/i.test(v); }).slice(0, 32) : []; }
  function findPalette(id) { return (root.DrawingPalettes || []).find(function (preset) { return preset.id === id; }); }
  function paletteId(id) { return findPalette(id) ? id : DEFAULT_PALETTE; }
  function describePalette(id) {
    var preset = findPalette(id);
    return preset && root.DrawingPaletteMap ? root.DrawingPaletteMap.describe(preset) : { id: id, name: preset ? preset.name : '', method: '', swatches: [] };
  }
  function copicView(source, id) {
    var preset = findPalette(id);
    if (!preset || !root.DrawingPaletteMap) throw new Error('色卡概括组件未加载完整，请刷新页面。');
    var input = context(source).getImageData(0, 0, source.width, source.height);
    var mapped = root.DrawingPaletteMap.map(input, preset), out = canvas(source.width, source.height);
    context(out).putImageData(new ImageData(mapped.data, out.width, out.height), 0, 0);
    return { canvas: out, swatches: mapped.swatches, palette: mapped.swatches.map(function (color) { return color.hex; }) };
  }
  function blob(c) { return new Promise(function (resolve, reject) { c.toBlob(function (b) { if (b) resolve(b); else reject(new Error('参考图编码失败。')); }, 'image/png'); }); }
  function fitImage(image, smoothing) {
    var w = image.naturalWidth || image.width, h = image.naturalHeight || image.height;
    if (!w || !h) throw new Error('图片尺寸无效。');
    var scale = Math.min(1, MAX_SIDE / Math.max(w, h));
    var c = canvas(Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale)));
    var ctx = context(c); ctx.imageSmoothingEnabled = smoothing !== false;
    ctx.drawImage(image, 0, 0, c.width, c.height); return c;
  }
  function decodeImage(file, smoothing) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), image = new Image();
      image.onload = function () { URL.revokeObjectURL(url); try { resolve(fitImage(image, smoothing)); } catch (e) { reject(e); } };
      image.onerror = function () { URL.revokeObjectURL(url); reject(new Error('这张图片无法解码，请换用 PNG、JPEG、WebP 或浏览器支持的图片。')); };
      image.src = url;
    });
  }
  function box(points) {
    var lo = [255, 255, 255], hi = [0, 0, 0], total = 0;
    points.forEach(function (p) { total += p[3]; for (var j = 0; j < 3; j++) { lo[j] = Math.min(lo[j], p[j]); hi[j] = Math.max(hi[j], p[j]); } });
    var ranges = hi.map(function (v, j) { return v - lo[j]; });
    var axis = ranges.indexOf(Math.max.apply(null, ranges));
    return { points: points, count: total, axis: axis, spread: ranges[axis] };
  }
  // A weighted median-cut palette keeps small warm/cool accents represented.
  function extractColors(data, count) {
    var d = data.data, bins = new Map(), step = Math.max(1, Math.floor(data.width * data.height / 50000));
    for (var i = 0; i < d.length; i += 4 * step) {
      if (d[i + 3] < 24) continue;
      var key = (d[i] >> 3) * 1024 + (d[i + 1] >> 3) * 32 + (d[i + 2] >> 3), v = bins.get(key), weight = d[i + 3] / 255;
      if (!v) { v = [0, 0, 0, 0]; bins.set(key, v); }
      v[0] += d[i] * weight; v[1] += d[i + 1] * weight; v[2] += d[i + 2] * weight; v[3] += weight;
    }
    var points = Array.from(bins.values(), function (v) { return [v[0] / v[3], v[1] / v[3], v[2] / v[3], v[3]]; });
    if (!points.length) return [[255, 255, 255]];
    var boxes = [box(points)];
    while (boxes.length < count) {
      var selected = -1, score = -1;
      boxes.forEach(function (b, index) { var s = b.spread * Math.sqrt(b.count); if (b.points.length > 1 && s > score) { score = s; selected = index; } });
      if (selected < 0) break;
      var b = boxes.splice(selected, 1)[0]; b.points.sort(function (a, z) { return a[b.axis] - z[b.axis]; });
      var sum = 0, cut = 1;
      for (var p = 0; p < b.points.length - 1; p++) { sum += b.points[p][3]; cut = p + 1; if (sum >= b.count / 2) break; }
      boxes.push(box(b.points.slice(0, cut)), box(b.points.slice(cut)));
    }
    var colors = boxes.map(function (b) {
      var sum = [0, 0, 0]; b.points.forEach(function (p) { for (var j = 0; j < 3; j++) sum[j] += p[j] * p[3]; });
      return sum.map(function (v) { return Math.round(v / b.count); });
    });
    return colors.sort(function (a, b) { return grayValue.apply(null, a) - grayValue.apply(null, b); });
  }
  function colorView(source, count) {
    var src = context(source).getImageData(0, 0, source.width, source.height), colors = extractColors(src, count);
    var lut = new Uint8Array(32768), out = canvas(source.width, source.height), ctx = context(out), data = ctx.createImageData(out.width, out.height);
    for (var key = 0; key < 32768; key++) {
      var r = (key >> 10) * 8 + 4, g = ((key >> 5) & 31) * 8 + 4, b = (key & 31) * 8 + 4, best = Infinity, index = 0;
      for (var c = 0; c < colors.length; c++) {
        var dr = r - colors[c][0], dg = g - colors[c][1], db = b - colors[c][2];
        var dist = 0.25 * dr * dr + 0.5 * dg * dg + 0.25 * db * db;
        if (dist < best) { best = dist; index = c; }
      }
      lut[key] = index;
    }
    for (var i = 0; i < src.data.length; i += 4) {
      var p = colors[lut[(src.data[i] >> 3) * 1024 + (src.data[i + 1] >> 3) * 32 + (src.data[i + 2] >> 3)]];
      data.data[i] = p[0]; data.data[i + 1] = p[1]; data.data[i + 2] = p[2]; data.data[i + 3] = src.data[i + 3];
    }
    ctx.putImageData(data, 0, 0); return { canvas: out, palette: colors.map(hex) };
  }
  function grayView(source, count) {
    var src = context(source).getImageData(0, 0, source.width, source.height), hist = new Float64Array(256);
    for (var i = 0; i < src.data.length; i += 4) if (src.data[i + 3] > 23) hist[grayValue(src.data[i], src.data[i + 1], src.data[i + 2])] += src.data[i + 3] / 255;
    var centers = Array.from({ length: count }, function (_, j) { return j * 255 / (count - 1); }), lut = new Uint8Array(256);
    for (var pass = 0; pass < 10; pass++) {
      var sums = new Float64Array(count), counts = new Float64Array(count);
      for (var g = 0; g < 256; g++) {
        var best = 0; for (var c = 1; c < count; c++) if (Math.abs(g - centers[c]) < Math.abs(g - centers[best])) best = c;
        lut[g] = best; sums[best] += hist[g] * g; counts[best] += hist[g];
      }
      for (var j = 0; j < count; j++) if (counts[j]) centers[j] = sums[j] / counts[j];
    }
    var colors = centers.map(Math.round), used = new Set(), out = canvas(source.width, source.height), ctx = context(out), data = ctx.createImageData(out.width, out.height);
    for (var q = 0; q < src.data.length; q += 4) {
      var v = colors[lut[grayValue(src.data[q], src.data[q + 1], src.data[q + 2])]];
      data.data[q] = data.data[q + 1] = data.data[q + 2] = v; data.data[q + 3] = src.data[q + 3];
      if (src.data[q + 3] > 23) used.add(v);
    }
    ctx.putImageData(data, 0, 0); return { canvas: out, palette: Array.from(used).sort(function (a, b) { return a - b; }).map(function (v) { return hex([v, v, v]); }) };
  }
  function lineView(source) {
    var w = source.width, h = source.height, n = w * h, src = context(source).getImageData(0, 0, w, h);
    var gray = new Float32Array(n), temp = new Float32Array(n), magnitude = new Float32Array(n), direction = new Uint8Array(n), hist = new Uint32Array(512);
    for (var p = 0, q = 0; p < n; p++, q += 4) gray[p] = grayValue(src.data[q], src.data[q + 1], src.data[q + 2]) * src.data[q + 3] / 255 + 255 - src.data[q + 3];
    var kernel = [1, 4, 6, 4, 1];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var v = 0; for (var k = -2; k <= 2; k++) v += gray[y * w + Math.max(0, Math.min(w - 1, x + k))] * kernel[k + 2]; temp[y * w + x] = v / 16; }
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) { var vv = 0; for (var kk = -2; kk <= 2; kk++) vv += temp[Math.max(0, Math.min(h - 1, yy + kk)) * w + xx] * kernel[kk + 2]; gray[yy * w + xx] = vv / 16; }
    var candidates = 0;
    for (var sy = 1; sy < h - 1; sy++) for (var sx = 1; sx < w - 1; sx++) {
      var i = sy * w + sx;
      var gx = -gray[i - w - 1] + gray[i - w + 1] - 2 * gray[i - 1] + 2 * gray[i + 1] - gray[i + w - 1] + gray[i + w + 1];
      var gy = -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
      var m = Math.hypot(gx, gy); magnitude[i] = m;
      if (m > 10) { hist[Math.min(511, Math.round(m))]++; candidates++; }
      var a = (Math.atan2(gy, gx) * 180 / Math.PI + 180) % 180;
      direction[i] = a < 22.5 || a >= 157.5 ? 0 : a < 67.5 ? 1 : a < 112.5 ? 2 : 3;
    }
    var cumulative = 0, threshold = 20;
    for (var b = 11; b < 512; b++) { cumulative += hist[b]; if (cumulative >= candidates * 0.55) { threshold = Math.max(20, b); break; } }
    var out = canvas(w, h), ctx = context(out), data = ctx.createImageData(w, h), offsets = [1, w + 1, w, w - 1];
    for (var oy = 0; oy < h; oy++) for (var ox = 0; ox < w; ox++) {
      var at = oy * w + ox, offset = offsets[direction[at]], edge = ox > 0 && ox < w - 1 && oy > 0 && oy < h - 1 && magnitude[at] >= threshold && magnitude[at] >= magnitude[at - offset] && magnitude[at] > magnitude[at + offset];
      var color = edge ? 0 : 255, o = at * 4;
      data.data[o] = data.data[o + 1] = data.data[o + 2] = color; data.data[o + 3] = src.data[o + 3];
    }
    ctx.putImageData(data, 0, 0); return out;
  }
  async function loadPDFLibrary() {
    if (!pdfModule) pdfModule = import(PDF_BASE + 'pdf.mjs').then(function (pdf) { pdf.GlobalWorkerOptions.workerSrc = PDF_BASE + 'pdf.worker.mjs'; return pdf; }).catch(function () { pdfModule = null; throw new Error('PDF 组件没有加载成功，请联网刷新后重试；图片参考仍可使用。'); });
    return pdfModule;
  }
  function disposePDF(pdf) {
    // PDF.js 6 exposes teardown on the public loadingTask, not the document.
    if (!pdf || !pdf.loadingTask) return Promise.resolve();
    return Promise.resolve(pdf.loadingTask.destroy()).catch(function () {});
  }
  function Reference(options) {
    this.options = options || {}; this.name = ''; this.page = 0; this.pageCount = 0; this.mode = 'original'; this.count = 8;
    this.paletteId = paletteId(this.options.paletteId); this.paletteSwatches = [];
    this.views = {}; this.palettes = { color: [], gray: [], copic: [] }; this.importedStudy = false; this.sourceMode = '';
    this._source = null; this._pdf = null; this._externalPDF = null; this._task = null; this._renderTask = null; this._generation = 0; this._dead = false;
  }
  Reference.prototype._status = function (text) { if (this.options.onStatus) this.options.onStatus(text); };
  Reference.prototype._change = function () { if (this.options.onChange) this.options.onChange(this.getInfo()); };
  Reference.prototype._fail = function (error) { var message = error && error.message || '参考载入失败。'; if (this.options.onError) this.options.onError(message); return error instanceof Error ? error : new Error(message); };
  Reference.prototype._cancel = function () {
    if (this._renderTask) { this._renderTask.cancel(); this._renderTask = null; }
    if (this._task) { Promise.resolve(this._task.destroy()).catch(function () {}); this._task = null; }
    return ++this._generation;
  };
  Reference.prototype._current = function (token) { return !this._dead && token === this._generation; };
  // The parser requests just the file ranges it needs. The worker keeps its own
  // document buffers; avoid a second file-sized ArrayBuffer on the UI thread.
  Reference.prototype._openPDF = async function (file, token) {
    if (file.size > MAX_PDF_BYTES) throw new Error('PDF 超过 1 GiB，请拆分后载入。');
    var library = await loadPDFLibrary();
    if (!this._current(token)) return null;
    var chunkSize = 64 * 1024, initial = new Uint8Array(await file.slice(0, chunkSize).arrayBuffer());
    if (!this._current(token)) return null;
    var stopped = false, range = new library.PDFDataRangeTransport(file.size, initial, true);
    var rejectRead, readFailure = new Promise(function (_, reject) { rejectRead = reject; });
    range.abort = function () { stopped = true; };
    range.requestDataRange = async function (begin, end) {
      try {
        var chunk = new Uint8Array(await file.slice(begin, end).arrayBuffer());
        if (chunk.length !== end - begin) throw new Error('PDF 数据读取不完整。');
        if (!stopped) range.onDataRange(begin, chunk);
      } catch (_) {
        if (!stopped) {
          rejectRead(new Error('无法继续读取本机 PDF，请重新选择原文件。'));
          stopped = true; task.destroy().catch(function () {});
        }
      }
    };
    var task = library.getDocument({ range: range, rangeChunkSize: chunkSize, disableStream: true, disableAutoFetch: true,
      cMapUrl: PDF_BASE + 'cmaps/', cMapPacked: true, standardFontDataUrl: PDF_BASE + 'standard_fonts/',
      wasmUrl: PDF_BASE + 'wasm/', iccUrl: PDF_BASE + 'iccs/', disableWorkerRendering: true });
    this._task = task;
    var password = new Promise(function (_, reject) {
      task.onPassword = function () { reject(new Error('这份 PDF 需要密码，请先在本机解锁并另存一份后再载入。')); };
    });
    var pdf = await Promise.race([task.promise, password, readFailure]);
    if (this._task === task) this._task = null;
    if (!this._current(token)) { await disposePDF(pdf); return null; }
    return pdf;
  };
  Reference.prototype._prepare = function (original) {
    var color = colorView(original, this.count), gray = grayView(original, this.count);
    return { views: { original: original, color: color.canvas, gray: gray.canvas }, palettes: { color: color.palette, gray: gray.palette } };
  };
  Reference.prototype._install = function (prepared) {
    if (this.mode === 'line' && !prepared.views.line) prepared.views.line = lineView(prepared.views.original);
    if (this.mode === 'copic' && !prepared.views.copic) {
      var mapped = copicView(prepared.views.original, this.paletteId);
      prepared.views.copic = mapped.canvas; prepared.palettes.copic = mapped.palette; prepared.paletteSwatches = mapped.swatches;
    }
    this.views = prepared.views; this.palettes = prepared.palettes; this.palettes.copic = this.palettes.copic || [];
    this.paletteSwatches = prepared.paletteSwatches || [];
  };
  Reference.prototype._ensureCopic = function () {
    if (!this.views.original || this.views.copic) return;
    var mapped = copicView(this.views.original, this.paletteId);
    this.views.copic = mapped.canvas; this.palettes.copic = mapped.palette; this.paletteSwatches = mapped.swatches;
  };
  Reference.prototype._pageCanvas = async function (pdf, number, token) {
    var page = await pdf.getPage(number);
    if (!this._current(token)) { page.cleanup(); return null; }
    var viewport = page.getViewport({ scale: 1 }), scale = Math.min(2, MAX_SIDE / Math.max(viewport.width, viewport.height));
    viewport = page.getViewport({ scale: scale });
    if (!Number.isFinite(viewport.width) || !Number.isFinite(viewport.height) || viewport.width < 1 || viewport.height < 1) { page.cleanup(); throw new Error('这页 PDF 的尺寸无效。'); }
    var c = canvas(Math.max(1, Math.ceil(viewport.width)), Math.max(1, Math.ceil(viewport.height)));
    var task = page.render({ canvasContext: context(c), viewport: viewport, background: '#ffffff', annotationMode: 0 }); this._renderTask = task;
    try { await task.promise; } finally { if (this._renderTask === task) this._renderTask = null; page.cleanup(); }
    return this._current(token) ? c : null;
  };
  Reference.prototype.load = async function (file, relink) {
    if (!file || typeof file.arrayBuffer !== 'function') throw this._fail(new Error('请选择本机图片或 PDF。'));
    var token = this._cancel(), nextPDF = null;
    var isPDF = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
    this._status(isPDF ? '正在本机读取 PDF…' : '正在提取参考色卡…');
    try {
      var original;
      if (relink && (!isPDF || this._pdf || !this._externalPDF || file.size !== this._externalPDF.size)) throw new Error('请选择这份工程原先使用的 PDF。');
      if (isPDF) {
        nextPDF = await this._openPDF(file, token); if (!nextPDF) return false;
        if (relink) {
          if (this._externalPDF.fingerprint !== nextPDF.fingerprints[0] || this.pageCount !== nextPDF.numPages) throw new Error('PDF 与保存的参考不匹配，请选择原文件。');
          this._pdf = nextPDF; this._source = file;
          this._status(''); this._change(); return true;
        }
        original = await this._pageCanvas(nextPDF, 1, token);
      } else original = await decodeImage(file);
      if (!original || !this._current(token)) { await disposePDF(nextPDF); return false; }
      await yieldFrame(); if (!this._current(token)) { await disposePDF(nextPDF); return false; }
      var prepared = this._prepare(original), oldPDF = this._pdf;
      this._pdf = nextPDF; this._source = file; this.name = file.name || (isPDF ? 'PDF 参考' : '图片参考');
      this._externalPDF = nextPDF && file.size > EMBED_PDF_BYTES ? { size: file.size, fingerprint: nextPDF.fingerprints[0] } : null;
      this.page = 1; this.pageCount = nextPDF ? nextPDF.numPages : 1; this.importedStudy = false; this.sourceMode = ''; this._install(prepared);
      disposePDF(oldPDF);
      this._status(''); this._change(); return true;
    } catch (error) {
      if (nextPDF !== this._pdf) disposePDF(nextPDF);
      if (this._current(token)) {
        if (this._task) { Promise.resolve(this._task.destroy()).catch(function () {}); this._task = null; }
        this._status('');
        if (/InvalidPDF|Invalid PDF|MissingPDF/.test(error.name + ' ' + error.message)) error = new Error('这份 PDF 无法读取或已损坏，请换一个文件。');
        throw this._fail(error);
      }
      return false;
    }
  };
  Reference.prototype.setPage = async function (number) {
    if (!this._pdf) return false;
    number = Math.max(1, Math.min(this.pageCount, Math.round(Number(number) || 1)));
    // Even a request for the still-visible page supersedes an in-flight page.
    // getPage() may still be pending before a render task exists to cancel.
    var token = this._cancel();
    if (number === this.page) { this._status(''); return true; }
    this._status('正在渲染第 ' + number + ' 页…');
    try {
      var c = await this._pageCanvas(this._pdf, number, token);
      if (!c || !this._current(token)) return false;
      await yieldFrame(); if (!this._current(token)) return false;
      this._install(this._prepare(c)); this.page = number; this.importedStudy = false; this._status(''); this._change(); return true;
    } catch (error) { if (this._current(token)) { this._status(''); throw this._fail(error); } return false; }
  };
  Reference.prototype.setMode = function (mode) {
    if (MODES.indexOf(mode) < 0) return false;
    if (mode === 'line' && this.views.original && !this.views.line) this.views.line = lineView(this.views.original);
    if (mode === 'copic') this._ensureCopic();
    this.mode = mode; this._change(); return true;
  };
  Reference.prototype.setPalette = function (id) {
    if (!findPalette(id)) return false;
    if (id === this.paletteId) return true;
    var mapped = this.mode === 'copic' && this.views.original ? copicView(this.views.original, id) : null;
    this.paletteId = id;
    if (mapped) this.views.copic = mapped.canvas; else delete this.views.copic;
    this.palettes.copic = mapped ? mapped.palette : []; this.paletteSwatches = mapped ? mapped.swatches : [];
    this._change(); return true;
  };
  Reference.prototype.setCount = async function (number) {
    this.count = Math.max(2, Math.min(24, Math.round(Number(number) || 8)));
    if (!this.views.original) { this._change(); return; }
    var token = this._generation; this._status('正在重新归纳颜色…'); await yieldFrame();
    if (!this._current(token)) return;
    var prepared = this._prepare(this.views.original);
    if (this.views.line) prepared.views.line = this.views.line;
    if (this.views.copic) {
      prepared.views.copic = this.views.copic; prepared.palettes.copic = this.palettes.copic; prepared.paletteSwatches = this.paletteSwatches;
    }
    this._install(prepared);
    this.importedStudy = false; this._status(''); this._change();
  };
  Reference.prototype.getCanvas = function () { return this.views[this.mode] || this.views.original || null; };
  Reference.prototype.getInfo = function () {
    var c = this.views.original, preset = describePalette(this.paletteId);
    var swatches = c ? this.paletteSwatches : preset.swatches.filter(function (color) { return color.hex === '#000000' || color.hex === '#ffffff'; });
    return { name: this.name, page: this.page, pageCount: this.pageCount, isPDF: !!this._pdf, mode: this.mode, count: this.count, width: c ? c.width : 0, height: c ? c.height : 0,
      externalPDF: !!this._externalPDF,
      paletteId: this.paletteId, paletteName: preset.name, paletteMethod: preset.method,
      paletteSwatches: swatches.map(function (color) { return Object.assign({}, color); }),
      palettes: { color: this.palettes.color.slice(), gray: this.palettes.gray.slice(), copic: swatches.map(function (color) { return color.hex; }) }, importedStudy: this.importedStudy, sourceMode: this.sourceMode };
  };
  Reference.prototype.getSourceBlob = function () { return this._source; };
  Reference.prototype.exportBundle = async function () {
    if (!this.views.original) return null;
    var views = this.views, info = this.getInfo(), externalPDF = this._externalPDF, sourceFile = this._pdf && !externalPDF ? this._source : null, count = this.count;
    if (sourceFile && sourceFile.type !== 'application/pdf') sourceFile = new Blob([sourceFile], { type: 'application/pdf' });
    if (!views.line) views.line = lineView(views.original);
    var encoded = await Promise.all([blob(views.original), blob(views.gray), blob(views.color), blob(views.line)]);
    return { version: 1, name: info.name, original: encoded[0], views: { gray: encoded[1], color: encoded[2], line: encoded[3] }, palettes: { color: info.palettes.color, gray: info.palettes.gray },
      selectedMode: info.mode, paletteId: info.paletteId, page: info.page, pageCount: info.pageCount, sourceFile: sourceFile, externalPDF: externalPDF || null, importedStudy: info.importedStudy, sourceMode: info.sourceMode, count: count };
  };
  Reference.prototype.loadBundle = async function (bundle) {
    if (!bundle || bundle.version !== 1 || !(bundle.original instanceof Blob)) throw this._fail(new Error('参考包无效。'));
    var token = this._cancel(), nextPDF = null; this._status('正在接收练习参考…');
    try {
      var original = await decodeImage(bundle.original); if (!this._current(token)) return false;
      var views = { original: original }, keys = ['gray', 'color', 'line'];
      var decoded = await Promise.all(keys.map(function (key) { return bundle.views && bundle.views[key] instanceof Blob ? decodeImage(bundle.views[key], false) : Promise.resolve(null); }));
      if (!this._current(token)) return false;
      for (var i = 0; i < keys.length; i++) if (decoded[i]) {
        if (decoded[i].width !== original.width || decoded[i].height !== original.height) throw new Error('参考包中各模式的尺寸不一致。');
        views[keys[i]] = decoded[i];
      }
      this.count = Math.max(2, Math.min(24, Math.round(bundle.count || 8)));
      var prepared = (!views.gray || !views.color) ? this._prepare(original) : null;
      if (!views.gray) views.gray = prepared.views.gray;
      if (!views.color) views.color = prepared.views.color;
      var palettes = { gray: validPalette(bundle.palettes && bundle.palettes.gray), color: validPalette(bundle.palettes && bundle.palettes.color) };
      if (!palettes.gray.length) palettes.gray = grayView(original, this.count).palette;
      if (!palettes.color.length) palettes.color = colorView(original, this.count).palette;
      if (bundle.sourceFile instanceof Blob) {
        nextPDF = await this._openPDF(bundle.sourceFile, token); if (!nextPDF) return false;
      }
      var externalPDF = bundle.externalPDF;
      if (externalPDF && (!Number.isSafeInteger(externalPDF.size) || externalPDF.size < 1 || externalPDF.size > MAX_PDF_BYTES ||
          typeof externalPDF.fingerprint !== 'string' || !/^[0-9a-f]{1,128}$/i.test(externalPDF.fingerprint) ||
          !Number.isSafeInteger(bundle.pageCount) || bundle.pageCount < 1)) throw new Error('工程中的 PDF 关联信息无效。');
      var previousPDF = this._pdf; this._pdf = nextPDF; this._source = nextPDF ? bundle.sourceFile : bundle.original;
      this._externalPDF = nextPDF ? (bundle.sourceFile.size > EMBED_PDF_BYTES ? { size: bundle.sourceFile.size, fingerprint: nextPDF.fingerprints[0] } : null) : externalPDF || null;
      this.pageCount = nextPDF ? nextPDF.numPages : externalPDF ? bundle.pageCount : 1;
      this.name = bundle.name || '练习室参考'; this.page = Math.max(1, Math.min(this.pageCount, Math.round(bundle.page) || 1));
      this.mode = MODES.indexOf(bundle.selectedMode) >= 0 ? bundle.selectedMode : 'original';
      this.paletteId = paletteId(bundle.paletteId);
      this.importedStudy = bundle.importedStudy !== false; this.sourceMode = bundle.sourceMode || ''; this._install({ views: views, palettes: palettes });
      disposePDF(previousPDF);
      this._status(''); this._change(); return true;
    } catch (error) {
      if (nextPDF !== this._pdf) disposePDF(nextPDF);
      if (this._current(token)) { if (this._task) { Promise.resolve(this._task.destroy()).catch(function () {}); this._task = null; } this._status(''); throw this._fail(error); } return false;
    }
  };
  Reference.prototype.destroy = function () { this._cancel(); this._dead = true; disposePDF(this._pdf); this._pdf = null; this._externalPDF = null; this._source = null; this.views = {}; this.palettes = { color: [], gray: [], copic: [] }; this.paletteSwatches = []; };
  Reference.pdfAssets = PDF_BASE;
  root.DrawingReference = Reference;
})(window);
