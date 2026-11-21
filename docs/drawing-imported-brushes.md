# 轻绘：吹石、海怪与东东笔刷的来源和适配

本次从用户提供的 13 个吹石 `.brush`、`海怪新版基础笔刷.brushset` 和
`东东精品笔刷.brushset` 读取 **48 支主笔刷与 5 个副笔刷定义**，为轻绘的
原生 Canvas 引擎建立可追溯的适配数据。画笔库按「吹石」「海怪」「东东」
分组；用户同时要求保留原「勾线」「混色与推抹」「硬边与像素」三组的
8 支画笔，最终共 56 支。原先三支「吹石参考」与其他撤下预设不保留迁移表。

这批数据来自实际文件中的笔尖和参数。**读出参数不等于取得 Procreate
渲染引擎**：原生资源未附带时使用网页生成的替代形状或纹理，原软件的湿混色、
双笔混合、速度标定、参数归一化和部分渲染效果仍属于近似。
此维护脚本也不等于画室已经支持任意 `.brush`、`.brushset` 或画世界文件的
即时拖入导入。

## 文件和资源范围

| 来源 | 主笔刷 | 副笔刷 | 文件内主笔尖 | 文件内副笔尖 | 文件内颗粒图 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 吹石，13 个独立文件 | 13 | 1 | 7 个条目，6 张不同图 | 0 | 0 |
| 海怪基础笔刷集合 | 15 | 2 | 0 | 0 | 0 |
| 东东精品笔刷集合 | 20 | 2 | 4 | 2 | 1 |

三个数据模块合计 **278,278 字节，约 271.8 KiB**；其中包含原始标量参数、
压感曲线、来源哈希与压缩后的笔尖/颗粒数据。全部图像数据展开为单通道后
共 696,868 字节。这是数据本身的大小，不是整个标签页、画布或运行时纹理
缓存的内存上限。

15 个上传文件合计 15,726,833 字节。站点没有复制原始压缩包、作者头像、
签名图、QuickLook 预览或 Reset 副本。浏览器不读取下面的完整来源清单；
它们用于维护和复核。

| 文件 | 内容 |
| --- | --- |
| [`../assets/drawing-studio/brushes-chuishi-data.js`](../assets/drawing-studio/brushes-chuishi-data.js) | 13 支吹石，6 张去重笔尖 |
| [`../assets/drawing-studio/brushes-haiguai-data.js`](../assets/drawing-studio/brushes-haiguai-data.js) | 15 支海怪，原生内置资源名称 |
| [`../assets/drawing-studio/brushes-dongdong-data.js`](../assets/drawing-studio/brushes-dongdong-data.js) | 20 支东东，6 张笔尖和 1 张颗粒图 |
| [`drawing-chuishi-brush-source.json`](drawing-chuishi-brush-source.json) | 吹石完整活跃参数、原文件/笔尖哈希和转换记录 |
| [`drawing-haiguai-brush-source.json`](drawing-haiguai-brush-source.json) | 海怪完整活跃参数、集合内顺序和副笔参数 |
| [`drawing-dongdong-brush-source.json`](drawing-dongdong-brush-source.json) | 东东完整活跃参数、原笔尖/颗粒来源和副笔参数 |
| [`../tools/convert_procreate_brushes.py`](../tools/convert_procreate_brushes.py) | 可重复的 ZIP、NSKeyedArchiver 与图像转换 |
| [`../assets/drawing-studio/brushes-chuishi.js`](../assets/drawing-studio/brushes-chuishi.js) | 三套数据共用的原生 Canvas 适配器 |

## 解码和转换方式

`.brush` 文件与 `.brushset` 都是 ZIP 容器。`Brush.archive` 是二进制 plist，
其中 `NSKeyedArchiver` 的 UID 指向对象表。转换器只解析这些数据，不运行源文件。
独立笔刷读取根目录的 `Brush.archive`；集合严格按照 `brushset.plist` 的
`brushes` 顺序读取对应目录。`Sub01/Brush.archive` 保留为副笔定义；
`Reset/` 中的设置不参与当前笔刷。

