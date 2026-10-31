---
layout: page
title: "超大规模 MIMO 近场感知的 Cramér–Rao 界｜中文全文译文"
permalink: /papers/translations/2026-10-05-2303-05736-cram-r-rao-bounds-for-near-field-sensing-with-extremely-large-scale-mi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1742760d5d60390b/) · [原文 arXiv](https://arxiv.org/abs/2303.05736) · [全部目录](/papers/catalog/)

# 超大规模 MIMO 近场感知的 Cramér–Rao 界

**原题：** Cramér-Rao Bounds for Near-Field Sensing with Extremely Large-Scale MIMO  
**作者：** Huizhi Wang、Zhiqiang Xiao（Graduate Student Member, IEEE）、Yong Zeng（Senior Member, IEEE）  
**单位：** 东南大学移动通信国家重点实验室（南京 210096，中国）；Y. Zeng 与 Z. Xiao 同时为紫金山实验室（南京 211111，中国）。通讯作者：Yong Zeng。  
**版本：** arXiv:2303.05736v1（cs.IT），2023-03-10，原文 13 页（含图 1—9、表 I、附录 A—F）。  
**资助与来源：** 国家重点研发计划资助（Grant 2019YFB1803400）；部分工作已于 2022 年 7 月在韩国首尔 IEEE ICC Workshops 报告 [1]。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、附录 A—F、图 1—9 图注、表 I、参考文献 [1]—[53] 英文原条目均按原文结构录入；逐句逐式终校未做。

## 摘要

移动通信网络原本主要设计用于支撑 ubiquitous 无线通信，但人们也期望其在不久的将来具备无线电感知能力。然而，以往多数无线电感知研究通常依赖均匀平面波（uniform plane wave，UPW）模型的远场假设。随着天线尺寸不断增大，加之对感知邻近目标的需求日益增长，传统远场 UPW 假设可能失效。为此，本文研究采用超大规模（extremely large-scale，XL）天线阵列的近场无线电感知，其中考虑更一般的均匀球面波（uniform spheric wave，USW）感知模型。本文分别针对近场 XL-MIMO 雷达模式与 XL 相控阵雷达模式，推导了角度与距离估计的 Cramér–Rao 界（CRB）闭式表达式。结果揭示：与传统 UPW 模型下“角度 CRB 随天线数增加而无界下降”不同，对于基于 XL-MIMO 雷达的近场感知，CRB 随天线数增加以递减回报下降，并趋近某一确定极限；此外，与远场模型中距离 CRB 为无穷大（因不具备距离估计能力）不同，近场情形下距离 CRB 是有限的。进一步地，本文揭示基于二阶 Taylor 近似的常用球面波模型不足以用于近场 CRB 分析。大量仿真结果验证了所推导的 CRB。

**索引词**：Cramér–Rao 界；近场感知；XL-MIMO 雷达；XL 相控阵雷达；均匀球面波。

## I. 引言

随着第五代（5G）移动通信网络投入商用，研究者已开始探索第六代（6G）网络的关键技术 [2]–[4]。毫无疑问，6G 将继续在覆盖、连接密度、数据速率、时延等方面显著提升无线通信性能。另一方面，人们也普遍认为 6G 应超越通信本身，提供高性能的泛在定位与雷达感知等新服务 [5]–[7]，这得益于蜂窝带宽的持续扩展与天线尺寸的不断增大。因此，集成感知与通信近来受到广泛研究关注，出现了联合通信与雷达/无线电感知（JCAS）[8]、双功能雷达通信（DFRC）[9]、通感一体化（ISAC）[10] 等不同术语。

ISAC 研究大致可分为波形设计 [11]–[15]、码本设计 [16]、波束对准 [17]、[18] 与信息论极限分析 [19]–[21] 等。对于雷达感知，常用若干估计理论指标评估参数估计性能，如传播时延、到达/离开角（AoA/AoD）、多普勒频率等，包括 Cramér–Rao 界（CRB）[22]、Weiss–Weinstein 界 [23] 与 Ziv–Zakai 界 [24]。其中参数估计最常用的界是 CRB，它是无偏均方误差（MSE）估计器的下界。已有研究针对两类典型雷达感知模式推导了不同 CRB，即 MIMO 雷达模式与相控阵雷达模式 [25]。对于 MIMO 雷达模式，不同天线发射正交波形以获得波形分集增益，此情形下共址与分布式 MIMO 雷达系统均有 CRB 分析研究 [26]–[28]；对于相控阵雷达模式，不同天线发射相干波形以获得高发射相干处理增益，单发射天线与多天线阵的单站相控阵雷达系统的 CRB 分别见 [29]、[30]。文献 [26] 的结果表明，对 MIMO 与相控阵两种雷达模式，角度估计 CRB 都随信噪比（SNR）及收发天线数增加而无限下降。

另一方面，MIMO 通信已从 4G 的小规模 MIMO 大幅演进到 5G 的大规模 MIMO [31]。面向 6G，超大规模 MIMO（XL-MIMO）研究日益受到关注 [32]–[36]：其天线尺寸大到传统均匀平面波（UPW）远场假设失效，需要考虑更一般的球面波前特性 [1]。然而，上述多数 CRB 分析研究仍依赖传统 UPW 模型 [37]——这在过去是合理的，因为以往雷达感知应用主要面向远距离目标且天线尺寸通常适中。随着基站（BS）天线尺寸不断增大、以及对邻近目标的感知需求增长，有必要发展不受传统远场 UPW 模型限制的近场感知 CRB 分析。

已有一些考虑近场效应的 CRB 分析工作，主要面向源定位问题 [38]–[41]。例如，基于二阶 Taylor 近似的 Fresnel 近似常被用于近似球面波前 [38]、[39]。[42] 研究了推断运动源位置与速度的近场跟踪问题并推导了后验 Cramér–Rao 下界。然而，尽管二阶 Taylor 近似在多数实际系统中能较好拟合精确近场均匀球面波（USW）模型，它可能引入系统性误差并使模型渐近有偏 [43]。此外，现有结果大多针对只涉及单跳信号传播的源定位问题，不能用于双跳传播的雷达感知场景。[40] 推导了近场双站 MIMO 雷达系统的条件与无条件 CRB，但这些结果依赖于路径差对未知参数的导数，难以获得 CRB 与关键系统参数或阵列构型之间的直观洞察。据我们所知，考虑均匀球面波（USW）特性的近场雷达感知，其以 SNR、天线数等关键系统参数表示的 CRB 闭式表达式尚未见报道。这促使了本文工作。本文主要贡献总结如下：

- 首先，本文给出超大规模天线阵列下的近场双站感知模型，并分别介绍 XL-MIMO 雷达模式与 XL 相控阵雷达模式的信号处理流程。可以发现，直接推导近场双站感知的 CRB 具有挑战性，因为它涉及四维参数估计，即分别包含发射端与接收端的角度和距离。为应对该困难，本文利用收发阵列之间的几何关系把问题转化为二维参数估计问题，从而可用发射端参数表示接收端参数。
- 其次，为获得有用洞察，先考虑最基本的单站近场感知，它可视为一般双站近场感知的特例。推导了角度与距离估计的近场 CRB 闭式表达式，并分别考虑目标距离很大或天线尺寸很大时的渐近情形以获得洞察。结果揭示：新推导的基于 USW 的近场感知 CRB 把基于传统远场 UPW 模型的结果作为特例包含在内。与传统远场感知不同，对于 XL-MIMO 近场感知，角度估计 CRB 不再随阵列尺寸增大而无限下降，而是趋近一个依赖阵元间距的极限；并且，传统 UPW 模型中为无穷大的距离估计 CRB 在近场情形下是有限的，表明 XL-MIMO 近场感知具备距离分辨能力。
- 最后，对于更一般的双站 XL-MIMO 感知，由于在收发两侧同时采用近场 USW 模型时推导 CRB 闭式表达式相当困难，本文考虑更易处理且在实际中更可能的情形：感知目标位于发射阵列的近场。推导了相应的角度与距离 CRB 闭式表达式并获得有用洞察。此外，通过与经典 Capon 算法 [44] 对比，给出数值结果验证所推导的近场 CRB。

本文其余部分组织如下：第 II 节介绍双站雷达感知的一般近场 USW 模型，以及 XL-MIMO 雷达模式与 XL 相控阵雷达模式的关键雷达信号处理流程；第 III 节推导单站情形的 CRB 闭式表达式（可视为双站感知的特例）；第 IV 节推导感知目标位于发射阵列近场时的双站 CRB；第 V 节给出数值结果验证所推导 CRB。

**记号**：小写与大写粗体字母分别表示向量与矩阵。$z_i$ 表示向量 $\mathbf z$ 的第 $i$ 个元素。$\mathbf Z^T$、$\mathbf Z^\ast$、$\mathbf Z^H$ 与 $\det(\mathbf Z)$ 分别表示矩阵 $\mathbf Z$ 的转置、共轭、共轭转置与行列式。$\Re\{\cdot\}$ 表示实部，$\otimes$ 表示 Kronecker 积，$\frac{\partial}{\partial z}(\cdot)$ 表示偏导数。$\mathbf 1_L$ 表示 $L\times1$ 的全一向量。$j$ 为虚数单位，$\|\mathbf z\|$ 表示向量 $\mathbf z$ 的欧氏范数。

## II. 系统模型

如图 1 所示，考虑一个采用 XL-MIMO 的近场雷达感知系统。令 $M\gg1$ 与 $N\gg1$ 分别表示发射与接收天线阵元数。为记号方便，假设 $M$ 与 $N$ 均为奇数。此外，收发两端均配备均匀线性阵列（ULA），阵元间距分别为 $d_T$ 与 $d_R$。因此发射与接收阵列孔径分别约为 $D_T\approx Md_T$ 与 $D_R\approx Nd_R$。为简便，假设收发 ULA 相互平行、间距为 $R$。不失一般性，发射 ULA 沿 $y$ 轴放置并以原点为中心。因此第 $m$ 个发射阵元的位置为 $\mathbf w_m=[0,md_T]^T$，其中 $m\in\mathcal M$，$\mathcal M\triangleq\{0,\pm1,\cdots,\pm(M-1)/2\}$。类似地，第 $n$ 个接收阵元的位置为 $[R,nd_R]^T$，$n\in\mathcal N$，$\mathcal N\triangleq\{0,\pm1,\cdots,\pm(N-1)/2\}$。设 $\mathbf q=[r\cos\theta,r\sin\theta]^T$ 表示雷达感知目标的位置，其中 $r$ 为目标到发射阵列中心的距离，$\theta\in\left[-\frac{\pi}{2},\frac{\pi}{2}\right]$ 为目标相对发射阵列法向量的方向。因此目标到第 $m$ 根发射天线的距离为

$$
r_m=\|\mathbf w_m-\mathbf q\|=r\sqrt{1-2m\varepsilon_T\sin\theta+m^2\varepsilon_T^2},\tag{1}
$$

其中 $\varepsilon_T\triangleq d_T/r\ll1$。注意式（1）是精确距离表达式，当 $D_T\ll r$ 时用一阶 Taylor 近似即可退化为传统远场 UPW 模型。

对于 XL-MIMO 系统，当远场假设不再成立时，通常需要精确距离表达式（1）来准确建模不同阵元间的信号相位与幅度变化。此时发射阵列响应向量的元素不仅依赖方向 $\theta$，还依赖距离 $r$，可表示为 $\tilde a_m(r,\theta)=\sqrt{\frac{\alpha_0}{r_m}}e^{-j\frac{2\pi}{\lambda}r_m}$，$m\in\mathcal M$，其中 $\alpha_0$ 为参考距离 1 m 处的信道功率增益。

类似地，令 $l$ 表示目标到接收阵列中心的距离，$\phi$ 表示目标相对接收阵列法向量的方向。则接收阵列响应向量的元素可表示为 $\tilde b_n(l,\phi)=\sqrt{\frac{\beta_0}{l_n}}e^{-j\frac{2\pi}{\lambda}l_n}$，$n\in\mathcal N$，其中 $l_n=l\sqrt{1-2n\varepsilon_R\sin\phi+n^2\varepsilon_R^2}$ 表示目标到接收阵列中心的距离，$\varepsilon_R\triangleq d_R/l\ll1$，$\beta_0$ 为参考距离 1 m 处的信道功率增益。此外，当收发阵列间距 $R$ 已知时，接收侧距离与角度参数 $l,\phi$ 可用发射侧参数 $r,\theta$ 表示，即

$$
l(r,\theta)=\sqrt{R^2+r^2-2Rr\cos\theta},\qquad \phi(r,\theta)=\arcsin\left\{\frac{r\sin\theta}{\sqrt{R^2+r^2-2Rr\cos\theta}}\right\}.\tag{2}
$$

于是距离 $l_n$ 与接收阵列响应向量元素 $\tilde b_n(l,\phi)$ 可用 $r,\theta$ 表示为

$$
l_n(r,\theta)=\sqrt{R^2+r^2-2Rr\cos\theta-2nd_Rr\sin\theta+n^2d_R^2},\qquad \tilde b_n(r,\theta)=\sqrt{\frac{\beta_0}{l_n(r,\theta)}}e^{-j\frac{2\pi}{\lambda}l_n(r,\theta)}.\tag{3}
$$

令 $x_m(t)$ 表示第 $m$ 根发射天线发送的波形，$m\in\mathcal M$。第 $n$ 根接收天线因目标反射而收到的信号可表示为

$$
r_n(t)=\tilde\kappa\tilde b_n(r,\theta)\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\tilde a_m(r,\theta)x_m(t-\tau)+n_n(t),\tag{4}
$$

其中 $\tilde\kappa$ 为复反射系数，包含目标雷达截面积（RCS）的影响；$\tau$ 为目标反射信号的传播时延。注意本文假设不同收发阵元之间的传播时延近似相等，当 $D_T+D_R\le\frac{c}{B}$ 时成立，其中 $B$ 为系统带宽、$c$ 为光速。$n_n(t)$ 为独立同分布（i.i.d.）加性白高斯噪声（AWGN），功率谱密度为 $N_0$。

注意 $\tilde a_m(r,\theta)$ 可等价写为 $\tilde a_m(r,\theta)=\sqrt{\frac{\alpha_0}{r}}\sqrt{\frac{r}{r_m}}e^{-j\frac{2\pi}{\lambda}r_m}$，且当 $r>1.2D_T$ [45] 时阵元间幅度变化可忽略。因此发射阵列响应向量可表示为 $\tilde{\mathbf a}(r,\theta)=\sqrt{\frac{\alpha_0}{r}}\mathbf a(r,\theta)$，其中

$$
\mathbf a(r,\theta)=\left[a_{-\frac{M-1}{2}}(r,\theta),\ldots,a_m(r,\theta),\ldots,a_{\frac{M-1}{2}}(r,\theta)\right]^T,\tag{5}
$$

其元素 $a_m(r,\theta)=e^{-j\frac{2\pi}{\lambda}r_m}$。类似地，接收响应向量可表示为 $\tilde{\mathbf b}(r,\theta)=\sqrt{\frac{\beta_0}{l}}\mathbf b(r,\theta)$，其中

$$
\mathbf b(r,\theta)=\left[b_{-\frac{N-1}{2}}(r,\theta),\ldots,b_n(r,\theta),\ldots,b_{\frac{N-1}{2}}(r,\theta)\right]^T,\tag{6}
$$

其元素 $b_n(r,\theta)=e^{-j\frac{2\pi}{\lambda}l_n}$。注意我们已基于关系（3）用发射侧角度与距离参数 $(r,\theta)$ 表示接收阵列响应向量。因此，根据（4），双站近场雷达感知的接收信号向量形式可写为

$$
\mathbf r(t)=\kappa\mathbf b(r,\theta)\mathbf a^T(r,\theta)\mathbf x(t-\tau)+\mathbf n(t),\tag{7}
$$

其中 $\mathbf x(t)=[x_m(t)]_{m\in\mathcal M}$ 为发射波形向量，$\kappa\triangleq\frac{\tilde\kappa\sqrt{\alpha_0\beta_0}}{r\sqrt{R^2+r^2-2Rr\cos\theta}}$ 为计入参考功率增益的系数，$\mathbf n(t)\in\mathbb C^{N\times1}$ 为零均值、功率谱密度 $N_0$ 的 i.i.d. AWGN。注意系数 $\kappa$ 一般也依赖目标位置 $(r,\theta)$；但由于幅度变化远不如相位变化敏感，后续 CRB 推导忽略 $\kappa$ 对 $(r,\theta)$ 的依赖。

下面考虑两种标准雷达模式，即 MIMO 雷达模式与相控阵雷达模式 [25]，在超大规模天线阵列近场感知语境下分别称为 XL-MIMO 雷达与 XL 相控阵雷达 [1]。

### A. XL-MIMO 雷达

对于 MIMO 雷达，式（7）中的发射波形为

$$
\mathbf x(t)=\sqrt{\frac{P}{M}}\mathbf s(t),\tag{8}
$$

其中 $P$ 为总发射功率，$\mathbf s(t)=[s_m(t)]_{m\in\mathcal M}$ 表示 $M$ 个正交波形，满足 [46]

$$
\frac{1}{T_p}\int_{T_p}s_m(t)s_k^\ast(t-\alpha)\,dt=\begin{cases}R_{ss}(\alpha),&m=k,\\0,&m\neq k,\end{cases}\tag{9}
$$

其中 $T_p$ 为相干处理间隔（CPI）时长，$R_{ss}(\alpha)$ 为波形 $s_m(t)$ 的自相关函数，且 $R_{ss}(0)=1$。把（8）代入（7），XL-MIMO 雷达的接收信号为 [1]

$$
\mathbf r(t)=\kappa\sqrt{\frac{P}{M}}\mathbf b(r,\theta)\mathbf a^T(r,\theta)\mathbf s(t-\tau)+\mathbf n(t)=\kappa\sqrt{\frac{P}{M}}\mathbf b(r,\theta)\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}a_m(r,\theta)s_m(t-\tau)+\mathbf n(t).\tag{10}
$$

