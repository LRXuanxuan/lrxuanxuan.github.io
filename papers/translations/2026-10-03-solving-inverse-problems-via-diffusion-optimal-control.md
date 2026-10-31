---
layout: page
title: "通过扩散最优控制求解逆问题｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-03-solving-inverse-problems-via-diffusion-optimal-control/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/95e5fd12e73da284/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 通过扩散最优控制求解逆问题

> **许可与使用范围说明：** 原文为 NeurIPS 2024 会议论文集版本，**再传播许可待核验**；本页仅为**学习用途**的中文译稿，**不计入本站「可公开全文」统计**，也不作为正式译文对外发布。如后续确认许可，再按站点流程更新。

**原题：** Solving Inverse Problems via Diffusion Optimal Control  
**作者：** Henry Li（耶鲁大学；部分工作在 Bosch AI 实习期间完成）、Marcus Pereira（Bosch 人工智能中心）  
**版本：** NeurIPS 2024（第 38 届神经信息处理系统大会）会议论文集版本，本地 PDF 23 页（含附录与 NeurIPS 论文检查表）。  
**范围与状态：** 全文中文译稿：摘要、正文第 1—7 节、致谢/基金说明、参考文献（英文原条目）、附录 A—D 与 NeurIPS 论文检查表、图 1—图 6 图注、表 1—表 6；逐句逐式终校未做。

## 摘要

现有基于扩散的逆问题求解器把信号恢复任务表述为**概率采样**过程，即从期望的后验分布中抽取解。该框架存在若干关键缺陷：条件似然函数**不可解**、**严格依赖**分数网络近似、$x_0$ 预测质量差。本文证明，把生成过程重新表述为**离散最优控制**问题即可绕开这些限制。本文受**迭代线性二次调节器（iLQR）**算法启发，推导出一个基于扩散的最优控制器。该框架完全通用，能处理任意**可微**的前向测量算子，包括超分辨率、修补（inpainting）、高斯去模糊、非线性去模糊，甚至高度非线性的神经分类器。此外，本文证明**理想化的后验采样方程**可作为该算法的一个**特例**被恢复。随后在多个神经逆问题求解器上评估本文方法，并在图像重建逆问题上建立了新的基线[^1]。

[^1]: 代码见 https://github.com/lihenryhfl/diffusion_optimal_control。

## 1 引言

扩散模型 Song and Ermon [2019]、Ho et al. [2020] 已被证明非常擅长条件生成任务 Dhariwal and Nichol [2021]、Ho and Salimans [2022]，部分原因在于其迭代采样算法：通过引入加性**引导项** $\mathbf u$，可把不受控先验分数函数 $\nabla_{\mathbf x}\log p_t(\mathbf x)$ 的动力学导向任意后验分布。当该引导项为条件分数 $\nabla_{\mathbf x}\log p_t(\mathbf y\mid\mathbf x)$ 时，所得样本可证明地抽自期望的条件分布 $p(\mathbf x\mid\mathbf y)$ Song et al. [2020]。

该框架的核心障碍是：条件分数函数 $\nabla_{\mathbf x}\log p_t(\mathbf y\mid\mathbf x_t)$ 一般很难获得，因为它依赖含噪扩散变量 $\mathbf x_t$ 而非仅最终样本 $\mathbf x_0$ Chung et al. [2023a]。在类条件或文本条件采样等大规模条件生成任务中，从头训练时变条件分数函数的计算开销被认为可以接受，Rombach et al. [2022]、Saharia et al. [2022] 等确实采用该方案；但在逆问题中，目标是为任意前向模型设计**零样本**通用求解器，该方案不可接受。

这一瓶颈催生了大量近期研究，尝试把条件分数 $\nabla_{\mathbf x}\log p_t(\mathbf y\mid\mathbf x_t)$ 近似为**无噪似然** $\log p(\mathbf y\mid\mathbf x_0)$ 的简单函数 Choi et al. [2021]、Chung et al. [2022]、Rout et al. [2024]、Chung et al. [2023a]、Kawar et al. [2022]、Chung et al. [2023b]。然而本文将表明，这些近似给算法性能带来**显著代价**。


为解决这些问题，本文从最优控制理论出发提出一个新框架，使上述近似不再必要。通过把反向扩散过程表述为**最优控制回合**，本文把逆问题求解器从 Song et al. [2020] 条件采样方程的严格要求中解放出来，同时仍利用无条件扩散过程异常强大的先验。此外，所需的分数函数直接**以价值函数的 Jacobian 形式出现**。本文贡献总结如下：

- 提出**扩散最优控制**——一个从最优控制理论视角、用预训练无条件现成扩散模型求解逆问题的框架。
- 证明该视角克服了现有基于扩散的逆问题求解器的许多核心障碍；特别地，Song et al. [2021] 的理想化后验采样分数（现有方法所近似者）可作为本文方法的一个**特例精确恢复**。
- 通过定量实验与定性示例展示模型的实证优势，并在 FFHQ $256\times256$ 数据集上展示**最先进性能**。

## 2 背景

**记号。** 小写字母表示标量 $a\in\mathbb R$，小写粗体表示向量 $\mathbf a\in\mathbb R^{n}$，大写粗体表示矩阵 $\mathbf A\in\mathbb R^{m\times n}$。下标表示标量函数的 Jacobian 与 Hessian，例如对 $l(\mathbf x):\mathbb R^{n}\to\mathbb R$，$l_{\mathbf x}\in\mathbb R^{n}$、$l_{\mathbf{xx}}\in\mathbb R^{n\times n}$。对时变变量重载记号：下标表示**依赖关系**而非对时间的导数，如 $\mathbf x_t=\mathbf x(t)$。此外，$V(\mathbf x_t)$ 与 $Q(\mathbf x_t,\mathbf u_t)$ 尽管大写，仍为标量函数，与现有最优控制文献 Betts [1998] 一致。

### 2.1 扩散模型

扩散建模文献用如下反向时间 Itô SDE 生成样本 Song et al. [2021]：

$$
\mathrm d\mathbf x_t=\left[\mathbf f(\mathbf x_t)-g(t)^{2}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)\right]\mathrm dt+g(t)\,\mathrm d\mathbf w_t,\tag{1}
$$

其中 $\mathbf x_t\in\mathbb R^{n}$ 为状态向量，$\mathbf f:\mathbb R^{n}\to\mathbb R^{n}$ 与 $g:\mathbb R\to\mathbb R$ 为漂移与扩散项（可取不同函数形式，如 Song et al. [2021] 的方差保持 SDE（VPSDE）与方差爆炸 SDE（VESDE）），$\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ 为分数函数，$\mathbf w_t\in\mathbb R^{n}$ 为相互独立的布朗运动向量。上述 SDE 有对应的 ODE，称为**概率流（PF）ODE**：

$$
\mathrm d\mathbf x_t=\left[\mathbf f(\mathbf x_t)-\frac{1}{2}g(t)^{2}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)\right]\mathrm dt,\tag{2}
$$

它与 SDE 具有相同边缘分布 $p_t(\mathbf x_t)$，因此可用于似然计算 [Song et al., 2021, Li et al., 2024]。所有实际扩散采样器实现都需要对 PF-ODE 做时间离散。一种常见离散是 Euler 离散：

$$
\mathbf x_{t-1}=\mathbf x_t-\left[\mathbf f(\mathbf x_t)-\frac{1}{2}g(t)^{2}\nabla_{\mathbf x}\log p_t(\mathbf x_t)\right]\Delta t,\tag{3}
$$

其中 $\Delta t$ 为离散区间长度，且通过改变漂移符号反转了时间演化。本文不限于 Euler 离散，也可采用任意高阶离散技术。更简洁地写作

$$
\mathbf x_{t-1}=h(\mathbf x_t),\qquad h:\mathbb R^{n}\to\mathbb R^{n},\tag{4}
$$

它描述了相应离散时间扩散采样器的一般非线性动力学。


### 2.2 逆问题的后验采样

逆问题是一类从正向测量过程所得观测重建未知信号的问题 Ongie et al. [2020]。前向过程通常**有损**，导致病态的信号恢复任务、解不存在唯一性。前向模型一般写作

$$
\mathbf y=\mathbf A(\mathbf x_0)+\boldsymbol\eta,\tag{5}
$$

其中 $\mathbf A:\mathbb R^{n}\to\mathbb R^{d}$ 为前向算子，$\mathbf y\in\mathbb R^{d}$ 为测量信号，$\mathbf x_0\in\mathbb R^{n}$ 为待恢复的未知信号，$\boldsymbol\eta\sim\mathcal N(\mathbf 0,\sigma\mathbf I_d)$ 为测量过程噪声（方差 $\sigma^{2}$）。给定前向模型 (5) 与测量 $\mathbf y$，从后验分布 $p_{\boldsymbol\theta}(\mathbf x\mid\mathbf y)$ 采样可通过求解相应条件 Itô SDE 完成：

$$
\mathrm d\mathbf x=\left[\mathbf f(\mathbf x)-g(t)^{2}\nabla_{\mathbf x}\log p_t(\mathbf x\mid\mathbf y)\right]\mathrm dt+g(t)\,\mathrm d\mathbf w,\tag{6}
$$

其中由 Bayes 法则

$$
\nabla_{\mathbf x}\log p_t(\mathbf x\mid\mathbf y)=\nabla_{\mathbf x}\log p_t(\mathbf x)+\nabla_{\mathbf x}\log p_t(\mathbf y\mid\mathbf x).\tag{7}
$$

与无条件动力学类似，(6) 有对应 ODE

$$
\mathrm d\mathbf x=\left[\mathbf f(\mathbf x)-\frac{1}{2}g(t)^{2}\nabla_{\mathbf x}\log p_t(\mathbf x\mid\mathbf y)\right]\mathrm dt,\tag{8}
$$

其 Euler 离散给出近似解

$$
\mathbf x_{t-1}=\mathbf x_t+\left[\mathbf f(\mathbf x_t)-\frac{1}{2}g(t)^{2}\nabla_{\mathbf x_t}\log p_t(\mathbf x_t\mid\mathbf y)\right]\Delta t.\tag{9}
$$


### 2.3 最优控制

最优控制是随时间引导动力系统的结构化、原理性方法。最优控制文献中已发展出许多方法，通常称为**轨迹优化算法** Betts [1998]，其中最著名的或许是**迭代线性二次调节器（iLQR）**，它对动力学做一阶近似、对价值函数做二阶近似 Li and Todorov [2004]。

形式上，定义任意用户指定的全局代价函数