所有标量数值、布尔值、原生资源名和压感曲线都保留原值，浮点数不主动舍入。
运行模块使用公共默认值减少重复文本，加载时还原每支笔独立的 `source` 对象。
完整来源 JSON 另保存解码后的活跃参数，原生二进制颜色等非必要载荷仅记录
字节数与 SHA-256，不发布其内容。原名称保存在 `provenance.sourceName`，
界面名称只去除首尾空白；作者署名来自文件中的 `authorName`，缺失时保持空值。

实际附带的笔尖按以下方式转换：

1. 读取灰度图，保持原画布范围、锚点关系和宽高比，不裁切外围空白。
2. 以 Pillow LANCZOS 缩小到最长边不超过 256 px，不放大小图。
3. 按最近值量化为 16 级 alpha，即 `0, 17, 34, …, 255`。
4. 以 `[连续长度, alpha]` 两字节一组编码，连续长度为 1–255；允许跨行连续。
5. 将 RLE 字节编码为 base64。相同转换结果去重，保留源 PNG 与展开 alpha 的哈希。

`grainMask` 使用相同容器存放原颗粒灰度，但它是纹理调制数据，不是另一张
直接落色的笔尖。转换器不预先反相颗粒；适配器按 `source.textureInverted`
应用一次反相。当前唯一的原始颗粒图来自「东东 · 勾线-粗糙」，为
200 × 200 px 的砂砾灰度图；其原始 `textureInverted` 为 `true`。

### 手稿笔的明确推断

「吹石-手稿笔」附带的图是白底黑椭圆，而原 `shapeInverted` 为 `false`。
本次根据笔刷用途与原预览，将它反相为常规实心椭圆蒙版，记录为
`provenance.maskInferredInversion: true`，并保存原图哈希及原因。
这是一项显式的适配选择，不能将其描述成原文件已设置反相，或声称已经确认
Procreate 对该负形笔尖的实际处理方式。

## 数据接口

浏览器分别得到 `DrawingChuishiData`、`DrawingHaiguaiData` 和
`DrawingDongdongData`；Node 使用 `module.exports`。三者接口相同：

```js
{
  brushes: [{
    id, name, group, size, opacity, stabilizer, hint,
    source,                // 原始参数；压感曲线为 [[x, y], ...]
    mask,                  // 实际笔尖的 masks 键，缺失为 null
    grainMask,             // 实际颗粒图的 masks 键，缺失为 null
    shapeFallback,         // 源文件 bundledShapePath，保留原文件名
    grainFallback,         // 源文件 bundledGrainPath，保留原文件名
    provenance,            // 原文件、archive、PNG、alpha 哈希及推断记录
    secondary,             // 副笔同样包含 source/mask/grainMask/来源；没有则 null
    samplesLayer           // 仅拾取或合成当前图层的预设设为 true
  }],
  masks: {
    "shape-…": {width, height, encoding: "rle8", data: "…"},
    "grain-…": {width, height, encoding: "rle8", data: "…"}
  }
}
```

`size` 是适合网页操作的推荐像素大小，不是把 Procreate 的归一化 `paintSize`
直接当作像素。默认浓度沿用原 `paintOpacity`，例如海怪软铅笔约 0.539、
东东「上色-柔和」约 0.281。推荐防抖取 `plotSmoothing × 100`；网页的实际
滤波公式与原应用不同。

部分原始曲线把中间控制点存放在两个端点之后。来源数据保留这个顺序，
适配器使用时必须复制并按 x 排序，不能直接更改 `source` 中的原数组。
保留某个参数并不表示适配器已经实现该参数对应的全部原生行为。

## 可确定的信息与近似边界

