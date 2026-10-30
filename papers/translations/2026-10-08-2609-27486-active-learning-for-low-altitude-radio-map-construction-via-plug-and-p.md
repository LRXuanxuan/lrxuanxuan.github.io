---
layout: page
title: "基于即插即用流匹配的低空无线电地图主动学习构建｜中文全文译文"
permalink: /papers/translations/2026-10-08-2609-27486-active-learning-for-low-altitude-radio-map-construction-via-plug-and-p/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b0be94b7c9394c6c/) · [原文 arXiv](https://arxiv.org/abs/2609.27486) · [全部目录](/papers/catalog/)

# 基于即插即用流匹配的低空无线电地图主动学习构建

**原题：** Active Learning for Low-Altitude Radio Map Construction via Plug-and-Play Flow Matching  
**作者：** Hao Sun、Shicong Liu、Xianghao Yu、Ying Sun、Liu Cao  
**版本：** arXiv:2609.27486v1，2026-09-23，原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VII 节、结论、附录 A（命题 1 证明）、图 1–10 图注、表 I 逐格、算法 1–2、参考文献 [1]–[37]（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

无人机（unmanned aerial vehicle，UAV）在低空空域中的部署需要准确、及时的无线电地图，以支撑可靠通信与安全导航。然而，穷举测量带来的高昂开销以及无人机有限的续航能力，使得此类无线电地图的构建颇具挑战。为应对这一挑战，本文提出一种基于流匹配（flow matching）的主动学习框架，用于从稀疏测量中高效构建低空无线电地图。我们首先分析一种以流匹配为先验的即插即用（plug-and-play，PnP）推理方案。通过常微分方程（ordinary differential equation，ODE）刻画后段细化行为，我们从理论上说明推理步如何平滑地对齐到连续的 ODE 流，从而细化地图细节。注意到早期生成阶段在很大程度上由噪声主导，这一洞察促使我们提出**截断流匹配即插即用（truncated flow matching plug-and-play，TFM-PnP）**方法。TFM-PnP 采用基于空间插值的初始化，从中间流时间开始重建，从而跳过效率低下的早期阶段。我们进一步利用流匹配的生成多样性推导不确定性地图，以指导无人机轨迹设计。具体而言，我们提出一种加权采样方法选取目标位置，随后用效用感知路径搜索（Utility-Aware Path Search，UAPS）算法设计相应的无人机轨迹。基于 Sionna 射线追踪数据集的仿真结果表明，所提框架优于所考虑的基线方法，归一化均方误差（normalized mean squared error，NMSE）降低超过 50%。

**索引词：** 主动学习、流匹配、ODE、即插即用、无线电地图、截断、无人机、不确定性。

## I. 引言

无人机（UAV）在自主配送 [2]、空中监测 [3] 与无线服务供给 [4] 等方面的快速普及，正推动低空运行从孤立的、任务专用的飞行，转变为跨城乡区域协同的、基础设施支撑的活动。然而，低空空域具有动态且异构的无线电环境特征，建筑物、植被和移动物体等障碍物会造成严重的散射与遮挡。其结果是，无人机链路的无线信道条件即使在短距离内也可能剧烈变化，给维持可靠、连续的连接带来挑战。

为应对这一问题，无线电地图已成为刻画与预测信道质量空间变化的有效手段 [5]–[7]。无线电地图提供关于信道特性（如接收信号强度（received signal strength，RSS））的细粒度空间信息，可有效充当无线电环境的数字孪生 [8]–[12]。此类知识对于维持稳健的指挥控制链路、优化频谱利用，以及在信号传播高度不规则的复杂区域确保安全导航与轨迹规划都至关重要 [13]–[15]。然而，构建准确的低空无线电地图仍然困难。以续航有限的无人机覆盖广阔区域，使得密集测量在时间与成本上均不切实际。因此，如何设计智能采样与重建方法，从有限数量的、经过策略性采集的测量中生成准确无线电地图，仍是一个关键问题。

现有智能采样与重建方法可分为两类。传统方法利用高斯过程（Gaussian process，GP）等统计模型对稀疏数据进行插值。尽管 GP 能够量化预测不确定性并据此指导后续采样 [16]、[17]，但它们可扩展性差，且在遮挡主导的复杂场景中往往表现不佳。较新的研究使用深度学习技术 [18]–[20]（包括自编码器与 U-Net）从数据中学习地图的潜在结构。与 GP 不同，这些模型本身并不提供经过标定的不确定性估计。为此，研究者引入了辅助的不确定性估计方法，例如贝叶斯神经网络或深度集成 [19]、[20]。然而，这些方法计算开销大，而且由于未显式建模预测不确定性，可能无法给出可靠的不确定性估计。此外，现有的主动感知方法通常每采集一个新测量后就更新不确定性估计，再依据局部不确定性或采集准则（有时附加基于距离的启发式规则）确定下一步感知动作。例如，[17] 通过带可选距离惩罚的采集函数每次查询一个新位置；[20] 则以不确定性感知的路线朝单一高不确定性目的地重新规划。这些方法要么未在目标位置选择中显式纳入飞行距离，要么在每获得一个新感知位置后都需要重新估计不确定性并重新规划。

近年来，生成式人工智能（artificial intelligence，AI）的出现为建模复杂数据分布提供了新工具。早期进展由扩散模型 [21]–[23] 取得，它们通过带有基于梯度的测量引导 [24]、[25] 的迭代推理来实现恢复。尽管扩散模型有效，其推理通常需要数十到数百个离散去噪步，每步都涉及梯度计算或分数网络前向传播，带来可观的算力开销。相比之下，流匹配 [26]、[27] 学习一个连续时间速度场，将简单的基分布输运到数据分布。虽然采样仍需要对速度场做数值积分，但它避免了扩散模型的多级噪声调度与迭代去噪结构，因而生成过程更直接、通常也更高效。

近期基于流匹配的恢复研究探索了多种策略，将稀疏测量信息融入已学动力学以重建完整图像。部分工作 [28]、[29] 通过调整速度场，将测量似然直接注入推理阶段，从而在无需重训练的情况下实现高效后验采样。另一些工作 [30]、[31] 通过求解器微分或随时间变化的最大后验（maximum a posteriori，MAP）优化，将测量一致性约束显式耦合到流轨迹上，以更高的数值敏感性为代价获得较高重建精度。此外，流匹配先验也可被纳入迭代式即插即用（PnP）框架 [32]，实现为随时间变化的流诱导先验算子，与测量对齐和约束投影交替执行。然而，这些设计中有许多在整条生成轨迹上引入测量引导，或在推理时依赖紧密耦合的随时间优化。在稀疏观测下，这种全轨迹校正可能效率低下且数值脆弱，尤其在噪声主导的早期阶段。此外，现有基于流的方法主要面向生成与重建，其在显式不确定性刻画方面的潜力仍未被充分挖掘，尤其是在具有轨迹感知主动感知的无人机辅助无线电地图构建中。

针对上述问题，本文面向从稀疏无人机测量构建低空无线电地图，提出一种不确定性感知的主动学习框架。我们的目标有三：1）发展稳定、高效的基于流匹配的重建方法；2）量化重建无线电地图的不确定性；3）在有限感知预算下利用该不确定性进行序贯无人机轨迹设计。为此，我们构建了基于流的主动学习框架（见图 1），通过由重建无线电地图导出的不确定性地图，将稳定重建与无人机轨迹规划紧密耦合。具体而言，该框架首先将流匹配先验纳入 PnP 重建方案，以生成与测量一致的无线电地图；随后利用流匹配的生成变异性推导逐像素不确定性；最后利用所得不确定性地图，在有限飞行预算下规划使不确定性收益最大化的序贯无人机轨迹。

本文的主要贡献概括如下：

- 我们从理论上分析了一种以流匹配为先验的 PnP 推理方案。通过常微分方程（ODE）对后段细化行为建模，揭示其背后的细化动力学。具体而言，我们说明离散推理步如何平滑地对齐到连续 ODE 流，从而恢复地图细节。受此洞察启发，我们提出**截断流匹配即插即用（TFM-PnP）**方法：利用基于空间插值的初始化，从中间流时间开始重建，并向 $t=1$ 执行后段流引导细化。
- 我们提出一种基于样本的不确定性估计方案，将 TFM-PnP 重建与主动无人机轨迹规划联系起来。通过反复运行 TFM-PnP 生成多幅无线电地图重建结果，所提方法以逐像素方差估计空间不确定性。所得不确定性地图充任不确定性引导感知的基础。
- 我们进一步设计兼顾不确定性收益与飞行代价的无人机轨迹规划策略。特别地，在每一轮重新规划中，我们提出加权采样方法，在有限飞行预算下通过最大化不确定性收益选取目标；随后由效用感知路径搜索（UAPS）从无人机当前位置到目标位置生成轨迹。
- 在 Sionna 射线追踪数据集上的实验结果表明，所提基于 TFM-PnP 的主动学习框架优于代表性基线方法，取得超过 50% 的归一化均方误差（NMSE）降幅。

全文其余部分组织如下：第 II 节给出无人机辅助无线电地图重建问题的表述；第 III 节回顾 PnP 与流匹配的预备知识；第 IV 节分析 PnP-Flow 迭代的渐近 ODE 极限，并提出 TFM-PnP 重建算法；第 V 节构建不确定性感知的主动学习模块；第 VI 节给出仿真结果；第 VII 节总结全文。

**记号说明。** 标量用斜体字母表示（如 $x$）；粗体小写字母表示向量或网格位置（如 $\mathbf x$、$\mathbf g$）；粗体大写字母表示矩阵或网格值地图（如 $\mathbf X$）。矩阵 $\mathbf X$ 第 $i$ 行第 $j$ 列的元素记作 $\mathbf X[i,j]$。花体字母根据上下文用于表示集合、算子、分布或泛函，并在引入时显式定义。$\mathbb R$ 表示实数集，$\mathbf I$ 表示维度相容的单位矩阵，$\mathbb E[\cdot]$ 表示期望。$\mathcal N(\boldsymbol\mu,\boldsymbol\Sigma)$ 表示均值为 $\boldsymbol\mu$、协方差为 $\boldsymbol\Sigma$ 的高斯分布，$\mathcal U[a,b]$ 表示区间 $[a,b]$ 上的连续均匀分布，$|\mathcal A|$ 表示集合 $\mathcal A$ 的基数。除非另有说明，$\|\cdot\|$ 对向量表示欧几里得范数、对矩阵表示 Frobenius 范数；需要强调矩阵范数时使用 $\|\cdot\|_F$。

## II. 问题表述

### A. 测量模型

考虑一个部署多座基站的城区低空环境，基站可位于地面或建筑物顶部。目标是从无人机采集的稀疏 RSS 测量中，估计低空二维水平区域 $\mathcal S\subset\mathbb R^2$ 上聚合 RSS 的空间分布。该区域被离散为 $I\times J$ 的均匀网格，网格索引 $(i,j)$ 处的 RSS 值由元素 $\mathbf H[i,j]$ 表示，其中 $\mathbf H\in\mathbb R^{I\times J}$ 为未知的真值无线电地图。

无人机在区域上空飞行并采集 RSS 测量。令 $\Omega(\tau)\subseteq\{1,\ldots,I\}\times\{1,\ldots,J\}$ 表示截至时隙 $\tau$ 无人机已访问的网格单元集合，$Q_\tau=|\Omega(\tau)|$ 为已采样位置数。对每个被采样单元 $(i_q,j_q)\in\Omega(\tau)$，测量建模为 $y_q^{(\tau)}=\mathbf H[i_q,j_q]+n_q$，其中 $n_q\sim\mathcal N(0,\sigma_y^2)$ 为第 $q$ 个样本的测量噪声。

将全部测量堆叠得到 $\mathbf y^{(\tau)}=\mathcal H_{\Omega(\tau)}(\mathbf H)+\mathbf n^{(\tau)}$，其中 $\mathbf n^{(\tau)}\sim\mathcal N(0,\sigma_y^2\mathbf I)$，$\mathcal H_{\Omega(\tau)}(\cdot):\mathbb R^{I\times J}\to\mathbb R^{Q_\tau}$ 抽取由 $\Omega(\tau)$ 索引的元素。伴随算子 $\mathcal H_{\Omega(\tau)}^{*}(\cdot):\mathbb R^{Q_\tau}\to\mathbb R^{I\times J}$ 将测量域向量映射回网格域：把其元素放在 $\Omega(\tau)$ 中的采样位置，其余位置填零。

目标即由稀疏测量 $\mathbf y^{(\tau)}$ 及其采样位置 $\Omega(\tau)$ 恢复完整无线电地图 $\mathbf H$。

### B. 主动学习框架

无人机辅助无线电地图重建在离散时隙 $\tau=1,\ldots,T$ 上序贯执行。在每个时隙 $\tau$，利用截至 $\tau$ 的全部测量 $\mathbf y^{(\tau)}$ 生成一组无线电地图重建样本 $\{\mathbf Z^{(\tau,m)}\}_{m=1}^{M}$。基于这些样本计算不确定性地图，以量化整个网格上 RSS 估计的置信度。所得不确定性地图随后用于选取信息量大的目标，并为下一时隙 $\tau+1$ 规划无人机轨迹，使未来测量优先从信息丰富区域获取。这一"重建—不确定性量化—轨迹规划"的闭环过程持续执行，直至飞行预算耗尽。

如图 1 所示，所提框架将数据驱动的无线电地图重建与不确定性感知的测量采集紧密耦合，从而能够从稀疏无人机观测中高效、准确地构建无线电地图。

## III. 预备知识

本节简要回顾求解逆问题的标准 PnP 框架，以及流匹配生成模型的理论基础，二者均在无线电地图构建背景下介绍。我们主要关注给定时隙 $\tau$ 下单幅重建无线电地图 $\mathbf Z^{(\tau,m)}$ 的生成式推理。为记号简洁，下文省略对时隙索引 $\tau$ 和样本索引 $m$ 的依赖。

### A. 基于 PnP 框架的无线电地图构建

首先介绍用于无线电地图构建的标准 PnP 框架。该逆问题可表述为 MAP 估计问题

$$
\max_{\mathbf Z}\left\{\log f(\mathbf y\mid\mathbf Z)+\log p(\mathbf Z)\right\}, \tag{1}
$$

其中 $f(\mathbf y\mid\mathbf Z)$ 为给定无线电地图 $\mathbf Z$ 时测量 $\mathbf y$ 的似然，$p(\mathbf Z)$ 为无线电地图的先验分布。

等价地，式 (1) 可改写为如下正则化逆问题：

$$
\min_{\mathbf Z}\left\{F(\mathbf Z;\mathbf y)+R(\mathbf Z)\right\}, \tag{2}
$$

其中 $F(\mathbf Z;\mathbf y):=-\log f(\mathbf y\mid\mathbf Z)$ 为测量一致性项，$R(\mathbf Z):=-\log p(\mathbf Z)$ 编码无线电地图的结构先验。测量一致性项的常见选择为 $F(\mathbf Z;\mathbf y)=\frac12\|\mathcal H_\Omega(\mathbf Z)-\mathbf y\|^2$。

给定式 (2) 的最小化问题，近端梯度法 [33] 通过在测量一致性步与先验一致性步之间交替来求解：

$$
\begin{cases}
\bar{\mathbf Z}^{(k+1)}=\mathbf Z^{(k)}-\eta_k\nabla_{\mathbf Z}F(\mathbf Z^{(k)};\mathbf y),\\
\mathbf Z^{(k+1)}=\operatorname{prox}_{\eta_k R}\left(\bar{\mathbf Z}^{(k+1)}\right),
\end{cases}\tag{3}
$$

其中 $\eta_k$ 为步长。近端算子定义为

$$
\operatorname{prox}_{\eta_k R}(\bar{\mathbf Z})
=\arg\min_{\mathbf Z}
\left\{R(\mathbf Z)+\frac{1}{2\eta_k}\left\|\mathbf Z-\bar{\mathbf Z}\right\|_F^2\right\}. \tag{4}
$$

然而，无线电地图先验 $R(\mathbf Z)$ 的显式形式通常未知，且难以解析建模。遵循即插即用思想，我们使用一个学习到的先验算子替代式 (3) 中的显式近端映射：

$$
\mathbf Z^{(k+1)}=D_{\theta,k}\left(\bar{\mathbf Z}^{(k+1)}\right), \tag{5}
$$

其中 $D_{\theta,k}(\cdot)$ 充当无线电地图的隐式先验模型。本文用通过流匹配训练的生成式先验来实例化学习到的先验算子 $D_{\theta,k}$，详见下一小节。

### B. 流匹配

流匹配 [26] 是一种新兴的生成建模范式，它将样本生成表述为学习由 ODE 支配的连续时间概率流。与传统扩散生成模型不同，流匹配将目标重新表述为可扩展的回归问题，从而在训练时避免昂贵的仿真。

**1）概率流与速度场。** 令 $P_0$ 表示简单先验分布（通常为标准高斯分布 [26]），$P_1$ 表示 $\mathbb R^{I\times J}$ 上无线电地图的目标分布。注意式 (1) 中的 $p(\mathbf Z)$ 指与 $P_1$ 相关的概率密度函数。

连续归一化流构造概率路径 $\{P_t\}_{t\in[0,1]}$，在两个分布之间连续插值，将 $t=0$ 时先验 $P_0$ 的样本变换为 $t=1$ 时的目标分布 $P_1$。该概率路径由相应的时间相关速度场 $u_t(\mathbf Z_t)$ 生成：

$$
u_t:[0,1]\times\mathbb R^{I\times J}\to\mathbb R^{I\times J},\qquad
(t,\mathbf Z_t)\mapsto u_t(\mathbf Z_t), \tag{6}
$$

其中每个时刻 $t$ 对应一个不同的连续向量场。

样本沿该概率路径的演化由 ODE 支配：

$$
\frac{d}{dt}\psi_t(\mathbf Z_0)=u_t(\psi_t(\mathbf Z_0)), \tag{7}
$$

初始条件为对任意 $\mathbf Z_0\sim P_0$ 有 $\psi_0(\mathbf Z_0)=\mathbf Z_0$。求解该 ODE 得到确定性流映射 $\psi_t$，它沿速度场定义的轨迹输运样本。因此，将噪声样本 $\mathbf Z_0$ 经该映射流动，得到时刻 $t$ 的潜状态：

$$
\mathbf Z_t:=\psi_t(\mathbf Z_0)\sim P_t. \tag{8}
$$

将速度场从 $t=0$ 积分到 $t=1$，简单先验 $P_0$ 被平滑且确定性地输运到复杂的无线电地图分布 $P_1$。

**2）学习速度场。** 实践中，真实速度场 $u_t(\mathbf Z_t)$ 解析上不可处理，必须用神经网络 $v_\theta(t,\mathbf Z_t)$ 近似。为使训练可扩展，流匹配框架采用条件概率路径。广泛使用的选择是条件最优传输（optimal transport，OT）路径 [26]，表述为

$$
\mathbf Z_t=(1-t)\mathbf Z_0+t\mathbf Z_1 \tag{9}
$$

在给定 $\mathbf Z_0\sim P_0$、$\mathbf Z_1\sim P_1$ 时具有常数条件速度

$$
u_t(\mathbf Z_t\mid\mathbf Z_1,\mathbf Z_0)=\mathbf Z_1-\mathbf Z_0. \tag{10}
$$

训练过程的简单示意见图 1 右侧。网络 $v_\theta(t,\mathbf Z_t)$ 通常基于 U-Net 架构，通过最小化条件流匹配（conditional flow matching，CFM）损失训练：

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=\mathbb E_{t,\mathbf Z_0,\mathbf Z_1}
\left\|v_\theta\!\left(t,(1-t)\mathbf Z_0+t\mathbf Z_1\right)-(\mathbf Z_1-\mathbf Z_0)\right\|^2, \tag{11}
$$

其中 $t\sim\mathcal U[0,1]$。已有工作表明，最小化该替代目标可恢复所需边缘速度场 $u_t(\mathbf Z_t)$ [26]。网络训练完成后，从噪声先验出发对 ODE $\frac{d\mathbf Z_t}{dt}=v_\theta(t,\mathbf Z_t)$ 做数值仿真即可生成新的无线电地图样本。

### C. 以流匹配为先验的 PnP

在流匹配实现中，该先验算子以流时间为索引，即 $D_{\theta,k}=D_{\theta,t_k}$。对于式 (9) 的仿射条件 OT 路径，其具体形式为

$$
D_{\theta,t}(\mathbf W)=\mathbf W+(1-t)v_\theta(t,\mathbf W).
$$

该式从流时刻 $t$ 的状态 $\mathbf W$ 给出 $t=1$ 的端点估计。因此，$D_{\theta,t}$ 是 PnP 迭代中使用的、以时间索引的学习先验更新，而不是 $R(\mathbf Z)$ 的精确近端映射，也不是流 ODE 的完整数值积分器。

将测量一致性更新与流匹配先验相结合，得到用于无线电地图构建的 PnP-Flow [32] 迭代：

$$
\begin{cases}
\bar{\mathbf Z}^{(k+1)}=\mathbf Z^{(k)}-\eta_k\nabla_{\mathbf Z}F(\mathbf Z^{(k)};\mathbf y),\\
\mathbf W^{(k+1)}=t_k\bar{\mathbf Z}^{(k+1)}+(1-t_k)\mathbf Z_0^{(k)},\\
\mathbf Z^{(k+1)}=D_{\theta,t_k}\left(\mathbf W^{(k+1)}\right),
\end{cases}\tag{12}
$$

其中 $t_k\in[0,1)$ 为对应于流演化的单调递增时间调度，$t_0=0$ 且 $\lim_{k\to\infty}t_k=1$。

式 (12) 的三步迭代有直接解释：第一步取梯度步，将当前估计拉向测量一致性；第二步把中间估计重整为式 (9) 条件最优传输路径的仿射形式；最后一步施加 $D_{\theta,t_k}(\cdot)$，沿学习到的流路径产生端点估计。在此意义上，学习到的速度场提供了隐式先验细化机制，而无需显式的解析正则项 $R(\mathbf Z)$。

## IV. 提出的 TFM-PnP 无线电地图重建方法

本节给出面向稀疏无人机测量的 TFM-PnP 重建算法。我们首先对后段 PnP-Flow 迭代（对应 $t_k\to1$）给出理想化 ODE 解释，将该后段动力学识别为随机逼近尺度下的测量一致细化过程。这一解释启发了从粗空间先验初始化的截断流轨迹。随后构造时间截断的初始化，并总结由此得到的有限步推理流程。

### A. PnP-Flow 的渐近 ODE 极限

我们首先考察式 (12) 中 $t_k\to1$ 时的后段 PnP-Flow 递推。在此区域，因子 $h_k=1-t_k$ 成为与端点预测相关的小系数。在随机逼近尺度下，所得后段递推允许如下 ODE 方法刻画。

**命题 1（PnP-Flow 的渐近 ODE 极限）。** 固定有限索引 $k_0$，考虑式 (12) 中 $k\ge k_0$ 的 PnP-Flow 递推序列。令 $h_k\triangleq1-t_k$，$\beta_k\triangleq t_k\eta_k/h_k$，其中 $\eta_k$ 为梯度步长。假设：

(i) $\sum_{k=k_0}^{\infty}h_k=\infty$ 且 $\sum_{k=k_0}^{\infty}h_k^2<\infty$；(ii) $F(\mathbf Z;\mathbf y)=\frac12\|\mathcal H_\Omega(\mathbf Z)-\mathbf y\|^2$，$F\in C^1$，且 $\nabla F$ 局部 Lipschitz；(iii) $v_\theta(t,\mathbf Z)$ 在 $t\in[0,1]$ 上连续，且关于 $\mathbf Z$ 全局 Lipschitz 且对 $t$ 一致；(iv) $\beta_k\to\beta$，其中 $\beta\in[0,\infty)$；(v) 参考样本 $\{\mathbf Z_0^{(k)}\}$ 与过去独立、零均值、二阶矩一致有界；(vi) 迭代序列 $\{\mathbf Z^{(k)}\}_{k\ge k_0}$ 几乎必然有界。

令 $s_{k_0}=0$，$s_{k+1}=s_k+h_k$（$k\ge k_0$），并令 $\tilde{\mathbf Z}(s)$ 为离散迭代在区间 $[s_k,s_{k+1})$ 上的分段线性插值。则 $\tilde{\mathbf Z}(s)$ 是自治 ODE

$$
\frac{d\mathbf Z(s)}{ds}
=-\mathbf Z(s)-\beta\nabla F(\mathbf Z(s))+v_\theta(1,\mathbf Z(s)) \tag{13}
$$

的渐近伪轨迹。

**证明。** 详细证明见附录 A。

命题 1 给出后段 PnP-Flow 动力学的连续时间解释。式 (13) 中的极限漂移包含三项：仿射重参数化引起的收缩项 $-\mathbf Z(s)$、测量一致性项 $-\beta\nabla F(\mathbf Z(s))$，以及 $t=1$ 处的学习速度场 $v_\theta(1,\mathbf Z(s))$。因此，在流轨迹接近末端时，离散细化行为如同一个确定性动力系统，在观测 RSS 样本的一致性与学习到的无线电地图分布先验信息之间取得平衡。下述注说明该后段渐近模型与实际时间截断实现之间的联系。

**注（与时间截断的联系）。** 命题 1 应被理解为对算法 1 的算法合理性论证，而非其有限步收敛保证。它表明，在 $t_k\to1$ 的后段，PnP-Flow 递推表现为一种连续细化动力学，同时纳入测量一致性与学习到的无线电地图先验。这一观察提示：只要具备适当的中间状态，流轨迹的早期部分对于重建并非必不可少。

特别地，式 (9) 的仿射 OT 路径意味着早期时刻的状态主要包含基噪声的贡献，而更接近 $t=1$ 的后段状态预计承载更多无线电地图结构。因此，若能够构造一个与中间流状态相容、粗糙但有结构的估计，就可以直接在 $t=a$ 处初始化重建，再通过后段细化步向 $t=1$ 演化。在此意义上，所提时间截断以空间信息化初始化替代噪声主导的早期演化，同时保留命题 1 所识别的后段类 ODE 细化机制。

### B. 基于空间插值先验的时间截断初始化

截断轨迹需要 $t=a$ 时刻已包含有意义空间信息的初始状态。我们通过轻量空间插值先验，从可用稀疏测量构造该状态。

为此，我们利用无线电地图的空间平滑性。给定观测 RSS 值 $\mathbf y$ 及其由采样算子 $\mathcal H_\Omega$ 指定的空间位置，应用 $k$ 近邻（k-nearest neighbors，KNN）插值方案得到粗糙无线电地图估计，记作 $\mathbf X_{\mathrm{prior}}$。该插值先验捕获传播场的大尺度空间趋势，同时计算开销很低。

为使初始化与式 (9) 条件 OT 路径的仿射参数化相容，我们将插值先验与基噪声样本 $\mathbf Z_0^{(0)}\sim P_0$ 组合为

$$
\mathbf Z_a^{(0)}=a\mathbf X_{\mathrm{prior}}+(1-a)\mathbf Z_0^{(0)}. \tag{14}
$$

式 (14) 的初始化利用了条件流路径的仿射结构。尽管它并非真实条件流轨迹上的精确点，但提供了 $t=a$ 时刻的实用替代状态，既保留 $\mathbf X_{\mathrm{prior}}$ 的粗空间结构，又保持流模型所使用的仿射形式。该设计以轻量空间初始化替代早期噪声主导的积分段，使后续后段 PnP-Flow 细化步得以专注于测量一致的空间细化。

### C. 提出的 TFM-PnP 算法

将式 (14) 的时间截断初始化与式 (12) 的 PnP-Flow 递推结合，得到算法 1 总结的有限步 TFM-PnP 推理流程。从 $t=a$ 开始，每次迭代先通过梯度步强制测量一致性，再沿仿射流路径重参数化校正后的状态，最后施加流诱导先验算子向 $t=1$ 做后段细化。这样，算法以前述洞察的实用有限步形式实现：早期噪声主导的仿真被空间插值替代，剩余迭代则沿流路径向 $t=1$ 执行后段细化。从中间时间 $t=a$ 起始的效果在第 VI 节仿真结果中检验（图 3）。

**算法 1　TFM-PnP 无线电地图重建框架**

1. **输入：** 观测 RSS $\mathbf y$；测量算子 $\mathcal H_\Omega$；训练好的速度场 $v_\theta$；空间经验先验 $\mathbf X_{\mathrm{prior}}$；基噪声 $\{\mathbf Z_0^{(k)}\}_{k=0}^{K-1}$，$\mathbf Z_0^{(k)}\sim P_0$；梯度步长 $\{\eta_k\}_{k=0}^{K-1}$；推理步数 $K\ge2$；起始时间 $a\in(0,1)$。
2. **状态初始化：** $\mathbf Z^{(0)}=a\mathbf X_{\mathrm{prior}}+(1-a)\mathbf Z_0^{(0)}$。
3. **for** $k=0,\ldots,K-1$ **do**
4. 　$t_k=a+(1-a)\frac{k}{K}$。
5. 　**# 步骤 1：测量一致性**
6. 　计算 $\bar{\mathbf Z}^{(k+1)}=\mathbf Z^{(k)}-\eta_k\mathcal H_\Omega^{*}\left(\mathcal H_\Omega(\mathbf Z^{(k)})-\mathbf y\right)$。
7. 　**# 步骤 2：流启发的重参数化**
8. 　计算 $\mathbf W^{(k+1)}=t_k\bar{\mathbf Z}^{(k+1)}+(1-t_k)\mathbf Z_0^{(k)}$。
9. 　**# 步骤 3：流诱导先验细化**
10. 　计算 $\mathbf Z^{(k+1)}=\mathbf W^{(k+1)}+(1-t_k)v_\theta\left(t_k,\mathbf W^{(k+1)}\right)$。
11. **end for**
12. **return** $\mathbf Z^{(K)}$。

## V. 通过不确定性量化的主动学习

所提 TFM-PnP 方法能够在每个时隙 $\tau$ 内准确重建无线电地图。然而，由于无人机飞行预算有限，跨时间高效采集信息量大的样本仍具挑战。为此，本节引入一种主动轨迹设计框架，在有限飞行预算下最大化不确定性收益。具体而言，我们首先发展基于生成样本的不确定性量化方法，然后设计利用所得不确定性地图引导无人机沿最具信息飞行路径的轨迹规划策略。

### A. 基于生成样本的不确定性量化

所提 TFM-PnP 方法的生成特性自然支持基于样本刻画重建不确定性。我们并不只给出单一确定性输出，而是生成一组 $M$ 幅可能的无线电地图重建 $\{\mathbf Z^{(\tau,m)}\}_{m=1}^{M}$，它们与截至时隙 $\tau$ 采集的测量 $\mathbf y^{(\tau)}$ 近似一致。这通过运行算法 1 共 $M$ 次实现，每次以独立抽取的高斯参考序列 $\{\mathbf Z_0^{(k)}\}_{k=0}^{K-1}$（$\mathbf Z_0^{(k)}\sim P_0$）初始化。为刻画不同潜在初始化引起的这些可能重建的离散程度，定义时隙 $\tau$ 的不确定性地图 $\mathbf U^{(\tau)}$ 为逐元素样本方差：

$$
\mathbf U^{(\tau)}
=\frac{1}{M}\sum_{m=1}^{M}
\left(\mathbf Z^{(\tau,m)}
-\frac{1}{M}\sum_{n=1}^{M}\mathbf Z^{(\tau,n)}\right)^{2}. \tag{15}
$$

该方差充任重建不确定性的实用代理量。一般而言，测量覆盖密集的区域样本方差较小，而观测稀疏或几何复杂的区域往往方差较大。

### B. 主动轨迹规划

在每个时隙 $\tau$，无人机基于当前不确定性地图 $\mathbf U^{(\tau)}$ 规划飞行轨迹。与现有序贯主动感知方案（或依据局部不确定性准则设定下一目的地 [20]，或在每个时隙用采集函数查询一个新测量位置 [17]）不同，我们首先用距离感知的加权不确定性分数选取一个信息量大且可达的目标，再通过 UAPS 生成通向该目标的效用感知路径。

由于轨迹规划在固定时隙 $\tau$ 内进行，本小节为记号简洁省略上标 $\tau$。

**1）序贯目标选择。** 实践中，无人机不应只关注不确定区域，还应考虑到达这些区域所需的飞行距离。一个目标位置虽然不确定性高，但若远离无人机当前位置，则单位飞行距离所实现的不确定性下降较低，探索效率不高；反之，附近不确定性略低的区域可能提供更好的探索效率。

令 $\mathcal V$ 为已采样位置集合，$\mathcal V_u$ 为未采样位置集合。为同时考虑不确定性与飞行距离，为每个未采样网格 $\mathbf g\in\mathcal V_u$ 赋予加权不确定性：

$$
w(\mathbf g)=\frac{\rho_B(\mathbf g)}{1+\kappa d(\mathbf g_{\mathrm{UAV}},\mathbf g)}, \tag{16}
$$

其中 $\mathbf g_{\mathrm{UAV}}$ 表示时隙 $\tau$ 开始时无人机的位置，$d(\cdot,\cdot)$ 表示曼哈顿距离，$\kappa\ge0$ 控制信息量与可达性之间的折中。分子 $\rho_B(\mathbf g)$ 量化局部不确定性密度，定义为

$$
\rho_B(\mathbf g)=\frac{1}{B^2}\sum_{\mathbf g'\in\mathcal B_B(\mathbf g)}\xi(\mathbf g'), \tag{17}
$$

其中网格单元 $\mathbf g'=(i',j')$ 处的不确定性取值为 $\xi(\mathbf g')\triangleq\mathbf U[i',j']$，$\mathcal B_B(\mathbf g)$ 为以 $\mathbf g$ 为中心的 $B\times B$ 邻域。使用邻域而非单格取值可更稳定地估计局部不确定性：单格不确定性可能因噪声或预测伪影而剧烈波动，而在 $B\times B$ 区域上平均能捕获其下空间结构。较小的 $B$ 捕获尖锐局部峰值，较大的 $B$ 反映更广阔的不确定区域。分母中的加性常数 1 避免目标靠近无人机时除零，并保证距离惩罚随距离平滑变化。实践中，在计算加权不确定性前，局部不确定性密度 $\rho_B(\mathbf g)$ 与距离 $d(\cdot,\cdot)$ 均被最小—最大归一化到 $[0,1]$，以确保折中参数 $\kappa$ 保持尺度不变。

