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


## IV. 基于干扰消除的贝叶斯 CKM 构建

第四节 A 小节建立 CKM 构建的贝叶斯推断框架；B 小节发展消息传递原则；C 小节详细推导消息更新；D 小节采用期望最大化（EM）学习先验参数；E 小节给出总体算法。

### A. 问题表述

基于 $\{\mathbf y_t:t\in\mathcal T_q\}$，希望在消除干扰信号的同时提取 $\bar\tau_{q,l}$、$\bar\theta_{q,l}$、$\bar\phi_{q,l}$ 及 $\bar\rho_{q,l}$，从而构建 CKM。为降低计算复杂度，也可只选择 $\{\mathbf y_t:t\in\mathcal T_q\}$ 的一个子集，构建步骤不变。由于每个位置 $q$ 的 CKM 构建相互独立，以下不失一般性地研究一个固定网格。

首先，目标用户信道参数的概率模型为

$$
\bar v_{q,l}\sim
\operatorname{VM}(\bar v_{q,l};
\mu^{\rm pri}_{\bar v_{q,l}},
\kappa^{\rm pri}_{\bar v_{q,l}}),\qquad
v\in\{\tau,\theta,\phi\},\tag{9a}
$$

$$
\beta_{t,l}\sim\mathcal{CN}
(\beta_{t,l};0,\bar\rho_{q,l}).\tag{9b}
$$

上标“pri”表示先验；式 (9b) 把路径功率 $\bar\rho_{q,l}$ 视为 $\beta_{t,l}$ 的方差。干扰信道的概率模型为

$$
v_{t,k,l}^{\rm I}\sim
\operatorname{VM}(v_{t,k,l}^{\rm I};
\mu_{v_{t,k,l}^{\rm I}}^{\rm pri},
\kappa_{v_{t,k,l}^{\rm I}}^{\rm pri}),
\quad v\in\{\tau,\theta,\phi\},\tag{10a}
$$

$$
\boldsymbol\beta_{t,k}^{\rm I}\sim
(1-\lambda)\delta(\boldsymbol\beta_{t,k}^{\rm I})
+\lambda\mathcal{CN}\left(
\boldsymbol\beta_{t,k}^{\rm I};
\mathbf0,\operatorname{diag}(\boldsymbol\rho_{t,k}^{\rm I})
\right),\tag{10b}
$$

其中 $\boldsymbol\beta_{t,k}^{\rm I}=[\beta_{t,k,1}^{\rm I},\ldots,\beta_{t,k,L_k^{\rm I}}^{\rm I}]^{\rm T}$，$\boldsymbol\rho_{t,k}^{\rm I}$ 为相应路径功率向量。式 (10b) 的 Bernoulli–Gaussian（伯努利—高斯）模型使整个干扰路径系数向量以概率 $1-\lambda$ 为零，用来刻画第 $k$ 个干扰用户可能遭受的严重路径损耗。注意，这里的稀疏是**按干扰用户分组的块稀疏**，不是简单地对每条路径独立判零。

将所有时隙中目标用户参数 $\{\bar\tau_{q,l},\bar\theta_{q,l},\bar\phi_{q,l},\beta_{t,l}\}_{t\in\mathcal T_q,l}$ 以任意固定顺序堆成向量 $\boldsymbol\xi_q$；同理，将第 $t$ 时隙全部干扰用户的 $\{\tau_{t,k,l}^{\rm I},\theta_{t,k,l}^{\rm I},\phi_{t,k,l}^{\rm I},\beta_{t,k,l}^{\rm I}\}_{k,l}$ 堆成 $\boldsymbol\xi_t^{\rm I}$。给定观测 $\{\mathbf y_t:t\in\mathcal T_q\}$，联合后验可因子分解为

$$
\begin{aligned}
&p(\boldsymbol\xi_q,\{\boldsymbol\xi_t^{\rm I}\}_{t\in\mathcal T_q}
\mid\{\mathbf y_t\}_{t\in\mathcal T_q})\\
&\ \propto
\prod_t p(\mathbf y_t\mid\boldsymbol\xi_q,\boldsymbol\xi_t^{\rm I})
\prod_l p(\bar\tau_{q,l})p(\bar\theta_{q,l})p(\bar\phi_{q,l})
\prod_{t,l}p(\beta_{t,l})\\
&\qquad\times
\prod_{t,k,l}
p(\tau_{t,k,l}^{\rm I})p(\theta_{t,k,l}^{\rm I})p(\phi_{t,k,l}^{\rm I})
\prod_{t,k}p(\boldsymbol\beta_{t,k}^{\rm I}).
\end{aligned}\tag{11}
$$

根据式 (11)，直接计算贝叶斯最优 MMSE 估计需要高维积分，计算不可行，因此下面设计消息传递算法获取近似解。

### B. 消息传递原则

源于核物理的 Bethe 方法 [19] 已被广泛用于发展变分推断和消息传递算法。文献 [32]–[34] 指出，在不同约束下，Bethe 框架可统一三种常见消息更新规则：置信传播（BP）[19]、变分消息传递（VMP）[35] 与期望传播（EP）[36]。本文借鉴上述工作，以 Bethe 方法变分近似联合后验。

令 $b(\boldsymbol\xi_q,\{\boldsymbol\xi_t^{\rm I}\})$ 为替代概率密度，目标是最小化其与精确后验之间的变分自由能：

$$
\mathcal F(b)
\triangleq
\operatorname{KL}\!\left[
b(\boldsymbol\xi_q,\{\boldsymbol\xi_t^{\rm I}\})
\Vert
p(\boldsymbol\xi_q,\{\boldsymbol\xi_t^{\rm I}\}\mid\{\mathbf y_t\})
\right]
-\ln Z. \tag{12}
$$

其中 $\operatorname{KL}$ 为 Kullback–Leibler 散度，$-\ln Z=-\ln p(\{\mathbf y_t\})$ 称为 Helmholtz 自由能。

图 3 把式 (11) 以因子图表示。矩形“因子节点”代表各概率密度函数，圆形“变量节点”代表各随机变量。为便于书写，以 $f_{\mathbf y_t}$ 等简写各因子。对变量节点 $v$，引入 $b_v(v)$ 近似其边缘后验；对因子节点 $f$ 及其相连变量向量 $\mathbf u_f$，引入 $b_f(\mathbf u_f)$ 近似对应联合后验。这两类替代分布称为置信度（belief）。其分解为

$$
b(\boldsymbol\xi_q,\{\boldsymbol\xi_t^{\rm I}\})
=
\frac{\displaystyle\prod_{f\in\mathcal F}b_f(\mathbf u_f)}
{\displaystyle\prod_{v\in\mathcal V}[b_v(v)]^{A_v-1}},
\tag{13}
$$

其中 $A_v$ 是变量节点 $v$ 相连的因子数，$\mathcal F$、$\mathcal V$ 分别是因子与变量节点集合。原始边缘化一致性条件为

$$
b_v(v)=\int b_f(\mathbf u_f)\,\mathrm d\mathbf u_{f\setminus v}.
\tag{14}
$$

由于式 (14) 可能涉及不可计算的高维积分，本文把边缘一致性放松为数值特征匹配。对涉及复系数 $\beta_{t,l}$ 和 $\beta_{t,k,l}^{\rm I}$ 的先验因子，匹配一、二阶矩 [36]：

$$
\mathbb E[v\mid b_v(v)]
=\mathbb E\!\left[v\;\middle|\int b_f(\mathbf u_f)
\,\mathrm d\mathbf u_{f\setminus v}\right],\tag{15a}
$$

$$
\mathbb E[|v|^2\mid b_v(v)]
=\mathbb E\!\left[|v|^2\;\middle|\int b_f(\mathbf u_f)
\,\mathrm d\mathbf u_{f\setminus v}\right].\tag{15b}
$$

对时延与角度等圆周变量，匹配平均方向的余弦和正弦：

$$
\mathbb E[\cos v\mid b_v(v)]
=\mathbb E\!\left[\cos v\;\middle|\int b_f(\mathbf u_f)
\,\mathrm d\mathbf u_{f\setminus v}\right],\tag{16a}
$$

$$
\mathbb E[\sin v\mid b_v(v)]
=\mathbb E\!\left[\sin v\;\middle|\int b_f(\mathbf u_f)
\,\mathrm d\mathbf u_{f\setminus v}\right].\tag{16b}
$$

观测似然因子 $f_{\mathbf y_t}$ 对系数、时延及两方向阵列响应是多线性函数，直接计算这些匹配条件代价过高。参考文献 [37] 第 10.1.1 节，将对应因子的置信度进一步分解为

$$
b_{f_{\mathbf y_t}}(\mathbf u_f)
=
b_{f_{\mathbf y_t}}(\boldsymbol\beta_t^{u{\rm I}})
\prod_{v\in\mathcal N_{\mathbf y_t}\setminus\boldsymbol\beta_t^{u{\rm I}}}
b_{f_{\mathbf y_t}}(v),\tag{17}
$$

其中 $\boldsymbol\beta_t^{u{\rm I}}=
[\beta_{t,1},\ldots,\beta_{t,\bar L},
(\boldsymbol\beta_{t,1}^{\rm I})^{\rm T},\ldots,
(\boldsymbol\beta_{t,K}^{\rm I})^{\rm T}]^{\rm T}$；
$\mathcal N_{\mathbf y_t}$ 包含这一系数向量及相关目标/干扰路径的全部时延角度变量。后文证明 $b_{f_{\mathbf y_t}}(\boldsymbol\beta_t^{u{\rm I}})$ 是高斯分布，因此其边缘一致性可简化为均值与协方差匹配。

