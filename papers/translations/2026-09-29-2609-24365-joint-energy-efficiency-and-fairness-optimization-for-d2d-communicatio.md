---
layout: page
title: "空天地一体化异构网络中 D2D 通信的能效与公平性联合优化｜中文全文译文"
permalink: /papers/translations/2026-09-29-2609-24365-joint-energy-efficiency-and-fairness-optimization-for-d2d-communicatio/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/72c955ad657d80c7/) · [原文 arXiv](https://arxiv.org/abs/2609.24365) · [全部目录](/papers/catalog/)

# 空天地一体化异构网络中 D2D 通信的能效与公平性联合优化

**原题：** Joint Energy Efficiency and Fairness Optimization for D2D Communications in Aerial-Ground Integrated Heterogeneous Networks  
**作者：** Chuan-Chi Lai（Member, IEEE）、Ang-Hsun Tsai（Member, IEEE）、Shang-Long Wu。单位：C.-C. Lai 为台湾中正大学通信工程系（嘉义县民雄乡 621301），并隶属中正大学高科技制造先进研究院（AIM-HI）（chuanclai@ccu.edu.tw）；A.-H. Tsai 为台湾逢甲大学通信工程系（台中 407102，ahtsai@fcu.edu.tw）；S.-L. Wu 为中正大学通信工程系。通讯作者：Ang-Hsun Tsai。  
**版本：** arXiv:2609.24365v1（cs.NI），2026 年 9 月 21 日提交，原文 15 页（IEEE 期刊投稿格式，含图 1–5、表 I–III、算法 1–3、公式 (1)–(24)、参考文献 31 条、作者简介 3 条）；原文首页标注 Copyright (c) 2026 IEEE。  
**资助（原文首页脚注）：** 本研究部分由台湾“国科会”（NSTC）资助，计划编号 NSTC 114-2221-E-194-062-、NSTC 115-2221-E-194-042-MY2、NSTC 115-2221-E-035-050-；部分由台湾“教育部”高等教育深耕计划特色领域研究中心“高科技制造先进研究院”（AIM-HI）资助；并部分由逢甲大学资助（Grant 25H00812）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VIII 节（含 II-A–C、III-A–B、V-A–E、VI-A–B、VII-A–D 等全部小节）、结论、全部图注（图 1–5）、表 I–III（逐格转录）、算法 1–3、公式 (1)–(24)、31 条参考文献英文原条目与文末作者简介；原文无附录；逐句逐式终校未做。

## 摘要

本文研究一种空天地一体化异构网络（Aerial-Ground Integrated Heterogeneous Network，AGIHN）架构：它把地面宏基站与作为空中基站的无人机（UAV）结合起来，增强宏小区用户的上行接入。为解决多个设备到设备（D2D）通信对的上行资源分配难题，我们提出一种低复杂度的多信道速率公平（Multi-Channel Rate-Fair，MCRF）算法。与传统独占分配方法不同，MCRF 支持共享复用，允许多个 D2D 对同时复用同一资源块，从而显著提升频谱效率。为管理这种非正交共享造成的严重层内干扰，算法集成了启发式干扰避免（Interference Avoidance，IA）策略，以保证 D2D 用户的传输质量。所提框架无需计算密集的离线训练，即可联合优化系统吞吐量、用户公平性与能效。仿真结果表明，依复用模式不同呈现出明显的性能优势：与传统单信道独占复用方案相比，MCRF 使 D2D 能效与吞吐量分别提升约 397% 与 542%；相对多信道基准（如 MCRR），所提算法优化了效率–公平性折中，在易受干扰的环境中把公平性指数提升 7.43%，同时保持超过 0.6 的稳健公平性得分。

**关键词：** 空天地一体化异构网络、设备到设备通信、无人机通信、频谱效率、公平性、系统吞吐量。

## I. 引言

近年来，无线宽带与移动通信的快速演进通过泛在互联网接入彻底改变了日常生活。然而，由于智能手机与富媒体业务需求的飙升，频谱稀缺仍是关键约束，在拥挤环境中常导致拥塞与信号不稳定 [1]–[3]。虽然部署更多地面基站可以部分缓解，但 3GPP 已在 LTE-Advanced 中提出设备到设备（D2D）通信等主动增强手段，以显著提升频谱效率 [4], [5]。

D2D 通信允许邻近用户设备在蜂窝网络监管下建立直连，无需基站中继 [6]。该途径可提高频谱利用率、增加系统吞吐量，并通过降低发射功率提升能效 [7]–[10]。作为 3GPP 标准的一部分，D2D 技术已围绕设备发现、信道建模以及覆盖内/覆盖外场景得到了广泛研究 [5]。

D2D 的资源管理一般分为集中式与分布式两类。在集中式控制中，基站以底层（underlay）模式分配资源，D2D 对与蜂窝用户共享频谱并需进行干扰抑制；或以重叠（overlay）模式预留一部分专用频谱给 D2D，代价是复用率降低。在分布式控制中，设备自主管理接入，通常工作在非授权频段，并采用先听后说等去中心化协议。5G-Advanced 在非授权频谱上的侧链路（SL-U）等创新，展示了分布式运行在密集部署中的潜力 [11], [12]。

在传统 D2D 网络中，吞吐量在很大程度上受资源分配策略影响。多数集中式途径把每个上行资源块（RB）限制给单个 D2D 对，从而简化干扰管理，但降低了频谱利用率。近期综述 [13], [14] 指出，允许多个 D2D 对共享同一 RB，可利用多用户分集显著提升吞吐量与公平性。

此外，一个近期且前景良好的趋势是空天地一体化异构网络（AGIHN）：它把无人机基站（UAV-BS）与地面基础设施结合。该架构可在灾后恢复、临时大型活动与农村连接等场景提供敏捷、按需的覆盖。在 AGIHN 中，D2D 可从空中与地面基础设施卸载流量、通过邻近中继降低时延，并把连接扩展到边缘用户。然而，空中层与地面层的共存引入了动态拓扑变化、复杂干扰模式与时变链路质量等挑战，使资源分配显著复杂化 [15]–[17]。

受上述研究驱动，本文提出一种面向上行 D2D 通信的新型资源分配框架，允许多个 D2D 对复用同一 RB。该设计同时面向传统地面网络与 AGIHN，考虑空天地一体化、动态网络拓扑、异构链路质量与跨层干扰抑制；目标是提升 D2D 用户间的公平性、增强能效，并保护蜂窝传输的性能，从而为高度自适应、高频谱效率的 D2D 使能异构网络发展作出贡献。

因此，本文的贡献概括如下：

- 我们为 AGIHN 中的上行传输建立了能效与公平性联合优化问题。与传统途径不同，我们专门处理具有挑战性的非正交共享复用场景：多个 D2D 对同时复用同一资源块，从而引入严重的层内干扰。
- 为在避免学习类方法高计算开销的前提下求解该 NP 难问题，我们提出一种低复杂度、免训练的多信道速率公平（MCRF）算法。该途径把公平感知启发式与精细的干扰避免（IA）策略结合，在动态环境中高效管理无线资源。
- 所提框架实现了一种作为“频谱守门人”的稳健干扰管理策略：它通过利用空间复用增益有效提升 D2D 用户的系统吞吐量与能效，同时严格保护主蜂窝用户（MUE）的服务质量（QoS）免受聚合干扰影响。
- 仿真结果验证了所提策略依复用模式不同而具有的明显优势。与传统独占复用（单信道）方案相比，MCRF 算法利用频谱聚合把 D2D 能效与吞吐量分别提升约 397% 与 542%；相对多信道基准，它优化了效率–公平性折中，把公平性指数提升 7.43%。

本文余下部分安排如下：第 II 节介绍相关工作；第 III 节介绍系统模型；第 IV 节描述问题建模；第 V 节说明所提途径；第 VII 节给出仿真结果与讨论；最后第 VIII 节给出结论。

## II. 相关工作

资源分配策略的演进从传统地面 D2D 网络发展到复杂的空天地一体化异构网络（AGIHN）。本节把现有文献分为地面途径、UAV 辅助管理与 3D 网络架构下的公平性具体挑战三类。

### A. 地面 D2D 网络中的资源分配

D2D 通信的早期研究主要面向地面蜂窝网络，奠定了模式选择与频谱复用的基本原理。在底层场景中，资源分配通常旨在管理蜂窝用户（CU）与 D2D 用户之间的干扰，同时优化能效（EE）或频谱效率。[18] 研究了上行底层模式，其资源分配遵循最大最小公平（MMF）原则，并指出当 D2D 对间距离增大或共享资源块（RB）数量减少时，系统 EE 显著下降。类似地，[19] 通过对 MUE 施加最小功率控制分析了用户距离对 EE 的影响，证实了 D2D 距离与系统效率之间的反向关系。

在分配原则方面，[20] 评估了四种不同策略：比例公平（PF）、最小发射功率、随机与最小信道选择。结果表明，最小功率保证最低消耗，而 PF 在维持基本通信质量的同时最大化系统容量。PF 调度的这一优越性在 [21] 与 [22] 的多用户 OFDM 系统中得到进一步印证，表明控制容量比可有效平衡总体吞吐量与个体用户数据速率。

然而，这些传统地面途径常简化优化问题。例如，[23] 用 Karush–Kuhn–Tucker（KKT）条件优化小蜂窝网络中的 EE。这些方法在 2D 静态环境中有效，但通常把每个 RB 限制给单个 D2D 对，或忽略 3D 网络拓扑中固有的复杂视距（LoS）干扰模式。

### B. UAV 辅助与 AGIHN 网络中的资源管理

UAV 的引入带来了新的自由度与挑战，需要更先进的资源管理策略。近期研究把分配框架扩展到 AGIHN，聚焦于空地信道（Air-to-Ground）的独特属性。

若干工作采用博弈论途径处理空中与地面节点之间的交互。[15] 用 Nash 博弈进行功率控制、并用匈牙利算法进行信道匹配，解决 UAV 底层网络中的能效问题。类似地，[17] 用 Stackelberg 博弈理论研究了 UAV 使能的移动边缘计算（MEC）系统中的频谱租赁。为处理多目标优化，[16] 联合优化了 UAV 部署、发射功率与飞行速度。

与基于优化的方法并行，基于学习的方法也受到关注。[24] 为 UAV-M2M 通信提出了基于生成对抗网络（GAN）与 LSTM 的框架，用于预测网络需求并优化资源。深度强化学习（DRL）及类似技术可为动态环境提供强大解决方案，但往往需要大量训练数据与计算开销；这些要求对在应急或临时 AGIHN 场景中快速部署而言可能过高。

此外，[27] 针对异构网络提出一种协作式分布式资源分配算法（CDRAA），采用分时因子（TSF）技术。虽然相较集中式优化提升了吞吐量，但它未充分考虑多个 UAV 与 D2D 对共存时存在的严重三维空地干扰。

### C. 共享频谱中的公平性与干扰抑制

在 AGIHN 中，确保共享稀缺频谱的 D2D 用户之间的公平性仍是关键挑战。虽然比例公平（PF）原则在蜂窝网络中有坚实的理论基础 [22]，但直接应用于 AGIHN 面临局限。在 3D 架构中，由于 LoS 链路概率高，地面 D2D 发射机对 UAV 上行信道的干扰（以及反向干扰）显著强于地面网络。尽管 [25] 等近期研究提出了动态保护区域等有效干扰抑制技术，但这些技术通常针对地面下行场景设计，可能无法充分应对 UAV 辅助网络中的 3D 移动性挑战。传统 PF 方案在此类强干扰下多个 D2D 对复用同一 RB 时，常无法维持 SINR 稳定。此外，UAV 移动性引起的快速信道状态变化使现有框架难以实时适应，常导致 SINR 跌破阈值。为应对这些动态挑战，近期工作 [24], [26] 引入了联邦多智能体深度强化学习（F-MADDQN）框架。然而此类数据驱动途径通常带来高计算开销并需要较长训练周期，可能不适合时延敏感的救灾任务。这些空白凸显了需要一种低复杂度启发式方法，能在不承担学习类方法沉重训练负担的前提下平衡系统吞吐量与用户公平性。

因此，本研究提出多信道速率公平（MCRF）算法并结合干扰避免（IA）策略，专门处理高密度、易受干扰的 AGIHN 环境中能效与公平性的折中。为清晰展示本工作相对文献的定位，表 I 定性地把所提方案与最新途径作对比。一个关键区别在于 RB 复用策略：传统优化方法 [19] 通常强制独占复用（每个 RB 一条 D2D 链路），而近期基于空间的方案 [25] 依赖地理保护区域；我们的框架支持共享复用（每个 RB 多条 D2D 链路），可实现显著更高的频谱效率，但必须借助我们提出的精细 IA 策略来管理 3D UAV 环境中由此产生的聚合干扰。

**表 I：** 所提方案与既有途径的定性对比。

| 文献 | 年份 | 方法 | 网络场景 | 目标 | RB 复用策略 | 干扰抑制 | 公平性 | 计算复杂度 |
|---|---|:-|:-|:-|:-|:-|:-|:-|
| Shen et al. [22] | 2005 | 优化（次优） | MU-OFDM（下行） | 和容量 | 正交（1 用户/RB） | 子信道分配 | 是（速率约束） | 低 |
| Hu et al. [19] | 2017 | 迭代算法（匹配理论） | D2D 底层（下行） | 能效 | 独占（1 D2D/RB） | 功率控制与匹配 | 否（仅 QoS） | 中等 |
| Xu et al. [24] | 2021 | 学习（LSTM/GAN） | UAV 辅助网络 | 流量预测 | 不适用 | 不适用 | 否 | 高（需训练） |
| Rahim et al. [25] | 2025 | 优化（保护区域） | 地面 D2D（下行） | 覆盖概率 | 空间复用（保护区） | 保护区域与功率控制 | 否 | 低 |
| Noman et al. [26] | 2025 | 学习（联邦 DDQN） | D2D 异构网络 | 能效 | 共享（多个 D2D） | 联合资源分配 | 是（仅 QoS） | 高（需训练） |
| 本文 MCRF | 2026 | 启发式算法 | 3D UAV-AGIHN（上行） | 能效与公平性 | 共享（多个 D2D） | 干扰避免（IA） | 是（Jain 指数） | 低（多项式） |

## III. 系统模型

### A. 系统架构

本研究基于空天地一体化异构网络（AGIHN）架构，采用正交频分复用（OFDM）系统进行上行传输，并在资源分配管理上采用底层（underlay）模式。整体场景包括一个地面宏基站（MBS）与 $N_V$ 个充当空中基站的无人机（UAV），它们共同作为宏小区用户（MUE）的上行接入点。所考虑的网络架构如图 2 所示，本研究使用的重要符号汇总于表 II。

**图 1：** 蜂窝通信与 D2D 通信对比。

每个 UAV 与 MBS 建立回传链路，MBS 配备边缘控制器，负责对整个网络的集中管理与协调。UAV 到 MBS 的回传链路频谱与 MUE 到各 UAV 的前传链路频谱假定相互正交，从而保证这些链路之间无相互干扰。这种正交性使可靠通信得以实现，并简化了空中与地面两段的资源分配。

**移动性与准静态假设：** 在所提 AGIHN 架构中，UAV 作为空中基站运行。为提供稳定可靠的覆盖，假定 UAV 在服务期间处于悬停或准静止状态。本研究核心关注的是地面 D2D 用户的资源分配，而非 UAV 轨迹优化。对地面上的移动 D2D 对与 MUE，资源分配的时间尺度（通常每个调度时隙 1 ms）显著短于其机械移动尺度。即便对高速移动的车载用户（如 30 m/s），单个 1 ms 时隙内的最大物理位移也仅为 0.03 m。由于这种微观位移不会引起大尺度路损或宏观干扰拓扑的明显变化，我们采用**准静态假设**：在单个调度时隙内认为用户位置不变，所提 MCRF 算法按快照即时执行，为当前拓扑优化资源。该设计确保系统能通过逐帧刷新分配矩阵来适应移动性。

**表 II：** 本研究的符号汇总。

| 符号 | 含义 |
|---|---|
| $N_M$ | MUE 数量 |
| $N_D$ | D2D 用户数量 |
| $N_V$ | UAV 基站数量 |
| $N_0$ | 背景噪声 |
| $W_{\rm RB}$ | 每个资源块的带宽 |
| $K$ | 资源块数量 |
| $\alpha_{u,k}$ | 第 $k$ 个资源块分配给第 $u$ 个 D2D 用户对的分配状态 |
| $\alpha_{n,k}$ | 第 $k$ 个资源块分配给第 $n$ 个 MUE 的分配状态 |
| $\delta_{n,B}$ | 第 $n$ 个 MUE 与 MBS 的关联 |
| $\delta_{n,v}$ | 第 $n$ 个 MUE 与第 $v$ 个 UAV 的关联 |
| $P^D_{u,k}$ | 第 $u$ 个 D2D 对在第 $k$ 个资源块上的发射功率 |
| $P^M_{n,k}$ | 第 $n$ 个 MUE 在第 $k$ 个资源块上的发射功率 |
| $g^{M2B}_{n,k}$ | 第 $n$ 个 MUE 与 MBS 在第 $k$ 个资源块上的信道增益 |
| $g^{M2D}_{n,u,k}$ | 第 $n$ 个 MUE 与第 $u$ 个 D2D 对接收机在第 $k$ 个资源块上的信道增益 |
| $g^{M2V}_{n,v,k}$ | 第 $n$ 个 MUE 与第 $v$ 个 UAV 在第 $k$ 个资源块上的信道增益 |
| $g^{D2B}_{u,k}$ | 第 $u$ 个 D2D 对发射机与 MBS 在第 $k$ 个资源块上的信道增益 |
| $g^{D2V}_{u,v,k}$ | 第 $u$ 个 D2D 对发射机与第 $v$ 个 UAV 在第 $k$ 个资源块上的信道增益 |
| $g^{D2D}_{u,k}$ | 第 $u$ 个 D2D 对发射机与接收机在第 $k$ 个资源块上的信道增益 |
| $g^{D2D}_{j,u,k}$ | 第 $j$ 个 D2D 对发射机与第 $u$ 个 D2D 对接收机在第 $k$ 个资源块上的信道增益 |
| $I^{D2M}_{u,n,k}$ | 第 $u$ 个 D2D 对发射机对第 $n$ 个 MUE 在第 $k$ 个资源块上的干扰 |
| $I^{D2D}_{j,u,k}$ | 第 $j$ 个 D2D 对发射机对第 $u$ 个 D2D 对接收机在第 $k$ 个资源块上的干扰 |
| $I^{M2D}_{n,u,k}$ | 第 $n$ 个 MUE 对第 $u$ 个 D2D 对接收机在第 $k$ 个资源块上的干扰 |
| $I^{\max}_{n,k}$ | 第 $n$ 个 MUE 的最大可容忍干扰 |
| $\Phi$ | 系统中未分配的资源块集合 |
| $\Omega_u$ | 具备资源分配资格的 D2D 用户集合 |
| $\Phi_u$ | 第 $u$ 个 D2D 用户的未分配资源块集合 |
| $\gamma^D_{u,k}$ | 第 $u$ 个 D2D 用户在第 $k$ 个资源块上的 SINR |
| $\gamma_{\rm th}$ | SINR 阈值 |
| $I^D_{u,k}$ | 第 $u$ 个 D2D 用户在第 $k$ 个资源块上对 MUE 造成的干扰 |
| $C^D_{u,k}$ | 第 $u$ 个 D2D 对在第 $k$ 个资源块上达到的容量 |
| $C^D_u$ | 第 $u$ 个 D2D 对的容量 |
| $C^M_n$ | 第 $n$ 个 MUE 的容量 |
| $\Omega_k$ | 分配到冲突或无效资源块 $k$ 的 D2D 用户集合 |
| $x$ | $\Omega_k$ 中的每个成员 |
| $\alpha_{x,k}$ | 资源块 $k$ 与 $\Omega_k$ 中成员 $x$ 之间的分配状态 |

### B. 信道模型与资源分配

信道模型同时纳入大尺度衰落（路损、阴影）与小尺度衰落（多径、多普勒扩展）[24], [28], [29]。设 $\alpha_{u,k}$ 与 $\alpha_{n,k}$ 分别表示第 $u$ 个 D2D 对与第 $n$ 个 MUE 在第 $k$ 个 RB 上的二值资源分配指示符，定义为

$$
\alpha_{u,k},\ \alpha_{n,k}=
\begin{cases}
1, & \text{若第 } k \text{ 个 RB 分配给该用户},\\
0, & \text{其他情形}.
\end{cases} \tag{1}
$$

类似地，定义关联指示符 $\delta_{n,B},\delta_{n,v}\in\{0,1\}$ 表示第 $n$ 个 MUE 连接到 MBS 还是第 $v$ 个 UAV；二者必须满足约束

$$
\delta_{n,B}+\sum_{v=1}^{N_V}\delta_{n,v}\le1,\qquad
\forall n\in\{1,2,\dots,N_M\}, \tag{2}
$$

其中 $N_M$ 为 MUE 总数，$N_V$ 为 UAV 总数。

当第 $u$ 个 D2D 对使用第 $k$ 个资源块时，设 $P^D_{u,k}$ 表示其在该资源块上的发射功率消耗，$N_0$ 表示系统噪声。第 $u$ 个 D2D 对的信干噪比（SINR）为

$$
\gamma^D_{u,k}=
\frac{\alpha_{u,k}P^D_{u,k}g^{D2D}_{u,k}}
{\sum_{j=1,j\ne u}^{N_D}I^{D2D}_{j,u,k}
+\sum_{n=1}^{N_M}I^{M2D}_{n,u,k}+N_0}, \tag{3}
$$

其中 $g^{D2D}_{u,k}$ 是第 $u$ 个 D2D 对发射机与接收机在第 $k$ 个资源块上的信道增益；干扰项 $I^{D2D}_{j,u,k}=\alpha_{j,k}P^D_{j,k}g^{D2D}_{j,u,k}$ 是第 $j$ 个 D2D 对发射机对第 $u$ 个 D2D 对接收机在第 $k$ 个资源块上的干扰，$g^{D2D}_{j,u,k}$ 是二者之间的信道增益；$I^{M2D}_{n,u,k}=\alpha_{n,k}P^M_{n,k}g^{M2D}_{n,u,k}$ 是第 $n$ 个 MUE 对第 $u$ 个 D2D 对接收机在第 $k$ 个资源块上的干扰，$g^{M2D}_{n,u,k}$ 是第 $n$ 个 MUE 与该接收机之间的信道增益。

当第 $n$ 个 MUE 使用第 $k$ 个资源块时，设 $P^M_{n,k}$ 表示其在该资源块上的发射功率消耗。第 $n$ 个 MUE 的 SINR $\gamma^M_{n,k}$ 为

$$
\gamma^M_{n,k}=
\frac{\alpha_{n,k}P^M_{n,k}
\left(\delta_{n,B}g^{M2B}_{n,k}
+\sum_{v=1}^{N_V}\delta_{n,v}g^{M2V}_{n,v,k}\right)}
{\sum_{u=1}^{N_D}I^{D2B}_{u,n,k}+N_0}, \tag{4}
$$

其中 $g^{M2B}_{n,k}$ 是第 $n$ 个 MUE 与 MBS 在第 $k$ 个资源块上的信道增益，$g^{M2V}_{n,v,k}$ 是第 $n$ 个 MUE 与第 $v$ 个 UAV 在第 $k$ 个资源块上的信道增益。(4) 的分母中第一项是全部 D2D 对在第 $k$ 个资源块上对第 $n$ 个 MUE 服务基站的干扰总和，记为

$$
I^{D2B}_{u,n,k}
=\delta_{n,B}\alpha_{u,k}P^D_{u,k}g^{D2B}_{u,k}
+\sum_{v=1}^{N_V}\delta_{n,v}\alpha_{u,k}P^D_{u,k}g^{D2V}_{u,v,k}, \tag{5}
$$

其中 $g^{D2B}_{u,k}$ 是第 $u$ 个 D2D 对发射机与 MBS 在第 $k$ 个资源块上的信道增益，$g^{D2V}_{u,v,k}$ 是第 $u$ 个 D2D 对发射机与第 $v$ 个 UAV 在第 $k$ 个资源块上的信道增益。

设 $W_{\rm RB}$ 表示每个资源块的带宽。基于上述 SINR 表达式与 Shannon 容量公式，第 $u$ 个 D2D 对与第 $n$ 个 MUE 的总可达数据速率（分别记为 $C^D_u$ 与 $C^M_n$）由对所有 $K$ 个 RB 的容量求和得到：

$$
C^D_u=\sum_{k=1}^{K}W_{\rm RB}\log_2\left(1+\gamma^D_{u,k}\right),\qquad
C^M_n=\sum_{k=1}^{K}W_{\rm RB}\log_2\left(1+\gamma^M_{n,k}\right). \tag{6}
$$

于是，系统总容量（记为 $C_{\rm Total}$）定义为全部 $N_D$ 个 D2D 对与 $N_M$ 个 MUE 传输容量之和：

$$
C_{\rm Total}=\sum_{u=1}^{N_D}C^D_u+\sum_{n=1}^{N_M}C^M_n. \tag{7}
$$

根据 [23]，终端设备的功率消耗由两部分组成：静态电路功率消耗与发射功率消耗。设 $P^{SC}_u$ 表示第 $u$ 个 D2D 用户对的静态电路功率消耗，$P^{SC}_n$ 表示第 $n$ 个 MUE 用户的静态电路功率消耗，功率放大器效率的倒数记为 $\eta$。据此，第 $u$ 个 D2D 用户对的功率消耗为

$$
P^D_u=\eta\sum_{k=1}^{K}\alpha_{u,k}P^D_{u,k}+P^{SC}_u, \tag{8}
$$

而第 $n$ 个 MUE 用户的功率消耗为

$$
P^M_n=\eta\sum_{k=1}^{K}\alpha_{n,k}P^M_{n,k}+P^{SC}_n. \tag{9}
$$

根据 (8)，全部 D2D 用户的总功率消耗可表示为

$$
P^D=\sum_{u=1}^{N_D}P^D_u. \tag{10}
$$

类似地，根据 (9)，全部 MUE 的总功率消耗可表示为

$$
P^M=\sum_{n=1}^{N_M}P^M_n. \tag{11}
$$

根据上述假设，系统中全部 D2D 用户的能效可由下式给出：

$$
EE^D=\frac{C^D}{P^D}
=\frac{\sum_{u=1}^{N_D}C^D_u}{\sum_{u=1}^{N_D}P^D_u}. \tag{12}
$$

**图 2：** 本工作所考虑的系统模型（含 MBS、UAV、MUE 发射机与 D2D 对；图例：实线为信号、虚线为干扰、点划线为回传链路）。

我们还考虑 D2D 用户的 Jain 公平性指数 [30]：这是衡量资源分配公平性的著名指标 [28]，定义为个体效用之和的平方与个体效用平方和之比，取值范围为 0 到 1，0 表示最大不公平、1 表示完全公平。此处我们以 D2D 用户的传输容量作为其效用，因此 D2D 用户的 Jain 公平性指数可表示为

$$
J(R)=\frac{\left(\sum_{u=1}^{N_D}C^D_u\right)^2}
{N_D\sum_{u=1}^{N_D}\left(C^D_u\right)^2}. \tag{13}
$$

## IV. 问题建模

基于上述系统模型，我们的主要目标是最大化 D2D 用户的总能效 $EE^D$。然而，在没有公平性约束时单纯最大化总 EE，通常会导致信道条件较差的边缘用户资源匮乏。为防止这一点，我们在优化框架中显式引入公平性约束。联合优化问题表述如下：

$$
{\rm (P1)}:\quad
\max_{\alpha_{u,k},\,P^D_{u,k}}\ EE^D \tag{14a}
$$
$$
\text{s.t.}\quad
\alpha_{u,k}\in\{0,1\},\quad\forall u,\ \forall k, \tag{14b}
$$
$$
\alpha_{u,k}\gamma^D_{u,k}\ge\gamma_{\rm th},
\quad\text{若 }\alpha_{u,k}=1,\ \forall u,\ \forall k, \tag{14c}
$$
$$
P^D_{u,k}\le P_{\max},\quad\forall u,\ \forall k, \tag{14d}
$$
$$
\sum_{u=1}^{N_D}\alpha_{u,k}I^{D2M}_{u,n,k}\le I^{\max}_{n,k},
\quad\forall k,\ \forall n, \tag{14e}
$$
$$
P^M_n\le P_{\max},\quad\forall n, \tag{14f}
$$
$$
J(R)\ge F_{\rm th}. \tag{14g}
$$

约束 (14b) 保证二值资源分配；约束 (14c) 保证最小 QoS 要求（SINR 阈值 $\gamma_{\rm th}$）；约束 (14d) 与 (14f) 分别限制 D2D 用户与 MUE 的最大发射功率；约束 (14e) 管理对 MUE 的聚合干扰；最重要的是，约束 (14g) 施加公平性要求，即 D2D 用户的公平性指数 $J(R)$ 需保持在预定阈值 $F_{\rm th}\in[0,1]$ 以上。

**采用启发式方法的动机：** (P1) 的表述带来巨大的计算挑战，主要源于两个因素。第一，与干扰是确定性的独占复用方案不同，我们的系统支持共享复用（如表 I 所示），允许多个 D2D 对复用同一 RB，这在 SINR 项分母中引入复杂的多对多干扰耦合，使可行域高度非凸。第二，约束 (14g) 中的公平性指数是数据速率的分式、非凸函数，与总 EE 目标相冲突。

因此，(P1) 是非凸的混合整数非线性规划（MINLP）问题，已知为 NP 难问题。求全局最优解需要指数复杂度，对实时 UAV 辅助网络而言不可承受。这种数学上的难处理性要求一种高效、低复杂度的解法。因此，我们不去尝试通过代价高昂的穷举搜索求解 (P1)，而是提出多信道速率公平（MCRF）算法。MCRF 采用贪心启发式策略：通过动态优先处理历史速率较低的用户，满足约束 (14g) 的公平性意图，从而得到适合动态 AGIHN 环境的高质量次优解。

## V. 所提多信道速率公平（MCRF）分配

本节先介绍问题转化与所提 MCRF 方法的整体框架；随后给出 D2D 用户与 MUE 之间的若干预处理信道增益表达式，以便理解后续各小节的详细算法；接着阐述 MCRF 框架中的重新关联方案；之后描述 MCRF 方法的详细流程；最后讨论所提设计的优势与收益。

### A. 问题转化与 MCRF 框架

为简化数学上难以处理的联合优化问题 (P1)，我们采用启发式近似：把资源分配与动态功率控制解耦。具体地，为每个 D2D 用户在所有可用信道上分配固定相等的发射功率

$$
P^D_{u,k}=\frac{P_{\max}}{K}.
$$

该假设均匀分配功率，降低了信令开销与计算复杂度。于是优化重点完全转向确定子信道分配指示符 $\alpha_{u,k}$。所提 MCRF 算法求解的简化资源分配问题 (P2) 表述如下：

$$
{\rm (P2)}:\quad
\max_{\alpha_{u,k}}\ EE^D \tag{15a}
$$
$$
\text{s.t.}\quad
\text{约束 (14b), (14c), (14e), (14f), (14g)},\qquad
P^D_{u,k}=\frac{P_{\max}}{K},\ \forall u,\ \forall k. \tag{15b}
$$

把 (15b) 中的不等式功率约束替换为等式约束后，计算上难以承受的联合优化被转化为可处理的整数规划问题。为在不依赖动态功率调整的前提下保护 MUE 免受聚合干扰，MCRF 依赖宏基站与 UAV 基站广播最大干扰容忍阈值（$I^{\max}_{n,k}$）。算法纳入严格的跨层干扰约束检查（图 3 中虚线框高亮部分），它充当频谱守门人：对每个候选 RB，计算对关联 MUE 的潜在聚合干扰；若把该 RB 分配给某 D2D 对会违反该严格容忍阈值，则立即剪除该候选 RB。

此外，由于所提框架支持共享频谱复用，多个 D2D 对可能复用同一 RB，导致严重的层内干扰。为解决这一点，框架作为分配后精化执行独立的 IA 策略：该策略动态撤销 SINR 较差 D2D 用户的分配，以严格保持共享该 RB 的其余 D2D 用户之间的传输质量与公平性。虽然这种等功率近似相较理想联合优化会在理论峰值吞吐量上带来轻微损失，但它保证了稳健的 MUE 保护、有效抑制了 D2D 层内干扰、确保了严格的用户公平性，并保持适合在动态 AGIHN 场景中实时执行的低多项式复杂度。

**图 3：** 所提 MCRF 算法流程图。

速率公平分配算法在保证 MUE 服务质量（QoS）的同时维持 D2D 用户间的公平性，适用于单信道与多信道两类场景。单信道场景作为基线与特例：单个资源块只能被一个 D2D 用户复用一次。多信道场景中，不同 D2D 用户可以多次复用单个资源块，以提升系统频谱效率、增加系统容量；此外还纳入干扰避免策略以处理 D2D 用户之间的干扰问题。

### B. 预处理

为提升后续资源分配算法中干扰与链路计算的效率，本小节先定义若干预处理信道增益表达式。

首先，为简化 D2D 对 MUE 干扰的计算，预先定义 $g^{D2M}_{u,n,k}$，它表示第 $u$ 个 D2D 对在资源块 $k$ 上传输时对第 $n$ 个 MUE 的干扰信道增益，计算如下：

$$
g^{D2M}_{u,n,k}
=\delta_{n,B}g^{D2B}_{u,k}
+\sum_{v=1}^{N_V}\delta_{n,v}g^{D2V}_{u,v,k}. \tag{16}
$$

其次，为便于计算 MUE 的信号传输路径增益，定义 $\bar{g}^{M2B}_{n,k}$ 为第 $n$ 个 MUE 与其关联基站（MBS 或 UAV）在资源块 $k$ 上的有效信道增益：

$$
\bar{g}^{M2B}_{n,k}
=\delta_{n,B}g^{M2B}_{n,k}
+\sum_{v=1}^{N_V}\delta_{n,v}g^{M2V}_{n,v,k}, \tag{17}
$$

其中 $g^{M2B}_{n,k}$ 是第 $n$ 个 MUE 与 MBS 在资源块 $k$ 上的信道增益，$g^{M2V}_{n,v,k}$ 是第 $n$ 个 MUE 与第 $v$ 个 UAV 在资源块 $k$ 上的信道增益。

本研究聚焦 D2D 用户的资源分配策略，因此取 $N_M=K$ 以简化系统模型，避免考虑 MUE 间干扰。首先，每个 MUE 决定连接 UAV 还是 MBS，选择准则为最大化平均信道增益，即 $\max\left(\sum_{k=1}^{K}\bar{g}^{M2B}_{n,k}\right)$。接着，对每个资源块 $k$ 选出一个 MUE $n$，置 $\alpha_{n,k}=1$，并把该 MUE 从候选集合中移除。如此，每个 MUE 分得一个专用资源块，MUE 之间不存在相互干扰。

### C. 单信道情形

单信道速率公平资源分配策略可分为两步：

- **第 1 步：** 每个 D2D 对依次选择一个资源块（$k^*$），选择准则是最大化 D2D 信号传输信道增益与使用第 $k^*$ 个资源块的全部 MUE 的总干扰信道增益之比。具体地，对第 $u$ 个 D2D 对，选择为

$$
k^*=\arg\max_{k\in\Phi_u}
\frac{g^{D2D}_{u,k}}{\sum_{n=1}^{N_M}\alpha_{n,k}I^{D2M}_{u,n,k}}
$$
$$
\text{s.t.}\quad
\sum_{n=1}^{N_M}\alpha_{n,k}I^{D2M}_{u,n,k}
\le\sum_{n=1}^{N_M}\alpha_{n,k}I^{\max}_{n,k}, \tag{18}
$$

其中 $\Phi_u$ 是第 $u$ 个 D2D 对的可用资源块集合，$\alpha_{n,k}$ 是第 $n$ 个 MUE 在第 $k$ 个 RB 上的分配状态，$I^{D2M}_{u,n,k}$ 是第 $u$ 个 D2D 对在第 $k$ 个资源块上对第 $n$ 个 MUE 造成的干扰，$I^{\max}_{n,k}$ 是第 $n$ 个 MUE 的最大可容忍干扰，可计算为

$$
I^{\max}_{n,k}=\frac{P^M_{n,k}g^{M2B}_{n,k}}{\gamma_{\rm th}}. \tag{19}
$$

该过程持续到所有用户完成一轮选择。

- **第 2 步：** 选出当前系统传输容量最低的 D2D 对（$u^*$），允许其优先选择资源块（$k^*$）。选择准则仍为

$$
k^*=\arg\max_{k\in\Phi_{u^*}}
\frac{g^{D2D}_{u^*,k}}{\sum_{n=1}^{N_M}\alpha_{n,k}I^{D2M}_{u^*,n,k}}
$$
$$
\text{s.t.}\quad
\sum_{n=1}^{N_M}\alpha_{n,k}I^{D2M}_{u^*,n,k}
\le\sum_{n=1}^{N_M}\alpha_{n,k}I^{\max}_{n,k}, \tag{20}
$$

其中 $\Phi_{u^*}$ 是第 $u^*$ 个 D2D 对的可用资源块集合，选择准则与第 1 步相同。注意算法 1 第 23 行的操作会把所选资源块从所有 D2D 对（$\forall u$）的可用资源块集合（$\Phi_u$）中移除，确保所选 RB 不会同时分配给多个 D2D 对。第 2 步持续到无法再分配任何资源块为止。

这两步确保所选资源块维持 MUE 的传输质量。第 1 步中每个 D2D 对选择一个资源块；第 2 步中优先考虑系统传输容量最低的 D2D 对。该途径有效提升了单信道场景下的整体系统性能。详细的单信道速率公平算法见算法 1。

**算法 1　单信道速率公平（SCRF）算法**

输入：D2D 用户数 $N_D$、蜂窝用户数 $N_M$、RB 数 $K$、CSI、阈值 $I^{\max}_{n,k}$

输出：分配矩阵 $\mathbf A=[\alpha_{u,k}]$

1. 初始化：未分配用户 $\Omega^{\rm U}\leftarrow\{1,\dots,N_D\}$，对所有 $u$ 置可用 RB $\Phi_u\leftarrow\{1,\dots,K\}$，$\alpha_{u,k}\leftarrow0$，$I^{\rm cur}_{n,k}\leftarrow0,\forall u,k$；// 第 1 步：顺序选择
2. **foreach** 用户 $u\in\{1,\dots,N_D\}$ **do**
3. 　$k^*\leftarrow\arg\max_{k\in\Phi_u}\left(\dfrac{g^{D2D}_{u,k}}{\sum_{n=1}^{N_M}\alpha_{n,k}g^{D2M}_{u,n,k}}\right)$；
4. 　计算干扰：$I^{\rm temp}\leftarrow I^{\rm cur}_{n,k^*}+P^D_{u,k^*}g^{D2M}_{u,n,k^*}$；
5. 　**while** $I^{\rm temp}>I^{\max}_{n,k^*}$ 且 $\Phi_u\ne\varnothing$ **do**
6. 　　$\Phi_u\leftarrow\Phi_u\setminus\{k^*\}$；
7. 　　按最大比值准则从 $\Phi_u$ 重新选择 $k^*$；
8. 　**end while**
9. 　**if** 找到有效 $k^*$ **then**
10. 　　$\alpha_{u,k^*}\leftarrow1$；$I^{\rm cur}_{n,k^*}\leftarrow I^{\rm temp}$；// 全局移除（独占接入）
11. 　　$\Phi_j\leftarrow\Phi_j\setminus\{k^*\},\forall j\in\{1,\dots,N_D\}$；
12. 　**end if**
13. 　**if** $\Phi_u=\varnothing$ **then**
14. 　　$\Omega^{\rm U}\leftarrow\Omega^{\rm U}\setminus\{u\}$；
15. 　**end if**
16. **end for**
17. // 第 2 步：公平感知再分配
18. 计算全部 $u,k$ 的 $\gamma^D_{u,k}$ 与 $C^D_{u,k}$；
19. **while** $\Omega^{\rm U}\ne\varnothing$ **do**
20. 　$u^*\leftarrow\arg\min_{u\in\Omega^{\rm U}}\sum_{k=1}^{K}\alpha_{u,k}C^D_{u,k}$；
21. 　在 $\Phi_{u^*}$ 中为 $u^*$ 寻找满足约束的最佳 RB $k^*$；
22. 　**if** 找到有效 $k^*$ **then**
23. 　　$\alpha_{u^*,k^*}\leftarrow1$；更新 $I^{\rm cur}_{n,k^*}$；$\Phi_j\leftarrow\Phi_j\setminus\{k^*\},\forall j\in\{1,\dots,N_D\}$；
24. 　**else**
25. 　　$\Omega^{\rm U}\leftarrow\Omega^{\rm U}\setminus\{u^*\}$；
26. 　**end if**
27. 　更新 $\gamma^D_{u,k},C^D_{u,k}$；
28. **end while**
29. **return** $\mathbf A$

> **原文疑点：** 算法 1 第 3 行（及算法 2 第 3 行）的比值分母写作干扰信道增益 $g^{D2M}_{u,n,k}$，而正文式 (18)/(21) 同一比值使用干扰功率 $I^{D2M}_{u,n,k}=\alpha_{u,k}P^D_{u,k}g^{D2M}_{u,n,k}$；二者相差发射功率与分配状态因子，疑为原文记号简写或不一致。本译按原文照录并加注。

### D. 多信道情形

多信道情形下的资源分配策略与单信道类似，但此时多个 D2D 用户可以复用单个资源块。多信道速率公平资源分配可分为两步：

- **第 1 步：** 每个 D2D 用户依次选择一个资源块（$k^*$），选择准则基于 D2D 信号传输信道增益与使用第 $k^*$ 个资源块的全部 MUE 的总干扰信道增益之比的最大值。具体地，对第 $u$ 个 D2D 对，选择为

$$
k^*=\arg\max_{k\in\Phi_u}
\frac{g^{D2D}_{u,k}}{\sum_{n=1}^{N_M}\alpha_{n,k}I^{D2M}_{u,n,k}}
$$
$$
\text{s.t.}\quad
\sum_{n=1}^{N_M}\alpha_{n,k}\left(I^{\rm cur}_{n,k}+I^{D2M}_{u,n,k}\right)
\le\sum_{n=1}^{N_M}\alpha_{n,k}I^{\max}_{n,k}, \tag{21}
$$

其中 $\Phi_u$ 是第 $u$ 个 D2D 对的可用资源块集合，$\alpha_{n,k}$ 是第 $n$ 个 MUE 在第 $k$ 个 RB 上的分配状态，$I^{\rm cur}_{n,k}$ 是第 $k$ 个 RB 上来自已分配 D2D 对的当前聚合干扰，$I^{D2M}_{u,n,k}$ 是第 $u$ 个 D2D 对在第 $k$ 个资源块上对第 $n$ 个 MUE 造成的干扰，$I^{\max}_{n,k}$ 是第 $n$ 个 MUE 的最大可容忍干扰，可由下式得到：

$$
I^{\max}_{n,k}=\frac{P^M_{n,k}g^{M2B}_{n,k}}{\gamma_{\rm th}}. \tag{22}
$$

该过程持续到所有用户完成一轮选择。

**算法 2　多信道速率公平（MCRF）算法**

输入：D2D 用户数 $N_D$、蜂窝用户数 $N_M$、RB 数 $K$、CSI、阈值 $I^{\max}_{n,k}$

输出：分配矩阵 $\mathbf A=[\alpha_{u,k}]$

1. 初始化：$\Omega^{\rm U}\leftarrow\{1,\dots,N_D\}$，对所有 $u$ 置 $\Phi_u\leftarrow\{1,\dots,K\}$，$\alpha_{u,k}\leftarrow0$，$I^{\rm cur}_{n,k}\leftarrow0,\forall u,k$；// 第 1 步：初始顺序选择
2. **foreach** 用户 $u\in\{1,\dots,N_D\}$ **do**
3. 　$k^*\leftarrow\arg\max_{k\in\Phi_u}\left(\dfrac{g^{D2D}_{u,k}}{\sum_{n=1}^{N_M}\alpha_{n,k}g^{D2M}_{u,n,k}}\right)$；
4. 　计算干扰：$I^{\rm temp}\leftarrow I^{\rm cur}_{n,k^*}+P^D_{u,k^*}g^{D2M}_{u,n,k^*}$；
5. 　**while** $I^{\rm temp}>I^{\max}_{n,k^*}$ 且 $\Phi_u\ne\varnothing$ **do**
6. 　　$\Phi_u\leftarrow\Phi_u\setminus\{k^*\}$；重新选择 $k^*$；
7. 　**end while**
8. 　**if** 找到有效 $k^*$ **then**
9. 　　$\alpha_{u,k^*}\leftarrow1$；$I^{\rm cur}_{n,k^*}\leftarrow I^{\rm temp}$；// 局部移除（允许复用）
10. 　　$\Phi_u\leftarrow\Phi_u\setminus\{k^*\}$；
11. 　**end if**
12. 　**if** $\Phi_u=\varnothing$ **then**
13. 　　$\Omega^{\rm U}\leftarrow\Omega^{\rm U}\setminus\{u\}$；
14. 　**end if**
15. **end for**
16. // 第 2 步：迭代公平性增强
17. 计算 $\gamma^D_{u,k}$ 与 $C^D_{u,k}$；
18. **while** $\Omega^{\rm U}\ne\varnothing$ **do**
19. 　$u^*\leftarrow\arg\min_{u\in\Omega^{\rm U}}\sum_{k=1}^{K}\alpha_{u,k}C^D_{u,k}$；
20. 　在 $\Phi_{u^*}$ 中为 $u^*$ 寻找满足约束的最佳 RB $k^*$；
21. 　**if** 找到有效 $k^*$ **then**
22. 　　$\alpha_{u^*,k^*}\leftarrow1$；更新 $I^{\rm cur}_{n,k^*}$；$\Phi_{u^*}\leftarrow\Phi_{u^*}\setminus\{k^*\}$；更新 $C^D_{u^*}$；
23. 　**else**
24. 　　$\Omega^{\rm U}\leftarrow\Omega^{\rm U}\setminus\{u^*\}$；
25. 　**end if**
26. **end while**
27. **return** $\mathbf A$

- **第 2 步：** 选出当前系统传输容量最低的 D2D 用户（$u^*$），允许其优先选择资源块（$k^*$）。选择准则仍为

$$
k^*=\arg\max_{k\in\Phi_{u^*}}
\frac{g^{D2D}_{u^*,k}}{\sum_{n=1}^{N_M}\alpha_{n,k}I^{D2M}_{u^*,n,k}}
$$
$$
\text{s.t.}\quad
\sum_{n=1}^{N_M}\alpha_{n,k}\left(I^{\rm cur}_{n,k}+I^{D2M}_{u^*,n,k}\right)
\le\sum_{n=1}^{N_M}\alpha_{n,k}I^{\max}_{n,k}, \tag{23}
$$

其中 $\Phi_{u^*}$ 是第 $u^*$ 个 D2D 对的可用资源块集合，选择准则与第 1 步相同。注意算法 2 第 22 行的操作与单信道情形不同：多信道情形下它只从第 $u^*$ 个 D2D 对的可用资源块集合（$\Phi_{u^*}$）中移除所选资源块，允许其他 D2D 用户复用该资源块。第 2 步持续到无法再分配任何资源块为止。

多信道速率公平资源分配算法确保所选资源块维持 MUE 的传输质量：第 1 步中每对 D2D 用户选择一个资源块，第 2 步中优先考虑系统传输容量最低的 D2D 用户。该途径有效提升了多信道场景下的整体系统性能。详细的多信道速率公平算法见算法 2。

### E. 干扰避免策略

干扰避免策略旨在防止 D2D 用户之间的干扰，其原理如下：若某个 D2D 用户对在特定资源块上的 SINR 低于 SINR 阈值，则撤销该用户对在该资源块上的分配状态。该过程持续到分配到某资源块的所有 D2D 用户对满足 SINR 阈值或被移除为止。详细的干扰避免策略如下：

- **第 1 步：** 对每个资源块 $k$，检查每个 D2D 对 $u$ 的分配状态。若分配状态 $\alpha_{u,k}=1$ 且 SINR $\gamma^D_{u,k}<\gamma_{\rm th}$，则把该 D2D 对 $u$ 加入资源块 $k$ 的不合格用户集合 $\Omega^{\rm U}_k$。
- **第 2 步：** 当不合格用户集合 $\Omega^{\rm U}_k$ 非空时，检查不合格用户数量：
  - 若 $\Omega^{\rm U}_k$ 中只有一个不合格用户 $u^*$，则通过置 $\alpha_{u^*,k}=0$ 撤销其在资源块 $k$ 上的分配状态；更新全部 D2D 对的 SINR 与容量，并把 $u^*$ 从 $\Omega^{\rm U}_k$ 移除。
  - 若 $\Omega^{\rm U}_k$ 中有多个不合格用户，则选择总容量与 SINR 之比最大的用户 $u^*$，撤销其在资源块 $k$ 上的分配状态，更新全部 D2D 对的 SINR 与容量，并把 $u^*$ 从 $\Omega^{\rm U}_k$ 移除；随后检查 $\Omega^{\rm U}_k$ 中剩余的不合格用户，移除其中现已满足 SINR 阈值者。
  重复该过程，直到不合格用户集合 $\Omega^{\rm U}_k$ 为空。

干扰避免的详细流程见算法 3。

**算法 3　干扰避免（IA）策略**

输入：初始分配 $\mathbf A$、SINR 阈值 $\gamma_{\rm th}$

输出：精化后的分配 $\mathbf A=[\alpha_{u,k}]$

1. **foreach** RB $k\in\{1,\dots,K\}$ **do**　// 识别违反 SINR 阈值的用户
2. 　$\Omega^{\rm U}_k\leftarrow\{u\mid\alpha_{u,k}=1\ \text{且}\ \gamma^D_{u,k}<\gamma_{\rm th}\}$；
3. 　**while** $\Omega^{\rm U}_k\ne\varnothing$ **do**
4. 　　**if** $|\Omega^{\rm U}_k|==1$ **then**
5. 　　　$u^*\leftarrow\Omega^{\rm U}_k$ 中的唯一元素；
6. 　　**else**　// 移除容量–SINR 比最高的用户
7. 　　　$u^*\leftarrow\arg\max_{u\in\Omega^{\rm U}_k}\left(\dfrac{\sum_{k'}\alpha_{u,k'}C^D_{u,k'}}{\gamma^D_{u,k}}\right)$；
8. 　　**end if**
9. 　　$\alpha_{u^*,k}\leftarrow0$；从 $\Omega^{\rm U}_k$ 移除 $u^*$；
10. 　　更新资源块 $k$ 上剩余用户的 SINR 与容量；// 重新检查剩余用户资格
11. 　　**foreach** $u\in\Omega^{\rm U}_k$ **do**
12. 　　　**if** $\alpha_{u,k}\gamma^D_{u,k}\ge\gamma_{\rm th}$ **then**
13. 　　　　$\Omega^{\rm U}_k\leftarrow\Omega^{\rm U}_k\setminus\{u\}$；// 用户已恢复
14. 　　　**end if**
15. 　　**end for**
16. 　**end while**
17. **end for**
18. **return** $\mathbf A$

## VI. 复杂度分析

本节分析所提算法的计算复杂度，并与新兴的基于学习策略作定性比较，旨在说明所提启发式在性能与计算效率之间取得了有利平衡，尤其适用于动态 UAV 辅助环境。

### A. 计算复杂度与运行时间分析

所提 MCRF 方案的计算代价主要由两个顺序阶段主导：迭代资源分配与干扰避免（IA）策略。首先，在资源分配阶段，算法为每个 D2D 对迭代选择最合适的 RB。对具有 $N_D$ 个 D2D 对与 $K$ 个资源块的系统，构造偏好列表涉及计算对 $N_M$ 个 MUE 的干扰泄漏，复杂度为 $O(N_MK)$。由于算法依据历史速率为用户动态排序，并可能在每次迭代更新候选列表，为全部 $N_D$ 个用户分配资源的最坏情形复杂度由 $O(N_DN_MK+N_D^2K)$ 主导。其次，IA 阶段对每个 RB 校验 SINR 要求。最坏情形下多个用户共享同一 RB，策略必须检查 SINR 条件，并可能迭代地移除容量–SINR 比最大的用户。在 $K$ 个资源块上检查并更新 $N_D$ 个用户的状态需要 $O(N_D^2K)$ 次操作。因此，所提框架的整体计算复杂度是这两个阶段之和，可表示为

$$
O_{\rm total}=O\left(N_DN_MK+N_D^2K\right). \tag{24}
$$

由于 $N_D$、$N_M$ 与 $K$ 均为有限参数，所提算法具有多项式时间复杂度。这表明该解高度可扩展，可在标准处理器上实现，而无需计算密集的硬件。

**实际运行时间评估与实用比较：** 为验证所提算法的实时可行性，我们在标准硬件工作站（AMD Ryzen 9 5950X CPU、64 GB RAM）上用 MATLAB 测量实际执行时间，未使用硬件流水线或并行处理优化。对 $N_D=50$ 个 D2D 对、$K=50$ 个子信道的代表性网络规模，每个分配快照的平均执行时间为 258.48 ms；对 $N_D=100$、$K=50$ 的更密集网络，运行时间增至 769.02 ms，这与理论推导的多项式复杂度界一致。

在实际蜂窝系统（如 LTE 与 5G NR）中，典型基带调度时隙（即传输时间间隔 TTI）严格限制在 1 ms 以内。虽然测得的软件运行时间超过该间隔，但必须认识到软件层面仿真与实际硬件实现之间的根本区别。真实资源分配算法并非在通用 CPU 上用解释型语言执行，而是综合到专用硬件加速器（如现场可编程门阵列 FPGA 或专用集成电路 ASIC）上。在专用并行硬件上执行复杂迭代算法可将处理时延降低若干数量级，达到微秒（μs）级。鉴于所提 MCRF 算法已被证明具有低多项式复杂度，它完全可以运行在标准 1 ms 调度时隙内，这表明其在高动态 AGIHN 环境中进行实时逐帧资源分配的可行性。

### B. 与基于学习途径的比较

为论证启发式途径的实用性，我们把它与最新的深度强化学习（DRL）方案（如 [26]）对比，如表 I 所示。虽然 DRL 方法理论上可以逼近最优策略，但在动态 AGIHN 中面临关键局限：

- **训练开销与免训练：** DRL 智能体需要大量离线训练回合与频繁在线微调才能收敛到稳定策略。在 UAV 临时部署的救灾任务中，训练的时间成本可能超过任务的关键响应窗口。相反，我们的 MCRF 算法免训练且确定，可立即部署。
- **对拓扑变化的适应性：** UAV 的高移动性导致信道增益与干扰模式快速变化。基于学习的模型往往对这类分布漂移敏感，拓扑变化时可能需要重训练；而我们的基于优化的启发式可实时执行（每个时隙毫秒量级），确保资源分配始终反映当前瞬时 CSI。

总之，虽然基于学习的方法为静态场景提供了有前景的方向，但所提 MCRF 算法为时延敏感、移动感知的 UAV 网络提供了更稳健、低时延的解决方案。

## VII. 仿真结果

### A. 仿真环境

本研究采用的仿真参数汇总于表 III，其配置依据 [23], [28], [31] 中的标准。我们考虑半径为 500 m 的单一宏小区环境；系统包含 $N_M=50$ 个 MUE，D2D 对数量 $N_D$ 在 10 到 100 之间变化，以评估不同密度下的系统性能。除非另有说明，D2D 对默认数量设为 10。

> **原文疑点：** 原文此处写作“仿真参数汇总于 Table VII-A”，但全文表格仅有表 I、II、III，并无“Table VII-A”；应为表 III。本译按上下文理解为表 III，并照录原文表述于此说明。

在信道模型方面，MUE 链路（蜂窝链路）的路损计算为 $128.1+37.6\log_{10}(d_{\rm MUE})$，其中 $d_{\rm MUE}$ 为以千米计的距离；D2D 链路的路损模型为 $148+40\log_{10}(d_{\rm D2D})$。小尺度衰落用 Rayleigh 分布建模。

每个资源块（RB）的带宽为 180 kHz，热噪声功率谱密度设为 −174 dBm/Hz。每个设备的最大发射功率限制为 23 dBm。静态电路功率消耗（$P^{SC}$）与功率放大器效率（原文记作 $\xi$）分别设为 100 mW 与 0.38。QoS 要求的 SINR 阈值设为 3 dB。全部仿真用 MATLAB 完成，结果在 1000 次 Monte Carlo 迭代上取平均，以保证统计精度。

> **原文疑点：** 表 III 把“PA efficiency of each Device”的符号列为 $\xi$（值 0.38）；但正文称“功率放大器效率的倒数记为 $\eta$”，并在式 (8)–(9) 中使用 $\eta$。若 $\eta$ 为效率倒数，则 $\eta=1/0.38\approx2.63$，而表 III 的 0.38 对应“效率”本身。疑为原文符号不统一（$\xi$ 与 $\eta$），本译照录并加注。

**表 III：** 仿真参数。

| 参数 | 符号 | 取值 |
|---|---|---|
| 宏小区半径 | $R_M$ | 500 m |
| MU 数量 | $N_M$ | 50 |
| D2D 对数量 | $N_D$ | 10, 20, …, 100 |
| 资源块数量 | $k$ | 50 |
| D2D 距离 | $d_{\rm D2D}$ | 10 m, 20 m, …, 100 m |
| MUE 与 BS 距离 | $d_{\rm MUE}$ | 1 m, 2 m, …, 500 m |
| RB 带宽 | $W_{\rm RB}$ | 180 kHz |
| 噪声功率谱密度 | $N_0$ | −174 dBm/Hz |
| MUE 链路路损模型 | $g^{M2B}_{n,k}$ | $128.1+37.6\log(d_{\rm MUE}\,[{\rm km}])$ |
| D2D 链路路损模型 | $g^{D2D}_{u,k}$ | $148+40\log(d_{\rm D2D}\,[{\rm km}])$ |
| 设备最大功率 | $P_{\max}$ | 23 dBm |
| 信道衰落模型 | — | Rayleigh |
| SINR 阈值 | $\gamma_{\rm th}$ | 3 dB |
| 设备静态电路功率 | $P^{SC}_u,\ P^{SC}_n$ | 100 mW |
| 每个设备的 PA 效率 | $\xi$ | 0.38 |

**关于用户拓扑的说明：** 值得注意的是，虽然所提 MCRF 算法设计上可处理真实部署中的任意用户位置，但在仿真中我们有意把 D2D 对间距离（$d_{\rm D2D}$）设为 10 m 至 100 m 的固定值。这一受控设置是一种敏感性分析，用于在不受随机移动模型引入的方差影响的前提下，严格评估邻近程度对公平性与吞吐量等系统指标的影响。$d_{\rm D2D}$ 变化的具体影响在第 VII-C1 节中显式评估与讨论。

### B. 对比方法

现有文献表明资源分配存在一个基本折中：Max-SINR 算法以牺牲公平性为代价最大化系统容量，而轮询（Round Robin，RR）算法保证公平性但吞吐量次优。在仿真中，我们在两种不同复用模式下把所提策略与这些传统方案作基准比较：

- **单信道轮询（SCRR）：** 以公平为中心的基线，D2D 用户按序基于信漏比选择最合适的 RB，确保对 MUE 影响最小。
- **单信道 Max-SINR（SC-Max-SINR）：** 以吞吐量为中心的基线，在 MUE 干扰约束下贪心地把每个 RB 分配给信道条件最好的 D2D 用户。
- **所提单信道速率公平（SCRF）：** 一种平衡途径，旨在弥合 SCRR 与 SC-Max-SINR 之间的差距，在单 RB 场景中确保公平的资源分配同时保持高频谱效率。
- **多信道轮询（MCRR）：** 把 SCRR 扩展到允许 RB 聚合，采用顺序选择并配合干扰避免（IA）算法，以管理多 RB 使用带来的更高干扰。
- **多信道 Max-SINR（MC-Max-SINR）：** 把 SC-Max-SINR 扩展到支持多 RB 分配，对每个 RB 优先选择 SINR 最高的用户，并利用 IA 策略滤除造成严重干扰的用户。
- **所提多信道速率公平（MCRF）：** 我们的综合方案，支持共享频谱复用。它把公平性准则与 IA 策略结合，允许多个 D2D 用户高效复用于同一 RB，在满足公平性要求的同时最大化总 EE。

### C. 性能评估

所有对比方法的性能用以下指标评估：(a) D2D 用户的能效（EE）；(b) D2D 用户的 Jain 公平性指数（JFI）[30]；(c) D2D 用户的吞吐量；(d) MUE 的吞吐量；(e) 系统吞吐量；均取平均情形。此外，分析 D2D 用户间距离与 D2D 对数量对上述性能指标的影响。

**1）D2D 用户间距离的影响：** 图 4 展示 D2D 对间传输距离（$d_{\rm D2D}$）从 10 m 增至 100 m 时的系统性能。由仿真结果得到的分析与定量洞见如下：

- **能效与信道硬化（图 4(a)）：** 如图 4(a) 所示，能效（EE）随 $d_{\rm D2D}$ 增大单调下降。这是路损的直接物理结果：更大距离需要更高发射功率来支撑不断降低的数据速率。值得注意的是，在单信道场景中，所提 SCRF 算法显示出显著优势，相较传统 SCRR 方案提升约 397%。在多信道情形下，MCRF 与 MC-Max-SINR 保持竞争力，表明它有效把频谱资源只分配给能维持可行容量–功率比的链路。
> **原文疑点：** 摘要与结论称“与传统单信道独占复用方案相比，MCRF 使 D2D 能效与吞吐量分别提升约 397% 与 542%”；但正文 §VII-C1 明确指出 397% 是**单信道 SCRF** 相对 SCRR 的能效优势（图 4(a)），而 542% 是**多信道 MCRF** 相对**单信道 SCRF 基线**的吞吐量增益（图 4(c)，达到 737.1 Mbps）。摘要把两个归属不同基线的数字并列归因于 MCRF，属表述口径混用。本译在摘要与结论处按原文照录，并在此说明。

- **公平性韧性（图 4(b)）：** 图 4(b) 突显了公平性表现的鲜明对比。随着 D2D 距离增大，边缘用户的链路质量退化，使其易陷于资源饥饿。传统 MC-Max-SINR 方案（黑色曲线）的公平性急剧下降，在 $d_{\rm D2D}=100$ m 时跌至 0.45，因为它为实现和速率最大化而放弃弱用户。相反，所提 MCRF（红色曲线）在全范围内保持较高的公平性指数（JFI > 0.6）。这种稳健性证实速率公平启发式成功防止了“富者愈富”现象，即使在较差信道条件下也能确保公平接入。
- **吞吐量折中（图 4(c)）：** 结果凸显了共享复用的收益。具体地，在 $d_{\rm D2D}=10$ m 时，多信道 MCRF 方案相较单信道 SCRF 基线取得 542% 的巨幅吞吐量增益（达到 737.1 Mbps）。虽然 MCRF 的吞吐量略低于 MC-Max-SINR（在 $d_{\rm D2D}=50$ m 处约有 3.04% 的边际差距），但这是有意的设计选择：这一微小牺牲换来公平性 7.43% 的显著提升，从而有效最大化总体社会福利，而非个体峰值。
- **系统动态与 MUE 保护策略（图 4(d) 与 4(e)）：** 最关键的洞见体现在 D2D 与 MUE 吞吐量的相互作用上。在短距离区间（$d_{\rm D2D}<50$ m），D2D 链路很强，其高容量主导系统和速率；然而在长距离区间（$d_{\rm D2D}\ge80$ m）出现区间转变：随着 D2D 链路条件恶化，所提 IA 策略充当严格频谱剪枝器，自动从失效的 D2D 链路撤销资源。
- **洞见小结：** 如图 4(d) 所示，这种剪枝效应使 MCRF 方案的 MUE 吞吐量显著升至约 55 Mbps，而 Max-SINR 方案因持续调度干扰性 D2D 用户而把 MUE 压制在约 18 Mbps 的低水平。这种 3 倍的 MUE 保护提升使 MCRF 的总系统吞吐量在 $d_{\rm D2D}=100$ m 处与 Max-SINR 收敛并最终超越（图 4(e)）。这验证了：在次级链路较弱的场景中，优先保护主网络（MUE）能带来更高的全网频谱效率。

**图 4：** D2D 用户间距离对 (a) D2D 用户 EE、(b) D2D 用户 JFI、(c) D2D 用户吞吐量、(d) MUE 吞吐量、(e) 系统吞吐量的影响（横轴 $d_{\rm D2D}=10$–100 m）。

**2）D2D 对数量的影响：** 图 5 研究 D2D 对数量（$N_D$）从 10 变化到 100 时的系统性能，揭示不同拥塞水平下的网络行为。可得到如下关键观察：

- **能效与多用户分集（图 5(a)）：** 能效（EE）呈明显的先升后降趋势。起初，随着 $N_D$ 从 10 增至 30，EE 因多用户分集增益显著提升；但在 $N_D=30$ 附近出现饱和点。超过该点后，系统进入干扰受限区间，聚合干扰增长快于容量增益；此外，额外用户的固定电路功率消耗开始稀释整体效率。值得注意的是，MCRF 的 EE 略低于 MC-Max-SINR，这是为确保小区边缘用户连接性所付出的必要能量代价，反映了图 5(b) 中更优公平性的折中。
- **公平性对拥塞的鲁棒性（图 5(b)）：** 随着用户密度增大，资源竞争加剧。Max-SINR 方案因“赢者通吃”特性，其公平性指数（JFI）在 $N_D=100$ 时迅速跌至 <0.1；而所提 MCRF 算法表现出显著韧性，维持约 0.5 的 JFI。这证实速率公平启发式有效充当负载均衡器，即使在频谱高度拥塞时也能防止资源饥饿。
- **系统容量的可扩展性（图 5(c) 与 5(e)）：** 图 5(c) 表明多信道场景下 D2D 吞吐量随 $N_D$ 线性增长，验证了共享复用策略的有效性：允许多个 D2D 对复用于同一 RB，使系统容量不再被正交信道数量（$K$）硬性限制。虽然 MCRF 的吞吐量略低于 MCRR，但这一边际差距反映了为容纳弱用户所作的折中。因此，系统总吞吐量表现出极佳的可扩展性，可支撑大规模连接需求。
- **MUE 保护策略（图 5(d)）：** 图 5(d) 给出对干扰避免（IA）策略的关键验证。尽管 D2D 密度从 10 对激增至 100 对，所提方案下 MUE 的吞吐量几乎保持不变，约为 42 Mbps。这表明 IA 策略成功充当频谱守门人，把聚合干扰钳制在安全阈值 $I^{\max}_{n,k}$ 以下，从而确保主网络（MUE）有效隔离于次级 D2D 网络致密化之外。

**图 5：** D2D 对数量对 (a) D2D 用户 EE、(b) D2D 用户 JFI、(c) D2D 用户吞吐量、(d) MUE 吞吐量、(e) 系统吞吐量的影响（横轴 $N_D=10$–100）。

### D. 讨论与未来工作

虽然所提 MCRF 算法有效解决了共享复用资源分配问题并确保了公平性，但当前系统模型仍存在若干局限，值得进一步研究。

具体地，我们的仿真框架主要在简化信道模型下孤立评估资源分配逻辑的性能。在高动态 AGIHN 中，UAV 悬停高度、变化的 UAV 密度以及复杂 LoS/非 LoS 信道变化（如概率型空地路损模型）等具体 3D 属性会显著影响干扰模式。纳入这些精细 3D 信道模型将使性能评估更全面。

在未来的工作中，我们计划通过把等功率启发式替换为动态功率控制技术，并集成深度强化学习智能体来解决这些开放问题。这将使系统能够自适应管理复杂 3D LoS/NLoS 变化，并进一步提升 AGIHN 的实用性。

## VIII. 结论

本研究研究空天地一体化异构网络（AGIHN）中的上行资源分配问题，专门针对具有挑战性的共享复用场景：多个 D2D 对同时复用于同一资源块。为应对这种非正交共享造成的严重层内干扰，我们提出一种低复杂度的多信道速率公平（MCRF）算法，并结合启发式干扰避免（IA）策略。

与依赖独占复用或计算密集学习模型的传统途径不同，所提框架以免训练的方式在能效（EE）与公平性之间取得优异平衡，因而非常适合动态 UAV 环境。仿真结果表明，依复用模式不同呈现出明显的性能优势：与传统独占复用方案相比，所提 MCRF 算法利用频谱聚合把 D2D 能效与吞吐量分别显著提升约 397% 与 542%；相对多信道基准，它优化了效率–公平性折中，把公平性指数提升 7.43%。这些发现验证了所提策略有效释放了 AGIHN 中共享频谱接入的潜力，同时为主网络与次级网络都提供了稳健的 QoS 保障。

## 参考文献（英文原条目，按原文顺序）

[1] R. Nagarajan and N. M. V. Mohamad, “Energy efficient resource and power allocation for uplink underlay d2d communication in hetnet-based 5G network,” *EURASIP Journal on Wireless Communications and Networking*, no. 24, Apr. 2025.

[2] A. Prasad, A. Kunz, G. Velev, K. Samdanis, and J. Song, “Energy-efficient D2D discovery for proximity services in 3GPP LTE-advanced networks: ProSe discovery mechanisms,” *IEEE Veh. Technol. Mag.*, vol. 9, no. 4, pp. 40–50, Dec. 2014.

[3] W. Chen, X. Lin, J. Lee, A. Toskala, S. Sun, C. F. Chiasserini, and L. Liu, “5G-advanced toward 6G: Past, present, and future,” *IEEE J. Sel. Areas Commun.*, vol. 41, no. 6, pp. 1592–1619, Jun. 2023.

[4] 3GPP, “Feasibility study for proximity services (ProSe),” TR 22.803 V12.2.0, Jun. 2013.

[5] 3GPP, “Study on LTE device to device proximity services; radio aspects,” TR 36.843, V12.0.1, Jan. 2015.

[6] P. Mach, Z. Becvar, and T. Vanek, “In-band device-to-device communication in OFDMA cellular networks: A survey and challenges,” *IEEE Commun. Surveys Tuts.*, vol. 17, no. 4, pp. 1885–1922, Fourthquarter 2015.

[7] D. Gao, N. Xia, X. Liu, D. Wang, and M. Peng, “Mode switching and power allocation for relay-assisted cooperative device-to-device communications,” *IEEE Trans. Veh. Technol.*, vol. 72, no. 12, pp. 16 108–16 122, Dec. 2023.

[8] N. K. Jadav and S. Tanwar, “Whale optimization-based access control scheme in D2D communication underlaying cellular networks,” *IEEE Trans. Netw. Service Manag.*, vol. 21, no. 3, pp. 3416–3427, Jun. 2024.

[9] Y. Liu, Z. Qin, M. Elkashlan, Z. Ding, A. Nallanathan, and L. Hanzo, “Nonorthogonal multiple access for 5G and beyond,” *Proc. IEEE*, vol. 105, no. 12, pp. 2347–2381, Dec. 2017.

[10] X. Wang, T. Jin, L. Hu, and Z. Qian, “Energy-efficient power allocation and Q-learning-based relay selection for relay-aided D2D communication,” *IEEE Trans. Veh. Technol.*, vol. 69, no. 6, pp. 6452–6462, Jun. 2020.

[11] Z. Yan, X. Gu, and Z. Liu, “Performance analysis of nr sidelink and wi-fi coexistence networks in unlicensed spectrum,” *arXiv preprint arXiv:2501.17878*, 2025.

[12] G. V. Frangulea, P. Assimakopoulos, B. Bojović, and S. Lagén, “NR-U and Wi-Fi unlicensed spectrum sharing: Design challenges and solutions,” *Computer Communications*, vol. 237, p. 108143, May 2025.

[13] A. A. Dejen, Y. Wondie, and A. Førster, “Survey on D2D resource scheduling and power control techniques: State-of-art and challenges,” *EAI Endorsed Transactions on Mobile Communications and Applications*, vol. 7, no. 21, May 2022.

[14] T. Islam and C. Kwon, “Survey on the state-of-the-art in device-to-device communication: A resource allocation perspective,” *Ad Hoc Networks*, vol. 136, p. 102978, Nov. 2022.

[15] P. Zhao, L. Chen, Z. Jiang, M. Han, F. Yuan, A. Li, X. Jia, X. Fu, J. Han, and J. Han, “Energy-efficiency resource allocation for D2D communications under-laying uav networks,” in *The 13th International Conference on Computer Engineering and Networks*, Y. Zhang, L. Qi, Q. Liu, G. Yin, and X. Liu, Eds., Singapore, 2024.

[16] H. Pan, Y. Liu, G. Sun, P. Wang, and C. Yuen, “Resource scheduling for UAVs-aided D2D networks: A multi-objective optimization approach,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 5, pp. 4691–4708, May 2024.

[17] J. Deng and Q. Zhu, “Uav-assisted computation offloading and resource allocation algorithm based on D2D communication,” *Wireless Networks*, vol. 31, no. 7, pp. 4465–4481, Oct. 2025.

[18] K. Yang, J. Wu, X. Gao, X. Bu, and S. Guo, “Energy-efficient power control for device-to-device communications with max-min fairness,” in *IEEE 84th Vehicular Technology Conference (VTC-Fall)*, Montreal, QC, Canada, Sep. 2016.

[19] J. Hu, W. Heng, X. Li, and J. Wu, “Energy-efficient resource reuse scheme for D2D communications underlaying cellular networks,” *IEEE Commun. Lett.*, vol. 21, no. 9, pp. 2097–2100, Sep. 2017.

[20] J. Y. Pan, K. W. Chang, and H. W. Lin, “Uplink shared resource scheduling for device-to-device underlay communication with least transmission power resource selection and guaranteed link quality,” in *International Conference on Networking and Network Applications (NaNA)*, Hakodate, Japan, Jul. 2016.

[21] K. Muraoka, T. Ohtsuji, H. Aminaka, G. Motoyoshi, and Y. Matsunaga, “Scheduling for device-to-device communication considering spatial reuse and user fairness in public safety LTE,” in *IEEE 84th Vehicular Technology Conference (VTC-Fall)*, Montreal, QC, Canada, Sep. 2016.

[22] Z. Shen, J. G. Andrews, and B. L. Evans, “Adaptive resource allocation in multiuser OFDM systems with proportional rate constraints,” *IEEE Trans. Wireless Commun.*, vol. 4, no. 6, pp. 2726–2737, Nov. 2005.

[23] W. Jing, X. Wen, Z. Lu, Z. Hu, and T. Lao, “Radio resource allocation with proportional-fair energy efficiency guarantee for smallcell networks,” in *IEEE 27th Annual International Symposium on Personal, Indoor, and Mobile Radio Communications (PIMRC)*, Valencia, Spain, Sep. 2016.

[24] Y.-H. Xu, X. Liu, W. Zhou, and G. Yu, “Generative adversarial LSTM networks learning for resource allocation in UAV-served M2M communications,” *IEEE Wireless Commun. Lett.*, vol. 10, no. 7, pp. 1601–1605, Jul. 2021.

[25] A. R. V. C. and C. P. S., “Interference management and coverage probability enhancement in D2D underlay downlink cellular networks,” *IEEE Trans. Veh. Technol.*, vol. 74, no. 4, pp. 5843–5855, Apr. 2025.

[26] H. M. F. Noman, K. Dimyati, E. Hanafi, K. A. Noordin, and A. Abdrabou, “Federated multiagent DDQN-empowered joint optimization of mode selection and resource allocation in D2D-assisted 6g wireless networks,” *IEEE Internet Things J.*, vol. 12, no. 22, pp. 48 930–48 944, Nov. 2025.

[27] Y. Cai, S. Jin, W. Yu, X. Nie, L. Liang, and H. Liu, “Cooperative distributed resource allocation in heterogeneous networks with D2D communication,” *IEEE Trans. Veh. Technol.*, vol. 72, no. 12, pp. 16 426–16 437, Dec. 2023.

[28] L. Xiaoshuai, M. Lin, X. Yubin, and R. Shankaran, “Joint power control and proportional fair scheduling for d2d communication underlaying cellular networks,” in *IEEE 13th International Conference on Signal Processing (ICSP)*, Chengdu, China, Nov. 2016.

[29] R. I. Bor-Yaliniz, A. El-Keyi, and H. Yanikomeroglu, “Efficient 3-D placement of an aerial base station in next generation cellular networks,” in *IEEE International Conference on Communications (ICC)*, Kuala Lumpur, Malaysia, May 2016.

[30] R. K. Jain, D.-M. W. Chiu, and W. R. Hawe, “A quantitative measure of fairness and discrimination for resource allocation in shared computer systems,” Eastern Research Laboratory, Digital Equipment Corporation, Sep. 1984.

[31] H. Zhang, X. Chu, W. Zheng, and X. Wen, “Interference-aware resource allocation in co-channel deployment of OFDMA femtocells,” in *IEEE International Conference on Communications (ICC)*, Ottawa, ON, Canada, Jun. 2012.

**作者简介（原文文末）：** Chuan-Chi Lai（Member, IEEE）于 2017 年获台湾国立台北科技大学计算机科学与信息工程博士学位；在担任现职前，曾在国立交通大学与逢甲大学担任研究与教职；自 2024 年起任中正大学通信工程系助理教授。研究兴趣包括移动边缘计算、UAV 网络与无线通信人工智能。他曾获 2019 年台湾国科会博士后研究人员学术研究奖，以及 WOCC（2018、2021）与 ICUFN（2015）最佳论文奖。Ang-Hsun Tsai（Member, IEEE）于 2012 年获台湾国立交通大学通信工程博士学位；2022 年加入逢甲大学任助理教授，自 2025 年起任逢甲大学通信工程系副教授。当前研究兴趣包括异构网络（如 6G 移动网络、非地面网络、空中通信网络与抗灾通信网络）中的无线资源管理，也关注泛在连接、AI 驱动的通信系统与通感一体化技术。Shang-Long Wu 获中正大学通信工程系学士学位，目前在国立阳明交通大学网络工程研究所攻读硕士学位，研究兴趣包括算法设计、6G 无线网络与 AI 驱动应用。

**原文插图：** 原 PDF 中的图 1–5 未重传至本页，仅保留中文图注与图中关键数值；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.24365v1（cs.NI，15 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–VIII 节（含 II-A–C、III-A–B、V-A–E、VI-A–B、VII-A–D 等全部小节）、结论、全部图注（图 1–5）、表 I–III（逐格转录）、算法 1–3（逐步中文表述）、公式 (1)–(24)、31 条参考文献英文原条目与文末三位作者简介；原文无附录。**逐句终校未做**：表 I 的定性对比、表 II 的 28 行符号定义、表 III 的仿真参数均用 PDF 页面渲染逐格核对；式 (3)–(5)、(14)、(18)–(23) 与算法 1–3 的步号亦对照页面渲染核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 4 处“原文疑点”为原文内部不一致：§VII-A 的“Table VII-A”并不存在（应为表 III）；表 III 把功放效率记为 $\xi=0.38$，而正文称“效率倒数记为 $\eta$”并在式 (8)–(9) 使用 $\eta$；算法 1/2 第 3 行比值分母用 $g^{D2M}$ 而式 (18)/(21) 用 $I^{D2M}$；摘要/结论把来源基线不同的 397%（SCRF 对 SCRR 的能效优势）与 542%（MCRF 对 SCRF 的吞吐增益）并列归因于 MCRF。均按原文照录并加注，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
