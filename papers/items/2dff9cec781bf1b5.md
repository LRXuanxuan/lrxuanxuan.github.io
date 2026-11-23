---
layout: page
title: "DyTransRM: A Unified Simulation-to-Real Framework for Dynamic Radio Map Prediction"
permalink: /papers/items/2dff9cec781bf1b5/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=2dff9cec781bf1b5)

[本篇日报说明](/papers/items/2dff9cec781bf1b5/#paper-report) · [阅读全文翻译](/papers/translations/2026-11-24-efc3a08a96e15aceb05246f1/)

**推荐日期：** 2026-11-24 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 8. DyTransRM: A Unified Simulation-to-Real Framework for Dynamic Radio Map Prediction

**作者/年份/venue**：Simin Wang、Jiayi Wei、Jihong Li、Guhan Zheng、Rui Cheng、Shunqin Zhang；2026；arXiv。

**发表状态**：预印本/状态未确认。官方arXiv条目与公开全文未给出可确认的录用/投稿声明。 [证据](https://arxiv.org/abs/2611.19430)

**方向**：动态地图；稀疏实测仿真迁移。

**问题**：动态仿真地图如何适配空间不完整的真实路测。

**方法（论文事实）**：RadioCLIP对齐环境/传播演化；稀疏mask精炼与非平衡最优传输仅对兼容表示做迁移。

**关键结果（论文事实）**：Table I仿真NMSE 0.0018；公开摘要及实测表报告迁移NMSE 0.023、RMSE 0.079、MAE 0.064，为归一化地图指标。

**局限与审计**：真实评估只在实际测得点；Vienna按时间排序均分15段而非固定0.1s快照；仿真轨迹不交叉不等于新城市泛化；不是复信道预测。

**迁移类型**：可改造工具。

**研究接口（迁移推断）**：显式保留观测mask；失配地图可靠性与稀疏真实条件对齐。

**与既有阅读差异**：区别于静态条件破坏，本篇同时处理未来演化和仿真实测分布失配。

**推荐理由**：重点审查真实标签、时间构造及未测格点的评价边界。

**待验证假设**：仅加mask精炼和再加UOT的增量需在独立路线下分别检验。

**全文定位**：PDF pp.7–10 Eq.33–52与数据划分；Table I及实测结果。

**身份与原文**：arXiv:2611.19430。[官方条目](https://arxiv.org/abs/2611.19430) · [PDF](https://arxiv.org/pdf/2611.19430)。Submission history From: Simin Wang [ view email ] [v1] Sat, 14 Nov 2026 14:25:07 UTC (1,190 KB)

**代码状态**：未发现公开代码。已查官方条目、全文与精确题名/编号搜索，未定位本篇作者实现；不表示代码必然不存在。 [精确编号检索](https://github.com/search?q=%222611.19430%22&type=repositories)

**全文/翻译**：公开全文14页已缓存，gpt-6-luna/xhigh已入队，worker不可达未启动。[本篇全文翻译状态](https://lrxuanxuan.github.io/papers/items/2dff9cec781bf1b5/#paper-translation)。原文许可：https://arxiv.org/licenses/nonexclusive-distrib/1.0/。PDF仅本地保存与官方链接，不上传。

## 原推荐表字段

**日期：** 2026-11-24

**标题：** DyTransRM: A Unified Simulation-to-Real Framework for Dynamic Radio Map Prediction

**内容：** 作者：Simin Wang、Jiayi Wei、Jihong Li、Guhan Zheng、Rui Cheng、Shunqin Zhang。问题：动态仿真地图如何适配空间不完整的真实路测。方法：RadioCLIP对齐环境/传播演化；稀疏mask精炼与非平衡最优传输仅对兼容表示做迁移。关键结果：Table I仿真NMSE 0.0018；公开摘要及实测表报告迁移NMSE 0.023、RMSE 0.079、MAE 0.064，为归一化地图指标。局限：真实评估只在实际测得点；Vienna按时间排序均分15段而非固定0.1s快照；仿真轨迹不交叉不等于新城市泛化；不是复信道预测。

**契合方向：** 动态地图；稀疏实测仿真迁移

**推荐理由：** 重点审查真实标签、时间构造及未测格点的评价边界

**顶刊顶会/机构依据：** arXiv；预印本/状态未确认；官方arXiv条目与公开全文未给出可确认的录用/投稿声明。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2611.19430

**检索来源：** https://arxiv.org/abs/2611.19430
https://doi.org/10.48550/arXiv.2611.19430

**筛选备注：** 可改造工具；显式保留观测mask；失配地图可靠性与稀疏真实条件对齐；全文定位：PDF pp.7–10 Eq.33–52与数据划分；Table I及实测结果

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；已查官方条目、全文与精确题名/编号搜索，未定位本篇作者实现；不表示代码必然不存在。 证据：https://github.com/search?q=%222611.19430%22&type=repositories

**反馈匹配：** 区别于静态条件破坏，本篇同时处理未来演化和仿真实测分布失配

**反馈权重说明：** 待验证假设：仅加mask精炼和再加UOT的增量需在独立路线下分别检验

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2611.19430)

[来源 2](https://arxiv.org/abs/2611.19430)

[来源 3](https://doi.org/10.48550/arXiv.2611.19430)

[来源 4](https://github.com/search?q=%222611.19430%22&type=repositories)

[来源 5](https://lrxuanxuan.github.io/papers/items/2dff9cec781bf1b5/#paper-translation)

[来源 6](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)
{% endraw %}
