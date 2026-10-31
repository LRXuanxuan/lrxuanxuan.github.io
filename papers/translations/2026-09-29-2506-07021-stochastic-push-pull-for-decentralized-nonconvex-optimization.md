---
layout: page
title: "去中心化非凸优化的随机推拉方法｜中文全文译文"
permalink: /papers/translations/2026-09-29-2506-07021-stochastic-push-pull-for-decentralized-nonconvex-optimization/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/5a3ee963c993424b/) · [原文 arXiv](https://arxiv.org/abs/2506.07021) · [全部目录](/papers/catalog/)

# 去中心化非凸优化的随机推拉方法

**原题：** Stochastic Push–Pull for Decentralized Nonconvex Optimization  
**作者：** Runze You、Shi Pu（香港中文大学（深圳）数据科学学院）  
**版本：** arXiv:2506.07021v1（math.OC），2025 年 6 月 8 日提交，原文 29 页（预印本版式）。  
**范围与状态：** 全文中文译稿：摘要、正文第 1—6 节、算法 1、图 1—图 3、参考文献（英文原条目）与附录 A.1—A.9 按原文结构录入；原文无表格；逐句逐式终校未做。附录中篇幅极大的纯代数展开按原文步骤结构给出关键不等式与最终界，详见页尾说明。

## 摘要

为理解**随机推拉方法**（Stochastic Push-Pull，即使用随机梯度的 Push-Pull 方法）在去中心化优化中的收敛行为，本文给出一个全面分析。具体地，首先澄清该算法所依赖的基本假设，特别是关于网络结构与权重矩阵的假设。随后，为在光滑非凸目标下建立收敛速率，本文提出一个通用分析框架；该框架不仅涵盖一大类去中心化优化算法，而且可以**恢复或改进**分布式随机梯度跟踪（DSGT）方法的若干最新结果。一个关键亮点是导出了**随机推拉算法实现线性加速的充分条件**——达到与集中式随机梯度方法相同的可扩展性；这一结果此前未见报道。大量数值实验验证了理论发现，展示了该算法在多种去中心化优化场景下的有效性与稳健性。

## 1 引言

考虑由网络连接的 $n$ 个智能体／节点构成集合 $\mathcal N=\{1,2,\cdots,n\}$。每个节点拥有自己的局部代价函数 $f_i:\mathbb R^{p}\to\mathbb R$。全局目标为寻找使所有代价函数平均最小的 $x\in\mathbb R^{p}$，即

$$
\min_{x\in\mathbb R^{p}}\ f(x):=\frac{1}{n}\sum_{i=1}^{n}f_i(x),\tag{1}
$$

其中 $f_i(x):=\mathbb E_{\xi_i\sim\mathcal D_i}F_i(x;\xi_i)$。函数 $f_i(x)$ 保存在节点 $i$ 上，$\mathcal D_i$ 表示节点 $i$ 本地存储的样本 $\xi_i$ 的分布。若各局部分布 $\{\mathcal D_i\}_{i=1}^{n}$ 不相同，则存在**数据异质性**。上述表述也覆盖经验风险最小化（ERM），此时每个 $\mathcal D_i$ 表示一个局部训练数据集。

以去中心化方式在多智能体网络上求解问题 (1) 近年来受到广泛关注，部分原因是去中心化有助于缓解集中式计算架构中中央服务器的高时延 [20]、[2]、[17]。在去中心化设置中，各智能体构成特定网络拓扑（例如环图、网格图、指数图），并且仅在直接相邻节点之间本地交换信息 [22]、[3]、[20]。这种通信模式大幅降低通信开销，也适用于某些智能体只能访问网络一部分的场景（例如由于功率范围不同或物理限制）[40]。

区分去中心化优化方法与集中式方法的关键因素是**通信图**（即网络拓扑）。图结构显著影响收敛速率：更稠密的拓扑（例如指数图）通常比更稀疏的结构（例如环图）具有更快的收敛速度 [26]、[20]。

值得注意的是，在随机梯度设置下，已有若干去中心化算法被证明最终能达到集中式方法的收敛速率（即**线性加速**），但需要先经历一段**瞬态期** [25]、[26]、[14]、[34]、[41]。瞬态迭代次数受底层网络拓扑的强烈影响，因此是衡量算法效率的关键指标。

评估网络拓扑影响的常用分析工具是与权重矩阵相关的**谱隙**，尤其当该矩阵为双随机矩阵时 [20]、[26]、[8]、[1]。不过，也已出现多种替代分析策略来刻画去中心化算法在更复杂网络结构（有向图）上的性能，例如（随机）梯度推方法 [18]、[19]、[2]、[33]、SONATA [35]、[30]、[11]、Push-DIGing/ADD-OPT [21]、[15]，以及 Push-Pull/AB [27]、[37]、[39]、[38]。

本文提出一个基于一组无穷和的通用分析框架，用于研究 Push-Pull 算法在随机梯度下的收敛行为（即随机推拉）。这一新方法使算法能够得到全面的收敛分析，并能有效涵盖去中心化随机梯度跟踪（DSGT）方法的多种最新结果，而不再受谱隙分析的限制。此外，本文给出算法实现线性加速的充分条件，达到与集中式随机梯度方法相同的可扩展性。最后，本文通过数值实验验证理论发现。

### 1.1 相关工作

去中心化随机梯度下降（DSGD）及其变体 [14]、[26]、[41]、[10] 在大规模分布式训练中受到广泛关注。尽管这些方法灵活且通常有效，它们在处理数据异质性时往往遇到困难 [9]。这一挑战推动了更先进算法的发展，例如 EXTRA [31]、Exact-Diffusion/D² [13]、[34]、[7]、[44]，以及基于梯度跟踪的方法 [24]、[8]。

多数去中心化随机梯度算法依赖通信图权重矩阵的特定约束（例如双随机性），而这些约束对一般有向图可能难以甚至无法满足 [4]。相比之下，次梯度推（subgradient-push，SGP）[18]、[19]、[2]、SONATA [35]、[30] 以及 Push-DIGing/ADD-OPT [21]、[36]、[15] 等方法使用列随机和／或行随机权重矩阵，从而能够在强连通有向图上实现一致性优化。若干算法（包括 [2]、[33]、[15] 中的算法）已被证明在迭代次数足够大时具有线性加速。特别地，文献 [15] 引入一个新的度量，用以刻画列随机混合矩阵对去中心化随机梯度算法的影响。

另一类在一般有向图上被广泛研究的优化方法，是最初针对确定性梯度下强凸目标设计的 Push-Pull/AB 方法 [37]、[27]、[38]。该算法可在两个分离的子图上运行 [27]，每个子图包含一棵（反向）生成树，且两棵树共享同一个根。近年来，涌现出一大类面向不同场景的 Push-Pull 方法：例如 [39]、[45] 研究光滑强凸目标下带随机梯度的 Push-Pull 性能；[46] 把 Push-Pull 推广到异步设置；[29]、[23] 提出适应时变图的 Push-Pull/AB 变体；[32]、[16] 提出带压缩通信的改进版本。注意这些方法常常附加更多条件，例如权重矩阵的对角元素必须为正。

尽管 Push-Pull 方法取得了成功，其随机梯度下的收敛行为研究仍较少。多数现有工作尚未为随机推拉建立可与集中式 SGD 或 push-sum 类算法相比拟的收敛保证 [39]、[45]、[23]、[46]。例如，虽然 [45] 首次证明了光滑强凸目标下带随机梯度的 Push-Pull/AB 具有 $O(1/t)$ 收敛速率，但该速率对问题参数的依赖关系仍不清楚。近期工作 [42]、[43] 证明了随机推拉具有线性加速性质并给出显式的瞬态迭代复杂度，但其结果严重依赖对通信结构的**全局知识**来构造合适的生成树，这在某些应用中并不实际。

### 1.2 主要贡献

本文研究在一般有向图上最小化光滑非凸目标的**随机推拉（S-PP）**算法。首先给出对其基本假设（特别是与权重矩阵相关者）的扩展分析，随后给出细致且新颖的收敛性研究。

本文主要贡献概括如下：

- 本文详细讨论随机推拉（S-PP）算法的基本假设，特别强调网络结构与权重矩阵方面的假设；该讨论是对既有工作的推广。
- 本文分析引入一个适用于一大类分布式随机梯度算法的通用分析框架。与依赖谱隙的传统方法不同，该框架借助一系列有限和来精确刻画算法收敛性；这一方法对分析有向、非平衡图（例如 Erdos–Renyi 图 [20] 与多子环（Multi-Sub-Ring）图 [43]）上的性能尤为有效。
- 本文证明：在光滑非凸目标下，S-PP 一般具有 $O(1/\sqrt{T})$ 收敛速率，且系数显式。特别地，本文首次证明：当混合矩阵为双随机（但不必对称）、从而与平衡有向图相容时，去中心化随机梯度跟踪（DSGT）方法可实现**线性加速**（见注记 4.1）。对于可使用对称混合矩阵的无向图，S-PP 的收敛结果可恢复和／或改进 DSGT 的最新结果 [1]、[8]（见注记 4.2）。
- 本文建立 S-PP 算法实现线性加速的充分条件，达到集中式随机梯度方法的可扩展性——这一结果此前未见报道。该条件适用于多种使用不同通信图与权重矩阵构造策略的现有随机梯度跟踪方法，包括 [1]、[8]、[42]、[43] 中的方法。
- 数值实验表明 S-PP 在多种去中心化优化场景下都高效且稳健。

### 1.3 记号

本文中若无特别说明，所有向量均为列向量。每个节点 $i$ 维护决策变量的本地副本 $x_i\in\mathbb R^{p}$ 与辅助变量 $y_i\in\mathbb R^{p}$。其在第 $t$ 次迭代的取值分别记为 $x_i^{(t)}$、$y_i^{(t)}$，并定义

$$
\mathbf X=[x_1,x_2,\cdots,x_n]^{T}\in\mathbb R^{n\times p},\qquad
\mathbf Y=[y_1,y_2,\cdots,y_n]^{T}\in\mathbb R^{n\times p}.
$$

同时定义聚合梯度

$$
\nabla\mathbf F(\mathbf X):=[\nabla f_1(x_1),\nabla f_2(x_2),\cdots,\nabla f_n(x_n)]^{T}\in\mathbb R^{n\times p}.
$$

给定 $x_i\in\mathbb R^{p}$，每个智能体 $i$ 能查询随机梯度 $g_i:=g_i(x_i,\xi_i)$，其中 $\xi_i$ 表示某个独立随机变量。令

$$
\boldsymbol\xi=[\xi_1,\xi_2,\cdots,\xi_n]^{T},\qquad
\mathbf G(\mathbf X,\boldsymbol\xi):=[g_1(x_1,\xi_1),\cdots,g_n(x_n,\xi_n)]^{T}\in\mathbb R^{n\times p}.
$$

记 $\mathbf 1$ 为全 1 列向量。为方便，采用记号 $\nabla\mathbf F^{(t)}:=\nabla\mathbf F(\mathbf X^{(t)})$ 与 $\mathbf G^{(t)}:=\mathbf G(\mathbf X^{(t)},\boldsymbol\xi^{(t)})$。记 $\langle a,b\rangle$ 为向量 $a,b\in\mathbb R^{p}$ 的内积。$\lVert\cdot\rVert_2$ 与 $\lVert\cdot\rVert_F$ 分别表示矩阵的谱范数与 Frobenius 范数；对向量，这两个范数退化为欧氏范数 $\lVert\cdot\rVert$。全文采用约定：任意矩阵的零次幂为相应维度的单位阵；任何上限小于下限的求和等于零。此外，$a\lesssim b$ 表示存在某个数值常数 $C$ 使 $a\le Cb$。

考虑由 $n$ 个工作者组成的网络，在有向图 $\mathcal G=(\mathcal N,\mathcal E)$ 上协作求解问题 (1)。这里 $\mathcal N=\{1,2,\cdots,n\}$ 为节点集合，$\mathcal E\subseteq\mathcal N\times\mathcal N$ 为有向边集合。边 $(j,i)\in\mathcal E$ 表示节点 $j$ 可直接向节点 $i$ 发送信息。

令 $\mathbf W=[w_{ij}]\in\mathbb R^{n\times n}$ 为非负矩阵。定义其诱导图 $\mathcal G_{\mathbf W}$：当且仅当 $w_{ji}>0$ 时 $(i,j)\in\mathcal E_{\mathbf W}$。对每个节点 $i$，分别定义入邻域与出邻域为 $\mathcal N^{\mathrm{in}}_{\mathbf W,i}:=\{j\mid w_{ij}>0,\ j\in\mathcal N\}$ 与 $\mathcal N^{\mathrm{out}}_{\mathbf W,i}:=\{j\mid w_{ji}>0,\ j\in\mathcal N\}$。进一步令 $\mathcal R_{\mathbf W}$ 为图 $\mathcal G_{\mathbf W}$ 中所有可能生成树的根集合。

### 1.4 组织结构

本文余下部分安排如下：第 2 节介绍基本假设与主要算法；第 3 节进行收敛性分析；第 4 节给出收敛结果；第 5 节展示数值实验；第 6 节总结全文。

## 2 预备

本节先在第 2.1 小节引入基本假设并作必要讨论，随后在第 2.2 小节给出随机推拉（S-PP）算法。

### 2.1 假设

下面引入所考虑 S-PP 算法的基本假设，它们也支撑后续分析。首先，假设 2.1 规定通信图的结构，该要求与现有文献的标准做法一致 [27]、[45]、[46]。其次，假设 2.4 给出关于权重矩阵的条件：与要求对角元严格为正的既有方法 [27]、[45]、[46] 不同，本文把要求放松为**指数衰减**性质（定义 2.3），从而扩大可允许的加权方案类别、增强网络设计的灵活性。假设 2.7 与 2.8 是随机梯度算法分析中的标准假设 [14]、[41]、[42]。

按文献 [27] 的做法，先规定 S-PP 所用两个（可以相同的）图的条件。两个图 $\mathcal G_R$ 与 $\mathcal G_C$ 分别对应两个矩阵 $\mathbf R$ 与 $\mathbf C$，后文将讨论。

**假设 2.1（通信图）。** 图 $\mathcal G_R$ 与 $\mathcal G_{\mathbf C^{T}}$（脚注：图 $\mathcal G_{\mathbf C^{T}}$ 本质上就是 $\mathcal G_{\mathbf C}$ 把所有边反向）各自至少包含一棵生成树，且存在至少一对生成树（一棵在 $\mathcal G_R$ 中、一棵在 $\mathcal G_{\mathbf C^{T}}$ 中）共享同一个根。等价地，有 $\mathcal R:=\mathcal R_{\mathbf R}\cap\mathcal R_{\mathbf C^{T}}\ne\varnothing$ 且 $r:=|\mathcal R|\ge1$。

下面引入刻画权重矩阵条件的定义。

**定义 2.2（根特征向量）。** 设 $\mathbf A\in\mathbb R^{n\times n}$ 为非负行随机矩阵。与特征值 1 相关联的非负单位左特征向量 $\boldsymbol\pi_{\mathbf A}$（即 $\boldsymbol\pi_{\mathbf A}^{T}\mathbf A=\boldsymbol\pi_{\mathbf A}^{T}$、$\boldsymbol\pi_{\mathbf A}\ge\mathbf 0$、$\lVert\boldsymbol\pi_{\mathbf A}\rVert_1=1$）称为 $\mathbf A$ 的**根特征向量**，若对所有 $i\notin\mathcal R_{\mathbf A}$ 有第 $i$ 个元素 $\pi_{\mathbf A}(i)=0$。

**定义 2.3（指数衰减）。** 若非负行随机矩阵 $\mathbf A\in\mathbb R^{n\times n}$ 存在常数 $\alpha\in(0,1)$、整数 $m>0$ 与一个根特征向量 $\boldsymbol\pi_{\mathbf A}$，使得对所有 $t\ge m$ 有 $\lVert\mathbf A^{t}-\mathbf 1\boldsymbol\pi_{\mathbf A}^{T}\rVert_2\le\alpha^{t}$，则称 $\mathbf A$ 是**指数衰减**的。

**注记 2.1。** 可以观察到，对满足 $\lVert\mathbf W-\mathbf 1\mathbf 1^{T}/n\rVert_2<1$ 的双随机矩阵 $\mathbf W$，向量 $\mathbf 1/n$ 既是根特征向量、又是与特征值 1 对应的右特征向量。因而 $\mathbf W$ 具有指数衰减性质，参数为 $m=1$、$\alpha=\lVert\mathbf W-\mathbf 1\mathbf 1^{T}/n\rVert_2$。为简单起见，后文提到满足假设 2.4 的双随机矩阵 $\mathbf W$ 时，不再显式陈述该条件。

**假设 2.4（权重矩阵）。** 矩阵 $\mathbf R$ 行随机、矩阵 $\mathbf C$ 列随机，即 $\mathbf R\mathbf 1=\mathbf 1$、$\mathbf C^{T}\mathbf 1=\mathbf 1$。此外，$\mathbf R$ 与 $\mathbf C^{T}$ 均指数衰减。

由上述假设可得到关于节点间信息流的关键结果。

**引理 2.5。** 在假设 2.1 与 2.4 下，权重矩阵 $\mathbf R$ 有唯一根特征向量 $\boldsymbol\pi_{\mathbf R}^{T}$，$\mathbf C^{T}$ 有唯一根特征向量 $\boldsymbol\pi_{\mathbf C}^{T}$。此外 $\boldsymbol\pi_{\mathbf R}^{T}\boldsymbol\pi_{\mathbf C}>0$。

**证明：** 见附录 A.1。

假设 2.1 与 2.4 给出确保节点间信息流畅通的最低要求。相比之下，许多现有算法（如 [14]、[37]、[41]、[13]、[20]）要求通信图强连通，限制了架构设计的灵活性；而且与 Push-Pull 相关的早期工作（如 [27]、[45]、[46]）常要求权重矩阵 $\mathbf R$ 与 $\mathbf C$ 的对角元严格为正，而不采用假设 2.4 引入的指数衰减性质。下文引理 2.6 将正式说明指数衰减是更弱的条件：它确实允许更灵活地选择 $\mathbf R$ 与 $\mathbf C$。满足假设 2.4 但可能不具有严格正对角元的混合矩阵示例包括任意双随机矩阵、由 B 叉树族 [42] 或任意生成树 [43] 诱导的 $(0,1)$-混合矩阵等。

**引理 2.6。** 给定非负行随机矩阵 $\mathbf A$，其对角元为正。假设其诱导图 $\mathcal G_{\mathbf A}$ 至少包含一棵生成树，则 $\mathbf A$ 具有指数衰减性，其根特征向量记为 $\boldsymbol\pi^{T}$。更具体地，存在仅与 $\mathbf A$ 有关的正整数 $m_{\mathbf A}$，使得对任意 $m\ge m_{\mathbf A}$ 有

$$
\left\lVert\mathbf A^{m}-\mathbf 1\boldsymbol\pi^{T}\right\rVert_2\le(1-p)^{m},
$$

其中 $p=\frac{1}{2}(1-\lambda)\in(0,1)$，$\lambda$ 为 $\mathbf A$ 按模计算的第二大特征值。

**证明：** 见附录 A.2。

关于随机梯度，采用如下标准假设。

**假设 2.7。** 给定 $x\in\mathbb R^{p}$，每个节点 $i\in\mathcal N$ 能获得带噪梯度 $g(x,\xi_i)$，其中随机向量 $\xi_i\sim\mathcal D_i$ 在 $i\in\mathcal N$ 之间相互独立；此外存在 $\sigma^{2}>0$ 使

$$
\mathbb E_{\xi_i\sim\mathcal D_i}\{g_i(x,\xi_i)\mid x\}=\nabla f_i(x),\qquad
\mathbb E_{\xi_i\sim\mathcal D_i}\left\{\lVert g_i(x,\xi_i)-\nabla f_i(x)\rVert^{2}\mid x\right\}\le\sigma^{2}.
$$

随机梯度出现在分布式在线学习、强化学习、生成建模与参数估计等多个领域（参见 [42]、[14]、[24]、[41]）。此外，若随机梯度通过有放回均匀采样查询，则假设 2.7 对经验风险最小化（ERM）问题通常成立 [6]。

下述假设 2.8 是常见要求：各目标函数 $f_i$ 光滑且有下界。

**假设 2.8。** 每个 $f_i(x):\mathbb R^{p}\to\mathbb R$ 有下界且梯度 $L$-Lipschitz 连续，即对任意 $x,x'\in\mathbb R^{p}$ 有 $\lVert\nabla f_i(x)-\nabla f_i(x')\rVert\le L\lVert x-x'\rVert$。记 $f^{\ast}:=\min_{x\in\mathbb R^{p}}f(x)$。

