---
layout: page
title: "可证明收敛的即插即用拟牛顿方法｜中文全文译文"
permalink: /papers/translations/2026-10-02-2303-07271-provably-convergent-plug-and-play-quasi-newton-methods/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3338a24ceb5e8eb5/) · [原文 arXiv](https://arxiv.org/abs/2303.07271) · [全部目录](/papers/catalog/)

# 可证明收敛的即插即用拟牛顿方法

**原题：** Provably Convergent Plug-and-Play Quasi-Newton Methods  
**作者：** Hong Ye Tan\*、Subhadip Mukherjee\*†、Junqi Tang\*‡、Carola-Bibiane Schönlieb\*  
**单位：** \* 英国剑桥大学应用数学与理论物理系（DAMTP, University of Cambridge）；† 英国巴斯大学计算机科学系与印度理工学院克勒格布尔分校电子与电气通信工程系；‡ 英国伯明翰大学数学学院。  
**版本：** arXiv:2303.07271v4（math.OC），v4 日期 2023 年 11 月 13 日；原文 41 页（含附录 A–B）。  
**范围与状态：** 全文中文译稿：摘要、关键词、MSC 分类号、第 1–5 节正文与编号小节、致谢、图 1–10 中文图注、表 1–5 逐格转写、附录 A–B、参考文献 78 条（按原编号）。逐句逐式终校未做。

## 摘要

即插即用（Plug-and-Play，PnP）方法是一类高效的迭代方法，旨在把数据保真项与深度去噪器结合，使用经典优化算法（如 ISTA 或 ADMM）求解，应用于逆问题与成像。可证明的 PnP 方法是具有收敛保证的 PnP 方法子类，例如不动点收敛，或收敛到某个能量函数的临界点。许多现有的可证明 PnP 方法对去噪器或保真函数施加了很重的限制，例如分别要求非扩张性或严格凸性。本文提出一种新的算法途径，把拟牛顿步纳入基于近端去噪器的可证明 PnP 框架，从而在对去噪器保持较轻假设的同时显著加速收敛。通过把去噪器刻画为弱凸函数的近端算子，我们证明所提拟牛顿 PnP 算法的不动点是某个弱凸函数的临界点。在图像去模糊与超分辨率上的数值实验表明，与具有相似重建质量的其他可证明 PnP 方法相比，收敛速度快 2–8 倍。

**关键词：** 即插即用、逆问题、拟牛顿方法、图像重建  
**MSC 分类号：** 49M15, 49J52, 65K15

## 1. 引言

许多图像复原问题可表述为从含噪测量 $\mathbf y=\mathbf A\mathbf x+\boldsymbol\varepsilon\in\mathbb R^m$ 中重建数据 $\mathbf x\in\mathbb R^n$，其中 $\mathbf A$ 是线性前向算子，$\boldsymbol\varepsilon$ 是某种测量噪声。求解该问题的一种常见方式是变分表述

$$
\arg\min_{\mathbf x\in\mathbb R^n}\ \varphi(\mathbf x)=f(\mathbf x)+g(\mathbf x), \tag{1.1}
$$

其中 $f:\mathbb R^n\to\mathbb R$ 通常是连续可微的数据保真项，$g:\mathbb R^n\to\mathbb R$ 是控制先验的正则项。在许多情形中，保真项包含前向算子 $\mathbf A:\mathbb R^n\to\mathbb R^m$，它可能对应模糊算子或 Radon 变换等物理算子 [28]。对含加性白噪声 $\boldsymbol\varepsilon\sim\mathcal N(\mathbf 0,\sigma^2\mathbf I)$ 的含噪测量 $\mathbf y=\mathbf A\mathbf x+\boldsymbol\varepsilon$，保真项取负对数似然形式 $f(\mathbf x)=\|\mathbf A\mathbf x-\mathbf y\|^2/(2\sigma^2)$。对许多物理前向算子（如模糊或下采样），优化问题 $\min_{\mathbf x}f(\mathbf x)$ 是不适定的，因此需要正则项 [36]。经典的正则化例子包括在自然图像上使用 Fourier 谱（谱正则化）或全变差（total variation，TV）正则化 [62, 63]，而近期工作则致力于学习神经网络正则器 [44, 49]。

完全数据驱动的方法已被证明优于显式定义的正则器 [77, 76, 49]。然而，这些学习方案的输出往往并不对应形如 (1.1) 的闭式最小化问题。这在医学成像等要求可解释性的敏感应用中尤其受限 [73, 72]。近期一系列工作考虑把迭代算法与通用去噪器结合，代表性例子包括去噪正则化（regularization by denoising，RED）[17, 58]、共识均衡（consensus equilibrium）[12] 以及深度均值漂移先验 [2]。本文聚焦以去噪器替代近端步而产生的即插即用（PnP）方法。在对保真项与去噪器的某些条件（详见第 1.2 节）下，某些 PnP 方法的不动点收敛可以建立，并由相应泛函的临界点刻画。

把正则化近端步替换为去噪器的 PnP 框架在去噪器选择上是灵活的。特别地，它既允许使用 NLM 或 BM3D 等经典去噪器 [11, 18]，也允许使用数据驱动去噪器 [78, 77, 64]。这使高斯去噪器的用途可扩展到其他图像重建任务，例如超分辨率或图像去块。近期，基于半二次分裂的 PnP 方法借助一种称为 DRUNet 的可变强度高斯去噪器 [78]，在图像重建上取得了最先进性能。该方法被称为深度即插即用图像复原（deep Plug-and-Play image restoration，DPIR），在图像去模糊、超分辨率和去马赛克等应用中仅使用单一去噪器先验就达到或优于完全学习的方法 [77]。这项工作展示了 PnP 的灵活性：一个先验可用于多种重建任务。

尽管 PnP 方法可以取得出色性能，但经验收敛并不等同于传统意义上的收敛。事实上，尽管 DPIR 只需 8 次 PnP 迭代就能取得最先进结果，却没有相应的理论结果。此外，当应用更多 PnP 迭代时 DPIR 可能发散 [32]。这可以在经验上用各种停止准则缓解，但又给"最佳重建"的定义带来额外问题。本文通过考虑可证明的 PnP 方法来回避这一点。我们用术语"可证明 PnP"指代带有某种收敛概念的 PnP 方法，例如不动点收敛，或更强的收敛到函数临界点的概念。

已提出多种加速 PnP 方法的途径，包括使用经典加速优化算法、块坐标方法、并行化与降维 [38, 23, 71, 37, 68]。在收敛到函数不动点的语境下，基于 FISTA 等加速经典方法的 PnP 理论结果在文献中尚未出现。本文提出通过引入拟牛顿步来加速收敛，同时保留相应的闭式最小化问题与相对较弱的约束，从而扩展可证明 PnP 方法的工作。

### 1.1 定义与记号

我们首先给出一些定义与记号。令 $\overline{\mathbb R}=\mathbb R\cup\{+\infty\}$ 为扩展实直线。回顾：函数 $g:\mathbb R^n\to\overline{\mathbb R}$ 称为正常的（proper），若其有效域 $\mathrm{dom}\,g=\{\mathbf x\in\mathbb R^n\mid g(\mathbf x)<+\infty\}$ 非空；称为闭的（或下半连续的），若对任意在 $\mathbb R^n$ 中收敛到 $\mathbf x$ 的序列 $\mathbf x_k\to\mathbf x$，都有 $g(\mathbf x)\le\liminf_k g(\mathbf x_k)$。

**定义 1.1.** 对给定标量 $\gamma>0$ 与正常闭凸函数 $g:\mathbb R^n\to\overline{\mathbb R}$，近端映射定义为

$$
\mathrm{prox}_{\gamma g}(\mathbf x)=\arg\min_{\mathbf u\in\mathbb R^n}\left\{g(\mathbf u)+\frac{1}{2\gamma}\|\mathbf u-\mathbf x\|^2\right\}. \tag{1.2}
$$

Moreau 包络是近端映射的值函数，定义为

$$
g_\gamma(\mathbf x)=\min_{\mathbf u\in\mathbb R^n}\left\{g(\mathbf u)+\frac{1}{2\gamma}\|\mathbf u-\mathbf x\|^2\right\}. \tag{1.3}
$$

Moreau 包络与近端算子的性质在经典文献中有详细记载 [59, 7, 48, 27]。特别地，对正常闭凸的 $g$，近端算子是单值且非扩张的，包络函数 $g_\gamma$ 是凸的且 $C^1$，其导数为 $\nabla g_\gamma(\mathbf x)=\gamma^{-1}(\mathbf x-\mathrm{prox}_{\gamma g}(\mathbf x))$。

### 1.2 即插即用方法

即插即用（PnP）框架最早由 Venkatakrishnan 等人于 2013 年提出，用于基于模型的图像重建 [74]。PnP 方法源于复合凸优化算法，其中先验正则化步与去噪步相关联。最早考虑的复合优化算法是交替方向乘子法（alternating directions method of multipliers，ADMM），一种用于最小化复合函数的经典近端分裂算法。在图像重建情形中，最大似然估计模型可以分解为复合问题。对含噪测量 $\mathbf y$ 与未知数据 $\mathbf x$，令 $p(\mathbf y|\mathbf x)$ 为条件似然，$p(\mathbf x)$ 为未知量 $\mathbf x$ 的先验。最大后验（maximum a-posteriori，MAP）估计 $\hat{\mathbf x}$ 为

$$
\hat{\mathbf x}=\arg\max_{\mathbf x}\{p(\mathbf y|\mathbf x)+p(\mathbf x)\}=\arg\min_{\mathbf x}\{f(\mathbf x;\mathbf y)+g(\mathbf x)\},
$$

其中 $f$ 是似然/保真项，$g$ 是先验/正则项。一个经典例子是加性高斯噪声下的 TV 正则化，其保真项为 $f(\mathbf x;\mathbf y)=\|\mathbf A\mathbf x-\mathbf y\|_2^2/2\sigma^2$，先验项为 $g(\mathbf x)=\lambda\|\nabla\mathbf x\|_1$ [63]。为求解一般凸 $f,g$ 的最小化问题，ADMM 等近端分裂算法考虑交替应用各自的近端算子 $\mathrm{prox}_f$、$\mathrm{prox}_g$ 或次梯度 $\partial f$、$\partial g$。PnP 的关键观察是：先验正则化步也可以解释为去噪操作 [64]。

更一般地，PnP 框架可应用于单调算子分裂方法。在轻微条件下，最小化 $f+g$ 的复合凸优化问题可以重写为单调包含问题 $0\in\partial f(\mathbf x)+\partial g(\mathbf x)$ [59, 7]。对凸 $f,g$，算子 $\partial f$ 与 $\partial g$ 是单调算子。单调算子分裂方法旨在求解包含 $0\in\partial f(\mathbf x)+\partial g(\mathbf x)$，仅使用各算子的预解式，和/或各算子自身 [7]。用凸分析术语说，这相当于用更简单的近端 $\mathrm{prox}_f$、$\mathrm{prox}_g$ 或梯度 $\nabla f$、$\nabla g$ 来分裂近端算子 $\mathrm{prox}_{f+g}$。两种常用的分裂算法是前向–后向分裂（forward-backward splitting，FBS）与 Douglas–Rachford 分裂（Douglas-Rachford splitting，DRS）[7, 21]：

$$
\text{(FBS)}\quad \mathbf x_{k+1}=\mathrm{prox}_g(\mathbf I-\nabla f)(\mathbf x_k);
$$

$$
\text{(DRS)}\quad
\begin{cases}
\mathbf x_{k+1}=\mathrm{prox}_f(\mathbf y_k),\\
\mathbf y_{k+1}=\mathbf y_k+\mathrm{prox}_g(2\mathbf x_{k+1}-\mathbf y_k)-\mathbf x_{k+1}.
\end{cases}
$$

分裂算法的一个经典应用是求解 LASSO 问题的迭代阈值收缩算法（iterative thresholding and shrinkage algorithm，ISTA），其中保真项 $f$ 是二次的，先验项为 $\ell_1$ 范数 $g(\mathbf x)=\|\mathbf x\|_1$ [19, 9]。把 PnP 框架应用于 FBS 与 DRS，用去噪器 $D_\sigma$ 替换先验近端项 $\mathrm{prox}_g$，得到 PnP-FBS 与 PnP-DRS 方法：

$$
\text{(PnP-FBS)}\quad \mathbf x_{k+1}=D_\sigma(\mathbf I-\nabla f)(\mathbf x_k);
$$

$$
\text{(PnP-DRS)}\quad
\begin{cases}
\mathbf x_{k+1}=\mathrm{prox}_f(\mathbf y_k),\\
\mathbf y_{k+1}=\mathbf y_k+D_\sigma(2\mathbf x_{k+1}-\mathbf y_k)-\mathbf x_{k+1}.
\end{cases}
$$

可证明 PnP 结果最早由 Chan 等人针对 PnP-ADMM 方案给出，在有界去噪器假设 $\|D_\sigma(\mathbf x)-\mathbf x\|\le C\sigma^2$ 下证明了不动点收敛 [15]。Ryu 等人证明了当 $f$ 强凸且去噪器残差 $D_\sigma-\mathbf I$ 具有足够小的 Lipschitz 常数时 PnP-FBS 算法的收敛性，以及在 $D_\sigma-\mathbf I$ 的 Lipschitz 常数小于 1 时 PnP-DRS 与 PnP-ADMM 的收敛性 [64]。多项工作利用单调算子理论，在"平均去噪器"假设（即存在某个 $\theta\in(0,1)$ 使 $(1-\theta)\mathbf I+\theta D_\sigma$ 非扩张）且 $f$ 具有 Lipschitz 梯度时，证明 PnP-ADMM 与 PnP-FBS 的不动点收敛 [69, 70, 29]。Cohen 等人在半压缩（demicontractive）去噪器假设（严格弱于非扩张性）且 $f$ 具有 Lipschitz 梯度时，证明了松弛 PnP-FBS 方案的不动点收敛 [17]。Sreehari 等人利用 Moreau 定理把去噪器刻画为凸函数的近端映射，在去噪器非扩张且具有对称梯度时，证明 PnP-ADMM 收敛到某个隐式定义的凸函数 [66, 48]。对非扩张线性去噪器的情形，PnP-FBS 与 PnP-ADMM 收敛到某个闭式凸优化问题的不动点 [51]。

尽管这些收敛结果很多，其中许多都对去噪器 $D_\sigma$ 施加了限制性强或难以验证的条件。Hurault 等人与 Cohen 等人不再用去噪器替换正则化近端算子 $\mathrm{prox}_g$，而是考虑对保真项使用近端算子、对正则项使用梯度步的 FBS，即 $\mathbf x_{k+1}=\mathrm{prox}_f(\mathbf I-\nabla g)(\mathbf x_k)$ [32, 16]。把正则化步替换为去噪器 $D_\sigma=\mathbf I-\nabla g_\sigma$，得到梯度步 PnP（gradient step PnP，GS-PnP）算法 $\mathbf x_{k+1}=(\mathrm{prox}_f\circ D_\sigma)(\mathbf x_k)$。利用这一参数化，他们进一步证明 GS-PnP 的不动点是某个（非凸）函数的驻点。此外，后续工作表明形如 $D_\sigma=\mathbf I-\nabla g_\sigma$ 的梯度步去噪器可以解释为近端步 $D_\sigma=\mathrm{prox}_{\phi_\sigma}$ [33]。据此，他们能够在 KL 型条件下实现迭代收敛到形如 (1.1) 的（非凸）闭式泛函的驻点。

GS-PnP 类方案要求势函数的梯度 $\nabla g_\sigma$ 具有 Lipschitz 常数 $L<1$ 的 Lipschitz 性。训练满足 Lipschitz 约束的神经网络的方法包括谱正则化、在训练中针对 Lipschitz 界的对抗训练，或基于样条的架构 [64, 46, 22, 52]。Hurault 等人考虑用谱正则化微调 DRUNet 去噪器以强制 Lipschitz 梯度条件 [33]。虽然可以在经验上表明 Lipschitz 常数局部小于 1，但没有理论保证，这可能导致偶发发散。一种可能的补救办法是把去噪器与恒等算子平均，如 [33] 所述。这相当于把去噪器 $D_\sigma=\mathbf I-\nabla g_\sigma$ 替换为松弛版本 $D_\sigma^\alpha:=(1-\alpha)\mathbf I+\alpha D_\sigma=\mathbf I-\alpha\nabla g_\sigma$，其中 $\alpha\in(0,1)$。我们可以把松弛去噪器重写为 $D_\sigma^\alpha=\mathbf I-\nabla g_\sigma^\alpha$，其中 $g_\sigma^\alpha=\alpha g_\sigma$ 具有 $\alpha L$-Lipschitz 梯度。取 $\alpha<1/L$ 就给出 $g_\sigma^\alpha$ 的适当压缩条件，从而保证相应 PnP 方案的收敛 [33, 31]。

### 1.3 拟牛顿方法

对最小化二次连续可微函数 $f:\mathbb R^n\to\mathbb R$，经典二阶方法是牛顿法 [54]：

$$
\mathbf x_{k+1}=\mathbf x_k-(\nabla^2f)^{-1}\nabla f(\mathbf x_k), \tag{1.4}
$$

其中 $\nabla^2f$ 是 $f$ 的 Hessian。这可解释为最小化局部二次近似

$$
\hat f_k(\mathbf y)=f(\mathbf x_k)+\nabla f(\mathbf x_k)^\top(\mathbf y-\mathbf x_k)+\frac12(\mathbf y-\mathbf x_k)^\top\nabla^2f(\mathbf x_k)(\mathbf y-\mathbf x_k), \tag{1.5a}
$$

$$
\mathbf x_{k+1}=\arg\min_{\mathbf y}\ \hat f_k(\mathbf y). \tag{1.5b}
$$

牛顿法在适当初始化与步长下可达到二次收敛速率 [54]。然而，Hessian 的逆可能计算代价高昂，尤其在图像处理等高维应用中。拟牛顿（quasi-Newton，qN）方法提出用逆 Hessian 的（低秩）近似替换 $(\nabla^2f)^{-1}$，著名例子包括 Broyden–Goldfarb–Fletcher–Shanno（BFGS）算法、David–Fletcher–Powell（DFP）公式与对称秩一方法（SR1）[54]。

与牛顿法一样，拟牛顿方法利用 Hessian 近似中的曲率信息加速收敛，已应用于非凸随机优化、神经网络训练与 Riemann 流形优化 [13, 30, 75]。经典理论在 Dennis–Moré 条件下给出渐近超线性收敛，该条件要求 Hessian 近似收敛到最小值处的 Hessian [20]。拟牛顿方法的非渐近收敛仍是活跃研究领域。仅在近期才证明：当目标函数强凸且梯度 Lipschitz 连续、在最小值处 Hessian Lipschitz 连续并满足协调条件时，BFGS 与 DFP 具有 $O((1/k)^{k/2})$ 的非渐近超线性收敛速率 [35, 61]。然而，即便这些条件未被显式验证，BFGS 在经验上仍然成功，包括非凸情形 [41, 42]。有趣的是，某些加速近端梯度方法可以解释为近端拟牛顿方法 [55]。

BFGS 的变体包括有限内存 BFGS（L-BFGS）、随机 BFGS、贪心 BFGS 与锐化 BFGS [43, 34, 47, 65, 60]。这些变体中，有限内存版本最适合重复迭代。标准拟牛顿方法持续用全部先前迭代点更新 Hessian 近似，导致每次迭代的计算代价线性增加。L-BFGS 则只利用最近 $m$ 个迭代点，其中 $m>1$ 是用户指定参数，通常取小于 50。此外，Hessian 无需在每次迭代中存储和/或计算，因为该方法只依赖 Hessian–向量乘积，而后者可用两个循环递推高效计算 [54]。

为把拟牛顿方法与前述 PnP 框架联系起来，我们希望考虑把牛顿型方法用于凸复合优化，并用去噪器替换近端算子。Lee 等人考虑最小化

$$
\varphi(\mathbf x)=f(\mathbf x)+g(\mathbf x), \tag{1.6}
$$

其中 $f(\mathbf x)$ 是凸 $C^1$ 函数，$g$ 是可能非光滑的凸正则器 [39]。对对称正定矩阵 $\mathbf B_k\approx\nabla^2f(\mathbf x_k)$，满足 $\mathbf x_{k+1}=\mathbf x_k+t_k\Delta\mathbf x_k$ 的近端牛顿型搜索方向 $\Delta\mathbf x_k$ 由光滑分量上局部二次近似 $\hat f_k(\mathbf y)$ 的最小化给出：

$$
\hat f_k(\mathbf y)=f(\mathbf x_k)+\nabla f(\mathbf x_k)^\top(\mathbf y-\mathbf x_k)+\frac12(\mathbf y-\mathbf x_k)^\top\mathbf B_k(\mathbf y-\mathbf x_k), \tag{1.7a}
$$

$$
\Delta\mathbf x_k=\arg\min_{\mathbf d}\ \hat\varphi_k(\mathbf x_k+\mathbf d):=\hat f_k(\mathbf x_k+\mathbf d)+g(\mathbf x_k+\mathbf d). \tag{1.7b}
$$

按 [39] 定义正定矩阵 $\mathbf B$ 的缩放近端映射：

$$
\mathrm{prox}_g^{\mathbf B}(\mathbf x):=\arg\min_{\mathbf y\in\mathbb R^n}\left\{g(\mathbf y)+\frac12\|\mathbf y-\mathbf x\|_{\mathbf B}^2\right\}, \tag{1.8}
$$

其中 $\mathbf B$-范数定义为 $\|\mathbf z\|_{\mathbf B}^2=\mathbf z^\top\mathbf B\mathbf z$。例如取 $\mathbf B$ 为单位矩阵即得到 (1.2) 定义的标准近端映射。搜索方向 (1.7b) 可用缩放近端映射写成闭式：

$$
\Delta\mathbf x_k=\mathrm{prox}_g^{\mathbf B_k}(\mathbf x-\mathbf B_k^{-1}\nabla f(\mathbf x_k))-\mathbf x_k. \tag{1.9}
$$

有了该搜索方向、适当的步长与 $\mathbf B_k$，近端牛顿型方法能达到与牛顿型方法类似的收敛速率，实现全局收敛与局部超线性收敛。虽然缩放近端映射便于此类分析，却不适合 PnP 框架。例如，若用 BFGS 型方法计算 Hessian 近似 $\mathbf B_k$，用去噪器替换 $\mathrm{prox}_g^{\mathbf B_k}$ 的朴素做法需要仔细分析 $\mathbf B_k$ 对所得正则化的影响，且可能要求去噪器依赖于 $\mathbf B_k$。因此，我们寻求一种只使用未缩放近端映射的近端牛顿型方法，可能带一个可以容易地解释为控制正则化强度的正则化参数的标量常数。

第 2 节将详述一种经典复合最小化算法，它只使用未缩放近端映射 $\mathrm{prox}_g$ 以及允许牛顿型步的任意下降步。受 GS-PnP 把去噪器刻画为弱凸函数近端映射的启发，我们进一步把经典分析从凸函数推广到弱凸函数。第 3 节利用这一推广提出 PnP 拟牛顿（PnP-quasi-Newton，PnP-qN）方法，并进一步分析收敛性与刻画算法的聚点。第 4 节用 L-BFGS 给出的拟牛顿方法评估所提 PnP-qN 方法，并与具有相当重建质量的其他可证明与不可证明 PnP 方法比较。

## 2. 近端拟牛顿

本节首先描述一种用于优化"（可能非凸的）光滑函数与（可能非光滑的）凸函数之复合和"的经典算法，然后把分析推广为以弱凸性替代凸性。通过把近端项替换为对应弱凸映射近端算子的深度去噪器，我们构造出其收敛性质与经典算法一致的即插即用方案。

我们在欧氏空间 $\mathbb R^n$ 上工作。令 $\mathcal C^{1,1}_{L_f}$ 表示具有 $L_f$-Lipschitz 梯度的 $C^1$ 函数 $f:\mathbb R^n\to\mathbb R$ 的类，$\Gamma_0$ 表示正常、闭、凸函数 $g:\mathbb R^n\to\overline{\mathbb R}$ 的类。考虑如下形式的变分目标：

$$
\varphi=f+g,\qquad f\in\mathcal C^{1,1}_{L_f},\quad g\in\Gamma_0. \tag{2.1}
$$

可把 $f$ 视为保真项、$g$ 视为正则项。逆问题中一个突出例子是二次保真损失 $f(\mathbf x;\mathbf y)=\frac12\|\mathbf A\mathbf x-\mathbf y\|^2$，其中 $\mathbf A:\mathbb R^n\to\mathbb R^m$ 是某线性前向算子、$\mathbf y\in\mathbb R^m$，范数为欧氏范数。

### 2.1 MINFBE：最小化前向–后向包络

我们首先详述用于最小化 (2.1) 的经典复合优化算法，它将作为所提 PnP 方案的基础；并描述其一些可迁移到 PnP 框架的收敛性质。通过在原始目标 $\varphi$ 周围构造光滑凸包络函数，可证明该包络具有理想性质，如与 $\varphi$ 共享最小化者、光滑性，以及被凸函数下界化与上界化。以特定方式应用下降步与近端映射，经典算法能达到全局目标收敛到临界点的 $O(1/k)$ 速率、若函数局部强凸则局部线性收敛，以及当下降步取拟牛顿步并在适当假设下超线性收敛 [67]。

对问题 (2.1)，定义如下表达式 [67]：

$$
l_\varphi(\mathbf u,\mathbf x)=f(\mathbf x)+\langle\nabla f(\mathbf x),\mathbf u-\mathbf x\rangle+g(\mathbf u), \tag{2.2a}
$$

$$
T_\gamma(\mathbf x)=\arg\min_{\mathbf u}\left\{l_\varphi(\mathbf u,\mathbf x)+\frac{1}{2\gamma}\|\mathbf u-\mathbf x\|^2\right\}=\mathrm{prox}_{\gamma g}\left(\mathbf x-\gamma\nabla f(\mathbf x)\right), \tag{2.2b}
$$

$$
R_\gamma(\mathbf x)=\gamma^{-1}\left(\mathbf x-T_\gamma(\mathbf x)\right), \tag{2.2c}
$$

$$
\varphi_\gamma(\mathbf x)=\min_{\mathbf u}\left\{l_\varphi(\mathbf u,\mathbf x)+\frac{1}{2\gamma}\|\mathbf u-\mathbf x\|^2\right\}. \tag{2.2d}
$$

这里 $l_\varphi$ 是 $\varphi$ 的局部线性化解耦；$T_\gamma$ 可解释为（对 $f+g$ 以步长 $\gamma$ 的）FBS 步；$R_\gamma$ 是缩放残差或"梯度方向"。注意 $\mathbf x=T_\gamma(\mathbf x)\Leftrightarrow\mathbf x\in\mathrm{zer}\,\partial\varphi$，即 $T_\gamma$ 的不动点对应 $\varphi$ 的临界点。$\varphi_\gamma$ 定义为 $\varphi$ 的**前向–后向包络**。我们进一步显式写出 $g$ 的 Moreau 包络：

$$
g_\gamma(\mathbf x)=\min_{\mathbf u}\left\{g(\mathbf u)+\frac{1}{2\gamma}\|\mathbf u-\mathbf x\|^2\right\} \tag{2.3a}
$$

$$
=g\left(\mathrm{prox}_{\gamma g}(\mathbf x)\right)+\frac{1}{2\gamma}\left\|\mathrm{prox}_{\gamma g}(\mathbf x)-\mathbf x\right\|^2. \tag{2.3b}
$$

有了上述定义，前向–后向包络具有如下闭式：

$$
\varphi_\gamma=f(\mathbf x)+g(T_\gamma(\mathbf x))-\gamma\langle\nabla f(\mathbf x),R_\gamma(\mathbf x)\rangle+\frac{\gamma}{2}\|R_\gamma(\mathbf x)\|^2 \tag{2.4a}
$$

$$
=f(\mathbf x)-\frac{\gamma}{2}\|\nabla f(\mathbf x)\|^2+g_\gamma\left(\mathbf x-\gamma\nabla f(\mathbf x)\right). \tag{2.4b}
$$

事实上，$\varphi_\gamma$ 具有许多理想性质，如与 $\varphi$ 共享最小化者，并具有以 $f$ 的 Hessian 表达的易计算导数。

**命题 2.1**（[67, Sec 2]）。下列结论成立：
i. $\varphi(\mathbf z)=\varphi_\gamma(\mathbf z)$ 对所有 $\gamma>0$、$\mathbf z\in\mathrm{zer}\,\partial\varphi$；
ii. $\inf\varphi=\inf\varphi_\gamma$ 且 $\arg\min\varphi\subseteq\arg\min\varphi_\gamma$，对 $\gamma\in(0,1/L_f]$；
iii. $\arg\min\varphi=\arg\min\varphi_\gamma$ 对所有 $\gamma\in(0,1/L_f)$。

若进一步假设 $f$ 是 $C^2$，则 $\varphi_\gamma$ 是 $C^1$，且其梯度可写为

$$
\nabla\varphi_\gamma(\mathbf x)=\left(\mathbf I-\gamma\nabla^2f(\mathbf x)\right)R_\gamma(\mathbf x). \tag{2.5}
$$

此外，若 $\gamma\in(0,1/L_f)$，则 $\varphi_\gamma$ 的驻点集合等于 $\mathrm{zer}\,\partial\varphi$。

假设我们能够同时计算 $\varphi_\gamma$ 与 $\varphi$，命题 2.1(i) 允许我们检查是否已收敛到 $\varphi$ 的驻点。算法 2.1 是优化非光滑复合目标 (2.1) 的经典前向–后向算法。

> **算法 2.1　MINFBE [67]**
> **Require：** $\mathbf x_0$，$\gamma_0>0$，$\xi\in(0,1)$，$\beta\in[0,1)$，$k\leftarrow0$
> 1: **if** $R_{\gamma_k}(\mathbf x_k)=\mathbf 0$ **then**
> 2: 　停止
> 3: **end if**
> 4: 选择 $\mathbf d_k$ 使 $\langle\mathbf d_k,\nabla\varphi_{\gamma_k}(\mathbf x_k)\rangle\le0$
> 5: 选择 $\tau_k\ge0$ 与 $\mathbf w_k=\mathbf x_k+\tau_k\mathbf d_k$ 使 $\varphi_{\gamma_k}(\mathbf w_k)\le\varphi_{\gamma_k}(\mathbf x_k)$
> 6: **if** $f(T_{\gamma_k}(\mathbf w_k))>f(\mathbf w_k)-\gamma_k\langle\nabla f(\mathbf w_k),R_{\gamma_k}(\mathbf w_k)\rangle+\frac{(1-\beta)\gamma_k}{2}\|R_{\gamma_k}(\mathbf w_k)\|^2$ **then**
> 7: 　$\gamma_k\leftarrow\xi\gamma_k$，转 1
> 8: **end if**
> 9: $\mathbf x_{k+1}\leftarrow T_{\gamma_k}(\mathbf w_k)$
> 10: $\gamma_{k+1}\leftarrow\gamma_k$
> 11: $k\leftarrow k+1$，转 1

在算法 2.1 中，$\xi$ 是 Armijo 回溯参数，$\beta$ 用于控制第 6 步下降条件的严格程度。对适当选择的 $\gamma$，如下引理所述，第 6 步的条件永不成立。此外，步长 $\gamma_k$ 由与 $\beta$ 和 $L_f$ 有关的常数从下方界定，这保证总可以迈出一步。

**引理 2.2**（[67, Lem 3.1]）。设 $(\gamma_k)_{k\in\mathbb N}$ 为算法 2.1 中的步长参数序列，$\gamma_\infty=\min_{i\in\mathbb N}\gamma_i$。则对所有 $k\ge0$，

$$
\gamma_k\ge\gamma_\infty\ge\min\left\{\gamma_0,\ \xi(1-\beta)/L_f\right\}.
$$

MINFBE 算法可解释为"下降步（第 5 步）后接 FBS 步（第 9 步）"。特别地，注意下降方向 $\mathbf d_k$ 不必是最速下降方向，这给算法带来更多灵活性。把这两步结合，算法获得全局收敛与局部线性收敛。该算法具有如下收敛保证。

**定义 2.3**（线性与超线性收敛）。称序列 $(\mathbf x_k)_{k\in\mathbb N}$ 收敛到 $\mathbf x^\ast$：
i. 以因子 $\omega\in[0,1)$ **Q-线性**收敛，若 $\|\mathbf x_{k+1}-\mathbf x^\ast\|\le\omega\|\mathbf x_k-\mathbf x^\ast\|$ 对所有 $k\ge0$；
ii. **Q-超线性**收敛，若 $\|\mathbf x_{k+1}-\mathbf x^\ast\|/\|\mathbf x_k-\mathbf x^\ast\|\to0$。
若 $\|\mathbf x_k-\mathbf x^\ast\|\le a_k$，其中某个序列 $(a_k)_{k\in\mathbb N}$ 使 $a_k\to0$ 为 Q-线性（Q-超线性），则称收敛为 **R-线性**（R-超线性）。

**定理 2.4**（[67, Thm 3.6, 3.7]）。假设 $f$ 凸且 $\varphi$ 强制。特别地，假设水平集 $\{\mathbf x\in\mathbb R^n\mid\varphi(\mathbf x)\le\varphi(\mathbf x_0)\}$ 具有直径 $R$，$0<R<\infty$。则由算法 2.1 生成的序列，要么 $\varphi(\mathbf x_0)-\inf\varphi\ge R^2/\gamma_0$ 且

$$
\varphi(\mathbf x_1)-\inf\varphi\le\frac{R^2}{2\gamma_0}, \tag{2.6}
$$

要么对任意 $k\in\mathbb N$ 有

$$
\varphi(\mathbf x_k)-\inf\varphi\le\frac{2R^2}{k\min\{\gamma_0,\xi(1-\beta)/L_f\}}. \tag{2.7}
$$

若进一步假设 $\mathbf x^\ast$ 是 $\varphi$ 的**强最小化者**，即存在 $\mathbf x^\ast$ 的邻域 $\mathcal N$ 与 $c>0$ 使任意 $\mathbf x\in\mathcal N$ 满足

$$
\varphi(\mathbf x)-\varphi(\mathbf x^\ast)\ge\frac{c}{2}\|\mathbf x-\mathbf x^\ast\|^2,
$$

则对足够大的 $k$，$(\varphi(\mathbf x_k))_{k\in\mathbb N}$ 与 $(\varphi_{\gamma_k}(\mathbf w_k))_{k\in\mathbb N}$ 以因子 $\omega$ Q-线性收敛到 $\varphi(\mathbf x^\ast)$，其中

$$
\omega\le\max\left\{\frac12,\ 1-\frac{c}{4}\min\{\gamma_0,\xi(1-\beta)/L_f\}\right\}\in[1/2,1),
$$

且 $(\mathbf x_k)_{k\in\mathbb N}$ R-线性收敛到 $\mathbf x^\ast$。若 $\mathbf x^\ast$ 也是 $\varphi_{\gamma_\infty}$ 的强最小化者（$\gamma_\infty$ 如引理 2.2 定义），则 $(\varphi(\mathbf w_k))_{k\in\mathbb N}$ 也 R-线性收敛到 $\mathbf x^\ast$。

在 MINFBE 中，只要目标函数下降，初始下降步 $\mathbf w_k$ 可任意选择。现在假设用拟牛顿方法选择下降方向：

$$
\mathbf d_k=-\mathbf B_k^{-1}\nabla\varphi_\gamma(\mathbf x_k).
$$

若 $\mathbf B_k$ 正定，则 $\mathbf d_k$ 是有效搜索方向。假设 $\mathbf B_k$ 满足 Dennis–Moré 条件 [54, 20]，可得迭代点的超线性收敛。

**定理 2.5**（[67, Thm 4.1]）。固定 $\gamma>0$。假设 $\nabla\varphi_\gamma$ 在驻点 $\mathbf x^\ast\in\mathrm{zer}\,\partial\varphi$ 处严格可微，且 $\nabla^2\varphi_\gamma(\mathbf x^\ast)$ 非奇异。设 $(\mathbf B_k)_{k\in\mathbb N}$ 是非奇异 $\mathbb R^{n\times n}$ 矩阵序列，并假设序列

$$
\mathbf w_k=\mathbf x_k-\mathbf B_k^{-1}\nabla\varphi_\gamma(\mathbf x_k),\qquad \mathbf x_{k+1}=T_\gamma(\mathbf w_k) \tag{2.8}
$$

收敛到 $\mathbf x^\ast$。若 $\mathbf x_k,\mathbf w_k\notin\mathrm{zer}\,\partial\varphi$ 对所有 $k\ge0$ 成立，且 Dennis–Moré 条件

$$
\lim_{k\to\infty}\frac{\left\|\left(\mathbf B_k-\nabla^2\varphi_\gamma(\mathbf x_k)\right)(\mathbf w_k-\mathbf x_k)\right\|}{\|\mathbf w_k-\mathbf x_k\|}=0 \tag{2.9}
$$

成立，则 $(\mathbf x_k)_{k\in\mathbb N}$ 与 $(\mathbf w_k)_{k\in\mathbb N}$ Q-超线性收敛到 $\mathbf x^\ast$。

若 $\mathbf B_k$ 按 BFGS 更新步更新，则在前一定理中的更新在 $\varphi$ 的一些附加假设下（如 $\varphi$ 凸且具有强局部最小值 $\mathbf x^\ast$，或在聚点 $\omega(\mathbf x_0)$ 处满足更强的 Kurdyka–Łojasiewicz 性质）超线性收敛到最小值 [67, Thm 4.3]。此外可以证明，对足够大的 $k$，$\tau_k=1$ 是有效步长。为完整起见，下面给出 BFGS 更新步。注意通常更实用的是更新逆 Hessian 近似 $\mathbf H_k=\mathbf B_k^{-1}$ [54]。

$$
\mathbf s_k=\mathbf w_k-\mathbf x_k,\qquad \mathbf y_k=\nabla\varphi_\gamma(\mathbf w_k)-\nabla\varphi_\gamma(\mathbf x_k), \tag{2.10a}
$$

$$
\mathbf B_{k+1}=
\begin{cases}
\mathbf B_k+\dfrac{\mathbf y_k\mathbf y_k^\top}{\mathbf y_k^\top\mathbf s_k}-\dfrac{\mathbf B_k\mathbf s_k(\mathbf B_k\mathbf s_k)^\top}{\mathbf s_k^\top\mathbf B_k\mathbf s_k}, & \text{若 }\langle\mathbf s_k,\mathbf y_k\rangle>0,\\[10pt]
\mathbf B_k & \text{否则},
\end{cases} \tag{2.10b}
$$

$$
\mathbf H_{k+1}=
\begin{cases}
\left(\mathbf I-\dfrac{\mathbf s_k\mathbf y_k^\top}{\mathbf y_k^\top\mathbf s_k}\right)\mathbf H_k\left(\mathbf I-\dfrac{\mathbf y_k\mathbf s_k^\top}{\mathbf y_k^\top\mathbf s_k}\right)+\dfrac{\mathbf s_k\mathbf s_k^\top}{\mathbf y_k^\top\mathbf s_k}, & \text{若 }\langle\mathbf s_k,\mathbf y_k\rangle>0,\\[12pt]
\mathbf H_k & \text{否则}.
\end{cases} \tag{2.10c}
$$

### 2.2 弱凸推广

现在假设 $g$ 不是凸的，而是 $M$-弱凸的。回顾：函数 $g(\mathbf x)$ 是 $M$-弱凸的，若 $g+M\|\mathbf x\|^2/2$ 凸。对 $M$-弱凸函数 $g$，对所有 $\mathbf x$、$\mathbf y$ 与 $\mathbf z\in\partial g(\mathbf y)$（其中 $\partial g$ 表示 $g$ 的 Clarke 次微分）有

$$
g(\mathbf x)\ge g(\mathbf y)+\langle\mathbf z,\mathbf x-\mathbf y\rangle-\frac{M}{2}\|\mathbf x-\mathbf y\|^2, \tag{2.11a}
$$

$$
g(t\mathbf x+(1-t)\mathbf y)\le tg(\mathbf x)+(1-t)g(\mathbf y)+\frac{M}{2}t(1-t)\|\mathbf x-\mathbf y\|^2. \tag{2.11b}
$$

在下面第 3 节中，我们将把所提去噪器 $D_\sigma=\mathrm{prox}_{\phi_\sigma}$ 建模为弱凸函数的近端算子。特别地，具有压缩 $\nabla g_\sigma$ 的梯度步去噪器 $D_\sigma=\mathbf I-\nabla g_\sigma$ 是弱凸函数的近端算子 [31]。我们也可把经典凸分析推广到该情形，只是允许的 $\gamma$ 更小。

为把前节结果迁移到 $g$ 弱凸的情形，需要验证 MINFBE 迭代点处的函数值非增。如下命题所示，只要 $\gamma$ 足够小，这仍然成立。前向–后向包络的许多性质仍然成立，且我们仍能在 Dennis–Moré 条件 (2.9) 下获得全局收敛与超线性局部收敛。

**命题 2.6.** 对所有 $\mathbf x\in\mathbb R^n$、$\gamma>0$：
i. $\varphi_\gamma(\mathbf x)\le\varphi(\mathbf x)-\dfrac{\gamma-M\gamma^2}{2}\|R_\gamma(\mathbf x)\|^2$；
ii. $\varphi(T_\gamma(\mathbf x))\le\varphi_\gamma(\mathbf x)-\dfrac{\gamma}{2}(1-\gamma L_f)\|R_\gamma(\mathbf x)\|^2$ 对所有 $\gamma>0$；
iii. $\varphi(T_\gamma(\mathbf x))\le\varphi_\gamma(\mathbf x)$ 对所有 $\gamma\in(0,1/L_f]$。

**证明.** (i). 由 (2.2b) 的最优性条件，有 $R_\gamma(\mathbf x)-\nabla f(\mathbf x)\in\partial g(T_\gamma(\mathbf x))$。由 (2.11a)，

$$
\begin{aligned}
g(\mathbf x)&\ge g(T_\gamma(\mathbf x))+\langle R_\gamma(\mathbf x)-\nabla f(\mathbf x),\mathbf x-T_\gamma(\mathbf x)\rangle-\frac{M}{2}\|\mathbf x-T_\gamma(\mathbf x)\|^2\\
&=g(T_\gamma(\mathbf x))-\gamma\langle\nabla f(\mathbf x),R_\gamma(\mathbf x)\rangle+\gamma\|R_\gamma(\mathbf x)\|^2-\frac{M\gamma^2}{2}\|R_\gamma(\mathbf x)\|^2.
\end{aligned}
$$

两边加 $f(\mathbf x)$ 并应用 (2.4a) 即得结论。
(ii)、(iii). 证明与 [67, Prop 2.2] 相同，只需 $\nabla f$ 的 Lipschitz 凸性。

**命题 2.7.** 假设 $\gamma-M\gamma^2\ge0$，或等价地 $\gamma\in[0,1/M]$。则下列成立：
i. $\varphi_\gamma(\mathbf z)=\varphi(\mathbf z)$ 对所有 $\mathbf z\in\mathrm{zer}\,\partial\varphi$；
ii. $\inf\varphi=\inf\varphi_\gamma$ 且 $\arg\min\varphi\subseteq\arg\min\varphi_\gamma$，对 $\gamma\in(0,1/L_f]$；
iii. $\arg\min\varphi=\arg\min\varphi_\gamma$，对 $\gamma\in(0,1/L_f)$。
**证明.** (i). 命题 2.6(i) 与条件 $\gamma-M\gamma^2\ge0$ 结合给出 $\varphi_\gamma(\mathbf x)\le\varphi(\mathbf x)$。若 $\mathbf z\in\mathrm{zer}\,\partial\varphi$，则 $\mathbf z=T_\gamma(\mathbf z)$，命题 2.6(ii) 化为 $\varphi(\mathbf z)\le\varphi_\gamma(\mathbf z)$。(ii)、(iii) 与 [67, Prop 2.3] 相同。

对弱凸函数，我们仍能给出 $\gamma$ 的下界，使算法 2.1 第 6 步的条件不成立，从而无需减小步长。证明只依赖 $\nabla f$ 的 Lipschitz 常数，不要求 $g$ 的凸性。然而该结论要求 $\gamma-M\gamma^2\ge0$。实践中，我们使用的去噪器有 $M<1/2$，这允许任意 $\gamma\in(0,1)$。

**引理 2.8.** 假设 $g$ 弱凸。若 $0<\gamma<\min\{(1-\beta)/L_f,1/M\}$，则算法 2.1 第 6 步的条件永不成立。此外，这意味着 MINFBE 迭代满足 $\gamma_k\ge\gamma_\infty\ge\min\{\gamma_0,\xi(1-\beta)/L_f,1/M\}>0$ 对所有 $k$ 成立。
**证明.** 假设 $0<\gamma<\min\{(1-\beta)/L_f,1/M\}$，并反设第 6 步条件成立。则存在某 $\mathbf w$ 使

$$
f(T_\gamma(\mathbf w))>f(\mathbf w)-\gamma\langle\nabla f(\mathbf w),R_\gamma(\mathbf w)\rangle+\frac{(1-\beta)\gamma}{2}\|R_\gamma(\mathbf w_k)\|^2.
$$

两边加 $g(T_\gamma(\mathbf w))$ 并考虑 (2.4a)，化为

$$
\varphi(T_\gamma(\mathbf w))>\varphi_\gamma(\mathbf w)-\frac{\beta\gamma}{2}\|R_\gamma(\mathbf w)\|^2.
$$

但由命题 2.6(ii)，我们还有

$$
\varphi(T_\gamma(\mathbf w))\le\varphi_\gamma(\mathbf w)-\frac{\gamma}{2}(1-\gamma L_f)\|R_\gamma(\mathbf w)\|^2\le\varphi_\gamma(\mathbf w)-\frac{\beta\gamma}{2}\|R_\gamma(\mathbf w)\|^2,
$$

第二个不等式由 $\gamma<(1-\beta)/L_f$ 得出，矛盾。第二部分成立是因为 $(\gamma_k)_{k\in\mathbb N}$ 是非增序列。

**注 2.9.** 尽管上述引理的证明并不严格需要 $\gamma<1/M$，但该要求在后续结果的收敛性中需要。

下一定理刻画泛函 $\varphi$ 的收敛性，依赖算法 2.1 第 5 步的非增条件。这是 [67, Prop 3.4] 的类似物。

**定理 2.10.** 假设 $0<\gamma_0<1/M$。则 MINFBE 迭代满足：
i. $\varphi(\mathbf x_{k+1})\le\varphi(\mathbf x_k)-\dfrac{\beta\gamma_k}{2}\|R_{\gamma_k}(\mathbf w_k)\|^2-\dfrac{\gamma_k-M\gamma_k^2}{2}\|R_{\gamma_k}(\mathbf x_k)\|^2$；
ii. 要么序列 $\|R_{\gamma_k}(\mathbf x_k)\|$ 平方可和，要么 $\varphi(\mathbf x_k)\to\inf\varphi=-\infty$ 且序列 $(\mathbf x_k)_{k\in\mathbb N}$ 的聚点集 $\omega(\mathbf x_0)$ 为空；
iii. $\omega(\mathbf x_0)\subseteq\mathrm{zer}\,\partial\varphi$；
iv. 若 $\beta>0$，则要么序列 $\|R_{\gamma_k}(\mathbf w_k)\|$ 平方可和且 $(\mathbf w_k)_{k\in\mathbb N}$ 的每个聚点都是临界点，要么 $\varphi_{\gamma_k}(\mathbf w_k)\to\inf\varphi=-\infty$ 且 $(\mathbf w_k)_{k\in\mathbb N}$ 无聚点。
**证明.** (i). 回顾 $\mathbf x_{k+1}=T_{\gamma_k}(\mathbf w_k)$，

$$
\begin{aligned}
\varphi(\mathbf x_{k+1})&\le\varphi_{\gamma_k}(\mathbf w_k)-\frac{\beta\gamma_k}{2}\|R_{\gamma_k}(\mathbf w_k)\|^2\\
&\le\varphi_{\gamma_k}(\mathbf x_k)-\frac{\beta\gamma_k}{2}\|R_{\gamma_k}(\mathbf w_k)\|^2 \tag{2.12}
\end{aligned}
$$

$$
\le\varphi(\mathbf x_k)-\frac{\beta\gamma_k}{2}\|R_{\gamma_k}(\mathbf w_k)\|^2-\frac{\gamma_k-M\gamma_k^2}{2}\|R_{\gamma_k}(\mathbf x_k)\|^2, \tag{2.13}
$$

其中第一、第二个不等式分别来自算法 2.1 的第 6、5 步，最后的不等式是命题 2.6(i)。
(ii)–(iv). 我们沿用 [67] 并作少量修改。令 $\varphi^\ast=\lim_{k\to\infty}\varphi(\mathbf x_k)$，由 (i) 与 $\gamma_k-M\gamma_k^2\ge0$ 知 $(\varphi(\mathbf x_k))_{k\in\mathbb N}$ 单调，故该极限存在。若 $\varphi^\ast=-\infty$，则 $\inf\varphi=-\infty$。由 $\varphi$ 的正常性与下半连续性以及 $\varphi(\mathbf x_k)$ 的单调性，$(\mathbf x_k)_{k\in\mathbb N}$ 无聚点。若 $\varphi^\ast>-\infty$，对 (2.13) 望远镜求和得

$$
\frac12\sum_{i=0}^k\gamma_i\left(\beta\|R_{\gamma_i}(\mathbf w_i)\|^2+(1-\gamma_iM)\|R_{\gamma_i}(\mathbf x_i)\|^2\right)\le\varphi(\mathbf x_0)-\varphi(\mathbf x_{k+1})\le\varphi(\mathbf x_0)-\varphi^\ast. \tag{2.14}
$$

由引理 2.8，$\gamma_k$ 一致有下界，故 $\|R_{\gamma_k}(\mathbf x_k)\|$ 平方可和，得 (ii)。
由平方可和性，$R_{\gamma_k}(\mathbf x_k)\to0$。此外，对足够大的 $k$，函数 $R_{\gamma_k}=R_{\gamma_\infty}$ 为常数，且由近端算子与 $\nabla f$ 的连续性知 $R_{\gamma_\infty}$ 连续。因此，任何聚点 $\mathbf z\in\omega(\mathbf x_k)$ 都有 $R_{\gamma_\infty}(\mathbf x_{k_j})\to R_{\gamma_\infty}(\mathbf z)=\mathbf 0$ 对某子列 $\mathbf x_{k_j}\to\mathbf z$ 成立。于是 $\mathbf z=T_{\gamma_\infty}(\mathbf z)\Rightarrow\mathbf z\in\mathrm{zer}\,\partial\varphi$，得 (iii)。
若 $\beta>0$，对足够大的 $k$ 使 $\gamma_k=\gamma_\infty$，如下不等式链成立：

$$
\varphi_{\gamma_k}(\mathbf w_{k+1})\le\varphi_{\gamma_k}(\mathbf x_{k+1})=\varphi_{\gamma_k}(T_k(\mathbf w_k))\le\varphi_{\gamma_k}(\mathbf w_k). \tag{2.15}
$$

第一个不等式来自第 5 步，等式来自第 9 步，最后的不等式来自命题 2.6。$\varphi_{\gamma_k}(\mathbf w_k)$ 对足够大 $k$ 的单调性允许对 $\mathbf w_k$ 序列作类似论证，得 (iv)。

收敛结果也可推广到弱凸情形。特别地，下一定理给出各步之间残差的收敛性。

**定理 2.11**（全局残差收敛）。假设 $0<\gamma_0\le1/(2M)$，令 $c=\min\{\gamma_0,\xi(1-\beta)/L_f,1/M\}>0$ 为 $\gamma_\infty$ 的下界。则 MINFBE 迭代满足

$$
\min_{i\le k}\|R_{\gamma_i}(\mathbf x_i)\|^2\le\frac{2}{k+1}\cdot\frac{\varphi(\mathbf x_0)-\inf\varphi}{c-Mc^2}. \tag{2.16}
$$

若进一步 $\beta>0$，则还有

$$
\min_{i\le k}\|R_{\gamma_i}(\mathbf w_i)\|^2\le\frac{2}{k+1}\cdot\frac{\varphi(\mathbf x_0)-\inf\varphi}{\beta c}. \tag{2.17}
$$

**证明.** 与 [67, Thm 3.5] 相同。若 $\inf\varphi=-\infty$ 则无须证明，故假设 $\inf\varphi>-\infty$。考虑 (2.14) 与 $(\gamma_k)_{k\in\mathbb N}$ 非增，得

$$
(k+1)\frac{\gamma_k-M\gamma_k^2}{2}\min_{i\le k}\|R_{\gamma_i}(\mathbf x_i)\|^2+(k+1)\frac{\beta\gamma_k}{2}\min_{i\le k}\|R_{\gamma_i}(\mathbf w_i)\|^2\le\varphi(\mathbf x_0)-\inf\varphi. \tag{2.18}
$$

注意 $\gamma-M\gamma^2$ 在 $\gamma<1/(2M)$ 时递增，故 $\gamma_k-M\gamma_k^2$ 由 $c-Mc^2>0$ 从下方界定。重排即得两个不等式。

要获得与定理 2.4 类似的目标准则收敛，仅有 $g$ 弱凸还不够。我们可以转而利用 KL 性质，这是包括半代数函数 [4] 在内的很大一类函数所满足的有用且一般的性质。此外，它可用于在没有凸性等其他正则条件时证明收敛 [5, 10, 33]。

**定义 2.12**（KL 性质 [5, 10]）。设 $\varphi:\mathbb R^n\to\overline{\mathbb R}$ 正常且下半连续。称 $\varphi$ 在点 $\mathbf x^\ast\in\mathrm{dom}\,\partial\varphi$ 处满足 Kurdyka–Łojasiewicz（KL）性质，若存在 $\eta\in(0,+\infty]$、$\mathbf x^\ast$ 的邻域 $U$ 以及连续凹函数 $\Psi:[0,\eta)\to[0,+\infty)$，使得：
1. $\Psi(0)=0$；
2. $\Psi$ 在 $(0,\eta)$ 上是 $C^1$；
3. $\Psi'(s)>0$ 对 $s\in(0,\eta)$；
4. 对所有 $\mathbf u\in U\cap\{\varphi(\mathbf x^\ast)<\varphi(\mathbf u)<\varphi(\mathbf x^\ast)+\eta\}$，有 $\Psi'(\varphi(\mathbf u)-\varphi(\mathbf x^\ast))\,\mathrm{dist}(\mathbf 0,\partial\varphi(\mathbf u))\ge1$。

若 $\varphi$ 在 $\mathrm{dom}\,\partial\varphi$ 的每一点都满足 KL 性质，则称 $\varphi$ 为 KL 函数。

利用 KL 性质，我们能证明 MINFBE 生成的迭代点足够良态，从而收敛。此外，由定理 2.10 知迭代点收敛到非凸目标 $\varphi$ 的临界点。在 PnP 方案下，这对应收敛到由去噪器决定的某个函数的临界点。

**定理 2.13.** 假设 $f$ 满足 KL 条件、$g$ 半代数，且 $f$ 与 $g$ 都有下界。进一步假设存在常数 $\bar\tau,c>0$ 使 $\tau_k<\bar\tau$、$\|\mathbf d_k\|\le c\|R_{\gamma_k}(\mathbf x_k)\|$、$\beta>0$，并假设 $\varphi$ 强制或具有紧水平集。则迭代序列 $(\mathbf x_k)_{k\in\mathbb N}$ 要么有限并在 $R_{\gamma_k}(\mathbf x_k)=\mathbf 0$ 处终止，要么收敛到 $\varphi$ 的临界点。
**证明.** 见补充材料。证明与 [67, Thm 3.9, Appendix 4] 非常相似。

使用 MINFBE 方法的关键在于我们能把牛顿型步纳入迭代。由于由前一定理能够获得临界点收敛，我们就可以应用下一定理来证明在最小化者邻域内的超线性收敛。

**定理 2.14.** 假设 $f$ 连续可微且具有 $L_f$-Lipschitz 梯度，$g$ 是 $M$-弱凸的。令 $\gamma=\gamma_\infty$ 如引理 2.8。假设搜索方向选为

$$
\mathbf d_k=-\mathbf B_k^{-1}\nabla\varphi_\gamma(\mathbf x_k),
$$

第 5 步的步长优先取 $\tau_k=1$ 尝试，且 $\mathbf B_k$ 满足 Dennis–Moré 条件 (2.9)。进一步假设迭代点 $(\mathbf x_k)_{k\in\mathbb N}$、$(\mathbf w_k)_{k\in\mathbb N}$ 收敛到临界点 $\mathbf x^\ast$，且在该点 $\nabla\varphi_\gamma$ 连续可微、$\nabla^2\varphi_\gamma(\mathbf x^\ast)\succ0$。则 $(\mathbf x_k)_{k\in\mathbb N}$ 与 $(\mathbf w_k)_{k\in\mathbb N}$ Q-超线性收敛到 $\mathbf x^\ast$。
**证明.** 证明与 [67, Thm 4.1] 几乎相同。若 $\gamma g$ 为 $M$-弱凸，则对 $\gamma<1/M$，映射 $\mathbf u\mapsto g(\mathbf u)+\frac{1}{2\gamma}\|\mathbf u-\mathbf x\|^2$ 强凸，从而 $\mathrm{prox}_{\gamma g}$ 是 1-Lipschitz 的 [59]。其余按 [67] 的 Thm 4.1 与 4.2 照常进行。

> **原文疑点：** 定理 2.14 的陈述在 PDF 中写作"$\mathbf B_k$ 满足 Dennis–Moré 条件 (2.8)"，但 (2.8) 是定理 2.5 中的迭代序列式，Dennis–Moré 条件实为式 (2.9)；此处按原文照录并加注。

这表明在临界点为强局部最小值（即局部强凸）时，可获得超线性收敛而非线性收敛。注意第二部分的可微性条件在 $f$ 与 $g$ 均为 $C^2$ 时可以去掉。此外，若假设 $\varphi$ 凸且 $\mathbf x^\ast$ 是强局部最小值，或 $\varphi$ 满足更强的 KL 不等式，则当 $\mathbf B_k$ 按 BFGS 方案更新时这些条件确实成立 [67, Thm 4.3]。

## 3. PnP-qN：深度去噪器扩展

为把算法 2.1 转换为 PnP 框架，我们考虑用去噪器替换 (2.2b) 中的近端步。具体地，我们考虑 [33] 中的梯度步去噪器设置。令去噪器 $D_\sigma$ 由下式给出：

$$
D_\sigma=\mathbf I-\nabla g_\sigma, \tag{3.1a}
$$

$$
g_\sigma=\frac12\|\mathbf x-N_\sigma(\mathbf x)\|^2, \tag{3.1b}
$$

其中 $g_\sigma$ 是 $C^2$ 函数，具有 $L$-Lipschitz 梯度，$L<1$。注意 $g_\sigma$ 的下标表示去噪强度，与我们稍后为问题定义的前向–后向包络中的 $g$ 下标不同。映射 $N_\sigma(\mathbf x)$ 取 $C^2$ 神经网络的形式，使 $g_\sigma$ 可显式计算。在这些假设下，去噪器 $D_\sigma$ 取弱凸函数的近端映射形式，如下一命题所述。

**命题 3.1**（[31, Prop 1]）。$D_\sigma(\mathbf x)=\mathrm{prox}_{\phi_\sigma}(\mathbf x)$，其中 $\phi_\sigma$ 定义为

$$
\phi_\sigma(\mathbf x)=g_\sigma\left(D_\sigma^{-1}(\mathbf x)\right)-\frac12\left\|D_\sigma^{-1}(\mathbf x)-\mathbf x\right\|^2 \tag{3.2}
$$

若 $\mathbf x\in\mathrm{Im}(D_\sigma)$，否则 $\phi_\sigma(\mathbf x)=+\infty$。此外，$\phi_\sigma$ 是 $\frac{L}{L+1}$-弱凸的。

该命题允许我们把上一节所需的弱凸性常数取为 $M=L/(L+1)$。由于 $L<1$，有 $M<1/2$。该结果可视为如下事实的轻微推广：函数 $f$ 是某个正常凸下半连续函数的近端算子，当且仅当它是凸下半连续函数 $\psi$ 的次梯度且 $f$ 非扩张 [27, 48]。

假设 MINFBE 迭代中的 $\gamma_k=\gamma>0$ 固定，且满足引理 2.8 的条件。考虑用命题 3.1 定义的 $\phi_\sigma$ 作替换，目标为 $\varphi=f+g$：

$$
\gamma g=\phi_\sigma. \tag{3.3}
$$

于是 FBS 步 $T_\gamma(\mathbf x)=\mathrm{prox}_{\gamma g}(\mathbf x-\gamma\nabla f(\mathbf x))$ 在 $D_\sigma=\mathrm{prox}_{\phi_\sigma}$ 下变为

$$
T_\gamma(\mathbf x)=D_\sigma\left(\mathbf x-\gamma\nabla f(\mathbf x)\right). \tag{3.4}
$$

这将瞄准目标函数 $\varphi(\mathbf x)=f(\mathbf x)+g(\mathbf x)=f(\mathbf x)+\phi_\sigma(\mathbf x)/\gamma$。为用该替换迭代算法 2.1，我们需要计算 $\varphi_\gamma$。回顾 (2.4b)，我们可转而计算 Moreau 包络 $g_\gamma$。由定义 (2.3b) 与替换 (3.3)，有

$$
\begin{aligned}
g_\gamma(\mathbf y)&\stackrel{(2.3b)}{=}g\left(\mathrm{prox}_{\gamma g}(\mathbf y)\right)+\frac{1}{2\gamma}\left\|\mathrm{prox}_{\gamma g}(\mathbf y)-\mathbf y\right\|^2\\
&\stackrel{(3.3)}{=}\frac1\gamma\phi_\sigma\left(D_\sigma(\mathbf y)\right)+\frac{1}{2\gamma}\left\|D_\sigma(\mathbf y)-\mathbf y\right\|^2\\
&\stackrel{(3.2)}{=}\frac1\gamma g_\sigma\left(D_\sigma^{-1}(D_\sigma(\mathbf y))\right)-\frac{1}{2\gamma}\left\|D_\sigma^{-1}(D_\sigma(\mathbf y))-D_\sigma(\mathbf y)\right\|^2+\frac{1}{2\gamma}\left\|D_\sigma(\mathbf y)-\mathbf y\right\|^2\\
&=\frac1\gamma g_\sigma(\mathbf y).
\end{aligned}
$$

利用该替换，我们得到即插即用方案 PnP-MINFBE，详见算法 3.1。我们有 $\varphi$ 的前向–后向包络的闭式，以及迭代 MINFBE 所需的其他表达式：

$$
\varphi(\mathbf x)=f(\mathbf x)+\frac1\gamma\phi_\sigma(\mathbf x), \tag{3.5a}
$$

$$
\varphi_\gamma(\mathbf x)=f(\mathbf x)-\frac{\gamma}{2}\|\nabla f(\mathbf x)\|^2+\frac1\gamma g_\sigma\left(\mathbf x-\gamma\nabla f(\mathbf x)\right), \tag{3.5b}
$$

$$
\nabla\varphi_\gamma(\mathbf x)=(\mathbf I-\gamma\nabla^2f)R_\gamma(\mathbf x), \tag{3.5c}
$$

$$
\varphi(\mathbf x_{k+1})=f(\mathbf x_{k+1})+\frac1\gamma\left(g_\sigma\left(\mathbf w_k-\gamma\nabla f(\mathbf w_k)\right)-\frac12\left\|\mathbf w_k-\gamma\nabla f(\mathbf w_k)-T_\gamma(\mathbf w_k)\right\|^2\right). \tag{3.5d}
$$

> **算法 3.1　PnP-MINFBE**
> **Require：** $\mathbf x_0$，$\gamma<\min\{\gamma_0,(1-\beta)/L_f,1/M\}$，$\beta\in[0,1)$，$k\leftarrow0$
> 1: **if** $R_{\gamma_k}(\mathbf x_k)=\mathbf 0$ **then**
> 2: 　停止
> 3: **end if**
> 4: 选择 $\mathbf d_k$ 使 $\langle\mathbf d_k,\nabla\varphi_\gamma(\mathbf x_k)\rangle\le0$
> 5: 选择 $\tau_k\ge0$ 与 $\mathbf w_k=\mathbf x_k+\tau_k\mathbf d_k$ 使 $\varphi_\gamma(\mathbf w_k)\le\varphi_\gamma(\mathbf x_k)$
> 6: $\mathbf x_{k+1}\leftarrow D_\sigma(\mathbf w_k-\gamma\nabla f(\mathbf w_k))$
> 7: $k\leftarrow k+1$，转 1

为在每步计算搜索方向 $\mathbf d_k$，可用拟牛顿方法近似 $\varphi_\gamma$ 逆 Hessian。虽然 $\nabla^2\varphi_\gamma$ 存在闭式（例如 [67, Thm 2.10]），但它需要去噪器 $D_\sigma$ 的 Jacobian，使得需要 Hessian 的方法因问题维数而在计算上不可行。因此，我们采用 BFGS 类算法，使用差值与割线

$$
\mathbf s_k=\mathbf w_k-\mathbf x_k,\qquad \mathbf y_k=\nabla\varphi_\gamma(\mathbf w_k)-\nabla\varphi_\gamma(\mathbf x_k).
$$

特别地，由于实验使用图像带来的内存限制，我们将使用 L-BFGS 方法。它可用两循环递推实现，只使用最近 $m$ 条已计算的割线 [54]。我们还施加保护措施：若不满足割线条件 $\langle\mathbf s_k,\mathbf y_k\rangle>0$，则拒绝更新 Hessian 近似。为完整起见，我们在算法 3.2 中写出 L-BFGS 的两循环递推。初始（逆）Hessian 近似取为 $\mathbf H_k^0=c_k\mathbf I$，如 [54]，其中

$$
c_k=\frac{\langle\mathbf s_{k-1},\mathbf y_{k-1}\rangle}{\langle\mathbf y_{k-1},\mathbf y_{k-1}\rangle}.
$$

利用上一节的结果，我们可以给出 PnP-MINFBE（算法 3.1）与 PnP-LBFGS（算法 3.3）的如下收敛结果。

> **算法 3.2　L-BFGS [54]**
> **Require：** $m>0$，割线 $(\mathbf s_i)_{i=k-m}^{k-1}$，差值 $(\mathbf y_i)_{i=k-m}^{k-1}$，初始 Hessian 猜测 $(\mathbf H_k^0)_{k\in\mathbb N}$
> 1: $\mathbf q\leftarrow\nabla\varphi_\gamma(\mathbf x_k)$
> 2: $\rho_i\leftarrow1/\langle\mathbf y_i,\mathbf s_i\rangle$，对 $i=k-1,k-2,\dots,k-m$
> 3: **for** $i=k-1,k-2,\dots,k-m$ **do**
> 4: 　$\alpha_i\leftarrow\rho_i\langle\mathbf s_i,\mathbf q\rangle$
> 5: 　$\mathbf q\leftarrow\mathbf q-\alpha_i\mathbf y_i$
> 6: **end for**
> 7: $\mathbf r\leftarrow\mathbf H_k^0\mathbf q$
> 8: **for** $i=k-m,k-m+1,\dots,k-1$ **do**
> 9: 　$\beta\leftarrow\rho_i\langle\mathbf y_i,\mathbf r\rangle$
> 10: 　$\mathbf r\leftarrow\mathbf r+(\alpha_i-\beta)\mathbf s_i$
> 11: **end for**
> 12: 停止，得到 $\mathbf B_k^{-1}\nabla\varphi_\gamma(\mathbf x_k)=\mathbf H_k\nabla\varphi_\gamma(\mathbf x_k)=\mathbf r$

> **算法 3.3　PnP-LBFGS**
> **Require：** $\mathbf x_0$，$\gamma<\min\{(1-\beta)/L_f,1/M\}$，$\beta\in[0,1)$，$k\leftarrow0$
> 1: **if** $R_{\gamma_k}(\mathbf x_k)=\mathbf 0$ **then**
> 2: 　停止
> 3: **end if**
> 4: 用 L-BFGS（见算法 3.2）基于差值/割线 $(\mathbf s_i,\mathbf y_i)_{i=k-m}^{k-1}$ 计算 $\mathbf d_k\leftarrow-\mathbf B_k^{-1}\nabla\varphi_\gamma(\mathbf x_k)$。
> 5: 选择 $\tau_k\in[0,1]$ 与 $\mathbf w_k=\mathbf x_k+\tau_k\mathbf d_k$ 使 $\varphi_\gamma(\mathbf w_k)\le\varphi_\gamma(\mathbf x_k)$
> 6: $\mathbf x_{k+1}\leftarrow D_\sigma(\mathbf w_k-\gamma\nabla f(\mathbf w_k))$
> 7: $\mathbf s_k\leftarrow\mathbf w_k-\mathbf x_k$，$\mathbf y_k\leftarrow\nabla\varphi_\gamma(\mathbf w_k)-\nabla\varphi_\gamma(\mathbf x_k)$
> 8: $k\leftarrow k+1$，转 1

**推论 3.2.** 假设 $f$ 是 $C^1$ 且满足 KL 性质、具有 $L_f$-Lipschitz 梯度；$g_\sigma$ 是 $C^2$ 且半代数、具有 $L_g$-Lipschitz 梯度且 $L_g<1$。进一步假设按引理 2.8 选取 $\gamma<1/(2M)$ 使 $\gamma=\gamma_\infty$，且存在 $\bar\tau,c>0$ 使 $\tau_k\le\bar\tau$、$\|\mathbf d_k\|\le c\|R_\gamma(\mathbf x_k)\|$。则算法 3.1 的 PnP-MINFBE 迭代满足：
i. $\varphi(\mathbf x_k)$ 单调下降；
ii. 残差 $R_\gamma(\mathbf x_k)$ 以 $O(1/\sqrt{k})$ 的速率收敛到零；
iii. 若迭代点有界，则迭代要么有限，要么收敛到 $\varphi=f+\frac1\gamma\phi_\sigma$ 的临界点；此外，在这些临界点处有 $\varphi=\varphi_\gamma$；
iv. 若进一步取 $\mathbf d_k=-\mathbf B_k^{-1}\nabla\varphi_\gamma(\mathbf x_k)$ 且 $\mathbf B_k$ 满足 Dennis–Moré 条件，则 $\mathbf x_k$ 与 $\mathbf w_k$ 超线性收敛到 $\mathbf x^\ast$。
**证明.** (i)、(ii) 由定理 2.10 与 2.11 得出。(iii) 由 Tarski–Seidenberg 定理 [5]，半代数映射的复合与逆是半代数的。因此 $D_\sigma$ 与 $D_\sigma^{-1}$（在各自定义域上）是半代数的，从而 $\phi_\sigma$ 也是。于是 $\varphi=f+\frac1\gamma\phi_\sigma$ 是 KL 函数。此外 $\varphi_\gamma$ 也是 KL 函数。因此由定理 2.13 得到收敛性。最后一部分由命题 2.7 得出。(iv) 由定理 2.14 得出。

（原文疑点：推论 3.2(iv) 与定理 2.14 中"Dennis–Moré 条件 (2.8)"的编号在 PDF 中印作 (2.8)，而 Dennis–Moré 条件实为式 (2.9)；此处按原文照录。）

> **注 3.3.** 经典证明的关键部分依赖于：在牛顿型下降方向选择下，MINFBE 中的 $\tau=1$ 最终总会被接受。在数值测试中，我们观察到优化图像时 Armijo 搜索只在偶发情况下必要，收敛前最多需要约 10 次线搜索。

在我们的情形中，$f$ 将是二次保真项 $f(\mathbf x)=\|\mathbf A\mathbf x-\mathbf y\|^2/2$，其中 $\mathbf A$ 是某线性算子、$\mathbf y$ 是测量。它是半代数因而是 KL 的，且显然有下界。由 (3.1b) 我们还知 $g_\sigma$ 有下界。由于 $N_\sigma$ 取为半代数运算与算术运算复合而成的神经网络，$g_\sigma$ 也半代数。因此可应用推论 3.2，得到收敛到相应函数 $\varphi=f+\frac1\gamma\phi_\sigma$ 的临界点。

## 4. 实验

本节把所提 PnP-LBFGS 方法（算法 3.3）结合预训练去噪器应用于图像去模糊与超分辨率。我们使用 [33] 给出的预训练 Lipschitz 约束近端去噪器。该（梯度步）去噪器取形如 (3.1) 的形式，其中 $N_\sigma$ 是基于 DRUNet 架构 [77] 的神经网络。对 $\nabla g_\sigma$ 的 Lipschitz 约束通过在训练中对 $\nabla^2g_\sigma$ 的谱范数施加惩罚来强制。虽然该谱约束会影响端到端去噪器的性能，但它在 PnP 语境下为收敛提供了充分条件，特别是收敛到闭式泛函的临界点。

我们用于图像重建的数据集是 CBSD68、CBSD10 与 set3c，包含尺寸 $256\times256$、三色彩通道、像素强度在 $[0,255]$ 的图像 [45]。去模糊与超分辨率重建问题对应的前向算子都是线性的，可把保真项写为 $f(\mathbf x)=\lambda\|\mathbf A\mathbf x-\mathbf y\|^2/2$，其中 $\mathbf A$ 是退化算子、$\mathbf y$ 是退化图像、$\lambda$ 是正则化参数。重建时取 $\mathbf y=\mathbf A\mathbf x_{\mathrm{true}}+\boldsymbol\varepsilon$，其中 $\mathbf x_{\mathrm{true}}$ 是真值图像，$\boldsymbol\varepsilon$ 是像素级高斯噪声，标准差 $\sigma\in\{2.55,7.65,12.75\}$，分别对应 1%、3%、5% 噪声（相对最大像素强度值）。因此，PnP-MINFBE 不动点对应的底层优化问题具有形式

$$
\min_{\mathbf x}\ \varphi(\mathbf x)=\frac{\lambda}{2}\|\mathbf A\mathbf x-\mathbf y\|^2+\frac1\gamma\phi_\sigma, \tag{4.1}
$$

其中 $\gamma\le\min\{(1-\beta)/L_f,1/(2M)\}$，如引理 2.8 与定理 2.11。此时 $f$ 是 $C^2$，可用 (3.5c) 容易地计算前向–后向包络的导数。

我们比较的方法是具有相似收敛保证的 PnP 方法，即残差收敛 $O(1/\sqrt{k})$ 与 KL 型迭代收敛 [33]。我们的分析还表明，在 Hessian 正定的最小值处使用牛顿方向具有超线性收敛。尽管无法验证由 L-BFGS 得到的 Hessian 近似 $\mathbf B_k$ 是否满足超线性收敛的 Dennis–Moré 条件，我们仍将在经验上展示其在时间与迭代次数上的更快收敛。

我们比较的 PnP 方法为 PnP-PGD、PnP-DRS、PnP-DRSdiff 与 PnP-$\hat\alpha$PGD [33, 31]。其中 PGD 表示近端梯度下降，DRS 表示 Douglas–Rachford 分裂，DRSdiff 表示带可微保真项的 DRS，$\hat\alpha$PGD 表示 $\hat\alpha$-松弛 PGD。用于比较的所选 PnP 方法的更新规则如下：

$$
\text{(PnP-PGD)}\quad
\begin{cases}
\mathbf z_{k+1}=\mathbf x_k-\lambda\nabla f(\mathbf x_k)\\
\mathbf x_{k+1}=D_\sigma(\mathbf z_{k+1})
\end{cases}
$$

$$
\text{(PnP-DRSdiff)}\quad
\begin{cases}
\mathbf y_{k+1}=\mathrm{prox}_{\lambda f}(\mathbf x_k)\\
\mathbf z_{k+1}=D_\sigma(2\mathbf y_{k+1}-\mathbf x_k)\\
\mathbf x_{k+1}=\mathbf x_k+(\mathbf z_{k+1}-\mathbf y_{k+1})
\end{cases}
$$

$$
\text{(PnP-DRS)}\quad
\begin{cases}
\mathbf y_{k+1}=D_\sigma(\mathbf x_k)\\
\mathbf z_{k+1}=\mathrm{prox}_{\lambda f}(2\mathbf y_{k+1}-\mathbf x_k)\\
\mathbf x_{k+1}=\mathbf x_k+(\mathbf z_{k+1}-\mathbf y_{k+1})
\end{cases}
$$

$$
\text{(PnP-}\hat\alpha\text{PGD)}\quad
\begin{cases}
\mathbf q_{k+1}=(1-\hat\alpha)\mathbf y_k+\hat\alpha\mathbf x_k\\
\mathbf x_{k+1}=D_\sigma(\mathbf x_k-\lambda\nabla f(\mathbf q_{k+1}))\\
\mathbf y_{k+1}=(1-\hat\alpha)\mathbf y_k+\hat\alpha\mathbf x_{k+1}
\end{cases}
$$

### 4.1 超参数与去噪器选择

所提 PnP-LBFGS 与现有 PnP-$\hat\alpha$PGD 方法的超参数分别如表 1 与表 2 所示，通过在 set3c 数据集上针对相应图像重建问题最大化 PSNR 的网格搜索选取。PnP-LBFGS 的超参数网格在各小节给出，PnP-$\hat\alpha$PGD 的网格如下。实验去噪器使用 [33] 中预训练的网络 $N_\sigma$。

PnP-PGD 与 PnP-DRSdiff 的收敛条件是 $g_\sigma$ 具有某个 $L<1$ 的 $L$-Lipschitz 梯度，直接使用去噪器 $D_\sigma$ 即可保持理论收敛。对 PnP-DRS，条件需加强为 $L<1/2$；此时去噪器被替换为平均形式 $(\mathbf I+D_\sigma)/2=\mathbf I-\frac12\nabla g_\sigma$，这给出收敛结果但会改变底层优化问题。对 PnP-LBFGS 与 PnP-$\hat\alpha$PGD，我们使用性能更好的平均去噪器 $D_\sigma^\alpha=\mathbf I-\alpha\nabla g_\sigma$，松弛参数 $\alpha$ 按表 1 与表 2 选取。如引言所述，加入松弛参数 $\alpha$ 意味着势函数的有效 Lipschitz 常数为 $\alpha L$，从而缓解 $L>1$ 时的发散问题。此时 $D_\sigma^\alpha=\mathrm{prox}_{\phi_\sigma^\alpha}$ 对某弱凸 $\phi_\sigma^\alpha$ 成立，先前的计算在把 $g_\sigma$ 替换为 $\alpha g_\sigma$ 后仍有效。

> **表 1（原文 Table 1）：** PnP-LBFGS 的超参数。

| | Deblur | | | SR | | |
|---|---|---|---|---|---|---|
| $\sigma$ | 2.55 | 7.65 | 12.75 | 2.55 | 7.65 | 12.75 |
| $\alpha$ | 0.5 | 0.5 | 0.7 | 0.5 | 0.5 | 0.5 |
| $\gamma$ | 1 | 1 | 1 | 1 | 1 | 1 |
| $\beta$ | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 | 0.01 |
| $\lambda$ | 1 | 1 | 1 | 4 | 1.5 | 1 |
| $\sigma_d/\sigma$ | 1 | 0.75 | 0.75 | 2 | 1 | 0.75 |

> **表 2（原文 Table 2）：** PnP-$\hat\alpha$PGD 的超参数。

| | Deblur | | | SR | | |
|---|---|---|---|---|---|---|
| $\sigma$ | 2.55 | 7.65 | 12.75 | 2.55 | 7.65 | 12.75 |
| $\alpha$ | 0.6 | 0.8 | 0.85 | 1 | 1 | 1 |
| $L_f$ | 1 | 1 | 1 | 0.25 | 0.25 | 0.25 |
| $\lambda$ | $\frac{\alpha+1}{\alpha L_f}$ | $\frac{\alpha+1}{\alpha L_f}$ | $\frac{\alpha+1}{\alpha L_f}$ | $\frac{\alpha+1}{\alpha L_f}$ | $\frac{\alpha+1}{\alpha L_f}$ | $\frac{\alpha+1}{\alpha L_f}$ |
| $\hat\alpha$ | $\frac{1}{\lambda L_f}$ | $\frac{1}{\lambda L_f}$ | $\frac{1}{\lambda L_f}$ | $\frac{1}{\lambda L_f}$ | $\frac{1}{\lambda L_f}$ | $\frac{1}{\lambda L_f}$ |
| $\sigma_d/\sigma$ | 1.5 | 1 | 1 | 2 | 2 | 2 |

对 PnP-$\hat\alpha$PGD 的松弛版本，我们按表 2 进行网格搜索选取参数。对 PnP-PGD，底层优化问题为 $\varphi^{\mathrm{PnP-PGD}}=0.99/2\|\mathbf A\mathbf x-\mathbf y\|^2+\phi_\sigma$。

Line-search 步长 $\tau_k$ 从 $\tau_k=1$ 开始，若算法 3.3 第 5 步的 $\varphi_\gamma$ 下降条件不满足，则乘以 0.5 [3, 8]。

此外，我们引入基于相邻迭代前向–后向包络之差 $\varphi_\gamma(\mathbf x_{k+1})-\varphi_\gamma(\mathbf x_k)<10^{-5}$ 以及包络与目标之差 $\varphi(\mathbf x_k)-\varphi_\gamma(\mathbf x_k)<5\times10^{-5}$ 的停止准则，若其中至少一个准则连续 5 次迭代成立则停止。我们注意到，虽然这些准则可以加强，但优化结果变化极小。我们将使用基于包络停止准则的 PnP-LBFGS 记为 **PnP-LBFGS 1**。为完整起见，我们另外考虑相邻目标函数 $\varphi$ 值相对差小于 $10^{-8}$ 的停止准则，将使用目标变化停止准则的 PnP-LBFGS 记为 **PnP-LBFGS 2**。两种停止准则下的 PnP-LBFGS 分别用上标 1 与 2 标记；不带下标的 PnP-LBFGS 统指两者，它们共享参数。

所有实现均用 PyTorch 完成，实验在 AMD EPYC 7352 CPU 与 24 GB 显存的 Quadro RTX 6000 GPU 上进行 [56]。实验代码已公开（原文脚注 2：https://github.com/hyt35/Prox-qN）。

### 4.2 无收敛保证的 PnP 方法

为进一步比较，我们额外考虑两种不可证明的 PnP 方法，即 DPIR [77] 与 PnP-FISTA [38]。DPIR 基于半二次分裂，把 $\mathrm{prox}_{f+g}$ 拆分为交替的 $\mathrm{prox}_f$ 与 $\mathrm{prox}_g$ 步，并按 PnP 精神进一步用去噪步 $D_{\sigma_k}$ 替换 $\mathrm{prox}_g$。PnP-FISTA 基于快速迭代收缩阈值算法，它由把 Nesterov 式加速应用于前向–后向分裂得到 [38, 37]。我们注意到，这两种方法在现有文献中都不对应任何函数的临界点。

$$
\text{(DPIR)}\quad
\begin{cases}
\alpha_k=\hat\lambda\sigma^2/\sigma_k^2,\\
\mathbf x_{k+1}=\mathrm{prox}_{f/2\alpha_k}(\mathbf z_k),\\
\mathbf z_{k+1}=D_{\sigma_k}(\mathbf x_k).
\end{cases}
$$

$$
\text{(PnP-FISTA)}\quad
\begin{cases}
\mathbf x_k=D_\sigma(\mathbf y_k-\lambda\nabla f(\mathbf y_k)),\\
t_{k+1}=\dfrac{1+\sqrt{1+4t_k^2}}{2},\\
\mathbf y_{k+1}=\mathbf x_k+\dfrac{t_k-1}{t_{k+1}}(\mathbf x_k-\mathbf x_{k-1}).
\end{cases}
$$

**4.2.1. DPIR。** 为提升性能，DPIR 在迭代中使用递减噪声强度以及图像变换 [77, Sec. 4.2]。为把迭代扩展到 8 次以上，我们按照 DPIR 论文的建议 [77, Sec. 5.1.1, 5.2]，对去模糊与超分辨率分别采用在 8 次与 24 次迭代内从 $\sigma_d=49$ 对数下降到 $\sigma_d=\sigma$ 的噪声强度。近端项的缩放由缩放参数 $\hat\lambda$ 决定，原工作中取 $\hat\lambda=0.23$。图 1 表明，虽然 DPIR 在低迭代次数下取得最先进性能，但当半二次分裂迭代超过原 DPIR 论文所用次数时 PSNR 开始下降 [32]。此外，DPIR 在下面的图像重建实验中在低噪声区表现较差。后续实验中，我们对去模糊与超分辨率分别考虑 DPIR 建议的 8 次与 24 次迭代，并扩展到 1000 次迭代以检查收敛行为。

> **图 1（原文 Fig. 1）：** DPIR 在去模糊上以残差 $\|\mathbf x_{k+1}-\mathbf x_k\|_2/\|\mathbf x_0\|_2$ 与 PSNR 衡量的性能；噪声水平 $\sigma=2.55$ 与 7.65，采用两种不同去噪强度机制。每条曲线对应 CBSD10 数据集中的一幅图像（共 10 幅）。DPIR 1 的去噪强度在 8 次迭代内从 49 降到 $\sigma$（去模糊），之后以 $\sigma_d=\sigma$ 继续；DPIR 2 的去噪强度在 1000 次迭代内从 49 降到 $\sigma$。我们观察到两种方法在后期迭代中 PSNR 都下降、残差不收敛，且 DPIR 在小噪声水平下发散。

**4.2.2. PnP-FISTA。** PnP-FISTA 的去噪器参数取为 PnP-LBFGS 或 PnP-PGD 的参数。PnP-PGD 或 PnP-DRS 等 PnP 方案的证明通常依赖经典单调算子理论，并需证明去噪器满足必要假设。然而 FISTA 的收敛证明高度依赖问题的凸性 [9, 14]，非凸证明还需要自适应回溯 [24, 55] 或二次增长条件 [6] 等技术或条件。这些技术与条件难以转换并验证于 PnP 框架，这意味着难以证明相应 PnP-FISTA 方案的收敛性。在后续实验中，除非另有说明，我们运行 DPIR 与 PnP-FISTA 方法 1000 次迭代以验证收敛行为。图 1 与图 2 还展示了 DPIR 与 PnP-FISTA 的一些常见发散模式：DPIR 在低噪声水平下失败，PnP-FISTA 以伪影形式失败。

> **图 2（原文 Fig. 2）：** PnP-FISTA 应用于噪声水平 $\sigma=7.65$ 的超分辨率时的残差 $\|\mathbf x_{k+1}-\mathbf x_k\|_2/\|\mathbf x_0\|_2$ 与 PSNR。每条曲线对应 CBSD10 数据集中的一幅图像（共 10 幅）。使用本应解决 Lipschitz 约束问题的 PnP-LBFGS 参数仍出现同样的发散问题。PnP-FISTA 有时失败，产生如子图 (c) 所示的伪影图像。

### 4.3 去模糊

对去模糊，使用 10 个模糊核，包括八个相机抖动核、一个 $9\times9$ 均匀核与一个标准差 $\sigma_{\mathrm{blur}}=1.6$ 的 $25\times25$ 高斯核 [40, 33]。核的可视化见补充材料。模糊算子 $\mathbf A$ 对应循环边界条件下的卷积。此时转置 $\mathbf A^\top$ 可用循环边界条件下的转置卷积轻松实现。模糊算子已预先缩放，使 $\|\mathbf A^\top\mathbf A\|_{\mathrm{op}}\approx0.96$，并用幂迭代验证。因此 $\nabla f$ 约 $0.96\lambda$-Lipschitz。

我们按在 set3c 数据集上最大化 PSNR 的网格搜索选择 PnP-LBFGS 的超参数。参数网格为 $\alpha\in\{0.5,0.7,0.9,1.0\}$、$\lambda\in\{0.8,0.9,1.0\}$、$\gamma\in\{0.8,0.85,0.9,1.0\}$ 与 $\sigma_d/\sigma\in\{0.5,0.75,1.0,1.5,2.0\}$。注意该选择满足 $\gamma<\min\{(1-\beta)/L_f,1/(2M)\}$，因为 $\phi_\sigma$ 至多 $\frac12$-弱凸。我们经验上观察到步长 $\tau=1$ 在几乎所有情况下也是有效下降步，验证了证明超线性收敛所需的论断（见注 3.3）。PnP-LBFGS 与 PnP-PGD 对应的底层优化问题略有不同：对 PnP-PGD，保真正则化取 $\lambda=0.99$，迭代收敛到 PnP-$\hat\alpha$PGD 所最小化的 Lyapunov 泛函的聚点，对 PnP-DRS 与 PnP-DRSdiff 具有相同的敏感性 [31]。

对 PnP-LBFGS，底层优化问题的正则化参数 $\lambda$ 受到与 PnP-PGD、PnP-DRS（但不包括 PnP-DRSdiff）类似的限制。对 PnP-PGD 与 PnP-DRS，收敛的一个条件是 $\lambda L_f<1$ [33]。然而对 PnP-LBFGS，引理 2.8 给出条件 $\gamma<(1-\beta)/(\lambda L_f)$，目标是 $\varphi(\mathbf x)=\frac{\lambda}{2}\|\mathbf A\mathbf x-\mathbf y\|^2+\frac1\gamma\phi_\sigma$。我们注意到，随着 $\lambda$ 增大，允许的 $\gamma$ 减小，这以与 $\lambda$ 相同的速率相应增大先验 $\phi_\sigma$ 的最小允许系数 $1/\gamma$。这对保真项与正则项之间的比值施加了上界，对低噪声应用可能具有限制性。

L-BFGS 的内存长度取 $m=20$，每幅图像最多 100 次迭代。去噪器 $D_\sigma^\alpha$ 的去噪强度 $\sigma_d$ 与 [33] 中 PnP-DRS 所用类似。通过使用不同的去噪强度，我们能结合缩放参数 $\lambda$ 进一步控制正则化。

图 3 展示去模糊的平均 PSNR 收敛情况。表 3 给出各方法在 CBSD68 上的平均 PSNR 与平均每幅图像重建时间。表 3 表明 PnP-PGD 与 PnP-DRSdiff 收敛到非常相似的结果，因为它们最小化相同的底层泛函。然而 PnP 迭代有时不收敛，图 3 的子图 (d) 与 (g) 中 PSNR 持续下降即为证明。这可归因于这些迭代点处 $g_\sigma$ 的 Lipschitz 常数大于 1。在 PnP-DRS 与 PnP-LBFGS 中使用平均去噪器 $D_\sigma^\alpha$ 可减少发散，这些图像也能看到收敛。我们总体上观察到 PnP-$\hat\alpha$PGD 的 PSNR 表现最好，这可归因于其允许更大的 $\lambda$ 值。尽管如此，对每幅测试图像达到相当 PSNR 时，PnP-LBFGS 的收敛显著快于其他方法。与不可证明的 PnP 方法比较，图 3 表明 PnP-FISTA 在 CBSD10 上收敛到与 PnP-LBFGS 相同的 PSNR，但在 CBSD68 全部图像上平均时表现更差（表 3）。这可归因于该方法在 $\nabla g_\sigma$ 的 Lipschitz 常数大于 1 的去噪器上发散。DPIR 则在前几次迭代就达到峰值，随后下降到由最终去噪强度 $\sigma_d=\sigma$ 的去噪器迭代得到的固定点。这导致 DPIR 在第 $10^3$ 次迭代时比第 8 次迭代表现更差，说明其不收敛以及可证明 PnP 与不可证明 PnP 之间当前的性能差距。

图 3 与图 4 还展示了两种停止准则的差异。PnP-LBFGS 1 的停止准则足以收敛到合理 PSNR，并允许更早停止。PnP-LBFGS 2 在更多迭代后停止，并展示出残差收敛显著快于其他所考虑的 PnP 方法。此外，图 5 展示了目标 $\varphi$ 与前向–后向包络 $\varphi_\gamma$ 的收敛曲线，二者快速收敛到同一值，验证了命题 2.1。

> **表 3（原文 Table 3）：** 所提 PnP-LBFGS 方法与现有可证明与不可证明 PnP 方法在 CBSD68 数据集上（去模糊）的平均 PSNR（dB）比较；时间为每幅图像的平均重建时间。PnP-LBFGS 1 因收敛更快而显著快于其他可证明 PnP 方法。

| 方法 | $\sigma=2.55$ | $\sigma=7.65$ | $\sigma=12.75$ | 时间（s） |
|---|---|---|---|---|
| PnP-LBFGS 1 | 31.19 | 27.95 | 26.61 | **5.80** |
| PnP-LBFGS 2 | 31.17 | 27.78 | 26.61 | 9.55 |
| PnP-PGD | 30.57 | 27.80 | 26.61 | 25.93 |
| PnP-DRSdiff | 30.57 | 27.78 | 26.61 | 22.72 |
| PnP-DRS | 31.54 | 28.07 | 26.60 | 19.26 |
| PnP-$\hat\alpha$PGD | 31.52 | **28.15** | 26.74 | 15.66 |
| PnP-FISTA | 30.24 | 27.15 | 26.60 | 24.32 |
| DPIR（$10^3$ 次迭代） | 27.40 | 27.58 | 26.46 | 19.62 |
| DPIR（8 次迭代） | **32.01** | 28.34 | **26.86** | 0.55 |

> **图 3（原文 Fig. 3）：** 去模糊中各种方法的 PSNR 收敛曲线，括号内为平均 dB 值。每条曲线对应 CBSD10 数据集中的一幅图像（共 10 幅）。注意 (a) 的坐标尺度比其他曲线小 10 倍，在 100 次迭代处终止而不是 1000 次。PnP-LBFGS 与 PnP-DRS 的收敛总体更稳定，这可归因于 $\mathbf I-D_\sigma$ 的 Lipschitz 常数更小。PnP-LBFGS 1 的收敛迭代次数也远少于比较方法。两种停止准则下的 PnP-LBFGS 平均 PSNR 仅相差 0.0013 dB。

> **图 4（原文 Fig. 4）：** 去模糊中各种方法的残差 $\min_{i\le k}\|\mathbf x_{i+1}-\mathbf x_i\|_2/\|\mathbf x_0\|_2$ 的收敛情况。每条曲线对应 CBSD10 数据集中的一幅图像（共 10 幅），使用第一个模糊核与 $\sigma=7.65$ 评估。注意 (a) 的横轴尺度比其他曲线小 10 倍，在 100 次迭代处终止而不是 1000 次。

> **图 5（原文 Fig. 5）：** 使用 PnP-LBFGS 1 去模糊时目标 $\varphi$、前向–后向包络 $\varphi_\gamma$ 及其差 $\varphi-\varphi_\gamma$ 的演化。在真正的最小值处这些值相等，即 $\varphi_\gamma(\mathbf x^\ast)=\varphi(\mathbf x^\ast)$。每条曲线对应 CBSD10 数据集中一幅图像（共 10 幅），使用第一个模糊核与 $\sigma=7.65$ 评估。

> **图 6（原文 Fig. 6）：** 使用海星（starfish）图像的去模糊可视化，每种方法最多 100 次迭代。实验采用加性高斯噪声 $\sigma=7.65$。PnP-LBFGS 1 在前 100 次迭代内收敛，其他 PnP 算法需要更长时间收敛。由于 PnP-LBFGS 1 与 PnP-LBFGS 2 的结果几乎相同，此处只展示 PnP-LBFGS 1。DPIR 在 8 次迭代后 PSNR 开始下降，导致性能略差。

<!-- CURSOR -->

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。


## 参考文献（英文原书目）

- [1] B. Amos, L. Xu, and J. Z. Kolter, Input convex neural networks, in International Conference on Machine Learning, PMLR, 2017, pp. 146–155.
- [2] S. Arjomand Bigdeli, M. Zwicker, P. F avaro, and M. Jin, Deep mean-shift priors for image restoration, Advances in Neural Information Processing Systems, 30 (2017).
- [3] L. Armijo, Minimization of functions having Lipschitz continuous first partial derivatives, Pacific Journal of mathematics, 16 (1966), pp. 1–3.
- [4] H. Attouch, J. Bolte, P. Redont, and A. Soubeyran, Proximal alternating minimization and projection methods for nonconvex problems: An approach based on the KurdykaLojasiewicz inequality, Mathematics of operations research, 35 (2010), pp. 438–457.
- [5] H. Attouch, J. Bolte, and B. F. Svaiter, Convergence of descent methods for semi-algebraic and tame problems: proximal algorithms, forward–backward splitting, and regularized gauss–seidel methods, Mathematical Programming, 137 (2013), pp. 91–129.
- [6] J.-F. Aujol, C. Dossal, and A. Rondepierre, Fista is an automatic geometrically optimized algorithm for strongly convex functions, Mathematical Programming, (2023), pp. 1–43.
- [7] H. Bauschke and P. Combettes, Convex Analysis and Monotone Operator Theory in Hilbert Spaces, CMS Books in Mathematics, Springer New York, 2011.
- [8] A. Beck, First-order methods in optimization, SIAM, 2017.
- [9] A. Beck and M. Teboulle, A fast iterative shrinkage-thresholding algorithm for linear inverse problems, SIAM journal on imaging sciences, 2 (2009), pp. 183–202.
- [10] J. Bolte, S. Sabach, and M. Teboulle, Proximal alternating linearized minimization for nonconvex and nonsmooth problems, Mathematical Programming, 146 (2014), pp. 459–494.
- [11] A. Buades, B. Coll, and J.-M. Morel, Non-local means denoising, Image Processing On Line, 1 (2011), pp. 208–212.
- [12] G. T. Buzzard, S. H. Chan, S. Sreehari, and C. A. Bouman, Plug-and-play unplugged: Optimizationfree reconstruction using consensus equilibrium, SIAM Journal on Imaging Sciences, 11 (2018), pp. 2001–2020.
- [13] R. H. Byrd, S. L. Hansen, J. Nocedal, and Y. Singer, A stochastic quasi-Newton method for largescale optimization, SIAM Journal on Optimization, 26 (2016), pp. 1008–1031.
- [14] A. Chambolle and C. Dossal, On the convergence of the iterates of the “fast iterative shrinkage/thresholding algorithm”, Journal of Optimization theory and Applications, 166 (2015), pp. 968– 982.
- [15] S. H. Chan, X. W ang, and O. A. Elgendy, Plug-and-play admm for image restoration: Fixed-point convergence and applications, IEEE Transactions on Computational Imaging, 3 (2016), pp. 84–98.
- [16] R. Cohen, Y. Blau, D. Freedman, and E. Rivlin, It has potential: Gradient-driven denoisers for convergent solutions to inverse problems, Advances in Neural Information Processing Systems, 34 (2021), pp. 18152–18164.
- [17] R. Cohen, M. Elad, and P. Milanfar, Regularization by denoising via fixed-point projection (red-pro), SIAM Journal on Imaging Sciences, 14 (2021), pp. 1374–1406.
- [18] K. Dabov, A. Foi, V. Katkovnik, and K. Egiazarian, Image denoising by sparse 3-d transformdomain collaborative filtering, IEEE Transactions on image processing, 16 (2007), pp. 2080–2095.
- [19] I. Daubechies, M. Defrise, and C. De Mol, An iterative thresholding algorithm for linear inverse problems with a sparsity constraint, Communications on Pure and Applied Mathematics: A Journal Issued by the Courant Institute of Mathematical Sciences, 57 (2004), pp. 1413–1457.
- [20] J. E. Dennis and J. J. Mor ´e, A characterization of superlinear convergence and its application to quasi-Newton methods, Mathematics of computation, 28 (1974), pp. 549–560.
- [21] J. Douglas and H. H. Rachford, On the numerical solution of heat conduction problems in two and three space variables, Transactions of the American mathematical Society, 82 (1956), pp. 421–439.
- [22] M. F azlyab, A. Robey, H. Hassani, M. Morari, and G. Pappas, Efficient and accurate estimation of Lipschitz constants for deep neural networks, Advances in Neural Information Processing Systems, 34 H. Y. TAN, S. MUKHERJEE, J. TANG, AND C.-B. SCH ¨ONLIEB 32 (2019).
- [23] W. Gan, S. Shoushtari, Y. Hu, J. Liu, H. An, and U. S. Kamilov, Block coordinate plug-and-play methods for blind inverse problems, arXiv preprint arXiv:2305.12672, (2023).
- [24] T. Goldstein, C. Studer, and R. Baraniuk, A field guide to forward-backward splitting with a fasta implementation, arXiv preprint arXiv:1411.3406, (2014).
- [25] A. Goujon, S. Neumayer, P. Bohra, S. Ducotterd, and M. Unser, A neural-network-based convex regularizer for image reconstruction, arXiv preprint arXiv:2211.12461, (2022).
- [26] A. Goujon, S. Neumayer, and M. Unser, Learning weakly convex regularizers for convergent imagereconstruction algorithms, arXiv preprint arXiv:2308.10542, (2023).
- [27] R. Gribonval and M. Nikolova, A characterization of proximity operators, Journal of Mathematical Imaging and Vision, 62 (2020), pp. 773–789.
- [28] S. Helgason and S. Helgason, The radon transform, vol. 2, Springer, 1980.
- [29] J. Hertrich, S. Neumayer, and G. Steidl, Convolutional proximal neural networks and plug-and-play algorithms, Linear Algebra and its Applications, 631 (2021), pp. 203–234.
- [30] W. Huang, K. A. Gallivan, and P.-A. Absil, A Broyden class of quasi-Newton methods for Riemannian optimization, SIAM Journal on Optimization, 25 (2015), pp. 1660–1685.
- [31] S. Hurault, A. Chambolle, A. Leclaire, and N. Papadakis, A relaxed proximal gradient descent algorithm for convergent plug-and-play with proximal denoiser, 2023.
- [32] S. Hurault, A. Leclaire, and N. Papadakis, Gradient step denoiser for convergent plug-and-play, arXiv preprint arXiv:2110.03220, (2021).
- [33] S. Hurault, A. Leclaire, and N. Papadakis, Proximal denoiser for convergent plug-and-play optimization with nonconvex regularization, 2022.
- [34] Q. Jin, A. Koppel, K. Rajawat, and A. Mokhtari, Sharpened quasi-Newton methods: Faster superlinear rate and larger local convergence neighborhood, in International Conference on Machine Learning, PMLR, 2022, pp. 10228–10250.
- [35] Q. Jin and A. Mokhtari, Non-asymptotic superlinear convergence of standard quasi-Newton methods, Mathematical Programming, 200 (2023), pp. 425–473.
- [36] J. Kaipio and E. Somersalo, Statistical and computational inverse problems, vol. 160, Springer Science & Business Media, 2006.
- [37] U. S. Kamilov, C. A. Bouman, G. T. Buzzard, and B. Wohlberg, Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications, IEEE Signal Processing Magazine, 40 (2023), pp. 85–97.
- [38] U. S. Kamilov, H. Mansour, and B. Wohlberg, A plug-and-play priors approach for solving nonlinear imaging inverse problems, IEEE Signal Processing Letters, 24 (2017), pp. 1872–1876.
- [39] J. D. Lee, Y. Sun, and M. A. Saunders, Proximal Newton-type methods for minimizing composite functions, SIAM Journal on Optimization, 24 (2014), pp. 1420–1443.
- [40] A. Levin, Y. Weiss, F. Durand, and W. T. Freeman, Understanding and evaluating blind deconvolution algorithms, in 2009 IEEE conference on computer vision and pattern recognition, IEEE, 2009, pp. 1964–1971.
- [41] D.-H. Li and M. Fukushima, A modified BFGS method and its global convergence in nonconvex minimization, Journal of Computational and Applied Mathematics, 129 (2001), pp. 15–35.
- [42] D.-H. Li and M. Fukushima, On the global convergence of the BFGS method for nonconvex unconstrained optimization problems, SIAM Journal on Optimization, 11 (2001), pp. 1054–1064.
- [43] D. C. Liu and J. Nocedal, On the limited memory BFGS method for large scale optimization, Mathematical programming, 45 (1989), pp. 503–528.
- [44] S. Lunz, O. ¨Oktem, and C.-B. Sch ¨onlieb, Adversarial regularizers in inverse problems, Advances in neural information processing systems, 31 (2018).
- [45] D. Martin, C. Fowlkes, D. Tal, and J. Malik, A database of human segmented natural images and its application to evaluating segmentation algorithms and measuring ecological statistics, in Proceedings Eighth IEEE International Conference on Computer Vision. ICCV 2001, vol. 2, IEEE, 2001, pp. 416– 423.
- [46] T. Miyato, T. Kataoka, M. Koyama, and Y. Yoshida, Spectral normalization for generative adversarial networks, arXiv preprint arXiv:1802.05957, (2018).
- [47] A. Mokhtari and A. Ribeiro, Global convergence of online limited memory BFGS, The Journal of PLUG-AND-PLAY QUASI-NEWTON METHODS 35 Machine Learning Research, 16 (2015), pp. 3151–3181.
- [48] J.-J. Moreau, Proximit´ e et dualit´ e dans un espace hilbertien, Bulletin de la Soci´ et´ e math´ ematique de France, 93 (1965), pp. 273–299.
- [49] S. Mukherjee, S. Dittmer, Z. Shumaylov, S. Lunz, O. ¨Oktem, and C.-B. Sch ¨onlieb, Learned convex regularizers for inverse problems, 2020.
- [50] S. Mukherjee, A. Hauptmann, O. ¨Oktem, M. Pereyra, and C.-B. Sch ¨onlieb, Learned reconstruction methods with convergence guarantees, arXiv preprint arXiv:2206.05431, (2022).
- [51] P. Nair, R. G. Gavaskar, and K. N. Chaudhury, Fixed-point and objective convergence of plug-andplay algorithms, IEEE Transactions on Computational Imaging, 7 (2021), pp. 337–348.
- [52] S. Neumayer, A. Goujon, P. Bohra, and M. Unser, Approximation of Lipschitz functions using deep spline neural networks, SIAM Journal on Mathematics of Data Science, 5 (2023), pp. 306–322.
- [53] H. Q. Nguyen, E. Bostan, and M. Unser, Learning convex regularizers for optimal Bayesian denoising, IEEE Transactions on Signal Processing, 66 (2017), pp. 1093–1105.
- [54] J. Nocedal and S. J. Wright, Numerical Optimization, Springer, New York, NY, USA, 2e ed., 2006.
- [55] P. Ochs and T. Pock, Adaptive fista for nonconvex optimization, SIAM Journal on Optimization, 29 (2019), pp. 2482–2503.
- [56] A. Paszke, S. Gross, F. Massa, A. Lerer, J. Bradbury, G. Chanan, T. Killeen, Z. Lin, N. Gimelshein, L. Antiga, A. Desmaison, A. Kopf, E. Yang, Z. DeVito, M. Raison, A. Tejani, S. Chilamkurthy, B. Steiner, L. F ang, J. Bai, and S. Chintala, Pytorch: An imperative style, high-performance deep learning library, in Advances in Neural Information Processing Systems 32, H. Wallach, H. Larochelle, A. Beygelzimer, F. d 'Alch´ e-Buc, E. Fox, and R. Garnett, eds., Curran Associates, Inc., 2019, pp. 8024–8035, http://papers.neurips.cc/paper/ 9015-pytorch-an-imperative-style-high-performance-deep-learning-library.pdf.
- [57] J.-C. Pesquet, A. Repetti, M. Terris, and Y. Wiaux, Learning maximally monotone operators for image recovery, SIAM Journal on Imaging Sciences, 14 (2021), pp. 1206–1237.
- [58] E. T. Reehorst and P. Schniter, Regularization by denoising: Clarifications and new interpretations, IEEE transactions on computational imaging, 5 (2018), pp. 52–67.
- [59] R. Rockafellar, Convex Analysis, Princeton mathematical series ; 28, Princeton University Press, Princeton, NJ, 1972.
- [60] A. Rodomanov and Y. Nesterov, Greedy quasi-Newton methods with explicit superlinear convergence, SIAM Journal on Optimization, 31 (2021), pp. 785–811.
- [61] A. Rodomanov and Y. Nesterov, Rates of superlinear convergence for classical quasi-Newton methods, Mathematical Programming, (2021), pp. 1–32.
- [62] D. L. Ruderman, The statistics of natural images, Network: Computation in Neural Systems, 5 (1994), pp. 517–548.
- [63] L. I. Rudin, S. Osher, and E. F atemi, Nonlinear total variation based noise removal algorithms, Physica D: nonlinear phenomena, 60 (1992), pp. 259–268.
- [64] E. Ryu, J. Liu, S. W ang, X. Chen, Z. W ang, and W. Yin, Plug-and-play methods provably converge with properly trained denoisers, in International Conference on Machine Learning, PMLR, 2019, pp. 5546–5557.
- [65] N. N. Schraudolph, J. Yu, and S. G ¨unter, A stochastic quasi-Newton method for online convex optimization, in Artificial intelligence and statistics, PMLR, 2007, pp. 436–443.
- [66] S. Sreehari, S. V. Venkatakrishnan, B. Wohlberg, G. T. Buzzard, L. F. Drummy, J. P. Simmons, and C. A. Bouman, Plug-and-play priors for bright field electron tomography and sparse interpolation, IEEE Transactions on Computational Imaging, 2 (2016), pp. 408–423.
- [67] L. Stella, A. Themelis, and P. Patrinos, Forward–backward quasi-Newton methods for nonsmooth optimization problems, Computational Optimization and Applications, 67 (2017), pp. 443–487.
- [68] Y. Sun, J. Liu, Y. Sun, B. Wohlberg, and U. S. Kamilov, Async-red: A provably convergent asynchronous block parallel stochastic method using deep denoising priors, arXiv preprint arXiv:2010.01446, (2020).
- [69] Y. Sun, B. Wohlberg, and U. S. Kamilov, An online plug-and-play algorithm for regularized image reconstruction, IEEE Transactions on Computational Imaging, 5 (2019), pp. 395–408.
- [70] Y. Sun, Z. Wu, X. Xu, B. Wohlberg, and U. S. Kamilov, Scalable plug-and-play admm with convergence guarantees, IEEE Transactions on Computational Imaging, 7 (2021), pp. 849–863. 36 H. Y. TAN, S. MUKHERJEE, J. TANG, AND C.-B. SCH ¨ONLIEB
- [71] J. Tang, Accelerating plug-and-play image reconstruction via multi-stage sketched gradients, arXiv preprint arXiv:2203.07308, (2022).
- [72] E. Tjoa and C. Guan, A survey on explainable artificial intelligence (xai): Toward medical xai, IEEE transactions on neural networks and learning systems, 32 (2020), pp. 4793–4813.
- [73] A. Vellido, The importance of interpretability and visualization in machine learning for applications in medicine and health care, Neural computing and applications, 32 (2020), pp. 18069–18083.
- [74] S. V. Venkatakrishnan, C. A. Bouman, and B. Wohlberg, Plug-and-play priors for model based reconstruction, in 2013 IEEE Global Conference on Signal and Information Processing, IEEE, 2013, pp. 945–948.
- [75] X. W ang, S. Ma, D. Goldfarb, and W. Liu, Stochastic quasi-Newton methods for nonconvex stochastic optimization, SIAM Journal on Optimization, 27 (2017), pp. 927–956.
- [76] F. Wen, L. Chu, P. Liu, and R. C. Qiu, A survey on nonconvex regularization-based sparse and lowrank recovery in signal processing, statistics, and machine learning, IEEE Access, 6 (2018), pp. 69883– 69906.
- [77] K. Zhang, Y. Li, W. Zuo, L. Zhang, L. V an Gool, and R. Timofte, Plug-and-play image restoration with deep denoiser prior, IEEE Transactions on Pattern Analysis and Machine Intelligence, 44 (2021), pp. 6360–6376.
- [78] K. Zhang, W. Zuo, S. Gu, and L. Zhang, Learning deep cnn denoiser prior for image restoration, in IEEE Conference on Computer Vision and Pattern Recognition, 2017, pp. 3929–3938. PLUG-AND-PLAY QUASI-NEWTON METHODS 37 Appendix A. Convergence under KurdykaLojasiewicz (KL) Property. We wish to prove Theorem 2.13, which we restate below. The proof will be similar to that in [67, Thm 3.10], which we reproduce the proofs below for completeness. Theorem A.1. Suppose that f satisfies the KL condition and g is semialgebraic, and both are bounded from below. Suppose further that there exists constants ¯τ, c >0 such that τk < ¯τ and ∥dk∥ ≤c∥Rγk (xk)∥, β > 0, and that φ is coercive or has compact level sets. Then the sequence of iterates is finite and ends with Rγk (xk) = 0 or converges to a critical point of φ. Recall the definition of the KL property. Definition A.2 (KL Property [5, 10]). Suppose φ : Rd → R is proper and lower semicontinuous. h satisfies the KurdykaLojasiewicz (KL) property at a point x∗ in dom ∂φ if there exists η ∈ (0, +∞], a neighborhood U of x∗ and a continuous concave function Ψ : [0, η) → [0, +∞) such that: 1. Ψ(0) = 0 ; 2. Ψ is C1 on (0, η) 3. Ψ ′(s) > 0 for s ∈ (0, η); 4. For all u ∈ U ∩ {φ(x∗) < φ(u) < φ(x∗) + η}, we have ψ′(φ(u) − φ(x∗)) dist(0, ∂φ(u)) ≥ 1. We say that φ is a KL function if the KL property is satisfied at every point of dom ∂φ. Let us state the main assumption that will be used in the following lemmas. Assumption A.3. φ = f + g, where f is C1 with Lf -Lipschitz gradient, and g is M -weakly convex, proper and lower semicontinuous. Furthermore, assume γ0 < 1/M. Lemma A.4 ([67, Lem 6.6]). Assume Assumption A.3, and consider the sequences (xk), (wk) generated by MINFBE. If there exist ¯τ, c >0 such that τk ≤ ¯τ and ∥dk∥ ≤c∥Rγk (xk)∥, then (A.1) ∥xk+1 − xk∥ ≤γk∥Rγk (wk)∥ + ¯τ c∥Rγk (xk)∥ ∀k ∈ N and for k large enough, (A.2) ∥xk+1 − xk∥ ≤γk∥Rγk (wk)∥ + ¯τ c(1 + γkLf )∥Rγk−1(wk−1)∥. Proof. (A.1) follows from the triangle inequality, the definition of Rγ and τk ≤ ¯τ : ∥xk+1 − xk∥ = ∥xk+1 − wk + τkdk∥ ≤ ∥wk − Tγk (wk)∥ + ∥τkdk∥ ≤ γk∥Rγk (wk)∥ + ¯τ c∥Rγk (xk)∥. For k sufficiently large s.t. γk = γk−1 = γ∞ > 0 (c.f. Lemma 2.8), dropping the subscripts of 38 H. Y. TAN, S. MUKHERJEE, J. TANG, AND C.-B. SCH ¨ONLIEB the γ, ∥Rγ(xk)∥ = γ−1∥xk − Tγ(xk)∥ = γ−1∥Tγ(wk−1) − Tγ(xk)∥ ≤ γ−1∥wk−1 − γ∇f (wk−1) − xk + γ∇f (xk)∥ ≤ γ−1∥wk−1 − xk∥ + ∥∇f (wk−1) − ∇f (xk)∥ ≤ (1 + γLf )∥Rγ(wk−1)∥. where the first inequality follows from non-expansivity of proxγg as γ <1/M, the second from triangle inequality, and the final from ∇f being Lf -Lipschitz. Adding back the subscripts yields (A.2). Lemma A.5 ([67, Lem 6.7]). Let (βk)k∈N and (δk)k∈N be real sequences with βk, δk ≥ 0, δk+1 ≤ δk and β2 k+1 ≤ (δk − δk+1)βk for all k ∈ N. Then P∞ k=0 βk < ∞. Proof. As in

{% endraw %}
