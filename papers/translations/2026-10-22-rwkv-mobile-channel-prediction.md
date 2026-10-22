---
layout: page
title: "移动信道预测中的全局模式学习与时间顺序刻画：基于 RWKV 的方法｜中文全篇译稿（待终校）"
permalink: /papers/translations/2026-10-22-rwkv-mobile-channel-prediction/
math: true
toc: true
---

[← 返回论文库](/papers/) · [arXiv 原文](https://arxiv.org/abs/2606.16170)

# 移动信道预测中的全局模式学习与时间顺序刻画：基于 RWKV 的方法

**原题：** Synergizing Global Pattern Learning and Time Order Characterization in Mobile Channel Prediction: An RWKV-Based Approach  
**作者：** Zili Wang、Zirui Chen、Ridong Li、Zhaoyang Zhang、Zhaohui Yang  
**机构：** 浙江大学信息与电子工程学院；浙江省多模态通信网络与智能信息处理重点实验室。  
**来源：** arXiv:2606.16170v1，2026 年 6 月 15 日，6 页。  
**译稿说明：** 按原文顺序译出摘要、I–V 节正文、公式（1）–（11）、图 1–6 的图注、表 I–IV、致谢；参考文献保留英文书目信息。本译稿尚待逐式独立终校。

## 摘要

由于能够降低导频开销并缓解信道老化，信道预测正成为无线通信领域的一项重要研究课题。与此同时，深度神经网络凭借优异的非线性表示能力，正在成为高精度预测的一项基础性技术。本文设计了一种任务驱动的预测网络，旨在深入协同两项功能：学习可在相邻时隙之间共享的特征所对应的全局模式，以及通过结构化的时间顺序编码来刻画信道动态过程中的内在因果性。为实现准确的信道预测，本文采用 RWKV（Receptance Weighted Key Value，接纳度加权键值）作为网络骨干，并根据任务的具体特征对其进行调整：利用深度交错学习架构从多个信道样本中提取全局模式，并借助其特有的指数衰减机制刻画时间顺序。这些任务驱动的设计显著提高了预测网络的学习效率。综合实验评估表明，在信道预测任务中，所提出方法优于长短期记忆网络（LSTM）、Transformer 等现有数据驱动方法，归一化均方误差提高 1.84～4.29 dB，余弦相关性提高 2.6～10.5 个百分点。

**关键词：** 信道预测；MIMO-OFDM；深度学习；神经网络；RWKV。

## I. 引言

在无线通信系统中，及时获取准确的信道状态信息（channel state information，CSI）对于制定合适的系统配置参数至关重要。信道预测方法利用过去的信道样本预测当前 CSI，能够显著缓解过高的导频开销和信道老化问题，因而成为具有重要研究价值的课题 [1]。

传统的信号处理方法，例如参数化方法 [2] 与自回归模型 [3]，以具有可解释性的数学模型刻画无线信道。但是，这些方法依赖简化假设，因而难以适应非线性、高度动态的实际通信环境。近年来，深度学习（DL）凭借更好的预测性能引起了广泛关注。文献 [4] 的长短期记忆（LSTM）网络使用门控机制学习数据依赖关系，证明了非线性深度学习方法在预测中的有效性。此外，Transformer [5] 通过自注意力机制，能够比 LSTM 建模更强的全局序列依赖关系。

然而，现有研究通常从数据驱动的角度直接应用先进的网络架构，忽略任务本身固有的特征。本文从任务驱动的视角出发，认为预测网络的性能将显著受益于以下两项核心能力的深度耦合：通过专门的时间依赖模块有效提取全局模式，以充分学习多尺度信道特征；以及采用结构化时间编码，捕捉信道动态背后的因果规律。然而，如表 I 所示，现有方法未能充分协同上述两项能力。具体而言，LSTM [4] 的串行循环结构天然包含时间信息，但它将全部历史压缩进固定大小的隐藏状态，从而削弱了长距离依赖捕获能力。相比之下，Transformer [5] 仅在输入层进行一次加性位置编码，对时间特性的刻画较为浅层。

**表 I：不同模型归纳偏置的一般性比较**

| 固有属性 | LSTM | Transformer | RWKV |
|---|:---:|:---:|:---:|
| 有效建模长距离依赖 | × | ✓ | ✓ |
| 结构化位置编码 | ✓ | × | ✓ |

据此，本文将新兴的 RWKV [6] 引入信道预测任务，并进行必要的适配。该架构尤其契合全局模式学习与结构化时间顺序刻画深度协同的功能需求。本文主要贡献如下。

1. 分析了预测任务中多尺度信道特征学习面临的挑战，并据此提出一种协同全局模式学习与结构化时间编码的新型网络框架。
2. 使用 RWKV 满足上述任务驱动要求，借助其深度交错架构提取全局模式，并利用时间衰减机制刻画信道动态中的因果特征。
3. 实验表明，模型具有较强的竞争力，尤其是在低数据量场景下表现突出，并且面对噪声以及数据相关性变化具有更好的鲁棒性与适应能力。

## II. 系统模型

本节介绍多输入多输出正交频分复用（MIMO-OFDM）信道模型 [7]，并给出信道预测任务的问题表述及其物理过程。

### A. 信道模型

考虑一个 MIMO-OFDM 系统：基站（BS）采用具有 $N_t$ 根天线的均匀线性阵列（ULA），与多个单天线用户通信。每个信道包含 $P$ 条传播路径，它们的叠加决定 $N_c$ 个子载波上的信道响应：

$$
\mathbf h(f)=\sum_{p=1}^{P}\alpha_p e^{-j2\pi f\tau_p}\mathbf a(\theta_p).\tag{1}
$$

其中，$\alpha_p$、$\tau_p$ 和 $\theta_p$ 分别表示第 $p$ 条路径的幅度衰减、传播时延和到达角（AoA）；$f$ 表示载波频率。阵列响应 $\mathbf a(\theta_p)$ 的具体表达式为

$$
\mathbf a(\theta_p)=\left[1,e^{-j2\pi f\frac{d\cos\theta_p}{c}},\ldots,e^{-j2\pi f\frac{d(N_t-1)\cos\theta_p}{c}}\right]^{\mathsf T}.\tag{2}
$$

其中，$c$ 为光速，$d$ 为相邻天线之间的间距。第 $i+1$ 根天线相对于第一根天线的传播距离差为 $di\cos\theta_p$，由此产生相位偏移 $2\pi fdi\cos\theta_p/c$。因此，基站与单个用户之间的 CSI 矩阵 $\mathbf H\in\mathbb C^{N_t\times N_c}$ 表示为

$$
\mathbf H=[\mathbf h(f_1),\mathbf h(f_2),\ldots,\mathbf h(f_{N_c})].\tag{3}
$$

这里，$f_i=f_1+(i-1)\Delta f$，$i=1,2,\ldots,N_c$；$f_i$ 与 $f_1$ 分别为第 $i$ 个和第一个子载波的频率，$\Delta f$ 为相邻子载波间隔。

### B. 问题表述

假设基站已存储过去 $n$ 个时间步的 CSI，即 $\{\mathbf H_{t-n},\ldots,\mathbf H_{t-1}\}$，以 $\widehat{\mathbf H}_t$ 表示对当前时刻 $t$ 的 CSI 预测值。那么，信道预测问题可表示为

$$
\widehat{\mathbf H}_t=g_{\mathrm{CP}}(\mathbf H_{t-n},\ldots,\mathbf H_{t-1}),\tag{4}
$$

其中，$g_{\mathrm{CP}}(\cdot)$ 为信道预测函数。

信道动态是连续的物理过程，由用户运动过程中 $\alpha_p$、$\tau_p$ 和 $\theta_p$ 等参数的平滑变化决定。如式（4）所示，历史信道矩阵序列 $\mathbf H_{t-n},\ldots,\mathbf H_{t-1}$ 是对连续过程进行离散观测得到的，因此必须按照时间顺序依次输入模型。这表明信道预测是一项严格意义上的时间序列任务。

此外，信道状态的动态变化也是多尺度物理过程。其小尺度快衰落由式（1）中的相位项 $e^{-j2\pi f\tau_p}$ 决定，而大尺度慢衰落则由幅度项 $\alpha_p$ 决定。在局部空间区域内，由于散射环境和多径结构高度相似，幅度 $\alpha_p$ 保持相对稳定。相反，用户的微小运动所引起的传播时延 $\tau_p$ 的细微变化，会被较高的载波频率 $f$ 显著放大，从而造成快速相位波动。这意味着，小尺度分量反映精细的局部信道动态，大尺度分量则反映更广阔通信环境下的长期趋势。

## III. 所提方法及相关分析

本节详细介绍基于 RWKV 的信道预测方法，包括任务驱动的功能需求、RWKV 的基本原理及完整网络架构。

### A. 先进预测模型的需求

根据 II-B 节讨论的信道预测物理特征，首先明确模型需要满足的功能要求。第一，按顺序处理输入信道矩阵 $\mathbf H_{t-n},\ldots,\mathbf H_{t-1}$，以学习信道逐步演化的关系。因此，模型学习输入序列的时间顺序至关重要。尽管 LSTM 的循环结构天然适合感知时间关系，但它也使各个具体输入对当前输出的贡献变得模糊，限制了对全局依赖关系的捕获。这一局限促使研究者采用 Transformer 一类的显式位置编码。然而，仅在输入层加入一次加性位置编码，仍属于较为表层的处理。因此，需要将结构特征与显式位置编码结合起来，以结构化方式刻画时间顺序。具体而言，应在每一层重复应用公式化的位置编码，使时间位置的处理嵌入网络更基础的计算层次。同时，位置编码不应仅仅识别先后顺序，还应刻画主导信道动态的因果规律。

此外，完整的信道动态由大尺度和小尺度特征共同组成。为了获取多尺度特征，需要进行全局模式学习。观察涵盖更大空间范围的完整输入历史，能够使模型更充分地学习多尺度信道特征，进而更深入地理解通信环境。除了使用全部历史数据，模型还必须高效地管理输入序列。具体而言，模型应能够依据每个输入的内容和时间位置赋予其独有权重，从而自适应地关注最重要的历史信息。这种动态分配方式有助于高效管理记忆，并增强捕获长距离依赖关系的能力。

### B. RWKV 的架构与特征

RWKV [6] 作为一种新兴学习架构，已在大语言模型（LLM）领域展现出良好前景。RWKV 的时间混合（time mixing）模块源自无注意力 Transformer（AFT）[8]，通过修改位置编码方式显著减少参数数量，定义如下：

$$
\mathrm{wkv}_t=
\frac{\sum_{i=1}^{t-1}e^{-(t-1-i)\mathbf w+\mathbf k_i}\odot\mathbf v_i
+e^{\mathbf u+\mathbf k_t}\odot\mathbf v_t}
{\sum_{i=1}^{t-1}e^{-(t-1-i)\mathbf w+\mathbf k_i}
+e^{\mathbf u+\mathbf k_t}}.\tag{5}
$$

$$
\mathbf o_t=\mathbf W_o\cdot\big(\sigma(\mathbf r_t)\odot\mathrm{wkv}_t\big).\tag{6}
$$

其中，$\mathbf k_t$、$\mathbf v_t$ 和 $\mathbf r_t$ 为根据时刻 $t$ 与 $t-1$ 的输入动态计算得到的参数；$\mathbf w$ 和 $\mathbf u$ 为可学习向量。$\mathbf w$ 是施加于过去 token 的时间衰减权重，$\mathbf u$ 则为当前 token 提供直接的额外权重。$\odot$ 表示逐元素乘法，$\sigma(\cdot)$ 是非线性 Sigmoid 函数，$\mathbf W_o$ 表示全连接（FC）层的作用。此外，为实现串行推理，式（5）可以改写为递推形式：

$$
\mathrm{wkv}_t=
\frac{\mathbf a_{t-1}+e^{\mathbf u+\mathbf k_t}\odot\mathbf v_t}
{\mathbf b_{t-1}+e^{\mathbf u+\mathbf k_t}},\tag{7}
$$

其中，$\mathbf a_t=e^{-\mathbf w}\odot\mathbf a_{t-1}+e^{\mathbf k_t}\odot\mathbf v_t$，$\mathbf b_t=e^{-\mathbf w}\odot\mathbf b_{t-1}+e^{\mathbf k_t}$。

如式（5）所示，时间混合模块的核心是时间衰减机制。该机制为每个历史输入分配特定权重，且权重随该输入距当前时间步的间隔增大而指数衰减。这种机制既可对全局输入进行动态加权，又能够高效压缩历史信息，是捕获全局依赖关系的重要条件。

逐层应用上述权重，使模型以结构化方式嵌入时间顺序意识。此外，衰减权重的设计引入了具有直观物理意义的先验：历史 CSI 与当前信道状态的相关性随时间推移而降低。这是因为在通常情况下，时间上接近的 CSI 实例也对应空间上相邻的区域，具有相似的散射环境和传播路径结构，因而相关性更强。

### C. 将 RWKV 适配于信道预测任务

RWKV 的架构特性与信道预测的功能需求高度一致。因此，本文将其引入信道预测，并进行必要调整。

标准深度学习网络通常处理实数，而信道矩阵是复数值数据，其实部和虚部共同构成不同维度上的信道结构特征。考虑到分别处理实部和虚部会损害信道的结构信息 [9]、[10]，本文将二者堆叠为两个输入维度。这样，网络便能够充分融合实部与虚部之间的信息，提取更加完整的信道特征。

鉴于 RWKV 最初面向大语言模型设计，其输入层和输出层需要适配信道预测任务。本文移除原有的 tokenizer、词嵌入层以及语言模型输出头（LM Head），以一对执行相反维度映射的对称全连接层替换。该设计利用信道的稀疏性，将数据映射至低维空间，以降低计算复杂度。输入嵌入层将大小为 $2\times N_t\times N_c$ 的信道矩阵映射到隐藏层维度，输出全连接层再将表示映射回原始维度。

如图 1 所示，基于 RWKV 的移动信道预测网络由 $N$ 个 RWKV 模块与一个层归一化（LN）层构成。每个 RWKV 模块包含时间混合（time mixing）和信道混合（channel mixing）两个子模块。时间混合模块是 RWKV 时间处理的核心，控制不同时间步之间的信息交换；信道混合模块则在单个时间步内融合不同特征维度的信息。后者的作用类似于 Transformer 中的前馈网络（FFN）[11]，借助非线性变换增强模型表达能力，其计算形式为

$$
\mathbf o'_t=\sigma(\mathbf r'_t)\odot\left[\mathbf W'_v\cdot\big(\max(\mathbf k'_t,0)\big)^2\right].\tag{8}
$$

