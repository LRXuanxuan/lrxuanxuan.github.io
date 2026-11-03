---
layout: page
title: "扩散模型无线电地图估计：理论性能分析与采样率准则｜中文全文译文"
permalink: /papers/translations/2026-11-03-2606-25310-diffusion-models-for-radio-map-estimation-performance-analysis/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b2db156c1d8dde55/) · [原文 arXiv](https://arxiv.org/abs/2606.25310/) · [全部目录](/papers/catalog/)

# 扩散模型无线电地图估计：理论性能分析与采样率准则

**原题：** Diffusion Models for Radio Map Estimation: Theoretical Performance Analysis and Sampling Rate Guideline  
**作者：** Zhiyuan Liu（学生会员，IEEE）、Qingyu Liu（会员，IEEE）、Shuhang Zhang（会员，IEEE）、Hongliang Zhang（会员，IEEE）、Lingyang Song（会士，IEEE）。单位（按 PDF 首页脚注原文转写）：Zhiyuan Liu 与 Qingyu Liu 为北京大学深圳研究生院电子与计算机工程学院（深圳 518055）及鹏城实验室（深圳 518055）；Shuhang Zhang 与 Hongliang Zhang 为北京大学电子学院光子与通信国家重点实验室（北京 100871）；Lingyang Song 为北京大学电子学院光子与通信国家重点实验室（北京 100871）、北京大学深圳研究生院电子与计算机工程学院（深圳 518055）及鹏城实验室（深圳 518055）。通讯作者：Qingyu Liu、Lingyang Song。  
**版本：** arXiv:2606.25310v3；15 页；已接受待刊（IEEE TMC，作者声明 Accepted；首页脚注：2026-02-28 收稿、2026-06-27 修回、2026-10-24 录用）。  
**范围与状态：** 全文中文译稿：摘要与关键词、正文第 I–X 节全部正文与小节（§IV-A/IV-B、§VI 的 A1–A4、§VII-A/B/C、§VIII-A/B/C、§IX-A/B）、式 (1)–(41) 编号、图 1–7 全部图注（原文无表格）、参考文献 [1]–[52] 英文原条目；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

## 摘要

无线电地图刻画无线射频度量（例如接收信号强度）的空间分布，是众多无线应用的基础。无线电地图估计问题旨在由稀疏分布传感器测得的有限无线电样本构造无线电地图。近年来，扩散模型被越来越多地用于该问题，但其理论性能仍基本未被考察。因此，在真值无线电地图不可得（这在实际中往往如此）时，难以评估其性能。为弥补这一空白，我们首先把无线电地图估计表述为一个**非线性矩阵补全**问题。随后，我们推导扩散模型估计误差的理论表达式，刻画训练环境与部署环境之间的失配、模型设计以及采样策略对估计无线电地图质量的影响。此外，考虑到所推导的误差表达式依赖于某些在实践中难以获取的信息，我们提出一种可从可观测数据直接计算的**经验近似**。最后，大量仿真表明该经验公式与理论误差表达式高度接近，验证了其在实际部署中的有效性。我们的结果不仅为在真值不可得时评估扩散模型性能提供准则，也为确定达到给定估计精度所需的空间采样传感器数量提供准则。结果进一步揭示了一个**临界传感器数量**，超过该数量后扩散模型的估计性能趋于收敛。

**关键词（Index Terms）：** 无线电地图估计、频谱制图、扩散模型、生成式人工智能。

## 1 引言

无线电地图刻画无线通信信道的关键参数（例如接收信号强度，Received Signal Strength，RSS）在地理关注区域中每个位置上的取值 [1]。它能够支撑动态频谱接入 [2]、高效频谱共享 [3]、基于指纹的定位 [4] 以及智能干扰管理 [5] 等各种无线应用，从而显著提升这些应用的性能。

无线电地图估计问题，特别是**基于采样的无线电地图估计问题**，要求根据区域内稀疏分布的传感器所采集的有限无线电样本构造无线电地图 [6], [7], [8]。由于**极低的采样率**，该问题具有挑战性：性能足够的无线电感知硬件成本高昂（例如即便是 Ettus USRP B200mini 这样的低端传感器也可能超过 1,000 美元 [9]），严重限制了实际可部署的传感器数量。因此，相对于待估计无线电地图的高分辨率而言，无线电样本是**极度稀疏**的。有效的无线电地图估计方法必须能够在极低采样率下取得准确估计，并高效利用极其有限的无线电样本。

传统的无线电地图估计方法基于物理建模 [10], [11], [12], [13] 或插值 [14], [15], [16]，利用数学与统计方法进行估计。然而，这些方法往往难以在动态且地理结构复杂的真实环境中构造高质量无线电地图。这是因为它们没有考虑某些关键先验信息（例如障碍物布局），而这些信息会影响无线电信号传播。

生成式人工智能（Artificial Intelligence，AI）尤其是扩散模型的最新进展，带来了无线电地图估计方式的重大转变。越来越多的工作提出基于扩散模型的无线电地图估计算法。例如，Liu 等 [9] 设计了一个基于扩散的生成式框架用于细粒度无线电地图估计。Wang 等 [17] 提出了一种带有自适应快速傅里叶变换模块的解耦扩散模型用于无线电地图估计。Luo 等 [18] 引入了条件去噪扩散概率模型，从稀疏测量与发射机位置估计无线电地图。Qiu 等 [19] 开发了一种扩散模型，用于从有限数量的参考点插值室内路损无线电地图。

尽管该领域的研究工作日益增多，几乎所有这些工作都有一个共同局限：它们设计基于扩散的模型，并通过把估计的无线电地图与真值无线电地图、或与相对大量的 RSS 测量进行比较来评估模型。然而，在真值无线电地图或大量 RSS 测量不可得的场景下（由于传感器成本高昂，这在实践中往往如此），很难评估所设计的扩散模型的性能。为弥补这一空白，本文给出扩散模型用于无线电地图估计的**理论性能分析**。据我们所知，唯一涉及无线电地图估计理论性能的工作是 Romero 等 [20]。他们的研究先对无线电地图的空间变异性进行理论分析，然后推导某些基于插值方法的估计误差上界。然而，[20] 的结果局限于自由空间传播环境，且专门针对基于插值的技术。因此，它们不适用于障碍物布局等因素会显著影响传播的实际复杂环境，也无法推广到基于扩散模型的算法。

具体而言，我们基于信息论与数据驱动方法，给出扩散模型用于无线电地图估计的理论基础。本文主要贡献总结如下：

- 我们把使用扩散模型的无线电地图估计表述为一个**非线性矩阵补全**问题。基于该表述，我们推导扩散模型所能达到的**最小估计误差**的理论表达式，它由部署分布与真实底层无线电传播规律之间的差异决定。随后我们扩展该表达式以纳入模型设计与采样策略的影响，得到同时刻画分布失配、模型局限与测量稀疏性的**广义估计误差**表达式。
- 考虑到所推导的理论误差表达式依赖于某些在实践中难以获取的信息，我们推导**经验公式**来近似这些表达式，这些公式可从可观测数据直接计算。大量仿真表明这些经验公式与理论误差表达式高度接近，验证了其在实际部署中的实用性。
- 我们的结果不仅为在真值无线电地图不可得、且只能部署有限数量传感器采集无线电样本时评估扩散模型的估计性能提供准则，也为确定达到给定估计精度所需部署用于空间采样的传感器数量提供准则。结果进一步揭示了一个**临界传感器数量**，超过该数量后扩散模型的估计性能趋于收敛。

本文其余部分组织如下：第 II 节介绍相关工作；第 III 节说明无线电地图估计的问题定义；第 IV 节给出矩阵补全的必要背景；第 V 节把基于扩散模型的无线电地图估计问题表述为非线性矩阵补全问题；第 VI 节给出扩散模型用于无线电地图估计的收敛性分析；第 VII 节推导扩散模型无线电地图估计误差的理论表达式；第 VIII 节提出近似理论误差表达式的经验公式；第 IX 节通过大量仿真评估所提经验近似公式；最后，第 X 节总结全文。

## 2 相关工作

无线电地图估计问题一般可分为两类：**无采样**问题与**基于采样**的问题。无采样问题利用来自发射机的信息估计无线电地图，求解此类问题的已有研究包括 [10], [11], [12]。无采样问题假定已知发射机的信息（例如数量、位置与发射功率）。这一假设在实践中可能不成立，因为实际中往往存在许多用户未知的发射机。相比之下，基于采样的问题利用区域内稀疏分布传感器采集的有限无线电样本以及某些先验信息（例如障碍物布局）来估计无线电地图。本文关注基于采样的无线电地图估计问题。

由于极低的采样率，该问题具有挑战性：性能足够的无线电感知硬件成本高昂，严重限制了实际可部署的传感器数量。因此，相对于待估计无线电地图的高分辨率而言，无线电样本极度稀疏。

传统的无线电地图估计方法基于物理建模或插值，利用数学与统计方法进行估计。著名方法包括普通克里金（Ordinary Kriging，OK）[16]、径向基函数（Radial Basis Functions，RBF）[14] 与最近邻（Nearest Neighbor，NN）[21]：

- **OK：** 它使用半变异函数描述空间自相关，并通过已知点观测数据的加权平均来估计未知点的 RSS 值。
- **RBF：** 通过在已知数据点周围构建一组基函数网络，它使用这些基函数的线性组合来逼近未知点的 RSS 值。
- **NN：** 它利用有限的已知无线电样本，依据最近邻原理估计未知位置处的 RSS 值。

其他基于插值的方法包括样条（Spline）[15] 与反距离加权（Inverse Distance Weighting，IDW）[22]。

基于插值的方法通常基于显式的数学规则，其理论基础植根于空间统计与确定性插值原理。它们具有形式简洁、易于部署的优点。然而，它们难以有效建模并刻画复杂因素（例如障碍物布局）对无线电传播的影响。因此，它们在复杂真实环境中估计出的无线电地图往往质量较低。

深度学习 [6], [7], [23] 特别是生成式人工智能的最新进展，带来了无线电地图估计方式的重大转变。越来越多的工作提出基于生成式人工智能的无线电地图估计算法，超越了传统的基于物理建模或基于插值的方法。著名方法包括 CollaboRadio [24] 与 RME-GAN [25]。

- **CollaboRadio：** 它是一个设备—边缘—云协同框架，提出了基于 UNet 的小模型与基于 Transformer 的大模型。
- **RME-GAN：** 它是一个两阶段条件生成对抗网络（Generative Adversarial Network，GAN）框架，把基于模型的插值与基于学习的细化结合起来用于无线电地图估计。

其他基于生成式人工智能的方法包括 RadioMamba [26]、TVR [27]、UniRM [28]、RadioLAM [29] 与 RadioProphet [30]。

生成式人工智能方法采用数据驱动范式：它们从大量数据中学习无线电传播的复杂分布模式，并构造底层传播机制的隐式模型。这一范式与基于插值的方法有本质不同：后者依赖预先定义的简化数学假设，而生成式人工智能方法则从数据中推断复杂的映射关系。因此，两种范式具有显著不同的理论基础与适用规律。

著名的生成式人工智能方法包括 GAN、变分自编码器（Variational AutoEncoder，VAE）与扩散模型。对于无线电地图估计，GAN 能够产生高质量结果，但其训练过程容易出现模式崩溃，且缺乏可解释的收敛保证。VAE 由于对后验分布的近似而引入偏差，使生成误差难以被准确刻画。与 GAN 和 VAE 相比，扩散模型尤为突出——它们建立在随机微分方程（Stochastic Differential Equation，SDE）或常微分方程（Ordinary Differential Equation，ODE）的统一框架之上。这一结构性质使扩散模型相比其他生成模型能够取得更优的估计性能。扩散模型已被成功应用于无线电地图估计，著名方法包括 WiFi-Diffusion [9]、RadioDiff [17]、RM-Gen [18] 与 IRDM [19]。

- **WiFi-Diffusion：** 它首先用扩散模型生成一组质量各异的候选无线电地图，然后利用无线电传播原理识别最准确的地图。
- **RadioDiff：** 它是一个带有自适应快速傅里叶变换模块的解耦扩散模型，用于无线电地图估计。
- **RM-Gen：** 它是一个条件去噪扩散概率模型，利用稀疏 RSS 片段与发射机位置生成完整无线电地图，并引入环境感知方法以选取关键数据片段。
- **IRDM：** 它是一个为室内无线电地图插值设计的生成式扩散模型，借助多阶段训练策略与在线数据增强，从有限数量的参考点恢复完整路损地图。

**图 1（原文 Fig. 1）：** 无线电地图估计问题的示意图。图中给出从"稀疏无线电地图采样"（Sparse Radio Map Sampling）出发，经"无线电地图估计方法"（Radio Map Estimation Method）得到"最终无线电地图"（Final Radio Map）的流程，并示意网络规划、位置跟踪与频谱管理等应用；采样环节由区域内稀疏部署的传感器完成。

对于这些基于扩散模型的无线电地图估计研究，它们都遵循一个共同模式：设计基于扩散的模型，并通过把估计的无线电地图与真值无线电地图、或与相对大量采集的无线电样本进行比较来评估模型。然而，在真值无线电地图或大量无线电样本不可得（由于传感器成本高昂，实践中往往如此）的场景中，很难评估所设计模型的性能。为弥补这一空白，我们给出扩散模型的理论性能分析，它无需访问真值无线电地图或大量无线电样本即可量化估计误差。据我们所知，唯一涉及无线电地图估计理论性能的工作是 Romero 等 [20]。他们的研究先对无线电地图的空间变异性进行理论分析，然后推导某些基于插值方法的估计误差上界。然而，[20] 的结果局限于自由空间传播环境，且专门针对基于插值的技术。因此，它们不适用于障碍物布局等因素会显著影响传播的实际复杂环境，也无法推广到扩散模型。

## 3 问题定义：无线电地图估计

考虑二维（2D）关注区域 \(\mathcal{X}\subset\mathbb{R}^2\)。在 \(\mathcal{X}\) 上部署 \(S\) 个传感器的集合 \(\mathcal{S}=\{1,2,\cdots,S\}\)，每个传感器 \(s\in\mathcal{S}\) 位于互不相同的坐标 \(x_s\in\mathcal{X}\)。每个传感器 \(s\) 在其位置 \(x_s\) 处测量特定频段的 RSS \(r_s\)（假定测量期间通过微小的时/空变化把快衰落效应平均掉）。这些无线电样本（RSS 测量）\(\{r_s,\forall s\in\mathcal{S}\}\) 被上报到融合中心，融合中心可以是基站或云服务器，取决于具体应用。

考虑连续空间 \(\mathcal{X}\) 被离散为 \(m\times n\) 网格。无线电地图可用 \(m\times n\) 矩阵 \(M\) 表示，其索引 \((h,w)\)（\(h\in\{0,1,\cdots,m-1\}\)，\(w\in\{0,1,\cdots,n-1\}\)）处的元素对应该空间坐标处的 RSS。设 \(\Psi\) 表示 \(m\times n\) 二值掩码，其索引 \((h,w)\) 处的元素在 \((h,w)\) 处有传感器时为 1，否则为 0。记 \(\odot\) 为 Hadamard 积。则部分观测矩阵 \(M\odot\Psi\) 给出一个 \(m\times n\) 矩阵，其非零元素对应各位置传感器测得的 RSS 值。

无线电地图估计问题要求融合中心利用 \(\mathcal{X}\) 内稀疏分布传感器采集的样本，即集合 \(\{r_s,\forall s\in\mathcal{S}\}\)，来估计无线电地图 \(M\)。具体地，如图 1 所示，无线电地图估计要求融合中心利用不完整观测 \(M\odot\Psi\) 估计 \(M\)，而 \(M\) 给出区域 \(\mathcal{X}\) 内每个位置处的 RSS。

## 4 预备知识：矩阵补全

我们对使用扩散模型求解无线电地图估计问题的分析，基于矩阵补全的表述。为描述该表述，本节先介绍矩阵补全。

矩阵补全问题要求恢复部分观测矩阵中的缺失元素 [31]。它已被广泛应用于协同过滤 [32]、图像恢复与修复 [33] 以及分类 [34] 等众多任务。

### 4.1 低秩矩阵补全

传统矩阵补全方法的一个基本假设是目标数据矩阵**低秩**。这一低秩性质使得可以通过最小化矩阵秩来恢复缺失元素。

具体地，理论研究表明，在关于缺失率、矩阵秩与采样方案的某些约束下，低秩矩阵中的缺失元素可通过求解秩最小化问题被精确恢复 [35]。数学上，对 \(m\times n\) 矩阵 \(M\) 与观测位置集合 \(\Omega\)，定义稀疏观测掩码为

$$
[\Psi]_{ij}=\begin{cases}1 & \text{若 }(i,j)\in\Omega\\[1mm]0 & \text{否则.}\end{cases}
$$

则对待恢复矩阵 \(X\)，低秩矩阵补全问题可表述为：

$$
\min_{X}\ \mathrm{rank}(X)\qquad\text{s.t. }X\odot\Psi=M\odot\Psi,
$$

其中 \(X_{m\times n}\) 是决策变量。

### 4.2 非线性矩阵补全

当矩阵具有高秩时，传统矩阵补全方法通过最小化矩阵秩往往无法恢复部分观测矩阵中的缺失元素。为解决该问题并恢复高秩矩阵中的缺失元素，**非线性矩阵补全**同时优化从高秩矩阵到低维隐空间的非线性映射以及隐结构 [36]。它们假定高秩矩阵的数据由非线性隐变量模型给出，并证明最小化隐空间维数可精确求解矩阵补全问题。

数学上，设 \(f(\cdot)\) 是联系低维隐空间与高秩矩阵的非线性变换。非线性矩阵补全问题为：

$$
\min_{X}\ \dim(Z)\qquad\text{s.t. }X=f(Z),\ X\odot\Psi=M\odot\Psi,
$$

其中 \(Z\) 是隐空间变量。

对上述问题，设采样率 \(\rho=\frac{|\Omega|}{mn}\)。问题可解的一个必要条件是 [37]：

$$
\mathrm{rank}(Z)\le\rho\cdot\min(m,n).\tag{1}
$$

根据非线性映射模型的不同，已有的非线性矩阵补全方法大体可分为两类，即**核技巧**方法 [36] 与**深度矩阵分解**（Deep Matrix Factorization，DMF）方法 [37]。

**基于核技巧的非线性矩阵补全** 它使用核方法把稀疏采样矩阵映射到高维空间，从而构造一个高维但低秩的矩阵；随后在该高维空间中通过低秩矩阵补全完成矩阵补全。

具体地，为处理非线性，定义非线性函数 \(\phi(\cdot)\) 把 \(X\) 映射到特征空间 \(\mathcal{F}\)：\(\phi(\cdot):\mathbb{R}^m\to\mathcal{F}^l\)，其中 \(\mathcal{F}\) 是内积空间，其维数 \(l\) 可以任意大甚至无穷。\(\mathcal{F}\) 中的数据随后可用线性技术处理。特征空间中的数据所构成的矩阵为

$$
W=\Phi(X)=[\phi(x_1),\phi(x_2),\cdots,\phi(x_n)],
$$

期望它是低秩或近似低秩的。这意味着在高维特征空间中，\(W\) 源自一个低维子空间，并可由少量隐变量的线性变换表示。这与输入空间中的情形一致：\(X\) 可通过少量隐变量 \(Z\) 的非线性变换 \(f(\cdot)\) 表示。因此，最小化 \(W\) 的秩等价于最小化 \(X\) 的非线性隐变量维数。

于是，\(X\) 的缺失元素可通过求解如下问题恢复：

$$
\min_{X}\ \mathrm{rank}(W),\quad\text{s.t. }W=\Phi(X),\ X\odot\Psi=M\odot\Psi,\ (i,j)\in\Omega.
$$

该问题为 NP-难问题，但可近似为：

$$
\min_{X}\ \|W\|_{S_p},\quad\text{s.t. }W=\Phi(X),\ X\odot\Psi=M\odot\Psi,\ (i,j)\in\Omega.
$$

这里 Schatten \(p\)-范数作为秩的非凸松弛，定义为：

$$
\|W\|_{S_p}=\Big(\sum_{i=1}^{\min(n,l)}(\sigma_i(W))^p\Big)^{1/p}.
$$

基于核技巧的非线性矩阵补全方法受限于计算效率不高与重建性能一般。

**基于 DMF 的非线性矩阵补全** 它建立在非线性隐变量模型之上，通过构造深度结构的神经网络实现。它以低维未知隐变量为输入、以部分观测变量为输出；通过同时优化隐变量与网络参数以最小化观测元素的重建误差，从而恢复缺失元素。与基于核技巧的方法相比，基于 DMF 的方法计算复杂度显著更低，且适用于大规模矩阵的补全。基于 DMF 的非线性矩阵补全的形式化表述为：

$$
\min_{Z,f}\ \pi(f)+\frac{\beta}{2n}\|Z\|^2_F,\quad\text{s.t. }[f(Z)]_{i,j}=X_{i,j},\ (i,j)\in\Omega,
$$

其中 \(\pi(f)\) 表示对 \(f(\cdot)\) 的罚项或约束，\(\beta\) 是 \(Z\) 的正则化参数。对 \(f(\cdot)\) 与 \(Z\) 都做正则化是必要的，因为存在无穷多组 \(f(\cdot)\) 与 \(Z\) 能重现 \(X\) 的观测元素。

在实践中，\(X\) 的观测元素常被小噪声污染，令 \([f(Z)]_{i,j}\) 精确等于 \(X_{i,j}\) 并不现实；只需最小化 \([f(Z)]_{i,j}\) 与 \(X_{i,j}\) 之间的差异：

$$
\min_{Z,f}\ \frac{1}{2n}\|\Psi\odot(X-f(Z))\|^2_F+\frac{\beta}{2n}\|Z\|^2_F+\lambda\pi(f),
$$

其中 \(\lambda\) 是正则化参数。非线性函数可用神经网络逼近：

$$
\min_{Z,\Theta}\ \frac{1}{2n}\sum_{i=1}^n\big\|\Psi_i\odot\big(x_i-g^{(K+1)}(g^{(K)}(\cdots g^{(1)}(z_i,\Theta^{(1)})\cdots,\Theta^{(K)}),\Theta^{(K+1)})\big)\big\|^2+\frac{\beta}{2n}\|Z\|^2_F+\frac{\lambda}{2}\sum_{j=1}^{K+1}\|W^{(j)}\|^2_F,
$$

其中 \(\Theta^{(j)}=(W^{(j)},b^{(j)})\)，\(g^{(j)}(t,\Theta^{(j)})=g^{(j)}(W^{(j)}t+b^{(j)})\)，\(j=1,2,\cdots,K+1\)，\(K\) 是隐层数。

尽管基于 DMF 的方法具有理论优势（例如在某一采样阈值之上保证完整恢复），但当采样低于该阈值时它们仍受限制——此时信息不足，无法精确重建。此外，DMF 与用于图像分类的 CNN 等典型深度学习模型有本质不同。CNN 在海量图像数据集上训练以学习适用于所有图像的通用特征提取能力；相比之下，DMF 旨在精确刻画特定矩阵的内部结构与模式，它只针对该特定矩阵定制，并不设计用于泛化到其他无关矩阵。

**图 2（原文 Fig. 2）：** 矩阵补全问题的示意图。图中给出两条路径：**低秩矩阵补全**（Low-Rank Matrix Completion）——由稀疏矩阵（Sparse Matrix）经随机采样（Random Sampling）与低秩矩阵补全得到补全矩阵（Completed Matrix）；**非线性矩阵补全**（Non-linear Matrix Completion）——稀疏矩阵经随机采样，并借助非线性映射 \(f(z)\) 及其逆 \(f^{-1}(x)\) 在隐空间（Latent Space）与补全矩阵之间转换。（原文为插图；图中标注按可读部分转写。）

## 5 基于矩阵补全的面向扩散模型无线电地图估计的表述

虽然标准非线性矩阵补全可以考虑稀疏传感器测量，但它们未能考虑对无线电地图估计至关重要的某些先验信息，例如成熟的无线电传播原理。为克服该局限，我们受**归纳矩阵补全**（Inductive Matrix Completion，IMC）[38] 的启发，它利用边信息构造非线性映射。本节据此为使用扩散模型估计无线电地图的问题引入一种非线性矩阵补全表述。

无线电地图实际上是 RSS 值的**高秩矩阵**，它源自一个潜在的、可能未知的传播规律，该规律以环境因素（如建筑布局与地形）为条件，而这些因素会影响信号行为。如图 3 所示，当把扩散模型用于无线电地图估计时，它利用一个同时编码传播规律与真值 RSS 矩阵的数据集，在训练中学习从无线电传播规律到 RSS 矩阵的复杂映射。该学习过程在直觉上与非线性矩阵补全问题一致。

数学上，设 \(M_{m\times n}\) 表示待估计的目标无线电地图，\(G_\theta(\cdot)\) 表示以 \(\theta\) 为参数的扩散模型。给定指示传感器位置的二值观测掩码 \(\Psi\)。设 \(\mathcal{P}\) 是无线电地图的底层分布，由潜在的、可能未知的无线电传播规律支配。则我们有：

$$
\forall M_1,M_2\in\mathrm{supp}(\mathcal{P}),\quad M_1\odot\Psi=M_2\odot\Psi\ \Longrightarrow\ \|M_1-M_2\|_2\le\varepsilon.
$$

设 \(N_Z\) 表示扩散模型的输入噪声。用扩散模型估计无线电地图的问题可表述为：

$$
\min_{\theta,X}\ \mathsf{W}(G_\theta,\mathcal{P}),\qquad\text{s.t. }X=G_\theta(N_Z;M\odot\Psi),\ X\odot\Psi=M\odot\Psi.\tag{2}
$$

其中 \(\mathsf{W}\) 表示 **Wasserstein 距离**，它度量不同分布之间的相似性。具体地，对两个概率测度 \(\mu,\nu\in\mathcal{P}(\mathbb{R}^d)\)，

$$
\mathsf{W}(\mu,\nu)=\inf_{\gamma\in\Gamma(\mu,\nu)}\int_{\mathbb{R}^d\times\mathbb{R}^d}\|x-y\|\,d\gamma(x,y)\tag{3}
$$

其中 \(\Gamma(\mu,\nu)\) 表示所有以 \(\mu\) 与 \(\nu\) 为边缘的耦合测度集合。

**图 3（原文 Fig. 3）：** 使用扩散模型进行无线电地图估计的示意图。图中给出从无线电地图数据集（Radio Map Dataset）与稀疏无线电地图（Sparse Radio Map）出发，经物理规律信息（Physical Law Information）、输入/提示信息（Input/Prompt）、噪声（Noise）、权重（weight）、条件（condition）等送入去噪网络（Denoise Network），在隐空间（Latent Space）与输出（Output）之间完成训练（Training）与状态输出（State Output），最终得到补全无线电地图（Completed Radio Map）的流程；该类方法在图中记为基于生成式人工智能的非线性矩阵补全（Generative AI based NLMC）。

## 6 扩散模型用于无线电地图估计的收敛性分析

扩散模型通过逐步注入噪声，把无线电传播规律的复杂数据分布平滑地变换为已知的先验分布，然后反转该过程、逐步去噪以从先验重建数据分布，从而解决无线电地图估计问题。这一思想与 SDE 框架一致。本节利用 SDE 优化理论建立扩散模型用于无线电地图估计的收敛性，为后续各节分析扩散模型的估计误差提供理论基础。

扩散模型的目标是构造一个扩散过程 \(\{x(t)\}_{t=0}^T\)，它以连续时间变量 \(t\in[0,T]\) 为索引，使得 \(x(0)\sim p_0=\mathcal{P}\)（无线电传播的数据分布）且 \(x(T)\sim p_T\)（具有已知解析形式的可处理先验分布）。该扩散过程可建模为如下 Itô SDE 的解：

$$
dx=f(x,t)\,dt+g(t)\,dw,\tag{4}
$$

其中 \(w\) 表示标准 Wiener 过程（也称 Brownian 运动），\(f(\cdot,t):\mathbb{R}^d\to\mathbb{R}^d\) 是向量值函数，称为 \(x(t)\) 的**漂移系数**，\(g(\cdot):\mathbb{R}\to\mathbb{R}\) 是标量函数，称为 \(x(t)\) 的**扩散系数**。只要这些系数在状态与时间上都是全局 Lipschitz 连续的，该 SDE 就存在唯一强解 [39]。

设 \(p_t(x)\) 是 \(x(t)\) 的概率密度，\(p_{st}(x(t)|x(s))\) 是 \(0\le s<t\le T\) 时从 \(x(s)\) 到 \(x(t)\) 的转移核。通常 \(p_T\) 是不含 \(p_0\) 任何信息的无结构先验，例如均值与方差固定的高斯分布。从样本 \(x(T)\sim p_T\) 初始化并反转扩散过程，即可得到样本 \(x(0)\sim p_0\)。Anderson [40] 的一个开创性结果指出：扩散过程的反转本身就是一个在时间上向后演化的扩散过程，由如下反向时间 SDE 支配：

$$
dx=\big[f(x,t)-g(t)^2\nabla_x\log p_t(x)\big]\,dt+g(t)\,d\bar w,\tag{5}
$$

其中 \(\bar w\) 是时间从 \(T\) 向 \(0\) 倒流时的标准 Wiener 过程，\(dt\) 表示无穷小负时间步。一旦所有 \(t\) 的边缘分布的得分 \(\nabla_x\log p_t(x)\) 已知，反向扩散过程即可由式 (5) 导出并仿真，以从 \(p_0\) 抽取样本。

分布的得分可通过在数据样本上用**得分匹配** [41] 训练基于得分的模型来估计。为估计 \(\nabla_x\log p_t(x)\)，可以训练时间相关的基于得分的模型 \(s_\theta(x,t)\)，其训练目标来自噪声条件得分网络（Noise Conditional Score Network，NCSN）训练目标的连续推广 [41]，以及去噪扩散概率模型（Denoising Diffusion Probabilistic Model，DDPM）的证据下界（Evidence Lower Bound，ELBO）[42]：

$$
\theta^*=\arg\min_{\theta}\mathbb{E}_t\Big\{\lambda(t)\mathbb{E}_{x(0)}\mathbb{E}_{x(t)|x(0)}\Big[\|s_\theta(x(t),t)-\nabla_{x(t)}\log p_{0t}(x(t)|x(0))\|^2_2\Big]\Big\}.\tag{6}
$$

这里 \(\lambda:[0,T]\to\mathbb{R}_{>0}\) 是正加权函数，\(t\) 在 \([0,T]\) 上均匀采样，\(x(0)\sim p_0(x)\)，\(x(t)\sim p_{0t}(x(t)|x(0))\)。在数据与模型容量充足时，得分匹配保证式 (6) 的最优解（记为 \(s_{\theta^*}(x,t)\)）对几乎所有的 \(x\) 与 \(t\) 等于 \(\nabla_x\log p_t(x)\)。

在实践中，为高效优化式 (6)，通常需要知道转移核 \(p_{0t}(x(t)|x(0))\)。当 \(f(\cdot,t)\) 为仿射时，该核为高斯分布，其均值与方差有闭式表达，可由标准技巧得到。例如，DDPM（一种著名的扩散模型）中使用的扰动核 \(\{p_{\alpha_i}(x|x_0)\}_{i=1}^N\) 对应如下离散 Markov 链：

$$
x_i=\sqrt{1-\beta_i}\,x_{i-1}+\sqrt{\beta_i}\,z_{i-1},\qquad i=1,\ldots,N.\tag{7}
$$

当 \(N\to\infty\) 时，该离散过程收敛到如下 SDE：

$$
dx=-\frac12\beta(t)x\,dt+\sqrt{\beta(t)}\,dw.\tag{8}
$$

为确保式 (6) 中的上述优化过程能有效求解式 (2) 所表述的无线电地图估计问题，必须建立扩散模型的收敛性。Bortoli [43] 已证明：若以下 4 个假设成立：

- **A1.** 数据分布 \(\mathcal{P}\) 支撑在紧集 \(\mathcal{M}\) 上，且 \(0\in\mathcal{M}\)；
- **A2.** \(t\mapsto\beta_t\) 连续、非减，且存在 \(\bar\beta>0\) 使得对任意 \(t\in[0,T]\) 有 \(1/\bar\beta\le\beta_t\le\bar\beta\)；
- **A3.** 存在 \(s\in C([0,T]\times\mathbb{R}^d,\mathbb{R}^d)\) 与 \(M\ge0\)，使得对任意 \(t\in[0,T]\) 与 \(x_t\in\mathbb{R}^d\)，
  $$
  \|s(t,x_t)-\nabla\log p_t(x_t)\|\le M(1+\|x_t\|)/\sigma_t^2,\tag{9}
  $$
- **A4.** \(\gamma_k\sup_{v\in[T-t_{k+1},T-t_k]}\beta_v/\sigma_v^2\le\delta\le1/2\)，对任意 \(k\in\{0,\ldots,K-1\}\)，

且 \(T\ge2\bar\beta\big(1+\log(1+\mathrm{diam}(\mathcal{M}))\big)\)，\(\gamma_K=\varepsilon\)，以及 \(\varepsilon,M,\delta\le1/32\)，则存在 \(D_0\ge0\) 使得

$$
\mathsf{W}(G_\theta,\mathcal{P})\le D_0\Big(\exp[\kappa/\varepsilon](M+\delta^{1/2})/\varepsilon^2+\exp[\kappa/\varepsilon]\exp[-T/\bar\beta]+\varepsilon^{1/2}\Big),\tag{10}
$$

其中 \(\kappa=\mathrm{diam}(\mathcal{M})^2(1+\bar\beta)/2\)，

$$
D_0=D(1+\bar\beta)^7\big(1+d+\mathrm{diam}(\mathcal{M})^4\big)\big(1+\log(1+\mathrm{diam}(\mathcal{M}))\big),\tag{11}
$$

其中 \(D\) 是常数，\(\mathrm{diam}(\mathcal{M})\) 表示流形直径，定义为 \(\mathrm{diam}(\mathcal{M})=\sup\{\|x-y\|:x,y\in\mathcal{M}\}\)，\(\sigma_t\) 是扩散过程中前向 SDE 的噪声尺度，\(\varepsilon>0\) 是一个小的超参数。

对于用扩散模型进行无线电地图估计，A1 成立，因为无线电地图遵循底层无线电传播规律，即使这些规律未被显式已知。A2 在实践中使用的所有调度方案下都满足；\(t\to0\) 时 A2 所考虑的爆炸行为在实际实现中已被适当处理。A3 与 A4 对该 SDE 成立。因此，扩散模型应用于无线电地图估计问题时是收敛的。

## 7 扩散模型的理论无线电地图估计误差

本节分析扩散模型用于无线电地图估计的理论性能。首先，认识到任何估计的无线电地图都会因部署域分布与真实底层无线电传播规律之间的差异而不可避免地偏离真值，我们推导扩散模型所能达到的**最小估计误差**的表达式。接着，我们扩展该误差表达式以纳入模型设计与采样策略，从而刻画模型局限与超稀疏采样带来的附加误差。最后，我们推导无线电采样应满足的条件，使扩散模型达到给定的无线电地图估计精度。

### 7.1 最小估计误差

在生成式人工智能的语境中，**部署域分布**指训练好的模型部署到真实环境时所遇到的数据分布。对无线电地图估计而言，部署场景的变化会导致部署域分布偏离真实的底层无线电传播规律。设 \(\widetilde{\mathcal{P}}\) 表示部署域分布。则 \(\mathsf{W}(G_\theta,\widetilde{\mathcal{P}})\) 刻画了使用扩散模型进行无线电地图估计的**最小误差** \(E_{\min}\)。根据扩散模型的收敛理论，在合适的估计器下，收敛效果可与以均方误差（Mean Squared Error，MSE）度量的恢复效果相关联 [44]，即我们可以有：

$$
E_{\min}=||X_{\max}-\widetilde{M}||^2,\tag{12}
$$

其中 \(X_{\max}\) 是扩散模型重建出的最佳地图（矩阵），\(\widetilde{M}\) 是与部署域分布对应的地图（矩阵）。

基于扩散模型的收敛理论 [45], [43]（它把 Wasserstein 距离与收敛效果联系起来），我们推导出如下定理，给出扩散模型所能达到的最小估计误差的表达式。

**定理 1。** 使用扩散模型进行无线电地图估计的**最小估计误差** \(E_{\min}\)（由式 (12) 定义）可以近似为：

$$
E_{\min}\approx\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\cdot\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})+\zeta,\tag{13}
$$