结合式 (13)、(15)–(17)，变分自由能极小化的驻点满足一组固定点方程。用 $\mathcal N(v)$ 表示与变量 $v$ 相连的因子节点集合，$\mathcal N(f)$ 表示与因子 $f$ 相连的变量节点集合，$\mathcal M_{v\to f}$、$\mathcal M_{f\to v}$ 分别为变量到因子及因子到变量的消息：

$$
b_v(v)\propto
\prod_{f\in\mathcal N(v)}\mathcal M_{f\to v}(v),\tag{18a}
$$

$$
b_f(\mathbf u_f)\propto
f(\mathbf u_f)\prod_{v\in\mathcal N(f)}
\mathcal M_{v\to f}(v),
\qquad f\ne f_{\mathbf y_t},\tag{18b}
$$

$$
\begin{aligned}
b_{f_{\mathbf y_t}}(v)
&\propto\exp\!\left(
\int\!
\prod_{\widetilde v\in\mathcal N(f_{\mathbf y_t})\setminus
\{\boldsymbol\beta_t^{u{\rm I}},v\}}
b_{f_{\mathbf y_t}}(\widetilde v)
\ln f_{\mathbf y_t}(\mathbf u_f)\,
\mathrm d\mathbf u_{f\setminus v}
\right)
\mathcal M_{v\to f_{\mathbf y_t}}(v),
\\[-2pt]
&\hspace{35mm}v\in\mathcal N_{\mathbf y_t}\setminus\boldsymbol\beta_t^{u{\rm I}},
\end{aligned}\tag{18c}
$$

$$
\begin{aligned}
b_{f_{\mathbf y_t}}(\boldsymbol\beta_t^{u{\rm I}})
&\propto
\exp\!\left(
\int\!
\prod_{v\in\mathcal N(f_{\mathbf y_t})\setminus\boldsymbol\beta_t^{u{\rm I}}}
b_{f_{\mathbf y_t}}(v)
\ln f_{\mathbf y_t}(\mathbf u_f)\,
\mathrm d\mathbf u_{f\setminus\boldsymbol\beta_t^{u{\rm I}}}
\right)
\prod_{v\in\boldsymbol\beta_t^{u{\rm I}}}
\mathcal M_{v\to f_{\mathbf y_t}}(v).
\end{aligned}\tag{18d}
$$

对应消息表达式为

$$
\mathcal M_{v\to f}(v)
\propto\prod_{\widetilde f\in\mathcal N(v)\setminus f}
\mathcal M_{\widetilde f\to v}(v),\tag{19a}
$$

$$
\mathcal M_{f\to v}(v)
\propto
\frac{
\mathcal P\!\left(
\int f(\mathbf u_f)\prod_{\widetilde v\in\mathcal N(f)}
\mathcal M_{\widetilde v\to f}(\widetilde v)
\,\mathrm d\mathbf u_{f\setminus v}
\right)}
{\mathcal M_{v\to f}(v)},\quad f\ne f_{\mathbf y_t},\tag{19b}
$$

$$
\mathcal M_{f_{\mathbf y_t}\to v}(v)
\propto
\frac{b_{f_{\mathbf y_t}}(v)}
{\mathcal M_{v\to f_{\mathbf y_t}}(v)},\
v\in\mathcal N_{\mathbf y_t}\setminus\boldsymbol\beta_t^{u{\rm I}},\tag{19c}
$$

$$
\mathcal M_{f_{\mathbf y_t}\to v}(v)
\propto
\frac{
\int b_{f_{\mathbf y_t}}(\boldsymbol\beta_t^{u{\rm I}})
\,\mathrm d\boldsymbol\beta_t^{u{\rm I}}{}_{\setminus v}
}{
\mathcal M_{v\to f_{\mathbf y_t}}(v)
},\
v\in\boldsymbol\beta_t^{u{\rm I}}.\tag{19d}
$$

$\mathcal P(b)$ 表示把 $b$ 投影到满足式 (15) 或 (16) 规定矩条件的复高斯分布或 V-M 分布。由高斯投影知式 (19a) 中系数变量到观测因子的消息为高斯分布；又因为式 (8) 对 $\boldsymbol\beta_t^{u{\rm I}}$ 线性，$\ln f_{\mathbf y_t}$ 对该系数向量为二次形式，因此式 (18d) 指数项为高斯函数，乘以高斯先验消息后仍为高斯分布。

式 (18a)–(19c) 的证明主要沿用文献 [34] 附录 A，原文由于篇幅限制予以省略。对 $\beta_{t,l}$ 的消息采用高斯投影，与已有消息传递方法 [33]、[34]、[36] 一致；直观而言，在功率约束下，高斯分布具有最大熵 [38]。同理，在给定平均方向及平均合向量长度的圆周随机变量中，V-M 分布具有最大熵 [39]，因此为圆周参数使用 V-M 投影。

**图 3｜后验分解的因子图。** 矩形为先验/似然概率因子，圆形为复增益、时延与角度变量；多个观测时隙通过共享的网格级参数连接。图中以集合 $\{1,T\}\subseteq\mathcal T_q$ 示意观测时隙。

### C. 消息的详细推导

给定式 (18)、(19)，变量置信度和因子置信度可由消息计算，变量至因子的消息也由其他因子至变量的消息确定。因此每轮迭代只需更新因子至变量的消息及观测因子的置信度。

**1) 与时延及角度变量有关的消息。** 根据式 (19c)，从观测因子 $f_{\mathbf y_t}$ 到目标时延 $\bar\tau_{q,l}$ 的消息为

$$
\begin{aligned}
\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}(\bar\tau_{q,l})
\propto \exp\!\Bigg[
\int\!
\prod_{v\in\mathcal N(f_{\mathbf y_t})\setminus\bar\tau_{q,l}}
b_{f_{\mathbf y_t}}(v)\,
\ln f_{\mathbf y_t}(\mathbf u_{f_{\mathbf y_t}})\,
\mathrm d\mathbf u_{f_{\mathbf y_t}\setminus\bar\tau_{q,l}}
\Bigg].
\end{aligned}\tag{20}
$$

在式 (20) 中，各时延及角度变量的观测因子置信度均用均值方向 $\mu_v$、集中参数 $\kappa_v$ 的 V-M 分布表示；系数联合置信度则为均值 $\boldsymbol\mu_{\boldsymbol\beta_t^{u{\rm I}}}$ 的高斯分布，见式 (30)。代入后进行积分，得到

$$
\begin{aligned}
&\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}(\bar\tau_{q,l})\\
&\quad\propto\exp\left\{\frac2\gamma\,
\Re\left[
\left(
\mathbf R_t^{\rm T}\widehat{\mathbf b}_l^*
-\sum_{j\ne l}
\mu_{\beta_{t,j}}
\widehat{\mathbf b}_l^{\rm H}\widehat{\mathbf b}_j
\widehat{\mathbf s}_{t,j}
-\sum_{k,j}\mu_{\beta_{t,k,j}^{\rm I}}
\widehat{\mathbf b}_l^{\rm H}
\widehat{\mathbf b}_{t,k,j}^{\rm I}
\widehat{\mathbf s}_{t,k,j}^{\rm I}
\right)^{\rm H}
\mu_{\beta_{t,l}}\mathbf s_t(\bar\tau_{q,l})
\right]\right\}.
\end{aligned}\tag{21}
$$

其中 $\mathbf R_t$ 为 $\mathbf y_t$ 重新排列得到的 $M\times N$ 矩阵，
$\widehat{\mathbf b}_l=
\mathbb E[\mathbf a_{M_1}(\bar\theta_{q,l})]
\otimes\mathbb E[\mathbf a_{M_2}(\bar\phi_{q,l})]$；
$\widehat{\mathbf b}_{t,k,l}^{\rm I}$ 同样通过干扰角度分布计算；$\widehat{\mathbf s}_{t,l}=
\mathbf x_t\odot\mathbb E[\mathbf a_N(\bar\tau_{q,l})]$；
$\widehat{\mathbf s}_{t,k,l}^{\rm I}
=\mathbf x_{t,k}^{\rm I}\odot\mathbb E[\mathbf a_N(\tau_{t,k,l}^{\rm I})]$。

对于服从 $\operatorname{VM}(\mu,\kappa)$ 的随机变量 $\omega$，导向向量的期望可用第一类修正 Bessel 函数 $I_n(\kappa)$ 的比值计算，因而能在消息更新中解析求出期望阵列响应。

利用式 (19a) 可得变量向先验因子的合并消息
$\mathcal M_{\bar\tau_{q,l}\to f_{\bar\tau_{q,l}}}
\propto\prod_t\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}$。根据式 (19b)，先验因子返回的消息为

$$
\mathcal M_{f_{\bar\tau_{q,l}}\to\bar\tau_{q,l}}
\propto
\frac{
\mathcal P\!\left[
p(\bar\tau_{q,l})
\prod_t\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}
\right]}
{\prod_t\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}}.
\tag{22}
$$

由于观测消息的乘积形式复杂，投影 $\mathcal P$ 一般没有解析解。本文将该乘积近似为 V-M 分布。具体使用文献 [40] 第 IV-D 节的方法搜索乘积的一个局部最大值 $\widehat\tau_{q,l}$，然后对