两个子模块通过残差连接与 LN 连接，有利于深层网络的梯度传播和训练稳定性。此外，状态在不同时间步之间传递，以维持连续的信息流。Token shift 机制通过融合时间步 $t$ 和 $t-1$ 的输入计算 $\mathbf k_t$、$\mathbf v_t$ 和 $\mathbf r_t$，为两个子模块提供必要的计算基础。

RWKV 模块的计算过程如下：在时间混合模块中，输入嵌入层得到大小为 $n\times d$ 的表示后，首先通过 token shift 生成 $\mathbf k_t$、$\mathbf v_t$ 和 $\mathbf r_t$，其计算复杂度为 $O(nd^2)$，其中 $n$ 为序列长度，$d$ 为隐藏维度。然后，由于 $\mathrm{wkv}_t$ 可采用式（7）的递推形式计算，其复杂度仅为 $O(nd)$。最后，经全连接层进行输出投影，增加 $O(nd^2)$ 的运算量。因此，时间混合模块的总复杂度为 $O(nd^2)$。信道混合模块也以 token shift 开始（$O(nd^2)$），随后进行逐元素激活（$O(nd)$）。接着，值投影和输出门控分别引入 $O(nd^2)$ 和 $O(nd)$ 的运算量，使该模块的复杂度同样为 $O(nd^2)$。综合来看，$N$ 个模块的总体计算复杂度为 $O(Nnd^2)$。