于是，加权不确定性 $w(\mathbf g)$ 将信息量（通过 $\rho_B$）与可达性（通过 $d$）组合为统一度量，促使无人机关注有价值且可达的感知位置。随后我们通过加权采样选取单一目标位置 $\mathbf g^\star\in\mathcal V_u$，概率为

$$
p(\mathbf g)=\frac{w(\mathbf g)}{\sum_{\tilde{\mathbf g}\in\mathcal V_u}w(\tilde{\mathbf g})}. \tag{18}
$$

与确定性地选取权重最大单元相比，加权采样偏向高效用位置，同时在多轮重新规划之间保持探索多样性。

**2）轨迹规划表述。** 目标 $\mathbf g^\star$ 选定后，下一步是设计终止于 $\mathbf g^\star$ 的无人机轨迹 $\mathcal Q=(\mathbf g_0=\mathbf g_{\mathrm{UAV}},\mathbf g_1,\ldots,\mathbf g_L=\mathbf g^\star)$，其中 $L$ 为总移动步数。轨迹可包含无人机当前位置与所选目标之间的多个中间网格单元。为便于处理，假设无人机仅能沿四个基本方向移动，单位步代价为 1。尽管这种基于曼哈顿距离的抽象简化了真实无人机运动学，但在空间离散足够细时，它可对飞行器运动提供足够精确的近似。因此，$\mathcal Q$ 中相邻位置满足 $\mathbf g_l-\mathbf g_{l-1}\in\{(\pm1,0),(0,\pm1)\}$。于是，总飞行代价定义为 $C(\mathcal Q)=L$，即沿轨迹的总移动步数。为评价轨迹的信息效用，定义累积不确定性收益 $R_{\mathrm{unc}}(\cdot)$ 为

