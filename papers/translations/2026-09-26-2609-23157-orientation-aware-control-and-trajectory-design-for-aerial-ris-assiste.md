---
layout: page
title: "空中 RIS 辅助无线网络的姿态感知控制与轨迹设计｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-23157-orientation-aware-control-and-trajectory-design-for-aerial-ris-assiste/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/5cb79678d14fac5d/) · [原文 arXiv](https://arxiv.org/abs/2609.23157) · [全部目录](/papers/catalog/)

# 空中 RIS 辅助无线网络的姿态感知控制与轨迹设计

**原题：** Orientation-Aware Control and Trajectory Design for Aerial RIS-Assisted Wireless Communications  
**作者：** Abdoul Karim A. H. Saliah¹、Hajar El Hammouti¹、Daniel Bonilla Licea¹、Giuseppe Silano²（¹ 摩洛哥本盖里尔穆罕默德六世理工大学计算学院；² 意大利米兰能源系统研究公司（RSE S.p.A.）发电技术与材料部，并兼任捷克布拉格捷克技术大学控制论系）  
**版本：** arXiv:2609.23157v1（cs.NI），2026 年 9 月 19 日提交；IEEE Transactions on Vehicular Technology 预印本版（2026 年 9 月录用）。本文部分受欧盟资助项目 DCI-PANAF/2020/420-028（经非洲科研卓越计划 ARISE 试点）、意大利电力系统研究基金（Ricerca di Sistema，2024 年 11 月 6 日第 388 号法令）、GA ČR 项目 26-22606S 与 CTU 资助 SGS26/077/OHK3/1T/13 资助。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—VI 节、算法 1、表 I—表 II、图 1—图 23 图注与参考文献（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

空中可重构智能表面（Aerial Reconfigurable Intelligent Surface，ARIS）把可重构超表面与空中机动性结合，可增强遮挡环境中的无线连通性。然而在实际部署中，RIS 被刚性安装在多旋翼无人机（UAV）上，由此产生**位置—姿态耦合动力学**，直接影响通信质量。由于 RIS 性能对姿态高度敏感，**点质量**或**姿态无关**模型可能给出过于乐观的性能估计。本文提出一个**姿态感知的 ARIS 框架**，显式计入 UAV 动力学、执行机构限制与姿态相关信道。所提方法把**通信引导的参考轨迹规划器**与**非线性模型预测控制（NMPC）**相结合，实现动态可行的轨迹跟踪与有利的 RIS 姿态，同时采用轻量级波束赋形与 RIS 相移更新。仿真表明：计入姿态可使用户吞吐量提升 13.77%，而所提联合通信更新使网络吞吐量相对仅相移优化提升 28%，相对仅波束赋形优化提升至少 2.5 倍。这些结果凸显了姿态感知建模与联合通信—控制设计在 ARIS 辅助无线系统中的重要性。

**关键词：** 空中可重构智能表面、波束赋形、通信感知机器人、非线性模型预测控制、无人机、6G。

## I. 引言

无人机（UAV）因其高机动性、灵活部署以及建立主导视距（LoS）通信链路的能力，被广泛认为是未来 6G 天地一体化网络的关键使能技术 [1]、[2]。这些特性使 UAV 在灾害响应、密集城市环境与网络卸载等场景中，对按需覆盖扩展、容量增强与关键任务服务尤为具有吸引力 [3]、[4]。因此，UAV 作为空中基站、中继与移动边缘计算平台已被广泛研究 [5]。

尽管具有上述优势，UAV 辅助通信在遮挡与密集环境中仍面临显著挑战：严重路径损耗与多径衰落会降低链路质量 [6]、[7]。应对这些问题近来推动了对**可重构智能表面（RIS）**的强烈兴趣——它是塑造与控制无线传播环境的一项有前景的技术 [8]、[9]。RIS 由可编程超单元构成的平面阵列组成，其电磁响应可动态调整（通常通过控制相移），以通过反射、透射或折射操控入射波。一个重要的子类是**智能反射表面（IRS）**，它专门用于无源波束赋形 [10]。通过恰当配置这些单元，RIS 可增强信号覆盖与可靠性，尤其在非 LoS 条件下 [11]、[12]。为简洁起见，本文全文使用更宽泛的术语 RIS，专指无源 IRS 设计。

**空中 RIS（ARIS）**是安装在 UAV 上的 RIS，把智能信号操控与空中机动性结合起来。该集成使 RIS 可在三维空间重新定位，为改善通信性能提供额外自由度。若干近期研究探索了 ARIS 使能网络在物联网系统信息年龄最小化、能效移动边缘计算与物理层安全增强等应用 [13]、[14]。这些工作通常聚焦于联合优化 UAV 轨迹、RIS 相移，以及在某些情况下的发射机波束赋形或资源分配。

然而，现有大量 ARIS 文献仍存在显著的**现实性差距**。多数贡献把 UAV 建模为可自由移动的点质量，隐含假设位置与姿态可独立控制。本文聚焦基于多旋翼 UAV 的 ARIS 实现——由于具备悬停能力与精确机动性，这是实践中最常采用的平台 [15]。对此类飞行器，平移与姿态本质上是耦合的 [16]：水平运动必然要求机体倾斜，而倾斜会直接改变刚性安装的 RIS 的姿态。由于 RIS 性能对其位姿高度敏感 [17]，忽略该耦合会导致不准确的性能预测与过于乐观的结论。此外，许多研究进一步假设 RIS 各向同性 [17]，这一假设并不反映实际 RIS 的方向性特征。

受这些观察启发，本文处理在显式计入 UAV 动力学、执行机构限制与 RIS 辅助信道姿态相关行为的前提下，设计 ARIS 轨迹与通信参数的问题。

为此，本文考虑一个 ARIS 辅助的地面网络：多旋翼 UAV 搭载的 RIS 在支持地面用户的同时，从指定初始状态演化到目标最终状态。目标是在通信服务质量（QoS）要求、UAV 动态约束与执行机构限制下最大化网络吞吐量。所得问题把机动性、控制与通信变量紧密耦合，形成具有挑战性的非凸优化问题。为应对该复杂性，本文采用一种结构化求解方法，把**长时程轨迹生成**与**约束感知跟踪**分离，使通信性能与飞行器可行性可在统一框架内共同处理。

### A. 相关工作

近年来 ARIS 研究快速增长，多数研究聚焦以通信为中心的优化问题，涉及 UAV 轨迹设计、发射波束赋形与 RIS 相移配置 [18]、[19]。这些工作一致表明，相比静态 RIS 部署，空中机动性可显著增强覆盖、适应性与频谱效率 [20]。然而许多现有方法依赖简化假设，限制了其对真实 ARIS 平台的适用性。

当前文献的主要局限可大致归为三方面：(i) UAV 运动与执行机构的简化建模；(ii) 姿态相关 RIS—信道相互作用的刻画不完整；(iii) 求解策略依赖强近似或可解释性与部署保证有限的学习式启发方法。

**简化的 UAV 运动建模：** ARIS 文献的很大一部分把 UAV 建模为具有固定或可隐式控制姿态的自由可定位点质量 [21]、[22]。该抽象忽略了如下事实：对 ARIS 应用中常用的 UAV 平台，平移运动与姿态动力学是耦合的。实践中水平运动需要机体倾斜，意味着位置变化通常伴随姿态变化，尤其在加速或轨迹机动期间。忽略该耦合可能导致在物理平台上难以或无法实现的轨迹与姿态剖面，从而在实际系统上实施时降低通信性能。虽然此类简化模型对高层通信分析有用，但它们不能完整刻画 UAV 动力学与执行机构限制所施加的约束。例如 [21] 把 ARIS 用作边缘计算服务器，通过联合轨迹、任务卸载与缓存优化最小化能耗；[22] 联合优化轨迹与相移以最小化能耗并最大化数据率。两项工作都把 UAV 建模为自由可定位点质量，忽略了动力学约束。

**不完整的信道与 RIS 建模：** 多数 ARIS 研究采用仅依赖发射机、接收机与 RIS 位置的信道模型，同时假设表面响应固定或与姿态无关 [23]。该假设与静态 RIS 部署一致，但当 RIS 安装在运动空中平台时便有疑问：即使姿态变化适中，姿态变化也可能显著影响有效反射方向图与链路质量。此外许多工作假设 RIS 响应各向同性 [17]、[24]，隐式地把表面视为向所有方向均匀反射能量。然而实际 RIS 实现呈现依赖位置与姿态的方向性、各向异性辐射特征。更新的显式考虑这种各向异性的模型 [25] 提供了对 ARIS 辅助通信更准确的表示，并推动了姿态感知建模的必要性。例如 [23] 让 ARIS 把设备数据转发至回传 UAV 以最大化能量效率，但假设 UAV 姿态固定、RIS 单元各向同性；[25] 把 RIS 建模为各向异性，但 ARIS 被限制为悬停，限制了其潜力。

**求解策略与计算考量：** UAV 轨迹、RIS 相移与波束赋形的联合优化通常用凸近似技术或学习方法处理。基于连续凸近似（SCA）的方法 [26] 通过对非凸项线性化并解耦变量来降低计算复杂度，但通常给出局部最优解，其质量依赖初始化与建模假设 [27]。更近期，深度强化学习（DRL）被应用于 ARIS 优化问题以处理高维非线性动力学 [28]、[29]。DRL 虽在探索复杂解空间上具有灵活性，但其部署常受大量离线训练需求与有限可解释性的制约；此外稳定性和约束满足通常无法由设计保证，而这对于在执行机构限制下运行的空中平台是至关重要的方面 [30]、[31]。

与本文最密切相关的工作是 Eskandari 等 [32] 与 Li 等 [33]，它们尝试纳入更真实的飞行器行为。Eskandari 等采用非完整运动学模型结合基于 MPC 的规划；但该模型针对固定翼平台 [34] 定制，未刻画与多旋翼 ARIS 构型相关的平移—旋转耦合动力学及其对信道的影响。Li 等在 DRL 框架内纳入旋转运动与姿态感知辐射方向图，是迈向现实性的重要一步；但其表述未显式建模执行机构约束或二阶旋转动力学，且学习方法继承了 DRL 方法的典型挑战。

总之，现有 ARIS 研究常依赖简化的 UAV 运动模型、忽略姿态相关的 RIS 行为，或采用难以嵌入约束感知控制架构的求解方法。这些局限促使我们提出一种同时考虑真实 UAV 动力学、姿态感知信道建模，以及可自然嵌入控制框架的优化方法，以实现可靠的 ARIS 运行。

### B. 贡献

受现有 ARIS 文献中已指出的局限启发，本文提出一个面向遮挡环境中 UAV 搭载 ARIS 平台的**通信感知控制框架**。该框架显式耦合飞行器运动、姿态演化与无线通信性能，实现超出简化点质量或姿态无关模型的机动性与通信策略联合设计。具体地，本文考虑 ARIS 作为空中中继，并在真实动态与通信约束下处理 UAV 轨迹、波束赋形与 RIS 相移的联合优化。

本文主要贡献如下：