其中 \(\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\) 是与分布 \(\mathcal{P}\) 与 \(\widetilde{\mathcal{P}}\) 的流形几何相关的影响因子，用于把分布误差缩放到具体的数据误差，其定义为：

$$
\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})=C\cdot\Big(\frac{\mathrm{diam}(\mathcal{A})+\mathrm{diam}(\widetilde{\mathcal{A}})}{2}\Big)\cdot\Big(1+\log\big(1+\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})\big)\Big).\tag{14}
$$

这里 \(\mathcal{A}\) 与 \(\widetilde{\mathcal{A}}\) 分别是分布 \(\mathcal{P}\) 与 \(\widetilde{\mathcal{P}}\) 的支撑流形，\(\mathrm{diam}(\cdot)\) 表示流形直径，\(C\) 是与扩散模型参数相关的常数。\(\zeta\) 是反映扩散模型 \(G_\theta\) 与训练分布 \(\mathcal{P}\) 之间近似误差的误差项。

**证明（概述）：** 考虑分别支撑在紧流形 \(\mathcal{A}\) 与 \(\widetilde{\mathcal{A}}\) 上的训练分布 \(\mathcal{P}\) 与部署分布 \(\widetilde{\mathcal{P}}\)。根据 Wasserstein 距离的三角不等式性质，我们有：

