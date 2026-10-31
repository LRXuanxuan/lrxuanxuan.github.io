---
layout: page
title: "通过预测重传改进 5G AI-RAN MCS 选择｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-09324-improving-5g-ai-ran-mcs-selection-by-predicting-retransmissions/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/421cfd8b602b8e9f/) · [原文 arXiv](https://arxiv.org/abs/2609.09324) · [全部目录](/papers/catalog/)

# 通过预测重传改进 5G AI-RAN 的 MCS 选择

**原题：** Improving 5G AI-RAN MCS Selection by Predicting Retransmissions  
**作者：** Tamerlan Aghayev\*、Maxime Elkael\*、Michele Polese\*、Reshma Prasad\*、Salvatore D'Oro\*、Yunseong Lee†、Koichiro Furueda†、Tommaso Melodia\*（\* 美国东北大学智能网络系统研究所，波士顿；† 日本软银先端技术研究所，东京）  
**版本：** arXiv:2609.09324v1（cs.NI），2026 年 9 月 8 日提交，原文 6 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—VI 节、图 1—图 15 图注与参考文献（英文原条目 17 条）按原文结构录入；原文无数值表格；逐句逐式终校未做。

## 摘要

5G NR 中的**链路自适应（LA）**本质上是**反应式**的：它依赖信道测量与 HARQ 反馈，而信道快速变化时这些信息很快过时。这类数据还带有噪声，难以准确跟踪，并且必须送入具有反馈环效应的实时控制器，难以排查故障。这解释了为何多数实际部署选择简单而稳健的算法，接受这种**滞后**可能让调度器工作在过于激进或过于保守的速率上，以牺牲频谱效率换取可预测性能。本文用 **NOSTRAdAMUS** 改进这一现状：一个**预测式 LA 框架**，在不替换、不重新设计现有算法的前提下为其**增加前瞻能力**。NOSTRAdAMUS 从近期 HARQ 历史预测**下一个无线帧是否会发生重传**，并对底层策略所选的调制编码方案（MCS）施加修正。本文对多个机器学习（ML）模型进行基准测试，表明 **Gradient Boosting** 取得 **82.9%** 的整体准确率，其**高置信度干预**有 **94.2%** 是正确的，推理时延 **5.5 µs**。模型基于在 X5G 测试床上通过空口（OTA）采集的数据训练，使用开源 OpenAirInterface（OAI）5G 协议栈、NVIDIA Aerial 以及商用 O-RAN 射频单元（RU）与用户设备（UE）。模型随后作为 **dApp** 部署，既做 OTA 评估，也在同一测试床上用硬件在环信道模拟器在多种信道下评估，涵盖 3GPP TDL 与 CDL 信道、单天线与多天线配置、步行与车载移动性。评估表明：在**不重新训练**的情况下，跨这些多样场景，该 dApp 能为两种最先进 LA 算法增效，把有效吞吐（goodput）最多提升 **71.5%**，同时把重传最多减少 **71.8%**，展示了该方法的稳健性与泛化能力。

**关键词：** 5G；链路自适应；AI-RAN；机器学习；重传预测；O-RAN；dApp。

## I. 引言

在 5G NR 中，调度器为每个下行（DL）传输块（TB）选择调制编码方案（MCS），目标是在本质动态的无线信道上优化频谱效率。该选择通常由**双环链路自适应（LA）**过程完成：**内环（ILLA）**把用户设备（UE）的信道质量指示（CQI）映射为初始 MCS；**外环（OLLA）**依据 HARQ 反馈以动态偏移调整该映射 [1]。HARQ 通过 ACK/NACK 反馈告知一个已发送 TB 是否成功解码，使失败的 TB 能够重传。该 LA 架构在业界已很成熟，但其本质是**反应式**的——只有在错误发生之后才采取行动。

不幸的是，当信道快速变化时，反应式设计会导致**次优 MCS 选择** [2]、[3]。例如，当最近一次（周期性上报的）CQI 指示信道条件良好时，ILLA 映射到较高 MCS；但若信道因快衰落或遮挡突然恶化，高 MCS 可能导致解码错误。与此同时，外环施加的调整来自**更早**的正面 HARQ 反馈，因而无法立即反映这一变化。这在 5G 中典型的**时分双工（TDD）**部署中尤为突出：HARQ 与 CQI 反馈存在时延，因为 UE 必须等到上行（UL）时隙才能上报下行接收情况。结果，所选 MCS 可能对当前信道过于激进，造成传输失败与 HARQ 重传。反过来，当信道变好而反应式环路因调整仍反映早先解码失败而停留在保守 MCS 时，同样会浪费可用的链路容量。图 1 表明，在本文的空口（OTA）室内部署中，即使 UE 静止且与射频单元（RU）处于视距（LOS），该问题依然出现：我们采用业界标准的 OLLA 算法 [1]、参数化为目标 BLER 10%，观察到即便在这样简单的场景里，反应式环路仍有 **84%** 的时间停留在 MCS 18 这一可可靠支持的最高工作点之下，而 MCS 18 的中位 BLER 为 **8.6%**。在快速移动场景中该滞后问题尤其严重 [2]。