$$
J_T=\sum_{t=T}^{1}\ell_t(\mathbf x_t,\mathbf u_t)+\ell_0(\mathbf x_0),\tag{10}
$$

它由标量值的过程代价与终端代价函数 $\ell_t$、$\ell_0$ 求和构成。最优控制理论要求价值函数 $V(\mathbf x_t,t):=\min_{\{\mathbf u_n\}_{n=t}^{n=1}}J_t$ 满足如下递归关系，即 **Bellman 最优性原理**：

$$
V(\mathbf x_t,t)=\min_{\mathbf u_t}\left[\ell_t(\mathbf x_t,\mathbf u_t)+V(\mathbf x_{t-1},t-1)\right].\tag{11}
$$

iLQR 算法的核心是近似**状态—动作价值函数**

$$
Q(\mathbf x_t,\mathbf u_t):=\ell_t(\mathbf x_t,\mathbf u_t)+V(\mathbf x_{t-1},t-1),\tag{12}
$$

由此可恢复价值函数 $V(\mathbf x_t,t)=\min_{\mathbf u_t}Q(\mathbf x_t,\mathbf u_t)$。给定状态转移函数 $\mathbf x_t=h(\mathbf x_{t+1},\mathbf u_{t+1})$（注意此处时间定义为从 $t=T,\ldots,0$ 反向流动），iLQR 算法的**前馈与反馈增益**为

$$
\mathbf k=-Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u}\qquad\text{与}\qquad\mathbf K=-Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u\mathbf x}.\tag{13}
$$

更新方程为

$$
V_{\mathbf x}=Q_{\mathbf x}-\mathbf K^{\top}Q_{\mathbf u\mathbf u}\mathbf k,\qquad V_{\mathbf x\mathbf x}=Q_{\mathbf x\mathbf x}-\mathbf K^{\top}Q_{\mathbf u\mathbf u}\mathbf K.\tag{14}
$$

给定前馈与反馈增益 $\{(\mathbf K_t,\mathbf k_t)\}_{t=0}^{T}$ 与 $\bar{\mathbf x}_0:=\mathbf x_0$，可由当前状态 $\mathbf x_t$ 与控制 $\mathbf u_t$ 递归得到时刻 $t$ 的局部最优控制：

$$
\bar{\mathbf x}_t=h(\bar{\mathbf x}_{t+1},\mathbf u_{t+1}^{*}),\tag{15}
$$
$$
\mathbf u_t^{*}=\mathbf u_t+\lambda\mathbf k+\mathbf K(\bar{\mathbf x}_t-\mathbf x_t).\tag{16}
$$

关于 iLQR 的更详细处理及方程推导见附录 B。

## 3 扩散最优控制

本文框架的动机来自一个观察：反向扩散过程 (1) 是一个**不受控的非线性动力系统**，从某初始状态（时刻 $t=T$）演化到某终端状态（时刻 $t=0$）。向该系统注入控制向量 $\mathbf u_t$，即可影响其行为、从而影响终端状态（即生成数据），使其从期望的 $p(\mathbf x\mid\mathbf y)$ 采样。向该过程注入控制有两种显然方式：

1. **输入扰动控制**：在扩散步**之前**施加 $\mathbf u_t$：
$$
\mathbf x_{t-1}=(\mathbf x_t+\mathbf u_t)-\left[\mathbf f(\mathbf x_t+\mathbf u_t)-\frac{1}{2}g(t)^{2}\nabla_{\mathbf x}\log p_t(\mathbf x_t+\mathbf u_t)\right]\Delta t.\tag{17}
$$

2. **输出扰动控制**：在扩散步**之后**施加 $\mathbf u_t$：
$$
\mathbf x_{t-1}=\mathbf x_t-\left[\mathbf f(\mathbf x_t)-\frac{1}{2}g(t)^{2}\nabla_{\mathbf x}\log p_t(\mathbf x_t)\right]\Delta t+\mathbf u_t.\tag{18}
$$

注意 iLQR 是为一般离散时间动态过程而设计的。当把它具体应用于扩散模型的反向扩散动力学时，可做若干简化。首先假设除时刻 $t=0$ 外没有其他引导可用，即 $\ell_t(\mathbf x_t,\mathbf u_t)$ 不依赖 $\mathbf x_t$。

对输入扰动控制，由 (17) 可见 $h_{\mathbf x}=h_{\mathbf u}$；对输出扰动控制，$h_{\mathbf u}=\mathbf I$，于是分别得到下式左右两列：

$$
Q_{\mathbf x}=h_{\mathbf x}^{\top}V_{\mathbf x}'\qquad Q_{\mathbf x}=h_{\mathbf x}^{\top}V_{\mathbf x}'\tag{19}
$$
$$
Q_{\mathbf u}=\ell_{\mathbf u}+h_{\mathbf x}^{\top}V_{\mathbf x}'\qquad Q_{\mathbf u}=\ell_{\mathbf u}+V_{\mathbf x}'\tag{20}
$$
$$
Q_{\mathbf x\mathbf x}=h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x}\qquad Q_{\mathbf x\mathbf x}=h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x}\tag{21}
$$
$$
Q_{\mathbf u\mathbf x}=Q_{\mathbf x\mathbf u}=h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x}\qquad Q_{\mathbf u\mathbf x}=Q_{\mathbf x\mathbf u}^{\top}=V_{\mathbf x\mathbf x}'h_{\mathbf x}\tag{22}
$$
$$
Q_{\mathbf u\mathbf u}=\ell_{\mathbf u\mathbf u}+h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x}\qquad Q_{\mathbf u\mathbf u}=\ell_{\mathbf u\mathbf u}+V_{\mathbf x\mathbf x}'.\tag{23}
$$

$V$ 的导数随后可用如下方程反向传播：

$$
V_{\mathbf x}=Q_{\mathbf x}-\mathbf K^{\top}Q_{\mathbf u\mathbf u}\mathbf k=Q_{\mathbf x}+Q_{\mathbf u\mathbf x}^{\top}Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u},\tag{24}
$$
$$
V_{\mathbf x\mathbf x}=Q_{\mathbf x\mathbf x}-\mathbf K^{\top}Q_{\mathbf u\mathbf u}\mathbf K=Q_{\mathbf x\mathbf x}-Q_{\mathbf u\mathbf x}^{\top}Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u\mathbf x}.\tag{25}
$$

在高维系统（如 (3)）中矩阵可能奇异，因此常采用 **Tikhonov 正则化**版 iLQR，用对角矩阵 $\alpha\mathbf I$ 正则化矩阵求逆 Tassa et al. [2014]。

**算法 1　扩散最优控制**

```text
输入: λ, T, y, x_T
初始化 u_t, k_t, K_t 为 0（t = 1…T），{x'_t}_{t=0}^T 为不受控动力学
for iter = 1 to num_iters do
    V_x, V_xx ← ∇_{x_0} log p(y|x_0), ∇²_{x_0} log p(y|x_0)   ▷ 初始化 V(x_t,t) 的导数
    for t = 1 to T do
        计算 k_t, K_t, V_x, V_xx   ▷ 见式 (13)、(14)
    end for
    for t = T to 1 do
        x_{t−1} ← h(x_t, λk_t + K_t(x_t − x'_t))   ▷ 用新 u_t 更新 x_{t−1}
        x'_t ← x_t
    end for
end for
```

### 3.1 高维控制

与传统最优控制应用领域的动力学相比，式 (17)—(18) 所考虑的系统在状态 $\mathbf x$ 与控制 $\mathbf u$ 维度上高得多，因此 iLQR 应用于此类控制问题时会遇到若干独特的计算瓶颈。特别地，Jacobian 矩阵 $h_{\mathbf x}$、$h_{\mathbf u}$ 与二阶导数矩阵 $V_{\mathbf x\mathbf x}$、$Q_{\mathbf x\mathbf x}$、$Q_{\mathbf u\mathbf x}$、$Q_{\mathbf x\mathbf u}$、$Q_{\mathbf u\mathbf u}$ 的计算、存储与下游操作都特别昂贵。例如对三通道 $256\times256$ 图像，这些矩阵朴素地包含 $(256\times256\times3)^{2}\approx390$ 亿参数。


在附录 D.1 中，本文提出并分析了对标准 iLQR 算法的三项修改：**随机低秩近似**、**免矩阵（matrix-free）计算**与**通过自适应优化器做动作更新**，它们显著降低运行时与内存约束，同时对逆问题求解任务的性能仅有极小退化。

## 4 改进的后验采样

本文证明，基于最优控制的采样器克服了现有基于扩散的逆问题求解器的若干实际障碍。

**对离散化的脆弱性。** 在概率框架中，逆问题解会产生 (8) 数值求解的离散化误差，该误差随扩散总步数 $T$ 衰减得很慢。尽管已有大量关于无条件扩散过程加速的研究 Song et al. [2020]、Jolicoeur-Martineau et al. [2021]、Karras et al. [2022]、Meng et al. [2023]，但在基于扩散的逆问题求解器中样本质量似乎衰减得**激进得多**（图 3）。本文推测原因有二：1）后验采样器 (9) 只在时间步无穷小时才正确；2）近似的条件分数项 $\nabla_{\mathbf x}\log p(\mathbf y\mid\mathbf x_t)$ 的质量随时间迅速衰减（图 2），因此时间步越少，在低 $t$ 处纠正高 $t$ 处误差的机会就越少。相反，最优控制直接把离散化过程视为**端到端控制回合**，故对任意离散化步数 $T$ 都产生可行解。

**$\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_t)$ 的不可解性。** 当前向模型 $\mathbf A$ 已知且 $\eta$ 来自简单分布时，条件似然 $p(\mathbf y\mid\mathbf x_t)$ 可在 $t=0$ 处闭式导出。但 $t>0$ 时 $\mathbf y$ 对 $\mathbf x_t$ 的依赖一般未知，除非显式计算 $\mathbf x_0$（这需要从扩散过程采样）。最终，获得条件分数项 $\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_t)$ 是高度非平凡的任务 Song et al. [2021]。

为绕开该问题，许多工作 Meng and Kabashima [2022]、Song et al. [2022]、Chung et al. [2023a] 把该项分解为积分

$$
p(\mathbf y\mid\mathbf x_t)=\int p(\mathbf y\mid\mathbf x_0)p(\mathbf x_0\mid\mathbf x_t)\,\mathrm d\mathbf x_0,\tag{26}
$$