$$
|\mathsf{W}(G_\theta,\widetilde{\mathcal{P}})-\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})|\le\mathsf{W}(G_\theta,\mathcal{P}).
$$

因此我们有

$$
\mathsf{W}(G_\theta,\widetilde{\mathcal{P}})=\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})+\delta_\epsilon,
$$

其中 \(\delta_\epsilon\in[-\mathsf{W}(G_\theta,\mathcal{P}),\mathsf{W}(G_\theta,\mathcal{P})]\) 是随机变量，其绝对值随收敛而减小。于是，受扩散模型收敛性的影响，理论最小误差 \(E_{\min}\) 主要由分布间距离 \(\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})\) 决定，但需要经由流形几何进行调制，以从分布映射到具体采样误差。因此我们建立：

$$
E_{\min}\approx\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\cdot\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})+\zeta,
$$

其中 \(\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\) 是与分布 \(\mathcal{P}\) 与 \(\widetilde{\mathcal{P}}\) 的流形几何相关的影响因子，\(\zeta\) 表示模型近似误差的贡献。

根据流形假设下扩散模型的收敛理论 [45], [43]，生成分布 \(G_\theta\) 与目标分布 \(\mathcal{P}\) 之间的 Wasserstein 距离满足：

$$
\mathsf{W}(G_\theta,\mathcal{P})\le D_0\Big(\exp[\kappa/\varepsilon](M+\delta^{1/2})/\varepsilon^2+\exp[\kappa/\varepsilon]\exp[-T/\bar\beta]+\varepsilon^{1/2}\Big),
$$

