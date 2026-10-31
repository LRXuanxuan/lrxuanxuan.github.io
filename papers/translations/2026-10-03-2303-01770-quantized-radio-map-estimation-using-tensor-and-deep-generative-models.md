---
layout: page
title: "基于张量与深度生成模型的量化无线电地图估计｜中文全文译文"
permalink: /papers/translations/2026-10-03-2303-01770-quantized-radio-map-estimation-using-tensor-and-deep-generative-models/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e0ae0669ed8263c5/) · [原文 arXiv](https://arxiv.org/abs/2303.01770) · [全部目录](/papers/catalog/)

# 基于张量与深度生成模型的量化无线电地图估计

**原题：** Quantized Radio Map Estimation Using Tensor and Deep Generative Models  
**作者：** Subash Timilsina、Sagar Shrestha、Xiao Fu  
**单位：** 俄勒冈州立大学电气工程与计算机科学学院（School of EECS, Oregon State University）。本工作部分受美国国家科学基金会（NSF）资助，项目号 NSF ECCS-2024058 与 NSF CCF-2210004。  
**版本：** arXiv:2303.01770v2（eess.SP），2023 年 8 月 23 日；原文 16 页（正文 + 参考文献 + 附录 A—D）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VII 节（含各小节与 Remark 1—2、Fact 1—3、Lemma 1—2、Assumption 1—3、Theorem 1—2）、结论、图 1—8 中文图注、表 I—IX 逐格转录、附录 A—D、参考文献 [1]—[55]（英文原条目，按原编号）均按原文结构录入；逐句逐式终校未做。

## 摘要

频谱制图（spectrum cartography, SC），又称无线电地图估计（radio map estimation, RME），旨在从有限的传感器测量构造多域（如频率与空间）的无线电功率传播图。早期方法往往缺乏理论支撑，而近期工作已证明：利用高维多域无线电信号的低维模型——如块项张量分解（block-term tensor decomposition, BTD）模型与某些深度生成模型（deep generative model, DGM）——可以**可证明地**恢复无线电地图。然而，这些已有的可证明 SC 方法都假设传感器把实值（全分辨率）测量发送到融合中心，这在实践中并不现实。本文提出一种量化 SC 框架，把基于 BTD 与 DGM 的 SC 推广到使用**重度量化**传感器测量的场景。我们提出高斯量化器下基于最大似然估计（maximum likelihood estimation, MLE）的 SC 框架，并在现实条件下（如不完美的无线电地图建模与含噪测量）刻画了基于 MLE 准则的无线电地图可恢复性。仿真与真实数据实验展示了所提方法的有效性。

**索引词：** 无线电地图估计、频谱制图、块项张量分解、深度生成模型、高斯量化。

## I. 引言

频谱制图（SC）[又称无线电地图估计（RME）]技术旨在从在地理区域上稀疏采集的有限传感器测量构造多域（如空间、频率与时间）无线电地图；参见 [1]–[8]。无线电地图刻画射频（RF）环境的关键特征（如干扰传播），因而对机会接入、频谱监测、波束成形、功率分配与干扰管理等任务至关重要，见 [9]。从信号处理角度看，从有限的传感器采样/测量估计多域、高维、高分辨率无线电地图是一个不适定逆问题——一般存在无穷多解，从而妨碍无线电地图的可恢复性。

早期 SC/RME 方法通常假设功率传播在空间上平滑，这使各种插值技术可用于 SC，如 Kriging 插值 [3]、薄板样条 [2]、核方法 [10] 与高斯径向基函数（RBF）[11]。某些域中无线电地图的稀疏表示也常被用于 SC，见 [2]、[4]、[5]、[12]。近年来，低秩矩阵与张量补全技术也被用于 SC，见 [6]、[13]–[15]。从低秩模型补全的角度看，其中一些方法已被证明能保证无线电地图的恢复，见 [6]、[15]。然而，稀疏性与低秩等人工设计的先验并不总与实际情况相符，尤其在存在强阴影时（例如拥挤的城市或室内环境），见 [7] 的讨论。

为更好建模强阴影环境，许多基于深度学习的方法被用于 SC。与基于人工先验的方法相比，基于深度学习的方法需要训练阶段，且往往需要大量训练数据，这带来训练与泛化方面的挑战；此外，这类工作大多缺乏理论支撑。为弥补这一点，近期工作 [7] 提出用深度生成模型（DGM）对**每个发射机的空间损耗场（spatial loss field, SLF）**建模，从而在利用神经网络表示能力的同时保证可恢复性。这与用神经网络直接学习多发射机聚合无线电地图的早期做法 [8]、[18] 不同。

**动机：量化测量的必要性。** 上述可证明 SC 方法（包括基于 BTD 的 [6] 与基于 DGM 的 [7]）都假设传感器能把实值测量（如所有 $(i,j)\in\Omega$ 的 $\mathcal X(i,j,:)$）传送到融合中心（见 [2]–[7]）。然而，发送实值测量在通信开销上代价高昂，更现实的情形是传感器发送**量化**测量。量化频谱感知此前已有研究（见 [28]、[29] 以及"节俭感知（frugal sensing）"工作 [20]、[21]），但未考虑空间信息；[10] 用核回归处理量化 SC，但 [10] 假设发射机的 PSD 已知，而估计 PSD 本身就是一个难题 [22]、[23]。除有效方法缺失外，量化 SC 的理论层面也尚未被研究：虽然 [7] 的 DGM 框架与 [6] 的 BTD 框架在实值测量下提供了无线电地图的可证明恢复，但如何在不损失可恢复性支撑的前提下把这些结果推广到量化测量，仍是一个开放问题。

**贡献。** 本文提出具有真实无线电地图可恢复性保证的量化 SC 框架，具体贡献如下：

- **量化 SC 框架。** 我们提出一个可灵活适配多种无线电地图模型的量化 SC 框架。考虑传感器发送的测量是高斯量化器输出的设定，用最大似然估计（MLE）原理表述量化 SC 问题。我们把该量化策略与两种无线电地图模型结合：来自 [6] 的块项张量分解（BTD）与来自 [7] 的 DGM，并分别为其 MLE 表述设计算法。两种模型都动机充分且有用：前者部署更经济（无需训练数据），后者对强阴影更鲁棒。
- **可恢复性分析。** 在理论方面，我们证明：只要满足合理条件，张量模型与 DGM 两种无线电地图表示下的 MLE 准则都能保证恢复真值（误差有界）。特别地，我们证明即使低秩张量模型或 DGM 与真值并不完全匹配，框架仍具有可证明的恢复性。结果还揭示了模型复杂度与样本复杂度之间直观的权衡。我们的分析是对泛化误差分析与量化数据恢复的非平凡整合，并仔细考虑了 SC 语境下的感知范式。

本文部分工作将发表于 ICASSP 2023 [24]，其中介绍了基本思想与基于 DGM 的表述。期刊版本还额外包含：1) 无需离线训练的张量分解模型；2) DGM 与 BTD 两种模型下统一而详尽的可恢复性分析；3) 更全面的仿真；4) 真实数据实验。

**记号。** 用 $x\in\mathbb R$、$\mathbf x\in\mathbb R^n$、$\mathbf X\in\mathbb R^{I\times J}$、$\mathcal X\in\mathbb R^{I\times J\times K}$ 分别表示标量、向量、矩阵与张量。采用 Matlab 记号 $\mathbf X(i,:)$ 与 $\mathbf X(:,j)$ 表示矩阵的第 $i$ 行与第 $j$ 列；$\mathcal X(i,j,:)$ 表示张量的第 $(i,j)$ 条纤维（fiber）；$\mathcal X(i,j,k)$ 表示索引为 $i,j,k$ 的元素。$\circ$ 与 $\circledast$ 分别表示外积与 Hadamard 积。矩阵 $\mathbf U$ 与向量 $\mathbf v$ 的外积定义为 $\mathcal X=\mathbf U\circ\mathbf v$，即 $[\mathbf U\circ\mathbf v]_{i,j,k}=\mathbf U(i,j)\mathbf v(k)$。$\mathbf 0$ 与 $\mathbf 1$ 分别表示全零与全一向量；$\mathcal 0$ 与 $\mathcal 1$ 分别表示全零与全一张量。$\|\mathbf x\|_2$ 与 $\|\mathbf X\|_2$ 分别表示 $\ell_2$ 范数与谱范数；$\|\cdot\|_F$ 表示矩阵与张量的 Frobenius 范数。定义 $\|\mathcal X\|_\infty=\max_{i,j,k}|\mathcal X(i,j,k)|$；$|\mathcal X|$ 表示集合 $\mathcal X$ 的基数。对整数 $I$，集合 $[I]$ 表示 $\{1,\ldots,I\}$。$\mathcal L=\log(\mathcal X)$ 表示逐元素取对数的张量，即 $\mathcal L(i,j,k)=\log(\mathcal X(i,j,k))$。"$\geq$" 表示逐元素的"大于等于"（如 $\mathcal X\geq0$ 表示 $\mathcal X$ 的每个元素非负）。$\dot f(x)$ 表示 $f$ 在 $x$ 处的一阶导数。

## II. 背景

### A. 问题设定

我们关注图 1(a) 所示的 SC 场景，该场景在文献中被广泛考虑，见 [2]、[6]、[7]、[10]。具体而言，我们希望利用 $N$ 个传感器采集的测量，恢复由 $R$ 个发射机诱导的时空谱无线电功率密度图。传感器稀疏部署在感兴趣区域内。为便于说明，假设空间域为 2D 矩形并离散为 $I\times J$ 个网格（所提设计原则可容易推广到 3D 情形）；频率域离散为 $K$ 个频点——因此每个空间网格关联一个 $K$ 维功率谱密度（PSD）。换言之，$R$ 个发射机在 $K$ 个频率上的功率传播图样构成一个 $I\times J\times K$ 的无线电地图张量 $\mathcal X\in\mathbb R^{I\times J\times K}$，其元素 $\mathcal X(i,j,k)$ 是位置 $(i,j)$ 与频率 $k$ 处接收信号的 PSD。也就是说，张量的每条纤维 [25] $\mathcal X(i,j,:)$ 表示在位置 $(i,j)$ 测得接收信号的 PSD，见图 1(b)。用

$$
\Omega=\left\{(i,j)\ \middle|\ i\in[I],\ j\in[J]\right\}
$$

表示传感器位置集合。注意通常有 $|\Omega|=N\ll IJ$，即只有少量传感器可用。假设每个位于 $(i_s,j_s)$ 的传感器采集完整 PSD $\mathcal X(i_s,j_s,:)$，$s=1,\ldots,N$。若传感器能把实值反馈传给融合中心，则 SC 的目标就是在融合中心由传感器位置处的张量纤维 $\{\mathcal X(i,j,:)\}_{(i,j)\in\Omega}$ 恢复完整张量 $\mathcal X$。

### B. 可证明 SC 的已有工作

早期 SC 工作（见 [2]–[4]、[12]–[14]）多关注方法论，而较少考虑理论方面（如真值无线电地图的可恢复性）。近年来，对 SC 的理论理解受到越来越多的研究关注。本小节简要回顾两个被证明能保证无线电地图恢复的 SC 模型。

**1) 块项张量建模与可证明恢复。** 近期工作 [6] 从块项张量补全的角度提出一种可恢复性有保证的 SC 方法。该模型首先假设功率传播在感兴趣的频带内是相干的——当感兴趣频率的带宽与其中心频率之比不大时，该假设一般成立 [12]、[22]、[23]、[26]。在此情形下，无线电地图可分解为分别与空间信息和频谱信息相关联的潜因子 [2]、[6]、[7]、[10]：

$$
\mathcal X(i,j,k)=\sum_{r=1}^{R}\mathbf S_r(i,j)\mathbf c_r(k)\ \Longleftrightarrow\ \mathcal X=\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r,\tag{1}
$$

其中 $\mathbf S_r\in\mathbb R^{I\times J}$ 是发射机 $r$ 的空间损耗场（SLF），$\mathbf c_r\in\mathbb R^{K}$ 是发射机 $r$ 的 PSD，$\circ$ 表示外积。SLF 刻画发射机的空间功率传播特性，PSD 反映发射机的频带占用。

文献 [6] 把式（1）中的每个 SLF $\mathbf S_r$ 建模为低秩矩阵，即

$$
\mathbf S_r=\mathbf A_r\mathbf B_r^{\top},
$$

其中 $\mathbf A_r\in\mathbb R^{I\times L}$、$\mathbf B_r\in\mathbb R^{J\times L}$，且 $\operatorname{rank}(\mathbf A_r)=\operatorname{rank}(\mathbf B_r)=L\ll\min\{I,J\}$。图 2 展示了该模型。$\mathbf S_r$ 的这种低秩模型把式（1）与一种张量模型——多线性秩为 $(L,L,1)$ 的块项张量分解（BTD）[27]——联系起来。

该模型动机充分：单个 SLF 往往在空间域上高度相关，使 $\mathbf S_r$ 近似低秩，数值证据见 [6]。利用无线电地图的 BTD 模型，SC 问题表述为

$$
\min_{\{\mathbf c_r,\mathbf A_r,\mathbf B_r\}_{r=1}^{R}}\left\|\mathcal M_{\mathrm{sens}}\circledast\left(\mathcal X-\sum_{r=1}^{R}\left(\mathbf A_r\mathbf B_r^{\top}\right)\circ\mathbf c_r\right)\right\|_F^2,\tag{2}
$$

其中 $\mathcal M_{\mathrm{sens}}$ 是感知掩码张量：若 $(i,j)\in\Omega$ 则 $\mathcal M_{\mathrm{sens}}(i,j,:)=\mathbf 1\in\mathbb R^{K}$，否则 $\mathcal M_{\mathrm{sens}}(i,j,:)=\mathbf 0$。值得注意的是，[6] 利用 BTD 模型的本质唯一性证明：在随机与规则采样模式下，时空谱无线电地图都是可证明可恢复的。

**2) 基于深度生成模型（DGM）的可证明 SC。** 近年来，基于深度学习的 SC 受到广泛关注，原因是深度神经网络能以简约方式表示非常复杂、强阴影的场景，从而在挑战性场景中提升 SC 性能。然而，多数早期尝试（如 [8]、[18]）把 SC 问题表述为有监督的图像修补网络学习问题。由于无线电地图的潜状态空间往往极大，该表述在训练与泛化上面临挑战；此外，这条研究路线缺乏理论支撑。

为在利用深度神经网络表示能力的同时保证可恢复性，文献 [7] 提供了另一种方案，可视为 [6] 中模型的扩展。意识到 [6] 的 SLF 低秩模型在实践中并不总成立，[7] 用数据驱动的 DGM 对每个发射机的 SLF 建模：具体地，[7] 通过按物理模型仿真大量 SLF 来学习 SLF 的 DGM，于是每个 $\mathbf S_r$ 可近似为

$$
\mathbf S_r\approx g_\theta(\mathbf z_r),\tag{3}
$$

其中 $g_\theta(\cdot):\mathbb R^{D}\to\mathbb R^{I\times J}$ 是把"潜嵌入" $\mathbf z_r\in\mathbb R^{D}$（$D\ll IJ$）映射为 SLF 的深层生成神经网络，见图 3。DGM 离线学习，例如通过自编码器、变分自编码器（VAE）或生成对抗网络（GAN），见图 4。利用学到的 DGM $g_\theta(\mathbf z_r)$，SC 问题被表述为

