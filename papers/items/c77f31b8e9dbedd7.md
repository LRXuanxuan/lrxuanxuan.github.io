---
layout: page
title: "Generating CKM using others' data: Cross-AP CKM inference with deep learning"
permalink: /papers/items/c77f31b8e9dbedd7/
toc: false
---

[← 返回论文库](/papers/?paper=c77f31b8e9dbedd7)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

信道知识地图（channel knowledge map, CKM）通过在实际运行前提供位置特定的先验信道知识，有望推动通信与感知走向环境感知，对无蜂窝等密集网络尤其具有吸引力，但高效生成 CKM 仍具挑战。在现有点（access point, AP）已各自建立 CKM 的密集网络中，仅利用位置信息为潜在新 AP 构建 CKM 将很有价值：跨 AP 的 CKM 生成有助于便捷实现 CKM 初始化、面向新 AP 的环境感知部署以及低成本的 CKM 更新。同一区域内共享相同物理环境的 AP，其 CKM 之间存在天然相关性，因此可通过挖掘这种位置特定信道知识间的隐含相关性，利用其他 AP 的数据实现跨 AP 的 CKM 推断。本文提出一种跨 AP 推断方法，以深度学习生成潜在新 AP 的 CKM：将目标 AP 的位置与其他现有 AP 的信道知识一并输入 U-Net 模型，并基于目标 AP 的信道知识进行监督学习；利用训练好的 U-Net 与现有 AP 的信道知识，即可跨 AP 生成新 AP 的 CKM 推断结果。推断 CKM 的生成结果验证了利用其他 AP 信道知识进行跨 AP CKM 推断的可行性与有效性。

**摘要依据：** [查看原文摘要](https://doi.org/10.1109/TVT.2025.3604862)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 提出跨 AP 的 CKM 推断思路，仅用新 AP 位置信息生成其 CKM
- 挖掘同区域 AP 间 CKM 的隐含相关性以复用其他 AP 的信道知识
- 设计将目标 AP 位置与其他 AP 信道知识输入 U-Net 的深度学习方法
- 以目标 AP 信道知识监督训练实现跨 AP 的 CKM 生成
- 生成结果验证跨 AP CKM 推断的可行性与有效性

## 公开代码状态

未找到可确认的论文公开代码仓库（检索范围：GitHub 仓库名与 README 关键词、arXiv 元数据、DOI 题录；不代表作者未开源）。
