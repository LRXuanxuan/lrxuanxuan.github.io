---
layout: page
title: "RIS 两阶段细化稀疏信道估计｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-22756-two-stage-refinement-sparse-channel-estimation-for-reconfigurable-inte/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/743e257366f3c1bd/) · [原文 arXiv](https://arxiv.org/abs/2609.22756) · [全部目录](/papers/catalog/)

# 可重构智能超表面天线（RIMSA）大规模 MIMO 的两阶段细化稀疏信道估计

**原题：** Two-Stage Refinement Sparse Channel Estimation for Reconfigurable Intelligent Metasurface Antenna (RIMSA) Massive MIMO  
**作者：** Yakun Ma、Hui-Ming Wang（IEEE 高级会员）、Jiaping He（西安交通大学信息与通信工程学院，西安 710049）、Qingli Yan（西安邮电大学计算机科学与技术学院，西安 710121）  
**版本：** arXiv:2609.22756v1（cs.IT），2026 年 9 月 19 日提交，原文 15 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—VII 节、算法 1—3、表 I、图 1—图 12 图注与参考文献（英文原条目 53 条）按原文结构录入；逐句逐式终校未做。

## 摘要

为满足日益增长的高数据速率与大容量需求，下一代无线通信系统要求收发机配备大量天线，基于超表面天线的大规模多输入多输出（MIMO）已成为有前景的方案。本文研究新兴的**可重构智能超表面天线（RIMSA）**阵列系统中的信道估计问题。具体地，本文基于压缩感知（CS）原理提出一种**两阶段细化（TSR）信道估计方法**。第一阶段利用 RIMSA 的天线结构，通过在所有 RIMSA 上设置**相同的相位响应向量**来接收导频；由此降低 CS 框架下测量矩阵的相干性并改善信道估计性能。然而这种特殊设计引入**信道到达角（DoA）估计模糊**，给出一个模糊的候选 DoA 集合。第二阶段优化超材料单元的相位响应以消除该模糊，并准确估计 DoA 与信道系数。总体而言，第一阶段的估计精度以模糊为代价得到改善，而该模糊在第二阶段被消除。本文通过数值结果并与现有方法比较，展示了 TSR 方法的性能优势。

**关键词：** 可重构智能超表面天线；信道估计；压缩感知。

## I. 引言

随着移动通信的快速发展，用户对更高数据速率与容量的需求不断上升。多输入多输出（MIMO）等关键技术正部署于第五代（5G）移动通信网络，以支撑增强宽带传输、高可靠低时延通信等各种应用场景 [1]。作为 MIMO 技术的扩展，超大规模大规模 MIMO（XL-MIMO）已被引入并在第六代（6G）移动通信发展中发挥重要作用 [2]；然而 XL-MIMO 系统往往结构复杂、成本高且能耗大 [3]。因此需要能效更高的 MIMO 技术，才能实现高功效、低时延、高可靠与更广覆盖的愿景。

在此背景下，**可重构智能表面（RIS）**受到日益关注。RIS 由大量密集排列的亚波长无源电磁（EM）超材料单元构成 [4]，其物理参数可独立调节以定制电磁波（EMW）的传播特性。RIS 通过调控每个超材料单元中电子元件（如可调电抗与电阻元件）的谐振特性，实现对 EMW 传播与辐射方向图的灵活操控 [5]—[7]。凭借优异的 EMW 操控能力，RIS 能够重构或调控无线传播环境 [5]。目前 RIS 的广泛应用主要集中在其作为**无源反射面**的角色：部署于发射机与接收机之间，如图 1(a) 所示。

典型的 RIS 调节入射到表面上的 EM 信号的相位并将其反射回传播环境，从而帮助发射机与接收机之间的信号克服恶劣传播条件并扩展网络覆盖 [8]。近期研究表明，作为无源器件，RIS 在提升通信速率 [9]—[11]、增强能量效率 [12]、[13]，甚至改善物理层安全 [14]、[15] 方面表现良好。然而在 RIS 辅助通信链路中，反射带来的**双衰落效应**使接收端反射信号经历显著衰减 [16]。为解决该问题，[17]—[19] 提出了**有源 RIS** 架构以增强反射功率；但有源 RIS 因有源器件而同样存在高成本与低能效问题。

超表面的应用已超越传统反射器方式。用 RIS 构造的天线可直接控制辐射 EMW 的相位与幅度，以实时、动态可配置的方式实现信号收发。如图 1(b) 所示，超表面天线部署在接收端；通过调节天线响应，超表面天线可在天线前端以模拟波束赋形处理入射信号，而无需额外硬件。此类超表面天线的两种典型架构是**动态超表面天线（DMA）** [20]、[21] 与**可重构全息表面（RHS）** [22]。然而两种架构通常基于**串馈结构**，即超材料单元被顺序激励：DMA 中信号沿馈电波导传播引入额外频率选择性，而较差的两维（2D）端口隔离使直接二维实现困难；RHS 中馈源产生的参考波像漏波天线那样沿超表面传播，故相位依赖单元位置，只有幅度可直接调节。

近期，[23]—[26] 提出了一种**可重构智能超表面天线（RIMSA）**架构。与 DMA、RHS 不同，RIMSA 采用**底部同轴馈电的并联馈电网络**，每个超材料单元由底部馈源直接激励，如图 2 所示。该架构确保更好的端口隔离并便于实现二维阵列；此外，通过同轴馈电网络同时激励所有单元，RIMSA 缓解了天线响应的频率选择性。每个单元的重构通过向变容二极管施加直流（DC）电压调节，实现连续相位响应。由于每个 RIMSA 天线把多个单元连接到单一射频（RF）链，接收机结构天然类似混合模拟—数字 MIMO 系统 [27]。

获取准确的信道状态信息（CSI）是充分发挥超表面使能无线系统潜力的必要条件，而发展高效信道估计方案仍是活跃研究方向。对 RIS 辅助通信，由于反射单元的无源特性，信道估计尤其具有挑战性。为应对该问题，[28] 提出一种利用确定性信道模型与最优 RIS 配置的优化分离信道估计策略，可显著降低导频开销；从压缩感知（CS）角度看，[29] 为 RIS 辅助毫米波系统引入匹配追踪结合相位旋转的算法，通过在 RIS 面板上部署少量有源单元高效估计导向矢量与复信道增益。

除无源反射器外，基于超表面的天线阵列也受到广泛关注。[30] 为平面全息 MIMO（HMIMO）阵列提出最小二乘估计器；考虑实际硬件的非理想性，[31] 显式研究严重互耦效应下的 HMIMO 信道估计，把该任务重构为向量分解问题并发展混合消息传递算法。对 DMA 辅助系统，[32] 在最小均方误差准则下研究信道估计，并相应优化 DMA 相移矩阵与导频信号以提升性能；此外，[33] 为 DMA 辅助正交频分复用系统提出基于张量的信道估计框架，利用角度稀疏性。针对超表面天线的到达角（DoA）估计，[34] 在视距主导信道模型下利用 HMIMO 阵列产生的辐射波束估计信道参数；[35] 则采用基于 MUSIC 的算法估计 DoA 信息。

此外，鉴于 RIMSA 阵列与混合 MIMO 的结构相似性，混合 MIMO 的信道估计方法可作为基线。已有工作 [36]—[44] 处理稀疏多径信道下混合 MIMO 的基于 CS 的信道估计：具体地，非均匀量化角度网格 [36]、凸优化 [37] 以及最小均方误差准则下的混合模拟—数字波束赋形设计 [38] 被用于测量矩阵设计以降低相干性并提升估计性能；为缓解网格失配，提出了网格细化方法，如分布式网格匹配追踪（DGMP）[39]、Newton 细化方法 [40] 与迭代离网格误差补偿算法 [41]；关于无网格方法，已发展迭代重加权（IR）方法 [43] 与多分辨率码本 [44]。然而这些现有方法通常聚焦于在**全维角度字典**上重建信道，因此测量矩阵的互相干性天然受字典规模的限制，制约了估计精度的进一步提升。

本文为配备 RIMSA 的接收机提出一种基于 CS 的**两阶段细化（TSR）**信道估计方法。与既有 RIS 辅助方法 [28]、[29]（估计级联反射信道）以及面向串馈或连续孔径超表面架构的 DMA/HMIMO 估计器 [30]—[35] 不同，本文聚焦**并联馈电的 RIMSA 接收机**。更重要的是，不同于在固定全维字典上优化测量矩阵或细化网格的传统基于 CS 的混合 MIMO 信道估计方法 [36]—[44]，所提 TSR 方法利用 RIMSA 布局的特定**周期性**，在第一阶段直接降低测量矩阵的列维数，从而缓解全字典 CS 方法的互相干性瓶颈。具体地，通过在所有 RIMSA 上配置**相同的相移向量**，与不同物理 DoA 相关联的响应向量被有意折叠为缩减的主相位响应集合，该设计降低有效测量矩阵的互相干性并提升第一阶段 DoA 估计的可靠性。此外，本文优化相移向量以确保 RIMSA 的空间响应在整个感兴趣的 DoA 范围内足够平坦，从而保证稳健的接收功率——这是以往工作常忽视的实际约束。尽管第一阶段引入 DoA 模糊并给出候选角度集，它有效提供了高精度的初始路径子空间。随后在第二阶段，进一步优化每个超材料单元的相位响应以消除该模糊，并从候选集合中准确估计 DoA 与信道系数。因此，与传统基于 CS 的信道估计方法相比，所提方法取得更高的信道估计精度。

本文贡献如下：

- 提出基于 CS 的 TSR 信道估计框架，把估计过程分解为**子空间获取**与**模糊消除**。该方法缓解全维字典方法的互相干性限制，在有限 RF 链下实现高精度估计。
- 第一阶段利用 RIMSA 阵列的结构周期性压缩测量矩阵。通过在天线间配置相同相移向量，显著降低互相干性下界，实现信号子空间的高精度获取；同时优化 RIMSA 空间响应以保证平坦覆盖，有效防止随机方向图零点造成的信号损失。
- 第二阶段发展一种细化机制以消除第一阶段特定相位配置引入的 DoA 模糊。利用 **Riemannian 流形优化**算法优化导频测量矩阵，从而最小化互相干性并提升从候选集合估计 DoA 与信道系数的精度。
- 给出所提方法全面的数值仿真结果与分析，并与现有信道估计方法比较。数值结果表明所提方法优于现有方法，在基于 RIMSA 的接收机系统中取得更优估计精度。

本文其余部分安排如下：第 II 节详细介绍 RIMSA 阵列模型；第 III 节介绍基于天线结构的信道估计问题；第 IV 节给出所提 TSR 方法；第 V 节分析计算复杂度与可行性；第 VI 节给出仿真结果与分析；第 VII 节总结全文。

**记号：** 标量用斜体字母（如 $a$），向量用粗体小写字母（如 $\mathbf a$），矩阵用粗体大写字母（如 $\mathbf A$）。上标 $(\cdot)^{T}$、$(\cdot)^{*}$、$(\cdot)^{H}$、$(\cdot)^{-1}$ 分别表示转置、复共轭、共轭转置与逆算子。$|\cdot|$ 表示标量绝对值，$\lVert\cdot\rVert_0$、$\lVert\cdot\rVert_2$、$\lVert\cdot\rVert_F$ 分别表示 $\ell_0$ 范数、$\ell_2$ 范数与 Frobenius 范数。符号 $\odot$ 表示 Hadamard 积。$\operatorname{diag}(\mathbf a)$ 表示以向量 $\mathbf a$ 元素为主对角线的对角矩阵，$\operatorname{blkdiag}(\mathbf A_1,\ldots,\mathbf A_N)$ 表示由矩阵 $\mathbf A_1,\ldots,\mathbf A_N$ 构成的块对角矩阵。$\mathbb C^{M\times N}$ 表示 $M\times N$ 复值矩阵集合。$\operatorname{vec}(\cdot)$ 表示向量化算子（把矩阵各列堆叠为单列向量），$\operatorname{Re}\{\cdot\}$ 表示复数的实部。最后，$\exp(\cdot)$ 与 $\angle(\cdot)$ 分别表示逐元素取指数与逐元素取相位算子。

