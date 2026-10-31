---
layout: page
title: "基于双层优化的函数先验图拓扑学习｜中文全文译文"
permalink: /papers/translations/2026-09-29-2606-13885-learning-graph-topology-with-functional-priors-via-bilevel-optimizatio/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3d24bd6e709db6ae/) · [原文 arXiv](https://arxiv.org/abs/2606.13885) · [全部目录](/papers/catalog/)

# 基于双层优化的函数先验图拓扑学习

**原题：** Learning Graph Topology With Functional Priors via Bilevel Optimization  
**作者：** Chenyue Zhang、Shangyuan Liu、Hoi-To Wai、Anthony Man-Cho So  
**单位：** 香港中文大学系统工程与工程管理系（Department of SEEM, The Chinese University of Hong Kong），香港沙田；邮箱：cyuezhang@link.cuhk.edu.hk、shangyuanliu@link.cuhk.edu.hk、{htwai,manchoso}@se.cuhk.edu.hk。  
**版本：** arXiv:2606.13885v1（eess.SP），2026 年 6 月 11 日；原文 18 页。  
**范围与状态：** 全文中文译稿：摘要、索引词、记号、第 I—VII 节（含各小节、假设 H1—H7、命题 1—9、引理 1—6、定理 1、推论 1）、结论、图 1—8 中文图注、表 I—III 逐格转录、附录 A—C、参考文献 [1]—[66]（英文原条目，按原编号）均按原文结构录入；逐句逐式终校未做。

## 摘要

复杂网络的图拓扑学习因数据可得性有限与数据模型不精确而颇具挑战。与以往聚焦"结构先验"（显式控制稀疏性等宏观性质）的工作不同，本文提出一种新颖的**函数先验**方法来学习图拓扑。我们假设复杂网络本质上是为完成某项任务而被优化的（例如社交网络专门优化某个福利函数，生物网络对节点/边删除具有韧性），该任务可作为正则项纳入以辅助图学习。数学上，我们建立双层优化问题：下层在候选图拓扑上求解相关任务，上层在数据拟合与任务性能之间做折中。我们设计一种双时间尺度梯度下降（two-timescale gradient descent, TTGD）算法，并证明在可验证条件下它能找到双层图学习问题的驻点，且具有次线性收敛速率。我们对函数先验所诱导的图拓扑给出理论洞见，并证明所得到的正则项包含一大类图滤波器正则项，多项式图正则项为其特例。合成与真实数据集上的大量实验表明，所提表述即使数据不足也能给出可靠的图拓扑估计。

**索引词：** 图拓扑学习、函数先验、双层优化。

## I. 引言

基于图的结构在数据科学中被广泛用于刻画特征与标签之间的关系。图结构学习在生命科学、图神经网络、推荐系统等众多实际应用中起关键作用。然而，自然图的拓扑并不总是已知的。因此，从节点观测推断未知图拓扑已成为机器学习、信号处理、社会学与生物学等领域的重要关注点 [1]。

该问题（也称图拓扑学习）长期是数据科学与信号处理中的挑战 [2]–[4]。早期工作聚焦于识别把节点观测与图拓扑联系起来的图信号模型（即**数据生成模型**），并开发高效推断图拓扑的算法。例如，文献 [5]、[6] 提出从平滑信号学习图拓扑，文献 [4]、[7]–[9] 利用高斯马尔可夫随机场（Gaussian Markov Random Field, GMRF）学习稀疏图拓扑，文献 [10]、[11] 提出受物理启发的图学习模型，文献 [12] 则利用受图信号处理启发的模型 [13]、[14]。随着所关注的网络日益复杂，图拓扑学习的最新发展转向数据可得性有限与数据模型不精确等新问题。一方面，节点观测的数量往往小于节点总数。这种数据稀缺可能源于测量成本高 [15]、隐私顾虑 [16]，或在大而复杂的系统中难以采集完整观测数据 [17]。于是图拓扑学习问题变得更具挑战性，因为它本质上是不适定问题（即存在许多与数据拟合的解）。另一方面，许多实际应用中的物理模型往往只是近似的，因此可能无法被精确刻画；当这种不精确性较高时，数据拟合项可能引导出错误的估计。

为缓解这些挑战，人们引入**先验知识**作为正则项以辅助图学习，其典型形式是（1）中的 $R(S)$。现有文献中，先验通常对图拓扑施加**显式的、宏观的**控制，例如稀疏性 [4]、[24]、[27] 与模块化/聚类结构 [25]、[26]、[28]。虽然这类结构先验在抑制过拟合方面有效，但它们可能无法反映真实世界网络的形成机制——后者通常受任务驱动：网络会针对特定功能或性能指标被"设计"或"优化"。这促使我们探索**函数先验**：从网络完成某任务的能力来刻画其拓扑。

**贡献。** 本文提出一种基于函数先验的图拓扑学习框架。我们假设复杂网络本质上是针对某个任务特定的价值函数被自优化的，该价值函数可在候选拓扑上评估；并把这一假设转化为双层优化表述（GLFP），其中下层问题在候选图拓扑上求解相关任务，上层问题在数据拟合与任务性能之间做折中。主要贡献概括如下：

- **函数先验框架与双时间尺度算法。** 我们提出图拓扑学习的函数先验框架，并设计 TTGD 算法求解相应双层问题。我们给出可验证的条件（H1—H5），在此条件下 TTGD 以 $O(1/K)$ 速率收敛到驻点（定理 1）。我们还通过两个案例研究——网络博弈与基因调控网络（GRN）动态——具体实现该框架，并给出充分条件（命题 1—2）。
- **可解释的结构分析。** 我们从理论上分析函数先验所诱导的图结构：网络博弈情形下，函数先验倾向于产生"多枢纽（multiple hub）"结构（命题 3—4）；GRN 情形下，它倾向于产生由单条双向边主导的拓扑（命题 5—6）。
- **与图滤波器先验的联系。** 我们证明：任何图滤波器（GF）正则项都可表示为函数先验正则项（引理 1），因而本文框架涵盖一大类现有结构先验（含多项式图正则项）。

## 记号

对任意正整数 $m$，记 $[m]$ 为集合 $\{1,2,\ldots,m\}$。所有实向量/矩阵构成的 Euclidean 空间配备内积 $\langle\mathbf X,\mathbf Y\rangle:=\operatorname{Tr}(\mathbf X^{\top}\mathbf Y)$；诱导的 Frobenius 范数记为 $\|\cdot\|_F$（当自变量为向量时记为 $\|\cdot\|_2$）。对向量 $\mathbf x\in\mathbb R^m$，$\mathbf x_i$ 表示其第 $i$ 个元素，$\mathbf x_{-i}\in\mathbb R^{m-1}$ 表示去掉 $\mathbf x_i$ 后的向量。$\operatorname{Diag}(\mathbf x)$ 表示以 $\mathbf x$ 为对角元构成的对角矩阵。对任意矩阵 $\mathbf X\in\mathbb R^{m\times n}$，$\|\mathbf X\|_2$ 为算子范数，$\|\mathbf X\|_1:=\sum_{i,j}|\mathbf X_{ij}|$，$\|\mathbf X\|_\infty:=\max_i\sum_j|\mathbf X_{ij}|$，$\operatorname{diag}(\mathbf X)$ 为由方阵对角元构成的向量。给定点 $\mathbf w$ 与闭凸集 $\mathcal C$，$\operatorname{Proj}_{\mathcal C}(\mathbf w):=\arg\min_{\mathbf v\in\mathcal C}\|\mathbf v-\mathbf w\|_2$ 表示 $\mathbf w$ 在 $\mathcal C$ 上的投影。$\mathbf 1$（$\mathbf 0$）表示全一（全零）向量，其维数由上下文确定。对集合 $\mathcal S$，$\iota_{\mathcal S}(\cdot)$ 表示其指示函数，即当 $\mathbf x\in\mathcal S$ 时 $\iota_{\mathcal S}(\mathbf x)=0$，否则为 $\infty$。

## II. 预备知识

本节回顾图拓扑学习的基本概念与模型。为固定记号，先考虑由有向图 $G=(\mathcal V,\mathcal E)$ 刻画的网络系统，其节点集为 $\mathcal V=[N]$、边集为 $\mathcal E\subseteq\mathcal V\times\mathcal V$，有序元组 $(i,j)\in\mathcal E$ 表示从 $i$ 指向 $j$ 的边。为描述 $G$，记其**图移位算子**（graph shifting operator, GSO）为 $\mathbf S\in\mathbb R^{N\times N}$，使得当 $(j,i)\notin\mathcal E$ 时 $S_{ij}=0$。例如 $\mathbf S$ 可以是（加权）邻接矩阵或（加权）Laplacian 矩阵，且不必对称。注意在图信号处理中，一个相关概念是阶数为 $p$ 的**线性图滤波器** $H(\cdot):\mathbb R^{N\times N}\to\mathbb R^{N\times N}$ [13]，它定义为 GSO $\mathbf S$ 的 $p$ 阶矩阵多项式：$H(\mathbf S)=\sum_{i=0}^{p}h_i\mathbf S^{i}$，其中约定 $\mathbf S^0=\mathbf I$，$\{h_i\}_{i=0}^{p}$ 为图滤波器系数。

**图拓扑学习。** 该问题指从定义在节点集 $\mathcal V$ 上的一组**图信号**推断未知图 $G$（等价地，推断其 GSO 矩阵 $\mathbf S$）。图信号记为 $\mathbf x^{(1)},\ldots,\mathbf x^{(M)}$，其中每个 $\mathbf x^{(m)}\in\mathbb R^{N}$ 描述节点状态。为简化记号，记 $\mathbf X=(\mathbf x^{(1)},\ldots,\mathbf x^{(M)})$。如同统计学习，图拓扑学习的一般表述为

$$
\min_{\mathbf S\in\mathcal S}\ J(\mathbf S;\mathbf X)+\lambda R(\mathbf S),\tag{1}
$$

其中 $J(\mathbf S;\mathbf X)$ 为**数据拟合**项，$\mathcal S\subseteq\mathbb R^{N\times N}$ 为 GSO 的可行集，$R(\mathbf S)$ 为与未知图先验知识相关的正则项，$\lambda>0$ 为正则化参数。

**生成模型。** （1）中的数据拟合项 $J(\mathbf S;\mathbf X)$ 与图信号观测的**生成模型**有关。当 $\mathbf X$ 为低通或平滑图信号 [38] 时，一种流行做法是拟合邻接矩阵 $\mathbf S$ 使 $\mathbf X$ 关于 $\mathbf S$ 平滑，即

$$
J_{\mathrm{smo}}(\mathbf S;\mathbf X)=\operatorname{Tr}(\mathbf S^{\top}\mathbf D),\qquad
D_{ij}=\frac{1}{2M}\left\|\mathbf x_i^{\mathrm{row}}-\mathbf x_j^{\mathrm{row}}\right\|_2^2\tag{2}
$$

对所有 $i,j\in[N]$ 成立，其中 $\mathbf x_i^{\mathrm{row}}$ 为第 $i$ 行。注意 $J_{\mathrm{smo}}(\mathbf S;\mathbf X)$ 可写成 $\frac{1}{2M}\sum_{m=1}^{M}\sum_{i,j}S_{ij}|x_i^{(m)}-x_j^{(m)}|^2$，度量图信号关于所提 $\mathbf S$ 的平均 Dirichlet 能量（脚注：表述（2）常被用于推断对称 GSO 矩阵 $\mathbf S$；本文讨论不施加该约束，以免限制函数先验的设计，见第 III-A 节）。可行邻接矩阵集合可取为

$$
\mathcal S_{\mathrm{ng}}=\left\{\mathbf S\in\mathbb R^{N\times N}:\mathbf S\geq0,\ \operatorname{diag}(\mathbf S)=\mathbf 0,\ \mathbf S\mathbf 1=c\mathbf 1\right\},\tag{3}
$$

其中强制 $c>0$ 以避免平凡解。沿着同样思路，替代模型还包括因子分析 [5]、平稳图信号 [12] 等。它们的数据拟合项 $J(\mathbf S;\mathbf X)$ 与约束集 $\mathcal S$ 具有类似形式。

在与网络动态系统（如基因调控网络）相关的情形中，除稳态响应图信号 $\mathbf X$ 外，还可获得输入 $\mathbf P\in\mathbb R^{N\times M}$（其第 $m$ 列记录实验 $m$ 中施加的外源干预或外部输入）。文献 [39]、[40] 提出如下数据拟合损失：

$$
J_{\mathrm{per}}(\mathbf S;\mathbf X)=\|\mathbf S\mathbf X+\mathbf P\|_F^2.\tag{4}
$$

该损失鼓励每个观测到的稳态响应满足线性化平衡关系 $\mathbf S\mathbf x^{(m)}\approx-\mathbf p^{(m)}$。我们采用可行邻接矩阵集合

$$
\mathcal S_{\mathrm{nd}}=\left\{\mathbf S\in\mathbb R^{N\times N}:\mathbf S\geq0,\ \operatorname{diag}(\mathbf S)=\mathbf 0,\ \mathbf 1^{\top}\mathbf S\mathbf 1=a\right\},\tag{5}
$$

其中强制 $a>0$ 以避免平凡解。注意（2）与（4）还存在依赖可用数据类型的替代模型，见 [2]、[3]。

**形成模型。** （1）中的正则项 $R(\mathbf S)$ 与图拓扑的**先验信息**有关。当图信号观测数量不足（即 $N\gg M$）时，它尤为重要。从高层看，先验信息与**形成模型**有关，后者刻画图 $G$ 如何生成。已有文献中，常见选择对图拓扑施加**显式的、宏观的**控制。例如稀疏先验与多变量指数分布相关；文献 [24] 证明该先验分布在最大后验（MAP）估计中可诱导正则项

$$
R_{\ell_1}(\mathbf S)=\|\mathbf S\|_1\tag{6}
$$

（脚注：文献 [6] 证明可等价地使用平方 Frobenius 正则项 $R(\mathbf S)=\|\mathbf S\|_F^2$）。另一个例子是图由含 $K$ 个稠密连通分量的模块化结构形成的先验 [25]、[26]，对应正则项

$$
R_{\mathrm{mod}}(\mathbf S)=\sum_{i=K+1}^{N}\sigma_i(\mathbf S),\tag{7}
$$

其中 $\sigma_i(\cdot)$ 表示 $\mathbf S$ 的第 $i$ 大奇异值。

## III. 问题表述

本文提出一种图学习框架，区别于（6）、（7）等由结构启发的正则项设计。我们转而开发**任务启发**的正则项，通过网络所执行任务对图拓扑的影响来**隐式**调节图拓扑。高层上，框架由一种新的图拓扑形成模型导出。受"真实世界网络经由自然选择过程形成"这一假设启发，我们基于如下总体猜想：

> **真实世界网络的图拓扑依据任务特定的价值函数而被自优化。**

例如，社会经济网络的一种可能形成模型是：图拓扑使网络博弈 [41] 在 Nash 均衡（NE）处取得最高收益；对基因调控网络，图拓扑使生物物理系统的稳态具有韧性 [42]、[43]。

总体上，考虑由网络状态 $y^\star(S)\in\mathcal Y^\star(S):=\{y\in\mathcal Y:Y(y;S)=0\}$ 的平稳性条件定义的一般价值函数设计，其中 $\mathcal Y\subseteq\mathbb R^N$ 为可行状态集，$Y(\cdot;S)\in\mathbb R^N$ 为平稳性条件映射。例如在网络博弈中，它与最佳响应动力学的固定点有关。于是价值函数由隐函数给出：

$$
R(S):=\min_{y\in\mathcal Y^\star(S)}\hat R(y)+\frac{\tilde\beta}{2}\|S\|_F^2,\tag{8}
$$

其中 $\hat R:\mathcal Y\to\mathbb R$ 量化网络稳态的价值，Frobenius 范数项用于稳定优化解（$\tilde\beta>0$）。例如 $\hat R(y)$ 为网络博弈中收益和的相反数。于是得到**双层规划**

$$
\min_{S\in\mathcal S,\ y\in\mathcal Y}\ \Phi(S;y):=J(S;X)+\lambda\hat R(y)+\frac{\lambda\tilde\beta}{2}\|S\|_F^2\quad\text{s.t.}\ y\in\mathcal Y^\star(S),\tag{GLFP}
$$

它把来自生成模型的数据拟合项与来自形成模型的正则项结合起来。我们将形如（8）的正则项称为**函数正则项**，以区别于以往工作考虑的结构正则项。下面讨论（GLFP）中形成模型的两个特例。

### A. 案例研究 1：网络博弈

我们考虑由网络博弈 [28] NE 带来的总福利驱动的形成模型。该博弈设定与经济社会网络学习有关：假设 agent 是理性的，其行为由某效用函数塑造。下层状态 $y$ 汇集候选图拓扑诱导的 agent 均衡动作，因此函数先验偏好均衡时总福利高的图。

该设定中，每个节点表示一个 agent，边权表示相邻 agent 对之间信任强度。每个 agent 拥有收益函数 $U_i(\cdot)$，取决于其邻居与自身的动作。每个 agent 求动作 $y_i^\star$：

$$
y_i^\star=\arg\max_{y_i\in\mathcal Y_i}U_i(y_i,y_{-i};S),\tag{9}
$$

其中 $y_{-i}$ 表示去掉第 $i$ 个 agent 动作后的向量，$\mathcal Y_i\subseteq\mathbb R$ 为允许动作集。agent 之间非合作，各自最大化自身收益（9）。于是 NE 描述没有任何 agent 愿意改变动作的动作集合。数学上，假设 NE 存在且唯一，它由最佳响应映射定义：

$$
T_i(y;S):=\arg\max_{y_i\in\mathcal Y_i}U_i(y_i,y_{-i};S),\quad\forall i\in\mathcal V,
$$

把各分量映射收集起来得到向量算子 $T(y;S):=(T_1(y;S),\ldots,T_N(y;S))^{\top}$。特别地，$y^{\mathrm{NE}}(S)=(y_1^{\mathrm{NE}}(S),\ldots,y_N^{\mathrm{NE}}(S))$ 称为 NE，若

$$
y_i^{\mathrm{NE}}(S)=T_i(y^{\mathrm{NE}}(S);S),\quad\forall i\in\mathcal V.
$$

为简化记号，把 $y^{\mathrm{NE}}(S)$ 记为方程 $y=T(y;S)$ 的固定点。这给出（GLFP）的一个特例，其中

$$
Y(y;S):=y-T(y;S).
$$

我们考虑两种收益函数模型。第一种是**广义线性二次（LQ）博弈** [28]、[44]–[46]，其收益为

$$
U_i^{\mathrm{lq}}(y_i,y_{-i};S)=-\frac{y_i^2}{2}+y_i\left(\sum_{j=1}^{N}S_{ij}f(y_j)+b_i\right)\tag{10}
$$

定义在 $\mathcal Y_i=[0,\infty)$ 上，其中 $b_i$ 为边际收益，$f(\cdot)$ 为调节邻居动作对 agent $i$ 影响强度的交互函数。广义 LQ 博弈是网络上策略交互的典范模型 [47]。该模型中每个 agent $i$ 选择非负动作水平 $y_i$，可解释为努力或参与强度。第一项 $-y_i^2/2$ 表示施加动作的私人成本，$\sum_{j=1}^{N}S_{ij}f(y_j)$ 刻画 agent $i$ 的激励如何由图上前邻居动作塑造。交互函数 $f(\cdot)$ 在聚合前作用于单个邻居动作，因此该博弈刻画"个体中介的溢出效应"；关于上述模型 NE 存在唯一性的条件见 [44]。

第二种是**竞赛与锦标赛（RT）博弈** [48]–[50]，其收益为

$$
U_i^{\mathrm{rt}}(y_i,y_{-i};S)=-\frac{y_i^2}{2}+y_i\left(g\left(\sum_{j=1}^{N}S_{ij}y_j\right)+b_i\right)\tag{11}
$$

定义在 $\mathcal Y_i=[b_i,a_i]$（$0<b_i<a_i$）上，$g(\cdot)$ 为捕捉 agent $i$ 与其邻居之间交互的非线性函数。RT 博弈刻画动作有界 $y_i\in[b_i,a_i]$ 的竞争性交互。注意非线性函数 $g(\cdot)$ 作用于聚合的邻居活动 $\sum_{j=1}^{N}S_{ij}y_j$，因此努力回报非线性地依赖整体局部竞争环境。因此 RT 博弈的交互结构与广义 LQ 博弈不同：后者刻画个体中介的溢出效应，前者适用于激励依赖同伴活动总体水平的场景；关于上述模型 NE 存在唯一性的条件见 [49]。

一般而言，图拓扑 $S$ 直接影响 NE $y^{\mathrm{NE}}(S)$ [28]、[44]。此处可以用**总福利** [27] 度量社会经济系统的性能，定义为

$$
\mathrm{Wel}(S):=\mathbf 1^{\top}y^{\mathrm{NE}}(S),
$$

可视为整体经济收益。注意 $\mathrm{Wel}(S)$ 通过网络博弈的 NE 依赖 $S$。我们正式陈述形成模型猜想：

> **社会经济与人造系统的图拓扑应最大化总福利 $\mathrm{Wel}(S)$，因此价值函数取 $R(S)=-\mathrm{Wel}(S)+\frac{\tilde\beta}{2}\|S\|_F^2$。**

直接验证上述猜想是不可能的，因为真实形成模型未知。我们通过真实世界网络上的测试采取经验性办法：若猜想成立，则相应 $S$ 应是 $\mathrm{Wel}(S)$ 的局部极大点，即对 $S$ 的任何扰动都可能使 $\mathrm{Wel}(S)$ 显著下降。我们对真实世界网络的图拓扑施加随机重连（random rewiring），并比较 $\mathrm{Wel}(S)$ 的下降来验证该现象。固定 $b=1$，考虑（10）中收益函数与线性交互 $f(x)=x$。计算扰动福利比

$$
\mathbb E\left[\frac{\mathrm{Wel}(S_{\mathrm{pt}})-\mathbf 1^{\top}b}{\mathrm{Wel}(S_{\mathrm{og}})-\mathbf 1^{\top}b}\right],\tag{12}
$$

其中 $S_{\mathrm{og}}$ 与 $S_{\mathrm{pt}}$ 分别为原始图与随机重连图的非加权邻接矩阵。表 I 给出真实世界网络上的福利比。可见人造网络（如 Karate）在重连后福利比显著下降，而其他网络（如 Dolphins）对重连不太敏感。该观察支持我们的猜想。相关观察也可在 [27]、[51]、[52] 中找到：真实网络表现出自优化特征。

最后，我们把基于平滑的生成模型（2）与上述形成模型结合，得到

$$
\min_{S,\ y\in\mathcal Y}\ \Phi(S;y):=\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\lambda\mathbf 1^{\top}y\quad\text{s.t.}\ y-T(y;S)=0,\ S\in\mathcal S_{\mathrm{ng}},\tag{GL-NG}
$$

其中 $\mathcal Y=\{y\in\mathbb R^N:y_i\in\mathcal Y_i,\forall i\in[N]\}$，$\mathcal S_{\mathrm{ng}}$ 由（3）定义，$\beta=\lambda\tilde\beta/2>0$、$\lambda>0$ 为正则化参数。

### B. 案例研究 2：网络动态

我们考虑由基因调控网络（GRN）动态的韧性驱动的形成模型。GRN 动态建模细胞中基因随时间变化的状态（以表达水平度量）。本案例针对 GRN：候选图拓扑决定基因之间如何通过非线性稳态动力学模型相互影响。下层变量因此表示稳态基因表达谱，函数先验奖励那些在扰动下仍能维持大非零稳态响应的图拓扑。

GRN 中每个节点表示基因，边权表示基因之间的影响强度（可含方向）。每个基因的状态由其表达水平表示，可受其邻居基因表达水平影响。为刻画基因表达水平的变化，一个被广泛使用的模型是 Michaelis–Menten（MM）微分方程组 [53]、[54]：

$$
\frac{d}{dt}y_i(t)=-y_i(t)+\sum_{j=1}^{N}S_{ij}\frac{y_j(t)^2}{y_j(t)^2+1},\quad\forall i\in\mathcal V,\tag{13}
$$

其中 $y_i(t)$ 表示第 $i$ 个基因在 $t$ 时刻的表达水平。线性衰减项 $-y_i(t)$ 建模基因产物的自然降解；来自邻居基因的非线性调控输入取饱和响应函数形式。特别地，$y_j(t)^2/(y_j(t)^2+1)$ 具有 Hill 函数型非线性：当基因 $j$ 表达水平低（高）时，其调控作用弱（饱和）。这种饱和是生化调控模型的标准特征，也是 MM 系统在系统生物学中被广泛采用的原因之一 [53]、[54]。在（13）下，细胞的稳态 $y^\star$ 定义一组不变化的基因状态：

$$
\mathcal Y^\star(S):=\left\{y\in\mathbb R^N:y_i=\sum_{j=1}^{N}S_{ij}\frac{y_j^2}{y_j^2+1},\ \forall i\in\mathcal V\right\}.\tag{14}
$$

注意一般有 $|\mathcal Y^\star(S)|>1$。例如必有 $0\in\mathcal Y^\star(S)$，同时可能还存在满足（14）的其他非零解。

在 GRN 动态语境中，韧性指 GRN 在因基因敲除或调控相互作用抑制而受扰动后，仍维持非零稳态的能力。我们关注由 GRN 动态方程与图拓扑决定的**普适韧性**，它独立于具体扰动类型。为此，文献 [29] 提出基于图拓扑异质性的度量，并表明后者与 GRN 对边删除扰动的韧性相关。区别于 [29]，我们提出一种直接度量稳态中非零基因数量的替代韧性指标。特别地，考虑

$$
R_{\mathrm{ob}}(S)=\max_{y\in\mathcal Y^\star(S)}\sum_{i=1}^{N}\frac{1-e^{-\sigma y_i}}{1+e^{-\sigma y_i}},\tag{15}
$$

它近似由 $S$ 产生的稳态中非零基因的数量。这里 $\sigma>0$ 控制逼近误差，$\sigma$ 越大逼近越紧。一方面，$R_{\mathrm{ob}}(S)=0$ 当且仅当 GRN 只有零稳态；另一方面，$R_{\mathrm{ob}}(S)$ 越大的 GRN 有越多活跃基因，直观上意味着 GRN 更有韧性。（15）使我们能够正式陈述关于 GRN 图拓扑 $S$ 形成模型的猜想：

> **自然界中的细胞应最大化由 $R_{\mathrm{ob}}(S)$ 近似的韧性，因此价值函数为 $R(S)=-R_{\mathrm{ob}}(S)+(\tilde\beta/2)\|S\|_F^2$。**

注意

$$
\frac{1-e^{-\sigma y_i}}{1+e^{-\sigma y_i}}=2\frac{1}{1+e^{-\sigma y_i}}-1.
$$

因此下文所用的基于 sigmoid 的目标与（15）只差一个可加常数与正则化参数的缩放。

直接验证上述猜想很难，甚至不可能。我们采取经验办法：以 $S$ 取 *E. coli* GRN [29]（含 $N=1454$ 个基因与 $|E|=3170$ 条边，取最大连通分量）时的 $R_{\mathrm{ob}}(S)$ 为对象，把它与具相同基因数与边数的 Erdős–Rényi（ER）或优先连接（preferential attachment, PA）控制图对比。图 2 左图比较 $R_{\mathrm{ob}}(\hat S)$ 关于 $p_{\mathrm{perturb}}$ 的平均值，其中 $\hat S$ 由从 $S$ 随机删除 $p_{\mathrm{perturb}}$ 比例的边得到。可以看到，*E. coli* 的 $R_{\mathrm{ob}}(\hat S)$ 始终高于边密度相近的控制图，这支持我们的猜想。图 2 右图比较各 GRN 在边删除扰动下的存活率（即达到非零稳态的概率），观察到与 $R_{\mathrm{ob}}(\hat S)$ 类似的结论，说明 *E. coli* 具有比随机图更富韧性的拓扑。

最后，把形成模型与受 GRN 推断中线性动态近似 [55]、[56] 启发的生成模型结合。利用敲除实验后 GRN 稳态观测 $\mathbf X\approx-\mathbf S^{-1}\mathbf P$，我们考虑如下图拓扑学习问题：

$$
\min_{S,\ y}\ \Phi(S;y):=\|\mathbf S\mathbf X+\mathbf P\|_F^2+\beta\|\mathbf S\|_F^2-\lambda\sum_{i=1}^{N}\frac{1}{1+e^{-\sigma y_i}}\quad\text{s.t.}\ y_i=\sum_{j=1}^{N}S_{ij}\frac{y_j^2}{y_j^2+1},\ \forall i\in\mathcal V,\ \mathbf S\in\mathcal S_{\mathrm{nd}}.\tag{GL-GENE}
$$

这里 $\beta=\lambda\tilde\beta/2>0$、$\lambda>0$ 为正则化参数，$\mathcal S_{\mathrm{nd}}$ 由（5）定义（归一化常数 $a>0$）。注意与网络博弈情形不同，（GL-GENE）中的下层稳态系统可能有多个均衡，这一区别在讨论第 IV 节算法收敛性时很重要。

## IV. TTGD 算法

本节提出双时间尺度梯度下降（TTGD）算法求解带函数先验的图学习问题。回顾（GLFP）可写为

$$
\min_{S\in\mathcal S,\ y\in\mathcal Y}\ \Phi(S;y)\quad\text{s.t.}\ Y(y;S)=0.\tag{16}
$$

注意 $Y(y;S)=0$ 由 $N$ 个非线性等式约束组成。为说明起见，假设 (i) 对任意 $S\in\mathcal S$，约束集存在唯一解 $y^\star(S)$，即 $\mathcal Y^\star(S)=\{y^\star(S)\}$；(ii) $y^\star(S)$ 关于 $S$ Lipschitz 连续。这些是双层优化文献中的常见假设 [30]、[57]。在此假设下，（16）可重述为

$$
\min_{S\in\mathcal S}\ \ell(S):=\Phi(S;y^\star(S)).
$$

上述问题可用标准投影梯度下降（projected gradient descent, PGD）算法处理：在第 $k\geq0$ 次迭代，

$$
S^{k+1}=\operatorname{Proj}_{\mathcal S}\left(S^k-\gamma\nabla\ell(S^k)\right),\quad\forall k\geq0,\tag{17}
$$

其中 $\gamma>0$ 为步长，$\operatorname{Proj}_{\mathcal S}(\cdot)$ 为到 $\mathcal S$ 的 Euclidean 投影。然而（17）的困难在于梯度计算 $\nabla\ell(S^k)$，因为 $\ell(S)$ 通过 $y^\star(\cdot)$ 隐式依赖 $S$。为此，令 $\bar y^k:=y^\star(S^k)$；当 $Y(\cdot)$ 平滑时，可证明 [57]

$$
\nabla\ell(S^k)=\hat\nabla\Phi(S^k;\bar y^k):=\nabla_S\Phi(S^k;\bar y^k)-\left(J_{SY}(\bar y^k;S^k)\right)^{\top}\left(J_{y}Y(\bar y^k;S^k)\right)^{-\top}\nabla_y\Phi(S^k;\bar y^k),\tag{18}
$$

其中 $J_{SY}(\cdot)$、$J_yY(\cdot)$ 分别表示算子 $Y$ 关于 $S$、$y$ 的 Jacobian；$\nabla_S\Phi(\cdot)$、$\nabla_y\Phi(\cdot)$ 分别表示关于 $S$、$y$ 的偏梯度。因此，计算 $\nabla\ell(S^k)$ 需要在 $y$ 中求解 $Y(y;S^k)=0$ 的唯一解。我们用符号 $\hat\nabla\Phi(\cdot)$ 强调所用的是近似隐式梯度：在精确下层解 $\bar y^k$ 处它等于精确梯度 $\nabla\ell(S^k)$，而当 $y^k$ 仅跟踪 $y^\star(S^k)$ 时它只是近似。

为解决该问题，注意到

$$
Y(y;S)=0\iff F(y;S)=y,\qquad F(y;S):=y-Y(y;S).
$$

若 $F(\cdot;S):\mathcal Y\to\mathcal Y$ 对任意 $S$ 是压缩自映射，则固定点迭代 $y^{+}\leftarrow F(y;S^k)$ 以线性速率找到 $y^\star(S^k)$ [49]。上述观察提示一种双时间尺度算法：以不同步调同时更新 $y$ 与 $S$——$y$ 用较大步长、$S$ 用较小步长。这样 $S^k$ 相对 $y^k$ 显得"静止"，$y^k$ 固定点迭代的快速收敛使其能跟踪真解 $y^\star(S^k)$，从而 $\hat\nabla\Phi(S^k;y^k)\approx\nabla\ell(S^k)$。

受 [30] 与上述思想启发，算法形式化如下：令 $\gamma>0$、$\alpha\in(0,1]$ 为步长，考虑

**双时间尺度梯度下降（TTGD）：** 对 $k\geq0$，

$$
y^{k+1}=y^k+\alpha\left(F(y^k;S^k)-y^k\right),\tag{19a}
$$

$$
S^{k+1}=\operatorname{Proj}_{\mathcal S}\left(S^k-\gamma\hat\nabla\Phi(S^k;y^{k+1})\right).\tag{19b}
$$

（19a）中对 $y^k$ 的更新采用了固定点迭代的松弛版本（$\alpha\in(0,1]$）；分析将表明这种松弛对若干情形下的收敛保证是必要的。由于 $y^{k+1}$ 是 $y^k$ 与 $F(y^k;S^k)$ 的凸组合，只要 $y^0\in\mathcal Y$，归纳可知任意 $k$ 时 $y^{k+1}\in\mathcal Y$。

尽管 TTGD 是在下层方程有唯一解的假设下推导的，但当唯一性假设不成立时，TTGD 迭代仍有定义且可计算。此时 $y^\star(S)$ 可能不唯一、$\nabla\ell(\cdot)$ 无定义，$\hat\nabla\Phi(S^k;\bar y^k)$ 应仅理解为 $\ell(\cdot)$ 的"次微分"式可计算搜索方向；只要 $Y(\cdot;S)$ 可微且 $J_yY$ 可逆，更新本身仍有定义。

> **注 1：** TTGD 的关键计算瓶颈在（18），它需要求逆 $(J_yY(y^k;S^k))^{-1}$，每次迭代约需 $O(N^3)$ 次浮点运算。大规模场景中，可在求逆前用 $J_yY$ 的对角部分 $D$ 近似 [58]。写 $J_yY=D-E$（$E$ 收集非对角元），若 $\|D^{-1}E\|<1$，则 $(J_yY)^{-1}=D^{-1}(I-D^{-1}E)^{-1}$ 有 Neumann 展开，对角近似保留主导项 $D^{-1}$。注意网络 $J_yY$ 的非对角元编码均衡系统中节点间交互，当网络耦合强时丢弃它们可能导致不精确的梯度估计。

### A. TTGD 的收敛分析

本小节研究 TTGD 的收敛性。我们通过优化闭凸集 $\mathcal S$ 上光滑非凸函数 $\ell$ 的驻点度量来刻画收敛行为。对任意 $\gamma>0$，定义

$$
G_\gamma(S):=\left\|\gamma^{-1}\left(S-\operatorname{Proj}_{\mathcal S}(S-\gamma\nabla\ell(S))\right)\right\|_F^2.
$$

若 $0\in\nabla\ell(S)+\partial\iota_{\mathcal S}(S)$ [59]，则称 $S$ 为（16）的驻点，其中 $\partial\iota_{\mathcal S}(S)$ 为指示函数 $\iota_{\mathcal S}$ 在 $S$ 处的次微分 [60]。由投影算子定义显然，若对某 $\gamma>0$ 有 $S=\operatorname{Proj}_{\mathcal S}(S-\gamma\nabla\ell(S))$，则 $S$ 为驻点；$G_\gamma(S)$ 小时 $S$ 应接近驻点。下面给出保证 TTGD 收敛的若干一般条件：

**H1.** 集合 $\mathcal S$ 凸且紧。

**H2.** 对任意 $S\in\mathcal S$、$y\in\mathcal Y$，$F(y;S)\in\mathcal Y$，其中 $F(y;S):=y-Y(y;S)$。

**H3.** 存在 $\mu_y\in(0,1)$，使对任意 $S\in\mathcal S$ 与 $y_1,y_2\in\mathcal Y$ 有

$$
(1-\mu_y)\|y_1-y_2\|_2^2\leq\langle Y(y_1;S)-Y(y_2;S),y_1-y_2\rangle\leq\|Y(y_1;S)-Y(y_2;S)\|_2\|y_1-y_2\|_2\leq(1+\mu_y)\|y_1-y_2\|_2^2.
$$

**H4.** 目标函数 $(S,y)\mapsto\Phi(S;y)$ 平滑：存在 $L_\Phi>0$，使对所有 $S_1,S_2\in\mathcal S$ 与 $y_1,y_2\in\mathcal Y$ 有

$$
\|\nabla\Phi(S_1;y_1)-\nabla\Phi(S_2;y_2)\|_F\leq L_\Phi\|(S_1;y_1)-(S_2;y_2)\|_F,
$$

其中 $\nabla\Phi=(\nabla_S\Phi;\nabla_y\Phi)$ 为 $\Phi(S;y)$ 关于 $(S;y)$ 的梯度。

**H5.** 映射 $(y,S)\mapsto Y(y;S)$ 平滑：对任意 $B>0$，存在 $L_Y>0$，使对所有 $S_1,S_2\in\mathcal S$ 及满足 $\|y_1\|_2,\|y_2\|_2\leq B$ 的 $y_1,y_2\in\mathcal Y$ 有

$$
\|JY(y_1;S_1)-JY(y_2;S_2)\|_F\leq L_Y\|(S_1;y_1)-(S_2;y_2)\|_F,
$$

其中 $JY=(J_yY;J_SY)$ 为 $Y(y;S)$ 关于 $(y;S)$ 的 Jacobian。

这里若映射具有所有阶连续偏导数则称其平滑。上述假设中，H2 与 H3 意味着 $F(\cdot;S)$ 对任意 $S\in\mathcal S$ 是压缩自映射，故 $Y(y;S)=0$ 对任意 $S\in\mathcal S$ 存在唯一解 $y^\star$；结合 H1 可证选取合适 $\alpha$ 时（19a）产生的 $\{y^k\}$ 有界。此外 H4 与 H5 意味着梯度映射 $\hat\nabla\Phi(\cdot)$ 关于 $S$、$y$ 分别局部 Lipschitz 连续，从而 $\hat\nabla\Phi(\cdot)$ 在 TTGD 迭代（19）生成的序列 $\{(S^k,y^k)\}$ 上 Lipschitz 连续。基于上述观察，我们沿用 [30] 的证明得到如下收敛结果，完整证明见附录 B，这里给出主要论证。

**定理 1.** 假设 H1—H5 成立。令 $L_\ell$、$L_{\hat\Phi}$、$L_y$ 为附录 B 中命题 7 的常数，取

$$
\alpha=\frac{1-\mu_y}{(1+\mu_y)^2},\qquad \gamma\leq\min\left\{\frac{3}{4L_\ell},\frac{\alpha(1-\mu_y)}{4L_{\hat\Phi}L_y}\right\}.
$$

则对任意 $K\geq1$ 有

$$
\min_{k=1,\ldots,K}G_\gamma(S^k)=O(K^{-1}).
$$

**证明概要。** 证明分三部分：先证下层迭代（19a）是压缩的，故 $y^k$ 跟踪 $y^\star(S^k)$；再用此控制可计算隐式梯度 $\hat\nabla\Phi(S^k;y^{k+1})$ 与精确梯度 $\nabla\ell(S^k)$ 之间的差距；最后 Jacobian 正则性假设保证隐式梯度沿迭代有定义。结果由投影下降论证得到。$\square$

**网络博弈。** 下面给出把（16）特殊化到第 III-A 节网络博弈设定时 H1—H5 成立的充分条件。全程取 $\mathcal S=\mathcal S_{\mathrm{ng}}$（（3），参数 $c>0$）。先考虑 LQ 博弈诱导的函数正则项 $R(S)$ 的假设：

**H6.** 考虑（10）中的收益函数 $U_i^{\mathrm{lq}}(\cdot)$，$\mathcal Y=[0,\infty)^N$：

- 对所有 $i\in[N]$，边际收益满足 $b_i\geq b^\star>0$；
- 交互函数满足 $f(0)=0$，且对任意 $y>0$ 有 $f(y)>0$；
- 存在 $L_{f,1},L_{f,2}$ 使交互函数对任意 $y\in(0,\infty)$ 满足 $|f'(y)|\leq L_{f,1}$、$|f''(y)|\leq L_{f,2}$，且 $L_{f,1}<\frac1c$。

在该假设下，文献 [44] 证明了 NE 对任意 $S\in\mathcal S$ 存在且唯一。进一步观察到：

**命题 1.** 在 H6 下，存在平滑映射 $\tilde Y(\cdot)$ 使对任意 $y\in\mathcal Y$、$S\in\mathcal S_{\mathrm{ng}}$ 有 $\tilde Y(y;S)=Y(y;S)$。此外，对（GL-NG）使用 $\tilde Y(\cdot)$ 与 $\Phi(\cdot)$ 的特例满足 H1—H5。完整证明见附录 C。

接着考虑 RT 博弈以实例化函数正则项设计：

**H7.** 考虑（11）中的收益函数 $U_i^{\mathrm{rt}}(\cdot)$，$\mathcal Y=[b_i,a_i]^N:=\{y\in\mathbb R^N:y_i\in[b_i,a_i],\forall i\in[N]\}$：

- 对所有 $i\in[N]$，边际收益满足 $b_i\geq b^\star>0$；
- 交互函数满足 $g(0)=0$，且对任意 $y>0$ 有 $g(y)>0$；
- 存在 $L_{g,1},L_{g,2}$ 使交互函数对任意 $x\in[0,c\max_i a_i]$ 满足 $|g'(x)|\leq L_{g,1}$、$|g''(x)|\leq L_{g,2}$，且 $L_{g,1}<\frac{c^{-1}}{1-\max_i b_i/a_i}$。

在该假设下，文献 [49] 证明 NE 对任意 $S\in\mathcal S$ 存在且唯一。类似地：

**命题 2.** 在 H7 下，存在平滑映射 $\tilde Y(\cdot)$ 使对任意 $y\in\mathcal Y$、$S\in\mathcal S_{\mathrm{ng}}$ 有 $\tilde Y(y;S)=Y(y;S)$。此外，对（GL-NG）使用 $\tilde Y(\cdot)$ 与 $\Phi(\cdot)$ 的特例满足 H1—H5。

因此两种情形都满足 TTGD 收敛的充分条件，定理 1 的 $O(1/K)$ 收敛速率对应用于（GL-NG）的 TTGD 成立。

> **注 2：** 对第 III-B 节考虑的图学习表述（GL-GENE），只要系统 $Y(y;S)=0$ 在持续存在平凡解 $y=0$ 的同时还允许非平凡解 $y\neq0$，H2 与 H3 即被违反。由于非平凡稳态正是 GL-GENE 关注的情形，定理 1 不为应用于（GL-GENE）的 TTGD 提供收敛保证。尽管如此，第 VI-B 节数值结果表明 TTGD 在该更具挑战性的区制中仍能给出有意义的图估计，超出当前分析范围。这说明即使下层动态非线性并允许多个均衡分支，TTGD 在求解（GL-GENE）时仍提供近似下降方向。

## V. 对 R(S) 的结构解释

本节研究函数先验与图学习中结构先验之间的关系。注意由于（GLFP）在 $\lambda>0$ 时给出**有偏**的图估计器，即使 $M\gg1$，（GLFP）的最优解也可能不与真实图重合。因此讨论（GLFP）的精确可恢复性可能没有意义。本节转而分析由函数先验正则化的图学习问题的最优解，并指出它们诱导的图结构类型。由于双层优化问题往往难以分析，我们聚焦第 III 节的两个案例研究及其近似。

**网络博弈。** 第一步是构造（GL-NG）的一个便于分析的近似。考虑如下由上一节 H6、H7 蕴含的性质：1) $f(\cdot)$、$g(\cdot)$ 是 $\ell_1$-Lipschitz 连续，$\ell_1<1/c$；2) 对任意 $y>0$ 有 $f(y),g(y)>0$；3) 对任意 $S\in\mathcal S_{\mathrm{ng}}$，$y^{\mathrm{NE}}(S)$ 位于 $\mathcal Y$ 的内部。观察到如下命题：