### 2.2 算法

本小节引入随机推拉（S-PP）算法，形式化描述见算法 1（脚注：带随机梯度的 Push-Pull/AB 类方法曾在不同名称下以更严格的假设被提出与研究（例如 [39] 中的 SAB）；本文使用"随机推拉"以强调其与首次考虑假设 2.1 的原始 Push-Pull 方法 [27] 的联系）。该方法允许每个智能体在满足假设 2.1 与 2.4 的两个通信图 $\mathcal G_R$（拉取图）与 $\mathcal G_C$（推送图）上与邻居通信，以分布式方式求解问题 (1)。

**算法 1　随机推拉算法（S-PP）**

```text
初始化: 通信图 G_R（拉取图）与 G_C（推送图）。每个智能体 i 以任意但相同的
        x_i^(0) = x^(0) ∈ R^p 初始化，步长 γ，并通过抽取随机样本 ξ_i^(0) 初始化
        梯度跟踪量 y_i^(0) = g_i(x_i^(0), ξ_i^(0))。
 1: for 迭代 t = 0, 1, 2, ..., T-1 do
 2:     for 智能体 i 并行 do
 3:         从每个 j ∈ N^in_{R,i} 拉取 x_j^(t) - γ y_j^(t)
 4:         向每个 j ∈ N^out_{C,i} 推送 y_j^(t)
 5:         独立抽取随机样本 ξ_i^(t+1)
 6:         按下式更新参数
                x_i^(t+1) = Σ_{j∈N^in_{R,i}} r_ij ( x_j^(t) - γ y_j^(t) )
                y_i^(t+1) = Σ_{j∈N^in_{C,i}} c_ij ( y_j^(t) + g_i^(t+1) - g_i^(t) )
 7:     end for
 8: end for
```

S-PP 包含两个主要步骤：拉取步与推送步。在拉取步中，每个智能体 $i$ 通过图 $\mathcal G_R$ 从入邻居 $\mathcal N^{\mathrm{in}}_{R,i}$ 拉取模型信息，并相应更新本地变量 $x_i$。在推送步中，智能体 $i$ 把随机梯度相关信息推送给图 $\mathcal G_C$ 中的出邻居 $\mathcal N^{\mathrm{out}}_{C,i}$，并更新其辅助变量 $y_i$。算法反复执行拉取与推送步骤，直至满足停止准则。如第 4 节所示，在若干条件下，S-PP 保证在期望意义下收敛到目标函数的稳定点。

为便于表述与分析，本文常采用算法 1 的如下紧凑形式：

$$
\mathbf X^{(t+1)}=\mathbf R\mathbf X^{(t)}-\gamma\mathbf R\mathbf Y^{(t)},\qquad
\mathbf Y^{(t+1)}=\mathbf C\left(\mathbf Y^{(t)}+\mathbf G^{(t+1)}-\mathbf G^{(t)}\right).\tag{2}
$$

## 3 预备结果

本节给出若干预备结果，聚焦三个方面：刻画有向图的影响、引入有用的分析工具，以及收敛性分析。

对满足假设 2.1 与 2.4 的权重矩阵 $\mathbf R$、$\mathbf C$，定义如下矩阵：

$$
\boldsymbol\Pi_{\mathbf R}:=\mathbf I-\mathbf 1\boldsymbol\pi_{\mathbf R}^{T},\qquad
\boldsymbol\Pi_{\mathbf C}:=\mathbf I-\boldsymbol\pi_{\mathbf C}\mathbf 1^{T}.
$$

为简单起见，记 $\widetilde{\mathbf R}:=\boldsymbol\Pi_{\mathbf R}\mathbf R$、$\widetilde{\mathbf C}:=\boldsymbol\Pi_{\mathbf C}\mathbf C$，并记 $\pi:=\boldsymbol\pi_{\mathbf R}^{T}\boldsymbol\pi_{\mathbf C}$。进一步，对任意整数 $k\ge0$ 令 $\widetilde{\mathbf R}_{k}:=\boldsymbol\Pi_{\mathbf R}\mathbf R^{k}$、$\widetilde{\mathbf C}_{k}:=\boldsymbol\Pi_{\mathbf C}\mathbf C^{k}$。

### 3.1 有向图的影响

与依赖为矩阵 $\mathbf R$、$\mathbf C$ 量身定制的特定矩阵范数的既有分析 [27]、[45]、[46] 不同，本文改而考虑一组**无穷和**，用以刻画信息流在 $\mathbf R$ 与 $\mathbf C$ 的公共根节点处如何高效汇聚、并通过 $\mathcal G_R$ 与 $\mathcal G_C$ 传播。如第 4 节所示，这些无穷和刻画也有助于恢复既有去中心化随机梯度跟踪（DSGT）方法在无向图上的已知结果 [1]、[8]。

下面先定义在随机推拉算法的线性加速性质研究中起关键作用的和 $M_1$ 与 $M_2$：

$$
M_1:=\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\mathbf C\right\rVert_2^{2}+\sum_{t=1}^{\infty}\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\left(\mathbf C^{t+1}-\mathbf C^{t}\right)\right\rVert_2^{2},\qquad
M_2:=\sum_{t=1}^{\infty}t\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\left(\mathbf C^{t+1}-\mathbf C^{t}\right)\right\rVert_2.
$$

随后定义 $N_1$ 至 $N_8$，它们为分析框架中的收敛速率提供更精细的刻画：

$$
N_1:=\sum_{t=1}^{\infty}\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\widetilde{\mathbf C}_{t}\right\rVert_2,\quad
N_2:=\sum_{t=0}^{\infty}\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\widetilde{\mathbf C}_{t}\right\rVert_2^{2},\quad
N_3:=\sum_{t=1}^{\infty}\left\lVert\widetilde{\mathbf R}_{t}\boldsymbol\pi_{\mathbf C}\right\rVert_2,\quad
N_4:=\sum_{t=1}^{\infty}\left\lVert\widetilde{\mathbf R}_{t}\boldsymbol\pi_{\mathbf C}\right\rVert_2^{2},
$$