## II. 系统模型

本节先在第 II-A 节描述 RIMSA 架构，随后在第 II-B、II-C 节分别给出信道模型与训练模型。

### A. RIMSA 架构

RIMSA 是一种可灵活配置的超表面天线，便于根据无线环境进行适配与重构。如图 2 所示，一个 RIMSA 主要由超材料单元、基于变容二极管的相移电路、并联馈电网络与馈电端口构成。每个超材料单元的相位控制电路能够调节 EM 信号的相位：具体地，通过调节相位控制电路的直流电压，可改变变容二极管的电容从而改变该超材料单元的相位响应。相移取决于相位控制电路，由此实现 EMW 的连续相位控制与模拟波束赋形。工作在接收模式时，入射 EMW 同时激励一个 RIMSA 的全部超材料单元；各单元级接收信号随后经并联馈电网络合并并送入相应 RF 链做基带处理。由于单元是**并联**而非沿波导顺序馈电，RIMSA 避免了 DMA 或 RHS 架构中典型的波导诱导频率选择性。

传统混合模拟—数字 MIMO 架构依赖专用模拟移相器网络，因移相器的有源调谐需求而天然具有高功耗；相反，RIMSA 的辐射／响应方向图由动态可调的超材料单元形成，这些单元集成于由变容二极管等无源元件构成的并联馈电网络，显著降低功耗。此外，由于移相器响应速度有限，传统混合 MIMO 系统在单个符号周期内呈现固定辐射方向图；而 RIMSA 得益于变容二极管的纳秒级响应时间，可实现**亚符号级波束重构**（详见 [26]）。因此，超材料单元可在单个符号周期内由控制电路快速重构多次，便于对动态信道条件实时适配。

一般 RIMSA 阵列如图 3 所示。每个 RIMSA 由 $N_E=N_{Ex}\times N_{Ey}$ 个密集排列的亚波长超材料单元构成，并连接一条 RF 链。RIMSA 阵列由 $N_R=N_{Rx}\times N_{Ry}$ 个这样的超表面天线组成，沿 $x$ 轴的天线间距为 $N_{Ex}d$、沿 $y$ 轴为 $N_{Ey}d$，其中 $d$ 为每个 RIMSA 内相邻单元的间距。因此整个接收机含 $N=N_RN_E$ 个超材料单元与 $N_R$ 条 RF 链。集成的 EMW 控制与重构通过动态配置超材料单元的相位响应实现。具体地，对 $n_r=1,2,\ldots,N_R$ 与 $n_e=1,2,\ldots,N_E$，连接到第 $n_r$ 条 RF 链的 RIMSA 中第 $n_e$ 个超材料单元的响应为

$$
v_{n_r,n_e}=e^{-\mathrm j\alpha_{n_r,n_e}},\tag{1}
$$

其中 $\alpha_{n_r,n_e}$ 表示由施加于对应变容二极管的偏置电压决定的相移。该响应在同一 RIMSA 内各单元级接收信号合并并送入关联 RF 链之前为其提供模拟权重。相应地，连接到第 $n_r$ 条 RF 链的 RIMSA 的接收相移向量定义为

$$
\mathbf v_{n_r}=\frac{1}{\sqrt{N_E}}\left[v_{n_r,1},v_{n_r,2},\ldots,v_{n_r,N_E}\right]^{T}.\tag{2}
$$

### B. 信道模型

RIMSA 阵列与发射机之间的传播信道建模为含 $K$ 条可分辨传播路径的窄带频平多径信道。参数化信道模型 $\mathbf h$ 可表示为

$$
\mathbf h=\sum_{k=1}^{K}\mathbf a_k\beta_k,\tag{3}
$$

其中 $\beta_k$ 表示复信道衰减，$\mathbf a_k\in\mathbb C^{N\times1}$ 表示第 $k$ 条入射路径对应的阵列流形向量（$k=1,2,\ldots,K$）。阵列流形向量具有如下结构：

$$
\mathbf a_k=\left[\mathbf a_{k,1}^{T},\ldots,\mathbf a_{k,n_r}^{T},\ldots,\mathbf a_{k,N_R}^{T}\right]^{T},\tag{4}
$$

其中每个 $\mathbf a_{k,n_r}\in\mathbb C^{N_E\times1}$（$n_r=1,\ldots,N_R$）为第 $n_r$ 个 RIMSA 的导向矢量：

$$
\mathbf a_{k,n_r}=\left[e^{-\mathrm j2\pi\frac{\mathbf q_{n_r,1}^{H}\mathbf e_k}{\lambda}},\ldots,e^{-\mathrm j2\pi\frac{\mathbf q_{n_r,N_E}^{H}\mathbf e_k}{\lambda}}\right]^{T},\tag{5}
$$

其中 $\lambda$ 为波长，$\mathbf e_k$ 为第 $k$ 个方向的单位向量，$\mathbf q_{n_r,n_e}$ 为第 $n_r$ 个 RIMSA 的第 $n_e$ 个超材料单元的位置，$\mathbf q_{n_r,n_e}=[d_{x,n_r,n_e},d_{y,n_r,n_e},0]^{T}$，其中 $d_{x,n_r,n_e}$ 与 $d_{y,n_r,n_e}$ 表示相对阵列参考点 $O$ 的 $x$ 与 $y$ 坐标。信道模型可写为更紧凑的矩阵形式

$$
\mathbf h=\mathbf A\boldsymbol\beta,\tag{6}
$$

其中 $\boldsymbol\beta=[\beta_1,\ldots,\beta_K]^{T}$ 为路径衰落向量，$\mathbf A=[\mathbf a_1,\ldots,\mathbf a_K]\in\mathbb C^{N\times K}$ 为阵列流形矩阵。

### C. 训练模型

尽管二维平面 RIMSA 代表实际硬件架构，为在不引入记号混乱的前提下清晰呈现所提 TSR 方法的数学框架，本文采用图 4 所示的一维 RIMSA 阵列模型[^1]。

[^1]: 在理想条件下，该一维表述可在数学上推广到二维均匀平面阵。利用 Kronecker 积的性质，在二维 RIMSA 间配置相同相移可精确解耦阵列流形（与一维情形相同），从而取得相同的维数缩减与模糊集规模；模糊集规模本质上对应每个 RIMSA 内的超材料单元数。

考虑发送已知确定性导频序列 $\mathbf s=[s_1,s_2,\ldots,s_L]^{T}\in\mathbb C^{L\times1}$ 的远场发射机，其中 $L$ 为导频长度，$s_l$（$l=1,2,\ldots,L$）为第 $l$ 个训练时刻发送的导频符号。导频序列归一化为 $\frac{1}{L}\sum_{l=1}^{L}|s_l|^{2}=1$。令 $P$ 表示每个导频符号的发射功率，则第 $l$ 个训练时刻实际发送的导频符号为 $\sqrt{P}s_l$。令 $\Theta=\{\theta_1,\ldots,\theta_K\}$ 表示 DoA 集合，其中 $\theta_k$（$k=1,2,\ldots,K$）表示第 $k$ 条传播路径的 DoA。令 $\mathbf y_l\in\mathbb C^{N_R\times1}$ 表示第 $l$ 个训练时刻的接收向量，则接收信号可表示为

$$
\mathbf y_l=\sqrt{P}\mathbf V^{H}\mathbf h s_l+\mathbf V^{H}\mathbf z_l=\sqrt{P}\mathbf V^{H}\mathbf A(\Theta)\boldsymbol\beta s_l+\widehat{\mathbf z}_l,\tag{7}
$$

其中 $\mathbf V\in\mathbb C^{N\times N_R}$ 表示 RIMSA 阵列的相移矩阵：

$$
\mathbf V=\begin{bmatrix}\mathbf v_1 & \mathbf 0_{N_E} & \cdots & \mathbf 0_{N_E}\\ \mathbf 0_{N_E} & \mathbf v_2 & \cdots & \mathbf 0_{N_E}\\ \vdots & \vdots & \ddots & \vdots\\ \mathbf 0_{N_E} & \mathbf 0_{N_E} & \cdots & \mathbf v_{N_R}\end{bmatrix},\tag{8}
$$

其中 $\mathbf v_{n_r}\in\mathbb C^{N_E\times1}$ 取式 (2) 的形式，每个 $\mathbf 0_{N_E}$ 表示维数 $N_E\times1$ 的零向量。$\mathbf z_l\in\mathbb C^{N\times1}$ 为第 $l$ 个训练时刻的加性白高斯噪声向量，$\widehat{\mathbf z}_l=\mathbf V^{H}\mathbf z_l$，$\mathbf z_l\sim\mathcal{CN}(\mathbf 0,\sigma_z^{2}\mathbf I_N)$。假设噪声向量在不同训练时刻相互独立。半酉性质 $\mathbf V^{H}\mathbf V=\mathbf I_{N_R}$ 保证 $\widehat{\mathbf z}_l\sim\mathcal{CN}(\mathbf 0,\sigma_z^{2}\mathbf I_{N_R})$。阵列流形矩阵为 $\mathbf A(\Theta)=[\mathbf a(\theta_1),\ldots,\mathbf a(\theta_K)]\in\mathbb C^{N\times K}$，其中 $\mathbf a(\theta_k)=[1,e^{-\mathrm j2\pi\frac{d}{\lambda}\sin\theta_k},\ldots,e^{-\mathrm j(N-1)2\pi\frac{d}{\lambda}\sin\theta_k}]^{T}$。把接收信号与已知导频序列相关并用 $\sqrt{P}$ 归一化，得

$$
\widetilde{\mathbf y}=\frac{1}{L\sqrt{P}}\sum_{l=1}^{L}\mathbf y_ls_l^{*}=\mathbf V^{H}\mathbf A(\Theta)\boldsymbol\beta+\widetilde{\mathbf z},\tag{9}
$$

其中等效噪声 $\widetilde{\mathbf z}=\frac{1}{L\sqrt{P}}\sum_{l=1}^{L}\widehat{\mathbf z}_ls_l^{*}$，且 $\widetilde{\mathbf z}\sim\mathcal{CN}\left(\mathbf 0,\frac{\sigma_z^{2}}{LP}\mathbf I_{N_R}\right)$。

## III. 问题公式化

稀疏角度域信道估计问题可重构为**多径分量分离与复增益恢复**的联合问题。由于阵列响应依赖方向余弦，令 $\psi\in(-\pi/2,\pi/2]$ 表示物理角，$\zeta=\sin(\psi)\in(-1,1]$ 表示其方向余弦。把 $\zeta$ 均匀离散为 $G$ 个网格点：具体地，第 $g$ 个（$g=1,2,\ldots,G$）方向余弦网格点为 $\zeta_g=-1+2g/G$，对应物理角为 $\psi_g=\arcsin(\zeta_g)$。所得过完备物理角网格定义为

$$
\Psi_G=\{\psi_g\mid g=1,2,\ldots,G\},\tag{10}
$$

其中 $G\gg K$ 控制方向余弦网格分辨率。式 (3) 中的信道向量 $\mathbf h$ 可用扩展虚拟信道模型 [42] 近似为

$$
\mathbf h\approx\mathbf A(\Psi_G)\boldsymbol\beta_G,\tag{11}
$$

其中 $\boldsymbol\beta_G=[\beta_1,\beta_2,\ldots,\beta_G]^{T}$，$\mathbf A(\Psi_G)=[\mathbf a(\psi_1),\ldots,\mathbf a(\psi_G)]\in\mathbb C^{N\times G}$。与 $\boldsymbol\beta$ 不同，$\boldsymbol\beta_G\in\mathbb C^{G\times1}$ 表示网格域系数向量，建模为**近似稀疏**，其 $K$ 个主导非零项给出路径方向与相应信道增益的估计。利用 (11) 的网格近似，接收观测可近似建模为

$$
\widetilde{\mathbf y}\approx\mathbf V^{H}\mathbf A(\Psi_G)\boldsymbol\beta_G+\widetilde{\mathbf z}.\tag{12}
$$

