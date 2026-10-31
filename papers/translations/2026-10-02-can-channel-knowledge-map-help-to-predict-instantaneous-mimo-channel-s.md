---
layout: page
title: "信道知识地图能否预测瞬时 MIMO 信道状态信息？｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-02-can-channel-knowledge-map-help-to-predict-instantaneous-mimo-channel-s/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e10348decd7f0866/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 信道知识地图能否预测瞬时 MIMO 信道状态信息？

**原题：** Can Channel Knowledge Map Help to Predict Instantaneous MIMO Channel State Information?  
**作者：** Xianling Wang（王衔凌）、Yi Shi、Tianci Wang、Yingyujiao Huang、Zeyu Hu、Zhiyuan Jiang  
**单位：** 上海大学通信与信息工程学院（School of Communication and Information Engineering, Shanghai University），中国上海 200444。邮箱：{lance_wang, yishi1996}@shu.edu.cn、tianciwang@163.com、{hyyj, huzeyu, jiangzhiyuan}@shu.edu.cn。  
**版本：** 会议论文集版本（Can_Channel_Knowledge_Map_Help_to_Predict_Instantaneous_MIMO_Channel_State_Information.pdf），本地 PDF 6 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—V 节（含 I-A/I-B、II-A—II-C、III、IV）、致谢、图 1—6 中文图注、表 I 逐格转录、参考文献 [1]—[12]（英文原条目，按原编号）均按原文结构录入；编号公式 (1)—(14) 按原文保留。原文为 IEEE WCNC 2024 会议论文（ISBN 979-8-3503-0358-2/24，DOI 10.1109/WCNC57260.2024.10570728，©2024 IEEE），版权与再传播许可待核验，故本页不作可公开全文登记。逐句逐式终校未做。

## 摘要

准确的信道状态信息（CSI）对于优化无线通信系统性能至关重要。当前研究方向之一是依据用户**位置**从**信道知识地图（channel knowledge map, CKM）**中提取 CSI。这一思路对大规模 CSI（如路径损耗）的获取卓有前景，但 CKM 能否帮助预测对定位误差与散射环境变化都极为敏感的**瞬时 CSI**，仍然存疑。为回答该问题，本文提出一种把 CKM 与用户历史 CSI 相结合的信道预测方案，以提升多输入多输出（MIMO）系统中的波束成形性能。具体地，该方案利用多径分量（multi-path component, MPC）的**复幅度**信息，并采用一种低复杂度方法预测未来的 MIMO CSI。基于真实信道数据的实验结果表明，所提方案优于仅使用 CKM 的现有方案以及不使用 CKM 的自回归方案。在非视距（NLoS）场景中，当定位误差超过 0.525 m 时，CKM 中的小尺度 CSI 几乎不带来增益；在视距（LoS）环境中，小尺度 CSI 可用性对应的定位误差阈值约为 0.725 m 或略高。当定位误差小于 0.225 m 时，两种场景下 CKM 都有益于瞬时 CSI 预测。

**索引词：** 信道知识地图、信道预测、信道测量活动、MIMO。

## I. 引言

信道状态信息（CSI）是无线通信的基本概念之一 [1]、[2]，指无线信道的已知特征；获取准确 CSI 对保证通信系统中无线链路性能至关重要。然而，随着基站（BS）天线数量增加，处理或计算时延可能导致 CSI 不准确。信道知识地图（CKM）是基于当代无线系统中易于获取的用户位置信息的新兴概念，它包含当前场景下有价值的信道信息，旨在便利乃至避免 CSI 的实时获取，从而降低准确 CSI 的获取成本 [3]。

### A. 相关工作

CKM 是一个宽泛概念，涵盖当前场景内任意地理位置的全部信道信息。文献 [4] 阐述了 CKM 的概念并介绍了四个有说服力的应用场景，辅以数值仿真案例，展示了 CKM 在环境感知通信中的巨大潜力。文献 [5] 把当前场景的统计多径时延信息作为先验知识，降低了信道估计复杂度并显著改善估计性能。类似地，文献 [6] 从 CKM 获取簇生灭（birth and death）的先验信息并设计了簇检测方案。文献 [7] 提出了一种基于期望最大化（EM）算法的新地图构建方案，可基于少量测量点的数据构建整个场景的 CKM。然而需要关注两点局限：第一，为当前场景存储 CKM 需要大量存储资源；第二，用户位置点与 CKM 上的测量点之间存在误差，在仅依赖全球定位系统（GPS）时该误差无法消除；在毫米波频段，厘米级定位误差即可造成信道的显著相位差。

