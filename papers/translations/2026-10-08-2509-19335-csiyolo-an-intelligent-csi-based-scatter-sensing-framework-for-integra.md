---
layout: page
title: "CSIYOLO：面向通感一体系统的智能 CSI 散射感知框架｜中文全文译文"
permalink: /papers/translations/2026-10-08-2509-19335-csiyolo-an-intelligent-csi-based-scatter-sensing-framework-for-integra/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/2b5b5693450fd2ff/) · [原文 arXiv](https://arxiv.org/abs/2509.19335) · [全部目录](/papers/catalog/)

# CSIYOLO：面向通感一体系统的智能 CSI 散射感知框架

**原题：** CSIYOLO: An Intelligent CSI-Based Scatter Sensing Framework for Integrated Sensing and Communication Systems  
**作者：** Xudong Zhang、Jingbo Tan、Zhizhen Ren、Jintao Wang、Yihua Ma、Jian Song  
**版本：** arXiv:2509.19335v1，2025-09-15，原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VI 节、结论、致谢与资助说明、图 1–16 图注、表 I–III 逐格、算法 1、参考文献 [1]–[41]（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

通感一体（integrated sensing and communication，ISAC）被视为下一代通信系统的重要技术，能够同时支持高速数据传输与精确目标感知。在 ISAC 的各类任务中，散射感知对于充分挖掘 ISAC 潜力、支撑自动驾驶与低空经济等应用至关重要。然而，现有方法大多依赖波形与硬件改动，或依赖传统信号处理方案，导致与当前通信系统的兼容性较差、感知精度受限。为应对这些挑战，我们提出 CSIYOLO：一种仅利用单一基站—用户设备（base station–user equipment，BS–UE）对的估计信道状态信息（channel state information，CSI）即可完成散射体定位的框架。该框架包含两个主要部分：基于锚框的散射参数检测与基于 CSI 的散射定位。首先，我们将散射参数提取表述为图像检测问题，受 You Only Look Once（YOLO）架构启发提出基于锚框的散射参数检测方法，并配以自适应鬼影目标去除策略。随后，推导基于 CSI 的定位算法，利用所提取参数确定散射体位置。此外，为提高定位精度与实现效率，我们设计了带任务导向优化的可扩展网络结构，支持多尺度锚框检测并更好地适配 CSI 特性；进一步设计噪声注入训练策略以增强对信道估计误差的鲁棒性。由于所提框架仅作用于估计 CSI，不修改波形或信号处理流程，因此可作为插件无缝集成到现有通信系统中。实验表明，在散射体数量与估计误差变化的情况下，所提方法能够以相对较低的复杂度显著优于现有方法的散射定位精度。

**索引词：** 环境感知、散射体定位、深度学习、通感一体。

> 脚注（原首页）：本工作部分受北京市自然科学基金（项目号 L242083）与国家自然科学基金（项目号 62401315）资助。通讯作者：Jingbo Tan、Jintao Wang。论文开源代码见 https://github.com/zhang-xd18/csiyolo 。

## I. 引言

### A. 背景与动机

通感一体（ISAC）已被广泛视为下一代通信系统的关键使能技术，近年来受到大量研究关注。作为国际移动通信（International Mobile Telecommunication，IMT）2030 框架认定的 6G 六项潜在技术之一 [1]，ISAC 旨在同时支持有效的数据传输与精确的目标感知。随着载频提高与信号设计不断进步，利用通信信号进行感知的潜力已被广泛探索，为 ISAC 发展带来新机遇 [2]、[3]。已有大量工作致力于从 ISAC 信号中提取感知信息，包括设计具有良好相关特性的波形以及嵌入额外感知信号。在这些进展基础上，ISAC 正在为低空经济 [4]、自动驾驶 [5] 与智能物联网 [6] 等新兴应用铺平道路。

在 ISAC 的各类任务中，散射感知对于进一步释放 ISAC 的全部潜力尤为重要。一方面，散射感知涵盖三维（3D）环境重建与散射体定位，可提供全面的环境感知能力，从而在低空经济 [4] 等实际应用中支撑更智能的连接与更高效的传输。另一方面，散射感知可通过信道管理、资源分配与自适应信号处理等操作，为通信系统优化带来巨大收益。受 ISAC 启发的环境辅助通信优化近来已引起广泛研究，包括环境辅助波束预测 [7]、遮挡控制 [8] 与信道重建 [9]。这些研究表明利用环境信息提升通信性能的潜力，为更智能、更具自适应性的通信系统奠定基础。

然而，当前通信系统面向通信的信号设计所固有的感知能力有限与信息损失，仍对感知性能、尤其是散射感知构成重大障碍。因此，如何利用现有通信信号实现有效的散射感知，已成为 ISAC 研究中的关键问题。

### B. 相关工作

散射感知在 ISAC 研究中受到相当关注。传统方法主要依赖雷达系统或专用波形，这类方案往往成本高昂，且难以集成到现有通信基础设施中。例如，调频连续波（frequency-modulated continuous wave，FMCW）波形被广泛用于环境重建研究 [10]，其回波信号通常采用基于离散傅里叶变换（DFT）的算法 [11] 或多重信号分类（MUSIC）方法 [12]–[14] 处理。然而，此类技术的分辨率限制以及 FMCW 波形的固有约束已在一些工作中被指出 [15]、[16]。此外，雷达波形通常带来较高硬件成本与集成挑战，与广泛部署的通信系统兼容性较差。因此，利用现有通信信号（如正交频分复用（OFDM））进行散射感知已成为一个有前景的方向，可为 ISAC 部署提供更高的灵活性与兼容性。

近年来，利用现有通信信号进行散射感知取得了实质进展，主要通过两条途径：跨多个通信节点的传输时延方法，以及大规模多输入多输出（MIMO）-OFDM 系统中的多维信号处理方案。

一方面，基于传输时延的方法从多个节点（如基站与用户设备）之间信号传输时延的差异估计散射体位置。这催生了利用跨多个节点的 OFDM 信号时延分析进行散射体定位的一系列工作 [17]–[20]。例如，[18] 提出一种基于飞行时间（time-of-flight，ToF）估计的无设备定位技术，采用两阶段框架确定估计范围并去除鬼影目标。此类方法通常需要多个节点协作以降低模糊性 [17]、[19]。然而，有效关联散射簇并消除鬼影目标仍然具有挑战性；此外，可用协作节点数量以及各节点的估计误差会显著降低定位精度。

另一方面，随着大规模 MIMO-OFDM 系统的广泛部署，仅利用单个 BS–UE 对，通过挖掘到达角等空间信息即可实现散射体定位。已有先进信号处理算法被用于从此类系统中的多维 ISAC 信号提取环境信息。例如，[21]、[22] 的研究者提出先进优化算法，基于下行与上行导频信号进行联合散射体定位与信道估计。类似地，[23] 利用毫米波信号，通过在检测区域内持续跟踪实现散射体定位。此外，[24] 从接收的 OFDM 回波中研究散射体的电磁特性。然而，这些方法大多需要对收发机做特定的信号修改或额外硬件调整，导致实现成本上升。

为避免改动信号结构或硬件，近期研究探索利用估计 CSI 进行散射感知，为单一 BS–UE 对提供更灵活、更兼容的解决方案。该方法利用了环境传播特性本身嵌入于 CSI 之中的事实，从而可在不改变现有通信流程的前提下无缝提取这些信息 [25]。例如，[26] 提出低秩张量分解（low-rank tensor decomposition，LTD）方法，从 CSI 矩阵中提取包括路径传输时延与角度在内的散射参数，并利用神经网络实现路径分类。类似地，[14] 同时利用上行与下行 CSI 进行四维环境重建：先用 MUSIC 与基于 DFT 的方法估计散射参数，再通过专用网络融合所提取特征以提升重建精度。此外，[27] 研究了频率、带宽等信道特性对基于 CSI 的感知性能的影响。然而，上述方法仍依赖 MUSIC、DFT 等传统参数估计算法，而这些算法在散射体数量变化或含噪信道条件下的性能会严重退化 [28]。

综上，现有散射感知方法面临两个主要局限：（i）由于需要多节点协作，或需改动硬件、波形与信号处理流程，与现有通信流水线的兼容性较差；（ii）受分辨率限制、鬼影目标以及对含噪信道和可变散射体数量敏感的影响，精度退化。因此，为应对这些局限，有必要发展能够无缝集成到现有通信系统中的鲁棒、自适应散射定位方法，而这仍是一个重要且尚未解决的问题。

### C. 贡献

为应对上述挑战，本文提出一种新颖的散射感知框架，利用 MIMO-OFDM 系统中单一 BS–UE 对的估计 CSI。该框架将散射体定位表述为目标检测问题，并受 You Only Look Once（YOLO）架构 [29] 启发，提出一种带自适应鬼影目标去除策略的高效锚框检测方法。网络设计与训练策略针对 CSI 的特征分布特性进行优化，以提升在可变散射体数量与含噪信道条件下的鲁棒性。本文贡献概括如下：

- 我们提出一种可插拔的基于 CSI 的散射感知框架 CSIYOLO：它利用估计 CSI 进行散射体定位，并可无缝集成到现有通信信号处理流水线中。该框架包含两个阶段：基于锚框的散射参数检测与基于 CSI 的散射定位。首先，设计基于锚框的检测方法，从 CSI 矩阵估计散射参数并进行自适应鬼影目标去除；随后，提出面向单一 BS–UE 对的定位算法，基于所提取参数实现精确的散射体定位。
- 我们将散射参数估计表述为目标检测任务，并为此设计受 YOLO 启发的基于锚框的检测网络。我们不直接把 YOLO 用于图像检测，而是利用 CSI 的独特特性重新设计检测逻辑与损失函数，以满足散射感知的需求。该网络捕获 CSI 分布与散射参数之间的连续映射，同时自适应估计检测置信度以去除鬼影目标，从而在散射体数量可变时实现准确定位。
- 为提高含噪信道下的定位精度与鲁棒性，我们精心设计了带任务导向优化的可扩展网络结构，并采用多尺度锚框检测。我们引入圆周卷积以改善角度域的特征提取，并利用卷积分解实现可扩展、高效的实现；此外，加入噪声注入训练策略以增强对信道估计误差的鲁棒性。
- 大量实验证明 CSIYOLO 相对于传统方法的有效性。该框架在可变散射体数量下以相对较低的复杂度取得更高定位精度，成功去除鬼影目标，并在含噪信道下保持性能，显著优于甚至假设精确已知散射体数量先验的传统方法。

### D. 组织结构与记号

全文其余部分组织如下：第 II 节介绍 ISAC 系统模型并表述散射感知任务；第 III 节给出所提智能 CSI 散射感知框架，包括基于锚框的散射参数检测与基于 CSI 的散射定位；第 IV 节详述高效可扩展的网络设计与噪声注入训练策略；第 V 节给出仿真设置与实验结果以验证所提方法的有效性；第 VI 节总结全文。

**记号：** 粗体大写字母、粗体小写字母与常规字体分别表示矩阵、向量与标量。$(\cdot)^T$ 与 $(\cdot)^H$ 分别表示转置与 Hermitian 转置。$A[i,j]$ 为矩阵 $A$ 的第 $(i,j)$ 个元素。$|a|$ 与 $\|a\|$ 分别表示标量 $a$ 的绝对值与向量 $a$ 的 $\ell_2$ 范数。$\lfloor\cdot\rfloor$ 表示下取整函数，$[\cdot]\times[\cdot]$ 表示区间的笛卡尔积，$\mathbf 1$ 表示指示函数。$\{\cdot\}$ 表示集合，集合 $A$ 的基数记作 $|A|$。$\mathbb C$、$\mathbb R$ 与 $\mathbb Z$ 分别表示复数、实数与整数集合。$\mathcal N(\mu,\sigma^2)$ 表示均值为 $\mu$、方差为 $\sigma^2$ 的高斯分布。

## II. 系统模型

本节介绍 ISAC 系统的信号模型，并针对单一 BS–UE 对的 MIMO-OFDM 系统表述基于 CSI 的散射感知问题。

### A. ISAC 系统

如图 1 所示，我们考虑包含单一 BS–UE 对的单小区 ISAC 系统。对于多用户场景，所提方法可便捷地逐用户单独应用，未来工作将聚焦于有效的合并策略，以汇聚多用户信息提升感知精度。基站配备 $N_t$ 根发射天线，采用均匀线阵（uniform linear array，ULA）配置；用户设备配备 $N_r$ 根接收天线，为简洁起见设 $N_r=1$。数据传输采用 OFDM 波形，共 $N_c$ 个子载波。基站与用户设备之间的无线传播环境中随机分布 $N_s$ 个散射体，它们既构成下行通信信道，也作为感知目标。在导频训练阶段，用户设备估计下行信道以支撑数据接收与解调；这些估计信道本身包含环境散射体信息，从而为环境感知提供了可能。

具体而言，考虑基站位于已知位置 $\mathbf p_{\mathrm{bs}}=[p_{\mathrm{bs}}^x,p_{\mathrm{bs}}^y]$，用户设备位于 $\mathbf p_{\mathrm{ue}}=[p_{\mathrm{ue}}^x,p_{\mathrm{ue}}^y]$，该位置可由用户设备中的全球定位系统（GPS）获得 [17]。此外，第 $l$ 个散射体的位置记作 $\mathbf p_{s,l}=[p_{s,l}^x,p_{s,l}^y]$（脚注 1）。于是，第 $n_c$ 个子载波上的下行通信信道可基于 Saleh–Valenzuela 模型 [30] 表示为

$$
\mathbf h_{n_c}=\sum_{l=0}^{N_s}\alpha_l e^{-j2\pi\tau_l\left(f_0+n_c\Delta f\right)}\mathbf a^T(\theta_l), \tag{1}
$$

其中 $\alpha_l$、$\tau_l$ 与 $\theta_l$ 分别表示第 $l$ 条路径的复信道增益、传输时延与离开角（angle of departure，AoD）；$f_0$ 与 $\Delta f$ 分别表示中心频率与子载波间隔；$\mathbf a^T(\theta)$ 为基站发射天线的导向矢量，可表示为

$$
\mathbf a^T(\theta_l)=\left[1,\ e^{-j2\pi\frac{d\sin(\theta_l)}{\lambda}},\ \ldots,\ e^{-j2\pi\frac{(N_t-1)d\sin(\theta_l)}{\lambda}}\right]^T, \tag{2}
$$

其中 $d$ 为天线间距，$\lambda$ 为通信信号波长。注意 $l=0$ 表示视距（line-of-sight，LoS）通信路径，其信道增益通常大于其余 $N_s$ 条非视距（non-line-of-sight，NLoS）路径。

> 脚注 1（原文）：对于更实际的 3D 场景，基站需采用均匀平面阵以获取离开仰角；此时后续系统表述可方便地扩展 $z$ 坐标，所提方法亦可通过 3D 推导与卷积加以适配。3D 场景的详细表述留待未来研究。

通过将 $\mathbf p_{\mathrm{ue}}$ 记为 $\mathbf p_{s,0}$，第 $l$ 条路径（$0\le l\le N_s$）的时延 $\tau_l$ 与 AoD $\theta_l$ 可进一步表示为

$$
\tau_l=\frac{\left\|\mathbf p_{s,l}-\mathbf p_{\mathrm{bs}}\right\|+\left\|\mathbf p_{s,l}-\mathbf p_{\mathrm{ue}}\right\|-\left\|\mathbf p_{\mathrm{bs}}-\mathbf p_{\mathrm{ue}}\right\|}{c},\qquad
\theta_l=\arctan\left(\frac{p_{s,l}^y-p_{\mathrm{bs}}^y}{p_{s,l}^x-p_{\mathrm{bs}}^x}\right), \tag{3}
$$

其中 $c$ 表示光速。最终，全部子载波的信道矩阵可表示为 $\mathbf H=\left[\mathbf h_0^H;\mathbf h_1^H;\ldots;\mathbf h_{N_c-1}^H\right]\in\mathbb C^{N_c\times N_t}$。相应地，用户设备在第 $n_c$ 个子载波上的接收信号可建模为

$$
\mathbf y_{n_c}=\mathbf h_{n_c}^H\mathbf x_{n_c}+\mathbf z_{n_c}, \tag{4}
$$

其中 $\mathbf x_{n_c}\in\mathbb C^{N_T\times1}$ 为第 $n_c$ 个子载波承载的发送符号，$\mathbf z_{n_c}$ 为加性高斯噪声。在传统通信信号处理流程中，基站通常执行导频训练以便用户设备进行信道估计。借助最小二乘或最小均方误差估计等常规信道估计方法，用户设备可获得估计信道矩阵：

$$
\hat{\mathbf H}=\mathrm{CE}\left(\mathbf y,\mathbf X_p\right), \tag{5}
$$

其中 $\mathbf y=[\mathbf y_0,\mathbf y_1,\ldots,\mathbf y_{N_c-1}]$ 为接收信号向量，$\mathbf X_p=\left[\mathbf x_0^p,\mathbf x_1^p,\ldots,\mathbf x_{N_c-1}^p\right]$ 为发送导频符号。为简洁起见，下文统一用 $\mathbf H$ 表示估计信道矩阵。

### B. 基于 CSI 的散射感知

如式 (3) 所示，散射体位置通过传输时延与 AoD 等散射参数决定 CSI，从而使得从估计 CSI 推断散射体位置成为可能。因此，单一 BS–UE 对下基于 CSI 的散射感知问题可表述为 [17]：

$$
\left\{\mathbf p_{s,l}\right\}_{1\le l\le N_s}=f\left(\mathbf H,\mathbf p_{\mathrm{bs}},\mathbf p_{\mathrm{ue}}\right), \tag{6}
$$

其中映射函数 $f(\cdot)$ 即待设计的基于 CSI 的散射感知方法。

为提高散射体定位精度，需要应对以下几项挑战。

- **散射体数量可变。** MUSIC 等传统方法通常在散射体数量已知的前提下表现良好；但在散射体数量未知且可能变化的实际场景中，这一假设往往不成立。
- **信道估计误差。** 用户设备估计得到的 CSI 不可避免地因估计误差而存在信息损失，使信息提取困难并降低散射体定位精度。
- **鬼影目标去除。** 受多径效应影响，一些鬼影目标可能被误检为真实散射体，从而严重降低定位性能。

然而，现有大多数基于 CSI 的方法依赖 MUSIC、DFT 等传统参数估计技术，这些技术对信道估计误差与鬼影目标干扰敏感，且往往难以处理散射体数量可变的场景 [28]。

## III. CSIYOLO：智能 CSI 散射感知框架

为应对上述挑战，我们提出一种智能 CSI 散射感知框架，命名为 CSIYOLO，可在散射体数量未知的情况下有效定位散射体，并增强对信道估计误差的鲁棒性。如图 2 所示，所提框架可作为可插拔模块无缝集成到现有通信系统中，包含两个主要阶段：基于锚框的散射参数检测与基于 CSI 的散射定位。

### A. 阶段 1：基于锚框的散射参数检测

本小节详述所提基于锚框的散射参数检测方法。首先，将散射参数提取任务表述为目标检测问题；随后，设计基于锚框的检测方法，从信道中精确提取散射参数并自适应去除鬼影目标。

**1）参数提取作为目标检测任务。** 与通过对信道矩阵做似然或网格搜索直接进行参数估计的传统方法不同，我们将参数提取问题转化为目标检测任务。首先，利用二维（2D）逆 DFT 将频率—天线域的信道矩阵 $\mathbf H$ 变换到角度—时延域 $\bar{\mathbf H}$：

$$
\bar{\mathbf H}=\mathbf F_a\mathbf H\mathbf F_d, \tag{7}
$$

其中 $\mathbf F_a\in\mathbb C^{N_c\times N_c}$ 与 $\mathbf F_d\in\mathbb C^{N_t\times N_t}$ 为 DFT 矩阵。经变换后，信道稀疏性得到增强，不同传输路径在二维平面上彼此分离，但仍不可避免地存在重叠与干扰。

如图 3(a) 所示，散射体（即传输路径）可由其在角度—时延平面上的二维坐标识别，这些坐标对应各路径的传输 AoD 与时延。此时，散射参数 $\theta_l$ 与 $\tau_l$ 的估计可转化为二维平面上的目标检测与定位问题，即设法获得散射体的二维坐标。具体地，考虑频率—天线域的离散信道矩阵，$\mathbf H$ 可表示为

$$
\mathbf H[m,n]=\sum_{l=0}^{N_s}\alpha_l e^{-j2\pi\tau_l\left(f_0+m\Delta f\right)}e^{-j2\pi n\frac{d\sin(\theta_l)}{\lambda}}. \tag{8}
$$

经过二维逆 DFT 后，角度—时延域的信道矩阵可表示为

$$
\begin{aligned}
\bar{\mathbf H}\left[\bar\tau,\bar\theta\right]
&=\sum_{m=0}^{N_c-1}\sum_{n=0}^{N_t-1}\mathbf H[m,n]e^{j2\pi\frac{m\bar\tau}{N_c}}e^{j2\pi\frac{n\bar\theta}{N_t}}\\
&=\sum_{l=0}^{N_s}\alpha_l'\sum_{m=0}^{N_c-1}e^{-j2\pi m\left(\Delta f\tau_l-\frac{\bar\tau}{N_c}\right)}\sum_{n=0}^{N_t-1}e^{-j2\pi n\left(\frac{d\sin(\theta_l)}{\lambda}-\frac{\bar\theta}{N_t}\right)}\\
&=\sum_{l=0}^{N_s}\alpha_l'\,g_1\left(\Delta f\tau_l,\bar\tau\right)g_2\left(\frac{d\sin(\theta_l)}{\lambda},\bar\theta\right),
\end{aligned}\tag{9}
$$

其中 $\alpha_l'=\alpha_le^{-j2\pi f_0\tau_l}$，$(\bar\tau,\bar\theta)$ 为散射体在二维角度—时延域中的坐标。

> 公式说明（原文未显式展开）：$g_1(\cdot,\cdot)$ 与 $g_2(\cdot,\cdot)$ 为由上述两个几何级数求和得到的 Dirichlet 核函数，其模值在 $\bar\tau=\Delta f\tau_lN_c$、$\bar\theta=\frac{d\sin(\theta_l)}{\lambda}N_t$ 处取峰值。

考虑广泛采用的设置 $d=\lambda/2$，第 $l$ 个散射体“目标”在角度—时延域中的坐标可通过最大化 $\bar{\mathbf H}$ 的模值导出：

$$
\begin{aligned}
\bar\tau_l&=\left\lfloor\Delta f\tau_lN_c\right\rfloor,\\
\bar\theta_l&=\left\lfloor\left(\frac{2Z+\sin(\theta_l)}{2}\right)N_t\right\rfloor,\quad Z\in\mathbb Z\\
&=\begin{cases}
\left\lfloor\dfrac{\sin(\theta_l)}{2}N_t\right\rfloor, & \sin(\theta_l)\ge0,\\[6pt]
\left\lfloor\left(\dfrac{\sin(\theta_l)}{2}+1\right)N_t\right\rfloor, & \sin(\theta_l)<0.
\end{cases}
\end{aligned}\tag{10}
$$

由式 (10)，散射参数 $(\tau_l,\theta_l)$ 可进一步由坐标 $(\bar\tau_l,\bar\theta_l)$ 反推得到：

$$
\tau_l=\frac{\bar\tau_l}{\Delta f N_c},\qquad
\theta_l=\arcsin\left[\frac{2\bar\theta_l}{N_t}-2\cdot\mathbf 1\left(\bar\theta_l>\frac{N_t}{2}\right)\right]. \tag{11}
$$

需要指出，尽管二维网格上的坐标为整数，所提方法能够推断连续坐标位置，从而克服网格带来的精度限制。通过将角度—时延域信道矩阵解释为二维图像、将散射传输路径解释为图像中的目标，散射参数提取任务便自然地转化为目标检测问题，如图 3 所示；这与计算机视觉（computer vision，CV）领域研究充分的目标检测问题相似。

**2）受 YOLO 启发的锚框散射检测。** 随着 CV 的快速发展，目标检测技术经历了从 Fast R-CNN [31] 等两阶段检测方法到 YOLO 系列 [29]、[32]、[33] 等一阶段检测方法的演进。实践已表明，YOLO 系列在检测精度与效率上均优于传统两阶段方法，能够以高精度实现实时检测。

然而，角度—时延域 CSI 矩阵中的散射坐标检测，与 CV 中的传统目标检测任务仍存在显著差异：

- **目标形状。** 在角度—时延域 CSI 矩阵中，目标不同于大多数 CV 目标检测任务通常假设的矩形边界框；它们呈现沿两个维度、由中心点向外扩散的分布。尽管扩散范围可能较大，路径能量主要集中于中心附近。因此，CV 中通过捕捉目标边界进行检测的传统逻辑在此并不直接适用。
- **检测目的。** 散射参数检测的目标是准确识别散射目标中心的二维坐标，而传统目标检测的目标是确定目标边界框。在 CSI 矩阵中，边界框既无良好定义，也与散射体定位无关。因此，直接套用传统目标检测方法可能带来不必要的计算开销与次优性能。

因此，需要面向散射参数检测进行超越传统目标检测方法的任务导向优化。据此，我们受 YOLO 的锚框与回归思想启发，提出一种基于锚框的检测方法，可显著提升检测精度与效率。

如图 4 所示，我们并不将信道矩阵直接投影为估计参数，而是把信道矩阵中的每个元素作为所提检测方法中的一个“锚框”。这意味着每个元素都充当附近散射坐标的估计器：它估计附近散射体的相对位置，并给出该估计的置信度。通过合并全部锚框的输出，即可获得所有散射坐标。具体地，对信道矩阵的第 $i$ 个锚框，其对应坐标 $(\bar\tau_i,\bar\theta_i)$ 处的矩阵元素，将在矩阵中扫描邻近区域 $[\bar\tau_i-\Delta\bar\tau/2,\bar\tau_i+\Delta\bar\tau/2]\times[\bar\theta_i-\Delta\bar\theta/2,\bar\theta_i+\Delta\bar\theta/2]$。在该区域内，锚框估计附近散射体相对于参考点（通常为左上角）的相对偏移 $(\Delta\hat{\bar\tau}_i,\Delta\hat{\bar\theta}_i)$。由此，散射体坐标可被连续估计，克服网格分辨率造成的精度限制。借助相对坐标偏移，只需将其与参考点坐标相加即可方便得到绝对散射坐标。同时，锚框还估计并输出该检测散射体的置信度 $\hat C_i$。基于该检测方法，我们设计基于锚框的网络 $f(\cdot)$ 处理信道 $\bar{\mathbf H}$，并输出全部锚框的检测结果：

$$
\left\{\left(\Delta\hat{\bar\tau}_i,\Delta\hat{\bar\theta}_i,\hat C_i\right)\right\}_{1\le i\le N_a}=f\left(\bar{\mathbf H}\right), \tag{12}
$$

其中 $N_a$ 为由网络输出尺寸确定的锚框数量，详见第 IV 节。

于是，对位于 $(\bar\tau_i,\bar\theta_i)$ 的单个锚框，以真值散射坐标偏移 $(\Delta\bar\tau_i,\Delta\bar\theta_i)$ 为训练目标，其损失由定位损失 $\mathcal L_{\mathrm{loc}}$ 与目标性损失 $\mathcal L_{\mathrm{obj}}$ 两部分组成：

$$
\begin{aligned}
\mathcal L\left(\bar\tau_i,\bar\theta_i\right)
&=\mathcal L_{\mathrm{loc}}\left(\bar\tau_i,\bar\theta_i\right)+\mathcal L_{\mathrm{obj}}\left(\bar\tau_i,\bar\theta_i\right)\\
&=\left[\left(\Delta\hat{\bar\tau}_i-\Delta\bar\tau_i\right)^2+\left(\Delta\hat{\bar\theta}_i-\Delta\bar\theta_i\right)^2\right]\\
&\quad-\rho\left[C_i\log\left(\hat C_i\right)+\left(1-C_i\right)\log\left(1-\hat C_i\right)\right],
\end{aligned}\tag{13}
$$

其中 $\rho$ 为超参数，用于平衡目标性损失与定位损失以获得更好的训练效果。若锚框扫描区域内存在散射体，则置信度真值 $C_i$ 置为 1，否则置为 0。同时，锚框可按其扫描区域内是否存在散射体分为正锚框与负锚框：正锚框用式 (13) 的完整损失训练；负锚框仅用目标性损失训练以避免误检。因此，对整个包含多个锚框的信道矩阵，网络 $f(\cdot)$ 的总训练损失函数可表示为全部锚框损失之和：

$$
\begin{aligned}
\mathcal L&=\sum_{i\in\mathcal P}\left[\mathcal L_{\mathrm{loc}}\left(\bar\tau_i,\bar\theta_i\right)+\mathcal L_{\mathrm{obj}}\left(\bar\tau_i,\bar\theta_i\right)\right]+\sum_{i\in\mathcal N}\mathcal L_{\mathrm{obj}}\left(\bar\tau_i,\bar\theta_i\right)\\
&=\sum_{i\in\mathcal P}\left[\left(\Delta\hat{\bar\tau}_i-\Delta\bar\tau_i\right)^2+\left(\Delta\hat{\bar\theta}_i-\Delta\bar\theta_i\right)^2\right]\\
&\quad-\rho\sum_{i=1}^{N_a}\left[C_i\log\left(\hat C_i\right)+\left(1-C_i\right)\log\left(1-\hat C_i\right)\right],
\end{aligned}\tag{14}
$$

其中 $\mathcal P$ 与 $\mathcal N$ 分别为正锚框与负锚框的集合。

**3）自适应鬼影目标去除。** 作为 MUSIC 类 [13]、[14] 或 ToF 类 [18] 传统方法的常见难题，鬼影目标容易被误检为真实散射体，从而显著影响定位性能。其原因在于：在多径效应与估计噪声下，通信路径会在信道矩阵中产生重叠或干扰，形成传统信号处理方法难以区分的鬼影目标。尤其是在缺乏散射体数量先验信息时，鬼影目标极易被误识别，严重影响定位精度。

相比之下，所提 CSIYOLO 框架能够自适应估计每个被检测散射体的置信度，并通过简单的阈值策略去除鬼影目标。具体地，在检测网络 $f(\cdot)$ 得到每个散射体的坐标偏移与置信度后，首先将相对偏移变换为绝对坐标；随后用较低置信度阈值 $t_1$（例如 0.5）对输出候选散射体做粗筛，低于 $t_1$ 的检测被丢弃。剩余散射体随后基于空间邻近性合并，将邻近检测归为一组，并以单个散射体 $(\hat{\bar\tau}',\hat{\bar\theta}')$ 替代：

$$
\left(\hat{\bar\tau}',\hat{\bar\theta}'\right)
=\left\{\left(\hat{\bar\tau}_j,\hat{\bar\theta}_j\right):j\in\mathcal I,\ \hat C_j=\max_{i\in\mathcal I}\hat C_i\right\},\qquad
\mathcal I=\left\{i:\forall i_1,i_2\in\mathcal I,\ \left(\hat{\bar\tau}_{i_1}-\hat{\bar\tau}_{i_2}\right)^2+\left(\hat{\bar\theta}_{i_1}-\hat{\bar\theta}_{i_2}\right)^2<t_d\right\}, \tag{15}
$$

其中 $t_d$ 表示控制合并范围的阈值。最后，应用细粒度阈值 $t_2$——自适应地设为剩余候选平均置信度的三分之一——进一步精化检测并消除鬼影目标。事实上，得益于 CSIYOLO 强大的检测能力，可能散射体的置信度高度集中，使得鬼影目标可被简单阈值化轻松去除。

**4）训练与推理流程。** 综上，所提基于锚框的散射参数检测方法由训练与推理两个阶段组成，如算法 1 所述。训练阶段，信道样本送入基于锚框的检测网络 $f(\cdot)$ 生成估计散射坐标，并计算式 (14) 的损失函数、反向传播更新网络权重。推理阶段，估计信道矩阵经训练好的网络处理产生候选坐标，再通过上述目标去除策略精化，得到最终检测的散射坐标；随后由这些坐标恢复真实散射参数，以支撑后续定位。

**算法 1　基于锚框的散射参数检测**

*训练：*

1. **初始化：** 准备训练数据集与参数。
2. **for** epoch $=1$ **to** $N_{\mathrm{epoch}}$ **do**
3. 　**for** batch $=1$ **to** $N_{\mathrm{batch}}$ **do**
4. 　　**前向：** 将角度—时延域信道 $\bar{\mathbf H}$ 通过基于锚框的检测网络 $f(\cdot)$，按式 (12) 获得散射坐标偏移。
5. 　　**反向传播：** 按式 (14) 计算损失 $\mathcal L$，反向传播梯度以更新网络权重。
6. 　**end for**
7. **end for**
8. **输出：** 训练好的基于锚框的检测网络 $f(\cdot)$。

*推理：*

9. **初始化：** 角度—时延域的估计信道矩阵 $\bar{\mathbf H}$。
10. **前向：** 将 $\bar{\mathbf H}$ 通过训练好的检测网络 $f(\cdot)$，按式 (12) 获得候选坐标偏移。
11. **坐标变换：** 将相对坐标偏移变换为绝对散射坐标。
12. **粗筛：** 去除 $\hat C_i<t_1$ 的候选。
13. **合并：** 按式 (15) 合并坐标邻近的候选。
14. **细筛：** 去除 $\hat C_i<t_2$ 的候选，其中 $t_2$ 设为剩余候选平均置信度的三分之一。
15. **返回：** 估计散射坐标 $\left\{\left(\hat{\bar\tau}_l,\hat{\bar\theta}_l\right)\right\}_{1\le l\le\hat N_s}$，其中 $\hat N_s$ 为剩余候选数。
16. **输出：** 按式 (11) 恢复的估计散射参数 $\left\{\left(\hat\tau_l,\hat\theta_l\right)\right\}_{1\le l\le\hat N_s}$。

### B. 阶段 2：单用户下基于 CSI 的散射定位

借助基于锚框检测方法得到的估计散射参数，可基于椭圆模型估计每个散射体的位置：

- 首先，传输时延 $\tau_l$ 表示反射路径与直达路径之间的路程差。由于直达路径长度由基站与用户设备位置决定、对给定散射体保持不变，特定传输时延 $\tau_l$ 对应一组可能的散射体位置 $\mathbf p_{s,l}\triangleq(x,y)$，它们构成以基站与用户设备为焦点的椭圆。该关系可表示为

$$
\sqrt{\left(x-p_{\mathrm{bs}}^x\right)^2+\left(y-p_{\mathrm{bs}}^y\right)^2}+\sqrt{\left(x-p_{\mathrm{ue}}^x\right)^2+\left(y-p_{\mathrm{ue}}^y\right)^2}=c\tau_l+\left\|\mathbf p_{\mathrm{bs}}-\mathbf p_{\mathrm{ue}}\right\|. \tag{16}
$$

- 其次，第 $l$ 条路径的 AoD $\theta_l$ 可进一步约束散射体的可能位置。具体而言，$\theta_l$ 表示散射体相对于基站天线阵列垂直轴的相对方向。如图 5 所示，自基站以角度 $\theta_l$ 出发的直线与椭圆交于两点，其中一点位于天线扇区之外可被剔除；剩余交点唯一确定散射体位置，可表述为

$$
\frac{y}{x}=\tan\left(\theta_l\right). \tag{17}
$$

结合式 (16) 与 (17)，第 $l$ 个散射体的位置最终可导出为

$$
x=d_0\cos\left(\theta_l\right)+p_{\mathrm{bs}}^x,\qquad
y=d_0\sin\left(\theta_l\right)+p_{\mathrm{bs}}^y, \tag{18}
$$

其中 $d_0$ 满足以下方程：

$$
\begin{aligned}
d_0&=\frac{c\tau_l\left(2d+c\tau_l\right)}{2\left(c\tau_l+d-d\cos(\beta)\right)},\\
d&=\left\|\mathbf p_{\mathrm{bs}}-\mathbf p_{\mathrm{ue}}\right\|,\\
\cos(\beta)&=\cos(\theta_l)\frac{p_{\mathrm{ue}}^x-p_{\mathrm{bs}}^x}{d}+\sin(\theta_l)\frac{p_{\mathrm{ue}}^y-p_{\mathrm{bs}}^y}{d}.
\end{aligned}\tag{19}
$$

因此，将上述推导应用于估计散射参数 $\left\{\left(\hat\tau_l,\hat\theta_l\right)\right\}_{1\le l\le\hat N_s}$，即可最终得到散射体位置。事实上，从更广阔的视角看，角度—时延域信道矩阵可视为对应真实世界散射体位置的物理二维坐标系统的一种潜在表示。前述推导建立了将信道矩阵坐标与实际散射体空间位置相联系的映射函数。这一洞察凸显了所提基于 CSI 的散射感知框架的有效性与潜力。

## IV. 网络设计与训练策略

本节详述 CSIYOLO 框架中所提基于锚框的检测网络 $f(\cdot)$ 的设计与训练策略。如前所述，必要的任务导向优化被引入，以更好地将受 YOLO 启发的架构适配到信道矩阵特性，提升散射感知任务中的定位精度。

### A. 网络架构

为实现高效特征提取，我们提出一种基于 U-Net 框架 [34] 的可扩展网络架构。U-Net 设计尤其适合精确定位任务，其跳跃连接可保留丰富的空间信息。通过将多分辨率机制 [35] 融入 U-Net，所提网络能够有效捕获多尺度散射特征。此外，引入圆周卷积与卷积分解，以在资源受限下提升定位精度并降低计算复杂度，从而形成灵活、高效的网络设计。如图 6 所示，所提架构由三个主要部分组成：骨干网络（backbone）、颈部（neck）与头部（head）。

- **骨干网络。** 骨干网络作为特征提取模块，由卷积层构成。连续的卷积增加特征通道数并扩展特征空间。为处理角度—时延域中不同尺度的信道特征，采用具有不同卷积核尺寸的多尺度卷积层 [35]，并通过拼接合并其输出。由此，信道矩阵被变换到高维特征空间，更有效地捕获并表征信道特性。此外，隐藏特征空间的深度 $h$ 可根据计算资源自适应调整，从而提供可扩展架构，灵活平衡定位精度与效率。
- **颈部。** 紧随骨干网络之后，颈部模块整合不同维度的特征，从而构建更完整的信道表示。通过采用下采样与上采样操作，多维度、多分辨率的特征被有效融合为统一特征图。这种更丰富的表示有助于识别不同尺寸的通信路径。
- **头部。** 最后，头部模块将融合后的信道特征投影到输出参数空间。具体而言，多个不同尺寸的头部附加在颈部生成的多尺度特征图上，表示具有不同数量与扫描分辨率的多尺度锚框模式，如图 6 所示。对形状为 $(3\times a\times b)$ 的输出，锚框数量为 $a\times b$；每个锚框覆盖尺寸为 $\frac{2N_t}{a}\times\frac{2N_c}{b}$ 的扫描区域，并输出包含估计散射坐标与置信度的三元向量。借助不同输出尺寸，散射体可在多个分辨率下被检测；通过合并不同尺度的输出，散射参数的估计精度得以增强。

通过上述网络设计，信道矩阵在多个尺度上被分析，从而使特征提取更加准确。

### B. 圆周卷积

为进一步提升定位精度，我们在检测网络中使用圆周卷积。与卷积层中常用的零填充不同，我们沿二维信道矩阵的角度维采用循环填充。这一选择的动机在于：角度维本质上是周期的 [36]，而零填充破坏了这种周期性，导致信息损失与定位性能退化。

如图 7 所示，采用常规零填充时，信道矩阵沿角度维的循环特性被破坏，位于边界附近的散射体容易因边缘处的突变截断而被忽略。相比之下，循环填充保持信道矩阵的周期性，使卷积过程中能够从边界区域捕获更多能量；这提高了检测边界散射体的可能性并改善其定位精度。对时延维，仍采用零填充以保持信道矩阵的尺寸。

### C. 卷积分解

此外，为在保持定位精度的同时降低网络复杂度，我们在检测网络中引入卷积分解技术 [37]。如图 8 所示，标准的二维卷积可分解为两个核方向正交的连续一维（1D）卷积。该分解在获得相当感受野的同时，显著减少参数数量与计算开销。

例如，$k\times k$ 的二维卷积可分解为一次 $1\times k$ 卷积后接一次 $k\times1$ 卷积。由此，计算复杂度从 $\mathcal O(k^2)$ 降至 $\mathcal O(2k)$，从而在保持特征图空间结构的同时降低资源需求。此外，该分解允许在两次一维卷积之间插入非线性激活函数，进一步增强网络的非线性与表达能力，最终提升定位性能。

总体而言，卷积分解在计算效率与定位精度之间提供了有利折中，使网络更适合、更灵活地部署于资源受限环境。

### D. 噪声注入训练策略

为进一步增强检测网络对信道估计误差的鲁棒性，我们提出一种噪声注入训练策略。我们不依赖估计信道进行训练——那可能引入相当大的数据准备开销——而是在训练过程中直接向信道矩阵注入高斯噪声。

该策略中，噪声水平随训练推进逐步增大。这种渐进方案既避免早期阶段破坏信道特性学习，又使网络在后期阶段适应更高噪声水平。在最大噪声水平设为 $\sigma_{\max}$ 时，每一步生成的含噪信道矩阵覆盖从 $0$ 到 $\sigma_{\max}$ 的较宽噪声强度范围，从而进一步提升网络对多样信道估计误差的鲁棒性。形式化地，注入噪声建模为

$$
\mathbf n(t)\sim\mathcal N\left(\mathbf 0,\sigma^2(t)\right), \tag{20}
$$

其中方差 $\sigma^2(t)$ 在 $[0,\sigma_{\max}^2(t)]$ 范围内从均匀分布随机抽取。这里最大噪声方差 $\sigma_{\max}^2(t)$ 被设计为随训练步 $t$ 增大：

$$
\sigma_{\max}^2(t)=\sigma_0^2+\gamma t, \tag{21}
$$

其中 $\sigma_0^2$ 为初始噪声方差，$\gamma$ 为控制噪声方差增长速率的超参数。该表述模拟了信道估计中固有的、不断增长的不确定性。通过在训练中引入这种噪声注入，网络学会处理非理想信道条件，并对估计误差更具韧性。仿真结果表明，该策略有效提升了含噪信道下的定位性能。

## V. 仿真结果与分析

本节给出仿真设置与实验结果，以验证所提框架的有效性。

### A. 实验设置

数据集生成所用参数汇总于表 I。我们考虑如图 1 所示的单小区场景，基站位于 $(0,0)$。用户设备与散射体随机分布在以 $(50\,\mathrm m,0)$ 为中心、尺寸为 $(100\,\mathrm m,100\,\mathrm m)$ 的矩形区域内。基站配备 $N_t=64$ 根天线，采用 ULA 配置；用户设备配备单天线。散射体数量随机取为 $N_s\in[5,10]$，构成基站与用户设备之间的通信路径。

**表 I　数据集生成参数**

| 参数 | 取值 |
|---|---|
| 下行中心频率 $f_0$ | 28 GHz |
| 频率间隔 $\Delta f$ | 100 MHz |
| 子载波数 $N_c$ | 1024 |
| 发射天线数 $N_t$ | 64 |
| 散射体数 $N_s$ | $[5,10]$ |
| 区域尺寸 | $100\,\mathrm m\times100\,\mathrm m$ |
| 延迟维截断后保留的行数 $N_c'$ | 64 |

此外，角度—时延域信道矩阵首先沿时延维做截断以去除接近零的元素，仅保留前 $N_c'=64$ 行供后续处理。该截断的合理性在于通信路径的传输时延本质上有限，且此类预处理已在 CSI 相关研究中被广泛采用 [36]、[38]、[39]。此外，信道的第一行对应 LoS 路径，被移除以缓解其大能量的主导影响。这些操作可有效缩小网络的关注区域并进一步降低计算复杂度。

数据集按 10,000、3,000 与 2,000 个样本随机划分为训练集、验证集与测试集。训练采用 SGD 优化器，初始学习率为 $1\times10^{-2}$，批大小设为 64，训练过程运行 100 个 epoch。损失函数 (14) 中的平衡系数 $\rho$ 设为 1。全部实验在单块 NVIDIA RTX P100 GPU 上进行。

为评估定位性能，我们定义：若散射体估计位置与真值位置之间的欧氏距离小于 1 m，则该散射体被正确定位。基于该判据，采用检测概率 $P_d$（等价于召回率 $R$）与 F1 分数 $F_1$ 作为评价指标：

$$
P_d(r)=R(r)=\frac{1}{N_s}\sum_{l=1}^{N_s}\mathbf 1\left(\left[\min_{1\le l'\le\hat N_s}\left\|\hat{\mathbf p}_{s,l'}-\mathbf p_{s,l}\right\|\right]<r\right), \tag{22}
$$

$$
P(r)=\frac{1}{\hat N_s}\sum_{l'=1}^{\hat N_s}\mathbf 1\left(\left[\min_{1\le l\le N_s}\left\|\mathbf p_{s,l}-\hat{\mathbf p}_{s,l'}\right\|\right]<r\right), \tag{23}
$$