因此信道估计问题被表述为估计近似稀疏向量 $\boldsymbol\beta_G$。由于传播路径数 $K$ 假设已知，网格域系数向量通过求解如下 $\ell_0$ 范数约束最小二乘问题 [47] 估计：

$$
\min_{\boldsymbol\beta_G}\left\lVert\widetilde{\mathbf y}-\mathbf V^{H}\mathbf A(\Psi_G)\boldsymbol\beta_G\right\rVert_2^{2}\qquad\text{s.t. }\lVert\boldsymbol\beta_G\rVert_0\le K.\tag{13}
$$

这里残差同时计入等效接收噪声与有限角度表示造成的建模误差，约束把恢复表示限制为至多 $K$ 个主导分量。定义 $\boldsymbol\Gamma=\mathbf V^{H}\mathbf A(\Psi_G)\in\mathbb C^{N_R\times G}$ 为**测量矩阵**。

按照 CS 基本理论 [45]，基于**互相干性（MIP）**设计专用测量矩阵有助于提升恢复精度。MIP 条件主要关注测量矩阵的互相干性。测量矩阵的相干性 $\mu$ 定义为

$$
\mu(\boldsymbol\Gamma)=\max_{i\ne j}\frac{\left|\boldsymbol\Gamma_i^{H}\boldsymbol\Gamma_j\right|}{\lVert\boldsymbol\Gamma_i\rVert_2\lVert\boldsymbol\Gamma_j\rVert_2},\tag{14}
$$

其中 $\boldsymbol\Gamma_j$ 与 $\boldsymbol\Gamma_i$ 分别为矩阵 $\boldsymbol\Gamma$ 的第 $j$ 与第 $i$ 列。稀疏重构的一个充分条件由 [50] 给出：

$$
\mu(\boldsymbol\Gamma)<\frac{1}{2K-1}.\tag{15}
$$

Welch 界 [46] 给出 $\mu(\boldsymbol\Gamma)$ 的下界：

$$
\mu(\boldsymbol\Gamma)\ge\sqrt{\frac{G-N_R}{N_R(G-1)}},\tag{16}
$$

其中 $\boldsymbol\Gamma$ 的规模为 $N_R\times G$ 且 $G>N_R$。对固定 $N_R$，Welch 界随 $G$ 增大而增大。因此更大的 $G$ 改善方向余弦分辨率、减小网格量化误差，但同时抬高相干性下界，可能降低恢复性能 [48]。

第 IV 节将表明，通过对 RIMSA 响应的特定设计可降低 $\mu(\boldsymbol\Gamma)$ 的下界，从而获得更好的信道估计性能。

## IV. 所提 TSR 方法

本节提出一种基于 CS 理论的两阶段信道估计方法，可通过降低测量矩阵相干性下界来提升信道估计精度。具体地，本文先在所有 RIMSA 上采用相同相移向量，借助特定天线阵列流形降低测量矩阵的列维数；该过程引入 DoA 模糊并给出角度假设的候选集。第二阶段用稀疏恢复过程选择并细化与物理传播路径相关联的候选角；此外，本文为两个阶段优化 RIMSA 相移矩阵。

### A. 降低测量矩阵的相干性

注意到 (11) 中矩阵 $\mathbf A(\Psi_G)$ 可重排为

$$
\mathbf A(\Psi_G)=\begin{bmatrix}\mathbf A_1(\Psi_G)\\ \mathbf A_2(\Psi_G)\\ \vdots\\ \mathbf A_{N_R}(\Psi_G)\end{bmatrix},\tag{17}
$$

其中 $\mathbf A_{n_r}(\Psi_G)$（$n_r=1,\ldots,N_R$）为 $\mathbf A(\Psi_G)$ 的 $N_E\times G$ 子矩阵，表示第 $n_r$ 个 RIMSA 的阵列流形。鉴于相邻 RIMSA 间距为 $N_Ed$（每个 RIMSA 含 $N_E$ 个间距为 $d$ 的单元），相邻 RIMSA 在角度网格 $\psi_g$（$g=1,2,\ldots,G$）处的相位差定义为

$$
\omega(\psi_g)=2\pi\frac{N_Ed}{\lambda}\sin(\psi_g).\tag{18}
$$

对图 4 所示均匀线阵 RIMSA 结构，不难看出每个 RIMSA 的子阵列流形满足

$$
\mathbf A_{n_r}(\Psi_G)=\mathbf A_1(\Psi_G)\mathbf W_{n_r},\tag{19}
$$

其中 $\mathbf W_{n_r}=\operatorname{diag}\left(e^{-\mathrm j(n_r-1)\omega(\psi_1)},\ldots,e^{-\mathrm j(n_r-1)\omega(\psi_G)}\right)$，$n_r=1,2,\ldots,N_R$，即 $\mathbf W_1=\mathbf I_G$。

第一阶段中，所有 RIMSA 配置**相同相移向量**，记为 $\mathbf v_r$，即 $\mathbf v_r=\mathbf v_1=\cdots=\mathbf v_{N_R}$。相应地，第一阶段相移矩阵定义为 $\mathbf V_r=\operatorname{blkdiag}(\mathbf v_r,\mathbf v_r,\ldots,\mathbf v_r)$。在该配置下，(12) 中的测量模型简化为

$$
\widetilde{\mathbf y}\approx\mathbf V_r^{H}\mathbf A(\Psi_G)\boldsymbol\beta_G+\widetilde{\mathbf z}.\tag{20}
$$

把 (17) 与 (19) 代入 (20) 中的 $\mathbf A(\Psi_G)$ 得

$$
\mathbf V_r^{H}\mathbf A(\Psi_G)=\begin{bmatrix}\mathbf v_r^{H}\\ \mathbf v_r^{H}\\ \vdots\\ \mathbf v_r^{H}\end{bmatrix}\begin{bmatrix}\mathbf A_1(\Psi_G)\\ \mathbf A_2(\Psi_G)\\ \vdots\\ \mathbf A_{N_R}(\Psi_G)\end{bmatrix}=\begin{bmatrix}\mathbf v_r^{H}\mathbf A_1(\Psi_G)\mathbf W_1\\ \mathbf v_r^{H}\mathbf A_1(\Psi_G)\mathbf W_2\\ \vdots\\ \mathbf v_r^{H}\mathbf A_1(\Psi_G)\mathbf W_{N_R}\end{bmatrix}=\widetilde{\mathbf A}(\Psi_G)\mathbf U(\Psi_G),\tag{21}
$$

其中

$$
\widetilde{\mathbf A}(\Psi_G)=\begin{bmatrix}1 & \cdots & 1\\ e^{-\mathrm j\omega(\psi_1)} & \cdots & e^{-\mathrm j\omega(\psi_G)}\\ \vdots & \ddots & \vdots\\ e^{-\mathrm j(N_R-1)\omega(\psi_1)} & \cdots & e^{-\mathrm j(N_R-1)\omega(\psi_G)}\end{bmatrix}=\left[\widetilde{\mathbf a}(\omega(\psi_1)),\ldots,\widetilde{\mathbf a}(\omega(\psi_G))\right],\tag{22}
$$

其中 $\widetilde{\mathbf a}(\omega(\psi_g))=[1,e^{-\mathrm j\omega(\psi_g)},\ldots,e^{-\mathrm j(N_R-1)\omega(\psi_g)}]^{T}\in\mathbb C^{N_R\times1}$，且 $\mathbf U(\Psi_G)$ 为

$$
\mathbf U(\Psi_G)=\operatorname{diag}\left(u(\psi_1),\ldots,u(\psi_G)\right),\tag{23}
$$

其中 $u(\psi_g)=\mathbf v_r^{H}\mathbf a_1(\psi_g)$。矩阵 $\widetilde{\mathbf A}(\Psi_G)\in\mathbb C^{N_R\times G}$ 可视为 RIMSA 阵列在该特定相移向量下的**虚拟阵列流形**；$\mathbf U(\Psi_G)$ 表示 RIMSA 的响应。

因此 (20) 可重写为

$$
\widetilde{\mathbf y}\approx\widetilde{\mathbf A}(\Psi_G)\mathbf U(\Psi_G)\boldsymbol\beta_G+\widetilde{\mathbf z}.\tag{24}
$$

注意天线间相位 $\omega(\psi_g)$ 落在

$$
\omega(\psi_g)\in\left(-\frac{2N_Ed}{\lambda}\pi,\frac{2N_Ed}{\lambda}\pi\right],\tag{25}
$$

其区间长度为 $2\pi Q$，其中 $Q=2N_Ed/\lambda$。对 $d=\lambda/2$，$Q=N_E$。因此该周期映射引入 **$Q$ 重 DoA 估计模糊**，方向余弦网格 $\Psi_G$ 被划分为 $\widetilde G=G/Q$ 个混叠组。第 $\widetilde g$ 个（$\widetilde g=1,\ldots,\widetilde G$）混叠组中的网格点满足

$$
\zeta_{\widetilde g+m\widetilde G}=\zeta_{\widetilde g}+\frac{2m}{Q},\qquad m=0,\ldots,Q-1.\tag{26}
$$

回顾 $\zeta_g=\sin(\psi_g)$，(26) 意味着对应物理角的 RIMSA 间相位满足

$$
\omega(\psi_{\widetilde g+m\widetilde G})=\omega(\psi_{\widetilde g})+2\pi m.\tag{27}
$$

由于 $\widetilde{\mathbf a}(\omega)$ 具有 $2\pi$ 周期性，$\widetilde{\mathbf A}(\Psi_G)$ 中相应的 $Q$ 列为相同列。为简洁，第 $\widetilde g$ 组中的角度记为 $\Psi_{\widetilde g}=\{\psi_{\widetilde g,q}\mid q=1,\ldots,Q\}$，其中 $\psi_{\widetilde g,q}=\psi_{\widetilde g+(q-1)\widetilde G}$。

定义 $\widetilde\Theta=\{\vartheta_1,\vartheta_2,\ldots,\vartheta_{\widetilde G}\}$ 为这些组对应的相邻 RIMSA **主相位差集合**。这里 $\vartheta_{\widetilde g}\in(-\pi,\pi]$ 表示第 $\widetilde g$ 组对应的缠绕相位差，满足同余关系

$$
\omega(\psi_{\widetilde g,1})\equiv\cdots\equiv\omega(\psi_{\widetilde g,Q})\equiv\vartheta_{\widetilde g}\pmod{2\pi}.\tag{28}
$$

主相位 $\widetilde\Theta$ 与物理角 $\Psi_G$ 之间的映射关系为

$$
\Psi_{\widetilde g}=\left\{\arcsin\left(\frac{\lambda(\vartheta_{\widetilde g}+2\pi i)}{2\pi N_Ed}\right)\Bigg|-\frac{Q}{2}-\frac{\vartheta_{\widetilde g}}{2\pi}<i\le\frac{Q}{2}-\frac{\vartheta_{\widetilde g}}{2\pi}\right\}.\tag{29}
$$

相应地，在合并 $\widetilde{\mathbf A}(\Psi_G)$ 中与每个 $\Psi_{\widetilde g}$ 对应的 $Q$ 个相同列之后，式 (20) 可表示为

$$
\widetilde{\mathbf y}\approx\widetilde{\mathbf A}\left(\widetilde\Theta\right)\boldsymbol\beta_{\widetilde G}+\widetilde{\mathbf z},\tag{30}
$$

其中 $\widetilde{\mathbf A}(\widetilde\Theta)=[\widetilde{\mathbf a}(\vartheta_1),\ldots,\widetilde{\mathbf a}(\vartheta_{\widetilde G})]\in\mathbb C^{N_R\times\widetilde G}$，$\widetilde{\mathbf a}(\vartheta_{\widetilde g})=[1,e^{-\mathrm j\vartheta_{\widetilde g}},\ldots,e^{-\mathrm j(N_R-1)\vartheta_{\widetilde g}}]^{T}$。

