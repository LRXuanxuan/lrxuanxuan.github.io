---
layout: page
title: "Generalizable Radio-Frequency Radiance Fields for Spatial Spectrum Synthesis"
permalink: /papers/items/6cecae8cc71b3be3/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/?paper=6cecae8cc71b3be3)

[本篇日报说明](/papers/items/6cecae8cc71b3be3/#paper-report)

**推荐日期：** 2026-10-04 · **发表状态：** 历史记录未明确

<span id="paper-report"></span>

## 本篇推荐与证据

- 第275行：Generalizable Radio-Frequency Radiance Fields for Spatial Spectrum Synthesis

## 原推荐表字段

**日期：** 2026-10-04

**标题：** Generalizable Radio-Frequency Radiance Fields for Spatial Spectrum Synthesis

**内容：** 用户10月4日日推资料补录；本次保留PDF原文信息，未重新生成论文评述。
作者/首页信息原文：
Generalizable Radio-Frequency Radiance Fields for Spatial Spectrum Synthesis
Kang Yang Yuning Chen Wan Du
University of California, Merced
{kyang73, ychen372, wdu3}@ucmerced.edu
TrainingsceneTestingscene
Groundtruth spatial spectra for three transmitter locations
Synthesis of spectrum via GRaF
Transmitter (TX)Receiver (RX)
TX1TX2TX3
TX1TX2TX3
RX
Figure 1. In the training scene, Radio-Frequency (RF) signals from each transmitter are measured across all surrounding directions by the
receiver to form a spatial spectrum. Trained on this scene,GRaFsynthesizes spectra for arbitrary transmitter locations in unseen scenes.

摘要原文摘录：
We present GRaF, Generalizable Radio-Frequency (RF) Radiance Fields, a framework that models RF signal propa- gation to synthesize spatial spectra at arbitrary transmitter or receiver locations, where each spectrum measures sig- nal power across all surrounding directions at the receiver. Unlike state-of-the-art methods that adapt vanilla Neural Radiance Fields (NeRF) to the RF domain with scene- specific training, GRaF generalizes across scenes to synthe- size spectra. To enable this, we prove an interpolation the- ory in the RF domain: the spatial spectrum from a transmit- ter can be approximated using spectra from geographically proximate transmitters. Building on this theory, GRaF com- prises two components: (i) a geometry-aware Transformer encoder that captures spatial correlations from neighbor- ing transmitters to learn a scene-independent latent RF ra- diance field, and (ii) a neural ray tracing algorithm that estimates spectrum reception at the receiver. Experimental results demonstrate that GRaF outperforms existing meth- ods on single-scene benchmarks and achieves state-of-the- art performance on unseen scene layouts.

**契合方向：** 无线信道/CKM/射频建模

**推荐理由：** 用户已有日推PDF补录，纳入同一阅读记录表；不计作10月8日新增推荐。

**顶刊顶会/机构依据：** CVPR 2026（文件名标注，补录未在线复核）

**发表年份：** 2026

**论文下载链接：** 本地资料：Yang_Generalizable_Radio-Frequency_Radiance_Fields_for_Spatial_Spectrum_Synthesis_CVPR_2026_paper.pdf

**检索来源：** 本地资料：Yang_Generalizable_Radio-Frequency_Radiance_Fields_for_Spatial_Spectrum_Synthesis_CVPR_2026_paper.pdf
https://openaccess.thecvf.com/content/CVPR2026/html/Yang_Generalizable_Radio-Frequency_Radiance_Fields_for_Spatial_Spectrum_Synthesis_CVPR_2026_paper.html

**筛选备注：** 补录来源：104日推；论文身份去重通过。仅解析PDF首页/摘要，未完成全文方法、实验、发表状态或代码的重新审计。

**是否略读：** ☐

**是否精读：** ☐

**备注：** —

**代码链接：** —

**代码/数据状态：** 待核验（资料补录，未进行线上代码审计）

**反馈匹配：** 用户指定资料补录；未假设已略读、已精读或已复现。

**反馈权重说明：** 保留原日推日期，追加到末尾；不重排历史行。

## 原文与代码入口

[来源 1](https://openaccess.thecvf.com/content/CVPR2026/html/Yang_Generalizable_Radio-Frequency_Radiance_Fields_for_Spatial_Spectrum_Synthesis_CVPR_2026_paper.html)
{% endraw %}
