/* Hand-picked starting palettes, not a brand chart or an industry standard. */
(function (root) {
  'use strict';
  function set(id, name, values) { return { id: id, name: name, colors: values.split(/\s+/).map(function (v) { return '#' + v; }) }; }
  root.DrawingPalettes = [
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