再施加一系列近似以得到计算可行的条件分数估计。首先，边缘 $p(\mathbf x_0\mid\mathbf x_t)$ 被替换为在给定 $\mathbf x_0$ 的条件边缘 $p(\mathbf x_0\mid\mathbf x_t,\mathbf x_0)=\mathcal N(\mathbf x_0,\sigma^{2}\mathbf I)$ Kim and Ye [2021]；接着，以 $\mathbf x_0$ 为中心的条件边缘被替换为 Tweedie 公式给出的后验均值 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$ Efron [2011]；最后，真实分数被替换为学习到的分数网络。

这些近似在概率框架中是必要的，但本文表明在本文方法中并不需要。直觉上，这是因为线性二次调节器通过前向轨迹展开反向传播控制代价 $\log p(\mathbf y\mid\mathbf x)$，从而自然地在每个时刻 $t$ 计算真实条件分数；此外，本文模型**总是精确估计** $\mathbf x_0\mid\mathbf x_t$（至多差 (3) 求解带来的离散化误差），而非构造近似 $\widehat{\mathbf x}_0\approx\mathbf x_0$（图 2）。下面用命题形式化该观察。

**定理 4.1。** 设 (3) 为输出扰动模式控制（(18)）下扩散模型的离散采样方程，且终端代价

$$
\ell_0(\mathbf x_0)=-\log p(\mathbf y\mid\mathbf x_0)\tag{27}
$$

二阶可微，过程代价

$$
\ell_t(\mathbf x_t,\mathbf u_t)=0.\tag{28}
$$

则带 Tikhonov 正则化 $\alpha$ 的迭代线性二次调节器产生的控制为

$$
\mathbf u_t=\alpha\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_0).\tag{29}
$$

换言之，把逆问题表述为带控制 $\mathbf u_t$ 的无条件扩散过程后，本文方法产生的控制恰好与期望的条件分数 $\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_0)$ 一致。

进一步假设 $\log p(\mathbf y\mid\mathbf x_t)=\log p(\mathbf y\mid\mathbf x_0)$，即 $\mathbf x_t$ 不含比 $\mathbf x_0$ 更多关于 $\mathbf y$ 的信息。该假设在随机动力学（(1)）下给出 Chung et al. [2023a] 的后验均值近似，而此时本文还能精确计算 $\mathbf x_0$，而非用 Tweedie 公式得到 $\widehat{\mathbf x}_0\approx\mathbf x_0$ Kim and Ye [2021]。在确定性 ODE 动力学（(2)）下，选取适当 Tikhonov 正则化常数 $\alpha$ 即可恢复真实后验采样器。

**引理 4.2。** 在输出扰动模式控制的确定性采样器下，$\alpha=\frac{1}{g(t)^{2}\Delta t}$ 可恢复后验采样（(9)）。

本文对输入模式扰动给出类似结果。

**定理 4.3。** 设 (3) 为输入扰动模式控制（(17)）下扩散模型的离散采样方程，且

$$
\ell_0(\mathbf x_0)=\log p(\mathbf y\mid\mathbf x_0),\tag{30}
$$

过程代价

$$
\ell_t(\mathbf x_t,\mathbf u_t)=0.\tag{31}
$$

则带 Tikhonov 正则化 $\alpha=\frac{1}{g(t)^{2}\Delta t}$ 的迭代线性二次调节器产生动力学

$$
\widetilde{\mathbf x}_t=\widetilde{\mathbf x}_t+\left[\mathbf f(\widetilde{\mathbf x}_t)-\frac{1}{2}g(t)^{2}\left(\nabla_{\mathbf x}\log p_t(\widetilde{\mathbf x}_t)+\nabla_{\mathbf x}\log p_t(\mathbf y\mid\mathbf x_t)\right)\right]\Delta t,\tag{32}
$$

其中 $\widetilde{\mathbf x}_t:=\mathbf x_t+\mathbf u_t$。

注意 (32) 可理解为**预测—校正采样**方法：预测器给出无条件反向扩散更新，校正器在中介变量 $\mathbf x_t=\widetilde{\mathbf x}_t-\mathbf u_t$ 上给出条件校正步。最终，这些结果表明，在对扩散最优控制算法做温和假设时，本文方法能够恢复理想化采样过程。

**对近似分数的依赖。** 尽管本文理论结果要求学习到的分数函数 $\mathbf s_{\boldsymbol\theta}(\mathbf x_t,t)$ 逼近真实数据分数 $\log p_t(\mathbf x_t,t)$，但本文强调方法性能**并不要求**该条件成立。事实上，本文发现重建性能在理论上与经验上都对近似先验分数 $\mathbf s_{\boldsymbol\theta}(\mathbf x_t,t)\approx\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$ 或条件分数 $\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_0)\approx\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_t)$ 的精度**稳健**，因为基于最优控制的解是为一般动力系统的优化而表述的，故与扩散采样过程无关。

当然，更好的分数项近似带来更有信息的先验、通常也带来更高样本质量；但本文证明，即使在**随机初始化**的扩散模型下，该采样器仍产生相当合理的解。相反，概率后验采样器只有在构成后验采样方程（(8)）的各项被良好近似时才能从 $p(\mathbf y\mid\mathbf x_0)$ 采样（图 6）。建模误差即使在基础模型中也会出现，例如在数据中代表性不足的区域上训练的模型；当这些误差源于社会或伦理偏见时，若不处理，可能进一步延续或放大地产生的偏见 Bolukbasi et al. [2016]、Birhane et al. [2021]、Srivastava et al. [2022]。

已有若干方法试图缓解 Tweedie 公式（作为扩散过程的均值近似）带来的误差，包括 Song et al. [2024] 在扩散过程多个点施加硬数据一致性优化回路，以及 Rout et al. [2023] 在每步加入随机平均回路；但这些方法仍依赖 Tweedie 公式进行误差削减，而该公式假设可访问真值分数函数。最终，本节所述问题在现有采样器中更严重，而在本文求解器中相对影响较小。

**表 1：FFHQ 256×256-1K 数据集上逆问题的定量评估（FID、LPIPS）。**

| 方法 | SR×4 FID↓ | SR×4 LPIPS↓ | 随机修补 FID↓ | 随机修补 LPIPS↓ | 盒状修补 FID↓ | 盒状修补 LPIPS↓ | 高斯去模糊 FID↓ | 高斯去模糊 LPIPS↓ | 运动去模糊 FID↓ | 运动去模糊 LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|---|
| 本文（NFE=2500） | **32.47** | **0.171** | **15.93** | **0.053** | **20.22** | **0.122** | **31.80** | **0.189** | **39.40** | **0.217** |
| 本文（NFE=1000） | 37.53 | 0.189 | 20.75 | 0.108 | 23.88 | 0.164 | 35.24 | 0.191 | 45.99 | 0.233 |
| PSLD（NFE=1000） | 34.28 | 0.201 | 21.34 | 0.096 | 43.11 | 0.167 | 41.53 | 0.221 | – | – |
| Flash-Diffusion\*（NFE=不定） | – | – | 53.95 | 0.195 | – | – | 65.35 | 0.280 | 64.57 | 0.267 |
| DDNM（NFE=1000） | 68.94 | 0.328 | 105.3 | 0.802 | 72.28 | 0.483 | 126.0 | 0.995 | – | – |
| DPS（NFE=1000） | 39.35 | 0.214 | 33.12 | 0.168 | 21.19 | 0.212 | 44.05 | 0.257 | 39.92 | 0.242 |
| DDRM（NFE=1000） | 62.15 | 0.294 | 42.93 | 0.204 | 69.71 | 0.587 | 74.92 | 0.332 | – | – |
| MCG（NFE=1000） | 87.64 | 0.520 | 40.11 | 0.309 | 29.26 | 0.286 | 101.2 | 0.340 | 310.5 | 0.702 |
| PNP-ADMM | 66.52 | 0.353 | 151.9 | 0.406 | 123.6 | 0.692 | 90.42 | 0.441 | 89.08 | 0.405 |
| Score-SDE（NFE=1000） | 96.72 | 0.563 | 60.06 | 0.331 | 76.54 | 0.612 | 109.0 | 0.403 | 292.2 | 0.657 |
| ADMM-TV | 110.6 | 0.428 | 68.94 | 0.322 | 181.5 | 0.463 | 186.7 | 0.507 | 152.3 | 0.508 |

## 5 相关工作

扩散模型在图像生成中的近期成功 Song and Ermon [2019]、Ho et al. [2020]、Song et al. [2021]、Rombach et al. [2022] 催生了大量基于深度学习的逆问题求解器研究。Song et al. [2021] 展示了仅用无条件先验分数模型 $\nabla_{\mathbf x}\log p_t(\mathbf x)$ 与前向概率模型 $\log p(\mathbf y\mid\mathbf x_t)$ 即可证明地从一般逆问题 $\mathbf y=\mathbf A(\mathbf x)$ 的解集 $p(\mathbf x\mid\mathbf y)$ 采样；但其关键在于前向概率模型不可解，因为它依赖含噪的 $\mathbf x_t$ 而非最终的 $\mathbf x_0$。这催生了一系列针对真实条件扩散动力学的近似算法 Choi et al. [2021]、Kawar et al. [2022]、Chung et al. [2022, 2023a,b]、Kawar et al. [2023]。

控制理论的主题已被应用于深度学习 Liu et al. [2020]、Pereira et al. [2020] 以及扩散建模 Berner et al. [2022]；最优控制还可通过前向—后向 SDE 与扩散过程联系 Chen et al. [2021]。但这些思想尚未被应用于**仅在推断时**的引导条件扩散过程，也未用于引导条件采样。据本文所知，所提出的基于最优控制的算法是首个此类面向深度逆问题求解器的框架。



## 6 实验

沿用前人工作 Chung et al. [2023a]、Meng and Kabashima [2022]、Kawar et al. [2022]，本文考虑五个逆问题：1）$4\times$ 图像超分辨率，使用双三次下采样算子；2）随机修补，均匀丢弃全部像素的 92%（跨所有通道）；3）盒状修补，遮掉一个 $128\times128$ 的块，该块从每边 16 像素边距内均匀采样，做法同 Chung et al. [2022]；4）高斯去模糊，使用 $61\times61$、标准差 3.0 的核；5）运动去模糊，按点扩散函数库[^2]生成图像，核大小 $61\times61$、强度 0.5。遵循 Chung et al. [2023a] 的实验设计，对所有前向模型测量施加标准差 0.05 的高斯噪声。

[^2]: https://github.com/LeviBorodenko/motionblur

