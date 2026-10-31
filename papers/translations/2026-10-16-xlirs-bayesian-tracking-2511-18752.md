---
layout: page
title: "XL-IRS 近场稀疏贝叶斯信道估计与跟踪｜中文全文译文"
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
**译文范围（2026-10-30 校对更新）：** 已译摘要、正文 I–VI、附录 A–C、主要公式（1）–（51）、算法 1 及图 1–9 相关文字；参考文献 [1]–[36] 已按 PDF 第 14–15 页逐条恢复为英文书目（2026-10-30 复核：36/36 条编号、作者、题名、出处与源文一致）。复杂推导仍待逐段逐式核验，不计入已验收全文。

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

这里对平方根进行泰勒近似。

> **原文公式校对注：** 原文在式（5）下将 $\sqrt{1+x}=1+\frac12x-\frac18x^2+\mathcal O(x^2)$ 作为 Fresnel 近似依据；若显式保留二次项，通常正确的 Taylor 余项应为 $\mathcal O(x^3)$。这里不改动原文的式（5），但指出其说明文字中的余项阶数笔误。

考虑多普勒频偏后，在第 $t$ 帧的第 $p$ 个导频时刻，第 $k$ 个子载波上的 IRS—用户信道为

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

假设 $N_f$ 足够大，使得所有级联路径时延都小于 $\tau_{N_f}$。对于 XL-IRS 处的极坐标域，使用 $\bar N_R=N_RS$ 个非均匀网格点 $(\bar\vartheta_m,\bar r_m)$；其中 $N_R$ 与 $S$ 分别为角度和距离网格数。依据原文式（13），角度网格与距离网格的采样位置为

$$
\bar\vartheta_m=\frac{2}{N_R}
\left(\left\lfloor\frac{m-1}{S}\right\rfloor-\frac{N_R-1}{2}\right),
\qquad
\bar r_m=Z_\Delta\,\frac{1-\bar\vartheta_m^2}{\operatorname{mod}(m-1,S)}.\tag{13}
$$

其中 $Z_\Delta$ 为距离阈值。**原文公式核对说明：** 当 $\operatorname{mod}(m-1,S)=0$ 时，式（13）的距离表达式包含零分母。按原文保留该式，不能把这一项当作有限距离直接计算；若实现时将其作为远场极限网格点处理，需要另行确定程序中的实际约定。

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

$\boldsymbol{\mathcal Z}^{(t)}\in\mathbb C^{N_U\times\bar N_R\times N_f}$ 为极坐标—角度—时延域中的稀疏级联信道，其非零单元对应 $L^{(t)}$ 条传播路径。将式（16）代入式（12），三阶观测张量首先满足

$$
\begin{aligned}
\boldsymbol{\mathcal Y}_p^{(t)}
={}&\boldsymbol{\mathcal Z}^{(t)}
\times_1\left(\mathbf X_p^{(t)}
\widetilde{\mathbf A}_{BU,p}(\Delta\boldsymbol\phi^{(t)})\right)\\
&\times_2\left((\mathbf v_p^{(t)})^{\mathsf T}
\mathbf A_R(\Delta\bar{\boldsymbol\vartheta}^{(t)},\Delta\bar{\mathbf r}^{(t)})\right)\\
&\times_3\left(\sqrt{p_T}\operatorname{diag}(\mathbf x_p)\,
\mathbf S\mathbf A_f(\Delta\boldsymbol\tau^{(t)})\right)
+\overline{\boldsymbol{\mathcal N}}_p^{(t)}.
\end{aligned}\tag{17}
$$

再将观测张量向量化，可得

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

$\chi_\nu,\chi_\omega\in[0,1]$ 调节时间相关性，$\mu_\nu,\mu_\omega$ 为平稳均值，$\varepsilon$ 为高斯扰动。根据是否存在有效路径，状态转移采用零点 Dirac 分布与高斯条件分布的混合；式（31）和式（32）分别将幅度、相位条件先验分解为第二帧初始分布和后续各帧的条件转移概率。第二帧初始分布由 CE 阶段的 $\widehat\nu_n,\widehat\omega_n$ 预测得到。原文的跨帧先验分解式为

$$
p(\boldsymbol\nu^{(2:T)}\mid\mathbf s^{(2:T)})
=\prod_{n=1}^{\bar N}p(\nu_n^{(2)}\mid s_n^{(2)})
\prod_{t=3}^{T}p(\nu_n^{(t)}\mid\nu_n^{(t-1)},s_n^{(t)}).\tag{31}
$$

$$
p(\boldsymbol\omega^{(2:T)}\mid\mathbf s^{(2:T)})
=\prod_{n=1}^{\bar N}p(\omega_n^{(2)}\mid s_n^{(2)})
\prod_{t=3}^{T}p(\omega_n^{(t)}\mid\omega_n^{(t-1)},s_n^{(t)}).\tag{32}
$$

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

扰动向量服从各自独立的零均值高斯分布。对于角度离网格向量，原文的时序先验因子分解为

$$
p(\Delta\boldsymbol\phi^{(2:T)})
=\prod_{u=1}^{N_U}p(\Delta\phi_u^{(2)})
\prod_{t=3}^{T}p(\Delta\phi_u^{(t)}\mid\Delta\phi_u^{(t-1)}).\tag{37}
$$

其余三类离网格参数 $\Delta\boldsymbol\tau$、$\Delta\bar{\boldsymbol\vartheta}$ 与 $\Delta\bar{\mathbf r}$ 采用类似的因子分解。

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




### B. CT 阶段联合分布的近似

