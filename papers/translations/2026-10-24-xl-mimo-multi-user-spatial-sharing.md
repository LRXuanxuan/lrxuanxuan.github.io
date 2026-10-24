---
layout: page
title: "近场 XL-MIMO 多用户空间信息共享信道估计｜中文扩充译稿（终校中）"
permalink: /papers/translations/2026-10-24-xl-mimo-multi-user-spatial-sharing/
math: true
toc: true
---

[← 返回论文库](/papers/) · [IEEE DOI](https://doi.org/10.1109/TWC.2026.3702238)

# 通过多用户空间信息共享增强近场 XL-MIMO 信道估计

**原题：** Enhancing Near-Field XL-MIMO Channel Estimation via Multi-User Spatial Information Sharing  
**作者：** Zirou Liu、Yinglei Teng、An Liu、Wenkang Xu、Yangliu Zhao、Vincent K. N. Lau  
**期刊：** *IEEE Transactions on Wireless Communications*, Vol. 25, 2026，pp. 18700–18717。DOI: 10.1109/TWC.2026.3702238。  
**译稿范围：** 摘要、引言、系统模型、极域表示、三层稀疏先验及多用户联合支撑、IF-VBI、消息传递、公共网格更新、VR 检测及算法 1 的主要公式已补到式（48）。**附录 A–B 的主要推导已补至式（56），图 6–14 的结论、35 条英文参考文献及式（38）的完整等价分式已收录；附录式（50）–（51）的展开形式、算法逐行及数学记号仍待终校。** 未计入全文验收。

## 摘要

随着无线通信向更高用户密度和更复杂的环境演进，近场通信已成为重要研究焦点。然而，要以可管理的复杂度支持近场多用户接入，仍然面临关键挑战，尤其是球面波前效应与空间非平稳性（spatial non-stationarity，SnS）的耦合，使得利用用户信道之间的空间相关性变得困难。

为此，本文提出统一的多用户信道模型，利用联合支撑（joint support）刻画多个用户之间共享的结构化稀疏性。此外，提出二维 Markov 先验，以同时描述相邻网格点局部稀疏模式的连续性，以及共享支撑结构中的联合簇状稀疏性。在此基础上，设计空间信息共享辅助的框架，交替估计模型参数。具体而言，在信道估计模块中采用免矩阵求逆变分贝叶斯推断（inverse-free variational Bayesian inference，IF-VBI），避免高维矩阵求逆，并通过联合支撑实现用户间信息交换。在公共网格更新模块中，跨用户联合更新，以在整个空间域寻求最优；在联合可见区域（visibility region，VR）矩阵检测模块中，利用用户共享结构解耦 VR 矩阵并进行高效求解。

仿真结果验证了该方法的有效性，表明它能在多用户近场超大规模多输入多输出（XL-MIMO）系统中同时提升信道估计精度和计算效率。

**索引词：** 近场、多用户信道、联合支撑、XL-MIMO 系统。

## I. 引言

为支持新兴的第六代（6G）应用，系统在频谱效率、覆盖范围、峰值数据速率等核心性能指标上面临前所未有的要求。因此，高频通信（例如毫米波和太赫兹）以及 XL-MIMO 被认为是关键支撑技术 [1]。随着载频提高、天线阵列尺寸增大，Rayleigh 距离会显著增加，使传播环境从传统远场逐渐转向近场 [2]。

在近场条件下，电磁波传播从平面波转向球面波。同时，由于障碍物和有限散射，阵列上会出现 SnS：用户或散射体只能被部分天线感知 [3]。球面波前效应与 SnS 的共存会显著损害传统信道估计算法的性能，因为传统方法通常以远场平面波假设为基础。因此，需要针对可靠的 6G 通信开发更有效的近场信道估计方法。

球面波前效应是近场信道估计中的重要挑战。传统方法一般根据远场平面波假设，利用角度域稀疏性 [4]–[6]。然而，近场信道不仅由角度决定，还由基站与散射体或用户之间的距离决定 [2]、[7]。额外的距离依赖性使传统角度域表示产生能量泄漏，因此采用球面波模型更适合准确刻画传播过程。已有工作使用二阶 Taylor 展开构造抛物波近似 [8]，但不可避免地存在近似误差；随后提出基于球面波的码本，对角度和距离域进行均匀采样 [9]。进一步的极域稀疏码本采用混合采样策略 [10]：角度域均匀采样，距离域非均匀采样，相比完全均匀采样，能有效降低近场阵列响应向量的相关性。

SnS 则是另一项关键挑战。波前曲率会使阵列不同位置的信道统计特性并不一致 [11]。由于散射簇的位置、尺寸以及散射簇与阵列间的障碍物，一些散射簇只能被大规模阵列的某个子集观测，于是形成 VR [12]。这种性质导致天线域稀疏性，促使研究者设计利用该结构进行信号恢复的方法。已有工作通过天线—时延域的稀疏结构，利用分层块表示提出迭代稀疏贝叶斯学习（SBL）方法 [13]；进一步研究结合天线域空间相关性与 SnS 信道的波数域稀疏性，提出联合 VR 检测和信道估计框架，将 VR 检测导向消息传递（VRDO-MP）和基于信念的正交匹配追踪（BB-OMP）结合起来 [14]。

然而，现有近场信道估计研究主要集中于单用户场景，而实际通信系统还需要处理多用户接入 [15]–[17]，尤其要面对多个用户之间球面波前与 SnS 的耦合。在这类场景中，物理位置相近的用户通常共享部分散射体，使信道具有相似的空间特征和相关的稀疏模式 [18]。这些内在结构相似性为提升估计精度提供了机会 [19]。

针对多用户信道相关性，早期工作采用用户分组和聚类策略 [20]、[21]，将信道统计特性相近的用户集中起来进行联合处理。但是，固定的聚类边界会限制灵活性；当用户的 VR 只存在部分重叠时，估计性能可能显著下降 [22]。为克服这种刚性，研究者进一步提出将用户信道分解为共享稀疏模式和个体稀疏分量的灵活建模方式 [23]，通过层级先验 [24] 或混合模型 [25] 自适应捕获。然而，这些方法本质上面向远场角度域，隐含假设平面波前和全局平稳性，因此无法准确刻画距离相关相位变化，也难以描述局部化、用户特有的信道能量分布。

将传统联合处理方法直接迁移到近场多用户 XL-MIMO 会带来三方面挑战。第一，近场效应改变信道的空间特性，无法直接采用角度域稀疏性。第二，球面波前和 SnS 引入额外参数，估计过程中需要处理更加复杂的空间分布。第三，庞大天线阵列与高维矩阵计算带来的复杂度仍是 XL-MIMO 系统中的关键问题。

基于上述分析，本文设计了空间信息共享辅助的近场多用户信道估计框架。它利用相邻用户之间的空间信息共享，实现不依赖显式分组的多用户联合处理。主要贡献包括：

**统一的近场多用户信道模型。** 基于方位角、距离、VR 矩阵三类参数建立模型。VR 矩阵刻画天线阵列的 SnS；方位角和距离共同构造近场球面波前的极域网格。近场 VR 矩阵仅依赖空间位置，因此能够在用户之间共享，实现一致的多用户信道描述。

**用于多用户稀疏性的结构化先验。** 引入三层分层结构稀疏先验及联合支撑机制，捕获极域信道的结构化稀疏性和共享特征。该机制把不同用户的信道耦合起来，同时保留共享和个体空间信息。再采用二维 Markov 先验，通过调节转移概率灵活适配不同散射环境。

**空间信息共享辅助的估计框架。** 将多维参数估计划分为三个模块：利用 IF-VBI 估计用户稀疏信号，并通过消息传递交换联合支撑信息；采用梯度下降更新公共网格参数；利用空间共享特征通过矩阵变换解耦 VR 矩阵，进行多用户联合处理。三个模块分别实现支撑、网格和 VR 信息共享，通过交替优化，以可接受的计算成本实现高性能的多用户信道估计。

论文第 II 节介绍球面波与 SnS 近场多用户模型，第 III 节讨论极域稀疏表示及单用户/多用户分层先验，第 IV 节给出所提框架，第 V 节进行仿真，第 VI 节总结结论。

## II. 系统模型

研究一个多用户 XL-MIMO 系统的上行信道估计问题。基站使用 $M$ 根天线接收 $K$ 个单天线用户的上行信号，如图 1。为减少硬件复杂度并保持预编码灵活性，使用全连接混合结构。基站采用半波长天线间距的均匀线阵（ULA），波长为 $\lambda=c/f_c$，$f_c$ 是中心载频。混合结构具有 $M_{\rm RF}$ 条射频链，满足 $M_{\rm RF}\ll M$。不同用户分别发射正交导频。若第 $k$ 个用户的导频为 $\psi_k$，其接收信号表示为

$$
\mathbf y_k=\mathbf A\mathbf h_k\psi_k+\mathbf A\mathbf e_k,
\quad k=1,\ldots,K. \tag{1}
$$

其中 $\mathbf y_k\in\mathbb C^{M_{\rm RF}\times1}$ 是接收导频信号，$\mathbf h_k\in\mathbb C^{M\times1}$ 为用户 $k$ 的上行信道，$\mathbf e_k\sim\mathcal{CN}(\mathbf0,\gamma_k^{-1}\mathbf I_M)$ 是复高斯白噪声，$\mathbf A\in\mathbb C^{M_{\rm RF}\times M}$ 为恒模模拟相移矩阵。为简化信道估计，不失一般性地令单位功率导频 $\psi_k=1$，于是

$$
\mathbf y_k=\mathbf A\mathbf h_k+\mathbf n_k. \tag{2}
$$

其中 $\mathbf n_k=\mathbf A\mathbf e_k$ 为等效噪声。模拟合并矩阵 $\mathbf A$ 由归一化离散 Fourier 变换（DFT）矩阵中随机抽取的行构造，其第 $(g,h)$ 元素为 $M^{-1/2}\exp[j2\pi(g-1)(h-1)/M]$。由于 $\mathbf A$ 为半酉矩阵，$\mathbf A\mathbf A^H=\mathbf I_{M_{\rm RF}}$，所以 $\mathbf n_k$ 仍服从 $\mathcal{CN}(\mathbf0,\gamma_k^{-1}\mathbf I_{M_{\rm RF}})$。近场信道 $\mathbf h_k$ 同时受球面波前和 SnS 影响。

### A. 近场信道特性

**1）球面波前效应。** 对工作于高频段的 XL-MIMO，Rayleigh 距离可能达到数百米 [7]，用户和散射体因而容易落入近场区域。平面波前假设不再成立，阵列相位随天线索引的变化呈非线性。准确建模需要使用球面波传播，使阵列响应同时依赖用户方位与距离。

对于 ULA，在 $x$–$y$ 平面建立坐标系，忽略 $z$ 轴，将线阵中心放置于原点。第 $m$ 根天线坐标为 $\mathbf P_m=(p_m d,0)^\top$，其中 $p_m=m-(M+1)/2$，$d$ 为天线间距。假设空间域有 $L$ 条传播路径，只考虑最终一次传播。第 $l$ 条路径对应散射体的方位角为 $\theta_l$、距离为 $r_l$，其坐标 $\mathbf P_l=(r_l\cos\theta_l,r_l\sin\theta_l)^\top$。使用 Fresnel 近似，散射体到第 $m$ 根天线的距离为

$$
\begin{aligned}
\|\mathbf P_l-\mathbf P_m\|_2
&=\sqrt{(r_l\cos\theta_l-p_md)^2+(r_l\sin\theta_l)^2}\\
&\approx r_l-p_md\cos\theta_l+
\frac{p_m^2d^2\sin^2\theta_l}{2r_l}.
\end{aligned}\tag{3}
$$

令 $\vartheta=\cos\theta$，近场 ULA 阵列响应向量为

$$
\mathbf b(\vartheta_l,r_l)=\frac1{\sqrt M}
\left[
e^{-j\frac{2\pi}{\lambda}(\|\mathbf P_l-\mathbf P_1\|_2-r_l)},\ldots,
e^{-j\frac{2\pi}{\lambda}(\|\mathbf P_l-\mathbf P_M\|_2-r_l)}
\right]^\top. \tag{4}
$$

其第 $m$ 个元素的相位关于天线索引 $m$ 呈非线性，意味着传统角度域不再具有理想稀疏性。为解决这一问题，采用将近场信道变换到极域的码本表示。

**2）空间非平稳性。** XL-MIMO 信道具有典型 SnS：一个终端的可见区域只覆盖完整天线阵列的子集。不同阵列区段看到的散射体不同，因此接收功率也不同。为定量描述 SnS，采用基于 VR 的信道模型 [27]。

将大规模 ULA 分为 $N$ 个子阵列，每个子阵列含 $G$ 根天线，满足 $M=GN$。遵照已有研究，由于单个子阵列尺寸有限，将它视为局部空间平稳单元。第 $l$ 个散射体的 VR 向量为

$$
\mathbf v_l=[v_{l,1},v_{l,2},\ldots,v_{l,N}]^\top
\in\mathbb C^{N\times1}, \tag{5}
$$

其中 $v_{l,n}=1$ 当 $n\in\zeta_l$，否则为 0；$\zeta_l$ 为散射体 $l$ 可见的子阵列索引集合。

### B. 近场信道模型

结合球面波传播和 SnS，信道模型写为

$$
\mathbf h=\sum_{l=1}^{L}
x_l\,\mathbf b(\vartheta_l,r_l)\odot\mathbf w_l. \tag{6}
$$

这里 $x_l$ 是第 $l$ 条路径的复增益，$\mathbf w_l=\operatorname{vec}(\mathbf v_l\otimes\mathbf1_{G\times1})\in\mathbb C^{M\times1}$ 是从子阵列级 VR $\mathbf v_l$ 扩展出的天线级 VR 向量。

**图 1：** 近场信道模型。（a）极域和可见区域示意，包括共享散射体、各用户支撑与联合支撑；（b）用于描述天线和散射体位置的坐标系。

## III. 极域稀疏表示

### A. 统一的多用户极域表示

虽然 XL-MIMO 近场信道不再满足传统角度域稀疏性，仍可在极域中利用稀疏结构估计信道。采用 [10] 的极域码本，同时从方位角 $\vartheta$ 和距离 $r$ 两个维度采样。角度网格在 $[-1,1]$ 上均匀分布：

$$
\dot\vartheta_m=\frac{2m-M+1}{M},\qquad m=0,\ldots,M-1.
$$

根据 Fresnel 近似，对应的距离点采用非均匀采样 $\dot r_{p,m}=\frac1p Z_\Delta(1-\dot\vartheta_m^2)$，其中 $p=0,1,\ldots,P-1$ 是距离环索引，$P$ 为距离环数，$Z_\Delta$ 是定义极域采样边界的阈值距离，$\beta_\Delta$ 为控制采样密度的相干参数。

极域变换矩阵可由 $P$ 个子矩阵构成：

$$
\mathbf B=[\mathbf B_1,\mathbf B_2,\ldots,\mathbf B_P]
\in\mathbb C^{M\times MP}. \tag{7}
$$

$\mathbf B_p$ 包含某一距离环上按各角度采样得到的导向向量。初始极域网格可以表示为

$$
\dot{\boldsymbol\Omega}=
[(\dot\vartheta_{0:M-1},\dot r_1),\ldots,
(\dot\vartheta_{0:M-1},\dot r_P)]. \tag{8}
$$

网格总数为 $Q=M P$。当信号实际位置偏离离散网格时，会发生能量泄漏，导致估计精度下降。因此，本文将固定网格 $\dot{\boldsymbol\Omega}$ 用作动态网格的初值，并通过优化采样网格分布提高它与真实信号位置的对齐程度。动态极域网格写为

$$
\boldsymbol\Omega=[(\vartheta_1,r_1),\ldots,
(\vartheta_q,r_q),\ldots,(\vartheta_Q,r_Q)]. \tag{9}
$$

对应的变换矩阵 $\mathbf B(\boldsymbol\Omega)$ 由各网格点处的阵列响应向量构成。令 $\mathbf v_q\in\{0,1\}^{N\times1}$ 表示位于第 $q$ 个网格附近的散射体或用户的 VR。当网格足够细时，每个网格点可以解释为一个局部散射单元，与常用点散射体模型一致。对于空间延展的大反射体，可将其视为分布在若干相邻极域网格点上的局部散射单元集合。全部 VR 向量构成矩阵 $\mathbf V=[\mathbf v_1,\ldots,\mathbf v_Q]$，扩展到天线维后得到 $\mathbf W(\mathbf V)$。

在一个局部极域网格中，方位角、距离与可见状态变化较小，因此可以近似视为局部平稳。动态网格又可以自适应更新单元内的参数，从而更好地与真实信号位置对齐。

由此，第 $k$ 个用户的接收信号可写为

$$
\mathbf y_k=
\mathbf A[\mathbf B(\boldsymbol\Omega)\odot
\mathbf W(\mathbf V)]\mathbf x_k+\mathbf n_k. \tag{10}
$$

其中 $\mathbf x_k\in\mathbb C^{Q\times1}$ 是极域稀疏信道向量，只有少数元素非零。利用其稀疏性，就可以将估计问题交由压缩感知方法处理。

多用户情况下，VR 矩阵建立了物理空间域与天线子阵列域之间的耦合。联合处理公共网格与 VR 矩阵后，基站接收信号可统一表示为

$$
\mathbf Y=\mathbf A[\mathbf B(\boldsymbol\Omega)
\odot\mathbf W(\mathbf V)]\mathbf X+\mathbf n. \tag{11}
$$

其中 $\mathbf Y=[\mathbf y_1,\ldots,\mathbf y_K]$、$\mathbf X=[\mathbf x_1,\ldots,\mathbf x_K]$。$\boldsymbol\Omega$ 描述空间的极域网格，$\mathbf V$ 刻画各天线子阵列对空间网格点的响应。二者由几何位置、环境性质和基站阵列配置决定，并非分别为某个用户定制，因此可以跨用户共享。这种一致性有利于减少联合估计的参数量。

### B. 三层分层结构化稀疏先验

实际稀疏信号通常存在结构化依赖，使用独立同分布假设难以描述。受已有研究启发，本文提出分层概率框架，如图 2 所示，从单用户和多用户两种视角描述结构化稀疏性。

**1）单用户的稀疏先验。** 对于第 $k$ 个用户，稀疏信号 $\mathbf x_k$ 由支撑向量 $\mathbf s_k=[s_{k,1},\ldots,s_{k,Q}]^\top$ 及精度向量 $\boldsymbol\rho_k=[\rho_{k,1},\ldots,\rho_{k,Q}]^\top$ 参数化。二者构成三层概率关系 $\mathbf s_k\to\boldsymbol\rho_k\to\mathbf x_k$。相应联合先验为

$$
p(\mathbf x_k,\boldsymbol\rho_k,\mathbf s_k)
=p(\mathbf s_k)\,
p(\boldsymbol\rho_k\mid\mathbf s_k)\,
p(\mathbf x_k\mid\boldsymbol\rho_k). \tag{12}
$$

支撑向量表示信号哪些元素为非零。在单用户情形中，$\mathbf s_k$ 独立描述用户稀疏模式；多用户时，各用户支撑存在部分相似性，进而引出联合支撑 $\mathbf s$。

精度 $\rho_{k,q}$ 的分层先验采用两种 Gamma 分布，由 $s_{k,q}$ 选择：

$$
p(\boldsymbol\rho_k\mid\mathbf s_k)
=\prod_{q=1}^Q
\left[\Gamma(\rho_{k,q};a_q,b_q)^{s_{k,q}}
\Gamma(\rho_{k,q};\bar a_q,\bar b_q)^{1-s_{k,q}}\right]. \tag{13}
$$

当 $s_{k,q}=1$ 时，选择 $a_q/b_q=\mathbb E[\rho_{k,q}]=O(1)$，使 $x_{k,q}$ 保持有限方差；当 $s_{k,q}=0$ 时，选择 $\bar a_q/\bar b_q\gg1$，使信号方差接近零以强制稀疏。采用 Gamma 超先验一方面因为它是高斯精度的共轭先验，便于变分贝叶斯推断得到闭式更新；另一方面，Gamma 分布的形状和率参数可以灵活表征不同稀疏模式。

稀疏信号采用以零为均值、精度倒数为方差的条件复高斯先验：

$$
p(\mathbf x_k\mid\boldsymbol\rho_k)
=\prod_{q=1}^{Q}
\mathcal{CN}(x_{k,q};0,\rho_{k,q}^{-1}). \tag{14}
$$

未知真实分布时，高斯条件先验能够灵活描述随机信号，而且支持低复杂度 VBI 闭式更新。噪声精度也采用 Gamma 超先验：

$$
p(\gamma_k)=\Gamma(\gamma_k;\dot a,\dot b). \tag{15}
$$

令 $\dot a,\dot b\to0$ 可得到宽松先验。由此，三层模型结合了基于支撑的概率稀疏建模与分层先验的优点，也便于 Turbo-VBI 算法设计。

**2）多用户的联合稀疏模型。** 多用户的稀疏模式不只包含用户自身的信道特征，还反映不同用户之间的空间相关性，尤其是用户共享散射体时。为捕获这种结构化共享稀疏性，引入联合支撑。

联合支撑向量 $\mathbf s=[s_1,\ldots,s_Q]^\top\in\{0,1\}^{Q\times1}$ 标识物理区域中有散射体或用户的活跃网格点，融合共享和用户特有的信道特征。它由所有用户的支撑集合求并集得到：只要存在一个用户满足 $s_{k,q}=1$，就有 $s_q=1$；所有用户在该点均为零时，$s_q=0$。因此，联合分布可分解为

$$
p(\mathbf s_{1:K},\mathbf s)
=\prod_{k=1}^K p(\mathbf s_k\mid\mathbf s)\,p(\mathbf s)
=\prod_{k=1}^K\prod_{q=1}^Q
p(s_{k,q}\mid s_q)\,p(\mathbf s). \tag{16}
$$

给定联合支撑，用户自己的活跃概率由 $\phi_{k,q}$ 控制：当 $s_q=0$ 时只允许 $s_{k,q}=0$；当 $s_q=1$ 时，$s_{k,q}=1$ 的概率为 $\phi_{k,q}$，否则为 $1-\phi_{k,q}$。因此，$\phi_{k,q}$ 刻画用户之间路径重叠的程度，越大说明用户 $k$ 越可能共享在联合支撑中活跃的第 $q$ 条路径。

于是多用户的完整联合先验写为

$$
p(\mathbf x_{1:K},\boldsymbol\rho_{1:K},\mathbf s_{1:K},\mathbf s)
=p(\mathbf s_{1:K},\mathbf s)
\prod_{k=1}^K p(\boldsymbol\rho_k\mid\mathbf s_k)
\prod_{k=1}^K p(\mathbf x_k\mid\boldsymbol\rho_k). \tag{17}
$$

把 $\mathbf s$ 展开成 $P\times M$ 空间网格时，非零元素呈二维成簇稀疏。由于相邻网格位置接近，稀疏模式也通常相似。为建模此类相关性，采用二维 Markov 模型，利用上下左右相邻点的依赖关系：

$$
p(\mathbf s)=p(s_1)\prod_{q=2}^{Q}
p(s_q\mid s_{q-1},s_{q+1},s_{q-M},s_{q+M}). \tag{18}
$$

网格边界上不存在的相邻点应予忽略。二维 Markov 模型中，固定距离、角度变化的列构成 Markov 链；固定角度、距离变化的行也构成 Markov 链。对应转移概率分别为

$$
\begin{aligned}
p_{01}^{c}&=p(s_q=1\mid s_{q-1}=0), &(19\mathrm a)\\
p_{10}^{c}&=p(s_q=0\mid s_{q-1}=1), &(19\mathrm b)\\
p_{01}^{r}&=p(s_q=1\mid s_{q-M}=0), &(19\mathrm c)\\
p_{10}^{r}&=p(s_q=0\mid s_{q-M}=1). &(19\mathrm d)
\end{aligned}
$$

四个转移概率共同决定信道稀疏分布在空间上的连续性与成簇行为。较低转移概率强调平滑性，有利于估计连续区域；较高值可描述突变和分散分量。尤其是，较小的 $p_{01}^c$、$p_{01}^r$ 提高不同簇之间的平均间距，而较小的 $p_{10}^c$、$p_{10}^r$ 会增大平均簇尺寸。因此，模型可以灵活适配不同的成簇稀疏模式。文中采用对称配置 $\{p_{01}^c,p_{10}^c,p_{01}^r,p_{10}^r\}=\{0.025,0.025,0.025,0.025\}$，使行、列 Markov 链之间不引入方向偏置。

**图 2：** $K$ 个用户的三层稀疏先验。  
**图 3：** 空间信息共享框架的基本模块与模块间信息流。  
**图 4：** 联合分布的因子图；A 部分描述各用户观测内在结构，B 部分描述支撑向量及二维 Markov 联合支撑结构。

## IV. 空间信息共享辅助框架

该框架将信道、公共极域网格和 VR 矩阵分为三个模块交替估计，从而避免直接求解强耦合的多维联合优化问题。图 3 展示模块关系，图 4 展示联合分布因子图；整体更新在模块之间交换信息，以实现用户支撑、网格和空间可见性共享。

### A. 信道估计模块

该模块在给定公共极域网格和 VR 矩阵的情况下，对各用户的稀疏极域信道进行估计。采用免矩阵求逆变分贝叶斯推断（IF-VBI），避免传统变分更新中包含的大规模逆矩阵计算。通过三层先验以及 Turbo 风格的消息传递，把观测模块中的后验软信息传至支撑因子图，再将二维 Markov 联合支撑的外信息反馈给各用户估计，从而利用共享散射体提高估计精度。

IF-VBI 的关键工程意义在于：极域网格数 $Q$ 随阵列规模和采样精度快速增大，若每轮都计算 $Q\times Q$ 逆矩阵，复杂度和存储消耗都很高。通过利用模型结构和迭代近似，可避免高维求逆，并维持用户之间的支撑信息传递。

### B. 公共网格更新模块

初始固定极域网格与散射体真实位置一般不完全重合，导致 off-grid 能量泄漏。该模块在当前信道估计和 VR 结果的基础上，跨用户联合优化角度及距离网格参数。它不是为每个用户分别建立一套网格，而是根据整个空间区域内的共享几何结构，使用梯度下降更新公共网格。由此既减小网格失配，又避免单用户独立估计所造成的信息利用不足。

### C. 联合 VR 矩阵检测模块

VR 反映空间网格点对各子阵列的可见状态。考虑其二值性、联合共享性及块稀疏结构，该模块利用用户共享的空间位置依赖关系，对 VR 进行矩阵变换和解耦，再按块选取非零分量，以减少搜索和矩阵运算。三个模块交替执行，分别优化稀疏信道、极域网格以及 VR 可见状态。

**算法 1：** 空间信息共享辅助算法。原文包含分模块迭代、IF-VBI 消息更新、公共极域网格梯度更新和 VR 块检测的详细步骤；本译稿尚未逐行誊录完整伪代码与后续长公式，请以原始 PDF 为准。

### D. MAP 目标与完整空间信息共享算法（原文式（20）–（48））

**联合后验优化目标。** 由于联合支撑使多个用户的条件分布耦合，直接估计整个后验十分复杂。令 $\boldsymbol\xi_k=\{\mathbf x_k,\boldsymbol\rho_k,\mathbf s_k,\gamma_k\}$ 为用户 $k$ 的隐变量集合。作者寻求联合的最大后验（MAP）估计：

$
\widetilde{\boldsymbol\xi}_{1:K},\widetilde{\mathbf V},
\widetilde{\boldsymbol\Omega}
=\mathop{\arg\max}_{\boldsymbol\xi_{1:K},\mathbf V,\boldsymbol\Omega}
\ln p(\mathbf Y,\mathbf V,\boldsymbol\xi_{1:K},\mathbf s;
\boldsymbol\Omega). \tag{20}
$

引入统一的模块优化形式

$
\widetilde{\mathbf u}=\arg\max_{\mathbf u}f(\mathbf u),\tag{21}
$

$\mathbf u$ 分别取隐变量、极域网格与 VR 矩阵。三项子问题的目标为：信道估计最大化 $\ln p(\boldsymbol\xi_{1:K}\mid\mathbf Y;\boldsymbol\Omega,\mathbf V)$；公共网格最大化 $\ln p(\boldsymbol\Omega\mid\mathbf Y;\boldsymbol\xi_{1:K},\mathbf V)$；VR 则通过最小化联合观测残差解决。三个模块顺序迭代、彼此交换最新估计。

**1）信道估计与 Turbo 交互。** 固定当前 $\widetilde{\mathbf V}$、$\widetilde{\boldsymbol\Omega}$，将等效观测矩阵写为

$
\widetilde{\mathbf H}
=\mathbf A[\mathbf B(\widetilde{\boldsymbol\Omega})
\odot\mathbf W(\widetilde{\mathbf V})],\qquad
\mathbf y_k=\widetilde{\mathbf H}\mathbf x_k+\mathbf n_k. \tag{23}
$

传统 VBI 更新 $\mathbf x_k$ 时，协方差需要对 $Q\times Q$ 矩阵求逆，代价为 $O(Q^3)$。此外，联合因子图包含大量循环，直接使用和积消息传递常产生次优结果。因此作者采用 Turbo 结构，将因子图分为两个部分：A 部分处理各用户观测与局部稀疏后验，B 部分处理用户特有支撑和二维 Markov 联合支撑之间的关系。

在 A 部分，为每个支撑 $s_{k,q}$ 引入来自 B 部分的外信息因子 $h^A_{k,q}$；在 B 部分，引入来自 A 部分的外信息因子 $h^B_{k,q}$。它们分别由消息定义：

$
h^A_{k,q}=\mu_{u_{k,q}\to s_{k,q}},\qquad
h^B_{k,q}=\mu_{\eta_{k,q}\to s_{k,q}}. \tag{24}
$

一次 Turbo 迭代中，A 部分先以 $h^A$ 为先验执行 IF-VBI，得到近似后验边缘 $q(s_{k,q})$，再把不含该输入先验的外信息发给 B：

$
\mu_{\eta_{k,q}\to s_{k,q}}
\propto \frac{q(s_{k,q})}{h^A_{k,q}},
\qquad \forall k,q. \tag{25}
$

B 部分将该消息作为观测信息，经支撑图上的消息传递产生新的 $h^A$，如此循环至收敛。

**2）A 部分：IF-VBI。** 对用户 $k$ 的隐变量集合 $\boldsymbol\xi_k$，采用均值场分解 $q(\boldsymbol\xi_k)=\prod_{i\in\mathcal I}q(\xi_k^i)$。变分后验通过最大化证据下界（ELBO）获得：

$
\begin{aligned}
\arg\max_{q(\boldsymbol\xi_k)}\mathcal L(q_k)
&=\arg\max_q\int q(\boldsymbol\xi_k)
\ln\frac{p(\mathbf y_k,\boldsymbol\xi_k)}{q(\boldsymbol\xi_k)}
\,d\boldsymbol\xi_k\\
&=\arg\max_q\int q(\boldsymbol\xi_k)
\ln\frac{p(\mathbf y_k\mid\mathbf x_k,\gamma_k)
p(\boldsymbol\xi_k)}{q(\boldsymbol\xi_k)}
\,d\boldsymbol\xi_k .
\end{aligned}\tag{26}
$

固定其余因子的变分分布，单一因子的坐标更新为

$
q_i(\xi_k^i)=
\frac{\exp\left(\langle\ln p(\mathbf y_k,\boldsymbol\xi_k)
\rangle_{\prod_{j\ne i}q(\xi_k^j)}\right)}
{\int\exp\left(\langle\ln p(\mathbf y_k,\boldsymbol\xi_k)
\rangle_{\prod_{j\ne i}q(\xi_k^j)}\right)d\xi_k^i}. \tag{27}
$

直接更新 $q(\mathbf x_k)$ 所需协方差为
$\big(\langle\gamma_k\rangle\widetilde{\mathbf H}^H\widetilde{\mathbf H}
+\operatorname{diag}\langle\boldsymbol\rho_k\rangle\big)^{-1}$。
由于极域字典 $Q$ 很大，直接求逆不可承受。IF-VBI 通过引入辅助变量 $\mathbf z_k$ 和光滑二次上界来绕过它：

$
\begin{aligned}
p(\mathbf y_k\mid\mathbf x_k,\gamma_k)
&=\left(\frac{\gamma_k}{\pi}\right)^{M_{\rm RF}}
e^{-\gamma_k\|\mathbf y_k-\widetilde{\mathbf H}\mathbf x_k\|_2^2}\\
&\ge\left(\frac{\gamma_k}{\pi}\right)^{M_{\rm RF}}
e^{-\gamma_k g(\mathbf x_k,\mathbf z_k)}
=:\mathcal G(\mathbf y_k,\mathbf x_k,\gamma_k,\mathbf z_k).
\end{aligned}\tag{28}
$

其中

$
\begin{aligned}
g(\mathbf x_k,\mathbf z_k)
={}&\|\mathbf y_k-\widetilde{\mathbf H}\mathbf z_k\|_2^2\\
&+2\operatorname{Re}\{(\mathbf x_k-\mathbf z_k)^H
\widetilde{\mathbf H}^H(\widetilde{\mathbf H}\mathbf z_k-\mathbf y_k)\}\\
&+\tau\|\mathbf x_k-\mathbf z_k\|_2^2 .
\end{aligned}\tag{29}
$

$\tau I_Q\succeq\widetilde{\mathbf H}^H\widetilde{\mathbf H}$；有效选择为 $\tau=\lambda_{\max}(\widetilde{\mathbf H}^H\widetilde{\mathbf H})$。代回式（26），得到放松的 ELBO：

$
\widetilde{\mathcal L}(q_k,\mathbf z_k)
=\int q(\boldsymbol\xi_k)\ln
\frac{\mathcal G(\mathbf y_k,\mathbf z_k,\mathbf x_k,\gamma_k)
p(\boldsymbol\xi_k)}
{\breve h(\mathbf z_k)q(\boldsymbol\xi_k)}
\,d\boldsymbol\xi_k-\ln\breve h(\mathbf z_k)
\le \mathcal L(q_k). \tag{30}
$

其中 $\breve h(\mathbf z_k)$ 为原文定义的归一化因子。该放松目标在交替更新中发挥二次替代函数的作用；更新变分因子可视为 EM 中的 E 步，更新辅助变量是 M 步。作者指出，在光滑性条件下，二次替代与真实目标的差异是有界且会消失的三阶余项，随着 $\mathbf z_k\to\mathbf x_k$ 趋于零。这支持算法朝真实 ELBO 的驻点渐近收敛，而不仅是替代目标的驻点。

初始化时，支撑概率由来自 B 部分的伯努利消息给出：
$\pi_{k,q}=\mu_{u_{k,q}\to s_{k,q}}(1)/
[\mu_{u_{k,q}\to s_{k,q}}(1)+\mu_{u_{k,q}\to s_{k,q}}(0)]$。
将 $\pi_{k,q}$ 与 Gamma 先验形状率参数加权，可得
$\widetilde a_q=\pi_{k,q}a_q+(1-\pi_{k,q})\bar a_q$、
$\widetilde b_q=\pi_{k,q}b_q+(1-\pi_{k,q})\bar b_q$；随后迭代更新这些先验参数。

对于稀疏信号的变分分布，

$
\ln q(\mathbf x_k)\propto
\langle\ln\mathcal G\rangle_{q(\gamma_k)}
+\langle\ln p(\mathbf x_k\mid\boldsymbol\rho_k)\rangle_{q(\boldsymbol\rho_k)} .
\tag{31}
$

$q(\mathbf x_k)$ 为复高斯分布，其均值和协方差更新为

$
\begin{aligned}
\boldsymbol\mu_k&=
\boldsymbol\Sigma_k\langle\gamma_k\rangle
\left[\widetilde{\mathbf H}^H
(\mathbf y_k-\widetilde{\mathbf H}\mathbf z_k)+\tau\mathbf z_k\right],\\
\boldsymbol\Sigma_k&=
\left[\langle\gamma_k\rangle\tau I_Q+
\operatorname{diag}\langle\boldsymbol\rho_k\rangle\right]^{-1}.
\end{aligned}\tag{32}
$

式（32）虽形式上仍有逆矩阵，但被求逆矩阵**是对角矩阵**，故更新复杂度为线性阶。其他隐变量 $\boldsymbol\rho_k,\mathbf s_k,\gamma_k$ 的变分更新按相似方法得到，详细表达式复用原文引用 [28]。

固定当前变分分布，更新辅助变量：

$
\mathbf z_k^{\rm new}
=\arg\max_{\mathbf z_k}
\left\langle
\ln \mathcal G(\mathbf y_k,\mathbf z_k,\mathbf x_k,\gamma_k)
p(\boldsymbol\xi_k)
\right\rangle_{q(\boldsymbol\xi_k;\mathbf z_k^{\rm old})}. \tag{33}
$

令目标对 $\mathbf z_k$ 的导数为零，得到

$
\mathbf z_k^{\rm new}=\boldsymbol\mu_k. \tag{34}
$

这具有明确的贝叶斯解释：辅助变量匹配当前稀疏信号后验均值。

**3）B 部分：多用户—空间联合支撑的消息传递。** 令 $\bar s_q$ 表示联合支撑变量，$\phi_{k,q}$ 表示给定联合支撑活跃时用户 $k$ 活跃的概率。定义 B 部分输入 $\pi^B_{k,q}=h^B_{k,q}(s_{k,q}=1)$ 和输出 $\pi^A_{k,q}=h^A_{k,q}(s_{k,q}=1)$。因子 $u_{k,q}$ 把用户独立支撑与联合支撑连接起来。沿 $u_{k,q}\to\bar s_q$ 的消息为伯努利形式：

$
\mu_{u_{k,q}\to\bar s_q}
=\pi_{u_{k,q}\to\bar s_q}\delta(\bar s_q-1)
+[1-\pi_{u_{k,q}\to\bar s_q}]\delta(\bar s_q). \tag{35}
$

其中

$
\pi_{u_{k,q}\to\bar s_q}
=\left[
1+\frac{1-\pi^B_{k,q}}
{1+2\pi^B_{k,q}\phi_{k,q}-\phi_{k,q}-\pi^B_{k,q}}
\right]^{-1}. \tag{36}
$

为利用二维 Markov 性，联合支撑节点 $\bar s_q$ 与上、下、左、右相邻节点耦合。分别令 $\mu_q^a,\mu_q^b,\mu_q^l,\mu_q^r$ 为四个方向的入射伯努利消息，每个方向 $i\in\{a,b,l,r\}$ 均有

$
\mu_q^i=\kappa_q^i\delta(\bar s_q-1)
+(1-\kappa_q^i)\delta(\bar s_q), \tag{37}
$

上下方向的归一化分式在原文式（38）中给出。为避免在网页上重复四层乘积，定义下列与原式完全等价的缩写：

$
\begin{aligned}
A_1^a&=\prod_{k=1}^{K}\pi_{u_{k,q}\to\bar s_{q_a}}
\prod_{i\in\{a,l,r\}}\kappa_{q_a}^{i},&
A_0^a&=\prod_{k=1}^{K}(1-\pi_{u_{k,q}\to\bar s_{q_a}})
\prod_{i\in\{a,l,r\}}(1-\kappa_{q_a}^{i}),\\
A_1^b&=\prod_{k=1}^{K}\pi_{u_{k,q}\to\bar s_{q_b}}
\prod_{i\in\{b,l,r\}}\kappa_{q_b}^{i},&
A_0^b&=\prod_{k=1}^{K}(1-\pi_{u_{k,q}\to\bar s_{q_b}})
\prod_{i\in\{b,l,r\}}(1-\kappa_{q_b}^{i}).
\end{aligned}
$

于是，原论文分式严格等价于

$
\begin{aligned}
\kappa_q^a&=\frac{p_{11}^{c}A_1^a+p_{01}^{c}A_0^a}{A_1^a+A_0^a},\\
\kappa_q^b&=\frac{p_{11}^{c}A_1^b+p_{10}^{c}A_0^b}
{(p_{11}^{c}+p_{01}^{c})A_1^b+
(p_{00}^{c}+p_{10}^{c})A_0^b}.
\end{aligned}\tag{38}
$

其中 $p_{ij}^{c}$ 是列方向的 Markov 转移概率。对于左右两方向，使用行方向的 $p_{ij}^{r}$ 按同样方式计算；原论文没有单独展开它们的分式。上下分支由于消息入射方向不同而采用不同的转移概率组合，不能将两个分母机械写成相同形式。

融合其他用户以及四个邻居的消息，获得返回 $u_{k,q}$ 的联合支撑外信息：

$
\mu_{\bar s_q\to u_{k,q}}
=\pi_{\bar s_q\to u_{k,q}}\delta(\bar s_q-1)
+[1-\pi_{\bar s_q\to u_{k,q}}]\delta(\bar s_q). \tag{39}
$

令 $P_1=\prod_{j\ne k}\pi_{u_{j,q}\to\bar s_q}
\prod_{i\in\{a,b,l,r\}}\kappa_q^i$、
$P_0=\prod_{j\ne k}(1-\pi_{u_{j,q}\to\bar s_q})
\prod_{i\in\{a,b,l,r\}}(1-\kappa_q^i)$，则

$
\pi_{\bar s_q\to u_{k,q}}=\frac{P_1}{P_1+P_0}. \tag{40}
$

联合支撑反馈给用户支撑的消息为

$
\mu_{u_{k,q}\to s_{k,q}}
=\pi^A_{k,q}\delta(s_{k,q}-1)
+(1-\pi^A_{k,q})\delta(s_{k,q}),\quad
\pi^A_{k,q}=\pi_{\bar s_q\to u_{k,q}}\phi_{k,q}. \tag{41}
$

最终，联合支撑的近似边缘后验满足

$
p(\bar s_q\mid\mathbf Y,\mathbf V,\boldsymbol\Omega)
=\pi_{\bar s_q}\delta(\bar s_q-1)
+(1-\pi_{\bar s_q})\delta(\bar s_q), \tag{42}
$

其中 $\pi_{\bar s_q}
=\frac{\pi_{\bar s_q\to u_{k,q}}\pi_{u_{k,q}\to\bar s_q}}
{\pi_{\bar s_q\to u_{k,q}}\pi_{u_{k,q}\to\bar s_q}
+(1-\pi_{\bar s_q\to u_{k,q}})
(1-\pi_{u_{k,q}\to\bar s_q})}$。这一式子体现了同一联合网格点在多用户观测及空间 Markov 信息下逐渐形成后验共识的过程。

**4）公共极域网格更新。** 固定已经估计得到的 $\widetilde{\mathbf x}_{1:K}$、$\widetilde\gamma_{1:K}$ 和 $\widetilde{\mathbf V}$，应跨所有用户联合更新极域网格 $\boldsymbol\Omega$，避免每个用户的独立字典产生失配。定义目标

$
\mathcal L(\boldsymbol\Omega)
=\sum_{k=1}^{K}\widetilde\gamma_k
\|\mathbf y_k-\mathbf A[
\mathbf B(\boldsymbol\Omega)\odot\mathbf W(\widetilde{\mathbf V})]
\widetilde{\mathbf x}_k\|_2^2+C. \tag{43}
$

$C$ 与网格无关。目标非凸，因此采用迭代梯度下降。在第 $i+1$ 次迭代：

$
\begin{aligned}
\widetilde{\boldsymbol\vartheta}^{(i+1)}
&=\widetilde{\boldsymbol\vartheta}^{(i)}
-\epsilon_\vartheta\nabla_\vartheta
\mathcal L(\widetilde{\boldsymbol\vartheta},
\widetilde{\mathbf r}^{(i-1)}),\\
\frac1{\widetilde{\mathbf r}^{(i+1)}}
&=\frac1{\widetilde{\mathbf r}^{(i)}}
-\epsilon_{1/r}\nabla_{1/r}
\mathcal L(\widetilde{\boldsymbol\vartheta}^{(i)},
\widetilde{\mathbf r}).
\end{aligned}\tag{44}
$

步长 $\epsilon_\vartheta,\epsilon_{1/r}$ 根据 Armijo 准则动态选取。由于极域在 $1/r$ 上均匀采样，实际更新的是距离倒数而非距离本身；交替固定角度和距离相关变量，有助于稳定迭代。

**5）联合 VR 矩阵检测。** 利用跨用户相同网格点的可见状态，给定 $\widetilde{\mathbf x}_{1:K}$ 和 $\widetilde{\boldsymbol\Omega}$ 后，把各用户观测共同整理为

$
\mathbf Y=\mathbf F\mathbf V_{q,n}+\widetilde{\mathbf n}, \tag{45}
$

其中 $\mathbf V_{q,n}\in\mathbb C^{NQ\times1}$ 由所有网格点在 $N$ 个子阵列上的 VR 指示值堆叠而成，$\mathbf F=[\mathbf F_1^T,\ldots,\mathbf F_K^T]^T$ 是相应等效测量矩阵。各用户噪声的协方差为
$\operatorname{diag}(\widetilde\gamma_1^{-1}I_{M_{\rm RF}},\ldots,
\widetilde\gamma_K^{-1}I_{M_{\rm RF}})$。

由于稀疏信道估计中许多 $\widetilde x_{k,q}$ 近零，$\mathbf F$ 中有大量零列，直接求逆会病态。作者先进行极域筛选：以接近 2–3 倍噪声功率的阈值 $\epsilon$ 选择可能活跃的网格集合 $\Lambda$，只保留对应 VR 块的列。由于 VR 为二值实数，再把复数观测的实部与虚部堆叠，得到

$
\dot{\mathbf Y}=\dot{\mathbf F}\widetilde{\mathbf V}_{q,n}
+\dot{\mathbf n}. \tag{46}
$

点标记表示实值化后的量。利用 VR 块稀疏性，通过块正交匹配追踪（BOMP）求解

$
\min_{\widetilde{\mathbf V}_{q,n}}
\|\dot{\mathbf Y}-\dot{\mathbf F}
\widetilde{\mathbf V}_{q,n}\|_F^2. \tag{47}
$

每轮选择与当前残差 $\mathbf R$ 最相关的候选块：
$i^\star=\arg\max_i\|\dot{\mathbf F}_i^H\mathbf R\|_2$；
在已选块集合上以最小二乘更新系数。最终使用伪逆

$
\widetilde{\mathbf V}_{q,n}=
\dot{\mathbf F}^{\dagger}\dot{\mathbf Y}, \tag{48}
$

再逐元素以 0.5 为阈值硬判决（大于等于 0.5 判可见，否则不可见）。文中指出 Group LASSO、Turbo-VBI 等方法也可解决此类子问题，这里选择 BOMP 是出于实现简单的考虑。

**算法 1：空间信息共享辅助算法（23 行）。** 输入观测 $\mathbf Y$、初始极域网格 $\dot{\boldsymbol\Omega}$、停止阈值 $\epsilon$、内循环次数 $I_1,I_2$ 和外循环次数 $I_{\rm out}$。初始化 VR $\widetilde{\mathbf v}_q$ 和极域网格。在每轮外循环中，首先初始化 $\tau=\lambda_{\max}(\widetilde{\mathbf H}^H\widetilde{\mathbf H})$、$\mathbf z_k=\widetilde{\mathbf H}^H\mathbf y_k$。信道模块 A 反复按式（32）、（34）更新变分分布，直至收敛或达到 $I_1$ 次；把式（24）的外信息送到 B 部分，B 通过式（35）–（41）更新支撑消息，再由式（42）产生新的边缘后验传回 A。接下来按式（44）更新公共极域网格。最后初始化残差 $\mathbf R_0=\mathbf Y$，在 $I_2$ 轮以内或残差超过阈值时，按式（48）及 BOMP 更新 VR，并更新残差。外循环完成后返回 $\widetilde{\mathbf x}_{1:K}$、$\widetilde{\mathbf V}$、$\widetilde{\boldsymbol\Omega}$。

**6）计算复杂度。** IF-VBI 的对角逆及矩阵乘积在每轮复杂度为 $O(KM_{\rm RF}Q)$；B 部分的消息传递为线性运算。公共网格更新复杂度同样为 $O(KM_{\rm RF}Q)$。联合 VR 的 BOMP 轮次复杂度为 $O(KM_{\rm RF}|\Lambda|N)$。令 $I_1,I_2$ 为信道模块和 VR 模块的内部迭代次数，则每轮外循环复杂度为

$
O\!\left(I_1KM_{\rm RF}Q+
I_2KM_{\rm RF}|\Lambda|N+KM_{\rm RF}Q\right).
$

该表达式说明主导复杂度对用户数 $K$ 和网格数 $Q$ 为线性依赖；与之相比，Turbo-OAMP 存在 $O(Q^3)$ 项。具体比较和 CPU 运行时间在原文表 I 中列出。


## V. 仿真

作者采用多组仿真比较所提方法与基线，包括：

- **LMMSE：** 利用信道二阶统计量的传统线性最小均方误差估计器。
- **Turbo-P-OMP：** 采用极域正交匹配追踪，并联合估计信道与 VR，对极域网格进行梯度迭代更新。
- **Turbo-OAMP：** 利用用户间角度域相关性的 Turbo 正交近似消息传递方法；相比之下，本文模型捕获包含角度、距离和 VR 的更广义空间域依赖。
- **On-grid：** 固定极域网格的空间信息共享框架，用于消融动态网格更新的作用。
- **I.i.d. prior：** 为每个用户设置独立先验，不进行多用户支撑信息共享，用于消融结构先验和共享机制。

仿真采用高频 XL-MIMO 基站，配备 $M=512$ 根天线，载频 100 GHz，间距 $\lambda/2$，阵列划分为 $N=32$ 个子阵列；完整信道具有 SnS，子阵列内视为局部空间平稳。使用 100 MHz 工作带宽，用户发射功率归一为 1 W。**原论文将压缩比定义为 $\mathrm{CR}=M/M_{\rm RF}$**，不可误写为其倒数；信道生成采用 NF-SnS 模型。

主要性能指标为跨用户的平均归一化均方误差（NMSE），以及 VR 矩阵的失配比例（mismatch ratio）。后者比较真实与估计 VR 的各元素状态，以评价二值可见区域恢复质量。算法复杂度还通过理论阶数和平均 CPU 时间评价，MATLAB R2018b 运行环境为 Intel Core i5-12500H 2.50 GHz 处理器的笔记本。

表 I 比较计算复杂度与平均 CPU 耗时。所提方法的信道估计模块避免高维矩阵求逆，联合 VR 检测模块利用块稀疏结构按块筛选非零元素。主导复杂度项随用户数 $K$ 和网格大小 $Q$ 线性变化，对于近场极域需要大量角度—距离网格点的情况尤为重要。相比之下，Turbo-OAMP 对 $Q$ 具有三次复杂度依赖 $O(Q^3)$，因此网格变细后会出现较高开销。

**图 5：** 近场信道矩阵（子阵列域—极域），仅展示活跃网格以便观察；共享网格对应多个用户共同散射路径，个体网格则描述用户独有路径。  
**图 6：** NMSE 和 VR 失配比例的收敛性能。  
**图 7：** 不同信噪比下的平均 NMSE 和 VR 失配比例。


**表 I：不同算法的复杂度与平均 CPU 时间。** 原文使用 MATLAB R2018b，在 Intel Core i5-12500H 2.50 GHz 笔记本上计时。$I_1,I_2$ 表示所提方法信道估计和 VR 检测模块的内部迭代次数，$I_{\rm OMP},I_{\rm OAMP},I_{\rm BOMP}$ 为相应基线算法的迭代次数。

| 方法 | 主导计算复杂度 | CPU 时间（s） |
|---|---|---:|
| Proposed | $\mathcal O(I_1KM_{\rm RF}Q+I_2KM_{\rm RF}|\Lambda|N+KM_{\rm RF}Q)$ | **2.5219** |
| Proposed with on-grid | $\mathcal O(I_1KM_{\rm RF}Q+I_2KM_{\rm RF}|\Lambda|N)$ | **2.3520** |
| Turbo-P-OMP | 包含 OMP 字典搜索与 VR 估计的多轮矩阵运算 | **3.4456** |
| Turbo-OAMP | 包含 $\mathcal O(Q^3)$ 的矩阵计算 | **60.051289** |

所提方法的复杂度对用户数 $K$ 和网格大小 $Q$ 的主导依赖为线性形式（固定迭代次数和其他参数时）；Turbo-OAMP 在网格规模 $Q$ 上存在三次计算项，因而在稠密极域字典下运行时间显著增加。On-grid 不进行离网格参数优化，平均 CPU 时间略小，但需要承担网格失配的信道估计代价。


### A. 收敛行为

图 6 展示在不同信噪比下，所提算法的信道 NMSE 与 VR 失配比例随迭代次数变化的情况。信道估计和 VR 检测都在有限迭代次数内趋于稳定；同时，即使观测条件较差，通过在用户之间共享支撑信息，所提方法也能在迭代过程中利用空间相关性抑制估计误差。独立先验基线因没有使用多用户联合支撑，在低信噪比下尤为不利。

图中“收敛”对应数值误差随迭代趋于稳定；这与正文第 IV 节基于变分下界和模块交替优化的理论叙述相关，但并不自动意味着所求结果是非凸整体问题的全局最优解。

### B. 信噪比的影响

图 7 同时比较平均信道 NMSE 和 VR mismatch ratio。随着 SNR 提升，大部分方法的误差均下降；所提空间信息共享方法在不同信噪比下均具有较好性能，特别是低 SNR 时，联合支撑和二维 Markov 先验能够弥补稀疏、噪声较大观测的不足。Turbo-OAMP 只利用角度域的共享信息，而本文还共享距离和 VR 信息，因此在近场条件下具有更完整的结构先验。固定网格的 on-grid 消融通常受网格失配影响，说明公共极域网格动态更新的必要性。

### C. 子阵列配置的影响

图 8 研究每个子阵列天线数 $G$ 的变化。作者指出，在所考察的 $2^2$ 到 $2^6$ 根天线/子阵列范围内，可以把子阵列近似视为空间平稳单元。随着每个子阵列的天线数量增加，信道恢复精度通常提高：更多天线提供额外观测和信号冗余，增强抗噪性；更大的局部孔径也有助于提高空间分辨率，使算法更精确地捕获信道空间特征。与此同时，VR 检测所用的子阵列尺度也会改变，因而不应简单地把不同配置视为完全相同的测量问题。

### D. 用户数量的影响

图 9 分析相同散射环境中用户数的变化。用户数增加时，所提方法能够从不同用户中提取更多共享空间信息，信道估计因此改善。然而，当人数超过一定规模后，共享信息的边际增益逐渐下降，改善速度减缓，因为系统逐步达到可提取信息的上限。Turbo-OAMP 也能从额外信息冗余和角度域共享结构受益；Turbo-P-OMP 则是按用户独立处理，无法充分利用不同用户之间的公共散射体，因此改善较小。

### E. 公共传播路径数量的影响

图 10、11 研究公共路径数量。图 10 比较不同公共路径数量下各算法的平均 NMSE 和 VR 失配比例；图 11 则同时改变 SNR 和公共路径数量。随着用户共享的路径数增加，所提方法可以利用的联合支撑信息也随之增多。相比 Turbo-OAMP，本文方法同时利用方位角和距离域相关性，所以其性能改善更快且更明显。

虽然 i.i.d. 先验未显式利用多用户共享的空间支撑，但由于仍与公共 VR 矩阵和公共网格配合，也能从额外空间信息中获得一定改善。共享路径增加对于低 SNR 下的提升尤其明显，因为此时观测质量不足，需要更充分利用结构先验。

### F. 消融与参数设置

图 12 的消融结果显示：同时使用多用户联合支撑和二维 Markov 先验的完整方法，在全 SNR 区间内效果最好。低 SNR 时，不设置联合支撑、但保留每用户二维 Markov 先验的变体（No-joint-support），优于仅使用独立先验的 i.i.d. 版本，表明二维 Markov 能有效捕获极域中的簇状稀疏性。高 SNR 时，观测本身已经包含足够信道信息，单独使用二维 Markov 先验的增益会减弱。

图 13 在不同压缩比 CR 下比较算法。由于原文定义 $\mathrm{CR}=M/M_{\rm RF}$，较大的 CR 代表相对于天线数更少的 RF 链、也即更少观测。当 RF 链数量受限，VR 向量之间的耦合效应增强，估计表现下降；低 SNR 观测质量较差，因此对 RF 链不足尤为敏感。所提算法利用联合先验，在不同 CR 下仍能保持比较优势。

图 14 分析二维 Markov 转移概率与生成信道时实际使用的概率之间存在失配时的敏感性。左右子图分别固定一类行/列 Markov 链而改变另一类，研究中度和严重失配。轻度失配对 NMSE 及收敛曲线影响较小，显示一定稳健性；严重失配则会损害两种方向上的性能。通过在 EM 结构中自适应更新转移概率，可有效减轻这类失配，使方法对动态环境更稳健。

**图 6：** NMSE 与 VR mismatch ratio 随迭代变化。  
**图 7：** SNR 对平均 NMSE 与 VR mismatch ratio 的影响。  
**图 8：** 子阵列天线数的影响。  
**图 9：** 用户数对平均 NMSE 与 VR mismatch ratio 的影响。  
**图 10：** 公共路径数对平均 NMSE 与 VR mismatch ratio 的影响。  
**图 11：** SNR 与公共路径数的交互影响。  
**图 12：** 联合支撑与空间相关先验的消融实验。  
**图 13：** 在不同压缩比下，SNR 与 NMSE 的关系。  
**图 14：** 二维 Markov 转移概率设置对 NMSE 的影响。

## VI. 结论

本文针对近场多用户 XL-MIMO 提出信道估计方法。通过利用极域稀疏表示，采用三层结构化稀疏先验；多用户联合支撑把各用户信道耦合起来实现信息交换；使用二维 Markov 先验模拟联合支撑中的簇状稀疏结构，增强了对多用户空间结构的描述。基于这些思想，提出将 IF-VBI 与极域筛选结合的空间信息共享辅助框架，降低计算复杂度。仿真显示，所提方法通过利用不同用户之间共享的空间信息，在信道估计精度与运算复杂度方面均优于所列基线。未来可以研究更复杂的扩展散射体模型，使近场信道建模更接近真实物理环境，特别是宏观尺度散射体的几何尺寸对信道建模的影响。

## 附录 A：B 部分消息传递算法的推导

### A.1 式（35）的推导

使用和积消息传递的因子到变量更新规则，因子 $u_{k,q}$ 向联合支撑 $\bar s_q$ 发送消息：

$
\begin{aligned}
\mu_{u_{k,q}\to\bar s_q}
&=\sum_{\sim\{\bar s_q\}}
\mu_{s_{k,q}\to u_{k,q}}\,
u_{k,q}(s_{k,q},\bar s_q)\\
&\propto[(1-\pi_{k,q}^B)(1-\phi_{k,q})
+\pi_{k,q}^B\phi_{k,q}]\delta(\bar s_q-1)\\
&\quad +(1-\pi_{k,q}^B)\delta(\bar s_q)\\
&=\pi_{u_{k,q}\to\bar s_q}\delta(\bar s_q-1)
+(1-\pi_{u_{k,q}\to\bar s_q})\delta(\bar s_q).
\end{aligned}\tag{49}
$

归一化后，

$
\pi_{u_{k,q}\to\bar s_q}
=\frac{(1-\pi_{k,q}^B)(1-\phi_{k,q})+\pi_{k,q}^B\phi_{k,q}}
{(1-\pi_{k,q}^B)(1-\phi_{k,q})+\pi_{k,q}^B\phi_{k,q}
+(1-\pi_{k,q}^B)},
$

它与正文式（36）等价。

### A.2 式（37）、（39）的推导

来自上、下方向的 Markov 消息通过汇聚所有用户的因子消息与另外三个相邻方向的消息生成。对于上方相邻节点 $\bar s_{q_a}$，需排除其向当前节点传递的回路消息，结合来自其余邻居的信念，再按转移概率 $p_{00}^c,p_{01}^c,p_{10}^c,p_{11}^c$ 求和，得到

$
\mu_q^a=\kappa_q^a\delta(\bar s_q-1)
+(1-\kappa_q^a)\delta(\bar s_q). \tag{50}
$

下方邻居同理，得到

$
\mu_q^b=\kappa_q^b\delta(\bar s_q-1)
+(1-\kappa_q^b)\delta(\bar s_q). \tag{51}
$

其中 $\kappa_q^a,\kappa_q^b$ 的显式分子、分母由所有用户活跃消息的乘积、其他三个方向的活跃消息乘积及对应 Markov 转移概率相乘构成；式（38）在正文给出归一化形式。左右两个方向沿行 Markov 链采用同样规则。

将来自其他 $j\ne k$ 用户及四方向消息相乘，返回因子 $u_{k,q}$ 的联合支撑消息为

$
\begin{aligned}
\mu_{\bar s_q\to u_{k,q}}
&\propto
\left[\prod_{j\ne k}\pi_{u_{j,q}\to\bar s_q}
\prod_{i\in\{a,b,l,r\}}\kappa_q^i\right]\delta(\bar s_q-1)\\
&\quad+
\left[\prod_{j\ne k}(1-\pi_{u_{j,q}\to\bar s_q})
\prod_{i\in\{a,b,l,r\}}(1-\kappa_q^i)\right]\delta(\bar s_q)\\
&=\pi_{\bar s_q\to u_{k,q}}\delta(\bar s_q-1)
+(1-\pi_{\bar s_q\to u_{k,q}})\delta(\bar s_q).
\end{aligned}\tag{52}
$

### A.3 式（41）的推导

沿连接因子 $u_{k,q}$ 向用户特有支撑节点 $s_{k,q}$ 返回联合支撑信息：

$
\begin{aligned}
\mu_{u_{k,q}\to s_{k,q}}
&=\sum_{\sim\{s_{k,q}\}}
\mu_{\bar s_q\to u_{k,q}}\,
u_{k,q}(s_{k,q},\bar s_q)\\
&=\pi_{\bar s_q\to u_{k,q}}\phi_{k,q}\delta(s_{k,q}-1)\\
&\quad+\big[\pi_{\bar s_q\to u_{k,q}}(1-\phi_{k,q})
+(1-\pi_{\bar s_q\to u_{k,q}})\big]\delta(s_{k,q})\\
&=\pi_{k,q}^A\delta(s_{k,q}-1)
+(1-\pi_{k,q}^A)\delta(s_{k,q}).
\end{aligned}\tag{53}
$

即 $\pi_{k,q}^A=\pi_{\bar s_q\to u_{k,q}}\phi_{k,q}$。

## 附录 B：网格更新的推导

设 $\widetilde{\mathbf x}_k,\widetilde{\mathbf V},\widetilde\gamma_k$ 固定，利用线性运算构造有效观测矩阵 $\mathbf E_k$，使

$
\mathbf y_k=\mathbf E_k\mathbf B(\boldsymbol\Omega_{m,q})
+\widetilde{\mathbf n}_k.
$

$\mathbf E_k$ 与网格参数 $\boldsymbol\Omega$ 无关。第 $k$ 个用户的目标函数为
$\mathcal L_k(\boldsymbol\Omega)
=\widetilde\gamma_k\|\mathbf y_k-\mathbf E_k
\mathbf B(\boldsymbol\Omega_{m,q})\|_2^2$；
全体用户的联合梯度就是各 $\mathcal L_k$ 的梯度求和。

针对实值角度参数 $\vartheta$，对平方残差展开并求导，有

$
\begin{aligned}
\frac{\partial\mathcal L_k}{\partial\vartheta}
={}&\left(\frac{\partial\mathbf B}{\partial\vartheta}\right)^H
\mathbf E_k^H\widetilde\gamma_k
(\mathbf E_k\mathbf B-\mathbf y_k)\\
&+\big(\mathbf B^H\mathbf E_k^H-\mathbf y_k^H\big)
\widetilde\gamma_k\mathbf E_k
\frac{\partial\mathbf B}{\partial\vartheta}.
\end{aligned}\tag{54}
$

将同样推导应用到倒数距离参数，

$
\begin{aligned}
\frac{\partial\mathcal L_k}{\partial(1/r)}
={}&\left(\frac{\partial\mathbf B}{\partial(1/r)}\right)^H
\mathbf E_k^H\widetilde\gamma_k
(\mathbf E_k\mathbf B-\mathbf y_k)\\
&+\big(\mathbf B^H\mathbf E_k^H-\mathbf y_k^H\big)
\widetilde\gamma_k\mathbf E_k
\frac{\partial\mathbf B}{\partial(1/r)}.
\end{aligned}\tag{55}
$

对向量化极域字典中第 $(m,q)$ 个元素，在 Fresnel 近似下其关于角度和倒数距离的导数分别为

$
\begin{aligned}
\frac{\partial B_{m,q}}{\partial\vartheta_q}
&=j\frac{2\pi}{\lambda}
\left(p_m d+\frac{p_m^2d^2\vartheta_q}{r_q}\right)
\exp\left[-j\frac{2\pi}{\lambda}\left(
-p_md\vartheta_q+\frac{p_m^2d^2(1-\vartheta_q^2)}{2r_q}
\right)\right],\\
\frac{\partial B_{m,q}}{\partial(1/r_q)}
&=-j\frac{\pi}{\lambda}p_m^2d^2(1-\vartheta_q^2)
\exp\left[-j\frac{2\pi}{\lambda}\left(
-p_md\vartheta_q+\frac{p_m^2d^2(1-\vartheta_q^2)}{2r_q}
\right)\right].
\end{aligned}\tag{56}
$

这些梯度供正文式（44）的 Armijo 步长搜索和交替网格更新使用。



## 参考文献（英文原始题录）

依据用户提供的 IEEE 原版 PDF，完整录入文末 35 条英文参考文献，避免翻译题名造成检索歧义。

[1] M. Cui, Z. Wu, Y. Lu, X. Wei, and L. Dai, “Near-field MIMO communications for 6G: Fundamentals, challenges, potentials, and future directions,” IEEE Commun. Mag., vol. 61, no. 1, pp. 40–46, Jan. 2023.

[2] Y. Liu, Z. Wang, J. Xu, C. Ouyang, X. Mu, and R. Schober, “Nearfield communications: A tutorial review,” IEEE Open J. Commun. Soc., vol. 4, pp. 1999–2049, 2023.

[3] Z. Yuan, J. Zhang, Y. Ji, G. F. Pedersen, and W. Fan, “Spatial nonstationary near-field channel modeling and validation for massive MIMO systems,” IEEE Trans. Antennas Propag., vol. 71, no. 1, pp. 921–933, Jan. 2023.

[4] Y. Zhao, K. Zheng, Y. Teng, A. Liu, and V. K. N. Lau, “Spatial information aided joint UL/DL channel tracking for massive MIMO system in HST environment,” IEEE Trans. Veh. Technol., vol. 73, no. 10, pp. 14794–14808, Oct. 2024.

[5] S. Li, G. Cao, L. Jin, and H. Wu, “Channel estimation based on the PSS-MUSIC for millimeter-wave MIMO systems equipped with coprime arrays,” EURASIP J. Wireless Commun. Netw., vol. 2020, no. 1, pp. 1–11, Jan. 2020.

[6] T. Lin, X. Yu, Y. Zhu, and R. Schober, “Channel estimation for IRS- assisted millimeter-wave MIMO systems: Sparsity-inspired approaches,” IEEE Trans. Commun., vol. 70, no. 6, pp. 4078–4092, Jun. 2022.

[7] A. Hussain, A. Abdallah, and A. M. Eltawil, “Near-field channel estimation for ultra-massive MIMO antenna array with hybrid architecture,” in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), Apr. 2024, pp. 1–6.