$$
F_1(r)=2\cdot\frac{P(r)\cdot R(r)}{P(r)+R(r)}, \tag{24}
$$

其中 $r$ 为检测阈值，本实验中设为 1。检测概率 $P_d$ 等价于召回率 $R$，度量检测的准确性，取值越高表明越大比例的真实散射体被正确定位。F1 分数 $F_1$ 定义为精确率与召回率的调和平均，在漏检与虚警之间提供平衡评价；$F_1$ 越高表示总体性能越好，对应更少的漏检散射体与鬼影目标。因此，这两个指标能够反映定位性能。

此外，我们还用均方根误差（root mean square error，RMSE）评估已检测散射体的定位精度：

$$
\mathrm{RMSE}=\sqrt{\frac{1}{|\mathcal D|}\sum_{\mathbf p_{s,l}\in\mathcal D}\min_{1\le l'\le\hat N_s}\left\|\hat{\mathbf p}_{s,l'}-\mathbf p_{s,l}\right\|^2}, \tag{25}
$$

其中 $\mathcal D$ 为已检测散射体集合。该指标可进一步帮助分析定位性能。

为便于比较，我们实现两种广泛采用的基线方法：基于 MUSIC 与 DFT 的方法 [12]–[14] 以及 LTD 方法 [26]：

