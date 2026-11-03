---
layout: page
title: "A DBO-Based Improved 2D-MUSIC Algorithm for Localization Using OFDM"
permalink: /papers/items/013da2ee6affdfbb/
toc: false
---

[← 返回论文库](/papers/?paper=013da2ee6affdfbb)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

本文考虑单输入多输出（single-input multiple-output, SIMO）的通感一体化（integrated sensing and communication, ISAC）系统，其中正交频分复用（orthogonal frequency division multiplexing, OFDM）通信信号被复用以检测目标位置，包括距离与角度参数。二维多重信号分类（two-dimensional multiple signal classification, 2D-MUSIC）算法被用于处理此类与大阵列相关的多子载波格式信号。然而，标准 2D-MUSIC 计算复杂度高，且其估计精度受二维网格穷举搜索步长限制。为克服这些问题，本文提出一种两步改进的 2D-MUSIC（improved 2D-MUSIC, I2D-MUSIC）算法：以蜣螂优化（dung beetle optimization, DBO）算法替代原有网格穷举搜索，先获得参数的粗估计；随后推导基于随机梯度下降（stochastic gradient descent, SGD）的方法，对距离与角度参数进行精细估计。仿真结果与硬件实验表明，所提算法在保持与标准 2D-MUSIC 相当的估计精度的同时显著降低计算复杂度，且其精度不受搜索步长约束。

**摘要依据：** [查看原文摘要](https://doi.org/10.1109/WCNC61545.2025.10978288)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出两步改进 2D-MUSIC 算法，以替代网格穷举搜索降低复杂度。
- 采用蜣螂优化算法实现距离与角度参数的粗估计。
- 推导基于随机梯度下降的精估计方法，使精度不再受步长限制。
- 在仿真与硬件实验中验证复杂度下降且精度与标准算法相当。

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