1. 建立一个集成模型，结合完整的 UAV 平移与旋转动力学、执行机构限制，以及基于角度相关孔径增益的姿态相关、非各向同性 ARIS 信道刻画。该模型捕捉了多数现有 ARIS 表述所忽略的物理效应。
2. 把轨迹、波束赋形与 RIS 相移的耦合优化分解为可处理的子问题，为波束赋形与相移更新得到闭式解，同时保持它们与 UAV 运动的耦合。相比整体式或基于学习的表述，该结构显著降低计算复杂度。
3. 提出一个两阶段框架：通信感知轨迹规划器 + NMPC 跟踪器，后者在执行中强制执行 UAV 动力学、执行机构限制与数据率 QoS 约束。规划器处理全局通信—几何问题，NMPC 保证动态可行运动、有利的 ARIS 姿态与可靠的链路质量。
4. 大量仿真表明，显式计入 UAV 姿态与动力学可使用户吞吐量提升 13.77%；所提联合优化使网络吞吐量相对仅相移优化提升 28%、相对仅波束赋形优化提升至少 2.5 倍，同时在真实执行机构约束下保证精确的轨迹跟踪。

与现有 ARIS 方法相比，所提框架在三个关键方面推进了最新水平：(i) 通过显式计入平移—旋转耦合动力学，超越点质量与运动学 UAV 模型；(ii) 纳入通常被忽略的姿态相关、非各向同性 ARIS 信道效应；(iii) 提供计算高效且面向控制的解，可嵌入反馈架构，避免基于学习方法的训练开销与部署顾虑。据作者所知，鲜有 ARIS 研究把姿态感知信道建模、多旋翼 UAV 动力学、显式执行机构限制与基于 NMPC 的跟踪结合在单一可部署框架中。

**记号：** 标量用斜体小写字母（如 $y$），向量用粗体小写字母（如 $\mathbf y$），矩阵用粗体大写字母（如 $\mathbf Y$）。矩阵 $\mathbf Y$ 的转置与 Hermitian 转置分别记为 $\mathbf Y^{\top}$ 与 $\mathbf Y^{\dagger}$。复数模记为 $|\cdot|$，$\lVert\cdot\rVert_2$ 表示欧氏（$\ell_2$）范数，虚数单位记为 $\mathrm j$。算子 $[\cdot]_3$ 表示三维向量的第三个分量。单位四元数 $q$ 属于三维球面 $\mathbb S^{3}=\{q\in\mathbb R^{4}:\lVert q\rVert_2=1\}$，它表示用于参数化三维旋转的单位范数四元数集合 [35]。相应旋转矩阵 $\mathbf R(q)$ 属于特殊正交群 $\mathrm{SO}(3)=\{\mathbf R\in\mathbb R^{3\times3}:\mathbf R^{\top}\mathbf R=\mathbf I,\ \det(\mathbf R)=1\}$，即三维空间中全部正规旋转矩阵的集合。符号 $\times$、$\angle(\cdot)$、$\lfloor\cdot\rfloor$ 与 $\circ$ 分别表示向量叉积、复数相位、实数下取整与四元数乘积。

## II. 系统与通信模型

本节给出论文采用的系统建模。先描述 ARIS 辅助通信场景，包括网络架构与坐标系（第 II-A 节）；随后引入 ARIS 辅助地面通信的姿态感知传播几何（第 II-B 节）与信道模型（第 II-C 节）；最后给出用于轨迹设计与控制的 UAV 动力学模型（第 II-D 节）。

### A. 系统与坐标系

本文考虑一个下行无线通信系统：一个地面基站（BS）为位于遮挡环境中的多个地面用户（GU）服务。由于 BS—GU 直连链路被遮挡，部署一台 UAV 搭载的 RIS 作为**空中中继**，把入射信号反射至用户。RIS 刚性连接于 UAV，使其几何中心与飞行器质心（CoM）重合。UAV 需在任务时长 $T$ 内从初始状态移动到目标最终状态，同时与用户保持可靠通信。系统架构概览见正文图 1，记号表见表 I。

BS 配备由 $N$ 个天线单元构成的均匀线阵（ULA），单元索引集合为 $\mathcal N=\{1,\ldots,N\}$，服务 $I$ 个地面用户，用户索引集合为 $\mathcal I=\{1,\ldots,I\}$。UAV 携带由 $M=M_HM_V$ 个反射单元构成的 RIS 均匀平面阵（UPA），单元索引集合为 $\mathcal M=\{1,\ldots,M\}$。

定义两个坐标系（见正文图 2）：世界（惯性）系 $\mathcal F_W$ 与机体固连系 $\mathcal F_B$。$\mathcal F_W$ 的原点位于 BS 参考点，$\mathcal F_B$ 的原点与 UAV 质心重合。BS、UAV（ARIS）与用户 $i$ 在 $\mathcal F_W$ 中的位置分别记为 $\mathbf p^{\mathrm{BS}}=[0,0,0]^{\top}$、$\mathbf p=[p_x,p_y,p_z]^{\top}$、$\mathbf p_i=[p_{x,i},p_{y,i},-h_{\mathrm{BS}}]^{\top}$，其中 $h_{\mathrm{BS}}$ 为 BS 高度。由于 $\mathcal F_W$ 原点置于 BS 参考点，地面用户在坐标系中位于 $z=-h_{\mathrm{BS}}$。

UAV 姿态用单位四元数 $q\in\mathbb S^{3}$ 表示，它给出三维姿态的无奇异表示，适合建模旋转动力学 [35]。相应旋转矩阵 $\mathbf R(q)\in\mathrm{SO}(3)$ 把向量从机体系 $\mathcal F_B$ 映射到世界系 $\mathcal F_W$，将用于后续信道与动力学建模。

为服务多个用户，本文采用时分多址（TDMA）协议：每个用户分配等长时隙。假设信道相干时间大于 TDMA 帧周期。在传输时隙内，被调度用户占用整个带宽 $B_0$，采用单一波束赋形向量，且不存在用户间干扰 [36]、[37]。

### B. 姿态感知的 ARIS 传播几何

单个天线单元 $n$ 在世界系 $\mathcal F_W$ 中的位置 $\mathbf p_n^{\mathrm{BS}}$，以及第 $m$ 个 ARIS 单元在机体系 $\mathcal F_B$ 中 UPA 内的位置 $\mathbf p_m^{R}$，按 [38] 定义。

RIS 信道建模中的一个重要组成部分是**波矢** $\mathbf s(\vartheta,\phi)$，它定义平面波在世界系中的传播方向与相位推进 [39]。对一般通信链路 $W\to Z$，波矢表示为

$$
\mathbf s(\vartheta_{W-Z},\phi_{W-Z})=\begin{bmatrix}\cos\vartheta_{W-Z}\cos\phi_{W-Z}\\ \cos\vartheta_{W-Z}\sin\phi_{W-Z}\\ \sin\vartheta_{W-Z}\end{bmatrix},\tag{1}
$$

其中 $\vartheta_{W-Z}$ 与 $\phi_{W-Z}$ 分别为刻画节点 $W$、$Z$ 之间**离开角（AoD）**或**到达角（AoA）**的仰角与方位角。

本文系统对 RIS 与 BS 之间、RIS 与用户之间的链路采用如下记号：$B$ 表示 BS，$R$ 表示 ARIS，$i$ 表示地面用户。由此产生两条主要链路：$B\to R$ 与 $R\to i$。

**路径差**（脚注：路径差是含第 $m$ 个 RIS 单元的路径相对经由 RIS 几何中心的参考路径之间的传播距离偏移。对入射波，为 BS—单元路径与 BS—中心路径之差；对反射波，为单元—接收机路径与中心—接收机路径之差。它刻画每个单元相对 RIS 中心的空间位移所引入的相对相移）通过把第 $m$ 个单元的全局位置投影到相应波矢得到。对 BS 到 ARIS 链路，该附加路径长度为

$$
\Delta\ell_m\left(\vartheta_{B-R}^{\mathrm{AoA}},\phi_{B-R}^{\mathrm{AoA}},q\right)=\mathbf s\left(\vartheta_{B-R}^{\mathrm{AoA}},\phi_{B-R}^{\mathrm{AoA}}\right)\cdot\left(\mathbf R(q)\mathbf p_m^{R}\right),\tag{2}
$$

其中 $\mathbf R(q)\mathbf p_m^{R}$ 是第 $m$ 个 RIS 单元旋转到世界系 $\mathcal F_W$ 后的位置，$\left(\vartheta_{B-R}^{\mathrm{AoA}},\phi_{B-R}^{\mathrm{AoA}}\right)$ 为链路 $B\to R$ 的仰角与方位角 AoA。

类似地，对 ARIS 到用户 $i$ 的链路，从第 $m$ 个单元到用户的路径差为

$$
\Delta\ell_{m,i}\left(\vartheta_{R-i}^{\mathrm{AoD}},\phi_{R-i}^{\mathrm{AoD}},q\right)=\mathbf s\left(\vartheta_{R-i}^{\mathrm{AoD}},\phi_{R-i}^{\mathrm{AoD}}\right)\cdot\left(\mathbf R(q)\mathbf p_m^{R}\right),\tag{3}
$$

其中 $\left(\vartheta_{R-i}^{\mathrm{AoD}},\phi_{R-i}^{\mathrm{AoD}}\right)$ 为链路 $R\to i$ 的仰角与方位角 AoD。

### C. 信道模型

ARIS 的信道与模型几何见正文图 2。BS 与 ARIS 之间的信道同时依赖 UAV 三维位置与 ARIS 姿态，表示为

$$
\mathbf H=\alpha(\mathbf p)\,\mathbf a_{\mathrm{rx},R}\left(\vartheta_{B-R}^{\mathrm{AoA}},\phi_{B-R}^{\mathrm{AoA}},q\right)\mathbf a_{\mathrm{tx},B}^{\dagger}\left(\vartheta_{B-R}^{\mathrm{AoD}},\phi_{B-R}^{\mathrm{AoD}}\right),\tag{4}
$$

其中 $\left(\vartheta_{B-R}^{\mathrm{AoD}},\phi_{B-R}^{\mathrm{AoD}}\right)$ 为来自 BS 的仰角与方位角 AoD，$\mathbf a_{\mathrm{tx},B}$ 与 $\mathbf a_{\mathrm{rx},R}$ 分别为 BS 处发射阵列响应与 ARIS 处接收阵列响应。后者定义为

$$
\mathbf a_{\mathrm{tx},B}\left(\vartheta_{B-R}^{\mathrm{AoD}},\phi_{B-R}^{\mathrm{AoD}}\right)=\left[e^{\mathrm j\frac{2\pi}{\lambda}\mathbf s\left(\vartheta_{B-R}^{\mathrm{AoD}},\phi_{B-R}^{\mathrm{AoD}}\right)\cdot\mathbf p_n^{\mathrm{BS}}}\right]_{n=1}^{N},\tag{5}
$$

$$
\mathbf a_{\mathrm{rx},R}\left(\vartheta_{B-R}^{\mathrm{AoA}},\phi_{B-R}^{\mathrm{AoA}},q\right)=\left[e^{\mathrm j\frac{2\pi}{\lambda}\Delta\ell_m\left(\vartheta_{B-R}^{\mathrm{AoA}},\phi_{B-R}^{\mathrm{AoA}},q\right)}\right]_{m=1}^{M}.\tag{6}
$$

