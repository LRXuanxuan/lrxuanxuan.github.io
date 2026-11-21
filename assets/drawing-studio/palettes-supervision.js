/* Super Vision watercolor sets. Display RGB is sampled from product charts
   and photographed paper swatches; it is not manufacturer-specified RGB.
   Monet/Mucha and cinema numbers are display indices, not verified factory codes.
   Sources and limitations: docs/drawing-supervision-palettes.md. */
(function (root) {
  'use strict';
  const sets = [
    ["supervision-artists50", "大艺术家 50 色", "5 个十色系列 · 每组两行五色", [
      ["葛饰北斋", "101:e1c5a0|102:c8b16e|103:8fafba|104:2e5977|105:172242|106:daa593|107:73291c|108:675e59|109:15392f|110:709d7e"],
      ["莫兰迪", "111:d7ca9e|112:a2836f|113:664b42|114:8e847b|115:aeafa7|116:485961|117:635b80|118:1c2d59|119:505c84|120:c5ac8e"],
      ["莫奈", "121:decfd6|122:d294a7|123:ae97b2|124:9793c5|125:405790|126:6a5e70|127:b7a29f|128:dda575|129:6c89b0|130:2b4b5a"],
      ["梵高", "131:deca59|132:bc9321|133:8d4e25|134:4d714b|135:18442d|136:032139|137:1d378c|138:33698b|139:66979c|140:b2d2cf"],
      ["穆夏", "141:e4c1ab|142:dbb35c|143:bf9763|144:d67f71|145:ee7e36|146:e85043|147:573720|148:501c11|149:709277|150:a4c0db"]
    ]],
    ["supervision-gray60", "高级灰 60 色", "6 个十色系列 · 保留原色号 001–060", [
      ["棉花糖", "001:d4d9d2|002:5f7d73|003:b2af9e|004:b8d0ba|005:6f576d|006:8b8b97|007:cb7f89|008:f6d1c9|009:cfb7b5|010:7891ba"],
      ["普罗旺斯", "011:f9d2cb|012:abc0bb|013:dcdcda|014:edc1da|015:7f9998|016:b6b5d5|017:daeeef|018:425e76|019:81729d|020:725e5f"],
      ["仲夏游园", "021:e68da1|022:f6c0d8|023:ddc0dc|024:b3a7bf|025:f6cfc8|026:b6dbb9|027:f2ecf0|028:fae3e9|029:b78eb0|030:4d92b9"],
      ["风韵雅宋", "031:ccb5bd|032:b8c7ca|033:a0c3bd|034:caa378|035:796c5b|036:a56d76|037:8a9aa7|038:cabe6a|039:e4dad9|040:864e73"],
      ["落日旅行", "041:63718b|042:73698c|043:76546d|044:4f3b57|045:7f3b3c|046:b55b52|047:df9280|048:f0c382|049:d3996b|050:825341"],
      ["长安宫乐", "051:8c1d23|052:540b16|053:e88f29|054:f6e07b|055:d75531|056:5d3619|057:166063|058:4c8274|059:0b2f3d|060:22140b"]
    ]],
    ["supervision-cinema60", "电影 60 色", "6 个十色系列 · 01–60", [
      ["致爱丽丝", "01:a68692|02:9c81cf|03:7380e5|04:d68eba|05:db89bb|06:f88870|07:fc5530|08:7184a0|09:70c4ec|10:02c6c4"],
      ["妖猫物语", "11:b9c8e6|12:018fcf|13:816caa|14:8d72c3|15:dc6a93|16:f0175a|17:f26e3b|18:f14a4f|19:d87c1c|20:3ed2aa"],
      ["风林火山", "21:fa85c6|22:fc6ba6|23:f59e9f|24:f0b774|25:959de8|26:9a56b5|27:c454ac|28:1bcee1|29:90e0b7|30:dbf0ad"],
      ["赛博朋克", "31:5ce6da|32:96f9ad|33:22d7d8|34:6759fb|35:fa55e3|36:fa90cf|37:b6298a|38:7b3eb3|39:d54878|40:fc96c8"],
      ["坠入", "41:01a3b8|42:6492ba|43:f6aba8|44:fd6e69|45:f65c5f|46:b04d87|47:502f77|48:d42d45|49:fc9e04|50:efe001"],
      ["回到未来", "51:dbd6a6|52:f97903|53:fe71cc|54:f07276|55:dd8035|56:d89d5f|57:b4715b|58:bfd995|59:87d1c9|60:73b298"]
    ]]
  ];
  const source = 'https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/docs/drawing-supervision-palettes.md';
  for (const [id, name, description, series] of sets) {
    const groups = series.map(([family, entries]) => ({
      name: family,
      swatches: entries.split('|').map(entry => {
        const [code, rgb] = entry.split(':');
        return { code: code || family, name: family,
          originalCode: (id === 'supervision-cinema60' || family === '莫奈' || family === '穆夏') ? null : (code || null), family: family, hex: '#' + rgb };
      })
    }));
    const swatches = groups.flatMap(group => group.swatches);
    root.DrawingPalettes.push({ id, name, description, category: '视爵水彩', columns: 5, matchMethod: 'color',
      groups, swatches, source, sourceLabel: '色卡来源', colors: swatches.map(color => color.hex) });
  }
})(window);
