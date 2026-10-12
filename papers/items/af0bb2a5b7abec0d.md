---
layout: page
title: "Channel Map-Based Channel Estimation for Near-Field UM-MIMO with Movable Planar Arrays"
permalink: /papers/items/af0bb2a5b7abec0d/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=af0bb2a5b7abec0d)

[本篇日报说明](/papers/items/af0bb2a5b7abec0d/#paper-report) · [中文译文进度](/papers/items/af0bb2a5b7abec0d/#paper-translation)

**推荐日期：** 2026-08-19 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 中文译文及进度

已完成中文逐章译读稿，覆盖近场 UM-MIMO 信道模型、可移动阵列 LoS 估计、NLoS 子空间方法、导频分配与实验；尚未逐段核对全部公式及完整书目。个人阅读稿已在当前对话提供。由于未核实公开改编授权，暂不公开上架整篇译文。

[查看原始 PDF](https://arxiv.org/pdf/2608.05520v1) · [查看十篇译稿进度](/papers/translation-status-2026-08/)

**状态说明：** 完整全文翻译尚未验收通过，不能仅凭本稿把该论文标记为“全文已完成”。

<span id="paper-report"></span>

## 本篇推荐与证据

## 3. Channel Map-Based Channel Estimation for Near-Field UM-MIMO with Movable Planar Arrays

- 作者：Shuaifei Chen, Cheng-Xiang Wang, Chen Huang, Qianze Yang, Xiping Wu, Yunfei Chen, El-Hadi M. Aggoune；2026，arXiv:2608.05520。
- 问题/方法：粗位置 + Fisher information 指导阵位估计 LoS；NLoS 采用 sketch-based RSLS 或由 scatterer-location map 构造 CM-RSLS；多用户加入 visibility region 与结构相似度导频分配。
- 结果：`N=1024, rank=10` 时 SA-RSLS 约 `1.8×10^5` 运算，相比完整 RSLS 的约 `1.1×10^9` 低三个数量级；CM-RSLS 复杂度为 `O(NL^2)`。
- 局限：仿真为主且依赖较准散射体地图；位置、scatterer 与 visibility map 误差的实测敏感性待核验。
- 迁移：理论启发/非生成式强基线；相对 GeoGS-CE/GeoPSD 新增 map-derived NLoS subspace、阵位设计和 pilot assignment。
- 链接：[arXiv](https://arxiv.org/abs/2608.05520)｜[PDF](https://arxiv.org/pdf/2608.05520)
- 代码：未发现公开代码。相对阅读笔记属于核心深化。

## 原推荐表字段

**日期：** 2026-08-19

**标题：** Channel Map-Based Channel Estimation for Near-Field UM-MIMO with Movable Planar Arrays

**内容：** 作者：Shuaifei Chen、Cheng-Xiang Wang、Chen Huang、Qianze Yang、Xiping Wu、Yunfei Chen、El-Hadi M. Aggoune。粗位置 + Fisher information 指导阵位估计 LoS；NLoS 采用 sketch-based RSLS 或 scatterer-map CM-RSLS；多用户加入 visibility region 与结构相似度导频分配。N=1024、rank=10 时约 1.8×10^5 运算，相比完整 RSLS 约 1.1×10^9 低三个数量级；CM-RSLS 为 O(NL^2)。局限：仿真且依赖较准 scatterer map；地图误差实测敏感性待核验。

**契合方向：** 近场 UM-MIMO；channel-map CE；稀疏导频；低复杂度子空间

**推荐理由：** 把环境地图转成 LoS/散射子空间和导频分配先验，直接衔接 CKM→MIMO CE；迁移类型：理论启发/非生成式强基线。

**顶刊顶会/机构依据：** 2026 arXiv；Cheng-Xiang Wang 等团队；正式 venue/DOI 待核验。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2608.05520

**检索来源：** arXiv:2608.05520；官方页：https://arxiv.org/abs/2608.05520

**筛选备注：** 硬去重无命中。相对 GeoGS-CE/GeoPSD，新增 movable-array 位置设计、map-derived NLoS subspace 和 pilot assignment；核心深化。

**是否略读：** ☐

**是否精读：** ☐

**备注：** 853

**代码链接：** 未发现公开代码

**代码/数据状态：** 未发现公开代码：论文页、作者主页及题名/arXiv ID 精确检索未发现可核验实现。

**反馈匹配：** 强匹配：CKM-assisted MIMO CE、近场、低复杂度、pilot/geometry consistency。

**反馈权重说明：** 优先精读；短期先实现 fixed-array map-derived DFT/PSD subspace，movable array 后置。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2608.05520)

[来源 2](https://arxiv.org/abs/2608.05520)

[来源 3](https://arxiv.org/abs/2608.05520)｜)
{% endraw %}