$$
N_5:=\sum_{t=1}^{\infty}\left\lVert\sum_{k=1}^{t-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\right\rVert_2,\quad
N_6:=\sum_{t=1}^{\infty}\left\lVert\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\right\rVert_2^{2},
$$

$$
N_7:=\sum_{t=1}^{\infty}\left\lVert\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k+1}-\sum_{k=1}^{t-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\right\rVert_2^{2},\quad
N_8:=\sum_{t=1}^{\infty}\left\lVert\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k+1}-\sum_{k=1}^{t-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\right\rVert_2.
$$

下述引理 3.1 表明上述全部和均有限。

**引理 3.1。** 假设 $\mathbf R$ 与 $\mathbf C$ 满足假设 2.1 与 2.4，则对所有 $i=1,2$ 与 $j=1,\cdots,8$，和 $M_i$ 与 $N_j$ 均有限，即 $M_i<\infty$、$N_j<\infty$。

**证明。** 总体思路是把每个无穷级数拆成两部分：一部分收敛到有限值，另一部分只有有限项。作为第一步，先证明级数 $M_1$ 收敛（即有界）。由假设 2.4，$\mathbf R$ 与 $\mathbf C$ 指数衰减，即存在整数 $m_{R,C}:=\max\{m_R,m_C\}$，使得对任意 $t>m_{R,C}$ 有 $\lVert\widetilde{\mathbf R}_{t}\rVert_2\le(1-p)^{t}$、$\lVert\widetilde{\mathbf C}_{t}\rVert_2\le(1-p)^{t}$，其中 $p<1$。随后记

$$
N:=\max\left\{\lVert\boldsymbol\pi_{\mathbf R}\rVert_2,\ \lVert\boldsymbol\pi_{\mathbf C}\rVert_2,\ \left\lVert\widetilde{\mathbf R}_{t}\right\rVert_2,\ \left\lVert\widetilde{\mathbf C}_{t}\right\rVert_2,\ (1-p)^{m_{R,C}+1},\ \forall t\le m_{R,C}\right\}.
$$

对 $M_1$，注意 $\mathbf C^{t+1}-\mathbf C^{t}=(\mathbf C^{t+1}-\boldsymbol\pi_{\mathbf C}\mathbf 1^{T})-(\mathbf C^{t}-\boldsymbol\pi_{\mathbf C}\mathbf 1^{T})$。由不等式 $\lVert a+b\rVert_2^{2}\le2\lVert a\rVert_2^{2}+2\lVert b\rVert_2^{2}$ 得

$$
\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\left(\mathbf C^{t+1}-\mathbf C^{t}\right)\right\rVert_2^{2}\le2\left\lVert\boldsymbol\pi_{\mathbf R}\widetilde{\mathbf C}_{t+1}\right\rVert_2^{2}+2\left\lVert\boldsymbol\pi_{\mathbf R}\widetilde{\mathbf C}_{t}\right\rVert_2^{2}
\le2\lVert\boldsymbol\pi_{\mathbf R}\rVert_2^{2}\left\lVert\widetilde{\mathbf C}_{t+1}\right\rVert_2^{2}+2\lVert\boldsymbol\pi_{\mathbf R}\rVert_2^{2}\left\lVert\widetilde{\mathbf C}_{t}\right\rVert_2^{2}.
$$

于是有

$$
\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\left(\mathbf C^{t+1}-\mathbf C^{t}\right)\right\rVert_2^{2}\le
\begin{cases}
4N^{4}, & t\le m_{R,C},\\
4N^{2}(1-p)^{2t}, & t>m_{R,C}.
\end{cases}
$$

对 $t$ 从 1 到无穷求和得

$$
\sum_{t=1}^{\infty}\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\left(\mathbf C^{t+1}-\mathbf C^{t}\right)\right\rVert_2^{2}
\le4N^{4}m_{R,C}+4N^{2}\sum_{t=1}^{\infty}(1-p)^{2t}
\le4N^{4}m_{R,C}+4N^{2}\frac{(1-p)^{2}}{2p-p^{2}}<\infty.
$$

因此可得

$$
M_1\le\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\mathbf C\right\rVert_2^{2}+4N^{4}m_{R,C}+4N^{2}\frac{(1-p)^{2}}{2p-p^{2}}<\infty.
$$

其余各项的证明可用相同论证，并利用恒等式 $\sum_{t=1}^{\infty}t(1-p)^{t}=(1-p)/p^{2}$；故从略。$\square$

现在讨论 $\mathbf R=\mathbf C=\mathbf W$ 的情形，其中 $\mathbf W$ 非负、双随机，且以 $\lambda:=\lVert\mathbf W-\mathbf 1\mathbf 1^{T}/n\rVert_2<1$ 满足假设 2.4；同时假设 $\mathcal G_{\mathbf W}$ 满足假设 2.1。此类设置在无向图文献中被普遍考虑 [1]、[8]、[24]，引理 3.2 适用于这些情形。

**引理 3.2。** 对 $\mathbf R=\mathbf C=\mathbf W$，其中 $\mathbf W$ 非负、双随机并满足假设 2.4；再假设 $\mathcal G_{\mathbf W}$ 满足假设 2.1，并定义 $\lambda:=\lVert\mathbf W-\mathbf 1\mathbf 1^{T}/n\rVert_2<1$，则有

$$
M_1=\frac{1}{n},\qquad M_2=N_1=N_2=N_3=N_4=0,\qquad
N_5\le\frac{\lambda^{2}}{(1-\lambda)^{2}},\quad
N_6\le\frac{\lambda^{2}+\lambda^{4}}{(1-\lambda^{2})^{3}},\quad
N_7\le\frac{8}{(1-\lambda^{2})^{3}},\quad
N_8\le\frac{8}{(1-\lambda)^{2}}.
$$

此外，若 $\mathbf W$ 还对称，则精确成立

$$
N_5=\frac{\lambda^{2}}{(1-\lambda)^{2}},\qquad
N_6=\frac{\lambda^{2}+\lambda^{4}}{(1-\lambda^{2})^{3}},\qquad
N_7\le\frac{10}{(1+\min\{\lambda_n,0\})(1-\lambda)},\qquad
N_8\le\frac{10}{\sqrt{1+\min\{\lambda_n,0\}}(1-\lambda)},
$$

其中 $\lambda_n\in(-1,1)$ 为 $\mathbf W$ 的最小特征值。

**证明：** 见附录 A.3。

可见在该情形下，这些常数具有简单的刻画。

### 3.2 辅助引理

本小节给出若干对证明主要结果至关重要的不等式与引理。

**引理 3.3。** 对任意一组 $p$ 个同尺寸矩阵 $\{\mathbf A_i\}_{i=1}^{p}$，给定满足 $\alpha_i>0$ 且 $\sum_{i=1}^{p}\alpha_i\le1$ 的 $\alpha_1,\cdots,\alpha_p$，有

$$
\left\lVert\sum_{i=1}^{p}\mathbf A_i\right\rVert_F^{2}\le\sum_{i=1}^{p}\frac{1}{\alpha_i}\lVert\mathbf A_i\rVert_F^{2}.
$$

**证明：** 参见 [43, 引理 E.1]。

**引理 3.4。** 设 $\mathbf A,\mathbf B$ 为尺寸匹配的两个矩阵，则 $\lVert\mathbf A\mathbf B\rVert_F\le\lVert\mathbf A\rVert_2\lVert\mathbf B\rVert_F$。

**证明：** 参见 [42, 引理 A.6]。

**引理 3.5。** 设 $A,B,C$ 与 $\alpha$ 为正数、$T$ 为正整数，定义

$$
g(\gamma)=\frac{A}{\gamma(T+1)}+B\gamma+C\gamma^{2}.
$$

则

$$
\inf_{\gamma\in(0,\frac{1}{\alpha}]}g(\gamma)\le2\left(\frac{AB}{T+1}\right)^{\frac{1}{2}}+2C^{\frac{1}{3}}\left(\frac{A}{T+1}\right)^{\frac{2}{3}}+\frac{\alpha A}{T+1},
$$

其中上界可通过取 $\gamma=\min\left\{\left(\frac{A}{B(T+1)}\right)^{\frac{1}{2}},\left(\frac{A}{C(T+1)}\right)^{\frac{1}{3}},\frac{1}{\alpha}\right\}$ 达到。

**证明：** 参见 [8, 引理 26]。

**引理 3.6。** 给定非负序列 $\{a_i\}_{i=0}^{\infty}$ 与 $\{b_i\}_{i=0}^{\infty}$，假设 $\sum_{i=0}^{\infty}a_i<\infty$。则对任意整数 $T>0$ 有

$$
\sum_{t=0}^{T}\sum_{j=0}^{t}a_{t-j}b_{j}\le\sum_{i=0}^{\infty}a_i\sum_{j=0}^{T}b_j.
$$

**证明：** 由交换求和次序直接可得。

**引理 3.7。** 给定正项级数 $\{a_n\}_{n=1}^{\infty}$ 与整数 $T,k$ 且 $T>k>0$，有

$$
\sum_{t=k+1}^{T}\sum_{j=1}^{k}a_{t-j}\le\sum_{i=1}^{T-1}ia_i.
$$

**证明：** 见附录 A.4。

### 3.3 收敛性分析

下面给出分析 S-PP 收敛性的关键步骤。首先为简化定义若干记号：

$$
\widehat x^{(t)}:=\boldsymbol\pi_{\mathbf R}^{T}\mathbf X^{(t)},\quad
\overline{\mathbf X}^{(t)}:=\mathbf 1\widehat x^{(t)},\quad
\overline{\mathbf Y}^{(t)}:=\boldsymbol\pi_{\mathbf C}\mathbf 1^{T}\mathbf Y^{(t)},
$$

$$
\theta_i^{(t)}:=g_i^{(t)}-\nabla f_i(x_i^{(t)}),\quad
\boldsymbol\Theta^{(t)}:=\mathbf G^{(t)}-\nabla\mathbf F(\mathbf X^{(t)}),
$$

$$
\widehat{\mathbf X}^{(t)}:=\boldsymbol\Pi_{\mathbf R}\mathbf X^{(t)},\quad
\Delta\overline{\mathbf X}^{(t)}:=\overline{\mathbf X}^{(t+1)}-\overline{\mathbf X}^{(t)},\quad
\nabla\overline{\mathbf F}^{(t)}:=\nabla\mathbf F(\mathbf X^{(t)})-\nabla\mathbf F(\overline{\mathbf X}^{(t)}).
$$

这里 $\widehat x^{(t)}$ 表示算法 1 在第 $t$ 次迭代的期望输出。

接着，把算法 1 的 S-PP 写成简洁的矩阵形式。由式 (2)，$\mathbf X^{(t)}$ 与 $\mathbf Y^{(t)}$ 的更新规则为

$$
\begin{pmatrix}\mathbf X^{(t+1)}\\ \mathbf Y^{(t+1)}\end{pmatrix}
=\begin{pmatrix}\mathbf R & -\gamma\mathbf R\\ \mathbf 0 & \mathbf C\end{pmatrix}
\begin{pmatrix}\mathbf X^{(t)}\\ \mathbf Y^{(t)}\end{pmatrix}
+\begin{pmatrix}\mathbf 0 & \mathbf 0\\ \mathbf 0 & \mathbf C\end{pmatrix}
\begin{pmatrix}\mathbf 0\\ \mathbf G^{(t+1)}-\mathbf G^{(t)}\end{pmatrix}.\tag{3}
$$

由此可得

$$
\begin{pmatrix}\mathbf X^{(t)}\\ \mathbf Y^{(t)}\end{pmatrix}
=\begin{pmatrix}\mathbf R & -\gamma\mathbf R\\ \mathbf 0 & \mathbf C\end{pmatrix}^{t}
\begin{pmatrix}\mathbf X^{(0)}\\ \mathbf Y^{(0)}\end{pmatrix}
+\sum_{j=0}^{t-1}\begin{pmatrix}\mathbf R & -\gamma\mathbf R\\ \mathbf 0 & \mathbf C\end{pmatrix}^{t-j-1}
\begin{pmatrix}\mathbf 0 & \mathbf 0\\ \mathbf 0 & \mathbf C\end{pmatrix}
\begin{pmatrix}\mathbf 0\\ \mathbf G^{(j+1)}-\mathbf G^{(j)}\end{pmatrix}.
$$

注意对任意整数 $j>0$ 有矩阵恒等式

$$
\begin{pmatrix}\mathbf R & -\gamma\mathbf R\\ \mathbf 0 & \mathbf C\end{pmatrix}^{j}
=\begin{pmatrix}\mathbf R^{j} & -\gamma\sum_{k=1}^{j}\mathbf R^{k}\mathbf C^{j-k}\\ \mathbf 0 & \mathbf C^{j}\end{pmatrix}.
$$

因此，由初始条件 $\mathbf Y^{(0)}=\mathbf G^{(0)}$，可把 $\mathbf X^{(t)}$ 与 $\mathbf Y^{(t)}$ 表示为

$$
\mathbf X^{(t)}=\mathbf R^{t}\mathbf X^{(0)}
-\gamma\sum_{j=0}^{t-2}\sum_{k=1}^{t-j-1}\mathbf R^{k}\mathbf C^{t-j-k}\left[\mathbf G^{(j+1)}-\mathbf G^{(j)}\right]
-\gamma\sum_{k=1}^{t}\mathbf R^{k}\mathbf C^{t-k}\mathbf G^{(0)},\tag{4}
$$

$$
\mathbf Y^{(t)}=\sum_{j=0}^{t-1}\mathbf C^{t-j}\left[\mathbf G^{(j+1)}-\mathbf G^{(j)}\right]+\mathbf C^{t}\mathbf G^{(0)}.\tag{5}
$$

把式 (5) 两边同乘 $\boldsymbol\Pi_{\mathbf C}$，得到如下常用的变换：

$$
\boldsymbol\Pi_{\mathbf C}\mathbf Y^{(t)}=\sum_{j=0}^{t-1}\widetilde{\mathbf C}_{t-j}\left[\mathbf G^{(j+1)}-\mathbf G^{(j)}\right]+\widetilde{\mathbf C}_{t}\mathbf G^{(0)}
=\sum_{j=1}^{t-1}\left(\widetilde{\mathbf C}_{t-j+1}-\widetilde{\mathbf C}_{t-j}\right)\mathbf G^{(j)}+\widetilde{\mathbf C}\mathbf G^{(t)}.\tag{6}
$$

为支撑收敛性分析，引入若干在推导主要结果中起关键作用的引理。令 $\mathcal F_t$ 为由 $\{\xi_i^{(j)},\ i\in[n],\ 0\le j\le t-1\}$ 生成的 $\sigma$-代数，并记 $\mathbb E[\cdot\mid\mathcal F_t]$ 为给定 $\mathcal F_t$ 的条件期望。引理 3.8 给出梯度估计 $\mathbf G(\mathbf X^{(t)},\boldsymbol\xi^{(t)})$ 的方差估计。

**引理 3.8。** 在假设 2.7 下，给定向量 $a\in\mathbb R^{n}$，对所有 $t\ge0$ 有

$$
\mathbb E\left[\left|a^{T}\boldsymbol\Theta^{(t)}\right|^{2}\right]\le\lVert a\rVert^{2}\sigma^{2}.
$$

**证明：** 见附录 A.5。

引理 3.9 给出延迟为 $i$、$j$ 时 $G^{(t-i)}$ 与 $G^{(t-j)}$ 之间的协方差。

**引理 3.9。** 假设假设 2.7 成立，则对任意向量 $a,b\in\mathbb R^{n}$ 与整数 $i\ne j$ 有

$$
\mathbb E\left\langle a^{T}\boldsymbol\Theta^{(t-i)},\ b^{T}\boldsymbol\Theta^{(t-j)}\right\rangle=0.
$$

下述引理刻画用于约束式 (1) 中目标函数平均期望范数（即 $\frac{1}{T+1}\sum_{t=0}^{T}\mathbb E\lVert\nabla f(\widehat x^{(t)})\rVert^{2}$）的关键要素。特别地，引理 3.10 与引理 3.11 分别给出 $\sum_{t=0}^{T}\mathbb E\lVert\Delta\overline{\mathbf X}^{(t)}\rVert_F^{2}$ 与 $\sum_{t=0}^{T}\mathbb E\lVert\widehat{\mathbf X}^{(t)}\rVert_F^{2}$ 的上界。

**引理 3.10。** 假设假设 2.1、2.4、2.7 与 2.8 成立。对 $\gamma\le\frac{1}{6\sqrt{n}N_1L}$，有

$$
\sum_{t=0}^{T}\mathbb E\left\lVert\Delta\overline{\mathbf X}^{(t)}\right\rVert_F^{2}
\le4\gamma^{2}nM_1\sigma^{2}(T+1)+96\gamma^{2}n\max\left\{N_1^{2},n\pi^{2}\right\}L^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
$$
$$
+24\gamma^{2}n^{3}\pi^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
+12\gamma^{2}nN_2\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}.
$$

**证明：** 见附录 A.6。

**引理 3.11。** 假设假设 2.1、2.4、2.7 与 2.8 成立。则对 $\gamma\le\frac{1}{20\sqrt{C_1}L}$，其中 $C_1=\max\left\{nN_1^{2},nN_3^{2},N_8^{2},\sqrt{n}N_1N_5,n\pi N_5\right\}$，有

$$
\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
\le864\gamma^{2}\max\{N_4,N_7\}n\sigma^{2}(T+1)+2400\gamma^{4}nM_1N_5^{2}L^{2}\sigma^{2}(T+1)
$$
$$
+210\gamma^{2}\max\{N_2N_5/\pi,N_6\}\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}
+240\gamma^{2}n\max\left\{nN_3^{2},n\pi N_5\right\}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}.
$$

**证明：** 见附录 A.7。

为得到主要收敛结果，本文整合引理 3.1、引理 3.10 与引理 3.11 的结果，如下述引理 3.12 所示。

**引理 3.12。** 假设假设 2.1、2.4、2.7 与 2.8 成立。定义如下常数：

$$
P_1=\max\left\{nN_1^{2},nN_3^{2},N_8^{2},\sqrt{n}N_1N_5,n\pi N_5\right\},\qquad
P_2=\max\left\{n^{2}\pi^{2},nN_1^{2},nN_1^{2}\widetilde M_2,n^{2}\pi^{2}\widetilde M_2^{2}\right\},
$$

$$
P_3=\max\left\{n^{2}\pi^{2},\frac{N_1^{4}}{\pi^{2}},\frac{N_3^{4}}{\pi^{2}}\right\},\qquad
P_4=\sqrt{\max\{P_2,P_3\}}N_5,\qquad
Q=\max\left\{M_1,\widetilde M_2,M_1\widetilde M_2\right\}.
$$

则对 $\gamma\le\frac{1}{500\sqrt{\max\{P_1,P_2,P_3,P_4\}}L}$，有

$$
\frac{1}{T+1}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert_2^{2}
\le\frac{10\Delta_f}{\gamma n\pi(T+1)}+\frac{100Q\sigma^{2}L}{n\pi}\gamma+\frac{80000\sqrt{\max\{P_2,P_3\}}\max\{N_4,N_7\}\sigma^{2}L^{2}}{n\pi}\gamma^{2}
$$
$$
+\frac{200000\sqrt{\max\{P_2,P_3\}}M_1N_5^{2}\sigma^{2}L^{4}}{n\pi}\gamma^{4}
+\frac{30P_5}{n^{2}\pi(T+1)}F_0,
$$

其中 $P_5:=\max\{N_2/\pi,N_2/(n\pi^{2}),N_6/N_5\}$、$F_0=\lVert\nabla\mathbf F^{(0)}\rVert_F^{2}/n$，且当 $\mathcal G_R$ 与 $\mathcal G_{\mathbf C^{T}}$ 为 [42]、[43] 中考虑的生成树时 $\widetilde M_2=0$，否则 $\widetilde M_2=M_2$。

**证明：** 见附录 A.8。

## 4 收敛结果

本节给出随机推拉算法的主要收敛结果，详述其收敛行为。值得注意的是，这些结果涵盖 $\mathbf R=\mathbf C=\mathbf W$（其中 $\mathbf W$ 对称且双随机）的情形，对应该情形下 [24]、[1]、[8] 研究的去中心化随机梯度跟踪（DSGT）方法。此外，本文给出迭代次数足够大时算法实现线性加速的充分条件，从而匹配集中式随机梯度方法的收敛速率。

首先给出随机推拉算法在最小化光滑非凸目标函数时的收敛结果，即定理 4.1。

**定理 4.1。** 对算法 1 给出的随机推拉算法，假设假设 2.1、2.4、2.7 与 2.8 成立。给定迭代次数 $T$ 与引理 3.12 中定义的常数 $P_1$ 至 $P_5$ 及 $Q$，取

$$
\gamma=\min\left\{\left(\frac{\Delta_f}{\sqrt{\max\{P_2,P_3\}}\max\{N_4,N_7\}\sigma^{2}L^{2}}\right)^{\frac{1}{3}},\ \left(\frac{\Delta_f}{Q\sigma^{2}L(T+1)}\right)^{\frac{1}{2}},\ \frac{1}{500\sqrt{\max\{P_1,P_2,P_3,P_4\}}L}\right\},
$$

则有

$$
\frac{1}{T+1}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
\lesssim\left(\frac{Q}{n\pi^{2}}\right)^{\frac{1}{2}}\left(\frac{\Delta_f\sigma^{2}L}{n(T+1)}\right)^{\frac{1}{2}}
+\left(\Delta_f^{2}\sqrt{\max\{P_2,P_3\}}\max\{N_4,N_7\}L^{2}\sigma^{2}\right)^{\frac{1}{3}}\frac{1}{n\pi}\frac{1}{(T+1)^{\frac{2}{3}}}
$$
$$
+\frac{\sqrt{\max\{P_1,P_2,P_3,P_4\}}L\Delta_f}{n\pi}\frac{1}{T+1}
+\frac{\sqrt{\max\{P_2,P_3\}}M_1N_5^{2}}{n\pi Q^{2}}\left(\frac{\Delta_fL}{\sigma(T+1)}\right)^{2}
+\frac{P_5}{n\pi(T+1)}F_0.
$$

