---
layout: page
title: "SYNTHETIC 原文—译文自然段定位表（2026-10-29）"
permalink: /papers/alignments/2026-10-29-cheap-synthetic-pretraining-2610-19015/
---

# SYNTHETIC · 逐自然段原译定位表（初版）

**原文 PDF：** 25 页。**提取正文候选：** 111 个；其中判定为正文的候选 85 项，图表/元数据等候选 26 项。**译稿正文分块：** 68 项。**建立译段候选：** 85 项；初版 6 项未定位已复核为 2 项译段、4 项图表文字；其中仅凭顺序猜测 23 项。

[打开现有中文译稿](/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015/) · [返回完整核查记录](/papers/translation-qa-2026-10-29/)

**极重要：这是逐条定位底稿，不是已完成的译文验收。** 原文按 PDF 文字块及缩进提取，跨栏和跨页续段可能被拆为两项；一个原文段落可能对应多个中文段落，反之亦然。对照译段由章节顺序、相同数值、引用和技术术语自动建议；表中“候选”并不证明语义相符。没有找到或线索较弱的项目需要逐一人工核查。每个原文候选都保留原 PDF 页码、起始坐标、原文全文与中文候选段的段首；表格、公式、参考文献不计入自然段。带“非正文候选”的行用于保留提取痕迹，避免静默漏行。

## PDF 第 1 页 · 提取候选 6 项

### SYNTHETIC-P0001 · 页内坐标 x=121.8, y=181.1

**原文章节（自动识别）：** front matter。**目标译稿章节：** 摘要。**状态：** 非正文候选：作者/出版信息或表格。

**原文全文（PDF 文本层）：** Khoren Petrosyan Artashes Mkrtchyan Rafayel Mkrtchyan Hrant Khachatrian YerevaNN, Armenia Yerevan State University, Armenia

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0002 · 页内坐标 x=161.1, y=231.1

**原文章节（自动识别）：** front matter。**目标译稿章节：** 摘要。**状态：** 非正文候选：作者/出版信息或表格。

**原文全文（PDF 文本层）：** Theofanis P. Raptis Institute of Informatics and Telematics, National Research Council, Italy

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0003 · 页内坐标 x=143.1, y=308.5

**原文章节（自动识别）：** Abstract。**目标译稿章节：** 摘要。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Real measurements are too limited to train an accurate indoor pathloss predictor that works across a wide range of buildings. Large-scale synthetic pretraining offers a way forward, but real building layouts are also scarce, and accurate raytracing simulators are slow, expensive, and often proprietary. We address both problems by introducing a generator that automatically creates diverse indoor layouts and a fast, open-source approximate ray tracer that computes radio maps for them. Using this pipeline, we generate 128M synthetic samples, pretrain ResNet- 101 and Swin-T encoder-decoders, and fine-tune them on high-quality benchmark data. Despite simulator mismatch, our ResNet-101 model reduces error by 15% on average relative to the best known methods across five indoor radio-map prediction tasks and improves transfer on a small real-measurement dataset. Both architectures show predictable data-scaling trends: power laws fitted on 2M–16M samples predict the mean normalized downstream RMSE at 32M–128M with 3.33% mean absolute percentage error for ResNet-101 and 7.10% for Swin-T. These results show that pretraining on large amounts of cheap simulated data can improve indoor radio-map prediction, even when real measurements and high-quality simulations are limited.

**译稿位置：** [T004 · 第 24 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L24)；**译文候选段首：** 利用这一流水线，作者生成了 1.28 亿份合成样本，对 ResNet-101 和 Swin-T 编码器—解码器进行预训练，再使用高质量基准数据微调。尽管仿真器与目标数据存在模型失配，ResNet-101 在五项室内无线电地图预测任务中，相较于已知最佳方法的平均误差降低约 15%，并改善了在小规模真实测量数据集上的迁移表现。两种架构均呈现可预测的数据规模规律：仅利用 200 万至 1600 万样本拟合的幂律，可以预测 3200 万至 1.28 亿样本规模下、按下游任务归一化的平…

**自动匹配线索：** swin-t、resnet-101、rmse、pretraining→预训练、radio→无线电、maps→地图、samples→样本、101、15、3.33、7.10。

### SYNTHETIC-P0004 · 页内坐标 x=108, y=545.2

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Large-scale pretraining has become the dominant mechanism behind recent progress in deep learning, especially when data and compute can be scaled together. Many physics-governed spatial prediction problems do not naturally fit this regime: real measurements are scarce, expensive, and difficult to cover exhaustively, while high-fidelity simulators are often slow, proprietary, and used to create benchmark-sized datasets rather than open-ended pretraining corpora. Indoor radio-map prediction provides a concrete instance of this broader bottleneck. Accurate pathloss fields are useful for wireless planning, localization, sensing, and coverage optimization, but available high-quality radio-map datasets remain small relative to the scales used in modern representation learning.

**译稿位置：** [T005 · 第 28 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L28)；**译文候选段首：** 大规模预训练已经成为近年来深度学习取得进展的主要机制，特别是在数据量和计算资源能够共同扩展的情况下。但许多由物理定律支配的空间预测问题并不天然适合这种范式：真实测量稀缺且昂贵，难以穷尽各种场景；高保真仿真器则通常速度较慢、属于专有软件，生成的数据规模往往只够构成基准数据集，而非可以持续扩展的预训练语料。室内无线电地图预测正是这种瓶颈的典型实例。准确的路径损耗场有利于无线网络规划、定位、感知和覆盖优化，但现有高质量无线电地图数据集相对于现代表示学习使用的数据量仍然很小。

**自动匹配线索：** pretraining→预训练、data→数据、datasets→数据集。

### SYNTHETIC-P0005 · 页内坐标 x=107.7, y=637.9

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Traditional propagation modeling approaches often rely on empirical or statistical pathloss models, such as log-distance and multi-wall formulations, due to their low computational cost. These models provide useful coarse estimates, while more complex deterministic ray-tracing simulators, such as the Ranplan Wireless simulator used to generate the ICASSP and MLSP benchmark radio maps, model detailed 3D geometry and propagation effects including reflection, transmission, and diffraction [Azevedo and Mendonça, 2024, Bakirtzis et al., 2025, Yapar et al., 2025, Bakirtzis et al., 2024].

