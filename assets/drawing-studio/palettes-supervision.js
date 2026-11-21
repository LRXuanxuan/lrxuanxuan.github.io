/* Super Vision watercolor sets. Display RGB is sampled from flat color blocks
   in published product charts; it is not manufacturer-specified RGB.
   Blank codes are deliberately shown as group ordinals, never inferred.
   Sources and limitations: docs/drawing-supervision-palettes.md. */
(function (root) {
  'use strict';
  const sets = [
    ["supervision-artists50", "大艺术家 50 色", "5 个十色系列 · 莫奈/穆夏为组内序号，非原色号", [
      ["葛饰北斋", "101:e1c5a0|102:c8b16e|103:8fafba|104:2e5977|105:172242|106:daa593|107:73291c|108:675e59|109:15392f|110:709d7e"],
      ["莫兰迪", "111:d7ca9e|112:a2836f|113:664b42|114:8e847b|115:aeafa7|116:485961|117:635b80|118:1c2d59|119:505c84|120:c5ac8e"],
      ["莫奈", ":decfd6|:d294a7|:ae97b2|:9793c5|:405790|:6a5e70|:b7a29f|:dda575|:6c89b0|:2b4b5a"],
      ["梵高", "131:deca59|132:bc9321|133:8d4e25|134:4d714b|135:18442d|136:032139|137:1d378c|138:33698b|139:66979c|140:b2d2cf"],
      ["穆夏", ":e4c1ab|:dbb35c|:bf9763|:d67f71|:ee7e36|:e85043|:573720|:501c11|:709277|:a4c0db"]
    ]],
    ["supervision-gray60", "高级灰 60 色", "6 个十色系列 · 保留原色号 001–060", [
      ["棉花糖", "001:d4d9d2|002:5f7d73|003:b2af9e|004:b8d0ba|005:6f576d|006:8b8b97|007:cb7f89|008:f6d1c9|009:cfb7b5|010:7891ba"],
      ["普罗旺斯", "011:f9d2cb|012:abc0bb|013:dcdcda|014:edc1da|015:7f9998|016:b6b5d5|017:daeeef|018:425e76|019:81729d|020:725e5f"],
      ["仲夏游园", "021:e68da1|022:f6c0d8|023:ddc0dc|024:b3a7bf|025:f6cfc8|026:b6dbb9|027:f2ecf0|028:fae3e9|029:b78eb0|030:4d92b9"],
      ["风韵雅宋", "031:ccb5bd|032:b8c7ca|033:a0c3bd|034:caa378|035:796c5b|036:a56d76|037:8a9aa7|038:cabe6a|039:e4dad9|040:864e73"],
      ["落日旅行", "041:63718b|042:73698c|043:76546d|044:4f3b57|045:7f3b3c|046:b55b52|047:df9280|048:f0c382|049:d3996b|050:825341"],
      ["长安宫乐", "051:8c1d23|052:540b16|053:e88f29|054:f6e07b|055:d75531|056:5d3619|057:166063|058:4c8274|059:0b2f3d|060:22140b"]
    ]]
  ];
  const source = 'https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/docs/drawing-supervision-palettes.md';
  for (const [id, name, description, series] of sets) {
    const groups = series.map(([family, entries]) => ({
      name: family,
      swatches: entries.split('|').map((entry, index) => {
        const [code, rgb] = entry.split(':');
        return { code: code || family + '·' + (index + 1),
          name: code ? family : '组内第 ' + (index + 1) + ' 色（非原厂色号）',
          originalCode: code || null, family: family, hex: '#' + rgb };
      })
    }));
    const swatches = groups.flatMap(group => group.swatches);
    root.DrawingPalettes.push({ id, name, description, category: '视爵水彩', columns: 5, matchMethod: 'color',
      groups, swatches, source, sourceLabel: '色卡来源', colors: swatches.map(color => color.hex) });
  }
})(window);