**命题 3.** 考虑双层问题（GL-NG）。在上述条件下有

$$
\left\|y^{\mathrm{NE}}(S)\right\|_2\leq B^{\star}=\frac{\sqrt N\|\mathbf b\|_\infty}{1-c\ell_1},\quad\forall S\in\mathcal S_{\mathrm{ng}}.
$$

因此，对任意 $S\in\mathcal S_{\mathrm{ng}}$ 有

$$
\begin{aligned}
&\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\lambda\ell_1\mathbf 1^{\top}Sb-\lambda\mathbf 1^{\top}\bar{\mathbf c}\\
&\leq\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\lambda\mathbf 1^{\top}y^{\mathrm{NE}}(S)\\
&\leq\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\lambda\mu_1\mathbf 1^{\top}Sb-\lambda\mathbf 1^{\top}\hat{\mathbf c},
\end{aligned}\tag{20}
$$

其中 $\bar{\mathbf c}=\frac{(c\ell_1)^2}{1-c\ell_1}\|\mathbf b\|_\infty\mathbf 1+\mathbf b$，$\hat{\mathbf c}=\frac{(c\mu_1)^2}{1-c\mu_1}b^{\star}\mathbf 1+\mathbf b$，$b^{\star}=\min_{i\in[N]}b_i$。对 LQ 博弈，$\mu_1=\frac{\min_{y\in[b^{\star},B^{\star}]}f(y)}{B^{\star}}$；对 RT 博弈，$\mu_1=\frac{\min_{y\in[b^{\star},B^{\star}]}g(cy)}{cB^{\star}}$。证明见附录 A-A。

