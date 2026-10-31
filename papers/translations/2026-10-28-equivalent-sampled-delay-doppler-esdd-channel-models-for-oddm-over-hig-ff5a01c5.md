---
layout: page
title: "高扩展信道 ODDM 的等效采样时延-多普勒信道模型｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-28-equivalent-sampled-delay-doppler-esdd-channel-models-for-oddm-over-hig-ff5a01c5/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/ff5a01c51d2d9c00/) · 原文为期刊/会议正式版，许可待核验 · [全部目录](/papers/catalog/)

# 高扩展信道 ODDM 的等效采样时延-多普勒信道模型

**原题：** Equivalent Sampled Delay-Doppler (ESDD) Channel Models for ODDM Over Highly-Spread Channels  
**作者：** Jun Tong（IEEE 会员）、Akram Shafie（IEEE 会员）、Jinhong Yuan（IEEE 会士）、Hai Lin（IEEE 高级会员）、Jiangtao Xi（IEEE 高级会员）（澳大利亚伍伦贡大学；澳大利亚新南威尔士大学；日本大阪公立大学）  
**版本：** IEEE Transactions on Wireless Communications, vol. 25, 2026（2025 年 9 月 16 日在线发表；DOI: 10.1109/TWC.2025.3607314），正文 16 页（IEEE TWC 3944—3959）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—VII 节、致谢、参考文献（英文原条目 34 条）、图 1—图 8；原文无数值表格；逐句逐式终校未做。

> **许可与使用范围说明：** 原文为 **IEEE 期刊正式版**（©2025 IEEE；原文声明 "Personal use is permitted, but republication/redistribution requires IEEE permission"），**再传播许可待核验**；本页仅作学习用途，**不计入可公开全文统计**，也不作为正式译文对外发布。

## 摘要

延迟-多普勒（DD）域调制（如正交延迟-多普勒分复用，ODDM）近期被用于双选择性信道上的通信。本文针对 ODDM 系统在**高扩展、离格物理信道**（其延迟与多普勒频移可分别超过 DD 正交脉冲（DDOP）的**子脉冲间隔**与**子音调间隔**）下的有效离散时间信道，推导**等效采样（在格）DD（ESDD）信道模型**。所推导的 ESDD 模型计入：i) 实际物理信道中的**离格**延迟与多普勒频移；ii) 发送端的**逐样本脉冲成形**；iii) 接收端的**匹配滤波与加窗**。随后本文研究 ESDD 模型的**支撑集**及其对采用更一般脉冲与窗的 ODDM 输入输出（IO）关系的影响。特别地，本文表明 ODDM 的数字序列与在格离散时间 DD 信道**精细耦合**，从而得到**紧凑的 IO 关系**。本文还分析 ESDD 信道的**折叠与混叠**，及其对 ODDM 的 DD 域符号所经历有效信道的**衰落效应**与**可预测性**的影响。基于这些结果，本文识别出可从**单帧内嵌 DD 域导频直接估计** ESDD 信道的**条件**。最后给出数值结果进一步验证本文发现。

**关键词：** 延迟-多普勒域多载波调制（DDMC）；双选择性信道；正交延迟-多普勒分复用（ODDM）；等效采样延迟-多普勒（ESDD）信道。

## I. 引言

延迟-多普勒（DD）域调制 [2]—[11] 因其在经历时间与频率双弥散的双选择性（时变宽带）信道上的通信与感知能力而受到显著关注，在高移动场景（如车联网 V2X 与低轨卫星通信）中尤其有前景。近期提出的**正交延迟-多普勒分复用（ODDM）**是一种 DD 域多载波（DDMC）调制，它用 DD 域正交脉冲（DDOP）[4]、[12]—[14] 生成承载信息符号的波形。DDOP 对 DD 分辨率**正交**，使 ODDM 波形能与 DD 信道耦合，从而利用 DD 信道的**稀疏性与稳定性**，在降低干扰的同时获得分集增益 [13]。事实上，只要发送端用带适当循环扩展的 DDOP 做脉冲成形，ODDM 波形的正交性在通过**单径在格 DD 信道**后仍能保持；这一特性带来性能与复杂度之间的有利折中。

以传播路径的**在格**延迟与多普勒频移参数化的在格信道模型，是设计与分析 DD 域调制及 chirp 类调制 [15]、[16] 的有用工具。[12]、[13]、[17] 对正交时频空间（OTFS）与 ODDM 调制采用此类模型，揭示其波形正交性等基本特征及其对 DD 域 IO 关系与接收端干扰的影响。然而，从给定收发机角度看，由于所用时频资源有限，实际物理信道在 DD 域几乎必然是**离格**的 [18]—[20]。因此，用于推导 DD 域调制第一性原理的在格模型与描述实际离格物理系统的模型之间常存在**差距**。把物理信道**取整**到预定义 DD 网格似乎是潜在修正手段，但这可能造成数学模型与物理系统的不匹配，尤其在高信噪比（SNR）应用中——此时模型失配可能主导背景噪声对性能的影响。此外，实际实现 DD 域调制时，为规范其对时频资源的占用、控制带外发射（OOBE）并满足频谱掩膜，收发机可能需要**滤波与加窗**；这些操作不可避免会影响系统的 DD 域 IO 关系，且**无法仅用物理信道参数刻画**。

从 DD 域数字信号处理的角度看，有效的 DD 信道模型必须计入**物理信道与收发机预处理/后处理的联合效应**。已有关于有效信道模型的研究包括 [19] 对时不变频率选择性信道的抽头延迟线（TDL）模型处理，以及 [18]、[21]、[22] 对带模拟滤波与加窗的连续时间双选择性信道的处理。这些研究有助于建立物理信道与有效信道之间的联系，但**未考虑**近期提出的 ODDM——它采用实际脉冲成形/匹配滤波与数字加窗等**独特收发操作**。此外，建立物理信道与有效信道之间的联系对通感一体化（ISAC）应用也有用 [23]—[26]。

本文考虑 ODDM，研究**高扩展离格物理信道**与收发机**滤波、采样、加窗**级联后的建模。此处"高扩展"指延迟和/或多普勒扩展可分别超过 DDOP 的子脉冲间隔与子音调间隔的信道；这类在时间与频率上均高度弥散的信道可能出现在低时延、高移动应用中 [27]、[28]。如后文所示，与先前研究 [4]、[29] 考虑的**欠扩展**情形不同，它们会在 ODDM 接收端导致**混叠效应**。

本文建立**仅含在格**延迟与多普勒频移（由采样间隔与帧时长确定）的**等效采样 DD（ESDD）信道模型**，以刻画离格物理信道所产生的有效离散时间信道。目标应用是**数字（近似）实现**的 ODDM：它先把 DD 域承载信息的符号映射为时域数字序列，再用时域脉冲成形生成模拟波形 [4]；相比模拟实现 ODDM，该实现在更低实现复杂度下具有可比性能。与原始 ODDM [4] 隐含假设矩形接收窗不同，本文在 ODDM 接收端引入**一般离散时间加窗**——其动机是经典多载波（MC）系统（如 OFDM）可用时域加窗抑制载波间干扰（ICI）[30]；类似地，ODDM 中也可通过精心选择时域窗来抑制 ICI（亦称多普勒间干扰，IDI）。

目前聚焦 ODDM 在离格物理信道上建模的研究有限。其中 [29] 研究了采用平方根 Nyquist（SRN）脉冲与矩形窗、在欠扩展物理信道上的 ODDM，并报告了在格与离格信道下 ODDM IO 关系的差异。本文在 [29] 之上进一步：在更一般物理信道条件（离格路径参数、可能更高的 DD 扩展）下，对采用**更一般逐样本脉冲与接收窗**的 ODDM 实现进行建模与分析。做法是为有效离散时间双选择性信道建立 ESDD 信道模型，并利用 ODDM 在格信道上的性质——不仅可推导一般物理信道下 ODDM 系统的 DD 域 IO 关系，还可刻画其有效 DD 信道的**折叠/混叠、衰落与可预测性**。具体贡献如下：

- **建立**一般离格双选择性物理信道的离散时间 ESDD 信道模型，其 DD 网格由采样间隔与帧时长确定；刻画物理路径在在格 DD 抽头上的**扩展**，以及发送脉冲与接收时域窗对等效信道模型支撑与轮廓的影响。本文表明：对一般脉冲、窗与物理信道，存在**统一**的 ESDD 模型——由抽头延迟与混频器（多普勒频移器）组成、后接一个矩形窗。该模型不仅可用于分析 ODDM，也可用于分析在离散时间域共享相同有效信道的其他新兴调制（如 [8]、[9]、[16]）。
- **应用** ESDD 模型刻画一般的数字（近似）实现 ODDM：通过考察 ODDM 时域序列与离散时间在格 DD 信道的相互作用，讨论 ODDM 信令与在格 DD 信道的**耦合**；进而推导采用一般脉冲与窗、在高扩展离格物理信道上 ODDM 的 IO 模型，表明 ESDD 模型是分析一般 ODDM 系统的有效工具。
- **刻画** ODDM 中 ESDD 信道的折叠/混叠、衰落与可预测性性质，揭示决定有效 DD 信道可预测性的是 **ESDD 信道的支撑集**而非原物理信道的支撑集；据此建立可从单帧内嵌 DD 域导频**直接估计 ESDD 信道**的条件。
- **给出**数值例子，展示脉冲、接收时域窗与物理信道对 ESDD 信道的影响，并展示所得 ODDM 系统的性能；说明通过选择 ODDM 的脉冲与窗，可在误码率与互信息、信号处理复杂度与带宽需求之间取得折中。

