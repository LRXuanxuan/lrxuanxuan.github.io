'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const mapper = require('../assets/drawing-studio/palette-map.js');
const scope = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/drawing-studio/palettes.js'), 'utf8'), scope);
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/drawing-studio/palettes-supervision.js'), 'utf8'), scope);
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/drawing-studio/palettes-holbein.js'), 'utf8'), scope);
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/drawing-studio/palettes-pilot.js'), 'utf8'), scope);
const palettes = scope.window.DrawingPalettes;
const pixels = (...values) => ({ width: values.length, height: 1, data: new Uint8ClampedArray(values.flat()) });
const rgb = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const preset = (id, ...colors) => ({ id, name: id, swatches: colors.map((hex, i) => ({ code: 'Test' + i, name: 'Test ' + i, hex })) });
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }

test('Four requested sets use color; specialty sets use lightness and all keep fixed black/white', () => {
  for (const p of palettes.filter(p => p.id.startsWith('sketch'))) {
    const view = mapper.describe(p);
    assert.equal(view.method, ['sketch12-set', 'sketch36-set', 'sketchcomic24-set', 'sketch-chart'].includes(p.id) ? 'color' : 'gray');
    assert.equal(view.swatches[0].hex, '#000000');
    assert.equal(view.swatches.at(-1).hex, '#ffffff');
    assert.ok(view.swatches[0].base && view.swatches.at(-1).base);
    assert.notEqual(view.swatches.at(-1).code, '0');
    assert.deepEqual(view.swatches.slice(1, -1).map(s => s.code), Array.from(p.swatches, s => s.code));
  }
});