近期工作通过重新设计 LA 算法来弥合这一差距：从增强的 OLLA 更新 [4]、[5]，到基于 bandit、监督学习与强化学习（RL）的学习式 MCS 选择 [3]、[6]—[8]，以及 SALAD [9] 与基于策略的 LOLLA [2] 等自适应方法。另一条研究路线通过 **CQI 预测** [10] 或**信道状态信息（CSI）预测** [11] 来预测 LA 所用的信道信息。学习式与增强环方法**替换或重新设计**了 LA 策略，而信道预测只是改善**喂给**它的信息；两者都没有提供一种通用方式，在不改变既有环路做 MCS 决策方式的前提下为其增加预测性前瞻。因此，人们要么替换环路，要么接受其滞后。

本文提出 **NOSTRAdAMUS**——一个**预测式叠加（overlay）框架**，为现有 LA 算法增加前瞻，从而在不替换它们的情况下提升其有效性。NOSTRAdAMUS 并不从零学习新的 MCS 策略，而是把现有 LA 算法视为**黑箱**，主动修正其选择的 MCS；修正来自对未来重传的 ML 预测。该叠加抽象把预测与 LA 设计解耦，使同一预测机制能够增强差异很大的 LA 策略——从 OLLA 到最先进的 SALAD [9]。据我们所知，NOSTRAdAMUS 是首个设计为**即插即用叠加层**、并用商用无线硬件完成端到端验证的 LA 预测框架。

**主要贡献。** 本文把预测式 LA 叠加问题表述为基于历史 HARQ 数据的**二分类**问题，使调度器能在反应式自适应还来不及响应之前预判短期解码错误。我们对六个 ML 模型做基准测试并选择 **Gradient Boosting** [12]，其高置信度干预有 **94.2%** 的正确率。我们把 NOSTRAdAMUS 作为 **dApp** [13] 部署，并在 X5G 测试床 [14] 上使用开源 OpenAirInterface（OAI）协议栈、商用 RU 与 UE 进行验证。我们通过把同一预测器应用于 **OLLA** 与 **SALAD** 两种算法来展示 NOSTRAdAMUS。我们在异构的 3GPP 抽头延迟线（TDL）与簇延迟线（CDL）传播模型、单输入单输出（SISO）与多输入多输出（MIMO）配置、步行与车载移动性以及 OTA 实验上评估，分别取得比 OLLA 与 SALAD 高 **71.5%** 与 **60.9%** 的平均有效吞吐提升，同时把重传最多减少 **71.8%**。

## II. 系统模型

考虑一个 5G gNB 下行服务 UE 集合 $\mathcal U=\{1,\ldots,N_{\mathrm{UE}}\}$。时间划分为帧，帧索引 $t\in\mathbb Z_{\ge0}$，每帧按配置的 TDD 图样（如 6DS3U）包含下行时隙索引集合 $\mathcal D_t$。我们对下行时隙编号，使每个时隙 $n\in\mathcal D_t$ 唯一属于某一帧 $t$。在每个下行时隙 $n$，gNB 选择要服务的 UE 集合 $\mathcal U_n\subseteq\mathcal U$，分配无线资源，调度待发的 HARQ 重传，并为每个被调度新 TB 的 UE 确定 MCS。本文考虑**HARQ 优先调度**：待发 HARQ 重传先于新数据发送被调度。

先形式化链路自适应问题：gNB 需为每个被调度的 UE 选择 MCS。对在下行时隙 $n\in\mathcal D_t$ 被调度的 UE $u\in\mathcal U_n$，令 $I_{u,n}\in\mathcal I$ 表示 LA 策略在为 UE $u$、时隙 $n$ 做决策时可用的信息。$\mathcal I$ 为可能信息的空间，包括描述近期状况的关键性能指标（KPI，如吞吐量、CQI、信噪比（SNR）、BLER、先前 MCS）以及策略维护的任何内部状态（如 OLLA 偏移）。LA 策略 $\pi$ 是从 $\mathcal I$ 到 $\mathcal M$ 的映射，$\mathcal M=\{m_{\min},m_{\min}+1,\ldots,m_{\max}\}$，即 UE $u$ 在时隙 $n$ 选定的 MCS 为 $m_{u,n}=\pi(I_{u,n})\in\mathcal M$。

