/* Paper formats use millimetres. Screen formats use native pixels. */
(() => {
  'use strict';
  const formats = [
    { id: 'a4', name: 'A4', mm: [210, 297] },
    { id: 'a5', name: 'A5', mm: [148, 210] },
    { id: 'a6', name: 'A6', mm: [105, 148] },
    { id: 'a3', name: 'A3', mm: [297, 420] },
    { id: 'iso-b5', name: 'B5 (ISO)', mm: [176, 250] },
    { id: 'letter', name: 'US Letter', mm: [215.9, 279.4] },
    { id: 'postcard', name: '明信片', mm: [148, 100] },
    { id: 'bookmark', name: '书签', mm: [50, 150] },
    { id: 'ctl472-landscape', name: 'CTL-472 横向', px: [1400, 875] },
    { id: 'ctl472-portrait', name: 'CTL-472 纵向', px: [875, 1400] },
    { id: 'classic', name: '练习画布', px: [1280, 960] },
    { id: 'hd', name: '全高清', px: [1920, 1080] },
    { id: 'square', name: '方形', px: [1200, 1200] },
    { id: 'pixel', name: '像素画', px: [256, 256] }
  ];
  const densities = [150, 200, 300];
  const paperPpi = value => densities.includes(value) ? value : null;
  const pixels = (format, ppi) => format.px || format.mm.map(mm => Math.round(mm * ppi / 25.4));
  const fits = ([w, h]) => Math.max(w, h) <= 4096 && w * h <= 12000000;
  const byId = id => document.getElementById(id);

  function sizeControls(prefix) {
    const host = byId(prefix + 'FormatControls');
    host.append(byId('canvasFormatTemplate').content.cloneNode(true));
    const field = key => host.querySelector('[data-format="' + key + '"]');
    const select = field('preset'), density = field('density'), note = field('note');
    const portrait = field('portrait'), landscape = field('landscape');
    const width = byId(prefix + 'Width'), height = byId(prefix + 'Height');
    const selected = () => formats.find(format => format.id === select.value);

    for (const [unit, title] of [['px', '屏幕与练习 · px'], ['mm', '纸张与文具 · mm']]) {
      const group = document.createElement('optgroup');
      group.label = title;
      for (const format of formats.filter(format => format[unit])) {
        group.append(new Option(format.name + ' · ' + format[unit].join(' × '), format.id));
      }
      select.append(group);
    }
    select.add(new Option('自定义像素', 'custom'));

    function refresh() {
      const format = selected(), paper = Boolean(format?.mm);
      const w = width.valueAsNumber, h = height.valueAsNumber;
      const orientable = w > 0 && h > 0 && w !== h;
      portrait.parentElement.hidden = !orientable;
      portrait.setAttribute('aria-pressed', String(h > w));
      landscape.setAttribute('aria-pressed', String(w > h));
      field('density-field').hidden = !paper;
      let message = '';
      if (paper) {
        const mm = [...format.mm].sort((a, b) => w < h ? a - b : b - a);
        message = 'PNG 将保留 ' + density.value + ' ppi，打印尺寸约 ' + mm.join(' × ') + ' mm。';
        if (density.querySelector(':disabled')) message += '此画幅最高支持 200 ppi。';
      }
      const error = w * h > 12000000 ? '画布总像素不能超过 1200 万。' : '';
      width.setCustomValidity(error);
      note.textContent = error || message;
      note.hidden = !note.textContent;
    }

    function prepareDensity(format) {
      if (!format?.mm) return;
      let max = densities[0];
      for (const option of density.options) {
        option.disabled = !fits(pixels(format, +option.value));
        if (!option.disabled) max = +option.value;
      }
      if (+density.value > max) density.value = String(max);
    }

    function applyPreset(keepOrientation) {
      const format = selected();
      if (format) {
        prepareDensity(format);
        let [w, h] = pixels(format, +density.value);
        if (keepOrientation && (w > h) !== (width.valueAsNumber > height.valueAsNumber)) [w, h] = [h, w];
        width.value = w;
        height.value = h;
      }
      refresh();
    }

    select.addEventListener('change', () => applyPreset(false));
    density.addEventListener('change', () => applyPreset(true));
    for (const button of [portrait, landscape]) {
      button.addEventListener('click', () => {
        if ((button === landscape) !== (width.valueAsNumber > height.valueAsNumber)) {
          const oldWidth = width.value;
          width.value = height.value;
          height.value = oldWidth;
        }
        if (selected()?.px) sync(width.valueAsNumber, height.valueAsNumber, null);
        else refresh();
      });
    }
    for (const input of [width, height]) {
      input.addEventListener('input', () => {
        select.value = 'custom';
        refresh();
      });
    }

    // Old and screen projects have no specified print density.
    function sync(w, h, ppi) {
      width.value = w;
      height.value = h;
      select.value = 'custom';
      const matches = (format, rotated) => {
        if (Boolean(format.mm) !== Boolean(ppi)) return false;
        const [x, y] = pixels(format, ppi);
        return rotated ? x === h && y === w : x === w && y === h;
      };
      // Prefer the named orientation when a format has both portrait and landscape presets.
      const format = formats.find(format => matches(format, false)) || formats.find(format => matches(format, true));
      if (format) {
        select.value = format.id;
        if (ppi) density.value = String(ppi);
        prepareDensity(format);
      }
      refresh();
    }
    sync(width.valueAsNumber, height.valueAsNumber);
    return { sync, getPpi: () => selected()?.mm ? +density.value : null };
  }

  // Only the browser's own PNG encoder feeds this routine. Leave IDAT bytes untouched.
  async function setPngDensity(blob, ppi) {
    const ppm = Math.round(ppi / 0.0254);
    const chunk = new Uint8Array(21);
    const data = new DataView(chunk.buffer);
    data.setUint32(0, 9);
    chunk.set([112, 72, 89, 115], 4); // pHYs
    data.setUint32(8, ppm);
    data.setUint32(12, ppm);
    chunk[16] = 1; // pixels per metre
    let crc = 0xffffffff;
    for (const byte of chunk.subarray(4, 17)) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    data.setUint32(17, ~crc);
    for (let offset = 8; offset + 12 <= blob.size;) {
      const header = new DataView(await blob.slice(offset, offset + 8).arrayBuffer());
      const length = header.getUint32(0);
      const next = offset + length + 12;
      if (next > blob.size) break;
      const type = header.getUint32(4);
      if (type === 0x70485973 || type === 0x49444154) { // replace pHYs or insert before IDAT
        const tail = type === 0x70485973 ? next : offset;
        return new Blob([blob.slice(0, offset), chunk, blob.slice(tail)], { type: 'image/png' });
      }
      offset = next;
    }
    throw new Error('PNG 像素密度写入失败，请重试导出。');
  }

  const creation = sizeControls('new'), resize = sizeControls('canvas');
  window.DrawingCanvasPresets = {
    syncCanvas: resize.sync, newPpi: creation.getPpi, resizePpi: resize.getPpi, paperPpi, setPngDensity
  };
})();