训练时仅根据当前时间步的输出 $\widehat{\mathbf H}_t$ 计算损失函数。本文采用均方误差（MSE）：

$$
\mathrm{MSE}=\frac{1}{\mathrm{num}}\sum_{i=1}^{\mathrm{num}}\left\|\mathbf H_i-\widehat{\mathbf H}_i\right\|_F^2,\tag{9}
$$

其中，$\mathrm{num}$ 为训练样本数，$\|\cdot\|_F$ 为矩阵的 Frobenius 范数，与向量的欧氏范数类似。

**图 1：** 所提出的基于 RWKV 的移动信道预测学习结构。各历史 CSI 经嵌入层后依次输入 RWKV 模块；每个模块由时间混合、信道混合、token shift、门控和归一化等操作组成；最终输出预测信道。

## IV. 实验

本节介绍实验设置，并评估所提出模型的性能。

### A. 实验设置

仿真实验使用 DeepMIMO 数据集 [12]。所选城市室外场景“O1”的详细参数列于表 II。该设置中，基站 BS3 为图 2 红框区域内 R701 至 R1400 的用户提供服务。由于 DeepMIMO 提供的是静态信道数据，本文以空间间隔替代时间间隔，构造所需的时间序列预测任务。假设用户以恒定速度沿 $x$ 轴、$y$ 轴或对角线路径运动。在这一假设下，空间上等距用户的 CSI 被建模为均匀采样的时间序列。