对 $\mathbf r(t)$ 用各正交波形 $s_k(t-\alpha)$ 做匹配滤波（$k\in\mathcal M$，$\alpha$ 为某选定时延，可能不同于真实时延 $\tau$），输出信号可表示为

$$
\mathbf y_k=\frac{1}{\sqrt{T_p}}\int_{T_p}\mathbf r(t)s_k^\ast(t-\alpha)\,dt=\kappa\sqrt{\frac{T_pP}{M}}\mathbf b(r,\theta)a_k(r,\theta)R_{ss}(\alpha-\tau)+\tilde{\mathbf n}_k,\tag{11}
$$

其中 $\tilde{\mathbf n}_k\triangleq\frac{1}{\sqrt{T_p}}\int_{T_p}\mathbf n(t)s_k^\ast(t-\alpha)\,dt$。归一化因子 $\frac{1}{\sqrt{T_p}}$ 用于保证噪声方差仍为 $N_0$。把 $k\in\mathcal M$ 的 $\mathbf y_k\in\mathbb C^{N\times1}$ 拼接起来，且当匹配滤波时延 $\alpha$ 与真实时延 $\tau$ 匹配时，可得如下 $MN$ 维数据向量：

$$
\mathbf y=\kappa\sqrt{\frac{T_pP}{M}}\mathbf b(r,\theta)\otimes\mathbf a(r,\theta)+\tilde{\mathbf n},\tag{12}
$$

其中 $\tilde{\mathbf n}=[\tilde{\mathbf n}_k]_{k\in\mathcal M}\in\mathbb C^{MN\times1}$ 表示匹配滤波后的噪声，可证明其均值为零、方差为 $N_0$。

### B. XL 相控阵雷达

对于相控阵雷达，发射波束被成形以在某一方向 $\theta'$ 与距离 $r'$ 上搜索或跟踪目标 [1]。此时（7）中的发射信号为

$$
\mathbf x(t)=\frac{\sqrt{P}}{\|\mathbf a(r,\theta)\|}\mathbf a^\ast(r',\theta')s(t),\tag{13}
$$

其中 $P$ 为总发射功率，$\mathbf a(r',\theta')$ 为指向位于距离 $r'$、角度 $\theta'$ 的目标的发射导向向量，$s(t)$ 为单一发射波形，满足 $\frac{1}{T_p}\int_{T_p}s(t)s^\ast(t-\alpha)\,dt=R(\alpha)$，$R(\alpha)$ 为相控阵雷达的自相关函数。把（13）代入（7），XL 相控阵雷达的接收信号为

$$
\mathbf r(t)=\kappa\frac{\sqrt{P}}{\|\mathbf a(r,\theta)\|}\mathbf b(r,\theta)\mathbf a^T(r,\theta)\mathbf a^\ast(r',\theta')s(t-\tau)+\mathbf n(t).\tag{14}
$$

对 $\mathbf r(t)$ 用发射波形 $s(t-\alpha)$ 做匹配滤波，得

$$
\mathbf y(\alpha,r',\theta')=\frac{1}{\sqrt{T_p}}\int_{T_p}\mathbf r(t)s^\ast(t-\alpha)\,dt=\kappa\frac{\sqrt{T_pP}}{\|\mathbf a(r,\theta)\|}\mathbf b(r,\theta)\mathbf a^T(r,\theta)\mathbf a^\ast(r',\theta')R(\alpha-\tau)+\tilde{\mathbf n},\tag{15}
$$

其中 $\tilde{\mathbf n}\triangleq\frac{1}{\sqrt{T_p}}\int_{T_p}\mathbf n(t-\alpha)s^\ast(t)\,dt$ 为所得噪声向量，零均值、方差 $N_0$。当搜索参数与真实值匹配，即 $\theta'=\theta$、$r'=r$、$\alpha=\tau$，并注意 $\|\mathbf a(r,\theta)\|=\sqrt{M}$，有

$$
\mathbf y=\kappa\sqrt{T_pMP}\,\mathbf b(r,\theta)+\tilde{\mathbf n}.\tag{16}
$$

### C. Cramér–Rao 界

由（12）与（16）可见，对 XL-MIMO 雷达模式与 XL 相控阵雷达模式，匹配滤波后的信号都可写成统一形式

$$
\mathbf y=\rho\mathbf g+\tilde{\mathbf n},\tag{17}
$$

其中 $\rho$ 为近似与感知参数 $\theta$、$r$ 无关的常数。对 XL-MIMO 雷达模式，$\mathbf g=\mathbf b(r,\theta)\otimes\mathbf a(r,\theta)$、$\rho=\kappa\sqrt{\frac{T_pP}{M}}$；对 XL 相控阵雷达模式，$\mathbf g=\mathbf b(r,\theta)$、$\rho=\kappa\sqrt{T_pPM}$。

令 $\mathbf w=\rho\mathbf g$，$\mathbf z=[\theta,r,\kappa_r,\kappa_i]^T$ 包含未知参数，其中 $\kappa_r$、$\kappa_i$ 分别表示 $\kappa$ 的实部与虚部。根据 [26]，关于 $\mathbf z$ 的 Fisher 信息矩阵（FIM）可表示为

$$
\mathbf F=\frac{2}{N_0}\Re\left\{\left(\frac{\partial\mathbf w}{\partial\mathbf z}\right)\left(\frac{\partial\mathbf w}{\partial\mathbf z}\right)^H\right\}=\frac{2}{N_0}\begin{bmatrix}v_{\theta\theta}&v_{\theta r}&v_{\theta\kappa_r}&v_{\theta\kappa_i}\\v_{\theta r}&v_{rr}&v_{r\kappa_r}&v_{r\kappa_i}\\v_{\theta\kappa_r}&v_{r\kappa_r}&v_{\kappa_r\kappa_r}&0\\v_{\theta\kappa_i}&v_{r\kappa_i}&0&v_{\kappa_i\kappa_i}\end{bmatrix}=\begin{bmatrix}\boldsymbol\Pi_{11}&\boldsymbol\Pi_{12}\\\boldsymbol\Pi_{21}&\boldsymbol\Pi_{22}\end{bmatrix},\tag{18}
$$

其中 $v_{z_1z_2}\triangleq\Re\left\{\left(\frac{\partial\mathbf w}{\partial z_1}\right)\left(\frac{\partial\mathbf w}{\partial z_2}\right)^H\right\}$。感兴趣参数 $(r,\theta)$ 的 CRB 与 FIM 的逆有关：

$$
\mathbf F^{-1}=\frac{N_0}{2}\begin{bmatrix}\mathbf Q^{-1}&\times\\\times&\times\end{bmatrix},\tag{19}
$$

其中 $\mathbf Q=\boldsymbol\Pi_{11}-\boldsymbol\Pi_{12}\boldsymbol\Pi_{22}^{-1}\boldsymbol\Pi_{12}^T$ 是 $\boldsymbol\Pi_{22}$ 关于 $\mathbf F$ 的 Schur 补。进一步，[26] 表明 $\mathbf Q=|\rho|^2\mathbf Q'$，其中

$$
\mathbf Q'=\begin{bmatrix}\|\mathbf g_\theta\|^2\sin^2\Omega&\dfrac{\Re\{\mathbf g^H\mathbf W\mathbf g\}}{\|\mathbf g\|^2}\\ \dfrac{\Re\{\mathbf g^H\mathbf W\mathbf g\}}{\|\mathbf g\|^2}&\|\mathbf g_r\|^2\sin^2\Theta\end{bmatrix},\tag{20}
$$

