---
layout: page
title: "超高移动性跨帧 OTFS 系统的信道估计｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-20-channel-estimation-in-cross-frame-otfs-system-with-ultra-high-mobility-65fb4a2e/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/65fb4a2eb96bd703/) · 原文为期刊/会议正式版，许可待核验 · [全部目录](/papers/catalog/)

# 超高移动性跨帧 OTFS 系统的信道估计

**原题：** Channel Estimation in Cross-Frame OTFS System With Ultra-High Mobility  
**作者：** Zhenyu Zhang、Qianli Wang（Member, IEEE）、Gang Liu（Member, IEEE，通讯作者）、Pingzhi Fan（Life Fellow, IEEE）、FeiFei Gao（Fellow, IEEE）。单位：Zhenyu Zhang、Qianli Wang、Gang Liu、Pingzhi Fan 均为**西南交通大学信息编码与传输重点实验室**（Key Laboratory of Information Coding and Transmission, Southwest Jiaotong University），成都 610031，中国；FeiFei Gao 为**清华大学自动化系**（Department of Automation, Tsinghua University），北京 100084，中国。原文注明：Zhenyu Zhang 与 Qianli Wang 对本文贡献相同（共同第一作者）。作者邮箱：zzy1997@my.swjtu.edu.cn；qianli_wang@qq.com；gangliu@swjtu.edu.cn；pzfan@swjtu.edu.cn；feifeigao@ieee.org。  
**版本：** 期刊/会议正式版（2026-10-20），本地 PDF 14 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、第 I—VI 节、附录 A、B（两个命题的证明）、图 1—8 图注、表 I—V（已用 PDF 渲染逐格核对）、式（1）—（53）、算法 1、参考文献 [1]—[31]（英文原条目）。逐句逐式终校未做，不标记为已验收全文。

> **许可与使用说明：** 原文为 **IEEE Transactions on Wireless Communications**（Vol. 25, 2026, pp. 12883 起，DOI: 10.1109/TWC.2026.3668101）期刊正式版；**再传播许可待核验**。本页仅作个人学习用途的中文译稿，不代表已获授权，**不计入可公开全文统计**。若核验后许可不允许再传播，本页应下线或仅保留摘要级介绍。原文页脚明确要求："Personal use is permitted, but republication/redistribution requires IEEE permission."
>
> **译注（术语与原文疑点）：** 原文缩写保留英文：OTFS（orthogonal time frequency space，正交时频空间）、OD（out-of-range Doppler，多普勒超范围/出界）、DD（delay-Doppler，时延—多普勒）、TF（time-frequency，时频）、LTV（linear time-varying，线性时变）、CRT（Chinese Remainder Theorem，中国剩余定理）、OGSBI（off-grid sparse Bayesian inference，离格稀疏贝叶斯推断）、SBL（sparse Bayesian learning）、NMSE、BER、MMSE、QPSK、CP、ISAC、EVA（Extended Vehicular A）、3GPP NR FR2、GCD。**原文疑点/说明（按原文照录并加注）：** ①原文 §I 用 **Table I** 列出高频段超高移动场景（V2V/HSR、卫星通信、THz 近空间）的频率与相对速度，用 **Table II** 汇总 6G 不同载频下 OTFS 的速度支持；两表表体在 PDF 文本层为图像，本页数值已用 PDF 渲染（第 2 页）逐格核对；②原文式 (20) 的 CRT 合成公式含互质子帧时隙数 $N_1,N_2$ 的模逆元 $[N_2^{(-1)}]_{N_1}$、$[N_1^{(-1)}]_{N_2}$，抽取文本上下标有错位，本页按 PDF 语义照录；③原文 §IV-B **Step 3** 中"their corresponding fractional parameters are noted as $\hat\beta_{k\nu,2}(k_{\mathrm{PEAK}1})$ and $\hat\beta_{k\nu,2}(k_{\mathrm{PEAK}1})$"两处下标同为 2 与同一自变量，原文如此（疑为 $\hat\beta_{k\nu,1}$ 与 $\hat\beta_{k\nu,2}$ 之误），按原文照录；④原文 **Algorithm 1** 第 8 行 "the coordinates of $PL_1$ and $PL_2$ in $k_{\mathrm{PEAK}1}(j)$ and $k_{\mathrm{PEAK}1}(j)$"两处同为 $k_{\mathrm{PEAK}1}$（疑第二处应为 $k_{\mathrm{PEAK}2}$），按原文照录；⑤原文 §IV-B Step 1 中 $D_{U,1}$ 的维度记作 $\mathbb C^{l_m\times N_{0,1}}$、$D_{U,2}$ 记作 $\mathbb C^{l_m\times N_{0,2}}$（原文如此，$l_m$ 为两子帧最大时延索引）；⑥原文 §V 中"多普勒超范围"判据为 $\nu_{\max}>\Delta f/2=30$ kHz（$\Delta f=60$ kHz，见表 IV），故 Fig. 5 以 30 kHz 为分界虚线；⑦原文式 (37) 的 NMSE 定义分母用原始 OD 信道响应（含附加相位项），故与常规 in-range NMSE 不可直接比较；⑧原文 [26] 为作者前期工作（跨帧 OTFS 参数估计的 CRT 方法），本文在其基础上扩展为完整信道估计。

## 摘要

在即将到来的下一代无线通信系统中，高移动性支持是重要组成部分。OTFS（正交时频空间）调制因在高移动性场景下的鲁棒性而被视为 6G 的候选波形。然而，当多普勒扩展在超高速度下超出子载波间隔时（该条件称为**多普勒超范围（OD）信道**），其性能会退化。我们分析了 OD 信道下的输入—输出关系，揭示**时延—多普勒（DD）域接收信号是发射信号与一个附加相位项叠加**。基于这一洞见，我们设计了一种用于信道估计的**跨帧 OTFS 框架**：利用**互质子载波配置**在不同子帧观测到不同响应，并用**中国剩余定理（CRT）**解出超范围参数。进一步，我们提出一种有效的信道估计方法以处理多径场景——通过分解子帧并利用**小数与幅度信息**匹配响应抽头，把 OD 信道估计问题按 OD 参数**分层**处理 DD 域信号，从而转化为多个单域问题。仿真结果表明所提方法在 OD 信道估计中的有效性，优于在此类条件下失效的现有方法。

**关键词：** OTFS；时延—多普勒域；信道估计；高移动性信道。

## I. 引言

下一代无线通信预计需支持相对速度达 1000 km/h 甚至更高的高移动性场景 [1]、[2]，由此产生低轨（LEO）卫星 [3]、高速铁路（HSR）[4]、近空间通信 [5]、[6] 等高速通信场景。近来提出的 OTFS 波形 [7] 因对高移动性的鲁棒性而被视为 6G 的候选波形。与 4G/5G 中 OFDM 等现有多载波调制不同，OTFS 在二维时延—多普勒（DD）域调制通信符号，对具有严重多普勒频移的时变信道具有更好抵抗能力。

一些先驱工作研究了 OTFS 相对 OFDM 在双选择性信道上的性能与优势。Raviteja 等分析了 OTFS 的输入—输出关系并设计消息传递（MP）符号检测算法，证明在高移动性场景下 OTFS 的误比特率（BER）优于 OFDM [8]、[9]；[10] 完成了 OTFS 的分集分析，证明 OTFS 可在时延—多普勒域提取全分集，且 MIMO-OTFS 的渐近分集阶等于接收天线数；[11] 研究了 OTFS 的条件成对错误概率（PEP）及性能上界，并通过最优码设计准则提升编码增益。要实现这些潜在增益，准确的 CSI 至关重要——OTFS 性能强烈依赖 DD 域信道估计精度。[12] 提出 OTFS 的经典信道估计与相关导频设计：导频符号置于 DD 域保护间隔中，数据符号的信道响应可由导频符号推出；[13] 为多天线 OTFS 提出基于完美阵列的二维导频信道估计方案，仿真表明 DD 域码分复用可获得更好的 NMSE 性能。也有工作关注受保护间隔限制的频谱效率改进：Yuan 等为叠加导频与数据传输方案提出数据辅助信道估计算法 [14]，先用导频粗估、再用数据符号精化。

原始 DD 域通常稀疏，因为每个冲激对应一个多径分量 [15]。但受时频资源限制，DD 域信号分辨率受限，导致冲激在接收信号中呈现**小数参数**并扩散到整个 DD 域，造成稀疏性损失。为此，[16] 把信道估计表述为稀疏信号恢复问题，给出贝叶斯处理与消息传递算法并推导 Cramér–Rao 下界（CRLB）；近年来一些研究者进一步考察 DD 域**小数时延**的影响以更准确捕捉实际信道：[17] 提出基于离格稀疏贝叶斯推断（OGSBI）框架的一维与二维信道估计方法，使估计信道表示于原始 DD 域而不受限于网格点；[18] 进一步表明网格演化在信道估计与计算复杂度之间给出良好折中。降低 DD 域稀疏性损失已成为现有 OTFS 信道估计方案的有效途径。

尽管现有 OTFS 信道估计方案取得满意性能，它们**普遍假设多普勒频移保持在子载波间隔之内**。然而随着未来通信系统频段升高（如毫米波或太赫兹频段），高移动性场景下的多普勒效应更加严重。**表 I** 给出一些高频段、高移动性通信场景的频段与相对速度；同时考虑 ISAC 情形下更严重的多普勒效应，**表 II** 汇总 OTFS 的最大可容忍速度，其频率配置基于 3GPP 规范 [19]。如表 II 所示，在 3GPP 规定的毫米波频段中，高相对速度很容易导致不可容忍的多普勒频移，更不用说表 I 中相对速度与频段更高的其他场景。这些不可容忍的多普勒频移会使多普勒**超出子载波间隔**，形成**多普勒超范围（OD）信道**。在 OD 信道中，传统 OTFS 信道估计方法失效：因为 OD 信道的接收信号与 in-range（多普勒在范围内）信道有本质不同，由导频符号推导的信道响应无法预测数据符号（[22] 称之为**不可预测信道**）；此外接收信号的稀疏性会被破坏，从而显著降低信道估计性能。据作者所知，目前**尚无**针对 OD 信道的信道估计方案。

虽然增大子载波间隔可缓解该问题，但代价是显著的循环前缀（CP）开销与频谱效率急剧下降，在高频段尤为如此。因此，需要更根本的解决方案来应对高移动性、高频 6G 环境中预期的 OD 效应。