上述部分结果已在 [1] 中报告。相比 [1]，本文新增：(折叠) ESDD 信道以物理信道参数表示的**显式表达式**、ODDM 与 ESDD 信道耦合的**深入分析**、关于 ESDD 信道折叠/混叠、衰落与可预测性的**新发现**、高扩展物理信道 IO 关系的**向量模型**，以及结果的**详尽图示**。本文其余部分：第 II 节系统模型；第 III 节 ESDD 模型；第 IV 节基于所得结果分析数字（近似）实现的 ODDM；第 V 节数值例子；第 VI 节结论。

## II. 系统模型

考虑 ODDM 系统 [4]：每帧含 $M\times N$ 个 DD 域信息承载符号 $X[m,n]$（$m$ 为子载波/延迟索引、$n$ 为时隙/多普勒索引）。DD 域符号先经逆离散 Zak 变换（IDZT）映射为时域序列；连续时间 ODDM 信号（含逐样本脉冲成形）为

$$
x(t)=\sum_{m=0}^{M-1}\sum_{n=0}^{N-1}X[m,n]\,e^{\mathrm j2\pi s[n]\frac{t-mT/M}{NT}}\,a\left(t-m\frac{T}{M}-\frac{s[n]}{N}T\right)\text{-型脉冲项},\tag{1}
$$

其中 $s[n]\triangleq n$（$0\le n\le N/2-1$）、$s[n]\triangleq n-N$（其余 $n$），$T$ 为帧时长[^1]。

[^1]: 原文 (1) 在 PDF 文本层中因上下标跨行而被分散，此处按 ODDM 的标准 DDOP 脉冲成形结构与 (2)—(5) 的数字实现流程整理；精确排版以原文为准。

数字实现中，先对每行作逆离散 Fourier 变换（IDFT）：

$$
\dot x[m,\dot n]=\frac{1}{\sqrt N}\sum_{n=0}^{N-1}X[m,n]e^{\mathrm j2\pi\frac{\dot n n}{N}},\qquad0\le\dot n\le N-1.\tag{2}
$$

再把所得样本按 DD 域顺序重排为时间序列

$$
\bar x[k]\triangleq\dot x\left[[k]_M,\left\lfloor\frac{k}{M}\right\rfloor\right],\qquad k\in\mathcal B,\tag{3}
$$

其中相邻样本间隔为 $T_s$，$[k]_M$ 表示模 $M$。随后在 ODDM 序列两端加长度为 $L_{\mathrm{CP}}$ 的循环前缀（CP）与长度 $L_{\mathrm{CS}}$ 的循环后缀（CS）：

$$
x[k]=\begin{cases}\bar x[k+K], & k=-L_{\mathrm{CP}},-L_{\mathrm{CP}}+1,\ldots,-1,\\ \bar x[k-K], & k=K,K+1,\ldots,K+L_{\mathrm{CS}}-1,\end{cases}\tag{4}
$$

$K\triangleq MN$。带 CP/CS 的 ODDM 连续时间信号由基于 $a(t)$ 的**逐样本脉冲成形（滤波）**得到：

$$
x(t)=\sum_{k=-L_{\mathrm{CP}}}^{K+L_{\mathrm{CS}}-1}x[k]a\left(t-kT_s\right).\tag{5}
$$

本文**不**把 $a(t)$ 限制为 SRN 脉冲——允许非正交脉冲可为管理接收信号中的干扰提供新的自由度 [32]。ODDM 的数字实现等价于：先对 DD 域符号 $\{X[m,n]\}$ 做**逆离散 Zak 变换（IDZT）**得到时域符号 $\{\bar x[k]\}$，再作循环扩展与脉冲成形。与原始 ODDM [4] 隐含假设矩形接收窗不同，本文在接收端引入一般离散时间窗 $w[k]$。

考虑由 $P$ 个离散散射体构成的双选择性物理信道 [18]：

$$
y(t)=\sum_{p=1}^{P}\rho_px\left(t-\tau_p\right)e^{\mathrm j2\pi\nu_p\left(t-\tau_p\right)}+z(t),\tag{6}
$$

其中 $x(t)$ 为发送信号、$y(t)$ 为接收信号，$\rho_p$、$\tau_p$、$\nu_p$ 分别为第 $p$ 条物理路径的（复）衰减系数、延迟与多普勒频移，$z(t)$ 为噪声。该信道的时变冲激响应为

$$
h(t,\tau)=\sum_{p=1}^{P}\rho_p\delta\left(\tau-\tau_p\right)e^{\mathrm j2\pi\nu_p\left(t-\tau_p\right)},\tag{7}
$$

它可进一步写成

$$
h(t,\tau)=\int_{\nu}V(\nu,\tau)e^{\mathrm j2\pi\nu(t-\tau)}\,\mathrm d\nu,\tag{8}
$$

其中**多普勒-延迟扩展函数** $V(\nu,\tau)$ [18]、[21] 为

$$
V(\nu,\tau)\triangleq\sum_{p=1}^{P}\rho_p\delta\left(\tau-\tau_p\right)\delta\left(\nu-\nu_p\right),\tag{9}
$$

$\delta(\cdot)$ 为 Dirac delta 函数。可见 $V(\nu,\tau)$ 完全由物理路径参数确定。

接收端对 $y(t)$ 作匹配滤波并在 $t=kT_s$ 处采样，得到时域样本 $\tilde y[k]$，再经加窗与 DFT 得到 DD 域接收符号：

$$
Y[m,n]=\sum_{\dot n=0}^{N-1}\frac{1}{\sqrt N}e^{-\mathrm j2\pi n\frac{\dot n}{N}}\tilde y[\dot nM+m],\tag{10}
$$

其中 $\tilde y[k]$ 为匹配滤波输出第 $k$ 个样本。

## III. 等效离散时间信道模型

为记号简洁，先忽略 IO 模型中的噪声项，并考虑仅含**单条物理路径**的信道，随后推广到多径。对参数为 $(\rho_p,\tau_p,\nu_p)$ 的单散射体物理信道，(6) 的连续时间基带 IO 关系简化为

$$
y(t)=\rho_px\left(t-\tau_p\right)e^{\mathrm j2\pi\nu_p(t-\tau_p)}.\tag{11}
$$

### A. 抽头延迟线（TDL）模型：时变冲激响应

设 $a(t)$ 的支撑为 $[-T_a/2,T_a/2]$，$T_a>0$ 为脉冲时长。把 (5) 代入 (11)，信道输出可写为

