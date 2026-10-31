---
layout: page
title: "物理约束生成的后向 SDE 扩散｜中文全文译文"
permalink: /papers/translations/2026-09-17-2609-15702-backward-sdes-based-diffusion-for-physics-constrained-generation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b346889959b048d7/) · [原文 arXiv](https://arxiv.org/abs/2609.15702) · [全部目录](/papers/catalog/)

# 物理约束生成的后向 SDE 扩散

**原题：** Backward SDEs-based Diffusion for Physics-Constrained Generation  
**作者：** Zihao Wang（Laplace Lab，田纳西大学查塔努加分校计算机科学系）  
**版本：** arXiv:2609.15702v1（cs.LG），2026-09-14；ICML 2026（PMLR 306），原文 23 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–6 节（含 2.1/2.2、3.1/3.2、4.1/4.2 全部小节）、结论、致谢、影响声明、附录 A–F、表 1–4 逐格、图 1–8 图注、算法 1–3 逐行与参考文献 [1]–[54]（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

预训练的基于分数的扩散模型提供了强无条件先验，但在逆问题中施加测量一致或物理一致性约束，往往依靠启发式引导、间歇投影或任务特定的条件训练，对推断结束时解的可容许性缺乏保证。我们提出面向基于分数 SDE 先验的**终端条件化反演**。给定一个冻结的 Score-SDE 先验与任务定义的终端可行性规范，我们构造一个与之关联的后向随机微分方程（backward stochastic differential equation，BSDE），其适应解定义了从终端要求到选定噪声水平处先验状态的原则性逆映射。在标准正则性条件下，我们建立适应解的存在唯一性，并由构造得到终端一致性。我们进一步提出实用的神经 BSDE 求解器，可在不修改分数定义系数的前提下，把任意预训练扩散先验与领域约束组合起来，产生一个锚定先验状态，从而支持用于不确定性刻画的邻域采样。玩具数据集实验验证了稳定的终端条件化反演与分布一致的邻域采样。作为真实世界案例研究，我们把该框架应用于稀疏视角 CT 重建，在严格满足给定终端规范下测量可行性的同时，取得优于代表性免训练基线的重建质量。项目主页：https://laplace.center/icmlbsdeI/

## 1 引言

许多实际与科学任务需要从间接含噪观测

$$
y=A(x)+\eta \tag{1}
$$

中恢复未知信号 $x$，其中 $A$ 为已知或部分已知的前向算子，$\eta$ 表示噪声。仅凭前向模型很少能唯一确定 $x$：多个候选都能解释同一 $y$。在高风险场景中，目标不仅是产生感知上合理的样本，而是要在推断结束时输出与观测物理一致的解，例如

$$
x\in\mathcal S(y)\triangleq\{x:A(x)\approx y\}. \tag{2}
$$

这暴露了一种持续存在的张力：物理施加刚性的终端要求，而无监督生成先验通过随机性与高熵支撑集表达不确定性。把物理确定性与生成不确定性衔接起来是核心挑战。

扩散与基于分数的模型（Ho et al., 2020; Song et al., 2021）提供了从海量数据学到的极强表达力先验，促使人们把它们与前向算子结合用于逆问题。已涌现大量方法，包括基于扩散的逆问题求解器（Kawar et al., 2022）、伪逆或条件分数构造（Song et al., 2023）、基于桥的表述（Wang et al., 2025a; De Bortoli et al., 2021; Heng et al., 2021），以及扩散后验采样等后验采样方法（Chung et al., 2023; Li et al., 2024; Alkhouri et al., 2025; Achituve et al., 2025; Ekström Kelvinius et al., 2025; Peng et al., 2024）。尽管经验进展显著，如何施加测量一致性仍是一个持续存在的难点。多数方法依赖逐步惩罚、间歇投影或引导调度，其强度与时间依赖关系靠启发式调参（Janati et al., 2025; Zheng & Lan, 2024）。当逆问题严重不适定时，启发式施加可能产生物理不一致、但视觉上合理的幻觉，这在科学与医学应用中尤其令人担忧。

在概念层面，该困难反映了数学表述上的错配：标准基于分数的生成是**初值**随机输运——从简单参考分布出发，模拟反向时间 SDE 获得数据样本（Song et al., 2021），其基础是关于扩散的时间反演刻画（Anderson, 1982; Hirono et al., 2024）；而物理约束推断天然是**终端值**问题——要求由可行性事件或观测指定。在离散采样循环中注入惩罚或投影，一般并不能定义以终端要求为条件的路径测度，还可能把轨迹推离目标流形，这促成了 MCG 等流形感知修正（Chung et al., 2022）。这些观察指向一个缺失要素：一种其条件直接以终端形式表述的原则性路径空间机制。

在随机分析中，终端值问题天然可用后向随机微分方程（BSDE）表达（Bismut, 1973; Pardoux & Peng, 1990）。BSDE 显式编码终端要求，并求解一个适应对 $(Y_t,Z_t)$。过程 $Z_t$ 在鞅表示中充当适应控制，引导随机动力学以满足给定终端规范。这种终端值视角与物理约束推断直接契合，并与扩散桥、Schrödinger 桥等其他路径条件化范式互补（De Bortoli et al., 2021; Heng et al., 2021）。

我们提出一种基于 BSDE、终端条件化的扩散框架，适用于任何可写成 Score-SDE 形式的预训练分数先验。我们说明：给定定义基础随机动力学的预训练 Score-SDE，可通过任务定义的终端映射施加终端条件，构造一个关联 BSDE。该映射编码观测要求，可实现为"解码—投影到 $\mathcal S(y)$—编码"的复合，从而在终端条件处（而非通过启发式时间依赖引导）施加物理一致性。求解该关联 BSDE 得到从终端要求到选定噪声水平处先验状态的良定义逆映射，并由构造满足终端规范。该关联 BSDE 不是反向时间 SDE：预训练 SDE 指定基础扩散先验，而 BSDE 引入一个适应对，其鞅积分的被积项由终端要求解出。

我们的贡献如下。**第一**，我们提出终端条件化扩散视角，把 BSDE 引入生成建模，作为施加终端可行性的通用机制。**第二**，我们为基于分数的 SDE 先验给出严格的关联 BSDE 构造，并在标准正则性假设下建立良定性，确保适应解的存在唯一性。**第三**，我们为一般 Score-BSDE 发展实用求解器，通过硬终端映射把任意预训练扩散先验与领域定义的终端算子组合起来，避免任务特定的条件训练并降低调参负担。**最后**，我们在代表性物理约束逆问题——稀疏视角 CT 重建——上实例化该框架，作为突出"经关联 BSDE 的终端条件化、可行性定义的重建"与广泛使用的 PnP 式逐步条件化策略之间方法学差距的案例研究。

**表 1　物理约束生成框架比较**

| 框架 | 先验 | 约束形式 | 路径条件化？ | 终端一致性 | 调参负担 |
|---|---|---|---|---|---|
| 变分、TV | 显式正则 / 插件 | 软惩罚 | 否 | 有时 | 中 |
| GAN 反演 | GAN 生成器 | 软、物理损失 | 否 | 无保证 | 高 |
| 扩散后验采样 | 分数 | 软 | 近似 | 无保证 | 高 |
| 投影在环 / PnP | 领域预训练分数 | 间歇投影 | 否 | 常改善，无保证 | 中 |
| 流形约束扩散 | 分数 | 软或混合 | 近似 | 无保证 | 中 |
| 扩散与 Schrödinger 桥 | 分数 | 路径测度 | 是（路径值） | 是 | 高 |
| 本文：BSDE–扩散 | 通用预训练分数 | 硬终端映射 | 是（终端值） | 由构造保证 | 较低 |

## 2 预备知识

我们回顾全文使用的三方面内容：SDE 表述下的基于分数扩散、物理约束逆问题及其常用测量一致性施加策略（汇总于表 1），以及作为终端值形式化的 BSDE。本节服务于主要目标：一个适用于任意预训练基于分数 SDE 先验的、通用且良定的终端定义反演原理。

### 2.1 基于 SDE 的分数扩散

**分数与去噪分数匹配。** 设 $p_{\mathrm{data}}$ 为数据空间 $\mathcal X$ 上的数据分布。基于分数的扩散模型学习一族扰动分布 $\{p_t\}_{t\in[0,T]}$ 的分数场 $\nabla_x\log p_t(x)$。标准训练原理是去噪分数匹配：采样 $x_0\sim p_{\mathrm{data}}$，选择噪声水平 $t$，把 $x_0$ 扰动为 $x_t$，训练神经网络 $s_\theta(x_t,t)$ 近似 $\nabla_x\log p_t(x_t)$（Song et al., 2021）。对形如 $x_t=x_0+\sigma(t)\epsilon$（$\epsilon\sim\mathcal N(0,\mathbf I)$）的高斯扰动，等价目标为

$$
\mathcal L(\theta)=\mathbb E_{t,x_0,\epsilon}\left[\left\|s_\theta(x_t,t)+\frac{x_t-x_0}{\sigma(t)^2}\right\|_2^2\right]. \tag{3}
$$

**前向时间 SDE。** SDE 视角在连续时间中统一了扩散学习与采样（Song et al., 2021）。设 $(\Omega,\mathcal F,\{\mathcal F_t\}_{t\in[0,T]},\mathbb P)$ 为支撑布朗运动 $(W_t)_{t\in[0,T]}$ 的过滤概率空间。一大类扰动过程可写成前向 SDE

$$
dX_t=f(X_t,t)\,dt+g(t)\,dW_t,\quad X_0\sim p_{\mathrm{data}}, \tag{4}
$$

它诱导 $X_t$ 的边缘密度 $p_t$。

**反向时间 SDE。** 给定估计 $s_\theta(x,t)\approx\nabla_x\log p_t(x)$，$p_{\mathrm{data}}$ 的样本可通过模拟反向时间 SDE 获得（Anderson, 1982; Song et al., 2021）：

$$
dX_t=\left[f(X_t,t)-g(t)^2s_\theta(X_t,t)\right]dt+g(t)\,d\bar W_t,\quad t:T\to0, \tag{5}
$$

并从 $X_T\sim p_T$ 初始化。实践中式 (5) 用数值方法积分，求解器选择会影响样本质量（Song et al., 2021; Karras et al., 2022; Jolicoeur-Martineau et al., 2021; Mao et al., 2023）。需要注意，反向时间 SDE 是所学先验的采样机制，并不编码终端可行性约束。

**物理约束逆问题。** 我们考虑由式 (1) 定义测量的逆问题，其中 $A$ 为已知前向算子。核心要求是测量一致性：重建输出应满足可行集

$$
\mathcal S(y)\triangleq\{x:A(x)\approx y\}, \tag{6}
$$

其容差由噪声模型与数值误差决定。该要求在医学成像等高风险场景中尤其重要——视觉上合理但物理不一致的幻觉是不可接受的。

**物理约束扩散。** 表 1 汇总了把学习先验与物理结合的主要范式，它们沿三条轴不同：第一，有些方法通过软惩罚施加约束，另一些应用显式一致性算子；第二，有些方法对应于以终端可行性为条件的路径测度，另一些只做逐步修正而无终端值刻画；第三，实际性能常取决于引导权重与调度的调参。这些差异促成了我们的终端条件化视角：我们不再通过时间依赖引导施加物理，而是把可行性编码为终端条件，并求解一个实现它的适应机制。

### 2.2 后向随机微分方程

后向随机微分方程由终端条件指定、并沿时间反向求解。给定终端随机变量 $\xi$ 与驱动项 $\hat f$，标准 BSDE 寻求适应过程 $(Y_t,Z_t)$ 使（Bismut, 1973; Pardoux & Peng, 1990）

$$
Y_t=\xi+\int_t^T\hat f(s,Y_s,Z_s)\,ds-\int_t^T Z_s\,dW_s,\quad t\in[0,T]. \tag{7}
$$

等价地，$dY_t=-\hat f(t,Y_t,Z_t)\,dt+Z_t\,dW_t$，终端条件 $Y_T=\xi$。在 $\hat f$ 关于 $(Y,Z)$ Lipschitz 且 $\xi\in L^2$ 的标准假设下，式 (7) 存在唯一适应解（Pardoux & Peng, 1990）。过程 $Z_t$ 充当鞅积分被积项，使终端条件在给定过滤下可实现。

这种终端值刻画与式 (5) 的反向时间 SDE 有本质区别：反向时间 SDE 用分数场把 $p_T$ 输运回 $p_{\mathrm{data}}$，从而从所学先验采样；相反，BSDE 把终端规范作为输入，求解满足它的适应对 $(Y,Z)$。这一视角是我们贡献的核心。

## 3 方法

我们把终端条件化反演形式化为预训练基于分数扩散先验下物理约束推断的通用框架。我们的关键观察是：任何基于分数的 SDE 都允许对应的 BSDE 表示，从而可把反演表述为良定的终端值问题。通过把观测或可行性要求编码为终端条件，所诱导的 BSDE 定义了从终端约束到选定噪声水平处先验状态的数学良定逆映射。

### 3.1 用于基于分数建模的 BSDE

我们为任意预训练基于分数 SDE 先验引入终端条件化反演问题，定义关联 BSDE 表示，并陈述使反演映射在数学上可靠的良定性保证。该构造在如下意义上是模型无关的：它适用于任何可写成基于分数 SDE 形式的先验，并通过终端规范算子隔离任务信息。

**Score-SDE 先验。** 设 $(\Omega,\mathcal F,(\mathcal F_t)_{t\in[0,T]},\mathbb P)$ 为支撑 $d$ 维布朗运动 $(W_t)_{t\in[0,T]}$ 的过滤概率空间。基于分数的先验由如下扩散过程 $(X_t)_{t\in[0,T]}$ 表示：

$$
dX_t=b_\theta(X_t,t)\,dt+\sigma(t)\,dW_t, \tag{8}
$$

其中 $\sigma(t)$ 为已知扩散尺度，漂移 $b_\theta$ 由训练好的分数网络 $s_\theta(\cdot,t)$ 指定。该类涵盖标准 VP 与 VE 构造及其分数参数化变体。

**终端规范。** 终端条件化反演由任务给定的终端要求定义。我们通过可测规范算子

$$
\Psi:\mathcal Y\to\mathbb R^d \tag{9}
$$

编码该要求，它把观测 $y\in\mathcal Y$ 映射为目标终端潜状态。实践中，$\Psi$ 可实现为：把潜变量解码到图像域，通过一致性步骤施加任务约束（即在 $A$ 下匹配测量），再编码回潜空间。

**SDE—关联 BSDE 的分数。** 这里的关键建模对象是与给定 SDE 定义分数先验相配的关联 BSDE。它以终端值问题形式提出，返回一个适应解，其初值被解释为在选定噪声水平处恢复的先验状态。

**定义 3.1（分数先验的关联 BSDE）。** 固定时域 $\tau\in(0,T]$。令 $(X_t)_{t\in[0,\tau]}$ 服从由布朗运动 $(W_t)_{t\in[0,\tau]}$ 驱动的预训练分数先验 (8)。令 $\xi$ 为 $L^2(\Omega;\mathbb R^d)$ 中 $\mathcal F_\tau$ 可测的终端随机变量；在终端条件化反演中，对给定观测 $y$ 取 $\xi=\Psi(y)$。

我们寻求适应对 $(Y,Z)$（$Y\in\mathcal S^2([0,\tau];\mathbb R^d)$、$Z\in\mathcal H^2([0,\tau];\mathbb R^{d\times d})$）满足

$$
Y_t=\xi+\int_t^\tau f_\theta(s,X_s,Y_s,Z_s)\,ds-\int_t^\tau Z_s\,dW_s,\quad t\in[0,\tau]. \tag{10}
$$

我们称 (10) 为由分数先验 (8) 与 $\xi$ 编码的终端规范所诱导的**关联 BSDE**。

式 (10) 是标准意义下的 BSDE：终端条件施加在右端点 $t=\tau$，解要求关于 $(\mathcal F_t)$ 适应；过程 $Z_t$ 是未知的适应表示过程，由终端条件解出。这与反向时间 SDE 采样有结构性区别——后者扩散系数是给定的，且不施加终端约束。

**良定性。** 要把 (10) 用作通用反演工具，需要适应解的存在唯一性。在我们的设置中，BSDE 驱动项由预训练分数先验通过其分数网络与噪声调度诱导。具体地，我们考虑形如

$$
f_\theta(t,x,y,z)\triangleq\hat f\left(t,s_\theta(y,t),z\right) \tag{11}
$$

的分数诱导驱动项，其中 $\hat f$ 是由所选先验族与终端条件化机制决定的固定可测映射。分析遵循经典 Lipschitz BSDE 理论，并采用神经分数模型常用的标准正则性假设。

**假设 3.2。** 存在常数 $L_y,L_z\ge0$，使对所有 $t\in[0,\tau]$、$x\in\mathbb R^d$、$y,y'\in\mathbb R^d$、$z,z'\in\mathbb R^{d\times d}$，

$$
\left\|f_\theta(t,x,y,z)-f_\theta(t,x,y',z')\right\|\le L_y\|y-y'\|+L_z\|z-z'\|. \tag{12}
$$

且

$$
\mathbb E\int_0^\tau\left\|f_\theta(t,X_t,0,0)\right\|^2dt<\infty,\qquad\mathbb E\|\xi\|^2<\infty. \tag{13}
$$

**定理 3.3（关联 BSDE 的良定性）。** 在假设 3.2 下，BSDE (10) 存在唯一适应解 $(Y,Z)\in\mathcal S^2([0,\tau];\mathbb R^d)\times\mathcal H^2([0,\tau];\mathbb R^{d\times d})$。

定理 3.3 的证明见附录 B.2，其证明遵循 Lipschitz 驱动 BSDE 的经典良定性结果（Pardoux & Peng, 1990; Peng, 1991），为终端条件化反演提供了数学基础。给定观测 $y$ 与满足 $\xi\in L^2$ 的终端规范 $\xi=\Psi(y)$，逆映射由适应 BSDE 解的唯一初值 $Y_0$ 良定义。

关联 BSDE 由构造保证终端规范，于是有推论 3.4：

**推论 3.4（终端一致性）。** 设 $(Y,Z)$ 为定理 3.3 的唯一解，则 $Y_\tau=\xi$ 几乎必然成立。在 $\xi=\Psi(y)$ 的终端条件化反演中，$\Psi$ 所编码的终端可行性要求几乎必然被 BSDE 解满足。

**BSDE 与反向时间 SDE 的根本区别。** 反向时间 SDE 与 BSDE 是数学上不同的对象，源自不同的问题陈述。反向时间 SDE 是前向扩散的时间反演刻画，因而是许多 PnP 式分数逆问题方法的标准主干：在前向系数与时间边缘密度存在的适当正则假设下，反转过程仍是扩散，其漂移由前向漂移与涉及时间边缘分数的密度相关修正项共同确定（Haussmann & Pardoux, 1986）。这种时间反演刻画是分数生成建模的基础——采样所用反向动力学依赖扰动数据分布的分数，并从参考噪声律向数据端积分（Song et al., 2021）。相反，BSDE 指定终端随机变量并寻求满足后向积分方程的适应对 $(Y,Z)$，其中 $Z$ 是 Doob–Meyer 或鞅表示意义下的鞅积分被积项（Pardoux & Peng, 1990; El Karoui et al., 1997）。因此，反向时间 SDE 处理给定扩散的时间反演与采样动力学，而我们的终端条件化反演被表述为终端值问题，其解是由终端规范确定的适应过程对。

**利用恢复的先验状态进行邻域采样。** 终端条件化反演返回选定噪声水平处恢复的先验状态 $Y_0$。逆问题中一个观测可能允许多种可行解释，探索这种模糊性对不确定性量化往往是有益的。实用机制是在恢复状态附近做邻域采样。设 $(Y,Z)$ 为终端规范 $\xi=\Psi(y)$ 的关联 BSDE 解；从用户选定的局部分布采样扰动 $\delta$，构成扰动先验状态

$$
\tilde Y_0=Y_0+\delta. \tag{14}
$$

随后把每个 $\tilde Y_0$ 通过分数先验对应的预训练扩散动力学传播，产生一族输出，其多样性由扰动尺度控制。由于所有样本通过恢复锚点 $Y_0$ 共享同一终端规范机制，该过程无需修改预训练先验，即可高效生成多个可能解。

### 3.2 求解基于 BSDE 的扩散模型

3.1 节的关联分数-BSDE 是非线性的，通常不存在解析解。因此我们依靠数值求解器计算恢复先验状态与适应表示过程。我们给出两类足以满足需要的求解器：第一类是经典回归型求解器，在时间网格上近似条件期望；第二类是用神经网络参数化表示过程、并以终端匹配进行优化的深度 BSDE 求解器，在我们的实现中可高效 GPU 加速。更全面的 BSDE 求解器综述见（Chessari et al., 2023）。

**时间离散化。** 设 $0=t_0<t_1<\cdots<t_N=T$ 为步长 $\Delta t=T/N$ 的均匀网格，记 $\Delta W_k^i=W_{t_{k+1}}^i-W_{t_k}^i$ 为第 $i$ 条布朗路径的增量。对形如 $Y_t=\xi+\int_t^Tf(s,Y_s,Z_s)ds-\int_t^TZ_sdW_s$ 的 BSDE，标准显式离散给出递推

$$
y_{k+1}^i=y_k^i-f\left(t_k,y_k^i,z_k^i\right)\Delta t+z_k^i\Delta W_k^i,\quad k=0,\ldots,N-1, \tag{15}
$$

其中 $y_k^i\approx Y_{t_k}$、$z_k^i\approx Z_{t_k}$ 沿第 $i$ 条模拟路径。

**回归型求解器。** 经典做法是在网格上通过近似条件期望来估计 $Z_{t_k}$（Gobet et al., 2005; Lemor et al., 2006; Longstaff & Schwartz, 2001; Chessari et al., 2023）。给定 Monte Carlo（MC）样本 $\{(y_k^i,\Delta W_k^i)\}_{i=1}^M$，用基展开把 $\mathbb E[\Delta W_ky_{k+1}\mid\mathcal F_{t_k}]$ 形式的一类量回归到选定的有限维函数类上，得到 $z_k$ 的估计，再代入前向递推 (15)。恢复的先验状态取为所得 $y_0^i$ 在 MC 路径上的经验平均。

传统 BSDE 求解器无法用于求解所提的高维 BSDE-扩散模型：在高维状态空间中，手工设计基上的回归效率低下。因此我们引入基于学习的求解器来求解所提 BSDE-扩散模型，核心思想是用神经网络参数化表示过程（E et al., 2017），并通过最小化终端匹配目标来拟合它。

我们把初值视为可学习参数 $\alpha$，对所有路径令 $y_0^i=\alpha$；把 $Z_{t_k}$ 用神经网络 $\Phi_\beta$ 参数化，令 $z_k^i=\Phi_\beta(t_k,\eta_k^i)$，其中 $\eta_k^i$ 表示第 $i$ 条路径在时刻 $t_k$ 的选定输入特征。给定 $(\alpha,\beta)$，用 (15) 前向传播 $(y_k^i,z_k^i)$ 得到 $y_N^i$，并最小化终端损失

$$
\mathcal L(\alpha,\beta)=\frac{1}{M}\sum_{i=1}^M\left\|\xi-y_N^i\right\|^2. \tag{16}
$$

基于梯度的优化给出参数 $(\alpha,\beta)$，随后恢复的先验状态为 $Y_0\approx\alpha$。算法 1 概述该过程。

**算法 1　基于终端匹配的深度 BSDE 求解器**

- **输入：** 终端规范 $\xi$、步长 $\Delta t$、路径数 $M$、初始参数 $(\alpha,\beta)$、学习率 $\lambda_l$
- **输出：** 恢复的先验状态 $\alpha$ 与网络参数 $\beta$
- **数据：** 布朗路径 $\{W_{t_k}^i\}_{i=1,k=0}^{M,N}$ 与增量 $\Delta W_k^i$
- **repeat**
- 　对所有 $i=1,\ldots,M$ 设 $y_0^i=\alpha$
- 　**for** $k=0$ **to** $N-1$ **do**
- 　　$z_k^i=\Phi_\beta(t_k,\eta_k^i)$；$y_{k+1}^i=y_k^i-f(t_k,y_k^i,z_k^i)\Delta t+z_k^i\Delta W_k^i$
- 　**end for**
- 　更新 $(\alpha,\beta)\leftarrow(\alpha,\beta)-\lambda_l\nabla_{(\alpha,\beta)}\frac{1}{M}\sum_{i=1}^M\|\xi-y_N^i\|^2$
- **until** 收敛

## 4 应用与实验

我们的实验遵循把理论与实践相连的两阶段叙事。

**第 4.1 部分）BSDE 扩散理论的玩具验证。** 我们首先用受控玩具基准经验验证 BSDE-扩散的理论主张：（a）终端值条件化可实现稳定的潜反演，且应与 BSDE 良定性一致；（b）恢复的先验编码在分布意义上是正确的，即邻域采样产生类一致输出且分布一致性改善。

**第 4.2 部分）物理约束 CT 重建。** 随后在同一终端值机制上评估代表性物理约束逆问题：稀疏视角 CT（sparse-view CT，SVCT）重建。这里核心目标是**终端物理一致性**：重建必须在给定数值容差内满足 CT 测量模型，这对任务关键型成像场景中的可靠部署至关重要。

对玩具条件生成，我们报告 Jensen–Shannon 散度衡量的分布相似度（越低越好）与平均余弦相似度衡量的形状相似度（越高越好）。对 CT 重建，我们报告（a）图像质量指标（PSNR/SSIM）与（b）以相对测量残差 $\|A(x)-y\|/\|y\|$ 量化的物理一致性（在施加终端一致性映射后评估）。

### 4.1 玩具验证

**MNIST：终端条件化反演与稳定的先验编码。** 我们在受控视觉设置 MNIST 上验证终端条件化反演。在方差爆炸（VE）SDE 扰动下训练分数模型，再构造终端条件为给定目标样本 $\xi$ 的关联 BSDE，求解适应对 $(Y_t,Z_t)$ 使 $Y_T=\xi$。我们采用驱动项

$$
\hat f\left(s_\theta(Y_t,t),Z_t\right)=-\sigma_t^2s_\theta(Y_t,t)+\alpha Z_t,
$$

并取 $\alpha=0$ 以隔离终端条件化的效应。相应 BSDE 为

$$
dY_t=-\sigma_t^2s_\theta(Y_t,t)\,dt+Z_t\,dW_t,\quad Y_T=\xi. \tag{17}
$$

该设置检验模型的终端值本质。求解器学习一个强制终端规范的适应过程 $Z_t$。

*重复求解与邻域采样下的稳定性。* BSDE 反演把终端样本 $\xi$ 映射为初始状态 $Y_0$，后者充当先验空间中的编码。在良定性条件下适应解唯一，暗示对同一 $\xi$ 重复求解应产生一致编码。因此我们报告终端可行性误差 $|Y_T-\xi|$ 以及恢复 $Y_0$ 在求解器重启与随机种子间的变异性。为验证 $Y_0$ 是有意义的编码而非优化伪影，我们还采样局部邻域

$$
\tilde Y_0=Y_0+\lambda\epsilon,\quad\epsilon\sim\mathcal N(0,\mathbf I), \tag{18}
$$

并从 $\tilde Y_0$ 出发运行 BSDE 条件化前向动力学生成输出。如图 4 所示，这在保持数字身份的同时产生可控多样性，支持 $Y_0$ 是由终端条件诱导的稳定先验编码。

*星体光变曲线：定量分布一致性。* MNIST 提供了直观可视化，但没有直接量化分布保真度。因此我们使用星体光变曲线——该数据集上类条件生成通常用分布指标评估——来检验终端条件化反演是否产生其邻域采样与目标条件分布匹配的先验编码。我们与代表性条件化机制比较，包括基于扩散的扰动编辑、GAN 反演，以及基于 LSTM-VAE 的变分基线；按该数据集惯例报告 Cepheid、Eclipsing Binary 与 RR Lyrae 光变曲线类条件生成的 Jensen–Shannon 散度与平均余弦相似度。表 3 显示相对基线在分布一致性上有所改善。结合 MNIST，这支持终端条件化反演产生稳定编码与分布一致的邻域采样的主张。

**表 3　星体光变曲线的无监督条件生成**（Jensen–Shannon 散度越低越好，平均余弦相似度越高越好）

| 方法 | JS 散度：Cepheid | JS：Eclipsing B | JS：RR Lyrae | 余弦：Cepheid | 余弦：Eclipsing B | 余弦：RR Lyrae |
|---|---|---|---|---|---|---|
| SDE Diff. | 0.3521 | 0.4397 | 0.3942 | 0.4338 | 0.4648 | 0.6284 |
| GAN Inv. | 0.3714 | 0.4374 | 0.3639 | 0.2860 | 0.5495 | 0.3302 |
| LSTMVAE | 0.3929 | 0.4916 | 0.3721 | 0.3794 | 0.0357 | 0.5299 |
| BSDE Diff. | **0.3323** | **0.4223** | **0.3510** | **0.7095** | 0.4321 | **0.6838** |

### 4.2 真实世界案例研究：SVCT 重建

我们在物理约束逆问题 SVCT 重建上实例化终端条件化反演。该案例研究有两个目的：说明终端条件如何在真实测量算子下编码可行性；检验关联 BSDE 求解器能否在不把测量注入预训练分数先验的情况下施加终端物理一致性。

**测量模型与硬终端要求。** 令 $y_0\in\mathcal Y$ 表示 SVCT 测量，测量形成为 $y_0=A(x_0)+\eta$，其中 $x_0\in\mathcal X$ 为扩散数据端的未知标准 CT 图像，$A:\mathcal X\to\mathcal Y$ 为已包含 SVCT 退化机制的已知 CT 前向算子。目标是终端物理一致性：最终重建 $\hat x$ 必须满足

$$
\left\|A(\hat x)-y_0\right\|\le\varepsilon\|y_0\|
$$

（给定数值容差 $\varepsilon>0$）。我们通过硬终端规范与求解器所用终端测量损失来施加该要求，预训练分数先验保持无条件且冻结。

**预训练 SDE 扩散。** 我们采用潜空间中的预训练基于分数扩散先验（Song et al., 2021; Rombach et al., 2022），重建期间保持冻结。令 $X_t\in\mathbb R^d$ 表示潜状态，考虑无条件 VE-SDE

$$
dX_t=g(t)\,dW_t,\quad t\in[0,T], \tag{19}
$$

其中 $W_t$ 为标准布朗运动，$g(t)>0$ 为扩散尺度，边缘噪声水平满足 $\sigma^2(t)=\int_0^tg^2(s)ds$。预训练分数网络 $s_\vartheta(x,t)\approx\nabla_x\log p_t(x)$ 指定各时刻的去噪场。测量 $y_0$ 不进入 (19)。

**成像终端规范。** 我们通过可测映射 $\Psi:\mathcal Y\to\mathbb R^d$ 把 CT 测量要求编码为硬终端规范。给定观测正弦图 $y_0$，$\Psi(y_0)$ 返回数据端潜规范，其解码图像在给定容差下关于 $A$ 测量一致。这使 CT 约束通过终端边界条件（而非预训练分数漂移）暴露给 BSDE。

**SDE 关联 BSDE 形式。** 固定扩散噪声水平 $\tau$，在区间 $[0,\tau]$ 上求解关联 BSDE。我们把 BSDE 时间变量 $t\in[0,\tau]$ 用作反演时间参数，映射到扩散时间 $r=\tau-t$，使 $t=\tau$ 对应扩散数据端 $r=0$、$t=0$ 对应噪声水平 $r=\tau$ 的扩散状态。BSDE 终端条件为

$$
Y_\tau=\Psi(y_0), \tag{20}
$$

关联 BSDE 为

$$
Y_t=Y_\tau+\int_t^\tau f\left(s,X_s,Y_s,Z_s\right)ds-\int_t^\tau Z_s\,dW_s,\quad t\in[0,\tau]. \tag{21}
$$

等价地，$dY_t=-f(t,X_t,Y_t,Z_t)dt+Z_tdW_t$，终端条件 (20)。反演目标是扩散噪声水平 $\tau$ 处恢复的含噪先验状态，由 BSDE 初值 $Y_0$ 表示。

我们用调度 $\{\sigma_k\}_{k=0}^K$ 与增量 $\Delta\sigma_k^2=\sigma_{k+1}^2-\sigma_k^2$ 离散 VE-SDE，并用预训练分数定义的去噪递推从索引 $k_\tau$ 到 0，把噪声水平 $\tau$ 处推断的潜状态映射到数据端。令 $\tilde X_0$ 表示所得数据端潜状态，$D$ 为固定解码器，得到 $\tilde x_0=D(\tilde X_0)$，并把最终重建设为 $\hat x\triangleq\tilde x_0$。

**终端测量一致性。** 我们通过最小化测量差异求解 BSDE：

$$
\min\mathcal L_{\mathrm{meas}}\triangleq\mathbb E\left[\left\|A(\hat x)-y_0\right\|^2\right], \tag{22}
$$

其中期望取在离散分数定义递推所用创新变量上。该损失在测量域施加终端物理一致性，同时保持预训练先验无条件：我们不把 $y_0$ 注入 SDE 系数或分数评估，而是求解一个适应 BSDE 解，使其推断的先验状态产生与 $A$、$y_0$ 一致的终端重建。

**基线与结果。** 我们与滤波反投影（FBP）、全变分最小化（TV）（Chen et al., 2018）、深度图像先验（TVDIP）（Ma et al., 2025），以及四种基于扩散的逆问题求解器比较：PnPDM（Zheng et al., 2025）、DPS（Chung et al., 2023）、DDS（Chung & Ye, 2024）与 SiTCoM（Alkhouri et al., 2025）。这些基线覆盖互补的重建范式：解析与变分方法（FBP、TV）、免训练 DIP 基线（TVDIP）与代表性扩散重建方法。所有方法使用同一 $A$ 并在相同指标下评估。

定量上，表 2 汇总 SVCT 数据集上的重建性能。所提 BSDE 求解器取得最佳 MAE（3.57）、SSIM（0.868）、NSSIM（0.869）、NMSE（0.0101）与 NCC（0.989），同时在 PSNR/NPSNR 上保持竞争力。相对非扩散基线，MAE 从 FBP 的 37.22、TVDIP 的 4.56 降到 3.57，SSIM 从 FBP 的 0.366、TVDIP 的 0.816 升到 0.868。与在本设置下未做数据集特定重训练的扩散基线相比，BSDE 相对 PnPDM、DPS、SiTCoM 有实质改善。我们注意到 DDS 使用已发布的 CT 域先验，因此并不完全对应本文研究的通用先验设置；表 2 中报告 DDS 仅供参照，不作为讨论重点，关于该不匹配及由此产生的公平性问题的更详细讨论见附录。

**表 2　SVCT 重建质量**（并报告方法属性：是否需任务特定训练、测试时是否免训练、是否使用无条件先验、先验是否通用。*DDS 见特殊脚注 [1]）

| 方法 | MAE↓ | PSNR↑ | SSIM↑ | NPSNR↑ | NSSIM↑ | NMSE↓ | NCC↑ | 任务特定训练？ | 免训练？ | 无条件先验？ | 通用先验？ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| FBP | 37.22 | 14.12 | 0.366 | 8.91 | 0.268 | 0.4695 | 0.902 | 否 | 是 | N/A | N/A |
| TV (Chen et al., 2018) | 4.81 | 27.89 | 0.807 | 27.56 | 0.816 | 0.0205 | 0.978 | 否 | 是 | N/A | N/A |
| TVDIP (Ma et al., 2025) | 4.56 | 28.08 | 0.816 | 27.79 | 0.827 | 0.0197 | 0.979 | 否 | 是 | 是 | 是 |
| PnPDM (Zheng et al., 2025) | 23.38 | 19.06 | 0.551 | 22.36 | 0.691 | 0.3531 | 0.934 | 否 | 是 | 是 | 否 |
| DPS (Chung et al., 2023) | 9.84 | 24.27 | 0.494 | 24.36 | 0.508 | 0.0473 | 0.950 | 否 | 是 | 是 | 是 |
| DDS* (Chung & Ye, 2024) | 4.38 | 31.10 | 0.806 | 30.93 | 0.811 | 0.0118 | 0.988 | 否 | 是 | 是 | 否 |
| SiTCoM (Alkhouri et al., 2025) | 5.83 | 27.34 | 0.695 | 27.37 | 0.704 | 0.0265 | 0.973 | 否 | 是 | 是 | 是 |
| **BSDE（本文）** | **3.57** | 30.99 | **0.868** | 30.85 | **0.869** | **0.0101** | **0.989** | 否 | 是 | 是 | 是 |

图 3 印证了定量趋势：FBP 与 TVDIP 保留残余条纹与结构化伪影；TV 抑制噪声但过度平滑高亮区域的精细结构；在扩散基线中，PnPDM、DPS、SiTCoM 能锐化细节，但在逐步软测量引导下可能出现对比度漂移或结构保真度下降。相反，BSDE 更好地保留细微纹理与边缘，同时通过终端可行性映射维持测量一致性，得到视觉上忠实且物理受约束的重建。

## 5 消融

**终端条件化的作用。** 我们首先在 $128\times128$ 分辨率上做受控消融，以隔离所提 BSDE 框架中终端条件化的贡献，比较三个变体：**硬终端约束**表示完整模型，即用终端测量损失优化 BSDE 修正网络；**软终端惩罚**把硬终端条件化机制替换为朝初始终端估计 $z_{\tau,\mathrm{init}}$ 的软惩罚；**无终端约束**移除 BSDE 修正网络，直接优化终端潜变量 $z_\tau$。

表 4 表明终端条件化对图像质量与测量一致性都是本质的。把硬终端约束换成软惩罚，已使 PSNR 从 35.36 降到 33.10、残差从 0.00128 升到 0.00203，说明朝 $z_{\tau,\mathrm{init}}$ 的软吸引并不能完全保持终端可行性。移除终端约束导致大得多的失败：PSNR 降到 17.38、SSIM 降到 0.4188、残差增加两个数量级到 0.2008。这证实性能增益并非仅来自潜优化，而来自施加终端测量要求的 BSDE 修正机制。

**表 4　$128\times128$ CT 重建上终端条件化的消融**（硬终端约束给出最佳重建质量与最低测量残差）

| 方法 | PSNR↑ | SSIM↑ | NMSE↓ | 残差↓ |
|---|---|---|---|---|
| 硬终端约束 | **35.36±2.06** | **0.9460±0.0165** | **0.00352±0.00224** | **0.00128±0.00021** |
| 软终端惩罚 | 33.10±0.78 | 0.9194±0.0072 | 0.00543±0.00174 | 0.00203±0.00022 |
| 无终端约束 | 17.38±0.75 | 0.4188±0.0695 | 0.2033±0.0689 | 0.2008±0.0238 |

**终端时刻 $\tau$ 的作用。** 我们进一步单独扫描 BSDE 终端时刻 $\tau\in\{0.05,0.15,0.35,0.45,0.50\}$，以隔离反演时域的影响。终端时刻控制恢复先验状态锚定的噪声水平：较小的 $\tau$ 使反演更靠近数据端，可改善重建保真度；较大的 $\tau$ 需要从更含噪的潜状态做更强修正，可能使终端恢复更不稳定。经验上，$\tau=0.05$ 取得最高平均 PSNR（$35.52\pm2.20$），但也需要更强的终端修正；相反，$\tau=0.15$ 取得几乎相同的 PSNR（$35.21\pm1.84$）且稳定性更好，在实验中提供最佳质量—稳定性折中。当 $\tau$ 变大时性能显著下降：PSNR 在 $\tau=0.35$ 降到 $31.34\pm1.69$，在 $\tau=0.45$ 进一步降到 $23.48\pm3.29$。这些结果表明终端条件化 BSDE 反演受益于在中等扩散噪声水平处锚定。

## 6 结论

我们提出了通过关联 BSDE 对基于分数 SDE 先验进行终端条件化反演。可行性通过终端规范施加，而预训练分数先验保持无条件且冻结。在标准正则性条件下，所得 BSDE 良定，并定义了从终端要求到先验锚点的唯一适应逆映射。我们还发展了神经 BSDE 求解器，使该构造对复杂分数先验在数值上可行，且无需条件重训。玩具实验验证了稳定反演与分布一致采样；作为案例研究，SVCT 重建显示保真度改善同时保持测量一致性。未来工作将聚焦更快的求解器与更广泛的应用场景。

## 致谢与影响声明

**致谢。** 本研究得到 Ruth S. Holmberg Grant 资助，并部分得到田纳西大学查塔努加分校教务长办公室支持。我们感谢匿名审稿人的建设性意见。

**影响声明。** 本文呈现的工作旨在推进机器学习领域。我们的工作存在许多潜在社会后果，我们认为其中没有必须在此特别强调的内容。

## 附录 A：记号

我们汇总全文使用的主要记号：概率空间 $(\Omega,\mathcal F,(\mathcal F_t)_{t\in[0,T]},\mathbb P)$ 与 $d$ 维布朗运动 $(W_t)_{t\in[0,T]}$；数据空间 $\mathcal X\subseteq\mathbb R^d$ 与数据分布 $p_{\mathrm{data}}$、时间 $t$ 的边缘密度 $p_t$；时间 $t$ 的分数场 $\nabla_x\log p_t(x)$ 及其神经网络近似 $s_\theta(x,t)$；扩散时域 $T$ 与前向 Score-SDE 先验 $dX_t=f(X_t,t)dt+g(t)dW_t$、$X_0\sim p_{\mathrm{data}}$（必要时 $\bar W_t$ 表示反向采样动力学所用布朗运动）；已知前向算子 $A$、测量 $y$ 与测量可行集 $\mathcal S(y)$（或 $\varepsilon$-可行集）；终端规范算子 $\Psi$ 与 BSDE 终端随机变量 $\xi:=\Psi(y)$；反演时域（噪声水平）$\tau\in(0,T]$ 与关联 BSDE 的适应对 $(Y_t,Z_t)_{t\in[0,\tau]}$，恢复的先验状态为 $Y_0$；函数空间 $\mathcal S^2([0,\tau];\mathbb R^d)$ 与 $\mathcal H^2([0,\tau];\mathbb R^{d\times d})$、$\xi\in L^2(\Omega;\mathbb R^d)$ 以及 $f_\theta$ 关于 $(y,z)$ 的 Lipschitz 常数 $L_y,L_z$；离散噪声调度 $\{\sigma_k\}_{k=0}^K$、增量 $\Delta\sigma_k^2:=\sigma_{k+1}^2-\sigma_k^2$ 与标准高斯创新 $\epsilon_k\sim\mathcal N(0,\mathbf I)$。

## 附录 B：证明

### B.1 记号与函数空间

设 $(\Omega,\mathcal F,(\mathcal F_t)_{t\in[0,T]},\mathbb P)$ 支撑 $d$ 维布朗运动，使用标准空间（如 Pardoux–Peng 证明策略）：

$$
\mathcal H^2:=\left\{Z:\Omega\times[0,T]\to\mathbb R^{d\times d}\ \text{循序可测}:\mathbb E\int_0^T\|Z_t\|^2dt<\infty\right\},
$$

$$
\mathcal S^2:=\left\{Y:\Omega\times[0,T]\to\mathbb R^d\ \text{适应、连续}:\mathbb E\left[\sup_{t\in[0,T]}\|Y_t\|^2\right]<\infty\right\}
$$

（使用欧氏范数 $\|\cdot\|$ 与相应内积 $\langle\cdot,\cdot\rangle$）。考虑 BSDE

$$
Y_t=\xi+\int_t^T\hat f\left(s_\theta(Y_s,s),Z_s,s\right)ds-\int_t^TZ_s\,dW_s,\quad t\in[0,T]. \tag{23}
$$

为方便起见定义有效驱动项 $G(t,y,z):=\hat f(t,s_\theta(y,t),z)$，其中 $s_\theta(\cdot,t):\mathbb R^d\to\mathbb R^m$、$\hat f(t,\cdot,\cdot):\mathbb R^m\times\mathbb R^{d\times d}\to\mathbb R^d$。于是 (23) 可改写为 $Y_t=\xi+\int_t^TG(s,Y_s,Z_s)ds-\int_t^TZ_sdW_s$。

### B.2 步骤 A：驱动项 $G$ 的性质（由假设 3.2）

**引理 B.1（$G$ 关于 $(y,z)$ 的 Lipschitz 性）。** 在假设 3.2 下，对所有 $t\in[0,T]$ 与所有 $(y,z),(y',z')$，有 $\|G(t,y,z)-G(t,y',z')\|\le L_y\|y-y'\|+L_z\|z-z'\|$。这正是假设 3.2。

**引理 B.2（原点处的平方可积性）。** 在假设 3.2 下，$\mathbb E\int_0^T\|G(t,0,0)\|^2dt<\infty$。这正是假设 3.2 中的可积性条件。

因此，在定理 3.3 与命题 3.2 的假设下，$G$ 关于 $(y,z)$ 一致 Lipschitz（引理 B.1），并满足标准的原点平方可积条件（引理 B.2）。

### B.3 步骤 B：经鞅表示的线性 BSDE 可解性

**引理 B.3（线性 BSDE（构造））。** 设 $\xi\in L^2(\Omega;\mathbb R^d)$、$g\in L^2(\Omega\times[0,T];\mathbb R^d)$ 循序可测，则存在唯一对 $(Y,Z)\in\mathcal S^2\times\mathcal H^2$ 使

$$
Y_t=\xi+\int_t^Tg(s)ds-\int_t^TZ_s\,dW_s,\quad t\in[0,T]. \tag{24}
$$

**证明。** 定义 $U:=\xi+\int_0^Tg(s)ds\in L^2(\Omega;\mathbb R^d)$，令 $M_t:=\mathbb E[U\mid\mathcal F_t]$，则 $(M_t)$ 为平方可积鞅。由鞅表示定理，存在唯一 $Z\in\mathcal H^2$ 使 $M_t=M_0+\int_0^tZ_sdW_s$。令 $Y_t:=M_t-\int_0^tg(s)ds$，整理即得 (24)。唯一性：把两个解相减，其差满足 $\xi=0$、$g\equiv0$，其鞅表示迫使 $Z\equiv0$，从而 $Y\equiv0$。■

### B.4 步骤 C：非线性 BSDE 的唯一性（Itô 能量估计）

**命题 B.4（$\mathcal S^2\times\mathcal H^2$ 中的唯一性）。** 设 $\xi\in L^2$ 且 $G$ 满足引理 B.1 的一致 Lipschitz 条件，则 (23) 在 $\mathcal S^2\times\mathcal H^2$ 中至多有一个解。

**证明。** 设 $(Y,Z)$ 与 $(\tilde Y,\tilde Z)$ 为两个解，令 $\Delta Y:=Y-\tilde Y$、$\Delta Z:=Z-\tilde Z$、$\Delta G(t):=G(t,Y_t,Z_t)-G(t,\tilde Y_t,\tilde Z_t)$，则 $\Delta Y_t=\int_t^T\Delta G(s)ds-\int_t^T\Delta Z_sdW_s$。对 $\|\Delta Y_t\|^2$ 在 $[t,T]$ 上应用 Itô 公式：

$$
\|\Delta Y_t\|^2+\int_t^T\|\Delta Z_s\|^2ds=2\int_t^T\left\langle\Delta Y_s,\Delta G(s)\right\rangle ds-2\int_t^T\left\langle\Delta Y_s,\Delta Z_s\,dW_s\right\rangle.
$$

取期望，随机积分期望为零，得 $\mathbb E\|\Delta Y_t\|^2+\mathbb E\int_t^T\|\Delta Z_s\|^2ds=2\mathbb E\int_t^T\langle\Delta Y_s,\Delta G(s)\rangle ds$。由 Cauchy–Schwarz 与 Young 不等式（取 $\varepsilon=1$，$2\langle a,b\rangle\le\|a\|^2+\|b\|^2$）以及 Lipschitz 性 $\|\Delta G(s)\|\le L_G(\|\Delta Y_s\|+\|\Delta Z_s\|)$，得 $\|\Delta G(s)\|^2\le2L_G^2(\|\Delta Y_s\|^2+\|\Delta Z_s\|^2)$。因此

$$
\mathbb E\|\Delta Y_t\|^2\le\left(1+2L_G^2\right)\int_t^T\mathbb E\|\Delta Y_s\|^2ds,
$$

（丢掉了左侧非负的 $\mathbb E\int_t^T\|\Delta Z_s\|^2ds$ 项）。由 Grönwall 不等式，对所有 $t$ 有 $\mathbb E\|\Delta Y_t\|^2=0$，故 $\Delta Y\equiv0$ a.s.。回代得 $\mathbb E\int_0^T\|\Delta Z_s\|^2ds=0$，故 $\Delta Z\equiv0$。■

### B.5 步骤 D：经 Picard 迭代的存在性（Pardoux–Peng 证明路线）

**定理 B.5（存在唯一性，定理 3.3 的详细证明）。** 假设：(i) $\xi\in L^2(\Omega;\mathbb R^d)$；(ii) $\mathbb E\int_0^T\|G(t,0,0)\|^2dt<\infty$（如引理 B.2）；(iii) $G$ 关于 $(y,z)$ 一致 Lipschitz（引理 B.1）。则 (23) 存在唯一适应解 $(Y,Z)\in\mathcal S^2\times\mathcal H^2$。

**证明。**（1）Picard 格式（线性化）。初始化 $(Y^0,Z^0)\equiv(0,0)$。给定 $(Y^n,Z^n)$，定义循序可测过程 $g^{n+1}(t):=G(t,Y_t^n,Z_t^n)$。我们断言 $g^{n+1}\in L^2(\Omega\times[0,T])$：由 Lipschitz 性 $\|G(t,y,z)\|\le\|G(t,0,0)\|+L_G(\|y\|+\|z\|)$，因此由 $(a+b+c)^2\le3(a^2+b^2+c^2)$ 得 $\|g^{n+1}(t)\|^2\le3\|G(t,0,0)\|^2+3L_G^2\|Y_t^n\|^2+3L_G^2\|Z_t^n\|^2$；积分取期望后有限，因为 $\mathbb E\int_0^T\|G(t,0,0)\|^2dt<\infty$，且归纳假设 $(Y^n,Z^n)\in\mathcal S^2\times\mathcal H^2$ 蕴含 $\mathbb E\int_0^T\|Y_t^n\|^2dt\le T\mathbb E\sup_t\|Y_t^n\|^2<\infty$ 与 $\mathbb E\int_0^T\|Z_t^n\|^2dt<\infty$。故由引理 B.3，存在唯一 $(Y^{n+1},Z^{n+1})\in\mathcal S^2\times\mathcal H^2$ 求解线性 BSDE

$$
Y_t^{n+1}=\xi+\int_t^Tg^{n+1}(s)ds-\int_t^TZ_s^{n+1}dW_s. \tag{25}
$$

（2）指数加权范数下的压缩估计。令 $\Delta Y^{n+1}:=Y^{n+1}-Y^n$、$\Delta Z^{n+1}:=Z^{n+1}-Z^n$，把 (25) 在水平 $n+1$ 与 $n$ 相减得 $\Delta Y_t^{n+1}=\int_t^T\Delta g^{n+1}(s)ds-\int_t^T\Delta Z_s^{n+1}dW_s$，其中 $\Delta g^{n+1}(t):=g^{n+1}(t)-g^n(t)$。固定 $\beta>0$，对 $e^{\beta t}\|\Delta Y_t^{n+1}\|^2$ 应用 Itô 公式：

$$
e^{\beta t}\mathbb E\left\|\Delta Y_t^{n+1}\right\|^2+\mathbb E\int_t^Te^{\beta s}\left(\beta\left\|\Delta Y_s^{n+1}\right\|^2+\left\|\Delta Z_s^{n+1}\right\|^2\right)ds=2\mathbb E\int_t^Te^{\beta s}\left\langle\Delta Y_s^{n+1},\Delta g^{n+1}(s)\right\rangle ds,
$$

（取期望后随机积分项消失）。用 Young 不等式 $2\langle a,b\rangle\le\frac{\beta}{2}\|a\|^2+\frac{2}{\beta}\|b\|^2$ 得

$$
\mathbb E\int_t^Te^{\beta s}\left(\frac{\beta}{2}\left\|\Delta Y_s^{n+1}\right\|^2+\left\|\Delta Z_s^{n+1}\right\|^2\right)ds\le\frac{2}{\beta}\mathbb E\int_t^Te^{\beta s}\left\|\Delta g^{n+1}(s)\right\|^2ds.
$$

由 $G$ 的 Lipschitz 性，$\|\Delta g^{n+1}(s)\|\le L_G(\|\Delta Y_s^n\|+\|\Delta Z_s^n\|)$，故 $\|\Delta g^{n+1}(s)\|^2\le2L_G^2(\|\Delta Y_s^n\|^2+\|\Delta Z_s^n\|^2)$。定义加权能量范数 $\|(U,V)\|_{\beta,t}^2:=\mathbb E\int_t^Te^{\beta s}(\|U_s\|^2+\|V_s\|^2)ds$，上述不等式给出

$$
\left\|\left(\Delta Y^{n+1},\Delta Z^{n+1}\right)\right\|_{\beta,t}^2\le\frac{4L_G^2}{\beta}\left\|\left(\Delta Y^n,\Delta Z^n\right)\right\|_{\beta,t}^2.
$$

取 $\beta>4L_G^2$ 并令 $q:=\frac{4L_G^2}{\beta}\in(0,1)$，则 $\|(\Delta Y^{n+1},\Delta Z^{n+1})\|_{\beta,0}^2\le q\|(\Delta Y^n,\Delta Z^n)\|_{\beta,0}^2$，故 $(Y^n,Z^n)$ 在 $\|\cdot\|_{\beta,0}$ 下为 Cauchy 列，并在该范数下收敛到某 $(Y,Z)$。

（3）取极限与验证。由于 $G$ Lipschitz 且 $(Y^n,Z^n)\to(Y,Z)$（加权 $L^2$ 意义），有 $G(\cdot,Y^n,Z^n)\to G(\cdot,Y,Z)$ 于 $L^2(\Omega\times[0,T])$。在 (25) 中令 $n\to\infty$，即得 $(Y,Z)$ 满足 (23)。

（4）$\mathcal S^2\times\mathcal H^2$ 归属。由 (23) 与 $\xi$、$G(\cdot,0,0)$ 的平方可积性，标准 Itô/BDG 先验估计给出 $\mathbb E\sup_{t\in[0,T]}\|Y_t\|^2+\mathbb E\int_0^T\|Z_t\|^2dt<\infty$，故 $(Y,Z)\in\mathcal S^2\times\mathcal H^2$。于是唯一性由命题 B.4 得到。上述定理 B.5 应用于 $G(t,y,z)=\hat f(t,s_\theta(y,t),z)$ 及命题 3.2 中的驱动/分数条件，即为主文定理 3.3。■

## 附录 C：关键实现

### C.1 扩散的后向随机微分方程

我们考虑示例中使用的情形：前向扩散模型定义为

$$
\underbrace{Y_t}_{\text{BSDE 中的返回值 }Y_t}=\underbrace{\xi}_{\text{目标 }X_i}+\int_t^T\underbrace{(\sigma_u^2)S_\theta(Y_u,u)}_{\text{驱动项 }f}ds-\int_t^T\underbrace{Z_s}_{\text{BSDE 中的求解网络}}d\underbrace{w_s}_{\text{BSDE 中的 }dw}, \tag{26}
$$

其中 $\hat f=(\sigma_u^2)S_\theta(Y_u,u)$。上述 BSDE 扩散的 Python 实现给出驱动函数 `f(t, y, z, score_model, config)`（按时间调度计算加权分数并返回负均值漂移）、目标函数 `Xi(target)`（返回 $Y_T=\xi$）与积分函数 `BSDE(batch_size, N)`（在 $N$ 步离散上把 BSDE 从 $t$ 积分到 $T$）。代码片段中 `f` 对应式 (7) 所述驱动函数，`Xi(target)` 表示目标 $Y_T=\xi$，`BSDE(batch_size, N)` 完成积分；随后可用正文所述数值求解器求解该 BSDE。

## 附录 D：算法

一旦求解后向 BSDE 得到初始状态 $Y_0$ 与适应控制过程 $(Z_t)_{t\in[0,T]}$（或其估计），我们通过扰动 $Y_0$（$Y_0$-邻域采样）构造受控前向采样器。

**前向时间形式。** 由 (7)，相应前向时间随机动力学为

$$
dY_t=-\hat f\left(s_\theta(Y_t,t),Z_t,t\right)dt+Z_t\,dW_t,\quad Y_0\ \text{给定}. \tag{27}
$$

以下所有前向采样器都是 (27) 的 Euler–Maruyama 离散。实践中我们用（由 BSDE 求解器训练得到的）学习估计器 $\Phi$ 近似控制量，例如 $Z_{t_i}\approx\Phi(t_i,W_{t_i};\beta)\in\mathbb R^{d\times d}$。

**算法 2　经 $Y_0$-邻域采样的条件生成（前向 Euler–Maruyama）**

- **输入：** 初始状态 $Y_0$、$Z$ 估计器 $\Phi(\cdot;\beta)$、步数 $N$、分数 $s_\theta$、驱动项 $\hat f$、尺度 $\lambda$
- **输出：** 终端样本 $\tilde Y_T$
- $\Delta t\leftarrow T/N$；$\epsilon_0\sim\mathcal N(0,\mathbf I_d)$；$y\leftarrow Y_0+\lambda\epsilon_0$；$W\leftarrow0$
- **for** $i=0$ **to** $N-1$ **do**
- 　$t_i\leftarrow i\Delta t$；$\epsilon_i\sim\mathcal N(0,\mathbf I_d)$；$\Delta W_i\leftarrow\sqrt{\Delta t}\,\epsilon_i$；$W\leftarrow W+\Delta W_i$
- 　$Z_i\leftarrow\Phi(t_i,W;\beta)$（$Z_i\approx Z_{t_i}\in\mathbb R^{d\times d}$）
- 　$b_i\leftarrow-\hat f\left(s_\theta(y,t_i),Z_i,t_i\right)$（(27) 的漂移）
- 　$y\leftarrow y+b_i\Delta t+Z_i\Delta W_i$
- **end for**
- **return** $y$

给定终端数据 $\xi$ 并由后向 BSDE 求解得到参考初始状态 $Y_0$ 后，我们通过采样扰动初值 $\tilde Y_0=Y_0+\lambda\epsilon$ 生成多样性，再按 (27) 前向传播每个 $\tilde Y_0$；参数 $\lambda\ge0$ 控制 $Y_0$ 周围的探索半径。

**算法 3　终端样本的 Monte Carlo 不确定性量化**

- **输入：** 采样器 $\mathcal A$（算法 2）、运行次数 $K$
- **输出：** 样本均值 $\bar y$、样本协方差 $d\mathrm{Cov}$
- **for** $k=1$ **to** $K$ **do**
- 　$y^{(k)}\leftarrow\mathcal A()$（独立随机种子／布朗路径）
- **end for**
- $\bar y\leftarrow\frac{1}{K}\sum_{k=1}^Ky^{(k)}$；$d\mathrm{Cov}\leftarrow\frac{1}{K-1}\sum_{k=1}^K(y^{(k)}-\bar y)(y^{(k)}-\bar y)^\top$
- **return** $\bar y,d\mathrm{Cov}$

为量化条件生成中的不确定性，我们重复运行所选前向采样器（如算法 2，使用独立随机性——布朗增量与/或 $Y_0$ 扰动）获得终端样本的经验分布，并报告样本均值与协方差。

## 附录 E：附加定性评估

### E.1 SVCT 重建

**附加定性比较。** 图 5 报告跨不同解剖切片的更多 SVCT 重建示例，可观察到一致趋势。FBP 表现出严重条纹与噪声放大（尤其在高衰减结构周围），使低对比组织边界模糊。TV 有效抑制噪声，但引入明显过度平滑与精细纹理（如肺实质与软组织界面）损失，并伴随局部对比偏置。TVDIP 相对 TV 进一步减少条纹伪影，但仍倾向于模糊解剖边缘、削弱细微结构，显示在伪影去除与细节保持之间存在折中。

在扩散基线中，SiTCoM、PnPDM、DPS 与 DDS 进一步展示了逐步条件化下的不同行为：SiTCoM 可恢复比 TV/TVDIP 更锐利的局部结构，但强度在不同病例间不够稳定，且仍有明显条纹残余与显示窗敏感性；PnPDM 视觉上更平滑、条纹更少，但常抑制高频纹理与弱边缘，呈现过正则外观与结构对比衰减；DPS 在此设置下对测量—引导平衡更敏感，倾向产生颗粒状、不稳定的纹理（尤其软组织区域），表明仅靠后验采样引导不能完全防止偏向视觉上合理但校准不佳的样本；DDS 明显强于其他扩散基线，恢复更锐利的解剖边界且总体失败更少。但我们强调该结果使用了已发布的 CT 预训练先验，故不完全对应本文研究的通用先验设置；因此在本比较中 DDS 应主要被解读为强参照点而非同口径基线。

相反，我们的方法采用与逐步 PnP 式设计根本不同的终端条件化表述：不在随机路径上反复注入启发式引导，而是在反向过程端点施加硬终端可行性算子。这使任意预训练生成先验可以模块化方式组合：先验指定基础随机动力学，任务信息被隔离到强制测量一致解码与投影的终端规范中。结果，最终重建通过终端约束显式地与测量模型绑定，使解对先验的绝对强度、或对与测量目标不完全匹配的先验预训练域不那么脆弱。当测量算子准确、终端投影良定义时，端点可行性由构造在数值容差内得到保证；而 PnPDM、DPS、SiTCoM 不提供显式终端保证，在先验与测量目标不一致时可能漂向先验偏好样本。定性上，BSDE 在切片间最稳定：抑制条纹、保留细微纹理与软组织过渡，避免逐步扩散基线中的对比漂移或颗粒伪影。与 DDS 相比，BSDE 在某些区域略更平滑，但在同一测量模型下呈现更校准的全局外观，这与我们在通用先验设置下施加终端可行性、而非依赖紧密匹配的 CT 域先验的目标一致。值得注意的是，BSDE 在保持肺部纹理与锐利软组织过渡的同时没有引入 TV/TVDIP 中的过度平滑。

### E.2 关于 DDS 与先验匹配的进一步讨论

表 2 表明，在预期的通用先验设置下，BSDE 提供最强的总体定量性能。在我们评估设置下不依赖已发布 CT 域预训练先验的基线中，BSDE 在所有报告的图像质量与误差指标上都优于 PnPDM、DPS 与 SiTCoM。这是与我们问题定义一致的主要定量比较：在冻结通用先验下施加终端可行性，而非假设先验已与 CT 测量域紧密匹配。

我们仅把 DDS 作为附加参照包含进来，原因是 DDS 使用已发布的 CT 预训练先验，因而并不对应本文研究的同一通用先验设置。因此我们不把主要定量主张建立在 DDS 上，并把关于该公平性不匹配的更详细讨论推迟到附录。

即便在这种非同口径比较下，结果仍值得仔细解读：DDS 取得略高的 PSNR/NPSNR（31.10/30.93 对 30.99/30.85），但 BSDE 在 MAE（3.57 对 4.38）、SSIM（0.868 对 0.806）、NSSIM（0.869 对 0.811）、NMSE（0.0101 对 0.0118）与 NCC（0.989 对 0.988）上仍更好。因此我们不把 DDS 解读为推翻主要结果；它表明域匹配的 CT 先验可能略有利于逐像素失真指标，而 BSDE 在预期的通用先验情形下仍保持更强结构一致性与更低总体误差。故主要结论不变：BSDE 在本文真正关注的设置中最具竞争力——即冻结先验可能不完美或不匹配时的重建，其正确性由终端约束施加，而非从领域特定 CT 先验继承。

### E.3 星体光变曲线反演与条件生成中的 BSDE

图 6 给出所提方法与其他生成方法的视觉比较。我们使用星体光变曲线数据集（Rebbapragada et al., 2008），其中包含三类星体光变曲线的时间序列数据：Cepheid、Eclipsing Binary 与 RR Lyrae，每类星体呈现独特的周期光变，对天文探索有重要意义。图 6 展示各种方法在三类上对单个样本的无监督条件生成结果。

在星体光变曲线的无监督条件生成中，所提 BSDE 扩散模型相较 GAN 反演（Xia et al., 2022）、LSTMVAE（Lin et al., 2020）与基于 SDE 的扩散（Meng et al., 2022）方法表现出显著性能优越性。图 6 给出所提 BSDE 扩散、GAN 反演、SDE 扩散扰动、LSTMVAE 模型以及目标类样本的成行结果以便比较。从视觉检查可见，BSDE 扩散模型对三类星体（Cepheid、Eclipsing Binary、RR Lyrae）持续优于对照方法，表明其更精确地反映真实星体光变曲线分布。可视化展示了 BSDE 扩散模型在捕获与复现这些天体时间序列固有复杂时间动力学方面的有效性，从而使其成为推进时间序列生成任务的有前景工具。

### E.4 扩散反演与条件生成中的 BSDE

图 8 展示以各类目标均值图像 $Y_T$ 为终端条件、使用 BSDE 扩散模型取得期望目标潜表示 $Y_0$ 的扩散反演结果。一旦获得该潜噪声编码，即可用所提 $Y_0$-邻域采样算法进行条件生成；图中展示了不同数量下的生成多样性。在缺少两种变换时，单次样本生成的不确定性仍可用算法 3 所述 MC 方法量化；图 7 展示了单次样本生成相关的不确定性。

## 附录 F：附加实验与实现细节

### F.1 SVCT 前向模型与精确实验设置

为使 CT 设置完全明确，我们描述 SVCT 实验所用退化模型。任务是含轻度噪声的稀疏视角 CT，而非严格 Poisson 光子意义下的稀疏视角 CT。我们采用平行束 Radon 几何，在 $180^\circ$（即非冗余角度范围 $[0,\pi]$）上取 30 个均匀间隔投影视角。令 $x_0\in\mathcal X$ 为目标图像、$A:\mathcal X\to\mathcal Y$ 为前向投影算子，测量生成为

$$
y_0=A(x_0)+\eta, \tag{28}
$$

其中 $\eta$ 为加在正弦图上的、方差 $10^{-5}$ 的加性高斯噪声。因此在本实验中主要困难来自严重的角度欠采样，而测量噪声相对较轻。

**预处理说明。** 所有基线与所提方法都在相同前向算子 $A$、相同 30 视角几何与相同高斯噪声水平下评估；我们还确保导出与评估期间图像范围处理一致。

### F.2 终端规范的 CT 特定实现

在玩具设置中终端目标 $\xi$ 被显式给定；但在 CT 重建中终端规范通常不能作为闭式潜锚点获得，而是通过前向模型下的测量可行性隐式定义。对测量 $y_0$，定义可行图像集

$$
\mathcal S_\varepsilon(y_0)=\left\{x\in\mathcal X:\left\|A(x)-y_0\right\|\le\varepsilon\|y_0\|\right\}. \tag{29}
$$

因此终端规范算子 $\Psi$ 应被解释为**终端一致性算子**：它编码"解码后的终端潜状态对应 $\mathcal S_\varepsilon(y_0)$ 中图像"的要求；等价地，在 CT 情形中 $\Psi(y_0)$ 通过最小化终端域测量差异数值实现：

$$
\mathcal L_{\mathrm{meas}}=\mathbb E\left[\left\|A(\hat x)-y_0\right\|^2\right], \tag{30}
$$

其中期望取在离散分数定义递推中的创新变量上。这意味着 CT 流水线并非"终端锚点被移除"的例子。

**终端条件的 CT 特定隐式实现。** 为完整起见，汇总用于实现隐式终端规范的 CT 流水线：（1）给定测量 $y_0$，初始化恢复含噪先验状态与表示过程的 BSDE 参数 $(\alpha,\beta)$；（2）在 $[0,\tau]$ 上求解 BSDE 得到噪声水平 $\tau$ 处推断的潜状态；（3）从噪声水平 $\tau$ 到数据端运行冻结去噪递推；（4）解码所得数据端潜状态得 $\hat x=D(\hat z_0)$；（5）评估终端域测量损失 $\mathcal L_{\mathrm{meas}}=\mathbb E[\|A(\hat x)-y_0\|^2]$；（6）通过离散 BSDE 求解器与去噪递推做梯度下降更新 $(\alpha,\beta)$；（7）重复至收敛并输出最终重建 $\hat x$。

### F.3 显式终端与隐式终端区域

本文包含两种实践上不同的终端条件化区域。**显式终端区域：** 在玩具实验中终端目标 $\xi$ 显式给定，BSDE 由直接终端匹配训练，终端值表述以最直接形式出现。**隐式终端区域：** 在 CT 等真实逆问题中，闭式潜目标通常不可得；终端条件在概念上仍存在，但通过前向模型定义的可行性而非显式潜锚点指定。这正是引入式 (22) 的原因：它在终端域数值实现同一终端要求。在此意义上，CT 流水线仍是终端条件化的，但终端规范是隐式的。该区分很重要，因为它澄清了 CT 实现为何不应被解读为放弃 BSDE 表述：优化仍在终端条件化构造所诱导的 BSDE 参数族内进行，而非无约束潜拟合。

### F.4 基线实现细节

为使比较可复现，我们汇总基线实现与实验主要超参数。我们从各方法已发布实现出发，仅把任务特定的 CT 几何与测量设置适配到 30 视角 SVCT、高斯噪声方差 $10^{-5}$ 的设置。

### F.5 关于先验匹配以及我们为何不要求 CT 特定先验的进一步讨论

在逆问题论文中，使用在紧密匹配的域内数据上预训练的先验很常见。但这不是本文研究的设置：我们的目标处理更现实的情形——先验可能与目标测量域不完美或不匹配。实践中，不匹配可能源于扫描仪差异、协议变化、预处理流水线、站点特定变化，或训练先验所用源数据与测试时测量之间的域偏移。

这正是我们的 BSDE 表述所要处理的问题。我们不希望正确性依赖先验已与测量分布良好对齐；相反，前向模型定义终端要求，BSDE 约束最终重建即使在先验不完美或不匹配时也与观测测量保持一致。在此意义上，主要区别并不只是某方法是否使用任务特定先验（例如 SiTCoM 也不要求任务特定重训练先验）；更重要的区别在于**如何施加测量一致性**：我们的方法以终端可行性作为主要约束，而不是依赖先验已经正确。

### F.6 如何选择分数诱导驱动项

一个剩下的实际问题是：一旦固定先验族，如何选择 BSDE 驱动项 $\hat f$。一般关联 BSDE 使用通用驱动记号以允许依赖前向先验过程；在本文所用分数诱导实例中，有效驱动项选为预训练分数场与 BSDE 状态的耦合：

$$
f_\theta(t,x,y,z)=\hat f\left(t,s_\theta(y,t),z\right). \tag{31}
$$

因此对先验族的依赖通过所选分数模型 $\theta$ 及其噪声调度进入。对式 (17) 所用的玩具 VE 式构造，驱动项特化为

$$
\hat f\left(s_\theta(Y_t,t),Z_t\right)=-\sigma_t^2s_\theta(Y_t,t)+\alpha Z_t. \tag{32}
$$

取 $\alpha=0$ 隔离终端条件化的效应，得到

$$
dY_t=-\sigma_t^2s_\theta(Y_t,t)dt+Z_t\,dW_t. \tag{33}
$$

因此式 (17) 并非任意选择：它是与所选 VE 式先验及所选终端条件化机制相关联的分数诱导特化。

### F.7 实际限制与计算代价

我们的方法继承了神经 BSDE 求解器与基于分数的逆求解器更广泛的实际限制。在当前实现中，一次代表性 CT 重建运行约需 41.3 s 推理时间，另加 2.8 s 模型加载；优化阶段主导运行时间（40.9 s）。峰值 GPU 显存占用约 886 MB（已分配）、898 MB（已保留）。

第 3 节的理论保证在所述假设下适用于精确的适应 BSDE 解；实践中方法使用时间离散化与表示过程的神经近似。初步离散化研究表明，方法在若干求解器选择下保持合理稳定，对 $k_{\mathrm{sde}}\in\{1,8,16,32\}$ 相对测量残差约为 0.0015–0.0017。不过，近似误差与离散化误差仍是理论与实现之间实际差距的一部分。

## 图注与表注

**图 1：** 反向时间 SDE 与关联 BSDE 的对比。左：反向时间采样是初值表述，从选定噪声律演化，不编码固定终端规范；右：BSDE 由终端条件提出，反向求解强制终端要求的适应表示过程。

**图 2：** 恢复先验状态的后向反演与前向使用。上：求解带终端规范的关联 BSDE 得到恢复先验状态 $Y_0$；下：通过相应 Score-SDE 生成可行输出。

**图 3：** SVCT 肺部筛查的定性比较。从左到右：物理测量、高分辨率参考、稀疏视角重建（FBP）、TV、DIP-TV、DPS、DDS*、SiTCom、PnPDM 与所提 BSDE。高亮区域强调肺实质与对早期癌症筛查关键的细小结构细节；所提方法更好地保留细微肺纹理与低对比结构，同时抑制噪声并保持与测量模型一致。更多示例见附录 E.1。

**图 4：** 用 BSDE 机制进行终端条件化反演与邻域采样（含 $Y_0$ 反演、$Y_T$ 目标、不确定性量化均值 $\mu_{\hat Y_T}$ 与方差 $\sigma_{\hat Y_T}$、终端受控采样）；更多见附录 E.3。

**图 5：** 附加定性结果（SVCT 更多切片；见附录 E.1）。

**图 6：** 光变曲线（时间序列数据）的条件生成（所提模型、基线、真值三类星体各成行；见附录 E.3）。

**图 7：** MNIST 数据集上一次样本的不确定性量化示例（见附录 E.4）。

**图 8：** 在 MNIST 数据集（二维数据）上用基于 BSDE 的扩散进行条件生成：扩散反演得到潜表示 $Y_0$ 与 $Y_T$，并展示不同数量下的生成多样性与单样本不确定性（见附录 E.4）。

**表 1：** 物理约束生成框架比较（变分/TV、GAN 反演、扩散后验采样、投影在环/PnP、流形约束扩散、扩散与 Schrödinger 桥、本文 BSDE–扩散；逐格见正文表 1）。

**表 2：** SVCT 重建质量与方法属性（逐格见正文表 2；含 DDS 脚注）。

**表 3：** 星体光变曲线的无监督条件生成（JS 散度与平均余弦相似度，四方法 × 三类；逐格见正文表 3）。

**表 4：** $128\times128$ CT 重建上终端条件化的消融（硬终端约束/软终端惩罚/无终端约束的 PSNR、SSIM、NMSE、残差；逐格见正文表 4）。

> **原文说明：** 原文在表 2 处有脚注 1：DDS（Chung & Ye, 2024）在此测试中使用 CT 预训练先验，故仅作为附加基线，而非主要公平比较对象。原文正文页码 1–9，参考文献 9–12，附录 A–F 12–23。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 9–12 页转录；未逐条核对 DOI 与页码）。

[1] Achituve, I., Habi, H. V., Rosenfeld, A., Netzer, A., Diamant, I., and Fetaya, E. Inverse problem sampling in latent space using sequential Monte Carlo. In Singh, A., Fazel, M., Hsu, D., Lacoste-Julien, S., Berkenkamp, F., Maharaj, T., Wagstaff, K., and Zhu, J. (eds.), Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pp. 420–443. PMLR, 13–19 Jul 2025. URL https://proceedings.mlr.press/v267/achituve25a.html.

[2] Alkhouri, I., Liang, S., Huang, C.-H., Dai, J., Qu, Q., Ravishankar, S., and Wang, R. SITCOM: Step-wise triple-consistent diffusion sampling for inverse problems. In Singh, A., Fazel, M., Hsu, D., Lacoste-Julien, S., Berkenkamp, F., Maharaj, T., Wagstaff, K., and Zhu, J. (eds.), Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pp. 1128–1158. PMLR, 13–19 Jul 2025. URL https://proceedings.mlr.press/v267/alkhouri25b.html.

[3] Anderson, B. D. O. Reverse-time diffusion equation models. Stochastic Processes and their Applications, 12(3):313–326, 1982. doi: 10.1016/0304-4149(82)90051-5.

[4] Bismut, J.-M. Conjugate convex functions in optimal stochastic control. Journal of Mathematical Analysis and Applications, 44(2):384–404, 1973. ISSN 0022-247X. doi: https://doi.org/10.1016/0022-247X(73)90066-8. URL https://www.sciencedirect.com/science/article/pii/0022247X73900668.

[5] Bora, A., Jalal, A., Price, E., and Dimakis, A. G. Compressed sensing using generative models. In Precup, D. and Teh, Y. W. (eds.), Proceedings of the 34th International Conference on Machine Learning, volume 70 of Proceedings of Machine Learning Research, pp. 537–546. PMLR, 06–11 Aug 2017. URL https://proceedings.mlr.press/v70/bora17a.html.

[6] Chan, K. C. K., Xu, X., Wang, X., Gu, J., and Loy, C. C. Glean: Generative latent bank for image super-resolution and beyond, 2022. URL https://arxiv.org/abs/2207.14812.

[7] Chen, R. T. Q. and Lipman, Y. Flow matching on general geometries, 2024. URL https://arxiv.org/abs/2302.03660.

[8] Chen, W., Shao, Y., Wang, Y., Zhang, Q., Liu, Y., Yao, L., Chen, Y., Yang, G., and Gui, Z. A novel total variation model for low-dose ct image denoising. IEEE Access, 6:78892–78903, 2018. doi: 10.1109/ACCESS.2018.2885514.

[9] Chessari, J., Kawai, R., Shinozaki, Y., and Yamada, T. Numerical methods for backward stochastic differential equations: A survey. Probability Surveys, 20(none), jan 2023. doi: 10.1214/23-ps18. URL https://doi.org/10.1214%2F23-ps18.

[10] Chung, H. and Ye, J. C. Deep diffusion image prior for efficient ood adaptation in 3d inverse problems, 2024. URL https://arxiv.org/abs/2407.10641.

[11] Chung, H., Sim, B., Ryu, D., and Ye, J. C. Improving diffusion models for inverse problems using manifold constraints. In Advances in Neural Information Processing Systems, 2022. doi: 10.48550/arXiv.2206.00941. URL https://arxiv.org/abs/2206.00941.

[12] Chung, H., Kim, J., Mccann, M. T., Klasky, M. L., and Ye, J. C. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023. URL https://openreview.net/forum?id=OnD9zGAGT0k.

[13] De Bortoli, V., Thornton, J., Heng, J., and Doucet, A. Diffusion schrödinger bridge with applications to score-based generative modeling. In Advances in Neural Information Processing Systems, 2021. doi: 10.48550/arXiv.2106.01357. URL https://arxiv.org/abs/2106.01357.

[14] E, W., Han, J., and Jentzen, A. Deep learning-based numerical methods for high-dimensional parabolic partial differential equations and backward stochastic differential equations. Communications in Mathematics and Statistics, 5(4):349–380, November 2017. doi: 10.1007/s40304-017-0117-6. URL https://doi.org/10.1007/s40304-017-0117-6.

[15] Ekström Kelvinius, F., Zhao, Z., and Lindsten, F. Solving linear-Gaussian Bayesian inverse problems with decoupled diffusion sequential Monte Carlo. In Singh, A., Fazel, M., Hsu, D., Lacoste-Julien, S., Berkenkamp, F., Maharaj, T., Wagstaff, K., and Zhu, J. (eds.), Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pp. 15148–15181. PMLR, 13–19 Jul 2025. URL https://proceedings.mlr.press/v267/ekstrom-kelvinius25b.html.

[16] El Karoui, N., Peng, S., and Quenez, M. C. Backward stochastic differential equations in finance. Mathematical finance, 7(1):1–71, 1997.

[17] Gobet, E., Lemor, J.-P., and Warin, X. A regression-based Monte Carlo method to solve backward stochastic differential equations. Annals of Applied Probability, 15(3):2172–2202, 2005.

[18] Gushchin, N., Kholkin, S., Burnaev, E., and Korotin, A. Light and optimal schrödinger bridge matching. In Salakhutdinov, R., Kolter, Z., Heller, K., Weller, A., Oliver, N., Scarlett, J., and Berkenkamp, F. (eds.), Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 17100–17122. PMLR, 21–27 Jul 2024. URL https://proceedings.mlr.press/v235/gushchin24a.html.

[19] Gushchin, N., Li, D., Selikhanovych, D., Burnaev, E., Baranchuk, D., and Korotin, A. Inverse bridge matching distillation. In Singh, A., Fazel, M., Hsu, D., Lacoste-Julien, S., Berkenkamp, F., Maharaj, T., Wagstaff, K., and Zhu, J. (eds.), Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pp. 21471–21496. PMLR, 13–19 Jul 2025. URL https://proceedings.mlr.press/v267/gushchin25b.html.

[20] Haussmann, U. G. and Pardoux, É. Time reversal of diffusions. The Annals of Probability, 14(4):1188–1205, 1986.

[21] Heng, J., De Bortoli, V., Doucet, A., and Thornton, J. Simulating diffusion bridges with score matching, 2021. URL https://arxiv.org/abs/2111.07243.

[22] Hirono, Y., Tanaka, A., and Fukushima, K. Understanding diffusion models by feynman's path integral. In Salakhutdinov, R., Kolter, Z., Heller, K., Weller, A., Oliver, N., Scarlett, J., and Berkenkamp, F. (eds.), Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 18324–18351. PMLR, 21–27 Jul 2024. URL https://proceedings.mlr.press/v235/hirono24a.html.

[23] Ho, J., Jain, A., and Abbeel, P. Denoising diffusion probabilistic models. In Larochelle, H., Ranzato, M., Hadsell, R., Balcan, M., and Lin, H. (eds.), Advances in Neural Information Processing Systems, volume 33, pp. 6840–6851. Curran Associates, Inc., 2020. URL https://proceedings.neurips.cc/paper_files/paper/2020/file/4c5bcfec8584af0d967f1ab10179ca4b-Paper.pdf.

[24] Janati, Y., Moufad, B., Qassime, M. A. E., Oliviero Durmus, A., Moulines, E., and Olsson, J. A mixture-based framework for guiding diffusion models. In Singh, A., Fazel, M., Hsu, D., Lacoste-Julien, S., Berkenkamp, F., Maharaj, T., Wagstaff, K., and Zhu, J. (eds.), Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pp. 26830–26876. PMLR, 13–19 Jul 2025. URL https://proceedings.mlr.press/v267/janati25a.html.

[25] Jolicoeur-Martineau, A., Li, K., Piché-Taillefer, R., Kachman, T., and Mitliagkas, I. Gotta go fast when generating data with score-based models, 2021.

[26] Karras, T., Aittala, M., Aila, T., and Laine, S. Elucidating the design space of diffusion-based generative models. In Oh, A. H., Agarwal, A., Belgrave, D., and Cho, K. (eds.), Advances in Neural Information Processing Systems, 2022. URL https://openreview.net/forum?id=k7FuTOWMOc7.

[27] Kawar, B., Elad, M., Ermon, S., and Song, J. Denoising diffusion restoration models, 2022. URL https://arxiv.org/abs/2201.11793.

[28] Ksenofontov, G. and Korotin, A. Categorical schrödinger bridge matching. In Singh, A., Fazel, M., Hsu, D., Lacoste-Julien, S., Berkenkamp, F., Maharaj, T., Wagstaff, K., and Zhu, J. (eds.), Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pp. 31727–31751. PMLR, 13–19 Jul 2025. URL https://proceedings.mlr.press/v267/ksenofontov25a.html.

[29] Lemor, J.-P., Gobet, E., and Warin, X. Rate of convergence of an empirical regression method for solving generalized backward stochastic differential equations. Bernoulli, 12(5):889–916, 2006.

[30] Li, S., Jiang, X., Tivnan, M., Gang, G. J., Shen, Y., and Stayman, J. W. Ct reconstruction using diffusion posterior sampling conditioned on a nonlinear measurement model. Journal of Medical Imaging, 11(04), August 2024. ISSN 2329-4302. doi: 10.1117/1.jmi.11.4.043504. URL http://dx.doi.org/10.1117/1.JMI.11.4.043504.

[31] Lin, S., Clark, R., Birke, R., Schönborn, S., Trigoni, N., and Roberts, S. Anomaly detection for time series using vae-lstm hybrid model. In ICASSP 2020 - 2020 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2020.

[32] Liu, J., Sun, Y., Xu, X., and Kamilov, U. S. Image restoration using total variation regularized deep image prior, 2018. URL https://arxiv.org/abs/1810.12864.

[33] Longstaff, F. A. and Schwartz, E. S. Valuing american options by simulation: a simple least-squares approach. The review of financial studies, 14(1):113–147, 2001.

[34] Ma, Y., Zhang, Y., Chen, L., Jiang, Q., Shi, F., and Wei, B. Deep plug-and-play denoising prior with total variation regularization for low-dose ct. Frontiers in Physics, Volume 13 - 2025, 2025. ISSN 2296-424X. doi: 10.3389/fphy.2025.1563756. URL https://www.frontiersin.org/journals/physics/articles/10.3389/fphy.2025.1563756.

[35] Mao, W., Xu, C., Zhu, Q., Chen, S., and Wang, Y. Leapfrog diffusion model for stochastic trajectory prediction. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 5517–5526, 2023.

[36] Meng, C., He, Y., Song, Y., Song, J., Wu, J., Zhu, J.-Y., and Ermon, S. SDEdit: Guided image synthesis and editing with stochastic differential equations. In International Conference on Learning Representations, 2022. URL https://openreview.net/forum?id=aBsCjcPu_tE.

[37] Pardoux, E. and Peng, S. Adapted solution of a backward stochastic differential equation. Systems & Control Letters, 14(1):55–61, 1990. ISSN 0167-6911. doi: https://doi.org/10.1016/0167-6911(90)90082-6. URL https://www.sciencedirect.com/science/article/pii/0167691190900826.

[38] Park, C. Y., Hu, Y., McCann, M. T., Garcia-Cardona, C., Wohlberg, B., and Kamilov, U. S. Plug-and-play priors as a score-based method. In 2025 IEEE International Conference on Image Processing (ICIP), pp. 49–54, 2025. doi: 10.1109/ICIP55913.2025.11084503.

[39] Peng, S. Probabilistic interpretation for systems of quasilinear parabolic partial differential equations. Stochastics and stochastics reports (Print), 37(1-2):61–74, 1991.

[40] Peng, X., Zheng, Z., Dai, W., Xiao, N., Li, C., Zou, J., and Xiong, H. Improving diffusion models for inverse problems using optimal posterior covariance. In Salakhutdinov, R., Kolter, Z., Heller, K., Weller, A., Oliver, N., Scarlett, J., and Berkenkamp, F. (eds.), Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 40347–40370. PMLR, 21–27 Jul 2024. URL https://proceedings.mlr.press/v235/peng24h.html.

[41] Rebbapragada, U., Protopapas, P., Brodley, C. E., and Alcock, C. Finding anomalous periodic time series. Machine Learning, 74(3):281–313, dec 2008. doi: 10.1007/s10994-008-5093-3. URL https://doi.org/10.1007%2Fs10994-008-5093-3.

[42] Romano, Y., Elad, M., and Milanfar, P. The little engine that could: Regularization by denoising (red). SIAM Journal on Imaging Sciences, 10(4):1804–1844, 2017. doi: 10.1137/16M1102884.

[43] Rombach, R., Blattmann, A., Lorenz, D., Esser, P., and Ommer, B. High-resolution image synthesis with latent diffusion models, 2022. URL https://arxiv.org/abs/2112.10752.

[44] Rudin, L. I., Osher, S., and Fatemi, E. Nonlinear total variation based noise removal algorithms. Physica D: Nonlinear Phenomena, 60(1–4):259–268, 1992. doi: 10.1016/0167-2789(92)90242-F.

[45] Shah, V. and Hegde, C. Solving linear inverse problems using gan priors: An algorithm with provable guarantees. arXiv preprint arXiv:1802.08406, 2018. doi: 10.48550/arXiv.1802.08406.

[46] Sidky, E. Y. and Pan, X. Image reconstruction in circular cone-beam computed tomography by constrained, total-variation minimization. Physics in Medicine and Biology, 53(17):4777–4807, 2008. doi: 10.1088/0031-9155/53/17/021.

[47] Song, J., Vahdat, A., Mardani, M., and Kautz, J. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023. URL https://openreview.net/forum?id=9_gsMA8MRKQ.

[48] Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., and Poole, B. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations (ICLR), 2021. doi: 10.48550/arXiv.2011.13456. URL https://arxiv.org/abs/2011.13456.

[49] Venkatakrishnan, S. V., Bouman, C. A., and Wohlberg, B. Plug-and-play priors for model based reconstruction. In 2013 IEEE Global Conference on Signal and Information Processing (GlobalSIP), pp. 945–948, 2013. doi: 10.1109/GlobalSIP.2013.6737048.

[50] Wang, H., Jin, T., Lin, W., Wang, S., Huang, H., Ji, S., and Zhao, Z. IRBridge: Solving image restoration bridge with pre-trained generative diffusion models. In Forty-second International Conference on Machine Learning, 2025a. URL https://openreview.net/forum?id=b3bJR1quJ3.

[51] Wang, Y., Yu, J., and Zhang, J. Zero-shot image restoration using denoising diffusion null-space model. arXiv preprint arXiv:2212.00490, 2022. doi: 10.48550/arXiv.2212.00490.

[52] Wang, Z., Vandersteen, C., Raffaelli, C., Guevara, N., and Delingette, H. Multi-energy quasi-symplectic langevin inference for latent disentangled learning. IEEE Transactions on Image Processing, 34:7037–7049, 2025b. doi: 10.1109/TIP.2025.3624614.

[53] Xia, W., Zhang, Y., Yang, Y., Xue, J.-H., Zhou, B., and Yang, M.-H. Gan inversion: A survey, 2022.

[54] Zheng, C. and Lan, Y. Characteristic guidance: Non-linear correction for diffusion model at large guidance scale. In Salakhutdinov, R., Kolter, Z., Heller, K., Weller, A., Oliver, N., Scarlett, J., and Berkenkamp, F. (eds.), Proceedings of the 41st International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning Research, pp. 61386–61412. PMLR, 21–27 Jul 2024. URL https://proceedings.mlr.press/v235/zheng24f.html.

[55] Zheng, H., Chu, W., Zhang, B., Wu, Z., Wang, A., Feng, B., Zou, C., Sun, Y., Kovachki, N. B., Ross, Z. E., Bouman, K., and Yue, Y. Inversebench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences. In The Thirteenth International Conference on Learning Representations, 2025. URL https://openreview.net/forum?id=U3PBITXNG6.

[56] Zhu, Y., Zhang, K., Liang, J., Cao, J., Wen, B., Timofte, R., and Van Gool, L. Denoising diffusion models for plug-and-play image restoration. arXiv preprint arXiv:2305.08995, 2023. doi: 10.48550/arXiv.2305.08995.

**本页范围与校对状态：** 本页为 arXiv:2609.15702v1（ICML 2026）的全文中文译稿：摘要、正文第 1–6 节（含 2.1/2.2、3.1/3.2、4.1/4.2 全部小节）、结论、致谢、影响声明、附录 A–F（A 记号、B 证明 B.1–B.5、C 关键实现、D 算法 2–3、E 附加定性评估 E.1–E.4、F 附加实验与实现细节 F.1–F.7）、表 1–4 逐格、图 1–8 图注、算法 1–3 逐行与参考文献 [1]–[56]。公式编号沿用原文 (1)–(33)（含附录 (23)–(33)）。表 1–4 已用 PDF 第 2、7、9 页渲染图逐格核对（含表 2 的 7 项指标与 4 项方法属性、表 3 的 JS 散度/余弦相似度、表 4 的均值±标准差）。附录 B 的证明按原文逐步骤译出（引理 B.1–B.3、命题 B.4、定理 B.5，含 Itô 能量估计与 Picard 迭代细节）。附录 C 的 Python 代码块仅译其说明性文字与结构（代码本身不翻译，按原文保留函数名）。原文正文页 1–9、参考文献 9–12、附录 12–23。表 2 脚注 1（DDS 使用 CT 预训练先验，故仅作附加参照）已译入。图内曲线与图像未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误。骨架"版本"行原为 2026-09-17（收录日），已按 BRIEF2 结构改为 arXiv:2609.15702v1（2026-09-14，依据 PDF 页眉 "arXiv:2609.15702v1 [cs.LG] 14 Sep 2026"，并注明 ICML 2026 / PMLR 306）；作者为 Zihao Wang；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