在合并 $\widetilde{\mathbf A}(\Psi_G)$ 中的相同列之后，定义 $\boldsymbol\beta_{\widetilde G}$ 为按 $\Psi_G$ 的复衰减：$\boldsymbol\beta_{\widetilde G}=[\beta_{\widetilde 1},\beta_{\widetilde 2},\ldots,\beta_{\widetilde G}]^{T}$，可由下式计算：

$$
\beta_{\widetilde g}=\left[u(\psi_{\widetilde g,1}),u(\psi_{\widetilde g,2}),\ldots,u(\psi_{\widetilde g,Q})\right]\begin{bmatrix}\beta_{\widetilde g,1}\\ \beta_{\widetilde g,2}\\ \vdots\\ \beta_{\widetilde g,Q}\end{bmatrix},\tag{31}
$$

其中 $u(\psi_{\widetilde g,q})=\mathbf v_r^{H}\mathbf a_1(\psi_{\widetilde g,q})$，$\beta_{\widetilde g,q}$ 为与 $\psi_{\widetilde g,q}$ 关联的信道复衰减（$\widetilde g=1,2,\ldots,\widetilde G$，$q=1,2,\ldots,Q$）。

根据 (30) 中的缩减观测模型，第一阶段稀疏恢复问题 (13) 变为

$$
\min_{\boldsymbol\beta_{\widetilde G}}\left\lVert\widetilde{\mathbf y}-\widetilde{\boldsymbol\Gamma}\boldsymbol\beta_{\widetilde G}\right\rVert_2^{2}\qquad\text{s.t. }\lVert\boldsymbol\beta_{\widetilde G}\rVert_0\le K,\tag{32}
$$

其中测量矩阵现为 $\widetilde{\boldsymbol\Gamma}=\widetilde{\mathbf A}(\widetilde\Theta)\in\mathbb C^{N_R\times\widetilde G}$。[39] 中的 DGMP 算法被用作该 $\ell_0$ 范数约束问题的贪心近似求解器：它先识别一个粗原子，再局部细化相应主相位。因此细化后的相位估计不受限于预定义网格 $\widetilde\Theta$，有效缓解有限角度离散造成的基失配误差。与 (16) 中的 $\boldsymbol\Gamma$ 相比，测量矩阵 $\widetilde{\boldsymbol\Gamma}$ 的相干性下界现为

$$
\mu\left(\widetilde{\boldsymbol\Gamma}\right)\ge\sqrt{\frac{\widetilde G-N_R}{N_R\left(\widetilde G-1\right)}},\tag{33}
$$

小于 (16) 中 $\mu(\boldsymbol\Gamma)$ 的下界；在相同网格密度下这将改善稀疏信号重构性能。

简言之，本阶段利用 RIMSA 阵列流形可通过在所有 RIMSA 上使用相同相移向量的特殊设计加以合并的性质，降低测量矩阵的相干性，从而高精度求解 (32)。随后得到 $K$ 个主导分量及细化后的主相位估计 $\{\widehat\vartheta_k,k=1,2,\ldots,K\}$。值得注意的是，若多条物理路径折叠进同一混叠组，DGMP 仍会提取 $K$ 个分量，从而不可避免地把虚假相位估计引入输出集合；此外由于 DGMP 的局部网格细化，$\widehat\vartheta_k$ 不受限于原始粗网格 $\widetilde\Theta$。

然而本阶段也引入了**模糊角**。具体地，对每个细化主相位 $\widehat\vartheta_k$（$k=1,2,\ldots,K$），(29) 在 $(-\pi/2,\pi/2]$ 中给出 $Q$ 个对应物理角 $\psi_{k,q}$。当 $\widehat\vartheta_k$ 位于粗网格上时，这些角与 $\Psi_G$ 中相应点重合；经 DGMP 局部细化后一般处于离网格位置。它们构成候选集合 $\overline\Psi_{\overline G}=\{\psi_{k,q},k=1,\ldots,K,q=1,\ldots,Q\}$，预期包含与相应物理 DoA 足够接近的候选角。即使路径碰撞造成一些虚假 $\widehat\vartheta_k$ 与错误候选角，由正确 $\widehat\vartheta_k$ 导出的 $Q$ 个候选角仍包含折叠进该组的全部物理路径。因此候选集合 $\overline\Psi_{\overline G}$ 包含全部期望路径，使第二阶段稀疏恢复成为可能。下一阶段即从集合 $\overline\Psi_{\overline G}$ 的 $\overline G=QK$ 个角中细化 DoA。

在此之前，先详述本阶段 $\mathbf V_r$ 的构造。

### B. $\mathbf V_r$ 的设计

本小节考虑 $\mathbf V_r$ 的详细设计。在假设 $\mathbf v_r=\mathbf v_1=\cdots=\mathbf v_{N_R}$ 下，由 (20)、(21)，来自 $\theta_k$（$k=1,\ldots,K$）的第 $k$ 条物理路径所贡献的功率可写为

$$
P(\theta_k,\mathbf v_r)=\widetilde{\mathbf a}^{H}(\omega(\theta_k))\boldsymbol\beta_k^{H}u^{H}(\theta_k)u(\theta_k)\boldsymbol\beta_k\widetilde{\mathbf a}(\omega(\theta_k))
=\widetilde{\mathbf a}^{H}(\omega(\theta_k))\boldsymbol\beta_k^{H}\widetilde{\mathbf P}(\theta_k,\mathbf v_r)\boldsymbol\beta_k\widetilde{\mathbf a}(\omega(\theta_k)),\tag{34}
$$

其中对给定物理路径角 $\theta_k$，$\boldsymbol\beta_k$ 与 $\widetilde{\mathbf a}^{H}(\omega(\theta_k))$ 固定，$\widetilde{\mathbf P}(\theta_k,\mathbf v_r)=u^{H}(\theta_k)u(\theta_k)$。

由 (23)，对给定 $\theta_k$，$u(\theta_k)=\mathbf v_r^{H}\mathbf a_1(\theta_k)$ 由 $\mathbf v_r$ 决定。若 $\mathbf v_r^{H}\mathbf a_1(\theta_k)$ 很小，第 $k$ 条物理路径的接收功率会被大幅衰减，导致信道估计性能严重恶化。例如，图 5(a) 给出 $N_E=8$、$\mathbf v_r=\mathbf 1_{N_E}\in\mathbb C^{N_E\times1}$ 时 $(-\pi/2,\pi/2]$ 内的归一化 RIMSA 响应：归一化辐射方向图呈现多个零点（如图 5(a) 所示），用 $\theta_{\mathrm{zero},i}$ 表示第 $i$ 个零点；从 $\theta_{\mathrm{zero},i}$ 到达的信号经历近零接收功率，使角度恢复不可行。

为应对该问题，应设计相移向量 $\mathbf v_r$ 使其在感兴趣 DoA 范围（即小区扇区覆盖）内满足某约束。由于物理 DoA $\{\theta_k\}_{k=1}^{K}$ 在此离线设计中未知，本文用稠密设计集 $\Phi_M=\{\varphi_m\mid m=1,\ldots,M\}$ 离散化感兴趣 DoA 范围，该集合独立于 CS 网格 $\Psi_G$。该问题可建模为抑制天线响应、避免覆盖 DoA 范围内零点的优化问题：

$$
\min_{\gamma,\mathbf v_r}\ \sum_{m=1}^{M}\left|\mathbf a_1^{H}(\varphi_m)\mathbf v_r\mathbf v_r^{H}\mathbf a_1(\varphi_m)-\gamma P_m\right|^{2}\qquad\text{s.t. }|v_{r,n_e}|=1,\ n_e=1,\ldots,N_E,\tag{35}
$$

其中 $P_m$ 为 $\varphi_m$ 处的期望天线响应功率。由于 $\Phi_M$ 只采样感兴趣 DoA 范围，对全部 $m=1,\ldots,M$ 取 $P_m=1$，$\gamma$ 为实缩放因子。

(35) 中的优化变量为缩放因子 $\gamma$ 与相移向量 $\mathbf v_r$。对给定 $\mathbf v_r$，最优 $\gamma$ 可得闭式。令 $h(\gamma,\mathbf v_r)$ 表示 (35) 的目标函数；由于它关于实值变量 $\gamma$ 是二次的，其导数为

$$
\frac{\partial h(\gamma,\mathbf v_r)}{\partial\gamma}=-2\sum_{m=1}^{M}\left(\mathbf a_1^{H}(\varphi_m)\mathbf v_r\mathbf v_r^{H}\mathbf a_1(\varphi_m)\right)P_m+2\gamma\sum_{m=1}^{M}P_m^{2},\tag{36}
$$

由此得最优 $\gamma$：

$$
\gamma^{\star}=\sum_{m=1}^{M}\left(\mathbf a_1^{H}(\varphi_m)\mathbf v_r\mathbf v_r^{H}\mathbf a_1(\varphi_m)\right)P_m\Bigg/\sum_{m=1}^{M}P_m^{2}.\tag{37}
$$

在最优 $\gamma^{\star}$（它同样是 $\mathbf v_r$ 的二次函数）下，下一步求最优 $\mathbf v_r$。把 (37) 的 $\gamma^{\star}$ 代入 (35) 后，问题转化为最小化 $\mathbf v_r$ 的四阶多项式；$\mathbf v_r$ 的约束非凸，属非平凡问题。

注意 $v_{r,n_e}=e^{-\mathrm j\alpha_{r,n_e}}$，由 (1) 可把 $\mathbf v_r$ 写为 $\mathbf v_r(\boldsymbol\alpha)$，其中 $\boldsymbol\alpha=[\alpha_{r,1},\ldots,\alpha_{r,N_E}]^{T}$，故可取 $\boldsymbol\alpha$ 为优化变量。于是优化问题 (35) 可写为

$$
\min_{\boldsymbol\alpha}\ \sum_{m=1}^{M}\left|\mathbf a_1^{H}(\varphi_m)\mathbf v_r(\boldsymbol\alpha)\mathbf v_r^{H}(\boldsymbol\alpha)\mathbf a_1(\varphi_m)-\gamma^{\star}P_m\right|^{2}.\tag{38}
$$

为简化目标函数，把标量项改写为关于 $\mathbf v_r(\boldsymbol\alpha)$ 的二次型。具体地，第一项变为 $\mathbf v_r^{H}(\boldsymbol\alpha)\mathbf a_1(\varphi_m)\mathbf a_1^{H}(\varphi_m)\mathbf v_r(\boldsymbol\alpha)$；把 (37) 的 $\gamma^{\star}$ 代入第二项得

$$
\gamma^{\star}P_m=P_m\frac{\sum_{\ell=1}^{M}P_\ell\left(\mathbf v_r^{H}(\boldsymbol\alpha)\mathbf a_1(\varphi_\ell)\mathbf a_1^{H}(\varphi_\ell)\mathbf v_r(\boldsymbol\alpha)\right)}{\sum_{\ell=1}^{M}P_\ell^{2}}
=\mathbf v_r^{H}(\boldsymbol\alpha)\left[\frac{P_m\sum_{\ell=1}^{M}P_\ell\mathbf a_1(\varphi_\ell)\mathbf a_1^{H}(\varphi_\ell)}{\sum_{\ell=1}^{M}P_\ell^{2}}\right]\mathbf v_r(\boldsymbol\alpha).\tag{39}
$$

提取公共向量 $\mathbf v_r^{H}(\boldsymbol\alpha)$ 与 $\mathbf v_r(\boldsymbol\alpha)$，问题可进一步转化为

$$
\min_{\boldsymbol\alpha}\ \sum_{m=1}^{M}\left|\mathbf v_r^{H}(\boldsymbol\alpha)\mathbf B_m\mathbf v_r(\boldsymbol\alpha)\right|^{2},\tag{40}
$$

其中

$$
\mathbf B_m=\mathbf a_1(\varphi_m)\mathbf a_1^{H}(\varphi_m)-\frac{P_m\sum_{\ell=1}^{M}P_\ell\left(\mathbf a_1(\varphi_\ell)\mathbf a_1^{H}(\varphi_\ell)\right)}{\sum_{\ell=1}^{M}P_\ell^{2}}.
$$

