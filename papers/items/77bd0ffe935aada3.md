---
layout: page
title: "Deep Bayesian REFoCUS"
permalink: /papers/items/77bd0ffe935aada3/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=77bd0ffe935aada3)

[本篇日报说明](/papers/items/77bd0ffe935aada3/#paper-report) · [全文翻译（待补齐）](/papers/items/77bd0ffe935aada3/#paper-translation)

**推荐日期：** 2026-10-23 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 2. Deep Bayesian REFoCUS

**作者**：Penninga, Simon; van Sloun, Ruud。

**方向/年份/venue**：核心生成/拓展：复数通道逆问题、零空间与后验不确定性；2026；arXiv，2026-10-02 v1。

**发表核验（2026-10-23）**：预印本/状态未确认。项目页引用arXiv。另有IUS同名摘要检索线索，但不据同名摘要把这篇10页全文认定为已发表会议长文。

**问题**：超声发射编码秩亏时，线性解码只能压零不可观测成分，无法表达缺失通道的不确定性。

**方法**：对原始复数multistatic通道训练flow-matching先验，以已知发射编码和伴随REFoCUS构造DPS似然引导；在多种发射序列下采样，再评估通道域复相关及成像域质量。

**关键结果**：10页。TableI：146.7M参数、400000步、8张B200训练240小时。评估用1000步和8个后验样本；模拟采用引导0.35，in-vivo改为0.8。实测无完整multistatic真值，使用保留发射观测验证。Fig5对比含逐数据点oracle调参的Tikhonov。

**局限**：计算成本远高于线性法；不能称低NFE可直接部署。Fig3明确出现向训练模拟分布偏移、对比度被人为增强；零空间多样性不是已证明的后验校准。in-vivo无完整真值，且改变引导系数，因此不是完全固定超参的无适配迁移。

**迁移/笔记位置**：理论启发或基线；深化：导频零空间恢复；缺口：可观测/不可观测方向的不确定性与失配。

**与既有阅读差异**：与既有图像PnP阅读相比，直接在复数原始通道和可变编码上做物理后验，独立价值是零空间与held-out观测检验，不能把超声几何直接等同MIMO无线。

**推荐理由**：对HP欠定恢复很有启发：分开检查观测子空间、零空间样本变化和未用导频预测，而不只报告单点NMSE。

**代码状态**：作者预告/部分代码。作者项目页/仓库确实存在；递归tree仅LICENSE和docs静态交互结果，没有.py/.ipynb/训练配置，虽页脚称code released也不能标完整实现。公开数据另见项目页OpenH-RF链接。

[实际存在的作者仓库](https://github.com/swpenninga/deep-bayesian-refocus)。

**身份**：arXiv:2610.03419。[证据1](https://arxiv.org/abs/2610.03419) [证据2](https://swpenninga.github.io/deep-bayesian-refocus/)

[官方PDF](https://arxiv.org/pdf/2610.03419)；[原文PDF](https://arxiv.org/pdf/2610.03419)。全文10页；定位：PDF SecII–VI、TableI、Figs3–8；项目页与2026-10-23 GitHub递归tree。

[本篇全文翻译状态](https://lrxuanxuan.github.io/papers/items/77bd0ffe935aada3/#paper-translation)。job `455fa7ca9b751b6d2cead6ff`，pending，指定gpt-6-luna/xhigh；原worker不可达，未启动/未译完。预计输出：`本地资料：paper.md`。

[源许可](https://creativecommons.org/licenses/by/4.0/)。完成译文可按CC BY4署名、注明改动后分享。PDF仅官方链接，不上传网站。

## 原推荐表字段

**日期：** 2026-10-23

**标题：** Deep Bayesian REFoCUS

**内容：** 作者：Penninga, Simon; van Sloun, Ruud。问题：超声发射编码秩亏时，线性解码只能压零不可观测成分，无法表达缺失通道的不确定性。 方法：对原始复数multistatic通道训练flow-matching先验，以已知发射编码和伴随REFoCUS构造DPS似然引导；在多种发射序列下采样，再评估通道域复相关及成像域质量。 结果：10页。TableI：146.7M参数、400000步、8张B200训练240小时。评估用1000步和8个后验样本；模拟采用引导0.35，in-vivo改为0.8。实测无完整multistatic真值，使用保留发射观测验证。Fig5对比含逐数据点oracle调参的Tikhonov。 局限：计算成本远高于线性法；不能称低NFE可直接部署。Fig3明确出现向训练模拟分布偏移、对比度被人为增强；零空间多样性不是已证明的后验校准。in-vivo无完整真值，且改变引导系数，因此不是完全固定超参的无适配迁移。

**契合方向：** 核心生成/拓展：复数通道逆问题、零空间与后验不确定性

**推荐理由：** 对HP欠定恢复很有启发：分开检查观测子空间、零空间样本变化和未用导频预测，而不只报告单点NMSE。

**顶刊顶会/机构依据：** arXiv，2026-10-02 v1；预印本/状态未确认；项目页引用arXiv。另有IUS同名摘要检索线索，但不据同名摘要把这篇10页全文认定为已发表会议长文。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2610.03419

**检索来源：** https://arxiv.org/abs/2610.03419
https://swpenninga.github.io/deep-bayesian-refocus/

**筛选备注：** 理论启发或基线；深化：导频零空间恢复；缺口：可观测/不可观测方向的不确定性与失配。；PDF SecII–VI、TableI、Figs3–8；项目页与2026-10-23 GitHub递归tree

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/swpenninga/deep-bayesian-refocus

**代码/数据状态：** 作者预告/部分代码；作者项目页/仓库确实存在；递归tree仅LICENSE和docs静态交互结果，没有.py/.ipynb/训练配置，虽页脚称code released也不能标完整实现。公开数据另见项目页OpenH-RF链接。

**反馈匹配：** 与既有图像PnP阅读相比，直接在复数原始通道和可变编码上做物理后验，独立价值是零空间与held-out观测检验，不能把超声几何直接等同MIMO无线。

**反馈权重说明：** 优先数学机制、失配边界和系统指标，区分求解器/先验/数据收益，不预设有效。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2610.03419)

[来源 2](https://arxiv.org/abs/2610.03419)

[来源 3](https://swpenninga.github.io/deep-bayesian-refocus/)

[来源 4](https://github.com/swpenninga/deep-bayesian-refocus)

[来源 5](https://lrxuanxuan.github.io/papers/items/77bd0ffe935aada3/#paper-translation)

[来源 6](https://creativecommons.org/licenses/by/4.0/)
{% endraw %}
