---
layout: page
title: "仅导频 BEM 信道估计的精确载荷解耦条件｜中文全文译文"
permalink: /papers/translations/2026-09-16-2609-00937-exact-payload-decoupling-conditions-for-pilot-only-bem-channel-estimat/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/fdd244da160081c6/) · [原文 arXiv](https://arxiv.org/abs/2609.00937) · [全部目录](/papers/catalog/)

# 仅导频 BEM 信道估计的精确载荷解耦条件

**原题：** Exact Payload-Decoupling Conditions for Pilot-Only BEM Channel Estimation With Application to OTFS  
**作者：** Gianmarco Romano、Francesco A. N. Palmieri（Member, IEEE）、Stefano Buzzi（Fellow, IEEE）、Giovanni Di Gennaro、Amedeo Buonanno（Senior Member, IEEE）  
**单位：** 意大利坎帕尼亚大学"Luigi Vanvitelli"工程学院（阿韦尔萨）；卡西诺与南拉齐奥大学及意大利国家大学电信联合体（CNIT）；ENEA 能源技术与可再生能源部（波尔蒂奇）。  
**版本：** arXiv:2609.00937v1（cs.IT），v1 日期 2026 年 9 月 1 日；原文 13 页；首页注明已投稿 IEEE、版权可能转移。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2609.00937v1 [cs.IT] 1 Sep 2026"，与库内登记编号 2609.00937 一致；首页脚注说明部分工作发表于 SPAWC 2026 [1]，并给出作者单位与邮箱。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VII 节正文与编号小节、图 1–5 中文图注（含子图 a/b）、表 I–II 逐格转写、命题 1–4 与证明要点、Remark 1–2、式 (1)–(51)、算法 1 伪代码，以及参考文献 29 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

在高移动性双弥散链路中，基展开模型（basis expansion model，BEM）可降低信道维度，然而未知载荷符号通常会污染常规匹配导频信道估计。本文确立此类估计成为载荷无关的精确条件，并导出可保证这些条件的导频、保护与数据放置规则。我们证明一个必要且充分的零导频–数据干扰（zero pilot–data interference，ZPDI）条件，在该条件下匹配导频最小二乘（LS）解与缩减导频统计量的最大似然（ML）估计量重合。当 ZPDI 成立时，估计只需一次预先计算的投影；不成立时，估计含有一个确定性的、按信道缩放的载荷偏置，该偏置在高中信噪比下持续存在。一个与所选基无关的不相交支撑规则通过导频、保护与数据放置实现 ZPDI。随后我们把框架专门化到正交时频空间（OTFS）并考察其结构与性能后果。采用广义复指数 BEM（GCE-BEM）时，ZPDI 估计器在高达 500 km/h 的速度下，误比特率与完美信道状态信息基准的差距约在 2 dB 以内。

**索引词：** 信道估计、双弥散信道、基展开模型、OTFS、导频符号。

## I. 引言

精确的信道状态信息（CSI）支撑相干检测、自适应调制与资源分配，因此是可靠无线系统运行所必需的 [2], [3]。高移动性场景（包括高速铁路（HSR）链路、无人机（UAV）通信与低地球轨道（LEO）卫星系统）涉及快速时变信道，具有大多普勒扩展与严重载波间干扰（ICI）[4]–[6]。在这些双弥散环境中，常规正交频分复用（OFDM）丧失子载波正交性 [7]。正交时频空间（OTFS）调制提供了替代方案，因为高移动性信道在延迟–多普勒（DD）域中近似稀疏且准平稳 [8]–[10]。然而实际 OTFS 信道常有分数多普勒与分数延迟，会把能量扩散到多个 DD 格点并降低这种稀疏性 [10], [11]。

现有信道估计器或作为独立方法运行，或与符号检测联合。独立方法在载荷检测之前给出信道估计，而联合接收机把两项任务耦合或交替。可用方法包括延迟–多普勒域技术 [12], [13]、时频域方法 [14]，以及贝叶斯、匹配追踪、消息传递与人工智能框架 [15], [16]。这些方法仍面临实际限制：容纳分数参数的方法常带来高计算代价，而深度学习（DL）方案需要大量训练数据、算力与能量，当传播条件动态变化时这些要求可能难以承受 [16]。

基展开模型（BEM）为导频辅助估计提供时变信道的结构化参数表示。它们把信道响应投影到有限维子空间，在保留相关信道动态的同时减少未知参数数 [7], [17], [18]。BEM 信道估计已针对多种调制方案研究，近来也用于 OTFS 与仿射频分复用（AFDM）等波形。实践中，信道状态信息必须主要从导频观测获得，之后可能通过数据辅助处理精化。即便在数据辅助接收机中，第一阶段也必须在可靠载荷判决可用之前估计信道。然而导频–数据干扰（PDI）会降低该初始估计，促使若干抑制方法出现。近期研究把 BEM 嵌入联合信道估计与检测框架 [19]–[21]。例如 Huang 等 [19] 在 turbo 均衡环路中利用已解码数据符号，而 Guo 等 [20] 使用广义压缩感知与迭代抵消抑制残余 PDI。Qu 等 [22] 改用离散长球序列（DPSS）子空间与线性最小均方误差（LMMSE）估计，并把 PDI 作统计处理。Liu 等 [23] 导出广义复指数 BEM（GCE-BEM）OTFS 输入–输出模型，但其接收机仍依赖迭代数据辅助均衡。

对特定 OTFS 设置也存在闭式非迭代 BEM 估计器。Mohebbi 等 [24] 为多输入多输出 OTFS（MIMO-OTFS）导出二维离散长球 BEM（DPS-BEM）表示，并在特定导频结构下用最小二乘恢复 BEM 系数。Wu 等 [25] 用单导频/保护结构为含硬件损伤的 OTFS 开发 GCE-BEM 估计器。但他们的统计量含导频相关与数据相关项，数据相关分量被当作有效干扰或噪声处理。因此这些方法尽管有闭式，仍受限于特定 BEM 选择、导频结构、统计假设或干扰处理方式。

我们的核心结果是：对常规匹配导频 BEM 估计器何时载荷无关、并与缩减统计量的最大似然（ML）估计量重合，给出必要且充分的刻画。在所得的零导频–数据干扰（ZPDI）条件下，统计量对任何可允许载荷与系数向量都不含数据项。若 ZPDI 不成立，同一滤波器含有一个确定性的、按信道缩放的载荷偏置，它在任何固定导频–数据功率比下都会在高中信噪比（SNR）持续存在。因此我们精确界定了最小二乘（LS）解作为可预计算仅导频 ML 估计器的有效边界，以及它被未知数据结构污染的边界。超出该边界后，匹配导频架构必须通过数据辅助处理来容忍、建模或抵消该干扰。

这类导频–数据正交条件此前出现过。对由复指数 BEM（CE-BEM）描述的双选择性信道上循环前缀仿射传输，Kannu 与 Schniter [26] 证明导频–数据正交性连同最优激励条件，是贝叶斯 LMMSE 信道估计达到其均方误差（MSE）下界的必要且充分条件。本文表述提出不同问题、覆盖更广的模型类，并把载荷解耦与激励分离。ZPDI 刻画的是常规匹配导频投影在所选 BEM 子空间内何时给出恰好载荷解耦、无先验的估计，而非统计最优估计器何时存在。由于该条件在算子层面陈述，它覆盖任意 BEM 子空间、任意酉观测变换，以及循环前缀、零填充与 chirp 周期前缀保护结构，而不限于 [26] 的 CE-BEM 与时域循环前缀设置。在我们的表述中，激励条件还有一个不同且更一般的作用：缩放单位导频 Gram 矩阵决定估计器条件数与相关噪声放大，但不决定估计是否载荷解耦。分离这些要求后，Gram 矩阵成为设计参数：它不必是缩放单位矩阵，估计仍可精确载荷无关，也可刻意非正交，以条件数换取多普勒分辨率，如过采样 GCE-BEM 那样。

这些区别对实现与误差分析有直接后果。与迭代数据辅助接收机 [19], [23] 及依赖统计量的设计 [22], [25] 不同，ZPDI 估计器既不需要载荷判决，也不需要随机信道先验。其矩阵只依赖导频图样、基与系统维度，因此可预计算，在线阶段只与帧长成线性关系。一旦 PDI 被精确消除，剩余误差分离为由导频 Gram 矩阵塑形的热噪声与由 BEM 控制的建模误差。该框架以严格设计准则取代对导频布置的启发式或仅凭仿真的接受，并显示限制估计的是解耦、条件数还是 BEM 分辨率。

本文给出载荷解耦刻画、实现它的设计规则，以及由此产生的结构与计算后果。

1) 我们证明：对任意 BEM 子空间与容许本文算子模型的块线性调制结构，匹配导频投影与未知载荷符号恰好解耦的必要且充分条件。该结果判定常规匹配导频 LS 解何时是缩减观测的有效载荷无关 ML 估计器，而非受数据污染的估计。
2) 我们给出一个与所选 BEM 基无关的不相交支撑充分条件，把 ZPDI 要求转化为放置导频、保护与数据的具体规则，使 ZPDI 在任意 BEM 表示与所考虑的块线性调制结构下成立。
3) 我们从可辨识性、条件数与结构角度刻画导频 Gram 矩阵。分析表明导频观测数如何限制可允许 BEM 阶数、Gram 矩阵条件数如何控制噪声放大，以及零抽头间导频泄漏如何把离线求逆从全稠密求解变为独立逐抽头求解，并在逐抽头块为对角时进一步简化为标量。
4) 我们用标准全保护导频 [12] 开发一个详细的 OTFS 应用。我们证明 ZPDI 与零导频–导频泄漏同时成立，导出 Toeplitz GCE-BEM Gram 矩阵及其分辨率–条件数折中，并在高达 500 km/h 的速度下说明这些结果。

本文其余部分组织如下：第 II 节给出系统模型与 BEM 表示；第 III 节导出导频投影 LS/ML 信道估计器与零导频–数据干扰条件；第 IV 节分析导频 Gram 矩阵及其在可辨识性、条件数与复杂度中的作用；第 V 节把框架用于 OTFS 调制并分析所得 GCE-BEM 结构；第 VI 节给出数值结果，第 VII 节总结全文。

**记号：** 粗体大写（$\mathbf A$）与小写（$\mathbf a$）字母分别表示矩阵与向量。上标 $(\cdot)^T$、$(\cdot)^H$、$(\cdot)^*$ 分别表示转置、共轭转置与复共轭。$\mathbf A^{-1}$ 表示逆。算子 $\mathrm{diag}(\cdot)$、$\mathrm{blkdiag}(\cdot)$、$\mathrm{vec}(\cdot)$ 分别表示对角矩阵、块对角矩阵与按列向量化。$\|\cdot\|$ 与 $\|\cdot\|_F$ 表示欧氏与 Frobenius 范数，$\odot$ 与 $\otimes$ 表示 Hadamard 与 Kronecker 积。$\mathbf 1[\cdot]$ 表示指示函数，$\mathbb E\{\cdot\}$ 表示统计期望。

## II. 系统模型与 BEM 表示

我们考虑把向量 $\mathbf x\in\mathbb C^N$ 表示的块通过双弥散信道发送，该信道由其离散时间冲激响应 $h[n,\ell]$ 刻画，其中第一个索引 $n$ 表示时间（样本索引），第二个索引 $\ell$ 表示延迟（抽头索引）。$h[n,\ell]$ 的时间依赖性刻画各多径分量在块内的多普勒引起变化，而有限范围 $\ell\in\{0,\dots,L-1\}$ 反映有界延迟扩展。接收机观测加性白高斯噪声（AWGN），用零均值协方差 $\sigma_v^2\mathbf I$ 的向量 $\mathbf v\in\mathbb C^N$ 表示。

