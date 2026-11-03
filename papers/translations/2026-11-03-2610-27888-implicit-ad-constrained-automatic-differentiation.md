---
layout: page
title: "前向与逆问题中带约束的自动微分｜中文全文译文"
permalink: /papers/translations/2026-11-03-2610-27888-implicit-ad-constrained-automatic-differentiation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/bab6e10f08b83b0a/) · [原文 arXiv](https://arxiv.org/abs/2610.27888/) · [全部目录](/papers/catalog/)

# 前向与逆问题中带约束的自动微分

**原题：** Automatic Differentiation with Constraints in Forward and Inverse Problems  
**作者：** Nikolay Yavich、Alexander Ryabov、Viacheslav Naumov、Sayan Ranu、N. M. Anoop Krishnan、Evgeny Burnaev、Vladimir Vanovskiy（按 PDF 原文转写；Nikolay Yavich 标注为通讯作者）  
**作者单位（PDF 第 1 页）：** \(^{1}\) 俄罗斯莫斯科 121205，斯科尔科沃科学技术研究院（Skolkovo Institute of Science and Technology）人工智能中心（Artificial Intelligence Center）；\(^{2}\) 印度新德里 Hauz Khas 110016，印度理工学院德里分校（Indian Institute of Technology Delhi）Yardi 人工智能学院（Yardi School of Artificial Intelligence）；\(^{3}\) 俄罗斯莫斯科 105064，自主非营利组织人工智能研究院（Autonomous Non-Profit Organization Artificial Intelligence Research Institute，AIRI）可学习智能组（Learnable Intelligence Group）。通讯作者邮箱：`n.yavich@skoltech.ru`。  
**版本：** arXiv:2610.27888v2（PDF 首页 arXiv 戳：arXiv:2610.27888v2 [cs.AI]，21 Oct 2026）；18 页；预印本/状态未确认；许可：CC BY-NC-ND 4.0（仅本地保存，不公开分发）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 1–6 节及全部小节（含 §3.2–3.3 前向/反向传播推导、§4.1–4.5 实验、§5 结论、§6 致谢）、式 (1)–(25) 编号、图 1–5 图注（含分图 (a)–(f) 逐项转写）、参考文献 [1]–[37]（英文原条目）；原文无表格、无算法框。许可：CC BY-NC-ND 4.0（仅本地保存，不公开分发）；本页不公开发布。逐句逐式终校未做。

## 摘要

偏微分方程（partial differential equation，PDE）在非结构网格上的近似解可以用图表示。涉及刚性（stiff）演化方程与静态方程的数值优化，往往需要求解一个大型方程组，而该方程组可被视为一项约束。本文提出一个完全可微的、基于图的隐式求解器，把这一约束纳入其中。我们在四项关键任务上评估其性能：a) 演化问题与静态问题的线性与非线性正演建模；b) 求解反问题以估计方程系数；c) 求解反问题以估计右端项；d) 可学习的图粗化（graph coarsening）以加速正演建模。该求解器的稳定性与可微性使我们能够显著降低正演建模的复杂度，同时高效处理相关反问题。这些能力使其成为面向不同物理与工程应用的有力工具，尤其在地球物理（geophysics）领域——那里常通过求解反问题来降低模型不确定性。

**关键词：** 可微求解器、隐式时间推进（implicit time-stepping）、网格粗化、反问题。

## 1 引言

近年来，图神经网络（graph neural networks，GNN）已成为处理非结构网格数据的有力工具 [12, 18, 33, 34]。借助消息传递（message-passing）机制，GNN 在捕获局部依赖并通过节点连接更新节点特征方面非常有效。这一能力引发了把 GNN 应用于 PDE 求解器的日益浓厚的兴趣，尤其是在数据可表示为图的问题中，例如 Voronoi 网格与有限体积离散。

有限体积（finite-volume，FV）方法是求解 PDE 的成熟数值技术，尤其在非结构网格上，因为它能保证局部守恒性。把 FV 方法与基于 GNN 的求解器结合，可为区域提供结构化、无网格（grid-free）的表示，同时保持求解控制方程的严格框架。在这一背景下，可微求解器的发展是一个尤具前景的研究方向。

本文探索的一项关键进展，是在基于 GNN 的求解器中应用自动微分（automatic differentiation，AD）[24]，尤其用于图粗化与反问题求解等任务。AD 已被证明是高效梯度优化中不可或缺的工具。在涉及双曲（hyperbolic）方程的反问题中使用 AD，已在 [37] 中得到展示。

本文聚焦抛物型（parabolic）偏微分方程，它们在包括工程与油气工业在内的多个应用领域中至关重要。然而，由此产生的演化问题刚性很强，由于其稳定性，必须采用隐式时间推进格式。此外，我们还处理椭圆型（elliptic）偏微分方程，其特有挑战在于求解大型稀疏线性系统。

自动微分（AD）[3, 4] 是构造函数梯度的成熟工具。尽管一些 AD 库支持变量之间的隐式关系（例如 [14]），但它们处理稀疏线性求解器的能力目前仍相当有限。JAX [15] 求解器基于 QR 矩阵分解，适用于中小规模问题，但对更大规模的问题会过慢且内存消耗过高。Torch 的类似功能 [25, 26] 仍在开发之中。本文表明，可微的隐式求解器可以建立在任何自动微分框架之上。为此，我们针对自身需求开发了自定义的 autograd 函数。

在这一基础之上，我们提出一种集成方法，把 GNN、有限体积方法、隐式时间推进与自动微分结合起来，为正向（forward）与反向（inverse）建模构建完全可微的流水线。我们的方法确保了对各种组件的可微性，包括网格单元位置、PDE 系数与右端项，从而为处理正演建模与反问题提供一个灵活而稳健的框架。

