---
layout: page
title: "可证明鲁棒的分数扩散后验采样｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-03-provably-robust-score-based-diffusion-posterior-sampling-for-plug-and/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/656199bdc705e407/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 可证明鲁棒的分数扩散后验采样

**原题：** Provably Robust Score-Based Diffusion Posterior Sampling for Plug-and-Play Image Reconstruction  
**作者：** Xingyu Xu（*）、Yuejie Chi（†）  
**单位：** 美国卡内基梅隆大学（Carnegie Mellon University）。邮箱：xingyuxu@andrew.cmu.edu、yuejiec@andrew.cmu.edu。  
**版本：** 会议论文集版本（NeurIPS-2024-provably-robust-score-based-diffusion-posterior-sampling-for-plug-and-play-image-reconstruction-Paper-Conference.pdf），本地 PDF 37 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、正文各节、结论、图表说明与参考文献（英文原条目）按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 本地 PDF 为 **NeurIPS 2024 会议论文集版本（第 38 届）**，共 37 页（正文 10 页 + 参考文献 + 附录 A—H + 后置图表页）；无 arXiv 编号。骨架所记"会议论文集版本 / 37 页 / 许可待核验"与 PDF 一致，本页保留该许可说明。

## 摘要

大量应用的目标是：从一个已知、可能**非线性**的前向模型所描述的感知或成像模态中，由少量含噪测量推断未知图像，而该问题通常是病态的。分数扩散模型凭借其令人瞩目的经验成功，已成为图像重建中富有表达力的先验候选。为同时适配多样任务，发展高效、一致且鲁棒的算法——把图像先验分布的**无条件分数函数**与灵活的前向模型选择相结合——极具价值。本文提出一个把分数扩散模型用作一般前向模型下非线性逆问题的表达性数据先验的算法框架。受成像社区**即插即用（plug-and-play）**框架启发，我们提出**扩散即插即用（diffusion plug-and-play，DPnP）**方法：交替调用两个采样器——仅基于前向模型似然函数的**近端一致性采样器**，与仅基于图像先验分数函数的**去噪扩散采样器**。核心洞见是：白高斯噪声下的去噪，用为生成而训练的同组分数函数、通过随机（DDPM 型）与确定性（DDIM 型）采样器均可严格求解。我们建立 DPnP 的渐近与非渐近性能保证，并给出数值实验以说明其在多种任务上的潜力。据我们所知，DPnP 是**首个**使用无条件扩散先验、对非线性逆问题可证明鲁棒的后验采样方法。

## 1 引言

大量感知与成像应用中，首要目标是从可能含噪、不完整甚至非线性的测量 $y\in\mathbb R^m$ 推断未知图像 $x^\star\in\mathbb R^d$；这类任务包括修复、超分辨、去噪等恢复任务，以及核磁共振成像 [LDP07]、光学成像 [SEC+15]、显微成像 [HSMC17]、雷达与声呐成像 [PEPC10] 等成像任务。受感知与资源约束，图像重建问题通常病态：期望的未知图像分辨率远高于可用观测量。因此需要引入关于未知图像的先验信息以辅助重建。多年来已被考虑与采用的先验众多，从人工设计的子空间或稀疏约束 [CR12], [Don06]，到以神经网络形式规定的数据驱动先验 [UVL18], [BJPD17]。这些先验可视为未知图像的**生成模型**，其假定高维图像在低维数据流形上具有某种简约表示；理想情况下，生成模型应足够有表达力以捕获目标图像类别的多样性与结构，同时仍使重建问题在计算上可处理。

**作为图像先验的分数扩散模型**：近年来生成式人工智能（AI）取得巨大进展，可从未知分布以空前分辨率与规模生成图像、音频、文本等新样本。扩散模型由 [SDWMG15] 首次提出，是最成功框架之一，支撑了 DALL·E [RDN+22]、Stable Diffusion [RBL+22]、Imagen [SCS+22] 等流行内容生成器。粗略地说，分数扩散模型仅用数据在各噪声水平下被污染后的分数函数，构造反向马尔可夫扩散过程，从而把噪声转为近似目标数据分布的样本 [SE19], [HJA20], [SSDK+21], [SME20]。特别地，[SME20] 给出统一框架，把分数扩散模型解释为反向某些随机微分方程（SDE）——可使用 SDE 或概率流常微分方程（ODE），分别对应随机（DDPM 型）与确定性（DDIM 型）采样器。DDIM 型采样器更易加速，而 DDPM 型采样器在大量步数下往往生成更高质量与多样性的图像 [SME20]。

得益于其在生成复杂精细图像方面的表达力，分数扩散模型已成为图像重建中表达性先验的合理候选 [SSXE21], [CKM+23], [FSR+23]（通过贝叶斯后验采样的视角）。为适配多种图像特性与成像模态的应用，期望发展**即插即用**方法，使其无需为每个新成像任务从头训练或端到端训练。然而尽管近期涌现大量工作，现有算法要么计算昂贵 [WTN+23], [CICM23]，要么不一致 [CKM+23], [KEES22], [MSKV24]，要么局限于线性逆问题 [CICM23], [DS24]。因此一个自然的问题浮现：**能否发展一个实用、一致且鲁棒的算法，把分数扩散模型作为图像先验并与一般（可能非线性）前向模型结合？**

### 1.1 本文贡献

本文对上述问题给出肯定回答：提出一套算法框架，用于从图像后验分布采样，把分数扩散模型作为富有表达力的图像先验用于一般前向模型的非线性逆问题。具体贡献如下。

- **后验采样的扩散即插即用**：受成像社区即插即用框架 [VBW13] 启发，提出**扩散即插即用方法（DPnP）**，交替调用两个采样器：**近端一致性采样器**（旨在生成与测量更一致的样本）与**去噪扩散采样器**（侧重从更简单问题——白高斯噪声下的图像去噪——的后验分布采样，以施加先验约束）。该方法模块化：近端一致性采样器仅依赖前向模型的似然函数，去噪扩散采样器仅依赖图像先验的分数函数。
- **图像去噪的后验采样**：近端一致性采样器可较直接地借鉴 Metropolis 调整 Langevin 算法 [RR98] 等现有文献；而据我们所知，去噪扩散采样器尚未被文献处理。我们的关键洞见是：通过精心选择前向 SDE，并用指数积分器 [ZC22] 离散化所得反向 SDE 或 ODE，可用随机（DDPM 型）或确定性（DDIM 型）采样器求解。重要的是，去噪扩散采样器使用与生成相同的无条件分数函数，因而无需额外训练即可实现。
- **理论保证**：建立 DPnP 的渐近与非渐近性能保证。渐近上，在精确无条件分数估计假设下证明 DPnP 收敛到给定测量 $y$ 的 $x^\star$ 条件分布，从而验证方法正确性。随后建立 DPnP 的非渐近收敛理论：其性能随采样器误差（如分数估计误差与有限步数）**优雅退化**。据我们所知，这是首个使用无条件分数扩散先验、对非线性逆问题可证明鲁棒的方法。

我们进一步给出数值实验，说明其在超分辨、相位恢复与量化感知等线性/非线性图像重建任务上的潜力。由于其即插即用特性，我们预期它对广泛逆问题具有吸引力。

**相关工作**：鉴于其跨学科性质，本工作位于生成建模、计算成像、优化与采样的交叉处；受篇幅限制，相关工作的讨论见附录 A。

**记号**：$p_x$ 表示 $x$ 的概率分布，$p_x(\cdot\mid y)$ 表示给定 $y$ 时 $x$ 的条件分布。$X\overset{(d)}{=}Y$ 表示随机变量 $X$ 与 $Y$ 分布等价。$\mathbf I_d$ 表示 $d$ 维单位阵。对密度为 $p(x)$ 与 $q(x)$ 的两个概率分布，其全变差距离为 $\mathrm{TV}(p,q):=\int|p(x)-q(x)|\mathrm dx$；$p$ 相对 $q$ 的 $\chi^2$ 散度为 $\chi^2(p\Vert q):=\int\frac{(p(x)-q(x))^2}{q(x)}\mathrm dx$。

## 2 基于分数的生成模型

本节建立扩散生成模型的预备知识，作为算法基础。关键组成部分包括**前向过程**（通过逐步注入噪声把数据分布 $p^\star$ 扩散为标准正态分布）与**反向过程**（反转前向过程，从标准正态分布变换回数据分布 $p^\star$）。为便于理解，以连续时间形式表述；离散时间形式与实现见附录 E。

### 2.1 前向过程与分数函数

连续时间前向扩散遵循 Ornstein–Uhlenbeck（OU）过程，由如下 SDE 定义 [SSDK+21]：

$$
\mathrm dX_\tau=-X_\tau\mathrm d\tau+\sqrt{2}\,\mathrm dB_\tau,\qquad\tau\ge0,\qquad X_0\sim p^\star,\tag{1}
$$

其中 $(B_\tau)_{\tau\ge0}$ 为标准 $d$ 维布朗运动。可以证明 [Doo42], [Eva12]，$X_\tau$（$\tau\ge0$）的边缘分布为

$$
X_\tau\overset{(d)}{=}e^{-\tau}X_0+\sqrt{1-e^{-2\tau}}\,\varepsilon,\qquad X_0\sim p^\star,\ \varepsilon\sim\mathcal N(0,\mathbf I_d).\tag{2}
$$

于是当 $\tau\to\infty$ 时极限分布 $X_\infty\sim\mathcal N(0,\mathbf I_d)$，即 OU 过程把 $X_0\sim p^\star$ 扩散为标准正态分布。$X_\tau$ 的**分数函数**定义为

$$
s(\tau,x)=\nabla\log p_{X_\tau}(x).\tag{3}
$$

分数函数的一个启发性质 [Vin11] 是：它可解释为给定 $x_t=x$ 时 $\varepsilon_t$ 的最小均方误差（MMSE）估计，这由 Tweedie 公式可得：

$$
s(\tau,x)=-\frac{1}{\sqrt{1-e^{-2\tau}}}\underbrace{\mathbb E_{X_0\sim p^\star,\varepsilon\sim\mathcal N(0,\mathbf I_d)}\left[\varepsilon\ \middle|\ e^{-\tau}X_0+\sqrt{1-e^{-2\tau}}\varepsilon=x\right]}_{=:\varepsilon(\tau,x)}.\tag{4}
$$

因此可通过"学习去噪" [Hyv05] 来估计分数函数，即如实践中常见的那样估计去噪函数 $\varepsilon(\tau,\cdot)$ [HJA20]。

### 2.2 反向过程与采样

要实现采样需"反转"前向扩散过程。幸运的是，可借助经典理论 [And82], [AGS05] 反转 SDE，并对时间反转过程离散化以收集样本。下面描述两种流行做法，分别对应随机（DDPM 型）与确定性（DDIM 型）采样器，主要沿用 [SSDK+21] 提出的框架。