**图 2：** DeepMIMO 数据集中的“O1”场景。图中示出基站 BS3 及相关用户区域。

为验证所提方法的有效性，选择两种主流信道预测方法 LSTM [13] 和 Transformer [11] 作为基线。在模型规模方面，确保各基线模型的参数量足以使其性能达到饱和，以保证公平比较。各模型的具体参数列于表 III。

**表 II：DeepMIMO 数据集参数设置**

| 参数 | 数值 |
|---|---|
| 场景 | O1 |
| 频段 | 3.5 GHz |
| 带宽 | 40 MHz |
| 基站 | BS3 |
| 天线阵列 | ULA |
| 天线数量 $N_t$ | 32 |
| 子载波数量 $N_c$ | 32 |
| 路径数量 $P$ | 25 |
| 用户区域 | R701–R1400 |
| 区域面积 | 79.8 m × 36 m |
| 训练数据量 | 10,000、20,000、40,000、80,000（默认 40,000） |
| 测试数据量 | 20,000 |
| 序列长度 | 8 |

以归一化均方误差（NMSE）和余弦相关系数 $\rho$ 评价预测性能：

$$
\mathrm{NMSE}=\mathbb E\left\{\frac{\|\mathbf H-\widehat{\mathbf H}\|_F^2}{\|\mathbf H\|_F^2}\right\},\tag{10}
$$