在信道预测算法方向，文献 [8] 首先改进了可预测复幅度的 Prony 算法，再利用角度—时延域中显著网格点的未来幅度预测信道。随后在文献 [9] 中，作者提出了一种新的参数化信道建模方法，引入多维矩阵束（matrix pencil）算法同时估计离开仰角（EoD）、离开方位角（AoD）、多普勒频率与时变时延参数，并通过引入未来时间样本得到预测信道响应。类似地，文献 [10] 考虑了时变多普勒频率。此外，基于深度学习的信道预测也是热门方向：文献 [11] 提出了一种把信道预测与功率优化相结合的联合学习框架，直接预测用于传输的波束成形；文献 [11] 还展示了带注意力机制的长短期记忆（LSTM）循环神经网络在波束训练与预测中的突出性能。

### B. 本文贡献

在现有工作中，参数化与非参数化信道模型的方法都无法获得路径的生灭信息，导致在路径变化复杂的非视距（NLoS）场景中出现显著性能损失。此外，现有的基于神经网络的信道预测方法难以通过训练数据获得未来路径的出生信息。针对上述问题，本方案设计了一种基于 CKM 的信道预测方法：从 CKM 中获取路径生灭、复幅度等信息来辅助当前用户的信道预测。本方案的贡献如下。

- 深入介绍了 CKM 的应用优势，并分析了定位误差下 CKM 信道与用户历史信道之间的共性与差异。
- 基于这些特性，本文采用多径分量（MPC）跟踪算法与预测算法，利用 CKM 中的瞬时相位与路径生灭信息辅助用户信道预测。
- 基于信道测量活动所得实测信道评估该方案性能，分析实验结果并给出结论。

## II. 系统模型与问题表述

考虑一个单小区、单用户、时分双工（TDD）的大规模 MIMO 正交频分复用（OFDM）波束成形系统。基站配备实际应用中常见的平面天线阵，天线总数为 $N_t=N_h\times N_c$，其中 $N_h$、$N_c$ 分别表示行数与列数；用户设备（UE）配备由 $N_r$ 个阵元构成的线阵。

本文的主要目标是设计一个算法，使**预测的空间域 CSI 与其真实值之间的余弦相似度最大化**。空间域精度直接对应波束成形性能，进而影响吞吐量变化。考虑某用户信道，设预测的 CSI 矩阵为 $\bar{\mathbf H}_U\in\mathbb C^{W_{\mathrm{pre}}\times N_s\times N_t\times N_r}$、真实值为 $\mathbf H_U$，其中 $W_{\mathrm{pre}}$ 为预测点数、$N_s$ 为导频数。令 $\mathbf h$ 与 $\bar{\mathbf h}$ 分别表示上述矩阵中的一列，则余弦相似度 $e_{\mathrm{pre}}$ 可写为

$$
e_{\mathrm{pre}}=\frac{1}{N_rN_sW_{\mathrm{pre}}}\sum_{\hat n=1}^{N_r}\sum_{\hat j=1}^{N_s}\sum_{i=1}^{W_{\mathrm{pre}}}\frac{\left|\mathbf h_{U_{i,\hat j,\hat n}}\cdot\bar{\mathbf h}_{U_{i,\hat j,\hat n}}^{\,T}\right|}{\left\|\mathbf h_{U_{i,\hat j,\hat n}}\right\|_2\left\|\bar{\mathbf h}_{U_{i,\hat j,\hat n}}\right\|_2}.\tag{1}
$$

这里 $e_{\mathrm{pre}}\in[0,1]$，取值越接近 1 表示预测性能越好。余弦相似度是本文的仿真指标。

### A. 信道模型

考虑由 $N_t$ 根发射天线与 $N_r$ 根接收天线构成的 OFDM 通信系统，其频率响应可表示为

$$
\mathbf H_{i,\hat j}=\sum_{n\in\xi}\sum_{p=1}^{P}a_{n,p}\mathbf s_t\left(\hat\Omega_{n,p},\hat\theta_{n,p}\right)\cdot\mathbf s_r\left(\hat\Psi_{n,p}\right)e^{\jmath2\pi f_{n,p}i\Delta t-\jmath2\pi\tau_{n,p}\hat j\Delta f}.\tag{2}
$$