**时间反转 SDE 与概率流 ODE**：先给出更一般的 SDE 反转理论，这对后续章节有用。考虑如下 SDE：

$$
\mathrm dM_\tau=\alpha M_\tau\mathrm d\tau+\sqrt{\beta}\,\mathrm dB_\tau,\qquad\tau\ge0,\qquad M_0\sim p_{M_0},\tag{5}
$$

其中 $\alpha\in\mathbb R$、$\beta>0$ 为常数。对任意正时刻 $\tau_\infty>0$，定义反转时间参数

$$
\tau^{\mathrm{rev}}:=\tau^{\mathrm{rev}}(\tau)=\tau_\infty-\tau.\tag{6}
$$

1）式（5）在时间区间 $[0,\tau_\infty]$ 上的时间反转 SDE 定义为

$$
\mathrm dM^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}=\left(-\alpha M^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}+\beta\nabla\log p_{M_{\tau^{\mathrm{rev}}}}\left(M^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}\right)\right)\mathrm d\tau+\sqrt{\beta}\,\mathrm d\tilde B_\tau,\qquad\tau\in[0,\tau_\infty],\ M^{\mathrm{rev}}_{\tau_\infty}\sim p_{M_{\tau_\infty}},\tag{7}
$$

其中 $\tilde B$ 是 $B$ 的独立副本。经典结果 [And82] 表明反转过程 $M^{\mathrm{rev}}$ 与 $M$ 具有相同路径分布，即 $(M^{\mathrm{rev}}_\tau)_{\tau\in[0,\tau_\infty]}\overset{(d)}{=}(M_\tau)_{\tau\in[0,\tau_\infty]}$；换言之，对任意 $0\le\tau_1\le\cdots\le\tau_k\le\tau_\infty$ 与任意整数 $k\ge1$，$(M^{\mathrm{rev}}_{\tau_1},\ldots,M^{\mathrm{rev}}_{\tau_k})$ 的联合分布与 $(M_{\tau_1},\ldots,M_{\tau_k})$ 相同。

2）除式（7）的反转 SDE 外，还可考虑如下概率流 ODE [AGS05], [SSDK+21]：

$$
\mathrm dM^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}=\left(-\alpha M^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}+\frac{\beta}{2}\nabla\log p_{M_{\tau^{\mathrm{rev}}}}\left(\tau^{\mathrm{rev}},M^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}\right)\right)\mathrm d\tau,\qquad\tau\in[0,\tau_\infty],\ M^{\mathrm{rev}}_{\tau_\infty}\sim p_{M_{\tau_\infty}}.\tag{8}
$$

反转 ODE 的保证略弱于反转 SDE，但对多数实际目的已足够 [SSDK+21]：$M^{\mathrm{rev}}_\tau\overset{(d)}{=}M_\tau$（$\tau\in[0,\tau_\infty]$）。注意反转 ODE 只保证每个 $M^{\mathrm{rev}}_\tau$ 的边缘分布相同，而反转 SDE 保证联合分布相同。

把上述结论特化到 OU 过程（1）并做适当离散，即得生成中常用的采样器，如下所示。

**DDPM 型随机采样器**：把时间反转 SDE（7）特化到 OU 过程，得

$$
\mathrm dX^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}=\left(X^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}+2s\left(\tau^{\mathrm{rev}},X^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}\right)\right)\mathrm d\tau+\sqrt{2}\,\mathrm d\tilde B_\tau,\qquad\tau\in[0,\tau_\infty],\ X^{\mathrm{rev}}_{\tau_\infty}\sim p_{X_{\tau_\infty}}.
$$

当 $\tau_\infty\to\infty$ 时，由（2）可见 $p_{X_{\tau_\infty}}$ 收敛到 $\mathcal N(0,\mathbf I_d)$，故上述 SDE 的解可用 $X^{\mathrm{rev}}_{\tau_\infty}\sim\mathcal N(0,\mathbf I_d)$ 初始化来近似。DDPM 采样器 [HJA20] 可看作该 SDE 的一种离散化 [SSDK+21]。

**DDIM 型确定性采样器**：另一方面，OU 过程的概率流 ODE（8）为

$$
\mathrm dX^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}=\left(X^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}+s\left(\tau^{\mathrm{rev}},X^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}\right)\right)\mathrm d\tau,\qquad\tau\in[0,\tau_\infty],\ X^{\mathrm{rev}}_{\tau_\infty}\sim p_{X_{\tau_\infty}}.\tag{9}
$$

## 3 基于扩散即插即用的后验采样

我们关注求解（可能非线性的）逆问题，即从其测量 $y\in\mathbb R^m$ 推断未知图像 $x^\star\in\mathbb R^d$：

$$
y=\mathcal A(x^\star)+\xi,
$$

其中 $\mathcal A:\mathbb R^d\to\mathbb R^m$ 为前向模型下的测量算子，$\xi$ 表示测量噪声。我们聚焦贝叶斯设定：$x^\star$ 的先验信息以某先验分布 $p^\star(\cdot)$ 给出，即

$$
x^\star\sim p^\star(x),\tag{10}
$$

给定测量 $y$ 的后验分布定义为

$$
p^\star(x\mid y)\propto p^\star(x)\,p(y\mid x^\star=x)=p^\star(x)e^{\mathcal L(x;y)},\tag{11}
$$

其中 $\mathcal L(\cdot;y)$ 为测量的对数似然函数。我们的框架允许灵活选择前向模型与噪声分布。此外，虽该表述源自概率解释，它也涵盖"奖励引导"或"损失引导"设定 [SZY+23]：此时 $\mathcal L$ 可视为奖励函数或负损失函数，二者都刻画对 $x^\star$ 结构性质的偏好。

**对前向模型的假设**：全文为简化对 $\mathcal L$ 作如下温和假设，其适用于许多感兴趣的应用。

**假设 1**：$\mathcal L(\cdot;y)$ 几乎处处可微，且 $\sup_{x\in\mathbb R^d}\mathcal L(x;y)<\infty$。

**目标**：给定式（3）中无条件分数函数 $s(\tau,x)$（或噪声函数 $\varepsilon(\tau,x)$）的估计 $\hat s(\tau,x)$（或 $\hat\varepsilon(\tau,x)$），并假设已知似然函数 $\mathcal L(\cdot;y)$，目标是从后验分布采样 $\hat x\sim p^\star(\cdot\mid y)$。

### 3.1 关键构件：基于分数的去噪后验采样

我们先考察最基本的逆问题之一：白高斯噪声下的去噪。随后将说明，去噪扩散采样器会成为一般逆问题算法中的重要构建模块。

**白高斯噪声下的图像去噪**：设可获取 $x^\star\sim p^\star$ 被白高斯噪声污染后的含噪版本

$$
x^{\mathrm{noisy}}=x^\star+\xi,\qquad\xi\sim\mathcal N(0,\eta^2\mathbf I_d),\tag{12}
$$

其中噪声强度 $\eta>0$ 已知。目标是在给定分数估计 $\hat s_t(x)$（或噪声估计 $\hat\varepsilon_t(x)$）下从 $p^\star(\cdot\mid x^{\mathrm{noisy}})$ 采样。我们将发展基于分数的去噪后验采样器 **DDS**，含两个变体 **DDS-DDPM** 与 **DDS-DDIM**，可看作无条件分数采样中著名 DDPM 与 DDIM 采样器的对应物。需强调二者将由**不同的前向扩散过程**导出，因为我们观察到所得变体在经验上具有更强的竞争力。

**经由热流的随机 DDPM 型采样器**：先给出用于去噪的随机 DDPM 型采样器，记为 DDS-DDPM。分以下步骤。

1）**步骤 1：引入热流**。引入初始分布为 $p^\star$ 的热流，由如下 SDE 定义：

$$
\mathrm dY_\tau=\mathrm dB_\tau,\qquad\tau\ge0,\qquad Y_0\sim p^\star,\tag{13}
$$

其中 $(B_\tau)_{\tau\ge0}$ 为标准 $d$ 维布朗运动。式（13）的解即

$$
Y_\tau=Y_0+B_\tau,\qquad\tau\ge0.\tag{14}
$$

因 $B_\tau\sim\mathcal N(0,\tau\mathbf I_d)$，可立即得到 $B_{\eta^2}\overset{(d)}{=}\xi$；结合 $Y_0\sim p^\star$ 得重要观察：$x^{\mathrm{noisy}}=x^\star+\xi$ 可视为热流的端点，即 $x^{\mathrm{noisy}}=x^\star+\xi\overset{(d)}{=}Y_{\eta^2}$。

2）**步骤 2：反转热流**。与第 2 节类似，下一步归结为反转热流（13）。热流 SDE 的时间反转（cf. 式（7））为

$$
\mathrm dY^{\mathrm{rev}}_{\eta^2-\tau}=\nabla\log p_{Y_{\eta^2-\tau}}\left(Y^{\mathrm{rev}}_{\eta^2-\tau}\right)\mathrm d\tau+\mathrm d\tilde B_\tau,\qquad\tau\in[0,\eta^2],\ Y^{\mathrm{rev}}_{\eta^2}\sim p_{Y_{\eta^2}},\tag{15}
$$

其中 $(\tilde B_\tau)_{\tau\ge0}$ 是 $(B_\tau)_{\tau\ge0}$ 的独立副本。如前所述，时间反转 SDE（15）的优点在于其产生的过程 $Y^{\mathrm{rev}}_\tau$ 与 $Y_\tau$ 具有相同路径分布，即 $(Y^{\mathrm{rev}}_\tau)_{\tau\in[0,\eta^2]}\overset{(d)}{=}(Y_\tau)_{\tau\in[0,\eta^2]}$。特别地，$(Y^{\mathrm{rev}}_0,Y^{\mathrm{rev}}_{\eta^2})$ 的联合分布与 $(Y_0,Y_{\eta^2})\overset{(d)}{=}(x^\star,x^{\mathrm{noisy}})$ 相同，这意味着条件分布 $p^\star(\cdot\mid x^{\mathrm{noisy}})$ 与 $p_{Y^{\mathrm{rev}}_0}(\cdot\mid Y^{\mathrm{rev}}_{\eta^2}=x^{\mathrm{noisy}})$ 相同。后者的解释十分简单：$p_{Y^{\mathrm{rev}}_0}(\cdot\mid Y^{\mathrm{rev}}_{\eta^2}=x^{\mathrm{noisy}})$ 正是以 $Y^{\mathrm{rev}}_{\eta^2}=x^{\mathrm{noisy}}$ 初始化（15）时 $Y^{\mathrm{rev}}_0$ 的分布！因此，对后验 $p^\star(\cdot\mid x^{\mathrm{noisy}})$ 采样归结为求解如下简单 SDE：

$$
\mathrm dY^{\mathrm{rev}}_{\eta^2-\tau}=\nabla\log p_{Y_{\eta^2-\tau}}\left(Y^{\mathrm{rev}}_{\eta^2-\tau}\right)\mathrm d\tau+\mathrm d\tilde B_\tau,\qquad\tau\in[0,\eta^2],\ Y^{\mathrm{rev}}_{\eta^2}=x^{\mathrm{noisy}}.\tag{16}
$$