$$
R_{\mathrm{unc}}(\mathcal Q)=\sum_{l=1}^{L}\xi(\mathbf g_l), \tag{19}
$$

它度量沿路径收集到的总不确定性。为实现高效探索，我们寻求在终止于所选目标的约束下，收集较大不确定性收益且飞行代价较低的轨迹。由此得到如下比值形式目标：

$$
\max_{\mathcal Q}\ \frac{R_{\mathrm{unc}}(\mathcal Q)}{C(\mathcal Q)}. \tag{20}
$$

直接求解式 (20) 通常需要迭代式分式规划 [34]，在稠密网格上做实时无人机路由时计算开销可能很高。在分式规划中，比值形式目标可通过参数化减法形式 $R_{\mathrm{unc}}(\mathcal Q)-\phi C(\mathcal Q)$ 处理，参数 $\phi$ 迭代更新直至收敛。受该减法重构启发，我们避免在线更新 $\phi$，而采用固定参数的标量化替代目标：

$$
\max_{\mathcal Q}\ R_{\mathrm{unc}}(\mathcal Q)-(1+\lambda)C(\mathcal Q). \tag{21}
$$

这里 $\lambda\ge0$ 控制不确定性收集与飞行代价之间的折中。

式 (21) 的标量化目标为轨迹生成提供了步级解释。由于 $C(\mathcal Q)$ 表示移动步数，每次移动自然产生单位飞行代价；同时，收益项 $R_{\mathrm{unc}}(\mathcal Q)$ 表明穿过不确定性更高的网格信息量更大。因此，我们不再纯粹按距离搜索最短路径，而是为每次移动赋予效用感知代价，其中进入某网格单元的代价按其不确定性折减。该设计保留对路径长度的基本惩罚，同时鼓励无人机在额外不确定性收益值得额外飞行距离时，穿过信息丰富的中间区域。

