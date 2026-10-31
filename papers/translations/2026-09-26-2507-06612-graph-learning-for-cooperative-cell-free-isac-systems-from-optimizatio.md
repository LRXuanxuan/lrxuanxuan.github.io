---
layout: page
title: "协作无蜂窝 ISAC 系统的图学习｜中文全文译文"
permalink: /papers/translations/2026-09-26-2507-06612-graph-learning-for-cooperative-cell-free-isac-systems-from-optimizatio/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/0fe35eceae21f61b/) · [原文 arXiv](https://arxiv.org/abs/2507.06612) · [全部目录](/papers/catalog/)

# 协作无蜂窝 ISAC 系统的图学习

**原题：** Graph Learning for Cooperative Cell-Free ISAC Systems: From Optimization to Estimation  
**作者：** Peng Jiang、Ming Li（Senior Member, IEEE）、Rang Liu（Member, IEEE）、Qian Liu（Member, IEEE）  
**单位：** P. Jiang 与 M. Li 为大连理工大学信息与通信工程学院（大连 116024，中国）；R. Liu 为美国加州大学尔湾分校电气工程与计算机科学系；Q. Liu 为大连理工大学计算机科学与技术学院（大连 116024，中国）。本文部分内容将发表于 IEEE GLOBECOM 2025 [1]。  
**版本：** arXiv:2507.06612v2（eess.SP），2025-11-14，原文 16 页（含表 I—III 与图 1—13）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、式（1）—（48）、表 I—III（逐格）、算法 1—2、图 1—13 图注、参考文献 [1]—[41] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "2026-09-26"；本地 PDF 为 **arXiv:2507.06612v2 [eess.SP]，2025-11-14**，"2026-09-26" 应为站点推荐日期。另：PDF 抽取文本中部分中间公式（式（11）—（15）、（17）—（23）、（26）—（27）、（41）—（47））因排版为多行分式/堆叠结构而出现字符错位，译文按上下文语义复原其结构并在状态段逐项标注，未改动任何符号含义。

## 摘要

无蜂窝通感一体化（ISAC）系统已成为第六代（6G）网络的有前景范式：通过协作式分布式接入点（AP），同时实现高速率数据传输与高精度雷达感知。要充分发挥这些能力，需要一种把**系统级优化**与**多目标参数估计**统一起来的设计。本文提出一种**端到端图学习**方法来弥合这一差距：把整个无蜂窝 ISAC 网络建模为**异构图**，联合设计 AP 模式选择、用户关联、预编码，以及面向多目标位置与速度估计的回波信号处理。具体地，我们提出两种新颖的异构图学习框架：**动态图学习框架**与轻量级**镜像式图注意力网络（mirror-GAT）框架**。动态图学习框架采用结构与时间注意力机制并结合三维卷积神经网络（3D-CNN），在无蜂窝 ISAC 环境中具有更优性能与鲁棒性；相反，mirror-GAT 框架通过**共享邻接的双层迭代结构**显著降低计算复杂度与信令开销。仿真结果验证：相比传统启发式与基于优化的设计，两种图学习框架在多目标位置与速度估计精度上均有显著提升。特别地，mirror-GAT 框架在计算时间与信令开销上大幅降低，显示出其对实际部署的适用性。

**索引词**：通感一体化（ISAC）；动态图学习；无蜂窝；估计。

## I. 引言

通感一体化（ISAC）已成为第六代（6G）无线系统的关键技术 [2]–[4]。与传统单节点 ISAC 架构不同，**网络化多节点协作 ISAC** 范式利用地理分布节点联合完成通信与感知，可显著提升空间覆盖并提高感知精度 [5]。在各种网络架构中，无蜂窝大规模多输入多输出（MIMO）近期因其作为协作 ISAC 的有前景基础而受到广泛关注。无蜂窝系统中大量分布式接入点（AP）在没有预定义小区边界的前提下协作服务多用户，这种密集而灵活的拓扑通过提供高空间分集 [5]、有效干扰管理与均匀的以用户为中心的覆盖 [6]，天然支撑协作 ISAC，使无蜂窝架构特别适合同时提供高质量通信服务与精确感知 [7]。

从通信角度看，无蜂窝 MIMO 通过让每个用户由多个近邻 AP 联合服务，缓解小区边缘退化与阴影效应；这种以用户为中心的协作提升谱效并保证整个覆盖区域均匀的高数据速率 [8]。但在实际大规模部署中，由于功率、带宽与复杂度约束，所有用户与 AP 全连接不可行，因此自适应用户关联与预编码策略对充分利用无蜂窝 ISAC 系统的空间增益至关重要 [9]。从感知角度看，无蜂窝架构通过让多个空间角度同时照射并观测目标，天然支撑**多基地雷达感知** [10]；这种多视角雷达配置能有效缓解视距（LoS）遮挡、降低干扰与杂波影响，并显著提升目标检测可靠性与参数估计精度 [11]。同时，通过把发射机与接收机在空间上分离，无蜂窝系统无需同频全双工工作与复杂自干扰消除 [12]。

尽管有上述优势，在协作 ISAC 系统中协调多个发射机波形并保持相互正交仍是重大挑战。时分复用（TDM）与频分复用（FDM）等传统复用方法在距离与多普勒估计性能之间固有折中；转而把不同时频资源动态分配给各 AP，可同时获得高质量距离与多普勒测量，代价是严重的谱效损失与调度复杂度上升 [13]。相反，空间复用可借助精心设计的预编码器与准正交 Zadoff–Chu（ZC）序列，在可控干扰、高正交性与优越谱效下实现多 AP 并发传输。

为充分释放无蜂窝 ISAC 网络的协作潜力，需要一个统一的**优化—估计框架**，联合集成 AP 工作模式（发射或接收）选择、自适应用户关联、增强目标照射并抑制杂波的预编码策略，以及鲁棒的多目标参数估计与网络级融合算法 [14]。尽管既有研究 [15]–[29] 分别处理了该集成问题的某些方面，但尚无工作在同一框架中同时考虑全部紧耦合维度。例如 AP 模式选择与预编码的联合设计 [15]–[17] 通常忽略协作信息融合；以用户为中心的关联与波束成形研究 [18], [19] 忽视自适应模式配置；早期协作融合与预编码研究 [20], [21] 在关联或模式自适应上缺乏灵活性。此外，多数既有方法严重依赖目标参数的先验知识，如雷达截面积（RCS）、到达角（AoA）或精确信道状态信息（CSI）[30]——这些假设在目标未知、环境动态变化的实际场景中很少成立。因此，这些碎片化且依赖假设的方案无法充分利用无蜂窝 ISAC 架构的协作收益，凸显出对**综合统一优化—估计框架**的迫切需求：该框架应基于实时感知反馈（而非假定目标参数）自适应配置 AP 角色、用户关联与预编码策略。

图神经网络（GNN）近期成为应对这些挑战的有前景方法，因其能有效表示无蜂窝 ISAC 系统中分布式 AP 与用户之间复杂的空间相关性与层次交互 [31]–[33]。具体地，基于注意力的异构 GNN 已被用于联合感知—通信信道建模，相对零空间投影与深度神经网络（DNN）等传统方法展现出显著性能提升 [33]；链路异构 GNN 通过注意力驱动的消息传递自适应加权感知与通信链路，已被证明对协作定位有效 [34]。然而既有图学习方法通常处理孤立子问题且严重依赖完整先验知识，因而缺乏同时优化网络配置与目标参数估计的集成框架，尤其难以应对目标未知的实际条件。

受 GNN 在捕获空间与拓扑交互方面有效性的启发，我们提出两种新颖的异构图学习框架，以应对协作无蜂窝 ISAC 系统中网络级优化与目标参数估计的联合挑战。本文主要贡献总结如下：

- 提出统一的协作无蜂窝 ISAC 架构，集成动态 AP 模式选择、自适应用户关联、协作发射预编码，以及接收 AP 侧的分布式多目标参数估计与融合。关键地，本方法不依赖目标参数先验知识，显著增强其实际适用性。
- 发展基于图注意力网络（GAT）的动态异构图学习框架，并由结构与时间注意力机制增强。该框架通过定制 3D-CNN 模块联合优化 AP 模式选择、用户关联、预编码策略与多目标位置/速度估计，在感知精度与通信性能两方面均获得实质提升。
- 引入轻量级 mirror-GAT 框架以解决计算复杂度与信令开销问题。该框架利用**共享边连接的双层迭代结构**与分布式推断，在显著降低计算代价与回传需求的同时达到近最优性能，因而适合可扩展的实际无蜂窝部署。
- 通过大量仿真证明所提框架一致优于启发式与传统基于优化的基准，实现亚米级定位精度与亚 m/s 速度估计。特别地，mirror-GAT 框架在达到与动态方法相当精度的同时，推断复杂度与回传开销大幅降低，证实其对大规模部署的实际有效性。

**记号**：标量用常规字体表示，向量与矩阵分别用粗体小写与粗体大写字母表示。$|a|$ 与 $\|\mathbf a\|$ 分别表示标量 $a$ 的绝对值与向量 $\mathbf a$ 的范数；$\mathbb C$ 与 $\mathbb R$ 分别表示复数集与实数集；$(\cdot)^T$ 与 $(\cdot)^H$ 分别表示转置与共轭转置；$a^{(i)}$ 表示 $a$ 的第 $i$ 次迭代解；$\Re\{\cdot\}$ 与 $\Im\{\cdot\}$ 分别表示实部与虚部；$\odot$ 表示 Hadamard 积；$\operatorname{Top}_A\{\cdot\}$ 返回 $A$ 个最大元素的索引。

**图 1**：无蜂窝 ISAC 系统（分布式收发 AP、目标与集中单元 CU）。

## II. 系统模型与问题表述

我们考虑如图 1 所示的无蜂窝 ISAC 系统。网络由 $J$ 个分布式**双功能 AP** 组成，每个 AP 配备半波长间距的 $M$ 阵元均匀线阵（ULA）。这些 AP 协作服务 $K$ 个单天线通信用户（CU），同时感知 $Q$ 个潜在目标。具体地，令 $\mathbf p_q\in\mathbb R^2$ 与 $\mathbf v_q\in\mathbb R^2$ 分别表示第 $q$ 个目标的位置与速度向量，二者元素分别对应沿 $x$ 轴与 $y$ 轴的分量。

该系统中每个 AP 可在**发射模式**（下行通信与目标照射）与**专用感知接收模式**（目标估计）之间动态切换。这种模式切换灵活性使系统能充分利用可用空间自由度（DoF）、利用多视角观测并避开干扰与杂波，从而显著提升整体性能。令 $T$ 表示处于发射模式的 AP 数、$R$ 表示处于接收模式的 AP 数，满足 $T+R=J$；对应 AP 索引集合分别记为 $\mathcal T$ 与 $\mathcal R$。引入二元模式选择向量 $\boldsymbol\kappa=[\kappa_1,\kappa_2,\ldots,\kappa_J]^T\in\{0,1\}^J$，其中 $\kappa_j=1$ 表示 AP $j$ 处于发射模式，否则为 0。为保证系统配置合理，模式选择须满足 $\sum_{j=1}^{J}\kappa_j=T$，从而恰有 $T$ 个 AP 工作于发射模式。

除 AP 工作模式选择外，有效的 AP—CU 关联对充分挖掘 AP 与 CU 的空间分集也很重要。该关联为每个发射模式 AP（Tx-AP）分配特定 CU 服务，对 AP 资源高效利用、AP 间负载均衡与全体用户高质量服务至关重要。为显式刻画关联，定义二元关联矩阵 $\boldsymbol\Lambda\in\{0,1\}^{J\times K}$，其中 $\Lambda_{j,k}=1$ 当且仅当第 $j$ 个 AP 处于发射模式并服务第 $k$ 个 CU，否则为 0。具体地，对 $j\in\mathcal R$ 的所有 CU 设 $\Lambda_{j,k}=0$，反映接收模式 AP（Rx-AP）不服务任何 CU。此外，若每个 Tx-AP 至多同时服务 $K_u$ 个指定 CU，则须满足 $\sum_{k=1}^{K}\Lambda_{j,k}\le K_u$。

所考虑无蜂窝 ISAC 系统对通信与感知功能均采用正交频分复用（OFDM）波形。具体地，每个 Tx-AP 构造由 $N_s$ 个正交子载波、持续 $L$ 个 OFDM 符号的帧。子载波间隔记为 $\Delta f=B/N_s$，$B$ 为总可用带宽；每个 OFDM 符号含时长 $T_p$ 的循环前缀（CP），故总符号时长 $T_{\mathrm{sym}}=1/\Delta f+T_p$。

在第 $l$ 个 OFDM 符号的第 $i$ 个子载波上，令 $\mathbf s_{c,i}[l]\triangleq[s_{c,i,1},s_{c,i,2},\ldots,s_{c,i,K}]^T\in\mathbb C^{K\times1}$ 表示 $K$ 个 CU 的调制通信符号向量；对第 $j$ 个 Tx-AP，令 $\mathbf s_{r,j,i}[l]\in\mathbb C^{M\times1}$ 表示由 ZC 序列生成的感知（雷达探测）符号向量。需强调各 Tx-AP 使用根索引互质的**不同准正交 ZC 序列**，该策略使 Rx-AP 能可靠区分来自不同 Tx-AP 的回波，从而支持多视角观测与协作感知。

为在同一子载波 $i$ 上同时复用通信符号与雷达感知信号，每个 Tx-AP $j\in\mathcal T$ 采用分别面向两种功能的预编码矩阵。令 $\mathbf W_{c,j,i}\triangleq[\mathbf w_{c,j,i,1},\ldots,\mathbf w_{c,j,i,K}]\in\mathbb C^{M\times K}$ 表示通信信号的发射预编码矩阵，$\mathbf W_{r,j,i}\triangleq[\mathbf w_{r,j,i,1},\ldots,\mathbf w_{r,j,i,M}]\in\mathbb C^{M\times M}$ 表示雷达感知的发射预编码矩阵。由于 Rx-AP 不参与发射预编码，将其相应预编码矩阵置零，即对每个 Rx-AP $j\in\mathcal R$ 取 $\mathbf W_{c,j,i}\triangleq\mathbf 0_{M\times K}$、$\mathbf W_{r,j,i}\triangleq\mathbf 0_{M\times M}$。于是第 $j$ 个 Tx-AP 在第 $l$ 个 OFDM 符号、子载波 $i$ 上的发射信号向量为

$$
\mathbf x_{j,i}[l]=\kappa_j\mathbf W_{r,j,i}\mathbf s_{r,j,i}[l]+\kappa_j\sum_{k=1}^{K}\Lambda_{j,k}\mathbf w_{c,j,i,k}s_{c,i,k}[l],\tag{1}
$$

其中 $\kappa_j$ 表示 AP $j$ 的工作模式（是否发射），$\Lambda_{j,k}$ 表示 AP $j$ 与第 $k$ 个 CU 之间的用户关联指示。

**表 II　系统记号**（按原表逐格转录）

| 描述 | 记号 | 描述 | 记号 |
| --- | --- | --- | --- |
| 载频 | $f_c$ | 带宽 | $B$ |
| 子载波数 | $N_s$ | OFDM 符号数 | $L$ |
| AP 数 | $J$ | Tx-AP 数 | $T$ |
| Rx-AP 数 | $R$ | CU 数 | $K$ |
| 关联 CU 数 | $K_u$ | 目标数 | $Q$ |
| 杂波数 | $U$ | 天线数 | $M$ |
| 发射功率 | $P_j$ | 通信噪声 | $\sigma^2$ |
| 目标 $q$ 的位置 | $\mathbf p_q$ | 隐藏层总数 | $\tau_1^{\mathrm{tot}}$ 与 $\tau_2^{\mathrm{tot}}$ |
| 隐藏层索引 | $\tau_1$ 与 $\tau_2$ | 快照数 | $N$ |
| 镜像迭代数 | $N_m$ | 压缩特征维数 | $\varrho$ |
| 聚合维数 | $D_{\mathrm{CU}}$、$D_{\mathrm{Rx}}$、$D_{\mathrm{AP}}$ | | |

### A. 多用户通信指标

通信功能方面，第 $k$ 个 CU 在第 $l$ 个时隙、第 $i$ 个子载波上的接收信号为

$$
y_{c,i,k}[l]=\sum_{j=1}^{J}\mathbf h_{j,i,k}^H\mathbf x_{j,i}[l]+n_{c,i,k}[l],\tag{2}
$$

其中 $\mathbf h_{j,i,k}\in\mathbb C^{M\times1}$ 表示第 $j$ 个 AP 到第 $k$ 个 CU 在第 $i$ 个子载波上的基带信道，$n_{c,i,k}[l]\sim\mathcal{CN}(0,\sigma_c^2)$ 表示加性白高斯噪声（AWGN）。第 $k$ 个 CU 在第 $i$ 个子载波上的相应 SINR 为

$$
\mathrm{SINR}_{c,i,k}=\frac{\left|\sum_{j=1}^{J}\kappa_j\Lambda_{j,k}\mathbf h_{j,i,k}^H\mathbf w_{c,j,i,k}\right|^2}{\mu_{i,k}+\iota_{i,k}+\sigma_c^2},\tag{3}
$$

其中 $\mu_{i,k}$ 与 $\iota_{i,k}$ 分别表示多用户干扰与雷达干扰，定义为

$$
\mu_{i,k}=\sum_{n=1,n\neq k}^{K}\left|\sum_{j=1}^{J}\kappa_j\Lambda_{j,n}\mathbf h_{j,i,k}^H\mathbf w_{c,j,i,n}\right|^2,\tag{4a}
$$

$$
\iota_{i,k}=\sum_{m=1}^{M}\left|\sum_{j=1}^{J}\kappa_j\mathbf h_{j,i,k}^H\mathbf w_{r,j,i,m}\right|^2.\tag{4b}
$$

我们采用可达和速率作为无蜂窝 ISAC 系统的通信性能指标：

$$
R_c=\sum_{k=1}^{K}\sum_{i=1}^{N_s}\log_2\left(1+\mathrm{SINR}_{c,i,k}\right).\tag{5}
$$

### B. 雷达感知指标

雷达感知功能方面，Rx-AP 处的接收信号由目标回波、杂波、AP 间直接干扰与 AWGN 组成。具体地，第 $r$ 个 Rx-AP 收到的频域基带回波如下式所示：第一项对应目标回波，其中 $\beta_{j,r,q}$ 表示由 Tx-AP $j$ 照射、被 Rx-AP $r$ 观测的第 $q$ 个目标的雷达截面积（RCS），满足 $\mathbb E|\beta_{j,r,q}|^2=\zeta_q^2$；$d_{j,q}$ 与 $d_{r,q}$ 分别表示第 $q$ 个目标到 Tx-AP $j$ 与 Rx-AP $r$ 的距离，对应角度 $\theta_{j,q}$ 与 $\theta_{r,q}$；$f_{d,j,r,q}$ 表示由第 $q$ 个目标相对 Rx-AP $r$ 的径向速度分量（由 Tx-AP $j$ 发射信号引起）所产生的多普勒频移。光速为 $c$，距离相关路损在 LoS 假设下建模为 $\mathrm{PL}(d)$；角度 $\theta$ 处的阵列导向矢量为 $\mathbf a(\theta)\triangleq[1,e^{j\pi\sin\theta},\ldots,e^{j(M-1)\pi\sin\theta}]^T\in\mathbb C^{M\times1}$。第二项表示杂波干扰，$\eta_{j,r,u}$ 为第 $u$ 个杂波散射体的 RCS，满足 $\mathbb E|\eta_{j,r,u}|^2=\zeta_u^2$；其参数（距离 $d_{r,u}$、$d_{j,u}$，角度 $\theta_{r,u}$、$\theta_{j,u}$ 与多普勒 $f_{d,j,r,u}$）定义与目标类似。第三项描述 AP 间直接干扰，由 Tx-AP $j$ 与 Rx-AP $r$ 之间的 LoS 信道矩阵 $\mathbf G_{j,r}$ 表征。最后 $z_{r,i}[l]$ 为 AWGN，建模为复高斯随机向量 $\mathcal{CN}(0,\sigma_r^2\mathbf I_M)$：

$$
\begin{aligned}
\mathbf y_{r,i}[l]=\ &\sum_{j=1}^{J}\sum_{q=1}^{Q}\beta_{j,r,q}\sqrt{\mathrm{PL}(d_{r,q})\mathrm{PL}(d_{j,q})}\,\mathbf a_r(\theta_{r,q})\mathbf a_t^T(\theta_{j,q})\mathbf x_{j,i}[l]e^{-j2\pi i\Delta f(d_{r,q}+d_{j,q})/c}e^{j2\pi lT_{\mathrm{sym}}f_{d,j,r,q}}\\
&+\sum_{j=1}^{J}\sum_{u=1}^{U}\eta_{j,r,u}\sqrt{\mathrm{PL}(d_{r,u})\mathrm{PL}(d_{j,u})}\,\mathbf a_r(\theta_{r,u})\mathbf a_t^T(\theta_{j,u})\mathbf x_{j,i}[l]e^{-j2\pi i\Delta f(d_{r,u}+d_{j,u})/c}e^{j2\pi lT_{\mathrm{sym}}f_{d,j,r,u}}\\
&+\sum_{j=1}^{J}\sqrt{\mathrm{PL}(d_{j,r})}\mathbf G_{j,r}\mathbf x_{j,i}[l]e^{-j2\pi i\Delta f d_{j,r}/c}+\mathbf z_{r,i}[l].
\end{aligned}\tag{6}
$$

所有接收回波 $\mathbf y_{r,i}[l]$（$\forall r,i,l$）聚合为数据张量 $\mathbf Y_r\in\mathbb C^{R\times N_s\times L\times M}$，封装目标的距离、速度与角度信息。给定 Rx-AP 观测到的回波张量 $\mathbf Y_r$ 与已知感知序列张量 $\mathbf S_r\in\mathbb C^{T\times M\times N_s\times L}$，$Q$ 个目标位置与速度的联合估计可表述为如下映射函数：

$$
\{\hat{\mathbf p}_q,\hat{\mathbf v}_q\}_{q=1}^{Q}=\mathcal M\left(\mathbf Y_r,\mathbf S_r\right).\tag{7}
$$

估计性能用均方根误差（RMSE）指标评估，通过估计值与目标真实位置/速度的偏差量化估计精度，正式定义如下：

$$
\mathrm{RMSE}_p=\sqrt{\mathbb E\left[\frac{1}{Q}\sum_{q=1}^{Q}\left\|\mathbf p_q-\hat{\mathbf p}_q\right\|^2\right]},\tag{8}
$$

$$
\mathrm{RMSE}_v=\sqrt{\mathbb E\left[\frac{1}{Q}\sum_{q=1}^{Q}\left\|\mathbf v_q-\hat{\mathbf v}_q\right\|^2\right]},\tag{9}
$$

### C. 问题表述

我们的目标是联合设计 AP 模式选择向量 $\boldsymbol\kappa$、用户关联矩阵 $\boldsymbol\Lambda$、发射预编码矩阵 $\mathbf W_{j,i}\triangleq[\mathbf W_{r,j,i},\mathbf W_{c,j,i}]\in\mathbb C^{M\times(M+K)}$（$\forall j,i$）以及估计算法 $\mathcal M$，在保证多用户通信吞吐的前提下最小化雷达感知误差。具体地，我们最小化（8）（9）所定义位置与速度估计 RMSE 的加权和，受多用户可达和速率 $R_c$（式（5））、发射功率与 AP—用户关联约束。为保证功率分配公平性并降低动态网络中的调度开销，假设 Tx-AP 数、Rx-AP 数与每个 Tx-AP 的最大关联用户数均固定；因此优化重点在于分配合适的 AP 工作模式与用户关联，这既契合实际系统约束又简化问题表述。数学上，联合优化问题为

$$
\min_{\{\boldsymbol\kappa,\boldsymbol\Lambda,\mathbf W_{j,i},\mathcal M\}}\ \omega\,\mathrm{RMSE}_p+(1-\omega)\,\mathrm{RMSE}_v\tag{10a}
$$
$$
\text{s.t.}\quad R_c\ge\gamma,\tag{10b}
$$
$$
\quad\qquad \sum_{i=1}^{N_s}\|\mathbf W_{j,i}\|_F^2\le P_j,\ \forall j\in\mathcal T,\tag{10c}
$$
$$
\quad\qquad \sum_{j=1}^{J}\kappa_j=T,\ \kappa_j\in\{0,1\},\ \forall j\in\mathcal J,\tag{10d}
$$
$$
\quad\qquad \sum_{k=1}^{K}\Lambda_{j,k}\le K_u,\ \Lambda_{j,k}\in\{0,1\},\ \forall j\in\mathcal J,\ \forall k\in\mathcal K,\tag{10e}
$$

其中 $0\le\omega\le1$ 为任务权重因子，$\gamma$ 为所需最小可达和速率，$P_j$ 为 Tx-AP $j$ 的发射功率预算。

该联合优化问题涉及离散决策（AP 模式选择与用户关联）、连续值预编码矩阵以及隐式估计函数，构成重大技术挑战：其一，混合整数与非凸结构使标准凸优化方法无法直接应用；其二，缺乏目标参数先验知识，无法显式推导经典解析界（如 Cramér–Rao 界，CRB），难以直接量化估计精度与系统参数的关系，故传统基于优化的方法无法有效确定最优 AP 配置与预编码；其三，式（7）中的多目标估计函数 $\mathcal M$ 本质上需要对空间分布 AP 的接收信号做集中式融合，此类集中融合带来可观计算复杂度与通信开销，使传统估计技术不实用，尤其考虑到多 AP 采集的高维数据。

为应对这些挑战，我们提出两种专为协作无蜂窝 ISAC 系统设计的图学习方法。借助先进 GNN 架构，所提框架高效处理复杂离散—连续优化与集中式多目标估计任务，从而充分利用无蜂窝 ISAC 固有的协作增益。

**图 2**：无蜂窝 ISAC 场景及其对应的异构图结构（Tx-AP、Rx-AP、CU 三类节点；通信边与感知边）。

## III. 所提动态图学习框架

本节先定义异构动态图结构及其对应的无蜂窝 ISAC 系统场景，凸显其部署优势；随后提出基于异构 GNN 的新型动态图学习框架；最后给出该框架采用的训练策略。

### A. 图定义

如图 2 所示，所考虑协作无蜂窝 ISAC 系统可建模为含多种节点与边类型的异构图。具体地，每个 Tx-AP、Rx-AP 与 CU 对应唯一节点类型，分别以蓝色、紫色与红色节点表示；通信链路表示为连接 Tx-AP 节点与 CU 节点的边（绿色），感知链路表示为连接 Tx-AP 节点与 Rx-AP 节点的边（黄色）。需注意感知边不仅反映 Tx-AP 与 Rx-AP 之间的直接干扰信道，也反映来自潜在目标的回波；然而由于目标位置先验信息起初不可得，这些回波在初始图表示中并不显式建模为边，而是作为**异步补偿特征**纳入。该异构图表述直观捕获无蜂窝 ISAC 系统内的复杂连通模式（含 AP 工作模式与 AP—用户关联）；此外，图结构把多用户与雷达干扰效应有效建模为沿边传播的特征。通过把无蜂窝网络的空间与拓扑信息显式嵌入 GNN 框架，所提方法有效利用网络结构以支撑通信与感知的联合优化。

然而，由于缺乏潜在目标的先验信息，采用静态拓扑图会显著限制达成全局最优设计的能力：固定 AP 模式与用户关联对应不变的图拓扑，无法充分利用无蜂窝 ISAC 部署固有的空间 DoF；同时，由静态推断过程导出的预编码矩阵缺乏自适应功率分配，会降低参数未知目标的估计精度。为克服这些局限并实现对未知目标的自适应探索式感知，我们提出一种新颖的**动态异构图框架**，由多个图拓扑演化的时间快照构成 [35]。该框架中每个时间快照表示具有特定拓扑配置的瞬时图，图在快照之间动态改变边连通性。形式上，第 $n$ 个快照的无蜂窝 ISAC 网络表示为异构图 $\mathcal G^{(n)}=(\mathcal V^{(n)},\mathcal E^{(n)})$，其中 $\mathcal V^{(n)}$ 与 $\mathcal E^{(n)}$ 分别表示快照特定节点集与边集。节点集含三类节点：Tx-AP、Rx-AP 与 CU，显式记为 $\mathcal V^{(n)}=\{\mathcal V_{\mathrm{Tx}}^{(n)},\mathcal V_{\mathrm{Rx}}^{(n)},\mathcal V_{\mathrm{CU}}\}$。在每个快照内，动态边把 Tx-AP 节点连到 CU 节点、把 Tx-AP 节点连到 Rx-AP 节点，捕获瞬时通信与感知关系。

值得注意的是，GNN 中的邻接关系并不直接对应物理关联：Tx-AP 节点与全部 Rx-AP、CU 节点保持潜在连接，实际关联与 AP 工作模式由离散优化变量 $\boldsymbol\Lambda$ 与 $\boldsymbol\kappa$ 决定。为把这些连续的注意力关系与离散网络结构对齐，我们引入带注意力权重的**可训练边信息向量**，有效把连续注意力图转换为与物理无蜂窝 ISAC 架构一致的拓扑配置。

### B. 图初始化

定义动态异构图后，我们把无蜂窝 ISAC 系统的先验信息嵌入初始图状态以有效求解问题（10）。具体地，采用通信链路的嵌入 CSI¹，第 $t$ 个 Tx-AP 与第 $k$ 个 CU 之间边的特征定义为

$$
\mathbf e_{t,k}=\left[\operatorname{vec}^T\left(\Re\{\mathbf h_{t,:,k}\}\right),\operatorname{vec}^T\left(\Im\{\mathbf h_{t,:,k}\}\right)\right]^T.\tag{11}
$$

> ¹ 本工作主要处理 AP—用户关联、预编码设计与传感融合任务；我们假设 CSI 可通过无蜂窝 MIMO 系统的标准信道估计技术获得 [36]。

类似地，采用嵌入 AP 间干扰，第 $t$ 个 Tx-AP 与第 $r$ 个 Rx-AP 之间边的特征为

$$
\mathbf g_{t,r}=\left[\operatorname{vec}^T\left(\Re\{\mathbf G_{t,r}\}\right),\operatorname{vec}^T\left(\Im\{\mathbf G_{t,r}\}\right)\right]^T.\tag{12}
$$

随后每个快照图由含 $\tau_1^{\mathrm{tot}}$ 个隐藏层的 GNN 处理。Tx-AP、Rx-AP 与 CU 节点的初始隐藏状态由其相邻边特征拼接构成：

$$
\mathbf s_{\mathrm{Tx}}^{(0)}(t)=\left[\tilde{\mathbf h}_{t,1},\tilde{\mathbf h}_{t,2},\ldots,\tilde{\mathbf h}_{t,K},\tilde{\mathbf g}_{t,1},\ldots,\tilde{\mathbf g}_{t,R}\right],\tag{13}
$$

$$
\mathbf s_{\mathrm{Rx}}^{(0)}(r)=\left[\tilde{\mathbf h}_{r,1},\tilde{\mathbf h}_{r,2},\ldots,\tilde{\mathbf h}_{r,K},\tilde{\mathbf g}_{1,r},\ldots,\tilde{\mathbf g}_{T,r}\right],\tag{14}
$$

$$
\mathbf s_{\mathrm{CU}}^{(0)}(k)=\left[\tilde{\mathbf h}_{1,k},\tilde{\mathbf h}_{2,k},\ldots,\tilde{\mathbf h}_{T,k}\right],\tag{15}
$$

其中 $\tilde{\mathbf h}_{t,k}$、$\tilde{\mathbf g}_{t,r}$ 表示经线性嵌入后的边特征。

### C. 图模块

图初始化后，我们把优化问题（10）划分为三个互联模块：用户关联、AP 模式选择，以及目标位置与速度的信号处理，如图 3 所示。具体地，结构注意力模块先学习用户关联矩阵 $\boldsymbol\Lambda$；随后时间注意力模块利用接收回波动态优化下一快照的 AP 模式选择向量 $\boldsymbol\kappa$；基于最终快照获得的 Tx-AP 节点特征导出最优预编码矩阵 $\mathbf W_{j,i}$；最后由离线训练的三维卷积神经网络（3D-CNN）模块 [37] 处理接收信号，提取跨天线、子载波与符号维度的关键空间—频率—时间特征。3D-CNN 在初始化时作为预训练特征提取器，而非动态图优化回路的一部分，以保证一致且稳定的特征表示。

**1）结构注意力模块**：在每个快照中，Tx-AP 节点的隐藏状态通过融合注意力打分、消息传递与聚合的**掩码结构注意力机制**迭代更新：

$$
\mathbf s_{\mathrm{Tx}}^{(\tau_1+1,n)}(t)=f_{\mathrm{agg}}\left(f_{\mathrm{att}}\left(\mathbf s_{\mathrm{Tx}}^{({\tau_1},n)}(t)\right)\odot\mathop{\bigodot}_{\xi\in\mathcal N^{(n)}(t)}f_{\mathrm{mp}}\left(\mathbf s^{({\tau_1},n)}(\xi)\right)\right),\tag{16}
$$

其中 $f_{\mathrm{agg}}(\cdot)$ 聚合节点特征，$f_{\mathrm{att}}(\cdot)$ 计算注意力分数，$f_{\mathrm{mp}}(\cdot)$ 执行来自邻居节点的消息传递；$\tau_1$ 表示每个快照内动态图框架子图的隐藏层索引；$\mathcal N^{(n)}(t)$ 表示第 $n$ 个快照中与第 $t$ 个 Tx-AP 节点相连的邻居集。为清晰起见，后续结构注意力模块的公式省略快照索引 $n$，因为快照内图拓扑不变。

为高效利用功率与带宽资源，每个 Tx-AP 须选择性关联适当 CU。结构注意力模块内，用户关联矩阵 $\boldsymbol\Lambda$ 通过掩码注意力机制获得：对每个 Tx-AP 评估所有相邻节点的有效特征分数，Top-$K_u$ 函数依据归一化注意力概率选出最强的 $K_u$ 条通信链路用于特征传播。该过程确保掩码注意力优先选择 CU 节点而排除无关的 Rx-AP 节点。具体地，掩码注意力函数定义为

$$
f_{\mathrm{att}}\left(\mathbf s_{\mathrm{Tx}}^{(\tau_1)}(t)\right)=\mathop{\operatorname{Top}}_{K_u}\left\{\operatorname{Softmax}_{\mathcal N(t)}\left(\mathop{\|}_{\mathcal N(t)}\left(\mathbf k_{\mathcal N(t)}^{(\tau_1)}\right)^T\mathbf W_{\mathrm{att},\mathcal N(t)}\mathbf q^{(\tau_1)}(t)+\mathbf m_{\mathrm{str}}\right)\right\},\tag{17}
$$

其中 $\mathbf W_{\mathrm{att},\mathcal N(t)}$ 为注意力权重矩阵，$\|$ 表示拼接操作；$\mathbf m_{\mathrm{str}}$ 为结构掩码向量，采用类似填充序列处理的掩码机制为每个 Tx-AP 忽略无关邻居节点，确保邻居聚合时只考虑有效邻居（即 CU 节点）。具体地，任何 Rx-AP 邻居对应的注意力权重置为 $-\infty$，经 softmax 后这些邻居权重为零。注意注意力公式整合了所有 Tx-AP 节点的归一化分数，故并不严格等价于用户关联矩阵 $\boldsymbol\Lambda$，而是经过压缩变换；对掩码注意力公式的最佳 $K_u$ 元素施加经典 Top-$k$ 函数即得用户关联矩阵，从而保证离散且可行的关联。

查询向量与键向量由线性变换生成：

$$
\mathbf q^{(\tau_1)}(t)=\mathcal M_{\mathrm{query}}\left(\mathbf s_{\mathrm{Tx}}^{(\tau_1)}(t);\mathbf W_{\mathrm{query}}\right),\qquad \mathbf k_{\mathcal N(t)}^{(\tau_1)}=\mathcal M_{\mathrm{key}}\left(\mathbf s^{(\tau_1)}(\mathcal N(t));\mathbf W_{\mathrm{key}}\right),\tag{18}
$$

其中 $\mathcal M_{\mathrm{query}}(\cdot)$ 与 $\mathcal M_{\mathrm{key}}(\cdot)$ 表示带相应投影矩阵的线性变换。邻居节点信息以类似方式聚合为值向量：

$$
\mathop{\bigodot}_{\xi\in\mathcal N(t)}f_{\mathrm{mp}}\left(\mathbf s^{(\tau_1)}(\xi)\right)=\mathcal M_{\mathrm{value}}\left(\mathbf s^{(\tau_1)}(\xi);\mathbf W_{\mathrm{value}}^{\xi}\right).\tag{19}
$$

最后，结构注意力输出的聚合引入残差连接以增强稳定性：

$$
\boldsymbol\zeta_{\mathrm{Tx}}^{(\tau_1)}(t)=\mathbf W_{\mathrm{agg}}\operatorname{LeakyReLU}\left\{f_{\mathrm{att}}\left(\mathbf s_{\mathrm{Tx}}^{(\tau_1)}(t)\right)\odot\mathop{\bigodot}_{\xi\in\mathcal N(t)}f_{\mathrm{mp}}\left(\mathbf s^{(\tau_1)}(\xi)\right)\right\},\tag{20}
$$

$$
\mathbf s_{\mathrm{Tx}}^{(\tau_1+1)}(t)=\boldsymbol\zeta_{\mathrm{Tx}}^{(\tau_1)}(t)+\mathbf s_{\mathrm{Tx}}^{(\tau_1)}(t),\tag{21}
$$



然而仅靠结构注意力不足以确定 AP 模式向量 $\boldsymbol\kappa$，因为该决策同时显著影响通信和速率与目标估计精度；此外，仅用直接路径干扰作为先验特征限制了全局雷达波形优化。为此我们提出如下调度感知的时间注意力模块。

**2）调度感知时间注意力模块**：从快照 $\mathcal G^{(n)}$ 提取节点与边特征后，我们在每个 Rx-AP 重构回波信号 $\hat{\mathbf y}^{(n)}(r)\in\mathbb R^{2N_sLM}$，用其增强快照 $(n+1)$ 的隐藏状态：

$$
\mathbf s_{\mathrm{Tx}}^{(n+1,0)}(t)=\left[\tilde{\mathbf h}_{t,1},\ldots,\tilde{\mathbf h}_{t,K},\tilde{\mathbf g}_{t,1},\left(\hat{\mathbf y}^{(n)}(1)\right)^T,\ldots\right],\tag{22}
$$

$$
\mathbf s_{\mathrm{Rx}}^{(n+1,0)}(r)=\left[\tilde{\mathbf h}_{r,1},\ldots,\tilde{\mathbf h}_{r,K},\tilde{\mathbf g}_{1,r},\left(\hat{\mathbf y}^{(n)}(r)\right)^T,\ldots,\tilde{\mathbf g}_{T,r},\left(\hat{\mathbf y}^{(n)}(r)\right)^T\right].\tag{23}
$$

为保持维数一致，这些隐藏状态经嵌入为 $\bar{\mathbf s}_{\mathrm{Tx}}^{(\tau_1^{\mathrm{tot}})}$ 与 $\bar{\mathbf s}_{\mathrm{Rx}}^{(\tau_1^{\mathrm{tot}})}$ 跨越快照传递。通过评估相邻快照间 AP 节点特征的注意力分数，跨快照最优选择 AP 模式的调度感知时间注意力函数表述为

$$
f_{\mathrm{att}}^{\mathrm{tem}}=\mathop{\operatorname{Top}}_{J-R}\left\{\operatorname{Softmax}_{\mathcal N(j)}\left(\mathop{\|}_{\mathcal N(j)}\left(\bar{\mathbf k}_{\mathcal N(j)}^{(\tau_1^{\mathrm{tot}})}\right)^T\bar{\mathbf W}_{\mathrm{att},\mathcal N(j)}\bar{\mathbf q}^{(\tau_1^{\mathrm{tot}})}+\mathbf m_{\mathrm{tem}}\right)\right\},\tag{24}
$$

其中 $\bar{\mathbf k}_{\mathcal N(j)}^{(\tau_1^{\mathrm{tot}})}$、$\bar{\mathbf W}_{\mathrm{att},\mathcal N(j)}$ 与 $\bar{\mathbf q}^{(\tau_1^{\mathrm{tot}})}$ 分别表示键向量、注意力矩阵与查询向量；$\mathbf m_{\mathrm{tem}}$ 为时间掩码向量，作用类似 $\mathbf m_{\mathrm{str}}$ 但作用于时间域：当一个 Tx-AP 节点跨时间（跨连续快照）聚合邻居特征时，$\mathbf m_{\mathrm{tem}}$ 确保只捕获与 Rx-AP 邻居相关的特征，而来自 CU 邻居的特征被掩掉——CU 邻居的注意力权重置为 $-\infty$，softmax 后概率为零。经类似激活、归一化与阈值化操作，框架推断下一快照的 Tx/Rx 配置，确保 AP 模式配置的时间一致性与可行性。所得离散变量 $\boldsymbol\Lambda$ 与 $\boldsymbol\kappa$ 在特征聚合前确定，并引导动态图构建中的局部特征传播。

其中 $\mathbf W_{\mathrm{agg}}$ 为聚合权重矩阵。为抑制梯度爆炸并保证发射功率约束（10c），每个预编码矩阵按

$$
\mathbf W_{j,i}\leftarrow\frac{\sqrt{P_j}\,\mathbf W_{j,i}}{\sqrt{\sum_{i=1}^{N_s}\left\|\mathbf W_{j,i}\right\|_F^2}}\tag{25}
$$

缩放，从而始终满足各 Tx-AP 的功率预算。

**3）三维卷积模块**：调度感知时间注意力处理后，重构回波信号 $\hat{\mathbf y}^{(n)}(r)$ 的实部与虚部沿通道维拼接，得到张量 $\hat{\mathbf Y}^{(n)}\in\mathbb R^{2\times RM\times N_s\times L}$；同时 Rx-AP 利用雷达序列 $\mathbf S_r$ 与第 $n$ 个快照的 Tx-AP 位置构造另一实值张量 $\hat{\mathbf S}_r^{(n)}\in\mathbb R^{2\times TM\times N_s\times L}$。这两个张量一同送入 3D-CNN 模块。

所用 3D-CNN 模块含两部分：各 Rx-AP 处的特征压缩网络与 CPU 处的集中式特征融合网络。在每个 Rx-AP，3D-CNN [37] 先从拼接输入张量 $\{\hat{\mathbf Y}^{(n)}\|\hat{\mathbf S}_r^{(n)}\}\in\mathbb R^{2\times JM\times N_s\times L}$ 提取特征，提取的高维特征再经多个线性层压缩为低维表示 $\mathbf R^{(n)}\in\mathbb R^{R\times\varrho}$，其中 $\varrho$ 为压缩特征维数。随后中央处理单元（CPU）用多层感知机（MLP）聚合这些压缩的多 AP 特征，输出估计位置与速度 $\{\hat{\mathbf p}_q^{(n)},\hat{\mathbf v}_q^{(n)}\}_{q=1}^{Q}$。这种分布式压缩与集中式融合方法显著降低多 AP 数据级融合所需的回传信令开销。

### D. 训练策略

**4）训练策略（两阶段训练）**：我们首先生成训练数据集：对每个目标 $q=1,\ldots,Q$ 给出真值位置 $\bar{\mathbf p}_{q,\chi}\in\mathbb R^2$ 与速度 $\bar{\mathbf v}_{q,\chi}\in\mathbb R^2$，以及相应 CSI $\mathbf H_\chi\in\mathbb C^{J\times M\times N_s\times K}$，其中 $\chi=1,\ldots,X$ 为数据集样本索引、$X$ 为数据集规模。

为确保所提动态图框架有效训练并提升目标参数估计精度，采用两阶段训练。第一阶段用数据集中的少量目标样本预训练嵌入接收信号处理架构中的 3D-CNN 模块；随后该预训练模块参数作为第二阶段初始化，第二阶段用完整数据集训练整个动态图学习框架。

在初始预训练阶段，AP 模式选择向量 $\boldsymbol\kappa$ 随机初始化，暂时忽略通信目标以独立训练 3D-CNN 模块。对每个数据集样本 $\chi$，我们采集 $N$ 个快照的回波信号²，优化映射函数 $\mathcal M$ 以最小化估计目标位置/速度与相应真值之间的加权均方误差，故预训练目标表述为

$$
\mathcal L_{\mathrm{pre}}=\frac{1}{X}\sum_{\chi=1}^{X}\left[\omega\left\|\bar{\mathbf p}_{q,\chi}-\hat{\mathbf p}_{q,\chi}\right\|^2+(1-\omega)\left\|\bar{\mathbf v}_{q,\chi}-\hat{\mathbf v}_{q,\chi}\right\|^2\right],\tag{26}
$$

其中 $\{\hat{\mathbf p}_{q,\chi},\hat{\mathbf v}_{q,\chi}\}$ 表示估计值。

> ² 训练时仅用最终快照做目标估计会因动态图拓扑变化导致特征波动，引起不稳定与收敛缓慢；为缓解该问题，我们在每个快照做中间估计，为训练过程提供连续稳定的引导。推断时只用最终快照结果。

在随后的训练阶段，3D-CNN 模块的预训练参数被整合进动态图学习框架，此时联合优化 AP 模式选择向量 $\boldsymbol\kappa$、用户关联矩阵 $\boldsymbol\Lambda$、预编码矩阵 $\mathbf W_{j,i}$ 与估计映射函数 $\mathcal M$，以同时最大化通信和速率并最小化估计误差。把约束（10b）转换为拉格朗日等价形式并考虑 $N$ 个快照采集的回波，联合训练目标表述为

$$
\mathcal L_{\mathrm{joint}}=\frac{1}{X}\sum_{\chi=1}^{X}\left[\omega\left\|\bar{\mathbf p}_{q,\chi}-\hat{\mathbf p}_{q,\chi}\right\|^2+(1-\omega)\left\|\bar{\mathbf v}_{q,\chi}-\hat{\mathbf v}_{q,\chi}\right\|^2+\rho\left(\gamma-R_c(\mathbf H_\chi)\right)\right],\tag{27}
$$

其中 $\rho\in[0,1]$ 平衡感知与通信，$\{\hat{\mathbf p}_{q,\chi},\hat{\mathbf v}_{q,\chi}\}$ 为经 3D-CNN 得到的位置与速度估计，$R_c(\mathbf H_\chi)$ 表示给定 CSI $\mathbf H_\chi$ 的可达通信和速率。为增强训练鲁棒性，我们采用**自适应惩罚因子** $\rho$，在训练中逐步增大其数值；该自适应策略把优化导向可行通信区域，缓解约束的突变违反。仿真中可能出现少量通信约束违反，通过精化初始化与应用后校正算法 [38] 处理，确保推断阶段始终满足约束。

**算法 1**　所提动态图框架

**输入**：全局 CSI、AP 位置。
**输出**：预编码 $\mathbf W_{j,i}$、模式向量 $\boldsymbol\kappa$、关联矩阵 $\boldsymbol\Lambda$ 与估计 $\{\hat{\mathbf p}_q,\hat{\mathbf v}_q\}_{q=1}^{Q}$。
1: **for** $n=1:N$ **do**
2: 　关联阶段：各 AP 执行分布式邻居聚合，并通过（17）（24）的前向传播计算局部最优 $\boldsymbol\Lambda^{(n)}$ 与 $\boldsymbol\kappa^{(n)}$；
3: 　各 AP 把关联决策上传 CPU，由 CPU 统一整体关联决策；
4: 　CPU 向各 AP 广播全局 $(\boldsymbol\Lambda^{(n)},\boldsymbol\kappa^{(n)})$；
5: 　预编码阶段：各 Tx-AP 执行邻居聚合并计算局部最优 $\mathbf W^{(n)}$；
6: 　Tx-AP 按 $(\boldsymbol\Lambda^{(n)},\boldsymbol\kappa^{(n)})$ 用 $\mathbf W^{(n)}$ 发射；
7: 　Rx-AP 接收回波并压缩特征；
8: 　利用回波 $\hat{\mathbf Y}^{(n)}$ 与估计器 $\mathcal M$ 获取估计值；
9: **end for**
10: **输出** $\mathbf W_{j,i}$、$\boldsymbol\kappa$、$\boldsymbol\Lambda$ 与估计 $\{\hat{\mathbf p}_q,\hat{\mathbf v}_q\}_{q=1}^{Q}$。

### E. 回传信令开销分析

本小节定量评估所提动态图学习框架的回传信令开销。开销以 CPU 与分布式 AP 之间交换的双精度浮点数个数度量。典型回传信令包括：全局 CSI 分发、AP—用户关联数据、预编码矩阵、AP 间协调消息与压缩回波特征。所提框架的完整操作流程由算法 1 总结。

在每个快照开始时，CPU 向各 AP 分发全局 CSI，约需 $JMN_sK$ 个双精度值。记 $D_{\mathrm{AP}}$ 与 $D_{\mathrm{CU}}$ 分别为 AP 与 CU 节点的聚合权重矩阵维数。在基于注意力的关联推断中，每个 AP 处理 $\tau_1^{\mathrm{tot}}D_{\mathrm{AP}}N_sMJ^2+\tau_1^{\mathrm{tot}}D_{\mathrm{CU}}N_sMK$ 个双精度值以计算注意力分数；随后每个 AP 上传其局部关联决策，约 $J^2+J^2K$ 个双精度值；CPU 再把整合后的全局关联决策广播回各 AP，另需 $J+TK$ 个双精度值。

建立图边权重后，每个 Tx-AP 执行局部特征聚合以优化预编码，该步约需 $\tau_1^{\mathrm{tot}}T(D_{\mathrm{Rx}}N_sMR+D_{\mathrm{CU}}N_sMK_u)$ 个双精度值；优化后的预编码矩阵在本地计算并存储于各 Tx-AP。最后，Rx-AP 把压缩回波特征上传 CPU，显著降低回传开销：传输这些压缩特征仅需 $R\varrho$ 个双精度值，远低于原始数据规模 $2RMN_sL$。

## IV. 所提 mirror-GAT 框架

尽管采用了特征压缩，上一节所提动态图学习框架仍因频繁的 AP—CPU 交互与跨快照复杂交互而固有较大开销。为应对这些实际约束，我们引入 **mirror-GAT** 框架，专为同时降低计算复杂度与回传信令开销而设计。与动态图方法不同，mirror-GAT 采用**一对共享的异构 GAT 模块**，显著减少可训练参数数量，便于在大规模无蜂窝 ISAC 网络中可扩展部署。为有效利用该结构，我们把原联合优化分解为两个互联但可处理的子问题：(i) 预编码优化；(ii) AP 模式选择与 CU 关联，由**邻接共享**的 GAT 模块迭代求解。

### A. 问题变换

为使 mirror-GAT 框架内结构化且独立地优化，我们先把预训练 3D-CNN 模块（见 III-D 节）作为固定的信号级融合映射纳入；将其视为固定估计器后，就从优化变量中排除，从而显著降低优化问题的复杂度与维数。在该固定估计器前提下，我们聚焦于联合优化 AP 模式选择、用户关联与发射预编码。

为提升可处理性，把原问题分解为两个相互依赖的层次化子问题。具体地，给定固定的 AP 模式选择向量 $\boldsymbol\kappa^\star$ 与用户关联矩阵 $\boldsymbol\Lambda^\star$，下层子问题仅优化预编码矩阵：

$$
\min_{\{\mathbf W_{j,i}\}}\ \omega\,\mathrm{RMSE}_p+(1-\omega)\,\mathrm{RMSE}_v\tag{28a}
$$
$$
\text{s.t.}\quad R_c\ge\gamma,\tag{28b}
$$
$$
\quad\qquad \sum_{i=1}^{N_s}\|\mathbf W_{j,i}\|_F^2\le P_j,\ \forall j\in\mathcal T.\tag{28c}
$$

利用由下层子问题（28）的解得到的优化预编码矩阵，我们继而构造上层子问题，以优化 AP 模式选择与用户关联决策：

$$
\min_{\{\boldsymbol\kappa,\boldsymbol\Lambda\}}\ \omega\,\mathrm{RMSE}_p+(1-\omega)\,\mathrm{RMSE}_v\tag{29a}
$$
$$
\text{s.t.}\quad R_c\ge\gamma.\tag{29b}
$$

这种**双层重构**把原联合优化任务解耦为两个更易处理的子问题，使每个 GAT 模块能高效求解特定子任务并降低计算复杂度。通过在这两个优化步骤之间迭代交替，mirror-GAT 框架系统性收敛到预编码矩阵 $\mathbf W_{j,i}^\star$、AP 模式选择向量 $\boldsymbol\kappa^\star$ 与用户关联矩阵 $\boldsymbol\Lambda^\star$ 的局部最优解；具体实现与迭代推断机制见下文。

### B. 图定义

完成问题变换后，我们构建两张异构**镜像图** $\mathcal G_1=(\mathcal V_1,\mathcal E)$ 与 $\mathcal G_2=(\mathcal V_2,\mathcal E)$，以迭代优化预编码矩阵 $\mathbf W_{j,i}$、AP 模式选择向量 $\boldsymbol\kappa$ 与用户关联矩阵 $\boldsymbol\Lambda$。两图共享同一邻接结构，但在消息传递方向与优化目标上根本不同：面向关联的图 $\mathcal G_2$ 采用**节点到边**消息传递以优化 AP 模式选择与用户关联，而面向预编码的图 $\mathcal G_1$ 采用**边到节点**消息传递以优化预编码。

**1）面向预编码的图**：预编码图节点集 $\mathcal V_1$ 含三类节点——Tx-AP、Rx-AP 与 CU，形式化表示为 $\mathcal V_1=\{\mathcal V_{\mathrm{Tx}},\mathcal V_{\mathrm{Rx}},\mathcal V_{\mathrm{CU}}\}$。该图边表示通信与感知交互，边特征由（11）（12）所定义的整形信道特征导出。在预编码优化任务中，每个 Tx-AP 的节点特征经 $\tau_1^{\mathrm{tot}}$ 个隐藏层迭代传播与更新，采用如下消息传递框架：

$$
\mathbf s_{\mathrm{Tx}}^{(\tau_2+1)}(t)=h_{\mathrm{agg}}\left(h_{\mathrm{att}}\left(\mathbf s_{\mathrm{Tx}}^{(\tau_2)}(t)\right)\odot h_{\mathrm{mp}}\left(\left\{\mathbf s^{(\tau_2)}(\xi)\right\}_{\xi\in\mathcal N(t)}\right)\right),\tag{30}
$$

其中 $h_{\mathrm{agg}}(\cdot)$、$h_{\mathrm{att}}(\cdot)$ 与 $h_{\mathrm{mp}}(\cdot)$ 分别表示聚合、注意力打分与消息传递函数。在预编码设计任务中，我们假设框架已知 AP 模式与用户关联策略。与所提动态图框架（从边信息中提取掩码注意力分数）不同，面向预编码的图采用**加权注意力打分**准则以增强特征聚合。具体地，注意力机制定义为

$$
h_{\mathrm{att}}\left(\mathbf s_{\mathrm{Tx}}^{(\tau_2)}(t)\right)=\alpha\,\operatorname{Softmax}_{\mathcal N(t)}\left(\mathop{\|}_{\mathcal N(t)}\left(\mathbf k_{\mathcal N(t)}^{(\tau_2)}\right)^T\mathbf W_{\mathrm{att},\mathcal N(t)}\mathbf q^{(\tau_2)}(t)\right)+(1-\alpha)\left\{(\mathbf 1-\boldsymbol\kappa)^T\|\boldsymbol\Lambda(t,:)\right\},\tag{31}
$$

其中 $\alpha$ 为注意力分数的加权因子，$\mathbf W_{\mathrm{att},\mathcal N(t)}$、$\mathbf q^{(\tau_2)}$ 与 $\mathbf k_{\mathcal N(t)}^{(\tau_2)}$ 分别表示注意力权重矩阵、查询向量与键向量。随后，邻居节点的信息经消息传递函数聚合为值向量：

$$
h_{\mathrm{mp}}\left(\left\{\mathbf s^{(\tau_2)}(\xi)\right\}_{\xi\in\mathcal N(t)}\right)=\mathcal M_{\mathrm{value}}\left(\mathbf s^{(\tau_2)}(\xi);\mathbf W_{\mathrm{value}}^{\xi}\right).\tag{32}
$$

最后，聚合阶段引入残差连接以确保稳定、缓解梯度消失并改善训练收敛：

$$
h_{\mathrm{agg}}\left(\mathbf s_{\mathrm{Tx}}^{(\tau_2)}(t)\right)=\mathbf W_{\mathrm{agg}}^{t}\operatorname{LeakyReLU}\left\{h_{\mathrm{att}}\left(\mathbf s_{\mathrm{Tx}}^{(\tau_2)}(t)\right)\odot h_{\mathrm{mp}}\left(\left\{\mathbf s^{(\tau_2)}(\xi)\right\}_{\xi\in\mathcal N(t)}\right)\right\}+\mathbf s_{\mathrm{Tx}}^{(\tau_2)}(t).\tag{33}
$$

通过结合加权注意力打分与残差连接，每个 Tx-AP 节点有效聚合邻居特征以确定局部最优预编码矩阵 $\mathbf W_{j,i}^\star$，故面向预编码的图显式求解下层优化子问题（28）。

**2）面向关联的图**：由于 AP 模式选择固有不确定性，面向关联的图采用简化节点结构，仅含 AP 节点与 CU 节点两类。该结构中，AP 节点间的动态连接被自适应重构，AP 与 CU 间的加权通信链路依据其信道特性与相互干扰条件动态建立；这种面向动态关联的方法可同时优化 AP 模式选择与用户关联。形式上，边集 $\mathcal E$ 划分为两个子集：连接 AP 节点与 CU 节点的通信边（$\mathcal E_{\mathrm{com}}$）与表示 AP 间感知交互的感知边（$\mathcal E_{\mathrm{sen}}$），故完整边集为 $\mathcal E=\{\mathcal E_{\mathrm{com}},\mathcal E_{\mathrm{sen}}\}$。

已知各 AP 的多用户 CSI 与由预编码图得到的局部优化预编码矩阵 $\mathbf W_{j,i}$，我们以归一化预编码信道增益初始化边隐藏状态：

$$
\mathbf s_{\mathrm{com}}^{(0)}(j,k)=\sum_{i=1}^{N_s}\mathbf h_{j,i,k}^H\mathbf w_{c,j,i,k},\tag{34}
$$

$$
\mathbf s_{\mathrm{sen}}^{(0)}(j,\ell)=\frac{1}{M^2}\sum_{n=1}^{M}\sum_{i=1}^{N_s}\sum_{m=1}^{M}\frac{1}{\left[\mathbf G_{j,\ell}\mathbf w_{r,j,i,m}\right]_n},\tag{35}
$$

其中 $\ell\in\mathcal J\setminus\{j\}$。

随后每个边隐藏状态由含 $\tau_2^{\mathrm{tot}}$ 个隐藏层的专用异构 GAT 处理。面向关联图内的前向传播更新表述为

$$
\mathbf s_{\mathrm{com}}^{(\tau_2+1)}(j,k)=g_{\mathrm{agg}}\left(g_{\mathrm{att}}\left(\mathbf s_{\mathrm{com}}^{(\tau_2)}(j,k)\right)\odot\mathop{\bigodot}_{\epsilon\in\mathcal N(j,k)}g_{\mathrm{mp}}\left(\mathbf s^{(\tau_2)}(\epsilon)\right)\right),\tag{36}
$$

$$
\mathbf s_{\mathrm{sen}}^{(\tau_2+1)}(j,\ell)=g_{\mathrm{agg}}\left(g_{\mathrm{att}}\left(\mathbf s_{\mathrm{sen}}^{(\tau_2)}(j,\ell)\right)\odot\mathop{\bigodot}_{\epsilon\in\mathcal N(j,\ell)}g_{\mathrm{mp}}\left(\mathbf s^{(\tau_2)}(\epsilon)\right)\right),\tag{37}
$$

其中 $g_{\mathrm{agg}}(\cdot)$、$g_{\mathrm{att}}(\cdot)$ 与 $g_{\mathrm{mp}}(\cdot)$ 分别表示特征聚合、基于边的注意力打分与边到边消息传递函数；$\mathcal N(j,\ell)$ 表示边 $(j,\ell)$ 做消息传递的相邻边集。

为有效引导 AP—用户关联与 AP 模式选择，注意力打分函数显式纳入全局节点权重信息：

$$
g_{\mathrm{att}}\left(\mathbf s_{\mathrm{com}}^{(\tau_2)}(j,k)\right)=\operatorname{Softmax}_{\mathcal N(j,k)}\left(\mathop{\|}_{\mathcal N(j,k)}\left(\mathbf k_{\mathcal N(j,k)}^{(\tau_2)}\right)^T\mathbf W_{\mathrm{att},\mathcal N(j,k)}\mathbf q^{(\tau_2)}(j,k)+\mathbf u_{j,k}^T\mathbf s_{\mathrm{com}}^{(\tau_2)}\right),\tag{38}
$$

$$
g_{\mathrm{att}}\left(\mathbf s_{\mathrm{sen}}^{(\tau_2)}(j,\ell)\right)=\operatorname{Softmax}_{\mathcal N(j,\ell)}\left(\mathop{\|}_{\mathcal N(j,\ell)}\left(\mathbf k_{\mathcal N(j,\ell)}^{(\tau_2)}\right)^T\mathbf W_{\mathrm{att},\mathcal N(j,\ell)}\mathbf q^{(\tau_2)}(j,\ell)+\mathbf u_{j,\ell}^T\mathbf s_{\mathrm{sen}}^{(\tau_2)}\right),\tag{39}
$$

其中 $\mathbf W_{\mathrm{att},\mathcal N}$、$\mathbf k_{\mathcal N}^{(\tau_2)}$ 与 $\mathbf q^{(\tau_2)}$ 分别表示用于基于边注意力打分的注意力权重矩阵、键向量与查询向量；向量 $\mathbf u$ 含可训练参数，在注意力评估阶段增强边特征。随后，来自邻居边的注意力加权信息经消息传递聚合为值向量：

$$
g_{\mathrm{mp}}\left(\left\{\mathbf s^{(\tau_2)}(\epsilon)\right\}_{\epsilon\in\mathcal N}\right)=\mathcal M_{\mathrm{value}}\left(\mathbf s^{(\tau_2)}(\epsilon);\mathbf W_{\mathrm{value}}^{\epsilon}\right).\tag{40}
$$

最后，局部边特征聚合阶段采用残差连接以稳定训练、提升网络性能并精化特征表示。聚合后的边状态更新为

$$
g_{\mathrm{agg}}\left(\mathbf s_{\mathrm{com}}^{(\tau_2)}(j,k)\right)=\mathbf s_{\mathrm{com}}^{(\tau_2)}(j,k)+\mathbf W_{\mathrm{agg}}^{j,k}\operatorname{Softmax}\left\{g_{\mathrm{att}}\left(\mathbf s_{\mathrm{com}}^{(\tau_2)}(j,k)\right)\odot g_{\mathrm{mp}}\left(\left\{\mathbf s^{(\tau_2)}(\epsilon)\right\}_{\epsilon\in\mathcal N(j,k)}\right)\right\},\tag{41}
$$

且感知边状态按同理更新：

$$
g_{\mathrm{agg}}\left(\mathbf s_{\mathrm{sen}}^{(\tau_2)}(j,\ell)\right)=\mathbf s_{\mathrm{sen}}^{(\tau_2)}(j,\ell)+\mathbf W_{\mathrm{agg}}^{j,\ell}\operatorname{Softmax}\left\{g_{\mathrm{att}}\left(\mathbf s_{\mathrm{sen}}^{(\tau_2)}(j,\ell)\right)\odot g_{\mathrm{mp}}\left(\left\{\mathbf s^{(\tau_2)}(\epsilon)\right\}_{\epsilon\in\mathcal N(j,\ell)}\right)\right\}.\tag{42}
$$

通过执行这种结构化的边到边信息整合，面向关联的图有效计算全局优化的边权重；这些边特征进而可确定局部最优 AP 模式选择向量 $\boldsymbol\kappa^\star$ 与用户关联矩阵 $\boldsymbol\Lambda^\star$，求解上层优化子问题（29）。

### C. 基于镜像的迭代

虽然面向预编码与面向关联的两张图各自给出局部最优解，但由于优化问题固有的耦合结构，每张图只执行一次可能收敛到次优局部极小；此外 mirror-GAT 框架在没有目标参数先验的情况下运行，单遍推断不足以实现高精度估计。为应对这些局限，我们提出**基于镜像的迭代精化**策略：把重构回波信号作为反馈，循环增强解，如图 4 所示。

令 $N_m$ 表示镜像迭代总数。在第 $n_m$ 次镜像迭代中，面向预编码的图 $\mathcal G_1$ 与面向关联的图 $\mathcal G_2^{(n_m)}$ 独立执行前向推断；于是 mirror-GAT 框架在每次迭代输出局部最优预编码矩阵 $\mathbf W_{j,i}^{(n_m)}$、AP 模式选择向量 $\boldsymbol\kappa^{(n_m)}$ 与用户关联矩阵 $\boldsymbol\Lambda^{(n_m)}$。

提取节点与边特征并确定局部解后，在每个 Rx-AP 重构回波信号张量 $\hat{\mathbf Y}^{(n_m)}\in\mathbb C^{R\times M\times N_s\times L}$，并将其整形为各 Rx-AP 节点的特征向量 $\hat{\mathbf y}^{(n_m)}(r)\in\mathbb R^{2N_sLM}$（$r\in\mathcal R^{(n_m)}$，$\mathcal R^{(n_m)}$ 为第 $n_m$ 次迭代的 Rx-AP 节点集）。对所有 $n_m>1$，这些回波特征用于更新下一次迭代的初始隐藏状态：

$$
\mathbf s_{\mathrm{Tx}}^{(n_m+1,0)}(t)=\left[\tilde{\mathbf h}_{t,1},\ldots,\tilde{\mathbf h}_{t,K_u},\tilde{\mathbf g}_{t,1},\left(\hat{\mathbf y}^{(n_m)}(r)\right)^T,\ldots\right],\tag{43}
$$

$$
\mathbf s_{\mathrm{Rx}}^{(n_m+1,0)}(r)=\left[\tilde{\mathbf g}_{1,r},\left(\hat{\mathbf y}^{(n_m)}(r)\right)^T,\ldots,\tilde{\mathbf g}_{T,r},\left(\hat{\mathbf y}^{(n_m)}(r)\right)^T\right],\tag{44}
$$

$$
\mathbf s_{\mathrm{sen}}^{(n_m+1,0)}(j,\ell)=\frac{1}{M^2}\sum_{n,i,m}\sum_{l}\frac{\hat{\mathbf Y}^{(n_m)}(\ell,m,i,l)}{\left[\mathbf G_{j,\ell}\mathbf w_{r,j,i,m}\right]_n}+\mathbf s_{\mathrm{sen}}^{(n_m,0)}(j,\ell).\tag{45}
$$

遵循与（22）（23）类似的原则，在连续迭代之间施加嵌入操作以保持维数一致并确保特征在迭代间无缝传播。

### D. 训练策略

mirror-GAT 框架的训练与测试阶段使用与 III-D 节相同真值数据集与预训练 3D-CNN 模块。为加速迭代过程收敛，我们用**层次邻近性策略**初始化面向预编码的图 $\mathcal G_1^{(0)}$。在缺乏目标位置信息时，初始 AP 模式选择向量 $\boldsymbol\kappa^{(0)}$ 通过选择与其他所有 AP 聚合距离最大的 $R$ 个 AP 节点构成：

$$
\boldsymbol\kappa^{(0)}=\mathop{\operatorname{Top}}_{R}\left\{\sum_{j'\in\mathcal J\setminus\{j\}}\left\|\mathbf q_j-\mathbf q_{j'}\right\|_2\right\},\tag{46}
$$

其中 $\mathbf q_j$ 表示第 $j$ 个 AP 的位置。确定 $\boldsymbol\kappa^{(0)}$ 后，每个 AP 节点选择信道增益最强的 $K_u$ 个用户节点作为其初始关联：

$$
\boldsymbol\Lambda^{(0)}(j,:)=\mathop{\operatorname{Top}}_{K_u}\left\{\sum_{i=1}^{N_s}\left\|\mathbf h_{j,i,k}\right\|_2^2\right\},\qquad \forall j\in\mathcal T.\tag{47}
$$

利用这些初始化，mirror-GAT 框架迭代计算最优预编码矩阵 $\mathbf W_{j,i}$、最优 AP 模式选择向量 $\boldsymbol\kappa$ 与用户关联矩阵 $\boldsymbol\Lambda$。

**算法 2**　所提 mirror-GAT 框架

**输入**：全局 CSI、AP 位置。
**输出**：预编码 $\mathbf W_{j,i}$、模式向量 $\boldsymbol\kappa$、关联矩阵 $\boldsymbol\Lambda$ 与估计 $\{\hat{\mathbf p}_q,\hat{\mathbf v}_q\}_{q=1}^{Q}$。
1: 初始化：CPU 生成 $\boldsymbol\Lambda^{(0)}$ 与 $\boldsymbol\kappa^{(0)}$；
2: **for** $n_m=1:N_m$ **do**
3: 　CPU 广播当前 $(\boldsymbol\Lambda^{(n_m-1)},\boldsymbol\kappa^{(n_m-1)})$ 与 CSI；
4: 　预编码阶段：各 Tx-AP 执行分布式邻居聚合，并通过（30）前向传播计算局部最优 $\mathbf W_{j,i}^{(n_m)}$；
5: 　Tx-AP 在 $(\boldsymbol\Lambda^{(n_m-1)},\boldsymbol\kappa^{(n_m-1)})$ 下用 $\mathbf W^{(n_m)}$ 发射，并上传设计的预编码器；
6: 　Rx-AP 接收回波、构造 $\hat{\mathbf Y}^{(n_m)}$ 并压缩特征供面向关联阶段使用；
7: 　关联阶段：CPU 利用全局 CSI 与压缩回波运行（36）的面向关联 GAT 前向，得到 $(\boldsymbol\kappa^{(n_m)},\boldsymbol\Lambda^{(n_m)})$；
8: **end for**
9: 利用最终回波 $\hat{\mathbf Y}^{(N_m)}$ 与估计器 $\mathcal M$ 获取估计值；
10: **输出** $\mathbf W_{j,i}$、$\boldsymbol\kappa$、$\boldsymbol\Lambda$ 与估计 $\{\hat{\mathbf p}_q,\hat{\mathbf v}_q\}_{q=1}^{Q}$。

### E. 回传信令开销降低分析

现定量评估所提 mirror-GAT 框架的回传信令开销，并强调其相对动态图学习方法的优势。mirror-GAT 显式把关联优化（由 CPU 集中执行）与预编码优化（由分布式 Tx-AP 本地执行）分离，详细操作流程由算法 2 总结。每次镜像迭代中，CPU 向 Tx-AP 传输全局关联数据约 $J+TK$ 个双精度值与本地 CSI 约 $TMN_sK_u$ 个双精度值；每个 Tx-AP 计算并上传预编码矩阵，约需 $TMN_s(K_u+M)$ 个双精度值。

记 $D_{\mathrm{Rx}}$ 与 $D_{\mathrm{CU}}$ 分别为 Rx-AP 与 CU 节点聚合权重矩阵的维数。每个 Tx-AP 在消息传递中约消耗 $\tau_2^{\mathrm{tot}}T(D_{\mathrm{Rx}}N_sMR+D_{\mathrm{CU}}N_sMK_u)$ 个双精度值。Rx-AP 向 CPU 上传压缩回波特征，显著降低开销：每次迭代仅需 $R\varrho$ 个双精度值。

总体而言，mirror-GAT 通过清晰任务分离、限制每次迭代仅一次交换、最小化预编码数据传输并避免双向同步而显著降低回传信令开销，因而在大规模协作无蜂窝 ISAC 部署中相比动态图学习框架具备更优可扩展性与实际可行性。

## V. 仿真结果

除另有说明，仿真参数与配置如下。所考虑协作无蜂窝 ISAC 系统含 14 个 Tx-AP 与 2 个 Rx-AP，各配备 8 根天线；每个 AP 的发射功率预算为 50 dBm；载频 24 GHz，系统带宽 120 MHz，含 32 个子载波与 16 个 OFDM 符号。Tx-AP 同时服务 16 个单天线 CU，并感知 3 个速度在 $-30$ 到 30 m/s 间均匀分布的目标；每个 Tx-AP 至多关联 $K_u=2$ 个 CU。通信与感知噪声功率均设为 $-80$ dBm，路损指数在 2.1 与 3.8 之间均匀分布。GNN 含 10 个隐藏层。训练使用 10 个时间快照与 10 次镜像迭代，压缩特征维数 $\varrho=25$；训练集含 12,000 个样本，学习率 $0.0001$。

### A. AP 选择与 CU 关联示例

图 5 展示所提动态图学习框架得到的 AP 模式选择与 CU 关联结果。图中网络实体标记如下：Tx-AP（蓝色圆圈）、Rx-AP（红色方块）、CU（绿色三角）、感知目标（紫色五角星）与杂波源（黄色菱形）；Tx-AP 与其关联 CU 之间建立的通信链路用蓝色连线表示。可以看到，所提方法自适应选择 AP 工作模式并形成高效的 AP—CU 关联。值得注意的是，位置靠近感知目标但距杂波源足够远的 AP 被优先配置为 Rx-AP；这种空间自适应选择显著提升接收回波质量、缓解杂波干扰，从而增强多目标位置与速度估计精度。

### B. 位置与速度估计性能

我们评估所提图学习框架的位置与速度估计性能。为突出动态图学习（Prop. dynamic graph）与 mirror-GAT（Prop. mirror-GAT）方法的优势，与其比较的基准方案包括：

- **Heuristic+GAT**：在 mirror-GAT 结构内采用层次邻近性原则（见 IV-D 节）做启发式 AP 模式选择与用户关联。
- **Random+GAT**：在 mirror-GAT 框架内随机选择 AP 模式与用户关联。
- **MMSE+CNN [20]**：采用 MMSE 预编码器结合启发式关联，使用集中式 3D-CNN 模型做信号级融合与参数估计，不含目标先验信息。
- **ZF+FFT [39]**：采用迫零预编码器与启发式关联，通过经典 3D-FFT 方法做最小二乘融合以估计位置与速度，不含目标先验知识。
- **Two-stage [40]**：先用宽波束发射在各 Rx-AP 计算距离—角度图，再用基于协作最大似然的定位与速度估计精化。

图 6(a) 与 6(b) 分别给出目标位置与速度估计 RMSE 随每 AP 发射功率 $P_j$ 的变化。如预期，增大 $P_j$ 一致改善所有方法的估计精度。所提动态图与 mirror-GAT 框架显著优于启发式与随机基准，在中等发射功率（如图 6 中约 50—60 dBm）下即分别取得低于 1 m 与 1 m/s 的位置/速度 RMSE。同时，所提方法一致优于传统 MMSE+CNN、ZF+FFT 与两阶段方法，清楚证明端到端鲁棒设计在协作网络优化、自适应预编码与无先验目标参数估计上的优势。此外，动态图框架性能略优于 mirror-GAT，代价是更高的计算复杂度与信令开销（后文分析）。

图 7 评估发射天线数 $M$ 与 OFDM 符号数 $L$ 对估计性能的影响。图 7(a) 表明增大 $M$ 显著改善动态图与 mirror-GAT 框架的定位精度，主要源于更高空间分辨率与阵列增益；类似地，图 7(b) 表明增大 $L$ 提升速度估计精度，归因于更长相干处理间隔与更好的多普勒分辨率。值得注意的是，所提框架展现出强泛化能力，在与训练不同的测试配置下仍取得优异估计性能；且在所有测试配置下，两种所提方法均一致优于启发式与随机基准，证实基于联合图学习的优化与估计的有效性。

图 8 展示 AP 部署密度（AP 数）如何影响感知与通信性能。两种所提框架在所有 AP 密度下均满足预定义通信和速率要求；增大 AP 数逐步提升位置与速度估计精度，同时提高可达通信速率，证实更密集的 AP 部署在感知精度与通信性能两方面均显著有益于协作无蜂窝 ISAC 网络。

### C. 权衡分析

图 9 与图 10 展示多用户通信与感知性能之间的权衡，以可达通信和速率阈值 $\gamma$ 与相应位置/速度 RMSE 表征。显然，施加更高的和速率约束会减少可用于感知的资源，从而降低估计精度并增大位置与速度 RMSE。具体地，图 9 展示 CU 数 $K$ 的影响：在给定和速率约束下，增大 $K$ 会略微改善感知精度，因为服务更多用户提供额外空间分集，使通信和速率要求能更高效地满足，留下更多资源用于目标照射与感知，从而降低位置与速度 RMSE。相反，图 10 表明增大感知目标数 $Q$ 会恶化估计性能：随着更多目标竞争有限感知资源，分配给单个目标的照射能量必然减少；此外，在压缩特征维数固定时，目标数增多会在数据融合中造成更大特征信息损失，进一步负面影响估计精度。这些观察凸显在通信与感知功能之间谨慎平衡资源分配的重要性，也清楚表明所提基于图学习的框架能有效管理该权衡，在协作无蜂窝 ISAC 系统中取得优越性能。

### D. 实际分析

为进一步考察所提算法的实际可行性，我们在现实 ISAC 部署中常见的两个关键因素下评估其性能。第一，传统 Rayleigh 与 Rician 信道模型可能不足以刻画城市 ISAC 环境的复杂传播特性（强烈的多径与杂波效应）。为获得更真实的评估，我们使用基于射线追踪的 NVIDIA Sionna-RT 工具箱 [41] 生成物理精确的无蜂窝 ISAC 传播场景，如图 11 所示；该仿真纳入镜面与漫反射、折射与绕射等关键传播现象，有效捕获典型城市多径与杂波丰富的条件。第二，信道估计不完美是实践中影响 ISAC 性能的另一关键因素。为评估所提算法在该损伤下的鲁棒性，我们把估计 CSI 建模为

$$
\hat{\mathbf h}_{j,i,k}=\mathbf h_{j,i,k}+\Delta\mathbf h,\qquad \Delta\mathbf h\sim\mathcal{CN}\left(0,\sigma_e^2\mathbf I_M\right),\tag{48}
$$

其中 $\sigma_e^2$ 表示信道估计误差方差。相应结果汇总于表 III，其中灰底行表示动态图学习框架、白底行表示 mirror-GAT 框架。可以看到，两种所提方法在实际损伤下均保持鲁棒的感知精度并满足通信和速率要求；此外，动态图学习方法在复杂异构环境中表现出更强的泛化能力，而 mirror-GAT 以显著更低的计算复杂度与信令开销达到相当的鲁棒性。

图 12 考察学习框架内关键参数对感知性能的影响。具体地，图 12(a) 评估 3D-CNN 模块中压缩特征维数 $\varrho$ 如何影响位置与速度估计精度：随 $\varrho$ 增大，两种框架的估计性能均显著改善，主要因为更大的压缩特征维数能保留更丰富的回波特征信息；然而增大 $\varrho$ 也因传输更完整的特征数据而增加回传开销。在中等压缩特征维数（$\varrho=25$）下，相比更高取值性能退化很小，却能大幅降低信令开销。图 12(b) 展示快照/迭代数与所提图学习方案精度的关系：增大这些参数通过提供更多视角观测与迭代精化提升估计性能，但代价是更高计算复杂度、开销与处理时延。值得注意的是，超过 $N/N_m=10$ 后估计精度趋于稳定，表明进一步增大收益递减。因此取 $\varrho=25$ 与 $N/N_m=10$ 可取得最优平衡，故此前仿真中一致采用该设置，也凸显其在实际大规模无蜂窝部署中的适用性。

### E. 计算复杂度

为评估所提图学习框架的实际可行性，我们以模型规模（参数数量）与不同发射天线数 $M$ 下的平均执行时间分析其计算复杂度。由于天线数显著影响每个 AP 的计算需求，它是实际实现复杂度的关键指标。图 13 报告的执行时间包含 AP 本地推断与建模为与传输数据量成正比的额外时延的仿真回传信令开销。如图 13 所示，mirror-GAT 框架一致表现出更低计算复杂度：相比动态图学习框架，其模型参数显著更少、执行时间更短。这些结果证实 mirror-GAT 方法高度适合实际大规模部署，因为它在保持多用户通信与目标感知竞争力的同时，有效平衡了计算效率与信令开销。

**图 5**：AP 模式选择与用户关联示意（Tx-AP、Rx-AP、CU、目标与杂波源，蓝色连线为 AP—CU 通信链路）。
**图 6**：感知性能随发射功率 $P_j$ 的变化：(a) 位置 RMSE；(b) 速度 RMSE。
**图 7**：不同参数下的感知性能：(a) 发射天线数 $M$；(b) OFDM 符号数 $L$。
**图 8**：感知性能随 AP 数 $J$ 的变化：(a) 位置 RMSE 与速率；(b) 速度 RMSE 与速率。
**图 9**：不同 CU 数 $K$ 下的权衡分析（位置/速度 RMSE 与和速率约束）。
**图 10**：不同目标数 $Q$ 下的权衡分析。
**图 11**：使用 Sionna-RT 射线追踪仿真器的无蜂窝 ISAC 多径传播场景。
**图 12**：感知性能随学习框架关键参数的变化：(a) 压缩特征维数 $\varrho$；(b) 快照数与迭代数。
**图 13**：复杂度分析：(a) 模型参数数量；(b) 平均执行时间（随发射天线数 $M$）。

## VI. 结论

本文研究了协作无蜂窝 ISAC 系统中的联合网络配置与多目标参数估计。我们提出采用结构与时间双重注意力机制的动态图学习框架，以及显著降低计算复杂度与信令开销的轻量级 mirror-GAT 框架。大量仿真验证两种框架均大幅优于启发式与近期基于深度学习的方案，在多种设置下取得更优多用户通信性能与鲁棒、高精度感知（位置 RMSE $<1$ m、速度 RMSE $<1$ m/s）。值得注意的是，mirror-GAT 以显著降低的复杂度提供相当性能，凸显其对大规模无蜂窝 ISAC 部署的实际可行性。

## 表格

**表 I　无蜂窝 ISAC 系统研究汇总**（按原表逐格转录；“✓”表示该文献涉及相应维度）

| 文献 | ISAC 场景 | 未知目标 | 用户关联 | AP 选择 | 预编码设计 | 信号融合 |
| --- | --- | --- | --- | --- | --- | --- |
| [15] | ✓ | | | ✓ | ✓ | |
| [16] | ✓ | | ✓ | | ✓ | ✓ |
| [17] | ✓ | | ✓ | | ✓ | ✓ |
| [18] | | ✓ | | | ✓ | |
| [19] | ✓ | | | ✓ | ✓ | |
| [20] | ✓ | ✓ | | ✓ | ✓ | |
| [21] | ✓ | ✓ | | ✓ | ✓ | |
| [22] | ✓ | | | | | ✓ |
| [23] | ✓ | | | ✓ | ✓ | |
| [24] | ✓ | | | | | ✓ |
| [25] | ✓ | | | ✓ | | |
| [26] | ✓ | ✓ | | | ✓ | |
| [27] | ✓ | ✓ | | ✓ | | |
| [28] | ✓ | | | ✓ | | |
| [29] | ✓ | | | | ✓ | |
| **本文** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**表 III　各类非理想场景下的实际分析**（按原表逐格转录；$J=8$、$K=8$、$Q=1$、$\gamma=10$ bps/Hz；灰底行为动态图学习框架，白底行为 mirror-GAT 框架）

| 指标 | 理想 | Sionna-RT | 不完美 CSI |
| --- | --- | --- | --- |
| 位置 RMSE（m）〔动态图〕 | 1.53 | 1.64 | 1.55 |
| 位置 RMSE（m）〔mirror-GAT〕 | 1.61 | 1.69 | 1.69 |
| 速度 RMSE（m/s）〔动态图〕 | 1.29 | 1.32 | 1.33 |
| 速度 RMSE（m/s）〔mirror-GAT〕 | 1.47 | 1.55 | 1.98 |
| 可达速率（bps/Hz）〔动态图〕 | 17.65 | 16.56 | 15.61 |
| 可达速率（bps/Hz）〔mirror-GAT〕 | 15.14 | 14.07 | 12.75 |

> **注**：原表以灰/白底行区分两种框架，Markdown 无底色，故以行标签〔动态图〕/〔mirror-GAT〕显式标注；表 II（系统记号）已在第 II 节逐格转录。

## 图注与表注

**图 1**：无蜂窝 ISAC 系统（分布式双功能 AP、目标与 CU）。
**图 2**：无蜂窝 ISAC 场景及其对应的异构图结构。
**图 3**：所提动态图学习框架。
**图 4**：所提 mirror-GAT 框架。
**图 5**：AP 模式选择与用户关联示意。
**图 6**：感知性能随发射功率 $P_j$ 的变化。
**图 7**：不同参数（$M$、$L$）下的感知性能。
**图 8**：感知性能随 AP 数 $J$ 的变化。
**图 9**：不同 $K$ 下的权衡分析。
**图 10**：不同 $Q$ 下的权衡分析。
**图 11**：Sionna-RT 射线追踪的无蜂窝 ISAC 多径传播场景。
**图 12**：感知性能随关键学习参数（$\varrho$、$N/N_m$）的变化。
**图 13**：复杂度分析（模型参数数量与平均执行时间）。

**表注**：表 I（无蜂窝 ISAC 研究汇总）与表 III（非理想场景实际分析）已在本页「表格」一节逐格转录，表 II（系统记号）在第 II 节逐格转录；表 I 与表 III 均用 PyMuPDF 渲染原 PDF（第 2 页与第 15 页）核对。

## 参考文献

> 以下按原文编号 [1]—[41] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “¨” 等变音与断行伪影已按常规写法整理，条目中被截断的卷/页信息以"（原文截断）"标注。

[1] P. Jiang, R. Liu, Q. Liu, and M. Li, “Dynamic graph learning-based positioning for cell-free ISAC,” in Proc. IEEE Global Commun. Conf. (GLOBECOM), Taipei, Dec. 2025.

[2] ITU-R, Draft New Recommendation, “Framework and overall objectives of the future development of IMT for 2030 and beyond,” June 2023.

[3] F. Liu, Y. Cui, C. Masouros, J. Xu, T. X. Han, Y. C. Eldar, and S. Buzzi, “Integrated sensing and communications: Toward dual-functional wireless networks for 6G and beyond,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1728–1767, June 2022.

[4] R. Liu, M. Li, H. Luo, Q. Liu, and A. Swindlehurst, “Integrated sensing and communication with reconfigurable intelligent surfaces: Opportunities, applications, and future directions,” IEEE Wireless Commun., vol. 30, no. 1, pp. 50–57, Feb. 2023.

[5] Z. Zhang, Y. Xu, C. Pan, H. Ren, Y. Yu, and J. Wang, “Cooperative bistatic ISAC systems for low-altitude economy,” June 2025.

[6] D. Zhang et al., “Integrated sensing and communications over the years: An evolution perspective,” Apr. 2025.

[7] K. Meng, C. Masouros, A. P. Petropulu, and L. Hanzo, “Cooperative ISAC networks: Opportunities and challenges,” IEEE Wireless Commun., vol. 32, no. 3, pp. 212–219, June 2025.

[8] J. A. Zhang, M. L. Rahman, X. Huang, S. Chen, Y. J. Guo, and R. W. Heath, “Perceptive mobile networks: Cellular networks with radio vision via joint communication and radar sensing,” IEEE Veh. Technol. Mag., vol. 16, no. 2, pp. 20–30, June 2021.

[9] Ö. T. Demir, E. Björnson, and L. Sanguinetti, “Foundations of user-centric cell-free massive MIMO,” Found. Trends Signal Process., vol. 14, no. 3–4, pp. 162–472, Jan. 2021.

[10] X. Guo, Q. Shi, S. Zhang, C. Xing, and L. Liu, “User equipment assisted localization for 6G integrated sensing and communication,” IEEE Trans. Commun., early access, June 2025.

[11] T. Yang, S. Li, Y. Song, K. Zhi, and G. Caire, “Cooperative multistatic target detection in cell-free communication networks,” in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), Milan, Italy, Mar. 2025.

