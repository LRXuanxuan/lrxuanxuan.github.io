---
layout: page
title: "Solving Inverse Problems of Chaotic Systems with Bidirectional Conditional Flow Matching"
permalink: /papers/items/2fd7c6f4df7bed7e/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=2fd7c6f4df7bed7e)

[本篇日报说明](/papers/items/2fd7c6f4df7bed7e/#paper-report) · [阅读全文翻译](/papers/translations/2026-10-08-2606-24824-solving-inverse-problems-of-chaotic-systems-with-bidirectional-conditi/)

**推荐日期：** 2026-10-08 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

### 06. Solving Inverse Problems of Chaotic Systems with Bidirectional Conditional Flow Matching

**作者：** Hu, Peiyan; Zhang, Jian; Pan, Jiashu; Feng, Ruiqi; Zhang, Tao; Ma, Zhi-Ming; Ting, Yuan-Sen; Li, Gongjie; Wu, Tailin。**年份/venue：** 2026 / arXiv预印本。**浏览优先级：** B。

**发表状态：** 预印本/状态未确认。首个公开版本日期：2026/06/23。未找到出版社录用或发表证据，不推断投稿去向。 核验日期2026-10-08。[来源1](https://arxiv.org/abs/2606.24824)

**问题：** 混沌系统正向敏感且逆映射多解，单方向条件生成可能产生不满足动力学的初始状态。

**方法：** BiCFM联合前向与反向条件流匹配；CBiCFM进一步引入守恒关系，利用物理一致性约束生成逆解分布。

**关键结果：** 覆盖Lorenz、Lorenz96、电路、三体与星团等任务，评估逆解分布及正向一致性；论文报告特定任务上的加速与更稳定逆推断。

**局限与解释边界：** 多解系统的分布指标与逐轨迹误差不可替代。守恒结构与训练正演数据是额外假设，星团/天体模拟器链接不等于本方法训练代码；无线高移动不是简单的Lorenz过程。

**迁移类型：** 理论启发或基线（拓展阅读）。**与既有阅读的差异/位置：** 缺口：相对阅读笔记的静态MIMO Flow Matching，关注不可逆、敏感动力系统中的双向训练，区别于每帧独立重建。

**推荐理由与课题接口：** 启发时间序列中的前向一致性校验。先做小规模已知状态空间系统，再判断是否值得为多普勒/运动建模新增数据。

**原文：** [arXiv:2606.24824](https://arxiv.org/abs/2606.24824)；[官方页面](https://arxiv.org/abs/2606.24824)；[公开PDF](https://arxiv.org/pdf/2606.24824)。全文已解析50页，核查锚点：BiCFM/CBiCFM方法、五类任务及50页附录。

**版本记录：** Submission history From: Peiyan Hu [ view email ] [v1] Tue, 23 Jun 2026 17:07:47 UTC (14,833 KB)

**代码状态：** 未发现公开代码。论文引用的CMC-COSMIC属于物理仿真软件，不能作为BiCFM实现证据；作者论文及精确ID检索未发现对应训练/推断库。

## 原推荐表字段

**日期：** 2026-10-08

**标题：** Solving Inverse Problems of Chaotic Systems with Bidirectional Conditional Flow Matching

**内容：** 作者：Hu, Peiyan; Zhang, Jian; Pan, Jiashu; Feng, Ruiqi; Zhang, Tao; Ma, Zhi-Ming; Ting, Yuan-Sen; Li, Gongjie; Wu, Tailin
问题：混沌系统正向敏感且逆映射多解，单方向条件生成可能产生不满足动力学的初始状态。
方法：BiCFM联合前向与反向条件流匹配；CBiCFM进一步引入守恒关系，利用物理一致性约束生成逆解分布。
结果：覆盖Lorenz、Lorenz96、电路、三体与星团等任务，评估逆解分布及正向一致性；论文报告特定任务上的加速与更稳定逆推断。
局限：多解系统的分布指标与逐轨迹误差不可替代。守恒结构与训练正演数据是额外假设，星团/天体模拟器链接不等于本方法训练代码；无线高移动不是简单的Lorenz过程。

**契合方向：** 非线性动力系统与逆推断；理论启发或基线（拓展阅读）

**推荐理由：** 启发时间序列中的前向一致性校验。先做小规模已知状态空间系统，再判断是否值得为多普勒/运动建模新增数据。

**顶刊顶会/机构依据：** arXiv预印本；预印本/状态未确认；未找到出版社录用或发表证据，不推断投稿去向。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2606.24824

**检索来源：** https://arxiv.org/abs/2606.24824

**筛选备注：** 2026-10-08身份去重通过；全文已解析50页，核查锚点：BiCFM/CBiCFM方法、五类任务及50页附录。；未找到出版社录用或发表证据，不推断投稿去向。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；论文引用的CMC-COSMIC属于物理仿真软件，不能作为BiCFM实现证据；作者论文及精确ID检索未发现对应训练/推断库。

**反馈匹配：** 缺口：相对阅读笔记的静态MIMO Flow Matching，关注不可逆、敏感动力系统中的双向训练，区别于每帧独立重建。

**反馈权重说明：** 优先级B；按方法/数据/理论/系统互补选择，未假设缺失监督存在。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2606.24824)

[来源 2](https://arxiv.org/abs/2606.24824)
{% endraw %}
