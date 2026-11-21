/* Offline swatch library and this browser's pinned colors. */
(function () {
  'use strict';
  window.DrawingColorLibrary = function ({ swatches, getInk, setInk, onPresetChange }) {
    const byId = id => document.getElementById(id);
    const palettes = window.DrawingPalettes;
    const library = byId('presetSwatches'), menu = byId('palettePreset');
    const layoutButtons = Array.from(document.querySelectorAll('[data-palette-layout]'));
    const layoutKey = 'lrx-drawing-palette-layout-v1';
    let layout = 'compact';
    try {
      if (localStorage.getItem(layoutKey) === 'grouped') layout = 'grouped';
    } catch (_) {}
    const catalog = new Map();
    const basics = window.DrawingPaletteMap.describe(palettes[0]).swatches.filter(color => color.base);
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
    basics.forEach(color => byHex.set(color.hex, color));

    function makeButton(color, label = color.code) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label; button.dataset.color = color.hex;
      button.title = [...new Set([color.code, color.name, color.officialName, color.hex.toUpperCase()].filter(Boolean))].join(' · ');
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-pressed', String(color.hex === getInk()));
      button.style.setProperty('--swatch', color.hex);
      button.addEventListener('click', () => setInk(color.hex, true));
      return button;
    }
    function makeRow(group) {
      const row = document.createElement('div'), chips = document.createElement('div');
      row.className = 'marker-row';
      if (group.name) {
        const label = document.createElement('span');
        label.textContent = group.name; row.append(label);
      }
      chips.className = 'marker-chips';
      group.swatches.forEach(color => chips.append(makeButton(color)));
      row.append(chips); return row;
    }
    function render() {
      const preset = palettes.find(p => p.id === menu.value) || palettes[0];
      const rows = layout === 'compact' ? [{ name: '', swatches: preset.swatches }] : preset.groups;
      library.classList.add('marker-library');
      library.replaceChildren(); library.scrollTop = 0;
      rows.forEach(group => library.append(makeRow(group)));
      layoutButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.paletteLayout === layout)));
      byId('paletteDescription').textContent = preset.description || '';
      const source = byId('swatchSource');
      source.href = preset.source;
      source.textContent = (preset.id === 'sketch-chart' ? 'Copic 官方色卡' : '核对原厂套装') + ' ↗ · 屏幕近似色';
    }
    function syncInk() {
      const hex = getInk(), color = byHex.get(hex), saved = favorites.includes(hex);
      byId('inkReadout').textContent = color ? color.code + ' · ' + color.name : hex.toUpperCase();
      byId('rememberColor').textContent = saved ? '移出收藏' : '收藏当前色';
      byId('rememberColor').title = (saved ? '移除 ' : '在此浏览器收藏 ') + hex.toUpperCase();
    }
    function setPreset(id, notify = true) {
      if (!palettes.some(p => p.id === id)) return false;
      if (menu.value === id) return true;
      menu.value = id; render();
      if (notify && onPresetChange) onPresetChange(id);
      return true;
    }
    menu.addEventListener('change', () => { render(); if (onPresetChange) onPresetChange(menu.value); });
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
    byId('baseSwatches').replaceChildren(...basics.map(color => makeButton(color, color.name)));
    swatches(byId('savedSwatches'), favorites); render(); syncInk();
    return { syncInk, setPreset, getPreset: () => menu.value };
  };
})();

