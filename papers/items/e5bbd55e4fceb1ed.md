---
layout: page
title: "Generative diffusion models for high dimensional channel estimation"
permalink: /papers/items/e5bbd55e4fceb1ed/
toc: false
---

[← 返回论文库](/papers/?paper=e5bbd55e4fceb1ed)

**收录日期：** 2026-11-03  
**收录范围：** 英文标题、中文摘要译文与贡献点；不提供全文译文或上传 PDF。

<a id="paper-summary"></a>

## 摘要（中文译文）

随着生成式人工智能（artificial intelligence, AI）的繁荣，其解决无线通信传统挑战的潜力也逐渐显现。受此趋势启发，我们研究将先进扩散模型（diffusion model, DM）——生成式 AI 模型的一类代表——应用于高维无线信道估计。通过由 DM 编码的深度生成先验刻画多输入多输出（MIMO）无线信道的结构，我们提出一种用于信道重建的新的后验推断方法。我们进一步将该方法适配用于从低分辨率量化测量中恢复信道信息。此外，为增强空口可行性，我们将 DM 与无监督的 Stein 无偏风险估计器（Stein's unbiased risk estimator, SURE）相结合，从而能够从含噪观测中学习，并规避实践中难以获得真实信道数据的要求。结果表明，所提估计器实现高保真信道恢复，同时相较当前最优方案将估计时延降低 10 倍，有助于实时实现。此外，我们的方法在将导频开销减半的同时优于现有估计器，展示了其向超大规模天线阵列的可扩展性。

**摘要依据：** [查看原文摘要](https://doi.org/10.1109/TWC.2025.3549592)（机器辅助翻译，仅供阅读参考）

## 贡献点

- 将扩散模型用于高维无线信道估计并提出基于后验推断的信道重建方法
- 将所提方法扩展到低分辨率量化测量下的信道信息恢复
- 结合无监督 Stein 无偏风险估计器实现含噪观测学习并免除真实信道数据依赖
- 验证估计时延较当前最优方案降低 10 倍且导频开销减半
- 展示所提方法向超大规模天线阵列的可扩展性

## 公开代码状态

已找到与论文一致、含训练/测试脚本的公开仓库：https://github.com/STARainZ/Diffusion-models-for-channel-estimation。原先发现的仓库是该仓库的 fork；当前尚未核验上游仓库所有者是否为论文作者。
