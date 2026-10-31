---
layout: page
title: "过扩张多普勒 OTFS 系统的信道估计｜中文全文译文"
permalink: /papers/translations/2026-10-26-2608-12524-channel-estimation-for-otfs-systems-with-overspread-doppler-shifts/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a67500334e77fc04/) · [原文 arXiv](https://arxiv.org/abs/2608.12524) · [全部目录](/papers/catalog/)

# 过扩张多普勒 OTFS 系统的信道估计

**原题：** Channel Estimation for OTFS Systems With Overspread Doppler Shifts  
**作者：** Preety Priya（Member, IEEE）、Yi Hong（Senior Member, IEEE）、Emanuele Viterbo（Fellow, IEEE）  
**单位：** Preety Priya 就职于印度矿业学院（IIT (ISM) Dhanbad）电子工程系（Dhanbad 826004，印度；邮箱：preetypriya@iitism.ac.in）；Yi Hong 与 Emanuele Viterbo 就职于澳大利亚莫纳什大学电气与计算机系统工程系（Clayton, VIC 3800；邮箱：yi.hong@monash.edu、emanuele.viterbo@monash.edu）。  
**资助：** 本研究受澳大利亚研究理事会（ARC）Discovery 项目 DP260101376 资助；P. Priya 的工作部分受 IIT (ISM) Dhanbad 的教师研究计划（FRS）Grant MISC 0279 资助。  
**版本：** IEEE Transactions on Wireless Communications（页眉标注 VOL. XX, NO. XX, 2025）；arXiv:2608.12524v1（eess.SP），14 页。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—V 节（含 II、III-A—III-D、IV-A—IV-C 及 Remark、V）、附录 A（第二级信道估计算法）、图 1—15 中文图注、表 I 逐格转录、参考文献 [1]—[28]（英文原条目，按原编号）、作者简介均按原文结构录入；编号公式 (1)—(38) 按原文保留。逐句逐式终校未做。

## 摘要

本文考虑存在**过扩张多普勒频移**（overspread Doppler shifts，常见于非地面多卫星链路）的时变信道中的正交时频空间（OTFS）系统。幅度大于子载波间隔一半的过扩张多普勒频移，会因 OTFS 的取模操作在时延—多普勒（DD）域产生**混叠多普勒频移**，使信道估计非常困难，传统信道估计方法因此失效。为应对该挑战，我们提出一种 DD 训练帧与两级信道估计方法。该训练帧由一个**余弦导频信号**与一个导频符号组成。在信道估计的第一级，利用 DD 域的导频符号估计传播路径的时延、混叠多普勒频移与信道增益；在第二级，把接收时域信号变换到频域，利用余弦导频信号检测所有多普勒频移的峰值；随后提出一种基于阈值的方法，把估计出的真实多普勒频移与其对应的时延和信道增益配对。本文还讨论了所提信道估计的复杂度。最后，在多种场景下以归一化均方误差（NMSE）与误比特率（BER）验证所提信道估计的性能。

**索引词：** OTFS、信道估计、过扩张多普勒、低地球轨道卫星通信。

## I. 引言

从第五代（5G）到第六代（6G）无线技术的演进，预计将带来网络能力的实质提升，尤其是在移动性支持方面：覆盖范围从高移动扩展到超高移动场景，如低地球轨道（LEO）卫星通信与低空飞行平台 [1]。在高移动通信环境中，无线信道可刻画为具有多径时延与严重多普勒频移的时变信道，传统 OFDM 波形在此类环境中效果较差。近期进展表明，正交时频空间（OTFS）调制能在这种高度动态环境中提供稳健性能，尤其能对抗严重的多普勒频移 [2]、[3]。OTFS 的核心思想是把信息符号复用到时延—多普勒（DD）域，从而刻画时变无线信道的稀疏性 [3]。该操作把信息符号有效扩展到整个时频资源上，使 OTFS 波形能够获得最大的有效信道分集 [4]。于是 OTFS 把（由移动性与多径造成的）时频选择性信道转化为时间无关的二维（2D）信道。

在 OTFS 的 DD 域中，信道响应在时延与多普勒两个维度上都是稀疏的 [5]。该特性简化了信道估计，并支持低复杂度均衡器设计。已有若干针对 OTFS 的信道估计方法，包括嵌入导频辅助方法 [6]–[10]、叠加导频方法 [11]、[12]、基于学习的方法 [13]、大规模 MIMO 专用方法 [14]–[16]、稀疏贝叶斯学习 [17]–[19]，以及针对分数时延/多普勒的方法 [16]、[19]。大多数方法假设信道是**欠扩张**的（underspread，即最大时延与最大多普勒之积小于 1），此时导频与数据的保护间隔足以避免干扰。

然而，在 LEO 卫星与低空飞行平台等超高移动场景中，多普勒频移可能非常大。由于多颗卫星以差异很大的速度同时传输相同信号（取决于各卫星运动方向），多普勒频移的幅度可能超过子载波间隔的一半。这种**过扩张多普勒**（$\tau_{\max}\nu_{\max}>1$）也会出现在高移动宽带系统的多普勒斜视效应中：多普勒频移随子载波频率变化，导致与信号带宽成正比的额外多普勒扩展 [26]；不过本文考虑窄带 OTFS 系统模型，因此不考虑多普勒斜视。

幅度大于子载波间隔一半的过扩张多普勒频移，会因 OTFS 的取模操作在 DD 域产生混叠多普勒频移，使数据帧内的嵌入导频信道估计极具挑战。若假设 DD 信道响应在跨多帧的时间尺度内平稳，则可定期发送专用导频帧来应对该挑战。[24] 中基于双 chirp 时域相关的方法不适用于过扩张多普勒估计，因为相关运算本质上估计的是时间偏移而非频率偏移。

为解决过扩张多普勒信道估计问题，我们设计了一种新的训练帧方案，并提出两级信道估计。具体地，训练帧在 DD 域中除一个高功率导频符号外，还包含一个余弦导频信号。选择余弦导频正是为了便于过扩张多普勒估计，因为其 FFT 会在真实多普勒频移处产生清晰的谱峰。在信道估计第一级，导频用于估计各路径的时延、混叠多普勒频移与信道增益；在第二级，把接收时域信号变换到频域，利用余弦导频信号检测所有多普勒频移的峰值；随后给出基于阈值的方法，把估计的真实多普勒频移与其对应的时延和信道增益配对。本文还讨论了所提信道估计的复杂度。最后，在多种场景下以 NMSE 与 BER 验证所提信道估计的性能。

本文后续结构如下：第 II 节描述系统模型；第 III 节针对过扩张多普勒信道提出两级信道估计方案；第 IV 节给出结果与讨论；第 V 节总结。

**记号。** $x$、$\mathbf x$、$\mathbf X$ 分别表示标量、向量与矩阵；$(\cdot)^H$、$(\cdot)^T$、$|\cdot|$、$[\cdot]_M$ 分别表示 Hermitian、转置、模与模 $M$ 运算；$\mathbf X[m,n]$ 表示矩阵 $\mathbf X$ 第 $m$ 行第 $n$ 列元素，$x[n]$ 表示向量 $\mathbf x$ 的第 $n$ 个元素；$\operatorname{vec}(\mathbf A)$ 表示矩阵 $\mathbf A$ 的按列向量化，$\operatorname{vec}^{-1}(\mathbf a)$ 为其逆操作；$\mathcal B$ 表示集合、$|\mathcal B|$ 为集合基数；$\jmath$ 表示虚数单位 $\sqrt{-1}$；$\mathbf F_M$ 为 $M$ 点归一化离散 Fourier 变换（DFT）矩阵，元素为 $\mathbf F_M[m,n]=\frac{1}{\sqrt M}e^{-\jmath2\pi mn/M}$；$O(\cdot)$ 表示 Big-O 记号，$\mathbb E[\cdot]$ 为期望算子。

## II. 系统模型

我们考虑在多径时变信道（受很强多普勒频移影响）中工作的 OTFS 系统。假设信道有 $L$ 条路径，所有路径中最大时延为 $\tau_{\max}$、最大多普勒频移为 $\nu_{\max}$。OTFS 帧由 $N$ 个时隙（块）组成，每块含 $M$ 个样本，故每帧共 $MN$ 个样本。设子载波间隔为 $\Delta f$、块持续时间为 $T=1/\Delta f$，则每帧持续时间为 $T_f=NT$、占用带宽 $B=M\Delta f$。

在 DD 域中，对 $i\in[0,L-1]$，第 $i$ 条时变信道路径由复增益 $h_i$、归一化时延 $\tau_i=\frac{l_i}{M\Delta f}$ 与归一化多普勒频移 $\nu_i=\frac{k_i}{NT}$ 表征，归一化最大时延/多普勒分别为 $l_{\max}=M\Delta f\tau_{\max}$ 与 $k_{\max}=NT\nu_{\max}$。

全文中我们假设时延与多普勒分辨率足够高，因此只考虑**整数**归一化时延与多普勒频移。与欠扩张信道（$\tau_{\max}\nu_{\max}<1$）不同，本文假设**过扩张**信道（$\tau_{\max}\nu_{\max}>1$）具有很高的多普勒频移，即对所有 $i$ 有 $l_i<M$，且对某些 $i$ 有 $|k_i|\geq N/2$。

发射端把一组 $Q$ 阶 QAM 调制、平均能量为 $E_s$ 的信息符号映射到 DD 域，记为 $\mathbf X\in\mathbb C^{M\times N}$，再经逆离散 Zak 变换（IDZT）变换为时域样本向量 $\mathbf s\in\mathbb C^{MN\times1}$ [3]：

$$
\mathbf s\triangleq\operatorname{IDZT}(\mathbf X)=\operatorname{vec}\left(\mathbf X\mathbf F_N^H\right)=\operatorname{vec}\left(\widetilde{\mathbf X}\right)\in\mathbb C^{MN\times1},\tag{1}
$$

其中

$$
\widetilde{\mathbf X}=\left[\widetilde{\mathbf x}_0^T,\ldots,\widetilde{\mathbf x}_{M-1}^T\right]^T=\mathbf X\mathbf F_N^H\in\mathbb C^{M\times N}
$$

表示时延—时间（DT）样本矩阵，$\widetilde{\mathbf x}_m\in\mathbb C^{N\times1}$（$m\in[0,M-1]$）为 DT 样本向量。

接收端用 DZT 把时域样本向量 $\mathbf r\in\mathbb C^{MN\times1}$ 变换回 DD 域：

$$
\mathbf Y\triangleq\operatorname{DZT}(\mathbf r)=\operatorname{vec}^{-1}(\mathbf r)\mathbf F_N=\widetilde{\mathbf Y}\mathbf F_N\in\mathbb C^{M\times N},\tag{2}
$$

其中 $\widetilde{\mathbf Y}=[\widetilde{\mathbf y}_0^T,\ldots,\widetilde{\mathbf y}_{M-1}^T]^T=\operatorname{vec}^{-1}(\mathbf r)\in\mathbb C^{M\times N}$ 为接收 DT 样本矩阵，$\widetilde{\mathbf y}_m\in\mathbb C^{N\times1}$（$m\in[0,M-1]$）为接收 DT 样本向量。

按照 [3]，第 $m$ 个时延与第 $n$ 个多普勒索引处的接收 DD 样本可表示为

$$
Y[m,n]\approx\sum_{i=0}^{L-1}h_ie^{\jmath\frac{2\pi}{MN}(m-l_i)k_i}\xi_i[m,n]X\left[[m-l_i]_M,[n-k_i]_N\right],\tag{3}
$$

其中

$$
\xi_i[m,n]=\begin{cases}1,&l_i\leq m<M,\\[2pt]\dfrac{N-1}{N}e^{-\jmath2\pi\left(\frac{[n-k_i]_N}{N}\right)},&0\leq m<l_i.\end{cases}\tag{4}
$$

## III. 过扩张多普勒频移下的信道估计

本节描述所提训练帧结构及相应的过扩张多普勒时变信道两级信道估计。

### A. 所提训练帧

考虑一个离散时间余弦导频信号

$$
c[m]=A\cos\left(\frac{2\pi f_0}{M}m\right),\qquad m=0,\ldots,M-1,
$$

以 $T_s=\frac{1}{M\Delta f}$ 采样，振幅为 $A$，归一化离散频率 $f_0=f/\Delta f$ 对应余弦频率 $f$。我们选择 $f_0<M\in\mathbb Z$，以确保在 $M$ 个样本内有整数个周期，从而避免频谱泄漏。注意 $M>k_{\max}$ 保证最大过扩张多普勒频移能在频域峰值检测中被识别。所提 DD 训练帧的构造方式为：把余弦导频信号放入第一个块，并在第一个网格处放置单个高功率导频 $x_p$（$|x_p|^2\gg A^2$）：

$$
\mathbf X_t[m,n]=\begin{cases}c[0]+x_p,&m=0,\ n=0,\\[2pt]c[m],&m\in[1,M-1],\ n=0,\\[2pt]0,&\text{其他},\end{cases}\tag{5}
$$

对 $n\in[0,N-1]$，由此得到时域训练信号向量

$$
\mathbf s_t\triangleq\operatorname{IDZT}(\mathbf X_t)=\operatorname{vec}\left(\mathbf X_t\mathbf F_N^H\right)\in\mathbb C^{MN\times1}.\tag{6}
$$

相应的时域接收训练信号 $r_t[q]$（$q\in[0,MN-1]$）为

$$
r_t[q]=\sum_{i=0}^{L-1}g[l_i,q]s_t[q-l_i]=\sum_{i=0}^{L-1}h_ie^{\jmath\frac{2\pi}{MN}k_i(q-l_i)}s_t[q-l_i]+w[q],\tag{7}
$$

其中

$$
g[l_i,q]=h_ie^{\jmath\frac{2\pi}{MN}k_i(q-l_i)},\qquad\forall i\tag{8}
$$

是时变信道抽头，$w[q]$ 是均值为零、方差为 $\sigma_w^2$ 的加性白高斯噪声（AWGN）样本。进而，DD 域接收训练矩阵 $\mathbf Y_t\in\mathbb C^{M\times N}$ 由 [3] 给出：

$$
\mathbf Y_t\triangleq\operatorname{DZT}(\mathbf r_t)=\operatorname{vec}^{-1}(\mathbf r_t)\mathbf F_N.\tag{9}
$$

接下来给出**仅发送余弦导频信号**时的时域接收训练信号表达式，后文将用于过扩张信道估计。此时 DT 发射样本矩阵的元素为

$$
\widetilde{\mathbf X}_c[m,n]=\frac{c[m]}{\sqrt N}=\frac{A}{\sqrt N}\cos\left(\frac{2\pi f_0}{M}m\right),\tag{10}
$$

从而时域发射样本向量为

$$
s_c[q]=\frac{A}{\sqrt N}\cos\left(\frac{2\pi f_0}{M}(q-nM)\right),\qquad q\in[0,MN-1].\tag{11}
$$

因此接收信号为

$$
r_c[q]=\frac{A}{\sqrt N}\sum_{i=0}^{L-1}h_ie^{\jmath\frac{2\pi}{MN}k_i(q-l_i)}\cos\left(\frac{2\pi f_0}{M}(q-nM-l_i)\right)+w[q].\tag{12}
$$

把余弦函数用 Euler 公式写成指数形式并经过若干数学整理后，（12）可改写为

$$
r_c[q]=\frac{A}{2\sqrt N}\sum_{i=0}^{L-1}h_ie^{\jmath\frac{2\pi}{MN}k_i(q-l_i)}\left(e^{\jmath2\pi\frac{f_0}{M}(q-l_i)}e^{-\jmath2\pi f_0n}+e^{-\jmath2\pi\frac{f_0}{M}(q-l_i)}e^{\jmath2\pi f_0n}\right)+w[q].\tag{13}
$$

由于 $f_0$ 与 $n$ 为整数，对所有 $n$ 有 $e^{\jmath2\pi f_0n}=e^{-\jmath2\pi f_0n}=1$，因此

$$
r_c[q]=\frac{A}{2\sqrt N}\sum_{i=0}^{L-1}h_i\left(e^{\jmath2\pi(q-l_i)\left(\frac{k_i}{MN}+\frac{f_0}{M}\right)}+e^{\jmath2\pi(q-l_i)\left(\frac{k_i}{MN}-\frac{f_0}{M}\right)}\right)+w[q].\tag{14}
$$

### B. 所提两级信道估计

令

$$
k_i'=\begin{cases}k_i,&|k_i|<\dfrac N2,\\[4pt][k_i]_N,&\text{其他},\end{cases}\tag{15}
$$

它可视为 DD 域中的多普勒频移；由于 $|k_i'|<N/2$，全文中称之为**混叠多普勒频移**。

图 1 针对以下情形给出 DD 域接收导频回波示意（这些情形也适用于两条以上路径）。

- **情形 1**：路径具有相同时延、且混叠多普勒频移重合，如路径 $\{3,4\}$ 与 $\{7,8\}$。
- **情形 2**：路径时延不同、但混叠多普勒频移重合，如路径 $\{3,5\}$、$\{2,6\}$ 与 $\{4,5\}$。
- **情形 3**：路径时延不同、且混叠多普勒频移也不同，如路径 0 与 1。

传统嵌入导频信道估计只能处理未扩张多普勒（如路径 0）。为处理其余所有情形，我们提出两级信道估计方法，其流程如图 2 所示、伪代码见算法 1。

令 $\hat k_i'$ 表示估计的混叠多普勒频移。在第一级，采用嵌入导频信道估计，在 DD 域估计第 $i$ 条路径的混叠多普勒频移 $\hat k_i'$、时延 $\hat l_i$ 与信道增益 $\hat h_i$。在第二级，把接收的时域余弦导频信号变换到频域。由于余弦导频信号的峰值在频域中出现在真实多普勒频移处，我们能精化多普勒估计，并利用第一级所得估计把其与对应时延、路径增益准确配对。

**算法 1：两级信道估计。** 输入：$\mathbf r_t$、$\mathbf s_t$、$\mathbf Y_t$、$\alpha$、$\sigma_w^2$；输出：路径列表 $\mathcal H=\{(\hat l_j,\hat k_j,\hat h_j)\}$。

1. 初始化：路径列表 $\mathcal H=\{\}$、集合 $\mathcal A=\{\}$、$\iota=1$。
2. 【第一级信道估计】
3. 对 $n=0$ 到 $N-1$：
4.   用（17）计算 $P[n]$。
5.   对 $m=0$ 到 $M-1$：
6.     若 $|Y_t[m,n]|^2>\mathcal A+\alpha P[n]$，则：
7.       $\mathcal L_{\hat k_\iota'}=\{\}$、$\mathcal G_{\hat k_\iota'}=\{\}$、$\lambda\leftarrow1$。
8.       $\hat k_\iota'=n$、$\mathcal A\leftarrow\mathcal A\cup\{\hat k_\iota'\}$。
9.       $\hat l_\lambda(\hat k_\iota')=m$、$\mathcal L_{\hat k_\iota'}\leftarrow\mathcal L_{\hat k_\iota'}\cup\{\hat l_\lambda(\hat k_\iota')\}$。
10.      用（18）计算 $\hat h_\lambda(\hat k_\iota')$。
11.      $\mathcal G_{\hat k_\iota'}\leftarrow\mathcal G_{\hat k_\iota'}\cup\{\hat h_\lambda(\hat k_\iota')\}$；$\lambda\leftarrow\lambda+1$。
12.  $\iota\leftarrow\iota+1$。
13. 【第二级信道估计】
14. 调用 `CosineFreqPeak`$(\mathbf r_t,\gamma,\delta,x_p,\sigma_w^2,f_0,M,N,\mathcal H,\mathcal A,\mathcal L_{\hat k_\iota'},\mathcal G_{\hat k_\iota'},\forall\iota)$（流程见附录 A）。
15. 返回 $\mathcal H$。


**1) 第一级。** （5）的训练帧安排使 DD 域接收信号矩阵同时包含导频与余弦导频信号的回波，可进一步写为（16），其中（4）中的 $\xi_i[m,n]$ 在 $n=k_i'=[k_i]_N$ 时简化为

$$
\xi_i[m,n]=\begin{cases}1,&l_i\leq m<M,\\[2pt]\dfrac{N-1}{N},&0\leq m<l_i.\end{cases}
$$

$$
Y_t[m,n]=\begin{cases}h_i(A+x_p)+w[m,n],&m=l_i,\ n=k_i'=[k_i]_N,\\[2pt]Ah_ie^{\jmath\frac{2\pi}{MN}k_i(m-l_i)}\xi_i[m,n]\cos\left(\frac{2\pi f_0}{M}[m-l_i]_M\right)+w[m,n],&m\neq l_i,\ n=k_i'=[k_i]_N,\\[2pt]w[m,n],&\text{其他}.\end{cases}\tag{16}
$$

（脚注：时延与混叠多普勒频移都相同的多条路径被忽略，因为它们在 DD 域不可区分，将在后续估计级中被分辨。）

基于（16），接收信号在对应时延与混叠多普勒频移处呈现导频回波；此外，余弦导频信号 $\{c[m]\}_{m=0}^{M-1}$ 在索引 $m=[0,M-1]$ 的所有时延抽头上被回波，对应混叠多普勒索引 $k_i'$。其余接收 DD 信号样本只含噪声。因此，为识别回波导频位置，我们采用自适应阈值 $T_n=A+\alpha P[n]$（$\alpha>0$），其中

$$
P[n]=\frac1M\sum_{m=0}^{M-1}\left|Y_t[m,n]\right|^2.\tag{17}
$$

自适应阈值 $T_n$ 可排除所有只含噪声以及只含（叠加噪声的）余弦导频信号的 DD 网格点。记初始估计的混叠多普勒频移 $\hat k_\iota'$（$\forall\iota$）及相应估计路径增益与延迟集合分别为 $\mathcal A$、$\mathcal G_{\hat k_\iota'}$ 与 $\mathcal L_{\hat k_\iota'}$。

在 $\left|Y_t[m,n]\right|^2>T_n$ 时，可得混叠多普勒频移估计 $\hat k_\iota'$、所有对应时延 $\hat l_\lambda(\hat k_\iota')$ 及对应该时延的路径增益，即

$$
\hat k_\iota'=n,\qquad \hat l_\lambda(\hat k_\iota')=m,\qquad \hat h_\lambda(\hat k_\iota')=\frac{Y_t[\hat l_\lambda(\hat k_\iota'),\hat k_\iota']}{A+x_p},\tag{18}
$$

