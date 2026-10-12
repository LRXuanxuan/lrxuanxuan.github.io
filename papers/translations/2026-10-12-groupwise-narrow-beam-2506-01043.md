---
layout: page
title: "分组窄波束设计：混合波束成形系统的上行信道估计——中文译文"
permalink: /papers/translations/2026-10-12-groupwise-narrow-beam-2506-01043/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原论文 PDF](https://arxiv.org/pdf/2506.01043v1)

# 面向混合波束成形系统上行信道估计的分组窄波束设计

**英文题名：** A Group-Wise Narrow Beam Design for Uplink Channel Estimation in Hybrid Beamforming Systems  
**作者：** Yufan Zhou、Yongbo Xiao、An Liu  
**机构：** 浙江大学信息与电子工程学院  
**版本：** arXiv:2506.01043v1，2025 年 6 月 1 日，13 页。

> 本稿依上传的原始论文顺序译出摘要、第 I–VII 节、附录 A、算法 1、式（1）–（41）、表 I 与图 1–11 的题注及分析。参考文献沿用英文题名和编号以便核对。本文原 PDF 个别位置存在公式排版或角度变量笔误，译文尊重原文并在必要处注明，不擅改推导结果。

## 摘要

本文考虑采用**部分连接混合波束成形（Partially Connected Hybrid Beamforming，PC-HBF）**结构的大规模多输入多输出（MIMO）系统中的上行信道估计。现有波束设计与信道估计方案通常依赖理想化假设，并要求跨多个时隙发送导频，因此不适用于实际 PC-HBF 系统。为了克服这些缺点，本文提出新的波束设计及相应的信道估计算法，实现准确、实时的上行信道估计。

首先，我们在垂直维度引入**分组窄波束设计**，抑制非目标角度分量造成的干扰，提高垂直角度估计精度。具体而言，将均匀平面阵列（UPA）的列划分为多个组，并将垂直角度区间划分为若干子区间，为每组分配一个覆盖特定垂直角度子区间的窄波束；窄波束集合基于滤波器设计理论构造。其次，利用**分布估计算法（Estimation of Distribution Algorithm，EDA）**优化天线分组方式，在水平方向平衡干扰抑制能力与分辨能力，改善水平角度估计。最后，提出低复杂度**分组子空间约束变分贝叶斯推断（Group-Wise Subspace-Constrained Variational Bayesian Inference，GW-SC-VBI）**算法，充分利用波束设计特征，同时实现较低计算复杂度与较高信道估计精度。仿真结果表明，相比基线方法，所提出方案具有明显性能提升。

**索引词：** 上行信道估计、大规模 MIMO、PC-HBF。

## I. 引言

大规模 MIMO 已成为 5G 新空口（NR）的核心物理层技术 [1]。为在性能与成本之间取得平衡，文献 [2] 引入混合波束成形（Hybrid Beamforming，HBF），将模拟波束成形与数字波束成形相结合。模拟侧使用成本较低的移相器减少射频链路数量，数字侧则在基带执行低维信号处理。HBF 主要包括两种结构：**全连接式**中，每条射频链通过移相器连接全部天线，以获得最大的波束成形增益 [2]；**部分连接式**中，每条射频链仅与天线子集连接，从而进一步降低成本与复杂度 [3]。由于效率较高，PC-HBF 在实际系统中更常见。

不过，PC-HBF 使基站准确、实时获取信道状态信息（CSI）变得更加困难。因为待估计 CSI 的维数超过接收观测维数，传统最小二乘（LS）[4] 和最小均方误差（MMSE）[5]、[6] 方法难以直接获得良好性能。现有研究因此倾向于在角域寻求高精度估计。[7] 通过在不同时间隙设置不同模拟波束矩阵，将多时隙观测结合为等效观测和满秩等效模拟矩阵，再用二维 DFT 估计路径角度。[8] 提出的卷积波束空间（CBS）算法用带通滤波器划分角度区间，并在滤波后均匀降采样，在降低维度的同时保留 Vandermonde 结构，从而应用 MUSIC、root-MUSIC 等高分辨率子空间算法。[9] 将 CBS 扩展到全连接混合架构。但这些方法需要多个时隙来获得足够观测，无法直接应对更受限的 PC-HBF。

另一类方法利用有限散射体导致的角域稀疏性，将信道估计建模为压缩感知（CS）问题 [10]、[11]。[12]、[13] 采用多阶段角度搜索：将到达角（AoA）和出发角（AoD）划为子区间，每一阶段根据上一阶段反馈设计波束，通过修改后的匹配追踪算法逐步收窄范围。[14] 提出低复杂度子空间约束变分贝叶斯推断（SC-VBI）算法，对角域稀疏信道进行实时估计；其中模拟和数字波束通常随机设计，使限制等距性质（RIP）以较高概率成立。

但实际系统中的关键条件不满足上述方案的理想假设。第一，为支持更多用户的上行信道估计，每位用户通常只在一个时隙中被分配一个导频符号 [15]、[16]。系统缺陷又不可避免地使接收探测参考信号（SRS）遭受相位噪声 [15]，带来随机相位偏移并破坏跨时隙信道的时间相关性。因此不能假设不同时隙的信道不变，[7]、[9] 等依赖多时隙的方案难以适用。第二，多时隙估计降低 CSI 获取速度与实时性。第三，实际大规模阵列多采用 UPA 而非 ULA，以在较小面积内容纳更多天线；同时更多采用部分连接式以节约硬件。这使模拟波束矩阵只有部分元素非零，设计自由度明显受限。尽管随机波束与 SC-VBI [14] 允许实时估计，其波束设计未充分利用阵列增益，特别是在低 SNR 下性能受限。

本文研究一种基站 UPA 位于 \(yz\) 平面、每条射频链连接一个**垂直子阵列**的实际 PC-HBF 结构（图 1(a)）。这种架构中，接收信号沿垂直方向压缩。实际部署时基站通常架设在一定高度，而基站与用户及其散射体之间的水平距离通常远大于基站高度，因此垂直到达角可限制在事先已知的区间 \(\Phi\) 中，典型为 \([-\pi/6,0]\)（图 1(b)）。利用这种垂直角度先验，可以使用更高压缩比，提高系统效率。本文提出仅依赖**单个上行导频符号**的分组窄波束方案与低复杂度估计算法，利用 PC-HBF 下可用的阵列增益。

本文的三项贡献为：

1. **垂直方向的分组窄波束。** 借鉴 CBS 的带通滤波器组思想，将垂直角域均匀分成 \(G\) 个子区间，将 UPA 的 \(N_y\) 列划成 \(G\) 组，分别用一个根据滤波器设计理论构造的窄波束覆盖子区间。由此使不同角度的压缩响应存在差异，减轻垂直角度歧义，并在角域范围内利用阵列增益。
2. **优化水平方向的天线分组模式。** 由于某条路径在相应组内可能才有强接收信号，该路径用于水平角度估计的有效天线数量减少。本文联合考虑积分旁瓣电平（ISL）与统计分辨极限（SRL），分别衡量抗干扰与分辨能力，利用离线 EDA 寻找两者平衡的分组方案。
3. **低复杂度 GW-SC-VBI。** 将观测及角度网格划分成多个互不重叠组，在各组上独立并行运行 SC-VBI；最后几次迭代执行联合估计，以改善位于相邻区间边界处的路径估计。降低处理维数，有利于数千天线级系统。

以下第 II 节建立系统与信号模型，第 III 节设计垂直窄波束，第 IV 节优化水平方向分组，第 V 节构造 GW-SC-VBI，第 VI 节仿真，第 VII 节总结。

**图 1：实际 PC-HBF 系统示意（原文第 2 页）。** (a) UPA 垂直子阵列与 RF 链路结构；(b) 基站、用户和散射体的空间位置以及负垂直角度的定义。[原图](https://arxiv.org/pdf/2506.01043v1#page=2)

**数学记号。** \((\cdot)^{-1},(\cdot)^\top,(\cdot)^H,\|\cdot\|\) 分别表示矩阵求逆、转置、共轭转置和 \(\ell_2\) 范数；\(\Re\{\cdot\}\) 为实部。\(x_{\mathcal S}\) 为索引集 \(\mathcal S\) 对应的子向量，\(|\mathcal S|\) 为基数；\(\operatorname{diag}(x)\) 是以 \(x\) 为对角线的矩阵，\(\otimes,\odot\) 分别表示 Kronecker 积和 Hadamard 积。\(\mathcal{CN}(x;\mu,\Sigma)\) 是复高斯分布，\(\Gamma(x;a,b)\) 是形状参数为 \(a\)、率参数为 \(b\) 的 Gamma 分布。\(x=\Theta(a)\) 表示存在正常数 \(k_1,k_2\) 满足 \(k_2a\le x\le k_1a\)。

## II. 系统与信号模型

### A. 系统模型

考虑窄带大规模 MIMO 与 PC-HBF 架构。估计阶段用户发送上行导频，基站根据接收信号估计信道。基站在水平和垂直方向分别具有 \(N_y,N_z\) 根天线，总数为 \(N_r=N_yN_z\)。每条 RF 链与包含 \(M\) 根天线的垂直子阵列连接，\(M\) 亦称压缩比，因此 \(N_{\rm RF}=N_r/M\)（图 1(a)）。

不失一般性，考虑单用户、用户只有一根天线的情形。由于估计阶段不同用户和不同天线发送的上行导频相互正交，方法也可以扩展至多用户多天线系统。

### B. 信号模型

基站接收向量 \(y\in\mathbb C^{N_{\rm RF}\times1}\) 满足

$$
y=F_ah+w, \tag{1}
$$

其中 \(h\in\mathbb C^{N_r\times1}\) 为用户信道，\(F_a\in\mathbb C^{N_{\rm RF}\times N_r}\) 为模拟波束矩阵，\(w\sim\mathcal{CN}(0,\sigma^2I)\) 为加性白高斯噪声。由于数字波束矩阵是满秩的并可并入观测，不影响此阶段信道估计，本文不显式考虑它。部分连接结构中的 \(F_a\) 是块对角矩阵，非零移相器系数满足单位模约束。每个子块对应长度为 \(M\) 的行压缩向量：

$$
F_a=\operatorname{blkdiag}(v_a^1,\ldots,v_a^{N_{\rm RF}}),\qquad
v_a^k\in\mathbb C^{1\times M}. \tag{2}
$$

信道向量由 \(K\) 条传播路径叠加：

$$
h=\sum_{k=1}^{K}\alpha_ka_R(\theta_k,\phi_k), \tag{3}
$$

其中 \(\alpha_k,\theta_k,\phi_k\) 是第 \(k\) 条路径的等效复增益、水平 AoA 与垂直 AoA。位于 \(yz\) 平面的 UPA 响应写为 \(a_R(\theta,\phi)=a_y(\sin\theta,\cos\phi)\otimes a_z(\sin\phi)\)。天线间距为半波长时，对应的向量元素分别为

$$
[a_y]_{n_y}=e^{j\pi n_y\sin\theta\cos\phi},\qquad
[a_z]_{n_z}=e^{j\pi n_z\sin\phi},
$$

其中 \(n_y=0,\ldots,N_y-1\)，\(n_z=0,\ldots,N_z-1\)。

## III. 垂直方向的分组窄波束设计

本节首先用模糊函数分析传统设计的局限，然后基于带通滤波器组建立波束设计准则。

### A. 传统波束设计的局限

最常见的方法之一是 [14] 的随机波束，但它无法充分利用阵列增益。为提高增益，一个直观做法是让所有压缩向量相同，使用覆盖全部垂直角度范围的宽波束，将其视为一个带通滤波器。然而，这会引发严重的垂直角度模糊。

模糊函数（Ambiguity Function，AF）衡量在简单匹配滤波下识别某个角度分量的难度，是角度估计的重要性能指标 [21]、[22]。给定模拟波束矩阵 \(F_a\) 与水平角度 \(\theta_0\)，垂直角度 \(\phi_1,\phi_2\) 之间的 AF 为：

$$
\begin{aligned}
\chi_{\rm ver}(\phi_1,\phi_2\mid\theta_0)
&=(F_aa_R(\theta_0,\phi_1))^HF_aa_R(\theta_0,\phi_2)\\
&=a_R(\theta_0,\phi_1)^HF_a^HF_aa_R(\theta_0,\phi_2).
\end{aligned}\tag{4}
$$

不同于仅取决于两变量之差的传统平稳 AF，这里的 AF 同时依赖 \(\phi_1,\phi_2\) 的绝对取值。理想的垂直 AF 应对任一给定 \(\phi_1\)，在 \(\phi_2=\phi_1\) 仅有一个主瓣，且旁瓣能量占比较低，从而使不同角度不会强烈相互干扰，确保角度可辨识。图 3 表明宽波束下出现多个与主瓣能量相近的旁瓣，导致明显的估计性能下降。这在传统波束空间处理中称为**角度模糊** [23]、[24]。

因此，问题的核心是在利用阵列增益的同时，使垂直角度响应没有歧义。

**图 2：分组窄波束示意（原文第 3 页）。** \(N_y=6,G=3\)，采用均匀分组，不同颜色对应不同组。[原图](https://arxiv.org/pdf/2506.01043v1#page=3)  
**图 3：使用宽波束时的垂直 AF（原文第 4 页）。** 给定角度 \(-15^\circ\) 时出现多个显著旁瓣。[原图](https://arxiv.org/pdf/2506.01043v1#page=4)

### B. 利用带通滤波器组设计分组窄波束

我们的主要目标是抑制不同垂直角度估计之间的相互干扰。直接优化 \(F_a\) 虽然是一种可能方案，但垂直 AF 非平稳，使问题很难处理。CBS [8]、[9] 中的带通滤波器组提供了新思路：多个非重叠带通滤波器覆盖不同角度子区间，在多个时隙中并行处理，有效抑制带外分量。然而实际 PC-HBF 要在一个时隙、一个导频内完成估计，不能直接采用 CBS 的跨时隙方法。

关键观察是：UPA 中的 \(N_y\) 个阵列列可作为垂直角度估计的不同观测，因此可以把阵列列自然划成多个组，同时将先验垂直角域划成相应子区间。每组配置指向对应子区间的窄波束，用于恢复此区间的路径。不同垂直角度压缩后产生不同响应，所有子区间的并集覆盖先验角域；无需额外处理即可使波束覆盖目标范围，保留阵列增益。

设每列 UPA 有 \(T=N_z/M\) 条 RF 链，则

$$
F_a=\operatorname{blkdiag}(\widehat F_a^1,\ldots,\widehat F_a^{N_y}),\qquad
\widehat F_a^i\in\mathbb C^{T\times N_z}. \tag{5}
$$

将 \(N_y\) 列分为 \(G\) 组，垂直角域分为 \(G\) 个等间隔子区间。注意“等间隔”是对 \(\sin\phi\) 而非直接对 \(\phi\) 进行，目的是与导向向量形式匹配。用二值向量 \(s_g\in\{0,1\}^{N_y\times1}\) 描述第 \(g\) 组，非零元素表示属于该组的阵列列。约束 \(\sum_gs_g\le\mathbf1\) 保证各组无重叠。对于 \(i\in\operatorname{supp}(s_g)\)，令 \(\widehat F_a^i=W_g\in\mathbb C^{T\times N_z}\)，波束覆盖 \(\Phi_g\)，于是

$$
F_a=\sum_{g=1}^{G}W_g\otimes\operatorname{diag}(s_g)
\in\mathbb C^{N_{\rm RF}\times N_r}. \tag{6}
$$

由于水平分组模式对垂直估计影响较小，本节固定 \(s_g\)，只设计 \(W_g\)。在 PC-HBF 中，\(W_g\) 由 \(T\) 个常模压缩向量块对角拼接：

$$
W_g=\operatorname{blkdiag}(v_g^{(1)},\ldots,v_g^{(T)}),
\quad v_g^{(t)}\in\mathbb C^{1\times M}. \tag{7}
$$

借助滤波器理论，每个压缩向量都设计为指向 \(\Phi_g\) 的相同窄带通滤波器，因此进一步简化为

$$
W_g=\operatorname{blkdiag}(a_z(\omega_g),\ldots,a_z(\omega_g)), \tag{8}
$$

其中 \(a_z(\omega_g)\in\mathbb C^{1\times M}\) 为满足常模约束、指向子区间中心角 \(\omega_g\) 的窄波束。

需要指出，[8]、[9] 的 CBS 不能直接移植到 PC-HBF，因为它在 HBF 中的实现需要全连接架构。此外，CBS 将滤波器与降采样器组合，使 RF 链数受到滤波器长度与降采样率共同约束，限制系统灵活性。相比之下，本文设计可兼容任意部分连接结构。

## IV. 水平方向的天线分组模式优化

分组窄波束使某条传播路径能用于水平角度估计的有效阵列列减少，可能降低水平估计性能。为此，需要平衡水平分辨力与抑制干扰的能力。

### A. 性能指标

我们采用**积分旁瓣电平（ISL）**和**统计分辨极限（SRL）**两个指标。

**1）水平 ISL。** 给定 \(F_a\)、垂直角度 \(\phi_0\)，两个水平角度 \(\theta_1,\theta_2\) 的 AF 为：

$$
\chi(\theta_1,\theta_2\mid\phi_0)=
(F_aa_R(\theta_1,\phi_0))^HF_aa_R(\theta_2,\phi_0). \tag{9}
$$

原论文式（9）的展开式第二个垂直角度变量标作 \(\phi_2\)，与该式固定 \(\phi_0\) 的前提不一致，此处保留原始定义并提示读者核对原文。对第 \(g\) 组，\(F_g=W_g\otimes\operatorname{diag}(s_g)\)，组内 AF 可写为

$$
\begin{aligned}
\chi_g(\theta_1,\theta_2\mid\phi_g)
&=(F_ga_R(\theta_1,\phi_g))^HF_ga_R(\theta_2,\phi_g)\\
&=a_R(\theta_1,\phi_g)^H(F_g^HF_g)a_R(\theta_2,\phi_g)\\
&=s_g^\top a_y(\Delta,\phi_g)\,\mathcal M,
\end{aligned}\tag{10}
$$

其中 \(\Delta=\sin\theta_2-\sin\theta_1\)，\(\phi_g\) 为 \(\Phi_g\) 的中心角，\(\mathcal M=a_z(\phi_g)^HW_g^HW_ga_z(\phi_g)\) 是与 \(\Delta\) 无关的常数。此处按组评估干扰抑制，而非只考察总体 AF。水平方向未执行压缩，因此水平 AF 是平稳的，只依赖 \(\Delta\)。

简记 \(\chi_g(\Delta)\)，定义组内水平 ISL：

$$
\operatorname{ISL}_g=
\frac{\int_{R_s}|\chi_g(\Delta)|^2\,d\Delta}
{|R_s|\,|\chi_g(0)|^2},\tag{11}
$$

其中 \(R_s\) 是表示旁瓣范围的对称区间。代入式（10）可得

$$
\operatorname{ISL}_g=
\frac{s_g^\top V_gs_g}{|R_s|(s_g^\top\mathbf1)^2},\quad
V_g=\int_{R_s}a_y(\Delta,\phi_g)a_y(\Delta,\phi_g)^H\,d\Delta. \tag{12}
$$

\(V_g\) 是对称 Toeplitz 矩阵，可由首列 \(f_g(n)\) 决定：

$$
f_g(n)=\begin{cases}
\displaystyle\frac{2[\sin(n\pi\cos\phi_g\,b)-\sin(n\pi\cos\phi_g\,a)]}
{n\pi\cos\phi_g},&n=1,\ldots,N_y-1,\\
2b-2a,&n=0.
\end{cases}\tag{13}
$$

这里 \(a,b\) 用于确定对称旁瓣积分区域。一个角度对应的旁瓣会干扰其他角度的估计，因而 ISL 衡量相对主瓣能量的旁瓣能量。通常均匀分组的 ISL 较小，随机分组的 ISL 较大。

**2）水平 SRL。** 如果某组天线列只集中在一小段区域内（例如均匀分组），其有效水平孔径会减小。因此还必须考虑能够区分两个接近水平角度的能力。按照 [19]，定义统计分辨极限为

$$
\operatorname{SRL}:=\Delta\quad\text{使得}\quad
\Delta=\sqrt{\operatorname{CRB}_\Delta}. \tag{14}
$$

这里 \(\Delta=\sin\theta_2-\sin\theta_1\)，\(\operatorname{CRB}_\Delta\) 是角度间隔估计的克拉美–罗下界（CRB），即任何无偏估计器均方误差的下界 [25]。当所估角度间隔的标准差等于真实间隔时达到分辨极限，因此 SRL 越小，分辨力越好。

对于第 \(g\) 组，间隔 \(\Delta_g=\sin\theta_{2,g}-\sin\theta_{1,g}\) 的 CRB 为：

$$
\begin{aligned}
\operatorname{CRB}_{\Delta_g}
&=\left(\frac{\partial\Delta_g}{\partial\mu_g}\right)^\top
J_{\mu_g}^{-1}
\frac{\partial\Delta_g}{\partial\mu_g}\\
&=[J_{\mu_g}^{-1}]_{11}+[J_{\mu_g}^{-1}]_{22}
-[J_{\mu_g}^{-1}]_{12}-[J_{\mu_g}^{-1}]_{21}.
\end{aligned}\tag{15}
$$

其中 \(J_{\mu_g}=\mathbb E_y[-\partial^2\ln f(y\mid\mu_g)/(\partial\mu_g\partial\mu_g^\top)]\) 是未知参数 \(\mu_g\) 的 Fisher 信息矩阵（FIM）。令

$$
\beta_g=[\sin\theta_{1,g},\sin\theta_{2,g}]^\top,\quad
\alpha_g=[\alpha_{1,g}^R,\alpha_{2,g}^R,\alpha_{1,g}^I,\alpha_{2,g}^I]^\top,\quad
\mu_g=[\beta_g^\top,\alpha_g^\top]^\top. \tag{16}
$$

上标 \(R,I\) 分别表示复路径增益的实部和虚部。FIM 详细计算见附录 A。一般而言，随机分组在水平方向能够跨越更大的有效孔径，故 SRL 更小、分辨率较高；均匀分组相反。

### B. 问题构建

上述分析揭示了固有折中：随机模式提高分辨率，却增加干扰；均匀模式减少干扰，却牺牲分辨率。由此以最小化各组中最大的 ISL 为目标，同时对各组 SRL 设上界：

$$
\begin{aligned}
\mathcal P:\quad&\min_{\mathcal X}\max_g\{\operatorname{ISL}_g\}\\
\text{s.t.}\quad&\operatorname{SRL}_g\le\rho_g,\ \forall g,\tag{17}\\
&\sum_{g=1}^Gs_g\le\mathbf1,\tag{18}\\
&s_g(n)\in\{0,1\},\ \forall n.\tag{19}
\end{aligned}
$$

其中 \(\mathcal X=\{s_1,\ldots,s_G\}\) 为优化变量集合，\(s_g(n)\) 是 \(s_g\) 的第 \(n\) 个元素，\(\rho_g\) 为组内分辨极限上界。约束（17）保证足够分辨能力，约束（18）限制组间天线列不重叠。为离线计算 SRL，固定噪声方差 \(\sigma_g^2\)、垂直中心角 \(\phi_g\) 及两条路径的增益 \(\alpha_{1,g},\alpha_{2,g}\)。仿真使用 \(\alpha_{1,g}=\alpha_{2,g}=1\)、\(\sigma_g=0.18\)，\(\phi_g\) 取子区间中心。由于可以适当调整 \(\rho_g\)，这些参考参数对最终性能的影响相对有限。实际选择 \(\rho_g\) 时以随机分组的水平 SRL 作为参照，因为随机分组通常提供较大的有效孔径。上述优化是 NP-hard 的整数非线性规划问题（INLP），因此下节采用 EDA 获得高效次优解。

### C. EDA 算法

EDA 是一种进化算法，通过学习并抽取每代最优个体的概率分布进行搜索。对于整数非线性规划问题，这种方法相较传统进化算法具有较强的全局搜索与鲁棒性 [20]。

**随机初始化。** 初始化 \(Q\) 个个体组成的种群 \(\mathcal S^{(0)}=\{S_1^{(0)},\ldots,S_Q^{(0)}\}\)。每个 \(S_q^{(0)}\in\{0,1\}^{N_y\times G}\) 是天线分组矩阵，每行至多有一个非零元素，以满足不重叠约束；并只保留满足 SRL 约束的个体。

**选择最优个体。** 第 \(i\) 轮从前一代中选出 \(T<Q\) 个目标函数值最优者，构成 \(\widetilde{\mathcal S}^{(i)}\)。目标函数即问题 \(\mathcal P\) 中的最大 ISL；越小越优。

**计算概率。** 通过对最优个体取平均，计算阵列第 \(n\) 列被分配给第 \(g\) 组的概率：

$$
p^{(i)}(n,g)=\frac1T\sum_{t=1}^{T}\widetilde S_t^{(i)}(n,g), \tag{20}
$$

所有概率组成 \(P^{(i)}\in\mathbb R^{N_y\times G}\)。

**生成新种群。** 按满足约束（17）–（18）的条件 Bernoulli 分布进行采样：

$$
S_q^{(i)}(n,g)\sim\operatorname{Bern}(p^{(i)}(n,g)). \tag{21}
$$

即元素取 1 的概率为 \(p^{(i)}(n,g)\)。新一代还保留上一代最优个体，以免性能退化。重复直到最大迭代次数 \(I_{\max}\)。文献 [26] 的收敛分析表明，当个体数 \(Q\) 趋向无穷大时，EDA 可收敛到全局最优。由于这里采用离线而不是在线优化，天线分组搜索不增加信道估计的在线计算复杂度。

**算法 1：天线分组模式优化 EDA。** 输入个体数 \(Q\)、精选个体数 \(T\)、最大迭代数 \(I_{\max}\)，各组 ISL 参数 \(V_g,R_s\) 与 SRL 参数 \(\beta_g,\sigma_g,\rho_g\)；输出次优分组矩阵 \(S_{\rm best}^{(I_{\max})}\)。初始化满足约束的 \(Q\) 个二值分组矩阵。每轮根据 ISL 评价个体，选取最优的 \(T\) 个，根据式（20）计算发生概率矩阵，以满足约束的条件 Bernoulli 分布按式（21）产生新个体，组成新种群，并精英保留上一轮最佳个体；达到最大迭代次数后结束。

## V. 面向信道估计的低复杂度 GW-SC-VBI 算法

为进一步利用分组窄波束，本文首先建立角域稀疏信道表示，再将大规模 CS 问题拆解为多个可并行处理的小问题，并基于 [14] 的 SC-VBI 进行稀疏信道恢复与动态角度网格细化。鉴于实际滤波器长度有限、带外抑制不完全，还引入联合处理模块以减少邻近子区间干扰。

### A. 信道的角域稀疏表示

类似于 [27]，使用包含 \(L=L_1L_2\) 个点的二维动态角度网格。第 \(l\) 个网格点为 \((\theta_l,\phi_l)\)，两个动态网格向量为 \(\theta=[\theta_1,\ldots,\theta_L]^\top\) 和 \(\phi=[\phi_1,\ldots,\phi_L]^\top\)，初始化为均匀角度网格。观测模型可转写为动态角度网格上的压缩感知形式：

$$
y=F_aA(\Omega)x+w, \tag{22}
$$

其中 \(\Omega=\{\theta,\phi\}\)，\(A(\Omega)=[a_R(\theta_1,\phi_1),\ldots,a_R(\theta_L,\phi_L)]\in\mathbb C^{N_r\times L}\) 是字典矩阵；\(F_aA(\Omega)\in\mathbb C^{N_{\rm RF}\times L}\) 是感知矩阵；\(x\in\mathbb C^{L\times1}\) 为角域稀疏信道，只有 \(K\ll L\) 个非零元素，分别对应 \(K\) 条路径。\(x_l\) 表示第 \(l\) 个网格邻近路径的复增益。

### B. 使用分组窄波束并行处理

将字典矩阵按角度子区间分为 \(G\) 个列块：

$$
A(\Omega)=[A_1(\Omega_1),\ldots,A_G(\Omega_G)],\qquad
\sum_{g=1}^GL_g=L, \tag{23}
$$

$$
x=(x_1^\top,\ldots,x_G^\top)^\top,\qquad
x_g\in\mathbb C^{L_g\times1}. \tag{24}
$$

\(A_g(\Omega_g)\in\mathbb C^{N_r\times L_g}\) 是位于角度子区间 \(\Phi_g\) 的网格组成的字典子块。令 \(\mathcal R_g\) 为分组波束矩阵 \(F_g=W_g\otimes\operatorname{diag}(s_g)\) 的非零行索引集合，\(R_g=|\mathcal R_g|\)，将这些行提取为 \(\overline F_g=F_g(\mathcal R_g,:)\)，则对应观测满足：

$$
y_g=\overline F_gA(\Omega)x+w_g
=\sum_{i=1}^{G}\overline F_gA_i(\Omega_i)x_i+w_g. \tag{25}
$$

这里 \(y_g=y(\mathcal R_g,:)\)，\(w_g=w(\mathcal R_g,:)\)。由于 \(W_g\) 对带外角度分量具有强衰减作用，近似忽略跨组项 \(\overline F_gA_i(\Omega_i)\)（\(i\ne g\)），得到低维 CS 模型：

$$
y_g\approx\overline F_gA_g(\Omega_g)x_g+w_g
=\Xi_g(\Omega_g)x_g+w_g, \tag{26}
$$

其中 \(\Xi_g(\Omega_g)=\overline F_gA_g(\Omega_g)\in\mathbb C^{R_g\times L_g}\)。各组感知矩阵与稀疏信号的维度均小于原问题，因此可并行求解，大幅降低处理规模。

### C. GW-SC-VBI 算法

**1）整体框架。** 算法由两部分组成：先在各组独立执行 SC-VBI，可并行实现；随后进行联合处理，利用每组输出的主导角度分量进行鲁棒细化。

**2）逐组 SC-VBI。** 与传统压缩感知方法相比，SC-VBI [14] 在动态网格问题中利用低维子空间约束矩阵求逆降低复杂度并加速收敛。每组给定接收信号 \(y_g\) 与感知矩阵 \(\Xi_g(\Omega_g)\)，估计后验 \(p(x_g\mid y_g)\)，并对网格参数 \(\Omega_g\) 求最大似然估计（MLE）。由于各组独立，以下省略下标 \(g\)，记 \(y\in\mathbb C^{R\times1}\)、\(\Xi(\Omega)\in\mathbb C^{R\times L}\)。

联合概率模型的因子图包含环，因此很难直接计算精确的 \(p(x\mid y)\)。SC-VBI 采用交替估计（AE）：**SC-VBI 模块**在 GE 给定角度网格时推断稀疏信号后验；**网格估计（Grid Estimation，GE）模块**在给定信道估计时更新网格参数，如此反复至收敛。

**SC-VBI 模块。** 给定来自 GE 的 \(\widehat\Omega\)，引入三层稀疏先验 \(p(x,\rho,s)\)，用来描述支撑集、精度参数和复稀疏信号。支撑向量 \(s=[s_1,\ldots,s_L]^\top\in\{0,1\}^L\) 表示第 \(l\) 个系数是否活跃；精度向量 \(\rho=[\rho_1,\ldots,\rho_L]^\top\)，其中 \(1/\rho_l\) 为系数方差。联合先验分解为

$$
p(v)=p(s)\,p(\rho\mid s)\,p(x\mid\rho),\quad v=\{x,\rho,s\}. \tag{27}
$$

第一层支撑先验可描述结构稀疏性。对于独立稀疏结构，可写为

$$
p(s)=\prod_{l=1}^L\lambda_l^{s_l}(1-\lambda_l)^{1-s_l}, \tag{28}
$$

其中 \(\lambda_l\) 是稀疏比例。第二层为精度条件先验：

$$
p(\rho\mid s)=\prod_{l=1}^L
[\Gamma(\rho_l;a_l,b_l)]^{s_l}
[\Gamma(\rho_l;\bar a_l,\bar b_l)]^{1-s_l}. \tag{29}
$$

Gamma 超先验中的 \(a,b\) 分别为形状和率参数。活跃时 \(1/\rho_l=\Theta(1)\)，应选择 \(\mathbb E[\rho_l]=a_l/b_l=\Theta(1)\)；不活跃时 \(x_l\) 接近零，要求相应精度均值远大于 1。原 PDF 此式两类超参数的上下标排版较难辨认，故用带横线参数明确区分活跃／不活跃的两组 Gamma 参数；准确下标以原论文第 9 页为准。

第三层为复高斯稀疏信号先验：

$$
p(x\mid\rho)=\prod_{l=1}^Lp(x_l\mid\rho_l), \tag{30}
$$

$$
p(x_l\mid\rho_l)=\mathcal{CN}(x_l;0,\rho_l^{-1}),\qquad l=1,\ldots,L. \tag{31}
$$

基于三层先验与复高斯观测，SC-VBI 在固定网格时近似推断边缘后验，输出 \(x\) 的 MMSE 估计 \(\widehat x\) 和支撑集 \(\widehat{\mathcal S}\)。它使用维度等于当前稀疏水平的子空间约束矩阵求逆，替换原本高维的矩阵求逆，因此复杂度大幅降低。具体步骤与 [14] 相同，原论文因篇幅所限未再展开。

**GE 模块。** 在固定 \(\widehat x\) 与 \(\widehat{\mathcal S}\) 时，通过梯度上升最大化似然来更新动态网格。为降低复杂度，只保留估计支撑集上对应的信号及网格参数，构造：

$$
\mathcal L(\Omega_{\widehat{\mathcal S}})
=-\|\Xi_{\widehat{\mathcal S}}(\Omega_{\widehat{\mathcal S}})
x_{\widehat{\mathcal S}}\|^2+C. \tag{32}
$$

式中 \(C\) 是常数，\(\Xi_{\widehat{\mathcal S}}\in\mathbb C^{R\times|\widehat{\mathcal S}|}\) 为保留支撑列后的子矩阵。原文式（32）未显式写出观测残差中的 \(y\)；译文保持原式，使用时应与原文核对。第 \(i\) 轮更新为：

$$
\Omega_{\widehat{\mathcal S}}^{(i)}
=\Omega_{\widehat{\mathcal S}}^{(i-1)}
+\epsilon^{(i)}
\nabla_{\Omega_{\widehat{\mathcal S}}}\mathcal L(\Omega_{\widehat{\mathcal S}})
\big|_{\Omega_{\widehat{\mathcal S}}=\Omega_{\widehat{\mathcal S}}^{(i-1)}}. \tag{33}
$$

步长 \(\epsilon^{(i)}\) 由 Armijo 准则确定；不属于支撑集的网格参数保持不变。可连续执行 \(B\ge1\) 次梯度更新，以平衡单次复杂度与收敛速度。

**3）联合处理的鲁棒设计。** 各组已经得到近似后验 \(p(x_g\mid y_g)\)、支撑集 \(\widehat{\mathcal S}_g\) 与网格估计 \(\widehat\Omega_g\)。但有限长度的带通滤波器无法完全消除邻组角度分量，导致式（26）近似存在误差。为此，在逐组估计之后，将各组支撑集所保留的网格点合并，重建整体字典：

$$
\widehat A(\Omega)=
[A_{\widehat{\mathcal S}_1}(\widehat\Omega_{\widehat{\mathcal S}_1}),
\ldots,
A_{\widehat{\mathcal S}_G}(\widehat\Omega_{\widehat{\mathcal S}_G})]. \tag{34}
$$

随后构建低维压缩感知问题：

$$
y=F_a\widehat A(\Omega)\widehat x+w,\qquad
\widehat x\in\mathbb C^{S\times1},\
S=\sum_g|\widehat{\mathcal S}_g|. \tag{35}
$$

再用 SC-VBI [14] 对保留的角度分量统一细化，以抑制此前忽略的跨组干扰。

### D. 复杂度分析

直接对原模型式（22）使用 SC-VBI 时，SC-VBI 模块每轮复杂度为 \(\mathcal O(N_{\rm RF}L+S^3)\)，GE 模块为 \(\mathcal O(L^2S)\) [14]。

本文算法分为逐组和联合两个阶段。若各组均匀划分，每组感知矩阵维度为 \((N_{\rm RF}/G)\times(L/G)\)，支撑子空间维度为 \(S/G\)。因此单组每轮的 SC-VBI 复杂度为 \(\mathcal O(N_{\rm RF}L/G^2+S^3/G^3)\)，GE 为 \(\mathcal O(L^2S/G^2)\)。

联合阶段仅需处理合并后的 \(S\) 个支撑元素，感知矩阵维度为 \(N_{\rm RF}\times S\)，另执行 \(D\) 次微调；该阶段每轮 SC-VBI 和 GE 的复杂度分别为 \(\mathcal O(N_{\rm RF}S+S^3)\) 和 \(\mathcal O(S^3)\)。为公平对比，令常规 SC-VBI 运行 \(J_{\max}\) 轮，GW-SC-VBI 运行 \(J_{\max}+D\) 轮，其中前 \(J_{\max}\) 轮逐组估计，后 \(D\) 轮联合细化。

逐组处理时，单组计算量约为传统 SC-VBI 的 \(1/G^2\)。当大规模 MIMO 中稀疏水平 \(S\ll N_{\rm RF},L\) 时，联合处理阶段额外开销不显著，因此 GW-SC-VBI 总体计算复杂度显著降低。

## VI. 仿真

考虑工作于 28 GHz 的 TDD 大规模 MIMO PC-HBF 系统。基站 UPA 具有 \(N_y=64\) 个水平阵元、\(N_z=72\) 个垂直阵元，共 \(N_r=4608\) 根天线。相同阵元数的 UPA 比 ULA 占用更小空间，因此研究场景中近场效应可忽略。每条 RF 链连接 \(M=12\) 根垂直阵元，得到 \(N_{\rm RF}=384\)。信道通过 QuaDRiGa [28] 生成，包含 1 条视距路径与 9 条非视距路径，垂直角度在 \(\Phi=[-\pi/6,0]\) 内。

### A. 验证分组窄波束设计

比较三种基线：**宽波束**（所有压缩向量相同、覆盖全部垂直角域）；**随机波束**（压缩向量元素随机分配）；**未优化分组的本文波束（proposed-without-opt）**（垂直方向采用分组窄波束，水平分组保持均匀）。

**1）不同模拟波束的垂直 AF。** 图 4 对比宽波束、随机波束与本文设计。不同于宽波束，分组窄波束和随机波束的主瓣与旁瓣能量差距更大，说明按组布设窄波束能有效抑制垂直方向的跨角干扰。但随机波束无法针对先验角域对齐，因此损失阵列增益；本文设计由此获得更好的垂直角度估计性能。

**2）EDA 收敛。** 图 5 显示天线分组优化 EDA 在 50 次迭代内收敛，水平 ISL 从初始化约 0.08 降至约 0.04，说明优化分组比随机分组的干扰抑制更强。图 6 展示 \(N_y=64,G=4\) 时的最终分组：不同于每组由相邻天线列组成的均匀分组，优化后各组的天线列分散到全阵列，使有效孔径增大，通常意味着更高分辨力。

**3）水平 AF。** 图 7 比较均匀、随机、优化三种分组。随机与优化分组的主瓣都明显窄于均匀分组，分辨力较强；但优化分组的旁瓣低于随机分组，干扰抑制更好，与图 5 的结果一致。这证明优化实现了分辨力和干扰抑制的较佳折中。

**4）SNR 的影响。** 图 8 在不同 SNR 下比较各类波束的信道估计 NMSE；为保证公平，均使用 SC-VBI 作为估计算法。本文分组窄波束在全部 SNR 下均优于随机波束，因为其与垂直先验角域对齐，保存了阵列增益；水平方向的分组优化进一步改善精度。

**5）路径数的影响。** 图 9 令路径数从 6 增至 22，SNR 固定为 5 dB，所有方法仍用 [14] 的 SC-VBI。随着路径增加，全部方案的估计精度下降，但分组窄波束始终取得比随机波束更低的 NMSE，水平分组优化又提供额外收益，说明波束设计具有鲁棒性。

**图 4–9（原文第 10–11 页）。** 依次展示不同模拟波束的垂直 AF、EDA 的 ISL 收敛曲线、优化后的阵列列分组、三种分组的水平 AF、不同 SNR 及不同路径数下的信道估计 NMSE。[第 10 页图](https://arxiv.org/pdf/2506.01043v1#page=10) · [第 11 页图](https://arxiv.org/pdf/2506.01043v1#page=11)

### B. 验证 GW-SC-VBI 算法

采用三种估计算法基线：**OMP** [29]（计算开销小，但精度有限）；**Turbo-VBI** [30]（鲁棒精确，但高维矩阵求逆带来较高复杂度）；**SC-VBI** [14]（将求逆限制在当前支撑子空间，显著降低复杂度且保持估计性能）。

**1）SNR 的影响。** 图 10 给出四种算法在同一分组窄波束下的 NMSE。三个 VBI 方法在所有 SNR 下明显优于 OMP；GW-SC-VBI 与 Turbo-VBI、SC-VBI 的估计精度接近，却具有更低的计算开销。

**表 I：算法 CPU 耗时（MATLAB，2.5 GHz 笔记本处理器）。**

| 算法 | CPU 时间（秒） |
|---|---:|
| OMP | 2.1 |
| Turbo-VBI | 63 |
| SC-VBI | 12.8 |
| GW-SC-VBI | 4.1 |

Turbo-VBI 由于高维求逆耗时最长。分组处理使 GW-SC-VBI 的耗时约为 SC-VBI 的三分之一、仅约为 OMP 的两倍，却具有显著更高的精度，取得较好的精度—复杂度折中。

**2）路径数的影响。** 图 11 固定 SNR 为 5 dB，路径数从 6 增至 22。所有方法均随路径数增加而退化，这符合密集多径场景更难估计的直觉。GW-SC-VBI 始终具有接近 Turbo-VBI 和 SC-VBI 的精度，并优于 OMP，说明其在明显降低复杂度时仍保持精度及鲁棒性。

**图 10–11（原文第 12 页）。** 分别为 NMSE 随 SNR 和路径数变化曲线。原文图 11 的题注仍写成“versus the SNR”，但图中横坐标实际为路径数。[查看原图](https://arxiv.org/pdf/2506.01043v1#page=12)

## VII. 结论

本文为实际 HBF 大规模 MIMO 系统提出模拟波束设计与配套信道估计算法。垂直方向采用分组窄波束抑制干扰，水平方向通过优化天线分组模式兼顾分辨能力与干扰抑制。利用这一分组结构，GW-SC-VBI 将多组信道估计并行处理以降低计算复杂度。仿真显示，相较基线，所提出设计能以较低开销实现准确、鲁棒的信道估计，具有用于实际大规模 MIMO 网络的潜力。

## 附录 A：\(J_{\mu_g}\) 的推导

下面补充 FIM 的计算过程。第 \(g\) 组针对参数向量 \(\mu_g\) 的 Fisher 信息矩阵为

$$
J_{\mu_g}:=\mathbb E_y\left[
-\frac{\partial^2\ln f(y\mid\mu_g)}
{\partial\mu_g\partial\mu_g^\top}\right]
\in\mathbb C^{6\times6}. \tag{36}
$$

其中 \(\mu_g=[\sin\theta_{1,g},\sin\theta_{2,g},\alpha_{1,g}^R,\alpha_{2,g}^R,\alpha_{1,g}^I,\alpha_{2,g}^I]^\top\)。其他元素的计算方法类似，故以 \(J_{\mu_g}(1,2)\) 为例，其定义为对 \(\sin\theta_{1,g}\)、\(\sin\theta_{2,g}\) 的混合二阶导数取负期望。

考虑复高斯观测模型：

$$
y=\sum_{g=1}^{G}\left[
(W_g\otimes\operatorname{diag}(s_g))
\sum_{k=1}^{2}\alpha_{k,g}a_R(\theta_{k,g},\phi_g)
\right]+w, \tag{37}
$$

其中 \(w\sim\mathcal{CN}(0,\sigma^2I)\)。为简洁，定义信号均值部分为 \(b\)，即式（37）求和项。根据复高斯估计理论 [25]：

$$
J_{\mu_g}(1,2)=\frac{2}{\sigma^2}\Re\left\{
\frac{\partial b^H}{\partial\sin\theta_{1,g}}
\frac{\partial b}{\partial\sin\theta_{2,g}}
\right\}. \tag{38}
$$

两个一阶导数分别为：

$$
\begin{aligned}
\frac{\partial b}{\partial\sin\theta_{1,g}}
&=(W_g\otimes\operatorname{diag}(s_g))\,
\alpha_{1,g}\frac{\partial a_R(\theta_{1,g},\phi_g)}
{\partial\sin\theta_{1,g}},\\
\frac{\partial b}{\partial\sin\theta_{2,g}}
&=(W_g\otimes\operatorname{diag}(s_g))\,
\alpha_{2,g}\frac{\partial a_R(\theta_{2,g},\phi_g)}
{\partial\sin\theta_{2,g}}.
\end{aligned}\tag{39}
$$

沿用式（10）的化简方法，导数乘积为：

$$
\frac{\partial b^H}{\partial\sin\theta_{1,g}}
\frac{\partial b}{\partial\sin\theta_{2,g}}
=\mathcal M\alpha_{1,g}^{H}\alpha_{2,g}
[s_g^\top a_y(\Delta,\phi_g)\odot(-v_{\rm add}^2)], \tag{40}
$$

其中 \(\mathcal M=a_z(\phi_g)^HW_g^HW_ga_z(\phi_g)\)，\(v_{\rm add}\) 的第 \(n\) 个元素为 \(j\pi n\cos\phi_g\)。将式（40）代入式（38），得到：

$$
J_{\mu_g}(1,2)=K_{\rm const}\sum_n n^2\Re\left\{
\alpha_{1,g}^H\alpha_{2,g}\,s_g[n]\,
e^{j\pi n(\sin\theta_{2,g}-\sin\theta_{1,g})}
\right\}, \tag{41}
$$

其中 \(K_{\rm const}=2\pi^2\mathcal M\cos^2\phi_g/\sigma^2\)，它不随两个水平角度的正弦值而改变。\(J_{\mu_g}\) 的其余元素可同理推导，原文因篇幅所限省略。

## 参考文献

以下保留原论文 [1]–[30] 的作者与正式英文题名，以便按编号检索。

[1] Lu et al., “An overview of massive MIMO: Benefits and challenges,” IEEE JSTSP, 2014.  
[2] Venkateswaran and van der Veen, “Analog beamforming in MIMO communications with phase shift networks and online channel estimation,” IEEE TSP, 2010.  
[3] Song, Kühne and Caire, “Fully-/partially-connected hybrid beamforming architectures for mmwave MU-MIMO,” IEEE TWC, 2019.  
[4] Kalachikov and Stenin, “Performance evaluation of the SRS based MIMO channel estimation on 5G NR open source channel model,” IEEE EDM, 2021.  
[5] Sengijpta, “Fundamentals of statistical signal processing: Estimation theory,” 1995.  
[6] Rottenberg et al., “Performance analysis of channel extrapolation in FDD massive MIMO systems,” IEEE TWC, 2020.  
[7] Fan et al., “Angle domain channel estimation in hybrid millimeter wave massive MIMO systems,” IEEE TWC, 2018.  
[8] Vaidyanathan and Chen, “Convolutional beamspace for array signal processing,” ICASSP, 2020.  
[9] Chen and Vaidyanathan, “Channel estimation for mmwave using the convolutional beamspace approach,” IEEE TSP, 2024.  
[10] Liu, Zhu and Lau, “Closed-loop autonomous pilot and compressive CSIT feedback resource adaptation in multi-user FDD massive MIMO systems,” IEEE TSP, 2017.  
[11] Gao et al., “Compressive sensing techniques for next-generation wireless communications,” IEEE Wireless Communications, 2018.  
[12] Alkhateeb et al., “Channel estimation and hybrid precoding for millimeter wave cellular systems,” IEEE JSTSP, 2014.  
[13] Soleimani et al., “Hybrid beamforming and DFT-based channel estimation for millimeter wave MIMO systems,” PIMRC, 2017.  
[14] Liu, Zhou and Xu, “Subspace constrained variational bayesian inference for structured compressive sensing with a dynamic grid,” IEEE TSP, 2025.  
[15] Wan et al., “Robust multi-user channel tracking scheme for 5G new radio,” IEEE TWC, 2023.  
[16] Parkvall et al., “NR: The new 5G radio access technology,” IEEE Communications Standards Magazine, 2017.  
[17] Xiao, Wang and Xiang, “Dimension-deficient channel estimation of hybrid beamforming based on compressive sensing,” IEEE Access, 2019.  
[18] Keskin, Koivunen and Wymeersch, “Limited feedforward waveform design for OFDM dual-functional radar-communications,” IEEE TSP, 2021.  
[19] Smith, “Statistical resolution limits and the complexified crame/spl acute/r-rao bound,” IEEE TSP, 2005.  
[20] Wang et al., “Pilot pattern optimization for sparse channel estimation in OFDM systems,” IEEE Communications Letters, 2015.  
[21] San Antonio, Fuhrmann and Robey, “MIMO radar ambiguity functions,” IEEE JSTSP, 2007.  
[22] Tsao et al., “Ambiguity function for a bistatic radar,” IEEE TAES, 1997.  
[23] Amini and Georgiou, “Avoiding ambiguity in beamspace processing,” IEEE SPL, 2005.  
[24] Guo, Wang and Heng, “Millimeter-wave channel estimation based on 2-D beamspace MUSIC method,” IEEE TWC, 2017.  
[25] Sengijpta, “Fundamentals of statistical signal processing: Estimation theory,” 1995.  
[26] Zhang and Muhlenbein, “On the convergence of a class of estimation of distribution algorithms,” IEEE Transactions on Evolutionary Computation, 2004.  
[27] Wan and Liu, “A two-stage 2D channel extrapolation scheme for TDD 5G NR systems,” IEEE TWC, 2024.  
[28] Jaeckel et al., “Quadriga: A 3-D multi-cell channel model with time evolution for enabling virtual field trials,” IEEE TAP, 2014.  
[29] Tropp and Gilbert, “Signal recovery from random measurements via orthogonal matching pursuit,” IEEE TIT, 2007.  
[30] Liu et al., “Robust recovery of structured sparse signals with uncertain sensing matrix: A Turbo-VBI approach,” IEEE TWC, 2020.

{% endraw %}