$$
\min_{\{\mathbf c_r,\mathbf z_r\}_{r=1}^{R}}\left\|\mathcal M_{\mathrm{sens}}\circledast\left(\mathcal X-\sum_{r=1}^{R}g_\theta(\mathbf z_r)\circ\mathbf c_r\right)\right\|_F^2.\tag{4}
$$

该方法用 DGM 描述**每个** SLF（而非像 [6]、[18] 那样描述整个无线电地图）。因此，与 [8]、[18] 中用神经网络学习多发射机聚合无线电地图的网络相比，该 DGM 在训练阶段容易学习得多——因为每个 SLF 的"状态空间"远小于聚合无线电地图的状态空间，更多讨论见 [7]。[7] 还证明，在合理条件下式（4）可保证无线电地图的恢复。

> **注 1：** 基于 BTD 与基于 DGM 的方法各有优缺点。BTD 模型实现简单，但其关键局限在于为 SLF 指定的低秩先验：当空间相关性变弱时 $\mathbf S_r$ 的低秩性可能被破坏——这通常发生在存在强阴影效应的环境（如城区）中。基于 DGM 的方法能借助 $g_\theta(\cdot)$ 的神经表示"编码"复杂的非解析先验信息，适合建模强阴影情形；此外，DGM 参数化可显著减少未知参数数量（若 $\operatorname{card}(\mathbf z_r)=D\ll IJ$），从而大幅降低 SC 的样本复杂度。但其代价是需要额外的离线训练阶段；而为生成训练数据来学习 $g_\theta(\cdot)$，需要一定程度地了解阴影情况——这些在 BTD 工作 [6] 中并不需要。因此两种模型都有用且有意义，模型的选择取决于所关注的场景。

### C. 挑战——量化 SC 方法的缺失

包括基于 BTD 与基于 DGM 的方法在内，多数已有 SC 工作都假设实值测量（如所有 $(i,j)\in\Omega$ 的 $\mathcal X(i,j,:)$）可被传送到融合中心（见 [2]–[7]）。然而，发送实值测量在通信开销上是昂贵的，传感器发送量化测量要现实得多。量化频谱感知此前已有研究（如 [28]、[29] 以及"节俭感知"工作 [20]、[21]），但未考虑空间信息；量化 SC 在 [10] 中用核回归处理，但 [10] 假设发射机的 PSD 已知，而估计 PSD 本身就是难题 [22]、[23]。除有效方法缺失外，量化 SC 的理论层面也有待研究：虽然 [7] 的 DGM 框架与 [6] 的 BTD 框架在实值测量下提供了可证明的无线电地图恢复，但如何把这些结果推广到量化测量而不损失可恢复性支撑，仍是一个开放问题。

## III. 提出的方法

本文提出量化 SC 框架，其中传感器只反馈重度量化测量。具体地，我们将设计一个可灵活适配 [6] 与 [7] 中 BTD、DGM 无线电地图模型的系统。

### A. 感知与量化

沿用第 II-A 节设定，假设位于 $(i,j)$ 的传感器可采集接收信号的 PSD，即 $\mathcal X(i,j,:)\in\mathbb R^{K}$；并考虑传感器发送 $\mathcal X(i,j,:)$ 量化版本的场景。具体地，采用量化器 $Q(\cdot):\mathbb R\to\mathbb Z$，把 $(i,j)$ 处接收 PSD 的每个元素映射为整数，即 $Y(i,j,k)=Q(\mathcal X(i,j,k))$，$k=1,\ldots,K$，其中 $\mathbf Y(i,j,:)\in\mathbb Z^K$ 为量化 PSD。

我们采用文献中广泛使用的高斯量化策略 [30]–[36]，具体表述为

$$
Y(i,j,k)=Q\left(h(\mathcal X(i,j,k))+V(i,j,k)\right),\tag{5}
$$

$$
Q(x)=q,\quad\text{若 }b_{q-1}<x\leq b_q,\ q\in[Q],
$$

其中 $V(i,j,k)\sim\mathcal N(0,\sigma^2)$ 是对所有 $i,j,k$ 独立同分布的零均值高斯噪声，$\{b_q\}_{q=1}^{Q}$ 为预先指定的量化边界（即 $[b_{q-1},b_q]$ 是第 $q$ 个量化区间）。此处 $h(\cdot)$ 是可逆变换函数

$$
h(x)=\log(x+a),\tag{6}
$$

其中 $a>0$。为记号简洁，我们对元素与张量都使用 $h$，即 $h(\mathcal X)$ 表示对 $\mathcal X$ 的每个元素施行（6）的变换。注意经典高斯量化中不使用 $h(\cdot)$；本文用该函数控制数据的动态范围（进一步讨论见第 IV-C 节）。由于 $h$ 可逆，它不损失 $\mathcal X$ 的信息，即由量化数据恢复 $h(\mathcal X)$ 即可恢复 $\mathcal X$。

像（5）这样加入人工噪声的量化在信号处理中称为"抖动（dithering）"[37]。抖动有助于在量化版本中保留更多原始信号信息，因为它降低了量化误差与原始信号之间的相关性 [38]。

### B. 最大似然估计

令 $\mathcal M=h(\mathcal X)$ 为变换后的无线电地图测量。量化观测 $\mathcal Y$ 的分布为

$$
Y(i,j,k)=q\ \text{ 以概率 } f_q(\mathcal M(i,j,k)),\quad\forall(i,j)\in\Omega,\ k\in[K],\tag{7}
$$

其中 $f_q$ 定义为

$$
\begin{aligned}
f_q(\mathcal M(i,j,k))&=\Pr\left(Y(i,j,k)=q\mid\mathcal M(i,j,k)\right)\\
&=\Phi\left(b_q-\mathcal M(i,j,k)\right)-\Phi\left(b_{q-1}-\mathcal M(i,j,k)\right),
\end{aligned}\tag{8}
$$

其中 $\Phi(x)$ 是零均值、方差 $\sigma^2$ 高斯变量的累积分布函数（CDF），即（5）中抖动噪声的 CDF。利用（8）与某种无线电地图参数化，可把 SC 问题表述为 MLE 问题。下面分别用 [6] 的 BTD 模型与 [7] 的 DGM 模型给出两种 MLE 准则。

**1) 基于 BTD 的量化 SC。** 与 [6] 一样，先用 BTD 模型（见图 2）表示无线电地图，即

$$
\mathcal X^{\mathrm{BTD}}=\sum_{r=1}^{R}\left(\mathbf A_r\mathbf B_r^{\top}\right)\circ\mathbf c_r.
$$

按第 III-A 节的感知与量化流程，融合中心收到量化且不完整的张量 $\mathcal Y(\Omega,:)$。为恢复真值无线电地图，考虑如下 MLE：

$$
\min_{(\mathbf A,\mathbf B,\mathbf C)\in\mathcal S^{\mathrm{BTD}}}\mathcal F_{\Omega,\mathcal Y}^{\mathrm{BTD}}(\mathbf A,\mathbf B,\mathbf C),\tag{9}
$$

其中目标函数为

$$
\mathcal F_{\Omega,\mathcal Y}^{\mathrm{BTD}}(\mathbf A,\mathbf B,\mathbf C)=-\sum_{(i,j)\in\Omega}\sum_{k=1}^{K}\sum_{q=1}^{Q}\mathbf 1\left[Y(i,j,k)=q\right]\log\left(f_q\left(h\left(\mathcal X^{\mathrm{BTD}}(i,j,k)\right)\right)\right),
$$

其中 $\mathcal X^{\mathrm{BTD}}(i,j,k)=\left[\sum_{r=1}^{R}\left(\mathbf A_r\mathbf B_r^{\top}\right)\circ\mathbf c_r\right]_{i,j,k}$，$\mathbf A_r\in\mathbb R^{I\times L}$、$\mathbf B_r\in\mathbb R^{J\times L}$、$\mathbf C=[\mathbf c_1,\ldots,\mathbf c_R]$。此外使用记号 $\mathbf A=[\mathbf A_1,\ldots,\mathbf A_R]$ 与 $\mathbf B=[\mathbf B_1,\ldots,\mathbf B_R]$。约束集定义为

$$
\mathcal S^{\mathrm{BTD}}=\left\{(\mathbf A,\mathbf B,\mathbf C)\ \middle|\ \mathbf A\geq0,\ \mathbf B\geq0,\ \mathbf C\geq0,\ \|\mathbf A_r\|_F\leq\sqrt{\beta},\ \|\mathbf B_r\|_F\leq\sqrt{\beta},\ \|\mathbf c_r\|_2\leq\kappa,\ \forall r\in[R]\right\}.\tag{10}
$$

（10）中的约束意味着 SLF 与 PSD 都非负且有界（$\|\mathbf S_r\|_F\leq\beta$）——按其物理意义，这些都是温和假设。特别地，我们假设 $\mathbf S_r=\mathbf A_r\mathbf B_r^{\top}$ 的非负性与有界性通过约束 BTD 模型的潜因子实现。相应地，定义集合

$$
\mathcal X^{\mathrm{BTD}}=\left\{\mathcal X\ \middle|\ \mathcal X=\sum_{r=1}^{R}\left(\mathbf A_r\mathbf B_r^{\top}\right)\circ\mathbf c_r,\ (\mathbf A,\mathbf B,\mathbf C)\in\mathcal S^{\mathrm{BTD}}\right\}.\tag{11}
$$

**2) 基于 DGM 的量化 SC。** 如前所述，当空间区域存在强阴影时，基于 BTD 的方法可能效果不佳 [7]。此时自然采用（3）的 DGM 参数化无线电地图，即

$$
\mathcal X^{\mathrm{DGM}}=\sum_{r=1}^{R}g_\theta(\mathbf z_r)\circ\mathbf c_r,\tag{12}
$$

其中 $g_\theta(\cdot)$ 按 [7] 离线学习，见图 3。（12）的无线电地图模型导出如下基于 MLE 的恢复准则：

$$
\min_{(\mathbf C,\mathbf Z)\in\mathcal S^{\mathrm{DGM}}}\mathcal F_{\Omega,\mathcal Y}^{\mathrm{DGM}}(\mathbf Z,\mathbf C),\tag{13}
$$

其中

$$
\mathcal F_{\Omega,\mathcal Y}^{\mathrm{DGM}}(\mathbf Z,\mathbf C)=-\sum_{(i,j)\in\Omega}\sum_{k=1}^{K}\sum_{q=1}^{Q}\mathbf 1\left[Y(i,j,k)=q\right]\log\left(f_q\left(h\left(\mathcal X^{\mathrm{DGM}}(i,j,k)\right)\right)\right),\tag{14}
$$

其中 $\mathcal X^{\mathrm{DGM}}(i,j,k)=\left[\sum_{r=1}^{R}g_\theta(\mathbf z_r)\circ\mathbf c_r\right]_{i,j,k}$，$\mathbf C=[\mathbf c_1,\ldots,\mathbf c_R]$，$\mathbf Z=[\mathbf z_1,\ldots,\mathbf z_R]$。约束集定义为

$$
\mathcal S^{\mathrm{DGM}}=\left\{(\mathbf C,\mathbf Z)\ \middle|\ g_\theta(\mathbf z_r)\geq0,\ \mathbf C\geq0,\ \|g_\theta(\mathbf z_r)\|_F\leq\beta,\ \|\mathbf c_r\|_2\leq\kappa,\ \forall r\in[R]\right\},\tag{15}
$$

其中 $\beta$、$\kappa$ 为正的常数。与前面类似，定义数据域中的对应集合：

$$
\mathcal X^{\mathrm{DGM}}=\left\{\mathcal X\ \middle|\ \mathcal X=\sum_{r=1}^{R}g_\theta(\mathbf z_r)\circ\mathbf c_r,\ (\mathbf Z,\mathbf C)\in\mathcal S^{\mathrm{DGM}}\right\}.\tag{16}
$$

与连续测量情形一致（参见注 1），当训练数据不可用或训练成本不可承受时，（9）的基于 BTD 的表述更合适；（13）的基于 DGM 的表述具有更强的模型表达能力，在强阴影等挑战性场景中可获得更高的恢复精度。

## IV. 优化与实现

本节给出处理（9）与（13）中 MLE 问题的算法。

### A. 基于 BTD 的 MLE 算法

为求解问题（9），考虑如下重表述的近似问题：

$$
\min_{\mathbf A,\mathbf B,\mathbf C}\ \mathcal L_{\Omega,\mathcal Y}(\mathbf A,\mathbf B,\mathbf C)\tag{17}
$$

$$
\text{s.t.}\ \mathbf A\geq0,\ \mathbf B\geq0,\ \mathbf C\geq0,
$$

其中目标函数为

$$
\mathcal L_{\Omega,\mathcal Y}(\mathbf A,\mathbf B,\mathbf C)=\mathcal F_{\Omega,\mathcal Y}^{\mathrm{BTD}}(\mathbf A,\mathbf B,\mathbf C)+\lambda_1r_1(\mathbf A)+\lambda_2r_2(\mathbf B)+\lambda_3r_3(\mathbf C),
$$

其中正则项为 $r_i(\cdot)=\|\cdot\|_F^2$，$i=1,2,3$。注意促使 $\|\mathbf A\|_F^2$ 与 $\|\mathbf B\|_F^2$ 较小会鼓励低能量 SLF $\|\mathbf A_r\mathbf B_r^{\top}\|_F$，因此这类正则项间接施加（10）中 SLF 与 PSD 有界的约束。不过，用正则化重表述代替（10）的显式约束更便于设计优化算法。

我们提出块坐标下降（block coordinate descent, BCD）过程处理（17）。在第 $k$ 次迭代，先如下更新 $\mathbf C$：

$$
\mathbf C^{(k+1)}\leftarrow\max\left(\mathbf C^{(k)}-\xi_3^{(k)}\nabla_{\mathbf C}\left(\mathcal L_{\Omega,\mathcal Y}\left(\mathbf A^{(k)},\mathbf B^{(k)},\mathbf C^{(k)}\right)+\lambda_3r_3(\mathbf C)\right),\mathbf 0\right),\tag{18}
$$

其中 $\nabla_{\mathbf C}(\cdot)$ 是 $\mathcal F_{\Omega,\mathcal Y}$ 关于 $\mathbf C$ 的梯度相关方向。利用关于 $\mathbf C$ 的梯度，方向 $\nabla_{\mathbf C}(\cdot)$ 可用常用方法（如朴素梯度法，以及 Adagrad [40] 与 Adam [41] 等带动量的方法）求得，$\xi_3^{(k)}$ 为步长。"$\max(\cdot,0)$" 步骤把更新后的 $\mathbf C^{(k)}$ 投影回非负象限。

类似地，$\mathbf A$ 与 $\mathbf B$ 的更新为

$$
\mathbf A^{(k+1)}\leftarrow\max\left(\mathbf A^{(k)}-\xi_1^{(k)}\nabla_{\mathbf A}\left(\mathcal L_{\Omega,\mathcal Y}\left(\mathbf A^{(k)},\mathbf B^{(k)},\mathbf C^{(k)}\right)+\lambda_1r_1(\mathbf A)\right),\mathbf 0\right),\tag{19}
$$

$$
\mathbf B^{(k+1)}\leftarrow\max\left(\mathbf B^{(k)}-\xi_2^{(k)}\nabla_{\mathbf B}\left(\mathcal L_{\Omega,\mathcal Y}\left(\mathbf A^{(k)},\mathbf B^{(k)},\mathbf C^{(k)}\right)+\lambda_2r_2(\mathbf B)\right),\mathbf 0\right),\tag{20}
$$

