---
layout: page
title: "基于比特的下行 MIMO 信道估计：可恢复性与算法｜中文全文译文"
permalink: /papers/translations/2026-10-03-2411-16043-downlink-mimo-channel-estimation-from-bits-recoverability-and-algorith/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/18c3efcfd8721025/) · [原文 arXiv](https://arxiv.org/abs/2411.16043) · [全部目录](/papers/catalog/)

# 基于比特的下行 MIMO 信道估计：可恢复性与算法

**原题：** Downlink MIMO Channel Estimation from Bits: Recoverability and Algorithm  
**作者：** Rajesh Shrestha、Mingjie Shao、Mingyi Hong、Wing-Kin Ma、Xiao Fu  
**版本：** arXiv:2411.16043v2，2025-09-09，原文 18 页（正文 15 页 + 补充材料 3 页）。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VII 节、结论、致谢与资助说明、主体附录 A–C、补充材料附录 D–J、图 1–14 图注、表 I 逐格、参考文献 [1]–[61]（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

在频分双工（frequency division duplex，FDD）大规模 MIMO 系统中，一个主要挑战是如何从用户设备（user equipment，UE）发送的有限反馈中，在基站（base station，BS）端获取下行信道状态信息（channel state information，CSI）。为应对这一基础任务，本文的贡献有两方面。第一，提出一种简单的反馈框架：在 UE 端采用基于压缩与高斯抖动的量化策略，在 BS 端则建立最大似然估计器（maximum likelihood estimator，MLE）。我们在广泛使用的双方向信道模型下建立 MIMO 信道的可恢复性；具体而言，对两种压缩方案分别给出分析——表明其中一种在反馈开销上更经济，另一种在 UE 端计算更轻。第二，为实现该 MLE，提出一种交替方向乘子法（alternating direction method of multipliers，ADMM）算法。该算法经过精心设计，将精巧的谐波检索（harmonic retrieval，HR）求解器作为子程序集成其中，而该求解器正是有效处理这一困难 MLE 问题的关键。大量数值实验验证了所提方法的有效性。

**索引词：** 信道估计、压缩、量化、有限反馈、可恢复性。

## I. 引言

在频分双工（FDD）系统中，下行与上行传输工作在不同的载频上，导致信道往往不相关 [1]、[2]。此类系统中，基站（BS）端的下行 CSI 通过用户设备（UE）发送的反馈获取，参见 [2]、[3]。随着 5G 及后 5G 时代的到来，MIMO 系统的天线阵列规模显著增大，BS 与 UE 两端都可能包含数十甚至数百根天线 [3]–[5]。然而，反馈信令信道的容量往往有限。因此，如何利用有限反馈在 BS 端设计准确的下行 CSI 估计方案，已成为 FDD MIMO 系统的主要挑战 [6]–[8]。

基于矢量量化（vector quantization，VQ）码本的方案 [2]、[3] 可以说是有限反馈最著名的方法，但朴素 VQ 在大规模 MIMO 时代面临可扩展性挑战。较新的工作如 [9]、[10] 考虑了更先进的预编码矩阵指示（PMI）与信道质量指示（CQI）反馈，但类似挑战依然存在。许多工作对大信道矩阵采用低维参数化（例如使用随机模型 [11]、[12] 或几何模型 [5]、[13]、[14]），并在 UE 端估计信道的若干关键参数 [15]–[19]。这样，UE 只需反馈关键参数而非整个信道矩阵，从而大幅降低开销。特别地，[5]、[14]、[16]、[18]、[20]、[21] 采用双方向参数化：信道矩阵由 $K$ 条路径表示，参数为路径损耗、离开角（angle-of-departure，AoD）与到达角（angle-of-arrival，AoA）。这些路径损耗、AoD 与 AoA 随后通过张量分解 [15]、[19]、[22] 与压缩感知 [14]、[15]、[18]、[23] 等方法估计。这一类工作中一个显著挑战是：UE 的计算资源（如功率、内存与 CPU 能力）有限，而信道参数估计往往并非易事。作为变通，[5]、[14]、[15] 倡导由 UE 仅压缩信道信息、将 CSI 恢复的主要计算放在 BS 端的方案。[14]、[15] 提出了两种基于字典的稀疏算法，使用 AoD 与 AoA 的离散空间表示来构造字典。

后一类工作在减轻 UE 计算负担方面很有吸引力，但仍存在若干关键空白。第一，该类别中的现有方法主要在 BS 端使用基于稀疏回归的 CSI 恢复，这涉及离散化空间字典 [8]、[14]、[15]、[23]。当空间分辨率变细时，字典规模迅速增长，导致严重的可扩展性挑战。第二，对 [14]、[15] 中信道模型下基于有限反馈的下行 CSI 估计，一直缺乏理论理解：不清楚恢复 CSI 到某一精度需要多少反馈比特。而这种理解对于以可靠、可预测的方式实现这些系统至关重要。

**贡献。** 本文旨在应对上述挑战，贡献如下：

- **可恢复性有保证的比特级 CSI 获取：** 我们提出在 UE 端压缩信道矩阵，再用基于高斯抖动的量化器将信道矩阵元素转换为比特。由此，原始复值信道矩阵被缩减为规模小得多的二进制值。相应地，在 BS 端建立最大似然估计器（MLE）。我们提出两种不同的压缩方案与统一的恢复方法：第一种压缩方案使用简单的线性最小二乘操作在 UE 端获取信道矩阵，CSI 恢复的反馈开销较低；第二种在 UE 端使用更少的计算浮点运算，代价是反馈开销更高。值得注意的是，我们的方法不使用离散化空间字典，因而规避了以往工作（如 [8]、[14]、[15]、[23]）遇到的可扩展性问题。更重要的是，我们证明两种方案下下行 MIMO 信道矩阵的可恢复性都得到保证。
- **通过基于 RELAX 的子问题求解实现 ADMM 算法：** 我们提出用统一的优化策略处理两种反馈方案下所建立的 MLE 问题。在双方向信道模型下，该 MLE 由于天线阵列流形约束，成为一个困难的量化压缩矩阵恢复问题。我们发现梯度下降等标准优化策略难以获得合理解（后文将展示），可能是因为复杂的问题结构造成了不利的优化地貌。我们提出一种高效的交替方向乘子法（ADMM）算法。该方法把复杂的恢复问题“解耦”为若干可处理的子问题，从而能够分别处理量化效应与阵列流形带来的约束。特别地，它允许使用精巧的谐波检索（HR）算法（如 RELAX [24]）来高效处理子问题。

本文的初步版本发表于 Asilomar 2022 [25]。会议版本包含其中一种压缩方案与 ADMM 算法设计；期刊版本还新增了：(i) 一种新的压缩方案；(ii) 对两种方案的全面可恢复性分析；(iii) 更广泛的实验。

**记号。** 本文中 $\mathbb R$ 与 $\mathbb C$ 分别表示实数域与复数域；$x$、$\mathbf x$、$\mathbf X$ 与 $\mathcal X$ 分别表示标量、向量、矩阵与集合；$\mathbf X^*$、$\mathbf X^\top$、$\mathbf X^H$ 与 $\mathbf X^\dagger$ 分别表示矩阵 $\mathbf X$ 的复共轭、转置、Hermitian 转置与伪逆；$\Re$ 与 $\Im$ 分别返回自变量的实部与虚部；$\|\mathbf x\|_2$ 表示 $\mathbf x$ 的 $\ell_2$ 范数，$\|\mathbf X\|_2$ 表示 $\mathbf X$ 的谱范数，$\|\mathbf X\|_F$ 为 Frobenius 范数；$|\mathcal X|$ 表示集合 $\mathcal X$ 的基数；$\mathrm{Diag}$ 将向量 $\mathbf x$ 作为矩阵 $\mathbf X$ 的对角元素；$\otimes$ 与 $\odot$ 分别表示 Kronecker 积与 Khatri-Rao 积；$\mathcal{CN}(\boldsymbol\mu,\boldsymbol\Sigma)$ 与 $\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma)$ 分别表示均值为 $\boldsymbol\mu$、协方差为 $\boldsymbol\Sigma$ 的复高斯与实高斯分布。

## II. 信号模型与背景

### A. 信号模型

我们考虑如图 1 所示的 FDD MIMO 系统中的下行信道估计问题。基站有 $N$ 根发射天线，用户设备有 $M$ 根接收天线。假设从 BS 到 UE 的下行信道在信道相干时间内保持静止。在 FDD 系统中，BS 依据 UE 的反馈获取下行 CSI。具体而言，在下行训练阶段，BS 向 UE 发送导频信号，UE 端接收信号可写为

$$
\mathbf y_t=\mathbf H\mathbf s_t+\mathbf n_t,\quad t=1,\ldots,T, \tag{1}
$$

其中 $t$ 为导频序列索引，$\mathbf y_t\in\mathbb C^M$ 为 UE 端接收信号，$\mathbf s_t\in\mathbb C^N$ 为发送的导频信号，$\mathbf n_t$ 为加性复高斯噪声，即 $\mathbf n_t\sim\mathcal{CN}(\mathbf 0,\sigma_n^2\mathbf I)$，$\mathbf H\in\mathbb C^{M\times N}$ 为下行信道。导频信号 $\mathbf S:=[\mathbf s_1,\ldots,\mathbf s_T]$ 为 BS 与 UE 双方已知。假设 BS 与 UE 均配备均匀线阵（uniform linear array，ULA）。我们采用广泛使用的双方向信道模型，具体为包含 $K$ 条路径的有限散射体信道模型 [26]：

$$
\mathbf H=\sum_{k=1}^{K}\beta_k\mathbf a_r(\theta_k)\mathbf a_t(\phi_k)^H, \tag{2}
$$

其中 $\beta_k\in\mathbb C$ 为第 $k$ 条路径的信道路径损耗；$\theta_k,\phi_k\in[-\pi,\pi]$ 分别为第 $k$ 条路径的 AoA 与 AoD；$\mathbf a_r(\theta_k)$ 与 $\mathbf a_t(\phi_k)$ 为分别与 AoA $\theta_k$、AoD $\phi_k$ 相关的导向矢量，由

$$
\begin{aligned}
\mathbf a_r(\theta)&=\left[1,\ e^{-j\frac{2\pi d}{\lambda}\sin(\theta)},\ \ldots,\ e^{-j\frac{2\pi d}{\lambda}\sin(\theta)(M-1)}\right]^\top,\\
\mathbf a_t(\phi)&=\left[1,\ e^{-j\frac{2\pi d}{\lambda}\sin(\phi)},\ \ldots,\ e^{-j\frac{2\pi d}{\lambda}\sin(\phi)(N-1)}\right]^\top,
\end{aligned}\tag{3}
$$

给出，其中 $d$ 为天线间距，$\lambda$ 为载波波长。信道模型可写成矩阵形式：

$$
\mathbf H=\mathbf A_r(\boldsymbol\theta)\mathrm{Diag}(\boldsymbol\beta)\mathbf A_t(\boldsymbol\phi)^H, \tag{4}
$$

其中记号 $\boldsymbol\theta=[\theta_1,\ldots,\theta_K]^\top$，$\boldsymbol\phi=[\phi_1,\ldots,\phi_K]^\top$，$\boldsymbol\beta=[\beta_1,\ldots,\beta_K]^\top$。

在 FDD 系统中，一种朴素的反馈方案如下：UE 利用已知导频序列 $\mathbf S$ 从接收信号 $\mathbf Y:=[\mathbf y_1,\ldots,\mathbf y_T]$ 估计下行信道 $\mathbf H$；这通常可以相对轻量的计算完成，例如最小二乘。随后，UE 通过反馈信道将估计信道 $\hat{\mathbf H}$ 发送给 BS。然而，在大规模 MIMO 场景下，信道矩阵 $\mathbf H$ 维度很大。此时，设计基于有限反馈的 BS 端高精度 CSI 恢复具有很强的动机。

### B. 基于有限反馈的 CSI 估计：既有工作

对大规模 $\mathbf H$，可采用 VQ 等量化技术与基于码本的 BS 端恢复来降低反馈开销 [2]、[3]。VQ 将全部信道矩阵实现映射到若干“质心”，每个实例仅反馈质心的索引。在 VQ 之外，主要有两类方法用有限开销反馈 $\mathbf H$。第一类让 UE 从 $\hat{\mathbf H}$ 估计信道参数 $\boldsymbol\theta$、$\boldsymbol\phi$ 与 $\boldsymbol\beta$ [14]、[16]、[18]、[19]、[22]。随后 UE 仅将这些参数发送给 BS，其维度远低于 $\mathbf H$ 的维度。然而，估计这些参数往往等价于求解与多维谐波检索相关的问题，这类问题非凸且具有挑战性 [16]、[19]、[22]、[27]–[30]。因此，此类方法以 UE 端计算负担增加为代价，而这并不理想，因为 UE 端的计算资源（如功率、CPU 能力与内存）通常有限。第二类方法把计算负担转移到 BS 端，这可以说更可取，因为 BS 有资源执行计算更密集的操作。这一类工作将 $\boldsymbol\theta$ 与 $\boldsymbol\phi$ 的角度空间离散化，构造大规模角度字典，并把参数估计问题转化为压缩感知（compressive sensing，CS）问题 [14]、[15]、[18]、[23]，随后在 BS 端求解。然而，为准确估计信道参数，需要角度离散化足够密，这又会显著增加问题维度与计算/内存复杂度。

除方法设计上的困难外，另一个显著挑战在于理论理解。例如，在双方向信道模型（及其变体）下，一直不清楚需要多少比特才能把 BS 端的下行 CSI 恢复到目标精度。而建立这种理解对于构建可靠的 CSI 恢复算法至关重要。

## III. 提出的方法

本节提出 UE 端的“压缩—量化”策略与 BS 端基于 MLE 的 CSI 恢复准则。我们在此框架下发展两种方案。

### A. 方案 1：估计、压缩与量化

**1）UE 端操作。** 该方案假设 UE 首先通过相对简单的操作（如最小二乘）估计 $\mathbf H$。

实践中可取导频信号 $\mathbf S$ 行正交，即 $\mathbf S\mathbf S^H=\mathbf I$。于是式 (1) 下 $\mathbf H$ 的最小二乘估计可高效计算为

$$
\hat{\mathbf H}=\mathbf Y\mathbf S^H. \tag{5}
$$

注意与估计关键参数 $\boldsymbol\theta$、$\boldsymbol\beta$、$\boldsymbol\phi$ 相比，估计 $\mathbf H$ 相对容易 [16]、[29]。接下来，将信道矩阵表示为实值向量

$$
\hat{\mathbf h}=\mathrm{vec}(\mathbf H),\qquad
\mathbf H=\begin{bmatrix}\Re(\hat{\mathbf H})\\\Im(\hat{\mathbf H})\end{bmatrix}, \tag{6}
$$

其中 $\Re(\hat{\mathbf H})$ 与 $\Im(\hat{\mathbf H})$ 分别表示 $\hat{\mathbf H}$ 的实部与虚部。记 $\hat{\mathbf h}\in\mathbb R^J$ 为 $\hat{\mathbf H}$ 的向量化结果，$J=2MN$。（注：式 (6) 中的 $\mathbf H$ 为复信道的实值堆叠表示，与信道矩阵 $\mathbf H$ 同名，按原文记号保留。）我们用随机矩阵 $\mathbf A\in\mathbb R^{R\times J}$（$R\ll J$）压缩信道 $\hat{\mathbf h}$，其中

$$
a_{i,j}\sim\mathcal N\left(0,\frac{1}{R}\right),\quad i=1,\ldots,R,\ j=1,\ldots,J.
$$

压缩矩阵 $\mathbf A$ 为 BS 与 UE 双方已知。实践中，$\mathbf A$ 可由 BS 与 UE 通过协议约定：双方可在每次传输前使用相同的伪随机数生成器与种子生成。

压缩后的信道为

$$
\mathbf x=\mathbf A\hat{\mathbf h}. \tag{7}
$$

进一步，通过如下方式量化压缩信道 $\mathbf x$：

$$
\mathbf r=\mathcal Q(\mathbf x+\mathbf v), \tag{8}
$$

其中 $\mathcal Q$ 为输出电平集为 $\mathcal U:=\{q_1,q_2,\ldots,q_Q\}$ 的均匀量化器，即

$$
\mathcal Q(x)=q\iff x\in\left[\underline{b}[q],\overline{b}[q]\right),\quad q\in\mathcal U,
$$