该 MCS 决策决定传输的**速率—可靠性权衡**。对给定资源配置，更高 MCS 承载更大 TB，但也提高重传概率；更低 MCS 降低该风险，代价是在相同资源上承载更少信息比特。

考虑 TB 集合 $\mathcal B_{u,t}$：其首次传输在帧 $t$ 内被调度给 UE $u$。与下行时隙类似，我们对 TB 编号，使每个 $i\in\mathcal B_{u,t}$ 唯一属于帧 $t$，故数对 $(u,i)$ 唯一标识一个 TB。对每个 $i\in\mathcal B_{u,t}$，令 $B_{u,i}>0$ 表示该 TB 的载荷大小，在首次传输时固定、在其 HARQ 链中不变。

令 $R$ 为小区配置的最大 HARQ 重传次数，$A_{u,i}\in\{1,\ldots,R+1\}$ 表示 TB $i$ 实际经历的传输尝试次数（含首次传输）。以 $r=0,\ldots,A_{u,i}-1$ 编号这些尝试，$r=0$ 为首次传输、$r\ge1$ 为重传。HARQ 链结束后，令 $S_{u,i}\in\{0,1\}$ 指示该 TB 是否成功解码，$C_{u,i}^{(r)}>0$ 表示第 $r$ 次尝试分配的物理资源块（PRB）数。

为刻画该速率—可靠性权衡随时间的变化，令 $\mathcal B_T=\bigcup_{u\in\mathcal U}\bigcup_{t<T}\{(u,i):i\in\mathcal B_{u,t}\}$ 汇集前 $T$ 帧内发起的 TB。我们用**成功交付的信息比特与所有传输尝试所消耗无线资源之比的长期值**来刻画 LA 策略的资源效率：

$$
J(\pi)=\liminf_{T\to\infty}\frac{\mathbb E_\pi\left\{\sum_{(u,i)\in\mathcal B_T}B_{u,i}S_{u,i}\right\}}{\mathbb E_\pi\left\{\sum_{(u,i)\in\mathcal B_T}\sum_{r=0}^{A_{u,i}-1}C_{u,i}^{(r)}\right\}},\tag{1}
$$

其中期望在策略 $\pi$ 下对随机要素（如信道、业务、解码结果）取。因此 $J(\pi)$ 度量**每分配 PRB 的长期有用信息量**。

理想情况下，$\pi$ 会跟踪瞬时信道质量，持续工作在该权衡的**Pareto 前沿**。然而这要求能够瞬时跟踪 $I_{u,n}$ 的变化，而它本质含噪；典型算法难以做到，本文下一节处理该问题。

## III. NOSTRAdAMUS

图 2 给出 NOSTRAdAMUS 的架构。从一个参考 LA 策略 $\pi_0:\mathcal I\to\mathcal M$ 出发，NOSTRAdAMUS 构造新策略 $\pi'$，用基于近期 HARQ 活动的 ML 预测来调整 $\pi_0$ 的 MCS 决策。调整后的 MCS 决策为

$$
m'_{u,n}=\pi'\left(\pi_0(I_{u,n})\right)=\pi_0(I_{u,n})+a_{u,n}\in\mathcal M,\tag{2}
$$

其中 $a_{u,n}$ 为下文所述的 MCS 调整量。

考虑一个经 $A_{u,i}$ 次尝试后成功解码的 TB。为学习目的，NOSTRAdAMUS **只考虑首次传输的结果**（即丢弃第 2 至第 $A_{u,i}$ 次传输的结果），因为后续尝试不能同样准确地反映信道状态——它们还受到 HARQ 追尾合并（chase combining）的影响：UE 利用先前失败的传输提高其编码增益。

令 $F_{u,j,b}\in\{0,1\}$ 表示帧 $j$ 中第 $b$ 个新 TB 首次传输的 HARQ 结果，0 与 1 分别表示 ACK 与 NACK。对长度为 $W\ge1$ 帧的滑动窗，其中 UE $u$ 的新下行传输数为 $d_{u,1},\ldots,d_{u,W}$，则**首次传输 BLER** 为