我们应当强调，本文的重点在于设计与使用**渐近正确**（非可训练）的可微隐式 FV 求解器，而非为其训练代理模型（详见第 2 节）。

具体而言，我们聚焦以下关键问题：

- 刚性演化问题与静态问题的正演建模；
- 求解反问题以估计方程系数；
- 求解反问题以估计未知右端项；
- 图粗化以加速正演建模。

我们展示了所提方法有效处理上述全部问题的能力，体现其在油气地球物理建模与其他基于 PDE 的应用中的灵活性与易实现性。

## 2 相关工作

近期相当多的文献可以归类为**代理建模**（surrogate modeling）。在正演问题语境中，目标是逼近方程的格林函数（Green's function），如 [1, 20, 21] 所示。[23] 的工作把隐式图神经网络用于这一任务。隐式深度学习 [6]（也称深度均衡模型，deep equilibrium models，DEQ）用带预测方程的非线性均衡方程替换特定层上的常规激活函数。DEQ 与 GNN 结合即所谓隐式 GNN [11]。其优势在于数据在图内瞬时传播，而不像传统深度学习那样以有限速度传播。[13] 提出了一种在有限体积法中计算通量的可学习方法，其动机来自对流主导（convection-dominated）问题。

对反问题而言，目标是用给定数据集逼近一个可能非线性的正演算子之逆。例如，[35] 用 GNN 处理该问题；[16] 中作者用新颖的几何特征增强 GNN 以提高预测精度。

这类方法的主要缺陷在于训练对海量数据的需求（从 GB 到 TB 量级）。此外，训练计算代价高昂，常需数百至数千个 GPU 小时。更重要的是，与采用经典数值格式的求解器相比，所得解的可解释性较差。然而，如下文所示，我们的方法在求解反问题时，在质量与计算开销两方面都优于 PINN。

在反问题的传统方法中（如 [36] 所述），需要对每个新数据集重新执行优化。这些算法依赖雅可比（Jacobian）矩阵的推导，而这是一项繁琐且易出错的任务。自动微分（AD）流水线的可用性有助于避免该问题。例如，[37] 提出了一种基于 AD 的声学数据反演方法，并结合波动方程的显式 Euler 时间离散。本文沿相近方向，展示如何把隐式格式集成到 AD 流水线中，并进一步与 GNN 结合。

我们的方法与物理信息神经网络（physics-informed neural networks，PINN）[17, 27], [22] 及其扩展（如图卷积 PINN [9]）密切相关，因为两类方法都可视为自监督学习技术。

## 3 方法

### 3.1 控制方程

本文主要考虑某区域 \(V\) 中的抛物型偏微分方程

$$
\frac{\partial u}{\partial t}-\operatorname{div}(K\nabla u)=f,\quad 0<t<T,\ (x,y)\in V,\tag{1}
$$

其中 \(u(x,y,t)\) 为未知变量，\(K(x,y)\) 为正系数，\(f(x,y,t)\) 为源项。上述方程以初始条件 \(u=u^{0}(x,y)\)（\(t=0\) 时）以及区域边界上的零 Neumann 边界条件补充完整。

假设给定一组点 \(C_{s}\)，\(1\le s\le N\)。我们用这些点生成 Voronoi 网格（原文此处写作“(1)”，疑为引用残留，按原文保留）。把用于空间离散的有限体积方法（FVM）[7, 19] 与用于时间离散的隐式 Euler 格式结合，可得到 (1) 的数值解：

$$
D\frac{u^{k+1}-u^{k}}{\tau}+A\cdot u^{k+1}=Df^{k+1},\quad 0\le k\le n-1,\tag{2}
$$

其中 \(u^{k}\in\mathbb R^{N}\)（\(0\le k\le n\)）为相应时间步上的数值解，\(A\) 为有限体积矩阵，\(D\) 为 Voronoi 单元面积构成的对角矩阵，\(f^{k}\) 为源向量。

我们在图神经网络（GNN）框架内以消息传递范式实现了有限体积方法。我们的 GNN 求解器使用图上边的权重

$$
w_{ij}=-A_{ij}.\tag{3}
$$

由于每个非零的非对角矩阵元素都对应图中的某条边，因此可以用 GNN 的消息传递机制实现矩阵—向量乘法 \(A\cdot u^{k}\)。

### 3.2 问题设定

静态问题与演化问题的正演、反演优化，都可以写成如下形式：

$$
L(\theta)=\sum_{k=1}^{n}\left\|R\cdot u^{k}(\theta)-u^{k}_{\mathrm{obs}}\right\|^{2}+S(\theta),\tag{4}
$$

其中 \(\theta\in\mathbb R^{M}\) 为需要估计的未知参数，\(n\) 为时间测量点数（静态问题为 1），\(u^{k}(\theta)\in\mathbb R^{N}\) 为模型变量，\(R:\mathbb R^{N}\to\mathbb R^{m}\) 为测量算子，\(u^{k}_{\mathrm{obs}}\in\mathbb R^{m}\) 为第 \(k\) 个时间点的实测数据，\(S(\theta)\) 为稳定化项（stabilizer）。算子 \(R\) 的作用只是从给定向量中保留若干条目（传感器所在位置），同时去掉其余条目。

静态问题与涉及隐式时间推进的演化问题，都需要求解一个大型稀疏方程组

$$
A(\theta)\cdot u^{k}(\theta)=f^{k}(\theta),\quad 1\le k\le n,\tag{5}
$$