其中 $\underline{b}[q]$ 与 $\overline{b}[q]$ 为与量化输出 $q$ 相关的量化边界，$\mathbf v$ 为抖动噪声，$\mathbf v\sim\mathcal N(\mathbf 0,\sigma_v^2\mathbf I)$。抖动广泛用于量化，它通过使量化误差与输入信号的相关性更弱、分布更均匀来改善恢复性能 [31]–[33]。UE 将压缩且量化后的 $\mathbf r$（而非完整信道矩阵 $\hat{\mathbf H}$）发送给 BS。显然，反馈 $\mathbf r$ 所需的通信开销远小于反馈 $\hat{\mathbf H}$。

**2）BS 端 MLE 恢复。** BS 通过指定信令信道接收压缩且量化后的 CSI $\mathbf r$。随后，BS 由 $\mathbf r$ 估计完整信道矩阵 $\mathbf H$。基于式 (5)–(8) 的压缩与量化过程，似然函数 $p(\mathbf r|\mathbf h;\mathbf A)$ 为

$$
p(\mathbf r|\mathbf h;\mathbf A)=\prod_{i=1}^{R}p(r_i|\mathbf h;\mathbf a_i),\qquad
p(r_i|\mathbf h;\mathbf a_i)=\Phi\left(\frac{\overline{b}[r_i]-\mathbf a_i^\top\mathbf h}{\sigma_v}\right)-\Phi\left(\frac{\underline{b}[r_i]-\mathbf a_i^\top\mathbf h}{\sigma_v}\right), \tag{9}
$$

其中 $\Phi(x)=\int_{-\infty}^{x}\frac{1}{\sqrt{2\pi}}e^{-t^2/2}\,dt$ 为标准高斯分布的累积分布函数。该表述源于抖动过程：它诱导出分布 $x_i\sim\mathcal N(\mathbf a_i^\top\mathbf h,\sigma_v^2)$。因此，量化值 $r_i$ 的概率等于该高斯分布在边界 $(\underline{b}[r_i],\overline{b}[r_i])$ 内的概率质量，如式 (9) 所示。

于是，$\mathbf h$ 的 MLE 可表述为

$$
\begin{aligned}
\underset{\mathbf z,\mathbf H}{\mathrm{minimize}}\quad&-\log p(\mathbf r|\mathbf h;\mathbf A)\\
\mathrm{subject\ to}\quad&\mathcal G(\mathbf z)=\mathbf H,
\end{aligned}\tag{10}
$$

其中我们把信道参数堆叠为 $\mathbf z=(\boldsymbol\theta,\boldsymbol\phi,\boldsymbol\beta)$，算子 $\mathcal G$ 表示式 (4) 中把信道参数 $\mathbf z$ 映射为信道 $\mathbf H$ 的信道模型。

### B. 方案 2：直接压缩与量化

方案 1 以串行方式执行 $\mathbf H$ 估计与反馈。用式 (5) 获取 $\mathbf H$ 需要 $T\ge N$（即导频长度不小于 $N$），而在大规模 MIMO 场景中 $N$ 可能很大。因此，UE 端的 $\mathbf H$ 估计过程不可避免地给反馈引入时延，这在快速变化的无线环境中并不理想。本小节提出在 UE 端直接压缩并量化接收信号，不先估计 $\mathbf H$ 就反馈给 BS。该方案缩短了反馈前的“准备时间”；参见 [9]、[10]、[14]。

**1）UE 端操作。** 在 UE 端，我们用下式压缩接收信号向量 $\mathbf y_t=\mathbf H\mathbf s_t+\mathbf n_t$：

$$
x_t=\mathbf a_t^\top\tilde{\mathbf y}_t, \tag{11}
$$

其中 $\tilde{\mathbf y}_t=[\Re(\mathbf y_t)^\top,\Im(\mathbf y_t)^\top]^\top\in\mathbb R^{2M}$ 为 $\mathbf y_t$ 的实值表示；$\mathbf a_t\in\mathbb R^{2M}$ 为压缩向量，假设 $\mathbf a_t\sim\mathcal N(\mathbf 0,(1/T^2)\mathbf I)$。在方案 2 中，我们选择随机导频信号 $\mathbf s_t\sim\mathcal{CN}(\mathbf 0,\mathbf I)$。随后，压缩信号 $x_t$ 被进一步量化为少量比特的标量，用于反馈：

$$
r_t=\mathcal Q(x_t+v_t), \tag{12}
$$

其中 $v_t\sim\mathcal N(0,\sigma_v^2)$。然后，UE 将 $r_t$（$t=1,\ldots,T$）发送给 BS。与方案 1 相比，方案 2 绕过 UE 端的 $\mathbf H$ 估计，直接压缩接收信号并将其发回 BS。该方法降低计算开销，并在 BS 端节省时间/能量。

**2）BS 端 MLE 恢复。** 方案 2 的压缩策略导致 BS 端的信道估计表述与 (10) 不同。注意式 (11) 中的 $\tilde{\mathbf y}_t$ 可写为

$$
\tilde{\mathbf y}_t=\tilde{\mathbf H}\tilde{\mathbf s}_t+\tilde{\mathbf n}_t,
$$

其中

$$
\tilde{\mathbf H}=\begin{bmatrix}\Re(\mathbf H)&-\Im(\mathbf H)\\\Im(\mathbf H)&\Re(\mathbf H)\end{bmatrix},\quad
\tilde{\mathbf s}_t=\begin{bmatrix}\Re(\mathbf s_t)\\\Im(\mathbf s_t)\end{bmatrix},\quad
\tilde{\mathbf n}_t=\begin{bmatrix}\Re(\mathbf n_t)\\\Im(\mathbf n_t)\end{bmatrix}. \tag{13}
$$

因此，$\mathbf x$ 可表示为

$$
\mathbf x=\begin{bmatrix}\mathbf a_1^\top\tilde{\mathbf H}\tilde{\mathbf s}_1\\\vdots\\\mathbf a_T^\top\tilde{\mathbf H}\tilde{\mathbf s}_T\end{bmatrix}
+\begin{bmatrix}\mathbf a_1^\top\tilde{\mathbf n}_1\\\vdots\\\mathbf a_T^\top\tilde{\mathbf n}_T\end{bmatrix}
=\mathbf D\check{\mathbf h}+\check{\mathbf n}, \tag{14}
$$

其中

$$
\mathbf D=\begin{bmatrix}\tilde{\mathbf s}_1^\top\otimes\mathbf a_1^\top\\\vdots\\\tilde{\mathbf s}_T^\top\otimes\mathbf a_T^\top\end{bmatrix},\qquad
\check{\mathbf h}=\mathrm{vec}(\tilde{\mathbf H}),\qquad
\check{\mathbf n}=\begin{bmatrix}\mathbf a_1^\top\tilde{\mathbf n}_1\\\vdots\\\mathbf a_T^\top\tilde{\mathbf n}_T\end{bmatrix},
$$

并利用了 $\mathbf a_i^\top\tilde{\mathbf H}\tilde{\mathbf s}_i=(\tilde{\mathbf s}_i^\top\otimes\mathbf a_i^\top)\mathrm{vec}(\tilde{\mathbf H})$ [34]。于是反馈信号模型可重写为

$$
\mathbf r=\mathcal Q(\mathbf D\check{\mathbf h}+\check{\mathbf v}),
$$

其中 $\check{\mathbf v}=\check{\mathbf n}+\mathbf v$，易证在 $\mathbf A$ 于 BS 端先验已知时 $\check{\mathbf v}\sim\mathcal N(\mathbf 0,\mathrm{Diag}(\check{\boldsymbol\sigma}_v^2))$，且 $[\check{\sigma}_v^2]_i=\sigma_n^2\sum_{j=1}^{M}a_{i,j}^2+\sigma_v^2$。与方案 1 类似，BS 通过如下 ML 估计问题估计 $\check{\mathbf h}$：

$$
\begin{aligned}
\underset{\mathbf z,\mathbf H}{\mathrm{minimize}}\quad&-\log p(\mathbf r|\check{\mathbf h};\mathbf D)\\
\mathrm{subject\ to}\quad&\mathcal G(\mathbf z)=\mathbf H,
\end{aligned}\tag{15}
$$

其中似然函数为

$$
p(\mathbf r|\check{\mathbf h};\mathbf D)=\prod_{i=1}^{T}p(r_i|\check{\mathbf h};\mathbf d_i),\qquad
p(r_i|\check{\mathbf h};\mathbf d_i)=\Phi\left(\frac{\overline{b}[r_i]-\mathbf d_i^\top\check{\mathbf h}}{\check{\sigma}_v}\right)-\Phi\left(\frac{\underline{b}[r_i]-\mathbf d_i^\top\check{\mathbf h}}{\check{\sigma}_v}\right),
$$

且映射 $\mathcal G$ 仍表示从信道参数 $\mathbf z$ 到信道 $\mathbf H$ 的生成过程；$\mathbf H$ 与 $\check{\mathbf h}$ 的对应关系由式 (13) 与 (14) 给出。可见问题 (15) 与 (10) 形式相同。

**注 1。** 一般而言，方案 1 在 UE 端执行更多操作，因为涉及 $\mathbf H$ 估计、压缩与量化，共需 $\mathcal O(MNT+MNR)$ 次浮点运算。方案 2 不先提取 $\mathbf H$，直接压缩接收信号，仅需 $\mathcal O(MT)$ 次浮点运算，从而在 UE 端节省时间。由于 $N$ 可能（远）大于 $M$，方案 2 在 UE 端的浮点运算削减相对方案 1 可能相当可观，这种削减对节省时间与能量很有用。然而，正如下一节将看到的，方案 2 在效率上获益，却在样本复杂度上有所损失——即方案 2 需要略多的反馈比特才能达到方案 1 相同的 CSI 恢复精度。

## IV. 可恢复性分析

本节分析所提信道反馈方案的可恢复性。

### A. 预备知识

在信道模型 (2) 中，可以合理假设信道路径损耗 $\beta_k$ 有界。记 $\beta_k$ 的最大幅度为 $\kappa$，即对全部 $k=1,\ldots,K$ 有 $|\beta_k|\le\kappa$。于是 $\mathbf z$ 的参数空间（记作 $\mathcal Z$）可描述为

$$
\mathcal Z=\mathcal Z_\theta\times\mathcal Z_\phi\times\mathcal Z_\beta,\qquad
\mathcal Z_\theta=[-\pi,\pi]^K,\quad\mathcal Z_\phi=[-\pi,\pi]^K,\quad\mathcal Z_\beta=\{\boldsymbol\beta\mid\|\boldsymbol\beta\|_\infty\le\kappa\}, \tag{16}
$$

其中 $\mathcal Z_\theta$、$\mathcal Z_\phi$ 与 $\mathcal Z_\beta$ 分别表示 $\boldsymbol\theta$、$\boldsymbol\phi$ 与 $\boldsymbol\beta$ 的参数空间。可见集合 $\mathcal Z$ 是紧集。此外，由 $\mathbf H=\mathcal G(\mathbf z)$（$\mathbf z\in\mathcal Z$）生成的 $\mathbf h$ 与 $\check{\mathbf h}$ 的参数空间分别记作

$$
\Gamma:=\{\mathbf h\mid\mathbf h=g(\mathcal G(\mathbf z)),\ \mathbf z\in\mathcal Z\} \tag{17}
$$

$$
\check{\Gamma}:=\{\check{\mathbf h}\mid\check{\mathbf h}=\check{g}(\mathcal G(\mathbf z)),\ \mathbf z\in\mathcal Z\} \tag{18}
$$

其中 $g$ 与 $\check{g}$ 分别表示从 $\mathbf H$ 到 $\mathbf h$（即式 (6)）与从 $\mathbf H$ 到 $\check{\mathbf h}$（即式 (13) 再经式 (14)）的映射操作。我们的分析将利用上述集合的覆盖数，其定义如下：

**定义 1（覆盖数 [35]）。** 令 $\mathcal X\subset\mathbb R^d$ 为向量集合。若对任意 $\mathbf x\in\mathcal X$ 都存在 $\mathbf x'\in\bar{\mathcal X}$ 使 $\|\mathbf x-\mathbf x'\|_2\le\epsilon$，则称集合 $\bar{\mathcal X}$ 为 $\mathcal X$ 关于欧氏距离的 $\epsilon$-网。所有可能的 $\epsilon$-网中最小的基数称为 $\mathcal X$ 的覆盖数，记作 $\mathcal C(\mathcal X,\epsilon)$。

此外，有如下引理：

**事实 1。** 存在有限的 $L_G<\infty$ 使得