[8] L. L. Magoarou, A. L. Calvez, and S. Paquelet, “Massive MIMO channel estimation taking into account spherical waves,” in Proc. IEEE 20th Int. Workshop Signal Process. Adv. Wireless Commun. (SPAWC), Jul. 2019, pp. 1–5.

[9] Y. Han, S. Jin, C.-K. Wen, and X. Ma, “Channel estimation for extremely large-scale massive MIMO systems,” IEEE Wireless Commun. Lett., vol. 9, no. 5, pp. 633–637, May 2020.

[10] M. Cui and L. Dai, “Channel estimation for extremely large-scale MIMO: Far-field or near-field?,” IEEE Trans. Commun., vol. 70, no. 4, pp. 2663–2677, Apr. 2022.

[11] Y. Zhu, H. Guo, and V. K. N. Lau, “Bayesian channel estimation in multi-user massive MIMO with extremely large antenna array,” IEEE Trans. Signal Process., vol. 69, pp. 5463–5478, 2021.

[12] Y. Chen and L. Dai, “Non-stationary channel estimation for extremely large-scale MIMO,” IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7683–7697, Jul. 2024.

[13] J. Chen, P. Zhang, N. Ma, and X. Xu, “Hierarchical-block sparse Bayesian learning for spatial non-stationary massive MIMO channel estimation,” IEEE Wireless Commun. Lett., vol. 11, no. 5, pp. 888–892, May 2022.

