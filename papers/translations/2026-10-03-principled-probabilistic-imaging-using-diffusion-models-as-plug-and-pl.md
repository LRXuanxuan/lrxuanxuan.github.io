---
layout: page
title: "以扩散模型作为即插即用先验的原则性概率成像｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-03-principled-probabilistic-imaging-using-diffusion-models-as-plug-and-pl/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/f282c3fff422b44d/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 以扩散模型作为即插即用先验的原则性概率成像

**原题：** Principled Probabilistic Imaging using Diffusion Models as Plug-and-Play Priors  
**作者：** Zihui Wu、Yu Sun、Yifan Chen、Bingliang Zhang、Yisong Yue、Katherine L. Bouman（加州理工学院计算与数学科学系/电气工程系/天文学系、约翰霍普金斯大学、纽约大学 Courant 数学科学研究所）  
**版本：** 会议论文集版本（NeurIPS-2024-principled-probabilistic-imaging-using-diffusion-models-as-plug-and-play-priors-Paper-Conference.pdf），本地 PDF 39 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–5 节（含 2、3.1–3.4、4.1–4.3 全部小节）、结论与局限性/影响说明、致谢、附录 A–G（含 A.1–A.3、B、C.1–C.3、D、E、F.1–F.5、G）、NeurIPS 论文清单（15 项）、图 1–11 图注、表 1–5 逐格、算法 1–3、参考文献 [1]–[84]（英文原条目）按原文结构录入；逐句逐式终校未做。

> **许可与使用说明（保持原文说明不变）：** 本页为 NeurIPS 2024 会议论文集版本的**中文学习译稿**；原文版权归属会议与作者，**再传播许可待核验**，故本页**仅作学习用途，不计入可公开全文的统计口径**。原文无独立许可章节，附录 G 列出本文所用既有资产的许可证（详见附录 G 译文）。

## 摘要

扩散模型（diffusion model，DM）近期在建模复杂图像分布方面表现卓越，已成为求解贝叶斯逆问题的强表达力图像先验。然而现有大多数基于 DM 的方法依赖生成过程中的近似以适配不同逆问题，导致采样分布不准确、偏离贝叶斯框架所定义的目标后验。为在避免此类近似的同时利用 DM 的生成能力，我们提出一种马尔可夫链蒙特卡洛（Markov chain Monte Carlo，MCMC）算法：它把一般逆问题的后验采样**归约**为高斯去噪问题的后验采样。关键在于，我们采用一种通用的 DM 表述作为**统一接口**，从而可用多种最先进 DM 严格求解该去噪问题。我们在六个逆问题（三个线性、三个非线性）上验证了所提方法的有效性，包括一个真实黑洞成像问题。实验结果表明，与现有基于 DM 的成像逆问题方法相比，所提方法给出更准确的重建与后验估计。

## 1 引言

逆问题出现在许多计算成像应用中，其目标是从稀疏含噪测量 $y\in\mathbb R^m$ 恢复图像 $x\in\mathbb R^n$，二者关系可写为

$$
y=A(x)+n, \tag{1}
$$

其中 $A(\cdot):\mathbb R^n\to\mathbb R^m$ 为（线性或非线性）前向算子，$n$ 为 $\mathbb R^m$ 中的随机测量噪声。由于 $y$ 的稀疏性与噪声常导致 $x$ 存在显著不确定性，基于某先验分布 $p(x)$ 对全部可能解的后验分布 $p(x\mid y)$ 采样，通常优于求单一确定性解。传统后验采样方法往往依赖过于简单的图像先验，无法反映真实图像分布的复杂性；另一方面，扩散模型近年已成为建模高度复杂图像分布的有力工具 [33, 63]。然而如何把 DM 变成可靠的成像逆问题求解器仍是挑战，这促使我们发展一种原则性贝叶斯方法，把 DM 用作后验采样的先验。

扩散模型通过反转从目标分布到简单（通常高斯）分布的扩散过程来生成样本 [33, 63]：它从噪声图像 $x_T$ 出发，逐步去噪得到干净图像 $x_0$，其中 $x_t\sim p_t$ 为时间 $t\in[0,T]$ 的中间含噪图像。反转扩散需要估计沿扩散过程的时间变化对数密度梯度（分数函数）$\nabla\log p_t(x_t)$，在采样后验 $p(x\mid y)$ 时则为 $\nabla\log p_t(x_t\mid y)$。

为设计通用的基于 DM 的逆问题求解器，现有方法大多试图近似时间变化的对数密度梯度 $\nabla\log p_t(x_t\mid y)$ [17, 73, 84, 62, 39, 58, 60, 44, 15, 77, 18, 55, 8]。具体地，它们先用 Bayes 法则把前向算子与中间含噪图像 $x_t$ 上的无条件先验分离：

$$
\nabla\log p_t(x_t\mid y)=\nabla\log p_t(y\mid x_t)+\nabla\log p_t(x_t). \tag{2}
$$

若转而估计右端，就可利用已有预训练 DM 计算无条件项 $\nabla\log p_t(x_t)$；但此情形的主要困难是 $\nabla\log p_t(y\mid x_t)$ 一般不可处理，因为 $p_t(y\mid x_t)$ 涉及对全部可能产生 $x_t$ 的 $x_0$ 的积分 [17]。为绕开该不可处理性，已有方法大致分两类。一类通过简化假设显式近似 $\nabla\log p_t(y\mid x_t)$ [62, 17, 60, 8]；但即便近期工作 [8] 给出（可说是）迄今最好的近似，它也只在先验分布 $p(x)$ 为高斯时精确；对非高斯的一般先验，这些方法并不采样真实后验 $p(x\mid y)$。另一类不作显式近似，而用经验设计的更新把 $\nabla\log p_t(y\mid x_t)$ 替换为以 $y$ 为引导信号的项 [73, 84, 39, 58, 44, 15, 77, 18, 55]；尽管这类方法可能有很强的经验表现，它们已偏离贝叶斯表述，不再以采样目标后验为目的。总之，这些现有基于 DM 的逆问题方法最好被视为**引导方法**：生成过程被引导到测量 $y$ 更可能被观测到的区域，而非后验采样方法 [8]。我们还注意到近期有工作考虑把 DM 与序列蒙特卡洛结合以保证后验采样的渐近一致性 [11, 23]，但研究仅限于线性成像逆问题。

**我们的贡献。** 本文走另一条路：提出新的 MCMC 算法 **Plug-and-Play Diffusion Models（PnP-DM）**，以原则性方式纳入 DM，并绕开式 (2) 途径所需的近似。该算法基于 Split Gibbs 采样器（Split Gibbs Sampler，SGS）[71]，在分别涉及似然与先验的两个采样步之间交替。似然步可用传统采样技术处理，而先验步涉及一个需要仔细设计的**贝叶斯去噪问题**。重要的是，我们发现该贝叶斯去噪问题与 [37] 所给一般 DM 表述（下文称 **EDM 表述**）下的无条件图像生成问题之间存在联系。该联系使我们能在不近似生成过程的情况下用 DM 严格地做去噪后验采样，并可通过统一的 EDM 表述使用广泛的预训练 DM。我们通过以平均 Fisher 信息建立平稳性保证，分析 PnP-DM 的非渐近行为；并通过三个线性与三个非线性含噪逆问题（含一个使用真实数据、既非线性又严重病态的黑洞干涉成像问题，见图 1）展示其强经验性能。总体上，PnP-DM 优于现有基线，取得更高的后验估计精度。

## 2 预备知识

Split Gibbs 采样器（SGS）是为贝叶斯推断发展的 MCMC 方法 [71]，与近端采样器（Proximal Sampler）[42, 14, 25, 79] 相关，并是计算成像中生成式即插即用（Generative Plug-and-Play，GPnP）[6] 与扩散即插即用（Diffusion Plug-and-Play，DPnP）[78] 框架的骨架。SGS 的目标是采样后验分布

$$
p(x\mid y)\propto p(y\mid x)p(x)=\exp\left(-f(x;y)-g(x)\right), \tag{3}
$$

其中 $f(x;y):=-\log p(y\mid x)$ 与 $g(x):=-\log p(x)$ 分别为似然与先验分布的势函数。式 (3) 同时依赖似然与先验，使直接采样一般很困难。SGS 转而利用后验分布的复合结构，采用变量分裂策略，考虑采样替代分布

$$
\pi(x,z)\propto\exp\left(-f(z;y)-g(x)-\frac{1}{2\rho^2}\|x-z\|_2^2\right), \tag{4}
$$

其中 $z\in\mathbb R^n$ 为增广变量，$\rho>0$ 为控制 $x$ 与 $z$ 耦合强度的超参数。记 (4) 的 $x$-与 $z$-边缘分布分别为 $\pi_X(x):=\int\pi(x,z)\,dz$ 与 $\pi_Z(x):=\int\pi(x,z)\,dx$。当 $\rho\to0$ 时，$\pi_X$ 以全变差距离收敛到目标后验 $p(x\mid y)$ [71]，故可通过采样 (4) 获得目标后验的近似样本。

SGS 用 Gibbs 采样对 (4) 采样：从初始化 $x^{(0)}$ 出发，对迭代 $k=0,\ldots,K-1$ 交替执行

1. **似然步：** 采样 $z^{(k)}\sim\pi_{Z\mid X=x^{(k)}}(z)\propto\exp\left(-f(z;y)-\frac{1}{2\rho^2}\|x^{(k)}-z\|_2^2\right)$；
2. **先验步：** 采样 $x^{(k+1)}\sim\pi_{X\mid Z=z^{(k)}}(x)\propto\exp\left(-g(x)-\frac{1}{2\rho^2}\|x-z^{(k)}\|_2^2\right)$。

注意两个条件分布分别只涉及 $f(\cdot;y)$ 与 $g(\cdot)$，似然与先验被解耦，因而两步可模块化设计。类似的变量分裂策略也见于 Half-Quadratic Splitting（HQS）[31] 与交替方向乘子法（ADMM）[30, 7] 等优化方法；事实上 SGS 可视为 HQS 的采样类比。只要两个采样步被严格实现，SGS 就是后验采样的原则性方法。

**与 SGS 相关的已有工作。** 若干工作基于 SGS 设计成像逆问题算法 [53, 19, 6, 27, 78]，差别主要在先验步的处理方式。例如 [53, 6, 27] 用基于 Langevin 的更新采样 $\pi_{X\mid Z=z}$，先验信息由传统正则项或现成图像去噪器编码；[19] 通过启发式改造扩散模型（即 DDPM [33]）来处理先验步；同期工作 [78] 设计两个扩散过程以严格求解先验步。我们的方法与 [78] 的不同在于把先验步与 EDM 表述 [37] 联系起来：该联系使我们能通过统一接口把最先进 DM 无缝纳入为贝叶斯推断的强表达力图像先验，无需为每个模型额外定制，并带来更好的经验性能。我们也注意到近期 [43] 采用 HQS 的基于优化的变量分裂表述并利用一般 DM 作为图像先验；本文则从贝叶斯后验采样角度考虑 SGS 表述。此外，虽基于 SGS 的方法在理论上适用于一般逆问题，文献中关于真实非线性逆问题的经验证据仍然稀少；本文在三个非线性逆问题（含黑洞成像）上演示了方法。相关工作的更全面综述见附录 E。

## 3 方法

所提方法的示意图见图 2。我们把方法称为 **PnP-DM**，它建立在 SGS 框架之上，严格实现两个采样步，并对耦合参数 $\rho$ 采用退火调度。下面先给出第一步（同时适用于线性与非线性逆问题）的实现。

### 3.1 似然步：施加数据一致性

第 $k$ 次迭代的似然步为采样

$$
z^{(k)}\sim\pi_{Z\mid X=x^{(k)}}(z)\propto\exp\left(-f(z;y)-\frac{1}{2\rho^2}\|x^{(k)}-z\|_2^2\right). \tag{5}
$$

