---
layout: page
title: "CKMImageNet: A dataset for AI-based channel knowledge map towards environment-aware communication and sensing"
permalink: /papers/items/eaa6e7cf5bae1cf8/
toc: false
---

[← 返回论文库](/papers/?paper=eaa6e7cf5bae1cf8)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

随着第六代（6G）移动通信网络对实时信道状态信息（channel state information, CSI）的需求不断增长，信道知识地图（channel knowledge map, CKM）作为一种有前景的技术受到关注：它提供站点特定的数据库，可借助先验无线信道知识实现环境感知，并显著提升通信与感知性能。然而，CKM 的高效构建与利用需要高质量、海量且位置特定的信道知识数据，以准确反映真实环境。受 ImageNet 数据集在推动计算机视觉与人工智能（artificial intelligence, AI）图像理解方面取得巨大成功的启发，本文提出 CKMImageNet 数据集，通过整合位置特定信道知识数据、高保真环境地图及其视觉表示，在 AI 与环境感知无线通信感知之间架起桥梁。CKMImageNet 支持广泛的 AI 驱动 CKM 构建方法，其数据具有空间一致性与位置特定性，涵盖有监督与无监督、判别式与生成式 AI 方法。该数据集采用先进射线追踪技术构建，确保高保真与环境准确性。通过应对 CKM 构建中的关键挑战并使 AI 模型学习环境感知的传播模式，CKMImageNet 有望成为推进环境感知 6G 系统的基础工具，应用从网络规划（如通信基站选址、感知锚节点布置）到主动资源分配（如波束对齐、功率分配、干扰规避、杂波抑制与机器人轨迹规划）。与 RadioMapSeer 等现有数据集相比，CKMImageNet 不仅提供信道增益数值及可视化表示，还提供多径到达角（angle of arrival, AoA）与路径时延等更多样化的信道知识；此外，该数据集提供多种尺寸的图像以适应不同应用场景。

**摘要依据：** [查看原文摘要](https://doi.org/10.1109/TCOMM.2025.3615778)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 构建 CKMImageNet 数据集，整合位置特定信道知识、高保真环境地图与视觉表示
- 采用先进射线追踪保证数据高保真与环境准确性
- 支持有/无监督、判别式与生成式等多类 AI 驱动 CKM 构建方法
- 在 RadioMapSeer 基础上增加多径 AoA、路径时延等多样化信道知识与多尺寸图像
- 为 6G 网络规划与主动资源分配等环境感知应用提供基础数据工具

## 公开代码状态

未发现作者官方仓库；找到相关公开实现：https://github.com/zyktzCKM/CKMImageNet（非官方或相关工具，未确认与论文完全一致，仅作参考）。