本文对比 Song et al. [2021] 提出的通用扩散逆采样器（Score-SDE）、扩散后验采样（DPS）Chung et al. [2023a]、去噪扩散恢复模型（DDRM）Kawar et al. [2022]、流形约束梯度（MCG）Chung et al. [2022]，以及两种近期基于隐扩散的方法 Fabian et al. [2023]（Flash-Diffusion[^3]）与 Rout et al. [2024]（PSLD）。对非扩散基线，对比使用神经近端映射的即插即用交替方向乘子法（PnP-ADMM）Chan et al. [2016]、Zhang et al. [2017]，以及 Chung et al. [2023a] 提出的基于全变分的交替方向乘子法（TV-ADMM）。

[^3]: 对高斯模糊与随机修补，Flash-Diffusion 使用的退化算子虽随机采样但比本文实验设置更轻。

本文在高质量人脸数据集 FFHQ $256\times256$ Karras et al. [2019] 上验证结果。若干方法与模型无关（DPS、DDRM、MCG），因此用相同的预训练扩散模型评估。为在所有方法间公平比较，全部方法使用 Chung et al. [2023a] 的模型权重（在 49K 张 FFHQ 图像上训练，留出 1K 张作评估）。本文在这最后 1K 张图像上与竞争框架比较，结果见表 1：在所有任务上均优于之前的方法。最后，本文展示算法在**类条件生成**这一非线性逆问题上的性能：令 $\mathbf A(\mathbf x)=\text{classifier}(\mathbf x)$、$p(\mathbf y\mid\mathbf x)$ 为其关联概率，在给定标签 $\mathbf y$ 生成 MNIST 数字的逆任务上把本文方法与 DPS 对比；相比 DPS 生成的图像，本文方法的图像表现出更强的类别对齐与更高的整体样本质量（图 5）。

## 7 结论

本文提出了用扩散模型处理逆问题的一个新视角——把离散化的反向扩散过程视为**离散时间最优控制回合**。本文证明该框架缓解了概率求解器的若干核心问题：对扩散过程中底层各项近似质量的依赖、对时间离散化方案的敏感性，以及条件分数函数不可解带来的固有不准性。本文还表明，扩散后验采样器可看作基于最优控制的采样器的一个特例。最后，利用求解器带来的改进，本文在多个数据集上的多种逆问题任务中验证了算法性能，展示了极具竞争力的结果。

**局限。** 主要局限是运行时开销：完整 iLQR 回合的代价较高，且需要多次迭代；本文在附录中给出了等预算分析，显示在相同预算下该方法在各基准上仍具竞争力（另见 NeurIPS 检查表第 2 项）。

## 参考文献（英文原书目）

原文采用作者—年份引用制、按字母顺序排列、未编号。以下按原文字母顺序逐条转录（共 57 条），条目文字不翻译；为便于站内引用与核对加注序号 [1]—[57]（保留作者、标题、出处与年份，原文 URL 从略，可在原文核对）。

[1] Julius Berner, Lorenz Richter, and Karen Ullrich. An optimal control perspective on diffusion-based generative modeling. arXiv preprint arXiv:2211.01364, 2022.

[2] John T Betts. Survey of numerical methods for trajectory optimization. Journal of Guidance, Control, and Dynamics, 21(2):193–207, 1998.

[3] Abeba Birhane, Vinay Uday Prabhu, and Emmanuel Kahembwe. Multimodal datasets: misogyny, pornography, and malignant stereotypes. arXiv preprint arXiv:2110.01963, 2021.

[4] Tolga Bolukbasi, Kai-Wei Chang, James Y Zou, Venkatesh Saligrama, and Adam T Kalai. Man is to computer programmer as woman is to homemaker? debiasing word embeddings. Advances in Neural Information Processing Systems, 29, 2016.

[5] Stanley H Chan, Xiran Wang, and Omar A Elgendy. Plug-and-play ADMM for image restoration: Fixed-point convergence and applications. IEEE Transactions on Computational Imaging, 3(1):84–98, 2016.

[6] Tianrong Chen, Guan-Horng Liu, and Evangelos A Theodorou. Likelihood training of Schrödinger bridge using forward-backward SDEs theory. arXiv preprint arXiv:2110.11291, 2021.

[7] Jooyoung Choi, Sungwon Kim, Yonghyun Jeong, Youngjune Gwon, and Sungroh Yoon. ILVR: Conditioning method for denoising diffusion probabilistic models. arXiv preprint arXiv:2108.02938, 2021.

[8] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. Advances in Neural Information Processing Systems, 35:25683–25696, 2022.

[9] Hyungjin Chung, Jeongsol Kim, Michael T Mccann, Marc L Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. International Conference on Learning Representations, 2023a.

[10] Hyungjin Chung, Jeongsol Kim, and Jong Chul Ye. Direct diffusion bridge using data consistency for inverse problems. arXiv preprint arXiv:2305.19809, 2023b.

[11] Prafulla Dhariwal and Alexander Nichol. Diffusion models beat GANs on image synthesis. Advances in Neural Information Processing Systems, 34:8780–8794, 2021.

[12] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106(496):1602–1614, 2011.

[13] Zalan Fabian, Berk Tinaz, and Mahdi Soltanolkotabi. Adapt and diffuse: Sample-adaptive reconstruction via latent diffusion models. arXiv preprint arXiv:2309.06642, 2023.

[14] Nathan Halko, Per-Gunnar Martinsson, and Joel A Tropp. Finding structure with randomness: Probabilistic algorithms for constructing approximate matrix decompositions. SIAM Review, 53(2):217–288, 2011.

[15] Jonathan Ho and Tim Salimans. Classifier-free diffusion guidance. arXiv preprint arXiv:2207.12598, 2022.

[16] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in Neural Information Processing Systems, 33:6840–6851, 2020.

[17] Matthew D Houghton, Alexander B Oshin, Michael J Acheson, Evangelos A Theodorou, and Irene M Gregory. Path planning: Differential dynamic programming and model predictive path integral control on VTOL aircraft. In AIAA SCITECH 2022 Forum, page 0624, 2022.

[18] David H Jacobson. New second-order and first-order algorithms for determining optimal control: A differential dynamic programming approach. Journal of Optimization Theory and Applications, 2:411–440, 1968.

[19] Alexia Jolicoeur-Martineau, Ke Li, Rémi Piché-Taillefer, Tal Kachman, and Ioannis Mitliagkas. Gotta go fast when generating data with score-based models. arXiv preprint arXiv:2105.14080, 2021.

[20] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In CVPR, pages 4401–4410, 2019.

[21] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. Advances in Neural Information Processing Systems, 35:26565–26577, 2022.

[22] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. Advances in Neural Information Processing Systems, 35:23593–23606, 2022.

[23] Bahjat Kawar, Noam Elata, Tomer Michaeli, and Michael Elad. GSURE-based diffusion model training with corrupted data. arXiv preprint arXiv:2305.13128, 2023.

[24] Kwanyoung Kim and Jong Chul Ye. Noise2Score: Tweedie's approach to self-supervised image denoising without clean images. Advances in Neural Information Processing Systems, 34:864–874, 2021.

[25] Diederik P Kingma and Jimmy Ba. Adam: A method for stochastic optimization. arXiv preprint arXiv:1412.6980, 2014.

[26] Dana A Knoll and David E Keyes. Jacobian-free Newton–Krylov methods: a survey of approaches and applications. Journal of Computational Physics, 193(2):357–397, 2004.

[27] Henry Li, Ronen Basri, and Yuval Kluger. Likelihood training of cascaded diffusion models via hierarchical volume-preserving maps. In ICLR, 2024.

[28] Weiwei Li and Emanuel Todorov. Iterative linear quadratic regulator design for nonlinear biological movement systems. In First International Conference on Informatics in Control, Automation and Robotics, volume 2, pages 222–229. SciTePress, 2004.

[29] Guan-Horng Liu, Tianrong Chen, and Evangelos A Theodorou. DDPNOPT: Differential dynamic programming neural optimizer. arXiv preprint arXiv:2002.08809, 2020.

[30] Chenlin Meng, Robin Rombach, Ruiqi Gao, Diederik Kingma, Stefano Ermon, Jonathan Ho, and Tim Salimans. On distillation of guided diffusion models. In CVPR, pages 14297–14306, 2023.

[31] Xiangming Meng and Yoshiyuki Kabashima. Diffusion model based posterior sampling for noisy linear inverse problems. arXiv preprint arXiv:2211.12343, 2022.

[32] Gregory Ongie, Ajil Jalal, Christopher A Metzler, Richard G Baraniuk, Alexandros G Dimakis, and Rebecca Willett. Deep learning techniques for inverse problems in imaging. IEEE Journal on Selected Areas in Information Theory, 1(1):39–56, 2020.

[33] Samet Oymak, Zalan Fabian, Mingchen Li, and Mahdi Soltanolkotabi. Generalization guarantees for neural networks via harnessing the low-rank structure of the Jacobian. arXiv preprint arXiv:1906.05392, 2019.

[34] Marcus Pereira, Ziyi Wang, Tianrong Chen, Emily Reed, and Evangelos Theodorou. Feynman-Kac neural network architectures for stochastic control using second-order FBSDE theory. In Learning for Dynamics and Control, pages 728–738. PMLR, 2020.

[35] Kaare Brandt Petersen, Michael Syskind Pedersen, et al. The matrix cookbook. Technical University of Denmark, 7(15):510, 2008.

[36] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In CVPR, pages 10684–10695, 2022.

[37] Litu Rout, Yujia Chen, Abhishek Kumar, Constantine Caramanis, Sanjay Shakkottai, and Wen-Sheng Chu. Beyond first-order Tweedie: Solving inverse problems using latent diffusion. arXiv preprint arXiv:2312.00852, 2023.

[38] Litu Rout, Negin Raoof, Giannis Daras, Constantine Caramanis, Alex Dimakis, and Sanjay Shakkottai. Solving linear inverse problems provably via posterior sampling with latent diffusion models. Advances in Neural Information Processing Systems, 36, 2024.

[39] Levent Sagun, Utku Evci, V Ugur Guney, Yann Dauphin, and Leon Bottou. Empirical analysis of the Hessian of over-parametrized neural networks. arXiv preprint arXiv:1706.04454, 2017.

[40] Chitwan Saharia, William Chan, Saurabh Saxena, Lala Li, Jay Whang, Emily L Denton, Kamyar Ghasemipour, Raphael Gontijo Lopes, Burcu Karagol Ayan, Tim Salimans, et al. Photorealistic text-to-image diffusion models with deep language understanding. Advances in Neural Information Processing Systems, 35:36479–36494, 2022.

[41] Tomohiro Sasaki, Koki Ho, and E Glenn Lightsey. Nonlinear spacecraft formation flying using constrained differential dynamic programming. In Proceedings of AAS/AIAA Astrodynamics Specialist Conference, 2022.

