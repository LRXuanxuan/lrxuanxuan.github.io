---
layout: page
title: "条件均值流：面向仿真推断的少步密度｜中文全文译文"
permalink: /papers/translations/2026-10-20-conditional-mean-flows-few-step-densities-for-simulation-based-inferen-2610-21657/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/93b1bdda4e6c5e02/) · [原文 arXiv](https://arxiv.org/abs/2610.21657) · [全部目录](/papers/catalog/)

# 条件均值流：面向仿真推断的少步密度

**原题：** Conditional Mean Flows: Few-Step Densities for Simulation-Based Inference  
**作者：** Jonas Arruda、Jan Hasenauer（波恩大学）；Stefan T. Radev（伦斯勒理工学院）  
**版本：** arXiv:2610.21657v1（stat.ML），v1 日期 2026 年 10 月 15 日；原文 23 页（含附录 A–F）。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2610.21657v1 [stat.ML] 15 Oct 2026"，与库内登记编号 2610.21657 一致。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节正文、图 1–4 与图 S1–S5 中文图注、表 1 与表 S1–S6 逐格转写、命题 1–2 与证明、附录 A–F（证明、评估指标、架构与超参搜索、MCMC 采样器、逐实验细节、附加图表），以及参考文献英文原条目（按原顺序）。逐句逐式终校未做。

## 摘要

流匹配已成为面向仿真推断（SBI）的强大生成模型族。然而采样与密度评估都需要在推断时做数值积分，这使神经后验估计中的后验采样代价高昂。更重要的是，它可能使重复的似然评估昂贵到不可行，从而无法用于可能需要进行数千次密度评估的马尔可夫链蒙特卡洛（MCMC）采样。为此，我们提出**条件均值流**用于后验与似然近似，把少步采样与可处理密度评估结合起来。我们证明均值流目标能够识别条件流映射，并证明独立掩码使边缘似然可直接估计。我们在若干任务上评估后验与似然估计，表明条件均值流在保留基于流的密度估计器灵活性的同时显著降低推断时间。特别地，单步条件均值流密度评估所取得的估计误差与 200 步流匹配相当，同时使下游 MCMC 采样约快 200 倍。

## 1 引言

机理仿真器被用于描述从认知科学（Ratcliff et al., 2016）到疾病建模（Ye et al., 2025）的各类过程。然而，尽管理论上重要，这些模型的似然往往没有闭式。仿真推断（SBI；Sisson et al., 2018; Cranmer et al., 2020; Deistler et al., 2025; Arruda et al., 2026）通过使用模拟得到的参数–观测对 $(\boldsymbol\theta,\mathbf y)$ 来推断未知参数，从而应对该挑战；摊销方法则在多个数据集上复用训练好的网络（Bürkner et al., 2023）。SBI 的两种常见形式是神经后验估计（NPE）与神经似然估计（NLE）。NPE 学习后验模型 $q_\psi(\boldsymbol\theta|\mathbf y)$，可直接从近似后验采样。NLE 则学习似然模型 $q_\psi(\mathbf y|\boldsymbol\theta)$，需用 MCMC 从后验采样。NPE 在数据集上摊销，但通常受训练时所用先验与数据格式的约束；NLE 对每个数据集都需要 MCMC，但允许训练后更换先验，并可把可交换的似然跨任意数量的独立同分布观测进行组合（Cranmer et al., 2020）。

许多 SBI 方法都要求神经估计器既灵活、评估又廉价。在 NLE 中，MCMC 对每个后验需要数千次似然评估，使每次评估成为实际瓶颈。此外，分层方法（Arruda et al., 2024）或改善 NPE 的自一致目标（Schmitt et al., 2024a; Mishra et al., 2026）以及支持模型比较的工作（Kucharský and Bürkner, 2026），都依赖训练或推断期间的密度评估。

迄今为止，归一化流（normalizing flow）是这些应用中的标准选择，因为它们单遍即可评估密度（Papamakarios et al., 2021; Dinh et al., 2017; Durkan et al., 2019）。然而其变换必须保持可逆且 Jacobian 可处理，这限制了能把归纳偏置引入架构的方式（Chen et al., 2025）。基于因果 Transformer 的自回归流（如 TARFlow 与 STARFlow）放宽了该限制（Zhai et al., 2025; Gu et al., 2025），但强加了固定的变量顺序，采样时需要顺序求逆。此外，可处理的联合密度一般并不意味着可处理的边缘密度，而缺失观测（Yalavarthi et al., 2024）正需要后者。

相反，流匹配与扩散模型用无约束神经网络学习速度场或得分场（Lipman et al., 2023; Liu et al., 2022; Wildberger et al., 2023; Sharrock et al., 2024; Arruda et al., 2026），扩散 Transformer 可灵活表示任意条件与边缘分布（Gloeckler et al., 2024）。但其密度需要求解常微分方程（ODE），这可能耗费数百次网络评估，使训练期间或 MCMC 内部的重复似然调用变得昂贵。少步生成模型降低了采样代价，但一致性模型等并不提供可处理密度（Song et al., 2023; Schmitt et al., 2024b）。因此，当前 SBI 方法要么限制网络架构，要么使每次密度评估都昂贵。

为克服该局限，我们提出面向 SBI 的**条件均值流**：它学习两个时刻之间的平均速度，使一次网络评估即可定义基于均值流的有限时间映射（Geng et al., 2025, 2026）。我们先评估直接后验采样与密度估计，再聚焦用于组合推断、缺失观测以及基于梯度与延迟接受 MCMC 的学习似然。具体地，我们开发并展示了：

1. 面向后验与似然近似的条件均值流表述，具有精确的逐步 Jacobian 行列式，并证明均值流目标足以识别条件流映射（第 3.1 节，命题 1）；
2. 借助掩码 Transformer 骨干对缺失目标做边缘密度估计，并证明掩码目标针对正确的边缘似然（第 3.3 节，命题 2）；
3. 在覆盖 NLE 与 NPE 的四个任务上相对归一化流与常规流匹配的基准评测，其中包括单试次似然比较：一个均值流步即达到 200 步流匹配的误差，而采样快两个数量级（第 4 节）。

## 2 背景与相关工作

**仿真推断。** 对条件独立观测 $\mathbf y_n$，仿真推断在似然不可得时以 $p(\boldsymbol\theta|\mathbf y_{\mathrm{obs}})\propto p(\boldsymbol\theta)\prod_{n=1}^{N}p(\mathbf y_n|\boldsymbol\theta)$ 为目标。经典近似贝叶斯计算直接比较模拟数据与观测数据，但随维度增加效果下降（Sisson et al., 2018）。NPE 把 $q_\psi(\boldsymbol\theta|\mathbf y)$ 拟合到模拟对，并为每个数据集采样近似后验而无需运行 MCMC。NLE 则把条件密度拟合到先验预测对，并在 MCMC 内使用（综述见 Cranmer et al., 2020）。逐观测估计器可跨数据集规模复用，使单试次似然对可交换试次模型有用（Boelts et al., 2022），而样条耦合流是可处理密度的标准基线（Durkan et al., 2019）。

**流匹配与基于扩散的推断。** 流匹配学习速度场 $\mathbf v(\mathbf z_t,t)$，沿给定插值把高斯分布输运到目标（Lipman et al., 2023; Liu et al., 2022）。它已被用于 NPE 与 NLE，也与基于得分的生成模型并列（综述见 Arruda et al., 2026）。采样需要 ODE 积分，密度评估还需通过连续变量替换公式对速度散度积分（Chen et al., 2018），因此重复积分可能主导 NLE 的代价。

**少步生成模型。** 一致性模型学习从中间含噪状态向数据的转移，可一步或少数步生成（Song et al., 2023），也支持 SBI 中的快速后验采样（Schmitt et al., 2024b; Arruda et al., 2026），尽管其标准表述不提供可处理后验密度。流映射学习任意时刻对之间的有限时间 ODE 转移，均值流通过平均速度参数化这些映射，且无需蒸馏即可训练（Geng et al., 2025, 2026）。Rehman et al. (2026) 把均值流与鼓励可逆性的循环损失结合，得到用于 Boltzmann 生成器的少步密度。

**学习似然与多保真度似然的 MCMC。** No-U-turn 采样器（NUTS；Hoffman and Gelman, 2014; Betancourt, 2017）利用密度与梯度评估构造提议，概率编程框架允许学习似然作为模型组件进入这些计算（Carpenter et al., 2017）。延迟接受 MCMC 用廉价近似筛选提议，同时保持精细目标不变（Christen and Fox, 2005）；其多层变体组织多个近似（Lykkegaard et al., 2023），而 SBI 中的相关方法在不同分辨率下使用仿真器（Prescott and Baker, 2021; Tatsuoka et al., 2026）。

## 3 方法

**记号说明。** 记 $\mathbf z$ 为密度目标、$\mathbf x$ 为条件变量。在后验估计中，网络学习 $q_\psi(\boldsymbol\theta|\mathbf y)$，以参数 $\mathbf z\equiv\boldsymbol\theta$ 为目标、数据 $\mathbf x\equiv\mathbf y$ 为条件；在似然估计中，它学习 $q_\psi(\mathbf y|\boldsymbol\theta)$，以 $\mathbf z\equiv\mathbf y$、$\mathbf x\equiv\boldsymbol\theta$。通过相应选择目标与条件，同一表述适用于两个方向。

> **图 1（原文 Fig. 1）：** 作为采样器与密度的学习二维双月后验。上排：每种方法在典型观测 $\mathbf y=(0,0)$ 下的 5000 个样本；下排：$512\times512$ 网格上学习的对数密度，虚线为精确 95% 最高密度区域。(A) 归一化流；(B) 32 步的一致性模型（无可处理密度）；(C) 单步均值流；(D) 同一均值流 32 步；(E) 单独训练的流匹配模型用 32 个 Euler 步积分；(F) 均值流的速度头与 (G) 流匹配模型，均用自适应 Tsit5 ODE 求解器积分。

### 3.1 基于流的密度评估

**流匹配与归一化流。** 考虑把目标分布 $p(\mathbf z|\mathbf x)$ 输运到球面高斯基分布的流。时间从数据到噪声：$t=0$ 为干净目标，$t=1$ 为纯噪声，沿流匹配插值 $\mathbf z_t=(1-t)\mathbf z_0+t\boldsymbol\epsilon$（$\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$）。面向 SBI 的流匹配通过回归条件速度 $\boldsymbol\epsilon-\mathbf z_0$ 学习边缘速度 $\mathbf v_\psi(\mathbf z_t,t,\mathbf x)$。采样时抽取初始条件 $\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I)$，再从 $t=1$ 到 $t=0$ 积分 $\mathrm d\mathbf z_t=\mathbf v_\psi\,\mathrm dt$（Wildberger et al., 2023）。密度由连续变量替换给出：

$$
\log q_\psi(\mathbf z_0|\mathbf x)=\log\mathcal N(\mathbf z_1;\mathbf 0,\mathbf I)+\int_0^1\nabla\cdot\mathbf v_\psi(\mathbf z_t,t,\mathbf x)\,\mathrm dt, \tag{1}
$$

可用任意 ODE 求解器积分（Arruda et al., 2026）。归一化流则学习从目标到基分布的可逆映射 $\mathbf f_\psi(\cdot;\mathbf x)$，并单遍评估

$$
\log q_\psi(\mathbf z|\mathbf x)=\log\mathcal N\left(\mathbf f_\psi(\mathbf z;\mathbf x);\mathbf 0,\mathbf I\right)+\log\left|\det\nabla_{\mathbf z}\mathbf f_\psi(\mathbf z;\mathbf x)\right| \tag{2}
$$