且 $\mathbf g_\theta=\frac{\partial\mathbf g}{\partial\theta}$、$\mathbf g_r=\frac{\partial\mathbf g}{\partial r}$、$\sin^2\Omega=1-\frac{|\mathbf g_\theta^H\mathbf g|^2}{\|\mathbf g_\theta\|^2\|\mathbf g\|^2}$、$\sin^2\Theta=1-\frac{|\mathbf g_r^H\mathbf g|^2}{\|\mathbf g_r\|^2\|\mathbf g\|^2}$、$\mathbf W=(\mathbf g_\theta^H\mathbf g_r)\mathbf I-\mathbf g_\theta\mathbf g_r^H$。因此角度 $\theta$ 与距离 $r$ 的 CRB 可表示为 [26]

$$
\mathrm{CRB}_\theta=\frac{N_0}{2|\rho|^2}\frac{\|\mathbf g_r\|^2\sin^2\Theta}{\det\mathbf Q'},\tag{21}
$$

$$
\mathrm{CRB}_r=\frac{N_0}{2|\rho|^2}\frac{\|\mathbf g_\theta\|^2\sin^2\Omega}{\det\mathbf Q'}.\tag{22}
$$

于是，针对输入—输出关系（17）的近场 CRB 推导，剩余任务就是求（21）（22）中出现的各项 $\|\mathbf g_r\|^2$、$\|\mathbf g_\theta\|^2$、$\det\mathbf Q'$、$\sin^2\Theta$ 与 $\sin^2\Omega$。下面为获得有用洞察，先考虑最基本的单站近场感知，它可视为图 1 双站设置的特例，只需令 $R=0$、$M=N$、$d_T=d_R$、$\mathbf b(r,\theta)=\mathbf a(r,\theta)$；之后在第 IV 节考虑更复杂的双站感知场景。

## III. 单站感知的近场 CRB

### A. XL-MIMO 雷达

为推导（21）（22）中角度与距离 CRB 的闭式表达式，需要推导 $\|\mathbf g_\theta\|^2$、$\|\mathbf g_r\|^2$、$\|\mathbf g\|^2$、$\Re\{\mathbf g^H\mathbf W\mathbf g\}$、$\sin^2\Omega$ 与 $\sin^2\Theta$ 各项。对 $\mathbf b(r,\theta)=\mathbf a(r,\theta)$ 的单站感知特例，有 $\mathbf g=\mathbf a(r,\theta)\otimes\mathbf a(r,\theta)$，因此可推导如下结果：

$$
\begin{aligned}
\|\mathbf g_\theta\|^2&=\left[\frac{\partial\mathbf a^H(r,\theta)}{\partial\theta}\otimes\mathbf a^H(r,\theta)+\mathbf a^H(r,\theta)\otimes\frac{\partial\mathbf a^H(r,\theta)}{\partial\theta}\right]\left[\frac{\partial\mathbf a(r,\theta)}{\partial\theta}\otimes\mathbf a(r,\theta)+\mathbf a(r,\theta)\otimes\frac{\partial\mathbf a(r,\theta)}{\partial\theta}\right]\\
&=2\left\|\frac{\partial\mathbf a(r,\theta)}{\partial\theta}\right\|^2\|\mathbf a(r,\theta)\|^2+2\left|\frac{\partial\mathbf a^H(r,\theta)}{\partial\theta}\mathbf a(r,\theta)\right|^2\\
&=2Ma+2|c|^2,
\end{aligned}\tag{23}
$$

其中 $a\triangleq\left\|\frac{\partial\mathbf a(r,\theta)}{\partial\theta}\right\|^2$、$c\triangleq\frac{\partial\mathbf a^H(r,\theta)}{\partial\theta}\mathbf a(r,\theta)$ 为相关中间参数。类似地，（21）（22）中其他相关项可得为

$$
\|\mathbf g_r\|^2=2Mp+2|q|^2,\quad \Re\{\mathbf g^H\mathbf W\mathbf g\}=2M^2\Re\{Me-c^\ast q\},\quad \sin^2\Omega=\frac{Ma-|c|^2}{Ma+|c|^2},\quad \sin^2\Theta=\frac{Mp-|q|^2}{Mp+|q|^2},\tag{24}
$$

其中中间参数 $e$、$p$、$q$ 定义为

$$
e\triangleq\frac{\partial\mathbf a^H(r,\theta)}{\partial\theta}\frac{\partial\mathbf a(r,\theta)}{\partial r},\quad p\triangleq\left\|\frac{\partial\mathbf a(r,\theta)}{\partial r}\right\|^2,\quad q\triangleq\frac{\partial\mathbf a^H(r,\theta)}{\partial r}\mathbf a(r,\theta).\tag{25}
$$

注意这些中间参数都依赖 $\mathbf a(r,\theta)$ 及其导数。为进一步推导中间参数的表达式，基于（5）可得 $a_m(r,\theta)$ 关于 $r$ 与 $\theta$ 的导数：

$$
\frac{\partial a_m(r,\theta)}{\partial\theta}=-j\frac{2\pi}{\lambda}e^{-j\frac{2\pi}{\lambda}r_m}\frac{\partial r_m}{\partial\theta},\qquad \frac{\partial a_m(r,\theta)}{\partial r}=-j\frac{2\pi}{\lambda}e^{-j\frac{2\pi}{\lambda}r_m}\frac{\partial r_m}{\partial r},\tag{26}
$$

其中 $\frac{\partial r_m}{\partial\theta}$ 与 $\frac{\partial r_m}{\partial r}$ 可由（1）得到：

$$
\frac{\partial r_m}{\partial\theta}=\frac{-md_T\cos\theta}{\sqrt{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2}},\qquad \frac{\partial r_m}{\partial r}=\frac{1-m\varepsilon_T\sin\theta}{\sqrt{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2}}.\tag{27}
$$

于是中间参数 $a$、$c$、$e$、$p$、$q$ 为

$$
a=\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\left(\frac{\partial a_m(r,\theta)}{\partial\theta}\right)^2=\frac{4\pi^2r^2\cos^2\theta}{\lambda^2}\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{m^2\varepsilon_T^2}{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2},\tag{28}
$$

$$
c=\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{\partial a_m^\ast(r,\theta)}{\partial\theta}a_m(r,\theta)=-j\frac{2\pi r\cos\theta}{\lambda}\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{m\varepsilon_T}{\sqrt{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2}},\tag{29}
$$

$$
e=\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{\partial a_m^\ast(r,\theta)}{\partial\theta}\frac{\partial a_m(r,\theta)}{\partial r}=\frac{4\pi^2r}{\lambda^2}\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{m\varepsilon_T\cos\theta(m\varepsilon_T\sin\theta-1)}{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2},\tag{30}
$$

$$
p=\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\left(\frac{\partial a_m(r,\theta)}{\partial r}\right)^2=\frac{4\pi^2}{\lambda^2}\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\left[1-\frac{m^2\varepsilon_T^2\cos^2\theta}{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2}\right],\tag{31}
$$

$$
q=\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{\partial a_m^\ast(r,\theta)}{\partial r}a_m(r,\theta)=j\frac{2\pi}{\lambda}\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{1-m\varepsilon_T\sin\theta}{\sqrt{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2}}.\tag{32}
$$

由于 $\varepsilon_T\ll1$，与 [32] 类似，可得上述中间参数的闭式表达式如下。

**命题 1**：中间参数 $a,c,e,p,q$ 的闭式表达式可导出为

$$
a=\frac{4\pi^2r^2\cos^2\theta}{\lambda^2\varepsilon_T}\left[\frac{D_T}{r}+\sin\theta\ln\left|\frac{\frac{D_T^2}{4r^2}-\sin\theta\frac{D_T}{r}+1}{\frac{D_T^2}{4r^2}+\sin\theta\frac{D_T}{r}+1}\right|-\frac{\cos2\theta}{\cos\theta}\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right)\right],\tag{33}
$$

$$
c=-j\frac{2\pi r\cos\theta}{\lambda}\left[\sqrt{\frac{D_T^2}{4r^2}-\sin\theta\frac{D_T}{r}+1}-\sqrt{\frac{D_T^2}{4r^2}+\sin\theta\frac{D_T}{r}+1}+\psi\left(\frac{D_T}{r}\right)\sin\theta\right],\tag{34}
$$

$$
e=\frac{4\pi^2r\cos\theta}{\lambda^2\varepsilon_T}\left[\frac{D_T}{r}\sin\theta-\frac{\cos2\theta}{2}\ln\left|\frac{\frac{D_T^2}{4r^2}-\sin\theta\frac{D_T}{r}+1}{\frac{D_T^2}{4r^2}+\sin\theta\frac{D_T}{r}+1}\right|-\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right)\sin2\theta\right],\tag{35}
$$

$$
p=\frac{4\pi^2}{\lambda^2\varepsilon_T}\left[\sin^2\theta\frac{D_T}{r}-\ln\left|\frac{\frac{D_T^2}{4r^2}-\sin\theta\frac{D_T}{r}+1}{\frac{D_T^2}{4r^2}+\sin\theta\frac{D_T}{r}+1}\right|\cos^2\theta\sin\theta+\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right)\cos\theta\cos2\theta\right],\tag{36}
$$

$$
q=j\frac{2\pi}{\lambda\varepsilon_T}\left[\psi\left(\frac{D_T}{r}\right)\cos^2\theta-\sin\theta\sqrt{\frac{D_T^2}{4r^2}-\sin\theta\frac{D_T}{r}+1}+\sin\theta\sqrt{\frac{D_T^2}{4r^2}+\sin\theta\frac{D_T}{r}+1}\right],\tag{37}
$$

其中 $\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right)\triangleq\arctan\left(\frac{D_T}{2r\cos\theta}-\tan\theta\right)+\arctan\left(\frac{D_T}{2r\cos\theta}+\tan\theta\right)$ 为发射阵列的角度跨度 [32]，$\psi\left(\frac{D_T}{r}\right)\triangleq\ln\left(\frac{p_2+\sqrt{1+p_2^2}}{p_1+\sqrt{1+p_1^2}}\right)$，且 $p_1=\frac{-\frac{D_T}{2r}-\sin\theta}{\cos\theta}$、$p_2=\frac{\frac{D_T}{2r}-\sin\theta}{\cos\theta}$。

**证明**：请参见附录 A。

基于（33）—（37）可得（23）（24）中的参数。把它们代入（21）（22），即得角度与距离近场 CRB 的闭式表达式，如下所示。

**定理 1**：对于近场单站 XL-MIMO 雷达模式，角度 $\theta$ 与距离 $r$ 的 CRB 可闭式表示为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{M(Mp-|q|^2)}{2\{(Ma-|c|^2)(Mp-|q|^2)-[Me-c^\ast q]^2\}},\tag{38}
$$

$$
\mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{M(Ma-|c|^2)}{2\{(Ma-|c|^2)(Mp-|q|^2)-[Me-c^\ast q]^2\}},\tag{39}
$$

其中 $\gamma=\frac{P|\kappa|^2}{\sigma^2}$ 定义为 SNR，$\sigma^2=N_0B$，$L\triangleq BT_p$ 表示一个 CPI 内的时间—带宽积。中间参数 $a,c,e,p,q$ 由命题 1 给出闭式。

为从定理 1 获得有用洞察，下面分别考虑 $D_T/r\gg1$、$\frac{D_T}{r\cos\theta}\to\infty$ 与 $D_T/r\ll1$ 三种渐近情形。

**推论 1.1**：当 $D_T/r\gg1$ 时，定理 1 中的 CRB 简化为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\times\frac{\lambda^2\left[\left(\frac{D_T\sin\theta}{r}\right)^2+\frac{\pi D_T}{r}\cos\theta\cos2\theta-4\left(\cos2\theta\ln\frac{D_T}{r\cos\theta}+\sin^2\theta\right)^2\right]}{8\pi^2r^2M\left(\frac{\pi D_T}{r\cos\theta}-4\ln2\frac{D_T}{r\cos\theta}\right)\cos^2\theta},\tag{40}
$$

$$
\mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{\lambda^2\left[\left(\frac{D_T}{r}\right)^2+\frac{\pi D_T}{r}\frac{\cos2\theta}{\cos\theta}-4\left(\ln\frac{D_T}{r\cos\theta}-1\right)^2\sin^2\theta\right]}{8\pi^2M\left(\frac{\pi D_T}{r\cos\theta}-4\ln2\frac{D_T}{r\cos\theta}\right)}.\tag{41}
$$

**证明**：请参见附录 B。

**推论 1.2**：当 $\frac{D_T}{r\cos\theta}\to\infty$ 时，角度与距离近场 CRB 的极限为

$$
\lim_{\frac{D_T}{r\cos\theta}\to\infty}\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{\lambda^2d_T\sin2\theta}{8\pi^3r^3\cos\theta},\tag{42}
$$