$$
\rho=\mathbb E\left\{\frac{1}{N_c}\sum_{m=1}^{N_c}
\frac{|\widehat{\mathbf h}_m^{\mathsf H}\mathbf h_m|}
{\|\widehat{\mathbf h}_m\|_2\,\|\mathbf h_m\|_2}\right\}.\tag{11}
$$

其中，$\mathbf H$ 和 $\mathbf h_m$ 分别是真实信道矩阵与第 $m$ 个子载波的真实信道向量，$\widehat{\mathbf H}$ 和 $\widehat{\mathbf h}_m$ 是相应预测值；$\|\cdot\|_F$ 为 Frobenius 范数。

**表 III：RWKV、Transformer 和 LSTM 的参数设置**

| 参数 | 设置 |
|---|---|
| 批大小 | 400 |
| 隐藏维度 | 512 |
| 训练轮数 | 1000 |
| 损失函数 | MSE |
| 优化器 | AdamW |
| 网络模块数 | RWKV：6；Transformer：5；LSTM：3 |
| 学习率（RWKV 与 Transformer） | 线性预热 → 余弦衰减 → 常数；预热步数 15,000、余弦衰减步数 166,500、常数阶段 81,500；初始学习率 $10^{-3}$，最大学习率 $10^{-2}$，常数学习率 $5\times10^{-7}$ |
| 学习率（LSTM） | 初始 $10^{-3}$；在第 150、350、450 个 epoch 乘以 0.2 |