[12] Y. Xu, E. G. Larsson, E. A. Jorswieck, X. Li, S. Jin, and T.-H. Chang, “Distributed signal processing for extremely large-scale antenna array systems: State-of-the-art and future directions,” IEEE J. Sel. Topics Signal Process., vol. 19, no. 2, pp. 304–330, Mar. 2025.

[13] P. Li, M. Li, R. Liu, Q. Liu, and A. L. Swindlehurst, “Sensing-oriented adaptive resource allocation designs for OFDM-ISAC systems,” Apr. 2025. [Online]. Available: https://arxiv.org/abs/2504.06605

[14] W. Zhu, S. Zhang, and L. Liu, “Joint transmission and compression optimization for networked sensing with limited-capacity fronthaul links,” IEEE Trans. Wireless Commun., vol. 24, no. 8, pp. 6643–6657, 2025.（原文截断）

[15] S. Liu, R. Liu, Z. Lu, M. Li, and Q. Liu, “Cooperative cell-free ISAC networks: Joint BS mode selection and beamforming design,” in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), Dubai, United Arab Emirates, Apr. 2024, pp. 1–6.

[16] X. Lou, W. Xia, S. Jin, and H. Zhu, “Beamforming optimization in distributed ISAC system with integrated active and passive sensing,” IEEE Trans. Commun., vol. 73, no. 3, pp. 1607–1620, Mar. 2025.