它构成对 (4) 的约束。

一种朴素的做法可能是消去 \(u^{k}(\theta)\)，从而得到无约束优化问题

$$
L(\theta)=\sum_{k=1}^{n}\left\|R\cdot A(\theta)^{-1}\cdot f^{k}(\theta)-u^{k}_{\mathrm{obs}}\right\|^{2}+S(\theta),\tag{6}
$$

然而这并不可行，因为 \(A(\theta)^{-1}\) 是一个大型稠密矩阵，不适合包括反向传播在内的各种操作。

另一种做法可能借助深度学习中常用的优化技术来求解该隐式方程，例如为方程 (5) 构造一个最小化问题并与数据损失函数结合，从而有可能避免矩阵求逆。然而，由椭圆型 PDE 离散得到的矩阵（如 (5) 中的矩阵）条件数极高。把此类矩阵纳入优化问题，会导致最小化算法（无论随机还是确定性）收敛极慢。实践中，(5) 通常用直接求解器或预处理迭代求解器求解。

请注意如下两点。第一，常用于最小化 (4) 的自动微分系统可能无法处理像 (5) 这样的隐式关系，或者相应功能可能受限。第二，在实际建模中，通常链接自定义开发的高速并行求解器来求解 (5)。为同时应对这两种情况，我们将在下一小节推导前向与反向传播的公式。

### 3.3 前向与反向传播

我们假设 (5) 中的系统矩阵是对称正定（symmetric and positive-definite）的，这在隐式时间推进与静态问题中通常是成立的。为简洁起见，把系统改写为

$$
A\cdot u=b\quad\text{或}\quad\sum_{j}a_{ij}u_{j}=b_{i},\tag{7}
$$

矩阵 \(A\) 规模大且稀疏，因此采用特殊格式只存储其非零值，例如压缩稀疏行（compressed sparse row，CSR）或坐标（coordinate，COO）格式。

在前向传播阶段，我们需要求解 (7)，形式上可写为

$$
u=A^{-1}\cdot b.\tag{8}
$$

实用算法避免存储 \(A^{-1}\) 以及与其相乘。

在反向传播阶段，我们需要计算 \(u\) 关于 \(A\) 与 \(b\) 的梯度。关于 \(b\) 的梯度可如下得到：

$$
\sum_{j}a_{ij}\frac{\partial u_{j}}{\partial b_{k}}=\delta_{ik},\tag{9}
$$

因此

$$
\nabla_{b}u=A^{-1}.\tag{10}
$$

关于 \(A\) 的梯度具有如下形式：

$$
\sum_{j}\frac{\partial a_{ij}}{\partial a_{km}}u_{j}+\sum_{j}a_{ij}\frac{\partial u_{j}}{\partial a_{km}}=0,\tag{11}
$$

因此

$$
\nabla_{A}u=-A^{-1}\cdot P\cdot u,\tag{12}
$$

其中 \(P\) 为扰动矩阵，即除一个元素为 1 外其余全为零的矩阵。

现在，这些表达式可用于高效计算损失 \(L\) 关于 \(A\) 与 \(b\) 的梯度。注意

$$
\nabla_{b}L=\nabla_{u}L\cdot\nabla_{b}u,\qquad\text{以及}\qquad\nabla_{A}L=\nabla_{u}L\cdot\nabla_{A}u,\tag{13}
$$

其中 \(\nabla_{u}L\) 是损失关于解 \(u\) 的梯度，由计算图后续阶段反向传播而来。

把 (10) 与 (12) 代入 (13)，得到

$$
\nabla_{b}L=\nabla_{u}L\cdot A^{-1},\tag{14}
$$

以及

$$
\nabla_{A}L=-\nabla_{u}L\cdot A^{-1}\cdot P\cdot u=-\nabla_{b}L\cdot P\cdot u.\tag{15}
$$

最后这些表达式蕴含如下反向传播阶段的计算算法：

1. 用 (14) 计算 \(\nabla_{b}L\)，这等价于求解一个线性系统；
2. 通过把 \(\nabla_{b}L\) 与 \(-u\) 的相应条目相乘来计算 \(\nabla_{A}L\)。

因此，反向传播阶段的计算复杂度等价于求解一个方程组的复杂度。由于 \(A\) 以稀疏矩阵格式存储，(15) 归结为只对非零元素求导。

我们应当强调，自动微分（AD）中的前向与反向传播，和约束优化中的直接状态与伴随状态（direct and adjoint states）这两个概念之间，存在紧密的概念联系。在前向模式（forward mode）AD 中，输出对输入的敏感度沿计算图按与原始函数求值相同的方向传播，这与优化中的**直接方法**（direct approach）相对应——在直接方法中，状态方程向前求解，以得到解及其相关敏感度。相反，反向（或反向模式）AD 通过逆序遍历计算图，把导数从输出传播到输入，这等价于优化中的**伴随方法**（adjoint method）：它不直接通过前向扰动计算敏感度，而是引入由反向方程支配的伴随变量，从而能够高效计算关于大量参数的梯度。因此，AD 中前向模式与反向模式之间的对偶，反映了约束优化中直接表述与伴随表述之间的对偶；两种框架都利用底层方程的结构性质来降低大规模问题的计算成本 [2, 10]。

## 4 实验

### 4.1 实现

我们的可微图仿真器基于图神经网络中的消息传递范式实现。为构造这样的求解器，我们使用了 PyTorch Geometric [8] 框架。式 (14) 与 (15) 在 PyTorch 自定义 autograd 函数中实现。图粗化的优化则采用对二维 Voronoi 镶嵌（Voronoi tessellation）自动微分的方法 [30] 实现。我们流水线的示意图见图 1。