本文提出一种面向多普勒超范围信道的跨帧 OTFS 有效信道估计方法，其中多普勒扩展超出子载波间隔。对在子帧中呈现相似幅度与小数部分的同一路径，我们**分解子帧并利用子帧的小数与幅度信息匹配来自同一路径的响应抽头**；通过不同帧设置，超范围信道在子帧中呈现不同响应，从而可用**中国剩余定理（CRT）**解出超范围多普勒。进一步，接收信号按 OD 参数**分层**处理，在每层中恢复接收信号的稀疏性并获得信道估计结果。仿真结果表明该框架在多普勒超范围条件下的有效性。

本文主要贡献总结如下：

- 我们分析了 OD 信道下信号的输入—输出关系，推导了**时频（TF）域与 DD 域**接收信号的闭式表达式。发现在 TF 域，OD 信道下的接收信号是发射信号**带附加相位项的循环移位叠加**；在 DD 域，接收信号表现为沿时延轴叠加的附加相位项，而响应位置与 in-range 信道相同。
- 通过设计不同的子载波数与时隙数，我们提出**跨帧 OD 信道估计框架**：通过适当的帧结构设计，OD 信道在不同子帧中呈现不同响应；利用同一路径在子帧中的不同响应，可经由中国剩余定理估计 OD 信道的原始参数。
- 我们提出一种面向 OD 信道的有效信道估计方法：先分解子帧并利用小数与幅度信息匹配来自同一路径的响应抽头，再通过 CRT 计算每个采样点的超范围状态，并据此对 DD 域信号**分层处理**。仿真表明所提方法能有效估计超范围信道。

## II. 系统模型

### A. 多普勒超范围信道与时域信号模型

在先前工作 [23]、[24] 中，通常假设线性时变（LTV）信道的最大可容忍多普勒小于多载波波形的子载波间隔——这是 Zak-OTFS 结晶条件（crystallization condition）的一部分 [22]：

$$
\tau_i<T,\qquad\left|\nu_i\right|<\Delta f/2,\tag{1}
$$

其中 $\Delta f$、$T$、$\tau_i$、$\nu_i$ 分别为子载波间隔、时隙、第 $i$ 条路径的时延与多普勒。当频段升高（如毫米波或太赫兹场景）时该条件可能不满足（表 II 显示 OTFS 的最大可容忍速度随频段升高而下降）。此时接收信号与 in-range 信道完全不同：与 in-range 信道不同，**多普勒超范围会造成无法被常规 in-range 模型刻画的显著偏差**。为此需要更细致的信道特性分析。

本文考虑收发两端均为单天线的 OTFS 系统。无线信道通常视为双选择性衰落信道 [25]：

$$
h(\tau,\nu)=\sum_{i=1}^{P}h_i\delta(\tau-\tau_i)\delta(\nu-\nu_i),\tag{2}
$$

其中 $P$ 为散射体数，$h_i$ 为第 $i$ 条路径的复增益，$\tau_i$、$\nu_i$ 为第 $i$ 条路径的时延与多普勒。设时域发射基带信号为 $s(t)$，经 LTV 信道与上/下变频后，接收基带信号为 [25] 中式 (1.6)：

$$
r(t)=\iint h(\tau,\nu)s(t-\tau)e^{\mathrm j2\pi(t-\tau)\nu}\,\mathrm d\tau\,\mathrm d\nu=\sum_{i=1}^{P}h_is(t-\tau_i)e^{\mathrm j2\pi(t-\tau_i)\nu_i}.\tag{3}
$$

若超过最大可容忍速度（表 II；对表 I 场景是常见情形），多普勒频移 $\nu_i$ 将超范围，即 $|\nu_i|\ge\Delta f/2$，此时信道参数可写为时延与多普勒分辨率的整数倍（$\tau_i$ 与 $\nu_i$ 的归一化版本 [17]）：

$$
\tau_i=\frac{l_i}{M\Delta f},\qquad \nu_i=\psi_iMN+\phi_iN+\frac{\check k_i}{NT},\tag{4}
$$

其中 $M$、$N$ 分别为子载波数与时隙数。多普勒频移可视为**超范围部分 $\phi_i$、范围内部分 $\check k_i$ 与 $\psi_i$ 部分**的组合。由于 $\psi_i$ 部分是信号带宽的整数倍，在采样率 $f_s=M\Delta f$ 下不影响接收信号，属**非有效部分**。式（4）中 $\psi_i\in\mathbb Z$，$\phi_i\in\{-M+1,-M+2,\ldots,M-1\}$，$-N/2\le\check k_i<N/2$；$l_i\le M-1$ 为归一化时延（$l_i$ 与 $\check k_i$ 不一定为整数）。

**图 1：** DD 域中的多普勒超范围信道。（来源：原文第 3 页。）

如图 1 所示，真实 DD 域可视为 in-range 与 out-of-range 部分的组合。采用带通采样 $f_s=M\Delta f$，接收信号为

$$
r[q]=\sum_{i=1}^{P}h_is\left(\frac{T}{M}(q-l_i)\right)e^{\mathrm j2\pi(q-l_i)\left(\psi_i+\frac{\phi_i}{M}+\frac{\check k_i}{NM}\right)}=\sum_{i=1}^{P}h_is\left(\frac{T}{M}(q-l_i)\right)e^{\mathrm j2\pi q\left(\frac{\phi_i}{M}+\frac{\check k_i}{NM}\right)}\cdot e^{\mathrm j2\pi(-l_i)\left(\psi_i+\frac{\phi_i}{M}+\frac{\check k_i}{NM}\right)},\tag{5}
$$

其中 $q=0,1,\ldots,NM-1$ 表示采样点。

### B. 多普勒超范围信道下的时频域信号

假设一个 in-range 信道，其参数与 OD 信道相同、但多普勒取 OD 信道的范围内部分，即式（4）中 $\nu_i=\check k_i/(NT)$。记该 in-range 信道与原始 OD 信道的 TF 域接收信号分别为 $\mathbf Y_{\mathrm{TF,in}}$ 与 $\mathbf Y_{\mathrm{TF}}$。显然 $\mathbf Y_{\mathrm{TF,in}}$ 与 [8]、[9] 等现有研究具有相同形式。

**命题 1：** OD 信道下 TF 域接收信号的矩阵形式为

$$
\mathbf Y_{\mathrm{TF}}=\sum_{i=1}^{P}e^{-\mathrm j2\pi l_i\frac{\phi_i}{M}}\boldsymbol\Pi^{\phi_i}\mathbf Y_{\mathrm{TF,in}},\tag{6}
$$

其中 $\boldsymbol\Pi$ 为 $M\times M$ 置换矩阵：

$$
\boldsymbol\Pi=\begin{bmatrix}0&\cdots&0&1\\ 1&\cdots&0&0\\ \vdots&\ddots&\vdots&\vdots\\ 0&\cdots&1&0\end{bmatrix}.\tag{7}
$$

**证明：** 见附录 A。■

由式（6），OD 信道的 TF 域接收信号可视为发射信号沿**多普勒轴循环移位**的叠加，但附有额外相位项（图 2）。

**图 2：** 多普勒超范围信道下的带通 OTFS 系统。（来源：原文第 4 页。）

记 $\mathbf Y_{\mathrm{TF}}$、$\mathbf Y_{\mathrm{TF,in}}$ 的第 $n$ 行第 $m$ 列分别为 $Y_{\mathrm{OD}}[n,m]$、$Y_{\mathrm{in}}[n,m]$。由 [8]，in-range TF 域接收信号可写为