其中常数 \(D_0\) 依赖于流形直径 \(\mathrm{diam}(\mathcal{A})\)、维度 \(d\) 与扩散参数 \(\bar\beta\)。根据流形上扩散模型的收敛性分析，常数 \(D_0\) 具有如下形式 [43]：

$$
D_0=D(1+\bar\beta)^7\big(1+d+\mathrm{diam}(\mathcal{A})^4\big)\big(1+\log(1+\mathrm{diam}(\mathcal{A}))\big).
$$

这表明收敛速率与流形直径密切相关。对分布偏移场景，我们需要同时考虑源流形 \(\mathcal{A}\) 与目标流形 \(\widetilde{\mathcal{A}}\) 的几何特征，因此可定义几何因子：

$$
\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})=C\cdot\Big(\frac{\mathrm{diam}(\mathcal{A})+\mathrm{diam}(\widetilde{\mathcal{A}})}{2}\Big)\cdot\Big(1+\log\big(1+\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})\big)\Big),
$$

其中 \(C\) 吸收了维度 \(d\) 与扩散参数 \(\bar\beta\) 等常数项。\(\mathcal{R}\) 的乘积形式反映了三点考虑：有效流形直径 \((\mathrm{diam}(\mathcal{A})+\mathrm{diam}(\widetilde{\mathcal{A}}))/2\) 来自紧支撑上 \(W_1\) 到 \(L_2\) 的缩放（因为在有界区域上有 \(\|x-y\|^2\le D\cdot\|x-y\|\)，期望 MSE 被联合直径乘以 \(W_1\) 所控制 [46]）；对数因子 \(1+\log(1+\mathsf{W})\) 源自紧流形上扩散过程收敛理论中的覆盖数估计 [43]；乘积式复合则来自收敛界的结构与量纲一致性。

根据扩散模型收敛理论，生成器的最优性能受其对训练分布的拟合程度限制：

$$
\mathsf{W}(G^*_\theta,\mathcal{P})\le\epsilon_{\mathrm{opt}},
$$

其中 \(\epsilon_{\mathrm{opt}}\) 是扩散模型在训练分布上的最优收敛误差。因此，误差项 \(\zeta\) 满足：

$$
|\zeta|\le\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\cdot\mathsf{W}(G^*_\theta,\mathcal{P})\le\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\cdot\epsilon_{\mathrm{opt}}.
$$

当 \(\mathcal{P}\) 与 \(\widetilde{\mathcal{P}}\) 支撑在同一流形上时，\(\mathrm{diam}(\mathcal{A})=\mathrm{diam}(\widetilde{\mathcal{A}})\)，几何因子简化为只依赖单个流形直径的形式。当分布偏移增大时，\(\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})\) 增大，但对数项保证几何因子增长平缓，这与扩散模型在流形上的收敛行为一致。\(\square\)

定理 1 表明，最小估计误差 \(E_{\min}\) 主要由部署分布与真实底层无线电传播规律之间的 Wasserstein 距离 \(\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})\) 决定，并由影响因子 \(\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\) 缩放。该因子刻画了数据底层流形结构的几何差异，其理论形式源自紧流形上扩散模型的收敛界。注意 \(E_{\min}\) 是随机变量 \(\zeta\) 的函数，而 \(\zeta\) 依赖于以随机噪声为输入的扩散模型与训练分布之间的差距。

### 7.2 依赖采样的估计误差

定理 1 刻画了理论上扩散模型所能达到的最小估计误差的表达式。由于部署域分布与真实底层无线电传播规律之间可能存在失配，该估计误差可以为正，表示估计无线电地图与真值无线电地图之间的差异。如第 1 节所述，无线电地图估计问题因**极低采样率**而具有挑战性——可用测量数量远小于目标地图分辨率。直观上，随着输入采样率提高，扩散模型构造的无线电地图质量会改善。然而，定理 1 的一个主要局限是：所推导的估计误差没有显式考虑采样率。

把扩散模型在无线电地图估计中取得的估计误差 \(E\) 定义为

$$
E=||X-\widetilde{M}||^2,\tag{15}
$$

其中 \(X\) 是扩散模型预测的地图（矩阵）。给定采样掩码 \(\Psi\)，观测矩阵 \(M\) 所提供的关于完整矩阵 \(\widetilde{M}\) 的信息量可用条件互信息量化：

$$
\mathcal{I}(\Psi)=I(\widetilde{M};M|\Psi)=H(\widetilde{M})-H(\widetilde{M}|M,\Psi),\tag{16}
$$

其中 \(H(\cdot)\) 表示微分熵。该度量反映了在给定观测 \(M\) 与采样模式 \(\Psi\) 时关于完整矩阵 \(\widetilde{M}\) 的不确定性下降量。

生成模型 \(G_\theta\) 的有效性取决于其把观测信息有效投影到隐空间 \(Z\) 的能力。定义**隐空间信息效率**为：

$$
\eta_z=\frac{I(\widetilde{M};G_\theta(N_Z;M\odot\Psi))}{I(\widetilde{M};M|\Psi)}\cdot\frac{\dim(Z)}{\dim(M)},\tag{17}
$$

其中 \(\dim(Z)\) 与 \(\dim(M)\) 分别表示隐空间与矩阵空间的维数。该效率因子综合反映了隐空间的压缩效率与信息保持能力。

基于上述信息论框架，考虑观测信息量 \(\mathcal{I}(\Psi)\) 与隐空间效率 \(\eta_z\) 对恢复误差的影响，我们在如下定理中推导 \(E\) 的表达式。

**定理 2。** 给定最小估计误差 \(E_{\min}\)、采样掩码 \(\Psi\) 与隐空间效率 \(\eta_z\)，估计误差 \(E\) 可以近似为：

$$
\begin{aligned}
E&=E_{\min}+E_{info}+E_{model}\\
&\approx\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\cdot\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})+\gamma\cdot\exp\Big(-\lambda\cdot\frac{\mathcal{I}(\Psi)}{H(\widetilde{M})}\cdot\eta_z^{\frac{\dim(M)}{\dim(Z)}}\Big)+\epsilon,
\end{aligned}\tag{18}
$$

其中 \(\gamma>0\) 是误差敏感度参数，反映缺失观测信息对误差的放大效应；\(\lambda>0\) 是信息衰减系数，刻画信息利用的边际递减效应；\(\epsilon\sim\mathcal{N}(0,\sigma^2)\) 是随机扰动项，涵盖模型训练与优化中的不确定性。

**证明（概述）：** 估计误差 \(E\) 可分解为三个相互关联的分量：

$$
E=E_{\min}+E_{info}+E_{model},
$$

其中 \(E_{\min}\) 由定理 1 定义，\(E_{info}\) 刻画观测信息不足（即采样策略）引入的误差，\(E_{model}\) 反映不完美隐空间投影（即模型局限）导致的估计误差。

根据率失真理论 [47]，在给定观测信息量 \(\mathcal{I}(\Psi)\) 的条件下，对完整矩阵 \(\widetilde{M}\) 的最优估计所能达到的最小 MSE 满足：

$$
\mathbb{E}[|X-\widetilde{M}|^2]\ge\sigma^2_{\widetilde{M}}\cdot\exp\Big(-2\cdot\frac{\mathcal{I}(\Psi)}{H(\widetilde{M})}\Big),
$$

其中 \(X\) 是估计结果，\(\sigma^2_{\widetilde{M}}\) 是 \(\widetilde{M}\) 的方差。然而由于隐空间瓶颈，有效速率被降低。定义隐空间信息效率：

$$
\eta_z=\frac{I(\widetilde{M};G_\theta(N_Z;M\odot\Psi))}{I(\widetilde{M};M|\Psi)}\cdot\frac{\dim(Z)}{\dim(M)}.
$$

由数据处理不等式有 \(0\le\eta_z\le1\)。可达的有效速率变为 \(R_{\mathrm{eff}}=\eta_z^{d/d_z}\cdot\mathcal{I}(\Psi)\)，其中 \(d_z=\dim(Z)\)（相应的指数 \(\dim(M)/\dim(Z)\) 源于信息投影中的测度集中现象）。把率失真界应用于有效速率，得到：

$$
E_{info}\approx\gamma\cdot\exp\Big(-\lambda\cdot\frac{\mathcal{I}(\Psi)}{H(\widetilde{M})}\cdot\eta_z^{\frac{\dim(M)}{\dim(Z)}}\Big),
$$

其中用 \(H(\widetilde{M})\) 归一化使自变量无量纲，\(\gamma,\lambda>0\) 是依赖于模型架构的常数。

第三，模型近似误差 \(E_{model}\) 来自得分估计误差与离散化。在第 VI 节的假设下，得分估计误差满足：

$$
\mathbb{E}_t\mathbb{E}_{x(t)}\big[\|s_\theta(x(t),t)-\nabla\log p_t(x(t))\|^2\big]\le\varepsilon^2_{score}.
$$

