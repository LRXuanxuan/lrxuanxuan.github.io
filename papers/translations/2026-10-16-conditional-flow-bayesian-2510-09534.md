---
layout: page
title: "用于贝叶斯后验推断的条件流匹配｜中文阶段性译稿"
permalink: /papers/translations/2026-10-16-conditional-flow-bayesian-2510-09534/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原文 PDF](https://arxiv.org/pdf/2510.09534v3)

# 用于贝叶斯后验推断的条件流匹配

**原题：** Conditional Flow Matching for Bayesian Posterior Inference  
**作者：** Percy S. Zhai、So Won Jeong、Veronika Ročková  
**单位：** 芝加哥大学布斯商学院  
**版本：** arXiv:2510.09534v3，2026 年 4 月 1 日，共 30 页。  
**译文范围：** 摘要、引言、正文 2–5 节及主要公式、实验表格已译；参考文献与附录 A–E 及细节仍待逐段逐式翻译。**本页不属于全文验收稿。**

## 摘要

本文提出一种基于流匹配的多元贝叶斯后验生成式采样器。它具有简单的训练目标，且无需计算似然函数。该方法在数据与参数构成的联合空间中学习一个动态的**块三角速度场**，进而得到从源分布到目标后验分布的确定性传输映射。对速度场进行反向时间积分，即可得到逆映射，称为**向量秩（vector rank）**。

利用动态结构还具有其他优势：在速度场上施加适当约束，可得到单调映射，继而导出条件 Brenier 映射，从而快速、同时生成多个置信水平下的贝叶斯可信集；这些可信集的边界与 Monge–Kantorovich 数据深度的等值集相对应。与基于生成对抗网络和扩散模型的对应方法相比，本文方法的计算负担更轻，同时能够捕捉复杂后验结构。最后，作者从频率学派的理论角度证明了所恢复后验分布以及相应贝叶斯可信集的一致性。

## 1. 引言

贝叶斯推断为统计模型中的不确定性量化提供了一套原则明确的框架，能够估计完整的后验分布。然而，精确计算后验往往不可行，计算代价因而成为主要瓶颈。传统方法依赖马尔可夫链蒙特卡洛（MCMC）或变分推断等近似技术，但它们可能收敛缓慢，或要求较强的分布假设。例如，每出现一个新的观测样本，MCMC 往往需要重新运行整条采样链。近年来，以基于得分的扩散模型和归一化流为代表的生成模型，为这一问题提供了有前景的替代途径。不过，这些方法仍有明显局限：扩散模型需要迭代去噪并近似得分函数；归一化流则对可逆性和精确似然计算提出约束。

本文基于流匹配（Flow Matching，FM）开发新的贝叶斯后验采样器。流匹配是一种生成建模技术，通过学习确定性速度场，将简单源分布传输到复杂目标分布。考虑参数空间 $\Theta\subset\mathbb R^d$ 与数据空间 $\mathcal Y\subset\mathbb R^n$。观测 $y\in\mathcal Y$ 由参数 $\theta\in\Theta$ 产生，可以通过显式似然 $L(y\mid\theta)$ 描述，也可以通过隐式仿真器生成。观测向量的各分量之间允许存在依赖关系。将数据生成机制与先验仿真器 $\pi(\theta)$ 结合，就能够构造联合样本 $\{(y_i,\theta_i)\}_{i=1}^N$，而且通常能以较低计算代价生成大量样本。该设置可以在没有显式似然的情况下实现条件推断，即所谓的**基于仿真的推断**（Simulation-Based Inference，SBI）。

对于固定观测 $y^*\in\mathcal Y$，贝叶斯推断的主要目标是从后验 $\pi(\theta\mid y^*)$ 中采样。从最优传输视角看，这等价于学习一个映射，将均匀分布等源分布传输到目标后验。既有文献沿这一思路提出了多种方法。例如，Wang 与 Ročková（2022）利用生成对抗网络学习后验采样器；Baptista 等（2024）的单调 GAN（M-GAN）也采用类似路线；Kim 等（2025b）则提出条件分位数学习方法，在参数空间中恢复最优传输映射。尽管实现方式不同，后两类方法均可在单调性假设下得到条件 Brenier 映射。本文从流匹配出发，为学习此类映射提供一种动态扩展。

本文不直接学习后验边缘分布或条件分布，而是**在参数与观测的联合分布上进行匹配**。其理论基础是块三角映射。设联合映射 $T:\mathcal Y\times\Theta\to\mathcal Y\times\Theta$，将随机噪声 $y_0\in\mathcal Y$ 和 $\theta_0\in\Theta$ 传输为数据 $y_1\in\mathcal Y$ 和参数 $\theta_1\in\Theta$：

$$
T(y_0,\theta_0)=\bigl(F(y_0),G(F(y_0),\theta_0)\bigr).\tag{1}
$$

其中 $F:\mathcal Y\to\mathcal Y$，$G:\mathcal Y\times\Theta\to\Theta$。这种映射称为块三角映射，因为联合传输映射的雅可比矩阵具有下块三角结构。Baptista 等（2024）的一个重要理论结果指出：如果这样的映射把联合源分布 $\eta$ 推送到目标联合分布，即 $T_\#\eta=\pi(y,\theta)$，那么 $G(y^*,\cdot)$ 就能把源分布在 $\Theta$ 空间中的边缘传输到 $\theta$ 的后验分布。因此，后验采样可以转化为学习块三角的联合传输映射。M-GAN 使用对抗训练学习 $G(y^*,\cdot)$，本文则通过流匹配学习整个 $T$。

具体而言，对任意 $t\in[0,1]$，本文在联合空间 $\mathcal Y\times\Theta$ 上学习速度场，使其从 $t=0$ 到 $t=1$ 产生块三角传输。动态设计使训练更加方便，例如可以自由选择插值路径，在降低计算成本的同时获得理论保证。当映射具有单调性时，本文方法以及上述 M-GAN、条件分位数神经网络，最终都能学习条件 Brenier 映射，即从源分布到后验分布的最优传输。不同的是，M-GAN 使用对抗训练，条件分位数网络使用分位数目标或最优传输目标，而本文使用流匹配架构，并在连续时间中学习动态映射。

在本文稿完成后，作者注意到 Kerrigan 等（2024）和 Chemseddine 等（2024）的同期研究。它们将观测视为固定输入，学习条件速度场，并以最优传输性质为目标。本文则在联合空间上学习块三角速度场，并强调所估计后验分布的一致性，而不是仅研究源分布至目标分布的最优传输。

**主要贡献。** 第一，提出无需显式似然的后验采样器（第二节），与具有相近采样精度的 MCMC 和 M-GAN 相比，需要更少计算时间。方法是块三角传输的动态扩展，并能直接访问逆映射。第二，利用单调性建立基于可信集的推断方法（第 2.3 节），在适当假设下，无须重复学习映射，就可以同时获得多个可信水平下的嵌套集合；其边界对应 Monge–Kantorovich 数据深度的等值集。逆映射提供条件向量秩函数，可用与 $p$ 值类似的方式衡量给定参数相对于后验的位置。第三，第三节建立学习后验的一致性理论：当速度场由 ReLU 多层感知机学习时，所估计的后验在二阶 Wasserstein 距离下收敛至真实后验；相应的贝叶斯可信集在 Hausdorff 距离下也具有一致性。

**原文表 1：后验采样生成方法的比较。** 表中 ✓ 表示直接支持，∼ 表示在约束下或间接支持，× 表示不直接支持。

| 属性 | 流匹配（本文） | GAN | 扩散模型 | 分位数神经网络 |
|---|---|---|---|---|
| 核心思想 | 学习将噪声送至联合分布的 ODE 速度场 | 学习与判别器对抗的生成器 | 估计得分以逆转加噪过程 | 直接学习条件分位数／Brenier 映射 |
| 训练目标 | 回归损失 | 对抗损失 | 得分匹配损失 | Pinball 损失或 MK 目标 |
| 无似然 | ✓ | ✓ | ∼ | ✓ |
| 逆映射 | ✓ | × | ∼ | × |
| 不确定性量化 | ✓ | ∼ | × | ✓ |

## 2. 方法

本文的方法建立在式（1）的块三角映射理论上，但与 M-GAN 有本质区别。首先，作者把块三角映射扩展到动态领域：不再学习单次传输映射，而是在 $t\in[0,1]$ 上学习动态映射，因此可以自由选择中间状态与插值路径。其次，不同于直接学习后验传输映射的诸多方法，本文在联合空间 $\mathcal Y\times\Theta$ 上学习映射，把边缘传输与条件传输分开，降低速度场神经网络的表示负担，并带来更大的灵活性。此外，该方法还能得到数据映射 $F$ 以及逆映射 $F^{-1}$ 和 $[G(y^*,\cdot)]^{-1}$。

为恢复后验，只要求最终训练所得的映射 $T$ 具有式（1）的块三角形式。由 Baptista 等（2024）的定理 3.4，$G(y^*,\cdot)$ 能把噪声 $\theta_0$ 传输至后验 $\pi(\cdot\mid y^*)$。本文通过学习联合空间上的动态速度场来得到 $T$，并通过从初始时刻到终止时刻累积速度恢复联合传输映射。以下不失一般性地将终止时间设为 1。

### 2.1 通过流匹配学习联合分布

记 $x_t=(y_t,\theta_t)$。目标是从源分布 $x_0\sim p_0$ 学习传输到目标联合分布 $x_1\sim p_1=\pi(y_1,\theta_1)$ 的映射。这可以用流匹配实现：学习一个确定性速度场，控制随时间演化的流 $x_t$。一般将从 $t_0$ 开始的流记为 $\{x_{t_0,t}\}_{t\in[t_0,1]}$；在本文中 $t_0=0$、$x_{0,0}=x_0$，简记为 $x_t$。每条流对应速度场 $v_t(x_t)=\mathrm dx_t/\mathrm dt$。因此，中间状态 $x_t$ 是从初始时刻到 $t$ 的速度累积结果，并定义从 $x_0$ 出发的动态推前映射 $T_t$；最终 $T_1$ 对应式（1）的 $T$。

把速度场写为 $v:\mathcal X\times[0,1]\to\mathbb R^{n+d}$，流匹配目标定义为

$$
\mathcal L_{\rm FM}(\hat v,v)=\int_0^1\mathbb E_{x\sim p_t}\lVert\hat v_t(x)-v_t(x)\rVert^2\,\mathrm dt.\tag{2}
$$

由于真实速度场 $v_t$ 未知，该目标通常不能直接求解。Lipman 等（2023）提出条件流匹配：将 $p_t$ 隐式表示为条件分布的混合，

$$
p_t(x)=\int p_t(x\mid z)q(z)\,\mathrm dz,
$$

其中 $z$ 为辅助条件变量，通常取端点对 $z=(x_0,x_1)$，$q(z)$ 是已知的端点联合分布。一种常见选择是高斯插值路径：

$$
x_t=\mu_t(z)+\varepsilon,\qquad\varepsilon\sim\mathcal N(0,\sigma_t^2 I),\tag{3}
$$

其中 $\mu_t(z)=(1-t)x_0+tx_1$ 为线性插值均值，$\sigma_t>0$ 控制条件分布的扩散程度。给定初末状态，条件速度场显式地写为

$$
v_t(x\mid x_0,x_1)=\frac{\sigma_t'}{\sigma_t}(x-\mu_t)+\mu_t',
$$

撇号表示对时间的导数。实践中作者使用 $\sigma_t\to0$ 的确定性极限，从而得到直线路径 $x_t=(1-t)x_0+tx_1$ 与条件速度 $v_t(x\mid x_0,x_1)=x_1-x_0$。

由此，条件流匹配损失为

$$
\mathcal L_{\rm CFM}(\hat v,v)=\int_0^1\mathbb E_{q(z),p_t(x\mid z)}\lVert\hat v_t(x)-v_t(x\mid z)\rVert^2\,\mathrm dt.\tag{4}
$$

该目标仅需从 $q(z)$ 和插值路径采样，因此完全可计算。Lipman 等（2023）证明，式（4）与式（2）仅相差一个与神经网络参数无关的常数。因此，对于神经网络参数 $\phi$，两个目标的梯度相同：

$$
\nabla_\phi\mathcal L_{\rm FM}=\nabla_\phi\mathcal L_{\rm CFM}.\tag{5}
$$

于是，只需最小化条件流匹配损失，就能够得到使原始流匹配目标最小的学习速度场 $\hat v_t(x)$。

### 2.2 动态块三角映射

为了使流匹配学习的动态联合映射具有块三角结构，一个在理论和实践上方便的设定是要求任意 $t\in[0,1]$ 下的 $T_t$ 均为块三角映射：

$$
T_t(y_0,\theta_0)=\bigl(F_t(y_0),G_t(F_t(y_0),\theta_0)\bigr).\tag{6}
$$

其中 $F_t:\mathcal Y\to\mathcal Y$ 把 $y_0$ 映射到 $y_t$，$G_t:\mathcal Y\times\Theta\to\Theta$ 把初始联合样本映射到 $\theta_t$。在 $t=1$ 时，$F_1$ 和 $G_1$ 分别对应 $F$ 与 $G$。只要累积如下块三角形式的速度场，就可以得到式（6）的动态映射：

$$
\frac{\mathrm dy_t}{\mathrm dt}=f_t(y_t),\qquad
\frac{\mathrm d\theta_t}{\mathrm dt}=g_t(y_t,\theta_t).\tag{7}
$$

第一个常微分方程的解可表示为 $y_t=F_t(y_0)$。由于流可以逆向积分，因此也可以根据终点 $y_1$ 表示任意时刻的 $y_t$：

$$
\widetilde F_t(y_1)=y_t=F_t(y_0)=F_t(F^{-1}(y_1)).\tag{8}
$$

于是，式（7）的第二个方程可以写成 $\mathrm d\theta_t/\mathrm dt=g_t(\widetilde F_t(y_1),\theta_t)$，成为关于 $\theta_t$ 的常微分方程，其中 $y_1$ 固定，$\theta_0$ 为参数空间中的噪声实现。该方程的解可以记为 $\theta_t=G_t(y_1,\theta_0)$，等价于式（6）的形式。因此得到**引理 1**：如果速度场具有式（7）的块三角形式，那么由它生成的动态映射 $T_t$ 在整个区间 $[0,1]$ 都具有式（6）的块三角结构。

这意味着，只要速度场采用块三角设计，就可以保证整个动态过程以及最终 $t=1$ 的映射均为块三角映射。对于固定的观测 $y^*$，可以将噪声 $\theta_0$ 经学习得到的速度场进行推前，从而模拟后验：

$$
G(y^*,\theta_0)=\theta_0+\int_0^1g_t\bigl(\widetilde F_t(y^*),\theta_t\bigr)\,\mathrm dt.\tag{9}
$$

如果速度场学习足够准确，那么从源分布采样多个 $\theta_0$ 并通过 $G(y^*,\cdot)$ 映射，所得样本 $\theta_1$ 应服从后验分布 $\pi(\cdot\mid y^*)$。式（9）构成本文后验模拟算法的核心。动态设计还使映射天然可逆：对给定 $y^*$，通过逆向积分式（9），即可获得 $G(y^*,\cdot)$ 的逆映射。作者将在第 2.3 节讨论如何利用该逆映射完成推断。

需要强调的是，块三角联合流的可选范围确实比完全一般的联合映射更小，但这种结构**不会降低最终联合分布的表示能力**。任意目标联合分布都可先通过 $y$ 的边缘分布传输，再通过 $\theta\mid y$ 的条件分布传输得到。结构限制主要作用于 $t\in(0,1)$ 的中间流路径，而非目标分布本身。

### 2.3 单调性、Monge–Kantorovich 深度与逆映射

利用块三角映射，已经能够建立恢复真实后验 $\pi(\cdot\mid y^*)$ 的采样器。从最优传输角度看，将 $\Theta$ 上的源分布推送到真实后验的映射并不唯一。这种非唯一性并不影响后验采样本身的准确性；但如果希望利用恢复的后验开展统计推断，例如构造具有明确解释的贝叶斯可信集，则有必要进一步假设 $G(y^*,\cdot)$ 是单调映射。具体而言，对于任意 $\theta_0,\theta'_0\in\Theta$，要求

$$
\bigl(G(y^*,\theta_0)-G(y^*,\theta'_0)\bigr)^\top(\theta_0-\theta'_0)\geq 0.
$$

这种单调性使我们能够以较小计算代价获得嵌套可信集。实现单调性的一个方法，是将速度场在参数空间中的分量 $g_t(y_t,\theta_t)$ 限制为关于 $\theta_t$ 的单调函数。较为严格的实现形式为

$$
g_t(y,\theta)=\nabla_\theta\psi_t(y,\theta),\tag{10}
$$

其中 $\psi_t(y,\theta)$ 对 $\theta$ 是凸函数。我们可以使用输入凸神经网络（input convex neural network，ICNN）训练该凸函数。这种实现是本文方法与 Kerrigan 等（2024）同期研究的重要区别之一。

在单调性假设下，原文进一步指定一个**径向均匀、方向在球面上均匀**的源分布：$\theta_0=r\phi$，其中 $r\sim\mathrm{Unif}(0,1)$，$\phi$ 在单位球面 $\mathbb S^{d-1}(1)$ 上均匀分布。原文称其为 *spherical uniform*。**核对说明：** 在 $d>1$ 时，半径 $r$ 均匀与通常所谓的“单位球内体积均匀分布”并不等价；此处严格采用论文给出的径向定义，避免将两种测度混淆。在这种情况下，$G(y^*,\cdot)$ 可以视为多元 Monge–Kantorovich（MK）条件向量分位数，即 Brenier 映射，记为 $Q_{\theta\mid y^*}:\Theta\to\Theta$。于是，可将一个球通过算法 1 学得的传输映射，以构造贝叶斯 $\tau$ 可信集：

$$
\widehat C_\tau(y^*)=\widehat G(y^*,\mathbb S^d(\tau)).\tag{11}
$$

对于不同的 $\tau$，只需要将不同半径的球通过同一个 $\widehat Q_{\theta\mid y^*}$，就能得到多个嵌套可信集，无须重新采样或重新训练。下文将证明，在适当正则条件下，这些集合能够收敛到理想可信集

$$
C_\tau(y^*)=G(y^*,\mathbb S^d(\tau)).\tag{12}
$$

这些理想集合与概率质量为 $\tau$ 的 MK 深度区域一致；它们可以理解为多元情形下分位数区间的对应物。

由于映射通过流匹配学习，我们还天然能够求出其逆映射，称为 **MK 条件向量秩**（conditional vector rank）：

$$
R_{\theta\mid y^*}(\theta_1)=[G(y^*,\cdot)]^{-1}(\theta_1).\tag{13}
$$

MK 条件向量秩可分解为条件秩函数 $r_{\theta\mid y^*}:\Theta\to[0,1]$ 与条件符号函数 $u_{\theta\mid y^*}$，分别定义为

$$
r_{\theta\mid y^*}(\theta_1)=\|R_{\theta\mid y^*}(\theta_1)\|,
\qquad
u_{\theta\mid y^*}(\theta_1)=
\frac{R_{\theta\mid y^*}(\theta_1)}{r_{\theta\mid y^*}(\theta_1)}\in\mathbb S^{d-1}(1).
$$

秩函数表征参数在后验分布中的 MK 深度：$\theta_1$ 的 MK 深度不小于 $\theta'_1$，当且仅当 $r_{\theta\mid y^*}(\theta_1)\leq r_{\theta\mid y^*}(\theta'_1)$。该函数发挥类似 $p$ 值的作用：如果它接近 1，那么相应的 $\theta$ 不大可能是从后验分布中抽出的典型值。

**注释 3。** 使用 ICNN 表示式（10）存在一个限制：它所能产生的传输映射只包括扩张型映射，即 $\nabla_\theta G\succeq I$。一个实用的缓解方法是令源分布的方差显著小于目标分布的方差。附录 C.2 解释这一现象并给出另一种速度场形式。

## 3. 理论保证

本节研究估计后验的相合性。将源分布经学习得到的 $\widehat G(y^*,\cdot)$ 推送，可获得估计后验 $\widehat\pi(\theta\mid y^*)$。首先分析它与真实后验 $\pi(\theta\mid y^*)$ 的距离；随后，在额外单调性假设下，研究贝叶斯可信集的一致性。所有主要结果的证明列于原文附录 D。

### 3.1 块三角映射的保证

**假设 1（流的光滑性）。** 对任意 $\xi\in\mathcal Y\times\Theta$ 及 $t_0\in[0,1]$，从 $\widehat x_{t_0,t_0}=x_{t_0,t_0}=\xi$ 出发、分别由 $\widehat v_t$ 和 $v_t$ 支配的流 $\{\widehat x_{t_0,t}\}$、$\{x_{t_0,t}\}$ 均存在且唯一。此外，两种流都对 $\xi,t_0,t$ 连续可微。

**假设 2（空间 Lipschitz 性）。** 估计速度场 $\widehat v_t(x)$ 关于 $x,t$ 可微。对任意 $t\in(0,1)$，存在常数 $L_t$，使 $\widehat v_t(x)$ 关于 $x$ 满足 $L_t$-Lipschitz 条件。

假设 1 是求解式（7）常微分方程所必需的，假设 2 则限制估计速度场的光滑程度。这两项假设已足以借助 Benton 等（2024）的结果约束估计联合分布。本文进一步将这种保证拓展到条件后验。

**定理 1（后验采样器的准确性）。** 假设学习的速度场受到式（7）块三角结构的约束，且假设 1、2 成立。当流匹配损失满足 $\mathcal L_{\rm FM}(\widehat v,v)\leq\varepsilon_N^2$ 时，有

$$
\mathbb E_{\pi_Y}\!\left[W_2^2\bigl(\widehat\pi(\theta\mid Y),\pi(\theta\mid Y)\bigr)\right]
\leq 2Le^{2L}\varepsilon_N^2,
\qquad L=\int_0^1L_t\,\mathrm dt.
$$

这里 $\pi_Y$ 是 $Y$ 的边缘分布，$W_2$ 是二阶 Wasserstein 距离。直观地说，采样器质量既取决于训练损失优化到何种程度，也取决于速度场的空间 Lipschitz 常数；上界随该常数指数增长。常数 $L_t$ 同时反映观测速度分量与参数分量之间的变化。因此，作者建议在联合空间 $\mathcal Y\times\Theta$ 中对各维进行尺度调整，使其具有相近方差。实验也支持这种预处理能够改善采样性能，详见附录 E.2。

### 3.2 后验采样器的一致性

定理 1 的一个关键条件是流匹配损失足够小。自然的问题是：当生成式训练样本数 $N$ 增大时，能否保证 $\mathcal L_{\rm FM}\to0$？为回答这一问题，需要另外两个条件。

**假设 3（有界性）。** 存在有限常数 $M>0$，使得对全部 $t\in[0,1]$：（1）真实速度场各坐标满足统一上界 $M$；（2）前馈神经网络学得的速度场各坐标满足统一上界 $2M$；（3）联合样本所在区域紧致，满足 $\mathcal Y\subset[-M,M]^n$、$\Theta\subset[-M,M]^d$。其中 $\|\cdot\|_\infty$ 为相应函数的上确界范数。

**假设 4（光滑性）。** 存在正整数 $\beta$，使得真实速度场 $v$ 属于 Sobolev 球 $W^{\beta,\infty}([0,1]\times\mathcal X)$。

假设 3、4 沿用 Farrell 等（2021）关于 ReLU 多层感知机函数估计的分析条件。这些有界性假设是非参数统计中的常见条件，$M$ 只需有限而不要求数值特别小。假设 4 比普通连续可微更强，要求速度场随空间与时间变化得足够平滑。

**定理 2（后验的一致性）。** 在假设 3、4 给定的正则条件下，由采用 ReLU 激活函数的多层感知机学习的速度场满足

$$
\mathcal L_{\rm FM}(\widehat v,v)\longrightarrow0
\quad\text{a.s.},\qquad N\longrightarrow\infty.
$$

如果假设 1、2 也成立，则对于生成数据 $\{(y_i,\theta_i)\}_{i=1}^N$，有

$$
\sup_{y^*\in\mathcal Y}
W_2\bigl(\widehat\pi_{\theta\mid y^*},\pi_{\theta\mid y^*}\bigr)
\longrightarrow0\quad\text{a.s.}
$$

其中 a.s. 表示几乎必然收敛。也就是说，在这些条件下，估计后验的二阶 Wasserstein 误差会随样本数增长而消失。

### 3.3 推断理论

在速度场中加入单调性约束后，可以构造定理 2 关于可信集的推论。衡量两个集合 $A,B$ 之间差异的 Hausdorff 距离定义为

$$
d_H(A,B)=\max\left\{
\sup_{a\in A}\inf_{b\in B}\|a-b\|,
\sup_{b\in B}\inf_{a\in A}\|a-b\|
\right\}.
$$

**推论 3（可信集的一致性）。** 假设真实速度场 $v_t(x)$ 关于 $x$ 单调，并且定理 2 的全部假设成立。对任意 $\tau\in(0,1)$，随着 $N\to\infty$，有

$$
\sup_{y^*\in\mathcal Y}d_H\bigl(\widehat C_\tau(y^*),C_\tau(y^*)\bigr)
\longrightarrow0\quad\text{a.s.}
$$

因此，后验可信集在 Hausdorff 距离意义下收敛于真实 MK 深度区域。对于逆映射也能够得到相应的一致性结果。记估计的条件向量秩映射为 $\widehat R_{\theta\mid y^*}=[\widehat G(y^*,\cdot)]^{-1}$，并定义 $\widehat r_{\theta\mid y^*}(\theta)=\|\widehat R_{\theta\mid y^*}(\theta)\|$。

**命题 4（MK 条件秩）。** 在推论 3 的全部假设下，当 $\theta\sim\pi(\cdot\mid y^*)$ 时，对任意 $\alpha\in(0,1)$，

$$
\pi_{\theta\mid y^*}\!\left(\widehat r_{\theta\mid y^*}(\theta)>1-\alpha\right)
\longrightarrow\alpha,
$$

并且上述结论对于 $y^*\in\mathcal Y$ 一致成立，收敛是在训练数据增加时的几乎必然意义下成立。这说明该条件秩具有类似 $p$ 值的概率校准性质。

值得强调的是，本节理论并不局限于实验所用的算法 1。只要流匹配算法采用式（7）的块三角速度结构，并满足相关技术假设，理论保证仍可适用，包括进一步施加其他单调性约束的情况。不过，不同实验设置与网络结构下关于样本量 $N$ 的具体收敛速率可能不同；作者将有限样本收敛速率的研究留待后续工作。

## 4. 实验

本节从五个相互补充的方面验证方法。其余实验及完整设置见附录 E。

**流匹配的灵活性。** 首先研究联合采样器在强异方差几何结构下的表现。典型例子是 Neal's Funnel：

$$
\nu\sim\mathcal N(0,3^2),\qquad x\mid\nu\sim\mathcal N(0,e^\nu).\tag{14}
$$

在该分布中，$x$ 方向的尺度变化剧烈；狭窄的“漏斗颈部”要求很小的 MCMC 步长，而宽阔的“漏斗口部”适合较大步长，因此固定步长难以兼顾。生成模型则能够学习适应整体几何结构的全局传输映射。图 1 对比了真实采样、本文流模型、随机游走 Metropolis–Hastings 和 Hamiltonian Monte Carlo（HMC）。流模型训练一次耗时 7.50 秒，随后采样代价近乎可以忽略；随机游走方法难以覆盖漏斗口部，HMC 则难以充分覆盖颈部。图中标出的其他计时并不能脱离各算法采样配置直接视作统一的速度比较。

**观测维数 $n$ 增大时的可扩展性。** 第二项实验考虑高斯共轭模型，观测变量 $X\mid\mu,\sigma^2\sim\mathcal N(\mu,\sigma^2)$，并设先验 $\mu\mid\sigma^2\sim\mathcal N(\mu_0,\sigma^2/\kappa)$、$\nu_0\sigma_0^2/\sigma^2\sim\chi^2(\nu_0)$。对每一组参数 $(\mu_i,\sigma_i^2)$ 生成 $n$ 个观测，重复 $N$ 次，形成 $N$ 组观测与参数样本。图 2 展示 $n=2,4,8,16,32,64,128,256$ 时的后验估计。本文方法没有明显的过度收缩，表现接近直接使用似然的序贯蒙特卡洛（SMC）；M-GAN 从 $n=64$ 开始出现后验坍塌。

**一次训练与摊销式推断。** 作者将本文方法（$\Delta$-Flow）与引导流（G-Flow）、M-GAN、拒绝式近似贝叶斯计算（R-ABC）以及 SMC-ABC 比较。流匹配方法训练速度通常明显快于基于对抗优化的 M-GAN。虽然生成方法需要一次训练，但训练完成后，对新的观测进行后验采样只需极低成本；ABC 方法则必须为每个新观测重新运行推断。原文表 2 的计时（秒）如下：

| 数据集 | $\Delta$-Flow 训练 | G-Flow 训练 | M-GAN 训练 | R-ABC 推断 | S-ABC 推断 |
|---|---:|---:|---:|---:|---:|
| Gaussian Linear | 719.4 | 512.55 | 4845.55 | 0.25 | 9.85 |
| Gaussian Mixture | 818.4 | 504.88 | 4653.37 | 0.37 | 22.12 |
| Bernoulli GLM | 849.7 | 997.81 | 4480.55 | 4.88 | 20.07 |
| Two Moons | 617.3 | 835.05 | 4792.71 | 0.40 | 18.49 |
| SLCP | 906.1 | 509.87 | 6088.87 | 6.50 | 10.0 |

三种生成方法的每次推断耗时在原表中均为小于 0.01 秒；表中的 ABC 推断时间则对应单个观测的后验样本生成。各数据集细节见附录 E.6。

**后验恢复能力。** 第三节给出了后验一致性的理论结果，这里通过分类器双样本检验（classifier two-sample test，C2ST）作量化验证。C2ST 训练分类器判别真实后验样本与估计后验样本；准确率越接近 0.5，说明两种分布越难区分，恢复越理想。对比方法包括 R-ABC、SMC-ABC、M-GAN、G-Flow 以及 Kerrigan 等（2024）和 Wildberger 等（2023）的方法。

原文表 3 的 C2ST 数值为：

| 数据集 | $\Delta$-Flow | G-Flow | Kerrigan | Wildberger | M-GAN | R-ABC | S-ABC |
|---|---:|---:|---:|---:|---:|---:|---:|
| Gaussian Linear | 0.71 | 0.69 | 0.89 | 0.97 | 0.85 | 0.80 | 0.73 |
| Gaussian Mixture | 0.82 | 0.85 | 0.96 | 0.57 | 0.73 | 0.80 | 0.65 |
| Bernoulli GLM | 0.92 | 0.88 | 0.99 | 0.61 | 0.84 | 0.92 | 0.80 |
| Two Moons | 0.74 | 0.78 | 0.99 | — | 0.67 | 0.64 | 0.70 |
| SLCP | 0.93 | 0.91 | 0.97 | 0.96 | 0.98 | 0.97 | 0.98 |

作者指出，该方法在五个 SBI 基准上总体具有竞争力，而且各数据集上均优于 Kerrigan 等（2024）的条件最优传输基线。这可能是先在 $\mathcal Y\times\Theta$ 上学习联合速度场所带来的灵活性。与 M-GAN 相比，结果并非单方面占优：本文方法在 Gaussian Linear 和 SLCP 上较好，而 M-GAN 在 Gaussian Mixture、Bernoulli GLM 和 Two Moons 上较好。本文方法的重要实用优势是训练目标仅为二次回归损失，避开了对抗优化，训练时间明显缩短。

**原文结果描述校对注：** 第 4 节关于 M-GAN 的英文描述，把 SLCP 同时列为两种方法各自更优的任务；对照表 3，SLCP 中 Δ-Flow 为 0.93、M-GAN 为 0.98，因 C2ST 越接近 0.5 越好，SLCP 应属于 Δ-Flow 较优；M-GAN 的第三项较优任务应为 Two Moons（0.67 对 0.74）。此处按表 3 数字解释，保留对原文笔误的说明。

**采用单调性构造可信集。** 作者再次使用高斯共轭模型，在块三角流中加入单调性约束，并用 ICNN 参数化相关分量。图 3(a) 绘制了 $\tau=0.5,0.6,0.7,0.8,0.9,0.95$ 的嵌套可信集；图 3(b) 以 100 次模拟检验不同标称可信水平的实际后验覆盖率，虚线代表理想的覆盖率与标称水平相等。结果显示，所得可信集不仅形状规整，而且能够实现预期的校准覆盖率。

**真实数据：COVID-19 示例。** 作者使用伊利诺伊州公共卫生部门提供的 200 天监测数据，包括每日病例数、死亡数和检测数。根据这些观测重建易感者（S）、感染者（I）、康复者（R）轨迹，拟合标准 SIR 模型。设传播率为 $\beta$、移出率为 $\gamma$，并为 $(\beta,\gamma)$ 设置对数正态先验，再由本文方法采样后验。随后计算四项流行病学指标：基本再生数 $R_0=\beta/\gamma$、传染期 $D=1/\gamma$、早期指数增长率 $r=\beta-\gamma$ 和倍增时间 $T_d=\log(2)/r$。由最大后验概率估计得到的感染期约为 14.6 天，$R_0$ 约为 3.5，与文献中的估计值相符。图 4 给出四项指标的后验分布及相应文献范围。更详细的实验与先验影响分析见附录 E.5 与 E.3。

## 5. 结论

本文提出一种通过流匹配开展多元贝叶斯后验采样的基于仿真的推断方法。除了生成后验样本，方法还提供构造贝叶斯可信集及衡量特定参数值偏离后验分布程度的统计工具。使用这些工具只需要训练一次映射，相较于经常需要针对新观测重新运行的 MCMC 或 ABC 方法，可以节省计算成本。

本文方法的一个限制是：当观测维数 $n$ 很大时，其性能可能下降。一个潜在但具有挑战性的方案是采用精心设计的汇总统计量，将原始数据压缩到较低维的潜空间，并在其中训练流匹配模型。另一个值得研究的问题是高维参数空间：为保持学习的可处理性，可能需要引入稀疏性或结构相关性假设。此外，与其他神经网络方法类似，本文方法对超参数调整敏感，不同数据集需要恰当的模型配置。

更一般地，本文方法也继承了推前式生成模型的常见困难，即处理高度多模态后验和极重尾分布时可能表现不佳。Neal's Funnel 实验说明模型能够恢复中等程度的重尾行为，但并不能保证对所有此类分布均稳健。作者将这些问题留作未来研究。

**致谢。** 本研究部分使用了芝加哥大学布斯商学院 Mercury 高性能计算集群及其技术人员提供的支持，该集群由院长办公室资助。Veronika Ročková 的研究另获 NSF/DMS 2515709 项目部分支持。




## 补充材料

## 附录 A：数学记号

本附录汇集并定义全文使用的数学记号。对向量 $x\in\mathbb R^d$，欧氏范数为 $\|x\|=(\sum_{i=1}^d x_i^2)^{1/2}$；对矩阵 $A\in\mathbb R^{d\times d}$，Frobenius 范数为 $\|A\|_F=(\sum_{i,j}A_{ij}^2)^{1/2}$。若 $f:\mathbb R^d\to\mathbb R$，梯度为 $\nabla f(x)=(\partial f/\partial x_1,\ldots,\partial f/\partial x_d)^\top$；Hessian 矩阵 $\nabla^2f(x)\in\mathbb R^{d\times d}$ 的元素为 $\partial^2 f/(\partial x_i\partial x_j)$。

对向量值函数 $v:\mathbb R^d\to\mathbb R^d$，其 Jacobian 矩阵记为 $J_v(x)=\nabla v(x)$，其中 $[J_v(x)]_{ij}=\partial v_i/\partial x_j$。向量场的散度等于 Jacobian 的迹：

$$
\nabla\cdot v(x)=\sum_{i=1}^d\frac{\partial v_i}{\partial x_i}
=\operatorname{tr}(\nabla v(x)).
$$

该量度量在向量场作用下，概率从某一点向外流出的净速率，因而出现在描述时变概率密度的连续性方程中。

若 $T:\mathbb R^d\to\mathbb R^d$ 是可测映射、$\mu$ 是概率测度，则推前测度 $T_\#\mu$ 是 $X\sim\mu$ 时 $T(X)$ 的概率分布。对任意 Borel 集 $A\subset\mathbb R^d$，

$$
T_\#\mu(A):=\mu(T^{-1}(A)).
$$

概率测度 $\mu,\nu$ 的二阶 Wasserstein 距离定义为

$$
W_2^2(\mu,\nu)=\inf_{\gamma\in\Gamma(\mu,\nu)}
\int_{\mathbb R^d\times\mathbb R^d}\|x-y\|^2\,d\gamma(x,y),
$$

其中 $\Gamma(\mu,\nu)$ 为边缘分布分别为 $\mu,\nu$ 的全部耦合分布集合。集合 $A,B\subset\mathbb R^d$ 的 Hausdorff 距离为

$$
d_H(A,B)=\max\left\{\sup_{a\in A}\inf_{b\in B}\|a-b\|,
\sup_{b\in B}\inf_{a\in A}\|a-b\|\right\}.
$$

## 附录 B：相关工作

贝叶斯后验采样已采用多种生成方法。本附录按基础技术分类讨论相关研究。

**归一化流（Normalizing Flow，NF）。** NF 利用一系列可逆变换，把简单源分布 $p_0(x)$（如高斯）映射到复杂目标分布 $p_1(x)$。对于可逆映射 $f:\mathbb R^d\to\mathbb R^d$，由变量替换公式，

$$
p_1(x)=p_0(f^{-1}(x))\,|\det J_{f^{-1}}(x)|.
$$

Real NVP（Dinh 等，2017）采用块三角耦合层，使 Jacobian 行列式易于求解。每一层将输入划分为两部分，一部分保持不变，另一部分接受以前一部分为条件的变换：

$$
x'_{1:d}=x_{1:d},\qquad
x'_{d+1:D}=x_{d+1:D}\odot\exp(s(x_{1:d}))+t(x_{1:d}),
$$

其中尺度函数 $s(x_{1:d})\in\mathbb R^{D-d}$ 与平移函数 $t(x_{1:d})\in\mathbb R^{D-d}$ 均由神经网络参数化，$\odot$ 是逐元素乘积。这使 Jacobian 为三角矩阵，其对数行列式简化为尺度输出的求和。NF 能精确计算似然，但为了保证可逆性，网络结构必须受到约束。

NF 已用于基于仿真的推断（SBI）。Ardizzone 等（2018）利用可逆神经网络摊销学习后验；Radev 等（2020）提出 BayesFlow，把汇总网络与条件 NF 相结合，从模拟数据执行摊销贝叶斯推断。二者均以静态观测为条件，并要求架构可逆且 Jacobian 易于计算；本文则通过流匹配学习速度场，不受此类结构限制。

**连续归一化流（CNF）。** CNF（Chen 等，2018）把 NF 推广为常微分方程的连续时间变换：

$$
\frac{dx_t}{dt}=v_t(x_t,\omega),\quad t\in[0,1],
$$

其中 $\omega\in\Omega$ 为可学习参数。CNF 仍使用微分形式的变量替换公式。

**引理 2（瞬时变量替换，Chen 等，2018）。** 若 $x(t)\sim p_t$，速度场满足 $dx_t=v_t(x_t)dt$，且 $v$ 关于状态一致 Lipschitz 连续、关于时间连续，则沿流轨迹有原文给出的对数密度变化关系。其标准形式为

$$
\frac{d}{dt}\log p_t(x(t))=-\operatorname{tr}\left(\frac{dv}{dx(t)}\right).
$$

原文该处左边排印为 $\partial p_t(x(t))/\partial t$，但文字称其为“对数概率的变化”，二者并非同一个量；上式按引理名称所指的瞬时变量替换关系写出，并保留这一原文排印差异供核对。

**扩散模型。** 扩散模型（Song 等，2020）在正向过程中向数据加噪，并通过估计得分函数学习反向过程。它们生成能力强，但训练和采样通常有较高成本，并依赖准确的得分估计。基于随机微分方程（SDE）的扩散模型，通过 Fokker–Planck 方程与概率流 ODE 相关联。正向与反向过程分别写为

$$
dx_t=f_t(x_t)\,dt+g_t\,dB_t,
$$

$$
dx_t=[f_t(x_t)-g_t^2\nabla_x\log p_t(x_t)]\,dt
+g_t\,d\widetilde B_t,
$$

其中 $f_t$ 是漂移项，$g_t$ 是噪声尺度，$B_t,\widetilde B_t$ 为 Brownian 运动，$\nabla_x\log p_t$ 为得分函数。由于

$$
\begin{aligned}
\partial_t p_t(x)
&=-\nabla_x(fp_t)+\tfrac12g^2\nabla_x^2p_t\\
&=-\nabla_x(fp_t)+\tfrac12g^2\nabla_x(p_t\nabla_x\log p_t)\\
&=-\nabla_x[(f-\tfrac12g^2\nabla_x\log p_t)p_t],
\end{aligned}
$$

可得概率流 ODE 的漂移为

$$
\widetilde f(x,t)=f(x,t)-\tfrac12 g(t)^2\nabla_x\log p_t(x).
$$

### B.1 引导与条件采样

引导（guidance）技术旨在使扩散模型生成过程趋向指定结果。两类代表性方法是分类器引导（Song 等，2020）和无分类器引导（Ho 与 Salimans，2022）。它们以得分分解为出发点：

$$
\nabla\log p_t(x\mid y)=\nabla\log p_t(y\mid x)+\nabla\log p_t(x).
$$

分类器引导使用额外训练的 $p(y\mid x)$ 从图像预测类别。扩散模型本身仍学习边缘分布 $p(x)$；分类器的梯度仅在采样阶段与生成模型的得分估计结合，促使生成图像接近指定类别。

无分类器引导（CFG）不再需要外部分类型网络，而是训练一个同时支持有条件和无条件生成的扩散模型。训练时使用 Bernoulli 随机变量指示是否提供类别等条件信息，推断时通过改变引导系数在两种模式之间插值：

$$
\widetilde v_t(x\mid y)
=(1-w)v_t(x\mid\varnothing)+wv_t(x\mid y).\tag{15}
$$

该插值也可理解为条件与无条件得分估计的加权组合。Guided Flow（Zheng 等，2023）将 CFG 从扩散推广到流匹配，采用依赖时间的分类器得分分解：

$$
\widetilde v_t(x\mid y)=v_t(x)+b_t\nabla\log p_\phi(y\mid x,t).
$$

引导方法的主要优势是可控制生成样本与条件信息的一致程度，但其目标并不是精确的条件分布估计。引导后的分布一般属于温度修正近似，准确程度取决于引导尺度。

### B.2 基于生成模型的后验采样

接下来考察直接针对后验分布的生成方法。

**基于生成对抗网络的后验采样。** Wang 与 Ročková（2022）、Baptista 等（2024）分别利用“数据—参数”联合样本与“边缘数据—噪声”配对之间的匹配开展学习。后者加入单调性和块三角结构约束，以增强后验估计稳定性。本文沿用其块三角框架，但把对抗学习替换为流匹配回归目标，训练更简单、收敛更快（见正文表 2）。Bendel 等（2023）基于条件 GAN（Mirza 与 Osindero，2014）设计正则化方案，以提高训练稳定性和样本多样性，研究重点是线性逆问题。

**基于扩散的后验采样。** Chung 等（2023）针对一般含噪逆问题提出扩散后验采样，在扩散动力学中直接结合分类器/观测信号，无须显式施加测量一致性约束。原文给出

$$
\frac{dx}{dt}=-\frac{\beta(t)}2x-
\beta(t)[\nabla_x\log p_t(x)+\nabla_x\log p_t(y\mid x)]
+\sqrt{\beta(t)}\,d\overline B_t.
$$

原文这里将微分时间项和 Brownian 增量写在同一等式，译稿保留其表达结构；严格写为 SDE 时应使两侧的时间微分记号一致。后验采样过程的似然近似使用 Tweedie 公式估计原始信号条件均值：

$$
\widehat x_0:=\mathbb E[x_0\mid x_t]
\approx\frac{x_t+(1-\bar\alpha(t))s_\theta^\star(x_t,t)}
{\sqrt{\bar\alpha(t)}}.
$$

**基于流的后验采样。** Ben-Hamu 等（2024）与 Pokle 等（2024）针对线性逆问题提出无需重新训练的条件生成方法，通过在推断阶段修改生成过程实现数据一致性，而不是直接学习后验分布。FlowDPS（Kim 等，2025a）将扩散后验采样推广到流匹配模型，仍依赖学习的对数密度梯度作得分估计。与之不同，本文完全放弃基于得分的训练，使用结构化速度分解实现后验恢复。

Wildberger 等（2023）通过前向模拟构造训练数据，并用以静态观测 $y$ 为条件的流模型近似后验。两种研究接近，但在学习方式上有所不同：该工作将原始观测作为速度网络的固定输入；本文学习定义在 $\mathcal Y\times\Theta$ 联合空间中的速度场，使数据与参数分量均随时间演化。联合传输分解成边缘传输与条件传输，从而将几何复杂性分配至两个相互配合的子任务，而不让单一条件网络承担全部表示负担。

### B.3 条件最优传输及相关框架

Kerrigan 等（2024）将 Benamou–Brenier 定理推广至条件情形，学习在保持条件变量 $y$ 不变时将源分布传输到目标的条件速度场，相当于在 $\mathcal Y$ 上采用恒等耦合，其理论重点是最小化条件 Wasserstein 距离。Chemseddine 等（2024）提出条件 Wasserstein 距离 $W_{p,\mathcal Y}$，并推导 OT Bayesian Flow Matching 算法，通过惩罚条件变量空间中的质量传输，在欧氏情形下得到相近的速度目标。

这两类方法均采用 $\dot\theta_t=g_t(\theta_t;y)$，条件 $y$ 为静态输入。当使用欧氏空间线性插值并使数据边缘分布匹配时，它们与本文方法的目标速度场一致；区别在于训练期间固定了哪些量，以及由此得到的理论保证。

Generale 等（2024）研究动态系统预测中的顺序贝叶斯推断，其每一步流的源分布为上一时刻的近似后验，而非固定噪声分布。Isobe 等（2024）扩展条件流匹配，使其能够沿条件空间中的路径在不同条件后验之间传输，例如从 $\pi(\theta\mid y_1)$ 到 $\pi(\theta\mid y_2)$，并优化映射关于条件变量的平滑性。两项研究均针对与本文不同的推断任务。

### B.4 基于传输的贝叶斯计算方法

Makkuva 等（2020）利用输入凸神经网络（ICNN）参数化凸势，直接优化两个固定分布之间的静态最优传输映射，以恢复全局 Monge 映射。本文的后验采样本身不要求凸性；凸性只是构建可信集时可以增加的约束（见 2.3 节）。Li 等（2025）直接把后验学习写作最优传输问题，估计把先验推送到后验的映射；在简单设置下，其 OT 形式可以得到作为高效采样器的线性映射。本文的总体目标类似，但借助流匹配隐式学习传输，而非直接求解 OT 优化问题。

Duan（2023）构造随机近似传输映射，对 MCMC 进行预条件化（Transport Monte Carlo），提高渐近效率，但仍需要 Monte Carlo 链。Hoffman 等（2019）训练神经传输映射以缓和后验几何结构，再在变换空间执行 HMC。在这两类方法中，传输映射均为辅助预条件器，而不是独立采样器；本文通过积分学习得到的速度场直接产生后验样本，无须 Hamiltonian 动力学或接受—拒绝校正。

Katzfuss 与 Schäfer（2024）借助高斯过程回归、最大最小空间排序和贝叶斯正则化，估计高维空间场的三角 Rosenblatt/Knothe 传输。尽管两者都使用三角传输思想，本文不假设空间结构，也不施加高斯过程先验，而是以流匹配隐式学习映射。

Jiang 等（2025）将得分匹配与 Langevin 动力学结合开展基于仿真的推断，着重处理高维参数。Polson 与 Sokolov（2024）提出基于分位数的深度生成采样器，使用分位数损失（pinball loss）训练。本文则使用随时间变化的条件流，借助联合速度分解处理多元后验。

## 附录 C：技术性说明

### C.1 与其他基于流的方法的比较

有两项同期研究同样使用流匹配学习后验：Chemseddine 等（2024）通过最小化条件 Wasserstein 距离学习产生后验的速度场；Kerrigan 等（2024）推广 Benamou–Brenier 优化，得到通向后验的等价最优传输映射。

**最优传输与相合性。** 这些方法与本文最显著的区别是速度学习的主要目标。Kerrigan 和 Chemseddine 等人试图最小化源分布与目标后验之间的条件 Wasserstein 距离；本文的主要理论动机则是定理 2 所保证的估计后验相对于真实后验的相合性，其度量同样为 Wasserstein 距离。这是不同的理论关注点。

例如，Kerrigan 的方法在理论上受到条件 Wasserstein 空间特定测地路径的约束。本文可以使用线性插值、测地插值、Albergo 与 Vanden-Eijnden（2023）的插值等不同路径，而不影响第三节的相合性保证：该结论只依赖学习到的联合速度场的准确程度，而不依赖具体插值方式。

此外，本文可以通过 ICNN 约束传输映射单调，从而构造 Monge–Kantorovich 条件向量分位映射（Chernozhukov 等，2017）、嵌套贝叶斯可信集及条件向量秩。此类推断工具在一般生成模型中较难获得。另一方面，在 Kerrigan 的框架下加入这一单调性可能与学习真实最优传输路径的目标冲突。这不应简单视为本文方法的比较优势，而是方法设计目标不同所产生的取舍：本文愿意牺牲严格 OT 最优性，以得到严谨的不确定性量化工具。

**直接学习后验与先学习联合分布。** Chemseddine、Wildberger 和 Kerrigan 等方法直接学习 $\Theta$ 空间的后验速度场，并将观测 $y^\star$ 固定；本文则在 $\mathcal Y\times\Theta$ 联合空间学习块三角速度场。块三角传输理论保证：若联合分布学习准确，则其条件后验也能准确恢复。

对于固定观测的方法，速度形式为 $\dot\theta_t=v_t(y^\star,\theta_t)$，网络必须从静态原始观测中学习完整后验几何。本文将过程拆为边缘传输 $\dot y_t=f_t(y_t)$ 与条件传输 $\dot\theta_t=g_t(y_t,\theta_t)$ 两个子问题。前者承担数据分布几何的建模，后者学习参数如何随数据的动态流动而改变，而非如何与静态 $y^\star$ 相关。这种分解有望减轻两个网络所需的光滑性假设及表示负担。

此外，边缘速度场 $f_t$ 可以对条件推断起引导作用，使模型不必仅凭静态训练样本隐式插值得到观测空间的几何结构。当测试观测 $y^\star$ 处于训练分布低似然区域时，这种结构引导尤其可能有用。作者据此解释为何方法在若干 SBI 基准上可能优于 Kerrigan 等（2024），相关结果见正文表 3。

### C.2 ICNN 的表示能力问题

这里进一步说明备注 3 所提的 ICNN 表示问题。式（10）使用 ICNN 学习凸函数 $\widehat\psi_t$，再令

$$
\widehat g_t(y_t,\theta_t)
=\nabla_{\theta_t}\widehat\psi_t(y_t,\theta_t).
$$

这一方式确实降低了表示能力：并非所有单调映射都能由单调速度场表示。对于线性插值路径，原文给出速度

$$
g_t(y,\theta\mid x_0,x_1)=G(y^\star,\theta_0)-\theta_0.
$$

要求 $\widehat g_t$ 关于 $\theta$ 单调，即 $\nabla_\theta g_t\succeq0$，意味着 $\nabla G\succeq I$，从而不能表示某些收缩型单调映射。实践中可让源分布的方差远小于目标分布，使最优传输自然具有扩张性，减少这一限制。

更根本的解决方案是修改速度参数化，使模型能够表示收缩映射。作者提出以凸函数 $\widehat\psi_t^\star$ 定义

$$
\widehat g_t(y_t,\theta_t)
=\nabla_{\theta_t}\widehat\psi_t^\star(y^\star,\theta_t)-\theta_0.
$$

但流匹配速度网络需要以当前 $\theta_t$ 而非初始 $\theta_0$ 为输入。对于线性插值，可用 $\theta_0\approx\theta_t-t\widehat g_t$ 近似，并据此整理为另一种形式：

$$
\widehat g_t^\star(y_t,\theta_t)
=\frac{\nabla_{\theta_t}\widehat\psi_t(y^\star,\theta_t)-\theta_t}{1-t}.
$$

这种形式可以表示收缩型单调映射 $G$，因此避免原有的表示损失，同时仍能使用 ICNN 学习速度场。


## 附录 D：第三节理论结果的证明

### D.1 定理 1 的证明

真实联合分布 $p_1$ 可通过式（1）的映射 $T$ 从 $p_0$ 恢复。神经网络学习的联合速度场诱导近似传输 $\widehat T$，将 $p_0$ 送到估计联合分布 $\widehat p_1$：

$$
\widehat p_1=\widehat T_\#p_0,\qquad p_1=T_\#p_0.
$$

当流匹配目标（2）中的速度误差足够小时，$\widehat p_1$ 与 $p_1$ 接近。具体而言，利用 Benton 等（2024）的定理 1，在假设 1、2 下，如果 $\mathcal L_{\mathrm{FM}}\le\varepsilon_N^2$，则

$$
W_2(\widehat p_1,p_1)\le\varepsilon_N
\exp\left(\int_0^1L_t\,dt\right).\tag{16}
$$

估计后验由联合映射 $\widehat T$ 的条件分量 $\widehat G(y^\star,\cdot)$ 恢复；由引理 1 和 Baptista 等（2024）的定理 2.4，真实条件分量 $G(y^\star,\cdot)$ 恢复真实后验：

$$
\widehat\pi_{\theta\mid Y=y^\star}
=\widehat G(y^\star,\cdot)_\#p_0^\Theta,\qquad
\pi_{\theta\mid Y=y^\star}
=G(y^\star,\cdot)_\#p_0^\Theta.
$$

接下来建立联合分布误差与条件后验误差的联系。对于式（1）的块三角传输，原文写作

$$
\begin{aligned}
W_2^2(\widehat p_1,p_1)
&=W_2^2(\widehat T_\#p_0,T_\#p_0)\\
&=\int\|\widehat T(y_0,\theta_0)-T(y_0,\theta_0)\|^2
\,p_0(dy_0,d\theta_0)\\
&=\int\|\widehat F(y_0)-F(y_0)\|^2p_0^Y(dy_0)\\
&\quad+\int\|\widehat G(\widehat F(y_0),\theta_0)
-G(F(y_0),\theta_0)\|^2p_0(dy_0,d\theta_0).
\end{aligned}
$$

两项均非负，因此原文据式（16）分别控制两项。根据假设 2，$\widehat v_t$ 在空间上满足 $\|\widehat v_t(x)-\widehat v_t(x')\|\le L_t\|x-x'\|$；沿时间积分可得估计传输映射的 Lipschitz 性。其条件分量继承这一性质：

$$
\|\widehat G(\widehat F(y_0),\theta_0)
-\widehat G(F(y_0),\theta_0)\|
\le L\|\widehat F(y_0)-F(y_0)\|.
$$

再用三角不等式，

$$
\begin{aligned}
&\|\widehat G(F(y_0),\theta_0)-G(F(y_0),\theta_0)\|\\
&\le\|\widehat G(F(y_0),\theta_0)
-\widehat G(\widehat F(y_0),\theta_0)\|\\
&\quad+\|\widehat G(\widehat F(y_0),\theta_0)
-G(F(y_0),\theta_0)\|.
\end{aligned}
$$

将 $(a+b)^2\le2a^2+2b^2$ 用于上式，关于 $p_0(y_0,\theta_0)$ 取平方期望，原文推得

$$
\begin{aligned}
&\int\|\widehat G(F(y_0),\theta_0)-G(F(y_0),\theta_0)\|^2\,dp_0\\
&\le2W_2^2(\widehat p_1,p_1)
+(2L-2)\int\|\widehat F(y_0)-F(y_0)\|^2\,dp_0^Y\\
&\le2Le^{2L}\varepsilon_N^2.
\end{aligned}
$$

最后利用 $\pi_Y=F_\#p_0^Y$，把上式重新写为关于真实观测边缘分布的平均条件后验误差：

$$
\begin{aligned}
&\int W_2^2(\widehat\pi_{\theta\mid y},\pi_{\theta\mid y})\pi_Y(dy)\\
&=\int\|\widehat G(y,\theta_0)-G(y,\theta_0)\|^2
\,p_0^\Theta(d\theta_0)\pi_Y(dy)\\
&=\int\|\widehat G(F(y_0),\theta_0)-G(F(y_0),\theta_0)\|^2
\,p_0(d\theta_0,dy_0)\\
&\le2Le^{2L}\varepsilon_N^2.
\end{aligned}
$$

定理 1 证毕（依照原文论证步骤）。

> **证明核验注：** 原文将 $W_2^2(T_\#p_0,\widehat T_\#p_0)$ 与指定同源耦合的平方距离积分直接写为相等；一般情形下，同源耦合只能给出 Wasserstein 距离的**上界**，相等需要耦合最优等额外论证。原文后续 Lipschitz 常数的使用还存在 $L$ 与 $L^2$ 的记号问题。译稿忠实呈现原证明的推导路线，但不将这些步骤未经证明地视为严格等式；该理论界应连同其原始假设和证明一起使用。

### D.2 定理 2 的证明

实际训练最小化的是式（4）的 $\mathcal L_{\rm CFM}$，而非式（2）的 $\mathcal L_{\rm FM}$。尽管两种目标数值不同，它们对网络参数 $\phi$ 的梯度相同（式（5））。Albergo 与 Vanden-Eijnden（2023）的命题 1 还给出

$$
v=\arg\min_{\widehat v}\mathcal L_{\rm FM}(\widehat v,v)
=\arg\min_{\widehat v}\mathcal L_{\rm CFM}(\widehat v,v).
$$

需要注意，$\mathcal L_{\rm CFM}$ 通常不会收敛到零，而是收敛到一个与估计速度 $\widehat v$ 无关的常数：

$$
\int_t\mathbb E_{p_t(x\mid z),q(z)}
\|v_t(x\mid z)\|^2dt
-\int_t\mathbb E_{p_t(x)}\|v_t(x)\|^2dt.
$$

对此常数一般不存在统一保证。虽然直接计算 $\mathcal L_{\rm FM}$ 不可行，仍可应用 Farrell 等（2021）的理论框架，因为真实速度 $v$ 是 $\mathcal L_{\rm CFM}$ 的总体极小值，而估计速度是其经验损失在多层感知机函数类 $\mathcal V_{\rm MLP}$ 上的极小值：

$$
\widehat v=\arg\min_{\widetilde v\in\mathcal V_{\rm MLP}}
\frac1N\sum_{i=1}^N
\|\widetilde v_{t_i}(x_i)-v_{t_i}(x_i\mid z_i)\|^2.
$$

其中 $t_i$ 是第 $i$ 个采样时间，$x_i=(y_i,\theta_i)$ 是第 $i$ 个生成样本。依据 Farrell 等（2021）的定理 1，存在与 $N$ 无关的 $C>0$，使得对任一坐标 $1\le k\le n+d$，以至少

$$
1-\exp[-N^{\beta/(\beta+n+d)}\log^8N]
$$

的概率有

$$
\mathbb E_{t,x}(\widehat v_{t,k}(x)-v_{t,k}(x))^2
\le C\left(N^{-\beta/(\beta+n+d)}\log^8N
+\frac{\log\log N}{N}\right).
$$

这里的期望涉及速度函数的全部变量，即 $t\sim\mathrm{Unif}(0,1)$ 和 $x\sim p_1$。对所有坐标求和，得到流匹配损失上界：

$$
\mathcal L_{\rm FM}
\le C(n+d)\left(N^{-\beta/(\beta+n+d)}\log^8N
+\frac{\log\log N}{N}\right)=:\varepsilon_N^2,
$$

成功概率至少为 $1-(n+d)\exp[-N^{\beta/(\beta+n+d)}\log^8N]$。于是 $\varepsilon_N^2$ 具有有限样本收敛率。进一步，

$$
\begin{aligned}
\sum_{N=1}^\infty\mathbb P(\mathcal L_{\rm FM}>\varepsilon_N^2)
&\le(n+d)\sum_{N=1}^\infty
\exp[-N^{\beta/(\beta+n+d)}\log^8N]\\
&<\infty.
\end{aligned}
$$

由 Borel–Cantelli 引理，产生的训练数据上几乎必然有 $\mathcal L_{\rm FM}<\varepsilon_N^2$。结合定理 1，

$$
\mathbb E_{\pi_Y}W_2^2(\widehat\pi_{\theta\mid Y},
\pi_{\theta\mid Y})
=O\left(N^{-\beta/(\beta+n+d)}\log^8N\right).
$$

由此得到平均意义下随 $N$ 呈多项式速率收敛的结论。

还需证明关于观测 $y$ 的一致收敛。根据假设 3，$\mathcal Y$ 为紧集；假设 1、2 使 $W_2(\widehat\pi_{\theta\mid y},\pi_{\theta\mid y})$ 关于 $y$ 等度连续。事实上，对任意 $y,y'\in\mathcal Y$，由三角不等式，

$$
\begin{aligned}
&|W_2(\widehat\pi_{\theta\mid y},\pi_{\theta\mid y})
-W_2(\widehat\pi_{\theta\mid y'},\pi_{\theta\mid y'})|\\
&\le W_2(\widehat\pi_{\theta\mid y},\widehat\pi_{\theta\mid y'})
+W_2(\pi_{\theta\mid y},\pi_{\theta\mid y'})\\
&\le C\|y-y'\|
\end{aligned}
$$

其中最后一步使用速度场及相应传输映射的 Lipschitz 性。

再利用反证法：若存在 $\delta>0$，使某个 $\bar y$ 处的 Wasserstein 距离超过 $\delta$，则由等度连续性，在邻域 $B(\bar y,\delta/(2C))$ 内，该距离仍超过 $\delta/2$。因此

$$
\mathbb E_{\pi_Y}W_2^2(\widehat\pi_{\theta\mid y},\pi_{\theta\mid y})
\ge\int_{B(\bar y,\delta/(2C))}(\delta/2)^2\pi_Y(dy).
$$

原文利用每个 $\mathcal Y$ 内非空开球具有正 $\pi_Y$ 测度，指出右侧存在与 $N$ 无关的正下界，与前述平均平方距离趋零相矛盾。因此

$$
\sup_{y\in\mathcal Y}
W_2(\widehat\pi_{\theta\mid y},\pi_{\theta\mid y})\longrightarrow0.
$$

> **证明条件注：** 上述反证法需要对相关邻域的 $\pi_Y$ 测度有适当的正下界。仅由“紧集”这一条件本身，不能推出每个非空开球具有正测度；此处按原文证明保留该论述，实际应用需要核实边缘分布的支撑条件。

### D.3 推论 3 与命题 4 的证明

定理 2 给出的后验收敛，意味着

$$
W_2^2(\widehat\pi_{\theta\mid y^\star},\pi_{\theta\mid y^\star})
=\int\|\widehat G(y^\star,\theta_0)-G(y^\star,\theta_0)\|^2
\,p_0^\Theta(d\theta_0)
$$

关于 $y^\star\in\mathcal Y$ 一致趋于零。根据假设 3，$\Theta$ 为紧集；由假设 1、2，映射 $G,\widehat G$ 在 $\Theta$ 上均满足 Lipschitz 条件。采用定理 2 证明中的类似方法，得到对任意 $y^\star$ 的映射一致收敛：

$$
\sup_{\theta_0\in\Theta}
\|\widehat G(y^\star,\theta_0)-G(y^\star,\theta_0)\|
\longrightarrow0.\tag{17}
$$

回顾式（11）的估计可信集 $\widehat C_\tau(y^\star)$ 和式（12）的理想集合 $C_\tau(y^\star)$。对任意 $\theta^\star\in C_\tau(y^\star)$，由于 $S^d(\tau)$ 紧致，存在 $\theta_0^\star\in S^d(\tau)$ 使 $\theta^\star=G(y^\star,\theta_0^\star)$。这一源点也可以通过条件向量秩 $R_{\theta\mid y^\star}(\theta^\star)$ 确定。将它通过估计向量分位映射传输，令 $\widehat\theta^\star=\widehat G(y^\star,\theta_0^\star)\in\widehat C_\tau(y^\star)$；结合式（17），可得到

$$
\sup_{\theta\in C_\tau(y^\star)}
\inf_{\widehat\theta\in\widehat C_\tau(y^\star)}
\|\widehat\theta-\theta\|\longrightarrow0.
$$

反过来，对任意 $\widehat\theta^\star\in\widehat C_\tau(y^\star)$，也存在 $\theta^\star\in C_\tau(y^\star)$ 使二者距离趋零，所以

$$
\sup_{\widehat\theta\in\widehat C_\tau(y^\star)}
\inf_{\theta\in C_\tau(y^\star)}
\|\widehat\theta-\theta\|\longrightarrow0.
$$

式（17）的收敛关于 $y^\star\in\mathcal Y$ 一致，而 $\tau\in(0,1)$ 的选取任意。因此

$$
\sup_{y^\star\in\mathcal Y}
d_H(\widehat C_\tau(y^\star),C_\tau(y^\star))\to0.
$$

推论 3 证毕。这里原文在定义 $\widehat\theta^\star$ 的一句将其写为经 $G$ 而非 $\widehat G$ 传输，但按其后续论证及可信集定义，应由估计映射 $\widehat G$ 产生；译稿已注明这一符号差异。

对命题 4，在估计后验 $\widehat\pi_{\theta\mid y^\star}$ 下，事件 $\{\widehat r_{\theta\mid y^\star}(\theta)>1-\alpha\}$ 等价于源点落在球形源域的外环 $S^d(1)\setminus S^d(1-\alpha)$。因此

$$
\begin{aligned}
&\widehat\pi_{\theta\mid y^\star}
(\widehat r_{\theta\mid y^\star}(\theta)>1-\alpha)\\
&=p_0^\Theta(S^d(1))-p_0^\Theta(S^d(1-\alpha))
=\alpha.
\end{aligned}
$$

定理 2 的一致收敛蕴含 $\widehat\pi_{\theta\mid y^\star}\Rightarrow\pi_{\theta\mid y^\star}$ 的弱收敛。又因为 $\Theta$ 紧致，映射连续性由假设 1、2 保证。定义

$$
\widehat F(\tau)=\widehat\pi_{\theta\mid y^\star}
(\widehat r_{\theta\mid y^\star}(\theta)\le\tau),
\quad
F(\tau)=\pi_{\theta\mid y^\star}
(\widehat r_{\theta\mid y^\star}(\theta)\le\tau).
$$

原文据此使用弱收敛及连续性得出 $|\widehat F(1-\alpha)-F(1-\alpha)|\to0$，从而

$$
\pi_{\theta\mid y^\star}
(\widehat r_{\theta\mid y^\star}(\theta)>1-\alpha)\to\alpha.
$$

命题 4 证毕。需注意这里的判别事件本身包含随训练样本变化的估计映射 $\widehat r$，将通常的弱收敛结论直接用于变化的事件还需要相应的边界控制；本稿照译原文论证并保留这一技术条件提醒。


## 附录 E：补充实验

本节补充检验流匹配后验采样器的两个方面：（1）单调性约束与贝叶斯可信集的恢复（E.4）；（2）变量缩放对于正确恢复后验的影响（E.2）。还提供 Neal 漏斗分布、不同先验的 SIR 模型，以及真实疫情数据与实验实施细节。

### E.1 Neal 漏斗分布的后验

重新考察正文第 4 节由式（14）定义的 Neal 漏斗分布。重排式（14）后，给定 $x$ 的后验在归一化常数之外可以表示为

$$
p(\nu\mid x)\propto
\exp\left[-\tfrac12\left(\frac{\nu^2}{3^2}
+e^{-\nu}x^2+\frac{\nu}{2}\right)\right].\tag{18}
$$

可以通过对称随机游走提议的 Metropolis–Hastings（MH）采样器估计：

$$
\nu^\star\sim q(\cdot\mid\nu^{(t-1)})
=\mathcal N(\nu^{(t-1)},\sigma^2),
$$

其接受概率为

$$
\alpha=\min\left\{1,\exp\left[
\ell(\nu^\star;x)-\ell(\nu^{(t-1)};x)\right]\right\},
$$

其中 $\ell$ 是式（18）给出的未归一化对数后验。本文在不同 $x$ 下比较两种采样器。此设置对 MH 有利，因为给定 $x$ 的未归一化后验关于 $\nu$ 是对数凹的。整体而言，流模型在实际 $x$ 范围内能够较忠实地逼近 MH 的结果。$x=25$ 时，$\nu$ 较可能取大值且该区域数据较少，流模型给出的尾部分布略宽。

**图 5 说明。** 对 $x\in\{-5,1,10,25\}$，第一行显示随机游走 MH 后验估计，第二行为本文 Flow 结果。两者在通常观测范围内吻合。

### E.2 恰当缩放的作用

回顾假设 2：$\widehat v_t(x)$ 对 $x,t$ 可微，并且对每个固定的 $t$，存在有限的 $L_t$ 使

$$
\|v_t(x)-v_t(x')\|\le L_t\|x-x'\|,
\qquad x,x'\in\mathbb R^{n+p}.
$$

定理 1 给出平均平方 Wasserstein 后验误差上界 $2\varepsilon_N^2Le^{2L}$，其中 $L=\int_0^1L_tdt$。这表明采样误差的界可能随 Lipschitz 常数指数增长。

令联合变量

$$
x_t=[y_t^\top,\theta_t^\top]^\top
=[y_{1t},\ldots,y_{nt},\theta_{1t},\ldots,\theta_{pt}]^\top,
$$

均值和协方差分别为 $\mu_t=\mathbb E x_t$、$\Sigma_t=\operatorname{Cov}(x_t)
=\mathbb E[(x_t-\mu_t)(x_t-\mu_t)^\top]$。若 $x_t$ 遵循确定性流 $\dot x_t=v_t(x_t)$，原文将协方差的时间导数写成

$$
\frac{d}{dt}\Sigma_t
=\mathbb E[(\nabla_xv_t)(x_t)\Sigma_t+
\Sigma_t(\nabla_xv_t)^\top(x_t)].\tag{19}
$$

假设 2 对应的 Lipschitz 常数可用速度场 Jacobian 的算子范数表示：

$$
L_t=\sup_{x\ne x'}
\frac{\|v_t(x)-v_t(x')\|}{\|x-x'\|}
=\sup_x\|\nabla_xv_t(x)\|_{\rm op}.\tag{20}
$$

因此 $\|\nabla_xv_t(x)\|_{\rm op}\le L_t$。原文据此给出

$$
\frac{d}{dt}\Sigma_t\preceq2L_t\Sigma_t
\quad\Longrightarrow\quad
\Sigma_t\preceq\exp\left(2\int_0^tL_sds\right)\Sigma_0,
$$

其中从独立的源分布出发时 $\Sigma_0=I_{n+p}$。

数值上，若 $\nabla_xv_t$ 的某个元素很大，会推高 $L_t$。例如第 $j$ 个坐标的标准差只有 $10^{-3}$，其他坐标的量级为 1；沿第 $j$ 维移动 $\pm10^{-3}$，欧氏距离变化很小，但网络输出即使只改变 0.05，也有

$$
\frac{|v_t^{(i)}(x)-v_t^{(i)}(x')|}
{|x^{(j)}-x'^{(j)}|}
\approx\frac{0.05}{10^{-3}}=50.
$$

这意味着 Jacobian 的单列已可显著增大算子范数。低方差坐标会使梯度显得异常大，推高 Lipschitz 常数；把该坐标重新缩放到单位方差可以消除这种放大效应。从随机优化角度看，个别坐标的梯度远大于其他坐标，也会导致速度网络训练失衡。将目标联合数据 $x_1$ 标准化，或者等价地分别重参数化 $y,\theta$ 使经验协方差 $\widehat\Sigma_1$ 接近单位阵，有助于网络有效学习目标。

作者通过 SIR 模型演示这种缩放作用：观测空间 $\mathcal Y$ 与参数空间 $\Theta$ 的统计尺度差异很大。图 6 给出参数及手工汇总统计量的方差差异，图 7 比较标准化前后的联合分布恢复。

**图 6 说明。** 感染率 $\beta$ 的样本方差为 0.053，康复率 $\gamma$ 的方差仅 0.0007，约为 79:1。七个汇总统计量之间的尺度相差两个数量级：感染峰值（peak I）方差约为 166，增长斜率和相关系数统计量均低于 0.05。对逐时刻轨迹，易感者 S、康复者 R 的方差从约 0.11 开始衰减，而感染者 I 的方差始终低于 0.003。因此联合流学习涉及从 $10^{-3}$ 到 $10^2$ 的尺度。

**图 7 说明。** 图中蓝色为学习分布，橙色为真实先验；未经标准化的模型甚至未能正确学习参数先验。正确恢复联合分布 $(y,\theta)\sim L(y\mid\theta)\pi(\theta)$ 是可靠后验估计的必要前提。

> **原文推导校对注：** 式（19）把一般随机 Jacobian 与整体协方差直接相乘，严格而言并不等同于一般非线性流下协方差导数的完整表达；式（20）和随后的协方差矩阵不等式也需要额外正则条件。这里照译作者的理论解释，不将其视为已独立验证的一般矩阵恒等式。

### E.3 改变 SIR 模型先验的影响

为检验后验推断对先验分布的敏感性，作者进一步研究经典易感—感染—康复（SIR）流行病模型。S、I、R 分别为易感、感染与康复人数，$N=S+I+R$ 为固定总人口；$\beta$ 为传染率，$\gamma$ 为平均康复率。模型满足非线性 ODE：

$$
\frac d{dt}[S,I,R]
=\left[-\frac{\beta S I}N,\,
\frac{\beta S I}N-\gamma I,\,
\gamma I\right].
$$

所有实验均在固定人口规模与归一化初始条件下模拟 300 天。

本文比较三类常用先验：

- **对数正态先验（图 8）：** $\log\beta\sim\mathcal N(\log0.4,0.5^2)$，$\log\gamma\sim\mathcal N(\log(1/8),0.2^2)$。
- **均匀先验（图 9）：** $\beta\sim\mathrm{Unif}(0.2,0.8)$，$\gamma\sim\mathrm{Unif}(0.05,0.5)$，用于表示合理区间内相对弱信息的先验。
- **Gamma 先验（图 10）：** $\beta\sim\mathrm{Gamma}(\text{shape}=2.0,\text{scale}=0.2)$，均值为 0.4；$\gamma\sim\mathrm{Gamma}(\text{shape}=2.0,\text{scale}=0.1)$，均值为 0.2，允许明显右偏及较重的右尾。

对每种先验，从中采样参数并数值积分 SIR 方程，共模拟 5000 条轨迹。然后对每条轨迹提取固定的人工统计量，包括感染峰值、峰值出现时间、S/I/R 平均人数与交叉相关系数，并将统计量输入流匹配模型以学习参数后验。各类先验下的模型架构和训练超参数均保持相同，以单独考察先验变化的影响。

即使真实参数固定，学得后验仍会受到先验显著影响。对数正态先验下，后验更集中于真实值 $(\beta,\gamma)=(0.3,0.1)$，具有与先验非对称性相符的适度偏斜。均匀先验缺少结构性正则化，使后验更分散，尤其在与似然主脊线垂直的方向。Gamma 先验使后验呈更重的右尾，特别体现在 $\gamma$ 上，反映右长尾先验与正向动力学之间的相互作用。

**图 8–10 说明。** 三图分别比较对数正态、均匀和 Gamma 先验下的参数边缘后验及联合后验。灰色表示先验，蓝色表示学习后验；红色虚线或十字标记真实参数。图 9、10 是图 8 的不同先验版本。

### E.4 使用输入凸神经网络施加单调性

令 $\psi:\mathbb R^n\times\mathbb R^p\times\mathbb R\to\mathbb R$ 为部分输入凸神经网络（PICNN；Amos 等，2017）：它关于 $\theta\in\Theta$ 凸，而关于 $(y,t)\in\mathcal Y\times[0,1]$ 不受此约束。定义

$$
g_t(y,\theta):=\nabla_\theta\psi_t(y,\theta).\tag{21}
$$

由于 $\theta\mapsto\psi_t(y,\theta)$ 连续可微且凸，其梯度关于 $\theta$ 单调。因此将 $g_t$ 中的一般 MLP 换为式（21）的凸函数梯度，就在结构上施加了所需单调性，同时保留对 $y$ 和 $t$ 的灵活建模能力。

训练时从球形均匀源分布采样 $x_0$：令 $y_0=r\phi$、$\theta_0=\tau\xi$，其中 $\phi\sim\mathrm{Unif}(S^{n-1}(1))$、$\xi\sim\mathrm{Unif}(S^{d-1}(1))$，且 $r,\tau\sim\mathrm{Unif}[0,1]$。若源分布本就是各向同性高斯，则不必采用这一步，因为它的部分坐标仍保持相应高斯形式。

为构造给定观测 $y^\star$ 下的可信集，按照第 2.3 节，从单位球面抽取方向 $\xi$，固定半径 $\tau$ 并令 $\theta_0=\tau\xi$。在以 $y^\star$ 为条件的联合速度场 $(f_t,g_t)$ 下使源点演化，便将半径为 $\tau$ 的球面 $S^{d-1}(\tau)$ 送到估计可信集的边界 $\partial\widehat C_\tau(y^\star)$。$g_t$ 的单调性确保径向顺序：若 $\tau_1<\tau_2$，由内球面出发的轨迹终点始终位于外球面像所围区域内，因此

$$
\widehat C_{\tau_1}(y^\star)\subset\widehat C_{\tau_2}(y^\star).
$$

于是 $\{\widehat C_\tau(y^\star)\}_{0\le\tau\le1}$ 构成嵌套区域，后验概率质量随 $\tau$ 单调增加。若选择使源球包含 $1-\alpha$ 概率质量的半径，则所得到的是 $(1-\alpha)$ 贝叶斯可信集。

作者首先在致密的 $(\theta,\theta')$ 网格上检查第 2.3 节的内积非负条件，以验证所学速度的单调性；再比较连续增大的半径所产生的可信集，验证集合不交叉且按包含关系嵌套（图 11）。

在 SIR 模型中进一步对 $g_t$ 施加单调性后，图 12 表明边缘及联合后验均覆盖真实参数 $(0.3,0.1)$，不同可信水平下的轮廓保持嵌套。图 11 展示高斯共轭模型中不同观测样本与 $\tau=0.50,0.60,0.70,0.80,0.90,0.95$ 的可信集；图 12 则展示 SIR 模型中 $\tau=0.50,0.60,0.70,0.80,0.90,0.99$ 的轮廓，最浅代表 0.50，最深代表 0.99。

### E.5 真实数据示例：COVID-19 分析

作者使用伊利诺伊州公共卫生部门发布的每日 COVID-19 监测数据（2020 年 3 月 10 日至 9 月 25 日，共 200 天），包括日期、累计及新增确诊、累计及新增死亡、接受检测总人数。按 AlQadi 与 Bani-Yaghoub（2022）的方法，从这些数据重建 S、I、R 三个人群分量。

令 $N_k$ 为第 $k$ 天的新增确诊，使用滚动 14 天病例总数近似第 $t$ 天的活跃感染人数：

$$
I(t)=\sum_{k=t-13}^t N_k.
$$

易感人数结合检测信息及潜伏期估计：假设潜伏期为 5 天，在第 $k+6$ 天及以后才检测阳性的人，在第 $k$ 天仍被视为易感。因此 $S(t)$ 包括当天检测阴性者与至少六天后才检测阳性者。由于数据不记录康复人数，假定确诊感染最终有 95%–99% 康复。记累计死亡为 $D(t)$，则

$$
R(t)=p\left(\sum_{k=t-15}^tN_k\right)-D(t),
\qquad p\in[0.95,0.99].
$$

**表 4：伊利诺伊州数据描述统计（2020-03-10—2020-09-25）**

| 统计 | 当日新增确诊 | 当日检测 | 死亡 | S | I | R |
|---|---:|---:|---:|---:|---:|---:|
| 均值 | 1,375 | 25,286 | 4,950 | 32,336 | 18,372 | 111,496 |
| 标准差 | 819 | 18,935 | 3,160 | 20,294 | 10,147 | 77,738 |
| 最小 | 0 | 0 | 0 | 14 | 0 | 0 |
| 最大 | 5,594 | 149,273 | 8,672 | 153,951 | 35,019 | 260,877 |

分析中使用传染率及移除率的对数正态先验：

$$
\beta\sim\operatorname{LogNormal}(\log0.4,0.5^2),
\qquad
\gamma\sim\operatorname{LogNormal}(\log(1/8),0.2^2).
$$

对每组参数 $(\beta,\gamma)$ 数值求解 SIR 方程，并利用参数与模拟数据配对训练三角流模型。完成训练后，以伊利诺伊州 200 天观测为条件生成后验样本。作者重点报告四个流行病学函数量：基本再生数 $R_0=\beta/\gamma$、传染期 $D=1/\gamma$、早期指数增长率 $r=\beta-\gamma$、病例翻倍时间 $T_d=\log2/r$。

结果表明，由 $\gamma$ 得到的传染期约为 14.6 天，与文献给出的 10–20 天范围相符；$R_0\approx3.5$ 与美国疫情初期无干预情形的 $3$–$5$ 范围相近。早期增长率的 MAP 估计为 $r=0.17/\mathrm{day}$，对应翻倍时间约 3.98 天，也与初期病例约 2–4 天翻倍的经验估计接近。作者提醒：本文估计与包含额外驱动项的扩展 SIR 模型（AlQadi 与 Bani-Yaghoub，2022）不能直接逐项比较。

**表 5：MAP 估计及 90% 边缘可信区间**

| 统计 | $\beta$ | $\gamma$ | $R_0$ | $1/\gamma$（天） | $r$ | $T_d$（天） |
|---|---:|---:|---:|---:|---:|---:|
| MAP | 0.24 | 0.07 | 3.54 | 14.58 | 0.17 | 3.98 |
| 下界（LB） | 0.12 | 0.05 | 1.53 | 9.46 | 0.04 | 1.23 |
| 上界（UB） | 0.64 | 0.11 | 9.25 | 18.75 | 0.56 | 14.26 |

### E.6 实验细节

除特别说明，全部实验均从联合空间 $\mathcal Y\times\Theta$ 中的各向同性高斯源分布 $\mathcal N(0,I_{n+d})$ 出发；代码及完整配置由作者仓库提供。

**Neal 漏斗实验。** 数据边缘速度 $f_t$ 与条件速度 $g_t$ 均使用四层全连接网络，隐藏宽度 64，ELU 激活；用 Adam 优化 20,000 次迭代，学习率 0.001。

**高斯共轭实验。** 与漏斗实验使用相同类型网络，但隐藏宽度从 64 起随观测维度 $n$ 比例增加；由于任务维度较低，可以使用较轻的模型而不显著损失精度。

**SIR 实验。** 令轨迹为 $y=(S_t,I_t,R_t)_{t=1}^T$、参数为 $\theta=(\beta,\gamma)$。边缘速度 $f_t$ 使用四层 MLP（隐藏宽度 64）；$g_t$ 表示为两个残差块构成的谱归一化 ResNet 的梯度，每个残差块宽度 128，使用 SiLU 激活。数据预处理分三步：（i）原始序列转为七维汇总统计

$$
[\operatorname{peak}I,\ t_{\rm peak},\ 
\overline S,\overline I,\overline R,\operatorname{corr}(S,I),
\operatorname{corr}(I,R)];
$$

（ii）所有统计量用训练批次均值和标准差归一到零均值、单位方差；（iii）参数先作对数变换 $(\log\beta,\log\gamma)$，再标准化。训练使用 AdamW，权重衰减 $10^{-4}$，批大小 256，学习率 $2\times10^{-4}$。

**覆盖率实验。** 在高斯共轭设置下，对每个合成观测 $y$，为构造标称 $\tau$ 水平的可信集，首先在内侧 $\tau$ 球中均匀抽取 $n_{\rm set}=2000$ 个噪声向量，以 $y$ 为条件通过流模型传输，并对生成的 $(\mu,\sigma)$ 点集取凸包，得到候选 $\widehat C_\tau(y)$。对 $\tau\in\{0.5,0.6,0.7,0.8,0.9,0.95\}$ 重复，可得到图 11 所示的嵌套区域。为检验其后验概率质量，再独立抽取 $M=2000$ 个该观测条件下的流后验样本，计算落入各凸包的比例。对 100 组独立观测重复操作，并把覆盖率绘成箱线图，与理想对角线 $y=\tau$ 对照（正文图 3）。结果接近标称水平。

**表 2、3 的设置。** 使用 sbibm（Lueckmann 等，2021）基准库。对每项任务从先验与模拟器抽取 10 组真实参数—观测配对；每个观测生成 10,000 个参考后验样本；模拟预算由 1000 至 100,000。拒绝式 ABC 与序贯 Monte Carlo ABC（SMC-ABC）也使用 sbibm 实现。主要指标为分类器双样本检验（C2ST）：分类器是带两层隐藏层的 MLP，隐藏宽度为数据维数的十倍，采用五折交叉验证。运行时间记录于表 2。Guided Flow 采用 Zheng 等（2023）方案，固定引导强度 $\omega=1.5$。

作者考察五个基准任务：

1. **Gaussian Linear。** 先验 $\theta\sim\mathcal N(0,0.1I)$，$\theta\in\mathbb R^{10}$；似然 $x\mid\theta\sim\mathcal N(\theta,0.1I)$，$x\in\mathbb R^{10}$。
2. **Simple Likelihood and Complex Posterior（SLCP）。** 先验 $\theta\sim\mathrm{Unif}(-3,3)$，$\theta\in\mathbb R^5$。令 $x=(x_1,x_2,x_3,x_4)$，各 $x_i\sim\mathcal N(m_\theta,S_\theta)$，其中

$$
m_\theta=\begin{bmatrix}\theta_1\\\theta_2\end{bmatrix},\quad
S_\theta=\begin{bmatrix}s_1^2&\rho s_1s_2\\
\rho s_1s_2&s_2^2\end{bmatrix},\quad
s_1=\theta_3^2,\ s_2=\theta_4^2,\ \rho=\tanh(\theta_5).
$$

将四个二维观测合并，得到 $x\in\mathbb R^8$。

3. **Gaussian Mixture。** 先验 $\theta\sim\mathrm{Unif}(-10,10)$，$\theta\in\mathbb R^2$；似然为同均值、不同协方差的高斯混合：

$$
p(x\mid\theta)=\tfrac12\mathcal N(x;\theta,I)
+\tfrac12\mathcal N(x;\theta,0.01I),\quad x\in\mathbb R^2.
$$

4. **Bernoulli GLM。** 先验 $\beta\sim\mathcal N(0,2)$、$f\sim\mathcal N(0,(F^\top F)^{-1})$，其中 $1\le i,j\le9$，$F_{i,i-2}=1$、$F_{i,i-1}=-2$、$F_{i,i}=1+\sqrt{(i-1)/9}$，其余元素为 0。观测 $x=(x_1,\ldots,x_{10})$，令 $x_1=\sum_i z_i$，$x_{2:10}$ 是观测 $z$ 的相应统计量，其中

$$
z_i\sim\mathrm{Bernoulli}(\eta(v_i^\top f+\beta)),
\qquad\eta(a)=\frac{e^a}{1+e^a}.
$$

原文在 $x_{2:10}$ 的矩阵表达中使用经验协方差与一个记作 $V_z$ 的矩阵，相关索引/排版应以 PDF 最后一页为准，不能仅据此行重构全部模拟器实现。

5. **Two Moons。** 先验 $\theta\sim\mathrm U(-1,1)$，$\theta\in\mathbb R^2$。生成观测

$$
x=\begin{bmatrix}r\cos\alpha+0.25\\r\sin\alpha\end{bmatrix}
+\begin{bmatrix}-|\theta_1+\theta_2|/\sqrt2\\
(-\theta_1+\theta_2)/\sqrt2\end{bmatrix},
$$

其中 $\alpha\sim\mathrm U(-\pi/2,\pi/2)$，$r\sim\mathcal N(0.1,0.01^2)$，$x\in\mathbb R^2$。

**计算资源。** 初期分析和原型实验在配备 Intel Core i7 与 16 GB 内存的 MacBook Pro 上进行。较大实验使用机构研究集群的多核 CPU 与 128 GB 内存。作者明确说明所有实验均未使用 GPU。依数据集和任务而异，典型聚类与评估运行可在数小时内完成。


## 参考文献（保留原始英文书目）

以下按原始 PDF 第 10–12 页记录原文的作者、题名、期刊会议、卷页码及 DOI/URL。英文文献题名保留以便准确检索，不擅自补写不存在的信息。

References                                                    applications in bayesian ot flow matching. arXiv  
preprint arXiv:2403.18705.  
Albergo, M. S. and Vanden-Eijnden, E. (2023). Build-  
ing normalizing flows with stochastic interpolants. In    Chen, R. T., Rubanova, Y., Bettencourt, J., and Du-  
The Eleventh International Conference on Learning           venaud, D. K. (2018). Neural ordinary differential  
Representations.                                           equations. Advances in neural information processing  
Alfonso, J., Baptista, R., Bhakta, A., Gal, N., Hou, A.,     systems, 31.  
Lyubimova, V., Pocklington, D., Sajonz, J., Trigila,      Chernozhukov, V., Galichon, A., Hallin, M., and Henry,  
G., and Tsai, R. (2023). A generative flow model            M. (2017). Monge-kantorovich depth, quantiles,  
for conditional sampling via optimal transport. In          ranks and signs. Annals of Statistics, 45(1):223–256.  
NeurIPS 2023 Workshop Optimal Transport and Ma-  
Chung, H., Kim, J., Mccann, M. T., Klasky, M. L., and  
chine Learning.  
Ye, J. C. (2023). Diffusion posterior sampling for  
AlQadi, H. and Bani-Yaghoub, M. (2022). Incorpo-              general noisy inverse problems. In The Eleventh In-  
rating global dynamics to improve the accuracy of          ternational Conference on Learning Representations.  
disease models: Example of a covid-19 sir model.  
Plos one, 17(4):e0265815.                                 Dinh, L., Sohl-Dickstein, J., and Bengio, S. (2017).  
Density estimation using real nvp. In International  
Amos, B., Xu, L., and Kolter, J. Z. (2017). Input con-       Conference on Learning Representations.  
vex neural networks. In Precup, D. and Teh, Y. W.,  
editors, Proceedings of the 34th International Con-        Duan, L. L. (2023). Transport monte carlo: High-  
ference on Machine Learning, volume 70 of Proceed-          accuracy posterior approximation via random trans-  
ings of Machine Learning Research, pages 146–155.           port. Journal of the American Statistical Association,  
PMLR.                                                       118(543):1659–1670.  
Ardizzone, L., Kruse, J., Wirkert, S., Rahner, D., Pelle-   Farrell, M. H., Liang, T., and Misra, S. (2021). Deep  
grini, E. W., Klessen, R. S., Maier-Hein, L., Rother,       neural networks for estimation and inference. Econo-  
C., and Köthe, U. (2018). Analyzing inverse prob-           metrica, 89(1):181–213.  
lems with invertible neural networks. arXiv preprint  
Generale, A. P., Robertson, A. E., and Kalidindi,  
arXiv:1808.04730.  
S. R. (2024). Conditional variable flow match-  
Baptista, R., Hosseini, B., Kovachki, N. B., and Mar-        ing: Transforming conditional densities with amor-  
zouk, Y. M. (2024). Conditional sampling with mono-        tized conditional optimal transport. arXiv preprint  
tone gans: From generative models to likelihood-free       arXiv:2411.08314.  
inference. SIAM/ASA Journal on Uncertainty Quan-  
Giné, E. and Nickl, R. (2021). Mathematical founda-  
tification, 12(3):868–900.  
tions of infinite-dimensional statistical models. Cam-  
Beaumont, M. A., Cornuet, J.-M., Marin, J.-M., and            bridge university press.  
Robert, C. P. (2009). Adaptive approximate bayesian  
computation. Biometrika, 96(4):983–990.                   Ho, J. and Salimans, T. (2022). Classifier-free diffu-  
sion guidance. In NeurIPS 2021 Workshop on Deep  
Ben-Hamu, H., Puny, O., Gat, I., Karrer, B., Singer,  
Generative Models and Downstream Applications.  
U., and Lipman, Y. (2024). D-flow: Differentiating  
through flows for controlled generation. In Proceed-      Hoffman, M., Sountsov, P., Dillon, J. V., Langmore,  
ings of the 41st International Conference on Ma-            I., Tran, D., and Vasudevan, S. (2019). Neutra-  
chine Learning, volume 235 of Proceedings of Ma-            lizing bad geometry in hamiltonian monte carlo using  
chine Learning Research, pages 3462–3483. PMLR.             neural transport. arXiv preprint arXiv:1903.03704.  
Bendel, M., Ahmad, R., and Schniter, P. (2023). A           Isobe, N., Koyama, M., Zhang, J., Hayashi, K.,  
regularized conditional gan for posterior sampling          and Fukumizu, K. (2024). Extended flow match-  
in image recovery problems. Advances in neural              ing: a method of conditional generation with  
information processing systems, 36:68673–68684.              generalized continuity equation. arXiv preprint  
Benton, J., Deligiannidis, G., and Doucet, A. (2024).         arXiv:2402.18839.  
Error bounds for flow matching methods. Transac-          Jiang, H., Wang, Y., and Yang, Y. (2025). Simulation-  
tions on Machine Learning Research.                          based inference via langevin dynamics with score  
Carlier, G., Chernozhukov, V., and Galichon, A. (2017).       matching. arXiv preprint arXiv:2509.03853.  
Vector quantile regression beyond the specified case.     Katzfuss, M. and Schäfer, F. (2024). Scalable bayesian  
Journal of Multivariate Analysis, 161:96–102.               transport maps for high-dimensional non-gaussian  
Chemseddine, J., Hagemann, P., Steidl, G., and Wald,         spatial fields. Journal of the American Statistical  
C. (2024). Conditional wasserstein distances with          Association, 119(546):1409–1423.  
Kerrigan, G., Migliorini, G., and Smyth, P. (2024).         Oelsner, E. C., Sun, Y., Balte, P. P., Allen, N. B.,  
Dynamic conditional optimal transport through               Andrews, H., Carson, A., Cole, S. A., Coresh, J.,  
simulation-free flows. Advances in Neural Informa-          Couper, D., Cushman, M., et al. (2024). Epidemio-  
tion Processing Systems, 37:93602–93642.                    logic features of recovery from sars-cov-2 infection.  
Kim, J., Kim, B. S., and Ye, J. C. (2025a). Flowdps:         JAMA network open, 7(6):e2417440–e2417440.  
Flow-driven posterior sampling for inverse problems.      Pellis, L., Scarabel, F., Stage, H. B., Overton, C. E.,  
arXiv preprint arXiv:2503.08136.                             Chappell, L. H., Fearon, E., Bennett, E., Lythgoe,  
Kim, J., Zhai, P. S., and Ročková, V. (2025b). Deep           K. A., House, T. A., Hall, I., et al. (2021). Challenges  
generative quantile bayes. volume 258 of Proceed-           in control of covid-19: short doubling time and long  
ings of Machine Learning Research, pages 4141–4149.         delay to effect of interventions. Philosophical Trans-  
PMLR.                                                       actions of the Royal Society B: Biological Sciences,  
376(1829).  
Kingma, D. P. (2014). Adam: A method for stochastic  
optimization. arXiv preprint arXiv:1412.6980.             Pokle, A., Muckley, M. J., Chen, R. T., and Karrer, B.  
(2024). Training-free linear image inverses via flows.  
Li, K., Han, W., Wang, Y., and Yang, Y. (2025). Opti-  
Transactions on Machine Learning Research.  
mal transport-based generative models for bayesian  
posterior sampling. arXiv preprint arXiv:2504.08214.      Polson, N. G. and Sokolov, V. (2024). Generative AI  
Lipman, Y., Chen, R. T., Ben-Hamu, H., Nickel, M.,            for Bayesian Computation. arXiv:2305.14972.  
and Le, M. (2023). Flow matching for generative           Radev, S. T., Mertens, U. K., Voss, A., Ardizzone, L.,  
modeling. In The Eleventh International Conference          and Köthe, U. (2020). Bayesflow: Learning complex  
on Learning Representations.                                stochastic models with invertible neural networks.  
Liu, X., Gong, C., et al. (2023). Flow straight and fast:    IEEE transactions on neural networks and learning  
Learning to generate and transfer data with rectified      systems, 33(4):1452–1466.  
flow. In The Eleventh International Conference on         Rezende, D. J. and Mohamed, S. (2016). Variational  
Learning Representations.                                   inference with normalizing flows.  
Lopez-Paz, D. and Oquab, M. (2016). Revisit-                Salmona, A., De Bortoli, V., Delon, J., and Desolneux,  
ing classifier two-sample tests. arXiv preprint             A. (2022). Can push-forward generative models fit  
arXiv:1610.06545.                                           multimodal distributions? Advances in Neural In-  
Loshchilov, I. and Hutter, F. (2019). Decoupled weight        formation Processing Systems, 35:10766–10779.  
decay regularization. In International Conference on  
Sanche, S., Lin, Y. T., Xu, C., Romero-Severson, E.,  
Learning Representations.  
Hengartner, N., and Ke, R. (2020). High contagious-  
Lueckmann, J.-M., Boelts, J., Greenberg, D.,                  ness and rapid spread of severe acute respiratory  
Goncalves, P., and Macke, J. (2021). Benchmark-             syndrome coronavirus 2. Emerging infectious dis-  
ing simulation-based inference. In Banerjee, A. and         eases, 26(7):1470.  
Fukumizu, K., editors, Proceedings of The 24th In-  
Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar,  
ternational Conference on Artificial Intelligence and  
A., Ermon, S., and Poole, B. (2020). Score-based  
Statistics, volume 130 of Proceedings of Machine  
generative modeling through stochastic differential  
Learning Research, pages 343–351. PMLR.  
equations. arXiv preprint arXiv:2011.13456.  
Makkuva, A., Taghvaei, A., Oh, S., and Lee, J. (2020).  
Optimal transport mapping via input convex neural          Tam, E. and Dunson, D. B. (2025). On the statistical  
networks. In International Conference on Machine             capacity of deep generative models. arXiv preprint  
Learning, pages 6672–6681. PMLR.                             arXiv:2501.07763.  
Mirza, M. and Osindero, S. (2014).           Condi-         Tong, A., Fatras, K., Malkin, N., Huguet, G., Zhang,  
tional generative adversarial nets. arXiv preprint           Y., Rector-Brooks, J., Wolf, G., and Bengio, Y.  
arXiv:1411.1784.                                            (2023). Improving and generalizing flow-based gen-  
erative models with minibatch optimal transport.  
Muniz-Rodriguez, K., Chowell, G., Cheung, C.-H., Jia,         arXiv preprint arXiv:2302.00482.  
D., Lai, P.-Y., Lee, Y., Liu, M., Ofori, S. K., Roosa,  
K. M., Simonsen, L., et al. (2020). Doubling time of       Wang, Y. and Ročková, V. (2022). Adversarial bayesian  
the covid-19 epidemic by province, china. Emerging          simulation. arXiv preprint arXiv:2208.12113.  
infectious diseases, 26(8):1912.                           Wiese, M., Knobloch, R., and Korn, R. (2019). Copula  
Neal, R. M. (2003). Slice sampling. The Annals of            & marginal flows: Disentangling the marginal from  
Statistics, 31(3):705–767.                                  its joint. arXiv preprint arXiv:1907.03361.  
Wildberger, J., Dax, M., Buchholz, S., Green, S.,  
Macke, J. H., and Schölkopf, B. (2023). Flow match-  
ing for scalable simulation-based inference. Advances  
in Neural Information Processing Systems, 36:16837–  
16864.  
Zheng, Q., Le, M., Shaul, N., Lipman, Y., Grover, A.,  
and Chen, R. T. (2023). Guided flows for generative  
modeling and decision making. CoRR.  
Zhou, X., Jiao, Y., Liu, J., and Huang, J. (2023).  
A deep generative approach to conditional sam-  
pling. Journal of the American Statistical Asso-  
ciation, 118(543):1837–1848.

---

**译文覆盖与校对状态：** 正文 1–5 节、补充材料 A–E、公式（1）–（21）、实验图表说明与原始参考书目均已接入。原论文部分理论论证存在待核疑点，已在相应公式后明确标注；跨页公式与书目断行仍需终校，因此尚未通过逐页、逐式全文验收。

{% endraw %}