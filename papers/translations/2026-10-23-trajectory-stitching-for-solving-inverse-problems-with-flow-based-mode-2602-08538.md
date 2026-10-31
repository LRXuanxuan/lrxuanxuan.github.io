---
layout: page
title: "基于流模型的逆问题轨迹拼接｜中文全文译文"
permalink: /papers/translations/2026-10-23-trajectory-stitching-for-solving-inverse-problems-with-flow-based-mode-2602-08538/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/61e3ca79d6c8dda8/) · [原文 arXiv](https://arxiv.org/abs/2602.08538) · [全部目录](/papers/catalog/)

# 基于流模型的逆问题轨迹拼接

**原题：** Trajectory Stitching for Solving Inverse Problems with Flow-Based Models  
**作者：** Alexander Denker、Zeljko Kereta、Carola-Bibiane Schönlieb、Moshe Eliasof（Helmholtz Imaging/DESY、伦敦大学学院、剑桥大学、本-古里安大学）  
**版本：** arXiv:2602.08538v2（eess.IV），2026-10-01；第 43 届国际机器学习大会（ICML 2026，首尔，PMLR 306）录用；原文 22 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–7 节（含 2.1–2.2、3.1–3.3、4.1–4.2、5.1–5.2、6 全部小节）、结论、致谢与影响声明、附录 A–J（含 B.1–B.2、C.1–C.2、E.1–E.3、F.1）、图 1–8 图注、表 1–8 逐格、算法 1–2、参考文献 61 条（英文原条目）按原文结构录入；逐句逐式终校未做。

## 摘要

基于流的生成模型已成为求解逆问题的强先验。一种做法是直接优化初始潜变量（噪声），使流的输出解满足逆问题；但这需要沿整条生成轨迹反向传播，带来高内存开销与数值不稳定性。我们提出 **MS-Flow**：它把轨迹表示为**一串中间潜状态**而非单个初始编码。通过在局部强制流动力学、并用轨迹匹配惩罚耦合各段，MS-Flow 在"更新中间潜状态"与"强制与观测数据一致"之间交替。这降低了内存消耗并提升重建质量。我们在图像恢复与逆问题（含图像修复、超分辨与计算机断层成像）上证明了 MS-Flow 相对现有方法的有效性。

## 1 引言

图像中的逆问题（超分辨、修复、压缩感知等）旨在从含噪、间接测量 $y\in\mathbb R^m$ 恢复高保真信号 $x\in\mathbb R^n$，通常用前向方程 $y=Ax+\eta$ 建模，其中 $A$ 为已知前向算子、$\eta$ 为测量噪声。由于问题病态，仅依赖数据一致性不足，需要正则化把解空间约束到有效图像（Engl 等，1996）。

深度生成模型已成为强正则化方法（Duff 等，2024）：通过学习映射 $g_\theta:\mathbb R^n\to\mathbb R^n$，把简单潜分布 $p_z$（如 $\mathcal N(0,I)$）推前为复杂数据分布 $p_x$，这些模型充当强大的学习先验。利用这类先验的常见策略是**潜空间优化**（latent space optimization，LSO）（Bora 等，2017；Menon 等，2020）：LSO 通过优化潜编码求重建 $\hat x=g_\theta(\hat z)$：

$$
\hat z\in\arg\min_{z\in\mathbb R^n}\ \Phi(g_\theta(z))+\lambda R(z), \tag{1}
$$

其中 $\Phi$ 强制数据一致性（如高斯噪声下 $\Phi(x)=\frac12\|Ax-y\|^2$），$R$ 作为潜编码的正则项，确保 $z$ 停留在潜空间高密度区域。

LSO 在成像逆问题中取得显著成功，代表性例子有超分辨（Menon 等，2020）、压缩感知（Bora 等，2017）与图像修复（Asim 等，2020），所用骨干包括归一化流（Rezende & Mohamed，2015）、变分自编码器（Kingma & Welling，2013）或生成对抗网络（Goodfellow 等，2014）。LSO 也被与扩散模型结合使用（Wang 等，2024a；Chihaoui 等，2024），相关工作另见附录 A。重要的是，LSO 不限于逆问题，也支撑分类器引导采样或条件采样等任务——此时 $\Phi$ 编码的是语义约束而非数据一致性。

在连续时间生成模型（如连续归一化流（Chen 等，2018；Grathwohl 等，2019）或基于流的模型（Lipman 等，2023））中，生成器 $g_\theta$ 没有闭式，样本定义为常微分方程（ODE）的解：

$$
\frac{\mathrm dx(t)}{\mathrm dt}=v_\theta(x(t),t),\qquad x(0)=z,\quad t\in[0,1], \tag{2}
$$

其中 $v_\theta$ 为训练好的模型。把式 (2) 代入式 (1)，LSO 就变成**ODE 约束优化问题**（Lions，1971；Hinze 等，2008）。当前最先进的 D-Flow（Ben-Hamu 等，2024）以**单次打靶**（single-shooting）策略处理 LSO：离散 ODE 并对所得轨迹反向传播梯度。该方法有效，但有两个关键局限：

- **(L1) 高内存开销。** 沿整条 ODE 轨迹反向传播需要存储或重算中间状态；检查点（checkpointing）（Chen 等，2016）以算力换内存，伴随（adjoint）方法（Chen 等，2018）需额外求解反向 ODE，增加计算代价。
- **(L2) 条件数差。** 生成图像 $x(1)$ 非线性依赖初始潜编码 $z=x(0)$；通过长串神经网络复合优化会导致梯度消失或爆炸，降低收敛性与重建质量。

为克服这些局限，我们提出 MS-Flow——面向基于流的生成模型 LSO 的**多次打靶**（multiple-shooting）框架。MS-Flow 把 ODE 轨迹分解为短段，并用**软拼接惩罚**替代硬性全局 ODE 约束，从而带来：1）**解耦优化**：采用交替极小化策略，把神经动力学与数据一致性更新分离；2）**更低内存占用**：优化避免沿整个时间跨度反向传播，内存占用对 ODE 离散化保持常数。此外，我们为轨迹变量引入**无 Jacobian 更新**，进一步降低内存与计算代价，得到快速、可扩展且稳定的方法（见图 1 与第 5 节）。我们还与近期其他利用流模型的逆问题求解器比较，相关工作讨论见附录 A。

**图 1：** CelebA 上欧拉离散 ODE 时 D-Flow 与 MS-Flow（本文）的峰值 GPU 内存。D-Flow 随时间步数线性增长，MS-Flow 保持常数。

## 2 背景与预备知识

### 2.1 基于流的模型

流匹配（flow matching，FM）（Lipman 等，2023）用**免模拟**目标训练连续归一化流：学习时变向量场 $v_\theta:\mathbb R^n\times[0,1]\to\mathbb R^n$，它诱导概率路径 $p_t$，把简单基础分布（如标准高斯）输运到数据分布 $p_1$。训练目标是使 $v_\theta$ 对齐生成目标路径 $p_t$ 的真实速度场 $u_t$，即流匹配目标

$$
\mathcal L_{\mathrm{FM}}(\theta)=\mathbb E_{t,x\sim p_t(x)}\left\|v_\theta(x,t)-u_t(x)\right\|^2. \tag{3}
$$

然而边缘速度 $u_t$ 一般不可处理，FM 因而采用条件形式：条件 FM 训练匹配条件速度场

$$
\mathcal L_{\mathrm{CFM}}(\theta)=\mathbb E_{t,x_0,x_1}\left\|v_\theta(x_t,t)-u_t(x_t\mid x_0,x_1)\right\|^2, \tag{4}
$$

其中 $x_t\sim p_t(x_t\mid x_0,x_1)$。条件目标与边缘目标的梯度一致，即 $\nabla_\theta\mathcal L_{\mathrm{CFM}}(\theta)=\nabla_\theta\mathcal L_{\mathrm{FM}}(\theta)$（Lipman 等，2023；Tong 等，2023）。采样通过模拟式 (2) 的 ODE 获得。实践中条件路径常取源样本 $x_0\sim p_0$ 与目标数据点 $x_1\sim p_1$ 之间的仿射插值，例如最优传输位移 $x_t=(1-t)x_0+tx_1$（Liu，2022），对应常值条件速度 $u_t(x_t\mid x_0,x_1)=x_1-x_0$；此时 CFM 目标简化为

$$
\mathcal L_{\mathrm{CFM}}(\theta)=\mathbb E_{t,x_0,x_1}\left\|v_\theta(x_t,t)-(x_1-x_0)\right\|^2. \tag{5}
$$

### 2.2 ODE 约束优化

控制、逆问题与机器学习中的许多优化问题依赖动力系统的解。标准的 ODE 约束优化形式为

$$
\min_u\ \Phi\left(x(T),u\right),\quad\text{s.t.}\quad\frac{\mathrm dx(t)}{\mathrm dt}=v\left(x(t),t,u\right),\quad x(0)=x_0,
$$

其中 $t\in[0,T]$、$x(t)\in\mathbb R^n$ 为系统状态，$u$ 表示控制、参数或初始条件（Lions，1971；Hinze 等，2008）。在基于流的生成模型中，动力学 $v_\theta$ 已学习，被优化的是初始条件 $x(0)=z$。由于目标依赖终态 $x(T)$，梯度计算天然与 ODE 积分耦合。处理该类问题有两类常用框架：

- **单次打靶**：通过 $x(0)$ 参数化整条轨迹，精确强制动力学。概念简单，但内存密集且对非线性动力学常条件不良（Betts，2010）。
- **多次打靶**：通过引入时间点 $\{t_k\}_{k=0}^K$ 上的中间状态 $\{x_k\}_{k=0}^K$ 提升问题（Bock & Plitt，1984）。动力学在每个子区间上局部强制，连续性用约束或惩罚施加。这把长轨迹拆成较短段，改善条件数，并支持交替极小化、块坐标下降等结构化优化方法，而无需沿整个时间跨度求导。

## 3 多次打靶流（MS-Flow）

本节给出 MS-Flow——用基于流的模型求解逆问题的多次打靶方法。

### 3.1 从单次打靶到多次打靶

既有方法（如 D-Flow（Ben-Hamu 等，2024）或面向扩散模型的 DMPlug（Wang 等，2024a））采用单次打靶，求解约束优化问题

$$
\min_{x_0}\ \Phi(x(1)),\quad\text{s.t.}\quad\frac{\mathrm dx}{\mathrm dt}=v_\theta(x,t),\ t\in[0,1],\ x(0)=x_0, \tag{6}
$$

其中 $v_\theta$ 为预训练（冻结的）流匹配模型；优化针对 ODE 的初值 $x(0)$。如第 1 节所述，该方法可行但内存代价高：梯度需沿完整离散轨迹反向传播，尤其要穿过 $v_\theta$。

为克服这些局限，我们采用多次打靶原理（Bock & Plitt，1984；Wirsching 等，2007）：把时间区间 $[0,1]$ 分为 $K$ 段，网格点 $0=t_0<t_1<\cdots<t_K=1$。即不优化由 $x_0$ 生成的单条轨迹，而在一组决策变量 $\{x_0,\ldots,x_K\}$（称为**打靶点**，表示轨迹上的中间状态）上优化。我们因此把方法称为 **MS-Flow**，其目标为

$$
\min_{x_\ast,x_{0:K}}\ \underbrace{\Phi(x_\ast)}_{\text{数据一致性}}+\underbrace{\lambda R(x_0)+\frac{\alpha}{2}\left\|x_\ast-x_K\right\|^2}_{\text{正则化}}+\underbrace{\frac{\gamma}{2}\sum_{k=1}^{K}\left\|x_k-F_{k-1,k}(x_{k-1})\right\|^2}_{\text{轨迹一致性}}, \tag{7}
$$

其中 $F_{k-1,k}(x)=\mathrm{odeint}(x,v_\theta,[t_{k-1},t_k])$ 表示从时间 $t_{k-1}$ 的状态 $x$ 出发积分到 $t_k$ 的 ODE。该重构把优化与每步迭代的精确 ODE 可行性解耦；通过二次惩罚放松轨迹连续性，优化不再需要沿整个时间跨度求导，改善数值条件（Wright 等，1999）。此外辅助变量 $x_\ast$ 进一步把数据一致性与轨迹积分分离，使终态可以偏离 ODE 解，并在"遵循动力学"与"数据一致性"之间提供折中。

MS-Flow 目标也可解释为联合后验 $p(x_\ast,x_{0:K}\mid y)$ 上的 MAP 估计，见附录 G；这使我们能把目标推广到扩散模型（Ho 等，2020）。

总体上 MS-Flow 把优化问题分解为三部分：(i) **数据一致性**：$\Phi(x_\ast)$ 编码模型输出 $x_\ast$ 的期望行为，逆问题中取 $\Phi(x)=\frac12\|Ax-y\|^2$；(ii) **正则化**：耦合项 $\|x_\ast-x_K\|^2$ 鼓励解 $x_\ast$ 靠近流模型生成的图像流形，初始点正则项 $R(x_0)$ 鼓励轨迹从潜分布高概率区域出发——常用基础分布的负对数似然 $R(x_0)=-\log p(x_0)$，对标准高斯给出 $R(x_0)=\frac12\|x_0\|^2$（Bora 等，2017），但该正则把全部质量集中于原点，而高斯的典型样本位于半径 $\mathcal O(\sqrt d)$ 处（Bishop & Nasrabadi，2006），故我们改用**径向高斯先验**（Farquhar 等，2020；Samuel 等，2023；Ben-Hamu 等，2024）：半径 $r=\|x_0\|$ 服从 $\chi_d$ 分布，相应负对数似然为

$$
R(x_0)=\frac{\|x_0\|^2}{2}-(d-1)\log\|x_0\|+c, \tag{8}
$$

其中 $c$ 为与 $x_0$ 无关的常数；该选择使正则项与潜分布的典型集对齐，优化不会偏向非典型潜编码；(iii) **轨迹一致性**：轨迹惩罚强制打靶点之间的连续性，确保与底层流动力学一致。

最后，为便于实现，我们对 $F_{k-1,k}$ 采用显式 Euler 步离散，步长 $\Delta_k=t_k-t_{k-1}$（附录 B 进一步讨论）；此时目标简化为

$$
\min_{x_\ast,x_{0:K}}\ \Phi(x_\ast)+\frac{\alpha}{2}\left\|x_\ast-x_K\right\|^2+\lambda R(x_0)+\frac{\gamma}{2}\sum_{k=1}^{K}\left\|x_k-\left[x_{k-1}+\Delta_kv_\theta(x_{k-1},t_{k-1})\right]\right\|^2. \tag{9}
$$

### 3.2 优化 MS-Flow 目标

本节讨论式 (7) 的优化。它适合采用**交替极小化**（Wright 等，1999），把轨迹一致性与数据一致性解耦：我们在求解打靶点 $X^i:=[x_0^i,\ldots,x_K^i]$ 与求解最终逆问题解估计 $x_\ast^i$（$i$ 为迭代序号）之间交替：

$$
X^{i+1}=\arg\min_{[x_0,\ldots,x_K]}\ \frac{\alpha}{2}\left\|x_\ast^i-x_K\right\|^2+\lambda R(x_0)+\frac{\gamma}{2}\sum_{k=1}^{K}\left\|x_k-F_{k-1,k}(x_{k-1})\right\|^2, \tag{10a}
$$

$$
x_\ast^{i+1}=\arg\min_{x_\ast}\ \Phi(x_\ast)+\frac{\alpha}{2}\left\|x_\ast-x_K^{i+1}\right\|^2. \tag{10b}
$$

优化这些问题的整体流程见算法 1。下文给出算法 1 各部分的细节与讨论。

**求解轨迹一致性（式 (10a)）。** 定义

$$
J(x_0,\ldots,x_K):=\frac{\alpha}{2}\left\|x_\ast^i-x_K\right\|^2+\lambda R(x_0)+\frac{\gamma}{2}\sum_{k=1}^{K}\left\|x_k-F_{k-1,k}(x_{k-1})\right\|^2. \tag{11}
$$

可以看到式 (11) 关于 $x_k$ 的梯度只依赖相邻的中间变量 $x_{k-1}$ 与 $x_{k+1}$，这促使我们采用**坐标下降**——此类情形下的常见选择（Wright 等，1999）。即我们从终点 $x_K$ 向初始点 $x_0$ 做**反向扫描**，用步长 $\eta>0$ 的梯度下降步迭代更新每个打靶点 $x_k$，并使用最近更新的邻点（算法 1 第 6–14 行）。当转移映射 $F_{k,k+1}$ 用步长 $\Delta_k=t_{k+1}-t_k$ 的显式 Euler 离散时，坐标下降更新涉及向量—Jacobian 乘积（VJP）：

$$
J_{F_{k,k+1}}(x)=I+\Delta_kJ_{v_\theta}(x,t_k). \tag{12}
$$

为避免对流模型反向传播，我们使用**无 Jacobian 近似** $J_{F_{k,k+1}}(x)\approx I$；其收敛性质在第 4.2 节分析。

**求解数据一致性（式 (10b)）。** 数据一致性步（算法 1 第 15–17 行）求解一个 Tikhonov 正则化优化问题，在目标 $\Phi$ 与"靠近当前打靶点 $x_K^{i+1}$"之间折中。我们考虑两个特例：

1. 若 $\Phi$ 为闭真凸函数，式 (10b) 可识别为**近端算子**（Parikh 等，2014），这使 MS-Flow 可应用于非光滑凸目标，例如含椒盐噪声或脉冲噪声的逆问题（Nikolova，2004）。
2. 对含加性噪声的线性逆问题，常用 $\Phi(x)=\frac12\|Ax-y\|^2$，式 (10b) 的解有显式形式：

$$
x_\ast^{i+1}=\left(A^\top A+\alpha I\right)^{-1}\left(A^\top y+\alpha x_K^{i+1}\right). \tag{13}
$$

**算法 1　交替极小化 + 坐标下降的 MS-Flow 轨迹优化**

- **输入：** 前向算子 $A$、数据 $y$、流模型 $v_\theta$、超参数 $\alpha,\gamma,\lambda$、轨迹更新步数 $L$、步长 $\eta$。
- **初始化：** 初始逆解 $x_\ast^0$、初始轨迹序列 $X^0=[x_0^0,\ldots,x_K^0]$。
- 1: $i\leftarrow0$；2: **while** 未收敛 **do**；3: // 1. 轨迹坐标的反向扫描；4: $X^{(\ell=0)}\leftarrow X^i$；5: **for** $\ell=1$ **to** $L$ **do**；6: 用 $x_\ast^i$ 与 $x_{K-1}^{(\ell-1)}$ 更新 $x_K^{(\ell)}$（式 (23)）；7: **for** $k=K-1$ **down to** $1$ **do**；8: 用 $x_{k-1}^{(\ell-1)}$ 与 $x_{k+1}^{(\ell)}$ 更新 $x_k^{(\ell)}$（式 (24)）；9: **end for**；10: 用 $x_1^{(\ell)}$ 更新 $x_0^{(\ell)}$（式 (25)）；11: **end for**；12: $X^{i+1}\leftarrow X^{(L)}$；13: // 2. 数据一致性优化；14: $x_\ast^{i+1}=\arg\min_{x_\ast}\Phi(x_\ast)+\frac{\alpha}{2}\|x_\ast-x_K^{i+1}\|^2$；15: $i\leftarrow i+1$；16: **end while**；17: **输出：** 重建图像 $x_\ast^i$ 与轨迹 $X^i$。

### 3.3 MS-Flow 的复杂度

我们把 MS-Flow 的时间与空间复杂度与单次打靶基线 D-Flow 比较，聚焦式 (10a) 的轨迹一致性子问题；式 (10b) 的数据一致性更新为各方法共享，其代价依赖 $\Phi$（对二次 $\Phi(x)=\frac12\|Ax-y\|^2$ 归结为求解线性系统）。

令 $n$ 为状态维数、$n_t$ 为积分流 ODE 的时间离散步数。MS-Flow 把区间分为 $K$ 个打靶段（显式 Euler 时 $K=n_t$）。记 $C_{\mathrm{fwd}}$、$C_{\mathrm{vjp}}$ 为一次前向与一次 VJP 通过 $v_\theta$ 的代价，$M_{\mathrm{net}}$ 为网络峰值激活内存；详细计算见附录 C。

**时间复杂度。** 如表 1 所示，D-Flow 每次迭代代价为 $\mathcal O(n_t(C_{\mathrm{fwd}}+C_{\mathrm{vjp}}))$，因为需前向积分后沿整条离散轨迹反向传播。相反，MS-Flow 一次外层迭代（$L$ 步反向扫描）代价为 $\mathcal O(LK(C_{\mathrm{fwd}}+C_{\mathrm{vjp}}))$，随打靶点数线性增长而避免沿时间全局反向传播；无 Jacobian 变体进一步把代价降为 $\mathcal O(LKC_{\mathrm{fwd}})$。

**表 1　D-Flow 与 MS-Flow 的时间与内存复杂度比较**（$n$：状态维数；$n_t$：ODE 离散步数；$K$：打靶区间数（显式 Euler 时 $K=n_t$）；$L$：内迭代次数；$C_{\mathrm{fwd}}$、$C_{\mathrm{vjp}}$：一次前向/反向通过 $v_\theta$ 的代价；$M_{\mathrm{net}}$：网络峰值激活内存）

| 方法 | 每次迭代时间 | 峰值内存 |
|---|---|---|
| D-Flow（单次打靶） | $\mathcal O(n_t(C_{\mathrm{fwd}}+C_{\mathrm{vjp}}))$ | $\mathcal O(n_tM_{\mathrm{net}})$ |
| D-Flow（伴随） | $\mathcal O(n_t(C_{\mathrm{fwd}}+C_{\mathrm{vjp}}))$ | $\mathcal O(M_{\mathrm{net}})$ |
| MS-Flow（精确梯度） | $\mathcal O(LK(C_{\mathrm{fwd}}+C_{\mathrm{vjp}}))$ | $\mathcal O(M_{\mathrm{net}})$ |
| MS-Flow（无 Jacobian） | $\mathcal O(LKC_{\mathrm{fwd}})$ | $\mathcal O(M_{\mathrm{net}})$ |

**内存复杂度。** D-Flow 的代价来自跨 $n_t$ 个求解步存储中间激活，峰值内存为 $\mathcal O(n_tM_{\mathrm{net}})$（除非用伴随方法（Chen 等，2018））。MS-Flow 引入状态变量 $\{x_k\}_{k=0}^K$，但无需存储完整计算图；每个打靶区间局部处理，峰值内存为 $\mathcal O(M_{\mathrm{net}})+\mathcal O(Kn)$，当网络激活占主导时对离散化保持常数（图 1 验证）。例如第 5.2 节模型的激活约占 550MB，而单个状态 $x_k$ 仅需 0.19MB GPU 内存。

**并行化。** 由于轨迹连续性在局部强制，MS-Flow 可在打靶区间 $F_{k,k+1}$ 上并行计算；$v_\theta$ 的前向评估可批处理，以内存换计算时间。相反，单次打靶方法在时间上本质串行，不具备这种并行性（图 3 演示）。

## 4 MS-Flow 的性质

本节建立 MS-Flow 的关键理论性质：先回顾多次打靶的稳定性优势，再证明算法 1 的内层轨迹更新收敛——这很重要，因为 MS-Flow 是推断时优化过程，收敛保证轨迹目标可靠下降，从而给出稳定可复现的重建；最后说明基于近似（无 Jacobian）梯度的内存高效实现通过强制充分下降条件仍保持收敛保证。

### 4.1 多次打靶的稳定性

单次打靶的一个标准困难是**长时程敏感性**：若 $v_\theta$ 关于 $x$（对 $t$ 一致）$L$-Lipschitz，则由 Grönwall 不等式，流映射满足

$$
\left\|x(t;x_1)-x(t;x_2)\right\|_2\le e^{Lt}\left\|x_1-x_2\right\|_2. \tag{14}
$$

因此扰动可在整个时间跨度上被指数放大（Hairer 等，1993）。多次打靶通过把时间区间拆为较短段 $0=t_0<\cdots<t_K=1$ 并局部强制动力学来缓解：在长度 $\Delta_k$ 的每个区间 $[t_k,t_{k+1}]$ 上，同一边界以 $\Delta_k$ 替换 $t$，得到局部放大因子 $e^{L\Delta_k}$（Hairer 等，1993）。在 MS-Flow 中，这转化为条件更好的轨迹更新：缺陷惩罚 $\|x_{k+1}-F_{k,k+1}(x_k)\|_2^2$ 在局部控制误差，而非让误差沿整条轨迹累积。

### 4.2 轨迹更新的收敛性

我们研究用于求解式 (10a) 轨迹更新的坐标下降算法的收敛性。外层第 $i$ 次迭代固定估计 $x_\ast^i$，通过最小化式 (11) 更新轨迹 $X:=[x_0,\ldots,x_K]$。算法 2 的反向扫描按 **Gauss–Seidel 序**做循环块更新：对 $\ell=1,\ldots,L$，依次更新块 $k=K,K-1,\ldots,0$：

$$
x_k^{(\ell)}=x_k^{(\ell-1)}-\eta_k\nabla_{x_k}J_i\left(X^{(\ell,k)}\right). \tag{15}
$$

其中 $X^{(\ell,k)}=[x_0^{(\ell-1)},\ldots,x_{k-1}^{(\ell-1)},x_k^{(\ell-1)},x_{k+1}^{(\ell)},\ldots,x_K^{(\ell)}]$ 表示块 0 到 $k$ 取 $\ell-1$ 层、块 $k+1$ 到 $K$ 取 $\ell$ 层的 Gauss–Seidel 迭代点；即更新 $x_k^{(\ell)}$ 时使用时间下标更大、最近更新过的轨迹点 $\{x_{k+1}^{(\ell)},\ldots,x_K^{(\ell)}\}$。我们强调式 (15) 指式 (11) 的**精确偏梯度**；当使用无 Jacobian 更新等高效近似时，我们通过对 $J_i$ 的标准回溯线搜索强制充分下降条件（见注 4.2）。

下面形式化 MS-Flow 中反向扫描的行为。命题 4.1 表明：在正则性假设与适当步长下，循环 Gauss–Seidel 更新保证每次扫描都降低轨迹目标 $J_i$；且更新渐近稳定，内层迭代的任意聚点都是 $J_i$ 的一阶稳定点。证明见附录 D。

**命题 4.1（MS-Flow 的单调下降与稳定性）。** 在正则性假设（假设 D.1）下，由式 (15) 生成的迭代 $\{X^{(\ell)}\}_{\ell\ge0}$ 满足：1. **单调下降：** $J_i(X^{(\ell+1)})\le J_i(X^{(\ell)})$ 对所有 $\ell$ 成立；2. **步长消逝：** $\sum_{\ell\ge0}\sum_{k=0}^{K}\|x_k^{(\ell+1)}-x_k^{(\ell)}\|_2^2<\infty$，从而对每个 $k$ 有 $\|x_k^{(\ell+1)}-x_k^{(\ell)}\|_2\to0$；3. **极限点的稳定性：** $\{X^{(\ell)}\}$ 的每个聚点 $\bar X$ 都是 $J_i$ 的一阶稳定点，即 $\nabla J_i(\bar X)=0$。

**注 4.2（非精确与无 Jacobian 更新）。** 用近似替换式 (15) 中的 $\nabla_{x_k}J_i$ 会失去式 (11) 的下降保证；但若用 Armijo 回溯线搜索选择 $\eta_k$、对**真实目标** $J_i$ 强制一致充分下降（Nocedal & Wright，2006；Wright 等，1999），命题 4.1 仍成立。更一般地，这些非精确 Gauss–Seidel 步可解释为对局部上模型（一阶代理加二次项）的块更新，类似 majorization 与近端方法，其标准充分下降论证蕴含：有界迭代收敛到稳定点（Parikh 等，2014；Nocedal & Wright，2006；Wright 等，1999）。我们在图 3 中经验验证这一点。

**表 2　不同时间离散（$n_t$）下 100 次迭代的平均计算时间（秒/张）**（5 张图像、每张 10 次运行的平均）

| 方法 | $n_t=3$ | $n_t=6$ | $n_t=12$ |
|---|---|---|---|
| D-Flow | 7.43 | 17.06 | 175.57 |
| MS-Flow w/ JFB（$L=1$） | 2.44 | 2.63 | 4.44 |
| MS-Flow w/ JFB（$L=10$） | 18.65 | 22.00 | 40.10 |
| MS-Flow w/o JFB（$L=1$） | 9.30 | 19.61 | 41.05 |
| MS-Flow w/o JFB（$L=10$） | 86.65 | 190.70 | 405.47 |
| MS-Flow w/ GD（$L=1$） | 4.35 | 5.36 | 9.42 |
| MS-Flow w/ GD（$L=10$） | 38.64 | 48.23 | 89.09 |

## 5 实验

本节在广泛应用中评估 MS-Flow，包括计算机断层成像、去模糊、修复与超分辨，并与各实验中描述的基线比较。我们关注以下问题：(Q1) MS-Flow 有多稳定、与现有技术比较如何？(Q2) MS-Flow 有多高效？(Q3) 相对领先的基于流模型的逆问题求解方法，MS-Flow 的下游性能如何？所有实验中我们优化式 (7) 的目标；实验设置补充信息见附录 E。代码公开于 https://github.com/alexdenker/MS-Flow 。

### 5.1 经验收敛与效率分析

我们首先验证优化方案的收敛性，并展示 MS-Flow 的鲁棒性与计算效率。

**设置。** 在 OrganCMNIST 数据集（Yang 等，2021；2023）上考虑稀疏角度断层成像，以研究算法设计选择并与 D-Flow 比较。前向算子为 Radon 变换，在 $[0,\pi)$ 上取 18 个等距角度，并加入 $\sigma_{\mathrm{noise}}=0.01$ 的随机高斯噪声。训练用 Flow Matching 库（Lipman 等，2023）实现；我们在此数据集上研究 (Q1) 与 (Q2) 并进行消融。

**经验收敛。** 图 3 对命题 4.1 的收敛结果给出经验验证：比较优化式 (11) 轨迹项的三类方法：(i) 带无 Jacobian 近似的坐标下降（CD with JFB）；(ii) 带精确梯度的坐标下降（CD without JFB）；(iii) 梯度下降。我们注意到早期迭代收敛相似，只有较晚迭代才看到精确梯度的（ albeit 微小）优势；但性能由最初几次更新主导，此时三种方法表现相近。所有实验取 $L\le10$，其余部分采用 CD with JFB 作为默认内层优化器——这既有理论也有实践支持：在许多交替优化设定中，子问题无需精确求解即可保证整体收敛，每个子问题少量梯度步常足以取得一致进展且计算高效（Eckstein & Bertsekas，1992；Boyd 等，2011）。对采用线搜索选择步长的 CD with JFB，我们可证明收敛（注 4.2）；经验上常数步长已足以获得稳定性。

**缩放与鲁棒性分析。** 我们还研究离散点数 $n_t$（等于打靶点数 $K$）与式 (8) 径向高斯先验正则强度 $\lambda$ 的收敛性，结果见图 2，表明 MS-Flow 在广泛超参数范围内稳定。虽然 D-Flow 能达到相似的峰值 PSNR，但其性能常在迭代中退化。表 2 进一步比较不同 $n_t$ 与内层坐标下降迭代数（$L=1,10$）下的计算时间：由于 D-Flow 的端到端特性，其计算时间随离散点数 $n_t$ 急剧增加；相反，带无 Jacobian 近似的 MS-Flow 最快，且随 $n_t$ 平缓缩放。

**图 2：** OrganCMNIST 稀疏角度 CT 评估。左：正则项的影响；右：MS-Flow 与 D-Flow 在不同时间分辨率下的比较。阴影为 10 张图像上的标准差。

**图 3：** 式 (11) 轨迹损失在坐标下降（含/不含无 Jacobian 近似）与全梯度下降下的收敛（横轴内层步 $\ell$，纵轴 $J(x_0,\ldots,x_K)$）。

### 5.2 图像恢复任务

我们接着证明 MS-Flow 与其他近期提出的基于流的逆问题求解器具有竞争力。

**设置。** 在 CelebA 数据集（Yang 等，2015）上考虑三个常见图像恢复任务：(i) 高斯去模糊（强度 $\sigma=1$、核尺寸 61）；(ii) 双三次插值 2 倍超分辨；(iii) 中心 32×32 像素盒掩模修复。所有情形加入 $\sigma_{\mathrm{noise}}=0.01$ 的高斯噪声。使用标准成像指标 PSNR 与 SSIM（Wang 等，2004），报告 CelebA 50 张图像重建值。该设置同时回答 (Q3)，并与多个基于流的逆问题求解器直接比较，包括 Flow-Prior（Zhang 等，2024）、OT-ODE（Pokle 等，2024）、PnP-Flow（Martin 等，2025）与 D-Flow。

**结果。** 实验结果汇总于表 3，重建结果见图 4。对高斯去模糊与超分辨，MS-Flow 取得最高 PSNR，SSIM 略有下降——这可解释为式 (10b) 的数据一致性步包含惩罚偏离终端打靶点 $x_K$ 的正则项：该偏离以欧氏范数度量，也促进平滑，从而带来更高（更好）的 PSNR。对高斯去模糊与超分辨，我们在图 7、8 给出打靶点初始化与最终收敛轨迹。

**表 3　三个图像恢复任务上不同重建方法的定量比较**（每任务每指标（PSNR、SSIM、LPIPS）最优加粗、次优加下划线）

| 方法 | 高斯去模糊 PSNR↑ | SSIM↑ | LPIPS↓ | 盒修复 PSNR↑ | SSIM↑ | LPIPS↓ | 2× 超分辨 PSNR↑ | SSIM↑ | LPIPS↓ | 4× 超分辨 PSNR↑ | SSIM↑ | LPIPS↓ | 时间/图（s） |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Flow-Prior | 36.28 | 0.965 | **0.009** | 35.48 | 0.981 | 0.011 | 34.34 | 0.948 | 0.015 | 27.27 | 0.796 | 0.094 | 24.30 |
| OT-ODE | 37.72 | **0.971** | 0.015 | 33.44 | 0.972 | 0.013 | 35.14 | **0.960** | **0.008** | 28.18 | **0.834** | **0.052** | 5.19 |
| PnP-Flow | 36.24 | 0.965 | 0.049 | **35.87** | **0.983** | 0.011 | 34.64 | 0.950 | 0.059 | 28.28 | 0.840 | 0.168 | 5.97 |
| D-Flow | 36.07 | 0.957 | 0.029 | 34.20 | 0.967 | 0.012 | 35.49 | 0.951 | 0.019 | **29.93** | **0.873** | 0.062 | 26.31 |
| MS-Flow（本文） | **39.04** | 0.968 | **0.009** | 34.77 | 0.974 | 0.015 | **36.41** | 0.957 | 0.023 | 28.52 | 0.838 | 0.091 | 14.11 |

**图 4：** CelebA 上三个图像恢复任务的重建比较。第一行：高斯去模糊；第二行：修复；第三行：超分辨（真值、观测数据、Flow-Prior、OT-ODE、PnP-Flow、D-Flow、MS-Flow）。

## 6 潜流模型

我们进一步证明 MS-Flow 除标准流匹配网络外，还能扩展到现代大规模潜流模型：在 Stable Diffusion 3.5（Esser 等，2024）上评估。

**设置。** 把 MS-Flow 与 FlowDPS（Kim 等，2025）和 FLAIR（Erbach 等，2025）比较——二者都避免沿流反向传播、因而可扩展到大规模潜流架构。MS-Flow 仍采用轨迹更新的无 Jacobian 梯度近似；考虑模糊标准差 $\sigma=3.0$ 的高斯去模糊。

在潜流模型中，流在潜空间运行而观测定义在像素空间。令 $D:\mathcal Z\to\mathcal X$ 表示把潜变量映射到图像的解码器，$\mathcal Z$ 为潜空间、$\mathcal X$ 为像素空间。此时式 (10b) 的数据一致性更新变为

$$
z_\ast^{i+1}=\arg\min_{z_\ast}\ \frac{1}{2}\left\|AD(z_\ast)-y\right\|_2^2+\frac{\alpha}{2}\left\|z-z_K^{i+1}\right\|_2^2.
$$

所有优化变量定义在潜空间、记作 $z$，最终图像重建为 $x_\ast=D(z_\ast)$。由于解码器 $D$ 非线性，目标不再有闭式解，故用少量 Adam 梯度下降步求解（Kingma & Ba，2015），细节见附录 F。

**结果。** 表 4 报告不同噪声水平 $\sigma_{\mathrm{noise}}=0.01$ 与 $0.1$ 下的结果，报告 FFHQ 数据集（Karras 等，2019）前 100 张图像的平均 PSNR 与平均 SSIM。两种设定下，MS-Flow 在 PSNR、SSIM 与 LPIPS 上一致优于 FlowDPS，并与 FLAIR 相当。对 $\sigma_{\mathrm{noise}}=0.1$，我们观察到**失真—感知折中**：MS-Flow 失真更低（PSNR、SSIM 更高），而 FLAIR 感知质量更好（LPIPS 更低）。定性重建见图 5。这些结果进一步表明 MS-Flow 是利用基于流模型求解逆问题的有效且高效途径。

**图 5：** FFHQ 上 $\sigma_{\mathrm{noise}}=0.01$ 的高斯去模糊重建（真值、观测数据、FlowDPS、FLAIR、MS-Flow）。

**表 4　FFHQ 上不同噪声水平的高斯去模糊比较**（最优加粗、次优加下划线）

| 方法 | $\sigma_{\mathrm{noise}}=0.01$ PSNR↑ | SSIM↑ | LPIPS↓ | $\sigma_{\mathrm{noise}}=0.1$ PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|
| 退化图像 | 26.32 | 0.763 | 0.388 | 23.20 | 0.335 | 0.684 |
| FlowDPS | 27.78 | 0.751 | 0.349 | 26.87 | 0.697 | 0.366 |
| FLAIR | **29.18** | 0.783 | **0.199** | **28.93** | **0.775** | **0.200** |
| MS-Flow（本文） | **30.65** | **0.837** | 0.268 | 28.62 | 0.772 | 0.403 |

## 7 讨论与结论

我们提出 MS-Flow——面向基于流模型 LSO 的多次打靶框架。通过把轨迹表示为一串中间打靶状态，并用轨迹匹配约束局部强制流动力学，MS-Flow 克服了单次打靶方法的两个关键局限：高内存消耗与条件数差。经验上，MS-Flow 在一系列成像逆问题上取得有竞争力或更好的重建性能；无论 ODE 离散步数多少，其内存占用保持常数，比常见现有技术高效得多。这使 MS-Flow 非常适合高分辨率问题与细粒度时间离散，例如用 Stable Diffusion 3.5 做 FFHQ 图像恢复——此时单次打靶方法变得不切实际。

放松 MS-Flow 中的全局 ODE 约束自然引入少量设计选择，最显著的是惩罚权重与打靶点数。实践中我们发现简单的固定惩罚在各任务上可靠，说明 MS-Flow 对这些设置鲁棒。此外，对本文关注的逆问题，中间打靶状态充当辅助变量，性能主要由终端状态而非整条轨迹保真度决定。在此基础上，像分裂式优化方法（Boyd 等，2011）那样引入自适应惩罚更新，是该语境下有趣的未来工作方向。一个有前景的下一步是把 MS-Flow 扩展到基于 SDE 的生成模型（含扩散与基于分数的方法（Song 等，2021b））：通过在段间引入适当的随机一致性约束，MS-Flow 可为这些模型提供内存高效条件采样的实用途径。

**致谢。** AD、CBS 感谢 EPSRC（EP/V026259/1）支持；AD 另感谢 DESY（德国汉堡）——Helmholtz 联合会 HGF 成员——的支持；ZK 感谢 EPSRC（EP/X010740/1）支持。

**影响声明。** 本工作旨在增强基于流的生成模型的可控性。尽管改进的可控性可能被滥用于生成误导或有害内容（含深度伪造），该方法并不在现有模型之外扩展底层生成能力。

## 参考文献（英文原条目，按原文顺序）

以下按原文顺序照录英文参考书目（原文按作者姓氏字母序排列、无编号；本页为便于引用加 [n] 编号），条目文字不翻译；共 61 条，未逐条核对 DOI。

[1] Ardizzone, L., Kruse, J., Rother, C., and K¨othe, U. Analyzing inverse problems with invertible neural networks. In International Conference on Learning Representations, 2019.

[2] Asim, M., Daniels, M., Leong, O., Ahmed, A., and Hand, P. Invertible generative models for inverse problems: mitigating representation error and dataset bias. InInternational conference on machine learning, pp. 399–409. PMLR, 2020.

[3] Ben-Hamu, H., Puny, O., Gat, I., Karrer, B., Singer, U., and Lipman, Y . D-Flow: Differentiating through flows for controlled generation. InForty-first International Conference on Machine Learning, 2024.

[4] Betts, J. T.Practical methods for optimal control and estimation using nonlinear programming. SIAM, 2010.

[5] Bishop, C. M. and Nasrabadi, N. M.Pattern recognition and machine learning, volume 4. Springer, 2006.

[6] Bock, H. G. and Plitt, K.-J. A multiple shooting algorithm for direct solution of optimal control problems.IFAC Proceedings Volumes, 17(2):1603–1608, 1984.

[7] Bora, A., Jalal, A., Price, E., and Dimakis, A. G. Compressed sensing using generative models. In Precup, D. and Teh, Y . W. (eds.),Proceedings of the 34th International Conference on Machine Learning, volume 70 of Proceedings of Machine Learning Research, pp. 537–546. PMLR, 06–11 Aug 2017.

[8] Boyd, S., Parikh, N., Chu, E., Peleato, B., Eckstein, J., et al. Distributed optimization and statistical learning via the alternating direction method of multipliers.Foundations and Trends® in Machine learning, 3(1):1–122, 2011.

[9] Chen, R. T., Rubanova, Y ., Bettencourt, J., and Duvenaud, D. K. Neural ordinary differential equations.Advances in neural information processing systems, 31, 2018.

[10] Chen, T., Xu, B., Zhang, C., and Guestrin, C. Training deep nets with sublinear memory cost.arXiv preprint arXiv:1604.06174, 2016.

[11] Chihaoui, H., Lemkhenter, A., and Favaro, P. Blind image restoration via fast diffusion inversion.Advances in Neural Information Processing Systems, 37:34513–34532, 2024.

[12] Chung, H., Kim, J., Mccann, M. T., Klasky, M. L., and Ye, J. C. Diffusion posterior sampling for general noisy inverse problems. InThe Eleventh International Conference on Learning Representations, 2023.

[13] Daras, G., Dean, J., Jalal, A., and Dimakis, A. G. Intermediate layer optimization for inverse problems using deep generative models.arXiv preprint arXiv:2102.07364, 2021.

[14] Dhariwal, P. and Nichol, A. Diffusion models beat gans on image synthesis.Advances in neural information processing systems, 34:8780–8794, 2021.

[15] Duff, M., Campbell, N. D., and Ehrhardt, M. J. Regularising inverse problems with generative machine learning models.Journal of Mathematical Imaging and Vision, 66 (1):37–56, 2024.

[16] Eckstein, J. and Bertsekas, D. P. On the douglas—rachford splitting method and the proximal point algorithm for maximal monotone operators.Mathematical programming, 55(1):293–318, 1992.

[17] Eliasof, M., Haber, E., and Treister, E. Drip: deep regularizers for inverse problems.Inverse Problems, 40(1): 015006, 2023.

[18] Engl, H. W., Hanke, M., and Neubauer, A.Regularization of Inverse Problems. Mathematics and Its Applications. Springer, Dordrecht, 1996.

[19] Erbach, J., Narnhofer, D., Dombos, A. R., Schiele, B., Lenssen, J. E., and Schindler, K. Solving inverse problems with FLAIR. InThe Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[20] Esser, P., Kulal, S., Blattmann, A., Entezari, R., M¨uller, J., Saini, H., Levi, Y ., Lorenz, D., Sauer, A., Boesel, F., et al. Scaling rectified flow transformers for high-resolution image synthesis. InForty-first international conference on machine learning, 2024.

[21] Farquhar, S., Osborne, M. A., and Gal, Y . Radial bayesian neural networks: Beyond discrete support in large-scale bayesian deep learning. InInternational Conference on Artificial Intelligence and Statistics, pp. 1352–1362. PMLR, 2020.

[22] Goodfellow, I. J., Pouget-Abadie, J., Mirza, M., Xu, B., Warde-Farley, D., Ozair, S., Courville, A., and Bengio, Y . Generative adversarial nets.Advances in neural information processing systems, 27, 2014.

[23] Grathwohl, W., Chen, R. T. Q., Bettencourt, J., Sutskever, I., and Duvenaud, D. Ffjord: Free-form continuous dynamics for scalable reversible generative models.International Conference on Learning Representations, 2019.

[24] Hairer, E., Wanner, G., and Nørsett, S. P.Solving ordinary differential equations I: Nonstiff problems. Springer, 1993.

[25] Hinze, M., Pinnau, R., Ulbrich, M., and Ulbrich, S.Optimization with PDE constraints, volume 23. Springer Science & Business Media, 2008.

[26] Ho, J. and Salimans, T. Classifier-free diffusion guidance. arXiv preprint arXiv:2207.12598, 2022.

[27] Ho, J., Jain, A., and Abbeel, P. Denoising diffusion probabilistic models.Advances in neural information processing systems, 33:6840–6851, 2020.

[28] Karras, T., Laine, S., and Aila, T. A style-based generator architecture for generative adversarial networks. InProceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 4401–4410, 2019.

[29] Kim, J., Kim, B. S., and Ye, J. C. FlowDPS : Flow-driven posterior sampling for inverse problems. InProceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pp. 12328–12337, October 2025.

[30] Kingma, D. P. and Ba, J. Adam: A method for stochastic optimization. InInternational Conference on Learning Representations (ICLR) 2015,, 2015.

[31] Kingma, D. P. and Welling, M. Auto-encoding variational bayes.arXiv preprint arXiv:1312.6114, 2013.

[32] Lions, J. L.Optimal control of systems governed by partial differential equations, volume 170. Springer, 1971.

[33] Lipman, Y ., Chen, R. T. Q., Ben-Hamu, H., Nickel, M., and Le, M. Flow matching for generative modeling. InThe Eleventh International Conference on Learning Representations, 2023.

[34] Liu, Q. Rectified flow: A marginal preserving approach to optimal transport.arXiv preprint arXiv:2209.14577, 2022.

[35] Liu, X., Wu, L., Zhang, S., Gong, C., Ping, W., and Liu, Q. Flowgrad: Controlling the output of generative odes with gradients. InProceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 24335– 24344, 2023.

[36] Martin, S., Gagneux, A., Hagemann, P., and Steidl, G. Pnpflow: Plug-and-play image restoration with flow matching. InInternational Conference on Learning Representations (ICLR), 2025.

[37] Massaroli, S., Poli, M., Sonoda, S., Suzuki, T., Park, J., Yamashita, A., and Asama, H. Differentiable multiple shooting layers. In Beygelzimer, A., Dauphin, Y ., Liang, P., and Vaughan, J. W. (eds.),Advances in Neural Information Processing Systems, 2021.

[38] Menon, S., Damian, A., Hu, S., Ravi, N., and Rudin, C. Pulse: Self-supervised photo upsampling via latent space exploration of generative models. InProceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 2437–2445, 2020.

[39] Nikolova, M. A variational approach to remove outliers and impulse noise.Journal of Mathematical Imaging and Vision, 20(1):99–120, 2004.

[40] Nocedal, J. and Wright, S. J.Numerical optimization. Springer, 2006.

[41] Parikh, N., Boyd, S., et al. Proximal algorithms.Foundations and trends® in Optimization, 1(3):127–239, 2014.

[42] Patel, M., Wen, S., Metaxas, D. N., and Yang, Y . Flowchef: Steering of rectified flow models for controlled generations. InProceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pp. 15308–15318, October 2025.

[43] Pokle, A., Muckley, M. J., Chen, R. T. Q., and Karrer, B. Training-free linear image inverses via flows.Transactions on Machine Learning Research (TMLR), 2024.

[44] Poole, B., Jain, A., Barron, J. T., and Mildenhall, B. DreamFusion: Text-to-3d using 2d diffusion. InThe Eleventh International Conference on Learning Representations, 2023.

[45] Rezende, D. and Mohamed, S. Variational inference with normalizing flows. InInternational conference on machine learning, pp. 1530–1538. PMLR, 2015.

[46] Samuel, D., Ben-Ari, R., Darshan, N., Maron, H., and Chechik, G. Norm-guided latent space exploration for text-to-image generation.Advances in Neural Information Processing Systems, 36:57863–57875, 2023.

[47] Song, J., Meng, C., and Ermon, S. Denoising diffusion implicit models. InInternational Conference on Learning Representations, 2021a.

[48] Song, Y ., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., and Poole, B. Score-based generative modeling through stochastic differential equations. InInternational Conference on Learning Representations, 2021b.

[49] Tong, A., Fatras, K., Malkin, N., Huguet, G., Zhang, Y ., Rector-Brooks, J., Wolf, G., and Bengio, Y . Improving and generalizing flow-based generative models with minibatch optimal transport.arXiv preprint arXiv:2302.00482, 2023.

[50] Turan, E. M. and J ¨aschke, J. Training neural odes using multiple shooting: a benchmark on time series, 2021.

[51] Wang, H., Zhang, X., Li, T., Wan, Y ., Chen, T., and Sun, J. DMPlug: A plug-in method for solving inverse problems with diffusion models.Advances in Neural Information Processing Systems, 37:117881–117916, 2024a.

[52] Wang, L., Cheng, C., Liao, Y ., Qu, Y ., and Liu, G. Training free guided flow matching with optimal control, 2024b. arXiv:2410.18070 (revised 2025).

[53] Wang, Z., Bovik, A. C., Sheikh, H. R., and Simoncelli, E. P. Image quality assessment: from error visibility to structural similarity.IEEE transactions on image processing, 13(4):600–612, 2004.

[54] Wirsching, L., Ferreau, H. J., Bock, H. G., and Diehl, M. An online active set strategy for fast adjoint based nonlinear model predictive control.IFAC Proceedings Volumes, 40 (12):234–239, 2007.

[55] Wright, S., Nocedal, J., et al. Numerical optimization. Springer Science, 35(67-68):7, 1999.

[56] Yan, Y ., Zhang, Y ., Meng, X., and Zhao, Z. Fig: Flow with interpolant guidance for linear inverse problems. In International Conference on Learning Representations (ICLR), 2025.

[57] Yang, J., Shi, R., and Ni, B. Medmnist classification decathlon: A lightweight automl benchmark for medical image analysis. InIEEE 18th International Symposium on Biomedical Imaging (ISBI), pp. 191–195, 2021.

[58] Yang, J., Shi, R., Wei, D., Liu, Z., Zhao, L., Ke, B., Pfister, H., and Ni, B. Medmnist v2-a large-scale lightweight benchmark for 2d and 3d biomedical image classification. Scientific Data, 10(1):41, 2023.

[59] Yang, S., Luo, P., Loy, C.-C., and Tang, X. From facial parts responses to face detection: A deep learning approach. InProceedings of the IEEE international conference on computer vision, pp. 3676–3684, 2015.

[60] Zhang, Y ., Yu, P., Zhu, Y ., Chang, Y ., Gao, F., Wu, Y . N., and Leong, O. Flow priors for linear inverse problems via iterative corrupted trajectory matching.Advances in Neural Information Processing Systems, 37:57389– 57417, 2024.

[61] Zheng, Y ., Li, W., and Liu, Z. Integrating intermediate layer optimization and projected gradient descent for solving inverse problems with diffusion models. InForty-second International Conference on Machine Learning, 2025.

## 附录

### A 相关工作

**基于扩散模型的潜空间优化。** 近期工作利用扩散模型做 LSO 求解逆问题。BIRD（Chihaoui 等，2024）把该概念用于盲图像恢复，联合估计重建与（未知）退化算子参数；它使用确定性 DDIM（Song 等，2021a）采样方案并优化初始噪声输入，梯度直接沿 DDIM 采样反向传播，多数实验用 10 个采样步。DMPlug（Wang 等，2024a）提出类似框架，即优化初始潜编码使确定性 DDIM 采样器输出与测量一致；其实验用 3 个 DDIM 采样步参数化反向过程。两种方法的内存需求都像 D-Flow（Ben-Hamu 等，2024）一样随时间步缩放，见第 3.3 节。

**基于流的逆问题求解器。** 越来越多工作通过修改采样动力学以纳入数据一致性（而非重训模型），把预训练的流匹配与修正流模型用作逆问题的隐式先验。在线性逆问题设定中，Pokle 等（2024）用预训练流模型提出免训练求解器，并给出有理论依据的加权与条件最优传输（OT）路径。更近期出现了专用于流匹配的引导方案：Yan 等（2025）引入插值引导（FIG），用测量插值引导反向时间采样；Kim 等（2025）把后验采样思想用于流，通过将流 ODE 分解为干净/噪声分量（流版本的 Tweedie 关系）并注入似然梯度与随机性来从后验采样（Chung 等，2023）。与基于引导的后验采样互补，即插即用混合方法也被探索：Martin 等（2025）定义由预训练流匹配模型诱导的时变去噪器，并沿学习路径交替进行数据保真更新与投影/去噪。最后，条件与可逆建模在逆问题中有更久历史：Ardizzone 等（2019）用条件可逆神经网络表示逆映射与不确定性，说明任务特定条件训练与固定无条件先验测试时推断之间的折中。

**生成流的引导与最优控制。** 在逆问题之外，若干工作把基于 ODE 的生成器的**受控生成**表述为测试时轨迹优化，常通过对采样器求导实现。Liu 等（2023）展示如何把引导梯度反向传播到生成 ODE 的中间时刻，从而无需重训实现可控生成；Ben-Hamu 等（2024）（D-Flow）通过对流采样器求导来优化生成样本上的控制目标。Patel 等（2025）为修正流模型提出无梯度引导与反演策略，并展示线性逆问题与编辑等应用。从最优控制视角，Wang 等（2024b）提出由最优控制导出的免训练引导流匹配框架，把反向传播 ODE 的引导解释为特例，并给出引导生成算法。

**机器学习中的多次打靶/单次打靶。** 单次打靶是神经 ODE 与生成流的默认做法：优化参数（可能还有初始潜变量），并用整个时间跨度的一次前向求解强制动力学（Chen 等，2018）；长时程、刚性动力学或强引导项造成急剧瞬变时可能数值不稳定。多次打靶这一来自最优控制的经典补救（Bock & Plitt，1984）引入中间状态作为优化变量，并施加段间连续性约束，改善稳定性并支持时间并行。在现代机器学习中，Massaroli 等（2021）把可微多次打靶层形式化为带可并行求根的隐式模型，Turan & Jäschke（2021）在时间序列基准上研究神经 ODE 的多次打靶训练。我们的方法与该视角一致：把生成轨迹拆成段并施加（软）连续性，以一个更大但条件更好的优化换取鲁棒性。近期提出的 DRIP 框架（Eliasof 等，2023）也实现了与算法 2 类似的反向扫描；但我们使用固定的预训练流模型，而 DRIP 还学习底层动力学。

**中间层优化（ILO）。** 先前工作把中间状态优化作为端到端反向传播的替代。Daras 等（2021）提出逐层优化方案：不在整个网络上传播梯度，而按中间层（或状态）顺序优化，从输出层开始向输入层反向推进。该思想近期被扩展到扩散模型中的 DMILO（Zheng 等，2025），按顺序优化中间 DDIM 状态。ILO 与我们的多次打靶变体有显著差异：DMILO 需要顺序优化中间 DDIM 状态，而我们 MS-Flow 联合优化整条轨迹；此外我们的 JFB 变体完全消除对扩散步的反向传播需求，得到完全免反传的优化流程。

### B 数值细节

**B.1 显式 Euler 离散。** 算法 2 中用 $F_{k,k+1}(x_k)$ 表示从 $t_k$ 到 $t_{k+1}$、以 $x_k$ 为起点的动力学积分，可用单步显式 Euler 实现（$\Delta_k=t_{k+1}-t_k$）：

$$
F^{\mathrm{EE}}_{k+1,k}(x):=x+\Delta_kv_\theta(x,t_k). \tag{16}
$$

因此按函数评估次数（NFE）计每步只需 1 次 NFE，而 D-Flow 常用的中点离散每步需 2 次 NFE。代入式 (11) 的轨迹损失得

$$
J^{\mathrm{EE}}(x_0,\ldots,x_K):=\frac{\alpha}{2}\left\|x_\ast^i-x_K\right\|^2+\lambda R(x_0)+\frac{\gamma}{2}\sum_{k=1}^{K}\left\|x_k-\left[x_{k-1}+\Delta_{k-1}v_\theta(x_{k-1},t_{k-1})\right]\right\|^2. \tag{17}
$$

按第 3.2 节的坐标式反向扫描，需对 $k=K-1,\ldots,1$ 求解

$$
\tilde x_k=\arg\min_u\ J_k(u):=\frac{\gamma}{2}\left\|u-z_k\right\|_2^2+\frac{\gamma}{2}\left\|\tilde x_{k+1}-\left(u+\Delta_kv_\theta(u,t_k)\right)\right\|^2 \tag{18}
$$

其中 $z_k=F^{\mathrm{EE}}_{k-1,k}(x_{k-1})$。梯度为

$$
\nabla_uJ_k(u)=(u-z_k)-\left(I+\Delta_kJ_{v_\theta}(u)\right)^\top\left(\tilde x_{k+1}-\left(u+\Delta_kv_\theta(u,t_k)\right)\right), \tag{19}
$$

其中 $\tilde x_{k+1}$ 是 $J_{k+1}$ 的极小点。直接计算该梯度需一次流模型反向传播；但实验中我们观察到可近似 $I+\Delta t_kJ_{v_\theta}\approx I$（扩散模型中忽略模型 Jacobian 相当常见，见 Poole 等（2023）），且当 $\Delta t_k\approx0$（增加打靶点数）时该近似更好。由此得到无 Jacobian 梯度代理

$$
\nabla_uJ_k(u)\approx(u-z_k)-\left(\tilde x_{k+1}-\left(u+\Delta_kv_\theta(u,t_k)\right)\right),
$$

数值上仍给出稳定收敛。

**B.2 轨迹优化。** 全部中间控制点的梯度为

$$
\nabla_{x_K}J=-\alpha\left(x_\ast^i-x_K\right)+\gamma\left(x_K-F_{k-1,k}(x_{k-1})\right), \tag{20}
$$

$$
\nabla_{x_k}J=-\gamma J_{F_{k,k+1}}(x_k)^\top\left(x_{k+1}-F_{k,k+1}(x_k)\right)+\gamma\left(x_k-F_{k-1,k}(x_{k-1})\right),\quad k=1,\ldots,K-1, \tag{21}
$$

$$
\nabla_{x_0}J=-\gamma J_{F_{0,1}}(x_0)^\top\left(x_1-F_{0,1}(x_0)\right)+\gamma\nabla R(x_0). \tag{22}
$$

给定轨迹 $\{x_0^{(\ell-1)},\ldots,x_K^{(\ell-1)}\}$ 与步长 $\eta$：1）**更新终端打靶点：** $\nabla_{x_K}J=-\alpha(x_\ast^i-x_K)+\gamma(x_K-F_{K-1,K}(x_{K-1}^{(\ell-1)}))$，更新规则为

$$
x_K^{(\ell)}\leftarrow x_K^{(\ell-1)}-\eta\cdot\nabla_{x_K}J\left(x_K^{(\ell-1)},x_{K-1}^{(\ell-1)}\right); \tag{23}
$$

2）**中间打靶点的反向扫描：** 对 $k=K-1,K-2,\ldots,1$，$\nabla_{x_k}J=-\gamma J_{F_{k,k+1}}(x_k)^\top(x_{k+1}^{(\ell)}-F_{k,k+1}(x_k))+\gamma(x_k-F_{k-1,k}(x_{k-1}^{(\ell-1)}))$，更新规则为

$$
x_k^{(\ell)}\leftarrow x_k^{(\ell-1)}-\eta\cdot\nabla_{x_k}J\left(x_k^{(\ell-1)},x_{k-1}^{(\ell-1)},x_{k+1}^{(\ell)}\right); \tag{24}
$$

3）**更新初始打靶点：** 用新算得的 $x_1^{(\ell)}$ 并含正则梯度 $\nabla R(x_0)$：$\nabla_{x_0}J=-\gamma J_{F_{0,1}}(x_0)^\top(x_1^{(\ell)}-F_{0,1}(x_0))+\lambda\nabla R(x_0)$，更新规则为

$$
x_0^{(\ell)}\leftarrow x_0^{(\ell-1)}-\eta\cdot\nabla_{x_0}J\left(x_0^{(\ell-1)},x_1^{(\ell)}\right). \tag{25}
$$

下一次迭代的轨迹为 $\{x_0^{(\ell)},\ldots,x_K^{(\ell)}\}$，重复直到收敛。算法 2 给出该过程。**算法 2　轨迹优化的单次坐标下降迭代**：输入初始轨迹 $(x_0^{\mathrm{old}},\ldots,x_K^{\mathrm{old}})$、目标状态 $x_\ast^i$、动力学 $F_{k-1,k}$、权重 $\alpha,\lambda,\gamma$、步长 $\eta$；先做**前向扫描**计算一致性目标 $z_k\leftarrow F_{k-1,k}(x_{k-1}^{\mathrm{old}})$（$k=1..K$），再从 $K$ 到 0 做**反向扫描**：$k=K$ 时用 $z_K$ 计算 $\nabla_{x_K}J$；$0<k<K$ 时用 $x_{k+1}^{\mathrm{new}}$ 与 $z_k$ 计算 $\nabla_{x_k}J$；$k=0$ 时用 $x_1^{\mathrm{new}}$ 计算 $\nabla_{x_0}J$；各步 $x_k^{\mathrm{new}}\leftarrow x_k^{\mathrm{old}}-\eta\nabla_{x_k}J$，最后输出更新后的轨迹。

### C MS-Flow 的详细复杂度分析

**C.1 单次打靶 D-Flow。** D-Flow 的一次梯度更新优化式 (6) 中 ODE 约束问题的初始状态 $x_0$，需要：(i) 对 $n_t$ 个离散步前向积分 ODE；(ii) 对整个求解器求导。用标准反向模式微分，每次迭代代价为 $\mathcal O(n_t(C_{\mathrm{fwd}}+C_{\mathrm{vjp}}))$，峰值内存为 $\mathcal O(n_tM_{\mathrm{net}})$（存储中间状态与网络激活）。伴随方法把内存降至 $\mathcal O(M_{\mathrm{net}})$，但引入额外反向 ODE 求解并增加实际耗时。

**C.2 多次打靶 MS-Flow。** 考虑算法 1 的一次外层迭代，聚焦式 (10a) 的轨迹更新。$L$ 次内层坐标下降扫描中，每次扫描包括：(i) 计算 $F_{k-1,k}(x_{k-1})$（$k=1..K$）的前向扫描；(ii) 仅用局部邻点更新块变量 $\{x_k\}$ 的反向扫描。对 $\Delta_k=t_{k+1}-t_k$ 的显式 Euler，转移映射为 $F_{k,k+1}(x)=x+\Delta_kv_\theta(x,t_k)$；评估全部 $F_{k,k+1}$ 需 $\mathcal O(KC_{\mathrm{fwd}})$。精确梯度更新额外需要计算 VJP $J_{F_{k,k+1}}(x_k)^\top v$，故一次扫描需 $\mathcal O(K(C_{\mathrm{fwd}}+C_{\mathrm{vjp}}))$，一次外层迭代需 $\mathcal O(LK(C_{\mathrm{fwd}}+C_{\mathrm{vjp}}))$。**无 Jacobian 更新：** 显式 Euler 的 Jacobian 为 $J_{F_{k,k+1}}(x)=I+\Delta_kJ_{v_\theta}(x,t_k)$；如正文所述省略 $J_{v_\theta}(x,t_k)$ 并用 $J_{F_{k,k+1}}(x)\approx I$，即消除 VJP 计算，此时一次扫描代价为 $\mathcal O(KC_{\mathrm{fwd}})$。**内存缩放：** MS-Flow 存储显式轨迹变量 $\{x_k\}_{k=0}^K$，需 $\mathcal O(Kn)$ 内存——与大多数网络的激活相比可忽略，因为参数量常比输入维数大数个数量级。关键在于梯度只依赖局部段，完整计算图永不被物化；由此峰值激活内存为 $\mathcal O(M_{\mathrm{net}})$、与 $K$ 无关（图 1 经验验证）。

### D 假设与证明

**假设 D.1（块 Gauss–Seidel 下降的正则性）。** 对固定外层迭代 $x_\ast^i$，假设：1. $J_i$ 在 $\mathbb R^{n(K+1)}$ 上有下界；2. $J_i$ 连续可微；3. **块 Lipschitz 梯度：** 对每个 $k\in\{0,\ldots,K\}$ 存在 $L_k>0$，使对任意向量 $u,v\in\mathbb R^n$ 与固定的其他块，$\|\nabla_{x_k}J_i(\ldots,u,\ldots)-\nabla_{x_k}J_i(\ldots,v,\ldots)\|_2\le L_k\|u-v\|_2$；4. 步长满足 $0<\eta_k\le1/L_k$（或由回溯线搜索选择以保证充分下降）。

**命题 4.1 的证明（要点）。** 固定外层 $x_\ast^i$，考虑内层目标 $J_i$ 与第 $\ell$ 次 Gauss–Seidel 扫描，定义扫描内的中间迭代点 $X^{(\ell,K)}:=X^{(\ell-1)}$、$X^{(\ell,-1)}:=X^{(\ell)}$，并令 $X^{(\ell,k)}$ 为式 (15) 中块 $k$ 更新前的迭代点、$X^{(\ell,k-1)}$ 为更新后的点。**第一步：单块更新的下降。** 固定 $\ell,k$，定义单块函数 $\varphi_k(u):=J_i(x_0^{(\ell-1)},\ldots,x_{k-1}^{(\ell-1)},u,x_{k+1}^{(\ell)},\ldots,x_K^{(\ell)})$。由假设 D.1(3)，$\nabla\varphi_k$ 为 $L_k$-Lipschitz，式 (15) 正是 $\varphi_k$ 上的梯度步。由 $L_k$-光滑函数的下降引理，对任意 $y$ 有 $\varphi_k(y)\le\varphi_k(x)+\langle\nabla\varphi_k(x),y-x\rangle+\frac{L_k}{2}\|y-x\|_2^2$；取 $x=x_k^{(\ell-1)}$、$y=x_k^{(\ell)}=x-\eta_k\nabla\varphi_k(x)$ 得

$$
\varphi_k\left(x_k^{(\ell)}\right)\le\varphi_k\left(x_k^{(\ell-1)}\right)-\left(\frac{1}{\eta_k}-\frac{L_k}{2}\right)\left\|x_k^{(\ell)}-x_k^{(\ell-1)}\right\|_2^2,
$$

其中用到 $x_k^{(\ell)}-x_k^{(\ell-1)}=-\eta_k\nabla\varphi_k(x_k^{(\ell-1)})$。回到 $J_i$ 即

$$
J_i\left(X^{(\ell,k-1)}\right)\le J_i\left(X^{(\ell,k)}\right)-c_k\left\|x_k^{(\ell)}-x_k^{(\ell-1)}\right\|_2^2, \tag{26}
$$

其中 $c_k:=\frac{1}{\eta_k}-\frac{L_k}{2}>0$。**第二步：单调下降与平方可和步长。** 对 $k=K,K-1,\ldots,0$ 求和式 (26) 即望远镜式地得到

$$
J_i\left(X^{(\ell)}\right)\le J_i\left(X^{(\ell-1)}\right)-\sum_{k=0}^{K}c_k\left\|x_k^{(\ell)}-x_k^{(\ell-1)}\right\|_2^2. \tag{27}
$$

这蕴含单调下降，即第 (1) 项。又由假设 D.1(1)，$J_i$ 有下界，对 $\ell=1,2,\ldots,T$ 求和式 (27) 并令 $T\to\infty$ 得 $\sum_{\ell\ge1}\sum_{k=0}^{K}c_k\|x_k^{(\ell)}-x_k^{(\ell-1)}\|_2^2\le J_i(X^{(0)})-\inf J_i<\infty$；因每个 $c_k>0$，即得第 (2) 项。第 (3) 项由标准论证：有界迭代的任意聚点处步长消逝且梯度连续，故 $\nabla J_i(\bar X)=0$。■

### E 实验设置

**E.1 计算机断层成像。** OrganCMNIST 数据集（Yang 等，2021；2023）含 23,582 张 64×64 腹部 CT 图像，分为 12,975 张训练、2,392 张验证与 8,216 张测试。采用仿射流路径 $x_t=(1-t)x_0+tx_1$，用约 8M 参数的时变 UNet（Dhariwal & Nichol，2021）参数化流。对 D-Flow 与 MS-Flow，$x_0$ 的初始估计按 Ben-Hamu 等（2024）计算：$x_0=\sqrt\beta w(0)+\sqrt{1-\beta}z$，其中 $z\sim\mathcal N(0,I)$、$w(0)=w+\int_0^1v_\theta(w(t),t)$、$w$ 为由观测数据 $y$ 计算的滤波反投影。对 MS-Flow，先用以显式 Euler 离散的流 $v_\theta$ 传播 $x_0$，再在 $x_0$ 与该轨迹端点之间线性插值——这样轨迹一致性损失在起点不为零；初始 $x_\ast$ 取该轨迹端点。表 2 的平均运行时间在同一台单卡 NVIDIA GeForce RTX 5090 GPU 上测得。**图 6：** OrganCMNIST 示例重建（第一行滤波反投影基线，第二行 MS-Flow 重建，第三行真值）。

**E.2 图像恢复。** CelebA 数据集（Yang 等，2015）含 20 万余张图像、缩放至 128×128；流模型使用来自 https://github.com/annegnx/PnP-Flow 的预训练模型。所有方法的参数在一小批测试图像上调优，质量指标在验证集前 50 张图像上评估。

**表 5　各图像恢复任务的超参数设置**（Flow-Prior 给 $(\eta,\lambda)$；OT-ODE 给 $(t_0,\gamma)$；PnP-Flow 给 $\alpha$；D-Flow 给 $(n_t,\lambda)$；MS-Flow 给 $(n_t,L,\gamma,\alpha,\eta,\lambda)$）

| 方法 | CT | 超分辨 | 高斯去模糊 | 盒修复 |
|---|---|---|---|---|
| Flow-Priors | – | (0.01, 1e4) | (0.01, 1e4) | (0.01, 1e4) |
| OT-ODE | – | (0.2, constant) | (0.4, $\sqrt t$) | (0.1, $\sqrt t$) |
| PnP-Flow | – | (0.01) | (0.01) | (0.01) |
| D-Flow | (3, 0.05) | (3, 0.05) | (3, 1) | (3, 1) |
| MS-Flow | (6, 1, 0.01, 0.1, 5, 0.0001) | (6, 5, 0.01, 0.1, 5, 0.0001) | (6, 1, 0.01, 0.1, 5, 0.0001) | (12, 1, 0.01, 1, 5, 0.000) |

对 D-Flow 与 MS-Flow，$x_0$ 的初始估计同样按 Ben-Hamu 等（2024）计算，其中 $w$ 依任务由观测数据计算（高斯去模糊取含噪观测 $y$；超分辨取 $y$ 经前向算子伴随；盒修复取随机图像）。初始轨迹与初始 $x_\ast$ 的计算方式同 CT。Flow-Prior（Zhang 等，2024）考虑步长 $\eta$ 与数据一致性权重 $\lambda$，在 $\eta\in\{0.001,0.01,0.1\}$、$\lambda\in\{1\times10^2,1\times10^3,1\times10^4,1\times10^5\}$ 上网格搜索，用 $N=100$ 个离散步。OT-ODE（Pokle 等，2024）考虑初始时间 $t_0$ 与学习率类型 $\gamma$，在 $t_0\in\{0.1,0.2,0.3,0.4\}$、$\gamma\in\{\text{constant},\sqrt t\}$ 上网格搜索，同样 $N=100$。PnP-Flow（Martin 等，2025）考虑学习率指数 $\alpha$，在 $\{0.01,0.1,0.3,0.5,0.8,1.0\}$ 上搜索，用 $N=100$ 并遵循原文每步取 5 次流场评估的平均。

**E.3 更多结果。** 表 6 研究 D-Flow 与 MS-Flow 沿优化轨迹的稳定性：比较优化轨迹上的平均最高 PSNR 与收敛轨迹（最后一次迭代）的平均 PSNR。如前所述，D-Flow 常显示相当高的最高 PSNR，但随后易过拟合并退化；相比之下 MS-Flow 表现稳定，最高 PSNR 与收敛图像 PSNR 差异很小。

**表 6　CelebA 重建质量比较：D-Flow 与 MS-Flow（优化过程中的最高 PSNR 与收敛图像 PSNR）**

| 任务 | 方法 | 收敛 PSNR↑ | 最高 PSNR↑ | 收敛 SSIM↑ | 最高 SSIM↑ |
|---|---|---|---|---|---|
| 盒修复 | D-Flow | 33.96 | 35.84 | 0.9792 | 0.9736 |
| 盒修复 | MS-Flow | 36.30 | 36.46 | 0.9799 | 0.9800 |
| 超分辨 | D-Flow | 34.67 | 34.69 | 0.9314 | 0.9322 |
| 超分辨 | MS-Flow | 36.46 | 36.46 | 0.9570 | 0.9570 |
| 高斯去模糊 | D-Flow | 33.48 | 34.66 | 0.8696 | 0.9102 |
| 高斯去模糊 | MS-Flow | 38.02 | 38.40 | 0.9587 | 0.9636 |

**图 7：** 上：打靶点初始化；下：优化后收敛的打靶点（高斯去模糊，连同测量与真值图像）。**图 8：** 同上（超分辨）。**图 6：** OrganCMNIST 示例重建（见 E.1）。

### F 应用于潜流模型

在潜流模型中，流动力学定义在潜空间。记图像空间为 $\mathcal X$、潜空间为 $\mathcal Z$，编码器 $E:\mathcal X\to\mathcal Z$、解码器 $D:\mathcal Z\to\mathcal X$，训练好的流模型 $v_\theta:\mathcal Z\times[0,1]\to\mathcal Z$ 只在潜空间作用。样本生成由

$$
\frac{\mathrm dz}{\mathrm dt}=v_\theta(z,t),\quad t\in[0,1],\qquad z(0)=z_0, \tag{28}
$$

给出，最终样本 $x=D(z(1))$：动力学完全在潜空间，只在最后一步解码回图像空间。对 Latent MS-Flow，我们引入潜控制点 $\{z_0,\ldots,z_K\}$（$0=t_0<\cdots<t_K=1$）与潜空间终端变量 $z_\ast$，增广目标为

$$
Z^{i+1}=\arg\min_{[z_0,\ldots,z_K]}\ \frac{\alpha}{2}\left\|z_\ast^i-z_K\right\|^2+\lambda R(z_0)+\frac{\gamma}{2}\sum_{k=1}^{K}\left\|z_k-F_{k-1,k}(z_{k-1})\right\|^2 \tag{30a}
$$

$$
z_\ast^{i+1}=\arg\min_{z_\ast}\ \Phi\left(D(z_\ast)\right)+\frac{\alpha}{2}\left\|z_\ast-z_K^{i+1}\right\|^2. \tag{30b}
$$

由于终端损失 $\Phi$ 通常在图像空间定义，数据一致性步需要解码器的反向传播（式 (30a) 与式 (30b) 并列）。

**F.1 实现细节。** Stable Diffusion 3.5 通过无分类器引导（CFG）（Ho & Salimans，2022）训练；FlowDPS（Kim 等，2025）与 MS-Flow 均用 CFG 权重 2.0、条件文本提示"a high quality image of a face."。MS-Flow 把 $z_\ast^0$ 初始化为零向量，并把打靶点 $[z_0,\ldots,z_K]$ 初始化为 $z_0\sim\mathcal N(0,I)$ 与 $z_\ast^0$ 之间的线性插值；取 $K=29$ 个打靶点（Stable Diffusion 3.5 常用的积分步数），内层步数 10、交替极小化共 25 步，$\alpha=\gamma=0.06$。

### G 与 MAP 估计的联系

我们从优化（多次打靶）视角为 MS-Flow 目标提供动机；但同一目标也可由联合后验上的 MAP 估计得到。考虑轨迹 $x_{0:K}=(x_0,\ldots,x_K)$ 与流动力学 $x_k=F_{k-1,k}(x_{k-1})$，用局部高斯惩罚放松动力学：$p(x_k\mid x_{k-1})=\mathcal N(x_k;F_{k-1,k}(x_{k-1}),\gamma^{-1}I)$；再假设 $p(x_\ast\mid x_K)=\mathcal N(x_\ast\mid x_K,\alpha^{-1}I)$ 与 $p(x_\ast\mid x_{0:K})=p(x_\ast\mid x_K)$。则联合密度为

$$
p\left(x_\ast,x_{0:K}\mid y\right)\propto\exp\left(-\Phi(x_\ast;y)\right)\exp\left(-\frac{\alpha}{2}\left\|x_\ast-x_K\right\|^2\right)\exp\left(-\lambda R(x_0)\right)\prod_{k=1}^{K}\exp\left(-\frac{\gamma}{2}\left\|x_k-F_{k-1,k}(x_{k-1})\right\|^2\right), \tag{31}
$$

取负对数似然恰给出 MS-Flow 目标 (7)：

$$
\arg\min_{x_\ast,x_{0:K}}-\log p\left(x_\ast,x_{0:K}\mid y\right)=\arg\min_{x_\ast,x_{0:K}}\left\{\Phi(x_\ast;y)+\frac{\alpha}{2}\left\|x_\ast-x_K\right\|^2+\lambda R(x_0)+\frac{\gamma}{2}\sum_{k=1}^{K}\left\|x_k-F_{k-1,k}(x_{k-1})\right\|^2\right\}. \tag{32}
$$

**推广到扩散模型。** 该视角自然推广到扩散模型（Ho 等，2020）：与确定性的流动力学不同，扩散模型定义逐步把数据映射到简单潜分布的随机前向过程。注意扩散模型的通常记号反转了时间方向，即 $\tilde x_0$ 表示干净数据、$\tilde x_K$ 表示潜变量（下文用 $\tilde x$ 表示扩散状态）。对噪声调度 $\{\beta_k\}_{k=1}^K$，前向过程为马尔可夫链

$$
q\left(\tilde x_k\mid\tilde x_{k-1}\right)=\mathcal N\left(\tilde x_k;\sqrt{1-\beta_k}\,\tilde x_{k-1},\beta_kI\right), \tag{33}
$$

相应学习的反向过程参数化为

$$
p_\theta\left(\tilde x_{k-1}\mid\tilde x_k\right)=\mathcal N\left(\tilde x_{k-1};\mu_\theta(\tilde x_k,k),\sigma_k^2I\right), \tag{34}
$$

其中 $\mu_\theta$ 由训练好的扩散模型参数化，诱导从 $\tilde x_K\sim\mathcal N(0,I)$ 出发的生成轨迹。考虑整条反向时间扩散轨迹上的提升后验：

$$
p_\theta\left(x_\ast,\tilde x_{0:K}\mid y\right)\propto\exp\left(-\Phi(x_\ast;y)\right)\exp\left(-\frac{\alpha}{2}\left\|x_\ast-\tilde x_K\right\|^2\right)\exp\left(-\lambda R(\tilde x_K)\right)\prod_{k=1}^{K}p_\theta\left(\tilde x_{k-1}\mid\tilde x_k\right), \tag{35}
$$

在与上述类似的假设（$p(x_\ast\mid\tilde x_0)=\mathcal N(x_\ast\mid\tilde x_0,\alpha^{-1}I)$、$p(x_\ast\mid\tilde x_{0:K})=p(x_\ast\mid\tilde x_0)$）下，取负对数得到整条扩散轨迹上的 MAP 目标：

$$
\arg\min_{x_\ast,\tilde x_{0:K}}-\log p\left(x_\ast,\tilde x_{0:K}\mid y\right)=\arg\min_{x_\ast,\tilde x_{0:K}}\left\{\Phi(x_\ast;y)+\frac{\alpha}{2}\left\|x_\ast-\tilde x_0\right\|^2+\lambda R(\tilde x_K)+\sum_{k=1}^{K}\frac{1}{2\sigma_k^2}\left\|\tilde x_{k-1}-\mu_\theta(\tilde x_k,k)\right\|^2\right\}. \tag{36}
$$

### H 椒盐噪声

考虑椒盐噪声，以突出 MS-Flow 对非光滑凸目标函数的适用性。噪声模型为：$y_i^\delta=y_i$ 以概率 $1-p$、$y_i^\delta=0$ 以概率 $p/2$、$y_i^\delta=1$ 以概率 $p/2$；相应数据保真项用 $\ell_1$ 范数替代均方误差，D-Flow 用反向传播处理（与 $\ell_2$ 情形相同），MS-Flow 用线性化 ADMM（附录 I 讨论，等于数据保真项的近端算子）。前向算子取核尺寸 15、强度 $\sigma=1.5$ 的高斯模糊，考虑低噪声（$p=0.05$）与高噪声（$p=0.1$）两种情形。表 7 表明 MS-Flow 在此设定下显著优于 D-Flow，显示其对高噪声与不可微正则的鲁棒性。

**表 7　椒盐噪声下的重建质量（CelebA 高斯去模糊，D-Flow 与 MS-Flow 比较）**

| 任务 | 方法 | PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|
| 低噪声（$p=0.05$） | D-Flow | 33.26 | 0.927 | 0.042 |
| 低噪声（$p=0.05$） | MS-Flow | **37.33** | **0.957** | **0.013** |
| 高噪声（$p=0.1$） | D-Flow | 28.84 | 0.846 | **0.074** |
| 高噪声（$p=0.1$） | MS-Flow | **30.23** | **0.857** | 0.094 |

### I MS-Flow 的 ADMM 形式

我们给出求解 MS-Flow 目标的另一种方法：不用式 (7) 的分裂，而引入 ADMM 分裂。先离散式 (6) 的 ODE，得到约束优化问题

$$
\arg\min_{x_0}\ \Phi(x_K)+R(x_0)\quad\text{s.t.}\quad x_{k+1}=x_k+\Delta tv_\theta(x_k,t_k),\ k=0,\ldots,K-1, \tag{37}
$$

这里为简使用 Euler 离散（其他选择亦可）。再引入额外变量 $x_\ast$：

$$
\arg\min_{x_\ast,x_{0:K}}\ \Phi(x_\ast)+R(x_0),\quad\text{s.t.}\quad x_\ast-x_K=0,\quad c_k(x_{0:K}):=x_{k+1}-x_k-\Delta tv_\theta(x_k,t_k)=0,\ k=0,\ldots,K-1. \tag{38}
$$

定义增广拉格朗日

$$
\mathcal L_{\gamma,\alpha}\left(x_\ast,x_{0:K},\lambda_{0:K-1},p\right)=\Phi(x_\ast)+R(x_0)+\sum_{k=0}^{K-1}\lambda_k^\top c_k(x_{0:K})+\frac{\gamma}{2}\sum_{k=0}^{K-1}\left\|c_k(x_{0:K})\right\|^2+p^\top\left(x_\ast-x_K\right)+\frac{\alpha}{2}\left\|x_\ast-x_K\right\|^2. \tag{39}
$$

采用交替极小化：先对 $x_\ast$ 更新，再对轨迹 $x_{0:K}$ 更新，最后对偶参数 $\lambda_{0:K-1}$ 与 $p$ 更新；$\gamma$ 与 $\alpha$ 为罚参数，可按 Boyd 等（2011）第 3.4.1 节的规则自动设置。**$x_\ast$ 更新：** 求解 $x_\ast^{(n+1)}=\arg\min_{x_\ast}\Phi(x_\ast)+p^{(n)\top}(x_\ast-x_K^{(n)})+\frac{\alpha}{2}\|x_\ast-x_K^{(n)}\|^2=\arg\min_{x_\ast}\Phi(x_\ast)+\frac{\alpha}{2}\|x_\ast-(x_K^{(n)}-\frac{1}{\alpha}p^{(n)})\|^2=\mathrm{prox}_{\Phi/\alpha}(x_K^{(n)}-\frac{1}{\alpha}p^{(n)})$。**$x_{0:K}$ 更新：** 轨迹约束在该步，求解

$$
\min_{x_{0:K}}\ R(x_0)+\sum_{k=0}^{K-1}\lambda_k^{(n)\top}c_k(x_{0:K})+\frac{\gamma}{2}\sum_{k=0}^{K-1}\left\|c_k(x_{0:K})\right\|^2-p^{(n)\top}x_K+\frac{\alpha}{2}\left\|x_\ast^{(n+1)}-x_K\right\|^2, \tag{40}
$$

可写为

$$
\min_{x_{0:K}}\ R(x_0)+\sum_{k=0}^{K-1}\lambda_k^{(n)\top}c_k(x_{0:K})+\frac{\gamma}{2}\sum_{k=0}^{K-1}\left\|c_k(x_{0:K})\right\|^2+\frac{\alpha}{2}\left\|x_K-\left(x_\ast^{(n+1)}+\frac{1}{\alpha}p^{(n)}\right)\right\|^2. \tag{41}
$$

对 $k=K$ 得到 $\min_{x_K}\lambda_{K-1}^{(n)\top}c_{K-1}(x_{0:K})+\frac{\gamma}{2}\|c_{K-1}(x_{0:K})\|^2+\frac{\alpha}{2}\|x_K-(x_\ast^{(n+1)}+\frac{1}{\alpha}p^{(n)})\|^2$；对 $0<k<K$ 得到相应的局部子问题（原文式 (48) 后的推导）；对偶更新为 $\lambda_k^{(n+1)}=\lambda_k^{(n)}+\gamma c_k(x_{0:K}^{(n+1)})$、$p^{(n+1)}=p^{(n)}+\alpha(x_\ast^{(n+1)}-x_K^{(n+1)})$。该 ADMM 视角与算法 1 的交替极小化互为补充。

### J 消融：内迭代次数与 PSNR

表 8 比较 CelebA 盒修复上 D-Flow 与 MS-Flow 在不同内层迭代次数下的重建质量，说明少量内层迭代即可取得良好性能（与第 5.1 节的观察一致）。

**表 8　盒修复（CelebA）重建质量随内层迭代次数的变化（D-Flow 与 MS-Flow）**

| 方法/内迭代 | PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|
| D-Flow | 33.96 | 0.9792 | 0.0240 |
| MS-Flow（$L=1$） | **36.30** | **0.9799** | **0.0120** |
| MS-Flow（$L=2$） | 36.30 | 0.9799 | 0.0120 |
| MS-Flow（$L=5$） | 36.30 | 0.9799 | 0.0120 |

## 图注与表注

**图 1：** CelebA 上欧拉离散 ODE 时 D-Flow 与 MS-Flow（本文）的峰值 GPU 内存；D-Flow 随时间步数线性增长，MS-Flow 保持常数。

**图 2：** OrganCMNIST 稀疏角度 CT 评估：(a) 正则项影响；(b) 不同时间分辨率下 MS-Flow 与 D-Flow 比较；阴影为 10 张图像上的标准差。

**图 3：** 式 (11) 轨迹损失在坐标下降（含/不含无 Jacobian 近似）与全梯度下降下的收敛。

**图 4：** CelebA 上三个图像恢复任务的重建比较（第一行高斯去模糊、第二行修复、第三行超分辨）；各列依次为真值、观测数据、Flow-Prior、OT-ODE、PnP-Flow、D-Flow、MS-Flow（本文）。

**图 5：** FFHQ 上 $\sigma_{\mathrm{noise}}=0.01$ 的高斯去模糊重建（真值、观测数据、FlowDPS、FLAIR、MS-Flow）。

**图 6：** OrganCMNIST 示例重建（第一行滤波反投影基线，第二行 MS-Flow，第三行真值）。

**图 7：** 高斯去模糊的打靶点初始化（上）与优化后收敛的打靶点（下），连同测量与真值图像。

**图 8：** 超分辨的打靶点初始化（上）与优化后收敛的打靶点（下），连同测量与真值图像。

**表 1–8：** 见正文与附录各表（表 1 复杂度、表 2 计算时间、表 3 三任务定量比较、表 4 FFHQ 潜流比较、表 5 超参数设置、表 6 稳定性、表 7 椒盐噪声、表 8 内迭代消融）。表 3、表 4 已用 PDF 第 7、8 页渲染图逐格核对；表 1、表 2、表 5–8 依据抽取文本转录（数值结构与原文一致）。

> **原文说明（疑点加注）：** ① 正文第 2.2 节末段与第 3.3 节将方法称作"multiple shooting"，但摘要与引言中亦写作"multiple-shooting framework"（连字符形式不统一），属原文术语排版差异；② 第 5.2 节称超分辨为"bicubic interpolation with scale factor 2"、而表 3 同时列有 2× 与 4× 两列，原文对该段实验的放大倍数表述与表格存在轻微不对应（4× 结果未在该段文字中说明）；③ 附录 D 中命题 4.1 的证明引用"Assumption D.1(3)"，而正文命题 4.1 仅写"regularity assumption (Assumption D.1)"，假设编号与引用方式不完全一致；④ 附录 I 的 ADMM 形式与正文交替极小化（算法 1）为两种不同分裂，原文未讨论二者数值等价性。以上均如实标注，未改动原文数值。

**本页范围与校对状态：** 本页为 arXiv:2602.08538v2（ICML 2026）的全文中文译稿：摘要、正文第 1–7 节（含 2.1–2.2、3.1–3.3、4.1–4.2、5.1–5.2、6、7）、致谢与影响声明、附录 A–J、图 1–8 图注、表 1–8、算法 1–2、参考文献 61 条。公式编号沿用原文 (1)–(48) 中已译出的部分（(1)–(36) 全部译入，(37)–(48) 的 ADMM 推导按原文结构译出主要式子）；附录 D 的证明按原文结构译出关键步骤（(26)–(27) 逐式译入），其余代数细节作忠实概述。**表 3、表 4 已用 PDF 第 7、8 页渲染图逐行逐格核对**；表 1、2、5–8 依据抽取文本转录（已在表注注明）。图内曲线与图像未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文存在 4 处术语/表述可商榷处，已在"原文说明（疑点加注）"中如实标出。作者 4 人已补全；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