$$
Y_{\mathrm{in}}[n,m]=\sum_{i=1}^{P}h_i\sum_{n'=0}^{N-1}\sum_{m'=0}^{M-1}X[n',m']A_{g_{\mathrm{rx}},g_{\mathrm{tx}}}\left((n-n')T-\tau_i,(m-m')\Delta f-\nu_{i,\mathrm{in}}\right)e^{\mathrm j2\pi(\nu_{i,\mathrm{in}}+m'\Delta f)((n-n')T-\tau_i)}e^{\mathrm j2\pi\nu_{i,\mathrm{in}}n'T},\tag{8}
$$

其中 $A_{g_{\mathrm{rx}},g_{\mathrm{tx}}}(t,f)$ 为 $g_{\mathrm{rx}}(t)$ 与 $g_{\mathrm{tx}}(t)$ 之间的交叉模糊函数（见 [8]）；式（8）中 $\nu_{i,\mathrm{in}}=\check k_i/(NT)$ 为第 $i$ 条路径的 in-range 多普勒频率。利用命题 1，OD 信道下 TF 域接收信号可写为

$$
Y_{\mathrm{OD}}[n,m]=\sum_{i=1}^{P}h_ie^{-\mathrm j2\pi l_i\frac{\phi_i}{M}}e^{\mathrm j2\pi n\frac{\phi_i}{N}}\sum_{n'=0}^{N-1}\sum_{m'=0}^{M-1}X[n',m']A_{g_{\mathrm{rx}},g_{\mathrm{tx}}}\left((n-n')T-\tau_i,\left([m-\phi_i]_M-m'\right)\Delta f-\nu_{i,\mathrm{in}}\right)e^{\mathrm j2\pi(\nu_{i,\mathrm{in}}+m'\Delta f)((n-n')T-\tau_i)}e^{\mathrm j2\pi\nu_{i,\mathrm{in}}n'T}.\tag{9}
$$

若采用理想脉冲，接收信号可简化为

$$
Y_{\mathrm{OD}}[n,m]=\sum_{i=1}^{P}\tilde h_ie^{-\mathrm j2\pi[m-\phi_i]_Ml_i/M}e^{\mathrm j2\pi n(\phi_i/N+\check k_i/N)}X\left[n,[m-\phi_i]_M\right],\tag{10}
$$

其中 $[\cdot]_M$ 表示模 $M$ 运算，$\tilde h_i=h_ie^{-\mathrm j2\pi\tau_i\nu_i}$。

### C. 多普勒超范围信道下的时延—多普勒域信号

记 DD 域接收信号矩阵为 $\mathbf Y_{\mathrm{DD}}$，其第 $k$ 行第 $l$ 列记为 $y[k,l]$。下述命题给出 OD 信道下 DD 域接收信号的输入—输出关系。

**命题 2：** OD 信道的 DD 域接收信号为

$$
y[k,l]=\sum_{k'=0}^{N-1}\sum_{l'=0}^{M-1}x[k',l']h_{w,\mathrm{OD}}(k,k',l,l'),\tag{11}
$$

其中 $h_{w,\mathrm{OD}}$ 为 DD 域的超范围信道响应，可表示为

$$
h_{w,\mathrm{OD}}(k,k',l,l')=\sum_{i=1}^{P}e^{\mathrm j2\pi l\frac{\phi_i}{M}}\tilde h_iw(k-k'-\check k_i,l-l'-l_i).\tag{12}
$$

采样函数 $w(k-k'-\check k_i,l-l'-l_i)$ 来自 [17] 式 (9)，见式（13）（原页脚）。**证明：** 见附录 B。■

比较 in-range 接收信号（式 (49)）与 out-of-range 接收信号（式 (11)）可见：OD 信道在带通系统中沿时延轴引入额外相位项 $e^{\mathrm j2\pi l\phi_i/M}$，其中 $\phi_i$ 对各路径不同；但接收信号的**响应位置与 in-range 信道相同**，因为 $w(k-k'-\check k_i,l-l'-l_i)$ 与 in-range 相同。原因在于式（4）中的 $\psi_i$ 项在 DFT 运算中被消去，而 $\phi_i$ 项沿频率轴产生循环移位（图 2 右侧）；该循环移位随后在 DD 域导致额外相位项。相反，[26] 中的低通系统直接对 TF 域信号采样而无此循环频移，故在 DD 表示中不出现额外相位项。

写成向量化形式，OD 信道的输入—输出关系为

$$
\mathrm{vec}(\mathbf Y_{\mathrm{DD}})=\mathbf H_{\mathrm{OD}}\cdot\mathrm{vec}(\mathbf X_{\mathrm{DD}}),\tag{14}
$$

其中 $\mathrm{vec}(\cdot)$ 表示把矩阵各列堆叠为单列向量的向量化操作，$\mathbf H_{\mathrm{OD}}\in\mathbb C^{MN\times MN}$ 为超范围信道矩阵：

$$
\mathbf H_{\mathrm{OD}}(i,j)=h_{w,\mathrm{OD}}\left(\left\lfloor\frac{i}{M}\right\rfloor,\left\lfloor\frac{j}{M}\right\rfloor,[i]_M,[j]_M\right),\tag{15}
$$

其中 $\lfloor\cdot\rfloor$ 表示向下取整。

在 OD 信道中，现有 OTFS 信道估计方法（[12]、[17]、[27]）只返回 $h_i$、$\check k_i$、$l_i$ 的估计值，**忽略了 OD 信道引入的附加相位项与超范围多普勒参数**。更重要的是，该附加相位项使受小数参数影响的采样点出现**不连续**，从而破坏估计结果的稀疏性——因此这些方法不再适用。

为克服该挑战，基于我们的前期工作 [26]，可采用**互质跨帧结构**：同一 OD 路径在不同帧中呈现不同位置的响应。由此可计算并补偿超范围多普勒与附加相位项，详见下一节。

## III. OD 信道的跨帧 OTFS 框架

本节利用"OD 信道在不同配置的帧中呈现不同响应"这一事实，设计专用的跨帧 OTFS 框架以估计附加相位项与 OD 参数。

基于 [26]，本文用两个不同子帧使超范围多普勒抽头对二者产生不同影响。互质帧结构如图 3 所示。为便于实际实现，两子帧设计为**相同采样率但互质时隙数**，即 $M_1N_1=M_2N_2$ 且 $\mathrm{GCD}(N_1,N_2)=1$，其中 GCD 表示最大公约数。

**图 3：** 跨帧结构。（来源：原文第 5 页。）

如图 3 所示，在物理属性缓慢变化的情况下，两子帧经历同一 OD 信道时会有不同的 **in-range 多普勒抽头**，即式（4）中两子帧的 $\check k_i$ 不同，从而 DD 域响应位置不同，可用于估计真实多普勒值。记两子帧的 DD 域接收信号分别为 $\mathbf y_1$、$\mathbf y_2$：

$$
y_1[k_1,l_1]=\sum_{k'=0}^{N_1-1}\sum_{l'=0}^{M_1-1}x_1[k',l']\sum_{i=1}^{P}e^{\mathrm j2\pi l_1\frac{\phi_{1,i}}{M_1}}\tilde h_{i,1}w(k_1-k'-\check k_{1,i},l_1-l'-l_i),
$$

$$
y_2[k_2,l_2]=\sum_{k'=0}^{N_2-1}\sum_{l'=0}^{M_2-1}x_2[k',l']\sum_{i=1}^{P}e^{\mathrm j2\pi l_2\frac{\phi_{2,i}}{M_2}}\tilde h_{i,2}w(k_2-k'-\check k_{2,i},l_2-l'-l_i).\tag{16}
$$

式（16）中 $N_1,M_1,N_2,M_2$ 为时隙与子载波数；$x_1[k_1,l_1]$、$y_1[k_1,l_1]$（$k_1=0,\ldots,N_1-1$，$l_1=0,\ldots,M_1-1$）与 $x_2[k_2,l_2]$、$y_2[k_2,l_2]$（$k_2=0,\ldots,N_2-1$，$l_2=0,\ldots,M_2-1$）分别表示 DD 域发射与接收信号；$\phi_{1,i},\phi_{2,i}$ 与 $\check k_{1,i},\check k_{2,i}$ 为两子帧的附加相位项与 in-range 多普勒参数（按式（4）计算）；$l_i$ 为归一化时延，对两子帧相同。

为记号简洁，本文假设理想脉冲成形与单导频，即 $x_1[k_{p1},l_{p1}]=x_2[k_{p2},l_{p2}]=1$、其余置零。以单条路径为例，第 $i$ 条路径在两子帧中的接收信号可写为

$$
y_1[k_1,l_1]=x_1[k_{p1},l_{p1}]e^{\mathrm j2\pi l_1\frac{\phi_{1,i}}{M_1}}\tilde h_{i,1}w_\nu(k_1,k_{p1},\check k_{1,i})w_\tau^H(l_1,l_{p1},l_i),
$$

$$
y_2[k_2,l_2]=x_2[k_{p2},l_{p2}]e^{\mathrm j2\pi l_2\frac{\phi_{2,i}}{M_2}}\tilde h_{i,2}w_\nu(k_2,k_{p2},\check k_{2,i})w_\tau^H(l_2,l_{p2},l_i),\tag{17}
$$

其中

$$
w_\tau(l,l',l_i)=e^{-\mathrm j\pi\frac{M-1}{M}(-l+l'+l_i)}\cdot\frac{\sin\left(\pi(l-l'-l_i)\right)}{M\sin\left(\pi(l-l'-l_i)/M\right)},
$$

$$
w_\nu(k,k',k_i)=e^{-\mathrm j\pi\frac{N-1}{N}(-k+k'+k_i)}\cdot\frac{\sin\left(\pi(k-k'-k_i)\right)}{N\sin\left(\pi(k-k'-k_i)/N\right)}.\tag{18}
$$

在单路径情形下，两子帧中时延与多普勒的 in-range 整数部分估计可简单地由接收信号最大值得到：

$$
\left[\hat k_1^I,\hat l_1\right]=\arg\max_{k_1,l_1}\left|y_1[k_1,l_1]\right|,\qquad\left[\hat k_2^I,\hat l_1\right]=\arg\max_{k_2,l_2}\left|y_2[k_2,l_2]\right|.\tag{19}
$$

据 [26]，假设超范围多普勒位于 $0<\nu_i<N_1N_2$ 范围（$N_1N_2$ 为两互质子帧可提供的最大无模糊多普勒），则超范围多普勒的整数部分可由 **CRT** 计算：

$$
\hat k^I=\left(\hat k_1^IN_1\left[N_2^{(-1)}\right]_{N_1}+\hat k_2^IN_2\left[N_1^{(-1)}\right]_{N_2}\right),\tag{20}
$$

其中记号 $[x^{(-1)}]_y$ 表示 $x$ 模 $y$ 的**乘法逆元**（当 $x$ 与 $y$ 互质）。获得真实多普勒后，其余附加相位项 $\hat\phi_{1,i}$、$\hat\phi_{2,i}$ 与 $\hat h_i$ 也可由式（4）及 $\tilde h_i=h_ie^{-\mathrm j2\pi\tau_i\nu_i}$ 得到。时延与多普勒的**小数部分**可用现有方法估计，如 [12]、[17]、[27]。两子帧的帧结构设计见图 3 上部两图。虽然多普勒超范围，但在 in-range 时延下 DD 域导频可保持在保护间隔内，不会干扰数据符号。

然而在多径情形下情况更复杂：两子帧中的冲激匹配成为挑战。直观方法是按冲激幅度匹配不同路径，但受采样点数量有限与电磁波闪烁效应 [28] 影响，该方法可能出现错误匹配。另一可用信息是超范围多普勒的**小数部分**——由于两子帧多普勒分辨率相同，该小数部分在两子帧中保持一致。下一节将利用小数与幅度信息克服匹配问题，并提出有效信道估计方法。

## IV. 基于离格稀疏贝叶斯推断与 CRT 的 OD 信道估计

本节先基于 OD 信道输入—输出关系推导离格模型，再设计利用小数与幅度信息把接收信号分解为多层的信道估计方法，通过不同层配合离格稀疏贝叶斯推断（OGSBI）获得多径 OD 信道的 CSI。

### A. OD 信道的离格模型

回顾单导频、理想脉冲下的接收信号可写为

$$
y[k,l]=x[k_p,l_p]\sum_{i=1}^{P}e^{\mathrm j2\pi l\frac{\phi_i}{M}}\cdot\tilde h_iw(k-k'-\check k_i,l-l'-l_i).\tag{21}
$$

其矩阵形式为

$$
\mathbf Y_{\mathrm{DD}}=x[k_p,l_p]\sum_{i=1}^{P}\tilde h_i\mathbf w_\nu(k_{\nu i})\mathbf w_\tau(l_{\tau i})^H\mathbf E_i=x[k_p,l_p]\mathbf U_{\mathrm{DD}}\mathbf H_{\mathrm{DD}}\check{\mathbf V}_{\mathrm{DD}}^H,\tag{22}
$$

