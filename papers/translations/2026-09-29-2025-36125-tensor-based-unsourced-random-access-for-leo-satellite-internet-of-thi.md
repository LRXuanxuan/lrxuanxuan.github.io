---
layout: page
title: "面向 LEO 卫星物联网的基于张量的无源随机接入｜中文全篇译稿（IEEE 正式版，许可待核验）"
permalink: /papers/translations/2026-09-29-2025-36125-tensor-based-unsourced-random-access-for-leo-satellite-internet-of-thi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/387267fdb644e620/) · [IEEE DOI](https://doi.org/10.1109/TWC.2025.3612505) · [全部目录](/papers/catalog/)

# 面向 LEO 卫星物联网的基于张量的无源随机接入

**原题：** Tensor-Based Unsourced Random Access for LEO Satellite Internet of Things  
**作者：** Ziqi Kang、Dongxuan He（通讯作者，Member, IEEE）、Hua Wang（Member, IEEE）、Weijie Yuan（Senior Member, IEEE）、Tony Q. S. Quek（Fellow, IEEE）  
**单位：** 北京理工大学（Beijing Institute of Technology，北京 100081）；南方科技大学自动化与智能制造学院（深圳 518055）；新加坡科技设计大学（Singapore University of Technology and Design，新加坡 487372）。  
**版本：** 原文为 IEEE Transactions on Wireless Communications 期刊正式发表版：vol. 25, 2026, pp. 4613–4625，DOI: 10.1109/TWC.2025.3612505；2025-04-14 收稿，2025-07-14 修回，2025-09-14 录用，2025-09-29 在线发表，当前版本日期 2025-12-22；原文 13 页。  
**来源与许可说明：** 库内登记元数据给出的 arXiv 编号为 2025.36125（页面顶部 arXiv 链接按骨架保留为 https://arxiv.org/abs/2025.36125），但本 PDF 为 IEEE TWC 期刊正式版，页首未见任何 arXiv 标识或 arXiv 版本号，且 "2025.36125" 不符合 arXiv 标识的常见格式（YYMM.NNNNN）。因此本页以 PDF 首页的期刊信息（卷期、页码、DOI、收稿/录用日期）为准；引用时请使用 DOI: 10.1109/TWC.2025.3612505。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VI 节正文、表 I–III（逐格转写）、图 1–9 中文图注、参考文献 48 条英文原条目（按原编号）；原文无附录、无独立致谢节（资助信息在首页脚注，已译于"原文首页脚注"段），四位作者的作者简介按团队规矩略去并在本段说明。逐句逐式终校未做。

> **原文首页脚注（收稿、资助与单位信息）：** 2025 年 4 月 14 日收稿；2025 年 7 月 14 日修回；2025 年 9 月 14 日录用；2025 年 9 月 29 日发表；当前版本日期 2025 年 12 月 22 日。本工作部分获得国家重点研发计划（Grant 2024YFE0200404）资助，部分获得新加坡国家研究基金会与资讯通信媒体发展局"未来通信研究与开发计划"资助。负责本文审稿并批准发表的副编辑为 M. Wang。通讯作者：Dongxuan He。Ziqi Kang、Dongxuan He 与 Hua Wang 任职于北京理工大学（北京 100081，中国）；Weijie Yuan 任职于南方科技大学自动化与智能制造学院（深圳 518055，中国）；Tony Q. S. Quek 任职于新加坡科技设计大学（新加坡 487372）。Digital Object Identifier: 10.1109/TWC.2025.3612505。

## 摘要

随着物联网（Internet of Things，IoT）应用的迅速扩张，广覆盖与海量连接的需求不可避免。在此背景下，本文研究面向低地球轨道（low earth orbit，LEO）卫星物联网应用的大规模无源随机接入（unsourced random access，URA）范式，聚焦设备分离与信号检测。通过利用结构化 Grassmannian 星座生成码本，本文提出一种基于张量的 URA 传输方案，把设备分离与检测问题建模为一般的规范多态（canonical polyadic，CP）分解。随后，为评估所考虑 URA 方案的接入能力，本文给出一个同时考虑充分条件与必要条件的全面唯一性分析。据此，提出一种高效的广义线搜索加速交替最小二乘（generalized line-search-accelerated alternating least squares，GLSA-ALS）方法来完成设备分离与信号检测，该方法可避免对大规模矩阵进行大量求逆运算。具体而言，借助迭代过程中的松弛因子，所提方法能以可忽略的性能损失快速收敛，从而在检测精度与计算复杂度之间取得更好的折中。此外，依据具体应用场景的需求，松弛因子的灵活选取使所提方法能够兼容经典 ALS 方法，从而以额外复杂度为代价提升性能。最后，依靠基于最大似然（maximum likelihood，ML）的检测方法，可以从一个公共码本恢复活跃设备发送的消息列表。仿真结果表明，所提 GLSA-ALS 方法在实际 LEO 卫星物联网应用中优于现有最先进方法。

**关键词：** 物联网、LEO 卫星、无源随机接入、张量分解、ALS、线搜索。

## I. 引言

物联网已被视为典型的海量机器类通信（massive machine type communication，mMTC）应用，在各类工业领域中发挥关键作用 [1], [2], [3]。与传统的人与人通信相比，广覆盖与海量连接是 mMTC 的主要特征。具体地，IoT 被预期服务于海洋、沙漠与森林等偏远地区。然而，受成本与地理限制，现有地面网络的无线覆盖并不理想。因此，借助低地球轨道（LEO）卫星的广覆盖效应，LEO 卫星物联网已成为 IoT 发展的流行趋势，其中 IoT 设备可由卫星直接接入。另一方面，预计到 2030 年 IoT 设备数量将达到 5000 亿，这需要更高效的接入技术来支撑这些应用 [4], [5]。因此，LEO 卫星物联网设备的高效可靠接入亟待解决。为应对这一需求，免授权随机接入（grant-free random access，GF-RA）受到广泛关注，被视为一种有前景的接入技术 [6]。与需要多次握手与过多信令开销的基于授权的随机接入（grant-based random access，GB-RA）相比，GF-RA 通过避免复杂的接入请求（尤其在大规模接入场景中）显著提高了接入效率 [7]。具体地，依据是否需要检测活跃设备的身份（identity，ID），GF-RA 可进一步分为两类，即有源随机接入（sourced random access，SRA）与无源随机接入（URA）[8]。其中，SRA 可基于非正交导频序列与信道估计（channel estimation，CE）实现活跃设备检测（active device detection，ADD），其中 ADD 问题借助压缩感知（compressed sensing，CS）被建模为稀疏矩阵重构问题 [9], [10]。例如，正交匹配追踪（orthogonal matching pursuit，OMP）被用于高效进行 CE 以支撑后续 ADD，表现出极快的收敛速度 [9]。为提升 OMP 的重构精度，消息传递算法被引入 CS，促成了一种新的近似消息传递（approximate message passing，AMP）算法，改善了 CE 与 ADD 性能 [10]。相应地，基于 CS 的方法已被证明在 LEO 卫星物联网场景下对 SRA 系统仍然有效 [11], [12]。通过把正交时频空间（orthogonal time frequency space，OTFS）调制与基于 CS 的方法结合，[11] 与 [12] 的作者提出了有效的联合 CE 与 ADD，能够适应 LEO 卫星通信中的快时变信道。然而，受 CS 方法复杂度以及每个设备唯一导频序列分配需求的限制，SRA 的性能仍然受限。

事实上，由于导频开销降低且避免了通过 ADD 进行的 ID 检测，URA 可实现更低的接入时延与更大的设备接入数 [13]。URA 的关键问题是基于所有活跃设备共享的一个公共码本恢复消息列表，其中估计消息的未知置换不可避免 [14]。在这一基本结构之上，URA 方案的主要挑战源于码本规模巨大，而码本规模随载荷数据长度呈指数增长 [15]。为解决该问题，[16] 的作者为 URA 设计了一种低复杂度编码方案，提出了把传输周期分割为多个子块以发送码字的创新思路。为提升效率，一种基于编码压缩感知（coded CS，CCS）的方法被提出，利用 CS 理论的进展进一步降低解码过程的计算复杂度 [17]。然而，尽管这些研究在码本设计方面贡献显著，其所考虑的通信场景局限于高斯多址信道，从而阻碍了实际应用。因此，[18] 的作者借助理想编译码框架，推导了衰落信道下的近似性能界。类似地，[19] 的作者初步分析了异步与衰落信道下块失配的影响。此外，针对更复杂的 LEO 卫星物联网场景，[20] 的作者提出了一种基于 OFDMA 的 CCS 方法，其中设计的内解码器通过与外解码器的信息交互，合理地控制其计算复杂度并加速收敛。总之，这些研究表明基于真实信道条件设计有竞争力的码本与解码器的重要意义，而这在促进实际应用中高效设备接入方面起着重要作用。

近年来，通过综合利用信道或信号的内在结构特征，基于张量分解的方法已被证明能够有效处理多种估计与检测问题 [21], [22], [23], [24]。在现有优秀张量研究的启发下，基于张量建模的 URA 新型码本研究也得到开展，其中设备分离与信号检测可在不需要导频序列的情况下进行 [25]。此外，该范式可很好地应用于衰落信道，并通过容纳多天线接收机来利用空间分集。在接收机侧，作为非线性最小二乘方法最具代表性的方法之一，基于高斯–牛顿（Gauss–Newton，GN）的方法被用于计算规范多态（CP）分解，可为检测返回相对准确的因素矩阵估计。受此启发，[26] 的作者提出了一种可重构智能表面（reconfigurable intelligent surface，RIS）辅助的 URA 方法，通过把张量建模与稀疏贝叶斯学习（sparse Bayesian learning，SBL）结合，在复杂 RIS 信道条件下提升了检测性能。此外，为适配高机动场景中的时变信道，一种基于块项分解（block term decomposition，BTD）的改进张量方案被设计出来，其中结构化张量范式在较短相干块内有效提升了检测性能 [27]。然而，检测过程中的高计算复杂度尚未解决，这限制了基于张量的 URA 方案的实用性，使其难以应用于 LEO 卫星物联网——后者因长距离传输而信噪比（signal to noise ratio，SNR）很低。为清晰起见，上述相关工作的比较汇总于表 I。

在此背景下，本文旨在为 LEO 卫星物联网应用设计一种通过 CP 分解实现的高效张量 URA 方案。本文贡献总结如下：

1. 为 LEO 卫星物联网场景建立了一种基于张量格式的结构化 URA 方案。通过充分利用 Grassmannian 星座进行调制，设备分离与信号检测被建模为高阶情形下的一般 CP 分解，从而可很好地节省导频分配开销。
2. 详细给出所提张量模型的唯一性分析，为 URA 系统的接入能力提供理论支撑。特别地，从充分与必要两方面讨论唯一分解的条件，详细刻画可支持设备数的边界，而这在 LEO 卫星物联网场景研究中仍属空白。
3. 提出一种有效的广义线搜索加速交替最小二乘（GLSA-ALS）方法来求解 CP 分解，其中高效恢复的因素矩阵被用于支撑设备分离与信号检测。具体地，所设计的加速优化了因素矩阵估计的迭代更新以获得更快收敛；借助松弛因子选择，该方法可兼容经典 ALS 方法，以满足更高精度的需求。

本文其余部分组织如下：第 II 节介绍所考虑的 LEO 卫星物联网 URA 传输方案；第 III 节给出接收信号的基于 CP 的张量建模以及相应分解问题的唯一性分析；随后，第 IV 节通过分析所提方案的现有常规解，设计 GLSA-ALS 方法以获得因素矩阵估计以供后续信号检测；第 V 节给出仿真结果，第 VI 节总结。

**记号：** 向量与矩阵分别用小写与大写粗体字母表示；$\|\cdot\|_2$ 与 $\|\cdot\|_F$ 分别表示 $l_2$ 范数与 Frobenius 范数；转置、共轭、共轭转置与伪逆分别记为 $(\cdot)^T$、$(\cdot)^*$、$(\cdot)^H$ 与 $(\cdot)^\dagger$；$\mathbf{I}_M$ 是维数为 $M\times M$ 的单位矩阵；$[\![\cdot]\!]$ 表示 Kruskal 算子；$[\mathbf x]_l$、$[\mathbf X]_{l,m}$、$[\mathcal X]_{l,m,n}$ 分别表示向量 $\mathbf x$ 的第 $l$ 个元素、矩阵 $\mathbf X$ 的元素 $(l,m)$、三阶张量 $\mathcal X$ 的元素 $(l,m,n)$；$\mathbf X_l$ 与 $\mathbf X_{:,m:n}$ 分别表示矩阵 $\mathbf X$ 的第 $l$ 列与从第 $m$ 到第 $n$ 列的子矩阵；$\lceil\cdot\rceil$ 与 $\max(\cdot)$ 分别表示取上整与取最大；$\mathrm{Re}(\cdot)$ 表示复数值的实部，$\mathrm{j}=\sqrt{-1}$；$|\mathcal A|_c$ 表示集合 $\mathcal A$ 的基数；$\Lambda(\mathbf x)$ 表示由 $\mathbf x$ 构成的对角矩阵；$\otimes$、$\odot$、$\ast$、$\circ$ 分别表示 Kronecker、Khatri–Rao、Hadamard 与外积。此外，给定 $N$ 个矩阵 $\mathbf X_i\in\mathbb C^{L_i\times R}$，定义以下乘积：

$$
\overset{1}{\underset{i=N}{\bigodot}}\mathbf X_i=\mathbf X_N\odot\cdots\odot\mathbf X_i\odot\cdots\odot\mathbf X_1, \tag{1}
$$

$$
\overset{N}{\underset{i=1}{\bigodot}}\mathbf X_i=\mathbf X_1\odot\cdots\odot\mathbf X_i\odot\cdots\odot\mathbf X_N, \tag{2}
$$

$$
\overset{N}{\underset{i=1}{\bigotimes}}\mathbf X_i=\mathbf X_1\otimes\cdots\otimes\mathbf X_i\otimes\cdots\otimes\mathbf X_N. \tag{3}
$$

> **表 I（原文 Table I）：** 相关工作与本文工作的比较。

| 文献 | 系统模型 | 类别 | 基础方法 | 所提算法 | 基准 |
|---|---|---|---|---|---|
| [11] | MIMO-OTFS + LEO 卫星物联网 | SRA | CS | 基于 OMP | oracle-LS |
| [12] | MIMO-OTFS + LEO 卫星物联网 | SRA | CS | ConvSBL-GAMP | SBL-GAMP / GMMV-AMP |
| [14] | 大规模 MIMO | SRA + URA | CS | BiG-AMP + SIC | 相干检测 |
| [17] | 单天线 | URA | CS | CCS + 树结构 | 随机编码 / SIC |
| [18] | 单天线 + 准静态衰落 | URA | MAP | 交替 BP | ALOHA |
| [19] | 时隙 ALOHA + 异步衰落 | URA | CS + MAP | OMP + SIC | SIC（同步） |
| [20] | OFDMA + LEO 卫星物联网 | URA | CS | PD + JD | DOT / DOCT |
| [25] | 块衰落 | URA | 张量分解 | 基于 GN + ML | 随机编码 |
| [26] | RIS 辅助 + 阻塞直达链路 | URA | 张量分解 + SBL | CTAD | ALS + CVX |
| [27] | 块衰落 + 高机动 | URA | 张量分解 | BTD + 基于 GN | TBM |
| 本文 | LEO 卫星物联网 | URA | 张量分解 | GLSA-ALS | 基于 GN / ALS |

## II. 系统模型

### A. LEO 卫星物联网场景中的信道模型

如图 1 所示，我们考虑一个 LEO 卫星物联网系统，包含 $U_a$ 个单天线 IoT 设备与一颗配备 $M$ 根天线的 LEO 卫星 [28], [29], [30], [31]。变量详见表 II。根据 LEO 卫星通信的传输特性，第 $u$ 个 IoT 设备与 LEO 卫星之间的信道（$u\in\{1,\dots,U_a\}$）可写为 [32]

$$
\mathbf h_u=\alpha_u\left(\sqrt{\frac{\gamma_u\beta_u}{\gamma_u+1}}\mathbf h_u^{\mathrm{LOS}}+\sqrt{\frac{\beta_u}{\gamma_u+1}}\mathbf h_u^{\mathrm{NLOS}}\right), \tag{4}
$$

其中 $\mathbf h_u^{\mathrm{LOS}}$ 与 $\mathbf h_u^{\mathrm{NLOS}}$ 分别表示信道模型中的视距（LOS）与非视距（NLOS）分量，卫星接收天线增益 $\alpha_u$ 由 [33] 给出：

$$
\alpha_u=\frac{J_1(\phi_u)}{2\phi_u}+36\frac{J_3(\phi_u)}{\phi_u^3}, \tag{5}
$$

其中

$$
\phi_u=\frac{\pi d_sf_c}{c}\sin(\theta_u). \tag{6}
$$

此外，大尺度衰落因子 $\beta_u$ 由 [34] 与 [35] 给出：

$$
\beta_u=\left(\frac{c}{4\pi f_cd_0}\right)^2\cdot\frac{G_u}{\kappa WT_0}\cdot\frac{1}{r_u}, \tag{7}
$$

其中 $(c/(4\pi f_cd_0))^2$ 是自由空间损耗；雨衰效应在 dB 上的功率增益通常服从对数正态随机分布 $\ln(r_{\mathrm{dB}})\sim\mathcal{CN}(\mu_r,\sigma_r^2)$，均值为 $\mu_r$、方差为 $\sigma_r^2$。此外，由于到 LEO 卫星的发射仰角可视为不变，LOS 分量 $\mathbf h_u^{\mathrm{LOS}}\in\mathbb C^{M\times1}$ 在相当长时间内被视为常数。对信道的 NLOS 分量，$\mathbf h_u^{\mathrm{NLOS}}\in\mathbb C^{M\times1}$ 通常服从独立同分布（i.i.d.）复高斯分布 $\mathbf h_u^{\mathrm{NLOS}}\sim\mathcal{CN}(\mathbf 0,(\sigma_u^{\mathrm{NLOS}})^2\mathbf I_M)$。因此，作为 LOS 分量与 NLOS 分量的组合，LEO 卫星信道 $\mathbf h_u\in\mathbb C^{M\times1}$ 服从复高斯分布 [36]

$$
\mathbf h_u\sim\mathcal{CN}\left(\alpha_u\sqrt{\frac{\gamma_u\beta_u}{\gamma_u+1}}\mathbf h_u^{\mathrm{LOS}},\ \frac{\alpha_u^2\beta_u}{\gamma_u+1}(\sigma_u^{\mathrm{NLOS}})^2\mathbf I_M\right).
$$

> **表 II（原文 Table II）：** 信道模型变量表。

| 记号 | 定义 |
|---|---|
| $\alpha_u$ | 卫星接收天线增益 |
| $c$ | 光速 |
| $f_c$ | 载波频率 |
| $d_s$ | 圆形天线阵直径 |
| $\theta_u$ | 卫星视轴的偏轴角 |
| $\beta_u$ | 大尺度衰落因子 |
| $d_0$ | 传播距离 |
| $G_u$ | 设备发射天线增益 |
| $W$ | 载波带宽 |
| $T_0$ | 接收噪声温度 |
| $\kappa$ | 玻尔兹曼常数 |
| $r_u$ | 雨衰系数 |
| $\gamma_u$ | Rician 因子 |

### B. 无源随机接入的传输方案

遵循 URA 范式 [15]，活跃 IoT 设备通过共享公共星座同时发送其载荷信息。因此，依据 LEO 卫星物联网场景的信道与信号传播特性，LEO 卫星处的接收信号 $\mathbf Y\in\mathbb C^{L\times M}$ 可表示为

$$
\mathbf Y=\sum_{u=1}^{U_a}\sqrt{P_u}\mathbf s_u\mathbf h_u^H+\mathbf Z, \tag{8}
$$

其中 $P_u$ 是第 $u$ 个设备的发射功率；$\mathbf s_u\in\mathcal C\subset\mathbb C^L$ 表示第 $u$ 个设备在 $L$ 个信道使用上发送的复基带符号序列，且从同一星座 $\mathcal C=\{\mathbf c_1,\dots,\mathbf c_{2^B}\}$ 中选取，$B$ 是信息比特数；$\mathbf Z\in\mathbb C^{L\times M}$ 是均值为零、方差为 $\sigma_n^2$ 的加性白高斯噪声（additive white Gaussian noise，AWGN）[25]。

由于 Kronecker 积的性质，矩阵形式的接收信号可向量化为

$$
\mathbf y=\mathrm{vec}(\mathbf Y)=\sum_{u=1}^{U_a}\sqrt{P_u}\mathbf s_u\otimes\mathbf h_u+\mathbf z, \tag{9}
$$

其中 $\mathbf z=\mathrm{vec}(\mathbf Z)$ 是 $\mathbf Z$ 的列向量化，$\mathbf y,\mathbf z\in\mathbb C^{LM\times1}$。此外，基于张量调制格式构造了性能更优的多维星座结构，该结构可分解为多个子星座 [25], [26], [27]。具体地，令 $\mathcal C_n\subset\mathbb C^{L_n}$ 表示 $\mathcal C$ 在第 $L_n$ 个信道使用上的第 $n$ 个子星座，其中 $L_n$ 是分解后总信道使用的第 $n$ 部分，即 $L=\prod_{n=1}^NL_n$，$N\ge2$，$L_n\ge2$ [27]。于是，原星座可视为从每个 $\mathcal C_n$ 中选取元素的所有可能组合：

$$
\mathcal C=\{\mathbf x_1\otimes\cdots\otimes\mathbf x_N,\ \mathbf x_1\in\mathcal C_1,\dots,\mathbf x_N\in\mathcal C_N\}. \tag{10}
$$

因此，$\mathbf s_u$ 可相应地因子化为

$$
\mathbf s_u=\mathbf x_{1,u}\otimes\mathbf x_{2,u}\otimes\cdots\otimes\mathbf x_{N,u}, \tag{11}
$$

其中 $\mathbf x_{n,u}\in\mathcal C_n\subset\mathbb C^{L_n}$ 表示第 $u$ 个设备发送的子星座点。把 (11) 代入 (9)，接收信号可改写为

$$
\mathbf y=\underbrace{\sum_{u=1}^{U_a}\sqrt{P_u}\mathbf x_{1,u}\otimes\mathbf x_{2,u}\otimes\cdots\otimes\mathbf x_{N,u}\otimes\mathbf h_u}_{\triangleq\mathbf y_0}+\mathbf z, \tag{12}
$$

其中 $\mathbf y_0$ 表示接收信号的无噪部分。

> **图 1（原文 Fig. 1）：** LEO 卫星物联网场景中 URA 系统的示意图。

## III. 张量建模与唯一性分析

本节首先推导接收信号的基于 CP（规范多态）的张量形式，然后分析保证 CP 分解唯一性的条件。

### A. 接收机的张量建模

借助外积与向量化的性质，式 (12) 给出的信号模型可等价改写为秩一张量形式 [26], [32]：

$$
\mathcal Y=\mathcal Y_0+\mathcal Z=\sum_{u=1}^{U_a}\mathbf x_{1,u}\circ\mathbf x_{2,u}\circ\cdots\circ\mathbf x_{N,u}\circ\mathbf h'_u+\mathcal Z, \tag{13}
$$

其中 $\mathcal Y,\mathcal Z\in\mathbb C^{L_1\times L_2\times\cdots\times L_N\times M}$ 分别是张量空间中的接收信号与 AWGN，$\mathcal Y$ 满足 $\mathbf y=\mathrm{vec}(\mathcal Y)$，$\mathcal Y_0$ 是无噪部分，$\mathbf h'_u=\sqrt{P_u}\mathbf h_u$ 表示等效信道向量。为方便起见，下文省略 $\mathbf h'_u$ 的撇号。于是，给定估计的 $\hat{\mathbf h}_u$，多用户检测可表述为

$$
\{\hat{\mathbf x}_{n,u}\}=\arg\min_{\mathbf x_{n,u}\in\mathcal C_n}\left\|\mathcal Y-\sum_{u=1}^{U_a}\mathbf x_{1,u}\circ\mathbf x_{2,u}\circ\cdots\circ\mathbf x_{N,u}\circ\hat{\mathbf h}_u\right\|_F^2, \tag{14}
$$

其中符号映射自 Grassmannian 星座，并可按 (10) 分段。特别地，得益于特定的解码方法，$\hat{\mathbf x}_{n,u}$ 可在不预先进行精确 CE 的情况下被检测。因此，多用户检测问题可等价放松为同时获得 $\{\hat{\mathbf x}_{n,u},\hat{\mathbf h}_u\}$，即满足

$$
\min_{\hat{\mathbf x}_{n,u}\in\mathcal C_n,\ \hat{\mathbf h}_u\in\mathbb C^M}\left\|\hat{\mathbf x}_{1,u}\circ\cdots\circ\hat{\mathbf x}_{N,u}\circ\hat{\mathbf h}_u-\mathbf x_{1,u}\circ\cdots\circ\mathbf x_{N,u}\circ\mathbf h_u\right\|_F^2. \tag{15}
$$

事实上，(14)–(15) 中的设备分离与信号检测建模可由典型 CP 分解处理，其中 $\hat{\mathbf x}_{n,u}$ 可通过因素矩阵的精确重构获得。相应地，(13) 可等价表示为因素矩阵的组合：

$$
\mathcal Y=\sum_{u=1}^{U_a}\mathbf x_{1,u}\circ\cdots\circ\mathbf x_{N,u}\circ\mathbf h_u+\mathcal Z=[\![\mathbf X_1,\mathbf X_2,\dots,\mathbf X_N,\mathbf H]\!]+\mathcal Z, \tag{16}
$$

其中因素矩阵记为

$$
\mathbf X_n\triangleq[\mathbf x_{n,1},\dots,\mathbf x_{n,U_a}]\in\mathbb C^{L_n\times U_a}, \tag{17}
$$

$$
\mathbf H\triangleq[\mathbf h_1,\dots,\mathbf h_{U_a}]\in\mathbb C^{M\times U_a}. \tag{18}
$$

### B. N 阶张量的唯一性分析

考虑活跃设备数对信号检测性能的影响，应明确并满足本质唯一性（essential uniqueness）的条件，而这主要与张量秩的约束有关。此外，尽管现有工作大多只给出限于三阶张量的充分条件，但对系统参数选取而言，必要条件同样重要。而且，由于紧致程度不同，为满足 CP 分解唯一性所导出的条件并不唯一。因此，基于不同理论基础，下面给出一组唯一性的充分与必要条件。

**1) 充分条件：** 最广泛采用的充分条件是由三阶情形导出的 Kruskal 条件；这里通过把它推广到 $(N+1)$ 阶情形加以使用 [37], [38]：