[14] A. Tang et al., “Joint visibility region and channel estimation for extremely large-scale MIMO systems,” IEEE Trans. Commun., vol. 72, no. 10, pp. 6087–6101, Oct. 2024.

[15] J. N. Pisharody, A. Rajoriya, and R. Budhiraja, “Near-field channel estimation for XL-MIMO systems using variational Bayesian learning,” IEEE Trans. Wireless Commun., vol. 23, no. 9, pp. 10740–10756, Sep. 2024.

[16] Y. Han, S. Jin, M. Matthaiou, T. Q. S. Quek, and C.-K. Wen, “Toward extra large-scale MIMO: New channel properties and low-cost designs,” IEEE Internet Things J., vol. 10, no. 16, pp. 14569–14594, Aug. 2023.

[17] L. Qiao et al., “Sensing user’s activity, channel, and location with nearfield extra-large-scale MIMO,” IEEE Trans. Commun., vol. 72, no. 2, pp. 890–906, Feb. 2024.

[18] F. Kulsoom, A. Vizziello, H. N. Chaudhry, and P. Savazzi, “Joint sparse channel recovery with quantized feedback for multi-user massive MIMO systems,” IEEE Access, vol. 8, pp. 11046–11060, 2020.

[19] A. Liu, L. Lian, V. K. N. Lau, and X. Yuan, “Downlink channel estimation in multiuser massive MIMO with hidden Markovian sparsity,” IEEE Trans. Signal Process., vol. 66, no. 18, pp. 4796–4810, Sep. 2018.