3）**步骤 3：连接分数函数**。现在把该 SDE（16）离散化即可得到所提随机采样器 DDS-DDPM，这需要知道分数函数 $\nabla\log p_{Y_\tau}(\cdot)$。一个关键观察是：它们可由分数函数 $s(\tau,x)$（cf. 式（3））算出，依据如下引理（证明见附录 D.1）。

**引理 1（$Y_\tau$ 的分数函数）**：对 $\tau\ge0$，有

$$
\nabla\log p_{Y_\tau}(x)=\frac{1}{\sqrt{1+\tau}}s\left(\frac{1}{2}\log(1+\tau),\frac{x}{\sqrt{1+\tau}}\right).
$$

所得采样器 DDS-DDPM 使用指数积分器 [ZC22] 的离散化流程总结于算法 2（见附录）。

**经由 OU 过程的确定性 DDIM 型采样器**：接下来发展用于去噪的确定性 DDIM 型采样器，记为 DDS-DDIM。

1）**步骤 1：引入以后验初始化的 OU 过程**。为从后验分布 $p^\star(\cdot\mid x^{\mathrm{noisy}})$ 采样，先引入随机变量 $w$，其（无条件）分布为

$$
p_w(x):=p^\star\left(x^\star=x\mid x^\star+\xi=x^{\mathrm{noisy}}\right),\tag{17}
$$

形式与所期望验分布 $p^\star(\cdot\mid x^{\mathrm{noisy}})$ 相同。此处含噪观测 $x^{\mathrm{noisy}}$ 已给定，故视为固定。进一步引入 $z=w-x^{\mathrm{noisy}}$，它是 $w$ 的"中心化"版本，其分布为 $p_z(x):=p_w(x+x^{\mathrm{noisy}})=p^\star(x^\star=x+x^{\mathrm{noisy}}\mid x^\star+\xi=x^{\mathrm{noisy}})$。初始分布为 $p_z$ 的 OU 过程由如下 SDE 定义：

$$
\mathrm dZ_\tau=-Z_\tau\mathrm d\tau+\mathrm dB_\tau,\qquad\tau\ge0,\qquad Z_0\sim p_z,\tag{18}
$$

其中 $B_\tau$ 为标准 $d$ 维布朗运动。与式（2）类似，$Z_\tau$ 的边缘分布为

$$
Z_\tau\overset{(d)}{=}e^{-\tau}Z_0+\sqrt{1-e^{-2\tau}}\,\varepsilon,\qquad Z_0\sim p_z,\ \varepsilon\sim\mathcal N(0,\mathbf I_d),\ \tau\ge0.\tag{19}
$$

2）**步骤 2：反转 OU 过程**。与第 2 节类似，反转 OU 过程（18）可生成样本 $z\sim p_z$，再令 $w=z+x^{\mathrm{noisy}}$，按定义其分布为式（17）的 $p_w$，即所期望验分布 $p^\star(\cdot\mid x^{\mathrm{noisy}})$ 的样本。于是需解（18）的时间反转概率流 ODE（cf. 式（8））：

$$
\mathrm dZ^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}=\left(Z^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}+\nabla\log p_{Z_{\tau^{\mathrm{rev}}}}\left(\tau^{\mathrm{rev}},Z^{\mathrm{rev}}_{\tau^{\mathrm{rev}}}\right)\right)\mathrm d\tau,\qquad\tau\in[0,\tau_\infty],\ Z^{\mathrm{rev}}_{\tau_\infty}\sim\mathcal N(0,\mathbf I_d),\ \tau^{\mathrm{rev}}=\tau_\infty-\tau.\tag{20}
$$

3）**步骤 3：连接分数函数**。把 ODE（20）离散化即得所提确定性采样器 DDS-DDIM，这需要知道 $\nabla\log p_{Z_\tau}(\cdot)$，同样可由分数函数 $s(\tau,x)$（cf. 式（3））算出，见如下引理（证明见附录 D.2）。

**引理 2（$Z_\tau$ 的分数函数）**：对 $\tau\ge0$，有

$$
\nabla\log p_{Z_\tau}(x)=-\frac{e^{2\tau}x}{\eta^2+e^{2\tau}-1}+\frac{e^{\tau-\tilde\tau}\eta^2}{\eta^2+e^{2\tau}-1}s\left(\tilde\tau,\frac{e^{-\tilde\tau}x^{\mathrm{noisy}}+e^{\tau-\tilde\tau}\eta^2x}{\eta^2+e^{2\tau}-1}\right),\tag{21}
$$

其中

$$
\tilde\tau:=\tilde\tau(\tau)=\frac{1}{2}\log\left(\frac{\eta^2\left(e^{2\tau}-1\right)}{\eta^2+e^{2\tau}-1}+1\right).\tag{22}
$$

把（21）代入（20）并求解 $Z^{\mathrm{rev}}_\tau$ 的 ODE，则如前所述 $Z^{\mathrm{rev}}_0+x^{\mathrm{noisy}}$ 即所期望验分布 $p^\star(\cdot\mid x^{\mathrm{noisy}})$ 的样本。数值上，用指数积分器 [ZC22] 离散求解 ODE（20）即得采样器 DDS-DDIM，总结于算法 3（见附录）。

**算法 1**　扩散即插即用（DPnP）

**输入**：测量 $y\in\mathbb R^m$、前向模型对数似然 $\mathcal L(\cdot;y)$、分数估计 $\hat s$、退火调度 $(\eta_k)_{0\le k\le K}$。
**初始化**：采样 $\hat x_0\sim\mathcal N\left(0,\eta_0^4\mathbf I_d\right)$。
**交替采样**：对 $k=0,1,2,\ldots,K-1$ 执行：
（1）**近端一致性采样器**：用子程序 $\mathrm{PCS}(\hat x_k,y,\mathcal L,\eta_k)$（算法 4）从正比于 $\exp\left(\mathcal L(\cdot;y)-\frac{1}{2\eta_k^2}\|\cdot-\hat x_k\|^2\right)$ 的分布采样 $\hat x_{k+\frac12}$；
（2）**去噪扩散采样器**：用子程序 DDS-DDPM$(\hat x_{k+\frac12},\hat s,\eta_k)$（算法 2）或 DDS-DDIM$(\hat x_{k+\frac12},\hat s,\eta_k)$（算法 3）从正比于 $\exp\left(\log p^\star(x)-\frac{1}{2\eta_k^2}\|x-\hat x_{k+\frac12}\|^2\right)$ 的分布采样 $\hat x_{k+1}$。
**输出**：$\hat x_K$。

### 3.2 本文算法：扩散即插即用

现在转向测量算子 $\mathcal A$ 任意的一般设定。由后验分布的分解（11）可直观理解：后验采样器必须同时满足两个约束：(i) **数据先验约束**，对应第一因子 $p^\star(x)$，要求后验采样器在 $p^\star(x)$ 较小的点采样概率较低；(ii) **测量一致性约束**，对应第二因子 $e^{\mathcal L(x;y)}$，要求 $\mathcal A(x)\approx y$。

**扩散即插即用（DPnP）**：我们沿用 [VDC19], [LST21], [BB23] 的思路，从采样视角**交替施加**这两个约束。所提算法称为扩散即插即用（DPnP），在两个采样器——去噪扩散采样器（DDS）与近端一致性采样器（PCS）——之间交替，二者可视为近端算子与梯度步的替代物。给定第 $k$ 次迭代的迭代点 $\hat x_k$ 与退火参数 $\eta_k$，DPnP 执行如下两步：

(i) **近端一致性采样器以施加测量一致性约束**：DPnP 从正比于 $\exp\left(\mathcal L(x;y)-\frac{1}{2\eta_k^2}\|x-\hat x_k\|^2\right)$ 的分布抽取样本 $\hat x_{k+\frac12}$，促使图像与测量一致。该步称为近端一致性采样器，可通过对 Metropolis 调整 Langevin 算法（MALA）[RR98] 等标准算法作小修改实现（算法 4，见附录）。

(ii) **去噪扩散采样器以施加数据先验约束**：DPnP 随后从正比于

$$
\exp\left(-\left(-\log p^\star(x)+\frac{1}{2\eta_k^2}\left\|x-\hat x_{k+\frac12}\right\|^2\right)\right)\propto p^\star\left(x^\star=x\mid x^\star+\eta_kw=\hat x_{k+\frac12}\right)\tag{23}
$$

的分布抽取样本 $\hat x_{k+1}$，促使图像与先验一致，其中 $w\sim\mathcal N(0,\mathbf I_d)$。最后一式由贝叶斯公式得到，清楚表明该步可**精确地**由（3.1 节发展的）去噪扩散采样器、仅用无条件分数函数实现。两步结合即得算法 1 所述的 DPnP 方法。关于所提 DPnP 方法作如下说明。