$$
\lim_{\frac{D_T}{r\cos\theta}\to\infty}\mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{\lambda^2d_T\cos\theta}{8\pi^3r}.\tag{43}
$$

**证明**：请参见附录 C。

作为对比，传统远场 UPW 模型下的角度 CRB 可基于 [26] 推得：

$$
C_\theta=\frac{1}{2\gamma L}\frac{3\lambda^2}{2\pi^2d_T^2M(M^2-1)\cos^2\theta},\tag{44}
$$

而距离 CRB 为无穷大，因为远场感知不具备距离分辨能力。注意给定阵元间距 $d_T$ 时，阵列孔径 $D_T$ 随天线数 $M$ 成正比增大。因此由（42）—（44）可见：与传统 UPW 模型中 CRB 随天线数 $M$ 或阵列孔径 $D_T$ 无限下降不同，对采用 USW 模型的近场 XL-MIMO 感知，当阵列孔径 $D_T$ 趋于无穷时，角度与距离 CRB 趋近一个依赖阵元间距 $d_T$ 的极限。这意味着，要在无偏角度与距离估计中达到零误差的极致性能，不仅阵列孔径 $D_T$ 需足够大，阵元间距 $d_T$ 也需无限小。这在理论上表明，新兴的全息 MIMO 有可能比传统离散 MIMO 获得更好的近场感知性能 [47]–[49]。

**推论 1.3**：当 $D_T/r\ll1$ 时，（38）中的 CRB 简化为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{3\lambda^2}{2\pi^2d_T^2M^3\cos^2\theta}\Xi(\theta),\tag{45}
$$

其中 $\Xi(\theta)\triangleq\frac{6\sin^2\theta+\cos^2\theta\cos2\theta}{9\sin^2\theta+\cos^6\theta}\in(0.6,1]$。

**证明**：请参见附录 D。

比较（44）与（45）可见，当阵列孔径 $D_T$ 远小于目标距离 $r$ 时，新推导的基于 USW 的近场感知 CRB 退化为传统基于 UPW 的远场感知结果，仅多一修正因子 $\Xi(\theta)$。

（38）（39）中的近场 CRB 表达式是基于精确距离表达式（1）的 USW 传播推导的。建模 USW 的另一常用方法是对（1）采用二阶 Taylor 近似 [50]、[51]。此情形下，（38）（39）中的 CRB 可得如下结果。

**推论 1.4**：当对距离表达式（1）采用二阶 Taylor 近似时，（38）（39）中的近场 CRB 简化为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{3\lambda^2}{2\pi^2d_T^2M(M^2-1)\cos^2\theta},\tag{46}
$$

$$
\mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{6\lambda^2r^2[15r^2+(d_T\sin\theta)^2(M^2-4)]}{(\pi d_T^2\cos^2\theta)^2M(M^2-1)(M^2-4)}.\tag{47}
$$

**证明**：请参见附录 E。

推论 1.4 表明一个出人意料的结果：若对 USW 建模采用二阶 Taylor 近似，角度 CRB 与（44）中基于传统 UPW 模型的结果完全一致。这是因为主要由 $\mathbf a(r,\theta)$ 中二阶项体现的 USW 特征被其他参数 $p,e,c,q$ 抵消。这意味着二阶 Taylor 近似可能不足以准确评估角度估计的近场 CRB。另一方面，当 $M$ 较大时，（47）表明距离 CRB 与 $M^3$ 成反比并最终趋于 0，这与基于精确距离表达式的结果（43）相反。

### B. XL 相控阵雷达

对于单站 XL 相控阵雷达，模型（17）中 $\mathbf g=\mathbf a(r,\theta)$、$\rho=\kappa\sqrt{T_pPM}$，故 $\|\mathbf g\|^2=\|\mathbf a(r,\theta)\|^2=M$。与第 III-A 节 XL-MIMO 雷达的分析类似，可得（21）（22）中的如下参数：

$$
\|\mathbf g_\theta\|^2=a,\qquad \|\mathbf g_r\|^2=p,\qquad \sin^2\Omega=1-\frac{|c|^2}{aM},\qquad \sin^2\Theta=1-\frac{|q|^2}{pM},\tag{48}
$$

其中中间参数 $a$、$c$、$p$、$q$ 的闭式见（33）—（37）。因此，基于（21）（22），距离与角度的闭式 CRB 如下述定理 2 所示。

**定理 2**：对于近场单站 XL 相控阵雷达感知，角度与距离估计的闭式 CRB 为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{Mp-|q|^2}{(Ma-|c|^2)(Mp-|q|^2)-[Me-c^\ast q]^2},\tag{49}
$$

$$
\mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{Ma-|c|^2}{(Ma-|c|^2)(Mp-|q|^2)-[Me-c^\ast q]^2},\tag{50}
$$

其中中间参数 $a,c,e,p,q$ 的闭式表达式由（33）—（37）给出。

把定理 2 与定理 1 比较可见，XL 相控阵雷达模式的 CRB 为 XL-MIMO 雷达模式的 $\frac{2}{M}$。这一额外增益来自相控阵雷达的发射波束成形增益。对 XL 相控阵感知可作与第 III-A 节类似的分析，证明从略。

**推论 2.1**：对于 $D_T/r\gg1$ 的渐近情形，定理 2 中角度与距离的 CRB 简化为

$$
\mathrm{CRB}_\theta\approx\frac{1}{2\gamma L}\times\frac{\lambda^2\left[\left(\frac{D_T}{r}\right)^2\sin^2\theta+\frac{\pi D_T}{r}\cos\theta\cos2\theta-4\left(\cos2\theta\ln\frac{D_T}{r\cos\theta}+\sin^2\theta\right)^2\right]}{4\pi^2r^2M^2\left(\frac{\pi D_T}{r\cos\theta}-4\ln2\frac{D_T}{r\cos\theta}\right)\cos^2\theta},\tag{51}
$$

$$
\mathrm{CRB}_r\approx\frac{1}{2\gamma L}\frac{\lambda^2\left[\left(\frac{D_T}{r}\right)^2+\frac{\pi D_T}{r}\frac{\cos2\theta}{\cos\theta}-4\left(\ln\frac{D_T}{r\cos\theta}-1\right)^2\sin^2\theta\right]}{4\pi^2M^2\left(\frac{\pi D_T}{r\cos\theta}-4\ln2\frac{D_T}{r\cos\theta}\right)}.\tag{52}
$$

**推论 2.2**：对于 $\frac{D_T}{r\cos\theta}\to\infty$ 的渐近情形，式（51）（52）中的 CRB 趋于以下极限：

$$
\lim_{\frac{D_T}{r\cos\theta}\to\infty}\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{\lambda^2d_T\sin2\theta}{4M\pi^3r^3\cos\theta},\tag{53}
$$

$$
\lim_{\frac{D_T}{r\cos\theta}\to\infty}\mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{\lambda^2d_T\cos\theta}{4M\pi^3r}.\tag{54}
$$

推论 2.2 表明，与近场 XL-MIMO 雷达模式不同，对 XL 相控阵雷达模式，CRB 会随阵元数 $M$ 或孔径 $D_T$ 足够大而无界下降。

传统基于远场 UPW 的感知角度 CRB 可基于 [30] 得到：

$$
C_\theta=\frac{1}{2L\gamma}\frac{3\lambda^2}{\pi^2d_T^2M^2(M^2-1)\cos^2\theta}.\tag{55}
$$

**推论 2.3**：与（45）类似，当 $D_T/r\ll1$ 时，（49）中的 CRB 简化为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{3\lambda^2}{\pi^2d_T^2M^4\cos^2\theta}\Xi(\theta),\tag{56}
$$

其中 $\Xi(\theta)=\frac{6\sin^2\theta+\cos^2\theta\cos2\theta}{9\sin^2\theta+\cos^6\theta}$。

**推论 2.4**：当对距离表达式（1）采用二阶 Taylor 近似时，（49）（50）中的 CRB 简化为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{3\lambda^2}{\pi^2d_T^2M^2(M^2-1)\cos^2\theta},\tag{57}
$$

$$
\mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{12\lambda^2r^2[15r^2+(d_T\sin\theta)^2(M^2-4)]}{(\pi d_T^2\cos^2\theta)^2M^2(M^2-1)(M^2-4)},\tag{58}
$$

这与 [52] 中的结果一致。

## IV. 双站感知的近场 CRB

本节把上述分析推广到双站近场感知。然而，当收发两侧都考虑近场 USW 模型时，CRB 推导相当困难。此外，考虑实际收发机尺寸与目标距离，目标位于收发双方近场的可能性较小。因此下面考虑目标位于发射端近场、同时位于接收端远场时的 XL-MIMO 与 XL 相控阵感知。此情形下，（6）中接收导向向量的元素可表示为 $b_n(r,\theta)=e^{-j\frac{2\pi}{\lambda}(l-nd_R\sin\phi(r,\theta))}$。基于（2）中 $\phi(r,\theta)$ 的表达式，$b_n(r,\theta)$ 可写为

$$
b_n(r,\theta)=e^{-j\frac{2\pi}{\lambda}l}e^{j\frac{2\pi}{\lambda}\frac{rnd_R\sin\theta}{\sqrt{R^2+r^2-2Rr\cos\theta}}}.\tag{59}
$$

注意这里只考虑与 $(r,\theta)$ 相关的相位变化。因此 $b_n(r,\theta)$ 中的常数项 $e^{-j\frac{2\pi}{\lambda}l}$ 可并入（7）中的系数 $\kappa$，即定义新系数 $\hat\kappa=\kappa e^{-j\frac{2\pi}{\lambda}l}$。

### A. XL-MIMO 雷达

与第 III-A 节的分析类似，对双站 XL-MIMO 雷达模式，（21）（22）中的参数可表示为

$$
\|\mathbf g_\theta\|^2=Mi+Na+fc^\ast+f^\ast c,\quad \|\mathbf g_r\|^2=Ms+Np+hq^\ast+h^\ast q,\quad \mathbf g_\theta^H\mathbf g_r=Mk+Ne+fq^\ast+h^\ast c,\quad \mathbf g^H\mathbf g_\theta=Nc^\ast+f^\ast M,\quad \mathbf g_r^H\mathbf g=Nq+Mh,\tag{60}
$$

其中中间参数定义为

$$
i=\left\|\frac{\partial\mathbf b(r,\theta)}{\partial\theta}\right\|^2,\quad s=\left\|\frac{\partial\mathbf b(r,\theta)}{\partial r}\right\|^2,\quad f=\frac{\partial\mathbf b^H(r,\theta)}{\partial\theta}\mathbf b(r,\theta),\quad k=\frac{\partial\mathbf b^H(r,\theta)}{\partial\theta}\frac{\partial\mathbf b(r,\theta)}{\partial r},\quad h=\frac{\partial\mathbf b^H(r,\theta)}{\partial r}\mathbf b(r,\theta).\tag{61}
$$

为推导（61）中间参数的闭式表达式，定义 $\Gamma_\theta(r,\theta)$ 与 $\Gamma_r(r,\theta)$：

$$
\Gamma_\theta(r,\theta)\triangleq\frac{\partial\sin\phi}{\partial\theta}=\frac{r\cos\theta(R^2+r^2-Rr\cos\theta)-Rr^2}{(R^2+r^2-2Rr\cos\theta)^{3/2}},\qquad \Gamma_r(r,\theta)\triangleq\frac{\partial\sin\phi}{\partial r}=\frac{R\sin\theta(R-r\cos\theta)}{(R^2+r^2-2Rr\cos\theta)^{3/2}},\tag{62}
$$

它们与阵元编号 $n$ 无关。进一步，利用天线阵列的对称性，（61）中的参数简化为

$$
i=\frac{\pi^2d_R^2\Gamma_\theta^2}{3\lambda^2}N(N^2-1),\quad s=\frac{\pi^2d_R^2\Gamma_r^2}{3\lambda^2}N(N^2-1),\quad f=h=0,\quad k=\frac{\pi^2d_R^2\Gamma_\theta\Gamma_r}{3\lambda^2}N(N^2-1).\tag{63}
$$

**定理 3**：对于发射端近场、接收端远场的双站 XL-MIMO 雷达感知，CRB 的闭式表达式为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\times\frac{M\left(Ms+Np-\frac{N}{M}|q|^2\right)}{\left(Mi+Na-\frac{N}{M}|c|^2\right)\left(Ms+Np-\frac{N}{M}|q|^2\right)-\left(Mk+Ne-\frac{N}{M}c^\ast q\right)^2},\tag{64}
$$

$$
\mathrm{CRB}_r=\frac{1}{2\gamma L}\times\frac{M\left(Mi+Na-\frac{N}{M}|c|^2\right)}{\left(Mi+Na-\frac{N}{M}|c|^2\right)\left(Ms+Np-\frac{N}{M}|q|^2\right)-\left(Mk+Ne-\frac{N}{M}c^\ast q\right)^2},\tag{65}
$$