基于该解释，我们提出 UAPS，从无人机当前位置 $\mathbf g_0=\mathbf g_{\mathrm{UAV}}$ 到所选目标 $\mathbf g_L=\mathbf g^\star$ 构造效用感知轨迹。它对每个被探索网格单元 $\mathbf g$ 通过复合评价函数 $\varphi(\mathbf g)=r(\mathbf g)+h(\mathbf g)$ 进行评估，其中 $r(\mathbf g)$ 表示从 $\mathbf g_0$ 到当前单元 $\mathbf g$ 的累积效用感知路径代价，$h(\mathbf g)$ 估计从 $\mathbf g$ 到所选目标的剩余代价。

- $r(\mathbf g)$ 表示由沿 $\mathbf g_0$ 至当前位置轨迹所收集不确定性惩罚后的飞行代价：

$$
r(\mathbf g)=\sum_{k=0}^{m-1}c_{\mathrm{step}}\left(\mathbf s_k,\mathbf s_{k+1}\right), \tag{22}
$$

其中 $\mathbf s_0=\mathbf g_0$，$\mathbf s_m=\mathbf g$，$(\mathbf s_0,\ldots,\mathbf s_m)$ 表示局部子路径上的 $m+1$ 个网格单元，$c_{\mathrm{step}}(\mathbf s_k,\mathbf s_{k+1})$ 为从 $\mathbf s_k$ 移动到 $\mathbf s_{k+1}$ 的微观步代价，定义为