[17] X. Yan, Z. Wang, Y. Jia, Z. Zhang, and Y. Huang, “Access point selection and beamforming design for cell-free network: From fractional programming to GNN,” IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 9345–9360, Aug. 2024.

[18] H. A. Ammar, R. Adve, S. Shahbazpanahi, G. Boudreau, and K. V. Srinivas, “Distributed resource allocation optimization for user-centric cell-free MIMO networks,” IEEE Trans. Wireless Commun., vol. 8, no. 3, pp. 3099–3115, May 2022.

[19] J. Zhang et al., “Joint resource allocation and user association for multi-cell integrated sensing and communication systems,” Springer EURASIP J. Wireless Commun. Network., no. 4, July 2023.

[20] Z. Wang and V. W. S. Wong, “Cooperative ISAC for localization and velocity estimation using OFDM waveforms in cell-free MIMO systems,” in Proc. IEEE Conf. Acoust. Speech Signal Process. (ICASSP), Hyderabad, India, Apr. 2025, pp. 1–5.

[21] A. Chowdary, A. Bazzi, and M. Chafii, “On hybrid radar fusion for integrated sensing and communication,” IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 8984–9000, Aug. 2024.

[22] B. Du, R. Mao, N. Kong, and D. Sun, “Distributed data fusion for on-scene signal sensing with a multi-UAV system,” IEEE Trans. Control Netw. Syst., vol. 7, no. 3, pp. 1330–1341, Sep. 2020.

