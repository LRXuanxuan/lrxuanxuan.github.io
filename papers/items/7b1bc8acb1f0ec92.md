---
layout: page
title: "A mobile edge generation approach"
permalink: /papers/items/7b1bc8acb1f0ec92/
toc: false
---

[← 返回论文库](/papers/?paper=7b1bc8acb1f0ec92)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

移动边缘生成（mobile edge generation, MEG）是一种新兴技术，使网络能够应对生成式人工智能（generative artificial intelligence, GAI）兴起所带来的严峻业务负载预期。本文提出一种新的 MEG 模型，将 GAI 模型部署在边缘服务器（edge server, ES）与用户设备（user equipment, UE）上，以协同完成文本到图像生成任务。生成任务中用户上传文本提示，由 ES 与 UE 合作生成图像。为支持 ES 与 UE 之间的数据传输，采用基于种子的 MEG 协议，将编码后的潜在特征作为生成种子。本文调用预训练的潜在扩散模型（latent diffusion model, LDM）生成潜在特征，并提出一种压缩编码技术对潜在特征进行压缩。所提 MEG 文本到图像生成系统从图像质量与传输开销两方面评估。数值结果表明，与集中式“生成-下载”方案相比，MEG 传输的符号数大幅减少；此外，所提压缩编码方法可在低信噪比（signal-to-noise ratio, SNR）条件下改善生成图像质量。

**摘要依据：** [查看原文摘要](https://doi.org/10.1109/GLOBECOM52923.2024.10901654)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出边缘服务器与用户设备协同的移动边缘生成模型以完成文本到图像生成
- 设计基于种子的 MEG 协议，以编码潜在特征作为生成种子
- 采用预训练潜在扩散模型生成潜在特征并提出压缩编码方法
- 在图像质量与传输开销两方面评估所提生成系统
- 验证 MEG 传输符号数较集中式方案大幅减少且低 SNR 下质量改善

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