其中 $\mathbf Y_{\mathrm{DD}}\in\mathbb C^{N\times M}$ 为 $y[k,l]$ 的矩阵形式；式（22）中 $\mathbf E_i=\mathrm{diag}\{e^{\mathrm j2\pi(0)\phi_i/M},e^{\mathrm j2\pi(1)\phi_i/M},\ldots,e^{\mathrm j2\pi(M-1)\phi_i/M}\}$，$\mathrm{diag}(\mathbf a)$ 表示以向量 $\mathbf a$ 元素为对角元的对角阵；$\mathbf w_\nu(k_{\nu i})\in\mathbb C^{N\times1}$、$\mathbf w_\tau(l_{\tau i})\in\mathbb C^{M\times1}$、$\mathbf U_{\mathrm{DD}}\in\mathbb C^{N\times P}$、$\mathbf H_{\mathrm{DD}}\in\mathbb C^{P\times P}$ 与 [27] 中形式相同：

$$
\mathbf w_\nu(k_{\nu i})=[w_\nu(0,k_p,k_{\nu i}),\ldots,w_\nu(N-1,k_p,k_{\nu i})]^T,\quad \mathbf w_\tau(l_{\tau i})=[w_\tau(0,l_p,l_{\tau i}),\ldots,w_\tau(M-1,l_p,l_{\tau i})]^T,
$$

$$
\mathbf U_{\mathrm{DD}}=[\mathbf w_\nu(k_{\nu1}),\mathbf w_\nu(k_{\nu2}),\ldots,\mathbf w_\nu(k_{\nu P})],\quad \mathbf H_{\mathrm{DD}}=\mathrm{diag}\{\tilde h_1,\tilde h_2,\ldots,\tilde h_P\}.\tag{23}
$$

式（22）中 $\check{\mathbf V}_{\mathrm{DD}}\in\mathbb C^{M\times P}$ 为表示时延与附加相位项的测量矩阵：

$$
\check{\mathbf V}_{\mathrm{DD}}=[\mathbf E_1\mathbf w_\tau(l_{\tau1}),\mathbf E_2\mathbf w_\tau(l_{\tau2}),\ldots,\mathbf E_P\mathbf w_\tau(l_{\tau P})].\tag{24}
$$

基于 [17] 与 [27]，可把式（22）展开为 OD 信道下的离格信号模型：

$$
\mathbf Y_{\mathrm{DD}}=x[k_p,l_p]\sum_{n_0=1}^{N_0}\sum_{m_0=1}^{M_0}\tilde h_{n_0,m_0}\cdot\tilde{\mathbf w}_\nu(\tilde k_{\nu n_0})\tilde{\mathbf w}_\tau(\tilde l_{\tau m_0})^H\mathbf E_{n_0,m_0},\tag{25}
$$

其中 $N_0,M_0$ 为多普勒与时延维的网格数；$\tilde k_{\nu n_0}$ 与 $\tilde l_{\tau m_0}$ 为多普勒与时延网格点，与 [27] 相同；$\tilde{\mathbf w}_\nu$ 与 $\tilde{\mathbf w}_\tau$ 为采样函数在多普勒与时延维的 Taylor 展开：

$$
\tilde{\mathbf w}_\nu(\tilde k_{\nu n_0})\triangleq\mathbf w_\nu(\tilde k_{\nu n_0})+\beta_{k\nu n_0}\tilde{\mathbf w}'_\nu(\tilde k_{\nu n_0}),\qquad \tilde{\mathbf w}_\tau(\tilde l_{\tau m_0})\triangleq\mathbf w_\tau(\tilde l_{\tau m_0})+\beta_{l\tau m_0}\tilde{\mathbf w}'_\tau(\tilde l_{\tau m_0}),\tag{26}
$$

其中 $\beta_{k\nu n_0}$ 与 $\beta_{l\tau m_0}$ 为多普勒与时延维的离格参数；$\tilde{\mathbf w}'_\tau$ 与 $\tilde{\mathbf w}'_\nu$ 为采样函数在时延与多普勒维的偏导，形式与 [17]、[27] 相同。

在 OD 信道中，时延维的附加相位项（即 $\mathbf E_i$）使每条路径对时延域的影响**不再连续**，这会降低现有方法估计结果的稀疏性并损害性能。

尽管时延维影响因附加相位项而不连续，我们可以先对**多普勒维**分解离格模型（即 [27] 中的"M别 1&2D 小数模型"）：多普勒维离格参数为 $\boldsymbol\beta_{k\nu}\in\mathbb R^{N_0\times1}$，时延维离格参数为 $\boldsymbol\beta_{l\tau}^{2D}\in\mathbb R^{N_0M_0\times1}$。接收信号可写为

$$
\mathbf Y_{\mathrm{DD}}=x[k_p,l_p]\sum_{n_0=1}^{N_0}\tilde{\mathbf w}_\nu(\tilde k_{\nu n_0})\cdot\left(\sum_{m_0=1}^{M_0}\tilde h_{n_0,m_0}\tilde{\mathbf w}_\tau^H(\tilde l_{\tau n_0,m_0})\mathbf E_{n_0,m_0}\right).\tag{27}
$$

于是可写为

$$
\mathbf Y_{\mathrm{DD}}=x[k_p,l_p]\sum_{n_0=1}^{N_0}\tilde{\mathbf w}_\nu(\tilde k_{\nu n_0})\mathbf d_{Un_0}^H+\mathbf n_\nu,\tag{28}
$$

其中

$$
\mathbf d_{Un_0}=\sum_{m_0=1}^{M_0}\tilde h_{n_0,m_0}\tilde{\mathbf w}_\tau^H(\tilde l_{\tau m_0,n_0})\mathbf E_{n_0,m_0}+\mathbf n_{\nu\tau}^H.\tag{29}
$$

### B. 基于跨帧与 OGSBI 的信道估计

由式（28），虽然 $\mathbf E_{n_0,m_0}$ 的信息未知，但可通过式（29）把 $\mathbf d_{Un_0}$ 作为整体处理。把 $N_0$ 个行向量 $\mathbf d_{Un_0}\in\mathbb C^{M\times1}$ 垂直堆叠，构造 $M\times N_0$ 矩阵 $\mathbf D$，其第 $n_0$ 列对应 $\mathbf d_{Un_0}$。基于第 III 节分析，使用跨帧结构，两子帧中不同的 $\mathbf D$ 记为 $\mathbf D_1$、$\mathbf D_2$。在 $\mathbf D_1$ 与 $\mathbf D_2$ 中，由于时延在范围内，两子帧的响应位置在**时延维相同**，但在**多普勒维不同**。由于两子帧分辨率相同，同一路径在 $\mathbf D_1$ 与 $\mathbf D_2$ 中呈现相似的**幅度与小数部分**，该特性使同一路径的响应可在 $\mathbf D_1$ 与 $\mathbf D_2$ 中匹配。

因此，求解式（27）的模型可转化为以下六步。

**1) Step 1 多普勒维分解。** 接收符号先在多普勒维分解：

$$
\mathbf Y_{\mathrm{DD}}=x[k_p,l_p]\tilde{\mathbf U}(\boldsymbol\beta_{k\nu})\mathbf D_U^H+\mathbf n_\nu,\tag{30}
$$

其中 $\tilde{\mathbf U}(\boldsymbol\beta_{k\nu})$ 定义为

$$
\tilde{\mathbf U}(\boldsymbol\beta_{k\nu})=[\tilde{\mathbf w}_\nu(\tilde k_{\nu1}),\tilde{\mathbf w}_\nu(\tilde k_{\nu2}),\ldots,\tilde{\mathbf w}_\nu(\tilde k_{\nu N_0})]=\mathbf U_{\mathrm{DD}}(\tilde{\mathbf k}_\nu)+\mathrm{diag}(\boldsymbol\beta_{k\nu})\mathbf U'_{\mathrm{DD}}(\tilde{\mathbf k}_\nu),\tag{31}
$$

其中 $\mathbf U'_{\mathrm{DD}}$ 为 $\mathbf U_{\mathrm{DD}}$ 的偏导。未知参数为 $\boldsymbol\beta_{k\nu}$ 与 $\mathbf D_U^H$，此处估计器可用 [17] 与 [27] 研究的 **OGSBI**。设估计参数为 $\hat{\boldsymbol\beta}_{k\nu}$、多普勒维估计信道响应为 $\hat{\mathbf D}_U$。采用图 3 的跨帧结构时，记两子帧在式（30）中的估计结果为 $\hat{\boldsymbol\beta}_{k\nu,1}\in\mathbb R^{N_{0,1}\times1}$、$\mathbf D_{U,1}\in\mathbb C^{l_m\times N_{0,1}}$ 与 $\hat{\boldsymbol\beta}_{k\nu,2}\in\mathbb R^{N_{0,2}\times1}$、$\mathbf D_{U,2}\in\mathbb C^{l_m\times N_{0,2}}$，其中 $N_{0,1}$、$N_{0,2}$ 为多普勒维虚拟网格数，$l_m$ 为两子帧最大时延。

**2) Step 2 从同一路径选冲激。** 记 $|\mathbf D_{U,1}|$ 与 $|\mathbf D_{U,2}|$ 的第 $i$ 列为 $\mathbf d_1$ 与 $\mathbf d_2$。对 $\mathbf d_1$、$\mathbf d_2$ 做峰值检测，随后做区域扩展：对每个检测到的局部极大，沿 $\mathbf d_1$、$\mathbf d_2$ 双向扩展以纳入取值单调递减的相邻点。所得集合记为 $k_{\mathrm{PEAK}1}$ 与 $k_{\mathrm{PEAK}2}$，其中每个元素对应一个局部峰周围的扩展区域。在 $k_{\mathrm{PEAK}1}$ 与 $k_{\mathrm{PEAK}2}$ 中，若两峰值足够接近，则认为它们来自同一路径。

**3) Step 3 基于小数信息确定匹配点。** 若 $k_{\mathrm{PEAK}1}$ 与 $k_{\mathrm{PEAK}2}$ 被选为同一路径，其对应的小数参数记为 $\hat\beta_{k\nu,2}(k_{\mathrm{PEAK}1})$ 与 $\hat\beta_{k\nu,2}(k_{\mathrm{PEAK}1})$（原文如此）。在两者间找差异最小的点作为匹配点，提取其 in-range 多普勒并按式（20）计算超范围多普勒；把超范围多普勒补偿到 $k_{\mathrm{PEAK}1}$ 与 $k_{\mathrm{PEAK}2}$。若未匹配，则认为该点在范围内。