test('Super Vision preserves ten-color series, leading zeros and simple series labels for unknown codes', () => {
  const artist = palettes.find(p => p.id === 'supervision-artists50');
  const gray = palettes.find(p => p.id === 'supervision-gray60');
  assert.deepEqual(Array.from(artist.groups, g => g.name), ['葛饰北斋', '莫兰迪', '莫奈', '梵高', '穆夏']);
  assert.deepEqual(Array.from(gray.groups, g => g.name), ['棉花糖', '普罗旺斯', '仲夏游园', '风韵雅宋', '落日旅行', '长安宫乐']);
  assert.deepEqual(Array.from(gray.swatches, c => c.code), Array.from({ length: 60 }, (_, i) => String(i + 1).padStart(3, '0')));
  assert.equal(artist.swatches.filter(c => c.originalCode === null).length, 20);
  for (const group of artist.groups.filter(g => ['莫奈', '穆夏'].includes(g.name))) {
    assert.ok(group.swatches.every(c => c.code === group.name && c.name === group.name && c.originalCode === null));
  }
  for (const [p, count] of [[artist, 50], [gray, 60]]) {
    assert.equal(p.category, '视爵水彩'); assert.equal(p.columns, 5);
    assert.equal(p.swatches.length, count);
    assert.ok(p.groups.every(g => g.swatches.length === 10));
    assert.equal(new Set(p.swatches.map(c => c.hex)).size, count);
    assert.ok(p.swatches.every(c => /^#[a-f0-9]{6}$/.test(c.hex)));
    const description = mapper.describe(p);
    assert.equal(description.method, 'color'); assert.equal(description.swatches.length, count + 2);
    const input = pixels(...description.swatches.map(c => [...rgb(c.hex), 255]));
    assert.deepEqual(mapper.map(input, p).data, input.data, 'Exact source swatches and fixed black/white must survive mapping');
  }
});

test('Exact palette colors, including all 359 candidates, are preserved without mutating input', () => {
  const chart = palettes.find(p => p.id === 'sketch-chart'), description = mapper.describe(chart);
  assert.equal(description.swatches.length, 359);
  const input = pixels(...description.swatches.map(c => [...rgb(c.hex), 255]));
  const before = input.data.slice(), result = mapper.map(input, chart);
  assert.deepEqual(result.data, before);
  assert.deepEqual(input.data, before);
  assert.notEqual(result.data, input.data);
  assert.equal(result.swatches.length, 359);
});

test('Holbein artist selections retain twelve colors and share consistent swatches across sets', () => {
  const expected = {
    'holbein-yufuko12': 'W012 W007 W026 W047 W030 W031 W077 W093 W098 W116 W110 W136',
    'holbein-nanakami12': 'W031 W050 W025 W019 W015 W065 W104 W102 W117 W113 W156 W153',
    'holbein-lemon12': 'W015 W025 W032 W037 W047 W061 W094 W104 W115 W133 W136 W153'
  };
  const shared = new Map();
  for (const [id, codes] of Object.entries(expected)) {
    const p = palettes.find(item => item.id === id);
    assert.deepEqual(Array.from(p.swatches, c => c.code), codes.split(' '));
    assert.equal(p.category, '荷尔拜因水彩'); assert.equal(p.columns, 6);
    assert.equal(p.groups.length, 1); assert.equal(p.groups[0].swatches.length, 12);
    for (const color of p.swatches) {
      assert.match(color.hex, /^#[a-f0-9]{6}$/);
      if (shared.has(color.code)) assert.equal(color.hex, shared.get(color.code));
      shared.set(color.code, color.hex);
    }
    const view = mapper.describe(p); assert.equal(view.method, 'color');
    const input = pixels(...view.swatches.map(c => [...rgb(c.hex), 255]));
    assert.deepEqual(mapper.map(input, p).data, input.data);
  }
  assert.equal(shared.size, 29);
});

test('Pilot contains all thirty historical regular colors in five six-color families', () => {
  const p = palettes.find(item => item.id === 'pilot-iroshizuku30');
  assert.equal(p.category, '百乐彩墨'); assert.equal(p.columns, 6);
  assert.equal(p.swatches.length, 30); assert.equal(p.groups.length, 5);
  assert.ok(p.groups.every(group => group.swatches.length === 6));
  assert.equal(new Set(p.swatches.map(color => color.originalCode)).size, 30);
  assert.ok(p.swatches.every(color => color.code === color.name && /^INK-50-[A-Z]+$/.test(color.originalCode)));
  for (const name of ['露草', '稻穗', '土笔', '雾雨', '踯躅', '秋樱', '燈路', '春晓', '六花']) {
    assert.ok(p.swatches.some(color => color.name === name), 'Missing historical or new color ' + name);
  }
  const view = mapper.describe(p); assert.equal(view.method, 'color');
  assert.equal(view.swatches.length, 31, 'The official Takesumi screen swatch shares pure black; only white adds another distinct candidate');
  const input = pixels(...view.swatches.map(color => [...rgb(color.hex), 255]));
  assert.deepEqual(mapper.map(input, p).data, input.data);
});

test('Color mapping and lightness mapping produce distinct, meaningful choices', () => {
  const input = pixels([76, 0, 255, 255]);
  const colors = ['#0000ff', '#5e5e5e'];
  assert.deepEqual(Array.from(mapper.map(input, preset('sketch12-set', ...colors)).data), [0, 0, 255, 255]);
  assert.deepEqual(Array.from(mapper.map(input, preset('specialty', ...colors)).data), [94, 94, 94, 255]);
  const actual = palettes.find(p => p.id === 'sketch6-set-seasky');
  const result = mapper.map(pixels([128, 128, 128, 255]), actual);
  const colored = Array.from(result.data.slice(0, 3));
  assert.ok(new Set(colored).size > 1, 'Lightness matching uses actual set inks rather than inventing neutral gray');
});

test('Fixed black/white stay exact, alpha is retained, and invisible pixels add no swatches', () => {
  const p = preset('sketch12-set', '#123456', '#abcdef');
  const input = pixels([0, 0, 0, 255], [255, 255, 255, 255], [18, 52, 86, 73], [171, 205, 239, 0]);
  const result = mapper.map(input, p);
  assert.deepEqual(Array.from(result.data), [0, 0, 0, 255, 255, 255, 255, 255, 18, 52, 86, 73, 0, 0, 0, 0]);
  assert.deepEqual(result.swatches.map(s => s.hex), ['#000000', '#123456', '#ffffff']);
  assert.deepEqual(mapper.map(pixels([1, 2, 3, 0]), p).swatches.map(s => s.hex), ['#000000', '#ffffff']);
});

test('A cached non-exact match beyond palette index 255 does not wrap', () => {
  const redColors = Array.from({ length: 257 }, (_, i) => '#' + [128 + i % 128, (i >> 7) * 16, i % 8].map(c => c.toString(16).padStart(2, '0')).join(''));
  const p = preset('sketch-chart', ...redColors, '#00ff00');
  const result = mapper.map(pixels([1, 254, 1, 255], [2, 253, 2, 255]), p);
  assert.deepEqual(Array.from(result.data), [0, 255, 0, 255, 0, 255, 0, 255]);
  assert.equal(result.swatches[1].code, 'Test257');
});

test('Bucket results are deterministic and independent of pixel order', () => {
  const p = palettes.find(p => p.id === 'sketch-chart');
  const first = [121, 10, 249, 255], second = [127, 15, 255, 91];
  const a = mapper.map(pixels(first, second), p), b = mapper.map(pixels(second, first), p);
  assert.deepEqual(a.data.slice(0, 4), b.data.slice(4, 8));
  assert.deepEqual(a.data.slice(4, 8), b.data.slice(0, 4));
  assert.deepEqual(mapper.map(pixels(first, second), p).data, a.data);
});

test('Palette descriptions are independent copies and malformed swatches are ignored', () => {
  const p = preset('sketch12-set', '#123456', '#123456', '#000000', '#FFFFFF', '#bad');
  const original = JSON.stringify(p), a = mapper.describe(p);
  assert.deepEqual(a.swatches.map(s => s.hex), ['#000000', '#123456', '#ffffff']);
  a.swatches[0].hex = '#ff0000'; a.swatches[1].name = 'changed';
  assert.equal(mapper.describe(p).swatches[0].hex, '#000000');
  assert.equal(JSON.stringify(p), original);
  assert.throws(() => mapper.map({ width: 2, height: 1, data: new Uint8Array(3) }, p), /尺寸/);
});

console.log(passed + ' palette mapping checks passed.');