### B. 性能评估

**1）预测精度。** 为评估模型的预测准确性和样本效率，本文在四种不同训练集规模下，将 RWKV 与 LSTM、Transformer 进行比较，结果汇总于表 IV。实验表明，随着训练数据增多，所有模型的性能都有提高，其中 Transformer 的增益尤其明显；但所提出的 RWKV 在全部数据规模下均保持领先，在低数据量场景下优势尤为突出。在 40,000 个训练样本的条件下（其余实验均沿用这一设置），RWKV 的 NMSE 优势为 1.84～4.29 dB，余弦相关系数优势为 2.6～10.5 个百分点。这一优势来源于它比 Transformer 更强的归纳偏置，尤其是具有直观物理意义的时间衰减机制。

**表 IV：不同训练数据规模下的 NMSE 与 $\rho$**

| 指标 | 模型 | 10,000 | 20,000 | 40,000 | 80,000 |
|---|---|---:|---:|---:|---:|
| NMSE (dB) | RWKV | −3.16 | −6.68 | −9.13 | −10.81 |
| NMSE (dB) | Transformer | −1.22 | −4.22 | −7.29 | −9.73 |
| NMSE (dB) | LSTM | −1.07 | −2.87 | −4.84 | −7.11 |
| $\rho$ | RWKV | 0.8745 | 0.9345 | 0.9536 | 0.9626 |
| $\rho$ | Transformer | 0.7992 | 0.8804 | 0.9295 | 0.9518 |
| $\rho$ | LSTM | 0.6645 | 0.7825 | 0.8629 | 0.9180 |

除平均预测精度之外，还通过计算各测试样本 NMSE 的累积分布函数（CDF）评估模型的泛化表现，结果见图 3。所提 RWKV 模型的高误差样本比例最低。具体而言，约 80% 的预测误差落在 NMSE 为 0.2 以下的范围内，说明模型具有较高的精度和稳定性。

**图 3：** 预测信道与真实信道之间 NMSE 的累积分布函数。

**2）不同采样间隔下的性能。** 信道预测依赖于模型学习输入数据中的依赖关系。本部分通过改变采样间隔，探讨数据相关性的变化如何影响模型性能。分别在短（其他实验均采用此设置）、中、长三种采样间隔下，训练并比较所提 RWKV 模型与各基线。测试样本上的性能一致性使用第 10 至第 90 百分位的 NMSE 误差棒衡量，误差棒越短说明稳定性越高。

如图 4 所示，所有模型的 NMSE 均随采样间隔增大而增加。性能下降源于高移动性条件下更稀疏的采样所导致的数据相关性降低。在这一过程中，RWKV 的误差增长最慢，且在所有条件下均保持最低误差。即使在长采样间隔下，它相对于基线的优势仍达到 1.88～3.66 dB。这归因于其深度交错架构能够充分利用数据依赖关系，因此对采样间隔变化最不敏感。此外，RWKV 的误差棒始终最短，显示出更好的稳定性。

**图 4：** 不同采样间隔下的 NMSE；误差棒表示测试样本的第 10～90 百分位区间。

**3）对信道噪声的鲁棒性。** 本部分从外部噪声和内部误差传播两个方面，评价所提模型的鲁棒性。首先，将不同强度的噪声加入测试数据，以检验模型对外部噪声的抵抗能力。如图 5 所示，全部方法的 NMSE 均随噪声强度增加而上升，而 RWKV 始终具有最低误差。这说明所提模型对噪声具有较好的鲁棒性，其原因可以归结为对全局依赖关系的准确而有效的建模。