**线性前向模型与高斯噪声。** 先考虑简单但常见的情形：前向模型 $A$ 为线性、噪声为零均值高斯，即 $A:=A\in\mathbb R^{m\times n}$、$n\sim\mathcal N(0,\Sigma)$。此时似然势函数为 $f(x;y)=\frac12\|y-Ax\|_\Sigma^2$（忽略与 $x,y$ 无关的加性常数），其中 $\|\cdot\|_\Sigma^2:=\langle\cdot,\Sigma^{-1}\cdot\rangle$。可直接证明

$$
\pi_{Z\mid X=x}=\mathcal N\left(m(x),\Lambda^{-1}\right),\qquad \Lambda:=A^\top\Sigma^{-1}A+\frac{1}{\rho^2}I,\quad m(x):=\Lambda^{-1}\left(A^\top\Sigma^{-1}y+\frac{1}{\rho^2}x\right).
$$

从高斯分布采样的方法已有系统研究 [72]，更详细讨论见附录 C.1（含基于 SVD 与 Cholesky 分解的高效采样）。

**一般情形。** 对一般非线性逆问题，似然步不再是高斯采样。但由于 $\pi_{Z\mid X=x}$ 在相差乘性常数的意义下有闭式，只要似然势可微，就可用基于 Langevin 动力学的蒙特卡洛方法采样。具体地，先建立以 $\pi_{Z\mid X=x}$ 为平稳分布的 Langevin 随机微分方程

$$
dz_t=\nabla\log\pi_{Z\mid X=x}(z_t)\,dt+\sqrt{2}\,dw_t=\left[-\nabla f(z;y)-\frac{1}{\rho^2}(z-x)\right]dt+\sqrt{2}\,dw_t,
$$

再以 $z_0=x$ 初始化并用 Euler 离散化求解。伪代码见附录 C.1 的算法 2。

### 3.2 先验步：经 EDM 框架去噪

第 $k$ 次迭代的先验步为采样

$$
x^{(k+1)}\sim\pi_{X\mid Z=z^{(k)}}(x)\propto\exp\left(-g(x)-\frac{1}{2\rho^2}\|x-z^{(k)}\|_2^2\right). \tag{6}
$$

细看 (6) 可见，该先验步本质上是为**高斯去噪问题**抽取后验样本：其"测量"为 $z^{(k)}$，噪声水平为 $\rho$，先验分布为 $p(x)\propto\exp(-g(x))$。

我们在 SGS 内用 DM 作为图像先验来处理该去噪后验采样问题。具体地，利用 EDM 框架 [37]——它最初为统一各种 DM 表述下的无条件图像生成而提出。为看出 EDM 与 (6) 的联系，考虑由向先验分布 $p(x)$ 加入标准差为 $\sigma$ 的独立同分布高斯噪声所得的一族平滑分布 $p(x;\sigma)$，即 $x+\sigma\epsilon\sim p(x;\sigma)$。EDM 框架的核心思想是：多种最先进 DM 可统一为如下反向 SDE：

$$
dx_t=\left[\frac{\dot s(t)}{s(t)}x_t-2s(t)^2\dot\sigma(t)\sigma(t)\nabla\log p\left(\frac{x_t}{s(t)};\sigma(t)\right)\right]dt+s(t)\sqrt{2\dot\sigma(t)\sigma(t)}\,d\bar w_t, \tag{7}
$$

其中 $\bar w_t$ 为反向时间运行的 $n$ 维 Wiener 过程，$\sigma(t)>0$ 为预定义噪声水平调度（$\sigma(0)=0$），$s(t)$ 为预定义缩放调度，$\dot\sigma(t)$、$\dot s(t)$ 为其时间导数。如 [37] 所示，(7) 的定义性质是：对任意时间 $t$ 有 $x_t/s(t)\sim p(x;\sigma(t))$。因此沿时间反向求解该 SDE，即可从任意噪声水平 $\sigma(t)$ 行进到 $t=0$ 的干净图像分布。这意味着只要 $\rho$ 落在 $\sigma(t)$ 的取值范围内，就可用 (7) 求解任意噪声水平 $\rho$ 下的 (6)。事实上，给定 $x_t$ 时 $x_0$ 的分布为

$$
p(x_0\mid x_t)\propto p(x_t\mid x_0)p(x_0)\propto\mathcal N\left(s(t)x_0,s(t)^2\sigma(t)^2I\right)\exp(-g(x_0))\propto\exp\left(-g(x_0)-\frac{1}{2\sigma(t)^2}\left\|x_0-\frac{x_t}{s(t)}\right\|_2^2\right).
$$

当 $x_t=s(t)z^{(k)}$、$\sigma(t)=\rho$ 时，最后一行**恰好**与 (6) 一致。因此可自然设计实用算法：按如下三步采样 (6)：(1) 找到使 $\sigma(t^*)=\rho$ 的 $t^*$；(2) 在 $x_{t^*}=s(t^*)z^{(k)}$ 处初始化；(3) 选择合适的离散时间步与积分格式，从 $t^*$ 反向求解 (7) 至 0。通过这一统一接口，任何转换为 EDM 表述的 DM 都可直接变成 (6) 的严格求解器。

借助与 EDM 的联系，我们的先验步实现具有很大设计空间，涵盖 DDPM（或 VP-SDE）[33]、VE-SDE [63]、iDDPM [52] 等多种现有 DM。实验中我们在该框架下用所有这些模型做后验采样，均给出高质量样本。实现伪代码与先验步 EDM 表述的更多细节见附录 C.2。

### 3.3 汇总

PnP-DM 的完整伪代码见算法 1。PnP-DM 以耦合参数退火调度 $\{\rho_k\}$ 在两个采样步之间交替。我们发现 $\rho$ 的退火调度可加速马尔可夫链的混合时间，并防止算法在高度病态逆问题上陷入不良局部极小。这是基于 Langevin [40, 34, 65] 与基于 SGS [6, 78] 的 MCMC 算法提升经验性能的常见做法。

我们的工作与 PnP-SGS [19] 有相似之处，但有三个关键区别。第一，如实验所示，我们研究三个非线性逆问题，而非线性逆问题超出 [19] 的范围；实验表明 PnP-SGS 难以处理 Fourier 相位恢复等困难非线性逆问题。第二，我们采用 EDM 表述以确保 PnP-DM 的先验步是从所需噪声水平下的图像流形到干净图像流形的严格映射，与 SGS 理论一致；相反，PnP-SGS [19] 的先验步是启发式的（[78] 也指出了这一点），并非严格设计用于采样 (6)。第三，不同于 PnP-SGS [19] 使用常数 $\rho$，我们考虑耦合参数的退火调度 $\{\rho_k\}$，这对高度病态逆问题很重要。

**算法 1　Plug-and-Play Diffusion Models（PnP-DM）**

- **输入：** 初始化 $x_0\in\mathbb R^n$、总迭代次数 $K>0$、耦合强度调度 $\{\rho_k>0\}_{k=0}^{K-1}$、带测量 $y\in\mathbb R^m$ 的似然势 $f(\cdot;y)$、以 $(D_\theta(x;\sigma)-x)/\sigma^2$ 近似 $\nabla\log p(x;\sigma)$ 的预训练模型 $D_\theta(\cdot;\cdot)$。
- 1: **for** $k=0,\ldots,K-1$ **do**
- 2: 　$z^{(k)}\leftarrow\mathrm{LikelihoodStep}(x^{(k)},\rho_k,f(\cdot;y))$ ▷ 第 3.1 节
- 3: 　$x^{(k+1)}\leftarrow\mathrm{PriorStep}(z^{(k)},\rho_k,D_\theta(\cdot;\cdot))$ ▷ 第 3.2 节
- 4: **end for**
- 5: **return** $x^{(k+1)}$

### 3.4 理论洞见

我们给出关于 PnP-DM 非渐近行为的一些理论洞见。先给出定义：对满足 $\mu\ll\tilde\mu$ 的两个概率测度 $\mu$ 与 $\tilde\mu$，$\mu$ 关于 $\tilde\mu$ 的 Kullback–Leibler（KL）散度与 Fisher 信息（Fisher 散度）分别定义为

$$
\mathrm{KL}(\mu\|\tilde\mu):=\int\mu\log\frac{\mu}{\tilde\mu},\qquad\mathrm{FI}(\mu\|\tilde\mu):=\int\mu\left\|\nabla\log\frac{\mu}{\tilde\mu}\right\|_2^2.
$$

两者均当且仅当 $\mu=\tilde\mu$ 时为零。KL 散度是量化一个分布相对另一个分布差异的常用度量；Fisher 信息已被用于分析采样算法的平稳性 [3, 66]。

我们借助为 Langevin 蒙特卡洛引入的插值技术 [68, 3, 66]，以连续时间视角分析 PnP-DM：假设似然步 (5) 可精确实现，先验步 (6) 通过以近似分数函数 $s_t\approx\nabla\log p_t:=\nabla\log p(\cdot;\sigma(t))$ 运行反向扩散过程 (7) 实现。令 $\nu_0^X$ 为初始化 $x^{(0)}$ 的分布，$\nu_k^Z$ 与 $\nu_{k+1}^X$ 分别为第 $k$ 次迭代的 $z^{(k)}$ 与 $x^{(k+1)}$ 的分布；平稳分布为 $\pi^X$ 与 $\pi^Z$。我们的分析关注两个连续时间过程：(1) 从非平稳初始化 $\nu_0^X$ 出发、以近似分数函数 $s_t$ 运行 (7) 到 $\nu_K^X$ 的**非平稳过程**；(2) 在两个平稳分布 $\pi^X$ 与 $\pi^Z$ 之间交替的**平稳过程**。二者分别是 PnP-DM 在非平稳与平稳状态下的插值，定义了跨越离散迭代的连续转移；概念示意见图 3，精确表述见附录 A。现给出主要结果：

**定理 3.1。** 考虑以 $\rho_k\equiv\rho>0$ 与分数估计 $s_t\approx\nabla\log p_t:=\nabla\log p(\cdot;\sigma(t))$ 运行 $K$ 次迭代的 PnP-DM。令 $t^*>0$ 满足 $\sigma(t^*)=\rho$，并令 $\delta:=\inf_{t\in[0,t^*]}v(t)$，其中 $v(t):=s(t)\sqrt{2\dot\sigma(t)\sigma(t)}$。记 $\nu_\tau$ 与 $\pi_\tau$ 分别为非平稳过程与平稳过程在时间 $\tau$ 的分布。则在 $K$ 次迭代上、或在 $\tau\in[0,T]$（$T:=K(t^*+1)$）上，有

$$
\frac{1}{T}\int_0^T\mathrm{FI}(\pi_\tau\|\nu_\tau)\,d\tau\le\underbrace{\frac{4\,\mathrm{KL}(\pi^X\|\nu_0^X)}{K(t^*+1)\min(\rho,\delta)^2}}_{\text{由初始化决定的收敛}}+\underbrace{\frac{4\epsilon_{\mathrm{score}}}{(t^*+1)\delta^2}}_{\text{分数近似误差}}, \tag{8}
$$

其中假设分数估计误差 $\epsilon_{\mathrm{score}}:=\int_{t^*+1}^{1}v(\tau)^2\mathbb E_{\pi_\tau}\|s_\tau-\nabla\log p_\tau\|_2^2\,d\tau<\infty$。