（20）意味着（GL-NG）可由

$$
\min_{S\in\mathcal S_{\mathrm{ng}}}\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\tilde\lambda\mathbf 1^{\top}Sb\tag{GL-NG-App}
$$

近似，其中 $\tilde\lambda>0$ 与 $\lambda$ 成正比。重要的是，（GL-NG-App）是带仿射约束的凸规划。分析其 KKT 条件得到

**命题 4.** 存在 $\eta\in\mathbb R^N$，使（GL-NG-App）的任意最优解由

$$
S^{\star}_{ij}=\frac{1}{2\beta}\max\left\{0,\ \tilde\lambda b_j+\eta_i-D_{ij}\right\}
$$

给出（对任意 $i\neq j$），且 $S^{\star}_{ii}=0$；此外有 $S^{\star}\mathbf 1=c\mathbf 1$。证明见附录 A-B。

由命题 3、4 可知，当 $\tilde\lambda\gg1$ 时（GL-NG）的最优解可近似为 $S^{\star}_{ij}\approx\frac{\tilde\lambda}{2\beta}b_j$（$\forall i,j\in\mathcal V$）。由于实践中各 agent 的边际收益 $\mathbf b$ 可能不同，（GL-NG-App）（因而（GL-NG））的任意最优解给出一个呈现"**多枢纽**"结构的图拓扑：多数边将从 $b_j$ 大的节点发出。该观察与表 I 研究的人造网络例子一致——那里可观察到若干"枢纽"节点。

