---
layout: page
title: "信道老化与多普勒杂波对 OFDM ISAC 系统的影响｜中文译稿（翻译中）"
permalink: /papers/translations/2026-10-21-channel-aging-clutter-isac-2601-05032/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1524a18885ddaf9a/) · [arXiv 原文](https://arxiv.org/abs/2601.05032)

# 信道老化与多普勒影响杂波对 OFDM ISAC 系统的影响

**原题：** On the Impact of Channel Aging and Doppler-Affected Clutter on OFDM ISAC Systems  
**作者：** Steven Rivetti、Gabor Fodor、Emil Björnson、Mikael Skoglund  
**机构：** 瑞典皇家理工学院（KTH）；部分作者与 Ericsson Research 有关。  
**原文：** arXiv:2601.05032v5，2026 年 10 月 12 日，16 页。  
**译文进度：** 已译摘要、引言、系统模型主体和第 III 节开头；公式（1）–（11）与原始系统参数说明。**后续第 III–VII 节及附录仍待逐页补译和校对，不属于已验收全文。**

## 摘要

传播环境随时间演化，在通信感知一体化（integrated sensing and communication，ISAC）系统中发挥着核心作用。慢时间尺度的演化在通信链路中表现为信道老化，而快时间尺度的演化则与具有非零多普勒频移的结构化杂波有关。然而，这两种现象对 ISAC 性能的联合影响在很大程度上仍被忽视。

研究一个采用正交频分复用（OFDM）波形的网络：基站同时服务用户设备（UE），并执行单站感知。信道老化采用具有贝塞尔相关性衰减的自回归模型刻画；杂波则建模为一组不相关、具有相干结构且多普勒不为零的杂波块，由此得到 Kronecker 可分离的协方差结构。

提出一种感知信道老化的信道估计器，利用先前的导频观测估计具有非各向同性多径衰落结构的时变 UE 信道。利用杂波的结构特点，又设计一种新型低复杂度杂波估计与抑制流程：首先从原始数据估计杂波统计量，随后抑制杂波的作用，再计算距离—角度图和距离—速度图。研究评估帧长与导频历史对信道估计精度的影响，发现与块衰落模型相比，在低至中等移动速度区间可以取得显著性能收益。在杂波主导的环境中，所提流程在实际可行的配置下仍能实现有效杂波抑制。

进一步引入可控的不可分离程度，分析该流程对不可分离杂波的鲁棒性。结果突出了专用感知数据流的优势，表明所提杂波估计与抑制方法可承受中等程度的不可分离性。

**关键词：** 信道老化；杂波；ISAC；OFDM 雷达。

## I. 引言

第六代无线网络不仅需要支持高速率通信，还预计将原生支持感知与环境认知。通信感知一体化（ISAC）由此成为关键范式：感知与通信不再争夺日益稀缺的频谱资源，而是相互协作 [1]。在多种感知拓扑中，采用蜂窝基站（BS）大规模多输入多输出（MIMO）的单站感知，因其实现优势而受到标准化与科研界的重视。这种拓扑能够利用大型天线阵列、先进信号处理能力，并使感知接收端易于获取通信发射信号。

此外，蜂窝单站感知不需要多个基站间代价高昂的同步 [2]，也不需要 UE 与基站之间的同步 [3]。不过，单站感知通常需要在发射和接收之间划分天线，与传统的仅通信部署不同。为了促进任务融合，ISAC 系统还需在两项任务之间划分发射功率、带宽等可用资源 [4]。资源分配是决定感知—通信折中关系的首要因素，文献 [5]、[6] 给出了实现最优折中的资源分配示例。

ISAC 的一项基本设计选择，是完全融合感知与通信，还是保留一定程度的任务分离。文献 [7] 教程介绍了如何直接利用为通信优化的波形执行感知，以获得最高融合程度。然而，这也引入所谓“确定性—随机性折中”：感知偏好确定性信号，而通信需要随机信号。适度分离两项任务可以缓解该折中。

文献 [8] 表明，除通信数据流外另行配置专用感知数据流所实现的空间分离，比将两项任务分别安排在不同时隙的时间分离方案具有更好的到达角（AoA）估计性能。此外，目标与通信 UE 之间的地理间隔也可能使任务分离不可避免 [9]、[10]。

感知天然依赖视距（LoS）信道的快时间变化；而通常由非视距（NLoS）部分主导的通信信道，则因 UE 移动和环境变化呈现慢时间演化。这种时间演化经常通过块衰落模型加以简化，该模型假设各块内信道保持不变，而不同块是独立实现。虽然数学上便于处理，但块衰落模型无法刻画信道老化 [11]，直接影响通信性能。通过考虑信道时间相关性的统计特征可以为信道老化建模 [12]、[13]。

通信接收机设计以及信道估计/预测方面的近期进展表明，导频间隔（或帧长）能够帮助缓解信道老化带来的负面影响。但这也是一个众所周知的难题。文献 [14] 推导单天线 UE 频谱效率（SE）的上界，发现导频间隔决定 CSI 质量与频谱效率之间的最优折中。文献 [15] 将分析扩展至非平稳老化 Rician 信道，设计多帧传输结构，并给出最优导频间隔与功率控制策略。文献 [16] 研究硬件缺陷对最优导频间隔的影响。文献 [17] 则研究数据驱动方法，利用卷积神经网络提取时间相关模式，并使用自回归网络预测 CSI。

颇为意外的是，信道老化对 ISAC 系统，尤其是单站 ISAC 系统通信性能的影响，尚未得到充分研究。文献 [18] 采用面向跟踪的方法，将老化时间定义为自最近一次导频发射以来经过的块数，即 CSI 完全依赖预测的块数。首先通过导频发射及 MMSE 估计获取 CSI，再使用卡尔曼滤波器预测。

虽然杂波是不可避免的雷达影响因素，很多既有工作未考虑杂波的时间演化和扩展目标属性。文献 [19] 提出面向太赫兹频段近场单站工作方式的基于波束倾斜的 ISAC 方案，将杂波定义为由点状反射体构成的静态网格。这样的建模易于处理，却无法刻画真实杂波环境的时间演化和空间结构。文献 [20] 允许杂波由移动的点状散射体构成，但仍不能表现真实杂波块相干且空间扩展的结构；实际杂波块通常具有不可忽略的角度、多普勒与时延扩展。

杂波抑制直接关系到 ISAC 中的目标检测与参数估计性能。文献 [21] 提出面向窄带 ISAC 的特征值检测方案，将杂波空间分布建模为多个杂波块，并将时间相关噪声建模为 Toeplitz 结构。文献 [22] 研究可重构智能表面（RIS）辅助 ISAC 网络单站工作时的杂波块目标检测，提出不依赖具体杂波分布的检测器以及 RIS 相移优化算法。

本文认为，无视或过分简化杂波，将使 ISAC 系统设计出实用性较弱的感知处理流程。因此，研究采用 OFDM 波形、在城市环境中执行单站感知的网络，分析环境变化的影响。更具体地，文章提出两个尚未得到充分回答的问题：

1. 当基站服务多天线 UE 时，信道老化对 ISAC 有何影响？如何有效利用已知的信道时间相关结构？
2. 城市场景中怎样的杂波模型既足够真实，又易于数学处理？如何抑制观测感知数据中的杂波影响？

据此，主要贡献包括：

1. 对 BS—UE 信道的空间和时间相关性建模。空间协方差矩阵见式（12）；时间相关性服从具有贝塞尔相关性衰减的一阶 AR 过程。引理 3 及其推论给出信道老化感知 MMSE 估计器。
2. 借鉴机载雷达和合成孔径雷达技术 [23]、[24]，提出面向 ISAC 的 Kronecker 可分离杂波协方差模型。总体杂波协方差等于空间、时间、频率协方差矩阵的 Kronecker 积，各因子在第 III 节定义。
3. 提出杂波估计和抑制流程。从原始数据估计杂波二阶统计量，利用估计结果抑制杂波，再计算距离—角度（RA）及距离—速度（RV）图，评价抑制效果以及提供给后续检测/估计算法的感知表示质量。
4. 通过引入可控的不可分离程度，研究所提流程对不可分离杂波的鲁棒性。扰动模型允许模拟特征值与特征向量中的模型失配。
5. 在单 UE 配置中数值评价通信信道估计器和杂波估计/抑制流程，展示利用通信信道时间相关性的收益，以及对中等不可分离性仍具有的鲁棒性。

后续结构如下：第 II 节给出单站 OFDM ISAC 系统模型；第 III 节给出 UE 信道的时空协方差、杂波二阶统计和不可分离性鲁棒性模型；第 IV 节提出考虑信道老化的 MMSE 估计器及估计误差的统计刻画；第 V 节给出杂波统计估计与抑制流程；第 VI 节描述通信数据流的 MMSE 预编码及感知数据流的零空间投影扫描；第 VII 节提供数值性能结果。

**符号约定：** 黑体小写字母与大写字母分别表示向量和矩阵；$\operatorname{Tr}(\mathbf X)$ 为迹，$\operatorname{diag}(\mathbf x)$ 为对角矩阵，$\operatorname{vec}(\cdot)$ 表示按列堆叠向量化，$\mathcal T(\mathbf x)$ 表示由向量构造的 Toeplitz 矩阵，$\mathcal U_1$ 与 $\mathcal F_1$ 分别表示张量第一维展开与折叠。$\mathcal{CN}(0,\sigma^2)$ 为方差 $\sigma^2$ 的圆对称复高斯分布。角区间 $\Delta=[\theta,\vartheta]$ 的长度为 $|\Delta|=\vartheta-\theta$。

## II. 系统模型

考虑图 1 所示单小区场景。基站配备 $M_{\rm BS}$ 根收发天线，服务配备 $M_{\rm UE}$ 根天线的单个通信 UE。系统通过发送下行导频信号估计基站到 UE 的下行信道，并假设 UE 提供即时反馈；这一假设旨在允许发射端获取 CSI（CSIT），通信侧工作关注的信道估计质量不依赖具体的反馈机制。同时，发射波形被用于雷达探测，以收集 $L$ 个目标的单站回波。

**图 1：** 单小区多天线 ISAC 网络。下行信号既用于传输信道估计导频，又作为单站雷达探测信号；蓝色箭头表示目标回波，红色箭头表示地面杂波回波。

系统以载频 $f_c$ 运行 OFDM，在 $V$ 个有效子载波上传输，子载波间隔为 $\Delta f$。符号持续时间为 $T=1/\Delta f+T_{\rm cp}$，其中 $T_{\rm cp}$ 是循环前缀长度。时间 $t$ 的 BS—UE 通信信道记为 $\mathbf H_t\in\mathbb C^{M_{\rm UE}\times M_{\rm BS}}$。鉴于假设的频域块衰落结构，下文对任意一个相干块建模，省略 $\mathbf H$ 的子载波索引。

将 $\mathbf H_t$ 按列堆叠，得到 UE 信道向量 $\mathbf h_t=\operatorname{vec}(\mathbf H_t)\in\mathbb C^{M_{\rm BS}M_{\rm UE}}$。其服从具有相关性的 Rayleigh 衰落分布，协方差采用 Kronecker 模型 [28]。由于 UE 与 BS 相互处于远场，多径主要由通信簇产生，这一模型可较好地拟合信道。通信簇是 UE 附近一组距离相近的散射体，引起小尺度衰落 [30]。因此 $\mathbf h_t\sim\mathcal{CN}(\mathbf0,\mathbf C)$，其中：

$$
\mathbf C=\mathbf C_{\rm BS}\otimes\mathbf C_{\rm UE}
\in\mathbb C^{M_{\rm BS}M_{\rm UE}\times M_{\rm BS}M_{\rm UE}}. \tag{1}
$$

$\mathbf C_{\rm BS}\in\mathbb C^{M_{\rm BS}\times M_{\rm BS}}$ 与 $\mathbf C_{\rm UE}\in\mathbb C^{M_{\rm UE}\times M_{\rm UE}}$ 分别为 BS 侧和 UE 侧相关矩阵。该 Kronecker 假设得到数学上可处理的协方差形式；Weichselberger 等非可分离空间相关模型留待未来工作。

进一步假设 $\mathbf H_t$ 随时间呈现信道老化，使不同时间隙间的相关性成为可利用的自由度；单纯块衰落模型无法利用这一点 [31]。以一阶 AR 过程建模老化。由于各个空间分量经历相同的老化过程，状态转移矩阵是乘以标量的单位矩阵 [14]、[32]，其中标量控制相关性随时间的衰减。因此：

$$
\mathbb E[\mathbf h_t\mathbf h_{t+iT}^{H}]
=\mathbf C\zeta(iT).
$$

$\zeta(iT)$ 为第 $i$ 个时间隙的相关性衰减。为简化记号，将时间单位设为 $T$，下文用 $i$ 代替 $iT$。将 $\Delta$ 个时隙的信道实现收集为向量 $\mathbf h_\Delta\in\mathbb C^{M_{\rm BS}M_{\rm UE}\Delta}$，它服从零均值复高斯分布，协方差为：

$$
\mathbb E[\mathbf h_\Delta\mathbf h_\Delta^H]
=\mathbf C\otimes\mathcal T\big([\zeta(0),\ldots,\zeta(\Delta)]\big). \tag{2}
$$

**图 2：** 导频/数据在时频网格上的传输结构。导频在不同帧起始处发送，两个导频间隔 $\Delta$ 个数据时隙，图中的 $V_{\rm cho}$ 为相干子载波数量。每个导频时隙开始时估计通信信道。该发送模式是一种分析抽象，而非特定实际帧格式；实际导频往往在时频域更为稀疏 [33]。

子载波 $v$ 上时刻 $i$ 的感知信道 $\mathbf G_{i,v}\in\mathbb C^{M_{\rm BS}\times M_{\rm BS}}$ 定义为：

$$
\mathbf G_{i,v}:=
\sum_{l=1}^{L}
\alpha_l e^{-j2\pi f_{D,l}Ti}
e^{j2\pi\Delta f\,v\tau_l}
\mathbf a(\theta_l)\mathbf a(\theta_l)^H. \tag{3}
$$

其中，$\tau_l,\theta_l,f_{D,l}$ 分别表示第 $l$ 个目标的双程时延、到达角和多普勒频移。尽管这种点目标模型相对简单，但已在铁路侵入检测、公路行人检测等感知任务中得到应用 [34]。第 $l$ 个目标的多普勒频移为 $f_{D,l}=2\nu_l/\lambda_c$，其中 $\nu_l$ 是目标径向速度。假设目标位置相较通信信道变化缓慢，目标参数至少在 $I$ 个 OFDM 符号内保持不变。

将 BS 置于原点，第 $l$ 个目标的位置为 $\mathbf p_l=[p_{x,l},p_{y,l}]^\top$，则 $\theta_l=\operatorname{atan2}(p_{y,l},p_{x,l})$，$\tau_l=2r_l/c$，$r_l=\|\mathbf p_l\|$。在窄带假设 $\lambda_c\approx\lambda_v$ 下，阵列导向矢量写为：

$$
\mathbf a(\theta_l)\triangleq
[e^{-j\pi(-M_{\rm BS}/2)\sin\theta_l},\ldots,
e^{-j\pi(M_{\rm BS}/2-1)\sin\theta_l}]^\top.
$$

目标复信道增益定义为：

$$
\alpha_l=
\sqrt{\frac{G_{\rm Tx}G_{\rm Rx}c^2\delta_{{\rm tg},l}^2}
{(4\pi)^3f_c^2r_l^4}}\;
e^{j2\pi f_c\tau_l}. \tag{4}
$$

$\delta_{{\rm tg},l}^2$ 表示第 $l$ 个目标的雷达散射截面（RCS），$G_{\rm Tx},G_{\rm Rx}$ 是单阵元发射和接收天线增益。假定单阵元天线各向同性，故增益均为 0 dBi。

在真实 ISAC 场景中，必须在杂波主导的环境中恢复目标参数 [35]。雷达文献中的杂波是源于目标周围环境的无关回波，若处理不当，会严重损害雷达性能 [24]。将杂波建模为加性有色复高斯噪声 $\mathbf c_{i,v}$；把所有子载波和时间隙上的杂波收集为 $\mathbf c=[\mathbf c_{1,1}^{\top},\ldots,\mathbf c_{I,V}^{\top}]^\top$，则：

$$
\mathbf c\sim\mathcal{CN}(\mathbf0,\delta_{\rm cl}^2\mathbf B).
$$

其中，$\delta_{\rm cl}^2$ 为杂波功率，在球不变随机向量（SIRV）模型中对应纹理随机变量的二阶矩。SIRV 模型的纹理通常服从 Weibull 等重尾分布，用来表示杂波能量的慢变化 [36]。为使数学推导更清晰，这里将纹理参数设为常数，从而保持 $\mathbf c$ 的高斯性。随机纹理不会破坏后文基于协方差的杂波处理，因为其对协方差的影响仅通过二阶矩产生 [23]。

一般数据时隙 $i$、子载波 $v$ 上的发射波形定义为：

$$
\mathbf s_{i,v}=
\sum_{s=1}^{S}\mathbf f_{i,v,s}\sqrt{\rho_{i,v,s}}\,x_{i,v,s}
=\mathbf F_{i,v}\mathbf P_{i,v}\mathbf x_{i,v}
\in\mathbb C^{M_{\rm BS}}. \tag{5}
$$

其中，$\mathbf F_{i,v}\in\mathbb C^{M_{\rm BS}\times S}$ 为预编码矩阵，$\mathbf P_{i,v}$ 为由功率系数构造的对角矩阵。采用功能分离的预编码结构，通信与感知分别配置预编码流，并针对对应任务设计。分配 $M_{\rm UE}$ 条流给 UE，另外增加一条感知流，故流总数为 $S=M_{\rm UE}+1$。UE 的预编码矩阵为 $\mathbf F^{\rm UE}_{i,v}=[\mathbf f^{\rm UE}_{i,v,1},\ldots,\mathbf f^{\rm UE}_{i,v,M_{\rm UE}}]$，总预编码矩阵为 $\mathbf F_{i,v}=[\mathbf F^{\rm UE}_{i,v},\mathbf f_{i,v,S}]$，并假设每列均归一化为单位范数。

记 $\rho_{i,v,s}$ 为基站在时隙 $i$、子载波 $v$ 上分配给第 $s$ 条数据流的功率。总发射功率预算 $P_{\rm Tx}$ 在通信和感知之间分割，对每个时隙有：

$$
P_{\rm comm}=\sum_{s=1}^{M_{\rm UE}}\sum_{v=1}^{V}\rho_{i,v,s}
=P_{\rm Tx}\gamma,\qquad \forall i. \tag{6}
$$

$$
P_{\rm sens}=\sum_{v=1}^{V}\rho_{i,v,S}
=P_{\rm Tx}(1-\gamma),\qquad \forall i. \tag{7}
$$

$\gamma\in[0,1]$ 是总发射功率中分配给通信的比例，直接表示 ISAC 固有的功率折中。时刻 $i$、子载波 $v$ 的发送符号可以是导频，也可以是信息符号，记为 $\mathbf x_{i,v}$，其中各流的符号满足 $x_{i,v,s}\sim\mathcal{CN}(0,1)$。

UE 在一般数据时隙的频域观测为：

$$
\mathbf y_{i,v}^{\rm UE}:=\alpha_{\rm UE}\mathbf H_{i,k}\mathbf s_{i,v}
+\mathbf n_{i,v}\in\mathbb C^{M_{\rm UE}}. \tag{8}
$$

$\mathbf n_{i,v}$ 为 UE 接收机噪声，各元素独立同分布，服从 $\mathcal{CN}(0,\sigma_{\rm UE}^2)$。相应地，在任一时隙，BS 观测到的雷达回波为：

$$
\mathbf y_{i,v}^{\rm radar}
:=\boldsymbol\mu_{i,v}+\mathbf c_{i,v}+\mathbf n_{i,v}^{r}
\in\mathbb C^{M_{\rm BS}}, \tag{9}
$$

其中 $\boldsymbol\mu_{i,v}=\mathbf G_{i,v}\mathbf s_{i,v}$ 是既无噪声也无杂波的回波。雷达接收机噪声 $\mathbf n_{i,v}^{r}$ 的元素也独立同分布，为零均值复高斯噪声。

## III. 信道老化与杂波的影响刻画（已译部分）

这一节刻画通信信道与观测杂波的协方差。受 3GPP 标准化簇延迟线（cluster delay-line）信道 [30] 启发，$\mathbf h_i$ 的空间协方差采用非各向同性多径模型，即由多个簇叠加形成，每个簇发出多条角度扩展较小的射线。

**图 3：** 城市杂波环境的概念示意。杂波由有限个近似独立的杂波块叠加构成，既包括静态块，也包括动态块。Kronecker 可分离性为该环境提供了便于处理的近似。

杂波块指环境中产生具有近似相同角度、多普勒与距离的雷达回波的区域，假设其角度、多普勒和时延扩展均较小。虽然通信簇与杂波块可以使用类似数学模型描述，但二者表示不同的物理尺度：杂波块是扩展的表面，UE 的通信簇则是局域化的多径分量，用于描述 UE 附近的小尺度衰落。因此，形成通信协方差 $\mathbf C$ 的簇不被视为杂波块。不过，模型可以自然推广到同一个物体既产生杂波又影响 UE 多径的场景。

### A. UE 信道的空间与时间协方差（已译部分）

先关注 BS 侧相关矩阵 $\mathbf C_{\rm BS}$，因为 UE 侧 $\mathbf C_{\rm UE}$ 的计算完全类似。一般形式为：

$$
\mathbf C_{\rm BS}=
\int_{-\pi/2}^{\pi/2}
f_{\rm BS}(\psi)\mathbf a(\psi)\mathbf a(\psi)^H\,d\psi. \tag{10}
$$

$f_{\rm BS}(\psi)$ 是角扩展函数，规定不同角度方向对应的增益与相位变化。假设 BS—UE 之间的视距链路受阻，BS 信号经 $N_{\rm UE}$ 个通信簇抵达 UE [37]。角扩展函数可建模为：

$$
f_{\rm BS}(\psi)=\frac{1}{N_{\rm UE}}
\sum_{n=1}^{N_{\rm UE}}
\frac{1}{\sqrt{2\pi}\varsigma_{\rm UE}}
\exp\!\left[-\frac{(\psi-\psi_{{\rm BS},n})^2}
{2\varsigma_{\rm UE}^{2}}\right]. \tag{11}
$$

这里 $\psi_{{\rm BS},n}$ 是 BS 视角下第 $n$ 个通信簇的角度；簇以角扩展 $\varsigma_{\rm UE}$ 反射入射信号。全部通信簇从 BS 观察时位于相应的角度区间 $\Delta\psi_{\rm BS,k}$ 内。每个簇以角扩展 $\varsigma_{\rm UE}$ 反射入射信号。在小角扩展假设下，$\cos(\varsigma_{\rm UE})\approx1$ 且 $\sin(\varsigma_{\rm UE})\approx\varsigma_{\rm UE}$，$\mathbf C_{\rm BS}$ 的各元素可由 [39, 引理 2] 紧密近似为：

$
[\mathbf C_{\rm BS}]_{l,m}\approx
\frac1{N_{\rm UE}}\sum_{n=1}^{N_{\rm UE}}
A_{l,m}(\psi_{{\rm BS},n})
\exp\!\left[-\frac{\pi^2}{2}
((l-m)\cos\psi_{{\rm BS},n}\,\varsigma_{\rm UE})^2\right], \tag{12}
$

其中 $l,m=1,\ldots,M_{\rm BS}$，
$A_{l,m}(\psi)=\exp[-j\pi(l-m)\sin\psi]$。信道随时间的演化建模为一阶 AR 过程，状态转移矩阵取标量乘单位矩阵。控制相关衰减的尺度因子设为
$\zeta(i)=J_0(2\pi T f_D^{\rm UE}i)$，其中 $f_D^{\rm UE}$ 是 UE 多普勒频移，$J_0(\cdot)$ 是零阶第一类贝塞尔函数 [40]。使用多普勒决定时间相关衰减，是因为多普勒直接影响信道相干时间。后文分别使用 $\psi_{{\rm UE},n}$ 与 $\Delta\psi_{\rm UE}$ 表示从 UE 观察的第 $n$ 个通信簇角度及所有簇所占的角度范围。

### B. 杂波特征刻画

杂波来自少量强散射块，产生具有较窄角度／多普勒主瓣的反射回波（见图 3）。在此假设下，杂波协方差矩阵可近似分离为三个因子的 Kronecker 积：

$
\mathbb E[\mathbf c\mathbf c^H]
=\delta_{\rm cl}^2\mathbf B
\approx
\sqrt[3]{\delta_{\rm cl}^2}\mathbf B_{\rm sp}
\otimes
\sqrt[3]{\delta_{\rm cl}^2}\mathbf B_t
\otimes
\sqrt[3]{\delta_{\rm cl}^2}\mathbf B_f. \tag{13}
$

雷达文献将其称为 Kronecker 可分离杂波模型 [23]、[41]、[42]。这里的可分离结构是一种近似，目的在于实现计算高效的处理。一种适用情景是“街道峡谷”，即两侧排列建筑的大型城市街道；杂波主要由建筑立面等扩展的近似平面产生，回波集中于相对局部的角度区间，多普勒与时延之间耦合较弱。文献 [43]、[44] 的两种实验装置也展示了杂波中可由散射块描述的主导成分。这里 $\mathbf B_{\rm sp},\mathbf B_t,\mathbf B_f$ 分别描述杂波角度、多普勒及距离分布。模型的重要优势，是白化、特征分解、矩阵求逆等操作可分别沿每个维度执行。

**空间杂波协方差。** $\mathbf B_{\rm sp}$ 与式（12）的通信侧空间协方差采用相同数学模型。设杂波块角扩展为 $\varsigma_{\rm sp}$，同样利用小角度近似，得到：

$
[\mathbf B_{\rm sp}]_{l,m}\approx\frac1N\sum_{n=1}^{N}
A_{l,m}(\psi_n)
\exp\!\left[-\frac12
(\pi(l-m)\cos\psi_n\,\varsigma_{\rm sp})^2\right]. \tag{14}
$

其中 $l,m=1,\ldots,M_{\rm BS}$，且 $A_{l,m}(\psi_n)=e^{-j\pi(l-m)\sin\psi_n}$。

**时间杂波协方差。** 时间协方差在雷达分析中的作用不同于通信信道。矩阵 $\mathbf B_t$ 描述杂波多普勒特征，使之与目标多普勒区分。因此，它可像空间协方差一样，利用功率谱密度的反傅里叶变换构造：

$
\mathbf B_t=\int_{-\infty}^{+\infty}
g(f)\mathbf b(f)\mathbf b(f)^H\,df. \tag{15}
$

$\mathbf b(f)=[1,e^{-j2\pi fT},\ldots,e^{-j2\pi fT(I-1)}]^\top\in\mathbb C^I$
是多普勒导向矢量，$g(f)$ 是指示各频率增益的功率谱密度。假设不同杂波块近似独立，该谱建模为多个高斯分量的叠加：

$
g(f)=\frac1N\sum_{n=1}^{N}
\frac1{\sqrt{2\pi}\varsigma_D}
\exp\!\left[-\frac{(f-f_{D,n})^2}{2\varsigma_D^2}\right]. \tag{16}
$

其中 $f_{D,n}$ 是第 $n$ 个杂波块的多普勒频移，$\varsigma_D^2$ 是多普勒扩展方差。进一步令 $\varsigma_D=1/(2\pi T I_c)$，其中 $I_c$ 表示杂波时间相关性大于零时所持续的 OFDM 符号数量。

**引理 1：** 在杂波块近似独立的假设下：

$
[\mathbf B_t]_{l,m}
=\frac1N\sum_{n=1}^{N}D_{l,m}(f_{D,n})
\exp\!\left[-\frac{(l-m)^2}{2I_c^2}\right], \tag{17}
$

其中 $l,m=1,\ldots,I$，
$D_{l,m}(f_{D,n})=\exp[-j2\pi f_{D,n}T(l-m)]$。

**证明：** 将式（16）代入式（15），得到 $N$ 个高斯谱与复指数乘积的积分。对指数项配方，将与积分变量 $f$ 无关的因子提出，得到式（18）所述分解：

$
\begin{aligned}
[\mathbf B_t]_{l,m}
={}&\frac1N\sum_{n=1}^{N}
e^{-j2\pi f_{D,n}T(l-m)}
e^{-2(\pi T(l-m)\varsigma_D)^2}\\
&\times\int_{-\infty}^{+\infty}
\frac1{\sqrt{2\pi}\varsigma_D}
\exp\!\left[
-\frac{(f-f_{D,n}-j2\pi\varsigma_D^2T(l-m))^2}
{2\varsigma_D^2}\right]\,df.
\end{aligned}\tag{18}
$

最后的高斯积分等于 1，代入 $\varsigma_D=1/(2\pi T I_c)$ 即得式（17）。原文式（18）的积分指数在排版提取中存在易混淆字符，本式按平方配方法重排；终校应以 PDF 公式图像为准。

**频率杂波协方差。** 频率协方差是功率—时延谱的傅里叶变换：

$
\mathbf B_f=\int_{-\infty}^{+\infty}
h(\tau)\mathbf d(\tau)\mathbf d(\tau)^H\,d\tau, \tag{19}
$

其中
$\mathbf d(\tau)=[1,e^{j2\pi\Delta f\tau},\ldots,
e^{j2\pi\Delta f\tau(V-1)}]^\top\in\mathbb C^V$
是时延导向矢量；$h(\tau)$ 为功率时延轮廓。

与点目标不同，杂波块是由多个散射体构成的扩展表面，其漫反射破坏了每个散射块在距离维度上的完全相干性，回波还受到多径影响。因此，除与前述相似的离散项外，$h(\tau)$ 还包含表征多径与漫反射的额外部分 $\widetilde h(\tau)$：

$
h(\tau)=\frac1N\sum_{n=1}^{N}
\frac1{\sqrt{2\pi}\varsigma_\tau}
\exp\!\left[-\frac{(\tau-\widetilde\tau_n)^2}
{2\varsigma_\tau^2}\right]
+\widetilde h(\tau). \tag{20}
$

这里 $\widetilde r_n$ 为第 $n$ 个杂波块的中位距离，$\widetilde\tau_n=2\widetilde r_n/c$，$\varsigma_\tau$ 是杂波块的时延扩展。相应地将频率协方差分解为相干项和漫反射项：$\mathbf B_f=\overline{\mathbf B}_f+\widetilde{\mathbf B}_f$。

**引理 2：** 在杂波块近似独立时，相干部分矩阵元素为：

$
[\overline{\mathbf B}_f]_{l,m}
=\frac1N\sum_{n=1}^{N}
E_{l,m}(\widetilde r_n)
\exp[-2(\pi\Delta f(l-m)\varsigma_\tau)^2], \tag{21}
$

其中 $l,m=1,\ldots,V$，
$E_{l,m}(\widetilde r_n)=
e^{j2\pi\Delta f(2\widetilde r_n/c)(l-m)}$；
漫反射部分建模为 Toeplitz 形式：

$
\widetilde{\mathbf B}_f
=\chi\,\mathcal T
\left(1,\mu_f^{\Delta f/B_{\rm cho}},\ldots,
\mu_f^{(V-1)\Delta f/B_{\rm cho}}\right). \tag{22}
$

**证明：** 相干部分的计算与引理 1 相同。对于漫反射部分，假设 $\widetilde h(\tau)$ 沿时延 $\tau$ 的变化遵循一阶自回归（AR1）结构，因此对应的 $\widetilde{\mathbf B}_f$ 为 Toeplitz 矩阵 [45]。参数 $\mu_f<1$ 表示相关衰减程度，$B_{\rm cho}$ 是相干带宽，$\chi$ 是漫反射杂波相对于相干杂波的功率系数。

### C. 对不可分离杂波的鲁棒性

上述 Kronecker 可分离假设提供了便于处理的数学杂波模型，并允许按维度高效运算。然而，真实环境中杂波块存在不均匀性、系统校准误差，或杂波本身具有非平稳性，都可能造成不同维度之间的耦合。因此，引入可控的偏离程度，以检验所提雷达处理方法对不可分离杂波的鲁棒性。

具体而言，杂波协方差改为可分离的名义部分与扰动部分的线性组合，堆叠的杂波向量服从：

$
\mathbf c\sim\mathcal{CN}
\left(\mathbf0,(1-\epsilon)\delta_{\rm cl}^2\mathbf B
+\epsilon\mathbf Z\right). \tag{23}
$

其中 $\epsilon$ 表示杂波的不可分离程度。扰动矩阵仍单独表示为 $\mathbf Z=\mathbf Z_{\rm sp}\otimes\mathbf Z_t\otimes\mathbf Z_f$。这样能继续高效生成样本，但因一般有 $(\mathbf A\otimes\mathbf B)+(\mathbf C\otimes\mathbf D)\neq(\mathbf A+\mathbf C)\otimes(\mathbf B+\mathbf D)$，整体协方差已不再可分离。

$\mathbf Z$ 的每个因子，都在相应名义协方差因子上施加特征向量旋转及特征值扰动，从而分别研究功率分布失配与子空间结构失配的影响。以时间因子为例：

$
\mathbf Z_t=\boldsymbol\Pi_t\mathbf U_t
(\boldsymbol\Sigma_t+\eta_{\rm val}\widetilde{\boldsymbol\Sigma}_t)
\mathbf U_t^H\boldsymbol\Pi_t^H\in\mathbb C^{I\times I}. \tag{24}
$

其中 $\mathbf U_t,\boldsymbol\Sigma_t$ 是名义时间协方差的特征分解结果，$\eta_{\rm val}$ 表示特征值扰动强度，$\widetilde{\boldsymbol\Sigma}_t$ 是由具有单位方差的复高斯随机变量构成对角项的矩阵；特征向量旋转矩阵取
$\boldsymbol\Pi_t=\exp(\eta_{\rm vec}\widetilde{\boldsymbol\Pi})$，
其中 $\widetilde{\boldsymbol\Pi}$ 为斜厄米矩阵，$\eta_{\rm vec}$ 控制特征向量旋转强度。空间和频率因子的构造同理。

## IV. 通信信道估计

下面针对通信信道构造估计器。根据第 II 节假设，UE 可即时向发射端反馈信道信息，使基站除接收端 CSI（CSIR）外也能得到所估计的发射端 CSI（CSIT）。这有利于专门分析已知时间相关性相对于块衰落假设的收益，而无需显式建模反馈机制。在实际系统中，可通过紧接下行导频后安排额外上行导频时隙提供 CSIT [46]；在 UE 移动速度适中时，上行与下行估计的变化轨迹将非常相似。该反馈机制的具体实现留待未来研究。另外假设 UE 信道的时空协方差矩阵已知。

UE 的导频矩阵记为 $\mathbf P\in\mathbb C^{S\times\tau_p}$，每个相干块利用 $\tau_p$ 个子载波估计 UE 信道。假设在导频传输期间，同一相干块内所有子载波共用同一预编码矩阵，因此本小节省略子载波索引，推导任意相干块的估计器。考虑任意导频时隙 $\iota$，UE 在用于信道估计的全部 $\tau_p$ 个子载波上接收：

$
\mathbf Y_\iota
=\alpha_{\rm UE}\mathbf H_\iota\mathbf F_\iota
\mathbf P_\iota\mathbf P+\mathbf N_\iota
\in\mathbb C^{M_{\rm UE}\times\tau_p}. \tag{25}
$

其中 $\mathbf N_\iota=[\mathbf n_{\iota,1},\ldots,
\mathbf n_{\iota,\tau_p}]$。为了正确消除导频，要求
$\mathbf P\mathbf P^H=\tau_p\mathbf I_S$，当 $\tau_p\ge S$ 时可以实现。信道估计阶段采用预编码传输以降低最短导频长度；若不进行预编码则必须满足 $\tau_p\ge M_{\rm BS}$ [47]。

UE 对观测解扩，令
$\widetilde{\mathbf Y}_\iota
=\mathbf Y_\iota\mathbf P^H/\sqrt{\tau_p}
=\alpha_{\rm UE}\sqrt{\tau_p}\mathbf H_\iota\mathbf F_\iota\mathbf P_\iota
+\widetilde{\mathbf N}_\iota$。将其向量化：

$
\widetilde{\mathbf y}_\iota
=\operatorname{vec}(\widetilde{\mathbf Y}_\iota)
=\alpha_{\rm UE}\sqrt{\tau_p}
\breve{\mathbf F}_\iota\mathbf h_\iota+
\widetilde{\mathbf n}_\iota
\in\mathbb C^{SM_{\rm UE}}, \tag{26}
$

其中
$\breve{\mathbf F}_\iota=(\mathbf F_\iota\mathbf P_\iota)^\top
\otimes\mathbf I_{M_{\rm UE}}$
以及 $\widetilde{\mathbf n}_\iota=\operatorname{vec}(\widetilde{\mathbf N}_\iota)$。

为了估计数据时隙 $i$ 的信道，接收机可以利用最近导频以前的多次观测。假设除了最近一次导频，还使用之前 $p$ 次导频，即总观测数 $p_{\rm tot}=p+1$。将全部观测堆叠为
$\widetilde{\mathbf y}_{p_{\rm tot}}
=[\widetilde{\mathbf y}_\iota^\top,\ldots,
\widetilde{\mathbf y}_{\iota-(p_{\rm tot}-1)(\Delta+1)}^\top]^\top$。
以下引理给出 $i$ 时隙的信道估计。

**引理 3：** 给定导频间隔 $\Delta$，$\mathbf h_i$ 的 MMSE 估计为：

$
\widehat{\mathbf h}_i
=\mathbf A_i\widetilde{\mathbf y}_{p_{\rm tot}}
\in\mathbb C^{M_{\rm BS}M_{\rm UE}}. \tag{27}
$

其中：

$
\mathbf A_i=
\alpha_{\rm UE}\sqrt{\tau_p}\,
\mathbf E_i\breve{\mathbf F}_{p_{\rm tot}}^H
\boldsymbol{\mathcal A}_i^{-1}, \tag{28}
$

$
\boldsymbol{\mathcal A}_i
=\alpha_{\rm UE}^2\tau_p\,
\breve{\mathbf F}_{p_{\rm tot}}\mathbf M_i
\breve{\mathbf F}_{p_{\rm tot}}^H
+\sigma_{\rm UE}^2\mathbf I_{p_{\rm tot}SM_{\rm UE}}, \tag{29}
$

$
\breve{\mathbf F}_{p_{\rm tot}}
=\operatorname{blkdiag}\!\left(
\breve{\mathbf F}_{\iota},\ldots,
\breve{\mathbf F}_{\iota-(p_{\rm tot}-1)(\Delta+1)}
\right), \tag{30}
$

$
\mathbf E_i=
[\zeta(\bar i),\ldots,
\zeta(\bar i+(p_{\rm tot}-1)(\Delta+1))]\otimes\mathbf C, \tag{31}
$

$
\mathbf M_i
=\mathcal T([\zeta(0),\ldots,
\zeta((p_{\rm tot}-1)(\Delta+1))])\otimes\mathbf C, \tag{32}
$

其中 $\bar i=i-\iota$ 表示当前数据时隙与最近导频时隙的差。为避免原文中相同的字母同时用于估计滤波矩阵与观测协方差，这里将式（29）的观测协方差记为 $\boldsymbol{\mathcal A}_i$，其含义与原文一致。

**证明：** 将全部导频观测合并写成：

$
\widetilde{\mathbf y}_{p_{\rm tot}}
=\alpha_{\rm UE}\sqrt{\tau_p}\,
\breve{\mathbf F}_{p_{\rm tot}}\mathbf h_{p_{\rm tot}}
+\mathbf n_{p_{\rm tot}}
\in\mathbb C^{SM_{\rm UE}p_{\rm tot}}, \tag{33}
$

其中：

$
\mathbf h_{p_{\rm tot}}
=[\mathbf h_\iota^\top,\ldots,
\mathbf h_{\iota-(p_{\rm tot}-1)(\Delta+1)}^\top]^\top,
\tag{34}
$

$
\mathbf n_{p_{\rm tot}}
=[\mathbf n_\iota^\top,\ldots,
\mathbf n_{\iota-(p_{\rm tot}-1)(\Delta+1)}^\top]^\top.
\tag{35}
$

MMSE 估计器的典型形式 [48] 为：

$
\widehat{\mathbf h}_i
=\mathbb E[\mathbf h_i\widetilde{\mathbf y}_{p_{\rm tot}}^H]
\left(\mathbb E[\widetilde{\mathbf y}_{p_{\rm tot}}
\widetilde{\mathbf y}_{p_{\rm tot}}^H]\right)^{-1}
\widetilde{\mathbf y}_{p_{\rm tot}}. \tag{36}
$

利用已知时间相关结构 [49]，计算两个期望分别得到
$\alpha_{\rm UE}\sqrt{\tau_p}\,\mathbf E_i\breve{\mathbf F}_{p_{\rm tot}}^H$ 和 $\boldsymbol{\mathcal A}_i$。代回式（36）即可得到引理。

下面进一步刻画估计量的概率分布。

**推论 1：** 信道估计 $\widehat{\mathbf h}_i$ 服从零均值圆对称复高斯分布 $\widehat{\mathbf h}_i\sim\mathcal{CN}(\mathbf0,\widehat{\boldsymbol\Xi}_i)$，其中：

$
\widehat{\boldsymbol\Xi}_i=
\alpha_{\rm UE}^2\tau_p\,
\mathbf E_i\breve{\mathbf F}_{p_{\rm tot}}^H
\boldsymbol{\mathcal A}_i^{-1}
\breve{\mathbf F}_{p_{\rm tot}}\mathbf E_i^H.
$

**推论 2：** 信道估计误差 $\widetilde{\mathbf h}_i
=\widehat{\mathbf h}_i-\mathbf h_i$ 为零均值复高斯向量，协方差：

$
\widetilde{\boldsymbol\Xi}_i
=\mathbf C-\widehat{\boldsymbol\Xi}_i
\in\mathbb C^{M_{\rm BS}M_{\rm UE}\times
M_{\rm BS}M_{\rm UE}}.
$

该估计器能够自然扩展到在子载波维度也采用 AR 老化结构的场景。若时频老化可以分离，可沿用引理 3 基于协方差的推导，得到同时适用于时间和频率上稀疏导频模式的扩展估计器。

## V. 雷达信号处理

本节介绍杂波估计与抑制流程。由感知观测出发，基站首先估计杂波二阶统计量并利用它抑制杂波，然后计算距离—角度（RA）和距离—速度（RV）图。这些图用于表示感知性能，后续可以在其上执行检测与参数估计。

第一步利用杂波在各维度的稀疏结构估计二阶统计量；第二步使用感知杂波的匹配滤波（MF）消除发射符号影响；最后利用处理后的数据计算每条数据流的 RA 与 RV 图。由于假设目标缓慢变化，使用 $I$ 个时隙执行雷达处理。本文仅通过这些图评估杂波抑制能力和目标可辨识性。目标峰的位置、幅度和尖锐程度可作为检测及估计效果的指示，但不能替代正式的检测器或参数估计器；相关数学推导留待未来工作。

*原文注：为便于数学处理，假设散射块数量 $N$、杂波功率 $\delta_{\rm cl}^2$ 以及 $\varsigma_{\rm sp},\varsigma_D,\varsigma_\tau$ 已知。这些量可从不含目标的距离—多普勒单元可靠估计，因此作者认为该假设不影响处理流程的实际适用性。*

### A. 杂波协方差估计器

Kronecker 可分离模型的一项优势是能够分别估计不同维度的协方差，降低总体计算复杂度。由于各协方差分量具有稀疏结构，可采用 MUSIC（MUltiple SIgnal Classification，多重信号分类）[50] 等子空间方法高效估计二阶统计量。

雷达文献通常将感知观测收集成数据立方体
$\mathbf Y=\{[\mathbf y_{1,v},\ldots,\mathbf y_{I,v}]\}_{v=1}^V
\in\mathbb C^{M_{\rm BS}\times I\times V}$。
通常接下来应使用恒虚警率（CFAR）掩膜 [51] 或 GoDec [52] 等目标清除方法，从数据中删除目标分量，避免将目标识别为杂波。

不过，在这里的模型下，杂波子空间主导样本协方差。这是因为目标可视为点目标，而杂波在空间和时间上均有扩展，在多个距离—多普勒单元中具有更高的功率 [53]。目标仅表现为小的秩一扰动，而 MUSIC 对这类扰动较为鲁棒 [54]。因此，作者不使用显式目标清除也能够估计杂波协方差；但在非均匀杂波、扩展目标等更复杂场景中，目标清除仍然必要。

空间样本协方差为：

$
\overline{\mathbf B}_{\rm sp}=
\frac{\mathcal U_1(\mathbf Y)\mathcal U_1(\mathbf Y)^H}{IV}
-\sigma^2\mathbf I_{M_{\rm BS}}
\in\mathbb C^{M_{\rm BS}\times M_{\rm BS}}. \tag{37}
$

之后计算 MUSIC 伪谱
$P_{\rm sp}(\psi)=1/[\mathbf a(\psi)^H
\boldsymbol\Gamma_{\rm sp}\boldsymbol\Gamma_{\rm sp}^H\mathbf a(\psi)]$，
其中 $\boldsymbol\Gamma_{\rm sp}$ 包含空间样本协方差最小的 $M_{\rm BS}-L$ 个特征值对应的噪声子空间特征向量。伪谱峰值给出各杂波块方向估计 $\widehat\psi_n$，将其代入式（14）得到估计空间协方差 $\widehat{\mathbf B}_{\rm sp}$。

时间样本协方差同理：

$
\overline{\mathbf B}_t
=\frac{\mathcal U_2(\mathbf Y)\mathcal U_2(\mathbf Y)^H}
{M_{\rm BS}V}-\sigma^2\mathbf I_I
\in\mathbb C^{I\times I}. \tag{38}
$

计算时间 MUSIC 伪谱
$P_t(f_D)=1/[\mathbf b(f_D)^H
\boldsymbol\Gamma_t\boldsymbol\Gamma_t^H\mathbf b(f_D)]$。
其峰值代入式（17），得到 $\widehat{\mathbf B}_t$。

频率样本协方差为：

$
\overline{\mathbf B}_f=
\frac{\mathcal U_3(\mathbf Y)\mathcal U_3(\mathbf Y)^H}
{M_{\rm BS}I}-\sigma^2\mathbf I_V
\in\mathbb C^{V\times V}. \tag{39}
$

散射块中位距离同样可通过 MUSIC 估计。不过，漫反射成分 $\widetilde{\mathbf B}_f$ 破坏 MUSIC 所需的子空间正交条件。因此作者采用不显式考虑扩散的估计方法，并在数值实验中量化 $\widetilde{\mathbf B}_f$ 引起的性能损失。频率 MUSIC 伪谱为：

$
P_f(r)=\frac1{
\mathbf d(2r/c)^H
\boldsymbol\Gamma_f\boldsymbol\Gamma_f^H
\mathbf d(2r/c)}.
$

### B. 感知杂波的匹配滤波

接下来执行匹配滤波，消除发射符号对雷达信道估计的影响。将式（9）中的无噪、无杂波观测写为
$\boldsymbol\mu_{i,v}=\boldsymbol\Phi_{i,v}\mathbf x_{i,v}$，
其中 $\boldsymbol\Phi_{i,v}=
[\boldsymbol\phi_{i,v,1},\ldots,\boldsymbol\phi_{i,v,S}]
\in\mathbb C^{M_{\rm BS}\times S}$ 是经过预编码的雷达信道：

$
\boldsymbol\Phi_{i,v}=
[\mathbf G_{i,v}\mathbf f_{i,v,1}\sqrt{\rho_{i,v,1}},
\ldots,
\mathbf G_{i,v}\mathbf f_{i,v,S}\sqrt{\rho_{i,v,S}}]. \tag{40}
$

由 $\boldsymbol\mu_{i,v}$ 的结构可知，直接将 $\mathbf y_{i,v}$ 右乘 $\mathbf x_{i,v}^{\dagger}$ 即可执行 MF，但这不会抑制杂波。由于杂波具有低秩结构，可通过白化减少其影响 [55]、[56]。具体地，对感知数据立方体 $\mathbf Y$ 和符号立方体 $\mathbf X$ 分别沿时间、频率维度进行白化；**不对白化空间维度**，以防误将目标信号一同消除。

白化矩阵由校正了接收机噪声的协方差矩阵的逆平方根定义：

$
\ddot{\mathbf B}_t^{-1/2}
=\widehat{\mathbf U}_t
(\widehat{\boldsymbol\Sigma}_t+\sigma^2\mathbf I_I)^{-1/2}
\widehat{\mathbf U}_t^H, \tag{41}
$

$
\ddot{\mathbf B}_f^{-1/2}
=\widehat{\mathbf U}_f
(\widehat{\boldsymbol\Sigma}_f+\sigma^2\mathbf I_V)^{-1/2}
\widehat{\mathbf U}_f^H. \tag{42}
$

其中 $\widehat{\mathbf U}_t,\widehat{\boldsymbol\Sigma}_t$ 和
$\widehat{\mathbf U}_f,\widehat{\boldsymbol\Sigma}_f$ 分别为估计的时间、频率协方差因子的特征分解结果。借助可分离结构，两个维度可分别白化：

$
\mathbf Y'=\mathcal F_2\!\left[
\mathcal U_2(\mathbf Y)\ddot{\mathbf B}_t^{-1/2}\right],
\qquad
\mathbf Y''=\mathcal F_3\!\left[
\mathcal U_3(\mathbf Y')\ddot{\mathbf B}_f^{-1/2}\right]. \tag{43}
$

对符号立方体 $\mathbf X$ 执行同样步骤得到 $\mathbf X''$，再估计预编码雷达信道：

$
\widehat{\boldsymbol\Phi}_{i,v}
=[\widehat{\boldsymbol\phi}_{i,v,1},\ldots,
\widehat{\boldsymbol\phi}_{i,v,S}]
=\{\mathbf Y''\}_{i,v}\{\mathbf X''\}_{i,v}^{\dagger}.
$

### C. 距离—角度及距离—速度图

杂波抑制后，计算 RA 和 RV 图。图中的峰值指示目标角度、距离和速度，但本文并不执行显式参数估计。

首先沿频率维度对估计雷达信道执行离散傅里叶变换（DFT）得到距离轮廓。第 $v'$ 个距离单元的轮廓为：

$
\mathbf r_{i,v',s}
=\sum_{v=1}^{V}
e^{-j2\pi vv'/V'}\,\widehat{\boldsymbol\phi}_{i,v,s}
\in\mathbb C^{M_{\rm BS}}. \tag{44}
$

其中 $v'=1,\ldots,V'$，$V'\ge V$ 允许零填充，对应的时延量化分辨率为 $1/(\Delta f V')$。再对每个距离单元采用 MUSIC 估计角度轮廓。其样本协方差为：

$
\mathbf Q_{v',s}=\frac1I\sum_{i=1}^{I}
\mathbf r_{i,v',s}\mathbf r_{i,v',s}^H
\in\mathbb C^{M_{\rm BS}\times M_{\rm BS}}. \tag{45}
$

设 $\boldsymbol\Gamma_{v',s}$ 为 $\mathbf Q_{v',s}$ 的噪声子空间，则角度轮廓
$P_{s,v'}(\theta)=1/[
\mathbf a(\theta)^H\boldsymbol\Gamma_{v',s}
\boldsymbol\Gamma_{v',s}^H\mathbf a(\theta)]$。

为获得每个距离单元的速度轮廓，先将距离轮廓投影到该单元中 MUSIC 功率最大的角度 $\theta_{v'}^M$，随后沿时间维度执行逆 DFT：

$
q_{i',v',s}=\sum_{i=1}^{I}
e^{j2\pi ii'/I'}
\mathbf a(\theta_{v'}^M)^H\mathbf r_{i,v',s}. \tag{46}
$

将所有 $q_{i',v',s}$ 收集成矩阵，得到第 $s$ 条数据流的 RV 图
$\mathbf V_s\in\mathbb C^{I'\times V'}$，其中 $I'\ge I$ 表示时间维度的零填充。

**待补：** 第 VI 节预编码策略、第 VII 节完整数值结果、参考文献。

{% endraw %}
