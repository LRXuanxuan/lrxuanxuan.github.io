---
layout: page
title: "OTFS-ISAC 叠加式 Sunscape 导频模式与信道估计｜中文译稿（未完）"
permalink: /papers/translations/2026-10-22-otfs-sunscape-superimposed-pilots/
math: true
toc: true
---

[← 返回论文库](/papers/) · [原文 DOI](https://doi.org/10.1109/TWC.2026.3689779)

# 面向 OTFS-ISAC 信道估计的叠加式 Sunscape 导频模式

**原题：** Superimposed Sunscape Pilot Pattern for Channel Estimation in OTFS-Based ISAC  
**作者：** Lianet Méndez-Monsanto、Andrés Reyes-Castro、Kun Chen-Hu、María Julia Fernández-Getino García、Ana García Armada  
**来源：** *IEEE Transactions on Wireless Communications*, 2026, 25:16680–16696；DOI: 10.1109/TWC.2026.3689779。上传 PDF 为 18 页后印本。  
**译文进度：** 已录入摘要、I–VII 节理论与实验主体、公式（1）–（51）中的主要推导、表 I–III，以及图 1–15 的图注和结果说明；英文参考文献 34 条、作者简介已补录；最终逐式校对仍待完成，**暂不标记为已验收全文**。  
**权利提示：** 上传的 IEEE 后印本声明仅许可个人使用，公开发布完整译作可能需取得相应许可。

## 摘要

正交时频空（orthogonal time-frequency space，OTFS）作为未来第六代（6G）及后续无线网络的一种有前景的波形，在高移动性场景中具有良好的鲁棒性，并通过在时延—多普勒（delay-Doppler，DD）域中工作，支持感知与通信业务的无缝融合。可靠的信道估计对于这两项功能都不可或缺；但传统嵌入式导频（embedded pilot，EP）方案通常面临较高的导频开销以及增大的峰均功率比（PAPR）。为减轻这些限制，研究者提出了叠加训练（superimposed training，ST），使导频与数据符号共享相同的 DD 域资源。然而，现有 ST 技术通常依赖计算复杂的算法，或者在通信与感知性能方面有所下降。

为克服上述限制，本文提出一种新的低功率叠加导频设计，称为 **Sunscape 模式**，并设计一种专门适配该结构的 ST 信道估计算法。其核心思想是在 DD 域按照结构化布局分配导频能量，形状如同海面上方的太阳。“太阳”部分能够准确检测时延和多普勒（包括整数与分数偏移）；“海面”部分天然支持对导频和数据分量之间的干扰进行平均，因此无需计算昂贵的迭代干扰消除，就能抑制自干扰和噪声。仿真验证了所提方案：它以较低计算复杂度和可控 PAPR 达到准确的信道估计、可靠的 DD 域检测，并在通信及感知性能上优于现有方法。

**关键词：** 6G；OTFS；感知；信道估计；叠加训练。

## I. 引言

感知与通信一体化（integrated sensing and communications，ISAC）已经成为未来 6G 网络的重要范式，目标是在数据传输和环境感知之间复用信号与硬件资源 [1]。感知功能需要准确定位目标，尤其是在车联网、雷达增强无线系统和工业自动化等高度动态的场景中，两项功能必须高效共存 [2]。因此，选择一种能够在高移动性条件下同时实现足够精确的感知和有效通信的波形，是主要挑战之一。

近期研究致力于将正交频分复用（OFDM）推广到动态场景。例如，文献 [3] 提出 DD 域信号处理辅助 OFDM，对 OFDM 导频进行 DD 域处理，提高信道估计精度。OTFS 是 6G 及后续网络的一种有前景的候选波形 [4]。它将发射符号排列在 DD 域，有利于 ISAC，并且与传统 OFDM 不同，能够有效减轻高移动性环境中双弥散信道的影响 [5]。

OTFS 的经典信道估计方法是嵌入式导频（EP）[6]，也称为导频辅助调制（PSAM）。这种方法造成明显的数据速率损失，因为每个导频符号都需要由保护符号包围，以避免相互干扰，如图 1(a) 所示。此外，DD 域中的孤立导频通常被分配大量功率，使发射端出现较高 PAPR。另一类 EP 方法是文献 [7] 的 OTFS-TSMA，它在 DD 域附加扩频序列作为导频，利用物联网中 DD 资源稀疏占用的特征。

作为 EP 的替代方案，叠加训练（ST，亦称叠加导频 SP）能够规避上述问题。在 ST 中，数据与导频同时占用相同的 DD 资源，因此共享功率域，却不损失数据资源比例 [8]。不过，在接收端，数据符号会干扰信道估计，需要进行自干扰抑制。已有两类途径：其一是逐次干扰消除（SIC）[9]，借助数据辅助迭代消除，但与 OTFS 结合时复杂度较高、处理时延较大；其二是统计方法 [8]，利用数据与噪声均为零均值随机变量的性质，通过低复杂度的平均运算滤除数据自干扰并减小噪声。后者的核心难题是如何设计导频，使平均运算在抑制自干扰的同时依然支持准确的信道估计。

### A. 已有 ST 工作

现有 OTFS-ST 信道估计研究多数依赖上述 SIC [9]，可分为使用分散孤立导频的方法 [10]–[17] 与使用结构化导频序列的方法 [9]、[18]–[23]，如图 1(b) 所示。

**分散孤立导频。** 这类方法把功率集中在特定 DD 资源上，因而通常能够准确检测时延与多普勒，但以高 PAPR 为代价。文献 [13] 使用 DFT 扩展 OTFS 降低功率峰值；文献 [14]–[16] 联合配置多个孤立导频以更均匀地分布能量，略微降低 PAPR，却减小了信道估计精度。文献 [17] 采用一个高功率中心导频与周围低功率导频的组合，使 PAPR 适度降低。此外，文献 [12]、[16] 引入深度学习信道估计以压制数据自干扰，但显著增加接收端复杂度。

**结构化导频序列。** 此类方法占用整个或部分 DD 网格，因而具有较低 PAPR，却增加导频之间的相互干扰。文献 [9]、[18]、[19] 将低功率导频符号叠加至整个 DD 网格，导频自干扰明显，降低时延、多普勒检测性能。为提高精度，往往需跨多个 DD 帧反复细化信道估计，增加时延和复杂度。文献 [23] 进一步使用恒包络导频以改善 PAPR，但在高信噪比条件下信道估计仍存在误差平台。文献 [21]、[22] 仅在 OTFS 帧中的小区域布置叠加导频，以平衡性能与复杂度，却假设跨帧时延、多普勒恒定，这在时变信道中未必成立；而且仍依赖 SIC。

针对 OTFS 的高 PAPR，文献 [20] 引入选择性映射（SLM）及部分传输序列（PTS）等传统降 PAPR 技术，但增加复杂度，也未完全解决问题。为克服 SIC 的复杂度问题，文献 [24]、[25] 提出了借助 DD 域平均运算压制干扰的周期性导频序列，取得合理的 PAPR—估计精度折中，但没有充分解决多普勒检测问题。

### B. 方法与贡献

针对上述局限，本文提出名为 Sunscape 的 ST 导频模式，以及基于统计方法的信道估计算法。具体而言，设计低复杂度的 DD 域平均过程抑制自干扰，使分散孤立导频与结构化导频序列的优势相结合：在保持较低 PAPR 和计算复杂度的同时，实现准确的时延、多普勒检测与信道估计。

Sunscape 由两部分构成：其一是称为“太阳”（sun pilots）的孤立导频结构，用于精确检测整数与分数时延、多普勒；其二是称为“海面”（sea pilots）的周期性导频结构，利用接收信号的统计性质在无须计算昂贵的 SIC 时，获取精确的信道复增益。“太阳”位于“海面”上方，两部分的组合因形似海景而被称为 sunscape。图 1(c) 给出了结构示意。

本文贡献主要包括：提出 DD 域新型叠加导频结构，理论分析增加太阳导频数量如何降低 PAPR，并导出达到最小 PAPR 所需太阳导频长度的闭式公式；提出专门的 ISAC 信道估计算法，先进行基于阈值的时延、多普勒检测及复增益粗估计，再利用海面导频周期结构对复增益进行平均细化；证明增加海面导频有利于降低估计 MSE、增加太阳导频能提高检测概率，并据此构造优化问题确定不同场景中的导频配置；最后从复杂度、信道估计 MSE、误码率（BER）、PAPR 和目标检测等方面进行理论与仿真比较。

**图 1：** DD 域导频分配：(a) 传统 EP；(b) 现有 ST 的分散孤立导频与结构化导频；(c) Sunscape 太阳—海面组合。高度表示功率，颜色区分数据和不同导频结构。

## II. 系统模型

考虑一个由单天线基站与单天线用户组成的单输入单输出（SISO）系统。二者进行双向通信，接收端信号用于信道估计，产生两类参数：用于感知的传播时延与多普勒频移，以及用于通信的复信道增益。感知参数估计可上送物理层以上的协议层，用于用户定位或环境感知，支持单站或双站配置。

### A. 基于 ST 的 OTFS 发射机

发射端将数据和导频放置到 DD 域资源网格 $\mathbf X\in\mathbb C^{M\times N}$，称为 OTFS 帧。网格具有 $M$ 个时延单元（或子载波）和 $N$ 个多普勒单元（或多载波符号），元素为 $\mathbf X[m,n]$，其中 $0\le m<M$、$0\le n<N$。采用 ST 时，数据与导频在 DD 域叠加：

$$
\mathbf X=\sqrt{\beta}\mathbf X_d+\sqrt{1-\beta}\mathbf X_p
\in\mathbb C^{M\times N},\quad 0\le\beta\le1.\tag{1}
$$

这里，$\mathbf X_d$ 为数据符号网格，各元素为归一化平均能量为 1 的 QAM 符号；$\mathbf X_p$ 是导频网格；$\beta$ 为分配给数据的功率比例。叠加发生在波形构造之前的数据生成阶段，因而不限定时域脉冲形状。

发射端通过逆离散 Zak 变换（IDZT）将 DD 域符号映射为时域采样向量 $\mathbf s\in\mathbb C^{MN}$。假设使用持续时间为 $T$ 的矩形发射和接收脉冲形状，IDZT 等效于沿 $\mathbf X$ 的行进行逆离散傅里叶变换（IDFT），得到时延—时间域网格，再按列进行并串转换：

$$
\mathbf X^{(\mathrm{DT})}=\mathbf X\mathbf F_N^{\mathsf H}
\in\mathbb C^{M\times N},\quad
\mathbf F_N=\frac{1}{\sqrt N}\big(e^{-j2\pi kl/N}\big)_{k,l=0}^{N-1}.\tag{2}
$$

$$
\mathbf s=\mathrm{vec}(\mathbf X^{(\mathrm{DT})})
=[\mathbf s_0^\top,\ldots,\mathbf s_{N-1}^\top]^\top
\in\mathbb C^{MN}.\tag{3}
$$

$\mathbf F_N$ 为归一化 $N$ 点 DFT 矩阵，$\mathbf s_n\in\mathbb C^M$ 是持续 $T=1/\Delta f$ 秒的多载波符号，$\Delta f$ 为子载波间隔。本文使用零填充 OTFS（ZP-OTFS），在各多载波符号末尾附加长度为 $L_{\mathrm{ZP}}$ 的零填充，随后经数模转换、上变频和无线信道传输。

### B. 双弥散信道模型

无线信道具有频率选择性与时间变化，可在 DD 域表示为

$$
h(\tau,\nu)=\sum_{\ell\in\mathcal L}\sum_{\kappa\in\mathcal K_\ell}
v_\ell(\kappa)\delta\!\left(\tau-\frac{\ell T}{M}\right)
\delta\!\left(\nu-\frac{\kappa\Delta f}{N}\right).\tag{4}
$$

其中，$\mathcal L=\{\ell_i\}$ 是归一化时延集合，$\mathcal K_\ell$ 是时延 $\ell$ 对应的多普勒频移集合，传播路径数为 $L$。每个目标对应一条路径或一个抽头，本文交替使用这些名称。其多普勒响应满足

$$
v_\ell(\kappa)=
\begin{cases}
g_i,&\ell=\ell_i,\ \kappa=\kappa_i,\\
0,&\text{其余情况}.
\end{cases}\tag{5}
$$

复路径增益满足 $g_i\sim\mathcal{CN}(0,\sigma_i^2)$，各路径平均功率之和为 $\sigma_h^2$。物理时延（秒）和多普勒频移（Hz）分别为

$$
\tau_i=\frac{\ell_i}{M\Delta f}\le\tau_{\max},\qquad
\nu_i=\frac{\kappa_i}{NT},\quad |\nu_i|\le\nu_{\max}.\tag{6}
$$

研究同时考虑整数及分数归一化时延、多普勒。信道假定为欠扩展信道，$\tau_{\max}\nu_{\max}\ll1$ 且 $T\Delta f=1$。由此限制最大时延与多普勒范围。第 $i$ 个目标的距离和速度写为 $R_i=\tau_ic$ 与 $V_i=c\nu_i/f_c$（原文采用的传播距离定义），其中 $c$ 为光速、$f_c$ 为载波频率。

### C. OTFS 接收机

接收信号经过下变频、模数转换和去除零填充后，利用离散 Zak 变换（DZT）返回 DD 域。先将时域向量转换为时延—时间域网格，再沿行执行 DFT：

$$
\mathbf Y^{(\mathrm{DT})}=\mathrm{vec}_{M,N}^{-1}(\mathbf r),\qquad
\mathbf Y=\mathbf Y^{(\mathrm{DT})}\mathbf F_N\in\mathbb C^{M\times N}.\tag{7}
$$

获得信道参数后，本文使用 DD 域线性最小均方误差（LMMSE）均衡进行通信检测，低复杂度均衡也是可行的替代方案。

### D. 等效 OTFS 向量系统

由于 DFT 是线性的，发射时域向量也可表示为

$$
\mathbf s=\sqrt\beta\,\mathbf s_d+\sqrt{1-\beta}\,\mathbf s_p.\tag{8}
$$

在接收端，DD 域向量信号满足

$$
\mathbf y=\mathbf H\mathbf x+\mathbf z,\qquad
\mathbf y,\mathbf x,\mathbf z\in\mathbb C^{MN},\tag{9}
$$

其中，$\mathbf x=\mathrm{vec}(\mathbf X)$，$\mathbf z$ 为加性白高斯噪声。等效 DD 域信道矩阵由时域等效矩阵 $\mathbf G$、置换矩阵 $\mathbf P$ 和傅里叶矩阵组合：

$$
\mathbf H=(\mathbf I_M\otimes\mathbf F_N)
(\mathbf P^\top\mathbf G\mathbf P)
(\mathbf I_M\otimes\mathbf F_N^{\mathsf H}).\tag{10}
$$

其时变抽头延迟线响应为

$$
g_s[l,q]=\sum_{\ell\in\mathcal L}
\left(\sum_{\kappa\in\mathcal K_\ell}v_\ell(\kappa)
e^{j2\pi\kappa(q-l)/(MN)}\right)\mathrm{sinc}(l-\ell),
\quad \mathrm{sinc}(x)=\frac{\sin(\pi x)}{\pi x}.\tag{11}
$$

**图 2：** 含 ST 的 OTFS 系统模型。发射端叠加数据与导频，经 IDZT 和零填充发送；接收端经 DZT 和信道估计得到时延、多普勒与复增益，分别供感知和通信使用。

## III. OTFS 中的新型 Sunscape 导频模式

### A. Sunscape 导频结构

图 3 展示了 DD 网格中的 Sunscape 结构：黄色为孤立的“太阳”导频，蓝色为周期排列的“海面”导频。设太阳导频的竖直序列为 $\mathbf p_s\in\mathbb C^{L_s}$，海面导频为 $\mathbf X_a\in\mathbb C^{L_a\times N}$，天空区域在时延轴上占 $L_y$ 个单元，则导频网格为

$$
\mathbf X_p[m,n]=
\begin{cases}
\sqrt{\dfrac{NL_y}{L_s}}\,p_s[m],
&m_s\le m\le m_s+L_s-1,\ n=n_s,\\
X_a[m,n],&m_a\le m\le M-1,\ 0\le n\le N-1,\\
0,&\text{其余情况}.
\end{cases}\tag{12}
$$

设计参数满足 $1\le L_s\le M-l_{\max}-1$、$L_y=L_s+l_{\max}$、$L_a=M-L_y$、$m_a=L_y$，并满足导频起始位置约束（13）。太阳与海面至少要在时延轴上间隔 $l_{\max}$ 个单元以避免相互干扰。将此导频网格依照式（1）与数据叠加，可实现资源开销为零的 ST，但数据有效 SNR 会略有下降。

原文式（13）将 Sunscape 几何布局和整数约束集中写为

$
\begin{gathered}
L_s,L_y,L_a\in\mathbb Z,\qquad
1\le L_s\le M-l_{\max}-1,\\
0\le m_s\le M-2,\qquad 0\le n_s\le N-1,\\
L_y=L_s+l_{\max},\qquad 1\le L_y\le M-1,\\
L_a=M-L_y,\qquad m_a=L_y,\qquad
1\le L_a\le M-1.
\end{gathered}\tag{13}
$

这里 $L_y$ 是包括太阳导频在内的“天空”区域长度，$L_a$ 是海面区域长度；上述约束保证天空与海面都位于 DD 网格之内，并为时延扩展留出保护间隔。

**太阳导频。** 该结构是一列沿时延方向排列的孤立导频。由于 Zadoff–Chu（ZC）序列具有良好自相关性和恒包络，本文采用 ZC 序列构造：

$$
p_s[m]=e^{-j\pi\mu_sm(m+1)/L_s},
\quad m=0,\ldots,L_s-1.\tag{14}
$$

$\mu_s$ 是 ZC 根，与序列长度互素；若 $L_s$ 为偶数，则先构造 $L_s-1$ 个符号的序列，并将首元素循环追加到末尾。

**海面导频。** 为使 DD 域平均运算能够有效工作，海面采用沿多普勒轴周期重复的序列。先以 ZC 序列生成长度为 $L_a$ 的导频：

$$
p_a[m]=e^{-j\pi\mu_am(m+1)/L_a},
\quad m=0,\ldots,L_a-1,\tag{15}
$$

再在全部 $N$ 个多载波符号中重复：

$$
\mathbf X_a=\mathrm{vec}_{L_a,N}^{-1}
\!\left(\mathbf 1_{N\times1}\otimes\mathbf p_a\right)
\in\mathbb C^{L_a\times N}.\tag{16}
$$

偶数长度时同样使用附加首元素的构造方式，ZC 根与有效序列长度互素。

**天空区域。** 为避免两种导频的相互干扰，需要 $L_y\ge L_s+l_{\max}$。对于所采用的 ZP-OTFS，可以按照最大时延扩展配置 $L_y\ge L_s+L_{\mathrm{ZP}}$。零填充可以隔离相邻多载波符号；但对循环前缀 OTFS 和其他变体，可能需要额外保护区。

在时延—时间（DT）域中，Sunscape 经行向 IDFT 后为

$$
\mathbf X_p^{(\mathrm{DT})}
=\mathbf X_p\mathbf F_N^{\mathsf H}.\tag{17}
$$

其结构具有两个特点：原来集中在 DD 域某一多普勒位置的太阳 ZC 列，在 DT 域重复出现在所有时间列；而 DD 域周期重复的海面导频在 DT 域收缩为位于时间列 $n=0$ 的单个 ZC 序列。这源于离散 Kronecker 冲激与常数序列之间的 DFT 对偶关系。

**图 3：** DD 域 Sunscape 叠加导频结构；不同颜色还表示不同符号相位。



原文将式（17）的元素显式展开为

$
\mathbf X_p^{(\mathrm{DT})}[m,n]=
\begin{cases}
\displaystyle\sqrt{\frac{L_y}{L_s}}\,p_s[m],
&m_s\le m\le m_s+L_s-1,\quad 0\le n\le N-1,\\[4pt]
\sqrt N\,p_a[m],
&m_a\le m\le M-1,\quad n=0,\\
0,&\text{其余情况}.
\end{cases}\tag{18}
$

这一等式直接说明：太阳导频沿时间方向在全部 $N$ 列重复，而海面导频仅集中在第零个时域多载波符号。

### B. Sunscape 导频的 PAPR 分析

PAPR 衡量时域 OTFS 信号的峰值功率与平均功率之比：

$$
\mathrm{PAPR}(\mathbf s)=
\frac{\max_{0\le q<MN}|s[q]|^2}
{\frac1{MN}\sum_{q=0}^{MN-1}|s[q]|^2}.\tag{19}
$$

根据式（18）中的 DT 域结构，导频峰值可能由太阳或海面引起。太阳导频的最大功率为 $L_y/L_s$，海面导频的最大功率为 $N$。在本文采用的单位平均功率归一化下，单独考虑导频时有

$$
\mathrm{PAPR}(\mathbf s_p,L_s)
=\max\left(\frac{L_y}{L_s},N\right).\tag{20}
$$

由于导频总功率比例为 $1-\beta$，且 $L_y=L_s+l_{\max}$，其对应的加权峰值指标满足

$$
\mathrm{PAPR}(\sqrt{1-\beta}\mathbf s_p,\beta,L_s)
=(1-\beta)\max\left(1+\frac{l_{\max}}{L_s},N\right).\tag{21}
$$

要使上述最大值达到由 $N$ 支配的下界，太阳项不得超过 $N$，于是得到导频长度条件：

$$
L_s\ge\frac{l_{\max}}{N-1}.\tag{22}
$$

这里忠实保留原文式（22）的实数不等式。由于太阳导频长度 $L_s$ 必须为整数，实际配置可取 $L_s\ge\lceil l_{\max}/(N-1)\rceil$。该闭式条件给出使太阳结构不再额外增加峰值的最短长度。这种配置使太阳导频与海面导频在 PAPR 方面达到相当表现，后续数值实验将检验其优势。

## IV. 基于 Sunscape 的信道估计与感知过程（部分译文）

图 4 给出了专门为 Sunscape 设计的 ISAC 接收端处理流程。首先利用太阳导频进行基于阈值的时延和多普勒检测，同时粗估信道复增益；再利用周期排列的海面导频，结合平均运算细化复增益估计，而不执行昂贵的数据辅助 SIC。检测到的时延与多普勒可以转化为目标距离与速度信息供感知使用；时延、多普勒和增益三类参数也用于通信信道重建。以下先考虑整数网格，随后推广到分数偏移。

### A. 时延和多普勒检测、增益粗估计

对于第 $i$ 个抽头，接收 DD 域信号在相应导频位置满足

$$
Y[m_s+l_i,n_s+k_i]
=g_i z^{k_im_s}X[m_s,n_s]
+Z[m_s+l_i,n_s+k_i],\quad
z=e^{j2\pi/(MN)}.\tag{23}
$$

目标个数 $L$ 未知。太阳导频长度决定检测采用直接阈值还是相关处理。**短太阳导频**将发射功率集中于较少符号，瞬时导频功率较高，可直接在接收信号中检测，以低计算复杂度为优势，但 PAPR 较高。定义二值抽头检测变量：

$$
b[l,k]=
\begin{cases}
1,&|Y[m_s+l,n_s+k]|^2>\gamma,\\
0,&\text{否则},
\end{cases}\quad\gamma>0.\tag{24}
$$

扫描允许的时延—多普勒区域，便可估计存在的抽头数 $\widetilde L$，再利用接收样本、已知导频和相位补偿获得复增益粗估计：

$$
\widetilde g_i=
\frac{Y[m_s+l_i,n_s+k_i]}
{X_p[m_s,n_s]z^{k_im_s}\sqrt{1-\beta}},
\quad i=0,\ldots,\widetilde L-1.\tag{26}
$$

由于数据自干扰仍然存在，该估计只能作为初值。

**长太阳导频**将功率分布在更多符号上，因此降低 PAPR，但单个符号的功率变小，需要相关处理才能可靠提取导频。接收端计算

$$
C[l,k]=\frac1{L_s}\sum_{m=0}^{L_s-1}
Y[m_s+m+l,n_s+k]\,z^{-km_s}p_s^*[m].\tag{27}
$$

相关矩阵中目标对应峰值，再对 $|C[l,k]|^2$ 施加阈值进行检测，并以

$$
\widetilde g_i=
C[l_i,k_i]\left(\sqrt{NL_y(1-\beta)}\right)^{-1}
\tag{29}
$$

计算复增益粗估计。该方式以略高的计算量换取明显的 PAPR 改善。

当 $L_s<L_a$ 时，海面 ZC 序列较长，可用于更加稳健的时延检测。接收端进行时延方向相关：

$$
C_a[l]=\sum_{m=l}^{L_a-1}y[m]p_a^*[m-l],
\quad 0\le l\le l_{\max},\tag{30}
$$

并对 $|C_a[l]|^2$ 进行阈值检测。较长的相关序列能够改善时延检测性能，但也略微增加计算复杂度。

**分数时延和分数多普勒。** 对于非整数偏移，沿用上述短/长导频检测框架，不过先对接收信号或相关矩阵进行过采样，提高 DD 网格分辨率。由于真实非整数路径能量会泄漏到相邻网格点，一个目标附近可能出现多个候选峰值。因此，在检测最大峰值后，首先沿时延坐标、再沿相应时延行的多普勒坐标，分别采用局部三点二次插值，通过抛物线顶点估计分数偏移。复增益初值还应补偿 sinc 响应在检测位置上的衰减。对较大 $M,N$ 的高分辨率场景，完整 DD 域 LMMSE 均衡复杂度较高，可采用块级时域 LMMSE 减少计算量。

### B. 复信道增益的精细估计

为在不依赖数据辅助检测和显式 SIC 的条件下降低数据自干扰，利用海面导频的周期结构所诱导的循环平稳统计特性，特别是周期性变化的均值。对 DD 域接收矩阵海面区域沿多普勒轴平均，亦即引入平均矩阵 $\mathbf A$：

$$
\overline{\mathbf y}=\mathbf A\mathbf y_a\in\mathbb C^{L_a},
\qquad
\mathbf A=\frac1N(\mathbf I_{L_a}\otimes\mathbf 1_{1\times N}).\tag{33}
$$

给定检测得到的时延、多普勒及信道复增益粗估计，算法在平均信号中减去其他路径的重建贡献，依次细化每条路径的复增益。首先保留最强路径并减去其余路径的粗估贡献，获得残差信号；随后按照已检测到的时延与多普勒对齐，使用长度约为 $L_a$ 的样本再次平均，得到更精确的复增益。每估计完一条路径，即使用它的精估值取代初值，更新其他路径的残差计算。这样既利用海面周期性来平均零均值数据干扰与噪声，又避免传统多轮数据辅助 SIC 的成本。



**整数网格检测的完整阈值规则。** 短太阳导频的抽头数量由二值检测结果求和：

$
\widetilde L=
\sum_{l=0}^{l_{\max}}
\sum_{k=-k_{\max}}^{k_{\max}-1}b[l,k],
\quad
|Y[m_s'+l,n_s+k]|^2
\underset{\text{无抽头}}{\overset{\text{有抽头}}{\gtrless}}\gamma,
\tag{25}
$

其中，$m_s\le m_s'\le L_s-1$。对于长太阳导频，则对相关矩阵执行同样的二值检测：

$
|C[l,k]|^2
\underset{\text{无抽头}}{\overset{\text{有抽头}}{\gtrless}}\gamma,
\qquad
\widetilde L=\sum_{l=0}^{l_{\max}}
\sum_{k=-k_{\max}}^{k_{\max}-1}b[l,k].
\tag{28}
$

海面导频辅助的时延检测根据 $|C_a[l]|^2$ 与阈值比较：

$
|C_a[l]|^2
\underset{\widetilde l_i\ne l}{\overset{\widetilde l_i=l}{\gtrless}}
\gamma,\quad i=0,\ldots,\widetilde L-1.\tag{31}
$

**离网分数偏移的过采样矩阵。** 为精细检测非整数时延、多普勒，定义 $D=Y$（短太阳导频）或 $D=C$（长太阳导频；先零填充到 $M\times N$），然后构造

$
D_o=
F_{M_o}^{\mathsf H}P_MF_MD\,
F_N^{\mathsf H}P_N^{\mathsf H}F_{N_o}
\in\mathbb C^{M_o\times N_o}.\tag{32}
$

其中 $M_o=KM$，$N_o=KN$，$K$ 为整数过采样倍率；$P_M\in\mathbb C^{M_o\times M}$ 和 $P_N\in\mathbb C^{N_o\times N}$ 分别沿时延和多普勒轴执行居中零填充。对于时延轴，

$
P_M=
\begin{bmatrix}
0_{p_M\times M}\\
I_M\\
0_{(M_o-M-p_M)\times M}
\end{bmatrix},
\qquad
p_M=\left\lfloor\frac{M_o-M}{2}\right\rfloor.
$

$P_N$ 采用相同方式构造。之后在 $D_o$ 上应用式（25）或式（28）的检测规则。如需使用海面导频检测时延，也可对式（30）相关结果施加同类过采样，而多普勒仍由太阳导频检测。

**增益细化的迭代表达式。** 为避免同时估计不同路径时互相污染，首先从平均向量 $\overline{\mathbf y}$ 中减去除最强抽头（$i=0$）之外的粗估路径贡献，得到

$
\mathbf y'_0=\overline{\mathbf y}-
\sum_{r=1}^{\widetilde L-1}
\widetilde g_r\Big(
\boldsymbol\delta_{\widetilde k_r}[m-\widetilde l_r]
\odot\mathbf p_a[m-\widetilde l_r]
\Big).\tag{34}
$

其中，$\boldsymbol\delta_{\widetilde k_r}$ 是由该路径多普勒频移引起的、沿时延索引旋转的复指数向量，$\mathbf p_a[m-\widetilde l_r]$ 为按相应时延偏移后的海面导频。对当前抽头，从残差向量中计算新的复增益：

$
\widetilde g_i'=
\frac{1}{L_a-\widetilde l_i}
\sum_{r=0}^{L_a-\widetilde l_i-1}
\frac{\mathbf y_i'[r]}{\boldsymbol\delta_{\widetilde k_i p}[r]},
\quad i=0,\ldots,\widetilde L-1,\tag{35}
$

其中，$\boldsymbol\delta_{\widetilde k_i p}=
\boldsymbol\delta_{\widetilde k_i}\odot
\mathbf p_a[m-\widetilde l_i]$。完成第 $i$ 条路径的细化后，后续残差必须减去已细化路径和尚未细化路径的不同估计：

$
\begin{aligned}
\mathbf y_i'=\overline{\mathbf y}
&-\sum_{r=i+1}^{\widetilde L-1}\widetilde g_r
\Big(\boldsymbol\delta_{\widetilde k_r}[m-\widetilde l_r]
\odot\mathbf p_a[m-\widetilde l_r]\Big)\\
&-\sum_{r=0}^{i-1}\widetilde g_r'
\Big(\boldsymbol\delta_{\widetilde k_r}[m-\widetilde l_r]
\odot\mathbf p_a[m-\widetilde l_r]\Big).
\end{aligned}\tag{36}
$

以上表达式对应原文按路径依次剔除、重新估计的算法；由于数据和噪声均为零均值随机变量，沿海面导频平均可以减少干扰残留。对于分数时延，对平均向量、海面导频及参考多普勒向量统一过采样至长度 $L_{a,o}=KL_a$，然后在同一网格上使用式（34）–（36）。对于分数多普勒，由于海面导频在 DT 域只占据一个多载波符号 $n=0$，不会受到跨符号多普勒演化的影响，所观察到的多普勒作用仅表现为每时延单元上的相位旋转。

**图 4：** Sunscape-OTFS 接收机框图；黄色模块处理太阳导频，蓝色模块处理海面导频。流程包括检测、粗增益估计、周期平均、路径扣除、精细估计，最后提供感知参数和通信均衡输入。


### C. 面向感知的目标检测概率分析

考虑长太阳导频的相关检测。假设 $\mathcal H_0$ 表示不存在目标，$\mathcal H_1$ 表示存在目标。对某个时延—多普勒单元 $(l,k)$，相关输出建模为

$
C[l,k]=
\begin{cases}
V[l,k],&\mathcal H_0,\\
g_i(1-\beta)\dfrac{NL_y}{L_s}|p_s|^2+V[l,k],
&\mathcal H_1,
\end{cases}\tag{37}
$

其中，$V[l,k]\sim\mathcal{CN}(0,\sigma_v^2)$ 表示相关之后的数据自干扰与噪声残留。由于目标/传播路径数量通常远小于 DD 网格大小，在 $MN$ 较大时，利用统计平均可以得到

$
\sigma_v^2=\frac{\beta+\sigma_z^2}{L_s},\qquad
\frac1{MN}\sum_{k=0}^{N-1}\sum_{l=0}^{M-1}|C[l,k]|^2
\xrightarrow[MN\to\infty]{}\sigma_v^2.\tag{38}
$

数据和噪声残留方差随相关长度 $L_s$ 增大而按比例减小。阈值可选择为大于残留标准差一定倍数：

$
\gamma>\gamma_l\sigma_v,\quad
\gamma_l\in\mathbb R_{>0}.\tag{39}
$

这可以视为一种基础的恒虚警率（CFAR）检测形式。在存在杂波或非高斯干扰的感知场景中，可以按照目标虚警概率 $P_{\rm FA}$ 和训练单元数 $N_{\rm tc}$，使用

$
\gamma=N_{\rm tc}\left(P_{\rm FA}^{-1/N_{\rm tc}}-1\right).\tag{40}
$

实际检测规则仍是

$
E=|C[l,k]|^2
\underset{\mathcal H_0}{\overset{\mathcal H_1}{\gtrless}}\gamma.\tag{41}
$

在原文高斯假设下，$E$ 服从两自由度中心卡方分布的缩放形式：

$
E\sim
\begin{cases}
\dfrac{\sigma_v^2}{2}\,\chi_2^2,
&\mathcal H_0,\\[5pt]
\dfrac{\sigma_v^2+\sigma_h^2(NL_y/L_s)(1-\beta)}{2}
\,\chi_2^2,&\mathcal H_1.
\end{cases}\tag{42}
$

因此，虚警概率与检测概率的闭式表达式为

$
P_{\rm FA}(\beta,L_s)
=\exp\!\left(-\frac{\gamma L_s}{\beta+\sigma_z^2}\right),\tag{43}
$

$
P_D(\beta,L_s)=
\exp\!\left(
-\frac{\gamma L_s}
{\beta+\sigma_z^2+
\sigma_h^2N(L_s+l_{\max})(1-\beta)}
\right).\tag{44}
$

式（43）、（44）描述了太阳导频长度、功率分配与检测性能之间的相互作用。实际结果还受到 ZC 序列自相关旁瓣等因素影响，须结合仿真检验阈值设计与理想化分析是否一致。

### D. 面向通信的复增益估计 MSE

以下分析先假设时延和多普勒抽头已被正确检测，即 $\widetilde l_i=l_i$、$\widetilde k_i=k_i$。周期性海面导频在 DD 域使接收信号表现出周期变化的均值（循环平稳统计特性）。由于数据与噪声的均值均为零，大数定律意味着对足够多样本进行平均时，它们的贡献趋于零：

$
\sum_{q=0}^{MN-1}x_d[q]\xrightarrow[MN\to\infty]{}0,\qquad
\sum_{q=0}^{MN-1}z[q]\xrightarrow[MN\to\infty]{}0.\tag{45}
$

据此，经过 $N$ 个多载波符号平均的接收向量渐近趋于由导频与信道产生的部分：

$
\overline y[m]\xrightarrow[N\to\infty]{}
\sqrt{1-\beta}\sum_{i=0}^{L-1}
g_i z^{k_i(m-l_i)}p_a[m-l_i].\tag{46}
$

原文进一步说明，对式（34）–（36）的残差再沿可用的 $L_a$ 个时延单元平均，在渐近条件下可以得到

$
\frac1{L_a}\sum_{r=0}^{L_a-1}
\frac{y_i'[r]}{\delta_{\widetilde k_i p}[r]}
\xrightarrow[L_a\to\infty]{}g_i.\tag{47}
$

因此，经过 $N L_a$ 个样本的相关平均之后，数据与噪声残留方差分别成为

$
\sigma_T^2=\sigma_d'^2+\sigma_z'^2,\quad
\sigma_d'^2=\frac{\beta}{NL_a},\quad
\sigma_z'^2=\frac{\sigma_z^2}{NL_a}.\tag{48}
$

对于已经正确检测的路径，以真实系数向量 $\mathbf g$ 和估计向量 $\widetilde{\mathbf g}$ 定义 MSE：

$
\mathrm{MSE}
=\mathbb E\!\left[\|\mathbf g-\widetilde{\mathbf g}\|^2\right].\tag{49}
$

在上述条件下，原文给出 MSE 的下界

$
\mathrm{MSE}(\beta,L_s\mid
\widetilde l_i=l_i,\widetilde k_i=k_i)
\ge\sigma_T^2
=\frac{\beta+\sigma_z^2}{NL_a}.\tag{50}
$

这说明对于已检测到的路径，海面导频长度 $L_a$ 是影响复增益估计 MSE 的关键参数。由于 $L_a=M-L_s-l_{\max}$，在固定 $M$ 和最大时延扩展的情况下，增大太阳导频长度通常会减小海面导频数量，从而提高复增益估计误差。注意，式（50）对单个正确检测的抽头给出误差分析；未检测与虚警的影响会进一步通过参数联合优化考虑。作者指出，在通信常见的 $SNR>0$ dB 范围内，此类错误在仿真中对最终 MSE 的影响很小。

## V. 计算复杂度与参数设计

### A. 接收端计算复杂度

本节以复数乘法次数比较 Sunscape 与传统嵌入式导频及其他 ST 方法。由于所选导频单位模长，除以导频（或乘以其倒数）可以简化为极坐标相位处理中的实数加法；实际实现可以利用 CORDIC 算法进行极坐标转换。

对于短太阳导频，检测式（25）需要对接收矩阵相关区域计算模值，约需要 $(2k_{\max}+1)(l_{\max}+L_s+1)$ 次复数乘法；复增益粗估计式（26）只需要 $2\widetilde L$ 次实数加法。对于长太阳导频，相关检测需要约 $2(l_{\max}+1)(2k_{\max}+1)L_s$ 次实数加法，对相关矩阵取模需要 $(2k_{\max}+1)(l_{\max}+1)$ 次复数乘法，并可同时由式（29）得到复增益粗估计。对于分数多普勒，过采样操作增大了 DFT 尺寸 $N_o$。

如果用海面导频进行时延检测，式（30）相关运算只需 $L_a l_{\max}$ 次实数加法；太阳导频仍用于多普勒检测。复增益细化式（34）–（36）的运算以复数加法为主，复杂度为

$
N_I\left(L_aN+2L_a\widetilde L-L_a+
\frac{\widetilde L^2-\widetilde L}{2}\right),
$

其中 $N_I$ 为迭代次数，作者指出一次迭代即可充分发挥作用。该过程不需要额外的复数乘法。

**表 I：不同 OTFS 信道估计方法的复数乘法次数（依据原文）**

| 方法 | 复数乘法次数 |
|---|---|
| Sunscape（本文） | $(2k_{\max}+1)(l_{\max}+1)$ |
| Embedded Pilot [6] | $(2k_{\max}+1)(l_{\max}+1)+5L$ |
| SP-NI / SP-I [9] | $(L^2MN+L^2+L)+O(L^3)+L(MN+1)+L^2+O(N_{\rm IR}MNLS)$ |
| 迭代式 SP [19] | $O(N_{\rm IR}QMN\log(MN))$ |
| 单导频 ST [13] | $O(N_{\rm IR}MN\log(MN))$ |
| 部分导频 1 [21] | $O(N_{\rm IR}l_{\max}^2N^2P)+O(N_{\rm IR}N(2l_{\max}-1)LS)+O(N_{\rm IR}MNPS)$ |
| 部分导频 2 [22] | $O((NM)^3)$ |

原文的参考方案中，$S$ 为调制星座大小，$Q$ 为基扩展建模阶数，$N_{\rm IR}$ 是参考方案的迭代次数。与 EP 相比，Sunscape 的复数乘法代价相近，而具有更高的频谱效率和更低 PAPR；与需要 SIC 的 ST 方案相比，计算复杂度明显降低。

### B. Sunscape 参数联合优化

两项关键设计参数为太阳导频长度 $L_s$ 和分配给数据的功率比例 $\beta$。$L_s$ 决定检测性能和 PAPR，并通过 $L_a=M-L_s-l_{\max}$ 影响海面导频长度与增益细化 MSE。增大 $L_s$ 可以降低 PAPR，并改善相关检测；缩小 $L_s$ 可增大海面导频长度，改善复增益估计，但会使高功率太阳导频产生更高 PAPR。

**表 II：太阳导频长度与性能折中**

| 属性 | 短太阳导频 | 长太阳导频 |
|---|---|---|
| 长度 | $1\le L_s\le\lceil l_{\max}/(N-1)\rceil$ | $L_s>\lceil l_{\max}/(N-1)\rceil$ |
| 抽头检测 | 接收信号直接阈值 | 相关检测 |
| 海面导频数量 $L_a$ | 较多 | 较少 |
| 增益估计 MSE | 较低 | 较高 |
| PAPR | 较高 | 较低 |

为同时优化增益 MSE 与目标检测能力，作者构造如下非凸混合整数问题：

$
\min_{\beta,L_s}\quad
f_{\rm obj}(\beta,L_s)=
\frac{\mathrm{MSE}(\beta,L_s)}
{P_D(\beta,L_s)[1-P_{\rm FA}(\beta,L_s)]},\tag{51}
$

其约束包括：时域信号平均功率固定为 $P_{\max}$；叠加后 PAPR 不超过 $\mathrm{PAPR}_{\max}$；$L_s$ 为 $1$ 至 $M-l_{\max}-1$ 范围内的整数，$0\le\beta\le1$；$L_y$ 与 $L_a$ 的有效范围和隔离关系满足式（13）。分子鼓励较小的估计误差；分母同时奖励较高检测概率、惩罚虚警。

由于 $L_s$ 为离散变量、$\beta$ 为连续变量，且目标非凸，无法直接给出闭式最优解。作者采用**离线两阶段穷举启发式搜索**：外层枚举候选 $\beta$，内层枚举有效的 $L_s$；每组候选先根据太阳—海面隔离关系计算 $L_y$、$L_a$，生成归一化导频、计算 PAPR 并排除超限候选，再利用式（50）、（44）、（43）分别计算 MSE、$P_D$、$P_{\rm FA}$，最后选择目标函数最小的一组。

**算法 1：优化 $\beta$ 与 $L_s$**

1. 输入候选集合 $\mathcal B$、$\mathcal L$、最大功率 $P_{\max}$、PAPR 上限、最大时延 $l_{\max}$ 和网格大小 $M$；初始化 $f_{\rm obj}=\infty$。
2. 对每个 $\beta\in\mathcal B$，遍历每个 $L_s\in\mathcal L$。
3. 计算 $L_y=L_s+l_{\max}$，若 $L_y>M$ 则跳过；令 $L_a=M-L_y$。
4. 生成满足 $P_{\max}$ 的归一化导频信号 $\mathbf s_p$，计算当前 PAPR；超过上限则跳过。
5. 根据式（50）、（44）、（43）求出 MSE、$P_D$ 和 $P_{\rm FA}$；计算 $f_{\rm obj}'=\mathrm{MSE}/[P_D(1-P_{\rm FA})]$。
6. 若 $f_{\rm obj}'<f_{\rm obj}$，更新当前最优目标及 $(\beta^*,L_s^*)$，遍历结束后输出最优参数。

该优化只需按固定业务场景（目标检测概率、虚警率、MSE、PAPR 限制及最大时延扩展）离线执行一次，无须在每个 OTFS 帧上实时搜索。



## VI. 性能评估

本节通过仿真评价 Sunscape 导频模式与相应信道估计算法。首先评估离线优化算法能否为给定场景选择最优配置；然后比较计算复杂度和 PAPR；接着分别评价复信道增益估计 MSE、通信 BER 与感知目标检测性能；最后检验分数时延和分数多普勒情况下的鲁棒性。

由于参考 ST 方案中的部分迭代算法只适用于特定网格或计算代价极高，因此数值比较重点包括：在适用范围内与代表性 ST 算法比较复杂度和信道增益 MSE；在 BER 评价中则重点使用已建立的 EP 方法 [6]，因为它可以提供有意义的数据检测参考下界，并能检验非线性功率放大器存在时的实际系统表现。

**表 III：默认仿真参数**

| 参数 | 数值 |
|---|---|
| OTFS 网格 | $M=512$，$N=16$ |
| 传播路径数 | $L=4$ |
| 载频 | $f_c=4$ GHz |
| 最大归一化时延及对应物理时延 | $l_{\max}=4$，$\tau_{\max}=520.83$ ns |
| 子载波间隔 | $\Delta f=15$ kHz |
| 最大归一化多普勒及对应频移 | $k_{\max}=2$，$\nu_{\max}=1875$ Hz |
| 调制 | QPSK |
| 最大目标距离、速度 | $R_{\max}=156.25$ m，$V_{\max}=506.25$ km/h |
| 功率分配候选 | $\beta=0.8,0.85,0.9,0.95$ |
| 信道总功率、零填充长度 | $\sigma_h^2=1$，$L_{\rm ZP}=40$ |

除非另有说明，采用 SISO 系统。各路径归一化时延均匀分布于 $[0,l_{\max}]$；多普勒频移依据 Jakes 模型 $\nu_i=\nu_{\max}\cos\theta_i$ 生成，$\theta_i$ 为相应的到达角。作者指出，利用 ZC 序列结构将 Sunscape 扩展至 MIMO、多用户或多基站 OTFS 场景可能具有价值，但这不是当前仿真验证的范围。

### A. 叠加式 Sunscape 的最优设计

图 5 给出在表 III 参数下由算法 1 求解式（51）的结果。为考察较困难但仍具实际意义的场景，优化在 SNR 为 5 dB 时执行。得到的最优参数为

$$
L_s^*=50,\qquad \beta^*=0.8.
$$

后续仿真主要使用这组配置。其对应的信道增益 MSE 为 $10^{-4}$，检测概率 $P_D=0.8$，虚警概率 $P_{\rm FA}<10^{-6}$。离线设计使用此前推导的闭式分析表达式；其有效性在以下数值结果中进一步检验。

**图 5：** 目标函数随太阳导频长度 $L_s$ 的变化，对比不同的功率分配系数 $\beta$，并标出推荐配置。

### B. 计算复杂度

图 6 比较了 Sunscape 与多种 ST 方案在不同网格尺寸 $M$ 下需要的复数乘法数量。对文献 [9]、[13]、[19]、[21]，设调制星座大小 $S=4$、基扩展阶数 $Q=9$，多数参考方法的迭代次数 $N_{\rm IR}=5$，文献 [19] 则为 75；当 $M=1024$ 时设 $l_{\max}=80$，对于 $M=128$ 与 $16$ 相应缩放。

参考方法普遍依赖迭代过程或数据检测，因此需要大量复数乘法。即使小型网格上的计算量看似尚可，当 $M$ 提高到适合高时延（距离）分辨率的水平时，其开销会迅速上升，以致现实实现非常困难。Sunscape 的接收处理则不依赖迭代数据辅助 SIC，所以更适于较大的 OTFS 时延网格。

**图 6：** 各信道估计方法在不同网格大小 $M$ 下的复数乘法数量比较。

### C. 峰均功率比（PAPR）

图 7 和图 8 显示不同太阳导频长度下的 PAPR 性能，其中横轴 $\gamma_P$ 是高于平均功率的 dB 数。图 7 固定 $\beta^*=0.8$，比较多种 $L_s$、经典 EP、仅海面导频的 ST，以及网格中心采用单个高功率导频的单导频 ST [13]；同时画出了没有导频的 OTFS 信号作为参考。曲线对应完整发射时域信号，而不只是单独的导频分量。

现有覆盖整个网格的 ST 导频方案 [9] 可以避免额外增加 PAPR，却不能直接完成时延和多普勒检测，仍需借助 EP，从而重新引入功率峰值。传统 SLM 等降 PAPR 技术虽然可进一步改善峰值，却增加复杂度，而且原则上也可以作用于任意一种方案，因此没有作为本次比较的独立优势。

图 7 表明，延长太阳导频可以连续地调节 PAPR。足够长时，峰值受海面导频结构的性质支配，与式（22）的闭式条件一致。若进一步减少 $N$ 或减少导频功率比例 $1-\beta$，还可以降低 PAPR，但可能牺牲通信或感知性能。图 8 在超过阈值概率 $10^{-3}$ 的位置比较不同 $\beta$ 与 $L_s$ 的 PAPR，也显示了这种折中。

**图 7：** OTFS、EP、单导频 ST、仅海面导频和多个 Sunscape 太阳导频长度的 PAPR 超越概率，$\beta=0.8$。  
**图 8：** 在 $\Pr(\mathrm{PAPR}>\gamma_P)=10^{-3}$ 时，PAPR 阈值与太阳导频长度的关系，对比不同 $\beta$。

### D. 复信道增益估计 MSE

图 9 对整数多普勒情形的信道增益 MSE 进行比较，包括文献 [9] 的非迭代 SP-NI 与数据辅助迭代 SP-I 的分析下界，以及文献 [13] 的非数据辅助方法。图中还列出 Sunscape 自身的下界与传统 EP 参考。

由于 EP 为导频分配独立资源，其 MSE 在这些比较方法中最低；但代价是较高 PAPR 和导频开销，并造成频谱效率下降。Sunscape 借助海面导频形成的统计平均，不使用复杂 SIC 或数据辅助过程，也能获得相当准确的信道增益估计。当 $L_s=50$ 时，需要 $L_y=90$，剩余海面长度 $L_a$ 较短，因此 MSE 比 $L_s=1,2$ 略有退化；但后两种方案为微弱的 MSE 改善付出了较高 PAPR 代价。

**图 9：** Sunscape、EP 与 ST 参考方法在整数多普勒条件下，复信道增益估计 MSE 随 SNR 的变化。

### E. 误码率（BER）

图 10 比较整数时延、多普勒条件下的 BER，并考虑非线性高功率放大器（high-power amplifier，HPA）的影响。PAPR 在 HPA 存在时直接影响非线性失真与 BER。因此，图中包括不带 HPA 的理想 EP 参考；为了公平，也将实际 EP 的 PAPR 调整至与 Sunscape 相近；单导频 ST 则采用原文所述无信道增益细化、无 SIC 的基本配置。

结果表明，Sunscape 的 BER 接近理想 EP。对 $L_s=1$，在较高 SNR 处会出现较高误码平台；原因是功率集中在孤立太阳导频上，在数据检测前减去导频时，会放大残余信道估计误差。将长度改为 $L_s=2$ 可以降低误码平台，但无法完全消除。对 $L_s=50$ 使用 ZC 相关检测，则进一步减小导频与数据间的干扰，在高 SNR 区域明显改善 BER。

因此，与通信误码率表现优良的 EP 基准相比，该方法在明显降低导频开销、PAPR 和计算成本的同时保持接近的 BER，也避免了其他 ST 方法对昂贵干扰消除的依赖。

图 11 进一步采用文献 [21] 的配置进行比较：$M=128$、$N=16$、$f_c=3$ GHz、$l_{\max}=5$，Sunscape 设置为 $L_s=30$、$L_y=51$、$\beta=0.8$。在该配置下，Sunscape 与 EP 和已有 ST 方法相比，BER 相当或略优，同时计算复杂度明显更低。

**图 10：** 整数时延、多普勒条件下，Sunscape 与理想 EP、实际 EP 和单导频 ST 的 BER–SNR 曲线，部分方法考虑 HPA。  
**图 11：** 在文献 [21] 所采用的配置下，Sunscape 与 EP、其他 ST 方法的 BER–SNR 对照。

### F. 感知目标检测性能

图 12 比较不同 $L_s$ 的检测概率 $P_D$，并列出相应的虚警概率 $P_{\rm FA}$。太阳导频长度为 1 时，直接阈值检测的性能最好、计算成本最低，且未显著损害虚警率，但其 PAPR 较高。延长至 $L_s=2$，检测概率下降、虚警概率略增；在不使用相关处理的情况下进一步延长至 $L_s=3$，数据自干扰增加使性能继续退化。

长度为 50 的太阳 ZC 序列通过相关检测获得令人满意的检测效果，同时保持很低的虚警率和 PAPR。这说明可以借助 $L_s$ 与 $\beta$ 的配置，在功率峰值和感知性能之间进行权衡。极低 SNR 下的漏检与虚警主要涉及弱路径；强路径仍能可靠检测，加上海面导频平均带来的抑制效果，其对总体信道增益 MSE 的影响很小，与图 9 的观察一致。

**图 12：** Sunscape 不同太阳导频长度的目标检测概率 $P_D$–SNR 曲线，并标注对应虚警率。例如 $L_s=50$ 在 SNR 大于 0 dB 的区域可保持 $P_{\rm FA}<10^{-6}$。

### G. 分数时延、多普勒偏移下的性能

实际 OTFS 信道一般具有离网偏移，因此分数时延、多普勒会造成额外的网格失配与干扰。为了使用接近实际实现及 5G 数值配置的参数，作者在这部分采用

$$
M=1024,\quad N=64,\quad\beta=0.9,\quad
L_{\rm ZP}=80,\quad l_{\max}=40,
\qquad K=4,
$$

于是过采样网格大小为 $M_o=4M$、$N_o=4N$。

图 13 比较带分数偏移时 Sunscape 的信道增益 MSE 与代表性 EP、ST 方案。EP 由于使用隔离导频，能够达到很低的 MSE，但以明显增加的 PAPR 和较低频谱效率为代价。Sunscape 达到了与其他 ST 方法相当或更好的 MSE，并保持较低复杂度。

图 14 将整数网格、仅分数多普勒、以及同时存在分数时延和多普勒的条件进行比较，取 $L_s=200$。分数时延会使 MSE 略有退化；相反，海面导频的复增益细化几乎不受分数多普勒影响。这与第 IV-B 节的导频结构分析相符：海面导频在 DT 域只位于一个多载波符号上，不会受跨符号的多普勒演化影响。因而海面导频的增益细化可推广到离网场景。

图 15 进一步比较 BER，并与图 10 一样纳入非线性 HPA 和 EP 参考。即使存在分数时延、多普勒，Sunscape 仍能以较低 PAPR 和复杂度保持可靠的通信性能。

**图 13：** 分数时延、多普勒条件下，Sunscape 及其 MSE 下界与 EP、ST 参考的 MSE–SNR 曲线。  
**图 14：** $L_s=200$ 时，整数与分数时延/多普勒条件下的信道增益估计 MSE 比较。  
**图 15：** 分数偏移条件下，Sunscape、理想 EP、实际 EP 与单导频 ST 的 BER–SNR 曲线，部分方法包含 HPA。

## VII. 结论

本文针对基于 OTFS 的 ISAC，提出一种新的 DD 域叠加导频模式——Sunscape，并为其设计信道估计方法。Sunscape 包含孤立的“太阳”导频结构与周期性的“海面”导频结构：太阳导频支持整数与分数时延、多普勒的准确检测；海面导频则利用接收信号的统计特性，实现准确的复信道增益估计。在一定条件下，海面导频还可辅助改善时延检测。通过恰当的信号平均，能够同时抑制来自数据与噪声的自干扰。

为设计导频配置，本文建立同时最小化信道估计 MSE、改善目标检测能力的优化问题，并采用启发式离线搜索进行求解。仿真表明，与现有方法不同，所提方案在不依赖数据辅助干扰消除的情况下也能提供准确的信道估计，从而降低计算复杂度，并且可以通过结构参数调节 PAPR。

因此，Sunscape 导频及其相关信道估计方法可为高速通信与高分辨率雷达感知的联合实现提供实用方案，是面向 6G 及后续 ISAC 系统的一种候选技术。

> **终校状态：** 已补入第 VI–VII 节正文、图 5–15 的对应说明和表 III，形成 I–VII 节的主体译稿。参考文献清单、作者简介以及各公式和长表的最终逐项校对仍未完成，暂不标记为已验收全文。


## 参考文献（保留原文英文书目）

[1] J. Wang, N. Varshney, C. Gentile, S. Blandino, J. Chuang, and N. Golmie, “Integrated sensing and communication: Enabling techniques, applications, tools and data sets, standardization, and future directions,” *IEEE Internet Things J.*, vol. 9, no. 23, pp. 23416–23440, 2022.

[2] F. Liu, C. Masouros, A. P. Petropulu, H. Griffiths, and L. Hanzo, “Joint radar and communication design: Applications, state-of-the-art, and the road ahead,” *IEEE Trans. Commun.*, vol. 68, no. 6, pp. 3834–3862, 2020.

[3] Y. Ma, B. Ai, J. Yuan, S. Li, Q. Cheng, Z. Shi, W. Yuan, Z. Wei, A. Shafie, G. Ma, Y. Lu, M. Yang, and Z. Zhong, “Delay-doppler domain signal processing aided OFDM (DD-a-OFDM) for 6G and beyond,” 2025. [Online]. Available: https://arxiv.org/abs/2508.04253.

[4] L. Gaudio, G. Colavolpe, and G. Caire, “OTFS vs. OFDM in the presence of sparsity: A fair comparison,” *IEEE Trans. Wirel. Commun.*, vol. 21, no. 6, pp. 4410–4423, 2022.

[5] R. Hadani and A. Monk, “OTFS: A new generation of modulation addressing the challenges of 5G,” 2018.

[6] P. Raviteja, K. T. Phan, and Y. Hong, “Embedded pilot-aided channel estimation for OTFS in delay–doppler channels,” *IEEE Trans. Veh. Technol.*, vol. 68, no. 5, pp. 4906–4917, 2019.

[7] Y. Ma, G. Ma, N. Wang, Z. Zhong, and B. Ai, “OTFS-TSMA for massive internet of things in high-speed railway,” *IEEE Trans. Wirel. Commun.*, vol. 21, no. 1, pp. 519–531, 2022.

[8] A. Orozco-Lugo, M. Lara, and D. McLernon, “Channel estimation using implicit training,” *IEEE Trans. Signal Process.*, vol. 52, no. 1, pp. 240–254, 2004.

[9] H. B. Mishra, P. Singh, A. K. Prasad, and R. Budhiraja, “OTFS channel estimation and data detection designs with superimposed pilots,” *IEEE Trans. Wirel. Commun.*, vol. 21, no. 4, pp. 2258–2274, Apr. 2022.

[10] V. Yogesh, S. Rao Mattu, and A. Chockalingam, “Iterative channel estimation/detection for DZT-OTFS using superimposed pilot frames,” in *IEEE VTC-Spring*, 2024, pp. 1–6.

[11] W. Yuan, S. Li, Z. Wei, J. Yuan, and D. W. K. Ng, “Data-aided channel estimation for OTFS systems with a superimposed pilot and data transmission scheme,” *IEEE Wirel. Commun. Lett.*, vol. 10, no. 9, pp. 1954–1958, 2021.

[12] C. Yang, J. Wang, Z. Pan, and S. Shimamoto, “Delay-doppler frequency domain-aided superimposing pilot OTFS channel estimation based on deep learning,” in *IEEE VTC-Fall*, 2022, pp. 1–6.

[13] Y. Wu, C. Han, and Z. Chen, “DFT-spread orthogonal time frequency space system with superimposed pilots for terahertz integrated sensing and communication,” *IEEE Trans. Wirel. Commun.*, vol. 22, no. 11, pp. 7361–7376, 2023.

[14] Y. Kanazawa, H. Iimori, C. Pradhan, S. Malomsoky, and N. Ishikawa, “Multiple superimposed pilots for accurate channel estimation in orthogonal time frequency space modulation,” in *IEEE VTC-Fall*, 2023, pp. 1–5.

[15] F. Jesbin, S. Rao Mattu, and A. Chockalingam, “Sparse superimposed pilot based channel estimation in OTFS systems,” in *IEEE WCNC*, 2023, pp. 1–6.

[16] S. Rao Mattu and A. Chockalingam, “Fractional delay-doppler channel estimation in OTFS with sparse superimposed pilots using RNNs,” in *IEEE VTC-Spring*, 2023, pp. 1–6.

[17] M. Zhou, F. Chen, H. Yu, and J. Lu, “Iterative channel estimation for OTFS systems based on low-PAPR hybrid superimposed pilots,” *IEEE Commun. Lett.*, vol. 28, no. 8, pp. 1939–1943, 2024.

[18] M. A. Sheikh, A. Rajoriya, P. Singh, and R. Budhiraja, “Bayesian learning-aided channel estimators for superimposed-pilot based OTFS systems,” *IEEE Trans. Commun.*, pp. 1–1, 2024.

[19] F. Huang, Q. Guo, Y. Zhang, and Y. V. Zakharov, “Message passing-based joint channel estimation and signal detection for OTFS with superimposed pilots,” *IEEE Trans. Veh. Technol.*, vol. 73, no. 8, pp. 11531–11542, 2024.

[20] S. Kumari, H. B. Mishra, and S. Mukhopadhyay, “Peak-to-average power ratio analysis for embedded pilot and superimposed pilot aided OTFS waveform,” in *IEEE GCON*, 2023, pp. 1–6.

[21] A. Gao, H. Yu, and H. Wang, “OTFS channel estimation with superimposed pilots based on compressed sensing,” in *WCSP*, 2023, pp. 1114–1119.

[22] R. Ouchikh, A. Alssa–El–Bey, T. Chonavel, and N. Lassami, “Optimal partially superimposed pilot pattern for OTFS communication,” in *IEEE VTC-Spring*, 2024, pp. 01–05.

[23] Z. Chen, X. Zheng, and X. Chen, “Delay-wise superimposed pilot based compressed sensing channel estimation for OTFS systems,” in *IEEE VTC-Fall*, 2023, pp. 1–5.

[24] L. Méndez-Monsanto, K. Chen-Hu, M. J. Fernández-Getino García, and A. García Armada, “Robust integrated sensing and communications in delay-doppler domain using superimposed training,” in *IEEE Globecom Wkshps*, 2023, pp. 1404–1409.

[25] ——, “Deep learning-aided robust integrated sensing and communications with OTFS and superimposed training,” in *IEEE Meditcom*, 2023.

[26] Y. Hong, T. Thaj, and E. Viterbo, *Delay-Doppler Communications: Principles and Applications*. Elsevier, 2022.

[27] W. Shen, L. Dai, S. Han, I. Chih-Lin, and R. W. Heath, “Channel estimation for orthogonal time frequency space (OTFS) massive MIMO,” in *ICC*, 2019, pp. 1–6.

[28] P. Priya, E. Viterbo, and Y. Hong, “Low complexity MRC detection for OTFS receiver with oversampling,” *IEEE Trans. Wirel. Commun.*, vol. 23, no. 2, pp. 1459–1473, 2024.

[29] T. Bacchielli, L. Pucci, E. Paolini, and A. Giorgetti, “A low-complexity detector for OTFS-based sensing,” *IEEE Trans. Wirel. Commun.*, vol. 24, no. 6, pp. 5227–5240, 2025.

[30] D. Chu, “Polyphase codes with good periodic correlation properties (corresp.),” *IEEE Trans. Inf. Theory*, vol. 18, no. 4, pp. 531–532, 1972.

[31] Y. Jitsumatsu, “2D sinc interpolation-based fractional delay and doppler estimation using time and frequency shifted gaussian pulses,” in *ICAIIC*, 2025, pp. 0060–0065.

[32] R. Maršálek, R. Zedka, E. Zöchmann, J. Vychodil, R. Závorka, G. Ghiaasi, and J. Blumenstein, “Persistent homology approach for human presence detection from 60 GHz OTFS transmissions,” *Sensors*, vol. 23, no. 4, 2023.

[33] S. Verdú, “Spectral efficiency in the wideband regime,” *IEEE Trans. Inf. Theory*, vol. 48, no. 6, pp. 1319–1343, Jun. 2002.

[34] J. E. Volder, “The CORDIC trigonometric computing technique,” *IEEE Trans. Comput.*, vol. EC-8, no. 3, pp. 330–334, 1959.



## 作者简介（依据原文）

**Lianet Méndez-Monsanto**（IEEE 学生会员）分别于 2021 年、2023 年从西班牙马德里卡洛斯三世大学（UC3M）获得电信工程学士学位及电信工程与先进通信技术双硕士学位，目前在该校信号理论与通信系攻读博士。她获得 2024 年西班牙电信工程师专业协会最佳硕士论文奖及 2025 年 IEEE MeditCom 最佳论文奖。其研究兴趣包括无线通信信号处理、信道估计、波形、ISAC，以及利用 AI/ML 改善这些系统。

**Andrés Reyes-Castro**（IEEE 学生会员）在厄瓜多尔 EPN 大学获得电子与电信工程学士学位，并于西班牙马德里卡洛斯三世大学获得电信工程硕士学位，现于该校信号理论与通信系从事博士研究。研究涉及信号处理、通信波形及无线感知。

**Kun Chen-Hu**（IEEE 高级会员）在马德里卡洛斯三世大学从事通信与信号处理研究，并同时任职于西班牙阿尔卡拉大学信号理论与通信系。研究主题涉及无线通信、信号处理及 ISAC。

**María Julia Fernández-Getino García**（IEEE 会员）分别于 1996 年和 2001 年从马德里理工大学获得电信工程工程师学位和博士学位。她曾于贝尔实验室、瑞典隆德大学、意大利都灵理工大学及葡萄牙阿威罗大学进行学术访问，现任马德里卡洛斯三世大学教授。研究兴趣包括多载波通信、编码及无线系统信号处理。

**Ana García Armada**（IEEE Fellow）是马德里卡洛斯三世大学的通信学者，曾在南安普顿大学进行学术活动，已发表 300 余篇会议与期刊论文，拥有 7 项专利。研究兴趣为无线通信信号处理，曾参与 IEEE Globecom 2021 组织并担任大会主席，获得 IEEE ComSoc 多项服务奖项及其他学术奖励。

