---
layout: page
title: "部分相干维纳相位误差下的消息传递稀疏信道估计｜中文译稿（2026-10-30 补译，未逐句终校）"
permalink: /papers/translations/2026-10-16-phase-noise-message-passing-twc/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3d5e7096d44233e3/) · [IEEE DOI](https://doi.org/10.1109/TWC.2025.3607275)

# 部分相干维纳相位误差下基于消息传递的稀疏信道估计

**原题：** Message Passing-Based Sparse Channel Estimation Under Partially Coherent Wiener Phase Errors  
**作者：** Hamed Masoumi、Nitin Jonathan Myers  
**出处：** IEEE Transactions on Wireless Communications，2026 年，第 25 卷，第 3928–3943 页；DOI：10.1109/TWC.2025.3607275。用户上传的 TU Delft 发布 PDF 共 17 页，含封面。  
**译稿状态：** 分章节逐段翻译及原始公式、图表核对中；尚未通过全文验收。IEEE 版权及公开再传播许可需要另行核验；提供 PDF 不自动代表具有公开再发行授权。  
**本轮核对（2026-10-30）：** 已按 DOI 在 Semantic Scholar / OpenAlex / Unpaywall 上核验题名、作者、期刊与年份（与页面一致），但**本地工作副本中没有该论文 PDF**，TU Delft 开放仓储当前不可访问，文献表因而未能核对——**本轮不补录参考文献**，详见文末“核对与阻塞记录”。

## 摘要

压缩感知（compressive sensing，CS）是降低毫米波和太赫兹频段高维稀疏信道估计开销的关键技术。CS 信道测量常受到振荡器随机相位误差的影响，这些误差通常建模为维纳过程。忽略相位误差的 CS 算法无法准确恢复信道。在实际系统中，短时突发采集的一批测量内部相位误差相近，而不同测量批次之间的误差可能变化明显，形成**部分相干测量**。

本文提出一种消息传递信道估计算法，同时利用信道的稀疏结构和相位误差的维纳统计规律。为此，作者将相位误差吸收到稀疏信道向量中，使用三个隐变量分别刻画信道的支撑集、幅度和相位，推导隐变量间包含维纳相位噪声统计信息的消息更新。最后，通过交替优化，从消息传递得到的辅助向量中分离出稀疏信道与相位误差。仿真显示，所提方法在信道重构方面优于相应基线。

**关键词：** 相位噪声；毫米波；太赫兹；压缩感知；置信传播。

## I. 引言

压缩感知（CS）可以利用少量线性测量恢复稀疏向量 [1]，因而有望降低毫米波（mmWave）和太赫兹（THz）系统的高维空间信道估计开销 [2]。这些频段常使用大型天线阵列，信道维度可达数百甚至数十万 [3]。其空间信道在角度域具有稀疏结构，使 CS 得以使用少于传统方法的测量次数完成信道配置。

实际的空间信道测量往往依次采集，而振荡器频率和相位的随机扰动会带来相位噪声 [4]、[5]。这一影响在较高频率时更显著 [6]、[7]，使真实接收模型偏离仅包含加性噪声的标准 CS 线性模型。一方面，OMP 或消息传递等忽略相位误差的常规 CS 方法 [8]、[9]，在相位噪声较强时会失效；另一方面，传统相位噪声跟踪方法 [10]、[11] 未利用信道稀疏性，也不适于直接估计毫米波或太赫兹信道。

部分已有工作仅使用测量的幅度进行稀疏恢复 [12]–[14]；[15] 则采用稀疏自校准技术联合估计相位误差和稀疏信道，但未充分利用相位误差的时间相关性。较早的 [17] 使用扩展卡尔曼滤波跟踪相位变化，却只估计用于单流波束成形的一稀疏近似，而非信道的全部非零分量。因此，需要针对具有时间相关性的相位扰动，恢复整个稀疏信道。

在部分相干结构中，短测量批内部的相位误差几乎一致，不同批次则可能明显变化。[7] 的稀疏贝叶斯学习方法并未直接利用维纳结构。[18] 提出了两阶段部分相干压缩相位恢复（PC-CPR），先初始化、再联合修正相位偏移和信道。[19] 先以期望最大化广义近似消息传递（EM-GAMP）估计粗略信道，再估计相位偏移。[15] 则采用相位误差感知的匹配追踪和交替优化。然而，[7]、[15]、[18] 将信道假设为严格稀疏，[15]、[18]、[19] 还假定已知非零条目的数目。作者指出，已有方法尚未在跨多个部分相干批次的稀疏恢复中充分纳入维纳相位误差统计。

本文采用因子图（factor graph）与消息传递框架。未知的稀疏信道分量和相位误差被建模为变量结点，关于稀疏性、测量似然以及时间相关性的约束则表示为因子结点；通过在结点之间迭代交换消息（置信），计算各变量的边缘分布。作者分解相位偏移与角度域稀疏信道的后验联合概率密度，并采用可计算的消息近似，从而构造实际的信道估计算法。

**主要贡献：**（1）对每个信道分量引入支撑与幅度两个变量，再以第三个随机过程刻画信道相位与相位噪声的联合影响；（2）借助适应维纳相位噪声统计的高斯混合表示，推导可实现的消息近似；（3）通过交替优化分离相位误差与角度域信道，并在仿真中展示优于基线的重构误差。

作者还指出，其先前的多测量向量 AMP 研究 [22] 只利用不同辅助向量共享稀疏支撑的特征。本论文则同时利用**共享支撑、共享幅度及维纳相位演化**，构成不同于仅利用公共支撑的传统 MMV-AMP 的消息传递方法。

## II. 信道与系统模型

论文考虑一个窄带点对点多输入单输出（MISO）系统。发射端配备 $N\times N$、半波长间距的均匀平面阵列（UPA），接收端为单天线。将发射端与接收端之间的 $N^2$ 维窄带信道表示为矩阵 $\mathbf H\in\mathbb C^{N\times N}$。多用户扩展不在本论文讨论范围内。

### A. 信道模型

假定环境中有 $L$ 条传播射线。第 $\ell$ 条射线具有复增益 $\zeta_\ell$、方位发射角 $\vartheta_{a,\ell}$ 和俯仰发射角 $\vartheta_{e,\ell}$。定义波束空间角度 $\omega_{a,\ell}=\pi\sin\vartheta_{e,\ell}\sin\vartheta_{a,\ell}$、$\omega_{e,\ell}=\pi\sin\vartheta_{e,\ell}\cos\vartheta_{a,\ell}$ 以及 Vandermonde 向量：

$$
\mathbf a_N(\omega)=
[1,e^{j\omega},e^{j2\omega},\ldots,e^{j(N-1)\omega}]^{T}.
\tag{1}
$$

信道为：

$$
\mathbf H=\sum_{\ell=1}^{L}\zeta_\ell\mathbf a_N(\omega_{e,\ell})\mathbf a_N^{T}(\omega_{a,\ell}).
\tag{2}
$$

毫米波和太赫兹信道在角度域通常近似稀疏，故使用二维离散傅里叶变换（2D-DFT）得到波束空间表示：

$$
\mathbf H=\mathbf U_N\mathbf X\mathbf U_N,\tag{3}
$$

其中 $\mathbf U_N$ 是酉 DFT 矩阵，$\mathbf X$ 为近似稀疏矩阵。任务是根据受到相位扰动的测量恢复未知信道 $\mathbf H$。

### B. 测量帧结构

为了获得信道观测，系统发送 $B$ 个训练批次，每批包括同步字段及训练字段；每个批次使用 $M$ 个不同的波束成形器，获得 $M$ 次测量，帧结构类似 IEEE 802.11ad/ay。假定在这 $B$ 个批次期间，信道保持不变（块衰落），而相位噪声符合维纳过程。

每个批次内部的相位扰动较小，算法近似为常数 $\phi_b$；不同批次的 $\phi_b$ 则按维纳过程演化。文章的仿真仍采用批次内也变化的实际相位噪声，以检验这一近似。条件分布与观测写成：

$$
\phi_b\mid\phi_{b-1}\sim\mathcal N(\phi_{b-1},\sigma_{\rm pn}^{2}),
\qquad \phi_1=0,
$$

$$
y_b[m]=e^{j\phi_b}\langle\mathbf H,\mathbf P_b[m]\rangle+w_b[m],
\quad w_b[m]\sim\mathcal{CN}(0,\sigma^2).\tag{4}
$$

令 $\mathbf A_b$ 为第 $b$ 批次的 CS 测量矩阵，$\mathbf x=\operatorname{vec}(\mathbf X)$ 为角度域稀疏向量，将测量堆叠后得到：

$$
\mathbf y_b=e^{j\phi_b}\mathbf A_b\mathbf x+\mathbf w_b.\tag{5}
$$

目标是在已知 $\{\mathbf A_b,\mathbf y_b\}_{b=1}^{B}$ 及维纳相位噪声统计结构的条件下，联合估计稀疏 $\mathbf x$ 与相位误差 $\phi_b$。

## III. 基于消息传递的部分相干稀疏恢复算法概述

### A. 辅助向量的稀疏先验与相关结构

令 $\lambda$ 为信道在角度域中非零分量的比例，$\mu$ 为其非零复高斯分量的方差。采用 Bernoulli–Gaussian（BG）稀疏先验：

$$
p(x[n])=(1-\lambda)\delta(x[n])
+\lambda\mathcal{CN}(x[n];0,\mu).\tag{6}
$$

本文把每个测量批次的相位误差吸收到通道向量中，定义：

$$
\mathbf z_b=e^{j\phi_b}\mathbf x,\qquad b=1,\ldots,B.\tag{7}
$$

所有辅助向量与真实稀疏信道具有**同一支撑**和**相同逐元素幅度**，只在共同旋转相位上有所差异。原来的非线性测量模型因此转化为：

$$
\mathbf y_b=\mathbf A_b\mathbf z_b+\mathbf w_b,\qquad b=1,\ldots,B.\tag{8}
$$

先分别估计 $\mathbf z_b$，再根据它们恢复 $\mathbf x$ 和批次相位。论文将只利用共享支撑的 MMV-AMP 方案称为 SuppOnly；完整方法进一步使用共享幅度结构及相位噪声维纳统计信息。

对第 $n$ 个通道条目定义二值支撑 $s[n]\in\{0,1\}$、非负幅度 $r[n]$ 以及随批次变化的相位 $\Theta_b[n]$，则：

$$
z_b[n]=s[n]r[n]e^{j\Theta_b[n]}.\tag{9}
$$

条件概率 $p(z_b[n]\mid s[n],r[n],\theta_b[n])$ 为在零或 $r[n]e^{j\theta_b[n]}$ 处的 Dirac 点质量（式 (10)）。支撑的 Bernoulli 先验和幅度的 Rayleigh 先验分别是：

$$
p(s[n])=\lambda^{s[n]}(1-\lambda)^{1-s[n]},
\tag{11}
$$

$$
p(r[n])=\operatorname{Rayleigh}
(r[n];\sqrt{\mu/2}).\tag{12}
$$

真实的维纳相位演化为：

$$
\angle\mathbf z_b
=\angle\mathbf z_{b-1}
+\mathbf1_{N^2}\Phi_b,\qquad
\Phi_b\sim\mathcal N(0,\sigma_{\rm pn}^2).\tag{13}
$$

**这里的所有 $N^2$ 个信道分量共享一个相位噪声创新。** 为避免由这一全局随机变量造成过多因子图环路，论文采用松弛模型：

$$
\Theta_b[n]=\Theta_{b-1}[n]+\Phi_b[n],
\quad
\Phi_b[n]\overset{\rm iid}{\sim}
\mathcal N(0,\sigma_{\rm pn}^2).\tag{14}
$$

故而：

$$
p(\theta_b[n]\mid\theta_{b-1}[n])
=\mathcal N(\theta_b[n];
\theta_{b-1}[n],\sigma_{\rm pn}^2).\tag{15}
$$

该式是为了实现消息传递而采取的**统计近似**，不是完全准确的物理模型。作者后续通过秩一交替优化重新利用各分量共同旋转的真实结构。

### B. 因子图及消息调度

把所有观测似然、支持和幅度先验、辅助向量条件密度以及相位演化联合起来，后验分解为：

$$
\begin{aligned}
&p(\{\mathbf z_b\},\mathbf s,\mathbf r,
\{\boldsymbol\theta_b\}\mid\{\mathbf y_b\})\\
&\propto
\prod_{b=1}^{B}\prod_{m=1}^{M}
p(y_b[m]\mid\mathbf z_b)
\prod_{b=1}^{B}\prod_{n=1}^{N^2}
p(z_b[n]\mid s[n],r[n],\theta_b[n])\\
&\quad\times
\prod_{b=1}^{B}\prod_{n=1}^{N^2}
p(\theta_b[n]\mid\theta_{b-1}[n])
\prod_{n=1}^{N^2}p(s[n])p(r[n]).
\end{aligned}\tag{16}
$$

该分解形成 $B$ 个测量批次平面：单个平面内部的密集线性观测用 AMP 求解；平面之间通过共同支撑、共同幅度以及维纳相位转移连接。**图 3、表 I** 分别给出因子图结点与各因子概率表达。

**图 4** 将每轮消息调度分成四段：平面内（intra-plane）AMP，根据批次观测估计辅助向量；平面外（out-of-plane）根据其后验推导支撑、幅度和相位概率；平面间（inter-plane）利用维纳转移传播这些信息；进入下一平面（into-plane）将传播来的概率作为下一轮 AMP 的先验。前向流程从批次 1 传播至批次 $B$；如果全部观测已知，还可从后向前反向传播，反复修正早期批次的辅助后验。

在完成消息传递后，堆叠得到：

$$
\widehat{\mathbf Z}=
[\widehat{\mathbf z}_1,\ldots,\widehat{\mathbf z}_B]
\in\mathbb C^{N^2\times B}.
$$

由于真实无噪声矩阵 $\mathbf Z=\mathbf x(e^{j\boldsymbol\phi})^T$ 为秩一，作者通过：

$$
\{\widehat{\mathbf x},\widehat{\boldsymbol\phi}\}
=\arg\min_{\mathbf x,\boldsymbol\phi}
\|\widehat{\mathbf Z}-
\mathbf x(e^{j\boldsymbol\phi})^T\|_F\tag{17}
$$

恢复稀疏信道及批次相位。

**算法 1：交替恢复算法。** 初始化 $\widehat{\mathbf x}^{(1)}=\widehat{\mathbf z}_1$；固定 $\mathbf x$ 时，估计使每个 $\widehat{\mathbf z}_b$ 与公共信道最接近的相位 $\widehat\phi_b$；再固定相位，将 $\widehat{\mathbf z}_b e^{-j\widehat\phi_b}$ 对批次平均，更新公共 $\widehat{\mathbf x}$。重复不超过 $T_{\max}$ 轮输出估计。

## IV. 所提出算法中的消息计算

### A. AMP 子图消息

首批消息无历史先验，Bernoulli 支撑、Rayleigh 幅度与均匀相位共同形成 BG 密度：

$$
\nu_{f_1[n]\to z_1[n]}
=(1-\lambda)\delta(z_1[n])
+\lambda\mathcal{CN}(z_1[n];0,\mu).\tag{18}
$$

在密集线性测量因子图中，普通和积算法要求求解高维积分。AMP 利用中心极限定理与泰勒展开，把测量因子送往变量的消息近似为高斯，减少计算量 [9]。设平面 $b$ 的 AMP 局部后验均值、方差分别为 $e_b[n]$、$c_b[n]$，则离开 AMP 子图的消息为：

$$
\nu_{z_b[n]\to f_b[n]}
=\mathcal{CN}(z_b[n];e_b[n],c_b[n]).
\tag{19}
$$

对于第二批及之后的批次，AMP 的进入先验会成为融合过去信息的 Bernoulli–Gaussian mixture，而不再只是普通 BG。

### B. 幅度消息

离开平面的幅度消息 $\nu_{f_b[n]\to r[n]}$ 是将支撑消息、复高斯后验与相位消息相乘，再对支撑和相位求积分得到的（原文式 (20)）。当 $s[n]=0$ 时，该密度在 $r[n]$ 上产生常数项，不能直接归一化。因此引入 $s[n]\in\{\epsilon,1\}$、$\epsilon\to0$ 的连续近似，定义混合权重：

$$
\Omega(\overleftarrow\pi_b[n])
=\frac{\epsilon^2\overleftarrow\pi_b[n]}
{1-\overleftarrow\pi_b[n]+
\epsilon^2\overleftarrow\pi_b[n]}.
\tag{21}
$$

式 (22) 给出对应的适当归一化消息。为了得到可计算形式，作者暂时假设相位均匀分布；这一假设对首批准确，对后续批次则忽略了维纳相位的集中性。积分后得到带第一类修正贝塞尔函数 $I_0,I_1$ 的表达，再使用高斯密度近似：

$$
\nu_{f_b[n]\to r[n]}
\propto \mathcal N(r[n];t_b[n],v_b[n]).
\tag{25}
$$

$t_b[n]$、$v_b[n]$ 由原文式 (23)、(24) 的闭式表达得到，具体推导见附录 A。

进入第 $b$ 批次的幅度消息将 Rayleigh 先验与先前 $b-1$ 个高斯消息相乘：

$$
\nu_{r[n]\to f_b[n]}
=p(r[n])\prod_{\ell=1}^{b-1}
\nu_{f_\ell[n]\to r[n]}\tag{26}
$$

并可化为正半轴上的：

$$
\nu_{r[n]\to f_b[n]}
\propto r[n]\mathcal N(r[n];\eta_b[n],\gamma_b[n]),
\quad r[n]\ge0.\tag{27}
$$

$\eta_b,\gamma_b$ 是高斯精度加权的统计参数，具体见原文式 (28)。

### C. 支撑消息

支撑消息要求对 $z_b[n]$、$r[n]$ 和 $\theta_b[n]$ 积分（式 (29)）。令 $\vec\pi_b[n]$ 表示当前平面对“$s[n]=1$”的置信概率，则：

$$
\vec\pi_b[n]=
\frac{[\nu_{f_b[n]\to s[n]}]_{s[n]=1}}
{[\nu_{f_b[n]\to s[n]}]_{s[n]=1}
+[\nu_{f_b[n]\to s[n]}]_{s[n]=0}}.
\tag{30}
$$

作者用 Rice 分布拟合式 (27) 的幅度先验，采用相同的均值、方差匹配得到参数 $\rho_b,\tau_b$；Rice 密度见式 (31)，使用 Rice 分布与 AMP 复高斯似然推导 $\vec\pi_b[n]$ 的计算近似（式 (32)，推导见附录 B）。

对新批次，先前所有支撑置信概率通过贝叶斯乘积组合：

$$
\overleftarrow\pi_b[n]=
\frac{\lambda\prod_{\ell=1}^{b-1}\vec\pi_\ell[n]}
{(1-\lambda)\prod_{\ell=1}^{b-1}
(1-\vec\pi_\ell[n])
+\lambda\prod_{\ell=1}^{b-1}\vec\pi_\ell[n]}.
\tag{33}
$$

因此每批都不会独立地丢弃前一批可能提供的稀疏支撑证据。

### D. 相位消息

为处理时间相关性，作者进一步假设 AMP 当前相位估计无误，等于复均值 $e_b[n]$ 的相位：

$$
\nu_{f_b[n]\to\Theta_b[n]}
=\delta(\theta_b[n]-\angle e_b[n]).
\tag{34}
$$

与维纳转移密度卷积，下一批的相位先验成为：

$$
\nu_{\Theta_b[n]\to f_b[n]}
\propto\mathcal N(\theta_b[n];
\varphi_b[n],\sigma_{\rm pn}^2),
\quad \varphi_b[n]=\angle e_{b-1}[n],
\tag{36}
$$

即围绕上一批相位估计的高斯分布。此近似减少消息表达的复杂度，但忽略了 AMP 相位均值自身的不确定性，可能在低信噪比及强相位扰动下失效。

### E. 进入下一平面的 Bernoulli–Gaussian mixture（BGM）

考虑所有历史批次的支撑、幅度及相位先验后，新批辅助信道的非零概率质量分布于复平面中的**环形扇区**，其半径由共同幅度确定，角度由维纳噪声的扩散决定。

由于直接积分求精确密度很困难，作者近似为一个零点质量和多个复高斯分量的混合分布。第 $k$ 个复高斯均值具有：

$$
\beta_{b,k}[n]
=\overline\beta_b[n]
e^{j\angle\beta_{b,k}[n]}.
\tag{37}
$$

各分量均值分布于同一半径上，公共协方差记为 $\xi_b[n]$；原文式 (38)–(43) 给出半径、方差、混合数 $K_b[n]$ 以及各分量的相位间距。混合分量越靠近预测的中心相位，权重越高。未归一化权重按照以中心分量为均值的高斯密度计算（式 (44)），最终归一化：

$$
\omega_{b,k}[n]
=\frac{\widetilde\omega_{b,k}[n]}
{\sum_{k'=1}^{K_b[n]}
\widetilde\omega_{b,k'}[n]}.
\tag{45}
$$

**图 5** 比较真实环形扇区概率密度及 BGM 近似；随着 BGM 分量增加，近似精度通常提高，但计算量也增加。**图 6** 显示最大分量数超过 60 后 NMSE 基本不再变化，因此文中截断为 60。

**算法 2：一次前向消息传递。** 对第一个批次使用 BG-AMP，计算初始支撑概率与幅度统计；对后续每批，以式 (33) 传播支撑先验，以式 (36) 传播相位先验，以式 (27) 传播幅度先验；按式 (37)–(45) 建立 BGM 先验后执行 AMP；用得到的复高斯后验重新计算支撑、幅度、相位信息，直到第 $B$ 批；最后调用算法 1 完成公共信道恢复。向后传播可按对应步骤倒序操作。

若每平面需要 $T_{\rm amp}$ 次 AMP、执行 $T_{\rm fb}$ 次前后传播，整体复杂度为：

$$
O(T_{\rm fb}BT_{\rm amp}MN^2).
$$

主要成本是各平面矩阵—向量运算；相较于直接联合 $BM$ 个观测执行 AMP，增加的传播轮次数约带来 $T_{\rm fb}$ 倍开销。但该算法对每批测量数 $M$、阵列信道维度 $N^2$ 的依赖仍为线性。

## V. 仿真结果

### A. 系统设置及基线

发射端采用 $16\times16$ 均匀平面阵列，载频 60 GHz，收发距离 15 m；默认振荡器在距载波 $f_m=1$ MHz 处的相位噪声 PSD 为 $-101.7$ dBc/Hz。每次训练测量耗时 $\Delta_{\rm bf}=128$ ns，相邻批次同步间隔 $\Delta_{\rm sf}=44\,\mu$s，对应相位增量方差 $\sigma_{\rm pn}^2\approx0.12$。默认 $B=4$ 批。

基站波束训练矩阵来自 $16\times16$ 完美二元阵列的随机循环移位，训练序列产生约 20 dB 扩频增益。使用 NYU 模拟器生成的 100 个城市微蜂窝视距（urban micro LoS）信道实例，角度偏离离散网格，因而波束空间信道仅**近似**而非严格稀疏。仿真相位噪声在批次内部也随时间演化，比算法使用的“每批次常相位”近似更真实。

从样本的最强分量提取包含总信道能量 95% 的支持集，计算稀疏比例 $\lambda$ 与非零条目的方差 $\mu$，分别得到 $\lambda\approx0.07$、$\mu\approx13.3$。设置交替恢复轮数 $T_{\max}=5$、支撑松弛参数 $\epsilon=10^{-6}$，剔除相对最强权重小于 $10^{-3}$ 的 BGM 分量。

重构质量以 $\widehat{\mathbf H}=\mathbf U_N\widehat{\mathbf X}\mathbf U_N$ 与真实信道之间的 NMSE 评价：

$$
\mathrm{NMSE}=
\mathbb E\left[
\frac{\|\mathbf H-\widehat{\mathbf H}\|_F^2}
{\|\mathbf H\|_F^2}\right].
$$

基线包括：SuppOnly（仅传播共享支撑的 MMV-AMP）；SparseLift（提升矩阵稀疏恢复）；PCMP1/PCMP2（需已知非零个数，分别设置为 19 和 38 的相位感知匹配追踪）；IgnoredPN（忽略相位误差并把全部批次观测堆叠做 AMP）；ZeroPN（无相位噪声理想参考）；Batch1（只利用第一批测量）。

### B. 相位噪声和迭代次数

**图 7：** NMSE 随完整消息流程推进而改善，在约两次前向流程后趋于稳定，因为此时各平面已使用全部 $B$ 批次观测。继续反复传播通常没有明显额外收益。

**图 8：** 当振荡器相位噪声 PSD 在测试频偏处满足 $L(f_m)<-96$ dBc/Hz 时，本文完整方法通常优于 SuppOnly 和 SparseLift。但当 $L(f_m)>-96$ dBc/Hz，批次内相位变化过强，使共同幅度与预测相位置信信息不可靠；将不准确消息传播到下一批可能比只传播共同支撑更差。若相位噪声很弱（约小于 $-108$ dBc/Hz），直接忽略相位噪声并堆叠观测的 IgnoredPN 又可能优于完整算法。故其优势仅在特定硬件相位噪声区间内成立。

### C. 测量数和信噪比

**图 9：** 在 $B=4$、SNR $=-10$ dB 下，完整方法相对 SuppOnly 获得约 0.6 dB 的 NMSE 改善，说明共享幅度与相位相关性确实具有额外价值。但随着每批次测量数 $M$ 增大，优势缩小；当 $M\ge95$ 时几乎没有改善，因为测量批次越来越长，“批内常相位”假设受到破坏。

**图 10：** 在 $M=80$ 条件下，本文方法特别是在较低 SNR 区域优于多数基线。然而，真实批内相位变化会使高 SNR 产生误差地板；与人为设定批内完全常相位的情况相比，其造成约 0.9 dB 的高 SNR NMSE 损失。即使批内完全常相位，式 (14) 中独立相位创新的松弛仍可能造成性能饱和。针对严格稀疏且已知稀疏度设计的 PCMP 在本论文近似稀疏信道上表现较差。

### D. 超参数失配

**图 11：** 将先验 $\lambda,\mu$ 分别扰动为 $(1+\varepsilon)\lambda$、$(1+\varepsilon)\mu$（$\varepsilon\in[-1,1]$），本文方法比部分基线具有更好的 NMSE 稳健性。这一结果不等于方法已解决错误噪声模型、长批次相位漂移或动态信道中的全部鲁棒性问题。

## VI. 潜在研究方向

本文每批采集 $M$ 次测量、共计 $BM$ 次。$B$ 很大时，训练和计算开销显著增加；只用首批则观测不足。作者提出未来可采用**逐批递减的测量预算**：首批较多测量提供可靠的初始稀疏信道估计，随后只用少量具有相位偏移的观测修正它。形式上可令不同 $\mathbf A_b$ 具有逐渐减少的行数；最优预算调度尚待研究。

论文还假设各批次之间真实信道不变。另一方向是将框架扩展到真实信道也随时间变化的**信道跟踪**，使用前一批次的支撑、幅度、相位后验作为下一批先验，同时处理信道演化和相位噪声，本文不涉及此推广。

## VII. 结论

作者提出针对部分相干维纳相位误差的消息传递稀疏信道估计方法，先把批次相位误差吸收到辅助稀疏向量中，利用共同支撑、共同幅度、维纳相位统计和 AMP 完成辅助向量恢复；再通过秩一矩阵的交替优化分离稀疏信道与批次相位。结果显示在所测试振荡器、测量批次与信道参数范围内比相应基线具有更低 NMSE，但受到批次内相位近似及跨分量相位松弛的限制。

## 附录与参考文献说明

**附录 A** 从式 (22) 推导带贝塞尔函数的幅度消息，并利用第一类修正贝塞尔函数恒等式：

$$
\int_{-\pi}^{\pi}
\exp(\operatorname{Re}\{\kappa e^{-j\theta}\})\,d\theta
=2\pi I_0(|\kappa|)
\tag{47}
$$

推导式 (23)、(24) 的消息均值和方差。**附录 B** 推导 Rice 幅度近似与支撑概率的闭式组合式 (32)。**附录 C** 根据复平面环形扇区的高斯覆盖几何推导混合分量数与均值相位（式 (42)、(43)，图 12）。

本译稿现已覆盖**摘要、正文 I–VII 节、算法 1–2、表 I 和图 1–11 的中文正文与主要公式说明**，但部分完整概率密度及附录积分尚未逐式呈现，参考文献尚未逐条转录，且公开再传播许可有待核验；**因此仍不属于已验收的全文翻译**。

## 参考文献

**状态：未补齐（无法核对源文献表，不编造书目）。** 转录参考文献需要该论文 PDF 的 References 部分。本轮已尝试获取合法开放版本，但本地与公开渠道均未取得可核验的全文（过程见下节），因此按项目规则（无法核对时明确写"未核对"、禁止编造书目）**不提供任何书目条目**。页面正文中的 `[1]`—`[19]` 等编号引用保持原样，其对应条目待取得原文后再逐条补录。

## 核对与阻塞记录（2026-10-30）

**一、题名/作者/出处核验（已完成）。** 以 DOI `10.1109/TWC.2025.3607275` 查询 Semantic Scholar Graph API，返回：题名 "Message Passing-Based Sparse Channel Estimation Under Partially Coherent Wiener Phase Errors"，作者 Hamed Masoumi、Nitin Jonathan Myers，期刊 IEEE Transactions on Wireless Communications，2026 年，DBLP 键 `journals/twc/MasoumiM26`，与页面元数据一致；OpenAlex 条目 `W4414196227` 亦一致。摘要文本与页面摘要一致（CS、Wiener 相位误差、部分相干、消息传递与交替优化）。

**二、开放获取状态（已查询）。** Unpaywall `is_oa=false`、`oa_status=closed`、`oa_locations` 为空；OpenAlex `open_access.is_oa=false`；Semantic Scholar `openAccessPdf.url` 为空。即 DOI 层面没有登记开放获取版本。

**三、TU Delft 开放仓储（存在记录，当前不可访问）。** 检索到 TU Delft Repository 记录 `uuid:ff6aca90-89a4-44db-b95f-94e342502345`（题名与上文一致），以及候选文件 `File_90af1d46-…`、`File_134cc986-…`、`File_d056784d-…`。本轮通过本机代理多次尝试（curl，HTTP/HTTPS，60–75 秒超时）：`repository.tudelft.nl` 记录页与文件端点均超时（无响应），`research.tudelft.nl` 返回 403（Cloudflare 拦截），`r.jina.ai` 读取服务对同一 URL 亦报 TimeoutError，Internet Archive Wayback CDX 无该记录/文件的快照。也就是说，**该仓储站点当前从本机网络路径不可达**，不是页面上的链接失效。

**四、本地检索（未命中）。** ① `...\translation-audit\sources\` 无该文抽取文本；② `C:\Users\DELL\Desktop\每日推荐` 全部 398 个 PDF 逐份读取首页文本，无 "Wiener / Phase Error / Masoumi" 命中；③ 对 `C:\Users\DELL\Documents`、`C:\Users\DELL\Downloads` 递归检索文件名含 phase/Wiener/message/sparse/TWC/Myers/Masoumi 的 PDF，只有其他 TWC 论文（如 `TWC3649587.pdf`、`twc.2026.3666648.pdf` 等），并非本篇；④ `translation_queue\source_pdfs` 中两个 PDF 分别为 "Posterior Sampling: A Policy Gradient Viewpoint" 与 "A Tutorial on Environment-Aware Communications via Channel Knowledge Map"，均非本篇。

**五、结论与后续。** 页面所称"用户上传的 TU Delft 发布 PDF 共 17 页，含封面"在本轮工作副本中**不可得**（可能未随之保存或已被清理）。因此：① 参考文献无法核对，未补录；② 附录 A–C 的完整概率密度与积分未能按原文逐式补入（页面只保留了已知的式 (47) 贝塞尔恒等式与文字说明）；③ 不排除该 TU Delft 记录在站点恢复后可取得 accepted manuscript（绿 OA 版本），届时可据其补录书目与附录细节。**在此之前，本页保持"未验收"状态，且明确标注参考文献未核对。**

{% endraw %}
