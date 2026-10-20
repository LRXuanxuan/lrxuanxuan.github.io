---
layout: page
title: "跨帧 OTFS 超高速移动信道估计｜中文逐节译稿（逐式校对中）"
permalink: /papers/translations/2026-10-20-cross-frame-otfs-ultra-high-mobility/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [IEEE 原文](https://doi.org/10.1109/TWC.2026.3668101)

# 超高速移动条件下跨帧 OTFS 系统的信道估计

**原题：** Channel Estimation in Cross-Frame OTFS System With Ultra-High Mobility  
**作者：** Zhenyu Zhang、Qianli Wang、Gang Liu、Pingzhi Fan、FeiFei Gao  
**来源：** IEEE Transactions on Wireless Communications，2026，DOI: 10.1109/TWC.2026.3668101。  
**翻译进度：** 已覆盖摘要、正文 I–VI、主要公式、算法 1、图 1–8、表 I–V 的说明及附录 A–B 的核心推导；部分长公式、完整表格及参考文献作者简介仍待逐页逐项终校，尚未通过完整全文 QA。

## 摘要

在即将到来的下一代无线通信系统中，支持高速移动是一项基本要求。正交时频空（Orthogonal Time Frequency Space，OTFS）调制由于对高速移动场景具有较强的鲁棒性，被视为 6G 系统的候选波形。然而，当移动速度极高、引起的多普勒扩展超过子载波间隔时，OTFS 的性能会下降。本文将这种情况称为**超范围多普勒（out-of-range Doppler，OD）信道**。

本文分析 OD 信道下的输入—输出关系，揭示时延—多普勒（delay-Doppler，DD）域接收信号可表示为发射信号叠加额外相位项的形式。基于这一认识，设计跨帧 OTFS 信道估计框架，通过互素子帧配置观测信道在不同子帧中的响应差异，并运用中国剩余定理（Chinese Remainder Theorem，CRT）恢复超范围参数。此外，针对多径场景，提出一种有效的信道估计方法：利用分数参数及幅度信息分解子帧、匹配响应抽头，再对 DD 域信号分层处理，将 OD 信道估计问题转化为多个单一域的估计问题。仿真结果表明，所提方法能够有效估计 OD 信道，其性能优于在这类条件下失效的既有方法。

**关键词：** OTFS；时延—多普勒域；信道估计；高速移动信道。

## I. 引言

下一代无线通信预计将支持相对运动速度达到或超过 1000 km/h 的高速移动场景 [1]、[2]，由此衍生了低地球轨道（LEO）卫星通信 [3]、高速铁路（HSR）通信 [4] 和临近空间通信 [5]、[6] 等应用。

近年来提出的 OTFS 波形 [7] 因具有抵抗高速移动影响的能力而被认为是 6G 的候选方案。与 4G、5G 系统常见的正交频分复用（OFDM）等多载波调制方式不同，OTFS 在二维 DD 域中调制通信符号，因此对具有显著多普勒频移的时变信道具有更强抵抗能力。

已有研究比较了 OTFS 与 OFDM 在双选择性信道下的性能。Raviteja 等分析了 OTFS 的输入—输出关系，并设计消息传递（MP）符号检测算法，证明 OTFS 在高速移动环境下具有更好的误码率性能 [8]、[9]。文献 [10] 分析了 OTFS 的分集性能，证明 OTFS 能在 DD 域获得充分分集，且多输入多输出 OTFS 的渐近分集阶数等于接收天线数。文献 [11] 研究 OTFS 的条件成对错误概率及性能上界，并通过最优码设计准则提高编码增益。

实现这些潜在增益的前提是获得准确的信道状态信息（CSI）。OTFS 性能高度依赖 DD 域信道估计的精度。文献 [12] 提出经典的 OTFS 导频信道估计及导频设计，将导频符号放置于 DD 域保护区，通过导频推断数据符号对应的信道响应。文献 [13] 为多天线 OTFS 提出利用完美阵列的二维导频估计方案，仿真表明在 DD 域采用码分复用可获得更好的归一化均方误差（NMSE）性能。由于保护区会限制频谱效率，也有工作研究导频与数据叠加传输：文献 [14] 首先利用导频完成粗估计，再利用数据符号精细化估计。

原始 DD 域通常具有稀疏结构，因为每个冲激对应一个多径分量 [15]。然而，有限的时频资源限制了 DD 域分辨率，使得接收信号中的冲激呈现分数参数并扩散至整个 DD 域，导致稀疏性丧失。针对这一问题，文献 [16] 将信道估计表述为稀疏信号恢复问题，结合贝叶斯处理与消息传递算法，并推导 Cramér–Rao 下界（CRLB）。文献 [17] 采用离网稀疏贝叶斯推断（off-grid sparse Bayesian inference，OGSBI），提出一维和二维信道估计方法，使估计的信道不必受原有网格点约束；文献 [18] 进一步研究网格演化所带来的估计性能与计算复杂度折中。利用 DD 域稀疏性已成为现有 OTFS 信道估计的一条重要研究路线。

尽管现有方法具有较好性能，它们一般假设多普勒频移不会超出子载波间隔。未来系统使用毫米波、太赫兹等更高频段时，高速移动引起的多普勒效应更加严重。原文表 I 列举了高频率与超高速移动应用中的典型载频和相对速度；表 II 基于 3GPP [19] 频段配置，给出了 OTFS 在不同载频下所能承受的速度，并考虑了通信感知一体化（ISAC）中的更强多普勒效应。

在 3GPP 规定的毫米波频段中，较高相对速度便可能导致不可容忍的多普勒频移；对于更高频段或更大相对速度的场景，问题更加明显。此时多普勒超出子载波间隔，形成 OD 信道。传统 OTFS 信道估计方法会失效，因为 OD 信道的接收信号与范围内信道有根本差异，导频处估计的响应不再能可靠预测数据符号，这在 [22] 中被称为不可预测信道。此外，接收信号的稀疏性遭到破坏，估计性能显著退化。据作者所知，尚不存在专门针对 OD 信道的成熟估计方案。

增大子载波间隔虽然可以缓解超范围现象，却会明显增加循环前缀（CP）开销并降低频谱效率，在高频段尤其如此。因此，需要更根本的方案来处理高频、高速 6G 环境中可能出现的 OD 效应。

本文提出面向 OD 信道的跨帧 OTFS 估计方法。对于同一路径在不同子帧中具有相近幅度和分数参数这一性质，首先分解子帧并利用分数信息与幅度信息匹配同一路径的响应抽头。采用不同帧配置后，超范围信道在子帧中呈现不同响应，从而能够借助 CRT 估计真实多普勒。随后按照 OD 参数将接收信号分层，在每一层恢复稀疏性并完成估计。

本文主要贡献如下：

1. 推导 OD 信道下 TF 域和 DD 域接收信号的闭式表达式。TF 域的接收信号可视为经历循环移位并携带额外相位的发射信号叠加；DD 域的响应位置与范围内信道一致，但沿时延轴引入额外相位项。
2. 设计具有不同子载波数和时隙数的跨帧 OD 信道估计框架。通过合理配置子帧结构，使相同 OD 路径呈现不同响应，再通过 CRT 恢复实际信道参数。
3. 利用分数参数与幅度信息分解子帧、匹配路径，计算每个采样点的超范围状态，并据此分层处理 DD 域信号。仿真验证了该方案在 OD 条件下进行信道估计的有效性。

## II. 系统模型

### A. 超范围多普勒信道与时域信号模型

以往工作 [23]、[24] 通常假设线性时变（LTV）信道的最大多普勒频移小于多载波波形的子载波间隔。这也是 Zak-OTFS 结晶条件 [22] 的组成部分，即

$$
\tau_i<T,\qquad |\nu_i|<\frac{\Delta f}{2}. \tag{1}
$$

其中，$\Delta f$ 为子载波间隔，$T$ 为时隙长度，$\tau_i$、$\nu_i$ 分别为第 $i$ 条路径的时延和多普勒频移。随着工作频段升高至毫米波或太赫兹，表 II 表明 OTFS 可容忍的移动速度逐渐降低，上述条件可能不再成立。此时的接收信号与范围内信道明显不同，常规模型不能准确描述这种偏差，需要进一步研究信道特性。

考虑收发两端均为单天线的 OTFS 系统。无线信道采用双选择性衰落模型：

$$
h(\tau,\nu)=\sum_{i=1}^{P}h_i\delta(\tau-\tau_i)\delta(\nu-\nu_i). \tag{2}
$$

其中 $P$ 为散射路径数量，$h_i$ 为第 $i$ 条路径的复增益。令发射基带信号为 $s(t)$，通过时变信道并完成上、下变频后，接收基带信号为

$$
r(t)=\iint h(\tau,\nu)s(t-\tau)e^{j2\pi(t-\tau)\nu}\,d\tau\,d\nu
=\sum_{i=1}^{P}h_i s(t-\tau_i)e^{j2\pi(t-\tau_i)\nu_i}. \tag{3}
$$

在超范围情形，即 $|\nu_i|\geq\Delta f/2$ 时，按照时延和多普勒分辨率归一化：

$$
\tau_i=\frac{l_i}{M\Delta f},\qquad
\nu_i=\frac{\psi_iMN+\phi_iN+\check{k}_i}{NT}. \tag{4}
$$

这里 $M,N$ 分别是子载波数与时隙数。多普勒可以分解为超范围部分 $\phi_i$、范围内部分 $\check{k}_i$ 以及 $\psi_i$ 部分。由于 $\psi_i$ 对应信号带宽的整数倍，在采样频率 $f_s=M\Delta f$ 下不会影响接收信号，因而属于不可有效辨识部分。文中规定 $\psi_i\in\mathbb Z$、$\phi_i\in\{-M+1,\ldots,M-1\}$、$-N/2\leq\check{k}_i<N/2$，并有 $l_i\leq M-1$。$l_i$ 和 $\check{k}_i$ 均不要求为整数。

**图 1：** DD 域超范围多普勒信道示意。真实多普勒域可看成范围内部分和多个超范围带的组合。采用带通采样 $f_s=M\Delta f$ 后，式（5）给出离散接收信号；$q=0,1,\ldots,NM-1$ 表示采样时刻。

### B. 超范围多普勒信道的 TF 域信号

构造一个与原 OD 信道其他参数相同、仅保留范围内多普勒 $\nu_{i,\mathrm{in}}=\check{k}_i/(NT)$ 的对照信道。记其 TF 域接收信号为 $\mathbf Y_{\mathrm{TF,in}}$，原 OD 信道为 $\mathbf Y_{\mathrm{TF}}$。前者具有 [8]、[9] 中的常规形式。

**命题 1：** OD 信道下 TF 域接收信号的矩阵形式为

$$
\mathbf Y_{\mathrm{TF}}=
\sum_{i=1}^{P}e^{-j2\pi l_i\phi_i/M}
\boldsymbol\Pi^{\phi_i}\mathbf Y_{\mathrm{TF,in}}. \tag{6}
$$

其中 $\boldsymbol\Pi\in\{0,1\}^{M\times M}$ 是循环置换矩阵，具体定义参见原文式（7）；命题证明见附录 A。

根据式（6），OD 信道的 TF 域接收信号可视为沿频率索引循环移位后的信号叠加，并附带额外相位项。**图 2** 给出了带通 OTFS 系统及该循环移位。令 $Y_{\mathrm{OD}}[n,m]$ 和 $Y_{\mathrm{in}}[n,m]$ 分别表示相应矩阵的第 $n$ 行、第 $m$ 列元素。基于文献 [8] 的交叉模糊函数 $A_{g_{\mathrm{rx}},g_{\mathrm{tx}}}(t,f)$，可建立式（8）、（9）的具体输入—输出关系。采用理想成形脉冲时，可化简为

$$
Y_{\mathrm{OD}}[n,m]=\sum_{i=1}^{P}\widetilde h_i
e^{-j2\pi[m-\phi_i]_Ml_i/M}
e^{j2\pi n(\phi_i+\check{k}_i/N)}
X[n,[m-\phi_i]_M], \tag{10}
$$

其中 $[\cdot]_M$ 为模 $M$ 运算，$\widetilde h_i=h_i e^{-j2\pi\tau_i\nu_i}$。

### C. 超范围多普勒信道的 DD 域信号

将 DD 域接收矩阵表示为 $\mathbf Y_{\mathrm{DD}}$，第 $k$ 行、第 $l$ 列元素记为 $y[k,l]$。

**命题 2：** OD 信道下 DD 域接收信号满足

$$
y[k,l]=\sum_{k'=0}^{N-1}\sum_{l'=0}^{M-1}
x[k',l']h_{w,\mathrm{OD}}(k,k',l,l'), \tag{11}
$$

其中超范围信道响应为

$$
h_{w,\mathrm{OD}}(k,k',l,l')
=\sum_{i=1}^{P}e^{j2\pi l\phi_i/M}
h_i e^{-j2\pi\tau_i\nu_i}
w(k-k'-\check{k}_i,l-l'-l_i). \tag{12}
$$

采样函数 $w(\cdot,\cdot)$ 取自文献 [17] 的式（9），本文将其写为式（13）；命题证明见附录 B。

将式（11）与范围内信道的式（49）对照，可知带通系统中的 OD 信道沿时延维度引入额外相位 $e^{j2\pi l\phi_i/M}$，而不同路径的 $\phi_i$ 可能不同。另一方面，采样函数与范围内信道相同，因此接收信号在 DD 域中的响应位置不变。原因在于式（4）的 $\psi_i$ 部分会在 DFT 过程中消除，而 $\phi_i$ 部分在频率维度产生循环移位，随后在 DD 域形成附加相位。文献 [26] 的低通采样系统直接对 TF 域信号取样，不发生这一循环频移，因此 DD 域中没有同样的额外相位。

将矩阵按列堆叠进行矢量化，有

$$
\operatorname{vec}(\mathbf Y_{\mathrm{DD}})
=\mathbf H_{\mathrm{OD}}\operatorname{vec}(\mathbf X_{\mathrm{DD}}). \tag{14}
$$

其中 $\mathbf H_{\mathrm{OD}}\in\mathbb C^{MN\times MN}$ 为 OD 信道矩阵。其元素关系在原文式（15）中给出。

已有估计方法 [12]、[17]、[27] 一般只恢复 $h_i,\check{k}_i,l_i$，忽略 OD 参数及额外相位项。更重要的是，额外相位使具有分数参数的采样点表现出不连续性，破坏估计结果的稀疏结构，故直接套用现有方法不再适用。为解决这一问题，可利用互素跨帧结构，让同一条 OD 路径在不同子帧的响应位置有所差异，据此估计并补偿超范围多普勒及额外相位。

## III. 面向 OD 信道的跨帧 OTFS 框架

OD 信道在不同帧配置下的响应不同，因此可以设计专用的跨帧框架来估计 OD 参数及其额外相位。参考 [26]，本文采用两个不同子帧，使超范围多普勒抽头在它们中产生不同影响。**图 3** 展示了这一互素帧结构。

为便于实际实现，两个子帧采用相同采样率，但时隙数互素：

$$
M_1N_1=M_2N_2,\qquad \gcd(N_1,N_2)=1.
$$

如果物理信道属性变化较慢，两个子帧经过的是同一个 OD 信道，但在式（4）中会对应不同的范围内多普勒抽头 $\check{k}_{1,i}$、$\check{k}_{2,i}$，从而产生不同的 DD 域响应位置。这种差异可用于反推真实多普勒。式（16）给出两个子帧各自的 DD 域输入—输出关系，其中 $M_1,N_1,M_2,N_2$ 分别为两个子帧的子载波数与时隙数；$x_1,y_1,x_2,y_2$ 为 DD 域发射及接收信号，$\phi_{1,i},\phi_{2,i}$ 和 $\check{k}_{1,i},\check{k}_{2,i}$ 为各子帧对应的超范围与范围内参数，而归一化时延 $l_i$ 相同。

为简化分析，假设理想脉冲成形且只发送一个导频，即两个子帧在导频坐标处均为 1，其他元素均为零。对于单条传播路径，其接收信号可写为多普勒维采样函数 $w_\nu$、时延维采样函数 $w_\tau$、路径增益与额外相位的乘积，详见原文式（17）、（18）。

当只有一条路径时，可通过接收信号的最大幅值位置确定两个子帧的范围内整数时延和多普勒：

$$
(\widehat k_{I1},\widehat l_1)=
\underset{k_1,l_1}{\arg\max}\,|y_1[k_1,l_1]|,\qquad
(\widehat k_{I2},\widehat l_1)=
\underset{k_2,l_2}{\arg\max}\,|y_2[k_2,l_2]|. \tag{19}
$$

根据 [26]，假设无歧义多普勒处于两个互素子帧所确定的范围内，则可利用 CRT 求出其整数部分：

$$
\widehat k_I=
\widehat k_{I1}N_1[N_2^{-1}]_{N_1}
+\widehat k_{I2}N_2[N_1^{-1}]_{N_2}. \tag{20}
$$

这里 $[x^{-1}]_y$ 表示当 $x,y$ 互素时，$x$ 关于模 $y$ 的乘法逆元；完整恢复时按相应无歧义范围取模。恢复真实多普勒后，可根据式（4）及 $\widetilde h_i=h_i e^{-j2\pi\tau_i\nu_i}$ 进一步确定 $\phi_{1,i}$、$\phi_{2,i}$ 和 $h_i$。时延和多普勒的分数部分可由 [12]、[17]、[27] 等方法估计。

原文图 3 上方两图说明，尽管多普勒超范围，只要时延仍在范围内，DD 域导频便仍可放置在保护区中，而不干扰数据符号。然而，在多径场景中，不同子帧的冲激匹配更加困难。仅比较幅度会受到有限采样点和电磁波闪烁效应 [28] 的影响，可能造成错误匹配。由于两个子帧的多普勒分辨率相同，超范围多普勒的分数部分在两帧中保持一致，因此可以联合分数信息和幅度信息解决匹配问题。

## IV. 基于 OGSBI 与 CRT 的 OD 信道估计（待继续）

本节将 OD 信道的输入—输出关系改写为离网模型，然后利用分数参数和幅度信息分层分解接收信号，并在各层执行离网稀疏贝叶斯推断，以恢复多径 OD 信道的 CSI。

### A. OD 信道的离网模型

对于单导频和理想脉冲，式（21）给出了 DD 域接收信号。相应矩阵模型为

$$
\mathbf Y_{\mathrm{DD}}
=x[k_p,l_p]\sum_{i=1}^{P}\widetilde h_i
\mathbf w_\nu(k_{\nu_i})\mathbf w_\tau(l_{\tau_i})^H\mathbf E_i
=x[k_p,l_p]\mathbf U_{\mathrm{DD}}\mathbf H_{\mathrm{DD}}
\check{\mathbf V}_{\mathrm{DD}}^H. \tag{22}
$$

其中 $\mathbf E_i=\operatorname{diag}(e^{j2\pi(0)\phi_i/M},\ldots,e^{j2\pi(M-1)\phi_i/M})$。多普勒响应向量、时延响应向量和路径增益对角矩阵沿用 [27] 的定义（原文式（23））。$\check{\mathbf V}_{\mathrm{DD}}$ 包含时延和额外相位信息：

$$
\check{\mathbf V}_{\mathrm{DD}}
=[\mathbf E_1\mathbf w_\tau(l_{\tau_1}),\ldots,
\mathbf E_P\mathbf w_\tau(l_{\tau_P})]. \tag{24}
$$

按照文献 [17]、[27]，可将该模型扩展至多普勒和时延离散网格，得到原文式（25）。采样函数在两维的泰勒近似为

$$
\widetilde{\mathbf w}_\nu(\widetilde k_{\nu_{n'}})
=\mathbf w_\nu(\widetilde k_{\nu_{n'}})
+\beta_{k_{\nu_{n'}}}\mathbf w'_\nu(\widetilde k_{\nu_{n'}}),
$$

$$
\widetilde{\mathbf w}_\tau(\widetilde l_{\tau_{m'}})
=\mathbf w_\tau(\widetilde l_{\tau_{m'}})
+\beta_{l_{\tau_{m'}}}\mathbf w'_\tau(\widetilde l_{\tau_{m'}}). \tag{26}
$$

其中 $\beta$ 为对应网格偏移量，撇号表示采样函数在相应维度的偏导数。对于 OD 信道，额外相位矩阵 $\mathbf E_i$ 使各路径在时延维度的贡献不再连续，削弱既有估计方法所依赖的稀疏性。因此后续先沿多普勒维进行分解，再处理时延维及超范围补偿。

### B. 跨帧与 OGSBI 联合信道估计

尽管式（28）中的附加相位矩阵 $\mathbf E_{n',m'}$ 未知，仍可以把其中的 $\mathbf d_{U,n'}$ 当作整体来处理。将 $N'$ 个列向量组合为矩阵 $\mathbf D$；跨帧设计得到的两个子帧分别记为 $\mathbf D_1$、$\mathbf D_2$。两子帧中，同一路径的时延位置一致，而其多普勒坐标不同。由于两子帧的分辨率一致，同一路径的幅值和分数参数也应相近，这便为路径对应提供了依据。求解式（27）因此可以分为以下六步。

**步骤 1：在多普勒维进行分解。** 首先将接收符号改写为

$$
\mathbf Y_{\mathrm{DD}}
=x[k_p,l_p]\widetilde{\mathbf U}(\boldsymbol\beta_{k_\nu})
\mathbf D_U^H+\mathbf n_\nu.\tag{30}
$$

其中

$$
\begin{aligned}
\widetilde{\mathbf U}(\boldsymbol\beta_{k_\nu})
&=[\widetilde{\mathbf w}_\nu(\widetilde k_{\nu1}),\ldots,
\widetilde{\mathbf w}_\nu(\widetilde k_{\nu N'})]\\
&=\mathbf U_{\mathrm{DD}}(\widetilde{\mathbf k}_\nu)
+\operatorname{diag}(\boldsymbol\beta_{k_\nu})
\mathbf U'_{\mathrm{DD}}(\widetilde{\mathbf k}_\nu).
\end{aligned}\tag{31}
$$

$\mathbf U'_{\mathrm{DD}}$ 是 $\mathbf U_{\mathrm{DD}}$ 对相应多普勒参数的偏导数。未知量是多普勒维离网参数 $\boldsymbol\beta_{k_\nu}$ 和响应矩阵 $\mathbf D_U^H$。可使用文献 [17]、[27] 研究的 OGSBI 方法估计这些量。对图 3 所示两子帧，分别获得 $\widehat{\boldsymbol\beta}_{k_\nu,1}\in\mathbb R^{N'_{1}\times1}$、$\widehat{\mathbf D}_{U,1}\in\mathbb C^{l_m\times N'_1}$ 以及 $\widehat{\boldsymbol\beta}_{k_\nu,2}\in\mathbb R^{N'_{2}\times1}$、$\widehat{\mathbf D}_{U,2}\in\mathbb C^{l_m\times N'_2}$。其中 $N'_1,N'_2$ 表示两子帧在多普勒维的虚拟网格数，$l_m$ 表示最大时延。

**步骤 2：选取同一路径的冲激。** 分别用 $\mathbf d_1$、$\mathbf d_2$ 表示 $|\mathbf D_{U,1}|$ 与 $|\mathbf D_{U,2}|$ 的相应幅值行（原文将其记为列，但后续算法通过同一时延行取值）。对其执行峰值检测和区域扩张：从各局部最大值沿左右方向扩张，将其相邻且幅度逐渐减小的点收入同一区域。扩张得到的峰值区域集合记为 $\mathcal K_{\mathrm{PEAK}1}$、$\mathcal K_{\mathrm{PEAK}2}$。如果两个候选峰的幅值足够接近，就视为来自同一路径的候选响应。

**步骤 3：利用分数信息确定匹配点。** 对判定属于同一路径的两个峰值区域，在相应的分数多普勒估计之间搜索差值最小的一对点，以之作为跨帧匹配点；提取两点的范围内多普勒，利用式（20）通过中国剩余定理恢复超范围多普勒，再将估计结果补偿至两个峰值区域。没有被匹配的点被认为处于正常的范围内区域。原文这一步两处 $\widehat{\boldsymbol\beta}$ 的子帧下标存在重复书写，翻译根据前后定义保留其跨子帧比较的含义。

**步骤 4：逐点计算 OD 状态。** 在两子帧的整个响应矩阵中重复步骤 2–3，获得每个采样点的 OD 参数。由此形成状态矩阵 $\widehat{\boldsymbol\Phi}_1\in\mathbb C^{l_m\times N'_1}$ 和 $\widehat{\boldsymbol\Phi}_2\in\mathbb C^{l_m\times N'_2}$：

$$
\widehat{\boldsymbol\Phi}_b=
\begin{bmatrix}
(\widehat\phi_{0,1})_b&(\widehat\phi_{0,2})_b&\cdots&(\widehat\phi_{0,N'_b})_b\\
(\widehat\phi_{1,1})_b&(\widehat\phi_{1,2})_b&\cdots&(\widehat\phi_{1,N'_b})_b\\
\vdots&\vdots&\ddots&\vdots\\
(\widehat\phi_{l_m,1})_b&(\widehat\phi_{l_m,2})_b&\cdots&(\widehat\phi_{l_m,N'_b})_b
\end{bmatrix},
\qquad b=1,2.\tag{32}
$$

其中 $(\widehat\phi_{i,j})_b$ 是式（4）中 OD 整数参数的相应估计值。原文算法 1 给出了计算 $\widehat{\boldsymbol\Phi}_1$、$\widehat{\boldsymbol\Phi}_2$ 的具体程序，常数 $\lambda$ 是判断两个冲激是否属于同一路径的启发式阈值。例如，$\lambda=0.75$ 表示两峰的幅值需要足够接近。

**算法 1：由两子帧响应矩阵和分数多普勒估计计算 OD 状态矩阵。**

输入：$\widehat{\mathbf D}_{U,1}$、$\widehat{\boldsymbol\beta}_{k_\nu,1}$、$\widehat{\mathbf D}_{U,2}$、$\widehat{\boldsymbol\beta}_{k_\nu,2}$。输出：$\widehat{\boldsymbol\Phi}_1$、$\widehat{\boldsymbol\Phi}_2$。

1. 将两个状态矩阵初始化为零。
2. 对 $i=0,1,\ldots,l_m$，提取两子帧对应时延位置的幅值响应 $\mathbf d_1$ 与 $\mathbf d_2$。
3. 在两组响应上进行峰值检测和区域扩张，取得两个峰值区域集合；按各区域的峰值幅度降序排列。
4. 对两组峰值区域中的前 $\min(P_1,P_2)$ 个候选，计算局部峰值 $P_{L1}$、$P_{L2}$ 及位置 $V_1$、$V_2$。
5. 若两峰幅值足够接近，且峰位置相距超过一个网格，则从其分数参数集合中寻找最接近的一对匹配点。
6. 依据匹配点在两个子帧中的范围内多普勒位置，用式（20）计算 OD 多普勒，再由式（4）得到两个子帧的 $\widehat\phi_{i,1}$ 和 $\widehat\phi_{i,2}$。
7. 将估计值写入相应峰值区域的 OD 状态矩阵。完成所有循环后返回两个矩阵。

原文算法步骤 4、8、10 的索引和集合名称存在重复或不一致的印刷表述，因此上述为保持原有计算步骤的中文转述，尚不作为精确可执行伪代码。

**步骤 5：接收信号分层。** 两个子帧分别进行处理。以子帧 1 为例，假设 $\widehat{\boldsymbol\Phi}_1$ 有 $\Psi_1$ 个不同的取值，即 $\widehat\phi_1,\ldots,\widehat\phi_{\Psi_1}$，则

$$
\mathbf D_{U,1}=
\mathbf D_{U,11}+\mathbf D_{U,12}+\cdots+
\mathbf D_{U,1\Psi_1}.\tag{33}
$$

$\mathbf D_{U,1i}$ 只保留 OD 参数等于 $\widehat\phi_i$ 的位置，其余位置均置零：

$$
D_{U,i}(p,q)=
\begin{cases}
D_U(p,q),&\widehat\Phi(p,q)=\widehat\phi_i,\\
0,&\text{其他}.
\end{cases}\tag{34}
$$

**图 4.** 跨帧 OTFS 信道估计示意图。在基本 DD 域中可能重叠的不同路径，经跨帧匹配后按 OD 状态分离，形成额外相位参数相同的独立层。

**步骤 6：逐层估计信道。** 分层以后，分别估计各层的信道。将子帧 1 的第 $i$ 层写为 $\mathbf D_{U,1i}=[\mathbf d_{U,1},\ldots,\mathbf d_{U,N'}]$，其第 $n'$ 列满足

$$
\mathbf d_{U,n'}=
\widehat{\mathbf E}_i\widetilde{\mathbf V}
(\boldsymbol\beta_{l_\tau}|_{n=n'})
\mathbf h_{U,n'}+\mathbf n_\nu(n'),\tag{35}
$$

其中

$$
\widehat{\mathbf E}_i=
\operatorname{diag}\{e^{j2\pi m\widehat\phi_i/M_1}\}_{m=0}^{M_1-1}.\tag{36}
$$

然后，同样利用 OGSBI 估计时延维离网参数 $\widehat{\boldsymbol\beta}_{l_\tau}^{2D}$ 和信道幅值 $\widehat{\mathbf h}_{U,n'}$。依次求得每层的估计，再完成相位补偿和结果相加，即得到整体信道估计。分层和补偿能够缓解 OD 信道带来的稀疏结构破坏。

本节为简便使用理想脉冲，但矩形脉冲等实际脉冲下所提方法仍可使用。理由是：第二节输入输出关系和命题针对任意脉冲推导；用于分数参数恢复的 OGSBI 本来就能推广到实际脉冲 [29]；CRT 所用的 DD 域冲激位置较少受到脉冲形状影响。

### C. 计算复杂度分析

假设两子帧参数近似相同，即 $N\approx N_1\approx N_2$、$M\approx M_1\approx M_2$，且虚拟网格数满足 $N'\ge N$、$M'\ge M$。所提方法包含三个主要计算部分。首先，式（30）中的多普勒维分解复杂度为 $O(N'^2N)$ [30]；其次，一次 CRT 运算复杂度为 $O(\log N)$ [26]，在最坏情况下每个 DD 点均要进行该运算，总复杂度为 $O(NM\log N)$；峰值匹配和分层不包含复杂矩阵运算，其复杂度忽略不计。最后，分层后每个 $\Phi$ 层的 OGSBI 复杂度为 $O(M'^2MN')$ [27]。综上，总复杂度为

$$
O(N'^2N)+O(NM\log N)+O(\Phi M'^2MN')
=O(\Phi M'^2MN').
$$

$\Phi$ 是实际使用的层数，依据信道情况在 1 到 $M$ 之间变化。原文表 III 对比离网方法的复杂度，所提方法的复杂度位于 [17] 和 [27] 两种方法之间。

## V. 仿真结果与讨论

本节在 OD 信道下考察所提方法的估计性能。按照 [31]，分别在 $[-\nu_{\max},\nu_{\max}]$ 和 $[0,\tau_{\max}]$ 区间随机均匀生成多普勒与时延，取 $\tau_{\max}=2.6\times10^{-6}$ s；复增益 $h_i$ 按 [17] 设置。导频与数据的功率比为 30 dB，网格分辨率为 0.5，贝叶斯方法参数与 [27] 相同。

相比范围内信道，OD 信道还包括 $e^{j2\pi l\phi_i/M}$ 这一额外相位项，故对完整 OD 信道响应定义 NMSE：

$$
\mathrm{NMSE}=
\frac{\displaystyle
\sum_{k,k'=0}^{N-1}\sum_{l,l'=0}^{M-1}
\left|h_{w,\mathrm{OD}}(k,k',l,l')-\widehat h_{w,\mathrm{OD}}(k,k',l,l')\right|^2}
{\displaystyle
\sum_{k,k'=0}^{N-1}\sum_{l,l'=0}^{M-1}
\left|h_{w,\mathrm{OD}}(k,k',l,l')\right|^2}.\tag{37}
$$

其中 $\widehat h_{w,\mathrm{OD}}$ 通过估计参数按式（53）构造，$h_{w,\mathrm{OD}}$ 则由真实信道参数生成。

表 IV 给出基于 3GPP NR FR2 的主要配置。载频为 48.20 GHz、系统带宽为 3.48 MHz。对照方法采用单帧 Frame 0（60 个时隙、58 个子载波、60 kHz 子载波间隔）；所提方法由 Subframe 1（30 个时隙、58 个子载波、60 kHz 子载波间隔）和 Subframe 2（29 个时隙、60 个子载波、58 kHz 子载波间隔）组成，合计占用相同的时频资源。比较方法包括 [12] 的嵌入导频方案、[17] 的二维离网方法和 [27] 的 SBL 组合方法。所提方法报告两子帧 NMSE 的平均值；其他方法报告单帧 NMSE。所有仿真结果均对 1000 次独立试验取平均。

### A. 最大多普勒增大时的 NMSE

**图 5.** SNR = 20 dB 时，随最大多普勒增加的 NMSE 曲线；传播路径数为 1、3、5，最大多普勒从 4 kHz 增至 136 kHz，超过范围内阈值约 30 kHz 的数倍。

当最大多普勒超过范围内阈值，即图中灰色虚线右侧时，所提方法的 NMSE 明显低于其他方法，因为它能够显式估计范围外信道响应。由于多普勒是在给定最大值内随机产生的，仿真实际上还包含部分路径范围内、部分路径范围外的混合情形，因此也检验了方法对混合信道的适用性。

不过，在多普勒仍处于范围内时，所提方法偶尔不及传统方法。原因是噪声可能影响两个子帧的多普勒估计，从而使跨帧匹配选择错误的输入点。图中所提方法的性能波动也更显著，这是 CRT 的特性所致：输入点之间即使只有较小的对应误差，也可能造成范围外多普勒估计出现较大偏差。

此外，不论在范围内还是范围外，多径数增加时所提方法性能都会下降。多径数越多，越容易发生不同路径在基本 DD 域同一位置叠加的情况（图 4 红色和绿色抽头重叠），从而使来自不同 OD 层的响应无法彻底分开，估计误差增大。

### B. 随 SNR 增加的 NMSE 与 BER

**图 6.** 最大多普勒 $\nu_{\max}=150$ kHz 下的 NMSE–SNR 曲线。  
**图 7.** 相同设置下的 BER–SNR 曲线。

SNR 从 −5 dB 增至 20 dB，最大多普勒 150 kHz，明显超出 30 kHz 阈值。发送数据采用 QPSK，接收端采用 DD 域 MMSE 检测 [24，第 6.3.1 节]。

在严重 OD 信道中，所提方法的 NMSE 随 SNR 增大而逐渐改善，BER 随之下降，说明可以在 OD 信道中有效估计信道并支持可靠检测。高 SNR 条件下（例如 SNR ≥ 15 dB），3 径和 5 径的 NMSE 改善有限：此时加性噪声不再是主要误差源，多径分量之间的相互干扰形成性能限制。

其他方法由于忽略 OD 的附加相位，在极端 OD 信道中的估计基本失效，对应 BER 接近 0.5，接收端无法进行有效检测。随着多径数增加，所提方法的 NMSE 和 BER 也会恶化，原因仍然是基本 DD 域重叠使逐层分离不够准确。

### C. 带宽增加时的 NMSE

**图 8.** 在扩展车辆 A（Extended Vehicular A，EVA）九径信道中，比较不同带宽下的 NMSE，最大多普勒 150 kHz，SNR = 20 dB。多普勒依据 Jakes 模型 [8] 生成。

图中横坐标由改变子载波数来改变带宽。表 V 列出不同帧在各带宽下的子载波配置；对照方法使用 60 个时隙的单帧，所提方法采用 30、29 时隙的两个子帧，因此保持时频资源比较的公平性。其他配置与表 IV 相同。随着带宽增大，NMSE 得以改善：较大的带宽提高时延分辨率，既能更准确地估计时延，也能降低不同多径响应在基本 DD 域重叠的概率。

## VI. 结论

本文首先针对多载波波形引入超范围多普勒（OD）信道，并推导了此时 OTFS 的输入输出关系，说明 OD 条件下的接收信号可视为基本 DD 域中原信号的相位偏移叠加。针对该问题，提出新的跨帧 OTFS 信道估计方法。借助互素子帧配置，同一原始信道在两个子帧中呈现不同响应；通过离网分解并结合幅度和分数参数匹配同一路径的抽头，再利用 CRT 估计每个采样点的 OD 状态；在此基础上将 DD 域信号分层，把复杂 OD 信道估计转化为若干单层估计任务。

仿真结果验证了所提方法在 OD 条件下的有效性。但是，当多径响应发生重叠时，仅凭接收子帧包含的信息可能不足以准确判定 OD 状态。这仍是有待解决的问题，作者指出通感一体化（ISAC）提供的感知信息可能成为一种解决途径。

## 附录 A. 命题 1 的证明：OD 信道的 TF 域矩阵表达

把 TF 域接收信号写为 $\mathbf Y_{\mathrm{TF}}\in\mathbb C^{M\times N}$，按路径和时隙分解：

$$
\mathbf Y_{\mathrm{TF}}=\sum_{i=1}^P[\mathbf y_{i,0},\mathbf y_{i,1},\ldots,\mathbf y_{i,N-1}].\tag{38}
$$

第 $i$ 条路径在时隙 $n$ 对应的列向量为

$$
\mathbf y_{i,n}=\mathbf F_M
\begin{bmatrix}
g_{\mathrm{rx}}(0)r_i[nM]\\
g_{\mathrm{rx}}(T/M)r_i[nM+1]\\
\vdots\\
g_{\mathrm{rx}}(T(M-1)/M)r_i[nM+M-1]
\end{bmatrix}.\tag{39}
$$

其中 $\mathbf F_M$ 是 $M$ 阶 DFT 矩阵，$g_{\mathrm{rx}}$ 表示接收滤波器；$r_i[q]$ 为第 $i$ 条路径在第 $q$ 个时刻的采样值。定义同一路径对应的范围内信号

$$
r_{i,\mathrm{in}}[q]=h_i s\!\left(\frac{T}{M}(q-l_i)\right)
e^{j2\pi(q-l_i)\check k_i/(NM)},
$$

由式（5）得到

$$
r_i[q]=r_{i,\mathrm{in}}[q]
e^{j2\pi q\phi_i/M}e^{-j2\pi l_i\phi_i/M}.\tag{40}
$$

将式（40）代入（39），利用矩阵 $\mathbf E_i=\operatorname{diag}\{e^{j2\pi m\phi_i/M}\}_{m=0}^{M-1}$ 与 DFT 的关系，可以将频域相位调制写成置换矩阵 $\mathbf\Pi^{\phi_i}$，这构成原文式（41）的长矩阵推导。范围内的对应向量为

$$
\mathbf y_{i,n,\mathrm{in}}=\mathbf F_M
\begin{bmatrix}
g_{\mathrm{rx}}(0)r_{i,\mathrm{in}}[nM]\\
g_{\mathrm{rx}}(T/M)r_{i,\mathrm{in}}[nM+1]\\
\vdots\\
g_{\mathrm{rx}}(T(M-1)/M)r_{i,\mathrm{in}}[nM+M-1]
\end{bmatrix}.\tag{42}
$$

于是有

$$
\mathbf y_{i,n}=
e^{-j2\pi l_i\phi_i/M}e^{j2\pi n\phi_i}
\mathbf\Pi^{\phi_i}\mathbf y_{i,n,\mathrm{in}}.\tag{43}
$$

推广到全部时隙和路径，得到正文命题 1 对应的矩阵关系：

$$
\mathbf Y_{\mathrm{TF}}=\sum_{i=1}^{P}
e^{-j2\pi l_i\phi_i/M}\mathbf\Pi^{\phi_i}
\mathbf Y_{\mathrm{TF,in},i}.\tag{44}
$$

## 附录 B. 命题 2 的证明：OD 信道 DD 域的输入输出关系

接收端将离散时域信号串并变换为 $\mathbf R\in\mathbb C^{M\times N}$：

$$
\mathbf R=
\begin{bmatrix}
r[0]&r[M]&\cdots&r[M(N-1)]\\
r[1]&r[M+1]&\cdots&r[M(N-1)+1]\\
\vdots&\vdots&\ddots&\vdots\\
r[M-1]&r[2M-1]&\cdots&r[MN-1]
\end{bmatrix}.\tag{45}
$$

令 $\mathbf r_m$ 为第 $m$ 行，根据 [9]，DD 域接收信号可写成

$$
\mathbf Y_{\mathrm{DD}}=\mathbf G_{\mathrm{rx}}\mathbf R\mathbf F_N,\tag{46}
$$

其中 $\mathbf F_N$ 为 $N$ 阶 DFT 矩阵，$\mathbf G_{\mathrm{rx}}=\operatorname{diag}\{g_{\mathrm{rx}}(mT/M)\}_{m=0}^{M-1}$。令 $r_{i,\mathrm{in}}[q]$ 表示范围内部分，并构造对应的 $\mathbf R_{i,\mathrm{in}}$，则 OD 信道下

$$
\mathbf Y_{\mathrm{DD}}=
\sum_{i=1}^{P}e^{-j2\pi l_i(\psi_i+\phi_i/M)}
\mathbf E_i\mathbf G_{\mathrm{rx}}\mathbf R_{i,\mathrm{in}}\mathbf F_N,\tag{47}
$$

而范围内信道则满足

$$
\mathbf Y_{\mathrm{in}}=
\sum_{i=1}^{P}\mathbf G_{\mathrm{rx}}\mathbf R_{i,\mathrm{in}}\mathbf F_N.\tag{48}
$$

根据 [9]，范围内 DD 域输入输出关系为

$$
y_{\mathrm{in}}[k,l]=
\sum_{i=1}^{P}h_ie^{-j2\pi l_i\check k_i/(NM)}
\sum_{k'=0}^{N-1}\sum_{l'=0}^{M-1}
x[k',l']w(k-k'-\check k_i,l-l'-l_i).\tag{49}
$$

把式（49）中第 $i$ 条路径的贡献单独记为 $y'_{i,\mathrm{in}}[k,l]$，即可由矩阵关系（47）和（48）得出

$$
y[k,l]=\sum_{i=1}^{P}
e^{-j2\pi l_i(\psi_i+\phi_i/M)}
e^{j2\pi l\phi_i/M}y'_{i,\mathrm{in}}[k,l].\tag{51}
$$

进一步将范围内响应代入：

$$
y[k,l]=
\sum_{k'=0}^{N-1}\sum_{l'=0}^{M-1}
x[k',l']h_{w,\mathrm{OD}}(k,k',l,l'),\tag{52}
$$

其中

$$
h_{w,\mathrm{OD}}(k,k',l,l')=
\sum_{i=1}^{P}e^{j2\pi l\phi_i/M}
\widetilde h_i w(k-k'-\check k_i,l-l'-l_i),\quad
\widetilde h_i=h_ie^{-j2\pi\tau_i\nu_i}.\tag{53}
$$

这就证明了正文命题 2。

## 尚待逐页核验的内容

本次已补充 IV 节的六步算法、复杂度分析、V 节全部仿真结论、VI 节结论以及附录 A–B 主要推导。仍须按原版逐项核对：一般脉冲下的长采样函数（13）、附录的长矩阵式（41）与路径中间表达式（50）、表 III 与 V 的全部数值、参考文献 [1]–[31] 的完整书目及作者简介。**上述缺项完成前，此页面不计为全文已验收。**

{% endraw %}
