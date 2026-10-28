---
layout: page
title: "高度扩展信道中 ODDM 的等效采样时延–多普勒信道模型｜中文译稿（未完成）"
permalink: /papers/translations/2026-10-28-esdd-oddm-highly-spread/
math: true
toc: true
---

[← 返回论文库](/papers/)

# 高度扩展信道中 ODDM 的等效采样时延–多普勒信道模型

**原题：** Equivalent Sampled Delay-Doppler (ESDD) Channel Models for ODDM Over Highly-Spread Channels  
**作者：** Jun Tong、Akram Shafie、Jinhong Yuan、Hai Lin、Jiangtao Xi。  
**来源：** IEEE Transactions on Wireless Communications, vol. 25, 2026, pp. 3944–3959；DOI：10.1109/TWC.2025.3607314；上传 PDF 共 16 页。  
**翻译范围：** 摘要、引言、系统模型和部分等效离散时间模型。**后续定理、折叠与混叠分析、数值实验、附录及参考文献尚未完整翻译；非全文稿，qa_complete=false。**

## 摘要

近来，人们开始探索时延–多普勒（delay-Doppler，DD）域调制，例如正交时延–多普勒划分复用（orthogonal delay-Doppler division multiplexing，ODDM），以实现双选择性信道上的通信。本文针对高度扩展的离栅物理信道，推导 ODDM 系统中有效离散时间信道的等效采样（栅格化）时延–多普勒（equivalent sampled delay-Doppler，ESDD）信道模型。在这类信道中，时延和多普勒频移可能分别超过 DD 正交脉冲（DDOP）的子脉冲间隔和子音调间隔。所推导的 ESDD 模型同时考虑：（i）实际物理信道中的离栅时延与多普勒频移；（ii）发射端逐采样脉冲成形；（iii）接收端匹配滤波和加窗。随后，研究 ESDD 模型的支撑集，以及它们对在高度扩展物理信道中采用更一般脉冲和窗函数的 ODDM 输入–输出（IO）关系的影响。特别地，表明 ODDM 数字序列能够与栅格化离散时间 DD 信道精细耦合，从而获得紧凑的 IO 关系。还分析 ESDD 信道的折叠与混叠，以及它们对 ODDM 的 DD 域符号所经历的有效信道的衰落效应和可预测性的影响。根据这些结果，确定在单个 ODDM 帧内直接通过嵌入式 DD 域导频估计 ESDD 信道所需的条件。最后，通过数值结果进一步验证本文的发现。

**关键词：** 时延–多普勒域多载波调制（DDMC）；双选择性信道；ODDM；等效采样时延–多普勒信道。

## I. 引言

时延–多普勒（DD）域调制 [2]–[11] 因适用于同时经历时间色散与频率色散的双选择性（时变宽带）信道而受到广泛关注，尤其有望应用于车联网（V2X）和低地球轨道（LEO）卫星通信等高移动性场景。最近提出的 ODDM 是一种 DD 域多载波调制（DDMC）方式，通过时延–多普勒域正交脉冲（DDOP）[4]、[12]–[14] 产生承载信息符号的波形。DDOP 在 DD 分辨率所对应的移位下呈现正交性，使 ODDM 波形能够与 DD 信道耦合，利用 DD 信道的稀疏性与稳定性，在减小干扰的同时获得分集增益 [13]。实际上，若在发射端采用具有适当循环扩展的 DDOP 进行脉冲成形，即使经过单径、栅格化 DD 信道，ODDM 波形仍能保持正交性。这一特性使性能与复杂度之间能够取得有吸引力的折中。

以传播路径的栅格化时延和多普勒频移为参数的栅格化信道模型，是设计和分析 DD 域调制及啁啾调制的有用工具 [15]、[16]。文献 [12]、[13]、[17] 在分析 OTFS 和 ODDM 时假设这种模型，以揭示波形正交性、DD 域 IO 关系和接收干扰等基本性质。然而，由于收发机使用有限时频资源，从既定收发机的角度来看，实际物理信道几乎必然在 DD 域离栅 [18]–[20]。因此，用于推导 DD 域调制基本原理的栅格化模型，与实际离栅物理系统的描述之间经常存在差距。

把物理信道参数直接四舍五入到预定义 DD 栅格似乎能够解决这一问题，但这样可能导致数学模型与物理系统不匹配，尤其在高信噪比（SNR）应用中，模型失配对性能的影响可能超过背景噪声。此外，实际实现 DD 域调制时，为限制占用的时频资源、控制带外发射（OOBE）并满足频谱模板要求，收发机通常必须执行滤波和加窗等操作。这些操作不可避免地影响系统的 DD 域 IO 关系，而仅凭物理信道参数已不能完整描述。

从 DD 域数字信号处理的角度看，有效 DD 信道模型必须同时考虑物理信道与收发机预处理、后处理的综合作用。已有研究涉及对时不变频率选择性信道采用抽头时延线（TDL）模型 [19]，以及连续时间双选择性信道在模拟滤波和加窗之后的建模 [18]、[21]、[22]，为关联物理信道与通信中的有效信道提供了帮助。但这些工作并未考虑采用特殊收发操作（例如实用脉冲成形、匹配滤波和数字加窗）的 ODDM。此外，建立物理信道与有效信道之间的联系还有助于通感一体化（ISAC）应用 [23]–[26]。

本文考虑 ODDM，研究高度扩展的离栅物理信道与收发机滤波、采样、加窗串接之后的建模问题。这里的高度扩展信道，指时延扩展和/或多普勒扩展可以超过 DDOP 的子脉冲间隔和子音调间隔的信道。具有较强时频色散的此类信道可能出现在低时延、高移动性应用中 [27]、[28]。如下文所示，与先前研究的欠扩展信道 [4]、[29] 不同，这种信道可能在 ODDM 接收端产生混叠效应。

为表征离栅物理信道产生的有效离散时间信道，建立仅含由采样间隔和帧持续时间确定的栅格化时延及多普勒频移的 ESDD 模型。重点考虑数字化（近似）实现的 ODDM：首先把 DD 域承载信息的符号映射为时域数字序列，再通过时域脉冲成形产生模拟波形 [4]。这种实现方式在降低复杂度的同时能够获得与模拟实现 ODDM 相近的性能。与原始 ODDM [4] 隐含假设矩形接收窗不同，本文允许接收机使用一般的离散时间窗函数，借鉴 OFDM 等传统多载波系统通过时域加窗抑制载波间干扰（ICI）的思想 [30]。在 ODDM 中，谨慎选择时域窗同样可能抑制 ICI（亦称多普勒间干扰，IDI）。

现有研究很少对离栅物理信道中的 ODDM 建模。文献 [29] 考虑欠扩展信道、平方根奈奎斯特（SRN）脉冲和矩形窗，指出栅格化与离栅信道下 ODDM IO 关系的差异。本文进一步考虑更加一般的逐采样脉冲、接收窗，以及更广泛的物理信道条件，通过建立 ESDD 信道模型，刻画高度扩展信道下 ODDM 的 IO 关系、折叠/混叠、衰落和可预测性。

本文贡献包括：建立具有统一抽头时延与多普勒混频器结构的离散时间 ESDD 模型；揭示一般脉冲、窗函数及离栅路径对等效信道支撑集与分布形状的影响；分析数字化 ODDM 与栅格化信道之间的耦合；研究折叠、混叠、衰落与可预测性，并推导单帧嵌入式导频直接估计 ESDD 信道的条件；最后用数值实验阐明脉冲和窗选择在误码率、互信息、处理复杂度及带宽之间的折中。