**图 1（原文 Fig. 1）：** 本文开发的可微建模流水线，结合了图神经网络、有限体积方法与隐式时间推进，可应用于正演与反问题中的优化。图中标注包括：目标泛函 \(L(\theta)=\frac{1}{2}\|u(\theta)-u_{\mathrm{obs}}\|^{2}\to\min\) 以及算子形式的约束 \(\frac{\partial u(\theta)}{\partial t}+A(\theta)u(\theta)=f(\theta)\)；“图神经网络”（Graph neural network）；“失配更新”（Misfit update）；参数更新式 \(\theta_{k+1}=\theta_{k}-\alpha\nabla L(\theta_{k})\) 与“参数更新”（Parameter update）；以网格序列 \(\mathbf u^{0},\mathbf u^{1},\mathbf u^{2},\dots\) 表示的场演化；“带自定义 autograd 的 AD”（AD with custom autograd）；以及“有限体积方法”（Finite volume method）与离散方程 \(A(\theta)u^{n+1}(\theta)=f(\theta)\)。

### 4.2 线性抛物型方程的可学习图粗化

设一个多边形区域充满非均质多孔介质。假设在某一点注入微可压缩（slightly compressible）流体，并在另外一些点测量压力。经少量简化后 [5]，流体流动可由抛物型方程 (1) 描述。

在这些实验中，粗化过程由图神经网络（GNN）引导，该网络学习软聚类分配（soft cluster assignments），把细网格上的节点映射到更粗的簇。我们的方法建立在 [31] 之上，但不对点位置求解全局优化问题，而是采用图粗化方法。此外，本文把基线 [31] 中使用的显式时间推进替换为隐式时间推进 (2)。

我们用于粗化的 GNN 架构包含单个图卷积层，随后是逐点多层感知机（multilayer perceptron，MLP），它由两层全连接层构成、末尾为 softmax 激活，用于预测软分配矩阵 \(S_{ij}\) 以进行概率聚类。与参考工作一样，源点与测量点的特征在粗化过程中保持不变。特征聚合在数学上表示为

$$
\mathbf c_{j}=\frac{\sum_{i=1}^{N}S_{ij}\mathbf x_{i}}{\sum_{i=1}^{N}S_{ij}},\tag{16}
$$

其中 \(\mathbf c_{j}\) 为簇 \(j\) 的质心特征，\(\mathbf x_{i}\) 为节点 \(i\) 的特征向量，\(S_{ij}\) 为节点 \(i\) 对簇 \(j\) 的软分配。关于粗化算法的其他细节可见 [29]。

第一个实验中，建模区域为八边形，并划分为 252 个单元，见图 2a)。渗透率系数 \(K\) 从 \(10^{-3}\) 变化到 \(10^{4}\)，使问题高度非均质。我们用 (2) 对压力建模，时间步长 \(\tau\) 取 0.1 s。压力值在两个测量点记录，相应时间序列见图 2c)。尽管两个测量点相对源点对称，但它们位于渗透率不同的区域，从而导致不同的压力增长率。

该实验中，(4) 的最小化用 Adam 优化器完成且不使用稳定化项。我们选取包含 25 个单元的粗网格，并通过最小化粗、细网格上压力值随时间的失配来优化它。约 200 个 epoch 后得到近似最优的网格，见图 2b)。在图 2 中，我们观察到压力时间序列吻合得很好，粗化后的网格形状也相当规则。这说明了我们框架的稳健性与稳定性。

**图 2（原文 Fig. 2）：** 线性抛物型方程 (1) 的计算网格粗化。a) 原始网格，颜色表示渗透率，源以蓝色菱形标出，两个测量点（1 和 2）以黑色菱形标出；b) 粗化后的网格；c) 两个测量点处的数据，分别由原始网格与粗化网格建模；d) 优化过程中的损失函数。

### 4.3 非线性抛物型方程的可学习图粗化

我们针对描述多孔介质中可压缩流体流动的非线性抛物型方程，开展了可学习图粗化实验：

$$
\frac{\partial}{\partial t}\left(\phi(u)\rho(u)\right)-\operatorname{div}\left(\rho(u)\frac{K}{\mu}\nabla u\right)=q,\tag{17}
$$

在非线性方程 (17) 中，密度 \(\rho\) 与孔隙度 \(\phi\) 都依赖压力：

$$
\rho(u)=\rho_{r}e^{c_{\rho}(u-u_{r})}\tag{18}
$$

$$
\phi(u)=\phi_{r}e^{c_{\phi}(u-u_{r})}\tag{19}
$$

其中 \(\rho_{r}\)、\(\phi_{r}\)、\(c_{\rho}\)、\(c_{\phi}\) 与 \(u_{r}\) 为某些常数。黏度 \(\mu\) 也假设为常数。

为求解 (17)，我们实现了半隐式（semi-implicit）时间离散。让我们考察项 \(\rho(u)\phi(u)\) 并定义 \(c(u)\)：

$$
\frac{\partial}{\partial t}\left(\phi(u)\rho(u)\right)=c(u)\frac{\partial u}{\partial t}.\tag{20}
$$

现在回到 (17)：

$$
c(u)\frac{\partial u}{\partial t}-\operatorname{div}\left(\rho(u)\frac{K}{\mu}\nabla u\right)=q.\tag{21}
$$

半隐式时间离散取如下形式：

$$
c(u^{n})V\frac{u^{n+1}-u^{n}}{\tau}+A(u^{n})\cdot u^{n+1}=Vq^{n+1}.\tag{22}
$$