优化问题 (40) 现为**无约束四阶三角多项式最小化问题**，可用有限内存 Broyden–Fletcher–Goldfarb–Shanno（L-BFGS）算法 [52] 求解；该算法是流行的拟牛顿算法，详见 [53]。与需要正定 Hessian 与精确二阶导数的 Newton 型方法不同，L-BFGS 通过梯度更新近似曲率信息，兼顾计算可行性与对非凸性的鲁棒性。

为实现 L-BFGS，需计算目标函数梯度并获得梯度变化量，以构造超线性收敛模型。为此先把 (40) 的目标函数写成矩阵形式：

$$
\min_{\boldsymbol\alpha}\ J(\boldsymbol\alpha),\tag{41}
$$

其中 $J(\boldsymbol\alpha)=\mathbf x^{H}(\boldsymbol\alpha)\mathbf B\mathbf x(\boldsymbol\alpha)$，$\mathbf x(\boldsymbol\alpha)=\operatorname{vec}\left(\mathbf v_r(\boldsymbol\alpha)\mathbf v_r^{H}(\boldsymbol\alpha)\right)$，$\mathbf b_m=\operatorname{vec}(\mathbf B_m)$，$\mathbf B=\sum_{m=1}^{M}\mathbf b_m\mathbf b_m^{H}$。这里 $\operatorname{vec}(\cdot)$ 通过堆叠列实现矩阵向量化。于是 $J(\boldsymbol\alpha)$ 的梯度可计算为

$$
\frac{\partial J(\boldsymbol\alpha)}{\partial\boldsymbol\alpha}=2\operatorname{Re}\left(\left[\frac{\partial\mathbf x(\boldsymbol\alpha)}{\partial\boldsymbol\alpha}\right]^{H}\mathbf B\mathbf x(\boldsymbol\alpha)\right),\tag{42}
$$

其中

$$
\frac{\partial\mathbf x(\boldsymbol\alpha)}{\partial\alpha_{r,n_e}}=\operatorname{vec}\left(\frac{\partial\mathbf v_r(\boldsymbol\alpha)}{\partial\alpha_{r,n_e}}\mathbf v_r^{H}(\boldsymbol\alpha)+\mathbf v_r(\boldsymbol\alpha)\frac{\partial\mathbf v_r^{H}(\boldsymbol\alpha)}{\partial\alpha_{r,n_e}}\right).\tag{43}
$$

详细的 L-BFGS 算法见算法 1。参数向量 $\boldsymbol\alpha$ 迭代更新直至目标函数 (41) 收敛，得到保证 RIMSA 响应鲁棒性的优化相移向量 $\mathbf v_r$。例如考虑含 $N_E=8$ 个超材料单元、感兴趣 DoA 范围为 $[-\frac{1}{3}\pi,\frac{1}{3}\pi]$（典型 120 度小区扇区覆盖）的 RIMSA 系统，求解 (35) 得到如图 5(b) 所示的归一化天线响应：在整个感兴趣 DoA 范围内不存在方向图零点，且 RIMSA 响应近似恒定。

**注记 1：** 相移向量 $\mathbf v_r$ 仅取决于在目标 DoA 范围内采样的设计角 $\{\varphi_m\}_{m=1}^{M}$，与任何信道实现无关。因此为降低计算复杂度，可离线预先优化一次 $\mathbf v_r$，该优化与接收信号无关。

**算法 1　优化 $\mathbf v_r$ 的 L-BFGS 算法**

```text
输入: 初始化 L-BFGS 更新次数 η; 选择初值 α_1 并按式 (41)、(42) 计算 J(α_1) 与 ∂J(α_1)/∂α_1
1: 置 p = 1, ∇J_1 = ∂J(α_1)/∂α_1, w_1 = −∇J_1
2: repeat
3:     按具体线搜索规则计算搜索步长 ρ_p
4:     计算 u_p = ρ_p w_p 与 α_{p+1} = α_p + ρ_p w_p
5:     计算 ∇J_{p+1} 与 d_p = ∇J_{p+1} − ∇J_p
6:     置 q = ∇J_{p+1}
7:     for i = p, p−1, ..., max(1, p−η+1) do
8:         t_i = u_i^H q / (d_i^H u_i), q = q − t_i d_i
9:     end for
10:    r = (u_p^H d_p / d_p^H d_p) q
11:    for i = max(1, p−η+1), p−η+2, ..., p do
12:        κ = d_i^H r / (d_i^H u_i), r = r + (t_i − κ) u_i
13:    end for
14:    w_{p+1} = −r, p = p + 1
15: until 满足收敛条件
```

### C. 从候选 DoA 集合中选取物理 DoA

根据第 IV-A 节讨论，已得到含 $\overline G$ 个候选 DoA 的 $\overline\Psi_{\overline G}$，其中含分别与 $K$ 个真实 DoA 足够接近的 $K$ 个候选 DoA。因此 (11) 中的原始信道模型可近似重构为

$$
\mathbf h\approx\mathbf A\left(\overline\Psi_{\overline G}\right)\overline{\boldsymbol\beta}_{\overline G},\tag{44}
$$

其中 $\mathbf A(\overline\Psi_{\overline G})\in\mathbb C^{N\times\overline G}$，$\overline{\boldsymbol\beta}_{\overline G}\in\mathbb C^{\overline G\times1}$ 建模为至多含 $K$ 个主导非零项的稀疏系数向量。该 $\overline{\boldsymbol\beta}_{\overline G}$ 可具体表示为

$$
\overline{\boldsymbol\beta}_{\overline G}=\left[\overline{\boldsymbol\beta}_1^{T},\ldots,\overline{\boldsymbol\beta}_K^{T}\right]^{T},\tag{45}
$$

其中 $\overline{\boldsymbol\beta}_k=[\beta_{k,1},\ldots,\beta_{k,Q}]^{T}\in\mathbb C^{Q\times1}$，$\beta_{k,q}$ 为与 $\psi_{k,q}$ 对应的复信道衰减（$k=1,\ldots,K$，$q=1,\ldots,Q$）。给定单元间距 $d=\lambda/2$，注意 $Q=N_E$、$\overline G=N_EK$。由于每个 RIMSA 配备众多超材料单元，所得导向矩阵 $\mathbf A(\overline\Psi_{\overline G})$ 一般列满秩。

第二阶段考虑如何从 $\overline{\boldsymbol\beta}_{\overline G}$ 与 $\overline\Psi_{\overline G}$ 中选取 $K$ 个最优信道衰减系数及对应角度。参数选择过程本质上等价于 $\overline{\boldsymbol\beta}_{\overline G}$ 的稀疏信号恢复。与第一阶段所有 RIMSA 采用相同相移向量以保持混叠结构不同，本阶段允许 RIMSA 使用**不同相移向量**，从而打破混叠模糊并区分候选物理 DoA。记第二阶段 RIMSA 相移矩阵为 $\mathbf V_f=\operatorname{blkdiag}(\mathbf v_{f,1},\mathbf v_{f,2},\ldots,\mathbf v_{f,N_R})$，并用其再次接收导频信号，其中 $\mathbf v_{f,n_r}$（$n_r=1,\ldots,N_R$）为第 $n_r$ 个超表面天线的相移向量，形式为 $\mathbf v_{f,n_r}=\frac{1}{\sqrt{N_E}}[v_{n_r,1},\ldots,v_{n_r,N_E}]^{T}$，且 $|v_{n_r,n_e}|=1$（$n_e=1,\ldots,N_E$）。

与 (7)、(9) 类似，接收导频信号可近似表示为

$$
\overline{\mathbf y}\approx\mathbf V_f^{H}\mathbf A\left(\overline\Psi_{\overline G}\right)\overline{\boldsymbol\beta}_{\overline G}+\overline{\mathbf z},\tag{46}
$$

于是信道估计问题转化为如下优化问题：

$$
\min_{\overline{\boldsymbol\beta}_{\overline G}}\left\lVert\overline{\mathbf y}-\overline{\boldsymbol\Gamma}\,\overline{\boldsymbol\beta}_{\overline G}\right\rVert_2^{2}\qquad\text{s.t. }\left\lVert\overline{\boldsymbol\beta}_{\overline G}\right\rVert_0\le K,\tag{47}
$$

其中 $\overline{\boldsymbol\Gamma}=\mathbf V_f^{H}\mathbf A(\overline\Psi_{\overline G})\in\mathbb C^{N_R\times\overline G}$ 为当前测量矩阵。该稀疏恢复问题可用 OMP 算法近似求解。

为进一步提升精度，可设计 $\mathbf V_f^{H}$ 以最小化当前相干性 $\mu(\overline{\boldsymbol\Gamma})$。基于 [49]、[50] 的分析，可通过如下优化问题设计具有最小相干性的测量矩阵：

$$
\min_{\mathbf V_f}\left\lVert\mathbf A^{H}\left(\overline\Psi_{\overline G}\right)\mathbf V_f\mathbf V_f^{H}\mathbf A\left(\overline\Psi_{\overline G}\right)-\mathbf I_{\overline G}\right\rVert_F^{2},\qquad
\text{s.t. }\mathbf V_f=\operatorname{blkdiag}(\mathbf v_{f,1},\mathbf v_{f,2},\ldots,\mathbf v_{f,N_R}),\ |v_{n_r,n_e}|=1.\tag{48}
$$

(48) 最小化测量矩阵各列内积平方和。相移矩阵须同时满足**恒模约束**与**块对角结构约束**，形成非凸问题。所幸该问题可用 **Riemannian 流形算法**求解，这一算法已在诸多工作中用于处理与移相器相关的一系列恒模约束（如 [51]）。该算法在由恒模限制定义的 Riemannian 流形空间中考虑优化问题，计算 Riemannian 梯度并沿该方向迭代更新；最后为满足恒模约束，把更新后的优化值**收缩（retraction）**回流形空间。

按 Riemannian 流形算法理论，需先计算 Riemannian 梯度。定义

$$
f=\left\lVert\mathbf A^{H}\left(\overline\Psi_{\overline G}\right)\mathbf V_f\mathbf V_f^{H}\mathbf A\left(\overline\Psi_{\overline G}\right)-\mathbf I_{\overline G}\right\rVert_F^{2},\tag{49}
$$

以及 Riemannian 流形空间

$$
\mathcal V=\left\{\mathbf V_f^{(i)}=\operatorname{blkdiag}\left(\mathbf v_{f,1}(i),\mathbf v_{f,2}(i),\ldots,\mathbf v_{f,N_R}(i)\right)\right\},\tag{50}
$$

其中 $\mathbf V_f^{(i)}$ 为第 $i$ 次迭代值。基于切空间概念，Riemannian 梯度可计算为传统欧氏梯度到 Riemannian 切空间的正交投影。记 $\operatorname{grad}_{\mathbf V_f^{(i)}}f$ 为 $\mathbf V_f^{(i)}$ 的 Riemannian 梯度，则

$$
\operatorname{grad}_{\mathbf V_f^{(i)}}f=\operatorname{Grad}_{\mathbf V_f^{(i)}}f-\operatorname{Re}\left\{\operatorname{Grad}_{\mathbf V_f^{(i)}}f\odot\left(\mathbf V_f^{(i)}\right)^{*}\right\}\odot\left(\mathbf V_f^{(i)}\right),\tag{51}
$$

其中 $\odot$ 为 Hadamard 积，$\operatorname{Re}\{\cdot\}$ 表示实部，欧氏梯度 $\operatorname{Grad}_{\mathbf V_f^{(i)}}f$ 可表示为

$$
\operatorname{Grad}_{\mathbf V_f^{(i)}}f=\nabla_{\mathbf V_f^{(i)}}f\odot\mathbf C,\tag{52}
$$

其中 $\mathbf C=\operatorname{blkdiag}(\mathbf 1_{N_E},\ldots,\mathbf 1_{N_E})\in\mathbb C^{N\times N_R}$ 为与 $\mathbf V_f^{(i)}$ 同结构的块对角矩阵，$\nabla_{\mathbf V_f^{(i)}}f$ 由下式给出：

