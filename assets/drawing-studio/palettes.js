/* Marker swatches sampled from Copic's digital Sketch chart. Subject palettes are studio selections. */
(function (root) {
  'use strict';
  const chart = 'https://copic.jp/en/color/sketch/';

  // Display RGB is the per-channel median of the central 17 × 17 pixels of each official
  // digital swatch. Paper, overlap and display settings affect the perceived ink colour.
  // Chinese labels describe the digital swatches. Groupings are selected for this studio.
  function group(name, entries) {
    const swatches = entries.map(([code, rgb, label]) => ({ code, name: label, hex: '#' + rgb }));
    return { name, swatches };
  }

  function markerSet(id, title, description, groups) {
    const swatches = groups.flatMap(group => group.swatches);
    return {
      id, name: title + ' · ' + swatches.length + ' 色', description, source: chart, groups, swatches,
      colors: swatches.map(swatch => swatch.hex)
    };
  }

  const coolGrays = group('冷灰 C', [
    ['C-1','e4eaf3','浅冷灰'], ['C-3','adb9c7','银灰'], ['C-5','7d8793','中冷灰'],
    ['C-7','49525c','深冷灰'], ['C-9','2a2833','冷炭灰']
  ]);
  const markerTriads = markerSet('marker-triads', '马克笔基础三色组',
    '每组从浅到深。先铺浅色，中间色过渡，深色压暗转折。', [
      group('红 R', [['R22','fe7e71','浅虾红'], ['R24','dc4342','虾红'], ['R29','980917','唇红']]),
      group('橙 YR', [['YR12','fdaf4e','枇杷橙'], ['YR15','fe9c27','南瓜橙'], ['YR18','cf5221','赭橙']]),
      group('黄 Y', [['Y11','feef86','淡黄'], ['Y15','ffd331','镉黄'], ['Y19','ffab01','金黄']]),
      group('黄绿 YG', [['YG11','d6fba3','嫩芽绿'], ['YG13','a3cb47','黄绿'], ['YG17','71a239','草绿']]),
      group('绿 G', [['G12','c2e3aa','浅叶绿'], ['G14','68bf55','苹果绿'], ['G17','359452','森林绿']]),
      group('蓝绿 BG', [['BG11','d0feef','月白绿'], ['BG13','73dac4','薄荷绿'], ['BG18','3e8178','深青绿']]),
      group('蓝 B', [['B21','b8ddfe','婴儿蓝'], ['B24','63a0fb','天蓝'], ['B28','1450d9','宝蓝']]),
      group('蓝紫 BV', [['BV00','dcbfe8','淡灰紫'], ['BV02','a298e2','浅蓝紫'], ['BV04','4550a0','蓝莓紫']]),
      group('紫 V', [['V12','e99fde','浅丁香紫'], ['V15','be80c9','锦葵紫'], ['V17','523673','紫晶']]),
      group('红紫 RV', [['RV21','feb6bd','浅粉'], ['RV23','fea4be','柔粉'], ['RV25','e75a8d','野玫瑰']]),
      group('大地 E', [['E31','efc894','浅砖米'], ['E33','e29b69','沙褐'], ['E35','c9844b','麂皮棕']]),
      { name: '冷灰 C', swatches: coolGrays.swatches.slice(0, 3) }
    ]);
  const portrait = markerSet('marker-portrait', '马克笔人物',
    '按人物的局部色选底色、半调和阴影，可跨组取色。', [
      group('浅暖底色', [['E000','ffefdf','淡杏白'], ['E00','ffead9','珍珠米'], ['E11','e1b693','麦米']]),
      group('金棕底色', [['E21','fecf99','暖杏'], ['E23','b8724b','榛子棕'], ['E25','9e5e46','可可棕']]),
      group('赤棕底色', [['E13','d2976a','沙土棕'], ['E15','ab663d','陶棕'], ['E18','652b1d','深铜棕']]),
      group('深棕底色', [['E57','7c542e','浅胡桃'], ['E59','5d3e22','胡桃棕'], ['E49','3c271b','树皮褐']]),
      group('面颊与唇色', [['R20','fec4b3','暖胭脂'], ['R32','ff9b92','桃粉'], ['R35','ff4156','珊瑚红']])
    ]);
  const landscape = markerSet('marker-landscape', '马克笔自然景物',
    '用橄榄绿和苔绿区分植被，用灰蓝降低远景对比。', [
      group('新叶', [['G40','e2f8be','浅芽绿'], ['G43','a9ca76','开心果绿'], ['G46','497845','槲寄生绿']]),
      group('林地', [['YG61','bfd19d','浅苔绿'], ['YG63','90a964','豌豆绿'], ['YG67','496b2e','苔绿']]),
      group('草坡', [['YG91','e3d4a9','灰稻黄'], ['YG95','99922f','浅橄榄'], ['YG99','4b4a13','深橄榄']]),
      group('树干与岩土', [['E41','fce3bb','珍珠米白'], ['E43','bf9d72','暗象牙'], ['E47','764e3a','深褐']]),
      group('天空与远山', [['B91','b9cde4','浅灰蓝'], ['B93','9ebede','瓷蓝'], ['B97','426491','夜蓝']]),
      group('水面', [['BG70','e8f0f0','海雾灰'], ['BG72','9ac1c5','冰海蓝'], ['BG75','436d6f','深海青']])
    ]);
  const grayFamilies = markerSet('marker-grays', '马克笔四系灰',
    '每组取 1、3、5、7、9 五档，适合先画明暗，再比较冷暖。', [
      coolGrays,
      group('暖灰 W', [['W-1','e3ddd1','浅暖灰'], ['W-3','bcb0a0','米灰'], ['W-5','8a7a6b','中暖灰'], ['W-7','4a4237','深暖灰'], ['W-9','342d25','暖炭灰']]),
      group('中性灰 N', [['N-1','dbdbdb','浅中性灰'], ['N-3','999ea4','中浅中性灰'], ['N-5','5a5e61','中性灰'], ['N-7','292e31','深中性灰'], ['N-9','222625','近黑中性灰']]),
      group('调子灰 T', [['T-1','cecece','浅调子灰'], ['T-3','9a9d97','中浅调子灰'], ['T-5','666b65','中调子灰'], ['T-7','39403b','深调子灰'], ['T-9','282c2f','炭调子灰']])
    ]);

  function set(id, name, values) { return { id: id, name: name, colors: values.split(/\s+/).map(function (v) { return '#' + v; }) }; }
  root.DrawingPalettes = [
    markerTriads, portrait, landscape, grayFamilies,
    set('ink', '勾线 · 12 色', '15191e 262938 373548 3b3331 51413d 644e47 5b493f 39474b 445861 574f66 755965 90857b'),
    set('gray', '灰阶 · 12 色', '000000 171717 2e2e2e 464646 5d5d5d 747474 8b8b8b a2a2a2 b9b9b9 d1d1d1 e8e8e8 ffffff'),
    set('skin', '肤色 · 18 色', 'fff3e5 ffe2cb f8cfb3 eebc9d e2a886 d18d6d bf7459 a65e47 874a3d 633b32 f9d4ca eeb6aa d89489 bc796e 9a605b 765050 b78e72 835d4c'),
    set('street', '街景 · 60 色',
      'f5f1e8 e3ddcf c9c0ad a99d88 827460 594e43 ' +
      'e8e8df cdcfc7 adb4b0 89969b 62747f 3f515e ' +
      'e8ccbb cda995 b68b74 966c56 755141 513c34 ' +
      'd1b3a3 b58d7b 996657 7f4c44 623b38 452c2d ' +
      'e1e9eb bdcfda 92b2ca 6a94b4 456e91 304d6b ' +
      'f3dca1 e6bd69 ce9749 ac7538 80532e 5c3b26 ' +
      'd5dcc4 b5c09a 91a374 6d8452 4c663f 314b35 ' +
      'c3d5c9 96b6a5 6c9586 4a776e 335b58 244442 ' +
      'eed4c8 d9aaa0 bf7d76 a05955 7e413f 592f31 ' +
      'e4dce9 c6b9ce a295b4 817395 625674 443e53'),
    set('plants', '植物 · 60 色',
      'f1f2ce dce4a8 bfce7e 9eb655 7e973c 5d762b ' +
      'dfebca bfd6a7 99bd82 76a263 53854a 336633 ' +
      'c9e0cf a0c6aa 76aa85 538d67 35704f 21533c ' +
      'd3e6dd a9cbbb 7daf96 57917c 39735f 235647 ' +
      'e8d8b4 ceb887 b29a63 927c48 715f36 50442a ' +
      'd6c5ae b69e81 957c60 765b45 573f31 382d25 ' +
      'fff3bf f8dd86 ebc354 d8a62e b68622 87651e ' +
      'ffe4df f8bfbe e994a1 d26b88 b34d71 873553 ' +
      'efe0f2 d8bbe2 bb93ce 9a6db8 795297 593c72 ' +
      'e1edff bed5f5 91b5e0 6a93c3 4b73a0 345477'),
    set('anime', '动漫 · 60 色',
      'ffffff eaeaf2 c8cbdc 9399b3 5c6587 303951 ' +
      'fff1db ffd9b7 f3b993 de9174 bc6b59 854b46 ' +
      'fff0ed ffcfd3 f5a3b5 e37197 c8477c 8e2d61 ' +
      'ffe0df ffa6a4 f87678 e44d5a bc304a 84233f ' +
      'fff4ce ffe395 ffc951 f9a52e e17a23 a94f25 ' +
      'f3f8cc d9ed8d b7dc55 8ac138 59a232 347a32 ' +
      'd8f5e2 a2e6c5 6cd1ac 3ab89b 209485 176d6c ' +
      'd9f4ff a8e4fa 72cbee 43a9de 287fc0 245a93 ' +
      'e1e8ff b9cbff 8ca9f6 6384df 4660bf 34418c ' +
      'eee1ff d8bbfa bc93ed 996cda 784dbb 553792'),
    set('macaron', '马卡龙 · 24 色', 'fff6eb f9e7cc f6dab8 f4c5ad f9d9df efb9cd e9b5dc dbc5ed c9c5ef bbcff0 b6e0ed b5e7e5 bce8d7 cde8bd e4e8b5 f7e8af f7d8aa edc5b5 e8d5c7 d9d6ce c9dfd8 d0d9e9 e2d6e9 eee2dc'),
    set('morandi', '莫兰迪 · 24 色', 'e9e4dc d9d0c5 c5b8a8 afa18f 918577 72685f d6c2b9 bda29a a58680 896f6b d2c8c8 b2a5ae 928697 746c83 c4cec5 a7b7a8 899e91 6c847a c7d2d5 a8bbc3 8b9faa 6d8390 d4c9ad b2a182')
  ];
})(window);
