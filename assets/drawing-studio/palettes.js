/* Copic Sketch manufacturer codes. Display RGB is sampled from the middle
   17 × 17 pixels of each official digital swatch (per-channel median).
   Chinese hue descriptions are studio labels. No remote resources at startup. */
(function (root) {
  'use strict';
  const chart = 'https://copic.jp/en/color/sketch/';
  const families = [
    ["蓝紫", [
      "BV0000:f1ecf3:Pale Thistle|BV000:ead5f3:Iridescent Mauve|BV00:dcbfe8:Mauve Shadow:淡灰紫|BV01:b3ace3:Viola|BV02:a298e2:Prune:浅蓝紫|BV04:4550a0:Blue Berry:蓝莓紫|BV08:41336e:Blue Violet",
      "BV11:b2a0d1:Soft Violet|BV13:7f85d7:Hydrangea Blue|BV17:656a91:Deep Reddish Blue|BV20:b3b3cf:Dull Lavender|BV23:78758b:Grayish Lavender|BV25:666375:Grayish Violet|BV29:1c1e29:Slate",
      "BV31:d0cce8:Pale Lavender|BV34:7d7faf:Bluebell"
    ].join('|')],
    ["紫", [
      "V0000:fff6fe:Rose Quartz|V000:ffe4f7:Pale Heath|V01:f4aadd:Heath|V04:e065f5:Lilac|V05:db6bbb:Azalea:杜鹃紫|V06:b0489f:Lavender|V09:3f1873:Violet:紫罗兰",
      "V12:e99fde:Pale Lilac:浅丁香紫|V15:be80c9:Mallow:锦葵紫|V17:523673:Amethyst:紫晶|V20:d9d5e1:Wisteria|V22:b9b1c6:Ash Lavender|V25:9381a9:Pale Blackberry|V28:615f6a:Eggplant",
      "V91:e7d4df:Pale Grape|V93:d8c2d1:Early Grape|V95:ad8ea0:Light Grape|V99:4b3645:Aubergine"
    ].join('|')],
    ["红紫", [
      "RV0000:fff6f7:Evening Primrose|RV000:fff1f6:Pale Purple|RV00:ffe6e9:Water Lily|RV02:ffc9e3:Sugared Almond Pink|RV04:ff4ea8:Shock Pink|RV06:fe30c0:Cerise|RV09:b51f68:Fuchsia",
      "RV10:fdd5de:Pale Pink|RV11:fec0c0:Pink:浅蔷薇|RV13:fe80ab:Tender Pink:浅玫粉|RV14:fe427a:Begonia Pink|RV17:c42473:Deep Magenta|RV19:871745:Red Violet|RV21:feb6bd:Light Pink:浅粉",
      "RV23:fea4be:Pure Pink:柔粉|RV25:e75a8d:Dog Rose Flower:野玫瑰|RV29:9d102b:Crimson|RV32:faaab7:Shadow Pink|RV34:f38cb3:Dark Pink|RV42:ffb7a7:Salmon Pink|RV52:fecaf8:Cotton Candy",
      "RV55:f175c0:Hollyhock|RV63:fcb5ec:Begonia|RV66:8e457a:Raspberry|RV69:530d29:Peony:深牡丹|RV91:f6e2ed:Grayish Cherry|RV93:e1b4c8:Smoky Purple|RV95:b9899e:Baby Blossoms",
      "RV99:32141e:Argyle Purple"
    ].join('|')],
    ["红", [
      "R0000:fffdf3:Pink Beryl|R000:fef8e8:Cherry White|R00:f9e5d7:Pinkish White|R01:ffdfc6:Pinkish Vanilla:粉肤|R02:ffb68f:Rose Salmon|R05:f94726:Salmon Red|R08:ba3223:Vermilion:朱红",
      "R11:ffd2c0:Pale Cherry Pink|R12:ffc69e:Light Tea Rose|R14:ff6c61:Light Rouge|R17:cc3a32:Lipstick Orange|R20:fec4b3:Blush:暖胭脂|R21:feb39e:Sardonyx|R22:fe7e71:Light Prawn:浅虾红",
      "R24:dc4342:Prawn:虾红|R27:a10b14:Cadmium Red|R29:980917:Lipstick Red:唇红|R30:ffd5bd:Pale Yellowish Pink|R32:ff9b92:Peach:桃粉|R35:ff4156:Coral:珊瑚红|R37:ab1a37:Carmine",
      "R39:a01d3c:Garnet|R43:ff657b:Bougainvillaea|R46:e02b4c:Strong Red|R56:a9485b:Currant|R59:831929:Cardinal|R81:fbbcd1:Rose Pink|R83:ed89a6:Rose Mist",
      "R85:e26c8e:Rose Red|R89:7e1423:Dark Red"
    ].join('|')],
    ["黄红", [
      "YR0000:faeee2:Pale Chiffon|YR000:ffe5c8:Silk|YR00:fdd2a0:Powder Pink|YR01:ffc78f:Peach Puff|YR02:ffa562:Light Orange|YR04:fe9d2c:Chrome Orange:铬橙|YR07:ff6d20:Cadmium Orange",
      "YR09:ef7247:Chinese Orange|YR12:fdaf4e:Loquat:枇杷橙|YR14:fd8f2a:Caramel|YR15:fe9c27:Pumpkin Yellow:南瓜橙|YR16:ff8f1b:Apricot|YR18:cf5221:Sanguine:赭橙|YR20:ffdf9c:Yellowish Shade",
      "YR21:ffd26e:Cream|YR23:ea9f28:Yellow Ochre|YR24:f29d20:Pale Sepia|YR27:aa5d0f:Tuscan Orange|YR30:fffdde:Macadamia nut|YR31:ffdc80:Light Reddish Yellow|YR61:ffbe90:Spring Orange",
      "YR65:ffa75f:Atoll|YR68:ff721e:Orange|YR82:ffcf9e:Mellow Peach"
    ].join('|')],
    ["黄", [
      "Y0000:ffffe3:Yellow Fluorite|Y000:fffed8:Pale Lemon|Y00:fffeab:Barium Yellow|Y02:fffc5f:Canary Yellow|Y04:fffe59:Acacia|Y06:ffff31:Yellow|Y08:fedf2d:Acid Yellow",
      "Y11:feef86:Pale Yellow:淡黄|Y13:ffe65e:Lemon Yellow:柠檬黄|Y15:ffd331:Cadmium Yellow:镉黄|Y17:fea40f:Golden Yellow|Y18:ffc717:Lightning Yellow|Y19:ffab01:Napoli Yellow:金黄|Y21:fac563:Buttercup Yellow",
      "Y23:facf81:Yellowish Beige|Y26:bc820d:Mustard|Y28:bca15f:Lionet Gold|Y32:ffdd9e:Cashmere|Y35:febf4a:Maize|Y38:ff9e1d:Honey"
    ].join('|')],
    ["黄绿", [
      "YG0000:f3f2c2:Lily White|YG00:e3e57c:Mimosa Yellow|YG01:cde860:Green Bice|YG03:aac658:Yellow Green:嫩黄绿|YG05:99ea44:Salad|YG06:97ea5c:Yellowish Green|YG07:6bc339:Acid Green",
      "YG09:39a82c:Lettuce Green|YG11:d6fba3:Mignonette:嫩芽绿|YG13:a3cb47:Chartreuse:黄绿|YG17:71a239:Grass Green:草绿|YG21:fefe73:Anise|YG23:b6d24b:New Leaf|YG25:99cd3d:Celadon Green",
      "YG41:bbf6a5:Pale Cobalt Green:淡青绿|YG45:74a767:Cobalt Green:青绿|YG61:bfd19d:Pale Moss:浅苔绿|YG63:90a964:Pea Green:豌豆绿|YG67:496b2e:Moss:苔绿|YG91:e3d4a9:Putty:灰稻黄|YG93:b9b873:Grayish Yellow",
      "YG95:99922f:Pale Olive:浅橄榄|YG97:69671c:Spanish Olive|YG99:4b4a13:Marine Green:深橄榄"
    ].join('|')],
    ["绿", [
      "G0000:f4fffc:Crystal Opal|G000:e5fef0:Pale Green|G00:c8fadf:Jade Green|G02:7ddb87:Spectrum Green|G03:66cd71:Meadow Green|G05:34a143:Emerald Green|G07:318a2e:Nile Green",
      "G09:35a24b:Veronese Green|G12:c2e3aa:Sea Green:浅叶绿|G14:68bf55:Apple Green:苹果绿|G16:1c844c:Malachite|G17:359452:Forest Green:森林绿|G19:228b46:Bright Parrot Green|G20:f5fbbd:Wax White",
      "G21:b2ce91:Lime Green|G24:96bd7c:Willow|G28:235c34:Ocean Green|G29:225939:Pine Tree Green|G40:e2f8be:Dim Green:浅芽绿|G43:a9ca76:Pistachio:开心果绿|G46:497845:Mistletoe:槲寄生绿",
      "G82:a2c170:Spring Dim Green|G85:737a4e:Verdigris|G94:819861:Grayish Olive|G99:515b1e:Olive"
    ].join('|')],
    ["蓝绿", [
      "BG0000:ebfeff:Snow Green|BG000:d3f8ff:Pale Aqua|BG01:8af2fa:Aqua Blue|BG02:69d7ef:New Blue|BG05:34abc0:Holiday Blue|BG07:198a9a:Petroleum Blue|BG09:0e7278:Blue Green",
      "BG10:dcfef2:Cool Shadow:浅水青|BG11:d0feef:Moon White:月白绿|BG13:73dac4:Mint Green:薄荷绿|BG15:2ea98b:Aqua:水绿|BG18:3e8178:Teal Blue:深青绿|BG23:85e1c4:Coral Sea|BG32:95e8ce:Aqua Mint",
      "BG34:87e0b7:Horizon Green|BG45:68ccc4:Nile Blue|BG49:0d8578:Duck Blue|BG53:83d5db:Ice Mint|BG57:54abaf:Jasper|BG70:e8f0f0:Ocean Mist:海雾灰|BG72:9ac1c5:Ice Ocean:冰海蓝",
      "BG75:436d6f:Abyss Green:深海青|BG78:356367:Bronze:深灰青|BG90:dde2d2:Gray Sky|BG93:a1a582:Green Gray|BG96:636d50:Bush|BG99:646545:Flagstone Blue"
    ].join('|')],
    ["蓝", [
      "B0000:effffe:Pale Celestine|B000:e0ffff:Pale Porcelain Blue|B00:c0fcfe:Frost Blue|B01:9eeffd:Mint Blue|B02:80d5fe:Robin's Egg Blue|B04:39b0f4:Tahitian Blue|B05:1d8ce9:Process Blue:工艺蓝",
      "B06:1a7fda:Peacock Blue:孔雀蓝|B12:98d8fe:Ice Blue|B14:5da9e2:Light Blue:浅蓝|B16:2182df:Cyanine Blue|B18:1953c8:Lapis Lazuli|B21:b8ddfe:Baby Blue:婴儿蓝|B23:6c97e5:Phthalo Blue",
      "B24:63a0fb:Sky:天蓝|B26:336bce:Cobalt Blue|B28:1450d9:Royal Blue:宝蓝|B29:103dd1:Ultramarine:群青|B32:a4d1ff:Pale Blue|B34:5d80bb:Manganese Blue|B37:204f8e:Antwerp Blue",
      "B39:15306f:Prussian Blue:普鲁士蓝|B41:cbe5fd:Powder Blue|B45:769dd4:Smoky Blue|B52:95c5dc:Soft Greenish Blue|B60:efecfe:Pale Blue Gray|B63:bdc1f9:Light Hydrangea|B66:5562cd:Clematis",
      "B69:1b2eb9:Stratospheric Blue|B79:19249a:Iris|B91:b9cde4:Pale Grayish Blue:浅灰蓝|B93:9ebede:Light Crockery Blue:瓷蓝|B95:85a8d1:Light Grayish Cobalt|B97:426491:Night Blue:夜蓝|B99:334769:Agate"
    ].join('|')],
    ["大地", [
      "E0000:fffcf3:Floral White|E000:ffefdf:Pale Fruit Pink:淡杏白|E00:ffead9:Cotton Pearl:珍珠米|E01:ffd7b3:Pink Flamingo|E02:febf96:Fruit Pink|E04:a16e6d:Lipstick Rose|E07:8f3735:Light Mahogany",
      "E08:a64324:Brown|E09:9a4424:Burnt Sienna:熟赭|E11:e1b693:Barley Beige:麦米|E13:d2976a:Desert Sand:沙土棕|E15:ab663d:Earthenware:陶棕|E17:9b5136:Reddish Brass|E18:652b1d:Copper:深铜棕",
      "E19:7c2a15:Redwood|E21:fecf99:Soft Sun:暖杏|E23:b8724b:Hazelnut:榛子棕|E25:9e5e46:Caribe Cocoa:可可棕|E27:8c4e35:Milk Chocolate|E29:7e3423:Burnt Umber:焦赭|E30:ffe8bc:Bisque",
      "E31:efc894:Brick Beige:浅砖米|E33:e29b69:Sand:沙褐|E34:dd9764:Toast:烤米色|E35:c9844b:Chamois:麂皮棕|E37:7e4517:Sepia|E39:985417:Leather:皮革棕|E40:f3e8d4:Brick White",
      "E41:fce3bb:Pearl White:珍珠米白|E42:edd3ae:Sand White|E43:bf9d72:Dull Ivory:暗象牙|E44:896442:Clay|E47:764e3a:Dark Brown:深褐|E49:3c271b:Dark Bark:树皮褐|E50:fce5c5:Egg Shell",
      "E51:ffe6c4:Milky White|E53:f7be86:Raw Silk|E55:d4a66d:Light Camel|E57:7c542e:Light Walnut:浅胡桃|E59:5d3e22:Walnut:胡桃棕|E70:ddc6c0:Ash Rose|E71:af8c86:Champagne",
      "E74:926e67:Cocoa Brown|E77:5c3831:Maroon|E79:452925:Cashew|E81:e7dbb3:Ivory|E84:b4a169:Khaki|E87:68562c:Fig|E89:4d3d1c:Pecan",
      "E93:fdbfa6:Tea Rose:茶玫瑰|E95:ffc299:Tea Orange|E97:ff9460:Deep Orange|E99:ab6628:Baked Clay"
    ].join('|')],
    ["冷灰", [
      "C-00:fbfcff:Cool Gray No.00|C-0:f4f8fd:Cool Gray No.0|C-1:e4eaf3:Cool Gray No.1:浅冷灰|C-2:d2dde5:Cool Gray No.2|C-3:adb9c7:Cool Gray No.3:银灰|C-4:949fad:Cool Gray No.4|C-5:7d8793:Cool Gray No.5:中冷灰",
      "C-6:5f6773:Cool Gray No.6|C-7:49525c:Cool Gray No.7:深冷灰|C-8:353c43:Cool Gray No.8|C-9:2a2833:Cool Gray No.9:冷炭灰|C-10:28222c:Cool Gray No.10"
    ].join('|')],
    ["暖灰", [
      "W-00:f0f1eb:Warm Gray No.00|W-0:eee8de:Warm Gray No.0|W-1:e3ddd1:Warm Gray No.1:浅暖灰|W-2:d4caba:Warm Gray No.2|W-3:bcb0a0:Warm Gray No.3:米灰|W-4:b2a698:Warm Gray No.4|W-5:8a7a6b:Warm Gray No.5:中暖灰",
      "W-6:776759:Warm Gray No.6|W-7:4a4237:Warm Gray No.7:深暖灰|W-8:463f34:Warm Gray No.8|W-9:342d25:Warm Gray No.9:暖炭灰|W-10:33302b:Warm Gray No.10"
    ].join('|')],
    ["中性灰", [
      "N-0:e7ebed:Neutral Gray No.0|N-1:dbdbdb:Neutral Gray No.1:浅中性灰|N-2:aaafb5:Neutral Gray No.2|N-3:999ea4:Neutral Gray No.3:中浅中性灰|N-4:797e84:Neutral Gray No.4|N-5:5a5e61:Neutral Gray No.5:中性灰|N-6:40434a:Neutral Gray No.6",
      "N-7:292e31:Neutral Gray No.7:深中性灰|N-8:27272c:Neutral Gray No.8|N-9:222625:Neutral Gray No.9:近黑中性灰|N-10:1a191b:Neutral Gray No.10"
    ].join('|')],
    ["调子灰", [
      "T-0:e2e6e5:Toner Gray No.0|T-1:cecece:Toner Gray No.1:浅调子灰|T-2:b7b7b4:Toner Gray No.2|T-3:9a9d97:Toner Gray No.3:中浅调子灰|T-4:757673:Toner Gray No.4|T-5:666b65:Toner Gray No.5:中调子灰|T-6:4e5452:Toner Gray No.6",
      "T-7:39403b:Toner Gray No.7:深调子灰|T-8:2b3431:Toner Gray No.8|T-9:282c2f:Toner Gray No.9:炭调子灰|T-10:211d20:Toner Gray No.10"
    ].join('|')],
    ["荧光", [
      "FV:724be2:Fluorescent Violet|FRV:ff8ed3:Fluorescent Pink|FYR:ffc67a:Fluorescent Orange|FY:fee581:Fluorescent Yellow|FYG:f3ff83:Fluorescent Yellow Green|FG:57b642:Fluorescent Green|FBG:63c6e7:Fluorescent Blue Green",
      "FB:2f72f8:Fluorescent blue"
    ].join('|')],
    ["黑", [
      "100:1c1b20:Black:黑|110:201b1c:Special Black:特级黑"
    ].join('|')],
  ];
  const kits = [
    ["sketch36-set","基础 36 色","V09 RV11 RV29 R02 R08 YR04 YR24 Y11 Y13 Y15 YG03 G07 G17 G21 G28 B05 B06 B14 B29 B32 B39 E09 E29 E33 C-1 C-3 C-5 C-7 C-9 W-1 W-3 W-5 W-7 W-9 100 110"],
    ["sketch12-set","基础 12 色","V09 RV11 R08 YR04 Y13 YG03 G17 B14 B29 B39 E09 100"],
    ["sketchcomic24-set","漫画插画 24 色","BV0000 BV000 BV13 BV20 RV52 R0000 R000 R17 R43 YR01 YR15 Y000 Y04 Y18 G03 BG000 BG53 B04 B41 B63 E84 N-2 N-4 N-6"],
    ["sketch6-set-portrait","人物肖像 6 色","E000 E00 E11 E15 E18 E93"],
    ["sketch6-set-seasky","海洋与天空 6 色","BG10 BG13 BG72 BG78 B24 B28"],
    ["sketch6-set-earthessentials","自然大地 6 色","YG13 YG17 B41 B45 E34 E39"],
    ["sketch6-set-floralfavorites1","花卉 Ⅰ · 6 色","V05 RV13 RV69 R01 YG41 YG45"],
    ["sketch6-set-palepastels","柔和淡彩 6 色","BV0000 BV01 YR12 YR31 BG11 BG15"],
    ["sketch12cg-set","冷灰 CG · 12 色","C-00 C-0 C-1 C-2 C-3 C-4 C-5 C-6 C-7 C-8 C-9 C-10"],
    ["sketch12wg-set","暖灰 WG · 12 色","W-00 W-0 W-1 W-2 W-3 W-4 W-5 W-6 W-7 W-8 W-9 W-10"],
  ];

  const catalog = new Map();
  const allGroups = families.map(([family, entries]) => {
    const swatches = entries.split('|').map(entry => {
      const [code, rgb, officialName, label] = entry.split(':');
      const color = { code, name: label || officialName, officialName, family, hex: '#' + rgb };
      catalog.set(code, color);
      return color;
    });
    return { name: family, swatches };
  });

  function palette(id, name, groups, source, description) {
    const swatches = groups.flatMap(group => group.swatches);
    return { id, name, groups, swatches, source, description, colors: swatches.map(color => color.hex) };
  }

  root.DrawingPalettes = kits.map(([id, name, codes]) => {
    const groups = new Map();
    for (const code of codes.split(' ')) {
      const color = catalog.get(code);
      if (!groups.has(color.family)) groups.set(color.family, []);
      groups.get(color.family).push(color);
    }
    return palette(id, name, Array.from(groups, ([name, swatches]) => ({ name, swatches })),
      'https://copic.jp/en/product/sketch-set/' + id + '/', 'Copic Sketch 原厂套装');
  });
  root.DrawingPalettes.push(palette('sketch-chart', '全色号 · 357 色', allGroups, chart,
    '358 支系列中的 357 个着色色号。0 号为无色调和液。'));
})(window);