$$
\nabla_{\mathbf V_f^{(i)}}f=4\mathbf A\left(\overline\Psi_{\overline G}\right)\left(\mathbf A^{H}\left(\overline\Psi_{\overline G}\right)\mathbf V_f\mathbf V_f^{H}\mathbf A\left(\overline\Psi_{\overline G}\right)-\mathbf I_{\overline G}\right)\mathbf A^{H}\left(\overline\Psi_{\overline G}\right)\mathbf V_f
=4\mathbf A\left(\overline\Psi_{\overline G}\right)\mathbf A^{H}\left(\overline\Psi_{\overline G}\right)\mathbf V_f\left(\mathbf V_f^{H}\mathbf A\left(\overline\Psi_{\overline G}\right)\mathbf A^{H}\left(\overline\Psi_{\overline G}\right)\mathbf V_f-\mathbf I_{N_R}\right).\tag{53}
$$

得到 Riemannian 梯度 $\operatorname{grad}_{\mathbf V_f^{(i)}}f$ 后，可用共轭梯度法在流形空间中迭代更新搜索方向 $\mathbf V_f^{(i+1)}$。完整算法见算法 2。

在优化后的 $\mathbf V_f$ 下，最小化测量矩阵 $\overline{\boldsymbol\Gamma}$ 的总相干性，从而在使用 OMP 等 CS 算法求解 (47) 时提升估计精度；(47) 的结果 $\overline{\boldsymbol\beta}_{\overline G}$ 给出信道估计 $\widehat{\mathbf h}=\mathbf A(\overline\Psi_{\overline G})\overline{\boldsymbol\beta}_{\overline G}$。整个 TSR 信道估计算法见算法 3。

**算法 2　优化 $\mathbf V_f$ 的 Riemannian 流形算法**

```text
输入: A(Ψ̄_Ḡ), 初始点 V_f^(0)
1: 置 i = 0 并计算 D_0 = −grad_{V_f^(0)} f
2: repeat
3:     按 [51] 获得 Armijo 回溯线搜索步长 τ_i
4:     由 V_f^(i+1) = exp(j∠(V_f^(i) + τ_i D_i)) ⊙ C 求新点
5:     计算向量转移因子 D_i^trans = D_i − Re{D_i ⊙ (V_f^(i+1))^*} ⊙ V_f^(i+1)
6:     计算 grad_{V_f^(i+1)} f，再按 [51] 得到 Polak-Ribière 参数 ξ_{i+1}
7:     计算 D_{i+1} = −grad_{V_f^(i+1)} f + ξ_{i+1} D_i^trans
8:     i = i + 1
9: until 满足收敛条件
```

**算法 3　用于信道估计的 TSR 方法**

```text
输入: 信号数 K
1: 按式 (41) 用算法 1 优化 v_r，并在假设 v_r = v_1 = … = v_{N_R} 下得到 V_r
2: 用 [39] 中的 DGMP 求解优化问题 (32)，得到集合 Θ̃_G̃
3: 用 (29) 得到 DoA 候选集 Ψ̄_Ḡ
4: 用算法 2 通过优化问题 (48) 设计 V_f
5: 求解优化问题 (47) 得到 β̄_Ḡ，估计信道为 ĥ = A(Ψ̄_Ḡ) β̄_Ḡ
```

**注记 2：** 由 (15)、(16) 可见，若希望准确恢复 $\overline{\boldsymbol\beta}_{\overline G}$，$\overline{\boldsymbol\Gamma}$ 需满足若干条件。对 $d=\lambda/2$，$Q=N_E$、$\overline G=N_EK$。由 (16)，$\mu(\overline{\boldsymbol\Gamma})$ 的下界为

$$
\mu\left(\overline{\boldsymbol\Gamma}\right)\ge\sqrt{\frac{N_EK-N_R}{N_R\left(N_EK-1\right)}}.\tag{54}
$$

(54) 的一个必要条件是 $N_EK>N_R$。若不满足，$\overline{\boldsymbol\Gamma}$ 列满秩，此时可在 (46) 左乘 $\overline{\boldsymbol\Gamma}$ 的伪逆得到 $\overline{\boldsymbol\beta}_{\overline G}$。对 $N_EK>N_R$，基于 [46] 的分析，保证 $\overline{\boldsymbol\beta}_{\overline G}$ 恢复的另一必要条件是

$$
\frac{1}{2K-1}>\sqrt{\frac{N_EK-N_R}{N_R\left(N_EK-1\right)}},\tag{55}
$$

它转化为不等式

$$
N_E\left[(2K-1)^{2}-N_R\right]<4N_R(K-1).\tag{56}
$$

若 $(2K-1)^{2}-N_R\le0$，则对 $N_E$ 的数量没有限制；相反，若 $(2K-1)^{2}-N_R>0$，则 $N_E$ 的取值须满足 (56) 以保证 $\overline{\boldsymbol\beta}_{\overline G}$ 的唯一恢复。

## V. 计算复杂度与可行性分析

### A. 计算复杂度

所提 TSR 方法的计算复杂度由**离线相移设计**与**在线两阶段稀疏恢复**构成。

首先，公共相移向量 $\mathbf v_r$ 离线优化，因为它只依赖阵列几何与规定的角度扇区。在 L-BFGS 实现中，构造矩阵 $\mathbf B=\sum_{m=1}^{M}\mathbf b_m\mathbf b_m^{H}$ 需 $\mathcal O(MN_E^{4})$ 次乘法，每次梯度评估需 $\mathcal O(N_E^{4})$ 次乘法。因此经过 $I_r$ 次 L-BFGS 迭代，离线复杂度为 $\mathcal O((M+I_r)N_E^{4})$，不构成实时信道估计开销。

在线第一阶段，所有 RIMSA 上的相同相位响应把原始规模为 $G$ 的角度字典折叠为规模 $\widetilde G=G/Q$ 的缩减字典。注意 $d=\lambda/2$ 时 $Q=N_E$。因此基于 DGMP 的主相位估计的主导复杂度为 $\mathcal O(KN_R\widetilde G)$，另加局部细化代价 $\mathcal O(KR_cN_RJ_{\mathrm{loc}})$，其中 $R_c$ 为细化轮数、$J_{\mathrm{loc}}$ 为每轮考察的局部网格点数。这显著低于在原始角度网格上直接搜索所需的 $\mathcal O(KN_RG)$ 复杂度。

在线第二阶段，每个估计主相位产生 $Q=N_E$ 个候选 DoA，形成规模 $\overline G=KN_E$ 的候选集。构造有效候选测量矩阵时利用了模拟合并矩阵 $\mathbf V_f=\operatorname{blkdiag}(\mathbf v_{f,1},\ldots,\mathbf v_{f,N_R})$ 的块对角结构，把代价从稠密矩阵乘降低为 $\mathcal O(N\overline G)$。每次流形迭代的主导代价来自目标函数及其梯度的评估：先计算 $\mathbf B_f=\mathbf V_f^{H}\mathbf A(\overline\Psi_{\overline G})$ 再计算 $\mathbf B_f^{H}\mathbf B_f$，每次迭代代价为 $\mathcal O(N\overline G+N_R\overline G^{2})$，其中省略了收缩与停止准则检查等低阶操作。经 $I_f$ 次流形迭代，相应复杂度为 $\mathcal O(I_f(N\overline G+N_R\overline G^{2}))$。最后在缩减候选集上的 OMP 恢复需要 $\mathcal O(KN_R\overline G+N_RK^{2}+K^{3})$ 次乘法，其主导项为 $\mathcal O(KN_R\overline G)$。由于 $\overline G=KN_E$，第二阶段稀疏恢复在比原始网格小得多的候选集上进行。

为给出更直观的概览，所提 TSR 方法的计算复杂度汇总于表 I。

**表 I：所提 TSR 方法的计算复杂度。**

| 阶段 | 计算复杂度 |
|---|---|
| 离线相移设计 | $\mathcal O((M+I_r)N_E^{4})$ |
| 在线阶段 1（DGMP） | $\mathcal O(KN_R\widetilde G+KR_cN_RJ_{\mathrm{loc}})$ |
| 在线阶段 2（流形与 OMP） | $\mathcal O(I_f(N\overline G+N_R\overline G^{2})+KN_R\overline G+N_RK^{2}+K^{3})$ |
| **在线总复杂度** | $\mathcal O(KN_R(\widetilde G+\overline G)+KR_cN_RJ_{\mathrm{loc}}+I_f(N\overline G+N_R\overline G^{2})+N_RK^{2}+K^{3})$ |

### B. 可行性

从实际部署角度看，计算负担因系统架构而显著减轻。首先，$\mathbf v_r$ 的优化仅依赖阵列几何与扇区覆盖需求、与 CSI 无关；因此优化后的相移向量可离线预计算并存储用于实时运行，不产生在线优化时延。对在线阶段，所提 TSR 方法具有较高可行性：第一阶段中 RIMSA 的特定设计把有效字典规模从 $G$ 降为 $\widetilde G=G/N_E$，相比在全 $G$ 上搜索的传统基于网格的 CS 方法大幅降低搜索复杂度；尽管第二阶段涉及流形优化，它作用在由第一阶段导出的缩减参数集 $\overline\Psi_{\overline G}$ 上。对仿真所用参数 $N=64$、$N_R=8$，(53) 中 $64\times8$ 的矩阵维数很小，只涉及标准矩阵—向量乘法，在现代数字信号处理器上高度可并行化。因此所提方法在估计精度与运行时延之间取得有利权衡。

## VI. 仿真结果

为数值评估所提方法并展示其相对现有方法的优越性，本节给出仿真结果。仿真中多条传播路径的衰落系数 $\beta_k$ 采用等功率分配。以**归一化均方误差（NMSE）**作为信道估计性能指标，定义为

$$
\mathrm{NMSE}=\frac{1}{N_{\mathrm{MC}}}\sum_{n=1}^{N_{\mathrm{MC}}}\frac{\left\lVert\widehat{\mathbf h}_n-\mathbf h_n\right\rVert_2^{2}}{\lVert\mathbf h_n\rVert_2^{2}},\tag{57}
$$

其中 $N_{\mathrm{MC}}$ 为 Monte Carlo 仿真总次数，$\mathbf h_n$ 为第 $n$ 次试验的真实信道，$\widehat{\mathbf h}_n$ 为估计信道。信噪比（SNR）定义为 $P/\sigma_z^{2}$，其中 $P$ 为单个导频符号的发射功率。感兴趣区域设为 $[-\pi/3,\pi/3]$，$\mathbf v_r$ 用 (35) 离线优化。

首先考察超表面天线响应对信道估计性能的影响。图 6 给出单路径信道估计的 NMSE 随入射信号方向的变化（$N=64$、$N_R=8$、SNR $=0$ dB），比较两种情形：(1) 使用相同相移向量 $\mathbf v_r=\mathbf 1_{N_E}$；(2) 用 (35) 优化 $\mathbf v_r$；两者的归一化 RIMSA 辐射方向图分别见图 5(a) 与 5(b)。可以看到 $\mathbf v_r=\mathbf 1_{N_E}$ 情形下 NMSE 出现多个峰，主要因为 RIMSA 方向图在特定角度存在零点，使接收信号功率急剧下降。这些结果验证了建立超表面天线响应与信道估计精度直接联系的理论分析：具体地，更大的天线响应幅度对应更低的 NMSE，因为增强的辐射效率提高了 RIMSA 阵列的有效接收 SNR。

随后用单条随机路径分析第一阶段的敏感性，以验证所提顺序估计方法的可靠性。由于 TSR 方法依赖第一阶段产生的候选 DoA 集合，第一阶段设计旨在为全部物理传播路径保留足够准确的候选。为全面展示该机制，图 7 在 $N_E=8$ 下画出角度 NMSE（左轴）与**包含概率** $P_{\mathrm{contain}}$（右轴）随 SNR 变化的曲线（$N_R$ 取不同值）。此处应用理想消歧以评估候选角精度。若最近候选角位于真实 DoA 在方向余弦域中半个网格间隔内，即 $\min_{\psi\in\overline\Psi_{\overline G}}|\sin\theta-\sin\psi|<1/G$，则认为包含成功。左轴显示角度 NMSE 随 $N_R$ 与 SNR 提高而稳步下降，证实初始候选角的数值精度；右轴进一步表明在所评估 SNR 范围内 $P_{\mathrm{contain}}$ 在 Monte Carlo 仿真中始终保持 100%。这为第一阶段候选集对物理传播路径具有高包含概率提供了经验证据。该鲁棒性源于第一阶段测量矩阵列维数的降低，如 (33) 所推导，其互相干性低于传统基于 CS 的方法。降低的相干性显著缓解基失配效应，为后续细化阶段提供高度可靠的候选子空间。