$$
f(\bar\tau_{q,l})
\triangleq
\ln\prod_t
\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}(\bar\tau_{q,l})
$$

在 $\widehat\tau_{q,l}$ 处做二阶 Taylor 展开，先得到高斯近似，再利用高斯与 V-M 分布之间的关系 [39] 得到

$$
\prod_t\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}
\approx
\operatorname{VM}\bigl(
\bar\tau_{q,l};
\mu_{\bar\tau_{q,l}\to f_{\bar\tau_{q,l}}},
\kappa_{\bar\tau_{q,l}\to f_{\bar\tau_{q,l}}}
\bigr),\tag{23}
$$

$$
\mu_{\bar\tau_{q,l}\to f_{\bar\tau_{q,l}}}
=\widehat\tau_{q,l}-\frac{f'(\widehat\tau_{q,l})}
{f''(\widehat\tau_{q,l})},\tag{24a}
$$

$$
\kappa_{\bar\tau_{q,l}\to f_{\bar\tau_{q,l}}}
=\mathcal A^{-1}\!\left(
e^{-0.5f''(\widehat\tau_{q,l})}
\right),\qquad
\mathcal A(\kappa)=\frac{I_1(\kappa)}{I_0(\kappa)}.\tag{24b}
$$

将式 (23) 代入式 (22)，由于两个 V-M 概率密度的乘积仍具有 V-M 形式，得到

$$
\mathcal M_{f_{\bar\tau_{q,l}}\to\bar\tau_{q,l}}
=p(\bar\tau_{q,l})
=\operatorname{VM}(
\bar\tau_{q,l};\mu_{\bar\tau_{q,l}}^{\rm pri},
\kappa_{\bar\tau_{q,l}}^{\rm pri}).\tag{25}
$$

进一步有

$$
\begin{aligned}
b_{f_{\mathbf y_t}}(\bar\tau_{q,l})
&\propto
\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}\,
\mathcal M_{\bar\tau_{q,l}\to f_{\mathbf y_t}},\tag{26a}\\
&\propto\mathcal M_{f_{\mathbf y_t}\to\bar\tau_{q,l}}
\prod_{j\ne t}\mathcal M_{f_{\mathbf y_j}\to\bar\tau_{q,l}}
\,\mathcal M_{f_{\bar\tau_{q,l}}\to\bar\tau_{q,l}},\tag{26b}\\
&\propto\operatorname{VM}(
\bar\tau_{q,l};\mu_{\bar\tau_{q,l}\to f},
\kappa_{\bar\tau_{q,l}\to f})
p(\bar\tau_{q,l}),\tag{26c}\\
&\propto\operatorname{VM}(
\bar\tau_{q,l};\mu_{\bar\tau_{q,l}},\kappa_{\bar\tau_{q,l}}).
\tag{26d}
\end{aligned}
$$

这里合并 V-M 消息时，应通过其浓度加权的复向量相加计算最终均值方向与浓度；原式采用 $\mu$、$\kappa$ 的记法与实际圆周参数组合方式存在需精读的符号差异，译稿保留式 (26) 的分布形式，最终参数的精确组合以原 PDF 为准。

对 $\bar\theta_{q,l}$ 也进行同样操作，因子至变量的消息为

$$
\begin{aligned}
\mathcal M_{f_{\mathbf y_t}\to\bar\theta_{q,l}}(\bar\theta_{q,l})
\propto\exp\Bigg\{\frac2\gamma\Re\Bigg[
\Bigg(
\mathbf R_t\widehat{\mathbf s}_{t,l}^*
-\sum_{j\ne l}\mu_{\beta_{t,j}}\,
\widehat{\mathbf s}_{t,l}^{\rm H}\widehat{\mathbf s}_{t,j}
\widehat{\mathbf b}_j
-\sum_{k,j}\mu_{\beta_{t,k,j}^{\rm I}}\,
\widehat{\mathbf s}_{t,l}^{\rm H}
\widehat{\mathbf s}_{t,k,j}^{\rm I}
\widehat{\mathbf b}_{t,k,j}^{\rm I}
\Bigg)^{\rm H}
\mu_{\beta_{t,l}}\,
\bigl(\mathbf a_{M_1}(\bar\theta_{q,l})\otimes
\widehat{\mathbf a}_{M_2}\bigr)
\Bigg]\Bigg\}.
\end{aligned}\tag{27}
$$

按照式 (22)–(26) 获得 $b_{f_{\mathbf y_t}}(\bar\theta_{q,l})$ 的 V-M 分布。因为式 (8) 对 $\bar\theta_{q,l}$ 和 $\bar\phi_{q,l}$ 对称，后者采用相同步骤。干扰信道的时延角度消息与目标用户对应消息类似，但由于其参数不跨时隙共享，可把式 (22)、(23) 中跨时隙的消息乘积去掉。

**2) 与系数 $\boldsymbol\beta_t$ 和 $\boldsymbol\beta_{t,k}^{\rm I}$ 有关的消息。** 将式 (8) 视为复系数的线性模型：

$$
\mathbf y_t=\boldsymbol\Psi_t\boldsymbol\beta_t^{u{\rm I}}
+\mathbf n_t,\tag{28}
$$

其中 $\boldsymbol\Psi_t$ 的每一列由相应用户/干扰路径的导频—时延向量与空间导向向量的 Kronecker 积构成：
$\boldsymbol\Psi_t=[
\mathbf s_t(\bar\tau_{q,1})\otimes
\mathbf b(\bar\theta_{q,1},\bar\phi_{q,1}),\ldots,
\mathbf s_{t,k}^{\rm I}(\tau_{t,k,l}^{\rm I})\otimes
\mathbf b(\theta_{t,k,l}^{\rm I},\phi_{t,k,l}^{\rm I}),\ldots]$。

由式 (18d) 可得联合系数置信度

$$
\begin{aligned}
b_{f_{\mathbf y_t}}(\boldsymbol\beta_t^{u{\rm I}})
&\propto
\mathcal{CN}\!\left(
\boldsymbol\beta_t^{u{\rm I}};
\mathbb E[\boldsymbol\Psi_t^{\rm H}\boldsymbol\Psi_t]^{-1}
\widehat{\boldsymbol\Psi}_t^{\rm H}\mathbf y_t,
\gamma\mathbb E[\boldsymbol\Psi_t^{\rm H}\boldsymbol\Psi_t]^{-1}
\right)\\
&\qquad\times
\mathcal{CN}\!\left(
\boldsymbol\beta_t^{u{\rm I}};
\boldsymbol\mu_{f_\beta\to\beta},
\boldsymbol\Sigma_{f_\beta\to\beta}\right),\tag{29a}\\
&\propto\mathcal{CN}\!\left(
\boldsymbol\beta_t^{u{\rm I}};
\boldsymbol\mu_{\boldsymbol\beta_t^{u{\rm I}}},
\boldsymbol\Sigma_{\boldsymbol\beta_t^{u{\rm I}}}
\right).\tag{29b}
\end{aligned}
$$

期望按各路径时延与角度的 V-M 置信度计算。高斯乘积公式给出

$$
\begin{aligned}
\boldsymbol\Sigma_{\boldsymbol\beta_t^{u{\rm I}}}
&=\left(
\boldsymbol\Sigma_{f_\beta\to\beta}^{-1}
+\gamma^{-1}\mathbb E[
\boldsymbol\Psi_t^{\rm H}\boldsymbol\Psi_t]
\right)^{-1},\\
\boldsymbol\mu_{\boldsymbol\beta_t^{u{\rm I}}}
&=\boldsymbol\Sigma_{\boldsymbol\beta_t^{u{\rm I}}}
\left(
\boldsymbol\Sigma_{f_\beta\to\beta}^{-1}
\boldsymbol\mu_{f_\beta\to\beta}
+\gamma^{-1}\widehat{\boldsymbol\Psi}_t^{\rm H}\mathbf y_t
\right).
\end{aligned}\tag{30}
$$

为降低计算复杂度，每轮消息传递忽略 $\boldsymbol\Sigma_{\boldsymbol\beta_t^{u{\rm I}}}$ 的非对角项。记 $\mu_{\beta_{t,l}}$ 和 $v_{\beta_{t,l}}$ 分别为联合高斯均值的第 $l$ 个分量及协方差的第 $l$ 个对角元素。由式 (19d) 得到观测因子至 $\beta_{t,l}$ 的高斯消息

$$
\mathcal M_{f_{\mathbf y_t}\to\beta_{t,l}}
\propto
\mathcal{CN}(
\beta_{t,l};\mu_{f_{\mathbf y_t}\to\beta_{t,l}},
v_{f_{\mathbf y_t}\to\beta_{t,l}}),\tag{31}
$$

其中

$$
\mu_{f_{\mathbf y_t}\to\beta_{t,l}}
=v_{f_{\mathbf y_t}\to\beta_{t,l}}
\left(
\frac{\mu_{\beta_{t,l}}}{v_{\beta_{t,l}}}
-\frac{\mu_{f_{\beta_{t,l}}\to\beta_{t,l}}}
{v_{f_{\beta_{t,l}}\to\beta_{t,l}}}
\right),\tag{32a}
$$

$$
v_{f_{\mathbf y_t}\to\beta_{t,l}}
=\left(
v_{\beta_{t,l}}^{-1}
-v_{f_{\beta_{t,l}}\to\beta_{t,l}}^{-1}
\right)^{-1}.\tag{32b}
$$

