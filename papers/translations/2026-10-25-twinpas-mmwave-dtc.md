---
layout: page
title: "TwinPAS：基于数字孪生信道的 6G 多频段毫米波空间传播特性预测｜中文译稿（未完成）"
permalink: /papers/translations/2026-10-25-twinpas-mmwave-dtc/
math: true
toc: true
---

[← 返回论文库](/papers/) · [IEEE DOI](https://doi.org/10.1109/TWC.2026.3693236)

# 基于数字孪生信道的 6G 多频段通信系统毫米波空间传播特性预测

**原题：** Digital Twin Channel-Based mmWave Spatial Propagation Characteristics Prediction in 6G Multi-Band Communication Systems  
**作者：** Zhen Zhang、Jianhua Zhang、Li Yu、Silu Xing、Kai Sun  
**期刊：** *IEEE Transactions on Wireless Communications*, Vol. 25 (2026), DOI: 10.1109/TWC.2026.3693236。  
**译稿状态（2026-10-25）：** 已扩充摘要和正文 I–V、信道投影、HCP-Net、式（1）–（31）及主要实验与消融；图表、参数表和参考文献尚需逐项对照 PDF 终校。当前为正文扩充译稿，**未达到逐句完整的全文验收标准**。本站未转载 PDF 原图。

## 摘要

数字孪生信道（digital twin channel，DTC）旨在将物理场景映射为实时数字孪生（digital twin，DT），并支持人工智能（artificial intelligence，AI）驱动的信道预测。为满足毫米波系统中多样化的信道获取需求，我们提出 TwinPAS，一种面向多频段共存通信、基于数字孪生的分层功率角度谱（power angular spectrum，PAS）预测方法。TwinPAS 通过数字孪生构建和 PAS 预测两个阶段，使基站能够将视觉感知信息转化为空间信道特性。

首先，在数字孪生构建阶段，通过计算机视觉技术获取静态场景信息，同时通过估计 sub-6 GHz 信道参数提取动态环境特征。为融合这两类异构特征并构建物理场景的数字孪生，本文提出一种称为**信道嵌入**（channel embedding）的新型信道表示方法。随后，在 PAS 预测阶段，设计分层信道预测网络，按照路径功率由大到小的顺序预测毫米波 PAS。对于网络输出，将嵌入的毫米波 PAS 投影到虚拟距离矩阵，从而解决多径数量动态变化时信道参数维度不确定的问题。仿真结果表明，TwinPAS 在 PAS 预测方面具有优越性和泛化能力，展示了其在波束选择等物理层应用中的潜力。

**索引词：** 数字孪生、人工智能、功率角度谱、计算机视觉。

## I. 引言

毫米波（millimeter wave，mmWave）频段具有丰富的频谱资源，并支持更宽的子载波间隔，因而能够更好地满足移动通信系统对高吞吐量、超高可靠性和低时延的要求 [1]。然而，毫米波信号受到大气损耗和降雨衰减的严重影响 [2]。为了保障充分的毫米波通信覆盖，系统通常采用大规模天线阵列和定向波束赋形技术。但是，最优波束赋形设计通常要求获得准确的信道状态信息（channel state information，CSI），而这一要求具有挑战性 [3]。此外，当毫米波系统发生遮挡时，快速波束管理同样需要高效的信道获取技术。因此，既有研究大多关注 CSI 估计或波束预测，对于能够表征毫米波信道完整小尺度空间传播特性的 PAS 预测却鲜有研究。本文聚焦于确定性场景中的毫米波 PAS 预测。准确表征和预测 PAS 是毫米波通信的基础，因为 PAS 决定着波束赋形、空间复用和干扰行为。

**相关工作：** 由于角度空间具有较高维度、有效多径数量又随时间和位置动态变化，直接预测 PAS 仍然十分困难。多数现有系统级研究关注与 PAS 有关的推理任务，而非显式预测 PAS 本身。大量研究集中于角度域信道重建 [4] 或波束选择 [5]，其中 PAS 通常借助稀疏恢复被隐式推断。随着移动通信系统采用的频段不断增加，多频段共存通信已经不可避免 [6]。近期研究发现，与毫米波系统并行工作的 sub-6 GHz 系统能够提供具有价值的带外（out-of-band，OOB）信息，帮助建立毫米波链路 [7]。因此，使用 sub-6 GHz 信道辅助预测毫米波传播特性，被视为一种颇有前景的方法 [8]–[10]。相关研究借助 AI [8]、[10] 或压缩感知（compressed sensing，CS）[9]，利用 sub-6 GHz 信道的空间传播特征重建或推断毫米波角度功率分布。

然而，sub-6 GHz 与毫米波信道通常仅在部分主要传播路径上具有较高相似性，而且这种相似性可能随着传播环境的变化而下降 [11]。仅凭主要路径之间的分布关系，无法预测完整的多径传播特性。完整的无线信道包含直射、反射和绕射等不同传播路径。路径参数通常受到基站（base station，BS）和用户终端（user terminal，UT）周围散射体的尺寸、形状、位置及材料影响。因此，无线信道的传播特性主要受到真实物理环境的影响 [12]、[13]。

借助 RGB 摄像头、激光雷达、GPS、雷达等多种感知设备，研究人员已经在计算机视觉（computer vision，CV）辅助通信方面取得广泛进展，包括波束预测 [14]、[15]、码本设计 [16]、基站选择 [17]、信道协方差矩阵估计 [18]、CSI 预测与反馈 [19]、[20]、遮挡预测 [21] 和路径损耗预测 [22] 等。在通信感知一体化（integrated sensing and communication，ISAC）系统中，还研究了 CSI 驱动的图像形成：将多径参数映射到等效反射点，通过多视角融合重建稠密三维点云 [23]。

神经辐射场（neural radiance field，NeRF）表示也已被引入无线通信，以连续且具有几何感知能力的方式建模无线电传播 [24]、[25]。通过重建无线辐射场，可以将辐射能量分布投影到角度域，从而推导 PAS。然而，这些方法存在计算复杂度高、合成速度慢等问题。与传统感知辅助方法或纯数据驱动方法不同，数字孪生致力于构建无线传播环境的数字副本，并反映物理场景的实时变化。数字孪生与 AI 结合后，DTC 能够支持实时交互、闭环决策，以及对不同信道传播环境变化的主动适应 [26]、[27]。因此，构建物理层数字孪生能够拓展无线信道的预测能力，进一步增强基站在射频空间中的认知能力。

但在多数既有研究中，数字孪生环境仍被视为辅助输入特征，而未与无线信道集成为统一的物理表示。现有多模态融合方法主要侧重视觉感知与 CSI 的特征级融合 [28]、[29]，不能直接应用于多维 PAS 预测。同时，目前仍缺乏能够显式捕获场景几何与多径传播之间相互作用的、由学习驱动的物理层数字孪生构建方法。一方面，如何从物理环境中有效提取几何与材料特性等静态散射特征，仍具有挑战性；另一方面，如何建模动态散射特性，并将其纳入统一的数字孪生框架，也仍是开放问题。尤其是有效路径数量会在不同位置和环境中显著变化，对 PAS 预测精度产生重大影响。多径数量动态变化时，准确预测多维信道参数仍然是现有数字孪生方法面临的关键挑战。

**主要贡献：** 本文提出基于数字孪生的分层 PAS 预测方法 TwinPAS。不同于现有信道预测方法，本文采用联合描述静态三维几何与动态 sub-6 GHz 传播特性的物理层数字孪生，以辅助毫米波 PAS 预测。通过 TwinPAS，基站能够实现从视觉感知到射频认知的转换，充分发挥物理层信道预测的潜力。

第一项贡献是**信道嵌入（CE）：无线信道与三维物理环境的保几何融合**。本文提出将估计得到的 sub-6 GHz 信道参数转换为虚拟路径点，并将其嵌入三维点云，从而构建物理环境的数字孪生。每个虚拟路径点对应一条物理传播路径，其距离与方向分别编码路径的功率与角度。这种信道表示方法能够在几何关系得到保持的条件下，对齐无线信道与计算机视觉重建的三维场景，有效解决传统融合方法中视觉感知与信道数据不匹配的问题。

第二项贡献是**分层信道预测网络（HCP-Net）：多分辨率环境与信道交互**。本文设计由分层编码器和金字塔解码器组成的 HCP-Net，从多分辨率数字孪生输入预测毫米波 PAS。HCP-Net 根据路径功率，将传播路径划分为主导路径、主要路径和全路径三个层次，以由粗到细的方式提取多尺度环境和信道特征。此外，本文还设计了 HCP-Net 的预训练与微调方案。该分层机制具有一定的物理可解释性，能够增强复杂动态传播环境下的鲁棒性。

第三项贡献是**信道投影：面向动态多径预测的统一输出表示**。在 HCP-Net 输出端，本文提出信道投影与重投影机制，将数量可变的毫米波虚拟路径点转换为虚拟距离矩阵和掩码矩阵。掩码矩阵决定有效路径的数量及位置，虚拟距离矩阵预测每个位置的路径功率。信道投影使网络能够使用固定维度的输出进行学习。最后，通过重投影和逆信道嵌入，将矩阵重新映射为多径参数，以重建预测得到的毫米波 PAS。

本文其余部分安排如下：第二节给出系统模型并表述 PAS 预测问题；第三节详细介绍 TwinPAS；第四节给出仿真结果；第五节总结全文。

## II. 系统模型与问题表述

考虑图 1 所示的室内办公通信场景，其中随机分布着桌椅、橱柜等散射体。基站与用户终端并行工作于毫米波和 sub-6 GHz 频段 [9]、[10]。基站装有两组共址天线阵列，分别工作在毫米波和 sub-6 GHz 频段，基站位置 $\mathbf p_{\rm BS}=[p_{\rm BS}^{x},p_{\rm BS}^{y},p_{\rm BS}^{z}]$ 已知。用户终端同样配备分别工作于这两个频段的天线。假设两个通信系统均采用正交频分复用（OFDM）。本文的目标是利用 sub-6 GHz 上行链路估计得到的 CSI，在基站端预测毫米波系统的 PAS。下标 $s$ 表示 sub-6 GHz 系统变量，下标 $m$ 表示毫米波系统变量。

### A. 毫米波系统与信道模型

毫米波基站采用均匀平面阵列（uniform planar array，UPA），包含 $N_m=N_{m,h}N_{m,v}$ 根天线，其中 $N_{m,h}$ 和 $N_{m,v}$ 分别是水平与垂直方向的天线数；子载波数为 $K_m$。第 $k$ 个子载波上的下行接收信号为

$$
y_m[k]=\mathbf h_m^{H}[k]\mathbf x_m[k]+n_m[k],\qquad k=1,\ldots,K_m. \tag{1}
$$

其中 $\mathbf h_m[k]\in\mathbb C^{N_m\times1}$、$\mathbf x_m[k]\in\mathbb C^{N_m\times1}$ 分别表示信道和发送信号，$n_m[k]$ 为加性高斯白噪声。本文采用三维几何信道模型，其中第 $l$ 条路径具有接收功率 $\alpha_{m,l}$、方位出发角 $\phi_{m,l}^{\mathrm{az,D}}$、俯仰出发角 $\phi_{m,l}^{\mathrm{ele,D}}$、时延 $\tau_{m,l}$ 和相位 $\psi_{m,l}$。毫米波有效路径数为 $L_m$，带宽为 $B_m$，阵列响应为 $\mathbf a(\phi_{m,l}^{\mathrm{az,D}},\phi_{m,l}^{\mathrm{ele,D}})$。原文式（2）给出了由这些路径参数叠加得到的频域信道模型。

### B. Sub-6 GHz 系统与信道模型

Sub-6 GHz 系统采用全数字架构，并配备具有独立射频链的 UPA，天线总数为 $N_s=N_{s,h}N_{s,v}$，子载波数为 $K_s$。令 $\mathbf h_s[k]\in\mathbb C^{N_s\times1}$ 为第 $k$ 个子载波上的 sub-6 GHz 上行信道，$x_s[k]$ 为发送信号，基站接收信号为

$$
\mathbf y_s[k]=\mathbf h_s[k]x_s[k]+\mathbf n_s[k],\qquad k=1,\ldots,K_s. \tag{3}
$$

其中 $\mathbf n_s[k]$ 为加性高斯白噪声。Sub-6 GHz 信道模型与毫米波信道类似，但使用第 $l$ 条路径的方位到达角 $\phi_{s,l}^{\mathrm{az,A}}$、俯仰到达角 $\phi_{s,l}^{\mathrm{ele,A}}$、接收功率 $\alpha_{s,l}$ 和路径数 $L_s$。可利用最小二乘（LS）信道估计，在所有子载波上恢复 sub-6 GHz 上行 CSI。

### C. 问题表述

数字孪生至少需要包含静态和动态两部分，以模拟物理世界的动态演化。静态部分 $\mathcal D$ 应包括静态场景布局、材料特征以及固定基站的位置，这些信息可以通过计算机视觉预先获取，与通信系统本身无关。动态部分至少包含用户终端的位置和移动散射体。移动散射体的位置难以实时准确获取；然而，散射体与用户终端的运动会显著影响多径传播的小尺度参数。Sub-6 GHz PAS 作为毫米波系统的带外信息，为实时获取动态特性提供了可能。

因此，本文利用视觉获取的静态场景信息与 sub-6 GHz PAS 预测毫米波 PAS：

$$
h_m^{\rm pas}=\sum_{l=1}^{L_m}\alpha_{m,l}
\delta(\phi^{\rm az}-\phi_{m,l}^{\rm az,D})
\delta(\phi^{\rm ele}-\phi_{m,l}^{\rm ele,D}). \tag{4}
$$

Sub-6 GHz 上行信道对应的 PAS 为

$$
h_s^{\rm pas}=\sum_{l=1}^{L_s}\alpha_{s,l}
\delta(\phi^{\rm az}-\phi_{s,l}^{\rm az,A})
\delta(\phi^{\rm ele}-\phi_{s,l}^{\rm ele,A}). \tag{5}
$$

因此需要寻找映射 $f$，使 $\{h_s^{\rm pas},\mathcal D\}\xrightarrow{f}h_m^{\rm pas}$。原文式（6）进一步将此目标写为路径功率、方位角和俯仰角预测误差的加权最小化问题，权重分别为 $w_a$、$w_{\rm az}$、$w_{\rm ele}$。考虑到各物理量的数值尺度不同，需要通过加权系数平衡其对目标函数的贡献。

直接求解式（6）并不容易：毫米波路径数量 $L_m$ 较大，完整 PAS 往往需要完整信道信息，难以在大规模 MIMO 系统中实际获取。间接方法同样存在困难，因为 $L_m$ 随环境变化，无法让神经网络直接输出维度可变的参数；此外，sub-6 GHz 与毫米波的路径数通常不同，也无法建立一一对应关系。本文因此提出后续 TwinPAS 方案。

## III. 提出的 TwinPAS 方法（本节仅译至前半部分）

如图 2 所示，TwinPAS 首先通过静态场景和动态信道两部分构建物理层数字孪生，随后进行毫米波 PAS 预测。完整场景重建仅在每连续 $N_{\rm time}$ 个时隙的起始时刻执行一次。在随后 $N_{\rm time}-1$ 个时隙中，不再执行重建，仅进行 sub-6 GHz 信道估计。下一个周期开始时重新重建场景，以更新环境先验。图 3 给出了这两类信息在时间上的对应关系。

数字孪生是连接环境几何与无线传播的物理层副本。TwinPAS 中的数字孪生具有三项主要功能：表示通过计算机视觉重建的静态三维环境；映射通过 sub-6 GHz 信道获得的动态传播特征；作为跨频段桥梁，推断毫米波 PAS。三者构成了可适应环境变化的信道预测框架。

### A. 基于计算机视觉的静态场景重建

静态场景重建由永久静态结构和准静态结构两部分组成。墙壁、天花板和地面等静态结构具有固定几何形状和电磁属性。桌椅、橱柜等准静态结构可能在较长时间尺度上移动，但在多个相邻相干区间内通常保持相对固定。对于永久静态结构，假定其位置、尺寸和材料已知且固定。因此，可以构建带有材料语义分割信息的静态结构三维点云 $\mathcal{PC}_{\rm static}$。

点云中的每个点除了三维空间坐标以外，还携带材料的电导率、介电常数和厚度。对于准静态结构，首先从不同视角采集图像集合 $\mathcal I$，再使用基于运动恢复结构（Structure-from-Motion）和多视角立体视觉（Multi-View Stereo）的 Agisoft Metashape 工具 [30]–[32] 重建三维点云。通过深度学习模型识别并分类图像中的材料 [33]、[34]，然后从预存材料参数表中查找对应的材料属性，将其补充到点云中。

于是，完整场景点云为 $\mathcal{PC}_{\rm scene}=\mathcal{PC}_{\rm static}\cup\mathcal{PC}_{\rm quasi}$。为便于神经网络处理，使用 $\mathbf P_{\rm scene}\in\mathbb R^{n_{\rm scene}\times6}$ 表示场景点云，每一行是一个点的三维坐标及三项材料属性，且 $n_{\rm scene}=n_{\rm static}+n_{\rm quasi}$。

### B. Sub-6 GHz 信道参数提取

接下来，从估计的 sub-6 GHz CSI 中提取信道参数，并作为数字孪生的动态特征。为此，采用二维离散傅里叶变换（DFT）矩阵 $\mathbf W_{\rm 2D}=\mathbf W_v\otimes\mathbf W_h$，其中 $\mathbf W_v$ 与 $\mathbf W_h$ 分别沿垂直和水平方向构建；相应的角度网格点数为 $N_{\rm sam,v}$、$N_{\rm sam,h}$。原文式（7）定义了 DFT 矩阵的具体元素。

将所有子载波的估计上行 CSI 变换到角度域，并按原文式（8）计算空间功率特征，再将其重排为二维矩阵。对该矩阵实施局部极大值检测及峰值提取：一个元素只有在其八邻域内大于或等于所有相邻元素，才被保留为候选局部峰值。局部极大值索引集合见原文式（9）–（10）。

*后续的虚拟路径点坐标转换、信道嵌入、HCP-Net、信道投影、训练策略、仿真结果及参考文献尚未译入；本页面是明确标注进度的工作稿，不代表原论文全文。*


## 补译：III-B 至 III-D 的信道嵌入与分层输入（原文第 5–7 页）

### B. Sub-6 GHz 信道参数提取（续）

设局部极大值的索引集合为 $\mathcal P$。将 $\mathcal P$ 中全部局部极大值按功率从高到低排序，选取前 $N_{\rm peak}$ 组索引。对第 $k$ 个峰值索引 $(k_i,k_j)$，其路径功率为 $\hat\alpha_{s,k}=[\hat{\mathbf H}_s^a]_{k_i,k_j}$，对应的仰角 AoA 和方位角 AoA 按原文式（11）从角度网格计算：

$
\begin{aligned}
\hat\phi_{s,k}^{\mathrm{ele,A}}
&=\frac{180}{\pi}\arccos\left(-1+\frac{2(k_i-1)}{N_{\rm sam,v}}\right),\\
\hat t_k&=\frac{2(k_j-1)-N_{\rm sam,h}}
{N_{\rm sam,h}\sin\bigl(\hat\phi_{s,k}^{\mathrm{ele,A}}\bigr)},\\
\hat\phi_{s,k}^{\mathrm{az,A}}
&=\frac{180}{\pi}\arcsin(\hat t_k).
\end{aligned}\tag{11}
$

角度单位及三角函数使用的弧度、角度转换必须严格按原文实现；实际编码时需特别检查式（11）的量纲及自变量单位。将提取的 $N_{\rm peak}$ 组参数存入按功率降序排列的序列：

$
\hat{\mathcal S}_s=
\bigl[
(\hat\phi_{s,1}^{\mathrm{az,A}},\hat\phi_{s,1}^{\mathrm{ele,A}},\hat\alpha_{s,1}),
\ldots,
(\hat\phi_{s,N_{\rm peak}}^{\mathrm{az,A}},\hat\phi_{s,N_{\rm peak}}^{\mathrm{ele,A}},\hat\alpha_{s,N_{\rm peak}})
\bigr].\tag{12}
$

其中 $\hat\alpha_{s,1}\ge \hat\alpha_{s,2}\ge\cdots\ge\hat\alpha_{s,N_{\rm peak}}$。sub-6 GHz 参数提取采用标准估计流程，但在数字孪生构建中，这些参数是不可替代的动态环境属性来源。

### C. Sub-6 GHz 信道嵌入与数字孪生构建

本小节提出跨模态的信道表示方法——信道嵌入（channel embedding，CE），通过将 sub-6 GHz 信道嵌入静态场景重建，实现视觉感知与 RF 数据的高效融合。每组功率和角度参数依次变换为三维坐标点。

以第 $k$ 组参数 $(\hat\phi_{s,k}^{\mathrm{az,A}},\hat\phi_{s,k}^{\mathrm{ele,A}},\hat\alpha_{s,k})$ 为例，首先将归一化功率映射为虚拟距离：

$
\hat d_{s,k}=K_s^E\left(\frac{\hat\alpha_{s,k}}{\alpha_{s,\max}}\right)^{R_s^E}+O_s^E.\tag{13}
$

其中 $K_s^E$、$O_s^E$ 和 $R_s^E$ 分别为 sub-6 GHz 信道的缩放系数、偏置和指数系数；$\alpha_{s,\max}$ 为 sub-6 GHz 信道中的最大路径功率。这三个约束常数定义了从归一化路径功率到虚拟距离的非线性映射。具体而言，$K_s^E$ 控制整体距离缩放范围；$O_s^E$ 提供偏移，以避免功率很弱的路径全部聚集在基站附近；$R_s^E$ 控制非线性程度，从而影响强弱路径在三维嵌入空间中的分布。

其次，通过球坐标转换，将方位角和仰角 AoA 表示为单位方向向量：

$
\hat{\mathbf u}_{s,k}=
\begin{bmatrix}
\cos\hat\phi_{s,k}^{\mathrm{az,A}}\sin\hat\phi_{s,k}^{\mathrm{ele,A}}\\
\sin\hat\phi_{s,k}^{\mathrm{az,A}}\sin\hat\phi_{s,k}^{\mathrm{ele,A}}\\
\cos\hat\phi_{s,k}^{\mathrm{ele,A}}
\end{bmatrix}.\tag{14}
$

最后，以基站位置 $\mathbf p_{\rm BS}$ 为中心，得到第 $k$ 条路径对应的虚拟路径点坐标：

$
\hat{\mathbf p}_{s,k}=\mathbf p_{\rm BS}+\hat d_{s,k}\hat{\mathbf u}_{s,k}^{T}.\tag{15}
$

由此，序列 $\hat{\mathcal S}_s$ 中的全部 $N_{\rm peak}$ 组角度和功率参数被映射为坐标矩阵 $\hat{\mathbf P}_{s}^{xyz}\in\mathbb R^{N_{\rm peak}\times3}$。其中每行对应一个虚拟路径点，行顺序按其所对应的路径功率由高到低排列。需要强调：**虚拟路径点并不代表与传播路径相互作用的散射体真实物理位置**；这种表示的作用是将多径参数和三维点云编码到统一的几何空间。

将所有虚拟路径点的材料属性统一标记为 $-1$，即可把 $\hat{\mathbf P}_{s}^{xyz}$ 扩展为 $\hat{\mathbf P}_s\in\mathbb R^{N_{\rm peak}\times6}$。再将其与静态场景重建矩阵 $\mathbf P_{\rm scene}$ 拼接，构建完整场景的数字孪生：

$
\mathbf P_{\rm Ful}=
\begin{bmatrix}
\mathbf P_{\rm scene}\\
\hat{\mathbf P}_s
\end{bmatrix}
\in\mathbb R^{(n_{\rm scene}+N_{\rm peak})\times6}.\tag{16}
$

这种数字孪生在物理层运行，由视觉三维重建得到的静态场景部分，以及从 sub-6 GHz 信道参数估计得到的动态信道部分共同组成。静态场景保存物体几何和材料属性，动态信道反映随时间变化的传播特征；通过 CE 将二者融合，数字孪生可以同时支持 sub-6 GHz 感知与毫米波预测，形成面向多频段的传播环境表示。

### D. 分层信道预测网络（HCP-Net）

本小节介绍 HCP-Net，该网络利用物理场景的数字孪生预测毫米波 PAS，完整架构见图 5。无线信道建模表明，多径分量对整体信道的贡献与其功率有关。高功率主导路径对于波束赋形和链路建立非常重要，而弱路径则提供细粒度的角度多样性。不同传播路径在信道预测中的重要性存在差异。受这种物理层次结构启发，HCP-Net 采用分层编码器与解码器。

在分层编码器中，首先按功率对 sub-6 GHz 多径分量分组，再将其嵌入三维点云，构建多分辨率数字孪生，以提取不同粒度的传播特征与物理环境交互特征。在金字塔解码器中，毫米波多径分量同样按功率分层，关键传播模式通过隐藏特征与预测结果，从深层向浅层逐级传递。为便于说明，作者将网络分为输入、输出和网络架构三个部分。

**1）网络输入：多径下采样与多分辨率数字孪生构建。** 传播路径的功率决定其对信道重建的贡献，因此按功率进行下采样。重要性不同的 sub-6 GHz 虚拟路径点以分层方式与静态场景重建矩阵组合，形成不同层次的环境—信道融合特征。首先，完整场景数字孪生 $\mathbf P_{\rm Ful}$ 作为第一级输入。然后，选取功率最大的前 $\lceil N_{\rm peak}/k_s\rceil$ 条路径，与静态场景矩阵拼接，构成第二级输入：

$
\mathbf P_{\rm Maj}=
\begin{bmatrix}
\mathbf P_{\rm scene}\\
[\hat{\mathbf P}_s]_{1:\lceil N_{\rm peak}/k_s\rceil,:}
\end{bmatrix}
\in\mathbb R^{(n_{\rm scene}+\lceil N_{\rm peak}/k_s\rceil)\times6}.\tag{17}
$

其中 $\lceil\cdot\rceil$ 表示向上取整。类似地，选取功率最大的前 $\lceil N_{\rm peak}/k_s^2\rceil$ 条路径，构成第三级数字孪生输入：

$
\mathbf P_{\rm Dom}=
\begin{bmatrix}
\mathbf P_{\rm scene}\\
[\hat{\mathbf P}_s]_{1:\lceil N_{\rm peak}/k_s^2\rceil,:}
\end{bmatrix}
\in\mathbb R^{(n_{\rm scene}+\lceil N_{\rm peak}/k_s^2\rceil)\times6}.\tag{18}
$

如图 5 所示，$\mathbf P_{\rm Dom}$、$\mathbf P_{\rm Maj}$、$\mathbf P_{\rm Ful}$ 这三级输入，分别对应嵌入了不同重要性多径信息的静态场景。后续输出投影、网络层结构、训练策略及实验仍需继续逐段逐式补齐。

---
**原文归属：** © 2026 IEEE。论文版权及再传播许可请以出版方要求为准。本站仅提供阶段性研究译稿，不包含原版 PDF、图像或扫描页。


## 补译：III-D. HCP-Net 的输出投影、网络结构与训练目标

### 2）网络输出：毫米波信道嵌入和投影

按功率从大到小排列的毫米波下行信道参数构成序列

$$
\mathcal S_m=\left[
(\phi_{m,1}^{\rm az,D},\phi_{m,1}^{\rm ele,D},\alpha_{m,1}),
\ldots,
(\phi_{m,L_m}^{\rm az,D},\phi_{m,L_m}^{\rm ele,D},\alpha_{m,L_m})
\right],\quad
\alpha_{m,1}\ge\cdots\ge\alpha_{m,L_m}. \tag{19}
$$

首先，按信道嵌入方式将毫米波参数变为虚拟路径点，然后通过**信道投影**把虚拟路径点投影到固定维度的虚拟距离矩阵 $\mathbf D$ 和掩码矩阵 $\mathbf M$。这种处理把数量可变的多径集合预测转化为固定维度、具物理可解释性的表示。与 sub-6 GHz 的嵌入不同，毫米波嵌入以基站为原点，在局部坐标系中进行。对于第 $k$ 条路径，定义归一化虚拟距离

$$
d_{m,k}=K_m^{E}
\left(\frac{\alpha_{m,k}}{\alpha_{m,\max}}\right)^{R_m^{E}}
+O_m^{E}. \tag{20}
$$

其中 $K_m^E$、$O_m^E$、$R_m^E$ 分别为毫米波嵌入的缩放、偏移与指数参数，$\alpha_{m,\max}$ 为路径功率最大值。依据式（14）把方位及仰角 AoD 转换为方向向量 $\mathbf u_{m,k}$，再计算虚拟点 $\mathbf p_{m,k}=d_{m,k}\mathbf u_{m,k}^{T}$，构成 $L_m$ 个点的集合 $\mathcal P_m^{\rm Ful}$。

如图 5 所示，HCP-Net 也按功率等级预测多层毫米波 PAS。仅保留功率最大的一条路径时，投影得到主导距离矩阵 $\mathbf D_{\rm Dom}$；保留前五条路径时，得到主要距离矩阵 $\mathbf D_{\rm Maj}$；保留全部路径时得到完整距离矩阵 $\mathbf D_{\rm Ful}$。三种矩阵均为 $N_H\times N_W$，分别具有标识有效位置的掩码矩阵 $\mathbf M_{\rm Dom}$、$\mathbf M_{\rm Maj}$、$\mathbf M_{\rm Ful}$。

设虚拟点坐标为 $\mathbf p_{m,k}=[p_{m,k}^x,p_{m,k}^y,p_{m,k}^z]$，其投影至二维矩阵的第 $(i,j)$ 个坐标。原文定义投影算子 $\Pi:\mathbb R^3\to\mathbb R^2$：

$$
\begin{pmatrix}i\\j\end{pmatrix}
=
\begin{pmatrix}
N_H\left[1-
\dfrac{\arcsin(p_{m,k}^{z}/d_{m,k})
+|\phi_{m,\rm down}^{\rm ele,D}|}
{\phi_{m,\rm fov}^{\rm ele,D}}\right]\\[5pt]
\dfrac{N_W}{2}\left[1-\dfrac{2}{\pi}
\arctan\left(\dfrac{p_{m,k}^{y}}{p_{m,k}^{x}}\right)\right]
\end{pmatrix}. \tag{21}
$$

其中 $\phi_{m,\rm up}^{\rm ele,D}=\pi/2-\phi_{m,\min}^{\rm ele,D}$，$\phi_{m,\rm down}^{\rm ele,D}=\pi/2-\phi_{m,\max}^{\rm ele,D}$，$\phi_{m,\rm fov}^{\rm ele,D}=|\phi_{m,\rm up}^{\rm ele,D}|+|\phi_{m,\rm down}^{\rm ele,D}|$。在虚拟距离矩阵对应位置保存该点的距离 $d_{m,k}$；无投影点的位置赋值为 $-1$。投影多条路径时按路径功率从小到大进行，从而让强路径覆盖同位置的较弱路径。

网络预测完成后，使用掩码与虚拟距离矩阵进行反投影。在完整掩码 $\widehat{\mathbf M}_{\rm Ful}$ 的 $(i,j)$ 位置，若 $[\widehat{\mathbf M}_{\rm Ful}]_{i,j}>0.5$，则认为该位置存在有效路径，取预测距离 $[\widehat{\mathbf D}_{\rm Ful}]_{i,j}$。令俯仰角（pitch）与方位角为

$$
\widehat\phi_{i,j}^{\rm pit}
=\left(1-\frac{i}{N_H}\right)\phi_{m,\rm fov}^{\rm ele,D}
-|\phi_{m,\rm down}^{\rm ele,D}|,\qquad
\widehat\phi_{i,j}^{\rm az}
=\frac\pi2\left(1-\frac{2j}{N_W}\right).
$$

重构的虚拟点为

$$
\begin{bmatrix}
\widehat p_{m,k}^{x}\\
\widehat p_{m,k}^{y}\\
\widehat p_{m,k}^{z}
\end{bmatrix}
=
[\widehat{\mathbf D}_{\rm Ful}]_{i,j}
\begin{bmatrix}
\cos\widehat\phi_{i,j}^{\rm az}\cos\widehat\phi_{i,j}^{\rm pit}\\
\sin\widehat\phi_{i,j}^{\rm az}\cos\widehat\phi_{i,j}^{\rm pit}\\
\sin\widehat\phi_{i,j}^{\rm pit}
\end{bmatrix}. \tag{22}
$$

最后对式（20）求逆得到预测路径功率；对应的仰角 AoD 为 $\widehat\phi_{m,k}^{\rm ele,D}=\pi/2-\widehat\phi_{i,j}^{\rm pit}$，方位角 AoD 为 $\widehat\phi_{m,k}^{\rm az,D}=\widehat\phi_{i,j}^{\rm az}$。这样就能从固定维度矩阵恢复数量可变的多径 PAS。

### 3）网络结构：分层编码器与金字塔解码器

网络由分层编码器和金字塔解码器组成。编码器的基本提取器称为多通道组合提取器（Combined Multi-Channel Extractor，CMCE），其设计受到 PointNet [35] 启发，专门处理具有材料类别语义的嵌入点云。CMCE 用卷积网络将每个点映射到多维特征，并对最后四层的输出执行最大池化，得到维度为 128、256、512、1024 的特征向量，随后拼接为 $\mathbf l\in\mathbb R^{1920\times1}$，以同时包含低阶与高阶特征。卷积层采用批归一化与 ReLU 激活。

$\mathbf P_{\rm Ful}$、$\mathbf P_{\rm Maj}$ 和 $\mathbf P_{\rm Dom}$ 分别送入三个独立 CMCE，得到三个潜在向量 $\mathbf l_i$，表示不同重要程度的信道路径与物理环境之间的交互特征。将其拼接成 $\mathbf L\in\mathbb R^{1920\times3}$，再使用一维 CNN 生成最终特征向量 $\mathbf v$。

解码器从 $\mathbf v$ 出发，经三个全连接层分别产生包含 $3U$、$2U$、$U$ 神经元的基础特征 $\mathbf v_1,\mathbf v_2,\mathbf v_3$。首先由最深层 $\mathbf v_3$ 预测主导路径的距离与掩码矩阵，再由 $\mathbf v_2$ 预测前五条主要路径，最后由 $\mathbf v_1$ 预测全部路径。解码器采用多目标全连接网络（Multi-Target Fully Connected，MTFC；见图 8）联合预测路径存在性及距离。距离输出受嵌入参数 $K_m^E$、$O_m^E$、$R_m^E$ 约束；掩码输出限制在 $[0,1]$。

深层向浅层的信息传递具有两种形式：（1）隐藏特征传递，将主导路径相关的隐藏特征用于预测更多路径；（2）预测结果传递，将更深层已经确认的有效距离和掩码值覆盖、传给较浅层结果。这确保每个解码层专注于不同重要性级别的路径。输入拼接、预测值复制等操作均采用可微实现，梯度能够经传递的隐藏特征和输出回传。三个 MTFC 在最终相关全连接层的规模不同，分别使用 $3U$、$4U$、$7U$ 神经元。

### E. HCP-Net 预训练与微调

网络对每一层 $\mathrm{Level}\in\{\mathrm{Dom},\mathrm{Maj},\mathrm{Ful}\}$ 预测距离矩阵 $\widehat{\mathbf D}_{\rm Level}$ 和掩码矩阵 $\widehat{\mathbf M}_{\rm Level}$。预训练期间首先计算有效虚拟距离上的平均绝对误差：

$$
\mathcal L_{\rm AVD}^{\rm Level}
=\frac1{|\mathcal V_{\rm Level}|}
\sum_{(i,j)\in\mathcal V_{\rm Level}}
\left|[\widehat{\mathbf D}_{\rm Level}]_{i,j}
-[\mathbf D_{\rm Level}]_{i,j}\right|,\qquad
\mathcal V_{\rm Level}
=\{(i,j):[\mathbf D_{\rm Level}]_{i,j}\ne-1\}. \tag{23}
$$

由于有效多径投影点比无效网格点稀疏，掩码预测存在严重类别不均衡。作者使用加权二元交叉熵（BCE）与加权绝对误差（MAE），且每一级有独立的正样本权重：

$$
\begin{aligned}
\mathcal L_{\rm BCE}^{\rm Level}
=-\frac1{N_HN_W}\sum_{i=1}^{N_H}\sum_{j=1}^{N_W}
\Bigl[
&w_{\rm Level}^{B}
[\mathbf M_{\rm Level}]_{i,j}
\log([\widehat{\mathbf M}_{\rm Level}]_{i,j})\\
&+(1-[\mathbf M_{\rm Level}]_{i,j})
\log(1-[\widehat{\mathbf M}_{\rm Level}]_{i,j})
\Bigr],
\end{aligned} \tag{24}
$$

$$
\mathcal L_{\rm MAE}^{\rm Level}
=\frac1{N_HN_W}\sum_{i=1}^{N_H}\sum_{j=1}^{N_W}
w_{i,j}\,
\bigl|[\widehat{\mathbf M}_{\rm Level}]_{i,j}
-[\mathbf M_{\rm Level}]_{i,j}\bigr|, \tag{25}
$$

$$
w_{i,j}=
\begin{cases}
w_{\rm Level}^{M},&[\mathbf D_{\rm Level}]_{i,j}\ne-1,\\
1,&\text{其他情况}.
\end{cases} \tag{26}
$$

每一级的预训练组合损失为

$$
\mathcal L_{\rm comb}^{\rm Level}
=\lambda_{\rm AVD}\mathcal L_{\rm AVD}^{\rm Level}
+\frac{\lambda_{\rm MASK}}2
\bigl(\mathcal L_{\rm BCE}^{\rm Level}
+\mathcal L_{\rm MAE}^{\rm Level}\bigr). \tag{27}
$$

再按级别权重加权：

$$
\mathcal L_{\rm pre}
=\lambda_{\rm Dom}\mathcal L_{\rm comb}^{\rm Dom}
+\lambda_{\rm Maj}\mathcal L_{\rm comb}^{\rm Maj}
+\lambda_{\rm Ful}\mathcal L_{\rm comb}^{\rm Ful},\qquad
\lambda_{\rm Dom}+\lambda_{\rm Maj}+\lambda_{\rm Ful}=1. \tag{28}
$$

微调阶段，网络通过投影及反投影得到预测虚拟点集 $\widehat{\mathcal P}_m^{\rm Ful}$。为了直接约束物理路径点的位置，使用预测点集和真实点集之间的 Chamfer 距离（CD）：

$$
\begin{aligned}
\mathcal L_{\rm CD}
=&\frac{1}{|\widehat{\mathcal P}_{m}^{\rm Ful}|}
\sum_{\widehat{\mathbf p}_m\in\widehat{\mathcal P}_{m}^{\rm Ful}}
\min_{\mathbf p_m\in\mathcal P_{m}^{\rm Ful}}
\|\widehat{\mathbf p}_m-\mathbf p_m\|_2^2\\
&+\frac{1}{|\mathcal P_{m}^{\rm Ful}|}
\sum_{\mathbf p_m\in\mathcal P_{m}^{\rm Ful}}
\min_{\widehat{\mathbf p}_m\in\widehat{\mathcal P}_{m}^{\rm Ful}}
\|\widehat{\mathbf p}_m-\mathbf p_m\|_2^2.
\end{aligned}\tag{29}
$$

由于最近邻搜索的计算代价较高，作者仅对全路径点集计算 CD 损失，最终微调目标为 $\mathcal L_{\rm fine}=\mathcal L_{\rm pre}+\lambda_{\rm CD}\mathcal L_{\rm CD}$。虽然大规模点集的 CD 损失可能对离群点敏感，但本文所用虚拟点来源于物理有效路径，加之多级掩码和其他损失项的联合约束，减轻了相关问题。

### F. 复杂度分析

设第 $\ell$ 个卷积层的卷积核尺寸为 $K_{H,\ell}^c\times K_{W,\ell}^c$、输出特征图大小为 $H_{H,\ell}^{\rm out}\times H_{W,\ell}^{\rm out}$、输入和输出通道数为 $N_{\ell-1}^c$ 与 $N_\ell^c$。其 FLOPs 阶为

$$
O\!\left(K_{H,\ell}^{c}K_{W,\ell}^{c}
H_{H,\ell}^{\rm out}H_{W,\ell}^{\rm out}
N_{\ell-1}^{c}N_{\ell}^{c}\right). \tag{30}
$$

全连接层的 FLOPs 阶为 $O(N_{\ell-1}^fN_\ell^f)$，所以 HCP-Net 的主导复杂度为

$$
O\!\left[
\sum_{\ell\in\mathcal L_f}N_{\ell-1}^fN_\ell^f+
\sum_{\ell\in\mathcal L_c}
K_{H,\ell}^{c}K_{W,\ell}^{c}
H_{H,\ell}^{\rm out}H_{W,\ell}^{\rm out}
N_{\ell-1}^{c}N_\ell^{c}
\right]. \tag{31}
$$

其中 $\mathcal L_f$、$\mathcal L_c$ 分别为全连接层和卷积层的索引集合。原文指出，归一化、池化及矩阵元素替换等操作不会改变以卷积与全连接层为主的渐近阶数，因而未单独统计。

## 补译：IV. 仿真设置与主要结果

### A. 场景与信道生成

使用 Blender 构建 $N_{\rm scene}=300$ 个室内办公室三维场景，每个场景长 20 m、宽 10 m、高 3 m。沿办公室长边 2–16 m 的范围选取随机散射体布置区，划分为 $2\times2$ m 的网格，每个场景随机在 5–8 个网格中放置散射体。每个散射体的长宽分别从 1 m、1.5 m、2 m 中选取，高度从 0.5 m、1 m、3 m 中选取；当散射体高 3 m 时，将其视为混凝土墙柱，否则材料随机设为木材或金属。墙体、地板及天花板为混凝土，接收端分布在办公室右侧开放区域。

信道由商业射线追踪软件 Wireless InSite 生成，建模场景的物体尺寸、位置与材料与 Blender 完全一致。每个场景在接收区域按 0.5 m 间隔部署 $7\times19=133$ 个接收点；基站位置固定为 $\mathbf p_{\rm BS}=(0,5,2)$，接收机高度为 1 m。每个收发对均计算 sub-6 GHz 与毫米波信道。因此，300 个场景共有 39,900 组共址多频段样本，随机抽取 31,920 组（80%）训练，7,980 组（20%）测试。另外构建 60 个全新场景，得到 7,980 组保留样本，用于验证对新场景的泛化。两条路径的方位与仰角差均不足 $1^\circ$ 时，将它们合并为一个簇。

### B. 算法参数与性能指标

静态点云经 Trimesh 与 Open3D 转换为 4096 个点。作者还测试了点云密度 1024、2048、4096 和 8192：增加点数时 CD 损失分别降低 4.98%、6.77%、1.78%，因此选用 4096 以平衡精度和复杂度。sub-6 GHz 角度网格为 $32\times32$，提取 $N_{\rm peak}=25$ 条路径，分层下采样率 $k_s=5$。sub-6 GHz 信道嵌入使用 $K_s^E=1$、$O_s^E=1$、$R_s^E=1/2$；毫米波使用 $K_m^E=1$、$O_m^E=1$、$R_m^E=1/3$。所有孪生输入在送入 HCP-Net 前转换为以基站为原点的局部坐标。距离矩阵及掩码矩阵大小为 $N_H=31$、$N_W=180$，基础神经元规模 $U=2048$。

正样本权重设为 $w_{\rm Dom}^B=w_{\rm Dom}^M=120$，$w_{\rm Maj}^B=w_{\rm Maj}^M=24$，$w_{\rm Ful}^B=w_{\rm Ful}^M=5$。预训练与微调各执行 100 个 epoch。预训练前 60 个 epoch 的三级权重为 $(0.5,0.3,0.2)$，之后为 $(0.4,0.3,0.3)$；微调前 60 个 epoch 沿用后一组，后 40 个 epoch 改为 $(0.3,0.3,0.4)$。Adam 学习率 $2.5\times10^{-4}$、批大小 16、$\lambda_{\rm AVD}=\lambda_{\rm MASK}=1$、$\lambda_{\rm CD}=0.5$。

下游波束选择基线包括穷举搜索（ExS）、环境感知波束训练（ESBT）、监督式波束预测（SLBP）、同时正交匹配追踪（SOMP）和使用 sub-6 GHz 角度先验的结构化 logit 加权 SOMP（SLW-SOMP）。评估指标包括波束选择成功比例（SP）和平均可达速率（AAR）。可达速率计算包含波束扫描的时间开销；仿真设单次扫描时间与时隙时间之比 $T_b/T_m=1/4096$。

### C. 结果与讨论

图 10 展示前 100 个 epoch 的预训练和后 100 个 epoch 的微调损失。由于加入 CD 约束，微调开始时总损失增加，随后持续下降并收敛；训练集与测试集的 CD 损失均可收敛。图 11 展示两组测试信道的方位和仰角 PAS。TwinPAS 能较准确地预测主要高功率路径的角度和功率；弱路径可能存在偏差，网络也会预测少量实际不存在的路径，但这些伪路径通常功率较低，对完整 PAS 的影响有限。

第一组消融研究测试数字孪生的构成。去掉静态场景几何后，CD 损失增加 65.33%；去掉材料属性后增加 29.33%；去掉信道嵌入 CE 也显著增加 CD 损失。另一实验在移除场景后，把估计的 sub-6 GHz 参数替换为邻近位置真实毫米波参数，CD 只相对无场景版本下降 4.50%，说明单纯替换跨频带信道信息无法弥补缺失的场景特征。第二组消融针对网络结构：将 CMCE 换成 PointNet 的 MLP，CD 增加 37.33%；去掉分层输入增加 84.00%；取消金字塔输出增加 25.33%。这些结果分别支持跨模态几何融合、不同分辨率输入以及由深到浅输出传递的作用。

图 14–15 对比不同 sub-6 GHz 信噪比下的波束选择效果，毫米波信噪比固定为 30 dB。在较高 sub-6 GHz 信噪比下，SOMP、ESBT、SLBP、SLW-SOMP 的 SP 分别为 51.13%、70.09%、73.44%、75.64%，TwinPAS 达到 **83.53%**；其 AAR 也最接近使用最优 DFT 码字、且忽略噪声与训练开销的上界。附加实验中，以 2.1 GHz 信道参数辅助预测 28 GHz PAS，获得 81.95% SP 和 9.59 bit/s/Hz AAR，接近原本 3.5 GHz 辅助的结果。

最后，在 60 个新场景构成的保留数据集上进行泛化测试。图 16 显示，与原测试集相比，弱路径预测略差，但主要强路径仍可较好预测；图 17 的 CD 收敛趋势也与测试集相近。当两套系统的 SNR 均为 30 dB 时，新场景的 SP 达到 78.80%，AAR 为 9.47 bit/s/Hz。需要注意，新场景仍与训练场景在房间类型及物体变化范围上存在相似性，因此这一实验支持的是**相近环境族内的泛化能力**，不能直接推出在任意场景下的零样本泛化。

## V. 结论（补译）

本文针对多频段共存系统提出数字孪生信道驱动的毫米波 PAS 预测方法。通过计算机视觉和 sub-6 GHz 信道参数估计，构建能够反映物理传播环境变化的数字孪生；通过跨模态信道嵌入，将视觉感知的三维几何与无线传播特征有效融合。为了预测完整的多径空间功率分布，HCP-Net 按路径功率构造不同分辨率的数字孪生输入和多层输出。仿真结果表明，TwinPAS 在 PAS 预测和波束选择方面具有竞争力，并能在散射体位置、大小和材料于一定范围内变化的相近场景中表现出较好的泛化，这也是后续数字孪生通信研究值得进一步探索的方向。

**补译范围说明：** 此次补齐第三节公式（19）–（31）、网络结构与训练损失，并扩展第四节实验设置和主要实验比较、第五节结论。原文表 II、III 的全部单元格、部分图注和参考文献条目仍需精校。
