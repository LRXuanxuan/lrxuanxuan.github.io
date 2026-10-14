/* 纯文字塔罗：78 张标准牌、可选逆位、无网络请求和个人记录。 */
(() => {
  'use strict';
  const root = document.querySelector('[data-rc-tarot]');
  if (!root) return;

  // 格式：中文名、英文名、正位关键词、逆位关键词。
  const majors = [
    ['愚者', 'The Fool', '新起点、自由、勇于尝试', '草率行事、犹豫不前、准备不足'],
    ['魔术师', 'The Magician', '主动创造、善用资源、行动力', '操控、能力未发挥、方向偏差'],
    ['女祭司', 'The High Priestess', '直觉、沉思、尚未揭晓的事', '忽视内心、信息不明、直觉受阻'],
    ['皇后', 'The Empress', '滋养、丰饶、创造与关怀', '过度依赖、照顾失衡、停滞'],
    ['皇帝', 'The Emperor', '秩序、责任、稳固结构', '僵化、控制欲、权威失衡'],
    ['教皇', 'The Hierophant', '传承、学习、共同准则', '质疑旧规、墨守成规、价值不合'],
    ['恋人', 'The Lovers', '连结、价值一致、重要选择', '关系失衡、价值冲突、犹疑'],
    ['战车', 'The Chariot', '意志、前进、自我掌控', '失控、目标分散、强行推进'],
    ['力量', 'Strength', '耐心、柔韧、内在勇气', '自我怀疑、情绪失控、力量耗损'],
    ['隐者', 'The Hermit', '独处、探寻、内在指引', '过度封闭、迷失、拒绝求助'],
    ['命运之轮', 'Wheel of Fortune', '变化、周期、转机', '时机不顺、抗拒变化、反复'],
    ['正义', 'Justice', '公正、因果、审慎判断', '偏见、失衡、逃避责任'],
    ['倒吊人', 'The Hanged Man', '暂停、换位思考、放下执念', '无谓拖延、固执、徒劳牺牲'],
    ['死神', 'Death', '结束旧阶段、转型、重生', '抗拒告别、停滞、难以放手'],
    ['节制', 'Temperance', '调和、平衡、循序渐进', '失衡、过度、缺少耐心'],
    ['恶魔', 'The Devil', '觉察依附、诱惑与束缚', '开始挣脱束缚、重新选择、反复依赖'],
    ['高塔', 'The Tower', '突变、旧结构崩解、看清现实', '回避必要改变、延迟冲击、余波'],
    ['星星', 'The Star', '希望、疗愈、重新相信', '失望、自我怀疑、希望微弱'],
    ['月亮', 'The Moon', '迷雾、潜意识、不确定性', '逐步看清、恐惧消退、仍有困惑'],
    ['太阳', 'The Sun', '明朗、活力、坦诚与喜悦', '快乐受阻、短暂阴霾、过度乐观'],
    ['审判', 'Judgement', '觉醒、反思、重新出发', '自责、逃避审视、迟疑不决'],
    ['世界', 'The World', '完成、整合、阶段圆满', '尚未收尾、目标未竟、缺少闭环']
  ];

  // 每种花色依次为王牌、二至十、侍从、骑士、王后、国王。
  const suits = [
    ['权杖', 'Wands', [
      '新灵感、行动的火花|热情分散、起步受阻',
      '规划远景、拓展视野|犹豫、计划不足',
      '展望未来、机会扩张|进度阻滞、期待落空',
      '庆祝、归属感、稳固基础|关系不稳、庆祝延迟',
      '竞争、磨合、不同意见|内耗、逃避冲突',
      '胜利、认可、信心|缺少认可、自负、受挫',
      '坚守立场、迎接挑战|疲于应对、退让',
      '迅速进展、消息到来|延误、方向混乱',
      '韧性、警觉、坚持到底|疲惫、过度防备',
      '责任重担、努力承担|负担过重、难以授权',
      '好奇、探索、新鲜热情|三分钟热度、缺少落实',
      '冒险、冲劲、积极行动|急躁、莽撞、反复无常',
      '自信、热情、独立表达|自我怀疑、热情受挫',
      '领导力、愿景、开创|专断、急功近利'
    ]],
    ['圣杯', 'Cups', [
      '情感开启、共鸣、新关系|情感封闭、内心匮乏',
      '心意相通、合作、互相理解|误解、失衡、疏离',
      '欢聚、友谊、共享喜悦|关系失和、过度放纵',
      '倦怠、重新审视需求|走出停滞、注意新机会',
      '失落、遗憾、看见未失去的|逐渐释怀、继续前行',
      '怀旧、温情、旧日回忆|困在过去、需要长大',
      '诸多选项、想象、诱惑|拨开幻想、选择困难',
      '离开旧路、寻找更深意义|难以放下、停留原地',
      '满足、心愿、享受成果|内心空缺、过高期待',
      '亲密、和谐、情感圆满|表面和谐、关系紧张',
      '温柔、创意、情感消息|敏感过度、情绪不成熟',
      '浪漫、理想、追随心意|不切实际、情绪摇摆',
      '共情、体贴、理解内心|边界模糊、情绪淹没',
      '情绪成熟、包容、稳重|压抑感受、情绪操纵'
    ]],
    ['宝剑', 'Swords', [
      '清晰、真相、新见解|思路混乱、判断失准',
      '两难、权衡、暂时僵持|逃避选择、信息过载',
      '伤痛、失望、面对事实|开始疗愈、旧伤反复',
      '休整、恢复、暂停争执|难以休息、倦怠加深',
      '争胜的代价、矛盾|冲突收束、仍存芥蒂',
      '过渡、离开困境、迁移|抗拒离开、进展迟缓',
      '策略、独行、隐瞒|隐瞒曝光、策略失当',
      '受限、自我束缚、困局|看见出口、重获主动',
      '焦虑、担忧、夜不能寐|担忧缓解、仍需支持',
      '终结、低谷、重新开始|复原缓慢、难以放手',
      '敏锐、求知、认真观察|言语鲁莽、信息不实',
      '果断、追求真相、快速推进|冲动、争执、缺乏周全',
      '独立、清醒、理性边界|过于严苛、疏离',
      '公正判断、原则、专业|滥用权威、偏执'
    ]],
    ['星币', 'Pentacles', [
      '实际机会、资源、扎根|机会错失、规划不足',
      '兼顾多事、灵活调配|超负荷、节奏失衡',
      '协作、专业、共同建设|分工失调、协作不畅',
      '稳固、节制、守护资源|过度控制、害怕失去',
      '匮乏、困难、寻求支持|逐渐改善、获得援助',
      '给予、分享、互惠|付出失衡、依赖',
      '耐心耕耘、评估进度|急于求成、回报不足',
      '练习、精进、专注技艺|敷衍、倦怠、缺少投入',
      '独立、收获、自在生活|依赖、成果不稳',
      '长期积累、家业、传承|根基松动、短视',
      '学习技能、务实新机会|缺少落实、三心二意',
      '踏实、耐心、循序推进|停滞、僵化、缺少动力',
      '务实、照料、安稳与慷慨|照顾失衡、忽略自身',
      '稳健、经营、物质成熟|唯利是图、固执保守'
    ]]
  ];

  const rankCn = ['王牌', '二', '三', '四', '五', '六', '七', '八', '九', '十', '侍从', '骑士', '王后', '国王'];
  const rankEn = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
  const deck = majors.map((row, index) => ({
    name: String(index) + ' · ' + row[0],
    english: row[1],
    upright: row[2],
    reversed: row[3],
    category: '大阿尔卡那'
  }));
  for (const [suitCn, suitEn, meanings] of suits) {
    meanings.forEach((item, index) => {
      const pair = item.split('|');
      deck.push({
        name: suitCn + rankCn[index],
        english: rankEn[index] + ' of ' + suitEn,
        upright: pair[0],
        reversed: pair[1],
        category: '小阿尔卡那 · ' + suitCn
      });
    });
  }
  if (deck.length !== 78 || suits.some(suit => suit[2].length !== 14)) return;

  const spread = root.querySelector('[data-tarot-spread]');
  const allowReversed = root.querySelector('[data-tarot-reversed]');
  const drawButton = root.querySelector('[data-tarot-draw]');
  const output = root.querySelector('[data-tarot-result]');
  const positions = [
    ['过去', '既有经历与影响'],
    ['现在', '当前处境与关注点'],
    ['未来', '一种可能的发展方向']
  ];

  function randomInt(max) {
    if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
      const value = new Uint32Array(1);
      const limit = 4294967296 - (4294967296 % max);
      do { globalThis.crypto.getRandomValues(value); } while (value[0] >= limit);
      return value[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function drawCards() {
    const count = spread.value === 'three' ? 3 : 1;
    const indices = Array.from({ length: deck.length }, (_, i) => i);
    const chosen = [];
    // 局部 Fisher–Yates 洗牌：同一次抽取绝不重复。
    for (let i = 0; i < count; i += 1) {
      const j = i + randomInt(indices.length - i);
      [indices[i], indices[j]] = [indices[j], indices[i]];
      chosen.push({ card: deck[indices[i]], reversed: allowReversed.checked && randomInt(2) === 1 });
    }

    const list = document.createElement('ol');
    list.className = 'rc-tarot-cards';
    for (const [i, picked] of chosen.entries()) {
      const item = document.createElement('li');
      item.className = 'rc-tarot-card';
      const position = document.createElement('div');
      position.className = 'rc-tarot-position';
      position.textContent = count === 1 ? '单张提示' : positions[i][0] + ' · ' + positions[i][1];
      const name = document.createElement('h3');
      name.textContent = picked.card.name + ' · ' + (picked.reversed ? '逆位 ↯' : '正位 ↑');
      const english = document.createElement('p');
      english.className = 'rc-tarot-english';
      english.textContent = picked.card.english + ' / ' + picked.card.category;
      const meaning = document.createElement('p');
      meaning.className = 'rc-tarot-meaning';
      meaning.textContent = picked.reversed ? picked.card.reversed : picked.card.upright;
      item.append(position, name, english, meaning);
      list.append(item);
    }
    output.replaceChildren(list);
    output.focus({ preventScroll: true });
  }

  drawButton.addEventListener('click', drawCards);
})();