假设散射环境由多个簇构成，记为 $|\xi|$，每簇包含 $P$ 条子路径。式（2）中 $i$、$\hat j$ 分别表示时间与子载波索引，$\Delta t$、$\Delta f$ 分别表示符号持续时间与子载波间隔；$a_{n,p}$、$\hat\Omega_{n,p}$、$\hat\theta_{n,p}$、$\hat\Psi_{n,p}$、$f_{n,p}$、$\tau_{n,p}$ 分别表示第 $n$ 簇第 $p$ 条路径的复幅度、EoD、AoD、AoA、多普勒频率与时延。$\mathbf s_r(\hat\Psi_{n,p})$ 与 $\mathbf s_t(\hat\Omega_{n,p},\hat\theta_{n,p})$ 分别对应接收与发射阵列响应向量，形式为

$$
\mathbf s_t\left(\hat\Omega_{n,p},\hat\theta_{n,p}\right)=\operatorname{vec}\left(\mathbf v_x\left(\hat\Omega_{n,p},\hat\theta_{n,p}\right)\otimes\mathbf v_y\left(\hat\Omega_{n,p},\hat\theta_{n,p}\right)^T\right),\tag{3}
$$

$$
\mathbf s_r\left(\hat\Psi_{n,p}\right)=\left[1,e^{\jmath ug_r\sin\hat\Psi_{n,p}},\cdots,e^{\jmath ug_r(N_r-1)\sin\hat\Psi_{n,p}}\right]^T,\tag{4}
$$

其中 $\mathbf v_x(\hat\Omega_{n,p},\hat\theta_{n,p})$ 与 $\mathbf v_y(\hat\Omega_{n,p},\hat\theta_{n,p})$ 分别表示发射天线的水平与垂直方向导向向量，$\operatorname{vec}(\cdot)$ 表示矩阵向量化。这些向量定义为

$$
\mathbf v_x\left(\hat\Omega_{n,p},\hat\theta_{n,p}\right)=\left[1,e^{\jmath ug_{t\text{-}x}\cos\hat\Omega_{n,p}\cos\hat\theta_{n,p}},\cdots,e^{\jmath u(N_h-1)g_{t\text{-}x}\cos\hat\Omega_{n,p}\cos\hat\theta_{n,p}}\right]^T,\tag{5}
$$

$$
\mathbf v_y\left(\hat\Omega_{n,p},\hat\theta_{n,p}\right)=\left[1,e^{\jmath ug_{t\text{-}y}\cos\hat\Omega_{n,p}\sin\hat\theta_{n,p}},\cdots,e^{\jmath u(N_c-1)g_{t\text{-}y}\cos\hat\Omega_{n,p}\sin\hat\theta_{n,p}}\right]^T,\tag{6}
$$

其中 $u=2\pi/\lambda$、$\lambda$ 为载波波长，$g_r$、$g_{t\text{-}x}$、$g_{t\text{-}y}$ 为阵元间距。

### B. 角度—时延域转换

角度—时延域反映了天线阵的几何形状与信道的宽带时延响应结构 [8]，它使信道的空域与时间方面得以分离，便于分析与建模信道特性。在天线域中，随着天线数增加，阵列导向向量可由离散 Fourier 变换（DFT）矩阵的列很好地近似。

考虑均匀平面阵（UPA），基于 DFT 矩阵的空间变换矩阵可表示为 $\mathbf F(N_h)\otimes\mathbf F(N_c)$。定义第 $i$ 个时刻、第 $\hat n$ 根接收天线的空频域信道表示为 $\hat{\mathbf H}_{i,\hat n}\in\mathbb C^{N_s\times N_t}$，则信道的角度—时延域可由下式获得 [12]：

$$
\mathbf H_{i,\hat n}=\mathbf F_{N_s}^H\hat{\mathbf H}_{i,\hat n}\left(\mathbf F(N_h)\otimes\mathbf F(N_c)\right),\tag{7}
$$

并记角度—时延域第 $(\hat j,m)$ 个网格点的值为 $H_{i,\hat n}(\hat j,m)$。

（图 1 见"图注"一节。）

### C. 信道知识地图的应用前景

无线信道主要由收发端位置、实际无线电传播环境以及无线电波特性（如频率）决定。现有工作中基于随机方法与几何方法的无线信道数学建模易于处理且泛化性强，但在真实复杂场景中常出现不可忽略的误差；因此基于导频的实时信道估计方案得到广泛研究。然而，在高移动场景与大规模 MIMO 系统中，导频训练的成本很高。