在信道跟踪（CT）阶段的第 $t$ 帧，算法根据全部历史观测 $\mathbf y^{(1:t)}$，求取路径幅度 $\nu_n^{(t)}$、相位 $\omega_n^{(t)}$、多普勒频偏 $f_d^{(t)}$ 和离网格参数 $\Xi_{u,m,k}^{(t)}$ 的边缘后验。为降低跨帧时序消息传递的复杂度，作者首先将式（38）的联合分布拆解为三部分：当前帧观测的似然、描述前后帧参数变化的时变稀疏先验，以及前一帧参数的边缘后验。原文式（39）写为

$$
\begin{aligned}
p(\mathbf y^{(1:t)},\boldsymbol\kappa^{(t)})
={}&p(\mathbf y^{(t)}\mid\boldsymbol\nu^{(t)},
\boldsymbol\omega^{(t)},f_d^{(t)},\boldsymbol\Xi^{(t)})\\
&\times\int_{\boldsymbol\kappa^{(t-1)}}
p(\boldsymbol\nu^{(t)}\mid\boldsymbol\nu^{(t-1)},\mathbf s^{(t)})
p(\boldsymbol\omega^{(t)}\mid\boldsymbol\omega^{(t-1)},\mathbf s^{(t)})\\
&\quad{}\cdot p(\mathbf s^{(t)}\mid\mathbf s^{(t-1)})
p(f_d^{(t)}\mid f_d^{(t-1)})
p(\boldsymbol\Xi^{(t)}\mid\boldsymbol\Xi^{(t-1)})\\
&\quad{}\cdot p(\boldsymbol\nu^{(t-1)}\mid\mathbf y^{(1:t-1)})
p(\boldsymbol\omega^{(t-1)}\mid\mathbf y^{(1:t-1)})
p(\mathbf s^{(t-1)}\mid\mathbf y^{(1:t-1)})\\
&\quad{}\cdot p(f_d^{(t-1)}\mid\mathbf y^{(1:t-1)})
p(\boldsymbol\Xi^{(t-1)}\mid\mathbf y^{(1:t-1)}).
\end{aligned}\tag{39}
$$

其中三个因子组依次对应本帧观测似然、时变稀疏先验与上一帧边缘后验。原文用对前一帧状态的积分表示历史状态消元，并在该式中采用上一帧边缘后验的乘积近似；为避免擅自改变原文推导，这里保留其写法。随后用 SPVBI 产生的近似边缘后验替代精确历史后验，得到

$$
\begin{aligned}
\widehat p(\mathbf y^{(1:t)},\boldsymbol\kappa^{(t)})\simeq{}&
p(\mathbf y^{(t)}\mid\boldsymbol\nu^{(t)},\boldsymbol\omega^{(t)},f_d^{(t)},\boldsymbol\Xi^{(t)})\\
&\cdot\widehat p(\boldsymbol\nu^{(t)}\mid\mathbf s^{(t)})\,
\widehat p(\boldsymbol\omega^{(t)}\mid\mathbf s^{(t)})\\
&\cdot\widehat p(\mathbf s^{(t)})\,
\widehat p(f_d^{(t)})\,
\widehat p(\boldsymbol\Xi^{(t)}).
\end{aligned}\tag{40}
$$

以幅度先验为例，作者对前一帧粒子后验作高斯近似 $\widehat q(\nu_n^{(t-1)})=\mathcal N(\widehat m_{n}^{(t-1)},\widehat\Sigma_{n}^{(t-1)})$，再与动态转移分布卷积，从而获得第 $t$ 帧幅度的预测先验：

$$
\begin{aligned}
\widehat p(\nu_n^{(t)})&=\mathcal N(m_n^{(t)},\Sigma_n^{(t)}),\\
m_n^{(t)}&=(1-\chi_\nu)\widehat m_n^{(t-1)}+\chi_\nu\mu_\nu,\\
\Sigma_n^{(t)}&=(1-\chi_\nu)^2\widehat\Sigma_n^{(t-1)}+\chi_\nu^2\zeta_\nu.
\end{aligned}
$$

当 $s_n^{(t)}$ 表示某条路径是否激活时，相应幅度先验是零点冲激与连续高斯分布的混合；激活概率由上一帧的支持后验和马尔可夫转移概率预测：

$$
\widehat\pi_n^{(t)}=w_{n,1}^{(t-1)}(1-\lambda_{1,-1})+
\lambda_{-1,1}w_{n,2}^{(t-1)}.
$$

相位、频偏及离网格偏移的预测先验采用相似的计算。由于这里已将上一帧的消息折叠进当前帧先验，CT 阶段不再需要 CE 阶段用于空间稀疏性联合估计的 turbo 消息传递框架。

### C. 阶段 I：ETJM-OMP 方法

第一阶段先估计信道张量的稀疏支撑集合 $\dot{\mathcal N}^{(t)}$，为第二阶段初始化路径幅度、相位、Doppler 频偏及离网格参数。ETJM-OMP 先在较小的三维索引集合 $\mathcal S^{(t)}=\{\mathcal N_U^{(t)},\overline{\mathcal N}_R^{(t)},\mathcal N_f^{(t)}\}$ 内搜索原子；CE 阶段的候选集合由张量 OMP 顺序搜索（T-OMP-SS）给出，CT 阶段则由上一帧的支持估计产生。与顺序搜索不同，ETJM-OMP 同时选择张量三个维度上的索引，以减轻分维选取所造成的误匹配，并减少相对于全维联合 OMP 的存储和计算开销。

设第 $l$ 次迭代、第 $p$ 个导频观测的残差为 $\mathcal T_p^{(l)}$，初始化 $\mathcal T_p^{(0)}=\mathcal Y_p$。每次按以下准则联合选择空间、极域和时延原子：

$$
\begin{aligned}
&(u^{(l)},m^{(l)},k^{(l)})\\
&=\arg\max_{u,m,k}\frac1Z\sum_{p=1}^{P}\Bigl|\mathcal T_p^{(l-1)}
\times_1\mathbf u_{U,p}^{H}(u)
\times_2\mathbf u_{R,p}^{H}(m)
\times_3\mathbf u_{K,p}^{H}(k)\Bigr|^2.
\end{aligned}\tag{41}
$$