类似地，UAV 与用户 $i$ 之间的信道记为 $\mathbf g_i\in\mathbb C^{1\times M}$，由下式给出：

$$
\mathbf g_i=\beta_i(\mathbf p)\,\mathbf a_{\mathrm{tx},R}^{\dagger}\left(\vartheta_{R-i}^{\mathrm{AoD}},\phi_{R-i}^{\mathrm{AoD}},q\right),\tag{7}
$$

其中 $\mathbf a_{\mathrm{tx},R}$ 为 RIS 发射阵列响应，表示为

$$
\mathbf a_{\mathrm{tx},R}\left(\vartheta_{R-i}^{\mathrm{AoD}},\phi_{R-i}^{\mathrm{AoD}},q\right)=\left[e^{\mathrm j\frac{2\pi}{\lambda}\Delta\ell_{m,i}\left(\vartheta_{R-i}^{\mathrm{AoD}},\phi_{R-i}^{\mathrm{AoD}},q\right)}\right]_{m=1}^{M}.\tag{8}
$$

BS 到 ARIS 链路与 ARIS 到用户链路的复 LoS 信道系数 $\alpha(\mathbf p)$ 与 $\beta_i(\mathbf p)$ 分别为

$$
\alpha(\mathbf p)=\frac{\sqrt{l_0}}{\lVert\mathbf p-\mathbf p^{\mathrm{BS}}\rVert_2}\,e^{-\mathrm j\frac{2\pi\lVert\mathbf p-\mathbf p^{\mathrm{BS}}\rVert_2}{\lambda}},\tag{9}
$$

$$
\beta_i(\mathbf p)=\frac{\sqrt{l_0}}{\lVert\mathbf p-\mathbf p_i\rVert_2}\,e^{-\mathrm j\frac{2\pi\lVert\mathbf p-\mathbf p_i\rVert_2}{\lambda}},\tag{10}
$$

其中 $l_0$ 为 1 米距离处的参考路径损耗，$\lambda$ 为载波波长。

RIS 把入射信号反射到期望方向的能力受到其姿态的强烈影响。如上所示，姿态通过影响 RIS 阵列响应影响通信信道，但它还影响 RIS 在给定方向上的反射强度。特别地，**有效反射强度与方向相关**，可用孔径增益函数量化。从 ARIS 指向 BS 与从 ARIS 指向用户 $i$ 的单位向量（在 ARIS 局部系中表示）为

$$
\mathbf u_{B-R}^{\mathrm{local}}=\mathbf R(q)^{\top}\frac{\mathbf p^{\mathrm{BS}}-\mathbf p}{\lVert\mathbf p^{\mathrm{BS}}-\mathbf p\rVert_2},\tag{11}
$$

$$
\mathbf u_{R-i}^{\mathrm{local}}=\mathbf R(q)^{\top}\frac{\mathbf p_i-\mathbf p}{\lVert\mathbf p_i-\mathbf p\rVert_2}.\tag{12}
$$

于是对偶链路 $B\to R\to i$ 的入射与反射仰角按 [25] 定义为

$$
\cos(\phi_0)=-[\mathbf u_{B-R}^{\mathrm{local}}]_3,\qquad \cos(\phi_i)=-[\mathbf u_{R-i}^{\mathrm{local}}]_3,\tag{13}
$$

其中 $\phi_0$ 与 $\phi_i$ 分别为 RIS 法向（与机体系负 $Z_B$ 轴重合）与到达方向、离开方向之间的夹角。用户 $i$ 的孔径增益随后为

$$
G_i^{\mathrm{ap}}=\begin{cases}\cos(\phi_0)\cos(\phi_i), & \cos(\phi_0)>0,\ \cos(\phi_i)>0,\\ 0, & \text{其他}.\end{cases}\tag{14}
$$

该增益因子在实践中总是小于 1，并调制整体 SNR，凸显了 ARIS 辅助通信系统中姿态感知设计的重要性。

用户 $i$ 的 SNR 同时取决于 ARIS 的姿态与位置 $q$ 与 $\mathbf p$、BS 发射功率 $P_0$，以及 RIS 相移矩阵 $\boldsymbol\Theta=\operatorname{diag}\left(e^{\mathrm j\vartheta_m}\right)_{m=1}^{M}$（$\vartheta_m$ 为第 $m$ 个 RIS 单元的相移）。因此，在所采用的 TDMA 协议下，被调度用户 $i$ 的瞬时 SNR 为

$$
\eta_i=\frac{P_0G_AG_i^{\mathrm{ap}}\left|\mathbf g_i\boldsymbol\Theta\mathbf H\mathbf f\right|^{2}}{\sigma^{2}},\tag{15}
$$

其中 $\mathbf f$ 为 BS 选定的波束赋形向量，$G_A$ 为 BS 天线增益。此处 $\mathbf H\in\mathbb C^{M\times N}$、$\mathbf g_i\in\mathbb C^{1\times M}$、$\boldsymbol\Theta\in\mathbb C^{M\times M}$、$\mathbf f\in\mathbb C^{N\times1}$，故 $\mathbf g_i\boldsymbol\Theta\mathbf H\mathbf f$ 为标量。

在被调度的 TDMA 传输时隙内，BS 到用户 $i$ 的瞬时传输速率为

$$
R_i=\frac{B_0}{I}\log_2\left(1+\eta_i\right),\tag{16}
$$

其中 $B_0$ 为传输带宽。

### D. UAV 动力学模型

ARIS 平台被建模为由多旋翼 UAV 与刚性安装、质量可忽略的 RIS 面板构成的刚体。令 $\mathbf p\in\mathbb R^{3}$、$\mathbf v\in\mathbb R^{3}$、$\boldsymbol\omega\in\mathbb R^{3}$ 分别表示 UAV 位置、线速度与角速度，$q\in\mathbb S^{3}$ 为单位四元数姿态。

UAV 动力学（采用 [16] 的形式）为

$$
\dot{\mathbf p}=\mathbf v,\tag{17a}
$$

$$
\dot q=\tfrac{1}{2}\,q\circ\begin{bmatrix}0\\ \boldsymbol\omega\end{bmatrix},\tag{17b}
$$

$$
m\dot{\mathbf v}=-mg\mathbf e_z+u_T\mathbf R(q)\mathbf e_z,\tag{17c}
$$

$$
\mathbf J\dot{\boldsymbol\omega}=-\boldsymbol\omega\times(\mathbf J\boldsymbol\omega)+\boldsymbol\tau,\tag{17d}
$$

其中 $m$ 与 $\mathbf J=\operatorname{diag}(J_x,J_y,J_z)$ 为 UAV 质量与惯性矩阵，$\mathbf e_z=[0,0,1]^{\top}$，$u_T$ 为总推力，$\boldsymbol\tau=[\tau_x,\tau_y,\tau_z]^{\top}$ 为控制力矩，$\mathbf R(q)\in\mathrm{SO}(3)$ 为与 $q$ 关联的旋转矩阵。式 (17a) 与 (17c) 描述平移动力学，(17b) 与 (17d) 描述旋转运动。

推力 $u_T$ 与力矩 $\boldsymbol\tau$ 由四个转子转速 $\Omega_1,\ldots,\Omega_4$ 产生，映射关系为

$$
\begin{bmatrix}u_T\\ \tau_x\\ \tau_y\\ \tau_z\end{bmatrix}=\begin{bmatrix}b_f & b_f & b_f & b_f\\ -\frac{b_fd}{\sqrt2} & -\frac{b_fd}{\sqrt2} & \frac{b_fd}{\sqrt2} & \frac{b_fd}{\sqrt2}\\ -\frac{b_fd}{\sqrt2} & \frac{b_fd}{\sqrt2} & \frac{b_fd}{\sqrt2} & -\frac{b_fd}{\sqrt2}\\ -b_m & b_m & -b_m & b_m\end{bmatrix}\begin{bmatrix}\Omega_1^{2}\\ \Omega_2^{2}\\ \Omega_3^{2}\\ \Omega_4^{2}\end{bmatrix},\tag{18}
$$

其中 $b_f$、$b_m$ 与 $d$ 分别为转子推力系数、阻力系数与臂长。

整个系统可紧凑写为 $\dot{\mathbf x}=\mathbf h(\mathbf x,\mathbf u)$，其中状态 $\mathbf x=[\mathbf p^{\top},q^{\top},\mathbf v^{\top},\boldsymbol\omega^{\top}]^{\top}\in\mathbb R^{3}\times\mathbb S^{3}\times\mathbb R^{6}$，控制输入 $\mathbf u=[\Omega_1,\Omega_2,\Omega_3,\Omega_4]^{\top}\in\mathbb R^{4}$。

## III. 问题陈述

本文目标是在有限任务时长内，通过联合优化 ARIS 辅助系统中的 UAV 运动与通信变量来最大化网络吞吐量。具体地，本文考虑 BS 波束赋形向量 $\mathbf f$、RIS 相移配置 $\boldsymbol\Theta$ 与 UAV 控制输入的联合设计，同时显式计入 UAV 动力学、执行机构限制与通信要求。UAV 搭载的 RIS 需在任务时间 $T$ 内从给定初始状态 $\mathbf x_I$ 演化到预定义最终状态 $\mathbf x_F$，同时在整个飞行过程中保证与所有地面用户的可靠通信。所得优化问题通过第 II 节引入的 UAV 动力学与姿态相关信道模型，把机动性与通信变量紧密耦合。

形式上，联合优化问题表述为

$$
\max_{\mathbf u,\mathbf f,\boldsymbol\Theta}\ \int_0^{T}\sum_{i\in\mathcal I}R_i(t)\,\mathrm dt\tag{19a}
$$
$$
\text{s.t.}\quad\dot{\mathbf x}(t)=\mathbf h(\mathbf x(t),\mathbf u(t)),\tag{19b}
$$
$$
\mathbf x(0)=\mathbf x_I,\qquad \mathbf x(T)=\mathbf x_F,\tag{19c}
$$
$$
\mathbf p(t)\in\mathcal A,\quad\forall t\in[0,T],\tag{19d}
$$
$$
R_i(t)\ge R_{\min},\quad\forall i\in\mathcal I,\tag{19e}
$$
$$
\vartheta_m(t)\in[0,2\pi],\quad\forall m\in\mathcal M,\tag{19f}
$$
$$
\lVert\mathbf v(t)\rVert_2\le\bar v,\quad\forall t\in[0,T],\tag{19g}
$$
$$
\Omega_s(t)\in[\underline\Omega,\bar\Omega],\quad\forall s\in\{1,\ldots,4\},\tag{19h}
$$
$$
\lVert\mathbf f(t)\rVert_2=1,\quad\forall t\in[0,T].\tag{19i}
$$