[23] Z. Wei, R. Xu, Z. Feng, H. Wu, N. Zhang, and W. Jiang, “Symbol-level integrated sensing and communication enabled multiple base stations cooperative sensing,” IEEE Trans. Veh. Technol., vol. 73, no. 1, 2024.（原文截断）

[24] E. C. Strinati et al., “Distributed intelligent integrated sensing and communications: The 6G-DISAC approach,” in Proc. Joint Euro. Conf. Netw. Commun. & 6G Summit (EuCNC/6G Summit), Antwerp, Belgium, June 2024, pp. 392–397.

[25] Z. Wei et al., “Integrated sensing and communication enabled multiple base stations cooperative sensing towards 6G,” IEEE Network, vol. 38, no. 4, pp. 207–215, July 2024.

[26] A. Zakeri et al., “Dynamic joint communications and sensing precoding design: A Lyapunov approach,” Mar. 2025.

[27] L. Jiang, K. Meng, M. Temiz, J. Hu, and C. Masouros, “Federated learning strategies for coordinated beamforming in multicell ISAC,” Jan. 2025. [Online]. Available: https://arxiv.org/abs/2501.16951

[28] U. Demirhan and A. Alkhateeb, “Cell-free ISAC MIMO systems: Joint sensing and communication beamforming,” IEEE Trans. Commun., vol. 73, no. 6, pp. 4454–4468, June 2025.