$$
\sum_{n=1}^N\mathrm{rank}(\mathbf X_n)+\mathrm{rank}(\mathbf H)\ge2U_a+N. \tag{19}
$$

为简便起见，记 $\mathbf X_{N+1}\triangleq\mathbf H$，并重排 (19) 得到相应的秩约束：

$$
U_a\le\frac{\sum_{n=1}^{N+1}\mathrm{rank}(\mathbf X_n)-N}{2}. \tag{20}
$$

作为充分条件，该约束可合理放松以提供更高的上界。因此，基于切向弱亏缺（tangential weak defectivity）的几何概念，考虑另一充分条件 [39]：

$$
U_a\le\left\lceil\frac{\prod_{n=1}^NL_nM}{1+\sum_{n=1}^N(L_n-1)+(M-1)}\right\rceil-1
=\left\lceil\frac{LM}{M+\sum_{n=1}^N(L_n-1)}\right\rceil-1, \tag{21}
$$

其中得到了更宽松的秩约束，以保证在更大张量空间情形下的张量可辨识性。

**2) 必要条件：** 考虑 $\mathcal Y_0$ 的 mode-$n$ 展开，有

$$
\mathbf Y_{(n)}=\mathbf X_n\left(\mathbf X_{N+1}\odot\cdots\odot\mathbf X_{n+1}\odot\mathbf X_{n-1}\odot\cdots\odot\mathbf X_1\right)^T
=\mathbf X_n\left(\overset{1}{\underset{i=N+1,i\neq n}{\bigodot}}\mathbf X_i\right)^T. \tag{22}
$$