[20] M. J. Azizipour and K. Mohamed-Pour, “Channel estimation for FDD multi-user massive MIMO systems: A greedy approach based on user clustering,” IET Signal Process., vol. 13, no. 9, pp. 778–786, Dec. 2019.

[21] Y. Bao, B. Yu, B. Yin, X. Luo, and X. Lu, “Resource allocation for joint communication and localization systems with MU-MIMO,” IEEE Access, vol. 10, pp. 124649–124662, 2022.

[22] J. Dai, A. Liu, and V. K. N. Lau, “Joint channel estimation and user grouping for massive MIMO systems,” IEEE Trans. Signal Process., vol. 67, no. 3, pp. 622–637, Feb. 2019.

[23] J.-C. Jiang and H.-M. Wang, “Grouping-based joint active user detection and channel estimation with massive MIMO,” IEEE Trans. Wireless Commun., vol. 21, no. 4, pp. 2305–2319, Apr. 2022.

[24] X. Cheng, K. Xu, J. Sun, and S. Li, “Adaptive grouping sparse Bayesian learning for channel estimation in non-stationary uplink massive MIMO systems,” IEEE Trans. Wireless Commun., vol. 18, no. 8, pp. 4184–4198, Aug. 2019.

[25] A. Rajoriya, R. Budhiraja, and L. Hanzo, “Centralized and decentralized channel estimation in FDD multi-user massive MIMO systems,” IEEE Trans. Veh. Technol., vol. 71, no. 7, pp. 7325–7342, Jul. 2022.