[42] Bowen Song, Soo Min Kwon, Zecheng Zhang, Xinyu Hu, Qing Qu, and Liyue Shen. Solving inverse problems with latent diffusion models via hard data consistency. arXiv preprint arXiv:2307.08123, 2024.

[43] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. arXiv preprint arXiv:2010.02502, 2020.

[44] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In ICLR, 2022.

[45] Yang Song and Stefano Ermon. Generative modeling by estimating gradients of the data distribution. Advances in Neural Information Processing Systems, 32, 2019.

[46] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In ICLR, 2021.

[47] Aarohi Srivastava, Abhinav Rastogi, Abhishek Rao, Abu Awal Md Shoeb, Abubakar Abid, Adam Fisch, Adam R Brown, Adam Santoro, Aditya Gupta, Adrià Garriga-Alonso, et al. Beyond the imitation game: Quantifying and extrapolating the capabilities of language models. arXiv preprint arXiv:2206.04615, 2022.

[48] Yuval Tassa, Tom Erez, and William Smart. Receding horizon differential dynamic programming. Advances in Neural Information Processing Systems, 20, 2007.

[49] Yuval Tassa, Nicolas Mansard, and Emo Todorov. Control-limited differential dynamic programming. In IEEE ICRA, pages 1168–1175. IEEE, 2014.

[50] Emanuel Todorov and Weiwei Li. A generalized iterative LQG method for locally-optimal feedback control of constrained nonlinear stochastic systems. In Proceedings of the American Control Conference, pages 300–306. IEEE, 2005.

[51] Kai Zhang, Wangmeng Zuo, Yunjin Chen, Deyu Meng, and Lei Zhang. Beyond a Gaussian denoiser: Residual learning of deep CNN for image denoising. IEEE Transactions on Image Processing, 26(7):3142–3155, 2017.

[52] Tianrong Chen, Guan-Horng Liu, and Evangelos A Theodorou. Likelihood training of Schrödinger bridge using forward-backward SDEs theory. arXiv preprint arXiv:2110.11291, 2021（原文重复条目）。

[53] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. arXiv preprint arXiv:2407.01521, 2024.

[54] Cheng Lu, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. DPM-Solver: A fast ODE solver for diffusion probabilistic model sampling in around 10 steps. Advances in Neural Information Processing Systems, 35, 2022.

[55] Tim Dockhorn, Arash Vahdat, and Karsten Kreis. Score-based generative modeling with critically-damped Langevin diffusion. arXiv preprint arXiv:2112.07068, 2021.

[56] Arash Vahdat, Karsten Kreis, and Jan Kautz. Score-based generative modeling in latent space. Advances in Neural Information Processing Systems, 34, 2021.

[57] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le. Flow matching for generative modeling. arXiv preprint arXiv:2210.02747, 2022.

## 附录 A：影响声明

本文建立于大量既有工作之上，提出一种求解一般非线性逆问题的改进技术，可视为引导扩散建模的推广。控制生成模型中的扩散过程具有许多社会应用，因而有广泛的下游影响。本文认为，在公开论坛与开放社区中理解此类模型的能力与局限，对于把这些技术负责任地、实际地融入社会至关重要；但本文以及该领域任何其他工作所提出的思想，都必须谨慎部署，以应对这些技术固有风险。

## 附录 B：迭代线性二次调节器（iLQR）的推导

差分动态规划（DDP）是一种非常流行的轨迹优化算法，拥有丰富的理论结果 Jacobson [1968]，并在机器人 Tassa et al. [2007, 2014]、航空航天 Houghton et al. [2022]、Sasaki et al. [2022] 与生物力学 Todorov and Li [2005] 中有成功应用。它属于轨迹优化的**间接法**：由 Bellman 最优性原理定义所谓最优价值函数，再由其确定最优控制；这与把问题转化为非线性约束优化问题的**直接法**相对。

为构造最优控制算法，先定义动力系统的状态转移函数

$$
\mathbf x_{t-1}=h(\mathbf x_t,\mathbf u_t).\tag{33}
$$

其次需要代价函数 $J(\mathbf x_t,\mathbf u_t)\in\mathbb R$，用于定义 iLQR 可针对控制序列 $\{\mathbf u_t\}_{t=T}^{t=1}$（即从 $t=T$ 反向到 $t=1$ 的控制轨迹）优化的性能准则：

$$
J_T=\sum_{t=T}^{1}\ell_t(\mathbf x_t,\mathbf u_t)+\ell_0(\mathbf x_0),\tag{34}
$$

其中 $\ell_t$ 与 $\ell_0$ 为标量函数，分别称为过程代价函数与终端代价函数。为获得最优控制序列，本文采用动态规划原理。为此先引入价值函数（Value-function）：

$$
V(\mathbf x_t,t)=\min_{\{\mathbf u_n\}_{n=t}^{n=1}}J_t=\min_{\{\mathbf u_n\}_{n=t}^{n=1}}\left[\sum_{n=t}^{1}\ell_n(\mathbf x_n,\mathbf u_n)+\ell_0(\mathbf x_0)\right].\tag{35}
$$

直观上，价值函数类似于从时刻 $t$、状态 $\mathbf x_t$ 到时间视界终点（$t=0$）的**最优剩余代价**。由此可导出如下递归关系，即 **Bellman 最优性原理**：

$$
V(\mathbf x_t,t)=\min_{\mathbf u_t}\left[\ell_t(\mathbf x_t,\mathbf u_t)+V(\mathbf x_{t-1},t-1)\right].\tag{36}
$$

推导 iLQR Riccati 方程时常用的是**状态—动作价值函数**：

$$
Q(\mathbf x_t,\mathbf u_t)=\ell_t(\mathbf x_t,\mathbf u_t)+V(\mathbf x_{t-1},t-1),\tag{37}
$$

因此

$$
V(\mathbf x_t,t)=\min_{\mathbf u_t}Q(\mathbf x_t,\mathbf u_t).\tag{38}
$$

Riccati 方程推导的大致思路如下：在标称状态轨迹 $\{\bar{\mathbf x}_t\}_{t=T}^{t=0}$ 与标称动作轨迹 $\{\bar{\mathbf u}_t\}_{t=T}^{t=1}$ 附近，对 $Q(\mathbf x_t,\mathbf u_t)$ 与 $V(\mathbf x_t,t)$ 同时做二阶 Taylor 展开；把展开代入 (37)，并令一阶、二阶项相等，得到 $Q$、$\ell$、$V$ 各阶导数之间的关系：

$$
Q_{\mathbf x}=\ell_{\mathbf x}+h_{\mathbf x}^{\top}V_{\mathbf x}',\tag{39}
$$
$$
Q_{\mathbf u}=\ell_{\mathbf u}+h_{\mathbf u}^{\top}V_{\mathbf x}',\tag{40}
$$
$$
Q_{\mathbf x\mathbf x}=\ell_{\mathbf x\mathbf x}+h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x},\tag{41}
$$
$$
Q_{\mathbf x\mathbf u}=\ell_{\mathbf x\mathbf u}+h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf u},\tag{42}
$$
$$
Q_{\mathbf u\mathbf x}=\ell_{\mathbf u\mathbf x}+h_{\mathbf u}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x},\tag{43}
$$
$$
Q_{\mathbf u\mathbf u}=\ell_{\mathbf u\mathbf u}+h_{\mathbf u}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf u},\tag{44}
$$

其中 $h_{\mathbf x_t}$ 与 $h_{\mathbf u_t}$ 为动力学函数 $h(\mathbf x_t,\mathbf u_t)$ 在时刻 $t$ 处对状态与控制向量的 Jacobian。为记号简洁省去下标 $t$，上面各导数均在时刻 $t$ 求值，而 $V_{\mathbf x}'$ 与 $V_{\mathbf x\mathbf x}'$ 表示价值函数在**下一时刻**（即 $t-1$）求值的梯度与 Hessian。

接着把 $Q(\mathbf x_t,\mathbf u_t)$ 的二阶近似代入 (38)，注意 $\mathbf u_t$ 可写成标称控制加扰动：$\mathbf u_t=\bar{\mathbf u}_t+\delta\mathbf u_t$。这给出关于 $\delta\mathbf u_t$ 的二次目标，(38) 中的最小化可精确求解，得到相对标称控制轨迹的最优扰动：

$$
\delta\mathbf u_t^{*}=\mathbf k_t+\mathbf K_t\delta\mathbf x_t,\tag{45}
$$

其中前馈与反馈增益为

$$
\mathbf k=-Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u},\tag{46}
$$
$$
\mathbf K=-Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u\mathbf x}.\tag{47}
$$

最后，把最优 $\delta\mathbf u_t^{*}$ 代回 (38)，可去掉 min 算子并令两边一阶、二阶项相等，得到如下 Riccati 方程：

$$
V_{\mathbf x}=Q_{\mathbf x}-\mathbf K^{\top}Q_{\mathbf u\mathbf u}\mathbf k,\tag{48}
$$
$$
V_{\mathbf x\mathbf x}=Q_{\mathbf x\mathbf x}-\mathbf K^{\top}Q_{\mathbf u\mathbf u}\mathbf K.\tag{49}
$$

以上完成了 Riccati 方程的概要推导。算法大致流程如下：

1. 以标称控制轨迹 $\{\bar{\mathbf u}_t\}_{t=T}^{1}$ 的初始猜测出发，用 $\mathbf x_t=h(\mathbf x_{t+1},\mathbf u_{t+1})$ 生成相应标称状态轨迹 $\{\bar{\mathbf x}_t\}_{t=T}^{0}$。
2. 注意到由 (35) 有 $V(\mathbf x_0,0)=\ell(\mathbf x_0)$，可在 $\bar{\mathbf x}_0$ 处得到 $V_{\mathbf x}$ 与 $V_{\mathbf x\mathbf x}$ 的表达式。
3. 用 $\{\bar{\mathbf u}_t\}_{t=T}^{1}$ 与 $\{\bar{\mathbf x}_t\}_{t=T}^{1}$ 按 (39)—(44) 计算 $Q$ 的各阶导数。
4. 用 $Q$ 的导数按 (46)—(47) 计算前馈与反馈增益。
5. 用 Riccati 方程 (48)—(49) 把 $V_{\mathbf x}$ 与 $V_{\mathbf x\mathbf x}$ 向时间反向传播一步。
6. 重复步骤 3、4、5，直到把 $V$ 的导数反向传播到时刻 $t=T$。
7. 这完成 iLQR 的一次迭代。每次迭代结束时用增益产生更新后的标称控制轨迹：
$$
\bar{\mathbf u}_t^{*}=\bar{\mathbf u}_t+\alpha\mathbf k+\mathbf K(\bar{\mathbf x}_t-\mathbf x_t),\tag{50}
$$
其中 $\mathbf x_t$ 是在更新后控制下展开动力学得到的状态：$\mathbf x_t=h(\mathbf x_{t+1},\bar{\mathbf u}_{t+1}^{*})$。
8. 用新的标称控制轨迹 $\bar{\mathbf u}_t^{*}$ 产生新的标称状态轨迹 $\bar{\mathbf x}_t^{*}$，从步骤 2 起重复，直到收敛或达到固定迭代次数。