**4) Step 4 计算各点的 OD 状态。** 对全部 $\mathbf D_{U,1}$、$\mathbf D_{U,2}$ 迭代 Step 2、3，得到其中每点的多普勒结果；并计算每点的 OD 状态 $\hat{\boldsymbol\Phi}_1\in\mathbb C^{l_m\times N_{0,1}}$、$\hat{\boldsymbol\Phi}_2\in\mathbb C^{l_m\times N_{0,2}}$：

$$
\hat{\boldsymbol\Phi}_1=\begin{bmatrix}(\hat\phi_{0,1})_1&(\hat\phi_{1,2})_1&\cdots&(\hat\phi_{1,N_{0,1}})_1\\ (\hat\phi_{1,1})_1&(\hat\phi_{2,2})_1&\cdots&(\hat\phi_{2,N_{0,1}})_1\\ \vdots&&&\vdots\\ (\hat\phi_{l_m,1})_1&(\hat\phi_{l_m,2})_1&\cdots&(\hat\phi_{l_m,N_{0,1}})_1\end{bmatrix},\quad \hat{\boldsymbol\Phi}_2=\begin{bmatrix}(\hat\phi_{0,1})_2&(\hat\phi_{1,2})_2&\cdots&(\hat\phi_{1,N_{0,2}})_2\\ (\hat\phi_{1,1})_2&(\hat\phi_{2,2})_2&\cdots&(\hat\phi_{2,N_{0,2}})_2\\ \vdots&&&\vdots\\ (\hat\phi_{l_m,1})_2&(\hat\phi_{l_m,2})_2&\cdots&(\hat\phi_{l_m,N_{0,2}})_2\end{bmatrix},\tag{32}
$$

其中 $(\hat\phi_{i,j})_1$、$(\hat\phi_{i,j})_2$ 为式（4）中 $\phi_i$ 的估计。为更清晰，计算 $\hat{\boldsymbol\Phi}_1$、$\hat{\boldsymbol\Phi}_2$ 的流程见**算法 1**；其 Step 9 中常数 $\lambda$ 为用于判定两冲激属于同一路径的启发式阈值，例如 $\lambda=0.75$ 表示一个峰至少为另一个的 75%。

**5) Step 5 对接收信号分层。** 下面分别处理两子帧。以子帧 1 为例，设 $\Psi_1$ 为 $\hat{\boldsymbol\Phi}_1$ 中不同元素的个数，即 $(\hat\phi_{i,j})_1\in\{\hat\phi_1,\hat\phi_2,\ldots,\hat\phi_i,\ldots,\hat\phi_{\Psi_1}\}$。则 $\mathbf D_{U,1}$ 可表示为

$$
\mathbf D_{U,1}=\mathbf D_{U,11}+\mathbf D_{U,12}+\ldots+\mathbf D_{U,1\Psi_1},\tag{33}
$$

其中 $\mathbf D_{U,1i}$ 定义为 $\mathbf D_{U,1}$ 中 OD 矩阵 $\hat{\boldsymbol\Phi}_1$ 等于 $\hat\phi_i$ 的坐标上的元素集合：

$$
\mathbf D_{Ui}(i,j)=\begin{cases}\mathbf D_U(i,j),&\hat{\boldsymbol\Phi}(i,j)=\hat\phi_i,\\ 0,&\text{其他}.\end{cases}\tag{34}
$$

如图 4 所示，接收信号可分解为 $\Psi_1$ 层，每层中附加相位项的影响来自同一 $\hat\phi_i$。

**图 4：** 跨帧 OTFS 信道估计。（来源：原文第 8 页。）

**6) Step 6 逐层估计信道。** 分层后，可通过 $\mathbf D_{U,1i}$ 分别进行信道估计。对每个 $\mathbf D_{U,1i}\in\{\mathbf D_{U,11},\mathbf D_{U,12},\ldots,\mathbf D_{U,1\Psi_1}\}$，可表示为 $\mathbf D_{U,1i}=[\mathbf d_{U1},\ldots,\mathbf d_{UN_0}]$，其每列写为

$$
\mathbf d_{Un_0}=\hat{\mathbf E}_i\tilde{\mathbf V}(\boldsymbol\beta_{k\nu}|_{n=n_0})\mathbf h_{Un_0}+\mathbf n_\nu(n_0),\tag{35}
$$

其中

$$
\hat{\mathbf E}_i=\mathrm{diag}\{e^{\mathrm j2\pi(0)\hat\phi_i/M_1},e^{\mathrm j2\pi(1)\hat\phi_i/M_1},\ldots,e^{\mathrm j2\pi(M_1-1)\hat\phi_i/M_1}\}.\tag{36}
$$

类似地，可用 OGSBI 估计式（35）中的未知参数 $\hat{\boldsymbol\beta}_{l\tau}^{2D}$ 与 $\hat{\mathbf h}_{Un_0}$。

**表 III：** 离格方法的复杂度比较。（来源：原文第 8 页。）

| 方法 | 复杂度 |
|---|---|
| [27] 中的组合方法（Combined in [27]） | $\mathcal O(N_0M_0^2M)$ |
| [17] 的 2D 离格方法（2D off-grid method in [17]） | $\mathcal O(N_0^2NM_0^2M)$ |
| 本文方法（Proposed method） | $\mathcal O(\Phi N_0M_0^2M)$，$\Phi\in[1,M]$ |

按上述流程可获得每层的信道估计结果。通过相位补偿，OD 信道的影响被减轻，从而恢复估计结果的稀疏性；最终对所有层结果求和得到整体信道估计。注意本文为简化采用理想脉冲，但当采用实际脉冲（如矩形脉冲）时所提方法**不受影响**：第一，第 II 节推导的 IO 模型与命题基于任意脉冲；第二，用于计算小数信息的 OGSBI 方法也针对实际脉冲开发 [29]；第三，CRT 算法利用 DD 域冲激位置，几乎不受脉冲形状影响。

```text
Algorithm 1 用 D̂_{U,1}、β̂_{kν,1} 与 D̂_{U,2}、β̂_{kν,2} 计算 Φ̂_1 与 Φ̂_2
输入：D̂_{U,1}, β̂_{kν,1}, D̂_{U,2}, β̂_{kν,2}
输出：Φ̂_1, Φ̂_2
1:  Φ̂_1 = 0, Φ̂_2 = 0
2:  for i = 0, 1, 2, …, l_m do
3:      d_1 = |D̂_{U,1}|(l_p + i), d_2 = |D̂_{U,2}|(l_p + i)
4:      对 d_1、d_2 做峰值检测与区域扩展，结果记为 k_PEAK1、k_PEAK2（细节见 §IV-B Step 2）
5:      按峰值幅度降序排列 k_PEAK1、k_PEAK2 中的元素
6:      for j = 1 to min{P_1, P_2} do
7:          记 d_1(k_PEAK1(j)) 与 d_2(k_PEAK2(j)) 的局部极大为 PL_1、PL_2
8:          记 PL_1、PL_2 在 k_PEAK1(j) 与 k_PEAK1(j) 中的坐标为 V_1、V_2   // 原文两处均写 k_PEAK1
9:          if PL_1 − PL_2 < λ·min{PL_1, PL_2} 且 |V_1 − V_2| > 1 then
10:             在 β̂_{kν,2}(k_PEAK1(j)) 与 β̂_{kν,2}(k_PEAK1(j)) 间找差异最小点，坐标记为 k_PM1、k_PM2
11:             用式 (20) 由 k_PM1、k_PM2 计算超范围多普勒，并由式 (4) 计算 φ̂_{i,1}、φ̂_{i,2}
12:             Φ̂_1(i, k_PEAK1) = φ̂_{i,1}；Φ̂_2(i, k_PEAK2) = φ̂_{i,2}
13:         end if
14:     end for
15: end for
```

### C. 计算复杂度分析

为简化，假设两子帧参数近似相等，即 $N\approx N_1\approx N_2$、$M\approx M_1\approx M_2$；并假设多普勒与延时的虚拟网格点数满足 $N_0\ge N$、$M_0\ge M$。所提方法的复杂度由三部分组成。第一，式（30）的初始多普勒维分解计算量为 $\mathcal O(N_0^2N)$（如 [30] 所述）。第二，式（20）中每次 CRT 计算复杂度为 $\mathcal O(\log N)$ [26]；最坏情形下每个 DD 点都需一次 CRT 计算，则此步为 $\mathcal O(NM\log N)$。点匹配与分层步骤因不涉及复杂矩阵运算，其复杂度可忽略。最后，分层后每个 $\boldsymbol\Phi$ 层的 OGSBI 时间复杂度为 $\mathcal O(M_0^2MN_0)$ [27]。因此所提方法总复杂度为

$$
\mathcal O(N_0^2N)+\mathcal O(NM\log N)+\mathcal O(\Phi M_0^2MN_0)=\mathcal O(\Phi M_0^2MN_0),
$$

其中 $\Phi$ 为层数，依信道而定，取值范围为 $1$ 到 $M$。与其他离格方法的比较汇总于表 III，表明所提方法复杂度介于 [17] 与 [27] 的方法之间。

## V. 仿真结果与讨论

本节通过 OD 信道评估所提方法的信道估计性能。系统参数设置如下：多普勒与时延偏移分别在 $[-\nu_{\max},\nu_{\max}]$ 与 $[0,\tau_{\max}]$ 范围内随机均匀生成（如 [31]），$\tau_{\max}=2.6\times10^{-6}$ s，$h_i$ 按 [17] 设置；导频—数据比为 30 dB，网格分辨率为 0.5，贝叶斯框架参数按 [27] 设置。与 in-range 情形相比，超范围信道响应因额外项 $e^{\mathrm j2\pi l\phi_i/M}$ 具有更多自由度。因此我们定义 OD 信道的 NMSE（归一化均方误差）如式（37）（原页脚）：