$$
c_{\mathrm{step}}\left(\mathbf s_k,\mathbf s_{k+1}\right)=1-\alpha\tilde{\xi}\left(\mathbf s_{k+1}\right). \tag{23}
$$

这里 $\tilde{\xi}(\mathbf s_{k+1})=\frac{\xi(\mathbf s_{k+1})-\min(\mathbf U)}{\max(\mathbf U)-\min(\mathbf U)}$ 表示位置 $\mathbf s_{k+1}$ 处的归一化不确定性，$\mathbf U$ 为全局不确定性地图，$\alpha=1/(1+\lambda)\in(0,1]$。

- 启发项 $h(\mathbf g)$ 估计从当前单元 $\mathbf g$ 到目标 $\mathbf g_L$ 的剩余移动代价：

$$
h(\mathbf g)=(1-\alpha)d(\mathbf g,\mathbf g_L). \tag{24}
$$

由于 $1-\alpha$ 是最小可能步代价，该启发式从不高估真实替代路径代价，因而可采纳。

每次迭代中，算法取出复合得分 $\varphi(\mathbf g)$ 最小的单元，扩展其未访问邻居以更新累积权重 $r(\cdot)$ 与启发代价 $h(\cdot)$。该搜索策略迭代进行，直至取出目标单元 $\mathbf g_L$，从而产生连续轨迹 $\mathcal Q$。序贯主动轨迹规划的完整流程总结于算法 2。

**算法 2　序贯主动轨迹规划**