$$
\rho_{u,t}^{(W)}=\left(\frac{1}{\sum_{j=1}^{W}d_{u,j}}\right)\times\sum_{j=1}^{W}\sum_{b=1}^{d_{u,j}}F_{u,j,b}.\tag{3}
$$

注意窗内没有初始传输（窗内所有 $j$ 均有 $d_{u,j}=0$）时按**缺失观测**处理。本文余下部分中，BLER 均指首次传输 BLER。

NOSTRAdAMUS 预测 UE $u$ 的新 TB 在**下一帧**是否可能需要重传。对满足 $d_{u,t+1}>0$ 的帧，标签为

$$
y_{u,t+1}=\mathbf 1\left\{\rho_{u,t+1}^{(1)}>0\right\}.
$$

在帧 $t$ 结束时，令 $x_{u,t}\in\mathbb R^{H}$ 汇集 $H$ 个最近的 $\rho_{u,k}^{(W)}$（$k\le t$）值，$f_\phi:\mathbb R^{H}\to[0,1]$ 为学习得到的预测器（见第 IV 节），其输出为

$$
p_{u,t+1}=f_\phi(x_{u,t})\approx\Pr\left(y_{u,t+1}=1\mid x_{u,t}\right).\tag{4}
$$

推理**每 UE 每帧运行一次**，在帧 $t$ 结束时进行，而 $p_{u,t+1}$ 在帧 $t+1$ 的每次 MCS 决策中保持不变。每个预测都独立进行，使用该 UE 自身的重传历史。若可用有效观测少于 $H$ 个，或推理错过截止时间，NOSTRAdAMUS **弃权**（$a_{u,n}=0$，$m'_{u,n}=\pi_0(I_{u,n})$）。

给定 (4) 的预测概率 $p_{u,t+1}$，在时隙 $n\in\mathcal D_{t+1}$ 施加的 MCS 调整为

$$
a_{u,n}=\begin{cases}-\delta_-, & p_{u,t+1}\ge1-\tau,\ \pi_0(I_{u,n})-\delta_-\ge m_{\min},\\[2pt] +\delta_+, & p_{u,t+1}\le\tau,\ \pi_0(I_{u,n})+\delta_+\le m_{\max},\\[2pt] 0, & \text{其他},\end{cases}\tag{5}
$$

其中 $\tau\in[0,\frac12]$ 为置信阈值，$\delta_-,\delta_+\in\mathbb Z_{>0}$ 为可配置的下调／上调 MCS 修正量。

## IV. 训练与部署

为训练 NOSTRAdAMUS，我们使用在 X5G [14] 上通过 AutoRAN [15] 自动化框架采集的真实数据。无线接入网（RAN）运行在配备 Intel Xeon 6240R 中央处理器（CPU）与 NVIDIA A100 GPU 的 Gigabyte E251 服务器上。我们使用富士康 RPQN，配置为 40 MHz 带宽上的 $2\times2$ MIMO、6DS3U TDD 图样与 numerology 1；核心网为 Open5GS。带 NVIDIA Aerial 物理层的 OAI gNB 向一台三星 S25 UE 提供饱和下行 UDP iPerf 业务，UE 由人在室内（我们实验室内）步行携带。该步行覆盖很宽的信道条件范围：参考信号接收功率（RSRP）在第 5 与第 95 百分位之间从 −107 到 −53 dBm，调度器访问了从 0 到 27 的每个 MCS。所得 **240 万**个时隙级样本被聚合到帧粒度，得到 **172,324** 个帧观测。数据集按时间顺序划分为 **70% 训练、15% 验证、15% 测试**；留出测试集含 **25,805** 个样本，其中 **39.3%** 为正例。

我们对候选模型做基准测试，覆盖概率式（Naive Bayes）、距离式（k-Nearest Neighbors）、树集成（Random Forest、Extra Trees、Gradient Boosting）与神经（Multi-Layer Perceptron）各族，均使用同一特征向量。图 3 汇总各模型的准确率、精确率、召回率与 F1：**树集成占优**，其中 Gradient Boosting 总体最佳。

由于 NOSTRAdAMUS 作为 dApp 在调度环中运行，推理必须及时完成（见第 III 节）。我们把训练好的模型导出为 **ONNX** 以支持低开销实时推理，并在 **10,000** 次运行上评估其 **99 百分位时延**（图 4）。Gradient Boosting 取得最低推理时延 **5.5 µs**，结合其预测性能，因此被选用于部署。