其中 $\lambda$ 为估计时延/对应路径增益估计的索引。

**2) 第二级。** 为获得余弦导频信号回波在真实多普勒频率处的峰值，我们先从接收训练向量 $\mathbf r_t$ 中去除高功率导频样本以分离接收余弦导频信号 $\mathbf r_c$。这通过在 DT 接收训练帧中于已识别时延位置插入零来实现：

$$
\widetilde{\mathbf Y}_c[m,n]=\begin{cases}0,&m=\hat l_\lambda(\hat k_\iota'),\ n\in\{0,N-1\},\\[2pt]\widetilde{\mathbf Y}_t[m,n],&\text{其他},\end{cases}\tag{19}
$$

其中 $\widetilde{\mathbf Y}_t=\mathbf Y_t\mathbf F_N^{-1}$ 是上述插零前的 DT 域接收训练矩阵。接收余弦向量随后为

$$
\check{\mathbf r}_c=\operatorname{vec}\left(\widetilde{\mathbf Y}_c\right).\tag{20}
$$

所得时域接收余弦导频信号再用 $MN$ 点 DFT 变换到频域：

$$
R[f]=\frac{1}{\sqrt{MN}}\sum_{q=0}^{MN-1}\check r_c[q]e^{-\jmath\frac{2\pi}{MN}fq}.\tag{21}
$$

把（14）代入（21）并整理得

$$
R[f]=\frac{A}{2N\sqrt M}\sum_{i=0}^{L-1}h_i\times\left(e^{-\jmath2\pi\left(\frac{k_i}{MN}+\frac{f_0}{M}\right)l_i}\underbrace{\sum_{q=0}^{MN-1}e^{\jmath2\pi\left(\frac{k_i}{MN}+\frac{f_0}{M}-\frac{f}{MN}\right)q}}_{(a)}+e^{-\jmath2\pi\left(\frac{k_i}{MN}-\frac{f_0}{M}\right)l_i}\underbrace{\sum_{q=0}^{MN-1}e^{\jmath2\pi\left(\frac{k_i}{MN}-\frac{f_0}{M}-\frac{f}{MN}\right)q}}_{(b)}\right)+W[f],\tag{22}
$$

其中 $f=-\frac{MN}{2}+1,\ldots,\frac{MN}{2}$。当 $\left(\frac{k_i}{MN}+\frac{f_0}{M}-\frac{f}{MN}\right)=0$ 与 $\left(\frac{k_i}{MN}-\frac{f_0}{M}-\frac{f}{MN}\right)=0$ 时，项 (a) 与 (b) 分别等于 $MN$，否则两项均为零。因此

$$
R[f]=\begin{cases}\dfrac{A\sqrt M}{2}h_ie^{-\jmath\frac{2\pi}{MN}fl_i}+W[f],&f=k_i+f_0N,\\[6pt]\dfrac{A\sqrt M}{2}h_ie^{-\jmath\frac{2\pi}{MN}fl_i}+W[f],&f=k_i-f_0N,\\[6pt]W[f],&\text{其他}.\end{cases}\tag{23}
$$

基于（23），真实多普勒频移可按

$$
\hat k_i=f-f_0N,\qquad\text{若 }|R[f]|^2>\gamma\sigma_w^2,\quad\gamma>0,\tag{24}
$$

在 $f=0,\ldots,\frac{MN}{2}$ 上计算。注意由（23）可推出，$f=\left[-\frac{MN}{2}+1,-1\right]$ 范围内识别出的多普勒频移是 $f=\left[0,\frac{MN}{2}\right]$ 的混叠对应物，故可忽略。

令 $\mathcal K=\{\hat k_i,\ i=0,\ldots,L-1\}$ 为基于（24）的全部真实多普勒频移集合。接下来需利用 $\mathcal A$、$\mathcal K$、$\mathcal L(\hat k_\iota')$ 与 $\mathcal G(\hat k_\iota')$（$\forall\iota$）把估计的真实多普勒频移与其对应时延、信道增益配对，步骤如下（均汇总为附录中的第二级信道估计算法）。

- **步骤 1**：确定 $\mathcal K$ 中各估计真实多普勒频移对应的混叠多普勒频移，构成集合

$$
\bar{\mathcal K}=\left\{\bar k_i=[\hat k_i]_N,\ \text{对所有 }\hat k_i\in\mathcal K\right\}.\tag{25}
$$

记 $\bar{\mathcal K}$ 中唯一元素构成的集合为 $\widetilde{\mathcal K}=\{\bar k_{\tilde i}\}$。

- **步骤 2**：对每个 $\tilde i=1,\ldots,|\widetilde{\mathcal K}|$，定义混叠后与 $\bar k_{\tilde i}$ 重合的多普勒列表 $\mathcal K_{\tilde i}=\{\hat k_i:[\hat k_i]_N=\bar k_{\tilde i}\}$，其元素记为 $\hat k_\beta(\bar k_{\tilde i})$（$\beta=1,\ldots,|\mathcal K_{\tilde i}|$）。然后对每个 $\bar k_{\tilde i}$，在 $\mathcal A$ 中找出满足 $\hat k_\iota'=\bar k_{\tilde i}$ 的 $\iota$。
- **步骤 3**：若 $|\mathcal K_{\tilde i}|=1$，则混叠多普勒频移 $\bar k_{\tilde i}=\hat k_\iota'$ 唯一（如情形 3），故 $|\mathcal L_{\hat k_\iota'}|=1$，于是估计

