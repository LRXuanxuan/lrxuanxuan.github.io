---
layout: page
title: "面向大规模 MIMO 网络导频 CSI 跟踪降本的无线电地图方法｜中文全文译文"
permalink: /papers/translations/2026-10-05-2410-05803-a-radio-map-approach-for-reduced-pilot-csi-tracking-in-massive-mimo-ne/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6aa6d5402e27413d/) · [原文 arXiv](https://arxiv.org/abs/2410.05803) · [全部目录](/papers/catalog/)

# 面向大规模 MIMO 网络导频 CSI 跟踪降本的无线电地图方法

**原题：** A Radio Map Approach for Reduced Pilot CSI Tracking in Massive MIMO Networks  
**作者：** Yuanshuai Zheng、Junting Chen（通讯作者）；单位：香港中文大学（深圳）理工学院、深圳市未来智联网络研究院（FNii-Shenzhen）与广东省未来智联网络重点实验室，中国广东深圳 518172  
**版本：** arXiv:2410.05803v5（eess.SP），v5 日期 2025 年 8 月 12 日；已发表于 IEEE Transactions on Signal Processing, vol. 73, pp. 2833–2847, 2025，doi:10.1109/TSP.2025.3584229；原文 16 页（含附录 A–D）。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VI 节正文、图 1–10 图注、表 I–V 逐格转写、附录 A–D（命题 1–5 的证明）、参考文献 33 条英文原条目（按原编号），以及原文首页的发表与资助脚注。逐句逐式终校未做。

## 摘要

大规模多输入多输出（multiple-input multiple-output，MIMO）系统在提升无线通信性能方面具有显著潜力，但准确且及时地获取信道状态信息（channel state information，CSI）仍是关键挑战。现有的 CSI 估计与无线电地图应用工作通常依赖平稳的 CSI 统计与精确的位置标签。然而，由于用户移动与环境变化，CSI 过程可能不连续，而不准确的位置数据会降低性能。与此相反，本文在不假设平稳 CSI 统计与精确定位标签的前提下，研究嵌入无线电地图的 CSI 跟踪与无线电地图构建。本文以无线电地图作为先验信息，提出一个嵌入无线电地图的切换卡尔曼滤波（switching Kalman filter，SKF）框架，在减少导频的条件下，对稀疏 CSI 观测联合跟踪位置与 CSI 并进行自适应波束成形。对于无精确定位标签的无线电地图构建，基于隐马尔可夫模型（Hidden Markov Model，HMM）联合估计位置序列与信道协方差矩阵，并给出信道协方差矩阵的无偏估计量。在射线追踪 MIMO 信道数据集上的数值结果表明：每 10 毫秒使用 1 个导频观测时，平均可达到完美 CSI 容量的 97% 以上，而传统卡尔曼滤波（Kalman filter，KF）只能达到 76%。此外，所提出的嵌入无线电地图的 CSI 模型可将无线电地图构建的定位误差从先验的 30 米降到 6 米。

**关键词：** 无线电地图、大规模 MIMO、信道估计、跟踪、协方差估计

## I. 引言

大规模 MIMO 能够实现空间复用、提供高波束成形增益，并支持多用户并发数据传输。要充分发挥大规模 MIMO 的潜力，必须获取最新的信道状态信息（CSI），而 CSI 会因用户移动与环境变化而随时间变化。在大规模 MIMO 系统中，及时获取 CSI 具有挑战性，因为信道向量的维数可能非常高 [1], [2]。

大规模 MIMO 信道估计与跟踪通常需要关于信道特性的一些先验信息。若可获得信道协方差矩阵，则可采用最小均方误差（minimum mean square error，MMSE）或更一般地贝叶斯方法，把解约束在协方差矩阵张成的子空间内 [3], [4]。若认为信道稀疏，则可应用压缩感知技术获得稀疏解 [5], [6]。此外，若信道在时间与空间上相关，则可利用卡尔曼滤波（KF）方法与自回归（autoregressive，AR）模型，以降低每时隙导频开销来跟踪 CSI 过程 [7], [8]。近期进展还探索了基于长短期记忆（long-short term memory，LSTM）的方法 [9], [10] 以及其他深度学习方法，例如注意力网络 [11] 与生成模型 [12]。

然而，若先验信息不准确或随时间变化，现有方法 [5]–[12] 可能性能很差。例如，信道协方差矩阵可能随位置不同而变化，而信道动力学在视距（line-of-sight，LOS）与非视距（non-line-of-sight，NLOS）场景下遵循不同模型。因此，当移动台从 LOS 区域进入 NLOS 区域时，KF 之类的跟踪算法可能丢失对信道的跟踪。

无线电地图为提供信道先验信息提供了有前景的解决途径 [13]–[15]。现有的无线电地图辅助 CSI 估计工作通常需要来自额外设备或感知的位置信息。一些基于位置的方法 [15], [16] 融合通过全球定位系统（GPS）或超宽带（UWB）技术获得的用户位置信息，利用位置与信道之间的空间相关性增强 CSI 预测。类似地，通感一体化（integrated sensing and communication，ISAC）技术 [17], [18] 先感知用户位置，再利用该信息辅助 CSI 估计。文献 [14] 尝试在估计阶段不需要显式位置信息的无线电地图辅助 CSI 估计，其中无线电地图是从位置到信道实现的映射。然而，没有大量带位置标签的数据，这样的无线电地图难以构建。文献 [19] 提出的波束索引图（beam index map，BIM）在训练过程中需要在每个位置网格上进行穷举波束扫描，且波束对齐是基于精确用户位置与 BIM 实现的。文献 [20] 关注构建信道角度图（channel angle map，CAM），需要精确的出发角（angle of departure，AOD）信息，而 AOD 高度依赖用户位置与周围环境。尽管基于 CAM 的方法 [20] 在部署后可同时估计用户位置与 CSI，但它们对 AOD 与用户位置精确训练数据的依赖仍是显著局限。近期一些信道图表（channel charting）的尝试利用深度学习技术开发了不需要显式用户位置的 CSI 跟踪策略 [21], [22]，但其内在物理机制仍不清楚。

本文研究以下两个基本问题：

- **无线电地图能否帮助减少 CSI 跟踪所需的导频观测？** 具体而言，我们关注不存在可用作无线电地图中 CSI 索引的精确位置信息的情形。此时位置也需要作为 CSI 跟踪的中间步骤从导频观测中恢复。因此，我们旨在以无线电地图作为先验信息，联合恢复位置与 CSI。
- **我们能否在没有精确定位标签的情况下，从导频观测序列重建并更新无线电地图？** 要构建无线电地图，我们需要从导频观测序列中恢复精确的位置信息，可能借助一些边信息，例如基站（base station，BS）的位置。因此问题是：嵌入无线电地图的 CSI 模型能否在可能存在 NLOS 的情况下帮助恢复精确定位信息？

与把位置映射到特定信道实现的初步研究 [14] 不同，本文采用另一种无线电地图方法：定义从位置到**信道分布**的映射。因此，新的无线电地图定义对局部散射、人体遮挡以及用户侧天线方向图都具有稳健性。于是，它不仅能实现稳健的嵌入无线电地图的 CSI 跟踪，还能实现无需位置标签的无线电地图盲构建。为实现这一目标，本文利用如下原理：虽然 CSI 过程在高维 CSI 空间中可能不连续，但相应移动终端的轨迹在三维物理世界中必须连续。因此，一串非常稀疏的 CSI 观测可能足以发现移动轨迹，从而借助无线电地图对高维 CSI 实现精确跟踪。遵循这一方法，我们提出一个嵌入无线电地图的切换卡尔曼滤波（SKF）框架，在减少导频观测的条件下，对稀疏 CSI 观测联合跟踪位置与 CSI 并进行自适应波束成形，其中无线电地图在调节 SKF 的运行机制方面起关键作用。此外，我们采用贝叶斯方法，从大量离线无标签的导频观测序列中联合估计位置与信道协方差矩阵，以构建无线电地图。主要理论贡献与数值发现总结如下：

- 我们提出一个嵌入无线电地图的 SKF 框架，用于从一串减少后的导频观测中跟踪 CSI，且不需要位置标签。此外，我们不使用随机化压缩感知方法，而是设计自适应感知矩阵以最小化 CSI 的微分熵。
- 我们利用隐马尔可夫模型（HMM），从无标签的导频观测序列联合估计位置序列与信道协方差矩阵；给出信道协方差矩阵的无偏估计量并分析其估计误差。
- 我们在数值上表明：在单用户 64 天线多输入单输出（MISO）系统中，每 10 毫秒使用 1 个导频观测，对 LOS 下以 36 km/h 移动、信噪比（SNR）为 20 dB 的用户，平均可达到完美 CSI 容量的 97% 以上，而传统 KF 只能达到 76%；在纯 NLOS 情形下，所提出的无线电地图辅助方法可在低到中等 SNR 下把现有方案的容量提高一倍。对于使用无标签导频观测序列的无线电地图构建，我们表明所提出的、基于嵌入无线电地图的 CSI 模型的估计可把定位误差从先验的 30 米降到 6 米，这足以支撑我们框架中的无线电地图构建。

本文其余部分组织如下：第 II 节介绍系统模型，并表述 CSI 跟踪与无线电地图构建问题；第 III 节提出用于快速 CSI 跟踪的嵌入无线电地图的 SKF 框架；第 IV 节提出迭代估计用户位置与信道协方差以构建无线电地图，并分析构建误差；第 V 节给出仿真与相关讨论；第 VI 节总结全文。

**记号：** 向量与矩阵分别用粗体小写 $\mathbf{x}$ 与粗体大写 $\mathbf{X}$ 表示；标量用非粗体字母（如 $x$）表示；集合用花体 $\mathcal{X}$ 表示；概率密度函数与概率质量函数分别用 $p(\cdot)$ 与 $\mathbb{P}(\cdot)$ 表示；期望与方差算子分别用 $\mathbb{E}(\cdot)$ 与 $\mathbb{V}(\cdot)$ 表示；$L_2$ 范数记为 $\|\cdot\|_2$，Frobenius 范数记为 $\|\cdot\|_F$；复向量 $\mathbf{x}$ 或复矩阵 $\mathbf{X}$ 的共轭转置分别记为 $\mathbf{x}^H$ 或 $\mathbf{X}^H$；矩阵 $\mathbf{X}$ 的迹记为 $\mathrm{tr}(\mathbf{X})$；矩阵 $\mathbf{X}$ 的伪逆记为 $\mathbf{X}^\dagger$；单位矩阵记为 $\mathbf{I}$。此外，我们说明全文使用的几个关键变量：时刻 $t$ 的用户位置、信道状态、感知矩阵与观测分别记为 $\mathbf{p}_t$、$\mathbf{h}_t$、$\mathbf{A}_t$ 与 $\mathbf{y}_t$；它们截至时刻 $t$ 的相应序列记为 $\mathcal{P}_t=(\mathbf{p}_1,\mathbf{p}_2,\dots,\mathbf{p}_t)$、$\mathcal{H}_t=(\mathbf{h}_1,\mathbf{h}_2,\dots,\mathbf{h}_t)$、$\mathcal{A}_t=(\mathbf{A}_1,\mathbf{A}_2,\dots,\mathbf{A}_t)$ 与 $\mathcal{Y}_t=(\mathbf{y}_1,\mathbf{y}_2,\dots,\mathbf{y}_t)$，其在 $t=T$ 时的实现分别记为 $\mathbf{P}_T=(\mathbf{p}_1,\mathbf{p}_2,\dots,\mathbf{p}_T)$、$\mathbf{H}_T=(\mathbf{h}_1,\mathbf{h}_2,\dots,\mathbf{h}_T)$、$\mathbf{A}_T=(\mathbf{A}_1,\mathbf{A}_2,\dots,\mathbf{A}_T)$ 与 $\mathbf{Y}_T=(\mathbf{y}_1,\mathbf{y}_2,\dots,\mathbf{y}_T)$。

> **原文首页脚注（发表与资助说明）：** 本文为预印本版本。论文已发表于 IEEE Transactions on Signal Processing, vol. 73, pp. 2833–2847, 2025，doi: 10.1109/TSP.2025.3584229。Junting Chen 为通讯作者。本工作部分获得以下资助：河套深港科技创新合作区基础研究项目 No. HZQB-KCZYZ-2021067；国家自然科学基金 No. 62171398 与 No. 62293482；广东省基础与应用基础研究基金 2024A1515011206；深圳市科技计划 No. JCYJ20220530143804010、No. KQTD20200909114730003 与 No. KJZD20230923115104009；广东省研究项目 No. 2019QN01X895、No. 2017ZT07X152 与 No. 2019CX01X104；深圳市杰出人才培养基金 202002；广东省未来智联网络重点实验室（Grant No. 2022B1212010001）；国家重点研发计划 No. 2018YFB1800800；以及广东省重点领域研发计划 No. 2018B030338001。

## II. 系统模型

### A. 网络拓扑、信道模型与无线电地图模型

考虑一个有 $Q$ 个 BS 与一个移动用户的 MIMO 网络，每个 BS 配备 $N_t$ 根天线，用户只有单天线。为便于阐述，我们只说明 $Q=1$ 的情形，因为对于 $Q>1$，只需堆叠变量并增大系统状态的维数，多 BS 情形下公式的形式类似。

假设环境是准静态的：大多数散射体是静态的，只有小部分散射体随时间变化。静态散射体可能对应地面与建筑，时变散射体可能对应车辆与行人。我们关注 MIMO BS 部署在屋顶或塔上的场景，那里 BS 附近移动散射体很少。

位于 $\mathbf{p}$ 的 BS 与用户之间的传播，可建模为来自经静态散射体的传播路径集合 $\mathcal{N}_s(\mathbf{p})$ 与来自经移动散射体的路径集合 $\mathcal{N}_m(\mathbf{p})$ 的信号聚合。如图 1 所示，几何窄带多径 MIMO 信道可建模为 [23]

$$
\mathbf{h}(\mathbf{p})=\sum_{l\in\mathcal{N}_s(\mathbf{p})}a_l(\mathbf{p})\boldsymbol{\alpha}(\theta_l(\mathbf{p}))+\sum_{m\in\mathcal{N}_m(\mathbf{p})}\beta_m\boldsymbol{\alpha}(\varphi_m), \tag{1}
$$

其中系数 $a_l$ 与 $\beta_m$ 表示复路径增益，$\theta_l(\mathbf{p})$ 与 $\varphi_m$ 表示 BS 处的 AOD，$\boldsymbol{\alpha}(\theta)$ 表示按 BS 天线几何在 $\theta$ 方向的导向矢量。来自静态散射体的系数 $a_l(\mathbf{p})$ 的统计量依赖用户位置 $\mathbf{p}$，而来自移动散射体的系数 $\beta_m$ 与 AOD $\varphi_m$ 假设与 $\mathbf{p}$ 无关。

基于 (1)，多径信道可写为

$$
\mathbf{h}(\mathbf{p})\triangleq\mathbf{h}^s(\mathbf{p})+\mathbf{h}^\epsilon, \tag{2}
$$

其中 $\mathbf{h}^s(\mathbf{p})\triangleq\sum_{l\in\mathcal{N}_s(\mathbf{p})}a_l(\mathbf{p})\boldsymbol{\alpha}(\theta_l(\mathbf{p}))$ 是用户位置 $\mathbf{p}$ 处由静态散射产生的信道，$\mathbf{h}^\epsilon\triangleq\sum_{m\in\mathcal{N}_m(\mathbf{p})}\beta_m\boldsymbol{\alpha}(\varphi_m)$ 是由移动散射体产生的信道。假设 $\mathbf{h}^s(\mathbf{p})$ 与 $\mathbf{h}^\epsilon$ 都为零均值且相互独立。

考虑离散位置模型：感兴趣区域被划分为等间距网格，用户位于某个网格点 $\mathbf{x}\in\mathcal{X}$，其中 $\mathcal{X}$ 是所有网格位置的集合。我们定义无线电地图为离散位置 $\mathbf{x}\in\mathcal{X}$ 与协方差矩阵 $\mathbf{C}(\mathbf{x})$ 对的集合，即 $\mathcal{M}=\{(\mathbf{x},\mathbf{C}(\mathbf{x})):\mathbf{x}\in\mathcal{X}\}$，其中 $\mathbf{C}(\mathbf{x})\triangleq\mathbb{E}\{\mathbf{h}\mathbf{h}^H\}$，期望对网格单元内位置 $\mathbf{p}$ 的分布（单元中心为 $\mathbf{x}\in\mathcal{X}$）以及信道小尺度衰落取。假设 $\mathbf{h}^s(\mathbf{p})$ 对同一网格单元内所有位置 $\mathbf{p}$ 空间相关，且 $\mathbb{E}\{\mathbf{h}^\epsilon(\mathbf{h}^\epsilon)^H\}=\sigma_h^2\mathbf{I}$，其中 $\sigma_h^2$ 远小于 $\mathbf{h}^s(\mathbf{p})$ 的平均能量。因此，给定位置 $\mathbf{x}$ 时信道分布 $f_{\mathbf{h}}(\mathbf{h})$ 完全由协方差矩阵 $\mathbf{C}(\mathbf{x})$ 与参数 $\sigma_h^2$ 刻画。

在此离散模型下，本文余下部分考虑 $\mathbf{p}$ 取 $\mathcal{X}$ 中的离散位置。

> **图 1（原文 Fig. 1）：** 准静态环境中信道的示意图：大多数散射体是静态的，小部分散射体随时间变化，相邻移动位置可能共享共同的静态散射体。

> **图 2（原文 Fig. 2）：** 无线电地图示意图。感兴趣区域被划分为网格单元；无线电地图是从网格单元到信道分布 $f_{\mathbf{h}}(\mathbf{h}|\mathbf{x}_i)$ 的映射，其中 $\mathbf{x}_i$ 是表示第 $i$ 个网格单元的离散位置。

### B. 系统动力学

考虑移动用户沿轨迹 $\mathcal{P}_t=(\mathbf{p}_1,\dots,\mathbf{p}_t)$ 移动，该轨迹可由已知转移概率 $\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})$ 的马尔可夫链描述。此类先验信息可经验地从先验测量获得。例如，对车辆合理速度范围，可以假设均匀先验 $\mathbb{P}(\mathbf{p}_t=\mathbf{x}_j|\mathbf{p}_{t-1}=\mathbf{x}_i)$。或者，转移概率可用截断高斯—马尔可夫模型 [24] 在第 $i$ 与第 $j$ 个网格点的坐标上指定：