证明见附录 A。该定理表明：在存在分数近似误差的前提下，PnP-DM 在 $K$ 次迭代中非平稳过程相对平稳过程的平均距离（以 Fisher 信息度量）以 $\mathcal O(1/K)$ 的速率趋于零。注意我们的理论只要求在测度 $\pi_\tau$ 下的 $L_2$ 精确分数估计，这弱于涉及分数估计的采样方法分析中常见的 $L_\infty$ 精确假设 [5, 66]。该结果类似 Langevin 蒙特卡洛的一阶平稳性 [3]。与 [78] 的非渐近分析不同，我们使用平均 Fisher 信息而非全变差距离，从而得到显式收敛速率。这里 $\delta$ 是 (7) 中反向扩散的扩散系数下确界，关于 $\delta$ 作用的进一步讨论见附录 A.3。理论表明：两个采样步的精确实现可得到一个可证收敛到在目标平稳分布间交替的平稳过程的采样器。

## 4 实验

### 4.1 用真值后验验证

我们首先在**后验可闭式表达**的高斯先验模拟压缩感知问题上验证 PnP-DM 的后验采样精度。先验的均值与逐像素标准差见图 4 左下。线性前向模型 $A\in\mathbb R^{m\times n}$ 为高斯矩阵（$m=n/2$），即 $A_{ij}\sim\mathcal N(0,1)$。测试图像从先验中随机生成（图 4 左上），测量按 (1) 计算，其中 $n\sim\mathcal N(0,0.01^2I)$。我们与流行的基于 DM 的方法 DPS [17] 比较：各抽 1000 个样本并可视化经验均值与逐像素标准差。与真值后验（第二列）相比，两种方法都能准确估计均值，但 DPS 估计的标准差图像显著偏离真值；相反，我们的标准差图像在绝对幅度与空间分布上都与真值吻合。这些结果凸显：由于采用更原则性的贝叶斯途径，我们的方法比 DPS 更准确。

### 4.2 基准实验

**数据集与逆问题。** 我们在 FFHQ 数据集 [38] 验证集的前 100 张图像上测试所提算法与若干基线，涉及五个逆问题：(1) 高斯去模糊（核 61×61、标准差 3.0）；(2) 运动去模糊（核 61×61、强度 0.5）；(3) 4 倍下采样超分辨；(4) [10, 51] 中的编码衍射图样（coded diffraction patterns，CDP）重建问题（非线性，带相位掩模的相位恢复）；(5) 4 倍过采样的 Fourier 相位恢复（非线性）。我们对全部模拟测量 $y$ 叠加独立同分布高斯噪声，即 $n\sim\mathcal N(0,\sigma_y^2I)$。除 Fourier 相位恢复外所有问题取 $\sigma_y=0.05$；由于 Fourier 相位恢复严重病态，取更小的 $\sigma_y=0.01$。

**基线与比较协议。** 我们考虑四种 DM 变体作为方法的即插即用先验：VP-SDE（VP）[33]、VE-SDE（VE）[63]、iDDPM [52] 与 EDM [37]。比较的基线包括：(1) 基于优化的方法：PnP-ADMM [13]、DPIR [80]；(2) 条件 DM：DDRM [39]、DPS [18]；(3) 基于 SGS 的方法：PnP-SGS [19]、DPnP [78]。为公平比较，所有基于 DM 的方法使用同一预训练分数函数检查点；由于该检查点以 DDPM 表述（VP-SDE）[33] 训练，我们通过施加 VP 预条件 [37] 把它转换为 EDM 表述。定量比较使用峰值信噪比（PSNR）、结构相似度（SSIM）与学习感知图像块相似度（LPIPS）距离。对每种采样方法，我们抽 20 个随机样本、计算其均值，并报告均值图像上的指标。更多实验细节见附录 B、C、D。

**结果：线性问题。** 表 1 给出定量比较。PnP-DM 总体上优于基线，且 VE 与 EDM 变体在这些线性问题上持续优于另外两个变体。图 5 给出运动去模糊的视觉示例（另两个线性问题见附录 F.2），PnP-DM 给出既清晰又与真值图像一致的高质量重建。我们还基于逐像素统计给出不确定性量化（UQ）分析（图 6）：左三列可视化绝对误差 $|\bar x-x|$、标准差（std）与绝对 z 分数 $|\bar x-x|/\mathrm{std}$，第三列红色像素标出真值像素值落在估计后验不确定性下 3σ 置信区间（credible interval，CI）之外的位置；第四列为每像素 $|\bar x-x|$ 与 std 的散点图，红框为 3σ CI 之外的百分比，灰框为 CI 内的百分比。与合成先验实验类似，DPS 往往给出更大的标准差估计（灰点分布更不集中于原点）。与基线（尤其 PnP-SGS）相比，我们的方法覆盖的真值像素比例更高（97.46%，基线为 96.20% 与 88.77%）。若真实后验确为高斯，应有 99% 的真值像素落在 3σ CI 内；但由于基于 DM 先验的后验非高斯，我们并不必期望达到 99% 覆盖。

**结果：非线性问题。** 定量比较见表 2。对 CDP 重建问题，PnP-DM 与 DPS 相当，但优于其他基于 SGS 的方法。随后考虑已知颇具挑战的 Fourier 相位恢复（FPR）问题。其困难之一在于对 180° 旋转不变，故后验分布有两个模态：一个为正立图像，另一个为旋转 180° 图像，二者同样拟合测量。为增加获得正确朝向重建的机会，我们对每个算法用四个不同随机初始化运行并报告最佳一次运行的指标（遵循 [18] 的做法）。我们发现 PnP-DM 在该高度病态逆问题上显著优于基线：如图 7(a)，我们的方法对两个朝向都能给出高保真重建，而基线至少无法捕获其中一个模态。我们还对一张测试图像用 100 个不同随机初始化运行方法，并收集 PSNR 高于 28 dB 的两个朝向的重建（100 次运行中 90 次）；两种朝向的百分比如图 7(b) 饼图所示：在以正立人脸图像为先验时，我们的方法主要生成正立朝向的样本，但也能找到同样似然的另一模态，体现其捕获多模态后验分布的能力。

### 4.3 黑洞成像实验

**问题设置。** 最后我们在真实世界的非线性成像逆问题——黑洞成像（black hole imaging，BHI）上验证 PnP-DM（细节见附录 B），视觉示意见图 8(a)。该 BHI 逆问题严重病态：即便使用地球尺度望远镜，也只能测量目标黑洞 Fourier 频谱的一小部分（红框内区域），而实际中该区域还被高度稀疏的图样（黑线）进一步欠采样。此外，大气噪声使该 BHI 问题具有非线性，有时导致重建图像的后验呈多模态 [64]。此处我们展示 PnP-DM 捕获多模态后验分布的有效性；为简洁起见，PnP-DM 中的扩散模型限于 EDM，基线为 DPS。

**模拟数据结果。** 我们使用 [64] 的模拟数据，其测量在假设真值黑洞图像位于人马座 A* 黑洞位置的前提下生成。图 8(b) 直观比较 PnP-DM 与 DPS 的结果。我们用 t-SNE [67] 对生成的样本（每种方法 100 个）聚类，在 PnP-DM 样本中识别出两个模态、在 DPS 样本中识别出三个模态，并对每个图像模态可视化其均值与三个样本；每张图右上角标注量化数据失配程度的指标。如均值与样本图像所示，PnP-DM 成功捕获该数据集先前识别的两个模态 [64]；注意 PnP-DM 对两个模态都生成高保真样本、通量环细节清晰，且其"模态 1"样本与真值图像高度吻合。相反，DPS 采样的三个模态中有两个缺乏有意义黑洞结构、也不对应观测测量（数据失配值显著更大）。

**真实数据结果。** 最后我们将 PnP-DM 应用于 2017 年 4 月 6 日的真实 M87 黑洞数据 [21]，结果见图 1。借助表达力强的基于 DM 的图像先验，PnP-DM 生成既视觉上合理、又与官方 EHT 重建所观测到的环直径一致的高质量样本，凸显方法在高度病态真实世界逆问题上的鲁棒性与有效性。

## 5 结论

我们提出 PnP-DM——一种求解成像逆问题的后验采样方法。其骨架是 Split Gibbs 采样器，在分别涉及似然与先验的两步之间迭代交替。关键在于，我们建立了先验步与称为 EDM 表述的通用 DM 框架之间的联系；借助该联系，我们通过统一接口把多种最先进 DM 无缝纳入为图像先验。实验结果表明，我们的方法在线性与非线性逆问题上均优于现有基于 DM 的方法，包括一个非线性且严重病态的黑洞干涉成像问题。

**局限性。** PnP-DM 还可在两方面改进。第一，PnP-DM 目前需要一次性对整幅图像评估似然步与先验步，这在求解大规模逆问题（如三维成像）或似然评估昂贵的问题（如 PDE 逆问题）时可能带来计算挑战。第二，当前理论分析未考虑一般非线性逆问题下用有限次 Langevin MCMC 实现似然步所引入的近似误差；显式纳入该误差将为 PnP-DM 的经验性能提供更多洞见。

**更广泛影响。** 我们预期本工作将在计算成像及相关应用领域产生积极影响。许多成像问题需要借助表达力强的图像先验促进图像重建并量化不确定性，这可能带来更好的成像系统、加深对成像目标的理解。然而，由于我们把 DM 作为先验引入成像过程，不可避免地会继承这些模型的潜在偏差。

## 6 致谢

作者感谢 Charles Gammie、Ben Prather、Abhishek Joshi、Vedant Dhruv 与 Chi-kwan Chan 提供黑洞模拟。作者还感谢 Schmidt Sciences 与 Heritage Medical Research Fellowship 的慷慨资助。Z.W. 受 Amazon AI4Science Fellowship 支持；Y.S. 受 Computing, Data, and Society Fellowship 支持；B.Z. 受 Kortschak Fellowship 支持。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 NeurIPS 版第 11–15 页转录；未逐条核对 DOI 与页码）。

[1] Rizwan Ahmad, Charles A. Bouman, Gregery T. Buzzard, Stanley Chan, Sizhuo Liu, Edward T. Reehorst, and Philip Schniter. Plug-and-play methods for magnetic resonance imaging: Using denoisers for image recovery. IEEE Signal Processing Magazine, 37(1):105–116, 2020.

[2] Brian. D. O. Anderson. Reverse-time diffusion equation models. Stochastic Processes and their Applications, 12:313–326, 1982.

[3] Krishna Balasubramanian, Sinho Chewi, Murat A Erdogdu, Adil Salim, and Shunshi Zhang. Towards a theory of non-log-concave sampling: first-order stationarity guarantees for langevin monte carlo. In Proceedings of Thirty Fifth Conference on Learning Theory, volume 178 of PMLR, pages 2896–2923, 2022.

[4] Georgios Batzolis, Jan Stanczuk, Carola-Bibiane Schonlieb, and Christian Etmann. Conditional image generation with score-based diffusion models. ArXiv, abs/2111.13606, 2021.

[5] Valentin De Bortoli, James Thornton, Jeremy Heng, and Arnaud Doucet. Diffusion schrödinger bridge with applications to score-based generative modeling. In Advances in Neural Information Processing Systems, 2021.

[6] Charles A. Bouman and Gregery T. Buzzard. Generative plug and play: Posterior sampling for inverse problems, 2023.

[7] Stephen Boyd, Neal Parikh, Eric Chu, Borja Peleato, and Jonathan Eckstein. Distributed optimization and statistical learning via the alternating direction method of multipliers. Foundations and Trends in Machine Learning, 3:1–122, 2011.

[8] Benjamin Boys, Mark Girolami, Jakiw Pidstrigach, Sebastian Reich, Alan Mosca, and O. Deniz Akyildiz. Tweedie moment projected diffusions for inverse problems, 2023.

[9] Andrew Brock, Jeff Donahue, and Karen Simonyan. Large scale GAN training for high fidelity natural image synthesis. In International Conference on Learning Representations, 2019.

[10] Emmanuel Candès, Xiaodong Li, and Mahdi Soltanolkotabi. Phase retrieval from coded diffraction patterns. Applied and Computational Harmonic Analysis, 39, 2013.