针对上述问题，利用 CKM 是一种极佳的解决方案。在真实大规模 MIMO 无线通信场景中，无论基站是否移动，信道 $\mathbf H_i$ 的变化主要由用户移动与散射环境变化引起。在实际测量场景 [10] 中，如图 1 所示，我们观察到建筑物、道路等环境中散射物体的变化时间尺度远长于信道相干时间；场景中虽也存在行人、车辆等动态散射体，但前者对信道的影响远大于后者 [3]。因此，把复杂环境中的信道映射到三维坐标 $(X,Y,Z)$——即 CKM——对实际应用具有很大前景。

然而，定位技术引入的误差与地图密度不足带来的误差不可忽视。定位坐标表示为 $(X+\Delta x,Y+\Delta y,Z+\Delta z)$。受定位误差与场景中时变散射体影响，地图信道 $\mathbf H_M$ 与用户信道 $\mathbf H_U$ 之间的相关性如图 2 所示：$\mathbf H_M$ 表示经由带误差的坐标点从 CKM 得到的 CSI，$\mathbf H_U$ 表示用户实际 CSI。两个信道共享部分散射体，相应路径具有相近的功率、时延与角度；而用户信道独立路径与地图信道独立路径的参数不同。具体地，$\operatorname{supp}(\mathbf H_{i,\hat n})$ 表示矩阵 $\mathbf H_{i,\hat n}$ 中非零元素的索引集，即 $\operatorname{supp}(\mathbf H_{i,\hat n})=\{(\hat j,m):H_{i,\hat n}(\hat j,m)\neq0\}$。考虑某根接收天线的所有时刻，$\operatorname{supp}(\mathbf H_{\hat n})$ 表示所有出现过的坐标集合。于是存在地图—用户公共支撑集 $\Omega_C$，使 $\Omega_C\subseteq\operatorname{supp}(\mathbf H_U)$ 且 $\Omega_C\subseteq\operatorname{supp}(\mathbf H_M)$；此外，由于定位误差与信道变化，必然存在非空的用户独立支撑集 $\Omega_{UI}$ 与地图独立支撑集 $\Omega_{MI}$。注意：由于只考虑一根接收天线，式中 $\hat n$ 被省略；实际上对每根接收天线 $\hat n$，都存在相应的 $\Omega_{UI_{\hat n}}$、$\Omega_{MI_{\hat n}}$ 与 $\Omega_{C_{\hat n}}$。

此外，为节省 CKM 的存储资源，本方案利用角度—时延域信道的**主路径响应地图**，该地图只包含角度—时延域中功率显著路径的信息。

## III. 地图信道辅助的预测方案

在用户信道与地图信道的角度—时延域中，对地图信道存在公共支撑集 $\Omega_C$ 与地图独立支撑集 $\Omega_{MI}$，对用户信道存在公共支撑集 $\Omega_C$ 与用户独立支撑集 $\Omega_{UI}$。

在跟踪路径之前，需要确定路径的出生与死亡。本方案判断两条路径是否相同，依据是角度—时延域中的网格点：若某路径在相邻两个时刻的角度—时延域位置保持不变且功率高于阈值，则视为**连续存活路径**。路径跟踪算法的流程见算法 1。

**算法 1：路径跟踪算法**

输入：窗口长度 $W$、角度—时延域信道 $\mathbf H$、功率阈值系数 $\eta$。
初始化：路径数 $l=1$、分量数 $K$、生灭信息结构 $\Omega$。

1. 对 $i=1$ 到 $W$：
2.   计算 $\mathbf H_i$ 的功率 $P_{p_i}$，把 $\mathbf H_i$ 中低于阈值 $\eta\times P_{p_i}$ 的值置零，得到路径数 $L_i$。
3.   对 $j=1$ 到 $L_i$：
4.     若路径 $j$ 是新路径，则在 $\Omega$ 中记录该路径的复幅度、位置与存活时间，并令 $l=l+1$；
5.     否则，在 $\Omega$ 中追加该路径的复幅度与存活时间。
6. 输出：生灭信息结构 $\Omega$。

执行该算法可得到包含路径生灭信息与路径复幅度变化的结构。本方案按角度与时延是否相同，把各时隙的路径幅度拼接起来。以地图信道与用户信道间隔 0.125 m 的实测数据为例，两信道中部分公共路径的生灭示意如图 3 所示：可以观察到地图信道与用户信道之间的公共路径呈现相似的生灭模式。但由于地图信道数据过时，以及波传播差异与不同位置遮挡等因素，地图信道与用户信道在路径生灭上存在细微差异。因此需要在数据处理中补偿这些不连续，因为观测窗口内观测数据的突变会影响预测精度。本方法采用经典**线性插值**算法，利用遮挡前后的幅度恢复遮挡时刻的幅度。具体步骤如下。