图 5 汇总所选 Gradient Boosting 模型：在完整测试集上取得 **82.9%** 准确率与 **75.1%** 召回率。所有实验取 $W=10$、$H=5$、$\delta_-=\delta_+=1$，并在验证集上选 $\tau=0.1$，作为置信度与干预覆盖率之间的折中（动机见 图 5(c)）。在测试集上，我们的置信门对 **54.1%** 的样本实施干预，达到 **94.2%** 的精确率。

图 6 比较离线与 OTA 情形下的预测精度。整体准确率下降 **8.9** 个点、在高置信度子集上下降 **12.2** 个点，而两种情形下精确率都上升（**+11.9** 与 **+1.8** 个点），同时召回率下降——更高的精确率减少了在干净帧上的保守步进。

## V. 实验评估

本节评估三件事：(i) 学到的叠加层能否泛化到训练时未见的信道条件；(ii) 它能否适应用户移动性；(iii) 我们能否在 X5G 测试床上用商用无线硬件在空口验证完整闭环系统。三种情形都使用同一个在 第 IV 节 OTA 轨迹上训练好的 Gradient Boosting 模型，**不重新训练**。图 7 汇总所有场景下的有效吞吐、BLER 与 BLER 尖峰（BLER 超过 0.5 的每个帧计为一次尖峰）行为。

**OpenAirLink：TDL-A/B/C。** 为做受控、可重复的单天线衰落测试，我们使用 **OpenAirLink（OAL）**——一个基于通用软件无线电外设（USRP）的开源可编程信道模拟器 [16]。OAI gNB 在屏蔽腔内驱动富士康 RPQN RU，RU 与一台 Sierra Wireless EM9293 商用现货（COTS）UE 之间的射频路径经过运行在 USRP X410 上的 OAL；OAL 对双向无线链路施加受控衰减与 3GPP 衰落剖面。

为展示 NOSTRAdAMUS 在**静态条件**下也有收益，我们从单抽头平坦信道开始评估。图 8 表明，NOSTRAdAMUS 相对 OLLA 把平均有效吞吐提升 **27.1%** 而 BLER 几乎不变（**+4.6%**），相对 SALAD 提升 **37.2%** 同时把 BLER 降低 **71.8%**（图 7）。这意味着：即使使有效吞吐最大的 MCS 本应是固定的，OLLA 与 SALAD 这类迭代过程也无法稳定收敛到它。

为理解这些增益是否可泛化，我们在**不重新训练**的情况下把 NOSTRAdAMUS 部署到 3GPP TDL-A、TDL-B、TDL-C 信道模型 [17] 上，固定时延扩展 30 ns。尽管 NOSTRAdAMUS 运行在完全未见的信道条件与不同时延剖面下，图 9 显示三种场景的平均有效吞吐均有提升：相对 OLLA 提升 **5.5%–21.3%**，相对 SALAD 提升 **5.1%–20.4%**。因此 NOSTRAdAMUS 在三个未见时延剖面上都能泛化并改善两个宿主，且无需逐信道调参。

我们继续跨信道泛化研究，评估当信道**恶化基础策略所依赖的反馈**（如 CQI）时会发生什么：固定 TDL-A，把时延扩展从 30 ns 扫到 300 ns（图 10）。更长的时延扩展收窄相干带宽，使单个宽带 CQI 越来越不能代表日益不平坦的逐 PRB 信道。两个基础策略都**崩溃**：在 DS 30 与 DS 300 之间，OLLA 的平均有效吞吐下降 **78.7%**、SALAD 下降 **65.8%**。NOSTRAdAMUS 并不能消除这一损失，但其有效吞吐增益**持续存在**：相对 OLLA 从 **5.5%** 到 **53.7%**，相对 SALAD 从 **5.1%** 到 **21.6%**。如图 10 所示，随时延扩展增大，基础策略更多集中在较低 MCS，而每个基础与其叠加层之间的水平差距并未缩小。因此，当频率选择性削弱 LA 所依赖的反馈时，NOSTRAdAMUS 的预测依然有用。

我们还对 TDL-B 与 TDL-C 重复了时延扩展扫描。图 7 表明 NOSTRAdAMUS 在不同信道剖面间都能泛化，并在**全部十个场景**中改善有效吞吐：相对 OLLA 的增益中位数为 **30.2%**（范围 5.5%–71.5%），相对 SALAD 为 **17.9%**（范围 5.1%–60.9%）。