其中中间参数 $a,c,e,p,q$ 的闭式由（33）—（37）给出。

**证明**：定理 3 可通过计算（60）中的各项得到，即 $\|\mathbf g_\theta\|^2=Mi+Na$、$\|\mathbf g_r\|^2=Mj+Np$、$\mathbf g_\theta^H\mathbf g_r=Mk+Ne$、$\mathbf g^H\mathbf g_\theta=Nc^\ast$、$\mathbf g_r^H\mathbf g=Nq$。

基于传统远场 UPW 模型的双站 MIMO 雷达角度 CRB 由 [26] 给出：

$$
C_\theta=\frac{1}{2\gamma L}\frac{3\lambda^2}{\pi^2N\left[d_R^2(N^2-1)+d_T^2(M^2-1)\right]\cos^2\theta}.\tag{66}
$$

定理 3 中的闭式 CRB 较为复杂。为获得有用洞察，下面考虑 $\theta=0$ 的特例。

**推论 3.1**：当 $\theta=0$ 时，定理 3 中的 CRB 简化为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{M}{\frac{d_R^2rMN(N^2-1)}{3\lambda^2(R-r)}+\frac{4\pi^2r^2N}{\lambda^2\varepsilon_T^2}\left[\frac{D_T}{r}-2\arctan\left(\frac{D_T}{2r}\right)\right]},\tag{67}
$$

$$
\mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{\lambda^2}{4\pi^2N}\left[\frac{2r}{D_T}\arctan\left(\frac{D_T}{2r}\right)-\left(\frac{2r}{D_T}\right)^2\ln^2\left(\frac{D_T}{2r}+\sqrt{1+\left(\frac{D_T}{2r}\right)^2}\right)\right].\tag{68}
$$

**证明**：请参见附录 F。

推论 3.1 表明距离 CRB 只依赖 $\frac{D_T}{2r}$，它由目标到发射阵列两端的两条连线之间的夹角决定，或由 [32] 中定义的发射角度跨度决定。此外可证明，（68）中的距离 CRB 并非随发射阵列孔径 $D_T$ 单调下降，而是随 $D_T$ 先减小后增大，最小点位于 $D_T\approx12r$（附录 F 已证）。这表明当接收天线数 $N$ 固定时，更大的发射孔径 $D_T$ 未必带来更好的距离估计。其原因在于：对 XL-MIMO 雷达模式，当天线阵列总功率固定为 $P$ 时，每个阵元的功率随天线数增加而降低（由（8）可见）；而（26）（27）表明偏导数幅度对更大的天线索引 $m$ 更小。这意味着当 $D_T$ 足够大时，增加天线带来的边际贡献不足以补偿每个阵元功率下降，导致距离 CRB 增大。

**推论 3.2**：当 $\theta=0$、且 $\frac{D_T}{r\cos\theta}\to\infty$ 的渐近情形下，（67）（68）中角度与距离的 CRB 趋于以下极限：

$$
\lim_{\frac{D_T}{r\cos\theta}\to\infty}\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{\lambda^2}{\pi^2r^2N}\left[\frac{d_R^2}{3(R-r)^2}(N^2-1)+4\right],\tag{69}
$$

$$
\lim_{\frac{D_T}{r\cos\theta}\to\infty}\mathrm{CRB}_r=\lim_{\frac{D_T}{r\cos\theta}\to\infty}\frac{1}{2\gamma L}\frac{D_T^2\lambda^2}{4\pi^2r^2N\left(\frac{\pi D_T}{r}-4\ln2\frac{D_T}{r}\right)}\to\infty.\tag{70}
$$

**证明**：推论 3.2 可通过把附录 B 中的 $g_2$ 与 $g_4$ 代入（67）（68）得到，且（70）可写为

$$
\mathrm{CRB}_r\overset{(a)}{\approx}\frac{1}{2\gamma L}\frac{D_T^2\lambda^2}{4\pi^2r^2N\pi\frac{D_T}{r}}=\frac{1}{2\gamma L}\frac{\lambda^2}{4\pi^2N\pi}\frac{D_T}{r}\to\infty,\tag{71}
$$

其中 $(a)$ 来自附录 C。

推论 3.2 表明，当发射阵列孔径 $D_T$ 很大时，角度 CRB 将趋近一个依赖接收天线数 $N$ 的极限，而非随 $D_T$ 无限下降；此外，距离 CRB 同时依赖发射与接收阵元数，并在 $D_T$ 很大时趋于无穷，这与推论 3.1 一致。

**推论 3.3**：当 $\theta=0$、且 $D_T/r\ll1$ 的渐近情形下，（67）（68）中角度与距离的 CRB 简化为

$$
\mathrm{CRB}_\theta\approx\frac{1}{2\gamma L}\frac{3\lambda^2}{\pi^2N}\left(\frac{d_R^2}{r}\left(\frac{r}{R-r}\right)^2(N^2-1)+d_T^2M^2\right),\qquad \mathrm{CRB}_r=\frac{1}{2\gamma L}\frac{M}{Np-\frac{N}{M}|q|^2}\to\infty.\tag{72}
$$

**证明**：推论 3.3 可通过把附录 D 中的中间参数代入（67）（68）得到。

推论 3.3 表明，当阵列孔径 $D_T$ 远小于目标距离 $r$ 时，新推导的 CRB 结果与基于传统 UPW 模型的既有结果（66）一致。注意（72）分母中额外的因子 $\left(\frac{r}{R-r}\right)^2$ 是因为我们在（2）中用 $r,\theta$ 表示接收侧角度 $\phi$，故即使 $\theta=\phi$，$\Gamma_\theta(r,\theta)$ 也不同于远场 UPW 模型中的 $\frac{\partial\sin\theta}{\partial\theta}$。

### B. XL 相控阵雷达

对 XL 相控阵雷达模式，（21）（22）中的参数可表示为

$$
\|\mathbf g_\theta\|^2=i,\quad \|\mathbf g_r\|^2=s,\quad \sin^2\Omega=\sin^2\Theta=1,\quad \frac{\Re\{\mathbf g^H\mathbf W\mathbf g\}}{\|\mathbf g\|^2}=\Re\{k\},\quad \det\mathbf Q'=is-\Re^2\{k\}=0.\tag{73}
$$

注意由于 $\det\mathbf Q'=0$，由（21）（22）立即得出角度与距离 CRB 均为无穷大，这意味着该场景下角度与距离都无法估计。这在预期之内：当接收侧采用远场 UPW 模型、发射侧采用相控阵波束成形时，所考虑的双站感知问题等同于远场目标定位问题 [53]。此时只能估计目标相对接收阵列的角度 $\phi$，仅凭 $\phi$ 无法获得发射角 $\theta$ 与距离 $r$，因此角度与距离 CRB 均为无穷大。

综上，上述各类感知的 CRB 汇总于表 I。

**表 I　不同感知类别在各场景下的 CRB**（按原表逐格转录；表中括号为原文公式编号，"∞"表示该 CRB 为无穷大；原表含合并单元格，已按语义展开为普通表格）

| 场景 | 模型／情形 | XL-MIMO 雷达 $\mathrm{CRB}_\theta$ | XL-MIMO 雷达 $\mathrm{CRB}_r$ | XL 相控阵 $\mathrm{CRB}_\theta$ | XL 相控阵 $\mathrm{CRB}_r$ |
| --- | --- | --- | --- | --- | --- |
| 单站 | 近场 USW 模型：一般结果 | (38) | (39) | (49) | (50) |
| 单站 | 近场 USW 模型：$D_T\gg r$ | (40) | (41) | (51) | (52) |
| 单站 | 近场 USW 模型：$\frac{D_T}{r\cos\theta}\to\infty$ | $\frac{1}{2\gamma L}\frac{\lambda^2d_T\sin2\theta}{8\pi^3r^3\cos\theta}$ | $\frac{1}{2\gamma L}\frac{\lambda^2d_T\cos\theta}{8\pi^3r}$ | $\frac{1}{2\gamma L}\frac{\lambda^2d_T\sin2\theta}{4M\pi^3r^3\cos\theta}$ | $\frac{1}{2\gamma L}\frac{\lambda^2d_T\cos\theta}{4M\pi^3r}$ |
| 单站 | 近场 USW 模型＋二阶 Taylor 近似 | $\frac{1}{2\gamma L}\frac{3\lambda^2}{2\pi^2d_T^2M(M^2-1)\cos^2\theta}$ | (47) | $\frac{1}{2\gamma L}\frac{3\lambda^2}{\pi^2d_T^2M^2(M^2-1)\cos^2\theta}$ | (58) |
| 单站 | 远场 UPW 模型 $D_T\ll r$ [26] | $\frac{1}{2L\gamma}\frac{3\lambda^2}{2\pi^2d_T^2M(M^2-1)\cos^2\theta}$ | ∞ | $\frac{1}{2\gamma L}\frac{3\lambda^2}{\pi^2d_T^2M^2(M^2-1)\cos^2\theta}$ | ∞ |
| 双站 | 近场发射端 USW 模型：一般结果 | (64) | (65) | ∞ | ∞ |
| 双站 | 近场发射端 USW 模型：$\frac{D_T}{r\cos\theta}\to\infty$ | (69) | (70) | ∞ | ∞ |
| 双站 | 远场 UPW 模型 [21] | (66) | ∞ | [21] | ∞ |

## V. 数值结果

本节给出数值结果以验证所推导的近场 CRB。除特别说明外，载频 $f=2.37$ GHz，$d_T=d_R=0.0628$ m，SNR 为 $\gamma=\frac{P|\kappa|^2}{\sigma^2}=0$ dB。

### A. 单站感知

图 2 与图 3 分别绘出角度 $\theta$ 与距离 $r$ 的 CRB 随天线数 $M$ 的变化（对应式（38）（39）、（49）（50）、（42）与（53））。其中目标距离设为 $r=10$ m，角度 $\theta=\pi/6$。图例中 "Near-field-MIMO" 与 "Near-field-phased array" 表示（38）（39）（49）（50）的一般表达式，"Approximate-MIMO" 与 "Approximate-phased array" 分别表示基于二阶 Taylor 近似的（46）（47）与（57）（58），"Far-field-MIMO" 与 "Far-field-phased array" 分别表示传统 UPW 模型的 CRB；虚线为 $\frac{D_T}{r\cos\theta}\to\infty$ 时的渐近极限。图 2 表明，相控阵雷达模式的角度 CRB 小于 MIMO 雷达模式，因为前者通常享有额外的发射波束成形增益；此外，XL-MIMO 雷达与 XL 相控阵雷达的角度 CRB 都随天线尺寸增大而下降，但呈现递减回报。进一步地，当 $M$ 相对较小时，XL-MIMO 与 XL 相控阵雷达的角度 CRB 与远场 CRB 一致；但随着天线数增加，两种模型给出差异显著的结果。这表明用不恰当的远场模型分析超大规模阵列的近场感知可能造成严重误差。从图 3 还可观察到，距离 CRB 也随阵元数增加而下降；且当天线数中等（例如 $M<64$）时，距离 CRB 相当大。可以看出，式（46）（47）与（57）（58）的二阶 Taylor 近似在中等 $M$ 时较准确，但 $M$ 较大时会带来较大误差。

**图 2**：单站感知的角度 CRB（横轴为阵元数 $M$，纵轴为角度 CRB（度））。
**图 3**：单站感知的距离 CRB（横轴为阵元数 $M$，纵轴为距离 CRB（m））；对传统 UPW 模型，距离 CRB 为 ∞。

图 4 与图 5 绘出角度与距离 CRB 随目标角度 $\theta$ 的变化，天线数设为 $M=1024$，目标距离 $r=10$ m。图 4 表明角度 CRB 随 $|\theta|$ 增大而上升，最小值出现在阵列视轴（boresight，$\theta=0$）附近；但原文同句后半却称"最大 CRB 出现在视轴"，与前半句及图 4 曲线均矛盾（见注）。此外，对本文所考虑的设置，采用二阶 Taylor 近似或远场 UPW 模型平均可能带来 20 dB 的误差，在实际中不可忽略。图 5 进一步表明，基于二阶 Taylor 近似的 CRB 与基于精确距离的 CRB 趋势相反，说明二阶 Taylor 近似对近场距离 CRB 是不准确的。

> **原文疑点：** 原文第 V-A 节写 "the CRB of angle increases with $|\theta|$, and the largest CRB occurs at the boresight of the array"——两分句自相矛盾：若 CRB 随 $|\theta|$ 增大，最大值应出现在边缘而非视轴；且图 4 曲线显示 CRB 在 $\theta=0$ 附近最小、向两侧增大，与前半句一致、与"最大在视轴"不符。故疑原文 "largest" 应为 "smallest"。译文按图 4 实际趋势与前半句表述，并在此加注，未改原文字面。