$$
\mathbb{P}(\mathbf{p}_t=\mathbf{x}_i|\mathbf{p}_{t-1}=\mathbf{x}_j)\propto
\begin{cases}
\exp\left(-\|\mathbf{x}_i-(\mathbf{x}_j+\delta_t\bar{\mathbf{v}})\|_2^2\right), & \text{if }\|\mathbf{x}_i-\mathbf{x}_j\|_2^2\le\eta\delta_t,\\
0, & \text{otherwise},
\end{cases} \tag{3}
$$

其中 $\eta$ 决定最大可能速度，$\bar{\mathbf{v}}$ 是平均速度，$\delta_t$ 是时隙长度。

对信道 $\mathbf{h}_t$ 的动力学，考虑嵌入无线电地图的一阶 AR 模型 [8], [25]

$$
\mathbf{h}_t=\gamma\mathbf{h}_{t-1}+\sqrt{1-\gamma^2}\mathbf{u}_t, \tag{4}
$$

其中 $\mathbf{u}_t\sim\mathcal{CN}(\mathbf{0},\mathbf{C}(\mathbf{p}_t))$，$\gamma\in[0,1]$ 决定当前信道 $\mathbf{h}_t$ 与前一信道 $\mathbf{h}_{t-1}$ 之间的时间相关程度。此外，缩放因子 $\sqrt{1-\gamma^2}$ 确保扰动项 $\mathbf{u}_t$ 保持适当方差，以维持信道模型的统计性质。值得强调，由于信道的地理特定空间相关性，扰动 $\mathbf{u}_t$ 的统计量依赖用户位置 $\mathbf{p}_t$，而统计量 $\mathbf{C}(\mathbf{p}_t)$ 由无线电地图捕获。可以验证 $\mathbf{h}_t$ 的平稳分布服从 $\mathcal{CN}(\mathbf{0},\mathbf{C}(\mathbf{p}_t))$，这与我们的无线电地图模型一致。

在每个时隙，信道用一小组感知向量探测，观测为

$$
\mathbf{y}_t=\mathbf{A}_t\mathbf{h}_t+\mathbf{n}_t, \tag{5}
$$

其中 $\mathbf{A}_t\in\mathbb{C}^{M\times N_t}$ 是满足 $\mathbf{A}_t\mathbf{A}_t^H=\mathbf{I}$ 的半酉稀疏合并矩阵，$M\ll N_t$，$\mathbf{n}_t$ 表示测量噪声。噪声假设服从零均值复高斯分布，即 $\mathbf{n}_t\sim\mathcal{CN}(\mathbf{0},\sigma_n^2\mathbf{I})$，其中 $\sigma_n^2$ 是噪声方差。

观测模型 (5) 为上行与下行实现提供了统一表示。上行情形，BS 通过波束成形矩阵 $\mathbf{A}_t$ 接收信号 $\mathbf{y}_t=\mathbf{A}_t\mathbf{h}_t s+\mathbf{n}_t\in\mathbb{C}^M$，其中 $\mathbf{A}_t$ 的行作为合并向量，$s$ 表示参考符号。参数 $M$ 可能对应 BS 处可用射频（RF）链的数目。不失一般性（w.l.o.g.）可取 $s=1$ 得到观测模型 (5)。注意 $\mathbf{n}_t$ 是用半酉矩阵 $\mathbf{A}_t\in\mathbb{C}^{M\times N_t}$ 合并 $N_t$ 根天线的噪声后的等效噪声向量。若 $\tilde{\mathbf{n}}_t$ 表示天线处的 $N_t\times1$ 噪声向量，则 $\mathbf{n}_t=\mathbf{A}_t\tilde{\mathbf{n}}_t$。由于 $\mathbf{A}_t$ 的每一行正交归一，$\mathbf{n}_t$ 与 $\tilde{\mathbf{n}}_t$ 的元素都是零均值、同方差的独立同分布（i.i.d.）随机变量。下行情形，考虑在时隙 $t$ 使用 $M$ 个正交时频资源进行信道探测。对第 $m$ 个时频资源，参考符号 $s$ 用向量 $\mathbf{a}_{t,m}$ 波束成形，其中 $\mathbf{a}_{t,m}^T$ 对应 $\mathbf{A}_t$ 的第 $m$ 行。于是用户获得含噪观测 $\mathbf{y}_{t,m}=\mathbf{h}_t^T\mathbf{a}_{t,m}s+\mathbf{n}_{t,m}$；把 $M$ 个观测 $\mathbf{y}_{t,m}$ 堆叠成向量 $\mathbf{y}_t$ 后，接收信号模型与 (5) 相同。此时用户可能需要把接收到的导频观测 $\mathbf{y}_t$ 反馈给 BS，或者由用户执行信道跟踪。

注意上下行传输都涉及反馈信令，例如 5G 标准中规定的调度授权与 CSI 反馈。然而，测量强烈依赖实现的反馈开销超出本文范围。因此，本文有意只把 $M$ 个导频观测视为接收向量 $\mathbf{y}_t$ 的唯一贡献者，用于 CSI 跟踪。

### C. CSI 跟踪问题

记 $\mathcal{Y}_t=(\mathbf{y}_1,\dots,\mathbf{y}_t)$ 为沿轨迹 $\mathcal{P}_t$ 基于感知矩阵 $\mathcal{A}_t=(\mathbf{A}_1,\dots,\mathbf{A}_t)$ 的稀疏观测序列，CSI 序列记为 $\mathcal{H}_t=(\mathbf{h}_1,\dots,\mathbf{h}_t)$。本文目标是根据稀疏观测序列 $\mathcal{Y}_t$ 跟踪 CSI $\mathcal{H}_t$。特别地，我们提出恢复轨迹 $\mathcal{P}_t$ 作为中间步骤，借助无线电地图 $\mathcal{M}=\{(\mathbf{x},\mathbf{C}(\mathbf{x})):\mathbf{x}\in\mathcal{X}\}$ 辅助 CSI 跟踪；反过来，我们也需要基于 $\mathcal{Y}_t$ 与 $\mathcal{P}_t$ 构建或更新无线电地图 $\mathcal{M}$。

**1) 嵌入无线电地图的 CSI 跟踪：** 现有大多数嵌入无线电地图的 CSI 估计或波束跟踪方法需要位置信息 [15], [26]，或基于单次 CSI 测量 $\mathbf{y}_t$ 的位置估计 [20]。当有一串测量 $\mathcal{Y}_t$ 时，可以通过最大化联合概率 $p(\mathcal{Y}_t,\mathcal{H}_t)$，或基于联合分布 $p(\mathcal{Y}_t,\mathcal{H}_t)$ 最小化 $\mathcal{H}_t$ 的均方误差（MSE）来估计整个 CSI 序列 $\mathcal{H}_t$。经典算法是 KF [7], [8]，但它要求信道时间相关且统计平滑。具体地，传统 KF 要求 (4) 中的协方差矩阵 $\mathbf{C}(\mathbf{p}_t)$ 在空间上连续、无跳变。然而在密集城市场景中，信道 $\mathbf{h}_t$ 的时间与空间相关性可能因移动造成的突发信号阻塞而破坏，因此协方差矩阵 $\mathbf{C}(\mathbf{p}_t)$ 的过程可能不连续并在空间中出现跳变。

因此，我们提出一种基于隐藏轨迹 $\mathcal{P}_t$ 空间相关性的新 CSI 跟踪策略；由牛顿定律，$\mathcal{P}_t$ 必须连续。然而 $\mathcal{P}_t$ 不可观测，需作为潜变量估计。一旦估计出 $\mathcal{P}_t$，便可利用无线电地图 $\mathcal{M}$ 的先验信息跟踪 CSI，而不必假设 $\mathbf{C}(\mathbf{p}_t)$ 与 $\mathbf{C}(\mathbf{p}_{t-1})$ 之间有任何相关性。在数学上，考虑最大对数似然准则时，CSI 跟踪问题可表述为

$$
\begin{aligned}
\mathcal{P}_1:\quad &\max_{\mathbf{H}_T,\mathbf{P}_T,\mathbf{A}_T}\ \log p(\mathbf{Y}_T,\mathbf{H}_T,\mathbf{P}_T;\mathbf{A}_T,\mathcal{M})\\
&\text{subject to}\quad \mathbf{p}_t\in\mathcal{X},\quad t=1,2,\dots,T,
\end{aligned}
$$

其中 $p(\mathbf{Y}_T,\mathbf{H}_T,\mathbf{P}_T;\mathbf{A}_T,\mathcal{M})$ 表示给定感知矩阵序列 $\mathbf{A}_T=(\mathbf{A}_1,\dots,\mathbf{A}_T)$ 与来自无线电地图 $\mathcal{M}$ 的协方差矩阵 $\mathbf{C}(\mathbf{p}_t)$ 时，$\mathbf{Y}_T=(\mathbf{y}_1,\dots,\mathbf{y}_T)$、$\mathbf{H}_T=(\mathbf{h}_1,\dots,\mathbf{h}_T)$ 与 $\mathbf{P}_T=(\mathbf{p}_1,\dots,\mathbf{p}_T)$ 的联合概率。

**2) 无线电地图构建：** 为构建无线电地图 $\mathcal{M}$，需要锚点信息，因为 $\mathcal{P}_1$ 中除 $\mathcal{M}$ 外没有其他地理信息。记 $\Theta$ 为 BS 位置的集合，$f(\mathbf{Y}_T,\mathbf{P}_T;\Theta)$ 为在给定网络拓扑 $\Theta$（如 BS 位置）下衡量观测序列 $\mathbf{Y}_T$ 与轨迹 $\mathbf{P}_T$ 匹配程度的似然值函数。给定全部测量历史，无线电地图构建的拓扑正则化最大对数似然问题表述为

$$
\begin{aligned}
\mathcal{P}_2:\quad &\max_{\mathbf{H}_T,\mathbf{P}_T,\mathcal{M}}\ \log p(\mathbf{Y}_T,\mathbf{H}_T,\mathbf{P}_T;\mathcal{M})-\mu f(\mathbf{Y}_T,\mathbf{P}_T;\Theta)\\
&\text{subject to}\quad \mathbf{p}_t\in\mathcal{X},\quad t=1,2,\dots,T,
\end{aligned}
$$

其中 $\mu>0$ 是正则化参数。$\mathcal{P}_2$ 中的无线电地图变量 $\mathcal{M}$ 通过估计所有 $\mathbf{x}\in\mathcal{X}$ 的协方差矩阵 $\mathbf{C}(\mathbf{x})$ 构建。

> **图 3（原文 Fig. 3）：** 嵌入无线电地图的 CSI 跟踪框架框图。

## III. 基于切换卡尔曼滤波的无线电地图嵌入式 CSI 跟踪

本节关注求解问题 $\mathcal{P}_1$ 的跟踪方法。具体而言，我们提出如图 3 所示的嵌入无线电地图的 SKF 框架用于 CSI 跟踪。首先，给定感知矩阵序列 $\mathcal{A}_t$，联合估计与跟踪位置 $\mathbf{p}_t$ 与 CSI $\mathbf{h}_t$：其中 SKF 基于位置 $\mathbf{p}_t$ 的分布与无线电地图 $\mathcal{M}$，以切换动力学跟踪 $\mathbf{h}_t$；反过来，基于 $\mathbf{h}_t$ 的估计来估计与跟踪位置 $\mathbf{p}_t$。其次，通过最小化信道的微分熵动态调整感知矩阵 $\mathbf{A}_t$。由于本节中无线电地图 $\mathcal{M}$ 给定，为简化记号，在不影响上下文清晰性的地方省略联合概率 $p(\mathcal{Y}_T,\mathcal{H}_T,\mathcal{P}_T;\mathcal{A}_T,\mathcal{M})$ 中的 $\mathcal{A}_T$ 与 $\mathcal{M}$。

### A. 问题重述

利用贝叶斯定理，联合概率 $p(\mathcal{Y}_T,\mathcal{H}_T,\mathcal{P}_T)$ 可由下述命题显式表达。

**命题 1**（$p(\mathcal{Y}_T,\mathcal{H}_T,\mathcal{P}_T)$ 的因子分解）。联合概率可分解为

$$
p(\mathbf{Y}_T,\mathbf{H}_T,\mathbf{P}_T)=\prod_{t=1}^Tp(\mathbf{y}_t|\mathbf{h}_t)\prod_{t=2}^Tp(\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{p}_t)\times p(\mathbf{h}_1)\times\prod_{t=2}^T\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})\mathbb{P}(\mathbf{p}_1). \tag{6}
$$

**证明.** 见附录 A。