为消除多径传播引起的符号间干扰，在每个发送块上添加长度 $N_g\ge L-1$ 个样本的保护。接收机移除保护后，接收信号的 $N$ 样本有用部分满足

$$
y[n]=\sum_{\ell=0}^{L-1}h[n,\ell]x[n-\ell]+v[n],\qquad n=0,1,\dots,N-1, \tag{1}
$$

其中 $x[n-\ell]=0$ 当 $n<\ell$。该式描述发送信号与信道之间的时变卷积 [2]。采用基于抽头的有限冲激响应（FIR）参数化时，估计模型不要求物理多普勒频移为格点分辨率的整数倍；相反，延迟–多普勒参数化必须显式建模离格频移引起的格间泄漏 [27]。

输入–输出关系 (1) 可写为矩阵–向量乘积

$$
\mathbf y=\mathbf H\mathbf x+\mathbf v, \tag{2}
$$

其中有效信道矩阵 $\mathbf H\in\mathbb C^{N\times N}$ 构造如下。信道系数矩阵 $\mathbf G\in\mathbb C^{N\times L}$ 的列 $\mathbf g_\ell=[h[0,\ell],\dots,h[N-1,\ell]]^T\in\mathbb C^N$（$\ell=0,\dots,L-1$）收集块内的时变抽头序列。经保护插入与移除后，有效无干扰信道矩阵分解为

$$
\mathbf H=\sum_{\ell=0}^{L-1}\mathrm{diag}(\mathbf g_\ell)\mathbf S_\ell, \tag{3}
$$

其中 $\mathbf S_\ell\in\mathbb C^{N\times N}$ 是依赖保护的移位算子。本文考虑三种保护模式，其移位结构如下：

- **循环前缀（CP）：** $\mathbf S_{\ell,\mathrm{cp}}=\boldsymbol\Pi^\ell$，其中 $\boldsymbol\Pi$ 是 $N\times N$ 循环置换矩阵；
- **零填充（ZP）：** $[\mathbf S_{\ell,\mathrm{zp}}]_{n,k}=\mathbf 1[n=k+\ell]$，即阶为 $\ell$ 的幂零下移位，它把回绕样本视为零而非回收；
- **Chirp 周期前缀（CPP）：** $\mathbf S_{\ell,\mathrm{cpp}}=\boldsymbol\Omega_\ell\boldsymbol\Pi^\ell$，其中 $\boldsymbol\Omega_\ell=\mathrm{diag}(\omega_\ell[k])_{k=0}^{N-1}$，当 $k=0,\dots,\ell-1$ 时 $\omega_\ell[k]=e^{\mathrm j2\pi c_1(\ell^2-2\ell k)/N}$，否则 $\omega_\ell[k]=1$，使 chirp 相位修正只作用于 $\ell$ 个循环回绕样本 [27], [28]。

分解 (3) 表明有效信道矩阵是 $L$ 个时变缩放移位项（每个延迟抽头一项）的叠加，其移位结构完全由保护模式决定。

发送向量 $\mathbf x$ 同时承载导频与数据符号。符号向量 $\mathbf s\in\mathbb C^{N_s}$ 收集 $N_p$ 个已知导频符号 $\mathbf s_p\in\mathbb C^{N_p}$ 与 $N_u$ 个未知载荷符号 $\mathbf s_u\in\mathbb C^{N_u}$，$N_s=N_p+N_u$。二元选择矩阵 $\mathbf P_p\in\{0,1\}^{N_s\times N_p}$ 与 $\mathbf P_u\in\{0,1\}^{N_s\times N_u}$ 把两类符号放入共同向量：

$$
\mathbf s=\mathbf P_p\mathbf s_p+\mathbf P_u\mathbf s_u,\qquad \mathbf P_p^T\mathbf P_u=\mathbf 0, \tag{4}
$$

其中约束 $\mathbf P_p^T\mathbf P_u=\mathbf 0$ 在调制之前强制导频与载荷位置互不相交。

编码矩阵 $\mathbf C\in\mathbb C^{N\times N_s}$ 随后把符号向量映射为发送块 $\mathbf x=\mathbf C\mathbf s$。在接收端，酉变换 $\mathbf D\in\mathbb C^{N\times N}$（$\mathbf D^H\mathbf D=\mathbf I$）把接收块映射到期望信号域。统一输入–输出关系为

$$
\mathbf r=\mathbf D\left(\sum_{\ell=0}^{L-1}\mathrm{diag}(\mathbf g_\ell)\mathbf S_\ell\right)\mathbf C\left(\mathbf P_p\mathbf s_p+\mathbf P_u\mathbf s_u\right)+\mathbf w, \tag{5}
$$

其中 $\mathbf w=\mathbf D\mathbf v\sim\mathcal{CN}(\mathbf 0,\sigma_w^2\mathbf I)$。

直接从导频观测估计完整 $NL$ 元时变信道矩阵 $\mathbf G$ 是高维问题。对满足欠扩展特性的实际移动信道，真实信道自由度远小于 $\mathbf G$ 的表观维度 $NL$。

BEM 利用这种结构冗余，用 $Q$ 个基函数与 $QL$ 个系数表示信道，其中 $Q\ll N$。于是有效信道维度从 $NL$ 降至 $QL$ 个参数，代价是受控的建模误差，同时大幅降低导频开销与估计复杂度。信道系数矩阵的一般 BEM 表示为

$$
\mathbf G=\boldsymbol\Phi\boldsymbol\Gamma+\mathbf E, \tag{6}
$$

其中 $\boldsymbol\Phi\in\mathbb C^{N\times Q}$ 是基矩阵，$\boldsymbol\Gamma\in\mathbb C^{Q\times L}$ 是系数矩阵，$\mathbf E\in\mathbb C^{N\times L}$ 是含 BEM 子空间之外信道分量的建模误差。$Q$ 的选择须满足两个相互竞争的要求：它应远小于 $N$ 以提供有意义的维度缩减，但又应足够大，使预期信道条件下建模误差可接受地小。

把 BEM 表示 (6) 代入系统模型 (5)，可直接把接收信号与 BEM 系数联系起来。我们先定义保护移位后的发送向量

$$
\mathbf z_\ell=\mathbf S_\ell\mathbf x,\qquad \ell=0,1,\dots,L-1, \tag{7}
$$

其中每个向量是发送块 $\mathbf x$ 按第 $\ell$ 个延迟抽头的保护结构经 $\mathbf S_\ell$ 移位所得。我们把诸向量排成复合块矩阵

$$
\mathbf Z(\mathbf x)=\left[\mathrm{diag}(\mathbf z_0),\dots,\mathrm{diag}(\mathbf z_{L-1})\right]\in\mathbb C^{N\times NL}, \tag{8}
$$

它把所有延迟抽头的发送贡献置于与时变信道响应相容的形式。定义 BEM 嵌入矩阵

$$
\mathbf B\triangleq\mathbf I_L\otimes\boldsymbol\Phi\in\mathbb C^{NL\times QL}, \tag{9}
$$

并利用 $\mathrm{vec}(\mathbf G)=\mathbf B\boldsymbol\gamma+\mathrm{vec}(\mathbf E)$（$\boldsymbol\gamma=\mathrm{vec}(\boldsymbol\Gamma)\in\mathbb C^{QL}$），BEM 传感矩阵

$$
\boldsymbol\Psi(\mathbf x)=\mathbf D\mathbf Z(\mathbf x)\mathbf B\in\mathbb C^{N\times QL} \tag{10}
$$

包含发送信号、基函数与观测域变换的联合效应。记有效建模误差 $\boldsymbol\eta(\mathbf x)=\mathbf D\mathbf Z(\mathbf x)\mathrm{vec}(\mathbf E)$，系统模型变为

$$
\mathbf r=\boldsymbol\Psi_p\boldsymbol\gamma+\boldsymbol\Psi_u(\mathbf s_u)\boldsymbol\gamma+\boldsymbol\eta(\mathbf x)+\mathbf w, \tag{11}
$$

其中 $\boldsymbol\Psi(\mathbf x)=\boldsymbol\Psi_p+\boldsymbol\Psi_u(\mathbf s_u)$ 由 $\mathbf Z(\cdot)$ 的线性性得出。该分离还识别出接收机已知的项：导频贡献 $\boldsymbol\Psi_p\boldsymbol\gamma$ 支持仅导频信道估计，而载荷贡献 $\boldsymbol\Psi_u(\mathbf s_u)\boldsymbol\gamma$ 依赖未知数据并可能干扰估计。接收机可在检测前构造导频传感矩阵，但在数据符号已知之前无法构造载荷传感矩阵。建模误差 $\boldsymbol\eta$ 度量真实信道与其 BEM 近似之间的失配，其效应取决于基函数与 $Q$。

## III. 导频投影信道估计与零导频–数据干扰

BEM 表示把信道估计归约为从观测 (11) 中恢复 $\boldsymbol\gamma$。接收机必须在均衡前由已知导频估计这些系数，但系统模型含有接收机无法重建的误差项。

实践中接收机采用观测模型

$$
\mathbf r=\boldsymbol\Psi_p\boldsymbol\gamma+\boldsymbol\Psi_u(\mathbf s_u)\boldsymbol\gamma+\mathbf w, \tag{12}
$$

其中省略了建模误差 $\boldsymbol\eta(\mathbf x)$。但任何子空间外信道分量仍作为失配存在，它不会随噪声平均掉，因而在高中 SNR 下限制可达精度。

所假设的模型仍依赖未知数据符号，接收机一般须求解联合检测问题。载荷与信道系数的联合 ML 估计器最小化耦合的 LS 代价

$$
\left(\widehat{\mathbf s}_u,\widehat{\boldsymbol\gamma}\right)=\arg\min_{\mathbf s_u\in\mathcal A^{N_u},\ \boldsymbol\gamma\in\mathbb C^{QL}}\mathcal E(\mathbf s_u,\boldsymbol\gamma),\qquad
\mathcal E(\mathbf s_u,\boldsymbol\gamma)\triangleq\left\|\mathbf r-\boldsymbol\Psi(\mathbf s_u)\boldsymbol\gamma\right\|^2. \tag{13}
$$

先考虑接收机已知发送载荷块 $\mathbf s_u$ 的精灵辅助情形。固定 $\mathbf s_u$ 时传感矩阵 $\boldsymbol\Psi(\mathbf s_u)$ 已知，(12) 成为关于 $\boldsymbol\gamma$ 的标准线性高斯模型。若 $\boldsymbol\Psi(\mathbf s_u)$ 满列秩，LS 估计为

$$
\widehat{\boldsymbol\gamma}=\left(\boldsymbol\Psi^H(\mathbf s_u)\boldsymbol\Psi(\mathbf s_u)\right)^{-1}\boldsymbol\Psi^H(\mathbf s_u)\mathbf r, \tag{14}
$$

在高斯假设下它与 ML 估计重合。由于 (12) 已丢弃建模误差，即便 ML 解也未必恢复真实 $\boldsymbol\gamma$。