式 (19a) 中 $R_i(t)$ 表示用户 $i$ 在时刻 $t$ 的可达数据率，定义见式 (16)。约束 (19b) 强制执行第 II-D 节描述的 UAV 动力学，确保运动与飞行器动力学物理一致。约束 (19c) 指定 UAV 初始与最终状态，体现任务要求。约束 (19d) 把 UAV 位置限制在可行飞行区域 $\mathcal A$ 内，考虑运行与安全限制。QoS 要求 (19e) 确保每个用户达到最低瞬时数据率 $R_{\min}$，从而保证基线通信性能。约束 (19f) 定义 RIS 相移的可行范围，反映实际 RIS 单元的硬件限制。约束 (19g) 与 (19h) 强制 UAV 平台的物理限制，包括有界平移速度与通过转子转速约束实现的执行机构饱和，确保动态可行运动。最后，约束 (19i) 对 BS 波束赋形向量施加单位范数约束，对应基站的发射功率归一化。

问题 (19) 因非线性 UAV 动力学、姿态相关信道模型，以及机动性、波束赋形与 RIS 相移变量之间的乘性耦合而高度非凸。下节不全局求解 (19)，而是发展一种基于分解的近似，把通信更新与轨迹生成和跟踪分离，同时保留 UAV 运动与通信性能之间的主导耦合。

## IV. 所提方案

由于通信变量（BS 波束赋形向量 $\mathbf f$ 与 RIS 相移矩阵 $\boldsymbol\Theta$）、UAV 动力学与非线性速率表达式之间紧密耦合，全局最优求解问题 (19) 极为困难。因此本文不追求全局最优解，而是通过一种**分解策略**发展可处理解，把通信设计与轨迹生成和跟踪分离。

该思路基于两点主要考量。第一，通信变量演化的时间尺度远快于 UAV 动力学，使波束赋形与 RIS 相移更新可相对 NMPC 采样时间准瞬时完成。第二，当 UAV 状态固定时，速率表达式 (16) 的结构在固定状态假设下对波束成形器与 RIS 相移都容许近最优闭式解。因此所提框架给出模块化架构（见正文图 3）：通信参数依据当前 UAV 状态更新，而 UAV 轨迹在由此得到的通信感知约束下设计与跟踪。整体方案包含四个组成部分：第一，BS 波束赋形向量经**波束赋形优化**模块计算（第 IV-A 节）；第二，RIS 相移经**相移优化**模块更新（第 IV-B 节）；第三，参考轨迹用 $t=0$ 时的**参考轨迹设计**离线生成（第 IV-C 节）；第四，参考轨迹由 NMPC 控制器在线跟踪，该控制器纳入 UAV 动力学模型与物理限制（第 IV-D 节）。

所得框架应理解为原联合优化问题的**低复杂度近似**。它不全局求解问题 (19)，而是通过把通信参数作为 UAV 状态的显式函数更新，保留通信变量与控制变量之间的主导交互。因此，尽管各变量是顺序而非联合优化，该简化框架仍保留原问题的基本结构，从而提供有意义的低复杂度近似。在该分解中，采用固定的水平姿态参考作为**稳定化策略**，而非通信最优姿态——获得通信最优姿态需要在计入耦合动力学的前提下联合优化 UAV 轨迹与姿态，导致显著更复杂的优化问题。

### A. 波束赋形优化

在固定 UAV 状态 $\mathbf x$ 与 RIS 相移矩阵 $\boldsymbol\Theta$ 的条件下，优化波束赋形向量 $\mathbf f$ 以最大化时刻 $t$ 的总瞬时吞吐量。所得优化问题表述为 (20)：

$$
\max_{\mathbf f}\ \sum_{i\in\mathcal I}R_i(t)\tag{20a}
$$
$$
\text{s.t.}\quad\text{(19i)}.\tag{20b}
$$

在此阶段，本文采用指向 BS 到 RIS 信道的**最大比传输（MRT）**作为低复杂度替代，而把约束 (19e) 推迟到 NMPC 跟踪阶段（第 IV-D 节）。对这里考虑的固定状态设置，该选择最大化从 BS 阵列向 RIS 传输的功率，并提供与后续 RIS 反射优化相一致的实用波束赋形更新。为此，在每个时刻 $t$，BS 使用如下波束赋形向量：

$$
\mathbf f=\frac{\mathbf a_{\mathrm{tx},B}\left(\vartheta_{B-R}^{\mathrm{AoD}},\phi_{B-R}^{\mathrm{AoD}}\right)}{\left\lVert\mathbf a_{\mathrm{tx},B}\left(\vartheta_{B-R}^{\mathrm{AoD}},\phi_{B-R}^{\mathrm{AoD}}\right)\right\rVert_2}.\tag{21}
$$

该策略对最大化 RIS 处 SNR 是最优的 [40]。

### B. 相移优化

在固定 UAV 状态 $\mathbf x$ 与波束赋形向量 $\mathbf f$ 的条件下，优化时刻 $t$ 的 RIS 相移矩阵 $\boldsymbol\Theta$ 以最大化瞬时吞吐量，优化问题表述为

$$
\max_{\boldsymbol\Theta}\ \sum_{i\in\mathcal I}R_i(t)\tag{22a}
$$
$$
\text{s.t.}\quad\text{(19f)}.\tag{22b}
$$

此步骤忽略 QoS 约束。单用户等效表述容许一个可高效求值、并可复用于预测未来信道状态的**闭式相移表达式**；相反，在波束赋形固定时进行多用户相移优化没有闭式解，需要设计计算复杂度不可忽略的迭代方法。

为降低复杂度，本文定义位于用户位置重心处的**虚拟用户**，记为 $\mathbf p_v$，并把单用户解应用于该代表节点。对本文所考虑的成簇用户，该近似是合适的；若用户分布很分散则可能失效。仿真结果证实该策略在所考虑设置下有效。按 [25] 的单用户分析，最优相移为

$$
\vartheta_m=\angle\left(\left(\mathbf a_{\mathrm{tx},R}\left(\vartheta_{R-v}^{\mathrm{AoD}},\phi_{R-v}^{\mathrm{AoD}},q\right)\right)_m\right)-\angle\left(\left(\mathbf a_{\mathrm{rx},R}\left(\vartheta_{B-R}^{\mathrm{AoA}},\phi_{B-R}^{\mathrm{AoA}},q\right)\right)_m\right),\quad\forall m\in\mathcal M,\tag{23}
$$

其中 $\left(\vartheta_{R-v}^{\mathrm{AoD}},\phi_{R-v}^{\mathrm{AoD}}\right)$ 为 RIS 到虚拟用户的离开角。

该相移更新对以用户重心为中心的单用户替代是最优的。因此在整体框架内，RIS 相位设计应理解为原多用户相移优化问题的低复杂度近似。

**算法 1　参考轨迹设计**

```text
输入: A, p_z = h_R, UAV 初始位置 p_init, UAV 最终位置 p_fin, 邻域规模 E ≥ 2,
      顶点总数 L, 飞行时长 T, 采样时间 T_s
输出: 通信引导的参考轨迹 P

1: 在 A 内高度 p_z 处的矩形区域中随机生成 L 个候选节点 V = {(p_x^l, p_y^l)}_{l=1}^L,
   确保 p_init 与 p_fin 包含在 V 中
2: 对全部 l ∈ {1,...,L}, 由 (24) 计算每个节点的代价 C_l
3: 在顶点集 V 上构造图 G: 每个顶点与基于欧氏距离的 E 个最近邻相连,
   形成边权为 {w_{i0→j0}} 的加权图
4: for all i0 ∈ {1,...,L} do
5:     for all j0 in i0 的 E 个最近邻 do
6:         w_{i0→j0} ← C_{j0}
7:     end for
8: end for
9: 在加权图 (V,w) 上从节点 p_init 到节点 p_fin 运行 Dijkstra 算法, 计算最短路径 P
10: 令 N_T = ⌊T/T_s⌋ + 1 为参考样本数; 沿路径 P 对路点插值,
    生成 N_T 个等间距参考位置序列; 所得序列构成参考轨迹
```

### C. 离线轨迹生成

本小节计算初始与最终位置之间通信引导的空间参考路径。在离线图搜索规划器中，UAV 高度保持恒定，只优化水平运动。在世界系 $\mathcal F_W$ 中，固定规划高度设为 $p_z=h_R$。图搜索规划器并不直接优化完整的姿态感知和速率，而是使用**轻量级距离式替代指标**以低计算代价识别有利于通信的区域；姿态相关效应随后由 NMPC 与状态相关通信更新在线处理。

为生成参考二维轨迹，先在保持高度固定的前提下，就 $x$ 与 $y$ 坐标在空间部署区域内采样候选路点；再在所得候选位置上构造加权图，并搜索从初始到最终位置、使通信感知代价最小的路径。

原则上，两个节点之间的边权（代价）应定义为在到达位置处评估的网络和速率的负值。但这需要为图中每条边计算完整通信模型，复杂度为 $\mathcal O(LINM)$，其中 $L$ 为顶点数、$I$ 为用户总数、$N$ 为天线单元数、$M$ 为 RIS 单元总数。为降低该计算负担，本文引入一个简化代价函数，在不显式计算完整数据率表达式的前提下近似每个顶点的通信质量。节点 $l$ 的代价定义如下：

$$
C_l=\left(\lVert\mathbf p^{l}-\mathbf p^{v}\rVert_2\cdot\lVert\mathbf p^{l}-\mathbf p^{\mathrm{BS}}\rVert_2\right)^{\gamma},\tag{24}
$$

其中 $\mathbf p^{l}=[p_x^{l},p_y^{l},h_R]^{\top}$ 表示图 $G$ 中顶点 $l$ 的三维位置，$\gamma\in\mathbb R^{+}$ 是用于强化通信在参考轨迹设计中重要性的因子。该代价等于顶点到虚拟用户位置 $\mathbf p_v$ 的距离与顶点到 BS 位置 $\mathbf p^{\mathrm{BS}}$ 的距离之积，其动机是用户的空间成簇性。一般情况下，节点 $l$ 的代价为 $C_l=\left(\lVert\mathbf p^{l}-\mathbf p^{\mathrm{BS}}\rVert_2\times\prod_{i=1}^{I}\lVert\mathbf p^{l}-\mathbf p_i\rVert_2\right)^{\gamma}$。低代价值表明 UAV 位于 $\mathbf p^{l}$ 时同时靠近 BS 与用户，这与式 (9)、(10) 中路径损耗函数 $\alpha(\mathbf p)$ 与 $\beta_i(\mathbf p)$ 的结构一致——较短距离降低路径损耗。此外，这些距离既决定经反距离路径损耗项的幅度衰减，也决定经信道系数指数项的传播相位。因此，最小化所提代价倾向于选择能同时降低路径损耗衰减的位置。该代价计算的复杂度降至 $\mathcal O(L)$。

二维参考轨迹用算法 1 生成。首先对空间域采样，构造包含初始与终止位置的候选节点集合；随后基于欧氏距离把每个节点与其 $E$ 个最近邻相连，构建加权图；边权由目标节点关联的代价定义，并在所得图上应用 Dijkstra 算法计算最小代价路径；离散路径随后被加密以匹配 NMPC 预测网格，得到用于跟踪的参考轨迹。也可采用 A⋆ 等替代图搜索方法；但对本文考虑的中等图规模，其相对 Dijkstra 算法的计算优势有限。RRT⋆ 等基于采样的规划器在此设置下不太适用，因为问题是在有限图上表述的，而非连续高维运动规划问题。在该表述下，Dijkstra 算法在构造的路图上给出确定性且图最优的解。