式中三个向量分别对应主动波束和角度原子、XL-IRS 无源波束与极域原子，以及子载波导频与时延原子；$Z$ 是由原子范数构成的归一化因子。在第 $l$ 轮选出活跃路径后，将所有选中原子的组合构成非稀疏测量矩阵 $\mathbf U^{(l)}$，用伪逆得到幅度系数 $\dot{\mathbf z}=(\mathbf U^{(l)})^\dagger\mathbf y$，再从各个导频观测残差中减去该路径的张量外积。残差功率低于阈值 $\varepsilon_{\rm I}$ 时停止。

活跃路径的三维索引压缩成线性索引：

$$
n^{(l)}=(k^{(l)}-1)\overline N_RN_U+(m^{(l)}-1)N_U+u^{(l)}.
$$

路径增益的模和相角给出 $\dot\nu_n$、$\dot\omega_n$。固定已识别的活跃支撑与增益后，通过以下最大似然（ML）对应的残差最小化问题估计 Doppler 频偏 $\dot f_d$ 和离网格偏移向量 $\boldsymbol\Xi$：

$$
\min_{\dot f_d,\boldsymbol\Xi}
\sum_{k=1}^{\bar K}\sum_{p=1}^{P}
\left\|
\mathbf y_{k,p}
-\sqrt{p_T}\,x_{k,p}\mathbf W_p^{\mathsf H}
\mathbf a_B(\vartheta_B)\mathbf f_p^{\mathsf T}
\dot{\mathbf R}_{k,p}\mathbf v_p
\right\|_2^2.\tag{42}
$$

其中 $\dot{\mathbf R}_{k,p}$ 为固定已识别活跃路径集合 $\dot{\mathcal N}$ 和初始复增益 $\dot{\mathbf z}$ 后、按照候选频偏及离网格参数重构的级联信道：

$$
\begin{aligned}
\dot{\mathbf R}_{k,p}
={}&\sum_l[\dot{\mathbf z}]_l\,
e^{-j2\pi f_k(\tau_{k^{(l)}}+\Delta\tau_{k^{(l)}})}
\widetilde{\mathbf a}_{U,p}
(\varphi_{u^{(l)}}+\Delta\varphi_{u^{(l)}})\\
&\quad\cdot\mathbf a_R^{\mathsf T}
(\bar\vartheta_{m^{(l)}}+\Delta\bar\vartheta_{m^{(l)}},
\bar r_{m^{(l)}}+\Delta\bar r_{m^{(l)}}),\\
\widetilde{\mathbf a}_{U,p}(\varphi)
\triangleq{}&\mathbf a_U^*(\varphi)
e^{j2\pi f_d(p-1)T_s\varphi}.
\end{aligned}
$$

上述补式对应原文紧随式（42）之后对 $\dot{\mathbf R}_{k,p}$ 和 $\widetilde{\mathbf a}_{U,p}$ 的定义，避免遗漏 ML 优化目标随待估参数变化的具体机制。原文使用 Armijo 步长规则进行梯度下降：

$$
\begin{aligned}
f_d^{(i+1)}&=f_d^{(i)}-\epsilon_{f_d}^{(i)}g_{f_d}^{(i)},\\
\Delta\phi_{u^{(l)}}^{(i+1)}&=\Delta\phi_{u^{(l)}}^{(i)}-\epsilon_{\phi}^{(i)}g_{\phi,l}^{(i)}.
\end{aligned}\tag{43}
$$

其他离网格偏移 $\Delta\overline\vartheta_{m^{(l)}}$、$\Delta\overline r_{m^{(l)}}$、$\Delta\tau_{k^{(l)}}$ 采用类似的梯度更新。$g$ 表示式（42）目标函数相对于相应变量的梯度。

### D. 阶段 II：T-SPVBI 方法

CE 阶段需要联合利用极域的二维块稀疏性以及角度、时延域的一维簇稀疏性。直接套用式（40）的跨帧近似不能表征这些初始空间结构，因此作者将消息传递和随机粒子变分贝叶斯推断组合成 turbo-SPVBI（T-SPVBI）。原文图 5 表明，它包含两个反复交换外信息的模块：模块 A 负责 SPVBI 后验估计，模块 B 负责空间结构化稀疏性组合。在 CT 阶段，模块 B 被省略，由前一帧传递的近似后验作为模块 A 的先验。

**1）模块 A：SPVBI 估计器。** 将待估参数划分为连续变量和离散支撑变量。连续变量集合为 $\mathcal H_1=\{\boldsymbol\nu,\boldsymbol\omega,f_d,\Delta\boldsymbol\phi,\Delta\overline{\boldsymbol\vartheta},\Delta\overline{\mathbf r},\Delta\boldsymbol\tau\}$；CE 阶段离散集合为 $\mathcal H_2=\{\mathbf s,\mathbf s_U,\mathbf s_R,\mathbf s_K\}$，CT 阶段为 $\mathcal H_2=\{\mathbf s\}$。每个变量的边缘变分分布用有限个 Dirac 粒子表示：

$$
q(\kappa_{l,n})=\sum_{k=1}^{N_p}w_{l,n,k}\,\delta(\kappa_{l,n}-p_{l,n,k}),
\qquad q(\boldsymbol\kappa)=\prod_l\prod_n q(\kappa_{l,n}).
$$

其中 $p_{l,n,k}$ 是粒子位置，$w_{l,n,k}$ 为其非负权重，并满足归一化约束。对离散支撑变量，只需两个固定位置 $+1$、$-1$ 的粒子。对于连续变量，需要联合优化粒子位置和权重，使变分分布与目标后验之间的 Kullback–Leibler（KL）散度最小。原文问题（44）为

