---
layout: page
title: "Radio Map Updating from Streaming Spectrum Measurements via Memory-Based Online Gaussian Processes"
permalink: /papers/items/ad7c6f680aefcbc8/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=ad7c6f680aefcbc8)

[本篇日报说明](/papers/items/ad7c6f680aefcbc8/#paper-report) · [阅读全文翻译（学习页；未登记）](/papers/translations/2026-10-12-radio-map-online-gp-full-zh/)

**推荐日期：** 2026-07-22 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 2. Radio Map Updating from Streaming Spectrum Measurements via Memory-Based Online Gaussian Processes

- **作者 / 年份 / venue**：Yuanyuan Deng, Bo Zhou, Tian Chen, Shijian Gao, Jia Yan, Lantu Guo, Qiuming Zhu, Qihui Wu；2026；arXiv 预印本。
- **方向与问题**：streaming radio map、online sparse variational GP、catastrophic forgetting、uncertainty quantification。批处理地图每次需重算全部历史测量，难以在线更新。
- **方法**：M-OSVGP 用新 batch 与历史 memory subset 构造 hybrid objective；GOIPS 根据空间测量密度和相关性动态调整 inducing points 的数量与位置。
- **关键结果与局限**：在 campus/urban 仿真、30 次独立运行中，M-OSVGP 相对 SVGP/SSVGP/Memory-DGP 的 RMSE 最高下降 4.9%/4.3%/25.6%（campus），运行时间最高下降 71.3%/36.1%/68.3%；GOIPS 再带来最高 1.8% RMSE 改善。局限是主要验证 RSS 地图与合成 streaming batches，尚非宽带 MIMO/角延迟 CKM，也未展示真实长期漂移。
- **迁移类型**：**可改造工具**。可把 memory subset 与 adaptive inducing points 用作动态 CKM 的轻量 online head 或教师基线，并输出 posterior variance 作为 PnP 权重/条件置信度。
- **与既有阅读差异**：相对 TGPP/Anchor-CKM 的一次性稀疏重建，本篇关注持续到达数据、遗忘和在线不确定性；相对动态 CKM 概念文，它提供可实现的更新器。
- **相对阅读笔记的位置**：**缺口填补**。补齐当前研究中“地图建成后如何低成本持续更新”的工程环节。
- **一手来源**：[arXiv:2607.17954](https://arxiv.org/abs/2607.17954)；[PDF](https://arxiv.org/pdf/2607.17954)。DOI：待核验。
- **代码状态**：**未发现公开代码**。论文页、全文以及题名/arXiv ID 精确检索均未发现作者仓库。
- **推荐理由**：它能直接形成 dynamic-CKM online update 基线，并把 uncertainty、memory size、update latency 引入现有只看 NMSE 的评估体系。

## 原推荐表字段

**日期：** 2026-07-22

**标题：** Radio Map Updating from Streaming Spectrum Measurements via Memory-Based Online Gaussian Processes

**内容：** 作者：Yuanyuan Deng、Bo Zhou、Tian Chen、Shijian Gao、Jia Yan、Lantu Guo、Qiuming Zhu、Qihui Wu。M-OSVGP 用新 batch 与历史 memory subset 的 hybrid objective 抑制遗忘，GOIPS 按测量密度与空间相关性动态调整 inducing points。campus 场景相对 SVGP/SSVGP/Memory-DGP 的 RMSE 最高下降 4.9%/4.3%/25.6%，运行时间最高下降 71.3%/36.1%/68.3%；GOIPS 再带来最高 1.8% RMSE 改善。局限：RSS 仿真与合成 streaming batches，尚非宽带 MIMO CKM。

**契合方向：** 在线 radio map；streaming measurements；sparse variational GP；不确定性；抗遗忘

**推荐理由：** 可作为 dynamic CKM 的轻量在线更新器/教师基线，并用 posterior variance 表示条件置信度或调节 PnP 权重；需另测长期漂移和角延迟/CSI 表征。

**顶刊顶会/机构依据：** arXiv 2026 预印本；南京航空航天大学、南京理工大学等团队。正式录用与 DOI 待核验。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2607.17954

**检索来源：** arXiv:2607.17954；官方页：https://arxiv.org/abs/2607.17954；官方 PDF：https://arxiv.org/pdf/2607.17954

**筛选备注：** 硬去重无命中。相对 TGPP/Anchor-CKM 的一次性稀疏重建，本篇新增持续更新、catastrophic forgetting、inducing-point adaptation 与 uncertainty calibration。

**是否略读：** ☑

**是否精读：** ☐

**备注：** —

**代码链接：** 未发现公开代码

**代码/数据状态：** 未发现公开代码：论文页、全文及题名/arXiv ID 精确检索均未发现作者仓库。

**反馈匹配：** 高匹配：在线 CKM、稀疏测量、置信度和更新复杂度。

**反馈权重说明：** 缺口填补：补齐地图建成后的持续更新环节，可作为 dynamic-CKM online baseline。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2607.17954)

[来源 2](https://arxiv.org/abs/2607.17954)
{% endraw %}
