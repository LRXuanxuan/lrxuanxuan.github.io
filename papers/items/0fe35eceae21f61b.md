---
layout: page
title: "Graph Learning for Cooperative Cell-Free ISAC Systems: From Optimization to Estimation"
permalink: /papers/items/0fe35eceae21f61b/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=0fe35eceae21f61b)

[本篇日报说明](/papers/items/0fe35eceae21f61b/#paper-report) · [全文翻译（待补齐）](/papers/items/0fe35eceae21f61b/#paper-translation)

**推荐日期：** 2026-09-26 · **发表状态：** 正式发表

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

### 20. Graph Learning for Cooperative Cell-Free ISAC Systems: From Optimization to Estimation

**作者：** Jiang, Peng; Li, Ming; Liu, Rang; Liu, Qian。**年份/venue：** 2026 / IEEE Transactions on Wireless Communications。**优先级：** B。

**发表状态：** 正式发表；核验于2026-09-26。公开版本日期：2025/07/09。Crossref出版社登记：25卷，13992-14008页；文献类型journal-article、题目作者与全文相符。IEEE页面受限时由DOI元数据和作者/机构材料交叉确认。 IEEE正式页确认2026-03-20出版。 [证据1](https://arxiv.org/abs/2507.06612)；[证据2](https://doi.org/10.1109/TWC.2026.3674789)；[证据3](https://api.crossref.org/works/10.1109/TWC.2026.3674789)；[证据4](https://ieeexplore.ieee.org/abstract/document/11449475/)

**问题与方法：** AP角色、用户关联、预编码与多目标估计分离设计，难以权衡端到端性能及回传开销。 用异构图联合描述Tx/Rx AP和用户；动态时空注意力+3D CNN与轻量mirror-GAT分别实现高精度及分布式交替计算。

**关键结果：** 仿真比较位置/速度RMSE、通信速率及开销；mirror-GAT降低计算和回传负担，仍优于若干启发式/两阶段基准。

**局限与解释边界：** Algorithm 2以全局CSI/AP位置为输入，未解决CSI获取费用。每AP约50–60 dBm下的亚米结果不可脱离功率与几何复制；尚非商用网络实证。

**迁移类型：** 可改造工具。**相对阅读笔记的位置与差异：** 应用：相对CKMImageNet与WCM先验，补充推断结果如何影响网络拓扑、波束与传感任务。

**推荐理由：** 可借用异构图接口和压缩回传预算；不能把其全CSI条件默认套给稀疏导频信道估计。

**论文与全文：** arXiv [2507.06612](https://arxiv.org/abs/2507.06612)；DOI [10.1109/TWC.2026.3674789](https://doi.org/10.1109/TWC.2026.3674789)；[官方记录](https://arxiv.org/abs/2507.06612)；[公开PDF](https://arxiv.org/pdf/2507.06612)。已解析16页；核对锚点：§III–V、Algorithm 2、Figs.6–10；分析使用arXiv v2。

**代码状态：** 未发现公开代码。已检查论文及其链接，并按精确标题/arXiv编号检索GitHub；未找到可归属于本文的公开实现。检索无结果不等于代码不存在。部分GitHub API检索受限，补充网页检索。

## 原推荐表字段

**日期：** 2026-09-26

**标题：** Graph Learning for Cooperative Cell-Free ISAC Systems: From Optimization to Estimation

**内容：** 作者：Jiang, Peng; Li, Ming; Liu, Rang; Liu, Qian
问题：AP角色、用户关联、预编码与多目标估计分离设计，难以权衡端到端性能及回传开销。
方法：用异构图联合描述Tx/Rx AP和用户；动态时空注意力+3D CNN与轻量mirror-GAT分别实现高精度及分布式交替计算。
结果：仿真比较位置/速度RMSE、通信速率及开销；mirror-GAT降低计算和回传负担，仍优于若干启发式/两阶段基准。
局限：Algorithm 2以全局CSI/AP位置为输入，未解决CSI获取费用。每AP约50–60 dBm下的亚米结果不可脱离功率与几何复制；尚非商用网络实证。

**契合方向：** 分布式ISAC与图学习；可改造工具

**推荐理由：** 可借用异构图接口和压缩回传预算；不能把其全CSI条件默认套给稀疏导频信道估计。

**顶刊顶会/机构依据：** IEEE Transactions on Wireless Communications；正式发表；Crossref出版社登记：25卷，13992-14008页；文献类型journal-article、题目作者与全文相符。IEEE页面受限时由DOI元数据和作者/机构材料交叉确认。 IEEE正式页确认2026-03-20出版。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2507.06612

**检索来源：** https://arxiv.org/abs/2507.06612
https://doi.org/10.1109/TWC.2026.3674789
https://api.crossref.org/works/10.1109/TWC.2026.3674789
https://ieeexplore.ieee.org/abstract/document/11449475/

**筛选备注：** 2026-09-26身份去重通过；全文16页；§III–V、Algorithm 2、Figs.6–10；分析使用arXiv v2。；Crossref出版社登记：25卷，13992-14008页；文献类型journal-article、题目作者与全文相符。IEEE页面受限时由DOI元数据和作者/机构材料交叉确认。 IEEE正式页确认2026-03-20出版。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；已检查论文及其链接，并按精确标题/arXiv编号检索GitHub；未找到可归属于本文的公开实现。检索无结果不等于代码不存在。部分GitHub API检索受限，补充网页检索。

**反馈匹配：** 应用：相对CKMImageNet与WCM先验，补充推断结果如何影响网络拓扑、波束与传感任务。

**反馈权重说明：** 优先级B；按方法/数据/系统互补选择，未假设全模态监督可用。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2507.06612)

[来源 2](https://arxiv.org/abs/2507.06612)

[来源 3](https://doi.org/10.1109/TWC.2026.3674789)

[来源 4](https://api.crossref.org/works/10.1109/TWC.2026.3674789)

[来源 5](https://ieeexplore.ieee.org/abstract/document/11449475/)
{% endraw %}