[26] M. Delbari, G. C. Alexandropoulos, R. Schober, H. V. Poor, and V. Jamali, “Near-field multipath MIMO channel model for imperfect surface reflection,” 2024, arXiv:2409.17041.

[27] W. Xu, A. Liu, M.-J. Zhao, and G. Caire, “Joint visibility region detection and channel estimation for XL-MIMO systems via alternating MAP,” IEEE Trans. Signal Process., vol. 72, pp. 4827–4842, 2024.

[28] A. Liu, G. Liu, L. Lian, V. K. N. Lau, and M.-J. Zhao, “Robust recovery of structured sparse signals with uncertain sensing matrix: A turbo-VBI approach,” IEEE Trans. Wireless Commun., vol. 19, no. 5, pp. 3185–3198, May 2020.

[29] W. Xu, Y. Xiao, A. Liu, M. Lei, and M.-J. Zhao, “Joint scattering environment sensing and channel estimation based on non-stationary Markov random field,” IEEE Trans. Wireless Commun., vol. 23, no. 5, pp. 3903–3917, May 2024.

[30] D. G. Tzikas, A. C. Likas, and N. P. Galatsanos, “The variational approximation for Bayesian inference,” IEEE Signal Process. Mag., vol. 25, no. 6, pp. 131–146, Nov. 2008.