## II. 系统模型：已译主要公式

考虑每帧包含 $M$ 个多载波符号、每个符号具有 $N$ 个子载波的 ODDM 系统。DDOP 为

$$
u(t)\triangleq \frac{1}{\sqrt N}\sum_{\dot n=0}^{N-1}a(t-\dot nT),
$$

其中 $a(t)$ 是脉冲，$T$ 为子脉冲间距，对应子音调间隔 $1/T$。定义索引集合 $\mathcal M=\{0,\ldots,M-1\}$、$\mathcal N=\{0,\ldots,N-1\}$，以及每帧承载符号数 $K=MN$。连续时间发送信号为

$$
\widetilde x(t)=\sum_{m=0}^{M-1}\sum_{n=0}^{N-1}
X[m,n]u\left(t-\frac{mT}{M}\right)
e^{j2\pi\frac{s[n]}{NT}\left(t-\frac{mT}{M}\right)}.
\tag{1}
$$

其中 $s[n]=n$（$0\le n\le N/2-1$），$s[n]=n-N$（$N/2\le n\le N-1$）。数字近似实现首先对每个 $m$ 对应的 $N$ 个 DD 域符号进行 IDFT：

$$
\dot x[m,\dot n]=\frac1{\sqrt N}\sum_{n=0}^{N-1}X[m,n]e^{j2\pi\dot n n/N},
\quad 0\le\dot n\le N-1.
\tag{2}
$$

对固定的 $m$，样本间距为 $T$；对固定的 $\dot n$，样本间距为 $T_s=T/M$。经交织形成长度 $K$ 的发射序列

$$
\bar x[k]\triangleq\dot x\left([k]_M,\left\lfloor k/M\right\rfloor\right),\quad 0\le k<K.
\tag{3}
$

为减轻相邻 ODDM 帧之间的帧间干扰，在该序列前面加长度 $L_{\mathrm{CP}}$ 的 CP、后面加长度 $L_{\mathrm{CS}}$ 的 CS，得到

$
x[k]=
\begin{cases}
\bar x[k+K],&k=-L_{\mathrm{CP}},-L_{\mathrm{CP}}+1,\ldots,-1,\\
\bar x[k-K],&k=K,K+1,\ldots,K+L_{\mathrm{CS}}-1.
\end{cases}
\tag{4}
$

随后加入长度分别为 $L_{\rm CP}$ 和 $L_{\rm CS}$ 的循环前缀与循环后缀，并通过逐采样脉冲成形生成模拟信号：

$$
x(t)=\sum_{k=-L_{\rm CP}}^{K+L_{\rm CS}-1}x[k]a(t-kT_s).
\tag{5}
$$

本文不把 $a(t)$ 限制为 SRN 脉冲；允许非正交脉冲能够为管理接收干扰提供额外的设计自由度。该数字实现也可理解为先对 DD 域符号应用逆离散 Zak 变换（IDZT），再执行循环扩展和脉冲成形。

具有 $P$ 条物理路径的双选择性信道可描述为

$$
y(t)=\sum_{p=1}^{P}\rho_p x(t-\tau_p)e^{j2\pi\nu_p(t-\tau_p)}+z(t),
\tag{6}
$$

其中 $\rho_p$、$\tau_p$、$\nu_p$ 分别是第 $p$ 条路径的复增益、时延和多普勒频移。相应时变冲激响应与扩展函数分别为

$$
h(t,\tau)=\sum_{p=1}^P\rho_p\delta(\tau-\tau_p)e^{j2\pi\nu_p(t-\tau_p)},
\tag{7}
$

这一冲激响应也可写成物理扩展函数的多普勒积分：

$
h(t,\tau)=\int_\nu V(\nu,\tau)e^{j2\pi\nu(t-\tau)}\,d\nu.
\tag{8}
$

$
V(\nu,\tau)=\sum_{p=1}^P\rho_p\delta(\tau-\tau_p)\delta(\nu-\nu_p).
\tag{9}
$$

接收机利用匹配滤波器 $a^*(-t)$ 形成 DD 域观测：

$
\begin{aligned}
Y[m,n]
&=\sum_{\dot n=0}^{N-1}\frac{1}{\sqrt N}
e^{-j2\pi\frac{n\dot n}{N}}
\left.(y(t)*a^*(-t))\right|_{t=\dot n T+mT_s}\\
&=\sum_{\dot n=0}^{N-1}\frac{1}{\sqrt N}
e^{-j2\pi\frac{n\dot n}{N}}
\widetilde y[\dot nM+m].
\end{aligned}
\tag{10}
$

接收机先利用 $a^*(-t)$ 匹配滤波，在 $t=(\dot nM+m)T_s$ 采样，再经 DFT 获得 DD 域观测。进一步引入一般的数字接收窗 $w[k]$，得到 $y[k]=w[k]\widetilde y[k]$，以允许调节时域资源使用和抑制多载波干扰。

## III. 栅格化时延–多普勒等效模型

先考虑单条物理路径，式（6）简化为

$
y(t)=\rho_p x(t-\tau_p)e^{j2\pi\nu_p(t-\tau_p)}.
\tag{11}
$

由于每个数字采样通过脉冲 $a(t-kT_s)$ 发射，代入式（5）得到