于是，基于 Liu 条件 [40]，$N$ 阶情形的一般必要条件可给出为

$$
U_a=\min_{n=1,\dots,N+1}\ \mathrm{rank}\left(\overset{N+1}{\underset{i=1,i\neq n}{\bigodot}}\mathbf X_i\right). \tag{23}
$$

利用 Khatri–Rao 积的性质，即 $\mathrm{rank}(\mathbf X_1\odot\mathbf X_2)\le\mathrm{rank}(\mathbf X_1)\cdot\mathrm{rank}(\mathbf X_2)$，$U_a$ 的上界可给出为

$$
U_a\le\min_{n=1,\dots,N+1}\left(\prod_{i=1,i\neq n}^{N+1}\mathrm{rank}(\mathbf X_i)\right), \tag{24}
$$

其中秩约束从必要条件角度设置了限制，以避免非唯一分解。总之，通过综合考虑充分与必要条件，可得到张量建模所能识别的活跃设备数的可信范围。

## IV. 基于 CP 分解的低复杂度设备分离与信号检测

本节分别讨论基于 GN 与 ALS 的解法，然后设计一种高效的 GLSA-ALS 方法处理 CP 分解。基于 GLSA-ALS 的结果，给出基于最大似然（ML）的信号检测，并给出计算复杂度分析。