**图 4**：单站感知的角度 CRB（横轴为目标角度 $\theta$）。
**图 5**：单站感知的距离 CRB（横轴为目标角度 $\theta$）。

图 6 与图 7 绘出角度与距离 CRB 随目标距离 $r$ 的变化，天线数设为 $M=1024$，目标角度 $\theta=\pi/6$。图 6 表明角度 CRB 随目标距离增大而下降；此外，当目标距离 $r$ 较大时，新推导的近场 CRB 与传统 UPW 模型相符，但在 $r$ 相对较小时二者显著偏离——此时远场 UPW 假设不再成立。图 7 表明当距离 $r$ 较大时，新推导的近场距离 CRB 与传统结果合并；此外，随着 $r$ 增大，基于精确距离的 CRB 先减小后增大，而二阶 Taylor 近似模型的 CRB 单调增大。这说明二阶 Taylor 近似模型对较小的目标距离 $r$ 更不准确。

**图 6**：单站感知的角度 CRB（横轴为目标距离 $r$）。
**图 7**：单站感知的距离 CRB（横轴为目标距离 $r$）。

### B. 双站感知

本小节给出双站近场感知结果，对应第 IV-A 节：仅在发射端考虑近场 USW 模型，接收阵元数设为 $N=8$。目标角度 $\theta=0$，目标距离 $r=18$ m，收发阵列间距 $R=35$ m。采用经典 Capon 算法实际估计参数 $\theta$ 与 $r$，并按如下方式以均方根误差（RMSE）评估性能 [39]：

$$
\mathrm{RMSE}_i=\sqrt{\frac{1}{K}\sum_{k=1}^{K}(\theta_i-\hat\theta_i)^2},\qquad i=1,2,\tag{74}
$$

其中 $\theta_i=[\theta,r]$，$\hat\theta_i$ 表示 $\theta$ 与 $r$ 的估计值；$K$ 为实验总次数，取 $K=500$。

图 8 与图 9 绘出角度与距离 CRB 随发射天线数 $M$ 的变化。可以看到，所推导 CRB 确实是 Capon 算法 RMSE 的下界；此外，当 $M$ 相对较小时，新推导的近场 CRB 与远场模型完全吻合。

**图 8**：双站感知的角度 CRB（横轴为阵元数 $M$）。
**图 9**：双站感知的距离 CRB（横轴为阵元数 $M$）。

## VI. 结论

本文研究了采用超大规模天线阵列的近场无线电感知，其中考虑 USW 模型，并讨论 XL-MIMO 雷达与 XL 相控阵雷达两种模式。对于单站近场感知，推导了角度与距离估计 CRB 的闭式表达式，并考虑若干渐近情形。结果揭示：与传统 UPW 远场感知不同，近场角度估计 CRB 不再随天线尺寸增大而无限下降；此外，近场情形下距离估计 CRB 是有限的，表明 XL-MIMO 感知具备距离分辨能力。随后考虑了一般双站情形，并把所推导 CRB 与经典 Capon 算法进行比较。数值结果验证了所推导 CRB。

## 附录 A：命题 1 的证明

如（33）—（37）所示，各参数共享一些公共求和项。因此与 [32] 类似，为获得闭式表达式，先定义函数 $f_1(x)\triangleq\frac{x^2}{x^2-2(\sin\theta)x+1}$，其中 $x\in\left[-\frac{M\varepsilon_T}{2},\frac{M\varepsilon_T}{2}\right]$。由于 $\varepsilon_T\ll1$，有 $f_1(x)\approx f_1(m\varepsilon_T)$，$\forall x\in\left[\left(m-\frac12\right)\varepsilon_T,\left(m+\frac12\right)\varepsilon_T\right]$，$m=-\frac{M-1}{2},\ldots,\frac{M-1}{2}$。于是有

$$
\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}f_1(m\varepsilon_T)\varepsilon_T\approx\int_{-\frac{M\varepsilon_T}{2}}^{\frac{M\varepsilon_T}{2}}f_1(x)\,dx.\tag{75}
$$

因此求和（28）与（31）可表示为

$$
\begin{aligned}
&\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{(m\varepsilon_T)^2}{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2}\approx\frac{1}{\varepsilon_T}\int_{-\frac{M\varepsilon_T}{2}}^{\frac{M\varepsilon_T}{2}}\frac{x^2}{x^2-2(\sin\theta)x+1}\,dx\\
&\quad=M+\frac{\sin\theta}{\varepsilon_T}\int_{-\frac{M\varepsilon_T}{2}}^{\frac{M\varepsilon_T}{2}}\frac{1}{x^2-2(\sin\theta)x+1}\,d\left(x^2-2(\sin\theta)x+1\right)-\frac{\cos2\theta}{\varepsilon_T}\int_{-\frac{M\varepsilon_T}{2}}^{\frac{M\varepsilon_T}{2}}\frac{1}{x^2-2(\sin\theta)x+1}\,dx\\
&\quad\overset{(a)}{=}M+\frac{\sin\theta}{\varepsilon_T}\ln\left|\frac{\frac{D_T^2}{4r^2}-\sin\theta\frac{D_T}{r}+1}{\frac{D_T^2}{4r^2}+\sin\theta\frac{D_T}{r}+1}\right|-\frac{\cos2\theta}{\varepsilon_T\cos\theta}\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right),
\end{aligned}\tag{76}
$$

其中 $\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right)=\arctan\left(\frac{D_T}{2r\cos\theta}-\tan\theta\right)+\arctan\left(\frac{D_T}{2r\cos\theta}+\tan\theta\right)$ 为发射角度跨度 [32]；（76）中的 $(a)$ 来自 [18] 中的积分公式 2.103，即

$$
\int\frac{Mx+N}{A+2Bx+Cx^2}\,dx=\frac{M}{2C}\ln\left|A+2Bx+Cx^2\right|+\frac{NC-MB}{C\sqrt{AC-B^2}}\arctan\frac{Cx+B}{\sqrt{AC-B^2}},\quad AC>B^2,
$$

以及（76）中 $\sin^2\theta\le1$ 这一事实。因此，把（76）代入（33）（36）即可得参数 $a$ 与 $p$ 的闭式表达式。

类似地，定义函数 $f_2(x)\triangleq\frac{x}{\sqrt{x^2-2(\sin\theta)x+1}}$ 与 $f_3(x)\triangleq\frac{x}{x^2-2(\sin\theta)x+1}$，则（29）（32）中的求和可表示为

$$
\begin{aligned}
\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{m\varepsilon_T}{\sqrt{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2}}&\approx\frac{1}{\varepsilon_T}\int_{-\frac{M\varepsilon_T}{2}}^{\frac{M\varepsilon_T}{2}}\frac{x}{\sqrt{x^2-2\sin(\theta)x+1}}\,dx\\
&=\frac{1}{\varepsilon_T}\left[\sqrt{\frac{D_T^2}{4r^2}-\sin\theta\frac{D_T}{r}+1}-\sqrt{\frac{D_T^2}{4r^2}+\sin\theta\frac{D_T}{r}+1}+\psi\left(\frac{D_T}{r}\right)\sin\theta\right],
\end{aligned}\tag{77}
$$

其中 $\psi\left(\frac{D_T}{r}\right)\triangleq\ln\left(\frac{p_2+\sqrt{1+p_2^2}}{p_1+\sqrt{1+p_1^2}}\right)$，$p_1=\frac{-\frac{D_T}{2r}-\sin\theta}{\cos\theta}$，$p_2=\frac{\frac{D_T}{2r}-\sin\theta}{\cos\theta}$；而（30）中的求和为

$$
\begin{aligned}
\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}\frac{m\varepsilon_T}{1-2m\varepsilon_T\sin\theta+(m\varepsilon_T)^2}&\approx\frac{1}{\varepsilon_T}\int_{-\frac{M\varepsilon_T}{2}}^{\frac{M\varepsilon_T}{2}}\frac{x}{x^2-2\sin(\theta)x+1}\,dx\\
&=\frac{1}{2\varepsilon_T}\ln\left|\frac{\frac{D_T^2}{4r^2}-\sin\theta\frac{D_T}{r}+1}{\frac{D_T^2}{4r^2}+\sin\theta\frac{D_T}{r}+1}\right|+\frac{\sin\theta}{\varepsilon_T\cos\theta}\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right).
\end{aligned}\tag{78}
$$

把（76）（78）代入（35）（36）可相应得到参数 $e$ 与 $p$ 的闭式；把（77）代入（34）（37）可相应得到命题 1 中的 $c$ 与 $q$。

## 附录 B：推论 1.1 的证明

注意（33）—（37）中参数含有一些公共项，先定义如下四个函数：

$$
g_1\left(\frac{D_T}{r}\right)\triangleq\sqrt{\frac{D_T^2}{4r^2}-\frac{D_T}{r}\sin\theta+1}-\sqrt{\frac{D_T^2}{4r^2}+\frac{D_T}{r}\sin\theta+1},\qquad g_2\left(\frac{D_T}{r}\right)\triangleq\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right),
$$

$$
g_3\left(\frac{D_T}{r}\right)\triangleq\ln\left|\frac{\frac{D_T^2}{4r^2}-\frac{D_T}{r}\sin\theta+1}{\frac{D_T^2}{4r^2}+\frac{D_T}{r}\sin\theta+1}\right|,\qquad g_4\left(\frac{D_T}{r}\right)\triangleq\ln\left(\frac{p_2+\sqrt{1+p_2^2}}{p_1+\sqrt{1+p_1^2}}\right),\tag{79}
$$

其中 $p_1=\frac{-\frac{D_T}{2r}-\sin\theta}{\cos\theta}$、$p_2=\frac{\frac{D_T}{2r}-\sin\theta}{\cos\theta}$，如命题 1 所述。当 $D_T/r\gg1$（如推论 1.1）时，有

$$
g_1\left(\frac{D_T}{r}\right)=\frac{D_T}{2r}\left(\sqrt{1+\frac{4r^2}{D_T^2}-\frac{4r\sin\theta}{D_T}}-\sqrt{1+\frac{4r^2}{D_T^2}+\frac{4r\sin\theta}{D_T}}\right)\overset{(a)}{\approx}\frac{D_T}{2r}\left(-\frac{4r}{D_T}\sin\theta\right)=-2\sin\theta,\tag{80}
$$

其中（80）中的 $(a)$ 来自 $r/D_T\ll1$ 的一阶 Taylor 近似。此外，[32] 表明 $g_2\left(\frac{D_T}{r}\right)=\Delta_{\mathrm{span}}^t\left(\frac{D_T}{r}\right)\approx\pi$。类似地，$g_3\left(\frac{D_T}{r}\right)$ 可得为

$$
g_3\left(\frac{D_T}{r}\right)=\ln\left|\frac{1-\frac{2D_T}{r}\sin\theta}{\frac{D_T^2}{4r^2}+\frac{D_T}{r}\sin\theta+1}\right|\approx0.\tag{81}
$$

进一步，最后一项 $g_4\left(\frac{D_T}{r}\right)$ 可表示为

$$
g_4\left(\frac{D_T}{r}\right)\overset{(d)}{\approx}\ln\left(\frac{\frac{D_T}{2r\cos\theta}+\sqrt{1+\left(\frac{D_T}{2r\cos\theta}\right)^2}}{-\frac{D_T}{2r\cos\theta}+\sqrt{1+\left(\frac{D_T}{2r\cos\theta}\right)^2}}\right)\approx2\ln\left(\frac{D_T}{r\cos\theta}\right),\tag{82}
$$

其中 $(d)$ 来自 $D_T/r\gg1$ 时 $\frac{\frac{D_T}{2r}-\sin\theta}{\cos\theta}\approx\frac{D_T}{2r\cos\theta}$。

注意（33）中参数 $a$ 可基于上述定义的 $g_2$ 与 $g_3$ 写出。因此当 $D_T/r\gg1$ 时，把 $g_2$、$g_3$ 代入（33）得

$$
a=\frac{4\pi^2r^2\cos^2\theta}{\lambda^2\varepsilon_T}\left(\frac{D_T}{r}+g_3\sin\theta-g_2\frac{\cos2\theta}{\cos\theta}\right)=\frac{4\pi^2r^2\cos^2\theta}{\lambda^2\varepsilon_T}\left(\frac{D_T}{r}-\frac{\cos2\theta}{\cos\theta}\pi\right).\tag{83}
$$

类似地，其他参数 $e,c,p,q$ 可基于 $g_1,g_2,g_3,g_4$ 写出；当 $D_T/r\gg1$ 时有