[29] I. W. G. Da Silva, D. P. M. Osorio, and M. Juntti, “Multi-static ISAC in cell-free massive MIMO: Precoder design and privacy assessment,” IEEE Globecom Workshops (GC Wkshps), Kuala Lumpur, Malaysia, Dec. 2023, pp. 461–466.

[30] J. He, H. Li, Z. He, W. Wang, and Z. Cheng, “Exploiting base station for remote sensing: Modeling, joint transceiver design, and experiment,” IEEE Trans. Aerosp. Electron. Syst., vol. 60, no. 6, pp. 8184–8197, Dec. 2024.（原文截断）

[31] U. Demirhan and A. Alkhateeb, “Learning beamforming in cell-free massive MIMO ISAC systems,” in Proc. IEEE Signal Process. Advances Wireless Commun. Workshop (SPAWC Wkshps), Lucca, Italy, Sep. 2024.

[32] P. Jiang, M. Li, R. Liu, W. Wang, and Q. Liu, “Joint waveform and beamforming design in RIS-ISAC systems: A model-driven learning approach,” IEEE Trans. Commun., vol. 73, no. 8, pp. 6469–6483, Aug. 2025.（原文截断）

[33] Z. Wang and V. W. S. Wong, “Heterogeneous graph neural network for cooperative ISAC beamforming in cell-free MIMO systems,” in Proc. ACM MobiCom Workshop Integrated Sensing Commun. Syst. (SACOM), Washington D.C., Nov. 2024, pp. 2161–2172.