（Papamakarios et al., 2021）。为使行列式可处理，$\mathbf f_\psi$ 由具有三角 Jacobian 的可逆层组成（Dinh et al., 2017; Durkan et al., 2019），这避免了 (1) 中的积分，但限制了神经网络架构（图 1）。

**平均速度与流映射。** 把 Geng et al. (2025) 推广到条件模型，我们训练网络预测**平均速度**

$$
\mathbf u_\psi(\mathbf z,s,t,\mathbf x)\approx\frac{1}{t-s}\int_s^t\mathbf v(\mathbf z_\tau,\tau,\mathbf x)\,\mathrm d\tau, \tag{3}
$$

即从 $\mathbf z_s=\mathbf z$ 出发、以 $\mathbf x$ 为条件的 ODE 轨迹上瞬时场的均值。由于 $\mathbf x$ 沿轨迹不变，条件速度对每个条件定义一个 ODE。于是一次网络评估即可应用有限时间流映射

$$
\Phi_\psi(\mathbf z;s,t,\mathbf x)=\mathbf z+(t-s)\mathbf u_\psi(\mathbf z,s,t,\mathbf x), \tag{4}
$$

其边界情形 $\mathbf u_\psi(\mathbf z,t,t,\mathbf x)$ 对应瞬时速度 $\mathbf v$。

**用自一致切线与循环损失训练。** 沿轨迹对 $(t-s)\mathbf u=\int_s^t\mathbf v\,\mathrm d\tau$ 求导，得到均值流恒等式（Geng et al., 2025）：

$$
\mathbf v(\mathbf z_s,s,\mathbf x)=\mathbf u_\psi(\mathbf z_s,s,t,\mathbf x)-(t-s)\frac{\mathrm d}{\mathrm ds}\mathbf u_\psi(\mathbf z_s,s,t,\mathbf x), \tag{5}
$$

其中 $\mathrm d/\mathrm ds=\mathbf v\cdot\nabla_{\mathbf z}+\partial_s$ 是固定 $\mathbf x$ 时沿 $(\dot{\mathbf z}_s,\dot s,\dot t)=(\mathbf v,1,0)$ 的全导数。沿用 Geng et al. (2026)，我们把右端用作瞬时速度的预测：

$$
\mathbf V_\psi=\mathbf u_\psi(\mathbf z_s,s,t,\mathbf x)-(t-s)\,\mathrm{sg}\left[\frac{\mathrm d}{\mathrm ds}\mathbf u_\psi(\mathbf z_s,s,t,\mathbf x)\right], \tag{6}
$$

其中 $\mathrm{sg}[\cdot]$ 表示停止梯度，全导数由一个 Jacobian–向量积、切向 $(\mathrm{sg}[\hat{\mathbf v}_\psi],1,0)$ 计算。由于边缘速度 $\mathbf v$ 未知，切线 $\hat{\mathbf v}_\psi(\mathbf z_s,s,\mathbf x)$ 由辅助速度头预测，该头与 $\mathbf u_\psi$ 共享除最后两层之外的全部层。取 $\mathbf z_s=(1-s)\mathbf z_0+s\boldsymbol\epsilon$，两个输出都回归到条件速度：

$$
\mathcal L_{\mathrm{MF}}(\psi)=\mathbb E\left[w\left\|\mathbf V_\psi-(\boldsymbol\epsilon-\mathbf z_0)\right\|^2+\frac{1}{d}\left\|\hat{\mathbf v}_\psi-(\boldsymbol\epsilon-\mathbf z_0)\right\|^2\right], \tag{7}
$$

其中 $w=\mathrm{sg}\left(\|\mathbf V_\psi-(\boldsymbol\epsilon-\mathbf z_0)\|^2+c\right)^{-p}$ 为 Geng et al. (2025) 的自适应权重，$d$ 是 $\mathbf z$ 的维度（全部超参数见附录 C）。期望在模拟 $(\mathbf z_0,\mathbf x)$、噪声 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$ 与从幂律分布独立抽取的时刻 $s,t$ 上取。因此采样时刻更常靠近目标，与 Wildberger et al. (2023) 类似。对部分样本对取 $t=s$，此时 $\mathbf V_\psi=\mathbf u_\psi(\mathbf z_s,s,s,\mathbf x)$，(7) 退化为流匹配。除稳定训练外，速度头还允许把训练好的均值流当作流匹配模型使用。为鼓励流映射可逆，我们加入 Rehman et al. (2026) 的循环损失，惩罚状态与其经 $s\to t$ 再返回映射后图像之间的差异：

$$
\mathcal L_{\mathrm{cyc}}(\psi)=\mathbb E\left[\frac{1}{d}\left\|\mathbf z_s-\Phi_\psi\left(\Phi_\psi(\mathbf z_s;s,t,\mathbf x);t,s,\mathbf x\right)\right\|^2\right], \tag{8}
$$

并以循环权重 $\lambda>0$ 最小化 $\mathcal L_{\mathrm{MF}}+\lambda\mathcal L_{\mathrm{cyc}}$。我们还在 (8) 中把部分 $\mathbf x$ 替换为另一模拟的条件，以鼓励 $\Phi_\psi$ 对每个条件都可逆，并使映射对任意 MCMC 提议稳健。

**由复合步得到的精确密度。** 固定调度 $0=t_0<t_1<\cdots<t_S=1$，令 $G_i(\mathbf z)=\Phi_\psi(\mathbf z;t_{i-1},t_i,\mathbf x)$ 为向噪声方向的步映射。记 $\mathbf z^{(0)}=\mathbf z$、$\mathbf z^{(i)}=G_i(\mathbf z^{(i-1)})$，变量替换表达式为

$$
\log q_\psi^{(S)}(\mathbf z|\mathbf x)=\log\mathcal N\left(\mathbf z^{(S)};\mathbf 0,\mathbf I\right)+\sum_{i=1}^{S}\log\left|\det\nabla_{\mathbf z}G_i\left(\mathbf z^{(i-1)}\right)\right|, \tag{9}
$$

其中每个 Jacobian 都可用自动微分计算。若复合映射 $T=G_S\circ\cdots\circ G_1$ 是 $\mathbb R^d$ 的微分同胚，则由链式法则 $\det\nabla_{\mathbf z}T=\prod_i\det\nabla_{\mathbf z}G_i$，(9) 即基密度经 $T$ 的拉回。我们用 EDM 调度（Karras et al., 2022）放置节点，$t_i=(\sigma_i-\sigma_{\min})/(1-\sigma_{\min})$，其中 $\sigma_i=\left(\sigma_{\min}^{1/\rho}+\frac{i}{S}(1-\sigma_{\min}^{1/\rho})\right)^\rho$，它在 $\rho>1$ 时把步集中到数据附近，且在少步密度评估中已被证明优于其他调度（Rehman et al., 2026）。

**条件化。** 尽管均值流只把 $\mathbf x$ 作为额外输入、与无条件模型回归同一目标 $\boldsymbol\epsilon-\mathbf z_0$，我们证明它学习到正确的条件流映射。与条件扩散模型类似（Vincent, 2011; Batzolis et al., 2021; Arruda et al., 2026），条件只限制哪些目标 $\mathbf z_0$ 参与回归。

**命题 1（条件均值流）。** 在附录 A.1 的假设下，未加权损失 $\mathcal L_{\mathrm{MF}}$ 的每个总体极小化者都满足：对 $p(\mathbf x)$-几乎每个 $\mathbf x$ 有 $\mathbf u_\psi=\mathbf u^\ast$，其中 $\mathbf u^\ast$ 是 $\mathbf v^\ast(\mathbf z,s,\mathbf x)=\mathbb E[\boldsymbol\epsilon-\mathbf z_0|\mathbf z_s=\mathbf z,\mathbf x]$ 的平均速度 (3)。因此对任意调度，(9) 等于 $\log p(\mathbf z|\mathbf x)$。

**证明：** 见附录 A.1。

### 3.2 采样与后验推断

采样时抽取 $\mathbf z^{(S)}\sim\mathcal N(\mathbf 0,\mathbf I)$，沿同一调度反向应用流映射：$\mathbf z^{(i-1)}=\Phi_\psi(\mathbf z^{(i)};t_i,t_{i-1},\mathbf x)$（$i=S,\dots,1$），于是 $S$ 步给出样本 $\mathbf z^{(0)}$。在后验方向，这些是以观测数据为条件的参数抽样；在似然方向，这些是以参数为条件的观测抽样。只有当反向映射逆转为前向映射 $G_i$ 时，这些样本才服从 (9) 中的密度，而循环损失正是鼓励这一点的。

在似然方向，$N$ 个独立同分布观测的联合对数后验正比于 $\log p(\boldsymbol\theta)+\sum_{n=1}^N\log q_\psi^{(S)}(\mathbf y_n|\boldsymbol\theta)$，对任意固定 $S$ 且步 Jacobian 非奇异时，它对 $\boldsymbol\theta$ 可微。我们把它作为分布暴露给 PyMC（Salvatier et al., 2016），并用 nutpie 的 NUTS 在 JAX 后端采样（Seyboldt et al., 2026）。

此外，由于训练好的均值流以少数步提供粗似然 $q_\psi^{\mathrm{Sc}}$，并可把其速度头用精确 ODE 求解器积分 (1) 得到细似然 $q_\psi^{\mathrm f}$，我们可以构造两级采样器。这定义了粗、细后验：

$$
\pi_{\mathrm c}(\boldsymbol\theta)\propto p(\boldsymbol\theta)\prod_{n=1}^{N}q_\psi^{\mathrm{Sc}}(\mathbf y_n|\boldsymbol\theta),\qquad
\pi_{\mathrm f}(\boldsymbol\theta)\propto p(\boldsymbol\theta)\prod_{n=1}^{N}q_\psi^{\mathrm f}(\mathbf y_n|\boldsymbol\theta), \tag{10}
$$

我们在两级延迟接受 MCMC 中把它们结合（Christen and Fox, 2005; Lykkegaard et al., 2023）。从当前状态 $\boldsymbol\theta$ 出发，以 $\pi_{\mathrm c}$ 为目标运行 $J$ 步随机游走 Metropolis 子链得到提议 $\boldsymbol\theta'$，其接受概率为