1. 从观测窗口末端开始，用算法 1 跟踪窗口结束前的路径生灭变化。
2. 设定阈值 $T_\tau$：若遮挡持续时间 $\hat T_\tau>T_\tau$，则忽略遮挡前路径的功率信息。本方案假设过长的遮挡持续时间会导致遮挡前后路径幅度变化失去连续性。
3. 对低于阈值 $T_\tau$ 的遮挡持续时间，用线性插值算法依据遮挡前后的幅度恢复遮挡时刻的幅度。
4. 记录路径的变化幅度与相应的角度—时延域位置。

该方法滤除长时间不连续的路径以缓解噪声影响；此外，在观测窗口结束前已经死亡的路径不会进入观测路径范围，也不会被预测。

分类与插值之后，为每条路径生成幅度向量 $\mathbf h_l=[H_1(\hat j,m),H_2(\hat j,m),H_3(\hat j,m),\ldots,H_i(\hat j,m)]$。对用户信道，$i\in[1,W_{\mathrm{win}}]$，其中 $W_{\mathrm{win}}$ 为观测窗口长度；对地图信道，$i\in[1,W_{\mathrm{win}}+W_{\mathrm{pre}}]$，其中 $W_{\mathrm{pre}}$ 为预测窗口长度。为方便起见，记 $W_{\mathrm{all}}=W_{\mathrm{win}}+W_{\mathrm{pre}}$。

记 $\Omega_C$ 中的路径数为 $L_C$、$l_C\in[1,L_C]$。对 $\Omega_C$ 中的路径，可用信息包括用户信道中的幅度向量 $\mathbf h_{UC_{l_C}}$ 与地图信道中的 $\mathbf h_{MC_{l_C}}$。本方案使用基于自回归（AR）模型的卡尔曼预测器。$p$ 阶 AR 过程可表示为

$$
x(i)=-\sum_{\bar j=1}^{p}a_{\bar j}x(i-\bar j)+v_i,\tag{8}
$$

其中 $v_i$ 表示过程噪声、$x$ 表示一般时间序列、$a_{\bar j}$ 为拟合的 AR 系数，并应满足 $T_{\mathrm{life}}>p$，此处 $T_{\mathrm{life}}$ 表示观测窗口结束前路径的有效存活时间。对由线性随机差分方程 $x(i)$ 控制的离散时间过程，本方案在预测器中表示为 $x_i^-$，相应时刻的测量值表示为 $z_i=Cx_i+w_i$，并假设观测噪声 $w_i$ 与 $v_i$ 相互独立且服从正态分布。系数 $\hat{\mathbf a}$ 通过拟合 $[H_{U_{W_{\mathrm{win}}}}(\hat j,m),H_{U_{W_{\mathrm{win}}-1}}(\hat j,m),\ldots,H_{U_{W_{\mathrm{win}}-T_{\mathrm{life}}+1}}(\hat j,m)]$ 估计得到，并在后续更新与卡尔曼增益迭代中保持不变。测量噪声的协方差 $R_{l_C}$ 描述为

$$
R_{l_C}=\operatorname{cov}\left(\mathbf h_{UC_{l_C}}\left(W_{\mathrm{win}}-T_{\mathrm{life}_{l_C}}+1:W_{\mathrm{win}}\right),\ \mathbf h_{MC_{l_C}}\left(W_{\mathrm{win}}-T_{\mathrm{life}_{l_C}}+1:W_{\mathrm{win}}\right)\right),\tag{9}
$$

先验估计误差协方差 $P_i^-$ 可基于系数 $\hat{\mathbf a}$ 与过程噪声协方差 $Q$ 得到，其表达式为

$$
P_i^-=\hat{\mathbf a}P_{i-1}\hat{\mathbf a}^T+Q,\tag{10}
$$

其中 $P_{i-1}$ 表示上一采样时刻的后验估计误差协方差。随后计算卡尔曼增益 $K_i$ 并用其修正观测误差，得到滤波后的预测值：

$$
K_i=P_i^-C^T\left(CP_i^-C^T+R\right)^{-1},\tag{11}
$$

$$
\mathbf x=\left[\mathbf x,\left(x_i^-+K_i\left(z_i-Cx_i^-\right)\right)\right].\tag{12}
$$

更新后的后验估计误差协方差 $P_i$ 为

$$
P_i=\left(I-K_iC\right)P_i^-.\tag{13}
$$

