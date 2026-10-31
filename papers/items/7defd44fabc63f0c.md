---
layout: page
title: "Echo State Network (ESN) for Signal Recovery in RF-Impaired IBFD MIMO Systems"
permalink: /papers/items/7defd44fabc63f0c/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=7defd44fabc63f0c)

[本篇日报说明](/papers/items/7defd44fabc63f0c/#paper-report) · [阅读全文翻译](/papers/translations/2026-09-26-2609-23945-echo-state-network-esn-for-signal-recovery-in-rf-impaired-ibfd-mimo-sy/)

**推荐日期：** 2026-09-26 · **发表状态：** 已接受待刊

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

### 11. Echo State Network (ESN) for Signal Recovery in RF-Impaired IBFD MIMO Systems

**作者：** Prisby, Conrad; Li, Siyao; Xu, Chengtao; Yang, Thomas。**年份/venue：** 2026 / IEEE MILCOM 2026。**优先级：** B。

**发表状态：** 已接受待刊（作者自述）；核验于2026-09-26。公开版本日期：2026/09/20。2026-09-20 arXiv comments称已接受；未独立核实正式论文集。 [证据1](https://arxiv.org/abs/2609.23945)

**问题与方法：** 全双工MIMO中的自干扰叠加IQ失衡、CFO、相噪及功放非线性，线性盲分离假设失效。 冻结ESN离线表征静态自干扰通道，另一ESN用递归最小二乘在线跟踪期望信号；使用稀疏导频，比较LSTM、GRU及RLS。

**关键结果：** 仿真支持优于Fast-ICA的信号恢复，并在固定第一阶段条件下改善导频效率；消融反映非线性状态展开与衰减记忆的联合贡献。

**局限与解释边界：** 不是SDR硬件实测；静态SI模型与在线轨迹设置限制泛化。消融没有完全分离记忆与非线性两种因果贡献。

**迁移类型：** 可改造工具。**相对阅读笔记的位置与差异：** 基线：为Recursive Flow/高速信道方法提供低成本递归模型，不需要把所有问题都改成生成模型。

**推荐理由：** 可在统一导频与RF失真下比较误差、在线更新成本和时延。

**论文与全文：** arXiv [2609.23945](https://arxiv.org/abs/2609.23945)；[官方记录](https://arxiv.org/abs/2609.23945)；[公开PDF](https://arxiv.org/pdf/2609.23945)。已解析6页；核对锚点：§III–VI、Fig.5及detector消融说明。

**代码状态：** 未发现公开代码。已检查论文及其链接，并按精确标题/arXiv编号检索GitHub；未找到可归属于本文的公开实现。检索无结果不等于代码不存在。部分GitHub API检索受限，补充网页检索。

## 原推荐表字段

**日期：** 2026-09-26

**标题：** Echo State Network (ESN) for Signal Recovery in RF-Impaired IBFD MIMO Systems

**内容：** 作者：Prisby, Conrad; Li, Siyao; Xu, Chengtao; Yang, Thomas
问题：全双工MIMO中的自干扰叠加IQ失衡、CFO、相噪及功放非线性，线性盲分离假设失效。
方法：冻结ESN离线表征静态自干扰通道，另一ESN用递归最小二乘在线跟踪期望信号；使用稀疏导频，比较LSTM、GRU及RLS。
结果：仿真支持优于Fast-ICA的信号恢复，并在固定第一阶段条件下改善导频效率；消融反映非线性状态展开与衰减记忆的联合贡献。
局限：不是SDR硬件实测；静态SI模型与在线轨迹设置限制泛化。消融没有完全分离记忆与非线性两种因果贡献。

**契合方向：** 实测数据与射频接收机；可改造工具

**推荐理由：** 可在统一导频与RF失真下比较误差、在线更新成本和时延。

**顶刊顶会/机构依据：** IEEE MILCOM 2026；已接受待刊（作者自述）；2026-09-20 arXiv comments称已接受；未独立核实正式论文集。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2609.23945

**检索来源：** https://arxiv.org/abs/2609.23945

**筛选备注：** 2026-09-26身份去重通过；全文6页；§III–VI、Fig.5及detector消融说明。；2026-09-20 arXiv comments称已接受；未独立核实正式论文集。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 未发现公开代码；已检查论文及其链接，并按精确标题/arXiv编号检索GitHub；未找到可归属于本文的公开实现。检索无结果不等于代码不存在。部分GitHub API检索受限，补充网页检索。

**反馈匹配：** 基线：为Recursive Flow/高速信道方法提供低成本递归模型，不需要把所有问题都改成生成模型。

**反馈权重说明：** 优先级B；按方法/数据/系统互补选择，未假设全模态监督可用。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2609.23945)

[来源 2](https://arxiv.org/abs/2609.23945)
{% endraw %}
