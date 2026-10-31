---
layout: page
title: "ProFlow：基于近端流引导的零样本物理一致采样｜中文全文译文"
permalink: /papers/translations/2026-10-29-proflow-zero-shot-physics-consistent-sampling-via-proximal-flow-guidan-2601-20227/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/04f4e9392aea53cf/) · [原文 arXiv](https://arxiv.org/abs/2601.20227) · [全部目录](/papers/catalog/)

# ProFlow：基于近端流引导的零样本物理一致采样

**原题：** ProFlow: Zero-Shot Physics-Consistent Sampling via Proximal Flow Guidance  
**作者：** Zichao Yu$^{a,*}$、Ming Li$^{b,*}$、Wenyi Zhang$^{c}$、Difan Zou$^{d}$、Weiguo Gao$^{e,**}$  
**单位：** $^{a}$ 中国科学技术大学；$^{b}$ 复旦大学数学科学学院（上海 200433）；$^{c}$ 中国科学技术大学电子工程与信息科学系（合肥 230027）；$^{d}$ 香港大学计算与数据科学学院；$^{e}$ 复旦大学数学科学学院 & 上海现代应用数学重点实验室（上海 200433）。$^{*}$ 共同贡献；$^{**}$ 通讯作者：wggao@fudan.edu.cn。  
**版本：** arXiv:2601.20227v1（cs.LG），2026 年 1 月 28 日；预印本 25 页（正文 + 参考文献 + 附录 A—C）。  
**关键词：** 生成建模；逆问题；贝叶斯推断；约束优化；稀疏观测。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 1—6 节（含 2.1—2.5、3、4.1—4.3 与算法 1、5.1—5.4、6）、图 1—4 中文图注、**表 1—5 逐格转录**、附录 A—C 结构化译文、参考文献 [1]—[55]（英文原条目，按原编号）均按原文结构录入；编号公式 (1)—(29)、算法 1 与附录式 (A.1)、(B.1)—(B.2)、(C.1)—(C.2) 按原文保留。逐句逐式终校未做。

## 摘要

从稀疏观测推断物理场、同时严格满足偏微分方程（PDE），是计算物理中的基础难题。近期，深度生成模型为这类逆问题提供了强大的数据驱动先验，但现有方法难以在不进行昂贵重训练、也不破坏已学生成先验的前提下施加**硬物理约束**。因此，亟需一种采样机制，能够把严格的物理一致性与观测保真度同预训练先验的统计结构协调起来。为此，我们提出 **ProFlow**——一种用于零样本物理一致采样的**近端引导**框架；其中"零样本"指在固定生成先验下、无需任务特定重训练地从稀疏观测推断解。该算法采用严格的两步方案交替进行：(i) **终端优化步**，通过近端最小化把流的预测投影到物理一致集与观测一致集的**交集**上；(ii) **插值步**，把精化后的状态映射回生成轨迹，以保持与所学流概率路径的一致性。该过程可解释为一系列局部最大后验（MAP）更新，具有贝叶斯解释。在 Poisson、Helmholtz、Darcy 与粘性 Burgers 方程上的综合基准表明，相较最先进的扩散模型与流模型基线，ProFlow 取得更优的物理一致性与观测一致性，以及更准确的分布统计。

## 1 引言

计算物理中许多问题涉及推断受偏微分方程（PDE）约束、且仅在空间或时间上部分观测的未知场 [24, 44, 47]。例子包括从稀疏测量恢复材料属性 [8, 46]、把传感器数据同化进物理模型 [16, 45]，或为不确定性量化生成合理状态的系综 [41]。弥合理论控制方程与有限经验观测之间的鸿沟，是预测建模与科学发现的基础。

形式上，考虑有界空间域 $\Omega\subset\mathbb R^d$ 上的一族 PDE。令 $u:\Omega\to\mathbb R^n$ 表示适当函数空间 $\mathcal U$ 中的状态场，$\mathcal L$ 为编码控制方程的微分算子。我们在概率框架下表述采样任务，其中 $\mathcal C$ 与 $\mathcal O$ 表示约束未知场的特定事件。首先，令 $\mathcal C$ 表示场满足物理定律的**物理一致事件**：

$$
\mathcal C\triangleq\{\mathcal L(u)=0\}.\tag{1}
$$

其次，为计入部分且带噪的信息，引入**观测事件** $\mathcal O$。令 $H$ 为测量算子、$\mathbf y$ 为观测数据，假设观测由高斯噪声模型产生：

$$
\mathbf y=H[u]+\boldsymbol\xi,\qquad\boldsymbol\xi\sim\mathcal N(\mathbf 0,\sigma_{\mathrm{obs}}^2\mathbf I).\tag{2}
$$

把 $\mathcal O$ 定义为按该模型观测到 $\mathbf y$ 的事件。目标是**从以两事件联合发生为条件的后验分布中采样**：

$$
p(u\mid\mathcal C,\mathcal O)\propto p(u)p(\mathcal O\mid u)\mathbf 1_{\mathcal C}(u),\tag{3}
$$

这里 $p(\mathcal O\mid u)$ 为观测模型诱导的似然，$\mathbf 1_{\mathcal C}$ 强制物理约束，$p(u)$ 为后文指定的生成先验。该框架依 $H$ 的性质涵盖广泛问题：对**正问题**，$H$ 把解空间限制到满足给定初边值条件的解；对**逆问题**，$H$ 编码稀疏观测，需从中推断物理参数。

经典上，这些问题用有限差分法（FDM）[28]、有限元法（FEM）[5]、有限体积法（FVM）[17] 或谱方法 [19] 求解。这些传统方法虽高度精确，但需仔细设计数值格式，且在高维下计算昂贵。因此出现了基于深度学习的求解器作为可行替代，从物理信息神经网络（PINN）[40] 到 DeepONet [36]、Fourier 神经算子（FNO）[30] 等算子学习器。尽管有用，这些方法常受优化困难与表达能力有限的困扰，这促使研究转向**生成式范式**：扩散模型 [20, 43] 与流匹配模型 [32, 34] 已被用于合成逼真图像与视频 [13, 15, 18, 26, 50]、设计分子与材料 [12, 23, 39]、以及模拟高维气候与天气场 [27, 49] 等。在 PDE 领域，生成模型能学习复杂分布并在采样过程中执行**零样本**可控生成任务 [11, 38, 51, 53]。例如，DiffusionPDE [21] 利用 PDE 残差的梯度引导扩散采样，而 D-Flow [4] 优化初始噪声以更好地对齐 PDE 约束；相反，ECI 框架 [10] 与物理约束流匹配模型 [48] 通过流形投影或线性修正来避免对求解器反传的高昂代价，使生成轨迹与物理约束对齐。然而这些方法存在共同局限：第一，它们通常只把物理有效性作为**软约束**施加（通过惩罚项或近似引导），因此生成的解不保证严格满足控制 PDE，可能导致守恒律或物理一致性被违反；第二，它们往往缺乏由有原则的贝叶斯表述推导而来的清晰解释——当前方法大多依赖启发式轨迹修正（如临时投影或梯度惩罚）来强制一致性，因此这些调整不保证瞄准真实后验分布 $p(u\mid\mathcal C,\mathcal O)$。没有与良定义条件密度的显式联系，就难以确保生成的样本在统计上代表解的真实不确定性。

为解决上述局限，我们提出 **ProFlow**——一种用于带预训练生成先验的零样本物理一致采样的近端引导方案。我们以**函数流匹配（Functional Flow Matching, FFM）**[25] 作为生成先验，因为它从根本上把数据视为连续场而非离散向量。具体地，FFM 在函数空间 $\mathcal U$ 上学习连续流，把简单参考测度 $\mu_0$（通常为高斯随机场）输运到支撑在物理一致集上的目标分布 $\mu_1$；这通过训练神经网络近似条件概率路径的速度场实现，条件路径通常定义为参考样本与目标样本之间的线性插值。终端分布 $\mu_1$ 因而充当 $\mathcal U$ 中容许函数上的学习式先验密度 $p(u)$；把该先验以物理与观测约束为条件即得目标后验（3）。如图 1 所示，ProFlow 修正采样轨迹以从受约束后验中采样。在每个时间 $t_n$（$n$ 为离散化步索引），算法迭代两个互补步骤：(i) **终端优化步**，FFM 模型预测候选终端状态 $\hat u_1=u_t+(1-t)v_\theta(u_t,t)$，再把该候选精化为有效解 $u_1$，通过求解近端优化问题

$$
u_1=\arg\min_{u\in\mathcal C}\left\|u-\hat u_1\right\|_2^2+\lambda\left\|H[u]-\mathbf y\right\|_2^2;\tag{4}
$$

该步在强制观测算子 $H$ 与约束 $\mathcal C$ 的同时，让解锚定在生成先验的预测附近；(ii) **插值步**，精化后的状态 $u_1$ 再通过与新采噪声 $\varepsilon$ 的线性插值映射回下一中间时刻 $t_{n+1}$：

$$
u_{t_{n+1}}=(1-t_{n+1})\varepsilon+t_{n+1}u_1.\tag{5}
$$

这确保更新步与 FFM 训练所假设的线性概率路径（"直线"桥）保持一致。通过迭代这两步，ProFlow 提供一种严格机制，在强制物理与观测约束的同时保持所学先验的统计结构。

全文结构：第 2 节综述面向 PDE 的物理信息与生成建模相关工作；第 3 节给出本文所用函数流匹配先验的必要背景；第 4 节给出概率表述、推导近端引导方案并描述 ProFlow 算法；第 5 节报告椭圆型与时间相关 PDE 基准上的数值结果并与代表性基线比较；第 6 节总结并展望未来工作。

## 2 相关工作与本文贡献

### 2.1 经典数值求解器

偏微分方程（PDE）是描述时空物理系统的基本数学框架，但实际控制方程很少有闭式解析解。因此科学计算长期依赖有限差分法（FDM）[28]、有限元法（FEM）[5]、有限体积法（FVM）[17] 与谱方法 [19] 等数值离散格式来近似解。这些经典求解器把连续域离散为网格，把微分算子转化为可迭代求解的代数方程组。它们数学上严谨、在工程中无处不在，但在精细分辨率或高维设定下因计算成本过高而面临巨大挑战；此外通常需要大量问题特定工程（如复杂网格生成）以适应复杂几何；其高昂计算开销也使其不适合逆分析或不确定性量化等多次查询任务，从而推动了向深度学习的转变。

### 2.2 物理信息深度学习

受经典方法计算瓶颈驱动，近期研究转向基于深度学习的求解器。开创性的物理信息神经网络（PINN）[40] 使用基于坐标的神经网络，把控制方程通过 PDE 残差与边界惩罚直接嵌入训练目标。该表述以无网格方式学习连续解场，即便观测稀疏也能数据高效建模，因此 PINN 已被成功用于流体力学 [6, 37]、雷诺平均 Navier–Stokes 建模 [14] 与传热 [7] 等广泛物理领域。但 PINN 面临可扩展性挑战：每个新问题实例或参数配置都需从头求解高维非凸优化问题，这种迭代训练负担对长时程动力学或刚性微分方程愈发难以承受，限制了其实时应用。

### 2.3 神经算子学习

为克服 PINN 的单实例局限，算子学习框架被引入，用于近似无限维函数空间之间的映射。Fourier 神经算子（FNO）[30] 与 DeepONet [36] 等代表性架构学习能跨可变输入泛化的解算子，从而无需重训练即可快速评估。该范式已被显著扩展以处理复杂物理与几何：例如近期工作利用学习式坐标变形把 FNO 扩展到一般不规则几何 [29]；算子学习范围也从标准微分方程扩展到更复杂的积分表述——Bassi et al. [2] 用循环架构求积分微分方程，Zhu et al. [55] 用非线性积分算子学习预测量子多体系统中的非平衡 Green 函数动力学。最后，为提升物理保真度并处理逆问题，PINO [31] 与 iFNO [35] 等框架把物理约束或可逆性直接整合进算子架构，弥合数据驱动近似与物理一致性之间的差距。

### 2.4 面向 PDE 的生成建模

神经算子学习显著加速了正演仿真，但这些方法通常是确定性的，缺乏自然表示不确定性或同化部分观测的机制。为缓解这一点，近期工作探索生成先验（从图模型 [22, 54] 到深度扩散过程）来建模容许场的分布。当前方法大致分三类：第一类是**训练时正则化**，把物理直接嵌入生成目标（如物理信息扩散模型 [3]、基于物理的流匹配 [1]）；虽然有效，但这类模型无法在不重训练的情况下适应新边界条件。另一类是**微调**方法（如物理信息奖励微调 [52]），使模型权重适应新观测；但计算昂贵且有灾难性遗忘风险——模型可能偏离原学习分布。第三类是**采样时引导**，用固定先验在采样期间强制约束，避免重训练；本文方法属于此类。该方向现有工作的区别在于强制机制：DiffusionPDE [21] 用 PDE 残差做软性梯度引导，灵活但无法保证严格物理可行性；ECI [10] 与 PCFM [48] 采用硬投影——ECI 限于线性约束，PCFM 使用 Gauss–Newton 更新。尽管各有成功，这些方法面临根本折中：软引导常允许违反物理定律，而硬投影可能造成与生成概率路径的不一致，降低样本的统计质量。此外，许多现有方法侧重对采样轨迹的经验调整，因此从统一的概率采样目标推导这些方法、建立理论保证仍是开放挑战。

### 2.5 本文贡献

为应对上述挑战，我们提出 **ProFlow**，通过把严格物理约束与生成保真度统一起来，化解软引导与硬投影之间的张力。我们在有原则的贝叶斯表述下构造问题，推导出条件律分解，从而得到两个可解释的更新：**近端终端精化**（强制物理与数据约束）与**流一致插值**（恢复与预训练生成流形的接近性）。该方法在理论上有据的零样本采样框架下统一了引导与投影两类方法。表 1 突出 ProFlow 与现有方法的关键区别。主要贡献如下：

- 提出面向流匹配先验的零样本物理信息采样的贝叶斯表述，表示为受约束后验 $p(u\mid\mathcal C,\mathcal O)$ 及启发两阶段引导方案的条件律分解；
- 提出**终端近端优化步**，可解释为近似条件模型的局部 MAP 估计，在单个优化问题中平衡与流预测的接近性、物理与数据一致性；
- 提出**插值步**，在每次近端更新后恢复与所学 FFM 桥的兼容性，确保预训练速度场在其有效域内工作，而非去修正离流形状态；
- 在 Poisson、Helmholtz、Darcy 流基准与粘性 Burgers 轨迹上开展综合数值研究，表明 ProFlow 相较基线取得物理与观测一致性以及更准确的分布统计。

## 3 面向 PDE 的函数流匹配先验

在零样本物理信息采样中，我们的目标是生成满足 PDE 且与稀疏观测一致的场，而无需成对监督。我们不用确定性求解器，而是学习物理一致场上的**生成先验**；这产生多样、近似合理的样本，随后可引导其强制 PDE 或匹配新观测。

为构造该先验，我们采用函数流匹配（FFM）[25]。FFM 学习一个确定性连续变换，把随机函数平滑地形变为物理场解。形式上，令 $\mathcal U$ 为函数 $u:\Omega\to\mathbb R^n$ 的实可分 Hilbert 空间，配有 Borel $\sigma$-代数 $\mathcal B(\mathcal U)$。FFM 定义流 $\psi_t:\mathcal U\to\mathcal U$，其中 $t$ 为同伦变量（非物理时间）。生成过程从简单参考分布 $\mu_0$（通常为高斯随机场）采样函数 $u_0$ 开始，再按 ODE 演化：

$$
\frac{d}{dt}\psi_t(u_0)=v_\theta\left(\psi_t(u_0),t\right),\qquad\psi_0(u_0)=u_0,\tag{6}
$$

其中 $v_\theta$ 为可学习的速度场神经网络（$\theta$ 为网络参数）。FFM 的关键优势是**免仿真训练**：训练模型无需解 ODE，而是定义在先验 $\mu_0$ 与数据 $\mu_1$ 之间线性插值的目标概率路径，任意样本对的目标速度即直线向量 $u_1-u_0$。我们通过最小化

$$
\mathcal L_{\mathrm{FFM}}(\theta)=\mathbb E_{t\sim\mathrm{U}(0,1),u_0\sim\mu_0,u_1\sim\mu_1}\left[\left\|v_\theta(u_t,t)-(u_1-u_0)\right\|_2^2\right]\tag{7}
$$

训练 $v_\theta$ 匹配该向量场，其中 $u_t=(1-t)u_0+tu_1$。采样时从 $\mu_0$ 采样 $u_0$ 并数值积分（6）到 $t=1$ 即生成新场。由于该先验由数据学习，生成的样本只是近似物理一致；采样时我们用物理约束 $\mathcal L(u)=0$ 与可用观测引导生成轨迹，从而在以数据为条件的同时强制 PDE 一致性。

## 4 方法

### 4.1 问题表述

我们沿用第 1 节引入的概率表述。令 $\mu_1$ 表示预训练 FFM 模型在 $t=1$ 处诱导的分布，它充当生成先验 $p(u)$。我们要从以物理一致事件 $\mathcal C$ 与观测事件 $\mathcal O$ 为条件的后验分布中采样。回顾（3）的分解，目标密度为

$$
p(u\mid\mathcal C,\mathcal O)\propto p(u)p(\mathcal O\mid u)\mathbf 1_{\mathcal C}(u),\tag{8}
$$

其中 $p(\mathcal O\mid u)$ 为高斯噪声假设（2）诱导的似然，$\mathbf 1_{\mathcal C}$ 为 PDE 约束的指示函数。由于先验 $p(u)$ 的隐式性质，从该后验精确采样不可解。因此如第 4.2 节详述，我们通过一系列**局部最大后验（MAP）更新**近似采样轨迹；这些更新在每个时间步显式平衡基于流的先验、数据似然与硬物理约束。

> **注 4.1（向时间相关问题扩展）.** 本节记号描述平稳场以保持清晰，但框架可自然扩展到时间相关设定。对演化方程（如 Burgers 方程），变量 $u$ 表示时空域 $\Omega\times[0,T]$ 上的整个解轨迹；于是物理一致事件 $\mathcal C$ 涵盖时间演化残差，观测事件 $\mathcal O$ 推广为分布在整个时空坐标上的测量（如稀疏传感器或时间快照）。这使后验分解与采样流程在结构上与平稳情形保持一致。

### 4.2 近端引导方案的推导

我们的目标是构造一个采样算法，通过一系列可处理的局部转移近似受约束后验 $p(u\mid\mathcal C,\mathcal O)$。如第 3 节所述，预训练流匹配模型定义同伦时间变量 $t\in[0,1]$，在 $t=0$ 的参考分布 $\mu_0$ 与 $t=1$ 的先验 $\mu_1$ 之间插值；记 $u_t$ 为同伦时间 $t$ 的状态。

概念上，用约束对终端分布加条件，定义沿所学流反向输运受约束终端律所得的后验路径 $\{p(u_t\mid\mathcal C,\mathcal O)\}_{t\in[0,1]}$。假设在某个时刻 $t$ 已得到抽样 $u_t\sim p(u_t\mid\mathcal C,\mathcal O)$，则对任意更晚时刻 $s\in(t,1]$，相应边缘可通过以中间状态为条件写出，如命题 4.1 所示。

**命题 4.1（条件律分解）.** 设 $0\leq t<s\leq1$，$\mathcal C$ 与 $\mathcal O$ 分别为物理一致事件与观测事件。假设在条件测度 $P(\cdot\mid\mathcal C,\mathcal O)$ 下，$(u_t,u_s,u_1)$ 的联合律存在条件密度，则

$$
p(u_s\mid\mathcal C,\mathcal O)=\iint p(u_s\mid u_1,u_t,\mathcal C,\mathcal O)\,p(u_1\mid u_t,\mathcal C,\mathcal O)\,p(u_t\mid\mathcal C,\mathcal O)\,du_1du_t.\tag{9}
$$

**证明：** 令 $E=\mathcal C\cap\mathcal O$ 表示同时满足物理与观测约束的联合事件。从边缘密度 $p(u_s\mid E)$ 出发，它可通过对联合密度 $p(u_s,u_1,u_t\mid E)$ 关于 $u_1,u_t$ 积分得到：

$$
p(u_s\mid E)=\iint p(u_s,u_1,u_t\mid E)\,du_1du_t.\tag{10}
$$

由概率链式法则，联合密度可分解为

$$
p(u_s,u_1,u_t\mid E)=p(u_s\mid u_1,u_t,E)\,p(u_1\mid u_t,E)\,p(u_t\mid E).\tag{11}
$$

把该分解代回积分即得

$$
p(u_s\mid E)=\iint p(u_s\mid u_1,u_t,E)\,p(u_1\mid u_t,E)\,p(u_t\mid E)\,du_1du_t.\tag{12}
$$

把 $E$ 替换为 $\mathcal C,\mathcal O$ 即完成证明。

该分解表明，更晚同伦时刻的后验样本可通过层次化条件采样获得：给定 $u_t\sim p(u_t\mid\mathcal C,\mathcal O)$，先从 $p(u_1\mid u_t,\mathcal C,\mathcal O)$ 抽取终端实现 $u_1$，再从 $p(u_s\mid u_t,u_1,\mathcal C,\mathcal O)$ 抽取中间状态 $u_s$。实践中这些条件分布不可解，我们引入局部近似，导出两步算法：第一步是在终端时刻强制约束的**局部 MAP 更新**，第二步是恢复与所学流兼容性的**插值步**。

**终端更新作为局部 MAP 步。** 从给定当前状态与约束时终端状态的条件分布出发：

$$
p(u_1\mid u_t,\mathcal C,\mathcal O)\propto p(u_1\mid u_t)p(\mathcal O\mid u_1)\mathbf 1_{\mathcal C}(u_1),\tag{13}
$$

其中用到物理约束 $\mathcal C$ 只依赖 $u_1$。所学流诱导确定性映射 $u_t\mapsto u_1$，故精确条件律 $p(u_1\mid u_t)$ 是集中在该流轨迹上的奇异 Dirac 测度，不能作为可处理密度获得。沿用扩散逆求解器的常见做法 [3, 21]，我们引入局部随机性，用中心在单步流预测处的高斯近似该转移：

$$
p(u_1\mid u_t)\approx\mathcal N\left(\hat u_1(u_t),\sigma_t^2\mathbf I\right)\propto\exp\left(-\frac{1}{2\sigma_t^2}\left\|u_1-\hat u_1(u_t)\right\|_2^2\right),\tag{14}
$$

其中

$$
\hat u_1(u_t)=u_t+(1-t)v_\theta(u_t,t)\tag{15}
$$

是流的前向 Euler 预测，$\sigma_t>0$ 为表示单步流预测不确定性的标量参数。

似然项 $p(\mathcal O\mid u_1)$ 直接来自（2）的高斯噪声假设；略去常数因子为

$$
p(\mathcal O\mid u_1)\propto\exp\left(-\frac{1}{2\sigma_{\mathrm{obs}}^2}\left\|H[u_1]-\mathbf y\right\|_2^2\right).\tag{16}
$$

把高斯转移近似与观测似然结合，得到负对数条件后验的如下近似：

$$
-\log p(u_1\mid u_t,\mathcal O,\mathcal C)\approx\frac{1}{2\sigma_t^2}\left\|u_1-\hat u_1(u_t)\right\|_2^2+\frac{1}{2\sigma_{\mathrm{obs}}^2}\left\|H[u_1]-\mathbf y\right\|_2^2+\text{const},\tag{17}
$$

约束为 $u_1\in\mathcal C$。因此终端更新可解释为近似条件模型的局部 MAP 估计。算法形式上，我们把方差之比吸收为单一权重 $\lambda\propto\sigma_t^2/\sigma_{\mathrm{obs}}^2$，并求解近端问题

$$
u_1^\star\in\arg\min_{u\in\mathcal C}\left\{\left\|u-\hat u_1(u_t)\right\|_2^2+\lambda\left\|H[u]-\mathbf y\right\|_2^2\right\},\tag{18}
$$

它在信任流预测与信任数据之间取得平衡。实现细节与 $\lambda$ 的选择留到第 4.3 节。

**插值步与流的兼容性。** 第二步针对条件分布

$$
p(u_s\mid u_t,u_1,\mathcal C,\mathcal O).\tag{19}
$$

同伦变量 $t$ 由预训练模型的生成流定义，该流独立于物理与观测约束学习。一旦终端状态 $u_1$ 被更新以满足约束，$t$ 与 1 之间的中间状态就应遵循原流的训练桥。在流匹配训练目标下，这些桥是参考样本 $\varepsilon\sim\mu_0$ 与终端场 $u_1$ 之间的线性最优输运路径：

$$
u_\tau=(1-\tau)\varepsilon+\tau u_1,\qquad\tau\in[0,1].\tag{20}
$$

若 $u_t$ 与 $u_1$ 位于某个 $\varepsilon$ 对应的同一桥上，则时刻 $s$（$s>t$）的中间状态精确为

$$
u_s=(1-s)\varepsilon+su_1.\tag{21}
$$

然而终端优化后，更新后的 $u_1^\star$ 不再与 $u_t$ 位于同一桥流形。为恢复与所学流的兼容性，我们改为新抽取参考样本 $\varepsilon\sim\mu_0$，在 $\varepsilon$ 与 $u_1^\star$ 之间构造新桥。对离散时间调度 $\{t_n\}_{n=0}^N$，这给出插值更新

$$
u_{t_{n+1}}=(1-t_{n+1})\varepsilon+t_{n+1}u_1^\star.\tag{22}
$$

我们指出，扩散逆求解器中已使用类似插值策略来保持与模型流形的接近性 [10, 48]。

### 4.3 ProFlow 的算法框架

现在引入 ProFlow，它把终端 MAP 更新与插值步结合为两阶段近端引导框架：在每个同伦时刻，先通过受约束的近端优化精化终端状态以强制物理与数据一致性，再沿流一致桥插值回中间时刻。整体流程汇总于算法 1。

**终端优化步。** 在同伦时刻 $t_n$，给定当前状态 $u_{t_n}$，用速度场 $v_\theta$ 形成单步终端预测

$$
\hat u_1=u_{t_n}+(1-t_n)v_\theta\left(u_{t_n},t_n\right).\tag{23}
$$

该插入估计作为受约束近端问题的锚点：

$$
u_1\in\arg\min_{u\in\mathcal C}\left\{\left\|u-\hat u_1\right\|_2^2+\lambda\left\|H[u]-\mathbf y\right\|_2^2\right\},\tag{24}
$$

其中 $H$ 为测量算子，$\mathbf y$ 为观测域 $X_O\subseteq\Omega$ 上的观测值。第一项让 $u$ 接近流预测，第二项强制数据保真，约束 $u\in\mathcal C$ 施加 $\mathcal L(u)=0$。参数 $\lambda$ 控制数据失配的相对权重；它可解释为概率模型中方差比 $\sigma_t^2/\sigma_{\mathrm{obs}}^2$ 的代理，但实践中我们把它当作可调超参数。对生成噪声注入，我们采用 $\Pi$GDM [42] 的调度 $\sigma_t=\frac{1-t}{\sqrt{t^2+(1-t)^2}}$，并假设固定观测噪声水平 $\sigma_{\mathrm{obs}}=0.05$。

> **注 4.2（归类为硬约束方法）.** 我们把 ProFlow 归类为硬约束方法，因为（18）的表述通过受约束最小化中隐含的指示函数把搜索空间显式限制到 $\mathcal C$。实践中该子问题用受约束近端优化器数值求解，即物理一致性在内层优化器收敛容差内满足。这与软引导方法 [4, 21] 形成对比——后者在外层采样循环中加入残差惩罚而无投影机制。

**插值步。** 为使迭代点保持在学习流形附近，我们在新噪声实现与精化终端状态之间插值。给定 $u_1$ 与抽样 $\varepsilon\sim\mu_0$，置下一时刻 $t_{n+1}$ 的状态为

$$
u_{t_{n+1}}=(1-t_{n+1})\varepsilon+t_{n+1}u_1.\tag{25}
$$

该更新沿与流匹配训练过程一致的线性桥重新初始化下一状态。如此，速度场 $v_\theta(\cdot,t_{n+1})$ 的后续评估作用在保持接近所学模型流形的样本上。

**算法 1：近端流引导（ProFlow）**

要求：预训练 FFM 速度 $v_\theta$；测量算子 $H$；观测 $\mathbf y$；约束集 $\mathcal C=\{u:\mathcal L(u)=0\}$；调度 $0=t_0<\cdots<t_N=1$。

1. 从 $\mu_0$ 采样 $u_{t_0}$。
2. 对 $n=0$ 到 $N-1$：
3.   $\hat u_1\leftarrow u_{t_n}+(1-t_n)v_\theta(u_{t_n},t_n)$。
4.   执行终端优化：

$$
u_1\leftarrow\arg\min_{u\in\mathcal C}\left\{\left\|u-\hat u_1\right\|_2^2+\lambda\left\|H[u]-\mathbf y\right\|_2^2\right\}\tag{26}
$$

5.   采样 $\varepsilon\sim\mu_0$。
6.   $u_{t_{n+1}}\leftarrow(1-t_{n+1})\varepsilon+t_{n+1}u_1$。
7. 结束循环。
8. 返回 $u_{t_N}$。

## 5 实验

### 5.1 PDE 族与实验设置

我们考虑三类椭圆型偏微分方程族与一个时间相关守恒律。椭圆基准为有界域 $\Omega\subset\mathbb R^2$ 上带 Dirichlet 边界条件与异质系数的 Poisson、Helmholtz 与 Darcy 方程，其一般形式可写为

$$
\begin{cases}-\nabla\cdot(a(\mathbf x)\nabla u(\mathbf x))=f(\mathbf x),&\text{在 }\Omega\text{ 内},\\u(\mathbf x)=0,&\text{在 }\partial\Omega\text{ 上},\end{cases}\tag{27}
$$

用于 Poisson 与 Darcy 流（Darcy 设定中 $a$ 解释为扩散率或渗透率场），以及

$$
\begin{cases}-\Delta u(\mathbf x)+\kappa u(\mathbf x)=f(\mathbf x),&\text{在 }\Omega\text{ 内},\\u(\mathbf x)=0,&\text{在 }\partial\Omega\text{ 上},\end{cases}\tag{28}
$$

用于 Helmholtz，其中 $\kappa>0$ 为常数反应系数。时间相关基准使用一维粘性 Burgers 方程，在有界域 $\Omega\subset\mathbb R$ 上带周期边界条件：

$$
\begin{cases}\partial_tu+u\partial_xu-\nu\partial_x^2u=0,&(t,x)\in(0,T]\times\Omega,\\u(0,x)=u_0(x),&x\in\Omega.\end{cases}\tag{29}
$$

这里粘度 $\nu>0$。如注 4.1 所述，我们把该问题视为时空域 $[0,T]\times\Omega$ 上的全局采样任务，目标变量表示受演化约束的整个时空轨迹。

对椭圆问题，我们使用在 $128\times128$ 网格上离散的成对系数场与解场 $(a,u)$；所有椭圆数据集来自 Fourier 神经算子（FNO）[30] 与 DiffusionPDE [21] 的公开版本。对 Burgers 方程，沿用 DiffusionPDE [21] 设置，在规则时空网格上表示时空场。

**生成先验。** 我们采用函数流匹配（FFM）[25] 作为生成先验。对每个 PDE 族，仅用完整场在成对训练数据 $(a,u)$ 上训练一个单独的 FFM 模型，不访问测试目标、观测掩码或逆问题配置；训练后 FFM 先验被冻结并用于所有下游采样任务。预训练 FFM 的架构细节见附录 A。

**基线。** 我们与四个代表性生成采样基线比较（高层比较见表 1，实现细节见附录 B）：
- **FFM** [25]：标准函数流匹配先验，不加任何采样时条件地从学习分布生成样本，作为无约束生成性能的参照；
- **ECI** [10]：面向硬约束生成的无梯度框架，采用三阶段迭代：(i) 外推步，基于当前状态估计终端状态；(ii) 修正步，替换部分状态以严格强制观测约束；(iii) 插值步，把修正状态映射回中间时间 $t$ 以与生成概率路径对齐；但因其依赖几何投影，缺乏在修正期间确保物理一致性的机制；
- **DiffusionPDE** [21]：软引导方法，使用基于梯度的引导，注入由 PDE 残差与数据保真损失关于当前状态估计的梯度计算出的修正项；这使轨迹趋向物理可行区域，但与投影方法不同，不保证严格满足约束；
- **D-Flow** [4]：把采样问题转换为初始噪声空间上的优化；与在每个去噪步做局部引导的 DiffusionPDE 不同，D-Flow 是软引导框架，通过对 ODE 求解器微分对源分布 $u_0$ 做全局优化；流的微分同胚隐式正则化使解保持在数据流形附近，但对整个积分轨迹反传梯度导致显著内存消耗与采样时间延长；
- **PCFM** [48]：可视为 ECI [10] 的推广，可强制任意非线性约束；其运行方式为反复沿所学流射击到终端时刻、应用单次 Gauss–Newton 更新使终端状态更接近约束流形，再通过最优输运位移插值把该修正输运回当前状态；但把 PDE 残差纳入 Gauss–Newton 步因 Jacobian 计算而计算代价过高，且基于投影的更新只关注约束满足、不保证遵循生成先验。

**评价指标。** 沿用先前工作 [10, 21]，我们报告量化重建精度、分布统计与物理一致性的若干指标：
- **重建误差（RE）**：重建场与真值场之间的均方差异，是整体观测一致性与重建质量的主要指标；联合设定中 RE 在解场与系数场上计算；
- **均值 MSE（MMSE）**：样本均值相对真值场的均方误差，反映估计后验均值（分布一阶矩）的精度；
- **标准差 MSE（SMSE）**：样本标准差的均方误差，量化方法对预测不确定性与后验真实分布统计的刻画程度；
- **PDE 误差（PDE Err.）**：由微分算子编码的控制方程违背程度，直接量化生成样本的物理一致性；Poisson、Helmholtz 与 Burgers 方程的 PDE 误差按 [53] 计算，Darcy 流按 [21] 计算。

### 5.2 椭圆型 PDE 结果

我们先研究三类椭圆 PDE：Poisson、Helmholtz 与 Darcy。每种设定下分析三种不同观测区制的性能，以代表数据约束 PDE 求解的标准挑战：(i) **正问题**，仅观测系数场 $a$，目标是推断相应解场 $u$；(ii) **逆问题**，仅可得解场 $u$，目标是恢复系数场 $a$；(iii) **联合稀疏重建**，系数场与解场 $(a,u)$ 均被部分观测，目标是同时重建两个场。

**正问题与逆问题。** 正问题设定中观测完整系数场 $a$ 并重建解场 $u$。如表 2 与图 2 所示，ProFlow 在三个椭圆 PDE 族上取得最佳重建质量：对 Poisson 方程，ProFlow 取得最低 RE、MMSE 与 SMSE，RE 相对次优方法（D-Flow）约降低一半、相对 ECI 降低近一个数量级；Helmholtz 与 Darcy 正问题类似——ProFlow 一致给出最小 RE、MMSE 与 SMSE，而其他方法重建误差明显更大（例如 DiffusionPDE 在 Helmholtz 上差两到三个数量级）。就 PDE 残差而言，ProFlow 在 Poisson 与 Helmholtz 上最低、在 Darcy 上保持竞争力（各方法残差同数量级）。这些结果表明正问题设定下 ProFlow 提供准确的重建与分布统计，且解紧密满足控制方程。

逆问题设定中观测解场 $u$ 并恢复系数场 $a$。如表 2 所报告：对 Poisson，D-Flow 取得最小 RE 与 MMSE，而 ProFlow 取得最佳 SMSE 与最低 PDE 残差，故 D-Flow 在系数点估计上略准，而 ProFlow 提供更准确的分布统计与更接近的 PDE；对 Helmholtz 逆问题，ProFlow 与 D-Flow 明显优于其他基线——ECI 与 DiffusionPDE 误差极大，ProFlow 给出最佳 SMSE、D-Flow 取得最低 RE、MMSE 与 PDE 残差，说明 D-Flow 尤其擅长缩小该更具挑战性算子上的重建误差，而 ProFlow 给出最稳定的分布估计；Darcy 逆问题上 ProFlow 取得最低 RE、MMSE 与 SMSE，并与 ECI 同享最佳 PDE 残差（D-Flow 紧随其后）。总体而言，在三个椭圆 PDE 上 ProFlow 在多数指标上持平或超越竞争方法。

**联合稀疏重建。** 该设定假设系数场 $a$ 与解场 $u$ 都只被部分观测（实验中揭示 50% 空间网格点），目标是同时重建完整对 $(a,u)$。表 3 的定量结果表明 ProFlow 在三个椭圆 PDE 族上提供最均衡的性能：对 Poisson，ProFlow 取得最低重建误差与 MMSE（RE 为 $6.93\times10^{-2}$，而 DiffusionPDE 为 $7.00\times10^{-2}$，ECI 与 D-Flow 误差大得多），并取得最小 PDE 残差（约 $1.76\times10^{-8}$，而 ECI 残差大数个数量级）；ECI 取得最佳 SMSE、ProFlow 紧随第二，故 ProFlow 以方差误差的适度增加换取显著更好的重建精度与物理一致性。对 Helmholtz，ProFlow 与 DiffusionPDE 是联合设定中仅有的两种取得低重建误差的方法：ProFlow 取得最小 RE 与 PDE 残差，DiffusionPDE 取得最佳 MMSE 但 RE 略高；ECI 再次给出最低 SMSE 却以极大的重建与 PDE 误差为代价。对 Darcy 流，ProFlow 明显优于基线——取得最低 RE、MMSE、SMSE 与 PDE 残差，RE 约为竞争方法的四到六分之一，PDE 误差相对 DiffusionPDE 降低两倍以上。综合来看，这些结果表明 ProFlow 能在严重欠采样下实现准确且物理一致的重建，并在多数指标上持平或改进最佳竞争方法，同时保持较小的 PDE 残差。

### 5.3 带初始条件与边界条件的可控生成

接下来评估 ProFlow 在给定初始或边界条件下对时间相关 PDE 解的可控生成。我们聚焦一维粘性 Burgers 方程，给定粘度 $\nu>0$ 与规定的初始、边界数据，目标是从部分信息生成完整时空轨迹 $u_{0:T}$。考虑两种配置：(i) **初始条件（IC）配置**，已知初始状态 $u_0$，并提供较晚时刻 $u(t,\cdot)$ 的稀疏空间观测，任务是重建与 Burgers 动力学及观测值一致的完整时空演化；(ii) **边界条件（BC）配置**，给定边界值的时间轨迹以及稀疏内部观测，任务同样是重建完整轨迹。

表 4 汇总 BC 与 IC 配置的定量结果，图 3 可视化各方法的重建轨迹。BC 配置下 ProFlow 取得最低 RE、MMSE 与 SMSE：相对次优方法 DiffusionPDE，重建误差降低近 40%，相对 ECI 与 D-Flow 降低一个数量级；物理一致性方面，ProFlow 的 PDE 误差与 D-Flow、ECI 相当，显著低于 DiffusionPDE 与 PCFM——表明 ProFlow 恢复的轨迹既高度准确又物理有效。IC 配置下 ProFlow 同样表现强劲，取得最低 MMSE，RE 与 SMSE 排名第二、紧随 D-Flow；其 PDE 残差与 DiffusionPDE 并列，与最佳 D-Flow 相当，显著优于 ECI。如图 3 定性所示，ProFlow 有效利用部分时间信息（无论作为初始状态还是边界轨迹）生成锐利且物理一致的解，而其他基线可能出现过度平滑或伪影。

### 5.4 通过稀疏时间观测恢复解

我们采用 DiffusionPDE [21] 应用于一维动态 Burgers 方程的实验设置：假设仅能访问区间 $[0,T]$ 内 5 个随机采样时刻的空间观测，目标是重建完整时空解 $u_{0:T}$。表 5 表明 ProFlow 优于所有基线，在所报告每项指标上取得最低误差：具体地，本方法取得 $1.33\times10^{-3}$ 的重建误差与 $2.77\times10^{-4}$ 的 PDE 残差，相对最强基线 D-Flow 约优 10%；值得注意的是，ECI、PCFM 等基于投影的方法难以跨越较大时间间隔，导致分布统计显著偏差。如图 4 所示，该定量优势转化为对激波传播动力学的锐利重建——ProFlow 避免了基线方法出现的模糊或虚假振荡。

## 6 结论与未来工作

本文提出 ProFlow——一个使用预训练函数流匹配先验进行零样本物理一致采样的有原则框架。受现有采样时方法常在严格约束满足与生成保真度之间难以平衡的局限所启发，ProFlow 把采样过程表述为一系列受约束后验更新：通过交替执行**终端近端优化步**（强制物理与观测一致性）与**插值步**（恢复与所学流概率路径的兼容性），本方法提供在解流形与数据流形交集上导航的严格机制。

我们给出该过程的贝叶斯解释——将其视为局部 MAP 估计方案，并在包括 Poisson、Helmholtz、Darcy 与粘性 Burgers 方程的正问题、逆问题与联合重建任务等多样基准上验证其性能。数值结果表明 ProFlow 一致优于最先进的扩散与流基线，在取得更优重建精度与更低 PDE 残差的同时保持准确的分布统计。

未来工作仍有若干方向。第一，尽管 ProFlow 避免重训练，但每个采样步求解近端优化问题的计算成本不可忽视；未来可研究加速分裂方案以加快终端精化步。第二，把该框架扩展到湍流或混沌系统仍是重要挑战；将 ProFlow 扩展到这些区制可能需要整合潜空间流匹配模型或多分辨率策略以应对增加的空间复杂度。最后，虽然本方法具有局部贝叶斯解释，但为耦合的近端—流迭代建立全局收敛保证仍是有价值的理论开放问题。应对这些挑战将进一步推进生成模型成为可靠、严谨的科学发现工具的能力。

## 图注

**图 1（原 PDF 第 3 页）：** ProFlow 的概念示意。算法交替进行：(i) **终端优化步**，通过求解近端优化问题把模型预测的解 $\hat u_1$ 投影到物理一致集与观测一致集上；(ii) **插值步**，把精化后的解 $u_1$ 与重新采样的噪声 $\varepsilon$ 线性混合，构造下一状态 $u_{t_{n+1}}$，从而遵循流匹配概率路径。图中给出两式：$\hat u_1=u_{t_n}+(1-t_n)v_\theta(u_{t_n},t_n)$ 与 $u_{t_{n+1}}=(1-t_{n+1})\varepsilon+t_{n+1}u_1$；对 $n=0,1,\ldots$ 重复。

**图 2（原 PDF 第 13 页）：** Darcy 方程正问题的可视化比较。最左列为输入系数场；其后各列把真值解与 ProFlow 及基线（ECI、DiffusionPDE、D-Flow、PCFM）的预测对比。ProFlow 以高视觉保真度预测解场，捕捉到比基线更接近真值的细节。

**图 3（原 PDF 第 17 页）：** Burgers 方程生成解的可视化比较。上部分为初始条件（IC）配置，下部分为边界条件（BC）配置；最左列可视化为模型提供的稀疏输入。由于给定 IC/BC 数据不能唯一约束 PDE 解，重建是欠定的；为刻画该不确定性，每种方法通过改变初始随机噪声生成四个不同样本。PCFM 等基线表现出模式坍缩（产生相同样本）或伪影，而 ProFlow 生成多样、物理合理且与控制 PDE 一致的轨迹。

**图 4（原 PDF 第 18 页）：** Burgers 方程稀疏时间重建的可视化比较。最左列可视化为稀疏输入数据（仅 5 个随机采样时刻的观测）；其后各列对比真值时空解与 ProFlow 及基线（ECI、DiffusionPDE、D-Flow、PCFM）的重建。ProFlow 能准确插值观测时刻之间的激波传播动力学，而基线在未观测区间出现明显模糊或虚假振荡。

## 表注（正文表格逐格转录）

### 表 1：含物理或观测约束的生成方法比较（原 PDF 第 6 页）

各列含义：零样本（zero-shot，无需重训练的采样）、观测/物理（能否强制相应约束）、先验（是否保持预训练生成流形统计）、强制类型（约束处理机制）。

| 方法 | 零样本 | 观测 | 物理 | 先验 | 强制类型 |
|---|---|---|---|---|---|
| FFM [25] | × | × | × | ✓ | N/A |
| DiffusionPDE [21] | ✓ | ✓ | ✓ | ✓ | 软（梯度引导） |
| D-Flow [4] | ✓ | ✓ | ✓ | ✓ | 软（初始噪声优化） |
| ECI [10] | ✓ | ✓ | × | × | 硬（线性投影） |
| PCFM [48] | ✓ | ✓ | ✓ | × | 硬（Gauss–Newton 投影） |
| ProFlow（本文） | ✓ | ✓ | ✓ | ✓ | 硬（近端优化） |

### 表 2：Poisson、Helmholtz、Darcy 方程的正问题与逆问题结果（原 PDF 第 14 页）

正问题中系数场 $a$ 完全观测、任务为推断相应解场 $u$；逆问题中可得 $u$、任务为恢复 $a$。指标为重建误差（RE）、均值 MSE（MMSE）、标准差 MSE（SMSE）与 PDE 误差（PDE Err.），在 500 个样本上平均；越低越好；每行最优方法加粗、次优加下划线；PCFM 在数值发散的配置中以"–"省略（尽管已广泛调参）。

| PDE | 设定 | 指标 | ProFlow（本文） | ECI [10] | DiffusionPDE [21] | D-Flow [4] | PCFM [48] |
|---|---|---|---|---|---|---|---|
| Poisson | 正问题 | RE（×10⁻²） | **0.67** | 5.05 | 1.60 | 1.24 | 2.18 |
| | | MMSE（×10⁻³） | **3.07** | 9.39 | 7.50 | 4.08 | 20.6 |
| | | SMSE（×10⁻³） | **1.58** | 22.0 | 8.07 | 8.97 | 5.44 |
| | | PDE Err.（×10⁻⁹） | **1.17** | 6.60 | 8.79 | 6.97 | 2.62 |
| | 逆问题 | RE（×10⁻²） | 3.40 | 5.25 | 6.32 | **2.96** | – |
| | | MMSE（×10⁻²） | 1.58 | 2.31 | 2.02 | **0.14** | – |
| | | SMSE（×10⁻⁴） | **2.39** | 6.84 | 33.6 | 49.4 | – |
| | | PDE Err.（×10⁻⁶） | **1.39** | 1.90 | 6.92 | 1.52 | – |
| Helmholtz | 正问题 | RE（×10⁻³） | **2.46** | 8.53 | 130 | 19.3 | 244 |
| | | MMSE（×10⁻⁴） | **6.55** | 67.0 | 1.03×10³ | 33.7 | 22.5 |
| | | SMSE（×10⁻³） | **1.00** | 8.71 | 7.07 | 8.69 | 7.05 |
| | | PDE Err.（×10⁻⁹） | **5.95** | 6.45 | 9.19 | 6.89 | 8.67 |
| | 逆问题 | RE（×10⁻¹） | 1.84 | 5.70×10³ | 3.63 | **1.64** | 9.96 |
| | | MMSE（×10⁻²） | 2.74 | 6.30×10³ | 3.01 | **0.40** | 34.2 |
| | | SMSE（×10⁻²） | **2.06** | 2.16×10⁴ | 2.36 | 2.36 | 87.2 |
| | | PDE Err.（×10⁻⁶） | 7.82 | 150 | 10.8 | **4.37** | 17.8 |
| Darcy | 正问题 | RE（×10⁻³） | **3.10** | 5.72 | 9.42 | 6.04 | 3.13 |
| | | MMSE（×10⁻³） | **1.41** | 2.11 | 4.82 | 10.83 | 2.26 |
| | | SMSE（×10⁻³） | **1.07** | 2.07 | 2.08 | 8.37 | 5.23 |
| | | PDE Err.（×10⁻⁷） | 3.03 | 3.07 | 2.78 | 2.46 | **1.16** |
| | 逆问题 | RE（×10⁻¹） | **2.41** | 3.23 | 3.92 | 4.32 | 10.7 |
| | | MMSE（×10⁻²） | **1.38** | 2.03 | 5.07 | 2.51 | 79.7 |
| | | SMSE（×10⁻³） | **3.56** | 7.19 | 5.19 | 3.70 | 183 |
| | | PDE Err.（×10⁻⁵） | **1.17** | **1.17** | 2.84 | 1.44 | 3.26 |

### 表 3：Poisson、Helmholtz、Darcy 方程联合稀疏重建结果（原 PDF 第 15 页）

系数场 $a$ 与解场 $u$ 均由两者的稀疏观测重建（实验中揭示 $a$ 与 $u$ 各 50% 的空间网格点）；指标同上，500 样本平均；每行最优加粗、次优加下划线；PCFM 在数值发散配置以"–"省略。

| PDE | 指标 | ProFlow（本文） | ECI [10] | DiffusionPDE [21] | D-Flow [4] | PCFM [48] |
|---|---|---|---|---|---|---|
| Poisson | RE（×10⁻²） | **6.93** | 14.6 | 7.00 | 73.1 | – |
| | MMSE（×10⁻²） | **1.19** | 2.20 | 1.26 | 12.8 | – |
| | SMSE（×10⁻¹） | 1.61 | **0.84** | 1.62 | 8.26 | – |
| | PDE Err.（×10⁻⁸） | **1.76** | 6.25×10³ | 5.48 | 9.03 | – |
| Helmholtz | RE（×10⁻²） | **5.94** | 12.6 | 5.97 | 95.2 | 88.1 |
| | MMSE（×10⁻³） | 6.01 | 13.5 | **5.31** | 188 | 332 |
| | SMSE（×10⁻¹） | 1.42 | **0.76** | 1.42 | 11.5 | 3.58 |
| | PDE Err.（×10⁻⁸） | **7.32** | 5.84×10³ | 10.5 | 46.1 | 8.39×10³ |
| Darcy | RE（×10⁻²） | **5.34** | 30.1 | 24.1 | 46.3 | 22.1 |
| | MMSE（×10⁻²） | **1.61** | 6.47 | 6.69 | 14.6 | 13.4 |
| | SMSE（×10⁻³） | **4.92** | 63.6 | 57.7 | 11.3 | 94.3 |
| | PDE Err.（×10⁻⁵） | **2.74** | 55.7 | 6.83 | 10.7 | 28.0 |

### 表 4：边界条件（BC）与初始条件（IC）配置下的 Burgers 重建（原 PDF 第 16 页）

BC 配置给定随时间的边界观测，IC 配置给定系统初始快照；指标同上；每行最优加粗、次优加下划线；PCFM 在数值发散配置以"–"省略。

| 条件 | 指标 | ProFlow（本文） | ECI [10] | DiffusionPDE [21] | D-Flow [4] | PCFM [48] |
|---|---|---|---|---|---|---|
| IC | RE（×10⁻²） | 1.71 | 3.68 | 5.80 | **1.40** | – |
| | MMSE（×10⁻²） | **1.95** | 3.36 | 2.44 | 2.46 | – |
| | SMSE（×10⁻³） | 9.87 | 13.12 | 33.75 | **8.82** | – |
| | PDE Err.（×10⁻⁴） | 1.67 | 2.19 | 1.67 | **1.62** | – |
| BC | RE（×10⁻³） | **0.32** | 4.52 | 0.53 | 3.15 | 178.99 |
| | MMSE（×10⁻⁴） | **2.90** | 26.3 | 5.14 | 42.84 | 154 |
| | SMSE（×10⁻⁴） | **4.30** | 44.0 | 11.89 | 198.03 | 49.5 |
| | PDE Err.（×10⁻⁴） | 3.15 | **2.44** | 58.52 | 2.50 | 12.4 |

### 表 5：稀疏时间观测下的 Burgers 轨迹重建（原 PDF 第 16 页）

方法须在仅 5 个随机时间戳的空间测量下恢复完整时空解 $u_{0:T}$；指标同上，每行最优加粗、次优加下划线。

| 条件 | 指标 | ProFlow（本文） | ECI [10] | DiffusionPDE [21] | D-Flow [4] | PCFM [48] |
|---|---|---|---|---|---|---|
| 稀疏观测 | RE（×10⁻³） | **1.33** | 5.04 | 1.65 | 1.53 | 30.5 |
| | MMSE（×10⁻⁴） | **1.73** | 7.50 | 3.55 | 2.85 | 232 |
| | SMSE（×10⁻⁴） | **3.80** | 14.82 | 7.84 | 5.61 | 28.8 |
| | PDE Err.（×10⁻⁴） | **2.77** | 3.14 | 4.04 | 3.06 | 5.38 |

## 附录 A—C：结构化译文

以下按原文附录顺序给出实现细节与推导要点。原文附录 A—C 约 5 页、以实现配置与逐式推导为主，本页对附录采用**结构化译文**（保留全部表 1—5 与关键公式，推导以要点呈现），此为与"全文"口径的已知差异，见页尾状态段。

### 附录 A：预训练 FFM 的实现细节

**网络架构。** 对所有 PDE 基准，我们采用 Fourier 神经算子（FNO）[30] 作为速度场估计器 $v_\theta(u_t,t)$，架构配置沿用 ECI [10]：FNO 主干含 $L=4$ 个 Fourier 层、隐藏宽度 $d_h=64$；网络先把输入通道提升到宽度 $d_{\text{lift}}=256$ 的高维特征空间，再堆叠若干谱卷积块（每个空间方向保留固定数量的 Fourier 模态），最后投影回物理通道维。该设计给出全局表达力强且平移等变的架构，适合学习 PDE 解算子 [30]。

**输入表示。** 模型输入为含噪状态 $u_t$，并与时间嵌入、空间位置编码拼接；代码中 $u_t\in\mathbb R^{B\times H\times W\times C}$ 先转为通道优先格式，再附加额外通道。时间变量 $t$ 表示为标量或逐批向量，并用 Gaussian Fourier 特征映射为维数 $d_{\text{emb}}=32$ 的时间嵌入；该嵌入被广播到空间网格，使每个空间位置获得相同时间特征。空间坐标归一化到 $[0,1]^d$ 并与 $u_t$ 在同一网格上离散；坐标网格沿通道维堆叠。

**训练。** 每个 PDE 基准训练 10,000 次迭代（对应 10,000 次小批量梯度更新）。

### 附录 B：基线方法的实现细节

我们给出各基线的具体配置。必要时把各方法适配进 ProFlow 框架，纳入其各自的物理约束机制，以保证忠实实现与可比性能。除特别说明外，所有实验采用显式 Euler 积分器、100 步，以确保一致评价。

**ECI 采样。** 遵循 ECI [10] 流程，在整个采样轨迹上迭代执行"外推—修正—插值"更新：每步先计算单步终端预测（类似扩散中的 Tweedie 估计）$\hat u_1=u_t+(1-t)v_\theta(u_t,t)$，再用修正算子 $P_C(\cdot)$ 通过观测掩码把该预测投影回约束流形，所得更新按

$$
u_{t+\Delta t}=(t+\Delta t)P_C(\hat u_1)+(1-t-\Delta t)\left(u_t+v_\theta(u_t,t)\Delta t\right)\tag{B.1}
$$

把修正估计映射回中间时刻 $t-\Delta t$。为在所有 PDE 上保持配置一致，每个 Euler 步应用 $n_{\text{mix}}$ 次 ECI 混合（mixing）迭代；单次混合迭代复用同一时间索引，反复应用（B.1）的"外推—修正—插值"更新，把修正场反馈进流 ODE；这种递归应用促进受约束区域与未受约束区域间的信息交换，经验上减少生成轨迹中的伪影 [10]。超参数 $n_{\text{mix}}$ 因而控制每步约束传播的强度，所有实验取 $n_{\text{mix}}=5$。我们还通过重采样插值步所用的高斯先验噪声来控制 ECI 采样的随机性，沿用 Cheng et al. [10] 的重采样策略。

**DiffusionPDE。** DiffusionPDE [21] 用观测一致性与 PDE 残差最小化导出的软引导项增强每个采样步。设 $u_t$ 为演化的 PDE 状态、$v_\theta(u_t,t)$ 为预训练流速度场，则每步按

$$
u_{t+\Delta t}=u_t+v_\theta(u_t,t)\Delta t-\alpha_t\nabla_{u_t}\mathcal L_{\text{obs}}(u_t)-\beta_t\nabla_{u_t}\mathcal L_{\text{PDE}}(u_t)\tag{B.2}
$$

更新，其中第一项为显式 Euler 步，后两项减去任务特定损失泛函的梯度；观测损失按观测一致性定义，PDE 损失由残差给出。

**D-Flow。** 把采样表述为对初始噪声 $u_0$ 的有限维优化问题，用 L-BFGS [33] 求解，取 $K=20$ 次迭代、学习率 0.1；每次 L-BFGS 迭代都需对流 ODE 做一次前向积分以评估目标并反传梯度（数值微分同胚正则化），共使用 $S$ 个 Euler 步离散化 $\Phi_\theta$。

**PCFM。** 反复沿所学流射击至终端时刻，再以单次 Gauss–Newton 更新把终端状态推向约束流形，并通过最优输运位移插值把修正输运回当前状态；其精化中罚参数 $\lambda$ 平衡与 OT 插值的接近性及约束残差，采用官方实现配置取 $\lambda=1.0$，用步长 0.01 的梯度更新、每个插值状态做 20 次精化迭代。

### 附录 C：ProFlow 的实现细节

ProFlow 对所学流 ODE 做标准 Euler 离散，并在每个时间步做受约束近端优化。每条轨迹从与目标 PDE 场空间分辨率匹配的高斯噪声 $u_0\sim\mathcal N(0,\mathbf I)$ 出发。在第 $i$ 步、当前状态 $u_t$（$t=i/N$）处，先查询预训练流模型得到单步终端预测

$$
\hat u_1=u_t+(1-t)v_\theta(u_t,t),\tag{C.1}
$$

并把它当作**近端锚点**：它对应模型在给定当前含噪状态时对 $t=1$ 处干净场的估计，作用与基于扩散的采样器中的后验均值预测器相同。给定 $\hat u_1$，ProFlow 在每个步求解一个小规模近端子问题：引入观测掩码 $m$ 与从训练集抽取的观测 $c$，在终端场上定义联合目标

$$
\mathcal L(u_1)=\left\|u_1-\hat u_1\right\|_2^2+\lambda_{\text{obs}}\left\|(u_1-c)\odot m\right\|_2^2+\lambda_{\text{pde}}\left\|\mathcal R(u_1)\right\|_2^2.\tag{C.2}
$$

默认配置对 Darcy 基准取 $\lambda_{\text{obs}}=80$、$\lambda_{\text{pde}}=10^{-3}$，其余 PDE 沿用相同结构并相应调整。经过 $K$ 次近端迭代后得到精化终端场 $\tilde u_1$，再定义下一状态 $u_{t'}$（$t'=t+\Delta t$）为（25）式所给的插值。终端近端子问题（C.2）在网格上离散后用拟牛顿类优化器求解，每次采样轨迹的终端精化步开销即为算法的主要额外计算成本。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、卷号与页码。

[1] G. Baldan, Q. Liu, A. Guardone, and N. Thuerey, Flow matching meets PDEs: A unified framework for physics-constrained generation, arXiv preprint arXiv:2506.08604, (2025).

[2] H. Bassi, Y. Zhu, S. Liang, J. Yin, C. C. Reeves, V. Vlček, and C. Yang, Learning nonlinear integral operators via recurrent neural networks and its application in solving integro-differential equations, Machine Learning with Applications, 15 (2024), p. 100524.

[3] J.-H. Bastek, W. Sun, and D. M. Kochmann, Physics-informed diffusion models, in International Conference on Learning Representations, 2025.

[4] H. Ben-Hamu, O. Puny, I. Gat, B. Karrer, U. Singer, and Y. Lipman, D-Flow: Differentiating through flows for controlled generation, in International Conference on Machine Learning, 2024.

[5] S. C. Brenner and L. R. Scott, The Mathematical Theory of Finite Element Methods, Springer, 2008.

[6] S. Cai, Z. Mao, Z. Wang, M. Yin, and G. E. Karniadakis, Physics-informed neural networks (PINNs) for fluid mechanics: A review, Acta Mechanica Sinica, 37 (2021), pp. 1727–1738.

[7] S. Cai, Z. Wang, S. Wang, P. Perdikaris, and G. E. Karniadakis, Physics-informed neural networks for heat transfer problems, Journal of Heat Transfer, 143 (2021), p. 060801.

[8] A. P. Calderón, On an inverse boundary value problem, Computational & Applied Mathematics, 25 (2006), pp. 133–138.

[9] R. T. Chen, Y. Rubanova, J. Bettencourt, and D. K. Duvenaud, Neural ordinary differential equations, Advances in Neural Information Processing Systems, (2018).

[10] C. Cheng, B. Han, D. C. Maddix, A. F. Ansari, A. Stuart, M. W. Mahoney, and B. Wang, Gradient-free generation for hard-constrained systems, in International Conference on Learning Representations, 2025.

[11] H. Chung, J. Kim, M. T. Mccann, M. L. Klasky, and J. C. Ye, Diffusion posterior sampling for general noisy inverse problems, in International Conference on Learning Representations, 2023.

[12] G. Corso, H. Stärk, B. Jing, R. Barzilay, and T. Jaakkola, DiffDock: Diffusion steps, twists, and turns for molecular docking, in International Conference on Learning Representations, 2023.

[13] P. Dhariwal and A. Nichol, Diffusion models beat GANs on image synthesis, Advances in Neural Information Processing Systems, (2021).

[14] H. Eivazi, M. Tahani, P. Schlatter, and R. Vinuesa, Physics-informed neural networks for solving Reynolds-averaged Navier–Stokes equations, Physics of Fluids, 34 (2022).

[15] P. Esser, S. Kulal, A. Blattmann, R. Entezari, J. Müller, H. Saini, Y. Levi, D. Lorenz, A. Sauer, F. Boesel, et al., Scaling rectified flow transformers for high-resolution image synthesis, in International Conference on Machine Learning, 2024.

[16] G. Evensen, Data Assimilation: The Ensemble Kalman Filter, Springer, 2009.

[17] R. Eymard, T. Gallouët, and R. Herbin, Finite volume methods, Handbook of Numerical Analysis, 7 (2000), pp. 713–1018.

[18] W. Gao, M. Li, and Q. Li, Terminally constrained flow-based generative models from an optimal control perspective, arXiv preprint arXiv:2601.09474, (2026).

[19] D. Gottlieb and S. A. Orszag, Numerical Analysis of Spectral Methods: Theory and Applications, SIAM, 1977.

[20] J. Ho, A. Jain, and P. Abbeel, Denoising diffusion probabilistic models, in Advances in Neural Information Processing Systems, 2020.

[21] J. Huang, G. Yang, Z. Wang, and J. J. Park, DiffusionPDE: Generative PDE-solving under partial observation, in Advances in Neural Information Processing Systems, 2024.

[22] V. Iakovlev, M. Heinonen, and H. Lähdesmäki, Learning continuous-time PDEs from sparse data with graph neural networks, in International Conference on Learning Representations, 2021.

[23] J. Jumper, R. Evans, A. Pritzel, T. Green, M. Figurnov, O. Ronneberger, K. Tunyasuvunakool, R. Bates, A. Žídek, A. Potapenko, et al., Highly accurate protein structure prediction with alphaFold, Nature, 596 (2021), pp. 583–589.

[24] J. P. Kaipio and E. Somersalo, Statistical and Computational Inverse Problems, Springer, 2005.

[25] G. Kerrigan, G. Migliorini, and P. Smyth, Functional flow matching, in International Conference on Artificial Intelligence and Statistics, 2024.

[26] W. Kong, Q. Tian, Z. Zhang, R. Min, Z. Dai, J. Zhou, J. Xiong, X. Li, B. Wu, J. Zhang, et al., HunyuanVideo: A systematic framework for large video generative models, arXiv preprint arXiv:2412.03603, (2024).

[27] D. Landry, C. Monteleoni, and A. Charantonis, Generating ensembles of spatially-coherent in-situ forecasts using flow matching, Quarterly Journal of the Royal Meteorological Society, (2025), p. e70055.

[28] R. J. LeVeque, Finite Difference Methods for Ordinary and Partial Differential Equations: Steady-State and Time-Dependent Problems, SIAM, 2007.

[29] Z. Li, D. Z. Huang, B. Liu, and A. Anandkumar, Fourier neural operator with learned deformations for PDEs on general geometries, Journal of Machine Learning Research, 24 (2023), pp. 1–26.

[30] Z. Li, N. Kovachki, K. Azizzadenesheli, B. Liu, K. Bhattacharya, A. Stuart, and A. Anandkumar, Fourier neural operator for parametric partial differential equations, in International Conference on Learning Representations, 2021.

[31] Z. Li, H. Zheng, N. Kovachki, D. Jin, H. Chen, B. Liu, K. Azizzadenesheli, and A. Anandkumar, Physics-informed neural operator for learning partial differential equations, ACM/IMS Journal of Data Science, 1 (2024), pp. 1–27.

[32] Y. Lipman, R. T. Chen, H. Ben-Hamu, M. Nickel, and M. Le, Flow matching for generative modeling, in International Conference on Learning Representations, 2023.

[33] D. C. Liu and J. Nocedal, On the limited memory BFGS method for large scale optimization, Mathematical Programming, 45 (1989), pp. 503–528.

[34] X. Liu, C. Gong, et al., Flow straight and fast: Learning to generate and transfer data with rectified flow, in International Conference on Learning Representations, 2023.

[35] D. Long, Z. Xu, Q. Yuan, Y. Yang, and S. Zhe, Invertible Fourier neural operators for tackling both forward and inverse problems, in International Conference on Artificial Intelligence and Statistics, 2025.

[36] L. Lu, P. Jin, G. Pang, Z. Zhang, and G. E. Karniadakis, Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators, Nature Machine Intelligence, 3 (2021), pp. 218–229.

[37] Z. Mao, A. D. Jagtap, and G. E. Karniadakis, Physics-informed neural networks for high-speed flows, Computer Methods in Applied Mechanics and Engineering, 360 (2020), p. 112789.

[38] S. Martin, A. Gagneux, P. Hagemann, and G. Steidl, PnP-Flow: Plug-and-play image restoration with flow matching, in International Conference on Learning Representations, 2025.

[39] J. Nam, S. Liu, G. Winter, K. Jun, S. Yang, and R. Gómez-Bombarelli, Flow matching for accelerated simulation of atomic transport in materials, arXiv preprint arXiv:2410.01464, (2024).

[40] M. Raissi, P. Perdikaris, and G. E. Karniadakis, Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations, Journal of Computational Physics, 378 (2019), pp. 686–707.

[41] R. C. Smith, Uncertainty Quantification: Theory, Implementation, and Applications, SIAM, 2024.

[42] J. Song, A. Vahdat, M. Mardani, and J. Kautz, Pseudoinverse-guided diffusion models for inverse problems, in International Conference on Learning Representations, 2023.

[43] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, Score-based generative modeling through stochastic differential equations, in International Conference on Learning Representations, 2021.

[44] A. Stuart, Inverse problems: A Bayesian perspective, Acta numerica, 19 (2010), pp. 451–559.

[45] A. Stuart and K. Zygalakis, Data assimilation: A Mathematical introduction, tech. rep., Oak Ridge National Lab. (ORNL), Oak Ridge, TN (United States), 2015.

[46] J. Sylvester and G. Uhlmann, A global uniqueness theorem for an inverse boundary value problem, Annals of Mathematics, (1987), pp. 153–169.

[47] A. Tarantola, Inverse Problem Theory and Methods for Model Parameter Estimation, SIAM, 2005.

[48] U. Utkarsh, P. Cai, A. Edelman, R. Gomez-Bombarelli, and C. V. Rackauckas, Physics-constrained flow matching: Sampling generative models with hard constraints, arXiv preprint arXiv:2506.04171, (2025).

[49] V. Utz and S. DiPaola, Climate implications of diffusion-based generative visual AI systems and their mass adoption, arXiv preprint arXiv:2505.18892, (2025).

[50] T. Wan, A. Wang, B. Ai, B. Wen, C. Mao, C.-W. Xie, D. Chen, F. Yu, H. Zhao, J. Yang, et al., WAN: Open and advanced large-scale video generative models, arXiv preprint arXiv:2503.20314, (2025).

[51] Z. Yu, M. Li, W. Zhang, and W. Gao, Tree reward-aligned search for TReASURe in masked diffusion language models, arXiv preprint arXiv:2509.23146, (2025).

[52] M. Yuan, P. Jin, N. Li, and Q. Li, PIRF: Physics-informed reward fine-tuning for diffusion models, arXiv preprint arXiv:2509.20570, (2025).

[53] Y. Zhang and D. Zou, Physics-informed distillation of diffusion models for PDE-constrained generation, arXiv preprint arXiv:2505.22391, (2025).

[54] Q. Zhao, D. B. Lindell, and G. Wetzstein, Learning to solve PDE-constrained inverse problems with graph networks, in ICML 2022 2nd AI for Science Workshop, 2022.

[55] Y. Zhu, J. Yin, C. C. Reeves, C. Yang, and V. Vlček, Predicting nonequilibrium Green's function dynamics and photoemission spectra via nonlinear integral operator learning, Machine Learning: Science and Technology, 6 (2025), p. 015027.

**本页范围与校对状态：** 本页依据 arXiv:2601.20227v1（cs.LG，2026-01-28，25 页）完成中文翻译：摘要、关键词、第 1—6 节（1 引言；2 相关工作 2.1—2.5；3 FFM 先验；4 方法 4.1—4.3 与算法 1；5 实验 5.1—5.4；6 结论与未来工作）、图 1—4 中文图注、**表 1—5 逐格转录**（表 1、2、3、4、5 全部按 PDF 原表转录，其中表 2、3、4、5 已用本地 PDF 第 14、15、16 页渲染图逐格核对一致）、附录 A—C 结构化译文、参考文献 [1]—[55] 英文原条目（按原编号）均按原文结构录入；编号公式 (1)—(29) 与附录式 (A.1)、(B.1)—(B.2)、(C.1)—(C.2) 按原文保留。**口径说明：** 正文为完整翻译；原文附录 A—C（约 5 页）为结构化译文（保留全部表格与关键公式，实现细节以要点呈现），此为与"全文"要求的已知差异，已在此明确披露。**逐句逐式终校未做**；图 1—4 的图像内容未数字化，只转录图注与正文关键结论；参考文献未联网核验 DOI、卷号与页码。原文疑点已就地加注：①表 2/3 中部分数值采用"×10⁻²/×10⁻³"等不同幂次的量纲，按原表逐格保留、未作统一换算；②表 2/3/4 中 PCFM 在数值发散配置以"–"省略，系原表说明（尽管已广泛调参）；③附录 B 的（B.1）（B.2）与本页编号一致，附录 C 的（C.1）（C.2）同；④原文附录 C 部分超参（如其余 PDE 的 $\lambda_{\text{obs}}$、$\lambda_{\text{pde}}$）正文未逐一列出，本页仅转录可见取值。原文为 arXiv 预印本（cs.LG），可作可公开全文登记。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