## 附录 C：证明

**定理 4.1 的证明。** 对 $t=1,\ldots,T$ 用归纳法证明。由于假设 $\ell_{\mathbf u\mathbf u}=0$，$V_{\mathbf x\mathbf x}$ 消失：

$$
V_{\mathbf x\mathbf x}=Q_{\mathbf x\mathbf x}-Q_{\mathbf u\mathbf x}^{\top}Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u\mathbf x}\tag{51}
$$
$$
=h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x}-h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'(V_{\mathbf x\mathbf x}')^{-1}V_{\mathbf x\mathbf x}'h_{\mathbf x}\tag{52}
$$
$$
=0.\tag{53}
$$

类似地，$V_{\mathbf x}$ 也大大简化：

$$
V_{\mathbf x}=Q_{\mathbf x}+Q_{\mathbf u\mathbf x}^{\top}Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u}\tag{54}
$$
$$
=h_{\mathbf x}^{\top}V_{\mathbf x}'+h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'(V_{\mathbf x\mathbf x}')^{-1}V_{\mathbf x}'\tag{55}
$$
$$
=h_{\mathbf x}^{\top}V_{\mathbf x}'.\tag{56}
$$

转向 Tikhonov 正则化的前馈项：

$$
\mathbf k=-Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u}\tag{57}
$$
$$
=-\left(\underbrace{h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}}_{0}h_{\mathbf x}+\alpha\mathbf I\right)^{-1}Q_{\mathbf u}\tag{58}
$$
$$
=-(0+\alpha\mathbf I)^{-1}Q_{\mathbf u}\tag{59}
$$
$$
=-\frac{1}{\alpha}V_{\mathbf x}'.\tag{60}
$$

最后，由于 $V_{\mathbf x\mathbf x}$ 消失，反馈项也消失：

$$
\mathbf K=-Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u\mathbf x}\tag{61}
$$
$$
=0.\tag{62}
$$

显式写出 $V_{\mathbf x}$ 与 $V_{\mathbf x}'$ 对 $t$ 的依赖，可把 (56) 重写为 $V_{\mathbf x}^{(t)}=h_{\mathbf x}^{\top}V_{\mathbf x}^{(t-1)}=\frac{\partial\mathbf x_{t-1}}{\partial\mathbf x_t}\frac{\partial}{\partial\mathbf x_{t-1}}V$。结合 $\ell_0=-\log p(\mathbf y\mid\mathbf x_0)$，可断定

$$
V_{\mathbf x}^{(t)}=-\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_0),\tag{63}
$$

其中 $\mathbf x_0$ 通过状态转移函数 $h$（(18)）依赖 $\mathbf x_t$。因此有 $\mathbf k=-\frac{1}{\alpha}V_{\mathbf x}'=\frac{1}{\alpha}\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_0)$、$\mathbf K=0$。最后，由动作更新（(15)）可得目标结果

$$
\mathbf u_t=\frac{1}{\alpha}\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_0).\tag{64}
$$

**引理 C.1（即引理 4.2）的证明。** 把 $\alpha=\frac{1}{g(t)^{2}\Delta t}$ 代入 (29)，可把 (18) 写为

$$
\mathbf x_{t-1}=\left[\mathbf f(\mathbf x_t)-\frac{1}{2}g(t)^{2}\left(\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)+\nabla_{\mathbf x_t}\log p_t(\mathbf y\mid\mathbf x_0)\right)\right]\Delta t.\tag{65}
$$

在确定性采样器下，每个 $\mathbf x_t$ 在样本空间中只有一条路径，故 $\log p_t(\mathbf y\mid\mathbf x_0)=\log p_t(\mathbf y\mid\mathbf x_t)$；因此上式与理想后验采样方程 (9) 一致。证毕。

**定理 4.3 的证明。** 同样对 $t=1,\ldots,T$ 用归纳法。假设 $\ell_{\mathbf u\mathbf u}=0$，$V_{\mathbf x\mathbf x}$ 消失：

$$
V_{\mathbf x\mathbf x}=Q_{\mathbf x\mathbf x}-Q_{\mathbf u\mathbf x}^{\top}Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u\mathbf x}\tag{66}
$$
$$
=Q_{\mathbf x\mathbf x}-Q_{\mathbf x\mathbf x}\left(\underbrace{\ell_{\mathbf u\mathbf u}}_{=0}+Q_{\mathbf x\mathbf x}\right)^{-1}Q_{\mathbf x\mathbf x}\tag{67}
$$
$$
=0,\tag{68}
$$

而 $V_{\mathbf x}$ 大大简化为

$$
V_{\mathbf x}=Q_{\mathbf x}+Q_{\mathbf u\mathbf x}^{\top}Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u}\tag{69}
$$
$$
=h_{\mathbf x}^{\top}V_{\mathbf x}'.\tag{70}
$$

转向前馈与反馈项：

$$
\mathbf k=-Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u}\tag{71}
$$
$$
=-\left(\underbrace{h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}}_{0}h_{\mathbf x}+\alpha\mathbf I\right)^{-1}Q_{\mathbf u}\tag{72}
$$
$$
=-(0+\alpha\mathbf I)^{-1}Q_{\mathbf u}\tag{73}
$$
$$
=-\frac{1}{\alpha}h_{\mathbf x}^{\top}V_{\mathbf x}',\tag{74}
$$

以及

$$
\mathbf K=-Q_{\mathbf u\mathbf u}^{-1}Q_{\mathbf u\mathbf x}\tag{75}
$$
$$
=0.\tag{76}
$$

于是观察到 $V_{\mathbf x}^{(t)}=-\frac{1}{\alpha}h_{\mathbf x}^{\top}V_{\mathbf x}^{(t-1)}$。注意到 $V_{\mathbf x}^{(0)}=\log p(\mathbf y\mid\mathbf x_0)$，有 $\mathbf k=-\frac{1}{\alpha}\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_0)$。把前馈项应用于扩散采样过程，并定义中介变量

$$
\widetilde{\mathbf x}_t=\mathbf x_t+\mathbf u_t,\tag{77}
$$

其动力学为

$$
\widetilde{\mathbf x}_t=\widetilde{\mathbf x}_t+\left[\mathbf f(\widetilde{\mathbf x}_t)-\frac{1}{2}g(t)^{2}\nabla_{\mathbf x}\log p_t(\widetilde{\mathbf x}_t)\right]\Delta t+\mathbf u_t.\tag{78}
$$

取 $\alpha=\Delta t\,g(t)^{2}$，即得正文 (32) 的形式。

## 附录 D：实现

所有实验均使用公开数据集与预训练模型权重。FFHQ $256\times256$ 实验用数据集最后 1K 张图像作评估；MNIST 实验中不在逆分类任务里直接使用图像，图像仅用于训练预训练扩散模型。模型方面，FFHQ $256\times256$ 任务用 Chung et al. [2023a] 的预训练权重，MNIST 实验用 Hugging Face 的 `1aurent/mnist-28` 扩散模型；不对任何模型做进一步训练。更多超参数见表 2。MNIST 类引导分类中的分类器 $p(\mathbf y\mid\mathbf x)$ 使用含两个卷积层与两个 MLP 层的简单卷积神经网络，在完整 MNIST 数据集上训练。

**表 2：FFHQ 实验的超参数。**

| 超参数 | SR×4 | 随机修补 | 盒状修补 | 高斯去模糊 | 运动去模糊 |
|---|---|---|---|---|---|
| $T$ | 50 | 50 | 50 | 50 | 50 |
| num_iters | 50 | 100 | 100 | 100 | 100 |
| step_size | $10^{-3}$ | $10^{-3}$ | $10^{-3}$ | $10^{-3}$ | $10^{-3}$ |
| $\ell_0(\mathbf x_0)$ | $\lVert\mathbf A(\mathbf x_0)-\mathbf y\rVert$ | 同左 | 同左 | 同左 | 同左 |
| $\alpha$ | $10^{-4}$ | $10^{-4}$ | $10^{-4}$ | $10^{-4}$ | $10^{-4}$ |
| $\ell_t(\mathbf x_t,\mathbf u_t)$ | $\alpha\lVert\mathbf u_t\rVert$ | 同左 | 同左 | 同左 | 同左 |
| $k$ | 1 | 1 | 1 | 1 | 1 |
| control_mode | 输入模式 | 输入模式 | 输入模式 | 输入模式 | 输入模式 |

**表 3：FFHQ 256×256-1K 数据集上逆问题的定量评估（PSNR、SSIM、MSE）。**

| 方法 | SR×4 PSNR↑ | SR×4 SSIM↑ | SR×4 MSE↓ | 随机修补 PSNR↑ | 随机修补 SSIM↑ | 随机修补 MSE↓ | 盒状修补 PSNR↑ | 盒状修补 SSIM↑ | 盒状修补 MSE↓ | 高斯去模糊 PSNR↑ | 高斯去模糊 SSIM↑ | 高斯去模糊 MSE↓ | 运动去模糊 PSNR↑ | 运动去模糊 SSIM↑ | 运动去模糊 MSE↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 本文（$T=50$） | 27.45 | 0.792 | 117.0 | 31.84 | 0.882 | 42.57 | 25.33 | 0.804 | 190.6 | 24.99 | 0.694 | 206.1 | 25.08 | 0.721 | 201.9 |
| DPS（$T=1000$） | 25.67 | 0.852 | 176.2 | 22.47 | 0.873 | 368.2 | 25.23 | 0.851 | 195.0 | 24.25 | 0.811 | 244.4 | 24.92 | 0.859 | 209.4 |
| DDRM（$T=1000$） | 25.36 | 0.835 | 189.3 | 22.24 | 0.869 | 388.2 | 9.19 | 0.319 | 7835 | 23.36 | 0.767 | 300.0 | – | – | – |
| MCG（$T=1000$） | 20.05 | 0.559 | 642.8 | 19.97 | 0.703 | 654.8 | 21.57 | 0.751 | 453.0 | 6.72 | 0.051 | 13838 | 6.72 | 0.055 | 13838 |
| PNP-ADMM | 26.55 | 0.865 | 143.9 | 11.65 | 0.642 | 4447 | 8.41 | 0.325 | 9377 | 24.93 | 0.812 | 208.9 | 24.65 | 0.825 | 222.9 |
| Score-SDE（$T=1000$） | 17.62 | 0.617 | 1124 | 18.51 | 0.678 | 916.4 | 13.52 | 0.437 | 2891 | 7.12 | 0.109 | 12620 | 6.58 | 0.102 | 14291 |
| ADMM-TV | 23.86 | 0.803 | 267.4 | 17.81 | 0.814 | 1076 | 22.03 | 0.784 | 407.5 | 22.37 | 0.801 | 376.8 | 21.36 | 0.758 | 475.4 |