[34] L. Lian, C. Bai, Y. Xu, H. Dong, R. Cheng, and S. Zhang, “Learning to beamform for cooperative localization and communication: A link heterogeneous GNN-based approach,” Apr. 2025.

[35] S. Aravind et al., “DySAT: Deep neural representation learning on dynamic graphs via self-attention networks,” in Proc. ACM Int. Conf. Web Search Data Mining (WSDM), Houston, TX, Feb. 2020, pp. 519–527.（原文截断）

[36] E. Björnson and L. Sanguinetti, “Scalable cell-free massive MIMO systems,” IEEE Trans. Commun., vol. 68, no. 7, pp. 4247–4261, July 2020.

[37] S. Ji, W. Xu, M. Yang, and K. Yu, “3D convolutional neural networks for human action recognition,” IEEE Trans. Pattern Anal. Mach. Intell., vol. 35, no. 1, pp. 221–231, Jan. 2013.

[38] P. Jiang, M. Li, R. Liu, W. Wang, and Q. Liu, “SLP-based dual-functional waveform design for ISAC systems: A deep learning approach,” IEEE Trans. Veh. Technol., vol. 74, no. 7, pp. 11105–11119, 2025.（原文截断）

[39] Z. Xiao, R. Liu, M. Li, Q. Liu, and A. L. Swindlehurst, “A novel joint angle-range-velocity estimation method for MIMO-OFDM ISAC systems,” IEEE Trans. Signal Process., vol. 72, pp. 3805–3818, Aug. 2024.（原文截断）

