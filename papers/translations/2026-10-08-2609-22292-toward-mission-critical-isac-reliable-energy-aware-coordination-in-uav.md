---
layout: page
title: "面向任务关键型 ISAC：无人机集群的可靠能量感知协同｜中文全文译文"
permalink: /papers/translations/2026-10-08-2609-22292-toward-mission-critical-isac-reliable-energy-aware-coordination-in-uav/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/2ecf8672a0c05fba/) · [原文 arXiv](https://arxiv.org/abs/2609.22292) · [全部目录](/papers/catalog/)

# 面向任务关键型 ISAC：无人机集群的可靠能量感知协同

**原题：** Toward Mission-Critical ISAC: Reliable Energy-Aware Coordination in UAV Swarms  
**作者：** Masoud Shokrnezhad、Tarik Taleb、Amir Javadpour（ICTFICIAL Oy，芬兰；Ruhr University Bochum，德国）  
**版本：** arXiv:2609.22292v1（cs.NI），2026 年 9 月 14 日提交，原文 6 页。  
**范围与状态：** 全文中文译稿：摘要、正文各节、结论、致谢、图注与参考文献（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

部署于任务关键型应用中的无人机（unmanned aerial vehicle，UAV）集群必须同时跟踪一个移动空中目标并维持可靠的数据链路。然而，主动式通感一体化（integrated sensing and communication，ISAC）运行会在推进与发射两方面造成**双重能量负担**，并可能因电池过早耗尽而威胁任务连续性。本文提出一种两层 UAV 集群架构：任务 UAV（mission UAV，MUAV）执行协作式 ISAC 以跟踪移动空中目标，而携带太阳能采集板的专用充电 UAV（charging UAV，CUAV）通过空中 UAV 对 UAV 无线能量传输（wireless power transfer，WPT）为低电量 MUAV 补能。本文建模并联合最小化 MUAV 轨迹、逐时隙感知—通信时间划分、WPT 调度与准入、以及 CUAV 会合轨迹上的协作后验克拉美–罗界（posterior Cramér–Rao bound，PCRB），约束包括最小上行速率、两层能量因果性、WPT 接近性、避碰与速度限制；由此得到一个非凸混合整数规划（mixed-integer program，MIP），据作者所知，这是首个把协作式 ISAC 感知质量与空中 WPT、两层能量管理联合耦合的建模。为高效求解，本文提出**滚动时域交替优化**（Receding-Horizon Alternating Optimization，RHAO）：该逐时隙四块算法把问题分解为基于匈牙利算法的充电准入、基于逐次凸近似（successive convex approximation，SCA）的 MUAV 轨迹与时间划分、CUAV 会合轨迹、以及 WPT 功率分配，并具有单调收敛保证。仿真结果表明，与固定时间划分基线相比，RHAO 将平均 PCRB 降低 **16.8 倍**；与静态轨迹方案相比降低 **5.4 倍**；同时空中 WPT 子系统在整个任务时域内使所有 MUAV 保持在能量临界阈值之上。

**关键词：** 通感一体化；无人机集群；无线能量传输；目标跟踪；能量管理。

## I. 引言

无人机正越来越多地部署于任务关键型应用，例如空中监视、搜索救援、基础设施巡检与低空物流；这些场景要求实时态势感知与可靠数据连接同时存在。通感一体化（ISAC）使 UAV 能够共享频谱与硬件资源，以同时完成协作式目标跟踪与遥测中继，从而在不配备专用感知硬件的条件下获得较高的频谱效率。在多 UAV 的 ISAC 集群中，每个节点贡献距离测量，其 Fisher 信息可以协作合并：集群的几何分集能够把目标状态估计的后验克拉美–罗界（PCRB）压低到远超任何单个 UAV 所能达到的水平，从而实现对高动态空中目标的精确跟踪。

然而，主动式 ISAC 运行会带来**双重能量负担**（跟随轨迹所需的推进能量，以及雷达波形与上行数据中继所需的发射功率），从而加速电池耗尽。能量耗尽会迫使 UAV 中止任务或返航，恰在持续覆盖最为关键之时瓦解协作感知编队。两层架构为此提供了原理性补救：搭载太阳能采集板的专用充电 UAV（CUAV）自主与低电量任务 UAV（MUAV）会合，并通过空中 UAV 对 UAV（U2U）无线能量传输（WPT）为其补能；于是任务连续性得以维持，而无任何 MUAV 需要离开集群。然而，在统一的感知质量目标下联合优化协作式 ISAC 轨迹、逐时隙感知—通信时间划分、WPT 准入与功率调度、以及两层能量因果性，仍是一个开放问题，这也是本文的焦点。

面向空中目标跟踪的多 UAV ISAC 已引起越来越多的研究兴趣。Yan 等人 [1] 提出一种由一个地面基站（BS）与多架 UAV 协作最小化 PCRB 的系统，在逐 UAV 通信约束下通过课程引导的异构智能体近端策略优化算法求解联合轨迹—波束成形问题。Wang 等人 [2] 在低空经济背景下针对同一 PCRB 最小化目标，通过一种高效的迭代下降方向方案联合优化 UAV 轨迹、带宽分配与 UAV–BS 关联。Li 等人 [3] 研究了低空网络中采用动态时分策略的协作式 ISAC，在累积雷达互信息约束下通过交替优化与逐次凸近似（SCA）最大化总通信速率。Feng 等人 [4] 把 ISAC 波形与扩展卡尔曼滤波（EKF）结合，用于三维城市中继轨迹规划，并用深度 Q 网络规避建筑物遮挡、服务非视距（LoS）用户。这些工作均未对机载电池动态或空中 WPT 补能进行建模。

在能量管理方面，Naoya 等人 [5] 研究了由一架供给 UAV 支持的多 UAV 数据采集：该供给 UAV 在飞行中通过 WPT 为任务无人机充电，作者用模拟退火与遗传算法最大化可运行的轮次。Zhang 等人 [6]（eU2U）针对物联网数据采集提出能效优先的 U2U 无线充电与轨迹协同设计，通过 Fermat 点几何启发式最小化总推进与充电损失能量。Mondal 等人 [7] 研究了随机燃料消耗下的风险感知 UAV–UGV 协作路由，采用注意力引导的强化学习框架。Ye 等人 [8]、Gao 等人 [9] 以及 Farhoudi 等人 [10]、[11] 考察了能量采集条件下的多层 UAV 边缘计算系统，分别使用 Lyapunov 优化与多智能体强化学习来在任务时延与长期能量稳定性之间取得平衡。这些工作均未纳入 ISAC 感知目标或 PCRB 度量。

尽管取得了上述进展，两条研究脉络之间仍存在一个根本性空白：ISAC-UAV 类工作把电池能量视为无限，而 WPT 辅助的 UAV 类工作聚焦于数据采集或计算、缺乏协作式感知目标。据作者所知，尚无既有建模在统一的 PCRB 准则下同时处理协作式 ISAC 轨迹设计、逐 UAV 感知—通信时间划分、带逐时隙准入的空中 U2U WPT 调度、以及两层能量因果性。本文的贡献如下：

(i) 提出一种**两层集群架构**：MUAV 执行协作式 ISAC 以跟踪移动空中目标，而配备太阳能的 CUAV 通过按需空中 WPT 维持其运行。

(ii) 在协作式 PCRB 最小化目标下，建模并联合优化 MUAV 轨迹、感知—通信时间划分、U2U WPT 调度与准入、以及 CUAV 会合轨迹，得到一个把 ISAC 感知质量与两层能量因果性联合耦合的非凸混合整数规划（MIP）。

(iii) 提出 **RHAO**（滚动时域交替优化，Receding-Horizon alternating optimization），把该 MIP 分解为逐时隙子问题（充电准入、MUAV 轨迹与时间划分、CUAV 会合、WPT 功率分配），并给出单调收敛保证。

本文余下部分安排如下：第 II 节给出系统模型并建立问题；第 III 节介绍 RHAO；第 IV 节报告仿真结果；第 V 节总结全文。

## II. 系统模型与问题建模

### A. 网络架构

考虑一个两层 UAV 集群，包含 $N$ 架 MUAV（索引集 $\mathcal N=\{1,\ldots,N\}$）与 $M$ 架 CUAV（索引集 $\mathcal M=\{1,\ldots,M\}$）。集群与一个位于 $\mathbf q_{\mathrm{bs}}\in\mathbb R^3$ 的固定地面基站（BS）协作，以跟踪一个移动空中目标。任务时域被离散为 $T$ 个时隙，每时隙长度 $\tau$ 秒；$\mathbf q_n[t]\in\mathbb R^3$ 与 $\mathbf u_m[t]\in\mathbb R^3$ 分别表示 MUAV $n$ 与 CUAV $m$ 在时隙 $t$ 的三维位置。MUAV 执行协作式 ISAC 任务：它们发射 ISAC 波形以采集目标的距离测量，并把由此得到的感知／遥测数据中继给 BS。CUAV 携带太阳能采集板；当某 MUAV 的荷电状态（state of charge，SoC）低于安全水平时，一架 CUAV 与其会合并通过空中 WPT 输送能量。图 1 展示了该两层架构。

### B. ISAC 感知与通信模型

**1）目标动力学。** 时隙 $t$ 的目标状态为 $\boldsymbol\zeta[t]=[\boldsymbol\xi[t]^{T},\dot{\boldsymbol\xi}[t]^{T}]^{T}\in\mathbb R^{6}$，其中 $\boldsymbol\xi[t]=[x_t,y_t,z_t]^{T}$ 是目标三维位置，$\dot{\boldsymbol\xi}[t]=[\dot x_t,\dot y_t,\dot z_t]^{T}$ 是对应速度。在时隙长度 $\tau$ 上的近匀速（near-constant-velocity）模型下：

$$
\boldsymbol\zeta[t]=\mathbf F\boldsymbol\zeta[t-1]+\boldsymbol\varpi[t-1],\qquad
\mathbf F=\mathbf I_3\otimes\begin{bmatrix}1 & \tau\\ 0 & 1\end{bmatrix},\tag{1}
$$

其中过程噪声 $\boldsymbol\varpi[t]\sim\mathcal N(\mathbf 0,\mathbf Q)$，$\mathbf Q\in\mathbb R^{6\times6}$ 为过程噪声协方差矩阵，刻画时隙之间目标机动的不确定性。

**2）感知—通信时间划分。** 每个时隙中，MUAV $n$ 把比例 $\delta_n[t]\in[0,1]$ 分配给雷达感知，把互补比例 $(1-\delta_n[t])$ 分配给与 BS 的上行通信；两个阶段均使用发射功率 $P_n^{\mathrm{tx}}$。

**3）雷达测量模型。** MUAV $n$ 对目标进行单站（monostatic）距离感知。令 $d_n[t]=\lVert\mathbf q_n[t]-\boldsymbol\xi[t]\rVert$ 表示时隙 $t$ 的 MUAV—目标真实距离。由雷达距离方程 [1] 导出的相应距离测量噪声方差为

$$
\sigma_n^2[t]=\frac{\kappa_s\,d_n[t]^{4}}{\delta_n[t]\,P_n^{\mathrm{tx}}},\tag{2}
$$

其中 $\kappa_s$ 归纳了波长、带宽、天线增益、目标雷达截面积（RCS）、噪声系数与噪声功率 [1]。此外，距离测量关于目标状态的雅可比为

$$
\mathbf h_n[t]=\left[\frac{(\mathbf q_n[t]-\boldsymbol\xi[t])^{T}}{d_n[t]},\ \mathbf 0_{1\times3}\right]\in\mathbb R^{1\times6}.\tag{3}
$$

**4）PCRB。** MUAV $n$ 在每个时隙的 Fisher 信息贡献为

$$
\mathbf J_{M,n}[t]=\frac{1}{\sigma_n^2[t]}\,\mathbf h_n[t]^{T}\mathbf h_n[t].\tag{4}
$$

记 $\mathbf J[t]\in\mathbb R^{6\times6}$ 为时隙 $t$ 的协作 Fisher 信息矩阵（FIM），其逆 $\mathbf J[t]^{-1}$ 即 $\boldsymbol\zeta[t]$ 上的 PCRB，作为估计误差下界。$\mathbf J[t]$ 按下式递推更新 [2]：

$$
\mathbf J[t]=\underbrace{\left(\mathbf F\,\mathbf J[t-1]^{-1}\mathbf F^{T}+\mathbf Q\right)^{-1}}_{\mathbf J_p[t]}+\sum_{n=1}^{N}\mathbf J_{M,n}[t],\tag{5}
$$

其中 $\mathbf J_p[t]$ 是由时隙 $t-1$ 传播而来的**预测 FIM**，并取 $\mathbf J[0]=\mathbf J_0$ 为初始先验 FIM。时隙 $t$ 的感知性能度量为 PCRB 矩阵的迹：

$$
\rho_t=\operatorname{tr}\left(\mathbf J[t]^{-1}\right).\tag{6}
$$

注意 $\rho_t$ 通过式 (2)—(4) 耦合了 MUAV 位置、感知时间比例与发射功率；而 MUAV 之间的几何分集（目标周围的角展布）通过 FIM 结构直接降低 $\rho_t$。

**5）上行通信模型。** MUAV $n$ 到 BS 的准视距主导空地信道增益为

$$
h_n[t]=\frac{\beta_0}{\lVert\mathbf q_n[t]-\mathbf q_{\mathrm{bs}}\rVert^{2}},\tag{7}
$$

其中 $\beta_0$ 是 1 m 处的参考信道增益。通信阶段可达的上行速率为

$$
R_n[t]=(1-\delta_n[t])\,B\log_2\left(1+\frac{P_n^{\mathrm{tx}}h_n[t]}{\sigma^{2}}\right),\tag{8}
$$

其中 $B$ 是分配带宽，$\sigma^{2}$ 是噪声功率。

### C. 能量与无线能量传输模型

**1）推进功率。** MUAV 与 CUAV 均为旋翼 UAV。推进功率作为水平速度 $v$ 的函数服从标准模型 [12]：

$$
P^{\mathrm{prop}}(v)=P_0\left(1+\frac{3v^{2}}{V_{\mathrm{tip}}^{2}}\right)
+P_1\sqrt{\sqrt{1+\frac{v^{4}}{4v_h^{4}}}-\frac{v^{2}}{2v_h^{2}}}
+\frac{1}{2}d_0\rho_a s_r A v^{3},\tag{9}
$$

其中 $P_0$、$P_1$、$V_{\mathrm{tip}}$、$v_h$、$d_0$、$\rho_a$、$s_r$ 与 $A$ 为气动常数。

**2）MUAV 电池动态。** 记 $B_n[t]$ 为 MUAV $n$ 在时隙 $t$ 开始时的 SoC。其演化为

$$
B_n[t+1]=B_n[t]-\left(P^{\mathrm{prop}}(v_n[t])+P_n^{\mathrm{tx}}\right)\tau
+\zeta\sum_{m\in\mathcal M}a_{n,m}[t]\,p_{n,m}[t]\,\tau,\tag{10}
$$

其中 $v_n[t]=\lVert\mathbf q_n[t+1]-\mathbf q_n[t]\rVert/\tau$ 是 MUAV 速度；$a_{n,m}[t]\in\{0,1\}$ 是**充电准入指示**（CUAV $m$ 为 MUAV $n$ 充电）；$p_{n,m}[t]\ge0$ 是 CUAV $m$ 的 WPT 发射功率；$\zeta\in(0,1)$ 是端到端 WPT 效率（计入波束成形、转换与 WPT 距离 $d_{\mathrm{wpt}}$ 处的路径损耗）。

**3）CUAV 电池动态。** 记 $B_m^{c}[t]$ 为 CUAV $m$ 的 SoC。CUAV 以功率 $e_m[t]\ge0$ 采集环境能量（例如太阳辐照），并把能量用于推进与 WPT 发射：

$$
B_m^{c}[t+1]=B_m^{c}[t]+e_m[t]\tau-P^{\mathrm{prop}}(v_m^{c}[t])\tau
-\sum_{n\in\mathcal N}a_{n,m}[t]\,p_{n,m}[t]\,\tau,\tag{11}
$$

其中 $v_m^{c}[t]=\lVert\mathbf u_m[t+1]-\mathbf u_m[t]\rVert/\tau$。

### D. 问题建模

关于联合变量集 $\boldsymbol\Phi=\{\mathbf q_n[t],\mathbf u_m[t],\delta_n[t],a_{n,m}[t],p_{n,m}[t]\}_{n,m,t}$ 的优化问题为

$$
(\mathrm{P}):\quad\min_{\boldsymbol\Phi}\ \frac{1}{T}\sum_{t=1}^{T}\rho_t\tag{12a}
$$

$$
\text{s.t.}\quad R_n[t]\ge R_{\mathrm{th}},\quad\forall n,t,\tag{C1}
$$

$$
0\le B_n[t]\le B_n^{\max},\quad\forall n,t,\tag{C2}
$$

$$
0\le B_m^{c}[t]\le B_m^{c,\max},\quad\forall m,t,\tag{C3}
$$

$$
a_{n,m}[t]\in\{0,1\},\quad\forall n,m,t,\tag{C4a}
$$

$$
\sum_{n}a_{n,m}[t]\le1,\quad\forall m,t,\tag{C4b}
$$

$$
\sum_{m}a_{n,m}[t]\le1,\quad\forall n,t,\tag{C4c}
$$

$$
0\le p_{n,m}[t]\le a_{n,m}[t]\,P_{\mathrm{wpt}}^{\max},\quad\forall n,m,t,\tag{C5a}
$$

$$
a_{n,m}[t]\left(\lVert\mathbf q_n[t]-\mathbf u_m[t]\rVert-d_{\mathrm{wpt}}\right)\le0,\quad\forall n,m,t,\tag{C5b}
$$

$$
\lVert\mathbf q_n[t+1]-\mathbf q_n[t]\rVert\le v_{\max}^{m}\tau,\quad\forall n,t,\tag{C6a}
$$

$$
\lVert\mathbf u_m[t+1]-\mathbf u_m[t]\rVert\le v_{\max}^{c}\tau,\quad\forall m,t,\tag{C6b}
$$

$$
\lVert\mathbf q_n[t]-\mathbf q_{n'}[t]\rVert\ge d_{\mathrm{safe}},\quad\forall n\ne n',\ t,\tag{C7a}
$$

$$
\lVert\mathbf u_m[t]-\mathbf u_{m'}[t]\rVert\ge d_{\mathrm{safe}},\quad\forall m\ne m',\ t,\tag{C7b}
$$

$$
\delta_n[t]\in[0,1],\quad\forall n,t.\tag{C8}
$$

上述约束编码了如下要求。**(C1)** 保证每个时隙都有把感知数据送达 BS 的最小上行速率 $R_{\mathrm{th}}$。**(C2)—(C3)** 对两层都施加**能量因果性**：MUAV 既不能过放电（从而保持可运行能力）也不能过充电（防止热损伤），CUAV 输出的能量不能超过其存储。式 (C2) 中的上界刻画了充电速率的热限制，与式 (C5a) 中的 WPT 功率上限互为补充。**(C4a)—(C4c)** 定义充电准入：每架 CUAV 每时隙至多为一个 MUAV 充电（C4b），每架 MUAV 至多从一个 CUAV 受电（C4c），构成逐时隙的一对一分配。**(C5a)—(C5b)** 把 **WPT 调度与接近性耦合**：非零 $p_{n,m}[t]$ 仅在 $a_{n,m}[t]=1$ 时可行，且只有当 UAV 间距离处于 WPT 作用半径 $d_{\mathrm{wpt}}$ 内时才会允许充电。**(C6a)—(C6b)** 与 **(C7a)—(C7b)** 分别对所有层内 UAV 对施加速度限制与**无碰撞飞行**约束。**(C8)** 界定了感知—通信时间划分。

**注记 1（问题分类）。** $(\mathrm{P})$ 是一个非凸 MIP，原因在于：(i) 式 (C4a) 的二值准入变量；(ii) 式 (12a) 中耦合位置与时间划分的非凸 PCRB 目标；(iii) 电池动态式 (10)—(11) 中的双线性 WPT 耦合；(iv) 非凸碰撞约束式 (C7a)—(C7b)；(v) 通过式 (5) 与电池递推跨时隙的时间耦合。

**注记 2（相对既有工作的新颖性）。** 现有 ISAC-UAV 工作 [1]、[2] 最小化 PCRB，但把 UAV 能量视为无限；WPT 辅助的 UAV 工作 [5]、[6] 建模了电池动态，却缺乏 ISAC 感知目标。$(\mathrm{P})$ 在统一目标下联合优化了协作式 ISAC 轨迹规划（通过 $\mathbf q_n$、$\delta_n$ 与协作 PCRB 式 (5)）、带逐时隙准入（$a_{n,m}$）的 U2U WPT 调度（$p_{n,m}$），以及任务节点与充电节点两层的能量因果性（C2）—（C3）。

## III. 所提方法

为求解问题 (12)，本文提出**滚动时域交替优化（AO）**（即 RHAO）：在每个时隙 $t$，当前 FIM $\mathbf J[t]$、电池状态 $(B_n[t],B_m^{c}[t])$ 以及扩展卡尔曼滤波（EKF）的单步预测位置估计 $\widehat{\boldsymbol\xi}[t]=[\mathbf F\widehat{\boldsymbol\zeta}[t-1]]_{1:3}$ 作为已知初始条件；该时隙的决策变量 $\boldsymbol\Phi[t]$ 通过循环求解四个可处理块直至收敛得到，其间使用式 (5) 定义的预测 FIM $\mathbf J_p[t]$。

### A. 块 1——充电准入

当 MUAV $n$ 的 SoC 低于触发阈值 $B_n^{\mathrm{trig}}\in(0,B_n^{\max})$ 时，称其处于**能量临界**状态；该阈值是设计参数，取为电池容量的一定比例，以便在耗尽前留出足够的会合时间。由此得到候选集 $\mathcal N_c[t]=\{n:B_n[t]<B_n^{\mathrm{trig}}\}$。满足 (C4a)—(C4c) 的二值一对一分配通过最小代价二分匹配得到：

$$
\{a_{n,m}^{*}\}=\arg\min_{a_{n,m}\in\{0,1\}}\sum_{n\in\mathcal N_c,\ m\in\mathcal M}a_{n,m}\left\lVert\mathbf q_n[t-1]-\mathbf u_m[t-1]\right\rVert,\tag{13}
$$

其中对 $n\notin\mathcal N_c[t]$ 取 $a_{n,m}=0$；该问题由匈牙利算法 [13] 以闭式方式求解。未被分配的 CUAV 保持其上一位置。

### B. 块 2——MUAV 轨迹与时间划分

**1）最优时间划分（闭式）。** 对固定的 MUAV 位置，目标 $\rho_t$ 关于每个 $\delta_n[t]$ 严格递减：感知时间越多，距离测量越紧（$\sigma_n^2$ 越小），FIM 越大。因此速率约束 (C1) 在最优处取等号，给出

$$
\delta_n^{*}[t]=\left[1-\frac{R_{\mathrm{th}}}{B\log_2\left(1+\frac{P_n^{\mathrm{tx}}\beta_0}{\sigma^{2}\lVert\mathbf q_n[t]-\mathbf q_{\mathrm{bs}}\rVert^{2}}\right)}\right]_{0}^{1},\tag{14}
$$

其中 $[\cdot]_{0}^{1}$ 表示投影到 $[0,1]$。于是每架 MUAV 在保证上行数据送达的前提下，把时隙中可承受的最大比例分配给感知。

**2）SCA 轨迹更新。** 固定 $\{\delta_n^{*}[t]\}$ 后，块 2 化为

$$
\min_{\{\mathbf q_n[t]\}}\ \rho_t\quad\text{s.t.}\quad\text{(C6a), (C7a)}.\tag{15}
$$

其非凸性来自 PCRB 目标与碰撞约束 (C7a)。本文用逐次凸近似（SCA）同时处理两者，对位置迭代量 $\{\mathbf q_n^{(l)}\}$ 迭代，其中 $l$ 是每个时隙的内层 SCA 循环序号。

**a）PCRB 替代函数。** 目标 $\rho_t=\operatorname{tr}(\mathbf J[t]^{-1})$ 关于 $\{\mathbf q_n\}$ 非凸。为使问题可处理，作者在当前位置迭代点 $\{\mathbf q_n^{(l)}\}$ 附近用**一阶 Taylor 替代函数**替换它；该替代函数关于 $\{\mathbf q_n\}$ 是线性的，因而凸。令 $\mathbf J^{(l)}=\mathbf J_p[t]+\sum_n\mathbf J_{M,n}(\mathbf q_n^{(l)},\delta_n^{*})$、$\boldsymbol\Psi^{(l)}=(\mathbf J^{(l)})^{-1}$，并令 $\mathbf e_n^{(l)}=\mathbf q_n^{(l)}-\widehat{\boldsymbol\xi}[t]$。则 $\rho_t$ 在 $\{\mathbf q_n^{(l)}\}$ 附近的一阶 Taylor 展开为

$$
\rho_t\approx\rho_t^{(l)}+\sum_{n=1}^{N}\left(\nabla_{\mathbf q_n}\rho_t\right)^{T}\left(\mathbf q_n-\mathbf q_n^{(l)}\right),\tag{16}
$$

其中 $\rho_t^{(l)}$ 与 $\mathbf q_n^{(l)}$ 在第 $l$ 次迭代为常数。代入 $\mathbf w_n^{(l)}=-\nabla_{\mathbf q_n}\rho_t|_{\mathbf q_n^{(l)}}$ 并把所有常数项并入 $c^{(l)}$，式 (16) 化为 PCRB 替代函数：

$$
\widetilde\rho^{(l)}\left(\{\mathbf q_n\}\right)=c^{(l)}-\sum_{n=1}^{N}\left(\mathbf w_n^{(l)}\right)^{T}\mathbf q_n,\tag{17}
$$

其中 $\mathbf w_n^{(l)}$ 称为**感知梯度**，即在局部使 MUAV $n$ 移动最能使 $\rho_t$ 下降的方向。为计算 $\mathbf w_n^{(l)}$，注意只有 $\mathbf J_{M,n}$ 依赖 $\mathbf q_n$；对恒等式 $\nabla_{\mathbf J}\operatorname{tr}(\mathbf J^{-1})=-(\boldsymbol\Psi^{(l)})^{2}$ 使用链式法则，可把问题化为对 $\mathbf J_{M,n}=(c_n/d_n^{(l)6})\,\mathbf e_n^{(l)}\mathbf e_n^{(l)T}$ 关于 $\mathbf q_n$ 求导。应用乘积法则并令 $\mathbf A^{(l)}=[(\boldsymbol\Psi^{(l)})^{2}]_{1:3,1:3}$，得

$$
\mathbf w_n^{(l)}=\frac{2c_n}{d_n^{(l)6}}\left[\mathbf A^{(l)}\mathbf e_n^{(l)}
-\frac{3\,\mathbf e_n^{(l)T}\mathbf A^{(l)}\mathbf e_n^{(l)}}{d_n^{(l)2}}\,\mathbf e_n^{(l)}\right],\tag{18}
$$

其中 $c_n=\delta_n^{*}P_n^{\mathrm{tx}}/\kappa_s$、$d_n^{(l)}=\lVert\mathbf e_n^{(l)}\rVert$。最小化式 (17) 会使每架 MUAV 沿 $\mathbf w_n^{(l)}$ 移动，从而在靠近目标（通过 $d_n^{-6}$）与保持协作几何分集（通过 $\mathbf A^{(l)}$）之间取得平衡。

**b）碰撞约束线性化。** 非凸约束 (C7a) 用其在当前迭代点的一阶下界替换。令 $\mathbf d_{nn'}^{(l)}=\mathbf q_n^{(l)}-\mathbf q_{n'}^{(l)}$：

$$
2\,\mathbf d_{nn'}^{(l)T}\left(\mathbf q_n-\mathbf q_{n'}\right)\ge d_{\mathrm{safe}}^{2}+\lVert\mathbf d_{nn'}^{(l)}\rVert^{2},\quad\forall n\ne n'.\tag{19}
$$

由此，每次 SCA 迭代的子问题——线性目标式 (17)、二阶锥速度约束 (C6a)、以及仿射碰撞约束 (19)——是一个二阶锥规划（SOCP），可由标准凸求解器（例如 CVX/MOSEK [14]）在多项式时间内求解。

### C. 块 3——CUAV 会合轨迹

每个被分配任务的 CUAV $m$（$a_{n,m}^{*}=1$）在 (C6b) 约束下以最大速度飞向其配对的 MUAV：

$$
\mathbf u_m^{*}[t]=\mathbf u_m[t-1]+\min\left(v_{\max}^{c}\tau,\ d_{nm}[t]\right)\widehat{\mathbf d}_{nm}[t],\tag{20}
$$

其中 $d_{nm}[t]=\lVert\mathbf q_n[t]-\mathbf u_m[t-1]\rVert$，$\widehat{\mathbf d}_{nm}[t]$ 为单位方向向量。未被分配的 CUAV 悬停。CUAV 之间的冲突 (C7b) 由优先级规则解决：为能量更临界的 MUAV 服务的那架 CUAV 优先通行，另一架保持位置一个时隙。

### D. 块 4——WPT 功率分配

令 $d_{nm}[t]=\lVert\mathbf q_n[t]-\mathbf u_m^{*}[t]\rVert$、$\bar p_{nm}[t]=\min\left(P_{\mathrm{wpt}}^{\max},\ B_m^{c}[t]/\tau\right)$ 分别表示配对间距离与电池受限的功率上限。WPT 仅在准入且处于接近范围内时激活；满足 (C3)—(C5b) 的功率为

$$
p_{n,m}^{*}[t]=\begin{cases}
\bar p_{nm}[t], & \text{若 } a_{n,m}^{*}[t]=1\ \text{且}\ d_{nm}[t]\le d_{\mathrm{wpt}},\\[2pt]
0, & \text{其他}.
\end{cases}\tag{21}
$$

### E. 总体算法与收敛性

算法 1 汇总了 RHAO 的流程。逐时隙的主要计算代价是块 2 中的 SOCP：在 $3N$ 个位置变量与 $\binom{N}{2}$ 个线性化碰撞约束下，每次 SCA 迭代的复杂度为 $\mathcal O(N^{3.5})$；实践中内层循环在 5–10 次迭代内收敛。

**算法 1　RHAO——滚动时域交替优化**

```text
Require: 初始位置 q_n[0], u_m[0]; J[0] = J_0; 电池 B_n[0], B_m^c[0]; 触发阈值 B_n^trig; 容差 ε > 0。
 1: for t = 1, 2, ..., T do
 2:     EKF 预测（状态）: ξ̂[t] ← [F ζ̂[t-1]]_{1:3}
 3:     EKF 预测（FIM）: J_p[t] ← (F J[t-1]^{-1} F^T + Q)^{-1}
 4:     块 1: 由匈牙利算法求解 (13) → {a*_{n,m}}
 5:     块 2: 初始化 q_n^{(0)} ← q_n[t-1]，l ← 0
 6:     repeat
 7:         在 q_n^{(l)} 处由 (14) 计算 δ*_n
 8:         由 (18) 计算 Ψ^{(l)}, A^{(l)}, {w_n^{(l)}}
 9:         求解 SOCP((17), (C6a), (19)) → {q_n^{(l+1)}}
10:         l ← l + 1
11:     until |ρ̃^{(l)} − ρ̃^{(l-1)}| ≤ ε
12:     q_n[t] ← q_n^{(l)}；δ_n[t] ← δ*_n
13:     块 3: 由 (20) 计算 u*_m[t]
14:     块 4: 由 (21) 计算 p*_{n,m}[t]
15:     执行决策；采集雷达测量
16:     由 (5) 更新 PCRB；由 (10)-(11) 更新电池
17:     EKF 更新: 融入距离测量 (2) → ζ̂[t]
18: end for
```

**注记 3（收敛性）。** 每次 SCA 迭代都产生一个可行点，且 $\widetilde\rho^{(l+1)}\le\widetilde\rho^{(l)}$；由于 $\widetilde\rho$ 有下界零，内层循环收敛 [15]。块 1—4 的外层 AO 循环在每次外迭代中继承 $\rho_t$ 的单调不增性质。

## IV. 仿真结果

### A. 设置

仿真的区域为 $1\ \mathrm{km}\times1\ \mathrm{km}$，共 $T=60$ 个时隙、每时隙 $\tau=1$ s；$N=3$ 架 MUAV、$M=2$ 架 CUAV，飞行高度固定为 $H=100$ m。地面 BS 置于原点。单个空中目标在 50 m 高度按近匀速模型式 (1) 运动，初始位置 $(300,300)$ m、速度 $(7,4)$ m/s（过程噪声 $\sigma_q=0.5\ \mathrm{m/s^2}$）。MUAV 初始布置在以目标初始位置为中心、半径 150 m 的正三角形顶点，从而从一开始就具备良性的感知几何分集。关键 ISAC 参数为：$\kappa_s=5\times10^{-9}$、$P_n^{\mathrm{tx}}=1$ W、$B=10$ MHz、$\beta_0=10^{-4}$、$\sigma^{2}=4\times10^{-13}$ W、$R_{\mathrm{th}}=1$ Mbps。运动学限制为 $v_{\max}^{m}=25$ m/s、$v_{\max}^{c}=20$ m/s、$d_{\mathrm{safe}}=20$ m。每架 MUAV 初始电量为 $B_n^{\mathrm{init}}=12$ kJ（容量 20 kJ）；CUAV 初始电量为 60 kJ（容量 80 kJ），并以 200 W 的功率持续采集太阳能。WPT 作用半径为 $d_{\mathrm{wpt}}=50$ m，最大发射功率 $P_{\mathrm{wpt}}^{\max}=500$ W、效率 $\zeta=0.8$，能量临界触发阈值为 $B_n^{\mathrm{trig}}=6$ kJ。所有结果均为 10 次蒙特卡洛运行的平均。

### B. 基线

本文把 RHAO 与四种参考方案比较，按结构上最接近到最朴素排序：

- **B1-Static（Wang 等 [2]）**：MUAV 在整个任务期间保持在初始位置。逐时隙应用最优时间划分 $\delta_n^{*}$（式 (14)），CUAV 采用最近邻 WPT 准入。该基线隔离出 RHAO 中**轨迹优化**带来的增益。
- **B2-Fixed-δ Greedy（Li 等 [3]）**：每架 MUAV 以最大速度飞向当前目标估计，但使用**固定**时间划分 $\delta_n=0.5$（均匀时间分配）。该基线隔离出 RHAO 中**联合时间划分优化**带来的增益。
- **B3-Pure Greedy**：每架 MUAV 以最优时间划分 $\delta_n^{*}$ 与避碰偏转向目标估计飞行，但轨迹决策是按 MUAV 逐架贪心做出、不含 SCA。该基线隔离出 RHAO 中**凸轨迹子问题**的价值。
- **B4-Random**：MUAV 选择均匀随机的航向与速度；$\delta_n$ 从 $\mathcal U(0,1)$ 抽样；WPT 配对随机。该基线给出性能下界。

### C. 结果

**感知质量（图 2a）。** 所有方法都从相同的先验 $\rho_1\approx80\ \mathrm{m^2}$ 出发（由 $\mathbf J_0$ 决定），并随测量累积而改善。RHAO 在第 5 个时隙时达到 $\rho_t\approx1\ \mathrm{m^2}$，并在时域的大部分范围内保持低于 $10\ \mathrm{m^2}$ 的性能，均值为 $\bar\rho_{\mathrm{RHAO}}=74.5\ \mathrm{m^2}$（该均值由第 1 个时隙的瞬态以及第 50 个时隙附近电池约束收紧导致的后期上升所主导）。**B1-Static** 在目标仍靠近初始编队时降到约 $10\ \mathrm{m^2}$，但随着目标远离而单调退化到约 $10^{3}\ \mathrm{m^2}$（$\bar\rho=400.6$，比 RHAO 差 5.4 倍）。**B3-Pure Greedy** 同样在早期达到较低值，但缺乏 SCA 协调会使它在约 20 个时隙后失去角度分集并急剧退化（$\bar\rho=644.8$）。**B2-Fixed-δ** 受制于感知时间利用不足：固定 $\delta=0.5$ 每时隙最多牺牲 40% 的可达 FIM 贡献，导致 $\bar\rho=1246.8$（差 16.8 倍），在所有基线中最差。**B4-Random** 紧随其后（$\bar\rho=1204.6$）。

**跟踪精度（图 2b）。** PCRB 位置界 $\sqrt{\operatorname{tr}(\mathbf J_{\mathrm{pos}}^{-1})}$（其中 $\mathbf J_{\mathrm{pos}}$ 是 $\mathbf J[t]^{-1}$ 的 $3\times3$ 位置状态子块）与感知质量趋势一致。RHAO 保持平均位置 RMSE 界为 4.5 m，而 B1-Static 为 15.4 m、B2-Fixed-δ 为 22.3 m，说明主动跟踪与自适应时间划分两者都必不可少。

**能量可持续性（图 2c）。** RHAO 每时隙消耗的能量最多（主动轨迹需要推进能量），但 CUAV 的 WPT 使所有 MUAV 在整个 $T=60$ 的时域内保持在 $B_n^{\mathrm{trig}}$ 之上。静态与随机基线节省电池（B1 悬停、B4 低速），却以感知质量为代价。这验证了结合空中 WPT 的滚动时域优化：RHAO 在使 MUAV 全程保持能量的同时取得了最佳感知性能。

## V. 结论

本文面向任务关键型 ISAC 提出了一种两层 UAV 集群架构：MUAV 执行协作式空中目标跟踪，太阳能供电的 CUAV 通过空中 WPT 维持能量连续性。本文把轨迹、感知—通信时间划分与 WPT 调度的联合优化建模为最小化协作 PCRB 的非凸 MIP，并用所提 RHAO 算法结合 SCA 与匈牙利方法求解。仿真表明，与固定时间划分基线相比，RHAO 将平均 PCRB 降低 16.8 倍；与静态轨迹方案相比降低 5.4 倍；同时在整个任务期间使所有 MUAV 保持在能量临界阈值之上。未来工作将探索把该框架扩展到多目标同时跟踪与异构感知模态，以及引入基于学习的轨迹策略 [16] 以进一步降低逐时隙计算开销。

## 致谢

本工作部分由德国 BMFTR（6GEM+，资助号 16KIS2411）与欧盟 Horizon Europe 计划（6G-Path，资助号 101139172）支持。

## 图注与表注

**图 1：两层 UAV 集群架构。** MUAV（蓝色）执行协作式 ISAC：它们向移动目标发射雷达波形，并通过上行链路把感知数据中继给 BS。CUAV（绿色）携带太阳能采集板，通过空中 WPT 为低电量 MUAV 补充能量。图中标出的链路类型包括 ISAC 雷达波束、上行链路与 WPT；左侧为地面基站，右侧为空中目标，上方标注“太阳能采集”。

**图 2：10 次蒙特卡洛运行平均后的仿真结果。** (a) 感知质量：$\rho_t=\operatorname{tr}(\mathbf J[t]^{-1})$ 随时隙变化（对数坐标）；(b) 跟踪精度：PCRB 位置界 $\sqrt{\operatorname{tr}(\mathbf J_{\mathrm{pos}}^{-1})}$ 随时隙变化（对数坐标）；(c) 能量可持续性：MUAV 最小电池电量随时隙变化，虚线标出能量临界触发阈值 $B_n^{\mathrm{trig}}=6$ kJ（块 1 的准入阈值）。五条曲线依次为 RHAO（所提）、B1-Static（Wang 等）、B2-Fixed-δ（Li 等）、B3-Pure Greedy、B4-Random。

> **说明：** 原文未包含表格；图 2 各面板的横轴均为“时隙 $t$”（1–60），曲线数值不在图中标注，本文按正文给出的均值与关键读数记录，未对曲线做数字化估算。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译。

[1] K. Yan et al., "Curriculum-Guided Heterogeneous Multi-Agent Intelligence for Multi-UAV Cooperative ISAC," IEEE Transactions on Communications, pp. 1–1, 2026.

[2] R. Wang et al., "ISAC-Enabled Multi-UAV Collaborative Target Sensing for Low-Altitude Economy," Mar. 2026, arXiv:2603.11502 [eess.SY].

[3] F. Li et al., "Cooperative ISAC for LAE: Joint Trajectory Planning, Power allocation, and Dynamic Time Division," Apr. 2026, arXiv:2511.13006 [eess.SY].

[4] Z. Feng et al., "ISAC-Enabled Deep RL-Based UAV 3D Trajectory Design for Urban Relaying with User Tracking," in GLOBECOM 2025 - 2025 IEEE Global Communications Conference, Dec. 2025, pp. 2270–2275, iSSN: 2576-6813.

[5] U. Naoya et al., "Multi-UAV Data Collection with In-Flight Wireless Power Transfer," in 2025 IEEE VTS Asia Pacific Wireless Communications Symposium (APWCS), Aug. 2025, pp. 1–3.

[6] Q. Zhang et al., "eU2U: Energy-Efficient Wireless Charging and Trajectory Design for IoT Data Collection," in 2025 IEEE 22nd Consumer Communications & Networking Conference (CCNC), Jan. 2025, pp. 1–6, iSSN: 2331-9860.

[7] M. S. Mondal et al., "Risk-Aware Energy-Constrained UAV-UGV Cooperative Routing Using Attention-Guided Reinforcement Learning," in 2025 IEEE International Conference on Robotics and Automation (ICRA), May 2025, pp. 13 000–13 006.

[8] Y. Ye et al., "Multi-Tier UAV Edge Computing Towards Long-Term Energy Stability for Low Altitude Networks," Feb. 2026, arXiv:2602.04258.

[9] K. Gao et al., "LE-MHAPPO-Enhanced DNN Task Partitioning in Energy-Harvesting Heterogeneous UAV Swarms," in ICC 2025 - IEEE International Conference on Communications, Jun. 2025, pp. 1280–1285, iSSN: 1938-1883.

[10] M. Farhoudi et al., "Energy efficient orchestration in multiple-access vehicular aerial-terrestrial 6G networks," IEEE Transactions on Vehicular Technology, pp. 1–16, 2026.

[11] M. Farhoudi et al., "Multi-agent reinforcement learning for SLA-aware network slicing in UAV-enabled MEC," Jul. 2026, arXiv:2607.09295.

[12] Y. Zeng et al., "Energy minimization for wireless communication with rotary-wing UAV," IEEE Transactions on Wireless Communications, vol. 18, no. 4, pp. 2329–2345, Apr. 2019.

[13] H. W. Kuhn, "The Hungarian method for the assignment problem," Naval Research Logistics Quarterly, vol. 2, no. 1–2, pp. 83–97, 1955.

[14] M. Grant et al., "CVX: Matlab software for disciplined convex programming, version 2.1," http://cvxr.com/cvx, 2014.

[15] M. Razaviyayn et al., "A unified convergence analysis of block successive minimization methods for nonsmooth optimization," SIAM Journal on Optimization, vol. 23, no. 2, pp. 1126–1153, 2013.

[16] M. Farhoudi et al., "Quality-aware personalized AI service provisioning in UAV-assisted 6G networks," Jul. 2026, arXiv:2607.06278.

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.22292v1 的全文中文译稿，按原文结构译出摘要与关键词、第 I 节引言（含三条贡献与章节安排）、第 II 节系统模型与问题建模（网络架构、ISAC 感知与通信模型、能量与 WPT 模型、问题 $(\mathrm{P})$ 与注记 1—2）、第 III 节所提方法（RHAO 的块 1—4、算法 1 与收敛性注记 3）、第 IV 节仿真结果（设置、四种基线、三组结果）、第 V 节结论、致谢、图 1—图 2 的中文图注，以及 16 条英文原书目。公式覆盖原文式 (1)—(21) 与约束 (C1)—(C8)。

**源文页码：** 第 1 页（题名、作者、摘要、第 I 节前半）；第 2 页（第 I 节后半、第 II-A—II-B）；第 3 页（式 (5)—(11)、第 II-D 与约束、注记 1）；第 4 页（注记 2、第 III 节块 1—块 2 及式 (13)—(19)）；第 5 页（算法 1、块 3—块 4、收敛性、第 IV 节设置与基线、结果前半）；第 6 页（结果后半、图 2、结论、致谢、参考文献）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；公式按 PDF 文本层提取结果与第 2—6 页渲染图交叉核对（式 (5)、(9)、(14)、算法 1 等关键处逐项对照渲染图）。
2. 原文无表格；图 1、图 2 均未上传图片，仅提供中文图注与正文数值；图 2 的曲线未做数字化估算。
3. 源文第 6 页图 2 区域在文本抽取中为乱码（字体编码不可靠），图注与面板含义依据 PDF 渲染图核对；图中曲线读数以正文叙述为准。
4. **原文疑点：** 式 (9) 的推进功率模型沿用文献 [12] 的旋翼 UAV 能耗模型，但原文将悬浮诱导功率项写作带嵌套根号的形式；按该式与文献 [12] 的标准形式对照，第二项应为 $P_1\big(\sqrt{1+v^4/(4v_h^4)}-v^2/(2v_h^2)\big)^{1/2}$，当前译文按 PDF 渲染式照录，未改动；如后续发现原文排版差异，以原文为准并在此加注。
5. 摘要中“reduces the mean PCRB by 16.8× ... and 5.4×”与第 IV 节均值（$\bar\rho_{\mathrm{RHAO}}=74.5$ 对 $1246.8$ 与 $400.6$）自洽，已核对。
6. 版权：arXiv 预印本（cs.NI），本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。
7. 日期说明：页面文件名与目录按站点归档日期 2026-10-08，而原文 v1 的 arXiv 提交日期为 2026-09-14（PDF 首页左侧 arXiv 标记）；页首“版本”一行采用 arXiv 提交日期，特此说明。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