其中 $\xi_1^{(k)}$、$\xi_2^{(k)}$ 分别为 $\mathbf A$、$\mathbf B$ 更新的步长。实践中，步长参数可按 Adagrad 或 Adam 所建议的启发式选取，通常有效。算法终止后，估计的无线电地图 $\widehat{\mathcal X}$ 由

$$
\widehat{\mathcal X}=\sum_{r=1}^{R}\left(\widehat{\mathbf A}_r\widehat{\mathbf B}_r^{\top}\right)\circ\widehat{\mathbf c}_r
$$

得到，其中 $\widehat{\mathbf A}_r$、$\widehat{\mathbf B}_r$、$\widehat{\mathbf c}_r$ 为算法解。上述过程是典型的不精确 BCD 方法，其收敛性质已被充分研究，见 [42]。（18）—（20）的算法称为基于 BTD 的量化频谱制图（QuantSC-BTD）。

### B. 基于 DGM 的 MLE 算法

问题（13）可用类似思路处理。为此考虑如下重表述：

$$
\min_{\mathbf C,\mathbf Z}\ \mathcal L_{\Omega,\mathcal Y}(\mathbf Z,\mathbf C)\tag{21}
$$

$$
\text{s.t.}\ \mathbf C\geq0,
$$

其中

$$
\mathcal L_{\Omega,\mathcal Y}(\mathbf Z,\mathbf C)=\mathcal F_{\Omega,\mathcal Y}^{\mathrm{DGM}}(\mathbf Z,\mathbf C)+\mu_1q_1(\mathbf Z)+\mu_2q_2(\mathbf C).
$$

实践中 $q_1(\cdot):\mathbb R^{R\times D}\to\mathbb R$ 用于正则化 $\mathbf Z$（从而也正则化 $\mathbf S_r=g_\theta(\mathbf z_r)$）。本文取

$$
q_1(\mathbf Z)=\sum_{r=1}^{R}\|\mathbf z_r\|_2^2=\|\mathbf Z\|_F^2,
$$

它鼓励解降低所找到 SLF 的欧氏范数，使（15）的设定更可能成立。与前面类似，取 $q_2(\mathbf C)=\|\mathbf C\|_F^2$。对 $\mathbf C$ 的非负约束再次反映其物理意义。注意 $\mathbf Z$ 无需非负，因此潜嵌入没有此类约束。SLF 非负且有界，因此 $g_\theta(\cdot)$ 在输出层使用 sigmoid 激活，使 $\|\widehat{\mathbf S}_r\|_\infty\leq1$。这不损失一般性，也不损害可恢复性：假设 $\widehat{\mathbf S}_r=\mathbf S_r$、$\widehat{\mathbf c}_r=\mathbf c_r$ 被完美估计，总可取 $\widehat{\mathbf S}_r=\mathbf S_r/\|\mathbf S_r\|_\infty$（从而 $\|\widehat{\mathbf S}_r\|_\infty=1$）与 $\widehat{\mathbf c}_r=\|\mathbf S_r\|_\infty\mathbf c_r$；这种缩放/反向缩放不改变外积，即 $\widehat{\mathbf S}_r\circ\widehat{\mathbf c}_r=\mathbf S_r\circ\mathbf c_r$ 仍成立，意味着 $\widehat{\mathcal X}=\mathcal X$。

处理（21）的 BCD 算法与处理（17）的类似，只是仅更新两个块。第 $k$ 次迭代先以梯度投影更新 $\mathbf C$：

$$
\mathbf C^{(k+1)}\leftarrow\max\left(\mathbf C^{(k)}-\upsilon_2^{(k)}\nabla_{\mathbf C}\left(\mathcal L_{\Omega,\mathcal Y}\left(\mathbf Z^{(k)},\mathbf C^{(k)}\right)+\mu_2q_2(\mathbf C)\right),\mathbf 0\right).\tag{22}
$$

随后进行 $\mathbf Z$ 更新：

$$
\mathbf Z^{(k+1)}\leftarrow\mathbf Z^{(k)}-\upsilon_1^{(k)}\nabla_{\mathbf Z}\left(\mathcal L_{\Omega,\mathcal Y}\left(\mathbf Z^{(k)},\mathbf C^{(k)}\right)+\mu_1q_1(\mathbf Z)\right).\tag{23}
$$

由于涉及 DGM，关于 $\mathbf Z$ 的梯度相关方向可用基于反向传播的方法（也借助数值梯度工具）得到。算法停止后，由

$$
\widehat{\mathcal X}=\sum_{r=1}^{R}g_\theta(\widehat{\mathbf z}_r)\circ\widehat{\mathbf c}_r
$$

得到估计无线电地图，其中 $\widehat{\mathbf z}_r$、$\widehat{\mathbf c}_r$ 为算法解。（22）—（23）的算法称为基于 DGM 的量化 SC（QuantSC-DGM）。

### C. 量化区间设计

量化无线电地图的一个挑战是跨空间的 PSD 值极度偏斜（见图 5），直接应用简单量化器（如均匀量化器）效果不佳。如前所述，我们建议在量化前施行（6）的对数变换。回顾该变换为 $h(x)=\log(x+a)$（$a>0$），它"压缩"无线电地图的动态范围。对数变换常用于非负数据的量化与预处理，见 [43]。

对数变换之后，（5）中的 $b_q$ 可通过使每个区间大致包含相同数量的数据点（即 $\mathcal X(i,j,k)$）来确定。该策略已用于矩阵与张量补全文献 [44]、[45] 并被证明有效。其直觉是希望对所有量化级做"最大利用"。在 SC 系统中，$\{b_q\}$ 应在部署前由系统设计者确定。建议步骤如下：1) 系统从一组被认为能合理反映感兴趣区域 RF 状况的环境参数生成一组仿真无线电地图；2) 用仿真数据按下述准则学习 $b_q$（$q\in[Q]$）：

$$
b_q=\inf\left\{m\ \middle|\ \frac{q-1}{Q-1}\leq F(m),\ m=h(x)\right\},\quad\forall q=2,\ldots,Q-1,
$$

其中 $F(m)$ 是仿真 $\mathcal M$ 各元素的经验 CDF，并设 $b_0=-\infty$、$b_Q=+\infty$；我们用大量（如 1,000 个）仿真无线电地图计算分箱边界并取平均；3) 融合中心把 $\{b_1,\ldots,b_Q\}$ 广播给所有传感器，传感器再用 $b_q$ 实现其量化器。

## V. 可恢复性分析

本节分别给出（9）与（13）所表述问题的可恢复性分析。

### A. 技术准备

容易看到如下事实成立：

**事实 1：** 对 $\mathcal X\in\mathcal X^{\mathrm{BTD}}$ 与 $\mathcal X\in\mathcal X^{\mathrm{DGM}}$，总存在 $\alpha_{\mathrm{BTD}}\in[0,\infty)$ 与 $\alpha_{\mathrm{DGM}}\in[0,\infty)$ 使得

$$
\|\mathcal X\|_\infty\leq\alpha,\tag{24}
$$

其中若 $\mathcal X\in\mathcal X^{\mathrm{BTD}}$ 则 $\alpha=\alpha_{\mathrm{BTD}}$，若 $\mathcal X\in\mathcal X^{\mathrm{DGM}}$ 则 $\alpha=\alpha_{\mathrm{DGM}}$。

**证明：** 由于构成 $\mathcal X^{\mathrm{BTD}}$ 与 $\mathcal X^{\mathrm{DGM}}$ 中 $\mathcal X$ 的潜因子有界，命题成立；见（10）与（15）。

由于框架用对数变换预处理传感器采集的数据，后续分析需要如下引理：

**引理 1：** 令 $h(\mathcal X)$ 表示满足 $[h(\mathcal X)]_{i,j,k}=\log(\mathcal X(i,j,k)+a)$ 的张量，其中 $\mathcal X\geq0$、$a>0$。假设 $\|\mathcal X\|_\infty\leq\alpha$。则对 $\mathcal X\neq\mathcal X'$ 有

$$
\frac{1}{\alpha+a}\leq\frac{\left\|h(\mathcal X)-h(\mathcal X')\right\|_F}{\left\|\mathcal X-\mathcal X'\right\|_F}\leq\frac1a.\tag{25}
$$

该引理说明 $h(\cdot)$ 在自变量非负时保持连续性。参数 $a>0$ 用于避免映射值趋于 $-\infty$，实践中它可取一个无关紧要的小值（即不会主导输入信号的值）。证明见附录 B。后面还会用到如下事实：

**事实 2：** 令 $\mathcal X\in\{\mathcal X^{\mathrm{BTD}},\mathcal X^{\mathrm{DGM}}\}$，$\mathcal M=\{h(\mathcal X)\mid\forall\mathcal X\in\mathcal X\}$。若对所有 $\ell,j\in[Q]$ 且 $\ell\neq j$ 都有 $b_\ell\neq b_j$，则总存在有界常数 $U_\alpha$、$L_\alpha$、$F_\alpha$ 使得

$$
U_\alpha:=\sup_m\max_{\ell\in[Q]}\log\left(\frac1{f_\ell(m)}\right),\tag{26a}
$$

$$
L_\alpha:=\sup_m\max_{\ell\in[Q]}\frac{\left|\dot f_\ell(m)\right|}{f_\ell(m)},\tag{26b}
$$

$$
F_\alpha:=\inf_m\max_{\ell\in[Q]}\frac{\left(\dot f_\ell(m)\right)^2}{f_\ell(m)},\tag{26c}
$$

其中 $\alpha$ 如事实 1 所定义。事实 2 的证明见附录 C。事实 2 意味着：若无线电地图测量有界，则 $f_\ell(\cdot)$ 不会变化过快，且（至少对某个 $\ell\in[Q]$）不会变化过慢，这分别体现在 $L_\alpha$ 与 $F_\alpha$ 上。这些参数的存在使该函数在局部类似于具有梯度 Lipschitz 连续性与强凸性的函数；见 [30]、[46] 的讨论。

### B. BTD 模型下的可恢复性

先分析（17）的可恢复性。在此之前需说明：前几节为表述简洁略微滥用记号，用 $\mathcal X$、$\mathbf S_r$、$\mathbf c_r$ 等同时表示真值参数与优化变量（例如（17））。后续为分析清晰，我们将用 $\natural$ 表示真值参数（如 $\mathbf C^{\natural}$），以区别于优化变量（如（17）中的 $\mathbf C$）。作如下假设：

**假设 1：** 存在常数 $\nu_{\mathrm{BTD}}\in[0,+\infty)$ 使得

$$
\min_{\mathcal X\in\mathcal X^{\mathrm{BTD}}}\left\|\mathcal X-\mathcal X^{\natural}\right\|_\infty\leq\nu_{\mathrm{BTD}},\tag{27}
$$

其中 $\mathcal X^{\natural}$ 表示真值无线电地图。

$\nu_{\mathrm{BTD}}>0$ 的存在是合理的，它可能源于感知噪声，也可能仅由建模误差造成。

**定理 1：** 假设假设 1 成立。设 $\Omega$ 从 $[I]\times[J]$ 中以有放回方式均匀采样，且 $N=|\Omega|$。定义 $\mathcal X^{\star}=\sum_{r=1}^{R}\left(\mathbf A_r^{\star}\mathbf B_r^{\star\top}\right)\circ\mathbf c_r^{\star}$，其中

$$
\left(\mathbf A^{\star},\mathbf B^{\star},\mathbf C^{\star}\right)=\arg\min_{(\mathbf A,\mathbf B,\mathbf C)\in\mathcal S^{\mathrm{BTD}}}\mathcal F_{\Omega,\mathcal Y}^{\mathrm{BTD}}(\mathbf A,\mathbf B,\mathbf C)\tag{28}
$$

是（9）中 BTD-MLE 准则的最优解。则以至少 $1-2\delta$ 的概率有

$$
\frac{\left\|\mathcal X^{\star}-\mathcal X^{\natural}\right\|_F^2}{IJK}\leq\frac{8C_1C_2(1+\tau)}{K}\sqrt{\frac RN}+U_\alpha C_1\sqrt{\frac{\log(1/\delta)}{2N}}+U_\alpha C_1\sqrt{\frac{8\log(2/\delta)}{N}}+C_1C_2\nu_{\mathrm{BTD}},\tag{29}
$$

其中 $\tau=3\left(\sqrt{((I+J)L+K)\log(3\sqrt R(\beta+\kappa))}+\sqrt{K\log(\kappa/2)}+(I+J)L\log(\beta)\right)$，$\beta$、$\kappa$ 在（10）中定义；常数 $C_1$ 与 $C_2$ 为 $C_1=4(\alpha+a)^2/F_\alpha$、$C_2=L_\alpha/a$。证明见附录 D-B。

定理 1 表明，若 $N=|\Omega|$ 足够大且基于张量的表示误差（即 $\nu_{\mathrm{BTD}}$）相当小，则（9）最优解的均方误差（MSE）能够逼近真值 $\mathcal X^{\natural}$。结果还表明 $N=\Omega\left(\frac{((I+J)L+K)R\log(3\sqrt R(\beta+\kappa))}{K^2}\right)$ 是足以保证可证明恢复的样本复杂度，与未知参数数量同阶。这与此前矩阵/张量补全文献在其他低秩模型下的结果一致 [30]–[34]。

> **注 2：** [33] 研究了 1 比特量化下低秩张量的可恢复性，但用的是 CPD（canonical polyadic decomposition）模型；[33]、[34]、[36] 考虑了多级量化下的张量补全，但同样是在 CPD 与 Tucker 等张量模型下。本文在 BTD 模型下表述问题，该模型更适合 SC 问题。[6] 在另一设定下考虑过 BTD 模型下无线电地图张量的可恢复性，但那里的采样模式是确定性的且不涉及量化（类似设定也用于高光谱超分辨 [47]），因此其证明走的是完全不同的路线——利用 BTD 的本质唯一性，而本文并不需要这一点。[33]、[34]、[36] 中的随机采样与量化设定与本文更接近，但这些工作中的数据获取是独立采样张量元素；而本文关注传感器可采样整个 PSD $\mathcal X(i,j,:)$ 的场景，即纤维采样（fiber sampling）情形 [25]。我们的证明推广了 [33]、[34]、[36] 的结果，并仔细处理了这些差异。

### C. DGM 模型下的可恢复性

无线电地图（13）在 DGM 下的证明走类似的技术路线，只是需要仔细推导 DGM 的"复杂度度量"。与上一小节一样，作如下假设：

**假设 2：** 存在常数 $\nu_{\mathrm{DGM}}\in[0,+\infty)$ 使得

$$
\min_{\mathcal X\in\mathcal X^{\mathrm{DGM}}}\left\|\mathcal X-\mathcal X^{\natural}\right\|_\infty\leq\nu_{\mathrm{DGM}}.\tag{30}
$$

理想情况下，若 $g_\theta(\cdot)$ 是万能函数逼近器，则 $\nu_{\mathrm{DGM}}$ 应为零（假设不存在其他类型噪声）。但实践中 $g_\theta(\cdot)$ 由有限深度/宽度的神经网络表示，永远不是万能的，因此存在非零的 $\nu_{\mathrm{DGM}}$。若神经网络 $g_\theta(\cdot)$ 表达能力更强，$\nu_{\mathrm{DGM}}$ 可减小；更强的网络通常具有更深更宽的结构，参数量也更大。

还作如下结构假设：

**假设 3：** 生成网络是 $L$ 层神经网络

$$
g_\theta(\mathbf z)=\operatorname{mat}\left(\zeta_L\left(\mathbf A_L\left(\cdots\zeta_1\left(\mathbf A_1\mathbf z\right)\right)\right)\right),\tag{31}
$$

其中 $\operatorname{mat}(\cdot):\mathbb R^{IJ}\to\mathbb R^{I\times J}$ 把向量重塑为矩阵（即向量化的逆操作），$\mathbf A_\ell\in\mathbb R^{D_\ell\times D_{\ell-1}}$ 是第 $\ell$ 层的网络权重（$D_0=D$、$D_L=IJ$），$\zeta_\ell(\cdot)=[\zeta(\cdot),\ldots,\zeta(\cdot)]^{T}:\mathbb R^{D_\ell}\to\mathbb R^{D_\ell}$ 是 $\phi_\ell$-Lipschitz 激活函数（其中 $\zeta(\cdot):\mathbb R\to\mathbb R$），且 $P=\prod_{\ell=1}^{L}\phi_\ell\|\mathbf A_\ell\|_2<\infty$。此外潜嵌入 $\mathbf z$ 来自有界集合，即 $\mathbf z\in\mathcal Z=\{\mathbf z\in\mathbb R^{D}:\|\mathbf z\|_2\leq q\}$。

假设 3 沿用 [7] 的设定，刻画生成神经网络的结构。注意许多常用激活函数都是 Lipschitz 连续的，如 ReLU、sigmoid 与 tanh；此外（31）把多层感知机（MLP）与卷积神经网络（CNN）等许多深度网络结构作为特例包含在内。

在上述假设下，我们给出如下可恢复性定理：

**定理 2：** 假设假设 2 与假设 3 成立。设 $\Omega$ 从 $[I]\times[J]$ 中均匀采样，且 $|\Omega|=N$。定义 $\mathcal X^{\star}=\sum_{r=1}^{R}g_\theta(\mathbf z_r^{\star})\circ\mathbf c_r^{\star}$，其中

$$
\left(\mathbf C^{\star},\mathbf Z^{\star}\right)=\arg\min_{(\mathbf C,\mathbf Z)\in\mathcal S^{\mathrm{DGM}}}\mathcal F_{\Omega,\mathcal Y}^{\mathrm{DGM}}(\mathbf C,\mathbf Z)\tag{32}
$$

是（13）中 DGM-MLE 准则的最优解。则以至少 $1-2\delta$ 的概率有

$$
\frac{\left\|\mathcal X^{\star}-\mathcal X^{\natural}\right\|_F^2}{IJK}\leq\frac{8C_1C_2(1+\tau)}{K}\sqrt{\frac RN}+U_\alpha C_1\sqrt{\frac{\log(1/\delta)}{2N}}+U_\alpha C_1\sqrt{\frac{8\log(2/\delta)}{N}}+C_1C_2\nu_{\mathrm{DGM}},\tag{33}
$$

其中 $\tau=3\sqrt{K\log\left(\frac32\sqrt{R\kappa}(\beta+\kappa)\right)+D\log\left(3\sqrt{RP}q(\beta+\kappa)\right)}$，$\beta$、$\kappa$ 在（15）中定义，常数 $C_1=4(\alpha+a)^2/F_\alpha$、$C_2=L_\alpha/a$。证明见附录 D-B。

定理 2 表明，即使无线电地图由学到的 DGM（而非经典低秩模型）参数化，（13）的优化准则仍能保证真值无线电地图 $\mathcal X^{\natural}$ 的可恢复性。恢复过程主要有两类误差来源：第一类由无线电地图测量的有限纤维样本引起，也称泛化（或统计）误差，即（33）右端第一项；第二类由 DGM 的表示误差 $\nu_{\mathrm{DGM}}$ 引起，即（33）最后一项。可以看到，恢复的无线电地图以 $O(1/\sqrt N)$ 的速率随样本量增加而更接近真值。当 DGM 更复杂（如网络深度/宽度增加）时，逼近误差 $\nu_{\mathrm{DGM}}$ 减小；但网络复杂度增加会使 $\tau$ 变大。这呈现了模型复杂度与样本复杂度之间的合理权衡。简言之，人们希望 DGM 复杂度合理以使 $\nu_{\mathrm{DGM}}$ 较小，但又不过度表达以致过拟合。

## VI. 实验

### A. 合成数据实验

**1) 数据生成。** 首先生成数据：考虑 $50\times50$ m$^2$ 的 2D 地理区域，含 $51\times51$ 个网格，用索引 $\{0,1,\ldots,50\}\times\{0,1,\ldots,50\}$ 离散化，故 $I=J=51$；频谱域有 $K=64$ 个子带。无线电地图的生成方式是：先用联合路径损耗模型与空间相关对数正态阴影模型 [48] 生成每个发射机的 SLF。该模型的两个关键参数是去相关距离 $X_c$ 与阴影方差 $\eta$；$X_c$ 越大、$\eta$ 越小对应越温和的阴影环境，更多细节见 [7]。PSD 也按 [6]、[7] 的同一方法生成。