### D. 基于 NMPC 的轨迹跟踪

给定第 IV-C 节生成的参考轨迹与当前采样时刻计算的通信参数，NMPC 求解有限时域最优控制问题（OCP），以确定在满足 UAV 动力学与物理约束的同时跟踪参考的可行控制输入。波束赋形向量与 RIS 相移矩阵在求解 NMPC 问题之前由当前 UAV 状态计算，并在预测时域内保持不变；它们在下一采样时刻用新测得的 UAV 状态重新计算。

**1）离散时间表述：** 系统在 $\mathrm N_p$ 步的有限预测时域上以采样周期 $T_s>0$ 演化，对应实际时间 $t_k=kT_s$，下标 $k$ 为整数。对按时间索引的序列，下标 $\ell\in\{0,\ldots,N_p\}$ 表示序列在第 $\ell$ 步的取值（例如 $\mathbf x_\ell$、$\mathbf p_\ell$、$\mathbf v_\ell$）。该离散化把第 II-D 节的连续时间动力学嵌入 NMPC 框架。通信层运行在比 NMPC 更快的时间尺度上；因此每个采样间隔 $T_s$ 被均匀划分为 $I$ 个 TDMA 传输子时隙，其中 $I$ 为用户数（对采样时间 $T_s=0.08$ s，对应 NMPC 更新率 12.5 Hz；在 $I=5$ 个用户时，相应 TDMA 更新率为 62.5 Hz）。在每个子时隙内，仅一个用户使用全部系统带宽 $B_0$ 接受服务。

**2）目标函数：** 跟踪目标是驱动 UAV 状态趋向规定参考轨迹。NMPC 状态定义为 $\mathbf x=[\mathbf p^{\top},q^{\top},\mathbf v^{\top},\boldsymbol\omega^{\top}]^{\top}$。在第 $\ell$ 个预测步，相应期望状态为 $\mathbf x_{d,\ell}=[\mathbf p_{d,\ell}^{\top},q_{d,\ell}^{\top},\mathbf v_{d,\ell}^{\top},\boldsymbol\omega_{d,\ell}^{\top}]^{\top}$，其中 $\mathbf p_{d,\ell}$ 由第 IV-C 节生成的参考轨迹给出。

位置、速度与角速度跟踪误差通过以正定对角矩阵加权的二次项惩罚。由于四元数偏差无法用欧氏范数有意义地度量，姿态跟踪误差改用**测地四元数距离** $d_q(q_\ell,q_{d,\ell})$ 量化，定义遵循 [41]。

在存在扰动或模型失配时，(19e) 中的瞬时速率约束 $R_i(\mathbf x_\ell)\ge R_{\min}$ 可能暂时不可行。为保持 NMPC 问题的可行性，为每个用户与每个预测步引入非负**松弛变量** $s_{i,\ell}\ge0$。这些松弛变量在代价函数中通过二次项 $\lVert\mathbf s_\ell\rVert_{\mathbf Q_{sv}}^{2}$ 惩罚，其中 $\mathbf s_\ell=[s_{1,\ell},\ldots,s_{I,\ell}]^{\top}$，$\mathbf Q_{sv}$ 为带正权重的对角矩阵。该表述在可行时鼓励满足 QoS 约束，同时在必要时允许有限的约束松弛，以保持鲁棒性与递归可行性。

第 $\ell$ 步的阶段代价定义如下：

$$
e_\ell=\lVert\mathbf p_{d,\ell}-\mathbf p_\ell\rVert_{\mathbf Q_p}^{2}+Q_qd_q(q_\ell,q_{d,\ell})^{2}+\lVert\mathbf v_{d,\ell}-\mathbf v_\ell\rVert_{\mathbf Q_v}^{2}+\lVert\boldsymbol\omega_{d,\ell}-\boldsymbol\omega_\ell\rVert_{\mathbf Q_\omega}^{2}+\lVert\mathbf s_\ell\rVert_{\mathbf Q_{sv}}^{2},\tag{25}
$$

其中 $\mathbf Q_p$ 为正定对角跟踪权重，$Q_q$ 为正标量跟踪权重，$\mathbf Q_v$、$\mathbf Q_\omega$ 与 $\mathbf Q_{sv}$ 为半正定对角正则化权重。为增强向终端平衡点的收敛并支撑闭环稳定性，引入如下二次终端代价：

$$
e_{N_p}=\lVert\mathbf p_{d,N_p}-\mathbf p_{N_p}\rVert_{\mathbf Q_{p,N_p}}^{2}+Q_{q,N_p}d_q(q_{N_p},q_{d,N_p})^{2}+\lVert\mathbf v_{d,N_p}-\mathbf v_{N_p}\rVert_{\mathbf Q_{v,N_p}}^{2}+\lVert\boldsymbol\omega_{d,N_p}-\boldsymbol\omega_{N_p}\rVert_{\mathbf Q_{\omega,N_p}}^{2},\tag{26}
$$

其中 $\mathbf Q_{p,N_p}$、$\mathbf Q_{v,N_p}$ 与 $\mathbf Q_{\omega,N_p}$ 为半正定对角终端权重矩阵，$Q_{q,N_p}$ 为正标量终端权重。

**3）最优控制问题：** 于时刻 $t_k$，NMPC 在 $\mathrm N_p$ 步预测时域上求解如下有限时域最优控制问题：

$$
\min_{\mathbf u,\mathbf s}\ \sum_{\ell=0}^{N_p-1}e_\ell+e_{N_p}\tag{27a}
$$
$$
\text{s.t.}\quad\mathbf x_0=\mathbf x(t_k),\tag{27b}
$$
$$
\mathbf x_{\ell+1}=\mathbf h_d(\mathbf x_\ell,\mathbf u_\ell),\quad\ell\in\{0,\ldots,N_p-1\},\tag{27c}
$$
$$
\mathbf p_\ell\in\mathcal A,\quad\ell\in\{0,\ldots,N_p\},\tag{27d}
$$
$$
\lVert\mathbf v_\ell\rVert_2\le\bar v,\quad\ell\in\{0,\ldots,N_p\},\tag{27e}
$$
$$
\Omega_{s,\ell}\in[\underline\Omega,\bar\Omega],\quad\forall s\in\{1,2,3,4\},\ \ell\in\{0,\ldots,N_p\},\tag{27f}
$$
$$
R_i(\mathbf x_\ell)+s_{i,\ell}\ge R_{\min},\quad i\in\mathcal I,\ \ell\in\{0,\ldots,N_p\},\tag{27g}
$$
$$
s_{i,\ell}\ge0,\quad i\in\mathcal I,\ \ell\in\{0,\ldots,N_p\}.\tag{27h}
$$

式 (27a) 的目标对预测时域内各阶段跟踪代价与终端跟踪代价求和。约束 (27b) 把当前采样时刻 $t_k$ 的实测状态设为预测模型的初始条件。约束 (27c) 在每个预测步强制执行离散时间系统动力学 $\mathbf x_{\ell+1}=\mathbf h_d(\mathbf x_\ell,\mathbf u_\ell)$。约束 (27d) 与 (27e) 分别把预测轨迹限制在可行部署区域 $\mathcal A$ 内与最大速度界内。约束 (27f) 通过把各转子转速限制在 $[\underline\Omega,\bar\Omega]$ 内强制执行执行机构限制。约束 (27g) 是 (19e) 中瞬时速率要求的**软化版本**：(19e) 作为硬约束在模型失配或扰动下可能不可行，松弛变量使其放松，从而 OCP 本身总有解，而其二次惩罚使 QoS 违约尽可能小。

**4）NMPC 在线复杂度分析：** 在所提框架中，每个采样时刻的 NMPC 表述为一个非线性优化问题，该问题被线性化并转化为一系列二次规划 [42]。求解非线性规划需要三次计算量，表示为 $\mathcal O\left(I_0(n_z+n_a)^{3}\right)$，其中 $n_z$ 为决策变量总数、$n_a$ 为有效约束总数、$I_0$ 为求解器迭代次数 [43]。上述计算复杂度刻画的是优化问题本身；实际执行时间取决于目标机载硬件、数值求解器与实现细节。为在理论复杂度分析之外给出实用评估，第 V-E 节报告并讨论了所提框架的执行时间。

## V. 仿真结果

本节通过数值分析评估所提方法的有效性。先详述仿真设置（第 V-A 节），随后分析轨迹（第 V-B 节）、通信性能（第 V-C 节）、可扩展性（第 V-D 节）与 UAV 飞行动力学（第 V-E 节）。

仿真在 MATLAB R2024b 中使用 MATMPC 工具箱 [42] 完成；该工具箱采用定步长四阶 Runge–Kutta 积分器，并使用 qpOASES [43] 求解 NMPC 表述产生的二次规划子问题。所有仿真在运行 Linux Mint 22.3（内核 6.8.0）的台式机上执行，配置 Intel® Core™ i7-10700 CPU（8 核 16 线程，最高 4.8 GHz）与 16 GB 内存。

### A. 仿真设置与基准

为评估所提方法性能，考虑区域 $\mathcal A=[-200,200]^{2}\times[90,110]$。考虑 $I=5$ 个用户，其 $x$、$y$ 坐标在方形区域 $(p_{x,i},p_{y,i})\in[100,150]\times[-30,30]$ 内均匀随机分布。BS 天线位于世界系中心 $O_W$、高度 $h_{\mathrm{BS}}=68$ m，配备 $N=3$ 个天线单元，尺寸 $d_{H0}=d_{V0}=\lambda/2$（$\lambda$ 为 BS 发射信号波长）。BS 天线增益 $G_A=8$ dB，发射波长 $\lambda=0.15$ m、发射功率 $P_0=23$ dBm、带宽 $B_0=5$ MHz。考虑具有 $(M_H,M_V)=(4,4)$ 个单元的 RIS，其单元水平与垂直间距分别为 $d_{HR}=\lambda/2$、$d_{VR}=\lambda/2$。假设 1 m 处参考增益 $l_0=-30$ dB、噪声功率 $\sigma_0=-100$ dBm。满足用户 QoS 所需的最低数据率为 $R_{\min}=1.25$ Mbit/s。UAV 初始位置 $\mathbf p_{\mathrm{init}}=[-100;-100;h_R]$，最终目的地 $\mathbf p_{\mathrm{fin}}=[-100;100;h_R]$，期望 $z$ 坐标 $h_R=100$ m。参考轨迹生成的超参数取 $L=30000$、$E=8$、$\gamma=8$。

UAV 动力学模型参数与 NMPC 权重见表 II。期望姿态、速度与角速度对所有时间步 $\ell$ 分别为 $q_{d,\ell}=[1,0,0,0]^{\top}$、$\mathbf v_{d,\ell}=\mathbf 0$、$\boldsymbol\omega_{d,\ell}=\mathbf 0$。初始与最终状态为 $\mathbf x_I=[\mathbf p_{\mathrm{init}},q_{\mathrm{init}},\mathbf v_{\mathrm{init}},\boldsymbol\omega_{\mathrm{init}}]^{\top}$ 与 $\mathbf x_F=[\mathbf p_{\mathrm{fin}},q_{\mathrm{fin}},\mathbf v_{\mathrm{fin}},\boldsymbol\omega_{\mathrm{fin}}]^{\top}$，其中 $q_{\mathrm{init}}=q_{\mathrm{fin}}=q_{d,\ell}$、$\mathbf v_{\mathrm{init}}=\mathbf v_{\mathrm{fin}}=\mathbf 0$、$\boldsymbol\omega_{\mathrm{init}}=\boldsymbol\omega_{\mathrm{fin}}=\mathbf 0$。总飞行时长 $T=80$ s。

