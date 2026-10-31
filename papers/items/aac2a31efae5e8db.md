---
layout: page
title: "DeepRT Engine: A Unified GPU-Parallel Ray-Tracing Framework with Hybrid SBR-IM Path Search for 6G Digital Twin Channel"
permalink: /papers/items/aac2a31efae5e8db/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=aac2a31efae5e8db)

[本篇日报说明](/papers/items/aac2a31efae5e8db/#paper-report) · [阅读全文翻译](/papers/translations/2607.11743/)

**推荐日期：** 2026-07-20 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 3. DeepRT Engine: A Unified GPU-Parallel Ray-Tracing Framework with Hybrid SBR-IM Path Search for 6G Digital Twin Channel

- 作者：Tao Wu, Li Yu, Yuxiang Zhang, Jianhua Zhang, Qixing Wang, Guangyi Liu
- 时间/类型：2026，arXiv 预印本
- arXiv：[2607.11743](https://arxiv.org/abs/2607.11743)
- PDF：[官方 PDF](https://arxiv.org/pdf/2607.11743)
- 代码状态：**未发现公开代码或数据**。论文未给仓库；题名、DeepRT-E、作者与 arXiv ID 的 GitHub 检索未找到对应实现。

### 核心问题与方法

DeepRT-E 面向 Digital Twin Channel（数字孪生信道）的实时射线追踪，采用三阶段结构：

1. 用 BVH（Bounding Volume Hierarchy）减少冗余射线–表面求交；
2. GPU 并行 SBR（Shooting and Bouncing Rays）只保留候选表面序列；
3. 对压缩后的候选执行 batched Image Method，恢复精确反射点与路径参数。

论文在 RTX 4090 上报告：运行时间 0.148 s，而串行混合 RT、Wireless InSite、Sionna 分别为 3.981 s、2.804 s、0.286 s；相对串行流程降低 96.3%，平均功率误差约 0.021 dB、收敛误差 0.001 dB。

### 与用户课题的接口

它可作为 CKM/WCM 数据层，而不是生成模型本身：输出路径角度、时延、功率、交互表面序列，再形成 \(p(H\mid r,e,M)\) 的训练样本与 geometry/path token。若代码后续开放，可与 CSRD2025、OpenPathNet、UrbanMIMOMap、LAETwin-XL 形成“MATLAB/商用 RT—Sionna—GPU hybrid RT”的速度与精度对照。

### 为什么不是重复

已有数据工具链侧重可配置 RF 数据、Sionna 场景或低空逐阵元数据；本文新增 **SBR 候选压缩 + IM 精确恢复 + GPU 批处理** 的路径搜索机制。它补充的是数据生成效率，不应包装为端到端 CSI 生成器或新的 CKM 网络。

### 局限

仅有短文中的仿真场景与单一 RTX 4090 平台；未公开实现，无法核验工程复现性。论文没有覆盖真实场景材料标定、Sim2Real 误差、动态几何更新或生成模型训练。

## 原推荐表字段

**日期：** 2026-07-20

**标题：** DeepRT Engine: A Unified GPU-Parallel Ray-Tracing Framework with Hybrid SBR-IM Path Search for 6G Digital Twin Channel

**内容：** 作者：Tao Wu、Li Yu、Yuxiang Zhang、Jianhua Zhang、Qixing Wang、Guangyi Liu。DeepRT Engine 以 BVH 和 GPU 并行 SBR 搜索候选反射面序列，再用批量 Image Method 精确恢复传播路径，面向 6G 数字孪生信道的高吞吐射线追踪。论文在 RTX 4090 上报告 0.148 s，对比串行混合 RT 的 3.981 s、Wireless InSite 的 2.804 s 和 Sionna 的 0.286 s；相对串行流程运行时间减少 96.3%。局限：短篇室内仿真、平台与场景有限，尚无材料标定、Sim2Real 或动态几何实测。

**契合方向：** CKM/WCM；射线追踪；数字孪生；无线数据生成

**推荐理由：** 可作为 p(H|r,e,M) 上游数据层，批量产生路径角度、时延、功率和可见性 token，并为缺失 AoA/AoD 城市补伪标签；应与 CSRD/OpenPathNet/UrbanMIMOMap 做速度、精度和可用接口对照。它不是现成端到端 CSI 生成器。

**顶刊顶会/机构依据：** arXiv 2026 预印本；Jianhua Zhang 等数字孪生信道团队。按 GPU RT 机制与可量化速度/精度入选。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2607.11743

**检索来源：** arXiv:2607.11743；官方页：https://arxiv.org/abs/2607.11743；官方 PDF：https://arxiv.org/pdf/2607.11743

**筛选备注：** 硬去重无命中。相对已收集 CSRD/射线追踪工具链，新增“GPU 并行 SBR 候选搜索+批量 IM 精确恢复”的效率维度；定位为可改造的数据/仿真工具，不重复包装为生成模型。

**是否略读：** ☑

**是否精读：** ☐

**备注：** —

**代码链接：** 未发现公开代码

**代码/数据状态：** 未发现公开代码/数据：已检查论文页，并以完整标题、DeepRT Engine、作者和 arXiv ID 在 GitHub 检索，未发现作者仓库。

**反馈匹配：** 高匹配：环境先验、射线追踪、CKM/WCM 数据构建和缺失角度监督补全。

**反馈权重说明：** 契合用户认可的 MATLAB/RT/Sim2Real 工具链，但当前仅能作为上游仿真候选；需警惕论文数值尚未跨平台、跨场景复核。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2607.11743)

[来源 2](https://arxiv.org/abs/2607.11743)
{% endraw %}