判决导向接收机近似 (14) 中的目标。迭代数据辅助方案（如 Liu 等 [23] 的 BEM-OTFS 接收机）先做基于导频的信道估计，用它检测载荷 $\widehat{\mathbf s}_u$，重建传感矩阵 $\boldsymbol\Psi(\widehat{\mathbf s}_u)$ 并精化 $\widehat{\boldsymbol\gamma}$。这种精化利用了载荷，但其精度依赖初始估计质量，因为在信道已知之前无法获得可靠载荷判决。因此初始估计的误差会经由载荷判决传播到后续信道更新。第一阶段不能使用 (14)，故需要独立的仅导频估计器来初始化此类接收机。

我们考虑常规匹配导频估计器，它在当前阶段使用已知导频传感矩阵 $\boldsymbol\Psi_p$，因为 (12) 中的载荷贡献尚不可得。应用匹配导频滤波器 $\boldsymbol\Psi_p^H$ 把接收向量投影到导频子空间，产生 $QL$ 维导频统计量

$$
\mathbf t_p\triangleq\boldsymbol\Psi_p^H\mathbf r=\mathbf R_{pp}\boldsymbol\gamma+\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma+\widetilde{\mathbf w}_p, \tag{15}
$$

其中

$$
\mathbf R_{pp}\triangleq\boldsymbol\Psi_p^H\boldsymbol\Psi_p,\qquad \mathbf R_{pu}(\mathbf s_u)\triangleq\boldsymbol\Psi_p^H\boldsymbol\Psi_u(\mathbf s_u), \tag{16}
$$

且投影把热噪声着色为

$$
\widetilde{\mathbf w}_p\triangleq\boldsymbol\Psi_p^H\mathbf w\sim\mathcal{CN}\left(\mathbf 0,\sigma_w^2\mathbf R_{pp}\right). \tag{17}
$$

匹配滤波器是从导频估计 $\boldsymbol\gamma$ 的自然降维，但它并不分离导频与载荷贡献。导频统计量仍携带 PDI 项

$$
\boldsymbol\zeta_p(\mathbf s_u)\triangleq\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma, \tag{18}
$$

它来自导频与载荷传感矩阵之间的互相关 $\mathbf R_{pu}(\mathbf s_u)$。由于它位于用于恢复 $\boldsymbol\gamma$ 的同一 $QL$ 维子空间，仅对 $\mathbf t_p$ 做线性滤波无法把它与有用项 $\mathbf R_{pp}\boldsymbol\gamma$ 分离。

当把普通匹配导频 LS 滤波器 $\mathbf R_{pp}^{-1}$ 用于导频统计量时，PDI 的严重性变得明确：

$$
\mathbf R_{pp}^{-1}\mathbf t_p=\boldsymbol\gamma+\mathbf R_{pp}^{-1}\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma+\mathbf R_{pp}^{-1}\widetilde{\mathbf w}_p. \tag{19}
$$

第一项是期望信道，第三项是随 $\sigma_w^2\to0$ 消失的噪声贡献。第二项是 PDI，与噪声不同，它在高 SNR 下不消失。提高导频相对载荷的功率会衰减但不抵消它，对噪声取平均也不改变它，因为对给定发送块，PDI 是实际发送载荷的确定性函数。因此独立匹配导频估计器无法可靠恢复信道，除非 PDI 项被消除或变得可忽略。

所提方法直接强制该要求。若导频与载荷传感矩阵设计得对每个可允许载荷向量都有 $\mathbf R_{pu}(\mathbf s_u)=\mathbf 0$，则 PDI 项对每个信道实现都从 (15) 中消失。所得估计器在该模型中独立于发送载荷实现与任何假定的载荷分布。已知导频 Gram 矩阵随后为缩减导频统计量给出闭式匹配导频 LS/ML 估计器。

### A. 零导频–数据干扰条件

(15) 中的导频统计量通过项 $\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma$ 依赖未知载荷。因此匹配导频估计器与数据符号解耦，当且仅当

$$
\mathbf R_{pu}(\mathbf s_u)=\boldsymbol\Psi_p^H\boldsymbol\Psi_u(\mathbf s_u)=\mathbf 0,\qquad\forall\mathbf s_u, \tag{20}
$$

我们称之为 **ZPDI 条件**。

**命题 1（匹配导频解耦）。** 假设 $\boldsymbol\Psi_p$ 满列秩，考虑匹配导频估计器 $\widehat{\boldsymbol\gamma}=\mathbf R_{pp}^{-1}\mathbf t_p$。在所选 BEM 子空间内，该估计器在无噪声模型中，对每个可允许载荷向量与每个系数向量都精确恢复 $\boldsymbol\gamma$，当且仅当 ZPDI 条件 (20) 成立。在 (20) 下，

$$
\widehat{\boldsymbol\gamma}=\mathbf R_{pp}^{-1}\mathbf t_p=\left(\boldsymbol\Psi_p^H\boldsymbol\Psi_p\right)^{-1}\boldsymbol\Psi_p^H\mathbf r, \tag{21}
$$

它只依赖导频矩阵 $\boldsymbol\Psi_p$ 与接收信号 $\mathbf r$，并在协方差为 (17) 的高斯噪声下与 (15) 中缩减导频投影观测 $\mathbf t_p$ 的 ML 估计量重合。

**证明：** 在无噪声 BEM 模型中，由 (15)，估计误差为 $\widehat{\boldsymbol\gamma}-\boldsymbol\gamma=\mathbf R_{pp}^{-1}\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma$。若 (20) 成立，该误差对任意 $\mathbf s_u$ 与 $\boldsymbol\gamma$ 都消失，这证明充分性。反之，对每个 $\boldsymbol\gamma$ 与每个可允许 $\mathbf s_u$ 精确恢复要求 $\mathbf R_{pp}^{-1}\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma=\mathbf 0$ 对所有 $\boldsymbol\gamma,\mathbf s_u$ 成立；$\mathbf R_{pp}$ 的非奇异性于是给出对每个可允许载荷向量 $\mathbf R_{pu}(\mathbf s_u)=\mathbf 0$，这证明必要性。最后，在 ZPDI 下 $\mathbf t_p\sim\mathcal{CN}(\mathbf R_{pp}\boldsymbol\gamma,\sigma_w^2\mathbf R_{pp})$，对 $\boldsymbol\gamma$ 最大化高斯似然即得 $\widehat{\boldsymbol\gamma}=\mathbf R_{pp}^{-1}\mathbf t_p$。

命题 1 刻画的是熟悉匹配导频公式的有效域，而非新的 LS 代数。其必要性结论专门针对匹配导频统计量，并不排除对完整观测做更一般的斜投影；此类处理位于缩减统计量 $\mathbf t_p$ 之外，且可能放大噪声。ZPDI 则使标准导频投影无需该修正即为载荷无关。下文"ZPDI 估计器"指当导频图样满足 ZPDI 条件时 (21) 中的标准 LS/ML 估计器。

**Remark 1（与 [26] 的最小均方误差导频辅助传输条件的关系）。** 令 $\mathbf D=\mathbf I$、$\mathbf S_\ell=\boldsymbol\Pi^\ell$ 且 $\boldsymbol\Phi$ 为 CE-BEM 基，(20) 即化为 [26] 的导频–数据正交条件，而那里的最优激励条件对应 $\mathbf R_{pp}=(E_p/N)\mathbf I$，即第 IV-C 节 $\kappa(\mathbf R_{pp})=1$ 的匹配滤波情形。这里 ZPDI 与 Gram 条件各司其职：ZPDI 单独决定任意 BEM 子空间与 (3) 的保护结构下的载荷无关性，而 Gram 矩阵被单独作为可辨识性、条件数与复杂度参数处理（第 IV 节）。这种分离允许 Gram 矩阵刻意不为缩放单位阵的估计器，如第 V 节的过采样 GCE-BEM，因此它们有效但位于 [26] 最优激励刻画之外。

条件 (20) 有直接的几何解读。$\boldsymbol\Psi_p$ 的列是匹配滤波器 $\boldsymbol\Psi_p^H$ 据以观测 BEM 系数向量 $\boldsymbol\gamma$ 的信道移位导频波形，而 $\boldsymbol\Psi_u(\mathbf s_u)$ 的列是对应的载荷波形。要求 $\boldsymbol\Psi_p^H\boldsymbol\Psi_u(\mathbf s_u)=\mathbf 0$ 把载荷列空间置于导频列空间的正交补中（对每个可允许 $\mathbf s_u$），于是载荷落在估计器不观测的子空间，而 (15) 中的项 $\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma$ 对任何信道实现都消失。

于是导频设计问题变为几何问题：解耦通过塑造帧内导频、保护与数据的支撑，使其信道移位像占据正交子空间来获得。

这种解耦是确定性的。与统计干扰抑制、判决导向精化或迭代联合估计与检测 (13) 不同（其估计依赖载荷、其统计量或试探判决），ZPDI 估计器归约为单次矩阵–向量乘积 (21)；其 Gram 矩阵 $\mathbf R_{pp}$ 只依赖导频图样、BEM 基与系统维度，可一次预计算并在每帧复用。于是估计不再受导频–数据干扰限制，只受热噪声、$\mathbf R_{pp}$ 的条件数、有限 BEM 建模误差以及残余支撑或同步失配限制。

正交性 $\boldsymbol\Psi_p^H\boldsymbol\Psi_u(\mathbf s_u)=\mathbf 0$ 是单一全局条件。但对导频设计而言，一次考察一个延迟抽头更有信息量。写 $\boldsymbol\Psi_p=[\boldsymbol\Psi_{p,0},\dots,\boldsymbol\Psi_{p,L-1}]$，载荷同理，则当

$$
\boldsymbol\Psi_{p,\ell}^H\boldsymbol\Psi_{u,m}=\mathbf 0\qquad\forall\ell,m\in\{0,1,\dots,L-1\} \tag{22}
$$

时 ZPDI 得到保证，其中 $\boldsymbol\Psi_{p,\ell}=\mathbf D\,\mathrm{diag}(\mathbf z_{p,\ell})\boldsymbol\Phi$，$\boldsymbol\Psi_{u,m}=\mathbf D\,\mathrm{diag}(\mathbf z_{u,m})\boldsymbol\Phi$。每个块 $\boldsymbol\Psi_{p,\ell}^H\boldsymbol\Psi_{u,m}$ 度量延迟 $m$ 处承载的数据泄漏到延迟 $\ell$ 处导频观测的程度。由于信道可在 $L$ 个抽头中任一处放置能量，单个索引对并不够：完全解耦要求全部 $L^2$ 个块同时为零，使导频在每次可允许延迟移位后仍与数据正交。

条件 (22) 仍依赖 BEM 基 $\boldsymbol\Phi$，因此只能在基固定后检验。一个更强且更简单的规则通过直接作用于基应用之前的时域导频与数据向量来消除这种依赖。该规则要求的不仅是发送块中导频与数据位置不相交。对通过 (3) 的移位算子分别独立作用于导频与数据的每一对延迟移位 $(\ell,m)\in\{0,\dots,L-1\}^2$，移位后的导频与移位后的数据必须占据不相交位置。仅未移位的支撑不相交不能保证该性质：即便原始支撑不相交，延迟移位也可能把导频移到数据位置，或把数据移到导频位置。