本文从动态建模与通信两方面评估各方案。**动态建模方面**考虑：(i) **水平姿态跟踪（HoT）**方案，对应第 IV-D 节所提跟踪方案，跟踪参数见表 II；(ii) **无姿态跟踪（NoT）**方案，对应 NMPC 中不做姿态与角速度跟踪的 ARIS，即该方案取 $\mathbf Q_q=\mathbf Q_{q,N_p}=\mathbf Q_\omega=\mathbf Q_{\omega,N_p}=\mathbf 0$（式 (25)），其余跟踪参数见表 II；(iii) **直线（SL）**方案，ARIS 沿从 $\mathbf p_{\mathrm{init}}$ 到 $\mathbf p_{\mathrm{fin}}$ 的直线轨迹飞行，对应跟踪权重取表 II 所示值。**通信方面**考虑三种方法：(i) 第 IV-A 与 IV-B 节所提 **BP** 方案，对应在整个任务时长内联合进行波束赋形与相移优化的 ARIS；(ii) **P** 方案，在 ARIS 任务期间只进行相移优化，而波束赋形向量固定为初始位置处的最优波束赋形；(iii) **B** 方案，飞行期间只做波束赋形，相移固定为初始位置处的最优相移。SL 方案与 BP 联合优化结合考虑；为简洁，所得 SL-BP 方案在下文其余部分简称为 SL 方案。**参考轨迹生成方面**考虑：**代理效用参考生成器（PURG）**，即采用式 (24) 所定义代价的算法 1；以及**速率参考生成器（RRG）**，即采用如下代价函数的算法 1：$C_l=R_{\max}-\sum_{i\in\mathcal I}R_i(\mathbf p^{l})$，其中 $R_{\max}$ 为采样顶点中的最大和速率。波束赋形向量与 RIS 相移分别用第 IV-A 与 IV-B 节的闭式表达式计算。此外还考虑**并行连续凸近似参考生成器（PSCA-RG）**，它采用 PSCA 算法 [44] 求解速率函数的一系列凸 Taylor 近似，在 40 个离散轨迹点上联合优化参考轨迹、波束赋形向量与 RIS 相移；所得轨迹随后被加密以匹配 PURG 采用的时间离散化。

### B. 轨迹与位置分析

正文图 4 给出算法 1 生成的参考轨迹。任务第一阶段，UAV 朝提供更高数据率的区域移动，尤其是靠近用户与 BS 的区域；第二阶段，轨迹转向前往最终目的地，同时仍偏好数据率水平较高的位置。因此到达最终位置与保持高通信质量两个目标都得到实现，证明算法 1 有效。

正文图 5 给出三维空间中的参考轨迹以及 HoT、NoT 轨迹。尽管全局运动模式看起来相似，仅凭三维可视化无法清晰量化相对参考的跟踪精度。更精确的比较见图 6，它描绘各位置分量随时间的演化。从位置—时间曲线可见，两方案都从 $\mathbf p_{\mathrm{init}}$ 出发并到达 $\mathbf p_{\mathrm{fin}}$，证实任务成功完成。$x$、$y$ 坐标在两种情况下表现相似；但 $z$ 坐标差异更明显：HoT 高度在 99.5 m 至 101.7 m 之间变化，而 NoT 高度在 99.9 m 至 100.1 m 之间变化。HoT 中观察到的更显著 $z$ 坐标变化归因于施加给 HoT 的姿态与角速度跟踪，而 NoT 中没有该跟踪。

正文图 7 比较所提 PURG 与 PSCA-RG 生成的参考轨迹。两个规划器都先把 UAV 导向靠近 BS 与用户簇的通信有利区域，再把它导向最终目的地。尽管 PURG 只依赖低复杂度代理代价，其轨迹与基于优化的 PSCA-RG 解的整体行为相当接近。

正文图 8 给出沿图 7 轨迹达到的归一化累积和速率。所有曲线按 PURG 方案达到的最大值归一化。两种方法在整个任务中表现出相似的增长，证实代理效用准确捕捉通信目标。有趣的是，在该场景中 PURG 取得比 PSCA-RG 更高的累积和速率，同时只需低复杂度的图搜索过程，而不必反复以更高复杂度求解凸优化问题。

正文图 9 说明代理效用指数 $\gamma$ 对生成轨迹的影响。对较小 $\gamma$（例如 $\gamma=2$），PURG 偏好更短轨迹，因而更接近初始与最终位置之间的直线路径。随 $\gamma$ 增大，通信代价愈发占主导，使规划轨迹逐步更接近 RRG 解。当 $\gamma=8$ 时，所得路径几乎与 RRG 轨迹重合，表明代理效用成功复现了通信驱动规划器的行为。

正文图 10 量化 $\gamma$ 对归一化累积和速率的影响（所有曲线按图中曲线最大值归一化）。增大 $\gamma$ 一致改善累积可达和速率，因为 UAV 在通信有利区域停留更久。$\gamma=8$ 时的性能已接近 RRG 基准，而 $\gamma=2$ 因更倾向最小化飞行距离而累积和速率最低。这些结果表明 $\gamma$ 提供了平衡通信性能与轨迹效率的有效机制。

### C. 通信性能比较

正文图 11 给出平均用户数据率随时间的变化。在 HoT 场景中，平均速率平滑演化：随 UAV 向信道条件更强的区域移动而上升，在约 40 s 达到峰值，随后随 UAV 离开高数据率区域而逐渐下降。HoT 场景仅在任务开始与结束时偶尔违反 QoS 约束，而 NoT 场景在整个任务中频繁出现 QoS 违约。NoT 方案表现出明显波动，反映不受控姿态变化引起的不稳定。整体抛物线趋势可由 UAV 轨迹解释：它先接近通信有利区域，随后在任务最后阶段离开该区域。HoT 场景中偶尔违反最低速率约束的原因在于 (27g) 中软化的 QoS 约束，它允许临时松弛以保持可行性并确保任务连续性。SL 基准呈现更平滑但持续较低的平均用户速率，接近最低 QoS 阈值，因为直线轨迹未利用通信有利区域。

正文图 12 给出和速率随时间的变化。可观察到所有基于 NoT 的方案都出现波动，而基于 HoT 的方案表现稳定。SL 方案的和速率比 HoT-BP 与 NoT-BP 平滑但持续更低，因为它在任务期间在通信有利区域停留更少时间。从通信角度看，BP 类方法取得最高和速率，其次是 P 类方法，而 B 类方法和速率最低。这表明相对仅波束赋形与仅相移优化，联合波束赋形与相移优化是必要的。这些结果还表明相移优化比波束赋形优化更重要，因为它在信号反射中起关键作用。

正文图 13 给出每用户平均累积吞吐量随时间的变化。HoT 场景相对 NoT 场景取得 13.77% 的提升，表明姿态跟踪对网络性能有显著影响。阴影区域表示平均值 ±1 个标准差，表明由于用户空间分布成簇，各用户经历相似的累积吞吐量。SL 基准的吞吐量持续低于 HoT 与 NoT，凸显通信不敏感的直线轨迹造成的性能损失。

正文图 14 给出累积吞吐量随时间的变化。可注意到 HoT 方案（HoT-BP、HoT-P、HoT-B）优于对应的 NoT 方案（NoT-BP、NoT-P、NoT-B），主要因为 NoT 方案中的姿态不稳定对 ARIS 运动与通信信道都产生不利影响。SL 作为 BP 方案，其累积吞吐量持续低于 HoT-BP 与 NoT-BP，说明通信不敏感的直线轨迹导致性能退化。此外从通信角度可观察到与图 12 相同的趋势：所提 HoT-BP 相对 HoT-B 与 HoT-P 分别至少提升 2.5 倍与 28%。

正文图 15 给出整个任务中平均松弛变量 $\mathbf s_\ell$ 的演化（在每个采样时刻对所有用户的 QoS 松弛变量取平均）。开始时松弛迅速增大，以补偿 UAV 初始加速所需大倾角造成的临时 QoS 违约——大倾角会降低姿态相关 RIS 信道质量。主飞行阶段（$t=5$–$75$ s）松弛逐渐减小，表明惩罚项 $\lVert\mathbf s_\ell\rVert_{\mathbf Q_{sv}}^{2}$ 在 UAV 几何允许时有效强制通信约束。当 UAV 接近目标时，松弛再次增大，以适应最终制动与稳定机动造成的通信退化，从而保持优化可行性。该行为表明 NMPC 能在具有挑战性的飞行条件下平衡通信性能与控制目标并保持鲁棒运行。

### D. 可扩展性分析

正文图 16 给出网络吞吐量随 RIS 单元数的变化（对 5 种网络配置取平均），其中采用 $R_{\min}=10$ Kbit/s 的最低速率要求以确保即使 RIS 单元数较少时也保持可行性。可见 HoT-BP 方案在全部 RIS 单元数下均优于其他所有方案，证明所提方法有效。SL 方案在所有 RIS 规模下的吞吐量都低于 HoT-BP 与 NoT-BP，但仍受益于 RIS 单元数增加。尽管 SL 采用联合波束赋形与相移优化，它仍持续劣于 HoT-P，与 NoT-P 表现相近，表明通信感知轨迹设计对实现高网络吞吐量至关重要。在最大 RIS 单元数时，性能排序为 HoT-BP、NoT-BP、HoT-P、SL、NoT-P、HoT-B、NoT-B。总体上，所有方案的网络吞吐量都随 RIS 单元数增加而提高。

正文图 17 给出网络吞吐量随用户数的变化（对全部基准方案、在 5 种网络配置上取平均），仿真中始终保持最低用户速率 $R_{\min}=1$ Mbit/s。无论用户数多少，HoT-BP 始终取得最高网络吞吐量，其后依次为 NoT-BP、HoT-P、NoT-P、SL-BP、HoT-B，而 HoT-B 始终优于 NoT-B。网络吞吐量仅出现较小变化，因为即使用户密度增大，TDMA 的总传输时长不变。这些结果进一步证实了联合优化波束赋形与 RIS 相移，以及显式计入 UAV 姿态，对最大化网络吞吐量的重要性。

### E. 动态跟踪与执行性能

正文图 18 给出位置、速度、角速度的跟踪误差以及 UAV 姿态与水平姿态之间测地距离随时间的变化。NoT 方案因约束更少而取得更好的位置跟踪，但 HoT 方案显著改善了角速度与姿态跟踪。该行为符合预期：HoT 显式强制执行姿态调节，在动力学中引入额外耦合，使平移精度略有下降。该权衡凸显了全耦合控制的一个关键局限：改善通信相关姿态要以更严格的运动约束为代价。