[11] Gabriel Victorino Cardoso, Yazid Janati, Sylvain Le Corff, and Éric Moulines. Monte carlo guided diffusion for bayesian linear inverse problems. ArXiv, abs/2308.07983, 2023.

[12] Andrew A. Chael, Michael D. Johnson, Katherine L. Bouman, Lindy L. Blackburn, Kazunori Akiyama, and Ramesh Narayan. Interferometric imaging directly with closure phases and closure amplitudes. The Astrophysical Journal, 857(1):23, 2018.

[13] Stanley Chan, Xiran Wang, and Omar Elgendy. Plug-and-play admm for image restoration: Fixed point convergence and applications. IEEE Transactions on Computational Imaging, 2016.

[14] Yongxin Chen, Sinho Chewi, Adil Salim, and Andre Wibisono. Improved analysis for a proximal algorithm for sampling. In Proceedings of Thirty Fifth Conference on Learning Theory, volume 178 of PMLR, pages 2984–3014, 2022.

[15] Jooyoung Choi, Sungwon Kim, Yonghyun Jeong, Youngjune Gwon, and Sungroh Yoon. Ilvr: Conditioning method for denoising diffusion probabilistic models. In 2021 IEEE/CVF International Conference on Computer Vision (ICCV), pages 14347–14356, 2021.

[16] Jooyoung Choi, Jungbeom Lee, Chaehun Shin, Sungwon Kim, Hyunwoo Kim, and Sungroh Yoon. Perception prioritized training of diffusion models. In CVPR, pages 11472–11481, 2022.

[17] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023.

[18] Hyungjin Chung and Jong Chul Ye. Score-based diffusion models for accelerated mri. Medical Image Analysis, page 102479, 2022.

[19] Florentin Coeurdoux, Nicolas Dobigeon, and Pierre Chainais. Plug-and-play split gibbs sampler: embedding deep generative priors in bayesian inference, 2023.

[20] Regev Cohen, Yochai Blau, Daniel Freedman, and Ehud Rivlin. It has potential: Gradient-driven denoisers for convergent solutions to inverse problems. In Neural Information Processing Systems, 2021.

[21] The Event Horizon Telescope Collaboration. First m87 event horizon telescope results. iv. imaging the central supermassive black hole. The Astrophysical Journal Letters, 875(1):L4, 2019.

[22] The Event Horizon Telescope Collaboration. First m87 event horizon telescope results. v. physical origin of the asymmetric ring. The Astrophysical Journal Letters, 875(1):L5, 2019.

[23] Zehao Dou and Yang Song. Diffusion posterior sampling for linear inverse problem solving: A filtering perspective. In The Twelfth International Conference on Learning Representations, 2024.

[24] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106:1602–1614, 2011.

[25] Jiaojiao Fan, Bo Yuan, and Yongxin Chen. Improved dimension dependence of a proximal algorithm for sampling. In Proceedings of Thirty Sixth Conference on Learning Theory, volume 195 of PMLR, pages 1473–1521, 2023.

[26] Zhenghan Fang, Sam Buchanan, and Jeremias Sulam. What's in a prior? learned proximal networks for inverse problems. In The Twelfth International Conference on Learning Representations, 2024.

[27] Elhadji C. Faye, Mame Diarra Fall, and Nicolas Dobigeon. Regularization by denoising: Bayesian model and langevin-within-split gibbs sampling, 2024.

[28] Berthy T. Feng, Jamie Smith, Michael Rubinstein, Huiwen Chang, Katherine L. Bouman, and William T. Freeman. Score-based diffusion models as principled priors for inverse imaging. In ICCV, pages 10520–10531, 2023.

[29] James R. Fienup. Phase retrieval algorithms: a comparison. Applied optics, 21(15):2758–2769, 1982.

[30] Daniel Gabay and Bertrand Mercier. A dual algorithm for the solution of nonlinear variational problems via finite element approximation. Computers & Mathematics With Applications, 2:17–40, 1976.

[31] Donald Geman and Chengda Yang. Nonlinear image recovery with half-quadratic regularization. IEEE Transactions on Image Processing, 4(7):932–946, 1995.

[32] Alexandros Graikos, Nikolay Malkin, Nebojsa Jojic, and Dimitris Samaras. Diffusion models as plug-and-play priors. ArXiv, abs/2206.09012, 2022.

[33] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems, volume 33, pages 6840–6851, 2020.

[34] Ajil Jalal, Marius Arvinte, Giannis Daras, Eric Price, Alexandros G Dimakis, and Jon Tamir. Robust compressed sensing mri with deep generative priors. In Advances in Neural Information Processing Systems, volume 34, pages 14938–14954, 2021.

[35] Zahra Kadkhodaie and Eero P Simoncelli. Stochastic solutions for linear inverse problems using the prior implicit in a denoiser. In Advances in Neural Information Processing Systems, 2021.

[36] Ulugbek Kamilov, Charles Bouman, Gregery Buzzard, and Brendt Wohlberg. Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications. IEEE Signal Processing Magazine, 40:85–97, 2023.

[37] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. In Advances in Neural Information Processing Systems, 2022.

[38] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In CVPR, pages 4396–4405, 2019.

[39] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. In Advances in Neural Information Processing Systems, 2022.

[40] Bahjat Kawar, Gregory Vaksman, and Michael Elad. SNIPS: Solving noisy inverse problems stochastically. Advances in Neural Information Processing Systems, 34:21757–21769, 2021.

[41] Rémi Laumont, Valentin De Bortoli, Andrés Almansa, Julie Delon, Alain Durmus, and Marcelo Pereyra. Bayesian imaging using plug & play priors: When langevin meets tweedie. SIAM Journal on Imaging Sciences, 15(2):701–737, 2022.

[42] Yin Tat Lee, Ruoqi Shen, and Kevin Tian. Structured logconcave sampling with a restricted gaussian oracle. In Proceedings of Thirty Fourth Conference on Learning Theory, volume 134 of PMLR, pages 2993–3050, 2021.

[43] Xiang Li, Soo Min Kwon, Ismail R. Alkhouri, Saiprasad Ravishankar, and Qing Qu. Decoupled data consistency with diffusion purification for image restoration, 2024.

[44] Jiaming Liu, Rushil Anirudh, Jayaraman J. Thiagarajan, Stewart He, K Aditya Mohan, Ulugbek S. Kamilov, and Hyojin Kim. Dolce: A model-based probabilistic diffusion framework for limited-angle ct reconstruction. In ICCV, pages 10498–10508, 2023.

[45] Ziwei Liu, Ping Luo, Xiaogang Wang, and Xiaoou Tang. Deep learning face attributes in the wild. In ICCV, 2015.

[46] Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. In International Conference on Learning Representations, 2019.

[47] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In The Twelfth International Conference on Learning Representations, 2024.

[48] Ségolène Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. Pnp-flow: Plug-and-play image restoration with flow matching, 2024.

[49] Tim Meinhardt, Michael Möller, Caner Hazirbas, and Daniel Cremers. Learning proximal operators: Using denoising networks for regularizing inverse imaging problems. In ICCV, pages 1799–1808, 2017.

[50] Chenlin Meng, Yutong He, Yang Song, Jiaming Song, Jiajun Wu, Jun-Yan Zhu, and Stefano Ermon. Sdedit: Guided image synthesis and editing with stochastic differential equations. In International Conference on Learning Representations, 2021.

[51] Christopher A. Metzler, Philip Schniter, Ashok Veeraraghavan, and Richard Baraniuk. prdeep: Robust phase retrieval with a flexible deep network. In International Conference on Machine Learning, 2018.

[52] Alexander Quinn Nichol and Prafulla Dhariwal. Improved denoising diffusion probabilistic models. In Proceedings of the 38th International Conference on Machine Learning, volume 139 of PMLR, pages 8162–8171, 2021.

[53] Marcelo Pereyra, Luis A. Vargas-Mieles, and Konstantinos C. Zygalakis. The split gibbs sampler revisited: Improvements to its algorithmic structure and augmented target distribution. SIAM Journal on Imaging Sciences, 16(4):2040–2071, 2023.

[54] B. Remy, F. Lanusse, N. Jeffrey, J. Liu, Jean-Luc Starck, K. Osato, and T. Schrabback. Probabilistic mass-mapping with neural score estimation. Astronomy & Astrophysics, 672, 2022.

[55] Litu Rout, Negin Raoof, Giannis Daras, Constantine Caramanis, Alex Dimakis, and Sanjay Shakkottai. Solving linear inverse problems provably via posterior sampling with latent diffusion models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.

[56] Ernest K. Ryu, Jialin Liu, Sicheng Wang, Xiaohan Chen, Zhangyang Wang, and Wotao Yin. Plug-and-play methods provably converge with properly trained denoisers. In International Conference on Machine Learning, 2019.

[57] Chitwan Saharia, Jonathan Ho, William Chan, Tim Salimans, David Fleet, and Mohammad Norouzi. Image super-resolution via iterative refinement. IEEE Transactions on Pattern Analysis and Machine Intelligence, pages 1–14, 2022.

[58] Bowen Song, Soo Min Kwon, Zecheng Zhang, Xinyu Hu, Qing Qu, and Liyue Shen. Solving inverse problems with latent diffusion models via hard data consistency. In The Twelfth International Conference on Learning Representations, 2024.

[59] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. In International Conference on Learning Representations, 2021.

[60] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.

[61] Jiaming Song, Qinsheng Zhang, Hongxu Yin, Morteza Mardani, Ming-Yu Liu, Jan Kautz, Yongxin Chen, and Arash Vahdat. Loss-guided diffusion models for plug-and-play controllable generation. In Proceedings of the 40th International Conference on Machine Learning, ICML'23, 2023.

[62] Yang Song, Liyue Shen, Lei Xing, and Stefano Ermon. Solving inverse problems in medical imaging with score-based generative models. In International Conference on Learning Representations, 2022.

[63] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.

[64] He Sun and Katherine L. Bouman. Deep probabilistic imaging: Uncertainty quantification and multi-modal solution characterization for computational imaging. In AAAI Conference on Artificial Intelligence (AAAI), 2021.

[65] Yu Sun, Brendt Wohlberg, and Ulugbek Kamilov. An online plug-and-play algorithm for regularized image reconstruction. IEEE Transactions on Computational Imaging, 2019.

[66] Yu Sun, Zihui Wu, Yifan Chen, Berthy T. Feng, and Katherine L. Bouman. Provable probabilistic imaging using score-based generative priors. IEEE Transactions on Computational Imaging, 10:1290–1305, 2024.

[67] Laurens van der Maaten and Geoffrey Hinton. Visualizing data using t-sne. Journal of Machine Learning Research, 9(86):2579–2605, 2008.

[68] Santosh S. Vempala and Andre Wibisono. Rapid convergence of the unadjusted langevin algorithm: Isoperimetry suffices. In Neural Information Processing Systems, 2019.

[69] Singanallur V. Venkatakrishnan, Charles A. Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In 2013 IEEE Global Conference on Signal and Information Processing, pages 945–948, 2013.

[70] Pascal Vincent. A connection between score matching and denoising autoencoders. Neural Computation, 23:1661–1674, 2011.

[71] Maxime Vono, Nicolas Dobigeon, and Pierre Chainais. Split-and-augmented gibbs sampler—application to large-scale inference problems. IEEE Transactions on Signal Processing, 67(6):1648–1661, 2019.

[72] Maxime Vono, Nicolas Dobigeon, and Pierre Chainais. High-dimensional gaussian sampling: A review and a unifying approach based on a stochastic proximal point algorithm. SIAM Review, 64(1):3–56, 2022.

[73] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. The Eleventh International Conference on Learning Representations, 2023.

[74] Luhuan Wu, Brian L Trippe, Christian A. Naesseth, David M Blei, and John P Cunningham. Practical and asymptotically exact conditional sampling in diffusion models. arXiv preprint arXiv:2306.17775, 2023.

