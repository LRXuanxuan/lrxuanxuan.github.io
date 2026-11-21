/* Offline swatch library and this browser's pinned colors. */
(function () {
  'use strict';
  window.DrawingColorLibrary = function ({ swatches, getInk, setInk }) {
    const byId = id => document.getElementById(id);
    const palettes = window.DrawingPalettes;
    const library = byId('presetSwatches'), menu = byId('palettePreset'), search = byId('swatchSearch');
    const layoutButtons = Array.from(document.querySelectorAll('[data-palette-layout]'));
    const layoutKey = 'lrx-drawing-palette-layout-v1';
    let layout = 'compact';
    try {
      if (localStorage.getItem(layoutKey) === 'grouped') layout = 'grouped';
    } catch (_) {}
    const chart = palettes.find(p => p.id === 'sketch-chart') || palettes[0];
    const catalog = new Map();
    const storageKey = 'lrx-drawing-favorite-colors-v1';
    let favorites = [];
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved)) favorites = saved.filter(c => typeof c === 'string' && /^#[a-f0-9]{6}$/.test(c));
    } catch (_) {}

    const kitOptions = document.createElement('optgroup'), chartOptions = document.createElement('optgroup');
    kitOptions.label = 'Copic Sketch 原厂套装'; chartOptions.label = 'Copic Sketch 全系列';
    for (const palette of palettes) {
      const option = document.createElement('option');
      option.value = palette.id; option.textContent = palette.name;
      (palette.id === 'sketch-chart' ? chartOptions : kitOptions).append(option);
      for (const color of palette.swatches) catalog.set(color.code, color);
    }
    menu.append(kitOptions, chartOptions);
    const byHex = new Map(Array.from(catalog.values(), color => [color.hex, color]));

    function makeRow(group) {
      const row = document.createElement('div'), chips = document.createElement('div');
      row.className = 'marker-row';
      if (group.name) {
        const label = document.createElement('span');
        label.textContent = group.name; row.append(label);
      }
      chips.className = 'marker-chips';
      group.swatches.forEach(color => {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = color.code; button.dataset.color = color.hex;
        button.title = [...new Set([color.code, color.name, color.officialName, color.hex.toUpperCase()])].join(' · ');
        button.setAttribute('aria-label', button.title);
        button.setAttribute('aria-pressed', String(color.hex === getInk()));
        button.style.setProperty('--swatch', color.hex);
        button.addEventListener('click', () => setInk(color.hex, true));
        chips.append(button);
      });
      row.append(chips); return row;
    }
    function render() {
      const preset = palettes.find(p => p.id === menu.value) || palettes[0];
      const query = search.value.trim().toLowerCase().replace(/[-\s]/g, '');
      const groups = query ? chart.groups.map(group => ({
        name: group.name,
        swatches: group.swatches.filter(c =>
          [c.code, c.name, c.officialName, c.family, c.hex].some(value =>
            value.toLowerCase().replace(/[-\s]/g, '').includes(query)))
      })).filter(group => group.swatches.length) : preset.groups;
      const colors = groups.flatMap(group => group.swatches);
      const rows = layout === 'compact' ? [{ name: '', swatches: colors }] : groups;
      library.classList.add('marker-library');
      library.replaceChildren(); library.scrollTop = 0;
      rows.forEach(group => library.append(makeRow(group)));
      layoutButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.paletteLayout === layout)));
      byId('paletteDescription').textContent = query
        ? (colors.length ? '全部马克笔 · 找到 ' + colors.length + ' 色' : '未找到色号，可试试 B21 或「天蓝」。')
        : preset.description || '';
      const source = byId('swatchSource');
      source.href = query ? chart.source : preset.source;
      source.textContent = (query || preset.id === 'sketch-chart' ? 'Copic 官方色卡' : '核对原厂套装') + ' ↗ · 屏幕近似色';
    }
    function syncInk() {
      const hex = getInk(), color = byHex.get(hex), saved = favorites.includes(hex);
      byId('inkReadout').textContent = color ? color.code + ' · ' + color.name : hex.toUpperCase();
      byId('rememberColor').textContent = saved ? '移出收藏' : '收藏当前色';
      byId('rememberColor').title = (saved ? '移除 ' : '在此浏览器收藏 ') + hex.toUpperCase();
    }
    menu.addEventListener('change', () => { search.value = ''; render(); });
    search.addEventListener('input', render);
    layoutButtons.forEach(button => button.addEventListener('click', () => {
      if (layout === button.dataset.paletteLayout) return;
      layout = button.dataset.paletteLayout;
      try { localStorage.setItem(layoutKey, layout); } catch (_) {}
      render();
    }));
    const modes = Array.from(document.querySelectorAll('[data-color-mode]'));
    modes.forEach(mode => mode.addEventListener('click', () => {
      modes.forEach(button => {
        const active = button === mode;
        byId(button.dataset.colorMode).hidden = !active;
        button.setAttribute('aria-pressed', String(active));
      });
    }));
    byId('rememberColor').addEventListener('click', () => {
      const hex = getInk();
      favorites = favorites.includes(hex) ? favorites.filter(c => c !== hex) : [hex, ...favorites];
      try { localStorage.setItem(storageKey, JSON.stringify(favorites)); } catch (_) {}
      swatches(byId('savedSwatches'), favorites); syncInk();
    });
    swatches(byId('savedSwatches'), favorites); render(); syncInk();
    return { syncInk };
  };
})();

