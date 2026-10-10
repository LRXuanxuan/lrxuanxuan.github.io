---
layout: page
title: "AeroLat: Channel-Aware Latent Space Semantic Communication for Decentralized UAV Swarms"
permalink: /papers/items/affccac6e46a2de7/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=affccac6e46a2de7)

[本篇日报说明](/papers/items/affccac6e46a2de7/#paper-report)

**推荐日期：** 2026-10-08 · **发表状态：** 预印本/状态未确认

<span id="paper-report"></span>

## 本篇推荐与证据

### 09. AeroLat: Channel-Aware Latent Space Semantic Communication for Decentralized UAV Swarms

**作者：** Ghosh, Rajdeep; Vatsava, Goparaju Venkata Seshachala Sree; Misra, Sudip。**年份/venue：** 2026 / arXiv预印本。**浏览优先级：** B。

**发表状态：** 预印本/状态未确认。首个公开版本日期：2026/09/15。未找到出版社录用或发表证据，不推断投稿去向。 核验日期2026-10-08。[来源1](https://arxiv.org/abs/2609.16947)

**问题：** 无人机群采用同构冻结模型时，潜变量相似度可能虚高；计算与消息陈旧性也可能比链路丢包更限制协作。

**方法：** AeroLat在潜空间注入环境证据并做白化校准，同时显式建模量化、信道噪声、消息年龄与运行延迟。

**关键结果：** 消融揭示潜空间余弦接近不必然表示语义协作有效；规模测试中消息年龄从5节点约78 ms增至10节点约2.9 s，即使理想交付仍有计算瓶颈。

**局限与解释边界：** 这是模拟/软件系统证据，尚不能等同真实飞行无线链路验证；白化后的几何分离也需要任务指标证明，而非仅报告embedding相似度。

**迁移类型：** 理论启发或基线（拓展阅读）。**与既有阅读的差异/位置：** 缺口：从笔记中的信号重建精度扩展到分布式任务有效性，专门审视表示坍缩、陈旧性与系统吞吐。

**推荐理由与课题接口：** 可迁移的是审计方式：给条件token增加任务相关探针并测端到端延迟；不建议立即把LLM群体模块并入现有信道模型。

**原文：** [arXiv:2609.16947](https://arxiv.org/abs/2609.16947)；[官方页面](https://arxiv.org/abs/2609.16947)；[公开PDF](https://arxiv.org/pdf/2609.16947)。全文已解析9页，核查锚点：潜空间校准消融、系统扩展及延迟结果，PDF6–8页。

**版本记录：** Submission history From: Rajdeep Ghosh [ view email ] [v1] Tue, 15 Sep 2026 10:26:23 UTC (5,310 KB)

**代码状态：** 未发现公开代码。核查论文/公开作者信息和精确标题或arXiv ID的仓库检索，未定位到对应作者实现；不等于断言不存在。未运行复现实验。

## 原推荐表字段

**日期：** 2026-10-08

**标题：** AeroLat: Channel-Aware Latent Space Semantic Communication for Decentralized UAV Swarms

**内容：** 作者：Ghosh, Rajdeep; Vatsava, Goparaju Venkata Seshachala Sree; Misra, Sudip
问题：无人机群采用同构冻结模型时，潜变量相似度可能虚高；计算与消息陈旧性也可能比链路丢包更限制协作。
方法：AeroLat在潜空间注入环境证据并做白化校准，同时显式建模量化、信道噪声、消息年龄与运行延迟。
结果：消融揭示潜空间余弦接近不必然表示语义协作有效；规模测试中消息年龄从5节点约78 ms增至10节点约2.9 s，即使理想交付仍有计算瓶颈。
局限：这是模拟/软件系统证据，尚不能等同真实飞行无线链路验证；白化后的几何分离也需要任务指标证明，而非仅报告embedding相似度。

**契合方向：** 语义通信与分布式系统；理论启发或基线（拓展阅读）

**推荐理由：** 可迁移的是审计方式：给条件token增加任务相关探针并测端到端延迟；不建议立即把LLM群体模块并入现有信道模型。

**顶刊顶会/机构依据：** arXiv预印本；预印本/状态未确认；未找到出版社录用或发表证据，不推断投稿去向。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2609.16947

**检索来源：** https://arxiv.org/abs/2609.16947

**筛选备注：** 2026-10-08身份去重通过；全文已解析9页，核查锚点：潜空间校准消融、系统扩展及延迟结果，PDF6–8页。；未找到出版社录用或发表证据，不推断投稿去向。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；核查论文/公开作者信息和精确标题或arXiv ID的仓库检索，未定位到对应作者实现；不等于断言不存在。未运行复现实验。

**反馈匹配：** 缺口：从笔记中的信号重建精度扩展到分布式任务有效性，专门审视表示坍缩、陈旧性与系统吞吐。

**反馈权重说明：** 优先级B；按方法/数据/理论/系统互补选择，未假设缺失监督存在。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2609.16947)

[来源 2](https://arxiv.org/abs/2609.16947)
{% endraw %}
