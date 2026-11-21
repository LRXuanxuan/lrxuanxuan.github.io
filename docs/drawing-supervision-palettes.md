# 视爵水彩色卡：来源与维护

本文件记录轻绘画室「视爵水彩」预设的来源、编号和采样方法。核验日期为
2026-11-21。总维护入口见 [轻绘 · 本地画室](drawing-studio.md)。

## 收录范围与显示约定

| 套装 | 原版小系列 | 套装颜色数 | 原色号核验情况 | 色卡概括 |
| --- | --- | ---: | --- | --- |
| 大艺术家 50 色 | 葛饰北斋、莫兰迪、莫奈、梵高、穆夏 | 50 | 30 个已核实；莫奈、穆夏共 20 个尚未核实 | 默认按 Oklab 色彩距离映射 |
| 高级灰 60 色 | 棉花糖、普罗旺斯、仲夏游园、风韵雅宋、落日旅行、长安宫乐 | 60 | `001`–`060` 全部核实 | 默认按 Oklab 色彩距离映射 |
| 电影 60 色 | 待完整色卡核验 | 暂不收录 | 尚缺完整可核验的六组色卡 | 不创建占位套装 |

两套已收录预设归入「视爵水彩」，使用 `assets/drawing-studio/palettes-supervision.js`
维护小型静态数据，沿用画室的取色、概括、勾线快捷色和工程保存流程。
视爵是水彩配色参考；不要把它归入 Copic 马克笔，或沿用“其余 Copic 套装按明暗”的规则。

视爵的「紧凑排列」跨小系列连续排成每行五色；「按色系」保留上述原版
小系列标题，每组十色排成两行，每行五色。这里的“按色系”指产品自带的
十色小系列，不是重新按红、黄、蓝等色相分类。Copic 继续每行六色。
排法偏好在本机保存，切换品牌或套装时使用对应列数。

右侧快捷栏单独常驻五个无文字勾线色块：纯黑 `#000000`、深棕 `#3f271f`、
中棕 `#75503b`、深灰 `#3a3a3a`、中灰 `#808080`。它们替换原来的线稿黑／背景白
快捷项，不计入 50／60 色，不占任何小系列的十个位置，也不增加色卡网格中的空位。
概括算法仍在当前套装之外保留纯黑 `#000000` 和纯白 `#ffffff` 两个候选，
不从右侧快捷栏生成候选列表；参考图原有透明度继续由原映射流程保护。

## 色号、色名与数据边界

- 高级灰的三位原色号以字符串保存，保留 `001` 等前导零。按色号升序展示每组十色。
- 大艺术家中葛饰北斋 `101`–`110`、莫兰迪 `111`–`120`、梵高 `131`–`140`
  来自可辨认的带编号品牌色卡图。莫奈、穆夏的十个色块和原图顺序已核实，
  原厂色号仍留空；不能根据相邻范围补造编号。
- 按用户最新要求，莫奈的十个色块按顺序显示 `121`–`130`，穆夏的十个色块显示 `141`–`150`。
  这两组数字当前作为用户指定的显示编号，尚未从清晰的厂商编号图独立核实；内部 `originalCode` 仍为空，颜色通过各自 HEX 区分。
  穆夏也常译为“慕夏”，别名只辅助识别，不另建一套十色。
- 高级灰组名是「风韵雅宋」，末字为“宋”，依据包装上的「風韻雅宋」。
- 尚未核实两套的官方逐色色名，不按屏幕外观编造色名；莫奈、穆夏使用用户指定的编号作为网页显示标签。
- 所有 HEX 均为**从图像取得的屏幕近似值，不是厂家发布的官方 RGB/HEX 或颜料标准测色值**。
  颜色数与原版分组已核实，不代表数字颜色与实体水彩在任何条件下完全一致。

## 大艺术家 50 色的逐组来源

以下页面为经销商／商品平台的产品资料，图片为其转载的品牌包装设计色卡。
葛饰北斋、莫兰迪、梵高使用独立的带编号图；莫奈、穆夏取自同一张包装总览图
中各自的十个平涂色块，原图色块由上到下的顺序保留。