命题 4 给出函数先验所诱导的有偏估计器的结构刻画，而非精确拓扑恢复的保证。当 $\lambda>0$ 时，函数先验引入与任务对齐的偏差，因此所学图应理解为在数据保真与指定功能目标之间折中。特别地，命题 4 解释了为何在大 $\lambda$ 区制会出现促进枢纽的结构，这与函数先验背后的网络形成视角一致。

**网络动态。** 与前一情形类似，下面推导（GL-GENE）的近似。

**命题 5.** 考虑问题（GL-GENE），记其最优值为 $\upsilon^{\star}_{\mathrm{GENE}}$。则

$$
\upsilon^{\star}_{\mathrm{GENE}}\geq\min_{S\in\mathcal S_{\mathrm{nd}}}\ \|SX+P\|_F^2+\beta\|S\|_F^2-\hat\lambda\mathbf 1^{\top}S^2\mathbf 1-\frac{N\lambda}{2},\tag{GL-GENE-App}
$$

其中 $\hat\lambda=\frac{\sigma\lambda}{8}$。证明见附录 A-C。

命题 5 给出（GL-GENE）的单边近似。该近似不如命题 3 那么紧，但仍为（GL-GENE）的最优解提供有用洞见。此外，注意（GL-GENE-App）中的正则项与 [29] 提出的韧性量有关，其定义为

