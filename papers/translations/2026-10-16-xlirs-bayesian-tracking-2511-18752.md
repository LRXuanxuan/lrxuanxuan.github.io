---
layout: page
title: "XL-IRS 近场稀疏贝叶斯信道估计与跟踪｜中文阶段性译稿"
permalink: /papers/translations/2026-10-16-xlirs-bayesian-tracking-2511-18752/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原文 PDF](https://arxiv.org/pdf/2511.18752v2)

# XL-IRS 辅助宽带毫米波系统的近场稀疏贝叶斯信道估计与跟踪

**原题：** Near-Field Sparse Bayesian Channel Estimation and Tracking for XL-IRS-Aided Wideband mmWave Systems  
**作者：** Xiaokun Tuo、Zijian Chen、Ming-Min Zhao、Changsheng You、Min-Jian Zhao  
**版本：** arXiv:2511.18752v2，2026 年 1 月 16 日，原文 15 页。  
**译文范围：** 摘要、引言、系统模型与传输协议的主要内容。层次先验、完整消息传递更新、仿真与参考文献尚未完成逐段翻译；不计入全文验收。

## 摘要

6G 系统的快速发展要求采用先进技术进一步提升网络容量与频谱效率，特别是在智能反射表面（Intelligent Reflecting Surface，IRS）辅助毫米波通信中。其关键挑战是准确获取信道状态信息（CSI）。对于超大规模 IRS（Extremely Large IRS，XL-IRS），近场传播、高维宽带级联信道以及 XL-IRS 的无源特性使这一问题尤其困难。此外，现有大多数 CSI 获取方法未能充分利用信道固有的时空稀疏性，因此估计性能并不理想。

针对上述挑战，本文考虑 XL-IRS 辅助的宽带 MIMO-OFDM 系统，提出一种高效的信道估计与跟踪（Channel Estimation and Tracking，CET）算法。首先，构建统一的近场级联信道表示模型；然后建立层次化时空稀疏先验，同时描述极坐标域中的二维块稀疏性、角度—时延域中的一维聚簇稀疏性，以及不同信道估计帧之间的时间相关性。基于这些先验，提出**基于张量的稀疏 CET（TS-CET）算法**，将基于张量的正交匹配追踪（OMP）、基于粒子的变分贝叶斯推断（VBI）和消息传递结合起来。仿真结果表明，与既有基线算法相比，TS-CET 框架能够显著提高估计精度并降低导频开销。

**关键词：** 智能反射表面；近场通信；信道估计与跟踪；MIMO-OFDM；毫米波；贝叶斯推断。

## I. 引言

当前无线通信研究的重要目标之一是建设低成本、高能效、同时具备更高频谱效率、资源利用率和智能感知能力的 6G 网络 [1]。为实现这些目标，学术界与工业界正在积极研究各种使能技术。其中，大规模多输入多输出（Massive MIMO）及其进一步发展的超大规模 MIMO（XL-MIMO），因其提升网络容量和频谱效率的潜力而受到广泛关注 [2]。随着天线数量大幅增加，以及工作频段升至毫米波甚至太赫兹，瑞利距离显著增大，使收发机与散射体都可能位于 XL-MIMO 阵列的近场范围内 [3]。于是，电磁传播的波前模型从平面波变为球面波，从根本上改变了相应的信道建模和信号处理框架 [2], [4]。

尽管 XL-MIMO 潜力巨大，但大量天线和射频（RF）链路带来了高昂的硬件成本与能源消耗，给实际部署造成困难 [3]。为解决这一问题，超大规模智能反射表面（XL-IRS）成为一种有前景的解决方案 [5], [6]。通过智能调节反射系数，XL-IRS 可以以较低成本及功耗产生高增益的无源波束，实现接近 XL-MIMO 系统的性能。

鉴于 CSI 获取对于 XL-IRS 辅助系统十分重要，已有研究从窄带和宽带两个方面深入探讨了信道估计（CE）问题 [7]–[10]。不过，6G 对更高速率和更大带宽的持续需求，使宽带传输成为基础要求，因此宽带信道估计也越来越重要 [1]。例如，文献 [8] 针对 IRS 辅助毫米波 MISO-OFDM 系统提出基于结构化典范多元分解（CPD）的估计方法，以 $O(L^2)$ 的训练开销唯一恢复宽带级联信道，其中 $L$ 是路径数。文献 [9] 为缓解宽带 XL-IRS 辅助毫米波系统固有的波束斜视效应，设计了多载波球面域字典，将信道估计转化为基于压缩感知的参数恢复问题，并通过原子相关性匹配求解。文献 [10] 则针对太赫兹 XL-IRS 系统提出频率相关的极坐标域信道估计方案，相比传统方法取得明显提升。

尽管已有这些进展，仍较少有工作充分利用宽带系统近场级联信道在空间域和时延域中固有的稀疏性来提高 CSI 获取精度。此外，在用户低速移动的情形下，IRS—用户信道表现出较强的时间相关性，但这种性质尚未被充分用于降低导频开销。

基于上述考虑，本文研究 XL-IRS 辅助宽带毫米波系统的近场信道估计与跟踪，提出基于张量的稀疏 CET（TS-CET）算法。在极坐标—角度—时延域中对 CET 问题建模，实现低导频开销下的准确 CSI 获取。其主要贡献如下。

1. 提出统一的近场级联信道模型，同时捕获球面波传播、多普勒引起的相位变化以及信道随时间的演化，为后续 TS-CET 算法设计提供基础。
2. 建立层次化时空稀疏先验，刻画混合近场和远场的宽带级联信道结构，联合描述极坐标域中的二维块稀疏性、角度和时延域中的一维聚簇稀疏性以及帧间时间相关性，将空间、频率及时间结构稀疏性整合到统一框架，从而提高估计精度。
3. 提出两阶段 CET 方案。在信道估计阶段，先利用基于张量的 OMP 进行低复杂度粗估计，再通过基于粒子的变分贝叶斯推断（VBI）与消息传递进行细化。在信道跟踪阶段，利用时空先验和历史信道信息近似稀疏级联信道增益与非理想参数的联合后验分布，实现动态跟踪。
4. 仿真结果表明，TS-CET 优于期望最大化 OMP（EM-OMP）和期望最大化快速稀疏贝叶斯学习（EM-FSBL）等基线方法，具有更高的估计、跟踪精度及导频效率。

下文安排如下：第二节介绍系统模型以及包含 CE 与 CT 阶段的双阶段传输协议；第三节建立层次化时空稀疏先验模型，并设计 CT 阶段的有源、无源波束成形；第四节详述 TS-CET 算法；第五节给出数值仿真；第六节总结全文。

**符号说明。** 标量、向量、矩阵分别使用小写、粗体小写与粗体大写表示。$\mathbf z^{\mathsf T}$、$\mathbf z^*$、$\mathbf z^{\mathsf H}$ 分别表示转置、共轭及共轭转置；$\operatorname{diag}(\mathbf z)$ 为对角矩阵；$\delta(\cdot)$ 表示 Dirac delta 函数。指示函数 $\mathbb I(x_1,\ldots,x_N)$ 当所有 $x_n=1$ 时为 1，否则为 0。$\circ$、$\diamond$、$\otimes$、$\odot$ 分别表示张量外积、Hadamard 积、Kronecker 积和 Khatri–Rao 积。

对于 $N$ 阶张量 $\mathcal X\in\mathbb C^{I_1\times\cdots\times I_N}$，其 Tucker 分解表示为

$$
\mathcal X=\mathcal Z\times_1\mathbf D_1\times_2\mathbf D_2\times_3\cdots\times_N\mathbf D_N,\tag{1}
$$

其中 $\mathcal Z\in\mathbb C^{K_1\times\cdots\times K_N}$ 是核心张量，$\mathbf D_n$ 为 $I_n\times K_n$ 矩阵，$\times_n$ 为模 $n$ 乘积。其向量化形式为

$$
\mathbf x=\operatorname{vec}(\mathcal X)=\left(\bigotimes_{n=1}^N\mathbf D_n\right)\mathbf z,\tag{2}
$$

其中 $\mathbf z$ 是 $\mathcal Z$ 的向量化形式，连续 Kronecker 积按 $\mathbf D_N\otimes\mathbf D_{N-1}\otimes\cdots\otimes\mathbf D_1$ 的顺序进行。

## II. 系统模型与传输协议

### A. 系统模型

如图 1，考虑一个采用时分双工（TDD）的宽带毫米波系统。由 $N_R$ 个反射单元构成的 XL-IRS 部署在用户附近，以增强基站（BS）和用户之间的通信。基站配备 $N_B$ 根天线和 $R_B$ 条 RF 链路，且 $R_B\ll N_B$；用户配备 $N_U$ 根天线和一条 RF 链路。基站天线、用户天线以及 XL-IRS 反射单元均采用均匀线性阵列（ULA），天线或单元间距为载波波长 $\lambda_c$ 的一半。

为处理宽带信道的频率选择性衰落，系统采用具有 $K$ 个子载波的 OFDM 调制。第 $k$ 个子载波相对载波的频率为

$$
f_k=\frac{f_s}{K}\left(k-1-\frac{K-1}{2}\right),\quad k\in\{1,\ldots,K\},
$$

其中 $f_s$ 是总带宽。假设用户以低速 $v$ 运动，最大多普勒频偏为 $f_d=v/\lambda_c$。此外，假设基站与用户之间的直接链路被墙体、建筑等障碍物遮挡。

**图 1：** 所考虑的 XL-IRS 辅助宽带毫米波系统模型，包括基站、XL-IRS、用户、散射体、障碍物以及用户运动方向。

### B. 传输协议

由于用户移动，基站—IRS—用户级联信道随时间变化，同时具有明显的时间相关性。因此，本文首先在缺少先验信道信息时利用较多导频估计级联信道，再借助估计结果与时间相关性，以显著更少的导频跟踪信道。为此，作者提出如图 2 所示的两阶段传输协议。

系统时间被划分为多个帧，每帧包含 $\bar T$ 个 OFDM 符号，假设一帧内信道参数保持不变。阶段 I 仅包含初始帧（第 1 帧），后续第 $t\ge2$ 帧属于阶段 II。在阶段 I，用户每隔 $T_s$ 发送一次 OFDM 导频，共发送 $P_{\rm I}$ 次。相较于将全部导频集中在阶段开始处，这种梳状时间导频结构使多普勒频偏在基站接收信号中产生更显著的相位旋转，因此有利于提高多普勒估计性能。基站利用所有接收观测估计级联信道。

在阶段 II，每帧发送 $P_{\rm II}<P_{\rm I}$ 次 OFDM 导频，方式与阶段 I 相同。利用级联信道的时间相关性，并将第 $t-1$ 帧的估计结果作为第 $t$ 帧的先验，可以采用更低导频开销进行跟踪。每帧余下时隙用于用户到基站的上行数据传输。

**图 2：** 由初始信道估计阶段和后续信道跟踪阶段组成的传输协议。

### C. 信道模型

在传统远场信道建模中，$N$ 单元均匀线性阵列的平面波阵列响应向量（Array Response Vector，ARV）可表示为

$$
\mathbf a_{\rm far}(\vartheta)=\left[1,e^{-j\frac{2\pi}{\lambda_c}d\vartheta},\ldots,e^{-j\frac{2\pi}{\lambda_c}(N-1)d\vartheta}\right]^{\mathsf T},\tag{3}
$$

其中 $d$ 是阵元间隔，$\vartheta=\cos\theta$ 是空间角度，$\theta$ 为物理到达角或离开角。对于工作在毫米波频段的 XL-IRS，由于反射单元数量巨大、载波波长短，近场范围对应的瑞利距离 $Z=2D^2/\lambda_c$（$D$ 是阵列孔径）会显著增大。因此，用户或散射体更可能位于近场区域，远场阵列响应无法准确描述球面电磁波的传播特征 [2]。

为解决这一问题，作者采用球面波假设下的近场阵列响应：

$$
\mathbf a_{\rm near}(\varphi,r)=
\left[e^{-j\frac{2\pi}{\lambda_c}(r^{(1)}-r)},\ldots,
 e^{-j\frac{2\pi}{\lambda_c}(r^{(N)}-r)}\right]^{\mathsf T},\tag{4}
$$

其中 $\varphi$ 是空间角度，$r$ 是散射体或用户到参考阵元的距离，$r^{(n)}$ 是到第 $n$ 个阵元的距离，可表示并通过 Fresnel 近似得到

$$
\begin{aligned}
r^{(n)}&=\sqrt{\bigl(r\sqrt{1-\varphi^2}\bigr)^2+\bigl(r\varphi-(n-1)d\bigr)^2}\\
&\approx r-d(n-1)\varphi+\frac{d^2(n-1)^2(1-\varphi^2)}{2r}.
\end{aligned}\tag{5}
$$

这里对平方根进行泰勒近似。考虑多普勒频偏后，在第 $t$ 帧的第 $p$ 个导频时刻，第 $k$ 个子载波上的 IRS—用户信道为

$$
\mathbf H_{k,p}^{(t)}=
\sum_{l=0}^{L^{(t)}-1}\alpha_l^{(t)}e^{-j2\pi f_k\tau_{U,l}^{(t)}}e^{j\psi_{p,l}^{(t)}}
\mathbf a_R(\vartheta_{U,l}^{(t)},r_{U,l}^{(t)})
\mathbf a_U^{\mathsf H}(\varphi_{U,l}^{(t)}).\tag{6}
$$

其中 $L^{(t)}$ 是第 $t$ 帧的传播路径数，$\alpha_l^{(t)}$ 与 $\tau_{U,l}^{(t)}$ 分别为第 $l$ 条路径的复增益与时延；$\psi_{p,l}^{(t)}=2\pi f_d(p-1)T_s\varphi_{U,l}^{(t)}$ 为多普勒引起的相位旋转，$\varphi_{U,l}^{(t)}$ 为相应离开空间角度；$\mathbf a_R$、$\mathbf a_U$ 分别表示 XL-IRS 处近场、用户处远场的阵列响应。虽然这些信道参数在一帧内假设不变，但由于多普勒相位项，不同导频时刻的信道矩阵仍然不同。

由于 XL-IRS 部署在用户附近，基站到 XL-IRS 的距离通常相对较大，因此可把第 $t$ 帧第 $k$ 子载波上的基站—IRS 信道建模为远场视距信道：

$$
\mathbf G_k^{(t)}=\beta^{(t)}e^{-j2\pi f_k\tau_B}\,
\mathbf a_B(\vartheta_B)\mathbf a_R^{\mathsf H}(\varphi_B).\tag{7}
$$

其中 $\beta^{(t)}$、$\tau_B$ 分别为复路径增益和时延，$\vartheta_B$、$\varphi_B$ 分别为基站和 XL-IRS 处的空间角度。由于基站和 XL-IRS 位置固定，$\tau_B$ 及角度参数在不同帧之间保持不变。

在第 $t$ 帧的第 $p$ 个导频时刻，令 $x_{k,p}\in\mathbb C$ 为第 $k$ 个子载波发送的上行导频，$\mathbf f_p^{(t)}\in\mathbb C^{N_U\times1}$ 和 $\mathbf W_p^{(t)}\in\mathbb C^{N_B\times R_B}$ 分别是用户端和基站端有源波束成形向量或矩阵。接收信号写为

$$
\mathbf y_{k,p}^{(t)}=\sqrt{p_T}(\mathbf W_p^{(t)})^H
\mathbf G_k^{(t)}\boldsymbol\Theta_p^{(t)}\mathbf H_{k,p}^{(t)}
\mathbf f_p^{(t)}x_{k,p}+\overline{\mathbf n}_{k,p}^{(t)}
=\sqrt{p_T}x_{k,p}\mathbf X_p^{(t)}\mathbf R_{k,p}^{(t)}\mathbf v_p^{(t)}+
\overline{\mathbf n}_{k,p}^{(t)}.\tag{8}
$$

其中，$p_T$ 为用户发射功率；$\mathbf v_p^{(t)}=[e^{j\iota_{1,p}^{(t)}},\ldots,e^{j\iota_{N_R,p}^{(t)}}]^\top$ 为 XL-IRS 的无源反射波束，$\boldsymbol\Theta_p^{(t)}=\operatorname{diag}(\mathbf v_p^{(t)})$；$\mathbf R_{k,p}^{(t)}=(\mathbf H_{k,p}^{(t)})^\top\odot\mathbf G_k^{(t)}$ 是级联信道；$\mathbf X_p^{(t)}=(\mathbf f_p^{(t)})^\top\otimes(\mathbf W_p^{(t)})^H$ 为测量矩阵的一部分；$\overline{\mathbf n}_{k,p}^{(t)}=(\mathbf W_p^{(t)})^H\mathbf n_{k,p}^{(t)}$，且 $\mathbf n_{k,p}^{(t)}\sim\mathcal{CN}(0,\sigma^2 I)$。

将式（6）、（7）代入并利用 Khatri–Rao 积与 Kronecker 积之间的恒等式，可以把级联信道整理成路径求和：

$$
\mathbf R_{k,p}^{(t)}=\sum_{l=0}^{L^{(t)}-1}\gamma_l^{(t)}
 e^{-j2\pi f_k\bar\tau_l^{(t)}}
\widetilde{\mathbf a}_{BU,p}(\phi_{U,l}^{(t)})
\mathbf a_R^\top(\bar\vartheta_l^{(t)},\bar r_l^{(t)}).\tag{9}
$$

这里 $\gamma_l^{(t)}=\alpha_l^{(t)}\beta^{(t)}$ 是级联复路径增益，$\bar\tau_l^{(t)}=\tau_{U,l}^{(t)}+\tau_B$ 是总传播时延；$\widetilde{\mathbf a}_{BU,p}(\phi_{U,l}^{(t)})=(\mathbf a_U^*(\phi_{U,l}^{(t)})\otimes\mathbf a_B(\vartheta_B))e^{j\psi_{p,l}^{(t)}}$。XL-IRS 处的有效极坐标参数满足

$$
\bar\vartheta_l^{(t)}=\vartheta_{U,l}^{(t)}+\phi_B,\qquad
\bar r_l^{(t)}=\frac{1-(\bar\vartheta_l^{(t)})^2}{1-(\vartheta_{U,l}^{(t)})^2}\,r_{U,l}^{(t)}.
$$

这一等效变换基于近场阵列响应相位中的二次距离项，原文式（10）说明两种表达的第 $n$ 个阵元相位相同：

$$
-d(n-1)\bar\vartheta_l^{(t)}+
\frac{d^2(n-1)^2[1-(\bar\vartheta_l^{(t)})^2]}{2\bar r_l^{(t)}}.\tag{10}
$$

定义频率响应向量 $\mathbf a_f(\tau)=[e^{-j2\pi f_1\tau},\ldots,e^{-j2\pi f_K\tau}]^\top$。将全部子载波的级联信道写成三阶张量 $\boldsymbol{\mathcal R}_p^{(t)}\in\mathbb C^{N_{BU}\times N_R\times K}$，$N_{BU}=N_BN_U$，得到

$$
\boldsymbol{\mathcal R}_p^{(t)}=\sum_{l=0}^{L^{(t)}-1}\gamma_l^{(t)}
\widetilde{\mathbf a}_{BU,p}(\phi_{U,l}^{(t)})\circ
\mathbf a_R(\bar\vartheta_l^{(t)},\bar r_l^{(t)})\circ
\mathbf a_f(\bar\tau_l^{(t)}).\tag{11}
$$

其中 $\circ$ 为张量外积，$\mathbf R_{k,p}^{(t)}$ 是张量对应子载波切片的模一展开。对所有被选择的 $\bar K$ 个导频子载波堆叠，可形成观测张量

$$
\boldsymbol{\mathcal Y}_p^{(t)}=
\sum_{l=0}^{L^{(t)}-1}\gamma_l^{(t)}
(\mathbf X_p^{(t)}\widetilde{\mathbf a}_{BU,p}(\phi_{U,l}^{(t)}))\circ
((\mathbf v_p^{(t)})^\top\mathbf a_R(\bar\vartheta_l^{(t)},\bar r_l^{(t)}))\circ
(\sqrt{p_T}\operatorname{diag}(\mathbf x_p)\mathbf S\mathbf a_f(\bar\tau_l^{(t)}))
+\overline{\boldsymbol{\mathcal N}}_p^{(t)}.\tag{12}
$$

$\mathbf S\in\{0,1\}^{\bar K\times K}$ 是子载波选择矩阵，文中以 comb-4 导频为例；$\mathbf x_p$ 来自 Zadoff–Chu 序列。该张量观测模型同时包含空间、时延、导频相位以及 Doppler 导致的变化。近场球面波、频偏、无源反射以及高维级联关系共同增加了估计难度，因此接下来需要利用多域结构化稀疏性。

## III. 层次化时空稀疏先验模型

本节构建用于信道估计与跟踪（CET）的贝叶斯压缩感知框架。在 XL-IRS 处考虑极坐标域，在用户端考虑角度域，并在宽带维度考虑时延域。第一阶段的 CE 采用反映空间结构的层次概率模型；从第 $t\geq2$ 帧起的 CT 采用描述信道参数演化的动态概率模型；最后分别设计两个阶段的有源和无源波束。

### A. 级联信道的极坐标—角度—时延域稀疏表示

首先在用户角度域构建由 $N_U$ 个采样点组成的均匀网格 $\boldsymbol\phi=[\phi_1,\ldots,\phi_{N_U}]^\top$，在时延域构建 $N_f$ 个点的均匀网格 $\boldsymbol\tau=[\tau_1,\ldots,\tau_{N_f}]^\top$。对应采样位置为

$$
\phi_u=\frac{2}{N_U}\left(u-\frac{N_U+1}{2}\right),\qquad
\tau_k=\frac{1}{f_s}\left(k-\frac12\right).
$$

假设 $N_f$ 足够大，使得所有级联路径时延都小于 $\tau_{N_f}$。对于 XL-IRS 处的极坐标域，使用 $\bar N_R=N_RS$ 个非均匀网格点 $(\bar\vartheta_m,\bar r_m)$；其中 $N_R$ 与 $S$ 分别为角度和距离网格数。原文式（13）依据极坐标采样方法确定角度与距离，并使用阈值距离 $Z_\Delta$ 控制距离采样间隔。

由于真实角度、时延和极坐标位置连续变化，通常不会恰好落在离散字典网格上。为进行超分辨参数估计，作者引入四组离网格修正量 $\Delta\boldsymbol\phi^{(t)}$、$\Delta\boldsymbol\tau^{(t)}$、$\Delta\bar{\boldsymbol\vartheta}^{(t)}$ 和 $\Delta\bar{\mathbf r}^{(t)}$。令 $u_l^{(t)}$、$k_l^{(t)}$、$m_l^{(t)}$ 为与第 $l$ 条真实路径的角度、时延、极坐标位置最近的网格索引。非零位置上的修正值定义为

$$
\Delta\phi_u^{(t)}=\phi_{U,l}^{(t)}-\phi_u\quad(u=u_l^{(t)}),\qquad
\Delta\tau_k^{(t)}=\bar\tau_l^{(t)}-\tau_k\quad(k=k_l^{(t)}),\tag{14}
$$

$$
\Delta\bar\vartheta_m^{(t)}=\bar\vartheta_l^{(t)}-\bar\vartheta_m,\qquad
\Delta\bar r_m^{(t)}=\bar r_l^{(t)}-\bar r_m\quad(m=m_l^{(t)}).\tag{15}
$$

不属于对应路径最近邻网格的位置，其离网格修正设为零。利用这些修正向量，构造三个模的字典 $\widetilde{\mathbf A}_{BU,p}(\Delta\boldsymbol\phi^{(t)})$、$\mathbf A_R(\Delta\bar{\boldsymbol\vartheta}^{(t)},\Delta\bar{\mathbf r}^{(t)})$、$\mathbf A_f(\Delta\boldsymbol\tau^{(t)})$。三阶级联信道张量便有 Tucker 型稀疏表示

$$
\boldsymbol{\mathcal R}^{(t)}_p=
\boldsymbol{\mathcal Z}^{(t)}
\times_1\widetilde{\mathbf A}_{BU,p}(\Delta\boldsymbol\phi^{(t)})
\times_2\mathbf A_R(\Delta\bar{\boldsymbol\vartheta}^{(t)},\Delta\bar{\mathbf r}^{(t)})
\times_3\mathbf A_f(\Delta\boldsymbol\tau^{(t)}).\tag{16}
$$

$\boldsymbol{\mathcal Z}^{(t)}\in\mathbb C^{N_U\times\bar N_R\times N_f}$ 为极坐标—角度—时延域中的稀疏级联信道，其非零单元对应 $L^{(t)}$ 条传播路径。把它代入式（12），并对观测张量向量化，可得

$$
\mathbf y_p^{(t)}=\mathbf F_p^{(t)}\mathbf z^{(t)}+\bar{\mathbf n}_p^{(t)},\tag{18}
$$

$$
\mathbf F_p^{(t)}=
\bigl[\sqrt{p_T}\operatorname{diag}(\mathbf x_p)\mathbf S\mathbf A_f(\Delta\boldsymbol\tau^{(t)})\bigr]
\otimes\bigl[(\mathbf v_p^{(t)})^\top\mathbf A_R(\Delta\bar{\boldsymbol\vartheta}^{(t)},\Delta\bar{\mathbf r}^{(t)})\bigr]
\otimes\bigl[\mathbf X_p^{(t)}\widetilde{\mathbf A}_{BU,p}(\Delta\boldsymbol\phi^{(t)})\bigr].
$$

这里 $\mathbf z^{(t)}=\operatorname{vec}(\boldsymbol{\mathcal Z}^{(t)})\in\mathbb C^{\bar N\times1}$、$\bar N=N_U\bar N_RN_f$。将同一帧的 $P$ 个导频观测拼接后，得到标准线性观测模型

$$
\mathbf y^{(t)}=\mathbf F^{(t)}\mathbf z^{(t)}+\bar{\mathbf n}^{(t)},\tag{19}
$$

其中 $\mathbf y^{(t)}=[\mathbf y_1^{(t)};\ldots;\mathbf y_P^{(t)}]$，$\mathbf F^{(t)}$ 与噪声向量按相同方式纵向拼接。

### B. 用于信道估计的空间结构化稀疏概率模型

在第一帧 CE 中，省略上标 $t$。将 $\mathbf z$ 的幅度、相位及支撑向量分别记为 $\boldsymbol\nu$、$\boldsymbol\omega$、$\mathbf s$。向量的三维索引 $(u,m,k)$ 与一维索引 $n$ 的关系为 $n=(k-1)\bar N_RN_U+(m-1)N_U+u$。进一步定义角度、极坐标位置、时延三个模的支撑向量 $\mathbf s_U$、$\mathbf s_R$ 和 $\mathbf s_K$。当某个模式的对应网格上存在非零路径时，支撑标志为 $1$，否则为 $-1$。将 Doppler 频偏 $f_d$ 与离网格参数集合 $\Xi=\{\Delta\boldsymbol\phi,\Delta\boldsymbol\tau,\Delta\bar{\boldsymbol\vartheta},\Delta\bar{\mathbf r}\}$ 纳入后，层次先验分解为

$$
\begin{aligned}
p(&\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\mathbf s_U,\mathbf s_R,\mathbf s_K,f_d,\Xi)
=p(\boldsymbol\nu\mid\mathbf s)p(\boldsymbol\omega\mid\mathbf s)
 p(\mathbf s\mid\mathbf s_U,\mathbf s_R,\mathbf s_K)\\
&\qquad\cdot p(\mathbf s_U)p(\mathbf s_R)p(\mathbf s_K)p(f_d)p(\Xi).
\end{aligned}\tag{20}
$$

**1）路径幅度与相位的概率模型。** 一条级联路径的增益 $\gamma_l=\alpha_l\beta$ 是两个相互独立的圆对称复高斯变量的乘积，假设 $\alpha_l\sim\mathcal{CN}(0,\sigma_{H,l}^2)$、$\beta\sim\mathcal{CN}(0,\sigma_G^2)$。因此 $\gamma_l$ 服从复双高斯分布，而其幅度与相位的边缘分布分别为

$$
f_A(|\gamma_l|)=\frac{4|\gamma_l|}{\sigma_{H,l}^2\sigma_G^2}
K_0\!\left(\frac{2|\gamma_l|}{\sigma_{H,l}\sigma_G}\right),
\qquad \angle\gamma_l\sim\mathrm{Unif}(0,2\pi).\tag{21}
$$

这里 $K_0$ 为第二类零阶修正 Bessel 函数。给定支撑状态后，各元素的幅度与相位先验按元素相乘：

$$
p(\boldsymbol\nu\mid\mathbf s)=\prod_{u,m,k}p(\nu_{u,m,k}\mid s_{u,m,k}),\qquad
p(\boldsymbol\omega\mid\mathbf s)=\prod_{u,m,k}p(\omega_{u,m,k}\mid s_{u,m,k}).\tag{22}
$$

在非激活网格点，上述分布为零点处的 Dirac 质量；在激活网格点，分别采用 $f_A$ 和均匀相位分布。

**2）三模支撑的联合约束。** 三维支撑向量由三个一维模式支撑共同控制：

$$
p(\mathbf s\mid\mathbf s_U,\mathbf s_R,\mathbf s_K)=
\prod_{u,m,k}p(s_{u,m,k}\mid s_{U,u},s_{R,m},s_{K,k}).\tag{23}
$$

若三种模式的相应网格未全部激活，$s_{u,m,k}$ 被固定为零支撑；若全部激活，则以概率 $p_s$ 产生非零路径。

**3）极坐标位置支撑的二维块稀疏性。** 对 $\mathbf s_R$ 采用马尔可夫随机场（MRF）的 Ising 模型，鼓励相邻极坐标网格形成连续的非零块。其分布可以写为

$$
p(\mathbf s_R)=\frac1C\prod_m\left[e^{-\bar\eta_ms_{R,m}}
\prod_{m'\in\mathcal D_m}e^{\frac12\check\eta_{m,m'}s_{R,m}s_{R,m'}}\right].\tag{24}
$$

其中 $C$ 为归一化常数，$\mathcal D_m$ 为邻域索引集合，$\bar\eta_m$ 是稀疏偏置参数，$\check\eta_{m,m'}$ 是邻域耦合参数。原文图 3(a) 使用四邻接 MRF 因子图展示这种关系。增大偏置通常使支撑更稀疏，增大邻域耦合则倾向于产生更大的非零块。考虑到 XL-IRS 的网格规模，作者根据极坐标网格位置用两个全局参数 $\bar\eta$、$\check\eta$ 生成局部参数，以避免逐个调节海量 MRF 参数。这使靠近极点的先验呈现更弱的稀疏性和更大的非零块，而远离极点则产生更强的稀疏性和较小的非零块。

**4）角度与时延支撑的一维聚簇稀疏性。** 由于散射体数量有限且往往成簇，$\mathbf s_U$ 与 $\mathbf s_K$ 均使用一阶马尔可夫链建模：

$$
p(\mathbf s_U)=p(s_{U,1})\prod_{u=2}^{N_U}p(s_{U,u}\mid s_{U,u-1}),\tag{25}
$$

$$
p(\mathbf s_K)=p(s_{K,1})\prod_{k=2}^{N_f}p(s_{K,k}\mid s_{K,k-1}).\tag{26}
$$

状态 $-1\to1$ 与 $1\to-1$ 的转移概率分别由 $\lambda_{U,-1,1},\lambda_{U,1,-1}$ 或 $\lambda_{K,-1,1},\lambda_{K,1,-1}$ 给出；初始分布选取相应马尔可夫链的平稳分布。图 3(b) 展示链式因子图。

**5）Doppler 频偏与离网格参数。** 若用户最大速度 $v_{\max}$ 已知，则为 Doppler 频偏设置均匀先验 $p(f_d)=\mathrm{Unif}(0,f_{d,\max})$，其中 $f_{d,\max}=v_{\max}/\lambda_c$。如果最大速度未知，可以利用第一阶段粗估计选取足够大的上界。四组离网格参数使用独立零均值高斯先验：

$$
p(\Xi)=\prod_{u,m,k}p(\Delta\phi_u)p(\Delta\bar\vartheta_m)
 p(\Delta\bar r_m)p(\Delta\tau_k),\tag{27}
$$

各组方差分别设为 $\varrho_\phi^2,\varrho_{\bar\vartheta}^2,\varrho_{\bar r}^2,\varrho_\tau^2$。

### C. 用于信道跟踪的时间动态稀疏概率模型

从第二帧开始，将 $\boldsymbol\nu^{(2:T)}$ 等符号用于表示参数随帧变化的序列。时间动态先验仍采用分解形式：

$$
\begin{aligned}
p(&\boldsymbol\nu^{(2:T)},\boldsymbol\omega^{(2:T)},\mathbf s^{(2:T)},f_d^{(2:T)},\Xi^{(2:T)})
=p(\boldsymbol\nu^{(2:T)}\mid\mathbf s^{(2:T)})
 p(\boldsymbol\omega^{(2:T)}\mid\mathbf s^{(2:T)})\\
&\qquad\cdot p(\mathbf s^{(2:T)})p(f_d^{(2:T)})
 p(\Delta\boldsymbol\phi^{(2:T)})p(\Delta\bar{\boldsymbol\vartheta}^{(2:T)})
 p(\Delta\bar{\mathbf r}^{(2:T)})p(\Delta\boldsymbol\tau^{(2:T)}).
\end{aligned}\tag{28}
$$

**幅度与相位。** 对慢速运动，路径幅度和相位可以采用 Gauss–Markov 过程：

$$
\nu_n^{(t)}=(1-\chi_\nu)(\nu_n^{(t-1)}-\mu_\nu)+\chi_\nu\varepsilon_{\nu,n}^{(t)}+\mu_\nu,\tag{29}
$$

$$
\omega_n^{(t)}=(1-\chi_\omega)(\omega_n^{(t-1)}-\mu_\omega)+\chi_\omega\varepsilon_{\omega,n}^{(t)}+\mu_\omega.\tag{30}
$$

$\chi_\nu,\chi_\omega\in[0,1]$ 调节时间相关性，$\mu_\nu,\mu_\omega$ 为平稳均值，$\varepsilon$ 为高斯扰动。根据是否存在有效路径，状态转移采用零点 Dirac 分布与高斯条件分布的混合；式（31）和式（32）分别将幅度、相位条件先验分解为第二帧初始分布和后续各帧的条件转移概率。第二帧初始分布由 CE 阶段的 $\widehat\nu_n,\widehat\omega_n$ 预测得到。

**支撑向量。** 传播环境缓慢变化时，各支撑位置也可以由一阶马尔可夫链刻画：

$$
p(\mathbf s^{(2:T)})=
\prod_{n=1}^{\bar N}p(s_n^{(2)})\prod_{t=3}^{T}p(s_n^{(t)}\mid s_n^{(t-1)}).\tag{33}
$$

$-1\to1$、$1\to-1$ 的转移概率分别为 $\lambda_{-1,1}$、$\lambda_{1,-1}$；初始概率使用 CE 阶段估计的支撑状态 $\widehat s_n$ 及相应转移概率得到。

**Doppler 频偏。** 若用户加速度较小，Doppler 频偏同样具有较强的时间相关性，因而采用

$$
f_d^{(t)}=(1-\chi_f)(f_d^{(t-1)}-\mu_f)+\chi_f\varepsilon_f^{(t)}+\mu_f,\tag{34}
$$

其中噪声方差与更新方式和式（29）类似，第二帧的先验均值由 CE 阶段的 $\widehat f_d$ 推出。

**离网格参数。** 其缓慢演化使用高斯随机游走：

$$
\Delta\boldsymbol\phi^{(t)}=\Delta\boldsymbol\phi^{(t-1)}+\mathbf c_\phi^{(t)},\qquad
\Delta\boldsymbol\tau^{(t)}=\Delta\boldsymbol\tau^{(t-1)}+\mathbf c_\tau^{(t)},\tag{35}
$$

$$
\Delta\bar{\boldsymbol\vartheta}^{(t)}=\Delta\bar{\boldsymbol\vartheta}^{(t-1)}+\mathbf c_{\bar\vartheta}^{(t)},\qquad
\Delta\bar{\mathbf r}^{(t)}=\Delta\bar{\mathbf r}^{(t-1)}+\mathbf c_{\bar r}^{(t)}.\tag{36}
$$

扰动向量服从各自独立的零均值高斯分布。式（37）将 $\Delta\boldsymbol\phi^{(2:T)}$ 的先验分解为各分量的初始概率及时间转移概率；其余三种离网格参数采用相同建模方式。

### D. 信道估计与跟踪的有源及无源波束成形设计

主动波束 $\mathbf f_p^{(t)},\mathbf W_p^{(t)}$ 和无源波束 $\mathbf v_p^{(t)}$ 均会显著影响 CET 质量。由于 BS 与 XL-IRS 之间的空间角度 $\vartheta_B$ 已知且恒定，可将 BS 端有源合并矩阵的列设计为与 $\mathbf a_B(\vartheta_B)$ 对齐，即 $[\mathbf W_p^{(t)}]_{:,n}=e^{j\theta_{W,n,p}}\mathbf a_B(\vartheta_B)$，其中 $\theta_{W,n,p}$ 为 $[0,2\pi]$ 中随机生成的相位。用户有源波束与 XL-IRS 无源波束则根据 CE 和 CT 阶段可用先验的差异分别设计，具体细节列于附录 A。

## IV. TS-CET 算法

在第 $t$ 帧，给定截至当前帧的全部观测 $\mathbf y^{(1:t)}$，目标是求出幅度 $\nu_n^{(t)}$、相位 $\omega_n^{(t)}$、Doppler 频偏 $f_d^{(t)}$ 与各离网格参数的最小均方误差（MMSE）估计。以幅度为例，

$$
\widehat\nu_n^{(t)}=\mathbb E[\nu_n^{(t)}\mid\mathbf y^{(1:t)}],\qquad
p(\nu_n^{(t)}\mid\mathbf y^{(1:t)})\propto\int_{\sim\nu_n^{(t)}}p(\mathbf y^{(1:t)},\boldsymbol\kappa^{(t)}).\tag{38}
$$

其中第 $t=1$ 帧的未知变量集合为 $\boldsymbol\kappa^{(1)}=\{\boldsymbol\nu,\boldsymbol\omega,\mathbf s,\mathbf s_U,\mathbf s_R,\mathbf s_K,f_d,\Xi\}$；在 $t\ge2$ 的跟踪阶段改为 $\{\boldsymbol\nu^{(t)},\boldsymbol\omega^{(t)},\mathbf s^{(t)},f_d^{(t)},\Xi^{(t)}\}$。高维积分和因子图中的环路使精确边缘后验难以计算。既有 VBI 与稀疏贝叶斯学习方法直接应用于此也存在困难：常用共轭先验难以表示双高斯级联增益；EM 对测量字典参数只给出最大似然点估计而非其边缘后验；同时需要处理结构不同的 CE 与 CT 两个阶段。

### A. TS-CET 两阶段方案概要

TS-CET 结合张量正交匹配追踪（OMP）、基于粒子的变分贝叶斯推断（VBI）和消息传递，以近似估计 $\boldsymbol\kappa^{(t)}$ 中全部未知量的边缘后验。核心是随机粒子 VBI（SPVBI）：利用离散粒子及其权重表示难以直接计算的分布，使不同形状的先验都能参与推断。但若对全部高维未知量均使用大量粒子，存储和更新成本过高，因此作者采用图 4 中的两阶段结构。

**阶段 I：粗估计。** 给定当前帧观测 $\mathbf y^{(t)}$，先运行高效张量联合模 OMP（ETJM-OMP），估计稀疏信道 $\mathbf z^{(t)}$ 的非零支撑集合 $\dot{\mathcal N}^{(t)}$，并给出幅度、相位、频偏及离网格参数的初始点估计。

**阶段 II：精估计。** 以第一阶段的支撑集合和粗估计为初始化，将当前观测与前一帧传递来的近似后验结合，通过 SPVBI 获取 $q(\nu_n^{(t)}),q(\omega_n^{(t)}),q(s_n^{(t)}),q(f_d^{(t)}),q(\Xi^{(t)})$ 等边缘后验，其中 $q(\nu_n^{(t)})\approx p(\nu_n^{(t)}\mid\mathbf y^{(1:t)})$。由于只需对估计的活跃支撑使用粒子，计算与存储负担显著降低。对于 CE 阶段，作者用 turbo 框架将 SPVBI 与消息传递结合，以利用空间结构化稀疏性；对于 CT 阶段，则近似式（38）的联合分布，简化时序消息传递，从而不再需要同样的 turbo 框架。具体计算过程见后续章节。



---

**续译状态：** 第二节和第三节大部分公式已译；第四节剩余算法、第五至六节、附录和参考文献尚待对照原始 PDF 补充。此处是明确标识范围的阶段性译稿，不代表完整论文，也未经过逐页、逐式验收。

{% endraw %}