### A. 所提 GLSA-ALS 方法

作为现有基于张量的 URA 工作的解法，GN 方法在张量分解精度方面表现突出 [25], [27]。通过计算目标残差张量的 Jacobian 与 Hessian 矩阵，GN 方法可视为对 ALS 方法的精化，当出现"沼泽"（swamps）现象时性能提升更明显 [41]。具体地，由因素矩阵共线分量引起的沼泽现象会显著减慢收敛速度，而这在大规模情形中更易出现。然而，由于 GN 方法在迭代更新中固有的对大规模 Hessian 矩阵求逆运算，检测精度可能因近奇异特性而下降，同时因素矩阵估计的总计算复杂度对实际应用也难以承受 [42]。相反，传统 ALS 在 CP 分解方法中计算复杂度最低。然而 ALS 对沼泽不稳健，使其收敛难以保证。因此，我们为基于张量的 URA 的设备分离与信号检测问题提出 GLSA-ALS 方法，以在性能与收敛之间取得更好的折中。

在所提 GLSA-ALS 方法中，我们聚焦于加速收敛以减少迭代次数。具体地，GLSA-ALS 可分为三个阶段，即初始化、加速与估计，下面详细讨论。

**1) 迭代更新的初始化：** 作为最典型的非线性最小二乘方法之一，GN 方法允许因素矩阵随机初始化或全零初始化。相比之下，基于 ALS 的方法需要特定初始化以保证收敛速度。此外，与原始 ALS 方法不同，启动所提 GLSA-ALS 需要两个初始值，记为 $\hat{\mathbf X}_n^{(\eta-1)}$ 与 $\hat{\mathbf X}_n^{(\eta-2)}$，其中 $\eta$ 表示当前迭代，$n=1,\dots,N+1$。为此，我们设计执行 $2(N+1)$ 次迭代更新以获得上述两个初始值，更新规则为

$$
\begin{aligned}
\hat{\mathbf X}_n^{(\eta)}&=\mathbf Y_{(n)}\left(\left(\hat{\mathbf X}_{N+1}^{(\eta-1)}\odot\cdots\odot\hat{\mathbf X}_{n+1}^{(\eta-1)}\odot\hat{\mathbf X}_{n-1}^{(\eta)}\odot\cdots\odot\hat{\mathbf X}_1^{(\eta)}\right)^\dagger\right)^T\\
&=\mathbf Y_{(n)}\left(\left(\left(\overset{n+1}{\underset{i=N+1}{\bigodot}}\hat{\mathbf X}_i^{(\eta-1)}\right)\odot\left(\overset{1}{\underset{j=n-1}{\bigodot}}\hat{\mathbf X}_j^{(\eta)}\right)\right)^\dagger\right)^T. \tag{25}
\end{aligned}
$$

注意，因素矩阵应按从 $\hat{\mathbf X}_1$ 到 $\hat{\mathbf X}_{N+1}$ 的顺序更新。

此外，首次更新计算时，$\hat{\mathbf X}_n^{(0)}$ 的值借助相应 mode-$n$ 展开的奇异值分解（SVD）获得：

$$
\mathbf Y_{(n)}=\mathbf U_n\boldsymbol\Sigma_n\mathbf V_n^H, \tag{26}
$$

其中 $\mathbf U_n$ 表示左奇异矩阵。假设 $\mathbf U_n$ 的尺寸为 $Q_{n,r}\times Q_{n,c}$，其中 $Q_{n,c}$ 不一定总大于 $U_a$。$\hat{\mathbf X}_n^{(0)}$ 的取值选为

$$
\hat{\mathbf X}_n^{(0)}=
\begin{cases}
[\mathbf U_n]_{1:U_a}, & Q_{n,c}\ge U_a,\\
[\mathbf U_n\ \mathbf G_n], & Q_{n,c}<U_a,
\end{cases} \tag{27}
$$

其中 $\mathbf G_n\triangleq[\mathbf g_{n,1},\dots,\mathbf g_{n,(U_a-Q_{n,c})}]\in\mathbb C^{Q_{n,r}\times(U_a-Q_{n,c})}$ 用于补充列数，$\mathbf g_{n,q}\sim\mathcal{CN}(\mathbf 0,\mathbf I_{Q_{n,r}})$，$q=1,\dots,(U_a-Q_{n,c})$。

完成 $2(N+1)$ 次迭代更新后，各因素矩阵分别由最后两次更新的结果确定其初始值，即 $\hat{\mathbf X}_n^{(\eta-1)}$ 与 $\hat{\mathbf X}_n^{(\eta-2)}$。

**2) 线搜索加速：** 根据 [43] 与 [44] 揭示的重要事实，当整体收敛速度较慢时，存在由唯一方向定义的收敛循环。对给定循环，因素矩阵将沿同一方向更新，直至收敛或达到最大迭代次数。具体地，该循环的方向可由 $(\hat{\mathbf X}_n^{(\eta-1)}-\hat{\mathbf X}_n^{(\eta-2)})$ 表示。

为有效保证 ALS 的收敛，给定循环的迭代次数应被合理节省，这可借助给定方向计算如下线性回归精确实现：

$$
\hat{\mathbf X}_n^{(\mathrm{LS})}=\hat{\mathbf X}_n^{(\eta-2)}+\mu_{\mathrm{LS}}\left(\hat{\mathbf X}_n^{(\eta-1)}-\hat{\mathbf X}_n^{(\eta-2)}\right), \tag{28}
$$

其中 $\hat{\mathbf X}_n^{(\mathrm{LS})}$ 表示用于更新 $\hat{\mathbf X}_n^{(\eta)}$ 的、相对 $\hat{\mathbf X}_n^{(\eta-1)}$ 的替代因素矩阵，$\mu_{\mathrm{LS}}$ 是调节迭代节省量的松弛因子。为在不引入显著计算复杂度的情况下获得明显的收敛加速效果，松弛因子取为 $\mu_{\mathrm{LS}}=\eta^{1/(N+1)}$，而非固定值或其他自适应值，这能很好地平衡效率与稳定性 [47]。

随后，每次迭代中需判断 $\hat{\mathbf X}_n^{(\mathrm{LS})}$ 是否优于相应的 $\hat{\mathbf X}_n^{(\eta-1)}$，这需要比较 $\mathcal Y$ 与由这两组因素矩阵构成的张量之间的残差：

$$
\mathcal E^{(\mathrm{LS})}=\left\|\mathcal Y-[\![\hat{\mathbf X}_1^{(\mathrm{LS})},\hat{\mathbf X}_2^{(\mathrm{LS})},\dots,\hat{\mathbf X}_{N+1}^{(\mathrm{LS})}]\!]\right\|_F^2, \tag{29}
$$

$$
\mathcal E^{(\eta-1)}=\left\|\mathcal Y-[\![\hat{\mathbf X}_1^{(\eta-1)},\hat{\mathbf X}_2^{(\eta-1)},\dots,\hat{\mathbf X}_{N+1}^{(\eta-1)}]\!]\right\|_F^2, \tag{30}
$$

其中 $\mathcal E^{(\mathrm{LS})}$ 与 $\mathcal E^{(\eta)}$ 分别表示上述残差。具体地，$\mathcal E^{(\mathrm{LS})}<\mathcal E^{(\eta-1)}$ 的期望结果表明替代量 $\hat{\mathbf X}_n^{(\mathrm{LS})}$ 比 $\hat{\mathbf X}_n^{(\eta-1)}$ 更接近真实因素矩阵。因此，$\mathcal E^{(\mathrm{LS})}<\mathcal E^{(\eta-1)}$ 验证了一次成功的加速，意味着我们等效地跳过了若干次迭代并提升了收敛速度 [47]。相反，$\mathcal E^{(\mathrm{LS})}\ge\mathcal E^{(\eta-1)}$ 的不良结果表明本次迭代中 $\mu_{\mathrm{LS}}$ 的取值不合适，加速无法保证，$\hat{\mathbf X}_n^{(\eta-1)}$ 保持不变。综上，线搜索的加速结果可表示为

$$
\hat{\mathbf X}_n^{(\eta-1)}=
\begin{cases}
\hat{\mathbf X}_n^{(\mathrm{LS})}, & \mathcal E^{(\mathrm{LS})}<\mathcal E^{(\eta-1)},\\
\hat{\mathbf X}_n^{(\eta-1)}, & \mathcal E^{(\mathrm{LS})}\ge\mathcal E^{(\eta-1)}.
\end{cases} \tag{31}
$$

**3) 因素矩阵估计：** 为准确高效地获得因素矩阵估计 $\hat{\mathbf X}_n$，需要两个步骤。首先，基于 (31) 所示的加速，用 (25) 持续进行迭代更新。类似地，$\hat{\mathbf X}_n^{(\eta)}$ 应按从 $n=1$ 到 $n=N+1$ 的顺序更新。然后，利用预设阈值 $\xi$，判断迭代结果是否可接受以用于后续信号检测。若 $|\mathcal E^{(\eta)}-\mathcal E^{(\eta-1)}|>\xi$，则通过重复初始化与加速继续更新 $\hat{\mathbf X}_n$。具体地，$\hat{\mathbf X}_n^{(\eta)}$ 与 $\hat{\mathbf X}_n^{(\eta-1)}$ 的值将被赋给 $\hat{\mathbf X}_n^{(\eta-1)}$ 与 $\hat{\mathbf X}_n^{(\eta-2)}$，随后用于在下一次迭代中计算新的 $\hat{\mathbf X}_n^{(\mathrm{LS})}$ 与 $\mathcal E^{(\mathrm{LS})}$。反之，若 $|\mathcal E^{(\eta)}-\mathcal E^{(\eta-1)}|\le\xi$ 或迭代次数已达最大值 $I_{\mathrm{iter}}$，则停止 $\hat{\mathbf X}_n$ 的更新，此时 $\hat{\mathbf X}_n=\hat{\mathbf X}_n^{(\eta)}$ 将用于信号检测。综上，面向 LEO 卫星物联网场景 URA 的所提基于张量建模的 GLSA-ALS 方法可详述为算法 1。