总体而言，NOSTRAdAMUS 对两个基础策略的受益方式**不同**。对 OLLA，BLER 基本不变（**−1.2%**），而首次尝试传输中低于 MCS 5 的比例下降 **73.4%**（图 11(a)）：叠加层阻止了滞后反馈把 OLLA 保持在过度保守的速率上。SALAD 本已工作在较高 MCS，叠加层在高 MCS 占比上的变化中位数仅 **3.1%**；相反，它在每个场景中把 BLER 降低 **12.0%–71.8%**，并把 BLER 尖峰概率降低 **41.7%**、尖峰持续时间降低 **38.4%**（图 12）。简言之，NOSTRAdAMUS 为 OLLA **加速速率恢复**，为 SALAD **减少重传**。

**PROPSIM：CDL-C UMi/UMa。** 现在我们用 Keysight PROPSIM FS64 上 3GPP 38.901 CDL-C 模型的 MIMO 评估来加入移动性：UMi 取 1.5 m/s（步行）、UMa 取 30 km/h（车载），直接施压于 第 I 节 指出的失效模式——信道在变化，而反应式策略还在等待滞后的 HARQ 结果。两种场景下 NOSTRAdAMUS 都保持稳定优势。在 OLLA 中，深衰落使 MCS 快速下降而恢复速率缓慢，导致 MCS 0 在 UMa 与 UMi 中分别被选中 **15.2%** 与 **8.2%** 的时间。NOSTRAdAMUS 几乎完全避免了 MCS 0：在 UMa 上把低于 MCS 5 的区域缩小 **82.9%**、UMi 上缩小 **75.5%**，并把 MCS ≥ 20 的占比提高 **108.3%** 与 **27.0%**（图 13）。

图 14 的时间序列更好地解释了该增益：NOSTRAdAMUS 更快恢复到高速率区间并保持更长的连续时段，而 OLLA 会**过度修正**成长期的低 MCS 片段。简言之，CDL-C 实验表明：在移动性下，NOSTRAdAMUS 的贡献在于**缩短恢复时间**，且其价值随信道强制恢复的速率增长。

**X5G：空口。** OTA 评估使用与训练活动（第 IV 节）相同的测试床与配置，带宽 **100 MHz**。总体而言，OTA 实验再现了模拟中的趋势。对 OLLA，增益同样来自在较低 MCS 区域停留更少：把有效吞吐提升 **45.2%** 而 BLER 相近（**+3.1%**）。对 SALAD，MCS 分布几乎相同，有效吞吐增益（**+14.4%**）来自 BLER 的降低（**−27.7%**）（图 15）。

## VI. 结论与未来工作

本文提出 NOSTRAdAMUS——一种新颖的**即插即用预测式叠加层**，在不替换、不重新设计现有 LA 策略的前提下为其增加前瞻。仅用短期 HARQ 历史，一个轻量 Gradient Boosting 模型预测即将发生的重传活动，并主动调整底层策略所选 MCS。跨 3GPP TDL 与 CDL 信道、SISO 与 MIMO 配置、步行与车载移动性以及 OTA 部署，同一预测器都能泛化并同时改善 OLLA 与 SALAD。尽管二者的自适应机制不同，NOSTRAdAMUS 通过**在 OLLA 过于保守时加速链路恢复**、**在 SALAD 上减少不必要的重传**而与之互补。总体上，该叠加层把平均有效吞吐最多提升 **71.5%**、把重传最多减少 **71.8%**，说明预测式自适应可以作为轻量层引入到现有 LA 算法之上。

未来工作将在更大规模多 UE 部署中评估 NOSTRAdAMUS，把框架扩展到上行 LA，并研究其增强更多基础策略（包括基于 RL 的方法）的能力。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 17 条，源文 p. 6）。

[1] K. I. Pedersen, G. Monghal et al., "Frequency domain scheduling for OFDMA with limited and noisy channel feedback," in Proc. IEEE 66th Vehicular Technology Conference (VTC-2007 Fall), 2007, pp. 1792–1796.

[2] R. Wang, L. Zhang et al., "LOLLA: Deep reinforcement learning for closed-loop link adaptation towards a GPU-accelerated AI-RAN," arXiv preprint arXiv:2606.23110, 2026.

[3] X. Ye, Y. Yu, and L. Fu, "Deep reinforcement learning based link adaptation technique for LTE/NR systems," IEEE Transactions on Vehicular Technology, vol. 72, no. 6, pp. 7364–7379, 2023.

[4] F. Blánquez-Casado, G. Gómez et al., "eOLLA: an enhanced outer loop link adaptation for cellular networks," EURASIP Journal on Wireless Communications and Networking, vol. 2016, no. 1, p. 20, 2016.