1. **输入：** 无人机当前位置 $\mathbf g_{\mathrm{UAV}}$、不确定性地图 $\mathbf U$、未采样集合 $\mathcal V_u$，以及参数 $B$、$\kappa$、$\lambda$。
2. **输出：** 所选目标 $\mathbf g^\star$ 与飞行轨迹 $\mathcal Q$。
3. **阶段 1：序贯目标选择**
4. **for all** $\mathbf g\in\mathcal V_u$ **do**
5. 　计算 $\rho_B(\mathbf g)=B^{-2}\sum_{\mathbf g'\in\mathcal B_B(\mathbf g)}\xi(\mathbf g')$ 与 $d(\mathbf g_{\mathrm{UAV}},\mathbf g)$。
6. **end for**
7. 在 $\mathcal V_u$ 上对 $\rho_B(\mathbf g)$ 与 $d(\mathbf g_{\mathrm{UAV}},\mathbf g)$ 做最小—最大归一化。
8. 对所有 $\mathbf g\in\mathcal V_u$ 计算 $w(\mathbf g)=\frac{\rho_B(\mathbf g)}{1+\kappa d(\mathbf g_{\mathrm{UAV}},\mathbf g)}$。
9. 以概率 $p(\mathbf g)=w(\mathbf g)/\sum_{\tilde{\mathbf g}\in\mathcal V_u}w(\tilde{\mathbf g})$ 采样一个目标 $\mathbf g^\star$。
10. **阶段 2：通过 UAPS 生成轨迹**
11. 将 $\mathbf U$ 归一化为 $\tilde{\xi}(\cdot)\in[0,1]$，并设 $\alpha=1/(1+\lambda)$。
12. 初始化 $r(\mathbf g_{\mathrm{UAV}})=0$，其余网格单元 $r(\mathbf g)=\infty$。
13. 初始化开集 $\mathcal O=\{\mathbf g_{\mathrm{UAV}}\}$、闭集 $\mathcal C=\varnothing$ 与父节点映射 $\pi(\cdot)$。
14. **while** $\mathcal O\neq\varnothing$ **do**
15. 　取出 $\mathbf g=\arg\min_{\mathbf q\in\mathcal O}\{r(\mathbf q)+(1-\alpha)d(\mathbf q,\mathbf g^\star)\}$。
16. 　**if** $\mathbf g=\mathbf g^\star$ **then**
17. 　　**break**
18. 　**end if**
19. 　将 $\mathbf g$ 从 $\mathcal O$ 移入 $\mathcal C$。
20. 　**for all** $\mathbf g$ 的四邻域单元 $\mathbf g'\notin\mathcal C$ **do**
21. 　　计算 $c_{\mathrm{step}}(\mathbf g,\mathbf g')=1-\alpha\tilde{\xi}(\mathbf g')$。
22. 　　**if** $r(\mathbf g)+c_{\mathrm{step}}(\mathbf g,\mathbf g')<r(\mathbf g')$ **then**
23. 　　　设 $r(\mathbf g')=r(\mathbf g)+c_{\mathrm{step}}(\mathbf g,\mathbf g')$ 且 $\pi(\mathbf g')=\mathbf g$。
24. 　　　在 $\mathcal O$ 中插入或更新 $\mathbf g'$。
25. 　　**end if**
26. 　**end for**
27. **end while**
28. 通过回溯父节点映射 $\pi(\cdot)$ 重构 $\mathcal Q=(\mathbf g_{\mathrm{UAV}},\ldots,\mathbf g^\star)$。
29. **return** $\mathbf g^\star$、$\mathcal Q$。

## VI. 仿真结果

本节给出仿真结果，以评估所提基于流的主动学习框架。真值无线电地图由 Sionna 射线追踪仿真器 [35] 生成，它能够给出物理上准确的无线信道预测。我们采用开源的 "Etoile" 三维城市场景，并在该场景中随机部署 7 个发射机。随后在固定高度 60 m 处、$128\times128$ 的平面网格上计算真值无线电地图，得到维度为 $I=J=128$ 的 RSS 矩阵 $\mathbf H$。重复该过程生成包含 2000 幅训练无线电地图与 200 幅测试无线电地图的数据集。在流匹配训练阶段，源分布 $P_0$ 取 $\mathcal N(0,1)$。除非另有说明，无人机测量受方差 $\sigma_y^2=1$ 的加性高斯噪声污染。

重建性能用 NMSE 量化。为保证物理一致性，NMSE 在线性功率域而非 dB 尺度上计算：

$$
\mathrm{NMSE}
=\frac{\left\|10^{\mathbf H/10}-10^{\mathbf Z/10}\right\|_F^2}
{\left\|10^{\mathbf H/10}\right\|_F^2},
$$

其中 $\mathbf H$ 与 $\mathbf Z$ 分别为真值与重建无线电地图，$10^{\mathbf H/10}$ 与 $10^{\mathbf Z/10}$ 表示从 dB 尺度到线性功率尺度的逐元素换算，而非矩阵幂运算。

### A. 无线电地图构建性能

我们将所提 TFM-PnP 方法与以下代表性基线比较：

- **PnP-Flow [32]：** 将基于流的先验直接纳入 PnP 框架，推理时间从 $t=0$ 开始。
- **扩散后验采样（diffusion posterior sampling，DPS）[36]：** 一种基于扩散的逆问题求解器，通过以观测测量为条件、迭代地从后验分布采样来重建未知场。DPS 使用生成式先验实现稳定恢复，但通常需要更多采样步。
- **RePaint [37]：** 一种基于去噪扩散概率模型（DDPM）的修复方法，在去噪与条件重采样之间交替，逐步填补地图缺失区域，是代表性的基于扩散的修复基线。
- **深度无线电地图与不确定性估计器（deep radio map and uncertainty estimator，DRUE）[20]：** 采用基于自编码器的架构学习无线电地图的潜在结构；在仅重建的对比中，使用其无线电地图预测组件。
- **高斯过程回归（Gaussian process regression，GPR）：** 一种经典概率插值基线，通过从观测测量中学习空间相关性来重建无线电地图。在实现中，GPR 在归一化空间坐标与相应归一化信号值上训练，使用由常数核、径向基函数（RBF）核与白噪声核构成的复合核；核超参数通过边缘似然并多次重启优化，从而自适应建模地图平滑度与噪声水平。
- **KNN（$k=5$）：** 使用距离加权插值作为轻量局部基线，依据归一化空间域中五个最近邻的观测值预测每个缺失位置。

**1）关于 $\eta$ 的敏感性。** 本小节考察所提 TFM-PnP 框架对梯度步长 $\eta$ 的敏感性。我们采用常数步长，即对所有迭代 $k$ 有 $\eta_k=\eta$。所用有限步实现中，常数步长由经验调优。这与理想化渐近分析中使用的缩放步长机制不同，但符合有限步 PnP 类推理算法的常见做法。为评估该选择，考虑网格位置按随机均匀采样的高度稀疏观测场景，采样率为 2% 至 6%，在所提方法于不同梯度步长 $\eta\in\{0,0.5,1,1.5,2,2.2\}$ 下评估重建性能。

图 2 的对应 NMSE 曲线表明，增大梯度步长可改善重建精度，最佳性能出现在 $\eta=2$ 附近。当 $\eta=0$（即不施加数据保真梯度更新）时，NMSE 保持在较高水平；而当 $\eta$ 从 0.5 增至 2 时，所有采样率下的 NMSE 均一致且显著下降。值得注意的是，随步长进一步增大，性能增益开始饱和，$\eta=2$ 与 $\eta=2.2$ 的曲线仅有微小差异。这些结果表明，足够大的梯度步长对于强制数据一致性很重要，而在本文实验中 $\eta=2$ 提供了接近最佳的性能。

**2）时间截断机制的有效性。** 为考察起始时间 $a$ 对所提 TFM-PnP 框架性能的影响，我们将 $a$ 从 0 变到 0.96。如图 3 所示，增大起始时间 $a$ 起初使 2% 与 6% 两种采样率下的 NMSE 稳定下降；但当 $a$ 接近 0.9 时，性能增益变得微小，说明重建质量开始饱和。该框架在 $a=0.9$ 附近达到稳定性能。增大采样率同样改善重建质量，因为更密集的测量提供更强约束、降低不确定性。

这些发现表明，跳过由大量噪声主导、结构信息有限的早期流阶段，可使 PnP 过程专注于细化精细空间结构，而非执行粗去噪。

**3）重建性能比较。** 我们在采样率从 2% 到 6% 变化时评估重建性能。如图 4 所示，所提 TFM-PnP 方法优于全部基线方法，在所有采样率下 NMSE 改善超过 10%。尽管所有基线方法均经仔细调优，其表现仍逊于所提方法。RePaint、DPS 与 PnP-Flow 等生成式基线通常从纯噪声开始重建；在高度稀疏采样（如 2% 至 6%）条件下，可用测量往往不足以可靠引导随机且噪声主导的早期生成阶段，导致结构幻觉或偏离真实空间布局。相比之下，所提 TFM-PnP 框架通过早期时间截断缓解了这些限制。

为给出视觉比较并评估方法的泛化能力，我们将采样率固定为 6%，在图 5 与图 6 中给出两个不同场景下的代表性重建结果。传统基线（如 GPR、DRUE）存在严重过平滑，而 DPS、PnP-Flow 等生成式基线表现出有竞争力的性能，可恢复整体功率分布；但细看复杂结构区域，所提方法更好地保留了细粒度细节与清晰边界，给出更准确、空间一致的重建。图 5 中各方法 NMSE 分别为：GPR 0.142、KNN 0.139、DRUE 0.812、RePaint 0.111、DPS 0.083、PnP-Flow 0.096、TFM-PnP 0.067；图 6 跨场景验证中分别为 GPR 0.197、KNN 0.129、DRUE 0.780、RePaint 0.151、DPS 0.106、PnP-Flow 0.137、TFM-PnP 0.065。

**4）运行时间与推理步数。** 为全面评估所提 TFM-PnP 框架的计算效率，本小节考察推理步数对重建精度的影响，并与现有基线定量比较执行时间。图 7 给出不同稀疏采样率下 TFM-PnP 的 NMSE 随推理步数的变化。可观察到一致趋势：当推理步数增至约 50 时 NMSE 快速下降；随后当积分步数超过 60 时，边际性能增益变小，NMSE 曲线饱和。

在这些逐步观察的基础上，我们进一步量化相应的墙钟推理时间。依据图 7 识别的饱和点，所提 TFM-PnP 的推理步数经验设为 60。如表 I 所示，所提框架所需推理时间少于对比的生成式求解器。注意结果以多次独立试验的均值 ± 标准差报告，以保证统计可靠性。RePaint、DPS 等扩散模型需要数百个推理步，导致可观的推理延迟，因而不太适合功率受限的无人机应用。相比之下，TFM-PnP 减少了所需前向传播次数，每幅无线电地图仅需 0.74 秒。这一轻量推理过程使所提框架适用于需要快速环境感知与轨迹自适应的实时或近实时无人机任务。

**表 I　每幅无线电地图的平均推理时间**

| 方法 | 平均推理时间（s） |
|---|---:|
| GPR | 8.1234 ± 0.0958 |
| RePaint | 6.9604 ± 0.0118 |
| DPS | 5.1105 ± 0.0382 |
| PnP-Flow | 1.0805 ± 0.0002 |
| TFM-PnP（所提） | 0.7359 ± 0.0412 |
| KNN | 0.0715 ± 0.0394 |
| DRUE | 0.0016 ± 0.0001 |

### B. 主动学习与无线电地图构建

本实验假设初始观测到 2% 的网格位置。在主动学习阶段，无人机在算法 2 总结的所提主动学习策略引导下获得额外 2000 个移动步的飞行预算。在每个访问的网格单元，无人机获取一个 RSS 测量，$\mathcal H_\Omega(\mathbf H)$ 抽取无线电地图中对应于已访问位置集合的元素。在主动学习阶段，设 $\kappa=1$、$\lambda=1$、$B=5$。我们在相同总体飞行预算下将所提方法与两个基线比较：

- **基线 1：随机采样。** 在整个网格中均匀随机选取 2000 个额外采样位置，随后基于全部收集样本用所提 TFM-PnP 执行重建。该策略不涉及迭代的、不确定性引导的轨迹规划过程。
- **基线 2：深度无线电地图与不确定性估计器（DRUE）[20]。** 该方法使用两个自编码器分别估计无线电地图及其不确定性，随后以不确定性感知方式设计无人机轨迹。

**1）不确定性地图。** 不确定性地图 $\mathbf U^{(\tau)}$ 通过生成 $M$ 幅重建无线电地图并计算样本间逐像素方差得到。该方法为稀疏测量引起的重建不确定性提供了实用代理量。图 9 给出关于重建样本数 $M$（从 3 到 10）的敏感性分析：所有配置的 NMSE 均随飞行步数一致下降，且各曲线在整个过程中彼此接近。不同 $M$ 下的性能差异很小，表明方法在测试范围内对该参数不敏感。为保持充分统计置信度且不引入不必要计算开销，本研究其余部分采用 $M=5$ 作为默认设置。

如图 8 所示，所提方法产生的不确定性图样与无线电地图的物理特性高度吻合。不确定性地图与实际重建误差在定性上强对应，表明样本方差为重建不确定性提供了有用代理：高不确定性区域与较大重建误差重合，低不确定性区域对应准确预测。这种一致性对主动采样与自适应飞行规划等下游任务至关重要，因为在这些任务中不确定性用于指导选取信息量大的测量。

**2）主动学习。** 为评估所提主动学习策略在无人机辅助低空无线电地图重建中的有效性，我们将所提方法与随机采样、DRUE 两个基线比较。定量性能见图 10，其中绘制 NMSE 随无人机总飞行步数的变化。在整个主动学习过程中，所提方法比 DRUE 与随机采样取得更快的 NMSE 下降。这一改善来自两方面：不确定性驱动的序贯目标选择机制可识别信息丰富且可达的感知位置；效用感知路径规划器在保持可行飞行轨迹的同时偏向途经的不确定区域。

2000 个飞行步后，所提方法取得超过 50% 的 NMSE 降幅，在重建精度与数据效率上均有性能增益。这些结果表明，所提不确定性驱动轨迹规划框架使无人机能够在有限飞行预算内采集信息量大的样本，从而得到准确且空间一致的无线电地图。

## VII. 结论

本文提出一种基于流匹配的主动学习框架，用于从稀疏无人机测量中高效、准确地构建低空无线电地图。为应对传统生成式求解器的计算瓶颈与不稳定性，我们发展了 TFM-PnP 方法，将连续时间流匹配先验融入 PnP 架构。我们首先建立了生成式 PnP 动力学后段渐近行为的理想化 ODE 方法刻画；该结果为截断后后段细化过程提供了动力学解释。结合显式数据保真梯度更新与流路径重参数化，TFM-PnP 在无需重训练模型的情况下实现高保真、物理一致的重建。此外，我们利用流模型固有的生成多样性导出空间不确定性地图；该逐像素不确定性系统性地指导序贯轨迹规划策略，在每轮重新规划中选取信息丰富且可达的目标位置，并用所提 UAPS 算法加以连接。在 Sionna 射线追踪数据集上的广泛评估表明，所提框架相对对比基线实现了 NMSE 降低，同时保持较强的空间保真度。

## 致谢与说明

本文的初步版本已发表于 Proc. IEEE ICASSP 2026 [1]。本期刊版本在会议版本基础上作了实质性扩展：发展了带 ODE 方法解释的时间截断 PnP-flow 重建算法，改进了主动轨迹规划表述，并提供了显著扩充的实验验证。

## 附录 A. 命题 1 的证明

固定有限索引 $k_0$，考虑 $k\ge k_0$ 的序列。任意有限次早期更新（包括可能来自 $t_0=0$ 的初始更新）均视为初始化暂态，不影响渐近 ODE 极限。为记号简洁，该后段序列仍保留索引 $k$，并定义 $h_k\triangleq1-t_k$。由 $\sum_{k=k_0}^{\infty}h_k=\infty$ 与 $\sum_{k=k_0}^{\infty}h_k^2<\infty$ 可得 $h_k\to0$，从而 $t_k\to1$。

令 $\{\mathcal F_k\}_{k\ge k_0}$ 为由过去迭代以及第 $k$ 步之前抽取的参考样本生成的 filtration。由假设，新样本 $\mathbf Z_0^{(k)}$ 与 $\mathcal F_k$ 独立，

$$
\mathbb E\left[\mathbf Z_0^{(k)}\mid\mathcal F_k\right]=\mathbf 0,\qquad
\mathbb E\left[\left\|\mathbf Z_0^{(k)}\right\|^2\mid\mathcal F_k\right]\le C_0
$$

其中 $C_0>0$ 为某常数。采用式 (12) 的记号，测量一致性更新为

$$
\bar{\mathbf Z}^{(k+1)}=\mathbf Z^{(k)}-\eta_k\nabla F(\mathbf Z^{(k)}). \tag{25}
$$

重参数化后的状态为

$$
\mathbf W^{(k+1)}=t_k\bar{\mathbf Z}^{(k+1)}+h_k\mathbf Z_0^{(k)}. \tag{26}
$$

最后，施加流诱导先验算子得到

$$
\mathbf Z^{(k+1)}=\mathbf W^{(k+1)}+h_kv_\theta\left(t_k,\mathbf W^{(k+1)}\right). \tag{27}
$$

我们首先推导单步增量。将 (25) 代入 (26) 并利用 $\beta_k=t_k\eta_k/h_k$，得到

$$
\mathbf W^{(k+1)}=\mathbf Z^{(k)}
+h_k\left(\mathbf Z_0^{(k)}-\mathbf Z^{(k)}-\beta_k\nabla F(\mathbf Z^{(k)})\right). \tag{28}
$$

因此，用 (27) 减去 $\mathbf Z^{(k)}$ 得

$$
\mathbf Z^{(k+1)}-\mathbf Z^{(k)}
=h_k\left(\mathbf Z_0^{(k)}-\mathbf Z^{(k)}-\beta_k\nabla F(\mathbf Z^{(k)})
+v_\theta\left(t_k,\mathbf W^{(k+1)}\right)\right). \tag{29}
$$

下一步，把在 $\mathbf W^{(k+1)}$ 处评价的速度替换为在当前迭代处评价的速度。定义

$$
\mathbf R^{(k)}\triangleq v_\theta\left(t_k,\mathbf W^{(k+1)}\right)-v_\theta\left(t_k,\mathbf Z^{(k)}\right).
$$

由有界性假设，$k\ge k_0$ 的迭代几乎必然位于紧集 $\mathcal K\subset\mathbb R^{I\times J}$ 中。由于 $\nabla F$ 局部 Lipschitz，它在 $\mathcal K$ 上有界。此外，因 $\beta_k\to\beta$，$\{\beta_k\}$ 有界。由 (28)，存在有限常数 $C_1>0$ 使

$$
\mathbb E\left[\left\|\mathbf W^{(k+1)}-\mathbf Z^{(k)}\right\|^2\mid\mathcal F_k\right]\le C_1h_k^2. \tag{30}
$$

由 $v_\theta$ 关于 $\mathbf Z$ 的一致 Lipschitz 性质，存在 $L>0$ 使 $\|\mathbf R^{(k)}\|\le L\|\mathbf W^{(k+1)}-\mathbf Z^{(k)}\|$。因此

$$
\mathbb E\left[\left\|\mathbf R^{(k)}\right\|^2\mid\mathcal F_k\right]\le L^2C_1h_k^2. \tag{31}
$$

现在定义极限漂移

$$
G(\mathbf Z)\triangleq-\mathbf Z-\beta\nabla F(\mathbf Z)+v_\theta(1,\mathbf Z).
$$

将 $v_\theta(t_k,\mathbf W^{(k+1)})=v_\theta(t_k,\mathbf Z^{(k)})+\mathbf R^{(k)}$ 代入 (29)，递推变为

$$
\mathbf Z^{(k+1)}=\mathbf Z^{(k)}
+h_k\left(G(\mathbf Z^{(k)})+\mathbf Z_0^{(k)}\right)+\boldsymbol\varepsilon^{(k)}, \tag{32}
$$

其中

$$
\boldsymbol\varepsilon^{(k)}
=h_k\left(-(\beta_k-\beta)\nabla F(\mathbf Z^{(k)})
+v_\theta(t_k,\mathbf Z^{(k)})-v_\theta(1,\mathbf Z^{(k)})\right)
+h_k\mathbf R^{(k)}. \tag{33}
$$

接下来证明误差项在 ODE 时间尺度上可忽略。由于 $\beta_k\to\beta$、$t_k\to1$，且 $v_\theta(t,\mathbf Z)$ 关于 $t$ 连续、关于 $\mathbf Z$ 一致 Lipschitz，$v_\theta(t_k,\cdot)\to v_\theta(1,\cdot)$ 在包含迭代的紧集上一致成立。因此，(33) 中括号项几乎必然收敛到零。此外，(31) 意味着 $\mathbf R^{(k)}=O(h_k)$（在 $L^2$ 意义下）。于是

$$
\boldsymbol\varepsilon^{(k)}=h_k\boldsymbol\delta_k+O_{L^2}\left(h_k^2\right),\qquad
\boldsymbol\delta_k\to0\quad\text{a.s.} \tag{34}
$$

因此，在算法时间的任意有界区间上，当起始索引趋于无穷时 $\boldsymbol\varepsilon^{(k)}$ 的累积贡献消失。事实上，在任意满足 $\sum h_k\le T<\infty$ 的区间上，第一项被 $T\sup_{k\ge n}\|\boldsymbol\delta_k\|$ 约束，第二项由 $\sum h_k^2$ 在 $L^2$ 中的余项控制。

尚需控制累积随机扰动。定义鞅

$$
\mathbf M_n\triangleq\sum_{k=k_0}^{n-1}h_k\mathbf Z_0^{(k)}.
$$

由于 $\mathbf Z_0^{(k)}$ 是二阶矩一致有界的鞅差，有

$$
\mathbb E\left\|\mathbf M_n-\mathbf M_m\right\|^2
\le C_0\sum_{k=m}^{n-1}h_k^2,\qquad n>m\ge k_0.
$$

由于 $\sum_{k=k_0}^{\infty}h_k^2<\infty$，鞅 $\{\mathbf M_n\}$ 在 $L^2$ 中有界。由鞅收敛定理，它几乎必然收敛。因此

$$
\lim_{n\to\infty}\sup_{m\ge n}
\left\|\sum_{k=n}^{m}h_k\mathbf Z_0^{(k)}\right\|=0\quad\text{a.s.} \tag{35}
$$

结合 (32)、(34) 与 (35)，所得后段递推是自治 ODE $\frac{d\mathbf Z(s)}{ds}=G(\mathbf Z(s))$ 的欧拉离散化，误差仅来自其累积效应在每个有限算法时间区间上消失的扰动。按随机逼近的 ODE 方法，分段线性插值 $\tilde{\mathbf Z}(s)$ 因而是该 ODE 的渐近伪轨迹，即恰为 (13)。证毕。

## 图注与表注

**图 1：** 基于流匹配的无线电地图构建主动学习流程。左侧为“重建—不确定性量化—轨迹规划”闭环示意，右侧为条件流匹配训练示意（从基噪声到无线电地图的条件 OT 路径）。

**图 2：** 不同梯度步长 $\eta$ 下，NMSE 随采样率（0.02–0.06）的变化。较大的梯度步长降低 NMSE，但当 $\eta$ 超过 2.0 后边际性能增益递减。图中曲线为 $\eta=0.0,0.5,1.0,1.5,2.0,2.2$。

**图 3：** 不同起始时间 $a$（0–0.96）下的 NMSE 比较（采样率 2% 与 6%）。增大起始时间起初降低 NMSE，之后改善变得微小并在 $a=0.9$ 附近饱和。

**图 4：** 重建 NMSE 随采样率（0.02–0.06）的变化（对数纵轴）。所提 TFM-PnP 在所有采样率下取得最低 NMSE；对比基线为 DRUE、RePaint、GPR、PnP-Flow、KNN、DPS。

**图 5：** 6% 采样率下的视觉比较（真值、稀疏观测及各方法重建）。相对基线，所提 TFM-PnP 给出更准确、空间一致的重建；图中标注的单图 NMSE 为 0.067（TFM-PnP），对比 GPR 0.142、KNN 0.139、DRUE 0.812、RePaint 0.111、DPS 0.083、PnP-Flow 0.096。

**图 6：** 拓扑不同环境下 6% 采样率无线电地图重建的跨场景验证。低 NMSE 与空间一致性表明所提 TFM-PnP 框架的泛化能力；图中单图 NMSE 为 0.065（TFM-PnP），对比 GPR 0.197、KNN 0.129、DRUE 0.780、RePaint 0.151、DPS 0.106、PnP-Flow 0.137。

**图 7：** 不同采样率（0.02–0.06）下推理步数（20–100）对所提 TFM-PnP 重建 NMSE 的影响。推理步数设为 60 足以达到接近饱和的性能。

**图 8：** 不确定性地图与重建误差对比。从左至右依次为：真值无线电地图、所提方法的预测不确定性地图、重建绝对误差（dB）。所提方法给出的不确定性地图在定性上与真实重建误差的空间分布及底层无线电地图结构一致，表明模型能够指示高预测不确定性区域。

**图 9：** 重建性能（NMSE）关于重建样本数 $M$（3–10）的敏感性分析（横轴为飞行步数 0–2000）。曲线高度重叠，说明在该范围内对 $M$ 的变化不敏感。

**图 10：** NMSE 随无人机飞行步数（0–2000）的变化。所提不确定性引导采样策略相比 DRUE 与随机采样实现了更快的误差下降。

**表 I：** 每幅无线电地图的平均推理时间（秒），数值为多次独立试验的均值 ± 标准差；所提 TFM-PnP 为 0.7359 ± 0.0412 s。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 12–13 页转录；未逐条核对 DOI）。

[1] H. Sun, S. Liu, X. Yu, and Y. Sun, “Flow matching-based active learning for radio map construction with low-altitude UAVs,” in Proc. IEEE Int. Conf. Acoustics, Speech, Signal Processing, 2026, pp. 21 406–21 410.

[2] N. Hossein Motlagh, T. Taleb, and A. Orouk, “Low-altitude unmanned aerial vehicles-based internet of things services: Comprehensive survey and future perspectives,” IEEE Internet Things J., vol. 3, no. 6, pp. 899–922, Sep. 2016.

[3] Y. Wang, J. Huang, F. Shan, Y. Gao, R. Xiong, and J. Luo, “Optimizing joint speed and altitude schedule for UAV data collection in low-altitude airspace,” IEEE Trans. Mobile Comput., pp. 1–15, Jul. 2025.

[4] M. Wu, H. Wu, W. Lu, L. Guo, I. Lee, and A. Jamalipour, “Security-aware designs of multi-UAV deployment, task offloading and service placement in edge computing networks,” IEEE Trans. Mobile Comput., pp. 1–15, Oct. 2025.

[5] H. Sun and J. Chen, “Energy-modified leverage sampling for radio map construction via matrix completion,” IEEE Signal Process. Lett., vol. 31, pp. 1780–1784, Jun. 2024.

[6] L. Xu, L. Cheng, J. Chen, W. Pu, and X. Fu, “Radio map estimation via latent domain plug-and-play denoising,” IEEE Trans. Signal Process., pp. 1–14, 2026.

[7] H. Sun and J. Chen, “Integrated interpolation and block-term tensor decomposition for spectrum map construction,” IEEE Trans. Signal Process., vol. 72, pp. 3896–3911, Aug. 2024.

[8] S. Timilsina, S. Shrestha, and X. Fu, “Quantized radio map estimation using tensor and deep generative models,” IEEE Trans. Signal Process., vol. 72, pp. 173–189, Nov. 2024.

[9] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, “A tutorial on environment-aware communications via channel knowledge map for 6G,” IEEE Commun. Surv. Tutor., vol. 26, no. 3, pp. 1478–1519, Feb. 2024.

[10] H. Sun and J. Chen, “Propagation map reconstruction via interpolation assisted matrix completion,” IEEE Trans. Signal Process., vol. 70, pp. 6154–6169, Dec. 2022.

[11] S. Liu, X. Yu, Z. Gao, J. Xu, D. W. K. Ng, and S. Cui, “Sensing-enhanced channel estimation for near-field XL-MIMO systems,” IEEE J. Sel. Areas Commun., vol. 43, no. 3, pp. 628–643, Mar. 2025.

[12] S. Shrestha, X. Fu, and M. Hong, “Deep spectrum cartography: Completing radio map tensors using learned neural models,” IEEE Trans. Signal Process., vol. 70, pp. 1170–1184, Jan. 2022.

[13] X. Mo, Y. Huang, and J. Xu, “Radio-map-based robust positioning optimization for UAV-enabled wireless power transfer,” IEEE Wireless Commun. Lett., vol. 9, no. 2, pp. 179–183, Oct. 2019.

[14] J. Chen, B. Li, H. Sun, S. Cui, and N. Pappas, “Predictive communications for low-altitude networks,” Sep. 2025. [Online]. Available: https://arxiv.org/abs/2509.01705

[15] B. Li and J. Chen, “Radio map assisted approach for interference-aware predictive UAV communications,” IEEE Trans. Wireless Commun., Aug. 2024.

[16] Y. Chen, Q. Zhu, J. Wang, Z. Lin, Q. Wu, Y. Huang, and Q. Ye, “A novel online path planning method for UAV-based 3D spectrum mapping,” in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), Milan, Italy, Mar. 2025, pp. 01–06.