**命题 2（零干扰的不相交支撑条件）。** 考虑块结构观测矩阵 $\boldsymbol\Psi_{p,\ell}=\mathbf D\,\mathrm{diag}(\mathbf z_{p,\ell})\boldsymbol\Phi$ 与 $\boldsymbol\Psi_{u,m}=\mathbf D\,\mathrm{diag}(\mathbf z_{u,m})\boldsymbol\Phi$，其中 $\mathbf D^H\mathbf D=\mathbf I$。对所有 $\ell,m$ 使 $\boldsymbol\Psi_{p,\ell}^H\boldsymbol\Psi_{u,m}=\mathbf 0$ 的一个充分条件是

$$
\mathbf z_{p,\ell}^*\odot\mathbf z_{u,m}=\mathbf 0\qquad\forall\ell,m\in\{0,1,\dots,L-1\}. \tag{23}
$$

**证明：** 互相关块可表示为

$$
\boldsymbol\Psi_{p,\ell}^H\boldsymbol\Psi_{u,m}=\boldsymbol\Phi^H\mathrm{diag}(\mathbf z_{p,\ell}^*)\mathbf D^H\mathbf D\,\mathrm{diag}(\mathbf z_{u,m})\boldsymbol\Phi=\boldsymbol\Phi^H\mathrm{diag}(\mathbf z_{p,\ell}^*\odot\mathbf z_{u,m})\boldsymbol\Phi, \tag{24}
$$

其中第二个等式用到 $\mathbf D^H\mathbf D=\mathbf I$ 与 $\mathrm{diag}(\mathbf a)\mathrm{diag}(\mathbf b)=\mathrm{diag}(\mathbf a\odot\mathbf b)$。若 (23) 成立，中间对角矩阵为零，结论对所有 $\ell,m$ 成立。

不相交支撑条件 (23) 是实用的设计规则。向量 $\mathbf z_{p,\ell}$ 与 $\mathbf z_{u,m}$ 是经延迟移位 $\ell,m\in\{0,\dots,L-1\}$ 看到的导频与数据，该条件要求任何移位导频都不落在移位数据位置上，即导频与数据必须在两侧都由完整延迟支撑隔开。这正是保护的作用：较窄的保护会让移位导频与数据重叠并重新引入 $\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma$，而较宽的保护只会消耗资源单元而不改善解耦。

**Remark 2（作为迭代接收机的初始化器）。** (21) 中的估计器在载荷检测之前即可用，因此可初始化判决导向 BEM 接收机。检测之后可重建 $\boldsymbol\Psi(\widehat{\mathbf s}_u)$ 并应用 (14) 中的数据辅助 LS 更新。因此 ZPDI 估计器既可作为独立仅导频估计器，也可作为迭代接收机（如 [22], [23]）的第一阶段，而无需修改。

## IV. ZPDI 估计器的可辨识性、条件数与复杂度

一旦 $\mathbf R_{pu}(\mathbf s_u)=\mathbf 0$，载荷项便从导频统计量中消失，估计器完全由导频 Gram 矩阵 $\mathbf R_{pp}$ 支配。该矩阵描述导频观测的内部几何，而非干扰水平：它是 $\boldsymbol\gamma$ 据以被观测的信道移位导频波形的 Gram 矩阵。保护必须消灭 $\mathbf R_{pu}$，而在去掉数据项之后，$\mathbf R_{pp}$ 决定 $\boldsymbol\gamma$ 能否被恢复以及恢复对扰动多敏感。其秩决定系数可辨识性；其谱决定估计器条件数与相关噪声放大；其结构决定求逆的计算代价。下面各小节分别考察这些作用。

### A. 可辨识性

ZPDI 条件从导频统计量中去掉载荷，但并不保证 $QL$ 个 BEM 系数 $\boldsymbol\gamma$ 可恢复。估计器 (21) 有良好定义仅当 $\boldsymbol\Psi_p$ 满列秩，即

$$
\mathrm{rank}(\boldsymbol\Psi_p)=QL,\qquad\text{等价于}\ \mathbf R_{pp}\succ0. \tag{25}
$$

该要求正是限制 BEM 阶数之处。导频观测矩阵 $\boldsymbol\Psi_p=\mathbf D\mathbf Z_p\mathbf B$ 有 $QL$ 列，但它由已知导频激励 $\mathbf Z_p\triangleq\mathbf Z(\mathbf x_p)$ 构造，只产生 $N_{\mathrm{obs}}\triangleq\mathrm{rank}(\mathbf Z_p)$ 个独立标量观测。基 $\mathbf B$ 不能创造导频未激励的观测，因此 $\mathrm{rank}(\boldsymbol\Psi_p)\le N_{\mathrm{obs}}$，满列秩要求

$$
N_{\mathrm{obs}}\ge QL. \tag{26}
$$

因此可允许 BEM 阶数上限为

$$
Q\le\left\lfloor\frac{N_{\mathrm{obs}}}{L}\right\rfloor. \tag{27}
$$

该界是直接计数：$L$ 个延迟抽头各含 $Q$ 个系数，共 $QL$ 个未知量，而导频只提供 $N_{\mathrm{obs}}$ 个独立方程。取 $Q$ 高于 (27) 会使 $\boldsymbol\Psi_p$ 秩亏，于是不同系数向量产生相同导频统计量，不存在唯一估计。该计数是必要而非充分的，因为所保留基函数在导频算子下仍可能线性相关；实际要求仍是 (25)。

### B. 条件数与噪声放大

可辨识性保证 $\mathbf R_{pp}$ 可逆，但不保证求逆良条件。ZPDI 下导频统计量化为 $\mathbf t_p=\mathbf R_{pp}\boldsymbol\gamma+\widetilde{\mathbf w}_p$，其中 $\widetilde{\mathbf w}_p$ 由 (17) 给出；因此载荷一旦去掉，估计就对含噪导频统计量作用 $\mathbf R_{pp}^{-1}$，其精度取决于该逆如何作用于匹配噪声。当 $\mathbf R_{pp}$ 接近缩放单位矩阵时，所有系数方向被同等对待，匹配噪声不被放大。当 $\mathbf R_{pp}$ 接近奇异时，可辨识性条件 (25) 仍成立、解仍唯一，但导频统计量的微小扰动会转化为 $\boldsymbol\gamma$ 的大误差。条件数 $\kappa(\mathbf R_{pp})$ 度量这种敏感性，并决定 ZPDI 估计器的最坏噪声放大。

### C. 零导频–导频泄漏与求逆复杂度

类比 ZPDI，定义**零导频–导频泄漏**（ZPPL）条件为

$$
\boldsymbol\Psi_{p,i}^H\boldsymbol\Psi_{p,j}=\mathbf 0,\qquad\forall i\neq j. \tag{28}
$$

该条件把不同延迟抽头导频观测之间的交叉 Gram 矩阵置零，因此决定 ZPDI 建立之后不同抽头的系数组是否仍耦合。

把 $\mathbf R_{pp}$ 分成 $L\times L$ 块 $\mathbf R_{ij}\triangleq\boldsymbol\Psi_{p,i}^H\boldsymbol\Psi_{p,j}$，其中 $\mathbf R_{ij}$ 是抽头 $i$ 与 $j$ 的交叉 Gram 矩阵。ZPPL 下所有非对角块消失，故

$$
\mathbf R_{pp}=\mathrm{blkdiag}\left(\mathbf R_{00},\dots,\mathbf R_{L-1,L-1}\right), \tag{29}
$$

并且在每个 $Q\times Q$ 对角块非奇异时，估计器分解为 $L$ 个逐抽头估计器：

$$
\widehat{\boldsymbol\gamma}=\begin{bmatrix}\mathbf R_{00}^{-1}\boldsymbol\Psi_{p,0}^H\\ \vdots\\ \mathbf R_{L-1,L-1}^{-1}\boldsymbol\Psi_{p,L-1}^H\end{bmatrix}\mathbf r. \tag{30}
$$

于是 ZPPL 使 $\mathbf R_{pp}$ 块对角，但不一定对角。对角性还要求同一延迟抽头内不同 BEM 函数不相关。由于

$$
[\mathbf R_{\ell\ell}]_{a,b}=\sum_{n=0}^{N-1}\left|z_{p,\ell}[n]\right|^2\phi_a^*[n]\phi_b[n], \tag{31}
$$

$\mathbf R_{pp}$ 对角当且仅当 ZPPL 成立且

$$
\sum_{n=0}^{N-1}\left|z_{p,\ell}[n]\right|^2\phi_a^*[n]\phi_b[n]=0,\qquad\forall\ell,\ a\neq b. \tag{32}
$$

条件 (32) 是 BEM 函数上的导频加权正交条件。对角元素仍可不同，因此仅对角性并不意味理想条件数。

这些结构性质直接转化为求逆代价。令 $d=QL$ 为未知量数。稠密 $\mathbf R_{pp}$ 需要 $\mathcal O(d^3)=\mathcal O(Q^3L^3)$ 求逆，而 ZPPL 下 $L$ 个独立块把代价降为 $\mathcal O(LQ^3)$ 且可并行求逆。当 (32) 也成立时，$\mathbf R_{pp}$ 对角，求逆化为 $QL$ 个标量倒数。

由于导频图样、BEM 基与系统维度固定，投影

$$
\mathbf W_p=\mathbf R_{pp}^{-1}\boldsymbol\Psi_p^H \tag{33}
$$

可一次预计算并存储。每帧于是只需乘积 $\widehat{\boldsymbol\gamma}=\mathbf W_p\mathbf r$，在线复杂度 $\mathcal O(NQL)$。因此 ZPPL 的收益限于离线求逆，使其实更廉价且可并行；除非进一步利用导频稀疏性，在线复杂度阶数不变。

## V. OTFS 信道估计与 GCE-BEM 分析

我们把前述框架应用于 OTFS 调制。OTFS 把符号映射到 DD 域，时变信道在该域近似准静态，可被有效估计与均衡。然而分数多普勒会降低 DD 稀疏性，并在 BEM 基不能充分表示它们时引入建模误差。第 III 节的估计器可工作于任何满足 $\mathbf D^H\mathbf D=\mathbf I$ 的线性变换域，因为第 III-A 节的 ZPDI 条件与第 IV-C 节的 ZPPL 条件不依赖观测域。令 $\mathbf D=\mathbf I$ 把估计器直接置于时域（不失一般性），给出

$$
\widehat{\boldsymbol\gamma}=\mathbf R_{pp}^{-1}\mathbf t_p=\left(\boldsymbol\Psi_p^H\boldsymbol\Psi_p\right)^{-1}\boldsymbol\Psi_p^H\mathbf r. \tag{34}
$$

该时域形式即下文 OTFS 专门化所采用的形式。

### A. OTFS 系统模型

考虑由 $K\times M$ 矩阵 $\mathbf S$ 表示的 OTFS 延迟–多普勒格，其中 $K$ 表示延迟格数、$M$ 表示多普勒格数。整个 OTFS 帧跨越 $N=KM$ 个时间样本，$N$ 与第 II 节一般表述中的观测区间长度一致。在 OTFS 的缩减 CP 变体中，发送前在整个帧前添加一个 CP。去除 CP 后，DD 域接收信号可表示为

$$
\mathbf r=\left(\mathbf F_M\otimes\mathbf I_K\right)\mathbf H\left(\mathbf F_M^H\otimes\mathbf I_K\right)\mathbf s+\mathbf w, \tag{35}
$$

其中 $\mathbf F_M$ 是 $M$ 点离散傅里叶变换（DFT）矩阵，$\mathbf H$ 是时域双弥散信道矩阵，$\mathbf s$ 是 DD 格 $\mathbf S$ 按列向量化得到的 $KM$ 维列向量，$\mathbf w$ 是加性噪声向量。系统模型 (35) 与一般模型 (5) 结构相同，对应 $\mathbf D=(\mathbf F_M\otimes\mathbf I_K)$ 与 $\mathbf C=(\mathbf F_M^H\otimes\mathbf I_K)$。

