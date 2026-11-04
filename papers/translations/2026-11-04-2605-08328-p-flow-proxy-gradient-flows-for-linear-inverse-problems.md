---
layout: page
title: "P-Flow：面向线性逆问题的代理梯度流｜中文全文译文"
permalink: /papers/translations/2026-11-04-2605-08328-p-flow-proxy-gradient-flows-for-linear-inverse-problems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/aa0a8273e3a452db/) · [原文 arXiv](https://arxiv.org/abs/2605.08328/) · [全部目录](/papers/catalog/)

# P-Flow：面向线性逆问题的代理梯度流

**原题：** P-Flow: Proxy-gradient Flows for Linear Inverse Problems  
**作者：** Zehua Jiang\*、Fenghao Zhu\*、Xinquan Wang、Chongwen Huang、Zhaoyang Zhang（浙江大学 Zhejiang University，杭州，中国；\* 表示同等贡献 Equal contribution；按 PDF 首页原样转写）  
**版本：** arXiv:2605.08328v3，[cs.LG]，2026-07-31；24 页；预印本/状态未确认（PDF 标注 Preprint）。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–7 节（§1 引言、§2 背景与 §2.1–2.3、§3 方法与 §3.1–3.3、§4 相关工作、§5 数值结果与 §5.1–5.2、§6 结论、§7 局限性）、式 (1)–(16) 与附录式 (17)–(30)、算法 1–2、表 1–10 逐格转写、图 1–14 图注、附录 A–F（含 Appendix C 球面投影消融 C.1–C.5）、参考文献 [1]–[42] 英文原条目；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

## 摘要

基于流匹配（flow matching）的生成模型已成为求解逆问题的有力范式，相比扩散模型具有更直的轨迹与更快的采样。然而现有方法往往需要沿展开（unrolled）路径做反向传播求导，导致数值不稳定与难以承受的计算开销。为此我们提出 **P-Flow**，一个通过对源点（source point）施加**代理梯度（proxy gradient）**更新来稳定重建过程的框架。该做法有效规避了长链求导带来的数值不稳定与显存开销。为保证与先验分布一致，我们采用受高维空间**测度集中（concentration of measure）**现象启发的**高斯球面投影（Gaussian spherical projection）**。我们进一步基于贝叶斯理论与 Lipschitz 连续性为 P-Flow 给出理论分析。在多种复原任务上的实验表明，P-Flow 具有有竞争力的性能，在严重病态条件与高测量噪声等极端退化情形下尤为突出。

## 1 引言

求解线性逆问题是高维信号处理与机器学习中的核心挑战。其目标是由退化或不完整的观测 \(y\in\mathbb R^m\) 重建潜在信号 \(x\in\mathbb R^n\)。在计算成像语境下，该任务通常被称为图像复原（image restoration），并通常形式化为：

$$
y=Hx+n,\tag{1}
$$

其中 \(H:\mathbb R^n\to\mathbb R^m\)（\(m\le n\)）表示线性算子，\(n\) 表示来自任意分布的加性噪声——通常建模为白高斯噪声 \(\mathcal N(0,\sigma^2\mathbf I)\)。由于 \(H\) 病态或秩亏，该问题本质上是欠定的，需要关于自然图像分布 \(p_X\) 的先验知识才能实现高保真重建。

传统上，该挑战通过最小化如下形式的目标函数来解决：

$$
\widehat x=\arg\min_x\ \mathcal L(x,y)+\lambda\mathcal R(x),\tag{2}
$$

其中损失 \(\mathcal L\) 保持数据保真，\(\mathcal R(x)\) 是先验的正则项，例如全变差（total variation）[1] 或小波稀疏性 [2]。从贝叶斯视角看，该最小化等价于最大后验（maximum a posteriori, MAP）估计，后者由贝叶斯公式导出：

$$
\widehat x=\arg\max_{x\in\mathbb R^n}\log p(x\mid y)=\arg\min_{x\in\mathbb R^n}-\log p(y\mid x)-\log p(x),\tag{3}
$$

其中 \(p(y\mid x)\) 是由退化模型决定的似然，\(p(x)\) 表示自然图像的先验分布。

早期方法依赖手工设计的先验，而深度学习的发展使有监督的“任务专用”网络 [3, 4] 可以直接学习从 \(y\) 到 \(\widehat x\) 的映射。然而这类模型缺乏灵活性，且对于与训练阶段假设存在差异的推理期退化往往泛化很差 [5]。为克服这一点，出现了即插即用（Plug-and-Play, PnP）[6] 与去噪正则化（regularization by denoising, RED）[7] 等零样本（zero-shot）方法。这些框架把预训练生成模型作为隐式图像先验嵌入迭代优化框架，从而有效绕过了任务专用重训练的需求。

借助生成先验，去噪扩散概率模型（denoising diffusion probabilistic models, DDPMs）[8, 9] 通过逆转渐进高斯加噪过程并逼近得分函数 \(\nabla_x\log p(x)\) 来充当表达能力强的先验。扩散后验采样（diffusion posterior sampling, DPS）[10] 与伪逆引导扩散模型（pseudoinverse-guided diffusion models, \(\Pi\)GDM）[11] 等方法引入梯度引导，把扩散采样过程推向测量一致性。然而这些方法往往需要大量函数评估 [12]，且可能对扩散路径的随机性敏感。为提升效率，**流匹配（flow matching, FM）**[13] 提供了有竞争力的范式：FM 模型学习一个向量场 \(v_t\)，它定义了一条在源分布与数据流形之间的常微分方程（ordinary differential equation, ODE）轨迹。使用更直的概率路径（例如由最优传输（optimal transport, OT）导出的路径）[13, 14]，FM 能够实现更快的采样与更稳定的确定性轨迹。然而，把这些流引导到测量一致性仍然困难 [15]，因为朴素的梯度校正会把样本拉离数据流形。为此，近期工作把 FM 整合进 PnP 与贝叶斯框架：PnP-Flow [16] 把 FM 用作时间相关的去噪器，以绕过昂贵的 ODE 反向传播；同时 Flower [17] 通过贝叶斯祖先采样（ancestral-sampling）视角统一了 PnP 与生成式求解器，在目标估计与测量精化之间交替。这些方法主要利用后验采样式引导。另一条范式——**潜源优化（latent source optimization）**——通过寻找生成目标重建的最优潜在源，在高保真复原上显示出潜力（D-Flow [18]）。然而其在 FM 框架内的实现面临一个显著障碍：源优化需要在展开轨迹上穿越一长串神经网络前向传播求导，这条链的深度会引发梯度不稳定，并带来过高的显存与时间需求。

为应对这些挑战，我们提出 **P-Flow**，一个为 FM 增强源优化的高效框架。P-Flow 不再穿越复杂 ODE 路径求导，而是采用**代理梯度**策略绕过不稳定的 Jacobian 链，从而稳定并加速收敛。此外，我们引入**高斯球面投影**，把源点约束在先验的典型区域内。我们的主要贡献总结如下：

1. **P-Flow 框架**：我们提出 P-Flow，一个面向线性逆问题的新框架，通过三步迭代过程优化源点：(i) 一条**时间一致的流轨迹**，由潜在源 \(x_0\) 生成样本 \(x_1\)；(ii) 在**数据保真损失**上做一次梯度步，用**代理梯度**更新 \(x_0\)；(iii) 一次**高斯球面投影**，确保潜变量保持在先验的高概率区域内。
2. **理论分析与效率**：我们基于贝叶斯理论与 Lipschitz 连续性为代理梯度策略给出理论分析。P-Flow 不仅提升了优化稳定性，而且相比此前的源优化方法显著降低了显存占用与推理延迟。
3. **数值验证**：我们在 FFHQ 与 AFHQ-Cat 上进行数值评估。结果表明 P-Flow 在多种复原任务上具有有竞争力的性能，在严重病态条件与高测量噪声等极端退化下尤为突出。

本文其余部分组织如下：第 2 节回顾 FM 及相关数学基础；第 3 节给出主要方法与相应的理论分析；第 4 节综述相关工作；第 5 节给出数值结果以展示方法的有效性。

## 2 背景

本节给出所提方法与 FM 模型的数学基础。

### 2.1 流匹配

FM [13] 提供了一个学习时间相关向量场 \(v_t^\theta:\mathbb R^d\to\mathbb R^d\) 的框架，该向量场生成一个流 \(\psi_t\)。这个流定义了一条概率路径 \(p_{X_t}\)，把源分布 \(p_{X_0}\) 变换为目标数据分布 \(p_{X_1}\)。样本 \(x\) 沿该轨迹的演化由如下 ODE 支配：

$$
\frac{\mathrm d}{\mathrm dt}\psi_t(x)=v_t\left(\psi_t(x)\right),\quad t\in[0,1].\tag{4}
$$

理想的优化目标是使参数化速度场 \(v_t^\theta\) 与真实边缘速度场 \(v_t\) 之间的差异最小：

$$
\mathcal L_{\mathrm{FM}}(\theta)=\mathbb E_{t,x_t\sim p_{X_t}}\left[\left\|v_t^\theta(x_t)-v_t(x_t)\right\|_2^2\right].\tag{5}
$$

然而直接计算 \(v_t\) 通常不可行。为此 [13] 引入了条件流匹配（conditional flow matching, CFM）目标，把 \(v_t^\theta\) 回归到一个更简单的条件速度场 \(v_t(x_t\mid x_1)\)。假设样本 \(x_0\sim p_{X_0}\) 与 \(x_1\sim p_{X_1}\) 之间存在直线流，我们定义：

$$
x_t=(1-t)x_0+tx_1,\quad v_t(x_t\mid x_1)=x_1-x_0.\tag{6}
$$

由此得到实用的训练目标：

$$
\mathcal L_{\mathrm{CFM}}(\theta)=\mathbb E_{t,(x_0,x_1)\sim\pi}\left[\left\|v_t^\theta(x_t,t)-(x_1-x_0)\right\|_2^2\right].\tag{7}
$$

边缘分布 \(p_{X_0}\) 与 \(p_{X_1}\) 之间的耦合 \(\pi(x_0,x_1)\) 从根本上决定了所得流的几何性质。尽管 \(\mathcal L_{\mathrm{CFM}}\) 与 \(\mathcal L_{\mathrm{FM}}\) 具有等价梯度 [13]，但 \(\pi\) 的选择决定了概率路径的曲率。实践中，当 \(p_{X_0}\) 按标准取为 \(\mathcal N(0,\mathbf I)\) 时，独立耦合 \(\pi=p_{X_0}\otimes p_{X_1}\) 实现简单，并可得到可解的条件密度 \(p_{X_t\mid X_1}=\mathcal N(tx_1,(1-t)^2\mathbf I)\)；但该做法往往导致轨迹相交与训练期高方差梯度。相反，最优传输（OT）耦合 \(\pi^\star\) 最小化期望二次代价，从而沿 Wasserstein-2 测地线产生更直、互不重叠的路径 [19, 14]。尽管全局 OT 在计算上不可行，小批量近似可通过局部对齐加速收敛 [20]，代价是失去对 \(p_{X_t\mid X_1}\) 的简单闭式刻画。关键在于，这些更直的轨迹促使映射 \(\psi\) 更规则、更接近线性——我们后续正是利用这一性质来保证代理梯度策略的稳定性与有效性。

### 2.2 通过流做源优化

用生成式流求解逆问题的一个有力范式是**源优化**，它由 D-Flow [18] 等框架推广。给定定义流路径 \(\psi_t\) 的预训练速度场 \(v^\theta\)，目标可在潜源空间中表述为：

$$
\min_{x_0}\ \mathcal L\left(\psi_t(x_0),y\right)+\mathcal R(x_0).\tag{8}
$$

为求解该式，基于梯度的方法按 \(x_0\leftarrow x_0-\eta\nabla_{x_0}\mathcal L\) 更新源点。由链式法则，梯度计算为：

$$
\nabla_{x_0}\mathcal L=\left(\frac{\mathrm dx_1}{\mathrm dx_0}\right)^{\!\top}\nabla_{x_1}\mathcal L.\tag{9}
$$

虽然该做法能实现高保真重建，但对 ODE 求解器求导需要一长串 Jacobian 矩阵 \(\partial x_{t+\delta t}/\partial x_t\)。该过程常受数值不稳定与过高计算开销困扰，这直接促使我们提出本文更高效的代理梯度策略。

**图 1（原文 Fig. 1）：** P-Flow 框架总览。复原遵循一个三步循环：(i) **流一致路径（Flow-consistent path）**——通过 ODE 积分由潜在源 \(x_0\) 生成 \(x_1\)；(ii) **代理梯度反向（proxy gradient backward）**——用梯度代理更新 \(x_0\)，以绕过不稳定的 Jacobian 链；(iii) **高斯球面投影（Gaussian spherical projection）**——把潜变量约束在高斯先验的典型区域内。

### 2.3 高斯环带定理

我们不在优化目标中加入正则项，而是施加**高斯球面投影**来保持先验一致性。该操作基于**高斯环带定理（Gaussian annulus theorem）**[21]，后者刻画了高维空间中的测度集中。对 \(d\) 维高斯先验 \(z\sim\mathcal N(0,\mathbf I)\)，概率质量集中在半径约为 \(\sqrt d\) 的薄壳上，即所谓“肥皂泡（soap bubble）”效应。忽视这一性质的优化常会漂移到低概率区域，产生不真实或模糊的结果 [22]。为保持真实感与锐度，我们把潜向量 \(z\) 投影到超球面流形 \(\mathcal M\) 上，从而约束在先验的高密度区域内：

$$
\mathcal M=S^{d-1}\left(\sqrt d\right),\tag{10}
$$

其中 \(S^n(r)=\left\{z\in\mathbb R^{n+1}:\left\|z\right\|_2=r\right\}\) 表示嵌入 \((n+1)\) 维空间的半径 \(r\) 的 \(n\)-球面。该投影确保潜变量与高斯先验的期望范数保持一致 [23]，从而保持重建输出的感知质量。

## 3 方法

### 3.1 P-Flow：代理梯度源优化

我们考虑一个预训练速度场 \(v_t^\theta\)，它定义了一条把源分布 \(p_{X_0}\) 输运到目标数据分布 \(p_{X_1}\) 的 ODE 路径。对给定的退化观测 \(y\)，我们的目标是在潜空间中寻找最优源点 \(x_0\) 来恢复样本。具体而言，我们迭代优化 \(x_0\)，使其对应的生成样本 \(x_1\) 最小化数据保真损失 \(\mathcal L(x_1,y)\)。如图 1 所示，该优化包含 \(K\) 次迭代，每次迭代由三步组成：

**1. 时间一致的流（Time-consistent flow）：**

$$
x_1^k=\psi\left(x_0^k,N\right).\tag{11}
$$

在这一步，我们通过时间一致的流 \(\psi_t\) 得到生成样本 \(x_1^k\)，其中 \(N\) 是 ODE 步数。该映射代表一条从源分布到数据流形的完整轨迹。

**2. 数据保真项上的梯度步（Gradient step on data-fidelity term）：**

$$
\widetilde x_0^{k+1}=x_0^k-\eta g'.\tag{12}
$$

我们通过最小化数据保真项来更新源点，其中 \(g'=C\nabla_{x_1}\mathcal L\) 是**代理梯度**，\(C\) 是**代理标量（proxy scalar）**。值得注意的是，\(C\) 可以并入 \(\eta\)，因此不需要额外的超参数。该做法绕过了穿越长链轨迹求导带来的数值不稳定与计算开销。

**3. 高斯球面投影（Gaussian spherical projection）：**

$$
x_0^{k+1}=\frac{\sqrt d}{\left\|\widetilde x_0^{k+1}\right\|}\widetilde x_0^{k+1}.\tag{13}
$$

根据第 2.3 节的高斯环带定理，高维高斯分布的概率质量集中在半径 \(\sqrt d\) 的超球面上。为防止优化后的潜变量漂移到低概率区域、并确保 \(x_0\) 仍是高斯先验内的有效样本，我们把更新后的向量投影回该超球面。附录 B 给出汇总后的算法。

### 3.2 理论分析

**源优化的贝叶斯一致性（Bayesian consistency of source optimization）。** 给定由流定义的映射 \(x_1=\psi(x_0)\)，对数先验 \(\log p_{X_1}\) 可以经由潜在源联系起来：

$$
\log p_{X_1}=\log p_{X_0}-\log\left|\det\nabla_{X_0}\psi\right|.\tag{14}
$$

代入 MAP 目标，问题在潜空间中重新表述为最小化：

$$
J(x_0)=-\log p\left(y\mid\psi(x_0)\right)-\log p_{X_0}+\log\left|\det\nabla_{X_0}\psi\right|.\tag{15}
$$

借助 FM 的理论性质，OT 位移插值（displacement interpolants）促成动能最小的近乎直线的概率路径 [13, 24]。正如近期基于流的逆问题求解器所观察到的 [17, 18]，这种“直”性促使映射 \(\psi\) 更规则、更平滑，并表现出相对稳定的 Jacobian 行列式。于是，项 \(\log\left|\det\nabla_{x_0}\psi\right|\) 在潜空间的典型区域上变化很小，可被当作一个近似常数偏移（approximately constant offset）。忽略该常数项后，目标简化为一个潜空间优化问题：

$$
\widehat x_0=\arg\min_{x_0}\left\{\mathcal L\left(\psi(x_0),y\right)+\frac{\lambda}{2}\left\|x_0\right\|^2\right\},\tag{16}
$$

其中高斯先验 \(p_{X_0}\) 提供了显式的 \(\ell_2\) 正则。然而，这一重构后的优化地形是否易于处理，关键取决于映射 \(\psi\) 的规则性。具体而言，要让基于梯度的方法可靠收敛，该映射必须保证潜源 \(x_0\) 的微小扰动不会导致生成样本 \(x_1\) 的剧烈爆炸。这种稳定性由流的 Lipschitz 连续性形式化刻画。为建立稳定源优化的这一必要条件，我们给出如下命题：

**命题 1（Proposition 1）。** 考虑由 ODE \(\frac{\mathrm d}{\mathrm dt}x_t=v_t(x_t)\)（\(t\in[0,1]\)）定义、初条件 \(x_{t=0}=x_0\) 的流路径 \(\psi\)。若速度场 \(v_t\) 关于 \(x\) 是 Lipschitz 连续的，则映射 \(\psi\) 也是 Lipschitz 连续的。

证明见附录 A.1。该一致性保证了源优化是一个有理论依据的过程。通过把难以处理的像素空间先验转化为良定义的高斯先验，我们为后续的代理梯度策略提供了严格的出发点。

**长链求导的数值不稳定性（Numerical instability of long-chain differentiation）。** 源优化的根本挑战在于穿越 ODE 轨迹做长链求导的数值不稳定性。记 \(M_N\) 为 ODE 轨迹的累积 Jacobian：

$$
M_N=\frac{\mathrm dx_1}{\mathrm dx_0}=\prod_{i=0}^{N-1}\frac{\partial x_{t_{i+1}}}{\partial x_{t_i}}=\prod_{i=0}^{N-1}\left(\mathbf I+\delta t\,J_i\right).\tag{17}
$$

在深度神经网络中，Jacobian 的累积乘积会引发所谓**谱累积（spectral accumulation）**[18, 25]：奇异值的集中导致梯度路径严重病态 [15]。这一效应根植于神经网络 Jacobian 固有的**谱各向异性**：由于非线性激活函数与流形学习目标，该场在空间域上表现出非均匀的谱尺度 [26]。确切地说，局部 Jacobian \(J_i\) 往往具有高度非均匀的奇异值分布，这在深度架构中被一致观察到，并导致梯度信号退化 [25, 27]。这种在每一无穷小步上对各项同性的持续偏离会沿 ODE 轨迹累积，形式化如下：

**命题 2（Proposition 2）。** 记 \(\kappa(M_N)\) 为累积 Jacobian 的条件数。给定速度场的谱各向异性——即每个局部步 \(A_i=\mathbf I+\delta t J_i\) 的条件数 \(\kappa(A_i)>1\)——在持续的谱各向异性且主奇异方向对齐的条件下，累积条件数 \(\kappa(M_N)\) 可以随 ODE 步数 \(N\) 快速增长。

证明见附录 A.2。因此梯度 \(g=\nabla_{x_0}\mathcal L\) 会坍缩到少数主导奇异方向上，使其他维度上的关键信号被数值噪声掩盖。这造成一个不规则的优化地形，一阶求解器难以在其上导航，说明这种不稳定性是穿越长 ODE 轨迹求导所固有的结构性难题。我们还在附录 A.3 中给出扰动分析。

**收敛性分析（Convergence analysis）。** 由命题 1，流路径 \(\psi\) 从速度场 \(v_t\) 继承 Lipschitz 连续性。为规避真实梯度 \(g=M_N^\top\nabla_{x_1}\mathcal L\) 的数值不稳定，我们采用代理梯度 \(g'=C\nabla_{x_1}\mathcal L\)，其中 \(C>0\) 可被学习率 \(\eta\) 吸收。为刻画代理梯度在何时是有效的，我们先给出一个充分条件：若由流引起的对称方向形变不反转损失梯度的方向，则代理梯度是一个下降方向。更强条件 \(\left\|M_N-\mathbf I\right\|<1\) 是一个简单的充分情形，但 P-Flow 只需要更弱的正方向对齐条件。

**命题 3（Proposition 3）。** 令 \(u=\nabla_{x_1}\mathcal L(x_1,y)\) 为损失梯度。假设累积 Jacobian \(M_N\) 满足方向正对齐条件 \(u^\top M_Nu\ge\alpha\left\|u\right\|^2\)（对某常数 \(\alpha>0\)）。假设复合目标 \(J(x_0)=\mathcal L(\psi(x_0))\) 是 \(L_J\)-光滑的，则迭代更新 \(x_0^{k+1}=x_0^k-\eta g'\) 在步长 \(\eta\) 足够小时收敛到稳定点。

证明见附录 A.4。累积 Jacobian \(M_N\) 可能病态，这使精确反向传播在数值上不稳定；然而 P-Flow 并不要求 \(M_N\) 良态，它只要求沿优化轨迹代理方向与精确梯度保持正的方向对齐。这一更弱的条件在理论上足以保证下降，并由图 5 的余弦对齐测量给出经验验证：其中 \(\cos\angle(g,g')>0\) 直接验证了 \(\alpha>0\) 的经验版本。

**注 1（Remark 1）。** 除提供下降方向外，第 3 步中的投影还使 \(x_0\) 保持在大概率流形 \(\mathcal M\) 上。基于高斯环带定理，该约束起到正则化作用，防止数值漂移进入先验低概率区域，这对稳定优化至关重要。

### 3.3 复杂度分析

相比 D-Flow [18] 等全链求导方法，P-Flow 显著降低了计算开销。记 \(M_\theta\) 为单次前向传播的显存，\(T_f,T_b,T_g\) 分别为前向、反向与数据保真梯度 \(\nabla_{x_1}\mathcal L\) 的时间开销。传统方法需要缓存全部 \(N\) 步的中间激活，导致 \(O(N\cdot M_\theta)\) 的显存占用；相反，P-Flow 把优化与 ODE 动力学解耦，只需 \(O(M_\theta)\) 的显存，且与 \(N\) 无关。在时间复杂度方面，标准方法因沿展开轨迹反向传播，每次迭代的延迟为 \(O(N\cdot(T_f+T_b))\)；P-Flow 则降为 \(O(N\cdot T_f+T_g)\)。由于对常见线性算子有 \(T_g\ll T_b\)，P-Flow 在推理延迟上获得可观压缩，吞吐显著提高。

## 4 相关工作

逆问题的近期进展把预训练扩散模型与流模型用作生成先验，通过把这些先验与迭代引导结合来维持数据一致性，从而实现零样本复原。我们把这些方法归为三类方法学范式：

**条件采样与后验引导（Conditioned sampling and posterior guidance）。** 这一线索关注把生成轨迹引向观测 \(y\)。DPS [10] 通过测量残差 \(\nabla_{x_t}\left\|y-H\widehat x_0\right\|^2\) 开创了基于梯度的引导。为改善谱处理，DDRM [12] 在谱域使用奇异值分解，而 \(\Pi\)GDM [11] 用伪逆引导把这一点扩展到非线性退化。更近的 DAPS [28] 通过从 \(p(x_t\mid y)\) 递归边缘采样、解耦相邻样本，缓解了全局误差累积。

**变分整合与 PnP 框架（Variational integration and PnP frameworks）。** 这些方法把生成模型与 PnP 等经典优化框架统一起来。DiffPIR [29] 在数据保真近端步与扩散去噪之间交替，而 PnP-GS [30] 通过把去噪器参数化为梯度下降步来保证理论收敛。在 FM 框架内，PnP-Flow [16] 采用时间相关去噪器对轨迹做重投影；类似地，Flower [17] 先用近端算子 \(\mu_t=\mathrm{prox}_{\nu_t^2F_y}(\widehat x_1)\) 精化流一致的目标点，再把这些点重新投影回流路径，从而统一上述视角。

**源优化与数值预条件（Source optimization and numerical preconditioning）。** 第三类工作致力于降低求解逆问题的计算代价。D-Flow [18] 把任务表述为源点优化 \(\min_{x_0}\mathcal L(x_1)\)，但它需要对展开的 ODE 做昂贵求导。在扩散模型中，BIRD [23] 同样把任务表述为初始噪声优化，通过采用大时间步加速采样来缓解难以承受的展开开销。为提升效率，ICTM [31] 用局部目标 \(\sum\gamma_i\widehat J_i\) 近似 MAP 目标，以避免完整反向传播。DDPG [32] 进一步通过迭代预条件矩阵 \(W_t\) 来处理数值稳定性，以平衡一致性与噪声稳健性。最后，DDS [33] 用在 Krylov 子空间中的高效多步共轭梯度更新替代流形约束梯度，从而加速高维问题。

## 5 数值结果

### 5.1 实验设置

**数据集（Datasets）。** 我们在两个数据集上评估所提方法：FFHQ [34] 与 AFHQ-Cat（AFHQ [35] 的猫子集）。所有图像按 \(256\times256\) 分辨率处理并归一化到 \([-1,1]\) 范围。由于 FFHQ 不提供官方验证集，我们随机选取 128 张图像用于评估；对 AFHQ-Cat，我们也从测试集中随机选取 128 张图像用于验证。

**模型（Models）。** 我们采用与近期 FM 模型一致的 U-Net 骨干 [8, 36]。其架构遵循 [37] 的设计，由一系列残差块 [38] 与低分辨率处的自注意力层 [39] 构成。网络通过组归一化层（group normalization）以时间步 \(t\) 为条件。对 FM 框架中的速度场 \(v^\theta\)，U-Net 以含噪中间状态 \(x_t\) 与时间 \(t\) 为输入，预测相应的向量场。模型使用 CFM 目标 [13] 训练。我们使用 Adam 优化器 [40]，学习率恒为 \(10^{-4}\)，无权重衰减。对 FFHQ 与 AFHQ-Cat 两个数据集，模型均训练 200 个 epoch，批大小 16。对基线评估，我们为 PnP-GS [30] 训练了使用同一 U-Net 架构的去噪网络以保证一致性；对 DiffPIR [29]，我们使用 [41] 在 FFHQ 数据集 [34] 上的预训练模型，其在 DeepInv 库 [42] 中实现。

**任务设置（Settings for the tasks）。** 我们在 FFHQ 与 AFHQ-Cat 两个数据集的 128 张测试图像上，跨五种复原任务评估各方法。由于两个数据集分辨率一致（\(256\times256\)），我们采用相同的退化配置：(i) 高斯噪声去噪（\(\sigma=0.2\)）；(ii) 用 \(61\times61\)、\(\sigma_b=3.0\) 的高斯核去模糊（deblurring）；(iii) 经双三次下采样（bicubic）的 4× 超分辨率（super-resolution）；(iv) 中心 \(80\times80\) 掩膜的盒式修补（box-inpainting）；(v) 70% 像素被掩蔽的随机像素修补（random pixel inpainting）。对去模糊、超分辨率与盒式修补任务，我们进一步加入 \(\sigma=0.05\) 的高斯噪声；对随机修补，噪声水平为 \(\sigma=0.01\)。

**基线（Baselines）。** 为评估所提方法的性能，我们与一系列基线比较，包括 PnP-GS [30]、DiffPIR [29]、OT-ODE [15]、D-Flow [18]、Flow-Priors [31]、PnP-Flow [16] 与 Flower [17]。为保证公平比较，我们对所有方法进行了广泛的网格搜索以确定最优配置（见附录 D）。对 PnP-Flow 与 Flower，我们限制为每张图像单次评估（平均次数设为 \(N_{\mathrm{Avg}}=1\)）以保证公平。特别地，对 Flower 方法，我们把不确定度超参数设为 \(\gamma=0\)，依据 [17] 中“忽略目标不确定度可带来更好重建质量”的观察。所有基准测试在 NVIDIA A100 SXM 40GB GPU 上完成。

**表 1（原文 Table 1）：** FFHQ 数据集 128 张测试图像上的结果。原文以粗体标出每列最优、以下划线标出次优；本表保留粗体最优标记（PSNR/SSIM 越大越好、LPIPS 越小越好），下划线从略。“-” 表示该方法不适用于对应任务。

| 方法 | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Degraded | 20.45 | 0.303 | 0.484 | 23.58 | 0.551 | 0.422 | 11.14 | 0.215 | 0.868 | 12.75 | 0.215 | 1.078 | 22.13 | 0.742 | 0.200 |
| PnP-GS | 31.00 | 0.819 | 0.088 | 26.61 | 0.784 | 0.259 | 19.61 | 0.534 | 0.432 | 23.54 | 0.753 | 0.214 | - | - | - |
| DiffPIR | 31.90 | 0.876 | 0.091 | **29.41** | 0.824 | 0.165 | 25.14 | 0.726 | 0.194 | 32.73 | 0.911 | 0.032 | - | - | - |
| OT-ODE | 30.78 | 0.850 | 0.079 | 27.45 | 0.772 | **0.112** | 26.07 | 0.772 | **0.095** | 29.52 | 0.867 | 0.078 | 27.94 | 0.897 | 0.069 |
| Flow-Priors | 31.45 | 0.873 | 0.097 | 26.89 | 0.756 | 0.178 | 20.93 | 0.482 | 0.361 | 32.48 | 0.906 | 0.032 | 29.56 | 0.834 | 0.082 |
| PnP-Flow | 32.29 | 0.892 | 0.117 | 28.01 | 0.806 | 0.215 | 24.58 | 0.738 | 0.179 | **33.84** | **0.938** | 0.038 | 30.03 | **0.934** | 0.038 |
| Flower | **32.54** | **0.900** | 0.080 | 29.18 | **0.827** | 0.178 | 24.27 | 0.748 | 0.198 | 33.07 | 0.929 | **0.030** | 29.55 | 0.927 | **0.034** |
| D-Flow | 26.22 | 0.558 | 0.178 | 28.09 | 0.793 | 0.175 | 23.99 | 0.615 | 0.194 | 32.78 | 0.916 | 0.038 | 29.32 | 0.865 | 0.053 |
| **P-Flow (ours)** | 32.45 | 0.894 | **0.078** | 28.07 | 0.788 | 0.143 | **27.64** | **0.819** | 0.132 | 33.29 | 0.923 | 0.050 | **30.30** | 0.930 | 0.055 |

**表 2（原文 Table 2）：** AFHQ-Cat 数据集 128 张测试图像上的结果。粗体标记规则同表 1。

| 方法 | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Degraded | 20.00 | 0.314 | 0.509 | 23.94 | 0.517 | 0.444 | 11.70 | 0.208 | 0.873 | 13.36 | 0.223 | 1.081 | 21.80 | 0.740 | 0.198 |
| PnP-GS | **32.58** | **0.893** | 0.070 | 27.88 | 0.753 | 0.350 | 24.10 | 0.642 | 0.362 | 29.22 | 0.829 | 0.120 | - | - | - |
| DiffPIR | 30.91 | 0.837 | 0.189 | 29.21 | 0.781 | 0.273 | 24.17 | 0.635 | 0.392 | 32.14 | 0.884 | 0.058 | - | - | - |
| OT-ODE | 30.52 | 0.832 | 0.100 | 27.67 | 0.730 | **0.123** | 26.56 | 0.734 | **0.107** | 29.93 | 0.849 | 0.085 | 24.67 | 0.876 | 0.092 |
| Flow-Priors | 31.64 | 0.877 | **0.068** | 27.60 | 0.741 | 0.188 | 25.41 | 0.584 | 0.281 | 33.16 | 0.900 | 0.065 | 26.43 | 0.811 | 0.139 |
| PnP-Flow | 31.76 | 0.867 | 0.172 | **29.83** | 0.800 | 0.299 | 27.49 | **0.780** | 0.154 | **33.90** | **0.925** | 0.053 | 27.43 | **0.919** | 0.070 |
| Flower | 32.03 | 0.881 | 0.112 | 29.64 | **0.802** | 0.230 | 25.21 | 0.713 | 0.249 | 33.19 | 0.915 | **0.042** | 26.68 | 0.915 | **0.064** |
| D-Flow | 26.44 | 0.579 | 0.176 | 28.62 | 0.758 | 0.160 | 25.10 | 0.616 | 0.187 | 32.64 | 0.898 | 0.044 | 27.03 | 0.842 | 0.080 |
| **P-Flow (ours)** | 32.09 | 0.880 | 0.106 | 28.01 | 0.741 | 0.165 | **28.16** | 0.777 | 0.157 | 32.73 | 0.900 | 0.060 | **27.56** | 0.908 | 0.081 |

### 5.2 主要结果

表 1 与表 2 给出 P-Flow 相对其他基线的性能基准。PSNR、SSIM 与 LPIPS 指标均在 128 张测试图像上取平均。注意表中的 “-” 表示某方法不适用于对应任务，例如 PnP-GS 与 DiffPIR 因各自的架构约束而未参与盒式修补评估。图 2 与图 3 给出复原图像的定性比较，并附各自的 PSNR 数值供参考。评估结果表明，我们的方法在所有复原任务上都保持了稳健性能，并在若干类别上取得最先进（state-of-the-art）结果。

与所有基线相比，P-Flow 根据具体任务表现出不同特点。对超分辨率与盒式修补，我们的方法稳定取得最先进性能。对去模糊任务，我们承认 P-Flow 在重建保真度上存在相对短板；但它取得了有竞争力的感知质量与更真实的纹理恢复，更符合人眼视觉感知。在标准去噪与随机修补任务中，P-Flow 的性能与 PnP-Flow、Flower 相当或略优。

**图 2（原文 Fig. 2）：** FFHQ 数据集上图像复原结果的定性比较。每张复原图右下角标注其 PSNR 指标。行对应五种任务（Denoising、Deblurring、4×SR、Random Inp.、Box Inp.），列依次为 Ground Truth、Degraded、OT-ODE、Flow-Priors、PnP-Flow、Flower、D-Flow 与 P-Flow (Ours)。

**图 3（原文 Fig. 3）：** AFHQ-Cat 数据集上图像复原结果的定性比较。每张复原图右下角标注其 PSNR 指标；行列结构与图 2 相同。

尽管在标准设置下我们的方法未必在每一项定量指标上都占优，但当条件变得严重病态时其优势最为明显。正如附录 F.2 与附录 F.3 所详述，在极端退化条件下，基线方法会出现严重的结构失真、灾难性色偏或整体感知崩溃；相比之下，P-Flow 在这些极端情形下仍保持显著的稳定性与结构连贯性。

总体而言，P-Flow 有效平衡了重建保真度与感知真实感。这是因为最终生成作为一条与数据保真约束解耦的纯 ODE 路径运行，避免了侵入式干预破坏自然数据流形。附录给出大量评估，包括更多可视化（附录 F.1）、高斯投影消融（附录 C.1）、关于 \(N\)、\(K\)、\(\eta\) 的超参数敏感性（附录 C.2、C.3、C.4）以及计算效率基准（附录 C.5）。

## 6 结论

本文提出了 P-Flow——一个基于流匹配、面向线性逆问题的高效且稳定的框架。通过引入代理梯度策略，P-Flow 有效绕过了穿越展开 ODE 轨迹求导所带来的数值不稳定与过高显存开销。为保持潜源一致性，我们引入了基于测度集中的高斯球面投影，把优化保持在先验的典型区域内。理论分析与跨多种任务的大量实验表明，P-Flow 在取得有竞争力的复原质量的同时，显著提升了优化稳定性与计算效率。

## 7 局限性

尽管相比全链求导已获得显著的效率提升，P-Flow 仍然面临延迟瓶颈：每次优化迭代都需要对 ODE 轨迹做一次完整的前向积分。此外，我们当前的分析主要针对线性逆问题；代理梯度策略在复杂非线性前向算子下的有效性与理论稳定性，仍有待未来研究更广泛地探索。

## 参考文献

[1] Leonid I Rudin, Stanley Osher, and Emad Fatemi. Nonlinear total variation based noise removal algorithms. Physica D: Nonlinear Phenomena, 60(1-4):259–268, 1992.

[2] David L Donoho. Compressed sensing. IEEE Transactions on Information Theory, 52(4):1289–1306, 2006.

[3] Chao Dong, Chen Change Loy, Kaiming He, and Xiaoou Tang. Image super-resolution using deep convolutional networks. IEEE Transactions on Pattern Analysis and Machine Intelligence, 38(2):295–307, 2016.

[4] Kai Zhang, Wangmeng Zuo, Yunjin Chen, Deyu Meng, and Lei Zhang. Beyond a Gaussian denoiser: Residual learning of deep CNN for image denoising. IEEE Transactions on Image Processing, 26(7):3142–3155, 2017.

[5] Vegard Antun, Francesco Renna, Clarice Poon, Ben Adcock, and Anders C Hansen. On instabilities of deep learning in image reconstruction and the potential costs of AI. Proceedings of the National Academy of Sciences, 117(48):30088–30095, 2020.

[6] Singanallur V. Venkatakrishnan, Charles A. Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In IEEE Global Conference on Signal and Information Processing (GlobalSIP), 2013.

[7] Yaniv Romano, Michael Elad, and Peyman Milanfar. The little engine that could: Regularization by denoising (RED). SIAM Journal on Imaging Sciences, 10(4):1804–1844, 2017.

[8] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems (NeurIPS), 2020.

[9] Yang Song, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations (ICLR), 2021.

[10] Hyungjin Chung, Jeongsol Kim, Michael Thompson McCann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In International Conference on Learning Representations (ICLR), 2023.

[11] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations (ICLR), 2023.

[12] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. In Advances in Neural Information Processing Systems (NeurIPS), 2022.

[13] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow matching for generative modeling. In International Conference on Learning Representations (ICLR), 2023.

[14] Aram-Alexandre Pooladian, Heli Ben-Hamu, Carles Domingo-Enrich, Brandon Amos, Yaron Lipman, and Ricky T. Q. Chen. Multisample flow matching: Straightening flows with minibatch couplings. In International Conference on Machine Learning (ICML), 2023.

[15] Ashwini Pokle, Matthew J. Muckley, Ricky T. Q. Chen, and Brian Karrer. Training-free linear image inverses via flows. Transactions on Machine Learning Research, 2024.

[16] Ségolène Tiffany Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. PnP-Flow: Plug-and-play image restoration with flow matching. In International Conference on Learning Representations (ICLR), 2025.

[17] Mehrsa Pourya, Bassam El Rawas, and Michael Unser. Flower: A flow-matching solver for inverse problems. In International Conference on Learning Representations (ICLR), 2026.

[18] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman. D-Flow: Differentiating through flows for controlled generation. In International Conference on Machine Learning (ICML), 2024.

[19] Gabriel Peyré and Marco Cuturi. Computational optimal transport: With applications to data science. Now Foundations and Trends, 2019.

[20] Alexander Tong, Nikolay Malkin, Guillaume Huguet, Yanlei Zhang, Jarrid Rector-Brooks, Kilian Fatras, Guy Wolf, and Yoshua Bengio. Conditional flow matching for generative modeling. In International Conference on Machine Learning (ICML), 2023.

[21] Roman Vershynin. High-dimensional probability: An introduction with applications in data science, volume 47. Cambridge University Press, 2018.

[22] Sachit Menon, Alexandru Damian, Shijia Hu, Nikhil Ravi, and Cynthia Rudin. PULSE: Self-supervised photo upsampling via latent space exploration of generative models. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2020.

[23] Hamadi Chihaoui, Abdelhak Lemkhenter, and Paolo Favaro. Blind image restoration via fast diffusion inversion. In Advances in Neural Information Processing Systems (NeurIPS), 2024.

[24] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. In International Conference on Learning Representations (ICLR), 2023.

[25] Razvan Pascanu, Tomás Mikolov, and Yoshua Bengio. On the difficulty of training recurrent neural networks. In International Conference on Machine Learning (ICML), 2013.

[26] Andrew M. Saxe, James L. McClelland, and Surya Ganguli. Exact solutions to the nonlinear dynamics of learning in deep linear neural networks. In International Conference on Learning Representations (ICLR), 2014.

[27] David Balduzzi, Marcus Frean, Lennox Leary, J. P. Lewis, Kurt Wan-Duo Ma, and Brian McWilliams. The shattered gradients problem: If resnets are the answer, then what is the question? In International Conference on Machine Learning (ICML), 2017.

[28] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 20895–20905, 2025.

[29] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR) Workshops, 2023.

[30] Samuel Hurault, Arthur Leclaire, and Nicolas Papadakis. Gradient step denoiser for convergent plug-and-play. In International Conference on Learning Representations (ICLR), 2022.

[31] Yasi Zhang, Peiyu Yu, Yaxuan Zhu, Yingshan Chang, Feng Gao, Ying Nian Wu, and Oscar Leong. Flow priors for linear inverse problems via iterative corrupted trajectory matching. In Advances in Neural Information Processing Systems (NeurIPS), 2024.

[32] Tomer Garber and Tom Tirer. Image restoration by denoising diffusion models with iteratively preconditioned guidance. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2024.

[33] Hyungjin Chung, Suhyeon Lee, and Jong Chul Ye. Decomposed diffusion sampler for accelerating large-scale inverse problems. In International Conference on Learning Representations (ICLR), 2024.

[34] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2019.

[35] Yunjey Choi, Youngjung Uh, Jaejun Yoo, and Jung-Woo Ha. StarGAN v2: Diverse image synthesis for multiple domains. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2020.

[36] Prafulla Dhariwal and Alexander Quinn Nichol. Diffusion models beat GANs on image synthesis. In Advances in Neural Information Processing Systems (NeurIPS), 2021.

[37] Olaf Ronneberger, Philipp Fischer, and Thomas Brox. U-Net: Convolutional networks for biomedical image segmentation. In Medical Image Computing and Computer-Assisted Intervention (MICCAI), 2015.

[38] Kaiming He, Xiangyu Zhang, Shaoqing Ren, and Jian Sun. Deep residual learning for image recognition. In IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2016.

[39] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, and Illia Polosukhin. Attention is all you need. In Advances in Neural Information Processing Systems (NeurIPS), 2017.

[40] Diederik P. Kingma and Jimmy Ba. Adam: A method for stochastic optimization. In International Conference on Learning Representations (ICLR), 2015.

[41] Jooyoung Choi, Sungwon Kim, Yonghyun Jeong, Youngjune Gwon, and Sungroh Yoon. ILVR: Conditioning method for denoising diffusion probabilistic models. In IEEE/CVF International Conference on Computer Vision (ICCV), 2021.

[42] Julián Tachella, Matthieu Terris, Samuel Hurault, Andrew Wang, Dongdong Chen, Minh-Hai Nguyen, Maxime Song, Thomas Davies, Leo Davy, Jonathan Dong, et al. DeepInverse: A Python package for solving imaging inverse problems with deep learning. arXiv preprint arXiv:2505.20160, 2025.

## 附录 A 证明

### A.1 命题 1 的证明

我们先假设所学速度场 \(v_t\) 的 Lipschitz 连续性，这是具有有界权重与光滑激活函数的神经网络的标准性质。

假设存在有限常数 \(L_v>0\)，使得对任意 \(x,x'\in\mathbb R^d\) 与任意 \(t\in[0,1]\)，速度场满足：

$$
\left\|v_t(x)-v_t(x')\right\|\le L_v\left\|x-x'\right\|.\tag{18}
$$

现在考虑潜空间中两个不同的初始源点 \(x_0\) 与 \(x_0'\)。它们分别诱导出两条轨迹 \(x_t\) 与 \(x_t'\)，由同一速度场 \(v_t\) 支配。任意时刻 \(t\in[0,1]\) 的状态可以用 ODE 的积分形式写出：

$$
x_t=x_0+\int_0^t v_s(x_s)\,\mathrm ds,\qquad
x_t'=x_0'+\int_0^t v_s(x_s')\,\mathrm ds.\tag{19}
$$

两条轨迹在时刻 \(t\) 的差为：

$$
\begin{aligned}
\left\|x_t-x_t'\right\|
&=\left\|\left(x_0-x_0'\right)+\int_0^t\left(v_s(x_s)-v_s(x_s')\right)\mathrm ds\right\| &&\text{(ODE 的积分形式)}\\
&\le\left\|x_0-x_0'\right\|+\int_0^t\left\|v_s(x_s)-v_s(x_s')\right\|\mathrm ds &&\text{(三角不等式)}\\
&\le\left\|x_0-x_0'\right\|+L_v\int_0^t\left\|x_s-x_s'\right\|\mathrm ds &&\text{(\(v_t\) 的 Lipschitz 性质)}\\
&\le\left\|x_0-x_0'\right\|\exp\left(L_vt\right) &&\text{(Grönwall 不等式)}
\end{aligned}\tag{20}
$$

在轨迹末端（\(t=1\)），生成样本为 \(x_1=\psi(x_0)\) 与 \(x_1'=\psi(x_0')\)。把 \(t=1\) 代入上述不等式得：

$$
\left\|\psi(x_0)-\psi(x_0')\right\|\le\exp(L_v)\left\|x_0-x_0'\right\|.\tag{21}
$$

令 \(L_\psi=\exp(L_v)\)。由于 \(L_v\) 是由神经网络谱范数决定的有限常数，\(L_\psi\) 也是有限常数。因此映射 \(\psi\) 是 \(L_\psi\)-Lipschitz 连续的。

### A.2 命题 2 的证明

令 \(M_N=\prod_{i=0}^{N-1}A_i\)，其中 \(A_i=\mathbf I+\delta t J_i\in\mathbb R^{d\times d}\) 表示第 \(i\) 步的转移矩阵。记 \(\sigma_1(A)\ge\sigma_2(A)\ge\cdots\ge\sigma_d(A)>0\) 为矩阵 \(A\) 的奇异值，条件数定义为 \(\kappa(A)=\sigma_1(A)/\sigma_d(A)\)。

由奇异值的乘性性质，对任意两个矩阵 \(A\) 与 \(B\)，最大奇异值有下界、最小奇异值有上界：

$$
\sigma_1(AB)\ge\sigma_1(A)\sigma_d(B),\qquad
\sigma_d(AB)\le\sigma_d(A)\sigma_1(B).\tag{22}
$$

把这些性质递归地作用于乘积 \(M_N\)，得到：

$$
\sigma_1(M_N)\ge\sigma_1(A_{N-1})\prod_{i=0}^{N-2}\sigma_d(A_i),\qquad
\sigma_d(M_N)\le\sigma_d(A_{N-1})\prod_{i=0}^{N-2}\sigma_1(A_i).\tag{23}
$$

然而，条件数增长的一个更直接下界可由不等式 \(\kappa(AB)\ge\kappa(A)/\kappa(B^{-1})\)（在一定的对齐条件下）导出，或更一般地通过谱半径导出。在深度神经网络的语境下，我们假设每个局部块 \(A_i\) 表现出程度一致的各向异性，即对某 \(\epsilon>0\) 有 \(\kappa(A_i)\ge1+\epsilon\)。根据矩阵乘积的谱增长定理，累积条件数满足：

$$
\kappa(M_N)\ge\prod_{i=0}^{N-1}\gamma_i,\tag{24}
$$

其中 \(\gamma_i\) 与 \(\{A_i\}\) 主奇异向量的对齐程度有关。在最坏情形（奇异向量对齐）下，\(\kappa(M_N)=\prod_{i=0}^{N-1}\kappa(A_i)\ge(1+\epsilon)^N\)。

在奇异向量持续对齐的情形下，\(\kappa(M_N)\) 可以快速增长。这种指数爆炸意味着：当 \(N\) 较大时，梯度 \(\nabla_{x_0}\mathcal L=M_N^\top\nabla_{x_1}\mathcal L\) 在数值上变得奇异——梯度中任何不与 \(M_N\) 主导奇异向量对齐的分量都会被指数压制。我们在图 4 中给出经验验证，可视化了累积条件数的指数演化。

**图 4（原文 Fig. 4）：** ODE 积分过程中局部与累积条件数的演化。每个面板展示在不同优化迭代（\(K=0,20,40,60,80,100\)）下，局部条件数 \(\kappa(A_i)\)（蓝色）与累积条件数 \(\kappa(M_N)\)（红色）随 ODE 步数（\(N\)）的变化趋势；横轴为 ODE 步数 \(N\)（0–8），纵轴分别为 \(\kappa(A_i)\)（约 2–4）与 \(\kappa(M_N)\)（约 5–20）。

### A.3 数值扰动

数值噪声会进一步加剧这种不稳定。考虑受扰梯度 \(\widetilde g_1=\nabla_{x_1}\mathcal L+\xi\)，其中 \(\xi\) 表示微小的数值误差（例如浮点噪声）。反传回源的梯度 \(\widetilde g_0\) 的误差为：

$$
\Delta g_0=M_N^\top\xi.\tag{25}
$$

其相对误差有界：

$$
\frac{\left\|\Delta g_0\right\|}{\left\|g_0\right\|}\le\kappa(M_N)\frac{\left\|\xi\right\|}{\left\|\nabla_{x_1}\mathcal L\right\|}.\tag{26}
$$

由于 \(\kappa(M_N)\) 以 \(O\left((1+\epsilon)^N\right)\) 增长，即便机器精度量级的扰动 \(\xi\)，在 \(N\) 较大时也可导致达到 1 或更大的相对误差。这实际上“粉碎（shatters）”了梯度，使下降方向变得随机且无信息量。

### A.4 命题 3 的证明

我们考虑复合目标 \(J(x_0)=\mathcal L(\psi(x_0),y)\)。由链式法则，关于源点 \(x_0\) 的真实梯度为 \(g=\nabla_{x_0}J=M_N^\top u\)，其中 \(M_N=\nabla_{x_0}\psi\) 是累积 Jacobian，\(u=\nabla_{x_1}\mathcal L(x_1,y)\)。代理梯度更新规则为 \(x_0^{k+1}=x_0^k-\eta g'\)，其中代理梯度 \(g'=Cu\)。为证明收敛，我们分析真实梯度 \(g\) 与代理梯度 \(g'\) 的内积：

$$
\left\langle g,g'\right\rangle=\left\langle M_N^\top u,Cu\right\rangle=C\,u^\top M_Nu.\tag{27}
$$

由方向正对齐假设 \(u^\top M_Nu\ge\alpha\left\|u\right\|^2\)（\(\alpha>0\)），我们有：

$$
\left\langle g,g'\right\rangle\ge C\alpha\left\|u\right\|^2>0.\tag{28}
$$

由于内积严格为正，\(g'\) 是一个有效的下降方向。现在假设 \(J(x_0)\) 是 \(L_J\)-光滑的，应用标准的下降引理：

$$
\begin{aligned}
J\left(x_0^{k+1}\right)
&\le J\left(x_0^k\right)-\eta\left\langle g,g'\right\rangle+\frac{L_J}{2}\left\|\eta g'\right\|^2\\
&\le J\left(x_0^k\right)-\eta C\alpha\left\|u\right\|^2+\frac{L_J\eta^2C^2}{2}\left\|u\right\|^2\\
&=J\left(x_0^k\right)-\eta C\left(\alpha-\frac{L_J\eta C}{2}\right)\left\|u\right\|^2.
\end{aligned}\tag{29}
$$

对任意步长 \(\eta<\frac{2\alpha}{L_JC}\)，目标 \(J(x_0)\) 单调下降。对 \(k=0,\ldots,K-1\) 求和并假设 \(J\) 有下界 \(J^\ast\)，得到：

$$
\sum_{k=0}^{K-1}\left\|u_k\right\|^2\le\frac{J\left(x_0^0\right)-J^\ast}{\eta C\left(\alpha-\frac{L_J\eta C}{2}\right)}.\tag{30}
$$

当 \(K\to\infty\) 时，梯度平方的可和性意味着 \(\lim_{k\to\infty}\left\|\nabla_{x_1}\mathcal L\right\|=0\)，从而确认收敛到稳定点。我们在图 5 中给出经验验证，可视化了两个梯度之间的余弦相似度。

**图 5（原文 Fig. 5）：** 梯度对齐的经验验证。真实梯度 \(g\) 与所提代理梯度 \(g'\) 在时间区间 \(t\in[0,1]\) 上的余弦相似度。在 FFHQ 与 AFHQ-Cat 上跨多种逆问题的一致正对齐，支持了代理梯度策略的方向完整性。图中左为 FFHQ、右为 AFHQ-Cat，曲线对应 Denoising、Deblurring、Super-resolution、Random Inpainting、Box Inpainting 五种任务。

## 附录 B 算法

算法 1 汇总完整的 P-Flow 框架，算法 2 给出流一致路径的 ODE 积分过程。

**算法 1：P-Flow**

**输入（Require）：** 退化图像 \(\mathbf y\)、函数 \(H\)、步长 \(\eta\)、维度 \(d\)。

1. 初始化 \(x_0^0\sim\mathcal N(0,\mathbf I)\)
2. **for** \(k=0\to K-1\) **do**
3. 　\(x_1^k=\psi\left(x_0^k,N\right)\)
4. 　\(\widetilde x_0^{k+1}=x_0^k-\eta C\nabla_{x_1}\mathcal L(x_1,y)\)
5. 　\(x_0^{k+1}\leftarrow\dfrac{\sqrt d}{\left\|\widetilde x_0^{k+1}\right\|}\widetilde x_0^{k+1}\)
6. **end for**
7. **return** \(x_1=\psi\left(x_0^K,N\right)\)

**算法 2：流 \(\psi(x_0,N)\)**

**输入（Require）：** 高斯 \(x_0\sim\mathcal N(0,\mathbf I)\)、步数 \(N\)、场 \(v^\theta\)。

1. \(t=0\)
2. \(\delta t=1/N\)
3. **for** \(i=0\to N-1\) **do**
4. 　\(x_{t+\delta t}=x_t+v_t^\theta(x_t)\delta t\)
5. 　\(t=t+\delta t\)
6. **end for**
7. **return** \(x_t\)

## 附录 C 消融研究与附加结果

### C.1 高斯球面投影

在表 3 中，我们用附录 D 的配置评估**高斯球面投影**（第 3 步）的影响。结果显示，省略该约束会在除去模糊以外的所有复原任务上造成一致的性能退化。这从经验上确认了：高斯球面投影对于稳定优化过程、并在生成先验内保持潜空间一致性是不可或缺的。相反，去掉投影步后去模糊性能并未下降，甚至略有提升。这归因于模糊算子的低通性质：它产生平滑梯度，便于 \(x_0\) 的稳定更新，因此源点自然保持在先验的高概率流形内，使投影约束在该特定情形下变得冗余。

**表 3（原文 Table 3）：** 高斯球面投影作用的消融研究。我们在所有任务与数据集上比较带投影步与不带投影步的 P-Flow。粗体为该列最优。（a）FFHQ 数据集；（b）AFHQ-Cat 数据集。

**（a）FFHQ 数据集**

| P-Flow | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| No projection | 20.38 | 0.300 | 0.484 | 27.80 | 0.786 | **0.140** | 22.80 | 0.542 | 0.265 | 29.66 | 0.847 | 0.069 | 26.80 | 0.752 | 0.102 |
| With projection | **32.37** | **0.893** | **0.079** | **27.87** | **0.787** | 0.148 | **27.38** | **0.816** | **0.132** | **32.95** | **0.922** | **0.049** | **30.30** | **0.930** | **0.055** |

**（b）AFHQ-Cat 数据集**

| P-Flow | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| No projection | 20.09 | 0.307 | 0.510 | **28.03** | **0.750** | **0.159** | 24.08 | 0.550 | 0.249 | 29.76 | 0.828 | 0.076 | 24.32 | 0.746 | 0.120 |
| With projection | **32.09** | **0.880** | **0.106** | 28.01 | 0.741 | 0.165 | **28.16** | **0.777** | **0.157** | **32.73** | **0.900** | **0.060** | **27.56** | **0.908** | **0.081** |

### C.2 ODE 步数的影响

为考察 P-Flow 对 ODE 轨迹离散化的敏感性，我们把积分步数取为 \(N\in\{3,5,8,10,15\}\) 并评估其性能，其余配置与附录 D 一致。表 4 给出 FFHQ 与 AFHQ-Cat 两个数据集在五种复原任务上的结果。

我们观察到重建质量并不随 \(N\) 单调提升，且在较大取值处往往饱和甚至略有下降；相反，感知质量通常受益于更多积分步，因为更多步便于恢复更丰富的细节。在复原性能与计算开销之间权衡，\(N\in[5,10]\) 为实际应用提供了有利的折中。

**表 4（原文 Table 4）：** ODE 步数（\(N\)）对 P-Flow 在各复原任务上性能影响的消融研究。优化迭代固定为 \(K=100\)。（a）FFHQ 数据集结果；（b）AFHQ-Cat 数据集结果。原文含粗体/下划线强调，本表仅照抄数值。

**（a）FFHQ 数据集**

| \(N\) | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 3 | 31.64 | 0.882 | 0.092 | 27.80 | 0.781 | 0.165 | 26.06 | 0.786 | 0.157 | 32.27 | 0.905 | 0.057 | 29.13 | 0.912 | 0.073 |
| 5 | 32.10 | 0.890 | 0.086 | 27.84 | 0.787 | 0.144 | 26.96 | 0.807 | 0.144 | 31.30 | 0.884 | 0.059 | 29.77 | 0.925 | 0.064 |
| 8 | 32.33 | 0.893 | 0.081 | 27.69 | 0.784 | 0.136 | 27.32 | 0.815 | 0.135 | 32.87 | 0.926 | 0.043 | 30.19 | 0.930 | 0.057 |
| 10 | 32.37 | 0.893 | 0.079 | 27.56 | 0.780 | 0.131 | 27.38 | 0.816 | 0.132 | 32.68 | 0.925 | 0.041 | 30.30 | 0.930 | 0.055 |
| 15 | 31.66 | 0.888 | 0.080 | 27.36 | 0.775 | 0.123 | 27.37 | 0.816 | 0.128 | 32.20 | 0.922 | 0.039 | 30.11 | 0.924 | 0.053 |

**（b）AFHQ-Cat 数据集**

| \(N\) | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 3 | 31.21 | 0.851 | 0.127 | 28.06 | 0.728 | 0.185 | 27.09 | 0.732 | 0.192 | 31.56 | 0.836 | 0.091 | 26.61 | 0.847 | 0.117 |
| 5 | 31.76 | 0.869 | 0.116 | 28.02 | 0.745 | 0.162 | 27.78 | 0.760 | 0.174 | 32.40 | 0.874 | 0.075 | 27.04 | 0.885 | 0.092 |
| 8 | 32.01 | 0.878 | 0.109 | 27.76 | 0.740 | 0.150 | 28.08 | 0.773 | 0.162 | 32.72 | 0.894 | 0.063 | 27.28 | 0.902 | 0.081 |
| 10 | 32.09 | 0.880 | 0.106 | 27.58 | 0.737 | 0.144 | 28.16 | 0.777 | 0.157 | 32.73 | 0.900 | 0.060 | 27.56 | 0.908 | 0.081 |
| 15 | 32.13 | 0.883 | 0.101 | 27.06 | 0.727 | 0.139 | 28.22 | 0.782 | 0.151 | 32.31 | 0.903 | 0.055 | 27.35 | 0.909 | 0.080 |

### C.3 迭代次数的影响

为考察 P-Flow 对优化迭代次数 \(K\) 的敏感性，我们把 \(K\) 取为 \(\{20,50,100,150,200\}\) 并评估其性能，其余配置与附录 D 一致。表 5 给出 FFHQ 与 AFHQ-Cat 两个数据集在多种复原任务上的结果，图 6 给出 FFHQ 数据集上 4×SR 结果的可视化。

我们观察到性能并不随优化迭代次数增加而单调提升。值得注意的是，迭代次数不足会导致复原质量显著下降，但过度增大 \(K\) 并不总能带来进一步收益，甚至可能引起轻微波动。这反映了零样本生成式逆问题求解器中常见的经典“过优化（over-optimization）”现象。在多数情形下，最优区间为 \(K\in[100,150]\)，它在复原精度与计算效率之间提供了良好平衡。

**表 5（原文 Table 5）：** 优化步数（\(K\)）对 P-Flow 在各复原任务上性能影响的消融研究。（a）FFHQ 数据集结果；（b）AFHQ-Cat 数据集结果。原文含粗体/下划线强调，本表仅照抄数值。

**（a）FFHQ 数据集**

| \(K\) | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 20 | 15.88 | 0.621 | 0.305 | 15.55 | 0.559 | 0.314 | 22.50 | 0.695 | 0.190 | 21.79 | 0.776 | 0.135 | 13.35 | 0.516 | 0.380 |
| 50 | 30.93 | 0.883 | 0.087 | 24.60 | 0.751 | 0.172 | 26.28 | 0.792 | 0.136 | 29.72 | 0.897 | 0.053 | 25.21 | 0.868 | 0.112 |
| 100 | 32.37 | 0.893 | 0.079 | 27.87 | 0.787 | 0.148 | 27.38 | 0.816 | 0.132 | 32.95 | 0.921 | 0.049 | 30.29 | 0.930 | 0.055 |
| 150 | 29.24 | 0.872 | 0.091 | 28.09 | 0.783 | 0.150 | 27.46 | 0.818 | 0.133 | 33.18 | 0.921 | 0.053 | 28.52 | 0.911 | 0.067 |
| 200 | 24.28 | 0.839 | 0.107 | 27.97 | 0.769 | 0.157 | 27.47 | 0.818 | 0.133 | 33.22 | 0.921 | 0.053 | 22.86 | 0.844 | 0.110 |

**（b）AFHQ-Cat 数据集**

| \(K\) | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 20 | 16.28 | 0.662 | 0.303 | 14.55 | 0.518 | 0.364 | 23.09 | 0.661 | 0.195 | 19.26 | 0.720 | 0.204 | 14.36 | 0.594 | 0.346 |
| 50 | 29.90 | 0.869 | 0.118 | 23.80 | 0.700 | 0.197 | 27.29 | 0.765 | 0.150 | 27.97 | 0.863 | 0.081 | 23.82 | 0.858 | 0.129 |
| 100 | 32.09 | 0.880 | 0.106 | 28.01 | 0.741 | 0.165 | 28.16 | 0.777 | 0.157 | 32.63 | 0.897 | 0.059 | 27.40 | 0.908 | 0.079 |
| 150 | 32.01 | 0.880 | 0.106 | 28.24 | 0.735 | 0.166 | 28.17 | 0.777 | 0.161 | 33.03 | 0.899 | 0.065 | 27.46 | 0.909 | 0.082 |
| 200 | 31.24 | 0.878 | 0.109 | 28.04 | 0.720 | 0.173 | 28.17 | 0.777 | 0.162 | 33.07 | 0.896 | 0.067 | 26.79 | 0.904 | 0.086 |

**图 6（原文 Fig. 6）：** FFHQ 数据集上 4×SR 结果随参数 \(K\) 的可视化。各列依次为 Ground Truth、Degraded 与 \(K=20,50,100,150,200\)。

### C.4 学习率的影响

为考察 P-Flow 对学习率的敏感性，我们把学习率取为 \(\eta\in\{0.01,0.02,0.05,0.1,0.2,0.5\}\) 并评估其性能，其余配置与附录 D 一致。表 6 给出 FFHQ 与 AFHQ-Cat 两个数据集在五种复原任务上的结果。

值得注意的是，学习率过小会导致收敛不充分、复原质量下降，而过大的学习率可能引起收敛崩溃或显著的数值不稳定。在多数情形下，学习率的最优区间为 \([0.1,0.2]\)，它在复原精度与优化稳定性之间提供了良好平衡。

**表 6（原文 Table 6）：** 学习率（\(\eta\)）对 P-Flow 在各复原任务上性能影响的消融研究。（a）FFHQ 数据集结果；（b）AFHQ-Cat 数据集结果。原文含粗体/下划线强调，本表仅照抄数值。

**（a）FFHQ 数据集**

| \(\eta\) | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.01 | 30.61 | 0.866 | 0.098 | 26.65 | 0.753 | 0.173 | 19.51 | 0.586 | 0.292 | 26.94 | 0.798 | 0.132 | 27.99 | 0.887 | 0.080 |
| 0.02 | 31.54 | 0.884 | 0.087 | 27.28 | 0.772 | 0.160 | 22.38 | 0.663 | 0.218 | 29.48 | 0.858 | 0.074 | 29.08 | 0.917 | 0.056 |
| 0.05 | 31.94 | 0.890 | 0.087 | 27.74 | 0.784 | 0.152 | 24.63 | 0.738 | 0.162 | 31.35 | 0.901 | 0.046 | 29.99 | 0.929 | 0.050 |
| 0.1 | 32.17 | 0.893 | 0.083 | 27.85 | 0.786 | 0.150 | 26.08 | 0.784 | 0.139 | 32.34 | 0.916 | 0.043 | 30.23 | 0.930 | 0.052 |
| 0.2 | 32.34 | 0.894 | 0.080 | 28.07 | 0.788 | 0.143 | 27.12 | 0.810 | 0.132 | 32.88 | 0.921 | 0.047 | 30.27 | 0.930 | 0.053 |
| 0.5 | 21.67 | 0.768 | 0.149 | 26.49 | 0.765 | 0.152 | 27.64 | 0.819 | 0.132 | 32.99 | 0.920 | 0.051 | 24.06 | 0.854 | 0.105 |

**（b）AFHQ-Cat 数据集**

| \(\eta\) | 去噪 PSNR | 去噪 SSIM | 去噪 LPIPS | 去模糊 PSNR | 去模糊 SSIM | 去模糊 LPIPS | 超分 PSNR | 超分 SSIM | 超分 LPIPS | 随机修补 PSNR | 随机修补 SSIM | 随机修补 LPIPS | 盒式修补 PSNR | 盒式修补 SSIM | 盒式修补 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0.01 | 30.53 | 0.845 | 0.125 | 27.10 | 0.710 | 0.184 | 20.59 | 0.566 | 0.297 | 27.69 | 0.773 | 0.137 | 25.49 | 0.860 | 0.106 |
| 0.02 | 31.46 | 0.868 | 0.111 | 27.64 | 0.728 | 0.173 | 23.58 | 0.642 | 0.213 | 29.89 | 0.836 | 0.079 | 26.41 | 0.894 | 0.081 |
| 0.05 | 31.83 | 0.875 | 0.112 | 27.98 | 0.737 | 0.167 | 25.84 | 0.712 | 0.159 | 31.57 | 0.880 | 0.054 | 27.38 | 0.905 | 0.075 |
| 0.1 | 31.97 | 0.878 | 0.109 | 27.98 | 0.738 | 0.166 | 27.26 | 0.760 | 0.150 | 32.38 | 0.896 | 0.052 | 27.54 | 0.907 | 0.075 |
| 0.2 | 32.09 | 0.880 | 0.106 | 28.01 | 0.741 | 0.165 | 28.07 | 0.776 | 0.154 | 32.61 | 0.899 | 0.056 | 27.56 | 0.908 | 0.081 |
| 0.5 | 17.47 | 0.693 | 0.239 | 24.90 | 0.704 | 0.188 | 28.21 | 0.777 | 0.159 | 32.60 | 0.898 | 0.064 | 22.00 | 0.832 | 0.153 |

### C.5 计算时间与显存

如表 7 所示，我们在 FFHQ 随机修补任务（\(256\times256\)）上评估若干方法的计算时间与显存负载，配置见附录 D。所有基准测试在 NVIDIA H200 SXM 141GB GPU 上完成。我们报告每张图像的推理延迟与峰值 GPU 显存占用，所有结果均为 128 张测试图像上的平均。

相比 D-Flow 等传统源优化方法，P-Flow 把峰值显存降低 **65.9×**（21.09 GB → 0.32 GB），推理时间加速 **28.6×**（149.28 s → 5.22 s）。这一大幅下降从经验上验证了第 3.3 节的复杂度分析：我们的代理梯度策略完全消除了缓存长链 ODE 激活的需求。此外，相比 PnP-Flow 这类轻量 PnP 方法，P-Flow 的显存占用几乎相同（0.32 GB），而其 ODE 前向的本质带来的实际运行时间在 10 秒以内。

**表 7（原文 Table 7）：** FFHQ（\(256\times256\)）上超分辨率任务每张图像的时间与显存指标。（注：原文正文称该基准在“随机修补”任务上进行，而表题为“超分辨率”，两者存在不一致，此处如实照录。）

| 方法 | DiffPIR | PnP-GS | OT-ODE | Flow-Priors | PnP-Flow | Flower | D-Flow | P-Flow |
|---|---|---|---|---|---|---|---|---|
| 时间 Time [s] | 1.55 | 1.27 | 4.60 | 66.58 | 1.32 | 1.16 | 149.28 | 5.22 |
| 显存 Memory [GB] | 0.67 | 8.44 | 2.27 | 15.44 | 0.32 | 0.32 | 21.09 | 0.32 |

## 附录 D 实现细节

所有方法的最优配置列于表 8（FFHQ）与表 9（AFHQ-Cat）。

**表 8（原文 Table 8）：** FFHQ 数据集上所有方法的超参数。列为五种任务（去噪、去模糊、超分辨率、随机修补、盒式修补）。

| 方法 | 超参数 | 去噪 | 去模糊 | 超分 | 随机修补 | 盒式修补 |
|---|---|---|---|---|---|---|
| DiffPIR | \(\zeta\)（blending） | 1.0 | 1.0 | 1.0 | 1.0 | N/A |
| DiffPIR | \(\lambda\)（regularization） | 1.0 | 100.0 | 10.0 | 1000.0 | N/A |
| PnP-GS | \(\gamma\)（learning rate） | - | 2.0 | 2.0 | 1.0 | N/A |
| PnP-GS | \(\alpha\)（inertia param.） | 0.3 | 0.3 | 1.0 | 0.3 | N/A |
| PnP-GS | \(\sigma_f\)（factor for noise input） | 1.5 | 1.8 | 5.0 | 1.0 | N/A |
| PnP-GS | niter（number of iter.） | 5 | 60 | 50 | 30 | N/A |
| OT-ODE | \(t_0\)（initial time） | 0.1 | 0.2 | 0.1 | 0.1 | 0.1 |
| OT-ODE | \(\gamma\) | constant | time-dependent | constant | constant | time-dependent |
| Flow-Priors | \(\lambda\)（regularization） | 30 | 3,000 | 30,000 | 30,000 | 10,000 |
| Flow-Priors | \(\eta\)（learning rate） | 0.01 | 0.01 | 0.1 | 0.01 | 0.01 |
| PnP-Flow | \(\alpha\)（learning-rate factor） | 0.8 | 0.01 | 0.01 | 0.01 | 0.3 |
| PnP-Flow | \(N\)（Number of time steps） | 100 | 100 | 100 | 100 | 100 |
| PnP-Flow | \(N_{\mathrm{Avg}}\)（Number of averagings） | 1 | 1 | 1 | 1 | 1 |
| Flower | \(\gamma\)（refinement uncertainty） | 0 | 0 | 0 | 0 | 0 |
| Flower | \(N\)（Number of time steps） | 100 | 100 | 100 | 100 | 100 |
| Flower | \(N_{\mathrm{Avg}}\)（Number of averagings） | 1 | 1 | 1 | 1 | 1 |
| D-Flow | \(\lambda\)（regularization） | 0.001 | 0.001 | 0.001 | 0.01 | 0.001 |
| D-Flow | \(\alpha\)（blending） | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 |
| D-Flow | niter（number of iter.） | 3 | 7 | 10 | 20 | 9 |
| P-Flow | \(\eta\)（learning rate） | 0.3 | 0.2 | 0.5 | 0.4 | 0.3 |
| P-Flow | \(K\)（Number of iter.） | 100 | 100 | 100 | 100 | 100 |
| P-Flow | \(N\)（Number of ODE steps） | 10 | 5 | 10 | 5 | 10 |

**表 9（原文 Table 9）：** AFHQ-Cat 数据集上所有方法的超参数。

| 方法 | 超参数 | 去噪 | 去模糊 | 超分 | 随机修补 | 盒式修补 |
|---|---|---|---|---|---|---|
| DiffPIR | \(\zeta\)（blending） | 1.0 | 1.0 | 1.0 | 1.0 | N/A |
| DiffPIR | \(\lambda\)（regularization） | 1.0 | 100.0 | 10.0 | 10.0 | N/A |
| PnP-GS | \(\gamma\)（learning rate） | - | 2.0 | 2.0 | 1.0 | N/A |
| PnP-GS | \(\alpha\)（inertia param.） | 1.0 | 0.3 | 1.0 | 0.5 | N/A |
| PnP-GS | \(\sigma_f\)（factor for noise input） | 1.0 | 1.8 | 5.0 | 1.0 | N/A |
| PnP-GS | niter（number of iter.） | 1 | 60 | 50 | 23 | N/A |
| OT-ODE | \(t_0\)（initial time） | 0.1 | 0.3 | 0.1 | 0.1 | 0.1 |
| OT-ODE | \(\gamma\) | time-dependent | time-dependent | constant | constant | time-dependent |
| Flow-Priors | \(\lambda\)（regularization） | 30 | 1,000 | 30,000 | 30,000 | 10,000 |
| Flow-Priors | \(\eta\)（learning rate） | 0.01 | 0.01 | 0.1 | 0.01 | 0.01 |
| PnP-Flow | \(\alpha\)（learning-rate factor） | 0.8 | 0.01 | 0.01 | 0.01 | 0.3 |
| PnP-Flow | \(N\)（Number of time steps） | 100 | 100 | 100 | 100 | 100 |
| PnP-Flow | \(N_{\mathrm{Avg}}\)（Number of averagings） | 1 | 1 | 1 | 1 | 1 |
| Flower | \(\gamma\)（refinement uncertainty） | 0 | 0 | 0 | 0 | 0 |
| Flower | \(N\)（Number of time steps） | 100 | 100 | 100 | 100 | 100 |
| Flower | \(N_{\mathrm{Avg}}\)（Number of averagings） | 1 | 1 | 1 | 1 | 1 |
| D-Flow | \(\lambda\)（regularization） | 0.001 | 0.01 | 0.001 | 0.001 | 0.01 |
| D-Flow | \(\alpha\)（blending） | 0.1 | 0.5 | 0.1 | 0.1 | 0.1 |
| D-Flow | niter（number of iter.） | 3 | 20 | 20 | 20 | 9 |
| P-Flow | \(\eta\)（learning rate） | 0.2 | 0.2 | 0.3 | 0.3 | 0.2 |
| P-Flow | \(K\)（Number of iter.） | 100 | 100 | 100 | 100 | 100 |
| P-Flow | \(N\)（Number of ODE steps） | 10 | 5 | 10 | 10 | 10 |

## 附录 E 实验统计显著性

图 7 展示了去噪任务结果的统计分布与标准差。

**图 7（原文 Fig. 7）：** 去噪任务的定量误差分布。直方图展示 FFHQ 与 AFHQ-Cat 上 PSNR、SSIM 与 LPIPS 指标的变化，并给出每个指标的均值（\(\mu\)）与标准差（\(\sigma\)）：FFHQ 的 PSNR \(=32.45,\sigma=1.37\)；SSIM \(=0.894,\sigma=0.024\)；LPIPS \(=0.078,\sigma=0.023\)。AFHQ-Cat 的 PSNR \(=32.09,\sigma=1.69\)；SSIM \(=0.880,\sigma=0.031\)；LPIPS \(=0.106,\sigma=0.035\)。

## 附录 F 附加结果

### F.1 附加的跨任务比较

图 8 与图 9 分别给出 FFHQ 与 AFHQ-Cat 上的附加比较。与正文示例不同，这两幅图在同一张底层图像上评估所有复原任务。这种布局突出了跨任务一致性，并便于比较各方法的失效模式，包括纹理过度平滑、身份失真、色偏与结构伪影。这些结果在定量指标之外补充说明：P-Flow 在不同退化类型下都保持了连贯的全局结构与真实细节。

**图 8（原文 Fig. 8）：** 以 PSNR 指标比较 FFHQ 数据集上各图像复原方法。行列结构同图 2。

**图 9（原文 Fig. 9）：** 以 PSNR 指标比较 AFHQ-Cat 数据集上各图像复原方法。行列结构同图 2。

### F.2 严重病态条件

我们进一步评估 P-Flow 在极端病态测量情形下的稳定性（表 10），包括高倍超分辨率（8× 与 16×）与极稀疏随机修补（95% 与 99% 掩蔽）。在超分辨率任务中（图 10 与图 11），P-Flow 显著优于 Flower 与 PnP-Flow，在基线开始崩溃之处仍保持了连贯的面部结构。在极端随机修补任务中（图 12 与图 13），基线在 95% 掩蔽下出现严重身份失真，在 99% 掩蔽下几乎完全感知崩溃；相比之下，P-Flow 始终恢复出更连贯的全局结构与更合理的面部身份。

**表 10（原文 Table 10）：** 严重病态条件下的定量比较。评估 PnP-Flow、Flower 与 P-Flow 在 128 张测试图像上的平均表现。（a）FFHQ 数据集结果；（b）AFHQ 数据集结果。原文含粗体强调，本表仅照抄数值。

**（a）FFHQ 数据集**

| 方法 | 8×SR PSNR | 8×SR SSIM | 8×SR LPIPS | 16×SR PSNR | 16×SR SSIM | 16×SR LPIPS | 95% 随机修补 PSNR | 95% 随机修补 SSIM | 95% 随机修补 LPIPS | 99% 随机修补 PSNR | 99% 随机修补 SSIM | 99% 随机修补 LPIPS | \(\sigma=1.0\) 去噪 PSNR | \(\sigma=1.0\) 去噪 SSIM | \(\sigma=1.0\) 去噪 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Degraded | 11.35 | 0.323 | 0.974 | 11.36 | 0.359 | 0.896 | 11.59 | 0.255 | 1.108 | 11.50 | 0.307 | 1.032 | 9.16 | 0.038 | 1.281 |
| Flow-Priors | 15.86 | 0.252 | 0.616 | 13.38 | 0.206 | 0.702 | 19.41 | 0.451 | 0.436 | 18.49 | 0.420 | 0.479 | 17.13 | 0.170 | 0.795 |
| PnP-Flow | 15.70 | 0.442 | 0.504 | 13.26 | 0.417 | 0.583 | 22.21 | 0.682 | 0.234 | 17.82 | 0.547 | 0.420 | 15.80 | 0.153 | 0.838 |
| Flower | 14.58 | 0.423 | 0.526 | 12.91 | 0.415 | 0.589 | 22.27 | 0.683 | 0.230 | 17.86 | 0.549 | 0.417 | 24.88 | 0.742 | 0.247 |
| D-Flow | 19.96 | 0.463 | 0.312 | 13.13 | 0.238 | 0.765 | 11.81 | 0.150 | 1.139 | 8.54 | 0.077 | 1.204 | 9.98 | 0.041 | 1.201 |
| **P-Flow** | 20.34 | 0.620 | 0.262 | 17.52 | 0.527 | 0.341 | 24.66 | 0.760 | 0.154 | 20.97 | 0.640 | 0.254 | 25.50 | 0.749 | 0.180 |

**（b）AFHQ-Cat 数据集**

| 方法 | 8×SR PSNR | 8×SR SSIM | 8×SR LPIPS | 16×SR PSNR | 16×SR SSIM | 16×SR LPIPS | 95% 随机修补 PSNR | 95% 随机修补 SSIM | 95% 随机修补 LPIPS | 99% 随机修补 PSNR | 99% 随机修补 SSIM | 99% 随机修补 LPIPS | \(\sigma=1.0\) 去噪 PSNR | \(\sigma=1.0\) 去噪 SSIM | \(\sigma=1.0\) 去噪 LPIPS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Degraded | 11.86 | 0.317 | 0.958 | 11.87 | 0.353 | 0.885 | 12.11 | 0.252 | 1.119 | 12.02 | 0.302 | 1.039 | 9.15 | 0.037 | 1.314 |
| Flow-Priors | 18.46 | 0.371 | 0.482 | 15.12 | 0.301 | 0.611 | 21.74 | 0.532 | 0.400 | 21.27 | 0.516 | 0.427 | 17.23 | 0.173 | 0.795 |
| PnP-Flow | 16.70 | 0.448 | 0.517 | 14.68 | 0.419 | 0.592 | 23.38 | 0.665 | 0.239 | 19.06 | 0.540 | 0.420 | 16.19 | 0.166 | 0.773 |
| Flower | 16.60 | 0.475 | 0.506 | 14.63 | 0.437 | 0.588 | 23.44 | 0.666 | 0.236 | 19.10 | 0.540 | 0.417 | 24.89 | 0.693 | 0.339 |
| D-Flow | 12.56 | 0.125 | 1.054 | 9.62 | 0.079 | 1.109 | 25.86 | 0.710 | 0.126 | 19.52 | 0.438 | 0.519 | 10.56 | 0.050 | 1.142 |
| **P-Flow** | 23.32 | 0.621 | 0.254 | 19.70 | 0.524 | 0.341 | 26.38 | 0.731 | 0.154 | 22.86 | 0.626 | 0.236 | 25.73 | 0.717 | 0.207 |

这些退化只提供微弱或稀疏的测量引导。在高倍超分辨率中，大部分高频信息不在观测中；在极端随机修补中，只有极小比例的像素可用于约束重建。两种情形下数据一致性信号都不足以确定缺失的语义内容，因此重建质量在很大程度上取决于方法能否保持并利用生成先验。

PnP-Flow 依赖对中间状态反复做数据保真更新。在极弱测量下，这些更新提供的关于缺失结构的信息有限，却仍会扰动轨迹。Flower 通过近端测量步精化预测目标来缓解该问题，但其精化仍由高度不完整的观测驱动。当测量过于稀疏或维度太低时，精化后的目标可能受到弱约束，导致过于保守或结构不稳定的重建。

P-Flow 避免反复校正中间状态：它在潜源空间中做优化，然后通过原始流轨迹生成重建。高斯球面投影防止源变量漂离典型先验区域，而未修改的 ODE 轨迹保留了学到的生成动力学。因此即便测量信号极其微弱，P-Flow 也能依靠完整的生成路径产生语义连贯、视觉合理的结构。

**图 10（原文 Fig. 10）：** FFHQ 数据集上 8×SR 的视觉比较。比较所提 P-Flow 与 PnP-Flow、Flower；每张复原图右下角标注其 PSNR。

**图 11（原文 Fig. 11）：** FFHQ 数据集上 16×SR 的视觉比较。比较所提 P-Flow 与 PnP-Flow、Flower；每张复原图右下角标注其 PSNR。

**图 12（原文 Fig. 12）：** FFHQ 数据集上 95% 像素被掩蔽的随机修补视觉比较。比较所提 P-Flow 与 PnP-Flow、Flower；每张复原图右下角标注其 PSNR。

**图 13（原文 Fig. 13）：** FFHQ 数据集上 99% 像素被掩蔽的随机修补视觉比较。比较所提 P-Flow 与 PnP-Flow、Flower；每张复原图右下角标注其 PSNR。

### F.3 高测量噪声

在高测量噪声条件下（图 14），P-Flow 与 Flower 都保持结构稳定，而 PnP-Flow 表现出严重的视觉失真。Flower 避免了完全崩溃，但引入了明显的色偏，并产生更平滑、细节更少的重建。相比之下，P-Flow 保留了更锐利的纹理并取得更高的视觉保真度。

这一差异可归因于各方法如何纳入不可靠的测量信息。PnP-Flow 直接把数据保真更新施加到中间迭代量上，然后再把它们重投影到流路径并施加时间相关去噪器。当观测被噪声主导时，这些更新变得高度不可靠，可能把中间状态推离基于流的去噪器所训练的时间边缘分布，从而削弱后续去噪步的效果，并可能导致图 14 中观察到的灾难性畸变。

Flower 更稳健，因为它通过测量感知的近端步精化预测目标，而不是把原始梯度注入中间状态。然而当测量噪声极大时，精化信号变得微弱且含糊。在该情形下 Flower 倾向于表现为一种保守的目标精化方法：它保持全局结构，但可能压制高频细节并偏置低频图像统计量，表现为过度平滑与色偏。

P-Flow 在结构上不同于两种基线：它不修改学到的向量场，也不打断中间流轨迹，含噪测量只用于引导潜源变量的更新；高斯球面投影进一步把优化后的源保持在先验的典型区域内。因此 P-Flow 用含噪观测在多个可行生成轨迹之间做选择，而最终图像仍由未修改的“源到数据”流产生。这种测量引导与生成动力学的分离，使 P-Flow 在数据保真信号被严重破坏时更为稳健。

**图 14（原文 Fig. 14）：** FFHQ 数据集上 \(\sigma=1.0\) 去噪的视觉比较。比较所提 P-Flow 与 PnP-Flow、Flower；每张复原图右下角标注其 PSNR。

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、正文第 1–7 节（§1 引言含三条贡献、§2 背景与 §2.1–2.3、§3 方法与 §3.1–3.3、§4 相关工作三类范式、§5 数值结果与 §5.1–5.2、§6 结论、§7 局限性）、式 (1)–(16) 与附录式 (17)–(30)、算法 1–2（逐行）、表 1–10（逐格数值转写）、图 1–14 图注、附录 A–F（A.1–A.4 证明、B 算法、C.1–C.5 消融、D 实现细节、E 统计显著性、F.1–F.3 附加结果）、参考文献 [1]–[42]（英文原条目）；原文无伦理声明/无附录之外的补充材料。**重点核对说明（与 lead 指定核对点一致）：** ① 表 1（FFHQ）超分辨率 PSNR：**P-Flow 27.64 dB**，PnP-Flow 为 **24.58 dB**（已按 PDF 第 7 页 5.5× 放大渲染逐格核对）；② 表 1 去模糊 PSNR：**P-Flow 28.07 dB 低于 DiffPIR 29.41 dB**（原文正文亦明确承认“在重建保真度上存在相对短板”，本页照译未加修饰）；③ 表 2（AFHQ-Cat）随机修补 PSNR：**P-Flow 32.73 dB 低于 PnP-Flow 33.90 dB**（同样按渲染页核对）；④ 式 (14)–(16) 中把 \(\log|\det\nabla_{X_0}\psi|\) 视为“近似常数偏移”是原文基于“近直线轨迹 → 映射更规则 → Jacobian 行列式相对稳定”给出的**启发式论证，并非严格定理**：原文仅称该项“在典型区域上变化很小、可作为近似常数偏移”，**并未推出 logdet 为常数、也未断言 Jacobian 为标量**；本页译文严格保留原文的这一弱化表述（用“近似常数偏移/变化很小”），未做强化；⑤ 第 2.3 节与第 3.1 节第 3 步的**固定半径球面投影**是受**高斯环带定理（Gaussian annulus theorem）**与高维测度集中（“肥皂泡”效应）启发而引入的**启发式约束**，原文并未声称它是从后验或 MAP 目标严格推导出的投影；本页译文同样保留“基于/受…启发”的措辞。**已知缺陷与核查疑点：** ⑥ pypdf 抽取把表格的列结构与粗体/下划线标记全部压平（数值连写、最优/次优强调丢失）：本页表 1、2 的数值已按 PDF 第 7 页 5.5× 放大渲染逐格核对，其粗体最优按指标方向（PSNR/SSIM 越大越好、LPIPS 越小越好）由数值判定、并与渲染页所见的强调抽样比对一致；表 3 的数值与粗体按第 15 页渲染核对；表 4、5、6、10 的数值按第 16、17、23 页渲染核对，但**未复制原文的粗体/下划线强调**（已在各表题注说明），表 8、9 的超参数按第 18、19 页抽取文本转写（未逐格渲染核对）；⑦ 原文表 7 存在内部不一致：正文称该基准在 **FFHQ 随机修补**任务上测得，而表题为 **super-resolution**，本页如实照录并加注；⑧ 附录 A.2 的证明本身为启发式论证（原文使用了“under certain alignment conditions”“worst-case scenario”等限定），本页照译未强化；⑨ 图 4、图 5、图 7 等为位图，图注按原文翻译并按渲染页补注了坐标轴/图例信息；⑩ 表 1/2 中 PSNR、SSIM、LPIPS 分别为越高越好、越高越好、越低越好，粗体按该方向判定，与渲染页观察一致（原文另以下划线标次优，本页从略）。**建议后续 QA 重点：** 式 (12) 中代理标量 \(C\) 与学习率 \(\eta\) 的合并约定、式 (17) 累积 Jacobian 的乘积下标、命题 2/3 的假设措辞（“持续性谱各向异性”“方向正对齐”）、表 7 的任务口径不一致、以及表 4–6、10 若需补齐粗体标记时的逐格核对。逐句逐式终校未做。

---

**登记（2026-11-04）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