$$
\beta_{\mathrm{eff}}(S)=\frac{\mathbf 1^{\top}S\mathbf d(S)}{\mathbf 1^{\top}S\mathbf 1},\qquad \mathbf d(S):=S\mathbf 1.
$$

该代理反映拓扑层面的度异质性效应。在 $\mathbf 1^{\top}S\mathbf 1=a$ 下，$\beta_{\mathrm{eff}}(S)$ 与（GL-GENE-App）中的正则项 $\mathbf 1^{\top}S^2\mathbf 1$ 成正比。

单层问题（GL-GENE-App）因 $-\mathbf 1^{\top}S^2\mathbf 1$ 项一般仍非凸。因此我们聚焦直接最大化 $\mathbf 1^{\top}S^2\mathbf 1$ 的解，对应 $\lambda\gg1$ 的区制。这一观察引出如下结构刻画：

**命题 6.** 对任意 $S^{\star}\in\arg\max_{S\in\mathcal S_{\mathrm{nd}}}\mathbf 1^{\top}S^2\mathbf 1$，存在满足 $i^{\star}\neq j^{\star}$ 的一对 $(i^{\star},j^{\star})$，使

$$
S^{\star}_{ij}=\begin{cases}\dfrac{a}{2},&\text{若 }(i,j)=(i^{\star},j^{\star})\text{ 或 }(j^{\star},i^{\star}),\\[4pt]0,&\text{其他}.\end{cases}
$$

