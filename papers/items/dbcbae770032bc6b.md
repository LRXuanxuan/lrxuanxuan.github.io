---
layout: page
title: "UrbanMIMOMap: A Ray-Traced MIMO CSI Dataset with Precoding-Aware Maps and Benchmarks"
permalink: /papers/items/dbcbae770032bc6b/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=dbcbae770032bc6b)

[本篇日报说明](/papers/items/dbcbae770032bc6b/#paper-report) · [阅读已有译稿（非全文）](/papers/translations/2026-07-15-1663571a/#paper-dbcbae770032bc6b)

**推荐日期：** 2026-07-15 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

本篇现有译稿为阶段性/历史版本（未计入全文验收）；完整全文翻译尚未完成，完成后页首入口将直达全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 4. UrbanMIMOMap: A Ray-Traced MIMO CSI Dataset with Precoding-Aware Maps and Benchmarks

- **作者**：Honggang Jia, Xiucheng Wang, Nan Cheng, Ruijin Sun, Changle Li
- **年份/来源**：IEEE GLOBECOM 2025；arXiv:2509.06270
- **研究位置**：CKM/WCM 数据、射线追踪、复数 MIMO CSI、precoding-aware map
- **核心问题**：公开 radio-map 数据多为 SISO 路损/RSS，不能支撑阵列相关性、beamforming、capacity 或生成式 MIMO 信道先验。
- **方法与数据**：用真实地理场景、WinProp Dominant Path Model（DPM）和阵列响应生成 4×4 复数信道矩阵 \(H\)。官方仓库说明数据含 350 个场景、每场景 120 个收发配置，并提供 C++ 数据生成、Python/RadioUNet 基线、样例和完整数据下载入口。
- **关键结果与局限**：论文给出基于环境图、发射机位置和方位编码的 RadioUNet 基线，证明数据可用于预编码感知地图生成。局限是默认 4×4、DPM 对多径作简化；完整数据主要通过外链分发，路径级 DoA/DoD 标签的公开完备性仍需单独核验，不能直接假定它补齐所有角度监督。
- **迁移到课题的接口**：将复数 \(H\) 映射为角域/波束特征并合成 \(Y=HP+N\)，形成 CKM 条件 CM/Flow 的外部测试集；可与现有 64×16 CKM-SRF 生成器做“同模型、不同数据源”泛化实验。
- **与既有阅读的关系**：相对 CKMImageNet、RadioDiff 和 OpenPathNet，新增的是完整复数 MIMO 矩阵、阵列/预编码感知指标和可运行的城市数据生成链，不是另一套标量路损图。
- **可迁移性**：**可直接改造成数据/仿真工具与外部基准**。
- **代码状态**：完整官方代码与数据入口；GitHub 含核心 C++/Python 实现和样例，完整代码及 350-map 数据由 OneDrive/百度网盘提供。
- **核验链接**：[arXiv](https://arxiv.org/abs/2509.06270)；[PDF](https://arxiv.org/pdf/2509.06270)；[代码与数据](https://github.com/UNIC-Lab/UrbanMIMOMap)

## 原推荐表字段

**日期：** 2026-07-15

**标题：** UrbanMIMOMap: A Ray-Traced MIMO CSI Dataset with Precoding-Aware Maps and Benchmarks

**内容：** 基于真实地理场景、WinProp Dominant Path Model 和阵列响应生成密集 4×4 复数 MIMO 信道矩阵，公开 350 个场景、每场景 120 个收发配置，并从 H 派生 RSS/预编码感知地图与 RadioUNet 基线。优势是从 SISO 路损图升级为可计算 beamforming/capacity 的完整 CSI；局限是主配置为 4×4、DPM 简化多径，完整数据需外链下载，路径级 DoA/DoD 标签的发布完备性仍需单独核验。

**契合方向：** CKM/WCM 数据；ray tracing；复数 MIMO CSI；precoding-aware map；Sim2Real 数据工具链

**推荐理由：** 可直接作为 CKM-SRF 数据接口的外部基准：从 H 构造 Y=HP+N、角域/波束特征和位置条件，验证 CM/Flow 在真实城市几何下的泛化；同时缓解当前城市库只有坐标或只有 AoA/AoD、没有共同完整监督的问题，但不能假定其已提供全部路径标签。

**顶刊顶会/机构依据：** Honggang Jia, Xiucheng Wang, Nan Cheng, Ruijin Sun, Changle Li；西安电子科技大学；已录用 IEEE GLOBECOM 2025；官方代码与数据仓库

**发表年份：** 2025

**论文下载链接：** https://arxiv.org/pdf/2509.06270

**检索来源：** IEEE GLOBECOM 2025 / arXiv:2509.06270；正式会议 DOI 尚未在官方仓库给出

**筛选备注：** 硬去重无命中；填补 CKMImage/RadioDiff 以标量路损图为主的缺口。独立维度是完整复数 MIMO H、阵列/预编码感知地图与可运行数据生成链。

**是否略读：** ☑

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/UNIC-Lab/UrbanMIMOMap

**代码/数据状态：** 完整官方代码与数据入口：GitHub 含 C++ 射线追踪生成、Python/RadioUNet 基线和样例；完整代码/350-map 数据由 OneDrive/百度网盘提供

**反馈匹配：** 高度匹配：MIMO CSI、射线追踪、CKM/WCM 数据与可复现工具链

**反馈权重说明：** 今日第二优先精读；可直接改造成数据/仿真工具和外部基准，不是端到端 CM 求解器

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2509.06270)

[来源 2](https://github.com/UNIC-Lab/UrbanMIMOMap)

[来源 3](https://arxiv.org/abs/2509.06270)
{% endraw %}