[75] Zihui Wu, Yu Sun, Jiaming Liu, and Ulugbek Kamilov. Online regularization by denoising with applications to phase retrieval. In 2019 IEEE/CVF International Conference on Computer Vision Workshop (ICCVW), pages 3887–3895, 2019.

[76] Zihui Wu, Yu Sun, Alex Matlock, Jiaming Liu, Lei Tian, and Ulugbek S. Kamilov. Simba: Scalable inversion in optical tomography using deep denoising priors. IEEE Journal of Selected Topics in Signal Processing, 14(6):1163–1175, 2020.

[77] Bin Xia, Yulun Zhang, Shiyin Wang, Yitong Wang, Xinglong Wu, Yapeng Tian, Wenming Yang, and Luc Van Gool. Diffir: Efficient diffusion model for image restoration. ICCV, 2023.

[78] Xingyu Xu and Yuejie Chi. Provably robust score-based diffusion posterior sampling for plug-and-play image reconstruction, 2024.

[79] Bo Yuan, Jiaojiao Fan, Jiaming Liang, Andre Wibisono, and Yongxin Chen. On a class of gibbs sampling over networks. In Proceedings of Thirty Sixth Conference on Learning Theory, volume 195 of PMLR, pages 5754–5780, 2023.

[80] Kai Zhang, Yawei Li, Wangmeng Zuo, Lei Zhang, Luc Gool, and Radu Timofte. Plug-and-play image restoration with deep denoiser prior. IEEE Transactions on Pattern Analysis and Machine Intelligence, 2021.

[81] Kai Zhang, Wangmeng Zuo, Yunjin Chen, Deyu Meng, and Lei Zhang. Beyond a Gaussian denoiser: Residual learning of deep CNN for image denoising. IEEE Transactions on Image Processing, 26(7):3142–3155, 2017.

[82] Kai Zhang, Wangmeng Zuo, Shuhang Gu, and Lei Zhang. Learning deep cnn denoiser prior for image restoration. In CVPR, pages 2808–2817, 2017.

[83] Qinsheng Zhang and Yongxin Chen. Fast sampling of diffusion models with exponential integrator. In The Eleventh International Conference on Learning Representations, 2023.

[84] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In IEEE Conference on Computer Vision and Pattern Recognition Workshops (NTIRE), 2023.

## 附录 A：理论

### A.1 PnP-DM 的插值

本小节正式引入 PnP-DM 的插值。我们考虑耦合强度为常数，即 $\rho_k\equiv\rho$，并作如下假设。

**假设 A.1。** 存在唯一 $t^*$ 使 $\sigma(t^*)=\rho$。

该假设对常见扩散模型成立。常用的噪声水平调度包括 $\sigma(t)=t$ 与 $\sigma(t)=\sqrt t$，都是 $t$ 的单调增函数。我们先用两个命题说明 SGS 的两步可分别通过运行两个 SDE 实现。

**命题 A.2（似然步的布朗桥）。** 对第 $k$ 次迭代的迭代点 $x^{(k)}$，SGS 的似然步等价于从 $t=0$ 到 $t=1$ 求解如下 SDE：

$$
dx_t=\rho^2\nabla\log\phi_t(x_t)\,dt+\rho\,dw_t, \tag{9}
$$

其中 $x_0=x^{(k)}$、$\phi_t(x):=\int\exp\left[-f(z;y)-\frac{1}{2\rho^2(1-t)}\|x-z\|_2^2\right]dz$。

**证明。** 该命题源自 [79] 引理 4 给出的布朗桥构造。该 SDE 满足 $p(x_1\mid x_0)\propto\exp\left(-f(x_1;y)-\frac{1}{2\rho^2}\|x_0-x_1\|_2^2\right)$，故从 $t=0$ 到 $t=1$ 求解 (9) 等价于执行一次似然步。■

**命题 A.3（先验步的 EDM 反向扩散）。** 对第 $k$ 次迭代的迭代点 $z^{(k)}$，SGS 的先验步等价于从 $t=t^*$ 到 $t=0$ 求解如下 SDE：

$$
dx_t=\left[u(t)x_t-v(t)^2\nabla\log p_t(x_t)\right]dt+v(t)\,d\bar w_t, \tag{10}
$$

其中 $x_{t^*}=s(t^*)z^{(k)}$、$u(t):=\frac{\dot s(t)}{s(t)}$、$v(t):=s(t)\sqrt{2\dot\sigma(t)\sigma(t)}$，$p_t$ 为 $s(t)x+s(t)\sigma(t)\epsilon$ 的分布（$x$ 服从先验分布 $p(x)\propto\exp(-g(x))$、$\epsilon\sim\mathcal N(0,I)$）。

**证明。** 首先注意 (10) 正是用 $u(t)$、$v(t)$ 写出的 (7)。已知 (10) 是如下 SDE 的反向 SDE：

$$
dx_t=u(t)x_t\,dt+v(t)\,dw_t, \tag{11}
$$

其中 $x_0\sim p(x)$、$p_t$ 为 $x_t$ 的边缘分布。如正文所示，(11) 满足

$$
p(x_0\mid x_t)\propto\exp\left(-g(x_0)-\frac{1}{2\sigma(t)^2}\left\|x_0-\frac{x_t}{s(t)}\right\|_2^2\right).
$$

由于 (10) 是 (11) 的时间反演过程，二者共享路径分布因而共享条件分布 $p(x_0\mid x_t)$。故若置 $x_{t^*}=s(t^*)z^{(k)}$，则

$$
p(x_0\mid x_{t^*})\propto\exp\left(-g(x_0)-\frac{1}{2\sigma(t^*)^2}\left\|x_0-z^{(k)}\right\|_2^2\right)\propto\exp\left(-g(x_0)-\frac{1}{2\rho^2}\left\|x_0-z^{(k)}\right\|_2^2\right),
$$

这正是先验步所需的条件分布。因此从 $t=t^*$ 到 $t=0$ 求解 (10) 等价于执行一次先验步。■

由于命题 A.2 与 A.3，(9) 与 (10) 实现了 SGS 所需的两个条件分布。在 PnP-DM 中，先验步涉及近似先验分数函数的网络，即 $s_t\approx\nabla\log p_t$，故实际更新的连续时间过程为

$$
dx_t=\left[u(t)x_t-v(t)^2s_t(x_t)\right]dt+v(t)\,d\bar w_t. \tag{12}
$$

于是可通过考虑在运行 (9) 与 (12) 之间交替的动力学来插值 PnP-DM。由于每次似然步耗时 1 个单位时间、每次先验步耗时 $t^*$ 个单位时间，$K$ 次迭代的插值过程总时间为 $T:=K(t^*+1)$。用 $\tau$ 表示自以 $x^{(0)}$ 初始化 PnP-DM 以来经过的时间。定义 $\{\nu_\tau\}$ 与 $\{\pi_\tau\}$ 分别为以 $x^{(0)}\sim\nu_0^X$ 初始化的非平稳过程（图 3 上）与以 $x^{(0)}\sim\pi^X$ 初始化的平稳过程（图 3 下）在时间 $\tau$ 的分布。因此有：当 $\tau=k(t^*+1)$（$k=0,\ldots,K$）时 $\nu_\tau=\nu_k^X$、$\pi_\tau=\pi^X$；当 $\tau=k(t^*+1)+1$（$k=0,\ldots,K-1$）时 $\nu_\tau=\nu_k^Z$、$\pi_\tau=\pi^Z$。

### A.2 定理 3.1 的证明

在证明主要结果前，先给出一个关键引理：它以 Fisher 信息量化一对一般扩散过程沿时间的 KL 散度的时间导数。

**引理 A.4。** 给定如下一对扩散过程

$$
dx_t=b(x_t,t)\,dt+c(t)\,dw_t, \tag{13}
$$

$$
d\tilde x_t=\tilde b(\tilde x_t,t)\,dt+c(t)\,dw_t, \tag{14}
$$

其中 $b(\cdot,\cdot):\mathbb R^n\times\mathbb R\to\mathbb R^n$、$\tilde b(\cdot,\cdot):\mathbb R^n\times\mathbb R\to\mathbb R^n$、$c(\cdot):\mathbb R\to\mathbb R$。令 $\mu_t$ 为 (13) 以 $x_0\sim\mu_0$ 初始化时 $x_t$ 的分布，$\tilde\mu_t$ 为 (14) 以 $\tilde x_0\sim\tilde\mu_0$ 初始化时 $\tilde x_t$ 的分布，则

$$
\partial_t\mathrm{KL}(\mu_t\|\tilde\mu_t)\le-\frac{c(t)^2}{4}\mathrm{FI}(\mu_t\|\tilde\mu_t)+\frac{1}{c(t)^2}\int\left\|\tilde b_t-b_t\right\|_2^2\mu_t. \tag{15}
$$

**证明（要点）。** 将 $b(\cdot,t)$ 记作 $b_t$、$\tilde b(\cdot,t)$ 记作 $\tilde b_t$，由 (13)、(14) 的 Fokker–Planck 方程计算 $\partial_t\mathrm{KL}(\mu_t\|\tilde\mu_t)$，对漂移差项用 Young 不等式分离，再利用 Fisher 信息的定义即得 (15)。■

**定理 3.1 的证明（要点）。** 先考虑 $K$ 次迭代中的似然步：对非平稳与平稳过程的似然步 (9) 应用 [79] 引理 2，得 $\int_{k(t^*+1)}^{k(t^*+1)+1}\rho^2\mathrm{FI}(\pi_\tau\|\nu_\tau)\,d\tau=4[\mathrm{KL}(\pi^X\|\nu_k^X)-\mathrm{KL}(\pi^Z\|\nu_k^Z)]$；再对先验步应用引理 A.4，得 $\int_{k(t^*+1)+1}^{(k+1)(t^*+1)}v(\tau)^2\mathrm{FI}(\pi_\tau\|\nu_\tau)\,d\tau\le4[\mathrm{KL}(\pi^Z\|\nu_k^Z)-\mathrm{KL}(\pi_{k+1}^X\|\nu_{k+1}^X)]+4\epsilon_{\mathrm{score}}$。把两式对 $k=0,\ldots,K-1$ 求和、用 $\min(\rho,\delta)^2$ 对左端下界化、再用 $T=K(t^*+1)$ 除两端，即得 (8)。■

### A.3 讨论

为便于讨论，先给出如下命题。

**命题 A.5。** 定义 $\tau\in[0,T]$ 上的加权函数 $\lambda(\tau)$：对 $k=0,\ldots,K-1$，

$$
\lambda(\tau)=\begin{cases}\rho^2,&\tau\in\left[k(t^*+1),k(t^*+1)+1\right],\\v(\tau)^2,&\tau\in\left[k(t^*+1)+1,(k+1)(t^*+1)\right].\end{cases}
$$

则在定理 3.1 的相同设定下，

$$
\frac{1}{T}\int_0^T\lambda(\tau)\mathrm{FI}(\pi_\tau\|\nu_\tau)\,d\tau=\frac{4\mathrm{KL}(\pi^X\|\nu_0^X)}{K(t^*+1)}+\frac{4\epsilon_{\mathrm{score}}}{t^*+1}, \tag{18}
$$

其中 $\epsilon_{\mathrm{score}}:=\int_1^{t^*+1}v(\tau)^2\mathbb E_{\pi_\tau}\|s_\tau-\nabla\log p_\tau\|_2^2\,d\tau$。