**译稿位置：** [T006 · 第 30 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L30)；**译文候选段首：** 传统传播建模由于计算代价低，通常依赖对数距离、多墙模型等经验或统计路径损耗公式。这些模型可提供有用的粗略估计；而 Ranplan Wireless 等更复杂的确定性射线追踪仿真器能够刻画细致的三维几何，以及反射、透射和绕射等传播效应。ICASSP 和 MLSP 无线电地图基准正是使用这类仿真器产生的 [Azevedo and Mendonça, 2024；Bakirtzis et al., 2025；Yapar et al., 2025；Bakirtzis et al., 2…

**自动匹配线索：** ranplan、wireless、icassp、mlsp、models→模型、computational→计算、radio→无线电、maps→地图、2024、2025。

### SYNTHETIC-P0006 · 页内坐标 x=107.7, y=734

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 非正文候选：作者/出版信息或表格。

**原文全文（PDF 文本层）：** 40th Conference on Neural Information Processing Systems (NeurIPS 2026).

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

## PDF 第 2 页 · 提取候选 9 项

### SYNTHETIC-P0007 · 页内坐标 x=108, y=74.4

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Deep neural networks offer a different tradeoff: train on high-quality simulated or measured radio maps, then predict dense pathloss fields quickly at inference time [Qiu et al., 2023, Levie et al., 2021]. Recent ICASSP and MLSP challenges provide strong standardized benchmarks for indoor radio-map prediction [Bakirtzis et al., 2025, Yapar et al., 2025], but their training sets are small compared with the corpora used in modern representation learning. As a result, recent methods often improve performance by injecting task-specific structure: hand-engineered propagation channels, sparse-measurement features, graph propagation priors, or specialized architectures [Mkrtchyan et al., 2025, Petrosyan et al., 2025, Li et al., 2024, Wang et al., 2023].

**译稿位置：** [T007 · 第 32 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L32)；**译文候选段首：** 深度神经网络提供了另一种权衡：先用高质量仿真或实测地图训练，再在推理时快速预测稠密路径损耗场 [Qiu et al., 2023；Levie et al., 2021]。近期 ICASSP 和 MLSP 挑战为室内无线电地图预测建立了标准化的强基准，但与现代表示学习的训练语料相比，其训练集仍然很小。为提高性能，现有方法常引入针对特定任务设计的结构，例如人工构造的传播通道、稀疏测量特征、图传播先验及专门设计的网络架构 [Mkrtchyan et al., 2025；Petros…

**自动匹配线索：** levie、icassp、mlsp、mkrtchyan、radio→无线电、maps→地图、training→训练、2023、2021、2025、2024。

### SYNTHETIC-P0008 · 页内坐标 x=107.5, y=167.2

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** We ask whether indoor radio-map prediction can instead be moved into a scalable pretraining regime. Our empirical contribution addresses two data bottlenecks: procedural generation supplies diverse floor-plan inputs, and a cheap approximate ray tracer supplies their labels. We pretrain standard encoder-decoders and fine-tune on high-quality benchmarks. Neither a new architecture nor a more accurate propagation model is claimed: the generator encodes domain knowledge but omits diffraction, scattering, and 3D propagation. The question is how far scale and diversity can compensate for this mismatch.

**译稿位置：** [T008 · 第 34 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L34)；**译文候选段首：** 本文提出的问题是：能否将室内无线电地图预测推进到可规模化的预训练范式？作者的经验性贡献针对两个数据瓶颈：程序化生成提供丰富的平面布局输入，而低成本近似射线追踪器提供其监督标签。随后预训练标准编码器—解码器，并在高质量基准上微调。作者并不声称提出了新网络架构或更准确的传播模型：生成器虽然编码了领域知识，但忽略绕射、散射和三维传播。研究的问题是：扩大规模和增加多样性，究竟能够在多大程度上弥补这种模型失配？

**自动匹配线索：** pretraining→预训练、data→数据、ray→射线、model→模型。

### SYNTHETIC-P0009 · 页内坐标 x=135.4, y=270.3

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** • We build a configurable input–label generation pipeline and a 128M-sample corpus occupying roughly 6 TB. The generation code is public; the dataset will be released.

**译稿位置：** [T008 · 第 34 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L34)；**译文候选段首：** 本文提出的问题是：能否将室内无线电地图预测推进到可规模化的预训练范式？作者的经验性贡献针对两个数据瓶颈：程序化生成提供丰富的平面布局输入，而低成本近似射线追踪器提供其监督标签。随后预训练标准编码器—解码器，并在高质量基准上微调。作者并不声称提出了新网络架构或更准确的传播模型：生成器虽然编码了领域知识，但忽略绕射、散射和三维传播。研究的问题是：扩大规模和增加多样性，究竟能够在多大程度上弥补这种模型失配？

### SYNTHETIC-P0010 · 页内坐标 x=135.4, y=298.1

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** • We compare 10 encoder-decoder models from four families under a fixed-FLOP protocol, and select ResNet101 and Swin-T for the main scaling runs.

**译稿位置：** [T010 · 第 38 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L38)；**译文候选段首：** 1. 建立可配置的输入—标签生成流水线，生成约占 6 TB 存储的 1.28 亿样本数据集。生成代码已公开；数据集计划发布。 2. 在固定浮点运算量（FLOP）协议下比较四类架构中的 10 个编码器—解码器模型，选择 ResNet101 和 Swin-T 进行主要规模扩展实验。 3. 证明下游迁移性能随廉价合成预训练规模呈现可预测的改善。仅用 200 万至 1600 万样本的检查点拟合数据规模幂律，即可较准确外推更大规模下相对于 200 万检查点归一化的平均 RMSE。 4.…

**自动匹配线索：** resnet101、swin-t、models→模型、10。

### SYNTHETIC-P0011 · 页内坐标 x=135.4, y=325.8

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** • We show that downstream transfer improves predictably with cheap synthetic pretraining scale: a data-only power law fitted on 2M16M checkpoints predicts the 2M-normalized mean RMSE at larger scales with low extrapolation error for both models.

**译稿位置：** [T010 · 第 38 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L38)；**译文候选段首：** 1. 建立可配置的输入—标签生成流水线，生成约占 6 TB 存储的 1.28 亿样本数据集。生成代码已公开；数据集计划发布。 2. 在固定浮点运算量（FLOP）协议下比较四类架构中的 10 个编码器—解码器模型，选择 ResNet101 和 Swin-T 进行主要规模扩展实验。 3. 证明下游迁移性能随廉价合成预训练规模呈现可预测的改善。仅用 200 万至 1600 万样本的检查点拟合数据规模幂律，即可较准确外推更大规模下相对于 200 万检查点归一化的平均 RMSE。 4.…

**自动匹配线索：** rmse、pretraining→预训练、scale→尺度、models→模型。

### SYNTHETIC-P0012 · 页内坐标 x=135.4, y=364.4

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** • We show our models beat the best public leaderboard references of five ICASSP/MLSP tasks, and quantify the effects of simulator fidelity and missing material information.

**译稿位置：** [T010 · 第 38 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L38)；**译文候选段首：** 1. 建立可配置的输入—标签生成流水线，生成约占 6 TB 存储的 1.28 亿样本数据集。生成代码已公开；数据集计划发布。 2. 在固定浮点运算量（FLOP）协议下比较四类架构中的 10 个编码器—解码器模型，选择 ResNet101 和 Swin-T 进行主要规模扩展实验。 3. 证明下游迁移性能随廉价合成预训练规模呈现可预测的改善。仅用 200 万至 1600 万样本的检查点拟合数据规模幂律，即可较准确外推更大规模下相对于 200 万检查点归一化的平均 RMSE。 4.…

**自动匹配线索：** icassp、mlsp、models→模型。

### SYNTHETIC-P0013 · 页内坐标 x=135.4, y=392.2

**原文章节（自动识别）：** 1 Introduction。**目标译稿章节：** 1. 引言。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** • We test frozen-feature transfer on real RSSI measurements and probe free-space attenuation, frequency scaling, wall shadowing, and geometric symmetries.

**译稿位置：** [T010 · 第 38 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L38)；**译文候选段首：** 1. 建立可配置的输入—标签生成流水线，生成约占 6 TB 存储的 1.28 亿样本数据集。生成代码已公开；数据集计划发布。 2. 在固定浮点运算量（FLOP）协议下比较四类架构中的 10 个编码器—解码器模型，选择 ResNet101 和 Swin-T 进行主要规模扩展实验。 3. 证明下游迁移性能随廉价合成预训练规模呈现可预测的改善。仅用 200 万至 1600 万样本的检查点拟合数据规模幂律，即可较准确外推更大规模下相对于 200 万检查点归一化的平均 RMSE。 4.…

**自动匹配线索：** rssi、frequency→频率、geometric→几何。

### SYNTHETIC-P0014 · 页内坐标 x=108, y=458

**原文章节（自动识别）：** 2 Related Work。**目标译稿章节：** 2. 相关工作。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Radio-map prediction and pathloss reconstruction. Deep-learning approaches to radio-map prediction commonly learn dense pathloss maps from floor plans, transmitter information, and environment-derived channels. RadioUNet [Levie et al., 2021] established the value of imageto-image architectures for fast radio-map estimation. Later benchmark-driven work has explored stronger backbones, pretrained visual encoders, sparse-measurement inputs, and physics-informed features [Bakirtzis et al., 2025, Mkrtchyan et al., 2025, Yapar et al., 2025, Petrosyan et al., 2025]. SIP2Net [Lu et al., 2025] uses a U-Net-style architecture with tailored objectives, IPP-Net [Feng et al., 2025] augments the input with propagation-related wall-count features, and sparsemeasurement work has used free-space pathloss and wall transmission features to improve reconstruction [Petrosyan et al., 2025]. In this scarce-data regime, a noticeable trend is that the best-performing systems rely on bespoke propagation features, feature engineering, or benchmarkspecific architectural choices. We ask whether scaling cheap synthetic pretraining can reduce this dependence while improving transfer across tasks.

**译稿位置：** [T011 · 第 46 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L46)；**译文候选段首：** **无线电地图预测与路径损耗重建。** 深度学习方法通常从建筑平面图、发射机信息及环境特征通道出发学习稠密路径损耗地图。RadioUNet [Levie et al., 2021] 确立了图像到图像网络架构用于快速无线电地图预测的价值。其后面向基准的研究进一步探索更强的骨干网络、预训练视觉编码器、稀疏测量输入和物理信息特征 [Bakirtzis et al., 2025；Mkrtchyan et al., 2025；Yapar et al., 2025；Petrosyan e…

**自动匹配线索：** radiounet、levie、bakirtzis、mkrtchyan、reconstruction→重建、maps→地图、transmission→透射、pretraining→预训练、2021、2025。

### SYNTHETIC-P0015 · 页内坐标 x=107.8, y=614.2

**原文章节（自动识别）：** 2 Related Work。**目标译稿章节：** 2. 相关工作。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Synthetic simulation and sim-to-real learning. Synthetic data and pretraining have driven progress across machine learning, including language models trained on web-scale text and vision models trained with domain randomization or procedural scenes [Brown et al., 2020, Tremblay et al., 2018]. In wireless propagation, however, large-scale synthetic pretraining has been less explored, partly because useful data requires both diverse environment geometry and corresponding pathloss fields. The ICASSP and MLSP benchmarks use ray tracing to create fixed datasets of high-fidelity radio maps [Bakirtzis et al., 2025, Yapar et al., 2025, Bakirtzis et al., 2024]. Our work is closer to approximate-simulator pretraining: use a simplified physics engine as a scalable source of supervision, then rely on downstream fine-tuning for alignment to high-quality simulated and measured data.

**译稿位置：** [T012 · 第 48 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L48)；**译文候选段首：** **合成仿真与仿真到真实的学习。** 合成数据和预训练促进了机器学习多个领域的发展，包括在互联网规模文本上训练的语言模型，以及采用领域随机化或程序化场景训练的视觉模型 [Brown et al., 2020；Tremblay et al., 2018]。但在无线传播中，大规模合成预训练尚未得到充分探索，部分原因在于有用数据同时要求多样化的环境几何及对应路径损耗场。ICASSP 与 MLSP 基准使用射线追踪建立固定规模的高保真无线电地图数据集。本文方法更接近“近似仿真器预训练…

**自动匹配线索：** brown、tremblay、icassp、mlsp、simulation→仿真、data→数据、pretraining→预训练、models→模型、2020、2018。

## PDF 第 3 页 · 提取候选 7 项

### SYNTHETIC-P0016 · 页内坐标 x=134.3, y=119.7

**原文章节（自动识别）：** 2 Related Work。**目标译稿章节：** 2. 相关工作。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** ICASSP T1 Unseen buildings; 868 MHz, isotropic 1,000 250 50 ICASSP T2 Unseen buildings/frequencies; three training frequencies, test includes 2,400 MHz 3,000 750 100

**译稿位置：** [T012 · 第 48 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L48)；**译文候选段首：** **合成仿真与仿真到真实的学习。** 合成数据和预训练促进了机器学习多个领域的发展，包括在互联网规模文本上训练的语言模型，以及采用领域随机化或程序化场景训练的视觉模型 [Brown et al., 2020；Tremblay et al., 2018]。但在无线传播中，大规模合成预训练尚未得到充分探索，部分原因在于有用数据同时要求多样化的环境几何及对应路径损耗场。ICASSP 与 MLSP 基准使用射线追踪建立固定规模的高保真无线电地图数据集。本文方法更接近“近似仿真器预训练…

**自动匹配线索：** icassp、training→训练。

### SYNTHETIC-P0017 · 页内坐标 x=134.3, y=152.4

**原文章节（自动识别）：** 2 Related Work。**目标译稿章节：** 2. 相关工作。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** ICASSP T3 Unseen buildings/frequencies/antennas; five training and two test patterns 22,200 5,550 200

**译稿位置：** [T012 · 第 48 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L48)；**译文候选段首：** **合成仿真与仿真到真实的学习。** 合成数据和预训练促进了机器学习多个领域的发展，包括在互联网规模文本上训练的语言模型，以及采用领域随机化或程序化场景训练的视觉模型 [Brown et al., 2020；Tremblay et al., 2018]。但在无线传播中，大规模合成预训练尚未得到充分探索，部分原因在于有用数据同时要求多样化的环境几何及对应路径损耗场。ICASSP 与 MLSP 基准使用射线追踪建立固定规模的高保真无线电地图数据集。本文方法更接近“近似仿真器预训练…

**自动匹配线索：** icassp、training→训练。

### SYNTHETIC-P0018 · 页内坐标 x=108, y=221.4

**原文章节（自动识别）：** 2 Related Work。**目标译稿章节：** 2. 相关工作。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Scaling laws and predictive extrapolation. Empirical scaling laws relate model performance to data, parameters, and compute [Kaplan et al., 2020, Hoffmann et al., 2022]. Recent work on dataconstrained scaling shows that repeated data can retain useful scaling behavior for a limited number of epochs [Muennighoff et al., 2025]. We use this perspective in a narrower setting: the model family is fixed after architecture selection, and the scaling variable is synthetic pretraining data or effective sample exposure. The extrapolation target is downstream radio-map performance after fine-tuning, not pretraining loss alone.

**译稿位置：** [T013 · 第 50 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L50)；**译文候选段首：** **规模规律与预测性外推。** 经验性规模规律（scaling laws）刻画模型性能与数据量、参数量和计算量的关系 [Kaplan et al., 2020；Hoffmann et al., 2022]。近期有关受数据约束的规模扩展研究表明，在有限轮次内重复使用数据仍可能保留有用的规模趋势 [Muennighoff et al., 2025]。本文的研究范围更窄：架构选定后保持模型族固定，唯一规模变量是合成预训练样本数量或有效样本曝光量。外推目标是微调之后的下游无线电地图性…

**自动匹配线索：** scaling、laws、kaplan、hoffmann、model→模型、data→数据、parameters→参数、pretraining→预训练、2020、2022、2025。

### SYNTHETIC-P0019 · 页内坐标 x=107.6, y=335.9

**原文章节（自动识别）：** 3 Indoor Radio-Map Prediction Tasks。**目标译稿章节：** 3. 室内无线电地图预测任务。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Let Ω⊂R2 denote the floor-plan domain and let y ∈RH×W be the target pathloss map on a fixed raster grid. Each sample is represented as an image-like tensor x containing rasterized building geometry, material channels, transmitter geometry, operating frequency, antenna information, and, when available, sparse observed pathloss values. The model fθ predicts a dense pathloss map ˆy = fθ(x) and is evaluated by RMSE in dB on held-out maps.

**译稿位置：** [T014 · 第 54 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L54)；**译文候选段首：** 令 $\Omega\subset\mathbb R^2$ 表示平面图空间域，$\mathbf y\in\mathbb R^{H\times W}$ 为固定栅格上的目标路径损耗地图。每个样本都表示为类似图像的张量 $\mathbf x$，其中包含栅格化建筑几何、材料通道、发射机几何、工作频率、天线信息，以及在可用时包含稀疏观测路径损耗。模型 $f_\theta$ 预测稠密地图 $\widehat{\mathbf y}=f_\theta(\mathbf x)$，并在留出的地图上以…

**自动匹配线索：** rmse、map→地图、sample→样本、geometry→几何、frequency→频率。

### SYNTHETIC-P0020 · 页内坐标 x=108, y=406.9

**原文章节（自动识别）：** 3 Indoor Radio-Map Prediction Tasks。**目标译稿章节：** 3. 室内无线电地图预测任务。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Five challenge settings. We evaluate on three ICASSP indoor pathloss radio-map prediction tasks [Bakirtzis et al., 2025] and two uniform-random sampling settings from MLSP Task 1 [Yapar et al., 2025]. The ICASSP tasks test generalization across unseen building layouts, unseen carrier frequencies, and unseen antenna radiation patterns. The MLSP settings test reconstruction from very sparse pathloss samples at two sampling rates. Table 1 specifies the supervision and evaluation sizes for these five settings. For sparse-measurement tasks, the sample budget is ⌈rWH/100⌉, where r ∈{0.02, 0.5} is the sampling percentage and W, H are the map dimensions.

**译稿位置：** [T015 · 第 56 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L56)；**译文候选段首：** **五项挑战任务。** 实验包括三项 ICASSP 室内路径损耗地图预测任务 [Bakirtzis et al., 2025]，以及 MLSP Task 1 中两种均匀随机采样设置 [Yapar et al., 2025]。ICASSP 任务考察对未知建筑布局、载波频率与天线辐射方向图的泛化；MLSP 任务以两种非常稀疏的路径损耗采样率考察重建能力。五项任务的训练与评估规模见表 1。稀疏测量任务的样本预算为 $\lceil rWH/100\rceil$，其中 $r\in\{0…

**自动匹配线索：** icassp、bakirtzis、mlsp、task、sampling→采样、antenna→天线、reconstruction→重建、sparse→稀疏、2025、100、0.02、0.5。

### SYNTHETIC-P0021 · 页内坐标 x=108, y=496.1

**原文章节（自动识别）：** 3 Indoor Radio-Map Prediction Tasks。**目标译稿章节：** 3. 室内无线电地图预测任务。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Input representation. The same featurizer is used for synthetic pretraining and downstream finetuning. It builds an 11-channel tensor with fixed channel order: wall reflectance, wall transmittance, Euclidean distance from the transmitter, antenna gain, four log-frequency Fourier channels, a validpixel mask, a binary floor-plan channel, and a sparse-measurement channel. Reflectance and transmittance are zero in free space. Antenna gain is computed from the radiation pattern and transmitter azimuth at each grid location isotropic antennas therefore produce a zero gain channel. Carrier frequency is encoded in log space using t = (log f -log fmin)/(log fmax-log fmin), with fmin = 100 MHz and fmax = 7000 MHz, and the four spatially uniform channels sin(2πt), cos(2πt), sin(4πt), and cos(4πt). The floor-plan channel is provided directly when available and otherwise derived as the union of nonzero material pixels the sparse channel contains observed pathloss values at measurement locations and is zero elsewhere. Samples are padded and resized to 256 × 256 before featurization. Reflectance, transmittance, antenna gain, and sparse pathloss are z-scored over nonzero entries, the distance channel is log-transformed and z-scored, and frequency, mask, and floor-plan channels are left unnormalized.

**译稿位置：** [T018 · 第 77 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L77)；**译文候选段首：** 四个空间均匀的频率通道分别为 $\sin(2\pi t)$、$\cos(2\pi t)$、$\sin(4\pi t)$、$\cos(4\pi t)$。若原数据直接包含平面图通道则使用原通道，否则从非零材料像素的并集中构建；稀疏通道只在测量位置放入观测路径损耗，其他位置为零。生成特征前，先对样本填充并缩放到 $256\times256$。对反射率、透射率、天线增益及稀疏路径损耗，仅在非零条目上进行 z-score 标准化；距离通道先取对数再做 z-score；频率、掩码及平面图…

**自动匹配线索：** reflectance→反射、transmittance→透射、antenna→天线、antennas→天线、256。

### SYNTHETIC-P0022 · 页内坐标 x=108, y=690.5

**原文章节（自动识别）：** 4 Scalable Synthetic Radio-Map Generation。**目标译稿章节：** 4. 可扩展合成无线电地图生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Generator overview. A procedural floor-plan rasterizer creates inputs and a Numba-accelerated 2D ray tracer supplies pathloss targets [Lam et al., 2015]. On a 0.25 m grid, the generator samples a rectangular canvas with 64 m height and aspect ratio 0.4–2.5, an exterior shell, corridor ring and

**译稿位置：** [T019 · 第 81 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L81)；**译文候选段首：** **生成器概况。** 程序化平面图栅格器负责生成输入，Numba 加速的二维射线追踪器负责生成目标路径损耗 [Lam et al., 2015]。在间隔 0.25 m 的栅格上，生成器采样高度 64 m、宽高比 0.4–2.5 的矩形画布，并建立外围墙体、环形走廊、主干走廊、服务核心、递归房间分割及门洞。发射机在自由空间均匀采样；频率在 400–10,000 MHz 内均匀采样。墙体反射损耗与透射损耗分别在 0.1–15 dB 和 0.1–30 dB 内取值。

**自动匹配线索：** ray→射线、2015、0.25、64、0.4。

## PDF 第 4 页 · 提取候选 6 项

### SYNTHETIC-P0023 · 页内坐标 x=152.3, y=72.8

**原文章节（自动识别）：** 4 Scalable Synthetic Radio-Map Generation。**目标译稿章节：** 4. 可扩展合成无线电地图生成。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Layout Antenna pattern (dB) Target pathloss (dB)

**译稿位置：** [T020 · 第 83 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L83)；**译文候选段首：** 天线以 0.2 的概率选择各向同性模式；其他情况下，使用 Fourier 生成器抽取方向性方向图、随机方位角与对称性，以及最高 40 dB 的峰值衰减。射线追踪器发射 46,080 条射线，最多允许五次反射和十次穿墙透射。对于抵达每个像素的路径，累计自由空间损耗、天线损耗、反射损耗和透射损耗，并保留最小路径损耗；未覆盖的像素用直达路径的墙体透射结果补齐。仿真器省略绕射、散射和三维传播。图 1 对比合成样本与基准样本，更多生成器细节见附录 A。

**自动匹配线索：** antenna→天线。

### SYNTHETIC-P0024 · 页内坐标 x=108, y=364.9

**原文章节（自动识别）：** 4 Scalable Synthetic Radio-Map Generation。**目标译稿章节：** 4. 可扩展合成无线电地图生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** spines, service cores, recursive room partitions, and door openings. Transmitters are uniform over free space; frequencies are uniform over 400–10,000 MHz. Wall reflection and transmission losses span 0.1–15 and 0.1–30 dB, respectively. Antennas are isotropic with probability 0.2; otherwise a Fourier generator samples directional patterns, random azimuth and symmetry, and peak attenuation up to 40 dB. The tracer launches 46,080 rays, allowing at most five reflections and ten wall transmissions. It accumulates free-space, antenna, reflection, and transmission losses and stores the minimum pathloss reaching each pixel; uncovered pixels receive direct-path transmission backfill. Diffraction, scattering, and 3D propagation are omitted. Figure 1 contrasts synthetic and benchmark examples; Appendix A details the generator.

**译稿位置：** [T020 · 第 83 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L83)；**译文候选段首：** 天线以 0.2 的概率选择各向同性模式；其他情况下，使用 Fourier 生成器抽取方向性方向图、随机方位角与对称性，以及最高 40 dB 的峰值衰减。射线追踪器发射 46,080 条射线，最多允许五次反射和十次穿墙透射。对于抵达每个像素的路径，累计自由空间损耗、天线损耗、反射损耗和透射损耗，并保留最小路径损耗；未覆盖的像素用直达路径的墙体透射结果补齐。仿真器省略绕射、散射和三维传播。图 1 对比合成样本与基准样本，更多生成器细节见附录 A。

**自动匹配线索：** fourier、reflection→反射、transmission→透射、antennas→天线、samples→样本、0.2、40、46、080。

### SYNTHETIC-P0025 · 页内坐标 x=107.6, y=475.7

**原文章节（自动识别）：** 4 Scalable Synthetic Radio-Map Generation。**目标译稿章节：** 4. 可扩展合成无线电地图生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Separation from the benchmarks. The generator reads no benchmark layouts or labels, and its distributions were not fitted to them. A nearest-neighbor audit compared all 25 ICASSP layouts with 50,000 independently generated layouts: median rotation-aware Chamfer distance was 1.451% versus 0.624% for held-out synthetic queries, and tolerant IoU was 0.263 versus 0.549. No exact matches occurred in this finite audit; it does not exhaustively check the 128M corpus. Replaying 27,750 benchmark inputs through our tracer still gave 10.91 dB median per-map RMSE against Ranplan (Appendix B).

**译稿位置：** [T021 · 第 87 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L87)；**译文候选段首：** **与基准数据的隔离。** 生成器不读取任何基准平面图或标签，其采样分布也未针对基准拟合。最近邻审计把全部 25 张 ICASSP 平面图与独立生成的 50,000 张布局比较：中位旋转感知 Chamfer 距离为 1.451%，而留出合成查询为 0.624%；容差交并比（IoU）分别为 0.263 与 0.549。在这一有限审计中没有发现精确匹配，但它并未穷尽检查全部 1.28 亿份数据。将 27,750 个基准输入重新输入自研射线追踪器，与 Ranplan 结果比较后，每…

**自动匹配线索：** icassp、chamfer、rmse、ranplan、finite→有限、25、50、000、1.451。

### SYNTHETIC-P0026 · 页内坐标 x=108, y=564.8

**原文章节（自动识别）：** 4 Scalable Synthetic Radio-Map Generation。**目标译稿章节：** 4. 可扩展合成无线电地图生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Generated corpus. We generated 128M unique synthetic samples, requiring approximately 6 TB of storage. The main pretraining run uses checkpoints at 2M, 4M, 8M, 16M, 32M, 64M, and 128M unique samples, followed by 192M and 256M effective sample exposures corresponding to 1.5 and 2 passes over the 128M corpus. The generation code is publicly available1; the dataset will be released.

**译稿位置：** [T022 · 第 89 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L89)；**译文候选段首：** **合成语料。** 共生成 1.28 亿份独特的合成样本，占用约 6 TB 存储。主要预训练运行在累计使用 200 万、400 万、800 万、1600 万、3200 万、6400 万和 1.28 亿个独特样本时保存检查点；随后继续获得 1.92 亿和 2.56 亿次有效样本曝光量，相当于对 1.28 亿样本语料进行 1.5 和 2 次遍历。生成代码已公开，数据集计划发布。

**自动匹配线索：** samples→样本、pretraining→预训练、sample→样本、dataset→数据集、1.5。

### SYNTHETIC-P0027 · 页内坐标 x=108, y=660.7

**原文章节（自动识别）：** 5 Experiments。**目标译稿章节：** 5. 实验。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Architecture search under fixed FLOPs. We first select the model architecture under a fixedstep, fixed-FLOP protocol. Table 2 reports all variants and the selected ResNet101. The search compares 10 encoder-U-Net variants from four encoder families: ResNet34 and ResNet101 [He et al., 2016], ConvNeXt-Tiny [Liu et al., 2022], MiT-B2 and MiT-B3 [Xie et al., 2021], and five

**译稿位置：** [T023 · 第 93 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L93)；**译文候选段首：** **固定 FLOP 的架构搜索。** 首先采用固定步数与固定 FLOP 协议选择网络架构。表 2 报告 10 种变体及最终选定的 ResNet101。实验覆盖四类编码器系列中的 10 个编码器—U-Net 变体，包括 ResNet34、ResNet101、ConvNeXt-Tiny、MiT-B2、MiT-B3，以及具有不同 patch 和注意力窗口设置的五种 Swin-Tiny 变体 [He et al., 2016；Liu et al., 2022；Xie et al., …

**自动匹配线索：** resnet101、resnet34、convnext-tiny、mit-b2、model→模型、10、2016、2022、2021。

### SYNTHETIC-P0028 · 页内坐标 x=118.9, y=712.7

**原文章节（自动识别）：** 5 Experiments。**目标译稿章节：** 5. 实验。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** 1https://github.com/xoren22/cheap-synth-pretrain-neurips26

**译稿位置：** [T024 · 第 95 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L95)；**译文候选段首：** 学习率调度固定为前 10% 预热、80% 稳定、最后 10% 线性衰减至零。每种模型搜索峰值学习率 $\{10^{-4},3\times10^{-4},10^{-3},3\times10^{-3}\}$，以及权重衰减 $\{10^{-3},10^{-1}\}$。模型的学习率与权重衰减根据第 350k 步的最终训练损失选定；合成验证 RMSE 仅作为诊断指标，不参与选择。

## PDF 第 5 页 · 提取候选 6 项

### SYNTHETIC-P0029 · 页内坐标 x=146, y=124.7

**原文章节（自动识别）：** 5 Experiments。**目标译稿章节：** 5. 实验。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Encoder Peak LR Batch FLOPs/sample Train loss Val RMSE

**译稿位置：** [T024 · 第 95 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L95)；**译文候选段首：** 学习率调度固定为前 10% 预热、80% 稳定、最后 10% 线性衰减至零。每种模型搜索峰值学习率 $\{10^{-4},3\times10^{-4},10^{-3},3\times10^{-3}\}$，以及权重衰减 $\{10^{-3},10^{-1}\}$。模型的学习率与权重衰减根据第 350k 步的最终训练损失选定；合成验证 RMSE 仅作为诊断指标，不参与选择。

**自动匹配线索：** rmse。

### SYNTHETIC-P0030 · 页内坐标 x=107.6, y=284

**原文章节（自动识别）：** 5 Experiments。**目标译稿章节：** 5. 实验。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Swin-Tiny variants with different patch and window settings [Liu et al., 2021]. For each model, the profiled per-sample FLOP estimate determines the effective batch size so that every run uses 350,000 optimizer steps and approximately 6 × 1018 total theoretical training FLOPs. We chose 350,000 steps because it was long enough for all architectures in the sweep to converge in training loss. The learning-rate schedule is fixed to 10% warmup, 80% stable learning rate, and 10% linear decay to zero. For each model, we sweep peak learning rate over {10-4, 3 × 10-4, 10-3, 3 × 10-3} and weight decay over {10-3, 10-1}. The selected learning rate and weight decay for each architecture are chosen by final training loss at step 350k; synthetic validation RMSE is reported as a diagnostic rather than as the selection criterion.

**译稿位置：** [T023 · 第 93 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L93)；**译文候选段首：** **固定 FLOP 的架构搜索。** 首先采用固定步数与固定 FLOP 协议选择网络架构。表 2 报告 10 种变体及最终选定的 ResNet101。实验覆盖四类编码器系列中的 10 个编码器—U-Net 变体，包括 ResNet34、ResNet101、ConvNeXt-Tiny、MiT-B2、MiT-B3，以及具有不同 patch 和注意力窗口设置的五种 Swin-Tiny 变体 [He et al., 2016；Liu et al., 2022；Xie et al., …

**自动匹配线索：** swin-tiny、patch、flop、model→模型、training→训练、2021、350、000、10。

### SYNTHETIC-P0031 · 页内坐标 x=107.6, y=399.5

**原文章节（自动识别）：** 5 Experiments。**目标译稿章节：** 5. 实验。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Large-scale synthetic pretraining. We pretrain the selected ResNet101 encoder-decoder on the full synthetic corpus using the hyperparameters selected by the fixed-compute sweep: AdamW with peak learning rate 3 × 10-3 and weight decay 10-3. The scaling run uses 5 H100 GPUs with DDP and a global batch size of 180, split evenly as 36 samples per GPU. Following the warmup-stable-decay (WSD) strategy [Hu et al., 2024], the parent run uses a sample-based schedule with a 1M-sample linear warmup followed by stable peak learning rate. For each target exposure T ∈{2, 4, 8, 16, 32, 64, 128, 192, 256}M, we fork at 0.9T samples and run a child decay from the same sampler state, linearly decaying the learning rate to zero over the remaining 0.1T samples; downstream experiments use the decayed child checkpoint saved at exactly T total seen samples.

**译稿位置：** [T025 · 第 112 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L112)；**译文候选段首：** **大规模合成预训练。** 使用固定计算搜索选定的超参数对 ResNet101 编码器—解码器进行完整合成语料预训练：AdamW，峰值学习率 $3\times10^{-3}$，权重衰减 $10^{-3}$。规模扩展实验在 5 张 H100 GPU 上采用分布式数据并行（DDP），全局批大小 180，每张 GPU 36。按照预热—稳定—衰减（WSD）策略 [Hu et al., 2024]，父运行以样本数量为基准，经过 100 万样本线性预热后保持峰值学习率。

**自动匹配线索：** resnet101、adamw、h100、pretraining→预训练、samples→样本、10、180、36、2024。

### SYNTHETIC-P0032 · 页内坐标 x=107.7, y=503.2

**原文章节（自动识别）：** 5 Experiments。**目标译稿章节：** 5. 实验。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** To test dependence on architecture selection, we also pretrain Swin-T (fourth in the fixed-compute ranking) on the same corpus at seven scales from 2M to 128M and fine-tune each checkpoint on all five tasks. These scaling runs use one pretraining seed per backbone; the results do not estimate variability across independent pretraining runs.

**译稿位置：** [T026 · 第 114 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L114)；**译文候选段首：** 对目标曝光量 $T\in\{2,4,8,16,32,64,128,192,256\}$ 百万，作者在累计达到 $0.9T$ 样本时从同一采样器状态分叉出子运行，并让学习率在剩余的 $0.1T$ 样本上下降到零；下游实验使用恰好看到 $T$ 份样本时保存的子运行衰减检查点。为测试结果是否依赖架构选择，还在相同语料上对 Swin-T（固定计算搜索中排名第四）进行从 200 万到 1.28 亿的七个规模预训练，并在全部五项任务上微调。这些规模实验每种骨干网络只有一个预训练随机种子，…

**自动匹配线索：** swin-t、pretraining→预训练、results→结果。

### SYNTHETIC-P0033 · 页内坐标 x=107.6, y=564.1

**原文章节（自动识别）：** 5 Experiments。**目标译稿章节：** 5. 实验。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Fine-tuning. Each pretraining checkpoint is fine-tuned separately on each downstream task. We first sweep four fine-tuning peak learning rates in the range 10-5–10-3 and select a single learning rate by internal-validation RMSE on ICASSP Task 3, the largest downstream training set. The selected peak learning rate, 5 × 10-4, is then used for all downstream tasks without per-task tuning. This deliberately avoids tuning separately on each task or repeatedly querying Kaggle during method development; Kaggle is used only for final public-leaderboard reporting. Fine-tuning uses 32 epochs with AdamW, weight decay 10-4, 5 warmup epochs, 20 decay epochs, minimum LR factor 0.01, bfloat16 mixed precision, gradient clipping at norm 1, and frozen BatchNorm statistics. For each task and pretraining scale, the reported checkpoint is selected by the held-out internal-validation RMSE.

**译稿位置：** [T027 · 第 116 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L116)；**译文候选段首：** **微调。** 对每个预训练检查点，在每项下游任务上分别微调。首先在 $10^{-5}$–$10^{-3}$ 范围内扫描四种微调峰值学习率，以训练集最大的 ICASSP Task 3 的内部验证 RMSE 选定一个统一值 $5\times10^{-4}$，随后对所有下游任务使用同一学习率，不做针对单任务的调参。这避免了在方法开发中分别调节任务，或反复查询 Kaggle；Kaggle 仅用于最终公开排行榜汇报。微调使用 32 个 epoch 的 AdamW、权重衰减 $10^{…

**自动匹配线索：** task、rmse、icassp、kaggle、pretraining→预训练、training→训练、method→方法、gradient→梯度、10、32、20、0.01。

### SYNTHETIC-P0034 · 页内坐标 x=108, y=690.5

**原文章节（自动识别）：** 5 Experiments。**目标译稿章节：** 5. 实验。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Baselines. We compare against a scratch ResNet101 trained on each challenge training set, the best public leaderboard reference for each task, and the synthetic-pretrained ResNet101 fine-tuned on each task.

**译稿位置：** [T028 · 第 118 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L118)；**译文候选段首：** **基线。** 比较对象包括：在各挑战训练集从头训练的 ResNet101、每项任务公开排行榜的最佳参考成绩，以及经过合成预训练后在各任务微调的 ResNet101。

**自动匹配线索：** resnet101、training→训练。

## PDF 第 6 页 · 提取候选 1 项

### SYNTHETIC-P0035 · 页内坐标 x=108, y=625.1

**原文章节（自动识别）：** 6 Results。**目标译稿章节：** 6. 实验结果。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Downstream benchmark transfer. Table 3 compares first-epoch checkpoints with scratch training and named public-leaderboard entries: Cheick Tidiani Cisse (ICASSP T1), takktak (T2/T3), George Hoa (MLSP 0.02), and Leyi Zou (MLSP 0.5). Their posted MSE scores are converted to RMSE. Fine-tuning epochs are selected by internal validation; the table then reports the best public RMSE across 2M–128M pretraining scales, so it is a selected-scale summary, not a single common checkpoint. Figure 4 (Appendix C) shows complete ResNet101 task curves, including variability across tasks and repeated exposures at 192M and 256M. Gains differ across tasks: ICASSP changes buildings, frequencies, and antennas, whereas MLSP provides sparse target-domain pathloss. These differences may affect adaptation, but we have not isolated their causal contributions.

**译稿位置：** [T029 · 第 124 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L124)；**译文候选段首：** **下游基准迁移。** 表 3 对比首轮数据检查点、从头训练和公开排行榜基线：ICASSP T1 为 Cheick Tidiani Cisse，T2/T3 为 takktak，MLSP 0.02 为 George Hoa，MLSP 0.5 为 Leyi Zou。其公布的 MSE 分数换算为 RMSE。微调 epoch 通过内部验证选择，表中列出 200 万至 1.28 亿预训练规模间最好的公开 RMSE，因此这是一份*跨规模选择的最优结果汇总*，并非同一个统一检查点的成绩。附…

**自动匹配线索：** cheick、tidiani、cisse、icassp、training→训练、pretraining→预训练、antennas→天线、sparse→稀疏、0.02、0.5。

## PDF 第 7 页 · 提取候选 7 项

### SYNTHETIC-P0036 · 页内坐标 x=142.6, y=114.5

**原文章节（自动识别）：** 6 Results。**目标译稿章节：** 6. 实验结果。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Task Reference entry Scratch Ref. Best Scale Reduction

**译稿位置：** [T029 · 第 124 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L124)；**译文候选段首：** **下游基准迁移。** 表 3 对比首轮数据检查点、从头训练和公开排行榜基线：ICASSP T1 为 Cheick Tidiani Cisse，T2/T3 为 takktak，MLSP 0.02 为 George Hoa，MLSP 0.5 为 Leyi Zou。其公布的 MSE 分数换算为 RMSE。微调 epoch 通过内部验证选择，表中列出 200 万至 1.28 亿预训练规模间最好的公开 RMSE，因此这是一份*跨规模选择的最优结果汇总*，并非同一个统一检查点的成绩。附…

### SYNTHETIC-P0037 · 页内坐标 x=108, y=209.4

**原文章节（自动识别）：** 6 Results。**目标译稿章节：** 6. 实验结果。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Data-only downstream scaling law. For task i and exposure N, normalize downstream RMSE by that backbone’s own 2M checkpoint, then average uniformly over the five tasks:

**译稿位置：** [T030 · 第 136 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L136)；**译文候选段首：** **仅考虑数据规模的下游规模规律。** 对任务 $i$ 和样本曝光量 $N$，将下游 RMSE 归一化为该骨干网络在 200 万检查点的 RMSE，再对五项任务均匀平均：

**自动匹配线索：** rmse。

### SYNTHETIC-P0038 · 页内坐标 x=107.6, y=275.3

**原文章节（自动识别）：** 5 X。**目标译稿章节：** 6. 实验结果。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Separate fits using only 2M, 4M, 8M, and 16M predict held-out 32M–128M normalized means with 3.33% MAPE for ResNet101 and 7.10% for Swin-T. The ResNet101 fit is 0.755 + 0.250(N/2M)-0.409; its error through 256M is 4.00%, including repeated data. Figure 2 shows both backbones. Swin-T’s raw five-task mean falls from 9.57 to 6.95 dB (27.3%), with its best mean of 6.55 dB at 32M; ResNet101 is best at 64M (6.18 dB). Thus improvement is not strictly monotone, and the fits describe an aggregate trend, not a guarantee for each task or a shared architectureindependent exponent.

**译稿位置：** [T032 · 第 150 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L150)；**译文候选段首：** 其预测到 2.56 亿次曝光（包括重复使用数据）的误差为 4.00%。Swin-T 原始五任务平均 RMSE 从 9.57 dB 降至 6.95 dB（27.3%），但最佳值 6.55 dB 出现在 3200 万；ResNet101 的最佳五任务均值 6.18 dB 出现在 6400 万。因此改善并非严格单调，这些幂律刻画的是聚合趋势，不保证每一项任务都服从同一趋势，也不存在已经证实的跨架构统一指数。

**自动匹配线索：** resnet101、swin-t、data→数据、4.00、9.57、6.95、27.3。

### SYNTHETIC-P0039 · 页内坐标 x=107.6, y=363.7

**原文章节（自动识别）：** 5 X。**目标译稿章节：** 6. 实验结果。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Simulator fidelity and missing inputs. Matched corpora capped at zero, two, or five reflections were used to pretrain ResNet101 to 16M samples. Direct simulator median RMSE on ICASSP inputs was 12.61/11.11/10.91 dB; frozen five-task mean RMSE was 10.50/9.02/8.99 dB, compared with 6.79/6.60/6.58 dB after full fine-tuning. Scarce-label experiments (two seeds) show gains up to 19.3% on ICASSP T2 and 14.8% on MLSP 0.02. Fidelity therefore matters most with little target supervision in this 16M study (Appendix D). Separately, removing material channels in frozen MLSP transfer reduces the mean per-building 8M–64M gain at 0.5% support from 0.252 to 0.121 dB (pHolm = 2.38 × 10-6, 25 buildings). With neither materials nor sparse support, error instead worsens through 32M. Scale cannot replace missing input information; Appendix E reports this failure case.

**译稿位置：** [T033 · 第 152 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L152)；**译文候选段首：** **仿真器保真度与输入缺失。** 作者使用其余条件相匹配、最多允许零次、两次或五次反射的三种语料，对 ResNet101 预训练到 1600 万样本。直接仿真在 ICASSP 输入上的每图 RMSE 中位数分别为 12.61、11.11、10.91 dB；冻结模型的五任务平均 RMSE 为 10.50、9.02、8.99 dB；充分微调后则为 6.79、6.60、6.58 dB。仅有少量标注时，双随机种子实验在 ICASSP T2 和 MLSP 0.02 上的收益最高分别为 …

**自动匹配线索：** resnet101、rmse、icassp、mlsp、samples→样本、12.61、11.11、10.91、10.50。

### SYNTHETIC-P0040 · 页内坐标 x=107.5, y=513.4

**原文章节（自动识别）：** 7 Real-Measurement Transfer。**目标译稿章节：** 7. 真实测量数据的迁移。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** We evaluate the indoor dataset of Milosheski et al. [2025]: 1,027 RSSI measurements from 20 empty/occupied setups at 16 access-point (AP) locations. The ResNet101 is frozen, receives no sparse real measurements, and supplies its predicted receiver-pixel pathloss to ridge regression. This is calibrated feature transfer, not end-to-end adaptation. RSSI equals Ptx + Gtx + Grx -L -Lsys, whereas the network predicts pathloss L. Transmit power is unavailable, so learned calibration is necessary. With only the prediction, ridge fits an affine map [ RSSI = abL + b.

**译稿位置：** [T035 · 第 158 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L158)；**译文候选段首：** 使用 Milosheski 等人 [2025] 的室内数据集进行评估：16 个接入点（AP）位置下 20 种空置/占用场景中的 1,027 个 RSSI 测量。ResNet101 保持冻结，不接收真实稀疏测量，只把其预测的接收像素路径损耗提供给岭回归。这属于*经过校准的特征迁移*，而非端到端适应。

**自动匹配线索：** milosheski、rssi、resnet101、dataset→数据集、sparse→稀疏、2025、027、20、16。

### SYNTHETIC-P0041 · 页内坐标 x=107.5, y=586.7

**原文章节（自动识别）：** 7 Real-Measurement Transfer。**目标译稿章节：** 7. 真实测量数据的迁移。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** We use 16 leave-one-AP-location-out folds. Feature standardization and ridge (α = 0.1) are fitted only on the other 15 AP locations. The baseline has 12 fixed features: transmitter/receiver coordinates, distance and log-distance, same-room and occupied-condition indicators, and coarse room type. At 8M, adding the frozen prediction lowers RMSE from 5.878 to 5.117 dB (12.9%); the prediction alone reaches 5.595 dB. Only the combined model significantly improves on the fixed baseline: an exact paired sign-flip test on AP-group squared-error contributions gives pHolm = 0.0082, corrected over all 45 combined-model/baseline pairs. The supported conclusion is incremental information beyond the geometric baseline.

**译稿位置：** [T038 · 第 168 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L168)；**译文候选段首：** 实验采用 16 折留一 AP 位置交叉验证；特征标准化和岭回归（$\alpha=0.1$）只在其余 15 个 AP 位置上拟合。基线具有 12 个固定特征，包括收发机坐标、距离与对数距离、是否同一房间、是否有人占用，以及粗略房间类型。在 800 万检查点上，加入冻结预测使 RMSE 从 5.878 降至 5.117 dB（12.9%）；单独使用预测值的 RMSE 为 5.595 dB。只有组合模型相对于固定特征基线的提升具有统计显著性：对 AP 分组平方误差贡献执行精确配对符…

**自动匹配线索：** rmse、baseline→基线、model→模型、geometric→几何、16、0.1、15、12。

### SYNTHETIC-P0042 · 页内坐标 x=107.7, y=679.7

**原文章节（自动识别）：** 7 Real-Measurement Transfer。**目标译稿章节：** 7. 真实测量数据的迁移。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** The combined model reaches 5.117, 5.323, and 5.234 dB at 8M, 128M, and 256M, with 95% APcluster bootstrap intervals [4.583, 5.642], [4.727, 5.908], and [4.671, 5.779]. Comparisons with 8M give pHolm = 0.304 and 1.000. These 16 independent groups do not resolve the later ordering; neither continued real-data improvement nor degradation is established. Frozen MLSP models also

**译稿位置：** [T039 · 第 170 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L170)；**译文候选段首：** 组合模型在 800 万、1.28 亿和 2.56 亿检查点上的 RMSE 分别为 5.117、5.323、5.234 dB，其 AP 聚类 Bootstrap 95% 区间分别为 [4.583,5.642]、[4.727,5.908]、[4.671,5.779]。后两个检查点与 800 万比较时，校正后的 $p$ 值为 0.304 和 1.000。由于只有 16 个独立 AP 组，不能从中确定后期数据规模增加是否会继续改善，或反而造成退化。冻结 MLSP 模型也在约 800 …

**自动匹配线索：** bootstrap、mlsp、model→模型、models→模型、5.117、5.323、5.234、95。

## PDF 第 8 页 · 提取候选 7 项

### SYNTHETIC-P0043 · 页内坐标 x=108, y=74.4

**原文章节（自动识别）：** 7 Real-Measurement Transfer。**目标译稿章节：** 7. 真实测量数据的迁移。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** show diminishing returns around 8M, while fine-tuned transfer improves later. Lack of target adaptation is a plausible explanation, not a demonstrated cause; frozen MLSP still has detectable later gains. End-to-end testing needs larger, more diverse measured datasets. Appendix F gives the full curve and calibration diagnostics.

**译稿位置：** [T039 · 第 170 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L170)；**译文候选段首：** 组合模型在 800 万、1.28 亿和 2.56 亿检查点上的 RMSE 分别为 5.117、5.323、5.234 dB，其 AP 聚类 Bootstrap 95% 区间分别为 [4.583,5.642]、[4.727,5.908]、[4.671,5.779]。后两个检查点与 800 万比较时，校正后的 $p$ 值为 0.304 和 1.000。由于只有 16 个独立 AP 组，不能从中确定后期数据规模增加是否会继续改善，或反而造成退化。冻结 MLSP 模型也在约 800 …

**自动匹配线索：** mlsp、datasets→数据集。

### SYNTHETIC-P0044 · 页内坐标 x=107.7, y=158.6

**原文章节（自动识别）：** 8 What Does the Model Learn?。**目标译稿章节：** 8. 模型究竟学到了什么？。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** The benchmark gains alone do not explain why an approximate simulator transfers despite missing propagation effects. We therefore run controlled probes that compare model outputs with known physical invariants or closed-form expectations. These probes operate directly on synthetic diagnostic scenes and use the 128M ResNet101 checkpoint.

**译稿位置：** [T040 · 第 174 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L174)；**译文候选段首：** 基准成绩提高本身不足以解释：为什么省略传播效应的近似仿真器仍能迁移？作者因此设计受控探针，把网络输出与已知物理不变量或封闭形式预期进行比较。这些探针直接作用于合成诊断场景，使用 1.28 亿样本预训练得到的 ResNet101 检查点。

**自动匹配线索：** resnet101、physical→物理。

### SYNTHETIC-P0045 · 页内坐标 x=108, y=214.4

**原文章节（自动识别）：** 8 What Does the Model Learn?。**目标译稿章节：** 8. 模型究竟学到了什么？。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Probe summary. The probes show that the pretrained model has learned more than benchmarkspecific interpolation. It reproduces free-space frequency scaling with 0.45% MAPE, free-space distance scaling with 1.10% MAPE, single-wall loss calibration with mean median absolute error 0.41 dB across 3–20 dB wall losses, D4 scene-isometry consistency with median absolute difference 0.51 dB after alignment, open-field angular isotropy with median angular residual 0.037 dB, and source/receiver reciprocity over representative chords with 0.70 dB MAE. Additional probe figures are shown in Appendix G.

**译稿位置：** [T041 · 第 176 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L176)；**译文候选段首：** 探针结果显示，预训练网络学到的并不只是特定基准上的插值规律：自由空间频率尺度变化的 MAPE 为 0.45%，自由空间距离尺度变化的 MAPE 为 1.10%；对于 3–20 dB 单墙损耗，平均中位绝对误差为 0.41 dB；对齐后的 $D_4$ 场景等距变换一致性中位绝对差为 0.51 dB；开阔场景角度各向同性的中位角向残差为 0.037 dB；在代表性线段上交换发射机与接收机位置，其互易性误差 MAE 为 0.70 dB。其余探针图见附录 G。

**自动匹配线索：** mape、frequency→频率、loss→损耗、consistency→一致、0.45、1.10、0.41、20。

### SYNTHETIC-P0046 · 页内坐标 x=107.5, y=296.3

**原文章节（自动识别）：** 8 What Does the Model Learn?。**目标译稿章节：** 8. 模型究竟学到了什么？。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** We view these physics-based symmetries as important evidence for the role of synthetic pretraining. The probes are not tuned to the five benchmark competitions or to the real-measurement regression task, yet the model preserves invariances that a useful propagation model should satisfy. This reduces the likelihood that the generator and network have merely adapted to the particular evaluation datasets, and increases confidence that the learned representation can be useful in other indoor radio-map settings where labeled measurements or high-fidelity simulations are scarce.

**译稿位置：** [T042 · 第 178 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L178)；**译文候选段首：** 作者认为，这些由物理结构产生的对称性是合成预训练确有作用的重要证据。探针没有专门针对五项基准竞赛或真实测量回归任务进行调参，网络却能保留有用传播模型应当满足的不变量。这降低了“生成器和网络仅仅适应特定评测数据集”的可能性，也提高了模型能用于其他高质量标签稀缺室内地图场景的可信程度。

**自动匹配线索：** pretraining→预训练、model→模型、network→网络、datasets→数据集。

### SYNTHETIC-P0047 · 页内坐标 x=107.6, y=402.4

**原文章节（自动识别）：** 8 What Does the Model Learn?。**目标译稿章节：** 8. 模型究竟学到了什么？。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** A wireless-planning workflow can use broad procedural pretraining, then adapt with a smaller set of trusted simulations or measurements before predicting dense maps for new queries. The fidelity study motivates a budget trade-off between fewer accurate labels, more approximate labels, and mixtures. It holds sample count fixed, not generation compute; a compute-optimal allocation remains open. Other physics-governed spatial tasks may admit this recipe, but our evidence is limited to indoor radio maps.

**译稿位置：** [T040 · 第 174 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L174)；**译文候选段首：** 基准成绩提高本身不足以解释：为什么省略传播效应的近似仿真器仍能迁移？作者因此设计受控探针，把网络输出与已知物理不变量或封闭形式预期进行比较。这些探针直接作用于合成诊断场景，使用 1.28 亿样本预训练得到的 ResNet101 检查点。

**自动匹配线索：** pretraining→预训练、simulations→仿真、sample→样本。

### SYNTHETIC-P0048 · 页内坐标 x=108, y=473.3

**原文章节（自动识别）：** 8 What Does the Model Learn?。**目标译稿章节：** 8. 模型究竟学到了什么？。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Our simulator omits diffraction, scattering, and 3D propagation. The 16M reflection-depth study does not establish robustness to those missing effects or to arbitrary floor-plan generators. Scaling is data-only, with one pretraining seed per backbone, and does not jointly model parameters and compute. Self-supervised, masked, foundation-model, domain-adaptation, and generative-pretraining baselines remain open comparisons. The small real dataset establishes calibrated predictive information, not deployment readiness or end-to-end transfer.

**译稿位置：** [T042 · 第 178 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L178)；**译文候选段首：** 作者认为，这些由物理结构产生的对称性是合成预训练确有作用的重要证据。探针没有专门针对五项基准竞赛或真实测量回归任务进行调参，网络却能保留有用传播模型应当满足的不变量。这降低了“生成器和网络仅仅适应特定评测数据集”的可能性，也提高了模型能用于其他高质量标签稀缺室内地图场景的可信程度。

**自动匹配线索：** pretraining→预训练、model→模型、dataset→数据集。

### SYNTHETIC-P0049 · 页内坐标 x=108, y=579.4

**原文章节（自动识别）：** 8 What Does the Model Learn?。**目标译稿章节：** 8. 模型究竟学到了什么？。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Cheap approximate simulation can make scarce high-quality indoor radio-map data more useful. ResNet101 improves all five public-leaderboard tasks; both ResNet101 and Swin-T show predictable aggregate scaling with non-monotone later checkpoints. Fidelity and material information still matter, particularly with scarce target supervision. Frozen predictions add information for calibrated real RSSI regression, while controlled probes show physically meaningful structure. High-fidelity simulation and real measurements remain necessary for adaptation and validation.

**译稿位置：** [T042 · 第 178 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L178)；**译文候选段首：** 作者认为，这些由物理结构产生的对称性是合成预训练确有作用的重要证据。探针没有专门针对五项基准竞赛或真实测量回归任务进行调参，网络却能保留有用传播模型应当满足的不变量。这降低了“生成器和网络仅仅适应特定评测数据集”的可能性，也提高了模型能用于其他高质量标签稀缺室内地图场景的可信程度。

**自动匹配线索：** data→数据。

## PDF 第 9 页 · 提取候选 1 项

### SYNTHETIC-P0050 · 页内坐标 x=107.7, y=97.5

**原文章节（自动识别）：** Acknowledgments and Disclosure of Funding。**目标译稿章节：** 致谢与资助披露。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** This research was in part sponsored by the HESC MESCS RA grant No. 22rl-052 (DISTAL), and by the NATO Science for Peace and Security Programme under grant ID G9270 (OASIS).

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

## PDF 第 10 页 · 提取候选 13 项

### SYNTHETIC-P0051 · 页内坐标 x=108, y=74.4

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Siu Kwan Lam, Antoine Pitrou, and Stanley Seibert. Numba: A LLVM-based Python JIT compiler. In Proceedings of the Second Workshop on the LLVM Compiler Infrastructure in HPC, pages 1–6, 2015. doi: 10.1145/2833157.2833162.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0052 · 页内坐标 x=108, y=117.5

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Ron Levie, Ça˘gkan Yapar, Gitta Kutyniok, and Giuseppe Caire. RadioUNet: Fast radio map estimation with convolutional neural networks. IEEE Transactions on Wireless Communications, 20(6): 4001–4015, 2021. doi: 10.1109/TWC.2021.3054977.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0053 · 页内坐标 x=108, y=160.7

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Xiaojie Li, Songyang Zhang, Hang Li, Xiaoyang Li, Lexi Xu, Haigao Xu, Hui Mei, Guangxu Zhu, Nan Qi, and Ming Xiao. RadioGAT: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks. IEEE Transactions on Wireless Communications, 23(11):17777–17792, 2024. doi: 10.1109/TWC.2024.3457157.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0054 · 页内坐标 x=108, y=214.8

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Ze Liu, Yutong Lin, Yue Cao, Han Hu, Yixuan Wei, Zheng Zhang, Stephen Lin, and Baining Guo. Swin Transformer: Hierarchical vision transformer using shifted windows. In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pages 10012–10022, 2021. doi: 10.1109/ICCV48922.2021.00986.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0055 · 页内坐标 x=108, y=268.9

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Zhuang Liu, Hanzi Mao, Chao-Yuan Wu, Christoph Feichtenhofer, Trevor Darrell, and Saining Xie. A ConvNet for the 2020s. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 11976–11986, 2022. doi: 10.1109/CVPR52688.2022.01167.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0056 · 页内坐标 x=108, y=312.1

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Wenlihan Lu, Ziyi Lu, Jia Yan, and Shijian Gao. SIP2Net: Situational-aware indoor pathloss-map prediction network for radio map generation. In ICASSP 2025 - 2025 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pages 1–2. IEEE, 2025. doi: 10.1109/ICASSP49660.2025.10890319.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0057 · 页内坐标 x=108, y=366

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Ljupcho Milosheski, Kuon Akiyama, Blaž Bertalaniˇc, Jernej Hribar, and Ryoichi Shinkuma. An indoor radio mapping dataset combining 3D point clouds and RSSI. Dataset, 2025. URL https: //zenodo.org/records/15791300. Version v1; record DOI: 10.5281/zenodo.15791300; allversion DOI: 10.5281/zenodo.15791299.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0058 · 页内坐标 x=108, y=420.2

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Rafayel Mkrtchyan, Edvard Ghukasyan, Khoren Petrosyan, Hrant Khachatrian, and Theofanis P. Raptis. Vision transformers for efficient indoor pathloss radio map prediction. Electronics, 14 (10):1905, 2025. doi: 10.3390/electronics14101905.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0059 · 页内坐标 x=108, y=463.4

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Niklas Muennighoff, Alexander M. Rush, Boaz Barak, Teven Le Scao, Aleksandra Piktus, Nouamane Tazi, Sampo Pyysalo, Thomas Wolf, and Colin Raffel. Scaling data-constrained language models. Journal of Machine Learning Research, 26(53):1–66, 2025. URL https: //jmlr.org/papers/v26/24-1000.html.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0060 · 页内坐标 x=108, y=517.5

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Khoren Petrosyan, Rafayel Mkrtchyan, Hrant Khachatrian, and Theofanis P. Raptis. U-Net for indoor pathloss prediction from sparse measurements with physics-based features. In 2025 IEEE 35th International Workshop on Machine Learning for Signal Processing (MLSP), pages 1–6, 2025. doi: 10.1109/MLSP62443.2025.11204276.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0061 · 页内坐标 x=108, y=571.6

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Kehai Qiu, Stefanos Bakirtzis, Hui Song, Ian Wassell, and Jie Zhang. Deep learning-based path loss prediction for outdoor wireless communication systems. In ICASSP 2023 - 2023 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pages 1–2. IEEE, 2023. doi: 10.1109/ICASSP49357.2023.10095501.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0062 · 页内坐标 x=108, y=625.6

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Jonathan Tremblay, Aayush Prakash, David Acuna, Mark Brophy, Varun Jampani, Cem Anil, Thang To, Eric Cameracci, Shaad Boochoon, and Stan Birchfield. Training deep networks with synthetic data: Bridging the reality gap by domain randomization. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition Workshops, pages 969–977, 2018.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0063 · 页内坐标 x=108, y=679.7

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Zhuang Wang, Qun Kong, Bingcai Wei, Liye Zhang, and Aikui Tian. Radio map construction based on BERT for fingerprint-based indoor positioning system. EURASIP Journal on Wireless Communications and Networking, 2023(1), 2023. doi: 10.1186/s13638-023-02247-2. Article number 39.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

## PDF 第 11 页 · 提取候选 2 项

### SYNTHETIC-P0064 · 页内坐标 x=108, y=74.4

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Enze Xie, Wenhai Wang, Zhiding Yu, Anima Anandkumar, Jose M. Alvarez, and Ping Luo. Seg- Former: Simple and efficient design for semantic segmentation with transformers. In Advances in Neural Information Processing Systems, volume 34, pages 12077–12090. Curran Associates, Inc., 2021.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0065 · 页内坐标 x=108, y=125.9

**原文章节（自动识别）：** References。**目标译稿章节：** 6. 实验结果。**状态：** 非正文候选：参考文献。

**原文全文（PDF 文本层）：** Ça˘gkan Yapar, Stefanos Bakirtzis, Andra Lutu, Ian Wassell, Jie Zhang, and Giuseppe Caire. The sampling-assisted pathloss radio map prediction competition. In 2025 IEEE 35th International Workshop on Machine Learning for Signal Processing (MLSP), pages 1–6, 2025. doi: 10.1109/ MLSP62443.2025.11204278.

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

## PDF 第 12 页 · 提取候选 3 项

### SYNTHETIC-P0066 · 页内坐标 x=107.6, y=214.6

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 A：合成输入和输出的生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Material maps are assigned after rasterization. Wall pixels receive reflectance and transmittance losses, while free-space pixels remain zero. The generator samples typical cases with lower reflectance and higher transmittance loss, rare inverted cases where reflectance is larger, and lowfrequency wall patches that act like thinner or window-like regions. Values are clipped to 15 dB for reflectance and 30 dB for transmittance. The rasterizer also stores a per-wall-pixel normal vector, which is used by the reflection model. The transmitter is sampled uniformly over free-space pixels, the distance map is computed on the same raster, and carrier frequency is sampled uniformly from 400 to 10,000 MHz.

**译稿位置：** [T047 · 第 198 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L198)；**译文候选段首：** 栅格化之后再指定材料。墙体像素获得反射与透射损耗，自由空间保持为零。普通样本采用较低反射损耗和较高透射损耗；少数样本反转这种关系，并使用低频墙体斑块模拟较薄的隔墙或窗户。反射损耗上限 15 dB，透射损耗上限 30 dB。还储存墙体像素的单位法向量，用于反射计算。发射机在自由空间像素内均匀采样，距离图在相同栅格上计算；载频在 400–10,000 MHz 中均匀取值。

**自动匹配线索：** reflectance→反射、transmittance→透射、samples→样本、loss→损耗、15、30、400、10。

### SYNTHETIC-P0067 · 页内坐标 x=107.6, y=307.4

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 A：合成输入和输出的生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Antenna patterns are sampled independently of the floor plan. With probability 0.2 the antenna is isotropic. Otherwise, the pattern is generated by a latent Fourier model with latent dimension sampled from 8–20, harmonic order from 10–24, azimuth sampled uniformly, and peak attenuation up to 40 dB. Pattern styles include front-back, bidirectional, petal, and ripple-like envelopes; optional symmetry is sampled from none, x, y, and xy. The generated pattern is stored both as a 360-sample compatibility array and as a function description in the sample metadata.

**译稿位置：** [T048 · 第 200 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L200)；**译文候选段首：** 天线方向图独立于建筑平面图采样。以 0.2 概率采用各向同性天线；否则使用潜在 Fourier 模型，潜在维数在 8–20 之间，谐波阶次在 10–24 之间，方位角均匀采样，峰值衰减不超过 40 dB。方向图形态包括前后型、双向型、花瓣型和波纹状包络，并可选择无、$x$、$y$、$xy$ 对称。方向图以 360 个采样点数组和函数描述同时写入元数据。

**自动匹配线索：** fourier、antenna→天线、model→模型、0.2、20、10、24。

### SYNTHETIC-P0068 · 页内坐标 x=108, y=377.9

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 A：合成输入和输出的生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Given the rasterized scene, the ray tracer produces the dense target. It launches 360 × 128 rays, stepping at one-pixel radial increments. The accumulated pathloss along a ray is the sum of antenna loss, free-space pathloss, wall-transmission losses, and reflection losses. Transmission loss is added

**译稿位置：** [T049 · 第 202 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L202)；**译文候选段首：** 得到栅格场景后，射线追踪器发射 $360\times128=46{,}080$ 条射线，并以每像素一个径向步长前进。每条路径的总损耗累积天线损耗、自由空间损耗、穿墙透射损耗和反射损耗；射线穿出墙体材料区域时增加透射损耗，由墙面局部法向量决定反射方向，递归在给定反射次数上限终止。默认最多穿出 10 面墙。由于仿真器有意忽略绕射和散射，对于反射路径没有命中的像素，采用从发射机到该像素沿透射损耗地图的直达路径补值。每个像素保留收到的最小路径损耗作为最终目标。

**自动匹配线索：** ray→射线、rays→射线、antenna→天线、loss→损耗、360。

## PDF 第 13 页 · 提取候选 7 项

### SYNTHETIC-P0069 · 页内坐标 x=107.6, y=74.4

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 A：合成输入和输出的生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** when a ray exits a wall material region; reflection directions are computed from the local wall normal; and reflection recursion stops at the configured reflection budget. The default transmission budget is 10 wall exits. Because the simulator intentionally omits diffraction and scattering, pixels missed by reflected rays are filled by a direct line-of-sight backfill that traverses the transmittance map from the transmitter to the pixel. The final target is stored as the minimum pathloss assigned to each pixel.

**译稿位置：** [T049 · 第 202 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L202)；**译文候选段首：** 得到栅格场景后，射线追踪器发射 $360\times128=46{,}080$ 条射线，并以每像素一个径向步长前进。每条路径的总损耗累积天线损耗、自由空间损耗、穿墙透射损耗和反射损耗；射线穿出墙体材料区域时增加透射损耗，由墙面局部法向量决定反射方向，递归在给定反射次数上限终止。默认最多穿出 10 面墙。由于仿真器有意忽略绕射和散射，对于反射路径没有命中的像素，采用从发射机到该像素沿透射损耗地图的直达路径补值。每个像素保留收到的最小路径损耗作为最终目标。

**自动匹配线索：** ray→射线、reflection→反射、transmission→透射、rays→射线、10。

### SYNTHETIC-P0070 · 页内坐标 x=108, y=145.3

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 A：合成输入和输出的生成。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Each generated sample is written as a compressed NPZ file in a bucketed directory. The stored arrays are wall normals, reflectance, transmittance, valid mask, pathloss target, and the 360-sample antenna pattern; metadata records the shape, pixel size, canvas dimensions, transmitter position, carrier frequency, antenna-pattern function, and tracing settings when available.

**译稿位置：** [T050 · 第 204 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L204)；**译文候选段首：** 每个生成样本以压缩 NPZ 存储于分桶目录，数组包含墙体法线、反射率、透射率、有效掩码、目标路径损耗及 360 点天线方向图。元数据记录尺寸、像素比例、画布大小、发射机位置、载频、方向图函数，以及可用时的追踪配置。

**自动匹配线索：** sample→样本、reflectance→反射、transmittance→透射、antenna→天线、360。

### SYNTHETIC-P0071 · 页内坐标 x=107.7, y=234

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 B：与基准数据的隔离审计。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** The generator was designed independently of ICASSP/MLSP, without reading their layouts or labels or fitting its sampling distributions to them. An audit of 200,000 generated scenes found 26.3±12.2 rooms per plan, versus 19.2 ± 8.0 in the benchmark. The generated reflection/transmission losses had means 4.86 ± 3.48/11.16 ± 6.77 dB, versus 9.78 ± 3.89/7.10 ± 6.89 dB in ICASSP. There were 389,805 distinct sampled material pairs, compared with 25 integer-valued benchmark presets. These differences document distribution breadth, not independence of every possible generated sample.

**译稿位置：** [T051 · 第 210 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L210)；**译文候选段首：** 生成器独立于 ICASSP/MLSP 设计，不读取这些基准的平面布局或标签，也不以它们拟合生成分布。对 200,000 个生成场景的审计发现，每张合成平面图平均有 $26.3\pm12.2$ 间房间，基准中为 $19.2\pm8.0$。合成反射/透射损耗的均值和标准差分别为 $4.86\pm3.48$ dB、$11.16\pm6.77$ dB，而 ICASSP 基准分别为 $9.78\pm3.89$ dB、$7.10\pm6.89$ dB。合成数据抽样得到 389,805 种…

**自动匹配线索：** icassp、mlsp、reflection→反射、transmission→透射、distribution→分布、sample→样本、200、000、26.3、19.2。

### SYNTHETIC-P0072 · 页内坐标 x=108, y=304.9

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 B：与基准数据的隔离审计。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** For a direct layout comparison, all 25 ICASSP layouts were matched to 50,000 independently sampled synthetic layouts using rotation-aware wall-mask Chamfer distance and tolerant intersectionover-union (IoU). Held-out synthetic layouts supplied the synthetic-to-synthetic reference. Benchmark queries had median nearest-neighbor Chamfer distance 1.451%, versus 0.624% for synthetic queries, and median IoU 0.263 versus 0.549 (both p &lt; 3.2 × 10-13). Across the 1.25 million benchmark–synthetic comparisons there were no exact matches. The closest pair reached only the eighth percentile of synthetic-to-synthetic nearest-neighbor similarity. This finite audit cannot rule out overlap elsewhere in all 128M samples.

**译稿位置：** [T052 · 第 212 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L212)；**译文候选段首：** 直接平面布局比较把全部 25 张 ICASSP 地图与独立生成的 50,000 张合成布局配对，使用旋转感知的墙体掩码 Chamfer 距离和容差 IoU。另用留出的合成布局作为合成—合成基准。结果显示，基准查询布局到最近合成布局的 Chamfer 距离中位数为 1.451%，合成查询为 0.624%；IoU 中位数分别为 0.263 和 0.549，两者差异的 $p&lt;3.2\times10^{-13}$。在 125 万次基准—合成比较中未发现完全一致的布局。最接近的一…

**自动匹配线索：** icassp、chamfer、finite→有限、samples→样本、25、50、000、1.451。

### SYNTHETIC-P0073 · 页内坐标 x=107.7, y=397.7

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 B：与基准数据的隔离审计。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** To separate layout similarity from label fidelity, all 27,750 labeled benchmark inputs were replayed through our tracer with 46,080 rays, five reflections and ten transmissions, and compared with Ranplan using the benchmark’s 160 dB ceiling. Per-map RMSE was 12.83±8.97 dB (mean ± standard deviation), with median 10.91 dB and first/99th percentiles 2.13/38.26 dB. ICASSP’s simulator allows up to eight reflections, ten transmissions and two diffractions. Even identical inputs therefore do not yield close label reproduction with our approximation.

**译稿位置：** [T053 · 第 214 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L214)；**译文候选段首：** 为区分几何相似性与标签保真度，作者还用自研射线追踪器重放全部 27,750 个具有标签的基准输入，配置为每张地图 46,080 条射线、最多五次反射及十次透射，采用基准的 160 dB 上限与 Ranplan 结果对比。逐地图 RMSE 为 $12.83\pm8.97$ dB（均值±标准差），中位数为 10.91 dB，第一和第 99 百分位分别为 2.13 与 38.26 dB。ICASSP 仿真器允许最多八次反射、十次透射与两次绕射。因此即使输入相同，近似仿真器也不会重现…

**自动匹配线索：** ranplan、rmse、icassp、rays→射线、27、750、46、080。

### SYNTHETIC-P0074 · 页内坐标 x=108, y=481.8

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 C：不同骨干网络与预训练规模下的迁移。**状态：** 非正文候选：图中英文标注或附录节标题。

**原文全文（PDF 文本层）：** C Transfer across backbones and pretraining scales

**译文位置：** 非正文项目，不需要逐自然段译段对应；图中文字另行检查。

### SYNTHETIC-P0075 · 页内坐标 x=107.7, y=690.6

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 C：不同骨干网络与预训练规模下的迁移。**状态：** 已找到相邻子节/同节的译文候选（尚未逐句校验）。

**原文全文（PDF 文本层）：** The first-epoch best ResNet101 scores in Table 3 reduce scratch error by 21.39%, 20.28%, 27.06%, 48.39%, and 45.46% for ICASSP T1/T2/T3 and MLSP 0.02/0.5, respectively. Comparing 128M directly with 2M, the corresponding reductions are 13.77%, 1.88%, 29.50%, 22.15%, and 16.07%.

**译稿位置：** [源文件第 229 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L229)；**译文候选段首：** 表 3 中 ResNet101 各任务

## PDF 第 14 页 · 提取候选 1 项

### SYNTHETIC-P0076 · 页内坐标 x=107.7, y=74.4

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 C：不同骨干网络与预训练规模下的迁移。**状态：** 已找到相邻子节/同节的译文候选（尚未逐句校验）。

**原文全文（PDF 文本层）：** These are different comparisons: selected best scales, endpoint scaling, and leaderboard gains should not be conflated.

**译稿位置：** [源文件第 229 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L229)；**译文候选段首：** 表 3 中 ResNet101 各任务

## PDF 第 15 页 · 提取候选 4 项

### SYNTHETIC-P0077 · 页内坐标 x=369.1, y=121

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 C：不同骨干网络与预训练规模下的迁移。**状态：** 非正文候选：图中英文标注或附录节标题。

**原文全文（PDF 文本层）：** ICASSP Task 1 ICASSP Task 2 ICASSP Task 3 MLSP rate 0.02 MLSP rate 0.5 per-task from-scratch RMSE (no synth pretrain)

**译文位置：** 非正文项目，不需要逐自然段译段对应；图中文字另行检查。

### SYNTHETIC-P0078 · 页内坐标 x=174.5, y=383.6

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 C：不同骨干网络与预训练规模下的迁移。**状态：** 非正文候选：图中英文标注或附录节标题。

**原文全文（PDF 文本层）：** ICASSP Task 1 ICASSP Task 2 ICASSP Task 3 MLSP rate 0.02 MLSP rate 0.5 observed mean across tasks power-law fit (2M–16M)

**译文位置：** 非正文项目，不需要逐自然段译段对应；图中文字另行检查。

### SYNTHETIC-P0079 · 页内坐标 x=139.1, y=433.6

**原文章节（自动识别）：** References。**目标译稿章节：** 附录 C：不同骨干网络与预训练规模下的迁移。**状态：** 非正文候选：疑似图表标签。

**原文全文（PDF 文本层）：** Kaggle validation RMSE / 2M RMSE (log scale)

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0080 · 页内坐标 x=165.4, y=571.8

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 C：不同骨干网络与预训练规模下的迁移。**状态：** 非正文候选：图中英文标注或附录节标题。

**原文全文（PDF 文本层）：** MAPE 32M–128M (first epoch): 3.33% MAPE 32M–256M (full extrapolation): 4.00% Fit uses only 2M–16M (first epoch); 192M and 256M are second-epoch extrapolation.

**译文位置：** 非正文项目，不需要逐自然段译段对应；图中文字另行检查。

## PDF 第 16 页 · 提取候选 2 项

### SYNTHETIC-P0081 · 页内坐标 x=107.5, y=97.5

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 D：1600 万样本下的反射深度消融。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** We generated two additional corpora capped at zero and two reflections, otherwise matched to the five-reflection corpus, and pretrained ResNet101 to 16M samples on each. Table 5 distinguishes direct simulator fidelity from learned transfer. The simulator comparison pools ICASSP benchmark inputs; it should not be confused with the all-input replay audit in Appendix B. The transfer rows average five tasks. This experiment varies reflection depth at fixed sample count and does not establish an optimum at fixed generation compute, validate omitted diffraction/scattering/3D effects, or vary the floor-plan generator independently.

**译稿位置：** [T054 · 第 235 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L235)；**译文候选段首：** 额外生成两套最大反射次数为零和两次的数据集，其他条件与最多五次反射的数据集相匹配。对每套数据分别把 ResNet101 预训练到 1600 万样本。表 5 区分直接仿真器与高保真标签的误差，以及学习模型迁移到下游任务的误差。直接仿真器比较汇集 ICASSP 基准输入，不应与附录 B 的全输入重放审计混淆；迁移值取五任务均值。该实验只在固定样本数下改变反射深度，不能据此确定固定生成算力下的最优反射次数，也不能验证被省略的绕射、散射与三维传播，更没有独立改变平面图生成器。

**自动匹配线索：** resnet101、icassp、samples→样本、reflection→反射、sample→样本。

### SYNTHETIC-P0082 · 页内坐标 x=157.2, y=388.5

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 D：1600 万样本下的反射深度消融。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Task Labeled maps 0 reflections 2 reflections 5 reflections

**译稿位置：** [T054 · 第 235 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L235)；**译文候选段首：** 额外生成两套最大反射次数为零和两次的数据集，其他条件与最多五次反射的数据集相匹配。对每套数据分别把 ResNet101 预训练到 1600 万样本。表 5 区分直接仿真器与高保真标签的误差，以及学习模型迁移到下游任务的误差。直接仿真器比较汇集 ICASSP 基准输入，不应与附录 B 的全输入重放审计混淆；迁移值取五任务均值。该实验只在固定样本数下改变反射深度，不能据此确定固定生成算力下的最优反射次数，也不能验证被省略的绕射、散射与三维传播，更没有独立改变平面图生成器。

## PDF 第 17 页 · 提取候选 6 项

### SYNTHETIC-P0083 · 页内坐标 x=108, y=72.8

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 E：材料通道消融与失败案例。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** E Material-channel removal and a failure case

**译稿位置：** [T055 · 第 264 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L264)；**译文候选段首：** 用只在合成数据上预训练、未进行目标域微调的冻结检查点，对 25 栋建筑共 3750 张有标签 MLSP 地图进行评估。分别使用完整输入，以及移除墙体反射率和透射率（No R/T）的输入。被移除的材料通道在归一化前设成缺失模态值，而几何、距离、频率、天线增益、有效掩码与稀疏支持信息保持固定。

### SYNTHETIC-P0084 · 页内坐标 x=107.5, y=96.9

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 E：材料通道消融与失败案例。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** We evaluate frozen synthetic-only checkpoints on all 3,750 labeled MLSP maps from 25 buildings, with and without reflectance/transmittance channels. Removed channels are set to their missingmodality value before normalization; geometry, distance, frequency, antenna gain, masks and sparse supports are held fixed. No target-domain fine-tuning is performed. Table 7 includes all support conditions and checkpoints.

**译稿位置：** [T055 · 第 264 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L264)；**译文候选段首：** 用只在合成数据上预训练、未进行目标域微调的冻结检查点，对 25 栋建筑共 3750 张有标签 MLSP 地图进行评估。分别使用完整输入，以及移除墙体反射率和透射率（No R/T）的输入。被移除的材料通道在归一化前设成缺失模态值，而几何、距离、频率、天线增益、有效掩码与稀疏支持信息保持固定。

**自动匹配线索：** mlsp、maps→地图、reflectance→反射、transmittance→透射、geometry→几何、25。

### SYNTHETIC-P0085 · 页内坐标 x=107.6, y=374.9

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 E：材料通道消融与失败案例。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** At 0.5% support, the mean per-building 8M–64M improvement is 0.252 dB with materials and 0.121 dB without. The difference remains significant under a paired exact Wilcoxon test with Holm correction across eight scaling comparisons (pHolm = 2.38 × 10-6). These building means differ from the global-RMSE improvements in the table (0.310/0.176 dB). Both conditions still improve after 8M. Missing materials therefore attenuate gains in this setting, but do not establish the cause of real-data saturation: MLSP has sparse pathloss supports, whereas the real experiment has no sparse supports and learns RSSI calibration.

**译稿位置：** [T056 · 第 277 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L277)；**译文候选段首：** 在 0.5% 观测率下，从 800 万增加到 6400 万时，完整材料输入的逐建筑平均改善为 0.252 dB，去材料输入为 0.121 dB。对八种规模比较进行 Holm 校正的成对精确 Wilcoxon 检验得到 $p_{\mathrm{Holm}}=2.38\times10^{-6}$。逐建筑平均增益与表中的整体 RMSE 增益（分别为 0.310/0.176 dB）不同。两种材料输入在 800 万之后仍有改善。材料缺失会减弱迁移收益，但并不足以解释真实数据集的后期收益…

**自动匹配线索：** wilcoxon、holm、mlsp、rssi、sparse→稀疏、0.5、0.252、0.121、2.38。

### SYNTHETIC-P0086 · 页内坐标 x=107.6, y=486.7

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 F：真实数据校准及不确定性。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** At 8M, the combined predictor has RMSE 5.117 dB, L1 3.94 dB and R2 = 0.853 (Figure 6). Fixed features alone give 5.878 dB, 4.56 dB and 0.806; the calibrated neural prediction alone gives 5.595 dB, 4.35 dB and 0.824. Confidence intervals resample entire AP-location folds (20,000 bootstrap resamples), preserving within-location dependence. The 45-comparison family comprises the nine combined-model checkpoints and the fixed-feature baseline; the prediction-only comparison does not establish significant superiority to fixed features. Table 8 reports uncertainty at 8M, 128M, and 256M; Figure 5 compares all three regressors across scales.

**译稿位置：** [T057 · 第 281 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L281)；**译文候选段首：** 800 万检查点下，组合预测模型的 RMSE 为 5.117 dB、L1 误差为 3.94 dB、$R^2=0.853$（图 6）。仅使用固定几何特征时分别为 5.878 dB、4.56 dB、0.806；只使用经校准的冻结神经预测时分别为 5.595 dB、4.35 dB、0.824。

**自动匹配线索：** rmse、5.117、3.94、0.853、5.878。

### SYNTHETIC-P0087 · 页内坐标 x=169.8, y=616.4

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 F：真实数据校准及不确定性。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Exposure RMSE (dB) 95% AP-cluster interval pHolm vs. 8M

**译稿位置：** [T058 · 第 283 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L283)；**译文候选段首：** 置信区间以整个 AP 位置折为单位进行重采样（20,000 次 Bootstrap），保留同一位置内部观测之间的相关性。多重比较族包含九种组合模型检查点与一个固定特征基线，共 45 个成对比较；单独使用神经预测相对于固定基线的改善未得到统计显著性支持。表 8 汇报 800 万、1.28 亿和 2.56 亿的模型不确定性，图 5 给出全部规模下的三类回归模型。

### SYNTHETIC-P0088 · 页内坐标 x=107.7, y=679.7

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 F：真实数据校准及不确定性。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** The frozen Swin-T MLSP 0.5% curve and the real-data curve using the calibrated frozen ResNet101 prediction alone have Pearson r = 0.958 and Spearman ρ = 0.786 over seven checkpoints. ResNet101’s corresponding Pearson correlation is 0.816, but its later rank agreement is weak. Similar curve shapes are descriptive evidence, not a causal test of why real-data gains level off.

**译稿位置：** [T059 · 第 293 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L293)；**译文候选段首：** 冻结 Swin-T 在 MLSP 0.5% 上的规模曲线，与使用冻结 ResNet101 预测值单独进行校准的真实数据曲线，在七个检查点上的 Pearson 相关为 0.958、Spearman $\rho=0.786$。ResNet101 对应的 Pearson 相关为 0.816，但后期排序一致性较弱。这些相似曲线只能视为描述性证据，不能用于确定真实数据收益饱和的因果原因。

**自动匹配线索：** swin-t、mlsp、resnet101、pearson、0.5、0.958、0.786、0.816。

## PDF 第 18 页 · 提取候选 0 项

本页未提取到符合正文特征的文字块（可能以公式、图片、表格或参考文献为主）。

## PDF 第 19 页 · 提取候选 3 项

### SYNTHETIC-P0089 · 页内坐标 x=107.5, y=101.9

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** We use simple room and antenna configurations to test what the models have learned about propagation. In these controlled scenes, physics formulas and symmetries tell us what the predictions should look like: free-space pathloss, added loss behind a wall, and consistency under rotations, reflections, or transmitter–receiver swaps. We compare the 128M synthetic-pretrained ResNet101 with a ResNet101 trained from scratch on ICASSP Task 3. We choose Task 3 because it has the largest ICASSP training set (22,200 maps; Table 1), giving the benchmark-only baseline the most training data. Across these probes, synthetic pretraining produces predictions that follow the physical expectations much more closely, while the Task 3 model shows substantially larger errors and symmetry violations.

**译稿位置：** [T060 · 第 300 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L300)；**译文候选段首：** 作者构造简单的房间和天线配置，检验模型是否学到了可检验的传播规律。受控场景提供可通过物理公式或对称性计算的预期，例如自由空间路径损耗、墙体背后额外损耗，以及旋转、镜像、交换收发机位置后的结果一致性。比较对象为经过 1.28 亿合成样本预训练的 ResNet101 与仅在 ICASSP T3 从头训练的 ResNet101。选取 T3 是因为它拥有 ICASSP 三项任务中最大的训练集（22,200 张地图），可为基准模型提供最充足的真实基准训练数据。下述探针中，合成预训练模型…

**自动匹配线索：** resnet101、icassp、antenna→天线、models→模型、physics→物理、loss→损耗、22、200。

### SYNTHETIC-P0090 · 页内坐标 x=107.8, y=219.5

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Free-space attenuation. For an isotropic antenna in free space, the expected pathloss is L(d, f) = 20 log10(4πdf/c), where d is distance, f is frequency, and c is the speed of light. Figures 7 and 9 vary distance and frequency separately. The pretrained model follows both logarithmic trends closely, whereas the Task 3 baseline shows larger deviations from the analytic curves.

**译稿位置：** [T060 · 第 300 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L300)；**译文候选段首：** 作者构造简单的房间和天线配置，检验模型是否学到了可检验的传播规律。受控场景提供可通过物理公式或对称性计算的预期，例如自由空间路径损耗、墙体背后额外损耗，以及旋转、镜像、交换收发机位置后的结果一致性。比较对象为经过 1.28 亿合成样本预训练的 ResNet101 与仅在 ICASSP T3 从头训练的 ResNet101。选取 T3 是因为它拥有 ICASSP 三项任务中最大的训练集（22,200 张地图），可为基准模型提供最充足的真实基准训练数据。下述探针中，合成预训练模型…

**自动匹配线索：** antenna→天线、model→模型。

### SYNTHETIC-P0091 · 页内坐标 x=211.7, y=281.3

**原文章节（自动识别）：** 0.98 0.98。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Free-space distance scaling at fixed frequencies

**译稿位置：** [T061 · 第 302 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L302)；**译文候选段首：** **自由空间衰减。** 各向同性天线在自由空间中的解析路径损耗为

## PDF 第 20 页 · 提取候选 4 项

### SYNTHETIC-P0092 · 页内坐标 x=108, y=74.3

**原文章节（自动识别）：** 900 MHz 2400 MHz 5800 MHz Model FSPL。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Rotational isotropy. At a fixed distance from an isotropic antenna in empty space, pathloss should not depend on direction. Figure 8 subtracts each circular annulus’s median prediction to expose angular variation. The pretrained model has much smaller residuals than the Task 3 baseline.

**译稿位置：** [T063 · 第 312 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L312)；**译文候选段首：** **角度各向同性。** 对空旷环境中的各向同性发射天线，固定距离处的路径损耗理论上应与方向无关。图 8 从每个同心环带上的预测中减去该环带中位数，突出角度残差。预训练模型的残差明显小于 T3 基线。

**自动匹配线索：** antenna→天线、model→模型、baseline→基线。

### SYNTHETIC-P0093 · 页内坐标 x=382, y=125

**原文章节（自动识别）：** 900 MHz 2400 MHz 5800 MHz Model FSPL。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Residual magnitude by radius angular std median=0.05 dB; p95 |residual|=0.15 dB

**译稿位置：** [T061 · 第 302 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L302)；**译文候选段首：** **自由空间衰减。** 各向同性天线在自由空间中的解析路径损耗为

### SYNTHETIC-P0094 · 页内坐标 x=270.1, y=129.4

**原文章节（自动识别）：** 900 MHz 2400 MHz 5800 MHz Model FSPL。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Angular residual after removing radial trend

**译稿位置：** [T062 · 第 308 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L308)；**译文候选段首：** 其中 $d$ 为传播距离，$f$ 为频率。图 7 和图 9 分别改变距离与频率。预训练模型能较准确跟随对数趋势，T3 基线与解析曲线的差异更大。

### SYNTHETIC-P0095 · 页内坐标 x=386.8, y=238.9

**原文章节（自动识别）：** 2 5 10 15 20 25 30 Radius (m)。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** angular std median=1.81 dB; p95 |residual|=3.54 dB

**译稿位置：** [T062 · 第 308 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L308)；**译文候选段首：** 其中 $d$ 为传播距离，$f$ 为频率。图 7 和图 9 分别改变距离与频率。预训练模型能较准确跟随对数趋势，T3 基线与解析曲线的差异更大。

## PDF 第 21 页 · 提取候选 5 项

### SYNTHETIC-P0096 · 页内坐标 x=229.7, y=72.5

**原文章节（自动识别）：** 2 5 10 15 20 25 30 Radius (m)。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Free-space frequency scaling at fixed distances

**译稿位置：** [T062 · 第 308 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L308)；**译文候选段首：** 其中 $d$ 为传播距离，$f$ 为频率。图 7 和图 9 分别改变距离与频率。预训练模型能较准确跟随对数趋势，T3 基线与解析曲线的差异更大。

**自动匹配线索：** frequency→频率。

### SYNTHETIC-P0097 · 页内坐标 x=108, y=441.1

**原文章节（自动识别）：** 3 m 10 m 30 m Model FSPL。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Wall attenuation. Figure 10 tests whether a finite wall creates the expected shadow: the idealized blocked-minus-unblocked contrast is 12 dB. The pretrained model predicts 11.57 dB, compared with 8.71 dB for the Task 3 baseline. Figure 11 varies the specified wall loss from 3 to 20 dB and shows that the pretrained model follows the changing attenuation more closely.

**译稿位置：** [T064 · 第 318 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L318)；**译文候选段首：** **墙体衰减。** 图 10 检验有限长度墙体是否形成符合预期的传播阴影。理想遮挡—非遮挡损耗对比为 12 dB，预训练模型预测 11.57 dB，T3 基线预测 8.71 dB。图 11 将指定墙体损耗从 3 dB 扫描至 20 dB，预训练模型的预测更接近各级损耗。

**自动匹配线索：** finite→有限、model→模型、baseline→基线、loss→损耗、10、12、11.57、8.71。

### SYNTHETIC-P0098 · 页内坐标 x=264, y=495.8

**原文章节（自动识别）：** 3 m 10 m 30 m Model FSPL。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 非正文候选：疑似图表标签。

**原文全文（PDF 文本层）：** Finite-wall shadowing by a 12 dB segment

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### SYNTHETIC-P0099 · 页内坐标 x=209.4, y=502.9

**原文章节（自动识别）：** 3 m 10 m 30 m Model FSPL。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Synthetic pretrained 128M contrast=11.57 dB (-3.6% from 12 dB)

**译稿位置：** [T064 · 第 318 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L318)；**译文候选段首：** **墙体衰减。** 图 10 检验有限长度墙体是否形成符合预期的传播阴影。理想遮挡—非遮挡损耗对比为 12 dB，预训练模型预测 11.57 dB，T3 基线预测 8.71 dB。图 11 将指定墙体损耗从 3 dB 扫描至 20 dB，预训练模型的预测更接近各级损耗。

**自动匹配线索：** 11.57、12。

### SYNTHETIC-P0100 · 页内坐标 x=317.9, y=502.9

**原文章节（自动识别）：** 3 m 10 m 30 m Model FSPL。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** ICASSP3 from-scratch (best) contrast=8.71 dB (-27.4% from 12 dB)

**译稿位置：** [T064 · 第 318 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L318)；**译文候选段首：** **墙体衰减。** 图 10 检验有限长度墙体是否形成符合预期的传播阴影。理想遮挡—非遮挡损耗对比为 12 dB，预训练模型预测 11.57 dB，T3 基线预测 8.71 dB。图 11 将指定墙体损耗从 3 dB 扫描至 20 dB，预训练模型的预测更接近各级损耗。

**自动匹配线索：** 8.71、12。

## PDF 第 22 页 · 提取候选 2 项

### SYNTHETIC-P0101 · 页内坐标 x=212.7, y=72.6

**原文章节（自动识别）：** 3 m 10 m 30 m Model FSPL。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Single-wall attenuation calibration: 3-20 dB sweep

**译稿位置：** [T064 · 第 318 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L318)；**译文候选段首：** **墙体衰减。** 图 10 检验有限长度墙体是否形成符合预期的传播阴影。理想遮挡—非遮挡损耗对比为 12 dB，预训练模型预测 11.57 dB，T3 基线预测 8.71 dB。图 11 将指定墙体损耗从 3 dB 扫描至 20 dB，预训练模型的预测更接近各级损耗。

**自动匹配线索：** 20。

### SYNTHETIC-P0102 · 页内坐标 x=108, y=453.8

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Spatial prediction errors. Figures 12 and 13 compare full predicted maps with analytic targets: free-space loss in an empty room, and free-space loss plus 10 dB in the geometric shadow of a single wall. Columns show the prediction, target, and signed prediction-minus-target residual. The pretrained model reproduces both spatial patterns with smaller errors than the Task 3 baseline.

**译稿位置：** [T065 · 第 323 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L323)；**译文候选段首：** **空间预测残差。** 图 12–13 将完整预测地图与解析目标比较：一张是空房间中的自由空间损耗，另一张是自由空间损耗叠加单道墙体后方的 10 dB 几何阴影。各列分别为预测、解析真值和预测减真值的有符号残差。预训练模型在这两种空间模式中的误差均显著小于 T3 基线。

**自动匹配线索：** maps→地图、loss→损耗、geometric→几何、model→模型、12、13、10。

## PDF 第 23 页 · 提取候选 1 项

### SYNTHETIC-P0103 · 页内坐标 x=251.4, y=106.9

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 非正文候选：疑似图表标签。

**原文全文（PDF 文本层）：** Empty-room free-space path loss at 2.4 GHz

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

## PDF 第 24 页 · 提取候选 6 项

### SYNTHETIC-P0104 · 页内坐标 x=108, y=74.3

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Sparse observations. Figure 14 adds four exact pathloss observations to the empty-room input in Figure 12. These observations anchor the predicted field at a few locations; the dense free-space target is unchanged. The pretrained model’s RMSE falls from 0.40 to 0.19 dB. ICASSP Task 3 does not provide sparse-measurement training, so its baseline is not a matched test of learning to use these supports.

**译稿位置：** [T066 · 第 328 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L328)；**译文候选段首：** **稀疏观测。** 图 14 在图 12 的空房间输入中额外提供四个精确路径损耗观测点，稠密自由空间目标保持不变。这些点可使模型预测场在有限位置上得到锚定。预训练模型 RMSE 从 0.40 降至 0.19 dB。由于 ICASSP Task 3 没有稀疏观测训练，所以 T3 基线不是一项严格匹配的“学习使用稀疏支持”的对比。

**自动匹配线索：** rmse、icassp、task、sparse→稀疏、observations→观测、model→模型、training→训练、14、12、0.40、0.19。

### SYNTHETIC-P0105 · 页内坐标 x=245.5, y=140.2

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Empty-room prediction with four sparse supports

**译稿位置：** [T066 · 第 328 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L328)；**译文候选段首：** **稀疏观测。** 图 14 在图 12 的空房间输入中额外提供四个精确路径损耗观测点，稠密自由空间目标保持不变。这些点可使模型预测场在有限位置上得到锚定。预训练模型 RMSE 从 0.40 降至 0.19 dB。由于 ICASSP Task 3 没有稀疏观测训练，所以 T3 基线不是一项严格匹配的“学习使用稀疏支持”的对比。

**自动匹配线索：** sparse→稀疏。

### SYNTHETIC-P0106 · 页内坐标 x=108, y=406.4

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Geometric consistency and reciprocity. Figure 15 rotates or reflects a scene, predicts again, and aligns the output back to the original frame. A consistent model should recover the original prediction; the pretrained model has smaller alignment errors. Figure 16 swaps transmitter and receiver in a fixed layout. Under the probe’s reciprocal propagation conditions, loss should be unchanged, so agreement lies on the diagonal and swap differences should be near zero. Both models show some agreement, but the pretrained model has substantially smaller deviations.

**译稿位置：** [T067 · 第 332 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L332)；**译文候选段首：** **几何一致性与互易性。** 图 15 对场景进行旋转或镜像，重新预测后把输出对齐回原坐标。如果模型与几何操作一致，应恢复相同的预测场。预训练模型具有更小的对齐误差。图 16 在固定布局中交换发射机与接收机。对探针所假设的互易传播条件，路径损耗应保持不变，因此两种方向的预测应位于对角线附近，交换差值应接近零。两类模型都在一定程度上呈现这一规律，但预训练模型偏差明显更小。

**自动匹配线索：** geometric→几何、consistency→一致、model→模型、loss→损耗、15、16。

### SYNTHETIC-P0107 · 页内坐标 x=239.1, y=483.1

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Rotation/reflection consistency on a synthetic scene sample

**译稿位置：** [T067 · 第 332 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L332)；**译文候选段首：** **几何一致性与互易性。** 图 15 对场景进行旋转或镜像，重新预测后把输出对齐回原坐标。如果模型与几何操作一致，应恢复相同的预测场。预训练模型具有更小的对齐误差。图 16 在固定布局中交换发射机与接收机。对探针所假设的互易传播条件，路径损耗应保持不变，因此两种方向的预测应位于对角线附近，交换差值应接近零。两类模型都在一定程度上呈现这一规律，但预训练模型偏差明显更小。

**自动匹配线索：** consistency→一致。

### SYNTHETIC-P0108 · 页内坐标 x=226.5, y=491.2

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Mirror left-right median |diff|=0.51 dB; p95=3.28 dB; R²=0.996

**译稿位置：** [T066 · 第 328 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L328)；**译文候选段首：** **稀疏观测。** 图 14 在图 12 的空房间输入中额外提供四个精确路径损耗观测点，稠密自由空间目标保持不变。这些点可使模型预测场在有限位置上得到锚定。预训练模型 RMSE 从 0.40 降至 0.19 dB。由于 ICASSP Task 3 没有稀疏观测训练，所以 T3 基线不是一项严格匹配的“学习使用稀疏支持”的对比。

### SYNTHETIC-P0109 · 页内坐标 x=309.3, y=491.2

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Mirror top-bottom median |diff|=0.43 dB; p95=3.29 dB; R²=0.996

**译稿位置：** [T066 · 第 328 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L328)；**译文候选段首：** **稀疏观测。** 图 14 在图 12 的空房间输入中额外提供四个精确路径损耗观测点，稠密自由空间目标保持不变。这些点可使模型预测场在有限位置上得到锚定。预训练模型 RMSE 从 0.40 降至 0.19 dB。由于 ICASSP Task 3 没有稀疏观测训练，所以 T3 基线不是一项严格匹配的“学习使用稀疏支持”的对比。

## PDF 第 25 页 · 提取候选 2 项

### SYNTHETIC-P0110 · 页内坐标 x=209.4, y=263.5

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Source-receiver reciprocity in a representative indoor layout: 22 points, 231 pairs

**译稿位置：** [T067 · 第 332 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L332)；**译文候选段首：** **几何一致性与互易性。** 图 15 对场景进行旋转或镜像，重新预测后把输出对齐回原坐标。如果模型与几何操作一致，应恢复相同的预测场。预训练模型具有更小的对齐误差。图 16 在固定布局中交换发射机与接收机。对探针所假设的互易传播条件，路径损耗应保持不变，因此两种方向的预测应位于对角线附近，交换差值应接近零。两类模型都在一定程度上呈现这一规律，但预训练模型偏差明显更小。

### SYNTHETIC-P0111 · 页内坐标 x=416.4, y=270.6

**原文章节（自动识别）：** 20 dB wall-loss MAPE=1.08%; median &#124;error&#124;=0.40 dB; R²=0.990。**目标译稿章节：** 附录 G：补充物理探针。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Swap difference distribution median |diff|=0.48 dB; p95=2.32 dB

**译稿位置：** [T067 · 第 332 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015.md#L332)；**译文候选段首：** **几何一致性与互易性。** 图 15 对场景进行旋转或镜像，重新预测后把输出对齐回原坐标。如果模型与几何操作一致，应恢复相同的预测场。预训练模型具有更小的对齐误差。图 16 在固定布局中交换发射机与接收机。对探针所假设的互易传播条件，路径损耗应保持不变，因此两种方向的预测应位于对角线附近，交换差值应接近零。两类模型都在一定程度上呈现这一规律，但预训练模型偏差明显更小。

## 暂未被自动指向的中文译段（14 项）

这些译段不一定多余；可能由一对多翻译或原文解析失误造成。

- T001 · 第 1 行 ·  · --- layout: page title: "大规模低成本合成预训练改善室内无线电地图预测｜中文译稿（待附录与逐式终校）" permalink: /papers/translations/2026-10-29-cheap-synthetic-pretraining-2610-19015…
- T002 · 第 14 行 ·  · **原题：** Scaling Cheap Synthetic Pretraining Improves Indoor Radio-Map Prediction **作者：** Khoren Petrosyan、Artashes Mkrtchyan、Rafayel Mkrtchyan、Hr…
- T003 · 第 22 行 · 摘要 · 真实测量数据过于有限，难以训练出能够适用于各种建筑物的高精度室内路径损耗预测器。大规模合成预训练提供了一条可行路线，但真实建筑平面图同样稀缺，而高精度射线追踪仿真器又往往缓慢、昂贵，且通常属于专有软件。本文同时解决这两个问题：提出一种自动生成多样化室内布局的生成器，以及一种能够为这些布局计…
- T009 · 第 36 行 · 1. 引言 · 主要贡献包括：
- T016 · 第 68 行 · 3. 室内无线电地图预测任务 · **输入表示。** 合成预训练和下游微调使用相同的特征转换器，生成固定顺序的 11 通道张量：墙体反射率、透射率、到发射机的欧氏距离、天线增益、四个对数频率 Fourier 通道、有效像素掩码、二值平面布局通道，以及稀疏测量通道。在自由空间，反射率与透射率设置为零。每个网格点的天线增益由方…
- T017 · 第 70 行 · 3. 室内无线电地图预测任务 · 载波频率在对数空间编码：
- T031 · 第 144 行 · 6. 实验结果 · 分别只用 200 万、400 万、800 万和 1600 万检查点拟合，在留出的 3200 万至 1.28 亿范围预测归一化平均值的 MAPE，ResNet101 为 3.33%，Swin-T 为 7.10%。ResNet101 的拟合式为
- T034 · 第 154 行 · 6. 实验结果 · 另外，在冻结 MLSP 迁移中删除材料通道后，0.5% 稀疏观测条件下，800 万至 6400 万规模带来的平均逐建筑增益从 0.252 dB 降至 0.121 dB（$p_{\mathrm{Holm}}=2.38\times10^{-6}$，25 座建筑）。如果材料和稀疏观测都不提供，误…
- T036 · 第 160 行 · 7. 真实测量数据的迁移 · RSSI 与预测路径损耗的关系为
- T037 · 第 166 行 · 7. 真实测量数据的迁移 · 其中网络预测的是路径损耗 $L$。由于发射功率未知，必须进行学习型校准。仅使用模型预测值时，岭回归拟合仿射关系 $\widehat{\mathrm{RSSI}}=a\widehat L+b$。
- T043 · 第 182 行 · 讨论与局限性 · 实际无线规划流程可以先使用广泛的程序化语料进行预训练，再借助较少量可信的仿真或测量数据适应目标环境，然后对新位置预测稠密地图。保真度实验提示应在“少量精确标签、大量近似标签、两者混合”之间权衡预算。不过，保真度研究固定的是样本数量，而非数据生成算力，如何实现计算资源最优分配仍未解决。其他受…
- T044 · 第 184 行 · 讨论与局限性 · 当前仿真器省略绕射、散射和三维传播。1600 万样本的反射深度实验不能证明模型对这些缺失效应或任意平面图生成器均具有鲁棒性。规模研究仅改变数据量，每种骨干网络使用一个预训练种子，没有同时建模参数量和算力。自监督、掩码预测、基础模型、领域自适应及生成式预训练等基线仍有待比较。小规模真实数据仅…
- T045 · 第 188 行 · 结论 · 低成本近似仿真能提高稀缺高质量室内无线电地图数据的利用价值。ResNet101 在五项公开排行榜任务上均获得改进；ResNet101 与 Swin-T 都呈现可预测的总体规模趋势，但后期检查点并非单调改善。仿真保真度和材料输入仍然重要，目标监督稀缺时尤其如此。冻结预测为校准后的真实 RSS…
- T046 · 第 192 行 · 致谢与资助披露 · 本研究部分获得 HESC MESCS RA 项目 22rl-052（DISTAL）和 NATO Science for Peace and Security Programme 项目 G9270（OASIS）资助。

## 跨栏或跨页续段检查清单（自动提示）

下列原文块可能属于同一个自然段的两个片段，也可能被公式、图、表或正文分段打断。仅按首尾字符检测，**不是已经确定的段落合并**。逐段核校时应依 PDF 版面确认并决定是否将两个 ID 合并。

- SYNTHETIC-P0042（第 7 页）→ SYNTHETIC-P0043（第 8 页）：前块末尾「vement nor degradation is established. Frozen MLSP models also」；后块开头「show diminishing returns around 8M, while fine-tuned transfer 」。
- SYNTHETIC-P0068（第 12 页）→ SYNTHETIC-P0069（第 13 页）：前块末尾「sion losses, and reflection losses. Transmission loss is added」；后块开头「when a ray exits a wall material region; reflection directions」。
- SYNTHETIC-P0094（第 20 页）→ SYNTHETIC-P0095（第 20 页）：前块末尾「Angular residual after removing radial trend」；后块开头「angular std median=1.81 dB; p95 |residual|=3.54 dB」。