### B. 带全保护的单导频

我们考虑 DD 格中嵌入的单导频图样，保护符号跨越所有多普勒格与信道支撑所需的完整延迟范围。这是早期 OTFS 工作（包括 [12]）所用的标准全保护导频配置。我们分析该图样在 ZPDI 条件下是否保证仅导频信道估计。

该导频图样在 DD 格坐标 $(k_p,m_p)$ 处放置单个导频符号 $s_p\in\mathbb C$，其中 $k_p\in\{0,\dots,K-1\}$ 与 $m_p\in\{0,\dots,M-1\}$ 分别指定延迟格与多普勒格位置。导频被由空符号构成的矩形保护区域包围：

$$
\mathbf S[k,m]=\begin{cases}s_p, & k=k_p,\ m=m_p,\\0, & k_p-L+1\le k\le k_p+L-1,\ 0\le m\le M-1,\ (k,m)\neq(k_p,m_p),\\ s_u[k,m], & \text{否则（载荷符号）},\end{cases} \tag{36}
$$

其中 $L$ 表示以延迟格数表示的最大信道延迟扩展，$s_u[k,m]$ 表示占据保护区域之外位置的载荷符号。保护区域含 $(2L-1)M-1$ 个空符号。

导频通常置于 $(k_p,m_p)=(\lfloor K/2\rfloor-1,\lfloor M/2\rfloor-1)$，接近延迟–多普勒格的几何中心。该图样的谱效开销为 $(2L-1)M/(KM)=(2L-1)/K$，即保留用于信道估计而非数据传输的格点比例。由于该开销随信道长度参数 $L$ 线性增长，延迟扩展中等的信道下它仍适度，但随延迟扩展增大而变昂贵。因此该图样的适用性取决于估计精度与谱效之间所需的平衡。

### C. 导频–数据正交性分析

(36) 的单导频全保护图样满足零导频–数据干扰条件，因此容许精确无干扰的 ZPDI 估计器。我们在上述令 $\mathbf D=\mathbf I$ 得到的等价时域表示中评估正交条件。

**命题 3（零导频–数据干扰）。** (36) 定义的单导频 OTFS 图样满足零导频–数据干扰条件

$$
\mathbf R_{pu}(\mathbf s_u)=\boldsymbol\Psi_p^H\boldsymbol\Psi_u(\mathbf s_u)=\mathbf 0,\qquad\forall\mathbf s_u, \tag{37}
$$

其中 $\boldsymbol\Psi_p=\mathbf Z_p\mathbf B$ 与 $\boldsymbol\Psi_u(\mathbf s_u)=\mathbf Z_u\mathbf B$ 是上述 $\mathbf D=\mathbf I$ 时域专门化下的导频与载荷观测矩阵。

**证明：** 我们验证命题 2 的不相交支撑条件。(37) 的一个充分条件是

$$
\mathbf z_{p,\ell}^*\odot\mathbf z_{u,\nu}=\mathbf 0,\qquad\forall\ell,\nu\in\{0,1,\dots,L-1\}, \tag{38}
$$

其中 $\mathbf z_{p,\ell}$ 与 $\mathbf z_{u,\nu}$ 分别是 $\mathbf Z_p$ 与 $\mathbf Z_u$ 的第 $\ell$ 与 $\nu$ 列。对 DD 格 (36) 向量化会把未移位导频置于 $\mathcal P_0=\{k_p+qK\mid q=0,\dots,M-1\}$，而循环移位 $\mathbf z_{p,\ell}=\boldsymbol\Pi^\ell\mathbf z_{p,0}$ 把它移到 $\mathcal P_\ell=\{(k_p+\ell+qK)\bmod N\mid q=0,\dots,M-1\}$。(36) 的保护区域在 $\mathcal G=\bigcup_{q=0}^{M-1}\{k_p-L+1+qK,\dots,k_p+L-1+qK\}$ 上消灭未移位载荷，而移位载荷向量满足 $z_{u,\nu}[n]=x_u[(n-\nu)\bmod N]$，故它在 $(n-\nu)\bmod N\in\mathcal G$ 处、即 $\mathcal G$ 平移 $\nu$ 的副本上为零，而非在 $\mathcal G$ 本身为零。选取 $k_p$ 使 $[k_p-L+1,k_p+L-1]\subset\{0,\dots,K-1\}$ 可排除每个可允许移位的回绕。对 $n\in\mathcal P_\ell$，有 $n=k_p+\ell+qK$，故 $n-\nu=k_p+(\ell-\nu)+qK$ 且 $\ell-\nu\in\{-(L-1),\dots,L-1\}$，它总落在 $\{k_p-L+1+qK,\dots,k_p+L-1+qK\}\subseteq\mathcal G$ 中；因此 $z_{u,\nu}[n]=x_u[n-\nu]=0$。于是 $\mathbf z_{p,\ell}$ 的每个非零项都落在 $\mathbf z_{u,\nu}$ 为零的位置，对所有 $\ell,\nu\in\{0,\dots,L-1\}$ 成立，这建立 (38)，并由命题 2 得 (37)。

正交条件 (38) 施加约束 $K>2L-2$。该要求是防止所采用保护图样下循环前缀引起的循环置换产生回绕干扰的必要且充分条件。事实上，上保护边界 $(k_p+L-1)$ 在模 $K$ 回绕后不得干扰下边界 $(k_p-L+1)$，这要求 $(k_p+L-1)-(k_p-L+1)<K$，即等价地 $2L-2<K$。此外，两侧带保护地正确放置导频要求 $L-1\le k_p\le K-L$，这只有在 $K>2L-2$ 时才可能。

### D. 导频–导频泄漏

所采用的全保护图样满足 ZPDI。我们接着判定它是否也满足 (28) 中的 ZPPL 条件。

**命题 4（OTFS 全保护图样的 ZPPL）。** 对单导频全保护图样，移位导频向量在不同延迟抽头间具有不相交支撑，即

$$
\mathbf z_{p,i}^*\odot\mathbf z_{p,j}=\mathbf 0,\qquad i\neq j, \tag{39}
$$

且每个移位导频向量满足

$$
\left\|\mathbf z_{p,i}\right\|^2=E_p,\qquad i=0,\dots,L-1, \tag{40}
$$

其中 $E_p=|s_p|^2$ 表示导频能量。因此该图样对任意 BEM 基 $\boldsymbol\Phi$ 都满足 ZPPL。

**证明：** 对 $i\neq j$，移位导频向量的支撑为 $\mathcal P_i=\{k_p+i+qK\mid q=0,\dots,M-1\}$ 与 $\mathcal P_j=\{k_p+j+qK\mid q=0,\dots,M-1\}$。由于 $i\neq j$ 且在条件 $K>2L-2$ 下对 $i,j\in\{0,\dots,L-1\}$ 不发生模 $N$ 回绕，二者不重叠。因此没有样本能同时在 $\mathbf z_{p,i}$ 与 $\mathbf z_{p,j}$ 中非零，这证明 (39)。对 $i=j$，每个导频向量 $\mathbf z_{p,i}$ 在位置 $k_p+i+qK$（$q=0,\dots,M-1$）含 $M$ 个非零元素，每个幅度为 $|s_p|/\sqrt M$，这来自逆辛有限傅里叶变换（ISFFT）归一化。因此

$$
\left\|\mathbf z_{p,i}\right\|^2=\sum_{q=0}^{M-1}\left|\frac{s_p}{\sqrt M}\right|^2=\sum_{q=0}^{M-1}\frac{|s_p|^2}{M}=M\cdot\frac{|s_p|^2}{M}=|s_p|^2=E_p, \tag{41}
$$

这证明 (40)。最后，把命题 2 证明中的交叉 Gram 恒等式 (24) 以 $\mathbf z_{p,j}$ 替代 $\mathbf z_{u,m}$ 应用，可把不相交支撑 (39) 直接映射为对 $i\neq j$ 的 $\boldsymbol\Psi_{p,i}^H\boldsymbol\Psi_{p,j}=\mathbf 0$，且与 BEM 基无关。

该命题建立逐元素不相交支撑，它是 ZPPL 所需条件，且强于普通向量正交性。因此它对 OTFS 全保护图样验证了 (28)。由一般块对角结果 (29)，导频 Gram 矩阵 $\mathbf R_{pp}=\boldsymbol\Psi_p^H\boldsymbol\Psi_p$（$\boldsymbol\Psi_p=\mathbf Z_p\mathbf B$）因此块对角。由于每个延迟抽头激励 $M$ 个能量为 $E_p/M$ 的等能量时域样本，它具有显式形式

$$
\mathbf R_{pp}=\frac{E_p}{M}\mathrm{blkdiag}\left(\mathbf T_0,\mathbf T_1,\dots,\mathbf T_{L-1}\right), \tag{42}
$$

其中 $\mathbf T_\ell\in\mathbb C^{Q\times Q}$ 是 $Q$ 个 BEM 基函数在延迟抽头 $\ell$ 的 $M$ 个导频位置处采样的 Gram 矩阵。因此 $\mathbf T_\ell$ 是第 IV-C 节一般对角块 $\mathbf R_{\ell\ell}$ 的 OTFS 专门化，且 $\mathbf R_{\ell\ell}=(E_p/M)\mathbf T_\ell$。估计器随后分解为 (30) 专门化得到的 $L$ 个独立逐抽头求解：

$$
\widehat{\boldsymbol\gamma}_\ell=\frac{M}{E_p}\mathbf T_\ell^{-1}\boldsymbol\Psi_{p,\ell}^H\mathbf r,\qquad \ell=0,1,\dots,L-1, \tag{43}
$$

其中 $\boldsymbol\Psi_{p,\ell}$ 是 $\boldsymbol\Psi_p$ 的第 $\ell$ 个块列。

逐抽头形式使第 IV-A 节的可辨识性条件在 OTFS 中具体化。每个 $\mathbf T_\ell$ 是 $Q$ 个基函数仅在 $M$ 个导频位置观测所得的 Gram 矩阵，故其秩不超过 $M$，(43) 中的逆存在仅当

$$
Q\le M. \tag{44}
$$

这是计数条件 (26) 的逐抽头实例：单导频全保护图样每延迟抽头提供 $N_{\mathrm{obs}}=M$ 个独立观测，故可允许 BEM 阶数受多普勒格数限制。

### E. GCE-BEM 分析

全保护图样对任意 BEM 选择都保证导频–数据正交，但基函数仍决定导频 Gram 矩阵 $\mathbf R_{pp}=\boldsymbol\Psi_p^H\boldsymbol\Psi_p$，它支配数值条件数与求逆复杂度。由于 $\mathbf R_{pp}$ 块对角，分析归结为逐抽头块 $\mathbf T_\ell$，即限于导频支撑 $\mathcal P_\ell$ 上的基函数 Gram 矩阵。

我们采用 GCE-BEM 基 $\phi_q[n]=\frac{1}{\sqrt N}\exp(\mathrm j\omega_qn)$，$n=0,\dots,N-1$、$q=0,\dots,Q-1$，频率为 $\omega_q=\frac{2\pi}{NR}\left(q-\lceil(Q-1)/2\rceil\right)$。过采样因子 $R\ge1$ 把多普勒格间距设为 $2\pi/(NR)$；$R=1$ 在 DFT 格 $2\pi/N$ 上恢复常规 CE-BEM，而更大 $R$ 细化多普勒格、更好地分辨分数多普勒分量。

