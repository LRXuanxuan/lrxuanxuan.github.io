---
layout: page
title: "Estimation of Non-Normalized Statistical Models by Score Matching"
permalink: /papers/items/c3eecedb6cdb949e/
toc: false
---

[← 返回论文库](/papers/?paper=c3eecedb6cdb949e)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

人们常常需要估计概率密度函数仅已知到一个乘性归一化常数的统计模型。此时通常不得不借助马尔可夫链蒙特卡洛（Markov chain Monte Carlo, MCMC）方法，或采用归一化常数的近似。本文提出，可以通过最小化模型给出的对数密度梯度与观测数据对数密度梯度之间的期望平方距离来估计这类模型。尽管对数密度梯度的估计原则上是一个非常困难的非参数问题，我们证明了一个出人意料的结果：该目标函数存在简单公式。观测数据的密度函数并不出现在这一公式中，该公式可简化为模型所给对数密度若干导数之和的样本平均。我们在多元高斯模型与独立成分分析（independent component analysis, ICA）模型上，以及在为自然图像数据估计过完备滤波器组时，验证了该方法的有效性。

**摘要依据：** [查看原文摘要](https://www.semanticscholar.org/paper/9966e890f2eedb4577e11b9d5a66380a4d9341fe)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出以对数密度梯度匹配估计未归一化统计模型
- 证明目标函数存在不含观测数据密度的闭式公式
- 将目标简化为模型对数密度导数之和的样本平均
- 在多元高斯、ICA 与自然图像过完备滤波器组上验证有效性

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