**2) DGM 学习。** 用 GAN 学习 DGM，设 $D=256$；潜嵌入 $\mathbf z_r$ 从标准高斯分布采样；GAN 的详细结构见附录 A。为生成 DGM 训练样本，用随机发射机位置、路径损耗系数范围 $[2,2.5]$、$X_c\in[30,100]$ 与 $\eta\in[3,8]$ 分别生成 5,000 个随机 SLF。随后用 Adam 优化器、批大小 128、250 个 epoch 训练 GAN；判别器与生成器的初始学习率分别设为 0.0004 与 0.0001。

**3) 算法设置。** BTD 模型中 $\mathbf A$、$\mathbf B$ 初始化为零矩阵；DGM 模型中 $\mathbf z_r$ 用标准正态分布初始化。两种模型中 $\mathbf C$ 的元素用 0 到 1 的均匀分布初始化。两种模型下，当代价函数相对变化小于 $10^{-3}$ 或 BCD 算法达到 300 次迭代时停止。两种重表述（21）与（17）的正则项均设为 $10^{-3}$。按 [6] 取 $L=10$。优化上，DGM 与 BTD 的块更新都用 Adam；$\mathbf C$ 的初始学习率设为 0.003，其他变量设为 0.006。

**4) 量化。** 取 $a=10^{-6}$（$h(x)=\log(x+a)$）。量化中，用含 20 个仿真无线电地图的验证集设定噪声方差；验证集用阴影参数 $X_c\in[30,100]$ 与 $\eta\in[3.0,8.0]$ 生成。对验证集用不同 $\sigma^2\in[0.5,4.0]$ 运行恢复算法（对应不同比特情形），选择平均表现最好的 $\sigma^2=1.7$。量化分箱用按第 VI-A2 节描述生成的 1,000 个仿真无线电地图数据构造；$b_q$ 按第 IV-C 节方法对 $B\in[1,8]$ 构造，其中 $B=\log_2(Q-1)$ 为比特数。

**5) 性能指标。** 用对数域归一化重建误差（LNRE）作为指标：

$$
\mathrm{LNRE}=\frac{\left\|\widehat{\mathcal M}-\mathcal M^{\natural}\right\|_F^2}{\left\|\mathcal M^{\natural}\right\|_F^2},\tag{34}
$$

其中 $\widehat{\mathcal M}=h(\widehat{\mathcal X})$ 是估计的对数变换后无线电地图。LNRE 适合偏斜数据，因为它防止 $\mathcal X$ 中少数较大值主导性能评估。所有 LNRE 都在 10 次随机试验上平均。

**6) 基线。** 使用 [7] 的基于 DGM 的 SC 方法（记为 "DowJons"），因为它在可获实值反馈时展现了最先进的 SC 性能；还使用 [6] 中面向未量化数据的基于 BTD 的方法；此外使用 [10] 中基于核回归的量化 SC 方法（记为 "KR"）。注意 [10] 假设发射机的 PSD 对融合中心已知，而我们的方法不需要该信息。

**7) 结果。** 图 6 给出 $R=6$ 个发射机的示例；为便于可视化，只展示单个频点上的恢复结果。该实验中采样 $51\times51$ 网格的 $\rho=10\%$，其中 $\rho=|\Omega|/IJ\times100\%$；每实值测量用 $B=3$ 比特量化；阴影参数取 $X_c=50$、$\eta=7$。各图像旁标出全频段重建无线电地图的 LNRE。可见 QuantSC-DGM 在视觉与 LNRE 上都给出最佳恢复性能；QuantSC-BTD 表现尚可，仍能较好恢复发射机位置；DowJons 明显漏掉了一些发射机，这并不意外，因为它并非为量化 SC 设计；[6] 的 BTD 方法也表现不佳，因为同样未考虑量化测量；KR 方法表现不好，出现明显过平滑。

图 7 给出比图 6 更强阴影下的结果，取 $R=2$、$X_c=40$、$\eta=8$，其他设置同上。显然这是更富挑战性的场景，多数方法失效：如预期，QuantSC-BTD 在此不奏效，因为 SLF 的低秩假设被严重违背；所提 QuantSC-DGM 是唯一产生接近真值无线电地图的方法，显示 DGM 在建模复杂环境方面的能力。

表 I 与表 II 分别给出不同 $\eta$ 与 $X_c$ 下各方法的性能。回顾这两个参数反映阴影程度。所有情形中 QuantSC-DGM 的 LNRE 最低；仅在 $X_c$ 减小、$\eta$ 增大时性能平缓退化，说明方法对强阴影鲁棒。QuantSC-BTD 在所有情形中给出次优 LNRE；如预期，它在 $X_c=90$、$\eta=6$ 时表现最好，但当 $X_c$ 降到 30 时 LNRE 增加 40%，说明阴影严重影响基于 BTD 方法，这与 [7] 的结论一致。

表 III 给出不同 $R$（发射机数量）下重建无线电地图的 LNRE。随着 $R$ 增大，所有方法性能都退化，因为需估计更多未知参数；但 QuantSC-DGM 与 QuantSC-BTD 仍给出最佳与次佳 LNRE。

表 IV 的仿真检验算法对错误估计 $R$ 的鲁棒性。此前仿真都假设算法能准确估计发射机数量 $R$，这在实际中未必成立。表 IV 给出 $R$ 被低估或高估时所有方法的性能，即错误 $R$ 下的性能。为清楚起见，用 $\widehat R$ 表示算法使用的"估计发射机数量"，目的是观察 $\widehat R\neq R$ 时算法的行为；该实验设定的真值 $R=6$。KR 方法需要知道发射机 PSD，因此其输入取 $\widehat R=R$。可见当 $\widehat R<R$ 时各算法 LNRE 更高；当 $\widehat R$ 从 2 增大到 6 时 LNRE 下降，但 $\widehat R\geq9$ 时又上升。这是合理的：低估 $\widehat R$ 无法捕捉无线电地图张量的所有"主成分"，而高估 $\widehat R$ 会使模型复杂度（由定理 1、2 中的 $\tau$ 表示）更高。因此，严重低估与过度高估 $\widehat R$ 都会损害恢复精度。在 BTD 中改变算法所用 $\widehat L$（可能与真值 $L$ 不同）也可观察到类似现象；受篇幅限制未包含改变 $\widehat L$ 的实验，但其背后的洞见相同。

表 V 给出不同 $\rho$ 下各算法的性能。值得注意的是，QuantSC-DGM 在 $\rho=3\%$ 时的 LNRE 低于其他方法在 $\rho=20\%$ 时的 LNRE——再次表明 DGM 的表达能力。然而，同样由 DGM 驱动的 DowJons 在所有 $\rho$ 下都劣于 QuantSC-BTD，这显示了我们提出的基于高斯量化与 MLE 的量化 SC 框架的有效性。

表 VI 给出每次测量所用不同量化比特数 $B$ 下的性能。与基线相比，所提 QuantSC-DGM 与 QuantSC-BTD 在 $B=1,2,3,4$ 时有可观优势；即使仅用 $B=1$ 比特，所提方法性能也令人满意。当 $B\geq5$（即量化级达到 $Q=31$）时，KR 与 DowJons 的性能赶上——此时量化误差逐渐可忽略。

### B. 真实数据实验

**1) 数据描述。** 数据采集于曼海姆大学办公楼一层 $14\times34$ m$^2$ 的室内空间，覆盖 9 个不同频带，中心频率分别为 2.412、2.422、2.427、2.432、2.437、2.442、2.447、2.457 与 2.462 GHz [49]。区域划分为 $1\times1$ m$^2$ 网格，其中 166 个网格中心安装了传感器，分布于走廊各处。图 8 最左列显示 9 个频率上真值无线电地图，图中白色块为无法测量的房间。实验中测量从走廊区域均匀采样；这种确定性（房间）与随机（走廊）混合的缺失模式并不完全被可恢复性定理中的条件覆盖，但该数据集仍可用于测试算法，结果可说明其在真实场景中的实用性以及对定理条件被违反时的鲁棒性。

**2) 超参数设置。** 真实数据极度偏斜且数值极小，测得最大功率为 −40 dB，因此变换取 $a=10^{-15}$，以避免 $a$ 主导 $h(x+a)$ 的输出。量化沿用之前基于验证集的策略：设 $\sigma^2=4.0$，由含 20 个仿真无线电地图的验证集调得。验证集考虑室内环境的高阴影参数 $X_c\in[20,70]$ 与 $\eta\in[6.0,9.0]$ 生成；对验证集用 $\sigma^2\in[1.0,5.0]$ 运行恢复算法并选最佳 $\sigma^2$。BTD 与 DGM 的正则化参数均设为 $10^{-4}$。按 [7] 与 [6] 分别取 $R=7$、$L=4$。不包含 KR，因为它需要发射机的真实 PSD，而该数据不可得。

**3) DGM 训练。** 为真实数据训练 GAN，首先生成具有大 $\eta$ 与小 $X_c$ 的样本以模拟强阴影条件——因为真实数据采集自室内环境。取 $\eta\in[8,12]$、$X_c\in[5,50]$，在 $14\times34$ m$^2$ 区域内模拟 SLF，生成 10,000 个这样的 SLF 样本并训练 GAN 学习 DGM。GAN 用 Adam 算法、批大小 256、最多 500 个 epoch 训练；判别器与生成器初始学习率分别为 $2\times10^{-5}$ 与 $10^{-5}$。GAN 结构见附录 A。

**4) 结果。** 图 8 给出 3 比特量化下各方法在全部 9 个频率上的重建无线电地图。可见 DowJons 方法在这种挑战性场景中无法准确估计真实无线电地图；而所提两种方法都输出视觉上合理的估计，显示框架的有效性。与之前一样，QuantSC-DGM 的估计在视觉上更接近真值，而 QuantSC-BTD 无需离线训练神经模型即可给出令人满意的结果。

表 VII—VIII 给出不同 $\rho$ 与 $B$ 下的定量结果，各算法表现与仿真中一致。值得注意的是，我们无法获得真实数据的环境参数，因此为训练 DGM 生成的仿真 SLF 很可能存在不可忽略的模型失配；但定性与定量评估都表明所提方法工作良好，显示了方法的鲁棒性。

## VII. 结论