证明见附录 A-D。换言之，当 $\lambda\gg1$ 时，（GL-GENE-App）的每个最优解对应仅含一条双向边的图。与命题 4 一样，该结果应理解为大 $\lambda$ 区制下先验主导估计器的结构刻画，而非"真实 GRN 拓扑由这种单边结构恢复"的断言。实践中 $\lambda$ 适中，因此实际估计器在数据保真与促进韧性的偏差之间折中，而不会坍缩到极限的单边解。

### A. 函数先验作为广义图滤波器先验

我们最后尝试通过广义图滤波器先验的渠道解释函数先验。特别地，我们证明 GSO 的任意多项式正则项都可写成函数先验正则项。为便于讨论，先引入（1）中用于诱导所学图结构性质的图滤波器（GF）正则项概念。形式上

**定义 1.** 图滤波器（GF）正则项 $R_{\mathrm{GF}}:\mathbb R^{N\times N}\to\mathbb R$ 定义为

$$
R_{\mathrm{GF}}(S)=f\circ H(S).
$$

其中 $f:\mathbb R^{N\times N}\to\mathbb R$ 是线性算子，$H:\mathbb R^{N\times N}\to\mathbb R^{N\times N}$ 是线性图滤波器，定义为 $H(S)=h_0\mathbf I+\sum_{i=1}^{p}h_iS^i$，$p$ 为滤波器阶数，$\{h_i\}_{i=0}^{p}$ 为滤波器系数 [38]。

GF 正则项类足够一般，涵盖大多数结构正则项。考虑两个例子。

**例 1.** 结构正则项 $R(S)=\|S\|_F^2$ 常用于图学习表述 [6]。此时 $f(\cdot)=\operatorname{Tr}(\cdot)$，$H(S)=S^{\top}S$。

**例 2.** 谱正则项 $R(S)$ 用于调节图的聚类性质，可表示为 $S$ 的奇异值函数（如（7））[25]。注意对对称 GSO，$S$ 有特征分解 $S=U\Lambda U^{\top}$ 且 $H(S)=U\left(\sum_{i=1}^{N}h_i\Lambda^i\right)U^{\top}$。因此谱正则项可表示为 GF 正则项，取 $f(\cdot)=\operatorname{Tr}(\cdot)$ 并精心设计低通图滤波器 $H$ 以衰减 $S$ 奇异值的高通部分。

事实上，上述双层问题的近似形式，即（GL-NG-App）与（GL-GENE-App），也是 GF 正则项的特例。对命题 3 中的项 $-\mathbf 1^{\top}Sb$，取 $f(\cdot)=-\mathbf 1^{\top}(\cdot)\mathbf b$、$H(S)=S$；对命题 5 中的项 $-\mathbf 1^{\top}S^2\mathbf 1$，取 $f(\cdot)=-\mathbf 1^{\top}(\cdot)\mathbf 1$、$H(S)=S^2$。

最后以下述引理作结，它表明任意 GF 正则项都可写成函数先验正则项，且相应图学习问题可写成（16）的特例。

**引理 1.** 对任意 GF 正则项 $R_{\mathrm{GF}}(S)=f\circ H(S)$，存在 $Y:\mathbb R^N\times\mathbb R^{N\times N}\to\mathbb R^N$，使对所有 $S\in\mathbb R^{N\times N}$ 有

$$
R_{\mathrm{GF}}(S)=\mathbf 1^{\top}y(S)\tag{21}
$$

且 $y(S)$ 是 $Y(y;S)=0$ 的唯一解。

**证明.** 由 $f:\mathbb R^{N\times N}\to\mathbb R$ 为线性算子，Riesz 表示定理 [61] 表明存在常数矩阵 $Z\in\mathbb R^{N\times N}$，使 $f(H(S))=\operatorname{Tr}(Z^{\top}H(S))=\mathbf 1^{\top}y$，其中 $y=\operatorname{diag}(Z^{\top}H(S))$。因此可取 $Y(\cdot;S)$ 为映射 $Y(y;S)=y-\operatorname{diag}(Z^{\top}H(S))$。观察到所需条件（21）成立。$\square$

## VI. 数值实验

本节给出数值实验，验证所提利用网络博弈（第 III-A 节）与基因网络动态（第 III-B 节）诱导的函数先验的图学习方法。全程用 ROC 曲线下面积（AUC）作为评估拓扑恢复的主要指标；在相关时同时报告福利值与韧性值，以说明函数先验如何影响所学图结构。除另有说明，TTGD 的终止准则为

$$
\frac{\left\|S^{k+1}-S^{k}\right\|_F}{\max\left\{1,\left\|S^{k}\right\|_F\right\}}\leq10^{-6}.
$$

参数 $\beta$ 从网格 $\{1,5,10,50,100,200\}$ 中按验证 AUC 选取，每个实验分别选择。步长 $(\alpha,\gamma)$ 调至 TTGD 更新稳定，$c$ 固定以满足分析中的可行性与压缩要求。

### A. 网络博弈

本小节聚焦（GL-NG）中网络博弈诱导的先验。

**• 合成数据。** 第一个实验用合成随机图与合成图信号评估图学习性能。生成 PA 图，$N=50$ 个节点，每个新节点附一条边，附着到已有节点的概率正比于其度（按总度归一化），即 $P(i)=d_i/\sum_j d_j$。此外生成 ER 图，$N=50$、连接概率 0.1。关注数据有限的场景：只观测 $M=10\ll N$ 个平滑图信号。每个图信号通过低通图滤波器生成：$\mathbf x_m=\exp(\mathbf S/2)\mathbf u_m+\mathbf w_m$，其中 $\mathbf u_m\sim\mathcal N(0,\mathbf I)$ 为 i.i.d. 白噪声激励，$\mathbf w_m\sim\mathcal N(0,\omega^2\mathbf I)$ 为 i.i.d. 加性噪声（$\omega=0.2$）。对（GL-NG）固定 $(\beta,c)=(200,0.95)$。

把（GL-NG）与四种方法比较：(i) Smooth-GL 方法 [6]；(ii)（GL-NG-App）中的近似双层问题（记为 linear approx.）；(iii) QuadGame-GL 方法 [62]，从网络博弈模型学习网络结构；(iv) SpecTemp 方法 [12]，利用协方差矩阵的谱特征。对（GL-NG），网络博弈（10）与（11）用归一化边际收益向量 $\mathbf b=\max(\mathbf v_1,0)/\|\max\{\mathbf v_1,0\}\|_1$ 指定，其中 $\mathbf v_1$ 是 Euclidean 距离矩阵 $\mathbf D$ 的主特征向量，$D_{ij}=\|\mathbf x_i^{\mathrm{row}}-\mathbf x_j^{\mathrm{row}}\|_2^2$；并在（11）中取 $a=1$。

对 LQ 博弈（10），考虑两种交互函数 $f(x)=x$ 与 $f(x)=\log(1+x)$；对 RT 博弈（11），考虑交互函数 $g(x)=x(1-x)$。实验中双层优化问题用 TTGD 以下列步长求解：LQ 博弈 $f(x)=x$、$f(x)=\log(1+x)$ 取 $(\alpha,\gamma)=(0.5,0.003)$；RT 博弈 $g(x)=x(1-x)$ 取 $(\alpha,\gamma)=(0.1,0.0005)$。算法在 $f(x)=x$ 时迭代 700 次、$f(x)=\log(1+x)$ 时 195 次、$g(x)=x(1-x)$ 时 250 次后终止。

图 3 给出各图学习算法性能随正则化参数 $\lambda$ 的变化（20 次蒙特卡洛平均）。注意 $\lambda$ 增大时正则化图学习目标更依赖网络博弈先验，且据命题 4，（GL-NG）倾向于学到枢纽节点少的图拓扑。我们关注（GL-NG）的性能：对具枢纽结构的 PA 图，随 $\lambda$ 增大 AUC 显著提升；作为对照，缺少明显枢纽结构的 ER 图 AUC 提升有限。两类图的福利值都随 $\lambda$ 增大而持续提升。这些结果印证了命题 4：当 $M\ll N$ 时，（GL-NG）中的函数正则项促进枢纽结构并改善图学习性能。接着考察性能随样本量与网络规模的变化，见图 4。结果表明所提 $f(x)=x$ 的 GL-NG 模型具有一致的性能优势：其 AUC 随 $M$ 增大而稳步提升，且随 $N$ 增大仍明显优于竞争方法。

第二个实验考虑合成图信号观测，聚焦 $G$ 取 Karate Club 图（$N=34$ 个节点）。有 $M=50$ 个平滑图信号样本，由高斯马尔可夫随机场（GMRF）模型生成，精度矩阵取图 Laplacian [5]。目标是展示用 TTGD 求解双层问题（GL-NG）而非单层优化近似（GL-NG-App）的必要性。图 5 给出双层解与近似解的 Pareto 前沿（通过变化在 smooth-GL 目标 $J(S;X)$ 与 $\mathrm{Wel}(S)$ 之间折中的正则化参数 $\lambda$ 计算）。如预期，TTGD 算法在所有情形下都取得比近似解更好的 Pareto 前沿。

**• 真实数据：案例研究 I。** 在数据有限（$M\ll N$）的设定下，于两个真实社交网络数据集上评估 TTGD。Groningen 数据集含 $M=13$ 个信号，取自 1996 年 Groningen 大学学生友谊网络（$N=38$ 个节点）；信号刻画每个学生对社交活动（如听音乐会、看电影）的兴趣水平。取 $\beta=10$，定义 $\mathbf b$ 编码学习项目（Program=1 对应 4 年制，Program=2 对应 2 年制），并归一化 $\mathbf b=\mathbf b/\mathbf 1^{\top}\mathbf b$。Dutch 数据集含 $N=26$ 个节点与 $m=7$ 个信号，表示 2003—2004 年荷兰某学校青少年的友谊网络；信号度量负面行为（如偷窃或饮酒频率）。同样取 $\beta=10$，令 $\mathbf b$ 编码种族（Ethnicity=1 为荷兰裔，其余为 2），并相应归一化 $\mathbf b$。