利用分解 (6) 并给定感知矩阵 $\mathcal{A}_T$，问题 $\mathcal{P}_1$ 变为

$$
\begin{aligned}
\mathcal{P}_1':\quad &\max_{\mathbf{H}_T,\mathbf{P}_T}\ \sum_{t=1}^T\log p(\mathbf{y}_t|\mathbf{h}_t)+\log p(\mathbf{h}_1)+\sum_{t=2}^T\log p(\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{p}_t)\\
&\qquad+\log\mathbb{P}(\mathbf{p}_1)+\sum_{t=2}^T\log\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})\\
&\text{subject to}\quad \mathbf{p}_t\in\mathcal{X},\quad t=1,2,\dots,T.
\end{aligned}
$$

### B. 无线电地图嵌入式切换卡尔曼滤波

这里我们提出 SKF 方法联合跟踪位置与 CSI。首先求给定截至时刻 $t$ 的测量与截至 $t-1$ 的轨迹时位置 $\mathbf{p}_t$ 的分布；然后借助无线电地图 $\mathcal{M}$ 与 $\mathbf{p}_t$ 的条件分布，用 SKF 递推跟踪 CSI $\mathbf{h}_t$；最后基于最大似然准则估计位置 $\mathbf{p}_t$。

**1) 位置分布：** 令 $\pi_t(\mathbf{p}_t)\triangleq p(\mathbf{p}_t|\mathcal{Y}_t,\mathcal{P}_{t-1})$ 为给定截至 $t$ 的测量与截至 $t-1$ 的轨迹时时刻 $t$ 位置的分布。利用贝叶斯定理，对 $t=2,3,\dots,T$，$\pi_t(\mathbf{p}_t)$ 推导为

$$
\begin{aligned}
\pi_t(\mathbf{p}_t)&=p(\mathbf{p}_t|\mathcal{Y}_t,\mathcal{P}_{t-1})=\frac{p(\mathcal{Y}_t,\mathcal{P}_{t-1},\mathbf{p}_t)}{p(\mathcal{Y}_t,\mathcal{P}_{t-1})} \tag{7}\\
&=\frac{p(\mathcal{Y}_t,\mathcal{P}_t)}{p(\mathcal{Y}_t,\mathcal{P}_{t-1})} \tag{8}\\
&=\frac{p(\mathbf{y}_t|\mathcal{Y}_{t-1},\mathcal{P}_t)p(\mathbf{p}_t|\mathcal{Y}_{t-1},\mathcal{P}_{t-1})p(\mathcal{Y}_{t-1},\mathcal{P}_{t-1})}{p(\mathbf{y}_t|\mathcal{Y}_{t-1},\mathcal{P}_{t-1})p(\mathcal{Y}_{t-1},\mathcal{P}_{t-1})} \tag{9}\\
&=\frac{p(\mathbf{y}_t|\mathbf{p}_t)\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})}{\sum_{\mathbf{x}\in\mathcal{X}}p(\mathbf{y}_t|\mathbf{x})\mathbb{P}(\mathbf{x}|\mathbf{p}_{t-1})}, \tag{10}
\end{aligned}
$$

其中式 (7) 由条件概率定义；式 (8) 利用 $\mathcal{P}_t=(\mathbf{p}_1,\dots,\mathbf{p}_t)$ 与 $\mathcal{P}_{t-1}=(\mathbf{p}_1,\dots,\mathbf{p}_{t-1})$ 的恒等关系；式 (9) 成立是因为 $p(\mathcal{Y}_t,\mathcal{P}_t)$ 与 $p(\mathcal{Y}_t,\mathcal{P}_{t-1})$ 都可用类似 (42) 的方式导出；式 (10) 成立是因为 $\mathbf{y}_t$ 依赖 $\mathbf{p}_t$，而 $\mathbf{p}_t$ 依赖 $\mathbf{p}_{t-1}$。给定观测模型 (5) 与 (4) 所示信道分布 $\mathbf{h}_t|\mathbf{p}_t\sim\mathcal{CN}(\mathbf{0},\mathbf{C}(\mathbf{p}_t))$，条件概率 $p(\mathbf{y}_t|\mathbf{p}_t)$ 可导出为

$$
p(\mathbf{y}_t|\mathbf{p}_t)=\frac{\exp\left(-\frac12\mathbf{y}_t^H\left(\mathbf{A}_t\mathbf{C}(\mathbf{p}_t)\mathbf{A}_t^H+\sigma_n^2\mathbf{I}\right)^{-1}\mathbf{y}_t\right)}{\sqrt{(2\pi)^M\left|\mathbf{A}_t\mathbf{C}(\mathbf{p}_t)\mathbf{A}_t^H+\sigma_n^2\mathbf{I}\right|}}. \tag{11}
$$

**2) 无线电地图嵌入式 CSI 跟踪：** 首先，基于截至 $t-1$ 的观测 $\mathcal{Y}_{t-1}$ 导出时刻 $t$ 的 CSI 预测及其相应误差协方差。
定义 $\hat{\mathbf{h}}_{t-1}\triangleq\mathbb{E}\{\mathbf{h}_{t-1}|\mathcal{Y}_{t-1}\}$ 为基于截至 $t-1$ 的观测 $\mathcal{Y}_{t-1}$ 对 CSI $\mathbf{h}_{t-1}$ 的贝叶斯估计量；定义 $\hat{\mathbf{h}}_{t|t-1}\triangleq\mathbb{E}\{\mathbf{h}_t|\hat{\mathbf{h}}_{t-1}\}$ 为基于 $\hat{\mathbf{h}}_{t-1}$ 对 CSI $\mathbf{h}_t$ 的预测。利用 CSI 动态模型 (4)，有

$$
\hat{\mathbf{h}}_{t|t-1}=\mathbb{E}\{\mathbf{h}_t|\hat{\mathbf{h}}_{t-1}\}=\gamma\hat{\mathbf{h}}_{t-1}. \tag{12}
$$

定义 $\mathbf{e}_{t|t-1}\triangleq\mathbf{h}_t-\hat{\mathbf{h}}_{t|t-1}$ 为基于截至 $t-1$ 的观测 $\mathcal{Y}_{t-1}$ 对 $\mathbf{h}_t$ 的信道预测误差。把 (12) 代入 $\mathbf{e}_{t|t-1}$ 得

$$
\mathbf{e}_{t|t-1}\triangleq\mathbf{h}_t-\hat{\mathbf{h}}_{t|t-1}
=\gamma\mathbf{h}_{t-1}+\sqrt{1-\gamma^2}\mathbf{u}_t-\gamma\hat{\mathbf{h}}_{t-1}
=\gamma\mathbf{e}_{t-1}+\sqrt{1-\gamma^2}\mathbf{u}_t, \tag{13}
$$

其中 $\mathbf{e}_{t-1}$ 是由贝叶斯估计量 $\hat{\mathbf{h}}_{t-1}$ 产生的信道估计误差，即 $\mathbf{e}_{t-1}\triangleq\mathbf{h}_{t-1}-\hat{\mathbf{h}}_{t-1}$。

由 (13) 中的信道预测误差 $\mathbf{e}_{t|t-1}$，其误差协方差导出为

$$
\begin{aligned}
\mathbf{Q}_{t|t-1}&\triangleq\mathbb{E}\{\mathbf{e}_{t|t-1}\mathbf{e}_{t|t-1}^H\}
=\gamma^2\mathbb{E}\{\mathbf{e}_{t-1}\mathbf{e}_{t-1}^H\}+(1-\gamma^2)\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_{t-1}\}\\
&=\gamma^2\mathbf{Q}_{t-1}+(1-\gamma^2)\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_{t-1}\}, \tag{14}
\end{aligned}
$$

其中 $\mathbf{Q}_{t-1}\triangleq\mathbb{E}\{\mathbf{e}_{t-1}\mathbf{e}_{t-1}^H\}$ 是 $\mathbf{e}_{t-1}$ 的误差协方差；项 $\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_{t-1}\}$ 可基于 (10) 中给定 $\mathbf{p}_{t-1}$ 时位置 $\mathbf{p}_t$ 的分布与无线电地图 $\mathcal{M}$ 计算如下：

$$
\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_{t-1}\}=\mathbb{E}_{\mathbf{p}_t\in\mathcal{X}}\{\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_t\}|\mathbf{p}_{t-1}\}=\sum_{\mathbf{p}_t\in\mathcal{X}}\pi_t(\mathbf{p}_t)\times\mathbf{C}(\mathbf{p}_t), \tag{15}
$$

这里回顾 (4) 中 $\mathbf{u}_t|\mathbf{p}_t\sim\mathcal{CN}(\mathbf{0},\mathbf{C}(\mathbf{p}_t))$，蕴含 $\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_t\}=\mathbf{C}(\mathbf{p}_t)$；而 $\pi_t(\mathbf{p}_t)$ 捕获基于截至 $t$ 的观测 $\mathcal{Y}_t$ 与截至 $t-1$ 的用户轨迹 $\mathcal{P}_{t-1}$ 在时刻 $t$ 的位置分布。可以看到，无线电地图 $\mathcal{M}$ 在构造隐藏位置变量 $\mathbf{p}_t$ 的分布与信道预测的误差协方差 $\mathbf{Q}_{t|t-1}$ 中起关键作用。

其次，基于截至 $t$ 的观测 $\mathcal{Y}_t$ 对贝叶斯估计量 $\hat{\mathbf{h}}_t\triangleq\mathbb{E}\{\mathbf{h}_t|\mathcal{Y}_t\}$ 的更新方程可写为 [27]

$$
\hat{\mathbf{h}}_t=\hat{\mathbf{h}}_{t|t-1}+\mathbf{K}_t(\mathbf{y}_t-\mathbf{A}_t\hat{\mathbf{h}}_{t|t-1}), \tag{16}
$$

其中 $\mathbf{K}_t$ 是测量残差 $\mathbf{y}_t-\mathbf{A}_t\hat{\mathbf{h}}_{t|t-1}$ 的系数。使估计量 $\hat{\mathbf{h}}_t$ 均方误差最小的最优系数 $\mathbf{K}_t$ 由 [27] 给出：

$$
\mathbf{K}_t=\mathbf{Q}_{t|t-1}\mathbf{A}_t^H\left(\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H+\sigma_n^2\mathbf{I}\right)^{-1}. \tag{17}
$$

由 (17) 可见，最优 $\mathbf{K}_t$ 依赖误差协方差 $\mathbf{Q}_{t|t-1}$，而后者部分由信道空间统计量 $\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_{t-1}\}$、从而由无线电地图 $\mathcal{M}$ 决定。

基于 (16) 与 (17)，估计误差 $\mathbf{e}_t\triangleq\mathbf{h}_t-\hat{\mathbf{h}}_t$ 的协方差可导出为

$$
\begin{aligned}
\mathbf{Q}_t&\triangleq\mathbb{E}\{(\mathbf{h}_t-\hat{\mathbf{h}}_t)(\mathbf{h}_t-\hat{\mathbf{h}}_t)^H\}\\
&=(\mathbf{I}-\mathbf{K}_t\mathbf{A}_t)\mathbf{Q}_{t|t-1}(\mathbf{I}-\mathbf{K}_t\mathbf{A}_t)^H+\mathbf{K}_t\mathbf{K}_t^H/\sigma_n^2\\
&=(\mathbf{I}-\mathbf{K}_t\mathbf{A}_t)\mathbf{Q}_{t|t-1}, \tag{18}
\end{aligned}
$$

从而完成该递推滤波。

**3) 用户位置跟踪：** 基于观测序列 $\mathcal{Y}_t$、截至 $t$ 的 CSI 序列 $\mathcal{H}_t$ 与用户轨迹 $\mathcal{P}_{t-1}$，时刻 $t=2,3,\dots,T$ 的用户位置可通过最大化条件概率 $\bar\pi_t(\mathbf{p}_t)\triangleq p(\mathbf{p}_t|\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_{t-1})$ 来跟踪。类似 (10)，$\bar\pi_t(\mathbf{p}_t)$ 可导出为

$$
\begin{aligned}
\bar\pi_t(\mathbf{p}_t)&\triangleq p(\mathbf{p}_t|\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_{t-1})
=\frac{p(\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_{t-1},\mathbf{p}_t)}{p(\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_{t-1})} \tag{19}\\
&=\frac{p(\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_t)}{p(\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_{t-1})} \tag{20}\\
&=\frac{p(\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{p}_t)\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})}{\sum_{\mathbf{x}\in\mathcal{X}}p(\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{x})\mathbb{P}(\mathbf{x}|\mathbf{p}_{t-1})}, \tag{21}
\end{aligned}
$$

其中式 (19) 由条件概率定义；式 (20) 利用 $\mathcal{P}_t=(\mathbf{p}_1,\dots,\mathbf{p}_t)$ 与 $\mathcal{P}_{t-1}=(\mathbf{p}_1,\dots,\mathbf{p}_{t-1})$ 的恒等关系；式 (21) 成立是因为联合分布 $p(\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_t)$ 由 (46) 给出，而 $p(\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_{t-1})$ 由对 $p(\mathcal{Y}_t,\mathcal{H}_t,\mathcal{P}_t)$ 关于 $\mathbf{p}_t$ 边缘化得到。此外，条件分布 $\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{p}_t\sim\mathcal{CN}(\gamma\mathbf{h}_{t-1},(1-\gamma^2)\mathbf{C}(\mathbf{p}_t))$ 由 (4) 得出。

基于 (21)，时刻 $t=2,3,\dots,T$ 的用户位置可求得为

$$
\hat{\mathbf{p}}_t=\arg\max_{\mathbf{p}_t\in\mathcal{X}}\ p(\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{p}_t)\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})
=\arg\max_{\mathbf{p}_t\in\mathcal{X}}\ \frac{\exp\left(-\frac12\boldsymbol{\Delta}_t^H\left((1-\gamma^2)\mathbf{C}(\mathbf{p}_t)\right)^{-1}\boldsymbol{\Delta}_t\right)}{\sqrt{(2\pi(1-\gamma^2))^{N_t}\left|\mathbf{C}(\mathbf{p}_t)\right|}}\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1}), \tag{22}
$$

其中 $\boldsymbol{\Delta}_t\triangleq\mathbf{h}_t-\gamma\mathbf{h}_{t-1}$。

嵌入无线电地图的 SKF 整体算法见算法 1。算法 1 的复杂度分析如下：每个时间步，CSI 跟踪的计算复杂度为 $\mathcal{O}(|\mathcal{X}|N_t^2+N_t^2M+M^3+N_t^3)$。具体地，项 $\mathcal{O}(|\mathcal{X}|N_t^2)$ 来自计算 (15) 中 CSI 的空间统计量；$\mathcal{O}(N_t^2M+M^3)$ 来自 CSI 估计中的矩阵运算，例如计算 (17) 中的 $\mathbf{Q}_{t|t-1}\mathbf{A}_t^H$；$\mathcal{O}(N_t^3)$ 来自 (22) 中用户定位涉及的矩阵求逆。