本文提出了一种新颖的 SC 框架，可在重度量化传感器测量下有效工作。与以往假设全分辨率实值测量的可证明 SC 方法不同，新的基于最大似然估计（MLE）的框架使用由高斯量化器离散化的测量。它兼容基于 BTD 与基于 DGM 的无线电地图表示：前者无需训练，后者对强阴影更具韧性。框架的可恢复性已在现实条件下（如不完美的无线电地图建模）得到刻画。仿真与真实数据实验证明了所提方法的有效性。所提量化 SC 框架为无线电地图估计提供了具有可证明保证的实用且现实的方案。

## 图注与表注

### 表 I：不同 $\eta$ 下的 LNRE（$R=6$、$X_c=50$、$\rho=10\%$、$B=3$ 比特，原 PDF 第 10 页）

| $\eta$ | KR [10] | DowJons [7] | QuantSC-BTD | QuantSC-DGM |
|---|---|---|---|---|
| 4.0 | 0.1351 ± 0.0092 | 0.2078 ± 0.0149 | 0.1352 ± 0.0082 | **0.0552 ± 0.0083** |
| 5.0 | 0.1284 ± 0.0153 | 0.2163 ± 0.0058 | 0.1384 ± 0.0142 | **0.0650 ± 0.0041** |
| 6.0 | 0.1949 ± 0.0102 | 0.2435 ± 0.0163 | 0.1327 ± 0.0092 | **0.0665 ± 0.0103** |
| 7.0 | 0.2310 ± 0.0210 | 0.2341 ± 0.0132 | 0.1461 ± 0.0097 | **0.0701 ± 0.0084** |
| 8.0 | 0.2705 ± 0.0076 | 0.2578 ± 0.0097 | 0.1593 ± 0.0085 | **0.0787 ± 0.0069** |

### 表 II：不同 $X_c$ 下的 LNRE（$R=6$、$\eta=6$、$\rho=10\%$、$B=3$ 比特，原 PDF 第 10 页）

| $X_c$ | KR [10] | DowJons [7] | QuantSC-BTD | QuantSC-DGM |
|---|---|---|---|---|
| 30.0 | 0.2366 ± 0.0303 | 0.2116 ± 0.0142 | 0.1513 ± 0.0093 | **0.0699 ± 0.0068** |
| 50.0 | 0.1852 ± 0.0095 | 0.2192 ± 0.0102 | 0.1316 ± 0.0129 | **0.0625 ± 0.0041** |
| 70.0 | 0.1567 ± 0.0162 | 0.2218 ± 0.0092 | 0.1318 ± 0.0087 | **0.0620 ± 0.0080** |
| 90.0 | 0.1401 ± 0.0095 | 0.1783 ± 0.0105 | 0.1185 ± 0.0123 | **0.0579 ± 0.0091** |

### 表 III：不同 $R$ 下的 LNRE（$\eta=6$、$X_c=50$、$\rho=10\%$、$B=3$ 比特，原 PDF 第 10 页）

| $R$ | KR [10] | DowJons [7] | QuantSC-BTD | QuantSC-DGM |
|---|---|---|---|---|
| 2 | 0.0818 ± 0.0193 | 0.1555 ± 0.0144 | 0.1125 ± 0.0241 | **0.0499 ± 0.0036** |
| 4 | 0.1300 ± 0.0324 | 0.2515 ± 0.0404 | 0.1301 ± 0.0101 | **0.0612 ± 0.0130** |
| 6 | 0.1730 ± 0.0078 | 0.2412 ± 0.0072 | 0.1442 ± 0.0129 | **0.0640 ± 0.0087** |
| 8 | 0.1902 ± 0.0309 | 0.2746 ± 0.0315 | 0.1621 ± 0.0137 | **0.0595 ± 0.0054** |
| 10 | 0.2295 ± 0.0639 | 0.3227 ± 0.0206 | 0.1860 ± 0.0160 | **0.0659 ± 0.0071** |
| 12 | 0.2197 ± 0.0127 | 0.3522 ± 0.0433 | 0.1872 ± 0.0111 | **0.0674 ± 0.0069** |
| 14 | 0.2181 ± 0.0099 | 0.3280 ± 0.0052 | 0.1985 ± 0.0181 | **0.0746 ± 0.0061** |
| 16 | 0.2149 ± 0.0083 | 0.3321 ± 0.0056 | 0.1951 ± 0.0031 | **0.0782 ± 0.0062** |
| 18 | 0.2296 ± 0.0167 | 0.3632 ± 0.0070 | 0.2148 ± 0.0076 | **0.0782 ± 0.0041** |
| 20 | 0.2356 ± 0.0174 | 0.3630 ± 0.0388 | 0.2117 ± 0.0075 | **0.0834 ± 0.0064** |

### 表 IV：不同 $\widehat R$ 下的 LNRE（真值 $R=6$、$X_c=40$、$\eta=7.0$、$\rho=10\%$、$B=3$ 比特，原 PDF 第 10 页）

| $\widehat R$ | KR [10] | DowJons [7] | QuantSC-BTD | QuantSC-DGM |
|---|---|---|---|---|
| 2 | - | 0.3058 ± 0.0029 | 0.1790 ± 0.0098 | **0.0963 ± 0.0077** |
| 3 | - | 0.2931 ± 0.0047 | 0.1731 ± 0.0085 | **0.0852 ± 0.0068** |
| 4 | - | 0.2837 ± 0.0107 | 0.1706 ± 0.0097 | **0.0811 ± 0.0076** |
| 5 | - | 0.2447 ± 0.0617 | 0.1639 ± 0.0101 | **0.0695 ± 0.0049** |
| 6 | 0.1917 ± 0.0068 | 0.2398 ± 0.0090 | 0.1602 ± 0.0091 | **0.0682 ± 0.0083** |
| 7 | - | 0.2415 ± 0.0115 | 0.1612 ± 0.0105 | **0.0661 ± 0.0056** |
| 8 | - | 0.2439 ± 0.0102 | 0.1610 ± 0.0102 | **0.0673 ± 0.0083** |
| 9 | - | 0.2956 ± 0.0114 | 0.1736 ± 0.0098 | **0.0696 ± 0.0137** |
| 10 | - | 0.4474 ± 0.0220 | 0.1958 ± 0.0105 | **0.0716 ± 0.0093** |
| 11 | - | 0.4411 ± 0.0302 | 0.2017 ± 0.0107 | **0.0727 ± 0.0096** |

### 表 V：不同 $\rho$ 下的 LNRE（$R=6$、$X_c=50$、$\eta=6$、$B=3$ 比特，原 PDF 第 10 页）

| $\rho$ | KR [10] | DowJons [7] | QuantSC-BTD | QuantSC-DGM |
|---|---|---|---|---|
| 3% | 0.2104 ± 0.0452 | 0.2625 ± 0.0163 | 0.1980 ± 0.0074 | **0.0900 ± 0.0070** |
| 5% | 0.1975 ± 0.0201 | 0.2506 ± 0.0141 | 0.1756 ± 0.0106 | **0.0761 ± 0.0091** |
| 10% | 0.1722 ± 0.0124 | 0.2388 ± 0.0080 | 0.1429 ± 0.0116 | **0.0607 ± 0.0065** |
| 15% | 0.1663 ± 0.0149 | 0.2220 ± 0.0079 | 0.1408 ± 0.0090 | **0.0557 ± 0.0083** |
| 20% | 0.1416 ± 0.0075 | 0.1906 ± 0.0118 | 0.1315 ± 0.0071 | **0.0522 ± 0.0075** |

### 表 VI：不同 $B$ 下的 LNRE（$R=6$、$X_c=50$、$\eta=6$、$\rho=10\%$，原 PDF 第 11 页）

| $B$ | KR [10] | DowJons [7] | QuantSC-BTD | QuantSC-DGM |
|---|---|---|---|---|
| 1 | 0.4670 ± 0.0059 | 0.7424 ± 0.0640 | 0.1815 ± 0.0112 | **0.0720 ± 0.0095** |
| 2 | 0.2885 ± 0.0260 | 0.5625 ± 0.0292 | 0.1548 ± 0.0159 | **0.0675 ± 0.0074** |
| 3 | 0.1781 ± 0.0082 | 0.2461 ± 0.0292 | 0.1434 ± 0.0140 | **0.0645 ± 0.0088** |
| 4 | 0.1547 ± 0.0114 | 0.1533 ± 0.0127 | 0.1385 ± 0.0132 | **0.0607 ± 0.0124** |
| 5 | 0.1384 ± 0.0057 | 0.0712 ± 0.0142 | 0.1339 ± 0.0168 | **0.0572 ± 0.0136** |
| 6 | 0.1128 ± 0.0100 | 0.0556 ± 0.0147 | 0.1242 ± 0.0078 | **0.0545 ± 0.0096** |
| 7 | 0.0970 ± 0.0079 | 0.0543 ± 0.0155 | 0.1028 ± 0.0119 | **0.0504 ± 0.0115** |
| 8 | 0.0743 ± 0.0090 | 0.0523 ± 0.0146 | 0.0972 ± 0.0109 | **0.0445 ± 0.0118** |

### 表 VII：真实数据在不同 $\rho$ 下的 LNRE（$B=3$，原 PDF 第 11 页）

| $\rho$ | DowJons [7] | QuantSC-BTD | QuantSC-DGM |
|---|---|---|---|
| 5% | 0.9474 ± 0.1017 | 0.2527 ± 0.0110 | **0.1144 ± 0.0084** |
| 10% | 0.8944 ± 0.0790 | 0.2197 ± 0.0162 | **0.0866 ± 0.0079** |
| 15% | 0.8761 ± 0.0524 | 0.2061 ± 0.0126 | **0.0809 ± 0.0068** |
| 20% | 0.8452 ± 0.0303 | 0.1993 ± 0.0098 | **0.0782 ± 0.0102** |

### 表 VIII：真实数据在不同比特数下的 LNRE（$\rho=10\%$，原 PDF 第 12 页）

| 比特数 | DowJons [7] | QuantSC-BTD | QuantSC-DGM |
|---|---|---|---|
| 1 | 0.9534 ± 0.0624 | 0.2842 ± 0.0162 | **0.0998 ± 0.0111** |
| 2 | 0.9264 ± 0.0233 | 0.2431 ± 0.0100 | **0.0897 ± 0.0076** |
| 3 | 0.8032 ± 0.0581 | 0.2045 ± 0.0095 | **0.0879 ± 0.0082** |
| 4 | 0.7177 ± 0.0310 | 0.1934 ± 0.0128 | **0.0862 ± 0.0073** |
| 5 | 0.5350 ± 0.0186 | 0.1887 ± 0.0101 | **0.0812 ± 0.0092** |
| 6 | 0.2350 ± 0.0270 | 0.1810 ± 0.0137 | **0.0797 ± 0.0057** |
| 7 | 0.1809 ± 0.0148 | 0.1811 ± 0.0083 | **0.0791 ± 0.0087** |
| 8 | 0.1414 ± 0.0159 | 0.1803 ± 0.0070 | **0.0786 ± 0.0072** |

### 表 IX：仿真中的 GAN 结构（左：合成数据实验；右：真实数据实验，原 PDF 第 13 页）

**左（合成数据）生成器**

| 层 | 滤波器 | #C | #S | #P |
|---|---|---|---|---|
| Deconv | 3×3 | 128 | 1 | 0 |
| Deconv | 4×4 | 64 | 2 | 1 |
| Deconv | 4×4 | 32 | 2 | 1 |
| Deconv | 4×4 | 16 | 2 | 0 |
| Deconv | 4×4 | 2 | 2 | 0 |
| Conv2d | 4×4 | 1 | 1 | 0 |

**左（合成数据）判别器**

| 层 | 滤波器 | #C | #S | #P |
|---|---|---|---|---|
| Conv | 4×4 | 16 | 2 | 1 |
| Conv | 4×4 | 32 | 2 | 1 |
| Conv | 4×4 | 64 | 2 | 1 |
| Conv | 4×4 | 128 | 2 | 1 |
| Conv2d | 3×3 | 1 | 1 | 0 |

**右（真实数据）生成器**

| 层 | 滤波器 | #C | #S | #P |
|---|---|---|---|---|
| Deconv | 3×3 | 128 | 1 | 0 |
| Deconv | 3×3 | 64 | 2 | 1 |
| Deconv | 3×3 | 32 | (1,2) | (0,1) |
| Deconv | 3×3 | 16 | 2 | 1 |
| Deconv | 2×2 | 8 | (1,2) | 0 |
| Deconv | 2×2 | 4 | 1 | 0 |
| Conv2d | 2×2 | 1 | 1 | 0 |

**右（真实数据）判别器**

| 层 | 滤波器 | #C | #S | #P |
|---|---|---|---|---|
| Conv | 2×2 | 16 | 2 | 1 |
| Conv | 4×4 | 32 | 1 | 1 |
| Conv | 4×4 | 64 | 1 | (1,0) |
| Conv | 3×3 | 128 | 2 | 1 |
| Conv | 3×3 | 256 | 2 | (1,0) |
| Conv2d | 2×2 | 1 | 1 | 0 |

### 图注

**图 1（原 PDF 第 2 页）：** (a) 所关注的场景；(b) 无线电地图的采样模式，每条被采样的纤维（fiber）是一个 PSD。

**图 2（原 PDF 第 3 页）：** [6] 中使用的基于 BTD 的无线电地图模型。

**图 3（原 PDF 第 3 页）：** [7] 中使用深度生成模型的频谱制图。

**图 4（原 PDF 第 3 页）：** 用仿真 SLF 通过 GAN 学习 SLF 的 DGM。图中包含生成器（Generator）与判别器（Discriminator），判别器判断输入为真实（Real）或伪造（Fake）。

**图 5（原 PDF 第 6 页）：** 测量值在对数变换（6）之前（左）与之后（右）的直方图。无线电地图覆盖 $51\times51$ m$^2$ 区域，$R=4$ 个发射机、$K=64$ 个频率，阴影参数 $(X_c,\eta)=(50,6)$（定义见第 VI-A 节）。

**图 6（原 PDF 第 9 页）：** 各方法在第 30 个频点处重建的无线电地图与真值；$\rho=10\%$、$R=6$、$X_c=50$、$\eta=6$、$\sigma^2=1.7$、$B=3$ 比特。子图包括真值（Ground Truth）、量化数据（Quantized data）、采样量化数据（Sampled Quantized data）、核回归 [10]（LNRE 0.1896）、BTD [6]（LNRE 0.4965）、DowJons [7]（LNRE 0.2590）、QuantSC-BTD（LNRE 0.1454）、QuantSC-DGM（LNRE 0.0689），色标为功率（dB）。

**图 7（原 PDF 第 10 页）：** 强阴影下各方法在第 20 个频点处重建的无线电地图与真值；$\rho=10\%$、$R=2$、$X_c=40$、$\eta=8$、$\sigma^2=1.7$、$B=3$ 比特。子图包括真值、量化数据、采样量化数据、核回归 [10]（LNRE 0.4457）、BTD [6]（LNRE 0.5476）、DowJons [7]（LNRE 0.3492）、QuantSC-BTD（LNRE 0.4413）、QuantSC-DGM（LNRE 0.0808），色标为功率（dB）。

**图 8（原 PDF 第 11 页）：** 全部频点上重建的无线电地图与真值；$\rho=10\%$、$B=3$。各列从左到右为真值、DowJons [7]、QuantSC-BTD、QuantSC-DGM，对应 9 个频率（2.412—2.462 GHz）；底部标出各自的 LNRE（0.8954、0.2014、0.0821），色标为功率（dB）。

## 附录 A：GAN 结构（原 PDF 第 13 页）