$$
\mathrm{NMSE}=\frac{\sum_{k=0}^{N-1}\sum_{k'=0}^{N-1}\sum_{l=0}^{M-1}\sum_{l'=0}^{M-1}\left|h_{w,\mathrm{OD}}(k,k',l,l')-\hat h_{w,\mathrm{OD}}(k,k',l,l')\right|^2}{\sum_{k=0}^{N-1}\sum_{k'=0}^{N-1}\sum_{l=0}^{M-1}\sum_{l'=0}^{M-1}\left|h_{w,\mathrm{OD}}(k,k',l,l')\right|^2}.\tag{37}
$$

式（37）中 $\hat h_{w,\mathrm{OD}}$ 由估计信道参数按式（53）构造，$h_{w,\mathrm{OD}}$ 由原始信道参数生成。其他系统设置（含跨帧结构）详见表 IV，参数主要基于 3GPP NR FR2 标准 [19]。为公平比较，用 "Subframe 1" 与 "Subframe 2" 为所提方法构造跨帧结构，其 NMSE 按 $0.5\times(\mathrm{NMSE}[\text{Frame }1]+\mathrm{NMSE}[\text{Frame }2])$ 计算；"Frame 0" 用于现有方法（即 [12] 的嵌入导频法、[17] 的 2D 离格法、[27] 的 SBL 组合法），其 NMSE 按 $\mathrm{NMSE}[\text{Frame }0]$ 计算。二者占用相同时频资源，所有仿真均在 1000 次独立试验上平均。

**表 IV：** 通信用的 OTFS 参数。（来源：原文第 9 页。）

| 参数 | Frame 0 | Subframe 1 | Subframe 2 |
|---|---|---|---|
| 载波频率 [GHz] | 48.20 | 48.20 | 48.20 |
| 频率带宽 [MHz] | 3.48 | 3.48 | 3.48 |
| 时间长度 [ms] | 1 | 0.5 | 0.5 |
| 子载波间隔 $\Delta f$ [kHz] | 60 | 60 | 60 |
| 子载波数 $M$ | 58 | 58 | 60 |
| 时隙数 $N$ | 60 | 30 | 29 |
| 距离分辨率 [m] | 86 | 86 | 86 |
| 速度分辨率 [km/h] | 11.2 | 22.4 | 22.4 |
| 速度尺度 [km/h] | ±674 | ±674 | ±652 |
| 无模糊速度 [km/h] | ±674 | ±19500 | ±19500 |

### A. 多普勒增大时的 NMSE 性能

图 5 给出所提方法与现有方法在多普勒从 in-range 到 out-of-range 增大时的 NMSE 性能：SNR 设为 20 dB，多径数为 1 至 5，最大多普勒从 4 kHz 变化到 136 kHz（约为 $[-\Delta f/2,\Delta f/2]$ 范围的 5 倍）。

**图 5：** SNR = 20 dB 时 NMSE 性能随多普勒增大的变化。（来源：原文第 9 页。）

显然，当最大多普勒超范围（即 $\nu_m$ 大于 30 kHz，图中灰色虚线右侧）时，所提方法的 NMSE 性能远优于其他方法。这是因为所提方法能有效估计超范围信道响应，而现有方法未考虑该情形。值得注意的是，由于多普勒频移在指定最大值内随机生成，这些仿真本身涵盖了"部分路径 in-range、部分 out-of-range"的混合场景，从而验证了方法的鲁棒性。

然而当多普勒在范围内（灰色虚线左侧）时，所提方法的 NMSE 偶尔可能比现有方法差。这是因为子帧估计的多普勒频率可能受噪声影响，从而在匹配时选错输入点。此外图中显示所提方法性能相对现有方法**波动更大**：这归因于 CRT 的特性——**微小的匹配输入误差会导致超范围多普勒估计出现显著误差**，从而造成 NMSE 性能退化与波动。

从图中还可看出，无论 out-of-range 还是 in-range，随多径数增加，所提方法 NMSE 性能退化而现有方法受影响较小。这是因为所提方法基于 in-range 与 out-of-range 路径的区分来估计原始 DD 域，当多径数增加时，原始域中的响应抽头更可能在接收信号上叠加，即图 4 基本 DD 域中绿、红抽头重叠；在此重叠条件下，DD 域接收信号变为来自不同路径的多个层的叠加，使准确定分 in-range 与 out-of-range 响应变得困难，进而影响 NMSE。

### B. SNR 增大时的 NMSE 与 BER 性能

图 6、图 7 给出 OD 信道中随 SNR 增大的 NMSE 及相应 BER 性能：SNR 从 −5 dB 变化到 20 dB，最大多普勒设为 150 kHz，远大于 in-range 上限 30 kHz。图 6、7 中对发射符号采用 QPSK 调制，对接收符号采用 DD 域最小均方误差（MMSE）检测 [24, 第 6.3.1 章]。

**图 6：** $\nu_{\max}=150$ kHz 时 NMSE 性能随 SNR 增大的变化。（来源：原文第 10 页。）

**图 7：** BER 性能随 SNR 的变化（设置同图 6）。（来源：原文第 10 页。）

可观察到，在严重 OD 信道中，所提方法的 NMSE 性能随 SNR 增大逐渐改善，BER 相应下降。这表明所提方法能有效估计 OD 信道并在接收端实现可靠检测。在高 SNR（如 SNR ≥ 15 dB）下，图 6、7 中路径 3 与路径 5 的 NMSE 改善很小：原因是 SNR 对信道估计性能的提升已达极限，剩余误差主要来自多径分量间干扰。

相反，由于忽略 OD 信道引入的附加相位项，现有方法在极端 OD 条件下信道估计**完全失效**，导致接收端检测无效，BER 约为 0.5。还可观察到 NMSE 与 BER 性能随多径数增加而退化：这是因为真实 DD 域中的响应在基本 DD 域中更易重叠，使接收信号难以完美分层，从而影响性能（如 §V-A 末尾所分析）。

### C. 带宽增大时的 NMSE 性能

图 8 给出带宽增大时的 NMSE 性能。仿真采用扩展车辆 A（EVA）信道（9 径，如 [12]），多普勒按 [8] 中的 Jakes 模型生成、最大多普勒频移 150 kHz，SNR = 20 dB。

**图 8：** EVA 信道（$\nu_{\max}=150$ kHz）中 NMSE 性能随带宽增大的变化。（来源：原文第 10 页。）

图 8 中横轴为通过改变子载波数得到的带宽，不同帧的对应配置列于表 V：其中 "Frame 0" 指现有方法使用的单帧，"Subframe 1"、"Subframe 2" 为所提方法所用子帧，其他设置同表 IV。注意比较是公平的："Frame 0" 使用 60 个时隙，而 "Subframe 1" 为 30、"Subframe 2" 为 29。随带宽增大，可观察到 NMSE 性能改善：这是因为系统时延分辨率随带宽提高而增强，不仅能更准确估计时延，还能降低多径分量重叠概率，从而提升信道估计性能。

**表 V：** 不同带宽对应的子载波数。（来源：原文第 10 页。）

| 带宽 [MHz] | Frame 0 子载波数 | Subframe 1 子载波数 | Subframe 2 子载波数 |
|---|---|---|---|
| 3.48 | 60 | 60 | 58 |
| 10.44 | 180 | 180 | 174 |
| 17.4 | 300 | 300 | 290 |
| 24.36 | 420 | 420 | 406 |
| 31.32 | 540 | 540 | 522 |
| 38.28 | 660 | 660 | 638 |
| 45.24 | 780 | 780 | 754 |
| 52.2 | 900 | 900 | 870 |

## VI. 结论

本文首先针对多载波波形引入多普勒超范围（OD）信道，并推导 OTFS 在该信道下的输入—输出关系，表明 OD 信道下 OTFS 的接收信号是**有效 DD 域上原 DD 域信号的相位偏移叠加**。针对 OD 信道，我们提出一种基于跨帧 OTFS 的新信道估计方法：通过设置互质子帧，原始 DD 域信号在不同子帧中呈现不同特性；随后对子帧做离格分解，并利用小数与幅度信息匹配来自同一路径的响应抽头；再通过 CRT 计算每个采样点的超范围状态，据此把 DD 域信号划分为多层，从而把 OD 信道估计问题转化为若干单层任务。仿真结果表明所提方法能有效估计 OD 信道。当多径响应重叠时，仅由接收帧获得的信息可能不足以准确判定子帧的 OD 状态；这是一个挑战，将在未来工作中进一步研究，利用 ISAC 系统中的感知增益可能提供潜在解决方案。

## 附录 A 命题 1 的证明：OD 信道 TF 域接收信号的矩阵形式

记 TF 域接收信号为 $\mathbf Y_{\mathrm{TF}}\in\mathbb C^{M\times N}$，可表示为

$$
\mathbf Y_{\mathrm{TF}}=\sum_{i=1}^{P}[\mathbf y_{i,0},\mathbf y_{i,1},\ldots,\mathbf y_{i,N-1}],\tag{38}
$$

其中 $\mathbf y_{i,n}\in\mathbb C^{M\times1}$ 为第 $i$ 条路径第 $n$ 个时隙的信号：

$$
\mathbf y_{i,n}=\mathbf F_M\begin{bmatrix}g_{\mathrm{rx}}(0)\cdot r_i[nM]\\ g_{\mathrm{rx}}\left(\frac{T}{M}\right)\cdot r_i[nM+1]\\ \vdots\\ g_{\mathrm{rx}}\left(\frac{T(M-1)}{M}\right)\cdot r_i[nM+M-1]\end{bmatrix}.\tag{39}
$$

式（39）中 $\mathbf F_M$ 为 $M\times M$ 的 DFT 矩阵，$g_{\mathrm{rx}}$ 为接收滤波器，$r_i[q]$ 为第 $i$ 条路径的第 $q$ 个采样信号（$r[q]=\sum_{i=1}^{P}r_i[q]$，$r[q]$ 来自式（5））：

$$
r_i[q]=h_is\left(\frac{T}{M}(q-l_i)\right)e^{\mathrm j2\pi q\left(\frac{\phi_i}{M}+\frac{\check k_i}{NM}\right)}e^{\mathrm j2\pi(-l_i)\left(\psi_i+\frac{\phi_i}{M}+\frac{\check k_i}{NM}\right)}.
$$

把 $r_i[q]$ 的 in-range 部分（式（4）中 $\check k_i$ 的影响）写为 $r_{i,\mathrm{in}}[q]=h_is\left(\frac{T}{M}(q-l_i)\right)e^{\mathrm j2\pi q\frac{\check k_i}{NM}}e^{-\mathrm j2\pi l_i(\check k_i/NM)}$，则