对单导频图样，导频位置遵循 $n=k_p+\ell+qK$（$q=0,\dots,M-1$），在该等比序列上直接求和 $\mathbf T_\ell[a,b]=\sum_{n\in\mathcal P_\ell}\phi_a^*[n]\phi_b[n]$，得到闭式元素

$$
\mathbf T_\ell[a,b]=\frac{1}{K}\exp\left(\mathrm j\frac{2\pi(b-a)(k_p+\ell)}{NR}\right)\times\exp\left(\mathrm j\frac{\pi(M-1)(b-a)}{MR}\right)\mathcal D_M\left(\frac{\pi(b-a)}{MR}\right), \tag{45}
$$

其中 $a,b\in\{0,\dots,Q-1\}$，$\mathcal D_M(x)=\sin(Mx)/(M\sin x)$ 是 Dirichlet 核。式 (45) 表明 $\mathbf T_\ell$ 是 Hermitian Toeplitz 矩阵，对角元素 $\mathbf T_\ell[a,a]=1/K$（因 $\mathcal D_M(0)=1$）；对 $R>1$，Dirichlet 核填充非对角元素，仅当 $b-a$ 为 $R$ 的非零倍数且 $(b-a)\bmod MR\neq0$ 时才消失。由于 $\mathbf T_\ell$ 由 $\mathcal P_\ell$ 的 $M$ 个导频样本生成，$\mathrm{rank}(\mathbf T_\ell)\le M$，这为 GCE-BEM 确认了 (44) 的逐抽头可辨识性上限 $Q\le M$：逐抽头问题在 $Q=M$ 时恰定、在 $Q<M$ 时超定且条件更好、在 $Q>M$ 时秩亏。因此过采样因子以条件数换多普勒分辨率：更大 $R$ 降低分数多普勒建模误差，但通过同样的基正交性损失抬升 $\kappa(\mathbf R_{pp})$ 并在高 SNR 放大噪声。

当 $R=1$ 时，Dirichlet 核在 $Q\le M$ 时正交，故每个逐抽头块化为 $\mathbf T_\ell=\frac{1}{K}\mathbf I_Q$，导频 Gram 矩阵化为缩放单位阵 $\mathbf R_{pp}=(E_p/N)\mathbf I_{QL}$，即第 IV-C 节的对角情形，具有理想条件数 $\kappa(\mathbf R_{pp})=1$ 且无需矩阵求逆。逐抽头估计器 (43) 随后化为缩放匹配滤波器

$$
\widehat{\boldsymbol\gamma}_\ell=\frac{N}{E_p}\boldsymbol\Psi_{p,\ell}^H\mathbf r,\qquad \ell=0,1,\dots,L-1. \tag{46}
$$

## VI. 数值示例与端到端结果

命题 1 与 2 是对每个可允许载荷都成立的解析结论。数值示例改为说明它们对 OTFS 的后果，并在存在模型失配时评估所选 GCE-BEM。

> **表 I（原文 Table I）：** OTFS 数值示例所用仿真参数。

| 参数 | 取值 |
|---|---|
| 载波频率 | 4 GHz |
| 子载波间隔 | 15 kHz |
| 延迟格数（$K$） | 128 |
| 多普勒格数（$M$） | 16 |
| 导频加保护格数 | 112 |
| 调制方式 | QPSK |
| 信道模型 | TDL-B |
| RMS 延迟扩展 | 300 ns |
| 信道长度（$L$） | 4 |
| 过采样因子（$R$） | 2 |
| 移动速度 | 125、500 km/h |
| GCE-BEM 阶数（$Q$） | 125 km/h 时为 3；500 km/h 时为 9 |
| CE-BEM 压力测试阶数（$Q$） | 125 km/h 时为 15 |

仿真采用 $K=128$ 个延迟格、$M=16$ 个多普勒格、共 $KM=2048$ 个格点的 OTFS 帧。信道遵循第三代合作伙伴计划（3GPP）抽头延迟线 B（TDL-B）模型 [29]，RMS 延迟扩展为 300 ns，采用 Jakes 多普勒谱。载频设为 4 GHz，子载波间隔 $\Delta f=15$ kHz，与第五代新空口参数集一致。此设置下离散时间信道长度 $L=4$。

单个导频置于 $(k_p,m_p)=(\lfloor K/2\rfloor-1,\lfloor M/2\rfloor-1)$，使用第 V 节的全保护图样。于是帧内包含 $(2L-1)M=112$ 个导频加保护格点与 1936 个数据格点，相应导频开销为 $\frac{(2L-1)M}{KM}=\frac{7}{128}\approx5.5\%$。

单个非零导频承载的数据能量等于正交相移键控（QPSK）数据符号在相同 $(2L-1)M$ 个格点上发送的平均能量。所有估计器使用相同发送帧、导频能量与噪声方差。表 I 汇总其余仿真参数。

我们评估误比特率（BER）与信道估计 MSE，后者定义为

$$
\mathrm{MSE}=\frac{1}{NL}\mathbb E\left\{\left\|\mathbf G-\widehat{\mathbf G}\right\|_F^2\right\},
$$

其中 $\mathbf G$ 是真实样本速率信道系数矩阵，$\widehat{\mathbf G}$ 是其估计。期望在信道、载荷与噪声实现上取。

### A. ZPDI 后果的说明

在给出端到端 BER 与 MSE 比较之前，我们首先考察分析的三个后果：命题 1 的 ZPDI 解耦、(19) 中的误差分解，以及第 IV 节发展的 Gram 矩阵性质。除另行说明，设置取表 I 的 500 km/h 工作点（$K=128$、$M=16$、$L=4$，GCE-BEM 取 $R=2$、$Q=9$）；仅信道模型按下述替换。为消除 BEM 建模误差的混杂效应，信道在 BEM 子空间中精确合成，$\mathbf G=\boldsymbol\Phi\boldsymbol\Gamma$ 且 $\mathrm{vec}(\boldsymbol\Gamma)\sim\mathcal{CN}(\mathbf 0,\mathbf I_{QL})$，于是 $\mathbf E=\mathbf 0$，唯一剩余误差源是 (19) 的两项：载荷相关偏置与经 $\mathbf R_{pp}^{-1}$ 塑形的热噪声。期望在 400 次独立信道、载荷与噪声实现上估计（导频功率扫描用 200 次）。非 ZPDI 配置为相同单导频图样但延迟保护减至半宽 $d=1<L-1$，多普勒保护保持完整，使信道移位把导频映射到数据格点并重新引入 $\mathbf R_{pu}(\mathbf s_u)$。

**载荷解耦。** 图 1(a) 报告最坏情况归一化导频–数据泄漏

$$
\epsilon_{\mathrm{PDI}}^{\max}=\max_j\frac{\left\|\boldsymbol\Psi_p^H\boldsymbol\Psi_u(\mathbf e_j)\right\|_F}{\left\|\mathbf R_{pp}\right\|_F}, \tag{47}
$$

其中 $\mathbf e_j$ 激活单个载荷格点。由 $\boldsymbol\Psi_u(\cdot)$ 的线性性，对每个基向量 $\mathbf e_j$ 泄漏为零即可证明对每个可允许载荷都为零，使 (47) 成为 (20) 的确定性检验而非采样平均。在对称延迟保护 $d\in\{0,\dots,L-1\}$ 且多普勒保护完整的测试族中，只有全保护 $d=L-1$ 把 $\epsilon_{\mathrm{PDI}}^{\max}$ 驱动到机器精度（$<10^{-15}$）；不足保护 $d\in\{0,1,2\}$ 留下 $\epsilon_{\mathrm{PDI}}^{\max}\in\{8.2,6.7,4.7\}\times10^{-2}$。这说明命题 1：全保护是该族中满足命题 2 不相交支撑规则的成员，因而对每个可允许载荷都有 $\mathbf R_{pu}(\mathbf s_u)=\mathbf 0$。算子层面条件 (20) 一般并不唯一确定某个保护宽度，也可由无不相交支撑的代数抵消满足。

**误差分解与干扰地板。** 图 1(b) 绘制匹配导频估计器 (21) 的实测信道估计归一化 MSE（NMSE）随 SNR 的变化（标记，Monte Carlo）与由 (19) 得到的闭式预测（实线）：

$$
\mathrm{NMSE}(\mathrm{SNR})=\frac{\mathbb E\left\|\mathbf R_{pp}^{-1}\mathbf R_{pu}(\mathbf s_u)\boldsymbol\gamma\right\|_{\mathbf W}^2+\sigma_w^2\mathrm{tr}\left(\mathbf W\mathbf R_{pp}^{-1}\right)}{\mathbb E\|\boldsymbol\gamma\|_{\mathbf W}^2}, \tag{48}
$$

其中信道域加权 $\mathbf W=\mathbf I_L\otimes\boldsymbol\Phi^H\boldsymbol\Phi$，$\|\mathbf x\|_{\mathbf W}^2=\mathbf x^H\mathbf W\mathbf x$，因此在精确 BEM 信道下 $\|\widehat{\mathbf G}-\mathbf G\|_F^2=\|\widehat{\boldsymbol\gamma}-\boldsymbol\gamma\|_{\mathbf W}^2$。Monte Carlo NMSE 在整个范围内与预测的偏差在采样散布以内。对 ZPDI 全保护图样，偏置项消失，NMSE 与仅噪声曲线 $\sigma_w^2\mathrm{tr}(\mathbf W\mathbf R_{pp}^{-1})$ 重合且无地板地下降。对非 ZPDI 图样，偏置项不随 SNR 变化，产生 (19) 预测的高 SNR 地板。此处导频承载表 I 的 QPSK 匹配能量，即单位导频–数据功率比。图 2(a) 随后固定数据功率并扫描导频能量：按 (48) 中与 SNR 无关的偏置项评估，地板随 $1/E_p$ 衰减，但在任何有限导频–数据比下都不消失，故干扰不能仅靠导频功率去除。

**可辨识性、条件数与结构。** (44) 的计数上限 $Q\le M$ 与基无关，为在不出现 $R=2$ 条件数混杂的情况下展示它，图 2(b) 对全保护图样用良条件 CE-BEM（$R=1$，此时 $Q\le M$ 下 $\mathbf R_{pp}=(E_p/N)\mathbf I_{QL}$）扫描 BEM 阶数。最小特征值 $\lambda_{\min}(\mathbf R_{pp})$ 对所有 $Q\le M$ 保持在 $E_p/N$ 且秩亏为零：在 $Q=M$ 时逐抽头问题虽恰定但仍满秩。对 $Q>M$，秩亏以 $L(Q-M)$ 打开、$\lambda_{\min}$ 降为零，故结构奇异始于 $Q=M+1$，说明上限 (44)；数值秩使用容差 $QL\epsilon\|\mathbf R_{pp}\|$。表 II 汇总 $Q=9$、$R=2$ 工作点其余确定性检验：抽头间 Gram 能量在机器精度下为零，验证 (42) 的 ZPPL 块对角化；逐抽头块与闭式 Toeplitz 表达式 (45) 吻合到 $3\times10^{-16}$；条件数 $\kappa(\mathbf R_{pp})\approx7.0\times10^5$ 进入 (48) 预测的噪声项 $\sigma_w^2\mathrm{tr}(\mathbf W\mathbf R_{pp}^{-1})$，量化该 $R=2$ 过采样基在 §IV-B 讨论的噪声放大；CE-BEM 极限 $R=1$ 给出 $\kappa(\mathbf R_{pp})=1$。