| 小系列 | 原色号或界面标签 | 来源产品页 | 采样原图 |
| --- | --- | --- | --- |
| 葛饰北斋 | `101–110` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-los-grandes-artistas-de-la-acuarela-en-tubo-8ml-set-hokusai-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-los-grandes-artistas-de-la-acuarela-en-tubo-8ml-set-hokusai-x10-306732.jpg) |
| 莫兰迪 | `111–120` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-los-grandes-artistas-de-la-acuarela-en-tubo-8ml-set-morandi-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-los-grandes-artistas-de-la-acuarela-en-tubo-8ml-set-giorgio-morandi-x10-673894.jpg) |
| 莫奈 | `121–130`（用户指定显示编号） | [产品页](https://www.walmart.com/ip/16493361105) | [品牌色卡图](https://i5.walmartimages.com/asr/4389165f-1b68-4861-a656-83fffd11ef78.89c8311f0a2d2cf3ac35010705ad85f0.jpeg) |
| 梵高 | `131–140` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-los-grandes-artistas-de-la-acuarela-en-tubo-8ml-set-van-gogh-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-los-grandes-artistas-de-la-acuarela-en-tubo-8ml-set-van-gogh-x10-868505.jpg) |
| 穆夏（慕夏） | `141–150`（用户指定显示编号） | [产品页](https://www.walmart.com/ip/16493361105) | [品牌色卡图](https://i5.walmartimages.com/asr/4389165f-1b68-4861-a656-83fffd11ef78.89c8311f0a2d2cf3ac35010705ad85f0.jpeg) |

同一套装的手涂水彩色样另可在
[Grandado 的十色系列产品页](https://esp.grandado.com/products/acuarela-solida-super-vision-conjunto-de-pintura-de-acuarela-de-artista-suministros-de-arte-morandi-macaron-candy-advanced-gray-10-colores-1ml?variant=UHJvZHVjdFZhcmlhbnQ6NDU0MjU1Nzg4)
对照。该来源用于交叉检查成员和顺序；当前 HEX 使用上表平涂色卡，不混用
照片中的手涂浓淡或管身标签颜色。

## 高级灰 60 色的逐组来源

六组均使用 Letters by Jess Shop 转载的品牌包装设计图。每张图同时显示
中文组名、英文组名和带三位编号的十个平涂色块。

| 小系列 | 包装中文 | 原色号 | 来源产品页 | 采样原图 |
| --- | --- | --- | --- | --- |
| 棉花糖 | 棉花糖 | `001–010` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-spun-sugar-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-spun-sugar-x10-365668.jpg?v=1777311631) |
| 普罗旺斯 | 普羅旺斯 | `011–020` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-la-provence-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-la-provence-x10-268991.jpg?v=1777311636) |
| 仲夏游园 | 仲夏遊園 | `021–030` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-garden-tour-in-midsummer-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-garden-tour-in-midsummer-x10-175739.jpg?v=1777311642) |
| 风韵雅宋 | 風韻雅宋 | `031–040` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-charm-of-song-dynasty-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-charm-of-song-dynasty-x10-396284.jpg?v=1777311647) |
| 落日旅行 | 落日旅行 | `041–050` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-sunset-travel-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-sunset-travel-x10-990421.jpg?v=1777311626) |
| 长安宫乐 | 長安宮樂 | `051–060` | [产品页](https://lettersbyjessshop.com/products/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-changan-palace-music-x10) | [品牌色卡图](https://lettersbyjessshop.com/cdn/shop/files/acuarelas-supervision-high-grade-grey-watercolor-en-tubo-8ml-set-changan-palace-music-x10-559564.jpg?v=1777311653) |

普罗旺斯原图的色块顺序为 `017, 013, 012, 014, 011, 016, 015, 018, 019, 020`，
与网站的 `011`–`020` 顺序不同。维护时必须按图中的编号关联颜色，再按编号排序，
不能把原图从左到右的第一个色块直接当作 `011`。

## 屏幕近似值的采样方法

先查看原尺寸图片并人工核对组名、编号和色块边界，再在每个平涂色块内部选取
一个矩形区域。避开白边、编号文字、装饰画面和背景，对区域内的 R、G、B
三个通道分别取中位数，四舍五入为整数后编码为 HEX。矩形坐标以原图左上角
为原点，格式为 `[left, top, right, bottom)`，右边界与下边界不包含在取样中。
没有按色名猜色，没有从水彩管身反光区域取色，也没有做白平衡、饱和度、
明度补偿、色彩校准或光谱到 RGB 的换算。

这一方法保留来源图片中显示的设计色块，不能还原颜料的浓度、透明度、
混色、纸张、光照和叠涂后的物理效果。JPEG 编码、图片制作与屏幕显示也可能
影响颜色。建议面向使用者保留简短提示：“图像采样的屏幕近似色，实物效果随浓度、
纸张和显示设备变化。”

### 大艺术家采样坐标

所有矩形均为 41 × 15 px。下表的 `x` 是左边界，`y` 列依次对应各组
第 1 至第 10 色；每个矩形为 `[x, y, x + 41, y + 15)`。图片使用上表链接的
原尺寸，不先缩放。三组已核实原色号与各自的第 1 至第 10 色依次对应。

| 小系列 | 原图尺寸（px） | x | 十个 y 值（由上到下） |
| --- | --- | ---: | --- |
| 葛饰北斋 | 1200 × 825 | 530 | `271, 312, 353, 393, 434, 474, 514, 555, 595, 635` |
| 莫兰迪 | 1200 × 820 | 530 | `271, 312, 353, 393, 434, 474, 514, 555, 595, 635` |
| 莫奈 | 2256 × 1800 | 1850 | `1248, 1292, 1335, 1376, 1419, 1461, 1504, 1545, 1588, 1631` |
| 梵高 | 1200 × 820 | 530 | `271, 312, 353, 393, 434, 474, 514, 555, 595, 635` |
| 穆夏 | 2256 × 1800 | 1395 | `1189, 1237, 1283, 1330, 1377, 1425, 1473, 1520, 1566, 1615` |

### 高级灰采样坐标

所有矩形均为 20 × 24 px。下表按**原图从左到右**列出十个色块的横向中心
`x`，矩形统一为 `[x - 10, 150, x + 10, 174)`；编号文字在采样区下方。
普罗旺斯须使用上文记录的原图编号顺序。其他五组从左到右即原色号升序。

| 小系列 | 原图尺寸（px） | 十个横向中心 x |
| --- | --- | --- |
| 棉花糖 | 1200 × 1123 | `642, 694, 746, 810, 864, 914, 979, 1032, 1084, 1150` |
| 普罗旺斯 | 1200 × 1124 | `640, 692, 745, 808, 860, 912, 977, 1029, 1081, 1147` |
| 仲夏游园 | 1200 × 1141 | `642, 695, 748, 813, 865, 917, 982, 1036, 1089, 1154` |
| 风韵雅宋 | 1200 × 1146 | `642, 695, 748, 814, 867, 920, 986, 1040, 1092, 1159` |
| 落日旅行 | 1200 × 1130 | `640, 692, 744, 809, 862, 913, 979, 1031, 1082, 1147` |
| 长安宫乐 | 1200 × 1147 | `643, 695, 748, 813, 865, 917, 982, 1034, 1087, 1152` |

正文不重复全部 HEX，运行时数值集中维护在 `assets/drawing-studio/palettes-supervision.js`。
原图只以外链记录，不上传图片、PDF 或其他大型素材；画板运行时直接读取静态
颜色数据，取色和概括不需要访问这些经销商页面。

## 后续补齐与维护验收

电影 60 色尚缺能够逐组核对的完整六组色卡，等待用户提供全部六组清晰色卡
或原厂可核验链接。补充资料应能辨认每组名称、十个颜色及其对应原色号。
在资料齐全前，不根据电影名自行配色，不拿其他套装凑数，也不添加可选但虚假的
“电影 60 色”占位预设。莫奈、穆夏若补到可读的带编号色卡，再把对应二十色的
内部 `originalCode` 补为已核实原色号；当前界面的显示编号沿用用户指定的 `121–130` 和 `141–150`，
保留小系列身份、顺序及既有工程的套装关联。

以下是本功能的维护检查要求，不表示已经完成真实浏览器或线上验收：

1. 大艺术家恰为 5 组 × 10 色，高级灰恰为 6 组 × 10 色。右侧五种勾线快捷色
   无文字且不占套装位置，概括算法的额外候选仍为黑白。
2. 视爵紧凑模式连续五列，按色系模式每组两行五列；切回 Copic 后恢复六列。
   紧凑模式不保留分组造成的断行，按色系模式不重新按色相聚类。
3. 核对高级灰 `001`–`060` 的前导零，以及葛饰北斋、莫兰迪、梵高的已核实范围。
   莫奈编号为 `121–130`、穆夏编号为 `141–150`；保留穆夏／慕夏别名。
4. 两套视爵默认按色彩距离进行概括，算法保留黑白、透明度、左右预设同步和工程恢复
   沿用现有行为；Copic 的色彩／明暗规则不因新增品牌改变。
5. 点选色块能同步当前画笔与原生调色盘；换套装、换参考图及 PDF 页时，概括用色
   与当前预设一致，派生图不额外存入工程。
6. 改动颜色数据时能逐色回溯到本页的来源图和采样矩形。来源图换版、失效或
   增加原色号时，重新核验对应关系后再更新，不仅根据文件名或范围补齐。
7. 不增加运行时外部图片请求、字体、绘图库或图像处理服务，不上传用户画作与参考。
   未补齐电影色卡时，套装列表中不出现电影 60 色。