$$
\begin{aligned}
\min_{\{\mathbf w_{l,n}\},\{\mathbf p_{l,n}\}}\quad&
\mathcal K=\int q(\boldsymbol\kappa)
\log\frac{q(\boldsymbol\kappa)}{\widehat p(\mathbf y,\boldsymbol\kappa)}\,d\boldsymbol\kappa,\\
\text{s.t.}\quad&\sum_{k=1}^{N_p}w_{l,n,k}=1,\quad\varepsilon_w<w_{l,n,k}\le1,\\
&\dot\kappa_{l,n}-\Delta_{l,n}\le p_{l,n,k}\le
\dot\kappa_{l,n}+\Delta_{l,n},\quad\kappa_l\in\mathcal H_1.
\end{aligned}\tag{44}
$$

这里 $\dot\kappa_{l,n}$ 是第一阶段的粗估计，$\Delta_{l,n}$ 规定相应的可信搜索区间；权重下界 $\varepsilon_w>0$ 用于避免退化粒子。由于目标分布的高维积分难以精确计算，作者用随机逐次凸近似（Stochastic Successive Convex Approximation，SSCA）交替优化位置与权重。连续参数的初始区间参考 OMP 统计误差界，频偏与离网格偏移的区间则在仿真中设置为与粗估计绝对值成比例（比例因子 $c\in[0,1]$）。

收敛后的粒子分布可转化为高斯近似，以便在 CT 阶段向下一帧传递均值和方差：

$$
\widehat m_{l,n}=\sum_{k=1}^{N_p}\widehat p_{l,n,k}\widehat w_{l,n,k},\qquad
\widehat\Sigma_{l,n}=\sum_{k=1}^{N_p}\widehat p_{l,n,k}^{2}\widehat w_{l,n,k}-\widehat m_{l,n}^{2}.
$$

此外，模块 A 给模块 B 传递支撑变量的外信息，例如 $g_{BU,n}(s_{U,n})=q(s_{U,n})/g_{AU,n}(s_{U,n})$；角度和时延域的支撑外信息以同样方式计算。

**2）模块 B：稀疏性组合器。** 模块 B 在极域马尔可夫随机场（MRF）及角度、时延域马尔可夫链的因子图上运行和积（sum–product）消息传递。模块 A 的外信息作为因子图中相应的先验因子，模块 B 据此计算反向外信息，并返回模块 A。由于极域 MRF 含有回路，采用有环置信传播（loopy belief propagation）更新消息。迭代结束后，各域输出信息形式分别为 $g_{AU,u}$、$g_{AR,m}$ 和 $g_{AK,k}$。

**原文算法 1：TS-CET 总流程（步骤译文）。** 输入是当前帧观测、收发波束、XL-IRS 反射系数、频域导频、各域字典，以及 CT 阶段的上一帧后验；输出是所有连续待估参数的 MMSE 后验均值。阶段 I 首先初始化三维候选搜索集合；在外层迭代中反复用式（41）寻找活跃路径、更新稀疏幅度估计和支撑索引，直到残差收敛，然后根据式（43）修正频偏与离网格参数。阶段 II 在其基础上初始化粒子位置与权重，模块 A 依式（44）通过 SSCA 更新；对 CE 阶段，再由模块 B 执行支持变量因子图上的和积消息传递。两个模块迭代到终止条件，输出连续参数的后验均值。算法整体复杂度分析见原文第四节末及附录 C。

## V. 仿真结果

仿真考虑二维坐标场景：BS 固定于 $(0,0)$ m，XL-IRS 固定于 $(60,30)$ m，移动用户初始位置为 $(70,5)$ m，沿 $y$ 轴以 $5$ m/s 移动。BS 配备 $N_B=32$ 根天线和 $R_B=4$ 条 RF 链；XL-IRS 有 $N_R=128$ 个反射单元；用户有 $N_U=16$ 根天线和一条 RF 链。极域非均匀位置网格包含 $384$ 个网格点：$128$ 个角度网格、每角度 $3$ 个距离网格。初始 IRS–用户信道中有三个散射体簇，分别贡献 $4$、$2$、$2$ 条路径，总计 $L^{(1)}=8$；这些簇导致极域二维块稀疏，以及角度、时延域的一维簇稀疏。

系统带宽为 $f_s=200$ MHz，总子载波数为 $K=128$；循环前缀长度为 $L_{\rm cp}=K/4$，有效时延网格数 $N_f=3L_{\rm cp}/4=24$。信道估计与跟踪只使用 $\overline K=31$ 个子载波。初始 CE 阶段采用 $P_{\rm I}=20$ 个 OFDM 导频符号，后续 CT 阶段仅采用 $P_{\rm II}=6$ 个。信道大尺度路径损耗按文献 [31] 建模。除特殊说明外，载频为 $28$ GHz、噪声功率为 $-91$ dBm、信噪比为 $10$ dB、$\varepsilon_v=0.5$、粒子数 $N_p=10$、批大小 $B=15$。在该场景下 XL-IRS 的 Rayleigh 距离约 $86.2$ m，而用户到 XL-IRS 的距离约 $26.9$ m，因此用户确实位于 XL-IRS 的近场区域。

以每个导频期间真实级联信道张量 $\mathcal R_p^{(t)}$ 及其重构 $\widehat{\mathcal R}_p^{(t)}$ 之间的 NMSE 为性能指标：

$$
\mathrm{NMSE}^{(t)}=\frac1P\sum_{p=1}^P
\frac{\|\widehat{\mathcal R}_p^{(t)}-\mathcal R_p^{(t)}\|_F^2}
{\|\mathcal R_p^{(t)}\|_F^2}.
$$