> **算法 1　面向在线 CSI 跟踪的嵌入无线电地图的 SKF**
> **输入：** 无线电地图 $\mathcal{M}$、噪声方差 $\sigma_n^2$，以及初始化位置 $\hat{\mathbf{p}}_1$（例如来自均匀先验）。
> 1) 在时刻 $t=1$，随机生成 $\mathbf{A}_1$ 以观测 $\mathbf{y}_1$。初始化 $\hat{\mathbf{h}}_1\sim\mathcal{CN}(\mathbf{0},\mathbf{C}(\hat{\mathbf{p}}_1))$ 与 $\mathbf{Q}_1=(1-\gamma^2)\sum_{\mathbf{p}_1\in\mathcal{X}}\pi_1(\mathbf{p}_1)\times\mathbf{C}(\mathbf{p}_1)$，其中 $\pi_1(\mathbf{p}_1)=p(\mathbf{p}_1|\mathbf{y}_1)$。
> 2) 对每个 $t>1$：
> 　a) 基于观测 $\mathcal{Y}_{t-1}$ 的信道预测：
> 　　i) $\hat{\mathbf{h}}_{t|t-1}=\gamma\hat{\mathbf{h}}_{t-1}$。
> 　　ii) $\mathbf{Q}_{t|t-1}=\gamma^2\mathbf{Q}_{t-1}+(1-\gamma^2)\sum_{\mathbf{p}_t\in\mathcal{X}}\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1}=\hat{\mathbf{p}}_{t-1})\times\mathbf{C}(\mathbf{p}_t)$，其中 $\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1}=\hat{\mathbf{p}}_{t-1})$ 由 (3) 给出，$\mathbf{C}(\mathbf{p}_t)$ 嵌入在无线电地图 $\mathcal{M}$ 中。
> 　b) 基于 $\mathbf{Q}_{t|t-1}$ 用 (32) 设计 $\mathbf{A}_t$，并用 $\mathbf{A}_t$ 进行信道感知以获得 $\mathbf{y}_t$。
> 　c) 按 $\mathbf{Q}_{t|t-1}=\gamma^2\mathbf{Q}_{t-1}+(1-\gamma^2)\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_{t-1}=\hat{\mathbf{p}}_{t-1}\}$ 精化 $\mathbf{Q}_{t|t-1}$，其中 $\mathbb{E}\{\mathbf{u}_t\mathbf{u}_t^H|\mathbf{p}_{t-1}=\hat{\mathbf{p}}_{t-1}\}=\sum_{\mathbf{p}_t\in\mathcal{X}}\pi_t(\mathbf{p}_t)\times\mathbf{C}(\mathbf{p}_t)$，$\pi_t(\mathbf{p}_t)$ 由 (10) 计算。
> 　d) 基于观测 $\mathcal{Y}_t$ 的信道估计：
> 　　i) $\mathbf{K}_t=\mathbf{Q}_{t|t-1}\mathbf{A}_t^H(\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H+\sigma_n^2\mathbf{I})^{-1}$。
> 　　ii) $\hat{\mathbf{h}}_t=\hat{\mathbf{h}}_{t|t-1}+\mathbf{K}_t(\mathbf{y}_t-\mathbf{A}_t\hat{\mathbf{h}}_{t|t-1})$。
> 　　iii) $\mathbf{Q}_t=(\mathbf{I}-\mathbf{K}_t\mathbf{A}_t)\mathbf{Q}_{t|t-1}$。
> 　e) 估计用户位置 $\hat{\mathbf{p}}_t=\arg\max_{\mathbf{p}_t\in\mathcal{X}}p(\hat{\mathbf{h}}_t|\hat{\mathbf{h}}_{t-1},\mathbf{p}_t)\mathbb{P}(\mathbf{p}_t|\hat{\mathbf{p}}_{t-1})$。
> 　f) 输出 $\hat{\mathbf{h}}_t$ 与 $\hat{\mathbf{p}}_t$。

### C. 基于熵的感知矩阵自适应

由 (16) 可见，信道估计量 $\hat{\mathbf{h}}_t$ 由 $\hat{\mathbf{h}}_{t|t-1}$ 的更新依赖观测 $\mathbf{y}_t$，而 $\mathbf{y}_t$ 受感知矩阵 $\mathbf{A}_t$ 影响。当没有先验信息时，可使用随机感知矩阵 $\mathbf{A}_t$。然而在跟踪场景中，先验信息可用于优化感知矩阵 $\mathbf{A}_t$ 以获得更好的 CSI 跟踪。为此，我们研究 $\hat{\mathbf{h}}_t$ 关于（w.r.t.）$\mathbf{A}_t$ 的微分熵。

**1) 微分熵：** 首先，为评估信道估计量 $\hat{\mathbf{h}}_t$ 的不确定性，我们导出 $\hat{\mathbf{h}}_t$ 关于误差协方差 $\mathbf{Q}_t$ 的微分熵。
由 (18)，给定截至 $t$ 的测量 $\mathcal{Y}_t$ 时 $\hat{\mathbf{h}}_t$ 的误差协方差 $\mathbb{E}\{(\mathbf{h}_t-\hat{\mathbf{h}}_t)(\mathbf{h}_t-\hat{\mathbf{h}}_t)^H\}$ 由 $\mathbf{Q}_t$ 捕获，这意味着 $\hat{\mathbf{h}}_t\sim\mathcal{CN}(\mathbf{h}_t,\mathbf{Q}_t)$。据此，$\hat{\mathbf{h}}_t$ 的微分熵由 [28, Theorem 8.4.1] 导出为

$$
q(\hat{\mathbf{h}}_t)=\frac{N_t}{2}\left(1+\log(2\pi)\right)+\frac12\log\left|\mathbf{Q}_t\right|. \tag{23}
$$

类似地，基于 (12) 与 (14)，$\hat{\mathbf{h}}_{t|t-1}$ 的微分熵为

$$
q(\hat{\mathbf{h}}_{t|t-1})=\frac{N_t}{2}\left(1+\log(2\pi)\right)+\frac12\log\left|\mathbf{Q}_{t|t-1}\right|. \tag{24}
$$

基于 (23) 与 (24)，可把给定 $q(\hat{\mathbf{h}}_{t|t-1})$ 时的微分熵 $q(\hat{\mathbf{h}}_t)$ 表示为

$$
q(\hat{\mathbf{h}}_t)=q(\hat{\mathbf{h}}_{t|t-1})+\frac12\left(\log\left|\mathbf{Q}_t\right|-\log\left|\mathbf{Q}_{t|t-1}\right|\right). \tag{25}
$$

接下来，我们关于感知矩阵 $\mathbf{A}_t$ 最小化 $q(\hat{\mathbf{h}}_t)$，而 $\mathbf{A}_t$ 如 (18) 所示嵌入在 $\mathbf{Q}_t$ 中。给定 $q(\hat{\mathbf{h}}_{t|t-1})$ 与 (25)，最小化 $q(\hat{\mathbf{h}}_t)$ 等价于最小化 $q(\hat{\mathbf{h}}_t)-q(\hat{\mathbf{h}}_{t|t-1})=\frac12(\log|\mathbf{Q}_t|-\log|\mathbf{Q}_{t|t-1}|)$，由此得到如下优化问题

$$
\min_{\mathbf{A}_t}\ \frac12\left(\log\left|\mathbf{Q}_t\right|-\log\left|\mathbf{Q}_{t|t-1}\right|\right)\quad \text{subject to}\quad \mathbf{A}_t\mathbf{A}_t^H=\mathbf{I}. \tag{26}
$$

**2) 自适应感知矩阵 $\mathbf{A}_t$ 的解：** 为求解问题 (26)，我们先显式导出 $\frac12(\log|\mathbf{Q}_t|-\log|\mathbf{Q}_{t|t-1}|)$ 关于 $\mathbf{A}_t$ 的表达式。虽然已在 (14) 与 (18) 导出 $\mathbf{Q}_{t|t-1}$ 与 $\mathbf{Q}_t$，但由于 $\mathbf{Q}_t$、$\mathbf{Q}_{t|t-1}$、$\mathbf{Q}_{t-1}$ 递推耦合，直接由它们导出 $\frac12(\log|\mathbf{Q}_t|-\log|\mathbf{Q}_{t|t-1}|)$ 并不直接。因此，我们给出如下命题，提供从 $\mathbf{Q}_{t|t-1}$ 到 (18) 的 $\mathbf{Q}_t$ 的另一种等价转移。

**命题 2**（误差传播的替代过程）。误差协方差 $\mathbf{Q}_t$ 服从如下误差传播过程

$$
\mathbf{Q}_t^{-1}=\mathbf{Q}_{t|t-1}^{-1}+\mathbf{A}_t^H(\sigma_n^2\mathbf{I})^{-1}\mathbf{A}_t. \tag{27}
$$

**证明.** 见附录 B。

对 (27) 取行列式得

$$
\begin{aligned}
\left|\mathbf{Q}_t^{-1}\right|&=\left|\mathbf{Q}_{t|t-1}^{-1}+\mathbf{A}_t^H(\sigma_n^2\mathbf{I})^{-1}\mathbf{A}_t\right|\\
&=\left|\mathbf{Q}_{t|t-1}^{-1}\right|\left|\mathbf{I}+\mathbf{Q}_{t|t-1}^{-1}\mathbf{A}_t^H(\sigma_n^2\mathbf{I})^{-1}\mathbf{A}_t\right| \tag{28}\\
&=\left|\mathbf{Q}_{t|t-1}^{-1}\right|\left|\mathbf{I}+\sigma_n^{-2}\mathbf{A}_t\mathbf{Q}_{t|t-1}^{-1}\mathbf{A}_t^H\right|, \tag{29}
\end{aligned}
$$

其中式 (28) 利用行列式的乘法性质，即 $|\mathbf{X}\mathbf{Y}|=|\mathbf{X}||\mathbf{Y}|$；式 (29) 基于 Weinstein–Aronszajn 恒等式，即 $|\mathbf{I}_m+\mathbf{X}\mathbf{Y}|=|\mathbf{I}_n+\mathbf{Y}\mathbf{X}|$。对 (29) 取对数并应用行列式的逆性质，进一步有

$$
\log\left|\mathbf{Q}_t\right|-\log\left|\mathbf{Q}_{t|t-1}\right|=-\log\left|\mathbf{I}+\sigma_n^{-2}\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H\right|. \tag{30}
$$

于是问题 (26) 可等价重写为

$$
\max_{\mathbf{A}_t}\ \left|\mathbf{I}+\sigma_n^{-2}\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H\right|\quad \text{subject to}\quad \mathbf{A}_t\mathbf{A}_t^H=\mathbf{I}. \tag{31}
$$

问题 (31) 可利用特征值分解（EVD）与矩阵行列式的性质求解，如下述命题所示。

**命题 3**（自适应感知矩阵）。问题 (31) 的解为

$$
\mathbf{A}_t=[\mathbf{w}_{t-1,1},\mathbf{w}_{t-1,2},\dots,\mathbf{w}_{t-1,m},\dots,\mathbf{w}_{t-1,M}]^H, \tag{32}
$$

其中 $\mathbf{w}_{t-1,m}$ 是误差协方差 $\mathbf{Q}_{t|t-1}$ 的第 $m$ 大特征值对应的特征向量。
**证明.** 见附录 C。

命题 3 建立了一种通过优先选择信息增益高的子空间来自适应调整感知矩阵 $\mathbf{A}_t$ 的机制。为处理第 $m$ 大特征值（$m\le M$）出现重根、从而由多个特征向量张成一个子空间的情形，可以采用随机化策略，从该子空间中随机选择一个特征向量。

在初期阶段，先验信息稀少、$\mathbf{Q}_{t|t-1}$ 近似单位矩阵，所提策略自然退化为使用随机感知向量，这与压缩感知文献中的策略一致。随着观测积累，依据 (23) 与 (30) 的引导，该策略逐步精化 $\mathbf{A}_t$ 以最小化 $\log|\mathbf{Q}_t|$，从而自适应地遍历信道的子空间 $\mathbf{Q}_{t|t-1}$ 并降低微分熵 $q(\hat{\mathbf{h}}_t)$。这与文献中的波束扫描策略一致。

自适应感知矩阵可并入所提出的嵌入无线电地图的 SKF 框架，以实现高效信道感知。然而，$\mathbf{A}_t$ 的设计依赖误差协方差 $\mathbf{Q}_{t|t-1}$，而后者基于用测量 $\mathbf{y}_t$ 计算的位置分布 $\pi_t(\mathbf{p}_t)$。为解决这一实现问题，在观测 $\mathbf{y}_t$ 之前，转移概率 $\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})$ 被当作先验位置分布。于是，先用 $\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})$ 计算误差协方差 $\mathbf{Q}_{t|t-1}$，再通过 $\pi_t(\mathbf{p}_t)$ 精化，分别如算法 1 的步骤 2a 与 2c 所述。

值得注意，所提自适应感知方法的额外计算代价主要来自 $\mathbf{Q}_{t|t-1}$ 的特征分解；这是因为 $\mathbf{A}_t$ 的设计依赖误差协方差 $\mathbf{Q}_{t|t-1}$，而 $\mathbf{Q}_{t|t-1}$ 的计算已在第 III-B 节的 CSI 跟踪复杂度分析中计入。全秩矩阵的特征分解需要 $\mathcal{O}(N_t^3)$ 的复杂度，但对低秩矩阵存在 $\mathcal{O}(N_t^2)$ 的高效分解算法。

## IV. 无线电地图构建

本节我们按 $\mathcal{P}_2$ 的表述，通过估计隐藏位置变量 $\mathbf{p}_t$ 与相应信道协方差 $\mathbf{C}(\mathbf{p}_t)$ 来构建无线电地图 $\mathcal{M}$。注意，这里讨论的构建与第 III 节研究的 CSI 跟踪问题是解耦的。

尽管 $\mathcal{P}_2$ 也恢复信道 $\mathbf{h}_t$ 与位置 $\mathbf{p}_t$，但它与第 III 节的 CSI 跟踪问题在以下几方面不同：第一，由于第 III 节的最终目标是估计信道 $\mathbf{h}_t$，隐藏位置 $\mathbf{p}_t$ 的精度并不关键；相反，$\mathcal{P}_2$ 旨在为无线电地图构建恢复精确位置 $\mathbf{p}_t$。第二，在 $\mathcal{P}_2$ 中可接受离线解，即可以积累大量可能来自不同路线、不同用户 $k$ 的序列数据 $\{\mathbf{Y}_T^{(k)}\}$，以增强位置 $\mathbf{p}_t$ 的估计。为说明原理，我们只考虑一个用户沿一条路线累积足够多测量。第三，第 III 节中 $\mathbf{p}_t$ 的锚点信息来自无线电地图 $\mathcal{M}$，而在 $\mathcal{P}_2$ 中我们需要一些边信息 $\Theta$ 来恢复 $\mathbf{p}_t$，因为无线电地图 $\mathcal{M}$ 是待优化变量。

本文假设可以从网络拓扑 $\Theta$（如 BS 位置）的边信息获得一个非常粗略的位置 $\tilde{\mathbf{p}}_t$。基于稀疏信道测量 $\mathbf{y}_t$ 的粗定位已有活跃研究 [29], [30]，例如使用加权质心定位（weighted centroid localization，WCL）算法。文献 [29] 用真实数据表明，仅测量来自 BS 的接收信号强度（RSS）即可达到 22 米的定位误差。总体而言，文献 [30] 报告了 20～60 米的基于 RSS 的定位误差。

虽然 20 米的定位误差对于无线电地图构建仍然太粗，但本节要研究的基本问题是：嵌入无线电地图的 CSI 模型能否从粗位置 $\tilde{\mathbf{p}}_t$ 大幅提升定位性能？

### A. 记忆辅助的轨迹发现