- **MUSIC-FFT [14]：** 如在雷达信号处理中常用，MUSIC 算法在角度域用于估计 AoD，而基于 DFT 的方法在时延域用于估计路径时延；随后将估计参数结合以导出散射体位置。
- **LTD [26]：** 低秩张量分解方法通过利用空间与时间相关性，联合挖掘角度—时延域信息；通过在二维网格上检测峰值来估计散射参数。

然而，这两种方法通常需要环境中散射体数量的先验知识才能保证可靠性能。相比之下，所提框架自适应估计每次检测的置信度并有效消除鬼影目标。此外，我们将 CSIYOLO 与现有研究中直接应用通用 YOLO 结构 [40]、[41] 的方法比较，以凸显我们所优化网络设计的有效性。

### B. 定位性能

本小节给出所提 CSIYOLO 框架的定位性能。卷积分解与圆周卷积默认启用。需要指出，所提方法的散射体数量并非事先已知，而是在检测过程中自适应估计；对 MUSIC-FFT，散射体数量假设为事先已知。

如图 9 所示，所提 CSIYOLO 方法能够取得最佳定位性能，具有最高的检测概率与 F1 分数。还可观察到：对所提方法、MUSIC-FFT 以及已知散射体数量的 LTD，其 F1 分数均接近相应的检测概率，说明估计的散射体数量总体与真值一致。考虑到所提方法的散射体数量并非事先已知，这一结果进一步凸显其优越性。