**证明：** 见附录 A.9。

对光滑非凸目标，定理 4.1 为随机梯度下的 Push-Pull/AB 算法建立了 $O(1/\sqrt{T})$ 收敛速率，并给出显式系数。

在下述推论中讨论 $\mathbf R=\mathbf C=\mathbf W$（其中 $\mathbf W$ 双随机）的情形。具体考虑三种情况：1) $\mathbf W$ 仅为双随机；2) $\mathbf W$ 对称；3) $\mathbf W$ 半正定。情形 1 最一般，允许通信图为无向图或带权平衡的有向图；其他两种情形适用于无向图，其中情形 3 可通过在 $\mathbf W$ 中选择足够大的对角元满足。

**推论 4.1。** 对算法 1 给出的随机推拉算法，假设假设 2.1、2.4、2.7 与 2.8 成立，记 $\lambda:=\lVert\mathbf W-\mathbf 1\mathbf 1^{T}/n\rVert_2<1$。给定迭代次数 $T$，存在常数步长 $\gamma$ 使得：

1)（双随机情形）当 $\mathbf R=\mathbf C=\mathbf W$、$\mathbf W$ 双随机时：

$$
\frac{1}{T+1}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
\lesssim\left(\frac{\Delta_f\sigma^{2}L}{n(T+1)}\right)^{\frac{1}{2}}
+\frac{\left(\Delta_f^{2}L^{2}\sigma^{2}\right)^{\frac{1}{3}}}{(1-\lambda)(T+1)^{\frac{2}{3}}}
+\frac{L\Delta_f}{(1-\lambda)^{2}(T+1)}+\frac{F_0}{(1-\lambda)^{2}(T+1)}
+\left(\frac{\sqrt{n}\Delta_fL}{(1-\lambda)^{2}\sigma(T+1)}\right)^{2},
$$

2)（对称情形）当 $\mathbf R=\mathbf C=\mathbf W$、$\mathbf W$ 双随机且对称时：

$$
\frac{1}{T+1}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
\lesssim\left(\frac{\Delta_f\sigma^{2}L}{n(T+1)}\right)^{\frac{1}{2}}
+\frac{\left(\Delta_f^{2}L^{2}\sigma^{2}\right)^{\frac{1}{3}}}{(1-\lambda)^{\frac{1}{3}}c^{\frac{1}{3}}(T+1)^{\frac{2}{3}}}
+\frac{L\Delta_f}{\sqrt{c}(1-\lambda)(T+1)}+\frac{F_0}{(1-\lambda)(T+1)}
+\left(\frac{\sqrt{n}\Delta_fL}{\sigma(T+1)(1-\lambda)^{2}}\right)^{2},
$$

其中 $c=1+\min\{\lambda_n,0\}$（如引理 3.2）；

3)（半正定情形）当 $\mathbf R=\mathbf C=\mathbf W$、$\mathbf W$ 双随机且半正定时：

$$
\frac{1}{T+1}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
\lesssim\left(\frac{\Delta_f\sigma^{2}L}{n(T+1)}\right)^{\frac{1}{2}}
+\frac{\left(\Delta_f^{2}L^{2}\sigma^{2}\right)^{\frac{1}{3}}}{(1-\lambda)^{\frac{1}{3}}(T+1)^{\frac{2}{3}}}
+\frac{L\Delta_f}{(1-\lambda)(T+1)}+\frac{F_0}{(1-\lambda)(T+1)}
+\left(\frac{\sqrt{n}\Delta_fL}{\sigma(T+1)(1-\lambda)^{2}}\right)^{2}.
$$

**证明。** 对满足假设 2.4 的双随机矩阵 $\mathbf W$，有 $\boldsymbol\pi_{\mathbf R}=\boldsymbol\pi_{\mathbf C}=\mathbf 1/n$，因此 $Q=1/n$，且 $P_1=\max\{N_8^{2},N_5\}$、$P_2=P_3=1$、$P_4=N_5$、$P_5=N_6/N_5$。情形 1、2、3 的结果直接由引理 3.2 与定理 4.1 得到。三种情形的区别出现在估计 $P_5$ 时：情形 1 中注意 $N_6\le N_5^{2}$，从而 $P_5\le N_5$；而情形 2、3 中 $P_5$ 可精确计算。$\square$

**注记 4.1。** 在情形 1 中，本文给出 $\mathbf W$ 仅假设为双随机时，光滑非凸目标下 DSGT 方法的收敛保证。该结果此前未见，特别地证明了 DSGT 在该设置下的线性加速性质。这一发现推广了此前假设 $\mathbf W$ 对称的已知结果 [1]、[8]；其瞬态时间为 $O\left(\frac{n^{3}}{(1-\lambda)^{6}}\right)$。

**注记 4.2。** 在情形 2 与情形 3 中，本文把推论 4.1 的结果与此前 DSGT 的结果比较。具体地，计算并比较 $O\left(\frac{1}{\sqrt{nT}}\right)$ 项在其余项中占主导之前的瞬态时间。在情形 2（对称 $\mathbf W$）中，所得瞬态复杂度为

$$
O\left(\max\left\{\frac{n^{3}}{c^{2}(1-\lambda)^{2}},\ \frac{n}{(1-\lambda)^{\frac{8}{3}}}\right\}\right).
$$

该界优于 [8] 中的最佳已知结果 $O\left(\max\left\{n/(1-\lambda)^{4},\ n^{3}/(c^{4}(1-\lambda)^{2})\right\}\right)$。对情形 3（半正定 $\mathbf W$），所得复杂度为

$$
O\left(\max\left\{\frac{n^{3}}{(1-\lambda)^{2}},\ \frac{n}{(1-\lambda)^{\frac{8}{3}}}\right\}\right),
$$

与 [1] 中的最新结果一致。

### 4.1 线性加速的充分条件

线性加速是分布式随机梯度算法的一个理想性质，使它们能够匹配集中式 SGD 算法的收敛速率，即使 $1/\sqrt{nT}$ 项在复杂度界中占据主导。然而，随机推拉能否在一般有向图上实现线性加速，此前工作尚未讨论。本文通过推论 4.2 给出一个充分条件来填补这一空白。

**推论 4.2。** 设假设 2.1、2.4、2.7 与 2.8 成立，考虑算法 1 给出的随机推拉算法。若

$$
\frac{\max\left\{M_1,\widetilde M_2,M_1\widetilde M_2\right\}}{n\left(\boldsymbol\pi_{\mathbf R}^{T}\boldsymbol\pi_{\mathbf C}\right)^{2}}\le C,
$$

则实现线性加速，其中 $C$ 为不依赖 $n$ 的常数。

**证明。** 结果直接由定理 4.1 得到。$\square$

**注记 4.3。** 该充分条件适用于许多实际设置。例如，当 $R=C=W$、$\mathbf W$ 双随机时（详见推论 4.1），条件成立。若仅 $\mathbf R$ 为双随机（即 $\boldsymbol\pi_{\mathbf R}=\mathbf 1/n$），该条件也自动成立，因为

$$
M_1=\frac{1}{n},\quad M_2=0,\quad \pi=\frac{1}{n},\quad
\frac{\max\{M_1,M_2,M_1M_2\}}{n(\boldsymbol\pi_{\mathbf R}^{T}\boldsymbol\pi_{\mathbf C})^{2}}=1.
$$

此外，当 $\mathcal G_R$ 与 $\mathcal G_{\mathbf C^{T}}$ 为共享同一根的生成树时，可选择只含 0 与 1 的矩阵 $\mathbf R$ 与 $\mathbf C$，并满足 $M_1/(n(\boldsymbol\pi_{\mathbf R}^{T}\boldsymbol\pi_{\mathbf C})^{2})=1$ [43]。值得注意的是，此类设计不使用此前工作（如 [27]）所要求的正对角元。

最后，推论 4.3 表明定理 4.1 不允许更高阶的加速。

**推论 4.3。** 设假设 2.1 与 2.4 成立，则

$$
\frac{\max\left\{M_1,\widetilde M_2,M_1\widetilde M_2\right\}}{n\left(\boldsymbol\pi_{\mathbf R}^{T}\boldsymbol\pi_{\mathbf C}\right)^{2}}\ge\frac{1}{10}.
$$

**证明。** 当 $\mathcal G_R$ 与 $\mathcal G_{\mathbf C^{T}}$ 为共享同一根的生成树、且按 [43] 取只含 0 与 1 的矩阵 $\mathbf R$ 与 $\mathbf C$ 时，有 $M_1/(n(\boldsymbol\pi_{\mathbf R}^{T}\boldsymbol\pi_{\mathbf C})^{2})=1>\frac{1}{10}$。下面讨论其他情形。

由假设 2.4，$\lim_{k\to\infty}\mathbf C^{k}=\boldsymbol\pi_{\mathbf C}\mathbf 1^{T}$。于是由范数的连续性得

$$
n\left(\boldsymbol\pi_{\mathbf R}^{T}\boldsymbol\pi_{\mathbf C}\right)^{2}
=\left\lVert\lim_{k\to\infty}\boldsymbol\pi_{\mathbf R}^{T}\mathbf C^{k}\right\rVert^{2}
=\lim_{k\to\infty}\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\mathbf C^{k}\right\rVert^{2}.
$$

注意 $\boldsymbol\pi_{\mathbf R}^{T}\mathbf C^{k}=\boldsymbol\pi_{\mathbf R}^{T}\mathbf C+\sum_{t=2}^{k}\boldsymbol\pi_{\mathbf R}^{T}(\mathbf C^{t}-\mathbf C^{t-1})$。在引理 3.3 中取 $\alpha_i=i\lVert\boldsymbol\pi_{\mathbf R}^{T}(\mathbf C^{i+1}-\mathbf C^{i})\rVert/M_9$，可得

$$
\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\mathbf C^{k}\right\rVert^{2}\le2\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\mathbf C\right\rVert^{2}+2\left\lVert\sum_{t=2}^{k}\boldsymbol\pi_{\mathbf R}^{T}\left(\mathbf C^{t}-\mathbf C^{t-1}\right)\right\rVert^{2}
\le2M_1+2M_9\sum_{t=1}^{k-1}\frac{\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\left(\mathbf C^{t+1}-\mathbf C^{t}\right)\right\rVert}{t}
$$
$$
\le2M_1+2M_9\sum_{t=1}^{k-1}\left(\frac{1}{t^{2}}+\left\lVert\boldsymbol\pi_{\mathbf R}^{T}\left(\mathbf C^{t+1}-\mathbf C^{t}\right)\right\rVert^{2}\right)
\le10\max\{M_1,M_9,M_1M_9\},
$$

其中最后一个不等式用了 $\sum_{t=1}^{\infty}1/t^{2}=\pi^{2}/6\le2$。$\square$

## 5 数值实验

本节给出数值实验，以验证理论发现并展示随机推拉算法在求解去中心化优化问题中的有效性。特别地，将其性能与 SGP [2]、Push-DIGing [15] 等其他去中心化算法比较，这两种算法都适用于任意网络。

实验所考虑的网络拓扑如图 1 所示。Erdos–Renyi 图（图 1(a)）是一种有向图，其中每条边以概率 $p$ 被选中；本文不断生成 Erdos–Renyi 图，直至得到一个强连通图。多子环（Multi. Sub-Ring）图（图 1(b)）是由相互连通的子环构成的有向图。为简单起见，在 S-PP 中令 $\mathcal G_R$ 与 $\mathcal G_{\mathbf C^{T}}$ 相同。

**图 1：两种网络拓扑示意。** (a) Erdos–Renyi 图，$n=8$、$p=0.1$；(b) 多子环图，$n=8$。

权重矩阵 $\mathbf R$ 与 $\mathbf C$ 分别通过对每个节点的入邻居与出邻居求平均构造。具体地，元素为

$$
[\mathbf R]_{ij}=\begin{cases}\dfrac{1}{1+d_i^{\mathrm{in}}}, & \text{若 } (j,i)\in\mathcal E_R\ \text{或}\ i=j,\\[4pt] 0, & \text{其他},\end{cases}
\qquad
[\mathbf C]_{ij}=\begin{cases}\dfrac{1}{1+d_j^{\mathrm{out}}}, & \text{若 } (j,i)\in\mathcal E_C\ \text{或}\ i=j,\\[4pt] 0, & \text{其他},\end{cases}
$$

其中 $d_i^{\mathrm{in}}$ 与 $d_j^{\mathrm{out}}$ 分别为节点 $i$ 的入度与节点 $j$ 的出度。此外，对 SGP 与 Push-DIGing 算法，按 [15] 所述只使用矩阵 $\mathbf C$。

**逻辑回归。** 本文比较 S-PP 与 SGP、Push-DIGing 在带非凸正则的逻辑回归问题上的性能 [32]、[42]。目标函数 $f_i:\mathbb R^{p}\to\mathbb R$ 为

$$
f_i(x):=\frac{1}{J}\sum_{j=1}^{J}\ln\left(1+\exp(-y_{i,j}h_{i,j}^{T}x)\right)+R\sum_{k=1}^{p}\frac{x_{[k]}^{2}}{1+x_{[k]}^{2}},
$$

其中 $x_{[k]}$ 为 $x$ 的第 $k$ 个元素，$\{(h_{i,j},y_{i,j})\}_{j=1}^{J}$ 表示节点 $i$ 保存的本地数据。

为控制节点间的数据异质性，先让每个节点 $i$ 关联一个参数为 $\tilde x_i$ 的局部逻辑回归模型，其中 $\tilde x_i=\tilde x+v_i$，$\tilde x\sim\mathcal N(\mathbf 0,\mathbf I_p)$ 为公共随机向量，$v_i\sim\mathcal N(\mathbf 0,\sigma_h^{2}\mathbf I_p)$ 为独立生成的随机向量。因此 $\{v_i\}$ 决定 $\{\tilde x_i\}$ 之间的差异，$\sigma_h$ 越大通常差异越大。固定 $\{\tilde x_i\}$ 后，生成本地数据样本使其服从不同分布。对节点 $i$，特征向量按 $h_{i,j}\sim\mathcal N(\mathbf 0,\mathbf I_p)$ 生成，$z_{i,j}\sim\mathcal U(0,1)$；随后取标签 $y_{i,j}\in\{-1,1\}$ 使其满足 $z_{i,j}\le1+\exp(-y_{i,j}h_{i,j}^{T}\tilde x_i)$。仿真参数设为：$n=20$、$p=400$、$J=400$、$R=0.01$、$\sigma_h=0.2$。所有算法以相同步长 $\gamma$（0.1 或 0.05）初始化，但 S-PP 采用修正步长 $\gamma/(n\pi)$（其中 Erdos–Renyi 图上 $n\pi\approx1.05$、多子环图上约为 1.35）。该调整源于 S-PP 的更新机制：其梯度跟踪估计器会随迭代次数增加而有效地累积 $n\pi$ 倍的平均随机梯度。此外，为便于收敛，每 300 次迭代把步长衰减为原来的 80%，实验重复三次取平均性能。

图 2 展示了两种通信图下各算法的性能。在两种网络结构中，S-PP 在不同步长选择下都一致优于其他方法。

**图 2：逻辑回归（带非凸正则）在不同通信图下各算法的性能。**

**深度学习。** 本文把 S-PP 与其他算法应用于 MNIST 数据集 [12] 上的 CNN 图像分类任务。所有实验在配备八块 NVIDIA RTX 3090 GPU 的服务器上运行。网络包含两层带最大池化与 ReLU 的卷积层，以及两层前馈层。特别地，考虑异质数据设置：数据样本先按标签排序，再在智能体之间划分。本地批大小设为 8，智能体总数为 20。对所有算法，学习率 $\gamma$ 设为 0.01，并在第 8000 与 11000 次迭代时衰减 90%；S-PP 为公平起见采用修正步长 $\gamma/(n\pi)$。

图 3 给出训练损失与测试精度曲线，表明 S-PP 优于其他方法。相反，SGP 与 Push-DIGing 对步长与网络规模 $n$ 都明显敏感，特别是在 $n$ 较大或步长选择过于激进时可能无法收敛。