$$
r_i[q]=r_{i,\mathrm{in}}[q]e^{\mathrm j2\pi q\frac{\phi_i}{M}}e^{-\mathrm j2\pi l_i\frac{\phi_i}{M}}.\tag{40}
$$

取 $\mathbf E_i=\mathrm{diag}\{e^{\mathrm j2\pi(0)\phi_i/M},e^{\mathrm j2\pi(1)\phi_i/M},\ldots,e^{\mathrm j2\pi(M-1)\phi_i/M}\}$，把式（40）代入（39）可进一步表达（式 (41)，原页脚），其中 $\boldsymbol\Pi$ 为与式（7）同形的 $M\times M$ 置换矩阵。显然 $\mathbf y_{i,n}$ 的 in-range 部分即式（41）的最后两项：

$$
\mathbf y_{i,n,\mathrm{in}}=\mathbf F_M\begin{bmatrix}g_{\mathrm{rx}}(0)\cdot r_{i,\mathrm{in}}[nM]\\ g_{\mathrm{rx}}\left(\frac{T}{M}\right)\cdot r_{i,\mathrm{in}}[nM+1]\\ \vdots\\ g_{\mathrm{rx}}\left(\frac{T(M-1)}{M}\right)\cdot r_{i,\mathrm{in}}[nM+M-1]\end{bmatrix}.\tag{42}
$$

因此把式（42）代入（41），$\mathbf y_{i,n}$ 可写为

$$
\mathbf y_{i,n}=e^{-\mathrm j2\pi l_i\frac{\phi_i}{M}}e^{\mathrm j2\pi n\phi_i}\boldsymbol\Pi^{\phi_i}\mathbf y_{i,n,\mathrm{in}}.\tag{43}
$$

对 $n$ 求和并利用 $\mathbf Y_{\mathrm{TF}}$ 的定义即得命题 1 的式（6）。■

## 附录 B 命题 2 的证明：OD 信道 DD 域输入—输出关系

在接收端，记串并转换后的时域信号为 $\mathbf R\in\mathbb C^{M\times N}$，即 $\mathbf R=\mathrm{vec}^{-1}\{[r[0],r[1],\ldots,r[NM-1]]^T\}$：

$$
\mathbf R=\begin{bmatrix}r[0]&r[M]&\cdots&r[M(N-1)]\\ r[1]&r[M+1]&\cdots&r[M(N-1)+1]\\ \vdots&\vdots&&\vdots\\ r[M-1]&r[2M-1]&\cdots&r[MN-1]\end{bmatrix}.\tag{45}
$$

记 $\mathbf R$ 的每行为 $\mathbf r_n$，即 $\mathbf r_n=[r[n],r[n+M],\ldots,r[n+M(N-1)]]$。由 [9]，DD 域信号 $\mathbf Y_{\mathrm{DD}}\in\mathbb C^{M\times N}$ 可表示为

$$
\mathbf Y_{\mathrm{DD}}=\begin{bmatrix}g_{\mathrm{rx}}(0)\cdot\mathbf r_0\cdot\mathbf F_N\\ g_{\mathrm{rx}}\left(\frac{T}{M}\right)\cdot\mathbf r_1\cdot\mathbf F_N\\ \vdots\\ g_{\mathrm{rx}}\left(\frac{T(M-1)}{M}\right)\cdot\mathbf r_{M-1}\cdot\mathbf F_N\end{bmatrix}=\mathbf G_{\mathrm{rx}}\mathbf R\mathbf F_N,\tag{46}
$$

其中 $\mathbf F_N$ 为 $N\times N$ 的 DFT 矩阵，$\mathbf G_{\mathrm{rx}}=\mathrm{diag}\{g_{\mathrm{rx}}(0),g_{\mathrm{rx}}(T/M),\ldots,g_{\mathrm{rx}}(T(M-1)/M)\}$，$g_{\mathrm{rx}}$ 为接收滤波器。与上一小节类似，令 $r_{i,\mathrm{in}}[q]=h_is\left(\frac{T}{M}(q-l_i)\right)e^{\mathrm j2\pi(q-l_i)\frac{\check k_i}{NM}}$ 表示第 $i$ 条路径的 in-range 部分，其矩阵形式为 $\mathbf R_{i,\mathrm{in}}=[\mathbf r_{0,\mathrm{in}},\mathbf r_{1,\mathrm{in}},\ldots,\mathbf r_{M-1,\mathrm{in}}]^T$，其中 $\mathbf r_{m,\mathrm{in}}=[r_{i,\mathrm{in}}[m],r_{i,\mathrm{in}}[m+M],\ldots,r_{i,\mathrm{in}}[m+M(N-1)]]$ 为 $\mathbf R_{i,\mathrm{in}}$ 的第 $m$ 行。则 DD 域接收信号可表示为

$$
\mathbf Y_{\mathrm{DD}}=\sum_{i=1}^{P}e^{\mathrm j2\pi(-l_i)\left(\psi_i+\frac{\phi_i}{M}\right)}\begin{bmatrix}e^{\mathrm j2\pi(0)\phi_i/M}\cdot g_{\mathrm{rx}}(0)\cdot\mathbf r_{0,\mathrm{in}}\cdot\mathbf F_N\\ e^{\mathrm j2\pi(1)\phi_i/M}\cdot g_{\mathrm{rx}}\left(\frac{T}{M}\right)\cdot\mathbf r_{1,\mathrm{in}}\cdot\mathbf F_N\\ \vdots\\ e^{\mathrm j2\pi(M-1)\phi_i/M}g_{\mathrm{rx}}\left(\frac{T(M-1)}{M}\right)\mathbf r_{M-1,\mathrm{in}}\mathbf F_N\end{bmatrix}=\sum_{i=1}^{P}e^{\mathrm j2\pi(-l_i)\left(\psi_i+\frac{\phi_i}{M}\right)}\mathbf E_i\mathbf G_{\mathrm{rx}}\mathbf R_{i,\mathrm{in}}\mathbf F_N,\tag{47}
$$

其中 $\mathbf E_i=\mathrm{diag}\{e^{\mathrm j2\pi(0)\phi_i/M},e^{\mathrm j2\pi(1)\phi_i/M},\ldots,e^{\mathrm j2\pi(M-1)\phi_i/M}\}$ 为 OD 信道引入的附加相位项。in-range DD 域接收信号同样可用 $\mathbf R_{i,\mathrm{in}}$ 表达（式 (48)，与 [9] 相同）：

$$
\mathbf Y_{\mathrm{in}}=\sum_{i=1}^{P}\begin{bmatrix}g_{\mathrm{rx}}(0)\cdot\mathbf r_{0,\mathrm{in}}\cdot\mathbf F_N\\ g_{\mathrm{rx}}\left(\frac{T}{M}\right)\cdot\mathbf r_{1,\mathrm{in}}\cdot\mathbf F_N\\ \vdots\\ g_{\mathrm{rx}}\left(\frac{T(M-1)}{M}\right)\cdot\mathbf r_{M-1,\mathrm{in}}\cdot\mathbf F_N\end{bmatrix}=\sum_{i=1}^{P}\mathbf G_{\mathrm{rx}}\mathbf R_{i,\mathrm{in}}\mathbf F_N.\tag{48}
$$

记 $\mathbf Y_{\mathrm{DD}}$、$\mathbf Y_{\mathrm{in}}$ 的第 $l$ 行第 $k$ 列为 $y[l,k]$、$y_{\mathrm{in}}[l,k]$，则 in-range 输入—输出关系为

$$
y_{\mathrm{in}}[l,k]=\sum_{i=1}^{P}h_ie^{-\mathrm j2\pi l_i\frac{\check k_i}{NM}}\sum_{k'=0}^{N-1}\sum_{l'=0}^{M-1}x[k',l']w(k-k'-\check k_i,l-l'-l_i),\tag{49}
$$

其中 $w(k-k'-\check k_i,l-l'-l_i)$ 见式（13）。把 $y_{\mathrm{in}}[l,k]$ 的第 $i$ 条路径写为