$$
\|\mathcal G(\mathbf z)-\mathcal G(\mathbf z')\|_F\le L_G\|\mathbf z-\mathbf z'\|_2; \tag{19}
$$

即函数 $\mathcal G$ 是 Lipschitz 连续的。

注意 $L_G<\infty$ 之所以存在，是因为在连续输入 $\mathbf z$ 下阵列流形与双方向信道模型不会产生剧烈变化；参见本文补充材料的附录 E。

不难证明如下事实：

**事实 2。** 集合 $\mathcal Z$ 与 $\Gamma$ 的覆盖数上界为

$$
\mathcal C(\mathcal Z,\epsilon)\le\left(\frac{8\pi\kappa}{\epsilon^2}\right)^{2K},\qquad
\mathcal C(\Gamma,\epsilon)\le\left(\frac{8\pi\kappa L_G^2}{\epsilon^2}\right)^{2K}.
$$

证明见附录 B。

**事实 3。** 假设信道路径损耗满足 $|\beta_k|\le\kappa$（$k=1,\ldots,K$），其中 $\kappa>0$。则 $\|\mathbf H\|_F\le K\sqrt{MN}\kappa$。

**证明：** 有

$$
\|\mathbf H\|_F=\|\mathbf A_r(\boldsymbol\theta)\mathrm{Diag}(\boldsymbol\beta)\mathbf A_t(\boldsymbol\phi)^H\|_F
\le\sum_{k=1}^{K}|\beta_k|\left\|\mathbf a_r(\theta_k)\mathbf a_t(\phi_k)^H\right\|_F
=\sum_{k=1}^{K}|\beta_k|\sqrt{MN}
\le K\sqrt{MN}\|\boldsymbol\beta\|_\infty,
$$

其中第一个不等式利用范数的基本性质（三角不等式与齐次性）。■

我们的分析需要刻画似然函数。考虑式 (8)–(9) 的模型，记

$$
f_r(x)=\Phi\left(\frac{\overline{b}[r]-x}{\sigma_v}\right)-\Phi\left(\frac{\underline{b}[r]-x}{\sigma_v}\right). \tag{20}
$$

注意当 $x$ 有界时（严格来说，由于 $x$ 服从高斯分布，它没有确定的有界支撑，但可假设其实现在至少 $1-\vartheta$ 的概率下有界，$\vartheta\ge0$），负对数似然函数满足

$$
\sup_{x}\max_{r\in\mathcal U}-\log f_r(x)\le U_f \tag{21}
$$

其中 $U_f>0$ 为某常数，且以至少 $1-\vartheta$ 的概率成立。此外，由于 $f_r(x)$ 的梯度连续，由极值定理，以概率 $1-\vartheta$ 有

$$
\sup_{x}\max_{r\in\mathcal U}\left|\frac{f_r'(x)}{f_r(x)}\right|\le L_f \tag{22}
$$

其中 $L_f>0$ 为某常数；$L_f$ 较小意味着函数 $f_r(x)$ 变化不太剧烈。类似地，有

$$
\inf_{x}\max_{r\in\mathcal U}\frac{\left(f_r'(x)\right)^2}{f_r(x)}\ge F_f \tag{23}
$$

其中 $F_f>0$ 为某常数，以概率 $1-\vartheta$ 成立。常数 $F_f$ 有正的下界，意味着函数 $f_r(x)$ 变化不会过慢。

本节剩余部分为清晰起见将 $\mathbf H^\natural$ 记为真值信道矩阵。我们作如下假设。

**假设 1。** 存在常数 $\nu\in[0,+\infty)$ 使

$$
\min_{\mathbf z\in\mathcal Z}\left\|\mathcal G(\mathbf z)-\mathbf H^\natural\right\|_F\le\nu. \tag{24}
$$

同时，记上述问题的最优解为 $\dot{\mathbf z}\in\arg\min_{\mathbf z\in\mathcal Z}\|\mathcal G(\mathbf z)-\mathbf H^\natural\|_F$。该假设考虑了可能的建模误差影响。

### B. 方案 1 的可恢复性分析

令 $\mathbf h^\natural$、$\mathbf h^\star$ 与 $\dot{\mathbf h}$ 分别为真值信道、(10) 中 MLE 的最优解，以及 $\Gamma$ 中距真值最近的点。利用这些记号，我们有：

**定理 1。** 假设 $\mathbf A\in\mathbb R^{R\times J}$ 的元素满足对全部 $i,j$ 有 $a_{i,j}\sim\mathcal N(0,1/R)$，且对全部 $i\in[R]$，$x_i$ 以至少 $1-\vartheta$ 的概率有界（$\vartheta\ge0$）。此外假设

$$
R=\Omega\left(K\log\left(\sqrt{\kappa}L_GK\right)\right). \tag{25}
$$

则有

$$
\frac{\left\|\mathbf h^\natural-\mathbf h^\star\right\|_2^2}{MN}
\le\frac{64}{\sqrt{R}}\left(\frac{4L_f}{F_f}\left(\tau+\frac{3}{4}\nu\right)+\frac{9U_f}{F_f}\sqrt{2\log(2/\eta)}\right)+\frac{32\psi^2}{R}
$$

以至少 $1-3\eta-\vartheta-e^{-\Omega(R)}$ 的概率成立，其中 $\tau=4\left(2+\sqrt{J/R}\right)+12\sqrt{4K\log\left(2\sqrt{2\pi}\kappa L_G\right)}$，$\psi=1/K+\nu/2+2\sqrt{2}+\sqrt{2J/R}$。

定理 1 的证明见附录 C。定理 1 表明，需要 $R=\Omega(K\log K)$ 个量化测量，才能保证估计信道 $\mathbf h^\star$ 的均方误差（mean squared error，MSE）达到 $\mathcal O(1/\sqrt{R})$ 量级。注意该结果随固有传播路径数 $K$ 标度，而不随发射与接收维度 $M$、$N$ 标度。

**注 2。** 关于抖动电平 $\sigma$ 与量化电平的若干说明如下。较大的 $\sigma$ 可能淹没原始信号并导致恢复性能退化；另一方面，过小的 $\sigma_v$ 不产生任何抖动效果。定理 1 印证了这一洞见：它表明较大的 $L_f$ 会使 MSE 变差——注意较大的 $L_f$ 由较小的 $\sigma_v$ 造成。我们通过考察定理 1 中的比值 $U_f/F_f$ 与 $L_f/F_f$ 进一步验证这一直觉。图 2 展示不同抖动电平下的这些比值：比值先减小后增大，这也意味着抖动噪声既不应过小也不应过大。

### C. 方案 2 的可恢复性分析

方案 2 的可恢复性分析更具挑战，因为矩阵 $\mathbf D$ 具有更特殊的结构，其性质不能立即看清楚。尽管如此，经过细致推导，我们也能证明方案 2 同样具备对 $\mathbf H^\natural$ 的可恢复性：

**定理 2。** 假设 $\mathbf D$ 尺寸为 $T\times J$，其中 $J=4MN$，$\mathbf D=\frac{1}{T}\left(\mathbf S^\top\odot\mathbf A^\top\right)^\top$，对全部 $i\in[T]$，$x_i$ 以至少 $1-\vartheta$ 的概率有界（$\vartheta\ge0$），且 $\mathbf S$ 与 $\mathbf A$ 的元素独立地取自标准正态分布。假设有

$$
T=\Omega\left(K^2\left(\log\left(\sqrt{\kappa}L_GK\right)\right)^2\right). \tag{26}
$$

则有

$$
\frac{\left\|\mathbf h^\natural-\mathbf h^\star\right\|_2^2}{MN}
\le\frac{64}{\sqrt{T}}\left(\frac{4L_f}{F_f}\left(\tau+\frac{3}{4}\nu\right)+\frac{9U_f}{F_f}\sqrt{2\log(2/\eta)}\right)+\frac{32\psi^2}{T}
$$

以至少 $1-3\eta-\vartheta-e^{-\Omega(\sqrt{T})}$ 的概率成立，其中 $\tau=4\left(2+\sqrt{J/T}\right)+12\sqrt{4K\log\left(2\sqrt{2\pi}\kappa L_G\right)}$，$\psi=1/K+\nu/2+2\sqrt{2}+\sqrt{2J/T}$。

定理 2 的证明见本文补充材料的附录 F。

**注 3。** 与方案 1（参见定理 1）相比，方案 2 提供的保证更弱。更具体地，给定 $T=R=G$，两种方案具有相同的恢复 MSE 上界；然而比较 (25) 与 (26) 可见，该上界对方案 2 成立所允许的路径数少于方案 1（即 $K=\mathcal O(\sqrt{G})$ 对 $K=\mathcal O(G)$）。此外，两种方案的恢复概率分别为 $1-3\eta-2\exp(-\Omega(G))$ 与 $1-3\eta-2\exp(-\Omega(\sqrt{G}))$。结合注 1 可见，方案 1 总体上有更强的可恢复性保证，而方案 2 在 UE 端使用更少的计算资源。

**注 4。** 尽管其重要性，从量化压缩测量中恢复阵列流形结构矩阵的可恢复性此前尚未建立。该主题与量化测量下的低秩矩阵/张量补全相关（参见例如 [33]、[36]–[38]）。[33]、[39]、[40] 在神经网络与多线性结构表示的非线性流形上建立了可恢复性，与本文设置密切相关。然而，补全设置中使用的一些关键分析工具（如 Hoeffding 不等式）无法应用于本文的高斯压缩情形；后者仅在针对稀疏信号的量化压缩感知中被研究 [41]–[44]。但那些证明基于 $\ell_1$ 最小化，因此不适合分析具有阵列流形结构、非稀疏的复信号。我们的分析建立在为双方向信道结构定制的集合限制特征值条件（set-restricted eigenvalue condition，S-REC）[45] 之上，并建立高斯抖动诱导的 MLE 与 Kullback-Leibler（KL）散度之间的联系（参见 [33]、[38]）。这一新的证明流程也为在高斯压缩下建立其他复杂结构约束问题的保证提供了可行路径。

## V. 提出的信道估计算法

本节给出求解 (10) 与 (15) 的算法。我们基于 (10) 描述算法，并简要说明后者可由同一算法处理。一个自然的想法是用梯度下降（gradient descent，GD）算法处理 (10)，因为可把约束“吸收”进目标，得到 (27) 所示的可微形式：

$$
\min_{\mathbf z}\ -\log p(\mathbf r|\mathcal G(\mathbf z)) \tag{27}
$$

然而梯度下降表现不佳（见图 3）——可能是因为 Vandermonde 流形造成的地貌有过多局部极小。本文提出一种 ADMM 算法 [46] 处理问题 (10)，它利用精巧的谐波检索（HR）求解器处理阵列流形。

首先，与问题 (10) 相关的增广拉格朗日函数为

$$
\mathcal L(\mathbf z,\mathbf H,\boldsymbol\Lambda)=-\log p(\mathbf r|\mathbf h)+\left\langle\boldsymbol\Lambda,\mathcal G(\mathbf z)-\mathbf H\right\rangle+\frac{\rho}{2}\left\|\mathcal G(\mathbf z)-\mathbf H\right\|_F^2, \tag{28}
$$

其中 $\boldsymbol\Lambda$ 为拉格朗日对偶变量，$\rho>0$ 为超参数。每次迭代中，ADMM 算法执行如下操作：

**用于求解 (10) 的 ADMM：**

$$
\mathbf z^\ell=\arg\min_{\mathbf z}\left\|\mathcal G(\mathbf z)-\left(\mathbf H^{\ell-1}-\frac{\boldsymbol\Lambda^{\ell-1}}{\rho}\right)\right\|_F^2, \tag{29a}
$$

$$
\mathbf H^\ell=\arg\min_{\mathbf H}\ -\log p(\mathbf r|\mathbf h)+\frac{\rho}{2}\left\|\mathbf H-\mathcal G\left(\mathbf z^\ell\right)-\frac{\boldsymbol\Lambda^{\ell-1}}{\rho}\right\|_F^2, \tag{29b}
$$

$$
\boldsymbol\Lambda^\ell=\boldsymbol\Lambda^{\ell-1}+\rho\left(\mathcal G\left(\mathbf z^\ell\right)-\mathbf H^\ell\right), \tag{29c}
$$

其中 $\ell$ 表示迭代次数。如前所述，MLE 问题 (10) 之所以具有挑战性，是因为流形结构（由 $\mathcal G(\mathbf z)$ 表示）。在 ADMM 更新规则下，从 $\mathcal G(\mathbf z)$ 估计 $\mathbf z$ 只出现在子问题 (29a) 中，具有相对“干净”的基于最小二乘的去噪形式。下面分别描述如何求解子问题 (29a) 与 (29b)。

### A. 用于子问题 (29a) 的改进 RELAX

若把 $(\mathbf H^{\ell-1}-\boldsymbol\Lambda^{\ell-1}/\rho)$ 视为含噪的多维谐波信号 [27]、[30]，则子问题 (29a) 可看作一个 HR 问题。这是因为与 HR 类似，式 (29a) 同样旨在从含噪二维信号 $(\mathbf H^{\ell-1}-\boldsymbol\Lambda^{\ell-1}/\rho)$ 中恢复频率分量 $(\boldsymbol\theta,\boldsymbol\phi)$ 与幅度 $\boldsymbol\beta$。含噪多维 HR 是一个具有挑战性的非凸优化问题；然而作为阵列处理中的经典任务，已有许多精巧的 HR 算法。我们提出用著名的 RELAX 方法 [24] 处理 (29a)。注意原始 RELAX 算法本质上对空间域（即 $[-\pi,\pi]$）离散化，并在离散空间网格上估计 $\theta_i$ 与 $\phi_i$，这在 CSI 恢复中并不理想。因此，我们还对 RELAX 迭代提出一个简单的修正步骤作为补救。

为说明改进后的 RELAX 算法，注意 (29a) 中的子问题可写为

$$
\mathbf z=\arg\min_{(\boldsymbol\beta,\boldsymbol\phi,\boldsymbol\theta)}\left\|\boldsymbol\zeta-\sum_{k=1}^{K}\mathbf a_t^*(\phi_k)\otimes\mathbf a_r(\theta_k)\beta_k\right\|_2^2, \tag{30}
$$

其中 $\boldsymbol\zeta=\mathrm{vec}(\mathbf H-\boldsymbol\Lambda/\rho)$。RELAX 算法的层次包含两层：外层估计 $\{\beta_i,\phi_i,\theta_i\}_{i=1}^{\eta}$，并令 $\eta$ 从 1 逐步增至 $K$；在每步 $\eta$ 内，内层循环用块坐标下降（block coordinate descent，BCD）联合估计 $(\beta_1,\phi_1,\theta_1),\ldots,(\beta_\eta,\phi_\eta,\theta_\eta)$。这样，RELAX 逐步找出最主要的谐波，数值上被发现对收敛到较差局部极小具有鲁棒性。更具体地，外层迭代 $\eta$（$\eta\in\{1,\ldots,K\}$）处理如下问题：

$$
\min_{\{\beta_i,\phi_i,\theta_i\}_{i=1}^{\eta}}\left\|\boldsymbol\zeta-\sum_{i=1}^{\eta}\mathbf a_t^*(\phi_i)\otimes\mathbf a_r(\theta_i)\beta_i\right\|_2^2. \tag{31}
$$

内层迭代以交替优化方式更新 $i\in\{1,\ldots,\eta\}$ 的 $(\beta_i,\phi_i,\theta_i)$，即求解

$$
(\beta_i,\phi_i,\theta_i)=\arg\min_{(\beta_i,\phi_i,\theta_i)}\left\|\boldsymbol\zeta_i-\mathbf a_t^*(\phi_i)\otimes\mathbf a_r(\theta_i)\beta_i\right\|_2^2, \tag{32}
$$

其中 $\boldsymbol\zeta_i=\boldsymbol\zeta-\sum_{j=1,j\ne i}^{\eta}\mathbf a_t^*(\phi_j)\otimes\mathbf a_r(\theta_j)\beta_j$。问题 (32) 等价于如下问题：

$$
(\phi_i,\theta_i)=\arg\max_{\phi_i,\theta_i}\left|\mathbf a_r(\theta_i)^H\mathrm{mat}(\boldsymbol\zeta_i)\mathbf a_t(\phi_i))\right|^2, \tag{33}
$$

其中 $\beta_i=(\mathbf a_t^*(\phi_i)\otimes\mathbf a_r(\theta_i))^H\boldsymbol\zeta_i/MN$，矩阵化函数“$\mathrm{mat}(\cdot)$”是“$\mathrm{vec}(\cdot)$”的逆操作。原始 RELAX 算法用二维 FFT 近似求解 (33)。RELAX 被广泛认为是处理二维 HR 的有效方法 [27]；然而其二维 FFT 步骤在离散化阵列流形上工作，意味着 RELAX 的精度受离散化分辨率（即所用 DFT 矩阵大小）限制。为把 RELAX 找到的解拉回连续空间，我们进一步通过梯度上升求解 (33) 来精化解：

$$
(\phi_i,\theta_i)\leftarrow(\phi_i,\theta_i)+\alpha\nabla f_{i,\eta}^{\mathrm{HR}}(\phi_i,\theta_i) \tag{34}
$$

其中 $f_{i,\eta}^{\mathrm{HR}}(\phi_i,\theta_i)=|\mathbf a_r(\theta_i)^H\mathrm{mat}(\boldsymbol\zeta_i)\mathbf a_t(\phi_i)|^2$。式 (34) 中的梯度更新紧接在求解 (33) 的二维 FFT 步骤之后执行。改进后的 RELAX（Mod-RELAX）算法总结于附录 A。

### B. 用于子问题 (29b) 的 EM 算法

许多算法可以处理子问题 (29b)，例如在量化压缩感知背景下提出的近端梯度算法 [47]。我们提出采用期望最大化（expectation-maximization，EM）方法，它在处理类似 (29b) 的目标函数时具有经验上的成功 [48]、[49]。EM 算法基于对如下变分上界的优化：

$$
-\log\left[\Phi\left(\frac{\overline{b}[r_i]-\mathbf a_i^\top\mathbf h_j}{\sigma_v}\right)-\Phi\left(\frac{\underline{b}[r_i]-\mathbf a_i^\top\mathbf h_j}{\sigma_v}\right)\right]
\le\frac{1}{2\sigma_v^2}\left|g_i-\mathbf a_i^\top\mathbf h\right|^2+c,
$$

其中

$$
g_i=\mathbf a_i^\top\mathbf h_j-\sigma_v\frac{\phi\left(\frac{\overline{b}[r_i]-\mathbf a_i^\top\bar{\mathbf h}_j}{\sigma_v}\right)-\phi\left(\frac{\underline{b}[r_i]-\mathbf a_i^\top\bar{\mathbf h}_j}{\sigma_v}\right)}{\Phi\left(\frac{\overline{b}[r_i]-\mathbf a_i^\top\bar{\mathbf h}_j}{\sigma_v}\right)-\Phi\left(\frac{\underline{b}[r_i]-\mathbf a_i^\top\bar{\mathbf h}_j}{\sigma_v}\right)} \tag{35}
$$

对任意 $\bar{\mathbf h}$ 成立，$c$ 为与 $\mathbf h$ 无关的常数，且当 $\bar{\mathbf h}=\mathbf h$ 时取等号。

EM 算法包含两步：更新上界，然后关于该上界做最大化。

$$
g_i^j=\mathbf a_i^\top\mathbf h_j-\sigma_v\frac{\phi\left(\frac{\overline{b}[r_i]-\mathbf a_i^\top\mathbf h_j}{\sigma_v}\right)-\phi\left(\frac{\underline{b}[r_i]-\mathbf a_i^\top\mathbf h_j}{\sigma_v}\right)}{\Phi\left(\frac{\overline{b}[r_i]-\mathbf a_i^\top\mathbf h_j}{\sigma_v}\right)-\Phi\left(\frac{\underline{b}[r_i]-\mathbf a_i^\top\mathbf h_j}{\sigma_v}\right)},\quad\forall i\in[R], \tag{36}
$$

$$
\begin{aligned}
\mathbf h^{j+1}&=\arg\min_{\mathbf h}\ \frac{1}{2\sigma_v^2}\left\|\mathbf A\mathbf h-\mathbf g^j\right\|_2^2+\frac{\rho}{2}\left\|\mathbf h-\mathbf u^\ell\right\|_2^2\\
&=\left(\frac{1}{2\sigma_v^2}\mathbf A^T\mathbf A+\frac{\rho}{2}\mathbf I\right)^{-1}\left(\frac{1}{\sigma_v^2}\mathbf A^T\mathbf g^j+\rho\mathbf u^\ell\right),
\end{aligned}\tag{37}
$$

其中 $j$ 表示 EM 算法的迭代索引，(36) 与 (37) 分别为 E 步与 M 步，且

$$
\mathbf u^\ell=\mathrm{vec}\left(\mathcal G\left(\mathbf z^\ell\right)+\frac{\boldsymbol\Lambda^{\ell-1}}{\rho}\right). \tag{38}
$$

可见 E 步与 M 步都有闭式解；此外 M 步中更新 $\mathbf h$ 所需的矩阵逆可预先计算，无需在每次 EM 迭代中计算。因此 (36)–(37) 中 EM 算法的逐迭代复杂度保持在较低水平。

综上，我们的 ADMM 算法 (29) 中的 $\mathbf z$ 更新与 $\mathbf H$ 更新分别由 Mod-RELAX 与 EM 完成。(29) 中的算法用于求解问题 (10)，即方案 1 下的 MLE。要把 ADMM 算法用于求解方案 2 下的问题 (15)，只需把 (15) 中的 $\mathbf r$、$\mathbf A$、$\mathbf h$ 与 $\sigma_v$ 分别替换为 $\mathbf r$、$\mathbf D$、$\check{\mathbf h}$ 与 $\check{\sigma}$；同时注意 $\mathbf h$ 与 $\mathbf H$ 之间的对应关系需替换为 $\check{\mathbf h}$ 与 $\mathbf H$ 之间的对应关系。我们称 (29) 中的算法为 **RELAX and EM-assisted alternating direction method of multipliers（REDEEM）**。图 3 展示了 REDEEM 算法与直接把梯度下降（GD）用于问题 (10) 的收敛特性之间的鲜明对比。我们还在附录 D 给出 REDEEM 的详细逐迭代复杂度分析。

## VI. 数值结果

本节首先给出基于信号模型 (2) 的基本仿真，然后在 DeepMIMO 工具箱 [50] 生成的更具挑战性的场景中测试各方法。

### A. 基本仿真

**1）数据生成。** 仿真中假设 BS 与用户均配备 ULA，天线间距 $d=\lambda/2$。信道依据式 (4) 的双方向信道模型生成。AoD 与 AoA 角 $\{\phi_i\}_i$、$\{\theta_i\}_i$ 从 $(-\frac{\pi}{2},\frac{\pi}{2})$ 上的均匀分布随机采样。每条复路径损耗 $\beta_i$ 的幅度 $|\beta_i|$ 与相位 $\angle\beta_i$ 分别从 $(0.5,1)$ 与 $(0,2\pi)$ 均匀采样。量化器采用均匀量化区间。实验中把 1000 个数据样本（视作历史 CSI 样本）的最小值与最大值作为量化边界的最小值与最大值。抖动噪声电平 $\sigma_v$（与 $\check{\sigma}_v$）设为最大信号幅度的 25%。结果在 1000 次试验上平均，每次试验随机生成数据。除非另有说明，第 VI-A 节全部实验均采用上述设置。

**2）性能指标。** 沿用文献 [14]、[51]–[53]，我们用平均归一化均方误差（normalized mean squared error，NMSE）与平均波束成形增益（beamforming gain，BGain）衡量各算法的 CSI 重建性能。给定真值信道矩阵 $\mathbf H^\natural$ 与估计 $\hat{\mathbf H}$，NMSE 与 BGain 定义为

$$
\mathrm{NMSE}=\mathbb E\left[\frac{\left\|\mathbf H^\natural-\hat{\mathbf H}\right\|_F^2}{\left\|\mathbf H^\natural\right\|_F^2}\right], \tag{39}
$$

$$
\mathrm{BGain}=\mathbb E\left[\mathrm{tr}\left(\hat{\mathbf H}^H\mathbf H\right)^2/\left\|\hat{\mathbf H}\right\|_F^2\right]. \tag{40}
$$

**3）基线方法。** 我们把所提方法与一组多样化的基线方法比较。首先考虑使用有限反馈、把信道估计的大部分计算负担转交给 BS 端的方案，包括基于稀疏回归的 MLE（SparseMLE）[14] 与 EMMP [52]。注意原始 SparseMLE 方法使用其自身的压缩策略（其中压缩矩阵本质上是 $\mathbf S^\top$ 与高斯压缩矩阵的 Kronecker 积）。我们还实现了采用方案 1“先估计再压缩”策略的 SparseMLE 版本，称之为 SparseMLE（方案 1）。对所有基准方法应用相同的抖动技术与噪声电平。其次，作为参照，我们还给出在 UE 端执行大量计算以从 $\mathbf H$ 估计关键参数的方法的结果，包括 OMP-SQ [14] 与在 UE 端对 $\mathbf H$ 执行 HR 的 UE-HR；实验中 UE-HR 采用 RELAX [24] 做 HR。这些结果用于洞察基于全精度测量的估计与依赖量化测量的估计之间的差距。

**4）算法设置。** 对需要在 UE 端做信道估计的方法，我们使用正交可变扩频因子（orthogonal variable spreading factor，OVSF）码作为导频信号，包括所提 REDEEM（方案 1）、SparseMLE（方案 1）、EMMP 与 UE-HR；对其他方法使用高斯随机导频。这些方案的导频序列长度设为 $4N$。除另有说明，所有方法的接收导频信号 SNR 设为 25 dB。实现我们的 ADMM 算法时，全部实验中步长 $\rho$ 设为 1，全部优化变量初始化为 0。对 $\mathbf z$ 子问题，Mod-RELAX 的内层循环（见算法 1 第 5–9 行）在 60 次 BCD 迭代后停止，或当 $(\beta_j,\phi_j,\theta_j)_{j=1}^{\eta}$ 的相对变化小于 $10^{-3}$ 时停止。子问题求解器 Mod-RELAX 中的 GA 步最多运行 20 次迭代。对 ADMM 框架中的 $\mathbf H$ 子问题，EM 方法的最大迭代次数设为 60。

**5）结果。** 图 4 与图 5 分别展示不同反馈比特数下的 NMSE 与 BGain 性能。图 4(a) 与 (b) 分别给出 $Q=2$ 比特与 $Q=3$ 比特下的 NMSE 结果。可以看到，所提两种方案都取得有前景的信道估计精度。特别地，图 4(a) 显示当使用 500 比特时，方案 1 与方案 2 的 NMSE 分别约为 $2\times10^{-2}$ 与 $4\times10^{-2}$，而基线方法的 NMSE 均大于 $10^{-1}$。图 5(b) 显示当 $Q=3$、用 500 比特反馈时，我们的方法能达到大于 430 的 BGain，而其他方法约在 360 以下。注意若以全精度反馈整个 $\mathbf H$（即用一个实数用 32 比特表示），将需要 32,768 比特；使用 500 比特仅占该开销的 1.5%。

图 6 展示 900 比特反馈预算下 NMSE 随 $Q$ 的变化。注意两种方案在 $Q$ 从 2 增至 4 时精度持续提高，并在 4 比特量化时达到最佳性能。这是因为增大 $Q$ 带来更细的量化区间；然而当 $Q>5$ 时，给量化器分配更多比特会使可用于反馈的测量数（方案 1 的 $R$ 与方案 2 的 $T$）过少，反而损害总体性能。这为系统设计者提供了一个需要权衡的有趣折中。

图 7 展示不同反馈维度（分别为方案 1 的 $R$ 与方案 2 的 $T$）下的 NMSE 性能。可以看到，随着量化电平提高，所有方法的性能都改善。特别地，在 2–3 比特下，所提方案即可取得有前景的估计精度，并且明显优于其他方法。有趣的是，同样是 600 个反馈比特，3 比特量化且压缩维度 $R=200$ 的情形优于 2 比特量化且压缩维度 $R=300$ 的情形，说明在恢复算法中量化精度可能起更重要的作用。

图 8(a) 与 (b) 把所提方案与在 UE 端估计信道参数的基线（即 OMP-SQ 与 UE-HR）比较。前者给出 NMSE 性能，后者给出“准备时间（preparation time，PT）”性能，即 UE 在发送反馈比特前所需的处理时间。准备时间反映 UE 操作的复杂度，例如式 (7) 的高斯压缩、式 (8) 的抖动量化，或我们的方案 2 中式 (11) 的秩一投影。对在 UE 端估计 $(\boldsymbol\theta,\boldsymbol\beta,\boldsymbol\phi)$ 的方法，准备时间还包括执行信道估计算法（如最小二乘）的时间。一般而言，由于无线信道的快速变化特性，人们不希望在 UE 端花费较长准备时间。可以看到，OMP-SQ 与 UE-HR 都取得较好的 NMSE 性能；然而它们以 UE 端计算负担与准备时间急剧增加为代价换取低 NMSE。另一方面，所提方法在 UE 端仅需轻量处理——当 $Q\times R=600$ 时，我们的方案 1 与方案 2 只需 UE-HR 准备时间的 0.0419% 与 0.00419%，即可达到约 $1\times10^{-2}$ 的合理 NMSE。特别地，为达到与方案 1 相同的信道估计精度，方案 2 在不显著增加反馈开销的前提下降低了 UE 端计算复杂度，这有助于减少 BS 估计下行信道时的总体时延。

图 9(a) 与 (b) 展示方法在若干环境参数下的敏感性。具体地，图 9(a) 给出不同 SNR 下的 CSI 恢复性能，其中压缩维度 $R$ 与 $T$ 固定为 300，$Q=3$；SNR 指 UE 端接收导频信号的信噪比。可以看到，所有算法都随 SNR 增大而变好；所提方案相比现有设计有显著性能余量——当 SNR $\ge5$ dB 时，NMSE 至少比基线低 40%。图 9(b) 给出一大范围路径损耗幅度（即 $\{\beta_i\}$）下的 NMSE。该仿真中 $|\beta_i|$ 从动态范围 $[0.01,1]$ 均匀抽取（而非前几节仿真的 $[0.5,1]$）。可以看到，所提方案仍然优于其他基线。

图 10 验证我们的可恢复性定理。具体地，图 10(a) 展示增大发射天线数 $N$ 的影响：在该测试设置下，所提方案的 NMSE 几乎不受影响；相反，其他方法的性能随天线规模增大退化更快。我们的方法对增大的 $N$ 不敏感，这与定理一致：当 $R$ 大于 $\Omega(K)$ 时，我们方法的性能不受 $M$ 或 $N$ 影响。图 10(b) 表明，算法得到的 MSE 确实以大致如预测的速率衰减，即方案 1 与方案 2 分别约为 $\mathcal O(1/\sqrt{R})$ 与 $\mathcal O(1/\sqrt{T})$。

图 11 测试算法对错误指定的 $K$（即路径数）的鲁棒性，真值 $K$ 设为 6。可以看到，当 $K$ 正好匹配实际值时方法表现最好；当 $K$ 被高估时 NMSE 仅有轻微退化；但当 $K$ 被低估时 CSI 恢复显著恶化。这是可以理解的：高估矩阵的秩不会丢失信息，而低估则更具破坏性。

### B. 基于 DeepMIMO 的仿真

**1）数据生成。** 我们使用基于射线追踪仿真真实世界信道的 DeepMIMO-v2 工具 [50]、[54] 生成信道矩阵。我们给出 DeepMIMO 提供的三个不同场景下的结果：Outdoor 1 Blockage Scenario（O1）、Boston5G Scenario（B5）与 Indoor 3 Scenario（I3）。

对每个场景，DeepMIMO 使用若干预定义 BS 位置，用“BS1”“BS2”等标签标识。对 O1 场景我们使用 BS3，对 B5 与 I3 均选择 BS1；这些 BS 的确切位置见相应场景图（参见 [50] 及 https://www.deepmimo.net/scenarios/ 中的图示）。UE 被均匀随机放置到环境空间中。对 BS 与 UE，我们采用与第 VI-A 节相同的天线配置与阵元间距，以及相同的量化区间与抖动噪声电平。此处全部实验采用 $N=32$ 根发射天线、$M=16$ 根接收天线、$K=6$ 条传播路径与 3 比特量化。

与基本仿真相比，DeepMIMO 构造的场景更复杂、更具挑战性。DeepMIMO 为每条信道标注其视距（Line-of-Sight，LOS）状态，表示 BS 与 UE 之间是否存在无遮挡的直接路径：我们把存在清晰直达路径的称为有视距（With-Line-of-Sight，WLOS）信道，把不存在任何直达路径的称为非视距（Non-Line-of-Sight，NLOS）信道。DeepMIMO 用射线追踪模型生成信道，其合并路径损耗统计列于表 I；“合并”在这里指对全部路径损耗的总体刻画。可以看到，DeepMIMO 生成的路径损耗具有很宽的动态范围，构成具有挑战性的信道估计场景。

**表 I　DeepMIMO 场景的合并路径损耗特性（数据由 [50] 提供）**

| 场景 | 最大值（dB） | 最小值（dB） | 均值±标准差（dB） |
|---|---:|---:|---:|
| O1 | 151.41 | 58.93 | 86.51 ± 8.88 |
| B5 | 133.03 | 60.61 | 93.02 ± 13.77 |
| I3 | 79.25 | 45.18 | 53.89 ± 3.21 |

**2）结果。** 图 12 比较各方法在 O1 场景下的 NMSE 性能：图 12(a) 为 WLOS 路径、图 12(b) 为 NLOS 路径。可以看到，与基线相比我们的方法具有有前景的信道估计结果，与基本仿真中观察到的一致。类似地，图 13 与图 14 表明所提方法在 B5 与 I3 场景的信道配置下同样表现良好。

## VII. 结论

本文重新审视了 FDD MIMO 系统中基于有限反馈的 CSI 估计问题。我们提出一种基于随机压缩与噪声抖动的量化 CSI 反馈框架。该方法包含两种不同的压缩方案，体现了 UE 准备时间与反馈开销之间的折中。在我们的框架下，大部分重计算由 BS 承担。我们证明，通过在 BS 端基于 MLE 的恢复，所提方案在合理条件下可证明地恢复下行 CSI，为恢复受阵列流形约束信道的样本复杂度提供了有价值的洞见。为处理与 MLE 相关的困难优化问题，我们提出一种高效的 ADMM 算法 REDEEM，它明智地采用精巧的经典 HR 算法处理其困难子问题。我们进行了大量数值仿真以测试方法性能，展示了有前景的信道估计精度。

未来有几个有前景的探索方向。第一，可以研究更具信号自适应性的压缩矩阵设计。本文主要使用随机压缩矩阵以保持 JL 引理的性质，这对我们的可恢复性分析至关重要；然而利用信道或数据的结构设计定制压缩矩阵可进一步降低反馈开销——这是一个有吸引力且实用的方向。第二，在理论方面，可发展更细粒度的刻画——例如厘清 $U_f$、$L_f$ 与 $F_f$ 之间的关系，以及它们如何依赖量化电平。第三，从实现角度看，结合在线优化或基于学习的技术可显著提升计算效率与可扩展性。

## 致谢与资助说明

R. Shrestha 与 M. Shao 对本文贡献相同。作者单位：R. Shrestha 与 X. Fu 就职于美国俄勒冈州立大学电子工程与计算机科学学院（Corvallis, OR 97331, USA）；M. Shao 曾就职于山东大学信息科学与工程学院（青岛 266237），现就职于中国科学院数学与系统科学研究院系统科学研究所系统控制重点实验室（北京 100190，中国）；W.-K. Ma 就职于香港中文大学电子工程系（中国香港）；M. Hong 就职于美国明尼苏达大学电子与计算机工程系（Minneapolis, MN 55455, USA）。通讯作者：Xiao Fu。资助：R. Shrestha 与 X. Fu 的工作部分受美国国家科学基金会（NSF）项目 NSF CCF-2210004 资助；M. Hong 的工作部分受 NSF CIF-2414372 与 NSF ECCS-2426064 资助；W.-K. Ma 的工作受香港研究资助局优配研究基金（Project ID 14203721）资助；M. Shao 的工作部分受国家自然科学基金（Grant 62401340）与山东省自然科学基金（Grant ZR2023QF103）资助。本文初步版本曾发表于 Asilomar 2022 [25]。

## 附录 A. Mod-RELAX 方法

**算法 1　Mod-RELAX 算法（用于 (29a)）**

1. **输入：** $\mathbf H$、$\boldsymbol\Lambda$。
2. 初始化 $\boldsymbol\beta=\mathbf 0$。
3. **for** $\eta=1,\ldots,K$ **do**
4. 　**repeat**
5. 　　**for** $i=1,2,\ldots,\eta-1$ **do**
6. 　　　按式 (32) 计算 $\boldsymbol\zeta_i$。
7. 　　　用二维 FFT 求离散解 $(\phi_i,\theta_i,\beta_i)$。
8. 　　　运行梯度上升 (34) 多步以精化解 $(\phi_i,\theta_i,\beta_i)$。
9. 　　**end for**
10. 　**until** $(\beta_j,\phi_j,\theta_j)_{j=1}^{\eta}$ 收敛
11. **end for**
12. **return** $(\beta_k,\phi_k,\theta_k)_{k=1}^{K}$。

## 附录 B. 事实 2 的证明

AoA 与 AoD 的参数域分别为 $\boldsymbol\theta\in[-\pi,\pi]^K$、$\boldsymbol\phi\in[-\pi,\pi]^K$。于是 $\mathcal Z_\theta$ 与 $\mathcal Z_\phi$ 的 $\epsilon_1$-网的覆盖数在 $\epsilon_1$ 较小时为

$$
\mathcal C(\mathcal Z_\theta\times\mathcal Z_\phi,\epsilon_1)\le\left(\frac{\pi}{\epsilon_1}+1\right)^{2K}\le\left(\frac{2\pi}{\epsilon_1}\right)^{2K}.
$$

此外，对 $\|\boldsymbol\beta\|_\infty\le\kappa$（若 $\|\Re(\boldsymbol\beta);\Im(\boldsymbol\beta)\|_\infty\le\kappa\sqrt{2}/2$ 则可保证），该集合 $\epsilon_2$-网的覆盖数为

$$
\mathcal C(\mathcal Z_\beta,\epsilon_2)\le\left(\frac{\sqrt{2}\kappa}{2\epsilon_2}+1\right)^{2K}\le\left(\frac{2\kappa}{\epsilon_2}\right)^{2K}.
$$

因此，$\mathcal Z$ 在 $\epsilon=\sqrt{\epsilon_1^2+\epsilon_2^2}$ 下的 $\epsilon$-网覆盖数为

$$
\mathcal C(\mathcal Z,\epsilon)\le\left(\frac{2\pi}{\epsilon_1}\right)^{2K}\left(\frac{2\kappa}{\epsilon_2}\right)^{2K}=\left(\frac{4\pi\kappa}{\epsilon_1\epsilon_2}\right)^{2K}.
$$

当 $\epsilon_1=\epsilon_2=\epsilon/\sqrt{2}$ 时右端取得最小值，于是 $\mathcal C(\mathcal Z,\epsilon)\le\left(\frac{8\pi\kappa}{\epsilon^2}\right)^{2K}$。此外，由于按事实 1 映射 $\mathcal G$ 是 $L_G$-Lipschitz 的，$\Gamma$ 的覆盖数为 $\mathcal C(\Gamma,\epsilon)\le\left(8\pi\kappa L_G^2/\epsilon^2\right)^{2K}$。证毕。

## 附录 C. 定理 1 的证明

我们把 ML 估计问题重写为

$$
\min_{\mathbf x\in\mathcal S}\ \mathcal L(\mathbf x):=-\frac{1}{R}\sum_{i=1}^{R}\sum_{q\in\mathcal U}\mathbf 1(r_i=q)\log\left(f_q(x_i)\right), \tag{41}
$$

其中 $\mathcal S:=\{\mathbf x=\mathbf A\mathbf h,\ \mathbf h\in\Gamma\}$，$\mathcal U$ 为离散量化范围集合，$f_q$ 为式 (20) 定义的似然函数。记 $\mathbf x^\natural=\mathbf A\mathbf h^\natural$、$\mathbf x^\star=\mathbf A\mathbf h^\star$ 与 $\dot{\mathbf x}=\mathbf A\dot{\mathbf h}$ 分别为真值 $\mathbf h^\natural$、MLE 解 $\mathbf h^\star$ 与 $\Gamma$ 中距真值最近点 $\dot{\mathbf h}$ 的压缩量。由 $\mathbf h^\star$ 的最优性有 $\mathcal L(\mathbf x^\star)\le\mathcal L(\dot{\mathbf x})$，因此

$$
\begin{aligned}
\mathcal L(\mathbf x^\star)\le\mathcal L(\dot{\mathbf x})
\Rightarrow\ &\mathcal L(\mathbf x^\star)-\mathbb E\left[\mathcal L(\mathbf x^\star)\right]+\mathbb E\left[\mathcal L(\mathbf x^\star)\right]-\mathbb E\left[\mathcal L(\mathbf x^\natural)\right]\\
&+\mathbb E\left[\mathcal L(\mathbf x^\natural)\right]-\mathcal L(\mathbf x^\natural)+\mathcal L(\mathbf x^\natural)-\mathcal L(\dot{\mathbf x})\le0\\
\Rightarrow\ &\mathbb E\left[\mathcal L(\mathbf x^\star)\right]-\mathbb E\left[\mathcal L(\mathbf x^\natural)\right]\le\mathbb E\left[\mathcal L(\mathbf x^\star)\right]-\mathcal L(\mathbf x^\star)\\
&+\left|\mathcal L(\mathbf x^\natural)-\mathbb E\left[\mathcal L(\mathbf x^\natural)\right]\right|+\left|\mathcal L(\dot{\mathbf x})-\mathcal L(\mathbf x^\natural)\right|,
\end{aligned}\tag{42}
$$

其中期望关于 $\mathbf r$ 取，随机性来自 $\mathbf v$ 与 $\mathbf A$。可以写出

$$
\begin{aligned}
\mathbb E\left[\mathcal L(\mathbf x^\natural)\right]-\mathbb E\left[\mathcal L(\mathbf x^\star)\right]
&=\mathbb E\left[-\frac{1}{R}\sum_{i=1}^{R}\sum_{q\in\mathcal U}\mathbf 1(r_i=q)\log\left(\frac{f_q(x_i^\natural)}{f_q(x_i^\star)}\right)\right]\\
&=-\frac{1}{R}\sum_{i=1}^{R}\sum_{q\in\mathcal U}\mathbb E\left[\mathbf 1(r_i=q)\right]\log\left(\frac{f_q(x_i^\natural)}{f_q(x_i^\star)}\right)\\
&=-\frac{1}{R}\sum_{i=1}^{R}\sum_{q\in\mathcal U}f_q(x_i^\natural)\log\left(\frac{f_q(x_i^\natural)}{f_q(x_i^\star)}\right)
=-\mathrm{KL}\left(\mathbf x^\natural\|\mathbf x^\star\right),
\end{aligned}
$$

其中 $\mathrm{KL}(\mathbf x^\natural\|\mathbf x^\star)=\frac{1}{R}\sum_{i=1}^{R}\mathrm{KL}(x_i^\natural\|x_i^\star)$，而 $\mathrm{KL}(x_i^\natural\|x_i^\star)=\sum_{q\in\mathcal U}f_q(x_i^\natural)\log\left(\frac{f_q(x_i^\natural)}{f_q(x_i^\star)}\right)$ 表示分别由 $x_i^\natural$ 与 $x_i^\star$ 诱导的两个分布之间的 KL 散度。于是不等式 (42) 可写为

$$
\mathrm{KL}\left(\mathbf x^\natural\|\mathbf x^\star\right)\le\underbrace{\mathbb E\left[\mathcal L(\mathbf x^\star)\right]-\mathcal L(\mathbf x^\star)}_{\text{项 (a)}}+\underbrace{\left|\mathcal L(\mathbf x^\natural)-\mathbb E\left[\mathcal L(\mathbf x^\natural)\right]\right|}_{\text{项 (b)}}+\underbrace{\left|\mathcal L(\dot{\mathbf x})-\mathcal L(\mathbf x^\natural)\right|}_{\text{项 (c)}}.
$$

下面分析项 (a)、(b)、(c)。

先看 (b)。注意对全部 $i$，$W_i=-\sum_{q\in\mathcal U}\mathbf 1(r_i=q)\log(f_q(x_i^\natural))$ 相互独立，且 $W_i\in[0,U_f]$。于是对任意 $0<\eta<1$，以至少 $1-\eta-\vartheta$ 的概率有

$$
\left|\mathcal L(\mathbf x^\natural)-\mathbb E\left[\mathcal L(\mathbf x^\natural)\right]\right|\le U_f\sqrt{\frac{1}{2R}\log(2/\eta)},
$$

这里用了 Hoeffding 不等式。项 (c) 可界为

$$
\begin{aligned}
\left|\mathcal L(\dot{\mathbf x})-\mathcal L(\mathbf x^\natural)\right|
&=\frac{1}{R}\left|\sum_{i=1}^{R}\sum_{q\in\mathcal U}\mathbf 1(r_i=q)\log\left(\frac{f_q(\dot{x}_i)}{f_q(x_i^\natural)}\right)\right|\\
&\le\frac{1}{R}\sum_{i=1}^{R}\sum_{q\in\mathcal U}\mathbf 1(r_i=q)\left|\log(f_q(\dot{x}_i))-\log(f_q(x_i^\natural))\right|\\
&\le\frac{1}{R}\sum_{i=1}^{R}\sum_{q\in\mathcal U}\mathbf 1(r_i=q)L_f\left|\dot{x}_i-x_i^\natural\right|
=\frac{L_f}{R}\left\|\dot{\mathbf x}-\mathbf x^\natural\right\|_1\le\frac{L_f}{\sqrt{R}}\left\|\dot{\mathbf x}-\mathbf x^\natural\right\|_2,
\end{aligned}
$$

其中第一个不等式由三角不等式得到，第二个不等式由于函数 $\log(f_q(x))$ 是 $L_f$-Lipschitz 连续的（脚注 1），最后一个不等式由于对 $\mathbf x\in\mathbb R^R$ 有范数不等式 $\|\mathbf x\|_1\le\sqrt{R}\|\mathbf x\|_2$。由 Johnson–Lindenstrauss 引理 [55]，以至少 $1-2e^{-\Omega(\alpha^2R)}$ 的概率有 $\|\dot{\mathbf x}-\mathbf x^\natural\|_2\le(1+\alpha)\|\dot{\mathbf h}-\mathbf h^\natural\|_2\le(1+\alpha)\nu$，其中第二个不等式由假设 1 得到。

> 脚注 1（原文）：由此可得 $\log(f_q(x_1))-\log(f_q(x_2))\le\max_x|f_q'(x)/f_q(x)|\cdot|x_1-x_2|$。注意到 (22)，可推出 $\max_x\left|f_q'(x)/f_q(x)\right|\le L_f$，即函数 $\log(f_q(x))$ 的 $L_f$-Lipschitz 连续性。

项 (a) 即样本平均 $\mathcal L(\mathbf x^\star)$ 与期望值 $\mathbb E[\mathcal L(\mathbf x^\star)]$ 之差。此外注意 $\mathbf x$ 的全部元素以至少 $1-\vartheta$ 的概率有界。因此可用 Rademacher 复杂度界 [35, Theorem 26.5] 来界项 (a)。以至少 $1-\delta-\vartheta$ 的概率有

$$
\mathbb E\left[\mathcal L(\mathbf x^\star)\right]-\mathcal L(\mathbf x^\star)\le2\hat{R}(\mathcal W)+4U_f\sqrt{\frac{2\log(4/\delta)}{R}}, \tag{43}
$$

其中函数类 $\mathcal W$ 定义为 $\mathcal W=\{r\mapsto\mathcal L(r,\mathbf x)\mid\mathbf x=\mathbf A\mathbf h,\ \mathbf H\in\Gamma\}$，函数类 $\mathcal W$ 的经验 Rademacher 复杂度定义为

$$
\hat{R}(\mathcal W):=\mathbb E_{\boldsymbol\sigma}\left[\sup_{w\in\mathcal W}\frac{1}{R}\sum_{i=1}^{R}\sigma_iw(r_i)\right], \tag{44}
$$

其中 $\sigma_1,\ldots,\sigma_R$ 为从 $\{-1,1\}$ 均匀采样的独立 Rademacher 随机变量。

利用 Talagrand 收缩引理 [35, Lemma 26.9] 及其界，得到

$$
\hat{R}(\mathcal W)\le L_f\hat{R}(\mathcal S), \tag{45}
$$

其中 $\mathcal S$ 表示 (7) 中 $\mathbf x$ 的参数空间

$$
\mathcal S:=\{\mathbf x\mid\mathbf x=\mathbf A\mathbf h,\ \mathbf H\in\Gamma\}. \tag{46}
$$

由 Dudley 熵积分 [56]，经验 Rademacher 复杂度可用覆盖数界定：

$$
\hat{R}(\mathcal S)\le\xi(\mathcal S), \tag{47}
$$

其中 $\xi(\mathcal S)=\inf_{\mu>0}\left(4\mu\sqrt{R}+\frac{12}{R}\int_{\mu}^{\sqrt{R}}\sqrt{\log\mathcal C(\mathcal S,\epsilon)}\,d\epsilon\right)$。由于 $\sqrt{\log\mathcal C(\mathcal S,\mu)}$ 随 $\mu$ 减小而增大，该积分可上界为 $\int_{\mu}^{\sqrt{R}}\sqrt{\log\mathcal C(\mathcal S,\epsilon)}\,d\epsilon\le\sqrt{R}\sqrt{\log\mathcal C(\mathcal S,\mu)}$。因此，可把 $\xi(\mathcal S)$ 界为 $\xi(\mathcal S)\le\inf_{\mu>0}\left(4\mu\sqrt{R}+\frac{12}{R}\sqrt{R}\sqrt{\log\mathcal C(\mathcal S,\mu)}\right)$。

尚需刻画参数空间 $\mathcal S$ 的覆盖数。设 $\mathbf x$ 为 $\Gamma$ 中的点，$\mathbf z$ 为 $\Gamma$ 的 $\mu/\|\mathbf A\|_2$-网中距 $\mathbf x$ 最近的点。于是由 (46)，$\mathbf A\mathbf x$ 是 $\mathcal S$ 中的点。进而有

$$
\|\mathbf A\mathbf x-\mathbf A\mathbf z\|_2\le\|\mathbf A\|_2\cdot\|\mathbf x-\mathbf z\|_2\le\mu.
$$

这表明集合 $\{\mathbf A\mathbf z\mid\mathbf z\in\Gamma\text{ 的 }\mu/\|\mathbf A\|_2\text{-网}\}$ 必包含 $\mathcal S$ 的 $\mu$-网。因此有 $\mathcal C(\mathcal S,\mu)\le\mathcal C(\Gamma,\mu/\|\mathbf A\|_2)$。

由 [57, Corollary 5.35] 有

$$
\|\mathbf A\|_2\le2+\sqrt{J/R} \tag{48}
$$

以至少 $1-2e^{-R/2}$ 的概率成立。可取 $\mu=2+\sqrt{J/R}$，于是得到 $\xi(\mathcal S)\le4\left(2+\sqrt{J/R}\right)\sqrt{R}+\frac{12}{\sqrt{R}}\sqrt{4K\log\left(2\sqrt{2\pi}\kappa L_G\right)}$。该结果与 (43)、(45)、(47) 结合，得到 $\mathbb E[\mathcal L(\mathbf x^\star)]-\mathcal L(\mathbf x^\star)\le\frac{2L_f}{\sqrt{R}}\tau+4U_f\sqrt{\frac{2\log(4/\delta)}{R}}$，以至少 $1-\delta-\vartheta-2e^{-R/2}$ 的概率成立，其中 $\tau=4\left(2+\sqrt{J/R}\right)+12\sqrt{4K\log\left(2\sqrt{2\pi}\kappa L_G\right)}$。

取 $\delta=2\eta$ 与 $\alpha=1/2$，并把项 (a)–(c) 的界相加，得到

$$
\begin{aligned}
\mathrm{KL}\left(\mathbf x^\natural\|\mathbf x^\star\right)
&\le\frac{2L_f}{\sqrt{R}}\tau+4U_f\sqrt{\frac{2\log(2/\eta)}{R}}+\frac{3}{2}\nu\frac{L_f}{\sqrt{R}}+U_f\sqrt{\frac{1}{2R}\log\frac{2}{\eta}}\\
&=\frac{2L_f}{\sqrt{R}}\left(\tau+\frac{3}{4}\nu\right)+\frac{9\sqrt{2}U_f}{\sqrt{R}}\sqrt{\log(2/\eta)}\\
&=\frac{1}{\sqrt{R}}\left(2L_f\left(\tau+\frac{3}{4}\nu\right)+9\sqrt{2}U_f\sqrt{\log(2/\eta)}\right)
\end{aligned}
$$

以至少 $1-3\eta-\vartheta-e^{-\Omega(R)}$ 的概率成立。

下面把 KL 散度与 $\|\mathbf A(\mathbf h^\natural-\mathbf h^\star)\|_2$ 联系起来。由 [36] 可知 KL 散度有下界 Hellinger 距离，即 $d_H^2(\mathbf x^\natural,\mathbf x^\star)\le\mathrm{KL}(\mathbf x^\natural\|\mathbf x^\star)$，其中 Hellinger 距离定义为

$$
d_H^2(\mathbf x^\natural,\mathbf x^\star)=\frac{1}{R}\sum_{i=1}^{R}d_H^2(x_i^\natural,x_i^\star),\qquad
d_H^2(x,y)=\left(\sqrt{f_q(x)}-\sqrt{f_q(y)}\right)^2+\left(\sqrt{1-f_q(x)}-\sqrt{1-f_q(y)}\right)^2.
$$

此外，[58] 表明 Hellinger 距离可进一步由 $\frac{F_f}{4R}\|\mathbf A(\mathbf h^\natural-\mathbf h^\star)\|_2^2\le d_H^2(\mathbf x^\natural,\mathbf x^\star)$ 下界。因此有

$$
\frac{\left\|\mathbf A(\mathbf h^\natural-\mathbf h^\star)\right\|_2^2}{R}\le\frac{4}{F_f}\mathrm{KL}\left(\mathbf x^\natural\|\mathbf x^\star\right). \tag{49}
$$

考虑如下引理。

**引理 1（S-REC）。** 设压缩矩阵 $\mathbf A\in\mathbb R^{R\times J}$，$a_{i,j}\sim\mathcal N(0,1/R)$（$i=1,\ldots,R$，$j=1,\ldots,J$），且

$$
R=\Omega\left(K\log\frac{2\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon}\right).
$$

则矩阵 $\mathbf A$ 满足如下 S-REC 性质：

$$
\left\|\mathbf A(\mathbf h-\mathbf h')\right\|_2\ge\gamma\left\|\mathbf h-\mathbf h'\right\|_2-\epsilon,\quad\forall\mathbf h,\mathbf h'\in\Gamma
$$

其中 $0<\gamma<1$、$\epsilon>0$，以概率 $1-e^{-\Omega((1-\gamma)^2R)}$ 成立。

**证明：** 证明与 [45, Lemma 4.1] 思路相同，区别在于：[45, Lemma 4.1] 针对参数空间为 $\ell_2$ 范数球的情形，而本文参数空间是有界流形 $\Gamma$（紧集）。我们把 [45, Lemma 4.1] 中 $\ell_2$ 范数球的覆盖数替换为流形 $\Gamma$ 的覆盖数，其余证明相同，即得引理 1 的结论。

应用引理 1，得到

$$
\begin{aligned}
\left\|\mathbf A\dot{\mathbf h}-\mathbf A\mathbf h^*\right\|_2
&\le\left\|\mathbf A\dot{\mathbf h}-\mathbf A\mathbf h^\natural\right\|_2+\left\|\mathbf A\mathbf h^*-\mathbf A\mathbf h^\natural\right\|_2\\
&\le\left(2+\sqrt{J/R}\right)\nu+\left\|\mathbf A\mathbf h^*-\mathbf A\mathbf h^\natural\right\|_2,
\end{aligned}\tag{50}
$$

以至少 $1-2e^{-R/2}$ 的概率成立。第一个不等式由三角不等式得到，第二个使用 (48)。

进一步有

$$
\begin{aligned}
\frac{\left\|\mathbf h^\natural-\mathbf h^\star\right\|_2^2}{MN}
&\overset{(a)}{\le}\frac{\left(\left\|\mathbf h^\natural-\dot{\mathbf h}\right\|_2+\left\|\dot{\mathbf h}-\mathbf h^\star\right\|_2\right)^2}{MN}\\
&\overset{(b)}{\le}\frac{\left(\left\|\mathbf A(\dot{\mathbf h}-\mathbf h^\star)\right\|_2+\epsilon+\gamma\nu\right)^2}{\gamma^2MN}\\
&\overset{(c)}{\le}\frac{4\left(2+\sqrt{J/R}\right)^2\nu^2+2\left\|\mathbf A\mathbf h^*-\mathbf A\mathbf h^\natural\right\|_2^2+2(\epsilon+\gamma\nu)^2}{\gamma^2MN}\\
&\le\frac{2\left\|\mathbf A\mathbf h^*-\mathbf A\mathbf h^\natural\right\|_2^2+2\epsilon'^2}{\gamma^2MN},
\end{aligned}\tag{51}
$$

其中 (a) 由三角不等式，(b) 由引理 1，(c) 由 (50)，且 $\epsilon'=\epsilon+\gamma\nu+2\sqrt{2}+\sqrt{2J/R}$。

把 (49) 代入 (51) 并利用 $R\le4MN$，可得 $\|\mathbf A(\mathbf h^\natural-\mathbf h^\star)\|_2^2/MN\le\frac{8}{\sqrt{R}}\left(\frac{4L_f}{F_f}(\tau+\frac{3}{4}\nu)+\frac{9U_f}{F_f}\sqrt{2\log(2/\eta)}\right)$，且 $\epsilon'^2/MN\le4\epsilon'^2/R$。取 $\gamma=1/2$、$\epsilon=1/K$，即得定理 1 的结论，概率至少为 $1-3\eta-\vartheta-e^{-\Omega(R)}$。

## 补充材料（原文第 16–18 页）

### 附录 D. BS 端 REDEEM 的逐迭代复杂度

下面分析所提方案 1 算法的逐迭代复杂度：

1. **对偶变量更新：** 该步仅涉及矩阵加法，时间复杂度为 $\mathcal O(MN)$。
2. **EM 更新：** 注意 (37) 中昂贵的求逆操作不依赖优化变量，可在开始时只计算一次。E 步与 M 步的时间复杂度分别为 $\mathcal O(RMN)$ 与 $\mathcal O(MNR)$。
3. **Mod-RELAX 更新：** 该步用二维 DFT 求解 (33)，其性能依赖 DFT 矩阵的离散化分辨率。我们的实现时间复杂度为 $\mathcal O\left(\bar I_{\mathrm{GA}}\bar I_{\mathrm{RLX}}\bar I_{\mathrm{RLX}}K^3MN+\bar I_{\mathrm{RLX}}K^2MN\log MN\right)$。
4. **总逐迭代复杂度**为 $\mathcal O\left(\bar I_{\mathrm{EM}}MNR+\bar I_{\mathrm{GA}}\bar I_{\mathrm{RLX}}K^3MN+\bar I_{\mathrm{RLX}}K^2MN\log MN\right)$。

上式中 $\bar I_{\mathrm{GA}}$、$\bar I_{\mathrm{EM}}$ 与 $\bar I_{\mathrm{RLX}}$ 分别表示梯度上升、EM 与 Mod-RELAX 的最大迭代次数。经验上算法在少数几次迭代内收敛。注意方案 2 的逐迭代复杂度与方案 1 相同，只需把测量维度 $R$ 替换为 $T$。

### 附录 E. 事实 1 的证明

为证明映射 $\mathcal G$ 是 Lipschitz 连续的，只需证明 $\mathcal G$ 的 Jacobian 有界；参见例如 [59, Theorem 9.7]。记关于 $\theta_k$ 的 Jacobian 矩阵为 $\nabla_{\theta_k}\mathbf H\in\mathbb R^{M\times N}$，其中 $[\nabla_{\theta_k}\mathbf H]_{m,n}=\partial[\mathbf H]_{m,n}/\partial\theta_k$。则容易看出对全部 $k=1,\ldots,K$ 有

$$
\left\|\nabla_{\theta_k}\mathbf H\right\|_F\le|\beta_k|\frac{2\pi d}{\lambda}M\sqrt{MN}.
$$

类似地，有 $\left\|\nabla_{\phi_k}\mathbf H\right\|_F\le|\beta_k|\frac{2\pi d}{\lambda}N\sqrt{MN}$，$\left\|\nabla_{\beta_k}\mathbf H\right\|_F\le\sqrt{MN}$。于是存在有限 $L_G>0$ 使

$$
L_G\le\sup_{\mathbf z\in\mathcal Z}\sqrt{\sum_{k=1}^{K}\left(\left\|\nabla_{\theta_k}\mathbf H\right\|_F^2+\left\|\nabla_{\phi_k}\mathbf H\right\|_F^2+\left\|\nabla_{\beta_k}\mathbf H\right\|_F^2\right)}
\le\sqrt{KMN}\sqrt{1+\left(\frac{2\pi d\kappa}{\lambda}\right)^2\left(M^2+N^2\right)},
$$

其中 $\kappa$ 为式 (16) 中定义的 $\|\boldsymbol\beta\|_\infty$ 上界。这证明了函数 $\mathcal G(\cdot)$ 存在有限 Lipschitz 常数。

### 附录 F. 定理 2 的证明

定理 2 的证明与定理 1 思路相同，但更具挑战性。关键是要验证矩阵 $\mathbf D$ 是否满足 S-REC 性质。为此，我们给出如下重要结果。

**引理 2（$\mathbf D$ 的 S-REC）。** 设压缩矩阵 $\mathbf D\in\mathbb R^{T\times J}$ 且

$$
\mathbf D=\frac{1}{T}\left(\mathbf S^\top\odot\mathbf A^\top\right)^\top,
$$

其中 $s_{i,j}\sim\mathcal N(0,1)$（$i=1,\ldots,2N$，$j=1,\ldots,T$），$a_{i,j}\sim\mathcal N(0,1)$（$i=1,\ldots,2M$，$j=1,\ldots,T$），$J=4MN$。令

$$
T=\Omega\left(K^2\left(\log\frac{4\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon}\right)^2\right).
$$

则矩阵 $\mathbf D$ 满足如下 S-REC 性质：

$$
\left\|\mathbf D(\check{\mathbf h}-\check{\mathbf h}')\right\|_2\ge\gamma\left\|\check{\mathbf h}-\check{\mathbf h}'\right\|_2-\epsilon,\quad\forall\check{\mathbf h},\check{\mathbf h}'\in\check{\Gamma}
$$

其中 $0<\gamma<1$、$\epsilon>0$，以概率 $1-e^{-\Omega((1-\gamma)^2T)}$ 成立。

引理 2 的证明见附录 G。有了引理 2，其余证明与定理 1 相同。

### 附录 G. 引理 2 的证明

为证明引理 2，我们首先证明矩阵 $\mathbf D$ 满足分布 JL 矩性质，该性质在引理 3 中给出。

**引理 3。** 当

$$
N_S\ge\max\left(c_1\alpha^{-2}\log(1/\epsilon),\ c_2\alpha^{-1}\left(\log(1/\epsilon)\right)^2\right)
$$

且对任意向量 $\mathbf x\in\mathbb R^d$ 固定 $\alpha$ 时，有

$$
\mathrm{Pr}\left(\left|\frac{\left\|\mathbf D\mathbf x\right\|_2^2}{\left\|\mathbf x\right\|_2^2}-1\right|\ge\alpha\right)\le\epsilon.
$$

此外，对任意 $\epsilon>0$ 与固定 $T$，若

$$
\alpha\ge\max\left(\sqrt{\frac{c_1}{T}\log\frac{1}{\epsilon}},\ \frac{c_2}{2T}\left(\log\frac{1}{\epsilon}\right)^2\right),
$$

则

$$
\mathrm{Pr}\left(\left|\frac{\left\|\mathbf D\mathbf x\right\|_2^2}{\left\|\mathbf x\right\|_2^2}-1\right|\ge\alpha\right)\le\epsilon.
$$

引理 3 的证明稍后给出。利用引理 3 的结果，我们能够证明如下结果。

**引理 4。** 设压缩矩阵 $\mathbf D\in\mathbb R^{T\times J}$ 且

$$
\mathbf D=\frac{1}{T}\left(\mathbf S^\top\odot\mathbf A^\top\right)^\top,
$$

其中 $s_{i,j}\sim\mathcal N(0,1)$（$i=1,\ldots,2N$，$j=1,\ldots,T$），$a_{i,j}\sim\mathcal N(0,1)$（$i=1,\ldots,2M$，$j=1,\ldots,T$），$J=4MN$。令

$$
T=\Omega\left(K^2\left(\log\frac{4\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon}\right)^2\right).
$$

设 $\mathcal M$ 为 $\mathcal Z$ 的 $\epsilon$-网。则对任意 $\check{\mathbf h}\in\check{\Gamma}$，若

$$
\check{\mathbf h}'=\arg\min_{\hat{\mathbf h}\in\mathcal G(\mathcal M)}\left\|\check{\mathbf h}-\hat{\mathbf h}\right\|_2,
$$

则有 $\left\|\mathbf D(\check{\mathbf h}-\check{\mathbf h}')\right\|_2=\mathcal O(\epsilon)$，以至少 $1-e^{-\Omega(\sqrt{T})}$ 的概率成立。

引理 4 的证明稍后给出。现在可以给出引理 2 的主要证明。首先定义 $\check{g}=\check{g}\circ\mathcal G$。我们构造 $\mathcal Z$ 的 $\epsilon/(2L_G)$-网 $\mathcal M$，则 $N=\check{g}(\mathcal M)$ 是 $\check{\Gamma}$ 的 $\epsilon$-网。令 $U$ 表示 $N$ 中两两距离的集合，即 $U=\{\check{g}(\mathbf z_1)-\check{g}(\mathbf z_2)\mid\mathbf z_1,\mathbf z_2\in\mathcal M\}$。于是基数 $|U|=|N|^2$，且

$$
\log(|U|)\le8K\log\left(\frac{4\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon}\right). \tag{52}
$$

设 $\mathbf z_1$、$\mathbf z_2$ 为 $\mathcal Z$ 中两点，并令 $\mathbf z_1'$、$\mathbf z_2'$ 分别为 $\mathcal M$ 中距 $\mathbf z_1$、$\mathbf z_2$ 最近的点。这保证

$$
\begin{aligned}
\left\|\check{g}(\mathbf z_1)-\check{g}(\mathbf z_2)\right\|_2
&\le\left\|\check{g}(\mathbf z_1)-\check{g}(\mathbf z_1')\right\|_2+\left\|\check{g}(\mathbf z_1')-\check{g}(\mathbf z_2')\right\|_2+\left\|\check{g}(\mathbf z_2)-\check{g}(\mathbf z_2')\right\|_2\\
&\le\left\|\check{g}(\mathbf z_1')-\check{g}(\mathbf z_2')\right\|_2+2\epsilon
\end{aligned}\tag{53}
$$

其中第一个不等式由三角不等式，第二个不等式由 $\epsilon$-网 $N$ 的构造得到。此外，有

$$
\begin{aligned}
\left\|\mathbf D\check{g}(\mathbf z_1')-\mathbf D\check{g}(\mathbf z_2')\right\|_2
&\le\left\|\mathbf D\check{g}(\mathbf z_1')-\mathbf D\check{g}(\mathbf z_1)\right\|_2+\left\|\mathbf D\check{g}(\mathbf z_1)-\mathbf D\check{g}(\mathbf z_2)\right\|_2+\left\|\mathbf D\check{g}(\mathbf z_2)-\mathbf D\check{g}(\mathbf z_2')\right\|_2\\
&\le\left\|\mathbf D\check{g}(\mathbf z_1)-\mathbf D\check{g}(\mathbf z_2)\right\|_2+\mathcal O(\epsilon),
\end{aligned}\tag{54}
$$

其中第一个不等式由三角不等式，第二个不等式由引理 4。由引理 3 的结果，有

$$
\left\|\mathbf D\check{g}(\mathbf z_1')-\mathbf D\check{g}(\mathbf z_2')\right\|_2\ge(1-\alpha)\left\|\check{g}(\mathbf z_1')-\check{g}(\mathbf z_2')\right\|_2 \tag{55}
$$

以至少 $1-e^{-\Omega(\sqrt{T})}$ 的概率成立。结合上述不等式，有

$$
\begin{aligned}
(1-\alpha)\left\|\check{g}(\mathbf z_1)-\check{g}(\mathbf z_2)\right\|_2
&\le(1-\alpha)\left\|\check{g}(\mathbf z_1')-\check{g}(\mathbf z_2')\right\|_2+\mathcal O(\epsilon)\\
&\le\left\|\mathbf D\check{g}(\mathbf z_1')-\mathbf D\check{g}(\mathbf z_2')\right\|_2+\mathcal O(\epsilon)\\
&\le\left\|\mathbf D\check{g}(\mathbf z_1)-\mathbf D\check{g}(\mathbf z_2)\right\|_2+\mathcal O(\epsilon),
\end{aligned}\tag{56}
$$

其中第一个不等式由 (53)，第二个不等式由 (55)，最后一个不等式由 (54)。这表明 $\mathbf D$ 满足 S-REC 性质。

### 附录 H. 引理 3 的证明

首先引入 JL 矩性质的定义。

**定义 2。** 若对任意参数 $\alpha,\epsilon\in[0,1]$、$t\ge2$，以及对每个满足 $\|\mathbf x\|_2=1$ 的 $\mathbf x\in\mathbb R^d$，都有 $\mathbb E\left[\left|\left\|\mathbf A\mathbf x\right\|_2^2-1\right|^t\right]\le\alpha^t\epsilon$ 且 $\mathbb E\left[\left\|\mathbf A\mathbf x\right\|_2^2\right]=1$，则称矩阵 $\mathbf A\in\mathbb R^{m\times d}$ 满足 $(\alpha,\epsilon,t)$-JL 矩性质。

沿用 [60, Theorem 42] 中 $c=2$ 的特例结果，可以验证：若

$$
T\ge\max\left(c_1\alpha^{-2}\log(1/\epsilon),\ c_2\alpha^{-1}\left(\log(1/\epsilon)\right)^2\right)
$$

（其中 $c_1,c_2>0$ 为常数），则对任意 $p\ge4$，$\mathbf D$ 满足 $(\alpha,\epsilon,p)$-JL 矩性质。随后由 Markov 不等式可得

$$
\mathrm{Pr}\left(\left|\frac{\left\|\mathbf D\mathbf x\right\|_2^2}{\left\|\mathbf x\right\|_2^2}-1\right|\ge\alpha\right)
=\mathrm{Pr}\left(\left|\frac{\left\|\mathbf D\mathbf x\right\|_2^2}{\left\|\mathbf x\right\|_2^2}-1\right|^p\ge\alpha^p\right)
\le\frac{\alpha^p\epsilon}{\alpha^p}=\epsilon.
$$

### 附录 I. 引理 4 的证明

由引理 3，对任意 $f>0$，若 $\alpha\ge\max\left\{\sqrt{\frac{c_1}{T}\log(1/f)},\frac{c_2}{2T}\left(\log(1/f)\right)^2\right\}$，则 $\mathrm{Pr}\left(\left\|\mathbf D\mathbf x\right\|_2\ge(1+\alpha)\left\|\mathbf x\right\|_2\right)\le f$。

我们构造 $\mathcal Z$ 的一串 $\epsilon$-网 $\mathcal M_0\subseteq\mathcal M_1\subseteq\mathcal M_2\subseteq\cdots\subseteq\mathcal M_l$，其中 $\mathcal M_i$ 为 $\epsilon_i/(2L_G)$-网且 $\epsilon_i=\epsilon/2^i$。已知存在这样的网链使

$$
\log|\mathcal M_i|\le4K\log\left(\frac{4\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon_i}\right)\le4iK+4K\log\left(\frac{4\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon}\right).
$$

令 $N_i=\check{g}(\mathcal G(\mathcal M_i))$，则 $N_i$ 是 $\check{\Gamma}$ 的 $\epsilon_i$-网，且 $|N_i|=|\mathcal M_i|$。对 $i\in\{0,1,2,\ldots,l-1\}$，令

$$
U_i=\left\{\check{\mathbf h}_{i+1}-\check{\mathbf h}_i\mid\check{\mathbf h}_{i+1}\in N_{i+1},\ \check{\mathbf h}_i\in N_i\right\}.
$$

于是各 $U_i$ 的基数可界为

$$
\log|U_i|\le\log|N_{i+1}|+\log|N_i|\le12iK+8K\log\left(\frac{4\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon}\right).
$$

由此，对特定的 $\alpha_i$ 与 $f_i$ 设置，有 $\mathrm{Pr}\left(\left\|\mathbf D\check{\mathbf h}\right\|_2>(1+\alpha_i)\left\|\check{\mathbf h}\right\|_2\right)\le f_i$。因此由联合界，对 $i=1,\ldots,l$ 有

$$
\mathrm{Pr}\left(\left\|\mathbf D\check{\mathbf h}\right\|_2\le(1+\alpha_i)\left\|\check{\mathbf h}\right\|_2,\ \forall\check{\mathbf h}\in U_i\right)\ge1-\sum_{i=0}^{l-1}|U_i|f_i.
$$

这给出

$$
\log\left(|U_i|f_i\right)=\log(|U_i|)+\log(f_i)\le12iK+8K\log\left(\frac{4\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon}\right)+\log(f_i).
$$

现在令 $T^{1/2}=12K\log\left(\frac{4\sqrt{2}\sqrt{\pi}\kappa L_G}{\epsilon}\right)$，并取 $\log f_i=-\left(T^{1/2}+16iK\right)$，于是

$$
\alpha_i=\max\left(\sqrt{\frac{c_1/2}{T^{1/2}}}\left(T^{1/2}+16iK\right)^{1/2},\ \frac{c_2}{2T}\left(T^{1/2}+16iK\right)^2\right).
$$

于是有

$$
\log\left(|U_i|f_i\right)\le12iK+\frac{2}{3}T^{1/2}-T^{1/2}-16iK=-4iK-\frac{\sqrt{T}}{3}.
$$

这意味着

$$
\begin{aligned}
&\mathrm{Pr}\left(\left\|\mathbf D\check{\mathbf h}\right\|_2\le(1+\alpha_i)\left\|\check{\mathbf h}\right\|_2,\ \forall\check{\mathbf h}\in U_i\right)\\
&\qquad\ge1-\sum_{i=0}^{l-1}e^{-4iK-\sqrt{T}/3}
\ge1-e^{-\sqrt{T}/3}\left(\frac{1}{1-e^{-1}}\right)
\ge1-2e^{-\sqrt{T}/3}.
\end{aligned}
$$

随后，对任意 $\check{\mathbf h}\in\check{\Gamma}$，可写

$$
\check{\mathbf h}=\check{\mathbf h}_0+\sum_{i=0}^{l-1}\left(\check{\mathbf h}_{i+1}-\check{\mathbf h}_i\right)+\check{\mathbf h}_f, \tag{57}
$$

其中 $\check{\mathbf h}_i\in\check{\Gamma}$，$\check{\mathbf h}_f=\check{\mathbf h}-\check{\mathbf h}_l$。

我们有 $\check{\mathbf h}_{i+1}-\check{\mathbf h}_i\in U_i$，且以至少 $1-2e^{-\sqrt{T}/3}$ 的概率有

$$
\sum_{i=0}^{l-1}\left\|\mathbf D\left(\check{\mathbf h}_{i+1}-\check{\mathbf h}_i\right)\right\|_2
\le\sum_{i=0}^{l-1}(1+\alpha_i)\left\|\check{\mathbf h}_{i+1}-\check{\mathbf h}_i\right\|_2
\le\epsilon\sum_{i=0}^{l-1}\frac{1}{2^i}(1+\alpha_i).
$$

由于 $\alpha_i$ 随 $T$ 减小且求和项内递减，可上界为

$$
\sum_{i=0}^{l-1}\left\|\mathbf D\left(\check{\mathbf h}_{i+1}-\check{\mathbf h}_i\right)\right\|_2\le\mathcal O(\epsilon).
$$

于是，对任意 $\check{\mathbf h},\check{\mathbf h}'\in\check{\Gamma}$，以至少 $1-e^{-\Omega(\sqrt{T})}$ 的概率有

$$
\left\|\mathbf D(\check{\mathbf h}-\check{\mathbf h}')\right\|_2
\le\sum_{i=0}^{l-1}\left\|\mathbf D\left(\check{\mathbf h}_{i+1}-\check{\mathbf h}_i\right)\right\|_2+\left\|\mathbf D\check{\mathbf h}_f\right\|_2
\le\mathcal O(\epsilon)+\left\|\mathbf D\check{\mathbf h}_f\right\|_2,
$$

其中 $\check{\mathbf h}_f=\check{\mathbf h}-\check{\mathbf h}_l$，且 $\|\check{\mathbf h}_f\|_2=\|\check{\mathbf h}-\check{\mathbf h}_l\|_2\le\epsilon_l=\frac{\epsilon}{2^l}$。于是 $\|\mathbf D\check{\mathbf h}_f\|_2\le\|\mathbf D\|_2\frac{\epsilon}{2^l}$。

为继续推导，需要如下结果。

**引理 5。** 设 $\mathbf D=(\mathbf A_1^\top\odot\mathbf A_2^\top)^\top$，其中 $\odot$ 表示 Khatri-Rao 积，$[\mathbf A_1]_{i,j}\sim\mathcal N(0,1/T)$，$[\mathbf A_2]_{i,j}\sim\mathcal N(0,1/T)$。则以至少 $1-4e^{-T/2}$ 的概率有

$$
\left\|\mathbf D\right\|_2\le4+4\sqrt{\frac{J}{T}}+\frac{J}{T}. \tag{58}
$$

引理 5 的证明稍后给出。利用引理 5 的结果，以至少 $1-4e^{-T/2}$ 的概率有 $\left\|\mathbf D\check{\mathbf h}_f\right\|_2\le\left(4+4\sqrt{\frac{J}{T}}+\frac{J}{T}\right)\frac{\epsilon}{2^l}$。若取 $l=\log J$，则 $\left\|\mathbf D\check{\mathbf h}_f\right\|_2=\mathcal O(\epsilon)$。于是有

$$
\left\|\mathbf D(\check{\mathbf h}-\check{\mathbf h}')\right\|_2=\mathcal O(\epsilon) \tag{59}
$$

以至少 $1-e^{-\Omega(\sqrt{T})}$ 的概率成立。

### 附录 J. 引理 5 的证明

证明思路沿用 [61] 的结果。由谱范数的定义，

$$
\begin{aligned}
\left\|\mathbf A_1^\top\odot\mathbf A_2^\top\right\|_2
&=\sigma_{\max}\left(\mathbf A_1^\top\odot\mathbf A_2^\top\right)
=\max_{\|\mathbf x\|_2=1}\left\|\left(\mathbf A_1^\top\odot\mathbf A_2^\top\right)\mathbf x\right\|\\
&=\max_{\|\mathbf x\|_2=1}\left\|\left(\mathbf A_1^\top\otimes\mathbf A_2^\top\right)\mathbf P\mathbf x\right\|_2 .
\end{aligned}\tag{60a}
$$

$$
\begin{aligned}
&\le\max_{\|\mathbf x\|_2=1}\left\|\mathbf A_1^\top\otimes\mathbf A_2^\top\right\|_2\left\|\mathbf P\right\|_2\left\|\mathbf x\right\|_2\\
&=\left\|\mathbf A_1^\top\otimes\mathbf A_2^\top\right\|_2\max_{\|\mathbf x\|_2=1}\left\|\mathbf x\right\|_2 .
\end{aligned}\tag{60b}
$$

$$
=\left\|\mathbf A_1^\top\otimes\mathbf A_2^\top\right\|_2=\left\|\mathbf A_1\right\|_2\left\|\mathbf A_2\right\|_2, \tag{60c}
$$

其中 $\mathbf P\in\{0,1\}^{T^2\times T}$ 为列选择矩阵，式 (60a) 利用了 $\mathbf A_1^\top\odot\mathbf A_2^\top$ 由 $\mathbf A_1^\top\otimes\mathbf A_2^\top$ 的部分列组成这一事实；(60b) 由 Cauchy–Schwarz 不等式；(60c) 由于 $\|\mathbf P\|_2=1$。由 [57, Corollary 5.35]，对 $\mathbf A_1$ 与 $\mathbf A_2$ 均有

$$
\left\|\mathbf A_i\right\|_2\ge2+\sqrt{n_i/T}
$$

的概率至多为 $2e^{-T/2}$，其中 $n_1=2N$、$n_2=2M$。现在利用联合界有

$$
\mathrm{Pr}\left(\left\|\mathbf A_1\right\|_2\cdot\left\|\mathbf A_2\right\|_2\ge t^2\right)
\le\mathrm{Pr}\left(\left(\left\|\mathbf A_1\right\|_2\ge t\right)\cup\left(\left\|\mathbf A_2\right\|_2\ge t\right)\right)
\le\mathrm{Pr}\left(\left\|\mathbf A_1\right\|_2\ge t\right)+\mathrm{Pr}\left(\left\|\mathbf A_2\right\|_2\ge t\right).
$$

结合上述两个结果，得到

$$
\mathrm{Pr}\left(\left\|\mathbf A_1\right\|_2\cdot\left\|\mathbf A_2\right\|_2\ge\left(2+\sqrt{\frac{J}{T}}\right)^2\right)
\le\mathrm{Pr}\left(\left\|\mathbf A_1\right\|_2\ge2+\sqrt{\frac{J}{T}}\right)+\mathrm{Pr}\left(\left\|\mathbf A_2\right\|_2\ge2+\sqrt{\frac{J}{T}}\right)
$$

$$
\le\mathrm{Pr}\left(\left\|\mathbf A_1\right\|_2\ge2+\sqrt{\frac{n_1}{T}}\right)+\mathrm{Pr}\left(\left\|\mathbf A_2\right\|_2\ge2+\sqrt{\frac{n_2}{T}}\right).
$$

因此有

$$
\mathrm{Pr}\left(\left\|\mathbf A_1\right\|_2\cdot\left\|\mathbf A_2\right\|_2\ge4+4\sqrt{\frac{J}{T}}+\frac{J}{T}\right)\le4e^{-T/2}.
$$

这与 (60) 一起即得引理 5 的结果。

## 图注与表注

**图 1：** 本文考虑的有限反馈场景：基站通过下行信道 $\mathbf H$ 向用户设备发送信号，用户设备经有限反馈信道回传压缩量化信息。

**图 2：** 不同抖动电平 $\sigma_v$ 下比值 $L_f/F_f$ 与 $U_f/F_f$ 的示意（$Q=4$）。横轴为抖动电平，纵轴为参数值（对数尺度）；两比值先减小后增大。

**图 3：** 所提 ADMM 算法与朴素梯度下降（GD）在迭代中的估计信道 $\hat{\mathbf H}$ 的 NMSE 对比（NMSE 定义见式 (39)）；$(M,N)=(16,32)$，$Q=3$，$R=300$，$\sigma=0.03$，$K=6$。图中 GD 曲线取学习率 $0.1$、$0.01$、$0.001$、$10^{-4}$、$10^{-5}$、$10^{-6}$，REDEEM 曲线收敛最快且最低。

**图 4：** $N=32$ 时不同 $Q$ 下的 NMSE 性能。（a）$(M,K,Q)=(16,6,2)$；（b）$(M,K,Q)=(24,8,3)$。横轴为反馈比特数（200–1000/1400），纵轴为 NMSE；对比 REDEEM（方案 1、方案 2）、SparseMLE、SparseMLE（方案 1）与 EMMP。

**图 5：** $N=32$ 时不同 $Q$ 下的 BGain 性能。（a）$(M,K,Q)=(16,6,2)$；（b）$(M,K,Q)=(24,8,3)$。对比曲线同图 4。

**图 6：** 固定 900 比特反馈预算、不同 $Q$ 下的 NMSE 性能；$N=32$、$M=16$、$K=6$。横轴为量化比特数（2–7）。

**图 7：** 不同测量数（方案 1 的 $R$ 与方案 2 的 $T$）下的 NMSE 性能；$N=32$、$M=16$、$K=6$；实线：$Q=3$；虚线：$Q=2$。

**图 8：** 所提方法与 UE 端估计参数方法的性能对比；$N=32$、$M=16$、$K=6$、$Q=3$。（a）各方法的 NMSE；（b）UE 端准备时间（PT，900 反馈比特），横轴为发射天线数 $N$（16–128），纵轴为时间（秒，对数尺度）；图中标注了各方法在不同 $N$ 下的准备时间数值，量级从毫秒级到数十秒不等。

**图 9：** 对接收信号 SNR 与路径损耗大动态范围的鲁棒性评估。（a）NMSE 随 SNR 变化（$N=32$、$M=16$、$K=6$、$Q=3$、900 反馈比特）；（b）$|\beta_i|$ 从 $[0.01,1]$ 采样时 NMSE 随 $R$ 与 $T$ 的变化（2 比特与 3 比特量化）。

**图 10：** 定理验证：对 $N$ 的不敏感性以及 $R$、$T$ 增大时的 MSE 衰减速率。（a）NMSE 随 $N$（20–120）的变化（$M=16$、$K=6$、$Q=3$、900 反馈比特）；（b）MSE 随测量数（$R$ 或 $T$，2000–10000）的变化，并给出 $\mathcal O(1/\sqrt{R})$（或 $\mathcal O(1/\sqrt{T})$）参考斜率。

**图 11：** 对 $K$ 偏离实际值的敏感性；$M=32$、$N=16$、实际 $K=6$、$Q=3$、900 反馈比特。横轴为模型假设的 $K$（2–14），纵轴为 NMSE；图中标出实际 $K=6$ 的位置。

**图 12：** O1 场景下不同测量数时的性能；$N=32$、$M=16$、$K=6$、$Q=3$。（a）WLOS；（b）NLOS。

**图 13：** B5 场景下不同测量数时的性能；$N=32$、$M=16$、$K=6$、$Q=3$。（a）WLOS；（b）NLOS。

**图 14：** I3 场景下不同反馈维度时的恢复性能；$N=32$、$M=16$、$K=6$、3 比特量化。（a）WLOS；（b）NLOS。

**表 I：** DeepMIMO 场景的合并路径损耗特性（由 [50] 提供）：O1 最大值 151.41 dB、最小值 58.93 dB、均值±标准差 86.51 ± 8.88 dB；B5 为 133.03 dB、60.61 dB、93.02 ± 13.77 dB；I3 为 79.25 dB、45.18 dB、53.89 ± 3.21 dB。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v2 第 14–15 页转录；未逐条核对 DOI）。

[1] A. Goldsmith, Wireless Communications. Cambridge University Press, 2005.

[2] D. J. Love, R. W. Heath, V. K. N. Lau, D. Gesbert, B. D. Rao, and M. Andrews, “An overview of limited feedback in wireless communication systems,” IEEE J. Sel. Areas Commun., vol. 26, no. 8, pp. 1341–1365, 2008.

[3] N. Jindal, “MIMO broadcast channels with finite-rate feedback,” IEEE Trans. Inf. Theory, vol. 52, no. 11, pp. 5045–5060, 2006.

[4] H. Q. Ngo, E. G. Larsson, and T. L. Marzetta, “Energy and spectral efficiency of very large multiuser MIMO systems,” IEEE Trans. Commun., vol. 61, no. 4, pp. 1436–1449, 2013.

[5] Z. Gao, L. Dai, Z. Wang, and S. Chen, “Spatially common sparsity based adaptive channel estimation and feedback for FDD massive MIMO,” IEEE Trans. Signal Process., vol. 63, no. 23, pp. 6169–6183, 2015.

[6] L. Lu, G. Y. Li, A. L. Swindlehurst, A. Ashikhmin, and R. Zhang, “An overview of massive MIMO: Benefits and challenges,” IEEE J. Sel. Topics Signal Process., vol. 8, no. 5, pp. 742–758, 2014.

[7] Z. Jiang, A. F. Molisch, G. Caire, and Z. Niu, “Achievable rates of FDD massive MIMO systems with spatial channel correlation,” IEEE Trans. Wireless Commun., vol. 14, no. 5, pp. 2868–2882, 2015.

[8] D. Hu and L. He, “Channel estimation for FDD massive MIMO OFDM systems,” in Proc. IEEE 86th Veh. Tech. Conf. (VTC-Fall). IEEE, 2017, pp. 1–5.

[9] K. Li, Y. Li, L. Cheng, Q. Shi, and Z.-Q. Luo, “Pushing the limit of Type I codebook for FDD massive MIMO beamforming: A channel covariance reconstruction approach,” in Proc. IEEE Int. Conf. Acoustics, Speech, Signal Process. (ICASSP), 2021, pp. 4785–4789.

[10] L. Li, X. Zeng, Y.-F. Liu, Y. Xu, and T.-H. Chang, “CSI sensing from heterogeneous user feedbacks: A constrained phase retrieval approach,” IEEE Trans. Wireless Commun., vol. 22, no. 10, pp. 6930–6945, 2023.

[11] C. K. Au-yeung and D. J. Love, “On the performance of random vector quantization limited feedback beamforming in a MISO system,” IEEE Trans. Wireless Commun., vol. 6, no. 2, pp. 458–462, 2007.

[12] J. Choi, Z. Chance, D. J. Love, and U. Madhow, “Noncoherent trellis coded quantization: A practical limited feedback technique for massive MIMO systems,” IEEE Trans. Commun., vol. 61, no. 12, pp. 5016–5029, 2013.

[13] X. Rao and V. K. N. Lau, “Distributed compressive CSIT estimation and feedback for FDD multi-user massive MIMO systems,” IEEE Trans. Signal Process., vol. 62, no. 12, pp. 3261–3271, 2014.

[14] P. N. Alevizos, X. Fu, N. D. Sidiropoulos, Y. Yang, and A. Bletsas, “Limited feedback channel estimation in massive MIMO with non-uniform directional dictionaries,” IEEE Trans. Signal Process., vol. 66, no. 19, pp. 5127–5141, 2018.

[15] Z. Zhou, X. Chen, D. Guo, and M. L. Honig, “Sparse channel estimation for massive MIMO with 1-bit feedback per dimension,” in Proc. 2017 IEEE Wireless Communi. Netw. Conf. (WCNC). IEEE, 2017, pp. 1–6.

[16] C. Qian, X. Fu, and N. D. Sidiropoulos, “Algebraic channel estimation algorithms for FDD massive MIMO systems,” IEEE J. Sel. Topics Signal Process., vol. 13, no. 5, pp. 961–973, 2019.

[17] R. Zhang, L. Cheng, S. Wang, Y. Lou, Y. Gao, W. Wu, and D. W. K. Ng, “Integrated sensing and communication with massive MIMO: A unified tensor approach for channel and target parameter estimation,” IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 8571–8587, 2024.

[18] P.-H. Kuo, H. T. Kung, and P.-A. Ting, “Compressive sensing based channel feedback protocols for spatially-correlated massive antenna arrays,” in Proc. IEEE Wireless Communi. Netw. Conf. (WCNC). IEEE, 2012, pp. 492–497.

[19] C. Qian, X. Fu, N. D. Sidiropoulos, and Y. Yang, “Tensor-based channel estimation for dual-polarized massive MIMO systems,” IEEE Trans. Signal Process., vol. 66, no. 24, pp. 6390–6403, 2018.

[20] W. U. Bajwa, J. Haupt, A. M. Sayeed, and R. Nowak, “Compressed channel sensing: A new approach to estimating sparse multipath channels,” Proc. IEEE, vol. 98, no. 6, pp. 1058–1076, 2010.

[21] J. Dai, A. Liu, and V. K. Lau, “FDD massive MIMO channel estimation with arbitrary 2D-array geometry,” IEEE Trans. Signal Process., vol. 66, no. 10, pp. 2584–2599, 2018.

[22] Y. Lin, S. Jin, M. Matthaiou, and X. You, “Tensor-based channel estimation for millimeter wave MIMO-OFDM with dual-wideband effects,” IEEE Trans. Commun., vol. 68, no. 7, pp. 4218–4232, 2020.

[23] A. Alkhateeb, O. El Ayach, G. Leus, and R. W. Heath, “Channel estimation and hybrid precoding for millimeter wave cellular systems,” IEEE J. Sel. Topics Signal Process., vol. 8, no. 5, pp. 831–846, 2014.

[24] J. Li and P. Stoica, “Efficient mixed-spectrum estimation with applications to target feature extraction,” IEEE Trans. Signal Process., vol. 44, no. 2, p. 281–295, 1996.

[25] M. Shao and X. Fu, “Massive MIMO channel estimation via compressed and quantized feedback,” in 2022 56th Asilomar Conf. Signals, Syst., Comput., 2022, pp. 1016–1020.

[26] R. W. Heath, N. González-Prelcic, S. Rangan, W. Roh, and A. M. Sayeed, “An overview of signal processing techniques for millimeter wave MIMO systems,” IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 436–453, 2016.

[27] P. Stoica and R. L. Moses, Spectral analysis of signals. Upper Saddle River, N.J.: Pearson/Prentice Hall Upper Saddle River, N.J., 2005.

[28] J. Liu, X. Liu, and X. Ma, “Multidimensional frequency estimation with finite snapshots in the presence of identical frequencies,” IEEE Trans. Signal Process., vol. 55, no. 11, pp. 5179–5194, 2007.

[29] Z. Sha, Z. Wang, and S. Chen, “Harmonic retrieval based baseband channel estimation for millimeter wave OFDM systems,” IEEE Trans. Veh. Tech., vol. 68, no. 3, pp. 2668–2681, 2019.

[30] D. Nion and N. D. Sidiropoulos, “Tensor algebra and multidimensional harmonic retrieval in signal processing for MIMO radar,” IEEE Trans. Signal Process., vol. 58, no. 11, pp. 5693–5705, 2010.

[31] S. P. Lipshitz, R. A. Wannamaker, and J. Vanderkooy, “Quantization and dither: A theoretical survey,” J. Audio Engineer. Society, vol. 40, no. 5, pp. 355–375, 1992.

[32] R. Wannamaker, S. Lipshitz, J. Vanderkooy, and J. Wright, “A theory of nonsubtractive dither,” IEEE Trans. Signal Process., vol. 48, no. 2, pp. 499–516, 2000.

[33] S. Timilsina, S. Shrestha, and X. Fu, “Quantized radio map estimation using tensor and deep generative models,” IEEE Trans. Signal Process., 2023.

[34] R. A. Horn and C. R. Johnson, Topics in Matrix Analysis. Cambridge University Press, 1991.

[35] S. Shalev-Shwartz and S. Ben-David, Understanding Machine Learning: From Theory to Algorithms. USA: Cambridge University Press, 2014.

[36] M. A. Davenport, Y. Plan, E. van den Berg, and M. Wootters, “1-bit matrix completion,” Inf. Inference: J. IMA, vol. 3, no. 3, pp. 189–223, 2014.

[37] N. Ghadermarzy, Y. Plan, and O. Yilmaz, “Learning tensors from partial binary measurements,” IEEE Trans. Signal Process., vol. 67, no. 1, pp. 29–40, 2018.

[38] C. Lee and M. Wang, “Tensor denoising and completion based on ordinal observations,” in Proc. Int. Conf. Mach. Learn. (ICML). PMLR, 2020, pp. 5778–5788.

[39] G. Zhang, X. Fu, J. Wang, X.-L. Zhao, and M. Hong, “Spectrum cartography via coupled block-term tensor decomposition,” IEEE Trans. Signal Process., vol. 68, pp. 3660–3675, 2020.

[40] S. Shrestha, X. Fu, and M. Hong, “Deep spectrum cartography: Completing radio map tensors using learned neural models,” IEEE Trans. Signal Process., vol. 70, pp. 1170–1184, 2022.

[41] Y. Plan and R. Vershynin, “Robust 1-bit compressed sensing and sparse logistic regression: A convex programming approach,” IEEE Trans. Inf. Theor., vol. 59, no. 1, p. 482–494, Jan. 2013.

[42] P. T. Boufounos, L. Jacques, F. Krahmer, and R. Saab, “Quantization and compressive sensing,” in Proc. Compressed Sensing Its Appl.: MATHEON Workshop. Springer, 2015, pp. 193–237.

[43] C. Xu and L. Jacques, “Quantized compressive sensing with RIP matrices: the benefit of dithering,” Inf. Inference: J. IMA, vol. 9, no. 3, pp. 543–586, 11 2019.

[44] R. Saab, R. Wang, and Ö. Yılmaz, “Quantization of compressive samples with stable and robust recovery,” Applied and Computational Harmonic Analysis, vol. 44, no. 1, pp. 123–143, 2018.

[45] A. Bora, A. Jalal, E. Price, and A. G. Dimakis, “Compressed sensing using generative models,” in Proc. Int. Conf. Mach. Learn. (ICML). PMLR, 2017, pp. 537–546.

[46] S. Boyd, N. Parikh, E. Chu, B. Peleato, and J. Eckstein, “Distributed optimization and statistical learning via the alternating direction method of multipliers,” Foundations Trends Mach. Learn., vol. 3, pp. 1–122, 01 2011.

[47] A. Zymnis, S. Boyd, and E. Candes, “Compressed sensing with quantized measurements,” IEEE Signal Process. Lett., vol. 17, no. 2, pp. 149–152, 2009.

[48] A. Mezghani, F. Antreich, and J. A. Nossek, “Multiple parameter estimation with quantized channel output,” in 2010 International ITG Workshop on Smart Antennas (WSA), 2010, p. 143–150.

[49] M. Shao, W.-K. Ma, J. Liu, and Z. Huang, “Accelerated and deep expectation maximization for one-bit MIMO-OFDM detection,” IEEE Trans. Signal Process., 2024.

[50] A. Alkhateeb, “DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications,” in Proc. of Information Theory and Applications Workshop (ITA), San Diego, CA, Feb 2019, pp. 1–8.

[51] H. Sun, Z. Zhao, X. Fu, and M. Hong, “Limited feedback double directional massive MIMO channel estimation: From low-rank modeling to deep learning,” in Proc. IEEE 19th Int. Workshop Signal Process. Advances Wireless Commun. (SPAWC), 2018.

[52] J. Mo, P. Schniter, N. G. Prelcic, and R. W. Heath, “Channel estimation in millimeter wave MIMO systems with one-bit quantization,” in Proc. 48th Asilomar Conf. Signals, Syst., Comput. IEEE, 2014, pp. 957–961.

[53] J. Mo, P. Schniter, and R. W. Heath, “Channel estimation in broadband millimeter wave MIMO systems with few-bit ADCs,” IEEE Trans. Signal Process., vol. 66, no. 5, pp. 1141–1154, 2018.

[54] Remcom, “Wireless InSite,” http://www.remcom.com/wireless-insite.

[55] R. Baraniuk, M. Davenport, R. DeVore, and M. Wakin, “A simple proof of the restricted isometry property for random matrices,” Constructive Approximation, vol. 28, no. 3, p. 253–263, 2008.

[56] P. L. Bartlett, D. J. Foster, and M. J. Telgarsky, “Spectrally-normalized margin bounds for neural networks,” Advances Neural Inf. Process. Systems (NeurIPS), vol. 30, 2017.

[57] R. Vershynin, “Introduction to the non-asymptotic analysis of random matrices,” arXiv preprint arXiv:1011.3027, 2010.

[58] Y. Cao and Y. Xie, “Categorical matrix completion,” in Proc. IEEE 6th Int. Workshop Comput. Advances Multi-Sensor Adaptive Process. (CAMSAP). IEEE, 2015, pp. 369–372.

[59] R. T. Rockafellar and R. J.-B. Wets, Variational Analysis. Springer Science & Business Media, 2009, vol. 317.

[60] T. D. Ahle, M. Kapralov, J. B. Knudsen, R. Pagh, A. Velingker, D. P. Woodruff, and A. Zandieh, “Oblivious sketching of high-degree polynomial kernels,” in Proc. 14th Annual ACM-SIAM Symposium Discrete Algorithms. SIAM, 2020, pp. 141–160.

[61] S. Ibrahim, X. Fu, and X. Li, “On recoverability of randomly compressed tensors with low CP rank,” IEEE Signal Process. Lett., vol. 27, pp. 1125–1129, 2020.

**本页范围与校对状态：** 本页为 arXiv:2411.16043v2 的全文中文译稿，覆盖摘要、正文第 I–VII 节（含贡献、两种压缩方案、可恢复性分析（定理 1–2、注 1–4、事实 1–3）、REDEEM 算法（Mod-RELAX 与 EM 子问题）、基本仿真与 DeepMIMO 仿真）、结论、致谢与资助说明、主体附录 A–C、补充材料附录 D–J、图 1–14 图注、表 I 逐格与参考文献 [1]–[61]。公式编号沿用原文（1）–（60），其中 ADMM 更新式记为 (29a)–(29c)、引理 5 的谱范数推导记为 (60a)–(60c)。关键公式已用 PDF 第 4、5、8 页渲染图核对（方案 2 的 (11)–(15)、可恢复性预备 (16)–(25)、性能指标 (39)(40) 与仿真设置）。原文中 $\mathbf H$ 在式 (6) 处表示复信道的实值堆叠矩阵，与信道矩阵同名，已加注说明；EM 上界与 M 步中的噪声方差按原文记作 $\sigma_v$（式 (37) 抽取文本处符号略简，已按 (35) 的 $\sigma_v$ 统一）。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。如发现公式排版或个别符号与 PDF 不一致，以原文 PDF 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
