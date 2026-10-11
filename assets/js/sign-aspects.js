/* The fourteen Hours/principles: a single lightweight registry for home and archive.
 * Explicit per-quote aspect takes precedence over the conservative text-based fallback.
 * Colors decorate only the icons/metadata, never the quoted words.
 */
(() => {
  'use strict';
  const definitions = [
    ['lantern','灯','#f0d400','理性、启迪、真相与洞见'],
    ['forge','铸','#ec8b46','创造、技艺、变革与重塑'],
    ['edge','刃','#cdd448','斗争、抗争、冲突与决断'],
    ['winter','冬','#9fd9ec','静默、终结、失落与追忆'],
    ['heart','心','#e36f86','生命、守护、韧性与延续'],
    ['grail','杯','#df5d58','爱欲、欢愉、渴望与苦痛'],
    ['moth','蛾','#e8dfb5','本能、混沌、蜕变与迷狂'],
    ['knock','启','#ab52d3','破除界限、开启与通行'],
    ['histories','秘史','#d447bf','历史的裂痕、叙事与遗痕'],
    ['rose','引','#d966e4','探索、旅途、远方与希望'],
    ['nectar','蜜','#179b75','草木、自然、原始生机'],
    ['sky','穹','#378eec','天空、规律、和谐与歌咏'],
    ['scale','鳞','#b68a49','大地、古老血脉与沉睡之力'],
    ['moon','月','#84768e','黑夜、海洋、秘密与禁忌']
  ];
  const byKey = Object.fromEntries(definitions.map(([key,name,color,meaning],index) =>
    [key,{key,name,color,meaning,index}]));

  // Each group gives evidence of an aspect's meaning. Multiple distinct concepts
  // and affective cues outweigh a single incidental word or book title.
  const clues = {
    lantern: [
      [/真理|真相|洞见|理性|理智|智慧|求知|启蒙|认识论|科学|科学家|学说|学术|数学证明|发现真相|精神之光|光明|洞察/g,3],
      [/知识|思考|思维|思辨|逻辑|理论|哲学|理解|认识|看清|解释|证明|认知|探索真相|判断|批判|客观|信仰|怀疑/g,1.35],
      [/思想|精神|原则|道德|观点|观念|问题|道理|科学性|研究|学者|思索|世界观/g,.65]
    ],
    forge: [
      [/锻造|冶炼|金属|钢铁|工厂|工业|机器|机械|引擎|炼金|铸造|改造世界|技术革命|发明|工程|制造|建造|建设|创造|重塑|重建/g,3],
      [/变革|变换|变形|改变|工具|技艺|工艺|技术|工人|劳动|生产|工作|设备|摧毁|毁灭|火焰|焰火|燃烧/g,1.5]
    ],
    edge: [
      [/革命|战争|战斗|抗争|斗争|起义|抵抗|反抗|征服|决战|敌军|军队|战略|战术|武装|厮杀|屠杀|血战|搏斗|战场|军人|士兵/g,3],
      [/敌人|胜利|失败|武器|刀剑|力量|攻击|冲突|压迫|暴力|权力斗争|反对|牺牲|流血|不屈|枪|反动|阶级斗争|镇压|决不退让/g,1.65],
      [/勇敢|奋战|勇气|坚决|意志|自由|强大|拼搏|威胁|危险|挣扎/g,.9]
    ],
    winter: [
      [/逝去|死亡|亡灵|死者|死神|墓地|坟墓|葬礼|墓碑|悼念|挽歌|遗体|尸体|永别|哀悼|死去|消亡|灭绝|终结/g,3],
      [/遗忘|忘却|回忆|怀念|追忆|记忆|孤独|寂寞|凄凉|寂静|沉默|悲痛|悲哀|哀伤|绝望|消失|流逝|失落|衰老|寒冷|冰雪/g,1.65],
      [/失去|悲伤|眼泪|哭泣|岁月|永恒|痛苦|寂寥|过去|寂静无声/g,.9]
    ],
    heart: [
      [/守护|保护|治愈|康复|顽强|坚韧|坚持不懈|永不放弃|不屈不挠|不息|团结|互助|友谊|友情|善良|仁慈|宽恕|复苏/g,3],
      [/生命|生存|活着|活下去|延续|维持|生机|勇气|陪伴|帮助|关怀|照顾|安慰|信任|健康|温暖|活力|希望|友人|朋友|幸福/g,1.5],
      [/家庭|亲人|人性|人的尊严|自由意志|坚守|人民|人类|爱护|灵魂/g,.5]
    ],
    grail: [
      [/欲望|爱欲|肉欲|情欲|情人|情欲|情爱|热恋|恋人|亲吻|拥抱|情欲|贪婪|嫉妒|饥饿|饱餐|宴会|欢愉|快感|性爱/g,3],
      [/爱情|爱人|恋爱|情感|渴望|渴求|美丽|迷恋|幸福|快乐|享乐|愉悦|鲜血|痛楚|痛苦|激情|欢笑|欢喜|母亲|生育|肉体|欲求/g,1.7],
      [/爱|美|血|情|身体|饮食|温柔|诱惑|悲欢/g,.35]
    ],
    moth: [
      [/蜕变|变身|幻觉|梦境|梦魇|迷狂|癫狂|疯癫|疯狂|野兽|兽性|本能|伪装|谎言|欺骗|迷惑|幻象|混沌|荒诞|不可理喻/g,3],
      [/梦|虚幻|幻梦|神秘|欺瞒|迷失|慌乱|躁动|狂热|怪诞|错觉|直觉|冲动|变化无常|模糊|欲望|恐惧|虚无/g,1.35],
      [/奇怪|奇异|异样|不安|迷茫|森林深处|昆虫|蛾子/g,.9]
    ],
    knock: [
      [/开启|打开|开门|钥匙|门扉|门户|破门|突破|冲破|越界|逃脱|逃离|挣脱|解放|打破枷锁|解开|破解|解锁|跨越|通道/g,3],
      [/边界|界限|束缚|枷锁|牢笼|禁锢|封闭|出路|入口|出口|通往|通道|道路|离开|逃走|出发|进入|自由|限制|门/g,1.4],
      [/改变现状|不可能|未知的世界|新的可能|隔阂|阻碍/g,1]
    ],
    histories: [
      [/历史|史书|史学|史料|史诗|古代史|革命史|史册|编年|考古|帝国兴亡|历史进程|古今|往事|历史记忆|历史学家/g,2.8],
      [/时代|世纪|年代|过去|以往|曾经|昔日|传统|先人|古代|朝代|古老|帝国|民族|文明|历史性|遗迹|变迁|继承/g,1.1]
    ],
    rose: [
      [/探索|探险|远行|远方|航行|航海|旅程|旅行|征途|远征|新世界|新天地|地平线|彼岸|星际|星海|穿越星空|飞向|发现新世界/g,3],
      [/未来|前进|启程|远处|遥远|寻求|追寻|追求|理想|希望|星辰|群星|宇宙|航天|宇航|星球|银河|宇宙空间|黎明|曙光|远眺/g,1.5],
      [/走向|道路|路途|出发|明天|愿望|光明的未来|远离|新生/g,.75]
    ],
    nectar: [
      [/森林|林地|树木|树叶|花朵|草木|植物|自然界|生态|田野|原野|乡野|春水|溪流|河岸|春天|生机勃勃|萌芽|鸟鸣|蜂蜜|野草/g,3],
      [/自然|草原|山林|土地|泥土|雨水|春风|绿叶|鲜花|流水|河流|山坡|大树|树林|季节|百花|生命力|大自然/g,1.55],
      [/花|草|树|鸟|溪|绿|春|秋|乡村|田园|森林深处/g,.35]
    ],
    sky: [
      [/数学|方程|定理|定律|平衡|均衡|和谐|旋律|歌唱|歌声|音乐|乐曲|飞行|飞翔|苍穹|天空|风暴|星象|气象|星空|天体/g,3],
      [/规律|法则|秩序|系统|回响|云层|大气|微风|雷电|风雨|阳光|太阳|月光|流星|轨道|宇宙|星云|科学|辩证|声音|歌|风/g,1.3]
    ],
    scale: [
      [/史前|远古|祖先|血脉|血统|化石|岩石|岩层|地层|龙|恐龙|地底|地下深处|大地深处|太古|洪荒|原始时代/g,3],
      [/古老|古代|千年|万年|亿年|巨兽|沉睡|唤醒|遗传|原始|大地|山脉|高山|石块|岩壁|岩浆|地球|深处/g,1.6]
    ],
    moon: [
      [/秘密|隐秘|禁忌|隐瞒|遮掩|藏匿|黑夜|月亮|月色|月光|深海|潮汐|罪恶|罪行|阴谋|不可告人|被遗忘的秘密/g,3],
      [/夜晚|深夜|夜幕|夜色|黑暗|阴影|海洋|大海|海面|海水|港口|海浪|海岸|海风|隐蔽|神秘|隐藏|低语|谜团|不为人知/g,1.55],
      [/夜|海|月|深渊|朦胧|阴暗|静悄悄/g,.35]
    ]
  };
  function classify(quote) {
    const text=String(quote?.text||'');
    const scores=Object.fromEntries(definitions.map(([key])=>[key,0]));
    for(const [key,hints] of Object.entries(clues)) {
      for(const [pattern,weight] of hints) {
        pattern.lastIndex=0;
        const matches=text.match(pattern);
        if(matches) scores[key]+=weight*Math.min(3,matches.length);
      }
    }
    if(quote?.theme==='scenery') { scores.nectar+=1.2; scores.sky+=1.2; scores.moon+=.55; scores.rose+=.6; }
    if(quote?.theme==='inspiration') { scores.heart+=1.3; scores.edge+=.8; scores.rose+=.7; }
    if(quote?.theme==='reflection') scores.lantern+=.65;
    // Affective and paired-concept evidence (not an author's name or source).
    if(/心(脏|跳|灵)|永远(不|地)?(保护|守护|活着)|活下去/.test(text)) scores.heart+=2;
    if(/死(亡|去|者)|回忆|怀念/.test(text) && /寂静|怀念|失去|永远|从未|无法|悲|痛|沉默|孤独/.test(text)) scores.winter+=1.8;
    if(/历史|过去|往事/.test(text) && /记忆|留下|伤|消逝|遗忘|重演|时代|影响|今天|现在/.test(text)) scores.histories+=1.7;
    if(/理性|真理|理论|科学|知识|逻辑/.test(text) && /发现|理解|认识|思想|求知|发现|解释|事实/.test(text)) scores.lantern+=1.6;
    if(/战争|革命|斗争|反抗/.test(text) && /胜利|自由|勇气|敌人|失败|牺牲|压迫|力量|决心/.test(text)) scores.edge+=1.6;
    if(/太空|宇宙|星球|星系|航天/.test(text) && /飞向|抵达|前往|探索|远方|旅行|旅程/.test(text)) scores.rose+=2;
    if(/天|风|雨|星|乐|音/.test(text) && /和谐|法则|平衡|规律|数学|交响|旋律/.test(text)) scores.sky+=2;
    if(/爱情|爱欲|渴望|爱人/.test(text) && /肉体|快乐|痛苦|占有|欲望|幸福|亲吻/.test(text)) scores.grail+=1.7;
    if(/突破|挣脱|解放|打破|冲破/.test(text) && /限制|牢笼|枷锁|世界|旧|自由/.test(text)) scores.knock+=2;
    if(/创造|工业|技术|机器|发明/.test(text) && /世界|未来|改变|文明|人类|伟大/.test(text)) scores.forge+=1.8;
    if(/原始|远古|先祖/.test(text) && /生物|地球|沉睡|历史|力量|血脉/.test(text)) scores.scale+=1.7;
    let winner='lantern', best=-1;
    for(const [key] of definitions) {
      if(scores[key]>best) { winner=key;best=scores[key]; }
    }
    return best<1.7?'lantern':winner;
  }
  function get(quote) {
    const key=quote?.aspect;
    return byKey[key]||byKey[classify(quote)]||byKey.lantern;
  }
  function badge(quote,compact=false) {
    const aspect=get(quote);
    const tag=document.createElement('span');
    tag.className='rc-aspect-tag'+(compact?' rc-aspect-tag--compact':'');
    tag.style.setProperty('--rc-aspect-color',aspect.color);
    tag.style.setProperty('--rc-aspect-position',String(-aspect.index*40)+'px');
    tag.style.setProperty('--rc-aspect-position-compact',String(-aspect.index*28)+'px');
    tag.style.setProperty('--rc-aspect-position-mobile',String(-aspect.index*32)+'px');
    tag.title=aspect.name+' · '+aspect.meaning;
    tag.setAttribute('aria-label','准则：'+aspect.name+'；'+aspect.meaning);
    const icon=document.createElement('span');
    icon.className='rc-aspect-symbol';
    icon.setAttribute('aria-hidden','true');
    const label=document.createElement('span');
    label.className='rc-aspect-name';
    label.textContent=aspect.name;
    tag.append(icon,label);
    return tag;
  }
  globalThis.RCSignAspects={definitions,byKey,classify,get,badge};
})();