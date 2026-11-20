/* Drawing-reference exercises. Photos supplied by the user; full composition and source watermarks retained. */
window.ColorBlockLessons = [
  {
    id: 'uniform-303',
    title: '校服：把细节收进大块',
    image: '/assets/color-block-studio/ref-303.webp',
    thumbnail: '/assets/color-block-studio/thumb-303.webp',
    width: 746,
    height: 1120,
    alt: '浅褐外套、浅蓝开衫、深蓝格裙的人物站姿参考，浅色背景。',
    source: '用户提供 · 速写班长 #速写素材#303·60',
    focus: '三大明暗组 · 冷暖配色',
    introduction: '先读出头发、裙子和袜子的暗块，再区分外套与开衫。格纹可以等大关系稳定后再加。',
    hints: [
      '深色裙子里仍有明暗起伏；归入暗组不等于所有褶皱都要画黑。',
      '手臂横过躯干，袖口与衣身的遮挡关系比每一条针织纹更值得保留。',
      '两腿之间的浅色空隙参与表达站姿，压黑时要留住。'
    ],
    steps: [
      {
        title: '01 先分亮、中、暗',
        mode: 'value',
        instruction: '用三组观察头发、格裙、袜子是否形成清楚的暗形；点选灰阶组，回看它覆盖原图的哪些位置。',
        reason: '先建立全身的大明暗关系，衣服格纹和细小反光暂时服从所在的大组。',
        settings: { levels: 3, dark: 35, light: 72, blur: 2 }
      },
      {
        title: '02 固定形状再换颜色',
        mode: 'color',
        instruction: '从六色开始，固定分块后微调浅褐、灰蓝和深蓝。对照灰度，检查深蓝裙子是否仍比上衣更暗。',
        reason: '同一块形状只改颜色，才能单独比较冷暖和明度变化；换色不必同时改变边界。',
        settings: { k: 6, blur: 2 }
      },
      {
        title: '03 留住遮挡，减掉格纹',
        mode: 'line',
        instruction: '优先检查手臂与躯干、手与脸、裙摆的交接。擦除或减弱过密格纹，保留能说明前后关系的短线。',
        reason: '格纹是表面花色，手臂交叠是形体关系；两者不需要相同的线条分量。',
        settings: { lineAmount: 5 }
      },
      {
        title: '04 安排黑块与白隙',
        mode: 'black',
        instruction: '先看纯黑块，再局部修整头发、袜子和鞋。保护两腿间、手臂旁的浅色空隙，比较修改前后。',
        reason: '暗衣物、头发和投影都可能进入阈值候选，但压黑的取舍由你决定。',
        settings: { threshold: 24 }
      }
    ]
  },
  {
    id: 'dark-suit-323',
    title: '黑色西装：黑要有形',
    image: '/assets/color-block-studio/ref-323.webp',
    thumbnail: '/assets/color-block-studio/thumb-323.webp',
    width: 746,
    height: 1120,
    alt: '黑色西装与帽子的人物前倾站姿，屈肘，浅色背景。',
    source: '用户提供 · 速写班长 #速写素材#323·55',
    focus: '黑块组织 · 负形与留白',
    introduction: '黑衣很适合练习大块概括。重点看弯肘围出的空隙、衣摆轮廓，以及深色里需要保留的区分。',
    hints: [
      '右侧弯肘与腰之间有一块浅背景，它能帮助读清手臂姿态。',
      '帽子、外套和裙子颜色都深，仍可用轮廓转折与少量浅缝区分。',
      '腿部明度明显不同于西装；不要仅因都偏暗便一并填成纯黑。'
    ],
    steps: [
      {
        title: '01 看清一大块与几小块',
        mode: 'value',
        instruction: '先用三组分开浅背景、腿部中间调和深色衣帽。调阈值时观察腿部是否过早并入衣服的暗组。',
        reason: '归纳要保留关键差异；黑衣和较浅的腿部若合成一块，姿态会变得难读。',
        settings: { levels: 3, dark: 30, light: 73, blur: 2 }
      },
      {
        title: '02 少色也保留层次',
        mode: 'color',
        instruction: '用五色观察衣帽、肤色、衬衫和背景。固定分块后，试着让最深色略浅一点，比较轮廓与内部层次。',
        reason: '画面中的最深色可以按练习目的调整；相邻颜色的关系比单个色号更重要。',
        settings: { k: 5, blur: 2 }
      },
      {
        title: '03 让边界说明姿态',
        mode: 'line',
        instruction: '检查帽檐、领口、弯肘和衣摆转折。把西装内零碎的浅褶减弱，避免线条把大黑形切得太碎。',
        reason: '在深色衣物里，几处有方向的转折通常比均匀铺满细线更便于阅读。',
        settings: { lineAmount: 5 }
      },
      {
        title: '04 给黑块留出呼吸处',
        mode: 'black',
        instruction: '局部补黑衣帽的碎点，同时用留白笔刷保护弯肘内侧、领口和腿间空隙。缩小看整体是否仍读得出前倾姿态。',
        reason: '黑块面积没有统一标准；留白的位置和形状会直接影响动作是否清楚。',
        settings: { threshold: 28 }
      }
    ]
  },
  {
    id: 'flowing-cloth-320',
    title: '蓝黄长衣：衣褶的取舍',
    image: '/assets/color-block-studio/ref-320.webp',
    thumbnail: '/assets/color-block-studio/thumb-320.webp',
    width: 746,
    height: 1120,
    alt: '浅蓝与黄色长衣的人物侧倾姿态，抬起双臂，浅色飘带跨过衣身。',
    source: '用户提供 · 速写班长 #速写素材#320·56',
    focus: '轮廓节奏 · 结构与纹理',
    introduction: '大部分衣服都很浅，头发和腰带提供深色参照。让长轮廓、袖口和飘带先讲清动作。',
    hints: [
      '裙子的密条纹属于表面花色；能解释体积的衣褶不必与条纹逐条对应。',
      '飘带跨过胸前和手臂，交接处适合练习遮挡线的轻重。',
      '亮衣与浅背景相邻时，某些边缘可以很轻，不必把外轮廓全部加粗。'
    ],
    steps: [
      {
        title: '01 先认浅色里的大组',
        mode: 'value',
        instruction: '用三组看头发、腰带与大片浅衣。不要为了凑满三组而把整件浅裙压暗，可调整亮组边界观察变化。',
        reason: '明暗组的面积不必相等；这张图的明亮基调正来自大面积浅色。',
        settings: { levels: 3, dark: 32, light: 75, blur: 2 }
      },
      {
        title: '02 保留蓝黄的大关系',
        mode: 'color',
        instruction: '从六色开始，先区分灰蓝、黄色、浅背景与深发。固定分块后调色，检查浅蓝与黄色是否仍保有区别。',
        reason: '相近明度的颜色仍能靠色相区别；不必为了分开两件衣服而增加很重的描边。',
        settings: { k: 6, blur: 2 }
      },
      {
        title: '03 删除纹理，留下方向',
        mode: 'line',
        instruction: '先保留袖子外轮廓、腰部收束、裙摆和飘带交接，再减弱密集条纹。每留一条线，都问它说明了什么。',
        reason: '衣褶要帮助表达拉伸、转折或下垂；边缘检测产生的密线只是供选择的候选。',
        settings: { lineAmount: 5 }
      },
      {
        title: '04 少量深色做支点',
        mode: 'black',
        instruction: '先只看头发和腰带附近的黑块候选，再局部调整。保持浅袖与飘带的大亮面，观察少量黑形如何支持动作。',
        reason: '这张参考不需要大面积压黑；把浅衣的所有褶纹填黑会改变原来的明亮关系。',
        settings: { threshold: 20 }
      }
    ]
  },
  {
    id: 'winter-scene-388',
    title: '雪地黄衣：复杂背景的主次',
    image: '/assets/color-block-studio/ref-388.webp',
    thumbnail: '/assets/color-block-studio/thumb-388.webp',
    width: 747,
    height: 1120,
    alt: '穿黄色毛衣与浅蓝长裙的人物站在木屋前，双臂交叠，地面有雪。',
    source: '用户提供 · 速写班长 #速写素材#388·65',
    focus: '背景概括 · 主体与细节',
    introduction: '木墙、针织和格裙都有细纹。先把它们看成几个大面，再决定哪里需要细节，哪里可以安静一些。',
    hints: [
      '黄色上衣和木墙都是偏暖的颜色，分离主体可以同时比较明度与冷暖。',
      '手臂交叠的边界与毛衣针眼不同；优先保留能读出抱臂姿态的线。',
      '背景窗缝很暗，但不是每条都要变成抢眼的黑线；可以主动减少。'
    ],
    steps: [
      {
        title: '01 把复杂纹理并成面',
        mode: 'value',
        instruction: '先用三组与较强平滑看木墙、人物和雪地。检查头发、窗缝等暗块是否过碎，再决定是否需要五组。',
        reason: '细节多时先减少层次，便于观察主体与背景的整体分布，再按需要补回差异。',
        settings: { levels: 3, dark: 34, light: 73, blur: 3 }
      },
      {
        title: '02 区分暖墙与黄衣',
        mode: 'color',
        instruction: '从八色起步，固定分块后调黄衣、蓝裙与木墙的颜色。用灰度对照检查：色相分开了，明度关系是否仍清楚？',
        reason: '相邻的暖色不一定要靠增加颜色数量来区分，也可以比较饱和度与明度。',
        settings: { k: 8, blur: 3 }
      },
      {
        title: '03 先让抱臂姿态清楚',
        mode: 'line',
        instruction: '保留肩部、交叠手臂、围巾与裙摆的关键边界；减弱毛衣针眼和身后的木纹，比较主体是否更易读。',
        reason: '自动边缘会同时响应人物与背景；练习的重点是主动选择两者的线条分量。',
        settings: { lineAmount: 5 }
      },
      {
        title: '04 主动减少背景黑点',
        mode: 'black',
        instruction: '从低阈值开始，观察头发、窗缝和木纹。局部留白不需要的背景碎黑，保留能支撑主体的大暗形。',
        reason: '深色位置是照片给出的信息，哪些进入画面里的黑块，还需要服务你的表现重点。',
        settings: { threshold: 20 }
      }
    ]
  }
];
