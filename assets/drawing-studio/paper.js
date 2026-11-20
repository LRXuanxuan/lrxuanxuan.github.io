/* Small seamless tiles shared by paper samples, the viewport and exports. */
(() => {
  'use strict';
  const side = 256;
  const papers = {
    sketch: { label: '细纹素描纸', base: [242, 240, 229], seed: 134 },
    coldpress: { label: '冷压水彩纸', base: [244, 241, 231], seed: 291 },
    kraft: { label: '纤维牛皮纸', base: [193, 155, 108], seed: 421 },
    linen: { label: '亚麻布纹纸', base: [224, 217, 199], seed: 670 }
  };
  const tiles = new Map();
  const patterns = new WeakMap();
  const plain = ['white', 'warm', 'transparent', 'custom'];
  const valid = id => typeof id === 'string' && (plain.includes(id) || Object.hasOwn(papers, id));

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
    const { base, seed } = papers[id], random = randomSource(seed);
    const broad = noiseField(8, random), tooth = noiseField(48, random);
    const tile = document.createElement('canvas');
    tile.width = tile.height = side;
    const ctx = tile.getContext('2d'), image = ctx.createImageData(side, side);
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

  function fill(ctx, width, height, id, customColor) {
    if (id === 'transparent') return;
    if (Object.hasOwn(papers, id)) {
      if (!patterns.has(ctx)) patterns.set(ctx, new Map());
      const cache = patterns.get(ctx);
      if (!cache.has(id)) cache.set(id, ctx.createPattern(tileFor(id), 'repeat'));
      ctx.fillStyle = cache.get(id);
    } else {
      ctx.fillStyle = id === 'warm' ? '#f7f3e9' : id === 'custom' ? customColor : '#ffffff';
    }
    ctx.fillRect(0, 0, width, height);
  }

  function gallery(select, host) {
    const group = document.createElement('optgroup');
    group.label = '纸纹';
    for (const [id, paper] of Object.entries(papers)) {
      group.append(new Option(paper.label, id));
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.paper = id;
      const sample = document.createElement('canvas');
      sample.width = 100; sample.height = 30;
      sample.setAttribute('aria-hidden', 'true');
      sample.getContext('2d').drawImage(tileFor(id), 12, 12, 100, 30, 0, 0, 100, 30);
      button.append(sample, paper.label);
      button.addEventListener('click', () => {
        if (select.value === id) return;
        select.value = id;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      host.append(button);
    }
    select.append(group);
    const sync = () => {
      for (const button of host.children) button.setAttribute('aria-pressed', String(button.dataset.paper === select.value));
    };
    sync();
    select.addEventListener('change', sync);
    return sync;
  }
  const byId = id => document.getElementById(id);
  gallery(byId('newPaper'), byId('newPaperGallery'));
  const syncCurrent = gallery(byId('paper'), byId('paperGallery'));
  byId('newTransparent').addEventListener('change', e => { byId('newPaperSettings').hidden = e.target.checked; });
  window.DrawingPaper = { valid, fill, syncCurrent };
})();