正文图 19 给出 UAV 速度剖面随时间的变化。速度在所施加的界内平滑演化，并在任务结束时逐渐减速到零。该行为与 NMPC 设计一致——控制器预见到终端条件并避免激进制动，表明具有良好的预测控制性能。

正文图 20 中，HoT 场景的欧拉角保持在小范围内，并在整个飞行过程中平滑演化。这表明控制器避免了姿态突变，这对飞行稳定性与通信性能都是有利的，因为大幅振荡会降低信道质量。

正文图 21 给出发角速度。角速度被严格限制在 $[-1,1]$ rad/s 内，表明控制器成功调节旋转运动，未引发振荡或不稳定。

正文图 22 中，转子转速保持在执行机构限制内并随时间平滑变化。没有出现饱和或高频振荡，表明 NMPC 生成可行且良态的控制输入，避免可能给执行机构造成压力或危及真实实现的高频突变指令。

正文图 23 给出全部控制迭代中 NMPC 计算时间的直方图。多数优化问题在 20 ms 内求解完成，全部求解时间都远低于采样周期 $T_s$（红线）。这表明所提 NMPC 框架满足实时执行要求，并表现出稳定一致的计算性能。

三种方案三维轨迹的视频见 https://youtu.be/TvkwDwx0meg，本次仿真的完整代码见 https://github.com/Akhas2000/ARIS-MATMPC。

## VI. 结论

本文研究了遮挡环境中用于连通性支撑的 ARIS 部署，重点关注 UAV 运动、RIS 姿态与通信性能之间的耦合。所提框架结合了姿态感知信道建模、带执行机构约束的多旋翼 UAV 动力学、简化子问题下波束赋形与 RIS 相移的闭式通信更新，以及基于 NMPC 的轨迹跟踪。该框架不整体求解原联合问题，而是通过基于分解的策略处理，保持计算可处理且动态可行。仿真结果表明，相对自由姿态基线，显式姿态跟踪改善了吞吐量并稳定了通信性能；联合波束赋形与 RIS 相移更新优于部分通信更新。结果还凸显了显式控制 RIS 姿态的重要性：强制姿态跟踪相对自由姿态场景使用户吞吐量提升 13.77%。此外，联合优化波束赋形与 RIS 相移显著改善网络性能，相对仅相移与仅波束赋形策略分别提升 28% 与最高 2.5 倍。本工作证明了在真实动态约束下 UAV 姿态对 ARIS 辅助通信的强烈影响。未来工作将把姿态作为联合通信与轨迹优化的额外自由度加以利用，并把框架扩展到移动用户、更一般的多用户相移设计，以及能量感知或安全感知的 ARIS 运行。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 44 条，源文 pp. 15–16）。

[1] H. Wang et al., "UAV Anti-Jamming Commun. With Power and Mobility Control," IEEE Trans. Wireless Commun., vol. 22, no. 7, pp. 4729–4744, 2023.

[2] P. P. Ray, "A review on 6G for space-air-ground integrated network: Key enablers, open challenges, and future direction," J. King Saud Univ. - Comp. and Inform. Scien., vol. 34, no. 9, pp. 6949–6976, 2022.

[3] M. Dai et al., "Unmanned-Aerial-Vehicle-Assisted Wireless Networks: Advancements, Challenges, and Solutions," IEEE Internet of Things J., vol. 10, no. 5, pp. 4117–4147, 2023.

[4] D. Bonilla Licea et al., "When Robotics Meets Wireless Commun.: An Introductory Tutorial," Proc. IEEE, vol. 112, no. 2, pp. 140–177, 2024.

[5] M. Vaezi et al., "Cellular, Wide-Area, and Non-Terrestrial IoT: A Survey on 5G Advances and the Road Toward 6G," IEEE Commun. Surveys and Tutorials, vol. 24, no. 2, pp. 1117–1174, 2022.

[6] M. Eskandari et al., "Trajectory Planning for UAVs Equipped With RISs to Provide Aerial LoS Service for Mobile Nodes in 5G/Optical Wireless Commun. Networks," IEEE Trans. Veh. Technol., vol. 72, no. 6, pp. 8216–8221, 2023.

[7] A. V. Savkin et al., "Joint Multi-UAV Path Planning and LoS Commun. for Mobile-Edge Computing in IoT Networks With RISs," IEEE Internet of Things J., vol. 10, no. 3, pp. 2720–2727, 2023.

[8] Y. Liu et al., "Reconfigurable Intelligent Surfaces: Principles and Opportunities," IEEE Commun. Surveys and Tutorials, vol. 23, no. 3, pp. 1546–1577, 2021.

[9] H. Yang et al., "Beyond Limitations of 5G with RIS: Field Trial in a Commercial Network, Recent Advances, and Future Directions," IEEE Commun. Mag., vol. 62, no. 10, pp. 132–138, 2024.

[10] Q. Wu et al., "Intelligent Surfaces Empowered Wireless Network: Recent Advances and the Road to 6G," Proc. IEEE, vol. 112, no. 7, pp. 724–763, 2024.

[11] X. Cao et al., "Reconfigurable Intelligent Surface-Assisted Aerial-Terrestrial Commun. via Multi-Task Learning," IEEE J. Selected Areas in Commun., vol. 39, no. 10, pp. 3035–3050, 2021.

[12] Z. Peng et al., "Beamforming Optimization for Active RIS-Aided Multiuser Commun. With Hardware Impairments," IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 9884–9898, 2024.

[13] M. Sherman et al., "Optimizing AoI in UAV-RIS-Assisted IoT Networks: Off Policy Versus On Policy," IEEE Internet of Things J., vol. 10, no. 14, pp. 12 401–12 415, 2023.

[14] S. Arzykulov et al., "Aerial RIS-Aided Physical Layer Security: Optimal Deployment and Partitioning," IEEE Trans. Cognitive Commun. and Networking, vol. 10, no. 5, pp. 1867–1882, 2024.

[15] P. Ribeiro et al., "On the Energy Consumption of Rotary-Wing and Fixed-Wing UAVs in Flying Networks," 20th Wireless On-Demand Network Systems and Services Conference, pp. 1–4, 2025.

[16] S. Leutenegger et al., "Flying Robots," in Springer Handbook of Robotics. Springer, 2016, pp. 623–670.

[17] H. Lu et al., "Aerial Intelligent Reflecting Surface: Joint Placement and Passive Beamforming Design With 3D Beam Flattening," IEEE Trans. Wireless Commun., vol. 20, no. 7, pp. 4128–4143, 2021.

[18] L. Wang et al., "Joint Trajectory and Passive Beamforming Design for Intelligent Reflecting Surface-Aided UAV Communications: A Deep Reinforcement Learning Approach," IEEE Trans. Mobile Computing, vol. 22, no. 11, pp. 6543–6553, 2023.

[19] Q. Wu et al., "Towards Smart and Reconfigurable Environment: Intelligent Reflecting Surface Aided Wireless Network," IEEE Commun. Mag., vol. 58, no. 1, pp. 106–112, 2020.

[20] M. Alsenwi et al., "RIS-UAV Integration for Enhanced Coverage and Energy-Efficient 6G Wireless Networks," IEEE Trans. Green Commun. and Networking, pp. 1–1, 2025.

[21] H. Mei et al., "Joint Trajectory-Task-Cache Optimization With Phase-Shift Design of RIS-Assisted UAV for MEC," IEEE Wireless Commun. Lett., vol. 10, no. 7, pp. 1586–1590, 2021.

[22] ——, "3D-Trajectory and Phase-Shift Design for RIS-Assisted UAV Systems Using Deep Reinforcement Learning," IEEE Trans. Veh. Technol., vol. 71, no. 3, pp. 3020–3029, 2022.

[23] B. Duo et al., "Joint Dual-UAV Trajectory and RIS Design for ARIS-Assisted Aerial Computing in IoT," IEEE Internet of Things J., vol. 10, no. 22, pp. 19 584–19 594, 2023.

[24] S. Li et al., "Joint UAV Trajectory and Beamforming Designs for RIS-Assisted MIMO System," IEEE Trans. Veh. Technol., vol. 73, no. 4, pp. 5378–5392, 2024.

[25] C. Liu et al., "Joint 3D Orientation and Location Optimization for UAV-Mounted Intelligent Reflecting Surface," in IEEE Global Commun. Conference, 2024, pp. 2725–2730.

[26] A. B. M. Adam et al., "Secure Communication in UAV–RIS-Empowered Multiuser Networks: Joint Beamforming, Phase Shift, and UAV Trajectory Optimization," IEEE Syst. J., vol. 18, no. 2, pp. 1009–1019, 2024.

[27] Q. Wu et al., "Intelligent Reflecting Surface Enhanced Wireless Network via Joint Active and Passive Beamforming," IEEE Trans. Wireless Commun., vol. 18, no. 11, pp. 5394–5409, 2019.

[28] K. Guo et al., "Deep Reinforcement Learning and NOMA-Based Multi-Objective RIS-Assisted IS-UAV-TNs: Trajectory Optimization and Beamforming Design," IEEE Trans. Intelligent Transportation Systems, vol. 24, no. 9, pp. 10 197–10 210, 2023.

[29] X. Tang et al., "Secure Communication With UAV-Enabled Aerial RIS: Learning Trajectory With Reflection Optimization," IEEE Trans. Intelligent Vehicles, pp. 1–10, 2023.

[30] L. Brunke et al., "Safe Learning in Robotics: From Learning-Based Control to Safe Reinforcement Learning," Annu. Rev. Control, Robotics, and Autonomous Systems, vol. 5, pp. 411–444, 2022.

[31] R. Cheng et al., "End-to-End Safe Reinforcement Learning through Barrier Functions for Safety-Critical Continuous Control Tasks," in AAAI Conf. on Art. Intel., vol. 33, no. 1, 2019, pp. 3387–3395.

[32] M. Eskandari et al., "Model Predictive Control-Based 3D Navigation of a RIS-Equipped UAV for LoS Wireless Communication With a Ground Intelligent Vehicle," IEEE Trans. Intel. Veh., vol. 8, no. 3, pp. 2371–2384, 2023.

[33] B. Li et al., "Aerial RIS-Enhanced Communications: Joint UAV Trajectory, Altitude Control, and Phase Shift Design," IEEE Trans. Wireless Commun., pp. 1–1, 2025, in Press.

[34] M. Lee et al., "A Distributed Two-Layer Framework for Teleoperated Platooning of Fixed-Wing UAVs via Decomposition and Backstepping," IEEE Robotics and Automation Lett., vol. 6, no. 2, pp. 3655–3662, 2021.

[35] E. Bayro-Corrochano, "A Survey on Quaternion Algebra and Geometric Algebra Applications in Engineering and Computer Science 1995–2020," IEEE Access, vol. 9, pp. 104 326–104 355, 2021.

[36] O. A. Ghasemi, M. C. Amirani, and M. Azghani, "Resource and Power Allocation for Sum-Throughput Maximization in RIS-Assisted TDMA Wireless Sensor Networks," IEEE IoT J., vol. 11, no. 13, pp. 24 123–24 133, 2024.