将式 (9b) 的高斯先验与式 (31) 结合，再应用式 (19b)，可得

$$
\mathcal M_{f_{\beta_{t,l}}\to\beta_{t,l}}
\propto
\frac{\mathcal P\!\bigl(
\mathcal M_{f_{\mathbf y_t}\to\beta_{t,l}}
p(\beta_{t,l})\bigr)}
{\mathcal M_{f_{\mathbf y_t}\to\beta_{t,l}}}
\propto\mathcal{CN}(0,\bar\rho_{q,l}).\tag{33}
$$

用 $\beta_{t,k,l}^{\rm I}$ 替代上式的 $\beta_{t,l}$，类似得到干扰系数的观测消息：

$$
\mathcal M_{f_{\mathbf y_t}\to\beta_{t,k,l}^{\rm I}}
\propto\mathcal{CN}(
\beta_{t,k,l}^{\rm I};
\mu_{f_{\mathbf y_t}\to\beta_{t,k,l}^{\rm I}},
v_{f_{\mathbf y_t}\to\beta_{t,k,l}^{\rm I}}).
\tag{34}
$$

将同一干扰用户的所有路径消息相乘，得到一个向量高斯分布
$\mathcal{CN}(\boldsymbol\mu_{\mathbf y,t,k},
\boldsymbol\Sigma_{\mathbf y,t,k})$，其中 $\boldsymbol\Sigma_{\mathbf y,t,k}$ 是对角矩阵。对其乘上式 (10b) 的块稀疏先验，有

$$
\begin{aligned}
b_{f_{\boldsymbol\beta_{t,k}^{\rm I}}}
(\boldsymbol\beta_{t,k}^{\rm I})
&\propto p(\boldsymbol\beta_{t,k}^{\rm I})
\mathcal M_{f_{\mathbf y_t}\to\boldsymbol\beta_{t,k}^{\rm I}}\\
&\propto(1-\lambda_{t,k}^{\rm post})
\delta(\boldsymbol\beta_{t,k}^{\rm I})
+\lambda_{t,k}^{\rm post}
\mathcal{CN}(
\boldsymbol\beta_{t,k}^{\rm I};
\boldsymbol\eta_{t,k},\boldsymbol\Lambda_{t,k}).
\end{aligned}\tag{35}
$$

这里 $\lambda_{t,k}^{\rm post}$ 是给定观测后第 $k$ 个干扰用户处于非零状态的概率，具体为

$$
\lambda_{t,k}^{\rm post}
=\left(
1+
\frac{(1-\lambda)\,
\mathcal{CN}(\mathbf0;\boldsymbol\mu_{\mathbf y,t,k},
\boldsymbol\Sigma_{\mathbf y,t,k})}
{\lambda\,
\mathcal{CN}(\mathbf0;\boldsymbol\mu_{\mathbf y,t,k},
\boldsymbol\Sigma_{\mathbf y,t,k}
+\operatorname{diag}(\boldsymbol\rho_{t,k}^{\rm I}))}
\right)^{-1},\tag{36a}
$$

$$
\boldsymbol\Lambda_{t,k}
=\left(
\boldsymbol\Sigma_{\mathbf y,t,k}^{-1}
+\operatorname{diag}(\boldsymbol\rho_{t,k}^{\rm I})^{-1}
\right)^{-1},\tag{36b}
$$

$$
\boldsymbol\eta_{t,k}
=\boldsymbol\Lambda_{t,k}
\boldsymbol\Sigma_{\mathbf y,t,k}^{-1}
\boldsymbol\mu_{\mathbf y,t,k}.\tag{36c}
$$

利用式 (35) 计算各干扰路径系数的高斯投影，其均值和方差为

$$
\mu_{f_{\beta_{t,k,l}^{\rm I}}}
=\lambda_{t,k}^{\rm post}\eta_{t,k,l},\tag{37a}
$$

$$
v_{f_{\beta_{t,k,l}^{\rm I}}}
=\lambda_{t,k}^{\rm post}
\left(|\eta_{t,k,l}|^2+
[\boldsymbol\Lambda_{t,k}]_{l,l}\right)
-\left|\mu_{f_{\beta_{t,k,l}^{\rm I}}}\right|^2.\tag{37b}
$$

将式 (37) 的投影高斯与式 (34) 的观测高斯相除，可获得干扰先验因子至变量的消息，其自然参数满足

$$
\mu_{f_{\beta^{\rm I}}\to\beta^{\rm I}}
=v_{f_{\beta^{\rm I}}\to\beta^{\rm I}}
\left(
\frac{\mu_{f_{\beta^{\rm I}}}}{v_{f_{\beta^{\rm I}}}}
-\frac{\mu_{f_{\mathbf y_t}\to\beta^{\rm I}}}
{v_{f_{\mathbf y_t}\to\beta^{\rm I}}}
\right),\tag{38a}
$$

$$
v_{f_{\beta^{\rm I}}\to\beta^{\rm I}}
=\left(
v_{f_{\beta^{\rm I}}}^{-1}
-v_{f_{\mathbf y_t}\to\beta^{\rm I}}^{-1}
\right)^{-1}.\tag{38b}
$$

对式 (38) 中的每个标量变量分别应用其相应的 $t,k,l$ 下标，便得到式 (29a) 所需的全部干扰消息均值及对角方差；目标用户消息均值为零，方差由 $\bar\rho_{q,l}$ 给出。

### D. EM 学习

实际中，先验参数 $\boldsymbol\omega=\{\gamma,\bar\rho_{q,l},\rho_{t,k,l}^{\rm I},\lambda\}$ 通常未知。本文根据基站接收信号，采用期望最大化（EM）算法 [37] 学习。第 $i$ 轮到第 $i+1$ 轮的更新为

$$
\begin{aligned}
\boldsymbol\omega^{(i+1)}
=\arg\max_{\boldsymbol\omega}
\mathbb E\Bigg[
&\sum_t\ln p(\mathbf y_t\mid
\boldsymbol\xi_q,\boldsymbol\xi_t^{\rm I};\gamma)\\
&+\sum_{t,l}\ln p(\beta_{t,l};\bar\rho_{q,l})
+\sum_{t,k,l}\ln p(
\beta_{t,k,l}^{\rm I};\rho_{t,k,l}^{\rm I},\lambda)
\Bigg].
\end{aligned}\tag{39}
$$

其中期望基于当前联合系数高斯分布及路径时延/角度置信度计算。将该目标分别对 $\gamma$、$\bar\rho_{q,l}$、$\rho_{t,k,l}^{\rm I}$ 和 $\lambda$ 求偏导，并使之为零，可得到：

$$
\begin{aligned}
\widehat\gamma
=\frac1{NM|\mathcal T_q|}
\sum_t\Bigl(
&\mathbf y_t^{\rm H}\mathbf y_t
-2\Re\{\mathbf y_t^{\rm H}
\widehat{\boldsymbol\Psi}_t
\boldsymbol\mu_{\boldsymbol\beta_t^{u{\rm I}}}\}\\
&+\operatorname{tr}(
\mathbb E[\boldsymbol\beta_t^{u{\rm I}}
(\boldsymbol\beta_t^{u{\rm I}})^{\rm H}]
\mathbb E[\boldsymbol\Psi_t\boldsymbol\Psi_t^{\rm H}])
\Bigr),\tag{40a}
\end{aligned}
$$

$$
\widehat{\bar\rho}_{q,l}
=\frac1{|\mathcal T_q|}
\sum_t\bigl(|\mu_{\beta_{t,l}}|^2+v_{\beta_{t,l}}\bigr),\tag{40b}
$$

$$
\widehat{\rho}_{t,k,l}^{\rm I}
=\frac{
\displaystyle\sum_{t,k}\lambda_{t,k}^{\rm post}
\frac{\displaystyle\sum_l\bigl(|\mu_{\beta_{t,k,l}^{\rm I}}|^2+
v_{\beta_{t,k,l}^{\rm I}}\bigr)}{L_k^{\rm I}}
}{
\displaystyle\sum_{t,k}\lambda_{t,k}^{\rm post}
},\tag{40c}
$$

$$
\widehat\lambda
=\frac1{|\mathcal T_q|}
\sum_t\frac1{|\mathcal K_t|}
\sum_k\lambda_{t,k}^{\rm post}.
\tag{40d}
$$

**原式核对说明。** 式 (40a) 中第二个期望的乘积顺序为原 PDF 所印的 $\boldsymbol\Psi_t\boldsymbol\Psi_t^{\rm H}$，但与前一项相乘时有维数值得核查；此处不擅自改成 $\boldsymbol\Psi_t^{\rm H}\boldsymbol\Psi_t$。式 (40c) 的分子包含 $\lambda_{t,k}^{\rm post}$ 权重，已按 PDF 第 9 页补齐；其左端保留原文的 $t,k,l$ 下标，虽然右端对这些下标求和，原稿该记号可能不严谨。

### E. 总体算法

算法 1 总结了所提出的消息传递 CKM 构建过程。初始化的一种方式是沿用上一轮 CKM 更新时的先验与观测因子置信度，但当信道路径出现或消失时，这样会产生概率失配。为了提升鲁棒性，作者为各时延角度变量使用非信息先验，使其在 $[0,2\pi)$ 上接近均匀分布：令先验集中参数接近 0；观测因子置信度的初始均值方向从 $[0,2\pi)$ 随机选择。