表 II 给出通过调 $\lambda$ 得到的（GL-NG）类方法的最高 AUC 及对应福利值。可见两个数据集上（GL-NG）类方法在 AUC 与福利上都持续优于其他基准。具体地，Groningen 上采用交互 $f(x)=x$ 的 LQ 博弈诱导先验取得最佳 AUC；Dutch 上采用交互 $g(x)=x(1-x)$ 的 RT 博弈诱导先验取得最佳 AUC。注意我们预计不同真实网络数据可能本质上具有不同交互动力学；但（GLFP）框架通过纳入函数先验提升了性能。

**• 真实数据：案例研究 II。** 第二组真实数据实验考虑从印度村庄 [63] 的数据学习图拓扑。数据集含 40 个村庄的调查数据，每个村庄作为一个图由（GL-NG）学习。网络规模从 $N=77$ 到 $N=330$ 个 agent，每个网络观测 $M=16$ 个图信号样本。对（GL-NG）取 $\lambda=100$、$\beta=50$、$\mathbf b=\mathbf h+\mathbf 1$，其中 $h_i\in\{0,1\}$ 表示该 agent 是否为潜在小额信贷客户（对应数据集中的 'hhSurveyed'），并把 $\mathbf b$ 归一化使 $\mathbf b^{\top}\mathbf 1=1$。图 6 给出不同设置与算法学到图拓扑的 AUC 箱线图，与 [63] 报告的真实网络比较。可见（GL-NG）找到的解相对基准持续给出准确的图拓扑估计。表 III 报告相对真实值的社会福利最大/平均/最小增益。可见（GL-NG）学到的图在预设网络博弈模型下取得更高福利值，这与函数先验引导估计器趋向取得目标任务高分的结构一致（也见第 V 节）。结构恢复质量另用 AUC 评估。

### B. 基因调控动态

本小节聚焦（GL-GENE）中基因调控动态诱导的先验。

**• 合成数据（DREAM4）。** 第一个实验考虑 DREAM4 挑战的 In-Silico（即合成）数据。DREAM4 网络是来自 *E. coli*（RegulonDB 6.0 [64]）与 *S. cerevisiae* [65] 的精选转录调控网络的子网络，已移除所有自环。该数据集用于 DREAM4 网络推断挑战，含 $N=100$ 个基因与 $M=100$ 个扰动实验。注意 GRN 中敲除效应复杂，而数据拟合损失（4）是一种简化；本实验对应数据模型不精确的情形。下文取（GL-GENE）参数 $a=240$、$\beta=10$、$\sigma=1$。

我们还报告每个学到图拓扑在随机边删除下的韧性水平。通过以概率 $p\in\{0,0.1\}$ 从学到图中随机删除边模拟 $n_{\mathrm{per}}=200$ 次扰动，产生扰动拓扑集 $\hat S$，然后计算期望韧性指标 $\mathbb E[R_{\mathrm{ob}}(S)]=n_{\mathrm{per}}^{-1}\sum_{S\in\hat S}R_{\mathrm{ob}}(S)$。图 7 报告（GL-GENE）在 $\lambda$ 于 $[0,500]$ 内变化时找到的图拓扑的 AUC 及相应韧性值，说明随机边删除对韧性的影响。回顾在固定总权重约束 $\mathbf 1^{\top}S\mathbf 1=a$ 下，[29] 的拓扑层韧性代理退化为（GL-GENE-App）背后的同一基于度的得分，因此（GL-GENE-App）的经验性能可作为 [29] 所强调拓扑层机制的间接评估。作为基准，我们比较（GL-GENE-App）、岭回归 [39]、[40] 与真实拓扑的韧性。我们还在同一扰动-响应设定下测试了 Correlation 与 SmoothGL，其 DREAM4 AUC 值分别仅为 0.2363 与 0.2359。如预期，基于网络博弈的基线在该 GRN 设定下表现显著更差，这证实问题不仅在于基线的选择，而在于其建模范式与 GRN 数据的扰动-响应本质不匹配。为便于比较，对（GL-GENE-App）使用缩放正则化参数 $\hat\lambda=\lambda/1600$。从图中可见，所提 GL-GENE 方法及其近似都改善了所学图的 AUC 与鲁棒性；特别地，基于双层的方法取得更高的 AUC 与鲁棒性，证明把双层优化纳入推断过程的有效性。

**• 真实数据（DREAM5 *E. coli*）。** 第二个实验考虑 DREAM5 挑战 [66] 的 In-Vivo（即真实）数据。数据集含 *E. coli* 在多种扰动条件下的基因表达数据，$N=4511$ 个基因、$M=56$ 种扰动条件。稳态表达水平视为观测数据，记为 $\mathbf X\in\mathbb R^{4511\times56}$。取（GL-GENE）参数 $a=3500$、$\beta=1$、$\sigma=100$。注意 $N=4511$ 时计算 TTGD 中的矩阵逆可能计算量过大，因此本实验用（18）中方阵 $J_yY$ 的对角近似，称为 DA-GLFP（参见注 1）。（GL-GENE-App）、（GL-GENE）与 DA-GLFP 的 $y$、$S$ 初始化都取岭回归输出。各算法运行 5000 次迭代。在配备 Apple M1 Pro 的笔记本电脑上，（GL-GENE）耗时 93 分钟，而岭回归仅 44 分钟、（GL-GENE-App）47 分钟、DA-GLFP 48 分钟。本设定忽略 GLASSO，因为程序在 4 小时内未完成。

通过与 DREAM5 金标准（代表基因调控网络的一个子集）比较评估推断性能。金标准视为无权有向支持，推断的连续边权直接用作排序分数。所有预测边按推断权重排序，并按 DREAM5 协议用前 $10^5$ 条连边计算 AUC。为评估所学图拓扑的鲁棒性，报告每个学到图拓扑的 $R_{\mathrm{ob}}(S)$ 值。此外通过以概率 $p=0.1$ 从学到图中随机删除边模拟 $n_{\mathrm{per}}=50$ 次扰动，形成扰动集 $\hat S$。

图 8 给出随 $\lambda$ 增大各算法的性能。（GL-GENE-App）中的正则化参数 $\hat\lambda$ 相对（GL-GENE）缩放，取 $\hat\lambda=\lambda/240000$。可见所提 GL-GENE 方法及其近似在较大 $\lambda$ 范围内 AUC 都优于原始岭回归。所有方法中，基于双层的方法（GL-GENE）在 AUC 与韧性之间给出最佳折中。然而近似方法（GL-GENE-App）所学拓扑的韧性在不同运行间波动；相比之下，DA-GLFP 虽略差于（GL-GENE），但其韧性比（GL-GENE-App）更稳定。这与上述模型失配解释一致：为平滑图信号或网络博弈诱导函数先验设计的现成基线，与扰动-响应型 GRN 数据并不匹配，故性能显著更差。

## VII. 结论

我们提出一种用于图拓扑学习的函数先验框架。所提框架纳入隐式正则项，导出双层优化表述。我们开发 TTGD 算法，并在论文所述正则条件下给出可证明的收敛保证。理论分析与实验结果表明，函数先验能诱导期望性质并优于传统结构先验。我们的工作还开辟两个有趣的未来研究方向：(i) 建立覆盖下层动态多均衡设定的收敛理论；(ii) 为函数先验估计器建立一致性保证。

## 图注与表注

### 表 I：测试网络拓扑与随机重连影响（原 PDF 第 5 页）

上：若干测试网络的拓扑可视化（Karate、WikiVote(partial)、Dolphin）。下：随机重连后福利比的下降（cf. [12]）。

| 重连比例 | 10% | 30% | 50% |
|---|---|---|---|
| Karate | 94.06% | 84.72% | 78.30% |
| WikiVote | 96.28% | 90.32% | 86.11% |
| LesMiserables | 93.79% | 84.43% | 78.56% |
| JazzMusician | 97.43% | 93.47% | 90.77% |
| SchoolNet | 97.28% | 93.47% | 91.20% |
| MalawiVillage | 96.72% | 91.82% | 88.61% |
| Dolphins | 98.15% | 95.13% | 93.08% |
| Ant | 98.23% | 95.90% | 94.61% |
| Weaver | 99.43% | 98.49% | 97.80% |

### 表 II：Groningen 与 Dutch 上不同图学习模型的 AUC 与福利比较（原 PDF 第 11 页）

| 方法 | AUC | Wel(S) | x 下的 Wel(S) | log(1+x) 下的 Wel(S) | x(1−x) 下的 Wel(S) |
|---|---|---|---|---|---|
| **Groningen 数据集** | | | | | |
| GL-NG ($f(x)=x$) | 0.6357 | 27.7721 | 8.7035 | 5.9668 | |
| GL-NG ($f(x)=\log(1+x)$) | 0.6207 | 26.5906 | 8.6225 | 5.9557 | |
| GL-NG ($g(x)=x(1-x)$) | 0.6201 | 26.5722 | 8.6432 | 5.9739 | |
| Linear Approx | 0.5354 | 20.0577 | 7.5192 | 5.4005 | |
| Smooth-GL [6] | 0.5354 | 20.0566 | 7.5190 | 5.4003 | |
| QuadGame-GL [62] | 0.5490 | 14.5312 | 5.7325 | 4.2091 | |
| SpecTemp [12] | 0.4890 | 19.7591 | 7.4576 | 5.3658 | |
| Glasso [4] | 0.5617 | 16.6454 | 6.4513 | 4.6939 | |
| **Dutch 数据集** | | | | | |
| GL-NG ($f(x)=x$) | 0.6127 | 21.3681 | 6.7664 | 4.6940 | |
| GL-NG ($f(x)=\log(1+x)$) | 0.6159 | 22.5223 | 6.9465 | 4.7810 | |
| GL-NG ($g(x)=x(1-x)$) | 0.6186 | 23.0427 | 7.0260 | 4.8187 | |
| Linear Approx | 0.6186 | 21.4615 | 6.7831 | 4.7030 | |
| Smooth-GL [6] | 0.5840 | 18.6902 | 6.3571 | 4.6357 | |
| QuadGame-GL [62] | 0.6048 | 18.3942 | 5.9083 | 4.1413 | |
| SpecTemp [12] | 0.4828 | 20.6126 | 6.6480 | 4.6357 | |
| Glasso [4] | 0.5786 | 18.1852 | 5.3394 | 2.7934 | |

### 表 III：印度村庄数据 [63] 中所学图的社会福利增益（原 PDF 第 12 页）