注意上述系统是线性的，尽管其系统矩阵在每个时间步都会被更新。

实验所用参数取值为：初始压力 \(u_{0}=2\cdot10^{7}\) Pa，井中压力 \(u_{w}=10^{7}\) Pa，黏度 \(\mu=0.005\)，\(c_{\rho}=10^{-8}\)，\(\rho_{r}=850.0\)，\(c_{\phi}=10^{-11}\)，\(\phi_{r}=0.3\)，\(u_{r}=2\cdot10^{7}\) Pa。渗透率 \(K\) 从 \(10^{-14}\) 变化到 \(10^{-10}\)，见图 3a)。

结果见图 3。我们把网格规模从 400 个单元减小到 40 个单元，获得了压力时间序列相当好的吻合。

**图 3（原文 Fig. 3）：** 非线性抛物型方程 (17) 的计算网格粗化。a) 原始网格，颜色表示渗透率，源以蓝色菱形标出，两个测量点（1 和 2）以黑色菱形标出；b) 粗化后的网格；c) 两个测量点处的数据，分别由原始网格与粗化网格建模；d) 优化过程中的损失函数。

### 4.4 系数反问题

在许多应用中——尤其在地球科学与地球物理中——估计那些描述某种非均质介质物理性质、但了解甚少的偏微分方程系数，具有至关重要的意义。

我们考虑与上一实验类似的设置，但现在假设真实渗透率 \(K\) 未知。该问题在石油工程中称为**历史拟合**（history matching）[32]。我们通过最小化如下泛函来估计渗透率：

$$
L(K)=\int_{0}^{T}\sum_{i=1}^{m}w_{i}(t)\left(u^{i}_{\mathrm{mod}}(t)-u^{i}_{\mathrm{obs}}(t)\right)^{2}dt+\beta\int_{V}|\nabla K|^{2}dxdy,\tag{23}
$$

并受 (1) 与 \(K(x,y)>0\) 约束。这里，第一项代表数据失配，第二项是促进渗透率平滑性的稳定化项。

实验中，压力在两个空间位置、100 个时间点上测量，\(m=2\)，\(\tau=0.1\) s，\(T=10\) s，见图 4a) 与 c)。Voronoi 网格由含 400 个随机扰动顶点的图生成。

我们对 (23) 应用 Adam 优化器，从 \(K=1\) 开始，持续 250 个 epoch。150 个 epoch 后达到不错的数据拟合，见图 4d)。恢复的渗透率（图 4b)）具备真实场的主要特征：左下方为较低渗透率区域，右上方为较高渗透率区域。我们想指出，反问题总是意味着解的非唯一性，因此真实场与恢复场之间的这种差异是意料之中的。

本实验所用网格相当扭曲，见图 4a)。我们有意选择这样的网格，以展示所提方法的灵活性。

**图 4（原文 Fig. 4）：** 系数反问题的求解。a) 真实渗透率、源与两个测量点（1 和 2）；b) 恢复的渗透率；c) 两个测量点处的压力（数据与预测/拟合）；d) 250 个 epoch 最小化过程中的损失函数。

### 4.5 源反问题

地球科学与地球物理中常遇到的另一类反问题，是估计偏微分方程的右端项。我们采用被称为**自电位法**（self-potential method）[28] 的设置。目标是根据电位观测估计直流源密度。二者由如下方程联系：

$$
-\operatorname{div}(\sigma\nabla u)=f.\tag{24}
$$

上述方程在矩形区域中考虑，底边施加 Dirichlet 边界条件，其余三边施加 Neumann 边界条件。这里 \(\sigma\) 为已知电导率，\(u\) 为电位，\(f\) 为源密度。尽管该方程是静态的，其数值解仍涉及求解一个大型稀疏线性系统，因而与隐式时间推进类似。

源密度通过最小化如下泛函来估计：

$$
L(f)=\sum_{i=1}^{n}w_{i}\left(u^{i}_{\mathrm{mod}}-u^{i}_{\mathrm{obs}}\right)^{2}+\gamma\int_{V}|\kappa\nabla f|^{2}dxdy+\delta\int_{V}f^{2}dxdy,\tag{25}
$$

其中第一项代表数据失配；第二项是促进平滑性的稳定化项，其中 \(\kappa\) 为变系数，用于补偿敏感度随深度的下降；第三项是促进源能量更小的稳定化项；\(\gamma\) 与 \(\delta\) 为权衡用的标量参数。

本实验中，Voronoi 网格由含 900 个随机扰动顶点的图生成。电位在区域上边界的 \(n=28\) 个点上测量，见图 5a)。真实右端项由区域左部的一个源与右部的一个汇（sink）构成。观测数据 \(u_{\mathrm{obs}}\) 通过求解 (24) 并加入 10% 噪声得到。注意该问题高度欠定：我们基于 28 个观测去估计 900 个未知量。

我们对 (25) 应用 Adam 优化器，从 \(f=0\) 开始，持续 100 个 epoch。我们观察到良好的数据拟合与优化器收敛，见图 5c) 与 d)。恢复的与真实的右端项（图 5b) 与 a)）具有共同特征：左部为正值，右部为负值。恢复的右端项相当模糊（smeared），且极值的位置存在偏差。这些伪影与测量设置以及稳定化项的影响有关。使用更先进的稳定化项可以进一步改善反演结果，不过我们同样并不期望解与真实源完全一致。