> **算法 1　基于张量的 GLSA-ALS 算法**
> **输入：** 接收信号张量 $\mathcal Y$、松弛因子 $\mu_{\mathrm{LS}}$、阈值 $\xi$，以及最大迭代次数 $I_{\mathrm{iter}}$
> **输出：** $\hat{\mathbf X}_n$，$n=1,\dots,N+1$
> **阶段 1：初始化：**
> 1: 按 (27) 计算 $\hat{\mathbf X}_n^{(0)}$；
> 2: **for** $\eta=1:2(N+1)$ **do**
> 3: 　**for** $n=1:N+1$ **do**
> 4: 　　按 (25) 更新 $\hat{\mathbf X}_n^{(\eta)}$；
> 5: 　**end for**
> 6: **end for**
> **阶段 2：加速：**
> 7: 取 $\hat{\mathbf X}_n^{(\eta)}$ 与 $\hat{\mathbf X}_n^{(\eta-1)}$ 作为初始值；
> 8: 令 $\eta=\eta+1$，按 (28) 计算 $\hat{\mathbf X}_n^{(\mathrm{LS})}$；
> 9: 按 (29) 与 (30) 重构 $\mathcal E^{(\mathrm{LS})}$ 与 $\mathcal E^{(\eta-1)}$；
> 10: **if** $\mathcal E^{(\mathrm{LS})}<\mathcal E^{(\eta-1)}$ **then**
> 11: 　$\hat{\mathbf X}_n^{(\eta-1)}=\hat{\mathbf X}_n^{(\mathrm{LS})}$；
> 12: **else**
> 13: 　$\hat{\mathbf X}_n^{(\eta-1)}=\hat{\mathbf X}_n^{(\eta-1)}$。
> 14: **end if**
> **阶段 3：估计：**
> 15: **if** $\eta\le I_{\mathrm{iter}}$ **then**
> 16: 　**for** $n=1:N+1$ **do**
> 17: 　　按 (25) 更新 $\hat{\mathbf X}_n^{(\eta)}$；
> 18: 　**end for**
> 19: 按 (30) 的方式重构 $\mathcal E^{(\eta)}$；
> 20: **if** $|\mathcal E^{(\eta)}-\mathcal E^{(\eta-1)}|>\xi$ **then**
> 21: 　执行第 7 步；
> 22: **else**
> 23: 　$\hat{\mathbf X}_n=\hat{\mathbf X}_n^{(\eta)}$，跳出循环。
> 24: **end if**
> 25: **end if**

> **原文疑点：** 算法 1 第 13 行在 PDF 中写作 "$\hat{\mathbf X}_n^{(\eta-1)}=\hat{\mathbf X}_n^{(\eta-1)}$"，为平凡赋值；结合式 (31) 的 else 分支，其原意应为保持 $\hat{\mathbf X}_n^{(\eta-1)}$ 不变。本页按原文照录并在此加注。

### B. GLSA-ALS 的计算复杂度分析

所提 GLSA-ALS 算法的计算复杂度如下，主要来自因素矩阵估计与 LS 加速中的复数乘法。为简便，相应分析从第 $n$ 个因素矩阵的角度给出，即 $\hat{\mathbf X}_n\in\mathbb C^{L_n\times U_a}$，并回顾 $L=\prod_{n=1}^NL_n$。就因素矩阵估计而言，计算复杂度主要由 SVD 与矩阵更新构成。SVD 的代价为 $\mathcal O(L_nM^2(L/L_n)^2+M^3(L/L_n)^3)$，当 $(L_1,\dots,L_N,M)$ 的量级相近时可近似为 $\mathcal O(\max(L_1,\dots,L_N,M)^3)$。矩阵更新需要 $\mathcal O(I_{\mathrm{GLSA}}(U_aML(1+1/L_n)+U_a^2L_n+U_aL_n))$，其中 $I_{\mathrm{GLSA}}$ 表示 GLSA-ALS 的总迭代次数，包含为 LS 准备的 $2(N+1)$ 次迭代，$U_aML/L_n$ 是 (25) 中连续 Khatri–Rao 积的代价。至于其余部分，计算复杂度主要来自 (29) 中的松弛与附加判断，分别需要 $\mathcal O(U_aL_n)$ 与 $\mathcal O(L)$。

### C. 基于 ML 的信号检测

基于张量分解的结果，估计因素矩阵与真实因素矩阵之间的关系可表示为

$$
\hat{\mathbf X}_n=\mathbf X_n\boldsymbol\Delta_n\boldsymbol\Pi+\mathbf E_n,\quad\forall n, \tag{32}
$$

其中 $\boldsymbol\Delta_n$ 是满足 $\prod_{n=1}^{N+1}\boldsymbol\Delta_n=\mathbf I_{U_a}$ 的未知对角矩阵，$\boldsymbol\Pi\in\mathbb C^{U_a\times U_a}$ 是未知置换矩阵，$\mathbf E_n$ 是相应的估计误差。因此，信号检测应能处理尺度与置换的模糊性。

事实上，得益于发送星座的恰当选择，标量不确定性可借助 Grassmannian 结构设计解决，该设计对共线性不敏感 [45]。此外，由于 CP 分解的特性，$\boldsymbol\Pi$ 对所有 $\hat{\mathbf X}_n$ 相同，这意味着所有设备的子星座符号按列对齐。因此，$\hat{\mathbf x}_{n,u}$ 可从 $\hat{\mathbf X}_n$ 中分离并检测。

回顾我们已记 $\mathbf X_{N+1}\triangleq\mathbf H$；与承载信息的因素矩阵相伴，CSI 矩阵也被同时更新，它与 $\hat{\mathbf X}_n$ 耦合，没有导频序列就无法提取。然而，我们主要关注信号检测而非 CE，且 $\mathbf H$ 的影响可以忽略，因为基于 ML 的方法可用于在没有 CE 辅助的情况下准确恢复信号 [46]。因此，检测按大多数 URA 研究的方式以非相干方式进行。具体地，受 ALS 概念启发，我们首先固定所有 $\hat{\mathbf x}_{n,u}$ 以关于 $\mathbf h_u$ 求解 (15)，其中反向利用 (12)–(13) 的性质，得

$$
\begin{aligned}
\mathbf h_u^*&=\frac{(\mathbf x_{1,u}\otimes\cdots\otimes\mathbf x_{N,u})^H(\hat{\mathbf x}_{1,u}\otimes\cdots\otimes\hat{\mathbf x}_{N,k})}{\|\mathbf x_{1,u}\otimes\cdots\otimes\mathbf x_{N,u}\|_2^2}\hat{\mathbf h}_u\\
&=\frac{\left(\bigotimes_{n=1}^N\mathbf x_{n,u}\right)^H\left(\bigotimes_{n=1}^N\hat{\mathbf x}_{n,u}\right)}{\left\|\bigotimes_{n=1}^N\mathbf x_{n,u}\right\|_2^2}\hat{\mathbf h}_u. \tag{33}
\end{aligned}
$$

> **原文疑点：** 式 (33) 第一行在 PDF 中印作 $\hat{\mathbf x}_{1,u}\otimes\cdots\otimes\hat{\mathbf x}_{N,k}$，其中下标 $k$ 在文中未定义，按上下文（第二行与后文一致写法）应为 $\hat{\mathbf x}_{N,u}$；本页按原文转写并在此加注。

于是，我们得到 $\mathbf h_u$ 与 $\hat{\mathbf h}_u$ 之间的关系，可将其代入 (15) 以简化关于 $\mathbf x_{n,u}$ 的目标函数：

$$
\begin{aligned}
&\left\|\hat{\mathbf x}_{1,u}\otimes\cdots\otimes\hat{\mathbf x}_{N,u}\otimes\hat{\mathbf h}_u-\mathbf x_{1,u}\otimes\cdots\otimes\mathbf x_{N,u}\otimes\mathbf h_u^*\right\|_2^2\\
&=\left\|\mathrm{vec}\left(\bigotimes_{n=1}^N\hat{\mathbf x}_{n,u}\cdot\hat{\mathbf h}_u^T\right)-\mathrm{vec}\left(\bigotimes_{n=1}^N\mathbf x_{n,u}\cdot(\mathbf h_u^*)^T\right)\right\|_2^2\\
&=\left\|\left(\mathbf I_L-\frac{(\bigotimes_{n=1}^N\mathbf x_{n,u})(\bigotimes_{n=1}^N\mathbf x_{n,u})^H}{\|\bigotimes_{n=1}^N\mathbf x_{n,u}\|^2}\right)\left(\bigotimes_{n=1}^N\hat{\mathbf x}_{n,u}\cdot\hat{\mathbf h}_u^T\right)\right\|_2^2, \tag{34}
\end{aligned}
$$

其中 $\left(\mathbf I_L-\frac{(\bigotimes_{n=1}^N\mathbf x_{n,u})(\bigotimes_{n=1}^N\mathbf x_{n,u})^H}{\|\bigotimes_{n=1}^N\mathbf x_{n,u}\|^2}\right)$ 表示相应的投影矩阵。基于 2-范数与投影的性质，(15) 可等价变换为

$$
\max_{\mathbf x_{n,u}\in\mathcal C_n}\frac{\left\|(\bigotimes_{n=1}^N\mathbf x_{n,u})(\bigotimes_{n=1}^N\mathbf x_{n,u})^H(\bigotimes_{n=1}^N\hat{\mathbf x}_{n,u})\right\|_2^2}{\left\|\bigotimes_{n=1}^N\mathbf x_{n,u}\right\|_2^4}. \tag{35}
$$