三块分别报告在交互函数 $f(x)=x$、$f(x)=\log(1+x)$ 与 $g(x)=x(1-x)$ 下评估的福利增益（相对真值 $\mathrm{Wel}(S^{\mathrm{true}})$）。

| 方法 | 最大 | 平均 | 最小 |
|---|---|---|---|
| **GL-NG ($f(x)=x$)** | 4.2754 | 3.2077 | 2.1693 |
| Linear Approx. | −0.4790 | −1.4241 | −2.3927 |
| Smooth-GL [6] | −2.3288 | −5.8141 | −8.6115 |
| QuadGame-GL [62] | −1.9386 | −3.5631 | −5.5949 |
| SpecTemp [12] | 0.2653 | −2.8122 | −6.6532 |
| Glasso [4] | −0.7666 | −4.1383 | −10.3377 |
| Correlation | −2.6829 | −3.3693 | −4.4143 |
| **GL-NG ($f(x)=\log(1+x)$)** | 1.4464 | 1.1892 | 0.8461 |
| Linear Approx. | −0.0676 | −0.6144 | −1.1429 |
| Smooth-GL [6] | −0.5440 | −2.8292 | −5.0419 |
| QuadGame-GL [62] | −0.8206 | −1.6814 | −3.3074 |
| SpecTemp [12] | 0.1453 | −1.2226 | −3.6324 |
| Glasso [4] | −0.3700 | −2.0347 | −4.9003 |
| Correlation | −0.7413 | −1.4614 | −1.9076 |
| **GL-NG ($g(x)=x(1-x)$)** | 1.0312 | 0.7769 | 0.5476 |
| Linear Approx. | −0.0292 | −0.4454 | −0.9317 |
| Smooth-GL [6] | −0.4165 | −1.0737 | −1.7126 |
| QuadGame-GL [62] | −0.5334 | −1.2174 | −2.5642 |
| SpecTemp [12] | 0.1147 | −0.8539 | −2.6901 |
| Glasso [4] | −0.2443 | −1.4959 | −3.7367 |
| Correlation | −0.4475 | −1.0201 | −1.3848 |

### 图注

**图 1（原 PDF 第 2 页）：** 图拓扑双层优化框架概览：下层在候选拓扑上求解任务，上层在数据拟合与任务性能之间折中。

**图 2（原 PDF 第 6 页）：** *E. coli* 中基因调控网络的韧性 [29]。横轴 $p_{\mathrm{perturb}}$ 为连边损失比例。左：扰动图上平均的 $R_{\mathrm{ob}}(\hat S)/2$；右：存活率，即扰动后仍保持非零稳态的图的比例。

**图 3（原 PDF 第 10 页）：** 用 TTGD 学习 PA 图（上）与 ER 图（下）时（GL-NG）的性能。左：AUC 分数；右：社会福利值。图例包括 Smooth-GL [6]、Linear Approx.（GL-NG-App）、QuadGame-GL [62]、SpecTemp [12]、GL-NG（$f(x)=x$）、GL-NG（$f(x)=\log(1+x)$）、GL-NG（$g(x)=x(1-x)$）。

**图 4（原 PDF 第 10 页）：** TTGD 应用于 PA 图上（GL-NG）的性能。左：$N=50$ 时 AUC 随 $M$ 的变化；右：$M=10$ 时 AUC 随 $N$ 的变化；两图均取 $\lambda=10$。图例包括 Smooth-GL [6]、Linear Approx.、GL-NG（三种先验）。

**图 5（原 PDF 第 11 页）：** （GL-NG）中社会福利 $\mathrm{Wel}(S)=\mathbf 1^{\top}y^{\mathrm{NE}}(S)$ 与数据保真项 $J(S;X)$ 的对比。左：先验 $f(x)=\log(1+x)$；中：先验 $f(x)=x$；右：先验 $g(x)=x(1-x)$。

**图 6（原 PDF 第 11 页）：** 由 IndianVillage [63] 数据学到图的 AUC 性能比较（箱线图）。

**图 7（原 PDF 第 12 页）：** 各算法在 DREAM4 上的性能。左：AUC；右：期望韧性指标 $\mathbb E[R_{\mathrm{ob}}(\hat S)]$ 随 $\lambda$ 的变化；虚线表示 $p=0.1$ 的扰动集。图例包括 GroundTruth、GL-GENE、GL-GENE-App、Ridge、SpecTemp [12]、Glasso [4]。

**图 8（原 PDF 第 12 页）：** 各算法在 DREAM5 上的性能。左：AUC；右：期望韧性指标 $\mathbb E[R_{\mathrm{ob}}(\hat S)]$ 随 $\lambda$ 的变化；虚线表示 $p=0.1$ 的扰动集。图例包括 Ridge、GL-GENE、GL-GENE-App、DA-GLFP、Smooth-GL [6]、SpecTemp [12]、Correlation。

## 附录 A：结构解释的证明（原 PDF 第 13—14 页）

### A. 命题 3 的证明

由于 $y^{\mathrm{NE}}(S)$ 位于 $\mathcal Y$ 的内部，它也是 $y=\mathbf eT(y;S)$ 的解，其中 $\mathbf eT_i(y;S):=\arg\max_{y_i}U_i(y_i,y_{-i};S)$ 是无约束最佳响应映射。于是 $f$、$g$ 的 Lipschitz 性与正性意味着对任意 $S\in\mathcal S_{\mathrm{ng}}$ 有 $0\leq y^{\mathrm{NE}}\leq\ell_1Sy^{\mathrm{NE}}+\mathbf b$。由于 $S\geq0$ 且行和为 $S\mathbf 1=c\mathbf 1$，有 $\|S\|_\infty=c$。对上述逐分量不等式两边取 $\infty$-范数得

$$
\left\|y^{\mathrm{NE}}\right\|_\infty\leq c\ell_1\left\|y^{\mathrm{NE}}\right\|_\infty+\|\mathbf b\|_\infty,
$$

从而 $\|y^{\mathrm{NE}}(S)\|_\infty\leq\|\mathbf b\|_\infty/(1-c\ell_1)$。由 $\|\cdot\|_2\leq\sqrt N\|\cdot\|_\infty$ 得

$$
\left\|y^{\mathrm{NE}}(S)\right\|_2\leq\frac{\sqrt N\|\mathbf b\|_\infty}{1-c\ell_1}.
$$

由于 $c\ell_1<1$，对逐分量界 $y^{\mathrm{NE}}\leq\ell_1Sy^{\mathrm{NE}}+\mathbf b$ 迭代并用 $(S^k\mathbf b)_i\leq c^k\|\mathbf b\|_\infty$（$S\in\mathcal S_{\mathrm{ng}}$）得

$$
y^{\star}\leq(I+\ell_1S)\mathbf b+\|\mathbf b\|_\infty\left((c\ell_1)^2+(c\ell_1)^3+\cdots\right)\mathbf 1=(I+\ell_1S)\mathbf b+(1-c\ell_1)^{-1}(c\ell_1)^2\|\mathbf b\|_\infty\mathbf 1.
$$

因此，对任意 $S\in\mathcal S_{\mathrm{ng}}$，

$$
\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\lambda\mathbf 1^{\top}y^{\star}(S)\geq\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\lambda\ell_1\mathbf 1^{\top}Sb-\lambda\mathbf 1^{\top}\bar{\mathbf c},
$$

其中 $\bar{\mathbf c}=\frac{(c\ell_1)^2}{1-c\ell_1}\|\mathbf b\|_\infty\mathbf 1+\mathbf b$。这证明了（20）的第一部分。

另一方面，存在 $\mu_1\leq\ell_1$，使对任意 $S\in\mathcal S_{\mathrm{ng}}$ 有 $y^{\star}\geq\mu_1Sy^{\star}+\mathbf b$。递归可得

$$
y^{\star}\geq(I+\mu_1S)\mathbf b+b^{\star}\left((c\mu_1)^2+(c\mu_1)^3+\cdots\right)\mathbf 1=(I+\mu_1S)\mathbf b+(1-c\mu_1)^{-1}(c\mu_1)^2b^{\star}\mathbf 1.
$$

因此对任意 $S\in\mathcal S_{\mathrm{ng}}$ 有

$$
\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\lambda\mathbf 1^{\top}y^{\star}(S)\leq\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\lambda\mu_1\mathbf 1^{\top}Sb-\lambda\mathbf 1^{\top}\hat{\mathbf c},
$$

其中 $\hat{\mathbf c}=\frac{(c\mu_1)^2}{1-c\mu_1}b^{\star}\mathbf 1+\mathbf b$。这证明了（20）的第二部分。

### B. 命题 4 的证明

引入对偶变量 $\lambda\in\mathbb R$、$\eta\in\mathbb R^N$、$\mathbf h\in\mathbb R^N$、$\boldsymbol\mu\in\mathbb R^{N\times N}_+$，（GL-NG-App）的拉格朗日函数为

$$
\mathcal L(S,\lambda,\eta,\boldsymbol\mu,\mathbf h)=\operatorname{Tr}(S^{\top}D)+\beta\|S\|_F^2-\tilde\lambda\mathbf 1^{\top}Sb-\eta^{\top}(S\mathbf 1-c\mathbf 1)-\langle\boldsymbol\mu,S\rangle-\sum_{i=1}^{N}h_i\mathbf e_i^{\top}S\mathbf e_i.
$$

（GL-NG-App）的一阶必要条件给出

$$
D+2\beta S-\tilde\lambda\mathbf 1\mathbf b^{\top}-\boldsymbol\mu-\eta\mathbf 1^{\top}-\operatorname{Diag}(\mathbf h)=0,
$$

而互补松弛条件给出 $S_{ij}\mu_{ij}=0$。结合 $S\geq0$，对 $i\neq j$ 有两种情形：

**情形 1.** 若 $S_{ij}>0$，则必有 $\mu_{ij}=0$，从而 $S_{ij}=(2\beta)^{-1}(-D_{ij}+\tilde\lambda b_j+\eta_i)$。

**情形 2.** 若 $S_{ij}=0$，则由 $\mu_{ij}\geq0$ 得 $-D_{ij}+\tilde\lambda b_j+\eta_i\leq0$。

考察两种情形即得所述 $S^{\star}_{ij}$ 表达式。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