假设在时隙 $t$ 可获得非常粗略的位置 $\tilde{\mathbf{p}}_t$。记 $\tilde{\mathbf{P}}_T=(\tilde{\mathbf{p}}_1,\dots,\tilde{\mathbf{p}}_T)$，定义 $L_2$ 范数值函数 $f(\mathbf{Y}_T,\mathbf{P}_T;\Theta)=\sum_{t=1}^T\|\mathbf{p}_t-\tilde{\mathbf{p}}_t\|_2$。注意如何把粗位置 $\tilde{\mathbf{p}}_t$ 融合进 $\mathcal{P}_2$ 不是这里的重点，值函数 $f(\mathbf{Y}_T,\mathbf{P}_T;\Theta)$ 的其他形式也可能可行。问题 $\mathcal{P}_2$ 可重写为

$$
\begin{aligned}
\mathcal{P}_2':\quad &\max_{\mathbf{H}_T,\mathbf{P}_T,\mathcal{M}}\ \log p(\mathbf{Y}_T,\mathbf{H}_T,\mathbf{P}_T;\mathcal{M})-\mu\sum_{t=1}^T\|\mathbf{p}_t-\tilde{\mathbf{p}}_t\|_2\\
&\text{subject to}\quad \mathbf{p}_t\in\mathcal{X},\quad t=1,2,\dots,T,
\end{aligned}
$$

其中 $\mu>0$ 是正则化参数。

由于观测 $\mathbf{y}_t$ 依赖隐藏用户位置 $\mathbf{p}_t$，而 $\mathbf{p}_t$ 的转移概率由移动模型 (3) 描述，我们可以构造一个带正则项的 HMM 问题来跟踪 $\mathbf{Y}_T$ 与 $\mathbf{P}_T$ 的序列状态演化。具体地，由观测模型 (5)，由于 $\mathbf{y}_t$ 依赖 $\mathbf{h}_t$ 而 $\mathbf{h}_t$ 依赖 $\mathbf{p}_t$，可把 $\mathbf{h}_t$ 从 $p(\mathbf{Y}_T,\mathbf{H}_T,\mathbf{P}_T;\mathcal{M})$ 中边缘化得到

$$
p(\mathcal{Y}_T,\mathcal{P}_T;\mathcal{M})=\prod_{t=1}^Tp(\mathbf{y}_t|\mathbf{p}_t;\mathcal{M})\times\prod_{t=2}^T\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})\mathbb{P}(\mathbf{p}_1), \tag{33}
$$

其推导与 (10) 相同。因此，基于问题 $\mathcal{P}_2'$，带正则项的 HMM 问题表述为

$$
\begin{aligned}
\max_{\mathbf{P}_T}\ &\sum_{t=1}^T\left(\log p(\mathbf{y}_t|\mathbf{p}_t;\mathcal{M})+\mu\|\mathbf{p}_t-\tilde{\mathbf{p}}_t\|_2\right)+\sum_{t=2}^T\log\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})+\log\mathbb{P}(\mathbf{p}_1)\\
&\text{subject to}\quad \mathbf{p}_t\in\mathcal{X},\quad t=1,2,\dots,T.
\end{aligned} \tag{34}
$$

如 (34) 所示，轨迹发现问题可被表述为 HMM 解码任务，其目标是找到使正则化对数似然最大的最可能隐藏状态（位置）序列。具体地，对数似然 $\log p(\mathbf{y}_t|\mathbf{p}_t;\mathcal{M})+\log\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})$ 捕获轨迹 $\mathbf{P}_T$ 的隐藏动力学，而正则项 $\mu\|\mathbf{p}_t-\tilde{\mathbf{p}}_t\|_2$ 用来自物理世界的地理边信息 $\tilde{\mathbf{p}}_t$ 校准拓扑 $\mathbf{p}_t$。

为求解问题 (34)，可采用 Viterbi 算法，通过动态规划遍历所有可能的位置序列以高效计算最优轨迹 [31]。每个时间步，该算法递归地评估到达状态 $\mathbf{p}_t$ 的最佳位置序列的组合似然与转移概率，同时纳入正则项 $\mu\|\mathbf{p}_t-\tilde{\mathbf{p}}_t\|_2$ 以惩罚偏离 $\tilde{\mathbf{p}}_t$。通过每步维护回溯指针，算法跟踪具有最高累积目标值的位置序列。该过程确保隐式探索所有可能轨迹，并保留最可能序列作为问题 (34) 的最终解。用 Viterbi 算法求解问题 (34) 的时间复杂度为 $\mathcal{O}(T|\mathcal{X}|^2N_t^3)$，其中 $\mathcal{O}(T|\mathcal{X}|^2)$ 是 Viterbi 算法处理标量变量转移过程的时间复杂度，$\mathcal{O}(N_t^3)$ 来自每步 $p(\mathbf{y}_t|\mathbf{p}_t)$ 中的矩阵求逆运算。

### B. 从稀疏 CSI 测量估计协方差

记 $\mathcal{T}_i\triangleq\{t:\mathbf{p}_t=\mathbf{x}_i\in\mathcal{X}\}$ 为在第 $i$ 个网格单元中采集的测量集合。我们需要基于测量 $\mathbf{y}_t\in\mathbb{C}^M$（$t\in\mathcal{T}_i$，$M\ll N_t$）构建协方差矩阵 $\mathbf{C}(\mathbf{x}_i)=\mathbb{E}\{\mathbf{h}_t\mathbf{h}_t^H\}\in\mathbb{C}^{N_t\times N_t}$ 的估计量 $\hat{\mathbf{C}}(\mathbf{x}_i)$。假设第 $i$ 个网格单元中的测量 $\mathbf{y}_t$ 相互独立；否则，为确保独立性，可从采集的数据中随机抽取子集。虽然假设对离散位置 $\mathbf{x}_i$ 已采集足够多测量，但测量 $\mathbf{y}_t$ 的维数 $M$ 很低仍是一个挑战。

**1) 协方差的无偏估计：** 总体思路是在感知矩阵 $\mathbf{A}_t$ 张成的 $N_t$ 维子空间中构造一个数据点，该数据点定义为

$$
\boldsymbol{\varphi}_t=\mathbf{A}_t^H\mathbf{y}_t=\mathbf{A}_t^H\mathbf{A}_t\mathbf{h}_t+\mathbf{A}_t^H\mathbf{n}_t=\boldsymbol{\Phi}_t\mathbf{h}_t+\mathbf{A}_t^H\mathbf{n}_t, \tag{35}
$$

其中 $\boldsymbol{\Phi}_t=\mathbf{A}_t^H\mathbf{A}_t\in\mathbb{C}^{N_t\times N_t}$。然后构造样本协方差矩阵如下

$$
\begin{aligned}
\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)&\triangleq\frac{N_t^2}{M^2}\frac{1}{|\mathcal{T}_i|}\sum_{t\in\mathcal{T}_i}\boldsymbol{\varphi}_t\boldsymbol{\varphi}_t^H\\
&=\frac{N_t^2}{|\mathcal{T}_i|M^2}\sum_{t\in\mathcal{T}_i}\left(\boldsymbol{\Phi}_t\mathbf{h}_t+\mathbf{A}_t^H\mathbf{n}_t\right)\left(\boldsymbol{\Phi}_t\mathbf{h}_t+\mathbf{A}_t^H\mathbf{n}_t\right)^H. \tag{36}
\end{aligned}
$$

可以证明，如下命题所示，可由样本协方差矩阵 $\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)$ 构造协方差矩阵 $\mathbf{C}(\mathbf{x}_i)$ 的无偏估计量。

**命题 4**（无偏估计量）。设 $\mathbf{A}_t\in\mathbb{C}^{M\times N_t}$ 是均匀随机抽取的 $M$ 维子空间的正交基。$\mathbf{C}(\mathbf{x}_i)$ 的无偏估计量由

$$
\hat{\mathbf{C}}(\mathbf{x}_i)=\frac{M\left(\bar N_t\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)-(N_t-M)\mathrm{tr}(\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i))\mathbf{I}\right)}{N_t(N_tM+N_t-2)}
-\frac{\sigma_n^2\left(M\bar N_t\boldsymbol{\Omega}_A(\mathbf{x}_i)-N_t(N_t-M)\mathrm{tr}(\boldsymbol{\Omega}_A(\mathbf{x}_i))\mathbf{I}\right)}{M(N_tM+N_t-2)} \tag{37}
$$

给出，其中 $\bar N_t\triangleq(N_t+2)(N_t-1)$，$\boldsymbol{\Omega}_A(\mathbf{x}_i)\triangleq\frac{1}{|\mathcal{T}_i|}\sum_{t\in\mathcal{T}_i}\mathbf{A}_t^H\mathbf{A}_t$。
**证明.** 见附录 D。

命题 4 中的无偏估计量 $\hat{\mathbf{C}}(\mathbf{x}_i)$ 由 CSI 测量样本协方差的缩放版本，加上一个计入噪声协方差的附加修正项构成。考虑 $M=N_t$ 且 $\boldsymbol{\Phi}_t=\mathbf{A}_t^H\mathbf{A}_t=\mathbf{I}$ 的特殊情形，估计量简化为 $\hat{\mathbf{C}}(\mathbf{x}_i)=\sum_{t\in\mathcal{T}_i}(\boldsymbol{\varphi}_t\boldsymbol{\varphi}_t^H-\sigma_n^2\mathbf{I})/|\mathcal{T}_i|$。接下来，对 $\hat{\mathbf{C}}(\mathbf{x}_i)$ 取期望可得 $\mathbb{E}\{\hat{\mathbf{C}}(\mathbf{x}_i)\}=\mathbb{E}\{\sum_{t\in\mathcal{T}_i}((\mathbf{h}_t+\mathbf{A}_t^H\mathbf{n}_t)(\mathbf{h}_t+\mathbf{A}_t^H\mathbf{n}_t)^H-\sigma_n^2\mathbf{I})/|\mathcal{T}_i|\}=\mathbf{C}(\mathbf{x}_i)$。此外，由 (37) 可见，环境噪声被 $\mathbf{A}_t$ 重缩放并随后去除。在 $\sigma_n^2$ 很小的高 SNR 场景中，(37) 的第一项（测量项）主导信道协方差估计，第二项（噪声项）可视为可忽略。

**2) 重构误差的上界：** 这里给出信道协方差 $\mathbf{C}(\mathbf{x}_i)$ 的重构误差关于 CSI 维数 $N_t$、观测维数 $M$、观测数 $|\mathcal{T}_i|$ 与真实信道协方差秩的关系。

考虑 $\sigma_n=0$ 的高 SNR 情形，观测 CSI 简化为 $\mathbf{y}_t=\mathbf{A}_t\mathbf{h}_t$。基于 (37)，(37) 中的无偏估计量简化为

$$
\hat{\mathbf{C}}'(\mathbf{x}_i)=\frac{M\left(\bar N_t\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)-(N_t-M)\mathrm{tr}(\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i))\mathbf{I}\right)}{N_t(N_tM+N_2-2)}. \tag{38}
$$

> **原文疑点：** 式 (38) 分母在 PDF 中印作 $N_t(N_tM+N_2-2)$（下标为 $2$），按上下文应为 $N_t(N_tM+N_t-2)$，与式 (37) 及附录 D 的式 (54) 一致；本页按原文转写并在此加注。

如下命题给出重构误差 $\hat{\mathbf{C}}'(\mathbf{x}_i)-\mathbf{C}(\mathbf{x}_i)$ 的谱上界。

**命题 5**（重构误差的上界）。假设 $\mathrm{rank}(\mathbf{C}(\mathbf{x}_i))\le R$，则存在通用常数 $\kappa>0$，使得对任意 $\zeta\in(0,1)$，当 $N_t\ge2$ 且 $|\mathcal{T}_i|\ge N_t\log(1/\zeta)$ 时，以至少 $1-\zeta$ 的概率有

$$
\|\hat{\mathbf{C}}'(\mathbf{x}_i)-\mathbf{C}(\mathbf{x}_i)\|_2\le\frac{\kappa}{\sqrt{|\mathcal{T}_i|}}\|\mathbf{C}(\mathbf{x}_i)\|_2(S_1+S_2+S_3), \tag{39}
$$

其中 $S_1=\frac{\sqrt{N_tR^2\log^2(|\mathcal{T}_i|N_t/\zeta)}}{M}$，$S_2=\sqrt{R\log(1/\zeta)}$，$S_3=\frac{N_tR\log^2(|\mathcal{T}_i|N_t/\zeta)}{\sqrt{|\mathcal{T}_i|}M}$。
**证明.** 由于 $\mathbf{h}_t$ 服从高斯分布 $\mathcal{CN}(\mathbf{0},\mathbf{C}(\mathbf{x}_i))$，且 $\hat{\mathbf{C}}'(\mathbf{x}_i)$ 是 (38) 给出的无偏估计量，把文献 [32] 中的推论 1（高斯上界）与推论 2 应用于我们的情形即得结果。

命题 5 给出关于样本协方差重构误差影响因素的关键洞见。第一，若 $|\mathcal{T}_i|$ 相对 $N_t^2/M^2$ 很大且忽略对数因子，(39) 误差界中的主导项为 $\tilde{\mathcal{O}}(\|\mathbf{C}(\mathbf{x}_i)\|_2(\sqrt{N_tR^2/(|\mathcal{T}_i|M^2)}+N_tR/(|\mathcal{T}_i|M)))$，其中记号 $\tilde{\mathcal{O}}(n)$ 表示函数 $n$ 的渐近增长率并抑制对对数因子的依赖。因此，增加观测样本数会反向减小误差项，积累足够样本至关重要。第二，(39) 的上界随 $M$ 反比下降，因此增大 $M$ 可降低重构误差。此外，真实信道协方差的秩凸显了在具有丰富多径效应的 NLOS 环境中估计信道协方差的难度。相反，在 $R$ 很小的 LOS 环境中，重构精度自然提高，所需导频观测更少（见表 IV）。

### C. 无线电地图构建的迭代框架

综上，无线电地图构建框架如下。我们从稀疏 CSI 测量序列开始，应用 Viterbi 算法求解用户轨迹发现问题 (34)。基于所得用户位置估计，把稀疏 CSI 测量分配到相应网格单元。随后，采用 (37) 定义的无偏估计量 $\hat{\mathbf{C}}(\mathbf{x}_i)$ 重构每个网格单元的信道协方差 $\mathbf{C}(\mathbf{x}_i)$。该过程得到无线电地图 $\mathcal{M}$，再用其进行第二轮轨迹发现。如此重复，直到两次迭代之间估计用户位置的变化低于预设阈值 $\epsilon$，此时认为无线电地图 $\mathcal{M}$ 定稿。注意，轨迹发现问题 (34) 需要初始化信道协方差 $\mathbf{C}(\mathbf{p}_t)$ 以计算 $p(\mathbf{y}_t|\mathbf{p}_t)$。由于 $p(\mathbf{y}_t|\mathbf{p}_t)$ 只用于捕获用户位置的相对关系，可以简单地为每个离散网格单元初始化相同的信道协方差矩阵。技术细节见算法 2。

无线电地图构建的迭代框架随轨迹与协方差估计逐步精化而自然收敛。每次迭代中，更新后的轨迹有助于把 CSI 测量分配到网格单元，提高信道协方差矩阵精度；这些精化后的协方差又在下一次迭代中帮助发现更精确的轨迹。当估计用户位置的变化减小时，该反馈回路趋于稳定，最终满足预设阈值 $\epsilon$。虽然形式化收敛证明超出本文讨论，第 V 节的数值结果证实了该框架的实际收敛性（见图 8）。

