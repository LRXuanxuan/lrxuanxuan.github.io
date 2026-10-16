---
layout: page
title: "基于干扰消除的信道知识地图构建及其信道估计应用｜中文译稿（校对中）"
permalink: /papers/translations/2026-10-16-interference-cancellation-ckm-2409-00461/
math: true
toc: true
---

[← 返回论文库](/papers/) · [原论文 arXiv](https://arxiv.org/abs/2409.00461) · [原 PDF](https://arxiv.org/pdf/2409.00461v1) · [对应推荐记录](/papers/items/ef5d07dc84efccfe/)

# 基于干扰消除的信道知识地图构建及其信道估计应用

**原题：** Interference-Cancellation-Based Channel Knowledge Map Construction and Its Applications to Channel Estimation  
**作者：** Wenjun Jiang、Xiaojun Yuan、Boyu Teng、Hao Wang、Jing Qian  
**来源：** arXiv:2409.00461v1，2024 年 8 月 31 日，13 页。  
**译文说明：** 依照 PDF 原文小节顺序翻译，公式和算法按原编号保留；图题与重要图中文字以文本表达。文中数学式有较多嵌套下标，最终校对请以原 PDF 为准。未经逐段终校，不计入已验收全文。

## 摘要

信道知识地图（channel knowledge map，CKM）被视为无线信道的数字孪生，能够为环境感知通信提供位置相关的信道知识。CKM 辅助通信中的基本问题之一，是如何高效地构建 CKM。现有研究主要假设已测区域具有无误差的信道知识，再进行空间插值或预测，却忽略了信道知识提取过程。

本文针对这一空缺，统一考虑信道知识的提取与表示，提出一种利用基站（BS）接收信号作为低成本在线数据的新型 CKM 构建框架。具体而言，将基站覆盖区域划分为空间网格，依据空间一致性原理，用一组多径功率、时延与角度表征每个网格的信道知识。在提取这些信道参数时，主要难点是强烈的小区间干扰以及接收信号与信道参数之间的非线性关系。

为解决这些问题，本文将 CKM 构建表述为贝叶斯推断问题，并采用块稀疏先验刻画不同干扰用户的路径损耗差异。在贝叶斯框架下，发展一种用于干扰消除辅助 CKM 构建的混合消息传递算法。进一步根据 CKM 计算用户信道的频率—空间联合协方差，设计 CKM 辅助的贝叶斯信道估计器，并利用该协方差的结构显著降低计算复杂度。数值实验表明，提出的 CKM 在低信干噪比（SINR）下仍能提供准确的信道参数，辅助估计器则明显优于已有先进方法。

**关键词：** 数字孪生、信道知识地图、多输入多输出（MIMO）、正交频分复用（OFDM）、小区间干扰、信道估计。

## I. 引言

预计在 2030 年前后，第六代（6G）无线网络将提供无处不在的连接（每平方千米最多 $10^7$ 个节点）、超高吞吐（峰值 Tbps）、超高可靠低时延通信（HRLLC）以及厘米级定位精度 [1]、[2]。为达到这些关键性能指标，需要探索多种前沿技术。一条有前景的路径是从大规模 MIMO 向超大规模 MIMO（XL-MIMO）的发展 [3]，以获得极高的空间复用增益。与此同时，毫米波与太赫兹通信利用其宽阔带宽支持高速率传输。

XL-MIMO、毫米波和太赫兹技术的应用将显著增加节点密度、阵列规模和通信带宽，导致信道响应的频域和空域维度急剧扩张。这给物理层处理带来重要挑战，例如信道状态信息（CSI）采集的计算复杂度增加，以及有效波束成形所需的训练开销增长。

另一方面，密集无线节点与高维信道也意味着大量无线数据可供利用，这些数据反映了局部传播环境的特性，并推动通信系统转向环境感知范式。无线电地图（radio map）[4] 是典型的环境感知技术，记录无线信号特性的空间分布。无线电地图构建可以转化为描述电磁波传播的问题。射线追踪通过求解麦克斯韦方程组近似实现这一目标 [5]，但计算密集，而且依赖散射体的三维模型与电磁属性，因而受到实际部署条件的限制。除基于射线追踪的方法之外，文献 [6] 利用散射体位置与形状，通过随机森林建立路径损耗地图。通常，无线电地图侧重路径损耗 [6]、干扰功率 [7]、功率谱密度 [8] 等与功率相关的指标；但这些指标并不能充分反映无线信道的内在特性。

近年来，信道知识地图（CKM）被提出作为无线电地图的进一步发展，可视作无线信道数字孪生的初步形态 [9]。CKM 可以表示为从用户位置到信道知识的查找表或映射，以反映局部传播环境的内在特征。输入位置可由新兴的通信感知一体化（ISAC）技术 [10] 或 GPS 等现有定位系统获取。输出知识可以按照不同任务需求灵活设计，包括场景信息（如是否存在视距链路）和信道模型参数（如多径时延和角度）。CKM 的查询时延远低于射线追踪模拟器 [5]，因而能够辅助实时物理层处理。文献 [11] 引入信道角度地图（CAM）与波束索引地图（BIM），以较低训练开销实现混合波束成形；文献 [12] 利用 CKM 提供定位锚点并优化锚点选择，以提升定位精度。

除 CKM 辅助通信外，现有 CKM 研究还涉及其构建。文献 [13] 利用部分测量区域的信道数据，通过空间插值在整个目标区域构建 CKM；文献 [14] 采用期望最大化（EM）方法构建信道增益地图（CGM）。

现有 CKM 构建方法 [13]、[14] 假设可在一部分区域获得无噪声信道参数，随后对未测区域的参数插值或预测，忽视了关键的参数提取环节。一种获得高精度信道参数的方法，是借助高发射功率和高精度信道探测仪进行离线测量 [15]。但其成本很高，且对传播环境的改变敏感。为缓解这些问题，可以存储并重复利用基站接收信号，作为低成本的在线数据。不过，利用基站数据又引入新的挑战：终端发射功率通常受限，来自邻小区的强干扰非常常见 [16]；而接收信号又是信道参数的非线性函数，例如路径角度的阵列响应体现为复指数函数 [17]。因此，参数提取直接影响 CKM 精度，不能被忽略。

针对这一问题，本文研究受到小区间干扰（inter-cell interference，ICI）影响的上行 MIMO-OFDM 系统，提出统一提取和表示信道参数的 CKM 框架，并在贝叶斯推断框架内建立基于干扰消除的消息传递算法。进一步将构建好的 CKM 用于基础信道估计任务，设计高性能信道估计器。

本文主要贡献如下。

1. **利用含 ICI 的基站接收信号构建 CKM。** 建立基于 MIMO-OFDM 基站接收信号的 CKM 构建框架；将基站覆盖区域划分为网格，并按网格组织接收信号。在每个网格内，根据空间一致性原理 [18]（即在相关距离内信道具有高度相似性），用信道模型参数表示信道知识。具体参数包括有效路径数量、路径功率、时延及方位/俯仰到达角。除小尺度衰落系数外，这些参数能够表示信道响应的各要素。通过调节有效路径数，可折中信道表示误差与构建成本。
2. **基于干扰消除的贝叶斯 CKM 构建。** 将 CKM 构建表述为贝叶斯推断；以稀疏矩阵表示干扰信道，刻画干扰用户之间显著的路径损耗差异。采用 Bethe 方法 [19] 构建用户/干扰信道后验分布的变分近似，并发展混合消息传递算法求解。在每轮消息传递中，同时提取目标用户信道参数并消除干扰分量。
3. **CKM 辅助的贝叶斯信道估计。** 利用 CKM 提供的用户信道频率—空间联合协方差设计贝叶斯估计器；同时根据 CKM 给出的用户信道功率时延谱（PDP）估计干扰信号的空间协方差。通过利用用户信道协方差结构，令 $N$ 子载波、$M$ 天线、具有 $\bar L$ 条有效路径的 CKM 辅助系统的估计复杂度由 $O(N^3M^3)$ 降至
   $O\!\left(M^2(M+\bar L)+(M+N)\bar L^2+\bar L^3\right)$，并研究估计器性能关于 CKM 输出精度的下界。

仿真结果显示，该 CKM 构建算法在较低 SINR 下、采用米级空间网格时仍可提取准确参数。增大网格尺寸时，可以增加有效路径数以维持期望精度。CKM 辅助信道估计也显著优于已有先进方案。

文章结构如下：第二节给出含 ICI 的 MIMO-OFDM 接收信号模型；第三节提出利用基站接收信号和空间一致性的 CKM 构建框架；第四节将 CKM 构建表述为贝叶斯推断并提出混合消息传递算法；第五节利用 CKM 设计高性能信道估计；第六节和第七节分别报告数值结果并作出结论。

**记号。** 大写粗体字母（如 $\mathbf X$）表示矩阵，小写粗体字母（如 $\mathbf x$）表示向量；$(\cdot)^{\rm T}$、$(\cdot)^*$、$(\cdot)^{\rm H}$ 分别表示转置、共轭和共轭转置；$\delta(\cdot)$ 表示 Dirac delta 函数；$\operatorname{diag}(\mathbf x)$ 表示以 $\mathbf x$ 元素作为对角线的矩阵；$\operatorname{tr}$ 和 $\operatorname{vec}$ 是迹与向量化；$(\cdot)^\dagger$ 是 Moore–Penrose 伪逆；$\otimes$ 与 $\odot$ 为 Kronecker 积与 Hadamard 积；$\mathbf I$ 是合适维度的单位阵。概率密度函数用 $p(x)$ 表示，期望算子为 $\mathbb E$。具有均值 $\boldsymbol\mu$ 和协方差 $\boldsymbol\Sigma$ 的复高斯随机向量 $x\in\mathbb C^N$ 的密度记为

$$
\mathcal{CN}(\mathbf x;\boldsymbol\mu,\boldsymbol\Sigma)
=\frac{\exp\!\bigl(-(\mathbf x-\boldsymbol\mu)^{\rm H}
\boldsymbol\Sigma^{-1}(\mathbf x-\boldsymbol\mu)\bigr)}
{\pi^N|\boldsymbol\Sigma|}.
$$

均值方向为 $\mu$、集中参数为 $\kappa$ 的 von Mises（V-M）圆周随机变量 $x\in[0,2\pi)$ 的密度记为
$\operatorname{VM}(x;\mu,\kappa)=[2\pi I_0(\kappa)]^{-1}\exp(\kappa\cos(x-\mu))$，其中 $I_0$ 为零阶第一类修正 Bessel 函数。

## II. 系统模型

考虑图 1 所示的上行 MIMO-OFDM 系统。基站使用均匀矩形阵列（URA），阵元总数为 $M=M_1M_2$，相邻阵元间距为半波长。基站可以通过时分与频分复用方式为大量用户服务。由于各用户信号模型的形式相同，仅研究第 $t$ 个时隙内使用 $N$ 个子载波与基站通信的目标用户。记子载波间隔为 $\Delta f$。

目标用户采用全向天线，其信号经历多径信道。记第 $t$ 时隙内的多径数量为 $L_t$；第 $l$ 条路径的传播时延、方位到达角（AOA）和天顶到达角分别为 $\widetilde\tau_{t,l}$、$\widetilde\theta_{t,l}$、$\widetilde\phi_{t,l}$。定义归一化时延与两个方向分量：

$$
\tau_{t,l}\triangleq 2\pi\Delta f\,\widetilde\tau_{t,l},\quad
\theta_{t,l}\triangleq\pi\sin\widetilde\theta_{t,l}\cos\widetilde\phi_{t,l},
\quad
\phi_{t,l}\triangleq\pi\sin\widetilde\phi_{t,l}.
$$

第 $t$ 时隙的频率—空间信道为 [17]

$$
\mathbf H_t
=\sum_{l=1}^{L_t}\alpha_{t,l}\sqrt{\rho_{t,l}}\,
\mathbf a_N(\tau_{t,l})
\bigl(\mathbf a_{M_1}(\theta_{t,l})\otimes
\mathbf a_{M_2}(\phi_{t,l})\bigr)^{\rm H}.
\tag{1}
$$

其中 $\rho_{t,l}$ 是第 $l$ 条路径的功率，$\alpha_{t,l}$ 是独立同分布、零均值、单位功率的复随机系数。对应的导向向量定义为

$$
\mathbf a_x(\omega)\triangleq
\frac{1}{\sqrt x}[1,e^{-j\omega},\ldots,e^{-j(x-1)\omega}]^{\rm T},
\qquad j^2=-1.
$$

在 5G 蜂窝网络中，相邻小区共享频谱以提高网络吞吐量 [16]，但同时 ICI 成为限制频谱效率的重要因素。第 $t$ 时隙内，用 $k\in\mathcal K_t=\{1,\ldots,K_t\}$ 标记干扰用户。类似式 (1)，第 $k$ 个干扰用户的信道为

$$
\mathbf H_{t,k}^{\rm I}
=\sum_{l=1}^{L_k^{\rm I}}
\alpha_{t,k,l}^{\rm I}\sqrt{\rho_{t,k,l}^{\rm I}}\,
\mathbf a_N(\tau_{t,k,l}^{\rm I})
\bigl(\mathbf a_{M_1}(\theta_{t,k,l}^{\rm I})
\otimes\mathbf a_{M_2}(\phi_{t,k,l}^{\rm I})\bigr)^{\rm H}.
\tag{2}
$$

$\alpha_{t,k,l}^{\rm I}$、$\rho_{t,k,l}^{\rm I}$、$\tau_{t,k,l}^{\rm I}$、$\theta_{t,k,l}^{\rm I}$、$\phi_{t,k,l}^{\rm I}$ 分别表示干扰路径复系数、功率、归一化时延及两个方向分量。用 $\mathbf X_t\in\mathbb C^{N\times N}$ 和 $\mathbf X_{t,k}^{\rm I}\in\mathbb C^{N\times N}$ 表示目标用户和第 $k$ 个干扰用户的对角导频矩阵，其对角向量分别为 $\mathbf x_t$ 和 $\mathbf x_{t,k}^{\rm I}$。它们采用恒包络信号，功率分别为 $P$ 和 $P^{\rm I}$。

假设循环前缀（CP）长度大于最大信道时延扩展。去除 CP 并进行离散傅里叶变换（DFT）后，频率—空间接收信号为

$$
\mathbf Y_t
=\mathbf X_t\mathbf H_t
+\sum_k\mathbf X_{t,k}^{\rm I}\mathbf H_{t,k}^{\rm I}
+\mathbf N_t. \tag{3}
$$

等价的向量形式为

$$
\begin{aligned}
\mathbf y_t
={}&\sum_l\alpha_{t,l}\sqrt{\rho_{t,l}}\,
\mathbf b(\theta_{t,l},\phi_{t,l})\otimes\mathbf s_t(\tau_{t,l})\\
&+\sum_{k,l}\alpha_{t,k,l}^{\rm I}\sqrt{\rho_{t,k,l}^{\rm I}}\,
\mathbf b(\theta_{t,k,l}^{\rm I},\phi_{t,k,l}^{\rm I})
\otimes\mathbf s_{t,k}^{\rm I}(\tau_{t,k,l}^{\rm I})
+\mathbf n_t .
\end{aligned}\tag{4}
$$

$\mathbf N_t$ 是各元素独立服从 $\mathcal{CN}(0,\gamma)$ 的加性白高斯噪声（AWGN）矩阵。由式 (1)、(2) 代入 (3) 并向量化得到式 (4)。具体而言，$\mathbf y_t=\operatorname{vec}(\mathbf Y_t)$、$\mathbf n_t=\operatorname{vec}(\mathbf N_t)$，
$\mathbf s_t(\tau)=\mathbf x_t\odot\mathbf a_N(\tau)$，
$\mathbf b(\theta,\phi)=\mathbf a_{M_1}(\theta)\otimes\mathbf a_{M_2}(\phi)$，干扰项 $\mathbf s_{t,k}^{\rm I}$ 和 $\mathbf b(\theta^{\rm I},\phi^{\rm I})$ 按同样方式定义。下文使用式 (3) 研究信道估计，使用式 (4) 研究 CKM 构建。为了改善估计性能，需要利用 $\mathbf H_t$ 的先验知识，因此第三、四节构建 CKM；在较低 SINR 下干扰消除同样必不可少，第五节使用 CKM 辅助估计干扰空间协方差。

**图 1｜含小区间干扰的上行传输场景。** 目标基站服务一名目标用户，另有来自邻小区的三名干扰用户；图中展示目标基站覆盖区域及相邻基站的覆盖区域。

## III. 所提出的 CKM 框架

### A. 基本假设

随着 ISAC 快速发展，通信系统可以更有效地完成用户定位。因此，CKM 被定义为从用户位置到某一段传输时隙中信道统计量的映射 [21]。常见 CKM 假设之一是传播环境准静态，即环境在比信号传输周期长得多的时间尺度上保持不变。举例而言，子载波间隔为 $\Delta f=30$ kHz 时，一个 OFDM 符号的传输时长约为 $33.3\,\mu\mathrm s$ [22]；而建筑物变形等环境变化通常以天计。基站部署之后也通常保持固定。因此，在固定基站和准静态传播环境下，可以将信道统计量视为用户位置的向量值函数。

将物理区域划分为 $Q$ 个网格，并以 $T$ 个时隙为周期更新 CKM。每轮更新的流程相同，下面仅讨论一个周期。定义时隙 $t$ 到位置 $q$ 的映射 $\mathcal L(\cdot)$：

$$
\mathcal L(\cdot):\mathcal T\to\mathcal Q,\qquad
q=\mathcal L(t),\tag{5}
$$

其中 $\mathcal T=\{1,\ldots,T\}$ 是时隙集合，$\mathcal Q=\{1,\ldots,Q\}$ 是位置集合，位置 $q$ 对应一个 $d\times d\ \mathrm m^2$ 的物理网格。映射 $\mathcal L$ 是多对一的，因此多个时隙可以对应同一网格。

**假设 1：** CKM 构建满足以下条件：(a) 在任意位置 $q$，连续 $2T$ 个时隙内信道参数 $\rho_{t,l},\tau_{t,l},\theta_{t,l},\phi_{t,l}$ 的变化可忽略；(b) 基站在每个时隙能够获取 $\mathcal L(\cdot)$；(c) 每次 CKM 更新开始前，基站已知所有干扰导频 $\{\mathbf X_{t,k}^{\rm I}\}_{k,t}$。

假设 1(a) 相当于准静态传播环境在 $2T$ 个时隙内成立。因此实践中需要根据环境变化（如建筑结构、天气等）的速度设置 $T$。假设 1(b) 可通过 ISAC 技术或与 GPS 等定位系统协同满足。假设 1(c) 可通过邻小区基站存储并向目标基站共享导频使用信息实现。由于 $T$ 相对较长，交换信息造成的开销很小。还可采用伪随机序列作导频，只共享随机种子。

图 2 给出 CKM 构建流程。定义 $\mathcal T_q=\{t:q=\mathcal L(t)\}$ 为与位置 $q$ 对应的时隙集合。在 $T$ 个时隙中，收集 $\mathbf y_t$（$t\in\mathcal T_q$）作为测量数据；这些数据可以来自该位置用户的参考、同步和导频信号等。使用 $\{\mathbf y_t:t\in\mathcal T_q\}$ 更新 CKM，并在随后的 $T$ 个时隙利用 CKM 进行无线通信。

**图 2｜CKM 构建示意图。** 网格化目标区域中各用户的基站接收信号按位置收集，每经历 $T$ 个时隙执行一次地图更新；“数据收集—更新 CKM”周期性进行，地图结果用于后续物理层操作。

### B. 所提出的 CKM

式 (1) 表明，对于 $t\in\mathcal T_q$，信道由 $\alpha_{t,l}$、$\rho_{t,l}$、$\tau_{t,l}$、$\theta_{t,l}$ 与 $\phi_{t,l}$ 决定。其中 $\alpha_{t,l}$ 是小尺度衰落系数，其相位变化以波长为周期，难以稳定表征；而功率、时延和角度属于具有空间一致性的较大尺度信道参数 [18]。例如，当用户与基站相距 300 m，用户在垂直用户—基站连线方向移动 5 m 时，LOS 路径时延和角度分别仅变化 0.14 ns 与 0.19°。可见在网格尺寸 $d$ 较小时，这些参数能够近似视为常数。

利用空间一致性，把实际路径集合中的 $\{\rho_{t,l},\tau_{t,l},\theta_{t,l},\phi_{t,l}\}_{l=1}^{L}$ 替换成位置相关的有限有效路径集合
$\{\bar\tau_{q,l},\bar\theta_{q,l},\bar\phi_{q,l},\bar\rho_{q,l}\}_{l=1}^{\bar L}$，其中 $\bar L$ 为有效信道路径数。由此定义 CKM：

$$
\mathcal C(\cdot):q\longmapsto
\bigl\{\bar\tau_{q,l},\bar\theta_{q,l},
\bar\phi_{q,l},\bar\rho_{q,l}\bigr\}_{l=1}^{\bar L}. \tag{6}
$$

使用 CKM，可将 $t\in\mathcal T_q$ 时隙的用户信道表示为

$$
\mathbf H_t
=\sum_{l=1}^{\bar L}\bar\alpha_{t,l}\sqrt{\bar\rho_{q,l}}\,
\mathbf a_N(\bar\tau_{q,l})\,
\mathbf b(\bar\theta_{q,l},\bar\phi_{q,l})^{\rm H}
+\Delta\mathbf H_t. \tag{7}
$$

其中 $\bar\alpha_{t,l}$ 为第 $l$ 条有效路径的复系数，$\Delta\mathbf H_t$ 为表示误差。有效路径数 $\bar L$ 控制表示精度和构建复杂度的折中；它可以小于真实路径数 $L$，因为时延、角度接近的两条路径可由一条有效路径近似。

式 (7) 中，$\bar\rho_{q,l}$ 除了依赖位置，也与收发阵列的辐射方向图有关 [23]。由于本文假设用户使用全向天线，且 CKM 专门针对每个基站建立，因此在 $\mathcal C(\cdot)$ 中可以忽略阵列辐射方向图的影响。路径时延则包含一个共同的定时偏移（群时延），可以通过校准获得 [24]；本文只提取与传播距离有关的路径时延。

将式 (7) 代入式 (4)，可得基于 CKM 的信号模型

$$
\begin{aligned}
\mathbf y_t={}&
\sum_l\beta_{t,l}\,
\mathbf b(\bar\theta_{q,l},\bar\phi_{q,l})
\otimes\mathbf s_t(\bar\tau_{q,l})\\
&+\sum_{k,l}\beta_{t,k,l}^{\rm I}\,
\mathbf b(\theta_{t,k,l}^{\rm I},\phi_{t,k,l}^{\rm I})
\otimes\mathbf s_{t,k}^{\rm I}(\tau_{t,k,l}^{\rm I})
+\widetilde{\mathbf n}_t .
\end{aligned}\tag{8}
$$

其中 $\beta_{t,l}=\bar\alpha_{t,l}\sqrt{\bar\rho_{q,l}}$，
$\beta_{t,k,l}^{\rm I}=\alpha_{t,k,l}^{\rm I}\sqrt{\rho_{t,k,l}^{\rm I}}$，
$\widetilde{\mathbf n}_t$ 包含 AWGN 和 $\Delta\mathbf H_t$ 所导致的表示误差。式 (8) 中，$\mathbf y_t$ 对应目标用户位于网格 $q$ 的时隙；第二项由不同干扰用户的信号组成。为折中干扰消除的性能与复杂度，对第 $k$ 个干扰用户只需处理主导干扰功率的 $\bar L_k^{\rm I}<L_k^{\rm I}$ 条路径。

**注释 1。** CKM 输出的 $\{\bar\tau,\bar\theta,\bar\phi,\bar\rho\}$ 是位置相关的强先验，有助于高精度信道估计。压缩感知（CS）方法 [25]–[28] 通常在 $\mathbf a_x(\omega)$ 的离散网格上建立字典，通过字典寻找稀疏表示。预先确定的字典若不能精确包含连续参数，会因栅格失配造成能量泄漏。与之相比，本文在 CKM 中无字典地提取连续时延和角度，可将其视为基于式 (8) 的谱估计问题。神经网络方法 [29]–[31] 一般将 $\mathbf H_t$ 作为图像学习相关性；为了泛化，通常用具有不同频率选择性的信道共同训练一个网络，可能导致性能折中。CKM 则输出特定传播环境自身的信道参数。

**注释 2。** 相对文献 [13]、[14]，本文 CKM 的重要改进是明确考虑实际干扰以及干扰消除机制。现实中干扰强度未知，且由于发射功率和路径损耗差异巨大，部分干扰用户信号很弱，可以忽略。因此下一节采用块稀疏性描述干扰信道。