**图 3：在 MNIST 上训练 CNN 时各算法的训练损失与测试精度。** 对训练损失，图中把发散算法的曲线（SGP（Erdos–Renyi）、SGP（多子环）、Push-DIGing（Erdos–Renyi）与 Push-DIGing（多子环））以其记录中首个非 NaN 值绘出。

## 6 结论

本文对随机推拉（Stochastic Push–Pull）算法进行全面的收敛分析，特别强调其基本假设与收敛速率。所提出的分析框架为研究去中心化优化算法提供通用方法，并涵盖去中心化随机梯度跟踪方法的广泛最新结果。此外，本文建立随机推拉算法实现线性加速的充分条件。理论发现通过数值实验得到验证，展示了随机推拉算法在有向网络上求解去中心化优化问题的有效性。

## 图注与表注

**图 1：两种网络拓扑示意。** (a) Erdos–Renyi 图，$n=8$、$p=0.1$；(b) 多子环图，$n=8$。

**图 2：逻辑回归（带非凸正则）在不同通信图下各算法的性能。**

**图 3：在 MNIST 上训练 CNN 时各算法的训练损失与测试精度。** 对训练损失，图中把发散算法（SGP（Erdos–Renyi）、SGP（多子环）、Push-DIGing（Erdos–Renyi）与 Push-DIGing（多子环））的曲线以其记录中首个非 NaN 值绘出。

**表注：** 原文无数值表格；算法 1 为伪代码，已按原文逐行译出。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 46 条，源文 pp. 28–29）。

[1] S. A. Alghunaim and K. Yuan, A unified and refined convergence analysis for non-convex decentralized learning, IEEE Transactions on Signal Processing, 70 (2022), pp. 3264–3279.

[2] M. Assran, N. Loizou, N. Ballas, and M. Rabbat, Stochastic gradient push for distributed deep learning, in International Conference on Machine Learning, PMLR, 2019, pp. 344–353.

[3] J. Chen and A. H. Sayed, Diffusion adaptation strategies for distributed optimization and learning over networks, IEEE Transactions on Signal Processing, 60 (2012), pp. 4289–4305.

[4] B. Gharesifard and J. Cortés, When does a digraph admit a doubly stochastic adjacency matrix?, in Proceedings of the 2010 American Control Conference, IEEE, 2010, pp. 2440–2445.

[5] R. A. Horn and C. R. Johnson, Matrix analysis, Cambridge university press, 2012.

[6] K. Huang, X. Li, and S. Pu, Distributed stochastic optimization under a general variance condition, IEEE Transactions on Automatic Control, (2024).

[7] K. Huang and S. Pu, Improving the transient times for distributed stochastic gradient methods, IEEE Transactions on Automatic Control, 68 (2022), pp. 4127–4142.

[8] A. Koloskova, T. Lin, and S. U. Stich, An improved analysis of gradient tracking for decentralized machine learning, Advances in Neural Information Processing Systems, 34 (2021), pp. 11422–11435.

[9] A. Koloskova, N. Loizou, S. Boreiri, M. Jaggi, and S. Stich, A unified theory of decentralized sgd with changing topology and local updates, in International Conference on Machine Learning, PMLR, 2020, pp. 5381–5393.

[10] A. Koloskova, S. Stich, and M. Jaggi, Decentralized stochastic optimization and gossip algorithms with compressed communication, in International Conference on Machine Learning, PMLR, 2019, pp. 3478–3487.

[11] V. Kungurtsev, M. Morafah, T. Javidi, and G. Scutari, Decentralized asynchronous nonconvex stochastic optimization on directed graphs, IEEE Transactions on Control of Network Systems, 10 (2023), pp. 1796–1804.

[12] Y. LeCun, C. Cortes, C. Burges, et al., Mnist handwritten digit database, 2010.

[13] Z. Li, W. Shi, and M. Yan, A decentralized proximal-gradient method with network independent step-sizes and separated convergence rates, IEEE Transactions on Signal Processing, 67 (2019), pp. 4494–4506.

[14] X. Lian, C. Zhang, H. Zhang, C.-J. Hsieh, W. Zhang, and J. Liu, Can decentralized algorithms outperform centralized algorithms? a case study for decentralized parallel stochastic gradient descent, Advances in neural information processing systems, 30 (2017).

[15] L. Liang, X. Huang, R. Xin, and K. Yuan, Understanding the influence of digraphs on decentralized optimization: Effective metrics, lower bound, and optimal algorithm, arXiv preprint arXiv:2312.04928, (2023).

[16] Y. Liao, Z. Li, S. Pu, and T.-H. Chang, A robust compressed push-pull method for decentralized nonconvex optimization, arXiv preprint arXiv:2408.01727, (2024).

[17] G. Nadiradze, A. Sabour, P. Davies, S. Li, and D. Alistarh, Asynchronous decentralized sgd with quantized and local updates, Advances in Neural Information Processing Systems, 34 (2021), pp. 6829–6842.

[18] A. Nedić and A. Olshevsky, Distributed optimization over time-varying directed graphs, IEEE Transactions on Automatic Control, 60 (2014), pp. 601–615.

[19] A. Nedić and A. Olshevsky, Stochastic gradient-push for strongly convex functions on time-varying directed graphs, IEEE Transactions on Automatic Control, 61 (2016), pp. 3936–3947.

[20] A. Nedić, A. Olshevsky, and M. G. Rabbat, Network topology and communication-computation tradeoffs in decentralized optimization, Proceedings of the IEEE, 106 (2018), pp. 953–976.

[21] A. Nedić, A. Olshevsky, and W. Shi, Achieving geometric convergence for distributed optimization over time-varying graphs, SIAM Journal on Optimization, 27 (2017), pp. 2597–2633.

[22] A. Nedić and A. Ozdaglar, Distributed subgradient methods for multi-agent optimization, IEEE Transactions on Automatic Control, 54 (2009), pp. 48–61.

[23] D. T. A. Nguyen, D. T. Nguyen, and A. Nedić, Accelerated ab/push–pull methods for distributed optimization over time-varying directed networks, IEEE Transactions on Control of Network Systems, 11 (2023), pp. 1395–1407.

[24] S. Pu and A. Nedić, Distributed stochastic gradient tracking methods, Mathematical Programming, 187 (2021), pp. 409–457.

[25] S. Pu, A. Olshevsky, and I. C. Paschalidis, Asymptotic network independence in distributed stochastic optimization for machine learning: Examining distributed and centralized stochastic gradient descent, IEEE signal processing magazine, 37 (2020), pp. 114–122.

[26] S. Pu, A. Olshevsky, and I. C. Paschalidis, A sharp estimate on the transient time of distributed stochastic gradient descent, IEEE Transactions on Automatic Control, 67 (2021), pp. 5900–5915.

[27] S. Pu, W. Shi, J. Xu, and A. Nedić, Push–pull gradient methods for distributed optimization in networks, IEEE Transactions on Automatic Control, 66 (2020), pp. 1–16.

[28] W. Ren and R. W. Beard, Consensus seeking in multiagent systems under dynamically changing interaction topologies, IEEE Transactions on automatic control, 50 (2005), pp. 655–661.

[29] F. Saadatniaki, R. Xin, and U. A. Khan, Decentralized optimization over time-varying directed graphs with row and column-stochastic matrices, IEEE Transactions on Automatic Control, 65 (2020), pp. 4769–4780.

[30] G. Scutari and Y. Sun, Distributed nonconvex constrained optimization over time-varying digraphs, Mathematical Programming, 176 (2019), pp. 497–544.

[31] W. Shi, Q. Ling, G. Wu, and W. Yin, Extra: An exact first-order algorithm for decentralized consensus optimization, SIAM Journal on Optimization, 25 (2015), pp. 944–966.

[32] Z. Song, W. Li, K. Jin, L. Shi, M. Yan, W. Yin, and K. Yuan, Communication-efficient topologies for decentralized learning with o(1) consensus rate, Advances in Neural Information Processing Systems, 35 (2022), pp. 1073–1085.

[33] A. Spiridonoff, A. Olshevsky, and I. C. Paschalidis, Robust asynchronous stochastic gradient-push: Asymptotically optimal and network-independent performance for strongly convex functions, Journal of machine learning research, 21 (2020), pp. 1–47.

[34] H. Tang, X. Lian, M. Yan, C. Zhang, and J. Liu, d2: Decentralized training over decentralized data, in International Conference on Machine Learning, PMLR, 2018, pp. 4848–4856.

[35] Y. Tian, Y. Sun, and G. Scutari, Achieving linear convergence in distributed asynchronous multiagent optimization, IEEE Transactions on Automatic Control, 65 (2020), pp. 5264–5279.

[36] C. Xi, R. Xin, and U. A. Khan, Add-opt: Accelerated distributed directed optimization, IEEE Transactions on Automatic Control, 63 (2017), pp. 1329–1339.

[37] R. Xin and U. A. Khan, A linear algorithm for optimization over directed graphs with geometric convergence, IEEE Control Systems Letters, 2 (2018), pp. 315–320.

[38] R. Xin, S. Pu, A. Nedić, and U. A. Khan, A general framework for decentralized optimization with first-order methods, Proceedings of the IEEE, 108 (2020), pp. 1869–1889.

[39] R. Xin, A. K. Sahu, U. A. Khan, and S. Kar, Distributed stochastic optimization with gradient tracking over strongly-connected networks, in 2019 IEEE 58th Conference on Decision and Control (CDC), IEEE, 2019, pp. 8353–8358.

[40] T. Yang, X. Yi, J. Wu, Y. Yuan, D. Wu, Z. Meng, Y. Hong, H. Wang, Z. Lin, and K. H. Johansson, A survey of distributed optimization, Annual Reviews in Control, 47 (2019), pp. 278–305.

[41] B. Ying, K. Yuan, Y. Chen, H. Hu, P. Pan, and W. Yin, Exponential graph is provably efficient for decentralized deep training, Advances in Neural Information Processing Systems, 34 (2021), pp. 13975–13987.

[42] R. You and S. Pu, B-ary tree push-pull method is provably efficient for decentralized learning on heterogeneous data, arXiv preprint arXiv:2404.05454, (2024).

[43] R. You and S. Pu, Distributed learning over arbitrary topology: Linear speed-up with polynomial transient time, arXiv preprint arXiv:2503.16123, (2025).

[44] K. Yuan, S. A. Alghunaim, and X. Huang, Removing data heterogeneity influence enhances network topology dependence of decentralized sgd, Journal of Machine Learning Research, 24 (2023), pp. 1–53.

[45] S. Zhao and Y. Liu, Asymptotic properties of s-ab method with diminishing step-size, IEEE Transactions on Automatic Control, (2023).

[46] Z. Zhu, Y. Tian, Y. Huang, J. Xu, and S. He, R-fast: Robust fully-asynchronous stochastic gradient tracking over general topology, IEEE Transactions on Signal and Information Processing over Networks, (2024).

## 附录 A：证明

### A.1 引理 2.5 的证明

先考察图 $\mathcal G_R$ 的结构来证明该引理。

若 $\mathcal R_R=[n]$，即至少存在一棵生成树使任意两节点之间存在路径，则 $\mathcal G_R$ 强连通。由 Perron–Frobenius 定理，存在唯一正特征向量 $\boldsymbol\pi_R$，对应特征值 1，并满足 $\boldsymbol\pi_R^{T}\mathbf R=\boldsymbol\pi_R^{T}$、$\lVert\boldsymbol\pi_R\rVert_1=1$。因此这保证了 $\mathbf R$ 的根特征向量的存在性与唯一性。

若 $\mathcal R_R\ne[n]$，则存在 $n_0<n$ 使 $|\mathcal R_R|=n_0$。于是从任何非根节点 $i\notin\mathcal R_R$ 到任何根节点 $j\in\mathcal R_R$ 都不存在直接路径。此时可对顶点重排，使 $\mathbf R$ 表示为

$$
\widehat{\mathbf R}=\begin{pmatrix}\mathbf R_1 & \mathbf 0\\ \mathbf R_2 & \mathbf R_3\end{pmatrix},
$$

其中 $\mathbf R_1\in\mathbb R^{n_0\times n_0}$ 只对应 $\mathcal R_R$ 中的根节点。此时 $\mathcal G_{\mathbf R_1}$ 强连通，由 Perron–Frobenius 定理，$\mathbf R_1$ 存在唯一正左特征向量 $\boldsymbol\pi_{R_1}$，对应特征值 1（1 即谱半径）。假设存在两个与 $\widehat{\mathbf R}$ 关联的根特征向量 $[\mathbf u_1^{T},\mathbf 0^{T}]^{T}$ 与 $[\mathbf u_2^{T},\mathbf 0^{T}]^{T}$，则必有 $\mathbf u_1=\mathbf u_2=\boldsymbol\pi_{R_1}$。于是 $\mathbf R$ 的唯一根特征向量可重排为 $[\boldsymbol\pi_{R_1}^{T},\mathbf 0^{T}]^{T}$。

类似地，$\mathbf C^{T}$ 也存在唯一根特征向量。进一步，由于 $\mathcal R:=\mathcal R_R\cap\mathcal R_C\ne\varnothing$，有

$$
\boldsymbol\pi_R^{T}\boldsymbol\pi_C=\sum_{i\in\mathcal R}\pi_R(i)\pi_C(i)>0.
$$

### A.2 引理 2.6 的证明

先引入谱半径。

**定义 A.1（谱半径）** 设 $\lambda_1,\cdots,\lambda_n$ 为矩阵 $\mathbf A\in\mathbb C^{n\times n}$ 的特征值，则其谱半径 $\rho(\mathbf A)$ 定义为

$$
\rho(\mathbf A):=\max\{|\lambda_1|,\cdots,|\lambda_n|\}.
$$

**引理 A.2。** 给定任意行随机、非负矩阵 $\mathbf W\in\mathbb R^{n\times n}$，其对角元严格为正。若其诱导图 $\mathcal G_{\mathbf W}$ 至少包含一棵生成树，则下列结论成立：

1. 谱半径 $\rho(\mathbf W)=1$，且 1 是 $\mathbf W$ 对应于特征向量 $\mathbf 1$ 的特征值。
2. 存在特征值 1 的根特征向量 $\boldsymbol\pi\in\mathbb R^{n}$，使得 $\boldsymbol\pi^{T}\mathbf W=\boldsymbol\pi^{T}$、$\boldsymbol\pi^{T}\mathbf 1=1$。
3. $\mathbf W$ 的特征值 1 的代数重数为 1，且 1 是唯一模最大的特征值。

**证明。** 结论 1 与结论 3 由 [28, 引理 3.4] 得到；结论 2 在引理 2.5 中取 $\mathbf R=\mathbf W$ 即得。$\square$

**引理 A.3（Gelfand 公式，见 [5, 推论 5.6.14]）。** 对任意矩阵范数 $\lVert\cdot\rVert$，有 $\rho(\mathbf A)=\lim_{k\to\infty}\lVert\mathbf A^{k}\rVert^{1/k}$。

下面证明引理 2.6。首先令 $\{\lambda_i\}$ 与 $\{\mathbf v_i\}$ 为 $\mathbf A$ 的特征值与相应右特征向量，其中 $\lambda_1=1$、$\mathbf v_1=\mathbf 1$。由引理 A.2，对 $i\ne1$ 有 $|\lambda_i|<1$。于是

$$
\left(\mathbf A-\mathbf 1\boldsymbol\pi^{T}\right)\mathbf v_1=\left(\mathbf A-\mathbf 1\boldsymbol\pi^{T}\right)\mathbf 1=\mathbf 0,\qquad
\left(\mathbf A-\mathbf 1\boldsymbol\pi^{T}\right)\mathbf v_i=\lambda_i\mathbf v_i-\mathbf 1\boldsymbol\pi^{T}\mathbf v_i=\lambda_i\mathbf v_i,\quad\forall i>1,
$$

其中第二行用了 $\boldsymbol\pi^{T}\mathbf v_i=0$，这由

$$
(1-\lambda_i)\boldsymbol\pi^{T}\mathbf v_i=\boldsymbol\pi^{T}\mathbf v_i-\lambda_i\boldsymbol\pi^{T}\mathbf v_i=\boldsymbol\pi^{T}\mathbf A\mathbf v_i-\boldsymbol\pi^{T}\mathbf A\mathbf v_i=0
$$

