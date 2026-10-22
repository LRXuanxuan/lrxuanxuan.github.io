---
layout: page
title: "样条与算子 II：逆问题求解｜中文理论译稿（证明待补）"
permalink: /papers/translations/2026-10-22-splines-operators-part2-inverse-problems/
math: true
toc: true
---

[← 返回论文库](/papers/) · [arXiv 原文](https://arxiv.org/abs/2610.14920)

# 样条与算子：第二部分——逆问题的求解

**原题：** Splines and Operators: Part II—Resolution of Inverse Problems  
**作者：** Michael Unser  
**机构：** 瑞士洛桑联邦理工学院（EPFL）生物医学成像组。  
**来源：** arXiv:2610.14920v1，2026 年 10 月 10 日，39 页。  
**当前范围：** 摘要、目录、第 1–5 节主要结论和推导、附录 A–B 的完整证明及致谢已录入。第 2–4 节部分长证明、具体核实例和参考文献书目仍有遗漏；**尚未通过全文逐式验收**。

## 摘要

本文统一处理近似理论、机器学习、工程和统计学中使用二次型（Hilbert 型）正则化的数据拟合问题。一般性问题是在连续域上进行优化：给定某个未知函数的 $M$ 个线性测量，在凸数据保真项之外，引入惩罚项 $\|Lf\|_{L_2}^2$，其中 $L$ 是类似微分算子的样条容许算子（spline-admissible operator）。

该最小化问题的自然定义域是算子 $L$ 的**母空间（native space）** $\mathcal H_L$——正则项在其中始终有意义的最大 Hilbert 空间。本文给出这一空间简洁、可直接使用的刻画。理论的核心是一组适应测量算子的“条件化”基（measurement-adapted or conditioned basis），它把解的零空间分量与样条分量解耦。

这组基具有三方面作用。第一，它使表示定理的表述更加紧凑，将唯一解限制在一个 $M$ 维空间中，而且对展开系数不再需要额外正交约束。第二，它简化实现，使原问题的精确离散化成为无约束凸优化；在最小二乘情形下还能得到闭式解，因而涵盖岭回归、Tikhonov 正则化及平滑样条。第三，它建立与广义高斯过程的最小均方误差估计之间的联系，这也是配套论文的主题。

## 目录（译）

1. 引言
2. 预备知识：Gelfand 配对与容许性  
　2.1 Hilbert–Gelfand 空间  
　2.2 向量泛函与双正交系统  
　2.3 样条容许算子
3. 算子 $L$ 的母空间
4. 母空间上的线性逆问题  
　4.1 广义变分样条  
　　4.1.1 抽象表示定理  
　　4.1.2 变分样条的刻画  
　4.2 与再生核 Hilbert 空间（RKHS）及传统样条的联系  
　4.3 精确离散化  
　　4.3.1 Tikhonov 正则化与岭回归  
　　4.3.2 具有非平凡零空间的一般情形  
　　4.3.3 基于广义样条的最小二乘逼近
5. 结论
附录 A. 抽象表示定理  
附录 B. 测量空间的分解

## 1. 引言

从有限个线性测量中恢复函数，或者更一般地恢复广义函数（distribution），是无限维逆问题的典型形式。由于问题本质上是不适定的，标准解决方法是引入正则化：在与观测数据一致的候选函数中，选择使正则泛函最小的那个。本文使用 $\|Lf\|_{L_2}^2$ 作为正则项，其中 $L$ 是一种类似微分的算子，相应的解即为广义样条。具体地，设 $y\in\mathbb R^M$ 是由 $M$ 个线性测量泛函 $\nu=(\nu_1,\ldots,\nu_M)$ 获取的数据。广义样条拟合可写为

$$
\min_{f\in\mathcal H_L}\|Lf\|_{L_2}
\quad\text{使得}\quad \nu(f)=y.\tag{1}
$$

其中，$\mathcal H_L\subset\mathcal S'$ 是算子 $L$ 的母空间，即正则项仍有意义的最大空间。一个重要且更具挑战性的情形是，$L$ 有非平凡零空间 $\mathcal N_L=\mathcal N_p$，后者由有限维基 $p=(p_1,\ldots,p_{N_0})$ 张成，满足 $0<N_0<M$。典型例子是 $L=D^{N_0}$ 时，零空间由次数低于 $N_0$ 的多项式构成。

问题（1）及允许观测噪声的变体位于几条长期平行发展的经典理论线索的交汇处。第一条是样条的变分理论，起源于 Schoenberg [1]，经 de Boor 和 Lynch [2] 借助再生核 Hilbert 空间（RKHS）[3] 形式化，再由法国学派推广至一般 Hilbert 空间 [4]、[5]。之后，该理论被扩展至广义测量泛函的 $L_g$ 样条、多维薄板样条，以及噪声数据的平滑样条。第二条是统计学与机器学习中的表示定理。从 Kimeldorf 和 Wahba [11] 的工作，到现代核方法及测量适配变体，它们都说明正则拟合问题的最小化解可以表示为一组适配基函数的有限线性组合。最简单的有限维形式就是岭回归和 Tikhonov 正则化，二者是统计学和逆问题中的基础方法。此后，表示定理也被推广到 Hilbert 框架之外，包括 Banach 空间中的稀疏正则化，以及神经网络对应的函数空间。本文仍保持在二次型正则化框架内，因为在该框架下可以获得更强、更显式的结论。

第三条线索属于逼近理论。在径向基函数理论中，母空间通常被构造为核函数平移张成空间的完备化；当存在多项式零空间时，还可以采用条件正定核。与本文算子观点最接近的是：通过 Green 函数构造广义 Sobolev 空间的再生核。

本文有三个目标。首先，对全部具有二次型（Hilbert 型）正则化的数据拟合问题给出统一理论、统一解结构和统一算法。其次，尽可能明确：哪一类无限维优化问题的解能够被限制在有限维线性子空间中。这要求确定可接受的正则化算子、保证最小化良定的空间、容许的测量泛函，以及保持解结构的数据保真损失。第三，构造统一的数值求解流程，将连续域优化精确离散化，并在数据保真项为二次型时给出闭式解。

本论文是一个系列的第二部分。第一部分刻画了使上述计划可行的算子 $L$（$p$-容许性），并通过试验函数空间的完备化抽象构造母空间 $\mathcal H_L$。其设置基于核 Gelfand 配对 $(\mathcal S,\mathcal S')$，满足连续、稠密嵌入关系 $\mathcal S\hookrightarrow\mathcal H_L\hookrightarrow\mathcal S'$。$\mathcal S$ 的稠密性保证母空间的普适性，使其能够充分逼近信号；向 $\mathcal S'$ 的连续嵌入保证良定性，并提供伴随算子及 Riesz 映射的运算体系。这种推广类似从经典函数推广到广义函数，可以统一涵盖所有 $p$-容许算子，包括分数阶和多维算子。

在本第二部分，作者将上述抽象结构转化为线性逆问题的求解理论。贡献包括：

1. **可直接使用的母空间描述（定理 3.1）。** 给出 $\mathcal H_L$ 的内积、直和分解、嵌入、Riesz 映射，以及仅借助 $L$ 对其中元素的显式表达。该描述涵盖分数阶与多维容许算子，并延伸至非普适双正交系统，这对经典样条例子尤其重要。
2. **表示定理的普遍化（定理 4.3）。** 对一般凸损失与 $\mathcal H_L$ 上任意连续线性测量，证明唯一解位于一个仅由 $(L,\nu)$ 决定的 $M$ 维空间中。插值、回归、Tikhonov 正则化、核估计和平滑样条均为其特例。
3. **测量适配的条件化基（引理 4.4）。** 构造与测量泛函匹配的双正交系统，预先分离解中的零空间与样条分量。由此，表示定理的条件化参数化既稳定（基函数属于母空间），又不需要传统的系数正交约束；精确离散化也成为无约束凸优化，在最小二乘情形下可得到完全解耦的闭式解。

本文第 2 节回顾第一部分的定义，第 3 节建立母空间的刻画，第 4 节证明广义变分样条的表示定理、与 RKHS 和经典样条的联系，以及精确离散化与闭式解。最后，作者指出 Kimeldorf 和 Wahba 发现的样条拟合与高斯过程 Bayesian 估计之间的对应关系。在配套的第三部分论文中，这里构造的广义样条还将被识别为广义高斯过程的最小均方误差估计器，而定理 4.3 的条件化参数化是保持随机版本良定的重要条件。

## 2. 预备知识：Gelfand 配对与容许性

### 2.1 Hilbert–Gelfand 空间

**定义 2.1（核 Gelfand 配对）。** 由拓扑向量空间 $\mathcal S$ 与其拓扑对偶 $\mathcal S'$ 组成的二元组 $(\mathcal S,\mathcal S')$，如果满足：其一，$\mathcal S$ 是核空间且为 Montel 空间；其二，存在连续、稠密且具有规范对称性的嵌入 $\iota:\mathcal S\to\mathcal S'$，使所有 $\varphi,\psi\in\mathcal S$ 满足 $\langle\iota\varphi,\psi\rangle=\langle\iota\psi,\varphi\rangle$，则称为核 Gelfand 配对。除非另作说明，$\mathcal S'$ 采用弱星拓扑。

具体例子是 Schwartz 快速下降函数空间 $\mathcal S(\mathbb R^d)$ 及缓增广义函数空间 $\mathcal S'(\mathbb R^d)$。规范嵌入通过积分对偶配对定义：

$$
\langle\iota\varphi,\psi\rangle
=\int_{\mathbb R^d}\varphi(x)\psi(x)\,dx.\tag{2}
$$

因此，可在没有歧义时将测试函数视为广义函数。

Hilbert 空间 $\mathcal H$ 若包含 $\mathcal S$ 并连续嵌入 $\mathcal S'$，且嵌入是稠密的，则称为 $\mathcal S$-Hilbert–Gelfand 空间：

$$
\mathcal S\overset{d}{\hookrightarrow}
\mathcal H\overset{d}{\hookrightarrow}\mathcal S'.\tag{3}
$$

这一结构有三个基本性质。首先，对偶空间也形成相容的 Gelfand 配对，并由 Cauchy–Schwarz 型估计控制对偶配对：

$$
|\langle\nu,\varphi\rangle|
\le\|\nu\|_{\mathcal H'}\|\varphi\|_{\mathcal H}.\tag{4}
$$

其次，$\mathcal H$ 可作为试验空间在 Hilbert 范数下的完备化构造：

$$
\mathcal H=(\mathcal S,\|\cdot\|_{\mathcal H}).\tag{5}
$$

再次，内积可以由 Riesz 映射 $J_{\mathcal H}:\mathcal H\to\mathcal H'$ 表达：

$$
\langle f,g\rangle_{\mathcal H}
=\langle J_{\mathcal H}f,g\rangle
=\langle f,J_{\mathcal H}g\rangle.\tag{6}
$$

基本示例是作为枢轴空间的 $L_2$：

$$
L_2=(\mathcal S,\|\cdot\|_{L_2}),\qquad
\|\varphi\|_{L_2}^2=\langle\iota\varphi,\varphi\rangle.\tag{7}
$$

当 $\mathcal S=\mathcal S(\mathbb R^d)$ 时，它就是通常的平方可积有限能量函数空间 $L_2(\mathbb R^d)$。

### 2.2 向量泛函与双正交系统

令 $\nu=(\nu_1,\ldots,\nu_M)$ 表示一组线性独立测量泛函，$\nu_m\in\mathcal S'$（或 $\mathcal H'$）。由此定义它们的线性张成空间 $\mathcal N_\nu$、向量值测量算子 $\nu:\varphi\mapsto(\langle\nu_1,\varphi\rangle,\ldots,\langle\nu_M,\varphi\rangle)$，以及相应的有限秩对称算子 $R_\nu$。

**命题 2.2。** 设 $p=(p_1,\ldots,p_{N_0})$ 是广义函数空间中有限维子空间 $\mathcal N_p$ 的一组基。则存在试验函数 $\phi=(\phi_1,\ldots,\phi_{N_0})$，满足 $\langle p_n,\phi_m\rangle=\delta_{m,n}$。由此组成的双正交系统称为普适的（universal），可以在 $\mathcal N_p$ 及其对偶上构造 Hilbert 空间结构。若选择了适当的对偶 Hilbert–Gelfand 空间，则相同形式还允许使用非普适双正交系统。

由这种双正交结构还可以定义斜投影，将空间拆分为零空间方向与消去零空间方向的互补部分。零空间中的元素（如 Taylor 单项式）往往并不属于 $L_2$，因此不能直接在 $L_2$ 中正交化，这正是双正交构造的重要动机。

### 2.3 样条容许算子

**定义 2.3（条件正性）。** 设 $\mathcal N_p$ 是 $\mathcal S'$ 中的有限维空间，并令 $\mathcal S_p$ 为其在 $\mathcal S$ 中的湮灭空间。连续算子 $A:\mathcal S\to\mathcal S'$ 若对全部非零 $\varphi\in\mathcal S_p$ 满足 $\langle A\varphi,\varphi\rangle>0$，则称为关于 $p$ 条件正定。若上述不等式对 $\mathcal S$ 中全部非零元素成立，则称为正定。后者比前者更强。

**定义 2.4（可达零空间）。** 给定 $\mathcal S$ 上连续半范数 $q$，其可达零空间由能够在 $\mathcal S'$ 中表示为一列试验函数极限，同时该列函数的 $q$-半范数趋于零的全部广义函数组成。对正半定算子 $B$ 诱导的半范数，用 $\mathcal N_B$ 表示其可达零空间。这一概念用于判断抽象完备化究竟可视为 $\mathcal S'$ 的具体子空间，还是必须采用等价类构造。

**定义 2.5（$p$-条件 Riesz 对）。** 对一对连续算子 $A,B:\mathcal S\to\mathcal S'$，要求 $A$ 关于 $p$ 条件正定、$B$ 正定，且满足两项条件：零空间匹配 $\mathcal N_B=\mathcal N_p$；以及由 $A,B$ 延拓得到的 Hilbert 空间之间存在互逆的等距同构。这使 $A$ 可以被解释为适当条件下 $B$ 的逆。

**定义 2.6（样条容许算子）。** 设连续线性算子 $L:\mathcal S\to L_2$ 的正规算子为 $B=L^*L$。若存在 $A$ 使 $(A,B)$ 成为 $p$-条件 Riesz 对，并且由 $\|L\cdot\|_{L_2}$ 生成的齐次 Hilbert 空间与 $L_2$ 等距同构，则称 $L$ 为 $p$-容许（样条容许）算子。

条件逆算子、Green 算子及其伴随用于建立从 $L_2$ 到母空间的稳定右逆。不过，在存在非平凡零空间时，不能天真地使用未条件化的 Green 算子乘积 $G^*G$ 作为正规算子的逆，因为该组合可能在试验空间中发散；正确构造必须包括与边界泛函匹配的条件化步骤。

**定理 2.7（样条容许性的刻画）。** 对连续线性算子 $L:\mathcal S\to L_2$，定义对偶能量

$$
Q(\varphi)=
\sup_{\psi\in\mathcal S\setminus\{0\}}
\frac{|\langle\varphi,\psi\rangle|^2}
{\|L\psi\|_{L_2}^2}.
$$

以下四项分别必要，合起来充分，使 $L$ 成为 $p$-容许算子：  
（1）$L$ 在 $\mathcal S$ 上单射；（2）$L(\mathcal S)$ 在 $L_2$ 中稠密，等价于 $\ker L^*=\{0\}$；（3）$Q(\varphi)<\infty$ 当且仅当 $\varphi\in\mathcal S_p$；（4）$L$ 的范数可由该对偶能量上的上确界精确恢复。条件成立时，$\mathcal N_B=\mathcal N_p$，并且 $Q$ 在 $\mathcal S_p$ 上给出相应条件正定算子 $A$ 的能量范数。

## 3. 算子 $L$ 的母空间

假设 $L$ 为 $p$-容许算子，$B=L^*L$，$(A,B)$ 为相应的条件 Riesz 对。给定关于零空间 $\mathcal N_p$ 的双正交系统 $(p,\phi)$，可以构造条件化 Gram 算子 $A_\phi$ 及扩展算子对。母空间 $\mathcal H_L$ 的结构可以用 $L$、其伴随 $L^*$ 及带边界条件的逆算子 $L_\phi^{-1}$ 表示。

**定理 3.1（容许算子 $L$ 的母空间）。** $p$-容许算子 $L:\mathcal S\to L_2$ 可以连续延拓为 $L:\mathcal H_L\to L_2$。母空间具有以下性质：

1. **内积。** 对双正交泛函 $\phi_n$，母空间的 Hilbert 内积为
   $$
   \langle f,g\rangle_{\mathcal H_L}
   =\langle Lf,Lg\rangle_{L_2}
   +\sum_{n=1}^{N_0}\langle\phi_n,f\rangle
     \langle\phi_n,g\rangle.\tag{24}
   $$
   第二项用于使在 $\ker L$ 上退化的半范数变成真正的 Hilbert 范数。
2. **直和分解。**
   $$
   \mathcal H_L=\mathcal H_{L,\phi}\oplus\mathcal N_p,\qquad
   \mathcal H_{L,\phi}
   =\{f:\phi(f)=0\}=L_\phi^{-1}(L_2).\tag{25}
   $$
   $$
   \mathcal N_p=\{f\in\mathcal H_L:Lf=0\}
   =\operatorname{span}\{p_n\}_{n=1}^{N_0}.\tag{26}
   $$
   主 Hilbert 空间 $\mathcal H_{L,\phi}$ 与 $L_2$ 等距同构。
3. **连续、稠密嵌入。** $\mathcal S\overset{d}{\hookrightarrow}\mathcal H_L\overset{d}{\hookrightarrow}\mathcal S'$。因此母空间仍是 Hilbert–Gelfand 空间。
4. **等价范数。** 在选择满足 $\phi_n\in\mathcal H_L'$ 的双正交系统时，作为集合的母空间不依赖这一选择，不同系统诱导的范数具有相同拓扑。
5. **显式表示。** 每个 $f\in\mathcal H_L$ 都可唯一写为
   $$
   f=A_\phi\{f^*\}+p
   =L_\phi^{-1}\{w\}+p,\tag{27}
   $$
   其中 $w=Lf$，$f^*=(L^*L)\{f\}$，$p\in\mathcal N_p$，因此将可由数据恢复的部分与零空间部分明确分离。
6. **Riesz 映射。** 对母空间的 Riesz 算子有 $J_{\mathcal H_L}=L^*L+R_\phi$，其逆与 $A_\phi$ 及有限秩零空间项有关。
7. **齐次部分。** 由半范数 $\|Lf\|_{L_2}$ 生成的齐次空间可识别为商空间 $\mathcal H_L/\mathcal N_p$，并与 $\mathcal H_{L,\phi}$ 等距同构；这一商空间的核心结构不依赖具体的双正交选择。

这个定理说明，尽管样条正则项在零空间中退化，仍可通过有限维零空间的规范化与稳定条件逆算子建立完备且可用于求解逆问题的母空间。

## 4. 母空间上的线性逆问题（主要结果）

### 4.1 广义变分样条

**抽象表示定理（定理 4.1）。** 在适当 Hilbert 空间中，对有限个独立连续线性测量泛函，带范数正则项的凸数据拟合解可通过这些泛函的 Riesz 表示元有限展开。因此，原本无限维的最小化问题可以精确转换为有限维的优化问题。其基本桥梁是 Riesz 映射：

$$
\sum_{m=1}^{M}a_m\nu_m=J_{\mathcal H}\{f_0\}
\quad\Longleftrightarrow\quad
f_0=\sum_{m=1}^{M}a_m\nu_m^*.\tag{40}
$$

**定义 4.2（与 $L$ 相容的测量）。** 令 $\mathcal H_L$ 为 $p$-容许算子 $L$ 的母空间。若 $\nu=(\nu_1,\ldots,\nu_M):\mathcal H_L\to\mathbb R^M$ 满足：各 $\nu_m$ 线性独立且连续；测量零空间基得到的矩阵 $P=\nu(p)\in\mathbb R^{M\times N_0}$ 具有满列秩 $N_0$；则称 $\nu$ 与 $L$ 相容。秩条件意味着即使仅在 $\mathcal N_p$ 内进行最小二乘拟合，也存在唯一的最优零空间系数，正规方程中的 $P^\top P$ 可逆。

**定理 4.3（广义变分样条的表示定理）。** 设 $L$ 为 $p$-容许算子、$\nu$ 为与 $L$ 相容的 $M$ 维线性测量算子，且 $M>N_0$。设数据保真项 $E:\mathbb R^M\times\mathbb R^M\to\mathbb R_{\ge0}\cup\{+\infty\}$ 关于第二变量下半连续、强制且凸。对固定数据 $y\in\mathbb R^M$ 及正则化参数 $\lambda$，考虑

$$
\underset{f\in\mathcal H_L}{\operatorname{argmin}}
\left\{
E(y,\nu(f))+\lambda\|Lf\|_{L_2}^2
\right\}.\tag{42}
$$

解可写成由测量适配基张成的有限线性组合：

$$
f_\lambda=
\sum_{m=1}^{M-N_0}\widetilde a_m\widetilde\psi_m
+\sum_{n=1}^{N_0}b_np_n.\tag{43}
$$

其中，$\widetilde\psi_m=A_{\widetilde\phi}\{\widetilde\nu_m\}\in\mathcal H_{L,\widetilde\phi}$，$\widetilde\nu$ 是引理 4.4 构造的互补测量基。与传统的过参数化形式相比，式（43）将零空间与样条分量预先解耦，系数天然无须额外施加正交约束。

同一个解也可以采用传统的过参数化表达：

$$
f_\lambda=
\sum_{m=1}^{M}a_m\psi_m+
\sum_{n=1}^{N_0}b_np_n,
\qquad P^\top a=0,\tag{44}
$$

其中，$\psi_m=A\{\nu_m\}$。由于后一个展开在零空间方向存在参数冗余，必须加入正交条件，而式（43）通过测量适配基消除了这种冗余。

**引理 4.4（测量空间的直和分解）。** 对满足上述秩条件的测量算子，存在矩阵 $\widetilde P$、$Q$、$\widetilde Q$，使

$$
\begin{bmatrix}\widetilde Q^\top\\\widetilde P^\top\end{bmatrix}
[Q\ \ P]=I_M.\tag{45}
$$

从而得到可逆分解

$$
\nu=Q\widetilde\nu+P\widetilde\phi,\tag{46}
$$

其中，$\widetilde\nu=\widetilde Q^\top\nu$ 消去零空间方向，即 $\widetilde\nu(p)=0$；$\widetilde\phi=\widetilde P^\top\nu$ 则与零空间基双正交，即 $\widetilde\phi(p)=I_{N_0}$。这使测量空间分解为湮灭零空间的分量与其双正交补空间。

由上述结构，可将目标函数改写为样条部分与零空间系数上的优化。数据保真项关于测量连续、下半连续、强制且凸，正则项控制样条分量，零空间的测量矩阵满列秩则控制其系数，从而保证良定性。定理的证明将无限维问题化为 Hilbert 空间中的有限测量插值，并应用 Riesz 表示定理得到式（43）。

### 4.2 与 RKHS 和传统样条的联系

当 $L$ 具有相应的核 Green 算子，并且测量为采样泛函时，表示定理将广义样条与核方法直接联系起来。对于整数阶微分算子 $D^N$，母空间的零空间是低于 $N$ 次的多项式，条件逆的核部分对应分段多项式基。最终得到经典形式

$$
f_\lambda(x)=
\sum_{m=1}^{M}a_m|x-x_m|^{2N-1}
+\sum_{n=1}^{N}b_nx^{n-1},\tag{58}
$$

即次数为 $2N-1$ 的多项式样条。采用分数阶微分算子 $D^\gamma$，$\gamma>1/2$，可以在非整数阶情况下得到分数样条。上述表明，经典多项式样条和广义核估计均属于统一的算子表示框架。

### 4.3 精确离散化

定理 4.3 最重要的结论是：广泛的一类无限维 Hilbert 空间优化问题，其解实际位于一个事先由问题结构确定、与数据内容无关的有限维子空间中。这允许将连续域问题精确地改写为等价的有限维最小化问题，即**精确离散化**。随后便可使用标准数值优化；当数据保真项为二次型时，还能得到闭式解。

**4.3.1 Tikhonov 正则化与岭回归。** 首先考虑零空间平凡、$N_0=0$ 的最简单情形，取最小二乘损失

$$
E_{\mathrm{LS}}(y,\nu(f))
=\sum_{m=1}^{M}|y_m-\langle\nu_m,f\rangle|^2.\tag{59}
$$

这对应逆问题中的 Tikhonov 正则化，也等同于统计学中的岭回归。此时表示定理仅有样条基展开 $f_\lambda=\sum_{m=1}^{M}a_m\psi_m$，$\psi_m=A\{\nu_m\}$；Gram 矩阵 $G$ 的元素为 $G_{m,n}=\langle\nu_m,\psi_n\rangle$，同时也是母空间基函数的内积。由于测量泛函线性独立，$G$ 对称正定，因此最小二乘问题具有唯一解，并可通过有限维线性代数计算。

**4.3.2 一般非平凡零空间。** 对存在零空间的情况，使用条件化基和投影矩阵构造简化系统矩阵 $\widetilde G$，使其显式描述样条基的测量响应。原问题被精确化为无约束优化

$$
\min_{(\widetilde a,b)\in\mathbb R^{M-N_0}\times\mathbb R^{N_0}}
E\!\left(y,Q\widetilde G\widetilde a+Pb\right)
+\lambda\widetilde a^\top\widetilde G\widetilde a.\tag{63}
$$

这个式子是条件化表示的重要计算优势：即使原始算子 $L$ 的零空间非平凡，有限维系数优化仍然是标准形式，不需要额外约束。对于一般凸损失，可以使用梯度下降等数值算法；二次型损失则可获得闭式解。

为了对照，原始的过参数化展开导致

$$
\min_{a,b}\ E(y,Ga+Pb)+\lambda a^\top Ga
\quad\text{使得}\quad P^\top a=0.\tag{65}
$$

其中，$G$ 总是对称的，但在零空间非平凡时通常并非全空间正定；它只在满足正交约束的子空间中正定。原始核对应哪一种条件逆可能改变矩阵元素，但在正交约束上，二次型 $a^\top Ga$ 的值不变，因此正交条件是解结构所必需，而不是形式上的装饰。

**4.3.3 广义样条的最小二乘拟合。** 对过参数化最小二乘问题，目标函数和正交条件为

$$
J_{\mathrm{LS}}(a,b\mid y,\lambda)
=\|Ga+Pb-y\|_2^2+\lambda a^\top Ga,\tag{68}
$$

$$
P^\top a=0.\tag{69}
$$

作者证明，只要满足线性方程组

$$
(G+\lambda I)a+Pb=y,\qquad
P^\top a=0,\tag{70}
$$

便符合相应优化问题的 KKT 条件。关键在于目标函数对 $a$ 的梯度可分解出 $G$，因此方程组第一式可直接使该梯度为零，而第二式保证正交条件。虽然当 $N_0>0$ 时，无约束的过参数化问题存在无穷多组等价系数，但只有一组满足 $P^\top a=0$。其闭式解为

$$
\begin{pmatrix}a\\b\end{pmatrix}
=
\begin{pmatrix}
G+\lambda I&P\\
P^\top&0
\end{pmatrix}^{-1}
\begin{pmatrix}y\\0\end{pmatrix}.
$$

这一系统提供了广义样条最小二乘拟合的直接数值解法，也说明如何由连续域的算子正则化精确地得到一个有限维线性系统。

## 5. 结论

本文提出的公式化框架和表示定理（定理 4.3）将插值、平滑样条、岭回归、Tikhonov 正则化及核估计统一为任意 $p$-容许算子的母空间上的同一类问题。所给假设明确划定了无限维问题的解能够被限制在有限维子空间中的范围：可接受的算子、最大搜索空间、容许测量和数据保真损失。第 4.3 节的精确离散化提供了统一的求解流程，当数据保真项为二次型时还能得到闭式解。

将这些问题统一到一个自洽框架有两方面好处。从概念上看，同一种机制——母空间的 Riesz 映射与条件化基之间的相互作用——同时解释了各种估计器为何具有特定的参数形式。从实际应用上看，一种实现方法即可覆盖整个问题类：使用者的具体工作缩减为确定式（43）中的基函数与式（61）规定的 Gram 矩阵，之后便是一般线性代数操作。

最后，条件化参数化也是连接随机理论的桥梁。在该系列第三部分论文 [37] 中，这些广义样条将被识别为广义高斯过程的最小均方误差估计器，从而将 Kimeldorf 与 Wahba [31] 的经典对应关系推广到目前的普遍性水平。


> **校对状态：** 已补译论文正式结论及附录 A–B 的全部证明与相应矩阵等式（73）–（77）；第 2–4 节的长证明及核实例仍有遗漏，参考文献列表尚未完整校录。本稿仍不标记为已验收全文。

## 附录 A. 抽象表示定理

为保持论述自洽，本附录证明以下经典表示定理：当 Hilbert 空间中的最小范数问题受到有限个线性约束时，其解位于这些约束泛函的 Riesz 表示元所张成的有限维子空间中。

**定理 4.1 的证明。** 每个 $\nu_m\in\mathcal H'$ 都具有唯一的 Riesz 表示元 $\nu_m^*=J_{\mathcal H'}\{\nu_m\}\in\mathcal H$，满足

$$
\langle\nu_{m'},\nu_m^*\rangle
=\langle\nu_{m'}^*,\nu_m^*\rangle_{\mathcal H}
=\langle\nu_{m'},\nu_m\rangle_{\mathcal H'}
=[G]_{m',m}.
$$

这里 $G\in\mathbb R^{M\times M}$ 是该系统的 Gram 矩阵。测量泛函线性独立保证 $G$ 正定且可逆。

**Lagrange 函数与对偶性。** 对约束 $\nu(f)=z$ 引入乘子 $\lambda=(\lambda_m)\in\mathbb R^M$，写出式（38）的 Lagrange 函数：

$$
\begin{aligned}
\mathcal L(f,\lambda)
&=\frac12\|f\|_{\mathcal H}^2+
\sum_{m=1}^{M}\lambda_m(z_m-\langle\nu_m,f\rangle)\\
&=\frac12\Big\|f-\sum_{m=1}^{M}\lambda_m\nu_m^*\Big\|_{\mathcal H}^2
-\frac12\Big\|\sum_{m=1}^{M}\lambda_m\nu_m^*\Big\|_{\mathcal H}^2
+\lambda^\top z.
\end{aligned}
$$

第二个等号使用了 Riesz 表示性质 $\langle\nu_m,f\rangle=\langle\nu_m^*,f\rangle_{\mathcal H}$，并通过配方得到。对 $f\in\mathcal H$ 取下确界，在 $f=\sum_{m=1}^{M}\lambda_m\nu_m^*$ 处达到，得到对偶函数

$$
\inf_{f\in\mathcal H}\mathcal L(f,\lambda)
=\lambda^\top z
-\frac12\Big\|\sum_{m=1}^{M}\lambda_m\nu_m\Big\|_{\mathcal H'}^2
=\lambda^\top z-\frac12\lambda^\top G\lambda.
$$

因此对偶准则就是正文式（39）。因为 $G$ 正定，这个二次型严格凹，其唯一最大点为 $a=G^{-1}z$。

**原问题的求解。** 定义 $g_a=\sum_{m=1}^{M}a_m\nu_m^*$，其中 $a=G^{-1}z$。对于全部 $m'$，

$$
\langle\nu_{m'},g_a\rangle
=\sum_{m=1}^{M}a_m[G]_{m',m}
=z_{m'}.
$$

故可行集 $\mathcal A_z=\{f\in\mathcal H:\nu(f)=z\}$ 非空。令

$$
\mathcal H_0=\operatorname{span}\{\nu_m^*\}_{m=1}^{M},
\quad
\mathcal H_0^\perp
=\{f\in\mathcal H:\langle\nu_m,f\rangle=0,\ m=1,\ldots,M\},
$$

则可行集具有仿射结构 $\mathcal A_z=g_a+\mathcal H_0^\perp$。任意可行点 $f=g_a+h$，其中 $h\in\mathcal H_0^\perp$，由勾股关系有

$$
\|f\|_{\mathcal H}^2
=\|g_a\|_{\mathcal H}^2+\|f-g_a\|_{\mathcal H}^2.
$$

因此唯一的最小范数解是 $f_0=g_a$，其范数为

$$
\|f_0\|_{\mathcal H}^2=a^\top Ga=z^\top G^{-1}z.
$$

定理得证。

## 附录 B. 测量空间的分解

本附录首先证明引理 4.4，然后给出构造测量适配分解的实用方法。

**引理 4.4 的证明。** 由于 $P$ 是满列秩的 $M\times N_0$ 矩阵，必存在互补矩阵 $Q\in\mathbb R^{M\times(M-N_0)}$，使拼接方阵 $[Q\ P]\in\mathbb R^{M\times M}$ 可逆。设

$$
\begin{bmatrix}\widetilde Q^\top\\
\widetilde P^\top\end{bmatrix}
=[Q\ \ P]^{-1}.
$$

由式（45）展开可得

$$
\begin{bmatrix}
\widetilde Q^\top Q &\widetilde Q^\top P\\
\widetilde P^\top Q &\widetilde P^\top P
\end{bmatrix}
=
\begin{bmatrix}
I_{M-N_0}&0\\
0&I_{N_0}
\end{bmatrix}.\tag{73}
$$

其次，按照式（47）和（48），定义新的测量泛函坐标：

$$
\begin{bmatrix}
\widetilde\nu\\
\widetilde\phi
\end{bmatrix}
=
\begin{bmatrix}
\widetilde Q^\top\\
\widetilde P^\top
\end{bmatrix}\nu.\tag{74}
$$

对其求逆，得到

$$
\nu=
\begin{bmatrix}
\widetilde Q^\top\\
\widetilde P^\top
\end{bmatrix}^{-1}
\begin{bmatrix}
\widetilde\nu\\
\widetilde\phi
\end{bmatrix}
=[Q\ \ P]\begin{bmatrix}
\widetilde\nu\\
\widetilde\phi
\end{bmatrix}.\tag{75}
$$

这正是正文的式（46）。利用这些定义和式（73），立即有

$$
\widetilde\nu(p)=\widetilde Q^\top\nu(p)=\widetilde Q^\top P=0
$$

（关于 $p$ 的正交性），以及

$$
\widetilde\phi(p)
=\widetilde P^\top\nu(p)
=\widetilde P^\top P=I_{N_0}
$$

（双正交性）。同理，$\widetilde Q^\top Q=Q^\top\widetilde Q=I_{M-N_0}$，且 $P^\top\widetilde P=I_{N_0}$。

**测量适配基的一种规范构造。** 取

$$
\widetilde P=P(P^\top P)^{-1},\tag{76}
$$

满足 $\widetilde P^\top P=I_{N_0}$，且 $\operatorname{range}(\widetilde P)=\operatorname{range}(P)$。再选取 $P^\top$ 的零空间的一组正交归一基作为 $Q$ 的列，例如通过奇异值分解（SVD）或 QR 分解求得。于是

$$
Q^\top P=0,\qquad Q^\top Q=I_{M-N_0},
\qquad \widetilde P^\top Q=(P^\top P)^{-1}P^\top Q=0.
$$

因此式（73）的四个条件均成立，并且可以直接取 $\widetilde Q=Q$，不需要对 $Q$ 再进行修正。

这种选择之所以是规范的，是因为它使解的两个分量完全解耦。矩阵

$$
P\widetilde P^\top=P(P^\top P)^{-1}P^\top,
\qquad
QQ^\top=I_M-P(P^\top P)^{-1}P^\top
$$

分别是到 $\operatorname{range}(P)$ 和其正交补的正交投影。因此测量空间被正交分解为

$$
\mathbb R^M
=\operatorname{range}(P)\oplus\operatorname{range}(P)^\perp.
\tag{77}
$$

在这一构造中，$\widetilde\phi=\widetilde P^\top\nu$ 包含数据在零空间 $\mathcal N_p$ 上的最小二乘拟合分量；$\widetilde\nu=Q^\top\nu$ 则携带剩余测量信息。这正是正文第 4.3.3 节实现解耦所用的性质。

## 致谢与说明

作者在论文准备过程中使用 Anthropic 的 Claude 作为交互式助手，用于文字校对以及证明的检查与简化。全部结果均经作者自行核验，作者对论文内容承担全部责任。研究获得瑞士国家科学基金会（SNSF）项目 200020 219356 支持。