由于过小的集中参数会使期望导向向量趋近零，观测因子 V-M 分布的初始集中参数设置为较大的数，例如 $10^5$。随后采用最小二乘初始化联合系数均值：

$$
\boldsymbol\mu_{\boldsymbol\beta_t^{u{\rm I}}}
=(\widehat{\boldsymbol\Psi}_t^{\rm H}
\widehat{\boldsymbol\Psi}_t)^{-1}
\widehat{\boldsymbol\Psi}_t^{\rm H}\mathbf y_t,\quad
t\in\mathcal T_q.
$$

特别地，初始稀疏率设置为 $\lambda=1$，即第一轮认为干扰系数向量非稀疏。这是因为随机初始化的角度和时延通常明显偏离真实值，造成导向向量失配，使首次迭代所得系数估计幅度较小。如果立即学习 $\lambda$，EM 可能使 $\widehat\lambda\to0$。因此第一轮暂时关闭稀疏性；所有参数更新一次后令 $\lambda=0.5$，后续再由 EM 更新。目标用户和干扰先验功率分别初始化为 $\bar\rho_{q,l}=1/\bar L$、$\rho_{t,k,l}^{\rm I}=1/L_k^{\rm I}$；噪声方差初始化为

$$
\gamma^{(0)}
=\frac{\sum_{t\in\mathcal T_q}\|\mathbf y_t\|_2^2}
{MN|\mathcal T_q|}.
$$

其余系数消息均值初始化为 0，方差分别按有效路径数量取 $1/\bar L$ 或 $1/L_k^{\rm I}$。

**算法 1｜基于干扰消除的 CKM 构建**

**输入：** $\{\mathbf y_t\}_{t\in\mathcal T_q}$、
$\{\mathbf x_t\}_{t\in\mathcal T_q}$、
$\{\mathbf x_{t,k}^{\rm I}\}_{t\in\mathcal T_q,k}$。

**初始化：** 各路径的 V-M 先验和置信度、复系数高斯消息、功率先验、噪声方差以及稀疏率。

对迭代次数 $i=1,2,\ldots,I_{\max}$ 重复：

1. **消息传递：** 按式 (21)、(23)–(24)、(26d)–(27) 更新目标/干扰路径时延和角度消息。
2. 根据式 (30)、(33) 更新目标用户复增益系数 $\beta_{t,l}$ 的消息。
3. 根据式 (34)、(36)–(38) 更新干扰复增益系数 $\beta_{t,k,l}^{\rm I}$ 的消息。
4. **EM 学习：** 使用式 (40a)–(40c) 更新 $\gamma$、$\bar\rho_{q,l}$ 和 $\rho_{t,k,l}^{\rm I}$。
5. 若 $i=1$，令 $\lambda=0.5$；若 $i>1$，按式 (40d) 更新 $\lambda$。

迭代结束后，输出
$\bar\tau_{q,l}\leftarrow\mu_{\bar\tau_{q,l}}$、
$\bar\theta_{q,l}\leftarrow\mu_{\bar\theta_{q,l}}$、
$\bar\phi_{q,l}\leftarrow\mu_{\bar\phi_{q,l}}$、
$\bar\rho_{q,l}\leftarrow\widehat{\bar\rho}_{q,l}$，构成 CKM。

算法 1 使用贝叶斯推断构建 CKM。第 1 步更新网格共享的有效路径角度与时延，第 4 步通过 EM 获取路径功率，联合得到映射 $\mathcal C(\cdot)$。与为 AWGN 模型设计的压缩感知方法 [25]–[28] 相比，本文从多个观测 $\{\mathbf y_t\}_{t\in\mathcal T_q}$ 同时估计信道参数，还利用块稀疏性进行干扰消除。第六节的数值实验显示，该算法在较低 SINR 下也能准确构建 CKM，而对照方法不能。

下面分析算法复杂度。第 1 步主要计算式 (21) 与 (27) 的矩阵乘法，复杂度为 $O(|\mathcal T_q|MN\bar L+MN\sum_k\bar L_k^{\rm I})$；其余逐元素计算随系统尺寸线性增长。第 2、3 步的主导计算来自式 (29b)、(30) 的矩阵求逆，复杂度为 $O\!\left(|\mathcal T_q|(\bar L+\sum_k\bar L_k^{\rm I})^3\right)$。第 4、5 步的 EM 学习主要涉及逐元素计算与矩阵—向量乘法，相较求逆成本可忽略。因此算法 1 每轮总体复杂度为

$$
O\!\left(
|\mathcal T_q|MN\bar L
+MN\sum_k\bar L_k^{\rm I}
+|\mathcal T_q|
\left(\bar L+\sum_k\bar L_k^{\rm I}\right)^3
\right).
$$


## V. CKM 辅助的信道估计

第五节 A 小节介绍最小均方误差与干扰抑制合并（minimum mean square error and interference rejection combining，MMSE-IRC）估计器 [41]。B 小节利用 CKM 估计用户信道的频率—空间联合协方差和干扰信号的空间协方差；C 小节利用协方差结构降低复杂度；D 小节分析用户信道协方差精度对估计性能的影响。

### A. MMSE-IRC 估计器

考虑当前时隙 $t$ 的信道估计。由于导频传输周期通常远短于 CKM 更新周期，邻小区之间难以实时建立低时延的导频使用信息交换。因此，为使估计器具有一般性，这里把所有干扰用户的导频 $\mathbf X_{t,k}^{\rm I}$ 视为未知。

根据式 (3)，先左乘目标用户导频逆矩阵 $\mathbf X_t^{-1}$，再把 $\mathbf X_t^{-1}\mathbf Y_t$ 向量化，得到

$$
\mathbf r_t
=\mathbf h_t+\sum_k\widetilde{\mathbf h}_{t,k}^{\rm I}
+\mathbf w_t,\tag{41}
$$

其中
$\mathbf r_t=\operatorname{vec}(\mathbf X_t^{-1}\mathbf Y_t)$，
$\mathbf h_t=\operatorname{vec}(\mathbf H_t)$，
$\widetilde{\mathbf h}_{t,k}^{\rm I}
=\operatorname{vec}(\mathbf X_t^{-1}
\mathbf X_{t,k}^{\rm I}\mathbf H_{t,k}^{\rm I})$；
$\mathbf w_t$ 为各元素独立服从 $\mathcal{CN}(0,\gamma/P)$ 的白高斯噪声。记 $\widehat{\mathbf C}_t$ 为 $\mathbf h_t$ 的协方差估计，
$\widehat{\mathbf R}_t^{\rm I}$ 为 $\sum_k\widetilde{\mathbf h}_{t,k}^{\rm I}+\mathbf w_t$ 的协方差估计。MMSE-IRC 估计器为

$$
\widehat{\mathbf h}_t
=\widehat{\mathbf C}_t
\left(
\widehat{\mathbf C}_t+\widehat{\mathbf R}_t^{\rm I}
\right)^{-1}\mathbf r_t.\tag{42}
$$

MMSE-IRC 的性能受两个协方差估计影响。特别地，当它们分别等于目标信道和干扰加噪声的真实协方差时，式 (42) 是贝叶斯最优的线性 MMSE 估计器 [20]。下面借助 CKM 提供较强的 $\widehat{\mathbf C}_t$ 先验，并辅助估计 $\widehat{\mathbf R}_t^{\rm I}$。

### B. 基于 CKM 的协方差估计

通过式 (5) 把当前时隙映射到网格 $q=\mathcal L(t)$，然后使用式 (6) 的 $\mathcal C(q)$ 获得该网格的有效路径参数 $\{\bar\tau_{q,l},\bar\theta_{q,l},\bar\phi_{q,l},\bar\rho_{q,l}\}_{l=1}^{\bar L}$。本节将这些 CKM 输出视为确定性变量，以简化记号。由式 (7)，向量化的目标信道为

$$
\mathbf h_t
=\sum_l\bar\alpha_{t,l}\sqrt{\bar\rho_{q,l}}\,
\mathbf b(\bar\theta_{q,l},\bar\phi_{q,l})
\otimes\mathbf a_N(\bar\tau_{q,l})
+\operatorname{vec}(\Delta\mathbf H_t).\tag{43}
$$

各 $\bar\alpha_{t,l}$ 独立同分布、零均值、单位方差。忽略 CKM 表示误差 $\operatorname{vec}(\Delta\mathbf H_t)$，计算

$$
\widehat{\mathbf C}_t
=\mathbb E[\mathbf h_t\mathbf h_t^{\rm H}]
=\sum_l\bar\rho_{q,l}
\bigl(\mathbf b_l\otimes\mathbf a_N(\bar\tau_{q,l})\bigr)
\bigl(\mathbf b_l\otimes\mathbf a_N(\bar\tau_{q,l})\bigr)^{\rm H},
\tag{44}
$$

其中 $\mathbf b_l=\mathbf b(\bar\theta_{q,l},\bar\phi_{q,l})$。

为了估计干扰协方差 $\widehat{\mathbf R}_t^{\rm I}$，先分析真实协方差的结构。由式 (2)，干扰项写为

$$
\widetilde{\mathbf h}_{t,k}^{\rm I}
=\sum_{l=1}^{L_k^{\rm I}}
\alpha_{t,k,l}^{\rm I}\sqrt{\rho_{t,k,l}^{\rm I}}\,
\mathbf b(\theta_{t,k,l}^{\rm I},\phi_{t,k,l}^{\rm I})
\otimes\mathbf s_{t,k,l},\tag{45}
$$