$$
\hat l_j=\hat l_1(\hat k_\iota'=\bar k_{\tilde i}),\qquad \hat k_j=\hat k_1(\bar k_{\tilde i}),\qquad \hat h_j=\hat h_1(\hat k_\iota'),\tag{26}
$$

并将其加入信道估计路径列表 $\mathcal H=\{\hat l_j,\hat k_j,\hat h_j\}$。

- **步骤 4**：若 $|\mathcal K_{\tilde i}|=|\mathcal L_{\hat k_\iota'}|>1$，即多条路径具有相同混叠多普勒频移但时延不同（如情形 2），则对每个时延，从候选多普勒集 $\mathcal K_{\tilde i}$ 中选择使"由（23）重建的信道增益幅度与第一级对应该时延的信道增益估计幅度之绝对差"最小的真实多普勒频移，即选择多普勒索引

$$
\beta^{\star}(\lambda)=\arg\min_\beta\left|\left|\frac{2}{A\sqrt M}R\left(\hat k_\beta(\bar k_{\tilde i})+f_0N\right)\right|-\left|\hat h_\lambda(\hat k_\iota')\right|\right|=\arg\min_\beta\left|\left|\hat h_i\right|-\left|\hat h_\lambda(\hat k_\iota')\right|\right|,\tag{27}
$$

对 $\beta=1,\ldots,|\mathcal K_{\tilde i}|$ 求得估计 $\hat l_j=\hat l_\lambda(\hat k_\iota'=\bar k_{\tilde i})$、$\hat k_j=\hat k_{\beta^{\star}(\lambda)}(\bar k_{\tilde i})$、$\hat h_j=\hat h_\lambda(\hat k_\iota')$。该条件选出这样的时延—多普勒与信道增益组合：其由（23）重建的信道增益幅度最接近该时延对应第一级信道增益估计 $\hat h_\lambda(\hat k_\iota')$ 的幅度。将这些估计按（26）加入路径列表 $\mathcal H$。

- **步骤 5**：若 $|\mathcal K_{\tilde i}|>1$ 且 $|\mathcal L_{\hat k_\iota'}|=1$，即多条路径具有相同混叠多普勒频移且时延相同（如情形 1、路径 $\{7,8\}$），则对 $\beta=1,\ldots,|\mathcal K_{\tilde i}|$ 估计 $\hat l_j=\hat l_1(\hat k_\iota'=\bar k_{\tilde i})$、$\hat k_j=\hat k_\beta(\bar k_{\tilde i})$。由于第一级只估计出一条路径且其信道增益不正确，我们暂时把这些路径增益置为 $\hat h_j=0$，在第 7 步再精细估计。
- **步骤 6**：若 $|\mathcal K_{\tilde i}|>|\mathcal L_{\hat k_\iota'}|>1$，即相同混叠多普勒的路径中，一些具有相同时延、另一些时延不同（如情形 2、路径 $\{3,4,5\}$），则时延不同且满足（27）的路径可用步骤 4 估计，其余时延相同的路径用步骤 5 估计，路径列表按（26）更新。
- **步骤 7**：最后用时域最小二乘（LS）方法估计被置为 $\hat h_j=0$ 的路径增益。先把时域输入—输出关系写成向量形式：

$$
\mathbf r_t'=\boldsymbol\Phi\hat{\mathbf h},\tag{28}
$$

其中 $\boldsymbol\Phi$ 为 $\widetilde Q\times\widetilde L$ 矩阵，元素为 $\boldsymbol\Phi[\tilde q,j]=e^{\jmath\frac{2\pi}{MN}\hat k_j(\tilde q-\hat l_j)}s_t[\tilde q-\hat l_j]$，$\widetilde Q<MN$ 为用于最小二乘信道增益估计的接收样本数，即

$$
\mathbf r_t'=\left[r_t'[0],\ldots,r_t'[\tilde q],\ldots,r_t'[\widetilde Q-1]\right]^T\in\mathbb C^{\widetilde Q\times1},\tag{29}
$$

且

$$
\hat{\mathbf h}=\left[\hat h[0],\ldots,\hat h[j],\ldots,\hat h[\widetilde L-1]\right]^T\in\mathbb C^{\widetilde L\times1}\tag{30}
$$

是 $\widetilde L=|\mathcal H|$ 条估计路径的估计增益。由（28）的 LS 解

$$
\hat{\mathbf h}=\left(\boldsymbol\Phi^H\boldsymbol\Phi\right)^{-1}\boldsymbol\Phi^H\mathbf r_t'\tag{31}
$$

得到 $\hat{\mathbf h}$，并把此前置为 $\hat h_j=0$ 的路径增益替换为 $\hat h[j]$ 中对应元素。

**例 2：** 对图 1 中 $M=8$、$N=6$、共 9 条路径的情形，步骤 1 与 2 给出 $\mathcal K=\{0,10,13,2,14,20,19,3,9\}$、$\widetilde{\mathcal K}=\{0,1,2,3,4\}$、$\mathcal K_1=\{0\}$、$\mathcal K_2=\{13,19\}$、$\mathcal K_3=\{2,14,20\}$、$\mathcal K_4=\{3,9\}$、$\mathcal K_5=\{10\}$。$\mathcal K_1$ 满足步骤 3 的条件，有 $\bar k_1=\hat k_1'=0$、$\mathcal L_0=\{0\}$，故得到路径 0 的时延—多普勒抽头估计 $(0,0)$。类似地 $\mathcal K_5$ 也满足步骤 3，得到路径 1 的估计 $(1,10)$。$\mathcal K_2$ 满足步骤 4，有 $\bar k_2=\hat k_2'=1$、$\mathcal L_1=\{2,6\}$；利用（27）可正确地把 $(2,13)$ 与 $(6,19)$ 配对为路径 2 与路径 6 的估计。$\mathcal K_4$ 满足步骤 5，有 $\bar k_4=\hat k_4'=3$、$\mathcal L_3=\{7\}$，故把 $(7,3)$ 与 $(7,9)$ 分别配对为路径 7 与路径 8 的时延与多普勒估计，并把它们的信道增益置为 $\hat h_j=0$。$\mathcal K_3$ 满足步骤 6，有 $\bar k_3=\hat k_3'=2$、$\mathcal L_2=\{4,5\}$；路径 5 满足（27），故用步骤 4 得到 $(5,20)$；$\mathcal K_3$ 中剩余多普勒频移 2 与 14 与延迟 4 配对，得到 $(4,2)$ 与 $(4,14)$，其信道增益按步骤 5 置零。最后用（31）估计路径 3、4、7、8 的增益，其余路径增益已在第一级正确估计。

### C. 复杂度

对传统嵌入导频信道估计，主导复杂度来自涉及 FFT 处理的 OTFS 解调，总复杂度为 $O(MN\log_2(N))$。所提方案在两级信道估计过程中引入额外计算：第一级中，用（17）计算阈值 $T_n$ 需要 $MN$ 次复乘，复杂度为 $O(MN)$；第二级的主要操作包括 (i) 用 $MN$ 点 FFT 把接收信号从时域变换到频域，复杂度为 $O(MN\log_2(MN))$，以及 (ii) （31）中基于 LS 的信道增益估计，复杂度为 $O(\widetilde Q\widetilde L^2+\widetilde L^3)$。LS 步仅在多条路径共享同时延与混叠多普勒频移（如情形 1）的场景中需要，因此并非影响所有信道实现。总体而言，相对传统嵌入导频信道估计，所提方案引入的额外复杂度为 $O\left(MN+MN\log_2(MN)+\widetilde Q\widetilde L^2+\widetilde L^3\right)$。

### D. PAPR 与频谱效率

所提训练信号的峰均功率比（PAPR）与标准嵌入导频信道估计方案相当，因为二者采用相似的导频安排。在我们的设计中，训练帧在 DD 域含 $MN-M$ 个零，余弦信号与单个导频符号在时延—时间域扩展到这些零的位置上，从而降低了 PAPR。对 $M=512$、$N=64$、$\Delta\mathrm{SNR}=28$ dB，所提训练帧计算所得的 PAPR 值为 25.7 dB。这里 $\Delta\mathrm{SNR}=\mathrm{SNR}_p-\mathrm{SNR}_c$，其中 $\mathrm{SNR}_p=\frac{|x_p|^2}{N\sigma_w^2}$ 与 $\mathrm{SNR}_c=\frac{A^2}{N\sigma_w^2}$ 分别为时域中导频与余弦导频信号的 SNR。相同系统配置下，嵌入导频信道估计 [6] 的 PAPR 为 25 dB，与所提训练帧相当；这里 $\Delta\mathrm{SNR}=\mathrm{SNR}_p-\mathrm{SNR}_d$，$\mathrm{SNR}_p$ 与 $\mathrm{SNR}_d$ 分别为时域中导频与数据信号的 SNR。

在频谱效率方面，一个 OTFS 帧专用于信道估计，其后传输多个数据帧，因此所提方案的频谱效率取决于训练帧的发送周期，而该周期由信道几何相干时间（即 DD 路径近似不变的持续时间）决定。对典型城市地面场景，几何相干时间可达数十毫秒量级。例如在车辆速度 100 kmph 时，50 ms 内的位移约 1.39 m，通常不会显著改变信道路径几何及相应的归一化时延与多普勒值。对 $N=64$、$\Delta f=15$ kHz 的 OTFS 帧，帧长为 4.26 ms，因此一个训练帧后可传约 10 个数据帧，即约 11 个 OTFS 帧后才需重新估计信道。

按上述数值，所提训练框架的导频开销约 9%，相应频谱效率约 91%。相反，嵌入导频信道估计方法需要大小为 $l_{\max}\times2\times N$ 的导频与保护资源。在过扩张多普勒场景中，多普勒扩展可超过 $N/2$，因此需要在**整个**多普勒维上设置保护符号。考虑典型最大归一化时延 $l_{\max}=20$、$M=512$，并假设导频与保护资源只在第一帧使用、随后为连续 10 个数据帧，则导频开销与频谱效率分别约 0.7% 与 99.3%。因此嵌入导频信道估计具有更高的频谱效率；但如第 IV 节结果所示（见图 5 与图 6），它完全无法估计过扩张多普勒频移，而所提训练框架正是为在此类场景中可靠信道估计而设计。因此，所提方案以频谱效率换取过扩张多普勒环境下更强的信道估计能力。

## IV. 结果与讨论

本节以 NMSE 与 BER 给出所提信道估计的性能。定义 NMSE 为

$$
\mathrm{NMSE}=\mathbb E\left[\frac{\|\widehat{\mathbf g}-\mathbf g\|^2}{\|\mathbf g\|^2}\right],
$$

其中 $\mathbf g\in\mathbb C^{\max(\mathcal L\cup\widetilde{\mathcal L})\times MN}$ 为真实时延—时间信道矩阵，元素为

$$
\mathbf g[m',q]=\begin{cases}g[l_i,q],&m'=l_i,\\0,&\text{其他},\end{cases}
$$

$m'=[0,\max(\mathcal L\cup\widetilde{\mathcal L})-1]$，$g[l_i,q]$（$\forall i$）由（8）给出。类似地，$\widehat{\mathbf g}\in\mathbb C^{\max(\mathcal L\cup\widetilde{\mathcal L})\times MN}$ 为估计的时延—时间信道矩阵，元素为

$$
\widehat{\mathbf g}[m',q]=\begin{cases}\widehat g[\hat l_j,q],&m'=\hat l_j,\\0,&\text{其他},\end{cases}
$$

其中 $\widehat g[\hat l_j,q]$ 对所有 $j$ 由（8）用估计值得到。

我们给出所提信道估计器在两种场景（场景 A 与场景 B）下的性能，两种场景的公共仿真参数汇总于表 I。为评估 BER，我们对零填充 OTFS（ZP-OTFS）[27] 采用最大比合并（MRC）检测，阻尼因子 $\delta=0.25$、最大 10 次迭代。假设训练帧在数据帧之前发送，其间信道保持不变。记时域中导频、余弦导频信号与数据 SNR 分别为 $\mathrm{SNR}_p=\frac{|x_p|^2}{N\sigma_w^2}$、$\mathrm{SNR}_c=\frac{A^2}{N\sigma_w^2}$、$\mathrm{SNR}_d=\frac{E_s}{\sigma_w^2}$，并记导频与余弦导频 SNR 之差为 $\Delta\mathrm{SNR}=\mathrm{SNR}_p-\mathrm{SNR}_c$。

### A. 场景 A

场景 A 表示具有相等信道增益的地面环境，含 5 条路径：各路径时延索引服从均匀分布 $U(0,20)$，多普勒索引服从均匀分布 $U[-160,160]$。

图 3 给出场景 A 下所提信道估计的 NMSE 随第一级阈值参数 $\alpha$ 的变化（不同 $\mathrm{SNR}_c$ 取值），其中 $\Delta\mathrm{SNR}$ 固定为 28 dB。$\alpha$ 较小时检测阈值较低，会因噪声与余弦信号导致虚假路径检测，使 NMSE 变差；$\alpha$ 较大时会漏检弱路径，同样使 NMSE 退化。因此中等 $\alpha$ 值通过平衡两种效应取得最佳性能。对本文系统参数，在所有 $\mathrm{SNR}_c$ 值下最小 NMSE 出现在 $\alpha=2.5$ 附近；我们还观察到该 $\alpha$ 取值对本文考虑的其他 $\Delta\mathrm{SNR}$ 同样有效（为简洁未展示结果）。因此场景 A 的所有仿真均取 $\alpha=2.5$。

图 4 给出场景 A 下所提信道估计的 NMSE 随第二级阈值参数 $\gamma$ 的变化（$\Delta\mathrm{SNR}=28$ dB）。$\gamma$ 较小时，除真实多普勒峰外还会检测到噪声主导的频率分量，增加候选多普勒频移数量并削弱多普勒配对，导致 NMSE 升高；$\gamma$ 较大时检测阈值提高，一些低功率多普勒分量可能检测不到。因此中等 $\gamma$ 值给出最佳 NMSE。对本文系统参数，在所有 $\mathrm{SNR}_c$ 下最小 NMSE 在 $\gamma=300$ 附近取得；故场景 A 后续仿真取 $\gamma=300$。注意 $\gamma$ 的选择与 $\Delta\mathrm{SNR}$ 无关，因为第二级频域峰值检测是在去除单导频分量之后进行的。

图 5 比较场景 A 下所提两级信道估计的 NMSE 随 $\Delta\mathrm{SNR}$ 的变化（$\mathrm{SNR}_c=7,12,17$ dB）。对所有情形，NMSE 随 $\Delta\mathrm{SNR}$ 增大直至 33 dB 而下降，这得益于路径检测精度的提高。NMSE 达到 $10^{-4}$ 足以实现可靠数据检测：在 $\mathrm{SNR}_c=7,12,17$ dB 时分别可在 $\Delta\mathrm{SNR}=33,28,25$ dB 达到该水平。此外，当 $\Delta\mathrm{SNR}\geq18$ dB 时 NMSE 随 $\mathrm{SNR}_c$ 增大而改善，因为较高的 $\mathrm{SNR}_c$ 配合足够高的 $\mathrm{SNR}_p$ 会同时改善两级信道估计，尤其是第二级中真实多普勒与时延/信道增益的配对以及信道增益估计的精化。我们还观察到，专为欠扩张信道设计的嵌入导频信道估计 [6] 在过扩张信道估计中完全失效。

图 6 给出采用 MRC 检测的 ZP-OTFS [27] 在 $\mathrm{SNR}_c=7,12,17$ dB 时 BER 随 $\mathrm{SNR}_d$ 的变化，其中 $\Delta\mathrm{SNR}=28$ dB、第二级信道估计所用观测数 $\widetilde Q=2000$。可见在 BER 达到 $10^{-4}$ 之前，我们的信道估计方法与完美信道状态信息（CSI）的性能吻合良好。在 BER 约为 $2\times10^{-5}$ 时，$\mathrm{SNR}_c=12$ 与 17 dB 取得相同 BER 性能，与完美 CSI 相差 1 dB，说明 $\mathrm{SNR}_c=12$ dB 已足够。此外，如预期，嵌入导频信道估计 [6] 的 BER 性能在过扩张信道中完全失效。

图 7 与图 8 分别给出 $\mathrm{SNR}_c=7,12,17$ dB 时 NMSE 与 BER 随 $\widetilde Q$ 的变化。回顾 $\widetilde Q$ 表示用于信道增益估计的时域观测数（见第二级信道估计步骤 7），对应共享同一时延与混叠多普勒频移的路径。图 8 的 BER 取 $\mathrm{SNR}_d=15$ 与 20 dB。如预期，NMSE 与 BER 性能都随 $\widetilde Q$ 增大而改善，并在 $\widetilde Q=1000$ 之后趋于饱和。因此 $\widetilde Q=1000$ 已足以在 NMSE 与 BER 两方面取得可靠性能。

### B. 场景 B

场景 B 考虑下行多颗 LEO 卫星协同与地面用户通信（如图 9 所示，用户记为 T）。假设 $S$ 颗卫星沿轨道等间隔分布，在用户/终端可见弧段（图中较粗弧线）内以速度 $v_s$、高度 $h$ 飞行，地球半径记为 $R$。

设卫星 $S_1$ 相对用户/终端水平面具有仰角 $\alpha_1$、卫星中心角 $\psi_1$，则卫星 $S_1$ 到任意第 $i$ 颗卫星 $S_i$（$i\in[1,S]$）的夹角为

$$
\theta_i=\frac{2\pi}{S(R+h)}(i-1).\tag{32}
$$

第 $i$ 颗卫星与用户/终端之间的卫星中心角可重写为

$$
\psi_i=\begin{cases}\psi_1-\theta_i,&\theta_i<\psi_1,\\[2pt]\theta_i-\psi_1,&\text{其他},\end{cases}\tag{33}
$$

其中 $i\in[1,S]$，并可由 [28] 计算为

$$
\psi_i=\cos^{-1}\left(\frac{R\cos\alpha_i}{R+h}\right)-\alpha_i.\tag{34}
$$

在用户可见弧段内，假设 $L$ 颗卫星（$L\leq S$）同时协同服务该用户。考虑每颗卫星到用户的 LoS 链路，信道可在 DD 域建模为

$$
h(\tau,\nu)=\sum_{p=1}^{L}h_p\delta(\tau-\tau_p)\delta(\nu-\nu_p),\tag{35}
$$

其中 $h_p$、$\tau_p$、$\nu_p$ 分别为第 $p$ 颗卫星（$p\in[1,L]$）对应的信道增益、传播时延与多普勒频移。三者建模如下。

**时延：** 卫星 $S_p$ 与用户之间的传播时延为

$$
\tau_p=\frac{d_p}{c},\tag{36}
$$

其中 $d_p=TS_p=\sqrt{R^2+(R+h)^2+2R(R+h)\cos\psi_p}$ 为第 $p$ 颗卫星到终端 T 的距离。

**信道增益：** 各路径信道增益建模为 Rayleigh 分布，第 $p$ 条路径功率为

$$
E_p\propto d_p^{-2}.\tag{37}
$$

**多普勒频移：** 第 $p$ 条路径的多普勒频移为

$$
\nu_p=\frac{f_cv_s}{c}\frac{R}{R+h}\cos(\alpha_p).\tag{38}
$$

仿真取 $S=120$、$\alpha_{\min}=10^\circ$、$\alpha_{\max}=90^\circ$，并取 $h=550$ km、$v_s=7.8$ km/s、$R=6378$ km。

我们首先研究 $\Delta\mathrm{SNR}=28$ dB、$\mathrm{SNR}_c=2$ 与 7 dB 时阈值参数 $\alpha$、$\gamma$ 对 NMSE 的影响（分别见图 10 与图 11），趋势与场景 A 一致；特别是最小 NMSE 在 $\alpha=3$、$\gamma=50$ 附近取得，故场景 B 后续仿真采用这些取值。

图 12 给出场景 B 下所提两级信道估计的 NMSE 随 $\Delta\mathrm{SNR}$ 的变化（$\mathrm{SNR}_c=2$ 与 7 dB），观察结果与图 5 类似。图 13 给出场景 B 下 $\mathrm{SNR}_c=2,7$ dB 时 BER 随 $\mathrm{SNR}_d$ 的变化（$\Delta\mathrm{SNR}=28$ dB、$\widetilde Q=2000$），观察结果与图 6 类似：BER 随 $\mathrm{SNR}_c$ 增大而改善，且 $\mathrm{SNR}_c=2$ dB 时在 $\mathrm{SNR}_d=20$ dB 可达到 $10^{-4}$ 的 BER；与完美信道相比，在 BER$=10^{-4}$ 处 $\mathrm{SNR}_c=7$ dB 的性能差距为 1.5 dB。图 14 与图 15 给出场景 B 下 NMSE 与 BER 随 $\widetilde Q$ 的变化（$\mathrm{SNR}_c=2,7$ dB、$\Delta\mathrm{SNR}=28$ dB、$\mathrm{SNR}_d=15$ 与 20 dB）；与场景 A 类似，NMSE 与 BER 均随 $\widetilde Q$ 增大而下降，并在 $\widetilde Q=1000$ 之后饱和。

### C. 注：向分数多普勒场景的扩展

为纳入分数多普勒估计，可在估计过程第二级采用高分辨率 FFT 运算来扩展所提框架。具体地，第一级用所提方法估计混叠分数多普勒的**整数部分**，第二级通过高分辨率谱分析估计真实分数多普勒值；随后可采用与整数时延—多普勒情形相同的配对方法关联相应时延与分数多普勒对。对分数多普勒配对，（25）中的集合需重定义为

$$
\bar{\mathcal K}=\left\{\bar k_i=\left\lfloor[\hat k_i]_N\right\rfloor,\ \text{对所有 }\hat k_i\in\mathcal K\right\},
$$

因为第一级的估计为整数值。

此外，由于分数多普勒分量引入泄漏，直接在时延—多普勒域估计的信道系数会不准确；因此可用（31）在时域重新估计信道系数。

上述扩展对第 III-B 节的情形 3 效果良好，即路径具有不同时延且混叠分数多普勒值互异（至少相隔 1 个网格）；但对情形 2（时延不同、混叠分数多普勒值接近），约 1% 的信道实现会出现估计不准确。这是因为情形 2 中所提把时延与真实多普勒值关联的配对方法依赖时延—多普勒域的信道系数估计，而该估计在存在分数多普勒时变得不准确，从而导致配对性能退化。对情形 1（路径具有相同时延与混叠多普勒值），由于涉及复杂度且时延—多普勒信道系数估计不准确，估计会高度失准。解决情形 1 与情形 2 需要进一步研究，超出本文范围，我们将在未来工作中处理这些局限。

## V. 结论

本文研究了存在过扩张多普勒频移的时变信道中的 OTFS 系统。过扩张多普勒频移会因 OTFS 的模 $N$ 操作在 DD 域产生混叠多普勒频移，妨碍标准信道估计方法。为此，我们提出一种 DD 训练帧与两级信道估计方法，训练帧由一个余弦导频信号与一个导频符号组成，并据此开发了两级信道估计算法。在信道估计第一级，用 DD 域中的导频符号估计传播路径的时延、混叠多普勒频移与信道增益；第二级把接收时域信号变换到频域做峰值检测，识别余弦导频信号频率的所有多普勒频移；随后提出基于阈值的方法把估计的真实多普勒频移与相应时延、信道增益配对。我们还分析了所提信道估计方法的计算复杂度，并在不同场景下以 NMSE 与 BER 验证了该信道估计的有效性。未来工作将把所提算法扩展到考虑分数时延与分数多普勒效应。

## 附录 A：第二级信道估计算法

以下为基于余弦频域峰值检测的第二级信道估计流程（对应正文图 2 与算法 1 的第 21 行调用的 `CosineFreqPeak` 函数）。

**算法：基于余弦频域峰值的第二级信道估计。** 输入：$\mathbf r_t$、$\gamma$、$\delta$、$x_p$、$\sigma_w^2$、$f_0$、$M$、$N$、第一级结果 $\mathcal H$、$\mathcal A$、$\mathcal L_{\hat k_\iota'}$、$\mathcal G_{\hat k_\iota'}$（$\forall\iota$）。输出：路径估计列表 $\mathcal H$。

1. 置 $\mathcal K=\{\}$、$i=1$、$j=1$。
2. 按（19）与（20）得到 $\check{\mathbf r}_c$。
3. 计算 $\mathbf R=\mathbf F_{MN}\check{\mathbf r}_c$。
4. 对 $f=0$ 到 $\frac{MN}{2}$：若 $|R[f]|^2>\gamma\sigma_w^2$，则 $\hat k_i=f-f_0N$、$\mathcal K=\mathcal K\cup\{\hat k_i\}$、$i\leftarrow i+1$。
5. 计算 $\bar{\mathcal K}=\{\bar k_i=[\hat k_i]_N\}$（$\hat k_i\in\mathcal K$），并令 $\widetilde{\mathcal K}=\text{Unique}(\bar{\mathcal K})$。
6. 对 $\tilde i=1$ 到 $|\widetilde{\mathcal K}|$：令 $\beta=0$；对 $i=1$ 到 $|\mathcal K|$：若 $\bar k_{\tilde i}\in\widetilde{\mathcal K}=\bar k_i\in\bar{\mathcal K}$，则 $\beta\leftarrow\beta+1$、$\mathcal K_{\tilde i}=\{\}$、$\hat k_\beta(\bar k_{\tilde i})=\hat k_i$、$\mathcal K_{\tilde i}\leftarrow\mathcal K_{\tilde i}\cup\{\hat k_\beta(\bar k_{\tilde i})\}$。
7. 找出使 $\hat k_\iota'\in\mathcal A=\bar k_{\tilde i}$ 的 $\iota$。
8. 若 $|\mathcal K_{\tilde i}|=1$：$\hat l_j=\hat l_1(\hat k_\iota'=\bar k_{\tilde i})$、$\hat k_j=\hat k_1(\bar k_{\tilde i})$、$\hat h_j=\hat h_1(\hat k_\iota')$；$\mathcal H\leftarrow\mathcal H\cup\{\hat l_j,\hat k_j,\hat h_j\}$；$j\leftarrow j+1$。
9. 否则若 $|\mathcal K_{\tilde i}|=|\mathcal L_{\hat k_\iota'}|>1$：对 $\lambda=1$ 到 $|\mathcal L_{\hat k_\iota'}|$，按（27）求 $\beta^{\star}(\lambda)=\arg\min_\beta\left|\left|\frac{2}{A\sqrt M}R(\hat k_\beta(\bar k_{\tilde i})+f_0N)\right|-\left|\hat h_\lambda(\hat k_\iota')\right|\right|$，并令 $\hat l_j=\hat l_\lambda(\hat k_\iota'=\bar k_{\tilde i})$、$\hat k_j=\hat k_{\beta^{\star}(\lambda)}(\bar k_{\tilde i})$、$\hat h_j=\hat h_\lambda(\hat k_\iota')$，加入 $\mathcal H$，$j\leftarrow j+1$。
10. 否则若 $|\mathcal K_{\tilde i}|>1$ 且 $|\mathcal L_{\hat k_\iota'}|=1$：对 $\beta=1$ 到 $|\mathcal K_{\tilde i}|$，令 $\hat l_j=\hat l_1(\hat k_\iota'=\bar k_{\tilde i})$、$\hat k_j=\hat k_\beta(\bar k_{\tilde i})$、$\hat h_j=0$，加入 $\mathcal H$，$j\leftarrow j+1$。
11. 否则若 $|\mathcal K_{\tilde i}|>|\mathcal L_{\hat k_\iota'}|>1$：对 $\lambda=1$ 到 $|\mathcal L_{\hat k_\iota'}|$，按（27）求 $\beta^{\star}(\lambda)$，令 $\hat l_j=\hat l_\lambda(\hat k_\iota'=\bar k_{\tilde i})$、$\hat k_j=\hat k_{\beta^{\star}(\lambda)}(\bar k_{\tilde i})$、$\hat h_j=\hat h_\lambda(\hat k_\iota')$，加入 $\mathcal H$，$j\leftarrow j+1$，并从 $\mathcal K_{\tilde i}$、$\mathcal L_{\hat k_\iota'}$、$\mathcal G_{\hat k_\iota'}$ 中删除相应元素；随后对剩余 $\beta=1$ 到 $|\mathcal K_{\tilde i}|$，令 $\hat l_j=\hat l_1(\hat k_\iota'=\bar k_{\tilde i})$、$\hat k_j=\hat k_\beta(\bar k_{\tilde i})$、$\hat h_j=0$，加入 $\mathcal H$，$j\leftarrow j+1$。
12. 用（31）计算 $\hat{\mathbf h}$；对 $j=1$ 到 $|\mathcal H|$，若 $\hat h_j=0$ 则令 $\hat h_j=\hat h[j]$。
13. 返回 $\mathcal H$。

## 图注与表注

### 表 I：场景 A 与 B 的仿真参数（原 PDF 第 7 页）

| 参数 | 取值 |
|---|---|
| 子载波间隔 $\Delta f$ | 15 kHz |
| 时隙数 $M$ | 512 |
| 帧数/时隙长度 $N$ | 64 |
| 调制方式 | 4-QAM |
| 余弦导频归一化频率 $f_0$ | 50 |

### 图注

**图 1（原 PDF 第 3 页）：** $M=8$、$N=6$、共 9 条路径 $((l_i,k_i)=\{(0,0),(1,10),(2,13),(4,2),(4,14),(5,20),(6,19),(7,3),(7,9)\})$ 时的 DD 域接收导频回波。每个单元标注路径索引 $i=0,\ldots,8$；X 表示欠扩张路径（$k_i<N/2$），O 表示过扩张路径（$k_i\geq N/2$）。

**图 2（原 PDF 第 3 页）：** 两级信道估计的流程图。

**图 3（原 PDF 第 8 页）：** 场景 A 下 NMSE 随第一级阈值参数 $\alpha$ 的变化。

**图 4（原 PDF 第 8 页）：** 场景 A 下 NMSE 随第二级阈值参数 $\gamma$ 的变化。

**图 5（原 PDF 第 8 页）：** 场景 A 下 NMSE 随 $\Delta\mathrm{SNR}=\mathrm{SNR}_p-\mathrm{SNR}_c$ 的变化（含嵌入导频信道估计 [6] 对照）。

**图 6（原 PDF 第 8 页）：** 场景 A 下 BER 随 $\mathrm{SNR}_d$ 的变化（含完美 CSI 与嵌入导频信道估计 [6] 对照）。

**图 7（原 PDF 第 8 页）：** 场景 A 下 NMSE 随 $\widetilde Q$ 的变化。

**图 8（原 PDF 第 8 页）：** 场景 A 下 BER 随 $\widetilde Q$ 的变化。

**图 9（原 PDF 第 9 页）：** 场景 B：多颗 LEO 卫星沿轨道等间隔分布、协同服务地面用户 T 的几何示意。

**图 10（原 PDF 第 10 页）：** 场景 B 下 NMSE 随第一级阈值参数 $\alpha$ 的变化。

**图 11（原 PDF 第 10 页）：** 场景 B 下 NMSE 随第二级阈值参数 $\gamma$ 的变化。

**图 12（原 PDF 第 10 页）：** 场景 B 下 NMSE 随 $\Delta\mathrm{SNR}$ 的变化。

**图 13（原 PDF 第 10 页）：** 场景 B 下 BER 随数据 SNR 的变化。

**图 14（原 PDF 第 11 页）：** 场景 B 下 NMSE 随 $\widetilde Q$ 的变化。

**图 15（原 PDF 第 11 页）：** 场景 B 下 BER 随 $\widetilde Q$ 的变化。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] C.-X. Wang, X. You, X. Gao, X. Zhu, Z. Li, C. Zhang, H. Wang, Y. Huang, Y. Chen, H. Haas, J. S. Thompson, E. G. Larsson, M. D. Renzo, W. Tong, P. Zhu, X. Shen, H. V. Poor, and L. Hanzo, "On the road to 6G: Visions, requirements, key technologies, and testbeds," IEEE Communications Surveys & Tutorials, vol. 25, no. 2, pp. 905–974, 2023.

[2] R. Hadani, S. Rakib, M. Tsatsanis, A. Monk, A. J. Goldsmith, A. F. Molisch, and R. Calderbank, "Orthogonal time frequency space modulation," in Proc. IEEE Wireless Commun. Net. Conf., San Francisco, CA, USA, 2017, pp. 1–6.

[3] Y. Hong, T. Thaj, and E. Viterbo, Delay-Doppler Communications: Principles and Applications. Elsevier, 2022.

[4] P. Raviteja, Y. Hong, E. Viterbo, and E. Biglieri, "Effective diversity of OTFS modulation," IEEE Wireless Commun. Lett., vol. 9, no. 2, pp. 249–253, 2020.

[5] P. Raviteja, K. T. Phan, Y. Hong, and E. Viterbo, "Interference cancellation and iterative detection for orthogonal time frequency space modulation," IEEE Trans. Wireless Commun., vol. 17, no. 10, pp. 6501–6515, 2018.

[6] P. Raviteja, K. T. Phan, and Y. Hong, "Embedded pilot-aided channel estimation for OTFS in delay–Doppler channels," IEEE Trans. Veh. Technol., vol. 68, no. 5, pp. 4906–4917, 2019.

[7] O. K. Rasheed, G. D. Surabhi, and A. Chockalingam, "Sparse delay-Doppler channel estimation in rapidly time-varying channels for multiuser OTFS on the uplink," in Proc. IEEE 91st Veh. Technol. Conf., Antwerp, Belgium, 2020, pp. 1–5.

[8] P. Raviteja, K. T. Phan, Y. Hong, and E. Viterbo, "Orthogonal time frequency space (OTFS) modulation based radar system," in Proc. IEEE Radar Conf., Boston, MA, USA, 2019, pp. 1–6.

[9] T. Thaj, E. Viterbo, and Y. Hong, "Orthogonal time sequency multiplexing modulation: Analysis and low-complexity receiver design," IEEE Trans. Wireless Commun., vol. 20, no. 12, pp. 7842–7855, 2021.

[10] A. Thomas, K. Deka, P. Raviteja, and S. Sharma, "Convolutional sparse coding based channel estimation for OTFS-SCMA in uplink," IEEE Trans. Commun., vol. 70, no. 8, pp. 5241–5257, 2022.

[11] H. B. Mishra, P. Singh, A. K. Prasad, and R. Budhiraja, "OTFS channel estimation and data detection designs with superimposed pilots," IEEE Trans. Wireless Commun., vol. 21, no. 4, pp. 2258–2274, 2022.

[12] F. Jesbin, S. Rao Mattu, and A. Chockalingam, "Sparse superimposed pilot based channel estimation in OTFS systems," in Proc. IEEE Wireless Commun. Net. Conf. (WCNC), 2023, pp. 1–6.

[13] S. R. Mattu and A. Chockalingam, "Learning based delay-Doppler channel estimation with interleaved pilots in OTFS," in Proc. IEEE 96th Veh. Technol. Conf. (VTC2022-Fall), 2022, pp. 1–6.

[14] D. Shi, W. Wang, L. You, X. Song, Y. Hong, X. Gao, and G. Fettweis, "Deterministic pilot design and channel estimation for downlink massive MIMO-OTFS systems in presence of the fractional Doppler," IEEE Trans. Wireless Commun., vol. 20, no. 11, pp. 7151–7165, 2021.

[15] Y. Liu, S. Zhang, F. Gao, J. Ma, and X. Wang, "Uplink-aided high mobility downlink channel estimation over massive MIMO-OTFS system," IEEE J. Sel. Areas Commun., vol. 38, no. 9, pp. 1994–2009, 2020.

[16] W. Shen, L. Dai, J. An, P. Fan, and R. W. Heath, "Channel estimation for orthogonal time frequency space (OTFS) massive MIMO," IEEE Trans. Signal Process., vol. 67, no. 16, pp. 4204–4217, 2019.

[17] L. Zhao, W.-J. Gao, and W. Guo, "Sparse Bayesian learning of delay-Doppler channel for OTFS system," IEEE Commun. Lett., vol. 24, no. 12, pp. 2766–2769, 2020.

[18] S. Srivastava, R. K. Singh, A. K. Jagannatham, and L. Hanzo, "Bayesian learning aided sparse channel estimation for orthogonal time frequency space modulated systems," IEEE Trans. Veh. Technol., vol. 70, no. 8, pp. 8343–8348, 2021.

[19] X. Li, Y. Liang, Z. Zhou, and P. Fan, "Fractional delay-Doppler channel estimation for OTFS systems based on segmentation technique and sparse Bayesian learning," IEEE Commun. Lett., vol. 29, no. 5, pp. 1067–1071, 2025.

[20] Q. Deng, Y. Ge, and Z. Ding, "A unifying view of OTFS and its many variants," IEEE Communications Surveys & Tutorials, pp. 1–1, 2025.

[21] N. Kalpage, Y. Hong, and P. Priya, "Performance analysis and joint receiver design for an OTFS-based ISAC system in time-varying channels," IEEE Trans. Veh. Technol., pp. 1–6, 2025.

[22] M. Li, S. Zhang, Y. Ge, F. Gao, and P. Fan, "Joint channel estimation and data detection for hybrid RIS aided millimeter wave OTFS systems," IEEE Trans. Commun., vol. 70, no. 10, pp. 6832–6848, 2022.

[23] J. Jayachandran, I. A. Khan, S. K. Mohammed, R. Hadani, A. Chockalingam, and R. Calderbank, "Zak-OTFS with interleaved pilots to extend the region of predictable operation," IEEE Trans. Veh. Technol., pp. 1–15, 2025.

[24] P. Priya, Y. Hong, and E. Viterbo, "OTFS channel estimation and detection for channels with very large delay spread," IEEE Trans. Wireless Commun., vol. 23, no. 9, pp. 11920–11930, 2024.

[25] H. Luo et al., "Very-low-earth-orbit satellite networks for 6G," Communications of Huawei Research, no. 2, pp. 40–54, 2022.

[26] M. Duan, P. Zhang, S. Zhang, Y. Ge, O. A. Dobre, and C. Yuen, "Channel estimation and hybrid precoding for massive MIMO-OTFS system with doubly squint," IEEE Trans. Commun., vol. 73, no. 10, pp. 9388–9404, 2025.

[27] T. Thaj and E. Viterbo, "Low complexity iterative rake decision feedback equalizer for zero-padded OTFS systems," IEEE Trans. Veh. Technol., vol. 69, no. 12, pp. 15606–15622, 2020.

[28] A. S. Bora, K. T. Phan, and Y. Hong, "Spatially correlated MIMO-OTFS for LEO satellite communication systems," in Proc. IEEE Int. Conf. Commun. Workshops, Seoul, Korea, 2022, pp. 723–728.

## 作者简介

**Preety Priya（GS'18–M'22）** 现任印度矿业学院（IIT (ISM) Dhanbad）电子工程系助理教授。她于 2014 年获印度理工学院卡拉格普尔分校（IIT Kharagpur）电信系统工程硕士学位，2022 年获该校博士学位。2024—2025 年任印度国家技术学院卡利卡特分校（NIT Calicut）电子与通信工程系助理教授；此前 2022—2024 年为澳大利亚莫纳什大学电气与计算机系统工程系研究员；2014—2016 年任印度布巴内斯瓦尔 Kalinga 工业技术学院助理教授。她于 2017 年获高通（Qualcomm）创新奖学金。研究兴趣包括下一代无线通信物理层设计、OFDM、OTFS、ISAC、稀疏信号处理与非线性估计。

**Yi Hong（S'00–M'05–SM'10）** 现任澳大利亚莫纳什大学电气与计算机系统工程系副教授。她在新南威尔士大学（UNSW，悉尼）获电气工程与电信博士学位，并于 2007 年在澳大利亚通信理论研讨会（Adelaide）获 NICTA-ACoRN 早期职业生涯研究员奖。她曾任澳大利亚研究理事会专家学院成员（2018—2020）。Hong 副教授目前担任 IEEE Transactions on Green Communications and Networking 副编辑，并曾任 IEEE Wireless Communication Letters 与 Transactions on Emerging Telecommunications Technologies 副编辑；曾任 2021 年墨尔本 IEEE 国际信息论研讨会 Tutorial Chair，以及 2019—2022 年 IEEE 通信会议 OTFS 研讨会、2021 年 IEEE 车辆技术会议秋季 OTFS 研讨会与 2014 年霍巴特 IEEE 信息论研讨会的 General Co-Chair。研究兴趣包括通信理论、编码与信息论及其在电信工程中的应用。

**Emanuele Viterbo（M'95–SM'04–F'11）** 现任澳大利亚莫纳什大学 ECSE 系教授、研究生研究副院长。他于 1995 年获意大利都灵理工大学（Politecnico di Torino）电气工程博士学位。1990—1992 年在荷兰海牙欧洲专利局任动态记录与差错控制编码领域专利审查员；1995—1997 年在都灵理工大学电子系做博士后；1997—1998 年在美国新泽西州 Florham Park 的 AT&T 研究中心信息科学研究中心做博士后研究员；1998—2005 年在都灵理工大学电子系先后任助理教授、副教授；2006—2009 年在意大利卡拉布里亚大学 DEIS 任正教授。Viterbo 教授自 2009 年起为 ISI Highly Cited Researcher，担任 IEEE Trans. on Information Theory、European Transactions on Telecommunications 与 Journal of Communications and Networks 副编辑，并任 IEEE J. Sel. Topics in Signal Processing "Managing Complexity in Multiuser MIMO Systems" 特刊客座编辑。他于 1997 年获意大利国家研究理事会（CNR）NATO 高级研究员基金。主要研究兴趣为高斯与衰落信道上的格码、代数编码理论、代数空时编码、数字地面电视广播、数字磁记录与非规则采样。

**本页范围与校对状态：** 本页依据 arXiv:2608.12524v1（eess.SP，14 页；原文页眉标注 IEEE Transactions on Wireless Communications）完成全文中文翻译：摘要、索引词、第 I—V 节（含 II 系统模型、III-A—III-D、IV-A/IV-B 与分数多普勒扩展注、V 结论）、附录 A（第二级信道估计算法全流程）、图 1—15 中文图注、表 I 逐格转录、参考文献 [1]—[28] 英文原条目（按原编号）、三位作者简介均按原文结构录入。**表 I 未做渲染核对**：本地全文 PDF 库中未见该篇（arXiv 2608.12524）PDF，故表 I 按抽取文本转录；该表仅 5 项参数且与正文描述一致。编号公式 (1)—(38) 按原文保留（含（16）分段式与（22）—（23）频域峰值展开）。**逐句逐式终校未做**；图内 NMSE/BER 曲线未作数字化读取，只转录图注与正文给出的关键结论（如场景 A 取 $\alpha=2.5$、$\gamma=300$；场景 B 取 $\alpha=3$、$\gamma=50$；$\widetilde Q=1000$ 后饱和；PAPR 25.7 dB 对 25 dB；导频开销约 9% 对 0.7% 等）；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①原文表 I 仅列 5 项公共参数（$\Delta f$、$M$、$N$、调制方式、$f_0$），场景 A/B 其余参数在正文分别给出，本页按此转录；②式（15）的混叠多普勒定义与式（24）的检测区间 $f=0,\ldots,\frac{MN}{2}$ 在抽取中排版紧凑，已按上下文语义复原；③原文（22）项 (a)(b) 的求和下限与频率条件依赖 $f_0$ 为整数，已按渲染语义保留。原文含作者简介，已完整译出。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