表 IX [左] 给出合成数据实验所用 GAN 的详细结构。"Deconv" 指由转置卷积操作堆叠而成的操作块，后接批归一化与 ReLU 激活；"Conv" 指由卷积操作堆叠而成的操作块，后接批归一化与 leaky ReLU 激活；"Conv2d" 指后接 sigmoid 激活的卷积操作。如前所述，为确保生成 SLF 的非负性，生成器输出层使用 sigmoid 激活。#C、#S、#P 分别表示通道数、步长与填充大小。表 IX [右] 给出真实数据实验所用的神经网络结构。

## 附录 B：引理 1 的证明（原 PDF 第 13 页）

假设存在正的 $\ell_{\min}$ 与 $\ell_{\max}$ 使得

$$
\ell_{\min}\leq\frac{|h(x)-h(y)|}{|x-y|}\leq\ell_{\max}\tag{35}
$$

$$
\Longrightarrow\ \ell_{\min}|x-y|\leq|h(x)-h(y)|\leq\ell_{\max}|x-y|.\tag{36}
$$

把上述结论应用于张量 $\mathcal X$ 与 $\mathcal X'$ 的对应元素，再对所有元素平方求和，得到

$$
\ell_{\min}^2\|\mathcal X-\mathcal X'\|_F^2\leq\|h(\mathcal X)-h(\mathcal X')\|_F^2\leq\ell_{\max}^2\|\mathcal X-\mathcal X'\|_F^2\tag{37a}
$$