图 10 给出定位 RMSE，表明所提方法取得最低 RMSE，甚至低于 0.2 m，显著优于基线方法。基线方法的 RMSE 相近，因为它们依赖基于网格的检测，本质上受网格分辨率限制，难以取得高定位精度。相比之下，所提方法能够预测连续定位结果，克服网格分辨率限制并进一步提升定位精度。

图 11 给出定位结果示例。可以观察到，LTD 方法容易受多径干扰引起的鬼影目标混淆；相比之下，所提方法表现出更优的参数检测与散射体定位精度。

此外，图 12 与图 13 给出所提方法的收敛性能。可以看到，所提方法的目标性训练损失与定位训练损失均能通过训练稳定收敛；同时，验证性能在训练早期波动之后也呈现稳步提升。

### C. 网络设计的有效性

本小节通过消融实验验证所提基于锚框检测网络设计的有效性，包括可扩展隐藏通道结构、圆周卷积与卷积分解。首先，图 14(a) 展示所提方法在不同隐藏通道深度 $h$ 下的定位性能，图 14(b) 比较相应的模型复杂度（参数量 Param 与浮点运算量 FLOPs）。结果表明，随着隐藏通道深度减小，定位性能仅有轻微退化，且仍显著优于基线方法；同时计算复杂度大幅降低。这表明所提方法可根据设备资源约束灵活扩展隐藏通道深度，在性能与复杂度之间实现有效折中。