- 近端一致性采样器 PCS 可视为近端点法 [Dru17] 的"软"版本。由一阶近似可见：分布 $\exp\left(\mathcal L(\cdot;y)-\frac{1}{2\eta_k^2}\|\cdot-\hat x_k\|^2\right)$ 的最大似然在满足 $\nabla_{x'}\mathcal L(x';y)-\frac{1}{\eta_k^2}(x'-\hat x_k)=0$ 的点 $x'$ 处取得，即 $x'=\hat x_k+\eta_k^2\nabla_{x'}\mathcal L(x';y)\approx\hat x_k+\eta_k^2\nabla_{\hat x_k}\mathcal L(\hat x_k;y)$。故近端一致性采样器抽取"集中于" $x'$ 附近的随机样本，近似隐式近端点更新，类似于在 $\hat x_k$ 处的梯度步。
- 另一方面，去噪后验采样器 DDS 可视为近端算子的"软"版本。特别地，当 $p^\star$ 支撑在低维流形 $\mathcal M$ 上时，它迫使 $x$ 驻留于 $\mathcal M$ 中，如同近端映射；这是因为由（23）去噪后验分布在该流形外为零。
- 当前向模型 $\mathcal A$ 为线性（即 $\mathcal A(x)=\mathbf Ax$，$\mathbf A\in\mathbb R^{m\times d}$）、测量噪声 $\xi\sim\mathcal N(0,\boldsymbol\Sigma)$ 为高斯时，近端一致性采样器有简单形式：

$$
\hat x_{k+\frac12}=\mathrm{PCS}(\hat x_k,y,\mathcal L,\eta_k)=\tilde x_k+\tilde{\boldsymbol\Sigma}_k^{1/2}w_k,\qquad w_k\sim\mathcal N(0,\mathbf I_d),
$$

其中 $\tilde x_k=\left(\mathbf A^\top\boldsymbol\Sigma^{-1}\mathbf A+\frac{1}{\eta_k^2}\mathbf I_d\right)^{-1}\left(\mathbf A^\top\boldsymbol\Sigma^{-1}y+\frac{1}{\eta_k^2}\hat x_k\right)$，$\tilde{\boldsymbol\Sigma}_k=\left(\mathbf A^\top\boldsymbol\Sigma^{-1}\mathbf A+\frac{1}{\eta_k^2}\mathbf I_d\right)^{-1}$。

## 4 理论分析

本节建立 DPnP 的渐近与非渐近性能保证。

**渐近一致性**：先给出 DPnP 的渐近一致性定理。

**定理 1（DPnP 的渐近一致性）**：假设分数函数估计精确，即 $\hat s(\tau,x)=s(\tau,x)$；并假设 DDS 与 PCS 中的 ODE/SDE 被精确求解。令 $(\varepsilon_l)_{l\ge0}$ 为满足 $\lim_{l\to\infty}\varepsilon_l=0$ 的正数递减序列，$(k_l)_{l\ge0}$ 为满足 $k_0=0$ 的整数递增序列。置退火调度 $\eta_k=\varepsilon_l$（$k_{l-1}\le k<k_l$，$l=1,2,\cdots$）。令 $\min_{l'=1,2,\cdots}|k_{l'}-k_{l'-1}|\to\infty$，则当 $l\to\infty$ 时 DPnP 的输出 $\hat x_{k_l}$ 依分布收敛到后验分布 $p^\star(\cdot\mid y)$。

换言之，定理 1 在关于前向模型的相当温和假设（cf. 假设 1）下建立了 DPnP 的渐近一致性：只要 DDS 与 PCS 的采样分布精确，则以缓慢减小的退火调度 $\{\eta_k\}$ 运行 DPnP，当迭代数 $l\to\infty$ 时输出样本将逼近所期望验分布 $p^\star(\cdot\mid y)$。

**非渐近误差分析**：现在离开 DDS 与 PCS 采样分布精确的理想设定。实践中存在许多误差源会影响其采样分布，例如数值求解 ODE/SDE 的离散化误差与分数估计误差；这些非理想性使 PCS 与 DDS 不再精确，即它们生成的分布会略微偏离本应采样的分布。本文用 PCS（或 DDS）生成分布到理想分布（正比于 $\exp\left(\mathcal L(x;y)-\frac{1}{2\eta_k^2}\|x-\hat x_k\|^2\right)$，或 $p^\star\left(x^\star=x\mid x^\star+\eta_k\varepsilon=\hat x_{k+\frac12}\right)$）的全变差距离、且在所有迭代上一致地刻画这些偏差。分析这些误差超出本文范围，感兴趣的读者可参阅并行工作 [LWCC23], [MV19], [CLA+21] 等；本文分析中假设 PCS 与 DDS 的全变差误差具有黑箱上界，该上界可与相应采样器的既有分析结合以界定 DPnP 的迭代复杂度。

**定理 2（DPnP 的非渐近鲁棒性）**：沿用 DPnP（算法 1）记号，置 $\eta_k\equiv\eta>0$。在假设 1 下存在 $\lambda:=\lambda(p^\star,\mathcal L,\eta)\in(0,1)$ 使下述成立。定义平稳分布 $\pi_\eta$ 为 $\pi_\eta(x)\propto p^\star(x)q_\eta(x)$，其中 $q_\eta$ 由下式定义（$\ast$ 表示卷积）：

$$
q_\eta(x):=e^{\mathcal L(\cdot;y)}\ast p_{\eta\varepsilon}(x)=\frac{1}{(2\pi)^{d/2}\eta^d}\int e^{\mathcal L(x';y)-\frac{1}{2\eta^2}\|x-x'\|^2}\mathrm dx',\qquad\varepsilon\sim\mathcal N(0,\mathbf I_d),\tag{24}
$$

若 PCS 的全变差误差至多 $\varepsilon_{\mathrm{PCS}}$、DDS 每次迭代的全变差误差至多 $\varepsilon_{\mathrm{DDS}}$，则对任意精度目标 $\varepsilon_{\mathrm{acc}}>0$，取 $K\asymp\frac{\log(1/\varepsilon_{\mathrm{acc}})}{1-\lambda}$，有

$$
\mathrm{TV}\left(p_{\hat x_K},\pi_\eta\right)\lesssim\varepsilon_{\mathrm{acc}}\sqrt{\chi^2\left(p_{\hat x_1}\Vert\pi_\eta\right)}+\frac{1}{1-\lambda}\left(\varepsilon_{\mathrm{DDS}}+\varepsilon_{\mathrm{PCS}}\right)\log\left(\frac{1}{\varepsilon_{\mathrm{acc}}}\right).\tag{25}
$$

在解释定理 2 之前，注意 $q_0(x)=e^{\mathcal L(x;y)}$，故 $\pi_0(x)\propto p^\star(x)e^{\mathcal L(x;y)}$ 与所期望验分布 $p^\star(\cdot\mid y)$ 一致。因此定理 2 表明：在常数退火调度 $\eta_k=\eta$ 下，DPnP 的输出在足够多迭代后依全变差收敛到分布 $\pi_\eta$，它是最多被 $\eta$ 层级扭曲的所期望验分布。作几点说明。

**非递减的 $\eta$**：由定理 2 可见，即使 $\eta$ 非零，DPnP 仍严格施加数据先验；而测量一致性被扭曲约 $\eta$ 阶。这通常可容忍，因为测量本身受噪声污染，故当 $\eta$ 小于噪声水平时该扭曲可容忍。实践中采用 $\{\eta_k\}$ 的退火调度更有利，详见第 5 节。

**可证明的鲁棒性**：定理 2 表明 DPnP 的性能在存在采样误差时优雅退化。据我们所知，这是首个使用基于分数的扩散先验、对非线性逆问题可证明一致且鲁棒的后验采样方法。

## 5 数值实验

我们给出初步数值证据，以印证 DPnP 在求解线性与非线性图像重建任务上的潜力。把采用子程序 DDS-DDPM 与 DDS-DDIM 的 DPnP 分别记为 **DPnP-DDPM** 与 **DPnP-DDIM**。

**实验设置**：我们与最先进算法 DPS [CKM+23]、LGD-MC [SZY+23] 与基于像素的 ReSample [SKZ+23] 在超分辨（线性）、相位恢复（非线性）与量化感知（非线性）上比较。这些前向测量模型的定义见附录 G.2。DPnP 的退火调度 $\{\eta_k\}$ 在所有任务中固定（附录 H.2），而 DPS、LGD-MC 与 ReSample 经合理努力微调至最佳性能。所有实验在单块 NVIDIA L40 GPU 上运行；更多细节与实验见附录 G。

**样本图像**：我们给出最复杂任务（相位恢复）下不同算法的样本图像。相位恢复中，对带编码掩膜的图像做傅里叶变换，仅取傅里叶变换的幅度作为测量 [SEC+15]；由于取幅度操作的非线性，前向模型是非线性的。不同算法生成的样本见表 1。我们也给出非线性问题量化感知的样本图像：量化感知中图像每个像素先被随机抖动、再按每通道量化为一比特，量化的非线性使该前向模型非线性；样本见表 2。

**评估**：我们在 FFHQ 验证集 [KLA19] 与 ImageNet 验证集 [RDS+15] 上评估 DPnP。由于 DPnP-DDIM 与 DPnP-DDPM 性能相近但实现快得多，仅评估 DPnP-DDIM。LPIPS 与 PSNR 见表 3 与表 4——这两个指标可说是求解逆问题更相关的指标；其他指标（如 FID、SSIM）的比较见附录 G.4。可以看到，DPnP 能求解线性与非线性问题，且相比此前最先进方法在恢复细微、更清晰细节方面表现更好。

## 6 讨论与结论

本文提出一个严格且通用的算法框架 DPnP，用于在一般前向模型下、以分数扩散模型规定的图像先验，通过后验采样求解非线性逆问题。DPnP 在两个由 DDS 与 PCS 实现的采样步之间交替，以分别促进与数据先验约束和测量约束的一致性。我们给出渐近与非渐近收敛保证，确立 DPnP 为首个面向一般非线性逆问题、基于分数扩散且可证明一致与鲁棒的后验采样方法。

**致谢与资助披露**：本工作部分受美国海军研究办公室 N00014-19-1-2404 与 NSF DMS-2134080、ECCS-2126634 支持；X. Xu 还获卡内基梅隆大学 Axel Berny 校长研究生奖学金资助。

{% endraw %}
## 附录

### A 相关工作

**算法展开与即插即用图像重建**：旨在最小化测量保真项与促进期望解结构的正则项之和的复合优化算法，一直是逆问题求解器的骨干。为释放深度学习能力，[GL10] 提出算法展开视角，把迭代算法变为线性与非线性层的串联，如同神经网络；[VBW13] 认识到许多复合优化算法中的近端映射步可视为针对给定先验的去噪器或去噪算子，并提出"插入"替代去噪器——尤其是最先进的深度学习去噪器——由此形成一类流行算法，即即插即用方法 [BCSB18]；综述见 [MLE21]。

**去噪正则化与分数匹配**：[Vin11] 指出分数匹配与图像去噪之间的联系，这是 Tweedie 公式 [Efr11] 的推论。去噪正则化（RED）框架 [REM17] 沿用即插即用框架，最小化一个正则化目标函数，其正则项基于插入的图像去噪器定义；[RS18] 后来阐明 RED 框架可解释为通过 Tweedie 公式做去噪的分数匹配。[KVE21] 发展了随机图像去噪器，用退火 Langevin 动力学对图像去噪做后验采样；[FBS24] 给出学习逆问题精确近端算子的框架。

**即插即用后验采样**：受刻画不确定性的需求驱动，从贝叶斯视角把图像重建作为后验采样是另一条重要途径。我们的方法受即插即用框架启发，但采取采样视角，利用优化与采样之间的联系 [Wib18]。类似地，[LBA+22], [BB23] 提出即插即用的贝叶斯对应物用于后验采样，利用与分数匹配的联系从图像先验采样，但未考虑把分数扩散模型作为图像先验，而这正是我们的关键方面；另见 [SWC+23]。[CDC23] 扩展即插即用框架中的 split Gibbs 采样器 [VDC19]，并基于启发式观察主张把 DDPM [HJA20] 等分数扩散模型用于图像去噪；相反，我们从第一性原理严格推导去噪扩散采样器，揭示朴素地把生成采样器用于去噪的关键差距，并对方法的正确性给出理论保证。

**作为图像先验的分数扩散模型**：若干使用分数扩散先验求解逆问题的代表性方法在沿扩散过程取步与投影到测量约束之间交替，例如 [CKM+23], [KEES22], [SKZ+23], [CLY23], [GMJS22], [SVMK22]；但这些方法不具备渐近一致性保证。[SZY+23] 提出用多个蒙特卡洛样本降低偏差；[CICM23] 为贝叶斯线性逆问题发展蒙特卡洛引导扩散方法（往往计算昂贵）；[DS24] 近期引入滤波视角并应用粒子滤波。这些方法虽渐近一致，但局限于线性逆问题。[TYT+22], [WTN+23] 引入序列蒙特卡洛（SMC）算法，用无条件扩散模型做条件采样且渐近精确。[MSKV24] 发展变分视角，与去噪正则化框架相联系。[GJP+24] 证明扩散后验采样的最坏情形复杂度对任何算法都可能超多项式时间。

**扩散模型与分数匹配理论**：近期大量论文研究了流行扩散采样器的非渐近收敛速率，包括但不限于随机 DDPM 型采样器 [CCL+22], [CLL23], [LWCC23], [BDBDD24], [TZ24]、确定性 DDIM 型采样器 [LWCC23], [CCL+23], [CDD23] 与加速采样器 [LHE+24], [LHW24]；此外，分数匹配的统计效率也已被研究 [KHR23], [PRS+24]。

### B 扩散过程的离散时间表述

离散时间的前向与反向扩散过程可理解为按如下方式构造的两个过程：1）前向过程 $x_0\to x_1\to\cdots\to x_T$，从目标图像分布的样本出发，通过逐步注入噪声扩散到噪声分布（如标准高斯）；2）反向过程 $x_T^{\mathrm{rev}}\to x_{T-1}^{\mathrm{rev}}\to\cdots\to x_0^{\mathrm{rev}}$，从纯噪声（如标准高斯）出发，转换为分布接近目标图像分布的样本。

考虑 $\mathbb R^d$ 中以数据分布 $p_X$ 的样本为起点、并沿轨迹加噪的前向马尔可夫过程：

$$
x_0\sim p^\star,\tag{26a}
$$
$$
x_t=\sqrt{1-\beta_t}\,x_{t-1}+\sqrt{\beta_t}\,w_t,\qquad1\le t\le T,\tag{26b}
$$

其中 $\{w_t\}_{1\le t\le T}$ 为独立标准高斯向量，即 $w_t\overset{\mathrm{i.i.d.}}{\sim}\mathcal N(0,\mathbf I_d)$，$\{\beta_t\in(0,1)\}$ 描述每步的噪声注入率。于是 $x_t$ 可等价地写为

$$
x_t:=\sqrt{\bar\alpha_t}\,x_0+\sqrt{1-\bar\alpha_t}\,\varepsilon_t,\qquad\varepsilon_t\sim\mathcal N(0,\mathbf I_d),\ t=0,1,\cdots,T,\tag{27}
$$

其中 $(\bar\alpha_t)_{t=0,1,\cdots,T}$ 为扩散调度：

$$
\alpha_t:=1-\beta_t,\qquad\bar\alpha_t:=\prod_{k=1}^{t}\alpha_k,\qquad1\le t\le T.\tag{28}
$$

显然有 $1\ge\bar\alpha_0>\bar\alpha_1>\cdots>\bar\alpha_T>0$；只要 $\bar\alpha_T$ 趋于零，就容易看出 $x_T$ 的分布趋近 $\mathcal N(0,\mathbf I_d)$。

**分数函数**：后文将看到，为从 $p^\star$ 采样，只需学习前向过程各步 $p_{x_t}$ 的分数函数：

$$
s_t^\star(x)=\nabla\log p_{x_t}(x),\qquad t=0,1,\cdots,T.\tag{29}
$$

与连续时间一样，分数函数可视为 MMSE 估计：

$$
s_t^\star(x)=-\frac{1}{\sqrt{1-\bar\alpha_t}}\underbrace{\mathbb E_{x_0\sim p^\star,\varepsilon_t\sim\mathcal N(0,\mathbf I_d)}\left(\varepsilon_t\ \middle|\ \sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\varepsilon_t=x\right)}_{=:\varepsilon_t^\star(x)}.\tag{30}
$$

比较（27）与（2）可验证：通过时间变换 $t\mapsto\frac{1}{2}\log\frac{1}{\bar\alpha_t}$，离散时间扩散过程可嵌入连续时间过程，即 $x_t^\star\overset{(d)}{=}X_{\frac{1}{2}\log\frac{1}{\bar\alpha_t}}$，由此建立连续时间表述与离散时间表述的对应关系。在离散时间表述中，假设分数函数估计 $\hat s_t(\cdot):\mathbb R^d\to\mathbb R^d$（$t=1,\ldots,T$）满足 $\hat s_t\approx s_t^\star$，与连续时间对应物一致。

### C 算法子程序细节

基于附录 B 建立的离散时间视角，下面给出算法 DDS-DDPM（算法 2）、DDS-DDIM（算法 3）与 PCS（算法 4）的详细描述与实现。

**算法 2**　去噪扩散采样器（随机）$\mathrm{DDS\text{-}DDPM}(x^{\mathrm{noisy}},\hat s,\eta)$

**输入**：含噪数据 $x^{\mathrm{noisy}}\in\mathbb R^d$、分数估计 $\hat s:=\{\hat s_t(\cdot):\mathbb R^d\to\mathbb R^d,\ t=1,\ldots,T\}$（或噪声估计 $\hat\varepsilon=\{\hat\varepsilon_t(\cdot)\}$）、噪声水平 $\eta>0$。
**调度**：按 $\tau_t=\bar\alpha_t^{-1}-1$（$0\le t\le T'$）计算扩散调度，其中 $T':=\max\left\{t:0\le t\le T,\ \bar\alpha_t>\frac{1}{\eta^2+1}\right\}$。
**初始化**：置 $\hat x_{T'}=x^{\mathrm{noisy}}$。
**扩散**：对 $t=T',T'-1,\ldots,1$ 执行
$$
\hat x_{t-1}=\hat x_t-2\left(\sqrt{\tau_t}-\sqrt{\tau_{t-1}}\right)\hat\varepsilon_t+\sqrt{\tau_t-\tau_{t-1}}\,w_t,\qquad w_t\sim\mathcal N(0,\mathbf I_d),
$$
其中 $\hat\varepsilon_t:=\hat\varepsilon_t\left(\sqrt{\bar\alpha_t}\hat x_t\right)=-\frac{1}{\sqrt{1-\bar\alpha_t}}\hat s_t\left(\sqrt{\bar\alpha_t}\hat x_t\right)$。
**输出**：$\hat x_0$。

**算法 3**　去噪扩散采样器（确定性）$\mathrm{DDS\text{-}DDIM}(x^{\mathrm{noisy}},\hat s,\eta)$

**输入**：同算法 2。
**调度**：按 $\bar u_t=\frac{(\eta^2+1)\bar\alpha_t-1}{\eta^2+\bar\alpha_t-1}$（$0\le t\le T'$）计算扩散调度，其中 $T'$ 同上。
**初始化**：采样 $z_{T'}\sim\mathcal N(0,\mathbf I_d)$。
**扩散**：对 $t=T',T'-1,\ldots,1$ 执行
$$
z_{t-1}=\frac{\sqrt{(\eta^2-1)\bar u_{t-1}+1}}{\sqrt{(\eta^2-1)\bar u_t+1}}\,z_t+\sqrt{(\eta^2-1)\bar u_{t-1}+1}\left[h(\eta,\bar u_{t-1})-h(\eta,\bar u_t)\right]\hat\varepsilon_t,
$$
其中 $h(\eta,u):=-\arctan\frac{\eta\sqrt{u^{-1}-1}}{\cdot}$（原文按 $\arctan$ 形式给出），且
$$
\hat\varepsilon_t:=\hat\varepsilon_t\left(\frac{\sqrt{\bar\alpha_t}x^{\mathrm{noisy}}+\eta^2\sqrt{\bar u_t\bar\alpha_t}\,z_t}{(\eta^2-1)\bar u_t+1}\right)=-\frac{1}{\sqrt{1-\bar\alpha_t}}\hat s_t\left(\frac{\sqrt{\bar\alpha_t}x^{\mathrm{noisy}}+\eta^2\sqrt{\bar u_t\bar\alpha_t}\,z_t}{(\eta^2-1)\bar u_t+1}\right).
$$
**输出**：$x^{\mathrm{noisy}}+z_0$。

**算法 4**　近端一致性采样器 $\mathrm{PCS}(x,y,\mathcal L,\eta)$（改编自 Metropolis 调整 Langevin 算法 [RR98]）

**输入**：起点 $x\in\mathbb R^d$、测量 $y\in\mathbb R^m$、前向模型对数似然 $\mathcal L(\cdot;y)$、近端参数 $\eta>0$。
**超参数**：Langevin 步长 $\gamma$、迭代次数 $N$。
**初始化**：$z_0=x$。
**更新**：对 $n=0,1,\cdots,N-1$ 执行：
（1）一步离散 Langevin：置 $r=e^{-\gamma/\eta^2}$，并
$$
z_{n+\frac12}=rz_n+(1-r)x+\eta^2(1-r)\nabla_{z_n}\mathcal L(z_n;y)+\eta\sqrt{1-r^2}\,w_n,\qquad w_n\sim\mathcal N(0,\mathbf I_d).
$$
这等价于从密度为 $Q(\cdot;z_n)$ 的分布抽取 $z_{n+\frac12}$，其中
$$
Q(z';z)=\frac{1}{(2\pi(1-r^2))^{d/2}}\exp\left(-\frac{\left\|z'-\left(rz+(1-r)x+\eta^2(1-r)\nabla_z\mathcal L(z;y)\right)\right\|^2}{2(1-r^2)}\right).
$$
（2）Metropolis 调整：计算接受比
$$
q=\frac{\exp\left(\mathcal L(z_{n+\frac12};y)-\frac{1}{2\eta^2}\left\|z_{n+\frac12}\right\|^2\right)Q(z_n;z_{n+\frac12})}{\exp\left(\mathcal L(z_n;y)-\frac{1}{2\eta^2}\left\|z_n\right\|^2\right)Q(z_{n+\frac12};z_n)},
$$
以概率 $\min(1,q)$ 接受 $z_{n+1}=z_{n+\frac12}$，否则置 $z_{n+1}=z_n$。
**输出**：$z_N$。

### D 去噪扩散采样器的分数函数

**D.1 引理 1 的证明**：热流的边缘分布（14）可写为 $Y_\tau\overset{(d)}{=}\sqrt{1+\tau}X_\theta$，其中 $\theta=\frac{1}{2}\log(1+\tau)$ 为简记。于是 $p_{Y_\tau}(x)=p_{\sqrt{1+\tau}X_\theta}(x)\propto p_{X_\theta}\left(\frac{1}{\sqrt{1+\tau}}x\right)$，故
$$
\nabla\log p_{Y_\tau}(x)=\nabla_x\log p_{X_\theta}\left(\frac{1}{\sqrt{1+\tau}}x\right)=\frac{1}{\sqrt{1+\tau}}s\left(\theta,\frac{1}{\sqrt{1+\tau}}x\right),
$$
把 $\theta=\frac{1}{2}\log(1+\tau)$ 代入即得引理 1。

**D.2 引理 2 的证明**：由 $Z_\tau\overset{(d)}{=}e^{-\tau}Z_0+\sqrt{1-e^{-2\tau}}\varepsilon$，其中 $Z_0=w-x^{\mathrm{noisy}}$、$w\sim p^\star(\cdot\mid x^{\mathrm{noisy}})$，可把 $Z_\tau$ 分布写成 $x^{\mathrm{noisy}}$ 与 $X_{\tilde\tau}$ 的显式组合；对 $p_{Z_\tau}$ 取对数梯度并用链式法则，结合引理 1 的分数函数变换即可整理出（21）（22），其中 $\tilde\tau$ 的表达式由匹配噪声尺度得到。

### E 基于指数积分器的离散化

**E.1 指数积分器的一般形式**：给出线性 SDE/ODE 的指数积分器离散化通式：对 $\mathrm dM_\tau=\left(\alpha M_\tau+\beta\right)\mathrm d\tau+\sqrt{\gamma}\,\mathrm dB_\tau$，在离散区间上把线性部分精确积分、非线性（分数）部分视为常数，得到更新式 $\hat M_{\tau_{t-1}}=e^{\alpha\Delta}\hat M_{\tau_t}+\cdots$，从而避免小步长下的数值不稳定。

**E.2 DDS-DDPM 的离散化**：把 E.1 的通式用于时间反转热流 SDE（16），以噪声估计 $\hat\varepsilon$ 替代分数，得到算法 2 中的更新式（原文给出逐步推导，说明其与算法 2 的更新方程一致，仅把 $\varepsilon_t^\star$ 替换为噪声估计 $\hat\varepsilon_t$）。

**E.3 DDS-DDIM 的离散化**：把 E.1 的通式用于时间反转概率流 ODE（20），得到算法 3 的更新式与初始化；推导与 E.2 类似，区别在于以 ODE 的确定性推进替代 SDE 的随机项。

**E.4 PCS 的离散化**：说明 PCS 采用 Metropolis 调整的 Langevin 离散（算法 4）；Metropolis 调整步是标准做法（参照 [Tie94]），保证目标分布 $\propto\exp\left(\mathcal L(x;y)-\frac{1}{2\eta^2}\|x-\hat x_k\|^2\right)$ 为不变分布。

### F 主要定理的证明

**F.1 定理 1 的证明**：证明思路是把 DPnP 的迭代视为对退火序列上"近端—去噪"两步复合映射的重复施加；在 $\eta_k\equiv\varepsilon_l$ 的每个阶段内，利用 DDS 精确采样 $\propto p^\star(x)\exp\left(-\frac{1}{2\eta_k^2}\|x-\hat x_{k+\frac12}\|^2\right)$ 与 PCS 精确采样 $\propto\exp\left(\mathcal L(x;y)-\frac{1}{2\eta_k^2}\|x-\hat x_k\|^2\right)$ 的假设，证明该复合映射的不动点分布在 $\varepsilon_l\to0$ 时收敛到 $p^\star(\cdot\mid y)$；再令每阶段迭代数 $\min_l|k_l-k_{l-1}|\to\infty$ 使各阶段收敛到其不动点，从而输出依分布收敛到后验。

**F.2 引理 4 的证明**：给出复合马尔可夫核在 $\chi^2$ 散度下的压缩性估计，说明为何存在 $\lambda\in(0,1)$ 使 $\chi^2$ 收缩。

**F.3 引理 5 的证明**：给出单步（PCS+DDS）迭代后 $\chi^2(p_{\hat x_{k+1}}\Vert\pi_\eta)$ 与 $\chi^2(p_{\hat x_k}\Vert\pi_\eta)$ 的递推不等式，含 $\varepsilon_{\mathrm{PCS}}$、$\varepsilon_{\mathrm{DDS}}$ 的线性项。

**F.4 引理 6 的证明**：给出 $\chi^2$ 与 TV 之间的关系（Pinsker 型不等式），用于把 $\chi^2$ 递推转化为 TV 界。

**F.5 定理 2 的证明**：结合 F.2—F.4 的递推与压缩估计，迭代 $K$ 步后得到式（25）的 TV 上界；取 $K\asymp\frac{\log(1/\varepsilon_{\mathrm{acc}})}{1-\lambda}$ 使压缩项与误差项平衡。

**F.6 引理 9 的证明**：给出谱隙下界与 $\eta$ 的关系（$\lambda$ 与 $\Omega(\eta)$ 的估计），用于说明收敛时间与 $\eta$ 的权衡。

### G 附加数值结果

**G.1 实现细节**：说明实现基于公开的 DPS 代码库⁴，扩散模型采用与基线相同的预训练检查点，DPnP 的超参数设置与固定退火调度等。

**G.2 前向测量算子**：**超分辨**：双三次下采样算子，将 256×256 图像降为 64×64 再恢复（线性）；**相位恢复**：前向算子为 $\mathcal A(x)=\mathrm{mag}\left(\mathcal F(\mathbf M\odot x)\right)$，其中 $\odot$ 为 Hadamard 逐元素积、$\mathcal F$ 为傅里叶变换、$\mathrm{mag}(\cdot)$ 取逐元素幅度，测量噪声为白高斯、方差 0.2（非线性）；**量化感知**：逐像素抖动后每通道量化为一比特，前向算子是如下随机函数 $\mathcal Q$（抖动水平 $\theta>0$）的逐元素应用：

$$
\mathcal Q(\mathrm{pixel})=\begin{cases}1,&\text{以概率 }\dfrac{e^{\mathrm{pixel}/\theta}}{1+e^{\mathrm{pixel}/\theta}},\\[6pt]-1,&\text{以概率 }\dfrac{1}{1+e^{\mathrm{pixel}/\theta}},\end{cases}
$$

其中 $\mathrm{pixel}\in[-1,1]$ 为各通道像素值；实验中抖动水平 $\theta=0.4$，故测量为每通道一比特图像（非线性）。

**G.3 其他逆问题的样本图像**：超分辨任务的不同算法样本见表 5；跨线性与非线性任务可见 DPnP 对图像精细细节具有更强的重建保真能力。

**G.4 附加性能指标**：**NFE 计算代价**：在正文的时钟时间统计之外，我们还以神经函数评估次数（NFE，即分数函数调用次数）衡量每样本计算代价，结果见表 6；注意 DPnP 的 NFE 依赖初始化、退火调度（与 DPnP-DDIM 的时间步数），表中给出附录 H 参数与合适时间步数下的典型值。**FID 与 SSIM**：我们还比较不同算法在各任务上的 FID 与 SSIM，见表 7 与表 8；需指出 FID 严格来说并非衡量逆问题求解质量的很相关指标——准确求解逆问题意味着生成分布接近图像的条件（后验）分布，而 FID 只衡量其与无条件（先验）分布的接近程度。

### H 消融研究

**H.1 初始化**：算法 1 中初始猜测 $\hat x_0$ 设为适当缩放的高斯随机向量；但由定理 2 可推断，用启发式后验采样器作为初始化器可减小 $\chi^2(p_{\hat x_1}\Vert\pi_\eta)$，从而可能加快 DPnP 收敛。通过把 DPS 或 LGD-MC 等现有算法用作初始化器，DPnP 能高效且可证明地向正确后验分布改进现有算法的结果。实验中我们发现用 LGD-MC 初始化 DPnP 有助于显著加速算法。

**H.2 退火调度**：讨论 DPnP（算法 1）中退火调度 $\eta_k$ 的选择。由理论分析（定理 2），若取所有 $\eta_k\equiv\eta$（常数 $\eta>0$），则 DPnP 收敛到分布 $\pi_\eta$，可视为被 $O(\eta)$ 阶扭曲的后验分布 $p^\star(\cdot\mid y)$；$\eta$ 越小最终分布越准确。另一方面，许多情形下谱隙为 $\Omega(\eta)$，故收敛时间为 $O(1/\eta)$，因此较小的 $\eta$ 会使收敛更慢。为在精度与收敛速率之间取得平衡，我们借鉴 [BB23] 的经验采用逐渐减小的 $\eta_k$ 调度：前几次迭代把 $\eta_k$ 设为较大的常数，随后缓慢减小，最终达到较小的常数 $\eta_N$。示例调度为

$$
\eta_0=\eta_1=\cdots=\eta_{K_0}=\eta_0>0\ \text{（较大常数）},\qquad\eta_k=\left(\frac{\eta_K}{\eta_0}\right)^{\frac{k-K_0}{K-K_0}}\eta_0,\qquad K_0<k\le K,\ \eta_K>0\ \text{（较小常数）},
$$

其中 $K_0<K$ 为初始阶段长度（例如可取 $K_0=K/5$）。所有数值实验中取 $\eta_0=0.4$、$\eta_N=0.15$、$K_0=4$、$K=20$。

## 表格

**表 1　相位恢复的不同算法样本**（原表为图像对照表，无数字；按原表说明转录列结构）

| Input | DPS | LGD-MC | ReSample | DPnP-DDPM | DPnP-DDIM | Ground truth |
| --- | --- | --- | --- | --- | --- | --- |

> **注**：原表为样本图像网格，无数值单元格；上表给出其列结构。（DPnP 生成的图像质量更高、比最先进的 DPS [CKM+23] 与 LGD-MC [SZY+23] 更忠实地恢复细节；基于像素的 ReSample [SKZ+23] 未能生成有意义的图像，可能是相位恢复的高非线性所致。）

**表 2　量化感知的不同算法样本**（原表为图像对照表，无数字；按原表说明转录列结构）

| Input | DPS | LGD-MC | ReSample | DPnP-DDPM | DPnP-DDIM | Ground truth |
| --- | --- | --- | --- | --- | --- | --- |

**表 3　FFHQ 256×256 验证集（1k 样本）上求解逆问题的评估**（按原表逐格转录；尽管努力调参，基于像素的 ReSample 在相位恢复上仍未生成有意义结果）

| 算法 | 超分辨（4×，线性）LPIPS↓ | 超分辨 PSNR↑ | 相位恢复（非线性）LPIPS↓ | 相位恢复 PSNR↑ | 量化感知（非线性）LPIPS↓ | 量化感知 PSNR↑ | 每样本时间 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DPnP-DDIM（本文） | 0.301 | 24.2 | 0.376 | 22.4 | 0.293 | 24.2 | ∼90 s |
| DPS [CKM+23] | 0.331 | 23.1 | 0.490 | 17.4 | 0.367 | 21.7 | ∼60 s |
| LGD-MC（n=5）[SZY+23] | 0.318 | 23.9 | 0.522 | 16.4 | 0.317 | 23.9 | ∼60 s |
| ReSample（基于像素）[SKZ+23] | 0.313 | 23.9 | – | – | 0.318 | 22.6 | ∼70 s |

**表 4　ImageNet 256×256 验证集（1k 样本）上求解逆问题的评估**（按原表逐格转录）

| 算法 | 超分辨（4×，线性）LPIPS↓ | 超分辨 PSNR↑ | 相位恢复（非线性）LPIPS↓ | 相位恢复 PSNR↑ | 量化感知（非线性）LPIPS↓ | 量化感知 PSNR↑ | 每样本时间 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DPnP-DDIM（本文） | 0.416 | 21.6 | 0.562 | 13.4 | 0.363 | 23.0 | ∼240 s |
| DPS [CKM+23] | 0.473 | 20.2 | 0.677 | 13.4 | 0.542 | 18.7 | ∼150 s |
| LGD-MC（n=5）[SZY+23] | 0.416 | 20.9 | 0.592 | 12.8 | 0.384 | 22.3 | ∼150 s |
| ReSample（基于像素）[SKZ+23] | 0.464 | 20.1 | – | – | 0.414 | 19.8 | ∼180 s |

**表 5　超分辨（4×）的不同算法样本**（图像对照表，无数字）

| Input | DPS | LGD-MC | ReSample | DPnP-DDPM | DPnP-DDIM | Ground truth |
| --- | --- | --- | --- | --- | --- | --- |

**表 6　不同算法的 NFE 数目**（按原表逐格转录）

| 算法 | DPnP-DDIM | DPnP-DDPM | DPS | LGD-MC | ReSample |
| --- | --- | --- | --- | --- | --- |
| NFEs | ∼1500 | ∼3000 | 1000 | 1000 | 1000 |

**表 7　FFHQ 256×256 验证集（1k 样本）上求解逆问题的 FID 与 SSIM**（按原表逐格转录）

| 算法 | 超分辨 FID↓ | 超分辨 SSIM↑ | 相位恢复 FID↓ | 相位恢复 SSIM↑ | 量化感知 FID↓ | 量化感知 SSIM↑ |
| --- | --- | --- | --- | --- | --- | --- |
| DPnP-DDIM（本文） | 36.3 | 0.668 | 46.5 | 0.631 | 37.3 | 0.712 |
| DPS [CKM+23] | 38.6 | 0.636 | 52.0 | 0.494 | 42.1 | 0.601 |
| LGD-MC（n=5）[SZY+23] | 36.8 | 0.651 | 82.3 | 0.414 | 40.3 | 0.639 |
| ReSample（基于像素）[SKZ+23] | 40.2 | 0.641 | – | – | 40.0 | 0.657 |

**表 8　ImageNet 256×256 验证集（1k 样本）上求解逆问题的 FID 与 SSIM**（按原表逐格转录）

| 算法 | 超分辨 FID↓ | 超分辨 SSIM↑ | 相位恢复 FID↓ | 相位恢复 SSIM↑ | 量化感知 FID↓ | 量化感知 SSIM↑ |
| --- | --- | --- | --- | --- | --- | --- |
| DPnP-DDIM（本文） | 47.5 | 0.510 | 73.5 | 0.289 | 43.2 | 0.623 |
| DPS [CKM+23] | 61.4 | 0.496 | 92.7 | 0.318 | 82.4 | 0.459 |
| LGD-MC（n=5）[SZY+23] | 46.2 | 0.503 | 89.8 | 0.234 | 46.8 | 0.563 |
| ReSample（基于像素）[SKZ+23] | 68.3 | 0.427 | – | – | 53.7 | 0.491 |

## 图注与表注

**图 1**：用扩散即插即用（DPnP）求解线性与非线性逆问题（超分辨（线性）、相位恢复（非线性）、量化感知（非线性））。

**表注**：表 1、2、5 为样本图像对照表（无数值单元格，已按原表列结构转录）；表 3、4、7、8 为定量结果表；表 6 为 NFE 统计；全部表格均按原表逐格转录。

## 参考文献

> 以下按原文参考文献表顺序（字母序标签）编号 [1]—[80] 转录英文原条目，条目文字不翻译；正文引用沿用原文的字母—年份标签（如 [CKM+23]），二者按标签一一对应。表中编号仅为便于站点校验与引用。

[1] [AGS05] L. Ambrosio, N. Gigli, and G. Savaré. Gradient flows: in metric spaces and in the space of probability measures. Springer Science & Business Media, 2005.

[2] [And82] B. D. Anderson. Reverse-time diffusion equation models. Stochastic Processes and their Applications, 12(3):313–326, 1982.

[3] [BB23] C. A. Bouman and G. T. Buzzard. Generative plug and play: Posterior sampling for inverse problems. arXiv preprint arXiv:2306.07233, 2023.

[4] [BCSB18] G. T. Buzzard, S. H. Chan, S. Sreehari, and C. A. Bouman. Plug-and-play unplugged: Optimization-free reconstruction using consensus equilibrium. SIAM Journal on Imaging Sciences, 11(3):2001–2020, 2018.

[5] [BDBDD24] J. Benton, V. De Bortoli, A. Doucet, and G. Deligiannidis. Nearly d-linear convergence bounds for diffusion models via stochastic localization. In The Twelfth International Conference on Learning Representations, 2024.

[6] [BJPD17] A. Bora, A. Jalal, E. Price, and A. G. Dimakis. Compressed sensing using generative models. In International conference on machine learning, pages 537–546. PMLR, 2017.

[7] [Bou23a] N. Bourbaki. Théories spectrales Chapitres 1 et 2. Springer, 2023.

[8] [Bou23b] N. Bourbaki. Théories spectrales: Chapitres 3 à 5. Springer Nature, 2023.

[9] [CCL+22] S. Chen, S. Chewi, J. Li, Y. Li, A. Salim, and A. R. Zhang. Sampling is as easy as learning the score: theory for diffusion models with minimal data assumptions. arXiv preprint arXiv:2209.11215, 2022.

[10] [CCL+23] S. Chen, S. Chewi, H. Lee, Y. Li, J. Lu, and A. Salim. The probability flow ODE is provably fast. Neural Information Processing Systems, 2023.

[11] [CDC23] F. Coeurdoux, N. Dobigeon, and P. Chainais. Plug-and-play split Gibbs sampler: embedding deep generative priors in Bayesian inference. arXiv preprint arXiv:2304.11134, 2023.

[12] [CDD23] S. Chen, G. Daras, and A. Dimakis. Restoration-degradation beyond linear diffusions: A non-asymptotic analysis for DDIM-type samplers. In International Conference on Machine Learning, pages 4462–4484, 2023.

[13] [CICM23] G. Cardoso, Y. J. E. Idrissi, S. L. Corff, and E. Moulines. Monte carlo guided diffusion for Bayesian linear inverse problems. arXiv preprint arXiv:2308.07983, 2023.

[14] [CKM+23] H. Chung, J. Kim, M. T. Mccann, M. L. Klasky, and J. C. Ye. Diffusion posterior sampling for general noisy inverse problems. In International Conference on Learning Representations, 2023.

[15] [CLA+21] S. Chewi, C. Lu, K. Ahn, X. Cheng, T. Le Gouic, and P. Rigollet. Optimal dimension dependence of the metropolis-adjusted langevin algorithm. In Conference on Learning Theory, pages 1260–1300. PMLR, 2021.

[16] [CLL23] H. Chen, H. Lee, and J. Lu. Improved analysis of score-based generative modeling: User-friendly bounds under minimal smoothness assumptions. In International Conference on Machine Learning, pages 4735–4763, 2023.

[17] [CLS15] E. J. Candes, X. Li, and M. Soltanolkotabi. Phase retrieval via Wirtinger flow: Theory and algorithms. IEEE Transactions on Information Theory, 61(4):1985–2007, 2015.

[18] [CLY23] H. Chung, S. Lee, and J. C. Ye. Fast diffusion sampler for inverse problems by geometric decomposition. arXiv preprint arXiv:2303.05754, 2023.

[19] [CR12] E. Candes and B. Recht. Exact matrix completion via convex optimization. Communications of the ACM, 55(6):111–119, 2012.

[20] [Don06] D. L. Donoho. Compressed sensing. IEEE Transactions on Information Theory, 52(4):1289–1306, 2006.

[21] [Doo42] J. L. Doob. The Brownian movement and stochastic equations. Annals of Mathematics, 43(2):351–369, 1942.

[22] [Dru17] D. Drusvyatskiy. The proximal point method revisited. arXiv preprint arXiv:1712.06038, 2017.

[23] [DS24] Z. Dou and Y. Song. Diffusion posterior sampling for linear inverse problem solving: A filtering perspective. In International Conference on Learning Representations, 2024.

[24] [Efr11] B. Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106(496):1602–1614, 2011.

[25] [Eva12] L. C. Evans. An introduction to stochastic differential equations, volume 82. American Mathematical Soc., 2012.

[26] [FBS24] Z. Fang, S. Buchanan, and J. Sulam. What's in a prior? Learned proximal networks for inverse problems. In The Twelfth International Conference on Learning Representations, 2024.

[27] [FSR+23] B. T. Feng, J. Smith, M. Rubinstein, H. Chang, K. L. Bouman, and W. T. Freeman. Score-based diffusion models as principled priors for inverse imaging. In 2023 IEEE/CVF International Conference on Computer Vision (ICCV), pages 10486–10497, 2023.

[28] [GJP+24] S. Gupta, A. Jalal, A. Parulekar, E. Price, and Z. Xun. Diffusion posterior sampling is computationally intractable. arXiv preprint arXiv:2402.12727, 2024.

[29] [GL10] K. Gregor and Y. LeCun. Learning fast approximations of sparse coding. In Proceedings of the 27th international conference on international conference on machine learning, pages 399–406, 2010.

[30] [GMJS22] A. Graikos, N. Malkin, N. Jojic, and D. Samaras. Diffusion models as plug-and-play priors. Advances in Neural Information Processing Systems, 35:14715–14728, 2022.

[31] [HJA20] J. Ho, A. Jain, and P. Abbeel. Denoising diffusion probabilistic models. Advances in Neural Information Processing Systems, 33:6840–6851, 2020.

[32] [HSMC17] J. Huang, M. Sun, J. Ma, and Y. Chi. Super-resolution image reconstruction for high-density three-dimensional single-molecule microscopy. IEEE Transactions on Computational Imaging, 3(4):763–773, 2017.

[33] [Hyv05] A. Hyvärinen. Estimation of non-normalized statistical models by score matching. Journal of Machine Learning Research, 6(4), 2005.

[34] [KEES22] B. Kawar, M. Elad, S. Ermon, and J. Song. Denoising diffusion restoration models. Advances in Neural Information Processing Systems, 35:23593–23606, 2022.

[35] [Key81] R. Keys. Cubic convolution interpolation for digital image processing. IEEE transactions on acoustics, speech, and signal processing, 29(6):1153–1160, 1981.

[36] [KHR23] F. Koehler, A. Heckett, and A. Risteski. Statistical efficiency of score matching: The view from isoperimetry. International Conference on Learning Representations, 2023.

[37] [KLA19] T. Karras, S. Laine, and T. Aila. A style-based generator architecture for generative adversarial networks. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 4401–4410, 2019.

[38] [KVE21] B. Kawar, G. Vaksman, and M. Elad. Stochastic image denoising by sampling from the posterior distribution. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 1866–1875, 2021.

[39] [LBA+22] R. Laumont, V. D. Bortoli, A. Almansa, J. Delon, A. Durmus, and M. Pereyra. Bayesian imaging using plug & play priors: when Langevin meets Tweedie. SIAM Journal on Imaging Sciences, 15(2):701–737, 2022.

[40] [LDP07] M. Lustig, D. Donoho, and J. M. Pauly. Sparse MRI: The application of compressed sensing for rapid MR imaging. Magnetic Resonance in Medicine, 58(6):1182–1195, 2007.

[41] [LHE+24] G. Li, Y. Huang, T. Efimov, Y. Wei, Y. Chi, and Y. Chen. Accelerating convergence of score-based diffusion models, provably. arXiv preprint arXiv:2403.03852, 2024.

[42] [LHW24] G. Li, Z. Huang, and Y. Wei. Towards a mathematical theory for consistency training in diffusion models. arXiv preprint arXiv:2402.07802, 2024.

[43] [LST21] Y. T. Lee, R. Shen, and K. Tian. Structured logconcave sampling with a restricted Gaussian oracle. In Conference on Learning Theory, pages 2993–3050. PMLR, 2021.

[44] [LWCC23] G. Li, Y. Wei, Y. Chen, and Y. Chi. Towards faster non-asymptotic convergence for diffusion-based generative models. arXiv preprint arXiv:2306.09251, 2023.

[45] [LZB+22] C. Lu, Y. Zhou, F. Bao, J. Chen, C. Li, and J. Zhu. DPM-Solver: A fast ODE solver for diffusion probabilistic model sampling in around 10 steps. Advances in Neural Information Processing Systems, 35:5775–5787, 2022.

[46] [MLE21] V. Monga, Y. Li, and Y. C. Eldar. Algorithm unrolling: Interpretable, efficient deep learning for signal and image processing. IEEE Signal Processing Magazine, 38(2):18–44, 2021.

[47] [MSKV24] M. Mardani, J. Song, J. Kautz, and A. Vahdat. A variational perspective on solving inverse problems with diffusion models. In The Twelfth International Conference on Learning Representations, 2024.

[48] [MV19] O. Mangoubi and N. K. Vishnoi. Nonconvex sampling with the metropolis-adjusted langevin algorithm. In Conference on learning theory, pages 2259–2293. PMLR, 2019.

[49] [PEPC10] L. C. Potter, E. Ertin, J. T. Parker, and M. Cetin. Sparsity and compressed sensing in radar imaging. Proceedings of the IEEE, 98(6):1006–1020, 2010.

[50] [PRS+24] C. Pabbaraju, D. Rohatgi, A. P. Sevekari, H. Lee, A. Moitra, and A. Risteski. Provable benefits of score matching. Advances in Neural Information Processing Systems, 36, 2024.

[51] [PW24] Y. Polyanskiy and Y. Wu. Information theory: From coding to learning. Cambridge university press, 2024.

[52] [RBL+22] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer. High-resolution image synthesis with latent diffusion models. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 10684–10695, 2022.

[53] [RDN+22] A. Ramesh, P. Dhariwal, A. Nichol, C. Chu, and M. Chen. Hierarchical text-conditional image generation with CLIP latents. arXiv preprint arXiv:2204.06125, 2022.

[54] [RDS+15] O. Russakovsky, J. Deng, H. Su, J. Krause, S. Satheesh, S. Ma, Z. Huang, A. Karpathy, A. Khosla, M. Bernstein, A. C. Berg, and L. Fei-Fei. ImageNet Large Scale Visual Recognition Challenge. International Journal of Computer Vision (IJCV), 115(3):211–252, 2015.

[55] [REM17] Y. Romano, M. Elad, and P. Milanfar. The little engine that could: Regularization by denoising (RED). SIAM Journal on Imaging Sciences, 10(4):1804–1844, 2017.

[56] [RR98] G. O. Roberts and J. S. Rosenthal. Optimal scaling of discrete approximations to Langevin diffusions. Journal of the Royal Statistical Society: Series B (Statistical Methodology), 60(1):255–268, 1998.

[57] [RS18] E. T. Reehorst and P. Schniter. Regularization by denoising: Clarifications and new interpretations. IEEE transactions on computational imaging, 5(1):52–67, 2018.

[58] [SC97] L. Saloff-Coste. Lectures on finite Markov chains, pages 301–413. Springer Berlin Heidelberg, 1997.

[59] [Sch12] H. Schaefer. Banach Lattices and Positive Operators, volume 215. Springer Science & Business Media, 2012.

[60] [SCS+22] C. Saharia, W. Chan, S. Saxena, L. Li, J. Whang, E. L. Denton, K. Ghasemipour, R. Gontijo Lopes, B. Karagol Ayan, T. Salimans, et al. Photorealistic text-to-image diffusion models with deep language understanding. Advances in Neural Information Processing Systems, 35:36479–36494, 2022.

[61] [SDWMG15] J. Sohl-Dickstein, E. Weiss, N. Maheswaranathan, and S. Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In International Conference on Machine Learning, pages 2256–2265, 2015.

[62] [SE19] Y. Song and S. Ermon. Generative modeling by estimating gradients of the data distribution. Advances in Neural Information Processing Systems, 32, 2019.

[63] [SEC+15] Y. Shechtman, Y. C. Eldar, O. Cohen, H. N. Chapman, J. Miao, and M. Segev. Phase retrieval with application to optical imaging: a contemporary overview. IEEE signal processing magazine, 32(3):87–109, 2015.

[64] [SKZ+23] B. Song, S. M. Kwon, Z. Zhang, X. Hu, Q. Qu, and L. Shen. Solving inverse problems with latent diffusion models via hard data consistency. arXiv preprint arXiv:2307.08123, 2023.

[65] [SME20] J. Song, C. Meng, and S. Ermon. Denoising diffusion implicit models. In International Conference on Learning Representations, 2020.

[66] [SSDK+21] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole. Score-based generative modeling through stochastic differential equations. International Conference on Learning Representations, 2021.

[67] [SSXE21] Y. Song, L. Shen, L. Xing, and S. Ermon. Solving inverse problems in medical imaging with score-based generative models. In International Conference on Learning Representations, 2021.

[68] [SVMK22] J. Song, A. Vahdat, M. Mardani, and J. Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2022.

[69] [SWC+23] Y. Sun, Z. Wu, Y. Chen, B. T. Feng, and K. L. Bouman. Provable probabilistic imaging using score-based generative priors. arXiv preprint arXiv:2310.10835, 2023.

[70] [SZY+23] J. Song, Q. Zhang, H. Yin, M. Mardani, M.-Y. Liu, J. Kautz, Y. Chen, and A. Vahdat. Loss-guided diffusion models for plug-and-play controllable generation. In International Conference on Machine Learning, pages 32483–32498. PMLR, 2023.

[71] [Tie94] L. Tierney. Markov chains for exploring posterior distributions. The Annals of Statistics, 22(4):1701–1728, 1994.

[72] [TYT+22] B. L. Trippe, J. Yim, D. Tischer, D. Baker, T. Broderick, R. Barzilay, and T. Jaakkola. Diffusion probabilistic modeling of protein backbones in 3d for the motif-scaffolding problem. arXiv preprint arXiv:2206.04119, 2022.

[73] [TZ24] W. Tang and H. Zhao. Contractive diffusion probabilistic models. arXiv preprint arXiv:2401.13115, 2024.

[74] [UVL18] D. Ulyanov, A. Vedaldi, and V. Lempitsky. Deep image prior. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 9446–9454, 2018.

[75] [VBW13] S. V. Venkatakrishnan, C. A. Bouman, and B. Wohlberg. Plug-and-play priors for model based reconstruction. In IEEE Global Conference on Signal and Information Processing, pages 945–948. IEEE, 2013.

[76] [VDC19] M. Vono, N. Dobigeon, and P. Chainais. Split-and-augmented Gibbs sampler – application to large-scale inference problems. IEEE Transactions on Signal Processing, 67(6):1648–1661, 2019.

[77] [Vin11] P. Vincent. A connection between score matching and denoising autoencoders. Neural computation, 23(7):1661–1674, 2011.

[78] [Wib18] A. Wibisono. Sampling as optimization in the space of measures: The Langevin dynamics as a composite optimization problem. In Conference on Learning Theory, pages 2093–3027. PMLR, 2018.

[79] [WTN+23] L. Wu, B. Trippe, C. Naesseth, D. Blei, and J. P. Cunningham. Practical and asymptotically exact conditional sampling in diffusion models. Advances in Neural Information Processing Systems, 36, 2023.

[80] [ZC22] Q. Zhang and Y. Chen. Fast sampling of diffusion models with exponential integrator. In The Eleventh International Conference on Learning Representations, 2022.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；第 1 节引言（含 1.1 三条贡献，图 1）；第 2 节基于分数的生成模型（2.1 前向过程与分数函数，式（1）—（4）；2.2 反向过程与采样，式（5）—（9），含时间反转 SDE、概率流 ODE、DDPM/DDIM 型采样器）；第 3 节基于扩散即插即用的后验采样（式（10）—（11）、假设 1；3.1 白高斯去噪后验采样、引理 1—2、式（12）—（22）；算法 1（DPnP）；3.2 算法细节与线性前向模型下的闭式 PCS）；第 4 节理论分析（定理 1 渐近一致性；定理 2 非渐近鲁棒性，式（24）—（25））；第 5 节数值实验（表 1—4、图 1）；第 6 节讨论与致谢；附录 A（相关工作）、B（离散时间表述，式（26）—（30））、C（算法 2—4）、D（引理 1、2 的证明）、E（指数积分器离散化）、F（主要定理证明）、G（附加数值结果与表 5—8）、H（消融与退火调度）；表 1—8（逐格/列结构）；图 1 图注；参考文献 [1]—[80] 英文原条目。未完成/未包含：①逐句逐式与 PDF 的终校未做（页尾标注 qa_complete=false）；②图 1 图像本体未复制（站点不上传图片），仅中文图注；③表 1、2、5 为样本图像对照表（无数值单元格），已按原表列结构转录并加注；④附录 A 的相关工作按主题段落翻译；附录 D/F 的证明按原文推导结构与关键公式翻译，未逐行复现所有中间代数；⑤**正文引用沿用原文的字母—年份标签（如 [CKM+23]），参考文献表为便于站点校验加了 [1]—[80] 数字前缀，二者按标签一一对应**；⑥NeurIPS 论文检查清单等元数据未逐项录入；⑦**再传播许可待核验**，本页仅学习用途、不计入可公开全文统计（页首与状态段已保留说明）。**qa_complete=false。**