**证明。** 由 $\lambda(\tau)$ 的定义，对似然步应用 [79] 引理 2 得 $\int_{k(t^*+1)}^{k(t^*+1)+1}\lambda(\tau)\mathrm{FI}(\pi_\tau\|\nu_\tau)\,d\tau=4[\mathrm{KL}(\pi^X\|\nu_k^X)-\mathrm{KL}(\pi^Z\|\nu_k^Z)]$（$k=0,\ldots,K-1$）；类似地对先验步应用引理 A.4 得 $\int_{k(t^*+1)+1}^{(k+1)(t^*+1)}\lambda(\tau)\mathrm{FI}(\pi_\tau\|\nu_\tau)\,d\tau\le4[\mathrm{KL}(\pi^Z\|\nu_k^Z)-\mathrm{KL}(\pi^X\|\nu_{k+1}^X)]+4\epsilon_{\mathrm{score}}$。对 $k$ 求和并除以 $T:=K(t^*+1)$ 即得 (18)。■

与定理 3.1 不同，该命题以加权函数 $\lambda(\tau)$ 计算两个过程沿 Fisher 信息的加权平均；通过对 (18) 左端用 $\lambda(\tau)$ 在 $\tau\in[0,T]$ 上的下确界进一步下界化，即得到定理 3.1 中无加权平均 Fisher 信息的界。由此可看出定理 3.1 中 $\delta$ 的作用：当 $\delta>0$ 时加权函数 $\lambda(\tau)$ 恒严格为正，故（无加权）平均 Fisher 信息必收敛到 0——VP- 与 VE-SDE 正是此情形 [63]。反之若 $\delta=0$，则当 $\lambda(\tau)$ 趋于 0 时 $\mathrm{FI}(\pi_\tau\|\nu_\tau)$ 可能越来越大；对 iDDPM 与 EDM，这可能发生在反向扩散 $t=0$ 附近（这些过程 $v(0)=0$）。不过我们可考虑略作调整的扩散系数 $\tilde v(t):=v(t)+\epsilon$（$\epsilon>0$）。利用分数与扩散的关系 $\mathrm{div}(p\nabla\log p)=\Delta p$，可得在每个 $t$ 与 (7) 同律的反向 SDE

$$
dx_t=\left[\frac{\dot s(t)}{s(t)}x_t+\left(\frac{\epsilon^2}{2}-2s(t)^2\dot\sigma(t)\sigma(t)\right)\nabla\log p\left(\frac{x_t}{s(t)};\sigma(t)\right)\right]dt+\left(s(t)\sqrt{2\dot\sigma(t)\sigma(t)}+\epsilon\right)d\bar w_t.
$$

此时 $\tilde v(t)=s(t)\sqrt{2\dot\sigma(t)\sigma(t)}+\epsilon$ 恒严格为正，故无加权平均 Fisher 信息的收敛性同样得到保证。

## 附录 B：逆问题设置

**数据使用。** 本文实验使用的数据如下：

- **合成先验实验：** 从 CelebA 数据集 [45] 取图像，转为灰度、缩放到 $[-1,1]$ 并调整为 $32\times32$ 像素以便高效计算；随后求图像的经验均值与协方差以构造高斯图像先验，测试图像从该高斯先验中随机抽取。
- **基准实验：** 使用 FFHQ 数据集 [38] 中前 100 张图像（索引 00000–00099）。对所有线性逆问题，测试图像为 RGB 并归一化到 $[-1,1]$；对所有非线性问题，测试图像为灰度并归一化到 $[0,1]$。
- **黑洞实验：** 使用 [64] 所用的模拟数据，以及公开的 EHT 2017 数据（用于产生 M87 黑洞首张图像）。

**前向模型。** 各任务的测量函数、噪声水平与过采样/掩模设置见正文第 4.2、4.3 节与附录 F；黑洞成像的干涉测量模型（含闭相位/闭幅度、稀疏 $(u,v)$ 覆盖与大气相位噪声）按 [12, 21, 64] 的设置实现。

## 附录 C：PnP-DM 的技术细节

### C.1 似然步

**线性前向模型与高斯噪声。** 如正文所示，线性前向模型与高斯噪声下似然步为 $\pi_{Z\mid X=x}=\mathcal N(m(x),\Lambda^{-1})$，其中 $\Lambda:=A^\top\Sigma^{-1}A+\frac{1}{\rho^2}I$、$m(x):=\Lambda^{-1}\left(A^\top\Sigma^{-1}y+\frac{1}{\rho^2}x\right)$。此处瓶颈是均值与协方差都涉及矩阵逆 $\Lambda^{-1}$，在高维问题中直接计算可能不可行。然而当噪声为独立同分布高斯（即 $\Sigma=\sigma_y^2I$）且 $A$ 可高效分解时，计算代价可显著缓解。例如若能高效计算前向模型 $A$ 的 SVD，即 $A=USV^\top$，则可求得 $\Lambda^{-1}$ 的 Cholesky 分解

$$
\Lambda^{-1}=LL^\top,\qquad L:=V\left(\frac{1}{\sigma^2}S^2+\frac{1}{\rho^2}I\right)^{-1/2}.
$$

由于 $S$ 为对角矩阵，第二项只需 $\mathcal O(n)$ 复杂度即可计算。随后利用多元高斯分布的性质，可采 $\eta\sim\mathcal N(0,I)$ 并计算 $z=m(x)+L\eta$，即得严格服从目标高斯分布 $\mathcal N(m(x),\Lambda^{-1})$ 的样本。当 $A$ 为循环卷积矩阵时，可用 Fourier 变换作类似推导。

**非线性前向模型。** 算法 2 给出一般可微前向模型下用 Langevin 蒙特卡洛（LMC）采样似然步的伪代码。

**算法 2　一般 $A$ 下似然步的 Langevin 蒙特卡洛**

- **输入：** 状态 $x$、耦合强度 $\rho>0$、带测量 $y$ 的似然势 $f(\cdot;y)$。
- **超参数：** 步长 $\gamma>0$、迭代次数 $J>0$。
- 1: $u_0\leftarrow x$
- 2: **for** $j=0,\ldots,J-1$ **do**
- 3: 　$u_{j+1}\leftarrow u_j-\gamma\nabla f(u_j;y)-\frac{\gamma}{\rho^2}(u_j-x)+\sqrt{2\gamma}\,\epsilon_j$，其中 $\epsilon_j\sim\mathcal N(0,I)$
- 4: **end for**
- 5: **return** $u_J$

表 3 汇总本文求解非线性逆问题时使用的超参数。

**表 3　PnP-DM 似然步的超参数**

| 逆问题 | 步长 $\gamma$ | 迭代次数 $J$ |
|---|---|---|
| 编码衍射图样（CDP） | 1.0e-3 | 100 |
| Fourier 相位恢复 | 1.0e-4 | 100 |
| 黑洞成像 | 1.0e-5 | 200 |

### C.2 先验步

**EDM 框架。** 用本文记号正式引入 EDM 表述 [37]。前向扩散过程定义为如下线性 Itô SDE：

$$
dx_t=u(t)x_t\,dt+v(t)\,dw_t, \tag{23}
$$

其中 $u(t):\mathbb R\to\mathbb R$、$v(t):\mathbb R\to\mathbb R$ 为漂移与扩散系数。生成过程是 (23) 的时间反演版本；据 [2]，它是形如

$$
dx_t=\left[u(t)x_t-v(t)^2\nabla_{x_t}\log p_t(x_t)\right]dt+v(t)\,d\bar w_t \tag{24}
$$

的另一 Itô SDE，其中 $p_t(x_t)$ 为 $x_t$ 的边缘分布。还存在反向概率流 ODE

$$
dx_t=\left[u(t)x_t-\frac{1}{2}v(t)^2\nabla_{x_t}\log p_t(x_t)\right]dt, \tag{25}
$$

它与 (24) 共享相同的边缘分布。基于 (23) 有 $p(x_t\mid x_0)=\mathcal N\left(s(t)x_0,s(t)^2\sigma(t)^2I\right)$，其中 $s(t):=\exp\left(\int_0^tu(\xi)d\xi\right)$、$\sigma(t):=\sqrt{\int_0^t\frac{v(\xi)^2}{s(\xi)^2}d\xi}$。还有 $x_t/s(t)\sim p(x;\sigma(t))$，其中 $p(x;\sigma(t))$ 为向先验数据加入标准差 $\sigma(t)$ 的独立同分布高斯噪声所得分布。EDM 表述的思想是直接用 $x_t$ 相对 $x_0$ 的缩放与噪声水平（而非漂移与扩散系数）写出反向扩散。利用 $u(t)$、$v(t)$、$p_t$ 与 $s(t)$、$\sigma(t)$、$p(\cdot;\sigma(t))$ 之间的关系，可把 (24) 与 (25) 改写为

$$
dx_t=\left[\frac{\dot s(t)}{s(t)}x_t-2s(t)^2\dot\sigma(t)\sigma(t)\nabla_{x_t}\log p\left(\frac{x_t}{s(t)};\sigma(t)\right)\right]dt+s(t)\sqrt{2\dot\sigma(t)\sigma(t)}\,d\bar w_t \tag{26}
$$

与

$$
dx_t=\left[\frac{\dot s(t)}{s(t)}x_t-s(t)^2\dot\sigma(t)\sigma(t)\nabla_{x_t}\log p\left(\frac{x_t}{s(t)};\sigma(t)\right)\right]dt. \tag{27}
$$

注意 (26) 正是正文中先验步所考虑的 SDE (7)。最后，由 Tweedie 公式 [24]，可用在去噪目标 $\ell_2$ 误差下训练的去噪器 $[D_\theta(\cdot;\sigma(t))-\cdot]/\sigma(t)^2$ 近似 $\nabla_{x_t}\log p(\cdot;\sigma(t))$。把分数函数替换为该去噪器近似并利用链式法则，(26) 与 (27) 进一步写为

$$
dx_t=\left[\left(\frac{\dot\sigma(t)}{\sigma(t)}+\frac{\dot s(t)}{s(t)}\right)x_t-\frac{2\dot\sigma(t)s(t)}{\sigma(t)}D_\theta\left(\frac{x_t}{s(t)};\sigma(t)\right)\right]dt+s(t)\sqrt{2\dot\sigma(t)\sigma(t)}\,d\bar w_t \tag{28}
$$

与

$$
dx_t=\left[\left(\frac{\dot\sigma(t)}{\sigma(t)}+\frac{\dot s(t)}{s(t)}\right)x_t-\frac{\dot\sigma(t)s(t)}{\sigma(t)}D_\theta\left(\frac{x_t}{s(t)};\sigma(t)\right)\right]dt. \tag{29}
$$

**伪代码。** 先验步伪代码见算法 3。注意更新规则正是 (28) 与 (29) 的 Euler 离散化；离散时间步 $\{t_i\}_{i=0}^N$、缩放调度 $s(\cdot)$ 与噪声调度 $\sigma(\cdot)$ 与 [37] 表 1 相同。所有实验设总时间步数 100，即 $N=100$。这**不**意味着每次先验步的函数评估次数（NFE）为 100：由于算法运行时 $\rho$ 取较小值，后续迭代的步数远少于 100。先验步类似 SDEdit [50] 中从反向扩散过程中间开始的图像合成过程；CDP 问题用 pf-ODE 求解器，其他问题用 SDE 求解器，部分代码实现基于某开源仓库。**算法 3　先验步的 EDM（噪声水平 $\rho$ 下的贝叶斯去噪）**：以 $x\leftarrow z^{(k)}$、$\sigma\leftarrow\rho$ 为初值，按 (28)/(29) 的 Euler 离散从 $t=t^*$ 反向积分至 0，返回 $x$。

### C.3 其他

**$\rho$ 的退火调度。** 本文对耦合强度 $\rho$ 采用指数退火调度。注意该调度可比指数衰减更一般，其他衰减调度留待未来工作。具体地，指定起始水平 $\rho_0$、衰减率 $\alpha$ 与最小值 $\rho_{\min}$，并置

$$
\rho_k=\max\left(\alpha^k\rho_0,\rho_{\min}\right),\qquad k=0,\ldots,K-1.
$$

