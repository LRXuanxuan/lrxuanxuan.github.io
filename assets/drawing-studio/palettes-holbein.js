/* Holbein artist selections. Approximate display RGB sampled from official
   shop watercolor swatches; Chinese color names are interface translations.
   Provenance: docs/drawing-holbein-palettes.md. No images loaded at runtime. */
(function (root) {
  'use strict';
  const colors = [
    ["W012", "ac262d", "茜草玫红", "Rose Madder"],
    ["W007", "ee2525", "吡咯红", "Pyrrole Red"],
    ["W026", "fcbba2", "贝壳粉", "Shell Pink"],
    ["W047", "fd7420", "明亮橙", "Brilliant Orange"],
    ["W030", "f2cf5c", "那不勒斯黄", "Naples Yellow"],
    ["W031", "f3e59a", "明亮黄Ⅰ", "Jaune Brillant No.1"],
    ["W077", "97d536", "叶绿", "Leaf Green"],
    ["W093", "1041db", "浅群青", "Ultramarine Light"],
    ["W098", "273543", "靛蓝", "Indigo"],
    ["W116", "90b1f8", "薰衣草紫", "Lavender"],
    ["W110", "c87ce2", "浅钴紫", "Cobalt Violet Light"],
    ["W136", "4c4230", "乌贼棕", "Sepia"],
    ["W050", "fcee3f", "咪唑酮黄", "Imidazolone Yellow"],
    ["W025", "fd99ac", "明亮粉", "Brilliant Pink"],
    ["W019", "fb7735", "朱红", "Vermilion Hue"],
    ["W015", "e4281f", "深镉红", "Cadmium Red Deep"],
    ["W065", "4a743c", "土绿", "Terre Verte"],
    ["W104", "4ed9e7", "地平线蓝", "Horizon Blue"],
    ["W102", "15646c", "海洋蓝", "Marine Blue"],
    ["W117", "d597db", "丁香紫", "Lilac"],
    ["W113", "5a3d33", "火星紫", "Mars Violet"],
    ["W156", "2e3631", "佩恩灰", "Payne's Grey"],
    ["W153", "c1cccc", "灰中灰", "Grey of Grey"],
    ["W032", "fbcf86", "明亮黄Ⅱ", "Jaune Brillant No.2"],
    ["W037", "fac41b", "永久深黄", "Permanent Yellow Deep"],
    ["W061", "194c3f", "翠绿", "Viridian Hue"],
    ["W094", "1540cf", "深群青", "Ultramarine Deep"],
    ["W115", "5e388f", "永久紫", "Permanent Violet"],
    ["W133", "a56837", "熟褐", "Burnt Umber"]
  ];
  const catalog = new Map(colors.map(([code, rgb, name, officialName]) =>
    [code, { code, originalCode: code, name, officialName, hex: '#' + rgb }]));
  const sets = [
    ["holbein-yufuko12", "友风子 12 色", "友風子", "W012 W007 W026 W047 W030 W031 W077 W093 W098 W116 W110 W136"],
    ["holbein-nanakami12", "七神奈奈 12 色", "七神マナ", "W031 W050 W025 W019 W015 W065 W104 W102 W117 W113 W156 W153"],
    ["holbein-lemon12", "夏目柠檬 12 色", "夏目レモン", "W015 W025 W032 W037 W047 W061 W094 W104 W115 W133 W136 W153"]
  ];
  const source = 'https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/docs/drawing-holbein-palettes.md';
  for (const [id, name, artist, codes] of sets) {
    const swatches = codes.split(' ').map(code => catalog.get(code));
    root.DrawingPalettes.push({ id, name,
      category: '荷尔拜因水彩', columns: 6, matchMethod: 'color',
      description: artist + ' 联名选色 · 每套两行六色',
      groups: [{ name: artist, swatches }], swatches, source, sourceLabel: '色卡来源',
      colors: swatches.map(color => color.hex) });
  }
})(window);
