---
layout: page
title: "低复杂度近场信道估计与子载波协作混合波束赋形｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-14373-low-complexity-near-field-channel-estimation-and-subcarrier-cooperativ/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/0cf361caf5265c1b/) · [原文 arXiv](https://arxiv.org/abs/2609.14373) · [全部目录](/papers/catalog/)

# 低复杂度近场信道估计与子载波协作混合波束赋形

**原题：** Low-Complexity Near-Field Channel Estimation and Subcarrier-Cooperative Hybrid Precoding for Wideband XL-MIMO OFDM Systems  
**作者：** Kangda Zhi、Tianyu Yang、Songyan Xue、Fangzhou Wu、Giuseppe Caire（IEEE 会士）  
**单位：** Kangda Zhi 与 Giuseppe Caire 就职于柏林工业大学通信与信息理论组（CommIT，10587 Berlin，Germany）；Tianyu Yang、Songyan Xue 与 Fangzhou Wu 就职于华为技术杜塞尔多夫有限公司（Huawei Technologies Duesseldorf GmbH）。  
**版本：** arXiv:2609.14373v1（eess.SP），2026 年 9 月 13 日，原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VII 节及全部小节（含编号 1)–4) 的子流程）、式 (1)–(76)、算法 1（31 步完整流程）、表 I（逐格转写）、图 1–6 图注、附录 A–B（两个完整推导）、参考文献 [1]–[26]（英文原条目）均按原文结构录入；原文无致谢段。逐句逐式终校未做。

## 摘要

本文同时研究宽带超大规模孔径 MIMO（extremely large aperture MIMO，XL-MIMO）OFDM 系统的精确近场信道获取与可扩展预编码，尤其关注降低复杂度。在所考虑系统中，每个 MIMO 多径分量由五个连续的角度—距离—时延参数刻画，这使常规稀疏恢复方法在计算上不可行，同时还会遭受网格失配。我们提出一种基于序贯稀疏贝叶斯学习（sparse Bayesian learning，SBL）的解耦离格信道估计算法。通过利用 OFDM 近场原子的可分离结构，把五维联合搜索替换为一系列低维操作与活动集推断，避免随各维网格尺寸的乘性增长。基于精确边缘似然引入连续域 Newton 精化，以缓解网格失配。基于估计得到的多径参数，我们进而提出一种面向多用户宽带传输的子载波协作混合预编码框架：建立一个无需大规模矩阵求逆的交替优化算法以最大化用户和速率，并给出一种利用参数化信道结构、可作为有效初始化的非迭代低复杂度设计。仿真结果与多个基准对比验证了估计方法的精度，以及基于估计信道参数的预编码算法的有效性。

**关键词：** 序贯 SBL；信道估计；XL-MIMO；近场；宽带；OFDM。

## I. 引言

面向 6G 的研究把重点放在使用中频段频谱的超大规模 MIMO（XL-MIMO）上，其频谱横跨 sub-6 GHz 与 FR3 频段。得益于大阵列孔径与更宽的频谱资源，宽带 XL-MIMO 可利用前所未有的空间分辨率与波束赋形（beamforming，BF）增益，实现高通信容量与高感知精度。因此，为采用传统正交频分复用（orthogonal frequency division multiplexing，OFDM）的宽带 XL-MIMO 开发信道估计与 BF 算法具有重要意义。

由窄带 MIMO 与传统 MIMO-OFDM 系统演进而来，XL-MIMO OFDM 给算法设计带来两项根本挑战。第一是如何获取准确的近场宽带信道状态信息（channel state information，CSI）[1]。由于阵列孔径很大，XL-MIMO 的信号传播进入近场区，此时常规平面波假设失效，须考虑球面波前 [2]。因此传统 DFT 码本遭受模型失配，每条近场路径的能量会散布到多个角度格上。此外，宽带频率选择性传播进一步引入时延参数，把信道表示扩展到角度—距离—时延域。于是，近场宽带信道估计面临复杂度与开销随信道传播参数高维网格急剧增加的困境。

为求解信道估计问题，已有工作为多输入单输出（multiple-input single-output，MISO）系统设计了角度—距离域字典/码本 [3]。对宽带 OFDM，[4] 建立了频率无关的正交字典以恢复宽带 MISO 信道；[5] 为均匀圆阵提出距离—频率不变码本并给出实验验证；[6] 提出全变差正则化块稀疏贝叶斯学习方法，为配备均匀线阵（uniform linear array，ULA）的基站估计基站侧角度—距离参数。与此同时，数据驱动方法（如去噪扩散模型 [7] 与双注意力辅助深度展开 SBL [8]）分别被用于重建 ULA 与均匀平面阵（uniform planar array，UPA）的宽带信道矩阵。

超出 MISO 之外，近场宽带 MIMO 信道估计更具挑战性，因为多天线用户会进一步加剧信道参数的搜索维度。[9] 已考虑该问题，但其复杂度高得难以承受。一些与可重构智能表面相关的近场宽带 MIMO 信道估计研究 [10, 11] 依赖若干近似，且存在网格失配。受这些局限驱动，我们的目标是为近场 MIMO-OFDM 信道实现**低复杂度且准确的离格估计**。我们利用序贯 SBL 框架 [12, 13]——它维持一个很小的活动集，并在低维子空间中执行推断。通过进一步利用 XL-MIMO-OFDM 信道的可分离因子分解形式，我们提出先做高效粗网格搜索、再做离格精化的方案，避免处理完整五维角度—距离—时延字典所带来的复杂度。

XL-MIMO-OFDM 的第二项挑战是如何实现高容量且计算高效的多用户宽带 BF。事实上，该问题与信道估计阶段强耦合，因为预编码应依据所获取的信道信息定制化——即获取整个信道矩阵，还是获取多径参数。XL-MIMO BF 面临极大的设计变量数以及多用户、多子载波，这对限制计算复杂度与构建可靠初始解提出了关键要求。

对点对点宽带 XL-MIMO，[14] 提出了考虑空间与频率宽带效应的结构化 OFDM 调制方案；多用户全息宽带预编码已在 [15] 中研究；文献 [16, 17] 研究了波束分裂效应下基于真时延的波束聚焦设计，但该效应在中频段并不严重；空间非平稳条件下的近场宽带预编码也有研究 [18]。然而这些工作的预编码设计并未直接以信道估计结果为依据。本文提出一个恰好由估计得到的宽带 MIMO-OFDM 信道使能、且复杂度低的宽带混合 BF 方案。特别地，我们研究一种称为子载波协作传输（subcarrier-cooperative transmission）[19] 的有趣方案：它跨子载波联合处理信号，从而提供额外的跨子载波自由度（degree of freedom，DoF）以抑制干扰。因此，我们的方案有潜力充分释放宽带 XL-MIMO 的能力，以支撑 6G 应用所设想的极高数据速率。

本文低复杂度 XL-MIMO-OFDM 估计与传输框架的主要贡献概括如下。

- 我们研究一个极具挑战性的场景：UPA 型 XL-MIMO 在 OFDM 宽带系统中与多天线用户通信。第一项任务是低复杂度地准确估计五维角度—距离—时延参数化近场信道；第二项任务是在天线数量大、用户多、子载波多的条件下，以低预编码复杂度基于可用 CSI 实现高速率通信。
- 对近场宽带信道估计，我们提出解耦离格序贯 SBL 方法。利用近场 OFDM 原子的可分离结构，把高维搜索分解为一系列低维操作，避免关于五维网格的乘性复杂度；进而引入基于边缘似然的连续域 Newton 精化，以消除网格失配并提高分辨率。值得注意的是，我们表明该序贯 SBL 方法的全部后验更新都可用 Schur 补实现，完全消除显式矩阵求逆。除本文的信道估计应用之外，我们强调该方法为具有可分离原子结构的多维连续稀疏估计提供了一个可扩展的序贯贝叶斯框架。
- 对宽带多用户下行（downlink，DL）数据传输，我们基于估计的信道参数提出子载波协作传输方案，具有额外的跨子载波 DoF 用于干扰抑制。为最大化用户和速率，首先建立一个无需大规模矩阵求逆的交替优化框架用于子载波协作混合预编码；随后基于估计的多径参数提出一种无需交替迭代的低复杂度次优方案。
- 仿真验证了信道估计算法相对于基准与 Cramér–Rao 下界（CRLB）的精度，并在估计 CSI 下验证了所提子载波协作混合预编码的有效性与收益。

## II. 系统模型

如图 1 所示，我们考虑一个 XL-MIMO OFDM 通信系统：基站采用含 \(M_{\rm bs}=M_hM_v\)（\(M_h\) 个水平、\(M_v\) 个垂直）天线的 UPA，一个通用用户设备（user equipment，UE）配备 \(M_{\rm ue}\) 根 ULA 天线。受硬件复杂度限制，UE 采用单个射频链、基站采用子连接混合架构：\(M_{\rm bs}\) 个天线阵元连接 \(M_{\rm rf}\) 个射频（radio-frequency，RF）链，\(M_{\rm rf}\ll M_{\rm bs}\)，且 \(\beta\triangleq M_{\rm bs}/M_{\rm rf}\) 为每个 RF 链连接的天线数。宽带系统带宽被划分为 \(N\) 个子载波，子载波间隔 \(\Delta f\)。

**图 1（原文 Fig. 1）：** 所考虑 XL-MIMO OFDM 近场系统示意图。

### A. 信道模型

我们关注 sub-6 GHz 或 FR3 低频段系统，其小区尺寸仍相对较大、LoS 概率因此较低。故考虑含 \(L\) 条 NLoS 路径的多径信道。此外，由于基站天线孔径很大，散射体落入基站阵列的 Fresnel 区，即需要考虑基站与散射体之间的近场信道；从 UE 侧看，由于 UE 阵列孔径小，散射体可假定位于远场。于是，子载波 \(n\) 上的信道为

$$
\mathbf H[n]=\sum_{l=1}^{L}\alpha_lg_n(\tau_l)\mathbf a(\theta_l^a,\theta_l^e,r_l)\mathbf b^H(\psi_l)\in\mathbb C^{M_{\rm bs}\times M_{\rm ue}},\tag{1}
$$

其中 \(\alpha_l\)、\(\tau_l\)、\(\psi_l\)、\((\theta_l^a,\theta_l^e,r_l)\) 分别表示第 \(l\) 条路径的复增益、传播时延、UE 角度与基站侧参数（方位角、俯仰角、距离）。\(g_n(\tau_l)=\exp(-\mathrm{j}2\pi(n-1)\Delta f\tau_l)\) 是路径时延 \(\tau_l\) 在子载波 \(n\) 上引起的相移。\(\mathbf b(\psi_l)\in\mathbb C^{M_{\rm ue}}\) 为 ULA 导向矢量，其第 \(m\) 个元素在半波长天线间距下为 \([\mathbf b(\psi_l)]_m=\exp(-\mathrm{j}\pi(m-1)\sin(\psi_l))\)。\(\mathbf a(\theta_l^a,\theta_l^e,r_l)\in\mathbb C^{M_{\rm bs}}\) 为近场球面波导向矢量，其元素为

$$
[\mathbf a(\theta_l^a,\theta_l^e,r_l)]_m=\exp\left(-\mathrm{j}k_0\|\mathbf p_m^{\rm bs}-\mathbf p_l^{\rm sc}\|\right),\tag{2}
$$

其中 \(k_0=\frac{2\pi}{\lambda_c}\)，\(\lambda_c\) 为载波波长，\(\mathbf p_m^{\rm bs}\) 与 \(\mathbf p_l^{\rm sc}\) 分别为基站第 \(m\) 根天线与第 \(l\) 个散射体的位置。<sup>1</sup>（脚注 1：由于所考虑频段内带宽与载频之比很低，我们不考虑波束斜视效应。）

### B. 发送与接收导频信号

假设 UE 在 \(T\) 个时隙上发送导频信号。时刻 \(t\) 的导频信号为 \(\sqrt{P_{\rm ue}}\mathbf f_t\)，其中 \(P_{\rm ue}\) 为 UE 发射功率，\(\mathbf f_t\in\mathbb C^{M_{\rm ue}}\) 为模拟预编码器，满足恒模约束 \(|[\mathbf f_t]_i|=1/\sqrt{M_{\rm ue}}\)，\(i\in[M_{\rm ue}]\)。<sup>2</sup>（脚注 2：本文中，对正整数 \(N\)，定义 \([N]\triangleq\{1,\ldots,N\}\)。）基站在时刻 \(t\) 施加模拟合并器 \(\mathbf W_t\in\mathbb C^{M_{\rm bs}\times M_{\rm rf}}\)。由于采用子连接结构，模拟合并器为块对角矩阵，即 \(\mathbf W_t=\operatorname{blkdiag}(\mathbf w_{1,t},\ldots,\mathbf w_{M_{\rm rf},t})\)，其中 \(\mathbf w_{m,t}\in\mathbb C^{\beta}\) 为第 \(m\) 个 RF 链在时刻 \(t\) 的模拟合并向量，满足恒模约束 \(|[\mathbf w_{m,t}]_i|=1/\sqrt{\beta}\)、\(i\in[\beta]\)，且 \(\mathbf W_t^H\mathbf W_t=\mathbf I_{M_{\rm rf}}\)。于是，基站在时刻 \(t\)、子载波 \(n\) 上接收到的导频信号为

$$
\mathbf y_t[n]=\sqrt{P}\mathbf W_t^H\mathbf H[n]\mathbf f_t+\mathbf W_t^H\mathbf z_t[n]\in\mathbb C^{M_{\rm rf}},\tag{3}
$$

其中 \(\mathbf z_t\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{M_{\rm bs}})\) 为加性白高斯噪声（additive white Gaussian noise，AWGN），上行（uplink，UL）噪声功率为 \(\sigma^2\)。

### C. 全信道估计的挑战

已知基站处的导频观测与导频 \(\{\mathbf y_t[n],\mathbf W_t,\mathbf f_t\mid t\in[T],n\in[N]\}\)，任务是估计完整宽带信道向量 \(\mathbf h=\operatorname{vec}(\mathbf H)\in\mathbb C^{\bar M}\)，其中 \(\mathbf H\in\mathbb C^{M_{\rm bs}\times M_{\rm ue}\times N}\) 是三维（3-D）阵列 \(\{\mathbf H[n]\mid n\in[N]\}\)，\(\bar M\triangleq M_{\rm bs}M_{\rm ue}N\)。尽管完整宽带信道维度 \(\bar M\) 极大，它完全由远少得多的多径参数决定，因此估计多径参数是合理的。具体地，把所有观测汇集为三维阵列 \(\mathcal Y\in\mathbb C^{M_{\rm rf}\times N\times T}\) 并向量化为 \(\mathbf y=\operatorname{vec}(\mathcal Y)\in\mathbb C^{M}\)（\(M\triangleq M_{\rm rf}NT\)），接收信号可改写为