[17] K. D. Polyzos, A. Sadeghi, W. Ye, S. Sleder, K. Houssou, J. Calder, Z.-L. Zhang, and G. B. Giannakis, “Bayesian active learning for sample efficient 5G radio map reconstruction,” IEEE Trans. Wireless Commun., vol. 23, no. 12, pp. 19 382–19 396, Dec. 2024.

[18] Z. Chen, H. Wang, and D. Guo, “3-D radio map estimation based on active measurement trajectory selection,” IEEE Trans. Wireless Commun., vol. 14, no. 7, pp. 1884–1888, Jul. 2025.

[19] W. Lu, S. Gao, M. Wen, Y. Liang, L. Yang, C.-B. Chae, and H. V. Poor, “Bayesian-driven graph reasoning for active radio map construction,” Aug. 2025. [Online]. Available: https://arxiv.org/abs/2508.09142

[20] R. Shrestha, D. Romero, and S. P. Chepuri, “Spectrum surveying: Active radio map estimation with autonomous UAVs,” IEEE Trans. Wireless Commun., vol. 22, no. 1, pp. 627–641, Jan. 2023.

[21] J. Ho, A. Jain, and P. Abbeel, “Denoising diffusion probabilistic models,” Advances in neural information processing systems, vol. 33, pp. 6840–6851, 2020.