$$
e=\frac{2\pi^2r\sin2\theta}{\lambda^2\varepsilon_T}\left(\frac{D_T}{r}-2\pi\cos\theta\right),\quad p=\frac{4\pi^2}{\lambda^2\varepsilon_T}\left(\frac{D_T}{r}\sin^2\theta+\pi\cos\theta\cos2\theta\right),\quad c=-j\frac{2\pi r\sin2\theta}{\lambda\varepsilon_T}\left[\ln\left(\frac{D_T}{r\cos\theta}\right)-1\right],\quad q=j\frac{4\pi}{\lambda\varepsilon_T}\left[\cos^2\theta\ln\left(\frac{D_T}{r\cos\theta}\right)+\sin^2\theta\right].\tag{84}
$$

把这些项代入（38）（39），即可相应得到（40）（41）中的表达式。

## 附录 C：推论 1.2 的证明

当 $\frac{D_T}{r\cos\theta}\to\infty$ 时，（40）（41）中的常数项可忽略。因此经简单代数运算即得（42）（43）：

$$
\begin{aligned}
\mathrm{CRB}_\theta&\approx\frac{1}{2\gamma L}\frac{\lambda^2\left[\frac{\sin^2 2\theta}{4}\left(\frac{D_T}{r\cos\theta}\right)^2+\frac{\pi D_T}{r\cos\theta}\cos^2\theta\cos2\theta-4\left(\cos^2\theta\ln\frac{D_T}{r\cos\theta}\right)^2\right]}{8\pi^2Mr^2\cos^2\theta\left(\frac{\pi D_T}{r\cos\theta}-4\ln2\frac{D_T}{r\cos\theta}\right)}\\
&\overset{(g)}{\approx}\frac{1}{2\gamma}\frac{\lambda^2\left(\frac{D_T}{r}\right)^2\sin2\theta}{8\pi^2r^2M\cos^2\theta\frac{\pi D_T}{r\cos\theta}}\approx\frac{1}{2\gamma}\frac{\lambda^2d_T\sin2\theta}{8\pi^3r^3\cos\theta},\\
\mathrm{CRB}_r&\approx\frac{1}{2\gamma L}\frac{\lambda^2\left[\cos^2\theta\left(\frac{D_T}{r\cos\theta}\right)^2+\frac{\pi D_T\cos2\theta}{r\cos\theta}-4\sin^2\theta\left(\ln\frac{D_T}{r\cos\theta}\right)^2\right]}{8\pi^2M\left(\frac{\pi D_T}{r\cos\theta}-4\ln2\frac{D_T}{r\cos\theta}\right)}\\
&\overset{(g)}{\approx}\frac{1}{2\gamma}\frac{\lambda^2\left(\frac{D_T}{r}\right)^2}{8\pi^2M\frac{\pi D_T}{r\cos\theta}}\approx\frac{1}{2\gamma}\frac{\lambda^2d_T\cos\theta}{8\pi^3r},
\end{aligned}\tag{85}
$$

其中 $(g)$ 来自 $\lim_{x\to\infty}(ax^2+bx-c\ln^2x)=ax^2$、$\lim_{x\to\infty}(bx-c\ln^2x)=bx$，且 $x=\frac{D_T}{r\cos\theta}$。

## 附录 D：推论 1.3 的证明

与附录 B 的推导类似，当 $D_T/r\ll1$ 时，附录 B 中的函数 $g_1,g_2,g_3,g_4$ 简化为

$$
g_1\left(\frac{D_T}{r}\right)\overset{(h_1)}{\approx}-\frac{D_T}{r}\sin\theta,\quad g_2\left(\frac{D_T}{r}\right)\overset{(h_2)}{\approx}\frac{D_T}{r}\cos\theta-\frac{\cos^3\theta}{12}\left(\frac{D_T}{r}\right)^3,\quad g_3\left(\frac{D_T}{r}\right)\overset{(h_3)}{\approx}-\frac{2D_T}{r}\sin\theta+\frac{\sin\theta}{2}\left(\frac{D_T}{r}\right)^3,\quad g_4\left(\frac{D_T}{r}\right)\overset{(h_4)}{\approx}\frac{D_T}{r},\tag{86}
$$

其中 $(h_1)$ 与 $(h_4)$ 来自一阶 Taylor 近似，$(h_2)$ 与 $(h_3)$ 分别来自三阶与二阶 Taylor 近似。注意 $(h_1)$ 与 $(h_4)$ 与 $c$、$q$ 有关，而它们只以平方形式出现，故 $D_T/r\ll1$ 时无需考虑更高阶近似。把（86）代入（33）—（37）可得中间参数 $a,e,p,c,q$ 的闭式表达式；把（86）代入（38）可得（45）中的 CRB 表达式。

## 附录 E：推论 1.4 的证明

（1）中目标与第 $m$ 个阵元距离的二阶 Taylor 近似为

$$
r_m\approx r+\frac{1}{2r}(md_T)^2\cos^2\theta-md_T\sin\theta.\tag{87}
$$

因此（5）中导向向量元素 $a_m(\theta,r)$ 可表示为 $a_m(\theta,r)=e^{jmv+jm^2\varphi-j\frac{2\pi}{\lambda}r}$，其中 $v=\frac{2\pi d_T\sin\theta}{\lambda}$、$\varphi=-\frac{\pi d_T^2\cos^2\theta}{\lambda r}$。导向向量关于角度与距离的导数为

$$
\frac{\partial a_m(r,\theta)}{\partial\theta}=e^{jmv+jm^2\varphi-j\frac{2\pi}{\lambda}r}\left(jm\frac{\partial v}{\partial\theta}+jm^2\frac{\partial\varphi}{\partial\theta}\right),\qquad \frac{\partial a_m(r,\theta)}{\partial r}=e^{jmv+jm^2\varphi-j\frac{2\pi}{\lambda}r}\left(jm^2\frac{\partial\varphi}{\partial r}-j\frac{2\pi}{\lambda}\right),\tag{88}
$$

其中 $\frac{\partial v}{\partial\theta}=\frac{2\pi d_T\cos\theta}{\lambda}$、$\frac{\partial\varphi}{\partial\theta}=\frac{\pi d_T^2\sin2\theta}{\lambda r}$、$\frac{\partial\varphi}{\partial r}=\frac{\pi d_T^2\cos^2\theta}{\lambda r^2}$。因此基于二阶 Taylor 近似模型的中间参数 $a,c,e,p,q$ 可推得为

$$
a=\left\|\frac{\partial\mathbf a(r,\theta)}{\partial\theta}\right\|^2=\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}m^2\left(\frac{2\pi d_T\cos\theta}{\lambda}+m\frac{\pi d_T^2\sin2\theta}{\lambda r}\right)^2=\left(\frac{2\pi d_T\cos\theta}{\lambda}\right)^2\eta_1+\left(\frac{\pi d_T^2\sin2\theta}{\lambda r}\right)^2\eta_2,\tag{89}
$$

其中 $\eta_1=\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}m^2=\frac{M(M^2-1)}{12}$、$\eta_2=\sum_{m=-\frac{M-1}{2}}^{\frac{M-1}{2}}m^4=\frac{M(M^2-1)(3M^2-7)}{240}$。类似地可得其他参数：

$$
p=\left(\frac{\pi d_T^2\cos^2\theta}{\lambda r^2}\right)^2\eta_2-\left(\frac{2\pi d_T\cos\theta}{\lambda r}\right)^2\eta_1+\frac{4\pi^2}{\lambda^2}M,\qquad e=\left(\frac{\pi^2d_T^4\cos^2\theta\sin2\theta}{\lambda^2r^3}\right)\eta_2-\frac{2\pi^2d_T^2\sin2\theta}{\lambda^2r}\eta_1,
$$

$$
c=-j\frac{\pi d_T^2\sin2\theta}{\lambda r}\eta_1,\qquad q=-j\frac{\pi d_T^2\cos^2\theta}{\lambda r^2}\eta_1+j\frac{2\pi}{\lambda}M.\tag{90}
$$

把（90）代入（38）（39），即可相应得到（46）（47）中的表达式。

## 附录 F：推论 3.1 的证明

当 $\theta=0$ 时，（62）中的参数简化为

$$
\Gamma_\theta(r,\theta)=\frac{r}{R-r},\qquad \Gamma_r(r,\theta)=0.\tag{91}
$$

因此（64）（65）中的参数简化为

$$
a=\frac{4\pi^2r^2}{\lambda^2\varepsilon_T}\left[\frac{D_T}{r}-2\arctan\left(\frac{D_T}{2r}\right)\right],\quad c=e=s=k=f=h=0,\quad p=\frac{4\pi^2}{\lambda^2\varepsilon_T}2\arctan\left(\frac{D_T}{2r}\right),
$$

$$
q=j\frac{2\pi}{\lambda\varepsilon_T}\ln\left(\frac{\frac{D_T}{2r}+\sqrt{1+\left(\frac{D_T}{2r}\right)^2}}{-\frac{D_T}{2r}+\sqrt{1+\left(\frac{D_T}{2r}\right)^2}}\right),\qquad i=\frac{\pi^2d_R^2r^2}{3\lambda^2(R-r)^2}N(N^2-1).\tag{92}
$$

因此（64）（65）中的 CRB 简化为

$$
\mathrm{CRB}_\theta=\frac{1}{2\gamma L}\frac{M}{Mi+Na},\qquad \mathrm{CRB}_r=\frac{1}{2\gamma LN}\frac{M}{p-\frac{1}{M}|q|^2}.\tag{93}
$$

把（92）代入（93）即得（67）（68）中的闭式表达式。为获得距离 CRB 的最小点，对 $\mathrm{CRB}_r$ 关于 $\frac{D_T}{2r}$ 求导。令 $x=\frac{D_T}{2r}$，该导数可表示为

$$
\frac{\partial\mathrm{CRB}_r}{\partial x}=\frac{\lambda^2}{8\pi^2\gamma LN}\times\frac{\arctan x-\frac{x}{1+x^2}+\frac{2}{\sqrt{1+x^2}}\ln\left(x+\sqrt{1+x^2}\right)-\frac{2}{x}\ln^2\left(x+\sqrt{1+x^2}\right)}{\left[\arctan x-\frac{1}{x}\ln^2\left(x+\sqrt{1+x^2}\right)\right]^2}.\tag{94}
$$

为求最小点，令 $\frac{\partial\mathrm{CRB}_r}{\partial x}=0$，数值求解得 $x\approx6$，即 $D_T\approx12r$。

## 图注与表注

**图 1**：XL-MIMO 的近场雷达感知。图中显示发射阵列（$M$ 个阵元）、接收阵列（$N$ 个阵元）、目标位置、以及收发阵列间距 $R$ 等几何关系；子图分别对应 XL-MIMO 雷达与 XL 相控阵雷达的配置。
**图 2**：单站感知的角度 CRB（横轴为阵元数 $M$，纵轴为角度 CRB（度），比较 Near-field-MIMO/相控阵、Approximate-MIMO/相控阵、Far-field-MIMO/相控阵）。
**图 3**：单站感知的距离 CRB（横轴为阵元数 $M$，纵轴为距离 CRB（m））；对传统 UPW 模型，距离 CRB 为 ∞。
**图 4**：单站感知的角度 CRB（横轴为目标角度 $\theta$；$M=1024$，$r=10$ m）。
**图 5**：单站感知的距离 CRB（横轴为目标角度 $\theta$；$M=1024$，$r=10$ m）。
**图 6**：单站感知的角度 CRB（横轴为目标距离 $r$；$M=1024$，$\theta=\pi/6$）。
**图 7**：单站感知的距离 CRB（横轴为目标距离 $r$；$M=1024$，$\theta=\pi/6$）。
**图 8**：双站感知的角度 CRB（横轴为阵元数 $M$；$N=8$，$\theta=0$，$r=18$ m，$R=35$ m）。
**图 9**：双站感知的距离 CRB（横轴为阵元数 $M$；参数同图 8）。

**表 I**：不同感知类别在各场景下的 CRB，已在本页第 IV 节末按原表逐格转录（原文表内含合并单元格，转写时已按语义展开并加注）。

## 参考文献

> 以下按原文编号 [1]—[53] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “Y .”“P .”“¨” 等空格/变音伪影已按常规写法整理，书目内容未改动。

[1] H. Wang and Y. Zeng, “SNR scaling laws for radio sensing with extremely large-scale MIMO,” in Proc. IEEE Int. Conf. Commun. Workshops (ICC Workshops), 2022, pp. 121–126.

[2] M. Latva-aho and K. L. (eds.), “Key drivers and research challenges for 6G ubiquitous wireless intelligence,” 6G Research Visions 1, 6G Flagship, University of Oulu, Finland, Sep. 2019.

[3] X. You et al., “Towards 6G wireless communication networks: Vision, enabling technologies, and new paradigm shifts,” Sci. China Inf. Sci., vol. 64, no. 1, pp. 1–74, Nov. 2020.

[4] Y. Zeng and X. Xu, “Toward environment-aware 6G communications via channel knowledge map,” IEEE Wireless Commun., pp. 1–8, Mar. 2021.