因此，只需初始化 $\mathbf x=\mathbf h_{UC_{l_C}}(W_{\mathrm{win}}-p+1:W_{\mathrm{win}})$、$z_1=\mathbf h_{MC_{l_C}}(W_{\mathrm{win}}+1)$，即可实现自适应迭代与预测。令 $\hat T_{\mathrm{life}}$ 表示地图信道中路径在观测窗口结束时刻之后的剩余存活时间，预测时长设为 $\hat T_{\mathrm{life}_{l_C}}$，并满足 $\hat T_{\mathrm{life}_{l_C}}\leqslant W_{\mathrm{pre}}$。

记 $\Omega_{UI}$ 中的路径数为 $L_{UI}$、$l_{UI}\in[1,L_{UI}]$。对用户独立支撑集中的路径，可用信息只包括用户信道中的幅度向量 $\mathbf h_{UI_{l_{UI}}}$。当 $T_{\mathrm{life}_{l_{UI}}}>p$ 时，本方案用 AR 预测器预测这些路径的未来幅度；当 $T_{\mathrm{life}_{l_{UI}}}\leqslant p$ 时忽略这些路径。

记 $\Omega_{MI}$ 中的路径数为 $L_{MI}$、$l_{MI}\in[1,L_{MI}]$。可用信息只包括地图信道中的幅度向量 $\mathbf h_{MI_{l_{MI}}}$；具体地，对应用户信道角度—时延域位置的幅度为零。此时用相应用户与地图信道中该路径在观测窗口内的幅度向量协方差作为测量噪声并不合理，因此本方案用公共路径的平均协方差作为地图独立支撑集的测量噪声，即

$$
R=\frac{1}{L_C}\sum_{l_C=1}^{L_C}\operatorname{cov}\left(\mathbf h_{UC_{l_C}}\left(W_{\mathrm{win}}-T_{\mathrm{life}_{l_C}}+1:W_{\mathrm{win}}\right),\ \mathbf h_{MC_{l_C}}\left(W_{\mathrm{win}}-T_{\mathrm{life}_{l_C}}+1:W_{\mathrm{win}}\right)\right).\tag{14}
$$

## IV. 实际测量场景与仿真结果

我们在典型校园 NLoS 场景中开展测量，详细测量参数见表 I。

测量场景的具体照片见图 4(a)。本方案使用长度为 1023 的 PN 序列作为发射信号；用 6 m 长的滑轨构建虚拟线阵（VLA），滑轨置于楼顶女儿墙边缘，天线通过夹具伸出墙外，从而可有效调整仰角。滑轨所在建筑物的高度为 40 m。LoS 场景的测量位置在楼旁、靠近 2 号楼附近道路处，距 1 号楼约 30 m；道路与 1 号楼之间有许多树木，对信号传播有一定干扰。NLoS 场景的测量位置在另一条道路上，2 号楼遮挡了 1 号楼与该道路之间的视线；2 号楼高约 25 m。对 LoS 与 NLoS 路线均进行静态测量，沿路测量点间距为 2 m。

天线置于 6 m 长的滑轨上，以 0.3 m/s 的速度移动。通过等效 VLA 可获得多天线信道：选取滑轨起点作为天线阵的第一个阵元，从滑轨上取连续 32 个半波长间距的阵元，作为地图信道时域的第一个采样点；每 0.075 m 采样一次，从滑轨获得维度为 $61\times1023\times32$ 的多天线信道。在同一滑轨数据上，以与地图信道相同的维度采样用户信道：用户信道第一个采样点取在地图信道第一个采样点之后，间隔为 $[A_1,A_2,A_3,\cdots,A_{61}]$。示意图见图 5。

所提方案利用观测窗口的用户坐标获取带误差的地图信道，并基于位置坐标做回归以预测未来坐标，再把未来坐标映射到 CKM 得到预测窗口内的地图信道；这些信息用于辅助预测用户信道。然而，滑轨信道测量中无法获得有效的位置坐标信息，因此在数据处理中保持观测窗口与预测窗口位置误差的一致性。

为分析所提算法在不同定位误差下的性能，我们考虑定位误差 $[0.225\,\mathrm m,0.325\,\mathrm m,0.425\,\mathrm m,0.525\,\mathrm m,0.625\,\mathrm m,0.725\,\mathrm m]$。当定位误差低于 0.225 m 时，可以直接把地图信道当作 user 信道使用，此时两信道相关性很高；当定位误差超过 0.725 m 时，两信道相关性很低，从地图信道获得的信息可能对用户信道预测产生**负增益**。本方案中观测窗口长度为 48 个样本、预测窗口长度为 13 个样本；在 NLoS 测量路线上取 6 个点、LoS 场景取 4 个点，经数据处理后用本方案预测，最终对性能取平均得到性能曲线。