### D.1 高维控制

为加速所提方法，本文对标准 iLQR 算法采用三项修改。

**随机低秩近似。** (19)—(25) 中的一阶与二阶项是深度神经函数的相应 Taylor 展开。即便使用自动微分库，构造这些矩阵也极其昂贵，至少需要 $\dim(\mathbf x)$ 次反向传播（某些实验中 $\dim(\mathbf x)\approx390$ 亿）。为降低计算成本，本文利用它们已知的**低秩结构** Sagun et al. [2017]、Oymak et al. [2019]，借助随机数值线性代数中的技术，用**随机 SVD** Halko et al. [2011] 估计 (19)—(25)。对任意矩阵 $\mathbf A\in\mathbb R^{m\times n}$，该过程分四步：1）采样随机矩阵 $\boldsymbol\Omega\sim\mathcal N(\mathbf 0,\mathbf I_{n\times k})$；2）得 $\mathbf A\boldsymbol\Omega=\mathbf Y\in\mathbb R^{m\times k}$；3）在 $\mathbf Y$ 的列上构造基，例如取 QR 分解 $QR=\mathbf Y$ 中的 $Q$ 矩阵；4）近似 $\mathbf A\approx Q^{\top}Q\mathbf A$。

值得注意的是，当 $\mathbf A$ 为 Jacobian（或 Hessian）矩阵时，可**纯粹**通过 Jacobian-向量积与向量-Jacobian 积（Hessian-向量积与向量-Hessian 积）近似它，而**无需**显式构造 $\mathbf A$。此外，随机线性代数的一个关键结果是，该算法的近似误差可达 $\mathcal O(mnk\sigma_{k+1})$（Halko et al. [2011] 定理 1.1）；特别地，若 $\mathbf A$ 具低秩结构且存在 $k$ 使第 $k+1$ 个奇异值 $\sigma_{k+1}=0$，则近似**精确**。

**免矩阵计算。** 受数值优化中的免矩阵技术启发 Knoll and Keyes [2004]，本文展示一种构造动作更新 (15) 的策略：不显式构造 iLQR 算法 (19)—(25) 中代价高昂的 $\dim(\mathbf x)\times\dim(\mathbf x)$ 矩阵（记其索引集为 $\{\mathbf A_i\}$），而是把每个 $\mathbf A_i$ 投影到一组 $\dim(\mathbf x)\times\ell$ 的列正交矩阵 $\{\mathbf Q_i\}$ 上，记 $\mathbf B_i:=\mathbf Q_i^{\top}\mathbf A_i$，从而以 $(\mathbf Q_i,\mathbf B_i)$ 对的形式低成本存储。任意 $\mathbf A_i\mathbf A_j$ 的矩阵乘法随后可按秩 $\ell$ 近似为

$$
\mathbf A_i\mathbf A_j\approx\mathbf Q_i\mathbf B_i\mathbf Q_j^{\top}\mathbf B_j.\tag{79}
$$

为了避免显式构造任何完整尺寸矩阵，本文丢弃前导 $\mathbf Q_i$，得到新的投影矩阵对 $(\mathbf Q_k,\mathbf B_k)$，其中 $\mathbf Q_k=\mathbf Q_i$。

**Adam 优化器。** 最后，本文在施加反馈增益前先用 Adam 优化器 Kingma and Ba [2014] 对梯度做**预条件**，而非采用回溯线搜索 Tassa et al. [2014]，得到动作更新

$$
\mathbf u_t=\mathbf P\mathbf k_t+\mathbf K_t(\mathbf x_t-\mathbf x_t'),\tag{80}
$$

其中 $\mathbf P$ 为 Adam 优化器产生的预条件矩阵。这降低了算法整体运行时间，同时仍考虑尊重优化地形非线性的二阶信息。

### D.2 计算复杂度分析

结合三项修改后，本文可给出算法关于秩 $k$、数据维度 $d$、扩散步数 $m$ 与 iLQR 迭代次数 $n$ 的实际运行时与空间复杂度分析。结合低秩与免矩阵近似，得到输入模式扰动下更新后的方程（投影矩阵记为 $\mathbf P$ 以避免与 $Q$ 函数记号冲突）：

$$
Q_{\mathbf x}=h_{\mathbf x}^{\top}V_{\mathbf x}'\tag{81}
$$
$$
Q_{\mathbf u}=\ell_{\mathbf u}+h_{\mathbf x}^{\top}V_{\mathbf x}'\tag{82}
$$
$$
\mathbf P Q_{\mathbf x\mathbf x}\mathbf P^{\top}=\mathbf P Q_{\mathbf u\mathbf x}\mathbf P^{\top}=\mathbf P Q_{\mathbf x\mathbf u}\mathbf P^{\top}=\mathbf P h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x}\mathbf P^{\top}\tag{83}
$$
$$
\mathbf P Q_{\mathbf u\mathbf u}\mathbf P^{\top}=\mathbf P\ell_{\mathbf u\mathbf u}\mathbf P^{\top}+\mathbf P h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x}\mathbf P^{\top}.\tag{84}
$$

为简化记号，各投影矩阵 $\mathbf P$ 取相同；实际中不必如此。注意 $Q_{\mathbf x}$ 与 $Q_{\mathbf u}$ 只是 $d$ 维、与图像同尺寸，在本文所有数据集中各占 0.2 MB 存储，可忽略，故不对其投影。当 $\ell_{\mathbf u\mathbf u}$ 为对角（本文即如此）时，可由 Woodbury 矩阵求逆公式 Petersen et al. [2008] 得到 $Q_{\mathbf u\mathbf u}$ 的投影逆：

$$
\mathbf P Q_{\mathbf u\mathbf u}^{-1}\mathbf P^{\top}=\mathbf P\ell_{\mathbf u\mathbf u}^{-1}\mathbf P^{\top}-\mathbf P\ell_{\mathbf u\mathbf u}^{-1}\mathbf P^{\top}\left(\mathbf C^{-1}+\mathbf P^{\top}\ell_{\mathbf u\mathbf u}^{-1}\mathbf P\right)^{-1}\mathbf P\ell_{\mathbf u\mathbf u}^{-1}\mathbf P^{\top},\qquad \mathbf C=\mathbf P h_{\mathbf x}^{\top}V_{\mathbf x\mathbf x}'h_{\mathbf x}\mathbf P,\tag{85}
$$

其代价为 $\mathcal O(k^{3}+kd^{2})$。最后，通过

$$
\mathbf k=-\mathbf P^{\top}\mathbf P Q_{\mathbf u\mathbf u}^{-1}\mathbf P^{\top}\mathbf P Q_{\mathbf u}\tag{86}
$$
$$
V_{\mathbf x}=Q_{\mathbf x}-\mathbf P^{\top}\mathbf P\mathbf K^{\top}\mathbf P^{\top}\mathbf P Q_{\mathbf u\mathbf u}\mathbf P^{\top}\mathbf P\mathbf k\tag{87}
$$
$$
\mathbf P\mathbf K\mathbf P^{\top}=-\mathbf P Q_{\mathbf u\mathbf u}^{-1}\mathbf P^{\top}\mathbf P Q_{\mathbf u\mathbf x}\mathbf P^{\top}\tag{88}
$$
$$
\mathbf P V_{\mathbf x\mathbf x}\mathbf P^{\top}=\mathbf P Q_{\mathbf x\mathbf x}\mathbf P^{\top}-\mathbf P\mathbf K^{\top}\mathbf P^{\top}\mathbf P Q_{\mathbf u\mathbf u}\mathbf P^{\top}\mathbf P\mathbf K\mathbf P^{\top}\tag{89}
$$

计算投影更新 $V_{\mathbf x\mathbf x}$、$\mathbf K$ 以及全精度的 $V_{\mathbf x}$、$\mathbf k$ 项。适用时，本文利用标准自动微分库中的向量-Jacobian 积（如 `torch.func.vjp`），其运行时复杂度为 $\mathcal O(1)$。按 (46)—(49) 计算 $V_{\mathbf x}$、$V_{\mathbf x\mathbf x}$、$\mathbf k$、$\mathbf K$ 的矩阵乘法 FLOPs 为 $\mathcal O(k^{3}+kd^{2})$（主要由 $k\times k$ 矩阵 $Q^{\top}Q_{\mathbf u\mathbf u}Q$ 的求逆主导）；关键是它只需 $\mathcal O(k)$ 次神经函数评估（NFE），而 NFE 主导算法运行时。由于该计算对每个扩散步与每次 iLQR 迭代执行，算法总运行时复杂度为 $\mathcal O(nm(k^{3}+kd^{2}))$ 矩阵乘法 FLOPs 与 $\mathcal O(nmk)$ 次 NFE，空间复杂度为 $\mathcal O(mk^{2}+d)$。就时间而言，NFE 是主导成本，占计算时间的 97%。

### D.3 超参数敏感性

本文在表 4、表 5、表 6 中研究低秩近似与免矩阵投影的秩、Tikhonov 正则化系数 $\alpha$ 以及扩散时间 $T$ 对方法性能的影响；评估在超分辨率与随机修补任务上进行，设置同第 6 节。

**表 4：低秩与免矩阵近似的秩对性能的影响（FFHQ 256×256-1K）。**

| 秩设置 | SR×4 LPIPS↓ | SR×4 PSNR↑ | SR×4 SSIM↑ | SR×4 MSE↓ | 随机修补 LPIPS↓ | 随机修补 PSNR↑ | 随机修补 SSIM↑ | 随机修补 MSE↓ |
|---|---|---|---|---|---|---|---|---|
| $k=0$ | 0.254 | 24.00 | 0.691 | 141.2 | 0.121 | 28.33 | 0.755 | 56.74 |
| $k=1$ | 0.171 | 27.45 | 0.792 | 117.0 | 0.053 | 31.84 | 0.882 | 42.57 |
| $k=4$ | 0.171 | 27.47 | 0.794 | 116.4 | 0.052 | 31.99 | 0.883 | 41.12 |
| $k=16$ | 0.170 | 27.43 | 0.799 | 117.5 | 0.050 | 32.12 | 0.891 | 39.90 |