$
y(t)=\rho_p\sum_{k'=-L_{\mathrm{CP}}}^{K+L_{\mathrm{CS}}-1}
x[k']a(t-k'T_s-\tau_p)e^{j2\pi\nu_p(t-\tau_p)}.
\tag{12}
$

令匹配滤波器 $b(t)=a^*(-t)$，匹配滤波的连续时间输出可表示为

$
\begin{aligned}
y_{\mathrm{MF}}(t)
&=y(t)*b(t)
=\int_\zeta y(\zeta)b(t-\zeta)\,d\zeta\\
&=\rho_p\sum_{k'=-L_{\mathrm{CP}}}^{K+L_{\mathrm{CS}}-1}
x[k']\int a(\zeta-k'T_s-\tau_p)
e^{j2\pi\nu_p(\zeta-\tau_p)}a^*(\zeta-t)\,d\zeta\\
&=\rho_p\sum_{k'=-L_{\mathrm{CP}}}^{K+L_{\mathrm{CS}}-1}
x[k']e^{j2\pi\nu_p(t-\tau_p)}
g(t-k'T_s-\tau_p,\nu_p).
\end{aligned}
\tag{13}
$

其中 $g$ 表示脉冲模糊函数。定义脉冲的模糊函数

$$
g(\tau,\nu)\triangleq\int a^*(\xi)a(\xi+\tau)e^{j2\pi\nu\xi}\,d\xi.
\tag{14}
$

在 $t=kT_s$ 采样匹配滤波输出，可得

$
\begin{aligned}
\widetilde y[k]
&=\left.y_{\mathrm{MF}}(t)\right|_{t=kT_s}\\
&=\rho_p\sum_{k'=-L_{\mathrm{CP}}}^{K+L_{\mathrm{CS}}-1}
x[k']e^{j2\pi\nu_p(kT_s-\tau_p)}
g(kT_s-k'T_s-\tau_p,\nu_p)\\
&=\sum_{l=l_{\min}}^{l_{\max}}\widetilde h[l,k]x[k-l].
\end{aligned}
\tag{15}
$

匹配滤波与采样后的时变抽头响应为

$$
\widetilde h[l,k]=\rho_p e^{j2\pi\nu_p(kT_s-\tau_p)}
g(lT_s-\tau_p,\nu_p).
\tag{16}
$$

接收加窗之后，$k\in\{0,\ldots,K-1\}$ 的有效 IO 关系为

$$
y[k]=\sum_{l=l_{\min}}^{l_{\max}}h[l,k]x[k-l],
\tag{17}
$$

$$
h[l,k]=\rho_p\,g\left((l-\ell_p)T_s,\frac{\kappa_p}{KT_s}\right)
w[k]e^{j2\pi\kappa_p(k-\ell_p)/K},
\tag{18}
$$

其中归一化时延 $\ell_p=\tau_p/T_s$ 与归一化多普勒 $\kappa_p=\nu_pKT_s$ 可以不是整数，即原始物理路径可以离栅。有效抽头数与脉冲的模糊函数支撑集、采样间隔和实际时延均有关。物理单径经过滤波采样后可能扩展到多个整数时延抽头，多条物理路径又可共同影响同一抽头。



## III-B. 离散时间栅格化时延–多普勒信道模型（续）

前述有效时变冲激响应 $h[l,k]$ 描述的物理路径可能同时具有分数时延和分数多普勒频移。本节将其表示为仅包含整数时延与整数多普勒频移的等效虚拟散射体集合。这一操作可以理解为：先把物理信道投影至整数时延基，再将每个整数时延抽头中的时变序列投影至整数多普勒基，最终得到 ESDD 模型。

**1）投影到整数时延。** 考虑具有整数时延 $l_p$ 和整数归一化多普勒频移 $b_p$ 的离散时间栅格化路径模型

$$
y[k]=\sum_{p=1}^{P'}\rho'_p
e^{j2\pi(k-l_p)b_p/K}x[k-l_p].
\tag{19}
$$

由此，第 $p$ 条栅格化路径由数字特征序列 $e^{j2\pi(k-l_p)b_p/K}$ 及系数 $\rho'_p$ 唯一刻画。对于原本离栅的单条物理路径，式（18）可改写成

$$
h[l,k]=\gamma_{l,p}w[k]e^{j2\pi(k-l)\kappa_p/K},
\tag{20}
$$

其中

$$
\gamma_{l,p}\triangleq
\rho_p g\left((l-\ell_p)T_s,\frac{\kappa_p}{KT_s}\right)
e^{j2\pi(l-\ell_p)\kappa_p/K}.
\tag{21}
$$

这一系数刻画分数时延 $\ell_p$ 的物理路径扩散到整数时延抽头 $l$ 的情况。扩散范围不仅由脉冲模糊函数决定，还受到物理路径归一化多普勒频移 $\kappa_p$ 的影响。因此，具有任意离栅时延的物理单径，经脉冲成形与匹配滤波后，可以等价为多条只含整数时延的子信道。在离散时间 $k=0$ 处，第 $l$ 个抽头对应的初始系数为 $\gamma_{l,p}w[0]e^{-j2\pi\kappa_p l/K}$。

**2）投影到整数多普勒。** 对固定时延 $l$，序列 $w[k]e^{j2\pi k\kappa_p/K}$ 具有整数时延索引，但多普勒 $\kappa_p$ 仍可离栅。长度为 $K$ 的序列可在以下整数多普勒移位所形成的正交归一基上唯一展开：

$$
\mathbf v_b\triangleq\frac1{\sqrt K}
[1,e^{j2\pi b/K},\ldots,e^{j2\pi(K-1)b/K}]^\top,
\qquad b\in\mathcal B.
\tag{22}
$$

令

$$
\widetilde{\mathbf v}_{\kappa_p}
=[w[0],w[1]e^{j2\pi\kappa_p/K},
\ldots,w[K-1]e^{j2\pi(K-1)\kappa_p/K}]^\top.
$$

该序列在上述正交基上的展开为

$$
\widetilde{\mathbf v}_{\kappa_p}
=\sum_{b\in\mathcal B}
(\mathbf v_b^H\widetilde{\mathbf v}_{\kappa_p})\mathbf v_b.
\tag{23}
$$

等价地，在 $k\in\mathcal B$ 上，

$$
w[k]e^{j2\pi k\kappa_p/K}
=\sum_{b\in\mathcal B}
\left[\frac1K\sum_{k'=0}^{K-1}
w[k']e^{j2\pi(\kappa_p-b)k'/K}\right]
e^{j2\pi kb/K}.
\tag{24}
$$

将其代回式（20），得到有效时变冲激响应的等效模型：

$$
h[l,k]=\sum_{b\in\mathcal B}V_{b,l}
e^{j2\pi(k-l)b/K},\qquad k\in\mathcal B.
\tag{25}
$$

这里 $V_{b,l}$ 表示整数时延 $l$、整数多普勒 $b$ 的虚拟栅格化散射体的路径增益：

$$
V_{b,l}=\gamma_{l,p}e^{j2\pi(b-\kappa_p)l/K}
\left[
\frac1K\sum_{k'=0}^{K-1}
w[k']e^{j2\pi(\kappa_p-b)k'/K}
\right].
\tag{26}
$$

因此，一条离栅多普勒路径经投影后可由 $K$ 条整数多普勒虚拟子信道等效表示。式（26）关于 $b$ 以 $K$ 为周期，基序列 $e^{j2\pi(k-l)b/K}$ 也同样具有周期 $K$，所以任意连续 $K$ 个整数多普勒索引足以描述该采样信道。

**3）一般物理信道的栅格化等效形式。** 上述分析说明，图 1 中包括发射脉冲成形、物理信道、接收匹配滤波和窗函数在内的有效离散时间信道，可以采用图 2 的规范模型描述。由于图 2 中的频移和时延操作与具体脉冲、窗函数及物理信道实现无关，这一有效信道由 $LK$ 个系数 $V_{b,l}$ 唯一表征；每个系数对应一个整数时延及整数多普勒的虚拟散射体。由此定义 ESDD 信道：

$$
V[b,l]=\sum_{\dot b\in\mathcal B}\sum_{\dot l\in\mathcal L}
V_{\dot b,\dot l}\delta[b-\dot b]\delta[l-\dot l].
\tag{27}
$$

其与时变冲激响应之间的关系为

$$
h[l,k]=\sum_{b\in\mathcal B}V[b,l]e^{j2\pi(k-l)b/K}.
\tag{28}
$$

对于包含 $P$ 个离散物理散射体的多径信道，根据线性叠加原理，ESDD 系数为

$$
V_{b,l}=
\sum_{p=1}^{P}\gamma_{l,p}
e^{j2\pi l(b-\kappa_p)/K}
\left[
\frac1K\sum_{k'=0}^{K-1}
w[k']e^{j2\pi(\kappa_p-b)k'/K}
\right].
\tag{29}
$$

将式（21）代入即得**引理 1**：

$$
V_{b,l}=\sum_{p=1}^P
\rho_p\,g((l-\ell_p)T_s,\nu_p)
\left[\frac1K\sum_{k'=0}^{K-1}
w[k']e^{j2\pi(\kappa_p-b)k'/K}\right]
e^{j2\pi(bl-\kappa_p\ell_p)/K},
\quad b\in\mathcal B,\ l\in\mathcal L.
\tag{30}
$$

其中 $\mathcal B=\{0,\ldots,K-1\}$，$\mathcal L=\{l_{\min},\ldots,l_{\max}\}$，$l_{\min}=\lceil(\tau_{\min}-T_a)/T_s\rceil$，$l_{\max}=\lfloor(\tau_{\max}+T_a)/T_s\rfloor$；$\tau_{\min}$、$\tau_{\max}$ 分别是全部物理路径中的最小时延与最大时延。

一方面，单个物理散射体会因为时延与多普勒扩散而产生多个栅格化虚拟散射体，其支撑集取决于物理路径参数、脉冲 $a(t)$ 的支撑集以及接收窗 $w[k]$ 的频谱性质。另一方面，多条不同物理路径也可能共享同一虚拟散射体。对于路径数 $P$ 很大的密集物理信道，如果很多路径在 DD 平面中相互接近，那么虚拟散射体数量甚至可能小于 $P$，例如具有大量相似时延和多普勒的成簇射线模型 [33]。因此，物理路径表示与栅格化等效表示孰更紧凑，取决于具体传播场景。

矩形接收窗的频谱旁瓣通常比 Hamming 窗等平滑窗更强，因此单条物理路径沿整数多普勒索引产生的扩散一般也更显著。即使物理路径自身多普勒频移很小，其 ESDD 表示的多普勒支撑集也可能很大。但需要注意：虽然模型可以观察到最多 $LK$ 条栅格化虚拟子信道，它们之间存在相关性；信道的总自由度仍受物理散射体数量限制。

**图 2：** ESDD 信道模型示意。$z^{-1}$ 表示单位时延，$V_{b,l}$ 表示整数多普勒 $b$、整数时延 $l$ 的虚拟子信道系数，$\operatorname{rect}[(k-K/2)/K]$ 表示截取 $k\in\mathcal B$ 的长度 $K$ 矩形窗。第 $(b,l)$ 条子信道先对 $x[k]$ 频移 $2\pi b/K$，再延迟 $l$ 个采样；等效地，也可先延迟、再以系数 $V_{b,l}e^{-j2\pi bl/K}$ 进行频移。



## IV. 基于 ESDD 模型分析高度扩展离栅物理信道中的 ODDM

本节利用第 III 节建立的离栅信道与整数 DD 栅格之间的等效关系，以及 ODDM 数字序列与栅格化离散时间信道之间的耦合，研究高度扩展、离栅物理信道中的 ODDM。为处理一般传播时延和具有一般支撑区间的脉冲 $a(t)$，允许有效信道出现负抽头时延 $l<0$。假定循环前缀（CP）和循环后缀（CS）足够长以避免帧间干扰，即

$$
L_{\mathrm{CP}}\ge\max\{0,l_{\max}\},\qquad
L_{\mathrm{CS}}\ge\max\{0,-l_{\min}\}.
$$

同时要求 $l_{\max}-l_{\min}+1\le MN$，避免信道作用后 CS 和 CP 相互重叠。下面先分析数字 ODDM 波形如何与栅格化 DD 信道耦合，再利用 ESDD 模型建立更一般离栅物理信道的输入–输出关系。相较于 [29] 的 SRN 脉冲、矩形窗与欠扩展信道假设，这里的分析适用范围更广，还将解释 DD 域接收符号中可能出现的混叠效应。

### A. ODDM 序列与离散时间栅格化 DD 信道的耦合

根据式（2）–（5），数字化（近似）实现的 ODDM 使用每个信息符号 $X[m,n]$ 对应的一条唯一时域序列 $\{s_{m,n}[k]\}_{k=0}^{K-1}$。它在 $k=n'M+m$ 处取值 $(1/\sqrt N)e^{j2\pi n'n/N}$，其他时刻为零，$n'=0,\ldots,N-1$。等价地，其向量由每隔 $M$ 个元素出现的 $1,e^{j2\pi n/N},e^{j4\pi n/N},\ldots$ 组成，中间按 $m$ 插入零元素：

$$
\mathbf s_{m,n}
=\frac{1}{\sqrt N}
\left[
\underbrace{0,\ldots,0}_{m},\ 1,\
\underbrace{0,\ldots,0}_{M-1},\
e^{j\frac{2\pi}{N}n},\
\underbrace{0,\ldots,0}_{M-1},\
e^{j\frac{2\pi}{N}2n},\ldots
\right]^{\mathsf T}.
\tag{31}
$$

上式保留原文式（31）的向量写法，零元素分别按前置 $m$ 项及相邻采样脉冲间的 $M-1$ 项分组。不同 $m$ 之间由时分正交性保证互不重叠；固定 $m$ 而不同 $n$ 时，由傅里叶正交性保证正交：

$$
\mathbf s_{m,n}\mathbf s_{m',n'}^H
=\delta[m-m']\delta[n-n'].
$$

此外，序列对 $n$ 具有周期 $N$，即 $s_{m,n}=s_{m,n+N}$。一帧的传输序列可写为

$$
x[k]=\sum_{m=0}^{M-1}\sum_{n=0}^{N-1}
X[m,n]s_{m,n}[k],\qquad k\in\mathcal B.
\tag{32}
$$

随后在序列前后附加足够长的 CP/CS。

为说明与栅格化信道之间的耦合，考虑仅传输一个符号 $X[\widetilde m,\widetilde n]$，并通过单条单位增益、整数延时 $l$ 与整数多普勒移位 $b$ 的虚拟子信道。对应发送序列为

$$
x[k]=X[\widetilde m,\widetilde n]\,
s_{\widetilde m,\widetilde n}[k],\qquad k\in\mathcal B.
\tag{33}
$$

图 3(a) 展示带循环扩展的发送序列。若 $\widetilde m+l$ 位于 $\mathcal M$ 内，接收序列直接变成另一条 ODDM 基序列，其索引为 $m=\widetilde m+l$、$n=[\widetilde n+b]_N$，并乘以与时间无关的相位因子。图 3(b) 示意此情况。若延时增大，使 $\widetilde m+l$ 超出 $\mathcal M$，接收窗会纳入 CP 或 CS 中的循环延拓分量，接收延时索引变为 $m=[\widetilde m+l]_M$，同时出现与延时折叠次数及原始子载波索引有关的额外相位。图 3(c)、(d) 展示了相应实例。

上述三种情况的接收序列，可统一写成原文式（34）。令 $\tilde n=[\widetilde n+b]_N$；输入只传输一个符号 $X[\widetilde m,\widetilde n]$，经过整数 DD 移位 $(l,b)$、单位增益的栅格化子信道后，对于 $k\in\mathcal B$ 有

$
y[k]=
\begin{cases}
e^{j\frac{2\pi}{MN}\widetilde m b}
X[\widetilde m,\widetilde n]\,
s_{\widetilde m+l,\tilde n}[k],
&0\le\widetilde m+l\le M-1,\\[4pt]
e^{j\frac{2\pi}{MN}(\widetilde m-M)b}
e^{-j\frac{2\pi}{N}\widetilde n}
X[\widetilde m,\widetilde n]\,
s_{\widetilde m+l-M,\tilde n}[k],
&M\le\widetilde m+l\le2M-1,\\[4pt]
e^{j\frac{2\pi}{MN}(\widetilde m+M)b}
e^{j\frac{2\pi}{N}\widetilde n}
X[\widetilde m,\widetilde n]\,
s_{\widetilde m+l+M,\tilde n}[k],
&-M\le\widetilde m+l\le-1.
\end{cases}
\tag{34}
$

中间和最后两个分支的额外相位分别来自循环扩展的接收分量。以上三分支与上传 PDF 第 8 页原始排版逐式核对过，但仅适用于图 3 所考虑的 $-M\le\widetilde m+l\le2M-1$ 情况；更一般的整数延迟由下述折叠相位表达式描述。

因此，**一条栅格化 DD 子信道把一条 ODDM 基序列精确转换为另一条 ODDM 基序列，至多附加一个与采样时间无关的相位因子。** 这种性质可称为 ODDM 数字序列与 DD 信道的精细耦合（fine coupling）。不同延时 $l$ 如果折叠为同一个 $d=[l]_{\mathcal D}$，会产生延时混叠；不同多普勒移位如果折叠为相同的基本区间索引，也可能产生多普勒混叠。

在足够长 CP/CS 条件下，对路径增益为 $\rho$、延时 $l$、多普勒 $b$ 的单条栅格化子信道，DD 域 IO 关系为

$$
Y[m,n]=
\rho\,e^{j2\pi(m-l)b/(MN)}
\Psi_{m,l,[n-b]_N}
X[[m-l]_M,[n-b]_N],
\tag{35}
$$

其中

$$
\Psi_{m,l,\widetilde n}
=e^{j2\pi\lfloor(m-l)/M\rfloor\,\widetilde n/N}
\tag{36}
$$

用于描述延时折叠引入的附加相位。式（35）对任意整数延时和多普勒移位成立，只要 CP 和 CS 足够长。

### B. 高时延–多普勒扩展物理信道的 IO 关系

将式（35）应用于一般 ESDD 模型可描述高度扩展离栅信道中的 ODDM。原始 ESDD 模型最多具有 $LMN$ 条虚拟子信道。将 $MN$ 个输入符号与这些子信道叠加，得到等价的三种 DD 域 IO 形式：

$$
Y[m,n]=
\sum_{l\in\mathcal L}\sum_{b\in\mathcal B}
V_{b,l}e^{j2\pi(m-l)b/(MN)}
\Psi_{m,l,[n-b]_N}
X[[m-l]_M,[n-b]_N].
\tag{37a}
$$

$$
Y[m,n]=
\sum_{l\in\mathcal L}\sum_{\kappa\in\mathcal K}
\dot V_{\kappa,l,m}e^{j2\pi(m-l)\kappa/(MN)}
\Psi_{m,l,[n-\kappa]_N}
X[[m-l]_M,[n-\kappa]_N].
\tag{37b}
$$

$$
Y[m,n]=
\sum_{d\in\mathcal D}\sum_{\kappa\in\mathcal K}
\ddot V_{\kappa,d,m,n}e^{j2\pi(m-d)\kappa/(MN)}
\Psi_{m,d,[n-\kappa]_N}
X[[m-d]_M,[n-\kappa]_N].
\tag{37c}
$$

其中 $\mathcal K=\{-N/2,-N/2+1,\ldots,N/2-1\}$、$\mathcal D=\{-M/2,\ldots,M/2-1\}$ 为相应基本区间。式（37a）采用未折叠的 ESDD 系数 $V_{b,l}$，而 $[m-l]_M$、$[n-b]_N$ 显示延时与多普勒索引在输入–输出关系中发生的折叠。

式（37b）定义第 $m$ 个 ODDM 符号的**多普勒折叠 ESDD 系数**：

$$
\dot V_{\kappa,l,m}
=\sum_{m'=0}^{M-1}
V_{\kappa+m'N,l}
e^{j2\pi(m-l)m'/M},
\quad \kappa\in\mathcal K,\ l\in\mathcal L.
\tag{38}
$$

式（38）显示该系数可依赖于符号索引 $m$，但与子载波索引 $n$ 无关。最后式（37c）引入第 $m$ 个 ODDM 符号、第 $n$ 个子载波的**双重 DD 折叠 ESDD 系数**：

$$
\ddot V_{\kappa,d,m,n}
=\sum_{q=q_{\min}}^{q_{\max}}
\dot V_{\kappa,d+qM,m}
e^{-j2\pi nq/N},
\quad \kappa\in\mathcal K,\ d\in\mathcal D.
\tag{39}
$$

其中 $q_{\min}=\lfloor l_{\min}/M\rfloor$、$q_{\max}=\lceil l_{\max}/M\rceil$；规定当 $l$ 超出 $\mathcal L$ 时 $\dot V_{\kappa,l,m}=0$。多条具有不同 $l,b$ 的 ESDD 子信道，若折叠到相同 $(d,\kappa)$，就可能共同贡献到 $\ddot V_{\kappa,d,m,n}$，使该双重折叠信道系数同时依赖 $m$ 和 $n$。这一区别说明为何不能直接以原始物理路径的支撑集判断 ODDM 的有效信道结构。

以上结果将 [29] 的 SRN 脉冲、矩形窗、欠扩展信道推广至一般脉冲和接收窗、离栅以及高度扩展信道情形。后续引理 2 给出物理参数表示，下面进一步分析窗函数、折叠与可预测性。



### B.1. 物理路径到折叠 ESDD 系数的显式映射（式（40）–（48））

原文引理 2 在式（37）基础上，利用物理路径的复增益、时延、多普勒、发射脉冲以及接收窗，推导两级折叠的显式表示。先考虑单条物理路径，将式（26）代入式（38），得到

$
\dot V_{\kappa,l,m}
=\frac{1}{MN}\gamma_{l,p}
e^{j\frac{2\pi(\kappa-\kappa_p)l}{MN}}
\Theta_{m,\kappa,p}.
\tag{40}
$

其中

$
\Theta_{m,\kappa,p}
=\sum_{k'=0}^{MN-1}
w[k']e^{j\frac{2\pi k'(\kappa_p-\kappa)}{MN}}
\sum_{m'=0}^{M-1}
e^{j\frac{2\pi m'(m-k')}{M}}.
\tag{41}
$

对于整数 $k'$，内层和仅当 $[m-k']_M=0$ 时等于 $M$，其他情况为 0。因此

$
\Theta_{m,\kappa,p}
=M e^{j\frac{2\pi m(\kappa_p-\kappa)}{NM}}
\sum_{n'=0}^{N-1}
w[m+n'M]e^{j\frac{2\pi n'(\kappa_p-\kappa)}{N}}.
\tag{42}
$

定义窗口相关的多普勒响应

$
\zeta_m(\kappa,\kappa_p)
\triangleq\frac1N
\sum_{n'=0}^{N-1}
w[m+n'M]e^{j\frac{2\pi n'(\kappa_p-\kappa)}{N}}.
\tag{43}
$

利用式（21）的 $\gamma_{l,p}$，并对具有 $P$ 个离散物理散射体的信道叠加，**引理 2**给出多普勒折叠 ESDD 系数：

$
\dot V_{\kappa,l,m}
=\sum_{p=1}^{P}
\rho_p
e^{j2\pi\frac{(m-\ell_p)\kappa_p-(m-l)\kappa}{MN}}
\zeta_m(\kappa,\kappa_p)
g\left((l-\ell_p)T_s,\frac{\kappa_p}{NT}\right),
\quad \kappa\in\mathcal K,\ l\in\mathcal L,\ m\in\mathcal M.
\tag{44}
$

进一步沿整数时延折叠，得到

$
\begin{aligned}
\ddot V_{\kappa,d,m,n}
&=\sum_{p=1}^{P}
\rho_p
e^{j2\pi\frac{(m-\ell_p)\kappa_p-(m-d)\kappa}{MN}}
\zeta_m(\kappa,\kappa_p)
\sum_{q=q_{\min}}^{q_{\max}}
g\left((qM+d-\ell_p)T_s,\frac{\kappa_p}{NT}\right)
e^{j\frac{2\pi q(\kappa-n)}{N}},\\
&\qquad \kappa\in\mathcal K,\ d\in\mathcal D,\ m\in\mathcal M,\ n\in\mathcal N.
\end{aligned}
\tag{45}
$

这两个表达式指出：单个 ODDM 符号 $m$ 所见的多普勒折叠等效信道有最多 $LN$ 个虚拟散射体，而单个接收 DD 符号 $(m,n)$ 所见的双重折叠信道最多有 $MN$ 个虚拟散射体。延时折叠在 $l_{\min}< -M/2$ 或 $l_{\max}\ge M/2$ 时可能发生。

将式（44）代回式（37），得到另一种 IO 写法，分别揭示窗口导致的载波间干扰（ICI）、脉冲模糊函数导致的符号间干扰（ISI），以及 CP/CS 的折叠相位：

$
\begin{aligned}
Y[m,n]
&=\sum_{l=l_{\min}}^{l_{\max}}
\sum_{\kappa=-N/2}^{N/2-1}
\sum_{p=1}^{P}
\rho_p e^{j\frac{2\pi(m-\ell_p)\kappa_p}{NM}}
\underbrace{\zeta_m(\kappa,\kappa_p)}_{\mathrm{ICI}}
\underbrace{\Psi_{m,l,[n-\kappa]_N}}_{\mathrm{CP/CS\ phase\ shift}}
\underbrace{g\left((l-\ell_p)T_s,\frac{\kappa_p}{NT}\right)}_{\mathrm{ISI}}
X[[m-l]_M,[n-\kappa]_N]\\
&=\sum_{d=-M/2}^{M/2-1}
\sum_{\kappa=-N/2}^{N/2-1}
\sum_{p=1}^{P}
\rho_p e^{j\frac{2\pi(m-\ell_p)\kappa_p}{NM}}
\zeta_m(\kappa,\kappa_p)\Psi_{m,d,[n-\kappa]_N}\\
&\qquad\times
\left(
\sum_{q=q_{\min}}^{q_{\max}}
g\left((qM+d-\ell_p)T_s,\frac{\kappa_p}{NT}\right)
e^{j\frac{2\pi q(\kappa-n)}{N}}
\right)
X[[m-d]_M,[n-\kappa]_N].
\end{aligned}
\tag{46}
$

对于连续分布的物理散射体，以扩展函数 $V(\nu,\tau)$ 表示物理信道，则

$
y(t)=\int_{\nu}\int_{\tau}
V(\nu,\tau)x(t-\tau)e^{j2\pi\nu(t-\tau)}
\,d\tau\,d\nu+z(t).
\tag{47}
$

此时三个层级的 ESDD 系数通过积分给出：

$
\begin{aligned}
V_{b,l}
&=\int_\nu\int_\tau V(\nu,\tau)
\left(
\frac1K\sum_{k'=0}^{K-1}
w[k']e^{j\frac{2\pi}{K}k'(KT_s\nu-b)}
\right)
e^{j2\pi\frac{bl-K\nu\tau}{K}}
g(lT_s-\tau,\nu)\,d\tau d\nu,
&&b\in\mathcal B,\ l\in\mathcal L,\\[2pt]
\dot V_{\kappa,l,m}
&=\int_\nu\int_\tau V(\nu,\tau)
\zeta_m(\kappa,NT\nu)
e^{j2\pi\frac{m(NT\nu-\kappa)-MN\tau\nu+\kappa l}{MN}}
g(lT_s-\tau,\nu)\,d\tau d\nu,
&&\kappa\in\mathcal K,\ l\in\mathcal L,\ m\in\mathcal M,\\[2pt]
\ddot V_{\kappa,d,m,n}
&=\int_\nu\int_\tau V(\nu,\tau)
\zeta_m(\kappa,NT\nu)
e^{j2\pi\frac{m(NT\nu-\kappa)-MN\tau\nu+\kappa d}{MN}}
\sum_{q=q_{\min}}^{q_{\max}}
g((qM+d)T_s-\tau,\nu)
e^{j\frac{2\pi q(\kappa-n)}{N}}
\,d\tau d\nu,\\[-2pt]
&\qquad\kappa\in\mathcal K,\ d\in\mathcal D,\ m\in\mathcal M,\ n\in\mathcal N.
\end{aligned}
\tag{48}
$

这组积分公式将连续物理时延–多普勒扩展函数映射到离散时间、单向多普勒折叠及双重 DD 折叠的有效系数。不同原始散射体可能在同一个等效抽头处产生相干叠加。

### C. 特殊情况：分段常数窗函数

若接收窗 $w[k]$ 以 $M$ 为间隔分段恒定，即对所有 $m\in\mathcal M$ 和 $n'\in\mathcal N$，有 $w[m+n'M]=w_{n'}$，则式（43）的窗相关多普勒响应与 $m$ 无关：

$$
\zeta_m(\kappa,\kappa_p)=\zeta(\kappa,\kappa_p)
\triangleq\frac1N\sum_{n'=0}^{N-1}
w_{n'}e^{j2\pi n'(\kappa_p-\kappa)/N}.
\tag{49}
$$

这一响应只取决于 $(\kappa,\kappa_p)$，由于它决定了多载波间干扰（ICI）模式，因此对于给定物理路径，ICI 模式在不同 ODDM 符号 $m$ 之间保持不变。矩形窗是分段常数窗的特殊情况，即 $w[k]=1$（$0\le k\le K-1$）。此时

$$
\zeta_m(\kappa,\kappa_p)=\zeta(\kappa,\kappa_p)
=\frac1N\frac{1-e^{-j2\pi(\kappa-\kappa_p)}}
{1-e^{-j\frac{2\pi}{N}(\kappa-\kappa_p)}}.
\tag{50}
$$

该表达式为 Dirichlet 核。原文 [29] 已研究在欠扩展信道中使用这一矩形窗的特殊情况。分母为零的点按连续极限理解。

### D. 特殊情况：低多普勒且 $\nu_pT_a$ 很小

上述结果适用于一般多普勒频移。若物理路径多普勒 $\nu_p$ 与脉冲持续时间 $T_a$ 的乘积足够小，使 $a(\xi)$ 支撑集内的信道变化可以忽略，则近似有 $e^{j2\pi\nu_p\xi}\approx1$。式（14）的模糊函数因而可近似为只与时延有关的脉冲自相关：

$$
g(\tau,\nu_p)\approx g(\tau)
\triangleq\int a^*(\xi)a(\xi+\tau)\,d\xi.
$$

相应地，窗口加权的有效时变抽头响应式（18）简化为

$$
h[l,k]=\rho_p g(lT_s-\tau_p)w[k]
e^{j2\pi\nu_p(kT_s-\tau_p)}.
\tag{51}
$$

与一般多普勒情况下时延和多普勒影响在 $g(\tau,\nu)$ 中耦合的情况不同，此时给定脉冲后，单条物理路径在时延抽头上的扩展只由其传播时延决定。于是前述 ESDD 系数与 IO 关系可通过以 $g(\tau)$ 代替 $g(\tau,\nu)$ 得到近似。由此，在收发机配置已知的条件下，ODDM 中的符号间干扰（ISI）可以仅根据物理信道的时延移位来刻画。

### E. ESDD 信道的折叠

进一步研究 ESDD 信道折叠现象。为突出主要机制，考虑矩形接收窗、采样间隔 $T_s$ 对应的 SRN 脉冲，以及一条时延 $\ell_p$、多普勒 $\kappa_p$ 都为整数的物理路径，并假设 $g((l-\ell_p)T_s,\nu_p)\approx g((l-\ell_p)T_s)$。此时 ESDD 模型中大量虚拟散射体消失，得到

$$
V_{b,l}=\rho_p\delta[l-\ell_p]\delta[b-\kappa_p].
\tag{52}
$$

若 $\kappa_p\in\mathcal K$，多普勒移位位于 ODDM 的基本多普勒区间内，则多普勒折叠系数简化为

$$
\dot V_{\kappa,l,m}
=\rho_p\delta[l-\ell_p]\delta[\kappa-\kappa_p].
\tag{53}
$$

这一表达式不依赖符号索引 $m$。如果 $\kappa_p\notin\mathcal K$，多普勒频移超出基本区间，则从式（38）可知发生混叠：

$$
\dot V_{\kappa,l,m}
=\rho_p e^{j2\pi\left\lfloor\kappa_p/N\right\rceil(m-l)/M}
\delta[l-\ell_p]\delta[\kappa-[\kappa_p]_{\mathcal K}].
\tag{54}
$$

其中原文使用最接近整数的折叠次数记号 $\lfloor\kappa_p/N\rceil$，$[\kappa_p]_{\mathcal K}$ 为折叠到基本多普勒区间的索引。例如 $\kappa_p=60$、$N=32$ 时，多普勒折叠次数为 2，折叠索引为 $-4$，所以 $\dot V_{\kappa,l,m}=\rho_p e^{j2\pi 2(m-l)/M}\delta[l-\ell_p]\delta[\kappa+4]$，它会随 $m$ 变化。

对于低多普勒情形（53），若 $\ell_p\in\mathcal D$，即延时也位于基本延时区间内，则

$$
\ddot V_{\kappa,d,m,n}
=\dot V_{\kappa,d,m}
=\dot V_{\kappa,d}
=\rho_p\delta[d-\ell_p]\delta[\kappa-\kappa_p].
\tag{55}
$$

此时延时与多普勒都不发生折叠，物理路径参数可以直接从双重折叠系数中读出。相反，若 $\ell_p\notin\mathcal D$，延时折叠产生随子载波索引 $n$ 变化的相位：

$$
\ddot V_{\kappa,d,m,n}
=\rho_p e^{-j2\pi\left\lfloor\ell_p/M\right\rceil n/N}
\delta[d-[\ell_p]_{\mathcal D}]\delta[\kappa-\kappa_p].
\tag{56}
$$

对于高多普勒但低时延情形（$\kappa_p\notin\mathcal K$、$\ell_p\in\mathcal D$），只有多普勒方向发生折叠：

$$
\ddot V_{\kappa,d,m,n}
=\dot V_{\kappa,d,m}
=\rho_p e^{j2\pi\left\lfloor\kappa_p/N\right\rceil(m-d)/M}
[d-\ell_p]\delta[\kappa-[\kappa_p]_{\mathcal K}].
\tag{57}
$$

**原文核对注：** IEEE PDF 原页的式（57）实际印为 $[d-\ell_p]$，未显示狄拉克或克罗内克 $\delta$ 符号，而同页式（53）、（55）、（58）使用 $\delta$。此处按原文照录，疑似原论文排印遗漏，不能擅自当成已修正的等式。\n\n若时延和多普勒同时超出基本区间，原文式（58）为

$
\begin{aligned}
\ddot V_{\kappa,d,m,n}
&=\rho_p\exp\Bigg\{
j2\pi\Bigg[
\left\lfloor\frac{\kappa_p}{N}\right\rceil\frac{m-d}{M}
-\left\lfloor\frac{\ell_p}{M}\right\rceil\frac nN\\
&\hspace{4.5em}
-\left\lfloor\frac{\kappa_p}{N}\right\rceil
\left\lfloor\frac{\ell_p}{M}\right\rceil
\Bigg]\Bigg\}
\delta[d-[\ell_p]_{\mathcal D}]
\delta[\kappa-[\kappa_p]_{\mathcal K}].
\end{aligned}
\tag{58}
$

两次折叠使相位既依赖 $m$ 又依赖 $n$。这说明高时延–多普勒物理路径的参数并非简单丢失，而是编码在折叠后的索引以及相位随接收符号和子载波索引的变化中。这种结构可用于构造物理信道估计和感知方法。

### F. ESDD 信道的衰落效应与可预测性

上节讨论单条整数 DD 栅格路径的折叠，本节推广到含 $P$ 条路径的一般离栅物理信道。接收机如果了解双重折叠 ESDD 系数 $\ddot V_{\kappa,d,m,n}$，有利于设计 ODDM 检测算法，因此希望用低导频开销估计它们。然而，这组系数通常依赖 $(\kappa,d,m,n)$，在把 $m$ 视为时间索引、$n$ 视为频率索引时，可以理解为有效 DD 信道在时频域的变化。

由式（58）及多径线性叠加可知：如果不同物理路径的栅格化等效散射体在折叠后不重合，则系数变化仅体现在相位上；当不同路径折叠到相同位置，其具有不同相位的贡献可能相长或相消，从而使等效系数幅度也变化，产生混叠所引起的衰落效应。因此，**决定有效信道随 $(m,n)$ 如何变化的，是 ESDD 等效信道的折叠结构，而不只是原始物理路径的 DD 支撑集。**

单个 ODDM 帧至多提供 $MN$ 个数字样本用于观测，所以在没有先验知识时，通常无法通过一个帧直接估计全部可能的 $\ddot V_{\kappa,d,m,n}$。但可以利用式（45）的潜在参数模型，先估计物理路径参数 $(\rho_p,\ell_p,\kappa_p)$，再重建所需的折叠 ESDD 系数。若等效信道只有少数主导虚拟散射体，还可能利用其稀疏性降低估计开销。

**引理 3：无噪声时直接利用嵌入式 DD 导频估计 ESDD 信道的一个充分条件。** 若信道的栅格化虚拟散射体完全限制在延时与多普勒的基本区域，即

$$
V_{b,l}=0,\qquad \text{if }b\notin\mathcal K,\ l\notin\mathcal D.
\tag{59}
$$

式（59）按原文以逗号并列书写；结合引理正文“支撑限制在基本区域”的含义，应理解为任一索引越出相应基本区域时，该虚拟路径系数为零，而非只要求两个索引同时越界时为零。此时延时和多普勒均不发生混叠或折叠，$\ddot V_{\kappa,d,m,n}=V_{\kappa,d}$ 不再随 $m,n$ 变化。只需估计任意给定 $(m,n)$ 处的相关系数，即可恢复完整 ESDD 信道。满足这一充分条件一般需要：（1）物理信道的 DD 扩展足够小；（2）发射脉冲支撑足够短，使式（14）的模糊函数对基本延时区间以外的抽头为零；（3）接收窗能将多普勒泄漏约束在基本区域内。若发生折叠，由于系数依赖 $m,n$，则不能未经额外建模就把某一符号的单次导频估计视为整个帧中不变的 ESDD 信道。

**校对提示：** 式（54）、（56）、（57）的折叠次数采用“取整至最近整数”的记号，实际取值依赖原文定义的基本区间；端点和负数折叠时应遵循原文的模运算约定，不能用编程语言默认的四舍五入直接替换。



### G. 矩阵形式

结合噪声，ODDM 也可在矩阵形式下描述。定义时域接收向量 $\mathbf y_{\mathrm T}=[y[0],\ldots,y[NM-1]]^{\mathsf T}$，将 DD 域发送符号按行堆叠为 $\mathbf x_{\mathrm{DD}}$，则

$$
\mathbf y_{\mathrm T}=\mathbf H_{\mathrm{T-DD}}\mathbf x_{\mathrm{DD}}+\mathbf z_{\mathrm T}.
\tag{60}
$$

其中 $\mathbf H_{\mathrm{T-DD}}\triangleq\mathbf H_{\mathrm T}\mathbf\Pi(\mathbf I_M\otimes\mathbf F_N^H)$，$\mathbf F_N$ 为归一化 DFT 矩阵，$\mathbf\Pi\in\{0,1\}^{MN\times MN}$ 是描述 ODDM 采样交织的置换矩阵，其元素为

$$
[\mathbf\Pi]_{k,k'}=
\begin{cases}
1,& k'=[k]_M N+\lfloor k/M\rfloor,\\
0,&\text{otherwise}.
\end{cases}
\tag{61}
$$

考虑收发机添加和移除 CP/CS 后，有效时域信道矩阵 $\mathbf H_{\mathrm T}$ 的大小为 $MN\times MN$，满足 $[\mathbf H_{\mathrm T}]_{k,k'}=h[[k-k']_{\widehat{\mathcal L}},k]$，$\widehat{\mathcal L}$ 是包含 $\mathcal L$ 的、具有 $MN$ 个连续整数的集合。对于 $P$ 条物理路径，式（18）的有效抽头为

$$
h[l,k]=\sum_{p=1}^P
\rho_p w[k]g(lT_s-\tau_p,\nu_p)
e^{j2\pi(k-\ell_p)\kappa_p/K}.
\tag{62}
$$

定义窗函数加权的噪声 $z[k]=w[k]\widetilde z[k]$，而匹配滤波噪声样本为

$$
\widetilde z[k]=\int a^*(t-kT_s)z(t)\,dt.
\tag{63}
$$

若连续噪声满足 $\mathbb E[z(t)]=0$ 及 $\mathbb E[z(t)z^*(t')]=\sigma_z^2\delta(t-t')$，则采样噪声相关性为

$$
\begin{aligned}
\mathbb E[\widetilde z[k]\widetilde z^*[k']]
&=\sigma_z^2\int a^*(\xi)a(\xi+(k-k')T_s)\,d\xi\\
&=\sigma_z^2g((k-k')T_s).
\end{aligned}
\tag{64}
$$

从而未加窗的噪声协方差矩阵为 Toeplitz 矩阵 $\mathbf\Sigma_{\widetilde z}$，接收窗作用后的协方差为 $\mathbf\Sigma_{\mathrm T}=\mathbf W\mathbf\Sigma_{\widetilde z}\mathbf W^H$，其中 $\mathbf W\triangleq\operatorname{diag}\{w[0],\ldots,w[MN-1]\}$。

DD 域的矩阵模型为

$$
\mathbf y_{\mathrm{DD}}=\mathbf H_{\mathrm{DD}}\mathbf x_{\mathrm{DD}}+\mathbf z_{\mathrm{DD}},
\tag{65}
$$

$$
\mathbf H_{\mathrm{DD}}
=(\mathbf I_M\otimes\mathbf F_N^H)\mathbf\Pi^H
\mathbf H_{\mathrm T}\mathbf\Pi
(\mathbf I_M\otimes\mathbf F_N).
\tag{66}
$$

其噪声协方差为 $\mathbf\Sigma_{\mathrm{DD}}=(\mathbf I_M\otimes\mathbf F_N^H)\mathbf\Pi^H\mathbf\Sigma_{\mathrm T}\mathbf\Pi(\mathbf I_M\otimes\mathbf F_N)$。基于 ESDD 模型，可把 $\mathbf H_{\mathrm{DD}}$ 写为包含 $M\times M$ 个块的矩阵：

$$
\mathbf H_{\mathrm{DD}}
=\left[\mathbf H_{\mathrm{DD}}[m,\widetilde m]\right]_{0\le m\le M-1,\ 0\le \widetilde m\le M-1}.
\tag{67}
$$

块 $\mathbf H_{\mathrm{DD}}[m,\widetilde m]$ 的 $(n,\widetilde n)$ 元素可用 DD 折叠系数表示，也可直接展开为物理路径参数：

$
\begin{aligned}
[\mathbf H_{\mathrm{DD}}[m,\widetilde m]]_{n,\widetilde n}
&=\ddot V_{[n-\widetilde n]_{\mathcal K},
[m-\widetilde m]_{\mathcal D},m,n}
e^{j2\pi\frac{
(m-[m-\widetilde m]_{\mathcal D})[n-\widetilde n]_{\mathcal K}
}{MN}}
\Psi_{m,[m-\widetilde m]_{\mathcal D},\widetilde n}\\
&=\sum_{p=1}^{P}
\rho_p e^{j\frac{2\pi(m-\ell_p)\kappa_p}{NM}}
\zeta_m([n-\widetilde n]_{\mathcal K},\kappa_p)
\Psi_{m,[m-\widetilde m]_{\mathcal D},\widetilde n}\\
&\qquad\times\left(
\sum_{q=q_{\min}}^{q_{\max}}
g\left((qM+[m-\widetilde m]_{\mathcal D}-\ell_p)T_s,\frac{\kappa_p}{NT}\right)
e^{-j\frac{2\pi q\widetilde n}{N}}
\right).
\end{aligned}
\tag{68}
$

本式按原文第 13 页底部跨栏公式核对了指数中的折叠索引、求和范围及相位符号。

## V. 数值示例：与公式直接相关的实验定义

第 V 节分别展示等效信道支撑、误码率与互信息的数值结果。脉冲模型包括滚降系数为 $\beta$ 的平方根升余弦（SRRC）脉冲，以及标准差为 $\sigma$ 的高斯脉冲；窗函数考虑矩形窗、Hamming 窗，并以 99.9% 的等效信道能量覆盖定义显著支撑。

### B. 误码率与互信息

对平均符号功率归一化的 DD 域输入，可从时域模型式（60）或 DD 域模型式（65）构建线性最小均方误差（LMMSE）均衡器：

$$
\widehat{\mathbf x}_{\mathrm{DD}}
=\left(\mathbf H_{\mathrm{T-DD}}^H\mathbf\Sigma_{\mathrm T}^{-1}
\mathbf H_{\mathrm{T-DD}}+\mathbf I\right)^{-1}
\mathbf H_{\mathrm{T-DD}}^H\mathbf\Sigma_{\mathrm T}^{-1}\mathbf y_{\mathrm T}.
\tag{69}
$$

等价的 DD 域实现为

$$
\widehat{\mathbf x}_{\mathrm{DD}}
=\left(\mathbf H_{\mathrm{DD}}^H\mathbf\Sigma_{\mathrm{DD}}^{-1}
\mathbf H_{\mathrm{DD}}+\mathbf I\right)^{-1}
\mathbf H_{\mathrm{DD}}^H\mathbf\Sigma_{\mathrm{DD}}^{-1}\mathbf y_{\mathrm{DD}}.
\tag{70}
$$

原文指出，以上 LMMSE 均衡性能与接收窗 $w[k]$ 无关，但仍依赖发射脉冲 $a(t)$。对于零均值、单位平均功率的独立高斯输入，单位 DD 符号的平均互信息为

$$
\begin{aligned}
\mathcal I
&=\frac{\log\det\big(\mathbf H_{\mathrm{T-DD}}\mathbf H_{\mathrm{T-DD}}^H
+\mathbf\Sigma_{\mathrm T}\big)-\log\det(\mathbf\Sigma_{\mathrm T})}{MN}\\
&=\frac{\log\det\big(\mathbf H_{\mathrm{DD}}\mathbf H_{\mathrm{DD}}^H
+\mathbf\Sigma_{\mathrm{DD}}\big)-\log\det(\mathbf\Sigma_{\mathrm{DD}})}{MN}.
\end{aligned}
\tag{71}
$$


---

**校对范围：** 第 III–IV 节和矩阵模型式（60）–（67）、均衡与互信息式（69）–（71）已补录。现有主编号式（1）–（71）已齐，但仍需逐字符复核与附加未编号公式校对；并非全文公式终校，qa_complete=false。