> **表 II（原文 Table II）：** OTFS 全保护图样的 Gram 矩阵诊断，说明第 IV 节分析。除注明外各行在 $Q=9$、$R=2$ 工作点评估；可辨识性一行用 CE-BEM（$R=1$）。

| 量 | 实测 | 预测 |
|---|---|---|
| $\epsilon_{\mathrm{PDI}}^{\max}$（全保护） | $<10^{-15}$ | 0 (20) |
| 抽头间 Gram 能量（相对） | $<10^{-15}$ | 0 (28) |
| Toeplitz 闭式误差 | $2.8\times10^{-16}$ | 0 (45) |
| $\mathrm{rank}(\mathbf R_{pp})$，$Q=9$ | 36 | $QL=36$ |
| $Q=M+1$ 处秩亏（$R=1$） | $L=4$ | $L(Q-M)$ (44) |
| $\kappa(\mathbf R_{pp})$，$R=2$/$R=1$ | $7.0\times10^5$/1 | — |

> **原文疑点：** §VI-A 正文称逐抽头块与闭式 Toeplitz 表达式 (45) 的吻合误差为 $3\times10^{-16}$，而表 II 中"Toeplitz closed-form error"测得值为 $2.8\times10^{-16}$；二者相差舍入，按原文照录并加注。

> **图 1（原文 Fig. 1）：** 精确 BEM 信道（$\mathbf E=\mathbf 0$）下表 I 的 500 km/h 工作点（$R=2$、$Q=9$）ZPDI 后果说明：(a) 对全部基向量载荷的最坏归一化导频–数据泄漏 $\epsilon_{\mathrm{PDI}}^{\max}$ 随延迟保护半宽 $d$ 的变化，仅在 $d=L-1$ 处塌缩到机器精度，与命题 2 的不相交支撑规则一致；(b) ZPDI（$d=L-1$）与非 ZPDI（$d=1$）图样的信道估计 NMSE 随 SNR 的变化，标记为实测估计器 NMSE、实线为闭式预测 (48)，虚线为仅噪声项；非 ZPDI 地板是 (19) 中依赖载荷的偏置。

> **图 2（原文 Fig. 2）：** (a) 固定数据功率时非 ZPDI 图样的高 SNR NMSE 地板随导频–数据功率比的变化：地板随 $1/E_p$ 衰减（虚线），但在每个有限比下仍为正，如 (19) 之后所预期。(b) 全保护 Gram 矩阵的最小特征值（左，CE-BEM $R=1$）与秩亏 $QL-\mathrm{rank}(\mathbf R_{pp})$（右）随 BEM 阶数 $Q$ 的变化：$Q\le M$ 时 $\mathbf R_{pp}$ 满秩，$Q>M$ 时秩亏 $L(Q-M)$，说明可辨识性上限 (44)。

### B. ZPDI 估计器

独立 ZPDI 接收机使用由估计信道构建的时域线性最小均方误差（TD-LMMSE）均衡器，与完美 CSI、Raviteja 等 [12] 的估计器以及 Liu 等 [23] 迭代 BEM 接收机的仅导频初始化比较。

由于 [12] 返回 DD 域矩阵 $\widehat{\mathbf H}_{\mathrm{dd}}\in\mathbb C^{K\times M}$ 而非 BEM 系数，我们沿多普勒做逆 DFT 恢复每个延迟抽头 $\ell$ 的符号级系数：

$$
g_\ell[q]=\sum_{m=0}^{M-1}\widehat H_{\mathrm{dd}}[k_p+\ell,m]e^{\mathrm j2\pi qm/M},\qquad q=0,\dots,M-1, \tag{49}
$$

并线性插值到 TD-LMMSE 均衡器与 MSE 评估所用的样本速率向量 $\mathbf g_\ell$。

仿真考虑 $v=125$ 与 500 km/h。BEM 阶数在

$$
Q_{\min}\triangleq2\left\lceil R\nu_{\max}\frac{M}{\Delta f}\right\rceil+1\le Q\le M \tag{50}
$$

内选择，其中 $T_{\mathrm{obs}}=M/\Delta f$ 是帧观测时间（$M$ 个多普勒符号，每个时长 $1/\Delta f$），故 $\lceil R\nu_{\max}T_{\mathrm{obs}}\rceil$ 计数零多普勒项两侧所需的 GCE-BEM 多普勒格点数；因此 $Q_{\min}$ 是覆盖 $[-\nu_{\max},\nu_{\max}]$ 的最小奇 GCE-BEM 阶数，而上界为 (44) 的可辨识性极限。增大 $Q$ 降低建模误差但增大系数向量与 Gram 矩阵；[1] 中的 MSE 分解证实该折中（噪声项随 $Q$ 线性增长，失配项下降）。Liu 接收机 [23] 用 $R=1$ 的 GCE-BEM（CE-BEM 特例）取 $Q_S=15$ 做初始化，并用 $R=2$ 的 GCE-BEM 取 $Q_L=9$ 做数据辅助精化；由于 $M=16$，$Q_S=15$ 是 (50) 中最大的可允许奇数阶。

图 3a 与 4a 报告 BER 随 SNR 的变化。在 $v=125$ km/h 时，GCE-BEM（$Q=3$）紧贴完美 CSI，而 CE-BEM 即便在最大可允许阶 $Q=15$ 下也在中高 SNR 出现地板。在 $v=500$ km/h 时，ZPDI 估计器（$R=2$、$Q=9$）在高 SNR 与完美 CSI 相差约 2 dB 以内。ZPDI 消除导频–数据干扰但不消除基失配，故 BER 仍取决于所选 BEM。Liu 初始化（$R=1$、$Q_S=15$）尽管采用最大可允许奇数 CE-BEM 阶，仍在高 SNR 出现地板，与残余基失配一致。[12] 的估计器介于两者之间，且在 $v=500$ km/h 也出现地板，此时分数多普勒扭曲了重建导频响应。图 3b 与 4b 给出相应 MSE。CE-BEM 与 Liu 初始化的地板解释了它们的 BER 地板，而 [12] 的估计器位于 ZPDI GCE-BEM 曲线上方，在 $v=500$ km/h 有清晰地板。ZPDI GCE-BEM 的 MSE 在两种场景下都随 SNR 下降，无可见干扰引起的地板。

> **图 3（原文 Fig. 3）：** 表 I 设置下 $v=125$ km/h 时 (a) BER 与 (b) MSE 随 SNR 的变化。曲线包括 GCE-BEM 的 ZPDI 估计器、CE-BEM 压力测试、Liu 接收机 [23] 的仅导频首步（$(R,Q_S)=(1,15)$）、[12] 的估计器与完美 CSI。CE-BEM 压力测试与 Liu 初始化在最大可允许奇数 CE-BEM 阶下仍保留高 SNR 地板，与 BEM 失配一致。ZPDI 估计器按构造不含导频–数据干扰，见 (19)。

> **图 4（原文 Fig. 4）：** $v=500$ km/h 时 (a) BER 与 (b) MSE 随 SNR 的变化。估计器与图 3 相同，但省略 CE-BEM 压力测试；Liu 初始化使用 $(R,Q_S)=(1,15)$。参考地板与 BEM 或时域重建失配一致。ZPDI 估计器在仿真 SNR 范围内无可见地板，见 (19)。

### C. 判决导向接收机的 ZPDI 初始化

仅导频 ZPDI 估计可初始化迭代接收机：试探载荷判决定义数据辅助 LS 更新，近似 (14) 中的精灵辅助估计器。我们在 $v=500$ km/h 评估该判决导向接收机。两个分支共享相同 OTFS 帧、TDL-B 信道、导频能量、全保护图样与 TD-LMMSE 检测器，故比较隔离了仅导频初始化的作用。ZPDI 初始化分支两阶段都用 $(R,Q)=(2,9)$；Liu 接收机 [23] 用 $(R,Q_S)=(1,15)$ 初始化、$(R,Q_L)=(2,9)$ 精化，并改变精化次数。

> **算法 1　带 ZPDI 初始化的判决导向接收机**
> **Require：** $\mathbf r$、$\mathbf s_p$、$\mathbf P_p$、$\mathbf P_u$、$\boldsymbol\Phi$、$\mathbf W_p$、$\mathrm{Dec}$、$I_{\max}$、$\epsilon_{\mathrm{stop}}$
> **Ensure：** $\widehat{\mathbf s}_u$、$\widehat{\mathbf G}$
> 1: $\widehat{\boldsymbol\gamma}^{(0)}\leftarrow\mathbf W_p\mathbf r$
> 2: 把 $\widehat{\boldsymbol\gamma}^{(0)}$ 重排为 $\widehat{\boldsymbol\Gamma}^{(0)}$
> 3: $\widehat{\mathbf G}^{(0)}\leftarrow\boldsymbol\Phi\widehat{\boldsymbol\Gamma}^{(0)}$
> 4: **for** $i=0,\dots,I_{\max}-1$ **do**
> 5: 　$\widehat{\mathbf s}_u^{(i)}\leftarrow\mathrm{Dec}(\mathbf r;\widehat{\mathbf G}^{(i)})$
> 6: 　构造 $\boldsymbol\Psi_u(\widehat{\mathbf s}_u^{(i)})$ 并形成 $\boldsymbol\Psi(\widehat{\mathbf s}_u^{(i)})=\boldsymbol\Psi_p+\boldsymbol\Psi_u(\widehat{\mathbf s}_u^{(i)})$
> 7: 　按 (51) 更新 $\widehat{\boldsymbol\gamma}^{(i+1)}$
> 8: 　把 $\widehat{\boldsymbol\gamma}^{(i+1)}$ 重排为 $\widehat{\boldsymbol\Gamma}^{(i+1)}$
> 9: 　$\widehat{\mathbf G}^{(i+1)}\leftarrow\boldsymbol\Phi\widehat{\boldsymbol\Gamma}^{(i+1)}$
> 10: 　$\epsilon_i^{\mathrm{upd}}\leftarrow(NL)^{-1}\|\widehat{\mathbf G}^{(i+1)}-\widehat{\mathbf G}^{(i)}\|_F^2$
> 11: 　**if** $\epsilon_i^{\mathrm{upd}}\le\epsilon_{\mathrm{stop}}$ **then**
> 12: 　　**break**
> 13: 　**end if**
> 14: **end for**
> 15: **return** 最新的 $\widehat{\mathbf s}_u^{(i)}$ 与 $\widehat{\mathbf G}^{(i+1)}$

算法 1 给出接收机步骤，其中 $\mathrm{Dec}(\mathbf r;\widehat{\mathbf G})$ 是 TD-LMMSE 检测器后接硬 QPSK 判决。在第 $i$ 次迭代，检测到的载荷定义数据辅助 LS 更新

$$
\widehat{\boldsymbol\gamma}^{(i+1)}=\left(\boldsymbol\Psi^H(\widehat{\mathbf s}_u^{(i)})\boldsymbol\Psi(\widehat{\mathbf s}_u^{(i)})\right)^{-1}\boldsymbol\Psi^H(\widehat{\mathbf s}_u^{(i)})\mathbf r. \tag{51}
$$