此外，我们评估卷积分解方法的有效性。图 15 比较所提方法在使用与不使用卷积分解时的定位 F1 分数与网络参数量。可以看到，卷积分解在保持、某些情形下甚至提升定位性能的同时，将参数量减少约 50%。这意味着借助分解引入的额外非线性，网络能够学习得更充分并取得更好的定位性能。

圆周卷积设计的有效性也得到验证。如表 II 所示，在大多数情形下，圆周卷积保持信道矩阵的周期性，并在定位性能上一致优于常规零填充卷积。

**表 II　随机散射体数量下使用与不使用圆周卷积的定位性能**

| 宽度 | 卷积方式 | F1 分数 | 检测概率 | RMSE（m） |
|---|---|---|---|---|
| 2 | 零填充 | 0.8839 | 0.8681 | 0.3518 |
| 2 | 圆周卷积 | 0.9307 | 0.9164 | 0.3056 |
| 3 | 零填充 | 0.9322 | 0.9175 | 0.2371 |
| 3 | 圆周卷积 | 0.9496 | 0.9362 | 0.2317 |
| 5 | 零填充 | 0.9642 | 0.8681 | 0.1941 |
| 5 | 圆周卷积 | 0.9693 | 0.9595 | 0.1949 |
| 7 | 零填充 | 0.9615 | 0.9591 | 0.1685 |
| 7 | 圆周卷积 | 0.9770 | 0.9682 | 0.1579 |