> **算法 2　无线电地图构建**
> **输入：** 稀疏 CSI 测量 $\mathbf{Y}_T$、粗位置 $\tilde{\mathbf{P}}_T$、噪声方差 $\sigma_n^2$，以及阈值 $\epsilon$。
> 1) 在迭代 $l=0$ 时初始化 $\mathcal{M}^{(l)}=\{(\mathbf{x},\mathbf{I}):\mathbf{x}\in\mathcal{X}\}$ 与 $\hat{\mathbf{P}}_T^{(l)}=\tilde{\mathbf{P}}_T$。
> 2) 重复以下过程，直到 $\frac1T\sum_{t=1}^T\|\mathbf{p}_t^{(l)}-\mathbf{p}_t^{(l-1)}\|_2<\epsilon$：
> 　a) 置 $l\leftarrow l+1$。
> 　b) 通过求解问题 (34) 估计用户轨迹 $\hat{\mathbf{P}}_T^{(l)}=\{\hat{\mathbf{p}}_1^{(l)},\hat{\mathbf{p}}_2^{(l)},\dots,\hat{\mathbf{p}}_T^{(l)}\}$。
> 　c) 用 $\mathbf{Y}_T$、$\hat{\mathbf{P}}_T^{(l)}$ 与 (37) 估计信道协方差 $\hat{\mathbf{C}}^{(l)}(\mathbf{x}_i)$，并构建无线电地图 $\hat{\mathcal{M}}^{(l)}=\{(\mathbf{x},\hat{\mathbf{C}}^{(l)}(\mathbf{x})):\mathbf{x}\in\mathcal{X}\}$。
> 3) 输出 $\hat{\mathcal{M}}^{(l)}$ 与 $\hat{\mathbf{P}}_T^{(l)}$。

## V. 数值结果

本节在真实城市地图与 3D 射线追踪 MIMO 信道数据集上给出实验结果。

### A. 环境设置与场景

实验在由 Wireless InSite [33] 生成的 MIMO CSI 数据库上进行，该软件提供用于站点特定无线电波传播分析的 3D 射线追踪。测试的城市拓扑是美国旧金山一块 710 米 × 740 米的区域。如图 4(a) 所示，7 个 BS 部署在一些建筑顶部。每个 BS 的 MIMO 天线由 $N_t=64$ 个天线阵组成，如图 4(b) 所示。通过沿地图中的道路模拟随机行走，建立无线电数据库，包含 19,331 个用户位置与 $19{,}331\times7$ 个 MIMO 信道。

被测试的用户轨迹沿道路随机生成。第 $q$ 个 BS 在位置 $\mathbf{p}_t$ 处的测量 $\mathbf{y}_t^{(q)}$ 用 (5) 生成，其中噪声方差 $\sigma_n^2$ 由信道的平均功率与给定 SNR 生成，即 $\sigma_n^2=\mathbb{E}\{\|\mathbf{h}_t^{(q)}\|_2^2\}/10^{\mathrm{SNR}/10}$。粗用户位置 $\tilde{\mathbf{p}}_t$ 通过在真实位置 $\mathbf{p}_t$ 上加高斯随机偏移 $\mathcal{N}(0,900)$ 生成。无线电地图网格分辨率为 5 米，用户以 10 米/秒移动，每 10 毫秒采样一次观测。算法 2 中位置变化阈值 $\epsilon$ 设为 0.5 米。对所提方案，$\mathbf{y}_t^{(q)}$ 的维数 $M$ 设为 1。

> **图 4（原文 Fig. 4）：** (a) 含 7 个 BS 的仿真环境；(b) 由 32 个双极化偶极子天线阵组成的 MIMO 天线（$N_t=64$）。

注意本实验设置中不需要考虑多普勒频移。这是因为所提方案中 CSI 估计的主要目的是在 BS 实现 MIMO 波束成形。具体地，它旨在找到使信号强度 $|\mathbf{b}^H\mathbf{h}\mathrm{e}^{-\mathrm{j}\theta}|$ 最大的波束成形向量 $\mathbf{b}$，其中多普勒效应引起的相位偏移 $\theta$ 不影响信号强度。在波束成形数据传输期间，仍需额外导频观测来补偿相位偏移 $\theta$。然而这一方面超出本文范围，本文聚焦于降低 CSI 跟踪的导频开销，以在移动场景中实现有效波束成形。

### B. 基线方案

以下基线方案与所提 CSI 跟踪方案比较。

- **Genius 辅助 CSI 估计：** 该方案在已知用户位置与完美无线电地图下执行所提嵌入无线电地图的 CSI 跟踪算法。
- **基于单次测量的 CAM 辅助 CSI 估计 [20]：** 该方案构建 CAM，把位置映射到已知角度上的路径增益幅度。CAM 作为定位指纹。基于 CAM 估计的 AOD 设计 $M=N_t/2$ 个波束向量用于信道感知，并用最小二乘（LS）方法进行信道估计。
- **基于 AR 的 CSI 预测 [8]：** 该方法基于 Yule–Walker 方程估计信道 AR 系数，并用过去 10 个信道估计来估计信道 $\mathbf{h}_t$。初始信道估计使用随机生成的 $\mathbf{A}_t\in\mathbb{C}^{N_t\times N_t}$ 与 LS 方法。
- **基于 LSTM 的 CSI 预测 [10]：** 该方法采用循环神经网络（RNN），用过去 10 个估计信道预测 $\mathbf{h}_t$。其他设置与基于 AR 的方法相同。
- **基于 KF 的 CSI 跟踪 [27]：** 该方案用 $M=1$ 的 KF 进行 CSI 跟踪，不使用无线电地图。
- **基于 LS 的 CSI 估计：** LS 估计为 $\hat{\mathbf{h}}=\mathbf{A}_t^\dagger\mathbf{y}$。注意由于通常 $M<N_t$，需要对矩阵 $\mathbf{A}_t$ 求伪逆。感知矩阵 $\mathbf{A}_t$ 随机生成，$M=N_t/2$。

> **原文疑点：** 原文正文写作 "Genius-aided CSI estimation"、图 6/7/9/10 图例写作 "Genuis-aided"，两者均应为 "genie-aided"（理想辅助，即已知完美位置/先验）的拼写变体；本页按原文译作"Genius 辅助"以保持一致，特此注明。

评估所提算法使用以下指标：1) **定位误差：** 给定真实用户位置 $\mathbf{p}_t$ 与估计用户位置 $\hat{\mathbf{p}}_t$，定位误差定义为 $\frac1T\sum_{t=1}^T\|\mathbf{p}_t-\hat{\mathbf{p}}_t\|_2$。2) **信道容量：** 采用最大比合并（MRC）方案，信道容量表示为 $f(\mathbf{b},\mathbf{h})=\log_2(1+|\mathbf{b}^H\mathbf{h}|^2/\sigma_n^2)$，其中 $\mathbf{h}$ 是真实 CSI，$\mathbf{b}=\hat{\mathbf{h}}/\|\hat{\mathbf{h}}\|_2$ 是波束成形向量，$\hat{\mathbf{h}}$ 是估计 CSI。3) **信道容量效率比：** 定义为用 $\hat{\mathbf{h}}$ 达到的最大容量相对于完美 CSI $\mathbf{h}$ 的比值。4) **信道协方差的归一化 $L_2$ 范数估计误差：** 定义为 $\frac{1}{|\mathcal{X}|}\sum_{\mathbf{x}\in\mathcal{X}}\|\hat{\mathbf{C}}(\mathbf{x})-\mathbf{C}(\mathbf{x})\|_2/\|\mathbf{C}(\mathbf{x})\|_2$。5) **信道协方差的归一化投影误差：** 定义为 $\|\mathbf{C}-\hat{\mathbf{C}}(\hat{\mathbf{C}}^H\hat{\mathbf{C}})^{-1}\hat{\mathbf{C}}^H\mathbf{C}\|_F/\|\mathbf{C}\|_F$，量化真实与估计信号子空间之间的失配。

### C. 无线电地图嵌入式 CSI 跟踪

我们首先评估所提嵌入无线电地图的 CSI 跟踪方案。每个 BS 的完美无线电地图 $\mathcal{M}$ 通过离散化感兴趣区域并用每个网格单元（中心为 $\mathbf{x}_i$）中的真实信道计算 $\mathbf{C}(\mathbf{x}_i)$ 构建。图 5 展示算法 1 的 CSI 与用户位置跟踪性能。具体地，图 5(a) 给出沿一条穿越 NLOS、LOS 与 NLOS 区域到 BS 7 的轨迹的信道容量。所提方案优于其他基线方案，在 NLOS–LOS 过渡期间保持平滑跟踪。图 5(b) 表明，对到 BS 1 的 LOS 轨迹，所提方案的信道容量效率比保持在 90% 以上。传统 KF 方案的跟踪性能因缺乏先验 CSI 统计而不稳定，而 CAM 辅助方案达到完美 CSI 容量的 78% 以上。图 5(c) 强调，对图 5(a) 中同一轨迹，定位误差保持在 26 米以下，其中 BS 1 在 LOS 条件下工作、BS 6 在 NLOS 条件下工作。此外，多个 BS 的存在有助于更稳定的性能与更低的定位误差，数值始终低于 14 米。对于多 BS 协作，每个 BS 独立地使用 (21) 计算位置分布，然后这些分布跨 BS 乘性结合形成联合后验；随后按 (22) 选择使该后验最大的位置 $\mathbf{p}_t\in\mathcal{X}$。

> **图 5（原文 Fig. 5）：** CSI 与用户位置跟踪性能。(a) 一条穿越 NLOS、LOS 与 NLOS 传播条件到 BS 7 的轨迹的信道容量；(b) 到 BS 1 的 LOS 轨迹的信道容量效率比；(c) 所提嵌入无线电地图的 CSI 跟踪方案对 (a) 中同一轨迹（对 BS 1 为 LOS、对 BS 6 为 NLOS）的定位误差。

图 6 给出 7 个 BS 服务用户时信道容量效率比随 SNR 的变化。这只是一个示例，用以说明多 BS 可实现的潜在性能增益。所提方案在 SNR 为 20 dB 时达到完美 CSI 容量的 97% 以上。此外，所提方案几乎达到 Genius 辅助方案的性能，后者假设完美用户位置。仅使用当前测量与 32 个导频观测（$M=32$）的单次 CAM 方案在 SNR 为 30 dB 时达到理想容量的约 87%。KF 方案在高 SNR 下表现良好，但在 SNR 为 10 dB 时只达到理想容量的约 36%。基于 AR 与 LSTM 的方法由于依赖高度精确的历史信道数据以及对平稳空间分布的严格假设而表现不佳。LS 估计器始终劣于其他基线，因为它未能利用空间与时间先验，仅依赖单次观测进行 CSI 估计。

> **图 6（原文 Fig. 6）：** 信道容量效率比随 SNR 的变化。

图 7 给出 30 dB SNR 下信道容量效率比随 BS 分组的变化。随机生成的用户轨迹对 BS 1 与 BS 2 为 LOS，对 BS 4 与 BS 6 为 NLOS。所提方案达到与 Genius 辅助方案相近的性能。尽管一些基线方案在 LOS 情形达到理想容量的 83% 以上，但由于复杂城市拓扑导致的高度复杂 CSI 分布，它们在 NLOS 情形性能显著退化。

> **图 7（原文 Fig. 7）：** 信道容量效率比随 BS 分组的变化。

表 I 给出所提 CSI 跟踪方案中自适应感知矩阵的影响。可以观察到，自适应感知带来额外性能增益，特别是在低 SNR 场景。例如，在到 BS 6 的 NLOS 条件下、SNR 为 10 dB 时，采用自适应 $\mathbf{A}_t$ 的所提方法达到 55% 的信道容量效率比，比采用随机 $\mathbf{A}_t$ 的同一方案提高 14%。此外，所提方案的两种变体（自适应 $\mathbf{A}_t$ 与随机 $\mathbf{A}_t$）在到 BS 1 的 LOS 条件下都达到理想容量的 91% 以上，证明所提嵌入无线电地图的 CSI 跟踪方案的稳健性，这得益于无线电地图提供的强空间先验。

> **表 I（原文 Table I）：** 所提 CSI 跟踪方案中，有无自适应感知时信道容量效率比随 SNR 的变化。

| SNR [dB] | 10 | 15 | 20 | 25 | 30 |
|---|---|---|---|---|---|
| **自适应感知**：BS 1 | 92% | 93% | 95% | 97% | 97% |
| **自适应感知**：BS 6 | 55% | 55% | 58% | 58% | 59% |
| **随机感知**：BS 1 | 91% | 93% | 95% | 96% | 97% |
| **随机感知**：BS 6 | 41% | 48% | 50% | 50% | 53% |

表 II 表明，只要在特定范围内（例如 $[0.1,0.7]$），信道模型 (4) 中的系数 $\gamma$ 对所提方案的 CSI 跟踪性能影响可忽略。此外，所提方案在 5 到 25 米/秒的用户速度范围内表现出稳定而稳健的性能。

> **表 II（原文 Table II）：** 跟踪性能随 $\gamma$（$\bar v=10$）与用户速度 $\bar v$（$\gamma=0.1$）的变化。

| 设置 | $\gamma=0.1$ | $\gamma=0.7$ | $\bar v=5$ | $\bar v=25$ |
|---|---|---|---|---|
| 信道容量效率比 | 98.0% | 97.9% | 98.7% | 97.7% |

此外，表 III 报告在与图 7 相同设置下 BS 1 的平均 CSI 估计时间。所提方案跟踪 BS 1 的 CSI 约需 0.27 ms，与 CAM 辅助方案相当，后者运行时间相近（0.27 ms），但信道容量效率比略低（83%）。相比之下，基于 KF 与基于 AR 的方案略快（分别约 0.19 ms 与 0.036 ms），但性能显著退化，容量效率比低 21% 以上。

> **表 III（原文 Table III）：** CSI 估计的平均运行时间 [毫秒]。

| 方案 | Genius 辅助 | 本文所提 | CAM | KF | AR | LSTM |
|---|---|---|---|---|---|---|
| 时间（ms） | 0.21 | 0.27 | 0.27 | 0.19 | 0.036 | 1.6 |

### D. 无线电地图构建

本小节我们以离线方式从稀疏无标签的导频观测序列为每个 BS 构建无线电地图。这是在部署前执行的一次性过程。图 8(a) 给出通过求解问题 (34) 得到的估计用户轨迹示例。尽管粗用户位置散布在数百米宽的区域，估计轨迹与真值吻合良好。数值结果表明，当 BS 1 服务用户时定位误差小于 6 米。图 8(b) 确认算法 2 的收敛性：随着迭代次数增加，定位误差保持稳定。

> **图 8（原文 Fig. 8）：** 用户定位与算法 2 的收敛性。(a) 估计的用户轨迹；(b) 平均定位误差。

表 IV 给出不同 $M$ 设置下信道协方差的归一化 $L_2$ 范数估计误差随测量数 $T_{\mathrm{total}}$ 的变化。这里采集了多个信道测量序列，每个序列含 350 个测量，$T_{\mathrm{total}}$ 表示所有序列的总测量数。如命题 5 所支持，较大的 $M$ 与 $T_{\mathrm{total}}$ 会降低归一化 $L_2$ 范数估计误差。可以观察到，当 $M$ 显著小于 $N_t$ 时（例如 $M=4$），需要 175,000 个测量才能达到 0.676 的估计误差，而当 $M=16$ 时只需少于 35,000 个测量即可达到更小的估计误差。此外，由于丰富的多径效应，为 NLOS 条件下的 BS 构建无线电地图比 LOS 条件下更具挑战性。

> **表 IV（原文 Table IV）：** 信道协方差的归一化 $L_2$ 范数估计误差随测量数 $T_{\mathrm{total}}$ 与维数 $M$ 的变化。