基准包括 CE 阶段的 EM-OMP 和 EM-FSBL，CT 阶段逐帧独立估计且不利用时序相关性的 EM-FSBL，以及仅跟踪稀疏增益、不更新非理想参数的 TS-CET。另设一组已知全部非理想参数的理想 TS-CET，为信道估计误差提供性能下界。

**图 6：算法收敛性。** ETJM-OMP 大约在 $30$ 次迭代后收敛，且残差对应的 NMSE 曲线基本单调下降；CE 和 CT 中的 SPVBI 约在 $25$ 次迭代后收敛。SPVBI 早期会出现轻微振荡，原因是其 SSCA 梯度由随机采样得到的统计期望逐步近似，不具备严格的逐次单调下降保证；随着迭代增加，整体呈下降趋势。

**图 7：初始 CE 阶段在不同 SNR 下的 NMSE。** TS-CET 优于 EM-OMP 和 EM-FSBL。作者将其归因于两点：粒子后验可以更准确地近似复杂的双高斯级联增益先验；以及模块 B 中的 turbo 消息传递联合利用二维极域块稀疏与角度、时延域一维簇稀疏，从而降低错误激活路径的概率。TS-CET 和完美非理想参数版本之间仍存在误差差距，在较高 SNR 下趋于稳定，反映粒子化后验近似自身带来的参数估计误差。

**图 8：CT 阶段跨帧跟踪及导频数的影响。** TS-CET 在多个时间帧内表现稳定。相反，不使用历史信息的 EM-FSBL 需要每帧重新估计，在 CT 导频显著减少后波动明显；若使用 TS-CET 但不持续跟踪频偏与离网格参数，估计误差会逐帧累积，使 NMSE 随时间上升。所提 TS-CET 只用 $6$ 个导频就可获得良好的跟踪效果，进一步增至 $8$ 个改善很有限；降至 $4$ 个则明显恶化。而 EM-FSBL 把导频数增至 $8$ 时 NMSE 改善明显，表明其性能更受导频开销制约。

**图 9：CT 阶段时均 NMSE 与 SNR。** 对 $T=50$ 个帧，定义 $\mathrm{TNMSE}=\frac1{(T-1)P}\sum_{t=2}^T\sum_{p=1}^P \frac{\|\widehat{\mathcal R}_p^{(t)}-\mathcal R_p^{(t)}\|_F^2}{\|\mathcal R_p^{(t)}\|_F^2}$。各算法的时均估计误差通常随 SNR 增加而降低，但不跟踪非理想参数或不利用时序相关性的基准仍存在明显性能差距。TS-CET 在仅用较少导频的 CT 阶段取得接近 CE 阶段的估计精度，且高 SNR 下两者更接近，因为噪声影响减弱后，信道时序相关性能被更充分利用。

## VI. 结论

本文研究 XL-IRS 辅助宽带毫米波系统中的近场稀疏信道估计与跟踪问题。通过设计极域—角度—时延域字典，并结合张量表示技术，建立级联 BS–IRS–用户信道的多维稀疏表示；在此基础上，分别构建 CE 阶段的空间结构化先验和 CT 阶段的时序动态稀疏先验。随后提出 TS-CET，将张量 OMP、基于粒子的 VBI 与消息传递相结合，以相对低的导频和计算开销，近似求解两个阶段信道参数的后验分布。数值实验表明，该算法能够在初始估计和后续动态跟踪中保持较高的信道估计精度。



## 附录 A：XL-IRS 无源波束成形设计

如正文所述，CE 阶段与 CT 阶段在可用先验知识上有所不同，因此作者采用不同的无源波束设计策略。初始 CE 阶段尚不知道用户及散射体的位置，故第 $p$ 个导频对应的 XL-IRS 反射系数采用随机相位：

$$
[\mathbf v_p^{(1)}]_n=e^{j\theta_{v,n,p}},\qquad
\forall n\in\mathcal N_R,\quad p=1,\ldots,P.\tag{45}
$$

其中 $\theta_{v,n,p}$ 在 $[0,2\pi]$ 内随机生成。这一设计能够形成近似全向的探测波束，覆盖可能出现的用户和散射体位置，并降低测量矩阵不同列的相关性，从而改善压缩感知估计性能。

在后续 CT 阶段，既需要利用上一帧估计的潜在路径位置取得反射增益，也需要探索尚未被检测到的位置。为此，作者设计近场多波束。设 $\overline{\mathcal N}^{(t-1)}_R$ 包含上一帧所估计的非零位置支撑，在角度–距离网格上将其与邻域索引合并，形成扩展候选集 $\widetilde{\mathcal N}^{(t)}_R$，邻域范围由 $\Delta N$ 控制。将相应近场阵列响应构成候选波束矩阵 $\widetilde{\mathbf A}^{(t)}_R$；剩余网格位置构成探索波束矩阵 $\dot{\mathbf A}^{(t)}_R$。在每个导频时隙，把全部候选波束与一部分探索波束合并为 $\mathbf A^{(t)}_{R,p}$，使连续 $P$ 个时隙可以扫描余下的位置。

具体地，设候选位置数为 $\widetilde Q$、余下位置数为 $\dot Q=\overline N_R-\widetilde Q$，每个导频对应的探索波束组大小为 $M_R^{(t)}=\lfloor\dot Q/P\rfloor$，末组容纳剩余索引。无源波束通过如下优化同时提升多个方向的反射增益：

$$
\begin{aligned}
\max_{\mathbf v_p^{(t)}}\quad&\| (\mathbf v_p^{(t)})^T\mathbf A_{R,p}^{(t)}\|_2^2,\\
\text{s.t.}\quad&| (\mathbf v_p^{(t)})^T\mathbf a_q|^2
-| (\mathbf v_p^{(t)})^T\mathbf a_1|^2<\varepsilon_v,\\
&\qquad q=2,\ldots,\check Q,\\
&|[\mathbf v_p^{(t)}]_n|=1,\quad\forall n\in\mathcal N_R.
\end{aligned}\tag{46}
$$