[5] M. L. Rahman, J. A. Zhang, X. Huang, Y. J. Guo, and R. W. Heath, “Framework for a perceptive mobile network using joint communication and radar sensing,” IEEE Trans. Aerosp. Electron. Syst., vol. 56, no. 3, pp. 1926–1941, Jun. 2020.

[6] J. A. Zhang, F. Liu, C. Masouros, R. W. Heath, Z. Feng, L. Zheng, and A. Petropulu, “An overview of signal processing techniques for joint communication and radar sensing,” IEEE J. Sel. Top. Sign. Proces., vol. 15, no. 6, pp. 1295–1315, 2021.

[7] Z. Xiao and Y. Zeng, “An overview on integrated localization and communication towards 6G,” Sci. China Inf. Sci., vol. 65, no. 3, pp. 1–46, 2022.

[8] F. Liu, C. Masouros, A. Li, H. Sun, and L. Hanzo, “MU-MIMO communications with MIMO radar: From co-existence to joint transmission,” IEEE Trans. Wireless Commun., vol. 17, no. 4, pp. 2755–2770, Apr. 2018.

[9] A. Hassanien, M. G. Amin, E. Aboutanios, and B. Himed, “Dual-function radar communication systems: A solution to the spectrum congestion problem,” IEEE Signal Process. Mag., vol. 36, no. 5, pp. 115–126, 2019.

[10] Y. Cui, F. Liu, X. Jing, and J. Mu, “Integrating sensing and communications for ubiquitous IoT: Applications, trends, and challenges,” IEEE Netw., vol. 35, no. 5, pp. 158–167, 2021.

[11] F. Liu, C. Masouros, T. Ratnarajah, and A. Petropulu, “On range sidelobe reduction for dual-functional radar-communication waveforms,” IEEE Wireless Commun. Lett., vol. 9, no. 9, pp. 1572–1576, 2020.

[12] C. Sturm and W. Wiesbeck, “Waveform design and signal processing aspects for fusion of wireless communications and radar sensing,” Proc. IEEE, vol. 99, no. 7, pp. 1236–1259, 2011.

[13] Y. Liu, G. Liao, J. Xu, Z. Yang, and Y. Zhang, “Adaptive OFDM integrated radar and communications waveform design based on information theory,” IEEE Commun. Lett., vol. 21, no. 10, pp. 2174–2177, 2017.

[14] P. Kumari, S. A. Vorobyov, and R. W. Heath, “Adaptive virtual waveform design for millimeter-wave joint communication–radar,” IEEE Trans. Signal Process., vol. 68, pp. 715–730, 2020.

[15] Z. Xiao and Y. Zeng, “Waveform design and performance analysis for full-duplex integrated sensing and communication,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1823–1837, 2022.

[16] S. Chen, A. Kaushik, and C. Masouros, “Pre-scaling and codebook design for joint radar and communication based on index modulation,” in Proc. IEEE Glob. Commun. Conf., GLOBECOM - Proc., 2022, pp. 6037–6041.

[17] S. Chen, Z. Xiao, and Y. Zeng, “Simultaneous beam sweeping for multi-beam integrated sensing and communication,” in Proc. IEEE Int. Conf. Commun. (ICC), 2022, pp. 4438–4443.

[18] W. Chen, L. Li, Z. Chen, T. Quek, and S. Li, “Enhancing THz/mmWave network beam alignment with integrated sensing and communication,” IEEE Commun. Lett., vol. 26, pp. 1698–1702, 2022.

[19] M. Kobayashi, G. Caire, and G. Kramer, “Joint state sensing and communication: Optimal tradeoff for a memoryless case,” in Proc. IEEE Int. Symp. Inf. Theor. Proc., 2018, pp. 111–115.

[20] M. Kobayashi, H. Hamad, G. Kramer, and G. Caire, “Joint state sensing and communication over memoryless multiple access channels,” in Proc. IEEE Int. Symp. Inf. Theor. Proc., 2019, pp. 270–274.

[21] A. Liu, Z. Huang, M. Li, Y. Wan, W. Li, T. X. Han, C. Liu, R. Du, D. K. P. Tan, J. Lu et al., “A survey on fundamental limits of integrated sensing and communication,” IEEE Commun. Surv. Tutor., vol. 24, no. 2, pp. 994–1034, 2022.

[22] H. Cramér, Mathematical Methods of Statistics. Princeton University Press, 1999, vol. 43.

[23] H. L. Van Trees and K. L. Bell, “Bayesian bounds for parameter estimation and nonlinear filtering/tracking,” AMC, vol. 10, no. 12, pp. 10–1109, 2007.

[24] V. M. Chiriac, Q. He, A. M. Haimovich, and R. S. Blum, “Ziv–Zakai bound for joint parameter estimation in MIMO radar systems,” IEEE Trans. Signal Process., vol. 63, no. 18, pp. 4956–4968, 2015.

[25] J. Li and P. Stoica, MIMO Radar Signal Processing. John Wiley & Sons, Ltd, 2009.

[26] R. Boyer, “Performance bounds and angular resolution limit for the moving colocated MIMO radar,” IEEE Trans. Signal Process., vol. 59, no. 4, pp. 1539–1552, 2011.

[27] Q. He, R. S. Blum, H. Godrich, and A. M. Haimovich, “Cramer-Rao bound for target velocity estimation in MIMO radar with widely separated antennas,” in Proc. CISS, Annu. Conf. Inf. Sci. Syst., 2008, pp. 123–127.

[28] K. Rambach and B. Yang, “Direction of arrival estimation of two moving targets using a time division multiplexed colocated MIMO radar,” in Proc. IEEE Nat. Radar Conf. Proc., 2014, pp. 1118–1123.

[29] M. A. Richards, Fundamentals of Radar Signal Processing. McGraw-Hill Education, 2014.

[30] C. Shi, D. Xu, Y. Zhou, and W. Tu, “Range-DoA information and scattering information in phased-array radar,” in Proc. IEEE Int. Conf. Comput. Commun. (ICCC), 2019, pp. 747–752.

[31] T. L. Marzetta, “Noncooperative cellular wireless with unlimited numbers of base station antennas,” IEEE Trans. Wireless Commun., vol. 9, no. 11, pp. 3590–3600, Nov. 2010.

[32] H. Lu and Y. Zeng, “How does performance scale with antenna number for extremely large-scale MIMO?” in Proc. IEEE Int. Conf. Commun. (ICC), 2021, pp. 1–6.

[33] A. Amiri, M. Angjelichinoski, E. de Carvalho, and R. W. Heath, “Extremely large aperture massive MIMO: Low complexity receiver architectures,” in Proc. IEEE Globecom Workshops, GC Wkshps - Proc., Dec. 2018, pp. 1–6.

[34] H. Lu and Y. Zeng, “Communicating with extremely large-scale array/surface: Unified modeling and performance analysis,” IEEE Trans. Wireless Commun., vol. 21, no. 6, pp. 4039–4053, Jun. 2022.

[35] E. Björnson and L. Sanguinetti, “Power scaling laws and near-field behaviors of massive MIMO and intelligent reflecting surfaces,” IEEE Open J. Commun. Society, vol. 1, pp. 1306–1324, Sep. 2020.

[36] J. P. González-Coma, F. J. López-Martínez, and L. Castedo, “Low-complexity distance-based scheduling for multi-user XL-MIMO systems,” IEEE Wireless Commun. Lett., vol. 10, no. 11, pp. 2407–2411, 2021.

[37] J. Li and P. Stoica, “MIMO radar with colocated antennas,” IEEE Signal Process. Mag., vol. 24, no. 5, pp. 106–114, Sep. 2007.

[38] G. Liu and X. Sun, “Efficient method of passive localization for mixed far-field and near-field sources,” IEEE Antennas Wireless Propag. Lett., vol. 12, pp. 902–905, 2013.

[39] M. N. El Korso, R. Boyer, A. Renaux, and S. Marcos, “Conditional and unconditional Cramér–Rao bounds for near-field source localization,” IEEE Trans. Signal Process., vol. 58, no. 5, pp. 2901–2907, 2010.

[40] L. Khamidullina, I. Podkurkov, and M. Haardt, “Conditional and unconditional Cramér-Rao bounds for near-field localization in bistatic MIMO radar systems,” IEEE Trans. Signal Process., vol. 69, pp. 3220–3234, 2021.

[41] Y. Begriche, M. Thameri, and K. Abed-Meraim, “Exact Cramer Rao bound for near field source localization,” in Proc. Int. Conf. Inf. Sci., Signal Process. Appl. (ISSPA), 2012, pp. 718–721.

[42] A. Guerra, F. Guidi, D. Dardari, and P. M. Djurić, “Near-field tracking with large antenna arrays: Fundamental limits and practical algorithms,” IEEE Trans. Signal Process., vol. 69, pp. 5723–5738, 2021.

[43] J. He, L. Li, T. Shu, and T.-K. Truong, “Mixed near-field and far-field source localization based on exact spatial propagation geometry,” IEEE Trans. Veh. Technol., vol. 70, no. 4, pp. 3540–3551, 2021.

[44] J. Capon, “High-resolution frequency-wavenumber spectrum analysis,” Proc. IEEE, vol. 57, no. 8, pp. 1408–1418, 1969.

[45] E. Björnson, Ö. T. Demir, and L. Sanguinetti, “A primer on near-field beamforming for arrays and reconfigurable intelligent surfaces,” in Proc. Conf. Rec. Asilomar Conf. Signals Syst. Comput., 2021, pp. 105–112.

[46] K. Forsythe, D. Bliss, and G. Fawcett, “Multiple-input multiple-output MIMO radar: performance issues,” in Proc. Thirty-Eighth Asilomar Conf. Signals, Systems and Computers, vol. 1, Nov. 2004, pp. 310–315.

[47] S. Hu, F. Rusek, and O. Edfors, “Beyond massive MIMO: The potential of positioning with large intelligent surfaces,” IEEE Trans. Signal Process., vol. 66, no. 7, pp. 1761–1774, 2018.

[48] X. Gan, C. Huang, Z. Yang, C. Zhong, and Z. Zhang, “Near-field localization for holographic RIS assisted mmWave systems,” IEEE Commun. Lett., vol. 27, no. 1, pp. 140–144, 2023.

[49] C. Huang, S. Hu, G. C. Alexandropoulos, A. Zappone, C. Yuen, R. Zhang, M. D. Renzo, and M. Debbah, “Holographic MIMO surfaces for 6G wireless networks: Opportunities, challenges, and trends,” IEEE Wireless Commun., vol. 27, no. 5, pp. 118–125, 2020.

[50] J. Sherman, “Properties of focused apertures in the Fresnel region,” IRE Trans. Antennas Propag., vol. 10, no. 4, pp. 399–408, 1962.

[51] B. Friedlander, “Localization of signals in the near-field of an antenna array,” IEEE Trans. Signal Process., vol. 67, no. 15, pp. 3885–3893, 2019.

[52] B. Ottersten, M. Viberg, P. Stoica, and A. Nehorai, “Exact and large sample maximum likelihood techniques for parameter estimation and detection in array processing,” in Radar Array Processing, 1993, pp. 99–151.

[53] P. Stoica and A. Nehorai, “MUSIC, maximum likelihood, and Cramer-Rao bound,” IEEE Trans. Acoustics, Speech, and Signal Processing, vol. 37, no. 5, pp. 720–741, 1989.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含三条贡献、组织结构与记号）；第 II 节系统模型（式（1）—（22），含 XL-MIMO 雷达、XL 相控阵雷达与统一 CRB 框架，图 1）；第 III 节单站近场 CRB（III-A XL-MIMO 雷达：式（23）—（47）、命题 1、定理 1、推论 1.1—1.4；III-B XL 相控阵雷达：式（48）—（58）、定理 2、推论 2.1—2.4）；第 IV 节双站近场 CRB（式（59）—（73）、定理 3、推论 3.1—3.3、表 I）；第 V 节数值结果（式（74），图 2—9 的讨论）；第 VI 节结论；附录 A—F（式（75）—（94））；图 1—9 图注与表 I 转写；参考文献 [1]—[53] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—9 的图像本体未复制（站点不上传图片），仅保留中文图注与正文数值；③原文三处疑点已加注未改数：V-A 中"最大 CRB 出现在视轴"与同句"随 $|\theta|$ 增大"及图 4（视轴处最小）相矛盾、表 I 末行 XL 相控阵 $\mathrm{CRB}_\theta$ 单元格填文献标记 "[21]" 而非数值、双站两行相控阵列的合并 "∞" 已按语义展开；④附录证明中的部分求和区间与中间步骤按 PDF 渲染核对（p.5、p.9、p.12）；⑤作者简介与 IEEE 版权声明不在正文范围，未收录。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