[5] L. Zhu, C. Bockelmann et al., "NOLLA: Non-linear outer loop link adaptation for enhancing wireless link transmission," in 2023 IEEE 34th Annual International Symposium on Personal, Indoor and Mobile Radio Communications (PIMRC), 2023, pp. 1–6.

[6] V. Saxena, H. M. Tullberg, and J. Jaldén, "Reinforcement learning for efficient and tuning-free link adaptation," IEEE Transactions on Wireless Communications, vol. 21, no. 2, pp. 768–780, 2022.

[7] L. Tsipi, M. Karavolos et al., "Machine learning-based methods for MCS prediction in 5G networks," Telecommunication Systems, vol. 86, no. 4, pp. 705–728, 2024.

[8] L. You, N. Zhou et al., "From simulation to reality: Practical deep reinforcement learning-based link adaptation for cellular networks," arXiv preprint arXiv:2603.00689, 2026.

[9] R. Wiesmayr, L. Maggi et al., "SALAD: Self-adaptive link adaptation," arXiv preprint arXiv:2510.05784, 2025.

[10] H. Yin, X. Guo et al., "Predicting channel quality indicators for 5G downlink scheduling in a deep learning approach," arXiv preprint arXiv:2008.01000, 2020.

[11] F. Díaz-Ruiz, F. J. Martín-Vega et al., "CSI prediction frameworks for enhanced 5G link adaptation: Performance-complexity trade-offs," arXiv preprint arXiv:2511.20160, 2025.

[12] J. H. Friedman, "Greedy function approximation: A gradient boosting machine," The Annals of Statistics, vol. 29, no. 5, pp. 1189–1232, 2001.

[13] A. Lacava, L. Bonati et al., "dApps: Enabling Real-Time AI-Based Open RAN Control," Computer Networks, vol. 269, p. 111342, 2025.

[14] D. Villa, I. Khan et al., "X5G: An open, programmable, multi-vendor, end-to-end, private 5G O-RAN testbed with NVIDIA ARC and OpenAirInterface," IEEE Transactions on Mobile Computing, vol. 24, no. 11, pp. 11 305–11 322, November 2025.

[15] S. Maxenti, R. Shirkhani et al., "AutoRAN: Automated and Zero-Touch Open RAN Systems," 2025. [Online]. Available: https://arxiv.org/abs/2504.11233

[16] Y. Deshpande, X. Wang, and W. Kellerer, "OpenAirLink: Reproducible wireless channel emulation using software defined radios," in Proc. IFIP Networking Conference, 2024, pp. 678–683.

[17] 3GPP, "TR 38.901 5G; Study on channel model for frequencies from 0.5 to 100 GHz (3GPP TR 38.901 version 19.4.0 release 19)," 3rd Generation Partnership Project, Tech. Rep., July 2026. [Online]. Available: https://www.etsi.org

## 图注与表注

**图 1：静止 UE 的反应式 MCS 选择。** 环路在 84% 的时间里选择低于 18 的 MCS，而 MCS 18 仅在不到 12% 的帧中被选中，尽管其中位 BLER 为 8.6%、处于 10% 目标之内。图中同时给出 BLER 箱线图、MCS 使用率与有效吞吐（Mbps）。

**图 2：NOSTRAdAMUS 架构。** 叠加 dApp 观测宿主 LA 策略 $\pi_0$，从近期比值 $\rho$ 预测下一帧的首次重传活动，并对所选 MCS 施加 (5) 的置信门控调整；图中标注分布式单元、特征工程、Gradient Boosting、置信门、宿主 LA 策略、RLC、CU、核心网、N2/N3、F1、HARQ 调度、PHY、RU、FH，以及 UE 侧 ACK/NACK 与 CQI 反馈。

**图 3：ML 模型基准测试。** 六个候选模型（Gradient Boosting、Random Forest、Extra Trees、KNN、Naive Bayes、MLP）在准确率、F1、召回率与精确率上的对比。

**图 4：六个 ML 模型在 ONNX 中的每 UE 推理时延**，10,000 次运行；琥珀色条标记第 99 百分位。

**图 5：混淆矩阵**，(a) 完整测试集、(b) 高置信度子集、(c) 验证集上的 ROC（标注 AUC（验证）= 0.901 以及 $p\ge0.5$、$p\ge0.9$、$p\le0.1$ 门限）。

**图 6：离线与部署指标对比**，整体与高置信度两种口径。

**图 7：所有场景的汇总。** 基础策略 $\pi_0$ 与 NOSTRAdAMUS 叠加 $\pi'$ 在有效吞吐、BLER、尖峰概率与尖峰长度上的对比，右轴为变化量 $\Delta$，并给出 95% 自举区间。