> **原文疑点：** 表 II 中宽度为 5 的“零填充”行检测概率为 0.8681，与其相邻取值（约 0.96）差异明显，疑为原文排版或录入问题；此处按 PDF 原文照录，未作修改。

为直接验证所提网络优化的有效性，我们将本模型与广泛采用的目标检测框架通用 YOLOv5 结构 [33] 比较。如表 III 所示，所提方法取得显著提升的定位性能，同时以低两个数量级以上的参数量降低计算复杂度，证明了所优化设计的高效性与有效性。

**表 III　与 YOLOv5 的定位性能比较**

| 指标 | YOLOv5s [33] | CSIYOLO，$h=5$ | CSIYOLO，$h=2$ |
|---|---|---|---|
| FLOPs | 79.815M | 17.930M | 3.390M |
| Param | 7.028M | 23.069K | 3.977K |
| F1 分数 | 0.8044 | 0.9693 | 0.9307 |
| $P_d$（检测概率） | 0.8504 | 0.9595 | 0.9164 |
| RMSE（m） | 0.3259 | 0.1949 | 0.3056 |

### D. 信道估计鲁棒性

最后，我们通过评估不同噪声功率水平下的定位性能，考察所提噪声注入训练策略的有效性，如图 16 所示。结果表明，随着噪声功率增大，所有方法的定位性能均退化。未使用噪声注入训练时，所提方法因无法考虑估计误差而性能严重退化；相比之下，采用噪声注入策略后，所提方法在不同噪声水平下均取得显著提升且稳定的定位性能，证明其在实际场景中的鲁棒性。此外，所提线性噪声注入方案相比注入恒定噪声取得更好的性能，验证了所提训练策略的鲁棒性。

