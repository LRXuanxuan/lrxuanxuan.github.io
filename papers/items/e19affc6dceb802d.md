---
layout: page
title: "Compressive channel estimation and multi-user detection in C-RAN"
permalink: /papers/items/e19affc6dceb802d/
toc: false
---

[← 返回论文库](/papers/?paper=e19affc6dceb802d)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

本文研究云无线接入网（cloud radio access network, C-RAN）中的信道估计（channel estimation, CE）与多用户检测（multi-user detection, MUD）问题。假设网络中活跃用户是稀疏的，本文采用压缩感知（compressed sensing, CS）技术求解 CE 与 MUD 问题，从而大幅降低冗长的身份识别导频开销。为利用用户活跃性以及活跃用户所接入的远端射频头（remote radio head, RRH）中固有的稀疏特性，本文提出一种用于扩展稀疏组稀疏恢复的混合 ℓ2.1 正则化泛函。本文给出经验性与理论性指导，以帮助选择对惩罚泛函性能有关键影响的调优参数。为加速处理过程，本文基于交替方向乘子法（alternating direction method of multipliers, ADMM）与变量分裂策略，构造了一种具有收敛保证的高效算法。数值结果说明了所提泛函与高效算法的有效性。

**摘要依据：** [查看原文摘要](https://doi.org/10.1109/ICC.2017.7996388)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 用压缩感知求解 C-RAN 信道估计与多用户检测以降低导频开销。
- 提出混合 ℓ2.1 正则化泛函，同时利用活跃性与接入 RRH 的稀疏性。
- 给出惩罚泛函调优参数的经验与理论选取指导。
- 基于 ADMM 与变量分裂构造收敛的高效算法并数值验证。

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