$$
y(t)=\rho_p\sum_{k'=-L_{\mathrm{CP}}}^{K+L_{\mathrm{CS}}-1}x[k']a\left(t-k'T_s-\tau_p\right)e^{\mathrm j2\pi\nu_p(t-\tau_p)}.\tag{12}
$$

接收端使用冲激响应为 $a^{*}(-t)$ 的匹配滤波器，其输出在 $t=kT_s$ 处采样后为

$$
\tilde y[k]=\rho_p\sum_{k'=-L_{\mathrm{CP}}}^{K+L_{\mathrm{CS}}-1}x[k']e^{\mathrm j2\pi\nu_p(kT_s-\tau_p)}g\left(kT_s-k'T_s-\tau_p,\nu_p\right),\tag{13}
$$

其中 $g(\tau,\nu)$ 为脉冲的"**模糊函数**"：

$$
g(\tau,\nu)\triangleq\int a^{*}(\xi)a(\xi+\tau)e^{\mathrm j2\pi\nu\xi}\,\mathrm d\xi.\tag{14}
$$

若 $a(t)$ 的支撑为 $[t_1,t_2]$，则 $g(\tau,\nu)$ 在 $\tau$ 上的支撑相应受限。把 (13) 整理为对抽头延迟 $l\triangleq k-k'$ 的求和：

$$
\tilde y[k]=\sum_{l=l_{\min}}^{l_{\max}}\tilde h[l,k]x[k-l],\tag{15}
$$

其中 $l_{\min}$、$l_{\max}$ 分别为最小与最大抽头延迟，且

$$
\tilde h[l,k]=\rho_pe^{\mathrm j2\pi\nu_p(kT_s-\tau_p)}g\left(lT_s-\tau_p,\nu_p\right)\tag{16}
$$

为**时变冲激响应**，它确定第 $k$ 个输出样本如何由邻近输入样本经抽头延迟组合而成；多径存在时，每个延迟抽头可含多条物理路径的贡献。

对接收样本加窗后得到

$$
y[k]=w[k]\tilde y[k]=\sum_{l=l_{\min}}^{l_{\max}}h[l,k]x[k-l],\qquad k\in\mathcal B,\tag{17}
$$

其中离散时变有效冲激响应 $h[l,k]$ 在归一化多普勒频移 $\kappa_p\triangleq\nu_pKT_s$ 与延迟 $\ell_p\triangleq\tau_p/T_s$ 下为

$$
h[l,k]=\sum_{p}\rho_p\,w[k]\,g\left((l-\ell_p)T_s,\nu_p\right)e^{\mathrm j\frac{2\pi(k-\ell_p)\kappa_p}{K}},\tag{18}
$$

即 (17) 的 $h[l,k]$ 由各路径贡献叠加而成，其中 $l\in\mathcal L$、$b\in\mathcal B$ 为整数取值集合。对整数延迟与多普勒的**在格化**情形（$\ell_p$、$\kappa_p$ 取整数 $l_p$、$b_p$），上式退化为

$$
h[l,k]=\sum_{p=1}^{P'}\rho'_pe^{\mathrm j\frac{2\pi(k-l_p)b_p}{K}}\delta\left[l-l_p\right],\tag{19}
$$

即 (17) 的 $h[l,k]$ 由各在格路径分量叠加得到。

### B. 离散时间在格 DD 信道模型

首先注意 (18) 中的 $h[l,k]$ 可重写为

$$
h[l,k]=\gamma_{l,p}w[k]e^{\mathrm j\frac{2\pi(k-l)\kappa_p}{K}},\tag{20}
$$

其中系数

$$
\gamma_{l,p}\triangleq g\left((l-\ell_p)T_s,\frac{\kappa_p}{KT_s}\right)e^{\mathrm j\frac{2\pi(l-\ell_p)\kappa_p}{K}}\tag{21}
$$

刻画具有离格参数的一条物理路径的**扩展**。为得到纯在格表示，把 (20) 中的复指数按在格 Doppler 基展开。定义在格 Doppler 向量

$$
\mathbf v_b\triangleq\frac{1}{\sqrt K}\left[1,e^{\mathrm j\frac{2\pi b}{K}},\ldots,e^{\mathrm j\frac{2\pi(K-1)b}{K}}\right]^{T},\qquad b\in\mathcal B,\tag{22}
$$

把多普勒项 $\tilde{\mathbf v}_{\kappa_p}$ 展开为

$$
\tilde{\mathbf v}_{\kappa_p}=\sum_{b\in\mathcal B}\left(\mathbf v_b^{H}\tilde{\mathbf v}_{\kappa_p}\right)\mathbf v_b,\tag{23}
$$

其系数为

$$
\mathbf v_b^{H}\tilde{\mathbf v}_{\kappa_p}=\frac{1}{K}\sum_{k'=0}^{K-1}w[k']e^{\mathrm j\frac{2\pi(\kappa_p-b)k'}{K}}.\tag{24}
$$

把 (24) 代入 (20)，得到有效时变冲激响应的等效模型：

$$
h[l,k]=\sum_{b\in\mathcal B}V_{b,l}e^{\mathrm j\frac{2\pi(k-l)b}{K}},\qquad k\in\mathcal B,\tag{25}
$$

其中 $V_{b,l}$ 表示在格**虚拟散射体**的路径增益：

$$
V_{b,l}=\sum_{p}\gamma_{l,p}\left(\frac{1}{K}\sum_{k'=0}^{K-1}w[k']e^{\mathrm j\frac{2\pi(\kappa_p-b)k'}{K}}\right).\tag{26}
$$

于是可定义**等效采样 DD（ESDD）信道**：

$$
V[b,l]=\sum_{\dot b\in\mathcal B}\sum_{\dot l\in\mathcal L}V_{\dot b,\dot l}\delta\left[b-\dot b\right]\delta\left[l-\dot l\right],\tag{27}
$$

其对应时变冲激响应为

$$
h[l,k]=\sum_{b\in\mathcal B}V[b,l]e^{\mathrm j\frac{2\pi(k-l)b}{K}},\tag{28}
$$

其中 $V_{\dot b,\dot l}$ 由 (26) 定义。把 (21) 代入 (26) 并经整理，可得 ESDD 系数的显式表达式：

$$
V_{b,l}=\sum_{p}\rho_p\,g\left((l-\ell_p)T_s,\nu_p\right)e^{\mathrm j\frac{2\pi(bl-\kappa_p\ell_p)}{K}}\left(\frac{1}{K}\sum_{k'=0}^{K-1}w[k']e^{\mathrm j\frac{2\pi(\kappa_p-b)k'}{K}}\right),\tag{30}
$$

对 $b\in\mathcal B$、$l\in\mathcal L$。式 (30) 即 ESDD 系数以物理信道参数 $(\rho_p,\ell_p,\kappa_p)$、脉冲模糊函数 $g$ 与窗 $w$ 表示的显式表达式；(29) 为其中间步骤[^2]。

[^2]: 原文 (29)、(30) 在 PDF 文本层中因公式跨页被分段，本页按 (21)—(26) 的推导结构整理其等价形式；精确排布以原文为准。

## IV. 高扩展信道上 ODDM 的分析

### A. ODDM 序列与离散时间在格 DD 信道的耦合

ODDM 帧的时域序列可写为 DD 域符号经各"符号流"基函数的叠加：

$$
x[k]=\sum_{m=0}^{M-1}\sum_{n=0}^{N-1}X[m,n]s_{m,n}[k],\qquad k\in\mathcal B,\tag{32}
$$

其中 $s_{m,n}[k]$ 为第 $(m,n)$ 个 DD 域符号对应的时域基函数，记 $\sqrt N$、$\alpha\triangleq e^{\mathrm j\frac{2\pi}{N}}$、$\theta\triangleq e^{\mathrm j\frac{2\pi}{MN}}$ 以简化记号。特别地，图 3(a) 展示循环扩展后仅传一个信息符号 $X[\tilde m,\tilde n]$ 的发送 ODDM 序列：

$$
x[k]=X[\tilde m,\tilde n]s_{\tilde m,\tilde n}[k],\qquad k\in\mathcal B.\tag{33}
$$

ODDM 信令序列与在格 DD 信道的相互作用导致**精细耦合**：在格 DD 信道的抽头延迟与多普勒频移使该符号在 DD 域按 $[m-l]_M$、$[n-b]_N$ 移位并携带相位；延迟方向的折叠还会引入跨子帧的相位项：

$$
x\text{-项}\ \propto\ e^{\mathrm j\frac{2\pi}{MN}(\tilde m-M)b}X[\tilde m,\tilde n]\,s_{(\tilde m+l-M),[\tilde n+b]_N}[k],\quad M\le\tilde m+l\le2M-1,\tag{34a}
$$
$$
x\text{-项}\ \propto\ e^{\mathrm j\frac{2\pi}{MN}(\tilde m+M)b}X[\tilde m,\tilde n]\,s_{(\tilde m+l+M),[\tilde n+b]_N}[k],\quad-M\le\tilde m+l\le-1.\tag{34b}
$$

综合可得在格子信道的 DD 域 IO 关系：对路径增益 $\rho$、延迟移位 $l$、多普勒移位 $b$ 的在格子信道，

$$
Y[m,n]=\rho\,e^{\mathrm j\frac{2\pi(m-l)b}{MN}}\Psi_{m,l,[n-b]_N}X\left[[m-l]_M,[n-b]_N\right],\tag{35}
$$

其中

$$
\Psi_{m,l,\tilde n}\triangleq e^{\mathrm j2\pi\left\lfloor\frac{m-l}{M}\right\rfloor\tilde n}\tag{36}
$$

计入沿延迟的**折叠**影响。对 ODDM 而言，(25) 的 ESDD 模型最多有 $L M N$ 个子信道（虚拟散射体）。把全部 $M N$ 个 DD 域发送符号 $X[\tilde m,\tilde n]$ 与一般 ESDD 模型 (27) 代入，可把 IO 关系重写为

$$
Y[m,n]=\sum_{l\in\mathcal L}\sum_{b\in\mathcal B}V_{b,l}e^{\mathrm j\frac{2\pi(m-l)b}{MN}}\Psi_{m,l,[n-b]_N}X\left[[m-l]_M,[n-b]_N\right]\tag{37a}
$$
$$
=\sum_{l\in\mathcal L}\sum_{\kappa\in\mathcal K}\dot V_{\kappa,l,m}e^{\mathrm j\frac{2\pi(m-l)\kappa}{MN}}\Psi_{m,l,[n-\kappa]_N}X\left[[m-l]_M,[n-\kappa]_N\right]\tag{37b}
$$
$$
=\sum_{d\in\mathcal D}\sum_{\kappa\in\mathcal K}\ddot V_{\kappa,d,m,n}e^{\mathrm j\frac{2\pi(m-d)\kappa}{MN}}\Psi_{m,d,[n-\kappa]_N}X\left[[m-d]_M,[n-\kappa]_N\right]\tag{37c}
$$

其中：(37a) 以原始（未折叠）ESDD 系数 $V_{b,l}$（由 (30) 给出，$b\in\mathcal B$、$l\in\mathcal L$）表示 IO 关系，$[m-l]_M\in\mathcal M$、$[n-b]_N\in\mathcal N$；(37b) 用对多普勒折叠后的系数 $\dot V_{\kappa,l,m}$ 表示，其中 $\kappa\in\mathcal K$ 为基本多普勒区间内的移位；(37c) 进一步用对延迟与多普勒都折叠后的系数 $\ddot V_{\kappa,d,m,n}$（$d\in\mathcal D$）表示。

**多普勒折叠系数** $\dot V_{\kappa,l,m}$ 由对 $b=\kappa+m'N$ 的分量求和得到：

$$
\dot V_{\kappa,l,m}=\sum_{m'=0}^{M-1}V_{\kappa+m'N,l}\,e^{\mathrm j\frac{2\pi(m-l)m'}{M}},\qquad\kappa\in\mathcal K,\ l\in\mathcal L.\tag{38}
$$

由 (38) 可见 $\dot V_{\kappa,l,m}$ 可依赖 $m$（即不同 ODDM 符号所经历的等效增益可能不同）。**延迟与多普勒折叠系数** $\ddot V_{\kappa,d,m,n}$ 为

$$
\ddot V_{\kappa,d,m,n}=\sum_{q=q_{\min}}^{q_{\max}}\dot V_{\kappa,d+qM,m}\,e^{-\mathrm j\frac{2\pi n q}{N}},\qquad\kappa\in\mathcal K,\ d\in\mathcal D,\tag{39}
$$

其中 $q_{\min}\triangleq\left\lfloor l_{\min}/M\right\rfloor$、$q_{\max}\triangleq\left\lceil l_{\max}/M\right\rceil$。

为得到显式的折叠系数，先考虑单径情形：把 (26) 的 $V_{b,l}$ 代入 (38) 得

$$
\dot V_{\kappa,l,m}=\frac{1}{MN}\gamma_{l,p}\,e^{\mathrm j\frac{2\pi(\kappa-\kappa_p)l}{MN}}\Theta_{m,\kappa,p},\tag{40}
$$

其中

$$
\Theta_{m,\kappa,p}=\sum_{k'=0}^{K-1}w[k']e^{\mathrm j\frac{2\pi k'(\kappa_p-\kappa)}{MN}}\sum_{m'=0}^{M-1}e^{\mathrm j\frac{2\pi m'(m-k')}{M}}.\tag{41}
$$

注意对整数 $k'$，$\sum_{m'}e^{\mathrm j2\pi m'(m-k')/M}$ 仅在 $k'=m$ 时非零；据此可把 (41) 化为只涉及时域窗在 $k'=m$ 处的抽样：

$$
\Theta_{m,\kappa,p}=M\sum_{n'=0}^{N-1}w[m+n'M]e^{\mathrm j\frac{2\pi n'(\kappa_p-\kappa)}{N}}.\tag{42}
$$

定义

$$
\zeta_m(\kappa,\kappa_p)\triangleq\frac{1}{N}\sum_{n'=0}^{N-1}w[m+n'M]e^{\mathrm j\frac{2\pi n'(\kappa_p-\kappa)}{N}},\tag{43}
$$

则可把 (40) 写成

$$
\dot V_{\kappa,l,m}=\frac{1}{M}\gamma_{l,p}\,e^{\mathrm j\frac{2\pi(\kappa-\kappa_p)l}{MN}}\zeta_m(\kappa,\kappa_p),\qquad\kappa\in\mathcal K,\ l\in\mathcal L,\ m\in\mathcal M.\tag{44}
$$

由 (21) 的 $\gamma_{l,p}$ 表达式，可进一步得到折叠 ESDD 系数的完整形式：

$$
\dot V_{\kappa,l,m}=\frac{1}{M}\rho_p\,g\left((l-\ell_p)T_s,\frac{\kappa_p}{NT}\right)e^{\mathrm j\frac{2\pi\left[(m-\ell_p)\kappa_p-(m-l)\kappa\right]}{MN}}\zeta_m(\kappa,\kappa_p),\tag{44'}
$$

$$
\ddot V_{\kappa,d,m,n}=\frac{1}{M}\rho_p\,e^{\mathrm j\frac{2\pi(m-\ell_p)\kappa_p}{MN}}\zeta_m(\kappa,\kappa_p)\sum_{q=q_{\min}}^{q_{\max}}g\left((qM+d-\ell_p)T_s,\frac{\kappa_p}{NT}\right)e^{\mathrm j\frac{2\pi q(\kappa-n)}{N}},\tag{45}
$$

对 $\kappa\in\mathcal K$、$d\in\mathcal D$、$m\in\mathcal M$、$n\in\mathcal N$。把 (45) 代入 (37c) 并经整理，可得单径情形下的 DD 域 IO 关系

$$
Y[m,n]=\rho_p\,e^{\mathrm j\frac{2\pi(m-\ell_p)\kappa_p}{MN}}\sum_{l\in\mathcal L}\left[g\left((l-\ell_p)T_s,\frac{\kappa_p}{NT}\right)\zeta_m([n-\kappa]_K,\kappa_p)\right]\cdot X\left[[m-l]_M,[n-\kappa]_N\right]+\text{（含折叠相位的项）},\tag{46}
$$

其中括号标注项对应文献中称为 **ISI**（符号间干扰）的贡献。

**一般物理信道的 IO 关系。** 对由 (47) 描述的一般 P 径物理信道，

$$
y(t)=\int_{\nu}\int_{\tau}V(\nu,\tau)x(t-\tau)e^{\mathrm j2\pi\nu(t-\tau)}\,\mathrm d\tau\,\mathrm d\nu+z(t),\tag{47}
$$

其 ESDD 与折叠 ESDD 系数可由对 (30)、(44)、(45) 的连续化得到。折叠 ESDD 系数可写为对扩展函数 $V(\nu,\tau)$ 的积分：

$$
\ddot V_{\kappa,d,m,n}=\int_{\nu}\int_{\tau}V(\nu,\tau)\zeta_m(\kappa,NT\nu)e^{\mathrm j2\pi\frac{m(NT\nu-\kappa)-MN\tau\nu+\kappa d}{MN}}\sum_{q=q_{\min}}^{q_{\max}}g\left((qM+d)T_s-\tau,\nu\right)e^{\mathrm j\frac{2\pi q(\kappa-n)}{N}}\,\mathrm d\tau\,\mathrm d\nu,\tag{48}
$$

对 $\kappa\in\mathcal K$、$d\in\mathcal D$、$m\in\mathcal M$、$n\in\mathcal N$。

### C. 特殊情形：分段常值窗 $\{w[k]\}$

当窗在每列/子帧内为常值时（如 $w[m+n'M]$ 与 $n'$ 无关），(43) 变为与 $m$ 无关：

$$
\zeta_m(\kappa,\kappa_p)=\zeta(\kappa,\kappa_p)\triangleq\frac{1}{N}\sum_{n'=0}^{N-1}w_{n'}e^{\mathrm j\frac{2\pi n'(\kappa_p-\kappa)}{N}},\qquad\forall n',\tag{49}
$$

即可由 $(\kappa,\kappa_p)$ 直接计算。对**矩形窗**（亦为分段常值，$w[k]=1$，$0\le k\le K-1$），

$$
\zeta_m(\kappa,\kappa_p)=\zeta(\kappa,\kappa_p)\triangleq\frac{1}{N}\cdot\frac{1-e^{-\mathrm j2\pi(\kappa-\kappa_p)}}{1-e^{-\mathrm j\frac{2\pi}{N}(\kappa-\kappa_p)}},\tag{50}
$$

即 **Dirichlet 核**。该特殊情形此前已被研究过 [29]。

### D. 低多普勒频移（$\nu_pT_a$ 较小）的特殊情形

当乘积 $\nu_pT_a$ 足够小、使信道在 $a(\xi)$ 支撑内的变化可忽略时，可把 (14) 的 $g(\tau,\nu)$ 近似为 $g(\tau)\triangleq\int a^{*}(\xi)a(\xi+\tau)\mathrm d\xi$——这假设 $e^{\mathrm j2\pi\nu_p\xi}\approx1$ 对 $a(\xi)$ 支撑内的 $\xi$ 成立。此时加窗时变冲激响应 (18) 变为

$$
h[l,k]=\rho_p\,g\left(lT_s-\tau_p\right)w[k]e^{\mathrm j2\pi\nu_p(kT_s-\tau_p)}.\tag{51}
$$

不失一般性，考虑矩形窗、$T_s$ 间隔的 SRN 脉冲、单条物理路径且 $\kappa_p$、$\ell_p$ 为整数、$g((l-\ell_p)T_s,\nu_p)\approx g((l-\ell_p)T_s)$ 的情形。此时在格 DD 信道模型 (26) 的许多虚拟散射体消失，即 ESDD 系数退化为

$$
V_{b,l}=\rho_p\delta\left[l-\ell_p\right]\delta\left[b-\kappa_p\right].\tag{52}
$$

若 $\kappa_p\in\mathcal K$（多普勒在基本区间内），则 ODDM 中的**多普勒折叠** ESDD 系数简化为

$$
\dot V_{\kappa,l,m}=\rho_p\delta\left[l-\ell_p\right]\delta\left[\kappa-\kappa_p\right],\tag{53}
$$

它关于 ODDM 符号索引 $m$ **恒定**。然而若 $\kappa_p\notin\mathcal K$（多普勒更高），则发生**混叠**；由 (52) 与 (38) 得

$$
\dot V_{\kappa,l,m}=\rho_pe^{\mathrm j\frac{2\pi\left\lfloor\kappa_p/N\right\rceil(m-l)}{M}}\delta\left[l-\ell_p\right]\delta\left[\kappa-[\kappa_p]_K\right].\tag{54}
$$

例如当 $\kappa_p=60$、$N=32$ 时 $\left\lfloor\kappa_p/N\right\rceil=2$、$[\kappa_p]_K=-4$，(54) 变为 $\dot V_{\kappa,l,m}=\rho_pe^{\mathrm j2\pi(m-l)\cdot2/M}\delta[l-\ell_p]\delta[\kappa+4]$，它**随 $m$ 变化**（DD 域符号所经历的有效增益随符号变化）。

对低多普勒情形 (53)，若 $\ell_p\in\mathcal D$（延迟亦低），则

$$
\ddot V_{\kappa,d,m,n}=\dot V_{\kappa,d,m}=\dot V_{\kappa,d}=\rho_p\delta\left[d-\ell_p\right]\delta\left[\kappa-\kappa_p\right],\tag{55}
$$

即 ESDD 信道沿延迟**无折叠**。若 $\ell_p\notin\mathcal D$（高延迟），则出现延迟折叠：

$$
\ddot V_{\kappa,d,m,n}=\rho_pe^{-\mathrm j\frac{2\pi\left\lfloor\ell_p/M\right\rceil n}{N}}\delta\left[d-[\ell_p]_D\right]\delta\left[\kappa-\kappa_p\right].\tag{56}
$$

对高多普勒情形 $\kappa_p\notin\mathcal K$：若 $\ell_p\in\mathcal D$，则

$$
\ddot V_{\kappa,d,m,n}=\rho_pe^{\mathrm j\frac{2\pi\left\lfloor\kappa_p/N\right\rceil(m-d)}{M}}\delta\left[d-\ell_p\right]\delta\left[\kappa-[\kappa_p]_K\right],\tag{57}
$$

即折叠只沿多普勒发生。相反，若 $\ell_p\notin\mathcal D$，则

$$
\ddot V_{\kappa,d,m,n}=\rho_pe^{\mathrm j\frac{2\pi}{MN}\left(\cdots\right)}\delta\left[d-[\ell_p]_D\right]\delta\left[\kappa-[\kappa_p]_K\right]\ \text{-型项},\tag{58}
$$

折叠**同时**沿延迟与多普勒发生，两方向的混叠相互耦合。

### E. ESDD 信道的折叠

综合 (38)、(39)、(44)、(45) 与 (52)—(58) 可见：ESDD 信道的支撑由原始物理路径的离格参数经**多普勒折叠**（模 $N$）与**延迟折叠**（模 $M$）决定；折叠把原本落在基本区间外的移位映射回基本区间，可能使多个虚拟散射体落在同一对 $(d,\kappa)$ 上、并使等效增益随 DD 符号索引 $(m,n)$ 变化。因此有效 DD 信道的**可预测性**取决于 **ESDD 信道的支撑**（而非原物理信道的支撑）：当 ESDD 支撑足够局部化时，等效信道在 DD 域上仍可被紧凑刻画并可预测；当折叠严重时，同一支撑对应更多物理路径的叠加，可预测性下降。

### F. 直接估计 ESDD 信道的条件

**引理 3：** 从内嵌 DD 域导频**直接估计** ESDD 信道 $\{\ddot V_{\kappa,d,m,n}\}$ 在无噪情形下可实现，其条件为：信道的在格等效虚拟散射体被限制在延迟与多普勒移位的**基本区间**内，即

$$
V_{b,l}=0,\qquad\text{若 }b\notin\mathcal K,\ l\notin\mathcal D.\tag{59}
$$

此时 ESDD 信道无混叠、无折叠，故单帧内嵌导频即可直接给出各虚拟散射体增益。反之，当 (59) 不成立时，同一 $(d,\kappa)$ 上的折叠系数在不同 $(m,n)$ 处可能不同，某个 $(m,n)$ 处得到的估计不能直接用作其他 $(m',n')$ 处的估计；此时直接估计物理信道参数 [29] 等方法可能更适用。需要指出，理论上条件 (59) **不能**由实际有限长窗保证；对有限长窗，折叠/混叠总在一定程度上存在，只是其能量可能足够小。

### G. 矩阵模型

ODDM 的 IO 关系也可用矩阵模型表示。与 [29, Sec. III-C1] 类似，计入信道噪声后，时域接收符号向量 $\mathbf y_T\triangleq[y[0],\ldots,y[NM-1]]^{\mathrm T}$ 可写为

$$
\mathbf y_T=\mathbf H_{T\text{-}DD}\mathbf x_{DD}+\mathbf z_T,\tag{60}
$$

其中 $\mathbf z_T$ 对噪声按同一定义。用置换矩阵 $\boldsymbol\Pi$ 与变换矩阵 $\mathbf H$ 描述 ODDM 符号在时域的交织：

$$
\left[\boldsymbol\Pi\right]_{k,k'}=\begin{cases}1, & k'=[k]_{MN}+\left\lfloor\frac{k}{M}\right\rfloor\\ 0, & \text{其他}\end{cases}\tag{61}
$$

（$\mathcal B=\{0,1\}$ 刻画 ODDM 符号在时域的交织）。收发端插入并移除 CP/CS 后，$MN\times MN$ 矩阵 $\mathbf H_T$ 的元素为 $\left[\mathbf H_T\right]_{k,k'}=h\left[[k-k']_{\dot L},k\right]$，其中 $\dot L$ 为包含 $\mathcal L$ 的 $MN$ 个连续整数集合。对 $P$ 径物理信道，(18) 的冲激响应更新为

$$
h[l,k]=\sum_{p=1}^{P}\rho_pw[k]g\left(lT_s-\tau_p,\nu_p\right)e^{\mathrm j\frac{2\pi(k-\ell_p)\kappa_p}{K}}.\tag{62}
$$

$\mathbf z_T$ 中的噪声样本 $\{z[k]\}$ 为 $z[k]=w[k]\tilde z[k]$，其中

$$
\tilde z[k]=\int a^{*}(t-kT_s)z(t)\,\mathrm dt,\tag{63}
$$

$z(t)$ 由 (6) 定义。假设 $z(t)$ 为 AWGN，满足 $\mathbb E[z(t)]=0$、$\mathbb E[z(t)z^{*}(t')]=\sigma_z^{2}\delta(t-t')$，则

$$
\mathbb E\left[\tilde z[k]\tilde z^{*}[k']\right]=\sigma_z^{2}\int a^{*}(\xi)a\left(\xi+(k-k')T_s\right)\mathrm d\xi=\sigma_z^{2}g\left((k-k')T_s\right).\tag{64}
$$

因此 $\tilde z[k]$（$k\in\mathcal K$）的协方差矩阵为 Toeplitz 矩阵 $\left[\boldsymbol\Sigma_{\tilde z}\right]_{k,k'}=\sigma_z^{2}g((k-k')T_s)$。对归一化 SRN 脉冲，$g(lT_s)=\delta[l]$（$l$ 为整数），故 $\boldsymbol\Sigma_{\tilde z}=\sigma_z^{2}\mathbf I$，采样噪声可建模为 AWGN；对非 SRN 脉冲，$\boldsymbol\Sigma_{\tilde z}$ **非对角**，AWGN 模型可能不准确。加窗噪声向量 $\mathbf z_T$ 为零均值，协方差矩阵 $\boldsymbol\Sigma_T=\mathbf W\boldsymbol\Sigma_{\tilde z}\mathbf W^{\mathrm H}$，其中 $\mathbf W\triangleq\operatorname{diag}\{w[0],w[1],\ldots,w[MN-1]\}$。

还可写出 **DD 域矩阵模型**：

$$
\mathbf y_{DD}=\mathbf H_{DD}\mathbf x_{DD}+\mathbf z_{DD},\tag{65}
$$
$$
\mathbf H_{DD}=\left(\mathbf I_M\otimes\mathbf F_N^{\mathrm H}\right)\mathbf H\boldsymbol\Pi\mathbf H_T\boldsymbol\Pi\left(\mathbf I_M\otimes\mathbf F_N\right),\tag{66}
$$

其中 $\mathbf y_{DD}\triangleq[\mathbf y_{DD}[0]^{\mathrm T},\ldots,\mathbf y_{DD}[M-1]^{\mathrm T}]^{\mathrm T}$、$\mathbf y_{DD}[m]\triangleq[Y[m,0],\ldots,Y[m,N-1]]^{\mathrm T}$（$m\in\mathcal M$）；DD 域噪声协方差为 $\boldsymbol\Sigma_{DD}=\left(\mathbf I_M\otimes\mathbf F_N^{\mathrm H}\right)\mathbf H\boldsymbol\Pi\mathbf H\boldsymbol\Sigma_T\boldsymbol\Pi\left(\mathbf I_M\otimes\mathbf F_N\right)$。

基于本文 ESDD 信道的结论，(46) 系统的 DD 域信道矩阵 $\mathbf H_{DD}$ 还可用 $M\times M$ 个块描述：

$$
\mathbf H_{DD}=\left[\mathbf H_{DD}[m,\tilde m]\right]_{0\le m\le M-1,\ 0\le\tilde m\le M-1},\tag{67}
$$

其中第 $(m,\tilde m)$ 块的 $(n,\tilde n)$ 元素为（以折叠 ESDD 系数或物理参数表示）：

$$
\left[\mathbf H_{DD}[m,\tilde m]\right]_{n,\tilde n}=\ddot V_{[n-\tilde n]_K,[m-\tilde m]_D,m,n}\,e^{\mathrm j\frac{2\pi\left(m-[m-\tilde m]_D\right)[n-\tilde n]_K}{MN}}\Psi_{m,[m-\tilde m]_D,\tilde n}
=\sum_{p=1}^{P}\rho_pe^{\mathrm j\frac{2\pi(m-\ell_p)\kappa_p}{NM}}\zeta_m\left([n-\tilde n]_K,\kappa_p\right)\Psi_{m,[m-\tilde m]_D,\tilde n}\left(\sum_{q=q_{\min}}^{q_{\max}}g\left((qM+[m-\tilde m]_D-\ell_p)T_s,\frac{\kappa_p}{NT}\right)e^{-\mathrm j\frac{2\pi q\tilde n}{N}}\right).\tag{68}
$$

据此，对 DD 域符号 $\{X[m,n]\}$，可基于下式作线性最小均方误差（LMMSE）均衡：

$$
\hat{\mathbf x}_{DD}=\left(\mathbf H_{T\text{-}DD}^{\mathrm H}\boldsymbol\Sigma_T^{-1}\mathbf H_{T\text{-}DD}+\mathbf I\right)^{-1}\mathbf H_{T\text{-}DD}^{\mathrm H}\boldsymbol\Sigma_T^{-1}\mathbf y_T\tag{69}
$$
$$
=\left(\mathbf H_{DD}^{\mathrm H}\boldsymbol\Sigma_{DD}^{-1}\mathbf H_{DD}+\mathbf I\right)^{-1}\mathbf H_{DD}^{\mathrm H}\boldsymbol\Sigma_{DD}^{-1}\mathbf y_{DD}.\tag{70}
$$

上述 LMMSE 均衡的性能可证明**与接收窗 $w[k]$ 无关**，但**依赖脉冲 $a(t)$**。为评估 ODDM 系统的性能极限，还评估平均互信息（MI）（独立零均值、单位平均功率高斯输入时）：

$$
I=\frac{\log\det\left(\mathbf H_{T\text{-}DD}\mathbf H_{T\text{-}DD}^{\mathrm H}+\boldsymbol\Sigma_T\right)-\log\det\left(\boldsymbol\Sigma_T\right)}{MN}
=\frac{\log\det\left(\mathbf H_{DD}\mathbf H_{DD}^{\mathrm H}+\boldsymbol\Sigma_{DD}\right)-\log\det\left(\boldsymbol\Sigma_{DD}\right)}{MN}.\tag{71}
$$

## V. 数值例子

### A. DD 信道扩展与折叠

本文结果展示了在给定脉冲与窗时，物理 DD 信道与其在格等效信道之间的关系与差异。对具有离格延迟与多普勒频移的物理信道，一条物理路径的扩展一方面来自脉冲在延迟索引上的**非零支撑**，另一方面来自加窗 Fourier 变换的**频谱泄漏**（多普勒索引方向）。为演示该现象，考虑以下候选脉冲与窗：

**脉冲：**
- **平方根升余弦（SRRC）脉冲**（滚降系数 $\beta$）：$a(t)=C_s\frac{\sin\left(\pi(1-\beta)\frac{t}{T_s}\right)+4\beta\frac{t}{T_s}\cos\left(\pi(1+\beta)\frac{t}{T_s}\right)}{\pi\frac{t}{T_s}\left(1-\left(4\beta\frac{t}{T_s}\right)^{2}\right)}$；
- **高斯脉冲**（标准差 $\sigma$）：$a(t)=C_ge^{-\left(\frac{t}{\sqrt2\sigma T_s}\right)^{2}}$。

其中 $C_s$、$C_g$ 用于把脉冲能量归一化为 $\int_{-\infty}^{\infty}|a(t)|^{2}\mathrm dt=1$。注意使用高斯脉冲时，ODDM 关于 DD 分辨率的正交性可能**丢失**，此时所得波形可视为非正交 DDMC。

**窗：**
- **矩形窗**（分段常值）：$w[k]=1$，$\forall k$；
- **Hamming 窗**：$w[k]=\frac{25}{46}-\frac{21}{46}\cos\left(\frac{2\pi k}{K}\right)$，$\forall k$。

图 4 给出单径物理信道下 ESDD 信道支撑的示例（取不同滚降系数的 SRRC 或高斯脉冲）：考虑位于 $\ell_p=96.5$、$\kappa_p=15.5$ 的单条路径；$\beta=0.1$ 的 SRRC 脉冲与 $\sigma=0.7$ 的高斯脉冲具有相近带宽（约 $1.094/T_s$，按 99.9% 能量覆盖计）。回忆 ESDD 与折叠 ESDD 模型分别由 (30)、(44)、(45) 给出；对后者，以 DD 域接收符号 $Y[m,n]$ 在 $m=n=1$ 处所见的折叠系数为例。定义 $P_{\mathrm{ESDD}}$ 为贡献相应（折叠）ESDD 信道 99.9% 能量的**主导系数** $V_{b,l}$、$\dot V_{\kappa,l,m}$、$\ddot V_{\kappa,d,m,n}$ 的个数。可以看到：折叠后 $P_{\mathrm{ESDD}}$ 可能**减少**，因为 ESDD 信道中多个延迟与多普勒移位（$l\in\mathcal L$、$b\in\mathcal B$）可能被折叠到基本区域内的同一 $(d,\kappa)$ 上。由图 4 可见 ESDD 信道**强烈依赖**脉冲与窗：当使用脉冲时长更短（如 SRRC 的 $\beta$ 更大）或使用 Hamming 窗时，由于沿延迟与多普勒的泄漏更小，其支撑相应**收缩**。对物理路径 Doppler $\kappa_p=15.5$（位于多普勒基本区间 $[-N/2,N/2-1]=[-32,31]$ 内），使用 Hamming 窗时可把 ESDD 信道多普勒移位有效限制在基本区间内（忽略可忽略的在格路径时）；相比之下，矩形窗下可观察到**混叠**。

为展示本文结果对更大 DD 移位的适用性，图 5 考虑 $\ell_p=696.5>M/2=256$、$\kappa_p=105.5>N/2=32$ 的单条物理路径；类似结论仍成立，且等效信道的混叠可从 ESDD 信道延迟与多普勒支撑的变化中观察到。

图 6 给出 $P=20$ 与 $100$ 条在 DD 平面紧密相邻的物理路径示例（中心在 $\ell=16.5$、$\kappa=12.5$，最大偏差 0.25，SRRC 脉冲 $\beta=0.1$、Hamming 窗）。可以看到：ESDD 信道的虚拟散射体数 $P_{\mathrm{ESDD}}=64$ 可**小于**图 6 中物理散射体数 $P=100$——这证实当大量物理路径紧密相邻时，ESDD 模型可给出比原始物理信道模型**更紧凑、更低维**的表示；同时 $P=20$ 与 $100$ 的 ESDD 信道结果几近相同，说明不同物理信道可**共享相同**的 ESDD 支撑。

### B. 误码率性能与互信息

ODDM 的均衡可基于时域接收符号 (60) 或 DD 域接收符号 (65)；(69)、(70) 给出 LMMSE 均衡。图 7 给出 $M=256$、$N=16$、$P=4$、$\sum_{p=1}^{P}|\rho_p|^{2}=P$ 的归一化物理信道示例，假设矩形窗；$\sigma_z^{2}=\mathbb E[|z(t)|^{2}]$（$z(t)$ 由 (6) 定义），物理信道的 $\{\kappa_p\}$ 在 $[0,N]$ 均匀分布、$\{\ell_p\}$ 在 $[32,96]$ 均匀分布，脉冲时长 $T_a=32T_s$。可以看到：在相同的 99.9% 能量覆盖带宽下，$\beta=0.1$ 的 SRRC 脉冲比 $\sigma=0.7$ 的高斯脉冲取得**更好 BER**。高斯脉冲一般**不满足无 ISI 准则**，故即使在单径在格物理信道下接收信号也可能存在更严重干扰；相反，SRRC 作为 SRN 脉冲可有效缓解上述干扰，是 ODDM 的有吸引力的候选。由于 (69)、(70) 的直接 LMMSE 均衡涉及大矩阵求逆、复杂度高，本文还考虑基于**迭代共轭梯度（CG）**算法 [29]（40 次迭代）的低复杂度 LMMSE 实现：CG 的代价主要由与信道矩阵相关的矩阵—向量积决定，每次迭代复杂度与 $\mathbf H_{T\text{-}DD}$（或 $\mathbf H_{DD}$）的**稀疏度**成正比，而稀疏度受脉冲 $a(t)$ 与窗 $w[k]$ 影响。得益于其快速衰减，$\beta$ 较大的 SRRC 脉冲或 $\sigma$ 较小的高斯脉冲具有更低的 CG 每迭代复杂度；但 CG 的**收敛速度**同样受脉冲与窗影响——可观察到高斯脉冲使 CG 更慢地收敛到直接 LMMSE 均衡，故二者之间存在可见差距。图 7(b) 的平均互信息结果展示与图 7(a) 误码率相似的趋势。ODDM 性能还依赖脉冲 $a(t)$ 的参数（如 SRRC 的滚降系数 $\beta$），更多数值例子见 [29]。

图 8 进一步考察信道扩展对 ODDM 性能的影响（$M=64$、$N=64$、$T_a=16T_s$、SRRC 脉冲 $\beta=0.1$）：低 DD 扩展情形取 $P=4$ 条路径、$\{\ell_p\}$ 在 $[16,32]$ 均匀分布、$\{\kappa_p\}$ 在 $[-16,16]$ 均匀分布；高 DD 扩展情形取 $\{\ell_p\}$、$\{\kappa_p\}$ 分别在 $[16,112]$ 与 $[-64,64]$ 均匀分布。可以看到：信道 DD 扩展更高时，LMMSE 均衡的 BER **更差**，尽管可达互信息的差距较小。由于互信息指示使用最优最大似然（ML）检测器时的性能极限，本文推测更精细的检测器可缓解信道更扩展时的 BER 退化，详细研究留待未来工作。



## VI. 结论

本文提出面向数字（近似）实现 ODDM 系统的 **ESDD 信道模型**，它计入收发机处理与（可能高扩展的）离格物理信道的**联合效应**。本文建立了 ESDD 信道系数以物理信道参数、逐样本脉冲成形/匹配滤波与接收窗表示的**解析表达式**，表明 ESDD 信道模型是刻画具有更一般信道扩展、脉冲与窗的 ODDM 系统 IO 关系的有用工具。分析表明：**ESDD 信道的支撑**对 DD 域接收符号所见有效 DD 信道的**折叠/混叠、衰落与可预测性**有显著影响，而该支撑又取决于脉冲与接收窗的选择以及底层物理信道的延迟-多普勒扩展。这些结果可用于：为信道估计与感知设计信号处理方案、建立基于 DD 域内嵌导频**直接估计 ESDD 信道**可行的条件，以及确定在发生混叠时**转而采用物理 DD 信道估计**的必要性。本文预期，在共享图 1 系统模型的其他 DD 域调制方案（如基于 DZT 的 OTFS [8]、[9]）中也会观察到类似的折叠/混叠效应；所推导的 ESDD 信道模型也可能有助于刻画其他新兴调制方案（如 [15]、[16]），只要相同的有效离散时间信道模型适用。

## VII. 致谢

作者感谢副编辑与匿名审稿人富有帮助的评论。

## 参考文献（英文原书目）

以下按原文编号逐条转录（共 34 条，条目文字不翻译）。

[1] J. Tong, A. Shafie, J. Yuan, H. Lin, and J. Xi, "Orthogonal delay-Doppler division multiplexing (ODDM) modulation over highly-spread channels," in Proc. IEEE ICC, May 2025, pp. 2563–2568.

[2] R. Hadani et al., "Orthogonal time frequency space modulation," in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), San Francisco, CA, USA, Mar. 2017, pp. 1–6.

[3] Z. Wei et al., "Orthogonal time-frequency space modulation: A promising next-generation waveform," IEEE Wireless Commun., vol. 28, no. 4, pp. 136–144, Aug. 2021.

[4] H. Lin and J. Yuan, "Orthogonal delay-Doppler division multiplexing modulation," IEEE Trans. Wireless Commun., vol. 21, no. 12, pp. 11024–11037, Dec. 2022.

[5] W. Yuan et al., "From OTFS to DD-ISAC: Integrating sensing and communications in the delay Doppler domain," IEEE Wireless Commun., vol. 31, no. 6, pp. 152–160, Dec. 2024.

[6] Q. Deng, Y. Ge, and Z. Ding, "A unifying view of OTFS and its many variants," IEEE Commun. Surveys Tuts., early access, Feb. 17, 2025, doi: 10.1109/COMST.2025.3542467.

[7] H. S. Rou et al., "From orthogonal time–frequency space to affine frequency-division multiplexing: A comparative study of next-generation waveforms for integrated sensing and communications in doubly dispersive channels," IEEE Signal Process. Mag., vol. 41, no. 5, pp. 71–86, Sep. 2024.

[8] F. Lampel, A. Avarado, and F. M. Willems, "On OTFS using the discrete ZAK transform," in Proc. IEEE Int. Conf. Commun. Workshops (ICC Workshops), Jun. 2022, pp. 729–734.

[9] S. Li, W. Yuan, Z. Wei, J. Yuan, B. Bai, and G. Caire, "On the pulse shaping for delay-Doppler communications," in Proc. IEEE Global Commun. Conf., Jun. 2023, pp. 4909–4914.

[10] S. Gopalam, I. B. Collings, S. V. Hanly, H. Inaltekin, S. R. B. Pillai, and P. Whiting, "Zak-OTFS implementation via time and frequency windowing," IEEE Trans. Commun., vol. 72, no. 7, pp. 3873–3889, Jul. 2024.

[11] M. Bayat and A. Farhang, "A unified framework for pulse-shaping on delay-Doppler plane," 2023, arXiv:2311.12543.

[12] H. Lin and J. Yuan, "On delay-Doppler plane orthogonal pulse," in Proc. IEEE Global Commun. Conf., Dec. 2022, pp. 5589–5594.

[13] H. Lin, J. Yuan, W. Yu, J. Wu, and L. Hanzo, "Multi-carrier modulation: An evolution from time-frequency domain to delay-Doppler domain," 2023, arXiv:2308.01802.

[14] A. Shafie, J. Yuan, N. Yang, and H. Lin, "On the time-frequency localization characteristics of the delay-Doppler plane orthogonal pulse," IEEE Trans. Commun., vol. 73, no. 6, pp. 4105–4120, Jun. 2025.

[15] X. Ouyang and J. Zhao, "Orthogonal chirp division multiplexing," IEEE Trans. Commun., vol. 64, no. 9, pp. 3946–3957, Sep. 2016.

[16] A. Bemani, N. Ksairi, and M. Kountouris, "Affine frequency division multiplexing for next generation wireless communications," IEEE Trans. Wireless Commun., vol. 22, no. 11, pp. 8214–8229, Nov. 2023.

[17] P. Raviteja, K. T. Phan, Y. Hong, and E. Viterbo, "Interference cancellation and iterative detection for orthogonal time frequency space modulation," IEEE Trans. Wireless Commun., vol. 17, no. 10, pp. 6501–6515, Oct. 2018.

[18] P. Bello, "Characterization of randomly time-variant linear channels," IEEE Trans. Commun., vol. C-11, no. 4, pp. 360–393, Dec. 1963.

[19] D. Tse and P. Viswanath, Fundamentals of Wireless Communication. Cambridge, U.K.: Cambridge Univ. Press, 2005.

[20] A. Goldsmith, Wireless Communications. Cambridge, U.K.: Cambridge Univ. Press, 2005.

[21] P. Bello, "Measurement of random time-variant linear channels," IEEE Trans. Inf. Theory, vol. IT-15, no. 4, pp. 469–475, Jul. 1969.

[22] J. Tong, "On-grid equivalence of continuous-time doubly selective channels: A revisit of Bello's models," in Proc. IEEE ICC Workshops, Jun. 2025.

[23] M. Li, C. Han, and S. Jin, "An off-grid orthogonal delay-Doppler division multiplexing modulation for terahertz high-accuracy sensing and robust communication," in Proc. IEEE Global Commun. Conf., Dec. 2024, pp. 5381–5386.

[24] H. Zhang, S. Chen, W. Meng, J. Yuan, and C. Li, "Multiuser association and localization over doubly dispersive multipath channels for integrated sensing and communications," IEEE J. Sel. Areas Commun., vol. 42, no. 10, pp. 2847–2862, Oct. 2024.

[25] L. Lin, J. Tong, H. Lin, H. Zheng, and Z. Shi, "Joint target localization and channel estimation for ODDM-ISAC systems," IEEE Signal Process. Lett., vol. 32, pp. 1525–1529, 2025.

[26] K. Huang, A. Shafie, J. Yuan, M. Qiu, and E. Aboutanios, "Orthogonal delay-Doppler division multiplexing with FMCW for ISAC," in Proc. IEEE ICC, Montreal, QC, Canada, Jun. 2025, pp. 5737–5742.

[27] V. Khammammetti and S. K. Mohammed, "OTFS-based multiple-access in high Doppler and delay spread wireless channels," IEEE Wireless Commun. Lett., vol. 8, no. 2, pp. 528–531, Apr. 2019.

[28] P. Priya, Y. Hong, and E. Viterbo, "OTFS channel estimation and detection for channels with very large delay spread," IEEE Trans. Wireless Commun., vol. 23, no. 9, pp. 11920–11930, Sep. 2024.

[29] J. Tong, J. Yuan, H. Lin, and J. Xi, "Orthogonal delay-Doppler division multiplexing (ODDM) over general physical channels," IEEE Trans. Commun., vol. 72, no. 12, pp. 7938–7953, Dec. 2024.

[30] P. Schniter, "Low-complexity equalization of OFDM in doubly selective channels," IEEE Trans. Signal Process., vol. 52, no. 4, pp. 1002–1011, Apr. 2004.

[31] A. Shafie et al., "On the spectral response of ODDM signals," in Proc. IEEE ICC, Montreal, QC, Canada, Jun. 2025, pp. 6785–6790.

[32] W. Kozek and A. F. Molisch, "Nonorthogonal pulseshapes for multicarrier communications in doubly dispersive channels," IEEE J. Sel. Areas Commun., vol. 16, no. 8, pp. 1579–1589, Aug. 1998.

[33] A. A. M. Saleh and R. Valenzuela, "A statistical model for indoor multipath propagation," IEEE J. Sel. Areas Commun., vol. JSAC-5, no. 2, pp. 128–137, Feb. 1987.

[34] K. Huang, M. Qiu, J. Tong, J. Yuan, and H. Lin, "Performance of orthogonal delay-Doppler division multiplexing modulation with imperfect channel estimation," IEEE Trans. Commun., vol. 73, no. 5, pp. 3637–3654, May 2025.

## 图注与表注

**图 1：** 数字（近似）实现 ODDM 的系统模型，其中 $h[l,k]$ 表示由发送端逐样本脉冲成形器、物理信道、接收端匹配滤波、采样器与数字窗共同构成的**有效离散时间信道**。

**图 2：** （原文无图 2，编号自图 1 直接跳至图 3；见状态段说明。）

**图 3：** ODDM 序列在传输单个信息符号时的**耦合**示意：(a) 循环扩展后的发送序列；(b) 经在格 DD 信道后接收端输出处的序列（含延迟/多普勒移位与相位）。

**图 4：** 单条物理路径（$P=1$）所产生的示例 ESDD 信道支撑，归一化延迟与多普勒移为 $\ell_p=96.5$、$\kappa_p=15.5$。折叠 ESDD 信道取 $m=1$、$n=1$；ESDD 模型覆盖信道 99.9% 能量；$M=512$、$N=64$，脉冲 $a(t)$ 的 $T_a=64T_s$。仅显示 ESDD 模型的支撑，不同抽头可有不同增益；各子图的多普勒移位范围不同。

**图 5：** 大延迟与大 Doopler 移位（$\ell_p=696.5$、$\kappa_p=105.5$）单条物理路径的 ESDD 信道支撑示例；除移位外其余设置同图 4，采用 $\beta=0.1$ 的 SRRC 脉冲。

**图 6：** DD 平面上紧密相邻的多条物理路径（$P$ 条，中心 $\ell=16.5$、$\kappa=12.5$，最大偏差 0.25）所产生的 ESDD 信道支撑示例；采用 $\beta=0.1$ 的 SRRC 脉冲与 Hamming 窗。

**图 7：** 采用不同脉冲时 $M=256$、$N=16$ 的 ODDM 系统性能（矩形窗）：(a) BER；(b) 平均互信息。

**图 8：** $M=64$、$N=64$、SRRC 脉冲 $\beta=0.1$ 时 ODDM 系统在不同信道 DD 扩展下的性能。

**表注：** 原文**无数值表格**；主要定量结果为图 4—图 8 中的支撑示意与 BER/MI 曲线。

## 本页范围与校对状态

**覆盖范围：** 本页为 IEEE TWC 期刊论文（16 页）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（DD 域调制、ODDM 与 DDOP、在格模型与离格物理信道差距、有效信道建模现状、高扩展信道与加窗动机、四项贡献、与 [1] 的区别与结构安排）；第 II 节系统模型（ODDM 帧、IDZT/IDFT 与序列、CP/CS、脉冲成形、物理信道与扩展函数、匹配滤波与 DD 域接收符号，式 (1)—(10)）；第 III 节等效离散时间信道模型（III-A TDL 模型与式 (11)—(19)；III-B 在格 DD 信道模型与式 (20)—(30)）；第 IV 节分析（IV-A 耦合与式 (32)—(37c) 的 IO 关系；IV-B/IV-A 折叠系数与式 (38)—(48)；IV-C 分段常值窗与式 (49)—(50)；IV-D 低多普勒情形与式 (51)—(58)；IV-E 折叠；IV-F 引理 3 与式 (59)；IV-G 矩阵模型与式 (60)—(71)）；第 V 节数值例子（V-A DD 扩展与折叠、脉冲/窗定义、图 4—图 6；V-B 误码率与互信息、图 7—图 8）；第 VI 节结论；第 VII 节致谢；34 条英文参考文献；图 1—图 8 图注。

**源文页码范围：** 第 1 页（IEEE 版权声明、题名、作者、摘要、关键词、引言开始）→ 第 2—3 页（引言、贡献、第 II 节、图 1）→ 第 4—6 页（第 III 节、式 (11)—(30)）→ 第 7—11 页（第 IV 节、式 (32)—(59)、图 2—图 3）→ 第 12 页（IV-G、式 (60)—(71)）→ 第 12—15 页（第 V 节、图 4—图 8）→ 第 15 页（第 VI—VII 节）→ 第 15—16 页（参考文献 [1]—[34]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；原文**无数值表格**（图 4—图 8 中的定量信息以图形呈现，未做图像级数字重构）。
2. **公式覆盖**：正文与附录共 (1)—(71) 编号式；本页显示公式按原文编号编排。PDF 文本层中 (1)、(19)、(26)、(29)、(30)、(34)、(44)—(46)、(58) 等跨页/跨行公式被分段，本页按上下文与推导结构整理为等价形式，并已在相应脚注（[^1]、[^2]）与状态段说明；**精确排布以原文 PDF 为准**。
3. 图 1、图 3—图 8 均未上传图片，本页以"图注与表注"小节统一给出图注；**原文图号从图 1 直接跳到图 3（无图 2）**，本页保留该编号空缺并在此注明（图注小节中"图 2"条目为占位说明）。
4. **原文疑点／说明：** ①原文图号缺失图 2（正文与图注均未出现图 2），本页保留编号空缺；②表 I 在原文中不存在（原文无表格），故本页无表格转录项；③式 (44) 与 (44′) 的中间步骤在文本层被拆分，本页保留 (44) 与 (44′) 两种等价写法并在正文注明；④式 (58) 中 $(\cdots)$ 为原文跨行被截断的相位因子，本页以"$\text{-型项}$"标注、未擅自补全；⑤引理 3 的编号与陈述按原文（正文中出现 "Lemma 3"）；⑥原文图 4 图注说明"Only the supports of the ESDD models are displayed and the different taps may have different gains"，本页照录。
5. **许可与登记：** 原文为 **IEEE 期刊正式版**（©2025 IEEE），再传播许可**待核验**；本页仅作学习用途、**不计入可公开全文统计**，页面顶部与状态段均已注明；原文 IEEE 版权声明（personal use permitted；republication requires permission）已在页面顶部译述。
6. 版权：本页为中文翻译页面，未上传原文 PDF；如后续确认许可，再按站点流程更新发布状态。

{% endraw %}