表 4 汇总本文对所有逆问题使用的退火超参数。

**表 4　PnP-DM 中 $\rho$ 退火调度的超参数**

| 逆问题 | 起始水平 $\rho_0$ | 最小值 $\rho_{\min}$ | 衰减率 $\alpha$ |
|---|---|---|---|
| 合成先验实验 | 0.03 | 0.03 | 1 |
| 高斯去模糊 | 10 | 0.3 | 0.9 |
| 运动去模糊 | 10 | 0.3 | 0.9 |
| 超分辨 | 10 | 0.3 | 0.9 |
| 编码衍射图样 | 10 | 0.1 | 0.9 |
| Fourier 相位恢复 | 10 | 0.1 | 0.9 |
| 黑洞成像 | 10 | 0.02 | 0.93 |

**初始化。** 对线性逆问题使用零初始化，即 $x^{(0)}=0\in\mathbb R^n$；对 CDP 与 Fourier 相位恢复使用高斯初始化，即 $x^{(0)}\sim\mathcal N(0,I)$；对黑洞成像对每像素使用 0 到 1 间的均匀随机初始化。我们发现作为 MCMC 算法的 PnP-DM 对初始化不敏感：除黑洞实验（发现负值会引起问题）外，任何合理初始化都给出可比结果。该观察印证了我们的收敛结果——它对任意初始化 $\nu_0^X$ 成立。

**迭代次数。** 合成先验实验运行 500 次迭代，黑洞实验 200 次，其余实验 100 次；这些数值的选取使算法充分收敛。

**样本收集。** 用本文方法收集多个样本有两种主要途径：(1) 运行单条马尔可夫链，在若干次迭代（称为 burn-in 期）后收集样本以保证链已收敛；(2) 运行若干独立马尔可夫链，每条链收敛后各取一个样本。前一种更高效，但所收集样本不完全独立、有效样本量可能较小；后一种保证样本完全独立但耗时更长。实验中，对涉及 $256\times256$ 图像的所有测试使用第一种以提升效率：burn-in 期设为 40 次迭代，从剩余 60 次迭代中收集 20 个随机样本（每 3 次迭代取一个）。其他实验由于图像尺寸较小，采用第二种途径以获得完全独立样本。

**计算资源。** 所有实验在 NVIDIA RTX A6000 与 A100 GPU 上完成。单张图像运行时间取决于 GPU 选择、总迭代次数与耦合强度调度 $\{\rho_k\}$（因为对基于 EDM 的去噪器，$\rho$ 越大需要越多网络评估）。实际实验中每张图像至少运行 100 次迭代以保证收敛，单条马尔可夫链约需 1 分钟。表 5 给出在线性超分辨与非线性 CDP 问题上与主要基线的计算效率比较，以秒计时钟时间与函数评估次数（NFE）衡量；所有超参数与正文表 1、表 2 一致。如预期，基于 DM 的方法（DDRM 与 DPS）因 NFE 更低通常运行时间更短；然而我们的 PnP-DM 方法显著优于这些方法，且运行时间与 DPS 相当（约 1.5 倍），尽管其 NFE 更大（约 3 倍）。这主要归因于两点：1）PnP-DM 通过每步把起始噪声水平适配到 $\rho_k$，避免运行完整扩散过程；2）$\rho_k$ 的退火调度进一步降低运行时间。还应注意表中 DDRM 与 DPS 的运行时间是生成**一个**样本的耗时：在线性逆问题实验中各方法需生成 20 个样本，PnP-DM 由于沿一条 batch size 为 1 的马尔可夫链取 20 个样本（故运行时间与表内相同、约 50 秒），而 DPS 需以 batch size 20 运行扩散过程，明显更慢（约 330 秒）。

**表 5　PnP-DM 与其他基线方法的计算效率比较**

| 逆问题 | 指标 | DDRM | DPS | PnP-SGS | DPnP | PnP-DM（本文） |
|---|---|---|---|---|---|---|
| 超分辨 | 时钟时间（s） | 0.4 | 39 | 20 | 322 | 55 |
| 超分辨 | NFE | 20 | 1000 | 1030 | 18372 | 3032 |
| 编码衍射图样 | 时钟时间（s） | – | 37 | 54 | 261 | 50 |
| 编码衍射图样 | NFE | – | 1000 | 2572 | 14596 | 2482 |

## 附录 D：基线方法的实现细节

**PnP-ADMM。** ADMM 罚参数设为 2，运行 500 次迭代以保证收敛；使用 deepinv 库中可用的预训练 DnCNN 去噪器 [81]。

**DPIR。** 遵循 [80] 的退火调度并运行 40 次迭代；使用 deepinv 库中可用的预训练 DRUNet 去噪器 [82]。

**DDRM。** 所有实验使用默认参数：$\eta_B=1.0$、$\eta=0.85$、DDIM 采样器 [59] 20 步。对高斯去模糊问题使用基于可分离一维卷积的 SVD 前向模型实现；添加额外 batch 维以收集多个样本。

**DPS。** 遵循原论文使用 1000 步 DDPM 采样器骨架。对线性逆问题使用 [17] 给出的步长，即 $\zeta'=1$；对非线性逆问题通过网格搜索优化步长，得到 CDP 与 Fourier 相位恢复 $\zeta'=3$、黑洞成像 $\zeta'=0.001$；对合成先验实验同样优化步长，压缩感知取 $\zeta'=0.1$、高斯去模糊取 $\zeta'=1$。添加额外 batch 维以收集多个样本。

**PnP-SGS。** 对耦合参数 $\rho$ 作网格搜索，发现 $\rho=0.1$ 对所有问题最优；遵循 [19] 的做法设 burn-in 期 20 次迭代（后续细节见原文；本节其余部分与附录 F.5 的进一步分析一致）。

## 附录 E：更多相关工作

**基于即插即用先验的图像重建。** 即插即用（PnP）[69] 是利用现成去噪器求解成像逆问题的算法框架。基于近端算子与去噪问题最大后验（MAP）解的等价性，PnP 把 ADMM [13, 56] 与 HQS [82, 80] 等众多优化算法中的近端更新替换为通用去噪算法，尤其是基于深度学习的去噪器 [49, 82, 80]。由于与最先进的学习型去噪先验兼容，PnP 框架既有收敛保证 [65, 56] 又有很强的经验性能 [76, 1]。近期工作还提出具有优化视角方向性解释的学习型 PnP 框架 [20, 26]；PnP 理论与实践的全面综述见 [36]。

**使用 MCMC 与学习先验的后验采样。** 学习型先验也被用于贝叶斯语境 [35]，即采样学习先验下定义的后验分布。一项重要技术是去噪分数匹配（denoising score matching，DSM）[70]，它把图像去噪与学习图像分布的分数函数联系起来。基于 DSM，先前工作把深度去噪先验纳入 MCMC 表述，尤其聚焦于涉及目标分布分数函数的 Langevin 蒙特卡洛及其变体 [40, 34, 41, 66, 54]。近期基于 SGS 的方法也日益流行 [53, 19, 6, 27, 78]。与基于优化的 PnP 方法不同，这些采样方法能生成多样解并量化解空间的不确定性。

**用扩散模型求解逆问题。** 扩散模型 [33, 63] 在图像分布建模上的卓越表现使其成为求解逆问题的理想图像先验。一类流行做法是利用预训练无条件模型，在推断时修改反向扩散过程以施加数据一致性 [73, 18, 17, 60, 39, 61, 62, 8, 44, 84, 58]；尽管这类方法性能可观，它们通常涉及难以在理论上论证的近似与经验驱动设计，可能导致样本分布不一致。另一类工作学习任务专用模型，以对新问题重新训练为代价取得更高精度 [4, 57, 44]。基于粒子滤波与序列蒙特卡洛的方法也被用于保证渐近一致性 [11, 23, 74]。扩散模型还被用作变分推断 [28, 47] 与即插即用图像重建 [32, 48] 的先验。

## 附录 F：更多实验结果

**F.1 合成先验实验。** 给出与正文图 4 对应的更多细节：先验均值与逐像素标准差、DPS 与 PnP-DM 的均值/标准差对比，以及真值后验、DPS 与本文方法（EDM）的逐像素标准差图与误差分布。结果显示 PnP-DM 的标准差图在幅度与空间分布上都更接近真值后验。

**F.2 线性逆问题。** 给出高斯去模糊与 4 倍超分辨的更多视觉示例（对应正文图 5 之外的情形），PnP-DM 的重建更锐利且与真值更一致。

**F.3 非线性逆问题。** 给出 CDP 重建与 Fourier 相位恢复的更多视觉示例，包括 PnP-DM 对正立与旋转 180° 两种朝向的高保真重建（对应正文图 7(a) 的扩展）。

**F.4 黑洞成像。** 给出 PnP-DM 与 DPS 在模拟黑洞数据上更多视觉示例（图 18），以及 PnP-DM 在真实 M87 数据上的更多视觉示例（图 19），二者均显示 PnP-DM 样本具有清晰环结构与良好测量一致性。

**F.5 进一步分析。** 给出对退火调度 $\rho_k$ 不同衰减率 $\alpha$ 的敏感性分析（图 20 左），以及中间迭代 $x_k$、$z_k$ 的可视化与 PSNR、测量误差、不确定性的收敛曲线（图 21），表明算法在若干迭代后趋于稳定。

## 附录 G：许可证

本文列出所用全部资产的许可证。**数据：** CelebA [45]：未知；FFHQ [38]（及其所用 StyleGAN 权重与实现）、EHT 2017 数据 [21]、[64] 的模拟数据均按其原始发布条款使用；**代码/模型：** deepinv 库（BSD-3-Clause）、EHT 成像代码库（GPL-3.0）、EDM 官方实现（Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License）、预训练 DnCNN/DRUNet 去噪器（随 deepinv 提供）。其余资产的许可证见原文附录 G 的完整清单。

## NeurIPS 论文清单（Paper Checklist）

**1. 主张。** 问题：摘要与引言中的主要主张是否准确反映论文贡献与范围？回答：**[是]**。理由：我们已确保摘要与引言中的主要主张准确反映论文的贡献与范围。

**2. 局限性。** 问题：论文是否讨论作者所做工作的局限性？回答：**[是]**。理由：我们已在结论中加入关于方法局限性的段落。

**3. 理论假设与证明。** 问题：对每个理论结果，论文是否给出完整假设集与证明？回答：**[是]**。理由：我们在正文给出理论结果，并在附录给出证明。

**4. 实验结果可复现性。** 问题：论文是否充分披露复现主要实验所需信息？回答：**[是]**。理由：我们在正文与附录提供了复现主要结果所需的全部细节。

**5. 数据与代码开放获取。** 问题：论文是否提供数据与代码的开放获取及充分说明？回答：**[是]**。理由：我们提供了复现主要实验结果的代码。

**6. 实验设置/细节。** 问题：论文是否给出全部训练与测试细节（数据划分、超参数等）？回答：**[是]**。理由：我们在附录给出全部训练与测试细节。

**7. 实验统计显著性。** 问题：论文是否恰当且正确说明误差棒或其他统计显著性度量？回答：**[是]**。理由：受篇幅、时间与计算资源限制，我们在正文给出主要定量结果，并在附录说明采样与评估协议（多次随机样本、均值与标准差、逐像素 UQ 分析）。

**8. 实验计算资源。** 问题：对每个实验，论文是否提供计算资源信息？回答：**[是]**。理由：我们在附录给出计算资源（GPU 型号、运行时间、NFE）的细节。

**9. 伦理准则。** 问题：论文所做研究是否完全符合 NeurIPS 伦理准则？回答：**[是]**。理由：我们确认研究符合 NeurIPS 伦理准则。

**10. 更广泛影响。** 问题：论文是否讨论潜在正面与负面社会影响？回答：**[是]**。理由：我们在正文加入"更广泛影响"一节（原文误拼为 "Broarder Impacts"）。