| $T_{\mathrm{total}}$ | 35,000 | 70,000 | 105,000 | 140,000 | 175,000 |
|---|---|---|---|---|---|
| $M=1$，BS 1（LOS） | 0.837 | 0.825 | 0.819 | 0.812 | 0.806 |
| $M=4$，BS 1（LOS） | 0.766 | 0.729 | 0.706 | 0.691 | 0.676 |
| $M=16$，BS 1（LOS） | 0.630 | 0.617 | 0.614 | 0.615 | 0.612 |
| $M=16$，BS 6（NLOS） | 0.781 | 0.762 | 0.755 | 0.748 | 0.742 |

表 V 进一步给出信道协方差的归一化投影误差随测量数 $T_{\mathrm{total}}$ 与维数 $M$ 的变化。结果表明，对 BS 1 与 BS 6，增加测量数或导频观测维数都持续降低归一化投影误差。然而，在 LOS 条件下工作的 BS 1 在测量充分时达到显著更低的归一化投影误差。具体地，BS 1 在 35,000 个测量时归一化投影误差为 0.211，在 280,000 个测量时为 0.052。相反，在 NLOS 条件下工作的 BS 6 即使有 280,000 个测量也只达到 0.190 的归一化投影误差。这些发现表明，由于丰富的多径效应，NLOS 条件下的无线电地图构建比 LOS 条件下更具挑战性。

> **表 V（原文 Table V）：** 信道协方差的归一化投影误差随测量数 $T_{\mathrm{total}}$ 与维数 $M$ 的变化。

| $T_{\mathrm{total}}$ | 35,000 | 70,000 | 105,000 | 210,000 | 280,000 |
|---|---|---|---|---|---|
| $M=1$，BS 1（LOS） | 0.227 | 0.227 | 0.203 | 0.139 | 0.131 |
| $M=4$，BS 1（LOS） | 0.235 | 0.207 | 0.199 | 0.131 | 0.131 |
| $M=16$，BS 1（LOS） | 0.211 | 0.131 | 0.092 | 0.064 | 0.052 |
| $M=16$，BS 6（NLOS） | 0.214 | 0.202 | 0.202 | 0.198 | 0.190 |

图 9 与图 10 分别展示基于用 $M=16$ 的 280,000 与 420,000 个 CSI 测量重构的无线电地图，在 LOS 条件下的 BS 1 与 NLOS 条件下的 BS 6 上的 CSI 跟踪性能。使用重构的无线电地图，所提 CSI 跟踪方案在每个时隙一个导频观测、总共 100 个导频观测时，对 BS 1 达到理想容量的 88% 以上；对 BS 6，所提方案在低 SNR 与高 SNR 场景都优于其他基线方案。

> **图 9（原文 Fig. 9）：** 到 BS 1 的 LOS 轨迹的信道容量效率比。

> **图 10（原文 Fig. 10）：** 到 BS 6 的 NLOS 轨迹的信道容量效率比。

此外，我们评估所提无线电地图的内存占用。无线电地图覆盖 740 m × 710 m 区域，网格分辨率 5 m，共 21,016 个网格。每个网格以双精度值存储其中心坐标，并以单精度存储 $64\times64$ 复协方差矩阵。理论存储需求约为 657 MB，实际未压缩大小约 659 MB。这表明所提方法的可行性：它在保持无线电地图所需精度的同时，内存大小合理。

## VI. 结论

本文研究大规模 MIMO 系统中的 CSI 跟踪挑战，特别是在缺乏平稳 CSI 统计与精确位置信息的情况下。通过将无线电地图与自适应 SKF 框架结合，我们在没有位置标签的情况下，利用极其稀疏的导频观测序列跟踪 CSI 与位置。对于无线电地图构建，借助 HMM 实现位置序列与信道协方差矩阵的联合估计，并给出无偏信道协方差估计量及其误差分析。数值结果表明，所提嵌入无线电地图的 CSI 跟踪方案在 LOS 下、20 dB SNR 时以减少的导频观测达到完美 CSI 容量的 97% 以上，而传统 KF 只能达到 76%。此外，所提算法在我们框架中把无线电地图构建的定位误差从先验的 30 米降到 6 米。

## 图注与表注索引

本页图 1–10 的中文图注与表 I–V 的表注均按原文出现位置内联在正文中（图 1–3 见第 II–III 节，图 4–10 见第 V 节；表 I–III 见第 V-C 节，表 IV–V 见第 V-D 节），此处不重复罗列。原文为双栏期刊排版，部分图（如 Fig. 4–Fig. 10）在正文中以浮动方式跨栏放置，本页按逻辑出现顺序内联。

## 参考文献（英文原书目）

- [1] H. Guo and V. K. N. Lau, "Bayesian hierarchical sparse autoencoder for massive MIMO CSI feedback," IEEE Trans. Signal Process., vol. 72, pp. 3213–3227, 2024.
- [2] Z. He, H. Shen, W. Xu, Y. C. Eldar, and X. You, "MSE-based training and transmission optimization for MIMO ISAC systems," IEEE Trans. Signal Process., vol. 72, pp. 3104–3121, 2024.
- [3] L. V. Nguyen, A. L. Swindlehurst, and D. H. N. Nguyen, "Variational bayes for joint channel estimation and data detection in few-bit massive MIMO systems," IEEE Trans. Signal Process., vol. 72, pp. 3408–3423, 2024.
- [4] A. Mehrotra, S. Srivastava, S. Asifa, A. K. Jagannatham, and L. Hanzo, "Online Bayesian learning-aided sparse CSI estimation in OTFS modulated MIMO systems for ultra-high-Doppler scenarios," IEEE Trans. on Commun., vol. 72, no. 4, pp. 2182–2200, 2024.
- [5] M. Ke, Z. Gao, Y. Wu, X. Gao, and R. Schober, "Compressive sensing-based adaptive active user detection and channel estimation: Massive access meets massive MIMO," IEEE Trans. Signal Process., vol. 68, pp. 764–779, 2020.
- [6] Y. Wan, G. Liu, A. Liu, and M.-J. Zhao, "Robust multi-user channel tracking scheme for 5G new radio," IEEE Trans. on Wireless Commun., vol. 23, no. 6, pp. 5878–5894, 2024.
- [7] D. R. Brown, R. Wang, and S. Dasgupta, "Channel state tracking for large-scale distributed MIMO communication systems," IEEE Trans. Signal Process., vol. 63, no. 10, pp. 2559–2571, 2015.
- [8] J. Vinogradova, G. Fodor, and P. Hammarberg, "On estimating the autoregressive coefficients of time-varying fading channels," in Proc. IEEE Veh. Technol. Conf. (VTC), pp. 1–5, Helsinki, Finland, 2022.
- [9] Y. Zhao, X. Zhang, X. Gao, K. Yang, Z. Xiong, and Z. Han, "LSTM-based predictive mmwave beam tracking via sub-6 GHz channels for V2I communications," IEEE Trans. on Commun., 2024, early access.
- [10] T. Peng, R. Zhang, X. Cheng, and L. Yang, "LSTM-based channel prediction for secure massive MIMO communications under imperfect CSI," in Proc. IEEE Int. Conf. Commun., pp. 1–6, Dublin, Ireland, 2020.
- [11] B. Zhou, X. Yang, S. Ma, F. Gao, and G. Yang, "Pay less but get more: A dual-attention-based channel estimation network for massive MIMO systems with low-density pilots," IEEE Trans. on Wireless Commun., vol. 23, no. 6, pp. 6061–6076, 2024.
- [12] J. Mirzaei, S. Shahbaz Panahi, R. S. Adve, and N. K. M. Gopal, "Deep generative models for downlink channel estimation in FDD massive MIMO systems," IEEE Trans. Signal Process., vol. 70, pp. 2000–2014, 2022.
- [13] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1478–1519, 2024.
- [14] Y. Zheng, M. Jia, and J. Chen, "Discovering CSI evolution using radio map for massive MIMO channel estimation," in Proc. IEEE Int. Conf. Commun., pp. 5117–5122, 2024.
- [15] D. Wu, Y. Zeng, S. Jin, and R. Zhang, "Environment-aware hybrid beamforming by leveraging channel knowledge map," IEEE Trans. on Wireless Commun., vol. 23, no. 5, pp. 4990–5005, 2024.
- [16] H. Chung and S. Kim, "Location-aware beam training and multi-dimensional ANM-based channel estimation for RIS-aided mmwave systems," IEEE Trans. on Wireless Commun., vol. 23, no. 1, pp. 652–666, 2024.
- [17] Z. Yu, X. Hu, C. Liu, M. Peng, and C. Zhong, "Location sensing and beamforming design for IRS-enabled multi-user ISAC systems," IEEE Trans. Signal Process., vol. 70, pp. 5178–5193, 2022.
- [18] J. Du, Y. Cheng, L. Jin, S. Li, and F. Gao, "Nested tensor-based integrated sensing and communication in RIS-assisted thz MIMO systems," IEEE Trans. Signal Process., vol. 72, pp. 1141–1157, 2024.
- [19] Z. Dai, D. Wu, Z. Dong, K. Li, D. Ding, S. Wang, and Y. Zeng, "Prototyping and experimental results for environment-aware millimeter wave beam alignment via channel knowledge map," IEEE Trans. Veh. Technol., vol. 73, no. 11, pp. 16 805–16 816, 2024.
- [20] D. Wu and Y. Zeng, "Environment-aware coordinated multi-point mmwave beam alignment via channel knowledge map," in Proc. IEEE Int. Conf. Commun. Workshop, pp. 1044–1049, Rome, Italy, 2023.
- [21] M. Stahlke, G. Yammine, T. Feigl, B. M. Eskofier, and C. Mutschler, "Velocity-based channel charting with spatial distribution map matching," IEEE J. Indoor Seamless Position Navig., vol. 2, pp. 230–239, 2024.
- [22] P. Ferrand, M. Guillaud, C. Studer, and O. Tirkkonen, "Wireless channel charting: Theory, practice, and applications," IEEE Commun. Mag., vol. 61, no. 6, pp. 124–130, 2023.
- [23] G. Zhou, C. Pan, H. Ren, P. Popovski, and A. L. Swindlehurst, "Channel estimation for RIS-aided multiuser millimeter-wave systems," IEEE Trans. Signal Process., vol. 70, pp. 1478–1492, 2022.
- [24] B. Liang and Z. Haas, "Predictive distance-based mobility management for PCS networks," in Proc. IEEE INFOCOM, vol. 3, 1999, pp. 1377–1384.
- [25] P. Sadeghi, P. Rapajic, R. Kennedy, and T. Abhayapala, "Autoregressive time-varying flat-fading channels: Model order and information rate bounds," in Proc. IEEE Int. Symp. Inf. Theory, 2006, pp. 1061–1065.
- [26] J. Wang, Q. Zhu, Z. Lin, J. Chen, G. Ding, Q. Wu, G. Gu, and Q. Gao, "Sparse bayesian learning-based hierarchical construction for 3D radio environment maps incorporating channel shadowing," IEEE Trans. on Wireless Commun., vol. 23, no. 10, pp. 14 560–14 574, 2024.
- [27] G. Welch and G. Bishop, An Introduction to the Kalman Filter. Chapel Hill, NC, USA: University of North Carolina at Chapel Hill, 1995.
- [28] T. M. and J. A. Thomas, Elements of Information Theory (Wiley Series in Telecommunications and Signal Processing). USA: Wiley-Interscience, 2006.
- [29] Z. Xing and J. Chen, "Constructing indoor region-based radio map without location labels," IEEE Trans. Signal Process., vol. 72, pp. 2512–2526, 2024.
- [30] K. Magowe, A. Giorgetti, S. Kandeepan, and X. Yu, "Accurate analysis of weighted centroid localization," IEEE Trans. on Cognitive Commun. and Networking, vol. 5, no. 1, pp. 153–164, 2018.
- [31] W. H. Press, S. A. Teukolsky, W. T. Vetterling, and B. P. Flannery, Numerical Recipes 3rd Edition: The Art of Scientific Computing, 3rd ed. USA: Cambridge University Press, 2007.
- [32] M. Azizyan, A. Krishnamurthy, and A. Singh, "Extreme compressive sampling for covariance estimation," IEEE Trans. Inf. Theory, vol. 64, no. 12, pp. 7613–7635, 2018.
- [33] Remcom, Inc., "Wireless InSite," 2025, [Online]. Available: https://www.remcom.com/wireless-insite-em-propagation-software/.

## 附录 A–D

### A. 命题 1 的证明

根据贝叶斯定理，$p(\mathcal{Y}_T,\mathcal{H}_T)$ 推导为

$$
\begin{aligned}
p(\mathcal{Y}_T,\mathcal{H}_T)&=p(\mathbf{y}_T|\mathcal{Y}_{T-1},\mathcal{H}_T)p(\mathcal{Y}_{T-1},\mathcal{H}_T)\\
&=p(\mathbf{y}_T|\mathbf{h}_T)\mathbb{P}(\mathbf{h}_T|\mathcal{Y}_{T-1},\mathcal{H}_{T-1})p(\mathcal{Y}_{T-1},\mathcal{H}_{T-1}) \tag{40}\\
&=p(\mathbf{y}_T|\mathbf{h}_T)\mathbb{P}(\mathbf{h}_T|\mathbf{h}_{T-1},\mathbf{p}_T)p(\mathcal{Y}_{T-1},\mathcal{H}_{T-1}) \tag{41}\\
&=\prod_{t=1}^Tp(\mathbf{y}_t|\mathbf{h}_t)\times\prod_{t=2}^Tp(\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{p}_t)p(\mathbf{h}_1), \tag{42}
\end{aligned}
$$

其中式 (40) 与 (41) 成立是因为 $\mathbf{y}_T$ 依赖 $\mathbf{h}_T$，而 $\mathbf{h}_T$ 依赖 $\mathbf{h}_{T-1}$ 与 $\mathbf{p}_T$；式 (42) 通过以与 $p(\mathcal{Y}_T,\mathcal{H}_T)$ 相同的方式递归分解 $p(\mathcal{Y}_{T-1},\mathcal{H}_{T-1})$ 得到。于是 $p(\mathcal{Y}_T|\mathcal{H}_T)$ 推导为

$$
p(\mathcal{Y}_T|\mathcal{H}_T)=\frac{p(\mathcal{Y}_T,\mathcal{H}_T)}{p(\mathcal{H}_T)}=\prod_{t=1}^Tp(\mathbf{y}_t|\mathbf{h}_t). \tag{43}
$$

与 (42) 类似，$p(\mathcal{H}_T,\mathcal{P}_T)$ 推导为

$$
p(\mathcal{H}_T,\mathcal{P}_T)=\prod_{t=2}^Tp(\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{p}_t)\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})p(\mathbf{h}_1)\mathbb{P}(\mathbf{p}_1). \tag{44}
$$

基于 (43) 与 (44)，$p(\mathcal{Y}_T,\mathcal{P}_T,\mathcal{H}_T)$ 可分解为

$$
\begin{aligned}
p(\mathcal{Y}_T,\mathcal{P}_T,\mathcal{H}_T)&=p(\mathcal{Y}_T|\mathcal{P}_T,\mathcal{H}_T)p(\mathcal{H}_T,\mathcal{P}_T)=p(\mathcal{Y}_T|\mathcal{H}_T)p(\mathcal{H}_T,\mathcal{P}_T) \tag{45}\\
&=\prod_{t=1}^Tp(\mathbf{y}_t|\mathbf{h}_t)\prod_{t=2}^Tp(\mathbf{h}_t|\mathbf{h}_{t-1},\mathbf{p}_t)p(\mathbf{h}_1)\times\prod_{t=2}^T\mathbb{P}(\mathbf{p}_t|\mathbf{p}_{t-1})\mathbb{P}(\mathbf{p}_1), \tag{46}
\end{aligned}
$$