最终，根据 Kronecker 积的性质 $(\mathbf a\otimes\mathbf b)^H(\mathbf c\otimes\mathbf d)=(\mathbf a^H\mathbf c)(\mathbf b^H\mathbf d)$，(15) 中的检测问题可表示为

$$
\max_{\hat{\mathbf x}_{n,u}\in\mathcal C_n}\prod_{n=1}^N\frac{\left|\mathbf x_{n,u}^H\hat{\mathbf x}_{n,u}\right|}{\|\hat{\mathbf x}_{n,u}\|_2\|\mathbf x_{n,u}\|_2}, \tag{36}
$$

这证实了关于检测对 $\mathbf h_u$ 稳健的讨论。

### D. 与经典 ALS 的兼容性

尽管所提 GLSA-ALS 方法基本足以高效恢复因素矩阵以供基于 ML 的检测使用，但由于迭代加速，尤其在活跃设备数较大时，估计精度的轻微损失仍不可避免。幸运的是，所设计方法的松弛因子选择是灵活的：$\mu_{\mathrm{LS}}=1$ 会使 GLSA-ALS 退化为 ALS，从而在收敛的前提下追求更好的精度性能。因此，所提 GLSA-ALS 可按精度或复杂度的不同需求退化为经典 ALS。相应地，所提检测方法的框图如图 2 所示，其中 $U_t$ 表示特定应用场景下的经验切换位置。

> **图 2（原文 Fig. 2）：** 基于张量的 URA 方案中，所提检测方法的框图。

## V. 仿真结果

本节进行数值仿真以验证所提基于张量的 LEO 卫星物联网无源随机接入方案的有效性。根据 3GPP 技术报告（TR）38.811、TR 38.821 以及一些现有相关工作，除非另有说明，仿真参数按表 III 设置 [32], [36], [48]。一般地，采用平均每用户错误概率（per user probability of error，PUPE）衡量检测性能，其定义见 [14] 与 [25]：

$$
\mathrm{PUPE}=\mathbb E\left\{\frac{|\mathcal L-\hat{\mathcal L}|_c}{|\mathcal L|_c}\right\}, \tag{37}
$$

其中 $\mathcal L$ 与 $\hat{\mathcal L}$ 分别表示检测消息列表与发送消息列表。此外，我们用平均迭代次数与迭代次数的方差评估收敛性能。为确保性能分析的可靠性，仿真结果由 10000 次独立信道实现平均得到。对张量形式的信号，SNR 定义为

$$
\mathrm{SNR}=\frac{\|\mathcal Y-\mathcal Z\|_F^2}{\|\mathcal Z\|_F^2}. \tag{38}
$$

> **表 III（原文 Table III）：** 仿真参数。

| 参数 | 取值 |
|---|---|
| 载波频率 $f_c$ | 30GHz |
| 传播距离 $d_0$ | 1000km |
| 卫星接收天线增益 $\alpha_u$ | 20dBi |
| 发射增益与噪声温度之比 $G_u/T_0$ | 34dB/K |
| 载波带宽 $W$ | 25MHz |
| 雨衰均值 $\mu_r$ | -2.6dB |
| 雨衰方差 $\sigma_r^2$ | 1.63dB |
| Rician 因子 $\gamma_u$ | 8 |
| 玻尔兹曼常数 $\kappa$ | $1.38\times10^{-23}$ J/K |
| LOS 分量 $\lVert\mathbf h_u^{\mathrm{LOS}}\rVert_2^2$ | $\mathcal U[0.6,0.7]$ |
| NLOS 方差 $(\sigma_u^{\mathrm{NLOS}})^2$ | $\mathcal{CN}[0.2,0.25]$ |
| 最大迭代次数 $I_{\mathrm{iter}}$ | 100 |
| 信息比特长度 $B$ | 140, 112 |
| 因子化信道使用数 $N$ | 4, 5 |
| 天线数 $M$ | 2, 48 |
| 活跃设备数 $U_a$ | 20~100 |
| 终止阈值 $\xi$ | $10^{-6}$ |

### A. 不同松弛因子的影响

本部分从收敛性与检测性能两方面全面展示所提 GLSA-ALS 方法在不同 $\mu_{\mathrm{LS}}$ 下的有效性。回顾 GLSA-ALS 的松弛因子取为 $\mu_{\mathrm{LS}}=\eta^{1/(N+1)}$，而传统 ALS 方法可视为 $\mu_{\mathrm{LS}}=1$。因此，为便于说明，我们另设两个固定值松弛因子 $\mu_{\mathrm{LS}}=1.2$ 与 $\mu_{\mathrm{LS}}=6.0$，以详细揭示加速效果。不失一般性，为便于比较，仿真参数取 $\mathrm{SNR}=5$dB、$N=4$、$L_n=(10,10,8,8)$ 与 $M=48$。

图 3 以总迭代次数比较了传统 ALS 方法与不同 $\mu_{\mathrm{LS}}$ 下所提 GLSA-ALS 方法的收敛性能。注意，给定 $N$ 的具体取值，$\mu_{\mathrm{LS}}$ 会随迭代逐渐增大，表明其在线搜索过程中的自动调节特性。因此，$\mu_{\mathrm{LS}}=1.2$ 与 $\mu_{\mathrm{LS}}=6.0$ 大致代表迭代过程中的最小与最大值，有助于说明固定松弛因子对线搜索的影响。图 3 表明，随着活跃设备数增加，所有方案收敛所需的总迭代次数近似线性增长。然而，由于线搜索加速，所提 GLSA-ALS 方法收敛所需迭代次数始终少于传统 ALS 方法，且当 $U_a>60$ 时差距显著增大。迭代次数的差距表明 GLSA-ALS 的收敛速度始终快于 ALS，尤其在活跃设备数较多的条件下：在 $U_a=100$ 时 ALS 的迭代次数超过 GLSA-ALS 的 150%。此外，尽管固定 $\mu_{\mathrm{LS}}$ 的收敛速度在 $U_a>80$ 时快于 ALS，它们仍明显慢于 $\mu_{\mathrm{LS}}=\eta^{1/(N+1)}$，其中 $\mu_{\mathrm{LS}}=6.0$ 的性能在 $U_a\le60$ 之前甚至差于 ALS。因此，松弛因子的合理选择保证了所提 GLSA-ALS 方法的收敛速度提升。

> **图 3（原文 Fig. 3）：** 不同活跃设备数下所需的迭代次数。

为从稳定性角度进一步说明收敛性能，我们在图 4 中给出保证收敛所需迭代次数的相应方差。总体上，方差越大表明稳定性越差，即某些传输中收敛速度会显著减慢，远离平均性能。图 4 表明，随着活跃设备数增加，ALS 的方差总体呈上升趋势，而 GLSA-ALS 的方差在一定范围内保持相对稳定。具体地，相应方差差距约达 1–2 个数量级，并在 $U_a>60$ 时显著扩大。事实上，因素矩阵规模会随活跃设备数增加而增大，更大的数值不确定性显著影响迭代效率。因此，若不考虑迭代次数的限制，ALS 方法在每次传输中都能收敛，但所需计算复杂度也显著增加。此外，尽管 $\mu_{\mathrm{LS}}=1.2$ 的性能比 ALS 更稳定，它仍始终差于 $\mu_{\mathrm{LS}}=\eta^{1/(N+1)}$ 的 GLSA-ALS；而 $\mu_{\mathrm{LS}}=6.0$ 的 GLSA-ALS 尽管在 $U_a=20$ 时方差最小，其稳定性却最差，这证实了恰当选择松弛因子的重要性。

> **图 4（原文 Fig. 4）：** 不同活跃设备数下迭代次数的方差。

图 5 展示图 3 与图 4 相同条件下的 PUPE 性能，表明迭代加速对检测精度的影响。可以观察到，当 $U_a\le60$ 时，无论松弛因子如何选择，ALS 与 GLSA-ALS 的 PUPE 性能都非常接近，可达 $10^{-5}$ 量级。然而，在 $U_a>60$ 时，由于 GLSA-ALS 的检测精度下降，性能差距被拉大。基于图 3 与图 4 的结果，事实上当 $U_a>60$ 时，ALS 所需迭代次数相比有效加速的 GLSA-ALS 显著增加，这使 ALS 以额外计算复杂度为代价获得更好性能。然而，若某些特定应用场景中检测器计算复杂度受限，当 ALS 因可能的沼泽现象而收敛缓慢时，它会在有限迭代次数内无法正确检测。具体地，GLSA-ALS 与 ALS 之间的计算复杂度降低主要体现在矩阵更新上，约为 $\mathcal O((I_{\mathrm{ALS}}-I_{\mathrm{GLSA}})(U_aML(1+1/L_n)+U_a^2L_n+U_aL_n))$，其中 $I_{\mathrm{ALS}}$ 表示 ALS 的总迭代次数。尽管 GLSA-ALS 的额外松弛与判断操作需要 $\mathcal O((I_{\mathrm{GLSA}}-2(N+1))(U_aL_n+L))$，当 $U_a>60$ 时 GLSA-ALS 的总计算复杂度相比 ALS 显著降低。因此，所提 GLSA-ALS 方法更高效，且 $\mu_{\mathrm{LS}}$ 的灵活选择使检测器能在 GLSA-ALS 与传统 ALS 之间自适应切换，以满足不同精度与复杂度需求。此外，尽管 $\mu_{\mathrm{LS}}=1.2$ 与 $\mu_{\mathrm{LS}}=6.0$ 的 PUPE 性能与 GLSA-ALS 中 $\mu_{\mathrm{LS}}=\eta^{1/(N+1)}$ 相近，但图 3 所示更多迭代次数使它们成为在 ALS 之间可能切换时的不理想选择。

> **图 5（原文 Fig. 5）：** 不同活跃设备数下的 PUPE 性能。

### B. 不同检测方法的性能比较