原文式（46b）为各波束的增益差异约束，目的是使多个关注方向获得近似相等的波束增益，避免单一方向占据绝大多数能量；式（46c）对应反射单元的恒模约束。

> **式（46b）约束方向校对注：** 原文写的是 $|\mathbf v^T\mathbf a_q|^2-|\mathbf v^T\mathbf a_1|^2<\varepsilon_v$，并**没有**对两者差值加绝对值。该单边不等式本身只限制前一波束功率相对参考波束功率的上偏差，不能单独保证每个波束功率都“近似相等”；这属于原文优化表述中值得注意的约束充分性问题。译文保留原式，不擅自改成双边约束。

该非凸问题可通过半正定松弛（SDR）与秩一重缩放方法，或不进行变量提升的其他方法近似求解。发射端主动波束 $\mathbf f_p^{(t)}$ 亦采用类似设计。

## 附录 B：通过 SSCA 优化粒子权重和位置

针对正文式（44）的 KL 散度最小化问题，作者利用随机逐次凸近似（SSCA）交替优化每个变量 $\kappa_{l,n}$ 的粒子位置向量 $\mathbf p_{l,n}$ 和权重向量 $\mathbf w_{l,n}$。

**粒子位置更新。** 第 $i$ 次迭代时，保持上一轮权重 $\mathbf w_{l,n}^{(i-1)}$ 不变，并将其他变量 $\widetilde{\boldsymbol\kappa}_{l,n}$ 对目标函数的影响取期望，得到粒子位置子问题（47）：

$$
\begin{aligned}
\min_{\mathbf p_{l,n}}\quad&
\mathcal K_{\kappa_{l,n}}^{(i)}(\mathbf w_{l,n}^{(i-1)},\mathbf p_{l,n})\\
&=\mathbb E_{\widetilde{\boldsymbol\kappa}_{l,n}}\left[
 g_{\kappa_{l,n}}^{(i)}(\mathbf w_{l,n}^{(i-1)},\mathbf p_{l,n};
 \widetilde{\boldsymbol\kappa}_{l,n})\right],\\
\text{s.t.}\quad&\dot\kappa_{l,n}-\Delta_{l,n}\le p_{l,n,k}\le
\dot\kappa_{l,n}+\Delta_{l,n},\quad\forall k.
\end{aligned}\tag{47}
$$

文中 $g$ 将粒子权重的熵项与对数联合分布项相结合；其条件期望一般无法直接计算。作者围绕上一轮位置构造带二次正则项的凸替代函数：

$$
\bar f_{\mathbf p_{l,n}}^{(i)}(\mathbf p_{l,n})
=(\mathbf f_{\mathbf p_{l,n}}^{(i)})^T
(\mathbf p_{l,n}-\mathbf p_{l,n}^{(i-1)})
+\Omega_{\mathbf p_{l,n}}
\|\mathbf p_{l,n}-\mathbf p_{l,n}^{(i-1)}\|_2^2.\tag{48}
$$

$\Omega_{\mathbf p_{l,n}}>0$，而 $\mathbf f_{\mathbf p_{l,n}}^{(i)}$ 通过递推平均小批量随机梯度得到。记从其他变量当前变分分布抽取的 $B$ 组样本为 $\widetilde{\boldsymbol\kappa}_{l,n}^{(b)}$，则有

$$
\mathbf f_{\mathbf p}^{(i)}=(1-\rho^{(i)})\mathbf f_{\mathbf p}^{(i-1)}
+\frac{\rho^{(i)}}B\sum_{b=1}^B
\nabla_{\mathbf p}g^{(i)}(\mathbf w^{(i-1)},\mathbf p^{(i-1)};
\widetilde{\boldsymbol\kappa}^{(b)}).
$$

最小化式（48）并满足区间约束，相当于先按负梯度方向移动，再投影到允许区间：令 $\widetilde p_{l,n,k}=p_{l,n,k}^{(i-1)}-[\mathbf f_{\mathbf p}^{(i)}]_k/(2\Omega_{\mathbf p})$，将其裁剪至 $[\dot\kappa_{l,n}-\Delta_{l,n},\dot\kappa_{l,n}+\Delta_{l,n}]$ 得到 $\bar p_{l,n,k}$。最终使用松弛更新

$$
\mathbf p_{l,n}^{(i)}=(1-\gamma^{(i)})\mathbf p_{l,n}^{(i-1)}
+\gamma^{(i)}\bar{\mathbf p}_{l,n}.\tag{49}
$$

**粒子权重更新。** 保持更新后的位置 $\mathbf p_{l,n}^{(i)}$ 不变，类似地构造带二次正则项的权重凸替代函数：

$$
\bar f_{\mathbf w_{l,n}}^{(i)}(\mathbf w_{l,n})
=(\mathbf f_{\mathbf w_{l,n}}^{(i)})^T
(\mathbf w_{l,n}-\mathbf w_{l,n}^{(i-1)})
+\Omega_{\mathbf w_{l,n}}
\|\mathbf w_{l,n}-\mathbf w_{l,n}^{(i-1)}\|_2^2.\tag{50}
$$

其中梯度估计 $\mathbf f_{\mathbf w_{l,n}}^{(i)}$ 也通过小批量梯度的指数递推平均得到。由于权重必须为正且总和为一，作者使用单纯形投影求得满足式（44b）的中间权重 $\bar{\mathbf w}_{l,n}$，再作

$$
\mathbf w_{l,n}^{(i)}=(1-\gamma^{(i)})\mathbf w_{l,n}^{(i-1)}
+\gamma^{(i)}\bar{\mathbf w}_{l,n}.\tag{51}
$$