**11. 防护措施。** 问题：论文是否描述为负责任地使用高风险模型而采取的防护措施？回答：**[不适用]**。理由：我们的工作不涉及有高误用风险的模型。

**12. 既有资产许可证。** 问题：论文所用资产（代码、数据、模型）的创造者或原所有者是否被正确署名，许可证是否被尊重？回答：**[是]**。理由：我们正确署名本文所用全部资产的所有者，其许可证见附录 G。

**13. 新资产。** 问题：论文引入的新资产是否有良好文档说明、文档是否准确？回答：**[是]**。理由：我们在补充材料中记录了所提供的代码。

**14. 众包与人类受试者研究。** 问题：众包实验与人类受试者研究是否遵守相关规范？回答：**[不适用]**。理由：我们的研究不涉及众包。

**15. 机构审查委员会（IRB）。** 问题：论文是否描述研究参与者（无论是否众包）可能承受的潜在风险，以及是否已获得 IRB 批准或等效审查？回答：**[不适用]**。理由：我们的研究不涉及人类受试者。

## 图注与表注

**图 1：** 所提方法 PnP-DM 在 2017 年 4 月 6 日真实 M87 黑洞数据 [21] 上做后验采样的演示。黑洞成像问题因严重噪声污染与测量稀疏而非凸且高度病态。我们的方法把真实成像系统的测量与以扩散模型形式表达的高表达力图像先验严格结合（本例中该先验用 GRMHD 黑洞模拟 [22] 的图像训练）。除视觉质量高外，我们的后验样本准确捕获 M87 黑洞的亮斑位置与环直径等关键特征。

**图 2：** 所提方法示意图。方法在施加数据一致性的似然步与利用 Split Gibbs 采样器 [71] 求解去噪后验采样问题的先验步之间交替；退火调度控制每步强度以促进高效准确采样。设计的关键在先验步：我们发现其与称为 EDM [37] 的通用扩散模型框架的关键联系，从而可轻松纳入一族最先进扩散模型作为先验，以原则性方式做后验采样而无需额外训练；方法在多种线性与非线性逆问题上表现强健。

**图 3：** 将非平稳与平稳连续时间过程解释为 PnP-DM 的 $K$ 次离散迭代的插值的概念示意（上图：非平稳过程；下图：平稳过程；沿轨迹标注似然步与带误差的先验步）。

**图 4：** 在真值后验可用的合成问题上的结果。与 DPS [17] 相比，PnP-DM 能更准确地采样真值后验（含真值先验的均值/标准差、压缩感知任务的 GT 后验与 DPS/本文方法的均值与标准差对比）。

**图 5：** 运动去模糊问题（$\sigma_y=0.05$）的视觉示例，展示各采样算法生成的一个样本（测量、DPIR、DPS、PnP-SGS、PnP-DM(VE)、PnP-DM(EDM) 与真值）。

**图 6：** 运动去模糊的不确定性量化（UQ）比较。左三列：绝对误差 $|\bar x-x|$、标准差（std）与绝对 z 分数 $|\bar x-x|/\mathrm{std}$（离群像素标红）；右列：$|\bar x-x|$ 与 std 的散点图。PnP-DM 的 UQ 表现更好：离群比例最低，同时避免高估逐像素标准差。

**图 7：** Fourier 相位恢复问题的结果。(a) PnP-DM 能对正立与旋转两种朝向都给出高保真重建（前向模型对 180° 旋转不变导致两个模态），基线则不能；(b) 对一张测试图像 90 次运行中正立与旋转重建的百分比（正立 81.1%、旋转 18.9%）。

**图 8：** 非线性且严重病态的黑洞成像问题的结果。(a) 问题示意（$u$-$v$ 覆盖：红框为可测得低频谱区域，黑线为实际稀疏采样；右下为从完整采样低频重建的参考）；(b) PnP-DM 与条件扩散基线 DPS 的比较，每张样本标注量化测量失配的指标（理想测量拟合应在 2 左右）。PnP-DM 样本呈两个清晰模态、细节锐利且环结构一致，而 DPS 样本环尺寸不一致、有时完全无法捕获黑洞结构且测量拟合差。

**图 9：** 用于训练黑洞扩散模型先验的数据集示例图像。

**图 10：** 本文方法与 DPS 的比较（补充可视化）。

**图 11：** 本文方法与基线在高斯去模糊问题上的视觉比较。

**图 12–14：** 高斯去模糊、运动去模糊与 4 倍超分辨的更多视觉示例。

**图 15：** 本文方法与基线在编码衍射图样问题上的视觉比较。

**图 16–17：** Fourier 相位恢复问题的更多视觉示例。

**图 18：** PnP-DM 与 DPS 在模拟黑洞数据上的更多视觉示例。

**图 19：** PnP-DM 在真实 M87 黑洞数据上的更多视觉示例。

**图 20：** 对退火调度 $\rho_k$ 不同衰减率 $\alpha$ 的敏感性分析。

**图 21：** 中间迭代 $x_k$、$z_k$ 的可视化与 PSNR、测量误差等的收敛曲线。

**表 1：** 三个含噪线性逆问题在 100 张 FFHQ 彩色测试图像上的定量比较（粗体最优、下划线次优；逐格见正文表 1）。

**表 2：** 两个含噪非线性逆问题在 100 张 FFHQ 灰度测试图像上的定量评估（粗体最优、下划线次优；逐格见正文表 2）。

**表 3：** PnP-DM 似然步超参数（逐格见附录 C.1）。

**表 4：** PnP-DM 中 $\rho$ 退火调度的超参数（逐格见附录 C.3）。

**表 5：** PnP-DM 与其他基线方法的计算效率比较（逐格见附录 C.3）。

## 表 1（正文表 1 逐格）

**FFHQ 彩色测试图像上三个含噪线性逆问题的定量比较（100 张；粗体最优、下划线次优）**

| 方法 | 高斯去模糊 PSNR↑ | 高斯去模糊 SSIM↑ | 高斯去模糊 LPIPS↓ | 运动去模糊 PSNR↑ | 运动去模糊 SSIM↑ | 运动去模糊 LPIPS↓ | 超分辨(4×) PSNR↑ | 超分辨(4×) SSIM↑ | 超分辨(4×) LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|
| PnP-ADMM [13] | 26.88 | 0.7855 | 0.3472 | 26.55 | 0.7655 | 0.3600 | 26.61 | 0.7634 | 0.3766 |
| DPIR [80] | 28.74 | 0.8348 | 0.2677 | 29.97 | 0.8529 | 0.2404 | 28.75 | 0.8378 | 0.2577 |
| DDRM [39] | 27.05 | 0.7819 | 0.2570 | – | – | – | 29.47 | **0.8437** | 0.2322 |
| DPS [17] | 28.83 | 0.8212 | 0.2330 | 27.87 | 0.8035 | 0.2542 | 29.45 | 0.8379 | 0.2274 |
| PnP-SGS [19] | 27.46 | 0.8356 | 0.2445 | 28.98 | 0.8447 | 0.2190 | 28.30 | 0.8349 | 0.2160 |
| DPnP [78] | 29.24 | 0.8360 | 0.2098 | 30.21 | 0.8527 | 0.2010 | 29.32 | 0.8407 | 0.2127 |
| PnP-DM (VP) | 29.46 | 0.8215 | 0.2202 | 30.06 | 0.8336 | 0.2099 | 29.40 | 0.8238 | 0.2219 |
| PnP-DM (VE) | 29.65 | **0.8399** | **0.2090** | **30.38** | **0.8547** | **0.1971** | 29.57 | 0.8431 | **0.2108** |
| PnP-DM (iDDPM) | 29.60 | 0.8383 | 0.2203 | 30.26 | 0.8507 | 0.2103 | 29.53 | 0.8404 | 0.2213 |
| PnP-DM (EDM) | **29.66** | **0.8411** | 0.2170 | 30.35 | **0.8547** | 0.2062 | **29.60** | 0.8435 | 0.2191 |

## 表 2（正文表 2 逐格）

**FFHQ 灰度测试图像上两个含噪非线性逆问题的定量评估（100 张；粗体最优、下划线次优）**

| 方法 | CDP PSNR↑ | CDP SSIM↑ | CDP LPIPS↓ | Fourier PR PSNR↑ | Fourier PR SSIM↑ | Fourier PR LPIPS↓ |
|---|---|---|---|---|---|---|
| HIO [29] | – | – | – | 20.66 | 0.4308 | 0.6469 |
| DPS [17] | **33.43** | 0.9049 | **0.1374** | 23.60 | 0.6804 | 0.3126 |
| PnP-SGS [19] | 32.19 | 0.8889 | 0.2010 | 15.36 | 0.3659 | 0.5730 |
| DPnP [78] | 32.19 | 0.8853 | 0.2000 | 29.28 | 0.8397 | 0.2180 |
| PnP-DM (VP) | 32.91 | 0.8846 | 0.1906 | 30.36 | 0.8553 | 0.2115 |
| PnP-DM (VE) | 33.13 | 0.8971 | 0.1663 | 29.88 | 0.8464 | 0.2186 |
| PnP-DM (iDDPM) | 33.35 | **0.9083** | 0.1471 | 30.61 | 0.8718 | 0.1975 |
| PnP-DM (EDM) | 33.25 | 0.9050 | 0.1386 | **31.14** | **0.8731** | 0.2024 |

> **原文说明（疑点加注）：** （1）原文第 4.2 节称基线条件 DM 为 "DDRM [39], DPS [18]"，但表 1/表 2 与正文其余处引用 DPS 为 [17]，[18] 实为 "Score-based diffusion models for accelerated mri"——此处引用编号存在不一致，本页按原文表述保留并在表格中标为 [17]（与正文公式与讨论一致）。（2）正文第 4.2 节误写 "We especially RED-diff [35]"（漏动词），附录清单第 10 项把 "Broader Impacts" 误拼为 "Broarder Impacts"——均为原文笔误，本页按语义译出。（3）表 1 中 DDRM 在运动去模糊下无结果（原文记作 "–"），因为该基线不适用于此设置；表 2 中 HIO 仅用于 Fourier 相位恢复。

**本页范围与校对状态：** 本页为 NeurIPS 2024 会议论文集版（本地 PDF 39 页）的全文中文译稿：摘要、正文第 1–5 节（含 2、3.1–3.4、4.1–4.3）、结论/局限性/更广泛影响、致谢、参考文献 [1]–[84]、附录 A–G（A.1–A.3 含命题 A.2、A.3、引理 A.4、定理 3.1 证明要点、命题 A.5；B；C.1–C.3 含算法 2、式 (23)–(29)、表 3–5；D 基线细节；E 更多相关工作；F.1–F.5 结果概述；G 许可证）以及 NeurIPS 论文清单 15 项。公式编号沿用原文 (1)–(9)、(12)–(15)、(18)–(20)、(23)–(29) 等已译出部分；原文中间编号式（如插值过程与 Euler 离散的若干中间式）未逐一复现，附录 F 各小节的图内数值内容以概述方式呈现并在页内标注。**表 1、表 2、表 3、表 5 已用 PDF 第 7、9、22、25 页渲染图逐行逐格核对**；表 4 依据原 PDF 第 24 页抽取文本转录（数值结构简单，未单独渲染核对）。**页首"许可待核验、仅学习用途、不计入可公开全文统计"说明保持原文不变**，另在页首加"许可与使用说明"段引用原说明。图内图像/曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文存在引用编号不一致与两处笔误，已在"原文说明（疑点加注）"中如实标出。骨架"版本"行保留会议论文集版本与许可待核表述，仅补全作者为 Zihui Wu、Yu Sun、Yifan Chen、Bingliang Zhang、Yisong Yue、Katherine L. Bouman；title 未改。
{% endraw %}