[22] J. Sohl-Dickstein, E. A. Weiss, N. Maheswaranathan, and S. Ganguli, “Deep unsupervised learning using nonequilibrium thermodynamics,” 2015. [Online]. Available: https://arxiv.org/abs/1503.03585

[23] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, “Score-based generative modeling through stochastic differential equations,” 2021. [Online]. Available: https://arxiv.org/abs/2011.13456

[24] M. Mardani, J. Song, J. Kautz, and A. Vahdat, “A variational perspective on solving inverse problems with diffusion models,” 2023. [Online]. Available: https://arxiv.org/abs/2305.04391

[25] Y. Song, L. Shen, L. Xing, and S. Ermon, “Solving inverse problems in medical imaging with score-based generative models,” 2022. [Online]. Available: https://arxiv.org/abs/2111.08005

[26] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le, “Flow matching for generative modeling,” Feb. 2023. [Online]. Available: https://arxiv.org/abs/2210.02747

[27] X. Liu, C. Gong, and Q. Liu, “Flow straight and fast: Learning to generate and transfer data with rectified flow,” 2022. [Online]. Available: https://arxiv.org/abs/2209.03003

[28] J. Kim, B. S. Kim, and J. C. Ye, “FlowDPS: Flow-driven posterior sampling for inverse problems,” 2025. [Online]. Available: https://arxiv.org/abs/2503.08136

[29] A. Pokle, M. J. Muckley, R. T. Q. Chen, and B. Karrer, “Training-free linear image inverses via flows,” 2024. [Online]. Available: https://arxiv.org/abs/2310.04432

[30] H. Ben-Hamu, O. Puny, I. Gat, B. Karrer, U. Singer, and Y. Lipman, “D-flow: Differentiating through flows for controlled generation,” 2024. [Online]. Available: https://arxiv.org/abs/2402.14017

[31] Y. Zhang, P. Yu, Y. Zhu, Y. Chang, F. Gao, Y. N. Wu, and O. Leong, “Flow priors for linear inverse problems via iterative corrupted trajectory matching,” 2025. [Online]. Available: https://arxiv.org/abs/2405.18816

[32] S. Martin, A. Gagneux, P. Hagemann, and G. Steidl, “PnP-flow: Plug-and-play image restoration with flow matching,” in Proc. Int. Conf. Learning Representations (ICLR), Singapore, Apr. 2025, poster track, ICLR 2025.

[33] S. Boyd, N. Parikh, E. Chu, B. Peleato, and J. Eckstein, 2011.（原抽取条目信息不全，仅保留作者与年份，待核对完整出处）

[34] W. Dinkelbach, “On nonlinear fractional programming,” Management science, vol. 13, no. 7, pp. 492–498, 1967.

[35] F. A. Aoudia, J. Hoydis, M. Nimier-David, S. Cammerer, and A. Keller, “Sionna RT: Technical report,” Apr. 2025. [Online]. Available: https://arxiv.org/abs/2504.21719

[36] H. Chung, J. Kim, M. T. Mccann, M. L. Klasky, and J. C. Ye, “Diffusion posterior sampling for general noisy inverse problems,” 2024. [Online]. Available: https://arxiv.org/abs/2209.14687

[37] A. Lugmayr, M. Danelljan, A. Romero, F. Yu, R. Timofte, and L. V. Gool, “Repaint: Inpainting using denoising diffusion probabilistic models,” 2022. [Online]. Available: https://arxiv.org/abs/2201.09865

**本页范围与校对状态：** 本页为 arXiv:2609.27486v1 的全文中文译稿，覆盖摘要、正文第 I–VII 节、结论、致谢说明、附录 A 的命题 1 证明、图 1–10 图注、表 I 逐格、算法 1–2 的逐行描述与参考文献 [1]–[37]。公式编号沿用原文（1）–（24）与附录（25）–（35）。原文图 5、图 6 面板内的单图 NMSE 数值已按原文标注录入，未对图中曲线做数字化估算。原文参考文献 [33] 在抽取文本中仅有作者与年份，已加注说明信息不全；其余条目按 PDF 原文转录。**逐句逐式对照原 PDF 的终校未做**，原文疑点与抽取残缺处已在文中标注；如发现公式排版或个别数值与 PDF 不一致，以原文 PDF 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