其中 $\mathbf s_{t,k,l}
=\mathbf X_t^{-1}\mathbf X_{t,k}^{\rm I}
\mathbf a_N(\tau_{t,k,l}^{\rm I})$。由于干扰导频未知，把它建模为随机矩阵，满足
$\mathbb E[\mathbf X_{t,k}^{\rm I}(\mathbf X_{t,k}^{\rm I})^{\rm H}]
=P^{\rm I}\mathbf I$，于是
$\mathbb E[\mathbf s_{t,k,l}\mathbf s_{t,k,l}^{\rm H}]
=(P^{\rm I}/P)\mathbf I$。由此得到

$$
\begin{aligned}
\mathbf R_t^{\rm I}
&=\mathbb E\!\left[
\left(\sum_k\widetilde{\mathbf h}_{t,k}^{\rm I}
+\mathbf w_t\right)
\left(\sum_k\widetilde{\mathbf h}_{t,k}^{\rm I}
+\mathbf w_t\right)^{\rm H}
\right]\tag{46a}\\
&=\sum_{k,l}\rho_{t,k,l}^{\rm I}
\bigl(\mathbf b_{t,k,l}^{\rm I}
(\mathbf b_{t,k,l}^{\rm I})^{\rm H}\bigr)
\otimes
\mathbb E[\mathbf s_{t,k,l}\mathbf s_{t,k,l}^{\rm H}]
+\frac\gamma P\mathbf I\\
&=\mathbf Q_t\otimes\mathbf I_N,\tag{46b}
\end{aligned}
$$

其中

$$
\mathbf Q_t
=\frac\gamma P\mathbf I_M
+\frac{P^{\rm I}}P
\sum_{k,l}\rho_{t,k,l}^{\rm I}
\mathbf b_{t,k,l}^{\rm I}
(\mathbf b_{t,k,l}^{\rm I})^{\rm H}
$$

表示干扰加噪声的空间协方差。式 (46a) 使用了式 (45) 和 Kronecker 积恒等式；式 (46b) 利用时延/频率维度上干扰加噪声的协方差为单位阵这一性质。

作者采用样本协方差估计 $\mathbf Q_t$。首先把频率—空间接收向量变换到时延—空间域：

$$
\widetilde{\mathbf r}_t
=(\mathbf I_M\otimes\mathbf F^{\rm H})\mathbf r_t
=\widetilde{\mathbf h}_t
+(\mathbf I_M\otimes\mathbf F^{\rm H})
\left(\sum_k\widetilde{\mathbf h}_{t,k}^{\rm I}
+\mathbf w_t\right),\tag{47}
$$

其中 $\widetilde{\mathbf h}_t$ 是目标用户时延—空间信道，$\mathbf F$ 是 DFT 矩阵。通常，目标用户信道的最大时延扩展远小于 OFDM 符号时长；因此，对超过其最大时延索引 $J_0$ 的抽头 $j$，各天线上的目标信道分量可近似为零。于是 $\widetilde{\mathbf r}_{t,mN+j}$ 在这些抽头位置几乎只包含干扰与噪声。

此外，由 $\mathbf R_t^{\rm I}=\mathbf Q_t\otimes\mathbf I$ 可知，左乘酉变换 $\mathbf I\otimes\mathbf F^{\rm H}$ 不改变干扰与噪声协方差：
$(\mathbf I\otimes\mathbf F^{\rm H})
(\mathbf Q_t\otimes\mathbf I)
(\mathbf I\otimes\mathbf F)
=\mathbf Q_t\otimes\mathbf I$。

因此可以先根据 CKM 决定目标信道最大时延扩展，再用仅有干扰与噪声的时延抽头估计 $\mathbf Q_t$。CKM 给出的功率时延谱（PDP）为

$$
\begin{aligned}
P_{q,j}
&=\frac1M\sum_{m=0}^{M-1}
\mathbb E\bigl[|
\widetilde h_{t,mN+j}|^2\bigr]\\
&=\sum_l\bar\rho_{q,l}\,
\frac{\|\mathbf b_l\|_2^2}{M}\,
\left|[\mathbf F^{\rm H}
\mathbf a_N(\bar\tau_{q,l})]_j\right|^2,
\quad j=1,\ldots,N .
\end{aligned}\tag{48}
$$

给定功率阈值 $P^{\rm thres}$，定义
$\mathcal J=\{j:P_{q,j}<P^{\rm thres}\}$ 为目标信道功率近似为零的时延抽头索引集合。由这些抽头上的 $M$ 维空间观测形成样本协方差：

$$
\begin{aligned}
\widehat{\mathbf Q}_t
=\frac1{|\mathcal J|}
\sum_{j\in\mathcal J}
&[\widetilde r_{t,0N+j},\ldots,
\widetilde r_{t,(M-1)N+j}]^{\rm T}\\
&\quad\times
[\widetilde r_{t,0N+j},\ldots,
\widetilde r_{t,(M-1)N+j}]^* .
\end{aligned}\tag{49}
$$

结合式 (46b)，得到 $\widehat{\mathbf R}_t^{\rm I}
=\widehat{\mathbf Q}_t\otimes\mathbf I_N$。

### C. 低复杂度 MMSE-IRC

直接计算式 (42) 中 $(\widehat{\mathbf C}_t+
\widehat{\mathbf R}_t^{\rm I})^{-1}$ 的复杂度为 $O(N^3M^3)$，当子载波和天线数量较大时不可接受。为降低复杂度，首先把 $\widehat{\mathbf C}_t$ 分解为

$$
\widehat{\mathbf C}_t
=\mathbf A_q\boldsymbol\Sigma_q\mathbf A_q^{\rm H},
\tag{50}
$$

其中
$\mathbf A_q=[
\mathbf b(\bar\theta_{q,1},\bar\phi_{q,1})\otimes
\mathbf a_N(\bar\tau_{q,1}),\ldots,
\mathbf b(\bar\theta_{q,\bar L},\bar\phi_{q,\bar L})\otimes
\mathbf a_N(\bar\tau_{q,\bar L})]
\in\mathbb C^{MN\times\bar L}$，
$\boldsymbol\Sigma_q=\operatorname{diag}(
[\bar\rho_{q,1},\ldots,\bar\rho_{q,\bar L}]^{\rm T})$。

将式 (50) 及 $\widehat{\mathbf R}_t^{\rm I}
=\widehat{\mathbf Q}_t\otimes\mathbf I$ 代入式 (42)，并使用 Woodbury 矩阵恒等式：

$$
\begin{aligned}
\widehat{\mathbf h}_t
&=\mathbf A_q\boldsymbol\Sigma_q\mathbf A_q^{\rm H}
\left(
\mathbf A_q\boldsymbol\Sigma_q\mathbf A_q^{\rm H}
+\widehat{\mathbf Q}_t\otimes\mathbf I_N
\right)^{-1}\mathbf r_t,\tag{51a}\\
&=\mathbf A_q
\left(
\mathbf A_q^{\rm H}
(\widehat{\mathbf Q}_t^{-1}\otimes\mathbf I_N)
\mathbf A_q+\boldsymbol\Sigma_q^{-1}
\right)^{-1}\\
&\qquad\times
\mathbf A_q^{\rm H}
(\widehat{\mathbf Q}_t^{-1}\otimes\mathbf I_N)
\mathbf r_t.
\tag{51b}
\end{aligned}
$$

式 (51b) 中涉及的主要矩阵求逆复杂度由
$O(N^3M^3)$ 降至 $O(\bar L^3+M^3)$。其中 $\bar L$ 可以调节，以折中性能和复杂度。此时
$\mathbf A_q^{\rm H}(\widehat{\mathbf Q}_t^{-1}\otimes\mathbf I)\mathbf A_q$
仍是开销较大的部分，通常需要约 $\bar L^2NM+\bar LM^2N$ 次复数乘法。下面通过 Khatri–Rao 积性质进一步降低复杂度。

记 $\circledast_c$ 为按列 Khatri–Rao 积。可把
$\mathbf A_q$ 表示为
$\mathbf A_q=\mathbf B_q\circledast_c\mathbf A_{f,q}$，
其中
$\mathbf A_{f,q}
=[\mathbf a_N(\bar\tau_{q,1}),\ldots,
\mathbf a_N(\bar\tau_{q,\bar L})]$，
$\mathbf B_q
=[\mathbf b(\bar\theta_{q,1},\bar\phi_{q,1}),\ldots,
\mathbf b(\bar\theta_{q,\bar L},\bar\phi_{q,\bar L})]$。
由此

$$
\begin{aligned}
&\mathbf A_q^{\rm H}
(\widehat{\mathbf Q}_t^{-1}\otimes\mathbf I_N)
\mathbf A_q\\
&=(\mathbf B_q\circledast_c\mathbf A_{f,q})^{\rm H}
(\widehat{\mathbf Q}_t^{-1}\otimes\mathbf I_N)
(\mathbf B_q\circledast_c\mathbf A_{f,q}),\tag{52a}\\
&=(\mathbf B_q^{\rm H}\circledast_r\mathbf A_{f,q}^{\rm H})
\bigl((\widehat{\mathbf Q}_t^{-1}\mathbf B_q)
\circledast_c\mathbf A_{f,q}\bigr),\tag{52b}\\
&=(\mathbf B_q^{\rm H}\widehat{\mathbf Q}_t^{-1}
\mathbf B_q)
\odot(\mathbf A_{f,q}^{\rm H}\mathbf A_{f,q}),\tag{52c}
\end{aligned}
$$