该误差以 \(E_{model}\le C_{model}\cdot\varepsilon^{2\alpha}_{score}\) 传播到样本质量。在实践中我们把它吸收进 \(\eta_z\)，剩余的随机性由 \(\epsilon\sim\mathcal{N}(0,\sigma^2)\) 刻画。

最后，由偏差—方差分解，当各误差不相关时总 MSE 以相加方式组合各分量——这对良态估计量在渐近意义下成立。因此我们得到：

$$
E\approx\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\cdot\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})+\gamma\cdot\exp\Big(-\lambda\cdot\frac{\mathcal{I}(\Psi)}{H(\widetilde{M})}\cdot\eta_z^{\frac{\dim(M)}{\dim(Z)}}\Big)+\epsilon.\tag{19}
$$

\(E_{info}\) 的指数形式由率失真函数的指数衰减所支持，而幂次 \(\frac{\dim(M)}{\dim(Z)}\) 刻画了降维对信息保持的几何效应。

从 Wasserstein 几何的角度看，在观测条件 \(M\odot\Psi\) 下生成模型 \(G_\theta\) 的输出分布与目标分布 \(\widetilde{\mathcal{P}}\) 之间的 Wasserstein 距离满足：

$$
\mathsf{W}(G_\theta(\cdot;M\odot\Psi),\widetilde{\mathcal{P}})\le\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})+\mathsf{W}(G_\theta(\cdot;M\odot\Psi),\mathcal{P}).
$$

右端第一项对应 \(E_{\min}\)，第二项同时受观测信息量与模型效率的影响，其变化趋势与 \(E_{info}+E_{model}\) 一致。

定理 2 的证明基于信息投影理论与 Wasserstein 几何性质。定理 2 不仅量化了基于扩散模型的无线电地图估计的近似误差，也为扩散模型设计与采样策略提供了指导。\(\square\)

### 7.3 达到给定估计精度的采样条件

估计误差 \(E\) 可分解为三个分量：

$$
E=E_{\min}+E_{info}+E_{model},\tag{20}
$$

其中 \(E_{\min}\) 是最小近似误差，\(E_{info}=f(\mathcal{I}(\Psi))\) 是由稀疏采样导致的信息损失所引起的信息不足误差，\(E_{model}=g(\eta_z)\) 是反映隐空间投影不完美的模型估计误差。

考虑到函数 \(f(\cdot)\) 与 \(g(\cdot)\) 具有如下渐近性质：

$$
\lim_{\mathcal{I}(\Psi)\to H(\widetilde{M})}f(\mathcal{I}(\Psi))=0,\qquad\lim_{\eta_z\to1}g(\eta_z)=0,\tag{21}
$$

并基于定理 2 中的误差表达式，我们可以推导扩散模型达到给定无线电地图估计精度时无线电采样应满足的条件。

给定估计误差容限 \(\delta>0\)，在随机采样条件下，设 \(\rho_c\) 为一个采样率（密度），使得当采样率 \(\rho>\rho_c\) 时，估计误差 \(E\) 以至少 \(1-\xi\) 的概率满足：

$$
\frac{E-E_{\min}}{E_{\min}}\le\delta.\tag{22}
$$

于是我们关于 \(\rho_c\) 有如下定理。

**定理 3。** 采样率 \(\rho_c\) 可以近似为：

$$
\rho_c\approx\min\Big\{\rho\in[0,1]:\gamma\cdot\exp\Big(-\lambda\cdot\frac{\mathcal{I}(\Psi_\rho)}{H(\widetilde{M})}\cdot\eta_z^{\frac{\dim(M)}{\dim(Z)}}\Big)\le\delta\cdot E_{\min}-\Phi^{-1}(1-\xi)\cdot\sigma_\epsilon\Big\},\tag{23}
$$

其中 \(\Psi_\rho\) 表示与 \(\rho\) 对应的采样掩码，\(\Phi^{-1}\) 是标准正态分布的逆累积分布函数。

**证明（概述）：** 回顾定理 2 对给定采样掩码 \(\Psi\) 给出了如下估计误差分解：

$$
E\approx\mathcal{R}(\mathcal{P},\widetilde{\mathcal{P}})\cdot\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})+\gamma\cdot\exp\Big(-\lambda\cdot\frac{\mathcal{I}(\Psi)}{H(\widetilde{M})}\cdot\eta_z^{\frac{\dim(M)}{\dim(Z)}}\Big)+\epsilon.\tag{24}
$$

对固定采样率 \(\rho\)，我们考虑从与 \(\rho\) 对应的分布中抽取的随机采样掩码 \(\Psi_\rho\)。在关注的区间内，互信息 \(\mathcal{I}(\Psi_\rho)\) 以确定性方式依赖于 \(\rho\)（例如通过随机采样方案下的期望）。因此记

$$
A(\rho)\triangleq\frac{\mathcal{I}(\Psi_\rho)}{H(\widetilde{M})}\cdot\eta_z^{\frac{\dim(M)}{\dim(Z)}},
$$

它是 \(\rho\) 的非减函数，因为更高的采样率提供关于真实无线电地图的更多信息。信息不足导致的误差项于是为 \(\Delta(\rho)=\gamma\exp(-\lambda A(\rho))\)，它在 \(\rho\) 上非增。

我们希望保证相对误差以至少 \(1-\xi\) 的概率满足

$$
\frac{E-E_{\min}}{E_{\min}}\le\delta.\tag{25}
$$

把 \(E\) 的表达式代入，条件式 (25) 等价于

$$
\Delta(\rho)+\varepsilon\le\delta E_{\min}.\tag{26}
$$

由于 \(\varepsilon\) 是高斯分布且独立于 \(\Psi_\rho\)，对固定 \(\rho\)，式 (26) 的概率为

$$
\mathbb{P}\big(\Delta(\rho)+\varepsilon\le\delta E_{\min}\big)=\Phi\Big(\frac{\delta E_{\min}-\Delta(\rho)}{\sigma_\varepsilon}\Big),\tag{27}
$$

其中 \(\Phi\) 表示标准正态分布的累积分布函数。为确保该概率至少为 \(1-\xi\)，我们要求

$$
\Phi\Big(\frac{\delta E_{\min}-\Delta(\rho)}{\sigma_\varepsilon}\Big)\ge1-\xi.\tag{28}
$$

由于 \(\Phi\) 严格递增，式 (28) 等价于

$$
\frac{\delta E_{\min}-\Delta(\rho)}{\sigma_\varepsilon}\ge\Phi^{-1}(1-\xi),\tag{29}
$$

其中 \(\Phi^{-1}\) 是标准正态分布的分位函数。重排得到

$$
\Delta(\rho)\le\delta E_{\min}-\sigma_\varepsilon\Phi^{-1}(1-\xi).\tag{30}
$$

回忆 \(\Delta(\rho)\) 的定义，不等式 (30) 变为

$$
\gamma\exp(-\lambda A(\rho))\le\delta E_{\min}-\sigma_\varepsilon\Phi^{-1}(1-\xi).\tag{31}
$$

假定式 (31) 的右端为正，以使该阈值有意义；否则没有任何 \(\rho\) 满足该条件。由于 \(A(\rho)\) 随 \(\rho\) 增大，左端随 \(\rho\) 减小。因此使式 (31) 成立的 \(\rho\) 的集合要么为空，要么是一个区间 \([\rho_c,1]\)，其中 \(\rho_c\) 是满足式 (31) 的最小 \(\rho\)。形式化地，

$$
\rho_c\approx\min\{\rho\in[0,1]:\gamma\cdot\exp(-\lambda\cdot A(\rho))\le\delta\cdot E_{\min}-\Phi^{-1}(1-\xi)\cdot\sigma_\epsilon\}.
$$

代回 \(A(\rho)\) 的定义即恰得定理 3 中的表达式。令 \(B=\delta E_{\min}-\sigma_\varepsilon\Phi^{-1}(1-\xi)\)，则有：

$$
\begin{cases}
B\le0: & \text{没有采样率满足；}\\
B>\Delta(0): & \text{所有采样率都满足；}\\
\Delta(1)<B<\Delta(0): & \text{存在阈值 }\rho_c;\\
0<B<\Delta(1): & \text{即使全采样也无法保证。}
\end{cases}
$$

定理 3 把式 (1) 推广到基于扩散模型的无线电地图估计设定，并为达到给定无线电地图估计精度所需的采样率提供指导。\(\square\)

## 8 理论无线电地图估计误差的近似

上一节中，针对无线电地图估计问题，我们推导了扩散模型所能达到的最小估计误差的表达式（定理 1），并进一步把该误差扩展以纳入采样策略（定理 2）。此外，基于依赖采样的估计误差，我们还推导了扩散模型达到给定估计精度所需的采样条件（定理 3）。然而，这些表达式的直接应用受阻于它们所依赖的信息往往不可得或难以获取。为克服该局限，本节引入近似理论误差表达式、且在实践中易于计算的经验公式。

### 8.1 最小估计误差的近似

对最小估计误差 \(E_{\min}\) 而言，\(\mathrm{diam}(\mathcal{A})\)（流形 \(\mathcal{A}\) 的直径）、\(\mathrm{diam}(\widetilde{\mathcal{A}})\)（流形 \(\widetilde{\mathcal{A}}\) 的直径）与 \(\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})\)（分布 \(\mathcal{P}\) 与 \(\widetilde{\mathcal{P}}\) 之间的 Wasserstein 距离）在实践中都难以计算。然而，由于数据集是从底层无线电地图分布中抽取的经验样本，它们可以作为这些分布信息的实用代理。借助概率论与统计学原理，我们因此用可观测数据集及其经验相似性来近似 \(\mathrm{diam}(\mathcal{A})\)、\(\mathrm{diam}(\widetilde{\mathcal{A}})\) 与 \(\mathsf{W}(\mathcal{P},\widetilde{\mathcal{P}})\)。所提出的近似在如下推论中形式化。

**推论 1。** 如下 \(E^*_{\min}\) 近似式 (13) 中的最小估计误差 \(E_{\min}\)：

$$
E^*_{\min}=C'\cdot\Big(\frac{\mathrm{diam}(Y)+\mathrm{diam}(\widetilde{Y})}{2}\Big)\cdot\Big(1+\log\big(1+D(Y,\widetilde{Y})\big)\Big)\cdot D(Y,\widetilde{Y})+\widetilde{\zeta},\tag{32}
$$

