---
layout: page
title: "GeRaF: Neural Geometry Reconstruction from Radio Frequency Signals"
permalink: /papers/items/fdb8bece62f0fa86/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=fdb8bece62f0fa86)

[本篇日报说明](/papers/items/fdb8bece62f0fa86/#paper-report)

**推荐日期：** 2026-10-04 · **发表状态：** 历史记录未明确

<span id="paper-report"></span>

## 本篇推荐与证据

- 第274行：GeRaF: Neural Geometry Reconstruction from Radio Frequency Signals

## 原推荐表字段

**日期：** 2026-10-04

**标题：** GeRaF: Neural Geometry Reconstruction from Radio Frequency Signals

**内容：** 用户10月4日日推资料补录；本次保留PDF原文信息，未重新生成论文评述。
作者/首页信息原文：
GeRaF: Neural Geometry Reconstruction from Radio
Frequency Signals
Jiachen Lu*, Hailan Shanbhag *, Haitham Al Hassanieh
École Polytechnique Fédérale de Lausanne (EPFL)
https://sens.epfl.ch/research/geraf/

摘要原文摘录：
GeRaF is the first method to use neural implicit learning for near-range 3D geome- try reconstruction from radio frequency (RF) signals. Unlike RGB or LiDAR-based methods, RF sensing can see through occlusion but suffers from low resolution and noise due to itslenslessimaging nature. While lenses in RGB imaging constrain sampling to 1D rays, RF signals propagate through the entire space, introducing sig- nificant noise and leading to cubic complexity in volumetric rendering. Moreover, RF signals interact with surfaces via specular reflections, requiring fundamentally different modeling. To address these challenges, GeRaF (1) introduces filter-based rendering to suppress irrelevant signals, (2) implements a physics-based RF volu- metric rendering pipeline, and (3) proposes a novel lensless sampling and lensless alpha blending strategy that makes full-space sampling feasible during training. By learning signed distance functions, reflectiveness, and signal power through MLPs and trainable parameters, GeRaF takes the first step towards reconstructing millimeter-level geometry from RF signals in real-world settings.

**契合方向：** 无线信道/CKM/射频建模

**推荐理由：** 用户已有日推PDF补录，纳入同一阅读记录表；不计作10月8日新增推荐。

**顶刊顶会/机构依据：** 发表状态待核验（本次仅补录已有PDF）

**发表年份：** 2026（arXiv首版年）

**论文下载链接：** 本地资料：2605.29097v2.pdf

**检索来源：** 本地资料：2605.29097v2.pdf
https://arxiv.org/abs/2605.29097

**筛选备注：** 补录来源：104日推；论文身份去重通过。仅解析PDF首页/摘要，未完成全文方法、实验、发表状态或代码的重新审计。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 待核验（资料补录，未进行线上代码审计）

**反馈匹配：** 用户指定资料补录；未假设已略读、已精读或已复现。

**反馈权重说明：** 保留原日推日期，追加到末尾；不重排历史行。

## 原文与代码入口

[来源 1](https://sens.epfl.ch/research/geraf/)

[来源 2](https://arxiv.org/abs/2605.29097)
{% endraw %}