本实验中，我们把结果与 DeepXDE 软件包 [22] 中实现的 PINN 结果进行了比较。未知解 \(u\) 与右端项 \(f\) 都用前馈神经网络参数化。该网络有两个输入（\(x\) 与 \(y\)）、三层每层 150 个神经元的稠密层，以及两个输出（\(u\) 与 \(f\)）。损失函数定义为方程残差、边界条件残差的 \(L_{2}\) 范数，以及观测数据与模型数据之差的加权和。我们在区域内使用 625 个随机训练残差点，并使用 900 个随机点检验 PDE 残差。网络训练 5000 个 epoch，学习率为 1e-3。

图 5e) 给出用 PINN 估计的右端项 \(f\)。为便于解读，我们把右端项的值插值到上文所用的同一网格。可以看到图 5b) 与图 5e) 中的模式非常相似。我们的结果与 PINN 结果的主要差异在于幅值。我们将其归因于以下原因：测量数据受到源与汇的积分影响，但由于二者幅值相同、符号相反，实际幅值对测量点数据的影响很小。我们的方法比 PINN 更正确地捕获了源与汇的幅值，因为 (25) 中最后两项稳定化项在 PINN 损失中并不存在。

最后，我们注意到我们方法中优化器的收敛显著更快，如图 5d) 与 f) 所示。我们将这一差异归因于 PINN 损失函数的强非线性，而我们的方法涉及二次损失函数 (25)，因而优化更高效。

**图 5（原文 Fig. 5）：** 源反问题的求解。a) 真实右端项 \(f\) 与测量点（黑色菱形）；品红色菱形表示施加 Dirichlet 边界条件的一侧，另外三侧施加 Neumann 边界条件；b) 恢复的右端项；c) 加入噪声后测量点处的观测数据 \(u_{\mathrm{obs}}\)（数据）与预测 \(u_{\mathrm{mod}}\)（拟合）；d) 100 个 epoch 最小化过程中的损失函数：物理损失（(25) 中第一项）与稳定化项（(25) 中后几项）；e) 用 PINN 恢复的右端项 \(f\)；f) 5000 个 epoch 最小化过程中的 PINN 损失函数。

## 5 结论

本文把有限体积方法与隐式时间推进相结合，开发了完全可微的建模流水线，并将其应用于地球科学中的正演与反问题。我们基于 PyTorch 的流水线灵活且易于实现，可集成用于大型稀疏线性系统的新型快速求解器。

作为对比，[31] 给出了使用图粗化加速正演建模的结果，这与我们在 4.2 节中的方法有些相似。然而，由于其使用显式格式，该方法在时间步长上受到显著限制。

两个可学习粗化示例都表明，所得粗网格在显著加速建模过程的同时保持了对原始仿真的高保真度：网格规模缩小 10 倍（意味着至少 10 倍加速）。借助隐式时间推进，我们轻松处理了高度非均质介质中的长期仿真。

我们的方法在求解反问题时，在质量与计算开销两方面都优于常用的 PINN 架构。

我们的流水线具有很高的效率。在未来工作中，我们计划处理大规模三维问题与更复杂的方程，例如多相（multi-phase）流体流动。大规模三维建模与反演通常依赖定制的预处理迭代求解器，因为它们兼具内存效率与快速收敛。我们的流水线易于集成新求解器的能力，使其对工业应用尤其具有吸引力。

本文中，我们在正演建模与数据反演的语境下讨论了粗化。一个有趣的未来研究方向，是把粗化与反演结合起来，使数据反演能在最优粗网格上以更短的时间完成。

## 6 致谢

作者感谢同事 Sergei Shumilin 的许多富有成效的讨论。本研究由俄罗斯科学基金会（Russian Science Foundation）资助，资助号 No. 24-41-02035，https://rscf.ru/en/project/24-41-02035/

## 参考文献（英文原条目）

[1] Ferran Alet, Adarsh K. Jeewajee, Maria Bauza, Alberto Rodriguez, Tomas Lozano-Perez, and Leslie Pack Kaelbling. Graph element networks: adaptive, structured computation and memory, 2019. URL https://arxiv.org/abs/1904.09019.

[2] Pierre Baldi. Gradient descent learning algorithms: a unified perspective, page 509–541. L. Erlbaum Associates Inc., USA, 1995. ISBN 0805812598.

[3] Michael Bartholomew-Biggs, Steven Brown, Bruce Christianson, and Laurence Dixon. Automatic differentiation of algorithms. Journal of Computational and Applied Mathematics, 124(1):171–190, 2000. ISSN 0377-0427. doi: https://doi.org/10.1016/S0377-0427(00)00422-2. URL https://www.sciencedirect.com/science/article/pii/S0377042700004222. Numerical Analysis 2000. Vol. IV: Optimization and Nonlinear Equations.

[4] Atılım Günes Baydin, Barak A. Pearlmutter, Alexey Andreyevich Radul, and Jeffrey Mark Siskind. Automatic differentiation in machine learning: a survey. J. Mach. Learn. Res., 18(1):5595–5637, January 2017. ISSN 1532-4435.

[5] Zhangxin Chen. Reservoir Simulation: Mathematical Techniques in Oil Recovery. Society for Industrial and Applied Mathematics, January 2007. ISBN 9780898717075. doi: 10.1137/1.9780898717075. URL http://dx.doi.org/10.1137/1.9780898717075.

[6] Laurent El Ghaoui, Fangda Gu, Bertrand Travacca, Armin Askari, and Alicia Tsai. Implicit deep learning. SIAM Journal on Mathematics of Data Science, 3(3):930–958, January 2021. ISSN 2577-0187. doi: 10.1137/20m1358517. URL http://dx.doi.org/10.1137/20M1358517.