根据文献 [36] 的定理 3，只要步长序列满足 $\rho^{(i)}\to0$、$\sum_i\rho^{(i)}=\infty$、$\sum_i(\rho^{(i)})^2<\infty$ 和 $\gamma^{(i)}/\rho^{(i)}\to0$ 等条件，SPVBI 可几乎必然收敛至式（44）的驻点解集合。文中给出一种实际参数选择：$\rho^{(i)}=5/[5+(i-1)^{0.9}]$，$\gamma^{(i)}=5/[15+(i-1)]$。

## 附录 C：计算复杂度分析

第一阶段中，确定粗三维候选集合 $\mathcal S^{(t)}$ 的操作具有常数级开销。每次张量联合搜索的复杂度为 $O(R_B\overline K L^3)$，网格偏移梯度更新开销为 $O(N_U^2+\overline N_R^2+N_f^2)$。设平均联合搜索次数为 $N_{\rm JS}$、第一阶段外层迭代次数为 $N_{\rm I}$，则总复杂度为

$$
O\!\left(N_{\rm I}\left[N_{\rm JS}R_B\overline K L^3+
N_U^2+\overline N_R^2+N_f^2\right]\right).
$$

第二阶段中，SPVBI 模块使用小批量抽样和凸替代函数最小化。记 $J$ 为待估参数变量数、$B$ 为批大小、$N_p$ 为每个连续变量的粒子数、$F_{\rm grad}$ 为一次梯度计算的平均 FLOPs。单变量的随机梯度求值含 $O(N_pBF_{\rm grad})$ 开销，而单纯形或区间约束下的局部替代问题还需要相应的数值计算。模块 B 的因子图消息传递具有线性复杂度。若第二阶段迭代 $N_{\rm II}$ 次、每次 SPVBI 内部平均进行 $N_{\rm SSCA}$ 次更新，总开销按这些次数与单次粒子更新成本相乘计算（原文附录 C）；因而高维粒子后验计算是关键的复杂度来源之一。

## 参考文献（保留原始英文书目信息）

以下 36 条参考文献从原始 PDF 第 14–15 页恢复（2026-10-30 复核：编号、作者、题名、出处、卷期页与年份逐条对照源文，36/36 一致；源抽取文本中的 “Y . Zeng” 一类字符间距与 “Ara ´ujo” 的分解符已按正常书写合并，页码断行处的多余空格已去掉）。保留英文论文题名和出版信息以便文献检索，不擅自翻译或补造 DOI。

[1] W. Saad, M. Bennis, and M. Chen, “A vision of 6G wireless systems: Applications, trends, technologies, and open research problems,” IEEE Network, vol. 34, no. 3, pp. 134–142, 2020.

[2] M. Cui and L. Dai, “Channel estimation for extremely large-scale MIMO: Far-field or near-field?” IEEE Trans. Commun., vol. 70, no. 4, pp. 2663–2677, Apr. 2022.

[3] H. Lu, Y. Zeng, C. You, Y. Han, J. Zhang, Z. Wang, Z. Dong, S. Jin, C.-X. Wang, T. Jiang, X. You, and R. Zhang, “A tutorial on near-field XL-MIMO communications toward 6G,” IEEE Commun. Surv. Tutor., vol. 26, no. 4, pp. 2213–2257, 2024.

[4] Y. Lu and L. Dai, “Near-field channel estimation in mixed LoS/NLoS environments for extremely large-scale MIMO systems,” IEEE Trans. Commun., vol. 71, no. 6, pp. 3694–3707, Jun. 2023.

[5] Q. Wu, S. Zhang, B. Zheng, C. You, and R. Zhang, “Intelligent reflecting surface-aided wireless communications: A tutorial,” IEEE Trans. Commun., vol. 69, no. 5, pp. 3313–3351, May 2021.

[6] C. You, Y. Cai, Y. Liu, M. Di Renzo, T. M. Duman, A. Yener, and A. Lee Swindlehurst, “Next generation advanced transceiver technologies for 6G and beyond,” IEEE J. Sel. Areas Commun., vol. 43, no. 3, pp. 582–627, Mar. 2025.

[7] Y. Wei, M.-M. Zhao, M.-J. Zhao, and Y. Cai, “Channel estimation for IRS-aided multiuser communications with reduced error propagation,” IEEE Trans. Wireless Commun., vol. 21, no. 4, pp. 2725–2741, Apr. 2022.

[8] X. Zheng, P. Wang, J. Fang, and H. Li, “Compressed channel estimation for IRS-assisted millimeter wave OFDM systems: A low-rank tensor decomposition-based approach,” IEEE Wireless Commun. Lett., vol. 11, no. 6, pp. 1258–1262, Jun. 2022.

[9] S. Yang, C. Xie, W. Lyu, B. Ning, Z. Zhang, and C. Yuen, “Near-field channel estimation for extremely large-scale reconfigurable intelligent surface (XL-RIS)-aided wideband mmWave systems,” IEEE J. Sel. Areas Commun., vol. 42, no. 6, pp. 1567–1582, Jun. 2024.

[10] J. Wu, S. Kim, and B. Shim, “Parametric sparse channel estimation for RIS-assisted terahertz systems,” IEEE Trans. Commun., vol. 71, no. 9, pp. 5503–5518, Sep. 2023.

[11] T. G. Kolda and B. W. Bader, “Tensor decompositions and applications,” SIAM Rev., vol. 51, no. 3, pp. 455–500, Aug. 2009.

[12] K. T. Selvan and R. Janaswamy, “Fraunhofer and Fresnel distances: Unified derivation for aperture antennas,” IEEE Antennas Propag. Mag., vol. 59, no. 4, pp. 12–15, Aug. 2017.

[13] Y. Pan, C. Pan, S. Jin, and J. Wang, “RIS-aided near-field localization and channel estimation for the terahertz system,” IEEE J. Sel. Top. Signal Process., vol. 17, no. 4, pp. 878–892, Jul. 2023.

