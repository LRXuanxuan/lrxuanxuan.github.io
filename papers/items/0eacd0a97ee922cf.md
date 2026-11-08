---
layout: page
title: "RadioGen3D: 3D Radio Map Generation via Adversarial Learning on Large-Scale Synthetic Data"
permalink: /papers/items/0eacd0a97ee922cf/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=0eacd0a97ee922cf)

[本篇日报说明](/papers/items/0eacd0a97ee922cf/#paper-report) · [全文翻译（待补齐）](/papers/items/0eacd0a97ee922cf/#paper-translation)

**推荐日期：** 2026-11-09 · **发表状态：** 预印本/状态未确认

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

<span id="paper-report"></span>

## 本篇推荐与证据

## 4. RadioGen3D: 3D Radio Map Generation via Adversarial Learning on Large-Scale Synthetic Data

**作者/年份/venue**：Junshen Chen; Angzi Xu; Zezhong Zhang; Shiyao Zhang; Junting Chen; Shuguang Cui；2026；arXiv预印本；未确认正式venue。

**发表状态及证据**：预印本/状态未确认。官方arXiv记录与所读PDF未提供可确认录用的公开声明。

**方向**：3D 无线地图、极化、仿真数据

**问题**：在三维实测稀缺时，用合成数据恢复不同高度及极化条件的无线功率图。

**论文方法**：将二维射线/传播图与由有限测量校准的参数化三维衰落模型结合成 Radio3DMix，在其上训练条件 GAN 的三维 U-Net。

**论文结果**：表 III 在合成数据 1% 稀疏观测加发射机条件下给出 NMSE 0.0032。仅给发射机时 PSNR 22.54 dB，低于 RadioDiff-3D 的 24.00 dB。表 IV 的两个 20 高度方法用时 0.06 s 和 1.43 s。

**局限与审计判断**：跨数据实验含目标射线数据微调，无法据此推断未见城市零样本精度。目标是功率图，缺少复数 CSI 相位和条件后验校准。

**迁移类型**：可改造工具

**研究接口（迁移推断）**：把多高度和极化的功率统计用作 CKM 输入，保留导频恢复复数 CSI 的独立路径。

**与既有阅读差异**：相比 RadioDreamer 的地图辅助规划，本篇重点是三维地图训练数据构造与有限目标数据微调。

**推荐理由**：能把合成数据成本和目标域偏差作为独立因素衡量。

**待验证假设**：按城市划分且保持目标微调样本量一致时，多高度和极化条件可能主要改善弱覆盖区。

**代码状态**：作者预告/部分代码

**代码证据**：原文链接的作者仓库提供数据合成、拟合脚本及二维 RadioUNet 权重入口。未发现主 3D cGAN 的训练与推理流水线。静态核验。

**全文定位**：§III–IV，表 II–IV

[作者仓库](https://github.com/JunshenChenJason/Radio3DMix)

**身份与版本**：arXiv:2602.18744；DOI 10.48550/arXiv.2602.18744；Submission history From: Junshen Chen [ view email ] [v1] Sat, 21 Feb 2026 07:50:05 UTC (1,885 KB)；

[官方页面](https://arxiv.org/abs/2602.18744)；[官方PDF](https://arxiv.org/pdf/2602.18744)；[原文PDF](https://arxiv.org/pdf/2602.18744)。完整PDF可访问，共13页。

[本篇全文翻译/状态](https://lrxuanxuan.github.io/papers/items/0eacd0a97ee922cf/#paper-translation)：job `0c4ec2313ba6a3c57c225d08`已入队，gpt-6-luna/xhigh；原worker找不到会话，未启动。

[原文许可](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)：公开译文许可未确认，先保留本地。PDF只保留本地与官方链接。

## 原推荐表字段

**日期：** 2026-11-09

**标题：** RadioGen3D: 3D Radio Map Generation via Adversarial Learning on Large-Scale Synthetic Data

**内容：** 作者：Junshen Chen; Angzi Xu; Zezhong Zhang; Shiyao Zhang; Junting Chen; Shuguang Cui。问题：在三维实测稀缺时，用合成数据恢复不同高度及极化条件的无线功率图。 方法：将二维射线/传播图与由有限测量校准的参数化三维衰落模型结合成 Radio3DMix，在其上训练条件 GAN 的三维 U-Net。 结果：表 III 在合成数据 1% 稀疏观测加发射机条件下给出 NMSE 0.0032。仅给发射机时 PSNR 22.54 dB，低于 RadioDiff-3D 的 24.00 dB。表 IV 的两个 20 高度方法用时 0.06 s 和 1.43 s。 局限：跨数据实验含目标射线数据微调，无法据此推断未见城市零样本精度。目标是功率图，缺少复数 CSI 相位和条件后验校准。

**契合方向：** 3D 无线地图、极化、仿真数据

**推荐理由：** 能把合成数据成本和目标域偏差作为独立因素衡量。

**顶刊顶会/机构依据：** arXiv预印本；未确认正式venue；预印本/状态未确认；官方arXiv记录与所读PDF未提供可确认录用的公开声明。

**发表年份：** 2026

**论文下载链接：** https://arxiv.org/pdf/2602.18744

**检索来源：** https://arxiv.org/abs/2602.18744

**筛选备注：** 可改造工具；把多高度和极化的功率统计用作 CKM 输入，保留导频恢复复数 CSI 的独立路径。；§III–IV，表 II–IV

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/JunshenChenJason/Radio3DMix

**代码/数据状态：** 作者预告/部分代码；原文链接的作者仓库提供数据合成、拟合脚本及二维 RadioUNet 权重入口。未发现主 3D cGAN 的训练与推理流水线。静态核验。

**反馈匹配：** 相比 RadioDreamer 的地图辅助规划，本篇重点是三维地图训练数据构造与有限目标数据微调。

**反馈权重说明：** 独立机制；事实/迁移推断/待验证假设分开；同预算配对，不预设提升。

## 原文与代码入口

[来源 1](https://arxiv.org/pdf/2602.18744)

[来源 2](https://arxiv.org/abs/2602.18744)

[来源 3](https://github.com/JunshenChenJason/Radio3DMix)

[来源 4](https://lrxuanxuan.github.io/papers/items/0eacd0a97ee922cf/#paper-translation)：job)

[来源 5](https://arxiv.org/licenses/nonexclusive-distrib/1.0/)：公开译文许可未确认)
{% endraw %}
