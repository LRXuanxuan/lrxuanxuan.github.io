/* Local palette mapping. Oklab's public-domain sRGB matrices:
   https://bottosson.github.io/posts/oklab/#converting-from-linear-srgb-to-oklab */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DrawingPaletteMap = factory();
})(typeof window === 'object' ? window : this, function () {
  'use strict';
  const colorSets = new Set(['sketch12-set', 'sketch36-set', 'sketchcomic24-set', 'sketch-chart']);
  const linear = Float64Array.from({ length: 256 }, (_, i) => {
    const v = i / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  function lab(r, g, b) {
    r = linear[r]; g = linear[g]; b = linear[b];
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  }
  function describe(preset) {
    preset = preset || {};
    const seen = new Set(['#000000', '#ffffff']);
    const swatches = [{ code: '黑', name: '线稿黑', hex: '#000000', base: true, role: 'line' }];
    for (const color of Array.isArray(preset.swatches) ? preset.swatches : []) {
      if (!color || typeof color.hex !== 'string' || !/^#[a-f0-9]{6}$/i.test(color.hex)) continue;
      const hex = color.hex.toLowerCase();
      if (!seen.has(hex)) { swatches.push(Object.assign({}, color, { hex: hex, base: false })); seen.add(hex); }
    }
    swatches.push({ code: '白', name: '背景白', hex: '#ffffff', base: true, role: 'background' });
    return { id: preset.id || '', name: preset.name || '', method: colorSets.has(preset.id) ? 'color' : 'gray', swatches: swatches };
  }
  function map(image, preset) {
    const width = image && image.width, height = image && image.height;
    const source = image && image.data;
    if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 ||
        !source || !Number.isSafeInteger(width * height * 4) || source.length !== width * height * 4) {
      throw new Error('参考像素尺寸无效。');
    }
    const description = describe(preset), swatches = description.swatches, count = swatches.length;
    if (count > 65535) throw new Error('色卡颜色数量过多。');
    const colors = new Uint32Array(count), labs = new Float64Array(count * 3), exact = new Map();
    swatches.forEach((color, i) => {
      const rgb = parseInt(color.hex.slice(1), 16);
      colors[i] = rgb; exact.set(rgb, i);
      labs.set(lab(rgb >> 16, (rgb >> 8) & 255, rgb & 255), i * 3);
    });
    // A map is local to this image. Only occupied 5-bit RGB buckets are searched;
    // fixed bucket centres keep the answer independent of pixel traversal order.
    // Uint16 preserves all 357 Copic entries plus the two fixed base colors.
    const lookup = new Uint16Array(32768); lookup.fill(65535);
    const used = new Uint8Array(count), data = new Uint8ClampedArray(source.length);
    const colorDistance = description.method === 'color';
    for (let p = 0; p < source.length; p += 4) {
      const alpha = source[p + 3];
      if (!alpha) continue;
      const r = source[p], g = source[p + 1], b = source[p + 2];
      let index = exact.get((r << 16) | (g << 8) | b);
      if (index === undefined) {
        const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
        index = lookup[key];
        if (index === 65535) {
          const point = lab((r & 248) + 4, (g & 248) + 4, (b & 248) + 4);
          let best = Infinity; index = 0;
          for (let i = 0; i < count; i++) {
            const at = i * 3, dl = point[0] - labs[at];
            let distance = dl * dl;
            if (colorDistance) {
              const da = point[1] - labs[at + 1], db = point[2] - labs[at + 2];
              distance += da * da + db * db;
            }
            if (distance < best) { best = distance; index = i; }
          }
          lookup[key] = index;
        }
      }
      const rgb = colors[index];
      data[p] = rgb >> 16; data[p + 1] = (rgb >> 8) & 255; data[p + 2] = rgb & 255; data[p + 3] = alpha;
      used[index] = 1;
    }
    return { width: width, height: height, data: data, method: description.method,
      swatches: swatches.filter((color, i) => color.base || used[i]) };
  }
  return { describe: describe, map: map };
});