$$
\Longrightarrow\ \ell_{\min}\leq\frac{\|h(\mathcal X)-h(\mathcal X')\|_F}{\|\mathcal X-\mathcal X'\|_F}\leq\ell_{\max}.\tag{37b}
$$

为求 $\ell_{\min}$ 与 $\ell_{\max}$，考虑

$$
\begin{aligned}
&\min_{x,y\in[0,\alpha]}\frac{|\log(x+a)-\log(y+a)|}{|x-y|}\leq\frac{\|h(\mathcal X)-h(\mathcal X')\|_F}{\|\mathcal X-\mathcal X'\|_F}\leq\max_{x,y\in[0,\alpha]}\frac{|\log(x+a)-\log(y+a)|}{|x-y|}\\
&\overset{(b)}{\Longrightarrow}\ \min_{x,y\in[0,\alpha]}\frac{\log(x+a)-\log(y+a)}{|x-y|}\leq\frac{\|h(\mathcal X)-h(\mathcal X')\|_F}{\|\mathcal X-\mathcal X'\|_F}\leq\max_{x,y\in[0,\alpha]}\frac{\log(x+a)-\log(y+a)}{x-y},
\end{aligned}\tag{38}
$$

其中 $x$ 与 $y$ 分别表示 $\mathcal X$ 与 $\mathcal X'$ 的任意两个元素；(b) 成立是因为分子与分母同号。

由中值定理，存在 $z\in[x,y]$ 使得

$$
\dot h(z)=\frac{\log(x+a)-\log(y+a)}{x-y},
$$

其中 $\dot h(z)$ 是 $h$ 在 $z$ 处的导数。已知 $\dot h(z)=\frac{1}{z+a}$。由于 $\dot h(z)$ 随 $z$ 单调递增，（38）的最小值与最大值可由 $\dot h(z)$ 的最小值与最大值界定。因此

$$
\min_{x,y\in[0,\alpha]}\frac{\log(x+a)-\log(y+a)}{x-y}=\min_{z\in[0,\alpha]}\frac{1}{z+a}=\frac{1}{\alpha+a}.
$$

类似地有 $\max_{x,y\in[0,\alpha]}\frac{\log(x+a)-\log(y+a)}{x-y}=\frac1a$。结合上式与（38）即完成证明。

## 附录 C：事实 2 的证明（原 PDF 第 14 页）

注意若 $\|\mathcal X\|_\infty\leq\alpha$，则 $\mathcal M$ 有界：

$$
\|\mathcal M-\mathcal 0\|_\infty=\left\|h(\mathcal X)-h((1-a)\mathbf 1)\right\|_\infty\overset{(a)}{\leq}\max_{i,j,k}\frac1a\left|\mathcal X(i,j,k)-(1-a)\right|\overset{(b)}{\leq}\frac1a\max_{i,j,k}\left(|\mathcal X(i,j,k)|+|1-a|\right)\leq\frac{\alpha+|1-a|}{a},
$$

其中 (a) 用了（25），(b) 用了三角不等式。注意 $\left|\dot f_\ell(m)\right|=\left|\dot\Phi(b_\ell-m)-\dot\Phi(b_{\ell-1}-m)\right|<\infty$，因为给定方差下 $\dot\Phi(\cdot)$ 有上界；此外分母

$$
f_\ell(m)=\Phi(b_\ell-m)-\Phi(b_{\ell-1}-m)=\int_{b_{\ell-1}}^{b_\ell}\frac{1}{\sqrt{2\pi\sigma^2}}\exp\left(-\frac{t^2}{\sigma^2}\right)dt>0,
$$

对给定 $b_\ell>b_{\ell-1}$ 与 $\ell=\{2,\ldots,Q\}$ 成立。因此只要 $\mathcal X(i,j,k)$ 被 $\alpha$ 上界约束，（26）中定义的上下确界就存在。

## 附录 D：覆盖数与定理证明（原 PDF 第 14—16 页）

### A. 覆盖数

我们会反复使用如下定义：

**定义 1（覆盖数 [50]）：** 集合 $\mathcal W$ 在参数 $\epsilon>0$ 下的覆盖数 $\mathcal N(\mathcal W,\epsilon)$ 是任一子集 $\bar{\mathcal W}\subseteq\mathcal W$ 的最小基数，使得对任意 $\mathbf w\in\mathcal W$，存在 $\bar{\mathbf w}\in\bar{\mathcal W}\subset\mathcal W$ 满足 $\|\mathbf w-\bar{\mathbf w}\|\leq\epsilon$。离散集 $\bar{\mathcal W}$ 称为 $\mathcal W$ 的 $\epsilon$-网。

粗略地说，连续集 $\mathcal X$ 可用一个基数约为 $\mathcal N(\mathcal X,\epsilon)$ 的离散集来逼近。

**引理 2（$\mathcal X^{\mathrm{BTD}}$ 的覆盖数）：** $\mathcal X^{\mathrm{BTD}}$ 的覆盖数 $\mathcal N(\mathcal X^{\mathrm{BTD}},\epsilon)$ 的上界为

$$
\left(\frac{3(\kappa+\beta)R}{\epsilon}\right)^{((I+J)L+K)R}\beta^{(I+J)LR}\left(\frac{\kappa}{2}\right)^{RK}.\tag{39}
$$

**证明：** 令 $\bar{\mathcal A}_r$ 表示 $\mathcal A_r=\{\mathbf A_r\in\mathbb R^{I\times L}\mid\|\mathbf A_r\|_F\leq\sqrt\beta,\ \mathbf A_r\geq0\}$ 的 $\frac{\epsilon}{2\sqrt\beta}$-网；类似地，令 $\bar{\mathcal B}_r$ 表示 $\mathcal B_r=\{\mathbf B_r\in\mathbb R^{J\times L}\mid\|\mathbf B_r\|_F\leq\sqrt\beta,\ \mathbf B_r\geq0\}$ 的 $\frac{\epsilon}{2\sqrt\beta}$-网。根据 [51, 引理 4.1]，$D$ 维欧氏球 $\{\mathbf x\in\mathbb R^D\mid\|\mathbf x\|_2\leq\delta\}$ 的 $\epsilon$-网覆盖数上界为 $(3\delta/\epsilon)^D$。因此

$$
\left|\bar{\mathcal A}_r\right|\leq\left(\frac{6\beta}{\epsilon}\right)^{IL}\frac{1}{2^{IL}},\qquad\left|\bar{\mathcal B}_r\right|\leq\left(\frac{6\beta}{\epsilon}\right)^{JL}\frac{1}{2^{JL}},\tag{40}
$$

其中常数因子 $\frac{1}{2^{IL}}$ 与 $\frac{1}{2^{JL}}$ 分别源于集合 $\mathcal A_r$ 与 $\mathcal B_r$ 的非负约束。接着考虑集合

$$
\mathcal F_r=\left\{\mathbf S_r=\mathbf A_r\mathbf B_r^{\top}\in\mathbb R^{I\times J}\ \middle|\ \operatorname{rank}(\mathbf S_r)\leq L,\ \|\mathbf S_r\|_F\leq\beta,\ \mathbf S_r\geq0,\ \mathbf A_r\in\bar{\mathcal A}_r,\ \mathbf B_r\in\bar{\mathcal B}_r\right\}.
$$

可以构造 $\mathcal F_r$ 的 $\epsilon$-网使

$$
\begin{aligned}
\|\mathbf S_r-\bar{\mathbf S}_r\|_F&=\left\|\mathbf A_r\mathbf B_r^{\top}-\bar{\mathbf A}_r\bar{\mathbf B}_r^{\top}\right\|_F\\
&\leq\left\|\mathbf A_r\left(\mathbf B_r-\bar{\mathbf B}_r\right)^{\top}\right\|_F+\left\|\left(\mathbf A_r-\bar{\mathbf A}_r\right)\bar{\mathbf B}_r^{\top}\right\|_F\tag{41a}\\
&\leq\|\mathbf A_r\|_F\left\|\mathbf B_r^{\top}-\bar{\mathbf B}_r^{\top}\right\|_F+\left\|\mathbf A_r-\bar{\mathbf A}_r\right\|_F\left\|\bar{\mathbf B}_r^{\top}\right\|_F\tag{41b}\\
&\leq\sqrt\beta\left(\frac{\epsilon}{2\sqrt\beta}+\frac{\epsilon}{2\sqrt\beta}\right)\leq\epsilon,
\end{aligned}\tag{41}
$$

其中（41a）用了三角不等式，（41b）由 Cauchy–Schwarz 不等式得到。$\mathcal F_r$ 的 $\epsilon$-网的基数等于集合 $\bar{\mathcal A}_r$ 与 $\bar{\mathcal B}_r$ 基数之积。令 $\bar{\mathcal F}_r$ 为 $\mathcal F_r$ 的 $\frac{\epsilon}{R(\kappa+\beta)}$-网，则

$$
\left|\bar{\mathcal F}_r\right|\leq\left(\frac{3\beta R(\kappa+\beta)}{\epsilon}\right)^{(I+J)L}.\tag{42}
$$

现在令 $\bar{\mathcal C}_r$ 表示 $\mathcal C_r=\{\mathbf c_r\in\mathbb R^{K}\mid\|\mathbf c_r\|_2\leq\kappa,\ \mathbf c_r\geq0\}$ 的 $\frac{\epsilon}{R(\kappa+\beta)}$-网。由 [51, 引理 4.1] 得

$$
\left|\bar{\mathcal C}_r\right|\leq\left(\frac{3\kappa R(\kappa+\beta)}{\epsilon}\right)^{K}\frac{1}{2^K}.\tag{43}
$$

最后考虑离散集 $\bar{\mathcal X}^{\mathrm{BTD}}$。我们希望构造该集合，使得对每个 $\mathcal X\in\mathcal X^{\mathrm{BTD}}$，存在 $\bar{\mathcal X}\in\bar{\mathcal X}^{\mathrm{BTD}}$ 满足 $\|\mathcal X-\bar{\mathcal X}\|_F\leq\epsilon$。为此令

$$
\bar{\mathcal X}^{\mathrm{BTD}}=\left\{\bar{\mathcal X}\ \middle|\ \bar{\mathcal X}=\sum_{r=1}^{R}\bar{\mathbf S}_r\circ\bar{\mathbf c}_r,\ \bar{\mathbf S}_r\in\bar{\mathcal F}_r,\ \bar{\mathbf c}_r\in\bar{\mathcal C}_r\right\}.
$$

为说明上述构造是 $\mathcal X^{\mathrm{BTD}}$ 的 $\epsilon$-网，证明对任意 $\mathcal X\in\mathcal X^{\mathrm{BTD}}$ 存在 $\bar{\mathcal X}\in\bar{\mathcal X}^{\mathrm{BTD}}$ 满足如下不等式链：

$$
\begin{aligned}
\|\mathcal X-\bar{\mathcal X}\|_F&=\left\|\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r-\sum_{r=1}^{R}\bar{\mathbf S}_r\circ\bar{\mathbf c}_r\right\|_F\\
&\overset{(a)}{=}\|\mathbf C\mathbf S-\bar{\mathbf C}\bar{\mathbf S}\|_F\leq\left\|\mathbf C\left(\mathbf S-\bar{\mathbf S}\right)\right\|_F+\left\|\left(\mathbf C-\bar{\mathbf C}\right)\bar{\mathbf S}\right\|_F\\
&\leq\|\mathbf C\|_F\left\|\mathbf S-\bar{\mathbf S}\right\|_F+\left\|\mathbf C-\bar{\mathbf C}\right\|_F\|\bar{\mathbf S}\|_F\\
&=\sqrt{R\kappa}\left(\sum_{r=1}^{R}\left\|\mathbf S_r-\bar{\mathbf S}_r\right\|_F^2\right)^{\frac12}+\sqrt{R\beta}\left(\sum_{r=1}^{R}\left\|\mathbf c_r-\bar{\mathbf c}_r\right\|_2^2\right)^{\frac12}\\
&\overset{(b)}{\leq}\sqrt{R\kappa}\left(R\left(\frac{\epsilon}{R(\kappa+\beta)}\right)^2\right)^{\frac12}+\sqrt{R\beta}\left(R\left(\frac{\epsilon}{R(\kappa+\beta)}\right)^2\right)^{\frac12}\leq\epsilon,
\end{aligned}
$$

其中 $\mathbf C=[\mathbf c_1,\ldots,\mathbf c_R]$、$\mathbf S=[\mathbf s_1,\ldots,\mathbf s_R]^{\top}$，且对 $r\in[R]$ 有 $\mathbf s_r=\operatorname{vec}(\mathbf S_r)$；(a) 基于外积的矩阵表示，见 [7]、[52]；(b) 通过从 $\bar{\mathcal F}_r$ 选取距 $\mathbf S_r$ 最近的 $\bar{\mathbf S}_r$ 成立，$\mathbf c_r$ 的选取同理。$\bar{\mathcal X}^{\mathrm{BTD}}$ 的基数等于 $R$ 个 $\bar{\mathcal F}_r$ 与 $\bar{\mathcal C}_r$ 集合基数之积。因此集合 $\mathcal X^{\mathrm{BTD}}$ 的覆盖数上界为（39）。

在假设 3 下，$\mathcal X^{\mathrm{DGM}}$ 的覆盖数也可被界定 [7]：

**事实 3（$\mathcal X^{\mathrm{DGM}}$ 的覆盖数 [7]）：** 在假设 3 下，$\mathcal X^{\mathrm{DGM}}$ 的覆盖数满足

$$
\mathcal N\left(\mathcal X^{\mathrm{DGM}},\epsilon\right)\leq\left(\frac{3R(\beta+\kappa)}{\epsilon}\right)^{R(K+D)}\left(\frac{\kappa}{2}\right)^{RK}(Pq)^{RD}.\tag{45}
$$

> **原文疑点：** 原文在事实 3 之前跳过了式（44）的编号（PDF 抽取文本从（43）直接到（45）），疑为排版或抽取缺失；此处按原编号保留（45），未擅自补号。

### B. 定理 1 与 2 的证明

令 $\mathcal T=\{(0,0),\ldots,(I,J)\}$。我们从 $\mathcal T$ 中有放回均匀抽取 $N$ 个样本 $\omega_1,\ldots,\omega_N$，把索引收集为 $\Omega=\{\omega_1,\omega_2,\ldots,\omega_N\}$。则对每个 $\omega_i\in\Omega$、$k\in[K]$，$Y_{\omega_i k}$ 以 $\{f_\ell(M_{\omega_i k})\}_{\ell=1}^{Q}$ 定义的概率质量函数被观测。此处使用简写 $Y_{\omega k}=Y(i,j,k)$ 与 $Y_{\omega:}=Y(i,j,:)$（$\omega\in\Omega$），$\mathcal M$ 同理。对任意两条纤维 $M_{\omega:}$ 与 $Y_{\omega:}$（$\forall\omega\in\Omega$），定义函数 $g:\mathbb R^{K}\times\mathbb R^{K}\to\mathbb R$ 如下：

$$
g(M_{\omega:},Y_{\omega:})=\sum_{k=1}^{K}\sum_{\ell=1}^{Q}\mathbf 1[Y_{ijk}=\ell]\log\left(\frac{1}{f_\ell(M_{\omega k})}\right).\tag{46}
$$

回顾 $\mathcal M=h(\mathcal X)$。定义

$$
F_{\Omega,\mathcal Y}(\mathcal M)=\frac1N\sum_{(i,j)\in\Omega}g(M(i,j,:),Y(i,j,:))=\frac1N\sum_{(i,j)\in\Omega}\sum_{k=1}^{K}\sum_{\ell=1}^{Q}\mathbf 1[Y_{ijk}=\ell]\log\left(\frac{1}{f_\ell(M_{ijk})}\right).
$$

令 $\mathcal M^{\natural}=h(\mathcal X^{\natural})$ 为真值张量，$\mathcal M^{\star}=h(\mathcal X^{\star})$ 为优化问题（5）的最优解。则

$$
\begin{aligned}
&\mathbb E_{\omega,Y}\left[g(M^{\natural}_{\omega:},Y_{\omega:})-g(M^{\star}_{\omega:},Y_{\omega:})\right]\\
&=\sum_{(i,j)\in\mathcal T}\frac1{IJ}\mathbb E_{Y|\omega=(i,j)}\left(g(M^{\natural}_{\omega:},Y_{\omega:})-g(M^{\star}_{\omega:},Y_{\omega:})\right)\\
&=\frac1{IJ}\left(\sum_{(i,j)\in\mathcal T}\sum_{k=1}^{K}\sum_{\ell=1}^{Q}\Pr(Y_{\omega k}=\ell)\log\frac{f_\ell(M^{\star}_{\omega k})}{f_\ell(M^{\natural}_{\omega k})}\right)\\
&=\frac{K}{IJK}\sum_{(i,j,k)\in[I]\times[J]\times[K]}\sum_{\ell=1}^{Q}f_\ell(M^{\natural}_{\omega k})\log\frac{f_\ell(M^{\star}_{\omega k})}{f_\ell(M^{\natural}_{\omega k})}\\
&=-K\cdot\mathrm{KL}(M^{\star}\|M^{\natural}),
\end{aligned}\tag{47}
$$

其中 $\mathrm{KL}(M^{\star}\|M^{\natural})=\frac{1}{IJK}\sum_{i,j,k}\mathrm{KL}(M^{\star}_{ijk}\|M^{\natural}_{ijk})$，且 $\mathrm{KL}(M^{\star}_{ijk}\|M^{\natural}_{ijk})=\sum_{\ell=1}^{Q}f_\ell(M^{\natural}_{ijk})\log\frac{f_\ell(M^{\natural}_{ijk})}{f_\ell(M^{\star}_{ijk})}$，均遵循 [33] 的定义。

令 $\bar M=\arg\min_{M\in\mathcal M}\mathbb E_{\omega,Y}\left[g(M_{\omega:},Y_{\omega:})\right]$，其中 $\mathcal M\in\{\mathcal M^{\mathrm{BTD}},\mathcal M^{\mathrm{DGM}}\}$ 取决于所用模型；即 $\bar M$ 是期望版 MLE 可得到的解。又由 $F_{\Omega,\mathcal Y}(\mathcal M^{\star})\leq F_{\Omega,\mathcal Y}(\bar M)$ 可得如下不等式链：

$$
\begin{aligned}
0&\leq F_{\Omega,\mathcal Y}(\bar M)-F_{\Omega,\mathcal Y}(M^{\natural})+F_{\Omega,\mathcal Y}(M^{\natural})-F_{\Omega,\mathcal Y}(M^{\star})\\
&\leq\mathbb E_{\omega,Y}\left[g(M^{\natural}_{\omega:},Y_{\omega:})\right]-\mathbb E_{\omega,Y}\left[g(M^{\star}_{\omega:},Y_{\omega:})\right]+F_{\Omega,\mathcal Y}(M^{\natural})\\
&\quad-\mathbb E_{\omega,Y}\left[g(M^{\natural}_{\omega:},Y_{\omega:})\right]+\mathbb E_{\omega,Y}\left[g(M^{\star}_{\omega:},Y_{\omega:})\right]-F_{\Omega,\mathcal Y}(M^{\star})+F_{\Omega,\mathcal Y}(\bar M)-F_{\Omega,\mathcal Y}(M^{\natural})\\
&\overset{(a)}{\leq}\mathbb E_{\omega,Y}\left[g(M^{\natural}_{\omega:},Y_{\omega:})-g(M^{\star}_{\omega:},Y_{\omega:})\right]+\left|F_{\Omega,\mathcal Y}(M^{\natural})-\mathbb E_{\omega,Y}\left[g(M^{\natural}_{\omega:},Y_{\omega:})\right]\right|\\
&\quad+\left|F_{\Omega,\mathcal Y}(M^{\star})-\mathbb E_{\omega,Y}\left[g(M^{\star}_{\omega:},Y_{\omega:})\right]\right|+\left|F_{\Omega,\mathcal Y}(\bar M)-F_{\Omega,\mathcal Y}(M^{\natural})\right|\\
&\overset{(b)}{\Longrightarrow}\ K\cdot\mathrm{KL}(M^{\star}\|M^{\natural})\leq\left|F_{\Omega,\mathcal Y}(\bar M)-F_{\Omega,\mathcal Y}(M^{\natural})\right|+\left|F_{\Omega,\mathcal Y}(M^{\natural})-\mathbb E_{\omega,Y}\left[g(M^{\natural}_{\omega:},Y_{\omega:})\right]\right|\\
&\quad+\sup_{M\in\mathcal M}\left|F_{\Omega,\mathcal Y}(M)-\mathbb E_{\omega,Y}\left[g(M_{\omega:},Y_{\omega:})\right]\right|,
\end{aligned}\tag{48}
$$

其中 (a) 由三角不等式得到，(b) 用到（47）。回顾 $\min_{\widetilde{\mathcal X}\in\mathcal X^{R,g_\theta}}\|\widetilde{\mathcal X}-\mathcal X^{\natural}\|_\infty\leq\nu$，其中 $\nu\in\{\nu_{\mathrm{BTD}},\nu_{\mathrm{DGM}}\}$ 且 $\nu\geq0$ 为常数。（49）右端第一项可界定为

$$
\begin{aligned}
&\left|F_{\Omega,\mathcal Y}(\bar M)-F_{\Omega,\mathcal Y}(M^{\natural})\right|\tag{50}\\
&=\left|\frac1N\sum_{(i,j)\in\Omega}\sum_{k=1}^{K}\sum_{\ell=1}^{Q}\mathbf 1[Y_{ijk}=\ell]\left(\log(f_\ell(M^{\natural}_{ijk}))-\log(f_\ell(\bar M_{ijk}))\right)\right|\\
&\overset{(a)}{\leq}\frac1N\sum_{(i,j)\in\Omega}\sum_{k=1}^{K}\sum_{\ell=1}^{Q}\mathbf 1[Y_{ijk}=\ell]\left|\log(f_\ell(M^{\natural}_{ijk}))-\log(f_\ell(\bar M_{ijk}))\right|\\
&\overset{(b)}{\leq}\frac1N\sum_{(i,j)\in\Omega}\sum_{k=1}^{K}\sum_{\ell=1}^{Q}\mathbf 1[Y_{ijk}=\ell]L_\alpha\frac1a\left\|\mathcal X^{\natural}-\widetilde{\mathcal X}\right\|_\infty\\
&\overset{(c)}{\leq}\frac{L_\alpha\nu}{aN}\sum_{(i,j)\in\Omega}\sum_{k=1}^{K}\sum_{\ell=1}^{Q}\mathbf 1[Y_{ijk}=\ell]\leq\frac{L_\alpha\nu}{aN}\sum_{(i,j)\in\Omega}\sum_{k=1}^{K}1\leq\frac{KL_\alpha\nu}{a}.
\end{aligned}
$$

其中 (a) 用三角不等式；(b) 用了对数凹性质、事实 2 与（35）；(c) 用到 $\sum_{\ell=1}^{Q}\mathbf 1[Y_{ijk}=\ell]=1$。（49）第二项可用 Hoeffding 不等式 [53] 对独立随机变量 $Z_\omega=g(M_{\omega:},Y_{\omega:})$（$Z_\omega\in[0,KU_\alpha]$）界定：以大于 $1-\delta$ 的概率有

$$
\left|F_{\Omega,\mathcal Y}(M^{\natural})-\mathbb E_{\omega,Y}\left[g(M^{\natural}_{\omega:},Y_{\omega:})\right]\right|\leq\sqrt{(KU_\alpha)^2\frac{\log(1/\delta)}{2N}}.\tag{51}
$$

对（49）第三项，注意 $F_{\Omega,\mathcal Y}(M)$ 是独立同分布抽取的联合随机变量 $(\omega,Y)$ 的样本平均，其期望为 $\mathbb E_{\omega,Y}\left[g(M_{\omega:},Y_{\omega:})\right]$，故第三项可用基于 Rademacher 复杂度的论证 [50] 界定。具体地，以至少 $1-\delta$ 的概率有

$$
\sup_{M\in\mathcal M}\left|F_{\Omega,\mathcal Y}(M)-\mathbb E_{\omega,Y}\left[g(M_{\omega:},Y_{\omega:})\right]\right|\leq2\widehat{\mathfrak R}(\mathcal G)+KU_\alpha\sqrt{\frac{8\log(2/\delta)}{N}},\tag{52}
$$

其中 $\widehat{\mathfrak R}(\mathcal G)$ 是如下函数类的经验 Rademacher 复杂度：

$$
\mathcal G=\left\{(\omega,Y)\mapsto g(M_{\omega:},Y_{\omega:})\mid M=h(\mathcal X),\ \mathcal X\in\mathcal X\right\}.
$$

利用 Talagrand 引理 [54, 引理 4.2]，结合引理 1 与 $g(M_{\omega:},Y_{\omega:})$ 关于 $f_\ell$ 的 Lipschitz 性质（事实 2），得

$$
\widehat{\mathfrak R}(\mathcal G)\leq\frac{L_\alpha}{a}\widehat{\mathfrak R}(\mathcal X),
$$

其中 $\mathcal X\in\{\mathcal X^{\mathrm{BTD}},\mathcal X^{\mathrm{DGM}}\}$。利用 Dudley 熵积分 [55, 引理 A.5]，可用集合的覆盖数（参见附录 D-A）界定经验 Rademacher 复杂度：

$$
\widehat{\mathfrak R}(\mathcal X)\leq\zeta(\mathcal X,\mu),\tag{53}
$$

其中

$$
\zeta(\mathcal X,\mu)=\inf_{\mu>0}\left(\frac{4\mu}{\sqrt N}+\frac{12}{N}\int_{\mu}^{\sqrt N}\sqrt{\log\mathcal N(\mathcal X,\epsilon)}\ d\epsilon\right).\tag{54}
$$

结合（49）—（53）得

$$
\mathrm{KL}(M^{\star}\|M^{\natural})\leq\frac{2L_\alpha\zeta(\mathcal X,\mu)}{aK}+\frac{KU_\alpha}{K}\sqrt{\frac{\log(1/\delta)}{2N}}+\frac{U_\alpha K}{K}\sqrt{\frac{8\log(2/\delta)}{N}}+\frac{KL_\alpha\nu}{aK}.\tag{55}
$$

Hellinger 距离与 KL 散度之间的关系 [30] 为

$$
d_H^2(M^{\star},M^{\natural})\leq\mathrm{KL}(M^{\star}\|M^{\natural}).\tag{56}
$$

由 [32, 引理 2] 与事实 2，可用下式界定 Hellinger 距离：

$$
\frac{F_\alpha}{4}\frac{\|M^{\star}-M^{\natural}\|_F^2}{IJK}\leq d_H^2(M^{\star},M^{\natural}).\tag{57}
$$

结合（56）、（57）与引理 1 得

$$
\frac{\|M^{\star}-M^{\natural}\|_F^2}{IJK}\leq\frac{4}{F_\alpha}\mathrm{KL}(M^{\star}\|M^{\natural})\ \Longrightarrow\ \frac{\|\mathcal X^{\star}-\mathcal X^{\natural}\|_F^2}{IJK}\leq\frac{4(\alpha+a)^2}{F_\alpha}\mathrm{KL}(M^{\star}\|M^{\natural}).\tag{58}
$$

定义如下常数：

$$
C_1=\frac{4(\alpha+a)^2}{F_\alpha},\qquad C_2=\frac{L_\alpha}{a}.\tag{59}
$$

结合（55）、（59）与（58）得

$$
\frac{\|\mathcal X^{\star}-\mathcal X^{\natural}\|_F^2}{IJK}\leq C_1\left(\frac{2C_2\zeta(\mathcal X,\mu)}{K}+U_\alpha\sqrt{\frac{\log(1/\delta)}{2N}}+U_\alpha\sqrt{\frac{8\log(2/\delta)}{N}}+C_2\nu\right).\tag{60}
$$

由于 $(\log\mathcal N(\mathcal X,\epsilon))^{1/2}$ 随 $\epsilon$ 减小而增大，（54）的积分可上界为

$$
\int_{\mu}^{\sqrt N}\left(\log\mathcal N(\mathcal X,\epsilon)\right)^{1/2}d\epsilon\leq\sqrt N\left(\log\mathcal N(\mathcal X,\mu)\right)^{1/2}.\tag{61}
$$

下面两个小节分别用上述技术准备证明定理 1 与 2。

**1) 定理 1 的证明。** 在 $\zeta(\mathcal X,\mu)$ 中令 $\mu=\sqrt R$、$\mathcal X=\mathcal X^{\mathrm{BTD}}$，并利用引理 2 与（61）：

$$
\begin{aligned}
\int_{\sqrt R}^{\sqrt N}\left(\log\mathcal N(\mathcal X^{\mathrm{BTD}},\epsilon)\right)^{1/2}d\epsilon&=\sqrt{NR}\left(\sqrt{((I+J)L+K)\log(3\sqrt R(\beta+\kappa))}\right.\\
&\qquad\left.+\sqrt{K\log(\kappa/2)}+(I+J)L\log(\beta)\right)\\
&=\frac{\sqrt{NR}}{3}\tau,
\end{aligned}\tag{62}
$$

其中 $\tau=3\left(\sqrt{((I+J)L+K)\log(3\sqrt R(\beta+\kappa))}+\sqrt{K\log(\kappa/2)}+(I+J)L\log(\beta)\right)$。结合（62）与（54）得

$$
\zeta\left(\mathcal X^{\mathrm{BTD}},\sqrt R\right)=4(1+\tau)\sqrt{\frac RN}.\tag{63}
$$

结合（60）与（63）得

$$
\frac{\|\mathcal X^{\star}-\mathcal X^{\natural}\|_F^2}{IJK}\leq\frac{8C_1C_2(1+\tau)}{K}\sqrt{\frac RN}+U_\alpha C_1\sqrt{\frac{\log(1/\delta)}{2N}}+U_\alpha C_1\sqrt{\frac{8\log(2/\delta)}{N}}+C_1C_2\nu_{\mathrm{BTD}}.\tag{64}
$$

注意（49）中第二、三项都以至少 $1-\delta$ 的概率被上界约束，因此（64）的整体上界以至少 $1-2\delta$ 的概率成立。定理 1 证毕。

**2) 定理 2 的证明。** 在 $\zeta(\mathcal X,\mu)$ 中令 $\mu=\sqrt R$、$\mathcal X=\mathcal X^{\mathrm{DGM}}$，并利用事实 3 与（61）：

$$
\begin{aligned}
\int_{\sqrt R}^{\sqrt N}\left(\log\mathcal N(\mathcal X^{\mathrm{DGM}},\epsilon)\right)^{1/2}d\epsilon&=\sqrt{NR}\left(\sqrt{(K+D)\log(3\sqrt R(\beta+\kappa))+K\log(\kappa/2)+D\log(Pq)}\right)\\
&=\sqrt{NR}\sqrt{K\log\left(\frac32\sqrt{R\kappa}(\beta+\kappa)\right)+D\log\left(3\sqrt{RP}q(\beta+\kappa)\right)}\\
&=\frac{\sqrt{NR}}{3}\tau,
\end{aligned}\tag{65}
$$

其中 $\tau=3\sqrt{K\log\left(\frac32\sqrt{R\kappa}(\beta+\kappa)\right)+D\log\left(3\sqrt{RP}q(\beta+\kappa)\right)}$。结合（65）与（54）得

$$
\zeta\left(\mathcal X^{\mathrm{DGM}},\sqrt R\right)=4(1+\tau)\sqrt{\frac RN}.\tag{66}
$$

结合（60）与（66），以至少 $1-2\delta$ 的概率有

$$
\frac{\|\mathcal X^{\star}-\mathcal X^{\natural}\|_F^2}{IJK}\leq\frac{8C_1C_2(1+\tau)}{K}\sqrt{\frac RN}+U_\alpha C_1\sqrt{\frac{\log(1/\delta)}{2N}}+U_\alpha C_1\sqrt{\frac{8\log(2/\delta)}{N}}+C_1C_2\nu_{\mathrm{DGM}}.\tag{67}
$$

定理 2 证毕。

## 参考文献（英文原书目）

以下按原 PDF 第 12—13 页的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] G. Mateos, J.-A. Bazerque, and G. B. Giannakis, "Spline-based spectrum cartography for cognitive radios," in Proc. IEEE Conf. Rec. Asilomar Conf. Signals Syst., 2009, pp. 1025–1029.