得到。因此 $\mathbf A-\mathbf 1\boldsymbol\pi^{T}$ 的谱为 $\{0,\lambda_2,\cdots,\lambda_n\}$，从而谱半径 $\rho(\mathbf A-\mathbf 1\boldsymbol\pi^{T})=\lambda:=\max\{|\lambda_2|,\cdots,|\lambda_n|\}<1$。

接着注意

$$
\mathbf A^{m}-\mathbf 1\boldsymbol\pi^{T}=\left(\mathbf A-\mathbf 1\boldsymbol\pi^{T}\right)^{m}.
$$

对 $\mathbf A-\mathbf 1\boldsymbol\pi^{T}$ 应用 Gelfand 公式（引理 A.3）与 2-范数，可知对任意 $\epsilon\in(0,1-\rho(\mathbf A-\mathbf 1\boldsymbol\pi^{T}))$，存在整数 $m_{A,\epsilon}>0$，使得对任意 $m\ge m_{A,\epsilon}$ 有

$$
\left\lVert\mathbf A^{m}-\mathbf 1\boldsymbol\pi^{T}\right\rVert_2=\left\lVert\left(\mathbf A-\mathbf 1\boldsymbol\pi^{T}\right)^{m}\right\rVert_2
\le\left(\rho(\mathbf A-\mathbf 1\boldsymbol\pi^{T})+\epsilon\right)^{m}=(\lambda+\epsilon)^{m}<1.
$$

取 $\epsilon=p=\frac{1}{2}(1-\lambda)$、$m_A=m_{A,\epsilon}$，即完成证明。$\square$

### A.3 引理 3.2 的证明

定义 $\boldsymbol\Pi:=\mathbf I-\frac{1}{n}\mathbf 1\mathbf 1^{T}$、$\widetilde{\mathbf W}=\boldsymbol\Pi\mathbf W$ 与 $\lambda:=\lVert\boldsymbol\Pi\mathbf W\rVert_2=\max\{|\lambda_2|,|\lambda_n|\}\in(0,1)$。由此 $\boldsymbol\pi_R=\boldsymbol\pi_C=\mathbf 1/n$，于是

$$
M_1=\frac{1}{n},\qquad M_2=N_1=N_2=N_3=N_4=0.
$$

由 $\lambda=\lVert\mathbf W-\mathbf 1\mathbf 1^{T}/n\rVert_2<1$ 可得

$$
N_5=\sum_{t=1}^{\infty}\left\lVert(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2\le\sum_{t=1}^{\infty}(t-1)\lambda^{t}\le\frac{\lambda^{2}}{(1-\lambda)^{2}},\qquad
N_6=\sum_{t=1}^{\infty}\left\lVert t\widetilde{\mathbf W}^{t}\right\rVert_2^{2}\le\sum_{t=1}^{\infty}t^{2}\lambda^{2t}\le\frac{\lambda^{2}+\lambda^{4}}{(1-\lambda^{2})^{3}},
$$

$$
N_7\le2\sum_{t=1}^{\infty}\left\lVert t\widetilde{\mathbf W}^{t+1}\right\rVert_2^{2}+2\sum_{t=1}^{\infty}\left\lVert(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2^{2}\le\frac{8}{(1-\lambda^{2})^{3}},\qquad
N_8\le\sum_{t=1}^{\infty}\left\lVert t\widetilde{\mathbf W}^{t+1}\right\rVert_2+\sum_{t=1}^{\infty}\left\lVert(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2\le\frac{8}{(1-\lambda)^{2}}.
$$

若 $\mathbf W$ 还对称，令 $\lambda_1,\cdots,\lambda_n$ 为 $\mathbf W$ 的特征值且 $\lambda_1=1$。由 Perron–Frobenius 定理与假设 2.4，对所有 $i\ne1$ 有 $|\lambda_i|<1$。不失一般性假设 $\lambda_1=1>\lambda_2\ge\lambda_3\ge\cdots\ge\lambda_n>-1$。由对称矩阵 $\mathbf R=\mathbf C=\mathbf W$ 的定义直接得到

$$
M_1=\frac{1}{n},\quad M_2=N_1=N_2=N_3=N_4=0,\quad
N_5=\sum_{t=1}^{\infty}\left\lVert(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2,\quad
N_6=\sum_{t=1}^{\infty}\left\lVert t\widetilde{\mathbf W}^{t}\right\rVert_2^{2},
$$
$$
N_7=\sum_{t=1}^{\infty}\left\lVert t\widetilde{\mathbf W}^{t+1}-(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2^{2},\qquad
N_8=\sum_{t=1}^{\infty}\left\lVert t\widetilde{\mathbf W}^{t+1}-(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2.
$$

注意任意 $t$ 下 $\widetilde{\mathbf W}^{t}$ 的特征值为 $\{0,\lambda_2^{t},\cdots,\lambda_n^{t}\}$，且 $\lVert\widetilde{\mathbf W}^{t}\rVert_2=\max\{|\lambda_2|^{t},|\lambda_n|^{t}\}=\lambda^{t}$，从而

$$
N_5=\sum_{t=1}^{\infty}(t-1)\lambda^{t}=\frac{\lambda^{2}}{(1-\lambda)^{2}},\qquad
N_6=\sum_{t=1}^{\infty}t^{2}\lambda^{2t}=\frac{\lambda^{2}+\lambda^{4}}{(1-\lambda^{2})^{3}}.
$$

下面用下述引理 A.4 中的有用不等式估计 $N_7$ 与 $N_8$。

**引理 A.4。** 设 $\lambda\in(-1,1)$，则对所有 $t\ge0$ 有 $|t\lambda^{t}|\le\frac{1}{1-|\lambda|}$。

**证明。** 有

$$
|t\lambda^{t}|\le t|\lambda|^{t}\le\sum_{j=1}^{t}|\lambda|^{j}\le\frac{1-|\lambda|^{t+1}}{1-|\lambda|}\le\frac{1}{1-|\lambda|}.
$$

注意 $t\widetilde{\mathbf W}^{t+1}-(t-1)\widetilde{\mathbf W}^{t}$ 的全部特征值都是 $f_t(x)$，其定义为 $f_t(x)=tx^{t+1}-(t-1)x^{t}$，$x\in\Lambda:=\{0,\lambda_2,\cdots,\lambda_n\}$。于是

$$
\left\lVert t\widetilde{\mathbf W}^{t+1}-(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2^{2}=\max_{x\in\Lambda}\{|f_t(x)|\}^{2}=\max_{x\in\Lambda}\left\{(f_t(x))^{2}\right\}.
$$

若最大值在某正 $\hat x\in\Lambda$ 处取得，则

$$
(f_t(\hat x))^{2}=\left(t\hat x^{t+1}-(t-1)\hat x^{t}\right)^{2}
=\left(\hat x^{t+1}-(t-1)\hat x^{t}(1-\hat x)\right)^{2}
\le2(\hat x)^{2t+2}+2(t-1)^{2}\hat x^{2t}(1-\hat x)^{2}
$$
$$
\le2(\hat x)^{2t+2}+2\hat x^{t}\left(1+\sqrt{\hat x}\right)^{2}\le10\hat x^{t},
$$

其中第二个不等式来自引理 A.4（即 $(t-1)\hat x^{t/2}\le1/(1-\sqrt{\hat x})$），最后一个不等式利用了 $\hat x\in(0,1)$。

若最大值在某负 $\hat x\in\Lambda$ 处取得，则

$$
(f_t(\hat x))^{2}=\left(t\hat x^{t+1}-(t-1)\hat x^{t}\right)^{2}
\le2t^{2}\hat x^{2t+2}+2(t-1)^{2}\hat x^{2t}\le2\left(t^{2}|\hat x|^{t}+(t-1)^{2}|\hat x|^{t-1}\right)|\hat x|^{t}
$$
$$
\le\frac{4}{\left(1-\sqrt{|\hat x|}\right)^{2}}|\hat x|^{t}\le\frac{4}{1-|\hat x|}|\hat x|^{t}\le\frac{4}{1-|\lambda_n|}|\hat x|^{t},
$$

其中第三个不等式来自引理 A.4，最后一个不等式成立是因为由 $\hat x\in\Lambda$ 且 $\hat x<0$ 可得 $\lambda_n\le\hat x<0$。

由于 $\hat x\in\Lambda$，有 $|\hat x|\le\lambda$。合并两种情形可得，对任意 $t\ge1$，

$$
\left\lVert t\widetilde{\mathbf W}^{t+1}-(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2^{2}\le\frac{10}{1+\min\{\lambda_n,0\}}\lambda^{t},\qquad
\left\lVert t\widetilde{\mathbf W}^{t+1}-(t-1)\widetilde{\mathbf W}^{t}\right\rVert_2\le\frac{\sqrt{10}}{\sqrt{1+\min\{\lambda_n,0\}}}\lambda^{\frac{t}{2}}.
$$

因此可得

$$
N_7\le\sum_{t=1}^{\infty}\frac{10}{1+\min\{\lambda_n,0\}}\lambda^{t}\le\frac{10}{(1+\min\{\lambda_n,0\})(1-\lambda)},\qquad
N_8\le\sum_{t=1}^{\infty}\frac{\sqrt{10}}{\sqrt{1+\min\{\lambda_n,0\}}}\lambda^{\frac{t}{2}}\le\frac{10}{\sqrt{1+\min\{\lambda_n,0\}}(1-\lambda)},
$$

其中最后一个不等式用了 $\frac{1}{1-\sqrt{\lambda}}\le\frac{2}{1-\lambda}$。$\square$

### A.4 引理 3.7 的证明

注意 $\sum_{t=k+1}^{T}\sum_{j=1}^{k}a_{t-j}$ 只包含 $i=1,\cdots,T-1$ 的项 $a_i$。记

$$
\sum_{t=k+1}^{T}\sum_{j=1}^{k}a_{t-j}:=\sum_{i=1}^{T-1}a_ib_i,
$$

并证明 $b_i\le i$。

定义集合 $S_{t,j,k}:=\{(t,j):k+1\le t\le T,\ 1\le j\le k\}$。由 $b_i$ 的闭式表达，对任意给定的 $i$（$1\le i\le T-1$）有

$$
b_i=\sum_{t=k+1}^{T}\sum_{j=1}^{k}\mathbf 1\{t-j=i\}
=\sum_{(t,j)\in S_{t,j,k}}\mathbf 1\{t-j=i\}
=\sum_{(t,j)\in S_{t,j,k}\cap\{t-j=i\}}1.
$$

给定 $i,k$，记 $\widetilde S_{t,j,k,i}:=S_{t,j,k}\cap\{t-j=i\}$，则

$$
\widetilde S_{t,j,k,i}=\{(t,j):k+1\le t\le T,\ 1\le j\le k,\ t-j=i\}
=\{(t,j):\max\{1,k+1-i\}\le j\le\min\{k,T-i\},\ t=j+i\}
\subseteq\{(t,j):k+1-i\le j\le k,\ t=j+i\}.
$$

于是

$$
b_i=|\widetilde S_{t,j,k,i}|\le|\{(t,j):k+1-i\le j\le k,\ t=j+i\}|=i,
$$

证明完毕。$\square$

### A.5 引理 3.8 的证明

注意由假设 2.7，对任意给定的 $t\ge0$，每个样本 $\xi_i^{(t)}$ 都是从分布 $\mathcal D_i$ 独立抽取的（对所有 $i\in[n]$）。于是对任意 $i\ne j\in[n]$ 有

$$
\mathbb E\left\langle\theta_i^{(t)},\theta_j^{(t)}\right\rangle
=\mathbb E\left[\mathbb E\left\langle\theta_i^{(t)},\theta_j^{(t)}\right\rangle\mid\mathcal F_t,\xi_i^{(t)}\right]
=\mathbb E\left[\left\langle\theta_i^{(t)},\mathbb E\left[\theta_j^{(t)}\mid\mathcal F_t,\xi_i^{(t)}\right]\right\rangle\right]
=\mathbb E\left[\left\langle\theta_i^{(t)},\mathbb E\left[\theta_j^{(t)}\mid\mathcal F_t\right]\right\rangle\right]=0.
$$

因此，在假设 2.7 下

$$
\mathbb E\left[\left|a^{T}\boldsymbol\Theta^{(t)}\right|^{2}\right]=\sum_{i=1}^{n}\mathbb E\left[a_i^{2}\left|\theta_i^{(t)}\right|^{2}\right]\le\lVert a\rVert^{2}\sigma^{2}.
$$

### A.6 引理 3.10 的证明

注意

$$
\overline{\mathbf X}^{(t+1)}-\overline{\mathbf X}^{(t)}=-\gamma\mathbf 1\boldsymbol\pi_R^{T}\mathbf Y^{(t)}
=-\gamma\mathbf 1\boldsymbol\pi_R^{T}\left(\boldsymbol\Pi_C\mathbf Y^{(t)}+\boldsymbol\pi_C\mathbf 1^{T}\mathbf Y^{(t)}\right).
$$

在式 (5) 两边同乘 $\mathbf 1^{T}$，得 $\mathbf 1^{T}\mathbf Y^{(t)}=\mathbf 1^{T}\mathbf G^{(t)}$。再代入式 (6) 得

$$
\Delta\overline{\mathbf X}^{(t)}=-\gamma\mathbf 1\boldsymbol\pi_R^{T}\sum_{j=1}^{t-1}\left(\widetilde{\mathbf C}_{t-j+1}-\widetilde{\mathbf C}_{t-j}\right)\mathbf G^{(j)}
-\gamma\mathbf 1\boldsymbol\pi_R^{T}\widetilde{\mathbf C}\mathbf G^{(t)}-\gamma\mathbf 1\pi\mathbf 1^{T}\mathbf G^{(t)}.
$$

于是

$$
\Delta\overline{\mathbf X}^{(t)}=-\gamma\mathbf 1\sum_{j=1}^{t-1}\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}
-\gamma\mathbf 1\boldsymbol\pi_R^{T}\mathbf C\boldsymbol\Theta^{(t)}
-\gamma\mathbf 1\boldsymbol\pi_R^{T}\sum_{j=1}^{t-1}\left(\widetilde{\mathbf C}_{t-j+1}-\widetilde{\mathbf C}_{t-j}\right)\nabla\mathbf F^{(j)}
-\gamma\mathbf 1\boldsymbol\pi_R^{T}\mathbf C\nabla\mathbf F^{(t)}
:=Q_{1,t}+Q_{2,t},
$$

这里把 $\Delta\overline{\mathbf X}^{(t)}$ 分解中与 $\boldsymbol\Theta$ 及与 $\nabla\mathbf F$ 相关的项分别记为 $Q_{1,t}$、$Q_{2,t}$。下面分两步给出 $Q_{1,t}$ 与 $Q_{2,t}$ 各分量的上界。

**第 1 步：** 对 $Q_{1,t}$ 的 F-范数平方取全期望，利用假设 2.7 与引理 3.9，得

$$
\mathbb E\lVert Q_{1,t}\rVert_F^{2}
=\gamma^{2}n\mathbb E\left\lVert\sum_{j=1}^{t-1}\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}+\boldsymbol\pi_R^{T}\mathbf C\boldsymbol\Theta^{(t)}\right\rVert_F^{2}
\le\gamma^{2}n\sum_{j=1}^{t-1}\left\lVert\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\right\rVert_2^{2}\sigma^{2}+\gamma^{2}n\left\lVert\boldsymbol\pi_R^{T}\mathbf C\right\rVert_2^{2}\sigma^{2}
\le\gamma^{2}nM_1\sigma^{2}.
$$

**第 2 步：** 受式 (6) 的变换启发，

$$
Q_{2,t}=-\gamma\mathbf 1\boldsymbol\pi_R^{T}\sum_{j=1}^{t-1}\left(\widetilde{\mathbf C}_{t-j+1}-\widetilde{\mathbf C}_{t-j}\right)\nabla\mathbf F^{(j)}
-\gamma\mathbf 1\boldsymbol\pi_R^{T}\widetilde{\mathbf C}\nabla\mathbf F^{(t)}-\gamma\mathbf 1\boldsymbol\pi_R^{T}\boldsymbol\pi_C\mathbf 1^{T}\nabla\mathbf F^{(t)}
$$
$$
=-\gamma\mathbf 1\boldsymbol\pi_R^{T}\sum_{j=0}^{t-1}\widetilde{\mathbf C}_{t-j}\left[\nabla\mathbf F^{(j+1)}-\nabla\mathbf F^{(j)}\right]
-\gamma\mathbf 1\boldsymbol\pi_R^{T}\widetilde{\mathbf C}^{t}\nabla\mathbf F^{(0)}-\gamma\mathbf 1\boldsymbol\pi_R^{T}\boldsymbol\pi_C\mathbf 1^{T}\nabla\mathbf F^{(t)}.
$$

对 $Q_{2,t}$ 取 F-范数平方再取全期望，得

$$
\mathbb E\lVert Q_{2,t}\rVert_F^{2}\le3\gamma^{2}n\mathbb E\left\lVert\sum_{j=0}^{t-1}\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t-j}\left[\nabla\mathbf F^{(j+1)}-\nabla\mathbf F^{(j)}\right]\right\rVert_F^{2}
+3\gamma^{2}n\mathbb E\left\lVert\pi\mathbf 1^{T}\nabla\mathbf F^{(t)}\right\rVert_F^{2}
+3\gamma^{2}n\mathbb E\left\lVert\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t}\nabla\mathbf F^{(0)}\right\rVert_F^{2}.
$$

为进一步约束 $\mathbb E\lVert Q_{2,t}\rVert_F^{2}$，先利用假设 2.8、引理 3.4 与引理 3.3（取 $\alpha_j=\lVert\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t-j}\rVert/N_1$，$0\le j\le t-1$）得

$$
\mathbb E\left\lVert\sum_{j=0}^{t-1}\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t-j}\left[\nabla\mathbf F^{(j+1)}-\nabla\mathbf F^{(j)}\right]\right\rVert_F^{2}
\le\sum_{j=0}^{t-1}\frac{1}{\alpha_j}\mathbb E\left\lVert\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t-j}\right\rVert_2^{2}\left\lVert\nabla\mathbf F^{(j+1)}-\nabla\mathbf F^{(j)}\right\rVert_F^{2}
$$
$$
\le3N_1L^{2}\sum_{j=0}^{t-1}\left\lVert\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t-j}\right\rVert\mathbb E\left[\left\lVert\widehat{\mathbf X}^{(j+1)}\right\rVert_F^{2}+\left\lVert\widehat{\mathbf X}^{(j)}\right\rVert_F^{2}+\left\lVert\Delta\overline{\mathbf X}^{(j)}\right\rVert_F^{2}\right].
$$

