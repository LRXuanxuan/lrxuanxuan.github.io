---
layout: page
title: "太赫兹单站感知的环境感知信道测量与建模｜中文全文译文"
permalink: /papers/translations/2026-10-08-2509-02088-environment-aware-channel-measurement-and-modeling-for-terahertz-monos/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1b6e3b6fd6c0db06/) · [原文 arXiv](https://arxiv.org/abs/2509.02088) · [全部目录](/papers/catalog/)

# 太赫兹单站感知的环境感知信道测量与建模

**原题：** Environment-Aware Channel Measurement and Modeling for Terahertz Monostatic Sensing  
**作者：** Yejian Lyu、Zhiqiang Yuan、Henk Wymeersch（Fellow, IEEE）、Chong Han（Senior Member, IEEE）  
**单位：** Y. Lyu 与 C. Han 为上海交通大学太赫兹无线通信实验室（上海 200240，中国）；Z. Yuan 与 H. Wymeersch 为瑞典哥德堡查尔姆斯理工大学通信系统组。  
**版本：** arXiv:2509.02088v1（eess.SP），2025-09-02，原文 13 页（含 14 幅图、3 张表）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、表 I—III（逐格）、图 1—14 图注与正文数值、参考文献 [1]—[41] 英文原条目均按原文结构录入；逐句逐式终校未做。

## 摘要

太赫兹（THz）频段的通感一体化（ISAC）在统一超高速无线连接与细粒度环境感知方面具有重大前景，而真实、可解释的信道建模对于充分实现此类系统的潜力至关重要。本文基于在三种代表性室内场景、57 个收发共址（co-located transceiver，TRx）位置上开展的大规模测量活动，对 300 GHz 单站感知信道进行了全面研究。文中利用高分辨率空间交替广义期望最大化（space-alternating generalized expectation-maximization，SAGE）算法提取多径分量（MPC）的幅度、时延与角度等参数。为对提取的 MPC 进行分簇，采用一种基于图像处理的聚类方法——连通分量标记（connected component labeling，CCL），依据时延—角度一致性对 MPC 分组。基于测量数据，本文提出一种环境感知信道建模框架，在物理场景属性（如反射体几何、表面材料与粗糙度）与其对应的信道域表现之间建立映射。该框架同时包含镜面反射与漫射反射，并利用反射损耗、Lambertian 散射、簇内色散模型等若干信道参数来刻画反射行为。实验结果表明，所提方法能够从观测到的信道特性中可靠地提取物理特征（如结构与材料信息），为先进的 THz ISAC 信道建模提供了有前景的基础。

**索引词**：太赫兹；单站感知；环境感知信道建模。

## I. 引言

通感一体化（ISAC）是第六代（6G）及未来无线系统的关键使能技术，使网络能够感知并解读其物理环境 [1]–[5]。太赫兹（THz）技术的进步把 ISAC 能力扩展到高分辨率任务，例如人体活动识别、汽车雷达与室内测绘 [6]–[8]。THz 频段覆盖 100 GHz 至 10 THz，提供超宽带宽与亚毫米波长。这些特性连同大规模天线阵列或高定向天线，可实现精细的时延与角度分辨率 [9]–[11]。与微波和自由空间光系统相比，THz 信号在空间精度与传播鲁棒性之间取得有利折中，因而非常适合复杂室内场景中基于无线电的环境感知。值得注意的是，THz 由于与物质独特的相互作用——表现出强烈的频率相关吸收与反射，从而揭示材料特定的频谱指纹——能够识别其他频段无法获得的材料属性。

准确、可靠的信道建模是设计与评估新兴无线通信系统（尤其是集成感知功能的系统）的关键基础 [12]、[13]。无线感知场景通常按发射机（Tx）与接收机（Rx）的布置分为两类主要构型：单站（monostatic，Tx 与 Rx 共址）与双站（bistatic，二者处于不同空间位置）[14]。与常规双站通信信道因 Tx-Rx 链路分离而呈现复杂多径传播不同，单站感知信道主要涉及环境物体产生的直接反射，包括镜面反射与漫射反射 [15]。由于这些本质差异，详细刻画单站感知信道特征变得至关重要。

尽管对 THz 感知的兴趣日益增长，现有涉及 THz 频段单站与双站信道测量的文献仍然有限。例如，已有研究考察了 140 GHz 的联合双站与单站信道，建立了描述室内外传播的混合确定性—随机模型 [16]。在 190 GHz，工业场景中开展了双站感知测量，证明了高分辨率检测环境散射体的可行性 [9]。此外，306—321 GHz 的室内单站信道测量评估了空房间与走廊等多种环境下的测距精度与后向散射特性 [17]。近期工作在 235—320 GHz 利用无线电同时定位与建图（SLAM）框架对室内环境进行建图并跟踪单站收发机（TRx）位置 [18]。在我们此前的工作 [19] 中，在 290—310 GHz 的室内实验室环境开展了单站感知信道测量，提出一种混合建模方法：利用漫射分量进行环境重建、利用镜面反射进行初步材料识别。在此基础上，[20] 使用同一测量数据集进一步实现并评估了环境重建。然而，[19]、[20] 中材料识别的范围有限，仅能区分水泥与金属表面，未涉及更广泛的常见室内材料。

表 I 汇总了 THz 感知信道建模的最先进工作。

**表 I　最先进 THz 感知信道测量与建模汇总**（按原表逐格转录）

| 文献 | 频率 | 感知模式 | 场景 | 分析内容 |
| --- | --- | --- | --- | --- |
| [16] | 130—143 GHz | 单站与双站 | 室内与室外 | 基于散射体的混合 ISAC 模型 |
| [9] | 190 GHz | 双站 | 工厂 | 基于功率—角度谱的散射体检测 |
| [17] | 306—321 GHz | 单站 | 空房间与走廊 | 测距精度与后向散射系数 |
| [18] | 235—320 GHz | 单站 | 实验室 | 基于 SLAM 的建图与跟踪 |
| [19] | 290—310 GHz | 单站 | 实验室 | THz 混合感知信道模型 |
| [20] | 290—310 GHz | 单站 | 实验室 | 厘米级环境重建 |
| 本文 | 290—310 GHz | 单站 | 三种不同室内场景 | 面向 THz 感知信道的基于簇的环境感知信道模型 |

尽管上述工作取得了可观进展，当前文献仍有若干关键方面未得到充分处理。第一，尽管 THz 双站信道研究进展显著，THz 单站感知信道的研究在现有文献中仍相对稀少。第二，诸如簇内时延与角度扩展、功率与反射损耗分布等基于簇的信道特性的细致识别与分析，在 THz 感知信道背景下仍研究不足，限制了现有信道模型的准确性。第三，尽管已有若干研究利用 THz 频率考察材料特性 [20]–[24]，但现有研究很少在物理环境特征（如物体几何、表面粗糙度、材料组成）与 THz 频段对应的信道特性之间建立明确联系。为填补上述空白，本文研究 300 GHz 单站感知信道，明确聚焦三种典型室内场景中的材料特定特性。通过大规模测量活动与新颖的环境感知建模框架，我们弥合了物理材料特性与其信道域表示之间的差距，提供了专门面向 THz 单站感知的独特见解与模型。本文的主要贡献总结如下：

- **综合的 THz 单站感知测量数据集**：在 300 GHz 频段提出了一个综合的单站感知测量数据集，覆盖三种在结构与材料上各异的室内环境、57 个共址 TRx 位置。与以往局限于简化或均质场景的数据集不同，所提数据集包含丰富的空间、几何与材料特征，涵盖金属、介质与复合表面。这种多样性使真实单站感知构型的高保真建模与仿真成为可能。该数据集为信道建模、材料感知、定位与 ISAC 等领域的研究推进提供了宝贵基础，支撑未来 THz 应用新算法的开发与评估。
- **MPC 簇级统计表征**：本文在 300 GHz 单站感知信道分析上更进一步，给出多径分量（MPC）簇级的细致统计刻画，超越 [19] 中逐 TRx 位置的度量（例如单个 TRx 位置的时延与角度扩展）。利用高分辨率参数估计算法（SAGE）提取 MPC 并分组，用以分析簇级时延与角度特性。基于这一更丰富的数据集，我们提出面向室内单站感知的统计信道模型，不仅刻画全局信道参数，也刻画簇内特性。该建模方法可对感知性能作更真实的评估，这对 ISAC 系统功能（如目标检测、定位与环境重建）至关重要。
- **环境感知建模框架**：在基于统计簇的信道表征基础上，我们为单站感知建立了环境感知信道建模框架，把环境的物理特性（材料类型、表面粗糙度、物体几何与场景复杂度）与相应的传播特征显式关联起来。

本文其余部分组织如下：第 II 节概述基于单站感知的测量设置与场景；第 III 节描述数据处理与基于图像处理的簇识别方法；第 IV 节给出 THz 单站感知的室内信道表征；第 V 节提出材料相关的建模框架；第 VI 节给出结论。

## II. 测量活动

本节详细介绍 THz 单站信道测量活动。首先描述测量系统设置，包括系统配置、天线规格与校准流程；随后介绍活动中使用的三种代表性室内场景，说明其空间尺寸、布局结构与主要材料组成。

### A. 探测仪与测量设置

本文采用基于矢量网络分析仪（VNA）的信道探测仪 [25]、[26]（工作频段 290—310 GHz）开展单站感知信道测量。系统提供 20 GHz 的超宽带宽，对应时延域约 1.5 cm 的精细时延分辨率。共采样 2001 个频点，支持 30 m 的最大可检测距离。为保证高动态范围与测量精度，中频（IF）带宽配置为 1 kHz。

如图 1 所示，共址的 Tx 与 Rx 安装在精密控制的转台上，以模拟单站感知条件。两端使用相同的高增益喇叭天线，增益 25.5 dBi，半功率波束宽度（HPBW）较窄，为 8°，从而实现高角度分辨率。采用方向扫描探测（directional scanning sounding，DSS）方案以捕获丰富的方位角特性：天线旋转覆盖 $[0^\circ,359^\circ]$，步进细至 $1^\circ$，实现密集角度采样。天线相位中心距旋转轴 0.2 m，以避免机械遮挡并保持空间一致性。Tx 与 Rx 分别置于 2.0 m 与 2.1 m 高度。测量前使用背靠背（back-to-back）设置进行完整系统校准，以消除系统响应并确保准确的信道估计。关键测量参数汇总于表 II。

**表 II　三种场景的单站感知信道测量配置**（按原表逐格转录）

| 参数 | 取值 |
| --- | --- |
| 频率范围 | 290—310 GHz |
| 频率带宽 | 20 GHz |
| 频点数 | 2001 |
| 最大可检测距离 | 30 m |
| 中频带宽 | 1 kHz |
| Tx 与 Rx 天线类型 | 喇叭天线 |
| 天线增益 | 25.5 dBi |
| 方位角 HPBW | $8^\circ$ |
| 旋转步进 | $1^\circ$ |
| 方位角旋转范围 | $[0^\circ:359^\circ]$ |
| Tx 天线高度 | 2.0 m |
| Rx 天线高度 | 2.1 m |

### B. 测量场景

本文在三种代表性室内场景中开展综合单站信道测量，以刻画与 THz ISAC 系统相关的多样传播条件。场景 1 为带 L 形测量轨迹的室内实验室环境，如图 1(a)(b) 所示；该路径上共布置 28 个 TRx 位置，间距统一为 0.5 m。如图 1(b) 所标注，场景 1 的主要反射物体包括一面平整水泥墙与两扇金属框窗户；该场景的详细描述可参见我们此前的工作 [19]。

场景 2 为宽度 1.9 m 的狭窄走廊。走廊一侧由大块玻璃面板构成、由多根细金属柱支撑，另一侧为聚合物墙。如图 1(c)(d) 所示，沿走廊以 1 m 间隔布置 8 个 TRx 位置，且距聚合物墙的固定距离为 1.2 m，以捕获在近平行墙面排列下波与聚合物、透明玻璃及金属材料的相互作用。

场景 3 为布局更复杂的 L 形走廊。该场景混合了多种表面类型，包括水泥墙、瓷砖饰面、消防栓箱与金属门，呈现多样的反射特性，如图 1(e)(f) 所示。此场景中，21 个 TRx 位置沿“T”形测量路径布置，相邻点间距统一为 1 m，从而为几何感知分析提供高空间分辨率。为保证在一致几何条件下对材料相关信道参数进行公平比较，三种场景中 TRx 到平整墙面的距离都刻意固定为 1.2 m。需要说明：这一受控设置通过消除距离与几何引起的差异来隔离墙面材料的影响，并不意味着所提模型受限于固定距离构型。

这些场景涵盖广泛的材料类型（金属、聚合物、水泥、瓷砖与玻璃），并包含代表性的室内反射体几何（平墙、凹角与凸角）。全部场景共在 57 个共址 TRx 位置开展信道测量；每个位置进行 360 次角度测量，因此在三种室内环境中总共获得 $57\times360=20520$ 条信道频率响应（CFR）。这些环境具备多样的表面材料、结构几何与空间布局，为 THz 单站信道分析提供了数据集。

## III. 数据处理与分析

本节概述测量数据的信号处理流程。首先介绍单站感知情形的信号模型；基于该模型，通过基于 SAGE 的参数估计算法提取关键 MPC 参数；随后采用基于图像的方法检测并对 MPC 簇分组。

### A. 信号模型

第 $m$ 个位置处、旋转角为 $\theta$ 的方向性 CFR 可表示为

$$
H_m(f,\theta)=\sum_{\ell=1}^{L_m}\alpha_\ell\exp(-j2\pi f\tau_\ell)\cdot a_{\mathrm{TRx},\varphi_\ell}(f,\theta),\tag{1}
$$

其中 $\alpha_\ell$、$\tau_\ell$、$\varphi_\ell$ 与 $f$ 分别表示第 $\ell$ 条路径的复幅度（同时包含功率衰减与初始传播相位）、时延、方位角与载频。注意本文假设第 $\ell$ 条路径的离开方位角与到达方位角均等于 $\varphi_\ell$；$L_m$ 表示 MPC 总数。$a_{\mathrm{TRx},\varphi_\ell}(f,\theta)$ 为旋转流形系数，包含 DSS 引起的相位差与第 $\ell$ 条路径的天线方向图，可写为

$$
a_{\mathrm{TRx},\varphi_\ell}(f,\theta)=\left[\exp\left(j2\pi f\frac{r\cos(\theta)}{c}\right)\right]^2\cdot G_{\mathrm{TRx}}(f,\varphi_\ell-\theta),\tag{2}
$$

其中 $r$ 与 $c$ 分别表示天线相位中心到旋转中心的方位向距离与光速；$G_{\mathrm{TRx}}(f,\varphi_\ell-\theta)$ 为模拟单站传感器的复辐射方向图。本文采用 [19] 中轨迹跟踪辅助的 SAGE 算法去嵌入天线方向图，并从测量数据中提取 MPC 参数（幅度、时延与角度）。第 $m$ 个位置提取的参数集 $\widehat{\boldsymbol\Theta}^{(m)}$ 可表示为

$$
\widehat{\boldsymbol\Theta}^{(m)}=\begin{bmatrix}\hat\alpha_1^{(m)}&\cdots&\hat\alpha_\ell^{(m)}&\cdots&\hat\alpha_{L_m}^{(m)}\\ \hat\tau_1^{(m)}&\cdots&\hat\tau_\ell^{(m)}&\cdots&\hat\tau_{L_m}^{(m)}\\ \hat\varphi_1^{(m)}&\cdots&\hat\varphi_\ell^{(m)}&\cdots&\hat\varphi_{L_m}^{(m)}\end{bmatrix},\tag{3}
$$

其中 $\hat\alpha_\ell^{(m)}$、$\hat\tau_\ell^{(m)}$、$\hat\varphi_\ell^{(m)}$ 分别为提取的第 $\ell$ 个 MPC 的幅度、时延与方位角。

### B. 基于图像处理的簇识别

用 SAGE 从测量数据中提取 MPC 参数后，采用基于图像处理的方法在每个 TRx 位置的实测功率—角度—时延谱（power-angle-delay profile，PADP）中识别 MPC 簇。第 $m$ 个位置的实测 CFR $H_m(f,\theta)$ 首先经逆离散傅里叶变换（IDFT）转换为信道冲激响应（CIR）$h_m(\tau,\theta)$，随后可得 PADP：

$$
\mathrm{PADP}(\tau,\theta)=20\cdot\log_{10}\left(|h(\tau,\theta)|\right).\tag{4}
$$

信号区域 $S(\tau,\theta)$ 首先基于 PADP 构造为

$$
S(\tau,\theta)=\begin{cases}1,&\mathrm{PADP}(\tau,\theta)>T\\0,&\text{否则}\end{cases}\tag{5}
$$

其中 $T$ 表示信号阈值。本文取 $T$ 为高于噪声底 10 dB [19]。

为增强检测到的信号区域的连通性并抑制小尺度噪声，对二值信号图施加形态学闭运算（morphological closing，这是图像处理领域广泛使用的操作 [27]、[28]），得到细化区域 $S_{\mathrm{closed}}(\tau,\theta)$：

$$
S_{\mathrm{closed}}(\tau,\theta)=(S(\tau,\theta)\oplus K)\ominus K,\tag{6}
$$

其中 $\oplus$ 与 $\ominus$ 分别表示膨胀（dilation）与腐蚀（erosion）操作，$K\subseteq\mathbb Z^2$ 为预定义结构元；$\mathbb Z^2$ 指所有具有整数坐标的二维网格点。

设 $A\subseteq\mathbb Z^2$ 表示时延—角度域中检测到的信号区域。膨胀操作 $\oplus$ 扩展 $A$ 的边界，可表示为

$$
A\oplus K=\{z\in\mathbb Z^2\mid(K^\ast+z)\cap A\neq\varnothing\},\tag{7}
$$

其中 $z$ 为候选网格位置，$K^\ast=\{-k\mid k\in K\}$ 表示 $K$ 的对称，$K^\ast+z$ 表示把 $K^\ast$ 按向量 $z$ 平移。

相反，腐蚀操作 $\ominus$ 收缩 $A$ 的边界，去除小的孤立成分并平滑边缘，可定义为

$$
A\ominus K=\{z\in\mathbb Z^2\mid(K+z)\subseteq A\}.\tag{8}
$$

随后采用连通分量标记（CCL）算法分割连续信号区域，其中每个区域被定义为共享同一标签的一组相邻前景像素 [29]。为消除伪噪声，像素数少于 $N_{\min}$ 的区域被丢弃。第 $i$ 个时延—角度簇区域 $C_i$ 定义为

$$
C_i=\{(\tau,\theta)\mid I(\tau,\theta)=i,\ S(\tau,\theta)=1\},\tag{9}
$$

其中 $I(\tau,\theta)$ 表示标记图像，把标签 $i$ 赋给点 $(\tau,\theta)$。

最后，所有有效簇区域的并集可表示为

$$
\mathcal C=\bigcup_{i}\mathcal C_i.\tag{10}
$$

图 2 给出 PADP 示例，以及用 CCL 算法识别出的相应 MPC 簇和用 [19] 中 SAGE 算法估计的 MPC。如图 2(a) 所示，场景的主要结构特征（如瓷砖墙与水泥墙）清晰可见；CCL 的应用使 MPC 簇得到有效分割，如图 2(b) 所示；此外，MPC 由实测 CFR 数据准确估计，如图 2(c) 所示。

## IV. 基于簇的信道表征

本节分析 300 GHz 频段三种室内场景的单站感知信道特性。这里的“簇”指在时延域与角度域上相对接近的一组 MPC，通常来自一个或多个邻近反射体的镜面反射与漫射反射 [30]–[32]。这些 MPC 在时延—角度域中被视为一个相干整体，共同刻画环境中局部散射区域对应的信道响应。

### A. 镜面与漫射分量的识别

在单站感知信道中，镜面反射与漫射反射是主要传播机制。反射损耗是区分 MPC 簇中镜面分量与漫射分量的参数，而簇主要由镜面反射构成。在我们的分析中，镜面分量由其相对较低的反射损耗以及与强且几何一致的传播路径对齐来识别；漫射分量则表现出更高的损耗与更宽的角度扩展。阈值依据数据集中观测到的反射损耗统计分布选取。去嵌入后第 $\ell$ 个 MPC 的反射损耗 $\mathrm{Loss}_\ell$ 可表示为

$$
\mathrm{Loss}_\ell[\mathrm{dB}]=\mathrm{FSPL}_\ell[\mathrm{dB}]-20\cdot\log_{10}|\hat\alpha_\ell|,\tag{11}
$$

其中 $\mathrm{FSPL}_\ell$（以 dB 计）为经过传播信道的自由空间路径损耗。自由空间路径损耗 $\mathrm{FSPL}_\ell$ 可计算为

$$
\mathrm{FSPL}_\ell=20\cdot\log_{10}\left(\frac{4\pi f_c d_\ell}{c}\right),\tag{12}
$$

其中 $f_c$ 表示中心频率，$d_\ell=\hat\tau_\ell^{(m)}\cdot c$ 表示第 $\ell$ 条路径的往返传播距离。

示例性的反射损耗结果如图 3 所示。如图 3(a)，每个识别出的簇通常包含一个主导镜面 MPC（反射损耗低）以及多个反射损耗更高的漫射 MPC。簇 1 与簇 2 的反射损耗概率密度函数（PDF）如图 3(b) 所示。簇 1 中镜面 MPC 的反射损耗最低，为 2.5 dB，而漫射 MPC 的反射损耗跨度很宽，为 27—69 dB。簇 2 中镜面 MPC 的反射损耗为 10.49 dB，漫射 MPC 为 20—45 dB。这些结果对底层传播机制给出了物理解释：镜面 MPC 源于强且几何对齐的反射、散射损耗极小；漫射 MPC 则由与粗糙或不规则表面的相互作用造成——这些表面把能量散射到更宽的角度范围，导致更高的反射损耗。镜面分量与漫射分量在反射损耗上的清晰分离表明，反射损耗是 THz 单站感知信道中对多径分量进行分类的可靠且可解释的度量。

### B. MPC 簇数量

MPC 簇数量是分析传播环境复杂度的重要指标。本文在三种室内场景中考察 MPC 簇数量；具体地，场景 3 中把 TRx 37—45 与 TRx 46—57 作为两种不同情形处理。MPC 簇数量的累积分布函数（CDF）如图 4 所示。可以看到，场景 1 与 TRx 37—45 的 MPC 簇数量相近；TRx 37—45 的簇数量高于场景 1 与 TRx 37—45 中的簇数量（原文此处表述自指，疑为笔误，见注）。相比之下，场景 2 在所有情形中 MPC 簇数量最多，这可归因于该场景中存在更多作为强反射体的金属结构。四种情形下簇数量的 CDF 与正态分布吻合良好，对应参数分别为 $\mathcal N(36.01,10.23)$、$\mathcal N(85,42)$、$\mathcal N(54.89,24.36)$ 与 $\mathcal N(38.25,44.93)$，如图 4 所示。

> **原文疑点：** 原文该段先称 “Scenario 1 and TRxs 37-45 exhibit a similar number of MPC clusters”，紧接着写 “TRxs 37-45 is shown to have a higher number of clusters compared to those in Scenario 1 and TRxs 37-45.”——第二句把 TRx 37—45 与自身比较，逻辑自指，疑为笔误（按上下文应为 “TRxs 46-57”）。译文照原文译出并在此加注，未擅自改数。

### C. 簇内时延与角度特性

时延域与角度域的信道特性对于刻画 MPC 簇的形状至关重要，而簇形状又反映环境中反射体的尺寸与几何。本文用四个关键簇内指标刻画簇参数：时延深度（delay depth）、角度宽度（angular width）、时延扩展与角度扩展。

本文中，时延深度定义为簇内最早到达与最晚到达 MPC 之间的总时延范围，描述簇的完整时间延展；角度宽度指簇内 MPC 到达角的最小值与最大值之差，表示其总体角度覆盖。图 5 给出时延深度、角度宽度及对应拟合模型的 CDF。就时延深度而言，四种情形的范围分别为 [0.005, 17.73] ns、[0.01, 12.53] ns、[0.005, 11.03] ns 与 [0.01, 10.74] ns，对应平均值分别为 0.89、1.00、1.16 与 1.47 ns。如图 5(a) 所示，四种情形的时延深度 CDF（在对数尺度上绘制）与正态分布密切吻合。就角度宽度而言，四种情形的取值分别覆盖 [1°, 136°]、[1°, 120°]、[1°, 104°] 与 [1°, 117°]，对应平均角度宽度分别为 8.83°、9.71°、8.28° 与 10.81°。图 5(b) 表明，四种情形下的对数角度宽度与正态分布拟合良好。

簇内时延扩展与角度扩展是分别用于刻画簇内 MPC 在时延域与角度域离散程度的关键参数。时延扩展与角度扩展刻画簇内 MPC 的统计色散；相对地，时延深度与角度宽度指簇在时延域与角度域中的绝对范围。两类指标提供互补信息：深度与宽度反映 MPC 在信道中的几何延展，而扩展刻画能量分布，这对准确的建模与 ISAC 系统设计至关重要。时延扩展与角度扩展的详细定义与公式可参见 [33]–[35]。图 6 给出时延扩展与角度扩展的 CDF 及其各自的拟合分布模型。关于簇内时延扩展，场景 2 的扩展最小，平均值为 0.17 ns；相比之下，场景 1 与 TRx 37—45 的平均扩展略大，均为 0.18 ns；TRx 46—57 在四种情形中簇内时延扩展最大，均值为 0.21 ns。四种情形对应的时延扩展范围分别为 [0, 2.94]、[0, 5.24]、[0, 1.20] 与 [0, 2.60] ns。与时延深度及角度宽度的分析类似，对簇内时延扩展的对数值拟合正态分布，经验数据与拟合模型高度一致，如图 6(a) 所示。关于簇内角度扩展，四种情形的角度扩展非常接近，范围分别为 [0°, 10.78°]、[0°, 25.65°]、[0°, 13.64°] 与 [0°, 22.56°]，对应平均角度扩展分别为 1.40°、1.71°、1.27° 与 1.48°。图 6(b) 中同样对簇内角度扩展的对数 CDF 作正态分布拟合，拟合模型与经验数据吻合良好。

> **读数说明（原文未逐项点名）：** 上文“四种情形”的范围/均值按原文叙述顺序列出。结合本段对时延扩展的显式点名（场景 2 最小 0.17 ns；场景 1 与 TRx 37—45 均为 0.18 ns；TRx 46—57 最大 0.21 ns）可推知四类情形的顺序为 **场景 1、TRx 37—45、TRx 46—57、场景 2**；但原文对“respectively”所列区间并未逐项命名，故上表数值未强行指派到具体情形，避免误配。

## V. 环境感知的感知信道建模框架

本节介绍用于单站感知的环境感知信道建模框架，该框架在环境的物理特性与信道特征之间建立映射。图 7 展示了所提环境感知信道建模框架；该框架的汇总（把可测信道观测量与被推断的物理属性联系起来）见表 III。具体地：环境中反射体的数量与空间分布影响 MPC 簇的数量及其时延—角度信息，因为环境越复杂往往产生越多可区分的反射组；表面粗糙度影响每个簇内漫射 MPC 的数量与角度跨度，即表面越粗糙、能量散射越宽；此外，表面粗糙度可用角度域功率分布（即 Lambertian 模型）刻画；反射体几何进一步塑造 MPC 的空间排布，依物理布局（如平墙或墙角）影响簇边界与簇内色散模式；材料类型体现在镜面与漫射分量之间的反射损耗分布上，而该分布由不同材料的电磁（EM）属性决定。

**表 III　所提感知信道建模框架汇总**（按原表逐格转录）

| 层级 | 物理特征 | 关键传播可观测量 | 主要输出 |
| --- | --- | --- | --- |
| 1 | 反射体数量与位置 | 由高分辨率参数估计得到的 MPC 簇数量及簇时延/角度质心 | 主导反射体的空间分布与数量 |
| 2 | 表面粗糙度 | 每个簇内漫射 MPC 的数量与 Lambertian 模型 | 相对粗糙度分类与散射强度 |
| 3 | 反射体几何 | MPC 的空间分布、簇内时延—角度色散 | 反射体的几何归类 |
| 4 | 材料类型 | 镜面与漫射反射损耗分布 | 材料识别与电磁属性估计 |

需注意，本文中 TRx 到反射体距离在所有场景固定为 1.2 m，以在隔离材料相关效应时保持一致的几何条件。在实际感知部署中，TRx—反射体距离可能变化或未知；但其对导出参数的影响可在处理（例如反射损耗估计）中校准或补偿。虽然 Lambertian 散射模型在小距离变化下通常稳定，但距离的较大变化可能改变有效散射几何，值得未来进一步研究；因此本文采用的固定距离配置为后续考虑变距离场景的研究提供了受控参照。

这四类物理特征可按 THz 单站感知中的推断难度排序。最容易提取的是反射体数量与位置（层级 1），可用提取 MPC 簇时延与角度信息的高分辨率参数估计算法可靠识别 [26]、[36]。其次是表面粗糙度（层级 2），因为 THz 频段的短波长使系统对细微表面纹理高度敏感，从而能检测粗糙表面相关的散射行为，近期若干研究已作演示 [37]–[39]。反射体几何（层级 3）挑战更大，因为需要对成簇漫射 MPC 的形状与角度分布作空间解释；不过 THz 频段由亚毫米波长引起的显著表面散射，使推断墙角、曲面等反射体形状成为可能 [19]。最困难的任务是材料类型识别（层级 4），它基于镜面与漫射反射行为区分不同材料，需要准确的统计建模——这正是本文的关键贡献。

通过把这些层次化物理属性与可观测的传播特征显式关联，所提环境感知建模框架可实现更准确、更可解释、并面向感知应用的 THz 信道表示。以下小节对关键材料相关特征（表面粗糙度、反射体几何与材料组成）作详细研究。

### A. 表面粗糙度

表面粗糙度是反射体的关键物理属性，在 THz 频段尤为如此——其波长处于毫米量级。在如此短的波长下，微小的表面不平整也会显著影响波散射，使 THz 信号对表面纹理敏感。粗糙度可用表面轮廓的均方根（RMS）高度 $\sigma$ 量化 [40]，定义为

$$
\sigma=\sqrt{\frac{1}{N}\sum_{i=1}^{N}\left(h_i-\bar h\right)^2},\tag{13}
$$

其中 $h_i$ 为第 $i$ 个测点的高度，$\bar h$ 为平均高度，$N$ 为采样点总数。

在实际信道测量中，非侵入情形下往往无法获得 $\sigma$。因此本文采用两个经验驱动的指标间接推断粗糙度效应：(i) 簇内检测到的 MPC 数量；(ii) 用类 Lambertian 行为建模的反射角度扩展。为说明第一个指标，图 8 给出聚合物、水泥与瓷砖材料平墙反射的时延—角度谱——按目视检查与建造标准，这三种表面依次更光滑。观测到的角度跨度分别为 110°（聚合物）、106°（水泥）与 90°（瓷砖），对应检测到的 MPC 数量分别为 267、195 与 99。这些结果揭示清晰趋势：越粗糙的表面往往产生越宽的角度色散与越多的漫射多径反射。

Lambertian 模型也是分析表面粗糙度的度量。根据 Lambertian 模型 [41]，漫射功率 $p_{\mathrm{Lam}}(\Delta\theta)$ 与 $\cos^2(\Delta\theta)$ 成正比：

$$
p_{\mathrm{Lam}}(\Delta\theta)=n_{\mathrm{Lam}}\cdot\cos^2(\Delta\theta)+b_{\mathrm{Lam}},\tag{14}
$$

其中 $\Delta\theta$、$n_{\mathrm{Lam}}$ 与 $b_{\mathrm{Lam}}$ 分别为漫射角 $\theta_{\mathrm{diff}}$ 与镜面反射角 $\theta_{\mathrm{spec}}$ 之间的角差（即 $\Delta\theta=\theta_{\mathrm{spec}}-\theta_{\mathrm{diff}}$）、漫射功率相对 $\cos^2(\Delta\theta)$ 的斜率与截距。注意漫射功率 $p_{\mathrm{Lam}}(\Delta\theta)$ 由到达同一角度 $\theta_{\mathrm{diff}}$ 的所有漫射 MPC 功率求和得到。

图 9 对比了三种粗糙度不同表面的归一化漫射功率与相应拟合的 Lambertian 散射模型。可以看到，漫射功率总体随 $\cos^2(\Delta\theta)$ 增大，与 Lambertian 散射原理一致。聚合物、水泥与瓷砖表面的拟合 Lambertian 模型分别为 $p_{\mathrm{Lam}}(\Delta\theta)=10.29\cdot\cos^2(\Delta\theta)-26.98$ dB、$p_{\mathrm{Lam}}(\Delta\theta)=18.30\cdot\cos^2(\Delta\theta)-32.07$ dB 与 $p_{\mathrm{Lam}}(\Delta\theta)=24.09\cdot\cos^2(\Delta\theta)-45.01$ dB。这些结果揭示清晰趋势：随着表面粗糙度增大，表示 Lambertian 拟合中角度集中程度的斜率参数 $n_{\mathrm{Lam}}$ 减小。这意味着越粗糙的表面产生越宽泛的漫射散射，而越光滑的表面把漫射能量更窄地集中在镜面方向附近。

需注意，本文的表面粗糙度分类主要基于经验观察而非精确表面测量；尽管如此，它提供了与高频下预期表面散射行为一致、实用且直观的解释。我们认为这类见解对指导未来 THz 感知系统的模型开发与基于测量的材料分类工作具有价值。

### B. 反射体几何

本小节分析两个关键参数，即簇形状与材料相关信道色散，因为这些参数反映反射体的几何与结构特性。

**1）簇形状分析。** 簇内漫射 MPC 可有效用于分析反射体的结构特征。通过考察这些分量的空间分布与几何形状，可以推断反射物体的底层物理结构。本小节研究若干代表性物理结构——平墙、凹角、凸角与圆柱柱——并作为示例分析其在信道中的对应表现。这些结构的布局如图 10 所示。仿真设置与测量一致：TRx 沿半径 $r=0.2$ m 的圆轨迹相对旋转中心移动，到反射体距离固定为 $d=1.2$ m；凹角与凸角场景中距离 $b$ 设为 1.0 m；圆柱柱情形中柱子半径设为 $R=0.5$ m。其余仿真参数与真实测量设置一致以保证一致性。图 11 给出仿真结果，展示这些不同物理结构如何在时延—角度域中表现。可以清楚看到，每种结构呈现不同的信道特征，使基于信道特征区分反射体形状成为可能。

通过把结构模型与簇内漫射 MPC 相匹配，可有效识别反射体的结构特征。作为示例，图 12 给出 TRx 50 的匹配结果，展示单个簇的漫射 MPC 如何与拟合的结构模型对齐。如图所示，识别出两个凸角与一面平墙，这与测量环境的实际布局准确对应，如图 12(b) 的重构结构所示。把拟合结构模型与场景 3 的真实几何进行对比，确认了高度一致性，证明该模型在捕获反射体结构特征方面的有效性。

**2）材料相关信道色散。** 簇内时延扩展与角度扩展可作为反射体几何的间接指标，因为它们刻画多径分量与物理表面相互作用产生的空间色散。为分析这一点，依据场景几何与镜面反射损耗识别与特定反射体材料相关的簇，且只考虑仅涉及单一材料类型反射的簇。

以场景 1 为例，图 13 给出材料相关的簇内扩展。水泥、玻璃与金属的时延扩展范围分别观测为 [0.12, 0.80] ns、[0.004, 0.66] ns 与 [0.07, 0.40] ns。就对数角度扩展而言，金属呈现最窄范围 [0°, 1.80°]（原文此处作 “[0°, 1.80°],,”，有重复逗号，疑为排版笔误），与其小而局部的结构（例如金属窗框）一致；玻璃表面呈现中等更宽的扩展 [0°, 7.79°]；水泥表面给出最宽扩展 [2.33°, 10.41°]，反映其更大的物理尺度与更粗糙的纹理——后者引起更宽的角度色散。这些趋势表明，更大的反射体产生更多漫射散射，导致簇内扩展增大。此外，时延与角度扩展的 CDF 与拟合的正态分布吻合良好，如图 13 所示。

### C. 材料类型

如第 IV-A 节所述，镜面与漫射 MPC 可依据反射损耗区分。如 [19]、[20] 所示，材料类型可由反射损耗特性推断。因此本小节对不同材料反射的镜面与漫射 MPC 的反射损耗进行全面分析与建模。与不同材料相关的 MPC 簇通过将其参数与测量场景的已知几何布局相关联来识别。注意本分析仅关注从单一材料类型反射的 MPC 簇，排除涉及多种材料反射的簇。

图 14 给出镜面与漫射分量反射损耗的 CDF 及其对应拟合模型。对于镜面分量，金属反射的 MPC 反射损耗最低，范围为 0.03—4.25 dB；瓷砖墙镜面反射的反射损耗范围为 [9.41, 10.86] dB；玻璃与水泥呈现相近的反射损耗特性，范围分别为 [9.26, 12.50] dB 与 [10.56, 14.66] dB；在所有测试材料中，聚合物的镜面反射损耗最高，为 11.50—15.58 dB。如图 14(a) 所示，所有材料的镜面反射损耗 CDF 与拟合正态分布密切吻合。此外，各材料镜面 MPC 的平均反射损耗与 [20] 给出的材料反射损耗数据库相比，测量值与参考值高度一致。对于漫射分量，所有漫射 MPC 的反射损耗都高于其镜面分量。金属与玻璃的漫射反射损耗相近，范围分别为 [15.97, 44.90] dB 与 [15.19, 52.53] dB；相比之下，水泥、聚合物与瓷砖的漫射反射损耗相当，范围分别为 [24.97, 65.74] dB、[23.63, 63.44] dB 与 [29.33, 60.99] dB。如图 14(b) 所示，漫射反射损耗分布与拟合的 Weibull 模型吻合良好。不同材料反射损耗统计特性的显著差异表明数据驱动材料分类的可行性。例如，各种材料镜面与漫射反射损耗的模型可作为分类器的判别特征。对更多材料开展基于混淆矩阵的分析将有助于量化分类性能，我们将其留作未来探索。

## VI. 结论

本文在三种代表性室内场景中开展信道测量，研究 300 GHz 频段的 THz 单站感知信道。Tx 与 Rx 共址布置以模拟单站感知构型，全部场景共 57 个 TRx 位置。采用基于 SAGE 的信道参数估计算法提取关键 MPC 参数，包括幅度、时延与方位角。所得信道特性按场景逐一分析。在这些测量基础上，我们提出了首个面向单站感知应用的环境感知信道建模框架：该框架把反射体数量、位置、几何、材料属性等关键物理属性系统映射到相应的信道特性。分析表明，该框架能够从观测到的信道行为可靠推断环境特征，验证了其可行性与准确性。未来工作将把本研究扩展到 AI 辅助、多模态、感知增强的信道测量与建模，重点关注 THz 频段的 ISAC 信道建模。

## 图注与表注

**图 1**：THz 单站感知测量场景的示意图与照片。(a) 场景 1 实景照片；(b) 场景 1 示意图；(c) 场景 2 实景照片；(d) 场景 2 示意图；(e) 场景 3 实景照片；(f) 场景 3 示意图。图中标注了水泥墙、金属结构、玻璃、金属框、聚合物墙、门、玻璃墙、金属柱、瓷砖墙、消防栓箱、金属门等材料/结构，以及 TRx 编号、DSS 与角度刻度。
**图 2**：PADP、识别出的 MPC 簇与估计的 MPC 结果。(a) TRx 40 的示例 PADP；(b) TRx 41 经 CCL 后识别出的 MPC 簇（颜色/灰度表示簇标签序号）；(c) SAGE 算法估计的 MPC。
**图 3**：反射损耗分析示例结果。(a) TRx 41 处反射损耗与 MPC 分布的对比（含簇 1、簇 2）；(b) TRx 41 各 MPC 簇反射损耗的概率密度函数（PDF），并区分镜面 MPC 与漫射 MPC。
**图 4**：MPC 簇数量的 CDF 及拟合模型（四种情形的正态拟合参数分别为 $\mathcal N(36.01,10.23)$、$\mathcal N(85,42)$、$\mathcal N(54.89,24.36)$、$\mathcal N(38.25,44.93)$）。
**图 5**：对数时延深度、对数角度宽度及其拟合模型的 CDF。(a) 时延深度；(b) 角度宽度。
**图 6**：对数时延扩展、对数角度扩展及其拟合模型的 CDF。(a) 时延扩展；(b) 角度扩展。
**图 7**：单站感知环境感知信道建模框架。图中左侧为 MPC 参数（MPC 数量、幅度、时延与角度），中间为信道特性（MPC 簇数量、时延与角度特性、簇内 MPC 数量、MPC 簇形状、功率分布），右侧为物理特性（层级 1 反射体数量与位置、层级 2 表面粗糙度、层级 3 反射体几何、层级 4 材料类型）。
**图 8**：来自三种材料、粗糙度不同的平墙反射 MPC。(a) 聚合物；(b) 水泥；(c) 瓷砖。图示角度跨度分别为 110°、106°、90°。
**图 9**：漫射功率与 $\cos^2(\Delta\theta)$ 的关系及拟合的 Lambertian 模型。(a) 聚合物（拟合 $p=10.29\cos^2(\Delta\theta)-26.98$）；(b) 水泥（$p=18.30\cos^2(\Delta\theta)-32.07$）；(c) 瓷砖（$p=24.09\cos^2(\Delta\theta)-45.01$）。
**图 10**：室内代表性物理结构的布局。(a) 平墙；(b) 凹角；(c) 凸角；(d) 圆柱柱。
**图 11**：不同物理结构的仿真实测模型。(a) 平墙；(b) 凹角；(c) 凸角；(d) 圆柱柱。各子图给出角度—时延域分布。
**图 12**：基于实测数据的结构建模分析。(a) 将漫射 MPC 簇与拟合结构模型匹配的示例；(b) 基于识别出的结构重构的环境（含重构结构、TRx 位置与真实布局对比）。
**图 13**：材料相关的簇内时延扩展与角度扩展 CDF 及对应拟合模型。(a) 时延扩展；(b) 角度扩展。
**图 14**：镜面与漫射 MPC 反射损耗的 CDF 及对应拟合模型。(a) 镜面 MPC（正态拟合）；(b) 漫射 MPC（Weibull 拟合）。

**表注**：表 I、表 II、表 III 已分别在第 I 节、第 II-A 节、第 V 节按原表逐格转录；其中表 I 为文献汇总（7 行×5 列）、表 II 为测量配置（13 行×2 列）、表 III 为建模框架层级汇总（4 行×4 列）。

## 参考文献

> 以下按原文编号 [1]—[41] 转录英文原书目，条目文字不翻译；抽取文本中的 “Y .”“P .”“¨” 等为 PDF 提取伪影，已按常规写法整理（如 Y.、P.、ü/ä/ö/é 等），书目内容未改动。

[1] Y. Liu, J. Zhang, Y. Zhang, Z. Yuan, and G. Liu, “A shared cluster-based stochastic channel model for integrated sensing and communication systems,” IEEE Trans. Veh. Technol., vol. 73, no. 5, pp. 6032–6044, 2024.

[2] Z. Zhang, Y. Xiao, Z. Ma, M. Xiao, Z. Ding, X. Lei, G. K. Karagiannidis, and P. Fan, “6G wireless networks: Vision, requirements, architecture, and key technologies,” IEEE Veh. Technol. Mag., vol. 14, no. 3, pp. 28–41, 2019.

[3] C.-X. Wang, X. You, X. Gao, X. Zhu, Z. Li, C. Zhang, H. Wang, Y. Huang, Y. Chen, H. Haas, J. S. Thompson, E. G. Larsson, M. D. Renzo, W. Tong, P. Zhu, X. Shen, H. V. Poor, and L. Hanzo, “On the road to 6G: Visions, requirements, key technologies, and testbeds,” IEEE Commun. Surveys Tuts., vol. 25, no. 2, pp. 905–974, 2023.

[4] W. Yang, Y. Chen, N. Cardona, Y. Zhang, Z. Yu, M. Zhang, J. Li, Y. Chen, and P. Zhu, “Integrated sensing and communication channel modeling and measurements: Requirements and methodologies toward 6G standardization,” IEEE Veh. Technol. Mag., vol. 19, no. 2, pp. 22–30, 2024.

[5] Z. Ma, R. Zhang, B. Ai, Z. Lian, L. Zeng, D. Niyato, and Y. Peng, “Deep reinforcement learning for energy efficiency maximization in RSMA-IRS-assisted ISAC system,” IEEE Transactions on Vehicular Technology, pp. 1–6, 2025.

[6] C. Chaccour, W. Saad, O. Semiari, M. Bennis, and P. Popovski, “Joint sensing and communication for situational awareness in wireless THz systems,” in Proc. of IEEE ICC, 2022, pp. 3772–3777.

[7] J. M. Jornet, H. Elayan, T. Nagatsuma, M. Juntti, E. T. R. Pinto, T. Kürner, H. Guerboukha, D. M. Mittleman, and E. Knightly, “Mobile terahertz communication and sensing systems: A future look,” IEEE Veh. Technol. Mag., vol. 19, no. 4, pp. 20–35, 2024.

[8] W. Jiang, Q. Zhou, J. He, M. A. Habibi, S. Melnyk, M. El-Absi, B. Han, M. D. Renzo, H. D. Schotten, F.-L. Luo, T. S. El-Bawab, M. Juntti, M. Debbah, and V. C. M. Leung, “Terahertz communications and sensing for 6G and beyond: A comprehensive review,” IEEE Commun. Surv. Tutorials., vol. 26, no. 4, pp. 2326–2381, 2024.

[9] D. Dupleich, A. Ebert, Y. Völker-Schöneberg, D. Sitdikov, M. Boban, G. Del Galdo, and R. Thomä, “Characterization of propagation from measurements at sub-THz for ISAC applications in an emulated dynamic industrial scenario,” in Proc. of EuCAP, 2024, pp. 1–5.

[10] Y. Wu, C. Han, and Z. Chen, “THz ISCI: Terahertz integrated sensing, communication and intelligence,” in Proc. of IRMMW-THz, 2021, pp. 1–2.

[11] Z. Chen, C. Han, Y. Wu, L. Li, C. Huang, Z. Zhang, G. Wang, and W. Tong, “Terahertz wireless communications for 2030 and beyond: A cutting-edge frontier,” IEEE Commun. Mag., vol. 59, no. 11, pp. 66–72, 2021.

[12] C. Gentile, A. F. Molisch, J. Chuang, D. G. Michelson, A. Bodi, A. Bhardwaj, O. Ozdemir, W. A. G. Khawaja, I. Guvenc, Z. Cheng, F. Rottenberg, T. Choi, R. Müller, N. Han, and D. Dupleich, “Methodology for benchmarking radio-frequency channel sounders through a system model,” IEEE Transactions on Wireless Communications, vol. 19, no. 10, pp. 6504–6519, 2020.

[13] A. Molisch, Wireless Communications. John Wiley & Sons Ltd., 2011.

[14] J. Zhang, J. Lin, P. Tang, Y. Zhang, H. Xu, T. Gao, H. Miao, Z. Chai, Z. Zhou, Y. Li et al., “Channel measurement, modeling, and simulation for 6G: A survey and tutorial,” arXiv preprint arXiv:2305.16616, 2023.

[15] N. González-Prelcic, M. Furkan Keskin, O. Kaltiokallio, M. Valkama, D. Dardari, X. Shen, Y. Shen, M. Bayraktar, and H. Wymeersch, “The integrated sensing and communication revolution for 6G: Vision, techniques, and applications,” Proceedings of the IEEE, vol. 112, no. 7, pp. 676–723, 2024.

[16] Y. Chen, Z. Yu, J. He, J. Li, and G. Wang, “A scatterer-based hybrid channel model for integrated sensing and communications (ISAC),” in Proc. of IEEE PIMRC, 2023, pp. 1–7.

[17] Y. Li, Y. Wang, Y. Chen, Z. Yu, and C. Han, “300 GHz experiment-based ranging and mapping in indoor environments,” in Proc. of IEEE SPAWC, 2023, pp. 396–400.

[18] M. Lotti, G. Pasolini, A. Guerra, F. Guidi, R. d’Errico, and D. Dardari, “Radio SLAM for 6G systems at THz frequencies: Design and experimental validation,” IEEE J. Sel. Top. Signal Process., vol. 17, no. 4, pp. 834–849, 2023.

[19] Y. Lyu, Z. Huang, S. Schwarz, and C. Han, “Hybrid channel modeling and environment reconstruction for terahertz monostatic sensing,” IEEE Transactions on Wireless Communications, pp. 1–1, 2025.

[20] Z. Fang, Z. Yu, and C. Han, “Centimeter-level geometry reconstruction and material identification in 300 GHz monostatic sensing,” in 2025 19th European Conference on Antennas and Propagation (EuCAP), 2025, pp. 1–5.

[21] F. Taleb, G. G. Hernandez-Cardoso, E. Castro-Camus, and M. Koch, “Transmission, reflection, and scattering characterization of building materials for indoor THz communications,” IEEE Transactions on Terahertz Science and Technology, vol. 13, no. 5, pp. 421–430, 2023.

[22] N. B. Refvik, C. E. Jensen, D. N. Purschke, W. Pan, H. R. J. Simpson, W. Lei, R. Gu, J. Antoszewski, G. A. Umana-Membreno, L. Faraone, and F. A. Hegmann, “Noncontact characterization of carrier mobility in long-wave infrared HgCdTe films with terahertz time-domain spectroscopy,” IEEE Transactions on Terahertz Science and Technology, vol. 14, no. 4, pp. 466–475, 2024.

[23] C. Jansen, R. Piesiewicz, D. Mittleman, T. Kurner, and M. Koch, “The impact of reflections from stratified building materials on the wave propagation in future indoor terahertz communication systems,” IEEE Transactions on Antennas and Propagation, vol. 56, no. 5, pp. 1413–1419, 2008.

[24] T. Kleine-Ostmann, R. Piesiewicz, N. Krumbholz, D. Mittleman, T. Kurner, and M. Koch, “Characterization of building materials for the modeling of pico-cellular THz communication systems,” in 2005 Joint 30th International Conference on Infrared and Millimeter Waves and 13th International Conference on Terahertz Electronics, vol. 2, 2005, pp. 592–593 vol. 2.

[25] Y. Lyu, P. Kyösti, and W. Fan, “Sub-THz VNA-based channel sounder structure and channel measurements at 100 and 300 GHz,” in Proc. of PIMRC, 2021, pp. 1–5.

[26] Y. Li, C. Han, Y. Chen, Z. Yu, and X. Yin, “DSS-o-SAGE: Direction-scan sounding-oriented SAGE algorithm for channel parameter estimation in mmWave and THz bands,” IEEE Trans. Antennas Propagat., pp. 1–1, 2024.

[27] S. Velasco-Forero and J. Angulo, “Random projection depth for multivariate mathematical morphology,” IEEE Journal of Selected Topics in Signal Processing, vol. 6, no. 7, pp. 753–763, 2012.

[28] M. Xiao, H. Wang, Z. Zeng, and Y. Bie, “SAR image segmentation and target detection based on mathematical morphology,” in 2021 2nd China International SAR Symposium (CISS), 2021, pp. 1–5.

[29] J. Y. Gil and R. Kimmel, “Efficient dilation, erosion, opening, and closing algorithms,” IEEE Trans. Pattern Anal. Mach. Intell., vol. 24, no. 12, pp. 1606–1617, 2002.

[30] R. He, B. Ai, A. F. Molisch, G. L. Stuber, Q. Li, Z. Zhong, and J. Yu, “Clustering enabled wireless channel modeling using big data algorithms,” IEEE Communications Magazine, vol. 56, no. 5, pp. 177–183, 2018.

[31] A. F. Molisch, K. Balakrishnan, C.-C. Chong, S. Emami, A. Fort, J. Karedal, J. Kunisch, H. Schantz, U. Schuster, and K. Siwiak, “IEEE 802.15.4a channel model-final report,” IEEE P802, vol. 15, no. 04, p. 0662, 2004.

[32] Y. Chen, C. Han, J. He, and G. Wang, “A framework of Mahalanobis-distance metric with supervised learning for clustering multipath components in MIMO channel analysis,” IEEE Transactions on Antennas and Propagation, vol. 70, no. 6, pp. 4069–4081, 2022.

[33] S. Ju, D. Shakya, H. Poddar, Y. Xing, O. Kanhere, and T. S. Rappaport, “142 GHz sub-terahertz radio propagation measurements and channel characterization in factory buildings,” IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7127–7143, 2024.

[34] B. Fleury, “First- and second-order characterization of direction dispersion and space selectivity in the radio channel,” IEEE Trans. Inform. Theory, vol. 46, no. 6, pp. 2027–2044, 2000.

[35] 3GPP, “Study on channel model for frequencies from 0.5 to 100 GHz,” 3GPP, Tech. Rep. V17.0.0, March 2022.

[36] K.-W. Kim, M.-D. Kim, J.-J. Park, J. Lee, and H.-K. Kwon, “Sub-terahertz channel characterization in a lecture room from measurements with phase drift by a rotating horn antenna,” IEEE Transactions on Antennas and Propagation, vol. 73, no. 2, pp. 1110–1124, 2025.

[37] X. Liao, C. Lin, X. Zheng, Y. Wang, and H. Song, “Measurements and modeling of depolarization characteristics from rough surfaces at Sub-THz band for indoor short-range communications,” IEEE Antennas and Wireless Propagation Letters, vol. 23, no. 12, pp. 4802–4806, 2024.

[38] X. Zhao, B. Chen, K. Guan, B. Lu, Y. Wei, and M. Dong, “Polarization characterization of THz scattering from rough surfaces based on deep learning,” in 2024 4th URSI Atlantic Radio Science Meeting (AT-RASC), 2024, pp. 1–4.

[39] S. T. Gassel, M. R. Hofmann, and C. Brenner, “Influence of surface roughness on material classification for reflective THz-TDS measurements,” in 2023 48th International Conference on Infrared, Millimeter, and Terahertz Waves (IRMMW-THz), 2023, pp. 1–2.

[40] H. Yi, K. Guan, P. T. Mathiopoulos, P. Xie, D. He, J. Dou, and Z. Zhong, “Full-wave simulation and scattering modeling for terahertz communications,” IEEE Journal of Selected Topics in Signal Processing, vol. 17, no. 4, pp. 713–728, 2023.

[41] V. Degli-Esposti, F. Fuschini, E. M. Vitucci, and G. Falciasecca, “Measurement and modelling of scattering from buildings,” IEEE Trans. Antennas Propagat., vol. 55, no. 1, pp. 143–153, 2007.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含表 I 与三条贡献、组织结构）；第 II 节测量活动（II-A 探测仪与测量设置、表 II；II-B 测量场景、图 1）；第 III 节数据处理与分析（III-A 信号模型，式（1）—（3）；III-B 基于图像处理的簇识别，式（4）—（10）与图 2）；第 IV 节基于簇的信道表征（IV-A 镜面/漫射分量识别，式（11）（12）与图 3；IV-B MPC 簇数量与图 4；IV-C 簇内时延与角度特性、图 5—6）；第 V 节环境感知建模框架（框架总述、表 III、图 7；V-A 表面粗糙度，式（13）（14）与图 8—9；V-B 反射体几何：簇形状分析（图 10—12）与材料相关信道色散（图 13）；V-C 材料类型与图 14）；第 VI 节结论；图 1—14 图注与表注；参考文献 [1]—[41] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—14 的图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I—III 为矢量表格，已用 PyMuPDF 渲染对应页面（p.2、p.3、p.8）逐格核对后转录；④原文两处疑点（IV-B 自指表述、V-B.2 重复逗号）已加注，未改数值；⑤原文未给出独立致谢章节与附录，故未包含。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
