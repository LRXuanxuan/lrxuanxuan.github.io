---
layout: page
title: "Low-Latency Generative Semantic Communication via Channel-Realization Flow Matching"
permalink: /papers/items/7e60d1f6e3cbae1c/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=7e60d1f6e3cbae1c)

[本篇日报说明](/papers/items/7e60d1f6e3cbae1c/#paper-report) · [阅读全文翻译（学习页；未登记）](/papers/translations/2026-07-29-2607-24876/)

**推荐日期：** 2026-07-29 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 4. Low-Latency Generative Semantic Communication via Channel-Realization Flow Matching

- **作者**：Fan Gao, Youzheng Wang, Zhijin Qin, Feifei Gao
- **年份/venue**：IEEE GLOBECOM 2026（arXiv 元数据标注已接收）
- **方向**：conditional Flow Matching、信道 realization coupling、低 NFE
- **问题**：独立端点耦合忽略真实 source–channel link，会造成条件 flow 的 train–test mismatch 和弯曲轨迹。
- **方法**：RC-BFM 从信道诱导的粗语义状态出发；RC-OT 仅在匹配的源图像/信道 realization 上构造 entropic coupling；两阶段训练后用 Euler 少步积分。
- **关键结果**：
  - FFHQ-64×64、10 dB AWGN、4 NFE：PSNR 31.58 dB、LPIPS 0.086、FID 22.3、156.4 ms/A800。
  - 同表中 200-NFE DiffCom 为 7,964 ms；RC-BFM 约快 50×，且 FID 更好。
  - NFE 从 1 增至 4 时 PSNR 上升，之后主要改善 LPIPS/FID，明确呈现复杂度—感知权衡。
- **局限**：图像语义通信、像素空间、AWGN/Rayleigh 仿真；并非 MIMO 信道估计，不能把 PSNR/FID 直接映射为 CSI NMSE。
- **迁移类型**：**理论启发 / 基线**。
- **课题接口**：用共同场景/信道 realization 约束 \(z\leftrightarrow H\) 或 observation-to-posterior pairing，比较独立耦合、CAR source shift 与 realization-coupled OT 的路径长度和 NFE–NMSE 曲线。
- **与既有阅读差异**：相对 CAR-Flow 的 source reparameterization、Site-cFM 的直线路径，本篇改变的是**训练配对/coupling**。
- **来源**：[arXiv](https://arxiv.org/abs/2607.24876)｜[PDF](https://arxiv.org/pdf/2607.24876)
- **代码状态**：**未发现公开代码**；全文无仓库，题名、RC-BFM 和 arXiv ID 精确检索未找到作者实现。
- **相对阅读笔记位置**：**理论深化**（条件路径设计与低 NFE）。

## 原推荐表字段

**日期：** 2026-07-29

**标题：** Low-Latency Generative Semantic Communication via Channel-Realization Flow Matching

**内容：** 作者：Fan Gao、Youzheng Wang、Zhijin Qin、Feifei Gao。RC-BFM 从信道诱导的粗语义状态而非各向同性噪声出发，并用 realization-coupled entropic optimal transport 保持源图像—信道 realization 配对，减少条件 flow 的 train-test mismatch 和轨迹曲率。A800 上 4 NFE 时 FFHQ FID 22.3、LPIPS 0.086、延迟 156.4 ms；相对 200-NFE DiffCom 延迟降低约 50×。局限：仅图像语义通信、像素空间、AWGN/Rayleigh 仿真；不是 MIMO CSI 估计。

**契合方向：** 条件 Flow Matching；信道 realization 耦合；低 NFE；物理路径设计

**推荐理由：** 可把共同信道/场景 realization 作为 source-target 配对约束，检验当前 cFM 的独立端点耦合是否导致弯曲路径；与 CAR-Flow 的条件 source shift 不同，属于配对层创新。迁移类型：理论启发/基线。

**顶刊顶会/机构依据：** 2026 IEEE GLOBECOM 已接收；Tsinghua University 团队。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2607.24876

**检索来源：** arXiv:2607.24876；官方页：https://arxiv.org/abs/2607.24876

**筛选备注：** 硬去重无命中。相对 CAR-Flow/Site-cFM，新增按物理信道 realization 构造 OT coupling 与 channel-induced initialization；不把语义图像结果外推为信道 NMSE。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** 未发现公开代码

**代码/数据状态：** 未发现公开代码：全文无仓库链接，题名、RC-BFM 与 arXiv ID 精确检索未发现可核验作者实现。

**反馈匹配：** 中高匹配：原则化连续条件、路径耦合、少 NFE 与物理 realization 保真。

**反馈权重说明：** 方法参考。作为独立 coupling 消融，不与 CAR-Flow/Site-cFM 同时改动后归因。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2607.24876)

[来源 2](https://arxiv.org/abs/2607.24876)

[来源 3](https://arxiv.org/abs/2607.24876)｜)
{% endraw %}
