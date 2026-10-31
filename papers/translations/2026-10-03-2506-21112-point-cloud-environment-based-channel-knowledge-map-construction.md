---
layout: page
title: "基于点云环境的信道知识地图构建｜中文全文译文"
permalink: /papers/translations/2026-10-03-2506-21112-point-cloud-environment-based-channel-knowledge-map-construction/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/9af23c016d0e8af8/) · [原文 arXiv](https://arxiv.org/abs/2506.21112) · [全部目录](/papers/catalog/)

# 基于点云环境的信道知识地图构建

**原题：** Point Cloud Environment-Based Channel Knowledge Map Construction  
**作者：** Yancheng Wang（香港中文大学（深圳）深圳市未来智联网络研究院、理工学院、广东省未来智联网络重点实验室）、Wei Guo（香港科技大学电子与计算机工程系）、Chuan Huang（香港中文大学（深圳））、Guanying Chen（中山大学网络空间安全学院）、Ye Zhang（北京信息科技大学计算机学院）、Shuguang Cui（香港中文大学（深圳））；其中 Yancheng Wang 为 IEEE 研究生会员，Wei Guo、Chuan Huang、Guanying Chen、Ye Zhang 为 IEEE 会员，Shuguang Cui 为 IEEE Fellow。  
**版本：** arXiv:2506.21112v2（eess.SP），v2 日期 2025 年 6 月 27 日；原文 13 页。本文早前版本的部分内容发表于 IEEE 车载技术会议（VTC-Fall 2024）[1]。本页对应论文库 2026-10-03 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—V 节、图 1—14 图注、算法 I、参考文献 [1]—[42]（英文原条目）。原文为 arXiv 预印本，全文无编号表格；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文疑点）：** 原文的专有模块名 Point Selector 与 Neural Channel Gain Estimator 在本页译为「点选择器」与「神经信道增益估计器」，首次出现时保留英文原名；interacting objects（IOs）译为「交互对象」。另：第 IV-A 节描述第二个 AoI 的发射天线「with a downward tilt of 10 degrees 20 degrees」一句在原文中疑为「10 度或 20 度」或排版重复造成的笔误，本页按原文照录并在此加注，未擅自取值。

## 摘要

信道知识地图（channel knowledge map，CKM）为感兴趣区域提供一定程度的信道状态信息（CSI），通过降低频繁 CSI 获取的开销，成为环境感知通信的关键使能技术。然而，现有 CKM 构建方案采用过度简化的环境信息，显著损害了构建精度。为解决该问题，本文提出一种模型驱动与数据驱动相结合的方法，利用点云环境数据以及少量带位置标签的信道信息样本来构建 CKM。首先，我们提出一种新颖的点选择器（point selector）：通过基于不同到达时间（time of arrival，ToA）构造一组共焦椭球，识别出包含与多径信道增益相关环境信息的点云子集。然后，我们使用通过实地测量采集的真实数据集（包含环境点云与对应信道数据）训练神经信道增益估计器，以学习每个被选子集与其对应信道增益之间的映射。最后，实验结果表明：对功率时延谱（power delay profile，PDP）的 CKM 构建，所提方法取得 2.95 dB 的均方根误差（RMSE），显著低于传统射线追踪方法的 7.32 dB；对接收功率值（即无线电地图）的 CKM 构建，所提方法取得 1.04 dB 的 RMSE，优于 Kriging 插值方法的 1.68 dB。

**关键词：** 信道知识地图（CKM）；点云；射线追踪；功率时延谱（PDP）；无线电地图。

## I. 引言

信道状态信息（CSI）对先进无线通信技术（如正交频分复用（OFDM）与多输入多输出（MIMO））至关重要：它在动态环境中用于提升链路传输速率 [2] 并抑制多用户干扰 [3]。然而，为支持更密集的用户、更高的传输速率、更可靠的连接与更低的服务时延，下一代无线系统需要显著更多的天线（即拥有数千天线的 massive MIMO）、更高的频率（即毫米波与太赫兹）以及更宽的带宽（即数 GHz 或更高）。在上述场景下，利用导频的传统 CSI 获取方法因其巨大开销与十分有限的可扩展性，正变得极为消耗资源且不切实际 [4]–[6]。此外，作为下一代无线系统有前景的被动器件，可重构智能表面（RIS）缺乏固有的信道估计能力，完全依赖有源终端来获取 CSI，进一步造成显著的导频开销。因此，迫切需要一种革命性的 CSI 获取方法，以满足下一代无线网络爆炸式的需求。

为应对上述 CSI 获取挑战，人们提出了信道知识地图（CKM）的概念 [6]–[9]。CKM 本质上是一张在感兴趣区域（area of interest，AoI）上叠加信道参数的地图，这些参数例如接收功率 [7]、[10]、阴影衰落 [11]、[12]、多径信息 [6]、信道冲激响应（CIR）[13] 以及功率时延谱（PDP）[13]–[15]。借助 CKM，可以简化甚至消除对基于导频的 CSI 获取的需求 [9]。此外，CKM 在基站规划 [16]、基于指纹的定位 [17] 与频谱分配 [18] 等应用中也有重要价值。然而，现有 CKM 构建方法采用过度简化的环境信息，导致构建精度很低。

### A. 相关工作

已有大量 CKM 构建方法被提出，可大致分为两类：模型驱动方法与数据驱动方法。

**1）模型驱动方法：** 模型驱动方法利用刻画底层电磁（EM）波传播特性的信号模型，并结合带位置标签的信道信息来构建 CKM。这类方法可进一步分为三个子类：插值 [19]、[20]、虚拟障碍物 [21]–[23] 与射线追踪方法 [24]–[29]。

*插值方法* 利用统计模型 [19]、[20] 挖掘已测与未测信道数据之间的空间相关性——即邻近位置在阴影与散射方面表现出相似的电磁波传播特性——从而估计信道知识。文献 [19] 的作者利用实测信道数据内在的地统计依赖性，提出 Kriging 插值方法来构建 CKM。此外，由于相应路径损耗随距离逐渐变化，CKM 在 AoI 上呈现出有趣的低秩性质 [20]。利用该性质，文献 [20] 的作者证明 CKM 可由低秩矩阵很好地逼近，并提出奇异值阈值（SVT）算法用于 CKM 构建。总而言之，上述插值方法在相对简单的环境中（例如乡村地区或障碍物较少的区域）表现良好；然而在复杂城市环境中，众多建筑物与障碍物带来的大量阴影与反射会导致 CKM 呈现非平滑变化，显著降低插值方法的性能 [11]。

*虚拟障碍物方法* 同时构建 CKM 与虚拟障碍物地图，后者刻画各类障碍物诱发的阴影效应。文献 [21] 的作者提出一种层析框架：把 AoI 离散为均匀间隔的像素，并从实测数据推断逐像素的阴影损耗，从而构造空间损耗场（SLF）。类似地，文献 [22]、[23] 的作者提出隐藏多类虚拟障碍物框架，通过优化环境中虚拟障碍物的高度与类别使其与实测信道数据吻合，从而构建 CKM。尽管这些方法有效捕捉了阴影效应，但由于无法纳入真实环境信息，它们在处理反射与散射等更复杂传播现象时仍面临挑战。

*射线追踪方法* 同时利用环境与电磁波传播模型来构建 CKM [24]–[28]。这类方法把每条传播路径视为一条射线，从发射机发出多条射线并追踪其在三维环境中的轨迹；每条路径遵循反射、绕射与散射的物理规律，只有一部分射线最终到达接收机。文献 [24] 的作者利用长方体形建筑与圆柱形树木构造简化的三维环境模型，随后利用电磁理论 [30] 推导反射、阴影与散射的物理模型，以确定各路径的传播方向与衰减。尽管射线追踪方法在理论上比插值方法更精确，其实际性能往往受限于过度简化的环境模型与不准确的材料参数。

近年来，三维环境重建技术（如 LiDAR [31] 与摄影测量 [32]）的进步使人们能够以点云形式创建环境模型，其中点表示环境物体的外表面，精度可达厘米级。为在射线追踪中使用点云作为环境模型，文献 [15] 的作者通过把点云拟合为线与平面来构造平坦的边与面，再把构造出的表面用作射线追踪的三维环境模型，但这仍不能充分利用点云中的细节信息。

**2）数据驱动方法：** 近年来深度学习的发展为 CKM 构建带来了新的数据驱动（即基于 AI 的）方法 [10]–[12]。文献 [11] 的作者把 CKM 构建问题重新表述为图像到图像的预测任务：将环境信息与发射机位置转换为两张图像——一张二维环境图与一张用点标示发射机位置的发射机图。利用卷积神经网络（CNN），所提 RadioUNet 在包含多种环境与发射机位置的射线追踪仿真数据集上训练，以预测 CKM 图像。继 RadioUNet 之后，后续研究进一步推进了该思路：文献 [12] 把人工标注的建筑材料属性融入输入图像，为神经网络训练提供更丰富的信息；文献 [10] 则探索先进的生成对抗网络（GAN）以提升 CKM 构建精度。

尽管取得了上述进展，当前数据驱动方法仅为处理二维环境而设计，难以处理三维数据 [12]，例如点云或体素网格。把三维数据直接转换为二维并套用现有二维方法会造成关键三维细节的巨大损失，显著降低 CKM 构建精度 [24]。此外，当前数据驱动方法只关注估计各位置的接收信号强度，即无线电地图构建 [10]–[12]，而没有考虑更精确的信道知识（例如 PDP 与 CIR），后者需要多径信道模型来确定传播路径。

### B. 本文贡献

本文通过直接纳入三维点云环境信息来解决 CKM 构建问题。具体地，我们聚焦于估计两类信道知识：刻画不同 ToA 上信道增益的 PDP，以及共同构成无线电地图的接收功率值。采用三维环境点云是因为它能够保留丰富的几何与颜色信息，从而准确表示复杂环境结构，并捕捉与电磁波传播相关的关键特征（例如隐式编码材料属性的颜色，以及反映物体表面朝向的法向量）。

然而，利用三维点云进行 CKM 构建面临显著挑战。首先，点云缺乏可供传统射线追踪使用的表面或网格，因此难以识别影响特定传播路径的点云子集。其次，点云是无序的数据结构，现有方法若不把其转换为其他格式便无法有效利用该数据，从而损害其精度或细节。据我们所知，本文首次提出把三维环境信息纳入构建过程的、模型驱动与数据驱动相结合的 CKM 构建方法。我们的贡献总结如下：

1. 我们提出一个模型驱动模块，称为**点选择器（Point Selector）**，用于识别包含与不同到达时间（ToA）信道增益相关环境信息的点云子集。我们把这些子集称为**交互对象（interacting objects，IOs）**，因为它们通过反射、散射与阴影主动影响电磁波传播。所提模型从时间视角出发，基于不同 ToA 构造一组共焦椭球来识别 IOs，从而在完整选取 IOs 的同时保留点云固有的几何细节与传播相关特征。
2. 我们提出一个数据驱动模块，称为**神经信道增益估计器（Neural Channel Gain Estimator）**，训练它直接学习从 IOs 到信道增益的映射。所提网络专门设计用于提取点云中影响相应信道增益的固有结构信息。此外，网络利用颜色与法向量等影响电磁波传播的关键点云特征，以提升信道增益估计的精度。
3. 我们使用自行实地采集的信道 PDP 与环境点云数据开展实验，这些数据通过真实世界的测量活动系统获取。大量对比实验表明，通过充分利用点云环境信息，所提方法在 PDP 的 CKM 构建上取得 2.95 dB 的均方根误差（RMSE），优于传统射线追踪方法的 7.32 dB；在接收功率值（即无线电地图构建）的 CKM 构建上取得 1.04 dB 的 RMSE，优于 Kriging 插值方法的 1.68 dB。

本文其余部分组织如下。第 II 节给出 CKM 构建问题的系统模型；第 III 节介绍所提 CKM 构建方法；第 IV 节展示 CKM 构建的实验结果；第 V 节总结全文。

## II. 系统模型

对一个给定的 AoI $\mathcal S\subset\mathbb R^3$ 与一个位置已知的发射机$^1$ $\mathbf x_T\in\mathcal S$，我们的目标是通过纳入 $\mathcal S$ 的三维点云环境信息与有限的一组带位置标签信道数据，在 $\mathcal S$ 上构建 CKM。利用摄影测量方法 [32]，由多视角照片重建环境的三维点云。所得点云记为 $\mathcal P_{\mathrm{env}}=\{(\mathbf p_i,\mathbf s_i)|i=1,\cdots,Q\}$，其中 $\mathbf p_i\in\mathbb R^3$ 为第 $i$ 个点的坐标，$\mathbf s_i\in\mathbb R^C$ 为附加特征的拼接，包括颜色、法向量及其他辅助属性，$C$ 为特征维数，$Q$ 为点云中的点数。本文研究准静态环境，即 AoI 中的主要物体（例如建筑物与墙壁）随时间保持静止，而人类等次要移动物体被忽略。

本文考虑采样间隔为 $\Delta t$ 的多径信道模型 [33]，它完全由其离散时间 CIR $h[n]$ 刻画，即

$$
h[n]=\sum_{i=0}^{K-1}\alpha_ie^{\mathrm j\phi_i}\delta[n-i],\tag{1}
$$

其中 $K$ 为离散时间 CIR 序列的长度，$\alpha_i$ 为 ToA $t_i=t_0+i\Delta t$ 处的实值信道增益，$t_0$ 表示视距（LoS）路径的传播时间，$e^{\mathrm j\phi_i}$ 为 ToA $t_i$ 处的相位（$\mathrm j$ 为虚数单位），$\delta[n-i]$ 为 Kronecker delta 函数，当 $n=i$ 时 $\delta[n-i]=1$，当 $n\ne i$ 时 $\delta[n-i]=0$。

本文旨在恢复两类信道知识：接收功率值 $P$ 与 PDP $\mathbf h$。根据 [33] 的信道模型，二者分别定义为 $P=\sum_i\alpha_i^2$ [34] 与 $\mathbf h=[\alpha_0,\alpha_1,\cdots,\alpha_{K-1}]\in\mathbb R^K$。由于相位 $e^{\mathrm j\phi_i}$ 不参与这两个定义$^2$，我们聚焦于估计实值信道增益 $\alpha_i$ 而忽略相位。为简洁起见，下文只讨论 PDP。

本文利用 $L$ 个已观测信道知识来构建 CKM，观测信道知识集合记为 $\{(\mathbf x^o_l,\mathbf h^o_l)\}_{l=1}^{L}$，其中 $\mathbf x^o_l\in\mathbb R^3$ 为第 $l$ 个观测的位置，$\mathbf h^o_l\in\mathbb R^K$ 为该位置观测到的 PDP，$\{\mathbf x^o_1,\mathbf x^o_2,\cdots,\mathbf x^o_L\}$ 与 $\{\mathbf h^o_1,\mathbf h^o_2,\cdots,\mathbf h^o_L\}$ 分别为观测位置集合与相应 PDP 集合。CKM 构建的主要目标是确定一个函数

$$
\mathbf h=f\left(\mathbf x\,|\,\mathcal P_{\mathrm{env}},\mathbf x_T,\{(\mathbf x^o_l,\mathbf h^o_l)\}\right):\ \mathbf x\in\mathbb R^3\mapsto\mathbf h\in\mathbb R^K,\tag{2}
$$

它把 AoI 内任一接收机位置（即 $\mathbf x\in\mathcal S$ 且 $\mathbf x\notin\{\mathbf x^o_1,\mathbf x^o_2,\cdots,\mathbf x^o_L\}$）映射为其对应的信道知识 $\mathbf h\in\mathbb R^K$。该映射利用观测信道知识集合 $\{(\mathbf x^o_l,\mathbf h^o_l)\}_{l=1}^{L}$、点云 $\mathcal P_{\mathrm{env}}$ 与发射机位置 $\mathbf x_T$。

**备注 1：** 式（2）的 CKM 构建问题在理论上可通过有限元方法（FEM）求解 Maxwell 方程 [35] 来解决，即用三维网格模型替换点云 $\mathcal P_{\mathrm{env}}$。然而该方法面临显著挑战：(1) 对空间范围大、网格稠密的区域，FEM 的计算复杂度难以承受；(2) 环境中所有物体的精确材料参数（例如介电常数、磁导率与电导率）未知或难以测量，而这些参数对求解 Maxwell 方程不可或缺。因此，需要一种模型驱动与数据驱动相结合的方法，在不需要精确材料参数、也无需承担 FEM 高计算代价的前提下高效逼近电磁行为。

## III. 所提 CKM 构建方法

本节提出一种同时利用三维环境点云与观测信道知识来构建 CKM 的新方法。为直接利用未经简化或变换的三维环境点云，我们提出**点选择器**，用于识别与不同 ToA 信道增益相关的点云子集。此外，我们利用实测信道数据训练**神经信道增益估计器**，学习从所识别点云子集到信道增益的映射，从而能够利用环境点云中固有的丰富信息。

如图 1 所示，所提 CKM 构建方案由以下四部分组成：

- **点云获取：** CKM 构建方案从点云获取开始。利用摄影测量方法 [32]，以点云形式获得高精度三维环境信息。所得点云 $\mathcal P_{\mathrm{env}}$、发射机位置 $\mathbf x_T$、接收机位置 $\mathbf x$ 以及当前 ToA $t_k$ 被送入下一模块。
- **点选择器：** 该模块识别点云中其对应物体影响电磁波传播的相关点。它基于不同 ToA 区间 $[t_k,t_{k+1})$，相对于发射机与接收机位置 $\mathbf x_T$、$\mathbf x$ 构造一系列互斥的到达区域 $\mathcal R_k$（$k=0,\cdots,K-1$），并输出位于 $\mathcal R_k$ 中的点云子集 $\mathcal P_k$。
- **神经信道增益估计器：** 该模块利用所识别的点云子集 $\mathcal P_k$，估计给定 ToA 与接收机位置对应的信道增益 $\alpha_k$。
- **估计 CKM：** 估计过程按长度为 $K$ 的 PDP 序列迭代，按时间顺序把 $K$ 个信道增益估计组合为接收机位置 $\mathbf x$ 处的估计 PDP，并在整个 AoI 上重复该过程以完成 CKM。

下面我们聚焦所提 CKM 构建方案中的两个核心模块，即点选择器与神经信道增益估计器。

### A. 点选择器

所提点选择器基于以下两个事实工作：(1) 对给定 ToA $t_k$，可能存在多条同时到达接收机的传播路径，它们的传播距离均为 $d_k=ct_k$，其中 $c$ 为光速；(2) 椭圆上任意一点到其两个焦点的距离之和为常数。因此，我们受此启发使用椭圆来识别与在给定 ToA 到达的电磁波相互作用的物体。

具体地，对三维场景，我们定义一个椭球，其焦点为发射机与接收机位置 $\mathbf x_T$ 与 $\mathbf x$，使椭球上任意点 $\mathbf p$ 满足 $\|\mathbf p-\mathbf x_T\|+\|\mathbf p-\mathbf x\|=d_k$。对 ToA 序列 $t_0,\cdots,t_{K-1}$（其中 $t_k=t_0+k\Delta t$），我们构造一列共焦椭球（如图 2 所示），把环境分割为若干互不相同的区域，称为「到达区域」。第一个到达区域记为 $\mathcal R_0$，是最内层椭球内部的空间；后续到达区域记为 $\mathcal R_1,\mathcal R_2,\mathcal R_3,\cdots$，是相邻椭球之间的区域，以不同颜色示出。图 2 中的示例点 $\mathbf p_1,\cdots,\mathbf p_8$ 表示位于不同到达区域中的点，实线表示相应的传播路径，以不同颜色区分。下面详细给出这些到达区域的构造过程。

**1）第一个到达区域：** 作为最内层椭球，第一个到达区域 $\mathcal R_0$ 覆盖与在时间区间 $[t_0,t_1)$（其中 $t_1=t_0+\Delta t$）内到达的电磁波相互作用的所有物体。由于信道采样间隔 $\Delta t$ 有限，接收机在每个区间 $[t_0,t_1)$ 上累积信号能量并将其归到 ToA $t_0$，因此该区间内到达的所有电磁波都被视为在 $t_0$ 到达。

为简化起见，我们考虑三维直角坐标系，并把发射机 $\mathbf x_T$ 与接收机 $\mathbf x$ 沿 $x$ 轴对称地置于 $(-d_0/2,0,0)$ 与 $(d_0/2,0,0)$，其中 $d_0=ct_0$ 为二者之间最短路径的长度。在时间区间 $[t_0,t_1)$ 内与到达电磁波相互作用的所有点都位于一个椭球内，其尺寸由传播距离 $d_1=ct_1$ 决定。因此，第一个到达区域 $\mathcal R_0$ 定义为

$$
\mathcal R_0=\left\{(x,y,z):\ \frac{x^2}{a_1^2}+\frac{y^2}{b_1^2}+\frac{z^2}{c_1^2}<1\right\},\tag{3}
$$

其中 $a_1$、$b_1$、$c_1$ 为该椭球的半轴长度。按定义，半轴长度 $a_1$ 等于传播距离 $d_1$ 的一半，而半轴 $b_1$ 与 $c_1$ 由发射机—接收机间距 $d_0$ 与传播距离 $d_1$ 决定，分别为

$$
a_1=\frac{d_1}{2}=\frac{d_0+c\Delta t}{2},\tag{4}
$$

$$
b_1=c_1=\sqrt{\left(\frac{d_1}{2}\right)^2-\left(\frac{d_0}{2}\right)^2}.\tag{5}
$$

第一个到达区域 $\mathcal R_0$ 中的传播路径对总接收功率贡献了主要部分，因为它们比后续到达区域对应的路径更短。提高时间分辨率（即减小采样间隔 $\Delta t$）会缩短传播距离 $d_1$ 并收窄图 2 中的蓝色区域，使第一个到达区域收敛到 LoS 路径。位于 LoS 路径上的点会遮挡电磁波、衰减信道增益，导致 LoS 受阻（OLoS）或非 LoS（NLoS）$^3$。$\mathcal R_0$ 中偏离 LoS 路径的点则充当散射或反射点，把电磁波重新导向接收机。

**2）后续到达区域：** 在定义第一个到达区域之后，我们介绍如何构造后续到达区域，以选取与信道模型（1）中信道增益 $\alpha_1,\cdots,\alpha_{K-1}$ 相关的点。如图 2 所示，每个后续到达区域由相邻两个椭球之间的区域定义。对到达区域 $\mathcal R_k$，它覆盖与在时间区间 $[t_k,t_{k+1})$ 内到达的电磁波相互作用的所有点，其中 $t_k=t_0+k\Delta t$；由于信道采样间隔 $\Delta t$ 有限，这些电磁波被视为同时在 ToA $t_k$ 到达。

时间区间 $[t_k,t_{k+1})$ 决定最小与最大传播距离 $d_k$ 与 $d_{k+1}$，进而决定两个相邻椭球的尺寸。因此，到达区域 $\mathcal R_k$ 定义为

$$
\mathcal R_k=\left\{(x,y,z):\ \frac{x^2}{a_k^2}+\frac{y^2}{b_k^2}+\frac{z^2}{c_k^2}\ge1\ \text{且}\ \frac{x^2}{a_{k+1}^2}+\frac{y^2}{b_{k+1}^2}+\frac{z^2}{c_{k+1}^2}<1\right\},\quad\forall k\in\mathbb N_+,\tag{6}
$$

其中 $a_k$、$b_k$、$c_k$ 为第 $k$ 个椭球的半轴长度。与第一个到达区域相同，第 $k$ 个椭球的半轴长度 $a_k$ 为传播距离 $d_k$ 的一半，半轴 $b_k$ 与 $c_k$ 由 $d_0$ 与 $d_k$ 决定，分别为

$$
a_k=\frac{d_k}{2}=\frac{d_0+kc\Delta t}{2},\tag{7}
$$

$$
b_k=c_k=\sqrt{\left(\frac{d_k}{2}\right)^2-\left(\frac{d_0}{2}\right)^2}.\tag{8}
$$

当发射机与接收机不沿 $x$ 轴对称放置时，我们采用平移与旋转变换：首先把椭球中心 $\mathbf x_{\mathrm{cent}}=(\mathbf x+\mathbf x_T)/2$ 平移回原点，然后旋转 $x-x_T$ 轴使其与 $x$ 轴对齐。该变换同时施加于点云与收发信机，由 $\mathbf x'_p=\mathbf M_k(\mathbf p_i-\mathbf x_{\mathrm{cent}})$ 给出，其中旋转矩阵 $\mathbf M_k$ 由 Rodrigues 旋转公式 [36] 计算，完全由旋转轴 $\hat{\boldsymbol\omega}=\mathbf v\times\mathbf v_x/\|\mathbf v\times\mathbf v_x\|$ 与旋转角 $\theta=\arccos\left(\mathbf v\cdot\mathbf v_x/\|\mathbf v\cdot\mathbf v_x\|\right)$ 确定，$\mathbf v=\mathbf x-\mathbf x_T$、$\mathbf v_x=[1,0,0]$。为简洁起见，细节请读者参见 [36]。

总之，利用（3）与（6）中定义的到达区域，我们识别出一列点云子集 $\mathcal P_k=\{(\mathbf p_i,\mathbf s_i)\in\mathcal P_{\mathrm{env}}|\mathbf p_i\in\mathcal R_k\}$（$k=0,\cdots,K-1$），它们与相应 ToA 上的信道增益相关。点选择器的工作流程汇总于算法 I。

**备注 2：** 该点选取方法建立了环境特定部分与相应信道增益之间的联系，使得仅用相关点云子集即可进行精确估计。此外，该方法保证纳入与给定 ToA 相关联的所有点，并保留原始点云格式以维持高精度几何与辅助特征。为可视化所选点云子集，图 3 给出一个示例，其中不同颜色表示 ToA $t_0$ 处不同接收机位置对应的点云子集。

**算法 I：点选择器——选取 ToA $t_k$ 对应的点云子集 $\mathcal P_k$**

- **输入：** 点云 $\mathcal P_{\mathrm{env}}$、位置 $\mathbf x_T$ 与 $\mathbf x$、时间区间 $[t_k,t_{k+1})$。
- **输出：** 所选点云 $\mathcal P_k$。
1. 构造椭球：
2. 计算 LoS 路径长度 $d_0=\|\mathbf x-\mathbf x_T\|$。
3. 由式（3）或（6）计算到达区域 $\mathcal R_k$。
4. 定义变换：
5. 计算椭球中心 $\mathbf x_{\mathrm{cent}}=(\mathbf x+\mathbf x_T)/2$。
6. 利用 Rodrigues 旋转公式 [36] 确定旋转矩阵 $\mathbf M_k$。
7. 选取点：
8. **对** 每个点 $(\mathbf p_i,\mathbf s_i)\in\mathcal P_{\mathrm{env}}$ **执行**
9. 　变换其坐标 $\mathbf x'_p=\mathbf M_k(\mathbf p_i-\mathbf x_{\mathrm{cent}})$。
10. 　**若** $\mathbf x'_p\in\mathcal R_k$ **则**
11. 　　把点 $(\mathbf p_i,\mathbf s_i)$ 加入集合 $\mathcal P_k$。
12. 　**end if**
13. **end for**

### B. 神经信道增益估计器

本小节介绍神经信道增益估计器——一种数据驱动方法，旨在直接学习从所选点云子集到相应信道增益的复杂映射。虽然可用传统射线追踪方法估计信道增益，但其精度受限于过度简化的环境模型与不准确的材料参数。相反，所提神经信道增益估计器直接从真实世界测量中学习，从而绕开对显式电磁建模与材料参数的需求。通过利用点云中编码的详细几何信息以及精心设计的电磁波传播相关辅助特征，所提神经信道增益估计器在真实复杂环境中实现了更精确的信道增益估计。

如系统模型所述，信道在 $L$ 个位置被测量，$\{\mathbf h^o_1,\mathbf h^o_2,\cdots,\mathbf h^o_L\}$ 为观测 PDP 集合。每个 PDP $\mathbf h^o_l$ 记录从第一个到最后一个 ToA 的信道增益 $[\alpha_{l,0},\alpha_{l,1},\cdots,\alpha_{l,K-1}]$，其中 $\alpha_{l,k}$ 为第 $l$ 个位置、第 $k$ 个 ToA 上的信道增益。因此共获得 $S=L\cdot K$ 个样本，用于训练神经估计器学习从所选点云到信道增益的映射。

我们定义函数 $g(\cdot)$ 表示从所选点云 $\mathcal P_k$ 到信道增益 $\alpha_k$ 的映射，即

$$
\alpha_k=g(\mathcal P_k),\tag{9}
$$

其中函数 $g(\cdot)$ 由深度神经网络（DNN）$g_\omega(\cdot)$ 参数化，参数 $\omega$ 待学习。

**1）神经网络架构：** 如图 4 所示，所提神经信道增益估计器由四个关键部分组成：采样层、分组层、PointNet 层与多层感知机（MLP）。网络架构以文献 [37] 的层次化处理结构开始，包含两个集合抽象层级。每个集合抽象层级从一组邻近点中聚合几何特征与传播相关特征，生成更抽象、更高维的特征；具体地，第一个集合抽象层级提取点云内的局部特征，第二个层级捕捉全局特征。处理后的点云随后经 PointNet 编码为一个向量，再由 MLP 映射为信道增益估计。

*输入表示：* 所选点云数据 $\mathcal P_k$ 被组织为矩阵 $\mathbf X\in\mathbb R^{N\times(d+C)}$ 作为输入，其中 $N$ 为点数，$d$ 为坐标维数，$C$ 为特征维数。为保证输入尺寸固定，点数多于 $N$ 的点云被随机降采样，少于 $N$ 的点云则通过复制现有点进行填充。

*第一个集合抽象层级：* 每个集合抽象层级由采样层、分组层与 PointNet 层组成。

采样与分组层在保留三维空间关系的同时检测局部几何。在采样层中，利用最远点采样（FPS）采样 $N_1$ 个点；该方法迭代地选取使点云空间覆盖最大化的点，保证每个新选点距已选点集最远。在分组层中，每个采样点找出其 $K_1$ 个最近邻，形成用于局部上下文的簇。重要的是，采样层与分组层都对输入点的重排不变，从而有效应对点云中无序点的处理难题——由于点云缺乏固有顺序，网络必须对输入点的 $N!$ 种可能排列保持不变。经采样与分组后的点云分别记为 $\mathbf X_1\in\mathbb R^{N_1\times(d+C)}$ 与 $\mathbf X_2\in\mathbb R^{N_1\times K_1\times(d+C)}$。

随后，PointNet [38] 层处理采样并分组后的点云。与传统在网格数据上操作的 CNN 不同，PointNet 处理无序点集，因此天然适合处理不规则、分布不均匀的点云数据 [38]。PointNet 包含 MLP 与最大池化，用于编码并聚合区域特征。MLP 作用于每个点，以分析空间关系并融入颜色、法向量、入射角与出射角等影响信道增益的附加特征。由于同一 MLP 在所有点上共享，该部分网络对输入点重排不变；最大池化则捕捉每组点中最显著的特征，进一步保证对重排的不变性。电磁波与不同局部区域之间的复杂相互作用通过该过程被学习，最终输出以质心点表示区域特征的点云，即 $\mathbf X_3\in\mathbb R^{N_1\times(d+C_1)}$，其中 $C_1$ 为区域特征的维数。

*第二个集合抽象层级：* 对 $\mathbf X_3$ 施加第二个集合抽象层级，以聚焦更大的空间区域并从更全局的视角提取特征，生成更小的点云子集。经第二次采样、分组与 PointNet 层后的点云分别记为 $\mathbf X_4\in\mathbb R^{N_2\times(d+C_1)}$、$\mathbf X_5\in\mathbb R^{N_2\times K_2\times(d+C_1)}$ 与 $\mathbf X_6\in\mathbb R^{N_2\times(d+C_2)}$。

*最终层：* 最后一个 PointNet 层把点云 $\mathbf X_6$ 编码为向量 $\mathbf x_7\in\mathbb R^{C_3}$，再经 MLP 估计信道增益 $\hat\alpha_i$。MLP 之间插入批归一化（BN）与 Dropout（DP）层，分别用于稳定训练与防止过拟合。

该架构有效利用无序点云中固有的几何与丰富信息来准确估计信道增益。损失函数与训练策略在下一小节讨论。

**2）损失函数与训练：** 为训练网络 $g_\omega(\cdot)$，损失函数基于均方误差（MSE）专门设计。首先，针对空点云（即 $\mathcal P_k=\varnothing$）的训练样本，我们排除相应损失，因为空的所选点云子集表明发射机到接收机之间不存在传播路径。其次，对低于噪声底值 $\alpha_{\min}$ 的估计信道增益 $\hat\alpha_i$，直接把信道增益设为噪声底。基于上述考虑，损失函数为

$$
\mathcal L(\omega)=\frac{1}{S'}\sum_{i=1}^{S}I_i\left\|\alpha_i-\max\left(\alpha_{\min},\hat\alpha_i\right)\right\|^2,\tag{10}
$$

其中 $\hat\alpha_i$ 为估计信道增益，$S'$ 为点云非空的训练样本数，$S=L\cdot K$ 为整个训练集大小，当选出的点云非空时 $I_i=1$、否则 $I_i=0$，$\alpha_i$ 为真值信道增益。通过优化该损失函数得到最优网络参数，即 $\omega=\arg\min_\omega\mathcal L(\omega)$，该优化使用随机梯度下降（SGD）进行。

采用监督学习方法时，网络以新颖的**基于位置的数据划分策略**训练，以防止训练过程中从测试位置泄漏任何信息。与随机划分全部 $L\cdot K$ 个样本的传统数据集划分不同，我们把 $L$ 个位置划分为 $L_1$ 个训练位置与 $(L-L_1)$ 个测试位置，从而得到用于训练的 $L_1\cdot K$ 个样本与保留用于测试的 $(L-L_1)\cdot K$ 个样本。
## IV. 实验结果与讨论

本节把所提方法与其他先进方法进行较全面的比较。与大多数仅依赖合成数据集的已有研究不同，我们基于自行实地采集的数据开展实验，数据同时包含信道 PDP 测量与环境点云。

### A. 实验设置

我们的实地数据采集在香港中文大学（深圳）校园的两个地点进行。信道测量通过带宽 600 MHz 的宽带信道探测系统获得；高分辨率点云通过基于无人机的摄影测量采集，提供环境的详细三维表示。

**1）信道探测设置：** 我们的宽带信道探测仪由 Keysight M9484C 矢量信号发生器（VSG）与 Keysight N9032B 信号分析仪组成。在发射端，以 600 Msps（兆符号每秒）的速率生成长度为 4096 符号的探测序列，然后在 VSG 中上变频到 4.6 GHz 的中心频率。VSG 的输出功率为 30 dBm。所生成的射频（RF）信号随后馈入主瓣增益 12 dBi、半功率波束宽度（HPBW）47.8 度的喇叭天线，辐射到自由空间。在接收端，RF 信号由一副在 4.6 GHz 水平方向平均增益为 −4.5 dBi 的全向天线接收；接收信号下变频到基带后，经自相关算法 [39] 处理以获得 PDP。该信道探测系统的时间分辨率为 $\Delta t=1/B=1.6667$ ns。收发天线均为垂直极化。每次测量对 10 次测量取平均，从而消除小尺度衰落效应。

**2）测量活动：** 如图 5 所示，测量活动在校园内两个绿化广场场地进行。第一个 AoI 共测量 96 个位置，第二个 AoI 共测量 90 个位置。第一个 AoI（图 5(a)—(c)）由建筑的三面围合，其表面由玻璃窗与混凝土墙面构成；该广场尺寸为 $30\times30$ m$^2$，建筑高度 25 m。第二个 AoI（图 5(d)—(f)）是一个 $30\times100$ m$^2$ 的方形区域，两侧有建筑，场地内外均有树木。第一个 AoI 中，发射天线放置在高度 10.6 m 的窗边，向下倾斜 10 度；第二个 AoI 中，发射天线位于高度 15 m 的屋顶露台，向下倾斜 10 度 20 度（原文疑点，见页首译注）。两个场地的接收机高度均为 1 m。

所有这些测量区域都类似 3GPP 城市微小区（UMi）场景，以周边建筑与环境杂波为特征。大多数测量收发链路为 LoS，部分被树木或其他障碍物遮挡而形成 OLoS；此外，还有一小部分测量链路为 NLoS，即不存在 LoS 路径，接收功率主要来自反射、散射与绕射。

**3）点云获取：** 为获得某 AoI 的点云，一架搭载相机的无人机（UAV）从 AoI 上方拍摄多视角图像，再用应用摄影测量的三维环境重建软件处理这些图像，生成环境的三维模型。

具体地，我们使用搭载 Zenmuse P1 相机的 DJI M300 RTK 无人机在香港中文大学（深圳）进行三维航测。UAV 沿预规划航线飞行，航线由基于目标重建精度的航线规划应用生成，从多个角度拍摄图像。随后图像由 DJI Terra 软件通过摄影测量方法处理以生成网格模型，再由 CloudCompare 软件处理以生成包含法向量与颜色等详细特征的点云。

为香港中文大学（深圳）校园生成的点云约含 5890 万个点。DJI Terra 软件报告的重建均方根误差（RMSE）为 2.5 cm，表明重建点与真实位置之间偏差很小。该误差在不同物体间存在差异：玻璃等透明物体相比不透明表面表现出更大误差；透明物体的精确重建仍是三维环境重建中的难题 [40]。

### B. 点选择器验证

本小节展示所提点选择器选取与给定 ToA 相关点的能力，并与其他方法比较性能。精确识别这些点对有效利用环境信息、提升构建精度至关重要。如引言的相关工作所述，只有射线追踪方法能够利用三维环境信息，因此我们把点选择器与该类别中两种代表性方法比较。

- **Wireless Insite 射线追踪 [27]：** 作为无线信道预测中使用最广泛、认可度最高的射线追踪工具之一，许多无线电地图构建研究采用该软件生成真值数据集。其使用的环境信息为基于网格的模型，材料属性按 ITU 建议 [41] 设置。
- **点云射线追踪 [13]–[15]：** 这些研究把射线追踪适配到点云数据。与其他射线追踪方法类似，该方法先简化环境，再利用电磁波传播模型与介电常数参数计算传播损耗。按该文设置，点云通过选取最近的 8 个点拟合平面来构造平坦表面，介电常数则利用实测 PDP 获得。

对反射点识别，图 6 给出一个典型示例。如图 6(a) 的实测 PDP 所示，在 ToA 第 72 步处存在一个显著峰值，对应一条强反射路径。图 6(b) 的 Wireless Insite 正确识别出反射点，但只检测到单点。图 6(c) 的点云射线追踪方法能够检测到发生反射的一簇点；相比之下，图 6(d) 的本方法识别出更完整的点云子集。图 6(c) 与 (d) 的对比表明，点云射线追踪方法往往把远离实际反射位置的点也纳入，导致反射识别不准确；相反，所提点选择器准确识别与指定 ToA 相关的点，并表明反射点周围区域同样对反射有贡献。该能力使我们的方法能够更准确地识别反射点，并以更高精度估计信道增益。

对漫散射点识别，点选择器同样表现出更优性能，如图 7 所示。沿 ToA 第 72 步的反射路径之后，存在若干后续漫散射路径（图 7(a)），而传统方法往往忽略它们。Wireless Insite 使用 Lambertian 散射模型 [42]，假定散射在整个墙面上发生，并把墙面划分为多段进行计算，但不识别具体点，故不参与比较。图 7(b) 的点云射线追踪在墙面与地面上识别出数量有限的离散散射点，但无法找到完整区域；相反，图 7(c) 的本方法识别出更完整的点云子集，并揭示出与不同 ToA 对应的同心环状区域：内环对应早到达路径，依次向外的环对应晚到达路径。这一同心环状散射观测表明，散射并非在表面上均匀发生，而是集中于反射区域周围的环带内。

因此，点选择器基于 ToA 提供了准确而全面的点识别，克服了传统射线追踪方法无法有效利用点云数据的局限。其有效性建立在上一节的理论框架之上，并在不同位置与 ToA 上观察到一致结果；此外，其有效性亦由下游 CKM 构建结果加以验证。

### C. CKM 构建结果

本小节把所提方法的基于 PDP 的 CKM 构建性能与其他基准方法比较。如上一小节所述，在所讨论的方法中只有射线追踪方法能够估计 PDP，因此比较聚焦于前述两个基准。

我们把数据集划分为训练与测试两段：具体地，80% 的位置用于训练模型，其余 20% 用于测试模型精度。

**1）指标：** 为定量评估模型的估计精度，采用 RMSE 指标，其计算为 $\mathrm{RMSE}(\mathbf h,\mathbf h^*)=\sqrt{\|\mathbf h-\mathbf h^*\|_2^2/N}$。该指标有效刻画了估计 PDP $\mathbf h^*$ 与实际 PDP $\mathbf h$ 之间的偏差，以分贝直接度量估计误差，从而便于直观评估模型精度。

**2）构建结果：** 我们通过在三个代表性位置上比较估计 PDP 与实测 PDP，评估所提方法相对其他射线追踪基准的性能。这些比较表明该方法在捕捉实测 PDP 的主要峰值与总体趋势方面的有效性；除这些具体示例外，我们还给出基于 RMSE 指标的跨方法综合评估，突出所提方法更优的精度与一致性。

图 8 给出三个示例，说明估计 PDP 与实测 PDP 的比较。各图绘制信道增益随 ToA 步数的变化，时间分辨率为每步 1.667 ns；为便于可视化，图中使用相对 ToA，即首个路径的到达时间置零。在这些示例中，所提方法的估计 PDP 以很高精度紧跟实测 PDP，捕捉到主要峰值与总体趋势。尽管部分估计值在峰值高度上存在轻微偏差，模型仍有效识别出显著的多径分量，且时间对齐精确。总之，估计结果不仅在峰值时刻上吻合，在幅度上也吻合，表明模型具有稳健的估计能力。

图 8 还给出其他射线追踪基准的 PDP 估计。传统射线追踪方法虽能在实测 PDP 中识别出反射路径（实测 PDP 的峰值），却也在实测 PDP 并无对应峰值处引入误差路径，这些不准确会显著降低估计精度。此外，这些方法虽然可以相对准确地预测反射 ToA，却无法准确估计信道增益；信道增益估计的偏差尤为显著，误差达 5—10 dB，例如图 8 中位置 7 的 ToA 第 3 步。另外，它们难以识别反射路径之后的散射路径，也无法检测信道增益相对较小的反射路径，从而导致整体信道 PDP 估计出现较大误差。

图 9 的箱线图给出各方法的总体 RMSE 值，展示两个 AoI 中测试位置上的 RMSE。由图可见，所提方法在两个 AoI 均取得最低的 PDP 估计 RMSE，平均值分别为 2.95 dB 与 3.84 dB；相比之下，Wireless Insite 射线追踪方法的 RMSE 更高，分别为 7.32 dB 与 8.11 dB，点云射线追踪方法的 RMSE 为 6.79 dB 与 8.43 dB。这表明我们的方法带来显著改进，在两个 AoI 中相对两种方法均降低约 4 dB 误差。此外，所提方法不仅平均误差更小，其误差分布的方差也更低，凸显了更优的精度与一致性。

### D. 无线电地图构建结果

本小节进一步评估所提方法在接收功率值（即无线电地图）CKM 构建方面的能力。除前述射线追踪方法外，我们还加入一种基于 AI 的方法与一种插值方法作比较。新增方法的设置如下：

- **RadioUNet 神经网络 [11]：** RadioUNet 采用图像到图像的深度学习方法估计无线电地图，输入图像由一张二维建筑图与一张标示发射机位置的图像组成，输出为给定 AoI 的构建无线电地图。由于输出图像的像素值范围为 0—255，需进行后处理，利用训练集使估计与实测值对齐。
- **Kriging 插值 [19]：** 该方法源自地统计插值，现广泛用于构建无线电地图。比较中实现回归 Kriging（RK），半方差模型采用指数模型。

两个 AoI 中无线电地图构建的对比结果见图 10 与图 11，其中实测接收功率值以灰色方块标出。为评估所构建无线电地图的质量，我们考察实测值与其周围估计值之间的相似性：实测点与其周边区域颜色差异越小，说明构建精度越高。

四种方法都成功捕捉到无线电地图的总体趋势（自由空间传播损耗），即距发射机越近的位置接收信号越强，信号强度随距离增大而减弱。然而，在无线电地图中由更复杂现象（即阴影、反射与散射）引起不规则变化的区域，各方法性能差异显著，这些差异揭示了各方法的特性与精度差异。

如图 10(a) 所示，所提方法给出高度精确的无线电地图构建结果，以显著精度捕捉细粒度细节。例如，左上方的暗区与右下方的亮区清楚反映了该方法从测量数据中学习环境特定传播特性的能力。它还准确反映了阴影现象：环境中存在三棵树，但较近的两棵树并不茂密且天线相对较高，因此其信号衰减影响并不严重。相反，较远的树对测量产生显著遮挡效应，导致更明显的衰减。这些依赖于三维环境信息的环境差异被该方法充分利用。换言之，学习到的模型并非简单、均匀的传播模型，而与实际点云环境高度相关，使其能够从环境与测量数据的关系中获得有价值的洞见。

如图 10(b) 所示，Wireless Insite 射线追踪对大尺度衰减给出较为准确的估计；然而在存在复杂多径或障碍物的区域（即左上区域），出现与实测明显不同的偏差，射线追踪未能充分捕捉这些效应，所得无线电地图相比实测点显得更平滑。

如图 10(c) 所示，基于 AI 的 RadioUNet 成功捕捉到自由空间传播损耗与阴影效应，清楚表现出环境中三棵树的阴影效应；然而其预测仍与实际测量存在明显偏差。例如，较近的两棵树由于树叶稀疏，在实测数据中造成的信号衰减很小，但 RadioUNet 因为无法利用三维环境信息而高估了它们的阴影效应。此外，树木引入的散射效应高度复杂，若不采用模型驱动与数据驱动相结合的方法便难以准确建模。该模型还倾向于高估发射机附近的信号强度，进一步加大其与真实测量结果的失配。

如图 10(d) 所示，Kriging 插值方法在构建无线电地图方面取得较好精度，有效捕捉到该 AoI 的全局趋势，即上方信号较弱、下方信号较强；然而，由于缺乏物理传播建模、无法纳入环境信息，所得无线电地图过于平滑，在测量稀疏的情况下尤为明显。突变区域（例如由树木或其他障碍物导致信号快速下降的区域）未能被很好捕捉；此外，边缘区域（如左下角）缺乏足够实测数据，进一步降低精度，反映出空间插值方法的常见局限。图 11 的结果与图 10 类似，故对第二个 AoI 不再赘述。

图 12 的箱线图给出不同方法构建无线电地图的 RMSE。所提方法取得最低 RMSE，两个 AoI 分别为 1.04 dB 与 0.59 dB；相比之下，Wireless Insite 射线追踪的 RMSE 较高，为 2.88 dB 与 1.92 dB，Kriging 方法的 RMSE 为 1.68 dB 与 0.99 dB。至于输出 0—255 像素值的 RadioUNet，其到接收功率的转换会引入大量误差，在被树木覆盖的区域尤为明显——该模型预测障碍物内部无信号接收，使直接数值比较意义不大。这些结果表明，我们的方法显著优于 Wireless Insite 与 Kriging，给出更准确、更一致的结果。

通过利用真实世界环境信息，所提方法捕捉到环境与无线信道之间的复杂关系。把三维环境信息与实测值相结合，它在复杂真实条件下取得更高的估计精度，优于传统射线追踪、插值与基于 AI 的方法，并对复杂传播现象给出更准确的重建。

### E. 点云密度对 CKM 重建精度的影响

为进一步分析点云对 CKM 构建的影响，本小节研究 CKM 精度与点云密度之间的关系，因为点云是所提方法的关键输入。如图 13 所示，该实验使用第一个 AoI 的降采样点云数据进行。原始点云含 200 万个点（代表 100% 密度），我们按不同比例降采样以评估不同密度下的性能。

如图 14 所示，结果分两种情况给出：第一种（红线）包含每个点全部对应特征 $\mathbf s_i$，包括颜色、法向量、距离以及入射角与出射角；第二种（蓝线）只包含每个点的坐标与颜色信息。值得注意的是，蓝线在不同密度下始终位于红线上方，表明提供更多辅助信息对更准确的 CKM 估计有很大贡献。

我们还观察到，随着点云密度降低，估计误差最初逐渐增大；然而一旦点云密度不足以捕捉场景整体形状（即低于 1%），误差增长更为迅速，在 1% 与 0.1% 密度下性能退化尤为显著。我们将其归因于本实验环境结构相对规则，即使在较低点云密度下仍可获得可接受的 CKM 构建精度——在该环境中主导路径主要为 LoS 路径与来自平坦表面的反射路径，可用较低点密度捕捉。为验证该假设，需要在更复杂环境中开展进一步实验，以更好地理解结构复杂度如何影响所需的点云密度。

总体而言，结果表明点云密度降低会导致构建精度下降，从而强调高精度点云数据对准确 CKM 构建的重要性。

## V. 结论

本文提出一种模型驱动与数据驱动相结合、利用三维点云环境数据与带位置标签信道信息来构建 CKM 的方法。该方法包含两个关键模块：点选择器与神经信道增益估计器。点选择器有效利用三维点云环境信息，识别与给定 ToA 信道增益相关的点云子集；神经信道增益估计器随后利用点云中固有的几何与辅助信息，把这些识别出的点云子集映射为信道增益。为验证该方法，我们在两个校园 AoI 上开展了信道 PDP 测量与环境点云的实地数据采集。实验结果表明，所提方法优于传统射线追踪方法与 SOTA 基于 AI 的方法。通过把详细环境信息纳入信道估计过程，我们的方法填补了 CKM 构建与信道建模中的关键空白，为迫切需要准确信道知识的下一代无线通信系统提供了一种有前景的解决方案。

## 原文脚注（译）

1. 所提方法可容易地推广到 AoI 内存在多个发射机的情形：可以对各发射机的接收功率值求和，或在每个位置选择最强信号。
2. 文献 [24] 也已指出，相位受许多随机因素（例如小型移动物体）影响，通常被建模为随机参数，故本文将其忽略。
3. 严格来说，与电磁波通过阴影、反射或散射发生相互作用的是点所表示的物理对象；然而由于环境以点云建模，这些相互作用可归因于相应的点。

## 图注与表注

**图 1（原文第 4 页）：** 所提 CKM 构建方法的流程图。流程依次为点云获取（$\mathcal P_{\mathrm{env}}$、发射机位置 $\mathbf x_T$、接收机位置 $\mathbf x$、当前 ToA $t_k$）→ 点选择器 → 神经信道增益估计器 → 估计 CKM；图中给出 $t_k$ 是否遍历完全部 ToA 的判断循环（$t_{k+1}=t_k+\Delta t$）。

**图 2（原文第 4 页）：** 到达区域的二维截面视图。图中给出以收发机为焦点的共焦椭圆族、LoS 路径、不同颜色的到达区域（$\mathcal R_0,\mathcal R_1,\mathcal R_2,\dots$）以及位于不同区域内的示例点 $\mathbf p_1,\dots,\mathbf p_8$ 与相应传播路径。

**图 3（原文第 5 页）：** 第一个 ToA 处不同接收机位置对应的所选点云子集。图中以不同颜色标出 trace 0—trace 16 对应的点云子集。

**图 4（原文第 6 页）：** 神经信道增益估计器的架构。输入点云尺寸为 $(N,d+C)$，经两个集合抽象层级（采样、分组、PointNet）分别得到 $(N_1,d+C)$、$(N_1,K_1,d+C)$、$(N_1,d+C_1)$ 与 $(N_2,K_2,d+C_1)$、$(N_2,d+C_2)$ 等表示，随后经 PointNet 编码为 $C_3$ 维向量，再由 MLP（含 BN 与 Dropout）输出估计信道增益；图中还标出最大池化与共享 MLP。

**图 5（原文第 8 页）：** 信道探测场地与点云示意。第一行：第一个 AoI，位于香港中文大学（深圳）下园；第二行：第二个 AoI，位于上园。每个 AoI 从左到右为：1）环境照片；2）点云；3）带物体颜色的点云，其中红点表示信道测量位置。

**图 6（原文第 9 页）：** 在第一个 AoI 中第 15 个接收机位置处识别反射点的对比示例。(a) PDP 测量；(b) Wireless Insite 射线追踪；(c) 点云射线追踪；(d) 本文方法。图中标出反射路径。

**图 7（原文第 9 页）：** 在第一个 AoI 中第 15 个接收机位置处识别漫散射物体的对比示例。(a) PDP 测量；(b) 点云射线追踪；(c) 本文方法。图中给出 ToA 第 72—76 步的散射路径与 73—76 的标注。

**图 8（原文第 10 页）：** 第一个 AoI 中本文方法与各基准的 PDP 构建示例。三个面板分别为位置 7、位置 45 与位置 53 的 PDP，横轴为相对 ToA（每步 1.667 ns），纵轴为信道增益（dBm）；图例包括 Wireless Insite 射线追踪、点云射线追踪、本文方法与实测值。

**图 9（原文第 10 页）：** 本文方法与其他基准在两个 AoI 中的 RMSE 对比（箱线图，纵轴为 RMSE，单位 dB）。

**图 10（原文第 11 页）：** 第一个 AoI 中固定发射机位置下、由采样点构建的接收功率无线电地图。(a) 本文方法；(b) Wireless Insite 射线追踪；(c) RadioUNet；(d) Kriging。图中灰色方块为实测点，颜色条范围 50—75 dB，横轴 X（0—40 m）、纵轴 Y（0—20 m）。

**图 11（原文第 11 页）：** 第二个 AoI 中固定发射机位置下、由采样点构建的接收功率无线电地图。(a) 本文方法；(b) Wireless Insite 射线追踪；(c) RadioUNet；(d) Kriging。颜色条范围 50—60 dB，横轴 X（0—50 m）、纵轴 Y（0—30 m）。

**图 12（原文第 11 页）：** 本文方法与其他基准在两个 AoI 中的 RMSE 对比（箱线图，纵轴 RMSE 0—5 dB，横轴为 WI-RT、RadioUNet、Kriging、Proposed）。

**图 13（原文第 12 页）：** 第一个 AoI 中不同密度点云的示意：(a) 100% 密度；(b) 50% 密度；(c) 10% 密度；(d) 1% 密度；(e) 0.1% 密度。

**图 14（原文第 12 页）：** 不同点云密度下 CKM 构建精度的对比。横轴为点云密度（0.01%—100%，对数坐标），纵轴为 RMSE（2—8 dB）；两条曲线分别为完整特征（Full Feature）与简化特征（Reduced Feature）。

**表注：** 原文全文无编号表格（仅图 1—14），故本页无需转录表格。

## 参考文献（英文原书目）

[1] Y. Wang, Y. Li, G. Chen, and C. Huang, "Channel knowledge maps construction based on point cloud environment information," in Proc. IEEE Veh. Technol. Conf. (VTC-Fall), 2024, pp. 1–5.
[2] O. L. López, N. H. Mahmood, H. Alves, C. M. Lima, and M. Latva-aho, "Ultra-low latency, low energy, and massiveness in the 6G era via efficient CSIT-limited scheme," IEEE Commun. Mag., vol. 58, no. 11, pp. 56–61, Nov. 2020.
[3] I. Budhiraja, R. Gupta, N. Kumar, S. Tyagi, S. Tanwar, and J. J. Rodrigues, "Interference mitigation and secrecy ensured for noma-based D2D communications under imperfect CSI," in Proc. IEEE Int. Conf. Commun. (ICC), 2021, pp. 1–6.
[4] C.-X. Wang, X. You, X. Gao, X. Zhu, Z. Li, C. Zhang, H. Wang, Y. Huang, Y. Chen, H. Haas, J. S. Thompson, E. G. Larsson, M. D. Renzo, W. Tong, P. Zhu, X. Shen, H. V. Poor, and L. Hanzo, "On the road to 6G: Visions, requirements, key technologies, and testbeds," IEEE Commun. Surveys Tutor., vol. 25, no. 2, pp. 905–974, 2nd Quart., 2023.
[5] Y. Han, S. Jin, M. Matthaiou, T. Q. S. Quek, and C.-K. Wen, "Toward extra large-scale MIMO: New channel properties and low-cost designs," IEEE Internet Things J., vol. 10, no. 16, pp. 14 569–14 594, Aug. 2023.
[6] Y. Zeng and X. Xu, "Toward environment-aware 6G communications via channel knowledge map," IEEE Wireless Commun., vol. 28, no. 3, pp. 84–91, Mar. 2021.
[7] D. Romero and S.-J. Kim, "Radio map estimation: A data-driven approach to spectrum cartography," IEEE Signal Process. Mag., vol. 39, no. 6, pp. 53–72, Nov. 2022.
[8] X. Wang, X. Wang, S. Mao, J. Zhang, S. C. Periaswamy, and J. Patton, "Indoor radio map construction and localization with deep Gaussian processes," IEEE Internet Things J., vol. 7, no. 11, pp. 11 238–11 249, Nov. 2020.
[9] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Commun. Surveys Tutor., early access, 2024, doi: 10.1109/COMST.2024.3364508.
[10] S. Zhang, A. Wijesinghe, and Z. Ding, "RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network," IEEE Internet Things J., vol. 10, no. 20, pp. 18 016–18 027, Oct 2023.
[11] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, June 2021.
[12] S. Bakirtzis, J. Chen, K. Qiu, J. Zhang, and I. Wassell, "EM DeepRay: An expedient, generalizable, and realistic data-driven indoor propagation model," IEEE Trans. Antennas Propag., vol. 70, no. 6, pp. 4140–4154, June 2022.
[13] U. T. Virk, S. L. H. Nguyen, K. Haneda, and J.-F. Wagen, "On-site permittivity estimation at 60 GHz through reflecting surface identification in the point cloud," IEEE Trans. Antennas Propag., vol. 66, no. 7, pp. 3599–3609, Jul. 2018.
[14] P. Koivumäki, G. Steinböck, and K. Haneda, "Impacts of point cloud modeling on the accuracy of ray-based multipath propagation simulations," IEEE Trans. Antennas Propag., vol. 69, no. 8, pp. 4737–4747, Aug. 2021.
[15] J. Järveläinen, K. Haneda, and A. Karttunen, "Indoor propagation channel simulations at 60 GHz using point cloud data," IEEE Trans. Antennas Propag., vol. 64, no. 10, pp. 4457–4467, Oct. 2016.
[16] D. Bethanabhotla, O. Y. Bursalioglu, H. C. Papadopoulos, and G. Caire, "Optimal user-cell association for massive MIMO wireless networks," IEEE Trans. Wireless Commun., vol. 15, no. 3, pp. 1835–1850, Mar. 2015.
[17] J. Gao, D. Wu, F. Yin, Q. Kong, L. Xu, and S. Cui, "Metaloc: Learning to learn wireless localization," IEEE J. Sel. Areas Commun., vol. 41, no. 12, pp. 3831–3847, Dec. 2023.
[18] S. Debroy, S. Bhattacharjee, and M. Chatterjee, "Spectrum map and its application in resource management in cognitive radio networks," IEEE Trans. Cogn. Commun. Netw., vol. 1, no. 4, pp. 406–419, Dec. 2015.
[19] V.-P. Chowdappa, C. Botella, J. J. Samper-Zapater, and R. J. Martinez, "Distributed radio map reconstruction for 5G automotive," IEEE Intell. Transp. Syst. Mag., vol. 10, no. 2, pp. 36–49, Feb. 2018.
[20] S. Chouvardas, S. Valentin, M. Draief, and M. Leconte, "A method to reconstruct coverage loss maps based on matrix completion and adaptive sampling," in Proc. IEEE Int. Conf. Acoust., Speech Signal Process. (ICASSP), 2016, pp. 6390–6394.
[21] D. Romero, D. Lee, and G. B. Giannakis, "Blind radio tomography," IEEE Trans. Signal Process., vol. 66, no. 8, pp. 2055–2069, Apr. 2018.
[22] J. Chen, O. Esrafilian, D. Gesbert, and U. Mitra, "Efficient algorithms for air-to-ground channel reconstruction in UAV-aided communications," in IEEE Globecom Workshops (GC Wkshps), 2017, pp. 1–6.
[23] W. Liu and J. Chen, "Geography-aware radio map reconstruction for UAV-aided communications and localization," in Proc. IEEE Int. Conf. Commun. (ICC), 2021, pp. 1–6.
[24] J. C. da Silva and E. Costa, "A ray-tracing model for millimeter-wave radio propagation in dense-scatter outdoor environments," IEEE Trans. Antennas Propag., vol. 69, no. 12, pp. 8618–8629, Dec. 2021.
[25] D. He, B. Ai, K. Guan, L. Wang, Z. Zhong, and T. Kürner, "The design and applications of high-performance ray-tracing simulation platform for 5G and beyond wireless communications: A tutorial," IEEE Commun. Surveys Tutor., vol. 21, no. 1, pp. 10–27, 1st Quart, 2018.
[26] J.-H. Jung, J. Lee, J.-H. Lee, Y.-H. Kim, and S.-C. Kim, "Ray-tracing-aided modeling of user-shadowing effects in indoor wireless channels," IEEE Trans. Antennas Propag., vol. 62, no. 6, pp. 3412–3416, June 2014.
[27] Remcom, "Wireless Insite® 3D wireless prediction software." [Online]. Available: https://www.remcom.com/resources/wireless-insite-3d-wireless-prediction-software
[28] MathWorks, "Ray tracing propagation model." [Online]. Available: https://www.mathworks.com/help/antenna/ref/rfprop.raytracing.html
[29] E. Krijestorac, S. Hanna, and D. Cabric, "Spatial signal strength prediction using 3D maps and deep learning," in Proc. IEEE Int. Conf. Commun. (ICC), 2021, pp. 1–6.
[30] J. A. Stratton, Electromagnetic Theory. Piscataway, NJ, USA: John Wiley & Sons, 2006.
[31] R. Wang, J. Peethambaran, and D. Chen, "Lidar point clouds to 3-D urban models: a review," IEEE J. Sel. Top. Appl. Earth Obs. Remote Sens., vol. 11, no. 2, pp. 606–627, Feb. 2018.
[32] E. M. Mikhail, J. S. Bethel, and J. C. McGlone, Introduction to modern photogrammetry. New York, NY, USA: John Wiley & Sons, 2001.
[33] D. Tse and P. Viswanath, Fundamentals of wireless communication. Cambridge, UK: Cambridge University Press, 2005.
[34] H. Obeidat, A. A. S. Alabdullah, N. T. Ali, R. Asif, O. Obeidat, M. S. A. Bin-Melha, W. Shuaieb, R. A. Abd-Alhameed, and P. Excell, "Local average signal strength estimation for indoor multipath propagation," IEEE Access, vol. 7, no. 5, pp. 75 166–75 176, May 2019.
[35] X. Li and J.-M. Jin, "A comparative study of three finite element-based explicit numerical schemes for solving Maxwell's equations," IEEE Trans. Antennas Propag., vol. 60, no. 3, pp. 1450–1457, Mar. 2011.
[36] Belongie, "Rodrigues' rotation formula." [Online]. Available: https://mathworld.wolfram.com/RodriguesRotationFormula.html
[37] C. R. Qi, L. Yi, H. Su, and L. J. Guibas, "Pointnet++: Deep hierarchical feature learning on point sets in a metric space," in Proc. Conf. Neural Inf. Process. Syst. (NIPS), vol. 30, 2017, pp. 5105–5114.
[38] C. R. Qi, H. Su, K. Mo, and L. J. Guibas, "Pointnet: Deep learning on point sets for 3D classification and segmentation," in Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR), 2017, pp. 652–660.
[39] S. Hur, Y.-J. Cho, J. Lee, N.-G. Kang, J. Park, and H. Benn, "Synchronous channel sounder using horn antenna and indoor measurements on 28 GHz," in Proc. IEEE Int. Black Sea Conf. Commun. Netw. (BlackSeaCom), 2014, pp. 83–87.
[40] Y. Qian, M. Gong, and Y. H. Yang, "3D reconstruction of transparent objects with position-normal consistency," in Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR), 2016, pp. 4369–4377.
[41] ITU, "Effects of building materials and structures on radiowave propagation above about 100 MHz," ITU, Tech. Rep. ITU-R P.2040-1, Jul. 2015.
[42] V. Degli-Esposti, F. Fuschini, E. M. Vitucci, and G. Falciasecca, "Measurement and modelling of scattering from buildings," IEEE Trans. Antennas Propag., vol. 55, no. 1, pp. 143–153, Jan. 2007.

**本页范围与校对状态：** 本页覆盖 arXiv:2506.21112v2（eess.SP）全文 13 页：摘要、第 I—V 节、图 1—14 图注、算法 I、参考文献 [1]—[42]（英文原条目，按原编号保留）。原文为 arXiv 预印本（早前版本部分内容发表于 IEEE VTC-Fall 2024 [1]），本页仅为学习研究用中文译稿；原文全文无编号表格，故本页未设表格。已标注一处原文疑点：第 IV-A 节第二个 AoI 发射天线下倾角表述"10 degrees 20 degrees"疑为笔误（按原文照录）。未做逐句逐式的字符级终校（公式上下标、编号交叉引用均未做）；图内曲线与地图的逐点数值未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体数值，请以 [原文 PDF](https://arxiv.org/pdf/2506.21112v2) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