| 项目 | 从文件能确定的内容 | 网页实现的限制 |
| --- | --- | --- |
| 笔尖、颗粒 | 是否实际附带、原像素尺寸与内容、SHA-256 | 以 256 px 上限和 16 级量化换取轻量；小尺度细节会减少 |
| 压力和倾斜 | 各通道系数、曲线点、相关开关 | 输入设备、曲线插值和通道组合方式不同 |
| 行笔速度 | 尺寸/浓度响应系数 | 原软件的速度归一化与响应函数未确认 |
| 间距、旋转、散布 | 原字段值、部分方向开关 | 原数字到实际长度、角度或数量的映射不完全公开 |
| 原生资源名称 | 如 `Brush-Preset-Hard.png`、`Brush-Artery-Charcoal-6B.jpg` | 文件名不是纹理内容；缺失的原生资源只能生成替代品 |
| 混色和湿边 | 源文件中的混色/载色/积累系数 | 原应用的湿颜料与渲染递推不等于 Canvas 透明度叠加 |
| 双笔、混合模式 | 副笔定义、`dualBlendMode`/`blendMode` 的原数值 | 未将未确认的原枚举值冒充 Canvas 合成模式 |

原参数不能统一当成 0–1 百分比。例如吹石「多功能二号」的 `textureScale`
约 6.409，海怪喷枪的 `maxSize` 为 16，东东多支宽幅上色笔的 `maxSize`
大于 1；`shapeCount` 的 `.0625` 等值也不是字面上的点数。

### 特殊笔刷

- **吹石排线与颗粒排线：** 共用一张实际的六点笔尖。原预览分别表现为六路
  实线和六路颗粒线；颗粒版引用的 Procreate Bonobo 纹理未附带，网页纹理为近似。
- **吹石水星：** 主笔之外带一个副笔，引用 `Weary-Dots.jpg` 和
  `European-Paper-Coarse.jpg`；这两张内置图片也未附带。原 `dualBlendMode=28`
  保留为证据，网页采用近似双笔组合。
- **海怪两支描边：** 原预览是连续空心笔画。内笔与外笔的 `maxSize` 比约为
  0.425 和 0.860；网页从本次笔画外形中减去内形，内芯保持透明，不用白色模拟空洞。
  原 `dualBlendMode=7` 与细版 `blendMode=3` 不作为已确认的枚举解释。
- **海怪发光喷枪：** 原 `blendMode=9` 未确认具体枚举。网页用 `lighter`
  对当前图层近似提亮，空白处形成柔光；不会将其他图层先烘焙进去。它会合成当前
  图层已有的笔迹记录，之后使用局部橡皮。
- **吹石方形自用版：** 原 `dynamicsMix` 约 0.446。网页从当前图层拾色并近似
  带色，它也会合成该层笔迹记录。其余导入笔刷不因此获得当前图层采样权限。
- **东东粗糙勾线：** 同时保留主笔尖、40 × 40 px 副笔尖和实际砂砾颗粒图。
  原 `dualBlendMode=10` 的精确运算未确认，网页保留素材并近似组合。
- **东东柔和机理：** 主笔引用内置 Blotch，副笔为实际的 90 × 90 px 纹理形状。
  `dualBlendMode=11` 保留原值，组合效果仍属于网页适配。
- **东东极滑-填色 1：** 实际笔尖是两枚分离白点；原预览也是两条平行、两端收拢的线。
  网页保留双线，不因名称含“填色”就填实中间。
- **东东尖角：** 虽然原名称为「尖角 27 1 1」，文件中实际笔尖是实心圆形。
  适配使用实际图像，不因名称自行改成三角形。

## 稳定 ID 对照

吹石独立文件保留以下 ID：

| ID | 界面原名 |
| --- | --- |
| `chuishi-jiayou-inking` | 吹石-加油勾线笔 |
| `chuishi-jiayou-inking-2` | 吹石-加油勾线笔2.0自用版 |
| `chuishi-multipurpose-inking-color` | 吹石-多功能 勾线上色两用 |
| `chuishi-multipurpose-2` | 吹石-多功能二号 |
| `chuishi-student-fountain` | 吹石-学生钢笔 |
| `chuishi-manuscript` | 吹石-手稿笔 |
| `chuishi-hatching` | 吹石-排线 |
| `chuishi-hatching-grain` | 吹石-排线 颗粒 |
| `chuishi-square` | 吹石-方形画笔 自用版 |
| `chuishi-mercury` | 吹石-水星 改 |
| `chuishi-linework` | 吹石-画线条 |
| `chuishi-mint-color` | 吹石-薄荷涂色 自用版 |
| `chuishi-speed-pencil` | 吹石-速度铅笔 |

