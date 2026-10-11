---
layout: page
title: "Consistency Posterior Sampling for Diverse Image Synthesis"
permalink: /papers/items/6c9be78fade3f7c5/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=6c9be78fade3f7c5)

[本篇日报说明](/papers/items/6c9be78fade3f7c5/#paper-report) · [全文翻译（待补齐）](/papers/items/6c9be78fade3f7c5/#paper-translation) · [摘要与引言 / 历史译文说明](/papers/translations/2026-07-15-1663571a/#paper-6c9be78fade3f7c5)

**推荐日期：** 2026-07-15 · **发表状态：** 历史记录未明确

<span id="paper-translation"></span>

## 本篇全文翻译

本篇已列入全文翻译清单，尚未完成。完成并允许公开后，此入口将直达本篇全文译稿。

已有部分译文（不计全文完成）：[历史译文](/papers/translations/2026-07-15-1663571a/#paper-6c9be78fade3f7c5)

<span id="paper-report"></span>

## 本篇推荐与证据

## 2. Consistency Posterior Sampling for Diverse Image Synthesis

- **作者**：Vishal Purohit, Matthew Repasky, Jianfeng Lu, Qiang Qiu, Yao Xie, Xiuyuan Cheng
- **年份/来源**：CVPR 2025, pp. 28327–28336；DOI: 10.1109/CVPR52734.2025.02638；arXiv:2410.02078 的正式会议版本
- **研究位置**：CM/蒸馏流生成先验、Langevin 后验采样、逆问题不确定性
- **核心问题**：多数生成式逆问题方法输出单个重建；若要获得多样后验样本，通常必须反复重启整条扩散链，开销大。
- **方法**：把 1–2 步 CM 或蒸馏流视为确定性噪声到数据映射 \(\Phi:z\mapsto x\)，在源噪声空间执行 Langevin 动力学：

  \[
  z_{k+1}=z_k-\tau\left(z_k+\nabla_z\mathcal L_y(\Phi(z_k))\right)+\sqrt{2\tau}\,\xi_k.
  \]

  先对测量损失 warm start，再连续产生后验样本，不必为每个样本重新运行完整生成链。
- **关键结果与局限**：在线性和非线性图像逆问题上，其重建质量与扩散基线相当，并提高后验样本多样性；实验显示较少 Langevin 步数即可稳定。主要开销是反向传播穿过 \(\Phi\) 及 warm start，且原文没有复数信道、导频或真实通信验证。
- **迁移到课题的接口**：设置

  \[
  \mathcal L_Y(H)=\frac{\|Y-\mathcal A(H)\|_F^2}{2\sigma_n^2},
  \]

  让条件 CM/Flow 建模 \(\Phi(z;r,e,M)\)，从而生成 \(p(H\mid Y,r,e,M)\) 的样本集合。除 NMSE 外，可评估 posterior coverage、beam-selection entropy、outage calibration 和 achievable-rate 分布。
- **与既有阅读的关系**：填补 PnP-CM、DPS/FlowDPS、Bayesian Flow Matching 之间的“多样后验与不确定性”缺口。它不是点估计式 PnP，而是在源空间保持生成先验并探索后验。
- **可迁移性**：**求解器可直接复现，信道算子需改造**。
- **代码状态**：完整作者官方 PyTorch 实现，含线性/非线性算子、1/多步 CM、fidelity/diversity 脚本与预训练模型说明。
- **核验链接**：[CVPR 页面](https://openaccess.thecvf.com/content/CVPR2025/html/Purohit_Consistency_Posterior_Sampling_for_Diverse_Image_Synthesis_CVPR_2025_paper.html)；[官方 PDF](https://openaccess.thecvf.com/content/CVPR2025/papers/Purohit_Consistency_Posterior_Sampling_for_Diverse_Image_Synthesis_CVPR_2025_paper.pdf)；[代码](https://github.com/Vishal-S-P/CPS_Diverse)；[arXiv 初版](https://arxiv.org/abs/2410.02078)

## 原推荐表字段

**日期：** 2026-07-15

**标题：** Consistency Posterior Sampling for Diverse Image Synthesis

**内容：** 以 1–2 步 CM/蒸馏流作为确定性噪声到数据映射 Φ，在源噪声空间对测量损失运行 Langevin 动力学；一次 warm start 后可连续生成后验样本，无需每次重启整条生成链。论文给出后验近似保证，并在线性/非线性逆问题上兼顾重建质量与样本多样性；局限是需反传穿过 Φ 且有 warm-start 开销，实验仍为图像域。

**契合方向：** Consistency Model；后验采样；Langevin dynamics；逆问题；不确定性量化；数据一致性

**推荐理由：** 令 Ly(H)=||Y-A(H)||²/(2σ²)，在条件 CM/Flow 的源变量 z 上采样，可从“单个信道点估计”扩展为 p(H|Y,r,e,M) 后验集合，用于置信区间、波束失配和 outage 风险；官方代码可直接替换前向算子后复现。

**顶刊顶会/机构依据：** Vishal Purohit, Matthew Repasky, Jianfeng Lu, Qiang Qiu, Yao Xie, Xiuyuan Cheng；CVPR 2025；DOI 10.1109/CVPR52734.2025.02638；arXiv 初版题名为 Posterior sampling via Langevin dynamics based on generative priors

**发表年份：** 2025

**论文下载链接：** https://openaccess.thecvf.com/content/CVPR2025/papers/Purohit_Consistency_Posterior_Sampling_for_Diverse_Image_Synthesis_CVPR_2025_paper.pdf

**检索来源：** CVPR 2025；DOI 10.1109/CVPR52734.2025.02638；arXiv:2410.02078

**筛选备注：** 硬去重无命中；填补现有 PnP-CM/Flow 后验主线中“多样后验样本与不确定性”缺口。不同于点估计式 PnP，它在源空间保持生成先验并连续探索后验。

**是否略读：** ☑

**是否精读：** ☐

**备注：** —

**代码链接：** https://github.com/Vishal-S-P/CPS_Diverse

**代码/数据状态：** 完整作者官方实现：含线性/非线性算子、1/多步 CM、fidelity/diversity 脚本与预训练模型说明

**反馈匹配：** 高度匹配：CM/Flow 后验采样、通用前向模型、低 NFE 与不确定性

**反馈权重说明：** 专题优先；可直接复现求解器，再改造为复数 MIMO 导频算子

## 原文与代码入口

[来源 1](https://openaccess.thecvf.com/content/CVPR2025/papers/Purohit_Consistency_Posterior_Sampling_for_Diverse_Image_Synthesis_CVPR_2025_paper.pdf)

[来源 2](https://github.com/Vishal-S-P/CPS_Diverse)

[来源 3](https://openaccess.thecvf.com/content/CVPR2025/html/Purohit_Consistency_Posterior_Sampling_for_Diverse_Image_Synthesis_CVPR_2025_paper.html)

[来源 4](https://arxiv.org/abs/2410.02078)
{% endraw %}
