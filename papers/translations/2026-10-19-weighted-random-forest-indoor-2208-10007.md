---
layout: page
title: "基于加权随机森林的 6G 室内定位算法｜中文全文译稿"
permalink: /papers/translations/2026-10-19-weighted-random-forest-indoor-2208-10007/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/fd1f49fccc8f85b4/) · [arXiv 原文](https://arxiv.org/abs/2208.10007) · [原始 PDF](https://arxiv.org/pdf/2208.10007v1)

# 基于加权随机森林的 6G 室内定位算法

**原题：** A Weighted Random Forest Based Positioning Algorithm for 6G Indoor Communications  
**作者：** Yang Wu、Yinghua Wang、Jie Huang、Cheng-Xiang Wang、Chen Huang  
**作者单位：** 东南大学信息科学与工程学院移动通信国家重点实验室；紫金山实验室泛在通信研究中心。通讯作者：Cheng-Xiang Wang。  
**来源：** arXiv:2208.10007v1，2022 年 8 月 22 日，原 PDF 共 6 页。  
**译文范围：** 摘要、I—V 节、式（1）—（4）、算法 1—2、图 1—6 说明、表 I—III、致谢及参考文献 [1]—[20]。译文基于用户提供的原文；保留原文的论证、数值与表述，不代表译者认可全部论断。

## 摘要

由于室内非视距（non-line-of-sight，NLoS）传播和多址干扰（multi-access interference，MAI）的存在，在室内场景实现厘米级定位精度面临巨大挑战。不过，第六代（6G）无线通信为厘米级定位提供了良好机遇。6G 中的毫米波（millimeter wave，mmWave）和太赫兹（terahertz，THz）通信具有超宽带宽，使信道状态信息（channel state information，CSI）拥有较高分辨率。本文提出一种基于加权随机森林（weighted random forest，WRF）的室内定位算法，采用从 CSI 中提取的信道指纹特征，在 6G 室内通信场景实现高精度定位。此外，使用射线追踪（ray tracing，RT）提升信道指纹数据库的构建效率。仿真结果展示了所提算法的准确性和鲁棒性。结果表明，当信道指纹数据库的参考点间隔为 0.2 m 时，该算法在不同室内场景下的平均定位精度稳定在 6 cm 以内。

**关键词：** 6G；室内定位；信道状态信息；随机森林；射线追踪。

## I. 引言

尽管全球定位系统的持续发展使室外定位能够达到令人满意的精度，但实现高精度室内定位仍存在很大困难。建筑材料与结构引起的无线电波强衰减、复杂的室内场景以及较大的人流量，使室内环境中存在严重的 NLoS 传播和 MAI。与此同时，6G 无线通信对室内定位提出了厘米级精度和毫秒级响应时间的要求 [1], [2]。应对这些挑战主要存在以下两条技术路线。

第一条路线在本文中统称为**几何定位方法**：基于信道特征，利用几何原理估计位置。其中包括基于接收信号强度（received signal strength，RSS）的功率测量方法、基于到达时间（time of arrival，ToA）或到达时间差（time difference of arrival，TDoA）的时间测量方法，以及基于到达角（angle of arrival，AoA）的角度测量方法。这类方法通常容易受到 NLoS 和 MAI 干扰，定位精度因而降低。

第二条路线是最早由文献 [3] 提出的**指纹定位方法**（fingerprint-based positioning method，FPM）。FPM 通常分为离线与在线两个阶段：在离线阶段，通过对定位区域信号数据进行实际测量或仿真建立信道指纹数据库；在线阶段，将测得的信号数据与数据库比较，从而估计终端的实际位置。

由于 RSS 获取方便、成本低，传统 FPM 通常将其作为信道指纹特征 [4], [5]。然而，室内严重的 NLoS 传播导致 RSS 不稳定。尽管已有研究利用卡尔曼滤波等预处理方法缓解这种不稳定性 [6]，在接收信号发生剧烈波动时仍无法避免较大的误差。因此，基于 RSS 的 FPM 同样无法满足高精度定位要求。自正交频分复用（orthogonal frequency-division multiplexing，OFDM）作为 IEEE 802.11a 的物理层标准以来，CSI 可用于表征各个子载波的信道信息 [7]。作为物理层信号特征，CSI 比 RSS 具有更细的粒度和更强的稳定性，能够真实反映多径信息。不过，以往基于 CSI 的 FPM 仅直接使用其幅度和相位信息，未能充分发挥 CSI 的潜力。

在线阶段的定位算法主要包括以加权 K 近邻（weighted K-nearest neighbor，WKNN）为代表的确定性算法 [8]、以贝叶斯估计为代表的概率算法 [9]，以及近年来更受关注的机器学习（machine learning，ML）算法。贝叶斯估计的精度很大程度上取决于假设的概率分布是否符合真实数据分布。WKNN 作为一种简单的监督式 ML 算法，通常能够作出较为合理、准确的预测，但不能反映指纹与坐标之间的隐含关系，因此稳定性较差。为解决这一问题，室内定位已采用更先进的 ML 算法，例如支持向量机（support vector machine，SVM）[10]、随机森林（random forest，RF）和深度神经网络（deep neural network，DNN）[11]—[14] 等。然而，SVM 在多分类问题上表现不佳；DNN 则依赖大量样本集，训练较为困难。

RF 是一种基于决策树的集成 ML 算法，在人工智能、分类预测和数据建模等领域取得了良好的性能并受到广泛研究 [15], [16]。RF 可处理高维数据而无须删除数据或进行归一化，且训练速度较快，非常适合室内定位等多分类问题。因此，本文提出使用 CSI 信道指纹特征的 WRF 定位算法，以使定位精度与速度满足 6G 的要求。

不过，作为一种 FPM，所提算法在构建指纹数据库时仍需消耗大量人力、物力和时间。为解决这一问题，本文采用 RT。作为一种确定性建模方法，RT 能够快速且准确地获取信道参数 [17]。

综上，本文重点研究能够满足 6G 要求的高精度室内定位算法，主要贡献如下：

1. 提出基于 CSI 的信道指纹特征，并通过 RT 仿真分析和验证其可行性及优越性。
2. 提出基于 WRF 的定位算法，并通过 RT 仿真分析和验证其精度与鲁棒性。

本文其余部分安排如下：第二节简要介绍 6G 室内信道特征及 CSI 理论，并提出基于 CSI 的信道指纹特征；第三节基于 RF 和 WKNN 提出 WRF 定位算法；第四节给出 RT 仿真结果，展示所提算法的性能；第五节总结全文。

## II. 基于 CSI 的信道指纹特征

### A. 6G 室内信道特征

面向 6G 的无线信道将覆盖全频段，主要包括 sub-6 GHz、毫米波、太赫兹和光波段。本文主要关注毫米波和太赫兹频段。

毫米波与太赫兹的波长较短，与普通物体的表面粗糙度接近。因此，当电磁波入射这类表面时，除镜面反射外，还会产生大量漫散射。无论镜面反射还是漫散射，每次反射都会造成较大的损耗。因而，在毫米波和太赫兹频段，经历多次反射的路径通常难以达到接收机的最小可检测功率，与低频段相比，可到达的路径数量大幅减少。在一般室内通信场景中，透射路径的衰减十分严重，对接收信号几乎没有贡献；衍射路径也较弱。因此，毫米波与太赫兹具有较强的传播方向性，有效传播路径主要为视距（line-of-sight，LoS）路径 [18], [19]。

文献 [20] 结合毫米波与太赫兹信道特征，基于 RT 提出统一的多射线信道模型，其信道冲激响应可写为

$$
\begin{aligned}
h(t)={}&\alpha_{\rm LoS}\delta(t-\tau_{\rm LoS})I_{\rm LoS}\\
&+\sum_{p=1}^{N_{\rm Ref}}\alpha_{\rm Ref}^{(p)}
  \delta\bigl(t-\tau_{\rm Ref}^{(p)}\bigr)\\
&+\sum_{q=1}^{N_{\rm Sca}}\alpha_{\rm Sca}^{(q)}
  \delta\bigl(t-\tau_{\rm Sca}^{(q)}\bigr)\\
&+\sum_{u=1}^{N_{\rm Dif}}\alpha_{\rm Dif}^{(u)}
  \delta\bigl(t-\tau_{\rm Dif}^{(u)}\bigr).
\end{aligned}\tag{1}
$$

其中，$I_{\rm LoS}$ 为判断 LoS 路径是否存在的指示函数：存在时取 1，不存在时取 0；$\alpha_{\rm LoS}$、$\alpha_{\rm Ref}^{(p)}$、$\alpha_{\rm Sca}^{(q)}$ 和 $\alpha_{\rm Dif}^{(u)}$ 分别表示 LoS 路径、第 $p$ 条反射路径、第 $q$ 条散射路径和第 $u$ 条衍射路径的衰减幅度；相应的 $\tau_{\rm LoS}$、$\tau_{\rm Ref}^{(p)}$、$\tau_{\rm Sca}^{(q)}$ 和 $\tau_{\rm Dif}^{(u)}$ 分别表示这些路径的时延。该模型同时考虑 LoS、反射、散射和衍射路径，并已通过 0.06—1 THz 频段的实验测量验证了准确性。

对式（1）进行傅里叶变换即可得到信道频率响应（channel frequency response，CFR）；随后对其进行离散采样。原文的采样关系包含 $\tau/T_s$、取整方括号与 $k\cdot T_s$ 项，可依其主要符号近似转写为 $t=[(\tau/T_s)]+kT_s$。这里 $T_s$ 为采样间隔，原文将 $[\cdot]$ 称为取整（rounding）函数，**并未明确规定向上取整**。这样得到以 OFDM 不同子载波频率为频点的 CFR 离散采样形式，即 CSI。**原文此处的取整括号排印不规整，而且式中时间量的写法可能存在量纲问题；译文保留原始关系，不自行改成另一个采样模型。**对于 OFDM，CSI 模型表示为

$$
\mathbf Y=\mathbf H\mathbf X+\boldsymbol\zeta .\tag{2}
$$

其中 $\mathbf X$ 是发送信号向量，$\mathbf Y$ 是接收信号向量，$\boldsymbol\zeta$ 是高斯白噪声向量，$\mathbf H$ 是 CSI 矩阵。

### B. CSI 特征估计

CSI 能够表征 AoA、传播时延和路径损耗等多维信号特征。这些特征可以通过多重信号分类（multiple signal classification，MUSIC）、空间平滑（spatial smoothing，SS）等超分辨率检测算法获得。MUSIC 无法区分相干信号，而 SS 在复杂环境中也难以处理相干性问题。为克服这些缺陷，本文提出基于 CSI 的前后向空间平滑算法，联合估计 AoA 和 ToA。

### C. 最大功率路径提取

如前所述，毫米波与太赫兹信号在室内传播时损耗很大，因此接收机检测到的不同路径之间存在显著功率差异。在这种情况下，大多数到达接收机的射线对位置预测并无实质贡献。

在全部到达射线中，LoS 路径通常具有最高能量，对接收功率的贡献最大，因此对位置预测最为重要。此外，由于 LoS 传播路径不受障碍物阻挡，其功率也最符合路径损耗模型。然而，室内 NLoS 传播严重，并非每个参考点（reference point，RP）都具有 LoS 路径。因此本文提出使用**最大功率路径**（maximum power，MP path）。在室内毫米波与太赫兹通信场景中，多数 RP 的 MP 路径就是 LoS 路径。即使 MP 路径为 NLoS，由于毫米波与太赫兹的传播特征，它通常也只经历低阶反射或衍射，因此功率损耗仍处于可接受范围。与总 RSS 相比，MP 路径的 RSS 因而能够更好地符合信道传播损耗模型，如图 1 所示。

此外，与 RSS 相比，AoA 和 ToA 具有更高的稳定性，有助于提高指纹特征的可区分性。因此，本文将接收端 MP 路径的 RSS、AoA 和 ToA 组合为信道指纹特征，即基于 CSI 的信道指纹特征。这不仅提高了不同 RP 的指纹准确性及区分度，也减少了冗余信息，降低了定位算法的负担。

**图 1.** 发射机位于 (0, 0) 时，RSS 的空间分布：（a）总 RSS；（b）MP 路径 RSS。

### D. 信道指纹数据库结构

如图 2 所示，本文将信道指纹数据库组织为名为 fingerprintBase 的结构，包含三个元素：Fingerprint、Coordinate 和 SN。SN 为接入点（access point，AP）编号，是一个 $1\times n$ 向量，$n$ 为有效 AP 的数量；Coordinate 为 RP 坐标，是一个 $N\times2$ 矩阵，$N$ 为有效 RP 数量；Fingerprint 为基于 CSI 的信道指纹特征，是一个 $N\times4n$ 矩阵，包含 RSS、方位到达角（azimuth AoA，AAoA）、俯仰到达角（elevation AoA，EAoA）以及 ToA。特别需要注意，为适应后续定位算法，应在笛卡尔坐标系中沿垂直于坐标轴的方向将定位区域划分为网格，并将 RP 置于网格交点处。

**图 2.** fingerprintBase 的构建流程与结构：采集 CSI → 估计 CSI 并选择 MP 路径 → 提取 RSS、AAoA、EAoA 和 ToA → 与坐标、AP 编号共同组成指纹数据库。

## III. 加权随机森林定位算法

### A. 加权预测

RF 选取决策树中获得票数最多的结果作为预测输出。相似度越高，获得的票数越多，因此 RF 对 RP 具有较强依赖性。信道指纹数据库中不可避免地存在大量相似 RP，但只选取最相似的一个 RP 显然不够全面：这样会忽略其他 RP 对定位结果的影响，造成较大定位误差。

因此本文提出 WRF 算法。WRF 借鉴 WKNN 的思想：选择最相似的 $K$ 个 RP，以相似距离的倒数作为权重预测终端坐标。在线阶段，将测试点（test point，TP）提取的指纹特征输入训练好的 RF 模型；此时模型不再仅输出一个预测坐标，而是输出得分 $S$ 最高的 $K$ 个 RP 坐标。得分 $S$ 越高，该 RP 对估计结果的影响越大，因此最终预测坐标由 $K$ 个坐标按得分加权求得：

$$
(x,y)_{\rm TP}=
\frac{\displaystyle\sum_{k=1}^{K}(x_k,y_k)S_k}
{\displaystyle\sum_{k=1}^{K}S_k}.\tag{3}
$$

### B. 坐标分离

联合估计坐标虽然考虑到了不同 RP 指纹的独特性，却忽略了 RP 之间信号特征的相似性。为进一步利用这种相似性，在离线阶段，将 RP 的横坐标 $x$ 与纵坐标 $y$ 分别作为标签训练，得到模型 $M^x$ 和 $M^y$。在线阶段，将 TP 的信道指纹特征分别输入两模型，输出得分最高的 $K$ 个横坐标及纵坐标，再代入式（3）：

$$
x_{\rm TP}=
\frac{\displaystyle\sum_{k=1}^{K}x_kS^x_k}
{\displaystyle\sum_{k=1}^{K}S^x_k},
\tag{4a}
$$

$$
y_{\rm TP}=
\frac{\displaystyle\sum_{k=1}^{K}y_kS^y_k}
{\displaystyle\sum_{k=1}^{K}S^y_k}.
\tag{4b}
$$

WRF 的训练和估计过程分别见算法 1 和算法 2。

**算法 1：WRF 训练**

输入：（1）训练样本集 $T\subset{\rm Fingerprint}$；（2）标签集 $L^x,L^y\subset{\rm Coordinate}$；（3）决策树数量 $N$。输出：RF 分类器 $M^x,M^y$。

1. 对标签集 $L\in\{L^x,L^y\}$ 逐一执行训练；将 RF 分类器 Model 初始化为空。
2. 从 $T$ 随机选择 $N$ 个子训练集 $ST$。
3. 对 $n=1,\ldots,N$，将决策树 $D(n)$ 初始化为空，并从 Fingerprint 随机选择特征集合 $F$。
4. 进入递归函数 TREEGENERATE$(ST,F)$，创建一个节点。
5. 如果 $ST$ 中所有样本均属于标签 $L$ 中的类别 $l$，则将该节点标记为类别 $l$ 的叶节点，将其并入 $D(n)$ 后返回。
6. 如果 $ST$ 为空，或所有样本在 $F$ 上均具有相同特征值，则将节点标记为 $ST$ 中样本最多的类别的叶节点，并入 $D(n)$ 后返回。
7. 根据基尼指数（Gini index）从 $F$ 中选择最优特征 $f$ 及其特征值 $f^\ast$。
8. 将 $ST$ 中在特征 $f$ 上取值为 $f^\ast$ 的样本分配至分支 $D_1$，其余样本分配至 $D_2$；递归调用 TREEGENERATE$(D_1,F)$ 和 TREEGENERATE$(D_2,F)$。
9. 完成决策树生成后，将 $D(n)$ 加入模型 $M$；对 $N$ 棵树重复以上过程。
10. 若当前标签为 $x$ 坐标，则将模型存为 $M^x$，否则存为 $M^y$；两种标签训练结束后返回 $(M^x,M^y)$。

*算法中的叶节点终止规则、基尼指数选特征和两路分支定义依照原文逐步译出；原算法第 26 行将横坐标标签写作 X，语义对应 $L^x$。*

**算法 2：WRF 位置估计**

输入：（1）RF 分类器 $M^x,M^y$；（2）测试样本集 $T\subset{\rm testFingerprint}$。输出：预测坐标 $(x_{\rm TP},y_{\rm TP})$。

1. 对 $M\in\{M^x,M^y\}$ 逐一执行预测。
2. 进入 RFPREDICT$(M,T)$：对于 $n=1,\ldots,N$，计算第 $n$ 棵决策树 $D(n)$ 的预测 $p_n$。
3. 汇总投票结果，得到得分及位置：$[S,P]={\rm Vote}[p_1,\ldots,p_N]$。
4. 选取最高的 $K$ 个得分 $S$ 及其对应位置 $P$。
5. 若 $M=M^x$，令 $x=P$，根据式（4a）计算 $x_{\rm TP}$；否则令 $y=P$，根据式（4b）计算 $y_{\rm TP}$。
6. 完成两个坐标方向的预测后，返回 $(x_{\rm TP},y_{\rm TP})$。

### C. 所提定位算法的总体框架

结合第二节提出的 CSI 指纹特征与本节的 WRF 算法，完整定位流程如图 3 所示：

1. 采集离线 RP 与在线 TP 的 CSI；RP 位于笛卡尔坐标系中网格的交点处。
2. 提取基于 CSI 的信道指纹特征。
3. 构建信道指纹数据库。
4. 将 RP 坐标拆分为 $x$ 和 $y$，与信道指纹特征一起输入 RF 训练，得到 $M^x$ 与 $M^y$。
5. 将在线 TP 的指纹特征输入 $M^x$ 与 $M^y$ 进行加权预测，输出 TP 的最终坐标。

**图 3.** 所提定位算法框架。离线分支负责网格化、RP 的 CSI 采集、特征提取、指纹数据库构建、坐标分离及 WRF 训练；在线分支负责随机采集 TP 的 CSI、特征提取以及 WRF 坐标预测。

## IV. RT 仿真结果分析

### A. 仿真参数设置

使用商业软件 Wireless InSite® 构建室内场景并仿真信道参数。设置两个不同的室内场景：场景 1 面积为 $16\ {\rm m}\times15\ {\rm m}$，场景 2 面积为 $8\ {\rm m}\times6\ {\rm m}$，如图 4 所示。仿真参数见表 I。值得说明的是，仿真中反射阶数限制为 6，衍射阶数限制为 1；这一设置涵盖了真实环境中能够被检测到的射线中相当合理的一部分。

**图 4.** 仿真场景：（a）场景 1；（b）场景 2。

**表 I　仿真参数**

| 参数 | 数值 |
|---|---|
| RP 高度 | 1.5 m |
| AP 高度 | 2.8 m |
| 场景 1 的 AP 位置 | (−7.64 m, −6.72 m)、(7.72 m, −7.54 m) |
| 场景 2 的 AP 位置 | (0.18 m, 0.20 m)、(7.70 m, 5.78 m) |
| 频率 | 60 GHz |
| 带宽 | 3 GHz |
| RP 天线 | 单根全向天线 |
| AP 天线 | MIMO 全向天线 |
| 反射阶数 | 6 |
| 衍射阶数 | 1 |

### B. 基于 CSI 的信道指纹特征的性能评价

本小节使用间隔为 0.2 m 的参考网格构建指纹数据库，并在在线阶段利用 WKNN 估计 TP 坐标。收集的指纹特征分别为 RSS、RSS + AoA 以及本文提出的基于 CSI 的信道指纹特征。使用误差累积分布函数（cumulative distribution function，CDF）表示的仿真结果如图 5 所示。

可以看到，传统 RSS 指纹的定位误差落在 1 m 以内的概率只有 10%。增加 AoA 作为指纹特征后，精度显著提高。进一步地，所提 CSI 指纹的最大误差仅为 0.7 m，平均误差在 7 cm 以内，达到厘米级。这是因为所提 CSI 指纹提取了 RP 的更细粒度信号特征，并充分利用多径信息。因此，它能够有效抵抗 NLoS 传播与 MAI 的影响，显著提高定位精度。

**图 5.** 不同指纹特征对应的定位误差 CDF，曲线分别为 RSS、RSS + AoA、所提新型 CSI 特征。

### C. WRF 算法的性能评价

将场景 1、2 按 0.2 m 间隔划分为网格，采集所提 CSI 指纹特征构建数据库，并将 WRF 决策树数量设置为 100。随后与 RF [16] 和 WKNN [8] 比较，以验证 WRF 定位算法的性能与鲁棒性。仿真结果见图 6 和表 II。

**图 6.** 参考网格间隔为 0.2 m 时，不同算法定位误差的 CDF：（a）场景 1；（b）场景 2。

**表 II　场景 1 中参考网格间隔为 0.2 m 时的算法性能**

| 算法 | 最小误差 (m) | 最大误差 (m) | 平均误差 (m) | 训练时间 (s) | 定位时间 (s) |
|---|---:|---:|---:|---:|---:|
| WKNN | 0.0075 | 0.7002 | 0.0643 | — | 0.30 |
| RF | 0.0253 | 0.3796 | 0.0961 | 146.07 | 0.81 |
| WRF | **0.0018** | **0.3094** | **0.0552** | **23.64** | **0.74** |

**表 III　不同网格尺寸下各算法的定位时间**

| 网格尺寸 | WKNN | RF | WRF |
|---|---:|---:|---:|
| $1\,{\rm m}\times1\,{\rm m}$ | 0.08 s | 0.28 s | 0.27 s |
| $0.2\,{\rm m}\times0.2\,{\rm m}$ | 0.30 s | 0.81 s | 0.74 s |

可以看到，无论场景 1 还是场景 2，WRF 的定位误差均小于 WKNN 与 RF。尽管 WRF 的误差 CDF 与 WKNN 前 80% 的部分相近，但在场景 1 中 WRF 最大误差仅为 0.3 m，远小于 WKNN 的 0.7 m，因此 WRF 比 WKNN 稳定得多。此外，WRF 的平均误差也最小，约为 5.5 cm，达到厘米级。

从定位时间来看，WRF 虽然慢于 WKNN，却仍实现了毫秒级定位，且快于 RF；其训练时间尤其大幅缩短。需要注意，表 II 中给出的训练和定位时间对应 **100 个 TP**。另外，WRF 基于训练好的模型估计 TP 坐标，因此数据库容量增加时定位时间变化较小。而作者对表 III 的解释更进一步，称 WKNN 在线定位时间会随数据库规模增加而“指数增长”，因此两者的定位时间差距将逐渐缩小。**校对注：**这是原文的复杂度增长判断；表 III 仅比较两种网格尺寸的时间，尚不足以单独证明指数增长规律。

## V. 结论

本文提出一种面向 6G 室内通信的基于 CSI 的 WRF 定位算法，并通过 RT 仿真验证了性能。结果表明，该算法最大误差在 0.3 m 以内，平均误差在 6 cm 以内，单点定位时间在 10 ms 以内，展示了较高的准确性、稳定性和响应速度。因此，所提算法能够满足 6G 室内定位对厘米级定位精度与毫秒级响应时间的要求。

未来将对在线 TP 进行实际测量，进一步评价所提算法。

## 致谢

本研究获得以下项目支持：中国国家重点研发计划（2018YFB1801101）；国家自然科学基金（61960206006、61901109）；移动信息通信与安全前沿科学中心；江苏省高层次创新创业研究团队计划；江苏省高层次创新创业人才引进计划；东南大学移动通信国家重点实验室研究基金（2021B02）；欧盟 H2020 RISE TESTBED2 项目（872172）；江苏省高层次创新创业博士引进计划（JSSCBS20210082）；中央高校基本科研业务费（2242022R10067）；中国博士后科学基金（2021M702499）及江苏省优秀博士后计划。

## 参考文献

参考文献编号、作者、来源、年份及页码保持原文；英文题名同时给出中文译意。

[1] X.-H. You, C.-X. Wang, J. Huang 等，《迈向 6G 无线通信网络：愿景、关键技术与新范式转变》，*Science China Information Sciences*，64(1)，2021，DOI: 10.1007/s11432-020-2955-6。原题：Towards 6G wireless communication networks: Vision, enabling technologies, and new paradigm shifts.

[2] C.-X. Wang, J. Bian, J. Sun, W. Zhang, M. Zhang，《5G 信道测量与模型综述》，*IEEE Communications Surveys & Tutorials*，20(4)，3142—3168，2018。原题：A survey of 5G channel measurements and models.

[3] P. Bahl, V. N. Padmanabhan，《RADAR：基于室内射频的用户定位与跟踪系统》，*IEEE INFOCOM*，特拉维夫，775—784，2000。原题：RADAR: an in-building RF-based user location and tracking system.

[4] M. Zhou, X.-Y. Li, Y. Wang, W. Nie，《通过高斯核密度估计实现基于 6G 多源信息融合的室内定位》，*IEEE Internet of Things Journal*，8(20)，15117—15125，2021。原题：6G multisource-information-fusion-based indoor positioning via Gaussian kernel density estimation.

[5] D. Sun, Y.-N. Zhang, W.-W. Xia 等，《基于 AoA 与 RSSI 加权指纹特征匹配的 BLE 室内定位算法》，*WCSP*，长沙，1—6，2021。原题：A BLE indoor positioning algorithm based on weighted fingerprint feature matching using AoA and RSSI.

[6] S. Huang, K. Zhao, Z.-Q. Zheng, W.-W. Ji, T.-Y. Li, X.-F. Liao，《使用卡尔曼滤波和泛克里金的优化指纹定位方法及其 5G 物联网应用》，*Wireless Communications and Mobile Computing*，2021，文章 9936706。原题：An optimized fingerprinting-based indoor positioning with Kalman filter and universal kriging for 5G internet of things.

[7] K.-S. Wu, J. Xiao, Y.-W. Yi, M. Gao, L. M. Ni，《FILA：细粒度室内定位》，*IEEE INFOCOM*，奥兰多，2210—2218，2012。原题：FILA: Fine-grained indoor localization.

[8] J. T. Sospedra, R. Montoliu, S. Trilles, Ó. Belmonte, J. Huerta，《Wi-Fi 指纹室内定位系统距离与相似度测度的全面分析》，*Expert Systems with Applications*，42(23)，9263—9278，2015。原题：Comprehensive analysis of distance and similarity measures for Wi-Fi fingerprinting indoor positioning systems.

[9] N. Le Dortz, F. Gain, P. Zetterberg，《采用概率分布比较的 Wi-Fi 指纹室内定位系统》，*ICASSP*，京都，2301—2304，2012。原题：WiFi fingerprint indoor positioning system using probability distribution comparison.

[10] F. Yu, M.-H. Jiang, J. Liang 等，《基于支持向量机的 Wi-Fi 室内定位》，*Advanced Materials Research*，926，2438—2441，2014。原题：An indoor localization of WiFi based on support vector machines.

[11] S. Fan, Y.-Z. Wu, C. Han, X.-D. Wang，《SIABR：面向超高精度太赫兹室内定位的结构化内部注意力双向循环深度学习方法》，*IEEE Journal on Selected Areas in Communications*，39(7)，2226—2240，2021。原题：SIABR: A structured intra-attention bidirectional recurrent deep learning method for ultra-accurate terahertz indoor localization.

[12] C. Huang, A. F. Molisch, R.-S. He 等，《动态环境 MIMO 系统中机器学习支持的 LoS/NLoS 识别》，*IEEE Transactions on Wireless Communications*，19，3643—3657，2020。原题：Machine learning-enabled LOS/NLOS identification for MIMO systems in dynamic environments.

[13] C. Huang, R.-S. He, B. Ai 等，《面向通信的人工智能赋能无线传播——第二部分：场景识别与信道建模》，*IEEE Transactions on Antennas and Propagation*，70(6)，3955—3969，2022。原题：Artificial intelligence enabled radio propagation for communications—Part II: Scenario identification and channel modeling.

[14] C. Huang, R.-S. He, B. Ai 等，《面向通信的人工智能赋能无线传播——第一部分：信道表征与天线—信道优化》，*IEEE Transactions on Antennas and Propagation*，70(6)，3939—3954，2022。原题：Artificial intelligence enabled radio propagation for communications—Part I: Channel characterization and antenna-channel optimization.

[15] X.-S. Guo, N. Ansari 等，《通过基于随机森林的一组指纹融合实现室内定位》，*IEEE Internet of Things Journal*，5(6)，4686—4698，2018。原题：Indoor localization by fusing a group of fingerprints based on random forests.

[16] N. A. Maung Maung, B. Y. Lwi, S. Thida，《采用随机森林分类器增强的基于 RSS 指纹的无线室内定位》，*ICAIT*，仰光，59—63，2020。原题：An enhanced RSS fingerprinting-based wireless indoor positioning using random forest classifier.

[17] Z.-Q. Yun, M. F. Iskander，《用于无线电传播建模的射线追踪：原理与应用》，*IEEE Access*，3，1089—1100，2015。原题：Ray tracing for radio propagation modeling: Principles and applications.

[18] C.-X. Wang, J. Huang, H. Wang, X. Gao, X.-H. You, Y. Hao，《6G 无线信道测量与模型：趋势与挑战》，*IEEE Vehicular Technology Magazine*，15(4)，22—32，2020。原题：6G wireless channel measurements and models: Trends and challenges.

[19] C.-X. Wang, Z. Lv, X. Gao, X.-H. You, Y. Hao, H. Haas，《全频段全场景的泛在信道建模理论及其在 6G GBSM 中的应用》，*IEEE Transactions on Vehicular Technology*，DOI: 10.1109/TVT.2022.3179695；arXiv:2206.02442。原题：Pervasive channel modeling theory and applications to 6G GBSMs for all frequency bands and all scenarios.

[20] C. Han, A. O. Bicen, I. F. Akyildiz，《太赫兹频段无线通信的多射线信道建模与宽带特征分析》，*IEEE Transactions on Wireless Communications*，14(5)，2402—2412，2015。原题：Multi-ray channel modeling and wideband characterization for wireless communications in the terahertz band.

{% endraw %}