**图 8：单抽头平坦信道上的有效吞吐 CDF**（$\pi_{\mathrm{OLLA}}$、$\pi_{\mathrm{SALAD}}$ 与其叠加层）。

**图 9：固定 30 ns 时延扩展下的有效吞吐 CDF**（TDL-A、TDL-B、TDL-C）。

**图 10：TDL-A 在时延扩展增大时的有效吞吐 CDF**（DS 30/100/300 ns）。

**图 11：全部 OAL 实验的首次尝试 MCS 分布**，基础为实心、NOSTRAdAMUS 为斜线：(a) OLLA 基础，(b) SALAD 基础；分段为 MCS < 5、中段、MCS ≥ 20。

**图 12：BLER 尖峰的概率 (a) 与平均持续时间 (b)。**

**图 13：CDL-C 移动性下的 MCS 使用率**（UMa 与 UMi；y 轴对数刻度）。

**图 14：CDL-C 移动性下的时间序列**，OLLA 为虚线、叠加层为实线；每列自上而下为有效吞吐、BLER 与 MCS 随时间的变化（UMa 与 UMi）。

**图 15：OTA 结果**：(a) 首次尝试 MCS、(b) BLER、(c) 有效吞吐，并标注叠加层相对基础策略的变化（+3.1%、−27.7%、+45.2%、+14.4%）。

**表注：** 原文无数值表格，全部实验数据以图 1—图 15 呈现。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.09324v1（cs.NI，2026-09-08）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（双环 LA 与反应式滞后、相关工作两条路线、NOSTRAdAMUS 定位、主要贡献）；第 II 节系统模型（LA 形式化、速率—可靠性权衡、资源效率 $J(\pi)$ 与式 (1)）；第 III 节 NOSTRAdAMUS（叠加策略与式 (2)、首次传输 BLER 式 (3)、标签与预测器式 (4)、置信门控调整式 (5)）；第 IV 节训练与部署（X5G/AutoRAN 数据采集、六个 ML 模型基准、ONNX 时延、选型与超参数、离线与 OTA 精度对比）；第 V 节实验评估（OAL 的 TDL-A/B/C 与平坦信道、TDL-A 时延扩展扫描、PROPSIM 的 CDL-C UMa/UMi 移动性、X5G OTA）；第 VI 节结论与未来工作；17 条英文参考文献；图 1—图 15 图注。

**源文页码：** 第 1 页（题名、作者、摘要、引言开头、图 1）→ 第 2 页（引言续、相关工作、贡献、第 II 节、式 (1)）→ 第 3 页（第 II 节续、图 2、第 III 节、式 (2)—(5)）→ 第 4 页（第 IV 节、图 3—图 6）→ 第 5 页（第 V 节、图 7—图 12）→ 第 6 页（CDL-C 移动性、图 13—图 15、第 VI 节、参考文献 [1]—[17]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；**原文无数值表格**，实验数据全部以图 1—图 15 呈现，本页仅译图注与正文引用的关键数值（如 82.9%、94.2%、5.5 µs、54.1%、172,324、25,805、71.5%、71.8% 等），未对图做图像级数字重构。
2. 图 1—图 15 均未上传图片；本页以"图注与表注"小节统一给出 15 条中文图注，正文按"图 N"引用。
3. 公式覆盖原文编号式 (1)—(5)，全部保留原编号。
4. **原文疑点／说明：** ①式 (3) 的分母为窗内新下行传输总数 $\sum_{j=1}^{W}d_{u,j}$，当窗内全部 $d_{u,j}=0$ 时按缺失观测处理（原文明确说明），译文照录；②式 (5) 的阈值条件 $\tau\in[0,\frac12]$ 与"上调/下调均需满足 MCS 边界"的双重条件按原文照录；③摘要与结论中"最多提升 71.5%／减少 71.8%"为跨全部场景的上界、第 V 节给出分场景区间，译文分别照录以免混淆；④第 V 节"OTA 带宽 100 MHz"与第 IV 节训练配置的 40 MHz 不同（原文如是指述：训练用 40 MHz、OTA 评估用 100 MHz），译文照录；⑤原文第 V 节把 OAL 的 TDL 扫描与 PROPSIM 的 CDL-C 场景分列，图 7 汇总全部场景，译文保留该结构。
5. 原文为 arXiv 预印本（cs.NI），6 页（短文）；页面目录日期 2026-09-26 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-08）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}