其中 \(D(Y,\widetilde{Y})\) 是基于数据集 \(Y\) 与 \(\widetilde{Y}\) 计算的分布差异度量，用于近似理论 Wasserstein 距离，可通过 Fréchet Inception Distance（FID）[48] 与 Maximum Mean Discrepancy（MMD）[49] 等方法测量。这里 \(Y\) 与 \(\widetilde{Y}\) 分别是来自目标分布与训练分布的有限数据集；\(\mathrm{diam}(\cdot)\) 表示数据集的经验直径（例如样本间的最大距离）；\(C'\) 是与模型和任务相关的拟合常数；\(\widetilde{\zeta}\) 是反映扩散模型 \(G_\theta\) 在其训练分布 \(\widetilde{Y}\) 上经验近似误差的误差项，可通过模型在训练分布的一个留出测试集上的表现来估计。

式 (32) 中的经验公式给出了式 (13) 中最小估计误差的实用近似。具体地，它用数据集 \(Y\) 中样本间的最大距离近似流形 \(\mathcal{A}\) 的直径，用数据集 \(\widetilde{Y}\) 中样本间的最大距离近似流形 \(\widetilde{\mathcal{A}}\) 的直径，并用 FID 或 MMD 近似 \(\mathcal{P}\) 与 \(\widetilde{\mathcal{P}}\) 之间的 Wasserstein 距离。与其理论对应物不同，式 (32) 在实践中易于计算，因而非常适合真实应用。推论 1 表明，我们所提出的最小估计误差近似与训练环境和部署环境之间的失配有关。与式 (13) 中定义的 \(E_{\min}\) 类似，\(E^*_{\min}\) 也是随机变量 \(\widetilde{\zeta}\) 的函数，而 \(\widetilde{\zeta}\) 依赖于以随机噪声为输入的扩散模型与训练数据集之间的差距。

### 8.2 依赖采样的估计误差的近似

对估计误差 \(E\) 而言，与信息相关的度量，例如互信息 \(\mathcal{I}(\Psi)\) 与微分熵 \(H(\widetilde{M})\)，在实践中难以计算。在如下推论中，我们给出近似 \(E\) 的经验公式。

**推论 2。** 考虑到障碍物布局与采样点附近无线电功率变化的程度会显著影响无线电地图的估计，我们提出用如下 \(E^*\) 近似式 (18) 中依赖采样的估计误差 \(E\)：

$$
E^*=\max\{E^*_{\min}+E^*_{model}-\alpha\ln(\rho^*+1),0\}\tag{33}
$$

其中

$$
\rho^*=\frac{c_1\cdot(\kappa_{sp}+c_2)\cdot(\rho+c_3)}{\exp\Big[\frac{1}{mn}\sum_{i=1}^m\sum_{j=1}^n B_{ij}\Big]}\tag{34}
$$

这里 \(\rho\) 表示实际采样率，\(B\) 是障碍物布局掩码，1 表示障碍物所在位置、0 表示其他位置，\(\alpha,c_1,c_2,c_3\) 是归一化超参数，\(\kappa_{sp}\) 表示采样点处的功率变化程度，可计算为：

$$
\kappa_{sp}=\frac{\Psi\odot\sqrt{(\nabla_x X)^2+(\nabla_y X)^2}}{\sum_{i=1}^m\sum_{j=1}^n\Psi_{ij}}\tag{35}
$$

设 \(X_{true}\) 是无线电地图的真值矩阵，\(\Psi_{train}\) 与 \(\Psi_{test}\) 分别是训练与测试采样掩码。则我们有

$$
E^*_{model}=\mathsf{W}(G_{\theta^*}(\cdot;\Psi_{train}),\mathcal{P}_{train})+\mathsf{W}(\mathcal{P}_{train},\mathcal{P}_{test})+\mathsf{W}(G_{\theta^*}(\cdot;\Psi_{test}),G_{\theta^*}(\cdot;\Psi_{train})),\tag{36}
$$

其中 \(\mathcal{P}_{train}=\mathcal{P}(\cdot|X_{true}\odot\Psi_{train})\)，\(\mathcal{P}_{test}=\mathcal{P}(\cdot|X_{true}\odot\Psi_{test})\)。为简洁起见，记 \(G_\theta(\cdot;\Psi)\equiv G_\theta(N_Z;X_{true}\odot\Psi)\)。此外，设 \(\theta^*\) 表示在训练数据集上优化得到的模型参数，其目标是同时最小化训练分布匹配误差与观测重建误差：

$$
\theta^*=\arg\min_{\theta}\ \mathsf{W}(G_\theta(\cdot;\Psi_{train}),\mathcal{P}_{train})+\lambda\|(G_\theta(\cdot;\Psi_{train})-X_{true})\odot\Psi_{train}\|^2_F.\tag{37}
$$

式 (33) 中的经验公式给出了式 (18) 中依赖采样的估计误差的实用近似。具体地，如式 (20) 所示，依赖采样的估计误差由最小估计误差（由式 (13) 定义）、信息不足误差（由稀疏采样导致的信息损失引起）与模型估计误差（反映隐空间投影的不完美）组成。式 (33) 用推论 1 中的式 (32) 近似最小估计误差，利用障碍物布局与采样点附近无线电功率变化的程度（两者都显著影响无线电地图的估计）近似信息不足误差，并用训练数据集与测试数据集之间的差异近似模型估计误差。

式 (33) 中的经验公式给出了把扩散模型估计误差与采样率联系起来的函数，且在只有有限无线电样本可用、真值无线电地图不可得时，可从可观测数据直接计算。直观上，该经验公式不仅能计算给定采样率下的估计误差，还能确定达到规定估计精度所需的采样率。因此，由式 (33) 中的经验公式，还可以容易地导出式 (23) 中定义的临界采样率 \(\rho_c\) 的经验公式。

### 8.3 训练采样率与测试采样率

在使用扩散模型进行无线电地图估计的语境中，模型训练时采用的采样率可能与模型测试时采用的采样率不同。直观上，训练采样率不应小于测试采样率，因为模型在训练采样率上优化，可能无法很好地泛化到训练期间未见过的更高采样率输入。然而，**为提高扩散模型在测试时的无线电地图估计性能，测试时采样率应当等于还是小于训练时采样率？** 本节通过分析式 (36) 中推导的、依赖于模型设计的估计误差分量来回答该问题。

设训练期间的采样率为 \(\rho_{train}\)，测试期间为 \(\rho_{test}\)，且 \(\rho_{train}\ge\rho_{test}\)，则我们有如下推论。

**推论 3。** 给定测试采样率 \(\rho_{test}\)，存在训练采样率 \(\rho^*_{train}>\rho_{test}\) 使式 (36) 最小。

基于式 (36)，考虑

$$
E^*_{model}=\underbrace{\mathsf{W}(G_{\theta^*}(\cdot;\Psi_{train}),\mathcal{P}_{train})}_{(A)}+\underbrace{\mathsf{W}(\mathcal{P}_{train},\mathcal{P}_{test})}_{(B)}+\underbrace{\mathsf{W}(G_{\theta^*}(\cdot;\Psi_{test}),G_{\theta^*}(\cdot;\Psi_{train}))}_{(C)}.\tag{38}
$$

下面我们分析每一项并推导推论 3。

**训练分布匹配误差（A）** 该项刻画模型对训练条件分布的拟合程度。由于 \(\rho_{train}\ge\rho_{test}\)，训练阶段提供更多观测信息，使模型能更好地学习底层无线电传播规律。因此，假定模型容量充足，(A) 随 \(\rho_{train}\) 增大而单调减小。记 (A) 为 \(f(\rho_{train})\)，其中 \(f(\cdot)\) 是递减函数。

**条件分布偏移项（B）** 该项反映不同观测条件所导致的真实分布差异。基于无线电传播的物理平滑性与局部相关性，存在常数 \(L>0\) 使得两个条件分布之间的 Wasserstein 距离满足：

$$
\mathsf{W}(\mathcal{P}(\cdot|\Psi_1),\mathcal{P}(\cdot|\Psi_2))\le L\cdot\mathbb{E}_{(i,j)}\big[|\Psi_1(i,j)-\Psi_2(i,j)|\big].\tag{39}
$$

当 \(\Psi_{train}\) 与 \(\Psi_{test}\) 是独立同分布采样时，期望差异为 \(|\rho_{train}-\rho_{test}|\)，因此 \((B)\le L\cdot|\rho_{train}-\rho_{test}|\)。

**条件输入差异项（C）** 该项度量模型输出对输入掩码变化的敏感度。对一个充分训练、能稳健理解无线电传播规律的扩散模型，其输出分布应对输入的微小扰动保持稳定。假定模型满足 Lipschitz 连续性，则存在常数 \(K>0\) 使得

$$
\mathsf{W}(G_{\theta^*}(\cdot;\Psi_1),G_{\theta^*}(\cdot;\Psi_2))\le K\cdot\mathbb{E}_{(i,j)}\big[|\Psi_1(i,j)-\Psi_2(i,j)|\big],\tag{40}
$$

从而 \((C)\le K\cdot|\rho_{train}-\rho_{test}|\)。

综合上述分析，模型估计误差的上界为：

$$
\mathbb{E}[\mathcal{E}_{approx}]\le f(\rho_{train})+(L+K)\cdot(\rho_{train}-\rho_{test}).\tag{41}
$$

当测试采样率 \(\rho_{test}\) 固定时，上界 \(f(\rho_{train})+(L+K)\cdot(\rho_{train}-\rho_{test})\) 关于 \(\rho_{train}\)（\(\rho_{train}\ge\rho_{test}\)）先减小后增大：起初 \(\rho_{train}\) 增大时，\(f(\rho_{train})\) 的快速下降占主导，使上界减小；随着 \(\rho_{train}\) 进一步增大，线性项 \((L+K)(\rho_{train}-\rho_{test})\) 的增长逐渐占主导，导致上界增大。因此，存在使 \(\mathbb{E}[\mathcal{E}_{approx}]\) 的上界最小的最优 \(\rho^*_{train}>\rho_{test}\)。

推论 3 表明，对于基于扩散模型的无线电地图估计，把训练采样率设为略高于测试采样率可以获得最优权衡。该配置平衡了两种相互竞争的效果：它为模型提供充足的训练数据以学习底层无线电传播规律并有效补全缺失信息，同时避免过度的条件失配——后者会在低采样测试场景中降低性能。具体地，当 \(\rho_{train}=\rho_{test}\) 时，模型可能缺乏泛化到观测样本之外的能力；而当 \(\rho_{train}\gg\rho_{test}\) 时，采样条件的差距会损害模型在测试时采样机制下准确工作的能力。

## 9 数值结果

本节通过大规模仿真评估我们所提出的经验公式，这些公式用于近似所推导的扩散模型无线电地图估计误差表达式。

### 9.1 仿真设置

我们使用来自 [50] 的开源无线电地图数据集 **BART-Lab radio maps**[^1] 进行评估。该数据集由仿真软件 **Altair Feko**（来自 **WinProp** [51]）生成，包含 2000 张无线电地图。一张无线电地图中的发射机数量从 1 到 3 不等。数据集中有 2000 种不同的建筑布局，均取自美国的 **OpenStreetMap** [52]。建筑高度设为 10 m。该数据集包含 5 个不同频段的无线电地图仿真结果：1750 MHz、2750 MHz、3750 MHz、4750 MHz 与 5750 MHz。我们选取 5750 MHz 子集进行评估。考虑到数据集中原始地图的分辨率各不相同，为保证一致性，我们从每张地图中随机抽取 \(256\times256\)（即 \(m=n=256\)）的区域。这共得到 1776 张不同的无线电地图，每张分辨率为 \(256\times256\)。其中 1676 张用于模型训练，其余 100 张用于测试。在测试期间，采样率从 \(1/(256\times256)=0.002\%\) 变化到 \(300/(256\times256)=0.458\%\)。对给定采样率，无线电样本在关注区域内随机分布。

[^1]: https://github.com/BRATLab-UCD/Radiomap-Data

我们仿真 [9] 中的 **WiFi-Diffusion** 以评估所提出的经验公式。**WiFi-Diffusion** 首先使用 DDPM（一种著名的扩散模型）在极低采样率下生成一组质量各异的候选无线电地图（仿真中为 64 张无线电地图），然后利用无线电传播原理识别最准确的地图。我们在 NVIDIA RTX 4090 GPU 与 AMD EPYC 9654 CPU 上实现 **WiFi-Diffusion**，训练耗时 44 GPU 小时。深度学习代码基于 PyTorch 构建。对于经验公式中的超参数，在应用公式之前应在目标环境中进行预实验；通过用预实验结果校准超参数，可以得到适合目标环境的经验公式配置。

### 9.2 仿真结果

**对推论 1 的评估** 在定理 1 中，我们推导了 \(E_{\min}\)（扩散模型用于无线电地图估计所能达到的最小估计误差）的理论表达式。由于该表达式在实践中难以直接计算，我们在推论 1 中引入了易于计算的经验近似 \(E^*_{\min}\)。为评估该近似的保真度，我们进行了 5000 次仿真实例，每次的采样率 \(\rho\) 从区间 \([0.002\%,0.458\%]\) 中随机抽取。图 4 给出每个实例所得的 MSE。

**图 4（原文 Fig. 4）：** 评估推论 1 的仿真结果。图中横轴为采样率 \(\rho\)，纵轴为 MSE；散点为 5000 次随机采样率实例的 MSE。实线为 \(E^*_{\min}\) 的期望 \(\mathbb{E}(E^*_{\min})\)，虚线为 \(\mathbb{E}(E^*_{\min})\pm\sqrt{\mathrm{Var}(E^*_{\min})}\)，竖直虚线标出临界采样率 \(\rho_c\)（对应 \(\delta=0.4\)）。（图注按原文与渲染页 p.12 转写。）

图 4 揭示了 WiFi-Diffusion 生成地图质量的变异性，这可归因于扩散模型的随机性（扩散模型输出对随机输入噪声的依赖）。此外，图中红色实线表示 \(E^*_{\min}\) 的期望（回忆如第 VIII-A 节所讨论，\(E^*_{\min}\) 是随机变量 \(\widetilde{\zeta}\) 的函数），红色虚线表示 \(E^*_{\min}\) 的标准差。把这些红线与各实例的 MSE 值比较，我们观察到 \(E^*_{\min}\) 是对最小估计误差的有效近似，因为大多数 MSE 值都靠近期望并落在一个标准差范围内，只有轻微偏差。

图 4 还表明，扩散模型用于无线电地图估计的估计性能随采样率提高而趋于收敛。事实上，定理 3 推导了使估计误差处于最小误差 \(E_{\min}\) 的 \(\delta\) 范围之内所需的采样率 \(\rho_c\)，从而为确定性能收敛的采样率阈值提供指导。在图 4 中，我们还绘制了 \(\delta=0.4\) 时的 \(\rho_c\)。我们观察到，当采样率超过 \(\rho_c\) 后，WiFi-Diffusion 构造的无线电地图质量保持相对稳定。

**对推论 2 的评估** 在定理 2 中，我们推导了 \(E\)（扩散模型用于无线电地图估计所能达到的依赖采样的估计误差）的理论表达式。由于 \(E\) 在实践中难以直接计算，我们在推论 2 中引入了易于计算的经验近似 \(E^*\)。为验证该近似的有效性，我们进行了仿真，结果如图 5 所示。具体地，对每个采样率低于 \(0.0001\) 的仿真实例，我们绘制重建无线电地图的 MSE（纵轴）与相应 \(E^*\) 的期望（横轴）的关系。我们关注低采样率，是因为在该区间估计误差 \(E\) 对采样密度最为敏感，即 \(E\) 与最小误差 \(E_{\min}\) 之间的偏差最为显著。

**图 5（原文 Fig. 5）：** 评估推论 2 的仿真结果。横轴为 \(E^*\) 的期望 \(\mathbb{E}(E^*)\)，纵轴为 MSE；散点为低采样率（低于 0.0001）实例；实线为 \(\mathrm{MSE}=\mathbb{E}(E^*)\)，虚线为 \(\mathrm{MSE}=\mathbb{E}(E^*)\pm\sqrt{\mathrm{Var}(E^*)}\)，图中标注 \(p<0.0001\)。（图注按原文与渲染页 p.13 转写。）

该图证实 \(E^*\) 是 \(E\) 的可靠近似：大多数数据点落在对角线附近，表明实际取得的 MSE 与依赖采样的估计误差的经验近似高度一致。

**对推论 3 的评估** 在推论 3 中，我们证明了对于扩散模型，给定固定的测试时采样率，把训练采样率设为略高于测试采样率可使测试时的估计误差最小。现在我们给出仿真结果以验证该推论。考虑如下采样率集合 \(\mathcal{P}\)：

$$
\mathcal{P}=\{0.002\%,0.015\%,0.031\%,0.046\%,0.061\%,0.076\%,0.092\%,0.107\%,0.122\%,0.137\%,0.153\%,0.168\%,0.183\%,0.198\%,0.214\%,0.229\%,0.244\%,0.259\%,0.275\%,0.290\%,0.305\%\}.
$$

对每个 \(\rho_{train}\in\mathcal{P}\)，我们用该采样率训练一个扩散模型；然后每个训练好的模型在每一个 \(\rho_{test}\in\mathcal{P}\) 上评估，共得到对应所有配对 \((\rho_{test},\rho_{train})\) 的 \(21\times21\) 个 MSE 值。结果可视化于图 6。

**图 6（原文 Fig. 6）：** 评估推论 3 的仿真结果。热图的列表示测试采样率 \(\rho_{test}\)、行表示训练采样率 \(\rho_{train}\)（均在集合 \(\mathcal{P}\) 中取值），每个单元格给出 MSE 差 \(E_{test,test}-E_{train,test}\)；颜色越红表示在 \(\rho_{train}\) 上训练的模型相对"在 \(\rho_{test}\) 上训练并测试"的基线模型优势越大。（图注按原文与渲染页 p.13 转写。）

在图 6 中，每个以 \((\rho_{test},\rho_{train})\) 为索引的单元格显示 MSE 差 \(E_{test,test}-E_{train,test}\)，其中 \(E_{test,test}\) 表示在相同采样率 \(\rho_{test}\) 上训练并测试的模型的 MSE，而 \(E_{train,test}\) 表示在 \(\rho_{train}\) 上训练、在 \(\rho_{test}\) 上测试的模型的 MSE。该差值越大（图中单元格越红），表明在 \(\rho_{train}\) 上训练的模型优于在 \(\rho_{test}\) 上训练并测试的基线模型。从图 6 我们观察到，对每个 \(\rho_{test}\in\mathcal{P}\)，最大差值出现在对角线上方区域，即 \(\rho_{train}>\rho_{test}\) 处。这证实给定测试率下的最优训练采样率高于测试率本身，从而验证了推论 3。

**更多仿真结果** 我们指出，扩散模型也可以用随机采样率训练：每个训练实例采用可能不同的采样率。这引出一个有趣的问题：**用随机采样率训练是否比用固定采样率训练取得更好的性能？** 最后，我们进行了仿真以回答该问题。

在图 7 中，每个以 \((\rho_{test},\rho_{train})\) 为索引的单元格显示 MSE 差 \(E_{random,test}-E_{train,test}\)，其中 \(E_{random,test}\) 表示以随机采样率训练（即每个训练实例的采样率从 \(\mathcal{P}\) 中均匀抽取）、在 \(\rho_{test}\) 上测试的模型的 MSE，而 \(E_{train,test}\) 表示以固定采样率 \(\rho_{train}\) 训练、在 \(\rho_{test}\) 上测试的模型的 MSE。该差值为正（图中颜色越暖），表明固定采样率模型优于随机采样率模型。从图中我们观察到，对每个 \(\rho_{test}\in\mathcal{P}\)，最大差值出现在对角线上方区域。该结果表明，用固定采样率（特别是略高于测试率）训练比用随机采样率训练能取得更优的无线电地图估计性能。

**图 7（原文 Fig. 7）：** 比较以随机采样率训练的扩散模型与以固定采样率训练的扩散模型的仿真结果。热图的列表示测试采样率 \(\rho_{test}\)、行表示训练采样率 \(\rho_{train}\)，每个单元格给出 MSE 差 \(E_{random,test}-E_{train,test}\)；颜色越暖表示固定采样率模型相对随机采样率模型的优势越大。（图注按原文与渲染页 p.14 转写。）

## 10 结论

无线电地图估计问题要求根据区域内稀疏分布传感器采集的有限无线电样本构造无线电地图。由于无线电样本相对于地图分辨率极度稀疏，该问题具有挑战性。虽然扩散模型近来已成为该问题的一种有前景的方法，但其性能通常仅通过把估计无线电地图与真值无线电地图比较来评估，其理论性能仍基本未被探索。本文提供了这一缺失的理论基础。

具体地，通过把无线电地图估计表述为非线性矩阵补全问题，我们推导了扩散模型估计误差的理论表达式，刻画了训练环境与部署环境之间的失配、模型设计以及采样策略对估计无线电地图质量的影响。此外，由于所推导的误差表达式依赖于某些在实践中难以获取的信息，我们提出了一种近似该误差表达式、且可从可观测数据直接计算的经验公式。大量仿真验证了所提出的近似是紧的。

我们的结果不仅为在真值不可得时评估扩散模型性能提供准则，也为确定达到给定估计精度所需的采样率提供准则。结果进一步揭示了一个采样率阈值，超过该阈值后扩散模型的估计性能趋于收敛。作为未来研究方向，我们计划设计超过现有方法、并逼近本文所建立理论精度表达式的基于扩散模型的无线电地图估计模型，以及开发适应动态环境的无线电采样策略，以提升扩散模型的估计性能。

## 参考文献

[1] D. Romero and S.-J. Kim, "Radio map estimation: A data-driven approach to spectrum cartography," IEEE Signal Processing Magazine, vol. 39, no. 6, pp. 53–72, 2022.

[2] Y. Peng, Y. Li, Y. Guo, D. Zhang, F. Khan, R. Alturki, and B. Alshawi, "A blockchain-based distributed collaborative sensing and spectrum access approach for consumer electronics," IEEE Transactions on Consumer Electronics, vol. 71, no. 2, pp. 5044–5054, 2025.

[3] A. S. Matar and X. Shen, "Joint optimization of user association, power control, and dynamic spectrum sharing for integrated aerial-terrestrial network," IEEE Journal on Selected Areas in Communications, vol. 43, no. 1, pp. 396–409, 2025.

[4] J. Zhao, W. Wang, Q. Sun, H. Huo, G. Sun, X. Gao, and C. Zhu, "CSELM-QE: A composite semi-supervised extreme learning machine with unlabeled rss quality estimation for radio map construction," Chinese Journal of Electronics, vol. 29, no. 6, pp. 1016–1024, 2020.

[5] J. Huang, L. Lian, D. Wen, Y. Zhou, F. Wang, W. Wang, and Y. Shi, "Dynamic UAV-assisted cooperative edge AI inference," IEEE Transactions on Wireless Communications, vol. 24, no. 1, pp. 615–628, 2024.

[6] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Transactions on Wireless Communications, vol. 20, no. 6, pp. 4001–4015, 2021.

[7] W. Locke, N. Lokhmachev, Y. Huang, and X. Li, "Radio map estimation with deep dual path autoencoders and skip connection learning," in Proc. of IEEE PIMRC, Toronto, Canada, September 05-08, 2023.

[8] X. Li, S. Zhang, H. Li, X. Li, L. Xu, H. Xu, H. Mei, G. Zhu, N. Qi, and M. Xiao, "RadioGAT: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks," IEEE Transactions on Wireless Communications, vol. 23, no. 11, pp. 17 777–17 792, 2024.

[9] Z. Liu, S. Zhang, Q. Liu, H. Zhang, and L. Song, "WiFi-Diffusion: Achieving fine-grained wifi radio map estimation with ultra-low sampling rate by diffusion models," IEEE Journal on Selected Areas in Communications, vol. 43, no. 11, pp. 3796–3812, 2025.

[10] K. Rizk, J.-F. Wagen, and F. Gardiol, "Two-dimensional ray-tracing modeling for propagation prediction in microcellular environments," IEEE Transactions on Vehicular Technology, vol. 46, no. 2, pp. 508–518, 1997.

[11] R. Wahl, G. Wölfle, P. Wildbolz, and F. Landstorfer, "Dominant path prediction model for urban scenarios," in Proc. of IST Mobile and Wireless Communications, Dresden, Germany, June 19-23, 2005.

[12] T. Zugno, M. Drago, M. Giordani, M. Polese, and M. Zorzi, "Toward standardization of millimeter-wave vehicle-to-vehicle networks: Open challenges and performance evaluation," IEEE Communications Magazine, vol. 58, no. 9, pp. 79–85, 2020.

[13] Y. Deng, B. Zhou, F. Li, and Q. Wu, "Online gaussian process for dynamic radio map updating," in Proc. of MLSP, Istanbul, Turkey, August 31– September 3, 2025.

[14] C. M. Bishop, Neural Networks for Pattern Recognition. New York, NY, USA: Oxford University Press, Inc., 1995.

[15] J. A. Bazerque, G. Mateos, and G. B. Giannakis, "Group-lasso on splines for spectrum cartography," IEEE Transactions on Signal Processing, vol. 59, no. 10, pp. 4648–4663, 2011.

[16] G. Boccolini, G. Hernández-Peñaloza, and B. Beferull-Lozano, "Wireless sensor network for spectrum cartography based on kriging interpolation," in Proc. of IEEE PIMRC, Sydney, Australia, September 09-12, 2012.

[17] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, "Radiodiff: An effective generative diffusion model for sampling-free dynamic radio map construction," IEEE Transactions on Cognitive Communications and Networking, vol. 11, no. 2, pp. 738–750, 2025.

[18] X. Luo, Z. Li, Z. Peng, M. Chen, and Y. Liu, "Denoising diffusion probabilistic model for radio map estimation in generative wireless networks," IEEE Transactions on Cognitive Communications and Networking, vol. 11, no. 2, pp. 751–763, 2025.

[19] K. Qiu, S. Bakirtzis, I. Wassell, H. Song, K. Lin, and J. Zhang, "IRDM: A generative diffusion model for indoor radio map interpolation," in Proc. of IEEE GLOBECOM, Kuala Lumpur, Malaysia, December 4–8, 2023.

[20] D. Romero, T. N. Ha, R. Shrestha, and M. Franceschetti, "Theoretical analysis of the radio map estimation problem," IEEE Transactions on Wireless Communications, vol. 23, no. 10, pp. 13 722–13 737, 2024.

[21] Y. Zhang and S. Wang, "K-nearest neighbors gaussian process regression for urban radio map reconstruction," IEEE Communications Letters, vol. 26, no. 12, pp. 3049–3053, 2022.

[22] D. Denkovski, V. Atanasovski, L. Gavrilovska, J. Riihijärvi, and P. Mähönen, "Reliability of a radio environment map: Case of spatial interpolation techniques," in Proc. of CROWNCOM, Stockholm, Sweden, June 18–20, 2012.

[23] J. Li, Z. Du, B. Zhou, W. Wang, Q. Wu, and W. Saad, "Open-set recognition of communication jamming using raw i/q data with domain adaptation," IEEE Transactions on Communications, vol. 74, pp. 6508–6522, 2026.

[24] S. Shao, L. Cheng, K. Chen, Q. Liu, S. Zhang, H. Zhang, and L. Song, "Collaboradio: A hybrid device-edge-cloud collaboration paradigm for fine-grained radio map construction," IEEE Transactions on Mobile Computing, vol. 25, no. 1, pp. 599–613, 2026.

[25] S. Zhang, A. Wijesinghe, and Z. Ding, "Rme-gan: A learning framework for radio map estimation based on conditional generative adversarial network," IEEE Internet of Things Journal, vol. 10, no. 20, pp. 18 016–18 027, 2023.

[26] H. Jia, N. Cheng, X. Wang, C. Zhou, R. Sun, and X. Shen, "RadioMamba: Breaking the accuracy-efficiency trade-off in radio map construction via a hybrid mamba-unet," IEEE Transactions on Network Science and Engineering, vol. 13, pp. 2454–2468, 2025.

[27] Q. Gao, Q. Zhu, Z. Lin, P. T. Mathiopoulos, Y. Zhao, Y. Huang, J. Wang, and Q. Wu, "Time-variant radio map reconstruction with optimized distributed sensors in dynamic spectrum environments," IEEE Internet of Things Journal, vol. 12, no. 12, pp. 20 927–20 941, 2025.

[28] X. Jang, T. Li, Z. Xiao, K. Chen, S. Ma, Z. Wang, and K. Li, "UniRM: A universal large model for multiband 3d radio map construction," IEEE Journal on Selected Areas in Communications, vol. 44, pp. 2244–2258, 2026.

[29] Z. Liu, Q. Liu, S. Zhang, H. Zhang, and L. Song, "A fine-grained 3D radio map construction paradigm with ultra-low sampling rates by large generative models," IEEE Journal on Selected Areas in Communications, vol. 44, pp. 4397–4413, 2026.

[30] S. Shao, B. Fan, Q. Liu, S. Zhang, H. Zhang, and L. Song, "Temporally predicting fine-grained radio maps with ultra-low sampling rates by large-small model collaboration," IEEE Transactions on Mobile Computing, early access, 2026.

[31] E. J. Candès and B. Recht, "Exact matrix completion via convex optimization," Foundations of Computational Mathematics, vol. 9, no. 6, pp. 717–772, Dec. 2009.

[32] X. Su and T. M. Khoshgoftaar, "A survey of collaborative filtering techniques," Advances in Artificial Intelligence, vol. 2009, no. 1, p. 421425, 2009.

[33] K. H. Jin and J. C. Ye, "Annihilating filter-based low-rank hankel matrix approach for image inpainting," IEEE Transactions on Image Processing, vol. 24, no. 11, pp. 3498–3511, 2015.

[34] J. Ma, Z. Tian, H. Zhang, and T. W. Chow, "Multi-label low-dimensional embedding with missing labels," Knowledge-Based Systems, vol. 137, pp. 65–82, 2017.

[35] L. T. Nguyen, J. Kim, and B. Shim, "Low-rank matrix completion: A contemporary survey," IEEE Access, vol. 7, pp. 94 215–94 237, 2019.

[36] J. Fan and T. W. Chow, "Non-linear matrix completion," Pattern Recognition, vol. 77, pp. 378–394, 2018.

[37] J. Fan and J. Cheng, "Matrix completion by deep matrix factorization," Neural Networks, vol. 98, pp. 34–41, 2018.

[38] S. Si, K.-Y. Chiang, C.-J. Hsieh, N. Rao, and I. S. Dhillon, "Goal-directed inductive matrix completion," in Proc. of ACM SIGKDD, San Francisco, CA, USA, August 13–17, 2016.

[39] B. Øksendal, Stochastic Differential Equations. Berlin, Heidelberg: Springer Berlin Heidelberg, 2003, pp. 65–84.

[40] B. D. Anderson, "Reverse-time diffusion equation models," Stochastic Processes and their Applications, vol. 12, no. 3, pp. 313–326, 1982.

[41] Y. Song and S. Ermon, "Generative modeling by estimating gradients of the data distribution," in Advances in Neural Information Processing Systems, 2019, pp. 11 895–11 907.

[42] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Proc. of NeurIPS, virtual only conference, December 06-12, 2020.

[43] V. D. Bortoli, "Convergence of denoising diffusion models under the manifold hypothesis," Transactions on Machine Learning Research, 2022.

[44] B. Fesl, B. Böck, F. Strasser, M. Baur, M. Joham, and W. Utschick, "On the asymptotic mean square error optimality of diffusion models," in Proc. of AISTATS, Mai Khao, Thailand, May 3–5, 2025.

[45] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, "Score-based generative modeling through stochastic differential equations," in Proc. of ICLR, virtual conference, May 3–7, 2021.

[46] C. Villani, Optimal Transport: Old and New, ser. Grundlehren der mathematischen Wissenschaften. Springer, 2009, vol. 338.

[47] J. D. Gibson, Rate Distortion Theory. Cham: Springer Nature Switzerland, 2025, pp. 77–92.

[48] M. Heusel, H. Ramsauer, T. Unterthiner, B. Nessler, and S. Hochreiter, "GANs trained by a two time-scale update rule converge to a local nash equilibrium," in Proc. of NeurIPS, Long Beach, CA, USA, December 4–9, 2017.

[49] A. Gretton, K. M. Borgwardt, M. J. Rasch, B. Schölkopf, and A. Smola, "A kernel two-sample test," Journal of Machine Learning Research, vol. 13, no. 25, p. 723–773, 2012.

[50] S. Zhang, T. Yu, B. Choi, F. Ouyang, and Z. Ding, "Radiomap inpainting for restricted areas based on propagation priority and depth map," IEEE Transactions on Wireless Communications, vol. 23, no. 8, pp. 9330–9344, 2024.

[51] Altair, Altair WinProp 2021 Documentation, Altair, Troy, Michigan, USA, 2021, Accessed: 2024-12-02. [Online]. Available: https://2021.help.altair.com/2021/winprop/index.htm

[52] OpenStreetMap Contributor Terms, "OpenStreetMap," https://www.openstreetmap.org/, 2024.

---

**本页范围与校对状态：** 本页覆盖 arXiv:2606.25310v3 全文（15 页）：摘要与关键词、第 I–X 节全部正文与小节（§IV-A/IV-B、§VI 的 A1–A4、§VII-A/B/C、§VIII-A/B/C、§IX-A/B）、式 (1)–(41)（编号与原文一致，经脚本核对 1–41 无重号/缺号）、图 1–7 全部图注、参考文献 [1]–[52]（英文原条目，保留原文刊名、卷期与页码；原文采用作者—年份之外的 IEEE 编号制，本页保留 [n] 编号）。**已知缺陷与审计判断（重要）：**

1. **定理 1 是近似而非严格恒等。** 原文式 (13) 用 \(\approx\)，其“证明”依赖 Wasserstein 距离三角不等式与 Bortoli 流形收敛界，并把最小误差写成“流形几何因子 \(\mathcal{R}\) × 分布距离 \(\mathsf{W}\) + 模型近似项 \(\zeta\)”；其中 \(\mathcal{R}\) 的乘积形式（有效直径、对数因子、量纲一致性）在原文是**启发式论证**，未给出严格推导，\(\mathcal{R}\) 中的常数 \(C\) 亦未解析给出。本页按原文保留 \(\approx\)，未改写为等号。
2. **推论 1 依赖有限数据与任务相关拟合常数。** \(E^*_{\min}\) 用数据集 \(Y,\widetilde{Y}\) 的经验直径近似流形直径、用 FID/MMD 近似 Wasserstein 距离，并含与模型和任务相关的拟合常数 \(C'\)（原文未给出其解析形式，需在目标环境用预实验/校准确定）；\(\widetilde{\zeta}\) 需用训练分布的留出集估计。因此该经验公式是“可校准的近似”，并非普适常数公式。
3. **误差相加依赖不相关/可加假设。** 定理 2 的 \(E=E_{\min}+E_{info}+E_{model}\) 及其“偏差—方差分解”仅在误差不相关（原文称“对良态估计量渐近成立”）时可加；\(E_{info}\) 的指数形式借自率失真函数，指数 \(\eta_z^{\dim(M)/\dim(Z)}\) 与 \(R_{\mathrm{eff}}=\eta_z^{d/d_z}\mathcal{I}(\Psi)\) 属启发式建模；\(E_{model}\le C_{model}\varepsilon_{score}^{2\alpha}\) 也是把得分误差映射到样本质量的启发式放缩，本页照原文转述，未补证。
4. **定理 3 的推导前提。** \(\rho_c\) 由高斯尾概率 \(\Phi^{-1}(1-\xi)\) 导出，需 \(\delta E_{\min}-\sigma_\varepsilon\Phi^{-1}(1-\xi)>0\)（原文已说明右端须为正，否则阈值无意义）；并把 \(\mathcal{I}(\Psi_\rho)\) 视为关于 \(\rho\) 的确定性函数（原文称“在关注区间内”）。
5. **式 (35) 按原文照录。** 其分子写作 \(\Psi\odot\sqrt{(\nabla_x X)^2+(\nabla_y X)^2}\)（未含求和符号），分母为 \(\sum_{i=1}^m\sum_{j=1}^n\Psi_{ij}\)；本页未擅自增补求和。
6. **记号说明。** 原文式 (12)(15) 中与部署分布对应的矩阵为 \(\widetilde{M}\)（pypdf 抽取为“fM”），本页统一写作 \(\widetilde{M}\)；第 VI 节中流形与常数同用字母 M，本页按渲染页 p.6 区分：流形记 \(\mathcal{M}\)（A1、\(\mathrm{diam}(\mathcal{M})\)、式 (11)），A3/A4/式 (10) 的常数记 \(M\)。
7. **原文无表格。** 任务说明提到“表格逐格”，但经核对 15 页原文只有图 1–7、无任何表格，故无表格可转写；图 4–7 的图注按 PDF 渲染页 p.12–p.14 的坐标轴/图例/色标描述补充说明，未推测图中不可读的数值。
8. **已完成 PDF 渲染核对页：** p.1（题名/作者/单位/日期/基金）、p.5（式 (2)、DMF 公式、图 3 位置）、p.6（式 (3)–(11)、A1–A4）、p.7（式 (12)–(14)、定理 1 与证明）、p.8（式 (15)–(18)、定理 2）、p.9（式 (19)–(27)）、p.10（式 (28)–(32)）、p.11（式 (33)–(39)、推论 2/3）、p.12（式 (40)–(41)、图 4、§IX 设置）、p.13（图 5、图 6、评估段落）、p.14（图 7、结论前半）。其余页（p.2–p.4、p.15）按 pypdf 抽取文本翻译，其内容为相关工作、矩阵补全背景与参考文献，已与上下文交叉核对。逐句逐式终校未做。

**登记（2026-11-03）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。
{% endraw %}