[37] O. A. Ghasemi and M. C. Amirani, "Resource Allocation in a RIS-Assisted TDMA Wireless Powered Sensor Network Using UAV," IEEE Commun. Lett., vol. 29, no. 6, pp. 1375–1379, 2025.

[38] A. K. A. H. Saliah et al., "Harnessing the Potential of Omnidirectional UAVs in RIS-Enabled Wireless Networks," in IEEE International Conference on Acoustics, Speech and Signal Processing, 2025, pp. 1–5.

[39] E. Bjornson et al., in Massive MIMO Networks: Spectral, Energy, and Hardware Efficiency, 2017.

[40] H. B. Jeon et al., "An energy-efficient aerial backhaul system with reconfigurable intelligent surface," IEEE Trans. Wireless Commun., vol. 21, pp. 6478–6494, 8 2022.

[41] A. Dmytruk et al., "A Perception-Aware NMPC for Vision-Based Target Tracking and Collision Avoidance with a Multi-Rotor UAV," in Intern. Conf. on Unm. Air. Sys., 2022, pp. 1668–1673.

[42] Y. Chen et al., "MATMPC - A MATLAB Based Toolbox for Real-time Nonlinear Model Predictive Control," in European Control Conference, 2019, pp. 3365–3370.

[43] H. J. Ferreau et al., "qpOASES: A Parametric Active-Set Algorithm for Quadratic Programming," Mathematical Programming Computation, vol. 6, no. 4, pp. 327–363, 2014.

[44] G. Scutari et al., "Decomposition by Partial Linearization: Parallel Optimization of Multi-Agent Systems," IEEE Trans. Signal Processing, vol. 62, no. 3, pp. 641–656, 2014.

## 图注与表注

**表 I：记号表。** 分为通信（用户、BS 天线与 RIS 单元索引集合 $\mathcal I,\mathcal N,\mathcal M$；数量 $I,N,M$；信道 $\mathbf H,\mathbf g_i,\boldsymbol\Theta$；位置 $\mathbf p^{\mathrm{BS}},\mathbf p_i,\mathbf p^{v}$；波束赋形 $\mathbf f$ 与孔径增益 $G_i^{\mathrm{ap}}$；SNR $\eta_i$、数据率 $R_i$ 与最低 QoS 速率 $R_{\min}$；发射功率 $P_0$、带宽 $B_0$、噪声功率 $\sigma^{2}$）、UAV 动力学模型（位置 $\mathbf p$、姿态 $q$、线速度 $\mathbf v$、角速度 $\boldsymbol\omega$；质量 $m$、重力常数 $g$、惯性矩阵 $\mathbf J$；总推力 $u_T$、控制力矩 $\boldsymbol\tau$、转子转速 $\boldsymbol\Omega$；转速限制 $\underline\Omega,\bar\Omega$ 与最大速度 $\bar v$；状态 $\mathbf x$、控制 $\mathbf u$、动力学 $\mathbf h(\cdot)$）与 NMPC（采样时间 $T_s$、预测时域 $N_p$；第 $\ell$ 步状态 $\mathbf x_\ell$、控制 $\mathbf u_\ell$、参考状态 $\mathbf x_{d,\ell}$ 与 QoS 松弛 $s_{i,\ell}$；测地距离 $d_q(\cdot)$、飞行区域 $\mathcal A$）三部分。

**表 II：UAV 动力学模型参数与 NMPC 权重。** UAV 动力学模型：质量 $m=1.042$ kg，重力 $g=9.81$ m/s²，臂长 $d=0.23$ m，惯性矩阵 $\mathbf J=\operatorname{diag}(0.015,0.015,0.070)$ kg·m²，推力系数 $b_f=5.95\times10^{-4}$ N/Hz²，力矩系数 $b_m=1\times10^{-5}$ N·m/Hz²，转速限制 $\underline\Omega=16$、$\bar\Omega=100$ Hz，最大速度 $\bar v=17$ m/s。NMPC：采样时间 $T_s=80$ ms，预测时域 $N_p=15$ 步，位置权重 $\mathbf Q_p=\mathbf Q_{p,N_p}=\operatorname{diag}(10,10,12)$，速度权重 $\mathbf Q_v=\mathbf Q_{v,N_p}=1.1\,\operatorname{diag}(1,1,1)$，角速度权重 $\mathbf Q_\omega=\mathbf Q_{\omega,N_p}=30\,\operatorname{diag}(1,1,1)$，四元数权重 $Q_q=Q_{q,N_p}=10$，松弛变量权重 $\mathbf Q_{sv}=2\times10^{-12}\operatorname{diag}(1,\ldots,1)$。

**图 1：ARIS 辅助通信系统架构。** 刚性安装在多旋翼 UAV 上的 RIS 在基站与地面用户之间中继信号；UAV 轨迹在世界（惯性）参考系 $\mathcal F_W$ 中表示，RIS 姿态在 UAV 机体固连系 $\mathcal F_B$ 中表示。

**图 2：ARIS 辅助通信系统的几何模型**，含姿态感知坐标系与信号方向 $\mathbf s$。

**图 3：所提次优控制策略的框图**（波束赋形优化、相移优化、参考轨迹设计与 NMPC 四个模块）。

**图 4：通信感知代价地图上的参考轨迹**，显示所选路径朝有利区域行进。

**图 5：三维 UAV 轨迹跟踪**，曲线分别表示参考、HoT 与 NoT 路径，展示整体跟踪行为。

**图 6：HoT 与 NoT 的 UAV 位置分量随时间变化**，展示跟踪性能与高度变化。

**图 7：所提 PURG 轨迹与 PSCA-RG 基准在二维空间平面中的比较。**

**图 8：PURG 与 PSCA-RG 所生成参考轨迹在任务时长内达到的归一化累积和速率。** 曲线按 PURG 方案达到的最大值归一化。

**图 9：相对 RRG 轨迹、PURG 轨迹对不同代理效用指数 $\gamma$ 取值的敏感性分析。**

**图 10：不同 $\gamma$ 取值下的归一化累积和速率**，显示 PURG 随 $\gamma$ 增大向 RRG 收敛；所有曲线按全部方法达到的最大累积和速率归一化。

**图 11：平均用户数据率随时间变化**，比较 HoT、NoT 与 SL 方案，突出稳定性与 QoS 满足情况的改善。

**图 12：不同方案的和速率随时间变化**，展示联合优化与姿态跟踪的收益。

**图 13：每用户平均累积吞吐量随时间变化**，说明姿态跟踪与通信感知轨迹设计的收益。

**图 14：累积吞吐量**，展示姿态感知与联合优化策略带来的吞吐量改善。

**图 15：HoT 方案中平均 QoS 松弛变量随时间的演化**（对所有用户取平均）。

**图 16：网络吞吐量随 RIS 单元数的变化**，展示可扩展性与性能改善趋势。

**图 17：网络吞吐量随用户数的变化**，凸显所提方法的效率。

**图 18：跟踪误差随时间变化**，比较 HoT 与 NoT，说明位置跟踪与姿态跟踪之间的权衡。

**图 19：UAV 速度剖面随时间变化**，显示在所施加限制内的平滑演化。

**图 20：HoT 方案中的欧拉角随时间变化**，体现平滑姿态行为。

**图 21：角速度随时间变化**，表现出有界行为。

**图 22：转子转速随时间变化**，说明在物理限制内的平滑执行。

**图 23：全部控制迭代中 NMPC 优化求解时间的分布**，红色竖线表示采样周期 $T_s$。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.23157v1（cs.NI，2026-09-19；IEEE TVT 预印本，2026 年 9 月录用）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（含 A. 相关工作、B. 贡献、记号说明）；第 II 节系统与通信模型（A. 系统与坐标系、B. 姿态感知 ARIS 传播几何、C. 信道模型、D. UAV 动力学模型）；第 III 节问题陈述；第 IV 节所提方案（A. 波束赋形优化、B. 相移优化与算法 1、C. 离线轨迹生成、D. 基于 NMPC 的轨迹跟踪）；第 V 节仿真结果（A. 仿真设置与基准、B. 轨迹与位置分析、C. 通信性能比较、D. 可扩展性分析、E. 动态跟踪与执行性能）；第 VI 节结论；44 条英文参考文献；表 I—表 II；图 1—图 23 图注。

**源文页码：** 第 1 页（题名、作者与单位、基金、摘要、关键词、引言开头）→ 第 2 页（引言续、相关工作）→ 第 3 页（相关工作续、贡献、记号、第 II 节开头、图 1）→ 第 4 页（表 I、第 II-A 节、II-B 节与式 (1)—(3)）→ 第 5 页（图 2、式 (4)—(8)）→ 第 6 页（式 (9)—(18)、第 III 节与式 (19)、图 3、第 IV 节开头）→ 第 7 页（IV-A/IV-B 与式 (20)—(23)、算法 1、IV-C 开头、式 (24)）→ 第 8 页（表 II、IV-D 与式 (25)—(27)）→ 第 9 页（图 4—图 5、第 V 节与 V-A 设置）→ 第 10 页（图 6—图 9、仿真参数续、基准方案定义）→ 第 11 页（图 10—图 13、Scheme 定义续、RRG/PSCA-RG）→ 第 12 页（图 14—图 17、V-B/V-C/V-D 分析）→ 第 13 页（图 18—图 22、V-C 续、V-D）→ 第 14 页（图 23、V-E 分析）→ 第 15 页（V-E 续、视频与代码链接、第 VI 节结论、参考文献 [1]—[9]）→ 第 16 页（参考文献 [10]—[44]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 I 与表 II 的全部条目/数值已按 PDF 第 4、8 页渲染图逐项核对（含惯性矩阵、推力/力矩系数、转速限制、NMPC 各权重），未改变任何数值。
2. 图 1—图 23 均未上传图片；本页在图注与表注小节统一给出 23 条中文图注与 2 条表注，正文中按"正文图 N/表 N"引用，未重复图注原文。
3. 公式覆盖原文编号式 (1)—(27) 及其全部子式（17a—17d、19a—19i、20a—20b、22a—22b、27a—27h）；原文式 (17)、(19)、(27) 为多行分列编号，译文逐行给出并保留原 (a)(b)… 标号。
4. **原文疑点／说明：** ①原文式 (16) 的数据率带 $B_0/I$ 因子（对 $I$ 个用户均分带宽），与表 I 中 $I$ 为用户数的定义一致，译文照录；②原文式 (15) 的 SNR 记号 $\eta_i$ 与表 I 一致，式 (15)—(16) 中 $G_i^{\mathrm{ap}}$ 与 $G_A$ 的位置按原文照录；③原文式 (7) 中 $\mathbf g_i$ 为 $1\times M$ 行向量、$\boldsymbol\Theta$ 为 $M\times M$，量纲核算与原文一致；④原文表 II 中力矩系数单位为 N·m/Hz²、推力系数为 N/Hz²，照录；⑤原文参考文献 [22] 与 [21] 作者相同，原文用 "——" 省略作者名，译文照录为 "——"。
5. 原文为 IEEE TVT 预印本（接受稿），页码 1—16；页面目录日期 2026-09-26 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-19）与 TVT 录用（2026-09）信息。
6. 版权：本文为 arXiv 预印本（cs.NI），本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