由图 6 可见，所提方案在 LoS 与 NLoS 场景下相对**直接使用地图信道**与 **AR 方案**均取得整体性能增益。比较两图中地图信道相关性随距离的下降趋势可以得出：NLoS 场景下余弦相似度下降更快。AR 预测方案性能与预测窗口内是否存在路径生灭密切相关，因为它仅依赖用户窗口的观测来预测未来信道；若预测窗口内路径变化很少或没有变化，AR 性能可得到改善。当 NLoS 场景定位误差较大时，地图中小尺度 CSI 的精度不足以支撑所提预测器超越 AR 方案；然而所提方案可从地图获取大尺度信息，从而因路径生灭信息而获得性能提升，这一特性体现在图 6(b) 中。

## V. 结论

本文提出一种基于 CKM 的信道预测方案，并用多组实测信道数据加以检验。本场景的实测验证表明：在 NLoS 环境中，当定位误差大于 0.525 m 时，CKM 中的小尺度 CSI 几乎不带来增益；在 LoS 环境中，小尺度 CSI 可用性的定位误差阈值约为 0.725 m 或略高；当定位误差低于 0.225 m 时，可直接使用地图信道而无需进一步处理。本工作为未来 CKM 使用研究提供了有价值的洞见与经验。

## 致谢

本工作受国家自然科学基金（NSFC）资助，项目号 62271300、12141107。

## 图注与表注

### 表 I：关键测量参数（原 PDF 第 5 页）

| 参数 | 取值 |
|---|---|
| 频率 | 4.9 GHz |
| 带宽 | 200 MHz |
| 码片速率 | 250 Mchip/s |
| 发射功率 | 35 dBm |
| 发射天线 | $1\times32$ VLA |
| 接收天线 | 全向天线 |
| 序列 | 伪随机噪声（PN）序列 |

### 图注

**图 1（原 PDF 第 3 页）：** 场景中包含建筑物、道路等近似恒定的散射体，以及车辆、行人等变化丰富的散射体。基于该场景构建的 CKM 中的三维坐标与 CSI 一一对应（图中示意：输入为三维坐标 $(X,Y,Z)$，输出为 CSI）。

**图 2（原 PDF 第 3 页）：** 对场景中彼此接近的两个位置，它们共享部分相同散射体，但也各自拥有独立散射体；图中给出用户信道（带定位误差）与地图信道的公共散射体与独立散射体示意。

**图 3（原 PDF 第 4 页）：** 两信道间隔 0.125 m，路径存活时间用线段表示。可观察到两信道之间的公共路径呈现相似的生灭模式：(a)(b) 分别为两信道的路径存活示意（横纵轴各为 0—15 的角度—时延网格）。

**图 4（原 PDF 第 5 页）：** (a) 滑轨与天线的侧视图；(b) 卫星图像，给出天线、LoS 路线与 NLoS 路线的相对位置；绿线表示测量过程中的移动路线（图中标注 1—3 号楼、Tx 与 Rx1/Rx2）。

**图 5（原 PDF 第 5 页）：** 本方案的数据处理方法示意：通过虚拟线阵获得多个天线阵元，并通过数据延时获得带误差的地图信道与用户信道（图中标注地图信道采样点、用户信道采样点，采样间隔 0.075 m、$A_1$—$A_{61}$ m，共 32 个阵元，滑轨长 6 m）。

**图 6（原 PDF 第 6 页）：** 左图为 LoS 场景下本方案性能随定位误差的变化趋势，右图为 NLoS 场景。(a) LoS、(b) NLoS；横轴为定位误差（0.20—0.80 m 量级），纵轴为余弦相似度。"Result_Direct" 表示不作处理、直接把预测窗口的地图信道当作用户未来信道时的性能；"Result_Proposed" 表示本文方案性能（图 6 还含 AR 方案对照）。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、页码与在线链接。

[1] M. Li, Y. Meng, J. Liu, H. Zhu, X. Liang, Y. Liu, and N. Ruan, "When CSI meets public WiFi: inferring your mobile phone password via WiFi signals," in Proc. ACM SIGSAC Conf. Comput. Commun. Secur., 2016, pp. 1068–1079.

[2] Y. Ma, G. Zhou, and S. Wang, "WiFi sensing with channel state information: A survey," ACM Comput. Surv., vol. 52, no. 3, pp. 1–36, 2019.

