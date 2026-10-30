---
layout: page
title: "用无限维连续归一化流学习贝叶斯逆问题的信息先验｜中文全文译文"
permalink: /papers/translations/2026-09-29-2609-03343-learning-informative-prior-with-infinite-dimensional-continuous-normal/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/4386e2c4091d2f81/) · [原文 arXiv](https://arxiv.org/abs/2609.03343) · [全部目录](/papers/catalog/)

# 用无限维连续归一化流学习贝叶斯逆问题的信息先验

**原题：** Learning Informative Prior with Infinite-Dimensional Continuous Normalizing Flow for Bayesian Inverse Problem  
**作者：** Yang Zhao（西安交通大学数学与统计学院）、Junxiong Jia（西安交通大学数学与统计学院，通讯作者）、Tao Zhou（中国科学院数学与系统科学研究院）。  
**版本：** arXiv:2609.03343v2（math.NA），v2 日期 2026 年 9 月 23 日；原文 41 页（正文 26 页 + 补充材料 15 页）。本页对应论文库 2026-09-29 条目。  
**范围与状态：** 全文中文译稿：摘要、第 1—6 节、图 1—6 图注、表 1—3、算法 1—2、致谢、参考文献 [1]—[47]（英文原条目）、补充材料（S 节 1—4，含定理 2.1 与全部证明）、补充材料参考文献 [1]—[10]。逐句逐式终校未做，不标记为已验收全文。

**关键词：** 泛函连续归一化流；偏微分方程逆问题；无限维贝叶斯分析；先验学习。  
**AMS 学科分类：** 65L09，49N45，62F15。

> **译注（符号与原文疑点）：** 原文的主要符号包括：可分 Hilbert 空间 $\mathcal H_u$、高斯参考测度 $\mu_0=\mathcal N(0,C_0)$、其 Cameron–Martin 空间 $\mathcal H=\mathcal H(\mu_0)$、f-CNF 前推测度 $\mu_{f_\theta}=f_{\theta\#}\mu_0$；$\det_1$ 与 $\det_2$ 分别表示 Fredholm–Carleman 行列式及其正则化版本（见补充材料 S1.1）。原文在引理 1 中用 $T_\theta(u)=f_\theta(u)-u$，而在定理 5 与补充材料定理 2.1 中用 $T_\theta(u)=u-f_\theta(u)$，两处的符号约定与 Radon–Nikodym 公式中的正负号存在不一致（详见第 2.2 节后的原文疑点注）；本页均按原文照录，未静默统一。另：原文正文脚注给出的 Zhao 的邮箱为 `zhaoyangxt@xjtu.edu.cn`，而补充材料末尾给出的是 `zhaoyangxt@stu.xjtu.edu.cn`，两处不一致，按原文保留。

## 摘要

本文研究偏微分方程（PDE）逆问题的无限维贝叶斯推断，其中模型参数位于无限维 Hilbert 空间中。为有效引入先验信息，我们提出一种新颖的、基于连续归一化流的无限维模型。具体地，通过在无限维空间中引入一个良定义的神经常微分方程，可以把简单的参考测度变换为编码先验信息的更复杂测度。我们建立了相应的理论框架，以保证所提出的无限维贝叶斯先验的适定性。我们还针对两种不同的数据设定给出该先验的训练方法，并给出两种针对所得贝叶斯后验的采样算法。所提框架被应用于三个具有代表性的逆问题：简单的光滑逆问题、逆散射问题与逆热传导问题。数值实验验证了理论分析，并展示了所提算法的有效性。

## 1 引言

从测量数据中估计由偏微分方程（PDE）支配的逆问题的无限维参数，是各类科学与工程领域中的基本问题 [25,4]。近年来，人们日益重视统计方法——它们不仅给出近似解，还能量化相关的不确定性；这一能力对伪影检测 [46] 等任务至关重要。

与确定性方法不同，贝叶斯推断为量化逆问题中的不确定性提供了统一框架 [5,22,13]，其最初在有限维空间中发展起来 [5,22]。然而，有限维方法往往无法刻画 PDE 逆问题的连续本质。为保留 PDE 逆问题内在的无限维结构，直接在无限维空间中定义贝叶斯推断已被广泛倡导 [21,11,20,39,33,34,13]。本文关注无限维贝叶斯反演 [13,38]，其核心研究由先验构造与高效数值算法两部分组成，二者对在无限维中实现精确且可行的反演都不可或缺。本文主要聚焦于先验测度的构造。

有效的先验对算法效率至关重要，因为它们充当正则项并编码关于模型参数的先验信息。构造结构化先验的一种常见策略是使用收敛级数展开，其系数从有限维分布中采样，由此得到均匀先验与高斯先验等 [13,38]。另一种流行的选择是保边 Besov 先验 [26]，它常借助 Haar 小波基实现，会施加限制性假设 [1]。作为替代，Markkanen 等人提出了 Cauchy 差先验 [30]，它能更好地适应逆问题中复杂的几何结构。尽管这些先验刻画了函数值参数的光滑性，却往往无法充分捕捉问题特定的结构以及某些逆问题中固有的历史信息。

为克服手工先验的局限，人们提出了数据驱动的先验学习方案，其中大多数要求在欧几里得设定下给出显式的参数样本。例如，Asim 等人用基于归一化流的可逆网络作为学得的图像先验，以捕捉真实信号并减轻去噪、压缩感知与修复中的重建偏差 [2]；Cai 等人提出 NF-ULA——一种由归一化流驱动的未调整 Langevin 算法，它学习显式图像先验以实现稳定的贝叶斯采样，并具有理论收敛保证 [7]。这些生成式学习方法擅长建模复杂分布，已成为传统手工先验的广泛替代。然而，这些方法依赖一种实验设定，即能够收集到潜在模型参数的全部训练样本。这种有利的数据条件在实际 PDE 逆问题中有时难以实现：在某些物理系统中模型参数无法被直接测量，我们只能获得由前向映射算子产生的间接观测输出。

为解决该问题，许多研究聚焦于间接先验学习——从同一 PDE 支配的一组相关逆问题的测量数据中提取共享的先验知识 [12,18,47]。例如，Akyildiz 等人 [47] 提出一个可扩展框架，从含噪间接测量中学习先验：它利用生成模型与切片 Wasserstein 距离做分布匹配，并采用神经算子以降低 PDE 仿真带来的沉重计算代价。Jia 等人 [19] 提出一种基于元学习与 PAC-贝叶斯理论的非参数贝叶斯先验学习方法：它直接从观测构造数据自适应先验，并为线性与非线性 PDE 系统建立泛化界，从而提升后验采样的效率与不确定性量化的可靠性。

除设计使用直接与间接数据集的训练方案外，在无限维空间上构造适定的先验分布是另一项关键任务。由于 Lebesgue 测度在无限维空间中没有良定义，通常的概率密度函数——解释为目标测度关于 Lebesgue 测度的 Radon–Nikodym（RN）导数——在此类空间中不再存在。然而，密度函数对后验采样（例如 Markov 链 Monte Carlo（MCMC）算法）与先验学习（例如通过负对数似然学习先验）都不可或缺。这促使我们为无限维空间上的 Lebesgue 型密度寻找有效的替代物。一种标准做法是引入公共参考测度 $\mu_0$，使目标测度 $\mu$ 关于其绝对连续，从而可用 RN 导数表述 $\mu$ [13]。值得注意的是，无限维测度常常相互奇异 [6]，这会破坏绝对连续性。因此，构造有效的无限维先验变得具有挑战性，因为它们必须关于参考测度绝对连续。

本文提出一种新的建模框架：用于贝叶斯反演的无限维**泛函连续归一化流**（functional continuous normalizing flows，f-CNF）。该框架天然适用于贝叶斯先验的构造。通过从 PDE 模型的历史数据集中学习，所生成的先验（下文称为 f-CNF 先验）使贝叶斯框架能够给出更精确的后验，尤其当似然信息不充分时。我们的 f-CNF 架构被严格构造为：通过一个参数化的神经常微分方程（ODE），把简单的参考测度变换为复杂的目标测度（用作先验）。该构造保持测度等价性，使所得先验能由 RN 导数有效刻画。通过优化 f-CNF 的参数，我们能够把历史信息纳入贝叶斯先验。

在数值实验中，我们针对两类数据设计无限维先验的学习：直接参数样本与间接观测数据。从直接数据学习构造一个无限维生成模型，它随后作为贝叶斯先验使用。因此，与现有的无限维生成模型 [14,32,23,36] 不同，我们必须保证绝对连续性，并确保相应的 RN 导数可解析处理；详见第 2.2 小节。对间接数据训练，我们采用与 [47] 类似的 Wasserstein 损失；他们的工作只优化有限的一组参数，而我们训练整个 f-CNF 网络以获得更好的灵活性。在完成 f-CNF 先验的学习之后，我们将其与预条件 Crank–Nicolson（pCN）[11] 以及带高斯混合的序贯 Monte Carlo（SMC-GM）[29] 算法结合，构造专用的后验采样器。三个数值实验验证了我们的先验学习与采样方案的有效性。

总之，本文主要有三项贡献：

1. 扩展我们此前的工作 [41]，我们首次把神经 ODE 框架引入无限维贝叶斯分析。来自 [41] 的测度等价定理被推广到更广的一类流映射，保证测度等价并为我们的 f-CNF 模型给出显式的 RN 导数。这为在先验学习与后验采样中把 f-CNF 用作贝叶斯先验奠定了严格基础。
2. 我们把有限维对数似然损失 [8,7] 推广到无限维：用参考测度替换无定义的 Lebesgue 测度，并借助 RN 导数为直接数据训练推导出严格的损失函数。这一新损失函数保留了无限维函数空间的结构，从而保证 f-CNF 模型训练的稳定性。
3. 我们验证了在训练所得 f-CNF 先验下 Bayes 公式的适定性。此外，通过集成现有的 pCN 与 SMC-GM 算法，我们开发了针对所提 f-CNF 先验定制的后验采样算法。在三个典型 PDE 逆问题——简单光滑反演、逆散射问题与逆热传导问题——上的数值实验展示了所提方法的有效性与一般性。

本文其余部分组织如下。第 2 节介绍 f-CNF 框架。第 3 节回顾无限维贝叶斯逆问题，明确 f-CNF 先验，构造定制采样器，并给出 f-CNF 的训练方案。第 4 节分析带 f-CNF 先验的后验适定性。第 5 节通过三个典型 PDE 逆问题验证我们的算法。第 6 节总结全文并展望未来研究方向。

## 2 泛函连续归一化流

本节建立无限维空间中 f-CNF 的理论框架。为绕开无限维空间中测度奇异性带来的障碍并实现"密度估计"，我们为所提 f-CNF 模型给出新的理论框架，并给出相应 RN 导数的显式计算。

### 2.1 基本设定

Chen 等人为数据 $x\in\mathbb R^D$ 提出的生成模型称为连续归一化流 [8]，它由连续时间动力学表述。生成过程首先从基础分布 $p_{z_0}(z_0)$ 中采样 $z_0$，该 $z_0$ 随后作为由参数化函数 $h(z(t),t;\theta)$ 定义的 ODE 的初值。在区间 $[t_0,t_1]$ 上求解初值问题 $\partial z(t)/\partial t=h(z(t),t;\theta)$（$z(t_0)=z_0$），得到表示变换后数据的 $z(t_1)$。该概念可自然地推广到无限维空间。我们考虑无限维空间中的如下 ODE [45]：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=h(v(t),t;\theta),\\[1mm]
v(0)=u_0,
\end{cases}\tag{1}
$$

其中 $u_0$ 表示从可分 Hilbert 空间 $\mathcal H_u$ 上的高斯测度 $\mu_0=\mathcal N(0,C_0)$ 中采样的初始函数，$h$ 表示从 $\mathcal H_u\times\mathbb R$ 到 $\mathcal H_u$ 的映射，带有参数 $\theta\in\Theta$（此处 $\Theta$ 表示全部可训练神经网络参数构成的空间）。ODE（1）随后把初始函数 $u_0\in\mathcal H_u$ 沿时间向前传播，在时刻 $T$ 产生终端解 $v(T)=u_T\in\mathcal H_u$。

对固定参数 $\theta\in\Theta$，当 ODE（1）的函数 $h(v,t;\theta)$ 满足全局 Lipschitz 条件（即对 $u_1,u_2\in\mathcal H_u$ 有 $\|h(u_1,t;\theta)-h(u_2,t;\theta)\|_{\mathcal H_u}\le L\|u_1-u_2\|_{\mathcal H_u}$，其中 $L$ 为不依赖 $t$ 的常数）并且有界（即对任意 $(v,t)\in\mathcal H_u\times\mathbb R$ 有 $\|h(v,t;\theta)\|_{\mathcal H_u}\le K$，其中 $K$ 为不依赖 $u$ 与 $t$ 的常数）时，ODE（1）存在唯一解 [45]。在此情形下，整个 ODE 传播过程（把 $u_0$ 变换为 $u_T$）可视为从无限维 Hilbert 空间 $\mathcal H_u$ 到自身的映射，记为 $f_\theta$：

$$
f_\theta(u_0)=u_T,\tag{2}
$$

而 $u_T$ 可视为从测度 $\mu_{f_\theta}=f_{\theta\#}\mu_0$ 中取得的样本。这里 $f_{\theta\#}\mu_0$ 表示由 $\mu_0$ 诱导的推前测度（pushforward measure）[6]。对任意 Borel 集 $B$，推前测度严格定义为 $(f_{\theta\#}\mu_0)(B):=\mu_0\left(f_\theta^{-1}(B)\right)$，其中 $f_\theta^{-1}(B)=\{u\,|\,f_\theta(u)\in B\}$ 表示 $B$ 在 $f_\theta$ 下的原像。此外，$f_\theta$ 具有由反向 ODE [45] 支配的逆映射：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=h(v(t),t;\theta),\\[1mm]
v(T)=u_T.
\end{cases}\tag{3}
$$

该反向流把 $u_T$ 映射为 $u_0=v(0)$，记为 $g_\theta(u_T)=u_0$。由于 ODE（1）与（3）的解存在且唯一，容易验证 $g_\theta$ 与 $f_\theta$ 互为逆映射。

通过无限维 Hilbert 空间 $\mathcal H_u$ 上的映射 $f_\theta$，我们构造 $\mathcal H_u$ 上的参数化测度 $\mu_{f_\theta}$。改变 $\theta\in\Theta$ 赋予 $\mu_{f_\theta}$ 丰富的逼近能力。我们的核心策略是把 PDE 逆问题的历史信息嵌入 $\mu_{f_\theta}$，并将 $\mu_{f_\theta}$ 作为贝叶斯先验以提升后验精度。在展开该思想之前，我们必须先解决下一小节中关于无限维空间的一个基本问题。

### 2.2 Radon–Nikodym 导数

由于其无限维本质，无限维 Hilbert 空间不存在平移不变的 Lebesgue 测度。因此，欧几里得空间中常用的 Lebesgue 密度函数在无限维空间 $\mathcal H_u$ 中并不存在。作为替代，人们常用关于另一公共测度的 RN 导数来代替 Lebesgue 密度函数，以刻画无限维空间中的测度 [13]。具体地，假设我们希望刻画目标测度 $\mu_{\mathrm{target}}$，一种常见做法是先确定参考测度 $\mu_{\mathrm{simple}}$，保证 $\mu_{\mathrm{target}}$ 关于 $\mu_{\mathrm{simple}}$ 绝对连续（或满足更强的条件：$\mu_{\mathrm{target}}$ 与 $\mu_{\mathrm{simple}}$ 等价）。在此条件下，$\mu_{\mathrm{target}}$ 可由 RN 导数 $\dfrac{\mathrm d\mu_{\mathrm{target}}}{\mathrm d\mu_{\mathrm{simple}}}(u)$ 描述。

值得注意的是，RN 导数仅在测度 $\mu_{\mathrm{target}}$ 关于测度 $\mu_{\mathrm{simple}}$ 绝对连续时才有意义。考虑第 2.1 小节构造的推前测度 $\mu_{f_\theta}=f_{\theta\#}\mu_0$，用 RN 导数刻画它需要找到一个具有绝对连续性质的参考测度。一个自然的候选是我们 f-CNF 模型 $f_\theta$ 变换前的测度 $\mu_0$。于是产生一个相关问题：我们能否设计 ODE 流 $f_\theta$，使 $\mu_{f_\theta}$ 关于 $\mu_0$ 绝对连续？

与欧几里得空间中的测度不同，无限维空间中的测度天然倾向于相互奇异。对 $m\notin\mathcal H(\mu_0)$（这里 $\mathcal H(\mu_0)$ 表示 $\mu_0$ 的 Cameron–Martin 空间 [6]），平移推前测度 $\mu_m=f_{m\#}\mu_0$（其中 $f_m(u)=u+m$）与 $\mu_0$ 奇异。类似地，对 $f_2(u)=2u$，缩放推前测度 $\mu_2=f_{2\#}\mu_0$ 也关于 $\mu_0$ 奇异。这些例子表明，平移与缩放通常会在无限维空间上产生奇异的高斯测度 [6]。$f_m$ 与 $f_2$ 虽然简单，却把 $\mu_0$ 映射为奇异测度，违背了 RN 导数所需的绝对连续性。因此，构造既具有表达力又保持绝对连续的流并非易事。我们借助下述一般定理解决该问题，该定理保证 $\mu_{f_\theta}$ 与 $\mu_0$ 等价。

值得注意的是，连续归一化流可视为离散归一化流 [8] 的连续时间扩展。因此，我们的做法是：先建立无限维空间中归一化流的等价性，再通过对测度取极限把理论推广到无限维空间中的连续归一化流。该理论框架分为三部分。第一，我们建立泛函归一化流的测度等价理论；我们的前期工作 [41] 中已出现类似结果，但这里给出一项关键的推广。第二，我们建立测度的极限定理，使等价理论得以从离散情形（泛函归一化流）推广到连续情形（本文所提 f-CNF 模型）。最后，我们给出无限维空间中连续归一化流的相应理论。全部证明见补充材料。

首先，我们建立保证泛函归一化流变换前后测度等价的条件。该结果细化了我们在 [41] 中的先前结论，详述如下。

**引理 1：** 设 $\mathcal H_u$ 为可分 Hilbert 空间，配备高斯测度 $\mu_0=\mathcal N(0,C_0)$，$\mathcal H=\mathcal H(\mu_0)$ 为测度 $\mu_0$ 的 Cameron–Martin 空间。对每个 $n=1,2,\dots,N$，令 $f^{(n)}_{\theta_n}(u)=u+F^{(n)}_{\theta_n}(u)$，其中 $F^{(n)}_{\theta_n}$ 是从 $\mathcal H_u$ 到 $\mathcal H_u$ 的算子。复合变换 $f_\theta$ 由 $f_\theta(u)=f^{(N)}_{\theta_N}\circ f^{(N-1)}_{\theta_{N-1}}\circ\cdots\circ f^{(1)}_{\theta_1}(u)$ 给出，$\mu_{f_\theta}=f_{\theta\#}\mu_0$ 表示其相应推前测度。若对任意 $\theta\in\Theta$，对所有 $n=1,2,\dots,N$ 下列条件成立：

- $\mathrm{Im}\left(F^{(n)}_{\theta_n}\right)\subset\mathcal H$，其中 $\mathrm{Im}\left(F^{(n)}_{\theta_n}\right)$ 表示 $F^{(n)}_{\theta_n}$ 的像；
- 对任意 $u\in\mathcal H_u$，$DF^{(n)}_{\theta_n}(u)$ 是迹类（trace class）算子；
- 算子 $f^{(n)}_{\theta_n}$ 是双射；
- 对任意 $u\in\mathcal H_u$，$DF^{(n)}_{\theta_n}(u)$ 的所有点谱均不在 $(-\infty,-1]$ 中；

则 $\mu_{f_\theta}$ 与 $\mu_0$ 等价，且 $\mu_{f_\theta}$ 关于 $\mu_0$ 的 RN 导数为

$$
\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}\left(f_\theta(u)\right)
=\prod_{n=1}^{N}\left|\det_1\left(Df^{(n)}_{\theta_n}(u_{n-1})\right)\right|^{-1}
\exp\left(\frac12\left\langle T_\theta(u),T_\theta(u)\right\rangle_{\mathcal H}
+\left\langle u,T_\theta(u)\right\rangle_{\mathcal H}\right),
$$

其中 $u_n=f^{(n)}_{\theta_n}\circ f^{(n-1)}_{\theta_{n-1}}\circ\cdots\circ f^{(1)}_{\theta_1}(u)$（$n=1,2,\dots,N$），$T_\theta(u)=f_\theta(u)-u$，$\det_1\left(Df^{(n)}_{\theta_n}(u_{n-1})\right)$ 是线性算子 $Df^{(n)}_{\theta_n}(u_{n-1})$ 的 Fredholm–Carleman 行列式 [6]（严格定义见补充材料）。

f-CNF 是其离散对应物的连续时间极限。用 Euler 格式离散 ODE（1）可还原标准的泛函归一化流；让步长趋于零即把该离散流精细化（refine）为 f-CNF。下面我们建立相应的测度论极限理论，保证无限维归一化流的优良性质在该取极限过程中得以保持。

**定理 2：** 设 $\mu_0$ 为可分 Hilbert 空间 $\mathcal H_u$ 上的高斯测度，$\{f_N\}_{N\in\mathbb N_+}$ 为从 $\mathcal H_u$ 到自身的一列可测映射。假设下列条件成立：

- 存在映射 $f:\mathcal H_u\to\mathcal H_u$，使得对任意 $u\in\mathcal H_u$ 有 $\lim_{N\to\infty}\|f_N(u)-f(u)\|_{\mathcal H_u}=0$；
- 对任意 $N\in\mathbb N_+$，测度 $\mu_0$ 与 $f_{N\#}\mu_0$ 等价，且 RN 导数为 $\dfrac{\mathrm df_{N\#}\mu_0}{\mathrm d\mu_0}(u)=W_N(u)$；
- 存在 $\mu_0$-可积函数 $g$，使得对所有 $N$，$|W_N(u)|\le g(u)$ 在 $\mu_0$-几乎必然意义下成立；
- 极限 $\lim_{N\to\infty}W_N(u)=W(u)$ 在 $\mu_0$-几乎必然意义下存在，且极限函数满足 $W(u)>0$。

则 $\mu_0$ 与 $f_\#\mu_0$ 等价，其 RN 导数由下式给出：

$$
\frac{\mathrm df_\#\mu_0}{\mathrm d\mu_0}(u)=W(u).
$$

最后，结合引理 1 与定理 2，我们得到连续归一化流在无限维空间上保持测度等价的条件。在给出主定理之前，先引入必要的函数空间定义。

**定义 3（详见 [6]）：** 设 $\mathcal H$ 为 $\mu_0$ 的 Cameron–Martin 空间。记 $\mathrm{HC}^1(\mu_0,\mathcal H)$ 为所有 $\mu_0$-可测映射 $F:\mathcal H_u\to\mathcal H$ 构成的类，满足：对几乎每个 $u\in\mathcal H_u$，映射 $h\mapsto F(u+h)$ 沿 $\mathcal H$ 是 Fréchet 可微的，且其导数为 Hilbert–Schmidt 算子，并使映射 $h\mapsto DF(u+h),\ \mathcal H\to\mathcal H^*$ 连续。这里 $DF(u)$ 表示 $F(u)$ 在点 $u$ 处的 Fréchet 导数，$\mathcal H^*$ 表示 $\mathcal H$ 的对偶空间。

**定义 4：** 设 $\mu_0$ 为 $\mathcal H_u$ 上的高斯测度 $\mathcal N(0,C_0)$，$\mathcal H$ 为其 Cameron–Martin 空间。定义 $\mathcal T(\mu_0,[0,T],\mathcal H)$ 为把 $\mathcal H_u\times[0,T]$ 映入 $\mathcal H_u$ 的函数 $h(u,t)$ 构成的集合，且满足以下条件：

- 对每个 $t\in[0,T]$，$h(\cdot,t)\in\mathrm{HC}^1(\mu_0,\mathcal H)$；
- $\sup_{t\in[0,T],\,u\in\mathcal H_u}\left\|C_0^{-1}h(u,t)\right\|_{\mathcal H_u}\le M_1<\infty$；
- $\sup_{t\in[0,T],\,u\in\mathcal H_u}\left\|Dh(u,t)\right\|_1\le M_2<\infty$，其中 $\|\cdot\|_1=\mathrm{tr}(|\cdot|)$；
- 对每个 $t\in[0,T]$，$h(\cdot,t)$ 是 Lipschitz 连续的，即 $\|h(u_1,t)-h(u_2,t)\|_{\mathcal H_u}\le L\|u_1-u_2\|_{\mathcal H_u}$。

这里常数 $M_1$、$M_2$、$L$ 均不依赖 $u$ 与 $t$，$\mathrm{tr}(|\cdot|)$ 表示迹范数 [35]。

随后，我们给出 f-CNF 模型的测度等价定理，并推导相应的 RN 导数表达式。

**定理 5：** 考虑如下 ODE：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=h(v(t),t;\theta),\\[1mm]
v(0)=u.
\end{cases}\tag{4}
$$

假设对所有 $\theta\in\Theta$ 有 $h(u,t;\theta)\in\mathcal T(\mu_0,[0,T],\mathcal H)$，并令 $f_\theta$ 表示与式（2）类似定义的推前映射。则 $f_{\theta\#}\mu_0$ 与 $\mu_0$ 等价。令 $T_\theta(u)=u-f_\theta(u)$，RN 导数为

$$
\frac{\mathrm df_{\theta\#}\mu_0}{\mathrm d\mu_0}\left(f_\theta(u)\right)=W_\theta\left(f_\theta(u)\right)
=\exp\left(\frac12\|T_\theta(u)\|^2_{\mathcal H}+\left\langle u,T_\theta(u)\right\rangle_{\mathcal H}
-\int_0^T\mathrm{Tr}\,Dh(v(t),t;\theta)\,\mathrm dt\right),
$$

其中 $v(t)$ 表示以 $v(0)=u$ 为初值的（4）的解。

> **原文疑点：** 引理 1 中定义 $T_\theta(u)=f_\theta(u)-u$，而定理 5 与补充材料定理 2.1 中定义 $T_\theta(u)=u-f_\theta(u)$；但三处的 RN 公式都写作 $\exp\left(\frac12\|T_\theta\|^2+\langle u,T_\theta\rangle-\int\mathrm{Tr}\,Dh\right)$（定理 5），并都使用相同的正号。若严格按定理 5 的定义代入，则 $\frac12\|T_\theta\|^2+\langle u,T_\theta\rangle$ 与引理 1 的对应项相差整体符号，理论上应出现 $-1$ 倍差别。这属于原文符号约定的不一致，本页按原文逐式照录，未自行统一。

在定理 5 所保证的条件下，只要 ODE（4）是适定的，变换 $f_\theta$ 就把先验测度 $\mu_0$ 前推为与 $\mu_0$ 等价的新测度 $\mu_{f_\theta}=f_{\theta\#}\mu_0$，并且相应的 RN 导数可以显式计算。在本文余下部分，我们展示所提 f-CNF 如何应用于各类 PDE 逆问题。
## 3 逆问题与贝叶斯先验

### 3.1 逆问题的贝叶斯方法

对一大类涉及 PDE 的逆问题，实践中采用稀疏测量数据 [10,31]，因为这类数据更易获取。本小节介绍带有限维稀疏数据的无限维贝叶斯逆问题的基础概念。

设 $\mathcal H_u$ 与 $\mathcal H_w$ 为可分 Hilbert 空间，分别表示参数空间与解空间，$N_d$ 为正整数。由于测量常受噪声扰动，考虑观测模型

$$
d=\mathcal S\mathcal G(u)+\epsilon,\tag{5}
$$

其中 $d\in\mathbb R^{N_d}$ 表示测量数据，$u\in\mathcal H_u$ 为感兴趣的参数，$\mathcal G$ 为从 $\mathcal H_u$ 到 $\mathcal H_w$ 的 PDE 解算子，$\mathcal S$ 为从 $\mathcal H_w$ 到 $\mathbb R^{N_d}$ 的测量算子，$\epsilon$ 为高斯噪声。基于无限维贝叶斯推断的框架 [40]，我们能够保留逆问题的基本 Bayes 公式：

$$
\frac{\mathrm d\mu}{\mathrm d\mu_{\mathrm{prior}}}(u)=\frac{1}{Z_\mu}L(d|\cdot),\tag{6}
$$

其中 $L(d|\cdot):=\exp(-\Phi(d|\cdot)):\mathcal H_u\to\mathbb R$ 为似然函数，$Z_\mu$ 为由 $Z_\mu=\int_{\mathcal H_u}\exp(-\Phi(d|u))\,\mu_{\mathrm{prior}}(\mathrm du)$ 给出的正有限常数。

选择合适的先验分布 $\mu_{\mathrm{prior}}$ 对获得合适的贝叶斯后验至关重要。本节我们基于第 2.1 小节引入的 f-CNF 模型提出一种先验。该先验能够纳入来自历史数据的信息，使贝叶斯框架给出更精确的后验，尤其当似然函数提供的信息有限时。

### 3.2 作为先验的泛函连续归一化流

本小节提出把 f-CNF 模型的推前测度用作无限维空间上的合适先验（$\mu_{\mathrm{prior}}=\mu_{f_\theta}$，其中 $\mu_{f_\theta}$ 为第 2.1 小节所示变换后的测度）。通过在已有历史数据集上训练 f-CNF，我们可以把历史信息编码进先验（下文称为 f-CNF 先验）。在这一配置下，贝叶斯先验有效编码历史信息，而 Bayes 公式中的似然分量 $L(d|u)$ 则计入逆问题的测量数据。借助定理 5，我们给出 f-CNF 先验的 RN 估计：$\dfrac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)=\exp(W_\theta(u))$。在此选择下，Bayes 公式变为

$$
\frac{\mathrm d\mu}{\mathrm d\mu_{f_\theta}}(u)=\frac{1}{Z^\theta_\mu}\exp(-\Phi(d|u)).\tag{7}
$$

其中 $Z^\theta_\mu$ 为由 $Z^\theta_\mu=\int_{\mathcal H_u}\exp(-\Phi(d|u))\,\mu_{f_\theta}(\mathrm du)$ 给出的正有限常数。

恢复模型参数需要由（7）做后验推断，通常通过 MCMC 采样实现。然而，由于经典的无限维 MCMC 采样算法（例如 pCN [11,13]）通常基于高斯先验，需要把贝叶斯表述（7）用 f-CNF 变换前的高斯测度 $\mu_0$ 表示为

$$
\frac{\mathrm d\mu}{\mathrm d\mu_0}(u)=\frac{1}{Z^\theta_\mu}\exp\left(-\Phi(d|u)+W_\theta(u)\right).\tag{8}
$$

由公式（8）可见，与直接把测度 $\mu_0$ 用作先验相比，表述（8）给出的是经由训练好的 f-CNF 模型 $f_\theta$ 从 $\mu_0$ 变换得到的新先验分布，其中变换隐含地体现在 $W_\theta(u)$ 项中。该项直接依赖 $f_\theta$，能够有效纳入历史数据集中的有用信息。

我们的 f-CNF 先验与 TV-Gaussian 先验 [44] 具有相似的框架。TV-Gaussian 先验用手工设计的 TV 正则项构造其 RN 密度 $\dfrac{\mathrm d\mu_{\mathrm{pr}}}{\mathrm d\mu_0}(u)\propto\exp(-\lambda\|u\|_{\mathrm{TV}})$，而我们的先验采用与神经流 $f_\theta$ 耦合的 $W_\theta(u)$ 来刻画密度。具体地，TV-Gaussian 先验着眼于精确拟合具有局部跳变与尖锐不连续的函数，而我们的数据驱动 f-CNF 先验能够从多样化的历史数据集中学习一般先验知识。此外，在应用 pCN 算法时，类似于 TV-Gaussian 框架 [44] 中广泛使用的分裂加速策略，基于 f-CNF 的后验同样可用该技术加速，详见补充材料。

尽管 pCN 算法在样本充足时能给出精确的后验近似 [33,34,11]，并可直接通过 Bayes 公式（8）应用，但其混合时间极长，尤其当与昂贵的前向求解器配合时。因此，受 [29] 启发，我们为 f-CNF 先验采用定制的带高斯混合的序贯 Monte Carlo（SMC-GM）算法以加速采样。

SMC-GM 是用于无限维贝叶斯逆问题的高效序贯 Monte Carlo 算法。它采用高斯混合变异（mutation）替代标准 MCMC 更新，通过势函数调整粒子权重，并进行重采样以避免粒子退化。借助逐步引入测量信息的分阶段（tempering）调度，该算法迭代地把先验样本从 $\mu_{f_\theta}$ 变换为后验样本。关于完整的算法推广与理论分析，读者可参阅 [29]；我们在补充材料中给出 pCN 与 SMC-GM 算法的完整实现细节。

### 3.3 使用直接数据集训练

上一节讨论了带 f-CNF 先验的后验采样。本节及后续小节给出两种面向不同数据场景的 f-CNF 先验学习策略。具体地，本小节聚焦使用模型参数直接数据集的学习方法。

例如，考虑定义在 $\mathcal H_u$ 上的大型历史数据集 $\mathcal D_1=\{u_n\}_{n=1}^{N_{\mathrm{total}}}$，其中每个 $u_n$ 都是从模型参数的数据生成测度 $\mu_{\mathrm{data}}$ 中抽取的样本。为从这些经验样本构造数据信息先验，我们采用生成流模型。具体地，我们训练 f-CNF 推前测度 $\mu_{f_\theta}$，使 $\mathcal D_1$ 近似服从 $\mu_{f_\theta}$。这把 $\mathcal D_1$ 中的全部信息嵌入到学习到的先验 $\mu_{f_\theta}$ 中，后者随后可作为新观测数据 $d$ 的有效贝叶斯先验。训练过程与欧几里得空间上连续归一化流生成建模的标准设定一致 [8]。

我们以带 RN 导数的无限维负对数似然作为损失函数：

$$
\mathcal L_1(\theta)=-\mathbb E_{\mu_{\mathrm{data}}}\left(\ln\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)\right)
\approx\widehat{\mathcal L}_1(\theta)=-\frac{1}{N_{\mathrm{total}}}\sum_{n=1}^{N_{\mathrm{total}}}\ln\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u_n).
$$

具体训练算法见算法 1。

**备注 6：** 欧几里得模型通过最小化 $-\mathbb E_{\mu_{\mathrm{data}}}[\ln p_\theta(x)]$ 来拟合 $\mu_{\mathrm{data}}$。相比之下，无限维空间不存在 Lebesgue 测度，因此损失将采用关于参考测度 $\mu_0$ 的 RN 导数，而 $\mu_0$ 的选择不影响优化。对任意与 $\mu_0$ 等价的测度 $\mu_1$，有

$$
-\mathbb E_{\mu_{\mathrm{data}}}\ln\left(\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_1}(u)\right)
=-\mathbb E_{\mu_{\mathrm{data}}}\left[\ln\left(\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)\right)
+\ln\left(\frac{\mathrm d\mu_0}{\mathrm d\mu_1}(u)\right)\right],\tag{9}
$$

其中项 $\mathbb E_{\mu_{\mathrm{data}}}\ln\left(\frac{\mathrm d\mu_0}{\mathrm d\mu_1}(u)\right)$ 与 $\theta$ 无关，优化时可以略去。

### 3.4 使用间接数据集训练

在先验分布学习中，真实模型参数在实际应用中通常不可观测。多数情况下，可用的历史记录是来自真实世界过程的物理测量，而非感兴趣未知参数的直接样本。为解决该问题，人们发展了多种间接先验学习方法，从观测测量而非显式参数样本中推断先验。本小节采用 [47] 的框架与数据构造策略，给出 f-CNF 模型的实际应用。

文献 [19,47] 考虑这样的设定：拥有大量历史测量数据，汇总为 $\mathcal D_2=\{d_n\}_{n=1}^{N_{\mathrm{total}}}$。$\mathcal D_2$ 中的所有测量均通过观测模型 $d=\mathcal S_{\mathrm{data}}\mathcal G(u)+\epsilon_{\mathrm{data}}$ 生成，其中 $\epsilon_{\mathrm{data}}$ 表示观测噪声，$\mathcal S_{\mathrm{data}}$ 表示作用于 PDE 解的观测算子。具体地，存在潜在的模型参数集合 $\mathcal D_{\mathrm{hid}}=\{u_i\}_{i=1}^{N_{\mathrm{total}}}$，使得 $\mathcal D_2=\{d_i\,|\,d_i=\mathcal S_{\mathrm{data}}\mathcal G(u_i)+\epsilon_{\mathrm{data}},\ u_i\in\mathcal D_{\mathrm{hid}}\}$。显然，关于 $\mathcal D_{\mathrm{hid}}$ 的全部可获取信息都包含在可观测数据集 $\mathcal D_2$ 中。我们的目标是利用 $\mathcal D_2$ 的观测信息训练 f-CNF 先验 $\mu_{f_\theta}$，使 $\mu_{f_\theta}$ 能准确逼近潜在数据集 $\mathcal D_{\mathrm{hid}}$。

在此类情形下，f-CNF 先验 $\mu_{f_\theta}$ 无法再用负对数似然损失训练。这里与 [47] 类似，我们的损失建立在 Sinkhorn 距离之上——它是熵正则化的 Wasserstein 变体，旨在绕开原始 Wasserstein 距离的计算瓶颈并为深度学习提供高效可微损失。损失函数的具体形式为

$$
\mathcal L_2(P,Q)=W^2_\alpha(P,Q)=\min_{\pi\in\Pi(P,Q)}\mathbb E_{(x,y)\sim\pi}\left[\|x-y\|^2_{\mathbb R^{N_d}}\right]+\alpha H(\pi),
$$

其中 $P$ 与 $Q$ 表示两个仅能获得样本、而精确密度未知的分布，$H(\pi)$ 表示传输计划 $\pi$ 的熵。关于该距离的更多细节见 [17]。

在本小节的假设下，历史参数信息经由大量测量 $\mathcal D_2=\{d_n\}_{n=1}^{N_{\mathrm{total}}}$ 被编码。设 $\nu$ 表示 $\{d_n\}_{n=1}^{N_{\mathrm{total}}}$ 的分布律。假设 $\bar d_n=\mathcal S_{\mathrm{data}}\mathcal G(u_n)+\epsilon_{\mathrm{data}}$，其中 $\{u_n\}_{n=1}^{N_{\mathrm{total}}}$ 为取自 $\mu_{f_\theta}$ 的样本，并令 $\bar\nu$ 表示 $\{\bar d_n\}_{n=1}^{N_{\mathrm{total}}}$ 的分布律。我们的目标是确保 $\bar\nu$ 在适当意义下接近 $\nu$。值得注意的是，虽然测度 $\nu$ 与 $\bar\nu$ 的显式形式未知，但其相关样本易于获得。实践中，这类测度常由经验对应物表示。为有效且高效地比较这些经验测度，我们采用 $\mathcal L_2$ 作为训练的损失函数。

记 $\ast$ 表示测度的卷积。通过引入测量空间中概率测度之间的距离 $\mathcal L_2$，本小节的损失函数定义为

$$
\mathcal J(\theta)=\mathcal L_2(\nu,\bar\nu)
=\mathcal L_2\left(\nu,\eta\ast(\mathcal S\mathcal G)_\#\mu_{f_\theta}\right),
$$

其中 $\eta$ 表示数据噪声 $\epsilon_{\mathrm{data}}$ 的高斯分布，即 $\epsilon_{\mathrm{data}}\sim\eta$。该损失函数的详细理论分析见 [47]，具体训练算法见算法 2。

**算法 1：面向直接数据的 f-CNF**

1. 初始化参数 $\theta\leftarrow\theta_0$、批大小 $N$、迭代次数 $K$、学习率调度 $\alpha_k$，置迭代计数 $k\leftarrow0$。
2. **repeat**
3. 　从完整数据集 $\mathcal D_1=\{u_n\}_{n=1}^{N_{\mathrm{total}}}$ 中采样大小为 $N$ 的小批函数 $\{u_i\}_{i=1}^{N}$。
4. 　通过梯度下降更新参数：$\theta_{k+1}=\theta_k-\alpha_k\nabla_{\theta_k}\widehat{\mathcal L}_1(\theta_k)$。该步可方便地采用随机梯度类优化器，如 Adam [24]。
5. 　置 $k\leftarrow k+1$。
6. **until** $k=K$
7. 返回学到的参数 $\theta=\theta_K$。

**算法 2：面向间接数据的 f-CNF**

1. 初始化参数 $\theta\leftarrow\theta_0$、批大小 $N$、总迭代次数 $K$、学习率调度 $\{\alpha_k\}$，置迭代计数 $k\leftarrow0$。
2. **repeat**
3. 　从 $\mu_{f_{\theta_k}}$ 中抽取 $N$ 个函数 $\{u_i\}_{i=1}^{N}$。
4. 　对 $i=1,\dots,N$，计算模拟观测 $\bar d_i=\mathcal S\mathcal G(u_i)+\epsilon$。
5. 　从完整数据集 $\{d_i\}_{i=1}^{N_{\mathrm{total}}}$ 中采样大小为 $N$ 的小批测量数据 $\{d_i\}_{i=1}^{N}$。
6. 　由 $\{d_i\}_{i=1}^{N}$ 与 $\{\bar d_i\}_{i=1}^{N}$ 的经验均值近似精确期望，计算损失 $\mathcal J(\theta_k)=\mathcal L_2(\nu,\bar\nu)$。
7. 　通过梯度下降更新参数：$\theta_{k+1}=\theta_k-\alpha_k\nabla_{\theta_k}\mathcal J(\theta_k)$。该步可方便地采用随机梯度类优化器，如 Adam [24]。
8. 　置 $k\leftarrow k+1$。
9. **until** $k=K$
10. 返回学到的参数 $\theta_K$。

值得注意的是，与第 3.3 小节讨论的使用大量模型参数历史数据集训练 f-CNF 先验相比，从历史测量数据 $\{d_n\}_{n=1}^{N_{\mathrm{total}}}$ 学习先验通常要困难得多。具体地，考虑前向问题 $d=\mathcal S_{\mathrm{data}}\mathcal G(u)+\epsilon_{\mathrm{data}}$：当前向 PDE 过程（与 $\mathcal G$ 相关）发生过多信息损失、测量点数量不足（与 $\mathcal S_{\mathrm{data}}$ 相关）、或测量噪声过大（与 $\epsilon_{\mathrm{data}}$ 相关）时，数据集 $\{d_n\}_{n=1}^{N_{\mathrm{total}}}$ 中包含的关于 $u$ 的信息会减少，从而给 f-CNF 的参数训练带来显著困难。

### 3.5 其他设定

前两小节给出了所提 f-CNF 模型在拥有大量模型参数 $\mathcal D_1=\{u_n\}_{n=1}^{N_{\mathrm{total}}}$ 或大量测量数据 $\mathcal D_2=\{d_n\}_{n=1}^{N_{\mathrm{total}}}$ 时的应用。事实上，f-CNF 先验适用于更广泛的场景，并可与各种现有方法结合。例如，它可以嵌入元学习范式。如 [19] 所研究，那里建立了无限维 PAC-贝叶斯框架来学习数据自适应先验，从而得到更任务特定的先验并提升采样效率。不过，他们的工作只关注高斯先验；在该框架中用 f-CNF 先验替换高斯先验是未来一项有价值的研究方向。

此外，f-CNF 模型可以与泛函流匹配（functional flow matching）[23,36] 相联系，后者把流匹配推广到无限维 Hilbert 空间而不依赖 Lebesgue 密度。以这种方式训练 f-CNF 后，由定理 5，学到的神经 ODE 流在变换前后的测度等价，且相应的 RN 导数可用于贝叶斯分析。

我们的模型还与扩散模型存在联系，下面简要讨论。无限维得分扩散模型已在无限维空间上建立 [32]。然而，这些模型基于随机微分方程（SDE）构造，没有显式的密度表述，因此不能直接用作贝叶斯推断中的标准先验分布，这与其有限维对应物的局限一致 [37,15]。一项关于有限维扩散模型的研究 [15] 表明，扩散模型的 SDE 可约化为确定性的概率流 ODE。把该 ODE 解释为连续归一化流，便可应用变量替换定理计算精确对数密度，从而使扩散模型可作为严格的贝叶斯先验。这一思路为在无限维空间上发展扩散模型的 RN 估计提供了清晰指引。

在无限维设定 [32] 下，生成模型由把高斯分布映射回数据分布的反向 SDE 支配：

$$
\mathrm du_t=\frac12u_t\,\mathrm dt+s_\theta(t,u_t)\,\mathrm dt+\mathrm dW^C_t,\tag{10}
$$

其中 $s_\theta(t,u)$ 表示近似的得分函数，$W^C_t$ 表示 C-Wiener 过程，$u_0\sim\mathcal N(0,C)$ 为初始高斯测度。类似于 [15]，我们假设可以在保持边缘分布不变的前提下消去 Brownian 运动项 $\mathrm dW^C_t$。由此得到与无限维前向过程关联的概率流 ODE：

$$
\frac{\mathrm du_t}{\mathrm dt}=f_\theta(u_t,t).\tag{11}
$$

该猜想严格遵循 [15] 的框架建立，而反向 SDE（10）对应 $f_\theta(u_t,t)$ 的显式形式尚需进一步研究。这样的确定性流定义了 f-CNF 模型。尽管 Lebesgue 密度在无限维空间中没有良定义，只要 ODE（11）满足定理 5 所述假设，该模型就具有相对于高斯参考测度 $\mathcal N(0,C)$ 的严格 RN 导数作为广义密度。

总之，本文提出的 f-CNF 模型并不限于文中给出的两种先验构造方法；它与更广泛背景下先验学习方法的结合仍有待未来研究。

## 4 贝叶斯逆问题的适定性

在逆问题的贝叶斯方法中，不确定的模型参数被表示为一个随机变量，由编码初始不确定性的先验测度支配。对数据的观测构成一个事件，先验以该事件为条件。贝叶斯逆问题的解是所得的后验测度，即该条件概率分布。一个关键问题是：观测数据的小扰动是否会引起后验测度的显著变化，即后验对数据扰动是否稳定。文献 [27] 已在多种设定下研究了该问题。基于 [27] 中建立的结果，我们进一步分析配备新提出的 f-CNF 先验的贝叶斯逆问题的适定性。与 [27] 的框架一致，引入如下定义。

**定义 7：** 假设 $\mathcal H_u$ 上所有概率测度构成集合 $\mathcal P$，$\rho$ 为 $\mathcal P$ 上的度量。若满足以下条件，则关于（6）的贝叶斯逆问题是 $\rho$-适定的：

- Bayes 公式（6）在 $\mathcal P$ 中有唯一后验（存在性与唯一性）；
- （6）的后验连续依赖于数据 $d$，即 $(Y,\|\cdot\|_Y)\ni d\mapsto\mu_d\in(\mathcal P,\rho)$ 是连续函数（稳定性）。

值得注意的是，定义 7 中适定性的定义关注测度关于观测数据 $d$ 的连续性。因此，通过在概率测度之间采用不同的度量 $\rho$，可以得到不同的适定性概念。遵循 [27] 的论述，下面给出若干经典的适定性定义。

**定义 8：** 按度量 $\rho$ 的选择，把 $(\mathcal P,\rho)$ 适定性分类如下：

- **弱适定性：** $\rho$ 为 Prokhorov 度量；
- **全变差适定性：** $\rho$ 为全变差距离；
- **Hellinger 适定性：** $\rho$ 为 Hellinger 距离；
- **Wasserstein($p$) 适定性：** $\rho$ 为 Wasserstein($p$) 距离。

对本文构造的带 f-CNF 先验 $\mu_{f_\theta}$ 的贝叶斯表述（如公式（7）所示），只要似然函数满足某些适当条件，便可建立贝叶斯适定性。

**定理 9：** 考虑带 f-CNF 先验的贝叶斯问题，假设以下条件成立：

- f-CNF 对应的 ODE 满足定理 5 的全部条件；
- 似然分量 $L(\cdot|u)$ 连续；
- 存在不依赖 $u$ 与 $d$ 的常数 $M$，使 $0<L(d|u)\le M$；

则该贝叶斯逆问题在弱、Hellinger、全变差与 Wasserstein($p$) 意义下均是适定的。

详细证明见补充材料。
## 5 数值实验

在文献 [37] 中，有限维连续平面流被作为典型的连续归一化流引入；该构造可自然地推广到本文的无限维设定：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=\displaystyle\sum_{i=1}^{L}u_i(t)\,\sigma\left(\langle v(t),w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right),\\[2mm]
v(0)=u_0,
\end{cases}\tag{12}
$$

其中对任意固定 $t\in[0,T]$ 与 $i\in\mathbb N_+$，有 $u_i(t),w_i(t)\in\mathcal H_u$、$b_i(t)\in\mathbb R$，$\sigma(x)=\tanh(x)$，参数集为 $\theta=\{u_i(t),w_i(t),b_i(t)\}_{i=1}^{L}$。

由于流模型参数 $u_i(t)$、$w_i(t)$ 与 $b_i(t)$ 都是函数，它们的高效参数化对计算效率以及满足定理 5 的条件至关重要。令 $\{\phi_j\}_{j=1}^{M}$ 为定理 5 中与 $\mu_0$ 相关联的协方差算子的前 $M$ 个特征函数。我们把 $u_i(t)$ 与 $w_i(t)$ 展开为

$$
u_i(t)=\sum_{j=1}^{M}\alpha^{(j)}_i(t)\phi_j,
\qquad
w_i(t)=\sum_{j=1}^{M}\beta^{(j)}_i(t)\phi_j.\tag{13}
$$

为简洁起见，记 $\alpha_i(t)=\left(\alpha^{(1)}_i(t),\dots,\alpha^{(M)}_i(t)\right)$ 与 $\beta_i(t)=\left(\beta^{(1)}_i(t),\dots,\beta^{(M)}_i(t)\right)$。由于 $\alpha_i,\beta_i:\mathbb R\to\mathbb R^M$ 与 $b_i:\mathbb R\to\mathbb R$ 共享实值输入 $t\in\mathbb R$，且其联合输出位于 $\mathbb R^{M\times L\times2+L}$ 中，这些映射可由一个全连接神经网络联合参数化。我们验证了以上述方式构造的网络（12）满足定理 5 的条件（细节见补充材料）。

在我们的实验中，除非另有说明，模型（13）采用含三个隐藏层（每层 12 个神经元）的全连接神经网络、$\tanh(\cdot)$ 激活函数，并固定 $M=20$、$L=12$。

一般的神经常 ODE（12）可为广泛的 PDE 逆问题产生 f-CNF 先验。除（12）之外，Householder 型与其他由 ODE 驱动的 f-CNF 架构也能满足定理 5，详见补充材料。鉴于（12）在我们的实验中表现优异，我们省略了这些替代方案的数值验证。此外，尽管一般 ODE 架构在一般设定下有效，为特定逆问题设计任务专用的神经 ODE 结构可能进一步提升模型性能。因此未来工作可聚焦于为复杂逆问题开发专用神经 ODE 架构，同时保证满足定理 5 的约束。

以下各小节评估所提 f-CNF 先验 $\mu_{f_\theta}$ 在历史数据集上的性能。所提方法在三个典型逆问题上验证：简单光滑逆问题、逆散射问题与逆热传导问题。对简单光滑逆问题，我们同时用直接与间接数据集说明不同策略学到的先验；对逆散射问题，f-CNF 先验用直接数据集训练；对逆热传导问题，先验用间接数据集学习。数值实验表明，把学到的 f-CNF 先验 $\mu_{f_\theta}$ 纳入贝叶斯表述，相比直接把无信息的变换前测度 $\mu_0$ 用作先验，能显著改善反演结果。

### 5.1 简单光滑问题

考虑 [39] 中研究的逆源问题，其由如下椭圆方程支配：

$$
\begin{cases}
-\alpha\Delta w+w=u, & \text{在}\ \Omega\ \text{中},\\[1mm]
\dfrac{\partial w}{\partial\mathbf n}=0, & \text{在}\ \partial\Omega\ \text{上},
\end{cases}\tag{14}
$$

其中 $\Omega=(0,1)\subset\mathbb R$，$\alpha>0$ 为正数，$\mathbf n$ 为外单位法向量。前向算子定义为

$$
\mathcal S\mathcal G u=\left(w(x_1),w(x_2),\dots,w(x_{N_d})\right)^T,\tag{15}
$$

其中 $\mathcal G$ 表示从 $\mathcal H_u:=L^2(\Omega)$ 到 $\mathcal H_w:=H^2(\Omega)$ 的 PDE 解算子，$\mathcal S$ 表示从 $\mathcal H_w$ 到 $\mathbb R^{N_d}$ 的测量算子，$u\in\mathcal H_u$ 为源函数，$w\in\mathcal H_w$ 为椭圆方程（14）的解，$x_i\in\Omega$（$i=1,2,\dots,N_d$）。数据 $d$ 通过前向模型与 $u$ 相联系：

$$
d=\mathcal S\mathcal G u+\epsilon.\tag{16}
$$

本小节中噪声 $\epsilon$ 取 10% 高斯随机噪声，即 $\epsilon\sim\mathcal N(0,\Gamma_{\mathrm{noise}})$，其中 $\Gamma_{\mathrm{noise}}=\tau^{-1}I$ 且 $\tau^{-1}=(0.1\|\mathcal S\mathcal G u\|_\infty)^2$。

应用第 3.1 小节引入的贝叶斯框架，我们把所考虑的逆问题重新表述为无限维空间上的后验推断问题。在该设定下，必须在 Bayes 公式（6）中指定合适的先验。传统选择是采用弱信息高斯先验 $\mu_0=\mathcal N(0,C_0)$，如 [13,38,11] 所考虑。然而，当（6）的似然函数包含的测量信息有限时，此类先验可能无法给出令人满意的反演结果。为解决该问题，我们采用第 2、3 节提出的 f-CNF 模型，其中弱信息参考先验 $\mu_0$ 经训练好的 f-CNF 网络 $f_\theta$ 前推，得到更适配目标逆问题的、问题自适应的先验 $\mu_{f_\theta}$。这里基线高斯测度 $\mu_0$ 的协方差算子定义为 $C_0=(I-\alpha\Delta)^{-2}$，其中 $\alpha=0.05$ 为常数；Laplace 算子 $\Delta$ 定义在区域 $\Omega$ 上并配备齐次 Neumann 边界条件。

为训练 f-CNF 网络，我们参照 [28,47] 构造直接数据集 $\mathcal D_1^{\mathrm{train}}$ 与间接数据集 $\mathcal D_2^{\mathrm{train}}$，其详细定义如下：

- 令 $u=\cos(2\pi x)+\cos(4\pi x)+\frac{0.3}{20}\sum_{k=1}^{20}\xi_k\cos(k\pi x)/(1+k^2)$，其中 $\xi_k\sim\mathcal N(0,1)$。模型参数的直接训练数据集随后定义为 $\mathcal D_1^{\mathrm{train}}=\{u_i\}_{i=1}^{5000}$，其中样本按上述采样策略生成。
- 定义间接训练数据集为 $\mathcal D_2^{\mathrm{train}}=\{d_i\,|\,d_i=\mathcal S_{\mathrm{data}}\mathcal G(u_i)+\epsilon_{\mathrm{data}},\ u_i\in\mathcal D_1^{\mathrm{train}}\}$，其中 $\mathcal S_{\mathrm{data}}$ 的测量点取为 $\{w(x_i)\,|\,i=1,2,\dots,10\}$，$x_i=i/10$；$\epsilon_{\mathrm{data}}$ 表示方差为 0.01 的高斯白噪声。

随后，模型（16）的真值 $u^\dagger$ 采用与训练数据集 $\mathcal D_1^{\mathrm{train}}$ 相同的采样策略生成。为更好说明学到的 f-CNF 先验 $\mu_{f_\theta}$ 相对 $\mu_0$ 的优势，（16）中测量算子 $\mathcal S$ 的测量点选得相对稀疏，即 $\{x_i\}_{i=1}^{5}$，$x_i=0.1+0.2(i-1)$。相应测量数据随后由 $d^\dagger=\mathcal S\mathcal G(u^\dagger)+\epsilon$ 生成。

我们通过算法 1 在直接数据集 $\mathcal D_1^{\mathrm{train}}$ 上训练 f-CNF 先验 $\mu_{f^1_\theta}$；类似地，$\mu_{f^2_\theta}$ 用算法 2 在间接数据集 $\mathcal D_2^{\mathrm{train}}$ 上训练。随后从这两个学到的先验与基线测度 $\mu_0$ 中抽取样本，与真值 $u^\dagger$ 比较。相应结果见图 1。可以观察到，从 $\mu_{f^1_\theta}$ 与 $\mu_{f^2_\theta}$ 抽取的样本比从 $\mu_0$ 生成的样本更接近 $u^\dagger$。

随后，我们在 Bayes 公式（6）中分别采用 $\mu_0$、$\mu_{f^1_\theta}$ 与 $\mu_{f^2_\theta}$ 作为先验测度。对该简单逆问题，我们用 pCN 算法生成后验样本。步长设为 $\beta=0.05$（对 $\mu_0$）与 $\beta=0.02$（对 $\mu_{f^1_\theta}$ 与 $\mu_{f^2_\theta}$）；注意先验 $\mu_0$ 比 $\mu_{f_\theta}$ 允许更大的步长，其原因见补充材料。对三种先验，我们各运行 $5\times10^7$ 次迭代，并丢弃前 $1\times10^6$ 个样本作为预热（burn-in）。

为清晰起见，我们回顾协方差函数的定义。设 $u$ 为定义在区域 $\Omega$ 上的随机场，均值函数为 $\bar u$，协方差函数为 $c(x,y)$，则 $c(x,y)$ 刻画 $u(x)$ 与 $u(y)$ 之间的协方差：$c(x,y)=\mathbb E\left((u(x)-\bar u(x))(u(y)-\bar u(y))\right)$，$x,y\in\Omega$。相应的协方差算子 $C$ 定义为 $(C\phi')(x)=\int_\Omega c(x,y)\phi'(y)\,\mathrm dy$，其中 $\phi'$ 为定义在 $\Omega$ 上的充分光滑函数。为可视化贝叶斯后验，我们在图 2(a)—(c) 中绘制后验均值与可信区域；面板 (d)—(f) 给出的后验协方差函数进一步量化反演结果的不确定性。此外，我们计算后验均值与背景真值之间的 $L^2$ 误差，结果汇总于表 1。

**表 1：背景真值与后验均值之间的相对误差。**（来源：原文第 16 页。）

| 相对误差 | 后验（$\mu_0$） | 后验（$\mu_{f^1_\theta}$） | 后验（$\mu_{f^2_\theta}$） |
|---|---|---|---|
| 背景真值 $u^\dagger$ | 0.15641 | 0.04515 | 0.05693 |

由表 1 的数值结果与图 2 的图示可以观察到：以 $\mu_0$ 为先验的贝叶斯方法所得后验均值相对背景真值 $u^\dagger$ 的误差较大。这说明似然函数包含的测量信息不足以准确恢复真实源函数 $u^\dagger$；相比之下，分别用直接与间接数据训练的 f-CNF 先验 $\mu_{f^1_\theta}$ 与 $\mu_{f^2_\theta}$ 通过纳入额外先验信息有效缓解了这一缺陷。

这一现象还可通过考察贝叶斯后验的协方差函数进一步理解。图 2 的子图 (d) 表明，与先验 $\mu_0$ 关联的后验协方差函数仍然较大，说明稀疏测量导致反演结果不确定性高。作为对比，图 2 子图 (e)、(f) 分别给出配备先验 $\mu_{f^1_\theta}$ 与 $\mu_{f^2_\theta}$ 的贝叶斯表述所对应的后验协方差函数，其中额外信息经由学到的 f-CNF 先验被纳入。这些学到的先验使后验分布产生更窄的可信区域与更小的协方差；此外，由于直接数据本身比间接数据包含更多关于目标参数的信息，先验 $\mu_{f^1_\theta}$ 的性能优于 $\mu_{f^2_\theta}$。

### 5.2 逆散射问题

本小节研究 f-CNF 先验在逆散射问题 [42,43] 中的应用，使用可获得的直接数据集 $\mathcal D_{\mathrm{train}}$。我们首先简要介绍所考虑的声音软（sound-soft）逆散射问题。设 $\Omega$ 表示障碍物，并假设 $\Omega\subset\mathbb R^2$ 为有界、单连通区域，边界 $\partial\Omega$ 为 $C^2$ 光滑。在 $\mathbb R^2$ 中定义 $S^1=\{\xi\in\mathbb R^2:|\xi|=1\}$。考虑用如下平面波照射 $\Omega$：

$$
w^i(x):=e^{\mathrm ikx\cdot\nu},\quad x\in\mathbb R^2,\ \nu\in S^1,\tag{17}
$$

其中 $k>0$ 为波数，$\nu$ 表示入射方向。给定障碍物 $\Omega$ 与入射方向 $\nu$，PDE 解算子确定散射场 $w^s$，或等价地确定总场 $w=w^i+w^s$，使 $w$ 满足

$$
\Delta w+k^2w=0,\quad \text{在}\ \mathbb R^2\setminus\Omega\ \text{中},\tag{18}
$$

$$
w=0,\quad \text{在}\ \partial\Omega\ \text{上},\tag{19}
$$

$$
\lim_{r\to\infty}\sqrt r\left(\frac{\partial w}{\partial r}-\mathrm i k w\right)=0,\tag{20}
$$

其中（18）为 Helmholtz 方程 [42,43,9]，（19）为声音软边界条件，（20）为 Sommerfeld 辐射条件。

假设散射体 $\Omega$ 为星形区域，其边界 $\Gamma$ 可参数化为

$$
\Gamma:=r(\theta)(\cos\theta,\sin\theta)=\exp(u(\theta))(\cos\theta,\sin\theta),\quad\theta\in[0,2\pi),\tag{21}
$$

其中 $u(\theta)=\ln r(\theta)$ 且 $r(\theta)>0$。对固定波数 $k=5$，入射场定义为 $w^i(x):=e^{\mathrm ikx\cdot\nu}$。

前向问题通过从八个不同入射方向照射障碍物来构造：

$$
\nu\in\left\{(\cos\theta_i,\sin\theta_i)\,\middle|\,\theta_i=\frac{(i-1)\pi}{4},\ i=1,2,\dots,8\right\}.
$$

对每个入射方向，通过求解刻画入射波与目标障碍物相互作用的主导 PDE 计算相应的散射场。

对每个入射方向，我们在三个观测点 $\{(6,0),(3\sqrt3,3\sqrt3),(0,6)\}$ 处收集无相（phaseless）含噪散射场测量。令 $\mathcal G_i$ 表示第 $i$ 个入射波的解算子，它把 $u\in\mathcal H_u$ 映射为散射场 $w^i\in\mathcal H_w$，即 $w^i=\mathcal G_i(u)$。令 $\mathcal S$ 表示在这三个固定点处提取总场无相数据的测量算子。第 $i$ 个入射波的测量模型为 $d_i=\mathcal S\mathcal G_i(u)+\epsilon_i$，其中 $\epsilon_i$ 表示高斯噪声。汇总所有入射波对应的解算子，定义组合解算子 $\mathcal G$ 为 $\mathcal G(u)=(\mathcal G_1(u),\mathcal G_2(u),\dots,\mathcal G_8(u))$。完整测量向量可写为

$$
d=\mathcal S\mathcal G(u)+\epsilon,
$$

其中 $d$ 为长度 $3\times8$ 的向量。Bayes 公式（6）中的势函数定义为

$$
\Phi(u):=\frac12\left\|\mathcal S\mathcal G(u)-d\right\|^2_{\Gamma_{\mathrm{noise}}},\tag{22}
$$

其中 $\Gamma_{\mathrm{noise}}$ 表示噪声协方差矩阵。我们的目标是在贝叶斯框架内由观测 $d$ 推断 $u$ 的可能取值。为此，本小节引入如下基本假设：

- 假设加入高斯随机噪声 $\epsilon\sim\mathcal N(0,\Gamma_{\mathrm{noise}})$，其中 $\Gamma_{\mathrm{noise}}=\tau^{-1}I$ 且 $\tau^{-1}=(0.1\|\mathcal S\mathcal G u\|_\infty)^2$。
- 令 $\mu_0=\mathcal N(0,C_0)$，算子 $C_0$ 取为 $C_0=(I-\alpha\Delta)^{-2}$，其中 $\alpha=1$ 为固定常数。这里 Laplace 算子定义在 $\Omega=[0,2\pi]$ 上并配以周期边界条件。

接下来为 Bayes 公式选择合适的先验。在本数值算例中，我们考虑两种不同的先验：f-CNF 变换前的参考先验 $\mu_0$，以及由直接数据驱动训练得到的 f-CNF 测度 $\mu_{f_\theta}$。

为训练 f-CNF 网络，我们参照 [28] 构造直接数据集 $\mathcal D_1^{\mathrm{train}}$，详细定义如下：

$$
u(\theta)=\ln\left(\frac{\sin(3\theta)+5}{3}\right)+\frac{\xi_0}{2\sqrt{2\pi}}
+\sum_{k=1}^{10}\frac{\xi_k}{2(1+k^2)}\left(\sin(k\theta)+\cos(k\theta)\right),
$$

其中 $\xi_k$（$k=0,1,\dots,10$）为独立标准正态随机变量，即 $\xi_i\sim\mathcal N(0,1)$。我们通过采样 $\{\xi_k\}_{k=0}^{10}$ 生成 2000 个实现以构造训练集 $\mathcal D_{\mathrm{train}}$；真值 $u^\dagger$ 用相同采样过程生成。

我们用算法 1 在无限维空间的训练数据集 $\mathcal D_{\mathrm{train}}$ 上训练 f-CNF 先验 $\mu_{f_\theta}$。图 3 给出真值 $u^\dagger$、以及从初始先验 $\mu_0$ 与学到的先验 $\mu_{f_\theta}$ 中抽取的样本。可以观察到，相比来自 $\mu_0$ 的样本，来自 $\mu_{f_\theta}$ 的样本与背景真值 $u^\dagger$ 更为相似，这表明 $\mu_{f_\theta}$ 为后验分布提供了信息更丰富的先验。

随后我们在高斯先验 $\mu_0$ 与训练先验 $\mu_{f_\theta}$ 下分别用 SMC-GM 方法（第 3.2 小节介绍）抽取后验样本。对两种方法，我们各生成 20000 个样本。数值结果见图 4。我们还计算后验均值与真值 $u^\dagger$ 之间的 $L^2$ 误差以作定量评估，结果汇总于表 2。

**表 2：背景真值与后验均值之间的相对误差。**（来源：原文第 19 页。）

| 相对误差 | 后验（$\mu_0$ 先验） | 后验（$\mu_{f_\theta}$ 先验） |
|---|---|---|
| 背景真值 $u^\dagger$ | 0.17312 | 0.07151 |

由表 2 与图 4 可见，与 $\mu_0$ 关联的后验在三个右上观测点附近（似然信息充分处）给出准确重建与紧致可信区域；相反，在未观测且似然信息有限的左下方区域，重建质量下降、后验不确定性上升。由学到的 f-CNF 先验 $\mu_{f_\theta}$ 得到的后验在一定程度上缓解了该局限，相比 $\mu_0$ 的后验给出更高的预测精度与更低的不确定性。

### 5.3 逆热传导问题

对许多科学与工程应用，逆热传导问题已被研究数十年 [3]。在这类问题中，不可达边界上的温度或热流由固体内部测得的温度数据推断 [16]。这是我们最后的数值算例。本数值实验中考虑如下热方程：

$$
\frac{\partial w}{\partial t}=\frac{\partial}{\partial x}\left(h(x)\frac{\partial w}{\partial x}\right),
$$

初值条件为 $w(x,0)=0$。这里 $x$ 与 $t$ 分别表示空间与时间变量，$w(x,t)$ 为温度，$h(x)$ 为各位置的热导率，$L$ 为介质长度；所有变量均为无量纲单位。本数值实验中热导率定义为

$$
h(x)=0.5+0.15\exp\left(-\left(\frac{x-0.5}{0.2}\right)^2\right).
$$

我们假设在左边界（$x=0$）上于 $t\in[0,T_1]$ 期间施加热流，从而给出 Neumann 边界条件：$\dfrac{\partial w}{\partial x}(0,t)=u_{\mathrm{all}}(t)$，其中

$$
u_{\mathrm{all}}(t)=
\begin{cases}
u(t), & t\in[0,T_1],\\
0, & t>T_1.
\end{cases}
$$

此外，假设杆的右端绝热，即边界条件为 $\dfrac{\partial w}{\partial x}(L,t)=0$。

假设在介质右端（即 $x=L$）放置温度传感器。目标是由传感器在时间区间 $t\in[0,T_2]$ 内测得的温度推断 $t\in[0,T_1]$ 期间的热流 $u(t)$。支配该过程的相应 PDE 为

$$
\begin{cases}
\dfrac{\partial w}{\partial t}=\dfrac{\partial}{\partial x}\left(h(x)\dfrac{\partial w}{\partial x}\right), & x\in[0,L],\ t\in[0,T_2],\\[1mm]
\dfrac{\partial w}{\partial x}(0,t)=u_{\mathrm{all}}(t), & t\in[0,T_2],\\[1mm]
\dfrac{\partial w}{\partial x}(L,t)=0, & t\in[0,T_2].
\end{cases}
$$

下面总结上述逆热传导问题的表述。令 $u(t)$ 表示模型参数，$\mathcal G:u(\cdot)\mapsto w(L,\cdot)$ 表示热方程的解算子。测量算子 $\mathcal S$ 把解 $w(L,t)$ 映射为其在离散时刻 $t\in[0,T_2]$ 上的时间观测，即

$$
\mathcal S:w(L,t)\mapsto\left(w(L,t_1),w(L,t_2),\dots,w(L,t_P)\right),
$$

其中 $t_1,t_2,\dots,t_P\in[0,T_2]$ 表示测量时刻。含噪数据向量 $d$ 满足前向映射

$$
d=\mathcal S\mathcal G(u)+\epsilon,\tag{23}
$$

其中 $\epsilon$ 对应加性高斯测量噪声。

对逆问题（23），热流 $u(t)$ 沿杆从左向右传播需要时间。因此，为在整个区间 $[0,T_1]$ 上准确恢复 $u(t)$，通常需取 $T_2>T_1$ 并在整个区间 $[0,T_2]$ 上观测 $w(t)$。这里取 $T_1=1$、$T_2=2$。与第 5.1、5.2 小节一致，我们在无限维空间上的贝叶斯框架内求解该问题，以 $\mu_0=\mathcal N(0,C_0)$ 为参考先验，其中 $C_0=(I-\alpha\Delta)^{-2}$、$\alpha=0.05$ 为给定常数；Laplace 算子定义在 $\Omega$ 上并配以齐次 Neumann 边界条件。

本数值实验中，假设可获得大型间接数据集。我们的目标是用算法 2 训练适用于该逆问题的 f-CNF 先验 $\mu_{f_\theta}$，并通过与基线先验 $\mu_0$ 的比较展示所提方法的有效性。我们参照 [28,47] 构造间接训练数据集 $\mathcal D_2^{\mathrm{train}}$，详细定义如下。

- 按 $u(t)=\cos(3\pi t)+0.1\sum_{k=1}^{20}\xi_k\dfrac{\cos(k\pi t)}{1+4k^2}$（$\xi_k\sim\mathcal N(0,1)$）采样参数函数；集合 $\{u_i\}_{i=1}^{10000}$ 构成由该采样策略生成的参数训练数据集 $\mathcal D_1$。
- 定义间接训练数据集为 $\mathcal D_2^{\mathrm{train}}=\{d_i\,|\,d_i=\mathcal S_{\mathrm{data}}\mathcal G(u_i)+\epsilon_{\mathrm{data}},\ u_i\in\mathcal D_1\}$。算子 $\mathcal S_{\mathrm{data}}$ 的测量点取为 $\{w(t_i)\,|\,i=1,2,\dots,50\}$，$t_i=\frac{2}{49}(i-1)$；这里 $\epsilon_{\mathrm{data}}$ 表示方差固定为 0.001 的高斯白噪声。

背景真值 $u^\dagger(t)$ 采用与构造 $\mathcal D_1$ 相同的采样过程生成。

利用 $\mathcal D_2^{\mathrm{train}}$，我们用算法 2 训练 f-CNF 先验 $\mu_{f_\theta}$。为可视化学到的先验，图 5 给出从 $\mu_0$ 与 $\mu_{f_\theta}$ 中抽取的样本及其与背景真值 $u^\dagger$ 的比较。可以观察到，来自 $\mu_{f_\theta}$ 的样本比来自 $\mu_0$ 的样本更接近背景真值 $u^\dagger$。

接下来我们分别用 $\mu_0$ 与学到的 f-CNF 先验 $\mu_{f_\theta}$ 进行贝叶斯反演。为进一步展示训练先验 $\mu_{f_\theta}$ 的有效性，我们进行三个数值实验。

在第一个数值实验中，测量算子完全观测 $t\in[0,T_2]$ 上的解 $w(L,t)$，记为 $\mathcal S_1:w(L,t)\mapsto\left(w(L,t_1),\dots,w(L,t_{50})\right)$，其中 $t_i=0.1+\frac{2}{49}(i-1)$（$i=1,2,\dots,50$）。同时假设测量被 20% 高斯随机噪声污染，$\epsilon_1\sim\mathcal N(0,\Gamma^1_{\mathrm{noise}})$，其中 $\Gamma^1_{\mathrm{noise}}=\tau^{-1}I$ 且 $\tau^{-1}=(0.20\|\mathcal S_1\mathcal G u\|_\infty)^2$。测量过程为 $d=\mathcal S_1\mathcal G(u)+\epsilon_1$。我们选择 $\mu_0$ 为先验并用 SMC-GM 求解该逆问题；SMC-GM 算法中生成 20,000 个样本，结果见图 6。可以观察到，当观测信息充足时，先验 $\mu_0$ 给出准确的反演结果。

在第二与第三个数值实验中，我们缩短测量时间区间。具体地，假设测量算子仅在 $t\in[0,T_3]$（$T_3=0.9$）上观测解 $w(L,t)$。这意味着 $t=0.9$ 之后没有观测信息，因此 $t\in[0.9,1]$ 上 $u(t)$ 的取值无法仅由测量准确估计。我们记相应测量算子为 $\mathcal S_2:w(L,t)\mapsto\left(w(L,t_1),\dots,w(L,t_{20})\right)$，其中 $t_i=0.1+\frac{8}{190}(i-1)$。同时假设测量被 20% 高斯随机噪声污染，$\epsilon_2\sim\mathcal N(0,\Gamma^2_{\mathrm{noise}})$，其中 $\Gamma^2_{\mathrm{noise}}=\tau^{-1}I$ 且 $\tau^{-1}=(0.20\|\mathcal S_2\mathcal G u\|_\infty)^2$。

在第二与第三个数值实验中，我们分别用 $\mu_0$ 与 $\mu_{f_\theta}$ 作为先验，并用 SMC-GM 算法求解逆问题。对两种先验，各生成 20,000 个样本，结果见图 6。

除图形结果外，我们还计算三个实验中所得后验均值与背景真值 $u^\dagger$ 之间的 $L^2$ 误差，结果列于表 3。

**表 3：背景真值与后验均值之间的相对误差。**（来源：原文第 23 页。）

| 相对误差 | 后验（全测量） | 后验（$\mu_0$） | 后验（$\mu_{f_\theta}$） |
|---|---|---|---|
| 背景真值 $u^\dagger$ | 0.07799 | 1.06424 | 0.10167 |

结合表 3 与图 6 的结果可以观察到：在未被测量覆盖的时间区间内，与先验 $\mu_0$ 对应的后验表现出极高的不确定性，其后验均值也显著偏离背景真值 $u^\dagger$；相反，学到的先验 $\mu_{f_\theta}$ 有效补偿了这一缺陷，从而展示了所提先验学习方法的有效性。

## 6 结论

本文提出定义在无限维空间上的 f-CNF 模型，从而为无限维贝叶斯逆问题中的先验测度构造提供有效工具。该模型构造了保持测度等价的变换，同时在诱导测度上保留相当大的灵活性，从而为计算相应的 Radon–Nikodym 导数奠定严格的理论基础。

所提 f-CNF 模型天然适用于无限维贝叶斯逆问题——其中先验分布的选择占据核心地位。我们在三个代表性测试设定上验证其性能：(1) 光滑线性逆问题；(2) 逆散射问题；(3) 逆热传导问题。对测试情形 (1) 与 (2)，f-CNF 先验用底层模型参数的直接数据集训练；对情形 (1) 与 (3)，训练则使用间接观测测量。

然而，训练 f-CNF 需要大量 ODE 计算，在处理复杂模型时会带来可观的计算开销。我们的未来研究方向有三：(1) 把 f-CNF 框架推广到更广泛的真实世界应用；(2) 发展表达力更强的网络架构；(3) 研究无限维扩散模型 [14,32] 中测度等价性在贝叶斯逆问题背景下的刻画。

## 致谢

本研究部分由国家自然科学基金资助（项目编号 12322116 与 12271428）。

## 图注与表注

**图 1（原文第 16 页）：** 从 $\mu_0$ 以及训练所得 f-CNF 先验 $\mu_{f^1_\theta}$ 与 $\mu_{f^2_\theta}$ 中抽取的样本。红色实线表示背景真值 $u^\dagger$。(a)：来自 $\mu_0$ 的样本；(b)：来自用直接数据集训练的 $\mu_{f^1_\theta}$ 的样本；(c)：来自用间接数据集训练的 $\mu_{f^2_\theta}$ 的样本。

**图 2（原文第 17 页）：** 带 $\mu_0$、$\mu_{f^1_\theta}$、$\mu_{f^2_\theta}$ 先验的贝叶斯后验比较。(a)(b)(c)：三种先验对应的贝叶斯后验，蓝色实线表示背景真值 $u^\dagger$，红色虚线表示后验均值，绿色阴影区域表示后验的 95% 可信区间；(d)(e)(f)：三种先验下后验的协方差函数。

**图 3（原文第 19 页）：** 从 $\mu_0$ 与训练所得 f-CNF 先验 $\mu_{f_\theta}$ 中抽取的样本。绿色实线表示背景真值 $u^\dagger$，红色虚线表示先验均值，蓝色离散点表示本逆问题的观测点（O.P）位置。(a)：来自 $\mu_0$ 的样本；(b)：来自 f-CNF 先验 $\mu_{f_\theta}$ 的样本。

**图 4（原文第 20 页）：** 带 $\mu_0$、$\mu_{f_\theta}$ 先验的贝叶斯后验比较。(a)(b)：$\mu_0$ 与 $\mu_{f_\theta}$ 先验对应的贝叶斯后验，蓝色实线表示背景真值 $u^\dagger$，红色虚线表示后验均值，绿色阴影区域表示估计后验的 95% 可信区间，蓝色离散点表示观测点（O.P）位置；(c)(d)：两种先验下后验的协方差函数。

**图 5（原文第 22 页）：** 从 $\mu_0$ 与训练所得 f-CNF 先验 $\mu_{f_\theta}$ 中抽取的样本。红色实线表示本逆问题的背景真值。(a)：来自 $\mu_0$ 的样本；(b)：来自 f-CNF 先验 $\mu_{f_\theta}$ 的样本。

**图 6（原文第 23 页）：** 贝叶斯后验比较：全测量配 $\mu_0$ 先验、稀疏测量配 $\mu_0$ 与 $\mu_{f_\theta}$ 先验。(a)：全测量且 $\mu_0$ 先验的贝叶斯后验，蓝色实线表示背景真值 $u^\dagger$，红色虚线表示后验均值，绿色阴影区域表示估计后验的 95% 可信区间；(b)(c)：稀疏测量下 $\mu_0$ 与 $\mu_{f_\theta}$ 先验对应的贝叶斯后验；(d)(e)(f)：全测量配 $\mu_0$ 先验、以及稀疏测量配 $\mu_0$ 与 $\mu_{f_\theta}$ 先验时的后验协方差函数。

**表注汇总：** 表 1（原文第 16 页）为简单光滑逆问题中背景真值与后验均值的相对误差；表 2（第 19 页）为逆散射问题的同类相对误差；表 3（第 23 页）为逆热传导问题在全测量与稀疏测量下的同类相对误差。三张表均已在正文中逐格转录，数值与 PDF 渲染图核对一致。

## 参考文献（英文原书目）

[1] Simon Arridge, Peter Maass, Ozan Öktem, and Carola-Bibiane Schönlieb, Solving inverse problems using data-driven models, Acta Numer. 28 (2019), 1–174.
[2] Muhammad Asim, Max Daniels, Oscar Leong, Ali Ahmed, and Paul Hand, Invertible generative models for inverse problems: mitigating representation error and dataset bias, International conference on machine learning, PMLR, 2020, pp. 399–409.
[3] James V Beck, Ben Blackwell, and Charles R St Clair, Inverse heat conduction: Ill-posed problems, James Beck, 1985.
[4] Martin Benning and Martin Burger, Modern regularization methods for inverse problems, Acta Numer. 27 (2018), 1–111.
[5] Christopher M. Bishop, Pattern Recognition and Machine Learning, Information Science and Statistics, Springer, New York, 2006.
[6] Vladimir I. Bogachev, Gaussian Measures, American Mathematical Society, Providence, RI, 1998.
[7] Ziruo Cai, Junqi Tang, Subhadip Mukherjee, Jinglai Li, Carola-Bibiane Schönlieb, and Xiaoqun Zhang, NF-ULA: normalizing flow-based unadjusted Langevin algorithm for imaging inverse problems, SIAM J. Imaging Sci. 17 (2024), no. 2, 820–860.
[8] Ricky T. Q. Chen, Yulia Rubanova, Jesse Bettencourt, and David Duvenaud, Neural ordinary differential equations, Adv. Neural Inf. Process. Syst. 31 (2018), 6571–6583.
[9] David Colton and Andreas Kirsch, A simple method for solving inverse scattering problems in the resonance region, Inverse problems 12 (1996), no. 4, 383–393.
[10] Simon L. Cotter, Masoumeh Dashti, James C. Robinson, and Andrew M. Stuart, Bayesian inverse problems for functions and applications to fluid mechanics, Inverse Problems 25 (2009), no. 11, 115008, 43.
[11] Simon L. Cotter, Gareth O. Roberts, Andrew M. Stuart, and David White, MCMC methods for functions: modifying old algorithms to make them faster, Statist. Sci. 28 (2013), no. 3, 424–446.
[12] Giannis Daras, Kulin Shah, Yuval Dagan, Aravind Gollakota, Alex Dimakis, and Adam Klivans, Ambient diffusion: Learning clean distributions from corrupted data, Advances in Neural Information Processing Systems 36 (2023), 288–313.
[13] Masoumeh Dashti and Andrew M. Stuart, The Bayesian approach to inverse problems, Handbook of uncertainty quantification. Vol. 1, 2, 3, Springer, Cham, 2017, pp. 311–428.
[14] John Doe and Jane Smith, Infinite-dimensional diffusion models for function spaces, J. Mach. Learn. Res. 2024 (2024), 1–25.
[15] Berthy T Feng, Jamie Smith, Michael Rubinstein, Huiwen Chang, Katherine L Bouman, and William T Freeman, Score-based diffusion models as principled priors for inverse imaging, Proceedings of the IEEE/CVF international conference on computer vision, 2023, pp. 10520–10531.
[16] Zhe Feng and Jinglai Li, An adaptive independence sampler MCMC algorithm for Bayesian inferences of functions, SIAM J. Sci. Comput. 40 (2018), no. 3, A1301–A1321.
[17] Jean Feydy, Thibault Séjourné, François-Xavier Vialard, Shun-ichi Amari, Alain Trouve, and Gabriel Peyré, Interpolating between optimal transport and mmd using sinkhorn divergences, The 22nd International Conference on Artificial Intelligence and Statistics, 2019, pp. 2681–2690.
[18] Angela F Gao, Oscar Leong, He Sun, and Katherine L Bouman, Image reconstruction without explicit priors, ICASSP 2023-2023 IEEE International Conference on Acoustics, Speech and Signal Processing, IEEE, 2023, pp. 1–5.
[19] Junxiong Jia, Deyu Meng, Zongben Xu, and Fang Yao, Nonparametric prior learning in differential equation modeling, Journal of the American Statistical Association (2026), no. just-accepted, 1–24.
[20] Junxiong Jia, Yanni Wu, Peijun Li, and Deyu Meng, Variational inverting network for statistical inverse problems of partial differential equations, J. Mach. Learn. Res. 24 (2023), paper no. 201, 60.
[21] Junxiong Jia, Qian Zhao, Zongben Xu, Deyu Meng, and Yee Leung, Variational Bayes' method for functions with applications to some inverse problems, SIAM J. Sci. Comput. 43 (2021), no. 1, A355–A383.
[22] Jari Kaipio and Erkki Somersalo, Statistical and Computational Inverse Problems, Applied Mathematical Sciences, Springer-Verlag, New York, 2005.
[23] Gavin Kerrigan, Giosue Migliorini, and Padhraic Smyth, Functional flow matching, arXiv preprint arXiv:2305.17209 (2023).
[24] Diederik Kinga, Jimmy Ba Adam, et al., A method for stochastic optimization, ICLR, vol. 5, 2015.
[25] Andreas Kirsch, An Introduction to the Mathematical Theory of Inverse Problems, second ed., Springer, New York, 2011.
[26] Matti Lassas, Eero Saksman, and Samuli Siltanen, Discretization-invariant Bayesian inversion and Besov space priors, Inverse Probl. Imaging 3 (2009), no. 1, 87–122.
[27] Jonas Latz, Bayesian inverse problems are usually well-posed, SIAM Rev. 65 (2023), no. 3, 831–865.
[28] Zongyi Li, Nikola Kovachki, Kamyar Azizzadenesheli, Burigede Liu, Kaushik Bhattacharya, Andrew M. Stuart, and Anima Anandkumar, Fourier neural operator for parametric partial differential equations, ICLR, 2021.
[29] Haoyu Lu, Junxiong Jia, and Deyu Meng, Sequential monte carlo with gaussian mixture approximation for infinite-dimensional statistical inverse problems, arXiv preprint arXiv:2503.16028 (2025).
[30] Markku Markkanen, Lassi Roininen, Janne M. J. Huttunen, and Sari Lasanen, Cauchy difference priors for edge-preserving bayesian inversion, Journal of Inverse and Ill-posed Problems 27(2) (2019), 225–240.
[31] Richard Nickl, Bernstein–von mises theorems for statistical inverse problems I: Schrödinger equation, J. Eur. Math. Soc. 22 (2020), no. 8, 2697–2750.
[32] Jakiw Pidstrigach, Youssef Marzouk, Sebastian Reich, and Sven Wang, Infinite-dimensional diffusion models, Journal of Machine Learning Research 25 (2024), no. 414, 1–52.
[33] Frederick J. Pinski, Geoffrey Simpson, Andrew M. Stuart, and Harald Weber, Algorithms for Kullback-Leibler approximation of probability measures in infinite dimensions, SIAM J. Sci. Comput. 37 (2015), no. 6, A2733–A2757.
[34] Frederick J. Pinski, Geoffrey Simpson, Andrew M. Stuart., and Harald Weber, Kullback-Leibler approximation for probability measures on infinite dimensional spaces, SIAM J. Math. Anal. 47 (2015), no. 6, 4091–4122.
[35] Michael C. Reed and Barry Simon, Methods of modern mathematical physics. I, second ed., Academic Press, Inc. [Harcourt Brace Jovanovich, Publishers], New York, 1980.
[36] Lennon J Shikhman, Discretization and statistical consistency of functional flow matching, arXiv preprint arXiv:2608.04531 (2026).
[37] Yang Song, Conor Durkan, Iain Murray, and Stefano Ermon, Maximum likelihood training of score-based diffusion models, Advances in neural information processing systems 34 (2021), 1415–1428.
[38] Andrew M. Stuart, Inverse problems: a Bayesian perspective, Acta Numer. 19 (2010), 451–559.
[39] Jiaming Sui and Junxiong Jia, Non-centered parametric variational Bayes' approach for hierarchical inverse problems of partial differential equations, Math. Comp. 93 (2024), no. 348, 1715–1760.
[40] Arthur B. Weglein, Fernanda V. Araújo, Paulo M. Carvalho, Robert H. Stolt, Kenneth H. Matson, Richard T. Coates, Dennis Corrigan, Douglas J. Foster, Simon A. Shaw, and Haiyan Zhang, Inverse scattering series and seismic exploration, Inverse Problems 19 (2003), no. 6, R27–R83.
[41] Zhao Yang, Lu Haoyu, Jia Junxiong, and Zhou Tao, Functional normalizing flow for statistical inverse problems of partial differential equations, arXiv preprint arXiv:2411.13277 (2024), 1–52.
[42] Zhipeng Yang, Xinping Gui, Ju Ming, and Guanghui Hu, Bayesian approach to inverse time-harmonic acoustic scattering with phaseless far-field data, Inverse Problems 36 (2020), 065012.
[43] ——, Bayesian approach to inverse time-harmonic acoustic obstacle scattering with phaseless data generated by point source waves, Computer Methods in Applied Mechanics and Engineering 386 (2021), 114073.
[44] Zhewei Yao, Zixi Hu, and Jinglai Li, A TV-Gaussian prior for infinite-dimensional Bayesian inverse problems and its numerical implementations, Inverse Problems 32 (2016), no. 7, 075006, 19.
[45] Eberhard Zeidler, Nonlinear functional analysis and its applications, Springer Science & Business Media, 2013.
[46] Qingping Zhou, Tengchao Yu, Xiaoqun Zhang, and Jinglai Li, Bayesian inference and uncertainty quantification for medical image reconstruction with Poisson data, SIAM J. Imaging Sci. 13 (2020), no. 1, 29–52.
[47] Ömer Deniz Akyildiz, Mark Girolami, Andrew M. Stuart, and Arnaud Vadeboncoeur, Efficient prior calibration from indirect data, SIAM J. Sci. Comput. 47 (2025), no. 4, C932–C958.

## 补充材料

**补充材料摘要。** 本补充材料给出正文中全部引理与定理的完整证明，以及正文因篇幅所限未纳入的额外模型与数值实验。为便于查阅，补充材料按正文各节组织。

### S1 第 2 节的补充

本节对应正文第 2 节的补充材料，具体包括泛函行列式的定义，以及引理 1、定理 2 与定理 5 的证明。

#### S1.1 泛函行列式的定义

设 $\mathcal H$ 为可分 Hilbert 空间，$K:\mathcal H\to\mathcal H$ 为有界线性扰动算子。本文用 $\det_1(I+K)$ 表示 $I+K$ 的标准 Fredholm–Carleman 行列式，用 $\det_2(I+K)$ 表示相应的正则化 Fredholm–Carleman 行列式。

**定义 1（Fredholm–Carleman 行列式）：** 当 $K$ 为迹类算子时，$\det_1(I+K)$ 可良定义为 $K$ 的全部特征值 $\{\lambda_n\}$（按代数重数计）上的绝对收敛无穷乘积：

$$
\det_1(I+K)=\prod_{n=1}^{\infty}\left(1+\lambda_n\right).
$$

**定义 2（正则化 Fredholm–Carleman 行列式）：** 设 $K$ 为 Hilbert 空间 $\mathcal H$ 上的 Hilbert–Schmidt 算子，$\lambda_n$ 为 $K$ 的特征值。此时 $\det_1(I+K)$ 的标准无穷乘积发散，因此通过加入指数收敛因子来定义正则化行列式：

$$
\det_2(I+K)=\prod_{n=1}^{\infty}\left(1+\lambda_n\right)e^{-\lambda_n}.
$$

关于全面的理论讨论与证明，见 [2] 第 6.4 节。

#### S1.2 引理 1 的证明

**证明：** 由于参数 $\theta$ 在讨论中不显式出现，我们省略对其的显式引用，并采用如下缩写：算子 $f^{(n)}_{\theta_n}$ 简记为 $f^{(n)}$；算子 $F^{(n)}_{\theta_n}$ 简记为 $F^{(n)}$；算子 $f_\theta$ 与 $T_\theta$ 分别简记为 $f$ 与 $T$。证明分三步：(1) 把复合映射分解为 $I+T$，并证明 $\mathrm{Im}(T)\subset\mathcal H$；(2) 证明 $I+T$ 的 Fréchet 导数单射，从而得到 $\mu\sim\mu_0$；(3) 推导显式的 Radon–Nikodym 密度。

**第 1 步。** 按定义 $f^{(n)}=I+F^{(n)}$。展开复合得到

$$
f^{(N)}\circ\cdots\circ f^{(1)}
=\left(I+F^{(N)}\right)\circ\left(I+F^{(N-1)}\right)\circ\cdots\circ\left(I+F^{(1)}\right)
=I+T,
$$

其中

$$
T=F^{(1)}+F^{(2)}\circ\left(I+F^{(1)}\right)+F^{(3)}\circ\left(I+F^{(2)}\right)\circ\left(I+F^{(1)}\right)
+\cdots+F^{(N)}\circ\left(I+F^{(N-1)}\right)\circ\cdots\circ\left(I+F^{(1)}\right).
$$

由于对所有 $n$ 有 $\mathrm{Im}(F^{(n)})\subset\mathcal H$，故 $\mathrm{Im}(T)\subset\mathcal H$。

**第 2 步。** 映射 $I+T$ 是 Fréchet 可微的，其导数满足

$$
D(I+T)(u)=D\left(I+F^{(N)}\right)\circ\left(I+F^{(N-1)}\right)\circ\cdots\circ\left(I+F^{(1)}\right)(u)
=\Gamma^{(N)}\circ\Gamma^{(N-1)}\circ\cdots\circ\Gamma^{(1)},
$$

其中令 $\Gamma^{(n)}=\left(I+DF^{(n)}\right)(u_{n-1})$，

$$
u_{n-1}=\left(I+F^{(n-1)}\right)\circ\cdots\circ\left(I+F^{(1)}\right)(u),\qquad n=1,\dots,N.
$$

对每个 $u\in\mathcal H_u$，$DF^{(n)}(u)$ 的点谱与 $(-\infty,-1]$ 不相交，这意味着每个 $\Gamma^{(n)}$ 对所有 $n=1,\dots,N$ 都是单射。因此，作为单射映射的复合，$D(I+T)(u)$ 对所有 $u\in\mathcal H_u$ 都是单射。结合第 1、2 步的结果与 [3] 的例 10.27，我们得到相互绝对连续性 $\mu\sim\mu_0$，其中 $\mu=\left(f^{(N)}\circ f^{(N-1)}\circ\cdots\circ f^{(1)}\right)_{\#}\mu_0$。

**第 3 步。** 分两种情形。

**情形 $N=1$。** 令 $F^{(1)}=F$。由 [2] 的定理 5.8.3、定理 6.6.7 与推论 6.6.8，Radon–Nikodym 导数为

$$
\frac{\mathrm d\left((I+F)_{\#}\mu_0\right)}{\mathrm d\mu_0}\left((I+F)(u)\right)=\frac{1}{\Lambda_F(u)},
$$

其中

$$
\Lambda_F(u):=\left|\det_2\left(I+DF(u)\right)\right|\exp\left[\delta_F(u)-\frac12\|F(u)\|^2_{\mathcal H}\right]
=\left|\det_1\left(I+DF(u)\right)\right|\exp\left[-\langle u,F(u)\rangle_{\mathcal H}-\frac12\|F(u)\|^2_{\mathcal H}\right].
$$

**情形 $N>1$。** 令 $f=I+T$（如正文第 2.2 小节所定义）。链式法则给出

$$
Df(u)=D(f_N\circ\cdots\circ f_1)(u)
=Df_N\left(f_{N-1}\circ\cdots\circ f_1(u)\right)\circ Df_{N-1}\left(f_{N-2}\circ\cdots\circ f_1(u)\right)\circ\cdots\circ Df_1(u).
$$

由于复合的行列式可分解，有

$$
\det_1\left(Df(u)\right)=\det_1\left(Df_N(u_{N-1})\right)\cdot\det_1\left(Df_{N-1}(u_{N-2})\right)\cdots\det_1\left(Df_1(u)\right),
$$

其中 $u_k=f_k\circ\cdots\circ f_1(u)$（$k=1,\dots,N-1$）。回忆 $T(u)=f(u)-u$，应用 [2] 的推论 6.6.8 得

$$
\frac{\mathrm d\left(f_{\#}\mu_0\right)}{\mathrm d\mu_0}\left(f(u)\right)=\frac{1}{\Lambda_T(u)}
=\frac{1}{\left|\det_1\left(I+DT(u)\right)\right|}\exp\left[\frac12\|T(u)\|^2_{\mathcal H}+\langle u,T(u)\rangle_{\mathcal H}\right]
=\prod_{k=1}^{N}\left|\det_1\left(Df_k(u_{k-1})\right)\right|^{-1}\exp\left[\frac12\|T(u)\|^2_{\mathcal H}+\langle u,T(u)\rangle_{\mathcal H}\right].
$$

至此完成该定理的证明。□

#### S1.3 定理 2 的证明

**证明：** 令 $\nu$ 为由 $\nu(A)=\int_A W(u)\,\mu_0(\mathrm du)$ 定义的符号测度。由 Radon–Nikodym 导数的定义有 $\dfrac{\mathrm d\nu}{\mathrm d\mu_0}(u)=W(u)$。由于 $W(u)>0$ 逐点成立，测度 $\nu$ 与 $\mu_0$ 等价。对任意 $\phi\in C_b(\mathcal H_u)$，计算

$$
\lim_{N\to\infty}\int_{\mathcal H_u}\phi(u)\,\mathrm df_{N\#}\mu_0
=\lim_{N\to\infty}\int_{\mathcal H_u}\phi(f_N(u))\,\mathrm d\mu_0
=\int_{\mathcal H_u}\lim_{N\to\infty}\phi(f_N(u))\,\mathrm d\mu_0
=\int_{\mathcal H_u}\phi(f(u))\,\mathrm d\mu_0
=\int_{\mathcal H_u}\phi(u)\,\mathrm df_{\#}\mu_0.
$$

极限与积分的交换由控制收敛定理保证。这说明 $f_{N\#}\mu_0$ 弱收敛于 $f_{\#}\mu_0$。接下来用密度改写该极限：

$$
\lim_{N\to\infty}\int_{\mathcal H_u}\phi(u)\,\mathrm df_{N\#}\mu_0
=\lim_{N\to\infty}\int_{\mathcal H_u}\phi(u)\frac{\mathrm d(f_{N\#}\mu_0)}{\mathrm d\mu_0}(u)\,\mathrm d\mu_0
=\lim_{N\to\infty}\int_{\mathcal H_u}\phi(u)W_N(u)\,\mathrm d\mu_0
=\int_{\mathcal H_u}\phi(u)W(u)\,\mathrm d\mu_0
=\int_{\mathcal H_u}\phi(u)\,\mathrm d\nu.
$$

同样由控制收敛定理可交换极限与积分。因此 $f_{N\#}\mu_0$ 弱收敛于 $\nu$。由弱极限的唯一性得 $f_{\#}\mu_0=\nu$。□

#### S1.4 定理 5 的证明

**证明：** 设前向流映射 $f_\theta$ 把初始状态 $u_0$ 映射为时刻 $t=T$ 的终端状态 $u_T$，即 $f_\theta(u_0)=u_T$。该前向演化满足积分恒等式

$$
u_T-u_0=\int_0^T h(u(t),t;\theta)\,\mathrm dt.
$$

用 $[0,T]$ 的均匀分割离散该积分，得

$$
u_T-u_0=\lim_{N\to\infty}\sum_{i=1}^{N}h\left(u\left(\frac{(i-1)T}{N}\right),\frac{(i-1)T}{N};\theta\right)\frac{T}{N},\tag{1.1}
$$

初值条件为 $u(0)=u_0$，离散终端状态为

$$
u_T=u_0+\lim_{N\to\infty}\sum_{i=1}^{N}h\left(u\left(\frac{(i-1)T}{N}\right),\frac{(i-1)T}{N};\theta\right)\frac{T}{N}.\tag{1.2}
$$

定义离散前向映射 $f^N_\theta:\mathcal H_u\to\mathcal H_u$ 为

$$
u^N_T=f^N_\theta(u_0)=u_0+\sum_{i=1}^{N}h\left(u\left(\frac{(i-1)T}{N}\right),\frac{(i-1)T}{N};\theta\right)\frac{T}{N}.
$$

按构造，对所有 $u\in\mathcal H_u$ 有 $\lim_{N\to\infty}f^N_\theta(u)=f_\theta(u)$。

离散映射 $f^N_\theta$ 分解为单步更新的复合。第一步把 $u_0$ 映射为 $u_0+h(u(0),0;\theta)\frac{T}{N}$，我们把它写作 $f^{(0)}_\theta=I+F^{(0)}_\theta$，其中 $F^{(0)}_\theta(u_0)=h(u_0,0;\theta)\frac{T}{N}$。当 $N\to\infty$ 时，时间步长 $\frac{T}{N}$ 任意小，故扰动 $F^{(0)}_\theta$ 落在引理 1 的小步长范围内。引理 1 随即给出原先验 $\mu_0$ 与其推前 $f^{(0)}_{\theta\#}\mu_0$ 之间的相互绝对连续性，即两测度等价。记该推前为 $\mu_1$，并置 $u^1_0=f^{(0)}_\theta(u_0)$。

第二步由 $f^{(1)}_\theta=I+F^{(1)}_\theta$ 给出，它把 $u^1_0$ 映射为 $u^1_0+h\left(u^1_0,\frac{T}{N};\theta\right)\frac{T}{N}$。应用与引理 1 相同的论证，得 $\mu_1\sim f^{(1)}_{\theta\#}\mu_1$；令 $\mu_2=f^{(1)}_{\theta\#}\mu_1$。迭代该单步构造，完整的离散流分解为

$$
f^N_\theta=\left(I+F^{(N-1)}_\theta\right)\circ\left(I+F^{(N-2)}_\theta\right)\circ\cdots\circ\left(I+F^{(0)}_\theta\right).
$$

该复合映射把 $\mu_0$ 前推为 $f^{(N)}_{\theta\#}\mu_0$，而引理 1 保证 $\mu_0$ 与其在 $f^N_\theta$ 下的推前相互绝对连续。

我们强调，$f^{(N)}_{\theta\#}\mu_0$ 是由离散近似 $f^N_\theta$ 诱导的测度，而非由极限流 $f_\theta=\lim_{N\to\infty}f^N_\theta$ 诱导。我们的下一个目标是建立 $\mu_0$ 与 $f_{\theta\#}\mu_0$ 的等价性。

为简化记号，记 $u^n_0=u(nT/N)$、$f^{(n)}_\theta(u)=u+\frac{T}{N}h\left(u,\frac{nT}{N};\theta\right)$。每个单步映射的 Fréchet 导数满足

$$
D\left(I+F^{(n)}_\theta\right)(u^n_0)=I+Dh\left(u^n_0,\frac{nT}{N};\theta\right)\frac{T}{N}.
$$

离散推前 $f^N_\theta$ 的 Radon–Nikodym 导数取乘积形式

$$
\frac{\mathrm df^N_{\theta\#}\mu_0}{\mathrm d\mu_0}(u)=\prod_{n=0}^{N-1}\left|\det_1\left(Df^{(n)}_\theta(u^n_0)\right)\right|^{-1}\exp\left(\frac12\|T^N_\theta(u)\|^2_{\mathcal H}+\langle u,T^N_\theta(u)\rangle_{\mathcal H}\right),
$$

其中 $T^N_\theta(u)=f^N_\theta(u)-u$。对乘积取指数得

$$
\frac{\mathrm df^N_{\theta\#}\mu_0}{\mathrm d\mu_0}(u)=\exp\left(-\sum_{n=0}^{N-1}\ln\left|\det_1\left(I+Dh\left(u^n_0,\frac{nT}{N};\theta\right)\frac{T}{N}\right)\right|+\frac12\|T^N_\theta(u)\|^2_{\mathcal H}+\langle u,T^N_\theta(u)\rangle_{\mathcal H}\right).\tag{1.3}
$$

定义权重函数

$$
W_N(u)=\exp\left(-\sum_{n=0}^{N-1}\ln\left|\det_1\left(I+Dh\left(u^n_0,\frac{nT}{N};\theta\right)\frac{T}{N}\right)\right|+\frac12\|T^N_\theta(u)\|^2_{\mathcal H}+\langle u,T^N_\theta(u)\rangle_{\mathcal H}\right).\tag{1.4}
$$

对每个 $u_0\in\mathcal H_u$，离散权重逐点收敛：$\lim_{N\to\infty}W_N(u_0)=W(u_0)$，极限权重为

$$
W(u_0)=\exp\left(-\int_0^T\mathrm{Tr}\,Dh(v(t),t;\theta)\,\mathrm dt+\frac12\|T_\theta(u_0)\|^2_{\mathcal H}+\langle u_0,T_\theta(u_0)\rangle_{\mathcal H}\right),
$$

其中 $v(t)$ 求解前向 ODE 系统 $\dfrac{\mathrm dv(t)}{\mathrm dt}=h(v(t),t;\theta)$、$v(0)=u_0$，且 $T_\theta(u)=f_\theta(u)-u$。

下面为 $\{W_N\}_{N\in\mathbb N}$ 构造可积的控制函数 $g$。由 $\|C_0^{-1}h(u,t)\|_{\mathcal H_u}\le M_1$ 可得存在常数 $M_3>0$，使 $\|h(u,t)\|_{\mathcal H}\le M_3$ 对 $u,t$ 一致成立。先估计离散残差的范数：

$$
\left\|T^N_\theta(u)\right\|^2_{\mathcal H}=\left\|\sum_{n=0}^{N-1}\frac{T}{N}h\left(u^n,\frac{nT}{N};\theta\right)\right\|^2_{\mathcal H}
\le\sum_{n=0}^{N-1}\frac{T}{N}\left\|h\left(u^n,\frac{nT}{N};\theta\right)\right\|^2_{\mathcal H}\le TM_3.
$$

再估计内积项：

$$
\left\langle T^N_\theta(u),u\right\rangle_{\mathcal H}
=\sum_{n=0}^{N-1}\left\langle\frac{T}{N}h\left(u^n,\frac{nT}{N};\theta\right),u\right\rangle_{\mathcal H}
\le\sum_{n=0}^{N-1}\frac{T}{N}\left\|C_0^{-1}h\left(u^n,\frac{nT}{N};\theta\right)\right\|_{\mathcal H_u}\|u\|_{\mathcal H_u}
\le TM_1\|u\|_{\mathcal H_u}.
$$

对充分大的 $N$，利用迹类算子的恒等式 $\log\left|\det_1(I+A)\right|=\mathrm{Tr}A+O(\|A\|^2_1)$ 展开对数 Fredholm 行列式项：

$$
\left|-\sum_{n=0}^{N-1}\ln\left|\det_1\left(I+Dh\left(u^n_0,\frac{nT}{N};\theta\right)\frac{T}{N}\right)\right|\right|=\left|-\sum_{n=0}^{N-1}\left(\mathrm{Tr}\,Dh\left(u^n_0,\frac{nT}{N};\theta\right)\frac{T}{N}+O\left(\frac{1}{N^2}\right)\right)\right|
\le\sum_{n=0}^{N-1}\frac{T}{N}\left\|Dh\left(u^n_0,\frac{nT}{N};\theta\right)\right\|_1+C_1\le TM_2+C_1.
$$

合并全部估计，得到对 $W_N$ 的如下估计：

$$
W_N(u)\le\exp\left(TM_2+C_1\right)\exp\left(\frac{TM_3}{2}\right)\exp\left(TM_1\|u\|_{\mathcal H_u}\right)=C_2\exp\left(C_3\|u\|_{\mathcal H_u}\right),
$$

其中 $C_2,C_3$ 为与 $N$ 无关的正数。令 $g(u)=C_2\exp\left(C_3\|u\|_{\mathcal H_u}\right)$。函数 $g$ 关于 $\mu_0$ 可积。所需的测度等价性随即由定理 2 得到。□

### S2 第 3 节的补充

本节给出正文第 3 节的补充材料，具体包括 pCN 与 SMC-GM 算法与 f-CNF 先验的结合、计算 RN 导数的可选加速方法，以及类似于 TV-Gaussian 方法的、可在配备 f-CNF 先验的 pCN 算法中使用的分裂加速策略。

#### S2.1 pCN 算法

这里简要介绍 pCN 算法在带 f-CNF 先验的贝叶斯后验推断中的应用。关于 pCN 算法的全面介绍，读者可参阅 [4,5]。

回顾与 f-CNF 先验相关的原始贝叶斯公式：

$$
\frac{\mathrm d\mu}{\mathrm d\mu_{f_\theta}}(u)=\frac{1}{Z^\theta_\mu}\exp(-\Phi(d|u)).\tag{2.1}
$$

这里 $Z^\theta_\mu$ 表示由 $Z^\theta_\mu=\int_{\mathcal H_u}\exp(-\Phi(d|u))\,\mu_{f_\theta}(\mathrm du)$ 定义的有限正数。此外，测度 $\mu_{f_\theta}$ 关于高斯测度 $\mu_0$ 的 Radon–Nikodym 导数为 $\dfrac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)=\exp(W_\theta(u))$。由于 pCN 算法要求先验测度为高斯测度，我们把原始贝叶斯公式重写为

$$
\frac{\mathrm d\mu}{\mathrm d\mu_0}(u)=\frac{1}{Z^\theta_\mu}\exp\left(-\Phi(d|u)+W_\theta(u)\right).\tag{2.2}
$$

把 pCN 算法应用于该重写后的后验测度，即得算法 1。

**算法 1：f-CNF pCN**

- **输入：** f-CNF 先验 $\mu_{f_\theta}$（由高斯测度 $\mu_0$ 变换而来）、满足 $\dfrac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)=\exp(W(u))$ 的 RN 势 $W(u)$、似然势 $\Phi(d|u)$、初始状态 $u_0$、总样本数 $K$、步长 $\beta$。
- **输出：** 后验样本 $\{u_k\}_{k=1}^{K}$。
1. **初始化：** 置 $k=0$，从初始状态 $u_0$ 出发。
2. **repeat**
3. 　$k=k+1$
4. 　采样基础噪声：$v_0\sim\mu_0$（高斯基础测度）
5. 　生成提议：$v=\sqrt{1-\beta^2}\,u_k+\beta v_0$
6. 　接受概率：$a(u_k,v)=\min\left\{\exp\left(\Phi(d|u_k)-\Phi(d|v)+W(u_k)-W(v)\right),1\right\}$
7. 　采样更新：$u_{k+1}=v$（以概率 $a(u_k,v)$），否则 $u_{k+1}=u_k$（以概率 $1-a(u_k,v)$）
8. **until** $k=K$
9. 返回 $\{u_k\}_{k=1}^{K}$。

#### S2.2 SMC-GM 算法

pCN 算法能高效地从后验分布采样。然而，当观测数据信息量很大、后验与先验相差悬殊时，为维持算法接受率需要很小的步长，这导致相继样本之间强相关，难以获得独立样本。为解决该问题，[8] 提出了 SMC-GM 算法。其基本算法原理建立在 [8] 中；在 f-CNF 先验下进行贝叶斯后验推断的完整实现流程汇总于算法 2。

**算法 2：f-CNF SMC-GM**

- **输入：** f-CNF 先验 $\mu_{f_\theta}$、粒子数 $N$、步长 $\{h_j\}_{j=1}^{J}$（和为 1）、势函数 $\Phi(d|u)$。
- **输出：** 逼近贝叶斯公式后验 $\mu$ 的粒子 $\{u^{(i)}_J\}_{i=1}^{N}$。
1. **初始化：** 采样 $u^{(i)}_0\sim\mu_{f_\theta}$，置初始权重 $W^{(i)}_0=1/N$（$i=1,\dots,N$）。
2. **for** $j=0$ **到** $J-1$ **do**
3. 　**高斯混合拟合：** 对 $\{u^{(i)}_j\}$ 拟合 $\widehat\mu_j=\sum_{k=1}^{M}\pi_k\mathcal N(m_k,C_k)$。
4. 　**变异（GM 采样）：** 采样 $\widehat u^{(i)}\sim\widehat\mu_j$。
5. 　**重加权：** $\widetilde W^{(i)}_{j+1}=W^{(i)}_j\exp\left(-h_{j+1}\Phi\left(\widehat u^{(i)}\right)\right)$；归一化：$W^{(i)}_{j+1}=\widetilde W^{(i)}_{j+1}\big/\sum_{l=1}^{N}\widetilde W^{(l)}_{j+1}$。
6. 　**重采样：** 以权重 $\{W^{(l)}_{j+1}\}$ 从 $\{\widehat u^{(l)}\}$ 中重采样得到 $u^{(i)}_{j+1}$。
7. **end for**
8. 返回 $\{u^{(i)}_J\}_{i=1}^{N}$。

#### S2.3 加速

在计算样本 $u$ 的 Radon–Nikodym 导数时，算法中所需的量是 $W_\theta(u)=\dfrac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)$。然而，定理 5 的直接公式是在前向变换后的状态处求该导数，即给出 $W_\theta(f_\theta(u))=\dfrac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(f_\theta(u))$ 而非 $u$ 处的值。

用定理 5 获得 $W_\theta(u)$ 的一种概念上直接但计算低效的做法是先求 $u$ 在流映射 $f_\theta$ 下的原像。令 $v=f_\theta^{-1}(u)$ 使 $f_\theta(v)=u$，把定理 5 应用于该原像 $v$ 即得 $W_\theta(f_\theta(v))=W_\theta(u)$，即所需之量。

尽管数学上成立，该两步过程在计算上代价高昂。具体地，它需要求解反向 ODE 得到 $v=f_\theta^{-1}(u)$，再求解前向 ODE 以评估定理 5 所需轨迹。这意味着每个样本 $u$ 需要求解两次完整 ODE。在 MCMC 采样中，这类评估必须对大量样本反复进行，该开销会导致显著的计算低效。

为解决该瓶颈，我们给出定理 2.1。该定理给出一种可直接计算 $W_\theta(u)$ 的替代表述，完全避免对逆映射 $f_\theta^{-1}$ 的需求，从而把计算成本减半。

**定理 2.1：** 考虑定理 5 所定义的前向映射 $f_\theta$。对任意 $u\in\mathcal H_u$，令 $v(t)$ 表示如下 ODE 的解：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=h(v(t),t;\theta),\\[1mm]
v(T)=u,
\end{cases}\tag{2.3}
$$

并定义 $T_\theta(u)=u-f_\theta(u)$。则推前测度 $\mu_{f_\theta}$ 关于 $\mu_0$ 的 RN 导数为

$$
\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)=\exp\left(\frac12\|T_\theta(v(0))\|^2_{\mathcal H}
+\langle v(0),T_\theta(v(0))\rangle_{\mathcal H}-\int_0^T\mathrm{Tr}\left(Dh(v(t),t;\theta)\right)\mathrm dt\right).
$$

**定理 2.1 的证明：** 由于底层 ODE 的解 $v(t)$ 存在且唯一，故 $f_\theta^{-1}(u)=v(0)$。把它代入 Radon–Nikodym 导数的表达式，得

$$
\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)=\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}\left(f_\theta\left(f_\theta^{-1}(u)\right)\right)
=\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}\left(f_\theta(v(0))\right)
=\exp\left(\frac12\|T_\theta(v(0))\|^2_{\mathcal H}+\langle v(0),T_\theta(v(0))\rangle_{\mathcal H}-\int_0^T\mathrm{Tr}\,Dh(v(t),t;\theta)\,\mathrm dt\right),
$$

其中 $v(t)$ 表示相应 ODE（2.3）的解。□

可以观察到，按原始定理 5 计算 $W_\theta(u)$ 需要求解如下 ODE 系统：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=h(v(t),t;\theta),\\[1mm]
v(0)=f_\theta^{-1}(u),
\end{cases}\tag{2.4}
$$

该方法需要额外求解反向 ODE 以获得 $f_\theta^{-1}(u)$。相比之下，所提定理 2.1 只需解

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=h(v(t),t;\theta),\\[1mm]
v(T)=u,
\end{cases}\tag{2.5}
$$

从而完全绕过了计算 $f_\theta^{-1}(u)$ 的需求。因此训练期间只需对（2.5）做一次 ODE 求解，显著降低了整体计算开销。

#### S2.4 分裂加速策略

所提先验与 TV-Gaussian 先验 [10] 具有相似的结构形式。一般而言，两种先验都可用统一表示 $\dfrac{\mathrm d\mu_{\mathrm{prior}}}{\mathrm d\mu_0}(u)=\exp(W_\theta(u))$ 表述，其中 $\mu_0$ 表示参考高斯测度，$u$ 为待估计的未知函数，$W_\theta(u)$ 表示特定的能量泛函。对 TV-Gaussian 先验，能量泛函取全变差正则形式（$W_\theta(u)=\|u\|_{\mathrm{TV}}$）。与 TV-Gaussian 先验相比，本文提出的 f-CNF 先验仅在 $W_\theta(u)$ 的显式表述上不同。

为理解该结构形式对采样的影响，考虑 pCN 算法中的 Metropolis–Hastings 接受概率。当参考测度 $\mu_0$ 被直接用作先验时，后验正比于 $\exp(-\Phi(u))$，此时接受概率只取决于似然项 $\Phi(u)$。在许多逆问题中，负对数似然 $\Phi(u)$ 相对光滑，对 $u$ 的小局部扰动不敏感 [10]。因此标准 pCN 可以采用相对较大的提议步长而仍维持可观的接受率。

相反，当采用所提先验 $\mu_{\mathrm{prior}}$ 时，关于 $\mu_0$ 的后验测度正比于 $\exp(-\Phi(u)+W_\theta(u))$，此时接受概率同时受似然项 $\Phi(u)$ 与能量泛函 $W_\theta(u)$ 支配。与光滑似然不同，能量泛函 $W_\theta(u)$ 对 $u$ 的局部波动与尖锐跳变高度敏感。若提议步长较大，候选样本可能与当前状态出现结构性偏离，导致 $W_\theta(u)$ 的值剧烈变化；这种严重失配会大幅惩罚接受概率，造成高拒绝率。为维持合理接受率，算法被迫使用显著更小的步长，这不可避免地降低了 Markov 链的混合速率并削弱整体采样效率。

鉴于结构特征相同，所提先验与 TV-Gaussian 先验都遭遇上述计算瓶颈。因此，最初为 TV-Gaussian 先验下的 pCN 方法发展的分裂加速策略（S-pCN）可直接用于加速本文 f-CNF 先验的 Markov 链采样。

**分裂加速算法的详细流程。** 令 $u_{\mathrm{current}}$ 表示当前状态。算法按"局部更新"与"全局接受检验"两个连续阶段进行。

**阶段 1：基于 $W_\theta(u)$ 的多次局部更新。** 初始化中间状态 $v_0=u_{\mathrm{current}}$，并按如下方式执行 $k$ 次连续的 pCN 更新：(1) 用标准 pCN 提议规则生成提议 $v_{\mathrm{prop}}=\sqrt{1-\beta^2}\,v_{i-1}+\beta w$，其中 $w\sim\mu_0$ 为参考高斯随机变量，$\beta$ 表示步长参数；(2) 只基于能量泛函计算接受概率

$$
\mathrm{acc}_{W_\theta}\left(v_{\mathrm{prop}},v_{i-1}\right)=\min\left\{1,\exp\left(W_\theta(v_{\mathrm{prop}})-W_\theta(v_{i-1})\right)\right\};
$$

(3) 按计算出的接受概率更新中间状态以得到第 $i$ 次迭代 $v_i$。经 $k$ 次迭代后得到中间状态 $v_k$。该阶段只需评估低成本的能量泛函 $W_\theta(u)$，因此可高效执行大量局部迭代 $k$。

**阶段 2：最终全局接受检验。** 把 $v_k$ 视为提议状态，用数据保真项 $\Phi(u)$ 计算最终接受概率：

$$
\mathrm{acc}_\Phi\left(v_k,u_{\mathrm{current}}\right)=\min\left\{1,\exp\left(-\Phi(v_k)+\Phi(u_{\mathrm{current}})\right)\right\}.
$$

用该概率执行最终的接受—拒绝步骤，产生更新后的样本 $u_{\mathrm{next}}$。

该分裂策略把每次采样迭代分解为上述两个阶段：第一阶段执行大量低成本的局部更新与接受—拒绝决策，完全依赖能量项 $W_\theta(u)$；第二阶段则执行一次纳入数据保真项 $\Phi(u)$ 的全局接受检验。该方法缓解了标准 pCN 算法中小步长约束导致的缓慢混合，提升了整体采样效率，且不引入任何近似误差。

### S3 第 4 节的补充

本节给出正文第 4 节的补充材料，包括定理 9 的证明。

#### S3.1 定理 9 的证明

**证明：** 考虑相应的贝叶斯后验分布：

$$
\frac{\mathrm d\mu}{\mathrm d\mu_{f_\theta}}(u)=\frac{1}{Z_\theta}L(d|u),
\qquad
\frac{\mathrm d\mu_{f_\theta}}{\mathrm d\mu_0}(u)=\exp(W_\theta(u)).
$$

由链式法则有

$$
\frac{\mathrm d\mu}{\mathrm d\mu_0}(u)=\frac{1}{Z_\theta}L(d|u)\exp(W_\theta(u)).
$$

基于定理 5 的证明，存在函数 $g(u)=C_1\exp(C_2\|u\|_{\mathcal H_u})$，使 $\exp(W_\theta(u))\le g(u)$。因此，由于似然被常数 $M$ 界住，有

$$
\int_{\mathcal H_u}\left|L(d|u)\exp(W_\theta(u))\right|\mu_0(\mathrm du)
\le\int_{\mathcal H_u}M\times C_1\exp(C_2\|u\|_{\mathcal H_u})\,\mu_0(\mathrm du)<\infty,\tag{3.1}
$$

这意味着 $L(d|u)\exp(W_\theta(u))\in L^1(\mathcal H_u,\mu_0)$，且存在函数 $Mg(u)\in L^1(\mathcal H_u,\mu_0)$，使对任意测量数据 $d$ 有 $|L(d|u)\exp(W_\theta(u))|\le Mg(u)$。因此，基于 [6] 的定理 3.6，我们断言该贝叶斯逆问题在弱、Hellinger 与全变差度量下都是适定的。

接下来观察

$$
\|u\|^p_{\mathcal H_u}L(d|u)\exp(W_\theta(u))\le\|u\|^p_{\mathcal H_u}C_3\exp(C_2\|u\|_{\mathcal H_u}).
$$

对充分小的 $\epsilon>0$，有 $\exp(\epsilon\|u\|^2)\in L^1(\mathcal H_u,\mu_0)$。此外，当 $\|u\|_{\mathcal H_u}$ 充分大时，二次增长占主导，从而

$$
\|u\|^p_{\mathcal H_u}C_3\exp(C_2\|u\|_{\mathcal H_u})<\exp\left(\epsilon\|u\|^2_{\mathcal H_u}\right).
$$

因此可以构造函数 $h\in L^1(\mathcal H_u,\mu_0)$，使 $\|u\|^p_{\mathcal H_u}L(d|u)\exp(W_\theta(u))\le h(u)$。于是基于 [6] 的定理 3.12，我们断言该贝叶斯逆问题关于 $p$-Wasserstein 度量是适定的。□

### S4 第 5 节的补充

本节给出正文第 5 节的补充材料，具体包括：文中构造的泛函连续平面流满足定理 2 所要求条件的证明，以及除正文所用泛函连续平面流之外其他 f-CNF 模型的构造方法。

#### S4.1 泛函连续平面流的证明

泛函连续平面流由如下方程定义：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=\displaystyle\sum_{i=1}^{L}u_i(t)\,\sigma\left(\langle v(t),w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right),\\[2mm]
v(0)=u_0.
\end{cases}\tag{4.1}
$$

因此，类似于定理 5，有

$$
h(v(t),w_i(t);\theta)=\sum_{i=1}^{L}u_i(t)\,\sigma\left(\langle v(t),w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right).
$$

我们的主要目标是证明 $h(u,t;\theta)\in\mathcal T(\mu_0,[0,T],\mathcal H)$。为此把证明分为四部分。

**第 1 部分。** 首先验证 $h(\cdot,t;\theta)\in\mathrm{HC}^1(\mu_0,\mathcal H)$。注意我们把 $u_i(t)$ 参数化为

$$
u_i(t)=\sum_{j=1}^{M}\alpha^{(j)}_i(t)\phi_j,\tag{4.2}
$$

其中 $\phi_j\in\mathcal H(\mu_0)$。因此对任意 $t\in[0,T]$、$\theta\in\Theta$ 与 $v\in\mathcal H_u$，有 $h(v,t;\theta)\in\mathcal H(\mu_0)$。其次，对任意 $g\in\mathcal H_u$ 可观察到

$$
Dh(v,t;\theta)g=\sum_{i=1}^{L}u_i(t)D\sigma\left(\langle v,w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right)g
=\sum_{i=1}^{L}\sigma'\left(\langle v,w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right)\langle g,w_i(t)\rangle
=\sum_{i=1}^{L}\sigma'\left(\langle v,w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right)u_i(t)\otimes w_i(t)\,g.
$$

因此 $Dh(v,t;\theta)$ 是有限秩算子且关于 $v$ 连续。于是对固定 $\theta\in\Theta$ 与 $t\in[0,T]$，断言 $h(\cdot,t;\theta)\in\mathrm{HC}^1(\mu_0,\mathcal H)$。

**第 2 部分。** 其次建立有界性条件。注意

$$
C_0^{-1}h(u,t;\theta)=\sum_{i=1}^{L}C_0^{-1}u_i(t)\sigma\left(\langle v(t),w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right)
=\sum_{i=1}^{L}\sum_{j=1}^{M}\alpha^{(j)}_i(t)C_0^{-1}\phi_j\,\sigma\left(\langle v(t),w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right).
$$

由于 $\alpha^{(j)}_i(t)$ 在 $[0,T]$ 上关于 $t$ 连续（我们使用全连接神经网络），存在常数 $M_{ij}$ 使 $M_{ij}=\sup_{t\in[0,T]}\alpha^{(j)}_i(t)$。令 $C_1=\sup_{i,j}\{M_{ij}\}$、$C_2=\sup_{j}\|C_0^{-1}\phi_j\|_{\mathcal H_u}$，则得

$$
\left\|C_0^{-1}h(u,t;\theta)\right\|_{\mathcal H_u}\le LMC_1C_2.\tag{4.3}
$$

**第 3 部分。** 再次考察导数的迹范数。观察到

$$
Dh(v,t;\theta)=\sum_{i=1}^{L}\sigma'\left(\langle v,w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right)u_i(t)\otimes w_i(t).
$$

由于 $Dh(v,t;\theta)$ 表示为秩一算子之和，我们分析其各分量 $A_i=\sigma'\left(\langle v,w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right)u_i(t)\otimes w_i(t)$。每个 $A_i$ 都是秩一算子，因此

$$
\|A_i\|_1=\sigma'\left(\langle v,w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right)\langle u_i(t),w_i(t)\rangle_{\mathcal H_u}
\le\|u_i(t)\|_{\mathcal H_u}\|w_i(t)\|_{\mathcal H_u}.
$$

由于范数 $\|u_i(t)\|_{\mathcal H_u}$ 与 $\|w_i(t)\|_{\mathcal H_u}$ 在紧区间 $[0,T]$ 上连续，它们有界。因此存在常数 $M_i$ 使 $\|A_i\|_1\le M_i$。因此，

$$
\|Dh(v,t;\theta)\|_1\le\sum_{i=1}^{L}\|A_i\|_1\le\sum_{i=1}^{L}M_i.\tag{4.4}
$$

**第 4 部分。** 最后验证 Lipschitz 条件。由前述界有 $\|Dh(u,t;\theta)\|_{\mathcal H^*}\le\|Dh(u,t;\theta)\|_1\le C$。由中值定理，对某个 $\tau\in[0,1]$ 可得

$$
\|h(u_1,t;\theta)-h(u_2,t;\theta)\|_{\mathcal H_u}
\le\|Dh(\tau u_1+(1-\tau)u_2,t;\theta)(u_1-u_2)\|_{\mathcal H_u}
\le C\|u_1-u_2\|_{\mathcal H_u}.
$$

综上，我们已证明 $h(u,t;\theta)\in\mathcal T(\mu_0,[0,T],\mathcal H)$。证毕。

#### S4.2 其他流模型

数值实验中我们采用泛函连续平面流模型。然而许多其他流模型也可能满足定理 5 的条件。受我们此前工作 [9] 启发，下面列出这些模型。由于验证这些模型满足定理 5 的论证与泛函连续平面流类似，我们省略详细证明。

**泛函连续 Householder 流：** 通过推广 [7] 中的 Householder 流与 [9] 提出的泛函 Householder 流，定义泛函连续 Householder 流如下：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=\displaystyle\sum_{i=1}^{L}u_i(t)\left(\langle v(t),w_i(t)\rangle_{\mathcal H_u}+b_i(t)\right),\\[2mm]
v(0)=u_0,
\end{cases}\tag{4.5}
$$

其中对任意固定 $t\in[0,T]$ 与 $i\in\mathbb N_+$，有 $u_i(t),w_i(t)\in\mathcal H_u$、$b_i(t)\in\mathbb R$，参数集为 $\theta=\{u_i(t),w_i(t),b_i(t)\}_{i=1}^{L}$。作为泛函 Householder 流的推广，所提模型具有线性流结构。因此变换后的测度仍为高斯测度，这内在限制了模型的表示能力。

**泛函连续投影变换流：** 通过推广 [9] 提出的泛函投影变换流，定义泛函连续投影变换流如下：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=QR(t)\left(Pu(t)+b(t)\right),\\[1mm]
v(0)=u_0.
\end{cases}\tag{4.6}
$$

这里 $R(t)$ 为把 $t\in\mathbb R$ 映射到矩阵空间 $\mathbb R^{L\times L}$ 的函数，$b(t)$ 为把 $t\in\mathbb R$ 映射到 $\mathbb R$ 的函数。算子 $P$ 与 $Q$ 分别表示投影与重构算子。具体地，这些算子借助与初始测度 $\mu_0$ 相关联的协方差算子的特征函数构造。令 $\{\phi_i\}_{i=1}^{M}$ 为该协方差算子的前 $M$ 个特征函数，定义 $P$ 与 $Q$ 如下：

$$
Pu=\left(\langle u,\phi_1\rangle_{\mathcal H_u},\langle u,\phi_2\rangle_{\mathcal H_u},\dots,\langle u,\phi_M\rangle_{\mathcal H_u}\right)^T,\tag{4.7}
$$

$$
Qd=\sum_{i=1}^{M}d_i\phi_i.\tag{4.8}
$$

该模型的参数集为 $\theta_n=\{R(t),b(t)\}$。与泛函连续 Householder 流相比，该变换更精细。然而它仍是线性变换，因而表示能力有限。因此，对具有多模态或更复杂结构的目标分布，不建议使用该模型。

**泛函连续 Sylvester 流：** 在 [1] 中的 Sylvester 流与 [9] 中的泛函 Sylvester 流的基础上，定义泛函连续 Sylvester 流如下：

$$
\begin{cases}
\dfrac{\mathrm dv(t)}{\mathrm dt}=A(t)\,h\left(B(t)u(t)+b(t)\right),\\[1mm]
v(0)=u_0,
\end{cases}\tag{4.9}
$$

其中对任意固定 $t\in[0,T]$，$B(t)$ 为把 $\mathcal H_u$ 映射到 $\mathbb R^M$ 的有界线性算子，$A(t)$ 为把 $\mathbb R^M$ 映射到 $\mathcal H_u$ 的有界线性算子，$b(t)\in\mathbb R^M$，$h(x)=\tanh(x)$，参数集为 $\theta_n=\{A(t),B(t),b(t)\}$。作为一种非线性变换，它比泛函连续 Householder 流与泛函连续投影变换流更准确地逼近复杂的多模态分布。

## 补充材料参考文献

[1] Rianne Van Den Berg, Leonard Hasenclever, Jakub M Tomczak, and Max Welling. Sylvester normalizing flows for variational inference. In 34th UAI, pages 393–402, 2018.
[2] Vladimir I. Bogachev. Gaussian Measures. American Mathematical Society, Providence, RI, 1998.
[3] Vladimir I. Bogachev. Differentiable Measures and the Malliavin Calculus. American Mathematical Society, Providence, RI, 2010.
[4] Simon L. Cotter, Gareth O. Roberts, Andrew M. Stuart, and David White. MCMC methods for functions: modifying old algorithms to make them faster. Statist. Sci., 28(3):424–446, 2013.
[5] Masoumeh Dashti and Andrew M. Stuart. The Bayesian approach to inverse problems. In Handbook of uncertainty quantification. Vol. 1, 2, 3, pages 311–428. Springer, Cham, 2017.
[6] Jonas Latz. Bayesian inverse problems are usually well-posed. SIAM Rev., 65(3):831–865, 2023.
[7] GuoJun Liu, Yang Liu, MaoZu Guo, Peng Li, and MingYu Li. Variational inference with gaussian mixture model and householder flow. Neural Networks, 109:43–55, 2019.
[8] Haoyu Lu, Junxiong Jia, and Deyu Meng. Sequential monte carlo with gaussian mixture approximation for infinite-dimensional statistical inverse problems. arXiv preprint arXiv:2503.16028, 2025.
[9] Zhao Yang, Lu Haoyu, Jia Junxiong, and Zhou Tao. Functional normalizing flow for statistical inverse problems of partial differential equations. arXiv preprint, arXiv:2411.13277:1–52, 2024.
[10] Zhewei Yao, Zixi Hu, and Jinglai Li. A TV-Gaussian prior for infinite-dimensional Bayesian inverse problems and its numerical implementations. Inverse Problems, 32(7):075006, 19, 2016.

**本页范围与校对状态：** 本页覆盖 arXiv:2609.03343v2（math.NA）全文 41 页：正文 26 页（摘要、第 1—6 节、图 1—6 图注、表 1—3、算法 1—2、致谢、参考文献 [1]—[47]）与补充材料 15 页（S1—S4：泛函行列式定义与引理 1、定理 2、定理 5 的证明；pCN、SMC-GM 算法与 RN 导数的加速定理 2.1、分裂加速策略；定理 9 的证明；泛函连续平面流的验证与其他流模型；补充材料参考文献 [1]—[10]）。三张表格的数值已用 `render.py` 将 PDF 第 16、19、23 页渲染为图像后逐格核对；正文与补充材料的公式按原文编号（(1)—(23)、(1.1)—(4.9)、(2.1)—(2.5)）录入。已标注一处原文疑点：引理 1、定理 5 与补充材料定理 2.1 对 $T_\theta$ 的符号约定（$f_\theta-u$ 与 $u-f_\theta$）不一致，而 RN 公式的正负号未作相应区分（按原文照录）。此外，正文脚注与补充材料末尾给出的 Zhao 的邮箱不同（`xjtu.edu.cn` 与 `stu.xjtu.edu.cn`），按原文保留。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、表格数值的独立复算均未做），因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.03343v2) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