[14] 3GPP, TS 38.211 V16.7.0 Release 16, Technical Specification Group Radio Access Network; NR; Physical channels and modulation, Sep. 2021.

[15] G. Zhou, C. Pan, H. Ren, P. Popovski, and A. L. Swindlehurst, “Channel estimation for RIS-aided multiuser millimeter-wave systems,” IEEE Trans. Signal Process., vol. 70, pp. 1478–1492, Mar. 2022.

[16] P. Wang, J. Fang, L. Dai, and H. Li, “Joint transceiver and large intelligent surface design for massive MIMO mmWave systems,” IEEE Trans. Wireless Commun., vol. 20, no. 2, pp. 1052–1064, Feb. 2021.

[17] N. O’Donoughue and J. M. F. Moura, “On the product of independent complex Gaussians,” IEEE Trans. Signal Process., vol. 60, no. 3, pp. 1050–1063, Mar. 2012.

[18] S. Som and P. Schniter, “Approximate message passing for recovery of sparse signals with markov-random-field support structure,” in Proc. Int. Conf. Mach. Learn. (ICML), Jul. 2011.

[19] X. Kuai, L. Chen, X. Yuan, and A. Liu, “Structured turbo compressed sensing for downlink massive MIMO-OFDM channel estimation,” IEEE Trans. Wireless Commun., vol. 18, no. 8, pp. 3813–3826, Aug. 2019.

[20] W. Xu, A. Liu, B. Zhou, and M.-J. Zhao, “Successive linear approximation VBI for joint sparse signal recovery and dynamic grid parameters estimation,” IEEE Transactions on Wireless Communications, vol. 24, no. 11, pp. 9645–9659, Nov. 2025.

[21] J. Ziniel and P. Schniter, “Dynamic compressive sensing of time-varying signals via approximate message passing,” IEEE Trans. Signal Process., vol. 61, no. 21, pp. 5270–5284, Nov. 2013.

[22] C. Zhang, D. Guo, and P. Fan, “Tracking angles of departure and arrival in a mobile millimeter wave channel,” in Proc. IEEE Int. Conf. Commun. (ICC), May 2016, pp. 1–6.

[23] A. Liu, G. Liu, L. Lian, V. K. N. Lau, and M.-J. Zhao, “Robust recovery of structured sparse signals with uncertain sensing matrix: A turbo-VBI approach,” IEEE Trans. Wireless Commun., vol. 19, no. 5, pp. 3185–3198, May 2020.

[24] J. Dai, A. Liu, and V. K. N. Lau, “FDD massive MIMO channel estimation with arbitrary 2D-array geometry,” IEEE Trans. Signal Process., vol. 66, no. 10, pp. 2584–2599, May 2018.

[25] B. Zhou, Q. Chen, H. Wymeersch, P. Xiao, and L. Zhao, “Variational inference-based positioning with nondeterministic measurement accuracies and reference location errors,” IEEE Trans. Mobile Comput., vol. 16, no. 10, pp. 2955–2969, Oct. 2017.

[26] D. C. Araújo, A. L. F. de Almeida, J. P. C. L. Da Costa, and R. T. de Sousa, “Tensor-based channel estimation for massive MIMO-OFDM systems,” IEEE Access, vol. 7, pp. 42 133–42 147, 2019.

[27] G. Parisi and R. Shankar, Statistical field theory. Westview Press, 1988.

[28] G. Tan, B. Wu, and T. Herfet, “Performance analysis of OMP-based channel estimations in mobile OFDM systems,” IEEE Trans. Wireless Commun., vol. 17, no. 5, pp. 3459–3473, May 2018.

[29] A. Liu, V. K. N. Lau, and B. Kananian, “Stochastic successive convex approximation for non-convex constrained stochastic optimization,” IEEE Trans. Signal Process., vol. 67, no. 16, pp. 4189–4203, Aug. 2019.

[30] S. Z. Li, Markov random field modeling in image analysis. Springer Science & Business Media, 2009.

[31] Z. Chen, M.-M. Zhao, M. Li, M. Lei, and M.-J. Zhao, “IRS-aided joint spatial division and multiplexing for mmWave multiuser MISO systems,” IEEE Trans. Wireless Commun., vol. 22, no. 11, pp. 7789–7804, Nov. 2023.

[32] Z.-Q. Luo, W.-K. Ma, A. M.-C. So, Y. Ye, and S. Zhang, “Semidefinite relaxation of quadratic optimization problems,” IEEE Signal Process. Mag., vol. 27, no. 3, pp. 20–34, May 2010.

[33] P. Cao, J. Thompson, and H. V. Poor, “A sequential constraint relaxation algorithm for rank-one constrained problems,” in 2017 25th European Signal Processing Conference (EUSIPCO), Aug 2017, pp. 1060–1064.

[34] A. Beck, A. Ben-Tal, and L. Tetruashvili, “A sequential parametric convex approximation method with applications to nonconvex truss topology design problems,” J. Global Optim., vol. 47, no. 1, pp. 29–51, 2010.

[35] Y. Chen and X. Ye, “Projection onto a simplex,” arXiv preprint arXiv:1101.6081, 2011.

[36] Z. Hu, A. Liu, Y. Wan, T. X. Han, and M. Zhao, “A two-stage multiband delay estimation scheme via stochastic particle-based variational bayesian inference,” IEEE Internet Things J., vol. 11, no. 11, pp. 19 632–19 645, Jun. 2024.


---

**译文状态：** 摘要、正文 I–VI、附录 A–C 与主要公式 (1)–(51)、算法 1、图 1–9、主要仿真结果已译；36 条参考文献已按 PDF 第 14–15 页恢复（2026-10-30 复核 36/36 条与源文一致）。长公式与推导仍需逐页终校，因此未通过全文 QA。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}