$$
\alpha(\boldsymbol\theta,\boldsymbol\theta')=\min\left(1,\frac{\pi_{\mathrm f}(\boldsymbol\theta')\pi_{\mathrm c}(\boldsymbol\theta)}{\pi_{\mathrm f}(\boldsymbol\theta)\pi_{\mathrm c}(\boldsymbol\theta')}\right). \tag{11}
$$

由于子链关于 $\pi_{\mathrm c}$ 可逆，该修正使 $\pi_{\mathrm f}$ 成为不变分布（Lykkegaard et al., 2023），而细似然每条子链只评估一次，而非每个提议都评估。

### 3.3 用于边缘密度的掩码 Transformer

受 Simformer 启发（Gloeckler et al., 2024），我们用掩码注意力学习目标坐标子集 $O$ 的边缘密度 $p(\mathbf z_O|\mathbf x)$。我们的 Transformer 对 $\mathbf z$ 与 $\mathbf x$ 的每个坐标做 token 化，并通过自适应层归一化接收 $(s,s-t)$（Peebles and Xie, 2023）。掩码排除被省略的目标 token，因此输出只通过 $\mathbf z_O$ 依赖 $\mathbf z$；均值流与循环损失被限制在 $O$ 上。

**命题 2（通过掩码实现边缘化）。** 在附录 A.2 的假设下，未加权掩码损失的每个总体极小化者对每个训练掩码 $O$ 与 $p(\mathbf x)$-几乎每个 $\mathbf x$ 都满足 $\mathbf u_{\psi,O}=\mathbf u_O^\ast$，其中 $\mathbf u_O^\ast$ 是 $\mathbf v_O^\ast(\mathbf z_O,s,\mathbf x)=\mathbb E[\boldsymbol\epsilon_O-\mathbf z_{0,O}|\mathbf z_{s,O}=\mathbf z_O,\mathbf x]$ 的平均速度。因此，$|O|$ 维的 (9) 对任意调度都等于 $\log p(\mathbf z_O|\mathbf x)$。

**证明：** 见附录 A.2。取 $\mathbf z=\boldsymbol\theta$ 得到边缘后验密度 $p(\boldsymbol\theta_O|\mathbf y)$；取 $\mathbf z=\mathbf y$ 得到边缘似然 $p(\mathbf y_O|\boldsymbol\theta)$。后者在第 4.3 节用于缺失观测评估。

## 4 实验

我们在双月任务上评估直接后验近似，并在另外三个基准上评估似然近似，其中学习到的密度进入 MCMC。各基准表明：

- **双月：** 少步即给出准确样本，故采样只在速度–精度上有轻微折中，而密度随步数增加而改善（第 4.1 节）。
- **认知模型：** 可交换似然给出与 200 步流匹配相当的精度，而 MCMC 约快 200 倍（第 4.2 节）。
- **疫情更新过程：** 掩码 Transformer 对缺失观测做边缘化，比归一化流更准确（第 4.3 节）。
- **g-and-k：** 在共享预算下，更多后验抽样优于更多流步，延迟接受 MCMC 与不用梯度的 NUTS 同样准确（第 4.4 节）。

我们用分类器双样本检验（C2ST；Lopez-Paz and Oquab, 2017）把样本与精确参考比较，用 Hellinger 距离比较密度（附录 B）。无参考评估使用归一化均方根误差（NRMSE）、有效样本量（ESS）与预测检查；在任何其他评估之前，先用随机点精度检验（TARP；Lemos et al., 2023）评估每个训练估计器的校准性（表 S1）。任务、架构与生成模型见附录 B–E。

### 4.1 少步足以获得高质量后验样本与密度

**设置与基线。** 双月任务具有二维参数与观测、双峰新月形后验以及精确似然与后验采样器（Greenberg et al., 2019; Lueckmann et al., 2021）。所有方法学习后验方向，并对每个数据集直接用 5000 次抽样评估，对照 32,000 个精确参考样本打分。我们把步数 $S\in\{1,2,4,8,16,32\}$ 的条件均值流与三个基线比较：条件归一化流、作为成熟少步方法的条件一致性模型（Song et al., 2023; Schmitt et al., 2024b），以及单独训练、用 $S$ 个 Euler 步或自适应 Tsit5 求解器积分的条件流匹配模型（Tsitouras, 2011）。我们也用相同的 Euler 或自适应方案积分均值流的速度头，从而把均值流当作流匹配模型复用。对一致性模型与均值流，我们都在与评估数据集不相交的留出观测上为每个步数调节采样调度。

**样本质量。** 条件均值流在每个步数下都达到相近的 C2ST（图 1 与图 S1A），故单步即可采样，且已优于归一化流（0.523 对 0.543）。相反，一致性模型至少需要 4 步才能接近该精度，两种流匹配变体都至少需要 32 个 Euler 步。自适应求解器进一步提升精度，但需要 300 步以上。因此，$S=1$ 的均值流抽取 5000 个样本比用 32 个 Euler 步的流匹配快约 23 倍、比自适应求解器快约 140 倍（图 S2）。它也比归一化流快约 6 倍，归一化流要到 $S=8$ 才达到其采样时间。

由于均值流的速度头与单独训练的模型在两种求解器下表现相似，均值流训练似乎并未损害学到的速度场。一致性模型还对其离散化指数敏感，在 $S=4$ 时其候选跨越从 0.54 到 0.98 的 C2ST，而均值流的 EDM 调度使 C2ST 变化最多 0.015（表 S3）。

**密度质量。** 与采样相反，我们发现额外的均值流步会改善密度，且与精确后验的 Hellinger 距离随 $S$ 增大而减小（图 S1B 与表 S4）。$S=1$ 时均值流在两模态之间放置质量（图 1C），但仍优于归一化流。任一速度场的 Euler 积分在 $S\ge2$ 到 32 步时仍不如均值流准确。自适应求解器最准确，其中均值流的速度头优于单独训练的流匹配模型。

此外，均值流密度接近归一化，而 Euler 密度在 $S=1$ 时超出单位质量许多个数量级，在 $S=32$ 时仍远离归一化（表 S4）。我们将其归因于 Euler 格式同时近似轨迹与 (1) 中的散度积分，而均值流计算每步的精确 Jacobian 行列式。归一化流是精确归一化的，但其密度出现折叠伪影并在先验支撑之外放置质量（图 1A）。带自适应求解器的流匹配模型提供最准确的密度，但每次评估 300 步以上使其对重复密度评估而言过于昂贵。

> **图 2（原文 Fig. 2）：** 把单个学习试次似然在认知模型的 $N$ 个试次上组合。(A) 组合后验相对生成参数的 NRMSE。(B) 在选择比例、条件响应时间分位数与超时率上的最差后验预测偏差。(C) 相对先验的后验收缩。曲线为 10 个独立数据集的均值，条带为样本标准差。

### 4.2 单步似然给出与 200 步流匹配相当的误差

**设置与基线。** 认知模型把二选一决策描述为带漂移 $\nu$、边界间隔 $a$ 与非决策时间 $t_0$ 的 Wiener 首达过程（Ratcliff et al., 2016），是学习单试次似然的标准基准（Fengler et al., 2021）。我们在带符号响应时间 $y=(2c-1)t$（选择 $c\in\{0,1\}$、响应时间 $t$）上训练一个条件均值流，并把学习到的试次似然组合为 $N\in\{4,16,64,256\}$ 个试次的联合后验，用 NUTS 采样。由于响应不可能快于 $t_0$，我们在每次运行中最快的观测响应时间处截断 $t_0$ 的先验。我们把均值流步数 $S\in\{1,2,4,8\}$ 与用 200 个 Euler 步积分的流匹配模型比较。

**结果。** $S=1$ 时，均值流的 NRMSE 与后验收缩在每个 $N$ 下都与流匹配基线相当（图 2、表 S5 与图 S3），而采样快 182 至 216 倍（图 S2D）。增加步数会提高代价与收敛失败次数，却不明显降低参数误差（图 S4）。所有 MCMC 运行中 8.5% 未能收敛，且所有失败运行都使用 $S\ge4$（表 S5）。我们将其归因于均值流只为少步采样与评估训练，因此中间映射可能训练不足，额外步数不像 ODE 离散化那样必然降低近似误差。

然而对每种方法，95% 中心区间的覆盖率都随 $N$ 增大而下降，最差后验预测偏差随 $N$ 增大而上升（图 2B）。组合许多近似似然会累积其误差，而后验收缩使即便 200 步基线也过度自信。$S=1$ 时额外离散化误差在 $N=256$ 进一步降低覆盖率，而 $S=2$ 时覆盖率与预测偏差与基线相当。

### 4.3 掩码 Transformer 骨干降低缺失观测下的误差

**设置与基线。** 由于条件均值流不约束网络架构，我们可以为含缺失项的观测定制骨干。考虑随机更新过程——估计时变再生数 $R_t$ 的标准前向模型（Fraser, 2007; Cori et al., 2013; Gostic et al., 2020），其发病率由世代间隔力驱动（附录 E.3 与图 S5）。参数是 128 维系数向量 $\mathbf z$，$\log\mathbf R=\mathbf L\mathbf z$，其中 $\mathbf L$ 是平方指数核的 Cholesky 因子（Rasmussen and Williams, 2005），使先验为 $\mathcal N(\mathbf 0,\mathbf I)$。我们完全随机地扣留 30% 的观测步，并为每个数据集重新抽取该模式。在该机制下，推断只需要观测项 $O$ 的边缘似然 $p(\mathbf y_O|\mathbf z)$（Little and Rubin, 2019）。我们用带时间因果掩码、在缺失坐标上训练的掩码 Transformer 参数化均值流。相反，归一化流输入宽度固定，故我们在缺失项用 $-1$ 训练与评估（图 S5C）。两个模型都在 8192 次模拟的低预算下训练，均值流用 $S=1$ 评估。

**后验精度与采样代价。** 两种方法都在每个数据集上收敛且无发散转移。带掩码 Transformer 的条件均值流相对生成系数的 NRMSE 低于归一化流，在学习的似然与仿真器下其后验抽样更贴近观测 $\mathbf y_t$（表 1），且每次网络评估的 ESS 高六倍。然而 Transformer 每次评估计算代价更高，使归一化流完成采样快 22 倍，尽管它在 NUTS 内需要更多 leapfrog 步。

> **表 1（原文 Table 1）：** 含缺失观测的似然。10 个数据集上的均值（样本标准差）。$\tilde y_t$ 用学习到的似然模拟。

| 指标 | 均值流 | 归一化流 |
|---|---|---|
| NRMSE | **0.187（0.008）** | 0.199（0.009） |
| RMSE $\tilde y_t$ | **0.055（0.007）** | 0.159（0.036） |
| RMSE $y_t$ | **0.060（0.013）** | 0.125（0.031） |
| ESS | **4,234（247）** | 2,700（629） |
| Leapfrog 步数 | **121（4）** | 480（57） |
| 实际耗时（s） | 36,146（6,157） | **1,624（285）** |

**后验预测。** 在后验抽样处用学习似然模拟，揭示了哨兵值的问题（图 3）。均值流的预测带在每个被观测时间点都围绕观测数据收缩；相反，归一化流在观测时间点也频繁生成哨兵值 $-1$，这反映为更高的预测 RMSE（表 1）。

总之，均值流的灵活架构允许掩码 Transformer 对缺失观测做边缘化。这比带哨兵值的归一化流给出更低的后验误差，但每次密度评估代价更高。

> **图 3（原文 Fig. 3）：** 更新过程模型在一个数据集上的后验预测模拟。观测 $\tilde y$ 由学习似然在后验抽样处模拟：(A) 我们的带掩码 Transformer 条件均值流；(B) 带哨兵值的归一化流；中位数与 50%、90% 条带对照观测数据（黑色）。灰色条带为种子窗口，条纹列标记缺失时间点。

### 4.4 更多后验抽样优于更多流步

**设置与基线。** g-and-k 分布是没有可处理似然的标准基准，由其分位函数定义（Rayner and MacGillivray, 2002; Drovandi and Pettitt, 2011）。我们使用带高斯 copula 的二元版本，参数为 $(g,k,\rho)$，数据集含 $N=50$ 个观测（附录 E.2）。条件均值流学习单观测的似然，我们用 NUTS 采样后验。为评估计算预算应花在更多均值流步还是更多后验抽样上，我们固定"每链请求抽样数 × 每次密度网络评估数"之积（附录 D）。在该预算下，我们把均值流步数 $S\in\{1,2,4,8\}$ 与归一化流比较。此外评估延迟接受 MCMC：它用 $S_c$ 步的均值流筛选提议，并用同一网络速度头的 100 步 Tsit5 评估来接受（第 3.2 节与附录 D）。单独训练、用 200 个 Euler 步积分的流匹配模型作为预算之外的基线，其网络评估多 28 倍。

**步数与抽样。** 所有均值流设置都在每个数据集上收敛并达到相近精度，$S=4$ 时平均 C2ST 最低，但这些差异小于数据集间波动（图 4A、表 S6）。更少步数允许更长链，而每次网络评估的最小 bulk ESS 从 $S=1$ 到 $S=8$ 下降一个数量级（图 4B–C）。因此超过 $S=4$ 后，更准确的似然无法补偿更少的后验抽样；实践中对该基准我们推荐 $S=2$。在同一预算下，归一化流的 C2ST 高于所有均值流设置，且实际耗时是均值流的四倍以上（$S=2$；图 S2B）。常规流匹配尽管需要更多评估，C2ST 也更高，而同一均值流约快 50 倍。

**延迟接受 MCMC。** 用粗均值流筛选提议、并用同一网络的细评估接受，给出与 NUTS 相当的精度（表 S6）。粗接受率调至 0.3 时，细层接受 80–85% 的被评估提议，且随 $S_c$ 上升。延迟接受 MCMC 比流匹配基线快约 26–37 倍，但比使用均值流似然的 NUTS 慢，且 ESS 更低。

总之，少数均值流步配合更多后验抽样，比归一化流与流匹配基线都给出更低的后验误差，且实际耗时更低。同一网络下的延迟接受 MCMC 无需梯度即达到相当精度。

> **图 4（原文 Fig. 4）：** g-and-k 上预算匹配的后验精度。(A) 附录 D 共享预算下，相对精确后验的 C2ST 随均值流步数 $S$ 的变化。(B) 每 1000 次网络评估的最小 bulk ESS。(C) 共享预算下每条链保留的抽样数。曲线为 10 个独立数据集的均值，条带为标准差；延迟接受 MCMC 线按其粗步数索引，水平线标记预算之外的归一化流与 200 Euler 步流匹配模型。

## 5 讨论与结论

面向 SBI 的神经密度估计器迄今都在用灵活性换取快速密度评估。条件均值流通过允许在训练之后选择步数来放松这一折中。在低维基准上，一到两步即达到流匹配的精度，同时把 MCMC 时间降低至多两个数量级。少步也给出准确的后验样本；在固定 MCMC 预算下，更多抽样比更多步数更有价值。

**局限。** 主要局限是高维下密度评估的代价。每步需要其完整 Jacobian 与一个对数行列式，代价随维度立方增长；而为 NUTS 对对数行列式求导涉及二阶导数。再加上每次 Transformer 评估更高的代价，这使更新过程应用中的 MCMC 尽管网络评估更少，却比归一化流更慢。此外，循环损失鼓励但并不保证可逆性，因此学到的密度可能并非精确归一化。最后，包括 200 步流匹配在内，每种方法的覆盖率在大试次数下都下降，与误差累积一致。

**展望。** 在 MCMC 之外，快速均值流密度还可支持自一致目标（Schmitt et al., 2024a），并与先验和似然评估一起支持证据估计（Kucharský et al., 2026）。由于这些方法也依赖重复密度评估，本工作可使基于流的灵活估计器在需要密度的任何 SBI 场景中变得实用。

## 参考文献（英文原书目）

- Akiba, T., Sano, S., Yanase, T., Ohta, T., and Koyama, M. (2019). Optuna: A next-generation hyperparameter optimization framework. In Proceedings of the 25th ACM SIGKDD International Conference on Knowledge Discovery & Data Mining, KDD '19, pages 2623–2631, New York, NY, USA. Association for Computing Machinery.
- Arruda, J., Schälte, Y., Peiter, C., Teplytska, O., Jaehde, U., and Hasenauer, J. (2024). An amortized approach to non-linear mixed-effects modeling based on neural posterior estimation. In Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 1865–1901. PMLR.
- Arruda, J., Bracher, N., Köthe, U., Hasenauer, J., and Radev, S. T. (2026). Diffusion models in simulation-based inference: A tutorial review. Transactions on Machine Learning Research.
- Batzolis, G., Stanczuk, J., Schönlieb, C.-B., and Etmann, C. (2021). Conditional image generation with score-based diffusion models. arXiv preprint arXiv:2111.13606.
- Betancourt, M. (2017). A conceptual introduction to Hamiltonian Monte Carlo. arXiv preprint arXiv:1701.02434.
- Boelts, J., Lueckmann, J.-M., Gao, R., and Macke, J. H. (2022). Flexible and efficient simulation-based inference for models of decision-making. eLife, 11:e77220.
- Bradbury, J., Frostig, R., Hawkins, P., Johnson, M. J., Katariya, Y., Leary, C., Maclaurin, D., Necula, G., Paszke, A., VanderPlas, J., Wanderman-Milne, S., and Zhang, Q. (2018). JAX: composable transformations of Python+NumPy programs.
- Bürkner, P.-C., Scholz, M., and Radev, S. T. (2023). Some models are useful, but how do we know which ones? Towards a unified Bayesian model taxonomy. Statistics Surveys, 17:216–310.
- Carpenter, B., Gelman, A., Hoffman, M. D., Lee, D., Goodrich, B., Betancourt, M., Brubaker, M., Guo, J., Li, P., and Riddell, A. (2017). Stan: A probabilistic programming language. Journal of Statistical Software, 76(1):1–32.
- Chen, R. T. Q., Rubanova, Y., Bettencourt, J., and Duvenaud, D. (2018). Neural ordinary differential equations. In Proceedings of the 32nd International Conference on Neural Information Processing Systems, NIPS '18, pages 6572–6583.
- Chen, T., Bansal, V., and Scott, J. G. (2025). Conditional diffusions for amortized neural posterior estimation. In Proceedings of The 28th International Conference on Artificial Intelligence and Statistics, volume 258 of Proceedings of Machine Learning Research, pages 2377–2385. PMLR.
- Chollet, F. et al. (2015). Keras. https://keras.io.
- Christen, J. A. and Fox, C. (2005). Markov chain Monte Carlo using an approximation. Journal of Computational and Graphical Statistics, 14(4):795–810.
- Cori, A., Ferguson, N. M., Fraser, C., and Cauchemez, S. (2013). A new framework and software to estimate time-varying reproduction numbers during epidemics. American Journal of Epidemiology, 178(9):1505–1512.
- Cranmer, K., Brehmer, J., and Louppe, G. (2020). The frontier of simulation-based inference. Proceedings of the National Academy of Sciences, 117(48):30055–30062.
- Deistler, M., Boelts, J., Steinbach, P., Moss, G., Moreau, T., Gloeckler, M., Rodrigues, P. L. C., Linhart, J., Lappalainen, J. K., Miller, B. K., Gonçalves, P. J., Lueckmann, J.-M., Schröder, C., and Macke, J. H. (2025). Simulation-based inference: A practical guide. arXiv preprint arXiv:2508.12939.
- Dinh, L., Sohl-Dickstein, J., and Bengio, S. (2017). Density estimation using real NVP. In International Conference on Learning Representations.
- Drovandi, C. C. and Pettitt, A. N. (2011). Likelihood-free Bayesian estimation of multivariate quantile distributions. Computational Statistics & Data Analysis, 55(9):2541–2556.
- Durkan, C., Bekasov, A., Murray, I., and Papamakarios, G. (2019). Neural spline flows. In Proceedings of the 33rd International Conference on Neural Information Processing Systems.
- Fengler, A., Govindarajan, L. N., Chen, T., and Frank, M. J. (2021). Likelihood approximation networks (LANs) for fast inference of simulation models in cognitive neuroscience. eLife, 10:e65074.
- Fraser, C. (2007). Estimating individual and household reproduction numbers in an emerging epidemic. PLoS ONE, 2(8):e758.
- Geng, Z., Deng, M., Bai, X., Kolter, Z., and He, K. (2025). Mean flows for one-step generative modeling. In Advances in Neural Information Processing Systems 38, pages 84032–84054.
- Geng, Z., Lu, Y., Wu, Z., Shechtman, E., Kolter, J. Z., and He, K. (2026). Improved mean flows: On the challenges of fastforward generative models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 30467–30476.
- Gloeckler, M., Deistler, M., Weilbach, C., Wood, F., and Macke, J. H. (2024). All-in-one simulation-based inference. In Proceedings of the 41st International Conference on Machine Learning, ICML '24, pages 15735–15766.
- Gostic, K. M., McGough, L., Baskerville, E. B., Abbott, S., Joshi, K., Tedijanto, C., Kahn, R., Niehus, R., Hay, J. A., De Salazar, P. M., et al. (2020). Practical considerations for measuring the effective reproductive number, $R_t$. PLoS Computational Biology, 16(12):e1008409.
- Greenberg, D., Nonnenmacher, M., and Macke, J. (2019). Automatic posterior transformation for likelihood-free inference. In International Conference on Machine Learning, pages 2404–2414. PMLR.
- Gu, J., Chen, T., Berthelot, D., Zheng, H., Wang, Y., Zhang, R., Dinh, L., Bautista, M. Á., Susskind, J. M., and Zhai, S. (2025). STARFlow: Scaling latent normalizing flows for high-resolution image synthesis. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, pages 134122–134158.
- Hoffman, M. D. and Gelman, A. (2014). The No-U-turn sampler: Adaptively setting path lengths in Hamiltonian Monte Carlo. Journal of Machine Learning Research, 15(1):1593–1623.
- Karras, T., Aittala, M., Laine, S., and Aila, T. (2022). Elucidating the design space of diffusion-based generative models. In Proceedings of the 36th International Conference on Neural Information Processing Systems, NIPS '22.
- Kucharský, Š. and Bürkner, P.-C. (2026). Amortized Bayesian mixture models. Statistics and Computing, 36(4).
- Kucharský, Š., Mishra, A., Habermann, D., Radev, S. T., and Bürkner, P.-C. (2026). Improving the accuracy of amortized model comparison with self-consistency. arXiv preprint arXiv:2508.20614.
- Kühmichel, L., Huang, J. M., Pratz, V., Arruda, J., Olischläger, H., Habermann, D., Kucharsky, S., Elsemüller, L., Mishra, A., Bracher, N., et al. (2026). BayesFlow 2.0: Multi-backend amortized Bayesian inference in Python. arXiv preprint arXiv:2602.07098.
- Lemos, P., Coogan, A., Hezaveh, Y., and Perreault-Levasseur, L. (2023). Sampling-based accuracy testing of posterior estimators for general inference. In Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pages 19256–19273. PMLR.
- Lipman, Y., Chen, R. T. Q., Ben-Hamu, H., Nickel, M., and Le, M. (2023). Flow matching for generative modeling. In The Eleventh International Conference on Learning Representations.
- Little, R. J. and Rubin, D. B. (2019). Statistical Analysis with Missing Data. Wiley Series in Probability and Statistics. John Wiley & Sons.
- Liu, X., Gong, C., and Liu, Q. (2022). Flow straight and fast: Learning to generate and transfer data with rectified flow. In The Eleventh International Conference on Learning Representations.
- Lopez-Paz, D. and Oquab, M. (2017). Revisiting classifier two-sample tests. In International Conference on Learning Representations.
- Lu, C. and Song, Y. (2025). Simplifying, stabilizing and scaling continuous-time consistency models. In The Thirteenth International Conference on Learning Representations.
- Lueckmann, J.-M., Boelts, J., Greenberg, D., Goncalves, P., and Macke, J. (2021). Benchmarking simulation-based inference. In International Conference on Artificial Intelligence and Statistics, pages 343–351. PMLR.
- Lykkegaard, M. B., Dodwell, T. J., Fox, C., Mingas, G., and Scheichl, R. (2023). Multilevel delayed acceptance MCMC. SIAM/ASA Journal on Uncertainty Quantification, 11(1):1–30.
- Martin, O. A., Abril-Pla, O., Deklerk, J., Axen, S. D., Carroll, C., Hartikainen, A., and Vehtari, A. (2026). ArviZ: A modular and flexible library for exploratory analysis of Bayesian models. Journal of Open Source Software, 11(119):9889.
- Mishra, A., Habermann, D., Schmitt, M., Radev, S., and Bürkner, P.-C. (2026). Robust amortized Bayesian inference with self-consistency losses on unlabeled data. In International Conference on Learning Representations, volume 2026, pages 9374–9405.
- Papamakarios, G., Nalisnick, E., Rezende, D. J., Mohamed, S., and Lakshminarayanan, B. (2021). Normalizing flows for probabilistic modeling and inference. Journal of Machine Learning Research, 22(57):1–64.
- Peebles, W. and Xie, S. (2023). Scalable diffusion models with transformers. In 2023 IEEE/CVF International Conference on Computer Vision (ICCV), pages 4172–4182.
- Perez, E., Strub, F., De Vries, H., Dumoulin, V., and Courville, A. (2018). FiLM: Visual reasoning with a general conditioning layer. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 32.
- Prescott, T. P. and Baker, R. E. (2021). Multifidelity approximate Bayesian computation with sequential Monte Carlo parameter sampling. SIAM/ASA Journal on Uncertainty Quantification, 9(2):788–817.
- Radev, S. T., Schmitt, M., Schumacher, L., Elsemüller, L., Pratz, V., Schälte, Y., Köthe, U., and Bürkner, P.-C. (2023). BayesFlow: Amortized Bayesian workflows with neural networks. Journal of Open Source Software, 8(89):5702.
- Rasmussen, C. E. and Williams, C. K. I. (2005). Gaussian Processes for Machine Learning. The MIT Press.
- Ratcliff, R., Smith, P. L., Brown, S. D., and McKoon, G. (2016). Diffusion decision model: Current issues and history. Trends in Cognitive Sciences, 20(4):260–281.
- Rayner, G. D. and MacGillivray, H. L. (2002). Numerical maximum likelihood estimation for the g-and-k and generalized g-and-h distributions. Statistics and Computing, 12(1):57–75.
- Rehman, D., Akhound-Sadegh, T., Gazizov, A., Bengio, Y., and Tong, A. (2026). FALCON: Few-step accurate likelihoods for continuous flows. In International Conference on Learning Representations, volume 2026, pages 70449–70473.
- Salvatier, J., Wiecki, T. V., and Fonnesbeck, C. (2016). Probabilistic programming in Python using PyMC3. PeerJ Computer Science, 2016:e55.
- Schmitt, M., Ivanova, D. R., Habermann, D., Koethe, U., Bürkner, P.-C., and Radev, S. T. (2024a). Leveraging self-consistency for data-efficient amortized Bayesian inference. In Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pages 43723–43741. PMLR.
- Schmitt, M., Pratz, V., Köthe, U., Bürkner, P.-C., and Radev, S. T. (2024b). Consistency models for scalable and fast simulation-based inference. In Proceedings of the 38th International Conference on Neural Information Processing Systems, NIPS '24, pages 126908–126945.
- Seyboldt, A., Carlson, E. L., and Carpenter, B. (2026). Preconditioning Hamiltonian Monte Carlo by minimizing Fisher divergence. arXiv preprint arXiv:2603.18845.
- Sharrock, L., Simons, J., Liu, S., and Beaumont, M. (2024). Sequential neural score estimation: Likelihood-free inference with conditional score based diffusion models. In Proceedings of the 41st International Conference on Machine Learning, ICML '24, pages 44565–44602.
- Sisson, S. A., Fan, Y., and Beaumont, M. (2018). Handbook of Approximate Bayesian Computation. Chapman and Hall/CRC.
- Song, Y., Dhariwal, P., Chen, M., and Sutskever, I. (2023). Consistency models. In Proceedings of the 40th International Conference on Machine Learning, ICML '23, pages 32211–32252.
- Tatsuoka, C., Yang, M., Xiu, D., and Zhang, G. (2026). Bifidelity parameter estimation using conditional diffusion models. SIAM/ASA Journal on Uncertainty Quantification, 14(3):743–778.
- Tsitouras, C. (2011). Runge–Kutta pairs of order 5(4) satisfying only the first column simplifying assumption. Computers & Mathematics with Applications, 62(2):770–775.
- Vehtari, A., Gelman, A., Simpson, D., Carpenter, B., and Bürkner, P.-C. (2021). Rank-normalization, folding, and localization: An improved $\hat R$ for assessing convergence of MCMC (with discussion). Bayesian Analysis, 16(2):667–718.
- Vincent, P. (2011). A connection between score matching and denoising autoencoders. Neural Computation, 23(7):1661–1674.
- Wang, Z., Hasenauer, J., and Schälte, Y. (2024). Missing data in amortized simulation-based neural posterior estimation. PLoS Computational Biology, 20(6):e1012184.
- Wildberger, J., Dax, M., Buchholz, S., Green, S. R., Macke, J. H., and Schölkopf, B. (2023). Flow matching for scalable simulation-based inference. In Proceedings of the 37th International Conference on Neural Information Processing Systems, NIPS '23, pages 16837–16864.
- Yalavarthi, V. K., Scholz, R., Kloetergens, C., Madhusudhanan, K., Born, S., and Schmidt-Thieme, L. (2024). Marginalization consistent probabilistic forecasting of irregular time series via mixture of separable flows. arXiv preprint arXiv:2406.07246.
- Ye, Y., Pandey, A., Bawden, C., Sumsuzzman, D. M., Rajput, R., Shoukat, A., Singer, B. H., Moghadas, S. M., and Galvani, A. P. (2025). Integrating artificial intelligence with mechanistic epidemiological modeling: A scoping review of opportunities and challenges. Nature Communications, 16(1):581.
- Zhai, S., Zhang, R., Nakkiran, P., Berthelot, D., Gu, J., Zheng, H., Chen, T., Bautista, M. Á., Jaitly, N., and Susskind, J. M. (2025). Normalizing flows are capable generative models. In Forty-second International Conference on Machine Learning.

## 附录 A 证明

### A.1 条件均值流

如条件扩散与流匹配中那样（Vincent, 2011; Batzolis et al., 2021; Arruda et al., 2026），条件化把主总体目标化为每个条件目标上的无条件均值流目标。记 $\Psi_{s\to t}^x$ 为 $\mathbf v^\ast$ 的 ODE 流、$\mathbf u^\ast$ 为其平均速度，定义为 $\Psi_{s\to t}^x(\mathbf z)=\mathbf z+(t-s)\mathbf u^\ast(\mathbf z,s,t,\mathbf x)$，对角值 $\mathbf u^\ast(\mathbf z,s,s,\mathbf x)=\mathbf v^\ast(\mathbf z,s,\mathbf x)$。

**假设。** (A1) 噪声：$\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$ 与 $(\mathbf z_0,\mathbf x)$ 独立，且 $\mathbb E\|\mathbf z_0\|^2<\infty$。(A2) 时刻对：$(s,t)$ 与 $(\mathbf z_0,\mathbf x,\boldsymbol\epsilon)$ 独立，其分布在 $(0,1)^2$ 上具有密度严格正、绝对连续的分量。(A3) 正则性：对 $p(\mathbf x)$-几乎每个 $\mathbf x$，条件目标 $p(\mathbf z_0|\mathbf x)$ 有密度，且 $\mathbf v^\ast(\cdot,\cdot,\mathbf x)$ 在状态与时间上连续可微、在状态上全局 Lipschitz 且关于 $[0,1]$ 一致。(A4) 可实现性：容许对 $(\mathbf u_\psi,\hat{\mathbf v}_\psi)$ 关于 $\mathbf x$ 联合可测、在状态与时间上连续可微、总体损失有限，并对所有条件同时包含精确对 $(\mathbf u^\ast,\mathbf v^\ast)$。

(A3) 给出贯穿两端点的全局连续可微流。对紧支撑或密度不连续的目标（如双月中的均匀先验），$\mathbf v^\ast$ 在 $t=0$ 附近一般不是 Lipschitz 的。对此类目标，下述论证在每个 $\delta>0$ 的 $[\delta,1]$ 上成立；对从 $t_0=\delta$ 开始的调度，给出略微平滑后目标 $\mathbf z_\delta=(1-\delta)\mathbf z_0+\delta\boldsymbol\epsilon$ 的密度，当 $\delta\to0$ 时收敛到目标。实践中我们不截断调度而保持 $t_0=0$，因为 $s=0$ 几乎必然不会被采样，且网络在 $s=0$ 的取值是小 $s$ 处拟合值的连续延拓。

**命题 1（条件均值流）。** 假设 (A1)–(A4) 成立，并设 $\mathcal L_{\mathrm{MF}}$ 未加权（$w=1$）。则每个总体极小化者对 $p(\mathbf x)$-几乎每个 $\mathbf x$ 都满足：对一切 $\mathbf z\in\mathbb R^d$、$s,t\in[0,1]$ 有 $\hat{\mathbf v}_\psi(\mathbf z,s,\mathbf x)=\mathbf v^\ast(\mathbf z,s,\mathbf x)$ 且 $\mathbf u_\psi(\mathbf z,s,t,\mathbf x)=\mathbf u^\ast(\mathbf z,s,t,\mathbf x)$。于是对每个调度 $0=t_0<\cdots<t_S=1$，复合映射 $T$ 等于 $\Psi_{0\to1}^x$，即一个把 $p(\mathbf z_0|\mathbf x)$ 输运到 $\mathcal N(\mathbf 0,\mathbf I)$ 的微分同胚，且 (9) 等于 $\log p(\mathbf z|\mathbf x)$。

**命题 1 的证明。** 令 $Y=\boldsymbol\epsilon-\mathbf z_0$、$\mathbf m=\mathbf v^\ast(\mathbf z_s,s,\mathbf x)$。由 (A1) 与 (A2)，$\mathbb E[Y|\mathbf z_s,s,t,\mathbf x]=\mathbf m$，且 (A1) 保证各项有限。主损失中的两个预测都是这些输入的函数，故条件期望分解给出

$$
\mathcal L_{\mathrm{MF}}=\left(1+\frac{1}{d}\right)\mathbb E\|Y-\mathbf m\|^2+\mathbb E\|\mathbf V_\psi-\mathbf m\|^2+\frac{1}{d}\mathbb E\|\hat{\mathbf v}_\psi-\mathbf m\|^2.
$$

由 (A4) 与均值流恒等式，精确对 $(\mathbf u^\ast,\mathbf v^\ast)$ 使后两项为零。因此每个极小化者在训练分布下几乎处处满足 $\hat{\mathbf v}_\psi=\mathbf V_\psi=\mathbf v^\ast$。对几乎每个条件，高斯插值在内部时刻具有满支撑；结合时刻对密度与连续性，可把等式延拓到所有状态与时刻。

固定这样一个条件与轨迹 $\mathbf z_\tau=\Psi_{s\to\tau}^x(\mathbf z)$。由于 $\hat{\mathbf v}_\psi=\mathbf v^\ast$，$\mathbf V_\psi$ 中的全导数沿该轨迹取，且对固定 $t$，

$$
\frac{\mathrm d}{\mathrm d\tau}\Phi_\psi(\mathbf z_\tau;\tau,t,\mathbf x)=\mathbf v^\ast(\mathbf z_\tau,\tau,\mathbf x)-\mathbf V_\psi(\mathbf z_\tau,\tau,t,\mathbf x)=0.
$$

由于 $\Phi_\psi(\mathbf z_t;t,t,\mathbf x)=\mathbf z_t$，得 $\Phi_\psi=\Psi^x$，从而 $\mathbf u_\psi=\mathbf u^\ast$，对角恒等式由连续性得出。由于 $\mathbf z_1=\boldsymbol\epsilon$，在 (A3) 下 $\mathbf v^\ast$ 的流把 $p(\mathbf z_0|\mathbf x)$ 输运到 $\mathcal N(\mathbf 0,\mathbf I)$（Lipman et al., 2023; Liu et al., 2022）。流复合给出对每个调度 $T=\Psi_{0\to1}^x$，变量替换给出 (9)。

精确流映射对每个条件（包括交换后的条件）都满足 $\Psi_{t\to s}^x\circ\Psi_{s\to t}^x=\mathrm{id}$，故精确对也使 $\mathcal L_{\mathrm{cyc}}=0$ 达到最小。因此加入 $\lambda\mathcal L_{\mathrm{cyc}}$ 不改变总体极小化者集合。对 $p>0$，权重 $w$ 通过残差依赖回归目标 $Y$，上述分解不再成立。此时自适应权重作为稳健损失对大残差降权（Geng et al., 2025），一般会改变学到的速度，但经验上似乎能稳定训练（见表 S2）。

### A.2 通过掩码实现边缘化

我们证明第 3.3 节的掩码目标针对保留目标坐标的边缘分布。对集合 $O\subseteq\{1,\dots,d\}$，记 $\mathbf z_O$ 为 $\mathbf z$ 的保留坐标，$\mathbf u_{\psi,O}$ 与 $\hat{\mathbf v}_{\psi,O}$ 为网络在 $O$ 上的输出。

**命题 2（通过掩码实现边缘化）。** 设非空掩码 $O\subseteq\{1,\dots,d\}$ 服从分布 $\pi$，且与 $(\mathbf z_0,\mathbf x,\boldsymbol\epsilon,s,t)$ 独立；设网络在 $O$ 上的输出只通过 $\mathbf z_O$ 依赖目标，并设未加权损失被限制在 $O$ 的坐标上。对每个 $\pi(O)>0$ 的边缘目标 $\mathbf z_{0,O}$ 假设 (A1)–(A3)，并对所有此类掩码同时假设 (A4)。则每个总体极小化者对每个 $\pi(O)>0$ 的 $O$ 与 $p(\mathbf x)$-几乎每个 $\mathbf x$ 都满足 $\hat{\mathbf v}_{\psi,O}=\mathbf v_O^\ast$ 且 $\mathbf u_{\psi,O}=\mathbf u_O^\ast$，其中 $\mathbf u_O^\ast$ 是 $\mathbf v_O^\ast(\mathbf z_O,s,\mathbf x)=\mathbb E[\boldsymbol\epsilon_O-\mathbf z_{0,O}|\mathbf z_{s,O}=\mathbf z_O,\mathbf x]$ 的平均速度。于是 (9)（基密度与 Jacobian 在 $|O|$ 维下评估）对每个调度都等于 $\log p(\mathbf z_O|\mathbf x)$。

**命题 2 的证明。** 对固定掩码，独立性使模拟分布不变，逐坐标插值为 $\mathbf z_{s,O}=(1-s)\mathbf z_{0,O}+s\boldsymbol\epsilon_O$（$\boldsymbol\epsilon_O\sim\mathcal N(\mathbf 0,\mathbf I_{|O|})$）。因此掩码主损失是边缘目标的条件均值流目标的正加权和。由 (A4) 的同时可实现性，精确对使每个求和项达到其下界，故每个极小化者都达到每一项。对 $\mathbf z_{0,O}$ 应用命题 1 即得结论。

附加的注意力限制只有在保持表示 $\mathbf v_O^\ast$ 及其平均速度的能力时才被覆盖。合成训练掩码的独立性由构造保证，不对观测数据强加缺失机制。边缘密度只使用观测坐标。对 $p>0$，残差从而权重 $w$ 只依赖保留坐标，故化归边缘目标仍然成立，但每个求和项此时具有附录 A.1 中讨论的加权极小化者。

## 附录 B 评估指标

所有实验都使用 10 个独立数据集，并报告以下指标在数据集上的均值与标准差。

**分类器双样本检验（C2ST）。** C2ST 通过分类任务比较两个分布（Lopez-Paz and Oquab, 2017）。若近似后验与参考后验重合，则没有分类器能比随机更好地分辨其抽样；而它们之间的任何差异都可被足够灵活的分类器利用。因此训练好的分类器在留出抽样上的精度 $\hat a$ 度量两个分布的可区分程度：$\hat a=0.5$ 表示不可区分，$\hat a=1$ 表示完全可分。我们给近似抽样标为 1、参考抽样标为 0，不放回地把两组子采样到相同规模（在每个实验内对所有方法与步数固定），对合并抽样标准化，并用二元交叉熵训练分类器 $c(\boldsymbol\theta)\in(0,1)$。分类器是带两个残差隐层的 MLP，$D$ 维抽样时宽度 $2\lceil\log_2(10D)\rceil$，Mish 激活、dropout 0.1、sigmoid 输出单元。用 AdamW 训练（学习率 $5\times10^{-4}$ 带线性预热与余弦衰减，权重衰减 $5\times10^{-3}$，梯度范数裁剪 1.5），批大小 128，最多 100 轮，在 20% 训练数据上早停（耐心 5）。分类器 $c(\boldsymbol\theta)$ 在留出抽样上的精度按 5 折交叉验证平均。

**网格密度指标。** 在双月上，我们在先验支撑上的 $512\times512$ 中点网格（单元面积 $\Delta A$）上评估精确后验 $p$ 与每个学习密度 $q$。我们报告学习密度的总质量 $M=\sum_j q_j\Delta A$，并在把两者归一化为网格单元概率 $\tilde p_j,\tilde q_j$ 后比较其形状：

$$
\mathrm{KL}=\sum_j\tilde p_j\log\frac{\tilde p_j}{\tilde q_j},\qquad H=\left(\frac12\sum_j\left(\sqrt{\tilde p_j}-\sqrt{\tilde q_j}\right)^2\right)^{1/2}.
$$

当学习密度在精确后验有质量处为零时，Hellinger 距离 $H\in[0,1]$ 保持有限，而 KL 散度变为无穷。

**归一化 RMSE 与覆盖率。** 对后验抽样 $\hat{\boldsymbol\theta}^{(l)}$（$l=1,\dots,L$）与 $D$ 维生成参数 $\boldsymbol\theta^\ast$，计算

$$
\mathrm{NRMSE}=\left(\frac{1}{LD}\sum_{l=1}^{L}\sum_{j=1}^{D}\left(\frac{\hat\theta_j^{(l)}-\theta_j^\ast}{r_j}\right)^2\right)^{1/2},
$$

其中 $r_j$ 是参数 $j$ 的先验范围。覆盖率是生成值落在 95% 中心可信区间内的参数比例。

**后验收缩。** 我们把后验收缩定义为从先验到后验的方差相对降低量：

$$
\mathrm{Contraction}=1-\frac{1}{D}\sum_{j=1}^{D}\frac{\mathrm{Var}_{\mathrm{post}}(\theta_j)}{\mathrm{Var}_{\mathrm{prior}}(\theta_j)},
$$

它度量数据降低先验不确定性的程度，但不度量后验是否正确。

**TARP。** TARP 直接从训练好的估计器估计随机参考点周围可信区域的期望覆盖率（Lemos et al., 2023），无需 MCMC 或参考后验。我们报告 TARP 曲线与对角线之间的面积（ATC；0 为已校准）以及 Kolmogorov–Smirnov 检验的 p 值，使用 2000 个验证对（分为 10 折、每折 200 对、每对 200 次抽样）（表 S1）。在双月上，TARP 评估学习到的后验；其他实验评估学习到的似然是否生成已校准数据。

> **表 S1（原文 Table S1）：** 每个训练估计器的 TARP 校准。TARP 曲线与对角线之间的面积（ATC；0 为已校准，正值为过度分散），10 折、每折 200 个先验预测验证对（共 2000 对、每对 200 次抽样）的均值（标准差）。双月校准后验；g-and-k、更新过程与 DDM 校准似然。† 标记 Kolmogorov–Smirnov p 值低于 0.01 的方法；每个实验中 ATC 最接近零者加粗。

| 实验 | 方法 | ATC |
|---|---|---|
| 双月 | 归一化流 | −0.008（0.019） |
| 双月 | 均值流，$S=1/S=2/S=32$ | −0.001（0.010）/ +0.007（0.011）/ +0.008（0.011） |
| 双月 | 一致性模型，$S=1/S=2/S=32$ | +0.102（0.011）† / +0.113（0.011）/ +0.001（0.014） |
| 双月 | 均值流（v-head），Euler $S=1/S=2/S=32$ | −0.179（0.013）† / −0.134（0.015）/ −0.007（0.012） |
| 双月 | 流匹配，Euler $S=1/S=32$ | −0.176（0.011）† / −0.004（0.014） |
| 双月 | 均值流（v-head）/流匹配，自适应 | −0.007（0.012）/ +0.000（0.011） |
| g-and-k | 均值流，$S=1/S=8$ | −0.004（0.012）/ −0.009（0.011） |
| g-and-k | 归一化流 | +0.001（0.011） |
| g-and-k | 流匹配，Euler $S=200$ | +0.004（0.007） |
| 更新过程 | 均值流，掩码 Transformer | −0.025（0.013） |
| 更新过程 | 归一化流，哨兵值 | +0.130（0.011）† |
| DDM | 均值流，$S=1/S=8$ | −0.003（0.009）/ −0.006（0.013） |
| DDM | 流匹配，Euler $S=200$ | −0.003（0.016） |

**后验预测检查。** 对 DDM，我们为 200 个后验抽样各模拟一个重复数据集，把观测选择比例、条件响应时间分位数（10、30、50、70、90%）与超时率 $T$ 同其重复分布比较。对每个摘要，计算偏差 $z=(T(\mathbf y_{\mathrm{obs}})-\bar T_{\mathrm{rep}})/\mathrm{sd}(T_{\mathrm{rep}})$ 与预测 p 值 $P(T(\mathbf y_{\mathrm{rep}})\ge T(\mathbf y_{\mathrm{obs}}))$，并报告各摘要中最大的 $|z|$。

**收敛诊断。** 沿用 Vehtari et al. (2021) 计算分裂 $\hat R$ 与 bulk ESS。若 $\max\hat R\le1.05$、最小 bulk ESS 至少 100 且至少保留 500 个抽样，则运行通过收敛准则。报告的均值与标准差包含未通过这些准则的运行。

## 附录 C 架构、训练与超参数搜索

所有网络与诊断都在 BayesFlow 2.0.14 中实现（Radev et al., 2023; Kühmichel et al., 2026），我们在其中把条件均值流作为附加推断网络加入。

**架构。** *均值流：* 5 个隐层、宽度 256 的 MLP。条件 $\mathbf x$ 经线性层嵌入，在输入端与目标 $\mathbf z$ 拼接，并与时间对 $(s,s-t)$ 的尺度 0.3 Fourier 嵌入一起调制每个残差块（Perez et al., 2018）。辅助速度头共享除最后两层外的全部层。*掩码 Transformer：* 5 个块、宽度 128、四个注意力头的 Transformer（Peebles and Xie, 2023）。它对每个观测与参数做 token 化，并通过自适应层归一化接收时间对 $(s,s-t)$。训练时，每次模拟的每个观测以概率 0.3 独立丢弃，且每个批重新抽取；被丢弃 token 从注意力与损失中排除。因果掩码进一步把每个观测 token 限制在其自身时间步及之前的参数与观测 token 上。速度头从最后两个块分支并使用相同掩码。每个观测与参数 token 都接收其坐标索引（观测的坐标索引即时间步）的学习嵌入，仅时间对使用 Fourier 嵌入。*一致性模型：* 连续时间一致性模型（Lu and Song, 2025），6 个隐层、宽度 256 的 MLP。*流匹配：* 与均值流同深度同宽度、但无速度头的 MLP。*归一化流：* 样条耦合流（Durkan et al., 2019），5 个耦合层各含 2 个宽度 256 的隐层；更新过程应用改用 2 个耦合层各含 2 个宽度 128 的隐层。

**训练。** 我们在标准化参数与观测上离线训练所有网络，批大小 256，使用 AdamW、权重衰减 $5\times10^{-3}$、梯度范数裁剪 1.5，学习率在最初 5% 步数内从 $5\times10^{-5}$ 线性预热到 $5\times10^{-4}$，随后按余弦计划衰减到零。双月与 DDM 用 50,176 次模拟，g-and-k 用 100,000 次，更新过程用 8192 次以在有限数据下比较架构，另有 1024 次模拟用于验证。条件均值流、一致性模型与流匹配模型训练 1000 轮，归一化流训练 200 轮并使用早停（耐心 10）。

**超参数搜索。** 我们用 Optuna 在双月与均匀先验的三维高斯线性任务变体上搜索条件均值流的训练超参数（Akiba et al., 2019）。表 S2 列出搜索空间与选中值，所有实验都使用该配置。训练时刻取 $s=u_s^{1+\alpha}$、$t=u_t^{1+\alpha}$（$u_s,u_t\sim\mathcal U(0,1)$）；对不共享的 $0$ 层，速度头从边界情形 $\mathbf u_\psi(\mathbf z,s,s,\mathbf x)$ 读取速度。每个试验在每个基准上训练一个网络 250 轮（每轮 100 个新模拟批次、批大小 256），并用 $S=4$ 步在 256 个留出数据集（每个 500 次后验抽样）上评估。某基准的得分为精度项、校准误差与到精确后验的网格 Hellinger 距离之和。精度项在双月上为 $2(\mathrm{C2ST}-0.5)$，在高斯任务上为 NRMSE；校准误差为 20 个水平上中心可信区间名义覆盖率与经验覆盖率之差的中位数绝对值。C2ST 在 15 个、Hellinger 距离在 3 个留出数据集上平均。搜索用 Optuna 的多元树结构 Parzen 估计器在 200 次试验中最小化两个基准得分之和（Akiba et al., 2019）。

> **表 S2（原文 Table S2）：** 条件均值流的超参数。Optuna 搜索的搜索空间与所有实验使用的选中配置。

| 超参数 | 搜索空间 | 选中值 |
|---|---|---|
| 循环权重 $\lambda$（对数） | [1, 100] | 2.5 |
| $\mathcal L_{\mathrm{cyc}}$ 中替换条件的概率 | [0, 0.8] | 0.6 |
| $t=s$ 的时刻对比例 | [0.2, 0.8] | 0.7 |
| 自适应权重的指数 $p$ | {0, 0.25, 0.5, 0.75, 1} | 0.25 |
| 自适应权重的偏移 $c$（对数） | $[10^{-5},1]$ | 0.1 |
| Fourier 时间嵌入尺度（对数） | [0.02, 30] | 0.3 |
| 训练时刻的指数 $\alpha$ | [−0.5, 4] | 0.5 |
| 速度头不共享的最后层数 | {0, …, 5} | 2 |
| 速度头上的自适应权重 | {是, 否} | 否 |

**采样调度。** 对双月，我们分别对每个步数用 3 个留出观测上的 2000 次抽样的 C2ST 调节一致性模型与均值流的采样调度。对一致性模型，从 $\rho\in\{1,2,3,3.5,5,7,10\}$ 中选择离散化指数。对均值流，用 7 次 Optuna 试验在 $\rho\in[1,10]$ 与 $\sigma_{\min}\in[10^{-6},10^{-1}]$（对数均匀）上优化 EDM 调度 $(\rho,\sigma_{\min})$，候选数与一致性模型相同。表 S3 列出选中的调度。$S=1$ 时调度固定。其他所有实验取 $\rho=7$、$\sigma_{\min}=0.001$。

> **表 S3（原文 Table S3）：** 在双月上选出的采样调度。一致性模型的离散化指数 $\rho$ 与条件均值流每个步数 $S$ 的 EDM 调度 $(\rho,\sigma_{\min})$，在留出观测上调节；$S=1$ 时调度无自由参数。为显示选择的重要性，我们报告选中候选与 7 个候选中最差者的调节 C2ST（3 个留出观测，每个 2000 次抽样）。

| 项目 | $S=2$ | $S=4$ | $S=8$ | $S=16$ | $S=32$ |
|---|---|---|---|---|---|
| 一致性模型 $\rho$ | 1 | 2 | 3 | 3.5 | 3.5 |
| C2ST，选中 | 0.918 | 0.542 | 0.555 | 0.539 | 0.535 |
| C2ST，最差 | 0.973 | 0.975 | 0.946 | 0.700 | 0.666 |
| 均值流 $\rho$ | 4.54 | 3.82 | 4.12 | 8.34 | 7.42 |
| 均值流 $\sigma_{\min}$ | $1.1\times10^{-4}$ | $4.9\times10^{-2}$ | $5.7\times10^{-5}$ | $7.0\times10^{-2}$ | $2.0\times10^{-3}$ |
| C2ST，选中 | 0.502 | 0.504 | 0.509 | 0.505 | 0.507 |
| C2ST，最差 | 0.513 | 0.519 | 0.519 | 0.517 | 0.521 |

**代码。** 所有实验的代码与配置在 MIT 许可下公开于 https://anonymous.4open.science/r/MeanFlow-AISTAST。代码用 Python 3.14 编写，所有网络都是 Keras 3.15.1（Chollet et al., 2015）在 JAX 0.11.1 后端（Bradbury et al., 2018）上的模型，二者均为 Apache 2.0 许可。除 BayesFlow（MIT）外，我们基于 PyMC 5.28.5（Apache 2.0）（Salvatier et al., 2016）与 nutpie 0.16.11（MIT）（Seyboldt et al., 2026）做 MCMC，ArviZ 0.23.4（Apache 2.0）（Martin et al., 2026）做收敛诊断，Optuna 4.9.0（MIT）（Akiba et al., 2019）做超参数搜索。

**计算环境。** 我们在使用八个 CPU 核与一块 40 GB 显存 NVIDIA A100 GPU 的计算集群上完成全部分析。集群采用 AMD EPYC 7F72 CPU（主频最高 3.2 GHz）与 50 GB 内存。

## 附录 D MCMC 采样器

**NUTS。** 我们通过 PyMC（Salvatier et al., 2016）在 JAX 后端（Bradbury et al., 2018）使用 nutpie 的 NUTS 实现（Seyboldt et al., 2026）采样：4 条链、对角质量矩阵、最大树深 10 与 nutpie 默认目标接受率。除 g-and-k（预热为各方法请求抽数的 25%）外，使用默认 400 次预热。

**g-and-k 上的预算。** 密度代价为 $K$ 次网络评估的方法每链请求 $8000/K$ 个抽样，使"请求抽样数 × 每次密度网络评估数"之积跨方法恒定。归一化流按 $K=1$ 计。对延迟接受 MCMC，每链请求迭代数为 $96,000/(JS_c+100)$，其中考虑了每次迭代的 $J=5$ 次粗评估与一次细评估。预算按请求抽数设定而忽略每抽的 leapfrog 步数（各方法不同），故实际网络评估数会有差异。我们对网络对单个 $(\mathbf z,\mathbf x)$ 的一次前向传播计一次网络评估：归一化流每次密度一次评估，$S$ 步均值流为 $S$ 次，用 $S$ 个 Euler 步积分的速度场为 $S$ 次，固定步长 Tsit5 积分为每步 7 次。Jacobian、散度与梯度在这些前向之外用自动微分获得，不计入评估数，其代价反映在实际耗时中。

**延迟接受 MCMC。** 我们实现两级延迟接受 MCMC（Christen and Fox, 2005）与 Lykkegaard et al. (2023) 的子链。对任意粗后验 $\pi_{\mathrm c}$，其不变分布为细后验 $\pi_{\mathrm f}$（第 3.2 节）。两级使用同一训练网络：粗层用 $S_c\in\{1,2,4,8\}$ 步的均值流评估，细层用固定步长 100 个 Tsit5 步及其精确散度 (1) 积分其速度头。每次迭代在 $\pi_{\mathrm c}$ 上运行 $J=5$ 步随机游走 Metropolis 子链（沿用 Lykkegaard et al., 2023），并用接受概率 (11) 把其终点提议给细层。随机游走对每个参数以先验宽度的 10% 初始化步长，并加全局尺度。落在先验支撑外的提议直接拒绝、不评估网络。若子链未移动，提议等于当前状态，直接接受而不评估细似然。自适应占请求迭代的 25% 并被丢弃；自适应期间用 Robbins–Monro 更新把全局尺度推向 0.3 的粗接受率，并在后半段把步长更新为所访问状态的边缘标准差，随后固定提议。我们运行从先验抽样启动的 4 条链。

## 附录 E 逐实验细节

### E.1 双月

先验为 $\boldsymbol\theta\sim\mathcal U(-1,1)^2$，前向模型为

$$
a\sim\mathcal U(-\pi/2,\pi/2),\quad r\sim\mathcal N(0.1,0.01^2),\qquad
\mathbf y=\binom{r\cos a+0.25}{r\sin a}+\binom{-|\theta_1+\theta_2|/\sqrt2}{(-\theta_1+\theta_2)/\sqrt2},
$$

其折叠使后验在 $(\theta_1,\theta_2)\mapsto(-\theta_2,-\theta_1)$ 下不变，产生两个新月形模态（Greenberg et al., 2019）。由于密度有闭式且前向模型可逆，我们对每个观测抽取 32,000 个精确独立同分布参考样本。第一个数据集使用典型观测 $\mathbf y=(0,0)$，其余九个使用先验预测抽样。

### E.2 g-and-k

g-and-k 分布由其在正态分数空间中的分位函数定义（Rayner and MacGillivray, 2002）：

$$
W(z;g,k)=\left(1+0.8\tanh(gz/2)\right)\left(1+z^2\right)^k z,\qquad z\sim\mathcal N(0,1),
$$

且没有闭式密度。由于 $k\ge0$ 时 $W$ 严格递增，我们用二分法求逆，从而由变量替换得到精确对数密度。我们在正态分数空间用相关 $\rho$ 的高斯 copula 耦合两个坐标，使两个边缘都服从 g-and-k 分布。先验为 $g\sim\mathcal U(-1,1)$、$k\sim\mathcal U(0,0.5)$、$\rho\sim\mathcal U(-0.9,0.9)$，每个数据集由从先验抽取的参数模拟 $N=50$ 个观测组成。我们从精确对数后验上的自适应随机游走 Metropolis 集合为每个数据集获得 32,000 个参考抽样（8 条链、5000 次自适应迭代、40,000 个抽样按 10 抽一、$\hat R\le1.05$、ESS$\ge400$）。

### E.3 疫情更新过程

在 $T=128$ 步的网格上（前 $n_0=5$ 步以发病率 $I_1=\cdots=I_{n_0}=10$ 播种且不被观测），对 $t>n_0$ 的更新模型为

$$
\Lambda_t=\sum_{s=1}^{15}w_sI_{t-s},\qquad I_t=R_t\Lambda_t\exp\left(\sigma_p\varepsilon_t-\frac12\sigma_p^2\right),\qquad y_t=\log I_t+\sigma_o\eta_t,
$$

其中 $\varepsilon_t,\eta_t\sim\mathcal N(0,1)$，$\sigma_p=\sigma_o=0.05$，$w$ 是均值 5.0、标准差 2.5 的 Gamma 密度（Fraser, 2007; Cori et al., 2013）。这是 Cori et al. (2013) 的更新方程，世代间隔离散化并在 15 步处截断。观测为 $(y_{n_0+1},\dots,y_T)$，故 $d=123$。参数是白化系数向量 $\mathbf z\in\mathbb R^{128}$，$\log\mathbf R=\mathbf L\mathbf z$，其中 $\mathbf L\mathbf L^\top$ 是长度尺度 2.5、边缘标准差 0.4、带 $10^{-6}$ 岭项的平方指数核（Rasmussen and Williams, 2005）。因此先验恰为 $\mathbf z\sim\mathcal N(\mathbf 0,\mathbf I)$。由于 $\mathbf L$ 下三角，$z_s$ 只对 $t\ge s$ 的 $\log R_t$ 有贡献；又因递推沿时间前向进行，$y_t$ 不依赖 $s>t$ 的 $z_s$。掩码 Transformer 的因果注意力掩码（附录 C）正是编码该结构。观测在每个时间步分别标准化。

我们以概率 0.3 独立扣留每个被观测步，并为每个数据集抽取新模式。由于该机制与过程及参数独立，数据完全随机缺失，后验只需观测项 $O$ 的边缘似然 $p(\mathbf y_O|\mathbf z)$（Little and Rubin, 2019）。掩码 Transformer 在完整模拟上训练、按相同缺失率对每次模拟的每个观测独立抽掩码，从而为每种模式学习该边缘。归一化流则按 Wang et al. (2024) 在缺失项用哨兵 $-1$ 对向量建模。

### E.4 认知模型

一个试次是漂移为 $\nu$ 的 Wiener 过程，从 $\beta a$ 出发（固定相对起点 $\beta=0.5$），在首次触及 0 或 $a$ 时终止。响应时间加非决策时间 $t_0$，试次在 10 s 后超时。先验为 $\nu\sim\mathcal U(-3,3)$、$a\sim\mathcal U(0.8,2)$、$t_0\sim\mathcal U(0.1,0.4)$，我们用 Euler–Maruyama 以 $\mathrm dt=10^{-4}$ 模拟。网络观测带符号响应时间 $y=(2c-1)t$（上边界对应 $c=1$），它与响应时间–选择对双射。由于非决策时间不能超过最快观测响应时间，我们在该上界以下采样，而上界随试次增加而收紧。每个数据集内试次数嵌套，每个设置在默认预热后保留 $4\times1000$ 个 NUTS 抽样。对首个试次数 $N=4$，链从先验支撑中心以 PyMC 默认抖动启动；后续试次数的链从前一试次数的后验中位数启动（裁剪到当前 $t_0$ 支撑），每条链独立抖动。

## 附录 F 附加图与表

> **表 S4（原文 Table S4）：** 双月上的密度指标。各学习后验密度相对精确后验在先验上 $512\times512$ 网格的总质量、KL 散度与 Hellinger 距离；10 个独立数据集的均值（标准差）。每列最优值加粗，质量一列取最接近 1 者。

| 方法 | 步数 | 质量 | KL | Hellinger |
|---|---|---|---|---|
| 归一化流 | $S=1$ | 0.977（0.055） | 0.446（0.073） | 0.383（0.023） |
| 均值流 | $S=1$ | 1.066（0.017） | 0.347（0.137） | 0.322（0.052） |
| 均值流 | $S=2$ | 1.045（0.030） | 0.179（0.077） | 0.230（0.042） |
| 均值流 | $S=8$ | 1.085（0.093） | 0.165（0.053） | 0.219（0.050） |
| 均值流 | $S=32$ | **1.003（0.025）** | 0.160（0.052） | 0.169（0.027） |
| 均值流（v-head）Euler | $S=1$ | $7.2\times10^{39}$（$2.3\times10^{40}$） | 73.2（19.0） | 1.000（0.000） |
| 均值流（v-head）Euler | $S=8$ | 57.3（45.5） | 4.10（1.20） | 0.902（0.076） |
| 均值流（v-head）Euler | $S=32$ | 1.783（0.077） | 0.385（0.033） | 0.363（0.020） |
| 均值流（v-head）自适应 | $S=311$ | 0.993（0.016） | **0.031（0.013）** | **0.087（0.017）** |
| 流匹配 Euler | $S=1$ | $5.5\times10^{23}$（$1.7\times10^{24}$） | 37.8（9.5） | 1.000（0.001） |
| 流匹配 Euler | $S=32$ | 1.825（0.073） | 0.271（0.021） | 0.304（0.017） |
| 流匹配自适应 | $S=302$ | 0.991（0.023） | 0.048（0.019） | 0.117（0.016） |

> **图 S1（原文 Fig. S1）：** 双月上样本与密度质量随步数的变化。(A) 相对参考后验的 C2ST 随均值流步数 $S$ 的变化（0.5 表示样本不可区分）。(B) 学习密度相对精确后验在 $512\times512$ 网格上的 Hellinger 距离。曲线为 10 个独立数据集的均值，条带为标准差。

> **表 S5（原文 Table S5）：** 组合 DDM 试次似然，按方法与试次数。相对生成参数的 NRMSE、95% 中心区间覆盖率、最小 bulk ESS、发散转移与最差预测偏差；10 个独立数据集的均值（标准差）。

| 方法 | $N$ | NRMSE | 覆盖率 95% | 最小 ESS | 发散数 | $\max_k\lvert z_k\rvert$ |
|---|---|---|---|---|---|---|
| 均值流 $S=1$ | 4 | 0.268（0.079） | 0.90（0.16） | 1,396（312） | 1.0（1.9） | 0.73（0.14） |
| 均值流 $S=1$ | 16 | 0.161（0.033） | 0.90（0.16） | 1,174（378） | 6.6（11.5） | 0.90（0.30） |
| 均值流 $S=1$ | 64 | 0.102（0.028） | 0.90（0.16） | 1,205（186） | 2.4（4.0） | 1.13（0.47） |
| 均值流 $S=1$ | 256 | 0.070（0.019） | 0.60（0.31） | 1,146（335） | 7.8（21.7） | 2.15（1.03） |
| 均值流 $S=2$ | 256 | 0.061（0.016） | 0.73（0.21） | 1,094（335） | 0.6（1.6） | 1.93（0.77） |
| 均值流 $S=4$ | 256 | 0.066（0.018） | 0.77（0.27） | 503（620） | 50.7（50.1） | 2.02（0.77） |
| 均值流 $S=8$ | 256 | 0.064（0.023） | 0.70（0.29） | 513（504） | 31.8（29.0） | 1.99（0.83） |
| 流匹配 Euler $S=200$ | 4 | 0.267（0.081） | 0.90（0.16） | 1,279（228） | 0.3（0.7） | 0.72（0.13） |
| 流匹配 Euler $S=200$ | 16 | 0.151（0.032） | 0.90（0.16） | 1,285（270） | 0.1（0.3） | 0.88（0.22） |
| 流匹配 Euler $S=200$ | 64 | 0.099（0.031） | 0.87（0.23） | 1,127（228） | 0.0（0.0） | 1.03（0.57） |
| 流匹配 Euler $S=200$ | 256 | 0.067（0.033） | 0.70（0.33） | 1,275（329） | 0.1（0.3） | 1.79（0.57） |

> **表 S6（原文 Table S6）：** g-and-k 上预算匹配的 MCMC。除流匹配基线外，每种方法共享"请求抽样数 × 每次密度网络评估数"的同一预算。前向传播的实际总量：NUTS 各臂为 $0.9$–$2.0\times10^7$，延迟接受 MCMC 为 $1.0$–$1.4\times10^8$。10 个独立数据集的均值（标准差）；最小 ESS 与 C2ST 的最优值加粗。

| 方法 | 步数 | 抽样数 | 最小 ESS | C2ST |
|---|---|---|---|---|
| 均值流 $S=1$ | 1 | 32,000 | **10,498（1,552）** | 0.604（0.049） |
| 均值流 $S=2$ | 2 | 16,000 | 4,856（939） | 0.587（0.046） |
| 均值流 $S=4$ | 4 | 8,000 | 2,436（708） | **0.577（0.039）** |
| 均值流 $S=8$ | 8 | 4,000 | 1,143（476） | 0.599（0.030） |
| 归一化流 | 1 | 32,000 | 8,023（3,169） | 0.679（0.078） |
| 流匹配 Euler $S=200$ | 200 | 4,000 | 1,270（331） | 0.614（0.048） |
| 延迟接受 MCMC，$S_c=1$ | 100 | 3,656 | 642（246） | 0.592（0.031） |
| 延迟接受 MCMC，$S_c=2$ | 100 | 3,492 | 649（200） | 0.594（0.030） |
| 延迟接受 MCMC，$S_c=4$ | 100 | 3,200 | 581（133） | 0.595（0.033） |
| 延迟接受 MCMC，$S_c=8$ | 100 | 2,744 | 544（157） | 0.599（0.033） |

> **图 S2（原文 Fig. S2）：** 各实验中每种方法的实际耗时。各方法的实际耗时（对数尺度）、10 个数据集的均值：(A) 双月采样（5000 次抽样）；(B) 共享预算下的 g-and-k MCMC，流匹配基线在预算之外；(C) 等抽样数下的更新过程 MCMC；(D) DDM 每个试次数的 MCMC。

> **图 S3（原文 Fig. S3）：** 一个数据集上、跨试次数的组合 DDM 后验。行为 $N\in\{4,16,64,256\}$；列为 (A) 漂移 $\nu$、(B) 边界间隔 $a$ 与 (C) 非决策时间 $t_0$ 的边缘，分别给出 $S=1$、$S=8$ 与 200 步基线；生成参数为虚线，采样的 $t_0$ 上界为点线。(D) 带符号响应时间的后验预测 CDF（条带为 200 次重复的均值 ± 一个标准差）对照观测试次；展示 10 个数据集之一。

> **图 S4（原文 Fig. S4）：** 步数对 DDM 推断的影响。(A) NRMSE 随均值流步数 $S$ 的变化，每个试次数 $N$ 一条线，200 Euler 步流匹配基线为虚线。(B) 每个数据集内按收敛设置中的 NRMSE 选出的步数随试次数 $N$ 的变化。(C) 最小 bulk ESS 随 $S$ 的变化，基线为点划线。曲线为 10 个独立数据集的均值，条带为标准差。

> **图 S5（原文 Fig. S5）：** 更新过程模型的观测以及每种方法所看到的内容。(A) 观测：某一参数下的四条对数发病率曲线，其后为前几步的潜变量 $\log I_t$，播种步以阴影示出，在 128 步网格上给出 123 个观测值。(B) 生成它们的再生数，对照 $R=1$ 线与先验 90% 区间，以与生成轨迹比较。(C) 在某个 30% 缺失模式下每种方法所接收的同一曲线：掩码 Transformer 只接收观测坐标，归一化流接收带哨兵值的向量。

## 图注与表注索引

本页图 1–4 与图 S1–S5 的中文图注、表 1 与表 S1–S6 的表注均按原文出现位置内联在正文与附录中，此处不重复罗列。原文为 Typst 单栏排版，图以浮动方式放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2610.21657v1 全文（23 页）的中文译稿：摘要、第 1–5 节正文、图 1–4 与图 S1–S5 的中文图注、表 1 与表 S1–S6 的逐格转写、命题 1–2 与证明、附录 A–F（证明、评估指标、架构与超参搜索、MCMC 采样器、逐实验细节、附加图表），以及参考文献英文原条目（按原文顺序）。公式与表格已对照 PDF 渲染页核对：式 (1)–(11) 逐式核对；表 1 用第 7 页渲染图逐格核对（NRMSE/RMSE/ESS/leapfrog 步数/耗时的均值与标准差、以及"归一化流快 22 倍"的关系全部一致）；表 S1–S6 按原文附录表格数据转写并核对列结构。原文疑点：表 S3 的"一致性模型 $\rho$"行在 $S=2$ 处取 1、而正文称一致性模型离散化指数候选含 1–10，二者一致；本轮核对未发现需单独加注的明确数值矛盾。本页不上传原文图片，图 1–4 与图 S1–S5 的可视化数值不作数字化估算；正文与表格中的实验数值按原文转写。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