[3] D. Wu, Y. Zeng, S. Jin, and R. Zhang, "Environment-aware and training-free beam alignment for mmwave massive MIMO via channel knowledge map," in Proc. IEEE Int. Conf. Commun. (ICC) Workshops. IEEE, 2021, pp. 1–7.

[4] Y. Zeng and X. Xu, "Toward environment-aware 6G communications via channel knowledge map," IEEE Wireless Commun., vol. 28, no. 3, pp. 84–91, 2021.

[5] Y. Zhao, X. Zuo, Y. Shang, X. Mu, and J. Zhang, "Prior-information associated channel parameter estimation for aeronautical communications," in Proc. Int. Conf. CyberEnabled Distrib. Comput. Knowl. Discovery. IEEE, 2018, pp. 401–4014.

[6] D. Méndez-Romero and M. J. F.-G. García, "Simpler multipath detection for vehicular OFDM channel tracking," IEEE Trans. Veh. Technol., vol. 67, no. 11, pp. 10 752–10 759, 2018.

[7] K. Li, P. Li, Y. Zeng, and J. Xu, "Channel knowledge map for environment-aware communications: EM algorithm for map construction," in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC). IEEE, 2022, pp. 1659–1664.

[8] H. Yin, H. Wang, Y. Liu, and D. Gesbert, "Addressing the curse of mobility in massive MIMO with prony-based angular-delay domain channel predictions," IEEE J. Sel. Areas Commun., vol. 38, no. 12, pp. 2903–2917, 2020.

[9] W. Li, H. Yin, Z. Qin, Y. Cao, and M. Debbah, "A multi-dimensional matrix pencil-based channel prediction method for massive MIMO with mobility," IEEE Trans. Wireless Commun., 2022.

[10] X. Wang, Y. Shi, W. Xin, T. Wang, G. Yang, and Z. Jiang, "Channel prediction with time-varying doppler spectrum in high-mobility scenarios: A polynomial fourier transform based approach and field measurements," IEEE Trans. Wireless Commun., 2023.

[11] J. Zhang, G. Zheng, Y. Zhang, I. Krikidis, and K.-K. Wong, "Deep learning based predictive beamforming design," IEEE Trans. Veh. Technol., 2023.

[12] Y. Shi, Z. Jiang, Y. Liu, Y. Wang, and S. Xu, "A compressive sensing based channel prediction scheme with uneven pilot design in mobile massive MIMO systems," in Proc. 13th Int. Conf. Wireless Commun. Signal Process. (WCSP), 2021, pp. 1–6.

**本页范围与校对状态：** 本页依据会议论文集版本（本地 PDF 6 页；IEEE WCNC 2024，ISBN 979-8-3503-0358-2/24，DOI 10.1109/WCNC57260.2024.10570728，©2024 IEEE）完成全文中文翻译：摘要、索引词、第 I—V 节（含 I-A/I-B、II-A 信道模型、II-B 角度—时延域转换、II-C CKM 应用前景、III 地图信道辅助预测方案（含算法 1 与线性插值 4 步骤、AR-Kalman 预测器、三类支撑集）、IV 实测场景与仿真结果、V 结论）、致谢、图 1—6 中文图注、表 I 逐格转录、参考文献 [1]—[12] 英文原条目（按原编号）均按原文结构录入；编号公式 (1)—(14) 按原文保留。表 I 已用 PDF 第 5 页渲染图逐格核对一致（频率 4.9 GHz、带宽 200 MHz、码片速率 250 Mchip/s、发射功率 35 dBm、$1\times32$ VLA、全向接收天线、PN 序列）。**逐句逐式终校未做**；图 6 的余弦相似度曲线未作数字化读取，只转录图注与正文给出的阈值结论（NLoS 0.525 m、LoS 0.725 m 或略高、0.225 m 以下两场景均有益）；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①原文式（1）中 $\mathbf h\cdot\bar{\mathbf h}^T$ 的转置位置与求和顺序按抽取文本照录（渲染图核对第 5 页仅涉及式（13）（14））；②原文式（12）的 $\mathbf x$ 更新写法（把新预测值追加到序列）在抽取中排版紧凑，已按上下文语义复原；③原文算法 1 的"分量数 $K$"在抽取行中出现但正文未再使用，照录；④表 I 中 "Chip rate 250Mchip/s" 的渲染图因连字显示为 "250Mc/hp/s"，实际含义为 250 Mchip/s；⑤该文为 IEEE 会议论文，页脚含 IEEE Xplore 授权下载声明与版权信息，**再传播许可待核验，本页不登记为可公开全文**。

{% endraw %}
