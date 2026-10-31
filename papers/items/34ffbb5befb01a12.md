---
layout: page
title: "Consecutive Posterior Fusion for Diffusive Recovery of Unobservable Image Structures"
permalink: /papers/items/34ffbb5befb01a12/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=34ffbb5befb01a12)

[本篇日报说明](/papers/items/34ffbb5befb01a12/#paper-report) · [阅读全文翻译](/papers/translations/2026-10-31-2610-03261-consecutive-posterior-fusion-for-diffusive-recovery-of-unobservable-im/)

**推荐日期：** 2026-10-31 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

全文中文译稿已发布，请使用页首的「阅读全文翻译」入口。

<span id="paper-report"></span>

## 本篇推荐与证据

## 1. Consecutive Posterior Fusion for Diffusive Recovery of Unobservable Image Structures

**作者/年份/venue**：Elena Morotti; Davide Evangelista; Elena Loli Piccolomini；2026；arXiv cs.CV。

**发表状态**：预印本/状态未确认。arXiv v1，2026-10-02；未发现出版社或作者明确录用证据。

**方向**：PnP逆问题；零空间；固定NFE

**问题**：秩亏观测下，逐步去噪只使用当前校正，未利用相邻步零空间估计的误差关联。

**论文方法**：融合连续两次measurement-aware估计；在DDNM范围/零空间分解中保持测量确定分量，仅融合零空间；局部二次误差分析给出最优系数，实际采用任务相关时间调度。

**结果及证据边界**：Table 1，30-view CT的PSNR从DDNM 31.06提高至32.40 dB；60-view从33.89至37.27 dB。5次初始化；不增加denoiser evaluations。

**局限与审计判断**：理论最优系数依赖未知误差二阶量，推理不可直接计算；外推有效有相关性条件，实际调度不能当自适应最优。Mayo测试仅1名患者326张图；无复MIMO实验或完整后验校准。

**迁移类型**：可改造工具

**研究接口（迁移推断）**：期刊扩展独立求解器分支；将复导频算子换入投影框架，噪声时保留软一致性，不把CT硬投影直接当精确Bayes后验。

**与既有阅读差异**：相对已有FlowADMM/dual反馈，新增相邻零空间估计融合；不重新建议已完成四格与M扫描。

**推荐理由**：直接对应当前不可观测子空间收益的机制解释，可在冻结先验条件下研究相邻校正是否提供额外信息。

**代码状态**：作者预告/部分代码

**代码证据**：PDF Sec4明确写source code/config/checkpoint/partitions将于录用后开放（code-released-upon-acceptance）；精确标题及2610.03261检索未发现作者实现。

**全文定位**：Sec 3，Propositions 1–2，Eq 25–31；Sec 4.1及Table 1。

**稳定身份**：2610.03261

**一手来源**：[来源1](https://arxiv.org/abs/2610.03261)

[官方PDF](https://arxiv.org/pdf/2610.03261)；[原文PDF](https://arxiv.org/pdf/2610.03261)；21页。
代码作者预告录用后开放；当前未完成作者代码复现。

**代码入口**：未发现公开代码；精确标题/编号检索及官方全文为本次证据。

本篇全文翻译/真实状态：job `acf5dbd9b9240b0c1e8ac23b`已入队，固定gpt-6-luna/xhigh。原worker发送返回找不到会话，未启动/未完成。

[原文许可](https://creativecommons.org/publicdomain/zero/1.0/)：许可允许完成并保留署名/改动说明后的译文共享。PDF仅本地/官方链接，不上传PDF/XLSX。

## 原推荐表字段

**日期：** 2026-10-31

**标题：** Consecutive Posterior Fusion for Diffusive Recovery of Unobservable Image Structures

**内容：** 作者：Elena Morotti; Davide Evangelista; Elena Loli Piccolomini。问题：秩亏观测下，逐步去噪只使用当前校正，未利用相邻步零空间估计的误差关联。 方法：融合连续两次measurement-aware估计；在DDNM范围/零空间分解中保持测量确定分量，仅融合零空间；局部二次误差分析给出最优系数，实际采用任务相关时间调度。 结果：Table 1，30-view CT的PSNR从DDNM 31.06提高至32.40 dB；60-view从33.89至37.27 dB。5次初始化；不增加denoiser evaluations。 局限：理论最优系数依赖未知误差二阶量，推理不可直接计算；外推有效有相关性条件，实际调度不能当自适应最优。Mayo测试仅1名患者326张图；无复MIMO实验或完整后验校准。

**契合方向：** PnP逆问题；零空间；固定NFE

**推荐理由：** 直接对应当前不可观测子空间收益的机制解释，可在冻结先验条件下研究相邻校正是否提供额外信息。

**顶刊顶会/机构依据：** arXiv cs.CV；预印本/状态未确认；arXiv v1，2026-10-02；未发现出版社或作者明确录用证据。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2610.03261

**检索来源：** https://arxiv.org/abs/2610.03261

**筛选备注：** 可改造工具；期刊扩展独立求解器分支；将复导频算子换入投影框架，噪声时保留软一致性，不把CT硬投影直接当精确Bayes后验。；Sec 3，Propositions 1–2，Eq 25–31；Sec 4.1及Table 1。

**是否略读：** ☐

**是否精读：** ☐

**备注：** 代码作者预告录用后开放；当前未完成作者代码复现。

**代码链接：** —

**代码/数据状态：** 作者预告/部分代码；PDF Sec4明确写source code/config/checkpoint/partitions将于录用后开放（code-released-upon-acceptance）；精确标题及2610.03261检索未发现作者实现。

**反馈匹配：** 相对已有FlowADMM/dual反馈，新增相邻零空间估计融合；不重新建议已完成四格与M扫描。

**反馈权重说明：** 机制互补；区分论文事实、迁移推断、待验证假设；不将功率图指标冒充复MIMO后验收益。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2610.03261)

[来源 2](https://arxiv.org/abs/2610.03261)

来源 3：见页首翻译状态：job)

[来源 4](https://creativecommons.org/publicdomain/zero/1.0/)：许可允许完成并保留署名/改动说明后的译文共享)
{% endraw %}