**表 5：Tikhonov 正则化系数 $\alpha$ 对性能的影响（FFHQ 256×256-1K）。**

| $\alpha$ | SR×4 LPIPS↓ | SR×4 PSNR↑ | SR×4 SSIM↑ | SR×4 MSE↓ | 随机修补 LPIPS↓ | 随机修补 PSNR↑ | 随机修补 SSIM↑ | 随机修补 MSE↓ |
|---|---|---|---|---|---|---|---|---|
| $\alpha=0$ | – | – | – | – | – | – | – | – |
| $\alpha=10^{-7}$ | 0.173 | 27.49 | 0.794 | 115.9 | 0.050 | 31.80 | 0.879 | 42.96 |
| $\alpha=10^{-4}$ | 0.171 | 27.45 | 0.792 | 117.0 | 0.053 | 31.84 | 0.882 | 42.57 |
| $\alpha=1$ | 0.172 | 27.43 | 0.799 | 117.5 | 0.050 | 31.85 | 0.891 | 42.47 |
| 引理 4.2 的 $\alpha$ | 0.170 | 27.44 | 0.788 | 117.3 | 0.051 | 31.86 | 0.880 | 42.44 |

**表 6：扩散步数 $T$ 对性能的影响（FFHQ 256×256-1K）。**

| $T$ | SR×4 LPIPS↓ | SR×4 PSNR↑ | SR×4 SSIM↑ | SR×4 MSE↓ | 随机修补 LPIPS↓ | 随机修补 PSNR↑ | 随机修补 SSIM↑ | 随机修补 MSE↓ |
|---|---|---|---|---|---|---|---|---|
| $T=10$ | 0.198 | 27.48 | 0.783 | 125.6 | 0.168 | 27.46 | 0.771 | 123.7 |
| $T=20$ | 0.193 | 31.79 | 0.859 | 117.0 | 0.108 | 34.41 | 0.910 | 42.57 |
| $T=50$ | 0.171 | 27.45 | 0.792 | 90.79 | 0.053 | 31.84 | 0.882 | 40.56 |
| $T=200$ | 0.155 | 28.55 | 0.811 | 43.05 | 0.048 | 32.05 | 0.899 | 23.17 |

**低秩与免矩阵秩。** 由表 4 可见，即使秩为一的近似也能带来显著性能提升，随后增加秩的收益迅速递减。这是因为提高近似秩只改善二阶项的近似；一阶项 $V_{\mathbf x}$、$Q_{\mathbf x}$、$Q_{\mathbf u}$ 由于适合向量-Jacobian 积，总是以每迭代 $\mathcal O(1)$ 时间**精确**建模。由定理 4.1—4.3 可见，即使二阶项为零（即 $\ell_t=0$ 假设的结果），也能精确恢复真实后验采样器，因此二阶项较不重要，但仍有助于施加二次信赖域正则化。本文最终取 $k=1$，原因有三：1）秩只影响 iLQR 的二次近似（不影响定理 4.1—4.3 的理论结果）；2）$k=1$ 已允许二次信赖域正则化的二阶传播；3）继续增大 $k$ 对性能影响极小。

**Tikhonov 正则化。** 表 5 表明算法对 Tikhonov 正则化参数相对稳健，但 $\alpha=0$ 除外：此时 $Q_{\mathbf u\mathbf u}$ 的任何病态都会导致除零错误、算法失败。因此本文简单取 $\alpha=10^{-4}$，因为正则化影响极小。

**扩散步数。** 表 6 显示增加扩散时间可带来更高质量样本，代价是计算时间增加。因此 $T$ 的选择需要在计算成本与样本质量间平衡，最终高度依赖用户：当计算与延迟预算较高时，可用较大 $T$ 提升样本质量；反之，$T=20$ 即可给出合理样本。

## NeurIPS 论文检查表（摘译）

1. **声明：** 是——通过严格的算法分析与在多个数据集、多种逆问题设置上的大量实验展示结果。
2. **局限：** 是——论文讨论了运行时成本，并给出等预算分析，显示在各基准上仍具竞争力。
3. **理论假设与证明：** 是——论文在附录中给出全部理论的完整证明。
4. **实验结果可复现性：** 是——论文在附录中披露全部超参数与实现细节。
5. **数据与代码开放获取：** 是——数据公开可得；代码将接收后发布。
6. **实验设置/细节：** 是——全部细节在附录中给出。
7. **实验统计显著性：** 不适用——其他工作的实验未提供误差棒，给出误差棒对本文分析无益。
8. **实验计算资源：** 是——实验可在任意 A4000 或更高 GPU 上运行。
9. **伦理准则：** 是——完全遵循 NeurIPS 伦理准则。
10. **更广泛影响：** 是——论文在附录中讨论。
11. **防护措施：** 不适用——结果无高误用风险。
12. **现有资产许可：** 是——所有资产创作者与原始所有者均已致谢。
13. **新资产：** 不适用——未引入新资产。
14. **众包与人类受试者：** 不适用——未进行人类受试者研究。
15. **IRB 批准：** 不适用——未进行人类受试者研究。

## 图注与表注

**图 1：** 概率后验采样器与本文提出的基于最优控制的采样器的概念对比。概率采样器依赖近似 $\widetilde{\mathbf x}_0\approx\mathbf x_0$ 引导每步（左）；本文能在每步精确计算 $\mathbf x_0$，得到质量高得多的梯度 $\nabla\log p(\mathbf y\mid\widetilde{\mathbf x}_0)$ 与改进的轨迹更新（右）。

**图 2：** 对一般扩散轨迹，概率框架中预测的 $\mathbf x_0$（上）与本文方法（下）的对比。本文框架中的完整前向展开使预测 $\mathbf x_0$（因而 $\nabla_{\mathbf x_t}\log p(\mathbf y\mid\mathbf x_0)$）可对所有 $t=0,\ldots,T$ 高效计算。

**图 3：** $4\times$ 超分辨率任务中逆问题解随总扩散步数 $T$ 的变化。与 DPS（上排）相比，本文方法（下排）的解质量更高、更符合约束 $\mathbf A\mathbf x=\mathbf y$，且对 $T$ 更稳定。

**图 4：** FFHQ $256\times256$ 上逆问题任务的示例。每列从左到右依次为真值、测量、DPS 与本文方法。

**图 5：** 类条件逆问题的示例。DPS（左）与本文方法（右）对比；每行对应一个不同的 MNIST 目标类别。

**图 6：** 对分数函数近似质量的稳健性。使用**随机初始化**扩散模型的 $4\times$ 超分辨率任务中，DPS 无法产生可行解，而本文方法仍可。

**表注：** 表 1 为 FFHQ 256×256-1K 上逆问题的 FID/LPIPS 定量评估（原文以粗体标出各任务最优值，本页保留）；表 2 为 FFHQ 实验超参数；表 3 为同数据集的 PSNR/SSIM/MSE 评估；表 4 为低秩与免矩阵近似的秩消融；表 5 为 Tikhonov 系数 $\alpha$ 消融（$\alpha=0$ 因矩阵求逆数值精度错误无结果）；表 6 为扩散步数 $T$ 消融。

## 本页范围与校对状态

**覆盖范围：** 本页为 NeurIPS 2024 会议论文集版本（23 页）的全文中文译稿，按原文结构译出：摘要；第 1 节引言；第 2 节背景（记号、2.1 扩散模型、2.2 逆问题的后验采样、2.3 最优控制）；第 3 节扩散最优控制（输入/输出扰动控制、iLQR 简化、算法 1、3.1 高维控制）；第 4 节改进的后验采样（定理 4.1、引理 4.2、定理 4.3，对离散化的脆弱性、条件分数不可解性、对近似分数的依赖、表 1）；第 5 节相关工作；第 6 节实验；第 7 节结论与局限；参考文献 57 条；附录 A（影响声明）、附录 B（iLQR 推导）、附录 C（定理与引理证明）、附录 D（实现、D.1 高维控制、D.2 计算复杂度、D.3 超参数敏感性与表 2—表 6）；NeurIPS 论文检查表 15 项（摘译）；图 1—图 6 图注。

**源文页码：** 第 1—2 页（题名、作者、摘要、引言、图 1）→ 第 3—4 页（2.1—2.3、图 2—图 3）→ 第 4—5 页（第 3 节与算法 1）→ 第 5—7 页（3.1、第 4 节、定理 4.1—4.3）→ 第 8—9 页（表 1、相关工作、图 5—图 6）→ 第 9—10 页（实验、结论）→ 第 10—12 页（参考文献）→ 第 13—15 页（NeurIPS 检查表）→ 第 16—23 页（附录 A—D、表 2—表 6）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；表 1 与表 3 的全部数值已按 PDF 第 8、21 页渲染图逐项核对（含粗体最优值），表 2、表 4—表 6 按文本层转录。
2. 图 1—图 6 均未上传图片；本页以"图注与表注"小节统一给出 6 条中文图注与 6 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖正文 (1)—(32) 与附录 (33)—(89)，按页内顺序连续编号；**附录中若干原文分步展示的公式被合并为一个显示**（如定理 4.1 证明中的三行 Vxx 推导），故附录编号与原文存在小幅偏移，公式内容逐一对应。
4. **原文疑点／说明：** ①原文参考文献含重复条目（Schrödinger bridge 一文出现两次，本页以 [6] 与 [52] 并列并注明）；②原文 (2) 式排版有误，写作 "d**x**<sub>t</sub> = d**x**<sub>t</sub> + [...]"，本页按语义译出 PF-ODE 并保留原式形式说明；③原文第 4 节定理 4.1 与 4.3 的终端代价符号相反（(27) 为 $-\log p$，(30) 为 $+\log p$），按原文照录；④原文附录 C 中引理 C.1 的证明把 α 代入 (29) 后与 (18) 对照，符号按原文照录；⑤算法 1 伪代码中的 $x'$ 与 $x$ 记号沿用原文；⑥检查表为摘译（答案与要点，未逐字翻译指南说明）。
5. **许可与登记：** 原文为 NeurIPS 2024 会议论文集版本，再传播许可**待核验**；本页仅作学习用途、**不计入本站可公开全文统计**，页面顶部与状态段均已注明。
6. 版权：本页为中文翻译页面，未上传原文 PDF；如后续确认许可，再按站点流程更新发布状态。

{% endraw %}