$$
\mathbf y=\sum_{l=1}^{L}\alpha_l\boldsymbol\phi(\boldsymbol\xi_l)+\tilde{\mathbf z}=\tilde{\mathbf\Phi}\boldsymbol\alpha+\tilde{\mathbf z}\in\mathbb C^{M},\tag{4}
$$

其中 \(\boldsymbol\xi_l\triangleq[\tau_l,\psi_l,\theta_l^a,\theta_l^e,r_l]^T\in\mathbb R^5\) 包含每条路径的 5 维连续参数，\(\boldsymbol\phi(\boldsymbol\xi_l)\in\mathbb C^{M}\) 为对应参数 \(\boldsymbol\xi_l\) 的原子，\(\tilde{\mathbf\Phi}\triangleq[\boldsymbol\phi(\boldsymbol\xi_1),\ldots,\boldsymbol\phi(\boldsymbol\xi_L)]\) 为全部 \(L\) 个原子构成的矩阵，\(\boldsymbol\alpha\triangleq[\alpha_1,\ldots,\alpha_L]\)，\(\tilde{\mathbf z}\sim\mathcal{CN}(\mathbf 0,N_0\mathbf I_M)\) 为相应有效 UL 噪声，\(N_0=\sigma^2/P_{\rm ue}\)。

给定式 (4) 的标准线性形式，常见做法是把参数空间离散为有限网格点集并应用压缩感知方法，如正交匹配追踪（Orthogonal Matching Pursuit，OMP）与 SBL。然而直接应用此类方法需要在 5 维连续参数空间 \((\tau,\psi,\theta^a,\theta^e,r)\) 上构造联合字典，导致难以承受的计算复杂度与严重的内存溢出。具体地，把参数空间离散为 \(G=G_\tau G_\psi G_{\theta^a}G_{\theta^e}G_r\) 个联合网格点（\(G_\tau,G_\psi,G_{\theta^a},G_{\theta^e},G_r\) 分别为各维网格尺寸），我们构造字典矩阵 \(\mathbf\Phi\triangleq[\boldsymbol\phi_1,\ldots,\boldsymbol\phi_G]\in\mathbb C^{M\times G}\)，其中 \(\boldsymbol\phi_i\triangleq\boldsymbol\phi(\boldsymbol\xi_i^g)\)、\(i\in[G]\) 为第 \(i\) 个原子，\(\boldsymbol\xi_i^g\) 为第 \(i\) 个网格点（含 5 维参数）的原子位置。于是式 (4) 的接收信号可近似为

$$
\mathbf y\approx\mathbf\Phi\mathbf x+\tilde{\mathbf z},\tag{5}
$$

其中 \(\mathbf x\in\mathbb C^G\) 为 \(G\) 个网格点的未知向量。

## III. 在格序贯 SBL 框架

为规避维数灾难并保持良好估计性能，我们采用序贯 SBL 方法，它避免了经典基于期望最大化（Expectation–Maximization，EM）的 SBL 算法 [20] 中对所有原子进行的高强度全局运算。序贯 SBL 搜索单个最具信息量的原子；后文将表明，利用 OFDM MIMO 信道的可分离结构，该搜索可分解为一系列廉价的低维操作。

### A. 序贯 SBL

SBL 把 \(\mathbf x\) 中的元素视为随机独立变量，服从均值为零、各分量不相关的参数化高斯先验，即

$$
\mathbf x\sim\mathcal{CN}(\mathbf 0,\mathbf\Gamma),\tag{6}
$$

其中 \(\mathbf\Gamma=\operatorname{diag}(\boldsymbol\gamma)=\operatorname{diag}([\gamma_1,\ldots,\gamma_G])\)，\(\gamma_i\ge0\) 为第 \(i\) 个网格点的超参数。SBL 遵循 Type-II 估计框架，在超参数 \(\boldsymbol\gamma\) 空间中通过最小化负边缘对数似然函数求解：<sup>3</sup>（脚注 3：本工作中假设基站已知噪声功率 \(\sigma^2\)；不过所提方法可容易地扩展到联合估计信道参数与噪声功率。）

$$
\min_{\boldsymbol\gamma}\ \mathcal L(\boldsymbol\gamma)\triangleq-\log p(\mathbf y|\boldsymbol\gamma)=\log\det(\mathbf C)+\mathbf y^H\mathbf C^{-1}\mathbf y,\tag{7}
$$

其中 \(\mathbf C=\mathbf\Phi\mathbf\Gamma\mathbf\Phi^H+N_0\mathbf I_M\) 为 \(\mathbf y\) 的协方差矩阵。一旦通过求解 (7) 得到 \(\boldsymbol\gamma\)，目标变量 \(\mathbf x\) 便通过给定观测的后验参数分布 \(p(\mathbf x|\mathbf y,\boldsymbol\gamma)\) 的后验均值估计，该分布可由 Bayes 法则结合似然与先验得到。所得后验分布为 \(p(\mathbf x|\mathbf y,\boldsymbol\gamma)\sim\mathcal{CN}(\boldsymbol\mu,\mathbf\Sigma)\)，其后验协方差与均值分别为 [12]

$$
\mathbf\Sigma=(N_0^{-1}\mathbf\Phi^H\mathbf\Phi+\mathbf\Gamma^{-1})^{-1},\qquad \boldsymbol\mu=N_0^{-1}\mathbf\Sigma\mathbf\Phi^H\mathbf y.\tag{8}
$$

问题 (7) 的代价函数非凸，可迭代求解。一种常用方法是 EM 方法，但每次迭代都需要维度为网格尺寸的重矩阵求逆，在大网格尺寸下导致难以承受的复杂度。与 SBL-EM 不同，序贯 SBL 每次向活动网格点集中加入一个网格点，使式 (7) 的代价函数最大程度下降，因而只需维度为活动集大小的轻量矩阵求逆。具体地，给定基数为 \(S\triangleq|\mathcal S|<G\) 的活动索引集 \(\mathcal S\subset[G]\)，定义 \(\boldsymbol\gamma_{\mathcal S}\in\mathbb R^S\)、\(\mathbf\Phi_{\mathcal S}\in\mathbb C^{M\times S}\)、\(\mathbf C_{\mathcal S}\triangleq\mathbf\Phi_{\mathcal S}\operatorname{diag}(\boldsymbol\gamma_{\mathcal S})\mathbf\Phi_{\mathcal S}^H+N_0\mathbf I_M\) 分别为仅限活动集 \(i\in\mathcal S\) 的网格点时的超参数向量、感知矩阵与协方差矩阵。

现在评估加入一个不在活动集中的网格点 \(i\in[G]\setminus\mathcal S\) 的贡献。思路是选择使证据提升最大的新网格点。假使 \(\{\gamma_i|i\notin\mathcal S\}\) 均初始化为零，则 [13] 与 [12, eq. (18)] 表明，加入新网格点 \(i\notin\mathcal S\) 使代价函数 (7) 的变化为

$$
\Delta\mathcal L(\gamma_i)\triangleq\mathcal L(\boldsymbol\gamma_{\mathcal S\cup\{i\}})-\mathcal L(\boldsymbol\gamma_{\mathcal S})\tag{9}
$$

$$
=\log(1+\gamma_is_i)-\frac{\gamma_i|q_i|^2}{1+\gamma_is_i},\tag{10}
$$

其中 \(s_i\triangleq\boldsymbol\phi_i^H\mathbf C_{\mathcal S}^{-1}\boldsymbol\phi_i\ge0\) 与 \(q_i\triangleq\boldsymbol\phi_i^H\mathbf C_{\mathcal S}^{-1}\mathbf y\in\mathbb C\) 分别称为**稀疏因子**与**质量因子**。为选择新网格点，需要找 \(i\notin\mathcal S\) 与相应 \(\gamma_i\) 以最小化变化 \(\Delta\mathcal L(\gamma_i)\)，即<sup>4</sup>（脚注 4：注意我们的代价函数是负对数似然，故希望最小化负的变化。）

$$
i=\arg\min_{i\notin\mathcal S}\ \min_{\gamma_i\ge0}\Delta\mathcal L(\gamma_i).\tag{11}
$$