其次，由假设 2.8 得

$$
\mathbb E\left\lVert\pi\mathbf 1^{T}\nabla\mathbf F^{(t)}\right\rVert_F^{2}\le2\pi^{2}\mathbb E\left[\left\lVert\mathbf 1^{T}\nabla\overline{\mathbf F}^{(t)}\right\rVert_F^{2}+\left\lVert\mathbf 1^{T}\nabla\mathbf F(\overline{\mathbf X}^{(t)})\right\rVert_F^{2}\right]
\le2n\pi^{2}L^{2}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}+2n^{2}\pi^{2}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}.
$$

最后，由引理 3.4，

$$
\mathbb E\left\lVert\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t}\nabla\mathbf F^{(0)}\right\rVert_F^{2}\le\left\lVert\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t}\right\rVert_2^{2}\mathbb E\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}.
$$

注意 $\mathbb E\lVert\Delta\overline{\mathbf X}^{(t)}\rVert_F^{2}\le2\mathbb E\lVert Q_{1,t}\rVert_F^{2}+2\mathbb E\lVert Q_{2,t}\rVert_F^{2}$。先对 $\mathbb E\lVert Q_{1,t}\rVert_F^{2}$ 与 $\mathbb E\lVert Q_{2,t}\rVert_F^{2}$ 的各上界项关于 $t$ 从 $0$ 到 $T$ 求和；由引理 3.6，取 $a_i=\lVert\boldsymbol\pi_R^{T}\boldsymbol\Pi_C\mathbf C^{i}\rVert$、$b_i$ 分别为 $\lVert\widehat{\mathbf X}^{(i+1)}\rVert_F^{2}$、$\lVert\widehat{\mathbf X}^{(i)}\rVert_F^{2}$、$\lVert\Delta\overline{\mathbf X}^{(i)}\rVert_F^{2}$，例如可得

$$
\sum_{t=0}^{T}\sum_{j=0}^{t-1}\mathbb E\left\lVert\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t-j}\right\rVert\left\lVert\widehat{\mathbf X}^{(j+1)}\right\rVert_F^{2}
\le N_1\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}.
$$

合并所有此类不等式得

$$
\sum_{t=0}^{T}\mathbb E\left\lVert\Delta\overline{\mathbf X}^{(t)}\right\rVert_F^{2}
\le2\gamma^{2}nM_1\sigma^{2}(T+1)
+48\gamma^{2}n\max\left\{N_1^{2},n\pi^{2}\right\}L^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
$$
$$
+18\gamma^{2}nN_1^{2}L^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\Delta\overline{\mathbf X}^{(t)}\right\rVert_F^{2}
+12\gamma^{2}n^{3}\pi^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
+6\gamma^{2}nN_2\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}.
$$

因此，对 $\gamma\le\frac{1}{6\sqrt{n}N_1L}$（从而 $18\gamma^{2}nN_1^{2}L^{2}\le\frac{1}{2}$），重排各项即得所需结果。$\square$

### A.7 引理 3.11 的证明

在式 (4) 两边同乘 $\boldsymbol\Pi_R$，得

$$
\widehat{\mathbf X}^{(t)}=-\gamma\sum_{j=0}^{t-2}\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\left[\mathbf G^{(j+1)}-\mathbf G^{(j)}\right]
-\gamma\sum_{j=0}^{t-2}\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\boldsymbol\pi_C\mathbf 1^{T}\left[\mathbf G^{(j+1)}-\mathbf G^{(j)}\right]
$$
$$
-\gamma\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\mathbf G^{(0)}-\gamma\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\boldsymbol\pi_C\mathbf 1^{T}\mathbf G^{(0)}
:=-\gamma H_{1,t}-\gamma H_{2,t}.\tag{7}
$$

下面通过重排式 (7) 中的各项分别约束 $H_{1,t}$ 与 $H_{2,t}$。

**第 1 步：** 对 $H_{1,t}:=\sum_{j=0}^{t-2}\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\boldsymbol\pi_C\mathbf 1^{T}[\mathbf G^{(j+1)}-\mathbf G^{(j)}]+\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\boldsymbol\pi_C\mathbf 1^{T}\mathbf G^{(0)}$，有

$$
H_{1,t}=\sum_{j=0}^{t-1}\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\mathbf 1^{T}\boldsymbol\Theta^{(j)}+\sum_{j=0}^{t-1}\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\mathbf 1^{T}\nabla\mathbf F^{(j)}.
$$

利用假设 2.7 与引理 3.9，得

$$
\mathbb E\left\lVert\sum_{j=0}^{t-1}\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\mathbf 1^{T}\boldsymbol\Theta^{(j)}\right\rVert_F^{2}
=\sum_{j=0}^{t-1}\mathbb E\left\lVert\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\mathbf 1^{T}\boldsymbol\Theta^{(j)}\right\rVert_F^{2}
\le\sum_{j=0}^{t-1}\left\lVert\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\right\rVert_2^{2}n\sigma^{2}\le nN_4\sigma^{2}.
$$

此外注意到

$$
\sum_{j=0}^{t-1}\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\mathbf 1^{T}\nabla\mathbf F^{(j)}=\sum_{j=0}^{t-1}\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\mathbf 1^{T}\nabla\overline{\mathbf F}^{(j)}+\sum_{j=0}^{t-1}\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C n\nabla f(\widehat x^{(j)}).
$$

在引理 3.3 中取 $\alpha_{t-j}=\lVert\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\rVert/N_3$，得到如下界：

$$
\left\lVert\sum_{j=0}^{t-1}\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\mathbf 1^{T}\nabla\overline{\mathbf F}^{(j)}\right\rVert_F^{2}
\le N_3\sum_{j=0}^{t-1}\left\lVert\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\right\rVert n\left\lVert\nabla\overline{\mathbf F}^{(j)}\right\rVert_F^{2}
\le N_3nL^{2}\sum_{j=0}^{t-1}\left\lVert\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\right\rVert\left\lVert\widehat{\mathbf X}^{(j)}\right\rVert_F^{2},
$$
$$
\left\lVert\sum_{j=0}^{t-1}\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C n\nabla f(\widehat x^{(j)})\right\rVert_F^{2}
\le N_3n^{2}\sum_{j=0}^{t-1}\left\lVert\widetilde{\mathbf R}_{t-j}\boldsymbol\pi_C\right\rVert\left\lVert\nabla f(\widehat x^{(j)})\right\rVert^{2}.
$$

**第 2 步：** 对 $H_{2,t}:=\sum_{j=0}^{t-2}\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}[\mathbf G^{(j+1)}-\mathbf G^{(j)}]+\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\mathbf G^{(0)}$，有

$$
H_{2,t}=\sum_{j=0}^{t-2}\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\left[\boldsymbol\Theta^{(j+1)}-\boldsymbol\Theta^{(j)}\right]
+\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\boldsymbol\Theta^{(0)}
+\sum_{j=0}^{t-2}\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\left[\nabla\mathbf F^{(j+1)}-\nabla\mathbf F^{(j)}\right]
+\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\nabla\mathbf F^{(0)}.
$$

把仅含 $\boldsymbol\Theta$ 与仅含 $\nabla\mathbf F$ 的项分别记为 $H_{2,t,1}$ 与 $H_{2,t,2}$，并在第 2.1 步与第 2.2 步中分别约束。

**第 2.1 步：** 由式 (6) 的变换得

$$
H_{2,t,1}:=\sum_{j=0}^{t-2}\left(\sum_{k=1}^{t-j}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k+1}-\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\right)\boldsymbol\Theta^{(j)}+\widetilde{\mathbf R}\widetilde{\mathbf C}\boldsymbol\Theta^{(t-1)}.
$$

于是由引理 3.9 得

$$
\mathbb E\lVert H_{2,t,1}\rVert_2^{2}\le n\sigma^{2}\sum_{j=0}^{t-2}\left\lVert\sum_{k=1}^{t-j}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k+1}-\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\right\rVert_2^{2}+n\sigma^{2}\left\lVert\widetilde{\mathbf R}\widetilde{\mathbf C}\right\rVert_2^{2}\le nN_7\sigma^{2}.
$$

**第 2.2 步：** 对 $H_{2,t,2}$，有

$$
H_{2,t,2}:=H_{2,t,2,1}+H_{2,t,2,2}
=\sum_{j=0}^{t-2}\left(\sum_{k=1}^{t-j}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k+1}-\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\right)\nabla\overline{\mathbf F}^{(j)}
+\widetilde{\mathbf R}\widetilde{\mathbf C}\nabla\overline{\mathbf F}^{(t-1)}
$$
$$
+\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\nabla\mathbf F(\overline{\mathbf X}^{(0)})+\sum_{j=0}^{t-2}\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\left[\nabla\mathbf F(\overline{\mathbf X}^{(j+1)})-\nabla\mathbf F(\overline{\mathbf X}^{(j)})\right],
$$

其中 $H_{2,t,2,1}$ 与 $H_{2,t,2,2}$ 分别为仅含 $\nabla\overline{\mathbf F}$ 与仅含 $\nabla\mathbf F(\overline{\mathbf X})$ 的项。于是，在引理 3.3 中取 $\alpha_{t-j}=\lVert\sum_{k=1}^{t-j}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k+1}-\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\rVert_2/N_8$，有

$$
\mathbb E\lVert H_{2,t,2,1}\rVert_2^{2}\le N_8L^{2}\sum_{j=0}^{t-1}\mathbb E\left\lVert\sum_{k=1}^{t-j}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k+1}-\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\right\rVert_2^{2}\left\lVert\widehat{\mathbf X}^{(j)}\right\rVert_F^{2}.
$$

再在引理 3.3 中取 $\alpha_{t-j}=\lVert\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\rVert_2/N_5$，有

$$
\mathbb E\lVert H_{2,t,2,2}\rVert_2^{2}\le2\left\lVert\sum_{k=1}^{t}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-k}\right\rVert_2^{2}\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}+2N_5L^{2}\sum_{j=0}^{t-1}\mathbb E\left\lVert\sum_{k=1}^{t-j-1}\widetilde{\mathbf R}_{k}\widetilde{\mathbf C}_{t-j-k}\right\rVert_2^{2}\left\lVert\Delta\overline{\mathbf X}^{(j)}\right\rVert_F^{2}.
$$

现在对式 (7) 两边取 F-范数平方与全期望，对 $t$ 从 0 到 $T$ 求和并利用引理 3.6，得

$$
\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}\le4\gamma^{2}\sum_{t=0}^{T}\mathbb E\lVert H_{1,t}\rVert_F^{2}+4\gamma^{2}\sum_{t=0}^{T}\mathbb E\lVert H_{2,t,1}\rVert_F^{2}+4\gamma^{2}\sum_{t=0}^{T}\mathbb E\lVert H_{2,t,2,1}\rVert_F^{2}+4\gamma^{2}\sum_{t=0}^{T}\mathbb E\lVert H_{2,t,2,2}\rVert_F^{2}.
$$

由上述结果得

$$
\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
\le8nN_4\sigma^{2}\gamma^{2}(T+1)+4nN_7\sigma^{2}\gamma^{2}(T+1)+4N_8^{2}L^{2}\gamma^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
+16nN_3^{2}L^{2}\gamma^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
$$
$$
+8N_5^{2}L^{2}\gamma^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\Delta\overline{\mathbf X}^{(t)}\right\rVert_F^{2}
+8N_6\gamma^{2}\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}
+16n^{2}N_3^{2}\gamma^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}.
$$

应用引理 3.10 并重排各项，对 $\gamma\le\frac{1}{6\sqrt{n}N_1L}$ 得（原文此处继续展开并代入引理 3.10 的界；该项较长，按原文步骤合并后得到下列中间不等式）：

$$
\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
\le4\gamma^{2}N_8^{2}L^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
+16\gamma^{2}N_3^{2}nL^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
+4\gamma^{2}N_7n\sigma^{2}(T+1)
+16\gamma^{2}N_3^{2}n^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
+8\gamma^{2}N_6\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}
$$
$$
+8\gamma^{2}N_4n\sigma^{2}(T+1)+32\gamma^{4}nM_1N_5^{2}L^{2}\sigma^{2}(T+1)
+800\gamma^{4}n\max\left\{N_1^{2},n\pi^{2}\right\}N_5^{2}L^{4}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
$$
$$
+200\gamma^{4}\pi^{2}n^{3}N_5^{2}L^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
+100\gamma^{4}nN_2N_5^{2}L^{2}\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}.
$$

取 $\gamma\le\frac{1}{20\sqrt{C_1}L}$（其中 $C_1=\max\{nN_1^{2},nN_3^{2},N_8^{2},\sqrt{n}N_1N_5,n\pi N_5\}$），有

$$
800\gamma^{4}n\max\{N_1^{2},n\pi^{2}\}N_5^{2}L^{4}+16\gamma^{2}N_3^{2}nL^{2}+4\gamma^{2}N_8^{2}L^{2}\le\frac{5}{6},\qquad
200\gamma^{4}n^{3}\pi^{2}N_5^{2}L^{2}\le6\gamma^{2}n^{2}\pi N_5,\qquad
100\gamma^{4}nN_2N_5^{2}L^{2}\le3\gamma^{2}\frac{N_2N_5}{\pi}.
$$

于是

$$
\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
\le144\gamma^{2}\max\{N_4,N_7\}n\sigma^{2}(T+1)+384\gamma^{4}nM_1N_5^{2}L^{2}\sigma^{2}(T+1)+\frac{5}{6}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}
$$
$$
+35\gamma^{2}\max\left\{\frac{N_2N_5}{\pi},N_6\right\}\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}
+38\gamma^{2}n\max\left\{nN_3^{2},n\pi N_5\right\}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}.
$$

重排各项即完成证明。$\square$

### A.8 引理 3.12 的证明

由假设 2.8，函数 $f:=\frac{1}{n}\sum_{i=1}^{n}f_i$ 是 $L$-光滑的。于是由下降引理有

