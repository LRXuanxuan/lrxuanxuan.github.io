# 荷尔拜因水彩色卡：来源与维护

核验日期：2026-11-21。主维护说明见 [轻绘 · 本地画室](drawing-studio.md)。
三套配色独立归入「荷尔拜因水彩」，静态数据集中在
`assets/drawing-studio/palettes-holbein.js`。

## 收录与布局

| 界面名称 | 原始名称 | 预设 ID |
| --- | --- | --- |
| 友风子 12 色 | 友風子 | `holbein-yufuko12` |
| 七神奈奈 12 色 | 七神マナ | `holbein-nanakami12` |
| 夏目柠檬 12 色 | 夏目レモン／レモン | `holbein-lemon12` |

每套保持原有 12 色和下文顺序，紧凑与按色系两种排法均为**每行六色、两行**。
整套作为一个 12 色系列，不另按色相重排。三套共 36 个套装成员、29 个不同原色号，
均按 Oklab 色彩距离概括参考图，沿用左右预设同步、取色及工程保存功能。

右侧单独常驻五个无文字勾线色块：纯黑 `#000000`、深棕 `#3f271f`、
中棕 `#75503b`、深灰 `#3a3a3a`、中灰 `#808080`，不占原套装的 12 个位置。
这是取色快捷栏。参考图概括的候选颜色仍为当前套装加纯黑 `#000000` 和
纯白 `#ffffff`，不读取快捷栏的五色作为额外候选；结果保留原图透明度。

## 成员与来源

以下顺序为网页中第 1 至第 12 个色块，前六色为第一行，后六色为第二行。
日文原名用于核对产品成员；中文显示名称和 HEX 以数据脚本为唯一维护入口。

### 友风子