[7] Robert Eymard, Thierry Gallouët, and Raphaèle Herbin. Finite volume methods, page 713–1018. Elsevier, 2000. doi: 10.1016/s1570-8659(00)07005-8. URL http://dx.doi.org/10.1016/s1570-8659(00)07005-8.

[8] Matthias Fey and Jan Eric Lenssen. Fast graph representation learning with pytorch geometric, 2019. URL https://arxiv.org/abs/1903.02428.

[9] Han Gao, Matthew J. Zahr, and Jian-Xun Wang. Physics-informed graph neural galerkin networks: A unified framework for solving pde-governed forward and inverse problems. Computer Methods in Applied Mechanics and Engineering, 390:114502, February 2022. ISSN 0045-7825. doi: 10.1016/j.cma.2021.114502. URL http://dx.doi.org/10.1016/j.cma.2021.114502.

[10] A. Griewank and A. Walther. Evaluating Derivatives: Principles and Techniques of Algorithmic Differentiation, Second Edition. Other Titles in Applied Mathematics. Society for Industrial and Applied Mathematics (SIAM, 3600 Market Street, Floor 6, Philadelphia, PA 19104), 2008. ISBN 9780898717761.

[11] Fangda Gu, Heng Chang, Wenwu Zhu, Somayeh Sojoudi, and Laurent El Ghaoui. Implicit graph neural networks, 2021. URL https://arxiv.org/abs/2009.06211.

[12] William L. Hamilton, Rex Ying, and Jure Leskovec. Inductive representation learning on large graphs. In Proceedings of the 31st International Conference on Neural Information Processing Systems, NIPS'17, page 1025–1035, Red Hook, NY, USA, 2017. Curran Associates Inc. ISBN 9781510860964.

[13] Masanobu Horie and Naoto Mitsume. Graph neural pde solvers with conservation and similarity-equivariance, 2024. URL https://arxiv.org/abs/2405.16183.

[14] JAX. JAX: High performance array computing. https://jax.readthedocs.io/en/latest/index.html, . Accessed: 2024-10-01.

[15] JAX. JAX: A sparse direct solver using qr factorization. https://jax.readthedocs.io/en/latest/_autosummary/jax.experimental.sparse.linalg.spsolve.html, . Accessed: 2025-01-29.

[16] Loh Sher En Jessica, Naheed Anjum Arafat, Wei Xian Lim, Wai Lee Chan, and Adams Wai Kin Kong. Finite volume features, global geometry representations, and residual training for deep learning-based cfd simulation, 2023. URL https://arxiv.org/abs/2311.14464.

[17] E. Kharazmi, Z. Zhang, and G. E. Karniadakis. Variational physics-informed neural networks for solving partial differential equations, 2019. URL https://arxiv.org/abs/1912.00873.

[18] Thomas N Kipf and Max Welling. Semi-supervised classification with graph convolutional networks. ICLR, 2017.

[19] Yu.A. Kuznetsov, O.V. Boiarkine, I.V. Kapyrin, and N.B. Yavich. Numerical analysis of a two-level preconditioner for the diffusion equation with an anisotropic diffusion tensor. Russian Journal of Numerical Analysis and Mathematical Modelling, 22(4):377–391, 2007. doi: doi:10.1515/rnam.2007.018. URL https://doi.org/10.1515/rnam.2007.018.

[20] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew Stuart, and Anima Anandkumar. Fourier neural operator for parametric partial differential equations, 2021. URL https://arxiv.org/abs/2010.08895.

[21] Lu Lu, Pengzhan Jin, Guofei Pang, Zhongqiang Zhang, and George Em Karniadakis. Learning nonlinear operators via deeponet based on the universal approximation theorem of operators. Nature Machine Intelligence, 3(3):218–229, March 2021. ISSN 2522-5839. doi: 10.1038/s42256-021-00302-5. URL http://dx.doi.org/10.1038/s42256-021-00302-5.

[22] Lu Lu, Xuhui Meng, Zhiping Mao, and George Em Karniadakis. Deepxde: A deep learning library for solving differential equations. SIAM Review, 63(1):208–228, 2021. doi: 10.1137/19M1274067. URL https://doi.org/10.1137/19M1274067.

[23] Matthieu Nastorg, Michele-Alessandro Bucci, Thibault Faney, Jean-Marc Gratien, Guillaume Charpiat, and Marc Schoenauer. An implicit gnn solver for poisson-like problems. Computers & Mathematics with Applications, 176:270–288, December 2024. ISSN 0898-1221. doi: 10.1016/j.camwa.2024.10.036. URL http://dx.doi.org/10.1016/j.camwa.2024.10.036.

[24] Uwe Naumann. The art of differentiating computer programs: an introduction to algorithmic differentiation. SIAM, 1st edition, 2012. ISBN ISBN 978-1-611972-06-1.

[25] PyTorch. PyTorch: Compute the solution of a square system. https://pytorch.org/docs/stable/generated/torch.linalg.solve.html, . Accessed: 2025-01-30.

[26] PyTorch. torch.sparse. https://pytorch.org/docs/stable/sparse.html, . Accessed: 2025-01-30.

[27] M. Raissi, P. Perdikaris, and G.E. Karniadakis. Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational Physics, 378:686–707, 2019. ISSN 0021-9991. doi: https://doi.org/10.1016/j.jcp.2018.10.045. URL https://www.sciencedirect.com/science/article/pii/S0021999118307125.

[28] André Revil and Abderrahim Jardani. Forward and inverse modeling, page 110–153. Cambridge University Press, 2013. doi: 10.1017/cbo9781139094252.006. URL http://dx.doi.org/10.1017/CBO9781139094252.006.