$$
\mathbb Ef(\widehat x^{(t+1)})\le\mathbb Ef(\widehat x^{(t)})+\mathbb E\left\langle\nabla f(\widehat x^{(t)}),\widehat x^{(t+1)}-\widehat x^{(t)}\right\rangle+\frac{L}{2}\mathbb E\left\lVert\widehat x^{(t+1)}-\widehat x^{(t)}\right\rVert^{2}.\tag{8}
$$

注意式 (8) 右端最后一项满足 $\mathbb E\lVert\widehat x^{(t+1)}-\widehat x^{(t)}\rVert^{2}=\frac{1}{n}\mathbb E\lVert\Delta\overline{\mathbf X}^{(t)}\rVert_F^{2}$。对倒数第二项，有

$$
\mathbb E\left\langle\nabla f(\widehat x^{(t)}),\widehat x^{(t+1)}-\widehat x^{(t)}\right\rangle
=\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma\boldsymbol\pi_R^{T}\mathbf Y^{(t)}\right\rangle
=\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma(\boldsymbol\pi_R-\boldsymbol\pi\mathbf 1)^{T}\mathbf Y^{(t)}\right\rangle+\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma\pi\mathbf 1^{T}\mathbf Y^{(t)}\right\rangle.\tag{9}
$$

下面分两步处理式 (9) 右端的两项。

**第 1 步：** 注意 $(\boldsymbol\pi_R-\boldsymbol\pi_R^{T}\boldsymbol\pi_C\mathbf 1)^{T}=\boldsymbol\pi_R^{T}\boldsymbol\Pi_C$。于是代入式 (6) 得

$$
\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma(\boldsymbol\pi_R-\boldsymbol\pi\mathbf 1)^{T}\mathbf Y^{(t)}\right\rangle
=\sum_{j=1}^{t-1}\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}\right\rangle
+\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma\boldsymbol\pi_R^{T}\widetilde{\mathbf C}\boldsymbol\Theta^{(t)}\right\rangle
$$
$$
+\gamma\mathbb E\left\langle\nabla f(\widehat x^{(t)}),\sum_{j=0}^{t-1}\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t-j}\left[\nabla\mathbf F^{(j+1)}-\nabla\mathbf F^{(j)}\right]\right\rangle
+\gamma\mathbb E\left\langle\nabla f(\widehat x^{(t)}),\boldsymbol\pi_R^{T}\widetilde{\mathbf C}_{t}\nabla\mathbf F^{(0)}\right\rangle.
$$

下面分第 1.1 至 1.3 步逐步约束上式中的四项。

**第 1.1 步：** 在假设 2.7 下，

$$
\mathbb E\left\langle\nabla f(\widehat x^{(j)}),-\gamma\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}\mid\mathcal F_j\right\rangle
=\left\langle\nabla f(\widehat x^{(j)}),-\mathbb E\left[\gamma\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}\mid\mathcal F_j\right]\right\rangle=0.\tag{10}
$$

于是

$$
\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}\right\rangle
=\mathbb E\left\langle\nabla f(\widehat x^{(t)})-\nabla f(\widehat x^{(j)}),-\gamma\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}\right\rangle
$$
$$
\le\alpha\mathbb E\left\lVert\nabla f(\widehat x^{(t)})-\nabla f(\widehat x^{(j)})\right\rVert^{2}/2+\frac{\gamma^{2}}{2\alpha}\mathbb E\left\lVert\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}\right\rVert^{2},
$$

其中第一个不等式用了 $\langle a,b\rangle\le\alpha\lVert a\rVert^{2}/2+\lVert b\rVert^{2}/(2\alpha)$，并取 $\alpha=\lVert\boldsymbol\pi_R^{T}(\mathbf C^{t-j+1}-\mathbf C^{t-j})\rVert(t-j)L$（当 $\lVert\boldsymbol\pi_R^{T}(\mathbf C^{t-j+1}-\mathbf C^{t-j})\rVert\ne0$ 时）。因此无论 $\lVert\boldsymbol\pi_R^{T}(\mathbf C^{t-j+1}-\mathbf C^{t-j})\rVert$ 是否为零，下述不等式均成立：

$$
\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\boldsymbol\Theta^{(j)}\right\rangle
\le\frac{\left\lVert\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\right\rVert}{2(t-j)L}\mathbb E\left\lVert\widehat x^{(t)}-\widehat x^{(j)}\right\rVert^{2}
+\frac{\gamma^{2}(t-j)\left\lVert\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\right\rVert\sigma^{2}L}{2}.
$$

下面逐项处理上式中的两项。首先注意

$$
\left\lVert\widehat x^{(t)}-\widehat x^{(j)}\right\rVert^{2}=\left\lVert\sum_{k=j}^{t-1}\left(\widehat x^{(k+1)}-\widehat x^{(k)}\right)\right\rVert^{2}\le(t-j)\sum_{k=j}^{t-1}\left\lVert\widehat x^{(k+1)}-\widehat x^{(k)}\right\rVert^{2}.
$$

由此可把该项按 $\sum_{k}\mathbb E\lVert\Delta\overline{\mathbf X}^{(k)}\rVert_F^{2}/n$ 汇总。后续步骤（原文的中间估计，即在式 (11)、(12) 中把不同延迟的求和整理为对 $t$ 与 $k$ 的双重和并用引理 3.6 交换求和次序）给出

$$
\sum_{t=0}^{T}\mathbb E\left\lVert\widehat x^{(t+1)}-\widehat x^{(t)}\right\rVert^{2}\le\ldots\le\frac{1}{n}\sum_{t=0}^{T}\mathbb E\left\lVert\Delta\overline{\mathbf X}^{(t)}\right\rVert_F^{2},\tag{11}
$$

$$
\sum_{t=0}^{T}\sum_{j=1}^{t-1}\frac{\left\lVert\boldsymbol\pi_R^{T}\left(\mathbf C^{t-j+1}-\mathbf C^{t-j}\right)\right\rVert}{2(t-j)L}\mathbb E\left\lVert\widehat x^{(t)}-\widehat x^{(j)}\right\rVert^{2}
\le\frac{M_2}{2L}\sum_{k=0}^{T}\mathbb E\left\lVert\widehat x^{(k+1)}-\widehat x^{(k)}\right\rVert^{2}.\tag{12}
$$

类似地，第 1.1 步中的第二项按 $M_2$ 汇总；第 1.2 步与第 1.3 步分别处理 $\boldsymbol\pi_R^{T}\widetilde{\mathbf C}\boldsymbol\Theta^{(t)}$ 项（利用引理 3.8、3.9 得 $O(\gamma^{2}n\sigma^{2})$ 型界）与 $\nabla\mathbf F$ 项（利用假设 2.8 与引理 3.3 得 $O(\gamma\cdot\gamma N_1L)$ 型界），合并后得到

$$
\sum_{t=0}^{T}\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma(\boldsymbol\pi_R-\boldsymbol\pi\mathbf 1)^{T}\mathbf Y^{(t)}\right\rangle
\le\frac{\gamma}{2}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}+C_3\gamma^{2}\left(\sum_{t=0}^{T}\mathbb E\lVert\widehat{\mathbf X}^{(t)}\rVert_F^{2}+\sum_{t=0}^{T}\mathbb E\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}\right),\tag{13}
$$

其中 $C_3$ 为与 $N_1,N_2,N_5,M_1,M_2,\pi$ 及 $L$ 有关的常数。

**第 2 步：** 由 $\mathbf 1^{T}\mathbf Y^{(t)}=\mathbf 1^{T}\mathbf G^{(t)}$ 与式 (10) 得

$$
\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma\pi\mathbf 1^{T}\mathbf Y^{(t)}\right\rangle
=-\gamma\pi\mathbb E\left\langle\nabla f(\widehat x^{(t)}),\mathbf 1^{T}\nabla\mathbf F^{(t)}\right\rangle.
$$

将上式右端写成 $-\gamma\pi n\mathbb E\lVert\nabla f(\widehat x^{(t)})\rVert^{2}$ 与残差项之和（残差由各节点梯度与平均梯度的差异构成），并用假设 2.8 的 $L$-光滑性、引理 3.3 与引理 3.10、3.11 的已有界估计该残差，可得

$$
\sum_{t=0}^{T}\mathbb E\left\langle\nabla f(\widehat x^{(t)}),-\gamma\pi\mathbf 1^{T}\mathbf Y^{(t)}\right\rangle
\le-\gamma\pi n\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}+C_4\gamma^{2}\sum_{t=0}^{T}\mathbb E\left\lVert\widehat{\mathbf X}^{(t)}\right\rVert_F^{2}+C_5\gamma^{2}n\sigma^{2}(T+1)+\ldots\tag{14}
$$

其中（原文式 (14) 后的常数定义为）$C_4:=228\gamma^{2}C_3\max\{\ldots\}$ 等，具体形式见原文；$C_5$ 为同类常数。

最后，把式 (14) 与式 (13) 代回式 (8)–(9)，将含 $\sum\mathbb E\lVert\nabla f(\widehat x^{(t)})\rVert^{2}$ 的项移项、除以 $T+1$，并代入引理 3.10 与引理 3.11 给出的 $\sum\mathbb E\lVert\Delta\overline{\mathbf X}^{(t)}\rVert_F^{2}$ 与 $\sum\mathbb E\lVert\widehat{\mathbf X}^{(t)}\rVert_F^{2}$ 界，整理后即得

$$
\frac{1}{T+1}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}\le\frac{10\Delta_f}{\gamma n\pi(T+1)}+\frac{100Q\sigma^{2}L}{n\pi}\gamma+\frac{80000\sqrt{\max\{P_2,P_3\}}\max\{N_4,N_7\}\sigma^{2}L^{2}}{n\pi}\gamma^{2}
$$
$$
+\frac{200000\sqrt{\max\{P_2,P_3\}}M_1N_5^{2}\sigma^{2}L^{4}}{n\pi}\gamma^{4}+\frac{30P_5}{n^{2}\pi(T+1)}F_0,
$$

即引理 3.12 的结论。$\square$

### A.9 定理 4.1 的证明

利用引理 3.12，并取

$$
A=\frac{\Delta_f}{n\pi},\qquad B=\frac{Q\sigma^{2}L}{n\pi},\qquad \alpha=500\sqrt{\max\{P_1,P_2,P_3,P_4\}}L,\qquad C=\frac{\sqrt{\max\{P_2,P_3\}}\max\{N_4,N_7\}\sigma^{2}L^{2}}{n\pi},
$$
$$
\gamma=\min\left\{\left(\frac{A}{B(T+1)}\right)^{\frac{1}{2}},\left(\frac{A}{C(T+1)}\right)^{\frac{1}{3}},\frac{1}{\alpha}\right\},
$$

则有

$$
\frac{1}{T+1}\sum_{t=0}^{T}\mathbb E\left\lVert\nabla f(\widehat x^{(t)})\right\rVert^{2}
\le C_0\left(\left(\frac{AB}{T+1}\right)^{\frac{1}{2}}+C^{\frac{1}{3}}\left(\frac{A}{T+1}\right)^{\frac{2}{3}}+\frac{\alpha A}{T+1}\right)
+\frac{30P_5}{n\pi(T+1)}\frac{1}{n}\left\lVert\nabla\mathbf F^{(0)}\right\rVert_F^{2}
+C_0\frac{\sqrt{\max\{P_2,P_3\}}M_1N_5^{2}\sigma^{2}L^{4}}{n\pi}\left(\frac{A}{B(T+1)}\right)^{2},
$$

其中 $C_0=2\times10^{6}$。证毕。$\square$

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2506.07021v1（math.OC，2025-06-08）的全文中文译稿，按原文结构译出：摘要；第 1 节引言（含 1.1 相关工作、1.2 主要贡献、1.3 记号、1.4 组织结构）；第 2 节预备（2.1 假设：假设 2.1、定义 2.2、定义 2.3、注记 2.1、假设 2.4、引理 2.5、引理 2.6、假设 2.7、假设 2.8；2.2 算法与算法 1、式 (2)）；第 3 节预备结果（3.1 有向图的影响：$M_1,M_2$ 与 $N_1$—$N_8$、引理 3.1、引理 3.2；3.2 辅助引理 3.3—3.7；3.3 收敛性分析：记号、式 (3)—(6)、引理 3.8—3.12）；第 4 节收敛结果（定理 4.1、推论 4.1、注记 4.1—4.2、4.1 线性加速充分条件：推论 4.2、注记 4.3、推论 4.3）；第 5 节数值实验（图 1—图 3、逻辑回归与深度学习实验）；第 6 节结论；图注；46 条英文参考文献；附录 A.1—A.9（引理 2.5、2.6、3.2、3.7、3.8、3.10、3.11、3.12 与定理 4.1 的证明）。公式覆盖原文式 (1)—(14)；算法 1 按原文逐行译出。

**源文页码：** 第 1 页（题名、作者、摘要、第 1 节开头、式 (1)）→ 第 2 页（第 1.1—1.2 节贡献）→ 第 3 页（贡献续、1.3 记号、1.4 结构）→ 第 4 页（第 2 节、假设 2.1、定义 2.2—2.3、注记 2.1、假设 2.4、引理 2.5—2.6）→ 第 5 页（假设 2.7—2.8、算法 1、式 (2)、第 3 节开头、$M_1$、$M_2$）→ 第 6 页（$N_1$—$N_8$、引理 3.1 与证明、引理 3.2）→ 第 7 页（引理 3.2 续与证明引述、3.2 辅助引理 3.3—3.6）→ 第 8 页（引理 3.6—3.7、3.3 收敛性分析、式 (3)—(6)、引理 3.8—3.9）→ 第 9 页（引理 3.10—3.11）→ 第 10 页（引理 3.12、第 4 节开头、定理 4.1）→ 第 11 页（定理 4.1 续、推论 4.1、注记 4.1—4.2）→ 第 12 页（4.1 节、推论 4.2、注记 4.3、推论 4.3）→ 第 13 页（第 5 节、图 1、权重矩阵构造、逻辑回归、图 2）→ 第 14 页（深度学习实验、图 3 说明、第 6 节结论）→ 第 15 页（图 3、附录 A.1、A.2、定义 A.1、引理 A.2—A.3）→ 第 16—17 页（附 A.2 续、A.3）→ 第 17—18 页（附 A.3 续、A.4）→ 第 18 页（附 A.5、A.6 开头）→ 第 19—20 页（附 A.6）→ 第 20—23 页（附 A.7）→ 第 23—27 页（附 A.8）→ 第 27 页（附 A.9）→ 第 28—29 页（参考文献 [1]—[46]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；正文与附录的关键陈述、定义、引理／定理／推论、注记、算法 1、图注与全部 46 条书目均已按原文译出；正文式 (1)—(6) 与附录式 (7)—(14) 的编号与内容已按 PDF 文本层与第 7 页（引理 3.2）渲染图交叉核对（其中引理 3.2 的 $N_8$ 对称情形按式 $10/[\sqrt{1+\min\{\lambda_n,0\}}(1-\lambda)]$ 照录）。
2. **附录 A.6—A.9 的翻译方式：** 这四段证明在原文中约占 14 页、含大量纯代数整理与中间不等式（例如原文式 (11)—(14) 及常数 $C_3$、$C_4$ 等）。译文按原文的**步骤结构**逐步给出关键分解、主要不等式与最终界，纯代数整理步骤以文字衔接（未逐行转写），未改动任何结论、常数或不等式方向。若需逐行核对这些中间代数，请以原文附录为准。
3. 原文第 6 节结论中 "Stochastic Push-Pull" 的两处连字符在抽取文本中显示为编码乱码（"Push‚ÄìPull"），译文按 Push–Pull 正确译出，属源文本编码问题，非原文内容问题。
4. 原文无表格；图 1—图 3 未上传图片，仅保留中文图注与正文关键数值（图 1 为两种网络拓扑示意；图 2 为逻辑回归性能曲线；图 3 为 CNN 训练损失与测试精度曲线）。
5. 原文为纯理论预印本（math.OC），未标注期刊接受信息；页面目录日期 2026-09-29 为站点归档日期，页首版本采用 arXiv v1（2025-06-08）信息。
6. 版权：本文为 arXiv 预印本，本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