其中 $\circledast_r$ 为按行 Khatri–Rao 积。式 (52b) 利用矩阵与 Khatri–Rao 积的混合乘积规则；式 (52c) 利用列积与行积相乘得到 Hadamard 积的性质。经此转换，求上述核心矩阵的乘法复杂度由
$\bar L^2NM+\bar LM^2N$ 降至
$\bar L^2(N+M)+\bar LM^2$。综合矩阵求逆和乘法计算，MMSE-IRC 估计复杂度由 $O(N^3M^3)$ 降至

$$
O\!\left(M^2(M+\bar L)+(M+N)\bar L^2+\bar L^3\right).
$$

### D. CKM 表示误差界

本节分析 CKM 输出如何影响 MMSE-IRC 的估计性能。根据式 (51b)，MMSE-IRC 可看成以 $\mathbf A_q$ 为变换矩阵的线性信道重构：

$$
\widehat{\mathbf h}_t=\mathbf A_q\widehat{\boldsymbol\beta}_t,
\tag{53}
$$

其中

$$
\widehat{\boldsymbol\beta}_t
=\left(
\mathbf A_q^{\rm H}
(\widehat{\mathbf Q}_t^{-1}\otimes\mathbf I)
\mathbf A_q+\boldsymbol\Sigma_q^{-1}
\right)^{-1}
\mathbf A_q^{\rm H}
(\widehat{\mathbf Q}_t^{-1}\otimes\mathbf I)\mathbf r_t.
$$

显然，$\mathbf A_q$ 的表示能力直接影响重构误差
$\|\widehat{\mathbf h}_t-\mathbf h_t\|_2^2$。作者将该线性重构的可达到的最小误差定义为 CKM 精度。

**定义 1。** 时隙 $t$ 的 CKM 精度定义为

$$
\mathcal L_{\rm CKM}
=\min_{\boldsymbol\beta_t}
\frac1{NM}\|
\mathbf h_t-\mathbf A_q\boldsymbol\beta_t
\|_2^2.\tag{54}
$$

接下来说明，在无干扰、无噪声的情况下，MMSE-IRC 的重构 MSE 等于 $\mathcal L_{\rm CKM}$。

**命题 1。** 若式 (41) 的系统无干扰且无噪声，即
$\widetilde{\mathbf h}_{t,k}^{\rm I}=\mathbf0$ 对所有 $k$ 成立，且 $\mathbf w_t=\mathbf0$，则式 (51b) 中 MMSE-IRC 的估计均方误差等于 $\mathcal L_{\rm CKM}$。

**证明。** 当 $\widehat{\boldsymbol\beta}_t$ 取最小二乘估计
$(\mathbf A_q^{\rm H}\mathbf A_q)^{-1}
\mathbf A_q^{\rm H}\mathbf h_t$ 时，取得式 (54) 的最小值，相应目标信道估计为

$$
\mathbf h_t^\ast
=\mathbf A_q(\mathbf A_q^{\rm H}\mathbf A_q)^{-1}
\mathbf A_q^{\rm H}\mathbf h_t.\tag{55}
$$

对 $\mathbf A_q$ 做奇异值分解（SVD）
$\mathbf A_q=\mathbf U\mathbf D\mathbf V^{\rm H}$，上式可写为

$$
\mathbf h_t^\ast
=\mathbf A_q\mathbf V\mathbf D^\dagger
\mathbf U^{\rm H}\mathbf h_t.\tag{56}
$$

在无干扰、无噪声条件下，将式 (51a) 表示为

$$
\begin{aligned}
\widehat{\mathbf h}_t
&=\mathbf A_q\boldsymbol\Sigma_q\mathbf A_q^{\rm H}
(\mathbf A_q\boldsymbol\Sigma_q\mathbf A_q^{\rm H})^\dagger
\mathbf r_t,\tag{57a}\\
&=\mathbf A_q\boldsymbol\Sigma_q\mathbf V\mathbf D^{\rm H}
(\mathbf D\mathbf V^{\rm H}
\boldsymbol\Sigma_q\mathbf V\mathbf D^{\rm H})^\dagger
\mathbf U^{\rm H}\mathbf h_t,\tag{57b}\\
&=\mathbf A_q\mathbf V\mathbf D^\dagger
\mathbf U^{\rm H}\mathbf h_t.\tag{57c}
\end{aligned}
$$

与式 (56) 相同，因此无噪声、无干扰时 MMSE-IRC 达到 CKM 表示误差下界。下节数值实验将以 $\mathcal L_{\rm CKM}$ 作为所提 MMSE-IRC 性能的下界（LB）。

## VI. 数值结果

本节评估 CKM 构建和 CKM 辅助信道估计。基站配置 $4\times8$ 的 URA，为使用 $N=192$ 个子载波的用户提供服务。子载波间隔 $\Delta f=30$ kHz，载波频率 6.5 GHz。用户信道按照标准 3GPP TR 38.901 [18] 的城市宏蜂窝非视距（UMa NLOS）场景生成，其中信道簇数设为 10，每簇含 20 条子路径，所以 $L=200$。不同位置的信道参数变化遵循该标准中的空间一致性过程 [18, Sec. 7.6.3.2]。

在第 $q$ 个网格，沿长度为 $d$ 的线段均匀采样 $|\mathcal T_q|=10d$ 次以构造信道数据集；随后将其随机分为 7:3 的两个子集，前者用于构建 CKM，后者用于信道估计。干扰用户数量设为 4，稀疏率为 0.5。各干扰信道同样遵循 UMa NLOS 标准，每个干扰用户具有 $L_k^{\rm I}=200$ 条路径。

CKM 构建中，算法 1 迭代 40 次，每个干扰用户提取 $\bar L_k^{\rm I}=15$ 条路径参数用于干扰消除。信道估计中，按照式 (49) 估计干扰协方差，$P^{\rm thres}$ 设置为比干扰加噪声功率低 10 dB。导频采用恒模信号，其相位在 $[0,2\pi)$ 均匀随机选取。

**CKM 构建对照方法：**

1. **基于 OMP 的 CKM。** 正交匹配追踪（OMP）[25] 是贪心算法，利用由
$\mathbf a_N(\cdot)\otimes\mathbf a_{M_1}(\cdot)
\otimes\mathbf a_{M_2}(\cdot)$ 均匀采样产生的时延—角度字典，依次寻找匹配度最高的前 $\bar L$ 组时延和角度参数。随后基于式 (28) 用 LS 估计 $\boldsymbol\beta_t$，再计算
$\bar\rho_{q,l}=\sum_t|\widehat\beta_{t,l}|^2/|\mathcal T_q|$。
2. **不感知 ICI 的 CKM。** 为检验算法 1 的干扰消除效果，将干扰信号当作 AWGN 处理，并在算法 1 中去掉干扰信道参数估计部分。

**信道估计对照方法：**

1. **OMP：** 与 OMP-based CKM 的步骤类似，但不计算路径功率 $\bar\rho_{q,l}$。
2. **TMP：** 文献 [28] 的 Turbo Message Passing，是一种基于压缩感知的稀疏信号恢复算法。原始 TMP 包含 LMMSE 模块及为 AWGN 信号模型设计的去噪器；本文修改 LMMSE 模块，使其利用式 (49) 估计的干扰协方差，选择时延抽头 $j\in[N/4+1,\ldots,3N/4]$。
3. **VBI-MMSE：** 文献 [30] 利用变分贝叶斯推断学习目标用户信道的 PDP 与空间协方差，再结合干扰空间协方差估计，在各时延抽头上分别使用 MMSE 信道估计器。
4. **下界（LB）：** 由 CKM 精度定义给出的线性表示误差下界。

**图 4｜不同有效路径数下的 CKM 精度。** 固定 $d=2$ m，绘制不同 SINR 下 CKM 精度关于 $\bar L$ 的变化，同时展示基于 OMP 的 CKM 和不感知 ICI 的 CKM。所提方法在 $\bar L$ 与 SINR 增大时更准确；特别在 $\bar L=60$、SINR = −5 dB 时，CKM 精度达到 −20.5 dB。作为对比，OMP-based 和 ICI-non-cognitive CKM 的精度分别约为 −8 dB 与 −12.8 dB，比所提算法的误差分别高 12.5 dB 和 7.7 dB。这说明即使 SINR 很低，算法 1 仍能准确构建 CKM，并验证干扰消除机制的作用。

**图 5｜不同有效路径数下 MMSE-IRC 信道估计的 MSE 与 SINR。** 固定 $d=2$ m，构建 CKM 时 SINR=10 dB。随着估计阶段 SINR 增加，信道估计性能改善，并逐渐接近 LB。较大的 $\bar L$ 一般带来更低估计误差，但也提高复杂度；工程实践中应在精度和算力之间选择合理的有效路径数。

**图 6｜不同网格尺寸和有效路径数下的 CKM 精度。** CKM 构建 SINR=10 dB。$\bar L$ 增大或网格尺寸 $d$ 减小，均可提高 CKM 精度。例如，实现 −20 dB 的 CKM 精度，$d=2$ 时需要 $\bar L\ge40$，$d=3$ 时需要 $\bar L\ge60$。这说明在实际定位精度等约束固定网格大小后，可通过选择适当 $\bar L$ 达到期望精度。