[31] E. Fornasini, “2D Markov chains,” Linear Algebra its Appl., vol. 140, pp. 101–127, Oct. 1990.

[32] H. Duan, L. Yang, J. Fang, and H. Li, “Fast inverse-free sparse Bayesian learning via relaxed evidence lower bound maximization,” IEEE Signal Process. Lett., vol. 24, no. 6, pp. 774–778, Jun. 2017.

[33] J. Ziniel and P. Schniter, “Dynamic compressive sensing of time-varying signals via approximate message passing,” IEEE Trans. Signal Process., vol. 61, no. 21, pp. 5270–5284, Nov. 2013.

[34] F. R. Kschischang, B. J. Frey, and H.-A. Loeliger, “Factor graphs and the sum-product algorithm,” IEEE Trans. Inf. Theory, vol. 47, no. 2, pp. 498–519, Feb. 2001.

[35] T. Gao, P. Tang, L. Tian, H. Miao, and Z. Yuan, “A 3GPP-like channel simulation framework considering near-field spatial non-stationary characteristics of massive MIMO,” in Proc. IEEE Globecom Workshops (GC Wkshps), Dec. 2023, pp. 1493–1498.

## 尚待对照原版补齐

该 18 页 TWC 原文的正文 I–VI、原编号（1）–（56）的主要推导、仿真图 1–14 的文字说明、附录 A–B 与 35 条英文参考文献均已纳入本页。仍需逐字核对二维 Markov 消息的若干复杂归一化分式（尤其原式（50）–（51））、算法 1 的每行伪代码、若干原图的数值标注及物理符号。**本页面尚未通过逐页逐式终校，不能作为已验收的完整译本或严格复现的唯一依据。**

研究使用时请核对[原 DOI 页面](https://doi.org/10.1109/TWC.2026.3702238)提供的 IEEE 原版 PDF。