随后，采用多轮自回归测试：将模型当前的预测结果重新作为下一时间步的输入，以考察模型在长期预测中抑制累积误差的能力。如图 6 所示，RWKV 始终优于基线。RWKV 与 Transformer 的预测均在第 6 步失效（NMSE 大于 1），而 LSTM 在第 4 步就已失效。值得注意的是，在仍然有效的预测范围内，RWKV 相对于 Transformer 的性能优势逐步缩小。本文推测，RWKV 的时间衰减机制虽然提供了具有物理直觉的强归纳偏置，使初始预测性能更优，但它对近期输入的较高权重，也会加剧累积误差。

**图 5：** 模型对输入噪声的鲁棒性。  
**图 6：** 多轮自回归测试中模型对误差传播的鲁棒性。

## V. 结论

本文从任务驱动的视角出发，将新兴的 RWKV 模型引入移动信道预测。RWKV 能够满足全局模式学习与时间顺序刻画的任务需求，并经过必要的适配。大量实验表明，与现有方法相比，所提方法具有显著的性能优势，在高移动性、强噪声等困难条件下也表现出良好的鲁棒性。这些优势来自 RWKV 对全局模式学习与结构化时间顺序刻画的深度协同，使其更加符合信道预测任务的功能需求。希望上述发现及任务驱动的模型设计理念能够为更多无线人工智能任务提供启发。

## 致谢

本研究部分获得国家自然科学基金（项目编号 62394292 和 624B2129）、浙江省重点研发计划（项目编号 2023C01021）以及中央高校基本科研业务费专项资金（项目编号 226-2024-00069）的支持。通信作者：Zhaoyang Zhang。

## 参考文献

[1] Z. Chen, Z. Zhang, Z. Yang et al., “Channel deduction: A new learning framework to acquire channel from outdated samples and coarse estimate,” *IEEE J. Sel. Areas Commun.*, vol. 43, no. 3, pp. 944–958, 2025.

[2] R. O. Adeogun, P. D. Teal, and P. A. Dmochowski, “Extrapolation of MIMO mobile-to-mobile wireless channels using parametric-model-based prediction,” *IEEE Trans. Veh. Technol.*, vol. 64, no. 10, pp. 4487–4498, 2014.

[3] A. Duel-Hallen, S. Hu, and H. Hallen, “Long-range prediction of fading signals,” *IEEE Signal Process. Mag.*, vol. 17, no. 3, pp. 62–75, 2000.

[4] W. Jiang and H. D. Schotten, “Deep learning for fading channel prediction,” *IEEE Open J. Commun. Soc.*, vol. 1, pp. 320–332, 2020.

[5] T. Zhou, X. Liu, X. Xiang et al., “Transformer network based channel prediction for CSI feedback enhancement in AI-native air interface,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 9, pp. 11154–11167, 2024.

[6] B. Peng, E. Alcaide, Q. Anthony et al., “RWKV: Reinventing RNNs for the Transformer era,” arXiv:2305.13048, 2023.

[7] Z. Wang, J. Zhang, H. Du et al., “A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications,” *IEEE Commun. Surveys Tuts.*, vol. 26, no. 3, pp. 1560–1605, 2024.

[8] S. Zhai, W. Talbott, N. Srivastava et al., “An attention free Transformer,” arXiv:2105.14103, 2021.

[9] Z. Chen, Z. Zhang, Z. Yang et al., “Channel mapping based on interleaved learning with complex-domain MLP-Mixer,” *IEEE Wireless Commun. Lett.*, vol. 13, no. 5, pp. 1369–1373, 2024.

[10] H. Yu, Y. Liu, and M. Chen, “Complex-valued neural-network-based federated learning for multiuser indoor positioning performance optimization,” *IEEE Internet Things J.*, vol. 11, no. 21, pp. 34065–34077, 2024.

[11] A. Vaswani, N. Shazeer, N. Parmar et al., “Attention is all you need,” *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 30, 2017.

[12] A. Alkhateeb, “DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications,” arXiv:1902.06435, 2019.

[13] S. Hochreiter and J. Schmidhuber, “Long short-term memory,” *Neural Computation*, vol. 9, no. 8, pp. 1735–1780, 1997.
