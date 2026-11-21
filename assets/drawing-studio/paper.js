/* Small seamless tiles shared by paper samples, the viewport and exports. */
(() => {
  'use strict';
  const side = 256;
  const papers = {
    sketch: { label: '细纹素描纸', base: [242, 240, 229], seed: 134 },
    coldpress: { label: '冷压水彩纸', base: [244, 241, 231], seed: 291 },
    kraft: { label: '纤维牛皮纸', base: [193, 155, 108], seed: 421 },
    linen: { label: '亚麻布纹', base: [224, 217, 199], seed: 670 },
    laid: { label: '细帘水印', base: [224, 219, 206], seed: 816 },
    cotton: { label: '棉浆毛边纹', base: [230, 226, 213], seed: 819 },
    silk: { label: '丝绢斜纹', base: [224, 216, 202], seed: 923 }
  };
  if (window.DrawingPaperHeightMap) papers.paper001 = { label: '纤维压纹 · Paper 001', base: [224, 224, 224] };
  const tiles = new Map();
  const patterns = new WeakMap();
  const plain = ['white', 'warm', 'transparent', 'custom'];
  const textureExists = id => typeof id === 'string' && Object.hasOwn(papers, id);
  const hex = rgb => '#' + rgb.map(ch => ch.toString(16).padStart(2,'0')).join('');
  const percent = (v, fallback) => Number.isFinite(v) ? Math.min(100, Math.max(0, Math.round(v))) : fallback;
  function settings(source) {
    if (source.paperTexture === 'paper001' && !papers.paper001) throw new Error('本地 Paper 001 纹理文件未加载，请刷新后重试。');
    const legacy = source.paperTexture === undefined && textureExists(source.paper);
    const paper = legacy ? 'custom' : plain.includes(source.paper) ? source.paper : 'white';
    const paperColor = legacy ? hex(papers[source.paper].base) : paper === 'warm' ? '#f7f3e9'
      : typeof source.paperColor === 'string' && /^#[a-f0-9]{6}$/i.test(source.paperColor) && (paper === 'custom' || source.paperOpacity !== undefined) ? source.paperColor.toLowerCase() : '#ffffff';
    return { paper, paperColor, paperTexture: legacy ? source.paper : textureExists(source.paperTexture) ? source.paperTexture : 'none',
      paperOpacity: percent(source.paperOpacity, paper === 'transparent' ? 0 : 100), textureStrength: percent(source.textureStrength, 100) };
  }

  function randomSource(seed) {
    return () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  // The small grid wraps along both axes, including between the first and last tile.
  function noiseField(count, random) {
    const grid = Float32Array.from({ length: count * count }, () => random() - 0.5);
    const at = (i, j) => grid[(j % count) * count + i % count];
    return (x, y) => {
      const u = ((x + side) % side) * count / side, v = ((y + side) % side) * count / side;
      const i = Math.floor(u), j = Math.floor(v);
      const s = u - i, t = v - j, sx = s * s * (3 - 2 * s), sy = t * t * (3 - 2 * t);
      const top = at(i, j) * (1 - sx) + at(i + 1, j) * sx;
      const bottom = at(i, j + 1) * (1 - sx) + at(i + 1, j + 1) * sx;
      return top * (1 - sy) + bottom * sy;
    };
  }

  function addFibres(ctx, random, kraft) {
    const count = kraft ? 450 : 680;
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      const x = random() * side, y = random() * side, angle = random() * Math.PI;
      const length = kraft ? 2 + random() ** 2 * 13 : 0.8 + random() * 3;
      const dx = Math.cos(angle) * length, dy = Math.sin(angle) * length;
      ctx.lineWidth = 0.4 + random() * 0.7;
      ctx.strokeStyle = random() < 0.35 ? 'rgba(255,249,223,0.33)' : (kraft ? 'rgba(81,55,33,0.23)' : 'rgba(86,80,65,0.12)');
      ctx.beginPath();
      // Tile-edge crossings must reappear on the opposite side.
      for (const ox of [-side, 0, side]) {
        for (const oy of [0, -side]) {
          ctx.moveTo(x + ox, y + oy);
          ctx.lineTo(x + dx + ox, y + dy + oy);
        }
      }
      ctx.stroke();
    }
  }

  function tileFor(id) {
    if (tiles.has(id)) return tiles.get(id);
    const { base, seed } = papers[id];
    const tile = document.createElement('canvas');
    const map = id === 'paper001' ? window.DrawingPaperHeightMap : null;
    tile.width = map ? map.width : side;
    tile.height = map ? map.height : side;
    const ctx = tile.getContext('2d'), image = ctx.createImageData(tile.width, tile.height);
    if (id === 'paper001') {
      const samples = atob(map.data), width = tile.width, height = tile.height;
      if (samples.length !== width * height) throw new Error('Paper 001 纹理数据不完整。');
      let mean = 0;
      for (let i = 0; i < samples.length; i++) mean += samples.charCodeAt(i);
      mean /= samples.length;
      const at = (x, y) => samples.charCodeAt(((y + height) % height) * width + (x + width) % width);
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const shade = (at(x, y) - mean) * 0.17 + (at(x - 1, y - 1) - at(x + 1, y + 1)) * 0.35;
        const j = (y * width + x) * 4;
        image.data[j] = image.data[j + 1] = image.data[j + 2] = base[0] + shade;
        image.data[j + 3] = 255;
      }
      ctx.putImageData(image, 0, 0); tiles.set(id, tile); return tile;
    }
    const random = randomSource(seed), broad = noiseField(8, random), tooth = noiseField(48, random);
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const cloud = broad(x, y), grain = random() - 0.5, bump = tooth(x, y);
        let shade;
        switch (id) {
          case 'coldpress':
            shade = cloud * 13 + (bump - tooth(x - 1.3, y - 1.8)) * 49 + grain * 5;
            break;
          case 'kraft':
            shade = cloud * 17 + bump * 6 + grain * 12;
            break;
          case 'linen': {
            const step = 8, wave = Math.PI * 2 / step;
            const warp = Math.cos(wave * (x + cloud)), weft = Math.cos(wave * (y - cloud));
            const over = (Math.floor(x / step) + Math.floor(y / step)) % 2 === 0;
            shade = (over ? warp * 8 + weft * 3 : warp * 3 + weft * 8) + grain * 8 + cloud * 8;
            break;
          }
          case 'laid': {
            const ripple = Math.cos(Math.PI * (y + cloud * 0.8) / 2);
            const band = Math.cos(Math.PI * (x + bump * 0.6) / 32);
            shade = ripple * 5 + band ** 16 * 5 + cloud * 8 + bump * 6 + grain * 6;
            break;
          }
          case 'cotton':
            shade = cloud * 16 + bump * 16 + (bump - tooth(x + 1, y + 1.5)) * 15 + grain * 9;
            break;
          case 'silk': {
            const diag = Math.cos((x + y + cloud) * Math.PI / 3.2);
            const thread = Math.cos((y - x + bump) * Math.PI / 4);
            shade = diag * 5 + thread ** 3 * 4 + grain * 5 + cloud * 7;
            break;
          }
          default:
            shade = bump * 8 + grain * 14 + cloud * 6;
        }
        const offset = (y * side + x) * 4;
        image.data[offset] = base[0] + shade;
        image.data[offset + 1] = base[1] + shade;
        image.data[offset + 2] = base[2] + shade;
        image.data[offset + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    if (id === 'kraft' || id === 'sketch') addFibres(ctx, random, id === 'kraft');
    tiles.set(id, tile);
    return tile;
  }

  const reliefs = new Map();
  function relief(id) {
    if (reliefs.has(id)) return reliefs.get(id);
    const base = papers[id].base, source = tileFor(id), tile = document.createElement('canvas');
    tile.width = source.width; tile.height = source.height;
    const ctx = tile.getContext('2d');
    const img = source.getContext('2d').getImageData(0, 0, source.width, source.height), data = img.data;
    // Infer the minimum translucent highlight or shadow that reproduces each original fibre.
    for (let i = 0; i < data.length; i += 4) {
      let alpha = 0;
      for (let ch = 0; ch < 3; ch++) {
        const diff = data[i + ch] - base[ch];
        alpha = Math.max(alpha, diff > 0 ? diff / (255 - base[ch]) : -diff / base[ch]);
      }
      const a = Math.ceil(alpha * 255) / 255;
      for (let ch = 0; ch < 3; ch++) data[i + ch] = a ? base[ch] + (data[i + ch] - base[ch]) / a : 0;
      data[i + 3] = a * 255;
    }
    ctx.putImageData(img, 0, 0);
    reliefs.set(id, tile);
    return tile;
  }
  function renderTile(art) {
    const id = art.paperTexture;
    const native = art.paperOpacity === 100 && art.textureStrength === 100 && art.paperColor === hex(papers[id].base);
    return native ? tileFor(id) : relief(id);
  }
  function fill(ctx, width, height, art) {
    ctx.save();
    ctx.globalAlpha = art.paperOpacity / 100;
    ctx.fillStyle = art.paperColor;
    ctx.fillRect(0, 0, width, height);
    if (textureExists(art.paperTexture) && art.textureStrength > 0) {
      if (!patterns.has(ctx)) patterns.set(ctx, new Map());
      const cache = patterns.get(ctx), tile = renderTile(art);
      if (!cache.has(tile)) cache.set(tile, ctx.createPattern(tile, 'repeat'));
      ctx.fillStyle = cache.get(tile);
      ctx.globalAlpha = art.textureStrength / 100;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }
  function svgBackground(art, scaleX, scaleY) {
    let xml = '<rect width="100%" height="100%" fill="' + art.paperColor + '" fill-opacity="' + art.paperOpacity / 100 + '"/>';
    if (!textureExists(art.paperTexture) || !art.textureStrength) return xml;
    const tile = renderTile(art), data = tile.toDataURL();
    const w = tile.width * scaleX, h = tile.height * scaleY;
    return xml + '<defs><pattern id="paperGrain" patternUnits="userSpaceOnUse" width="' + w + '" height="' + h + '"><image href="' + data + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none"/></pattern></defs><rect width="100%" height="100%" fill="url(#paperGrain)" opacity="' + art.textureStrength / 100 + '"/>';
  }

  function gallery(select, host) {
    const group = document.createElement('optgroup');
    group.label = '纸纹';
    for (const [id, paper] of Object.entries(papers)) {
      group.append(new Option(paper.label, id));
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.paper = id;
      if (id === 'paper001') button.title = '取自 ambientCG「Paper 001」开放高度贴图（CC0）';
      const sample = document.createElement('canvas');
      sample.width = 100; sample.height = 30;
      sample.setAttribute('aria-hidden', 'true');
      const ctx = sample.getContext('2d');
      ctx.fillStyle = '#ecebe7'; ctx.fillRect(0, 0, 100, 30);
      ctx.drawImage(relief(id), 12, 12, 100, 30, 0, 0, 100, 30);
      button.append(sample, paper.label);
      button.addEventListener('click', () => {
        if (select.value === id) return;
        select.value = id;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      host.append(button);
    }
    select.append(group);
    const credit = document.createElement('p');
    credit.className = 'hint';
    const source = document.createElement('a');
    source.href = 'https://ambientcg.com/view?id=Paper001';
    source.target = '_blank'; source.rel = 'noopener';
    source.textContent = 'ambientCG · Paper 001';
    credit.append(source, '（CC0 1.0）');
    host.after(credit);
    const sync = () => {
      for (const button of host.children) button.setAttribute('aria-pressed', String(button.dataset.paper === select.value));
      credit.hidden = select.value !== 'paper001';
    };
    sync();
    select.addEventListener('change', sync);
    return sync;
  }
  const byId = id => document.getElementById(id);
  gallery(byId('newPaperTexture'), byId('newPaperGallery'));
  const syncCurrent = gallery(byId('paperTexture'), byId('paperGallery'));
  for (const [input, label] of [['newPaperOpacity', 'newPaperOpacityValue'], ['newTextureStrength', 'newTextureStrengthValue']]) {
    byId(input).addEventListener('input', () => { byId(label).value = byId(input).value + '%'; });
  }
  window.DrawingPaper = { settings, fill, svgBackground, syncCurrent };
})();
