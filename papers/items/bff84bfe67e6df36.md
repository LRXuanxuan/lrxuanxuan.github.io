---
layout: page
title: "Null-space flow matching for MIMO channel estimation in latency-constrained systems"
permalink: /papers/items/bff84bfe67e6df36/
toc: false
---

[← 返回论文库](/papers/?paper=bff84bfe67e6df36)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

准确且低时延的信道状态信息（channel state information, CSI）获取对多输入多输出（multiple-input multiple-output, MIMO）通信系统至关重要。尽管基于分数与扩散模型等先进深度生成模型能够由有限导频观测实现高保真 CSI 重建，但其往往具有较高推理时延。为在严格时延约束下实现准确 CSI 估计，本文提出一种零空间流匹配（null-space flow matching, FM）框架，利用范围-零空间分解分离观测可确定与欠定的信道分量。具体而言，导频观测用于规整可观测的范围空间信道分量，而基于 FM 的生成先验主要通过迭代精化解决模糊的零空间自由度。为进一步提升框架的鲁棒性与效率，我们引入噪声感知自适应校正策略以抑制精化轨迹上的信道噪声，并采用幂律时间调度以更好地分配有限的精化步数。实验结果表明，该方法即使在约 3 ms 的严格时延预算下也能取得有竞争力的归一化均方误差（normalized mean square error, NMSE）性能，同时相较基于模型与生成式的基线提供更优的精度-时延折中。

**摘要依据：** [查看原文摘要](https://arxiv.org/abs/2604.22005)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出零空间流匹配框架，以范围-零空间分解分离可观测与欠定信道分量
- 利用导频观测规整范围空间分量，并由生成先验求解零空间自由度
- 设计噪声感知自适应校正策略以抑制精化轨迹上的信道噪声
- 采用幂律时间调度在有限精化步数下提升精化效率与鲁棒性
- 在约 3 ms 时延预算下验证较模型与生成基线具更优精度-时延折中

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
