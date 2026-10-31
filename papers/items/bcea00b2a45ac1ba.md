---
layout: page
title: "RadTwin: Generalizable Wireless Digital Twin for Dynamic Environments"
permalink: /papers/items/bcea00b2a45ac1ba/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=bcea00b2a45ac1ba)

[本篇日报说明](/papers/items/bcea00b2a45ac1ba/#paper-report) · [阅读全文翻译](/papers/translations/2604-23310/)

**推荐日期：** 2026-07-21 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 3. RadTwin: Generalizable Wireless Digital Twin for Dynamic Environments

- **作者**：Yuru Zhang, Ming Zhao, Qiang Liu, Ahmed Alkhateeb, Abhishek K. Agrawal, Qi Qu
- **年份/venue**：2026，IEEE ICCCN 2026（arXiv 页面和作者主页均标注已接收）
- **方向**：wireless digital twin；dynamic environment；point cloud；physics-informed sparse attention；cross-scene generalization
- **问题**：NeRF 类无线场每个场景都要重训，难以同步家具移动等动态环境；纯坐标 MLP 又缺少显式几何和传播支撑。
- **方法**：点云 scenario encoder 提取显式几何特征；电磁射线模块产生仅包含物理相关体素的 sparse attention mask；Transformer decoder 通过 masked cross-attention 预测空间谱。几何表征与传播学习解耦，新场景无需重训。
- **关键结果**：在 30 个 Sionna RT 室内家具布局上，未见场景的 SSIM 为 0.846（NeRF2 0.643），LPIPS 为 0.023（NeRF2 0.286）；新场景适配时间为 0 s，单样本推理约 0.61 ms，NeRF2 则需约 7.8 min/场景重训且推理约 8.5 ms。
- **局限**：数据仍是 Sionna 仿真；场景为室内家具变化，尚无跨城市、真实材料误差、动态人体/车辆时序验证；输出是 spatial spectrum，不等同于完整宽带 MIMO CSI 后验。
- **迁移类型**：**可改造工具/结构模块**。用已有 BS/scatterer/blocker 粗布局构造 ray-support mask，只让条件 token 关注可解释的候选路径体素；不假设 Sheet2 同时存在完整坐标和 AoA/AoD 监督。
- **与既有阅读差异**：相对 F4-CKM/BDFlow-3DRM，它的重点不是静态场景拟合，而是几何显式条件化和新布局零重训；相对 GeoGS-CE，它直接学习空间谱场，而不是先形成 delay-beam PSD 再接 LMMSE。
- **课题位置**：**缺口**——补齐 dynamic environment、physics mask 和跨布局泛化接口。
- **一手来源**：[arXiv:2604.23310](https://arxiv.org/abs/2604.23310)；[PDF](https://arxiv.org/pdf/2604.23310)；[作者主页录用信息](https://liuqiang12040913.github.io/)
- **代码状态**：**未发现公开代码**。论文页、作者主页以及题名/arXiv ID/GitHub 精确检索均未发现可用仓库。
- **推荐理由**：它与当前“条件不是简单拼接，而是通过物理结构控制 attention”最契合；可作为独立的 environment-prior 分支，不与 MoE 或 Site-cFM 同时堆叠。

## 原推荐表字段

**日期：** 2026-07-21

**标题：** RadTwin: Generalizable Wireless Digital Twin for Dynamic Environments

**内容：** 作者：Yuru Zhang、Ming Zhao、Qiang Liu、Ahmed Alkhateeb、Abhishek K. Agrawal、Qi Qu。点云 encoder 提取场景几何，电磁射线模块生成 physics-informed sparse attention mask，Transformer decoder 通过 masked cross-attention 预测空间谱。30 个 Sionna 室内布局中，未见场景 SSIM 0.846（NeRF2 0.643）、LPIPS 0.023（0.286），新场景适配 0 s、推理约 0.61 ms。局限：仍为室内仿真，输出不是完整宽带 MIMO CSI 后验。

**契合方向：** 无线数字孪生；动态环境；point cloud；physics mask；cross-attention；跨布局泛化

**推荐理由：** 可用当前实际存在的 BS/scatterer/blocker 粗布局构造 ray-support mask，使条件 token 只关注物理相关路径；对缺失坐标或 AoA/AoD 保持 unavailable mask，不假设 Sheet2 具有全模态监督。

**顶刊顶会/机构依据：** IEEE ICCCN 2026；arXiv 页面及作者主页均标注已接收。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2604.23310

**检索来源：** arXiv:2604.23310；官方页：https://arxiv.org/abs/2604.23310；作者主页：https://liuqiang12040913.github.io/

**筛选备注：** 硬去重无命中。相对 F4-CKM/BDFlow-3DRM，它强调显式几何条件和新布局零重训；相对 GeoGS-CE，它直接预测空间谱，而非先生成 delay-beam PSD 再接 LMMSE。

**是否略读：** ☑

**是否精读：** ☐

**备注：** —

**代码链接：** 未发现公开代码

**代码/数据状态：** 未发现公开代码：已检查论文页、作者主页，并以题名、作者和 arXiv ID 精确检索 GitHub，未发现可用仓库。

**反馈匹配：** 极高匹配：环境几何、物理稀疏注意力、动态场景和跨布局泛化。

**反馈权重说明：** 中长期核心借鉴：适合作为环境先验融合主线的结构来源；短期先做 coarse-layout physics mask，不声称复现完整 RadTwin 或真实跨城市泛化。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2604.23310)

[来源 2](https://arxiv.org/abs/2604.23310)

[来源 3](https://liuqiang12040913.github.io/)
{% endraw %}
