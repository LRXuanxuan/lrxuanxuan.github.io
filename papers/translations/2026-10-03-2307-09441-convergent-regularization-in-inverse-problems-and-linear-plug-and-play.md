---
layout: page
title: "逆问题中的收敛正则化与线性即插即用去噪器｜中文全文译文"
permalink: /papers/translations/2026-10-03-2307-09441-convergent-regularization-in-inverse-problems-and-linear-plug-and-play/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/994df95bbaf1d51b/) · [原文 arXiv](https://arxiv.org/abs/2307.09441) · [全部目录](/papers/catalog/)

# 逆问题中的收敛正则化与线性即插即用去噪器

**原题：** Convergent regularization in inverse problems and linear plug-and-play denoisers  
**作者：** Andreas Hauptmann、Subhadip Mukherjee、Carola-Bibiane Schönlieb、Ferdia Sherry  
**版本：** arXiv:2307.09441v1，2023-07-18，原文 32 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–5 节（含全部小节）、结论、致谢、图 1–6 图注、定理 1–5 与注 1–3、参考文献 [1]–[48]（英文原条目）按原文结构录入；原文无表格、无附录。逐句逐式终校未做。

## 摘要

即插即用（plug-and-play，PnP）去噪是一种流行的迭代框架，可借助现成的图像去噪器求解成像逆问题。其经验上的成功催生了一系列研究，试图在关于去噪器的各种假设下理解 PnP 迭代的收敛性。尽管已有大量研究针对去噪器的不同正则性条件建立了 PnP 迭代的收敛性，但对于收敛解在测量噪声水平趋于零时的渐近性质——即 PnP 方法在关于去噪器的合理假设下是否是可证明的收敛正则化方案——人们所知甚少。本文有两个目的：首先，我们概述逆问题中的经典正则化理论，并综述若干可证明为收敛正则化方案的近期数据驱动方法；随后讨论 PnP 算法及其已有的收敛保证。接着，我们考虑采用**线性去噪器**的 PnP 算法，提出一种新的**谱滤波**技术，以控制由去噪器产生的正则化强度。进一步，通过把去噪器的隐式正则化与显式正则化泛函联系起来，我们严格证明采用线性去噪器的 PnP 会导出收敛正则化方案。更具体地说，我们证明在噪声趋于零的极限下，PnP 重建收敛到某个正则化势的极小元，且该解满足无噪算子方程。理论分析通过断层图像重建这一经典逆问题的数值实验得到验证。

**关键词：** 逆问题 · 变分正则化 · 数据驱动学习 · 即插即用去噪。

## 1 引言

逆问题研究的是如何从含噪的、间接的测量 $y^\delta\in Y$ 中估计未知模型参数 $x^*\in X$，其关系为

$$
y^\delta=Ax^*+e. \tag{1}
$$

我们考虑 $X$ 与 $Y$ 为（可能无限维的）可分 Hilbert 空间，$A:X\to Y$ 为有界线性算子。$X$ 与 $Y$ 分别赋以内积 $\langle\cdot,\cdot\rangle_X$ 与 $\langle\cdot,\cdot\rangle_Y$，并诱导范数 $\|\cdot\|_X$ 与 $\|\cdot\|_Y$。测量噪声水平以 $\delta$ 为界，即 $\|e\|_Y\le\delta$；无噪测量记作 $y_0$。

若式 (1) 中前向算子的单射性或满射性、或解映射的稳定性被破坏，则该反问题在 Hadamard 意义下是不适定的。例如，当 $A$ 是值域为无限维的紧算子时，满射性与稳定性均不成立——这正是医学成像（如计算机断层成像（CT）与正电子发射断层成像（PET））中许多应用底层的射线变换算子的典型情形 [32,33]。逆问题研究通常假设不适定性，下文亦如此。

为处理不适定性，需要为形如 (1) 的逆问题引入稳定且唯一可解的通用概念。由于上述不适定性，我们无法保证对所有测量都恢复真实解 $x^*$，因此首先需要**广义解**的概念。一种常见做法是：相对于合适的数据差异项 $f:Y\times Y\to\mathbb R_+$（例如范数下的（平方）距离 $f(Ax,y^\delta)=\|Ax-y^\delta\|_Y^2$），寻找与测量数据最接近的解，即寻找 $\tilde x\in X$ 使得

$$
f(A\tilde x,y^\delta)\le f(Ax,y^\delta)\quad\forall x\in X. \tag{2}
$$

式 (2) 意味着 $\tilde x$ 在 $f$ 意义下最接近测量数据，它通过忽略 $y^\delta$ 中落在 $A$ 的余核内的分量来处理满射性失效的问题。此外，若 $A$ 具有非平凡零空间，则 $\tilde x$ 不唯一。为获得唯一解，可定义**最小范数解**：

$$
x^\dagger=\arg\min_{x\in X}\left\{\|x\|_X:\ x\ \text{使}\ f(Ax,y^\delta)\ \text{最小}\right\}. \tag{3}
$$

于是 $x^\dagger$ 可视为 (1) 的一个理想广义解。当 $f$ 与 $\|\cdot\|_X$ 取平方 $L_2$ 范数时，称 $x^\dagger$ 为最小二乘最小范数解，并可定义映射 $A^\dagger:Y\to X$ 使 $x^\dagger=A^\dagger y^\delta$。事实上，映射 $A^\dagger$ 即所谓的 Moore–Penrose 伪逆。遗憾的是，若算子 $A$ 是紧的，则 $A^\dagger$ 无界，因而无法处理数据含噪时的稳定性问题。这正是**正则化**概念的重要性所在，下面对此展开讨论。

为处理稳定性问题，正则化理论考察专门设计的解映射。这样的解映射 $\mathcal R(\cdot;\lambda):Y\to X$ 也称为**重建算子**，它被表示为在给定 $y^\delta$ 时产生 $x^*$ 估计的参数化映射。这里参数 $\lambda$ 依赖噪声水平 $\delta$，我们以映射 $\delta\mapsto\lambda(\delta)$ 显式表示这种依赖。本文特别关注**收敛正则化**的概念，它可以理解为噪声水平 $\delta$ 趋于零时重建算子的收敛性。更具体地说，我们希望当噪声水平 $\delta\to0$ 时 $\lambda(\delta)\to\lambda_0\ge0$，且重建算子 $\mathcal R(y^\delta;\lambda)$ 收敛到无噪算子方程

$$
Ax=y_0 \tag{4}
$$

的某个广义解。

下文安排如下：第 2 节首先回顾经典正则化方法以及逆问题为何需要广义可解性概念，随后讨论这种经典方法如何与现代数据驱动方法结合；第 3 节特别关注即插即用（PnP）方法（其在成像逆问题上已展现出优异的经验效果）——这些方法利用最先进的去噪器（模型驱动或数据驱动）替代迭代近端分裂算法中求解底层变分极小化问题的近端算子；第 4 节分析 PnP 方法（尤其是在采用线性去噪器时）如何实际上构成经典意义下的收敛正则化方法。

## 2 逆问题的正则化与数据驱动方法

数十年来，正则化理论一直是逆问题中丰富而成功的研究领域。其首要动机是构造一个适定且稳定的反演过程，并能够可证明地收敛到无噪算子方程 (4) 的解。数据驱动方法的出现为逆问题领域带来了新方向：借助大量数据，我们可以显著改进重建结果。然而，一个根本问题依然存在：得到的重建是否求解了底层算子方程？这仍是关于收敛正则化的问题。

确实存在少数可证明为收敛正则化方法的方案，综述参见 [30]。下面简要概述正则化理论以及在该背景下可证明为收敛正则化方法的现有数据驱动方法。

### 2.1 经典正则化理论

逆问题的稳定求解需要处理变化的噪声水平。为此，正则化概念被证明非常有用。粗略地说，正则化可理解为一个收敛要求：收敛到唯一解（例如最小范数解 $x^\dagger$），且收敛性依赖噪声水平 $\delta$。形式上，考虑前面讨论的重建算子 $\mathcal R_\lambda:=\mathcal R(\cdot,\lambda)$，它提供一个参数化连续算子族 $\mathcal R_\lambda:Y\to X$。参数 $\lambda$ 依赖噪声水平 $\delta>0$，其中 $\|y^\delta-y_0\|\le\delta$、$y_0:=Ax^*$ 表示无噪数据。若存在参数选择规则 $\delta\mapsto\lambda(\delta,y^\delta)$，使重建 $x^\delta:=\mathcal R_{\lambda(\delta,y^\delta)}(y^\delta)$ 在噪声消失时收敛到由伪逆给出的解 $x^\dagger:=A^\dagger y_0$，即

$$
\limsup_{\delta\to0}\left\|x^\delta-x^\dagger\right\|_X=0\quad\text{当}\quad\limsup_{\delta\to0}\left\{\lambda\left(\delta,y^\delta\right)\right\}=0, \tag{5}
$$

则称该重建算子族为**收敛正则化方法**。换言之，重建算子逐点收敛到伪逆，即当 $\delta\to0$ 时 $\mathcal R_{\lambda(\delta,y^\delta)}(y^\delta)\to A^\dagger y_0$。感兴趣的读者可参见 [15] 的详细讨论。当然，这一要求相当严格，且只考虑收敛到最小二乘最小范数解；不过它已经可作为设计学习型正则化方法的有用工具——即形式上满足上述收敛准则的学习型重建方法，下文将对此讨论。

#### 2.1.1 直接正则化

受收敛到伪逆解的启发，可以通过模仿伪逆的构造得到一种正则化方法。在有限维情形，这可通过前向算子的奇异值分解（singular value decomposition，SVD）$A=USV^\top$ 实现，伪逆可直接由 $A^\dagger=VS^\dagger U^\top$ 得到，其中 $S^\dagger$ 为奇异值取倒数后的转置奇异值矩阵。对奇异值用依赖噪声的滤波函数（或依赖噪声水平的截断）进行滤波，便得到一种正则化方法。

类似地，那些对前向算子施加正则化逆的直接重建方法可被证明是收敛正则化方法。此类方法最著名的例子是 X 射线 CT 的滤波反投影（filtered back-projection，FBP），它在临床实践中至今仍有重要意义：其中的滤波操作去除 Fourier 空间的高频分量以正则化重建。若把滤波解释为依赖噪声的软化子（mollifier），则得到一般类的近似逆方法 [42]，其收敛性随噪声消失而成立。

数据驱动方法中一种流行做法是把重建算子表述为正则化重建算子 $\mathcal R_\lambda:Y\to X$ 与数据驱动分量 $C_\theta:X\to X$ 的复合，即重建算子参数化为 $\mathcal R_{(\theta,\lambda)}:=C_\theta\circ\mathcal R_\lambda$，其中数据驱动分量 $C_\theta$ 被设计用于去除噪声或欠采样伪影以改善重建，通常由深度卷积神经网络（convolutional neural network，CNN）给出 [22,24]。这类方法也常被称为**后处理**方法。这种一步后处理方法因其简洁性而尤为流行，因为当可获得高质量与低质量重建的监督配对数据时，$C_\theta$ 能高效训练。遗憾的是，此类方法的**重建保证**结果极少：具体而言，把重建表述为正则化重建后接数据驱动分量的复合，常使重建违反所谓**数据一致性**准则。也就是说，即使数据保真 $f((A\circ\mathcal R_\lambda)(y^\delta),y^\delta)$ 很小，也并不必然意味着与后处理网络 $C_\theta$ 输出相对应的 $f((A\circ C_\theta\circ\mathcal R_\lambda)(y^\delta),y^\delta)$ 很小。因此，此类方案不满足数据保真的收敛性，从而不是收敛正则化策略。

不过，如 [43] 所提出的，可通过构造后处理网络 $C_\theta=\mathrm{id}+(\mathrm{id}-A^\dagger A)Q_\theta$ 来重新表述该方法，其中 $Q_\theta$ 为 Lipschitz 连续的深度神经网络（deep neural network，DNN），$\mathrm{id}$ 表示 $X$ 上的恒等算子。这里 $(\mathrm{id}-A^\dagger A)$ 是到 $A$ 的零空间上的投影算子，因此算子 $C_\theta$（称为零空间网络）总满足 $(A\circ C_\theta\circ\mathcal R_\lambda)(y^\delta)=(A\circ\mathcal R_\lambda)(y^\delta)$，从而保证 $C_\theta$ 的输出能够解释观测数据。更重要的是，零空间网络保持了重建方法 $\mathcal R_\lambda$ 的正则化性质，因此给出直接正则化意义下的收敛正则化方案 [43]。零空间网络向非线性逆问题的近期扩展参见 [8]。

### 2.2 变分正则化

经典正则化理论通过收敛到式 (5) 所定义的伪逆解来定义收敛正则化，这限制了解的可能性。因此可以考虑更一般的变分方法：它们因在纳入先验知识、处理不同噪声分布方面的灵活性而尤受欢迎。在变分正则化框架中，解通过最小化由数据一致性项与正则化项构成的复合目标得到，具体为

$$
\mathcal R\left(y^\delta;\lambda\right)\in\arg\min_{x\in X}f\left(Ax,y^\delta\right)+g_\lambda(x). \tag{6}
$$

损失泛函 $f:Y\times Y\to\mathbb R_+$ 度量数据保真，不再局限于平方 $L_2$ 范数；正则化泛函 $g_\lambda:X\to\mathbb R$ 编码关于真值 $x^*$ 的先验信念，并有效限制 $A$ 的零空间。一般而言，$\lambda$ 可以是泛函的参数，更常见的是平衡 (6) 中两项的简单权重参数（即 $g_\lambda(x)=\lambda g(x)$，其中 $g$ 为正则化器）。合适正则化器 $g_\lambda$ 的选择取决于两个重要因素之间的平衡：理想的分析性质与所编码的先验信念。例如，平方 $L_2$ 范数是分析上有利的选择，与平方 $L_2$ 数据保真结合可给出闭式解；但该选择对应的解会过于光滑，对许多成像应用并不合适。因此，人们更青睐更先进的稀疏促进先验，最常见的是对稀疏信号采用 $L_1$ 范数、对稀疏梯度（即分片常数函数）采用全变分（total variation，TV）。这些正则化器不可微，因而需要更先进的非光滑优化技术求极小元 [7]，但通常能得到比简单平方 $L_2$ 正则化更好的重建。图 1 在稀疏视角 CT 重建背景下比较了几种手工设计的正则化器。

值得注意的是，(6) 中两项的作用在概念上与 (3) 中最小范数解的表述相似。然而变分表述提供更多灵活性，也要求更广义的正则化概念：我们并不总能保证收敛到最小范数解，而必须考虑关于所选正则化泛函 $g_\lambda$ 的收敛 [41]。

于是可在变分正则化框架下表述正则化方法：首先记 $x_\lambda\in X$ 为在数据 $y^\delta\in Y$、噪声水平 $\|y^\delta-y_0\|_Y<\delta$ 下 (6) 中目标的极小元。同理，假设存在相应参数选择规则 $\delta\mapsto\lambda(\delta,y^\delta)$，使当 $\delta\to0$ 时 $\lambda\to\lambda_0$。若当 $\delta\to0$ 时 $x_{\lambda(\delta,y^\delta)}\to\hat x$，则称由 (6) 定义的变分模型**收敛到一个 $g$-极小解**。这里 $\hat x\in X$ 求解与无噪数据 $y_0\in Y$ 相对应的 (6) 中的变分模型，即

$$
\hat x\in\arg\min_{x\in X}g_{\lambda_0}(x)\quad\text{s.t.}\quad y_0=Ax^*,\qquad\text{其中}\ \lambda_0:=\lim_{\delta\to0}\lambda\left(\delta,y^\delta\right). \tag{7}
$$

此处与经典表述的主要区别在于：正则化泛函 $g$ 的极小元不一定唯一，且正则化参数不要求收敛到 0。

需要指出，理想的正则化器应当对期望图像取较小值（即惩罚不理想的解），同时在分析或计算上可处理。还需要强调：不同的正则化器 $g$ 即使都提供收敛正则化，仍会产生差异很大的重建结果，如图 1 所示，因为并非所有 $g$ 都是对期望真值图像的良好表示。在这方面，学习型正则化器已被证明非常成功：数据本身可用于表示正则化器，从而自然给出对期望特征的良好好表示。视表示方式不同，对学习型正则化器的分析可能变得更复杂。下文讨论学习型数据驱动正则化器的若干选择，以及它们如何在变分正则化范围内使用。

### 2.3 学习正则化器

从数据中学习正则化器、而非按上述经典方式从第一性原理建模的想法，已以多种形式出现在文献中。这里概述几种此类方法，从相对较早但广泛流行的字典学习，到使用深度神经网络学习正则化器的较新方法。

#### 2.3.1 学习稀疏促进字典

首先介绍字典学习概念，它很好地说明了如何用数据学习期望图像的表示。我们将利用在建模解的先验知识方面长期重要的稀疏性概念来正则化逆问题。假设重建在给定字典 $D$ 下具有稀疏表示，则可发展稀疏恢复策略、相关计算方法及重建误差估计。关键思想不是使用给定字典，而是**先验地或与重建联合地学习**字典。值得注意的是，稀疏模型中几乎所有字典学习工作都是在去噪背景下（即 $A=\mathrm{id}$）完成的。

为求解重建问题而单独学习字典，通常基于对字典表示的稀疏性假设。令 $L_X:X\times X\to\mathbb R$ 为给定损失函数（如 $L_2$ 或 $L_1$ 范数），$x_1,\ldots,x_N\in X$ 为给定的无监督训练数据，$D=\{\phi_i\}\subset X$ 为字典，合成算子 $E_D^*:\Xi\to X$ 在编码器空间 $\Xi$ 上作用为 $E_D^*(\xi)=\sum_i\xi_i\phi_i$（$\xi\in\Xi$）。字典学习中的一种方法基于如下思想：寻找能以最稀疏系数在给定损失函数下逼近训练数据的字典，即求解

$$
\left(\hat D,\hat\xi_i\right)\in\arg\min_{\xi_i\in\Xi,\ D\subset X}\sum_{i=1}^{N}L_X\left(x_i,E_D^*(\xi_i)\right),\quad\text{s.t.}\ \|\xi_i\|_0\le s,\ 1\le i\le N, \tag{8}
$$

其中 $s$ 为给定稀疏水平。另一种做法是以最大化字典表示的稀疏性为最优性准则，同时对合成操作逼近精度施加约束，即寻找使 $L_X(x_i,E_D^*(\xi_i))\le\varepsilon$（$i=1,\ldots,N$）且稀疏性最大的字典。一个统一表述由如下无约束问题给出：

$$
\left(\hat D,\hat\xi_i\right)=\arg\min_{\xi_i\in\Xi,\ D\subset X}\sum_{i=1}^{N}\left[L_X\left(x_i,E_D^*(\xi_i)\right)+\theta\|\xi_i\|_0\right]. \tag{9}
$$

(8) 与 (9) 均以 $L_0$ 范数表述，属 NP 难问题。这提示使用**凸松弛**，把 (9) 中的 $\|\xi_i\|_0$ 替换为 $\|\xi_i\|_1$。在 $L_X$ 的常用选择下，该松弛把 (9) 变为**双凸问题**（在其他变量固定时关于每个变量凸），可用交替极小化方法求近似解。稀疏字典学习的代表性工作包括 K-SVD 方法 [4]、几何多分辨率分析（GMRA）[5] 与在线字典学习 [27]。关于稀疏字典学习方法的深入讨论另见 [39] 及其参考文献。

尽管稀疏编码背景下的字典学习非常流行且成功，但仍存在若干问题，涉及所学结构的局部性以及计算量（例如在大量图像或图像块上执行稀疏编码时）。因此，需要一种计算可行的方案，在字典中引入更多结构与不变性（如平移不变性），使每个字典原子 $\phi_i$ 依赖整幅图像而非单个图像块。在此背景下，卷积字典被引入：字典原子由作用于信号特征的卷积核给出，从而提供计算可行的平移不变字典，其原子依赖整个信号/图像。

卷积字典学习表述如下。给定无监督训练数据 $x_1,\ldots,x_N\in X$ 与损失函数 $L_X:X\times X\to X$，寻求求解

$$
\arg\min_{\phi_i,\ \xi_{j,i}\in X}\left\{\sum_{j=1}^{N}L_X\left(x_j,\sum_i\xi_{j,i}*\phi_i\right)+\lambda\sum_{j=1}^{N}\sum_i\|\xi_{j,i}\|_1\right\}, \tag{10}
$$

其中 $\|\phi_i\|_2=1$。上式可用 ADMM 型方案求解，类似于 [16] 中对 $L_2$ 损失的处理。卷积字典学习有多种扩展，例如多层变体 [44]。

字典也可通过与重建联合优化来学习，即构造联合优化问题。此类方法的一个例子是自适应字典统计迭代重建（ADSIR）[48] 及其变体 [12,46]。联合问题可表述为

$$
\min_{x\in X,\ \xi_i\in\Xi,\ D}\left\{f(Ax,y)+g_\lambda\left(x,\xi_1,\ldots,\xi_N,D\right)\right\}, \tag{11}
$$

其中

$$
g_\lambda\left(x,\xi_1,\ldots,\xi_N,D\right):=\sum_{j=1}^{N}\left[L_X\left(x_i,E_D^*(\xi_i)\right)+\lambda\|\xi_j\|_p^p\right], \tag{12}
$$

而 $E_D^*:\Xi\to X$ 为与字典 $D$ 相关联的合成算子。只要 $g_\lambda$ 满足适当条件，便可按变分正则化框架得到收敛正则化。最后，[10] 研究了无限维空间中的表述，提出用于联合重建与字典学习的凸变分模型，适用于逆问题，并能建立重建的存在性与稳定性保证。

#### 2.3.2 双层学习

从变分正则化方法出发（其中重建算子 $\mathcal R_\lambda:Y\to X$ 定义为 (6) 的解映射），可利用监督训练数据与合适损失函数 $L_X:X\times X\to\mathbb R$，为学习 (6) 中选定成分构造通用框架。该框架可针对学习正则化泛函 $g_\lambda$ [35,36]、数据保真项 $f$，甚至前向算子 $A$ 中的合适成分（例如盲图像反卷积 [20]）进行定制。特别地，联合字典学习问题 (11) 也可表述为**双层学习**问题。

首先把由单个正则化参数 $\lambda$ 构成的正则化器 $g_\lambda$ 推广为参数集合 $\theta$（向量值）。随后定义重建算子

$$
\mathcal R_\theta(y):=\arg\min_{x\in X}\left\{f(Ax,y)+g_\theta(x)\right\},\quad y\in Y. \tag{13}
$$

给定配对训练数据 $(x_i,y_i)\in X\times Y$（它们是 $(X\times Y)$ 值随机变量 $(x,y)\sim\pi_{\mathrm{joint}}$ 的独立同分布样本），可表述如下双层学习问题：

$$
\begin{cases}
\hat\theta\in\arg\min_\theta\mathbb E_{(x,y)\sim\pi_{\mathrm{joint}}}\left[L_X\left(\mathcal R_\theta(y),x\right)\right],&\text{其中}\\[4pt]
\mathcal R_\theta(y):=\arg\min_{x\in X}\left\{f(A(x),y)+g_\theta(x)\right\}.&
\end{cases}\tag{14}
$$

注意此处 $\hat\theta$ 是 Bayes 估计。但真实联合分布 $\pi_{\mathrm{joint}}$ 通常未知，被训练数据给出的经验分布替代，此时 $\hat\theta$ 对应**经验风险最小化**。在双层优化文献（乃至整个优化文献）中，主要有两类大多相互独立的方法：离散方法先离散化问题 (13)，再优化其参数，从而在有限维中导出最优性条件及其适定性；另一种方法在连续域（即适当的无限维函数空间）中优化 (14) 中的 $\mathcal R$ 及其参数 $\theta$，再做离散化。需要注意，由于下层问题常非光滑（如 TV 正则化），所得问题存在若干困难，通常无法验证 Karush–Kuhn–Tucker 约束品性条件。该问题促使人们发展替代分析方法以获得一阶必要最优性条件 [13,19]。

#### 2.3.3 对抗正则化

另一种值得注意的、将学习型正则化纳入重建过程的方法，是在 (6) 中学习显式正则化项、随后求解变分问题。其中一种选择是学习 [26] 首次提出、[29] 进一步发展起来的**对抗正则化器**。这里数据驱动正则化的构造受判别网络（也称为 critic）用现代生成对抗网络（generative adversarial network，GAN）架构训练的启发。

为训练这种对抗正则化器，假设有 $\{x_i\}_{i=1}^{n_1}\in X$ 与 $\{y_i\}_{i=1}^{n_2}\in Y$，分别为真值图像与测量数据的边缘分布 $\pi_x$ 与 $\pi_y$ 的独立同分布样本。需要强调训练样本**不配对**，即 $y_i$ 未必对应 $x_i$ 的含噪测量（这与学习型原始—对偶（learned primal-dual，LPD）方法 [3] 等监督方法不同）。此外，假设存在前向算子 $A$ 的（可能具有正则化作用的）伪逆 $A^\dagger:Y\to X$，并对 $\pi_{\mathrm{data}}\in\mathcal P_Y$ 定义测度 $\pi^\dagger\in\mathcal P_X$ 为 $\pi^\dagger:=A^\dagger_\#(\pi_{\mathrm{data}})$。

于是，思想是训练由神经网络参数化的正则化器 $g_\theta$，以区分分布 $\pi_x$ 与 $\pi^\dagger$（后者表示不完美解 $A^\dagger y_i$ 的分布）。更具体地，计算 $\hat g_\theta:X\to\mathbb R$，其中 $\hat\theta\in\arg\min_\theta L(\theta)$，

$$
\hat\theta\in\arg\min_\theta L(\theta), \tag{15}
$$

且 $L(\theta)$ 取为 Wasserstein 风格损失泛函 [26]。特别地，最小化

$$
L(\theta):=\mathbb E_{x\sim\pi_x}\left[g_\theta(x)\right]-\mathbb E_{x\sim\pi^\dagger}\left[g_\theta(x)\right]+\lambda\mathbb E_{x\sim\tilde\pi}\left[\left(\|\nabla g_\theta(x)\|-1\right)^2_+\right]. \tag{16}
$$

这里 $\tilde\pi$ 表示随机变量 $u=\varepsilon x+(1-\varepsilon)z$ 的分布，其中 $x\sim\pi_x$、$z\sim\pi^\dagger$、$\varepsilon$ 从 $[0,1]$ 均匀抽取。该选择的启发在于：如此训练的正则化器会惩罚伪逆产生的噪声与伪影（包含在 $\pi^\dagger$ 中）。(16) 中惩罚 $g_\theta$ 梯度范数的项促使 $g_\theta$ 近似 1-Lipschitz，这是 (16) 适定性以及由 (15) 所得正则化器给出的变分解稳定性的需要。当作为正则化项使用时，它因而能阻止对抗训练导致这些不理想特征出现。所得正则化器 $\hat g_\theta$ 称为对抗正则化器（adversarial regularizer，AR）。注意在实际应用中，测度 $\pi_x,\pi^\dagger\in\mathcal P_X$ 被训练数据 $x_i$ 与 $A^\dagger y_i$ 给出的经验对应物替代。

假设从 $x\sim\pi^\dagger$ 出发，对学习到的正则化器计算梯度步 $x_\eta=x-\eta\nabla_x\hat g_\theta(x)$。令 $\pi^\eta_\dagger$ 为 $x_\eta$ 的分布。在对 Wasserstein 距离 $W(\pi^\eta_\dagger,\pi_x)$ 的适当正则性假设下（见 [26, Theorem 1]），可证明

$$
\left.\frac{d}{d\eta}W\left(\pi^\eta_\dagger,\pi_x\right)\right|_{\eta=0}=-\mathbb E_{x\sim\pi^\dagger}\left\|\nabla_x\hat g_\theta(x)\right\|^2.
$$

这保证取足够小的梯度步即可减小与真值 $\pi_x$ 的 Wasserstein 距离。这很好地说明：把 $\hat g_\theta$ 用作变分正则化项并惩罚它，确实引入了极有价值的、使正则化解分布与真值样本分布 $\pi_x$ 对齐的激励。进一步，可证明若 AR 是 Lipschitz 连续的（脚注 1），则如下变分问题的极小元存在：

$$
f\left(y^\delta,Ax\right)+\lambda\left(\hat g_\theta(x)+\varepsilon\|x\|_X^2\right), \tag{17}
$$

其中对 $x$ 的平方范数用于强制强制性（coercivity）。

> 脚注 1（原文）：(16) 中的梯度惩罚项近似强制 1-Lipschitz 连续性，但这并不保证（AR）Lipschitz 连续。可通过选择恰当网络架构强制该性质——确实，所有使用 ReLU 激活的卷积神经网络对某个 Lipschitz 常数 $L$ 都是 Lipschitz 连续的，而 $L$ 可能任意大。

此外，可对 $g_\theta$ 强制（强）凸性，得到**对抗凸正则化器**（adversarial convex regularizer，ACR），从而在排除重建算子不连续性的同时获得更强形式的收敛。这要求对学习到的正则化器做恰当参数化，一种选择是使用输入凸神经网络来对 $\hat g_\theta$ 施加凸性 [6]。

给定如此构造的（ACR）$\hat g_\theta$（关于 $x$ 凸），考虑如下形式的正则化泛函：

$$
g(x)=\hat g_\theta(x)+\varepsilon\|x\|_X^2, \tag{18}
$$

其中 $\hat g_\theta:X\to\mathbb R$ 为训练好的（ACR），并假设其 1-Lipschitz 且关于 $x$ 凸。相应变分正则化问题即关于 $x\in X$ 最小化

$$
f\left(y^\delta,Ax\right)+\lambda g(x), \tag{19}
$$

在此设置下，按变分学中的标准论证，可得 ACR 如下改进的理论保证。

**定理 1（对抗凸正则化器的性质 [29]）**

i. **存在性与唯一性：** 泛函 (19) 关于 $x$ 强凸，且对每个 $y\in Y$ 与 $\lambda>0$ 有唯一极小元 $\hat x_\lambda(y)$。  
ii. **稳定性：** 最优解 $\hat x_\lambda(y)$ 关于 $y$ 连续。  
iii. **收敛性：** 当 $\delta\to0$、$\lambda(\delta)\to0$ 且 $\frac{\delta}{\lambda(\delta)}\to0$ 时，$\hat x_\lambda(y^\delta)$ 收敛到 (7) 中给出的 $g$-极小解 $x^\dagger$。

尽管有上述理论保证，[29] 的数值实验（尤其是稀疏视角 CT 重建）表明，ACR 相比其非凸对应物 AR 在表达能力上有所不足。这凸显出发展在经验性能与理论证书之间取得更好折中的技术的必要性。

#### 2.3.4 网络 Tikhonov（NETT）方法

传统上，正则化器常被选为相对某些特征具有稀疏化作用的变换，例如全变分对分片常数函数具有稀疏化作用。类似地，神经网络常以编码器—解码器（自编码器）结构训练，其中编码器被训练为把输入信号表示在低维空间中，或寻找更高效（即稀疏）的结构。[25] 提出的网络 Tikhonov（NETT）方法遵循这一范式来学习正则化器：先把预训练网络 $E_\theta:X\to\Xi$ 与正则化泛函 $g:\Xi\to[0,+\infty]$ 复合，使 $g\circ E_\theta:X\to[0,+\infty]$ 对期望模型参数取较小值，而对带伪影或其他不理想结构的模型参数给出较大值以施加惩罚。该方法中的深度神经网络 $E_\theta$ 允许采用相当一般的架构，例如上述自编码器。训练完成后，重建由如下变分目标的极小元给出：

$$
J_\theta(x):=f\left(y^\delta,Ax\right)+\lambda g\left(E_\theta(x)\right). \tag{20}
$$

确实，在 (20) 的某些解析条件（如正则化器 $g(E_\theta(\cdot))$ 的弱下半连续性与强制性）下，NETT 方法也提供可证明的收敛正则化方法。与 (18) 中通过强制凸性在 $X$ 的强拓扑下实现收敛的 ACR 相比，NETT 的主要区别在于其在 $X$ 的弱拓扑下实现收敛。$g(E_\theta(\cdot))$ 的弱下半连续性与强制性可如下获得：首先把常用 ReLU 激活函数替换为带小 $\tau>0$ 的 leaky ReLU，定义为

$$
\ell\mathrm{ReLU}_\tau(s):=\max(\tau s,s),
$$

它在 $s\to-\infty$ 时趋于 $-\infty$。与 $E_\theta$ 中的仿射线性映射（权重矩阵）结合，对 $g$ 的标准选择（如加权 $\ell_p$ 范数 $g(\xi)=\sum_i v_i|\xi|^p$，权重 $v_i$ 一致为正、$p\ge1$），便得到强制且弱下半连续的正则化函数 $g\circ E_\theta$。最后指出，通过引入绝对 Bregman 距离这一新概念并对正则化器施加更强条件，可实现强收敛。

## 3 基于即插即用（PnP）去噪的正则化

去噪是成像中最简单、也可说是研究最充分的逆问题；过去数十年间已有大量算法被提出，尤其是用于去除图像中的加性白高斯噪声。因此，自然要问：能否借助现成的去噪器来求解具有非平凡前向算子的更复杂图像恢复任务？Venkatakrishnan 等 [45] 开创了在近端分裂算法（如交替方向乘子法（ADMM））中以即插即用（PnP）方式使用去噪器的思想，由此产生的一类算法被称为 PnP 去噪方法。为理解用去噪器替代近端算子的动机，回顾关于（可能非光滑的）凸泛函 $g:X\to\mathbb R\cup\{+\infty\}$ 与步长 $\tau>0$ 的近端算子定义：

$$
\mathrm{prox}_{\tau g}(x)=\arg\min_u\frac{1}{2}\|x-u\|^2+\tau g(u). \tag{21}
$$

如 (21) 所示，计算近端算子等价于在 Gibbs 先验 $\propto\exp(-\tau g(u))$ 下，用贝叶斯最大后验概率（maximum a-posteriori probability，MAP）估计框架对含噪图像 $x$ 去噪。近端算子的这种**去噪解释**是 PnP 方法的基础，而 PnP 已被证明能对广泛的成像逆问题产生优异重建结果。经典且广泛流行的 PnP 去噪例子是将其与前向—后向分裂（forward-backward splitting，FBS）结合，得到如下迭代重建算法：

$$
x_{k+1}=D_\sigma\left(x_k-\eta_k\nabla f(x_k)\right). \tag{22}
$$

这里 $f$ 表示底层逆问题的数据保真损失，$\eta_k>0$ 为第 $k$ 次迭代的步长，$D_\sigma$ 为从输入中消除标准差为 $\sigma$ 的高斯噪声的去噪器。

除近端方法内的 PnP 去噪框架（其中去噪器隐式充任正则化器）之外，Romano 等 [37] 提出另一种思路：利用去噪器 $D_\sigma(x)$ 显式构造正则化器

$$
g(x)=\frac{1}{2}x^\top\left(x-D_\sigma(x)\right), \tag{23}
$$

随后可寻求最小化能量泛函 $f(x)+\lambda g(x)$（$g$ 如 (23) 所定义），由此得到称为**去噪正则化**（regularization-by-denoising，RED）算法的不动点迭代格式。然而，Schniter 等 [34] 随后指出，RED 算法的能量极小化解释仅在以下条件下成立：(i) 去噪器局部齐次，即对足够小的 $\varepsilon$ 与所有 $x$ 有 $D_\sigma((1+\varepsilon)x)=(1+\varepsilon)D_\sigma(x)$；(ii) $D_\sigma$ 的 Jacobian 对称。通用去噪器一般不满足这些条件，因此 RED 基于能量极小化的解释不成立。取而代之，[34] 作者发展出称为**分数匹配**（score-matching）的新框架来分析 RED 算法的收敛性。

尽管 PnP 去噪算法（如 (22)）在经验上成功，但它并不会直接继承相应优化方案（本例中为 FBS）的收敛性。近年来，研究 PnP 去噪的收敛性在数学成像界受到大量关注。对形如 (22) 的 PnP 算法，最自然的收敛形式可以说是迭代的稳定性，即判断 PnP 算法生成的迭代序列 $x_k$ 是否收敛。此类收敛保证通常来自不动点定理，需要证明 PnP 迭代是压缩映射 [11,40]。例如，[40] 在算子 $(D_\sigma-\mathrm{id})$ Lipschitz 连续的假设下建立了 PnP-ADMM（即采用交替方向乘子法算法的 PnP）的不动点收敛性，具体结果见定理 2。

**定理 2（PnP-ADMM 的不动点收敛性 [40]）**

考虑如下 PnP-ADMM 算法：

$$
x_{k+\frac{1}{2}}=\mathrm{prox}_{\tau f}\left(z_k\right),\quad
x_{k+1}=D_\sigma\left(2x_{k+\frac{1}{2}}-z_k\right),\quad
z_{k+1}=z_k+x_{k+1}-x_{k+\frac{1}{2}}, \tag{24}
$$

其中数据保真损失 $f$ 假设为 $\mu$-强凸。可把 (24) 等价地写成不动点迭代 $z_{k+1}=T(z_k)$，其中

$$
T=\frac{1}{2}\mathrm{id}+\frac{1}{2}\left(2D_\sigma-\mathrm{id}\right)\left(2\,\mathrm{prox}_{\tau f}-\mathrm{id}\right). \tag{25}
$$

假设去噪器对全部 $u,v\in X$ 与某 $\varepsilon>0$ 满足

$$
\left\|\left(D_\sigma-\mathrm{id}\right)(u)-\left(D_\sigma-\mathrm{id}\right)(v)\right\|_2\le\varepsilon\|u-v\|_2, \tag{26}
$$

且强凸参数 $\mu$ 满足 $\frac{\varepsilon\left(1+\varepsilon-2\varepsilon^2\right)}{\mu}<\tau$，则算子 $T$ 是压缩的，PnP-ADMM 算法不动点收敛，即 $(x_k,z_k)\to(x_\infty,z_\infty)$，其中 $(x_\infty,z_\infty)$ 满足

$$
x_\infty=\mathrm{prox}_{\tau f}\left(z_\infty\right)\quad\text{且}\quad x_\infty=D_\sigma\left(2x_\infty-z_\infty\right). \tag{27}
$$

如 [40] 所述，若 $(2D_\sigma-\mathrm{id})$ 非扩张，则由单调算子理论可得 PnP-ADMM 的不动点收敛；而 (26) 对去噪器施加的条件限制更少。

不动点收敛性虽保证 PnP 迭代稳定，但其所收敛的特定不动点并不自动极小化某个变分能量函数。为弥合经典变分方法与 PnP 方法之间的差距，重要的是导出把 PnP 迭代的极限点刻画为某个正则化变分目标（自然依赖去噪器）的极小元（或至少稳定点）的条件。这类收敛称为**目标收敛**，强于不动点收敛。

采用经典（伪）线性去噪器（如非局部均值去噪器）的 PnP 的目标收敛性已在 [31] 中建立。Hurault 等 [21] 证明，采用构造为梯度场的去噪器（称为梯度步（gradient-step，GS）去噪器）的 PnP 收敛到（可能非凸的）变分目标的稳定点（参见定理 3）。GS 去噪器的构造受 Tweedie 恒等式启发：最优最小均方误差（minimum mean-squared error，MMSE）高斯去噪器由

$$
D^*_\sigma(x):=\mathbb E\left[x_0\mid x=x\right]=x+\sigma^2\nabla\log p_\sigma(x) \tag{28}
$$

给出，其中 $x=x_0+\sigma z$、$z\sim\mathcal N(0,\mathrm{id})$ 为高斯噪声（方差 $\sigma^2$），$x_0\in X\subseteq\mathbb R^d$ 为干净图像，

$$
p_\sigma(x)=\frac{1}{(2\pi\sigma^2)^{\frac{d}{2}}}\int\exp\left(-\frac{\|x-x_0\|_2^2}{2\sigma^2}\right)p(x_0)\,dx_0. \tag{29}
$$

确实，最优高斯去噪器具有形式 $D^*_\sigma(x)=x-\nabla g^*_\sigma(x)$，其中 $g^*_\sigma$ 为 (29) 中所定义平滑分布 $p_\sigma$ 的负对数，其结构与 GS 去噪器相同。

**定理 3（采用梯度步（GS）去噪器的 PnP 迭代目标收敛性 [21]）**

假设去噪器构造为梯度步（GS）去噪器，即 $D_\sigma=\mathrm{id}-\nabla g_\sigma$，其中 $g_\sigma$ 为正常、下半连续且梯度 $L$-Lipschitz 连续。[21] 中提出的 PnP 算法为

$$
x_{k+1}=\mathrm{prox}_{\tau f}\left(x_k-\tau\lambda\nabla g_\sigma(x_k)\right)
=\mathrm{prox}_{\tau f}\circ\left(\tau\lambda D_\sigma+\left(1-\tau\lambda\mathrm{id}\right)\right)(x_k), \tag{30}
$$

其中 $f:X\to\mathbb R\cup\{+\infty\}$ 表示数据保真并假设凸且下半连续。则当 $\tau<\frac{1}{\lambda L}$ 时，如下保证成立：

1. 序列 $F(x_k)$（其中 $F=f+\lambda g_\sigma$）单调不增且收敛。
2. $\|x_{k+1}-x_k\|_2\to0$，表明迭代稳定，即无限迭代也不会发散。
3. $\{x_k\}$ 的所有极限点都是 $F(x)$ 的稳定点。

值得注意的是，由 (30) 定义的 PnP 迭代恰等价于对 $f+\lambda g_\sigma$（$g_\sigma$ 可能非凸）的近端梯度下降。

目标收敛性虽保证 PnP 迭代与变分目标极小化之间的一一对应，但并未对迭代收敛到的解的正则化性质给出任何保证。依经典正则化理论的精神，因此希望能够控制 PnP 算法中由去噪器实现的隐式正则化，并分析当噪声水平与正则化强度趋于零时 PnP 重建的渐近行为。更精确地说，假设 PnP 迭代收敛到解 $\hat x(y^\delta,\sigma,\lambda)$（其中 $\sigma$ 为与去噪器相关的参数、$\lambda$ 为显式正则化惩罚），希望获得关于 $\sigma$ 与/或 $\lambda$ 的合适选择规则，使 $\hat x(y^\delta,\sigma,\lambda)$ 在 $\delta\to0$ 的极限下表现出类似 (7) 的收敛性。据我们所知，该方向的首批进展见于 [14]，精确的收敛结果见定理 4。

**定理 4（收敛的即插即用（PnP）正则化 [14]）**

考虑形如

$$
x^\delta_{\lambda,k+1}=D_\lambda\left(x^\delta_{\lambda,k}-\eta A^*\left(Ax^\delta_{\lambda,k}-y^\delta\right)\right) \tag{31}
$$

的 PnP-FBS 迭代，其中 $D_\lambda$ 为具有可调正则化参数 $\lambda$ 的去噪器。令 $\mathrm{PnP}(\lambda,y^\delta)$ 为 PnP 迭代 (31) 的不动点。则对任意 $y\in\mathrm{range}(A)$ 与任意收敛到 $0$ 的噪声水平序列 $\delta_k>0$，存在收敛到 $0$ 的正则化参数序列 $\lambda_k$，使得对满足 $\|y_k-y_0\|_2\le\delta_k$ 的全部 $y_k$，在关于去噪器的适当假设下（细节见 [14] 定义 3.1）成立：

1. $\mathrm{PnP}(\lambda,y^\delta)$ 对任意 $\lambda>0$ 关于 $y^\delta$ 连续；
2. 序列 $(\mathrm{PnP}(\lambda_k,y_k))_{k\in\mathbb N}$ 存在弱收敛子列；
3. $(\mathrm{PnP}(\lambda_k,y_k))_{k\in\mathbb N}$ 的每个弱收敛子列的极限都是算子方程 $y_0=Ax$ 的解。

文献 [14] 的结果尽管是此类中的首个，但对去噪器作了相当严格的假设，尤其是要求去噪器**压缩**，而大多数实用去噪器（特别是用深度 CNN 建模的去噪器）并不满足该条件。这促使我们提出如下问题：采用更一般、表达力更强的去噪器的 PnP 方法是否也是收敛正则化方法？若能（在收敛后）把 PnP 解与某个底层变分目标的极小元联系起来，该问题或许更易处理。因此我们首先考虑梯度步去噪器——对此可以建立这种联系（见定理 3）。把 (30) 中的 $\lambda$ 视为显式正则化参数、同时使用固定的预训练去噪器，则收敛的 PnP 解可解释为 $f+\lambda g_\sigma$ 的极小元，其中 $\lambda$ 随测量噪声水平 $\delta$ 变化、而 $\sigma$ 保持固定。图 2 中图像去模糊的数值结果似乎表明，梯度步 PnP 确实是收敛正则化方案，而经典理论在 $g_\sigma$ 强制且有下界时只能保证类似 [26] 的稳定性。此外，$\sigma$ 作为隐式正则化参数的作用未被利用，且不管测量噪声水平如何都保持不变；这部分是因为 $g_\sigma$ 关于 $\sigma$ 的行为难以精确刻画，使得基于 $\delta$ 调优 $\sigma$ 很困难。为严格建立收敛性，并发展控制去噪器正则化强度的原则性方法，下一节考虑采用线性去噪器的 PnP。

## 4 控制 PnP 中的正则化强度

在 PnP 框架下把学习型去噪器用于求解逆问题时，一个基本问题是如何调节所施加的正则化强度。确实，学习型去噪器通常在固定噪声水平下训练，而将其实际用于 PnP 框架下的逆问题以及收敛正则化的理论概念，都要求对正则化强度具有一定控制。

实践中已被证明有益的一种方法是**去噪器缩放**方法 [47]：给定（为在给定噪声水平 $\sigma$ 下去噪而设计的）去噪器 $D_\sigma$，引入额外缩放参数 $\alpha>0$，并定义缩放后的去噪器

$$
D_{\sigma,\alpha}(x)=\frac{1}{\alpha}D_\sigma(\alpha x). \tag{32}
$$

这种缩放选择的动机是：若 $J:X\to\mathbb R\cup\{\infty\}$ 为 1-齐次（即对 $\tau>0$ 有 $J(\tau u)=\tau J(u)$）且其近端算子良定义，则有

$$
\begin{aligned}
\mathrm{prox}_{\tau J}(x)&=\arg\min_y\frac{1}{2}\|x-y\|^2+\tau J(y)\\
&=\arg\min_y\frac{\tau^2}{2}\left\|\frac{x}{\tau}-\frac{y}{\tau}\right\|^2+\tau J(y)\\
&=\tau\arg\min_u\frac{1}{2}\left\|\frac{x}{\tau}-u\right\|^2+J(u)=\tau\,\mathrm{prox}_J\left(\frac{x}{\tau}\right).
\end{aligned}
$$

换言之，若 $D_\sigma=\mathrm{prox}_J$，则 $D_{\sigma,\alpha}=\mathrm{prox}_{J/\alpha}$。需要指出，这一特定缩放选择虽然自然（范数与半范数即 1-齐次的），却有些任意。确实，假设 $J$ 是 $c$-齐次的（$c>0$），即对任意 $u$ 与 $\delta>0$ 有 $J(\delta u)=\delta^cJ(u)$。对任意 $\delta>0$，有

$$
\begin{aligned}
\mathrm{prox}_{\tau J}(x)&=\arg\min_y\frac{1}{2}\|x-y\|^2+\tau J(y)
=\arg\min_y\frac{\delta^2}{2}\left\|\frac{x}{\delta}-\frac{y}{\delta}\right\|^2+\tau J(y)\\
&=\delta\arg\min_u\frac{1}{2}\left\|\frac{x}{\delta}-u\right\|^2+\frac{\tau}{\delta^2}J(\delta u)
=\delta\arg\min_u\frac{1}{2}\left\|\frac{x}{\delta}-u\right\|^2+\frac{\tau}{\delta^{2-c}}J(u).
\end{aligned}
$$

选取 $\delta=\tau^{\frac{1}{2-c}}$，得到

$$
\mathrm{prox}_{\tau J}(x)=\tau^{\frac{1}{2-c}}\mathrm{prox}_J\left(\tau^{\frac{1}{c-2}}x\right), \tag{33}
$$

这与 1-齐次泛函的结果一致并对其推广——但 2-齐次泛函除外，因为上述推导对 2-齐次情形不成立。事实上，这恰好引出一个结论：对线性去噪器，**任何**形如式 (33) 的去噪器缩放都无法用于控制正则化强度以获得收敛正则化——因为去噪器内部的乘性因子可以被提到外面，并与外部的因子相消。

### 4.1 控制线性去噪器的正则化强度

考虑具有线性去噪器 $D_\sigma:X\to X$ 的设置。若要把其解释为某个底层泛函的近端算子，必须假设它是对称、半正定（positive semi-definite，p.s.d.）算子；若进一步假设底层泛函凸，则 $D_\sigma$ 还必须是**非扩张**的。这些性质是 [28] 中近端算子刻画（并推广到可能非凸泛函的 [18]）的直接推论。我们限定于 $D_\sigma$ 非扩张的情形，以绕开底层变分问题非凸的潜在困难。事实上，我们将假设 $D_\sigma$ 是**压缩**的，即 $\|D_\sigma\|<1$；后文将看到，这对应假设底层正则化泛函是强制的。此外假设 $D_\sigma$ 有下界，即对某 $c>0$ 有 $\|D_\sigma(x)\|\ge c\|x\|$，从而 $D_\sigma^{-1}$ 存在且有界。

**注 1。** 实践中，对称性假设可稍作放松，方法是换一个视角：[17] 在有限维中证明，任何与对称半正定矩阵相似的去噪器在 PnP 应用中都是可接受的；此时可找到修正的内积，使去噪器关于该内积是近端算子。

我们来更细致地研究线性去噪器 $D_\sigma$ 的近端算子刻画。目标是理解底层泛函 $J:X\to\mathbb R$ 使得 $D_\sigma=\mathrm{prox}_J$。首先注意，由定义 (21)，我们只能把 $J$ 恢复到相差一个加性常数的程度。有

$$
D_\sigma=\mathrm{prox}_J=(\mathrm{id}+\partial J)^{-1}=\left(\partial\left[J+\|\cdot\|^2\right]\right)^{-1},
$$

其中 $\partial$ 为次微分。另一方面，由于 $D_\sigma$ 线性，它是凸二次泛函 $\phi:X\to\mathbb R$（$\phi(x)=\langle x,D_\sigma x\rangle/2$）的梯度，即 $D_\sigma=\nabla\phi$。由凸分析的标准结果，$(\nabla\phi)^{-1}=\nabla\phi^*$，其中 $\phi^*$ 为 $\phi$ 的凸共轭，且

$$
\nabla\phi^*=\partial\left[J+\frac{1}{2}\|\cdot\|^2\right].
$$

因此，忽略无关的加性常数，与 $D_\sigma$ 对应的底层正则化泛函 $J$ 为

$$
J(x)=\phi^*(x)-\frac{1}{2}\|x\|^2=\frac{1}{2}\left\langle x,\left(D_\sigma^{-1}-\mathrm{id}\right)x\right\rangle. \tag{34}
$$

当可获得底层正则化泛函 $J$ 时，最常见的控制正则化强度的方法就是对其缩放：引入参数 $\tau>0$ 并考虑 $\mathrm{prox}_{\tau J}$。把该操作应用于 (34)，得到

$$
\tau J(x)=\frac{1}{2}\left\langle x,\left(\left[\tau D_\sigma^{-1}-(\tau-1)\mathrm{id}\right]-\mathrm{id}\right)x\right\rangle,
$$

按上述推理反推，这提示

$$
\mathrm{prox}_{\tau J}=\left(\tau D_\sigma^{-1}-(\tau-1)\mathrm{id}\right)^{-1}=h_\tau\left(D_\sigma\right). \tag{35}
$$

这里 $h_\tau:\mathbb R\to\mathbb R$（$h_\tau(\lambda)=\lambda/(\tau-\lambda(\tau-1))$）通过函数演算作用于 $D_\sigma$。上述推导的关键结论是：我们可以对线性去噪器 $D_\sigma$ 执行**谱滤波**操作以控制其正则化强度。事实上，如下文所示，可使用比此处更一般的滤波函数 $h_\tau$。

**注 2。** 值得把此处提出的谱滤波方法与线性不适定逆问题正则化中成熟的谱滤波方法 [15] 作对比：传统方法作用于**前向算子**以实现正则化效果，而我们作用于**去噪器**（且不依赖去噪器将被应用于哪个前向算子）以控制其正则化强度。

为更好理解谱滤波操作对去噪器的作用，考察图 3，这有助于我们了解应对广义滤波函数（即不仅实现底层正则化泛函缩放的那些滤波函数）提出何种要求。

### 4.2 通过线性去噪器的广义谱滤波实现收敛正则化

上一节我们看到，可以用一种方式对线性去噪器做谱滤波，从而有效地缩放底层正则化泛函。现在推广谱滤波的条件，并证明这种对线性去噪器的谱滤波能够为线性不适定逆问题带来收敛正则化。

由 (34) 可知，线性去噪器与底层正则化泛函 $J$ 之间的关系为 $D_\sigma=\mathrm{prox}_J$，其中

$$
J(x)=\frac{1}{2}\left\langle x,\left(D_\sigma^{-1}-\mathrm{id}\right)x\right\rangle.
$$

此外，我们看到了缩放正则化泛函对相应近端算子的影响。可以推广这一思路并考察

$$
J_\tau(x):=\frac{1}{2}\left\langle x,\left(h_\tau(D_\sigma)^{-1}-\mathrm{id}\right)x\right\rangle,
$$

其中 $\{h_\tau:\mathbb R\to\mathbb R\}_{\tau\in(0,\infty)}$ 是一族可利用连续函数演算作用于 $D_\sigma$ 的谱滤波函数。下面导出使这一构造给出收敛正则化的谱滤波条件 $h_\tau$。首先，由于假设 $D_\sigma$ 有下界且压缩，有 $\mathrm{spec}(D_\sigma)\subset(0,1)$；导出这些假设的同样考虑促使我们要求对每个 $\tau>0$ 有 $h_\tau(\mathrm{spec}(D_\sigma))\subset(0,1)$。由于希望把 $J_\tau$ 看作与 $\tau J$ 有些类似，我们问如下极限

$$
J^*(x):=\lim_{\tau\to0}\frac{1}{\tau}J_\tau(x)
=\lim_{\tau\to0}\frac{1}{2\tau}\left\langle x,h_\tau(D_\sigma)^{-1}x\right\rangle-\frac{1}{2\tau}\|x\|^2
$$

是否存在且性态足够良好。确实，若该极限良定义，一个自然的预期结果是：当 $\delta\to0$ 时取合适的 $\tau\to0$，我们可收敛到逆问题的 $J^*$-极小最小二乘解。

**注 3。** 与上述一致，在定理 5 中将假设去噪器压缩，由 (34) 这意味着相应的正则化泛函是强制的。该假设可放松：只要求前向算子的核与去噪器相容，使得 (36) 中的目标函数强制。

**定理 5。** 设 $D_\sigma:X\to X$ 为有界线性自伴算子，并被解释为去噪器；进一步假设 $D_\sigma$ 正定、有下界且压缩（从而 $\mathrm{spec}(D_\sigma)\subset(0,1)$）。再假设有有界线性前向算子 $A:X\to Y$（不失一般性设 $\|A\|=1$），且 $\{h_\tau:\mathbb R\to\mathbb R\}_{\tau\in(0,\infty)}$ 是一族连续标量函数，满足

**A.1** 对任意 $\tau>0$ 有 $h_\tau(\mathrm{spec}(D_\sigma))\subset(0,1)$；

**A.2** 当 $\tau\to0$ 时，$r_\tau(\lambda):=\frac{1-h_\tau(\lambda)}{\tau h_\tau(\lambda)}$ 对 $\lambda\in\mathrm{spec}(D_\sigma)$ 一致收敛，极限为 $r^*$，且收敛速率 $\|r_\tau-r^*\|_{L^\infty(\mathrm{spec}(D_\sigma))}=o(\tau)$；

**A.3** $\underline{c}:=\inf_{\tau>0,\ \lambda\in\mathrm{spec}(D_\sigma)}r_\tau(\lambda)>0$，$\bar c:=\sup_{\tau>0,\ \lambda\in\mathrm{spec}(D_\sigma)}r_\tau(\lambda)<\infty$。

在此设置下，定义（利用连续函数演算把标量函数作用于 $D_\sigma$）

$$
J_\tau(x):=\frac{1}{2}\left\langle x,\left(h_\tau(D_\sigma)^{-1}-\mathrm{id}\right)x\right\rangle=\frac{\tau}{2}\left\langle x,r_\tau(D_\sigma)x\right\rangle.
$$

变分问题

$$
\hat x=\arg\min_{x\in X}\frac{1}{2}\left\|Ax-y\right\|^2+J_\tau(x) \tag{36}
$$

的解可用 PnP-FBS 计算：

$$
\hat x=\lim_{k\to\infty}x_k,\qquad\text{其中}\quad x_{k+1}=h_\tau(D_\sigma)\left(x_k-A^*\left(Ax_k-y\right)\right). \tag{37}
$$

由 A.2 可定义 $J^*(x)=\lim_{\tau\to0}J_\tau(x)/\tau$。现若适当选取正则化参数 $\tau^\delta$，则得到收敛正则化：假设 $\tau^\delta\sim\delta$，并设存在底层图像 $x^*\in X$、无噪测量 $y=Ax^*$、满足 $\|y^\delta-y\|\le\delta$ 的序列 $\{y^\delta\}_{\delta>0}$，以及

$$
\hat x\left(y^\delta,\tau^\delta\right)=\arg\min_{x\in X}\frac{1}{2}\left\|Ax-y^\delta\right\|^2+J_{\tau^\delta}(x).
$$

则 $\hat x(y^\delta,\tau^\delta)\to x^\dagger$，其中

$$
x^\dagger=\arg\min_{x\in X\ \text{s.t.}\ A^*(Ax-y)=0}J^*(x)
$$

为逆问题 $Ax=y$ 的 $J^*$-极小最小二乘解。

**证明。** 首先注意，在定理假设下，由 (37) 描述的 PnP-FBS 对任意 $\tau$ 与 $y$ 都是压缩不动点迭代（因此有唯一不动点并收敛到该点），且不动点满足变分问题 (36) 的最优性条件。

由 A.3，可定义 $\underline J(x)=\inf_\tau J_\tau(x)/\tau$ 与 $\bar J(x)=\sup_\tau J_\tau(x)/\tau$，于是

$$
\frac{\underline c}{2}\|x\|^2\le\underline J(x)\le\frac{J_\tau(x)}{\tau}\le\bar J(x)\le\frac{\bar c}{2}\|x\|^2. \tag{38}
$$

取极限还得到

$$
\frac{\underline c}{2}\|x\|^2\le J^*(x)\le\frac{\bar c}{2}\|x\|^2.
$$

上述界表明逆问题的 $J^*$-极小最小二乘解唯一，因为它定义为强凸泛函在 $X$ 的闭线性子空间上的极小化。

已有无噪测量 $y=Ax^*$、满足 $\|y-y^\delta\|\le\delta$ 的一组 $y^\delta$、以及满足当 $\delta\to0$ 时 $\tau^\delta\sim\delta$ 的参数选择规则 $\delta\mapsto\tau^\delta$。考虑相应的重建集合

$$
\hat x\left(y^\delta,\tau^\delta\right)=\arg\min_{x\in X}\frac{1}{2}\left\|Ax-y^\delta\right\|^2+J_{\tau^\delta}(x).
$$

由上述说明，可用 (37) 计算这些重建。为证明方便，还定义具有静态正则化泛函 $J^*$ 的变分重建算子如下：

$$
\hat x_{\mathrm{static}}(y,\tau):=\arg\min_{x\in X}\frac{1}{2}\left\|Ax-y\right\|^2+\tau J^*(x). \tag{39}
$$

按现有理论，在所用参数选择下该静态正则化方法是收敛正则化（例如可由 [41, Proposition 3.32] 的一般结果保证）：$\hat x_{\mathrm{static}}(y^\delta,\tau^\delta)\to x^\dagger$，其中 $x^\dagger$ 为逆问题的 $J^*$-极小最小二乘解。此外，由三角不等式有

$$
\left\|\hat x\left(y^\delta,\tau^\delta\right)-x^\dagger\right\|
\le\left\|\hat x\left(y^\delta,\tau^\delta\right)-\hat x_{\mathrm{static}}\left(y^\delta,\tau^\delta\right)\right\|
+\left\|x_{\mathrm{static}}\left(y^\delta,\tau^\delta\right)-x^\dagger\right\|, \tag{40}
$$

因此只需证明当 $\delta\to0$ 时 $\|\hat x(y^\delta,\tau^\delta)-\hat x_{\mathrm{static}}(y^\delta,\tau^\delta)\|\to0$。

可写出

$$
\hat x(y,\tau)=\left[A^*A+\tau r_\tau(D_\sigma)\right]^{-1}A^*y
$$

与

$$
\hat x_{\mathrm{static}}(y,\tau)=\left[A^*A+\tau r^*(D_\sigma)\right]^{-1}A^*y,
$$

因此只需证明当 $\tau\to0$ 时 $\|M_\tau^{-1}-M_{\tau,\mathrm{static}}^{-1}\|\to0$（因为 $\tau^\delta\sim\delta$），其中 $M_\tau=A^*A+\tau r_\tau(D)$、$M_{\tau,\mathrm{static}}=A^*A+\tau r^*(D)$。有

$$
\begin{aligned}
M_\tau^{-1}-M_{\tau,\mathrm{static}}^{-1}
&=\left[M_{\tau,\mathrm{static}}+\tau\left(r_\tau(D_\sigma)-r^*(D_\sigma)\right)\right]^{-1}-M_{\tau,\mathrm{static}}^{-1}\\
&=\left[\left[\mathrm{id}+\tau M_{\tau,\mathrm{static}}^{-1}\left(r_\tau(D_\sigma)-r^*(D_\sigma)\right)\right]^{-1}-\mathrm{id}\right]M_{\tau,\mathrm{static}}^{-1}.
\end{aligned}\tag{41}
$$

我们将用 Neumann 级数展开内层矩阵求逆。首先注意（由 A.3）$M_{\tau,\mathrm{static}}$ 有下界：$\|M_\tau x\|\ge\underline c\tau\|x\|$。因此 $\|M_{\tau,\mathrm{static}}^{-1}\|\le1/(\underline c\tau)$，并可估计

$$
\left\|\tau M_{\tau,\mathrm{static}}^{-1}\left(r_\tau(D_\sigma)-r^*(D_\sigma)\right)\right\|
\le\tau\frac{1}{\underline c\tau}\left\|r_\tau(D_\sigma)-r^*(D_\sigma)\right\|
=\frac{\left\|r_\tau-r^*\right\|_{L^\infty(\mathrm{spec}(D_\sigma))}}{\underline c}. \tag{42}
$$

由 A.2 知当 $\tau\to0$ 时 $\|r_\tau-r^*\|_{L^\infty(\mathrm{spec}(D_\sigma))}\to0$，故对充分小的 $\tau$，(42) 必小于 1，这是 Neumann 级数绝对收敛的充分条件。利用这一点与 (41)，可得

$$
\begin{aligned}
M_\tau^{-1}-M_{\tau,\mathrm{static}}^{-1}
&=\left[\sum_{n=0}^{\infty}\left[-\tau M_{\tau,\mathrm{static}}^{-1}\left(r_\tau(D_\sigma)-r^*(D_\sigma)\right)\right]^n-\mathrm{id}\right]M_{\tau,\mathrm{static}}^{-1}\\
&=\left[\sum_{n=1}^{\infty}\left[-\tau M_{\tau,\mathrm{static}}^{-1}\left(r_\tau(D_\sigma)-r^*(D_\sigma)\right)\right]^n\right]M_{\tau,\mathrm{static}}^{-1}.
\end{aligned}
$$

最后，利用 (42) 与 $\|M_{\tau,\mathrm{static}}^{-1}\|\le1/(\underline c\tau)$ 可直接估计其范数：

$$
\begin{aligned}
\left\|M_\tau^{-1}-M_{\tau,\mathrm{static}}^{-1}\right\|
&\le\sum_{n=1}^{\infty}\left(\frac{\left\|r_\tau-r^*\right\|_{L^\infty(\mathrm{spec}(D_\sigma))}}{\underline c}\right)^n\frac{1}{\underline c\tau}\\
&=\frac{\left\|r_\tau-r^*\right\|_{L^\infty(\mathrm{spec}(D_\sigma))}}{\underline c}\frac{1}{1-\frac{\left\|r_\tau-r^*\right\|_{L^\infty(\mathrm{spec}(D_\sigma))}}{\underline c}}\frac{1}{\underline c\tau}\\
&=\frac{1}{\tau}\frac{\left\|r_\tau-r^*\right\|_{L^\infty(\mathrm{spec}(D_\sigma))}}{\underline c^2-\underline c\left\|r_\tau-r^*\right\|_{L^\infty(\mathrm{spec}(D_\sigma))}}.
\end{aligned}
$$

由于已假设当 $\tau\to0$ 时 $\|r_\tau-r^*\|_{L^\infty(\mathrm{spec}(D_\sigma))}=o(\tau)$，按上述推理可得 $\|\hat x(y^\delta,\tau^\delta)-\hat x_{\mathrm{static}}(y^\delta,\tau^\delta)\|\to0$。回顾 (40) 中的不等式，即可断定谱滤波方法构成收敛正则化。

**例 1。** 考虑 (34) 与 (35) 中先前讨论的情形，对应于 $h_\tau(\lambda)=\lambda/(\tau(1-\lambda)+\lambda)$。有

$$
r_\tau(\lambda)=\frac{1-h_\tau(\lambda)}{\tau h_\tau(\lambda)}=\frac{1-\lambda}{\lambda}.
$$

特别地，假设 A.3、A.2 与 A.1 均平凡满足：对 $\lambda>0$ 有 $h_\tau(\lambda)<\lambda$，$r^*=r_\tau$ 对全部 $\tau>0$ 成立，且

$$
\inf_{\tau>0,\ \lambda\in\mathrm{spec}(D_\sigma)}r_\tau(\lambda)=\frac{1-\lambda_{\max}(D_\sigma)}{\lambda_{\max}(D_\sigma)}>0,
$$

$$
\sup_{\tau>0,\ \lambda\in\mathrm{spec}(D_\sigma)}r_\tau(\lambda)=\frac{1-\lambda_{\min}(D_\sigma)}{\lambda_{\min}(D_\sigma)}<\infty.
$$

这并不出人意料：按前文讨论，该谱滤波选择恰对应于定理 5 证明中所用的静态正则化方法，其收敛性质已由经典理论建立。

### 4.3 实验

本节演示用谱滤波方法控制学习型去噪器的正则化强度，并将其通过 PnP-FBS 应用于逆问题，表明它确实给出实践中收敛的正则化方法。由于谱滤波方法是为线性去噪器发展的，首先需要为线性可学习去噪器确定一种合理设计。

本工作中，我们修改 U-net 架构 [38]——它至今仍在图像到图像任务中被广泛成功使用，把下采样路径与上采样路径（如自编码器中）与连接瓶颈前后对应尺度的跳跃连接结合起来。对我们的关键洞察是：U-net 架构在如下意义下是对称的——若下采样与上采样操作为线性且互为转置，且省略激活函数与偏置，则 U-net 是线性的，其转置也是形状相同的 U-net（可视为原 U-net 的反向运行）。特别地，容易看出可通过在下采样与上采样路径之间绑定权重得到对称线性 U-net。另一种或许更简单的做法是取线性 U-net 与其转置的平均，得到对称线性去噪器；这也是本节实验采用的方法，因为可利用 JAX [9] 的能力：给定线性 U-net，可高效计算其向量—Jacobian 乘积以得到其转置。图 4 比较了此类线性 U-net 与相当的非线性 U-net 的去噪性能（设置与下文用于逆问题的设置相同）——所谓“相当”是指网络规模与可训练参数数量相同。虽然非线性 U-net 允许更好的重建（尤其在锐度方面），但两种去噪器都去除了含噪图像中相当一部分噪声。下文使用线性 U-net $D_{\sigma,l}$，并简记为 $D_\sigma$。

我们考虑的实验涉及计算机断层成像（CT）中的图像重建逆问题。考虑尺寸为 $64\times64$ 的图像，由如图 6 所示随机生成的椭圆体模组成，并用 ASTRA 工具箱 [1,2] 以平行束几何、150 个等间隔视角模拟 CT 测量（正弦图）。在受高斯白噪声污染的椭圆体模上训练一个线性 U-net 作为去噪器，随后以 PnP-FBS 方式应用该去噪器：记把图像 $u$ 映射为（无噪）正弦图 $y$ 的前向算子为 $A$、含噪测量为 $y^\delta$、训练好的去噪器为 $D_\sigma$，迭代

$$
x_{k+1}=h_\tau\left(D_\sigma\right)\left(x_k-\eta A^*\left(Ax_k-y^\delta\right)\right),\qquad
\hat x\left(y^\delta,\tau\right)=\lim_{k\to\infty}x_k,
$$

其中 $\eta$ 为步长，满足 $\eta\le2/\|A\|^2$ 以保证极限良定义。这里我们直接使用与式 (35) 中缩放底层正则化泛函相对应的谱滤波 $h_\tau$。

考虑满足 $\|y^\delta-y\|\le\delta$ 的含噪测量序列 $\{y^\delta\}_{\delta>0}$ 以及相应的步长 $\tau^\delta\propto\delta$，满足定理 5 的条件。图 5 与图 6 表明，谱滤波方法确实如定理 5 所预测的那样给出实践中收敛的正则化。

## 5 结论

重建算法是否提供收敛正则化，这一问题在逆问题中已被长期研究，因为它提供的不仅是“在某一噪声水平下可计算出解”这一知识，还告诉我们稳定解对所有噪声实现都存在；更重要的是，在噪声消失的极限情形下，我们得到底层算子方程的解。换言之，我们可以从数学上保证所得解确实是逆问题的解。

这与某些新型数据驱动方法形成对比：对那些方法，我们或许只能保证所得解在给定合适训练数据时是经验损失的极小元。因此，收敛的数据驱动重建概念近来引起相当关注，例如参见 [30]。由于 PnP 方法与凸优化 [23] 的直接联系以及纳入由非线性神经网络给出的学习型去噪器的可能性，PnP 在此中具有特殊地位。尽管在建立收敛概念（即不动点收敛与目标收敛）方面已有相当进展，对一般**非线性去噪器**而言，收敛正则化问题仍未解决。

本文通过去噪器**谱滤波**这一新概念，为学习型**线性**去噪器向前推进了一步。所提方法允许在 PnP 框架下建立可证明的收敛正则化；此外，这种收敛在 CT 图像重建逆问题上得到了数值验证。如定理 5 所建立，作用于去噪器的滤波函数选择有一定自由度；未来工作可更细致地研究这一选择。该方向上特别值得关注的是选择计算代价不高、但仍能调节去噪器正则化强度的谱滤波。确实，在现有方法实现中，训练后去噪器被实例化为矩阵，并需计算其特征分解以施加谱滤波。若考虑由多项式给出的谱滤波，例如，便可避免把去噪器实例化为矩阵并计算完整特征分解。除此以外，研究去噪器滤波方法能否合理推广到去噪器为**非线性**的情形也极具意义。

事实上，我们已在 PnP 梯度步框架中使用非线性去噪器时数值观察到类似的收敛行为（见图 2），这提示了一个有前景的方向：证明在关于去噪器的现实假设下 PnP 能给出收敛正则化。然而梯度步框架只是控制学习型去噪器正则化强度的一种方式；特别地，它依赖翻转变分目标的常规分裂方式，因而需要对数据项近端算子反复求值；若前向算子求值昂贵，这可能计算代价很高。因此，研究在 PnP 中以其他方式控制现实学习型去噪器的正则化强度、并仍能给出可证明的收敛正则化，依然极具研究价值。

## 致谢

CBS 感谢 Philip Leverhulme 奖、Royal Society Wolfson Fellowship、EPSRC 高级职业 fellowship EP/V029428/1、EPSRC 项目 EP/S026045/1 与 EP/T003553/1、EP/N014588/1、EP/T017961/1、Wellcome Innovator Awards 215733/Z/19/Z 与 221633/Z/20/Z、欧盟 Horizon 2020 研究与创新计划 Marie Skłodowska-Curie 资助协议 No. 777826 NoMADS、Cantab Capital Institute for the Mathematics of Information 以及 Alan Turing Institute 的支持。FS 感谢 EPSRC 高级职业 fellowship EP/V029428/1 的支持。AH 感谢芬兰科学院 Excellence Centre of Inverse Modelling and Imaging（proj. 353093）与 Academy Research Fellow（proj. 338408）的支持。

## 图注与表注

**图 1：** 采用不同正则化器的稀疏视角 CT 重建。（a）真值；（b）$g_\lambda(x)=\lambda\|x\|_2^2$；（c）$g_\lambda(x)=\lambda\|\nabla x\|_2^2$；（d）$g_\lambda(x)=\lambda\|\nabla x\|_1$。含噪正弦图由先沿 64 个等间隔角度位置计算平行束投影（每个位置 365 条射线）、再加入白高斯噪声生成。正则化参数在 (b) 中取 $\lambda=0.1$，在 (c)(d) 中取 $\lambda=10^{-4}$。该实验表明正则化方案的收敛性并不特别指示重建质量，并凸显了学习数据自适应正则化器以提升重建质量的必要性。

**图 2：** 采用 PnP 梯度步 DRUNet 去噪器作为图像去模糊收敛正则化方法的示意。（a）噪声水平与到 $g_\sigma$-极小解 $x^\dagger$ 的距离；（b）–（i）对应不同噪声水平 $\sigma_0$（以真值最大像素值 255.0 的百分比表示）的去模糊图像 $\hat x(y^{\sigma_0})$；（j）真值。重建的 PnP 方案最小化形如 $f+\lambda g_\sigma$ 的变分能量，其中 $f$ 为保真、$g_\sigma$ 为预训练去噪器诱导的正则化器；输入模糊图像为 $y^{\sigma_0}=Ax+w$，$A$ 为高斯模糊核、$w$ 为方差 $\sigma_0^2$ 的加性高斯噪声；正则化参数取 $\lambda=c\sigma_0+\varepsilon$，常数 $c=0.04$、$\varepsilon=10^{-4}$。

**图 3：** 按式 (35) 对去噪器做滤波的效果。横轴为输入特征值 $\lambda$（0.0–1.0），纵轴为滤波后特征值 $h_\tau(\lambda)$（0.0–1.0）；曲线为 $\tau=0.1,0.5,1.0,2.0$。与直觉一致，当 $\tau\to0$ 时谱被压平：正则化强度消失时，去噪器的作用也应消失。

**图 4：** 基于相同架构的非线性 U-net（$D_{\sigma,\mathrm{nl}}$）与线性对称 U-net（$D_{\sigma,l}$）的去噪性能比较。$x^*$ 为真值图像，$y$ 为被高斯噪声污染的同一图像，生成方式与训练数据相同。与 $D_{\sigma,\mathrm{nl}}$ 相比，$D_{\sigma,l}$ 因不含非线性而难以重建锐利边缘；另一方面，两种去噪器都显著改善信噪比：$y$ 的 PSNR 为 24.3 dB，$D_{\sigma,\mathrm{nl}}(y)$ 的 PSNR 为 34.0 dB，$D_{\sigma,l}(y)$ 的 PSNR 为 27.8 dB。

**图 5：** 应用谱滤波方法，在实践中观察到收敛正则化：横轴为噪声水平 $\delta$（$10^{-5}$–$10^{-1}$），纵轴为 $\|\hat x(y^\delta,\tau^\delta)-x^\dagger\|$（$10^{-4}$–$10^{-2}$）。$x^\dagger$ 为如定理 5 所述无噪最小二乘问题的 $J^*$-极小解。

**图 6：** 应用谱滤波方法，在实践中观察到收敛正则化：给出与图 5 曲线相对应的一组快照，随 $\delta$ 增大依次为 $x^*$、$x^\dagger$ 以及不同噪声水平下的 $\hat x(y^\delta,\tau^\delta)$ 与 FBP($y^\delta$)。注意 $x^*$（底层真值）与 $x^\dagger$ 不同，因为前向算子具有非平凡核。

> **原文说明：** 原文全文不含表格（Table），仅有上述 6 幅图，因此本页不设表格转写。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 30–32 页转录；未逐条核对 DOI）。

[1] van Aarle, W., Palenstijn, W.J., Cant, J., Janssens, E., Bleichrodt, F., Dabravolski, A., de Beenhouwer, J., Batenburg, K.J., Sijbers, J.: Fast and flexible X-ray tomography using the ASTRA toolbox. Optics Express 24(22), 25129–25147 (2016). DOI 10.1364/OE.24.025129.

[2] van Aarle, W., Palenstijn, W.J., De Beenhouwer, J., Altantzis, T., Bals, S., Batenburg, K.J., Sijbers, J.: The ASTRA Toolbox: A platform for advanced algorithm development in electron tomography. Ultramicroscopy 157, 35–47 (2015). DOI 10.1016/j.ultramic.2015.05.002.

[3] Adler, J., Öktem, O.: Learned primal-dual reconstruction. IEEE Transactions on Medical Imaging 37(6), 1322–1332 (2018).

[4] Aharon, M., Elad, M., Bruckstein, A.M.: K-SVD: An algorithm for designing of overcomplete dictionaries for sparse representation. IEEE Transactions on Signal Processing 54(11), 4311–4322 (2006).

[5] Allard, W.K., Chen, G., Maggioni, M.: Multi-scale geometric methods for data sets II: Geometric multi-resolution analysis. Applied Computational and Harmonic Analysis 32(3), 435–462 (2012).

[6] Amos, B., Xu, L., Kolter, J.Z.: Input convex neural networks. In: International Conference on Machine Learning, pp. 146–155 (2017).

[7] Benning, M., Burger, M.: Modern regularization methods for inverse problems. Acta Numerica 27, 1–111 (2018).

[8] Boink, Y.E., Haltmeier, M., Holman, S., Schwab, J.: Data-consistent neural networks for solving nonlinear inverse problems. Inverse Problems and Imaging 17(1), 203–229 (2023).

[9] Bradbury, J., Frostig, R., Hawkins, P., Johnson, M.J., Leary, C., Maclaurin, D., Necula, G., Paszke, A., VanderPlas, J., Wanderman-Milne, S., Zhang, Q.: JAX: composable transformations of Python+NumPy programs (2018). URL http://github.com/google/jax

[10] Chambolle, A., Holler, M., Pock, T.: A convex variational model for learning convolutional image atoms from incomplete data. ArXiv 1812.03077 (2018).

[11] Chan, S.H., Wang, X., Elgendy, O.A.: Plug-and-play ADMM for image restoration: Fixed-point convergence and applications. IEEE Transactions on Computational Imaging 3(1), 84–98 (2017). DOI 10.1109/TCI.2016.2629286.

[12] Chun, I.Y., Zheng, X., Long, Y., Fessler, J.A.: Sparse-view x-ray CT reconstruction using ℓ1 regularization with learned sparsifying transform. In: 14th International Meeting on Fully Three-Dimensional Image Reconstruction in Radiology and Nuclear Medicine (Fully3D 2017) (2017).

[13] De los Reyes, J.C.: Optimal control of a class of variational inequalities of the second kind. SIAM J. Control Optim. 49(4), 1629–1658 (2011). DOI http://dx.doi.org/10.1137/090764438.

[14] Ebner, A., Haltmeier, M.: Plug-and-play image reconstruction is a convergent regularization method (2022).

[15] Engl, H.W., Hanke, M., Neubauer, A.: Regularization of inverse problems, vol. 375. Springer Science & Business Media (1996).

[16] Garcia-Cardona, C., Wohlberg, B.: Convolutional dictionary learning. ArXiv 1709.02893 (2017).

[17] Gavaskar, R.G., Athalye, C.D., Chaudhury, K.N.: On Plug-and-Play Regularization Using Linear Denoisers. IEEE Transactions on Image Processing 30, 4802–4813 (2021). DOI 10.1109/TIP.2021.3075092.

[18] Gribonval, R., Nikolova, M.: A Characterization of Proximity Operators. Journal of Mathematical Imaging and Vision 62(6), 773–789 (2020). DOI 10.1007/s10851-020-00951-y.

[19] Hintermüller, M., Laurain, A., Löbhard, C., Rautenberg, C.N., Surowiec, T.M.: Elliptic mathematical programs with equilibrium constraints in function space: Optimality conditions and numerical realization. In: Trends in PDE Constrained Optimization, pp. 133–153. Springer International Publishing (2014).

[20] Hintermüller, M., Wu, T.: Bilevel optimization for calibrating point spread functions in blind deconvolution (2015).

[21] Hurault, S., Leclaire, A., Papadakis, N.: Gradient step denoiser for convergent plug-and-play. CoRR abs/2110.03220 (2021). URL https://arxiv.org/abs/2110.03220

[22] Jin, K.H., McCann, M.T., Froustey, E., Unser, M.: Deep convolutional neural network for inverse problems in imaging. IEEE Transactions on Image Processing 26(9), 4509–4522 (2017).

[23] Kamilov, U.S., Bouman, C.A., Buzzard, G.T., Wohlberg, B.: Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications. IEEE Signal Processing Magazine 40(1), 85–97 (2023).

[24] Kang, E., Min, J., Ye, J.C.: A deep convolutional neural network using directional wavelets for low-dose x-ray CT reconstruction. Medical Physics 44(10), e360–e375 (2017).

[25] Li, H., Schwab, J., Antholzer, S., Haltmeier, M.: NETT: Solving inverse problems with deep neural networks. arXiv preprint arXiv:1803.00092v3 (Dec. 2019).

[26] Lunz, S., Öktem, O., Schönlieb, C.B.: Adversarial regularizers in inverse problems. In: Advances in Neural Information Processing Systems, pp. 8507–8516 (2018).

[27] Mairal, J., Bach, F., Ponce, J., Sapiro, G.: Online learning for matrix factorization and sparse coding. Journal of Machine Learning Research 11, 19–60 (2010).

[28] Moreau, J.J.: Proximité et dualité dans un espace hilbertien. Bulletin de la Société mathématique de France 93, 273–299 (1965). DOI 10.24033/bsmf.1625.

[29] Mukherjee, S., Dittmer, S., Shumaylov, Z., Lunz, S., Öktem, O., Schönlieb, C.B.: Learned convex regularizers for inverse problems. arXiv preprint arXiv:2008.02839v2 (2021).

[30] Mukherjee, S., Hauptmann, A., Öktem, O., Pereyra, M., Schönlieb, C.B.: Learned reconstruction methods with convergence guarantees: A survey of concepts and applications. IEEE Signal Processing Magazine 40(1), 164–182 (2023).

[31] Nair, P., Gavaskar, R.G., Chaudhury, K.N.: Fixed-point and objective convergence of plug-and-play algorithms. IEEE Transactions on Computational Imaging 7, 337–348 (2021). DOI 10.1109/TCI.2021.3066053.

[32] Natterer, F.: The mathematics of computerized tomography. Wiley (1986).

[33] Natterer, F., Wübbeling, F.: Mathematical methods in image reconstruction. SIAM (2001).

[34] Reehorst, E.T., Schniter, P.: Regularization by denoising: clarifications and new interpretations. IEEE Transactions on Computational Imaging 5(1), 52–67 (2019).

[35] De los Reyes, J.C., Schönlieb, C.B., Valkonen, T.: Bilevel parameter learning for higher-order total variation regularisation models. Journal of Mathematical Imaging and Vision 57(1), 1–25 (2017).

[36] De los Reyes, J.C., Villacís, D.: Bilevel optimization methods in imaging. In: Handbook of Mathematical Models and Algorithms in Computer Vision and Imaging: Mathematical Imaging and Vision, pp. 1–34. Springer (2022).

[37] Romano, Y., Elad, M., Milanfar, P.: The little engine that could: Regularization by denoising (RED). SIAM Journal on Imaging Sciences 10(4), 1804–1844 (2017).

[38] Ronneberger, O., Fischer, P., Brox, T.: U-net: Convolutional networks for biomedical image segmentation. In: Medical Image Computing and Computer-Assisted Intervention – MICCAI 2015, Lecture Notes in Computer Science, vol. 9351, pp. 234–241. Springer (2015). DOI 10.1007/978-3-319-24574-4_28.

[39] Rubinstein, R., Bruckstein, A.M., Elad, M.: Dictionaries for sparse representation modeling. Proceedings of the IEEE 98(1045–1057) (2010).

[40] Ryu, E., Liu, J., Wang, S., Chen, X., Wang, Z., Yin, W.: Plug-and-play methods provably converge with properly trained denoisers. In: Proceedings of the 36th International Conference on Machine Learning, vol. 97, pp. 5546–5557. PMLR (2019).

[41] Scherzer, O., Grasmair, M., Grossauer, H., Haltmeier, M., Lenzen, F.: Variational methods in imaging. Springer (2009).

[42] Schuster, T.: The method of approximate inverse: theory and applications, vol. 1906. Springer (2007).

[43] Schwab, J., Antholzer, S., Haltmeier, M.: Deep null space learning for inverse problems: convergence analysis and rates. Inverse Problems 35(2), 025008 (2019).

[44] Sulam, J., Papyan, V., Romano, Y., Elad, M.: Multi-layer convolutional sparse modeling: Pursuit and dictionary learning. ArXiv 1708.08705 (2017).

[45] Venkatakrishnan, S.V., Bouman, C.A., Wohlberg, B.: Plug-and-play priors for model based reconstruction. In: 2013 IEEE Global Conference on Signal and Information Processing, pp. 945–948 (2013). DOI 10.1109/GlobalSIP.2013.6737048.

[46] Xu, Q., Yu, H., Mou, X., Zhang, L., Hsieh, J., Wang, G.: Low-dose x-ray CT reconstruction via dictionary learning. IEEE Transactions on Medical Imaging 31(9), 1682–1697 (2012).

[47] Xu, X., Liu, J., Sun, Y., Wohlberg, B., Kamilov, U.S.: Boosting the Performance of Plug-and-Play Priors via Denoiser Scaling. arXiv:2002.11546 [eess] (2020). URL http://arxiv.org/abs/2002.11546

[48] Zhang, C., Zhang, T., Li, M., Peng, C., Liu, Z., Zheng, J.: Low-dose CT reconstruction via L1 dictionary learning regularization using iteratively reweighted least-squares. BioMedical Engineering OnLine 15(66), 21 pp. (2016).

**本页范围与校对状态：** 本页为 arXiv:2307.09441v1 的全文中文译稿，覆盖摘要、正文第 1–5 节（含 2.1/2.1.1/2.2/2.3/2.3.1/2.3.2/2.3.3/2.3.4、3、4.1–4.3 等全部小节）、结论、致谢、图 1–6 图注与参考文献 [1]–[48]。公式编号沿用原文（1）–（42），定理 1–5 与注 1–3 全部译出；原文无表格与附录，故未设表格转写。关键公式（含式 (38)–(42) 的证明推导与定理 5 的 A.1–A.3 条件）已用 PDF 第 23、24 页渲染图核对，式 (6) 等用第 5 页渲染图核对。原文疑点：第 24 页证明中“parameter choice rule $\delta\mapsto\tau^\delta$ satisfying $\tau^\delta\sim\delta$ as $\tau\to0$”中极限变量写作 $\tau\to0$，按上下文应为 $\delta\to0$，译文按原文字面保留并在状态段说明。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。如发现公式排版或个别符号与 PDF 不一致，以原文 PDF 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