$$
y'_{i,\mathrm{in}}[k,l]=h_ie^{-\mathrm j2\pi l_i\frac{\check k_i}{NM}}\sum_{k'=0}^{N-1}\sum_{l'=0}^{M-1}x[k',l']w(k-k'-\check k_i,l-l'-l_i).\tag{50}
$$

与 TF 域类似，把 $\mathbf Y_{\mathrm{DD}}$（式 (47)）与 $\mathbf Y_{\mathrm{in}}$（式 (48)）的关系推广到 $y[l,k]$ 与 $y_{\mathrm{in}}[l,k]$，可写出 out-of-range DD 域信号：

$$
y[k,l]=\sum_{i=1}^{P}e^{\mathrm j2\pi(-l_i)\left(\psi_i+\frac{\phi_i}{M}\right)}e^{\mathrm j2\pi l\frac{\phi_i}{M}}y'_{i,\mathrm{in}}[k,l].\tag{51}
$$

式（51）可进一步写为

$$
y[k,l]=\sum_{k'=0}^{N-1}\sum_{l'=0}^{M-1}x[k',l']h_{w,\mathrm{OD}}(k,k',l,l'),\tag{52}
$$

其中 $h_{w,\mathrm{OD}}$ 为 DD 域超范围信道响应：

$$
h_{w,\mathrm{OD}}(k,k',l,l')=\sum_{i=1}^{P}e^{\mathrm j2\pi l\frac{\phi_i}{M}}\cdot\tilde h_iw(k-k'-\check k_i,l-l'-l_i),\tag{53}
$$

其中 $\tilde h_i=h_ie^{-\mathrm j2\pi\tau_i\nu_i}$。■

## 参考文献（英文原书目）

[1] R. Liu, H. Lin, H. Lee, F. Chaves, H. Lim, and J. Sköld, "Beginning of the journey toward 6G: Vision and framework," IEEE Commun. Mag., vol. 61, no. 10, pp. 8–9, Oct. 2023.
[2] Z. Zhang et al., "6G wireless networks: Vision, requirements, architecture, and key technologies," IEEE Veh. Technol. Mag., vol. 14, no. 3, pp. 28–41, Sep. 2019.
[3] Y. Su, Y. Liu, Y. Zhou, J. Yuan, H. Cao, and J. Shi, "Broadband LEO satellite communications: Architectures and key technologies," IEEE Wireless Commun., vol. 26, no. 2, pp. 55–61, Apr. 2019.
[4] R. He et al., "5G for railways: Next generation railway dedicated communications," IEEE Commun. Mag., vol. 60, no. 12, pp. 130–136, Dec. 2022.
[5] T. Mao, L. Zhang, Z. Xiao, Z. Han, and X.-G. Xia, "Terahertz-band near-space communications: From a physical-layer perspective," IEEE Commun. Mag., vol. 62, no. 2, pp. 110–116, Feb. 2024.
[6] A. Saeed, O. Gurbuz, A. O. Bicen, and M. A. Akkas, "Variable-bandwidth model and capacity analysis for aerial communications in the terahertz band," IEEE J. Sel. Areas Commun., vol. 39, no. 6, pp. 1768–1784, Jun. 2021.
[7] R. Hadani et al., "Orthogonal time frequency space modulation," in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), Mar. 2017, pp. 1–6.
[8] P. Raviteja, K. T. Phan, Y. Hong, and E. Viterbo, "Interference cancellation and iterative detection for orthogonal time frequency space modulation," IEEE Trans. Wireless Commun., vol. 17, no. 10, pp. 6501–6515, Oct. 2018.
[9] P. Raviteja, Y. Hong, E. Viterbo, and E. Biglieri, "Practical pulse-shaping waveforms for reduced-cyclic-prefix OTFS," IEEE Trans. Veh. Technol., vol. 68, no. 1, pp. 957–961, Jan. 2019.
[10] G. D. Surabhi, R. M. Augustine, and A. Chockalingam, "On the diversity of uncoded OTFS modulation in doubly-dispersive channels," IEEE Trans. Wireless Commun., vol. 18, no. 6, pp. 3049–3063, Jun. 2019.
[11] S. Li, J. Yuan, W. Yuan, Z. Wei, B. Bai, and D. W. K. Ng, "Performance analysis of coded OTFS systems over high-mobility channels," IEEE Trans. Wireless Commun., vol. 20, no. 9, pp. 6033–6048, Sep. 2021.
[12] P. Raviteja, K. T. Phan, and Y. Hong, "Embedded pilot-aided channel estimation for OTFS in delay–Doppler channels," IEEE Trans. Veh. Technol., vol. 68, no. 5, pp. 4906–4917, May 2019.
[13] Y. Liang, P. Fan, Q. Wang, and X. He, "Two-dimensional delay-Doppler pilots and channel estimation for multi-antenna OTFS in doubly dispersive channels," IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7612–7623, Jul. 2024.
[14] W. Yuan, S. Li, Z. Wei, J. Yuan, and D. W. K. Ng, "Data-aided channel estimation for OTFS systems with a superimposed pilot and data transmission scheme," IEEE Wireless Commun. Lett., vol. 10, no. 9, pp. 1954–1958, Sep. 2021.
[15] W. Shen, L. Dai, J. An, P. Fan, and R. W. Heath, "Channel estimation for orthogonal time frequency space (OTFS) massive MIMO," IEEE Trans. Signal Process., vol. 67, no. 16, pp. 4204–4217, Aug. 2019.
[16] F. Liu, Z. Yuan, Q. Guo, Z. Wang, and P. Sun, "Message passing-based structured sparse signal recovery for estimation of OTFS channels with fractional Doppler shifts," IEEE Trans. Wireless Commun., vol. 20, no. 12, pp. 7773–7785, Dec. 2021.
[17] Z. Wei, W. Yuan, S. Li, J. Yuan, and D. W. K. Ng, "Off-grid channel estimation with sparse Bayesian learning for OTFS systems," IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 7407–7426, Sep. 2022.
[18] X. Li, P. Fan, Q. Wang, and Z. Liu, "Grid evolution for doubly fractional channel estimation in OTFS systems," IEEE Trans. Veh. Technol., vol. 74, no. 2, pp. 3486–3490, Feb. 2025.
[19] 3GPP TS 38.204 NR; Base Station (BS) Radio Transmission and Reception, document TS 38.204, 3GPP, Sep. 2025.
[20] C.-X. Wang, J. Huang, H. Wang, X. Gao, X. You, and Y. Hao, "6G wireless channel measurements and models: Trends and challenges," IEEE Veh. Technol. Mag., vol. 15, no. 4, pp. 22–32, Dec. 2020.
[21] A. Liao et al., "Terahertz ultra-massive MIMO-based aeronautical communications in space-air-ground integrated networks," IEEE J. Sel. Areas Commun., vol. 39, no. 6, pp. 1741–1767, Jun. 2021.
[22] S. K. Mohammed, R. Hadani, A. Chockalingam, and R. Calderbank, "OTFS—Predictability in the delay-Doppler domain and its value to communication and radar sensing," IEEE BITS Inf. Theory Mag., vol. 3, no. 2, pp. 7–31, Jun. 2023.
[23] P. Raviteja, K. T. Phan, Y. Hong, and E. Viterbo, "Orthogonal time frequency space (OTFS) modulation based radar system," in Proc. IEEE Radar Conf. (RadarConf), Apr. 2019, pp. 1–6.
[24] Y. Hong, T. Thaj, and E. Viterbo, Delay-Doppler Communications. New York, NY, USA: Academic, 2022.
[25] F. Hlawatsch and M. Gerald, Wireless Communications Over Rapidly Time-Varying Channels. Amsterdam, The Netherlands: Elsevier, 2011.
[26] Z. Zhang, Q. Wang, G. Liu, F. Gao, and P. Fan, "Cross-frame OTFS parameter estimation based on Chinese remainder theorem," IEEE Trans. Wireless Commun., vol. 25, pp. 2514–2527, 2025.
[27] Q. Wang, Y. Liang, Z. Zhang, and P. Fan, "2D off-grid decomposition and SBL combination for OTFS channel estimation," IEEE Trans. Wireless Commun., vol. 22, no. 5, pp. 3084–3098, May 2023.
[28] J. W. Follin, F. C. Paddison, and A. L. Maffett, "Statistics of radar cross section scintillations," Electromagnetics, vol. 4, nos. 2–3, pp. 139–164, Jan. 1984.
[29] Y. Shan, F. Wang, Y. Hao, J. Yuan, J. Hua, and Y. Xin, "Off-grid channel estimation using grid evolution for OTFS systems," IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 9549–9565, Aug. 2024.
[30] Q. Wang and P. Fan, "A multi-symbol compressive sensing model for OTFS based ISAC system," in Proc. GLOBECOM - IEEE Global Commun. Conf., Dec. 2023, pp. 2487–2492.
[31] S. Li, W. Yuan, Z. Wei, and J. Yuan, "Cross domain iterative detection for orthogonal time frequency modulation," IEEE Trans. Wireless Commun., vol. 21, no. 4, pp. 2227–2242, Apr. 2022.

## 图注与表注

**图 1（原文第 3 页）：** DD 域中的多普勒超范围信道。
**图 2（原文第 4 页）：** 多普勒超范围信道下的带通 OTFS 系统。
**图 3（原文第 5 页）：** 跨帧结构。
**图 4（原文第 8 页）：** 跨帧 OTFS 信道估计。
**图 5（原文第 9 页）：** SNR = 20 dB 时 NMSE 性能随多普勒增大的变化。
**图 6（原文第 10 页）：** $\nu_{\max}=150$ kHz 时 NMSE 性能随 SNR 增大的变化。
**图 7（原文第 10 页）：** BER 性能随 SNR 的变化（设置同图 6）。
**图 8（原文第 10 页）：** EVA 信道（$\nu_{\max}=150$ kHz）中 NMSE 性能随带宽增大的变化。

**表注汇总（全部凭 PDF 渲染逐格核对）：**

**表 I：高频载波下的超高移动性场景。**（来源：原文第 2 页。）

| 场景 | 频段 | 相对速度 |
|---|---|---|
| V2V/HSR [1], [20] | 24–71 GHz | 500–1000 km/h |
| 卫星通信 [3], [20] | Ku (12–18 GHz)、K (18–26.5 GHz)、Ka (26.5–40 GHz)、V (40–75 GHz) | 18000–36000 km/h |
| THz 近空间 [5], [21] | 100 GHz–10 THz | 720 km/h 或更快 |

**表 II：6G 在不同载频下的速度支持。**（来源：原文第 2 页。）

| 载波频率 [GHz] | 24 | 48 | 71 |
|---|---|---|---|
| 子载波间隔 [kHz] | 60 | 60 | 120 |
| 最大可容忍速度（雷达，radar）[km/h] | 674 | 337 | 456 |
| 最大可容忍速度（通信，communication）[km/h] | 1349 | 674 | 912 |

**表 III：** 离格方法的复杂度比较（见 IV-C 正文表）。**表 IV：** 通信用的 OTFS 参数（见 §V 正文表）。**表 V：** 不同带宽对应的子载波数（见 §V 正文表）。

**本页范围与校对状态：** 本页覆盖 IEEE TWC 2026 期刊正式版（Vol. 25, 2026, pp. 12883 起；DOI: 10.1109/TWC.2026.3668101）全文 14 页：摘要、第 I—VI 节、附录 A（命题 1 证明，式 (38)—(44)）、附录 B（命题 2 证明，式 (45)—(53)）、图 1—8 图注、表 I—V（**已用 `render.py` 渲染 PDF 第 2、8、9、10 页逐格核对并转录**）、式（1）—（53）中核心式、算法 1、参考文献 [1]—[31]（英文原条目）。**许可状态：期刊正式版，再传播许可待核验；本页仅作学习用途、不计入可公开全文统计（页首已声明，未改动原许可说明）。** 原文疑点/说明已在页首译注列出（Table I/II 表体为图像需渲染核对、式 (20) 模逆元上下标、Step 3 与 Algorithm 1 中重复的 $k_{\mathrm{PEAK}1}$/下标 2 疑为原文笔误、$D_{U,1}$ 维度记号、OD 判据 $\Delta f/2=30$ kHz、式 (37) NMSE 分母含附加相位项、[26] 为前期工作），均按原文照录并加注。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内曲线未数字化转写，图注与正文说明只给出图中设置与关键趋势。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 IEEE Xplore 正式版为准。
{% endraw %}