## VI. 结论

本文聚焦 ISAC 系统中的散射感知任务，提出新颖的 CSIYOLO 框架，从通信信道中定位环境散射体。通过将散射体定位表述为目标检测问题，我们发展了基于锚框的检测方法与带特定优化的可扩展网络结构（包括圆周卷积与卷积分解），以同时提升精度与计算效率；进一步引入噪声注入训练策略以增强对信道估计误差的鲁棒性。仿真结果表明，CSIYOLO 显著优于基线方法，同时能够自适应估计散射体数量并抑制鬼影目标，便于实际部署。未来工作将把 CSIYOLO 扩展到多用户场景并引入信息融合，以进一步提升定位性能。

## 致谢与资助说明

本工作部分受北京市自然科学基金（项目号 L242083）与国家自然科学基金（项目号 62401315）资助。通讯作者：Jingbo Tan、Jintao Wang。论文开源代码见 https://github.com/zhang-xd18/csiyolo 。

## 图注与表注

**图 1：** ISAC 系统示意。$N_s$ 个散射体随机分布在基站与用户设备之间的通信信道中，同时存在 LoS 与 NLoS 路径；用户设备位置可由 GPS 获得。

**图 2：** CSIYOLO 框架的主要结构。框架包含两个主要阶段：首先，估计 CSI 经基于锚框的散射参数检测方法处理以提取散射参数；其次，利用散射参数基于椭圆模型定位散射体；该模块以“可插拔（pluggable）”方式接入“波形调制—信道估计—信号解调”的通信流程。

**图 3：** 将信道参数提取作为目标检测任务的示意。（a）散射参数提取：频率—天线域的原始信道经二维（逆）DFT 变换到角度—时延域，从而可由目标坐标 $(\bar\tau,\bar\theta)$ 提取散射参数；（b）CV 领域的目标检测：原始含噪图像先经预处理（缩放与去噪），随后检测图中目标及其位置 $(x,y)$ 与形状 $(h,w)$。

**图 4：** 基于锚框的散射参数检测方法示意。虚线框表示各锚框的扫描区域；红框与蓝框分别表示正锚框与负锚框。

**图 5：** 散射定位方法所用椭圆模型的示意。

**图 6：** 可扩展网络结构与多尺度锚框检测合并的示意。图中标注：二维卷积层（卷积核尺寸、输入/输出通道数，可选步长），其后接二维批归一化与激活函数；整体分为骨干网络（backbone）、颈部（neck）与头部（head），并包含多尺度锚框合并、自适应鬼影目标去除与坐标变换。

**图 7：** 不同填充策略的示意。红色虚线框标出填充区域；相比零填充，循环填充更好地保留边界信息。（a）零填充；（b）循环填充。

**图 8：** 卷积分解的示意。

**图 9：** 不同散射体数量下的定位性能（F1 分数与检测概率）。所提方法的隐藏通道深度 $h$ 设为 5；对比曲线包括所提方法、LTD（已知/未知散射体数量）与 MUSIC-FFT。

**图 10：** 不同散射体数量下的定位 RMSE 性能。所提方法的 $h$ 设为 5；对比曲线包括所提方法、LTD（已知/未知散射体数量）与 MUSIC-FFT。

**图 11：** 不同方法的定位示例。（a）角度—时延域信道上的散射参数检测性能；（b）二维坐标空间中的散射体定位性能；图中给出 BS、UE 与各散射体位置。

**图 12：** 所提方法随训练的收敛性能（总损失、目标性损失与定位损失）。

**图 13：** 所提方法随训练的验证性能（F1 分数、检测概率与 RMSE）。

**图 14：** 不同隐藏通道深度下所提方法的性能与复杂度比较。（a）不同隐藏通道深度的性能比较；（b）不同隐藏通道深度的复杂度比较（Param 与 FLOPs）。

**图 15：** 随机散射体数量下定位 F1 分数与复杂度的比较。“CF”表示卷积分解；曲线包括使用/不使用 CF 的 F1 分数与参数量，以及 LTD（已知）与 MUSIC-FFT 的 F1 分数。

**图 16：** 随机散射体数量下不同方法对信道估计误差的鲁棒性（F1 分数随 SNR 变化）。所提方法的 $h$ 设为 5；对比包括所提方法（噪声注入、恒定噪声、无操作）、LTD（已知）与 MUSIC-FFT。

**表 I：** 数据集生成参数（中心频率 28 GHz、频率间隔 100 MHz、子载波数 1024、发射天线数 64、散射体数 $[5,10]$、区域尺寸 $100\,\mathrm m\times100\,\mathrm m$、延迟维截断后保留行数 64）。

**表 II：** 随机散射体数量下使用与不使用圆周卷积的定位性能（按宽度 2/3/5/7 与零填充/圆周卷积分组，报告 F1 分数、检测概率与 RMSE）。

**表 III：** 与 YOLOv5 的定位性能比较（FLOPs、参数量、F1 分数、检测概率与 RMSE；对比 YOLOv5s 与 CSIYOLO（$h=5$ 与 $h=2$））。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 13 页转录；未逐条核对 DOI）。

[1] Z. Wei et al., “Integrated sensing and communication signals toward 5G-A and 6G: A survey,” IEEE Internet Things J., vol. 10, no. 13, pp. 11068–11092, Jul. 2023.

[2] F. Zhang, T. Mao, R. Liu, Z. Han, S. Chen, and Z. Wang, “Cross-domain dual-functional OFDM waveform design for accurate sensing/positioning,” IEEE J. Sel. Areas Commun., vol. 42, no. 9, pp. 2259–2274, Sep. 2024.

[3] F. Zhang, T. Mao, and Z. Wang, “Doppler-resilient design of CAZAC sequences for mmWave/THz sensing applications,” IEEE Trans. Veh. Technol., vol. 73, no. 2, pp. 2878–2883, Feb. 2024.

[4] Y. Jiang et al., “Integrated sensing and communication for low altitude economy: Opportunities and challenges,” IEEE Commun. Mag., pp. 1–7, early access, 2025.

[5] F. Roos, J. Bechter, C. Knill, B. Schweizer, and C. Waldschmidt, “Radar sensors for autonomous driving: Modulation schemes and interference mitigation,” IEEE Microw. Mag., vol. 20, no. 9, pp. 58–72, Sep. 2019.

[6] Y. Cui, F. Liu, X. Jing, and J. Mu, “Integrating sensing and communications for ubiquitous IoT: Applications, trends, and challenges,” IEEE Network, vol. 35, no. 5, pp. 158–167, Sep./Oct. 2021.

[7] Y. Feng, C. Zhao, F. Gao, Y. Zhang, and S. Ma, “Environment sensing-aided beam prediction with transfer learning for smart factory,” IEEE Trans. Wireless Commun., vol. 24, no. 1, pp. 676–690, Jan. 2025.

[8] G. Charan and A. Alkhateeb, “Computer vision aided blockage prediction in real-world millimeter wave deployments,” in Proc. IEEE Globecom Workshops (GC Wkshps), Rio de Janeiro, Brazil, Dec. 4–8, 2022, pp. 1711–1716.

[9] X. Zhang, Z. Lu, and J. Wang, “Sensing-aided CSI feedback with deep learning for massive MIMO systems,” in Proc. IEEE Int. Conf. Commun. (ICC), Denver, CO, USA, Jun. 9–13, 2024, pp. 2282–2287.

