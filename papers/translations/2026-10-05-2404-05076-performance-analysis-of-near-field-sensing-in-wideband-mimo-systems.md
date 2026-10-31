---
layout: page
title: "宽带 MIMO 系统近场感知性能分析｜中文全文译文"
permalink: /papers/translations/2026-10-05-2404-05076-performance-analysis-of-near-field-sensing-in-wideband-mimo-systems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/d3b2f278ad439789/) · [原文 arXiv](https://arxiv.org/abs/2404.05076) · [全部目录](/papers/catalog/)

# 宽带 MIMO 系统近场感知性能分析

**原题：** Performance Analysis of Near-Field Sensing in Wideband MIMO Systems  
**作者：** Zhaolin Wang、Xidong Mu、Yuanwei Liu  
**版本：** arXiv:2404.05076v3，2025-02-18，原文 16 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VI 节、结论、致谢与说明、附录 A–E（全部证明）、图 1–12 图注、参考文献 [1]–[45]（英文原条目）按原文结构录入；原文无表格。逐句逐式终校未做。

## 摘要

本文分析传统宽带多输入多输出（multiple-input multiple-output，MIMO）正交频分复用（orthogonal frequency-division multiplexing，OFDM）通信系统中的近场感知（near-field sensing，NISE）性能。我们推导了目标相对于天线阵列的距离与角度的最大似然估计（maximum likelihood estimate，MLE）。为评估估计误差，我们分别针对均匀线阵（uniform linear array，ULA）与均匀圆阵（uniform circular array，UCA）推导了 Cramér-Rao 界（Cramér-Rao bound，CRB）的闭式解析表达式。随后分析渐近 CRB，揭示 CRB 相对于关键系统参数（包括阵列尺寸、带宽与目标距离）的标度规律。结果表明：1）在高信噪比区域，MLE 达到的均方误差趋近 CRB；2）更大的阵列孔径并不必然改善 NISE 性能，在超大带宽下尤其如此；3）随着目标距离增大，大带宽为 NISE 设定了一个估计误差上限；4）阵列孔径与带宽（而非天线数与子载波数）是影响宽带 NISE 性能的关键因素；5）在相同孔径下，UCA 相比 ULA 提供更优且与角度无关的宽带 NISE 性能。

**索引词：** Cramér-Rao 界、最大似然估计、MIMO、近场感知、OFDM。

## I. 引言

多输入多输出（MIMO）技术一直是无线通信与感知系统的核心 [2]、[3]。通过在收发端使用多天线，MIMO 提升空间自由度（degree of freedom，DoF），从而同时增强通信速率与感知精度。MIMO 通信与感知在硬件与信号处理上的相似性，使 MIMO 成为通感一体（integrated sensing and communication，ISAC）的关键技术，而 ISAC 是下一代无线网络的重要特征 [4]、[5]。当前基于大规模 MIMO [6] 的第五代（5G）网络引入大量天线以提升 DoF、能量效率与对硬件非理想性的鲁棒性 [7]。在 5G 中，典型的大规模 MIMO 基站配备 64 根天线，其阵列孔径足够紧凑，可以忽略近场效应。因此，早期大规模 MIMO 研究主要关注远场场景 [8]–[10]。

在第六代（6G）网络中，研究重点转向超大规模 MIMO（extremely large-scale MIMO，XL-MIMO）系统 [11]、[12]，其天线数可达数百甚至数千。这显著增大了阵列尺寸，导致信号电磁特性发生根本变化 [13]。特别地，随着阵列尺寸增大，基站周围的近场区域会大幅扩展，在毫米波与太赫兹等更高频段尤为明显。与信号以平面波传播的远场场景不同，近场信号呈现球面波传播，因而需要从新的视角审视通信与感知性能。

本文关注近场感知（NISE）性能。从感知角度看，传统远场感知在空间域只能分辨信号的角度信息，目标到基站距离的估计一般依赖系统带宽 [4]、[14]，这意味着准确估计距离需要相当大的带宽。相反，NISE 受益于球面波传播，使天线阵列能够同时辨识波的方向与传播距离 [13]。这一能力支持在空间域估计目标距离，从而降低对大量带宽的依赖。因此，现有 NISE 研究大多聚焦于窄带系统下的基本极限 [15]–[22]。Cramér-Rao 界（CRB）是评估感知性能的常用数学方法，因其在一定温和且一般的条件下为无偏估计器提供了可处理且紧的下界。具体而言，[15] 与 [16] 分别推导了单站与双站窄带 NISE 的条件与非条件 CRB；[17] 进一步比较了单站窄带 NISE 系统中的多种确定性性能界。然而，上述工作推导的 CRB 要么依赖近场信道的 Fresnel 近似，要么依赖偏导数的数值计算，难以避免近似误差，也难以获得系统设计洞见。为此，[18] 首次基于精确近场信道模型推导了窄带 NISE 的闭式 CRB，并针对若干关键系统参数开展渐近分析。此外，[19] 推导了宽带多载波系统中 NISE 的 CRB，并通过 Monte-Carlo 仿真验证其准确性；[20] 研究了运动目标场景下 NISE 的 CRB，同时考虑 ULA 与 UCA，但聚焦于简单窄带场景。近期还有一些工作基于电磁理论研究窄带 NISE 的 CRB，如 [21] 与 [22]。然而，宽带系统中 NISE 的基本感知性能刻画尚未得到探索。

### A. 动机与贡献

如上所述，NISE 与远场感知的关键差异在于其距离估计途径。NISE 可直接在空间域测量距离，而远场感知依赖大量带宽以获得准确距离估计。这引出一个有趣的问题：大带宽如何影响 NISE 性能？虽然该问题在 [19] 中已有初步探索，但其推导的 CRB 缺乏闭式表达式，难以直接理解并量化感知性能与关键系统参数之间的关系。此外，现有 NISE 工作大多聚焦于 ULA 或均匀平面阵；然而近期研究表明，UCA 有潜力显著扩展近场区域，为 NISE 性能带来有前景的提升 [14]、[20]、[23]。

基于上述考虑以及朝 ISAC 范式发展的趋势，本文研究传统宽带通信系统中 NISE 的性能，并同时探讨 ULA 与 UCA 两种阵列。本文主要贡献概括如下：

- 我们研究采用 OFDM 的传统宽带 MIMO 通信系统中 NISE 的性能。我们给出同时考虑近场效应与宽带效应的 NISE 信号与信道模型；基于这些模型，推导目标方向与距离的最大似然估计器。
- 我们分别推导 ULA 与 UCA 的宽带 MIMO-OFDM 系统中 NISE 的 CRB 闭式解析表达式。基于这些表达式，分析渐近 CRB 性能，揭示阵列尺寸、带宽与场区等关键系统参数对 NISE 性能的影响。
- 我们通过数值结果验证解析结果与最大似然估计的有效性。解析与数值结果均表明：1）更大的阵列孔径并不总能带来更好的 NISE 性能，在带宽超大时尤其如此；2）随着目标距离增大，大带宽为 NISE 提供估计误差上限；3）真正从根本上改变宽带 NISE 性能的是阵列孔径与带宽，而非天线数与子载波数；4）在相同孔径下，UCA 相比 ULA 提供更优且与角度无关的宽带 NISE 性能。

### B. 组织结构与记号

全文其余部分组织如下：第 II 节介绍宽带 NISE 的系统模型；第 III 节推导宽带 NISE 的最大似然估计方法；第 IV 节深入分析宽带 NISE 的性能；第 V 节讨论数值结果；第 VI 节总结全文。

**记号：** 标量、粗体小写字母与粗体大写字母分别表示标量、向量与矩阵。矩阵 $X$ 的转置、共轭、共轭转置、迹、行列式与 Frobenius 范数分别记作 $X^T$、$X^*$、$X^H$、$\mathrm{tr}(X)$、$\det(X)$ 与 $\|X\|_F$。$\mathcal{CN}(0,\sigma^2)$ 表示零均值、方差为 $\sigma^2$ 的循环对称复高斯随机分布。$\mathbf I_N$ 表示 $N\times N$ 单位矩阵。$\Re(\cdot)$ 与 $\Im(\cdot)$ 表示复数的实部与虚部。$\mathbb E[\cdot]$ 表示随机变量的统计期望。

## II. 系统模型

本文研究采用双功能 $N$ 天线基站的宽带 MIMO-OFDM 通信系统中 NISE 的性能。在基站端，我们假设通过环行器（circulator）共享天线阵列进行收发，并借助全双工技术实现完美的自干扰消除 [24]。此外，通信用户执行标准 OFDM 接收操作。本文聚焦于感知层面。

如图 1 所示，我们考察最简单的场景：二维坐标系中的一个点状目标，采用近场信道模型。假设目标具有固定位置或极低速度，多普勒频率可忽略（脚注 1）。目标相对于坐标系原点的角度与距离分别记为 $\theta$ 与 $r$。

> 脚注 1（原文）：与远场系统不同，近场系统中的多普勒频率呈现显著不同的特性，因为它同时受目标的径向与横向速度影响 [25]。分析近场多普勒频率对感知性能的影响超出本文范围，留待未来工作。

### A. 发射信号模型

考虑包含 $L$ 个 OFDM 符号的 OFDM 帧。令 $f_c$ 表示载频，$M$ 表示子载波数，$T_s$ 表示 OFDM 符号的基本时长，$T_{\mathrm{cp}}$ 表示循环前缀（CP）时长。于是，子载波间隔、总带宽与总符号时长分别为 $\Delta f=1/T_s$、$B=M\Delta f$、$T_{\mathrm{tot}}=T_s+T_{\mathrm{cp}}$。则一个 OFDM 帧上的基带发射信号可表示为 [26]

$$
\bar{x}(t)=\frac{1}{\sqrt{M}}\sum_{l=0}^{L-1}\sum_{m=0}^{M-1}\bar{x}_m(l)e^{j2\pi\delta_m\Delta f\left(t-lT_{\mathrm{tot}}\right)}\Pi\left(\frac{t-lT_{\mathrm{tot}}}{T_{\mathrm{tot}}}\right), \tag{1}
$$

其中 $\bar{x}_m(l)\in\mathbb C^{N\times1}$ 表示第 $l$ 个 OFDM 符号中第 $m$ 个子载波上的信号，$\Pi(t)$ 表示矩形函数（当 $t\in[0,1]$ 时取 1，否则取 0），$\delta_m=\frac{2m-M+1}{2}$。尽管全部通信数据信号都可用于感知，但为实现完整的发射自由度以形成最优感知波束，仍需要额外的专用感知信号，于是第 $m$ 个子载波上的发射信号为 [27]

$$
\bar{x}_m(l)=\sum_{k=1}^{K}\mathbf w_{m,k}c_{m,k}(l)+\mathbf s_m(l). \tag{2}
$$

这里 $K$ 表示通信用户数，$\mathbf w_{m,k}\in\mathbb C^{N\times1}$ 为在第 $m$ 个子载波上向第 $k$ 个用户传递数据符号 $c_{m,k}(l)$ 的波束成形器，$\mathbf s_m(l)\in\mathbb C^{N\times1}$ 为专用感知信号。假设数据符号 $c_{m,k}(l)$ 独立同分布且功率为 1，并与专用感知信号 $\mathbf s_m(l)$ 相互独立。因此，第 $m$ 个子载波上发射信号的协方差矩阵可计算为 $\bar{\mathbf R}_m=\mathbb E\left[\bar{\mathbf x}_m(l)\bar{\mathbf x}_m^H(l)\right]=\sum_{k=1}^{K}\mathbf w_{m,k}\mathbf w_{m,k}^H+\mathbf R_s$，其中 $\mathbf R_s=\mathbb E\left[\mathbf s_m(l)\mathbf s_m^H(l)\right]$ 表示专用感知信号的协方差矩阵。

本文关注面向感知优先的发射信号设计 [28]。具体而言，每个子载波上的发射信号被设计为形成最优感知波束。我们假设目标先验未知这一实际场景；此时，为保证最优的最坏情况感知性能，发射信号需要在空间上为白噪声 [29]，即

$$
\bar{\mathbf R}_m\triangleq\mathbb E\left[\bar{\mathbf x}_m(l)\bar{\mathbf x}_m^H(l)\right]=\frac{P_m}{N}\mathbf I_N,\quad\forall m, \tag{3}
$$

其中 $P_m$ 表示分配给第 $m$ 个子载波的功率。在上述协方差矩阵约束下，式 (2) 中的发射信号可进一步优化以最大化通信性能。关于提升各子载波通信性能的相应系统设计与优化方法，可参见 [28] 的全面讨论。下文关注式 (3) 条件下的感知性能。

### B. 接收信号模型

令 $\mathbf r=[r\cos\theta,r\sin\theta]^T\in\mathbb R^2$ 与 $\mathbf q_n\in\mathbb R^2$ 分别表示目标与基站第 $n$ 根天线的坐标。于是基站天线阵列的孔径由 $D=\max_{i,j}\|\mathbf q_i-\mathbf q_j\|$ 给出。根据近场模型，第 $n$ 根天线到目标的传播距离需按精确欧氏距离 $r_n=\|\mathbf r-\mathbf q_n\|$ 计算。我们考虑感知系统中两种典型的天线阵列几何：ULA 与 UCA [30]。令 $d$ 表示天线间距，坐标系原点取在天线阵列中心。于是这两种阵列几何下的距离 $r_n$ 如下。

- **ULA：** 假设 ULA 沿 $x$ 轴部署，第 $n$ 根天线的坐标为 $\mathbf q_n=[\chi_nd,0]^T$，其中 $\chi_n=n-\frac{N-1}{2}$。因此距离 $r_n$ 可表示为

$$
r_n=\sqrt{r^2+\chi_n^2d^2-2r\chi_nd\cos\theta}. \tag{4}
$$

- **UCA：** 对 UCA，天线以间距 $d$ 均匀部署在圆周上。第 $n$ 根天线的坐标为 $\mathbf q_n=[R\cos\psi_n,R\sin\psi_n]^T$，其中 $R=\frac{Nd}{2\pi}$ 为 UCA 半径，$\psi_n=\frac{2\pi n}{N}$。因此距离 $r_n$ 可表示为

$$
r_n=\sqrt{r^2+R^2-2rR\cos\left(\theta-\psi_n\right)}. \tag{5}
$$

于是，由目标反射的回波信号自第 $n$ 根天线到基站第 $i$ 根天线的往返传播时延为

$$
\tau_{n,i}=\frac{r_n+r_i}{c}, \tag{6}
$$

其中 $c$ 表示光速。令 $x_{m,n}(l)=[\mathbf x_m(l)]_n$ 表示第 $n$ 根天线在第 $m$ 个子载波上发送的基带信号，则基站第 $i$ 根天线接收到的无噪连续时间基带信号可建模为 [31]、[32]

$$
\begin{aligned}
y_i(t)=\frac{1}{\sqrt{M}}&\sum_{n=1}^{N}\sum_{l=0}^{L-1}\sum_{m=0}^{M-1}\beta_{m,n,i}x_{m,n}(l)e^{j2\pi\delta_m\Delta f\left(t-\tau_{n,i}-lT_{\mathrm{tot}}\right)}\\
&\times e^{-j2\pi f_c\tau_{n,i}}\Pi\left(\frac{t-\tau_{n,i}-lT_{\mathrm{tot}}}{T_{\mathrm{tot}}}\right),
\end{aligned}\tag{7}
$$

其中 $\beta_{m,n,i}$ 表示第 $m$ 个子载波上从第 $n$ 根发射天线到第 $i$ 根接收天线的路径的频率相关信道增益。根据雷达距离方程 [33]，$\beta_{m,n,i}$ 可建模为

$$
\beta_{m,n,i}=\frac{\sqrt{\epsilon_m}\beta_r}{r_nr_i},\qquad
\epsilon_m=\frac{G_{t,m}G_{r,m}\lambda_m^2}{(4\pi)^3}. \tag{8}
$$

上式中，$\beta_r$ 刻画目标反射引起的幅度与相位变化，$G_{t,m}$ 与 $G_{r,m}$ 表示频率 $f_m$ 处的天线增益，$\lambda_m=c/f_m$ 表示波长。

随后，在 $t=lT_{\mathrm{tot}}+T_{\mathrm{cp}}+\frac{kT_s}{M}$（$k=0,\ldots,M-1$）处对 $y_i(t)$ 采样，可得到去掉 CP 后第 $l$ 个 OFDM 符号中的离散时间信号模型。忽略常数项后，无噪离散时间信号模型为 [26]

$$
\begin{aligned}
y_{k,i}(l)&=\frac{1}{\sqrt{M}}\sum_{n=1}^{N}\sum_{m=0}^{M-1}\beta_{m,n,i}x_{m,n}(l)e^{j2\pi\delta_m\Delta f\left(\frac{kT_s}{M}-\tau_{n,i}\right)}e^{-j2\pi f_c\tau_{n,i}}\\
&=\frac{1}{\sqrt{M}}\sum_{n=1}^{N}\sum_{m=0}^{M-1}\beta_{m,n,i}x_{m,n}(l)e^{-j\frac{2\pi f_m}{c}\left(r_n+r_i\right)}e^{j2\pi\frac{mk}{M}},
\end{aligned}\tag{9}
$$

其中 $f_m=f_c+\delta_m\Delta f$ 为第 $m$ 个子载波的频率。令 $\tilde{\mathbf y}_k(l)=[y_{k,1}(l),\ldots,y_{k,N}(l)]^T$ 表示基站接收全部信号的堆叠向量，可表示为

$$
\tilde{\mathbf y}_k(l)=\frac{1}{\sqrt{M}}\sum_{m=0}^{M-1}\frac{\sqrt{\epsilon_m}\beta_r}{r_0^2}\tilde{\mathbf a}_m(\theta,r)\tilde{\mathbf a}_m^T(\theta,r)\bar{\mathbf x}_m(l)e^{j2\pi\frac{mk}{M}}, \tag{10}
$$

其中 $\tilde{\mathbf a}_m(\theta,r)$ 表示近场阵列响应矢量，由

$$
\tilde{\mathbf a}_m(\theta,r)=\left[\frac{r_0}{r_1}e^{-jk_mr_1},\ldots,\frac{r_0}{r_N}e^{-jk_mr_N}\right]^T \tag{11}
$$

给出，其中 $r_0=\frac{1}{N}\sum_{n=1}^{N}r_n$ 表示平均距离，$k_m=2\pi f_m/c$ 表示波数。随后，通过对第 $l$ 个 OFDM 符号中第 $m$ 个子载波上的含噪信号做离散傅里叶变换（DFT），可得

$$
\begin{aligned}
\mathbf y_m(l)&=\frac{1}{\sqrt{M}}\sum_{k=0}^{M-1}\tilde{\mathbf y}_k(l)e^{-j2\pi\frac{mk}{M}}+\mathbf z_m(l)\\
&=\frac{\sqrt{\epsilon_m}\beta_r}{r_0^2}\mathbf a_m(\theta,r)\mathbf a_m^T(\theta,r)\bar{\mathbf x}_m(l)+\mathbf z_m(l),
\end{aligned}\tag{12}
$$

其中 $\mathbf z_m(l)$ 表示加性白高斯噪声，其每个元素服从独立同分布的 $\mathcal{CN}(0,\sigma_w^2)$。为简化分析，我们将信号模型改写为

$$
\mathbf y_m(l)=\beta\mathbf A_m(\theta,r)\mathbf x_m(l)+\mathbf z_m(l), \tag{13}
$$

其中 $\beta=\beta_r/r_0^2$，$\mathbf A_m(\theta,r)=\mathbf a_m(\theta,r)\mathbf a_m^T(\theta,r)$，$\mathbf x_m(l)=\sqrt{\epsilon_m}\bar{\mathbf x}_m(l)$。为简化分析，假设缩放后的发射功率 $\epsilon_mP_m$ 恒为 $P$。则由式 (3) 可得缩放后发射信号的协方差为

$$
\mathbf R_m=\mathbb E\left[\mathbf x_m(l)\mathbf x_m^H(l)\right]=\frac{P}{N}\mathbf I_N,\quad\forall m. \tag{14}
$$

将 $\mathbf y_m(l)$ 在 $L$ 个 OFDM 符号上聚合，得到第 $m$ 个子载波上接收的整体信号矩阵：

$$
\mathbf Y_m=\left[\mathbf y_m(1),\ldots,\mathbf y_m(L)\right]=\beta\mathbf A_m(\theta,r)\mathbf X_m+\mathbf Z_m, \tag{15}
$$

其中 $\mathbf A_m(\theta,r)=\mathbf a_m(\theta,r)\mathbf a_m^T(\theta,r)$，$\mathbf X_m=\left[\mathbf x_m(1),\ldots,\mathbf x_m(L)\right]$，$\mathbf Z_m=\left[\mathbf z_m(1),\ldots,\mathbf z_m(L)\right]$。

### C. 场区边界

本小节简要考察与天线阵列相关的电磁场边界，以明确所提方法与解析结果的适用场景。天线阵列周围的电磁场通常分为三个区域：电抗近场、辐射近场与辐射远场。电抗近场由衰减快于平方反比律、且不参与辐射的波分量主导，即使在无限大天线阵列情形下也被限制在距发射端数个波长以内，如 [34] 所证明。因此，其影响已在我们前述模型中排除。

电抗近场之外是辐射场，其中电磁波呈现正常辐射行为，幅度与 $1/z$ 成正比、相位为 $2\pi fz/c$，其中 $z$ 与 $f$ 分别表示传播距离与波频率，如式 (11) 所示。该区域进一步划分为辐射近场与辐射远场，以与阵列孔径上相位变化相关的衍射行为加以区分。频率 $f$ 下第 $n$ 根天线到目标信号的相位表示为 $e^{-j\frac{2\pi f}{c}r_n}$，其中传播距离

$$
r_n=\left\|\mathbf r-\mathbf q_n\right\|=\sqrt{r^2-2r\mathbf k^T(\theta)\mathbf q_n+\left\|\mathbf q_n\right\|^2}, \tag{16}
$$

其中 $\mathbf k(\theta)=[\cos\theta,\sin\theta]^T$。必须使用这一精确距离来刻画辐射近场中的衍射。在辐射远场（即 Fraunhofer 衍射）中，距离 $r_n$ 可近似为

$$
r_n\approx r-\mathbf k^T(\theta)\mathbf q_n, \tag{17}
$$

该式由一阶 Taylor 展开 $\sqrt{1+x}\approx1+\frac{1}{2}x$ 得到。为保证该近似引入的相位误差不超过 $\pi/8$，必须满足条件 $r\ge\frac{2D^2}{\lambda}$，其中 $\lambda=c/f$。这定义了 Rayleigh 距离，标志辐射近场与辐射远场的边界。然而，式 (17) 仅在 $r\to\infty$ 时严格成立。因此，为完整捕捉近场效应，我们在整个辐射场范围内使用式 (16) 的精确距离表达式来评估相位变化。

为清晰起见，我们暂时忽略式 (11) 中的幅度变化，假设 $r_0\approx r_1\approx r_2\approx\cdots\approx r_N$。对 ULA，当阵列孔径未显著大于目标距离时该假设成立 [13]；对 UCA，由式 (5)，仅当半径 $R$ 与目标距离 $r$ 可比时该假设失效。在此假设下，有 $r_0/r_n\approx1$（$\forall n$），从而可将阵列响应矢量近似为

$$
\tilde{\mathbf a}_m(\theta,r)\approx\mathbf a_m(\theta,r)=\left[e^{-jk_mr_1},\ldots,e^{-jk_mr_N}\right]^T, \tag{18}
$$

该式仅包含跨天线阵列的相位变化。除另有说明，全文使用近似阵列响应矢量 $\mathbf a_m(\theta,r)$。需要强调，式 (14) 中的空间白发射协方差仅对仅相位的近似阵列响应矢量 $\mathbf a_m(\theta,r)$ 最优；若与精确阵列响应矢量 $\tilde{\mathbf a}_m(\theta,r)$ 配合使用，可能导致显著的性能退化，第 V 节将予以展示。

### D. 问题表述

在所考虑的单站感知设置中，缩放后的数据信号 $\mathbf X_m$ 在基站已知。因此，近场感知问题即从接收信号矩阵 $\{\mathbf Y_m\}_{m=0}^{M-1}$ 中估计其余未知参数，即复信道增益 $\beta$、角度 $\theta$ 与距离 $r$。注意虽然 $\beta$ 依赖于 $r$，但由于反射系数 $\beta_r$ 未知，从 $\beta$ 反推 $r$ 并不容易；因此我们将 $\beta$ 视为单一未知参数。下文主要关注 $\theta$ 与 $r$ 的估计性能，它们共同决定目标位置。

## III. 最大似然估计

本节研究从接收信号中估计位置参数 $\theta$ 与 $r$ 的方法。从理论角度看，最小方差无偏估计器（minimum-variance unbiased estimator，MVUE）提供可能的最小方差，并能达到 CRB；但在许多实际情形中，由于信号模型的复杂性，获得 MVUE 困难甚至不可能 [35, Section IV.D]。作为替代，最大似然估计（MLE）被广泛采用且具有优良的估计性能 [35, Section IV.D]。MLE 还具有良好的渐近性质：在高信噪比（signal-to-noise ratio，SNR）与大量快拍（本文中为 OFDM 符号数）下，其估计方差趋近 CRB。关于 MLE 估计方差的进一步讨论可参见 [36]–[38]。

现在推导 $\theta$ 与 $r$ 的 MLE。在所考虑的条件模型中，测量向量服从复高斯分布 $\mathbf y_m(l)\sim\mathcal{CN}\left(\beta\mathbf A_m(\theta,r)\mathbf x_m(l),\sigma_w^2\mathbf I_N\right)$。因此，从数据 $\mathbf Y$ 估计未知变量 $\boldsymbol\xi=[\beta,\theta,r]^T$ 的对数似然函数为

$$
\log f_{\mathbf Y}(\mathbf Y;\boldsymbol\xi)=-LNM\log\left(\pi\sigma_w^2\right)-\frac{1}{\sigma_w^2}\sum_{l=0}^{L-1}\sum_{m=0}^{M-1}\left\|\mathbf y_m(l)-\beta\mathbf A_m(\theta,r)\mathbf x_m(l)\right\|^2. \tag{19}
$$

因此，使似然最大的 $\boldsymbol\xi$ 的估计器为

$$
\begin{aligned}
\left\{\hat\beta,\hat\theta,\hat r\right\}
&=\arg\min_{\beta,\theta,r}\sum_{l=0}^{L-1}\sum_{m=0}^{M-1}\left\|\mathbf y_m(l)-\beta\mathbf A_m(\theta,r)\mathbf x_m(l)\right\|^2\\
&=\arg\min_{\beta,\theta,r}\sum_{m=0}^{M-1}\left\|\mathbf Y_m-\beta\mathbf A_m(\theta,r)\mathbf X_m\right\|_F^2.
\end{aligned}\tag{20}
$$

对任意给定 $\theta$ 与 $r$，最优估计器可作为 $\theta$ 与 $r$ 的函数得到：

$$
\hat\beta=\arg\min_{\beta}\sum_{m=0}^{M-1}\left\|\mathbf Y_m-\beta\mathbf A_m(\theta,r)\mathbf X_m\right\|_F^2
=\frac{\sum_{m=0}^{M-1}\mathrm{tr}\left(\mathbf Y_m\mathbf X_m^H\mathbf A_m^H(\theta,r)\right)}{\sum_{m=0}^{M-1}\left\|\mathbf A_m(\theta,r)\mathbf X_m\right\|_F^2}. \tag{21}
$$

将上述解代回式 (20)，得

$$
\sum_{m=0}^{M-1}\left\|\mathbf Y_m-\hat\beta\mathbf A_m(\theta,r)\mathbf X_m\right\|_F^2
=\sum_{m=0}^{M-1}\left\|\mathbf Y_m\right\|_F^2
-\frac{\left|\sum_{m=0}^{M-1}\mathrm{tr}\left(\mathbf Y_m\mathbf X_m^H\mathbf A_m^H(\theta,r)\right)\right|^2}{\sum_{m=0}^{M-1}\left\|\mathbf A_m(\theta,r)\mathbf X_m\right\|_F^2}. \tag{22}
$$

由于第一项 $\sum_{m=0}^{M-1}\|\mathbf Y_m\|_F^2$ 为常数，可得 $\theta$ 与 $r$ 的等价估计器：

$$
\left\{\hat\theta,\hat r\right\}
=\arg\max_{\theta,r}
\frac{\left|\sum_{m=0}^{M-1}\mathrm{tr}\left(\mathbf Y_m\mathbf X_m^H\mathbf A_m^H(\theta,r)\right)\right|^2}{\sum_{m=0}^{M-1}\left\|\mathbf A_m(\theta,r)\mathbf X_m\right\|_F^2}. \tag{23}
$$

上述问题的解 $\hat\theta$ 与 $\hat r$ 可通过在感兴趣区域上做二维网格搜索获得。然而，解的精度受网格分辨率限制；为保证最优性需要细网格，这可能带来不可接受的计算复杂度。作为补救，可先用粗网格找到近似解，再以该粗略解作为 Newton 类方法（如拟 Newton 法 [39]）的初始点，从而以快速收敛与低复杂度获得问题 (23) 描述的最优估计 [30]。所得解的精度可用均方误差（mean-squared error，MSE）评估：

$$
\mathrm{MSE}_\theta=\frac{1}{Q}\sum_{q=1}^{Q}\left(\theta-\hat\theta_q\right)^2,\qquad
\mathrm{MSE}_r=\frac{1}{Q}\sum_{q=1}^{Q}\left(r-\hat r_q\right)^2, \tag{24}
$$

其中 $Q$ 表示实验总次数，$\hat\theta_k$ 与 $\hat r_k$ 分别表示第 $k$ 次实验中真值 $\theta$ 与 $r$ 的估计。

## IV. 性能分析

本节分析角度与距离估计的性能。由于推导式 (24) 中 MSE 的闭式表达式颇具挑战，我们采用广泛使用的 CRB，它在一般条件下为无偏估计的 MSE 提供紧的下界 [15]–[18]。为推导 CRB，首先将信号 $\{\mathbf Y_m\}_{m=0}^{M-1}$ 堆叠为单一向量：

$$
\mathbf y=\beta\underbrace{\begin{bmatrix}\mathrm{vec}\left(\mathbf A_0(\theta,r)\mathbf X_0\right)\\
\vdots\\
\mathrm{vec}\left(\mathbf A_{M-1}(\theta,r)\mathbf X_{M-1}\right)\end{bmatrix}}_{\mathbf u(\theta,r)}
+\begin{bmatrix}\mathrm{vec}\left(\mathbf Z_0\right)\\
\vdots\\
\mathrm{vec}\left(\mathbf Z_{M-1}\right)\end{bmatrix}, \tag{25}
$$

显然观测信号为复白高斯，即 $\mathbf y\sim\mathcal{CN}\left(\beta\mathbf u(\theta,r),\sigma_w^2\mathbf I_{NML}\right)$。令 $\boldsymbol\eta=[\theta,r,\Re(\beta),\Im(\beta)]^T$ 表示待估计的实值参数，$\mathbf J_{\boldsymbol\eta}\in\mathbb C^{4\times4}$ 表示从 $\mathbf y$ 估计 $\boldsymbol\eta$ 的 Fisher 信息矩阵（Fisher information matrix，FIM）。$\mathbf J_{\boldsymbol\eta}$ 第 $i$ 行第 $j$ 列的元素为

$$
\left[\mathbf J_{\boldsymbol\eta}\right]_{i,j}=\frac{2}{\sigma_w^2}\Re\left\{\left(\frac{\partial\left(\beta\mathbf u(\theta,r)\right)}{\partial\eta_i}\right)^H\frac{\partial\left(\beta\mathbf u(\theta,r)\right)}{\partial\eta_j}\right\}, \tag{26}
$$

其中 $\eta_i$ 为 $\boldsymbol\eta$ 的第 $i$ 个元素。因此，定义 $\mathbf u_\theta=\frac{\partial\mathbf u}{\partial\theta}$、$\mathbf u_r=\frac{\partial\mathbf u}{\partial r}$，整体 FIM 可写为

$$
\mathbf J_{\boldsymbol\eta}=\frac{2}{\sigma_w^2}\begin{bmatrix}\mathbf J_{11}&\mathbf J_{12}\\\mathbf J_{12}^T&\mathbf J_{22}\end{bmatrix}, \tag{27}
$$

其中

$$
\mathbf J_{11}=\begin{bmatrix}|\beta|^2\left\|\mathbf u_\theta\right\|^2&|\beta|^2\Re\left(\mathbf u_\theta^H\mathbf u_r\right)\\|\beta|^2\Re\left(\mathbf u_\theta^H\mathbf u_r\right)&|\beta|^2\left\|\mathbf u_r\right\|^2\end{bmatrix}, \tag{28}
$$

$$
\mathbf J_{12}=\begin{bmatrix}\Re\left(\beta^*\mathbf u_\theta^H\mathbf u\right)&-\Im\left(\beta^*\mathbf u_\theta^H\mathbf u\right)\\\Re\left(\beta^*\mathbf u_r^H\mathbf u\right)&-\Im\left(\beta^*\mathbf u_r^H\mathbf u\right)\end{bmatrix}, \tag{29}
$$

$$
\mathbf J_{22}=\begin{bmatrix}\left\|\mathbf u\right\|^2&0\\0&\left\|\mathbf u\right\|^2\end{bmatrix}. \tag{30}
$$

估计 $\theta$ 与 $r$ 的 CRB 可分别由 [18] 计算为

$$
\mathrm{CRB}_\theta=\left[\mathbf J_{\boldsymbol\eta}^{-1}\right]_{1,1}=\frac{\sigma_w^2\left\|\mathbf u_r\right\|^2\sin^2\Theta}{2|\beta|^2\det\mathbf Q}, \tag{31}
$$

$$
\mathrm{CRB}_r=\left[\mathbf J_{\boldsymbol\eta}^{-1}\right]_{2,2}=\frac{\sigma_w^2\left\|\mathbf u_\theta\right\|^2\sin^2\Omega}{2|\beta|^2\det\mathbf Q}, \tag{32}
$$

对无偏估计器满足 $\mathrm{MSE}_\theta\ge\mathrm{CRB}_\theta$ 与 $\mathrm{MSE}_r\ge\mathrm{CRB}_r$。更具体地，

$$
\sin^2\Omega=1-\frac{\left|\mathbf u_\theta^H\mathbf u\right|^2}{\left\|\mathbf u_\theta\right\|^2\left\|\mathbf u\right\|^2},\qquad
\sin^2\Theta=1-\frac{\left|\mathbf u_r^H\mathbf u\right|^2}{\left\|\mathbf u_r\right\|^2\left\|\mathbf u\right\|^2},\qquad
\mathbf Q=\begin{bmatrix}\left\|\mathbf u_\theta\right\|^2\sin^2\Omega&\frac{\Re\left(\mathbf u^H\boldsymbol\Phi\mathbf u\right)}{\left\|\mathbf u\right\|^2}\\[4pt]\frac{\Re\left(\mathbf u^H\boldsymbol\Phi\mathbf u\right)}{\left\|\mathbf u\right\|^2}&\left\|\mathbf u_r\right\|^2\sin^2\Theta\end{bmatrix}, \tag{33}
$$

其中 $\boldsymbol\Phi=\mathbf u_\theta^H\mathbf u_r\mathbf I-\mathbf u_\theta\mathbf u_r^H$。根据式 (31) 与 (32)，CRB 的取值由 $\|\mathbf u\|^2$、$\|\mathbf u_\theta\|^2$、$\|\mathbf u_r\|^2$、$\mathbf u_\theta^H\mathbf u_r$、$\mathbf u_\theta^H\mathbf u$、$\mathbf u_r^H\mathbf u$ 等项决定。下面在仅相位模型 (18) 下推导这些项。

> 记号说明：与原文一致，$\mathbf u_\theta$、$\mathbf u_r$ 表示导数向量（粗体），而 $u_\theta=\sum_{n}(\partial r_n/\partial\theta)^2$、$u_r=\sum_{n}(\partial r_n/\partial r)^2$ 等为标量；译文以粗体区分向量、以正体 $u_\theta,u_r$ 表示标量。

由 $\mathbf R_m=\frac{P}{N}\mathbf I_N$，$\|\mathbf u\|^2$ 的表达式可推导为

$$
\|\mathbf u\|^2=\sum_{m=0}^{M-1}\left\|\mathrm{vec}\left(\mathbf A_m(\theta,r)\mathbf X_m\right)\right\|^2
\overset{(a)}{\approx}\sum_{m=0}^{M-1}\frac{PL}{N}\mathrm{tr}\left(\mathbf A_m(\theta,r)\mathbf A_m^H(\theta,r)\right)=PLNM, \tag{34}
$$

其中 $(a)$ 来自等式 $\|\mathrm{vec}(\mathbf X)\|^2=\mathrm{tr}(\mathbf X\mathbf X^H)$ 及近似 $\frac{1}{L}\mathbf X_m\mathbf X_m^H\approx\mathbb E[\mathbf x_m(l)\mathbf x_m(l)^H]=\mathbf R_m=\frac{P}{N}\mathbf I_N$。为进一步计算涉及 $\mathbf u_\theta$ 与 $\mathbf u_r$ 的中间参数，首先定义如下导数：

$$
\begin{aligned}
\dot{\mathbf G}_{\theta,m}&\triangleq\frac{\partial\mathbf A_m(\theta,r)}{\partial\theta}=-jk_m\left(\dot{\mathbf D}_\theta\mathbf A_m(\theta,r)+\mathbf A_m(\theta,r)\dot{\mathbf D}_\theta\right),\\
\dot{\mathbf G}_{r,m}&\triangleq\frac{\partial\mathbf A_m(\theta,r)}{\partial r}=-jk_m\left(\dot{\mathbf D}_r\mathbf A_m(\theta,r)+\mathbf A_m(\theta,r)\dot{\mathbf D}_r\right),
\end{aligned}\tag{35}
$$

其中 $\dot{\mathbf D}_\theta$ 与 $\dot{\mathbf D}_r$ 为对角矩阵，其第 $n$ 个对角元素分别为 $[\dot{\mathbf D}_\theta]_{n,n}=\frac{\partial r_n}{\partial\theta}$ 与 $[\dot{\mathbf D}_r]_{n,n}=\frac{\partial r_n}{\partial r}$。于是 $\mathbf u_\theta$ 与 $\mathbf u_r$ 可重写为

$$
\mathbf u_i=\begin{bmatrix}\mathrm{vec}\left(\dot{\mathbf G}_{i,0}\mathbf X_0\right)\\\vdots\\\mathrm{vec}\left(\dot{\mathbf G}_{i,M-1}\mathbf X_{M-1}\right)\end{bmatrix},\quad\forall i\in\{\theta,r\}. \tag{36}
$$

随后，按与式 (34) 类似的过程，$\|\mathbf u_\theta\|^2$ 的表达式为

$$
\|\mathbf u_\theta\|^2=\sum_{m=0}^{M-1}\frac{k_m^2PL}{N}\left\|\dot{\mathbf D}_\theta\mathbf A_m(\theta,r)+\mathbf A_m(\theta,r)\dot{\mathbf D}_\theta\right\|_F^2
=\frac{2k_0^2PLM_2}{N}\left(Nu_\theta+c_\theta^2\right), \tag{37}
$$

其中 $k_0=2\pi/c$，$M_2=\sum_{m=0}^{M-1}f_m^2=Mf_c^2+\frac{M(M^2-1)}{12}\Delta f^2$，$u_\theta=\sum_{n=1}^{N}\left(\frac{\partial r_n}{\partial\theta}\right)^2$，$c_\theta=\sum_{n=1}^{N}\frac{\partial r_n}{\partial\theta}$。类似可证

$$
\|\mathbf u_r\|^2=\frac{2k_0^2PLM_2}{N}\left(Nu_r+c_r^2\right), \tag{38}
$$

$$
\mathbf u_\theta^H\mathbf u_r=\frac{2k_0^2PLM_2}{N}\left(N\varepsilon+c_\theta c_r\right), \tag{39}
$$

$$
\mathbf u_\theta^H\mathbf u=-2jk_0PLM_1c_\theta, \tag{40}
$$

$$
\mathbf u_r^H\mathbf u=-2jk_0PLM_1c_r, \tag{41}
$$

其中 $u_r=\sum_{n=1}^{N}\left(\frac{\partial r_n}{\partial r}\right)^2$，$c_r=\sum_{n=1}^{N}\frac{\partial r_n}{\partial r}$，$\varepsilon=\sum_{n=1}^{N}\frac{\partial r_n}{\partial\theta}\frac{\partial r_n}{\partial r}$，$M_1=\sum_{m=0}^{M-1}f_m=Mf_c$。

将式 (34) 与 (37)–(41) 代入 (31)、(32)，可得到仅相位模型 (18) 下的 CRB：

$$
\mathrm{CRB}_\theta=\frac{NMM_2u_r+\left(MM_2-2M_1^2\right)c_r^2}{4\rho LM_2\left(NMM_2\phi+\left(MM_2-2M_1^2\right)\psi\right)}, \tag{42}
$$

$$
\mathrm{CRB}_r=\frac{NMM_2u_\theta+\left(MM_2-2M_1^2\right)c_\theta^2}{4\rho LM_2\left(NMM_2\phi+\left(MM_2-2M_1^2\right)\psi\right)}, \tag{43}
$$

其中 $\rho=k_0^2|\beta|^2P/\sigma_w^2$，$\phi=u_\theta u_r-\varepsilon^2$，$\psi=u_\theta c_r^2+u_r c_\theta^2-2\varepsilon c_\theta c_r$。然而，CRB 表达式仍然复杂，难以获得有用洞见。因此，下面分别在 ULA 与 UCA 的不同场景与不同近似下分析 CRB 行为。

**注 1。** 式 (42) 与 (43) 给出仅相位模型 (18) 的 CRB。类似地，考虑相位与幅度变化的精确模型 (11) 的 CRB 可用 (31)、(32) 的一般 CRB 表达式求得，但会得到复杂的形式。因此我们聚焦仅相位模型 (18) 的 CRB 以获得更清晰的洞见。此外，评估误设定（misspecified）CRB 是有趣的未来方向：当为仅相位模型设计的估计器应用于精确模型时，误设定 CRB 刻画估计误差的基本极限，并将经典 CRB 作为特例；关于误设定 CRB 的全面推导与综述见 [40]、[41]。

### A. ULA

对 ULA，孔径为 $D=(N-1)d\approx Nd$。以下定理与推论给出 ULA 的 CRB 分析，重点关注天线数、系统带宽与目标距离的影响。

**定理 1。** 当 $N\gg1$ 时，$u_\theta$、$u_r$、$c_\theta$、$c_r$ 与 $\varepsilon$ 的闭式表达式可推导为

$$
u_\theta=\frac{r^3N\sin^2\theta}{D}\left(\frac{D}{r}+\cos\theta\ln\left(\frac{G_1}{G_2}\right)+\frac{\cos2\theta}{\sin\theta}\Xi\right), \tag{44}
$$

$$
u_r=\frac{N-1}{r^2}u_\theta, \tag{45}
$$

$$
c_\theta=\frac{r^2N\sin\theta}{D}\left(\frac{1}{r}\left(\sqrt{G_1}-\sqrt{G_2}\right)+\cos\theta\ln\left(\frac{\sqrt{G_1}+\frac{1}{2}D-r\cos\theta}{\sqrt{G_2}-\frac{1}{2}D-r\cos\theta}\right)\right), \tag{46}
$$

$$
c_r=\frac{rN}{D}\ln\left(\frac{\sqrt{G_1}+\frac{1}{2}D-r\cos\theta}{\sqrt{G_2}-\frac{1}{2}D-r\cos\theta}\right)-\frac{\cos\theta}{r\sin\theta}c_\theta, \tag{47}
$$

$$
\varepsilon=\frac{r^2N\sin\theta}{D}\left(\frac{1}{2}\ln\left(\frac{G_1}{G_2}\right)+\frac{\cos\theta}{\sin\theta}\Xi\right)-\frac{\cos\theta}{r\sin\theta}u_\theta, \tag{48}
$$

其中

$$
\begin{aligned}
G_1&=\frac{1}{4}D^2-rD\cos\theta+r^2,\qquad
G_2=\frac{1}{4}D^2+rD\cos\theta+r^2,\\
\Xi&=\arctan\left(\frac{D-2r\cos\theta}{2r\sin\theta}\right)+\arctan\left(\frac{D+2r\cos\theta}{2r\sin\theta}\right).
\end{aligned}\tag{49}
$$

**证明：** 参见附录 A。

将式 (44)–(48) 代入 (42)、(43)，即可计算 (31)、(32) 中 CRB 的闭式表达式。然而所得表达式仍过于复杂，难以获得有用洞见。因此，下面考察目标位于 ULA 正侧向（broadside）即 $\theta=\pi/2$ 时的 CRB，此时可获得最大有效孔径。

**推论 1。** 当 $\theta=\pi/2$ 且 $N\gg1$ 时，CRB 的闭式表达式为

$$
\mathrm{CRB}_\theta=\frac{3}{\rho LNM r^2\Phi\left(\frac{D}{r}\right)\left(12f_c^2+B^2-\Delta f^2\right)}, \tag{50}
$$

$$
\mathrm{CRB}_r=\frac{3}{\rho LNM\left[12f_c^2\left(1-\Phi\left(\frac{D}{r}\right)-\Psi^2\left(\frac{D}{r}\right)\right)+\left(B^2-\Delta f^2\right)\left(1-\Phi\left(\frac{D}{r}\right)+\Psi^2\left(\frac{D}{r}\right)\right)\right]}, \tag{51}
$$

其中函数 $\Phi(\alpha)$ 与 $\Psi(\alpha)$ 为

$$
\Phi(\alpha)=1-\frac{2}{\alpha}\arctan\left(\frac{\alpha}{2}\right), \tag{52}
$$

$$
\Psi(\alpha)=\frac{1}{\alpha}\ln\left(\frac{\sqrt{\alpha^2+4}+\alpha}{\sqrt{\alpha^2+4}-\alpha}\right). \tag{53}
$$

**证明：** 将 $\theta=\pi/2$ 代入定理 1 的结果以及 (42)、(43) 中的 CRB 即可得证。

在推论 1 中可观察到，$\mathrm{CRB}_\theta$ 与 $\mathrm{CRB}_r$ 分别与以下函数成反比：

$$
\Xi_\theta(r,D)=r^2\Phi\left(\frac{D}{r}\right),\qquad
\Xi_r\left(\frac{D}{r},\frac{B}{f_c}\right)=12\left(1-\Phi\left(\frac{D}{r}\right)-\Psi^2\left(\frac{D}{r}\right)\right)+\frac{B^2-\Delta f^2}{f_c^2}\left(1-\Phi\left(\frac{D}{r}\right)+\Psi^2\left(\frac{D}{r}\right)\right). \tag{54}
$$

当 $M\gg1$（即 $B^2-\Delta f^2\approx B^2$）时这两个函数的行为分别如图 3 与图 2 所示。

由上述数值结果与推论 1，对位于 ULA 正侧向（即 $\theta=\pi/2$）的目标，我们得到如下洞见。

**注 2（带宽的影响）。** $\mathrm{CRB}_\theta$ 与 $\mathrm{CRB}_r$ 均为 $\mathcal O(1/M)$，且随载频 $f_c$ 与带宽 $B$ 增大而减小。相比 $\mathrm{CRB}_r$，$\mathrm{CRB}_\theta$ 受带宽 $B$ 影响较小，这是因为其分母中的 $(12f_c^2+B^2-\Delta f^2)$ 项主要由 $12f_c^2$ 决定，除非 $B^2-\Delta f^2$ 与 $12f_c^2$ 可比，而这在实际中通常不可能。相反，$\mathrm{CRB}_r$ 受带宽 $B$ 影响显著，详见下一注。

**注 3（孔径尺寸的影响）。** $\mathrm{CRB}_\theta$ 为 $\mathcal O(1/N)$，并且如函数 $\Xi_\theta(r,D)$ 所示，依赖于距离 $r$ 与孔径 $D$。图 3 表明，增大孔径 $D$ 对角度估计的改善随 $D$ 增大逐渐减弱；这一现象还可由极限 $\lim_{D\to+\infty}\Phi\left(\frac{D}{r}\right)=1$ 进一步说明。此外，图 3 也表明 $\mathrm{CRB}_\theta$ 与 $r$ 无关，除非目标非常接近 ULA，此时较小的 $r$ 会降低角度估计性能。相反，$\mathrm{CRB}_r$ 为 $\mathcal O(1/N)$，但其对 $r$ 与 $D$ 的依赖更复杂，由函数 $\Xi_r\left(\frac{D}{r},\frac{B}{f_c}\right)$ 刻画。根据图 2(a)，无论带宽如何，总存在使距离感知性能最优的比值 $D/r$，这表明更大的孔径 $D$ 或更近的目标并不必然带来更好的感知性能。此外，对 $D/r\le1$ 的实际情形（如图 2(b) 所示），当实际比值 $B/f_c<0.1$ 时，更大的阵列孔径或更近的目标（即更大的 $D/r$）总体上提升距离估计性能；但在 $B/f_c>0.1$ 的超高值下，这一趋势会反转，此时更大的孔径或更近的目标实际上可能降低距离估计性能。需要注意的是，如此高的 $B/f_c$ 在实际中通常并不常见。

**注 4（性能增益的来源）。** 在所考虑系统中，用于目标感知的总观测数为 $LMN$，其中 $L$、$M$、$N$ 分别表示在时间、频率与空间域采集的观测数。回顾在 $D$ 与 $B$ 固定时，$\mathrm{CRB}_\theta$ 与 $\mathrm{CRB}_r$ 均为 $\mathcal O(1/N)$ 与 $\mathcal O(1/M)$。这表明当阵列孔径与信号带宽保持不变时，增加天线与子载波带来的性能增益仅源于观测总数的增加，而非改变近场与宽带效应；反之，改变阵列孔径或信号带宽会直接改变这些效应，从而从根本上改变感知性能。

以上讨论了正侧向目标的 CRB。第 V 节的数值结果将表明上述结论对任意位置的目标同样成立。为对任意位置目标获得进一步理论洞见，下面通过渐近分析考察估计性能。首先关注阵列尺寸的影响，有如下结果。

**推论 2。** 对固定孔径 $D$，当 $N\to+\infty$ 时，ULA 达到的渐近 CRB 为

$$
\lim_{N\to+\infty}\mathrm{CRB}_\theta=0,\qquad\lim_{N\to+\infty}\mathrm{CRB}_r=0. \tag{55}
$$

**证明：** 上述极限可直接得到，证明从略。

**推论 3。** 对固定天线间距 $d=D/N$，当 $N\to+\infty$ 时，ULA 达到的渐近 CRB 为

$$
\lim_{N\to+\infty}\mathrm{CRB}_\theta=\frac{3d\cos^2\theta}{\rho LM\pi r^3\left(12f_c^2+B^2-\Delta f^2\right)\sin\theta}, \tag{56}
$$

$$
\lim_{N\to+\infty}\mathrm{CRB}_r=\frac{3d\sin\theta}{\rho LM\pi r\left(12f_c^2+B^2-\Delta f^2\right)}. \tag{57}
$$

**证明：** 参见附录 B。

**注 5。** 推论 2 与 3 分别在两种条件下给出 CRB 随天线数 $N$ 增大时的行为：1）固定孔径；2）固定天线间距。第一种条件下，增大 $N$ 会使 CRB 无界减小；第二种条件下，CRB 有下界。然而这并不意味着两个结论相互冲突：实际上在第一种条件下 $d\to0$（$N\to+\infty$），将 $d\to0$ 代入推论 3 的结果即可得到与推论 2 相同的结果。上述观察凸显了减小天线间距对近场感知的重要性，揭示了具有亚半波长间距的新兴天线阵列技术（如动态超表面天线 [42]，或理想连续孔径阵列 [43]）的巨大潜力。此外，推论 3 的结果表明 ULA 的近场感知性能同时取决于目标的方向与距离。

**推论 4。** 对固定天线数 $N$，当 $D\to+\infty$ 时，ULA 达到的渐近 CRB 为

$$
\lim_{D\to+\infty}\mathrm{CRB}_\theta=\begin{cases}\dfrac{3}{\rho LNM r^2\left(12f_c^2+B^2-\Delta f^2\right)},&\theta=\dfrac{\pi}{2},\\[8pt]+\infty,&\theta\ne\dfrac{\pi}{2},\end{cases} \tag{58}
$$

$$
\lim_{D\to+\infty}\mathrm{CRB}_r=+\infty. \tag{59}
$$

**证明：** 参见附录 C。

**注 6。** 推论 3 与 4 分别描述固定天线间距与固定天线数两种情形下 CRB 随阵列孔径 $D$ 趋于无穷时的行为。尽管式 (18) 的近似在这些条件下会失效，这些推论仍提供有价值的洞见。特别地，两个推论表明：在近似的仅相位模型 (18) 下，随 $D\to+\infty$，CRB 要么收敛到某界，要么发散到无穷；这反过来意味着在精确模型 (11) 下 CRB 必然趋于无穷。该现象的关键原因在于式 (3) 中采用了各向同性波束，使功率在所有天线上等分。更具体地，对精确模型，当 $D\to+\infty$ 时，ULA 边缘处越来越多的天线由于距目标较远而产生显著路损，因而变得无效；这降低了可用于目标感知的有效发射功率，导致性能退化。因此，由精确模型刻画的感知性能必然劣于推论 3 与 4 所预测的结果，最终导致 CRB 无界。这一发现进一步印证：增大孔径 $D$ 并不必然改善感知性能。

**推论 5。** 当 $r\to+\infty$ 时，ULA 达到的渐近 CRB 为

$$
\lim_{r\to+\infty}\mathrm{CRB}_\theta=\frac{36}{\rho LNMD^2\left(12f_c^2+B^2-\Delta f^2\right)\sin^2\theta}, \tag{60}
$$

$$
\lim_{r\to+\infty}\mathrm{CRB}_r=\frac{3}{2\rho LNM\left(B^2-\Delta f^2\right)}. \tag{61}
$$

**证明：** 参见附录 D。

**注 7。** 推论 5 描述远场感知系统（注意式 (17) 的远场近似仅在 $r\to\infty$ 时严格成立）中的 CRB。在此情形下，当观测数 $LNM$ 保持不变时，$\mathrm{CRB}_r$ 与阵列孔径 $D$ 无关，仅与带宽 $B$ 有关，这与以往远场感知研究 [44] 一致。此外，在 $M=1$ 的单载波系统中，$B^2-\Delta f^2=0$，从而 $\mathrm{CRB}_r=+\infty$，意味着单载波远场系统中距离不可估。关于 $\mathrm{CRB}_\theta$，在远场系统中为 $\mathcal O(1/D^2)$，这与推论 1 所示的近场情形不同。

### B. UCA

对 UCA，孔径为 $D=2R=Nd/\pi$。于是，关于 UCA 达到的 CRB 有如下定理。

**定理 2。** 当 $N\gg1$ 时，对 $R<r$，UCA 达到的闭式 CRB 为

$$
\mathrm{CRB}_\theta=\frac{6}{\rho LNM R^2\left(12f_c^2+B^2-\Delta f^2\right)}, \tag{62}
$$

$$
\mathrm{CRB}_r=\frac{3}{\rho LNM\left[12f_c^2\left(1-\frac{R^2}{2r^2}-\Upsilon^2\left(\frac{r}{R}\right)\right)+\left(B^2-\Delta f^2\right)\left(1-\frac{R^2}{2r^2}+\Upsilon^2\left(\frac{r}{R}\right)\right)\right]}, \tag{63}
$$

其中 $\Upsilon(\alpha)$ 为单调递增的非初等（超越）函数，由

$$
\Upsilon(\alpha)=\int_{0}^{2\pi}\frac{\alpha-\cos x}{2\pi\sqrt{1-2\alpha\cos x+\alpha^2}}\,dx \tag{64}
$$

给出。对 $R\ge r$，闭式 CRB 为

$$
\mathrm{CRB}_\theta=\frac{6}{\rho LNM r^2\left(12f_c^2+B^2-\Delta f^2\right)}, \tag{65}
$$

$$
\mathrm{CRB}_r=\frac{3}{\rho LNM\left[12f_c^2\left(\frac{1}{2}-\Upsilon^2\left(\frac{r}{R}\right)\right)+\left(B^2-\Delta f^2\right)\left(\frac{1}{2}+\Upsilon^2\left(\frac{r}{R}\right)\right)\right]}. \tag{66}
$$

**证明：** 参见附录 E。

在定理 2 中可观察到，UCA 达到的 $\mathrm{CRB}_r$ 与函数 $\tilde{\Xi}_r\left(\frac{R}{r},\frac{B}{f_c}\right)$ 成反比，该函数由本页下方式 (67) 给出。当 $M\gg1$（即 $B^2-\Delta f^2\approx B^2$）时，该函数的行为如图 4 所示。由这些数值结果与定理 2，我们注意到 ULA 与 UCA 之间的如下差异（注意 $D=2R$）。

$$
\tilde{\Xi}_r\left(\frac{R}{r},\frac{B}{f_c}\right)=\begin{cases}12\left(1-\dfrac{R^2}{2r^2}-\Upsilon^2\left(\dfrac{r}{R}\right)\right)+\dfrac{B^2-\Delta f^2}{f_c^2}\left(1-\dfrac{R^2}{2r^2}+\Upsilon^2\left(\dfrac{r}{R}\right)\right),&R<r,\\[10pt]12\left(\dfrac{1}{2}-\Upsilon^2\left(\dfrac{r}{R}\right)\right)+\dfrac{B^2-\Delta f^2}{f_c^2}\left(\dfrac{1}{2}+\Upsilon^2\left(\dfrac{r}{R}\right)\right),&R\ge r.\end{cases} \tag{67}
$$

**注 8（UCA 的鲁棒性）。** UCA 达到的 $\mathrm{CRB}_\theta$ 与 $\mathrm{CRB}_r$ 与目标角度 $\theta$ 无关。这与性能依赖角度的传统 ULA [15]–[18] 有本质不同，因此 UCA 能提供比 ULA 更稳定的性能。

**注 9（目标在圆外）。** UCA 达到的感知性能取决于目标是位于 UCA 内部还是外部。对式 (62)、(63) 描述的外部目标，UCA 达到的 $\mathrm{CRB}_\theta$ 为 $\mathcal O(1/N)$ 与 $\mathcal O(1/D^2)$，但与 $r$ 无关。这与 ULA 的标度律有本质不同：对内部目标在外的 UCA，角度估计总能从增大 $D$ 中获益，而在 ULA 系统中这些收益随 $D$ 增大而逐渐减弱。此外，若天线间距 $d$ 保持不变，则孔径 $D$ 与天线数成正比，即 $D=Nd/\pi$；此时 UCA 达到的 $\mathrm{CRB}_\theta$ 为 $\mathcal O(1/N^3)$，这也与 ULA 系统有本质不同——在固定 $d$ 的同样情形下，ULA 的 $\mathrm{CRB}_\theta$ 随 $N$ 增大有下界（参见式 (56)）。关于 $\mathrm{CRB}_r$，根据图 4 的结果，与 ULA 系统类似：更大的孔径并不总能提升距离估计性能，尤其在 $B/f_c$ 较大时。

**注 10（目标在圆内）。** 目标在 UCA 内部的情形可视为分布式阵列感知 [4]。如式 (65)、(66) 所述，此时 $\mathrm{CRB}_\theta$ 与孔径 $D$ 无关，而依赖目标距离 $r$；且更大的距离带来更好的角度估计性能，这与 ULA 系统类似。关于 $\mathrm{CRB}_r$，对内部目标，它随孔径 $D$ 增大逐渐收敛到稳定值，如图 4(a) 所示。

下面进一步研究 UCA 达到的渐近 CRB，由以下推论给出。

**推论 6。** 对固定孔径 $D$，当 $N\to+\infty$ 时，UCA 达到的渐近 CRB 为

$$
\lim_{N\to+\infty}\mathrm{CRB}_\theta=0,\qquad\lim_{N\to+\infty}\mathrm{CRB}_r=0. \tag{68}
$$

**证明：** 上述极限可由定理 2 的结果直接得到。

**推论 7。** 对固定天线间距 $d=\pi D/N$，当 $N\to+\infty$ 时，UCA 达到的渐近 CRB 为

$$
\lim_{N\to+\infty}\mathrm{CRB}_\theta=0,\qquad\lim_{N\to+\infty}\mathrm{CRB}_r=0. \tag{69}
$$

**证明：** 对固定天线间距 $d=2\pi R/N$，当 $N\to+\infty$ 时必有 $R>r$。因此由式 (65) 可直接得到第一个极限。对第二个极限，有

$$
\lim_{N\to+\infty}\Upsilon\left(\frac{r}{R}\right)=\lim_{N\to+\infty}\Upsilon\left(\frac{2\pi r}{Nd}\right)=0. \tag{70}
$$

基于上述极限与式 (66) 的表达式，$\mathrm{CRB}_r$ 的极限也可直接得到。证毕。

**注 11。** 推论 6 与 7 表明：当 $N\to+\infty$ 时，UCA 与 ULA 的渐近行为不同。更具体地，对固定天线间距 $d$，ULA 达到的渐近 CRB 有下界，而 UCA 达到的渐近 CRB 无下界。

**推论 8。** 对固定天线数 $N$，当 $D\to+\infty$ 时，UCA 达到的渐近 CRB 为

$$
\lim_{D\to+\infty}\mathrm{CRB}_\theta=\frac{6}{\rho LNM r^2\left(12f_c^2+B^2-\Delta f^2\right)}, \tag{71}
$$

$$
\lim_{D\to+\infty}\mathrm{CRB}_r=\frac{6}{\rho LNM\left(12f_c^2+B^2-\Delta f^2\right)}. \tag{72}
$$

**证明：** 证明与推论 7 的证明类似。

**注 12。** 推论 8 表明，仅增大阵列孔径 $D$ 会使 UCA 的 CRB 收敛到稳定值。这与推论 4 中 ULA 的结果有本质不同——后者的 CRB 随 $D$ 增大趋于无穷。值得注意的是，当 $D\to+\infty$ 时近似式 (18) 对 UCA 仍然有效。

**推论 9。** 当 $r\to+\infty$ 时，UCA 达到的渐近 CRB 为

$$
\lim_{r\to+\infty}\mathrm{CRB}_\theta=\frac{6}{\rho LNM R^2\left(12f_c^2+B^2-\Delta f^2\right)}, \tag{73}
$$

$$
\lim_{r\to+\infty}\mathrm{CRB}_r=\frac{3}{2\rho LNM\left(B^2-\Delta f^2\right)}. \tag{74}
$$

**证明：** 与 $\mathrm{CRB}_\theta$ 相关的第一个极限可直接由与 $r$ 无关的式 (62) 得到。对与 $\mathrm{CRB}_r$ 相关的第二个极限，有 $\lim_{r\to\infty}\frac{R^2}{2r^2}=0$ 且

$$
\lim_{r\to+\infty}\Upsilon\left(\frac{r}{R}\right)=\int_{0}^{2\pi}\frac{1}{2\pi}\,dx=1. \tag{75}
$$

将这两个极限代入式 (63) 即可得到 (74)。证毕。

**注 13。** 比较推论 5 与 9 可观察到：在远场情形下，ULA 与 UCA 表现出相同的距离估计性能，且仅与带宽 $B$ 相关。这是符合预期的，因为远场情形下天线阵列无法在空间域分辨距离信息，因而距离估计性能与阵列几何无关。

## V. 数值结果

本节给出数值结果以验证所推导的 CRB。除另有说明，设置 $f_c=28$ GHz、$B=10$ MHz、$D=5$ m、$L=256$、$N=256$、$M=256$、$|\beta|^2=-30$ dB、$r=20$ m、$\theta=\pi/4$。信噪比定义为 $\mathrm{SNR}=P/\sigma_w^2$，设为 0 dB。

### A. MLE 的性能

图 5 对比 MLE 方法达到的 MSE 与所推导的 CRB。MSE 由 $K=500$ 次实验平均得到。可以看到，对距离估计与角度估计，除极低 SNR（如低于 $-20$ dB）情形外，MLE 方法达到的 MSE 与 CRB 相当；定理 1 与 2 推导的近似也与 CRB 真值一致。这些结果既验证了 MLE 方法的有效性，也验证了所推导 CRB 的正确性。此外，在相同孔径下，UCA 在距离与角度估计上均表现出更低的 MSE，证实了其在感知应用中的优势。

### B. 阵列尺寸的影响

图 6 考察固定阵列孔径 $D$ 或固定天线间距 $d$ 两种条件下天线数 $N$ 对 CRB 的影响。对固定天线间距情形，ULA 取 $d=\lambda_c/2$、UCA 取 $d=\pi\lambda_c/2$，以保证相同孔径，其中 $\lambda_c$ 为对应中心频率 $f_c$ 的信号波长。可观察到：在仅考虑相位变化时，当阵列孔径固定，CRB 随天线数增加而线性下降（对数尺度上）；这是因为额外的天线仅在空间域提供更多观测样本，如注 4 所述。相反，当天线间距固定时，增加天线数同时增大阵列孔径；此时由于近场与空间宽带效应的变化，CRB 呈现非线性行为。特别地，对图 6(a) 所示的非正侧向目标（$\theta=\pi/4$），ULA 达到的 $\mathrm{CRB}_r$ 与 $\mathrm{CRB}_\theta$ 随天线数增加先快速下降，随后如推论 3 所述收敛到极限值；而对图 6(b) 所示的正侧向目标（$\theta=\pi/2$），ULA 达到的 $\mathrm{CRB}_\theta$ 无界下降——这与推论 3 一致，因为此时 $\cos\theta=0$。关于 UCA，无论目标角度如何，$\mathrm{CRB}_r$ 与 $\mathrm{CRB}_\theta$ 均随天线数增加无界下降，与推论 7 一致。

图 6 还评估了同时考虑幅度与相位变化的 CRB，其计算使用式 (11) 的精确阵列响应矢量、式 (14) 的空间白发射协方差以及式 (31)、(32) 的 CRB 公式。有趣的是，对 ULA，当通过增加天线数扩大阵列孔径时，幅度变化导致显著性能损失。这符合预期，也与注 6 的讨论一致：此时式 (14) 的空间白发射协方差不再适用。具体而言，随着 ULA 阵列孔径增大，目标与阵列两端天线之间的链路经历严重路损，对感知贡献很小；然而空间白发射协方差仍向所有天线分配相同功率，这降低了可用于感知的有效功率，导致性能退化。但对 UCA，幅度变化对感知性能影响可忽略，因为显著的幅度变化仅在 UCA 半径接近目标距离时出现。

图 7 进一步研究在保持空域样本（即天线数 $N$）不变时阵列孔径 $D$ 的影响。仅考虑相位变化时，有趣的是，如注 3 所述，更大的孔径并不总能带来更好的感知性能。具体地，对 ULA 与非正侧向目标（$\theta=\pi/4$），孔径大于 102 米会导致 $\mathrm{CRB}_r$ 与 $\mathrm{CRB}_\theta$ 增大，表明感知性能退化，如图 7(a) 所示，这与推论 4 一致。此外，对图 7(b) 所示的正侧向目标（$\theta=\pi/2$），$\mathrm{CRB}_\theta$ 最终收敛到推论 4 给出的极限。对 UCA，无论正侧向还是非正侧向目标，CRB 均收敛到推论 8 描述的极限。类似地，幅度变化会导致性能退化。

### C. 带宽的影响

图 8 研究固定带宽 $B$ 或固定子载波间隔 $\Delta f$ 两种条件下子载波数 $M$ 对 CRB 的影响。与天线数的影响类似，当带宽固定时，增加子载波数仅增加频域观测样本数，从而使 CRB 在对数尺度上线性下降。在固定子载波间隔场景下，增加子载波数同时扩展带宽。从图 8 可以观察到，除非带宽极大，增加带宽对 $\mathrm{CRB}_\theta$ 的影响很小，这与注 2 一致。该结论在图 9 中得到进一步确认——图 9 在保持子载波数 $M$ 不变时仅考察带宽的影响。特别地，要实现角度估计的显著改善，所需带宽超过 105 MHz，这在实际中几乎不可能。此外，结合图 8 与图 9 的结果可得出结论：当带宽较小时，距离估计中的近场增益相当可观；而当带宽较大时，该近场增益可忽略。

### D. 阵列尺寸与带宽之间的权衡

图 10 基于孔径—距离比 $D/r$ 与带宽—载频比 $B/f_c$，展示阵列尺寸与带宽对感知性能的联合影响。由于带宽对角度感知影响较小，我们仅关注距离感知性能。可观察到：当 $B/f_c$ 较小（即小于 0.1）时，对 ULA 与 UCA，当 $D/r\le10$ 时增大 $D/r$ 总能使距离感知性能提升；然而当 $B/f_c$ 极大（如 $B/f_c=0.5$）时，如注 3 所述，增大 $D/r$ 在多数情形下导致感知性能退化。此外，当 $D/r\le1$ 且 $B/f_c\ge0.1$ 时，增大 $D/r$ 带来的性能提升或退化实际上可忽略。这一结果表明，在具有超大带宽的实际感知系统中，阵列孔径设计应更关注角度估计性能并增加空域观测数，因为距离估计几乎仅依赖带宽。

### E. 目标位置的影响

图 11 在 $D=2$ m 时考察目标距离对感知性能的影响。有两个关键观察：第一，带宽越大，距离估计精度越快逼近远场界，表明更大的带宽降低了近场效应的程度；这也凸显出，与宽带系统相比，近场效应在窄带系统中作用更显著。第二，关于角度估计，ULA 与 UCA 达到的 $\mathrm{CRB}_\theta$ 均随 $r$ 增大先下降后收敛到稳定下界，与注 3 的分析一致。

图 12 进一步探讨不同位置目标可达到的 CRB。显然，ULA 的性能受目标角度显著影响：特别地，ULA 达到的距离与角度估计 CRB 随目标偏离正侧向方向而增大，表明感知性能退化。然而，如注 8 所述，UCA 的感知性能与目标角度无关。

## VI. 结论

本文研究了 OFDM 通信系统中宽带与近场现象对感知性能的联合影响，深入分析了角度与距离估计的 CRB。我们揭示了阵列尺寸、带宽与目标位置等关键系统参数对感知性能的影响，为未来研究与应用提供了有价值的洞见。此外，我们的结果表明，当信号幅度变化显著时，NISE 需要新的发射信号设计，这是一个有趣的未来研究方向。

## 致谢与说明

本文早期版本的部分内容将在 IEEE Global Communications Conference（Cape Town, South Africa, 2024）上报告 [1]。作者单位：Zhaolin Wang 就职于伦敦玛丽女王大学电子工程与计算机科学学院（London E1 4NS, U.K.）；Xidong Mu 就职于贝尔法斯特女王大学无线创新中心（CWI，Belfast, BT3 9DT, U.K.）；Yuanwei Liu 就职于香港大学电机电子工程系（Hong Kong）。

## 附录 A. 定理 1 的证明

根据式 (4)，ULA 下 $r_n$ 关于 $\theta$ 与 $r$ 的导数为

$$
\frac{\partial r_n}{\partial\theta}=\frac{r\chi_nd\sin\theta}{\sqrt{r^2+\chi_n^2d^2-2r\chi_nd\cos\theta}},\qquad
\frac{\partial r_n}{\partial r}=\frac{r-\chi_nd\cos\theta}{\sqrt{r^2+\chi_n^2d^2-2r\chi_nd\cos\theta}}. \tag{76}
$$

随后，定义 $\delta=\frac{1}{N}$，中间参数 $u_\theta$ 可表示为

$$
\begin{aligned}
u_\theta&=\sum_{n=-\frac{N-1}{2}}^{\frac{N-1}{2}}\frac{r^2n^2d^2\sin^2\theta}{r^2+n^2d^2-2rnd\cos\theta}\\
&=\sum_{n=-\frac{N-1}{2}}^{\frac{N-1}{2}}\frac{r^2N^3d^2n^2\delta^2\sin^2\theta}{r^2+N^2d^2n^2\delta^2-2rNdn\delta\cos\theta}\delta\\
&\overset{(a)}{=}\int_{-\frac{1}{2}}^{\frac{1}{2}}\frac{r^2N^3d^2x^2\sin^2\theta}{r^2+N^2d^2x^2-2rNdx\cos\theta}\,dx
\overset{(b)}{=}(44),
\end{aligned}\tag{77}
$$

其中 $(a)$ 源于 $\delta\ll1$，步骤 $(b)$ 依据积分公式 [45, Eq. (2.175.4)] 与 [45, Eq. (2.172)]。此外，$G_1$、$G_2$ 与 $\Xi$ 的表达式由 (49) 给出。$u_r$ 的闭式表达式为

$$
u_r=\sum_{n=-\frac{N-1}{2}}^{\frac{N-1}{2}}\frac{\left(r-nd\cos\theta\right)^2}{r^2+n^2d^2-2rnd\cos\theta}=(45). \tag{78}
$$

进一步，$c_\theta$ 的闭式表达式可推导为

$$
c_\theta=\int_{-\frac{1}{2}}^{\frac{1}{2}}\frac{rN^2dx\sin\theta}{\sqrt{r^2+N^2d^2x^2-2Ndx\cos\theta}}\,dx\overset{(c)}{=}(46), \tag{79}
$$

其中步骤 $(c)$ 使用积分公式 [45, Eq. (2.264.2)] 与 [45, Eq. (2.261)]。类似地，$c_r$ 的表达式可推导为

$$
c_r=\int_{-\frac{1}{2}}^{\frac{1}{2}}\frac{rN}{\sqrt{r^2+N^2d^2x^2-2rNdx\cos\theta}}\,dx-\frac{\cos\theta}{r\sin\theta}c_\theta=(47). \tag{80}
$$

关于参数 $\varepsilon$，可推导为

$$
\varepsilon=\int_{-\frac{1}{2}}^{\frac{1}{2}}\frac{r^2N^2dx\sin\theta}{r^2+N^2d^2x^2-2rNdx\cos\theta}\,dx-\frac{\cos\theta}{r\sin\theta}u_\theta\overset{(d)}{=}(48), \tag{81}
$$

其中步骤 $(d)$ 使用积分公式 [45, Eq. (2.175.1)] 与 [45, Eq. (2.172)]。证毕。

## 附录 B. 推论 3 的证明

对固定天线间距 $d=D/N$，需将式 (44)–(48) 中的参数 $D$ 替换为 $Nd$。此时当 $N\to+\infty$ 时必有 $Nd\gg r$，从而有如下近似：

$$
\Xi\approx\frac{\pi}{2}+\frac{\pi}{2}=\pi,\qquad\ln\left(\frac{G_1}{G_2}\right)\approx0, \tag{82}
$$

$$
\frac{\sqrt{G_1}-\sqrt{G_2}}{r}=\frac{-2Nd\cos\theta}{\sqrt{G_1}+\sqrt{G_2}}\approx-2\cos\theta, \tag{83}
$$

$$
\begin{aligned}
\ln\left(\frac{\sqrt{G_1}+\frac{1}{2}Nd-r\cos\theta}{\sqrt{G_2}-\frac{1}{2}Nd-r\cos\theta}\right)&\approx\ln\left(\frac{\sqrt{1+\left(\frac{2r\sin\theta}{Nd}\right)^2}+1}{\sqrt{1+\left(\frac{2r\sin\theta}{Nd}\right)^2}-1}\right)\\
&\overset{(a)}{\approx}\ln\left(\frac{1+\left(\frac{r\sin\theta}{Nd}\right)^2}{\left(\frac{r\sin\theta}{Nd}\right)^2}\right)\approx\ln\left(\frac{Nd}{r\sin\theta}\right)^2,
\end{aligned}\tag{84}
$$

其中步骤 $(a)$ 依据一阶 Taylor 级数 $\sqrt{1+x^2}\approx1+\frac{1}{2}x^2$（$x\approx0$）。基于上述结果，中间参数可简化为

$$
u_\theta\approx r^2\sin^2\theta\left(N+\frac{\pi r\cos2\theta}{d\sin\theta}\right), \tag{85}
$$

$$
u_r\approx N\cos^2\theta-\frac{\pi r\sin\theta\cos2\theta}{d}, \tag{86}
$$

$$
c_\theta\approx\frac{r^2\sin2\theta}{d}\ln\left(\frac{Nd}{r\sin\theta}\right), \tag{87}
$$

$$
c_r\approx\frac{2r\sin^2\theta}{d}\ln\left(\frac{Nd}{r\sin\theta}\right), \tag{88}
$$

$$
\varepsilon\approx\frac{\pi r^2\cos\theta}{d}-r\sin\theta\cos\theta\left(N+\frac{\pi r\cos2\theta}{d\sin\theta}\right). \tag{89}
$$

为在 $Nd\gg r$ 时获得 (42)、(43) 中 $\mathrm{CRB}_\theta$ 与 $\mathrm{CRB}_r$ 的闭式近似，首先推导如下中间参数：

$$
\phi\triangleq u_\theta u_r-\varepsilon^2\approx\frac{\pi r^3\sin\theta}{d}\left(N-\frac{\pi r\sin\theta}{d}\right), \tag{90}
$$

$$
\psi\triangleq u_\theta c_r^2+u_r c_\theta^2-2\varepsilon c_\theta c_r\approx\frac{4r^4\sin^2\theta}{d^2}\left(N-\frac{\pi r\sin\theta}{d}\right)\ln^2\left(\frac{Nd}{r\sin\theta}\right). \tag{91}
$$

随后，定义 $U=MM_2-2M_1^2$，$\mathrm{CRB}_\theta$ 可近似为

$$
\begin{aligned}
\mathrm{CRB}_\theta&=\frac{NMM_2u_r+Uc_r^2}{4\rho L\left(NMM_2^2\phi+UM_2\psi\right)}\\
&\approx\frac{MM_2\left(\cos^2\theta-\frac{\pi r\sin\theta\cos2\theta}{Nd}\right)+\frac{4r^2\sin^4\theta}{N^2d^2}U\ln^2\left(\frac{Nd}{r\sin\theta}\right)}{4\rho L\left(\frac{\pi r^3\sin\theta}{d}\frac{MM_2^2}{N}\left(1-\frac{\pi r\sin\theta}{Nd}\right)+\frac{4r^4\sin^2\theta}{N^2d^2}UM_2\left(N-\frac{\pi r\sin\theta}{d}\right)\ln^2\left(\frac{Nd}{r\sin\theta}\right)\right)}\\
&\overset{(b)}{\approx}\frac{d\cos^2\theta}{4\rho LM_2\pi r^3\sin\theta},
\end{aligned}\tag{92}
$$

其中步骤 $(b)$ 依据 $x\to+\infty$ 时的极限 $\frac{1}{x}\to0$、$\frac{1}{x}\ln^2x\to0$ 与 $\frac{1}{x^2}\ln^2x\to0$。按类似过程可得

$$
\mathrm{CRB}_r\approx\frac{d\sin\theta}{4\rho LM_2\pi r}. \tag{93}
$$

基于上述近似，可方便地得到推论 3 中的极限。证毕。

## 附录 C. 推论 4 的证明

首先推导 $\mathrm{CRB}_\theta$ 的渐近值。当 $\theta=\frac{\pi}{2}$ 时，$\mathrm{CRB}_\theta$ 可由 (50) 近似，其中 $D$ 的影响仅通过函数 $\Phi\left(\frac{D}{r}\right)$ 体现。容易证明 $\lim_{D\to+\infty}\Phi\left(\frac{D}{r}\right)=1$。因此由 (50) 有

$$
\lim_{D\to+\infty}\mathrm{CRB}_\theta=\frac{3}{\rho LNMr^2\left(12f_c^2+B^2-\Delta f^2\right)}. \tag{94}
$$

当 $\theta\ne\frac{\pi}{2}$ 时，由 (92) 有

$$
\lim_{D\to+\infty}\mathrm{CRB}_\theta=\lim_{D\to+\infty}\frac{d\cos^2\theta}{4\rho LM_2\pi r^3\sin\theta}=\lim_{D\to+\infty}\frac{D\cos^2\theta}{4\rho LNM_2\pi r^3\sin\theta}=+\infty. \tag{95}
$$

类似地，$\mathrm{CRB}_r$ 的极限可由 (93) 计算为

$$
\lim_{D\to+\infty}\mathrm{CRB}_r=\lim_{D\to+\infty}\frac{D\sin\theta}{4\rho LNM_2\pi r}=+\infty. \tag{96}
$$

证毕。

## 附录 D. 推论 5 的证明

当 $r\to+\infty$ 时，式 (17) 的远场近似严格成立，即 $r_n=r-nd\cos\theta$。此时其关于 $r$ 与 $\theta$ 的偏导数分别为 $\frac{\partial r_n}{\partial\theta}=nd\sin\theta$ 与 $\frac{\partial r_n}{\partial r}=1$。沿用附录 A，当 $r\to+\infty$ 且 $N\gg1$ 时，有

$$
u_\theta=\sum_{n=-\frac{N-1}{2}}^{\frac{N-1}{2}}n^2d^2\sin^2\theta=\frac{ND^2\sin^2\theta}{12}, \tag{97}
$$

$$
u_r=\sum_{n=-\frac{N-1}{2}}^{\frac{N-1}{2}}1=N,\qquad c_\theta=\sum_{n=-\frac{N-1}{2}}^{\frac{N-1}{2}}nd\sin\theta=0, \tag{98}
$$

$$
c_r=\sum_{n=-\frac{N-1}{2}}^{\frac{N-1}{2}}1=N,\qquad\varepsilon=\sum_{n=-\frac{N-1}{2}}^{\frac{N-1}{2}}nd\sin\theta=0. \tag{99}
$$

将这些结果代入 (42)、(43) 即可得到推论 5 的结果。证毕。

## 附录 E. 定理 2 的证明

对 UCA，传播距离 $r_n$ 关于 $r$ 与 $\theta$ 的偏导数为

$$
\frac{\partial r_n}{\partial\theta}=\frac{rR\sin\left(\theta-\frac{2\pi n}{N}\right)}{\sqrt{r^2+R^2-2rR\cos\left(\theta-\frac{2\pi n}{N}\right)}}, \tag{100}
$$

$$
\frac{\partial r_n}{\partial r}=\frac{r-R\cos\left(\theta-\frac{2\pi n}{N}\right)}{\sqrt{r^2+R^2-2rR\cos\left(\theta-\frac{2\pi n}{N}\right)}}. \tag{101}
$$

定义 $\delta=\frac{2\pi}{N}$，参数 $u_\theta$ 可推导为

$$
\begin{aligned}
u_\theta&=\sum_{n=1}^{N}\left(\frac{\partial r_n}{\partial\theta}\right)^2=\frac{r^2R^2}{\delta}\sum_{n=1}^{N}\frac{\sin^2\left(\theta-n\delta\right)}{r^2+R^2-2rR\cos\left(\theta-n\delta\right)}\delta\\
&\overset{(a)}{\approx}\frac{r^2R^2N}{2\pi}\int_{0}^{2\pi}\frac{\sin^2x}{r^2+R^2-2rR\cos x}\,dx\\
&=\frac{r^2R^2N}{2\pi}\left(\int_{0}^{\pi}\frac{\sin^2x}{r^2+R^2-2rR\cos x}\,dx+\int_{0}^{\pi}\frac{\sin^2x}{r^2+R^2+2rR\cos x}\,dx\right)\\
&\overset{(b)}{=}\begin{cases}\dfrac{r^2N}{2},&R\ge r,\\[6pt]\dfrac{R^2N}{2},&R<r,\end{cases}
\end{aligned}\tag{102}
$$

其中近似 $(a)$ 基于 $N\gg1$ 时 $\delta\ll1$，步骤 $(b)$ 依据积分公式 [45, Eq. (3.613.3)]。类似地，其余参数可推导为

$$
u_r=\frac{N-1}{r^2}u_\theta, \tag{103}
$$

$$
c_\theta\approx\int_{0}^{2\pi}\frac{rRN\sin x}{2\pi\sqrt{r^2+R^2-2rR\cos x}}\,dx\overset{(c)}{=}0, \tag{104}
$$

$$
c_r\approx\int_{0}^{2\pi}\frac{N\left(r-R\cos x\right)}{2\pi\sqrt{r^2+R^2-2rR\cos x}}\,dx=N\Upsilon\left(\frac{r}{R}\right), \tag{105}
$$

$$
\varepsilon\approx\int_{0}^{2\pi}\frac{rRN\left(R\sin x\cos x-r\sin x\right)}{2\pi\left(r^2+R^2-2rR\cos x\right)}\,dx\overset{(d)}{=}0, \tag{106}
$$

其中步骤 $(c)$ 与 $(d)$ 依据函数的对称性质，函数 $\Upsilon(\alpha)$ 由

$$
\Upsilon(\alpha)=\int_{0}^{2\pi}\frac{\alpha-\cos x}{2\pi\sqrt{1-2\alpha\cos x+\alpha^2}}\,dx \tag{107}
$$

给出。可以证明 $\Upsilon(\alpha)$ 是一个没有闭式表达式的超越函数。将 (102)–(106) 代入 (42)、(43)，即可得到定理 2 的结果。证毕。

## 图注与表注

**图 1：** 所考虑系统的几何示意：基站天线阵列与目标，目标相对原点的角度为 $\theta$、距离为 $r$。

**图 2：** 函数 $\Xi_r\left(\frac{D}{r},\frac{B}{f_c}\right)$ 的数值结果。（a）$0<D/r\le100$；（b）$0<D/r\le1$。图中分别给出 $B/f_c=0.01$、$0.1$、$0.3$、$0.5$ 四种带宽—载频比下的曲线。

**图 3：** 函数 $\Xi_\theta(r,D)$ 的数值结果（三维曲面，横轴为距离 $r$（米）、另一横轴为孔径 $D$（米））。

**图 4：** 函数 $\tilde{\Xi}_r\left(\frac{R}{r},\frac{B}{f_c}\right)$ 的数值结果。（a）$0<R/r\le50$；（b）$0<R/r\le0.5$。

**图 5：** 所推导 CRB 与 MLE 达到的 MSE 的对比。

**图 6：** 分别在固定阵列孔径与固定天线间距条件下，CRB 随天线数的变化。（a）$\theta=\pi/4$；（b）$\theta=\pi/2$。

**图 7：** 固定天线数条件下，CRB 随阵列孔径的变化。（a）$\theta=\pi/4$；（b）$\theta=\pi/2$。

**图 8：** 分别在固定带宽与固定子载波间隔条件下，CRB 随子载波数的变化。

**图 9：** 固定子载波数条件下，CRB 随带宽的变化。

**图 10：** 不同带宽—载频比下，CRB 随孔径—距离比的变化。

**图 11：** CRB 随目标距离的变化。

**图 12：** ULA 与 UCA 达到的 CRB 随目标位置的变化。（a）ULA 的距离估计；（b）UCA 的距离估计；（c）ULA 的角度估计；（d）UCA 的角度估计。

> **原文说明：** 原文全文不含表格（Table），仅有上述 12 幅图；本页因此不设表格转写。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v3 第 15–16 页转录；未逐条核对 DOI）。

[1] Z. Wang, X. Mu, and Y. Liu, “Performance bounds of near-field sensing with circular arrays,” in Proc. IEEE Global Commun. Conf. (GLOBECOM), Dec. 2024, pp. 1–6.

[2] E. Björnson et al., “Twenty-five years of signal processing advances for multiantenna communications: From theory to mainstream technology,” IEEE Signal Process. Mag., vol. 40, no. 4, pp. 107–117, Jun. 2023.

[3] E. Fishler et al., “MIMO radar: An idea whose time has come,” in Proc. IEEE Radar Conf., Apr. 2004, pp. 71–78.

[4] F. Liu et al., “Integrated sensing and communications: Toward dual-functional wireless networks for 6G and beyond,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1728–1767, Jun. 2022.

[5] 3GPP TR 22.837, v.19.2.1, “Study on integrated sensing and communication,” Feb. 2024.

[6] T. L. Marzetta, “Noncooperative cellular wireless with unlimited numbers of base station antennas,” IEEE Trans. Wireless Commun., vol. 9, no. 11, pp. 3590–3600, Nov. 2010.

[7] E. Björnson et al., “Massive MIMO systems with non-ideal hardware: Energy efficiency, estimation, and capacity limits,” IEEE Trans. Inf. Theory, vol. 60, no. 11, pp. 7112–7139, Nov. 2014.

[8] O. El Ayach et al., “Spatially sparse precoding in millimeter wave MIMO systems,” IEEE Trans. Wireless Commun., vol. 13, no. 3, pp. 1499–1513, Mar. 2014.

[9] X. Yu et al., “Alternating minimization algorithms for hybrid precoding in millimeter wave MIMO systems,” IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 485–500, Apr. 2016.（原抽取条目作者姓名残缺，此处按常见文献补全为 X. Yu et al.，待核对）

[10] F. Sohrabi and W. Yu, “Hybrid digital and analog beamforming design for large-scale antenna arrays,” IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 501–513, Apr. 2016.

[11] Z. Zhang et al., “6G wireless networks: Vision, requirements, architecture, and key technologies,” IEEE Veh. Technol. Mag., vol. 14, no. 3, pp. 28–41, Sep. 2019.

[12] Z. Wang et al., “Extremely large-scale MIMO: Fundamentals, challenges, solutions, and future directions,” IEEE Wireless Commun., vol. 31, no. 3, pp. 117–124, Jun. 2024.

[13] Y. Liu et al., “Near-field communications: A tutorial review,” IEEE Open J. Commun. Soc., vol. 4, pp. 1999–2049, Aug. 2023.

[14] Z. Wang, X. Mu, and Y. Liu, “Rethinking integrated sensing and communication: When near field meets wideband,” IEEE Commun. Mag., vol. 62, no. 9, pp. 44–50, Sep. 2024.

[15] M. N. El Korso, R. Boyer, A. Renaux, and S. Marcos, “Conditional and unconditional Cramér–Rao bounds for near-field source localization,” IEEE Trans. Signal Process., vol. 58, no. 5, pp. 2901–2907, May 2010.

[16] L. Khamidullina et al., “Conditional and unconditional Cramér-Rao bounds for near-field localization in bistatic MIMO radar systems,” IEEE Trans. Signal Process., vol. 69, pp. 3220–3234, May 2021.

[17] M. N. El Korso et al., “Deterministic performance bounds on the mean square error for near field source localization,” IEEE Trans. Signal Process., vol. 61, no. 4, pp. 871–877, Feb. 2013.

[18] H. Wang, Z. Xiao, and Y. Zeng, “Cramér-Rao bounds for near-field sensing with extremely large-scale MIMO,” IEEE Trans. Signal Process., vol. 72, pp. 701–717, Jan. 2024.

[19] X. Yin et al., “Scatterer localization using large-scale antenna arrays based on a spherical wave-front parametric model,” IEEE Trans. Wireless Commun., vol. 16, no. 10, pp. 6543–6556, Oct. 2017.

[20] A. Guerra, F. Guidi, D. Dardari, and P. M. Djurić, “Near-field tracking with large antenna arrays: Fundamental limits and practical algorithms,” IEEE Trans. Signal Process., vol. 69, pp. 5723–5738, Aug. 2021.

[21] A. A. D’Amico et al., “Cramér-Rao bounds for holographic positioning,” IEEE Trans. Signal Process., vol. 70, pp. 5518–5532, Nov. 2022.

[22] A. Chen et al., “Cramér-Rao bounds of near-field positioning based on electromagnetic propagation model,” IEEE Trans. Veh. Technol., vol. 72, no. 11, pp. 13 808–13 825, Nov. 2023.

[23] Z. Wu, M. Cui, and L. Dai, “Enabling more users to benefit from near-field communications: From linear to circular array,” IEEE Trans. Wireless Commun., vol. 23, no. 4, pp. 3735–3748, Apr. 2024.

[24] A. Sabharwal et al., “In-band full-duplex wireless: Challenges and opportunities,” IEEE J. Sel. Areas Commun., vol. 32, no. 9, pp. 1637–1652, Sep. 2014.

[25] Z. Wang, X. Mu, and Y. Liu, “Near-field velocity sensing and predictive beamforming,” IEEE Trans. Veh. Technol., pp. 1–6, early access, Sep. 2024. doi: 10.1109/TVT.2024.3454481.

[26] C. Sturm and W. Wiesbeck, “Waveform design and signal processing aspects for fusion of wireless communications and radar sensing,” Proc. IEEE, vol. 99, no. 7, pp. 1236–1259, Jul. 2011.

[27] X. Liu, T. Huang, N. Shlezinger, Y. Liu, J. Zhou, and Y. C. Eldar, “Joint transmit beamforming for multiuser MIMO communications and MIMO radar,” IEEE Trans. Signal Process., vol. 68, pp. 3929–3944, Jun. 2020.

[28] X. Liu, T. Huang, and Y. Liu, “Transmit design for joint MIMO radar and multiuser communications with transmit covariance constraint,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1932–1950, Jun. 2022.

[29] P. Stoica, J. Li, and Y. Xie, “On probing signal design for MIMO radar,” IEEE Trans. Signal Process., vol. 55, no. 8, pp. 4151–4161, Aug. 2007.

[30] H. Krim and M. Viberg, “Two decades of array signal processing research: the parametric approach,” IEEE Signal Process. Mag., vol. 13, no. 4, pp. 67–94, Jul. 1996.

[31] A. Goldsmith, Wireless communications. Cambridge, U.K.: Cambridge Univ. Press, 2005.

[32] D. Tse and P. Viswanath, Fundamentals of wireless communication. Cambridge, U.K.: Cambridge Univ. Press, 2005.

[33] M. A. Richards et al., Principles of Modern Radar: Basic Principles. London, U.K.: Institution of Engineering and Technology, 2010.

[34] C. Ouyang, Z. Wang, B. Zhao, X. Zhang, and Y. Liu, “On the impact of reactive region on the near-field channel gain,” IEEE Commun. Lett., early access, Jul. 2024. doi: 10.1109/LCOMM.2024.3435487.

[35] H. V. Poor, An introduction to signal detection and estimation. Berlin, Germany: Springer, 2013.

[36] M. Viberg and B. Ottersten, “Sensor array processing based on subspace fitting,” IEEE Trans. Signal Process., vol. 39, no. 5, pp. 1110–1121, May 1991.

[37] A. Paulraj et al., “Subspace methods for directions-of-arrival estimation,” Handbook of Statistics, vol. 10, pp. 693–739, 1993.

[38] P. Stoica and A. Nehorai, “MUSIC, maximum likelihood, and Cramer-Rao bound,” IEEE Trans. Acoust., Speech, Signal Process., vol. 37, no. 5, pp. 720–741, May 1989.

[39] J. Nocedal and S. Wright, Numerical optimization. New York, NY, USA: Springer-Verlag, 2006.

[40] C. D. Richmond and L. L. Horowitz, “Parameter bounds on estimation accuracy under model misspecification,” IEEE Trans. Signal Process., vol. 63, no. 9, pp. 2263–2278, May 2015.

[41] S. Fortunati, F. Gini, M. S. Greco, and C. D. Richmond, “Performance bounds for parameter estimation under misspecified models: Fundamental findings and applications,” IEEE Signal Process. Mag., vol. 34, no. 6, pp. 142–157, Nov. 2017.

[42] N. Shlezinger, G. C. Alexandropoulos, M. F. Imani, Y. C. Eldar, and D. R. Smith, “Dynamic metasurface antennas for 6G extreme massive MIMO communications,” IEEE Wireless Commun., vol. 28, no. 2, pp. 106–113, Apr. 2021.

[43] Y. Liu, C. Ouyang, Z. Wang, J. Xu, X. Mu, and Z. Ding, “CAPA: Continuous-aperture arrays for revolutionizing 6G wireless communications,” arXiv preprint arXiv:2412.00894, 2024.

[44] J. Guerci, R. Guerci, A. Lackpour, and D. Moskowitz, “Joint design and operation of shared spectrum access for radar and communications,” in Proc. IEEE Radar Conf., May 2015, pp. 761–766.

[45] I. S. Gradshteyn and I. M. Ryzhik, Table of Integrals, Series, and Products. San Diego, C.A., USA: Academic, 2007.

**本页范围与校对状态：** 本页为 arXiv:2404.05076v3 的全文中文译稿，覆盖摘要、正文第 I–VI 节（含动机与贡献、全部分析与 13 条注、2 个定理、9 个推论）、结论、致谢与说明、附录 A–E 的全部证明、图 1–12 图注与参考文献 [1]–[45]。公式编号沿用原文（1）–（107），已用 PDF 第 6、7 页渲染图核对了定理 1（44）–（49）与推论 1（50）–（54）的符号与结构；其余公式按 arXiv v3 文本层转录并对照上下文核对。原文全文无表格，故未设表格转写。参考文献 [9] 在抽取文本中作者姓名残缺（"X. Y. et al."），已按常见文献补全并加注"待核对"；其余条目按原文转录。图内曲线未做数字化估算。**逐句逐式对照原 PDF 的终校未做**；如发现公式排版或个别符号与 PDF 不一致，以原文 PDF 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