[29] Alexander Ryabov, Viacheslav Naumov, Sergei Shumilin, Nikolay Yavich, Sayan Ranu, N. M. Anoop Krishnan, Evgeny Burnaev, and Vladimir Vanovskiy. Learnable stability-aware computational grid coarsening for accelerating physics simulations. Machine Learning: Science and Technology, submitted.

[30] Sergei Shumilin, Alexander Ryabov, Serguei Barannikov, Evgeny Burnaev, and Vladimir Vanovskii. A method for auto-differentiation of the voronoi tessellation, 2024. URL https://arxiv.org/abs/2312.16192.

[31] Sergei Shumilin, Alexander Ryabov, Nikolay Yavich, Evgeny Burnaev, and Vladimir Vanovskiy. Self-supervised coarsening of unstructured grid with automatic differentiation. In Ruslan Salakhutdinov, Zico Kolter, Katherine Heller, Adrian Weller, Nuria Oliver, Jonathan Scarlett, and Felix Berkenkamp, editors, Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 45315–45328. PMLR, 21–27 Jul 2024. URL https://proceedings.mlr.press/v235/shumilin24a.html.

[32] S. Srinivasan and J.Y. Leung. Petroleum Reservoir Modeling and Simulation: Geology, Geostatistics, and Performance Prediction. McGraw Hill LLC, 2022. ISBN 9781259834301. URL https://books.google.ru/books?id=crqeEAAAQBAJ.

[33] Petar Veličković, Guillem Cucurull, Arantxa Casanova, Adriana Romero, Pietro Liò, and Yoshua Bengio. Graph attention networks. In International Conference on Learning Representations, 2018. URL https://openreview.net/forum?id=rJXMpikCZ.

[34] Keyulu Xu, Weihua Hu, Jure Leskovec, and Stefanie Jegelka. How powerful are graph neural networks? In International Conference on Learning Representations, 2019. URL https://openreview.net/forum?id=ryGs6iA5Km.

[35] Qingqing Zhao, David B. Lindell, and Gordon Wetzstein. Learning to solve pde-constrained inverse problems with graph networks. 2022.

[36] M.S. Zhdanov. Geophysical Inverse Theory and Regularization Problems. Methods in Geochemistry and Geophysics. Elsevier Science, 2002. ISBN 9780080532509. URL https://books.google.ru/books?id=tHtDETv7VCoC.

[37] Weiqiang Zhu, Kailai Xu, Eric Darve, and Gregory C. Beroza. A general approach to seismic inversion with automatic differentiation. Computers and Geosciences, 151:104751, June 2021. ISSN 0098-3004. doi: 10.1016/j.cageo.2021.104751. URL http://dx.doi.org/10.1016/j.cageo.2021.104751.

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 1–6 节全部正文与全部小节（3.1–3.3、4.1–4.5、5、6）、式 (1)–(25)（逐个 `\tag{}` 编号）、图 1–5 图注（含分图 (a)–(f) 逐项转写）、参考文献 [1]–[37]（英文原条目）。原文无表格、无算法框、无附录。公式与图注均按 PDF 渲染页逐页核对（p01、p04–p12、p14–p15）。**审计判断（与原文推导有关的风险点，供 QA 参考）：** ① 第 3.3 节明确假设系统矩阵 \(A\) 为**实对称正定**；在此假设下反向传播可复用同一求解器。若 \(A\) 非对称（实的），式 (14) 的伴随求解应为 \(A^{\top}y=\nabla_{u}L^{\top}\)，需转置伴随而非直接复用 \(A\)；若为复数系统（如频域电磁/声波问题），应采用共轭转置伴随 \(A^{H}\)，或在实虚部增广后求导，否则梯度不正确。译文按原文保留 \(A^{-1}\) 写法，未改符号。② 式 (12) 的 \(P\) 为单元素 1 的扰动矩阵；式 (15) 的实现即 \(-\nabla_{b}L\) 与 \(u\) 的外积（原文表述为“对应条目相乘”），并且只对 \(A\) 的非零稀疏元素求导。③ 原文中系统矩阵依赖 \(\theta\)（式 (5)）时，链式法则还需计入 \(\partial A/\partial\theta\) 与 \(\partial f/\partial\theta\)；原文只给出关于 \(A\)、\(b\) 的梯度，依赖 AD 在图层面完成后续链接，未显式写出 \(\theta\) 的全导数。④ 原文 §3.1 “generate a Voronoi grid, (1)” 中的“(1)”疑为引用残留/笔误，译文按原文保留。⑤ 原文个别拼写/笔误按语义翻译并在括注中标出：§3.1 “message massing”→message passing（消息传递）；§4.2 图注 “blued diamond”→blue diamond（蓝色菱形）；§4.4 “stating with \(K=1\)”→starting（从 \(K=1\) 开始）、“archived”→achieved（达到）；§3.1 图 1 未编号公式按原文转写。⑥ 式 (23)/(25) 中 \(u^{i}_{\mathrm{mod}}\)、\(u^{i}_{\mathrm{obs}}\) 在原文中兼作时间函数（式 23）与标量/向量记号（式 25），按原文保留。⑦ 来源文献按 PDF 渲染页逐条核对（p15–p18），已修正抽取中的断字与变音符伪影（如 “Gunes”“Gallouët”“Raphaèle Herbin”“Veličković”“Liò”“André Revil”），未改动书目内容。

**登记（2026-11-03）：** 本篇许可含 ND（CC BY-NC-ND 4.0），仅本地保存；全文覆盖已录入；逐句逐式终校未做。
{% endraw %}
