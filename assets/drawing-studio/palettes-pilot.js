/* PILOT Iroshizuku: 30 regular colors released during 2007–2024, including
   retired colors. RGB is sampled from official ink swatches for display.
   Website hue families are our own grouping. See docs/drawing-pilot-palettes.md. */
(function (root) {
  'use strict';
  const families = [
    ["红紫", "YB:7d0039:山葡萄|MS:432489:紫式部|TT:c0006b:踯躅|MO:ce0036:红叶|KM:e85270:秋樱|HA:ef95a9:花筏"],
    ["橙黄棕", "FG:d73b13:冬柿|YU:f29500:夕烧|TO:f3b61d:燈路|IH:8d7a3f:稻穗|TK:5c3c3a:土笔|YG:433838:山栗"],
    ["蓝", "AS:4559a6:朝颜|AJ:96a8d5:紫阳花|TS:5e5bf1:露草|KO:006fb1:绀碧|AMA:009fe8:天色|RI:18799a:六花"],
    ["绿", "KJ:0086b5:孔雀|SHR:006e47:深绿|SY:004f5e:松露|CHK:509425:竹林|SU:007c74:翠玉|HO:d6d500:萤火"],
    ["深灰蓝", "TY:005989:月夜|SNK:00234f:深海|TAK:000000:竹炭|FS:65747e:冬将军|KS:6c6a6b:雾雨|SYG:765e5d:春晓"]
  ];
  const groups = families.map(([name, entries]) => ({ name,
    swatches: entries.split('|').map(entry => {
      const [shortCode, rgb, label] = entry.split(':');
      return { code: label, name: label, originalCode: 'INK-50-' + shortCode, family: name, hex: '#' + rgb };
    })
  }));
  const swatches = groups.flatMap(group => group.swatches);
  root.DrawingPalettes.push({ id: 'pilot-iroshizuku30', name: '色彩雫 · 历年 30 色',
    category: '百乐彩墨', columns: 6, matchMethod: 'color',
    description: '历年常规 30 色 · 含历史配色', groups, swatches,
    source: 'https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/docs/drawing-pilot-palettes.md',
    sourceLabel: '色卡来源', colors: swatches.map(color => color.hex) });
})(window);
