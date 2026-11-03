---
layout: page
title: "Scalable diffusion models with transformers"
permalink: /papers/items/44cbc5c28aec7bfa/
toc: false
---

[← 返回论文库](/papers/?paper=44cbc5c28aec7bfa)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

本文探索一类基于 Transformer 架构的新型扩散模型。我们训练面向图像的潜在扩散模型，将常用的 U-Net 主干替换为在潜在块上运算的 Transformer，即扩散 Transformer（Diffusion Transformer, DiT）。我们以 Gflops 度量的前向计算复杂度为视角，分析 DiT 的可扩展性。研究发现，通过增加 Transformer 的深度或宽度、或增加输入 token 数量来提升 Gflops 的 DiT，其 FID（Fréchet Inception Distance）一致地更低，说明以 Gflops 衡量的模型容量与生成质量之间存在一致关系。除具备良好的可扩展性外，最大的 DiT-XL/2 模型在类别条件 ImageNet 512×512 与 256×256 基准上优于此前所有扩散模型，并在 256×256 基准上达到 2.27 的当前最优 FID，表明前向计算复杂度可作为该类扩散模型可扩展性的有效度量。

**摘要依据：** [查看原文摘要](https://doi.org/10.1109/ICCV51070.2023.00387)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出面向图像生成的扩散 Transformer（DiT）架构，以 Transformer 替换 U-Net 主干
- 训练面向图像的潜在扩散模型，使 Transformer 在潜在块上运算
- 以 Gflops 度量的前向计算复杂度为视角分析 DiT 的可扩展性
- 发现提高模型深度、宽度或输入 token 数可一致降低 FID
- 验证最大模型 DiT-XL/2 在类别条件 ImageNet 256×256 基准上取得 2.27 的最优 FID

## 公开代码状态

已找到可公开访问的实现仓库；尚未实际复现。 https://github.com/facebookresearch/DiT