其中 (45) 成立是因为给定 $\mathbf{h}_t$ 时 $\mathbf{y}_t$ 与 $\mathbf{p}_t$ 独立。

### B. 命题 2 的证明

误差传播过程可通过验证 $\mathbf{Q}_t\mathbf{Q}_t^{-1}=\mathbf{I}$ 来证明，其中 $\mathbf{Q}_t$ 见 (18)，$\mathbf{Q}_t^{-1}$ 见 (27)。

首先，把 (17) 中的最优 $\mathbf{K}_t$ 代入 (18)，有

$$
\mathbf{Q}_t=\mathbf{Q}_{t|t-1}-\mathbf{Q}_{t|t-1}\mathbf{A}_t^H\left(\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H+\sigma_n^2\mathbf{I}\right)^{-1}\mathbf{A}_t\mathbf{Q}_{t|t-1}. \tag{47}
$$

其次，$\mathbf{Q}_t\mathbf{Q}_t^{-1}$ 推导为

$$
\begin{aligned}
\mathbf{Q}_t\mathbf{Q}_t^{-1}={}&\big(\mathbf{Q}_{t|t-1}-\mathbf{Q}_{t|t-1}\mathbf{A}_t^H(\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H+\sigma_n^2\mathbf{I})^{-1}\times\mathbf{A}_t\mathbf{Q}_{t|t-1}\big)\big(\mathbf{Q}_{t|t-1}^{-1}+\mathbf{A}_t^H(\sigma_n^2\mathbf{I})^{-1}\mathbf{A}_t\big)\\
={}&\mathbf{I}-\mathbf{Q}_{t|t-1}\mathbf{A}_t^H\Big[(\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H+\sigma_n^2\mathbf{I})^{-1}-(\sigma_n^2\mathbf{I})^{-1}\\
&\quad+(\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H+\sigma_n^2\mathbf{I})^{-1}\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H(\sigma_n^2\mathbf{I})^{-1}\Big]\mathbf{A}_t\\
={}&\mathbf{I}-\mathbf{Q}_{t|t-1}\mathbf{A}_t^H\left[(\sigma_n^2\mathbf{I})^{-1}-(\sigma_n^2\mathbf{I})^{-1}\right]\mathbf{A}_t=\mathbf{I}.
\end{aligned}
$$

因此，(27) 中的 $\mathbf{Q}_t^{-1}$ 是 $\mathbf{Q}_t$ 的逆。

### C. 命题 3 的证明

利用 $\mathbf{Q}_{t|t-1}$ 的特征值分解（EVD），有

$$
\mathbf{Q}_{t|t-1}=\mathbf{W}_{t-1}\boldsymbol{\Lambda}_{t-1}\mathbf{W}_{t-1}^H, \tag{48}
$$

其中 $\boldsymbol{\Lambda}_{t-1}=\mathrm{diag}\{\lambda_{t-1,1},\dots,\lambda_{t-1,N_t}\}$ 是包含 $\mathbf{Q}_{t|t-1}$ 特征值（按降序排列）的对角矩阵，$\mathbf{W}_{t-1}=[\mathbf{w}_{t-1,1},\mathbf{w}_{t-1,2},\dots,\mathbf{w}_{t-1,N_t}]$ 是以 $\mathbf{Q}_{t|t-1}$ 的正交特征向量为列的酉矩阵。

定义 $\mathbf{B}_t\triangleq\mathbf{A}_t\mathbf{W}_{t-1}\in\mathbb{C}^{M\times N_t}$。基于 (48)，$|\mathbf{I}+\sigma_n^{-2}\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H|$ 推导为

$$
\begin{aligned}
\left|\mathbf{I}+\sigma_n^{-2}\mathbf{A}_t\mathbf{Q}_{t|t-1}\mathbf{A}_t^H\right|&=\left|\mathbf{I}+\sigma_n^{-2}\mathbf{A}_t\mathbf{W}_{t-1}\boldsymbol{\Lambda}_{t-1}\mathbf{W}_{t-1}^H\mathbf{A}_t^H\right|\\
&=\left|\mathbf{I}+\sigma_n^{-2}\mathbf{B}_t\boldsymbol{\Lambda}_{t-1}\mathbf{B}_t^H\right|\\
&=\left|\mathbf{B}_t\left(\mathbf{I}+\sigma_n^{-2}\boldsymbol{\Lambda}_{t-1}\right)\mathbf{B}_t^H\right|. \tag{49}
\end{aligned}
$$

矩阵 $\mathbf{B}_t(\mathbf{I}+\sigma_n^{-2}\boldsymbol{\Lambda}_{t-1})\mathbf{B}_t^H$ 是对角矩阵 $\mathbf{I}+\sigma_n^{-2}\boldsymbol{\Lambda}_{t-1}$ 在 $\mathbf{B}_t$ 所定义子空间上的投影，其中 $\mathbf{B}_t\mathbf{B}_t^H=\mathbf{A}_t\mathbf{W}_{t-1}(\mathbf{A}_t\mathbf{W}_{t-1})^H=\mathbf{I}$。为使 $|\mathbf{B}_t(\mathbf{I}+\sigma_n^{-2}\boldsymbol{\Lambda}_{t-1})\mathbf{B}_t^H|$ 最大，$\mathbf{B}_t$ 应选取 $\mathbf{I}+\sigma_n^{-2}\boldsymbol{\Lambda}_{t-1}$ 的前 $M$ 个特征值。

因此，$|\mathbf{B}_t(\mathbf{I}+\sigma_n^{-2}\boldsymbol{\Lambda}_{t-1})\mathbf{B}_t^H|$ 达到最大值 $\prod_{i=1}^M(1+\sigma_n^2\lambda_{t-1,i})$，其中 $i=1,2,\dots,M$ 时 $\lambda_{t-1,i}$ 是 $\mathbf{Q}_{t|t-1}$ 的前 $M$ 个特征值。

> **原文疑点：** 上述乘积式在 PDF 中印作 $\prod_{i=1}^M(1+\sigma_n^2\lambda_{t-1,i})$，但按前式 $|\mathbf{B}_t(\mathbf{I}+\sigma_n^{-2}\boldsymbol{\Lambda}_{t-1})\mathbf{B}_t^H|$ 应为 $\prod_{i=1}^M(1+\sigma_n^{-2}\lambda_{t-1,i})$；此处按原文转写并加注，疑为原稿笔误。

此时，$\mathbf{A}_t$ 由 $\mathbf{A}_t=[\mathbf{w}_{t-1,1},\mathbf{w}_{t-1,2},\dots,\mathbf{w}_{t-1,M}]^H$ 给出，使得 $\mathbf{B}_t=\mathbf{A}_t\mathbf{W}_{t-1}$ 是一个对角矩阵，其前 $M$ 个对角元素为 1，其余元素为 0。

### D. 命题 4 的证明

只需考虑 $\mathcal{T}_i=\{1\}$ 与 $t=1$，因为结果可由每个离散区域上期望的线性性推出。令 $\mathbf{h}=\mathbf{h}_1$、$\boldsymbol{\Phi}=\boldsymbol{\Phi}_1$、$\mathbf{n}=\mathbf{n}_1$、$\mathbf{A}=\mathbf{A}_1$。

首先，$\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)|\mathbf{h}\}$ 表示为

$$
\begin{aligned}
\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)|\mathbf{h}\}&=\frac{N_t^2}{M^2}\mathbb{E}\{(\boldsymbol{\Phi}\mathbf{h}+\mathbf{A}^H\mathbf{n})(\boldsymbol{\Phi}\mathbf{h}+\mathbf{A}^H\mathbf{n})^H|\mathbf{h}\}\\
&=\frac{N_t^2}{M^2}\left(\mathbb{E}\{\boldsymbol{\Phi}\mathbf{h}(\boldsymbol{\Phi}\mathbf{h})^H|\mathbf{h}\}+\mathbb{E}\{\mathbf{A}^H\mathbf{n}\mathbf{n}^H\mathbf{A}\}\right),
\end{aligned}
$$

其中交叉项因信号与噪声独立而被去掉。

其次，采用文献 [32, Fact 1] 的如下事实。

**事实 1.** 若 $\mathbf{x}\in\mathbb{C}^{N_t}$ 且 $\boldsymbol{\Phi}\in\mathbb{C}^{N_t\times N_t}$ 是均匀分布的秩 $m$ 正交投影，则

$$
\boldsymbol{\Phi}\mathbf{x}\overset{d}{=}\omega\mathbf{x}+\sqrt{\omega-\omega^2}\|\mathbf{x}\|\mathbf{W}\boldsymbol{\alpha},
$$

其中 $\omega\sim\mathrm{Beta}(\frac{M}{2},\frac{N_t-M}{2})$，$\boldsymbol{\alpha}\in\mathbb{C}^{N_t-1}$ 均匀分布于单位球上且与 $\omega$ 独立，$\mathbf{W}\in\mathbb{C}^{N_t\times(N_t-1)}$ 是与 $\mathbf{x}$ 正交的子空间的正交基，即 $\mathbf{x}^H\mathbf{W}=\mathbf{0}$。

基于事实 1 与 Beta 分布的期望，$\mathbb{E}\{\boldsymbol{\Phi}\mathbf{h}(\boldsymbol{\Phi}\mathbf{h})^H|\mathbf{h}\}$ 可导出并简化为

$$
\mathbb{E}\{\boldsymbol{\Phi}\mathbf{h}(\boldsymbol{\Phi}\mathbf{h})^H|\mathbf{h}\}=\frac{M(MN_t+N_t-2)\mathbf{h}\mathbf{h}^H}{N_t(N_t+2)(N_t-1)}+\frac{M(N_t-M)\mathrm{tr}(\mathbf{h}\mathbf{h}^H)\mathbf{I}}{N_t(N_t+2)(N_t-1)}. \tag{50}
$$

第三，由于 $\mathbf{n}\sim\mathcal{CN}(\mathbf{0},\sigma_n^2\mathbf{I})$ 且 $\mathbf{n}$ 与 $\mathbf{A}$ 独立，期望 $\mathbb{E}\{\mathbf{A}^H\mathbf{n}\mathbf{n}^H\mathbf{A}\}$ 导出为

$$
\mathbb{E}\{\mathbf{A}^H\mathbf{n}\mathbf{n}^H\mathbf{A}\}=\mathbf{A}^H\mathbb{E}\{\mathbf{n}\mathbf{n}^H\}\mathbf{A}=\sigma_n^2\mathbf{A}^H\mathbf{A}. \tag{51}
$$

第四，对 $\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)|\mathbf{h}\}$ 关于 $\mathbf{h}$ 取期望，并把 (50) 与 (51) 按 $N_t^2/M^2$ 重缩放，$\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)\}$ 导出为

$$
\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)\}=\frac{N_t(MN_t+N_t-2)}{M(N_t+2)(N_t-1)}\mathbf{C}(\mathbf{x}_i)+\frac{N_t(N_t-M)\mathrm{tr}(\mathbf{C}(\mathbf{x}_i))\mathbf{I}}{M(N_t+2)(N_t-1)}+\frac{N_t^2\sigma_n^2}{M^2|\mathcal{T}_i|}\sum_{t\in\mathcal{T}_i}\mathbf{A}_t^H\mathbf{A}_t. \tag{52}
$$

第五，对 (52) 两边取迹运算并提取项 $\mathrm{tr}(\mathbf{C}(\mathbf{x}_i))$，有

$$
\mathrm{tr}(\mathbf{C}(\mathbf{x}_i))=\frac{M}{N_t}\mathrm{tr}(\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)\})-\frac{N_t\sigma_n^2}{M|\mathcal{T}_i|}\sum_{t\in\mathcal{T}_i}\mathrm{tr}(\mathbf{A}_t^H\mathbf{A}_t).
$$

把上式中的 $\mathrm{tr}(\mathbf{C}(\mathbf{x}_i))$ 代入 (52)，可得

$$
\begin{aligned}
\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)\}={}&\frac{N_t(MN_t+N_t-2)}{M(N_t+2)(N_t-1)}\mathbf{C}(\mathbf{x}_i)+\frac{N_t-M}{(N_t+2)(N_t-1)}\mathrm{tr}(\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)\})\mathbf{I}\\
&-\frac{N_t^2(N_t-M)\sigma_n^2}{M^2(N_t+2)(N_t-1)|\mathcal{T}_i|}\sum_{t\in\mathcal{T}_i}\mathrm{tr}(\mathbf{A}_t^H\mathbf{A}_t)\mathbf{I}+\frac{N_t^2\sigma_n^2}{M^2|\mathcal{T}_i|}\sum_{t\in\mathcal{T}_i}\mathbf{A}_t^H\mathbf{A}_t. \tag{53}
\end{aligned}
$$

最后，$\mathbf{C}(\mathbf{x}_i)$ 可由 (53) 提取为

$$
\mathbf{C}(\mathbf{x}_i)=\frac{M\left(\bar N_t\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)\}-(N_t-M)\mathrm{tr}(\mathbb{E}\{\hat{\boldsymbol{\Omega}}_y(\mathbf{x}_i)\})\mathbf{I}\right)}{N_t(N_tM+N_t-2)}-\frac{\sigma_n^2\left(M\bar N_t\boldsymbol{\Omega}_A(\mathbf{x}_i)-N_t(N_t-M)\mathrm{tr}(\boldsymbol{\Omega}_A(\mathbf{x}_i))\mathbf{I}\right)}{M(N_tM+N_t-2)}, \tag{54}
$$

其中 $\bar N_t\triangleq N_t^2+N_t-2$，$\boldsymbol{\Omega}_A(\mathbf{x}_i)\triangleq\frac{1}{|\mathcal{T}_i|}\sum_{t\in\mathcal{T}_i}\mathbf{A}_t^H\mathbf{A}_t$。由于迹是线性算子，我们立即看出 (37) 中的估计量 $\hat{\mathbf{C}}(\mathbf{x}_i)$ 是无偏的，即 $\mathbb{E}\{\hat{\mathbf{C}}(\mathbf{x}_i)\}=\mathbf{C}(\mathbf{x}_i)$。

**本页范围与校对状态：** 本页覆盖 arXiv:2410.05803v5 全文（原文 16 页）的中文译稿：摘要、关键词、第 I–VI 节正文与编号小节、第 II–IV 节的命题 1–5 与算法 1–2、图 1–10 的全部中文图注、表 I–V 的逐格转写、附录 A–D 的完整证明（式 (40)–(54) 与事实 1）、参考文献 33 条英文原条目（按原编号），以及原文首页的发表与资助脚注。公式与表格已对照 PDF 渲染页核对：式 (1)–(54) 逐式核对，表 I–V 用 PDF 表格网格抽取后转写。已加注三处原文疑点：式 (38) 分母印作 $N_t(N_tM+N_2-2)$（应为 $N_t(N_tM+N_t-2)$）；附录 C 中乘积式 $\prod(1+\sigma_n^2\lambda_{t-1,i})$ 与前一式 $|\mathbf{B}_t(\mathbf{I}+\sigma_n^{-2}\boldsymbol{\Lambda}_{t-1})\mathbf{B}_t^H|$ 不一致（疑应为 $\sigma_n^{-2}$）；正文 "Genius-aided" 与图例 "Genuis-aided" 应为 "genie-aided" 的拼写变体。本页不上传原文图片，图内曲线与图例数值不作数字化估算。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