为在不同仿真参数下验证所提方法的有效性，图 6、图 7、图 8 与图 9 展示了不同检测方法的 PUPE 性能，其中基于 GN 的方法 [25], [27], [41], [42] 被选作比较对象。具体地，由于在处理共线性挑战方面的优越能力，阻尼 GN（damped GN）算法被选为基准 [42]（参见第 V 节）。

在图 6 中，我们比较不同 SNR 下的 PUPE 性能。可以观察到，所有方法的性能都随 SNR 增加而明显提升，而所提高效 GLSA-ALS 方法明显优于 GN 方法。事实上，在 GN 方法估计因素矩阵的过程中，每次迭代更新都需要矩阵求逆运算，其中涉及目标残差张量的 Hessian 矩阵。经过一定次数迭代后，需要求逆的项接近奇异矩阵，从而恶化恢复因素矩阵的精度，导致更差的 PUPE 性能。这一现象主要源于实际通信系统中因素矩阵的数值特性在某种程度上接近病态。因此，所提 GLSA-ALS 方法通常比 GN 方法优一个数量级以上。此外，GLSA-ALS 与传统 ALS 之间的性能差距在不同 SNR 下相似，这与图 5 的分析一致，并为以 $U_t=60$ 进行自适应切换、从而在检测精度与计算复杂度之间取得更好折中提供了建议。

> **图 6（原文 Fig. 6）：** 不同 SNR 下的 PUPE 性能，$N=4$，$L_n=(10,10,8,8)$，$M=48$。

随后，图 7 进一步给出一定活跃设备数下不同 SNR 的 PUPE 性能。可以观察到，在低 SNR 条件下，GN 与传统 ALS 的性能都相对稳定，其中 ALS 表现更好并保持在 $10^{-5}$ 量级。此外，尽管 GLSA-ALS 方法在 SNR 小于 0dB 时差于 GN 与 ALS，其检测性能随 SNR 增加显著提升，验证了所提方法的有效性。此外，得益于与 ALS 的兼容性，所提 GLSA-ALS 可根据具体检测精度需求合理调整切换时机，从而保证低 SNR 条件下的性能。

> **图 7（原文 Fig. 7）：** 一定活跃设备数下不同 SNR 的 PUPE 性能，$N=4$，$L_n=(10,10,8,8)$，$M=48$，$U_a=60$。

为说明检测精度随所研究 URA 系统张量尺寸的变化，图 8 给出不同 $L_n$ 下的 PUPE 性能。具体地，因子化设为 $N=4$ 与 $N=5$，并分别取 $L_n=(10,10,8,8)$ 与 $(8,8,5,5,4)$，其中更大的 $N$ 导致需要估计更多更小尺寸的因素矩阵。可以观察到，所有方法在 $N=4$ 下的 PUPE 性能都优于 $N=5$，且不同方法之间的性能差距与图 6 的结果一致。事实上，不同因子化对 PUPE 性能的影响可通过每活跃设备的自由度（degrees of freedom，DoF）数解释，而 DoF 会在设备协作下达到其上界 [25]。特别地，考虑维数为 $L_n$ 的 Grassmannian 线簇中的一个变量具有 $L_n-1$ 个 DoF [45]，则基于秩为 $U_a$ 的张量形式模型的所有活跃设备的总 DoF 可定义为 $\mathrm{DoF}(U_a)=U_a\sum_{n=1}^N(L_n-1)$。因此，给定一定活跃设备数，$N=4$ 的可用 DoF 高于 $N=5$，从而有利于所提基于张量的 URA 系统获得更好的检测。相反，较小 $N$ 导致的更大尺寸因素矩阵会略微增加所有方法的计算复杂度，这直接使 GN 中的矩阵求逆与基于 ALS 方法中的迭代更新变复杂。因此，这也是基于实际需求的一种折中选择。

> **图 8（原文 Fig. 8）：** 不同信道使用因子化下的 PUPE 性能，$\mathrm{SNR}=3$dB，$M=48$。

图 9 给出不同接收天线数下的 PUPE 性能。可以观察到，同一方法在 $M=48$ 下的检测精度显著优于 $M=2$ 下的性能，其中当 $U_a\ge80$ 时 GN 与 GLSA-ALS 在 $M=2$ 下的 PUPE 差于 $10^{-1}$。这一现象表明，所提基于张量的 URA 方案可从大量天线带来的空间分集中获益，这也可从唯一性分析部分的可辨识性角度解释，即 (15)–(20)。此外，$M=2$ 下 GLSA-ALS 的 PUPE 与 GN 几乎相同，但比 ALS 差约两个数量级。相应的性能差距表明为 URA 系统部署大量天线的重要性，这保证了所提检测方法带来的可接受性能折中。此外，图 9 还表明在 $M=48$ 与 $\mathrm{SNR}=10$dB 下 GLSA-ALS 与 ALS 之间性能差距可忽略，这证实了 GLSA-ALS 在高 SNR 区的有效性。因此，为效率起见，在该情形下所提加速检测方法可从 $U_a=20$ 连续使用到 $U_a=100$ 而无需切换。

> **图 9（原文 Fig. 9）：** 不同天线数下的 PUPE 性能，$\mathrm{SNR}=10$dB，$N=4$，$L_n=(10,10,8,8)$。

## VI. 结论

本文研究了面向 LEO 卫星物联网场景的有效无源随机接入方案。通过利用 Grassmannian 星座进行调制，提出了一种基于张量的 URA 方案，可用于通过一般 CP 分解处理设备分离与信号检测。此外，为刻画可支持活跃设备数的边界，给出了同时从充分与必要条件出发的全面唯一性分析，也为检测提供了理论保障。然后，通过利用线搜索的加速效果，提出了一种有效的 GLSA-ALS 方法，能够快速收敛并高效恢复因素矩阵以支撑后续检测。此外，得益于松弛因子选择的灵活性，所提 GLSA-ALS 方法可与经典 ALS 方法兼容，使所设计 URA 方案能满足实际场景中对计算复杂度与检测精度的不同需求。仿真结果验证，所提方法在面向 LEO 卫星物联网的基于张量的 URA 方案中优于现有最先进解，展示了所提方法的优越性。

## 图注与表注索引

本页图 1–9 的中文图注与表 I–III 的表注均按原文出现位置内联在正文中（图 1 见第 II 节，图 2 见第 IV-D 节，图 3–9 见第 V 节；表 I 见第 I 节，表 II 见第 II-A 节，表 III 见第 V 节开头），此处不重复罗列。原文为 IEEE 双栏期刊排版，部分图（Fig. 3–Fig. 9）以浮动方式跨栏放置，本页按逻辑出现顺序内联。

## 参考文献（英文原书目）