把导数置零（即令 \(\Delta\mathcal L'(\gamma_i)=0\)）可得最优 \(\gamma_i\)：

$$
\gamma_i^\star=\max\left(\frac{|q_i|^2-s_i}{s_i^2},0\right).\tag{12}
$$

把 (12) 代回 (10)，得到非零变化

$$
\Delta\mathcal L(\gamma_i^\star)=\log(Q_i)-Q_i+1,\quad\text{当 }Q_i>1,\tag{13}
$$

其中 \(Q_i\triangleq\frac{|q_i|^2}{s_i}\)。由于要最小化 (13)，且 (13) 在 \(Q_i\ge1\) 时取负并严格递减，最优网格点是最大化 \(Q_i\) 者，即

$$
i^\star=\arg\max_{i\notin\mathcal S}\ Q_i.\tag{14}
$$

若最优 \(Q_i\) 满足 \(Q_{i^\star}\le1\)，则 \(\gamma_{i^\star}^\star=0\)，表明不应再向活动集加入新网格点。

### B. 面向本文估计问题的序贯 SBL 分析

序贯 SBL 的主要计算代价在于每次迭代求解 (14)，即为全部候选评估 \(q_i\) 与 \(s_i\)。在非常大的网格尺寸下，该评估可能极其昂贵。为解决此问题，我们首先把 \(q_i\) 与 \(s_i\) 改写为计算高效的形式。对 \(\mathbf C_{\mathcal S}^{-1}\) 使用矩阵求逆引理，有

$$
\mathbf C_{\mathcal S}^{-1}=N_0^{-1}\mathbf I-N_0^{-2}\mathbf\Phi_{\mathcal S}(N_0^{-1}\mathbf\Phi_{\mathcal S}^H\mathbf\Phi_{\mathcal S}+\mathbf\Gamma_{\mathcal S}^{-1})^{-1}\mathbf\Phi_{\mathcal S}^H,\tag{15}
$$

$$
=N_0^{-1}\mathbf I-N_0^{-2}\mathbf\Phi_{\mathcal S}\mathbf\Sigma_{\mathcal S}\mathbf\Phi_{\mathcal S}^H.\tag{16}
$$

利用 (16)，可计算 \(q_i\) 与 \(s_i\) 为

$$
q_i=N_0^{-1}\boldsymbol\phi_i^H\mathbf y-N_0^{-2}\boldsymbol\phi_i^H\mathbf\Phi_{\mathcal S}\mathbf\Sigma_{\mathcal S}\mathbf\Phi_{\mathcal S}^H\mathbf y,\tag{17}
$$

$$
=N_0^{-1}\boldsymbol\phi_i^H(\mathbf y-\mathbf\Phi_{\mathcal S}\boldsymbol\mu_{\mathcal S}),\tag{18}
$$

$$
=N_0^{-1}\boldsymbol\phi_i^H\mathbf r_{\mathcal S},\tag{19}
$$

$$
s_i=N_0^{-1}\|\boldsymbol\phi_i\|^2-N_0^{-2}\boldsymbol\phi_i^H\mathbf\Phi_{\mathcal S}\mathbf\Sigma_{\mathcal S}\mathbf\Phi_{\mathcal S}^H\boldsymbol\phi_i,\tag{20}
$$

其中定义 \(\mathbf\Sigma_{\mathcal S}\triangleq(N_0^{-1}\mathbf\Phi_{\mathcal S}^H\mathbf\Phi_{\mathcal S}+\mathbf\Gamma_{\mathcal S}^{-1})^{-1}\)、\(\boldsymbol\mu_{\mathcal S}\triangleq N_0^{-1}\mathbf\Sigma_{\mathcal S}\mathbf\Phi_{\mathcal S}^H\mathbf y\) 分别为 (8) 中在移除网格点 \(i\notin\mathcal S\) 贡献后的后验协方差 \(\mathbf\Sigma\) 与均值 \(\boldsymbol\mu\)，\(\mathbf r_{\mathcal S}\triangleq\mathbf y-\mathbf\Phi_{\mathcal S}\boldsymbol\mu_{\mathcal S}\) 为基于 \(\mathcal S\) 中活动网格点的贝叶斯残差。

下面分析质量因子与稀疏因子的作用，以指导算法设计。

- **关于 \(q(\boldsymbol\xi)\) 的分析：** 由 (19) 可见质量因子是候选原子 \(\boldsymbol\phi(\boldsymbol\xi)\) 与贝叶斯残差 \(\mathbf r_{\mathcal S}\) 的内积，其模值度量候选原子与残差之间的正交性。因此 \(|q(\boldsymbol\xi)|^2\) 越大的候选与残差的匹配越好。
- **关于 \(s(\boldsymbol\xi)\) 的分析：** 由 (20) 可见稀疏因子有两项。第一项是候选原子的总能量，在随机恒模导频 \(\{\mathbf W_t,\mathbf f_t\}\) 下各候选的期望相同；第二项是投影到活动集子空间、以 \(\mathbf\Sigma_{\mathcal S}\) 加权的能量。因此 \(s(\boldsymbol\xi)\) 度量候选的有效能量，起到惩罚作用，避免选择与当前活动集高度相关的候选。

进一步，从计算角度看，原子 \(\boldsymbol\phi_i\) 具有可分离结构，可把内积分解为一系列低维操作，从而以低成本计算 \(q_i\)（见第 IV-A 节）。然而处理 \(s_i\) 会因 (20) 中的二次型而显著增加搜索代价。基于上述对 \(s_i\) 的分析，我们提出采用不同网格点互相关性低的粗网格来避免计算 \(s_i\)，仅依据 \(q_i\) 搜索新网格点。为缓解粗网格带来的失配误差并提升估计性能，随后施加局部离格 Newton 精化。在离格阶段只需评估单个候选，因此可以负担同时使用 \(q(\boldsymbol\xi)\) 与 \(s(\boldsymbol\xi)\)，使最终接受准则建立在精确证据准则上，保证每次加入都严格提升边缘似然。因此，所提算法保留了序贯 SBL 的单调收敛保证。

## IV. 基于解耦离格序贯 SBL 的信道估计

本节描述所提解耦离格序贯 SBL 信道估计方案。每个主迭代中，我们在固定粗网格上仅依据质量因子 \(q_i\) 做在格搜索；被选中的候选在连续域中经 Newton 步精化，并在提升边缘似然时加入活动原子集。由于粗网格的某个特定网格点可能作为多条路径 Newton 精化的初始点，每次在格搜索始终在同一完整网格上进行。据此，我们重新定义活动原子集为 \(\bar{\mathcal S}=\{(\boldsymbol\xi_i^{\rm act},\gamma_i^{\rm act})\}_{i=1}^{\bar S}\)，存储 \(\bar S\) 个已精化离格原子的位置与超参数，而不再像第 III 节全在格框架那样存储网格点索引。<sup>5</sup>（脚注 5：注意我们用 \(i\) 同时索引 \(\bar{\mathcal S}\) 中的活动原子与 \([G]\) 中的网格点。）于是，基于活动集计算相应量，如 \(\mathbf C_{\bar{\mathcal S}},\mathbf\Phi_{\bar{\mathcal S}},\mathbf r_{\bar{\mathcal S}}\)，只计入 \(\bar{\mathcal S}\) 中原子。

### A. 解耦粗网格在格搜索

如第 III-B 节所述，我们用 \(|q_i|^2\) 代替 (14) 中的 \(Q_i\) 寻找最佳候选网格点。概念上，粗搜索旨在寻找

$$
\hat i=\arg\max_{i\in[G]}\ |q_i|^2,\tag{21}
$$

再次注意搜索始终在完整网格上进行。尽管基于粗网格，对宽带 XL-MIMO 信道而言联合网格尺寸 \(G\) 仍过大，无法全局搜索全部 5 维参数。我们利用 \(q_i\) 的嵌套结构，分别对每个参数组获得初始估计，再通过交替最大化找到联合最优估计，作为连续域精化的起点。

首先展示原子 \(\boldsymbol\phi(\boldsymbol\xi)\) 的可分离结构。令 \(\mathcal A\in\mathbb C^{M_{\rm rf}\times N\times T}\) 为 \(\boldsymbol\phi(\boldsymbol\xi)\) 的三维阵列展开，即 \(\boldsymbol\phi(\boldsymbol\xi)=\operatorname{vec}(\mathcal A)\)。注意单条路径下 \(\mathcal A\) 的元素呈因子分解形式<sup>6</sup>（脚注 6：本文用花体大写字母表示三维阵列，用三个下标表示各维索引。）：

$$
\mathcal A_{m,n,t}=g_n(\tau)\underbrace{[\mathbf W_t^H\mathbf a(\theta^a,\theta^e,r)]_m}_{\triangleq v_{m,t}(\theta^a,\theta^e,r)}\underbrace{\mathbf b^H(\psi)\mathbf f_t}_{\triangleq u_t(\psi)},\tag{22}
$$

其中三个因子各依赖 5 维参数的一个**互不相交**子集。利用 (22)，我们展示 \(q_i\) 的嵌套结构。令 \(\mathcal R\in\mathbb C^{M_{\rm rf}\times N\times T}\) 为由贝叶斯残差 \(\mathbf r_{\mathcal S}\) 重塑的三维残差阵列，即 \(\mathbf r_{\mathcal S}=\operatorname{vec}(\mathcal R)\)。内积 \(\boldsymbol\phi_i^H\mathbf r_{\mathcal S}\) 可分解为嵌套部分和：

$$
\boldsymbol\phi_i^H\mathbf r_{\mathcal S}=\sum_{t=1}^{T}u_t^*(\psi_i)\sum_{m=1}^{M_{\rm rf}}v_{m,t}^*(\theta_i^a,\theta_i^e,r_i)\underbrace{\sum_{n=1}^{N}g_n^*(\tau_i)\mathcal R_{m,n,t}}_{\triangleq\mathcal Z_{m,\ell,t}^{\tau}},\tag{23}
$$

其中 \(\mathcal Z^\tau\in\mathbb C^{M_{\rm rf}\times G_\tau\times T}\)，每一层求和消去一个索引维、且只涉及相应参数。因此我们可以设计多步搜索流程，在不必评估全部 \(G\) 个联合网格点的情况下识别好的候选网格点：按 (23) 的三个因子从内层和到外层和依次处理，每一步消去一个索引维并收窄搜索空间。

**1）时延变换（消去子载波索引 \(n\)）。** (23) 的最内层和只涉及时延参数 \(\tau\) 与子载波索引 \(n\)。在考虑任何基站或 UE 角度参数之前，我们可以对全部 \(G_\tau\) 个时延候选评估该和。具体地，对每个时隙 \(t\) 计算矩阵乘积<sup>7</sup>（脚注 7：采用 MATLAB 惯例，用冒号表示给定维度的全部索引。）：

$$
\mathcal Z_{:,:,t}^{\tau}=\mathcal R_{:,:,t}\mathbf E\in\mathbb C^{M_{\rm rf}\times G_\tau},\tag{24}
$$

其中 \([\mathbf E]_{n,\ell}=e^{\mathrm{j}2\pi(n-1)\Delta f\tau_\ell}\) 是在时延网格 \(\{\tau_\ell\}_{\ell=1}^{G_\tau}\) 上评估的 \(N\times G_\tau\) 时延变换矩阵。该步之后，子载波索引 \(n\) 已被吸收。代价为 \(\mathcal O(MG_\tau)\)，与基站和 UE 网格尺寸无关。

**2）基站近场码本投影与搜索（消去 RF 索引 \(m\)）。** 现在处理 (23) 中剩余的中间和 \(\sum_m v_{m,t}^*\mathcal Z_{m,\ell,t}^\tau\)。定义组合器后基站导向矢量 \(\mathbf v_t(\theta_\kappa^a,\theta_\kappa^e,r_\kappa)\triangleq\mathbf W_t^H\mathbf a(\theta_\kappa^a,\theta_\kappa^e,r_\kappa)\)，其中 \(\kappa\) 为 \(G_{\rm bs}\triangleq G_{\theta^a}G_{\theta^e}G_r\) 个基站角度—距离网格点的索引，\(t\) 为时隙。则第 \(\kappa\) 个基站原子与（时延 \(\ell\)、时隙 \(t\) 的）时延变换残差的内积为

$$
c_{\ell,t}^{\rm bs}(\kappa)=\mathbf v_t^H(\theta_\kappa^a,\theta_\kappa^e,r_\kappa)\mathcal Z_{:,\ell,t}^{\tau},\tag{25}
$$

其中在 \(c_{\ell,t}^{\rm bs}(\kappa)\) 中我们略微滥用记号，直接以网格点索引 \(\kappa\) 作为自变量以简化表达。

此时面临两个困难。第一，对所有 \(G_{\rm bs}\times G_\tau\) 个对 \((\kappa,\ell)\) 评估 (25) 对大规模阵列而言代价过高。第二，(23) 的最外层和涉及仍然未知的 UE 角度 \(\psi\)，因此我们无法直接计算相干得分 \(\left|\sum_t u_t^*(\psi)c_{\ell,t}^{\rm bs}(\kappa\in[G_{\rm bs}])\right|\) 而不搜索 \(\psi\)，这又会引入不希望的乘性代价。我们同时解决这两个困难。对第一个困难，观察到 \(G_{\rm bs}\) 个网格点张成 \(G_{\rm ang}\triangleq G_{\theta^a}G_{\theta^e}\) 个角度方向，每个方向有 \(G_r\) 个距离样本；大多数角度方向不含散射体，故其 \(G_r\) 个距离候选是被浪费的评估。因此我们做**角度预筛选**：对每个角度方向 \(j\in[G_{\rm ang}]\)，选择距离最大、最能逼近远场响应的单个代表原子，仅用该代表原子对 \(\mathcal Z^\tau\) 评估。对第二个困难，我们通过跨时隙的非相干组合消除对未知 \(\psi\) 的依赖：具体地，由于 \(c_{\ell,t}^{\rm bs}(\kappa)\) 含有未知 UE 因子 \(u_t(\psi)\) 作为公共标量乘子，取平方模 \(|c_{\ell,t}^{\rm bs}(\kappa)|^2\) 即去除其相位；随后对所有时隙求平方模之和，无论 \(\psi\) 取何值都累积信号能量，从而使基站角度方向的排序对未知 UE 角度 \(\psi\) 不敏感——这就为"先搜索基站参数、再搜索 UE 角度"提供了依据。非相干角度得分为

$$
c_j^{\rm ang}=\max_{\ell}\sum_{t=1}^{T}\left|\mathbf v_t^H(\kappa_j^{\rm far})\mathcal Z_{:,\ell,t}^{\tau}\right|^2,\qquad j\in[G_{\rm ang}],\tag{26}
$$

其中 \(\kappa_j^{\rm far}\) 为方向 \(j\) 的代表原子索引。我们保留 \(c_j^{\rm ang}\) 最大的前 \(J\) 个方向。仅对这 \(J\) 个方向，进一步用全部近场网格点评估全部 \(G_r\) 个距离候选，并选出最佳（基站角度—距离，时延）对 \((\hat\kappa,\hat\ell)\)：

$$
(\hat\kappa,\hat\ell)=\arg\max_{\kappa\in\mathbb I_J,\ \ell\in[G_\tau]}\sum_{t=1}^{T}\left|\mathbf v_t^H(\kappa)\mathcal Z_{:,\ell,t}^{\tau}\right|^2,\tag{27}
$$

其中 \(\mathbb I_J\) 为属于前 \(J\) 个方向的全部网格点索引集合，\(|\mathbb I_J|=JG_r\)。该步总代价为 \(\mathcal O((G_{\rm ang}+JG_r)M_{\rm rf}G_\tau T)\)，第一项对应 (26) 的角度预筛选，第二项对应 (27) 中前 \(J\) 个方向内的距离与时延搜索。

**3）UE 角度搜索（消去时隙索引 \(t\)）。** 给定 \((\hat\kappa,\hat\ell)\)，我们求剩余未知的 UE 角度 \(\psi\)。由于基站与时延维已确定，现在可评估完整相干得分。最优 UE 角度索引由最大化相干得分得到：

$$
\hat\zeta=\arg\max_{\zeta\in[G_\psi]}\left|\sum_{t=1}^{T}u_t^*(\psi_\zeta)\mathbf v_t^H(\hat\kappa)\mathcal Z_{:,\hat\ell,t}^{\tau}\right|^2,\tag{28}
$$

这相当于一次矩阵—向量乘积，代价 \(\mathcal O(G_\psi T)\) 可忽略。

**4）交替在格精化。** 序贯初始化可能并非联合最优，因为角度预筛选忽略了距离，非相干组合又丢弃了 UE 因子的相位信息。我们通过在粗网格上运行若干轮循环坐标最大化来改进：每轮更新一个参数组、保持其余不变：

$$
\hat\ell\leftarrow\arg\max_{\ell\in[G_\tau]}\left|\sum_t u_t^*(\hat\zeta)\mathbf v_t^H(\hat\kappa)\mathcal Z_{:,\ell,t}^{\tau}\right|^2,\tag{29a}
$$

$$
\hat\zeta\leftarrow\arg\max_{\zeta\in[G_\psi]}\left|\sum_t u_t^*(\psi_\zeta)\mathbf v_t^H(\hat\kappa)\mathcal Z_{:,\hat\ell,t}^{\tau}\right|^2,\tag{29b}
$$

$$
\hat\kappa\leftarrow\arg\max_{\kappa\in[G_{\rm bs}]}\left|\sum_t u_t^*(\hat\zeta)\mathbf v_t^H(\kappa)\mathcal Z_{:,\hat\ell,t}^{\tau}\right|^2.\tag{29c}
$$

最终粗网格搜索给出网格点索引 \(\hat i\in[G]\) 的估计及其位置 \(\boldsymbol\xi_{\hat i}^g=[\tau_{\hat\ell},\psi_{\hat\zeta},\theta_{\hat\kappa}^a,\theta_{\hat\kappa}^e,r_{\hat\kappa}]^T\)。每次更新是一维搜索，代价至多 \(\mathcal O(\max(G_\tau,G_\psi,G_{\rm bs})M_{\rm rf}T)\)。注意由于此时已有 UE 角度估计 \(\hat\zeta\)，(29) 中的交替更新使用相干得分。

### B. 离格阻尼 Newton 精化

粗网格搜索得到的 \(\boldsymbol\xi_{\hat i}^g\) 位于离散网格上，故遭受网格量化误差。我们在连续域中通过沿各坐标最大化证据比 \(Q(\boldsymbol\xi)\triangleq|q(\boldsymbol\xi)|^2/s(\boldsymbol\xi)\)、以 Newton 步来精化 \(\boldsymbol\xi_{\hat i}^g\)。我们采用逐坐标 Newton 精化而非完整联合 Newton 更新，以避免计算含混合导数的完整 Hessian，并改善非凹证据比的数值稳定性。此外，基于原子 \(\boldsymbol\phi(\boldsymbol\xi)\) 在 (22) 中可分解为三个独立项这一事实，每次坐标更新只需重算相应的原子因子，其余因子被缓存复用，从而降低复杂度。

对当前估计 \(\hat\xi\) 处的标量坐标 \(\xi\in\{\tau,\psi,\theta^a,\theta^e,r\}\)，我们计算一阶与二阶导数 \(Q_\xi(\hat\xi)\) 与 \(Q_{\xi\xi}(\hat\xi)\)。<sup>8</sup>（脚注 8：本文把 \(f(x)\) 的一阶与二阶导数互换地记为 \(f'(x)/f''(x)\) 或 \(f_x/f_{xx}\)。对已带下标的变量，优先使用撇号记法以避免下标杂乱。）Newton 增量 \(\Delta\xi=-Q_\xi/Q_{\xi\xi}\) 使局部二次模型极大，仅当其为上升方向（即局部曲率为凹、\(Q_{\xi\xi}<0\)）时才用于更新 \(\hat\xi\)。我们不直接接受完整 Newton 步，而是采用回溯线搜索以控制步长，回溯参数 \(\nu\in(0,1]\) 以增强非凸目标下的稳健性。从 \(\nu=1\) 开始，更新点

$$
\xi^+=\hat\xi+\nu\Delta\xi\tag{30}
$$

仅在严格提升证据比（即 \(Q(\xi^+)>Q(\hat\xi)\)）时被接受；否则以 \(\nu\leftarrow\delta\nu\)（\(\delta\in(0,1)\)）收缩步长并重试，最多回溯 \(N_{\rm bt}$ 次。我们循环遍历全部五个坐标并重复 \(N_{\rm ref}\) 轮，其中距离坐标 \(r\) 在 \(\rho=1/r\) 域中精化，因为近场相位在 \(\rho\) 中近似为仿射。由于每个被接受的步都严格提升 \(Q\)（等价于严格降低负边缘似然），精化过程从不降低证据，因而保留序贯 SBL 的单调收敛保证。\(Q_\xi\) 与 \(Q_{\xi\xi}$ 的闭式计算见附录 A。

### C. 活动原子更新

由于每个活动原子 \(i\in[\bar{\mathcal S}]\) 的最优位置 \(\boldsymbol\xi_i^{\rm act}\) 与超参数 \(\gamma_i^{\rm act}\) 依赖活动集 \(\bar{\mathcal S}\) 中其余原子，每加入一个新原子后需要更新活动原子。为更新 \(\bar{\mathcal S}\) 中第 \(i\) 个活动原子，需要在“缺少原子 \(i\)、存在其余全部活动原子”的条件下重新评估其贡献。具体地，我们暂时把原子 \(i\) 从模型中移除，形成留一（leave-one-out，LOO）活动集 \(\bar{\mathcal S}_{-i}\triangleq\bar{\mathcal S}\setminus\{(\boldsymbol\xi_i^{\rm act},\gamma_i^{\rm act})\}\) 及相应 LOO 证据比 \(Q_{-i}(\boldsymbol\xi)=|q_{-i}(\boldsymbol\xi)|^2/s_{-i}(\boldsymbol\xi)\)，其中 LOO 质量因子与稀疏因子为

$$
q_{-i}(\boldsymbol\xi)=\boldsymbol\phi^H(\boldsymbol\xi)\mathbf C_{-i}^{-1}\mathbf y,\qquad s_{-i}(\boldsymbol\xi)=\boldsymbol\phi^H(\boldsymbol\xi)\mathbf C_{-i}^{-1}\boldsymbol\phi(\boldsymbol\xi),\tag{31}
$$

且 \(\mathbf C_{-i}\triangleq\mathbf C_{\bar{\mathcal S}_{-i}}\)。我们首先用第 IV-B 节的 Newton 步、围绕 \(\boldsymbol\xi_i^{\rm act}\) 最大化 LOO 证据比 \(Q_{-i}(\boldsymbol\xi)\) 以精化其位置，得到新位置 \(\boldsymbol\xi_i^{\rm new}\)，使活动原子随活动集演化不断向真值“漂移”。得到 \(\boldsymbol\xi_i^{\rm new}\) 后，计算新的 LOO 质量因子 \(q_{-i}^{\rm new}\triangleq q_{-i}(\boldsymbol\xi_i^{\rm new})\) 与稀疏因子 \(s_{-i}^{\rm new}\triangleq s_{-i}(\boldsymbol\xi_i^{\rm new})\)。若 \(|q_{-i}^{\rm new}|^2>s_{-i}^{\rm new}\)，用 (12) 计算新超参数 \(\gamma_i^{\rm new}\) 并更新活动集中的第 \(i\) 个原子为 \(\boldsymbol\xi_i^{\rm act}\leftarrow\boldsymbol\xi_i^{\rm new}\)、\(\gamma_i^{\rm act}\leftarrow\gamma_i^{\rm new}\)；否则视为原子 \(i\) 无关，将其从活动集剪除，即 \(\bar{\mathcal S}\leftarrow\bar{\mathcal S}_{-i}\)。该自动剪除机制无需指定路径数 \(L\) 即可确定模型阶数。

每个原子更新都需要重算 \(M\times M\) 矩阵 \(\mathbf C_{-i}^{-1}\)。沿用 (16)，可用 (18) 与 (20) 计算 \(q_{-i}\) 与 \(s_{-i}\)，矩阵求逆维度降到活动模型规模；但在大 \(\bar S\) 下，这种重复矩阵求逆的总复杂度仍可能很高。为进一步降低复杂度，LOO 后验 \(\boldsymbol\mu_{-i}\triangleq\boldsymbol\mu_{\bar{\mathcal S}_{-i}}\)、\(\mathbf\Sigma_{-i}\triangleq\mathbf\Sigma_{\bar{\mathcal S}_{-i}}\) 可由当前完整后验 \(\boldsymbol\mu_{\bar{\mathcal S}},\mathbf\Sigma_{\bar{\mathcal S}}\) 通过 Schur 补高效算出而无需重新求逆：

$$
\mathbf\Sigma_{-i}=[\mathbf\Sigma_{\bar{\mathcal S}}]_{\bar i,\bar i}-[\mathbf\Sigma_{\bar{\mathcal S}}]_{\bar i,i}[\mathbf\Sigma_{\bar{\mathcal S}}]_{i,\bar i}/[\mathbf\Sigma_{\bar{\mathcal S}}]_{i,i},\tag{32a}
$$

$$
\boldsymbol\mu_{-i}=[\boldsymbol\mu_{\bar{\mathcal S}}]_{\bar i}-[\mathbf\Sigma_{\bar{\mathcal S}}]_{\bar i,i}[\boldsymbol\mu_{\bar{\mathcal S}}]_i/[\mathbf\Sigma_{\bar{\mathcal S}}]_{i,i},\tag{32b}
$$

其中 \(\bar i=[\bar{\mathcal S}]\setminus\{i\}\) 索引 \([\bar{\mathcal S}]\) 中除 \(i\) 外的全部元素。

每次原子更新后还需更新完整后验。若第 \(i\) 个原子被删除，新完整后验即 LOO 后验，\(\mathbf\Sigma_{\bar{\mathcal S}}^{\rm new}=\mathbf\Sigma_{-i}\)、\(\boldsymbol\mu_{\bar{\mathcal S}}^{\rm new}=\boldsymbol\mu_{-i}\)；否则新完整后验也可用免矩阵求逆的分块逆更新高效计算：

$$
\mathbf\Sigma_{\bar{\mathcal S}}^{\rm new}=\begin{bmatrix}\mathbf\Sigma_{-i}+\chi^{-1}\mathbf\Sigma_{-i}\mathbf c\mathbf c^H\mathbf\Sigma_{-i}&-\chi^{-1}\mathbf\Sigma_{-i}\mathbf c\\-\chi^{-1}\mathbf c^H\mathbf\Sigma_{-i}&\chi^{-1}\end{bmatrix},\tag{33a}
$$

$$
\boldsymbol\mu_{\bar{\mathcal S}}^{\rm new}=\begin{bmatrix}\boldsymbol\mu_{-i}-\mu_i^{\rm new}\mathbf\Sigma_{-i}\mathbf c\\\mu_i^{\rm new}\end{bmatrix},\tag{33b}
$$

其中 \(\mathbf c=N_0^{-1}\mathbf\Phi_{-i}^H\boldsymbol\phi_i^{\rm new}\in\mathbb C^{\bar S-1}\)，\(\chi=N_0^{-1}\|\boldsymbol\phi_i^{\rm new}\|^2+1/\gamma_i^{\rm new}-\mathbf c^H\mathbf\Sigma_{-i}\mathbf c\)，\(\boldsymbol\phi_i^{\rm new}\triangleq\boldsymbol\phi(\boldsymbol\xi_i^{\rm new})\)、\(\mathbf\Phi_{-i}\triangleq\mathbf\Phi_{\bar{\mathcal S}_{-i}}\)，且

$$
\mu_i^{\rm new}=\chi^{-1}\left(N_0^{-1}(\boldsymbol\phi_i^{\rm new})^H\mathbf y-\mathbf c^H\boldsymbol\mu_{-i}\right)\tag{34}
$$

$$
=\frac{q_{-i}^{\rm new}}{(\gamma_i^{\rm new})^{-1}+s_{-i}^{\rm new}}.\tag{35}
$$

更新后的原子总是以 (33) 的后验更新附加到 LOO 模型中。为在下次 LOO 计算前恢复原活动原子次序，所得后验量 \(\mathbf\Sigma_{\bar{\mathcal S}}^{\rm new}\) 与 \(\boldsymbol\mu_{\bar{\mathcal S}}^{\rm new}\) 随后被置换回原活动索引位置。注意到向活动集加入新原子后，完整后验同样可用 (33) 的高效分块更新计算。(32) 与 (33) 中免矩阵求逆后验更新的推导细节见附录 B。

### D. 完整算法

所提基于序贯 SBL 的算法包含一个管理活动集 \(\bar{\mathcal S}\) 的主迭代。每个主迭代中，加入新原子与更新活动原子依次进行。为加入新原子，在当前贝叶斯残差 \(\mathbf r_{\bar{\mathcal S}}\) 上执行解耦粗搜索（第 IV-A 节），得到所选中网格点 \(\hat i\) 及其位置 \(\boldsymbol\xi_{\hat i}^g\)；随后 Newton 精化（第 IV-B 节）给出精化位置 \(\boldsymbol\xi_{\hat i}^{\rm off}\) 与由 (12) 给出的最优超参数 \(\gamma_{\hat i}^\star\)。若所得证据增量满足 \(-\Delta\mathcal L^\star>\epsilon\)（\(\epsilon>0\) 为小阈值），则该候选被加入活动集，即 \(\bar{\mathcal S}\leftarrow\bar{\mathcal S}\cup\{(\boldsymbol\xi_{\hat i}^{\rm off},\gamma_{\hat i}^\star)\}\)。每个主迭代加入新原子后，更新全部活动原子的位置与超参数，并剪除无关原子（第 IV-C 节）。当没有动作能提升证据时算法终止，返回活动原子位置 \(\boldsymbol\xi_{\bar{\mathcal S}}\triangleq\{\boldsymbol\xi_i^{\rm act}\in\bar{\mathcal S}\,|\,i\in[\bar{\mathcal S}]\}\) 及相应后验均值 \(\boldsymbol\mu_{\bar{\mathcal S}}\)。完整信道用 (1) 的多径信道模型、把后验均值作为估计的复增益 \(\hat{\boldsymbol\alpha}=\boldsymbol\mu_{\bar{\mathcal S}}\) 来重建。完整算法见算法 1。

**注 1：** [13] 中提出的高效全网格递归更新机制无法直接用于本文情形，因为它需要在完整联合网格上维护质量因子与稀疏因子，而所考虑 5 维参数空间的网格尺寸 \(G\) 极大，在计算与内存上都不可承受。此外，此类递归更新依赖整个序贯搜索过程中固定的字典，这正是 [13] 中的扩展无格算法只在完成在格选择阶段后才做离格精化、从而在在格阶段每一步都具有相同网格失配误差的原因。相反，我们的方法立即精化每个被接受的原子，并且只维护小活动模型的后验量。◇

### E. 复杂度分析

我们首先强调，借助所维护的后验协方差与均值，LOO 后验提取以及新原子/更新原子的插入都可通过 Schur 补与分块逆更新完成。因此该算法在序贯更新过程中避免了所有显式的非标量矩阵求逆。此外，由于后验更新与 Newton 精化只在小活动模型上进行、复杂度相比在格搜索可忽略，我们聚焦主导的搜索代价。解耦粗搜索的总代价为时延变换、基站码本搜索与 UE 角度搜索的代价之和。通常基站码本尺寸远大于时延网格尺寸与 UE 角度网格尺寸，故总代价由第 IV-A2 节的基站预筛选操作主导。表 I 汇总了每次迭代的主导代价，其中典型规模用第 VI 节的仿真参数计算。相比经典方法，所提方法实现两级复杂度降低：(i) 序贯 SBL 避免了 SBL-EM 所需的 \(\mathcal O(M^2G)\) 全局后验计算；(ii) 解耦搜索用加性的轻量操作替代乘性的联合网格评估。

除计算节省外，所提方法还降低了内存需求。常规全网格 SBL 实现需要访问尺寸为 \(G\) 的完整联合字典（显式存储 \(\mathbf\Phi\in\mathbb C^{M\times G}\)，或为全部 \(G\) 个网格点维护质量与稀疏因子）。相反，我们的解耦方法避免构造完整字典，只存储因子分解后的低维子字典，显著降低内存。

**表 I（原文 Table I）：每次迭代计算代价对比**

| 方法 | 主导代价 | 典型规模 |
|---|---|---|
| SBL-EM（联合网格） | \(\mathcal O(M^2G)\) | \(\sim10^{17}\) |
| 序贯 SBL（联合网格） | \(\mathcal O(MG)\) | \(\sim10^{12}\) |
| 所提（解耦） | \(\mathcal O(G_{\rm ang}M_{\rm rf}G_\tau T)\) | \(\sim10^{8}\) |

### F. Cramér–Rao 下界

我们推导所研究信道估计问题 MSE 的 CRLB。回顾 \(\boldsymbol\xi_l=[\tau_l,\psi_l,\theta_l^a,\theta_l^e,r_l]^T\)，令 \(\boldsymbol\theta_l\triangleq[\Re\{\alpha_l\},\Im\{\alpha_l\},\boldsymbol\xi_l^T]^T\)，则 (4) 中的导频观测是实参数向量 \(\boldsymbol\theta=[\boldsymbol\theta_1^T,\ldots,\boldsymbol\theta_L^T]^T\in\mathbb R^{7L}\) 的参数化函数 \(\mathbf y=\boldsymbol\mu(\boldsymbol\theta)+\tilde{\mathbf n}\)，其中 \(\boldsymbol\mu(\boldsymbol\theta)\triangleq\sum_{l=1}^{L}\alpha_l\boldsymbol\phi(\boldsymbol\xi_l)\)。由于 \(\tilde{\mathbf n}\sim\mathcal{CN}(\mathbf 0,N_0\mathbf I)\) 且噪声功率 \(N_0\) 已知，应用 Slepian–Bangs 公式可得 Fisher 信息矩阵（FIM）元素为

$$
[\mathbf F]_{i,j}=\frac{2}{N_0}\Re\left\{\frac{\partial\boldsymbol\mu^H}{\partial\theta_i}\frac{\partial\boldsymbol\mu}{\partial\theta_j}\right\},\tag{36}
$$

其中 \(\theta_i=[\boldsymbol\theta]_{i}\)，\(\partial\boldsymbol\mu/\partial\Re\{\alpha_l\}=\boldsymbol\phi(\boldsymbol\xi_l)\)、\(\partial\boldsymbol\mu/\partial\Im\{\alpha_l\}=\mathrm{j}\boldsymbol\phi(\boldsymbol\xi_l)\)、\(\partial\boldsymbol\mu/\partial\boldsymbol\xi_l=\alpha_l\boldsymbol\phi_{\xi_l}\)，\(\boldsymbol\phi_{\xi_l}\) 见附录 A。为得到完整宽带信道向量 \(\mathbf h\) 的 CRLB，我们施加 Jacobian 变换 \(\mathbf J=\partial\mathbf h/\partial\boldsymbol\theta^T\in\mathbb C^{\bar M\times7L}\)，所得归一化均方误差（normalized mean square error，NMSE）下界为

$$
{\rm NMSE}_{\rm CRLB}=\operatorname{tr}(\mathbf J\mathbf F^{-1}\mathbf J^H)/\|\mathbf h\|_2^2,\tag{37}
$$

其中 \(\partial\mathbf h/\partial\boldsymbol\theta^T\) 可用与 \(\partial\boldsymbol\mu/\partial\boldsymbol\theta^T\) 相同的方式计算，只是用完整信道原子替代导频域原子。

## V. 宽带协作混合预编码

本节考虑由估计信道参数使能的多用户数据传输的下行混合预编码设计。[19] 从理论上证明：带线性收发机的并行 MIMO 广播信道并不总是可分离的。这意味着为每个子载波独立设计预编码器可能是次优的。然而 [19] 未给出构造性预编码设计，而在宽带混合 XL-MIMO 的硬件约束下这颇具挑战。受此启发，我们考虑新颖的子载波协作传输方案：它允许每个数据符号扩展到若干子信道上，对应在并行信道上联合编码的情形。

信道获取后，考虑 \(K\) 个用户在 DL 传输中受服务。在 (1) 中加入下标 \(k\)，记用户 \(k\) 的信道为

$$
\mathbf H_k[n]=\sum_{l=1}^{L}\alpha_{k,l}g_n(\tau_{k,l})\mathbf a(\theta_{k,l}^a,\theta_{k,l}^e,r_{k,l})\mathbf b^H(\psi_{k,l}),\tag{38}
$$

其中全部多径参数均已由所提 SBL 算法估计。基于信道互易性，基站到第 \(k\) 个用户、子载波 \(n\) 的 DL MIMO 信道记为 \(\mathbf H_k^H[n]\in\mathbb C^{M_{\rm ue}\times M_{\rm bs}}\)。于是整体宽带信道写作

$$
\mathbf H_k^H\triangleq\operatorname{blkdiag}(\mathbf H_k^H[1],\ldots,\mathbf H_k^H[N])\in\mathbb C^{M_{\rm ue}N\times M_{\rm bs}N}.\tag{39}
$$

基站发送的子载波协作信号可表示为

$$
\mathbf x=\bar{\mathbf W}_{\rm RF}\sum_{k=1}^{K}\mathbf W_{{\rm BB},k}\mathbf s_k=\bar{\mathbf W}_{\rm RF}\mathbf W_{\rm BB}\mathbf s\in\mathbb C^{M_{\rm bs}N},\tag{40}
$$

其中 \(\bar{\mathbf W}_{\rm RF}\triangleq\mathbf I_N\otimes\mathbf W_{\rm RF}\) 为总体模拟预编码器，\(\mathbf W_{\rm RF}\in\mathbb C^{M_{\rm bs}\times M_{\rm rf}}\) 是对所有子载波公共的频率无关模拟预编码器。对子连接结构，有 \(\mathbf W_{\rm RF}\triangleq\operatorname{blkdiag}(\mathbf w_{{\rm RF},1},\ldots,\mathbf w_{{\rm RF},M_{\rm rf}})\)，满足恒模约束 \(|[\mathbf w_{{\rm RF},m_{\rm rf}}]_i|=1/\sqrt{\beta}\)。\(\mathbf W_{\rm BB}\triangleq[\mathbf W_{{\rm BB},1},\ldots,\mathbf W_{{\rm BB},K}]\) 为总体基站数字预编码器，\(\mathbf s\triangleq[\mathbf s_1^T,\ldots,\mathbf s_K^T]^T\) 为发射符号且 \(\mathbb E[\mathbf s\mathbf s^H]=\mathbf I\)，其中 \(\mathbf W_{{\rm BB},k}\in\mathbb C^{M_{\rm rf}N\times S_k}\) 与 \(\mathbf s_k\in\mathbb C^{S_k}\) 分别为用户 \(k\) 的子载波协作数字预编码器和发射数据符号。<sup>9</sup>（脚注 9：值得注意的是，令 \(\mathbf W_{{\rm BB},k}\) 具有块对角结构，即 \(\mathbf W_{{\rm BB},k}=\operatorname{blkdiag}(\mathbf w_{{\rm BB},k}[1],\ldots,\mathbf w_{{\rm BB},k}[N])\)，所考虑的传输方案会自然退化为 [21] 等中的传统子载波独立传输方案。）此外，由于每个用户只有一个 RF 链，流数应满足 \(S_k\le N\)；为简单起见假设 \(S_k=N\)。

用户 \(k\) 处采用频率无关模拟合并器 \(\mathbf f_k\in\mathbb C^{M_{\rm ue}}\)（\(|[\mathbf f_k]_i|=1/\sqrt{M_{\rm ue}}\)）时的接收信号为

$$
\mathbf y_k=\bar{\mathbf F}_{{\rm RF},k}\mathbf H_k^H\mathbf x+\bar{\mathbf F}_{{\rm RF},k}\mathbf n_k,\tag{41}
$$

其中 \(\bar{\mathbf F}_{{\rm RF},k}\triangleq\mathbf I_N\otimes\mathbf f_k^H\)、\(\mathbf n_k\sim\mathcal{CN}(\mathbf 0,\sigma_d^2\mathbf I_{M_{\rm ue}N})\) 分别为 \(N\) 个子载波上的总体合并器与噪声，DL 噪声功率为 \(\sigma_d^2\)。重要的是 \(\bar{\mathbf F}_{{\rm RF},k}\bar{\mathbf F}_{{\rm RF},k}^H=\mathbf I_{M_{\rm ue}N}\)。

为简化记号，定义 \(\mathbf Z_{k,u}\triangleq\bar{\mathbf F}_{{\rm RF},k}\mathbf H_k^H\bar{\mathbf W}_{\rm RF}\mathbf W_{{\rm BB},u}\)。假设用户 \(k\) 从其堆叠观测 \(\mathbf y_k\) 中联合解码 \(\mathbf s_k\)。把干扰视为噪声，可达速率为

$$
R_k=\log\left|\mathbf I_N+\mathbf Z_{k,k}^H\left(\sum_{u\ne k}\mathbf Z_{k,u}\mathbf Z_{k,u}^H+\sigma_d^2\mathbf I_N\right)^{-1}\mathbf Z_{k,k}\right|,\tag{42}
$$

用户和速率最大化问题表述为

$$
\max_{\mathbf W_{\rm RF},\{\mathbf W_{{\rm BB},k}\},\{\mathbf f_k\}}\ \sum_{k=1}^{K}R_k\tag{43a}
$$

$$
\text{s.t.}\quad\sum_{k=1}^{K}\left\|\bar{\mathbf W}_{\rm RF}\mathbf W_{{\rm BB},k}\right\|_F^2\le P_d,\tag{43b}
$$

$$
\left|[\mathbf w_{{\rm RF},m_{\rm rf}}]_i\right|=1/\sqrt{\beta},\quad i\in[\beta],\ m_{\rm rf}\in[M_{\rm rf}],\tag{43c}
$$

$$
\left|[\mathbf f_k]_i\right|=1/\sqrt{M_{\rm ue}},\quad i\in[M_{\rm ue}],\ k\in[K],\tag{43d}
$$

其中 \(P_d\) 为 DL 总发射功率。对功率约束 (43b)，由于 \(\bar{\mathbf W}_{\rm RF}^H\bar{\mathbf W}_{\rm RF}=\mathbf I\)，等价地有

$$
\sum_{k=1}^{K}\left\|\bar{\mathbf W}_{\rm RF}\mathbf W_{{\rm BB},k}\right\|_F^2=\sum_{k=1}^{K}\|\mathbf W_{{\rm BB},k}\|_F^2=\|\mathbf W_{\rm BB}\|_F^2\le P_d.\tag{44}
$$

### A. 交替优化算法

我们首先提出一种由估计信道矩阵 \(\mathbf H_k\) 支持的交替优化算法。为处理非凸问题 (43)，先应用矩阵二次变换与矩阵 Lagrange 对偶变换 [22]，使分式目标函数 (43a) 可重述为

$$
f_o(\mathbf W_{\rm RF},\mathbf W_{{\rm BB},k},\mathbf f_k,\mathbf Y_k,\mathbf\Gamma_k)=\sum_{k=1}^{K}\Big\{\log|\mathbf I+\mathbf\Gamma_k|-\operatorname{tr}(\mathbf\Gamma_k)+2\Re\left\{\operatorname{tr}\left((\mathbf I+\mathbf\Gamma_k)\mathbf Z_{k,k}^H\mathbf Y_k\right)\right\}
$$
$$
-\operatorname{tr}\left((\mathbf I+\mathbf\Gamma_k)\mathbf Y_k^H\left(\sum_{u=1}^{K}\mathbf Z_{k,u}\mathbf Z_{k,u}^H+\sigma_d^2\mathbf I_N\right)\mathbf Y_k\right)\Big\},\tag{45}
$$

其中 \(\mathbf\Gamma_k\in\mathbb C^{N\times N}\)（Hermitian 半正定矩阵）与 \(\mathbf Y_k\in\mathbb C^{N\times N}\) 为两个辅助变量。给定 \(\bar{\mathbf W}_{\rm RF}\)、\(\mathbf W_{{\rm BB},k}\) 与 \(\bar{\mathbf F}_{{\rm RF},k}\)，令一阶导数为零，可得两个辅助变量 \(\mathbf\Gamma_k\) 与 \(\mathbf Y_k\) 的最优解为

$$
\mathbf\Gamma_k^\star=\mathbf Z_{k,k}^H\left(\sum_{u\ne k}\mathbf Z_{k,u}\mathbf Z_{k,u}^H+\sigma_d^2\mathbf I_N\right)^{-1}\mathbf Z_{k,k},\tag{46}
$$

$$
\mathbf Y_k^\star=\left(\sum_{u=1}^{K}\mathbf Z_{k,u}\mathbf Z_{k,u}^H+\sigma_d^2\mathbf I_N\right)^{-1}\mathbf Z_{k,k}.\tag{47}
$$

下面以交替方式求解 \(\bar{\mathbf W}_{\rm RF}\)、\(\mathbf W_{{\rm BB},k}\) 与 \(\bar{\mathbf F}_{{\rm RF},k}\)。

**1）基站数字预编码。** 基于 (45)，固定其余变量，功率约束下数字预编码器 \(\mathbf W_{\rm BB}\) 的设计可表述为

$$
\max_{\{\mathbf W_{{\rm BB},k}\}}\ \sum_{k=1}^{K}\left[2\Re\left\{\operatorname{tr}(\mathbf W_{{\rm BB},k}^H\mathbf D_k)\right\}-\operatorname{tr}(\mathbf W_{{\rm BB},k}^H\mathbf B\mathbf W_{{\rm BB},k})\right]\tag{48a}
$$

$$
\text{s.t.}\quad\sum_{k=1}^{K}\|\mathbf W_{{\rm BB},k}\|_F^2\le P_d,\tag{48b}
$$

其中 \(\mathbf D_k\triangleq(\bar{\mathbf F}_{{\rm RF},k}\mathbf H_k^H\bar{\mathbf W}_{\rm RF})^H\mathbf Y_k(\mathbf I_N+\mathbf\Gamma_k)\)，\(\mathbf B\triangleq\sum_{u=1}^{K}\mathbf D_u\mathbf Y_u^H\bar{\mathbf F}_{{\rm RF},u}\mathbf H_u^H\bar{\mathbf W}_{\rm RF}\)。问题 (48) 虽可用 Lagrange 乘子求解，但由于 XL-MIMO，矩阵求逆的复杂度过高。为回避沉重计算负担，可采用最小化—最大化（minorization-maximization，MM）原理下的快速迭代优化 [23]。忽略约束 (48b)，对第 \((t+1)\) 次迭代有免求逆更新 [24]：

$$
\bar{\mathbf W}_{{\rm BB},k}=\mathbf W_{{\rm BB},k}^{(t)}+\frac1\eta\left(\mathbf D_k-\mathbf B\mathbf W_{{\rm BB},k}^{(t)}\right),\tag{49}
$$

其中 \(\mathbf W_{{\rm BB},k}^{(t)}\) 为第 \(t\) 次迭代的变量值，\(\eta\ge\lambda_{\max}(\mathbf B)\)；为计算简便取 \(\eta=\|\mathbf B\|_F\)。随后把 \(\{\bar{\mathbf W}_{{\rm BB},k}\}_{k=1}^{K}\) 投影到发射功率约束上得到数字预编码器：

$$
\mathbf W_{{\rm BB},k}^{(t+1)}=\begin{cases}\bar{\mathbf W}_{{\rm BB},k},&\text{若}\sum_{u=1}^{K}\|\bar{\mathbf W}_{{\rm BB},u}\|_F^2\le P_d,\\\sqrt{\dfrac{P_d}{\sum_{u=1}^{K}\|\bar{\mathbf W}_{{\rm BB},u}\|_F^2}}\ \bar{\mathbf W}_{{\rm BB},k},&\text{否则}.\end{cases}\tag{50}
$$

记 \(I_{\rm BB}\) 为 MM 迭代次数，数字预编码器的总体计算复杂度为 \(\mathcal O(KM_{\rm rf}^2N^2+KN^3+I_{\rm BB}KM_{\rm rf}^2N^3)\)。

**2）用户侧模拟合并器。** 与 (48a) 的推导类似，固定其余变量，可容易地把关于 \(\bar{\mathbf F}_{{\rm RF},k}\) 的目标函数写成二次函数。然而所考虑子载波协作传输中的独特挑战在于构造关于 \(\mathbf f_k\) 的优化问题，即需要从其 Kronecker 积 \(\bar{\mathbf F}_{{\rm RF},k}=\mathbf I_N\otimes\mathbf f_k^H\) 中提取 \(\mathbf f_k\)。为此定义 \(\mathbf A_{k,u}\triangleq\mathbf H_k^H\bar{\mathbf W}_{\rm RF}\mathbf W_{{\rm BB},u}\in\mathbb C^{M_{\rm ue}N\times N}\)，使 \(\mathbf Z_{k,u}=(\mathbf I_N\otimes\mathbf f_k^H)\mathbf A_{k,u}\)。把 \(\mathbf A_{k,u}=[\mathbf A_{k,u}^T[1],\ldots,\mathbf A_{k,u}^T[N]]^T\) 分成 \(N\) 块，得 \(\mathbf A_{k,u}[n]\in\mathbb C^{M_{\rm ue}\times N}\)。于是可显式构造

$$
\operatorname{rvec}(\mathbf Z_{k,u})=\mathbf f_k^H\breve{\mathbf A}_{k,u},\tag{51}
$$

其中 \(\operatorname{rvec}(\cdot)\) 为按行向量化算子，\(\breve{\mathbf A}_{k,u}\triangleq[\mathbf A_{k,u}[1],\ldots,\mathbf A_{k,u}[N]]\in\mathbb C^{M_{\rm ue}\times N^2}\)。为把 (48a) 中的迹算子转换为按行向量化算子，需要以下性质：

$$
\operatorname{tr}\left(\mathbf Z^H\mathbf X\right)=\operatorname{rvec}(\mathbf X)\operatorname{rvec}(\mathbf Z)^H,\qquad \operatorname{tr}\left(\mathbf Z^H\mathbf X\mathbf Z\right)=\operatorname{rvec}(\mathbf Z)\left(\mathbf X^T\otimes\mathbf I\right)\operatorname{rvec}(\mathbf Z)^H.\tag{52}
$$

把 (51) 与 (52) 应用到 (45)，可把关于 \(\mathbf f_k\) 的优化问题表述为

$$
\max_{\{\mathbf f_k\}}\ \sum_{k=1}^{K}\left[2\Re\left\{\mathbf u_k^H\mathbf f_k\right\}-\mathbf f_k^H\mathbf U_{f,k}\mathbf f_k\right]\tag{53a}
$$

$$
\text{s.t.}\quad|[\mathbf f_k]_i|=1/\sqrt{M_{\rm ue}},\quad i\in[M_{\rm ue}],\ k\in[K],\tag{53b}
$$

其中 \(\mathbf u_k^H\triangleq\operatorname{rvec}(\mathbf Y_k(\mathbf I_N+\mathbf\Gamma_k))\breve{\mathbf A}_{k,k}^H\)，且

$$
\mathbf U_{f,k}\triangleq\sum_{u=1}^{K}\breve{\mathbf A}_{k,u}\left(\left[\mathbf Y_k(\mathbf I_N+\mathbf\Gamma_k)\mathbf Y_k^H\right]^T\otimes\mathbf I_N\right)\breve{\mathbf A}_{k,u}^H.\tag{54}
$$

问题 (53) 是带恒模约束的标准二次优化问题，可用 MM 算法以低复杂度求解 [25, (56)]。记 \(I_f\) 为 MM 迭代次数，设计 \(\mathbf f_k\) 的计算复杂度为 \(\mathcal O(K^2M_{\rm ue}^2N^2+K^2M_{\rm ue}N^3+I_fKM_{\rm ue}^2)\)。

**3）基站侧模拟预编码。** 类似地容易发现 (45) 是 \(\bar{\mathbf W}_{\rm RF}\) 的二次函数。接下来的独特技术挑战在于：从 \(\mathbf Z_{k,u}\) 中其耦合的 Kronecker 关系出发、并考虑子连接特性，构造关于 \(\mathbf W_{\rm RF}\) 的可处理优化问题。把 \(\mathbf W_{{\rm BB},u}=[\mathbf W_{{\rm BB},u}^T[1],\ldots,\mathbf W_{{\rm BB},u}^T[N]]^T\) 分成 \(N\) 块，得 \(\mathbf W_{{\rm BB},u}[n]\in\mathbb C^{M_{\rm rf}\times N}\)。利用 \(\bar{\mathbf F}_{{\rm RF},k}\)、\(\mathbf H_k^H\) 与 \(\bar{\mathbf W}_{\rm RF}\) 的块对角特性，\(\mathbf Z_{k,u}\) 的第 \(n\) 行现在可表示为

$$
[\mathbf Z_{k,u}]_{n,:}=\mathbf f_k^H\mathbf H_k^H[n]\mathbf W_{\rm RF}\mathbf W_{{\rm BB},u}[n].\tag{55}
$$

基于子连接结构，定义 \(\mathbf w_{\rm RF}\triangleq[\mathbf w_{{\rm RF},1}^T,\ldots,\mathbf w_{{\rm RF},M_{\rm rf}}^T]^H\in\mathbb C^{M_{\rm bs}}\) 为 \(M_{\rm bs}\) 个模拟移相器的优化变量，使 \(\mathbf W_{\rm RF}=\operatorname{diag}(\mathbf w_{\rm RF}^*)(\mathbf I_{M_{\rm rf}}\otimes\mathbf 1_\beta)\)，其中 \(\mathbf 1_\beta\) 为全 1 向量。把性质 \(\mathbf a^T\operatorname{diag}(\mathbf b)=\mathbf b^T\operatorname{diag}(\mathbf a)\) 应用于 (55)，可显式把 \(\mathbf w_{\rm RF}\) 表为

$$
[\mathbf Z_{k,u}]_{n,:}=\mathbf w_{\rm RF}^H\mathbf C_{k,u}[n],\tag{56}
$$

其中 \(\mathbf C_{k,u}[n]\triangleq\operatorname{diag}(\mathbf H_k^{*}[n]\mathbf f_k^{*})(\mathbf I_{M_{\rm rf}}\otimes\mathbf 1_\beta)\mathbf W_{{\rm BB},u}[n]\in\mathbb C^{M_{\rm bs}\times N}\)。进一步可得 \(\operatorname{rvec}(\mathbf Z_{k,u})=\mathbf w_{\rm RF}^H\breve{\mathbf C}_{k,u}\)，其中 \(\breve{\mathbf C}_{k,u}\triangleq[\mathbf C_{k,u}[1],\ldots,\mathbf C_{k,u}[N]]\in\mathbb C^{M_{\rm bs}\times N^2}\)。借助 (52)，关于 \(\mathbf w_{\rm RF}\) 的优化问题表述为

$$
\max_{\mathbf w_{\rm RF}}\ 2\Re\left\{\mathbf g^H\mathbf w_{\rm RF}\right\}-\mathbf w_{\rm RF}^H\mathbf G\mathbf w_{\rm RF}\tag{57a}
$$

$$
\text{s.t.}\quad|[\mathbf w_{\rm RF}]_m|=1/\sqrt{\beta},\quad m\in[M_{\rm bs}],\tag{57b}
$$

其中 \(\mathbf g^H=\sum_{k=1}^{K}\operatorname{rvec}(\mathbf Y_k(\mathbf I_N+\mathbf\Gamma_k))\breve{\mathbf C}_{k,k}^H\)，且

$$
\mathbf G=\sum_{k=1}^{K}\sum_{u=1}^{K}\breve{\mathbf C}_{k,u}\left(\left[\mathbf Y_k(\mathbf I_N+\mathbf\Gamma_k)\mathbf Y_k^H\right]^T\otimes\mathbf I\right)\breve{\mathbf C}_{k,u}^H,\tag{58}
$$

它同样可由 MM 算法容易求解。计算复杂度为 \(\mathcal O(K^2M_{\rm bs}^2N^2+I_wM_{\rm bs}^2)\)，\(I_w\) 为 MM 迭代次数。由于 \(M_{\rm bs}\) 数目极大，这是交替算法中最重的部分。

### B. 低复杂度算法

所提交替算法的问题维度在宽带 XL-MIMO 下可能难以承受。因此我们在此提出一种低复杂度次优解，由估计的角度—距离—时延参数支撑；同时该方案可作为交替算法的高质量初始解。

具体地，与用完整信道矩阵处理和速率最大化不同，低复杂度算法的原理是：先设计模拟波束成形器对准估计的参数化信道以最大化信道增益，再固定模拟波束成形器，最后基于低维有效信道设计数字预编码器以处理多用户干扰。

与多数现有工作把模拟波束成形器对准主路径不同，我们设计用户 \(k\) 的模拟合并器以最大化 \(L\) 条路径的平均合并增益，这对 FR3 频段有利。我们要求解

$$
\max_{\mathbf f_k}\ \sum_{l=1}^{L}|\alpha_{k,l}|^2\left|\mathbf f_k^H\mathbf b(\psi_{k,l})\right|^2=\mathbf f_k^H\mathbf R_{{\rm ue},k}\mathbf f_k,\tag{59}
$$

其中 \(\mathbf R_{{\rm ue},k}=\sum_{l=1}^{L}|\alpha_{k,l}|^2\mathbf b(\psi_{k,l})\mathbf b^H(\psi_{k,l})\)。作为约束 (43d) 下的 Rayleigh 商，其次优解为

$$
\mathbf f_k^\star=\exp\left(\mathrm{j}\arg(\mathbf v_{\max}(\mathbf R_{{\rm ue},k}))\right)/\sqrt{M_{\rm ue}}.\tag{60}
$$

给定 \(\mathbf f_k^\star\)，我们把基站模拟预编码对准 \(K\) 个用户的平均等效信道 \(\bar{\mathbf h}_k[n]=\mathbf H_k[n]\mathbf f_k^\star\)。设计准则因此为

$$
\max_{\mathbf W_{\rm RF}}\ \sum_{k=1}^{K}\sum_{n=1}^{N}\omega_k\left\|\bar{\mathbf h}_k^H[n]\mathbf W_{\rm RF}\right\|^2=\operatorname{tr}(\mathbf W_{\rm RF}^H\mathbf R_{\rm bs}\mathbf W_{\rm RF}),\tag{61}
$$

其中 \(\mathbf R_{\rm bs}=\sum_{k=1}^{K}\sum_{n=1}^{N}\omega_k\bar{\mathbf h}_k[n]\bar{\mathbf h}_k^H[n]\)，权重 \(\omega_k=1/\sum_{n=1}^{N}\|\bar{\mathbf h}_k[n]\|^2\) 用于使所有用户在计算平均信道增益 (61) 时具有同等优先级。利用 \(\mathbf W_{\rm RF}\) 的块对角结构，可得次优解 \(\mathbf W_{\rm RF}^\star=\operatorname{blkdiag}(\mathbf w_{{\rm RF},1}^\star,\ldots,\mathbf w_{{\rm RF},M_{\rm rf}}^\star)\)，其中

$$
\mathbf w_{{\rm RF},m_{\rm rf}}^\star=\exp\left(\mathrm{j}\arg(\mathbf v_{\max}(\mathbf R_{{\rm bs},m_{\rm rf}}))\right)/\sqrt{\beta},\tag{62}
$$

\(\mathbf R_{{\rm bs},m_{\rm rf}}\triangleq[\mathbf R_{\rm bs}]_{\mathcal S_{m_{\rm rf}},\mathcal S_{m_{\rm rf}}}\in\mathbb C^{\beta\times\beta}\)，\(\mathcal S_{m_{\rm rf}}\) 表示连接到第 \(m_{\rm rf}\) 个 RF 链的天线索引集。

给定 \(\mathbf f_k^\star\) 与 \(\mathbf W_{\rm RF}^\star\)，用户 \(k\) 的有效信道为

$$
\tilde{\mathbf H}_k\triangleq\left(\mathbf I_N\otimes(\mathbf f_k^\star)^H\right)\mathbf H_k^H\left(\mathbf I_N\otimes\mathbf W_{\rm RF}^\star\right)\in\mathbb C^{N\times M_{\rm rf}N}.\tag{63}
$$

把所有 \(K\) 个用户的信道堆叠为 \(\tilde{\mathbf H}\triangleq[\tilde{\mathbf H}_1^T,\ldots,\tilde{\mathbf H}_K^T]^T\)，正则化迫零（regularized zero-forcing，RZF）数字预编码器为

$$
\mathbf W_{\rm BB}^\star=\rho_{\rm zf}\tilde{\mathbf H}^H\left(\tilde{\mathbf H}\tilde{\mathbf H}^H+\mu_{\rm zf}\mathbf I_{KN}\right)^{-1},\tag{64}
$$

其中 \(\mu_{\rm zf}=KN\sigma_d^2/P_d\) 为正则化参数，\(\rho_{\rm zf}\) 为满足功率约束 (44) 的归一化因子。总体计算复杂度主要来自特征值分解与 RZF 预编码，量级为 \(\mathcal O(KM_{\rm ue}^3+M_{\rm rf}\beta^3+K^2M_{\rm rf}N^3+K^3N^3)\)。

**注 2：** 多用户 MIMO 的传统协调 BF [26] 要求发射端具备全局 CSI（如第 V-A 节的交替算法），或者要求在线反复进行基站—用户迭代以构造预编码器与合并器；后者除计算复杂度之外，还会带来大量往返反馈与控制信令。相反，应用所提非迭代算法时，基站只需向用户 \(k\) 通知少量估计信道参数 \(\{|\alpha_{k,l}|^2,\psi_{k,l}\}_{l\in[L]}\)（而不是合并器本身）；随后每个用户只需按 (60) 配置自己的合并器，基站即可自行完成后续预编码器设计。因此我们的方案避免了基站与用户之间的迭代适配，同时降低了计算复杂度与信令开销。◇

## VI. 仿真结果

仿真中，对信道估计我们采用如下系统参数与网格尺寸：\(M_{\rm bs}=64\times32=2048\)，\(G_{\theta^a}=M_h=64\)、\(G_{\theta^e}=M_v=32\)；\(M_{\rm rf}=128\)、\(\beta=16\)；\(G_\psi=M_{\rm ue}=8\)；\(G_\tau=N=64\)，\(\Delta f=256\) kHz，载频 \(f_c=7\) GHz。模拟移相器 \(\{\mathbf w_{m,t}\}\) 与 \(\{\mathbf f_t\}\) 以 i.i.d. 随机相位生成。对 DL 数据传输，我们默认在 \(K=8\)、\(N=32\) 下评估和谱效率 \(\sum_kR_k/N\)。信道参数设为：\(L=4\)，\(\theta^a,\theta^e,\psi\in[-60^\circ,60^\circ]\)，\(\tau\in[0,200]\) ns，\(\alpha_l\sim\mathcal{CN}(0,1)\)，\(r\in[0.1,0.5]R_{\rm Ray}\)，其中 \(R_{\rm Ray}\approx10^5\) m 为 Rayleigh 距离，\(G_r=6\) 个距离点在逆距离域（即 \(1/r\)）中均匀分布。

### A. 信道估计质量

给定 \(\mathbf h\) 与 \(\hat{\mathbf h}\) 为向量化真值与估计宽带信道，为评估估计性能，我们考虑 NMSE \(\mathbb E[(\|\hat{\mathbf h}-\mathbf h\|_2^2)/\|\mathbf h\|_2^2]\) 与信道相关性 \(\mathbb E[|\hat{\mathbf h}^H\mathbf h|/(\|\hat{\mathbf h}\|\|\mathbf h\|)]\)。我们把所提估计算法与以下基准比较：(1) **OMP core**：该方案在整个算法中用 OMP 匹配滤波得分 \(|q|^2\) 替换 SBL 准则 \(Q=|q|^2/s\)，对应一种解耦离格 Newton 化 OMP（NOMP），用于在同一解耦框架下展示基于证据的 SBL 相对 OMP 的优势。(2) **No refine**：该方案不含离格 Newton 精化步，用于量化连续域参数精化带来的增益，并凸显网格失配的严重性。(3) **Polar-OMP**：该基准采用 [3] 极坐标码本的代表性方法，它在联合角度—距离码本上运行、并跨子载波执行同步 OMP；由于该方案不在其码本内联合估计 UE 角度与时延，我们为其提供 oracle 信息。

NMSE 与信道相关性的数值结果分别见图 2 与图 3。可以观察到，尽管 Polar-OMP 被给予了 oracle 的 UE 角度与时延信息，所提完整算法仍显著优于 Polar-OMP 基准。消融研究表明：(i) 所提连续域 Newton 精化是必要的，“No refine” 基准凸显了这一点；(ii) 与 “OMP core” 变体比较，证明了 SBL 边缘似然准则的关键优势。此外，通过扩展时间观测（\(T=16\)）并以更密的 RF 配置（\(\beta=8\)）增加空间自由度，所提算法获得足够的处理增益以有效缓解网格失配，紧贴 CRLB 性能。

**图 2（原文 Fig. 2）：** 信道估计 NMSE 随 UL SNR 的变化（图例：Polar-OMP、No refine、OMP core、Proposed、CRLB，分别在 \(T=8,\beta=16\) 与 \(T=16,\beta=8\) 两种配置下）。

**图 3（原文 Fig. 3）：** 信道估计相关性随 UL SNR 的变化。

### B. 混合预编码质量

接下来考察所提交替优化（AO）与低复杂度（LC）优化算法所取得的可达速率性能。我们还分别考虑由 LC 初始化的 AO（记作 “ini-LC”）与随机初始化的 AO（记作 “ini-random”）。

完美 CSI 下 AO 与 LC 在不同 DL SNR 下的对比如图 4 所示。可以看到两种所提预编码算法在近场环境下都能有效提升通信性能；同时，所提 LC 算法在多径条件下（尤其当 \(M_{\rm ue}\) 较小时）表现良好，且复杂度远低于 AO 算法。此外，当解空间极大且复杂时，LC 可作为 AO 的良好初始解。考虑到 XL-MIMO 在多用户、多子载波设定下天线数极多，限制算法复杂度至关重要；因此所提 LC 算法对涉及大量优化变量的真实系统具有良好前景与实际可行性。

图 5 中我们基于估计 CSI 评估可达速率性能。可以观察到，由于所提序贯 SBL 算法估计精度高，基于估计 CSI 的 AO 与 LC 算法有效逼近真实 CSI 所实现的性能，即使信道维度极大。这证明了所提算法在实现极高数据速率需求传输时的可靠性。此外，相比 OMP-core 基准也展示了所提算法的优势：增益来自更准确的参数估计，从而保证混合预编码的精度。

**图 4（原文 Fig. 4）：** 在 \(M_{\rm bs}=1024\)、\(\beta=8\) 下可达速率随 DL SNR 的变化。

**图 5（原文 Fig. 5）：** 在 20 dB SNR 下、不同 CSI 时可达速率随 \(M_{\rm bs}\) 的变化。

### C. 子载波协作增益

在完美 CSI 与 AO 下，图 6 展示跨子载波协作传输的收益。可以看到协作传输的增益主要存在于干扰受限区间，即高 SNR 与大 \(K\) 时。这是因为宽带协作在子载波域提供了额外的（约 \(\mathcal O(N)\) 量级）干扰置零能力：若存在强多用户干扰，协作传输拥有子载波域自由度来消除干扰，从而带来性能提升；否则独立的子载波传输 [21] 通过空间复用已足以处理干扰。

**图 6（原文 Fig. 6）：** 在 \(M_{\rm bs}=512\)、\(M_{\rm rf}=16\)、\(M_{\rm ue}=4\) 下宽带协作与独立 BF 方案的可达速率对比。

## VII. 结论

本文提出一种解耦离格序贯 SBL 算法，以求解 XL-MIMO OFDM 系统中极具挑战的近场信道估计问题。我们有效地把计算上难以承受的 5 维联合参数搜索分解为一系列低维边缘投影，并提出连续域 Newton 精化以克服严重网格失配。获取 CSI 后，提出两种低复杂度混合预编码算法，以在干扰受限区间通过子载波协作改善传输。仿真验证了多用户多子载波 XL-MIMO 这一挑战性场景下估计算法的精度与基于估计 CSI 的预编码通信性能。

## 附录 A：式 (30) 中的解析一阶与二阶导数

记原子 \(\boldsymbol\phi(\boldsymbol\xi)\) 对每个坐标 \(\xi\) 的一阶与二阶偏导数分别为 \(\boldsymbol\phi_\xi\triangleq\frac{\partial\boldsymbol\phi(\boldsymbol\xi)}{\partial\xi}\) 与 \(\boldsymbol\phi_{\xi\xi}\triangleq\frac{\partial^2\boldsymbol\phi(\boldsymbol\xi)}{\partial\xi^2}\)，则有 \(q_\xi=\boldsymbol\phi_\xi^H\mathbf C^{-1}\mathbf y\)、\(q_{\xi\xi}=\boldsymbol\phi_{\xi\xi}^H\mathbf C^{-1}\mathbf y\)、\(s_\xi=2\Re\{\boldsymbol\phi_\xi^H\mathbf C^{-1}\boldsymbol\phi\}\)、\(s_{\xi\xi}=2\Re\{\boldsymbol\phi_{\xi\xi}^H\mathbf C^{-1}\boldsymbol\phi\}+2\boldsymbol\phi_\xi^H\mathbf C^{-1}\boldsymbol\phi_\xi\)。进一步定义 \(F(\boldsymbol\xi)\triangleq|q(\boldsymbol\xi)|^2\)，有 \(F_\xi=2\Re\{q_\xi q^*\}\)、\(F_{\xi\xi}=2|q_\xi|^2+2\Re\{q_{\xi\xi}q^*\}\)。则 \(Q_\xi\) 与 \(Q_{\xi\xi}\) 为

$$
Q_\xi=\frac{F_\xi s-Fs_\xi}{s^2},\qquad Q_{\xi\xi}=\frac{F_{\xi\xi}}{s}-\frac{Fs_{\xi\xi}}{s^2}-\frac{2F_\xi s_\xi}{s^2}+\frac{2Fs_\xi^2}{s^3}.
$$

现在需要计算 \(\boldsymbol\phi_\xi\) 与 \(\boldsymbol\phi_{\xi\xi}\)。回顾 (22)，向量化前的原子元素可分解为 \(\mathcal A_{m,n,t}(\boldsymbol\xi)=g_n(\tau)v_{m,t}(\theta^a,\theta^e,r)u_t(\psi)\)，故 \(\boldsymbol\phi(\boldsymbol\xi)=\operatorname{vec}(\mathcal A)\) 的偏导数只需对依赖所选坐标的那个因子求导。对时延坐标 \(\xi=\tau\)：\(\mathcal A'_{m,n,t}(\tau)=g'_n(\tau)v_{m,t}u_t\)、\(\mathcal A''_{m,n,t}(\tau)=g''_n(\tau)v_{m,t}u_t\)，其中 \(g'_n(\tau)=-\mathrm{j}2\pi(n-1)\Delta f\,g_n(\tau)\)、\(g''_n(\tau)=-(2\pi(n-1)\Delta f)^2g_n(\tau)\)。对 UE 角坐标 \(\xi=\psi\)：\(\mathcal A'_{m,n,t}(\psi)=g_nv_{m,t}u'_t(\psi)\)、\(\mathcal A''_{m,n,t}(\psi)=g_nv_{m,t}u''_t(\psi)\)，其中 \(u'_t(\psi)=\mathbf f_t^H\mathbf b_\psi\)、\(u''_t(\psi)=\mathbf f_t^H\mathbf b_{\psi\psi}\)，\([\mathbf b_\psi]_m=-\mathrm{j}\pi(m-1)\cos(\psi)[\mathbf b(\psi)]_m\)，\([\mathbf b_{\psi\psi}]_m=\left(\mathrm{j}\pi(m-1)\sin(\psi)+(\mathrm{j}\pi(m-1)\cos(\psi))^2\right)[\mathbf b(\psi)]_m\)。对基站角度与距离坐标之一 \(x\in\{\theta^a,\theta^e,r\}\)：\(\mathcal A'_{m,n,t}(x)=g_nv'_{m,t}(x)u_t\)、\(\mathcal A''_{m,n,t}(x)=g_nv''_{m,t}(x)u_t\)，\(v'_{m,t}(x)=[\mathbf W_t^H\mathbf a_x]_m\)、\(v''_{m,t}(x)=[\mathbf W_t^H\mathbf a_{xx}]_m\)，\([\mathbf a_x]_m=[\mathbf a(x)]_m(-\mathrm{j}k_0d'_m(x))\)、\([\mathbf a_{xx}]_m=[\mathbf a(x)]_m\left((-jk_0d'_m(x))^2-\mathrm{j}k_0d''_m(x)\right)\)，其中 \(d_m(x)\triangleq\|\mathbf d_m\|\)、\(\mathbf d_m\triangleq\mathbf p_m^{\rm bs}-\mathbf p^{\rm sc}(x)\)。进一步有

$$
d'_m(x)=\frac{-\mathbf d_m^T\mathbf p_x^{\rm sc}}{d_m(x)},\qquad d''_m(x)=\frac{\|\mathbf p_x^{\rm sc}\|^2-\mathbf d_m^T\mathbf p_{xx}^{\rm sc}}{d_m(x)}-\frac{(\mathbf d_m^T\mathbf p_x^{\rm sc})^2}{d_m^3(x)},
$$

只要 \(\mathbf p_x^{\rm sc}\) 与 \(\mathbf p_{xx}^{\rm sc}\) 按一致方式计算，这些式子对任意坐标约定都成立。对 UPA 情形，可写 \(\mathbf p^{\rm sc}(\theta^a,\theta^e,r)=r\mathbf e(\theta^a,\theta^e)\)，其中 \(\mathbf e(\theta^a,\theta^e)=[\cos(\theta^e)\cos(\theta^a),\cos(\theta^e)\sin(\theta^a),\sin(\theta^e)]^T\)。则 \(\mathbf e'(\theta^a)=[-\cos(\theta^e)\sin(\theta^a),\cos(\theta^e)\cos(\theta^a),0]^T\)、\(\mathbf e'(\theta^e)=[-\sin(\theta^e)\cos(\theta^a),-\sin(\theta^e)\sin(\theta^a),\cos(\theta^e)]^T\)、\(\mathbf e''(\theta^a)=[-\cos(\theta^e)\cos(\theta^a),-\cos(\theta^e)\sin(\theta^a),0]^T\)、\(\mathbf e''(\theta^e)=-\mathbf e\)。于是 \(\mathbf p_{\theta^a}^{\rm sc}=r\mathbf e'(\theta^a)\)、\(\mathbf p_{\theta^a\theta^a}^{\rm sc}=r\mathbf e''(\theta^a)\)、\(\mathbf p_{\theta^e}^{\rm sc}=r\mathbf e'(\theta^e)\)、\(\mathbf p_{\theta^e\theta^e}^{\rm sc}=r\mathbf e''(\theta^e)\)。对逆距离 \(\rho=1/r\)，有 \(\mathbf p^{\rm sc}(\rho)=\rho^{-1}\mathbf e\)、\(\mathbf p_\rho^{\rm sc}=-\rho^{-2}\mathbf e\)、\(\mathbf p_{\rho\rho}^{\rm sc}=2\rho^{-3}\mathbf e\)。

## 附录 B：免矩阵求逆的后验更新

**LOO 后验协方差 \(\mathbf\Sigma_{-i}\) 的推导。** 先定义活动集的后验精度 \(\mathbf\Lambda_{\bar{\mathcal S}}\triangleq\mathbf\Sigma_{\bar{\mathcal S}}^{-1}=N_0^{-1}\mathbf\Phi_{\bar{\mathcal S}}^H\mathbf\Phi_{\bar{\mathcal S}}+\mathbf\Gamma_{\bar{\mathcal S}}^{-1}\)。对原子 \(i\in\bar{\mathcal S}\)，把完整后验量分块写为

$$
\mathbf\Lambda_{\bar{\mathcal S}}=\begin{bmatrix}\mathbf\Lambda_{\bar i}&\boldsymbol\lambda_{\bar i}\\\boldsymbol\lambda_{\bar i}^H&\lambda_i\end{bmatrix},\qquad\mathbf\Sigma_{\bar{\mathcal S}}=\begin{bmatrix}\mathbf\Sigma_{\bar i\bar i}&\boldsymbol\sigma_{\bar i}\\\boldsymbol\sigma_{\bar i}^H&\sigma_i\end{bmatrix},\qquad\boldsymbol\mu_{\bar{\mathcal S}}=\begin{bmatrix}\boldsymbol\mu_{\bar i}\\\mu_i\end{bmatrix},\tag{65}
$$

其中为简化记号，定义 \(\mathbf\Lambda_{\bar i\bar i}\triangleq[\mathbf\Lambda_{\bar{\mathcal S}}]_{\bar i,\bar i}\)、\(\boldsymbol\lambda_{\bar i}\triangleq[\mathbf\Lambda_{\bar{\mathcal S}}]_{\bar i,i}\)、\(\lambda_i\triangleq[\mathbf\Lambda_{\bar{\mathcal S}}]_{i,i}\)、\(\mathbf\Sigma_{\bar i\bar i}\triangleq[\mathbf\Sigma_{\bar{\mathcal S}}]_{\bar i,\bar i}\)、\(\boldsymbol\sigma_{\bar i}\triangleq[\mathbf\Sigma_{\bar{\mathcal S}}]_{\bar i,i}\)、\(\sigma_i\triangleq[\mathbf\Sigma_{\bar{\mathcal S}}]_{i,i}\)、\(\boldsymbol\mu_{\bar i}\triangleq[\boldsymbol\mu_{\bar{\mathcal S}}]_{\bar i}\)、\(\mu_i\triangleq[\boldsymbol\mu_{\bar{\mathcal S}}]_i\)，并注意 \(\mathbf\Lambda_{\bar i\bar i}=N_0^{-1}\mathbf\Phi_{-i}^H\mathbf\Phi_{-i}+\mathbf\Gamma_{-i}^{-1}=\mathbf\Lambda_{-i}\)。我们希望计算 \(\mathbf\Sigma_{-i}\)，即分块 \(\mathbf\Lambda_{-i}\) 的逆，\(\mathbf\Sigma_{-i}=\mathbf\Lambda_{-i}^{-1}\)。以 \(\lambda_{\rm sc}\) 作为分块 \(\mathbf\Lambda_{-i}\) 的 Schur 补，利用 \(\mathbf\Lambda_{\bar{\mathcal S}}\) 的分块求逆公式，有

$$
\mathbf\Lambda_{\bar{\mathcal S}}^{-1}=\begin{bmatrix}\mathbf\Lambda_{-i}^{-1}+\mathbf\Lambda_{-i}^{-1}\boldsymbol\lambda_{\bar i}\lambda_{\rm sc}^{-1}\boldsymbol\lambda_{\bar i}^H\mathbf\Lambda_{-i}^{-1}&-\mathbf\Lambda_{-i}^{-1}\boldsymbol\lambda_{\bar i}\lambda_{\rm sc}^{-1}\\-\boldsymbol\lambda_{\bar i}^H\mathbf\Lambda_{-i}^{-1}\lambda_{\rm sc}^{-1}&\lambda_{\rm sc}^{-1}\end{bmatrix},\tag{66}
$$

其中每个分块因 \(\mathbf\Lambda_{\bar{\mathcal S}}^{-1}=\mathbf\Sigma_{\bar{\mathcal S}}\) 而等于 \(\mathbf\Sigma_{\bar{\mathcal S}}\) 的对应分块，即

$$
\mathbf\Sigma_{\bar i\bar i}=\mathbf\Lambda_{-i}^{-1}+\mathbf\Lambda_{-i}^{-1}\boldsymbol\lambda_{\bar i}\lambda_{\rm sc}^{-1}\boldsymbol\lambda_{\bar i}^H\mathbf\Lambda_{-i}^{-1},\tag{67a}
$$

$$
\boldsymbol\sigma_{\bar i}=-\mathbf\Lambda_{-i}^{-1}\boldsymbol\lambda_{\bar i}\lambda_{\rm sc}^{-1},\qquad\sigma_i=\lambda_{\rm sc}^{-1}.\tag{67b}
$$

由 \(\mathbf\Sigma_{-i}=\mathbf\Lambda_{-i}^{-1}\)，在 (67) 中消去交叉项即得

$$
\mathbf\Sigma_{-i}=\mathbf\Sigma_{\bar i\bar i}-\boldsymbol\sigma_{\bar i}\boldsymbol\sigma_{\bar i}^H/\sigma_i,\tag{68}
$$

这证明了 (32a) 中的 LOO 后验协方差。

**LOO 后验均值 \(\boldsymbol\mu_{-i}\) 的推导。** 先定义 \(\mathbf g_{\bar{\mathcal S}}\triangleq N_0^{-1}\mathbf\Phi_{\bar{\mathcal S}}^H\mathbf y\)，则 \(\boldsymbol\mu_{\bar{\mathcal S}}=\mathbf\Sigma_{\bar{\mathcal S}}\mathbf g_{\bar{\mathcal S}}\)、\(\mathbf g_{\bar{\mathcal S}}=\mathbf\Lambda_{\bar{\mathcal S}}\boldsymbol\mu_{\bar{\mathcal S}}\)；分块写为

$$
\begin{bmatrix}\mathbf g_{\bar i}\\\mathbf g_i\end{bmatrix}=\begin{bmatrix}\mathbf\Lambda_{-i}&\boldsymbol\lambda_{\bar i}\\\boldsymbol\lambda_{\bar i}^H&\lambda_i\end{bmatrix}\begin{bmatrix}\boldsymbol\mu_{\bar i}\\\mu_i\end{bmatrix},\tag{69}
$$

其中 \(\mathbf g_{\bar i}\triangleq[\mathbf g_{\bar{\mathcal S}}]_{\bar i}\)、\(\mathbf g_i\triangleq[\mathbf g_{\bar{\mathcal S}}]_i\)。注意 \(\boldsymbol\mu_{-i}=\mathbf\Sigma_{-i}\mathbf g_{\bar i}\)、\(\mathbf\Sigma_{-i}=\mathbf\Lambda_{-i}^{-1}\)，结合 (69) 的第一个分块行可得

$$
\boldsymbol\mu_{-i}=\boldsymbol\mu_{\bar i}+\mathbf\Lambda_{-i}^{-1}\boldsymbol\lambda_{\bar i}\mu_i.\tag{70}
$$

由 (67b) 有 \(\mathbf\Lambda_{-i}^{-1}\boldsymbol\lambda_{\bar i}=-\boldsymbol\sigma_{\bar i}/\sigma_i\)，与 (70) 结合得

$$
\boldsymbol\mu_{-i}=\boldsymbol\mu_{\bar i}-\boldsymbol\sigma_{\bar i}\mu_i/\sigma_i,\tag{71}
$$

这证明了 (32b) 中的 LOO 后验均值。

**加入新原子后新后验的推导。** 当加入新选原子、或在 LOO 精化后加入更新过的原子时，使用同一分块矩阵求逆恒等式。为给出一般推导，定义 \(\mathcal B\) 为基活动集：在正向加入时 \(\mathcal B=\bar{\mathcal S}\)，在活动集精化时 \(\mathcal B=\bar{\mathcal S}_{-i}\)。加入位置为 \(\boldsymbol\xi_{\rm new}\)、超参数 \(\gamma_{\rm new}>0\) 的原子 \(\boldsymbol\phi_{\rm new}=\boldsymbol\phi(\boldsymbol\xi_{\rm new})\) 后，新活动集为 \(\bar{\mathcal B}=\mathcal B\cup\{(\boldsymbol\xi_{\rm new},\gamma_{\rm new})\}\)。于是把增广精度矩阵分块定义为

$$
\mathbf\Lambda_{\rm new}=\begin{bmatrix}\mathbf\Lambda_{\mathcal B}&\mathbf c\\\mathbf c^H&c\end{bmatrix},\tag{72}
$$

其中 \(\mathbf c\triangleq N_0^{-1}\mathbf\Phi_{\mathcal B}^H\boldsymbol\phi_{\rm new}\)、\(c\triangleq\gamma_{\rm new}^{-1}+N_0^{-1}\|\boldsymbol\phi_{\rm new}\|^2\)。我们要计算 \(\mathbf\Sigma_{\bar{\mathcal B}}^{\rm new}=\mathbf\Lambda_{\rm new}^{-1}\)。以 \(\mathbf\Sigma_{\mathcal B}=\mathbf\Lambda_{\mathcal B}^{-1}\)、\(\chi=c-\mathbf c^H\mathbf\Sigma_{\mathcal B}\mathbf c\) 为 \(\mathbf\Lambda_{\mathcal B}\) 的 Schur 补，利用 \(\mathbf\Lambda_{\rm new}\) 的分块求逆，有

$$
\mathbf\Sigma_{\bar{\mathcal B}}^{\rm new}=\mathbf\Lambda_{\rm new}^{-1}=\begin{bmatrix}\mathbf\Sigma_{\mathcal B}+\mathbf\Sigma_{\mathcal B}\mathbf c\chi^{-1}\mathbf c^H\mathbf\Sigma_{\mathcal B}&-\mathbf\Sigma_{\mathcal B}\mathbf c\chi^{-1}\\-\mathbf c^H\mathbf\Sigma_{\mathcal B}\chi^{-1}&\chi^{-1}\end{bmatrix},\tag{73}
$$

这证明了 (33a) 中追加一个原子后的后验协方差更新。

其次，增广后验均值满足

$$
\mathbf\Lambda_{\rm new}\boldsymbol\mu_{\bar{\mathcal B}}^{\rm new}=\begin{bmatrix}\mathbf\Lambda_{\mathcal B}&\mathbf c\\\mathbf c^H&c\end{bmatrix}\begin{bmatrix}\boldsymbol\mu_{\mathcal B}^{\rm new}\\\mu_{\rm new}\end{bmatrix}=\begin{bmatrix}\mathbf g_{\bar{\mathcal B}}\\\mathbf g_{\rm new}\end{bmatrix},\tag{74}
$$

其中 \(\mathbf g_{\rm new}=N_0^{-1}\boldsymbol\phi_{\rm new}^H\mathbf y\)。由 \(\boldsymbol\mu_{\mathcal B}=\mathbf\Sigma_{\mathcal B}\mathbf g_{\mathcal B}\) 与 (74) 的第一个分块行，得

$$
\boldsymbol\mu_{\mathcal B}^{\rm new}=\boldsymbol\mu_{\mathcal B}-\mu_{\rm new}\mathbf\Sigma_{\mathcal B}\mathbf c,\tag{75}
$$

再与 (74) 的第二个分块行结合得

$$
\mu_{\rm new}=\chi^{-1}\left(\mathbf g_{\rm new}-\mathbf c^H\boldsymbol\mu_{\mathcal B}\right).\tag{76}
$$

把 (75) 与 (76) 代回 (74)，即得完整增广后验均值 \(\boldsymbol\mu_{\bar{\mathcal B}}^{\rm new}\)，这证明了 (33b) 中的后验均值更新。我们进一步注意到，\(\mu_{\rm new}\) 的分子与分母可分别写为 \(\mathbf g_{\rm new}-\mathbf c^H\boldsymbol\mu_{\mathcal B}=N_0^{-1}\boldsymbol\phi_{\rm new}^H(\mathbf y-\mathbf\Phi_{\mathcal B}\boldsymbol\mu_{\mathcal B})=q_{-i}(\boldsymbol\xi_{\rm new})\) 与 \(\chi=\gamma_{\rm new}^{-1}+s_{-i}(\boldsymbol\xi_{\rm new})\)（在 \(\mathcal B=\bar{\mathcal S}_{-i}\) 的活动集精化下）；因此 \(\mu_{\rm new}=q_{-i}^{\rm new}/(\gamma_{\rm new}^{-1}+s_{-i}^{\rm new})\) 证明了 (35)。

## 参考文献（英文原书目）

[1] W.-X. Long, S. Ye, M. Moretti, M. Morelli, L. Sanguinetti, R. Chen, and C.-X. Wang, “Channel estimation for 6G near-field wireless communications: A comprehensive survey,” IEEE Commun. Surveys Tutorials, vol. 28, pp. 5496–5531, 2026.

[2] H. Lu, R. Zhang et al., “A tutorial on near-field XL-MIMO communications toward 6G,” IEEE Commun. Surveys Tutorials, vol. 26, no. 4, 2024.

[3] M. Cui and L. Dai, “Channel estimation for extremely large-scale MIMO: Far-field or near-field?” IEEE Trans. Commun., vol. 70, no. 4, pp. 2663–2677, 2022.

[4] J. Wang, H. Wang, J. Fang, L. Li, Z. Chen, and H. Li, “Compressive near-field wideband channel estimation for THz extremely large-scale MIMO systems,” IEEE Wireless Commun. Lett., 2026.

[5] Z. Yuan, Z. Zhou, F. Zhang, and W. Fan, “Low-complexity codebook design for near-field wideband precoding and its experimental validation,” IEEE Trans. Antennas Prop., 2026.

[6] K. Chen, C. Qi, C. Yuen, and O. A. Dobre, “Near-field wideband channel estimation with block sparsity,” IEEE Trans. Wireless Commun., vol. 25, pp. 15 977–15 992, 2026.

[7] Q. Feng, Y. Fang, M. Hua, C. Zhang, C. Li, Y. Huang, and L. Yang, “Near-field wideband channel estimation for XL-MIMO systems via denoising diffusion model,” arXiv preprint arXiv:2604.20494, 2026.

[8] Y. Li, A. Madhukumar, Z. Chu, G. Zheng, C.-X. Wang, and K. Yang, “Wideband hybrid-field THz UM-MIMO channel estimation: A dual-attention-aided deep-unfolded bayesian learning approach,” IEEE Trans. Commun., 2026.

[9] S. Thallapalli and D. Sen, “Gridless iterative near-field terahertz channel estimation for dual wideband UM-MIMO systems,” IEEE Commun. Lett., vol. 30, pp. 817–821, 2026.

[10] X. Tuo, Z. Chen, M.-M. Zhao, C. You, and M.-J. Zhao, “Near-field sparse bayesian channel estimation and tracking for XL-IRS-aided wideband mmwave systems,” IEEE Trans. Wireless Commun., vol. 25, pp. 19 209–19 225, 2026.

[11] S. Yang, C. Xie, W. Lyu, B. Ning et al., “Near-field channel estimation for extremely large-scale reconfigurable intelligent surface (XL-RIS)-aided wideband mmwave systems,” IEEE J. Sel. Areas Commun., vol. 42, no. 6, pp. 1567–1582, 2024.

[12] M. E. Tipping and A. C. Faul, “Fast marginal likelihood maximisation for sparse Bayesian models,” in International workshop on artificial intelligence and statistics. PMLR, 2003.

[13] R. R. Pote and B. D. Rao, “Theory and Practice of Light-Weight Sequential SBL Algorithm: An Alternative to OMP,” IEEE Trans. Signal Process., 2025.

[14] W. Huang, L. Xu, H. Zhang, C. Kai, C. Li, and Y. Huang, “Structured OFDM modulation for XL-MIMO system with dual-wideband effects,” IEEE Trans. Wireless Commun., vol. 24, no. 2, pp. 1510–1525, 2024.

[15] Z. Cheng, S. Zhang, B. Di, and Z. Han, “Multi-user holographic beamforming for near-field wideband OFDM communications,” IEEE Trans. Wireless Commun., 2026.

[16] Z. Wang, X. Mu, and Y. Liu, “Beamfocusing optimization for near-field wideband multi-user communications,” IEEE Trans. Commun., vol. 73, no. 1, pp. 555–572, 2024.

[17] W. Ding, G. Yang, J. Liu, Y.-C. Liang, and Y. Liu, “Near-field wideband hybrid beamforming with deep reinforcement learning,” IEEE Trans. Wireless Commun., 2025.

[18] M. Liu, C. Pan, K. Zhi, H. Ren, and J. Wang, “Hybrid precoding design for near-field wideband THz systems with spatial non-stationarity,” IEEE Commun. Lett., vol. 28, no. 10, pp. 2372–2376, 2024.

[19] C. Hellings and W. Utschick, “On the inseparability of parallel MIMO broadcast channels with linear transceivers,” IEEE Trans. Signal Process., vol. 59, no. 12, pp. 6273–6278, 2011.

[20] D. P. Wipf and B. D. Rao, “Sparse Bayesian learning for basis selection,” IEEE Trans. Signal Process., vol. 52, no. 8, 2004.

[21] M. Yuan, H. Wang, H. Yin, and D. He, “Alternating optimization based hybrid transceiver designs for wideband millimeter-wave massive multiuser MIMO-OFDM systems,” IEEE Trans. Wireless Commun., vol. 22, no. 12, pp. 9201–9217, 2023.

[22] K. Shen, W. Yu, L. Zhao, and D. P. Palomar, “Optimization of MIMO device-to-device networks via matrix fractional programming: A minorization–maximization approach,” IEEE/ACM Trans. Net., vol. 27, no. 5, pp. 2164–2177, 2019.

[23] K. Zhi, C. Pan, G. Zhou et al., “Is RIS-aided massive MIMO promising with ZF detectors and imperfect CSI?” IEEE J. Sel. Areas Commun., vol. 40, no. 10, pp. 3010–3026, Oct. 2022.

[24] K. Shen, Z. Zhao, Y. Chen, Z. Zhang, and H. V. Cheng, “Accelerating quadratic transform and WMMSE,” IEEE J. Sel. Areas Commun., vol. 42, no. 11, pp. 3110–3124, 2024.

[25] K. Zhi, T. Yang et al., “Holographic MIMO multi-cell communications,” arXiv preprint arXiv:2502.16669, 2025.

[26] A. Alkhateeb, G. Leus, and R. W. Heath, “Limited feedback hybrid precoding for multi-user millimeter wave systems,” IEEE Trans. Wireless Commun., vol. 14, no. 11, pp. 6481–6494, 2015.

## 图注与表注

**图注：** 正文图 1–6 的图注已随文置于相应位置（图 1 见第 II 节，图 2 见第 VI-A 节，图 3 见第 VI-A 节，图 4、图 5 见第 VI-B 节，图 6 见第 VI-C 节）。原文无补充材料。

**表 I（原文 Table I）：** 每次迭代计算代价对比（见第 IV-E 节，已逐格转写）。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VII 节全部正文与子节（含 IV-A 的 1)–4) 子流程、V-A 的 1)–3) 子流程）、式 (1)–(76)（含附录 A–B 的全部证明式）、算法 1（31 步完整流程，含输入输出与全部循环/条件）、表 I（3 行逐格转写）、图 1–6 图注、附录 A–B 完整推导、参考文献 [1]–[26]（英文原条目，编号与原文一致）。原文无致谢段、无补充材料。全部公式均按 PDF 渲染页（p3–p10、p13）逐式核对后转写；算法 1 与表 I 经 p7、p8 渲染页核对。**原文疑点（已加注）：** 作者单位为华为技术杜塞尔多夫有限公司的三位作者（Tianyu Yang、Songyan Xue、Fangzhou Wu）仅给出两个邮箱地址 `{fangzhou.wu, xuesongyan}@huawei.com`，疑似漏列或邮箱名与作者姓名对应不一致，按原文照录。逐句逐式终校未做；供后续 QA 重点核对：式 (22)–(29) 中 \(\mathcal Z^\tau\) 的索引约定、式 (33a)–(35) 的分块后验更新符号、式 (48)–(58) 的 MM 更新系数。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