海怪集合按原 `brushset.plist` 顺序：

| ID | 界面原名 |
| --- | --- |
| `haiguai-inking` | 海怪-勾线笔 |
| `haiguai-carbon-pencil` | 海怪-碳铅 |
| `haiguai-pencil-hard` | 海怪-铅笔（硬） |
| `haiguai-pencil-soft` | 海怪-铅笔（软) |
| `haiguai-all-purpose` | 海怪-万能笔 |
| `haiguai-round-solid` | 海怪-圆头笔 实 |
| `haiguai-round-soft` | 海怪-圆头 虚 |
| `haiguai-flat` | 海怪-平头笔 |
| `haiguai-coloring` | 海怪-上色笔 |
| `haiguai-fineliner` | 海怪-针管笔 |
| `haiguai-airbrush` | 海怪-喷枪 |
| `haiguai-glow-airbrush` | 海怪-发光喷枪 |
| `haiguai-outline` | 海怪-描边笔刷 |
| `haiguai-outline-fine` | 海怪-描边笔刷(细) |
| `haiguai-solid-no-pressure` | 海怪-实心笔无压感 |

东东集合按原 `brushset.plist` 顺序：

| ID | 界面原名 |
| --- | --- |
| `dongdong-smooth-inking` | 勾线笔-滑 |
| `dongdong-sketch-pencil` | 勾线/草稿-铅笔 |
| `dongdong-casual-inking-6` | 随笔勾线-6号 |
| `dongdong-casual-inking-18` | 随笔勾线-18号 |
| `dongdong-rough-inking` | 勾线-粗糙 |
| `dongdong-shale` | 页岩画笔 |
| `dongdong-slow-coloring` | 东东-上色/磨洋工 |
| `dongdong-round` | 普通圆头画笔 |
| `dongdong-smooth-fill-2` | 极滑-填色 2 |
| `dongdong-smooth-fill-1` | 极滑-填色 1 |
| `dongdong-smooth-fill` | 极滑-填色 |
| `dongdong-smooth-textured` | 光滑-纹理版 |
| `dongdong-rough-crayon` | 蜡笔-粗糙 |
| `dongdong-rough-detail` | 上色/细化-粗糙 |
| `dongdong-fine-grain-coloring` | 上色-细微颗粒 |
| `dongdong-soft-coloring` | 上色-柔和 |
| `dongdong-soft-texture` | 上色-柔和机理 |
| `dongdong-soft-coloring-dongdong` | 东东-上色/柔和 |
| `dongdong-pressure-burst` | 上色-用力炸开 |
| `dongdong-sharp-corner` | 尖角 27 1 1 |

## 重新生成与核验

在仓库根目录使用 Python 3.10+ 和 Pillow。当前生成记录中的 Pillow 版本为
13.0.0；需要逐字节重现时应使用来源清单记录的同一版本。原始文件由维护者
自行保留，不应为了运行转换器将原包提交到网站。

```bash
python tools/convert_procreate_brushes.py --series chuishi /path/to/sources/*.brush
python tools/convert_procreate_brushes.py --series haiguai /path/to/sources/海怪新版基础笔刷.brushset
python tools/convert_procreate_brushes.py --series dongdong /path/to/sources/东东精品笔刷.brushset
```

命令后加 `--check` 可重新计算并与已提交的模块、来源清单逐字节比较，检查过程
不修改文件。转换器会验证 RLE 解码回原量化图的内容和长度，拒绝重复 ID、未知
笔刷名称或当前集合数量不符。

另外检查所有导出标量/布尔/曲线与完整解码结果一致，48 支主笔和 5 个副笔都能
关联来源，13 张去重素材的尺寸、量化级数、展开长度与 SHA-256 正确。渲染层再用
真实 Canvas 像素验证落笔、透明描边、颗粒、压感、取消、拾色与图层记录边界。
这些开发验证不等于已在真实 Apple Pencil、Wacom 或所有移动 WebView 上验收。