**图 7｜不同信道估计器的 NMSE 与 SINR。** 固定 $\bar L=60$、$d=2$ m，CKM 构建 SINR=0 dB。图中比较 OMP、TMP、VBI-MMSE、采用 OMP-based CKM 的 MMSE-IRC、采用不感知 ICI 的 CKM 的 MMSE-IRC，以及采用本文 CKM 的 MMSE-IRC。低于 −5 dB 时，OMP 比 TMP 与 VBI-MMSE 更好；高于 −5 dB 时，TMP 与 VBI-MMSE 更好。作者认为，这是由于贝叶斯方法在低 SINR 下难以准确学习先验。

本文 MMSE-IRC 显著优于所有对照方法。要实现 −15 dB 的估计 MSE，TMP 与 VBI-MMSE 分别需要 SINR≥5 dB 和 SINR≥2.5 dB，而本文方法只需 SINR≥−15 dB，相当于 SINR 需求至少下降 17.5 dB。进一步地，在 SINR=5 dB 时，采用本文 CKM 的 MMSE-IRC 达到 NMSE≈−25 dB，而采用 OMP-based CKM 与 ICI-non-cognitive CKM 的 MMSE-IRC 分别约为 −18 dB 和 −10 dB。这些实验结果表明，准确的 CKM 构建能够显著改善后续信道估计性能。

## VII. 结论

本文研究了存在小区间干扰时 MIMO-OFDM 系统的 CKM 构建与 CKM 辅助信道估计。首先把物理区域划分成网格，并利用各网格对应的基站接收信号提取信道模型参数。将 CKM 构建转化为贝叶斯推断问题，发展包含干扰消除机制的混合消息传递算法。在 CKM 输出的基础上设计 MMSE-IRC 信道估计器，并借助用户信道协方差的结构大幅降低计算复杂度。数值实验验证了所提出 CKM 的高精度，以及 CKM 辅助信道估计相对于现有先进方案的性能优势。

## 参考文献

下列 41 条条目沿用原文编号，提供中文题名释义与原文作者/期刊信息。原始英文书目格式请参照原论文第 13 页。

[1] Z. Zhang 等，**6G 无线网络：愿景、需求、架构及关键技术**，IEEE Vehicular Technology Magazine，14(3)，28–41，2019。

[2] X. You 等，**迈向 6G 无线通信网络：愿景、关键支撑技术与新范式转变**，Science China Information Sciences，64，1–74，2021。

[3] J. Wang 等，**面向 6G 超大规模 MIMO 无线通信系统的通用三维时空频非平稳太赫兹信道模型**，IEEE Journal on Selected Areas in Communications，39(6)，1576–1589，2021。

[4] D. Romero、S.-J. Kim，**无线电地图估计：频谱地图绘制的数据驱动方法**，IEEE Signal Processing Magazine，39(6)，53–72，2022。

[5] D. He 等，**面向 5G 及未来无线通信的高性能射线追踪仿真平台设计与应用教程**，IEEE Communications Surveys & Tutorials，21(1)，10–27，2019。

[6] Y. Sun 等，**基于环境特征的路径损耗预测模型**，IEEE Wireless Communications Letters，11(9)，2010–2014，2022。

[7] A. B. H. Alaya-Feki 等，**认知无线电网络的频谱感知使用：干扰地图构建**，IEEE PIMRC，1–5，2008。

[8] D. Romero 等，**从量化功率测量学习功率谱地图**，IEEE Transactions on Signal Processing，65(10)，2547–2560，2017。

[9] Y. Zeng 等，**基于信道知识地图的 6G 环境感知通信教程**，IEEE Communications Surveys & Tutorials，2024。

[10] F. Liu 等，**通信与感知一体化：迈向面向 6G 及未来的双功能无线网络**，IEEE Journal on Selected Areas in Communications，40(6)，1728–1767，2022。

[11] D. Wu 等，**利用信道知识地图的环境感知混合波束成形**，IEEE Transactions on Wireless Communications，23(5)，4990–5005，2024。

[12] Y. Long 等，**信道知识地图赋能的环境感知无线定位**，IEEE GLOBECOM，5354–5359，2022。

[13] Y. Zeng、X. Xu，**通过信道知识地图迈向环境感知 6G 通信**，IEEE Wireless Communications，28(3)，84–91，2021。

[14] K. Li 等，**环境感知通信的信道知识地图：使用 EM 算法构建地图**，IEEE WCNC，1659–1664，2022。

[15] P. B. Papazian 等，**移动毫米波通信的无线信道探测器：系统实现与测量评估**，IEEE Transactions on Microwave Theory and Techniques，64(9)，2924–2932，2016。

[16] 3GPP，**NR 物理层控制过程**，TS 38.213，Release 17，2022。

[17] D. Tse、P. Viswanath，《无线通信基础》（Fundamentals of Wireless Communication），Cambridge University Press，2005。

[18] 3GPP，**0.5–100 GHz 频段信道模型研究**，TR 38.901，Release 16，2020。

[19] J. Yedidia、W. Freeman、Y. Weiss，**构建自由能近似与广义置信传播算法**，IEEE Transactions on Information Theory，51(7)，2282–2312，2005。

[20] S. M. Kay，《统计信号处理基础：估计理论》（Fundamentals of Statistical Signal Processing: Estimation Theory），Prentice Hall，1993。

[21] Y. Zeng 等，**面向 6G 的信道知识地图环境感知通信教程**，IEEE Communications Surveys & Tutorials，2024。

[22] 3GPP，**物理信道与调制**，TS 38.211，Release 15，2017。

[23] C. A. Balanis，《天线理论：分析与设计》（Antenna Theory: Analysis and Design），Wiley，2016。

[24] H. Minn 等，**一种鲁棒的 OFDM 系统定时与频率同步方法**，IEEE Transactions on Wireless Communications，2(4)，822–839，2003。

[25] T. T. Cai、L. Wang，**含噪稀疏信号恢复的正交匹配追踪**，IEEE Transactions on Information Theory，57(7)，4680–4688，2011。

[26] D. L. Donoho 等，**压缩感知的消息传递算法**，Proceedings of the National Academy of Sciences，106(45)，18914–18919，2009。

[27] J. Ma、X. Yuan、L. Ping，**基于部分 DFT 测量矩阵的 Turbo 压缩感知**，IEEE Signal Processing Letters，22(2)，158–161，2015。

[28] X. Kuai 等，**面向下行大规模 MIMO-OFDM 信道估计的结构化 Turbo 压缩感知**，IEEE Transactions on Wireless Communications，18(8)，3813–3826，2019。

[29] H. He 等，**基于深度学习的波束域毫米波大规模 MIMO 信道估计**，IEEE Wireless Communications Letters，7(5)，852–855，2018。

[30] H. Guo、V. K. N. Lau，**小区间干扰下蜂窝网络上行信道估计的鲁棒深度学习**，IEEE Journal on Selected Areas in Communications，41(6)，1873–1887，2023。

[31] C. Liu、W. Jiang、X. Yuan，**面向时变 MIMO-OFDM 的学习式分块平面信道估计**，IEEE Wireless Communications Letters，2024。

[32] E. Riegler 等，**融合置信传播与平均场近似：一种自由能方法**，IEEE Transactions on Information Theory，59(1)，588–602，2012。

[33] D. Zhang 等，**在受约束 Bethe 自由能最小化框架下统一消息传递算法**，IEEE Transactions on Wireless Communications，20(7)，4144–4158，2021。

[34] H. Jiang、X. Yuan、Q. Guo，**通过混合向量消息传递实现广义双线性分解**，arXiv:2401.03626，2024。

[35] J. Winn、C. M. Bishop、T. Jaakkola，**变分消息传递**，Journal of Machine Learning Research，6(4)，2005。

[36] T. P. Minka，**用于近似贝叶斯推断的期望传播**，UAI，362–369，2001。

[37] C. M. Bishop，《模式识别与机器学习》（Pattern Recognition and Machine Learning），Springer，2006。

[38] S. Guiasu、A. Shenitzer，**最大熵原理**，The Mathematical Intelligencer，7，42–48，1985。

[39] K. V. Mardia、P. E. Jupp，《方向统计》（Directional Statistics），Wiley，2009。

[40] M.-A. Badiu、T. L. Hansen、B. H. Fleury，**线谱的变分贝叶斯推断**，IEEE Transactions on Signal Processing，65(9)，2247–2261，2017。

[41] F. M. L. Tavares 等，**接收机非理想因素对 5G 网络 MMSE-IRC 接收机性能的影响**，IEEE VTC Spring，1–6，2014。

## 翻译校对说明（不属于原文）

- 本文多处涉及二维矩阵与向量化之间的 Kronecker 积顺序，译文按推导上下文统一写为“空间向量 $\otimes$ 频率向量”，并保持原文的公式编号。阅读或复现时仍应以原 PDF 中实际的 $\operatorname{vec}$ 约定与阵列向量排列为准。
- 原文式 (26) 的 V-M 参数组合、式 (40c) 的干扰功率求和记号和式 (48) 的抽头索引，在 PDF 文本层存在印刷或提取歧义，尚需逐式视觉复核。
- 本文依赖邻小区共享导频构建 CKM，但在实时信道估计阶段不需要知道干扰导频；两种阶段的已知条件并不相同，不能在实验复现时混用。