[40] L. Pucci and A. Giorgetti, “Joint target acquisition and refined position estimation in OFDM-based ISAC networks,” Int. Workshop Signal Process. Artif. Intell. Wireless Commun. (SPAWC), Surrey, U.K., July 2025.（原文截断）

[41] J. Hoydis et al., “Sionna RT: Differentiable ray tracing for radio propagation modeling,” IEEE Globecom Workshops (GC Wkshps), Kuala Lumpur, Malaysia, Dec. 2023, pp. 317–321.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含四条贡献与记号定义）；第 II 节系统模型与问题表述（A 多用户通信指标，式（1）—（5）；B 雷达感知指标，式（6）—（9）；C 问题表述，式（10a）—（10e），图 1—2、表 II）；第 III 节所提动态图学习框架（图定义与初始化，式（11）—（15）；结构注意力模块，式（16）—（21）；调度感知时间注意力模块，式（22）—（24）；3D 卷积模块；训练策略，式（25）—（26），算法 1；回传开销分析，图 3）；第 IV 节所提 mirror-GAT 框架（问题变换，式（28a）—（29b）；图定义，式（30）—（42）；基于镜像的迭代，式（43）—（45），初始化式（46）—（47），算法 2；开销降低分析，图 4）；第 V 节仿真结果（A AP 选择与 CU 关联；B 位置与速度估计性能；C 权衡分析；D 实际分析，式（48）与表 III；E 计算复杂度，图 5—13）；第 VI 节结论；表 I 与表 III（逐格）、表 II（逐格）；图 1—13 图注；参考文献 [1]—[41] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—13 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I、表 II、表 III 均逐格转录，其中表 I 与表 III 用 PyMuPDF 渲染原 PDF（第 2、15 页）核对；④作者简介与版权声明不在正文范围，未收录；⑤**PDF 抽取文本中部分中间公式（式（11）—（15）、（17）—（23）、（26）—（27）、（41）—（47））因多行堆叠排版出现字符错位**，译文按上下文语义复原其结构（含注意力、消息传递、训练损失与镜像初始化），符号含义未改动，建议以原 PDF 复核；⑥若干参考文献卷/页信息在抽取文本中被截断，已标注"（原文截断）"、未擅自补全；⑦骨架版本日期 "2026-09-26" 与 PDF 实际 v2 2025-11-14 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