在第二阶段假定第一阶段提供准确候选集的前提下，图 8 在同一仿真设置下给出不同 $N_R$ 的 NMSE 随 SNR 变化。可以看到估计精度随 $N_R$ 增大而逐步提升，这一趋势由额外 RIMSA 天线扩展阵列孔径、增强接收信号有效观测维数所驱动；同时第一阶段降低测量矩阵相干性的设计为第二阶段细化提供了更好的起点。

接着考察所提 TSR 方法的导频开销效率。图 9 在固定 $N_E=4$、$N_R=16$ 下给出不同传播路径数 $K$ 时 NMSE 随导频长度 $L$ 的变化。结果表明估计精度随 $L$ 增大而持续提升，主要归因于更长导频序列带来的有效观测质量提升——它通过相干平均减轻噪声影响，从而促进后续稀疏恢复。相反，对固定 $L$，NMSE 随 $K$ 增大而退化；这与 CS 理论一致，因为更大的 $K$ 使角度域信道稀疏性下降，在相同导频开销下增加稀疏恢复难度。值得注意的是，所提 TSR 方法即使在相对较短的导频长度下也保持令人满意的估计精度，展现出显著降低导频开销的稳健能力。

为进一步验证所提 TSR 方法对稀疏性变化的鲁棒性，图 10 在固定 $N_E=4$、$N_R=16$ 下比较不同传播路径数 $K$ 时 NMSE 随 SNR 的变化。可以看到 $K=1$ 时估计性能最好，随 $K$ 增大逐渐退化；这与 CS 理论一致——角度稀疏性下降与潜在路径重叠使信号恢复更复杂。尽管如此，TSR 方法在更密集的多径场景（如 $K=3,4$）下仍保持可接受的估计精度。此外为评估更真实环境中的鲁棒性，本文还考虑**成簇信道模型**，其中 $K=4$ 个散射簇各自贡献一条可分辨路径 [44]，路径增益建模为独立 Rayleigh 衰落变量，即 $\beta_k\sim\mathcal{CN}(0,1/K)$，以保持归一化的平均信道功率。如图 10 所示，尽管 Rayleigh 衰落引入了额外随机性，所提方法在高 SNR 下仍取得很高的估计精度，展示了其在复杂多径场景中的实际可靠性。

图 11 给出混合 MIMO 架构下不同信道估计方法的性能。RIMSA 阵列配备 8 个超表面天线、每个 RIMSA 含 8 个单元，共 64 个超材料单元；仿真多径信道设 $K=2$。优化问题 (32) 用 DGMP 求解，(47) 用 OMP 算法求解。作为比较，本文给出直接用 DGMP 求解优化问题 (13) 的估计性能；此外为保证相对公平，还用流形算法优化 (13) 中测量矩阵 $\boldsymbol\Gamma=\mathbf V^{H}\mathbf A(\Psi_G)$ 的 $\mathbf V$，从而保证问题 (13) 的解更准确。另外还给出 [43] 中 IR 方法与 [44] 中多分辨率方法的估计性能。结果表明 TSR 方法优于这些方法，原因在于其最小化的测量矩阵相干性显著提升了估计性能。

此外，图 12 在超材料单元总数固定为 $N=64$ 的情况下给出信道估计性能随超表面天线数的变化。对 $K=2$、SNR $=0$ dB 的多径信道模型，估计精度随超表面天线数增加而逐步提升，这是因为观测序列的维数随超表面天线数增加。结果表明当超表面天线数少于超材料单元总数时，所提两阶段方法的估计精度显著高于直接信道估计技术；该性能增益主要归因于第一阶段的特定设计——测量矩阵列维数从 $G$ 降为 $\widetilde G=G/Q$。同时全部曲线最终收敛到同一最小 NMSE 点：当 $N_R=N$ 时混合模拟—数字接收机架构演化为全数字结构，此时可直接获取全部空间测量，消除不同混合 MIMO 方法之间的性能差距。

## VII. 结论

本文基于 CS 理论提出一种两阶段细化信道估计方法。第一阶段在所有 RIMSA 上采用相同相移向量以降低有效字典维数与测量矩阵的互相干性；同时优化公共相移向量以避免感兴趣扇区内的方向图零点，随后得到带 DoA 模糊的候选 DoA 集合。第二阶段进一步优化每个超材料单元的相位响应以消除 DoA 模糊，并细化 DoA 与信道系数估计。仿真结果证实所提 TSR 方法的估计精度显著优于现有方法；此外结果验证了该方法通过相位优化消除方向图零点、以及在硬件受限与多径场景下保持高精度的鲁棒性，展示了其在高效大规模 MIMO 系统中的潜力。未来工作方面，作者计划研究实际实现中密集排列超材料单元之间**互耦**的影响；此外，发展不依赖信道稀疏度先验知识的**自适应稀疏恢复**方法仍是重要的研究方向。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 53 条，源文 pp. 14–15）。

[1] F. Boccardi, R. W. Heath Jr., A. Lozano, T. L. Marzetta, and P. Popovski, "Five disruptive technology directions for 5G," IEEE Commun. Mag., vol. 52, no. 2, pp. 74–80, Feb. 2014.

[2] E. D. Carvalho, A. Ali, A. Amiri, M. Angjelichinoski, and R. W. Heath Jr., "Non-stationarities in extra-large-scale massive MIMO," IEEE Wireless Commun., vol. 27, no. 4, pp. 74–80, Aug. 2020.

[3] J. Mo, A. Alkhateeb, S. Abu-Surra, and R. W. Heath, "Hybrid architectures with few-bit ADC receivers: Achievable rates and energy-rate tradeoffs," IEEE Trans. Wireless Commun., vol. 16, no. 4, pp. 2274–2287, Apr. 2017.

[4] Q. Wu and R. Zhang, "Towards smart and reconfigurable environment: Intelligent reflecting surface aided wireless network," IEEE Commun. Mag., vol. 58, no. 1, pp. 106–112, Jan. 2020.

[5] M. Di Renzo et al., "Smart radio environments empowered by reconfigurable intelligent surfaces: How it works, state of research, and the road ahead," IEEE J. Sel. Areas Commun., vol. 38, no. 11, pp. 2450–2525, Nov. 2020.

[6] Q. Wu and R. Zhang, "Intelligent reflecting surface enhanced wireless network via joint active and passive beamforming," IEEE Trans. Wireless Commun., vol. 18, no. 11, pp. 5394–5409, Nov. 2019.

[7] Q. Wu and R. Zhang, "Joint active and passive beamforming optimization for intelligent reflecting surface assisted SWIPT under QoS constraints," IEEE J. Sel. Areas Commun., vol. 38, no. 8, pp. 1735–1748, Aug. 2020.

[8] B. Zheng, C. You, W. Mei, and R. Zhang, "A survey on channel estimation and practical passive beamforming design for intelligent reflecting surface aided wireless communications," IEEE Commun. Surveys Tuts., vol. 24, no. 2, pp. 1035–1071, 2nd Quart., 2022.

[9] S. Zhang and R. Zhang, "Capacity characterization for intelligent reflecting surface aided MIMO communication," IEEE J. Sel. Areas Commun., vol. 38, no. 8, pp. 1823–1838, Aug. 2020.

[10] T. Van Chien, L. T. Tu, S. Chatzinotas, and B. Ottersten, "Coverage probability and ergodic capacity of intelligent reflecting surface enhanced communication systems," IEEE Commun. Lett., vol. 25, no. 1, pp. 69–73, Jan. 2021.

[11] G. Zhou, C. Pan, H. Ren, K. Wang, M. Di Renzo, and A. Nallanathan, "Robust beamforming design for intelligent reflecting surface aided MISO communication systems," IEEE Wireless Commun. Lett., vol. 9, no. 10, pp. 1658–1662, Oct. 2020.

[12] C. Huang, A. Zappone, G. C. Alexandropoulos, M. Debbah, and C. Yuen, "Reconfigurable intelligent surfaces for energy efficiency in wireless communication," IEEE Trans. Wireless Commun., vol. 18, no. 8, pp. 4157–4170, Aug. 2019.

[13] J. Liu and H. Zhang, "Height-fixed UAV enabled energy-efficient data collection in RIS-aided wireless sensor networks," IEEE Trans. Wireless Commun., vol. 22, no. 11, pp. 7452–7463, Nov. 2023.

[14] L. Dong and H.-M. Wang, "Secure MIMO transmission via intelligent reflecting surface," IEEE Wireless Commun. Lett., vol. 9, no. 6, pp. 787–790, June 2020.

[15] L. Dong and H.-M. Wang, "Enhancing secure MIMO transmission via intelligent reflecting surface," IEEE Trans. Wireless Commun., vol. 19, no. 11, pp. 7543–7556, Nov. 2020.

[16] W. Wang, W. Ni, and H. Tian, "Multi-functional RIS-aided wireless communications," IEEE Internet Things J., vol. 10, no. 23, pp. 21133–21134, Dec. 2023.

[17] L. Dong, H.-M. Wang, and J. Bai, "Active reconfigurable intelligent surface aided secure transmission," IEEE Trans. Veh. Technol., vol. 71, no. 2, pp. 2181–2186, Feb. 2022.

[18] R. Long, Y.-C. Liang, Y. Pei, and E. G. Larsson, "Active reconfigurable intelligent surface-aided wireless communications," IEEE Trans. Wireless Commun., vol. 20, no. 8, pp. 4962–4975, Aug. 2021.

[19] F. Shu et al., "Three high-rate beamforming methods for active IRS-aided wireless network," IEEE Trans. Veh. Technol., vol. 72, no. 11, pp. 15052–15056, Nov. 2023.

[20] N. Shlezinger, O. Dicker, Y. C. Eldar, I. Yoo, M. F. Imani, and D. R. Smith, "Dynamic metasurface antennas for uplink massive MIMO systems," IEEE Trans. Commun., vol. 67, no. 10, pp. 6829–6843, Oct. 2019.

[21] H. Wang et al., "Dynamic metasurface antennas based downlink massive MIMO systems," in Proc. IEEE 20th Int. Workshop Signal Process. Adv. Wireless Commun. (SPAWC), Cannes, France, July 2019, pp. 1–5.

[22] R. Deng et al., "Reconfigurable holographic surfaces for future wireless communications," IEEE Wireless Commun., vol. 28, no. 6, pp. 126–131, Dec. 2021.

[23] H.-M. Wang, S. Zhang, and L. Wang, "RIMSA: Reconfigurable intelligent metasurface antenna for 6G communications and sensing," IEEE Wireless Commun., 2026, early access, doi:10.1109/MWC.2026.3690101.

[24] Y. Huang, H.-M. Wang, Q. Yan and Z. Wang, "LLM-RIMSA: Large language models driven reconfigurable intelligent metasurface antenna systems," IEEE J. Sel. Areas Commun., vol. 44, pp. 2479–2493, 2026.

[25] X. Wei and H.-M. Wang, "Multi-user downlink with reconfigurable intelligent metasurface antennas (RIMSA) array," IEEE Trans. Veh. Technol., vol. 74, no. 12, pp. 18914–18929, Dec. 2025.

[26] J. Bai, H.-M. Wang and L. Jin, "Dynamic agile reconfigurable intelligent surface antenna (DARISA) MIMO: DoF analysis and effective DoF optimization," IEEE Trans. Wireless Commun., vol. 25, pp. 2197–2212, 2026.