[10] A. Santra, A. R. Ganis, J. Mietzner, and V. Ziegler, “Ambiguity function and imaging performance of coded FMCW waveforms with fast 4D receiver processing in MIMO radar,” Digit. Signal Process., vol. 97, p. 102618, Feb. 2020.

[11] Z. Wei, H. Qu, W. Jiang, K. Han, H. Wu, and Z. Feng, “Iterative signal processing for integrated sensing and communication systems,” IEEE Trans. Green Commun. Netw., vol. 7, no. 1, pp. 401–412, Mar. 2023.

[12] S. Kim and K.-K. Lee, “Low-complexity joint extrapolation-MUSIC-based 2-D parameter estimator for vital FMCW radar,” IEEE Sensors J., vol. 19, no. 6, pp. 2205–2216, Mar. 2019.

[13] X. Chen et al., “Multiple signal classification based joint communication and sensing system,” IEEE Trans. Wireless Commun., vol. 22, no. 10, pp. 6504–6517, Oct. 2023.

[14] B. Lu et al., “Deep-learning-based multinode ISAC 4D environmental reconstruction with uplink-downlink cooperation,” IEEE Internet Things J., vol. 11, no. 24, pp. 39512–39526, Dec. 2024.

[15] Y. Niu, Z. Wei, L. Wang, H. Wu, and Z. Feng, “Interference management for integrated sensing and communication systems: A survey,” IEEE Internet Things J., vol. 12, no. 7, pp. 8110–8134, Apr. 2025.

[16] C. Meng, Z. Wei, and Z. Feng, “Adaptive waveform optimization for MIMO integrated sensing and communication systems based on mutual information,” in Proc. 14th Int. Conf. Wireless Commun. Signal Process. (WCSP), Nanjing, China, Nov. 1–3, 2022, pp. 472–477.

[17] X. Guo, Q. Shi, L. Liu, and S. Zhang, “User-assisted networked sensing in OFDM cellular network with erroneous anchor position information,” in Proc. IEEE Int. Conf. Acoustics, Speech, Signal Process. (ICASSP), Seoul, South Korea, Apr. 14–19, 2024, pp. 8556–8560.

[18] Q. Shi, L. Liu, S. Zhang, and S. Cui, “Device-free sensing in OFDM cellular network,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1838–1853, Jun. 2022.

[19] Q. Shi, L. Liu, and S. Zhang, “Joint data association, NLOS mitigation, and clutter suppression for networked device-free sensing in 6G cellular network,” in Proc. IEEE Int. Conf. Acoustics, Speech, Signal Process. (ICASSP), Rhodes Island, Greece, Jun. 4–10, 2023, pp. 1–5.

[20] Q. Wang, L. Liu, S. Zhang, and F. C. Lau, “Trilateration-based device-free sensing: Two base stations and one passive IRS are sufficient,” in Proc. IEEE Globecom (GC), Rio de Janeiro, Brazil, Dec. 4–8, 2022, pp. 5613–5618.

[21] W. Xu, Y. Xiao, A. Liu, M. Lei, and M.-J. Zhao, “Joint scattering environment sensing and channel estimation based on non-stationary Markov random field,” IEEE Trans. Wireless Commun., vol. 23, no. 5, pp. 3903–3917, May 2024.

[22] Z. Huang, K. Wang, A. Liu, Y. Cai, R. Du, and T. X. Han, “Joint pilot optimization, target detection and channel estimation for integrated sensing and communication systems,” IEEE Trans. Wireless Commun., vol. 21, no. 12, pp. 10351–10365, Dec. 2022.

[23] C. Baquero Barneto et al., “Millimeter-wave mobile sensing and environment mapping: Models, algorithms and validation,” IEEE Trans. Veh. Technol., vol. 71, no. 4, pp. 3900–3916, Apr. 2022.

[24] Y. Jiang, F. Gao, and S. Jin, “Electromagnetic property sensing: A new paradigm of integrated sensing and communication,” IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13471–13483, Oct. 2024.

[25] S. Kadambi et al., “Neural RF SLAM for unsupervised positioning and mapping with channel state information,” in Proc. IEEE Int. Conf. Commun. (ICC), Seoul, South Korea, May 16–20, 2022, pp. 3238–3244.

[26] Z. Mou and F. Gao, “Millimeter wave wireless communication assisted three-dimensional simultaneous localization and mapping,” arXiv preprint, arXiv:2303.02617, 2023.

[27] J. Song et al., “3D environment reconstruction based on ISAC channels,” in Proc. Int. Conf. Ubiquitous Commun. (Ucom), Xi’an, China, Jul. 5–7, 2024, pp. 487–491.

[28] V. H. Tran and W. Wang, “Bayesian inference for PCA and MUSIC algorithms with unknown number of sources,” arXiv preprint, arXiv:1809.10168, 2018.

[29] J. Redmon, S. Divvala, R. Girshick, and A. Farhadi, “You only look once: Unified, real-time object detection,” in Proc. IEEE Conf. Comput. Vision Pattern Recognit. (CVPR), Las Vegas, NV, USA, Jun. 26–Jul. 1, 2016, pp. 779–788.

[30] A. Saleh and R. Valenzuela, “A statistical model for indoor multipath propagation,” IEEE J. Sel. Areas Commun., vol. 5, no. 2, pp. 128–137, Feb. 1987.

[31] R. Girshick, “Fast R-CNN,” in Proc. IEEE Int. Conf. Computer Vision (ICCV), Santiago, Chile, Dec. 7–13, 2015, pp. 1440–1448.

[32] J. Redmon and A. Farhadi, “Yolov3: An incremental improvement,” arXiv preprint, arXiv:1804.02767, 2018.

[33] Ultralytics, “Ultralytics YOLOv5.” https://github.com/ultralytics/yolov5, 2025. Accessed: 22-08-2025.

[34] O. Ronneberger, P. Fischer, and T. Brox, “U-Net: Convolutional networks for biomedical image segmentation,” arXiv preprint, arXiv:1505.04597, 2015.

[35] Z. Lu, J. Wang, and J. Song, “Multi-resolution CSI feedback with deep learning in massive MIMO system,” in Proc. IEEE Int. Conf. Commun. (ICC), Dublin, Ireland, Jun. 7–11, 2020, pp. 1–6.

[36] Z. Liu, L. Wang, L. Xu, and Z. Ding, “Deep learning for efficient CSI feedback in massive MIMO: Adapting to new environments and small datasets,” IEEE Trans. Wireless Commun., vol. 23, no. 9, pp. 12297–12312, Sep. 2024.

[37] C. Szegedy, V. Vanhoucke, S. Ioffe, J. Shlens, and Z. Wojna, “Rethinking the inception architecture for computer vision,” arXiv preprint, arXiv:1512.00567, 2015.

[38] C.-K. Wen, W.-T. Shih, and S. Jin, “Deep learning for massive MIMO CSI feedback,” IEEE Wireless Commun. Lett., vol. 7, pp. 748–751, Mar. 2018.

[39] X. Zhang, J. Wang, Z. Lu, and H. Zhang, “Continuous online learning-based CSI feedback in massive MIMO systems,” IEEE Commun. Lett., vol. 28, no. 3, pp. 557–561, Mar. 2024.

[40] M. Li, Y. Han, X. Li, C.-K. Wen, and S. Jin, “Deep learning based fast downlink channel reconstruction for FDD massive MIMO systems,” in Proc. IEEE Wireless Commun. Network. Conf. (WCNC), May 25–28, 2020, pp. 1–6.

[41] Y. Han, M. Li, S. Jin, C.-K. Wen, and X. Ma, “Deep learning-based FDD non-stationary massive MIMO downlink channel reconstruction,” IEEE J. Sel. Areas Commun., vol. 38, no. 9, pp. 1980–1993, Sep. 2020.

**本页范围与校对状态：** 本页为 arXiv:2509.19335v1 的全文中文译稿，覆盖摘要、正文第 I–VI 节、结论、致谢与资助说明、图 1–16 图注、表 I–III 逐格、算法 1（训练与推理两阶段逐行）、参考文献 [1]–[41] 英文原条目。公式编号沿用原文（1）–（25）。表 II、表 III 的数值已用 PDF 第 12 页渲染图逐格核对；表 I 已用 PDF 第 10 页渲染图核对。原文抽取文本中图 9/10/16 图注的“his set to 5”按上下文应为“$h$ is set to 5”，译文按此理解并已在图注中写明 $h=5$。表 II 中宽度 5 的零填充行检测概率（0.8681）与相邻取值差异较大，已在表下加注为原文疑点并照录。**逐句逐式对照原 PDF 的终校未做**；图内曲线未做数字化估算；如发现公式排版或个别数值与 PDF 不一致，以原文 PDF 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
