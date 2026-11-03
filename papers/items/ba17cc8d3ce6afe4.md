---
layout: page
title: "Predicting distributions with Linearizing Belief Networks"
permalink: /papers/items/ba17cc8d3ce6afe4/
toc: false
---

[← 返回论文库](/papers/?paper=ba17cc8d3ce6afe4)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

条件信念网络（conditional belief network）在神经网络中引入随机二值变量。与经典神经网络不同，信念网络不仅能预测给定输入 X 时输出 Y 的期望值，还能预测输出的分布；当同一输入可能对应多个输出、且这些输出的平均并非有效答案时，这种能力十分有用。此类网络尤其适用于图像去噪中的图像预测、文本到语音等逆问题（inverse problem）。然而，传统的 sigmoid 信念网络难以训练，也不适用于连续问题。本文提出一类新的网络，称为线性化信念网络（linearizing belief net, LBN）。LBN 可分解为一个深层线性网络，其中每个线性单元可由非确定性的二值潜变量开启或关闭。它是实值条件分布的通用逼近器，并可用梯度下降训练。此外，线性通路能够高效传播连续信息，并作为乘性跳跃连接，通过消除梯度弥散来帮助优化。由此得到的模型训练高效，并在图像去噪以及基于 Toronto faces 数据集的人脸表情生成任务上改进了当时的最优结果。

**摘要依据：** [查看原文摘要](https://arxiv.org/abs/1511.05622)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出线性化信念网络 LBN 以预测实值条件分布
- 以二值随机潜变量开关深层线性单元构造通用逼近器
- 利用线性通路作为乘性跳跃连接缓解梯度弥散
- 在图像去噪与 Toronto faces 表情生成上改进最优结果

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