完整成员和顺序来自套装合作出版方的
[原销售页](https://www.fukkan.com/fk/CartSearchDetail?i_no=68324115)。
套装身份另见 [Holbein 2017 年 7 月官方产品刊](https://www.holbein.co.jp/dcms_media/other/2017_7.pdf)。

| 顺序 | 原色号 | 原版成员 |
| ---: | --- | --- |
| 1 | W012 | ローズ マダー |
| 2 | W007 | ピロール レッド |
| 3 | W026 | シェル ピンク |
| 4 | W047 | ブリリアント オレンジ |
| 5 | W030 | ネイプルス イエロー |
| 6 | W031 | ジョーン ブリヤン No.1 |
| 7 | W077 | リーフ グリーン |
| 8 | W093 | ウルトラマリン ライト |
| 9 | W098 | インジゴ |
| 10 | W116 | ラベンダー |
| 11 | W110 | コバルト バイオレット ライト |
| 12 | W136 | セピア |

### 七神奈奈（官方名：七神マナ）

对应原厂 W494 套装。身份见
[Holbein 官方发布页](https://www.holbein.co.jp/blog/newproducts/a109)，
完整成员和顺序见合作出版方的
[销售页](https://www.fukkan.com/fk/CartSearchDetail?i_no=68325981&tr=t)。
界面沿用用户指定的「七神奈奈」，来源保留「七神マナ」以便检索核对。

| 顺序 | 原色号 | 原版成员 |
| ---: | --- | --- |
| 1 | W031 | ジョーン ブリヤン No.1 |
| 2 | W050 | イミダゾロン イエロー |
| 3 | W025 | ブリリアント ピンク |
| 4 | W019 | バーミリオン ヒュー |
| 5 | W015 | カドミウム レッド ディープ |
| 6 | W065 | テール ベルト |
| 7 | W104 | ホリゾン ブルー |
| 8 | W102 | マリン ブルー |
| 9 | W117 | ライラック |
| 10 | W113 | マース バイオレット |
| 11 | W156 | ペインズ グレイ |
| 12 | W153 | グレイ オブ グレイ |

### 夏目柠檬

身份见 [Holbein 官方发布页](https://www.holbein.co.jp/blog/newproducts/a461)。
成员按其 [原套装照片](https://www.holbein.co.jp/dcms_media/image/191114_lemon_select_hwc400.jpg)
逐支核对，顺序如下；日文名称与官方商店单色产品页交叉核验。

| 顺序 | 原色号 | 原版成员 |
| ---: | --- | --- |
| 1 | W015 | カドミウム レッド ディープ |
| 2 | W025 | ブリリアント ピンク |
| 3 | W032 | ジョーン ブリヤン No.2 |
| 4 | W037 | パーマネント イエロー ディープ |
| 5 | W047 | ブリリアント オレンジ |
| 6 | W061 | ビリジャン ヒュー |
| 7 | W094 | ウルトラマリン ディープ |
| 8 | W104 | ホリゾン ブルー |
| 9 | W115 | パーマネント バイオレット |
| 10 | W133 | バーント アンバー |
| 11 | W136 | セピア |
| 12 | W153 | グレイ オブ グレイ |

## 29 个不同颜色的官方来源

下表按原色号排序，仅用于追溯；三个预设的显示顺序以各自成员表为准。
「原色样图」均为官方产品页提供的独立水彩色样 JPEG。正文不重复 HEX，
数值以 `assets/drawing-studio/palettes-holbein.js` 为唯一维护入口。

| 原色号 | 官方英文名 | 官方产品页 | 原色样图 |
| --- | --- | --- | --- |
| W007 | Pyrrole Red | [产品页](https://shop.holbein.co.jp/products/w007) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W007.jpg?v=1782801423) |
| W012 | Rose Madder | [产品页](https://shop.holbein.co.jp/products/w012) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W012.jpg?v=1782801439) |
| W015 | Cadmium Red Deep | [产品页](https://shop.holbein.co.jp/products/w015) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W015.jpg?v=1782801458) |
| W019 | Vermilion Hue | [产品页](https://shop.holbein.co.jp/products/w019) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W019.jpg?v=1782801474) |
| W025 | Brilliant Pink | [产品页](https://shop.holbein.co.jp/products/w025) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W025.jpg?v=1782801480) |
| W026 | Shell Pink | [产品页](https://shop.holbein.co.jp/products/w026) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W026.jpg?v=1782801485) |
| W030 | Naples Yellow | [产品页](https://shop.holbein.co.jp/products/w030) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W030.jpg?v=1782801495) |
| W031 | Jaune Brillant No.1 | [产品页](https://shop.holbein.co.jp/products/w031) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W031.jpg?v=1782801500) |
| W032 | Jaune Brillant No.2 | [产品页](https://shop.holbein.co.jp/products/w032) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W032.jpg?v=1782801507) |
| W037 | Permanent Yellow Deep | [产品页](https://shop.holbein.co.jp/products/w037) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W037.jpg?v=1782801532) |
| W047 | Brilliant Orange | [产品页](https://shop.holbein.co.jp/products/w047) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W047.jpg?v=1782801614) |
| W050 | Imidazolone Yellow | [产品页](https://shop.holbein.co.jp/products/w050) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W050.jpg?v=1782801629) |
| W061 | Viridian Hue | [产品页](https://shop.holbein.co.jp/products/w061) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W061.jpg?v=1782801642) |
| W065 | Terre Verte | [产品页](https://shop.holbein.co.jp/products/w065) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W065.jpg?v=1782801664) |
| W077 | Leaf Green | [产品页](https://shop.holbein.co.jp/products/w077) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W077.jpg?v=1782801718) |
| W093 | Ultramarine Light | [产品页](https://shop.holbein.co.jp/products/w093) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W093.jpg?v=1782801752) |
| W094 | Ultramarine Deep | [产品页](https://shop.holbein.co.jp/products/w094) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W094.jpg?v=1782801756) |
| W098 | Indigo | [产品页](https://shop.holbein.co.jp/products/w098) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W098.jpg?v=1782801780) |
| W102 | Marine Blue | [产品页](https://shop.holbein.co.jp/products/w102) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W102.jpg?v=1782801812) |
| W104 | Horizon Blue | [产品页](https://shop.holbein.co.jp/products/w104) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W104.jpg?v=1782801820) |
| W110 | Cobalt Violet Light | [产品页](https://shop.holbein.co.jp/products/w110) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W110.jpg?v=1782801852) |
| W113 | Mars Violet | [产品页](https://shop.holbein.co.jp/products/w113) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W113.jpg?v=1782801863) |
| W115 | Permanent Violet | [产品页](https://shop.holbein.co.jp/products/w115) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W115.jpg?v=1782801868) |
| W116 | Lavender | [产品页](https://shop.holbein.co.jp/products/w116) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W116.jpg?v=1782801873) |
| W117 | Lilac | [产品页](https://shop.holbein.co.jp/products/w117) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W117.jpg?v=1782801878) |
| W133 | Burnt Umber | [产品页](https://shop.holbein.co.jp/products/w133) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W133.jpg?v=1782801921) |
| W136 | Sepia | [产品页](https://shop.holbein.co.jp/products/w136) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W136.jpg?v=1782801940) |
| W153 | Grey of Grey | [产品页](https://shop.holbein.co.jp/products/w153) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W153.jpg?v=1782801999) |
| W156 | Payne's Grey | [产品页](https://shop.holbein.co.jp/products/w156) | [JPEG](https://cdn.shopify.com/s/files/1/0776/0039/1381/files/W156.jpg?v=1782802011) |

## 屏幕近似色与离线实现

三套使用 [Holbein 官方在线商店](https://shop.holbein.co.jp/) 的独立单色色样 JPEG，
同一原色号跨套装共用同一 HEX。每张原图为 1500 × 1500 px，统一取正中央
200 × 200 px 矩形 `[650,650,850,850)`，对 R、G、B 通道分别计算中位数并转为
整数 HEX。坐标以原图左上角为原点，右边界和下边界不包含在取样中。

色样由左侧浓色向右侧淡色过渡，中央矩形避开两端，并用中位数减弱纸纹和颜料
颗粒的影响。原图不缩放、不做白平衡或色彩校准。套装产品照片仅用于核对成员，
不从管身、包装插画或阴影取色，也不按色名猜颜色。
[官方通用水彩目录](https://holbein.actibookone.com/content/detail?detailFlg=0&param=eyJjb250ZW50TnVtIjoiMjY0MTMifQ%3D%3D)
用于核对色号、原名；本次 HEX 统一来自上表 JPEG，不混入 PDF 渲染色值。

这些值用于屏幕取色和配色练习，不是厂家公布的标准 RGB 或实体颜料测色值。
实际水彩效果随用水量、纸张、叠涂和显示设备变化；界面保留简短的「屏幕近似色」
提示即可。

网页仅加载小型静态色值，运行时不访问上述来源，不下载色卡图、PDF、字体或
新的绘图库。每次更新需核对三套共 36 个成员、29 个不同原色号、每套 12 色及其
顺序，同色号跨套装的 HEX 必须一致；检查两种排法都为两行六色、左右同步和
工程预设 ID。右侧五个无文字勾线色块与概括算法分开检查，算法仍保留黑白。
Copic 和视爵原有的列数与概括规则保持各自设置。以上为维护验收要求，不表示
已经执行真实浏览器或线上验收。