[2] J. A. Bazerque, G. Mateos, and G. B. Giannakis, "Group-lasso on splines for spectrum cartography," IEEE Trans. Signal Process., vol. 59, no. 10, pp. 4648–4663, 2011.

[3] G. Boccolini, G. Hernandez-Penaloza, and B. Beferull-Lozano, "Wireless sensor network for spectrum cartography based on kriging interpolation," in Proc. IEEE PIMRC, 2012, pp. 1565–1570.

[4] S.-J. Kim and G. B. Giannakis, "Cognitive radio spectrum prediction using dictionary learning," in Proc. IEEE GLOBECOM, 2013, pp. 3206–3211.

[5] B. A. Jayawickrama, E. Dutkiewicz, I. Oppermann, G. Fang, and J. Ding, "Improved performance of spectrum cartography based on compressive sensing in cognitive radio networks," in Proc. IEEE ICC, 2013, pp. 5657–5661.

[6] G. Zhang, X. Fu, J. Wang, X.-L. Zhao, and M. Hong, "Spectrum cartography via coupled block-term tensor decomposition," IEEE Trans. Signal Process., vol. 68, pp. 3660–3675, 2020.

[7] S. Shrestha, X. Fu, and M. Hong, "Deep spectrum cartography: Completing radio map tensors using learned neural models," IEEE Trans. Signal Process., vol. 70, pp. 1170–1184, 2022.

[8] Y. Teganya and D. Romero, "Data-driven spectrum cartography via deep completion autoencoders," in Proc. IEEE ICC, 2020, pp. 1–7.

[9] S. Bi, J. Lyu, Z. Ding, and R. Zhang, "Engineering radio maps for wireless resource management," IEEE Wirel. Commun., vol. 26, no. 2, pp. 133–141, 2019.

[10] D. Romero, S.-J. Kim, G. B. Giannakis, and R. López-Valcarce, "Learning power spectrum maps from quantized power measurements," IEEE Trans. Signal Process., vol. 65, no. 10, pp. 2547–2560, 2017.

[11] M. Hamid and B. Beferull-Lozano, "Non-parametric spectrum cartography using adaptive radial basis functions," in Proc. IEEE ICASSP, 2017, pp. 3599–3603.

[12] J. A. Bazerque and G. B. Giannakis, "Distributed spectrum sensing for cognitive radio networks by exploiting sparsity," IEEE Trans. Signal Process., vol. 58, no. 3, pp. 1847–1862, 2009.

[13] B. Khalfi, B. Hamdaoui, and M. Guizani, "Airmap: Scalable spectrum occupancy recovery using local low-rank matrix approximation," in Proc. IEEE GLOBECOM, 2018, pp. 206–212.

[14] D. Schäufele, R. L. Cavalcante, and S. Stanczak, "Tensor completion for radio map reconstruction using low rank and smoothness," in Proc. IEEE SPAWC, 2019, pp. 1–5.

[15] H. Sun and J. Chen, "Propagation map reconstruction via interpolation assisted matrix completion," IEEE Trans. Signal Process., vol. 70, pp. 6154–6169, 2022.

[16] Q. Niu, Y. Nie, S. He, N. Liu, and X. Luo, "Recnet: A convolutional network for efficient radiomap reconstruction," in Proc. IEEE ICC, 2018, pp. 1–7.

[17] V. V. Ratnam, H. Chen, S. Pawar, B. Zhang, C. J. Zhang, Y.-J. Kim, S. Lee, M. Cho, and S.-R. Yoon, "Fadenet: Deep learning-based mm-wave large-scale channel fading prediction and its applications," IEEE Access, vol. 9, pp. 3278–3290, 2020.

[18] X. Han, L. Xue, F. Shao, and Y. Xu, "A power spectrum maps estimation algorithm based on generative adversarial networks for underlay cognitive radio networks," Sensors, vol. 20, no. 1, p. 311, 2020.

[19] E. Krijestorac, S. Hanna, and D. Cabric, "Spatial signal strength prediction using 3d maps and deep learning," in Proc. IEEE ICC, 2021, pp. 1–6.

[20] O. Mehanna and N. D. Sidiropoulos, "Frugal sensing: Wideband power spectrum sensing from few bits," IEEE Trans. Signal Process., vol. 61, no. 10, pp. 2693–2703, 2013.

[21] A. Konar, N. D. Sidiropoulos, and O. Mehanna, "Parametric frugal sensing of power spectra for moving average models," IEEE Trans. Signal Process., vol. 63, no. 5, pp. 1073–1085, 2014.

[22] X. Fu, N. D. Sidiropoulos, J. H. Tranter, and W.-K. Ma, "A factor analysis framework for power spectra separation and multiple emitter localization," IEEE Trans. Signal Process., vol. 63, no. 24, pp. 6581–6594, 2015.

[23] X. Fu, N. D. Sidiropoulos, and W.-K. Ma, "Power spectra separation via structured matrix factorization," IEEE Trans. Signal Process., vol. 64, no. 17, pp. 4592–4605, 2016.

[24] S. Timilsina, S. Shrestha, and X. Fu, "Deep spectrum cartography using quantized measurements," in Proc. IEEE ICASSP, 2023.

[25] X. Fu, S. Ibrahim, H.-T. Wai, C. Gao, and K. Huang, "Block-randomized stochastic proximal gradient for low-rank tensor factorization," IEEE Trans. Signal Process., vol. 68, pp. 2170–2185, 2020.

[26] Y. L. Polo, Y. Wang, A. Pandharipande, and G. Leus, "Compressive wide-band spectrum sensing," in Proc. IEEE ICASSP, 2009, pp. 2337–2340.

[27] L. De Lathauwer, "Decompositions of a higher-order tensor in block terms—part ii: Definitions and uniqueness," SIAM Journal on Matrix Analysis and Applications, vol. 30, no. 3, pp. 1033–1066, 2008.

[28] W. Han, J. Li, Z. Tian, and Y. Zhang, "Efficient cooperative spectrum sensing with minimum overhead in cognitive radio," IEEE Trans. Wireless Commun., vol. 9, no. 10, pp. 3006–3011, 2010.

[29] D. Lee, T. Sasaki, T. Yamada, K. Akabane, Y. Yamaguchi, and K. Uehara, "Spectrum sensing for networked system using 1-bit compressed sensing with partial random circulant measurement matrices," in Proc. IEEE VTC, 2012, pp. 1–5.

[30] M. A. Davenport, Y. Plan, E. Van Den Berg, and M. Wootters, "1-bit matrix completion," Information and Inference: A Journal of the IMA, vol. 3, no. 3, pp. 189–223, 2014.

[31] S. A. Bhaskar, "Probabilistic low-rank matrix completion from quantized measurements," The Journal of Machine Learning Research, vol. 17, no. 1, pp. 2131–2164, 2016.

[32] Y. Cao and Y. Xie, "Categorical matrix completion," in Proc. IEEE CAMSAP, 2015, pp. 369–372.

[33] N. Ghadermarzy, Y. Plan, and O. Yilmaz, "Learning tensors from partial binary measurements," IEEE Trans. Signal Process., vol. 67, no. 1, pp. 29–40, 2018.

[34] B. Li, X. Zhang, X. Li, and H. Lu, "Tensor completion from one-bit observations," IEEE Trans. Image Process., vol. 28, no. 1, pp. 170–180, 2018.

[35] P. McCullagh, "Regression models for ordinal data," Journal of the Royal Statistical Society: Series B (Methodological), vol. 42, no. 2, pp. 109–127, 1980.

[36] C. Lee and M. Wang, "Tensor denoising and completion based on ordinal observations," in Proc. ICML. PMLR, 2020, pp. 5778–5788.

[37] L. Schuchman, "Dither signals and their effect on quantization noise," IEEE Trans. Commun. Technol., vol. 12, no. 4, pp. 162–165, 1964.

[38] S. P. Lipshitz, R. A. Wannamaker, and J. Vanderkooy, "Quantization and dither: A theoretical survey," Journal of the audio engineering society, vol. 40, no. 5, pp. 355–375, 1992.

[39] Pytorch, "torch.autograd," 2022. [Online]. Available: https://pytorch.org/docs/stable/autograd.html

[40] J. Duchi, E. Hazan, and Y. Singer, "Adaptive subgradient methods for online learning and stochastic optimization." Journal of Machine Learning Research, vol. 12, no. 7, 2011.

[41] D. P. Kingma and J. Ba, "Adam: A method for stochastic optimization," in Proc. ICLR, 2015.

[42] M. Hong, M. Razaviyayn, Z.-Q. Luo, and J.-S. Pang, "A unified algorithmic framework for block-structured optimization involving big data: With applications in machine learning and signal processing," IEEE Signal Process. Mag., vol. 33, no. 1, pp. 57–77, 2015.

[43] E. E. Papalexakis, N. D. Sidiropoulos, and R. Bro, "From k-means to higher-way co-clustering: Multilinear decomposition with sparse latent factors," IEEE Trans. Signal Process., vol. 61, no. 2, pp. 493–506, 2012.

[44] A. S. Lan, C. Studer, and R. G. Baraniuk, "Matrix recovery from quantized and corrupted measurements," in Proc. IEEE ICASSP, 2014, pp. 4973–4977.

[45] A. S. Lan, C. Studer, A. E. Waters, and R. G. Baraniuk, "Tag-aware ordinal sparse factor analysis for learning and content analytics," in Proc. International Conference on Educational Data Mining, EDM, 2013.

[46] T. Cai and W.-X. Zhou, "A max-norm constrained minimization approach to 1-bit matrix completion," Journal of Machine Learning Research, vol. 14, pp. 3619–3647, 2013.

[47] M. Ding, X. Fu, T.-Z. Huang, J. Wang, and X.-L. Zhao, "Hyperspectral super-resolution via interpretable block-term tensor modeling," IEEE J. Sel. Top. Signal Process., vol. 15, no. 3, pp. 641–656, 2020.

[48] A. Goldsmith, Wireless communications. Cambridge University Press, 2005.

[49] T. King, S. Kopf, T. Haenselmann, C. Lubberger, and W. Effelsberg. Crawdad dataset mannheim/compass (v. 2008-04-11). [Online]. Available: https://crawdad.org/mannheim/compass/20080411

[50] S. Shalev-Shwartz and S. Ben-David, Understanding machine learning: From theory to algorithms. Cambridge university press, 2014.

[51] D. Pollard, "Empirical processes: Theory and applications," in NSF-CBMS Regional Conference Series in Probability and Statistics. JSTOR, 1990, pp. i–86.

[52] M. Ding, X. Fu, and X.-L. Zhao, "Fast and structured block-term tensor decomposition for hyperspectral unmixing," IEEE J. Sel. Top. Appl. Earth Obs. Remote Sens., 2023.

[53] W. Hoeffding, "Probability inequalities for sums of bounded random variables," Journal of the American statistical association, vol. 58, no. 301, pp. 13–30, 1963.

[54] M. Mohri, A. Rostamizadeh, and A. Talwalkar, Foundations of machine learning. MIT press, 2018.

[55] P. L. Bartlett, D. J. Foster, and M. J. Telgarsky, "Spectrally-normalized margin bounds for neural networks," in Proc. NIPS, vol. 30. Curran Associates, Inc., 2017.

**本页范围与校对状态：** 本页依据 arXiv:2303.01770v2（eess.SP，2023-08-23，16 页）完成全文中文翻译：摘要、索引词、第 I—VII 节（含各小节、Remark 1—2、Fact 1—3、Lemma 1—2、Definition 1、Assumption 1—3、Theorem 1—2）、结论、图 1—8 中文图注、表 I—IX 逐格转录、附录 A—D、参考文献 [1]—[55] 英文原条目（按原编号）。公式编号 (1)—(67) 按原文保留。表 I—VIII 的数值已用 PDF 第 10—12 页渲染图逐格核对，表 IX 已用第 13 页渲染图核对。**逐句逐式终校未做**；图内曲线/图像未作数字化读取，只转录图注与正文给出的关键数值；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：附录 D 中原文从式（43）跳到式（45）（缺（44）号，疑为排版或抽取缺失）、第 VI-A2 节仿真参数取值、以及第 VI-A7 节与附录 D-B 中若干公式的抽取上下标。本页为全文译稿，不宣称已通过逐式校对验收。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