- [1] L. D. Xu, W. He, and S. Li, "Internet of Things in industries: A survey," IEEE Trans. Ind. Informat., vol. 10, no. 4, pp. 2233–2243, Nov. 2014.
- [2] A. Zanella, N. Bui, A. Castellani, L. Vangelista, and M. Zorzi, "Internet of Things for smart cities," IEEE Internet Things J., vol. 1, no. 1, pp. 22–32, Feb. 2014.
- [3] N. Ahmed, D. De, and I. Hussain, "Internet of Things (IoT) for smart precision agriculture and farming in rural areas," IEEE Internet Things J., vol. 5, no. 6, pp. 4890–4899, Dec. 2018.
- [4] X. Chen, D. W. K. Ng, W. Yu, E. G. Larsson, N. Al-Dhahir, and R. Schober, "Massive access for 5G and beyond," IEEE J. Sel. Areas Commun., vol. 39, no. 3, pp. 615–637, Mar. 2021.
- [5] D. C. Nguyen et al., "6G Internet of Things: A comprehensive survey," IEEE Internet Things J., vol. 9, no. 1, pp. 359–383, Jan. 2022.
- [6] M. B. Shahab, R. Abbas, M. Shirvanimoghaddam, and S. J. Johnson, "Grant-free non-orthogonal multiple access for IoT: A survey," IEEE Commun. Surveys Tuts., vol. 22, no. 3, pp. 1805–1838, 3rd Quart., 2020.
- [7] Y. Wu, X. Gao, S. Zhou, W. Yang, Y. Polyanskiy, and G. Caire, "Massive access for future wireless communication systems," IEEE Wireless Commun., vol. 27, no. 4, pp. 148–156, Aug. 2020.
- [8] X. Shao, X. Chen, D. W. K. Ng, C. Zhong, and Z. Zhang, "Cooperative activity detection: Sourced and unsourced massive random access paradigms," IEEE Trans. Signal Process., vol. 68, pp. 6578–6593, 2020.
- [9] B. Wang, L. Dai, Y. Zhang, T. Mir, and J. Li, "Dynamic compressive sensing-based multi-user detection for uplink grant-free NOMA," IEEE Commun. Lett., vol. 20, no. 11, pp. 2320–2323, Nov. 2016.
- [10] M. Ke, Z. Gao, Y. Wu, X. Gao, and R. Schober, "Compressive sensing-based adaptive active user detection and channel estimation: Massive access meets massive MIMO," IEEE Trans. Signal Process., vol. 68, pp. 764–779, 2020.
- [11] X. Zhou et al., "Active terminal identification, channel estimation, and signal detection for grant-free NOMA-OTFS in LEO satellite Internet-of-Things," IEEE Trans. Wireless Commun., vol. 22, no. 4, pp. 2847–2866, Apr. 2023.
- [12] B. Shen, Y. Wu, J. An, C. Xing, L. Zhao, and W. Zhang, "Random access with massive MIMO-OTFS in LEO satellite communications," IEEE J. Sel. Areas Commun., vol. 40, no. 10, pp. 2865–2881, Oct. 2022.
- [13] Y. Li et al., "Unsourced multiple access for 6G massive machine type communications," China Commun., vol. 19, no. 3, pp. 70–87, Mar. 2022.
- [14] M. Ke, Z. Gao, M. Zhou, D. Zheng, D. W. K. Ng, and H. V. Poor, "Next-generation URLLC with massive devices: A unified semi-blind detection framework for sourced and unsourced random access," IEEE J. Sel. Areas Commun., vol. 41, no. 7, pp. 2223–2244, Jul. 2023.
- [15] Y. Polyanskiy, "A perspective on massive random-access," in Proc. IEEE Int. Symp. Inf. Theory (ISIT), Jun. 2017, pp. 2523–2527.
- [16] O. Ordentlich and Y. Polyanskiy, "Low complexity schemes for the random access Gaussian channel," in Proc. IEEE Int. Symp. Inf. Theory (ISIT), Jun. 2017, pp. 2528–2532.
- [17] V. K. Amalladinne, J.-F. Chamberland, and K. R. Narayanan, "A coded compressed sensing scheme for unsourced multiple access," IEEE Trans. Inf. Theory, vol. 66, no. 10, pp. 6509–6533, Oct. 2020.
- [18] S. S. Kowshik, K. Andreev, A. Frolov, and Y. Polyanskiy, "Energy efficient random access for the quasi-static fading MAC," in Proc. IEEE Int. Symp. Inf. Theory (ISIT), Paris, France, Jul. 2019, pp. 2768–2772.
- [19] K. Andreev, S. S. Kowshik, A. Frolov, and Y. Polyanskiy, "Low complexity energy efficient random access scheme for the asynchronous fading MAC," in Proc. IEEE 90th Veh. Technol. Conf. (VTC-Fall), Honolulu, HI, USA, Sep. 2019, pp. 1–5.
- [20] J. Fang, G. Sun, W. Wang, L. You, and R. Ding, "OFDMA-based unsourced random access in LEO satellite Internet of Things," China Commun., vol. 21, no. 1, pp. 13–23, Jan. 2024.
- [21] P. Chen and L. Cheng, "Estimating channels with hundreds of sub-paths for MU-MIMO uplink: A structured high-rank tensor approach," IEEE Signal Process. Lett., vol. 31, pp. 2320–2324, 2024.
- [22] R. Zhang et al., "Integrated sensing and communication with massive MIMO: A unified tensor approach for channel and target parameter estimation," IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 8571–8587, Aug. 2024.
- [23] L. Cheng, Z. Chen, Q. Shi, Y.-C. Wu, and S. Theodoridis, "Towards flexible sparsity-aware modeling: Automatic tensor rank learning using the generalized hyperbolic prior," IEEE Trans. Signal Process., vol. 70, pp. 1834–1849, 2022.
- [24] T. Yang et al., "A unified tensor-based joint AUD and ISAC parameter estimation with large-scale user access," IEEE Trans. Cognit. Commun. Netw., early access, Feb. 25, 2025, doi: 10.1109/TCCN.2025.3545690.
- [25] A. Decurninge, I. Land, and M. Guillaud, "Tensor-based modulation for unsourced massive random access," IEEE Wireless Commun. Lett., vol. 10, no. 3, pp. 552–556, Mar. 2021.
- [26] X. Shao, L. Cheng, X. Chen, C. Huang, and D. W. K. Ng, "Reconfigurable intelligent surface-aided 6G massive access: Coupled tensor modeling and sparse Bayesian learning," IEEE Trans. Wireless Commun., vol. 21, no. 12, pp. 10145–10161, Dec. 2022.
- [27] Z. Luan, Y. Wu, S. Liang, W. Han, B. Bai, and L. Zhang, "Modulation for massive unsourced random access based on tensor block term decomposition," in Proc. IEEE Globecom Workshops (GC Wkshps), Rio de Janeiro, Brazil, Dec. 2022, pp. 637–643.
- [28] Z. Zhang et al., "User activity detection and channel estimation for grant-free random access in LEO satellite-enabled Internet of Things," IEEE Internet Things J., vol. 7, no. 9, pp. 8811–8825, Sep. 2020.
- [29] Z. Gao, K. Ying, C. He, Z. Xiao, D. Zheng, and J. Zhang, "Grant-free random access in massive MIMO based LEO satellite Internet of Things," in Proc. IEEE/CIC Int. Conf. Commun. China (ICCC), Jul. 2021, pp. 700–705.
- [30] L. You, K.-X. Li, J. Wang, X. Gao, X.-G. Xia, and B. Ottersten, "Massive MIMO transmission for LEO satellite communications," IEEE J. Sel. Areas Commun., vol. 38, no. 8, pp. 1851–1865, Aug. 2020.
- [31] Z. Lin, M. Lin, J.-B. Wang, T. de Cola, and J. Wang, "Joint beamforming and power allocation for satellite-terrestrial integrated networks with non-orthogonal multiple access," IEEE J. Sel. Topics Signal Process., vol. 13, no. 3, pp. 657–670, Jun. 2019.
- [32] M. Ying, X. Chen, and X. Shao, "Exploiting tensor-based Bayesian learning for massive grant-free random access in LEO satellite Internet of Things," IEEE Trans. Commun., vol. 71, no. 2, pp. 1141–1152, Feb. 2023.
- [33] J. Chu and X. Chen, "Robust design for integrated satellite–terrestrial Internet of Things," IEEE Internet Things J., vol. 8, no. 11, pp. 9072–9083, Jun. 2021.
- [34] M. R. Bhatnagar, "Making two-way satellite relaying feasible: A differential modulation based approach," IEEE Trans. Commun., vol. 63, no. 8, pp. 2836–2847, Aug. 2015.
- [35] A. Gharanjik, M. R. B. Shankar, P. D. Arapoglou, M. Bengtsson, and B. Ottersten, "Robust precoding design for multibeam downlink satellite channel with phase uncertainty," in Proc. IEEE Int. Conf. Acoust., Speech Signal Process. (ICASSP), Apr. 2015, pp. 3083–3087.
- [36] Non-Terrestrial Networks Channel Models, document TR 38.811 v15.4.0, 3GPP, Sep. 2020.
- [37] T. G. Kolda and B. W. Bader, "Tensor decompositions and applications," SIAM Rev., vol. 51, no. 3, pp. 455–500, Aug. 2009.
- [38] N. D. Sidiropoulos and R. Bro, "On the uniqueness of multilinear decomposition of N-way arrays," J. Chemometrics, vol. 14, no. 3, pp. 229–239, May 2000.
- [39] L. Chiantini, G. Ottaviani, and N. Vannieuwenhoven, "An algorithm for generic and low-rank specific identifiability of complex tensors," SIAM J. Matrix Anal. Appl., vol. 35, no. 4, pp. 1265–1287, Jan. 2014.
- [40] X. Liu and N. D. Sidiropoulos, "Cramér–Rao lower bounds for low-rank decomposition of multidimensional arrays," IEEE Trans. Signal Process., vol. 49, no. 9, pp. 2074–2086, Sep. 2001.
- [41] L. Sorber, M. Van Barel, and L. De Lathauwer, "Optimization-based algorithms for tensor decompositions: Canonical polyadic decomposition, decomposition in rank-(Lr, Lr, 1) terms, and a new generalization," SIAM J. Optim., vol. 23, no. 2, pp. 695–720, Jan. 2013.
- [42] A.-H. Phan, P. Tichavský, and A. Cichocki, "Low complexity damped Gauss–Newton algorithms for CANDECOMP/PARAFAC," SIAM J. Matrix Anal. Appl., vol. 34, no. 1, pp. 126–147, Jan. 2013.
- [43] R. Bro, "Multi-way analysis in the food industry: Models, algorithms, and applications," Ph.D. thesis, Univ. Amsterdam, Amsterdam, The Netherlands, 1998.
- [44] R. A. Harshman, "Foundations of the Parafac procedure: Models and conditions for an explanatory multimodal factor analysis," in Proc. UCLA Working Papers Phonetics, vol. 16, 1970, pp. 1–84.
- [45] K.-H. Ngo, A. Decurninge, M. Guillaud, and S. Yang, "Cube-split: A structured Grassmannian constellation for non-coherent SIMO communications," IEEE Trans. Wireless Commun., vol. 19, no. 3, pp. 1948–1964, Mar. 2020.
- [46] A. Decurninge, I. Land, and M. Guillaud, "Tensor-based modulation for unsourced massive random access," 2020, arXiv:2006.06797.
- [47] M. Rajih, P. Comon, and R. A. Harshman, "Enhanced line search: A novel method to accelerate PARAFAC," SIAM J. Matrix Anal. Appl., vol. 30, no. 3, pp. 1128–1147, Jan. 2008.
- [48] Solutions for NR To Support Non-Terrestrial Networks (NTN), document TR 38.821 v16.2.0, 3GPP, Apr. 2023.

**本页范围与校对状态：** 本页覆盖 IEEE TWC 正式发表版全文（13 页，vol. 25, 2026, pp. 4613–4625，DOI: 10.1109/TWC.2025.3612505）的中文译稿：摘要、关键词、第 I–VI 节正文与编号小节、表 I–III 的逐格转写、图 1–9 的全部中文图注、参考文献 48 条英文原条目（按原编号）、以及原文首页的收稿/资助/单位脚注。原文无附录、无独立致谢节；四位作者的作者简介（第 12–13 页）属非正文内容，按团队规矩略去。公式与表格已对照 PDF 渲染页核对：式 (1)–(38) 逐式核对（重点核对式 (4)–(12)、(19)–(24)、(25)–(31)、(33)–(36)），表 I–III 按 PDF 页面逐格核对（表 I 为文献对比表，表 II 为信道变量表，表 III 为仿真参数表；pymupdf 未检出网格，改用渲染页核对）。已加注三处原文疑点：算法 1 第 13 行的平凡赋值；式 (33) 中未定义的 $\hat{\mathbf x}_{N,k}$ 下标（按上下文应为 $\hat{\mathbf x}_{N,u}$）；以及元数据层面"库内 arXiv 编号 2025.36125 与 PDF 期刊正式版不符"（见页首"原文信息核对"）。本页不上传原文图片，图内曲线与图例数值不作数字化估算。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。

{% endraw %}