迭代在 $I_{\max}$ 或更新度量 $\epsilon_i^{\mathrm{upd}}\triangleq(NL)^{-1}\|\widehat{\mathbf G}^{(i+1)}-\widehat{\mathbf G}^{(i)}\|_F^2$ 低于 $\epsilon_{\mathrm{stop}}$（例如 $10^{-2}$）时停止。初始化只需预计算投影 $\mathbf W_p\mathbf r$，而每次精化的代价为 $\mathcal O(N(QL)^2+(QL)^3)$ 加检测器代价，后者以形成并求解数据相关正规矩阵 $\boldsymbol\Psi^H(\widehat{\mathbf s}_u^{(i)})\boldsymbol\Psi(\widehat{\mathbf s}_u^{(i)})$ 为主。

图 5 比较两种接收机。ZPDI 初始化后两次精化使 BER 接近完美 CSI，并低于独立仅导频 ZPDI 曲线。Liu 接收机在 1 次与 2 次迭代后仍保留高 SNR BER 地板；最多 20 次迭代可降低地板但仍高于 ZPDI 初始化曲线。MSE 行为类似：ZPDI 初始化后两次数据辅助精化在高 SNR 匹配 20 次迭代的 Liu 结果。由于两分支共享相同精化基与 LS 更新，差异源于仅导频初始化。

> **图 5（原文 Fig. 5）：** $v=500$ km/h 时判决导向接收机结果：(a) BER 与 (b) 信道估计 MSE。独立 ZPDI GCE-BEM 曲线使用 $(R,Q)=(2,9)$。ZPDI 初始化曲线以相同基应用两次数据辅助 LS 精化。Liu 接收机 [23] 用 $(R,Q_S)=(1,15)$ 初始化、$(R,Q_L)=(2,9)$ 精化；其曲线展示 1 次、2 次与最多 20 次迭代。

## VII. 结论

本文建立了载荷解耦仅导频 BEM 信道估计的精确条件。该结果识别出常规匹配导频 LS 估计何时载荷无关、且等于缩减导频统计量的 ML 估计量。若 ZPDI 不成立，残余 PDI 成为确定性的、按信道缩放的偏置，在任何固定导频–数据功率比下产生高 SNR 误差地板，且无法通过平均去除。该算子层面条件覆盖任意 BEM 子空间、任意酉观测变换以及 CP、ZP、CPP 保护。一个与基无关的不相交支撑规则为导频、保护与数据放置给出显式准则，为候选导频图样提供精确设计检验。随后独立的导频 Gram 矩阵支配可辨识性、条件数与单次离线求逆的代价。

ZPDI 下，在线估计器只需一次预计算投影，复杂度与帧长成线性；其误差分离为热噪声与 BEM 建模误差。对 OTFS 单导频全保护图样，ZPDI 与零导频–导频泄漏同时成立。受控的精确 BEM 示例证实了预测的泄漏、偏置加噪声分解、高 SNR 地板与导频 Gram 结构。在 3GPP TDL-B 信道上，GCE-BEM 的 ZPDI 估计器在 125 与 500 km/h 下接近完美 CSI 的 BER，并可靠地初始化判决导向精化，而 CE-BEM 与参考估计器表现出高 SNR 地板。

## 参考文献（英文原书目）

- [1] G. Romano, F. A. N. Palmieri, S. Buzzi, G. Di Gennaro, and A. Buonanno, "Non-iterative BEM-Based OTFS Channel Estimation with Full-Guard Embedded Pilots," in Proc. IEEE Int. Workshop Signal Process. Adv. Wirel. Commun. (SPAWC), 2026.
- [2] D. Tse and P. Viswanath, Fundamentals of Wireless Communication. Cambridge: Cambridge University Press, 2005.
- [3] A. Goldsmith, Wireless Communications. Cambridge: Cambridge University Press, 2005.
- [4] X. Chen, W. Chen, X. Gong, B. Ai, and I. Wassell, "Wireless channel estimation for high-speed rail communications: Challenges, solutions and future directions," High-Speed Railw., vol. 1, no. 1, pp. 18–22, Mar. 2023.
- [5] A. A. Khuwaja, Y. Chen, N. Zhao, M.-S. Alouini, and P. Dobbins, "A survey of channel modeling for UAV communications," IEEE Commun. Surv. Tutor., vol. 20, no. 4, pp. 2804–2821, 2018.
- [6] A. M. Darya and S. Abdallah, "EM-based channel estimation for mMIMO LEO SATCOM under imperfect Doppler compensation," IEEE Trans. Veh. Technol., pp. 1–6, 2025.
- [7] F. Hlawatsch and G. Matz, Wireless Communications Over Rapidly Time-Varying Channels. Academic Press, 2011.
- [8] R. Hadani, S. Rakib, M. Tsatsanis, A. Monk, A. J. Goldsmith, A. F. Molisch, and R. Calderbank, "Orthogonal time frequency space modulation," in 2017 IEEE Wirel. Commun. Netw. Conf. (WCNC). San Francisco, CA, USA: IEEE, Mar. 2017, pp. 1–6.
- [9] Z. Wei, W. Yuan, S. Li, J. Yuan, G. Bharatula, R. Hadani, and L. Hanzo, "Orthogonal time-frequency space modulation: A promising next-generation waveform," IEEE Wirel. Commun., vol. 28, no. 4, pp. 136–144, Aug. 2021.
- [10] Y. Hong, T. Thaj, and E. Viterbo, Delay-Doppler Communications: Principles and Applications. Academic Press, 2022.
- [11] Q. Deng, Y. Ge, and Z. Ding, "A unifying view of OTFS and its many variants," IEEE Commun. Surv. Tutor., pp. 1–1, 2025.
- [12] P. Raviteja, K. T. Phan, and Y. Hong, "Embedded pilot-aided channel estimation for OTFS in delay–Doppler channels," IEEE Trans. Veh. Technol., vol. 68, no. 5, pp. 4906–4917, May 2019.
- [13] W. Yuan, S. Li, Z. Wei, J. Yuan, and D. W. K. Ng, "Data-aided channel estimation for OTFS systems with a superimposed pilot and data transmission scheme," IEEE Wirel. Commun. Lett., vol. 10, no. 9, pp. 1954–1958, Sep. 2021.
- [14] H.-T. Sheng and W.-R. Wu, "Time-frequency domain channel estimation for OTFS systems," IEEE Trans. Wirel. Commun., vol. 23, no. 2, pp. 937–948, Feb. 2024.
- [15] E. Aslandogan, H. Ilhan, B. A. Ozden, E. Aydin, E. Basar, M. Wen, M. D. Renzo, and V. Poor, "A comprehensive survey of channel estimation techniques for OTFS in 6G and beyond wireless networks," Dec. 2025.
- [16] B. Li, Q. Zheng, X. Tian, M. Yang, G. Gui, W. Jiang, H. Lei, J. Jiang, F. Shu, A. Elhanashi, and S. Saponara, "A survey of artificial intelligence enabled channel estimation methods: Recent advance, performance, and outlook," Artif. Intell. Rev., vol. 58, no. 6, p. 187, Apr. 2025.
- [17] G. Giannakis and C. Tepedelenlioglu, "Basis expansion models and diversity techniques for blind identification and equalization of time-varying channels," Proc. IEEE, vol. 86, no. 10, pp. 1969–1986, Oct. 1998.
- [18] X. Ma, G. Giannakis, and S. Ohno, "Optimal training for block transmissions over doubly selective wireless fading channels," IEEE Trans. Signal Process., vol. 51, no. 5, pp. 1351–1366, May 2003.
- [19] X. Huang, A. Farhang, and R.-R. Chen, "Channel estimation and turbo equalization for coded OTFS and OFDM: A comparison," IEEE Wirel. Commun. Lett., vol. 12, no. 9, pp. 1613–1617, Sep. 2023.
- [20] Q. Guo, H. Jiang, J. Xiang, and Y. Zhong, "Low complexity iterative channel estimation and detection based on pilot-assisted for ZP-OTFS," IEEE Commun. Lett., vol. 29, no. 4, pp. 724–728, Apr. 2025.
- [21] ——, "A CS-BEM OTFS channel estimation approach for sparse continuous Doppler-spread channels," IEEE Wirel. Commun. Lett., vol. 13, no. 11, pp. 2985–2989, Nov. 2024.
- [22] H. Qu, G. Liu, L. Zhang, M. A. Imran, and S. Wen, "Low-dimensional subspace estimation of continuous-Doppler-spread channel in OTFS systems," IEEE Trans. Commun., vol. 69, no. 7, pp. 4717–4731, Jul. 2021.
- [23] Y. Liu, Y. L. Guan, and D. G. G., "Near-optimal BEM OTFS receiver with low pilot overhead for high-mobility communications," IEEE Trans. Commun., vol. 70, no. 5, pp. 3392–3406, May 2022.
- [24] A. Mohebbi, W.-P. Zhu, and M. O. Ahmad, "Two-dimensional DPS-BEM based channel estimation for MIMO OTFS systems," IEEE Trans. Veh. Technol., vol. 75, no. 3, pp. 4352–4368, Mar. 2026.
- [25] H. Wu, H. Chen, Q. Peng, Q. Luo, and J. Ou, "Performance analysis of BEM-based channel estimation for OTFS with hardware impairments," Feb. 2025.
- [26] A. P. Kannu and P. Schniter, "Design and analysis of MMSE pilot-aided cyclic-prefixed block transmissions for doubly selective channels," IEEE Trans. Signal Process., vol. 56, no. 3, pp. 1148–1160, Mar. 2008.
- [27] W. Benzine, A. Bemani, N. Ksairi, and D. Slock, "Models, methods, and waveforms for estimation and prediction of sparse time-varying channels," IEEE Trans. Wirel. Commun., vol. 25, pp. 9623–9638, 2026.
- [28] A. Bemani, N. Ksairi, and M. Kountouris, "Affine frequency division multiplexing for next generation wireless communications," IEEE Trans. Wirel. Commun., vol. 22, no. 11, pp. 8214–8229, Nov. 2023.
- [29] 3GPP, "Study on channel model for frequencies from 0.5 to 100 GHz," 3rd Generation Partnership Project (3GPP), Tech. Rep. TR 38.901, Version 18.0.0, Release 18, May 2024.

## 图注与表注索引

本页图 1–5 的中文图注（含图 1(a)(b)、图 2(a)(b)、图 3(a)(b)、图 4(a)(b)、图 5(a)(b) 子图说明）与表 I–II 的表注均按原文出现位置内联在正文中（表 I 与图 1–2 见第 VI-A 节，表 II 见第 VI-A 节末，图 3–4 见第 VI-B 节，图 5 与算法 1 见第 VI-C 节），此处不重复罗列。原文为 IEEE 期刊双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.00937v1 全文（13 页）的中文译稿：摘要、索引词、第 I–VII 节正文与编号小节、图 1–5 的中文图注（含子图）、表 I–II 的逐格转写、命题 1–4 与证明要点、Remark 1–2、式 (1)–(51)、算法 1 伪代码，以及参考文献 29 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：式 (1)–(51) 逐式核对（重点 (4)–(11)、(15)–(24)、(28)–(33)、(35)–(46)、(47)–(51)）；表 I 用第 9 页渲染图逐格核对（14 项参数全部一致），表 II 用第 11 页渲染图逐格核对（6 行实测/预测值一致）。已加注一处原文疑点：§VI-A 正文称 Toeplitz 闭式误差 $3\times10^{-16}$，表 II 测得值为 $2.8\times10^{-16}$。本页不上传原文图片，图 1–5 曲线数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