[27] X. Yu, J.-C. Shen, J. Zhang, and K. B. Letaief, "Alternating minimization algorithms for hybrid precoding in millimeter wave MIMO systems," IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 485–500, Apr. 2016.

[28] H. Khaleghi and A. Haskou, "Optimized channel estimation strategies for RIS-aided communication," IEEE Commun. Lett., vol. 29, no. 3, pp. 453–456, Mar. 2025.

[29] D. William Marques Guerra, T. Abrão and E. Hossain, "Channel estimation in RIS-aided mmWave wireless systems using matching pursuit with phase rotation," IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13187–13201, Oct. 2024.

[30] O. T. Demir, E. Bjornson, and L. Sanguinetti, "Channel modeling and channel estimation for holographic massive MIMO with planar arrays," IEEE Wireless Commun. Lett., vol. 11, no. 5, pp. 997–1001, May 2022.

[31] A. Tang, S. Song, C.-Y. Tsui, R. C. de Lamare and M. Debbah, "Channel estimation for holographic MIMO systems with mutual coupling awareness," in Proc. IEEE Int. Conf. Acoust., Speech Signal Process. (ICASSP), Barcelona, Spain, 2026, pp. 21952–21956.

[32] M. Rezvani and R. Adve, "Channel estimation for dynamic metasurface antennas," IEEE Trans. Wireless Commun., vol. 23, no. 6, pp. 5832–5846, June 2024.

[33] R. Zhang et al., "Tensor-based channel estimation for extremely large-scale MIMO-OFDM with dynamic metasurface antennas," IEEE Trans. Wireless Commun., vol. 24, no. 7, pp. 6052–6068, July 2025.

[34] M. Ghermezcheshmeh and N. Zlatanov, "Parametric channel estimation for LoS dominated holographic massive MIMO systems," IEEE Access, vol. 11, pp. 44711–44724, 2023.

[35] S. Chen, B. Sima, F. Xi, W. Wu, and Z. Liu, "Super-resolution DOA estimation using dynamic metasurface antenna," in Proc. 14th Eur. Conf. Antennas Propag. (EuCAP), Copenhagen, Denmark, Mar. 2020, pp. 1–4.

[36] J. Lee, G.-T. Gil, and Y. H. Lee, "Channel estimation via orthogonal matching pursuit for hybrid MIMO systems in millimeter wave communications," IEEE Trans. Commun., vol. 64, no. 6, pp. 2370–2386, June 2016.

[37] X. Ge et al., "Training beam design for channel estimation in hybrid mmWave MIMO systems," IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 7121–7134, Sept. 2022.

[38] J. Mirzaei, S. ShahbazPanahi, F. Sohrabi and R. Adve, "Hybrid analog and digital beamforming design for channel estimation in correlated massive MIMO systems," IEEE Trans. Signal Process., vol. 69, pp. 5784–5800, 2021.

[39] Z. Gao et al., "Channel estimation for millimeter-wave massive MIMO with hybrid precoding over frequency-selective fading channels," IEEE Commun. Lett., vol. 20, no. 6, pp. 1259–1262, June 2016.

[40] W. Chen, Y. Han, S. Jin, and H. Sun, "Efficient multiband channel reconstruction and tracking for hybrid mmWave MIMO systems," IEEE Trans. Commun., vol. 69, no. 12, pp. 8501–8517, Dec. 2021.

[41] B. Qi, W. Wang and B. Wang, "Off-grid compressive channel estimation for mm-Wave massive MIMO with hybrid precoding," IEEE Commun. Lett., vol. 23, no. 1, pp. 108–111, Jan. 2019.

[42] J. Rodríguez-Fernández, N. González-Prelcic, K. Venugopal, and R. W. Heath, "Frequency-domain compressive channel estimation for frequency-selective hybrid millimeter wave MIMO systems," IEEE Trans. Wireless Commun., vol. 17, no. 5, pp. 2946–2960, May 2018.

[43] C. Hu, L. Dai, T. Mir, Z. Gao, and J. Fang, "Super-resolution channel estimation for mmWave massive MIMO with hybrid precoding," IEEE Trans. Veh. Technol., vol. 67, no. 9, pp. 8954–8958, Sept. 2018.

[44] A. Alkhateeb, O. El Ayach, G. Leus, and R. W. Heath, "Channel estimation and hybrid precoding for millimeter wave cellular systems," IEEE J. Sel. Topics Signal Process., vol. 8, no. 5, pp. 831–846, Oct. 2014.

[45] L. Zelnik-Manor, K. Rosenblum, and Y. C. Eldar, "Sensing matrix optimization for block-sparse decoding," IEEE Trans. Signal Process., vol. 59, no. 9, pp. 4300–4312, Sept. 2011.

[46] L. R. Welch, "Lower bounds on the maximum cross correlation of signals (Corresp.)," IEEE Trans. Inf. Theory, vol. IT-20, no. 3, pp. 397–399, May 1974.

[47] S. Foucart and H. Rauhut, A Mathematical Introduction to Compressive Sensing. New York, NY, USA: Birkhäuser, 2013.

[48] E. J. Candes and T. Tao, "Decoding by linear programming," IEEE Trans. Inf. Theory, vol. 51, no. 12, pp. 4203–4215, Dec. 2005.

[49] J. M. Duarte-Carvajalino and G. Sapiro, "Learning to sense sparse signals: Simultaneous sensing matrix and sparsifying dictionary optimization," IEEE Trans. Image Process., vol. 18, no. 7, pp. 1395–1408, Jul. 2009.

[50] J. Tropp, "Greed is good: Algorithmic results for sparse approximation," IEEE Trans. Inf. Theory, vol. 50, no. 10, pp. 2231–2242, Oct. 2004.

[51] H.-M. Wang, J. Bai, and L. Dong, "Intelligent reflecting surfaces assisted secure transmission without eavesdropper's CSI," IEEE Signal Process. Lett., vol. 27, pp. 1300–1304, 2020.

[52] Y. Wang, X. Wang, H. Liu, and Z. Luo, "On the design of constant modulus probing signals for MIMO radar," IEEE Trans. Signal Process., vol. 60, no. 8, pp. 4432–4438, Aug. 2012.

[53] J. Nocedal and S. J. Wright, "Quasi-Newton Methods," in Numerical Optimization, 2nd ed. New York, NY, USA: Springer, 2006, pp. 135–163.

## 图注与表注

**图 1：** (a) 反射式超表面；(b) 用作接收天线的可重构超表面。

**图 2：RIMSA 架构。** 含变容二极管、短截线、传输线、相位控制电路、并联馈电网路、馈电端口、RF 链、数字处理器、RIMSA 控制器、控制链路与超材料单元。

**图 3：含 $N_{Ry}N_{Rx}$ 个天线（RF 链）与共 $N_xN_y$ 个超材料单元的平面 RIMSA 阵列**，其中每个 RIMSA 也是含 $N_{Ex}N_{Ey}$ 个单元的平面天线；图中另示数字信号处理、RIMSA 控制器与配置、信道估计、数字波束赋形器、解调与译码模块及 AGC/ADC 等 RF 链组件。

**图 4：含 $N_R$ 个天线、每个天线 $N_E$ 个单元的一维 RIMSA 阵列**（含 RF 链、数字处理器与加法合并结构）。

**图 5：** (a) $\mathbf v_r=\mathbf 1$ 时 RIMSA 的归一化超表面天线响应；(b) 通过 (35) 优化 $\mathbf v_r$ 后 RIMSA 的归一化超表面天线响应。

**图 6：不同 $\mathbf v_r$ 下 NMSE 随入射信号方向的变化。**

**图 7：不同超表面天线数 $N_R$ 下第一阶段角度 NMSE 与包含概率随 SNR 的变化。**

**图 8：不同超表面天线数 $N_R$ 下 NMSE 随 SNR 的变化。**

**图 9：不同传播路径数 $K$ 下 NMSE 随导频长度 $L$ 的变化。**

**图 10：不同传播路径数 $K$ 下 NMSE 随 SNR 的变化。**

**图 11：不同混合 MIMO 方法下 NMSE 随 SNR 的变化。**

**图 12：$N=64$ 时 NMSE 随 RF 链数的变化。**

**表注：** 表 I 汇总所提 TSR 方法的计算复杂度，按离线相移设计、在线阶段 1（DGMP）、在线阶段 2（流形与 OMP）与在线总复杂度分列。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.22756v1（cs.IT，2026-09-19）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（背景、相关工作、贡献、组织结构、记号）；第 II 节系统模型（II-A RIMSA 架构、式 (1)—(2)；II-B 信道模型、式 (3)—(6)；II-C 训练模型、式 (7)—(9) 与脚注 1）；第 III 节问题公式化（式 (10)—(16)）；第 IV 节所提 TSR 方法（IV-A 降低测量矩阵相干性、式 (17)—(33)；IV-B $\mathbf V_r$ 的设计、式 (34)—(43)、算法 1、注记 1；IV-C 从候选 DoA 集合选取物理 DoA、式 (44)—(53)、算法 2—3、注记 2 与式 (54)—(56)）；第 V 节计算复杂度与可行性（V-A 复杂度与表 I；V-B 可行性）；第 VI 节仿真结果（式 (57)、图 6—图 12 讨论）；第 VII 节结论；53 条英文参考文献；图 1—图 12 图注与表 I 表注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、图 1、引言开头）→ 第 2 页（引言续、图 2、相关工作）→ 第 3 页（相关工作续、贡献、结构、记号、第 II 节）→ 第 4 页（图 3、II-A 续、式 (1)—(6)）→ 第 5 页（图 4、II-C、式 (7)—(9)、第 III 节、式 (10)—(13)）→ 第 6 页（式 (14)—(16)、第 IV 节、IV-A、式 (17)—(21)）→ 第 7 页（式 (22)—(33)）→ 第 8 页（图 5、IV-B、式 (34)—(39)）→ 第 9 页（式 (40)—(43)、算法 1）→ 第 10 页（算法 2、式 (44)—(53)）→ 第 11 页（表 I、V-A、V-B、图 6 说明）→ 第 12 页（图 6、图 7、图 8、图 9、图 10 说明）→ 第 13 页（图 9—图 12 讨论）→ 第 14 页（第 VII 节、参考文献 [1]—[35]）→ 第 15 页（参考文献 [36]—[53]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 I 的全部条目已按 PDF 第 11 页渲染图逐项核对（含四个阶段的复杂度表达式），未改变任何符号或阶数。
2. 图 1—图 12 均未上传图片；本页以"图注与表注"小节统一给出 12 条中文图注与 1 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖原文编号式 (1)—(57)，全部保留原编号；算法 1—3 按原文逐步译出。
4. **原文疑点／说明：** ①原文式 (7) 中接收信号写作 $\sqrt{P}\mathbf V^{H}\mathbf h s_l+\mathbf V^{H}\mathbf z_l$，其等价噪声 $\widehat{\mathbf z}_l=\mathbf V^{H}\mathbf z_l$ 的协方差由半酉性质 $\mathbf V^{H}\mathbf V=\mathbf I_{N_R}$ 保证，译文照录；②式 (25) 的区间为 $\left(-\frac{2N_Ed}{\lambda}\pi,\frac{2N_Ed}{\lambda}\pi\right]$，其长度 $2\pi Q$ 与 $Q=2N_Ed/\lambda$ 一致，译文照录；③式 (29) 的求和指标范围 $-\frac{Q}{2}-\frac{\vartheta_{\widetilde g}}{2\pi}<i\le\frac{Q}{2}-\frac{\vartheta_{\widetilde g}}{2\pi}$ 按原文照录；④注记 2 中 $N_E$ 上界条件 (55)—(56) 的不等式方向按原文照录；⑤原文脚注 1 说明一维模型可经 Kronecker 积推广到二维平面阵，译文以脚注形式保留；⑥原文在算法 1 的 L-BFGS 更新中使用 $u_i,d_i,t_i,\kappa$ 等符号，译文保留原符号。
5. 原文为 arXiv 预印本（cs.IT），15 页；页面目录日期 2026-09-28 为站点归档日期，页首"版本"采用 arXiv v1（2026-09-19）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
