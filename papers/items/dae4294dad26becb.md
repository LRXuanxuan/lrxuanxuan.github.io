---
layout: page
title: "Flow matching for generative modeling"
permalink: /papers/items/dae4294dad26becb/
toc: false
---

[← 返回论文库](/papers/?paper=dae4294dad26becb)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

我们引入一种基于连续归一化流（continuous normalizing flow, CNF）的生成建模范式，使我们能够以前所未有的规模训练 CNF。具体而言，我们提出流匹配（Flow Matching, FM）的概念，一种基于回归固定条件概率路径向量场的无仿真 CNF 训练方法。流匹配与用于在噪声与数据样本之间变换的一般高斯概率路径族兼容，该族将现有扩散路径作为特例包含在内。有趣的是，我们发现采用扩散路径的 FM 会产生一种更鲁棒、更稳定的扩散模型训练替代方案。此外，流匹配为使用其他非扩散概率路径训练 CNF 打开了大门。一个特别令人感兴趣的实例是使用最优传输（optimal transport, OT）位移插值来定义条件概率路径。这些路径比扩散路径更高效，提供更快的训练与采样，并带来更好的泛化。在 ImageNet 上使用流匹配训练 CNF，在似然与样本质量两方面均持续优于其他基于扩散的方法，并允许使用现成数值常微分方程（ordinary differential equation, ODE）求解器进行快速可靠的样本生成。

**摘要依据：** [查看原文摘要](https://arxiv.org/abs/2210.02747)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出基于连续归一化流、回归固定条件概率路径向量场的流匹配训练范式
- 证明流匹配兼容一般高斯概率路径族并将扩散路径作为其特例
- 发现采用扩散路径的流匹配可获得更鲁棒、更稳定的扩散模型训练
- 引入基于最优传输位移插值的条件概率路径以加快训练与采样
- 在 ImageNet 上验证似然与样本质量持续优于其他基于扩散的方法

## 公开代码状态

已找到公开实现：https://github.com/facebookresearch/flow_matching（尚未独立复现）。
