---
layout: page
title: "Physics-informed representation alignment for sparse radio-map reconstruction"
permalink: /papers/items/1fa17ca6fef07fd7/
toc: false
---

[← 返回论文库](/papers/?paper=1fa17ca6fef07fd7)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

随着无线通信技术的快速发展，频谱资源高效利用、通信质量优化与智能通信愈发关键。无线电地图重建对支撑先进应用十分重要，但复杂信号传播与稀疏观测数据等挑战使实际场景中的精确重建十分困难。现有方法往往难以将物理约束与数据驱动特征对齐，在稀疏测量条件下尤为明显。为此，本文提出物理对齐无线电地图扩散模型（Physics-Aligned Radio Map Diffusion Model, PhyRMDM），通过双学习通路在物理原理与神经网络特征之间建立跨域表示对齐。该模型将物理信息神经网络（physics-informed neural network, PINN）与表示对齐机制相结合，显式强制 Helmholtz 方程约束与环境传播模式之间的一致性。其架构采用两个协同的 U-Net：第一个通过潜空间对齐最小化偏微分方程残差与边界条件以保证物理一致性，第二个通过扩散去噪与注意力引导的特征融合精修预测。该双重对齐策略使模型同时满足波传播规律与数据分布特性。实验结果表明，所提方法显著优于现有先进方法：在静态无线电地图（Static Radio Map, SRM）条件下达到 0.0031 的归一化均方误差（normalized mean square error, NMSE）与 0.0125 的均方根误差（root mean square error, RMSE），在动态无线电地图（Dynamic Radio Map, DRM）场景下 NMSE 为 0.0047、RMSE 为 0.0146；在超稀疏情形（1% 采样率）下带来 37.2% 的精度提升，验证了其衔接物理建模与深度学习进行无线电地图重建的有效性，并为稀疏信号环境表征建立了新框架，可直接应用于 5G/6G 网络优化与智能频谱管理。

**摘要依据：** [查看原文摘要](https://doi.org/10.1145/3746027.3758161)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出 PhyRMDM，以双学习通路实现物理原理与网络特征的跨域对齐
- 将物理信息神经网络与表示对齐机制结合以强制满足 Helmholtz 方程约束
- 设计两个协同 U-Net 分别保证物理一致性与注意力引导的去噪精修
- 在 SRM/DRM 场景取得 NMSE 0.0031/0.0047 等精度并优于先进方法
- 在 1% 采样率超稀疏情形下实现 37.2% 的精度提升

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
