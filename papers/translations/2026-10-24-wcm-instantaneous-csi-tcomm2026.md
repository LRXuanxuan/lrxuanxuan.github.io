---
layout: page
title: "无线信道地图赋能的高移动性瞬时 CSI 获取｜中文全文译文"
permalink: /papers/translations/2026-10-24-wcm-instantaneous-csi-tcomm2026/
math: true
toc: true
---

[← 返回论文库](/papers/) · [原文 DOI](https://doi.org/10.1109/TCOMM.2026.3663282)

# 无线信道地图赋能的高移动性场景下瞬时信道状态信息获取

**原题：** Wireless Channel Map Enabled Instantaneous Channel State Information Acquisition in High-Mobility Scenarios  
**作者：** Yinglan Bu、Cheng-Xiang Wang、Chen Huang、Shuaifei Chen、Junling Li、Jianghan Ji、Yunfei Chen  
**期刊：** *IEEE Transactions on Communications*, Vol. 74, 2026, pp. 4583–4598. DOI: [10.1109/TCOMM.2026.3663282](https://doi.org/10.1109/TCOMM.2026.3663282)。  
**译稿范围：** 原 PDF 16 页，摘要、正文 I–VI、公式（1）–（87）、定理、算法 1、表 I–II、图 1–12 图注、附录 A–B、37 条参考文献、作者简介与出版附注。遵循原文段落结构；行内公式保留行内排版。

## 摘要（Abstract）

高频段下的高移动性和大带宽应用使得双选择性信道的获取成本高昂且复杂，因为快衰落信道会导致导频开销和载波间干扰急剧增加。为了支持后续能够减轻沉重导频负担的高精度信道预测，需要对复信道增益（Complex Channel Gain，CG）和载波频率偏移（Carrier Frequency Offset，CFO）进行准确估计。新兴的无线信道地图（Wireless Channel Map，WCM）技术能够利用定制化的信道参数，在数字空间中近似再现实际传播环境，从而为准确估计复信道增益和载波频率偏移提供机会。本文提出了一种基于无线信道地图的先验分布构建方法，以及一种复信道增益与载波频率偏移联合估计算法。具体而言，基于非均匀时延域离网格信道表示，构建了针对复信道增益的参数化线性估计问题，并利用无线信道地图提供的角度–时延功率谱密度信息构建更加符合实际情况的先验分布，在贝叶斯推断框架下求解联合估计问题。仿真结果表明，所提出的算法优于现有基线方法，在估计精度和误码率（Bit Error Rate，BER）方面均具有更好的性能。同时验证了所提出的基于无线信道地图的算法能够很好地适应不同的无线信道地图精度，并且对不同用户移动速度具有较强的鲁棒性。

**关键词（Index Terms）**——信道估计、压缩感知、高移动性、载波间干扰、无线信道地图。

## I. 引言（INTRODUCTION）

高频率和大带宽能够实现高速率传输。厘米波和毫米波已经被纳入第三代合作伙伴计划（Third Generation Partnership Project，3GPP）标准 [1]。此外，卫星通信、高速铁路通信等多种新兴通信技术正在成为未来三维（Three-Dimensional，3D）覆盖通信网络的必要组成部分 [2]、[3]，使得移动性成为一个突出特征。这些技术的实现给信道获取带来了巨大挑战，因为移动用户设备（User Equipment，UE）和运动散射体的高移动性所引起的严重多普勒频移（Doppler Frequency Shift，DFS），将导致多载波系统中出现快速信道老化和载波间干扰（Inter-Carrier Interference，ICI）。事实上，ICI 也能够提供额外的多普勒分集，从而改善系统性能 [4]。然而，这需要空间–时间–频率域中的全维信道信息作为支持，并且频繁的信道探测将带来巨大的导频开销。对关键的信道参数——复信道增益（CG）和载波频率偏移（CFO）——进行良好估计，可以支持后续高精度的基于模型的信道预测 [5]，进而通过延长信道探测周期来帮助减轻沉重的导频负担。

CFO 包含两个主要组成部分：发射机与接收机振荡器之间的频率失配，以及多普勒频移。CFO 可以通过利用特殊信号结构的盲估计方法获得 [6]，也可以通过冗余采样进行测量 [7]–[11]。针对复信道增益和 CFO 的高效联合估计方法也已经得到了广泛研究。在文献 [7] 和 [8] 中，联合估计算法采用最大似然估计器（Maximum Likelihood Estimator，MLE），分别通过期望最大化（Expectation-Maximization，EM）方法和坐标下降优化来求解联合估计问题。在文献 [9] 中，提出了另一种用于联合估计的最大似然估计器，并通过斜非正交投影进行求解。此外，文献 [10] 和 [11] 还分别采用扩展卡尔曼滤波和粒子滤波方法求解此类联合估计问题。然而，在这些研究中，所考虑的 CFO 仅指振荡器频率失配，而多普勒频移大多被包含在时变信道中，因此无法将其提取出来用于后续的时域信道预测。此外，现有联合估计算法通常基于简化的信道模型提出，例如 Jakes 信道模型，而这些模型无法反映实际的无线传播环境。

可以利用信道稀疏性来降低计算复杂度并提高估计精度。例如，文献 [12] 和 [13] 通过构建具有隐马尔可夫先验的贝叶斯网络，分别分析并利用天线域和角度域中的结构化信道稀疏性，以提高估计精度和效率。对于高移动性场景，文献 [14]–[16] 提出了一种分布式压缩感知（Distributed Compressive Sensing，DCS）方法及其改进方法，将双选择性信道估计重新表述为时延域稀疏系数恢复问题，并利用同时正交匹配追踪和平滑处理实现较高的估计精度。尽管 DCS 方法易于实现，但它无法估计多个随机变量，而且所获得的信道仅适用于相邻符号。另一种称为稀疏贝叶斯学习（Sparse Bayesian Learning，SBL）的方法，可以通过结合特定域中的多径稀疏性先验，实现更高的估计精度 [17]。然而，由于实际信道路径数量未知，因此需要将多径分量的连续参数（例如角度）离散化，以便分析相应域中的稀疏性，这又会引入分辨率受限的问题。因此，文献 [18] 提出了一种基于模型的离网格信道表示方法，利用基于几何的随机信道模型（Geometry-Based Stochastic Channel Model，GBSM）来分辨角度域中的稀疏多径。文献 [19] 基于 SBL，利用这种离网格表示提出了一种联合估计算法，以同时获取窄带快衰落信道的复信道增益和多普勒频移，并通过利用大规模 MIMO 波束成形，为该场景提出了一种多普勒补偿方法。然而，现有基于 GBSM 的解决方案仅考虑二维（Two-Dimensional，2D）终端运动轨迹，而往往忽略散射体的移动性。对于存在 ICI 的双选择性信道，包含多普勒频移的 CFO 与双选择性信道的联合估计问题仍有待解决。

利用更加精确的信道先验信息，可以获得更好的估计性能 [20]。额外的先验知识有助于改善信道估计性能，文献 [21] 已经验证，利用信道功率地图能够实现更加准确的信道估计和更高的传输效率。基于插值与数据/模型双驱动相结合的方法，文献 [22] 和 [23] 分别构建了静态信道功率地图和信道增益地图，并通过均方误差（Mean Square Error，MSE）性能验证了其精度。随着通信感知一体化（Integrated Sensing and Communications，ISAC）的出现，文献 [24] 提出了一种能够描述动态无线传播环境的无线信道地图（WCM），它可以以定制化信道参数的形式提供必要的先验信息。文献 [25] 基于半确定性信道建模提出了一种详细的 WCM 构建方法，通过利用信道测量数据进行环境参数校准，以及对周围散射体进行识别和定位，实现动态大尺度信道参数的精确位置标注。对于建筑物等静态簇或仅与 UE 位置有关的视距（Line-of-Sight，LOS）分量，采用射线追踪方法并进行离线训练 [26]。动态簇产生的多径分量则根据基于簇的信道建模方法生成，其中动态簇通过点云和计算机视觉方法进行识别与定位。文献 [27] 进一步证明，该方法能够实现与实际测量数据高度一致的大尺度信道参数数字化映射，例如时延功率谱密度（Power Spectral Density，PSD）。

本文提出了一种基于 WCM 的复信道增益与 CFO 联合估计算法，同时提出了一种基于 WCM 的先验分布构建方法，以提高联合估计的精度并改善误码率性能。本文的主要贡献总结如下。

- 通过采用更加符合实际的信道模型，基于非均匀离网格信道表示，将考虑 ICI 的双选择性信道复信道增益与 CFO 联合估计表述为一个动态压缩感知问题。不同于已有文献中考虑的二维终端运动轨迹，这种联合估计问题能够处理三维终端运动轨迹以及周围散射体的移动性。此外，与此前仅将本地振荡器不稳定性纳入 CFO 的研究不同，所提出方案中的 CFO 估计还包含通常在不同信道路径上有所差异的多普勒频移，从而为后续基于模型的信道预测做好准备。
- 利用 WCM 提供的角度–时延功率谱密度和终端移动性信息，提出了一种针对复信道增益和 CFO 等关键参数的先验分布构建方法。该方法能够从 WCM 提供的遍历性信道信息中提取角度–时延域信道稀疏性、可能的多径方向等关键先验知识，从而更加准确地描述动态传播环境。基于更加准确的先验分布，在贝叶斯推断框架下利用 MM 算法求解联合估计问题，并据此提出一种高效的复信道增益与 CFO 联合估计算法。
- 仿真结果表明，即使 WCM 存在信息损失，所提出的基于 WCM 的算法仍然能够比不使用 WCM 的已有方法取得更高的估计精度和更低的 BER。分析了 WCM 精度和 UE 速度等关键参数对所提出算法性能的影响。此外，研究表明所提出算法对不同 UE 速度具有鲁棒性，并验证和分析了考虑 ICI 的全维信道估计在高速运动时带来的额外多普勒分集增益。同时还证明，当先验分布更加符合实际传播环境时，可以获得更好的通信性能。

本文其余部分安排如下。第二节介绍考虑 ICI 的导频传输模型以及非均匀离网格信道表示。第三节给出基于 WCM 构建关键信道参数先验分布的详细过程。第四节基于重新表述的导频传输模型，构建针对复信道增益的参数化线性估计问题，并详细介绍所提出的联合估计算法。第五节和第六节分别给出仿真结果与结论。主要缩写的定义列于表 I。

**表 I　本文所用缩写的定义**

| 缩写 | 定义 | 缩写 | 定义 |
|---|---|---|---|
| CG | 信道增益 | CFO | 载波频率偏移 |
| DFS | 多普勒频移 | ICI | 载波间干扰 |
| DCS | 分布式压缩感知 | WCM | 无线信道地图 |
| UE | 用户设备 | BS | 基站 |
| GBSM | 基于几何的随机信道模型 | OFDM | 正交频分复用 |
| LCS | 局部坐标系 | GCS | 全局坐标系 |
| (N)LOS | （非）视距 | SBL | 稀疏贝叶斯学习 |
| CIR | 信道冲激响应 | CTF | 信道传递函数 |
| AoD | 离开方位角 | EoD | 离开俯仰角 |
| MM | 最大化–最小化（Minorization-Maximization） | PS | 参数集 |
| BER | 误码率 | NMSE | 归一化均方误差 |

**符号约定（Notations）：** $(\cdot)^{-1}$、$(\cdot)^H$ 和 $(\cdot)^T$ 分别表示求逆、共轭转置和转置。粗体小写字母表示向量，粗体大写字母表示矩阵。$\mathbf I_N$ 表示 $N\times N$ 单位矩阵。$\|\cdot\|$ 表示 Frobenius 范数。$|\mathcal A|$ 表示集合 $\mathcal A$ 的基数。$|x|$ 表示 $x$ 的绝对值。$\lceil\cdot\rceil$ 表示向上取整。符号 $\otimes$ 和 $\odot$ 分别表示 Kronecker 积和 Hadamard 积。$[\cdot]_{a=1,\ldots,A}$ 和 $[\cdot]_{a\in\mathcal A}$ 均表示沿第一维拼接。$[\mathbf x]_a$ 和 $[\mathbf X]_{a,b}$ 分别表示向量和矩阵的指定元素。$[\mathbf x]_{a_1:a_2}$ 表示第 $a_1$ 至 $a_2$ 个元素组成的向量，$[\mathbf X]_{a_1:a_2,b_1:b_2}$ 表示相应行列的子矩阵。$\operatorname{supp}(\cdot)$ 表示非零元素索引集，$\operatorname{diag}(\cdot)$ 表示对角算子。

## II. 系统模型（SYSTEM MODEL）

### A. 双选择性信道模型（Doubly-Selective Channel Model）

本文研究高移动性场景下宽带 MIMO 系统中的复信道增益与 CFO 联合估计问题，其中基站（Base Station，BS）和 UE 均配备半波长均匀平面阵列（Uniform Planar Array，UPA），并采用厘米波频段。基站 UPA 包含 $M=M_2\times M_1$ 个阵元，其中每列包含 $M_2$ 个阵元，每行包含 $M_1$ 个阵元。UE UPA 包含 $N=N_2\times N_1$ 个阵元，其中每列包含 $N_2$ 个阵元，每行包含 $N_1$ 个阵元。无线传播信道以及通信双方所配备的 UPA 如图 1 所示。基站阵列位于基站侧局部坐标系（Local Coordinate System，LCS）的 $xoz$ 平面上，而 UE 阵列位于 UE-LCS 的 $yoz$ 平面上，两者均采用右手坐标系。从 LCS 坐标到全局坐标系（Global Coordinate System，GCS）坐标的转换可参见文献 [28]。由于 UE 的姿态可以通过多种内置传感设备获取，因此假设基站能够及时获知 UE 的姿态。

**图 1.** 所考虑无线传播信道的示意图。

考虑一个带宽为 $f_s$ 的正交频分复用（Orthogonal Frequency-Division Multiplexing，OFDM）系统。每个 OFDM 符号包含 $P$ 个子载波，子载波间隔为 $\Delta f=f_s/P$。采样周期和一个符号内有效数据的持续时间分别记为 $T_s$ 和 $T_d$。数据块经过归一化的 $P$ 点快速傅里叶逆变换后，在时域中插入一个长度为 $T_{\mathrm{GI}}$、包含 $P_{\mathrm{GI}}$ 个采样点的循环前缀（Cyclic Prefix，CP），以避免频率选择性衰落引起的符号间干扰，并将其长度设置为大于最大多径时延。经过发射滤波器、无线传播信道和接收滤波器后，从时域序列中移除 CP，再通过 $P$ 点快速傅里叶变换将其转换回频域采样值。整个符号的持续时间可计算为 $T_{\mathrm{symb}}=T_d+T_{\mathrm{GI}}=(P+P_{\mathrm{GI}})T_s$。

假设在包含多次信道使用的一个时间块内，信道是准静态的 [29]、[30]，这意味着多径分量（包括多径角度、时延和功率）保持不变，因为移动设备在较大空间范围内运动时，其物理位置的变化通常慢于瞬时信道的变化。同时假设 UE 速度和散射体移动性在一个时间块内保持不变。本文考虑视距（LOS）场景。发射和接收滤波器在平坦频率响应区域内的频率响应均设为 1。

参考文献 [31] 和 [32] 提出的普适信道模型，在第 $q$ 个时间块的第 $i$ 个符号中，第 $m$ 个发射天线和第 $n$ 个接收天线之间的信道冲激响应（Channel Impulse Response，CIR）可表示为

$$
\begin{aligned}
h_{m,n,q,i}(t,\tau)
={}&\sum_{l_q=0}^{L_q}\rho_{l_q}
e^{jk_f((\hat{\mathbf r}^{U}_{l_q})^T\bar{\mathbf d}^{U}_n)}
e^{jk_f((\hat{\mathbf r}^{B}_{l_q})^T\bar{\mathbf d}^{B}_m)}
\\&\times e^{jk_f\nu^D_{l_q}t}\delta(\tau-\tau_{l_q}T_s).
\end{aligned}\tag{1}
$$

其中，$k_f=2\pi/\lambda_c$ 表示自由空间中的波数，$\lambda_c$ 表示载波频率 $f_c$ 对应的波长，$\delta$ 表示狄拉克 delta 函数，$\tau_{l_q}$ 表示相对于 $T_s$ 归一化的时延，$\bar{\mathbf d}^{U}_n$ 和 $\bar{\mathbf d}^{B}_m$ 分别表示 UE 和基站阵列在各自 LCS 中的阵元位置。需要注意，$\tau_{l_q}$ 不一定是整数。在第 $q$ 个时间块中，共有 $L_q+1$ 条传播路径。路径 $l_q$ 在 UE 和基站 LCS 中的球面单位向量分别记为 $\hat{\mathbf r}^{U}_{l_q}$ 和 $\hat{\mathbf r}^{B}_{l_q}$。若 $l_q=0$ 表示 LOS 分量，则它们可以写为

$$
\hat{\mathbf r}^{U}_{l_q}=
[\sin\phi^U_{E,l_q}\cos\phi^U_{A,l_q},
\sin\phi^U_{E,l_q}\sin\phi^U_{A,l_q},
\cos\phi^U_{E,l_q}]^T.\tag{2}
$$

$$
\hat{\mathbf r}^{B}_{l_q}=
[\sin\phi^B_{E,l_q}\cos\phi^B_{A,l_q},
\sin\phi^B_{E,l_q}\sin\phi^B_{A,l_q},
\cos\phi^B_{E,l_q}]^T.\tag{3}
$$

其中，$\phi^U_{A,l_q}\in(-\pi/2,\pi/2)$、$\phi^B_{A,l_q}\in(0,\pi)$，以及 $\phi^U_{E,l_q},\phi^B_{E,l_q}\in(0,\pi)$，分别表示路径 $l_q$ 在 UE/基站侧的离开方位角（Azimuth Angle of Departure，AoD）和离开俯仰角（Elevation Angle of Departure，EoD）。此外，$\rho_{l_q}$ 表示路径 $l_q$ 上的信道复包络，假设它在一个时间块内保持不变。路径 $l_q$ 上的多普勒频移可以表示为 [28]

$$
\nu^D_{l_q}=
(\hat{\mathbf r}^{U,\mathrm{GCS}}_{l_q})^T\bar{\mathbf v}_q+
\nu^S_{l_q}(1-\delta(l_q)).\tag{4}
$$

其中，$\bar{\mathbf v}_q=v_q[\sin\psi_{E,q}\cos\psi_{A,q},\sin\psi_{E,q}\sin\psi_{A,q},\cos\psi_{E,q}]^T$ 表示 UE 的速度向量，$v_q$ 为 UE 的移动速度，$\hat{\mathbf r}^{U,\mathrm{GCS}}_{l_q}$ 是对应 GCS 中的向量，$\psi_{A,q}$ 和 $\psi_{E,q}$ 分别表示 UE 运动方向的方位角和俯仰角。根据 GBSM 可知，多普勒频移由两个部分组成：一部分由移动终端引起，另一部分由运动散射体引起。后者如 3GPP TR 38.901 [28] 中所述，可以建模为 $\nu^S_{l_q}=2\omega_{l_q}v_{l_q}$，其中，$v_{l_q}$ 是一个在 $-v_{\mathrm{scatt}}$ 和 $v_{\mathrm{scatt}}$ 之间均匀分布的随机变量，$v_{\mathrm{scatt}}$ 表示最大杂波速度，$\omega_{l_q}$ 是一个表示散射体移动性的随机变量，服从均值为 $\zeta$ 的伯努利分布，而 $\zeta$ 则描述传播环境中散射体移动性的统计程度。以 $T_s$ 为时域采样间隔对信道进行采样后，路径 $l_q$ 的离散信道增益可以写为

$$
\begin{aligned}
\alpha^{l_q}_{m,n,q,i}(l)
={}&\rho_{l_q}
e^{jk_f((\hat{\mathbf r}^{U}_{l_q})^T\bar{\mathbf d}^{U}_n)}
e^{jk_f((\hat{\mathbf r}^{B}_{l_q})^T\bar{\mathbf d}^{B}_m)}
e^{jk_f\nu^D_{l_q}(T_sl+(i-1)T_{\mathrm{symb}})}.
\end{aligned}\tag{5}
$$

$$
\begin{aligned}
(\hat{\mathbf r}^{U}_{l_q})^T\bar{\mathbf d}^{U}_n
={}&\sin\phi^U_{E,l_q}\sin\phi^U_{A,l_q}(n_1-1)d^U_c\\
&+\cos\phi^U_{E,l_q}(n_2-1)d^U_r.
\end{aligned}\tag{6}
$$

$$
\begin{aligned}
(\hat{\mathbf r}^{B}_{l_q})^T\bar{\mathbf d}^{B}_m
={}&\sin\phi^B_{E,l_q}\cos\phi^B_{A,l_q}(m_1-1)d^B_c\\
&+\cos\phi^B_{E,l_q}(m_2-1)d^B_r.
\end{aligned}\tag{7}
$$

其中，$d^B_c/d^U_c$ 和 $d^B_r/d^U_r$ 分别对应基站/UE 天线阵列的列间距和行间距。进一步定义垂直和水平方向上的等效角度 $\varphi^B_{l_q}=\cos\phi^B_{E,l_q}d^B_r/\lambda_c$、$\vartheta^B_{l_q}=\sin\phi^B_{E,l_q}\cos\phi^B_{A,l_q}d^B_c/\lambda_c$、$\varphi^U_{l_q}=\cos\phi^U_{E,l_q}d^U_r/\lambda_c$ 和 $\vartheta^U_{l_q}=\sin\phi^U_{E,l_q}\sin\phi^U_{A,l_q}d^U_c/\lambda_c$，以描述三维空间中的路径方向。通信双方的导向向量可以重新写为

$$
\mathbf b^B_{l_q}=\mathbf u(\varphi^B_{l_q},M_2)^T\otimes\mathbf u(\vartheta^B_{l_q},M_1)^T.\tag{8}
$$

$$
\mathbf b^U_{l_q}=\mathbf u(\varphi^U_{l_q},N_2)^T\otimes\mathbf u(\vartheta^U_{l_q},N_1)^T.\tag{9}
$$

其中，$\mathbf u(\cdot)$ 定义为

$$
\mathbf u(\theta,C)=[1,e^{j2\pi\theta},\ldots,e^{j2\pi\theta(C-1)}]^T\in\mathbb C^C,\tag{10}
$$

它是关于 $\theta$ 的周期为 1 的周期函数。于是，式（5）中的信道增益可以重新写成矩阵形式：

$$
\bar{\mathbf H}^{l_q}_{q,i}(l)=
\rho_{l_q}e^{jk_f\nu^D_{l_q}(T_sl+(i-1)T_{\mathrm{symb}})}
(\mathbf b^B_{l_q})^T\mathbf b^U_{l_q}.\tag{11}
$$

为了更好地分析角度–时延 PSD 与路径方向之间的关系，定义一个 $N$ 点离散傅里叶变换（Discrete Fourier Transform，DFT）矩阵：

$$
\mathbf U^U=\mathbf U^U_{\mathrm{el}}\otimes\mathbf U^U_{\mathrm{az}}\in\mathbb C^{N\times N},\tag{12}
$$

$$
\mathbf U^U_{\mathrm{el}}=
\frac1{\sqrt{N_2}}\left[
\mathbf u\left(\frac{2a-1}{2N_2}-0.5,N_2\right)^T
\right]_{a=1,\ldots,N_2}
\in\mathbb C^{N_2\times N_2},\tag{13}
$$

$$
\mathbf U^U_{\mathrm{az}}=
\frac1{\sqrt{N_1}}\left[
\mathbf u\left(\frac{2b-1}{2N_1}-0.5,N_1\right)^T
\right]_{b=1,\ldots,N_1}
\in\mathbb C^{N_1\times N_1}.\tag{14}
$$

另一侧的 $M$ 点 DFT 矩阵 $\mathbf U^B=\mathbf U^B_{\mathrm{el}}\otimes\mathbf U^B_{\mathrm{az}}\in\mathbb C^{M\times M}$ 以相同方式定义。信道增益 $\bar{\mathbf H}^{l_q}_{q,i}$ 可以映射到角度域，如下所示 [33]：

$$
\begin{aligned}
\widetilde{\mathbf H}^{l_q}_{q,i}(l)
&=\mathbf U^B\bar{\mathbf H}^{l_q}_{q,i}(l)(\mathbf U^U)^T\\
&=\mathbf A_{l_q}e^{jk_f\nu^D_{l_q}(T_sl+(i-1)T_{\mathrm{symb}})}.
\end{aligned}\tag{15}
$$

其中，$\mathbf A_{l_q}=\rho_{l_q}(\mathbf a^B_{l_q})^T\mathbf a^U_{l_q}$，$\mathbf a^B_{l_q}=\mathbf b^B_{l_q}(\mathbf U^B)^T$，$\mathbf a^U_{l_q}=\mathbf b^U_{l_q}(\mathbf U^U)^T$，而 $\mathbf a^B_{l_q}$ 和 $\mathbf a^U_{l_q}$ 表示导向向量在虚拟方向上的映射。因此，式（1）中所有天线对之间的 CIR 可以堆叠为一个角度域 CIR 矩阵：

$$
\widetilde{\mathbf H}_{q,i}(l,\tau)=
\sum_{l_q=0}^{L_q}\mathbf A_{l_q}
e^{jk_f\nu^D_{l_q}(T_sl+(i-1)T_{\mathrm{symb}})}
\delta(\tau-\tau_{l_q}T_s).\tag{16}
$$

### B. 非均匀时延域离网格基（Nonuniform Delay-Domain Off-Grid Basis）

采用离网格基的角度域信道表示，能够以离散化方式灵活处理实际的连续角度 [18]。然而，为了更充分地利用三维空间中的全维信息，通信双方均部署了 UPA，因此需要采样的波束域包含方位角和俯仰角两个维度。由此，为了提高波束域分辨率，网格点的数量必须以平方关系增长，导致计算量极其庞大。

对于高频传输系统，与大带宽成反比的较短采样周期，为实现时延域中的高多径分辨率提供了机会。然而，使用大量采样点实现高分辨率，仍会带来较高的计算负担。从时延 PSD 中通常可以观察到，多径功率在时延域中主要集中于 LOS 分量和若干较强的非视距（Non-Line-of-Sight，NLOS）分量附近，并且 PSD 通常随着时延的增加而降低，因为那些具有较大时延的 NLOS 路径经历了更长的传播距离和更严重的衰落，因此到达时的功率更低 [32]。利用平均时延 $\mu_{\tau,q}$ 和均方根时延扩展 $\sigma_{\tau,q}$，可以确定多径功率在时延域中的主要集中范围，因此提出一种非均匀网格，其网格刻度设置为

$$
\bar\tau_k=\frac{\mu_{\tau,q}+\sigma_{\tau,q}}{T_s\lceil\eta_\tau P_\tau\rceil}k,\tag{17}
$$

当 $k=0,\ldots,\lceil\eta_\tau P_\tau\rceil-1$ 时采用上述设置；当 $k=\lceil\eta_\tau P_\tau\rceil,\ldots,P_\tau-1$ 时，采用

$$
\bar\tau_k=
\frac{\mu_{\tau,q}+\sigma_{\tau,q}+
\frac{(T_{\mathrm{GI}}-(\mu_{\tau,q}+\sigma_{\tau,q}))(k-\lceil\eta_\tau P_\tau\rceil)}
{P_\tau-\lceil\eta_\tau P_\tau\rceil}}{T_s}.
$$

本文利用可调比例 $\eta_\tau$，在区间 $[0,\mu_{\tau,q}+\sigma_{\tau,q}]$ 内布置更多网格点，并将覆盖区间 $[0,T_{\mathrm{GI}}]$ 的网格点数量压缩至 $P_\tau\ll P_{\mathrm{GI}}$。这样便可以利用较少的网格点实现较高的分辨率，从而显著降低计算规模。随后，网格间距可以计算为

$$
\Delta\bar\tau_k=[\Delta\bar{\boldsymbol\tau}]_k=
\begin{cases}
\bar\tau_{k+1}-\bar\tau_k,&k=0,\ldots,P_\tau-2,\\
P_{\mathrm{GI}}-\bar\tau_{P_\tau-1},&k=P_\tau-1.
\end{cases}\tag{18}
$$

如果 $\bar\tau_k$ 是距离 $\tau_{l_q}$ 最近的网格点，即 $k_{l_q}=\arg\min_k|\bar\tau_k-\tau_{l_q}|$，那么可以将 $\tau_{l_q}$ 重新写为

$$
\tau_{l_q}=\bar\tau_{k_{l_q}}+\Delta\tau_{q,k_{l_q}},\tag{19}
$$

其中，$\Delta\tau_{q,k}$ 表示离网格偏移量，并设置为

$$
\Delta\tau_{q,k}=
\begin{cases}
\tau_{l_q}-\bar\tau_{k_{l_q}},&k=k_{l_q},\ \forall l_q=0,\ldots,L_q,\\
0,&\text{其他情况}.
\end{cases}\tag{20}
$$

因此，式（16）中的信道增益矩阵可以重新写为

$$
\widetilde{\mathbf H}^{D}_{q,i}(l,k)=
\bar{\mathbf A}_{q,k}e^{jk_f\bar\nu^D_{q,k}(T_sl+(i-1)T_{\mathrm{symb}})},\tag{21}
$$

其中，$\bar{\mathbf A}_{q,k}$ 和 $\bar\nu^D_{q,k}$ 设置为

$$
(\bar{\mathbf A}_{q,k},\bar\nu^D_{q,k})=
\begin{cases}
(\mathbf A_{l_q},\nu^D_{l_q}),&k=k_{l_q},\ \forall l_q=0,\ldots,L_q,\\
(\mathbf 0_{M\times N},0),&\text{其他情况}.
\end{cases}\tag{22}
$$

非均匀离网格信道表示将多径的信道增益和多普勒频移分离开来，从而使得后续能够利用压缩感知方法求解联合估计问题。

### C. 传输模型（Transmission Model）

准确的 CFO 估计是后续基于模型的信道预测所必需的，并且可以通过导频训练与复信道增益估计联合实现。如图 2 所示，导频信号在每个时间块内以一定间隔插入数据符号之间，并分布于所有子载波上。通常，在一个时间块内，仅需在起始符号插入导频信号，后续符号的信道便可以根据估计出的多径参数，通过基于模型的信道预测获得。令 $\mathcal I_P$ 表示导频符号索引集合，$I_P=|\mathcal I_P|$。在第 $i$ 个符号中，第 $p$ 个采样点上的导频向量记为 $\mathbf s_{q,i,p}\in\mathbb C^N$。基站接收到的第 $i$ 个符号可以通过信道传递函数（Channel Transfer Function，CTF）写为

**图 2.** 导频模式示意图。

$$
\mathbf y_{q,i}=\mathbf H_{q,i}\mathbf s_{q,i}+\mathbf n_{q,i},\tag{23}
$$

$$
\mathbf H_{q,i}=
\begin{bmatrix}
\mathbf H_{q,i,1,1}&\cdots&\mathbf H_{q,i,1,P}\\
\vdots&\ddots&\vdots\\
\mathbf H_{q,i,P,1}&\cdots&\mathbf H_{q,i,P,P}
\end{bmatrix},\tag{24}
$$

$$
\mathbf s_{q,i}=[(\mathbf s_{q,i,1})^T,\ldots,(\mathbf s_{q,i,P})^T]^T.\tag{25}
$$

其中，$\mathbf n_{q,i}\sim\mathcal{CN}(\mathbf 0,\sigma_q^2\mathbf I_{MP})$ 表示各接收天线和子载波上的加性高斯白噪声（Additive White Gaussian Noise，AWGN），$\sigma_q^2$ 表示噪声功率，$\mathbf H_{q,i,p_1,p_2}$ 表示 OFDM MIMO 信道在子载波之间的 CTF，其表达式为

$$
\mathbf H_{q,i,p_1,p_2}=
(\mathbf U^B)^H
\underbrace{\left(
\frac1P\sum_{k=0}^{P_\tau-1}\sum_{l=0}^{P-1}
\widetilde{\mathbf H}_{q,i}(l,k)
e^{-j\frac{2\pi}{P}(\bar\tau_k+\Delta\tau_{q,k})(p_2-1)}
e^{j\frac{2\pi}{P}l(p_2-p_1)}
\right)}_{\widetilde{\mathbf H}_{q,i,p_1,p_2}}
(\mathbf U^U)^*.\tag{26}
$$

此外，将本地振荡器频率失配记为 $\bar\nu^O_{q,k}$，则总 CFO 可以写为 $\bar\nu_{q,k}=\bar\nu^D_{q,k}+\bar\nu^O_{q,k}$，相应的等效时变信道可以表示为

$$
\begin{aligned}
\widetilde{\mathbf H}_{q,i}(l,k)
&=\widetilde{\mathbf H}^{D}_{q,i}(l,k)e^{jk_f\bar\nu^O_{q,k}(T_sl+(i-1)T_{\mathrm{symb}})}\\
&=\bar{\mathbf A}_{q,k}e^{jk_f\bar\nu_{q,k}(T_sl+(i-1)T_{\mathrm{symb}})}.
\end{aligned}\tag{27}
$$

令 $\mathbf U^U_{NP}=\mathbf I_P\otimes(\mathbf U^U)^*$ 和 $\mathbf U^B_{NP}=\mathbf I_P\otimes(\mathbf U^B)^H$，式（24）可以重新写为

$$
\mathbf H_{q,i}=
\mathbf U^B_{NP}
\underbrace{\begin{bmatrix}
\widetilde{\mathbf H}_{q,i,1,1}&\cdots&\widetilde{\mathbf H}_{q,i,1,P}\\
\vdots&\ddots&\vdots\\
\widetilde{\mathbf H}_{q,i,P,1}&\cdots&\widetilde{\mathbf H}_{q,i,P,P}
\end{bmatrix}}_{\widetilde{\mathbf H}^{\mathrm{ICI}}_{q,i}}
\mathbf U^U_{NP}.\tag{28}
$$

因此，接收频域采样值可以重新写为

$$
\mathbf y_{q,i}=
\mathbf U^B_{NP}\widetilde{\mathbf H}^{\mathrm{ICI}}_{q,i}\bar{\mathbf s}_{q,i}+
\mathbf n_{q,i},\tag{29}
$$

其中，$\bar{\mathbf s}_{q,i}=\mathbf U^U_{NP}\mathbf s_{q,i}$。在式（29）两边左乘 $(\mathbf U^B_{NP})^H$，可以得到

$$
\widetilde{\mathbf y}_{q,i}=
(\mathbf U^B_{NP})^H\mathbf y_{q,i}=
\widetilde{\mathbf H}^{\mathrm{ICI}}_{q,i}\bar{\mathbf s}_{q,i}+
\widetilde{\mathbf n}_{q,i},\tag{30}
$$

其中，$\widetilde{\mathbf n}_{q,i}=(\mathbf U^B_{NP})^H\mathbf n_{q,i}$ 仍然服从 $\mathcal{CN}(\mathbf 0,\sigma_q^2\mathbf I_{MP})$，因为 $\mathbf U^B_{NP}$ 是酉矩阵。

## III. 基于 WCM 的先验分布构建（WCM-BASED PRIOR DISTRIBUTION CONSTRUCTION）

### A. WCM 精度（WCM Precision）

为了定量评估 WCM 预构建信道信息的准确性，定义一个称为余弦相似度的精度关键性能指标（Key Performance Indicator，KPI）：

$$
r_{\mathbf a}=\frac{\mathbf a^H\hat{\mathbf a}}{\|\mathbf a\|\|\hat{\mathbf a}\|}.\tag{31}
$$

其中，$\hat{\mathbf a}$ 是 WCM 提供的大尺度参数，$\mathbf a$ 是传输过程中的实际参数。尽管动态 WCM 无法在数字空间中完美复现实际传播环境，但它仍然可以通过在一定时间内积累信道信息，获得遍历意义上的结果。如图 3 所示，由此便能够近似获知某些关键参数，例如角度域或时延域中的信道功率分布。

**图 3.** WCM 及其在关键信道参数先验分布构建中应用的示意图。

### B. 复信道增益的先验分布构建（Prior Distribution Construction for Complex CGs）

SBL 方法通过调节参数化先验分布来调整估计结果的稀疏性，并且能够通过分层马尔可夫模型引入先验知识 [19]。WCM 能够提供大量有助于高效信道估计的先验知识，例如反映不同域中功率分布和稀疏性的 PSD。尽管 WCM 提供的 PSD 只是近似结果，但它们仍然有助于提高贝叶斯学习的效率和精度，这一点将在后文得到证明。

将 WCM 提供的、基于位置且与时间无关的角度–时延 PSD 记为 $\bar{\boldsymbol\Omega}_q(k)=\mathbb E\{\bar{\mathbf A}_{q,k}\odot(\bar{\mathbf A}_{q,k})^*\}$。由于多径分量是在复杂传播环境中随机生成的，因此可以认为它们彼此独立。由此，可以将 $\mathbf r_q$ 视为零均值复高斯随机向量，其分布为

$$
p(\mathbf r_q\mid\boldsymbol\gamma_q)
=\mathcal{CN}\left(\mathbf r_q\mid\mathbf0,
\operatorname{diag}(\boldsymbol\gamma_q)^{-1}\right).\tag{32}
$$

其中，$\boldsymbol\gamma_q=[\gamma_{q,s}]_{s=1,\ldots,MNP_\tau}$ 是精度向量，并作为惩罚项来控制 $\mathbf r_q$ 的稀疏性。由于 $\boldsymbol\gamma_q$ 中各元素是 $\mathbf r_q$ 中相应元素方差的倒数，因此当 $\gamma_{q,s}$ 趋于无穷大时，$[\mathbf r_q]_s$ 将趋于 0。$\boldsymbol\gamma_q$ 的条件先验写为

$$
p(\boldsymbol\gamma_q\mid\boldsymbol\omega_q)
=\prod_{s=1}^{MNP_\tau}
\Gamma(\gamma_{q,s};1+c^r_{1,q,s},c^r_{2,q,s}),\tag{33}
$$

其中，$\boldsymbol\omega_q=\operatorname{vec}([\bar{\boldsymbol\Omega}_q(k)]_{k=0,\ldots,P_\tau-1})$，$\Gamma(\gamma_{q,s};1+c^r_{1,q,s},c^r_{2,q,s})$ 是 Gamma 超先验，$c^r_{1,q,s}$ 和 $c^r_{2,q,s}$ 分别对应形状参数和速率参数。对于所有 $s\in\{1,2,\ldots,MNP_\tau\}$，有 $c^r_{1,q,s}>-1$ 和 $c^r_{2,q,s}>0$。本文采用三层马尔可夫模型，将来自 WCM 的先验信息引入 $\mathbf r_q$ 的参数化先验分布。如图 3 所示，$c^r_{1,q,s}$ 与 $c^r_{2,q,s}$ 之间的关系具体由 $\boldsymbol\omega_q$ 调节，即 $(c^r_{1,q,s}+1)/c^r_{2,q,s}=\omega_{q,s}^{-1}$。通常令 $c^r_{1,q,s}\to0$、$c^r_{2,q,s}\to0$，以获得更宽泛的超先验。

### C. CFO 的先验分布构建（Prior Distribution Construction for CFOs）

根据式（4），每条路径的多普勒频移由两个部分组成：表示路径方向的球面单位向量和 UE 速度。直接估计多径的方位角和俯仰角将导致过高的计算负担。由于通过 DFT 矩阵得到的路径在虚拟方向上的信道投影比值与路径角度密切相关，因此可以从角度域信道增益中提取多径角度。具有最大投影值的虚拟方向最接近实际路径方向。在固定的第 $b$ 个方位方向和第 $a$ 个俯仰方向上，式（15）中的 $\mathbf a^U_{l_q}$ 可以分解为

$$
\begin{aligned}
\mathbf a^U_{l_q}((a-1)N_1+b)
={}&([\mathbf U^U_{\mathrm{el}}]_{a,:}\mathbf u(\varphi^U_{l_q},N_2))
([\mathbf U^U_{\mathrm{az}}]_{b,:}\mathbf u(\vartheta^U_{l_q},N_1))\\
={}&\Upsilon\left(N_2,\frac{2a-1}{2N_2}+\varphi^U_{l_q}-0.5\right)
\Upsilon\left(N_1,\frac{2b-1}{2N_1}+\vartheta^U_{l_q}-0.5\right).
\end{aligned}\tag{34}
$$

其中，$\Upsilon(C,x)=\frac{\sin(C\pi x)}{\sqrt C\sin(\pi x)}e^{jx(C-1)}$，并且 $|\Upsilon(C,x)|$ 是一个关于 $x$ 的周期为 1 的周期函数。函数 $\Upsilon(C,x)$ 在单个周期内的幅度如图 4 所示。

**图 4.** 函数 $\Upsilon$ 的幅度随 $x$ 的变化（$C=8$）。

以等效俯仰角为例。如果 $\varphi^U_{l_q}$ 恰好落在某个固定的虚拟方向上，那么函数 $\Upsilon$ 的幅度可以达到最大值，如图 4 中的最佳情况所示。实际上，路径 $l_q$ 上角度域信道增益的两个最大幅度之间的比值由 $\varphi^U_{l_q}$ 决定。尽管在估计之前很难获得精确的信道增益矩阵 $\bar{\mathbf A}_{q,k}$，但仍然可以根据 WCM 提供的角度–时延 PSD，在统计意义上获得最可能的路径方向，而且这部分计算可以交由 WCM 完成，不会给在线估计带来额外的计算负担。

定义 $[\bar{\mathbf A}'_{q,k}]_{m,n}=[\bar{\boldsymbol\Omega}_q(k)]_{m,n}^{1/2}$，以表示遍历意义下的角度–时延谱。假设多径功率集中于 $L'_q$ 个时延域网格点，其索引为 $\{k_{l_q}\mid l_q=0,\ldots,L'_q\}$，且 $k_{l_q}$ 属于 $\operatorname{supp}(\{\bar{\boldsymbol\Omega}_q(k)\}_{k=1,\ldots,P_\tau})$。令 $\bar a^{\max}_{q,k}$ 表示 $\bar{\mathbf A}'_{q,k}$ 中元素幅度的最大值，并假设它位于 $\bar{\mathbf A}'_{q,k}$ 的第 $c_{\max}$ 列。定义 $b_1=\operatorname{mod}(c_{\max}-1,N_1)+1$ 和 $a_1=\lfloor c_{\max}/N_1\rfloor+1$。在所有与最大幅度元素位于同一行、且列号属于集合 $\{N_1(a_1-1)+1,N_1(a_1-1)+2,\ldots,N_1a_1\}$ 的元素中，将第二大元素幅度记为 $\bar a^{\mathrm{az}}_{q,k}$，其列号记为 $c^{\mathrm{az}}_{\mathrm{submax}}$。进一步定义 $b_2=\operatorname{mod}(c^{\mathrm{az}}_{\mathrm{submax}}-1,N_1)+1$。如果前两个最大幅度相等，则 $b_1$ 取较小的编号，$b_2$ 取较大的编号。在所有与最大幅度元素位于同一行、且列号属于集合 $\{b_1,b_1+N_1,\ldots,b_1+(N_2-1)N_1\}$ 的元素中，将第二大元素幅度记为 $\bar a^{\mathrm{el}}_{q,k}$，其列号记为 $c^{\mathrm{el}}_{\mathrm{submax}}$。进一步定义 $a_2=\lfloor c^{\mathrm{el}}_{\mathrm{submax}}/N_1\rfloor+1$。如果前两个最大幅度相等，则 $a_1$ 取较小的编号，$a_2$ 取较大的编号。如果某条路径的实际方位角/俯仰角方向与某个固定的方位角/俯仰角方向一致，则有 $b_1=b_2$ / $a_1=a_2$。基于函数 $|\Upsilon(C,x)|$ 的周期性，可以得到以下定理。

**定理 1：** 利用 WCM 提供的角度–时延 PSD 和上述关键元素索引，在网格点 $k=k_{l_q}$ 处，$\varphi'^{U}_{q,k}$ 和 $\vartheta'^{U}_{q,k}$ 可以写为

$$
\varphi'^{U}_{q,k}=
\begin{cases}
\frac{N_2-2a_1+1}{2N_2}-\frac{\eta_{\mathrm{el}}}{N_2(\eta_{\mathrm{el}}+1)},
& a_1-a_2\in(-N_2+1,0]\ \text{或}\ a_1-a_2=N_2-1,\\
\frac{N_2-2a_1+1}{2N_2}+\frac{\eta_{\mathrm{el}}}{N_2(\eta_{\mathrm{el}}+1)},
& a_1-a_2\in(0,N_2-1)\ \text{或}\ a_1-a_2=-N_2+1.
\end{cases}\tag{35}
$$

$$
\vartheta'^{U}_{q,k}=
\begin{cases}
\frac{N_1-2b_1+1}{2N_1}-\frac{\eta_{\mathrm{az}}}{N_1(\eta_{\mathrm{az}}+1)},
& b_1-b_2\in(-N_1+1,0]\ \text{或}\ b_1-b_2=N_1-1,\\
\frac{N_1-2b_1+1}{2N_1}+\frac{\eta_{\mathrm{az}}}{N_1(\eta_{\mathrm{az}}+1)},
& b_1-b_2\in(0,N_1-1)\ \text{或}\ b_1-b_2=-N_1+1.
\end{cases}\tag{36}
$$

其中假设 $N_1$ 和 $N_2$ 非常大。这里，$\eta_{\mathrm{el}}=\bar a^{\mathrm{el}}_{q,k}/\bar a^{\max}_{q,k}$ 和 $\eta_{\mathrm{az}}=\bar a^{\mathrm{az}}_{q,k}/\bar a^{\max}_{q,k}$ 分别表示俯仰方向和方位方向上两个最大幅度之间的比值。

**证明：** 详细推导见附录 A。■

根据推断得到的 $\varphi'^{U}_{q,k}$ 和 $\vartheta'^{U}_{q,k}$，可以得到

$$
\hat{\mathbf r}'^{U}_{q,k}=
\left[
\sqrt{1-(\vartheta'^{U}_{q,k}\lambda_c/d^U_c)^2-(\varphi'^{U}_{q,k}\lambda_c/d^U_r)^2},
\vartheta'^{U}_{q,k}\lambda_c/d^U_c,\varphi'^{U}_{q,k}\lambda_c/d^U_r
\right]^T.\tag{37}
$$

随后通过 LCS-GCS 坐标转换，获得网格点 $k=k_{l_q}$ 处的 $\hat{\mathbf r}'^{U,\mathrm{GCS}}_{q,k}$。这种近似线性求解方法能够显著减轻计算负担。考虑振荡器频率失配以及上述参数的定位和计算误差，网格点 $k=k_{l_q}$ 处的 CFO 组成可以表示为

$$
\bar\nu_{q,k}=
\begin{cases}
(\hat{\mathbf r}'^{U,\mathrm{GCS}}_{q,k})^T\bar{\mathbf v}_q+n_{\nu,k},
&k=k_0,\\
(\hat{\mathbf r}'^{U,\mathrm{GCS}}_{q,k})^T\bar{\mathbf v}_q+\nu^S_{q,k}+n_{\nu,k},
&k=k_1,\ldots,k_{L'_q}.
\end{cases}\tag{38}
$$

其中，$n_{\nu,k}\sim\mathcal N(0,\sigma_{\nu,k}^2)$ 涵盖所有失配和误差。基于这种组成关系，可以获得准确的 CFO 先验分布，如以下定理所示。

**定理 2：** 利用 WCM 提供的最可能路径方向和 UE 速度信息，CFO $\bar{\boldsymbol\nu}_q$ 的先验分布可以写为

$$
p(\bar{\boldsymbol\nu}_q;\bar{\boldsymbol\Omega}_q)=
\prod_{k=0}^{P_{\mathrm{GI}}-1}f_q(\bar\nu_{q,k};\bar{\boldsymbol\Omega}_q).\tag{39}
$$

其中，函数 $f_q$ 定义为

$$
\begin{aligned}
f_q(\bar\nu_{q,k};\bar{\boldsymbol\Omega}_q)
=\begin{cases}
\frac1{\sqrt{2\pi\sigma_{\nu,k}^2}}
\exp\left(-\frac{(\bar\nu_{q,k}-C_{0,q}(k))^2}{2\sigma_{\nu,k}^2}\right),
& k=k_0,\\[5pt]
\frac{\zeta}{4v_{\mathrm{scatt}}}
\left[
Q\left(\frac{2v_{\mathrm{scatt}}-\bar\nu_{q,k}+C_{0,q}(k)}{\sigma_{\nu,k}}\right)
-Q\left(\frac{C_{0,q}(k)-2v_{\mathrm{scatt}}-\bar\nu_{q,k}}{\sigma_{\nu,k}}\right)
\right]\\
\quad+\frac{1-\zeta}{2\sqrt{2\pi\sigma_{\nu,k}^2}}
\exp\left(-\frac{(\bar\nu_{q,k}-C_{0,q}(k))^2}{2\sigma_{\nu,k}^2}\right),
& k=k_1,\ldots,k_{L'_q},\\[5pt]
\frac1{\sqrt{2\pi\sigma_{\nu,k}^2}}
\exp\left(-\frac{\bar\nu_{q,k}^2}{2\sigma_{\nu,k}^2}\right),
& \text{其他情况}.
\end{cases}
\end{aligned}\tag{40}
$$

其中，$C_{0,q}(k)=(\hat{\mathbf r}'^{U,\mathrm{GCS}}_{q,k})^T\bar{\mathbf v}_q$，且 $Q(x)=\frac1{\sqrt{2\pi}}\int_{-\infty}^{x}e^{-t^2/2}\,dt$。

**证明：** 详细推导见附录 B。■

