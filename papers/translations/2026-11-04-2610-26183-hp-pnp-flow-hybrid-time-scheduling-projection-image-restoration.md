---
layout: page
title: "HP-PnP-Flow：基于流匹配的即插即用图像恢复混合时间调度与投影｜中文全文译文"
permalink: /papers/translations/2026-11-04-2610-26183-hp-pnp-flow-hybrid-time-scheduling-projection-image-restoration/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a4af8916bad0d6c0/) · [原文 arXiv](https://arxiv.org/abs/2610.26183/) · [全部目录](/papers/catalog/)

# HP-PnP-Flow：基于流匹配的即插即用图像恢复混合时间调度与投影

**原题：** HP-PnP-Flow: Hybrid Time Scheduling and Projection for Plug-and-Play Image Restoration via Flow Matching  
**作者：** Yong Li、Xiaojie Wang、Xiaoyan Zhang（单位按 PDF 原文转写）  
**单位：** 中南大学数学与统计学院、HNP-LAMA（School of Mathematics and Statistics, HNP-LAMA, Central South University），长沙 410083，湖南，中国。原文标注日期：November 3, 2026。  
**版本：** arXiv:2610.26183v2（PDF 首页 arXiv 戳：arXiv:2610.26183v2 [cs.CV]，2 Nov 2026）；30 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、AMS 主题分类与关键词、第 1–5 节全部正文与小节（§2.1–2.4、§3、§4.1–4.5）、定义 2.1/2.2/3.2、命题 2.3/3.1、定理 3.3（含证明）、式 (1.1)–(3.10)（保留原编号）、表 1–6（逐格转写）、图 1–15 图注、算法 1–2、附录 A–B、参考文献 [1]–[43]（英文原条目）；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

**基金与邮箱（原文首页脚注）：** 本工作受国家自然科学基金（12471394、12371417、12071488）与湖南省基础科学研究中心数学分析中心（Hunan Basic Science Research Center for Mathematical Analysis，2024JC2002）资助。邮箱：`15572158033@163.com`、`x.j.wang7@csu.edu.cn`、`x.y.zhang@csu.edu.cn`。

## 摘要

图像恢复是一个基本逆问题，旨在从退化观测中恢复高质量图像。即插即用（Plug-and-Play, PnP）方法为把预训练去噪器集成到迭代重建中提供了灵活框架，而流匹配（flow matching）提供了基于连续时间 ODE 动力学的高效生成建模途径。最近，Martin 等（ICLR, 2025）提出 PnP-Flow 方法，通过由预训练流匹配模型构造的时间相关去噪器，把 PnP 框架与流匹配结合起来。本文通过引入一种不同的时间调度与一个额外的像素空间投影算子，提出一种新的高效 PnP-Flow 算法（HP-PnP-Flow），它在温和假设下具有严格的收敛保证，而不必施加前述工作所要求的、对迭代的限制性条件。在 CelebA 与 AFHQ-Cat 上的数值实验表明，新提出的 HP-PnP-Flow 算法在去噪、去模糊、超分、随机修复与盒状修复等多种恢复任务上显著优于 PnP-Flow。值得注意的是，我们的算法以显著更少的迭代次数即可达到相当或更好的重建质量：在 AFHQ-Cat 上把去模糊与超分的迭代次数从 500 降到 100。

**AMS 主题分类：** 65J22、68U10、65K10。

**关键词：** 图像重建（image reconstruction）、流匹配（flow matching）、即插即用（plug-and-play）、混合时间调度（hybrid time scheduling）、投影算子（projection operator）。

## 1 引言

图像恢复在数字摄影、医学成像、遥感、监控与数字娱乐等广泛应用中一直是一个长期问题 [34, 39]。给定退化观测，目标是恢复潜在的干净图像，其中退化可能来自图像获取、传输或处理过程中的各种因素 [15, 16, 22, 23, 32]。此类恢复任务通常可表述为如下观测模型下的逆问题：

$$
\mathbf{y}=H\mathbf{x}+\boldsymbol{\zeta},\tag{1.1}
$$

其中 \(\mathbf{x}\in\mathbb{R}^d\) 表示未知高质量图像，\(\mathbf{y}\in\mathbb{R}^m\) 是退化观测，\(H:\mathbb{R}^d\to\mathbb{R}^m\) 表示退化算子，\(\boldsymbol{\zeta}\) 描述潜在的加性噪声。问题固有的不适定性与高维性对准确、稳定的重建构成重大挑战。

从贝叶斯视角 [18, 24, 37]，未知图像 \(\mathbf{x}\) 与观测 \(\mathbf{y}\) 被视为随机变量。由贝叶斯定理，相应的最大后验（MAP）估计由下式给出：

$$
\hat{\mathbf{x}}_{\mathrm{MAP}}=\arg\max_{\mathbf{x}\in\mathbb{R}^d}\log p(\mathbf{x}\mid\mathbf{y})=\arg\min_{\mathbf{x}\in\mathbb{R}^d}\left\{-\log p(\mathbf{y}\mid\mathbf{x})-\log p(\mathbf{x})\right\},\tag{1.2}
$$

其中 \(\log p(\mathbf{y}\mid\mathbf{x})\) 表示观测 \(\mathbf{y}\) 的对数似然，\(\log p(\mathbf{x})\) 给出干净图像 \(\mathbf{x}\) 的先验，且与退化图像 \(\mathbf{y}\) 无关。然而，该框架中的图像先验 \(p(\mathbf{x})\) 通常是未知或难以处理的。为说明这一点，负对数先验通常被显式正则项替代，导致如下优化问题：

$$
\arg\min_{\mathbf{x}\in\mathbb{R}^d}\left\{f(\mathbf{x})+g(\mathbf{x})\right\},\tag{1.3}
$$

其中 \(f(\mathbf{x})=-\log p(\mathbf{y}\mid\mathbf{x})\) 表示数据保真项。特别地，在加性高斯噪声 \(\boldsymbol{\zeta}\sim\mathcal{N}(\mathbf{0},\sigma^2 I_d)\) 下，数据保真项取形式 \(f(\mathbf{x})=\frac{1}{2\sigma^2}\|H\mathbf{x}-\mathbf{y}\|^2\)。

近年来，正则化最小化问题 (1.3) 受到了大量关注。早期工作通过近端分裂方法求解该问题，这些方法分别处理数据保真项与正则项。例如，前向—后向分裂（FBS）[5, 11] 在 \(f\) 可微时交替执行对 \(g\) 的近端操作与对 \(f\) 的梯度下降步。在更一般的设定中，半二次分裂（HQS）[17]、交替方向乘子法（ADMM）[2] 或 Douglas–Rachford 分裂（DRS）[14] 对 \(f\) 与 \(g\) 都使用近端操作。

**即插即用（PnP）方法。** 由于为复杂先验设计有效正则项具有挑战性，[38] 的作者引入了即插即用（PnP）方法，用现成的去噪器（如 DnCNN [42] 或 DRUNet [41]）替代近端算子。过去几年，各种 PnP 方法及其收敛分析受到了大量关注（例如见 [21, 29, 30, 33, 36] 及其参考文献）。例如，[40] 的作者首次在“先验失配”（即去噪器在与当前推理任务不同的数据分布上训练）下，为即插即用近端梯度下降（PnP-PGD）给出了新的收敛理论。通过引入神经网络去噪器，PnP 方法在各种图像恢复任务上取得了有希望的结果。然而，经典 PnP 方法通常依赖通用判别式去噪器，而这类去噪器可能没有可用的显式正则函数。这既限制了该方法的优化解释，也限制了它表示复杂图像分布的能力。

**PnP-Flow 方法。** 生成模型通过建模潜在数据分布提供了自然的替代方案，并在图像生成、逆问题与广泛相关应用中取得了当前最优性能 [6, 10, 13, 19, 25, 26, 35]。特别地，流匹配学习一个时间相关的向量场，其 ODE 流把基分布输运到数据分布。由于训练目标更简单、采样更高效，流匹配最近已成为连续时间生成建模的强大框架。这些进展促使人们在 PnP 框架内使用生成模型作为图像先验。最近，Martin 等 [28] 通过使用预训练流匹配模型定义时间相关去噪器，引入了 PnP-Flow 匹配方法。在正则性假设与基分布有界支撑下，他们在“迭代保持有界”、以及“时间序列满足 \(\sum_{k=0}^{\infty}(1-t_k)<\infty\)”的附加假设下建立了收敛性。

尽管 PnP-Flow 具有良好的重建性能，但它仍有若干局限。一方面，施加在时间序列上的条件在实践中难以满足。例如，[28] 中使用的线性调度 \(t_k=k/N\) 不满足关于迭代预算 \(N\) 的一致有界性。另一方面，收敛保证是在迭代有界的前提下得到的，而这一性质并非原算法显式保证的。受此启发，我们提出以下问题：

> 能否设计一种改进的 PnP-Flow 算法，在温和假设下具有严格的收敛保证，同时取得更好的重建效率与质量？

**一种改进的 HP-PnP-Flow 算法。** 在本工作中，我们通过提出混合—投影 PnP-Flow（HP-PnP-Flow）算法来解决该问题，它基于一种不同的时间调度与一个额外的像素空间投影算子。更确切地说，由 (3.1) 给出的混合时间调度结合了几何段与线性段，而由 (3.3) 定义的投影算子显式地把迭代约束到规定的像素范围。在温和且合理的假设下，我们建立了 HP-PnP-Flow 的收敛性（见定理 3.3），且不要求 [28] 中原 PnP-Flow 框架所施加的迭代先验有界假设。此外，新的混合时间调度确保所得时间序列满足一致有界假设 \(\sum_{k=0}^{\infty}(1-t_k)<\infty\)。值得注意的是，数值实验展示了新算法的效率与高质量。消融研究进一步验证了初始时间偏移 \(t_0\) 与混合时间调度各自的作用，二者结合取得最佳总体性能。总之，我们的主要贡献如下：

- 我们通过引入一种新的混合时间调度与一个额外的像素空间投影算子，提出一种改进的 PnP-Flow 算法，称为 HP-PnP-Flow。
- 我们在温和且合理的假设下证明了新提出的 HP-PnP-Flow 算法的收敛性，从而把 HP-PnP-Flow 确立为有理论基础的算法。
- 在两个数据集、五项任务上的大量实验表明，我们的算法在重建质量与收敛效率方面显著优于 PnP-Flow。

本文其余部分组织如下。下一节汇集一些记号，并介绍贯穿全文的即插即用（PnP）、流匹配与 PnP-Flow 背景。第 3 节给出所提方法与本文的主要结果。第 4 节进行数值实验以展示所提算法的有效性。最后，最后一节给出一些结论性评述。

## 2 预备知识

### 2.1 记号

全文用 \(\mathbb{N}\) 表示全体正整数之集合，并令 \(d\in\mathbb{N}\)。对任意正整数 \(m\)，记 \([m]:=\{1,\ldots,m\}\) 与 \([m]_0:=\{0,1,\ldots,m\}\)。令 \(I_d\in\mathbb{R}^{d\times d}\) 表示单位矩阵，\(\|\cdot\|\) 表示 \(\mathbb{R}^d\) 中向量的欧氏范数。对函数 \(f:\mathbb{R}^d\to\mathbb{R}\)，记 \(\partial_i f\) 表示 \(f\) 的第 \(i\) 个偏导数。梯度 \(\nabla f\) 是偏导数组成的向量 \((\partial_1 f,\partial_2 f,\ldots,\partial_d f)\)。对向量场 \(F=(F_1,F_2,\ldots,F_d):\mathbb{R}^d\to\mathbb{R}^d\)，记其散度为 \(\nabla\cdot F=\sum_{i=1}^{d}\partial_i F_i\)。令 \(\mathcal{P}(\mathbb{R}^d)\) 表示 \((\mathbb{R}^d,\mathcal{B}(\mathbb{R}^d))\) 上全体概率分布构成的空间。用 \(\cdot_{\#}\) 表示推前（push-forward）操作。

### 2.2 即插即用（PnP）

在本工作中，我们聚焦于求解优化问题 (1.3)。当 \(g\) 非光滑时，标准梯度下降通常不能直接适用。近端分裂方法转而用梯度步处理光滑项 \(f\)，并通过其近端算子处理正则项 \(g\)。下面回顾近端算子的定义。

**定义 2.1（近端算子）。** 令 \(g:\mathbb{R}^d\to\mathbb{R}\cup\{+\infty\}\) 为真的下半连续凸函数。\(g\) 在步长 \(\gamma>0\) 下的近端算子定义为映射 \(\mathrm{prox}_{\gamma g}:\mathbb{R}^d\to\mathbb{R}^d\)：

$$
\mathrm{prox}_{\gamma g}(\mathbf{z}):=\arg\min_{\mathbf{x}\in\mathbb{R}^d}\left\{g(\mathbf{x})+\frac{1}{2\gamma}\|\mathbf{x}-\mathbf{z}\|^2\right\}.\tag{2.1}
$$

二次项使近端子问题强凸，因此极小点唯一。直观上，\(\mathrm{prox}_{\gamma g}(\mathbf{z})\) 找到一个既保持接近 \(\mathbf{z}\)、又降低正则项 \(g\) 的点。

前向—后向分裂（FBS）算法 [5, 11, 12] 交替执行对 \(f\) 的前向梯度步与对 \(g\) 的后向近端步：

$$
\begin{cases}
\mathbf{u}_k=\mathbf{x}_k-\gamma_k\nabla f(\mathbf{x}_k),\\
\mathbf{x}_{k+1}=\mathrm{prox}_{\gamma_k g}(\mathbf{u}_k).
\end{cases}\tag{2.2}
$$

这里 \(\gamma_k\in(0,2/L)\) 表示步长，\(L\) 是 \(\nabla f\) 的 Lipschitz 常数。在 FBS 的标准假设下，该步长条件保证迭代收敛到极小点（细节见 [5]）。然而在实践中，设计一个能准确捕捉复杂图像先验的显式正则项 \(g\) 往往具有挑战性。即插即用（PnP）框架 [38] 把该迭代中的近端步替换为预训练去噪器 \(D_\sigma:\mathbb{R}^d\to\mathbb{R}^d\)，其中 \(\sigma\) 控制去噪强度，从而在不需要显式正则项 \(g\) 的情况下引入隐式图像先验。所得的 PnP-FBS 迭代为

$$
\begin{cases}
\mathbf{u}_k=\mathbf{x}_k-\gamma_k\nabla f(\mathbf{x}_k),\\
\mathbf{x}_{k+1}=D_\sigma(\mathbf{u}_k).
\end{cases}\tag{2.3}
$$

PnP 把优化类方法的灵活性与神经网络的表达能力结合起来，在一系列图像恢复任务上取得了强性能。

### 2.3 流匹配

流匹配 [1, 25] 是一种生成建模框架，它学习一个时间相关向量场，把样本从基分布 \(\nu\in\mathcal{P}(\mathbb{R}^d)\)（例如标准高斯）输运到数据分布 \(\mu\in\mathcal{P}(\mathbb{R}^d)\)。相应的流 \(\phi:[0,1]\times\mathbb{R}^d\to\mathbb{R}^d\) 由如下常微分方程（ODE）支配：

$$
\frac{\mathrm{d}}{\mathrm{d}t}\phi_t(\mathbf{x})=v_t(\phi_t(\mathbf{x})),\quad \phi_0(\mathbf{x})=\mathbf{x}_0.\tag{2.4}
$$

一旦速度场 \(v\) 学习完成，从数据分布采样只需解 ODE (2.4) 得到 \(\mathbf{x}_1\sim\mu\)（细节见 [8]）。此外，流 \(\phi_t\) 把初始分布 \(p_0\) 输运为概率密度路径 \(p_t=(\phi_t)_{\#}p_0\)，它满足连续性（Liouville）方程

$$
\partial_t p_t(\mathbf{x})+\nabla\cdot\left(p_t(\mathbf{x})v_t(\mathbf{x})\right)=0.\tag{2.5}
$$

该方程刻画了由时间相关向量场 \(v_t\) 诱导的密度演化（见 [3]）。流匹配的目标是学习流 ODE (2.4) 的速度场。该学习过程在于最小化如下损失函数：

$$
\mathcal{L}_{\mathrm{FM}}(\theta):=\mathbb{E}_{t\sim U[0,1],\,\mathbf{x}\sim p_t}\left[\left\|v_t^\theta(\mathbf{x})-v_t(\mathbf{x})\right\|^2\right],\tag{2.6}
$$

其中 \(v_t^\theta\) 由权重为 \(\theta\) 的神经网络参数化。然而在实践中，边缘速度场 \(v_t(\mathbf{x})\) 通常不可得，这使流匹配目标难以直接评估。为规避这一困难，流匹配转而依赖一种可处理的条件表述。

给定数据样本 \(\mathbf{x}_1\sim p_1\)，可以构造在 \(t=0\) 的基分布 \(p_0\) 与 \(t=1\) 的目标分布 \(p_1\) 之间插值的条件概率路径 \(p_t(\mathbf{x}\mid\mathbf{x}_1)\)，以及相关的条件向量场 \(v_t(\cdot\mid\mathbf{x}_1)\) [26, 28]。对线性插值

$$
\mathbf{x}_t=(1-t)\mathbf{x}_0+t\mathbf{x}_1,\quad \mathbf{x}_0\sim p_0,\ \mathbf{x}_1\sim p_1,\tag{2.7}
$$

沿插值路径的相应条件向量场为 \(v_t(\mathbf{x}_t\mid\mathbf{x}_1)=\mathbf{x}_1-\mathbf{x}_0\)。[25] 的一个关键结果是：条件流匹配（CFM）目标关于模型参数的梯度与相应的边缘流匹配目标相同。因此，最小化 CFM 目标可让神经向量场 \(v^\theta\) 学到相关的边缘向量场，而只需要端点对 \((\mathbf{x}_0,\mathbf{x}_1)\) 的样本与相应的条件向量场。对上述线性插值，CFM 损失取形式

$$
\mathcal{L}_{\mathrm{CFM}}(\theta):=\mathbb{E}_{t\sim U[0,1],\,(\mathbf{x}_0,\mathbf{x}_1)\sim\pi}\left[\left\|v_t^\theta(\mathbf{x}_t)-(\mathbf{x}_1-\mathbf{x}_0)\right\|^2\right],\tag{2.8}
$$

其中 \(\pi\) 表示基分布 \(p_0\) 与目标分布 \(p_1\) 之间的耦合，即 \((\mathbf{x}_0,\mathbf{x}_1)\) 上的联合分布，其边缘分别为 \(p_0\) 与 \(p_1\)。独立耦合 \(\pi=p_0\otimes p_1\) 对应分别从 \(p_0\) 与 \(p_1\) 独立采样 \(\mathbf{x}_0\) 与 \(\mathbf{x}_1\)。这种独立配对可能导致输运路径相交，从而增加待学速度场的复杂度。

对上述线性插值，条件速度为 \(\mathbf{x}_1-\mathbf{x}_0\)，相应的边缘向量场由 \(v_t(\mathbf{x})=\mathbb{E}[\mathbf{x}_1-\mathbf{x}_0\mid\mathbf{x}_t=\mathbf{x}]\) 给出。流匹配的一个基本结果 [25] 表明，该边缘向量场可以通过可处理的条件流匹配目标来学习。为说明所学流匹配模型诱导的输运过程，图 1 可视化了 CelebA 上样本沿所学 ODE 轨迹在不同时间点的演化。

**图 1（原文 Figure 1）：** CelebA 上样本沿所学流匹配轨迹在不同时间点的演化。ODE (2.4) 使用前向 Euler 法、步长 0.01 进行积分。

### 2.4 PnP-Flow：即插即用与流匹配

给定预训练流匹配向量场 \(v^\theta\)，可由沿规定插值路径的中间状态 \(\mathbf{x}_t\) 构造干净端点 \(\mathbf{x}_1\) 的估计。我们首先给出如下定义。

**定义 2.2（流匹配去噪器 [28]）。** 给定预训练流匹配向量场 \(v^\theta\)，时间相关去噪器 \(D_t:\mathbb{R}^d\to\mathbb{R}^d\) 定义为

$$
D_t(\mathbf{x}):=\mathbf{x}+(1-t)v_t^\theta(\mathbf{x}),\quad t\in[0,1].\tag{2.9}
$$

接下来，我们解释 (2.9) 中去噪器选择的动机。对线性插值

$$
\mathbf{x}_t=(1-t)\mathbf{x}_0+t\mathbf{x}_1,\quad (\mathbf{x}_0,\mathbf{x}_1)\sim\pi,
$$

CFM 损失 (2.8) 在所有可行向量场上的极小点 \(v_t^\star\) 由

$$
v_t^\star(\mathbf{x})=\mathbb{E}_{(\mathbf{x}_0,\mathbf{x}_1)\sim\pi}\left[\mathbf{x}_1-\mathbf{x}_0\mid\mathbf{x}_t=\mathbf{x}\right]
$$

给出。实践中用学习到的向量场 \(v^\theta\) 替代 \(v_t^\star\)，得到实用去噪器 \(D_t\)。因此，相应的理想去噪器对任意 \(\mathbf{x}\in\mathbb{R}^d\) 与 \(t\in[0,1]\) 满足

$$
\begin{aligned}
D_t(\mathbf{x})&=\mathbf{x}+(1-t)v_t^\star(\mathbf{x})\\
&=\mathbb{E}_{(\mathbf{x}_0,\mathbf{x}_1)\sim\pi}\left[\mathbf{x}_t+(1-t)(\mathbf{x}_1-\mathbf{x}_0)\mid\mathbf{x}_t=\mathbf{x}\right]\\
&=\mathbb{E}_{(\mathbf{x}_0,\mathbf{x}_1)\sim\pi}\left[\mathbf{x}_1\mid\mathbf{x}_t=\mathbf{x}\right].
\end{aligned}\tag{2.10}
$$

因此，\(D_t(\mathbf{x})=\mathbb{E}_{(\mathbf{x}_0,\mathbf{x}_1)\sim\pi}[\mathbf{x}_1\mid\mathbf{x}_t=\mathbf{x}]\) 是给定 \(\mathbf{x}_t=\mathbf{x}\) 时干净端点 \(\mathbf{x}_1\) 的最小均方误差（MMSE）估计，[31, 43] 中也使用了该估计。

**PnP-Flow 算法。** 最近，[28] 的作者把 (2.9) 中定义的时间相关去噪器 \(D_t\) 引入 FBS 框架，得到

$$
\begin{cases}
\mathbf{u}_k=\mathbf{x}_k-\gamma_k\nabla f(\mathbf{x}_k),\\
\mathbf{y}_k=(1-t_k)\boldsymbol{\xi}_k+t_k\mathbf{u}_k,\\
\mathbf{x}_{k+1}=D_{t_k}(\mathbf{y}_k),
\end{cases}\tag{2.11}
$$

其中 \(\{\boldsymbol{\xi}_k\}_{k\in[N-1]_0}\) 是从基分布 \(p_0\) 抽取的独立同分布（i.i.d.）隐变量样本序列。该迭代与经典 PnP-FBS 方案 (2.3) 的区别在于：去噪器 \(D_t\) 显式依赖于时间，且梯度更新在去噪前先沿插值路径重新投影。为清晰起见，我们在算法 1 中勾勒上述 PnP-Flow 算法。

**算法 1（原文 Algorithm 1）：** PnP-Flow 迭代。

- **输入：** 初始化 \(\mathbf{x}_0\)、总迭代次数 \(N\)、步长 \(\{\gamma_k\}_{k\in[N-1]_0}\)、时间序列 \(\{t_k\}_{k\in[N-1]_0}\)（\(t_0=0\)）。
- **输出：** 重建图像 \(\mathbf{x}_N\)。
1. **for** \(k=0\) **to** \(N-1\) **do**
2. 　\(\mathbf{u}_k=\mathbf{x}_k-\gamma_k\nabla f(\mathbf{x}_k)\)　▷ 梯度步
3. 　\(\mathbf{y}_k=(1-t_k)\boldsymbol{\xi}_k+t_k\mathbf{u}_k,\ \boldsymbol{\xi}_k\sim p_0\)　▷ 插值
4. 　\(\mathbf{x}_{k+1}=D_{t_k}(\mathbf{y}_k)\)　▷ 流匹配去噪
5. **end for**
6. **return** \(\mathbf{x}_N\)

**步长的选择。** 为平衡数据保真更新与流匹配去噪器的贡献，[28] 的作者采用如下时间相关步长：

$$
\gamma_k=(1-t_k)^\alpha,\quad \alpha\in(0,1].\tag{2.12}
$$

因此步长随 \(t\) 逐渐减小，在迭代后段降低数据保真更新的影响；关于该选择的进一步动机见 [28]。这一选择在实践中取得了良好的数值性能。

回顾去噪器定义 \(D_t(\mathbf{x}):=\mathbf{x}+(1-t)v_t^\theta(\mathbf{x})\)，我们观察到因子 \(1-t\) 会随 \(t\to1\) 逐步衰减由流匹配先验诱导的修正。因此，\(D_t\) 趋近于恒等映射，且 \(D_1=\mathrm{Id}\)。这提供了一种依赖流时间、用于控制所学先验强度的机制，与基于预定义去噪算子的传统 PnP 方法 [7, 38] 形成对比。把 \(D_{t_k}\) 的定义代入 (2.11) 的最后一个方程，可得如下紧凑更新规则：

$$
\mathbf{x}_{k+1}=(1-t_k)\boldsymbol{\xi}_k+t_k\left(\mathbf{x}_k-\gamma_k\nabla f(\mathbf{x}_k)\right)+(1-t_k)v_{t_k}^\theta(\mathbf{y}_k),\tag{2.13}
$$

其中第一项对应插值步中基噪声的贡献，第二项包含基于梯度的数据保真更新，第三项给出所学流匹配先验诱导的修正。

在一些正则性假设下，PnP-Flow 算法 (2.11) 具有如下收敛结果（见 [28, Proposition 4]）。

**命题 2.3（PnP-Flow 的收敛性）。** 假设 \(f:\mathbb{R}^d\to\mathbb{R}\) 连续可微，所学向量场 \(v^\theta:[0,1]\times\mathbb{R}^d\to\mathbb{R}^d\) 连续，且基分布 \(p_0\) 具有有界支撑。令时间序列 \(\{t_k\}_{k\in\mathbb{N}}\) 满足 \(\sum_{k=0}^{\infty}(1-t_k)<+\infty\)，并设 \(\gamma_k:=1-t_k,\ k\in\mathbb{N}\)。若 PnP-Flow 算法 (2.11) 产生的序列 \(\{\mathbf{x}_k\}_{k\in\mathbb{N}}\) 有界，则它收敛。

尽管 PnP-Flow 算法 (2.11) 有效，它仍有两个局限。

1. 第一，命题 2.3 中的收敛结果要求时间序列满足 \(\sum_{k=0}^{\infty}(1-t_k)<+\infty\)。然而，PnP-Flow 算法 (2.11) 的实际实现采用线性调度 \(t_k=\frac{k}{N},\ k\in[N]_0\)。对该时间序列，\(\sum_{k=0}^{N}(1-t_k)=\sum_{k=0}^{N}\frac{N-k}{N}=\frac{N+1}{2}\)，它随 \(N\to\infty\) 趋于无穷。因此，线性时间序列族关于 \(N\) 并非一致有界，从而不满足收敛条件。
2. 第二，PnP-Flow 算法 (2.11) 设 \(t_0=0\)，此时第一个插值步退化为 \(\mathbf{y}_0=\boldsymbol{\xi}\)，因而与数据保真更新 \(\mathbf{x}_0-\gamma_0\nabla f(\mathbf{x}_0)\) 无关。这一选择虽使第一次迭代与初始化无关（见 [28]），却也阻止了由数据保真梯度编码的测量信息进入第一次去噪步。

接下来，我们旨在提出一种改进的 PnP-Flow 算法以解决上述问题。

## 3 高效的混合—投影 PnP-Flow

在给出所提算法之前，我们先引入如下混合时间调度。

**混合时间调度。** 为解决上述第一个问题，我们引入切换点 \(S:=\lfloor KN\rfloor\)，其中 \(N\) 表示总迭代次数，\(K\in(0,1)\) 决定两个阶段之间的切换点。针对第二个问题，我们引入可调初始偏移 \(t_0\in[0,1)\)，它使数据保真更新在 \(t_0>0\) 时从第一次迭代起即可贡献。更确切地说，对 \(\lambda\in(0,1)\)，我们定义混合时间调度为

$$
t_k^{(N)}:=\begin{cases}
1-(1-t_0)\lambda^k, & 0\le k\le S,\\[2pt]
t_S^{(N)}+\dfrac{k-S}{N-S}\left(1-t_S^{(N)}\right), & S\le k\le N.
\end{cases}\tag{3.1}
$$

我们注意到，由 (3.1) 定义的时间调度 \(\{t_k^{(N)}\}_{k\in[N]_0}\) 由几何增长段与线性增长段组成，不同于 [28] 中使用的线性时间调度。当 \(0\le k\le S\) 时，\(t_k^{(N)}\) 几何地趋近 1，因此噪声权重 \(1-t_k^{(N)}\) 指数衰减。这迅速降低基噪声的影响，并促进主导图像结构的快速恢复。当 \(S\le k\le N\) 时，\(t_k^{(N)}\) 从 \(t_S^{(N)}\) 线性增加到 1，向最终重建提供更平缓的过渡，并促进稳定精化。

下面结果建立混合时间调度关于迭代预算 \(N\) 的一致界与尾部消失性质。

**命题 3.1（混合时间调度的一致有界性与尾项消失性质）。** 由 (3.1) 定义的时间调度 \(\{t_k^{(N)}\}_{k\in[N]_0}\) 满足 \(\sup_{N\ge1}\sum_{k=0}^{N}\left(1-t_k^{(N)}\right)<+\infty\)。此外，对任意 \(q\in(0,1]\)，\(\lim_{N\to\infty}\sum_{k=S}^{N}\left(1-t_k^{(N)}\right)^q=0\)。

**证明。** 对几何段 \(0\le k\le S-1\)，由定义 (3.1) 得

$$
\sum_{k=0}^{S-1}\left(1-t_k^{(N)}\right)=(1-t_0)\sum_{k=0}^{S-1}\lambda^k=(1-t_0)\frac{1-\lambda^S}{1-\lambda}.
$$

对线性段，即 \(S\le k\le N\)，由 (3.1) 类似可得

$$
\sum_{k=S}^{N}\left(1-t_k^{(N)}\right)=\left(1-t_S^{(N)}\right)\sum_{k=S}^{N}\left(1-\frac{k-S}{N-S}\right)=\frac{N-S+1}{2}\left(1-t_S^{(N)}\right).
$$

结合 \(t_S\) 的定义，我们有

$$
\sum_{k=0}^{N}\left(1-t_k^{(N)}\right)=(1-t_0)\left(\frac{1-\lambda^S}{1-\lambda}+\frac{N-S+1}{2}\lambda^S\right).
$$

对固定 \(K\in(0,1)\)，由于 \(S=\lfloor KN\rfloor\)，有 \(N-S+1\le N+1<\frac{S+1}{K}+1\)。此外，

$$
(S+1)\lambda^S\le\sum_{j=0}^{\infty}(j+1)\lambda^j=\frac{1}{(1-\lambda)^2},
$$

且 \(\lambda^S<1\)。因此

$$
(N-S+1)\lambda^S\le\frac{1}{K(1-\lambda)^2}+1.
$$

结合以上估计得到

$$
\sum_{k=0}^{N}\left(1-t_k^{(N)}\right)\le(1-t_0)\left[\frac{1}{1-\lambda}+\frac{1}{2K(1-\lambda)^2}+\frac{1}{2}\right].
$$

右端与 \(N\) 无关。对 \(N\ge1\) 取上确界即得

$$
\sup_{N\ge1}\sum_{k=0}^{N}\left(1-t_k^{(N)}\right)\le(1-t_0)\left[\frac{1}{1-\lambda}+\frac{1}{2K(1-\lambda)^2}+\frac{1}{2}\right]<+\infty.
$$

第一个断言得证。下面证明第二个断言。对线性段有

$$
\sum_{k=S}^{N}\left(1-t_k^{(N)}\right)^q=(1-t_0)^q\lambda^{qS}\sum_{k=S}^{N}\left(\frac{N-k}{N-S}\right)^q\le(1-t_0)^q(N-S+1)\lambda^{qS}.\tag{3.2}
$$

由于 \(S=\lfloor KN\rfloor\to\infty\)（当 \(N\to\infty\)）、\(K\in(0,1)\) 且 \(\lambda\in(0,1)\)，可得 \(\lim_{N\to\infty}(N-S+1)\lambda^{qS}=0\)。结合 (3.2) 即得

$$
\lim_{N\to\infty}\sum_{k=S}^{N}\left(1-t_k^{(N)}\right)^q=0.
$$

第二个断言得证。\(\square\)

图像强度通常表示在 \([0,1]\) 中，并在训练时通常归一化到 \([-1,1]\)。然而，PnP-Flow 算法 (2.11) 并不保证中间迭代保持在该归一化范围内。超出有效范围的像素值可能导致数值不稳定并降低重建质量。

**像素空间投影。** 为克服这一困难，我们在每次迭代末尾施加一个逐分量投影算子，从而施加箱约束。

**定义 3.2（投影算子）。** 对任意向量 \(\mathbf{x}\in\mathbb{R}^d\)，投影算子 \(\mathcal{P}:\mathbb{R}^d\to[-1,1]^d\) 按分量定义为：对任意 \(i\in[d]\)，

$$
\mathcal{P}(\mathbf{x})_i:=\max\left(-1,\min(1,x_i)\right).\tag{3.3}
$$

投影算子具有两条对后续分析至关重要的性质：

1. **非扩张性。** 对任意 \(\mathbf{a},\mathbf{b}\in\mathbb{R}^d\)，\(\|\mathcal{P}(\mathbf{a})-\mathcal{P}(\mathbf{b})\|\le\|\mathbf{a}-\mathbf{b}\|\)，即投影算子 \(\mathcal{P}\) 是 1-Lipschitz 的。
2. **约束集上的恒等性。** \(\mathcal{P}(\mathbf{x})=\mathbf{x}\) 当且仅当 \(\mathbf{x}\in[-1,1]^d\)；投影只修改违反边界的那些分量。

把混合时间调度 (3.1) 与 (3.3) 定义的投影算子 \(\mathcal{P}\) 结合起来，我们得以提出新的高效混合—投影 PnP-Flow（HP-PnP-Flow）算法。

**HP-PnP-Flow 算法。** 本文引入 PnP-Flow 的改进变体，称为 HP-PnP-Flow：

$$
\begin{cases}
\mathbf{u}_k=\mathbf{x}_k-\gamma_k\nabla f(\mathbf{x}_k),\\
\mathbf{y}_k=(1-t_k)\boldsymbol{\xi}_k+t_k\mathbf{u}_k,\\
\mathbf{x}_{k+1}=\mathcal{P}\left(D_{t_k}(\mathbf{y}_k)\right),
\end{cases}\tag{3.4}
$$

其中 \(\boldsymbol{\xi}_k\sim p_0\)。为更直观地展示，完整迭代在算法 2 中给出。

**算法 2（原文 Algorithm 2）：** HP-PnP-Flow 迭代。

- **输入：** 初始化 \(\mathbf{x}_0\)、总迭代次数 \(N\)、步长 \(\{\gamma_k\}_{k\in[N-1]_0}\)、时间序列 \(\{t_k\}_{k\in[N-1]_0}\)（\(t_0\in[0,1)\)）。
- **输出：** 重建图像 \(\mathbf{x}_N\)。
1. **for** \(k=0\) **to** \(N-1\) **do**
2. 　\(\mathbf{u}_k=\mathbf{x}_k-\gamma_k\nabla f(\mathbf{x}_k)\)　▷ 梯度步
3. 　\(\mathbf{y}_k=(1-t_k)\boldsymbol{\xi}_k+t_k\mathbf{u}_k,\ \boldsymbol{\xi}_k\sim p_0\)　▷ 插值
4. 　\(\mathbf{x}_{k+1}=\mathcal{P}\left(D_{t_k}(\mathbf{y}_k)\right)\)　▷ 去噪 + 投影
5. **end for**
6. **return** \(\mathbf{x}_N\)

**步长的选择。** 通过引入缩放参数 \(\eta\in(0,+\infty)\)，本文采用如下时间相关步长：

$$
\gamma_k=\eta(1-t_k)^\alpha,\quad \alpha\in(0,1].\tag{3.5}
$$

在特殊情形 \(\eta=1\) 下，上述带超参数的步长退化为文献 [28] 中的常用步长。缩放超参数 \(\eta\) 在不改变由 \(\alpha\) 决定的衰减曲线的前提下，对整体步长幅度提供额外控制，从而使步长能够适应不同的退化任务。接下来我们建立 HP-PnP-Flow 算法的收敛性。

**定理 3.3（HP-PnP-Flow 的收敛性）。** 假设 \(f:\mathbb{R}^d\to\mathbb{R}\) 连续可微，所学向量场 \(v^\theta:[0,1]\times\mathbb{R}^d\to\mathbb{R}^d\) 连续，且基分布 \(p_0\) 具有有界支撑。对每个迭代预算 \(N\)，令 \(\{\mathbf{x}_k^{(N)}\}_{k\in[N]_0}\) 由 HP-PnP-Flow (3.4) 以 (3.1) 定义的混合时间调度 \(\{t_k^{(N)}\}_{k\in[N]_0}\) 与 (3.5) 定义的 \(\gamma_k^{(N)}\) 生成。假设所有 \(N\) 使用相同初始化与相同隐变量序列 \(\{\boldsymbol{\xi}_k\}_{k\in\mathbb{N}}\)。则由 HP-PnP-Flow (3.4) 生成的序列 \(\{\mathbf{x}_N^{(N)}\}_{N\in\mathbb{N}}\) 收敛。

**证明。** 由于 \(\mathbf{x}_k^{(N)}=\mathcal{P}\left(D_{t_{k-1}^{(N)}}\left(\mathbf{y}_{k-1}^{(N)}\right)\right)\in[-1,1]^d\)，利用三角不等式、约束集上的恒等性与 \(\mathcal{P}\) 的 Lipschitz 条件，对任意 \(k\ge1\) 有

$$
\left\|\mathbf{x}_{k+1}^{(N)}-\mathbf{x}_k^{(N)}\right\|=\left\|\mathcal{P}\left(D_{t_k^{(N)}}\left(\mathbf{y}_k^{(N)}\right)\right)-\mathcal{P}\left(\mathbf{x}_k^{(N)}\right)\right\|\le\left\|D_{t_k^{(N)}}\left(\mathbf{y}_k^{(N)}\right)-\mathbf{x}_k^{(N)}\right\|.
$$

由 HP-PnP-Flow 算法 (3.4) 可知

$$
\begin{aligned}
&\left\|D_{t_k^{(N)}}\left(\mathbf{y}_k^{(N)}\right)-\mathbf{x}_k^{(N)}\right\|\\
&\quad=\Big\|(1-t_k^{(N)})\boldsymbol{\xi}_k+t_k^{(N)}\left(\mathbf{x}_k^{(N)}-\eta(1-t_k^{(N)})^\alpha\nabla f(\mathbf{x}_k^{(N)})\right)+(1-t_k^{(N)})v_{t_k^{(N)}}^\theta\left(\mathbf{y}_k^{(N)}\right)-\mathbf{x}_k^{(N)}\Big\|\\
&\quad\le\left(1-t_k^{(N)}\right)\left\|\boldsymbol{\xi}_k-\mathbf{x}_k^{(N)}+v_{t_k^{(N)}}^\theta\left(\mathbf{y}_k^{(N)}\right)\right\|+\eta\left(1-t_k^{(N)}\right)^\alpha\left\|t_k^{(N)}\nabla f(\mathbf{x}_k^{(N)})\right\|.
\end{aligned}\tag{3.6}
$$

在 \(\nabla f\) 与 \(v^\theta\) 的连续性假设、\(\{\mathbf{x}_k^{(N)}\}\) 在 \([-1,1]^d\) 中的有界性以及 \(\boldsymbol{\xi}_k\) 的有界支撑之下，存在常数 \(M>0\)（与 \(k\) 和 \(N\) 无关），使得

$$
\left\|\boldsymbol{\xi}_k-\mathbf{x}_k^{(N)}+v_{t_k^{(N)}}^\theta\left(\mathbf{y}_k^{(N)}\right)\right\|+\eta\left\|t_k^{(N)}\nabla f(\mathbf{x}_k^{(N)})\right\|\le M.
$$

因此，对任意 \(k\ge1\) 有

$$
\left\|\mathbf{x}_{k+1}^{(N)}-\mathbf{x}_k^{(N)}\right\|\le M\left(1-t_k^{(N)}\right)^\alpha.\tag{3.7}
$$

根据命题 3.1，对任意 \(\epsilon>0\)，存在 \(N^*\ge1\)，使得对任意 \(N\ge N^*\)，

$$
\sum_{k=S}^{N}\left(1-t_k^{(N)}\right)^\alpha<\frac{\epsilon}{3M},\quad S=\lfloor KN\rfloor.\tag{3.8}
$$

令 \(N_2>N_1\ge N^*\)，并设 \(S_i=\lfloor KN_i\rfloor\)（\(i\in[1,2]\)）。由于 \(S_1\le S_2\)，且所有迭代预算使用相同初始化与相同隐变量序列，我们有

$$
\mathbf{x}_{S_1}^{(N_1)}=\mathbf{x}_{S_1}^{(N_2)}.\tag{3.9}
$$

利用三角不等式、(3.9) 与 (3.7)，我们得到

$$
\begin{aligned}
\left\|\mathbf{x}_{N_1}^{(N_1)}-\mathbf{x}_{N_2}^{(N_2)}\right\|&\le\left\|\mathbf{x}_{N_1}^{(N_1)}-\mathbf{x}_{S_1}^{(N_1)}\right\|+\left\|\mathbf{x}_{N_2}^{(N_2)}-\mathbf{x}_{S_1}^{(N_2)}\right\|\\
&\le M\sum_{k=S_1}^{N_1-1}\left(1-t_k^{(N_1)}\right)^\alpha+M\sum_{k=S_1}^{N_2-1}\left(1-t_k^{(N_2)}\right)^\alpha\\
&=M\sum_{k=S_1}^{N_1-1}\left(1-t_k^{(N_1)}\right)^\alpha+M\sum_{k=S_1}^{S_2-1}\left(1-t_k^{(N_2)}\right)^\alpha\\
&\quad+M\sum_{k=S_2}^{N_2-1}\left(1-t_k^{(N_2)}\right)^\alpha.
\end{aligned}\tag{3.10}
$$

由 (3.8)，第一项与第三项各自不超过 \(\epsilon/3\)。对第二项，混合调度的几何段给出

$$
M\sum_{k=S_1}^{S_2-1}\left(1-t_k^{(N_2)}\right)^\alpha=M(1-t_0)^\alpha\sum_{k=S_1}^{S_2-1}\lambda^{\alpha k}\le\frac{M(1-t_0)^\alpha}{1-\lambda^\alpha}\lambda^{\alpha S_1}.
$$

由于 \(S_1=\lfloor KN_1\rfloor\to\infty\)（当 \(N_1\to\infty\)），且 \(\lambda\in(0,1)\)，存在充分大的 \(N_0\ge1\)，使得对任意 \(N_1\ge N_0\)，

$$
\frac{M(1-t_0)^\alpha}{1-\lambda^\alpha}\lambda^{\alpha\lfloor KN_1\rfloor}<\frac{\epsilon}{3}.
$$

因此，对任意 \(N_2>N_1\ge\max\{N_0,N^\star\}\)，有

$$
\left\|\mathbf{x}_{N_1}^{(N_1)}-\mathbf{x}_{N_2}^{(N_2)}\right\|<\epsilon.
$$

于是 \(\{\mathbf{x}_N^{(N)}\}_{N\in\mathbb{N}}\) 是 \(\mathbb{R}^d\) 中的 Cauchy 序列，因而收敛。\(\square\)

**与 PnP-Flow 的比较。** 本文显然受 [28] 启发，旨在各种逆问题上取得更有希望的性能。下面我们比较本文的 HP-PnP-Flow 与 PnP-Flow，并总结主要改进。

1. **时间调度设计。** [28] 中使用的线性调度关于迭代预算 \(N\) 并非一致可和，而所提混合调度 (3.1) 满足命题 3.1 建立的一致可和性质。
2. **像素空间投影。** [28, Proposition 4] 中 PnP-Flow 的收敛分析假设迭代 \(\{\mathbf{x}_k\}\) 有界。在我们的算法中，投影 \(\mathcal{P}\) 在每次迭代强制 \(\mathbf{x}_k\in[-1,1]^d\)，从而直接由算法构造保证迭代有界。
3. **步长设计。** [28] 中步长取为 \(\gamma_k=(1-t_k)^\alpha\)，而我们采用带缩放的形式 \(\gamma_k=\eta(1-t_k)^\alpha\)（\(\eta\in(0,+\infty)\)），使整体步长幅度可独立于衰减曲线进行调整。
4. **初始时间偏移。** PnP-Flow 算法 [28] 取 \(t_0=0\)，使第一个插值步与数据保真更新无关。我们则在算法中引入可调初始偏移 \(t_0\in[0,1)\)，在 \(t_0>0\) 时使测量信息能够影响第一次去噪步。

## 4 数值实验

本节我们在两项公开数据集上，针对五项典型图像恢复任务——去噪、去模糊、超分、随机像素修复与盒状修复——评估 HP-PnP-Flow 算法 (3.4) 的性能。我们使用 PSNR、SSIM 与 LPIPS 把我们的算法与若干基线方法进行比较，并进行消融研究以考察混合时间调度与初始时间偏移的作用。

### 4.1 实验设置

**数据集与预处理。** 我们使用两个特性互补的数据集。

- **CelebA** 包含约 200,000 张名人面部图像（见 [27]）。所有图像被中心裁剪并缩放到 \(128\times128\) 像素。该数据集提供结构良好的人脸图样与多样的纹理细节，适合评估图像恢复方法。
- **AFHQ-Cat** 是 Animal Faces HQ 数据集（见 [9]）的猫子集，约含 5,000 张图像。图像被缩放到 \(256\times256\) 像素。更高的分辨率与细密的毛发细节为泛化提供了更具挑战性的检验。

两个数据集都采用标准的训练、验证与测试划分。所有定量评估都在测试集上进行。像素值归一化到 \([-1,1]\)。

**退化任务。** 我们考虑五项退化任务。所有情形都包含加性高斯噪声，任务相关的噪声水平在下面给出。

- **去噪：** \(H=I_d\)，\(\sigma=0.2\)。
- **去模糊：** \(H\) 为高斯模糊算子，CelebA 上 \(b=1.0\)、AFHQ-Cat 上 \(b=3.0\)，\(\sigma=0.05\)。
- **超分：** \(H\) 为双三次下采样算子，CelebA 上缩放因子 \(\times2\)、AFHQ-Cat 上 \(\times4\)，\(\sigma=0.05\)。
- **随机修复：** \(H\) 为保留 30% 像素的随机二值掩码算子，\(\sigma=0.01\)。
- **盒状修复：** \(H\) 在 CelebA 上掩蔽中心 \(40\times40\) 区域、在 AFHQ-Cat 上掩蔽 \(80\times80\) 区域，\(\sigma=0.05\)。

**基线方法。** 我们把算法与若干现有方法进行比较。PnP-Flow [28] 作为我们的主要基线。我们另外纳入三种基于流匹配的恢复方法，即 OT-ODE [31]、D-Flow [4] 与 Flow-Priors [43]，以及一个基于 PnP 的基线 PnP-GS [20]。为公平比较，所有基线都在相同退化设置与测试划分下，使用其最优超参数与官方发布的权重进行评估。

**实现细节。** 所有实验都在一台 NVIDIA Tesla V100S GPU 上使用 PyTorch 进行。随机种子固定以保证可复现性。对基于流匹配的方法（包括我们提出的方法），我们使用 [28] 的 U-Net 模型权重与预训练检查点。唯一例外是 PnP-GS，它使用自己的预训练去噪器。

我们注意到评估协议上的一个差异。Martin 等 [28] 报告的是 25 个批次（每批 4 幅图像）上的平均结果，而我们对每幅图像使用 100 次独立运行重新计算所有评估指标。因此，本文报告的数值可能与原发表论文中的数值略有不同。对每个基线方法，我们使用 [28] 中报告的最优超参数，这些超参数是在验证集上以最大化 PSNR 为目标经网格搜索选出的。HP-PnP-Flow 与所有基线方法的详细超参数设置见附录 A。

### 4.2 主要数值结果

下面我们使用 PSNR、SSIM 与 LPIPS 指标报告所有方法在多项图像恢复任务上的定量比较。若无特殊说明，“N/A”表示该方法不适用于该任务。例如，PnP-GS 依赖判别式去噪器，无法进行生成式补全，因而无法处理盒状修复的前向模型。PnP-Flow(m) 与 HP-PnP-Flow(m) 表示在每次迭代对 \(m\) 个独立 \(\boldsymbol{\xi}\) 样本的去噪结果取平均的变体。粗体与下划线数值分别表示最优与次优性能。

**表 1（原文 Table 1）：** CelebA 上的定量结果（100 张测试图像）。粗体=最优，下划线=次优（原文标记；并列时按原文渲染保留）。

| 方法 | Denoise PSNR↑ | Denoise SSIM↑ | Denoise LPIPS↓ | Deblur PSNR↑ | Deblur SSIM↑ | Deblur LPIPS↓ | Super-res. PSNR↑ | Super-res. SSIM↑ | Super-res. LPIPS↓ | Rand. inp. PSNR↑ | Rand. inp. SSIM↑ | Rand. inp. LPIPS↓ | Box inp. PSNR↑ | Box inp. SSIM↑ | Box inp. LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Degraded | 20.01 | 0.349 | 0.365 | 27.79 | 0.739 | 0.126 | 10.51 | 0.184 | 0.824 | 12.26 | 0.197 | 1.024 | 22.42 | 0.745 | 0.209 |
| PnP-GS | <u>32.59</u> | 0.910 | 0.035 | 33.84 | 0.922 | 0.040 | 30.35 | 0.902 | 0.056 | 28.42 | 0.845 | 0.087 | N/A | N/A | N/A |
| OT-ODE | 30.49 | 0.858 | <u>0.032</u> | 32.87 | 0.918 | **0.028** | 31.56 | 0.910 | **0.020** | 28.82 | 0.874 | 0.050 | 29.92 | 0.923 | 0.033 |
| D-Flow | 25.99 | 0.604 | 0.090 | 31.16 | 0.852 | <u>0.037</u> | 30.39 | 0.847 | 0.025 | 33.65 | 0.944 | <u>0.015</u> | 30.93 | 0.901 | <u>0.024</u> |
| Flow-Priors | 29.30 | 0.769 | 0.129 | 31.47 | 0.858 | 0.055 | 28.31 | 0.716 | 0.099 | 32.95 | 0.943 | 0.019 | 30.42 | 0.862 | 0.046 |
| PnP-Flow(1) | 31.79 | 0.905 | 0.044 | 34.33 | 0.935 | 0.038 | 31.00 | 0.902 | 0.044 | 33.06 | 0.943 | 0.018 | 30.52 | 0.936 | 0.035 |
| PnP-Flow(5) | 32.30 | 0.912 | 0.055 | **34.65** | **0.940** | 0.046 | 31.42 | 0.907 | 0.054 | 33.94 | 0.953 | 0.022 | 31.07 | 0.942 | 0.041 |
| HP-PnP-Flow(1) | 32.39 | <u>0.915</u> | **0.026** | 34.34 | 0.933 | 0.037 | <u>32.75</u> | <u>0.929</u> | <u>0.021</u> | <u>33.98</u> | <u>0.955</u> | **0.013** | <u>31.25</u> | <u>0.945</u> | **0.024** |
| HP-PnP-Flow(5) | **32.91** | **0.923** | 0.035 | <u>34.65</u> | <u>0.938</u> | 0.044 | **33.27** | **0.936** | 0.025 | **34.76** | **0.962** | <u>0.015</u> | **32.02** | **0.954** | 0.027 |

**表 2（原文 Table 2）：** AFHQ-Cat 上的定量结果（100 张测试图像）。粗体=最优，下划线=次优（原文标记；并列时按原文渲染保留）。

| 方法 | Denoise PSNR↑ | Denoise SSIM↑ | Denoise LPIPS↓ | Deblur PSNR↑ | Deblur SSIM↑ | Deblur LPIPS↓ | Super-res. PSNR↑ | Super-res. SSIM↑ | Super-res. LPIPS↓ | Rand. inp. PSNR↑ | Rand. inp. SSIM↑ | Rand. inp. LPIPS↓ | Box inp. PSNR↑ | Box inp. SSIM↑ | Box inp. LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Degraded | 20.00 | 0.294 | 0.531 | 24.39 | 0.530 | 0.436 | 11.59 | 0.212 | 0.867 | 13.24 | 0.214 | 1.082 | 21.53 | 0.727 | 0.215 |
| PnP-GS | **33.03** | <u>0.896</u> | <u>0.078</u> | 28.38 | 0.771 | 0.331 | 24.26 | 0.642 | 0.350 | 29.80 | 0.838 | 0.127 | N/A | N/A | N/A |
| OT-ODE | 30.51 | 0.819 | 0.080 | 26.50 | 0.680 | **0.149** | 26.73 | 0.738 | **0.108** | 30.01 | 0.850 | 0.086 | 24.51 | 0.874 | 0.095 |
| D-Flow | 26.42 | 0.570 | 0.182 | 28.58 | 0.745 | <u>0.168</u> | 25.19 | 0.616 | 0.190 | 32.83 | 0.900 | 0.044 | 27.02 | 0.841 | <u>0.081</u> |
| Flow-Priors | 29.68 | 0.757 | 0.164 | 27.28 | 0.727 | 0.188 | 24.01 | 0.572 | 0.271 | 32.98 | 0.910 | 0.051 | 26.13 | 0.809 | 0.130 |
| PnP-Flow(1) | 31.65 | 0.867 | 0.139 | 28.74 | 0.781 | 0.285 | 27.58 | 0.781 | 0.158 | 33.75 | 0.924 | <u>0.038</u> | 26.40 | 0.896 | 0.111 |
| PnP-Flow(5) | 31.89 | 0.869 | 0.170 | <u>29.03</u> | **0.786** | 0.313 | <u>28.02</u> | <u>0.792</u> | 0.168 | <u>34.47</u> | <u>0.933</u> | 0.045 | 27.15 | 0.901 | 0.127 |
| HP-PnP-Flow(1) | 32.51 | 0.892 | **0.066** | 28.88 | 0.780 | 0.284 | 27.93 | 0.783 | <u>0.150</u> | 33.91 | 0.928 | **0.035** | <u>27.29</u> | <u>0.912</u> | **0.072** |
| HP-PnP-Flow(5) | <u>32.97</u> | **0.900** | 0.086 | **29.10** | <u>0.784</u> | 0.313 | **28.42** | **0.796** | 0.161 | **34.60** | **0.936** | 0.040 | **28.05** | **0.921** | 0.082 |

表 1 与表 2 给出了不同方法的定量比较，表明我们的算法在两个数据集与三项评价指标的大多数设置中取得最优或次优性能。可以看出，相对 PnP-Flow 的最大 PSNR 提升出现在 CelebA 的超分任务上：在相同单采样设置下，HP-PnP-Flow(1) 比 PnP-Flow(1) 提升 1.75 dB。与单样本变体 HP-PnP-Flow(1) 相比，HP-PnP-Flow(5) 额外带来 0.2–0.8 dB 的 PSNR 提升。值得注意的是，HP-PnP-Flow(1) 尽管每次迭代仅使用一个样本，却在大多数恢复任务上优于 PnP-Flow(5)。与其他基线相比，HP-PnP-Flow 在不同恢复任务上表现出更均衡的性能。D-Flow 与 Flow-Priors 在修复任务上尤其有效，PnP-GS 与 OT-ODE 在去噪与去模糊上表现良好，而我们的算法在两个数据集的全部五种退化设置下都保持竞争力。

此外，我们的算法在大多数任务上以显著更小的迭代预算取得这些结果。例如，在 AFHQ-Cat 上，HP-PnP-Flow 对盒状修复使用 60 次迭代（PnP-Flow 为 100 次），对去模糊使用 100 次迭代（PnP-Flow 为 500 次）（细节见附录 A）。

### 4.3 与 PnP-Flow 的比较

下面我们在单采样设置下比较 HP-PnP-Flow (3.4) 与 PnP-Flow (2.11)，并分析它们在全部五种恢复任务与两个数据集上的逐迭代重建轨迹。可视化比较见附录 B。

可以看出，HP-PnP-Flow 在早期迭代中表现出更快的收敛。例如，由图 6 与图 7 可见，在第 20 次迭代时，HP-PnP-Flow 在 CelebA 与 AFHQ-Cat 上分别把 PSNR 提升 7.58 与 7.96 dB，把 SSIM 提升 0.1611 与 0.219。其余四项任务也观察到类似的早期优势。折算为等价的 PnP-Flow 迭代，HP-PnP-Flow 迭代 20 次达到的重建质量与 PnP-Flow 迭代约 40–120 次相当（取决于任务）。最大效率差距出现在随机修复（20 对 80–120 次迭代），最小差距出现在去模糊（20 对 40–60 次迭代）。

HP-PnP-Flow 还取得更好的最终重建质量。在五项任务与两个数据集上，其收敛 PSNR 比 PnP-Flow 高 0.38–1.74 dB，其中超分与随机修复的改进最大（细节见附录 B）。在 AFHQ-Cat 上，HP-PnP-Flow 的去模糊与超分只需 100 次迭代（PnP-Flow 为 500 次），盒状修复为 60 次（PnP-Flow 为 100 次）。综合来看，更快的早期收敛与更小的迭代预算，使 HP-PnP-Flow 能以显著更少的迭代次数达到给定 PSNR 水平。

### 4.4 定性比较

本小节给出所有方法在 CelebA 与 AFHQ-Cat 各一张测试图像上、跨五项退化任务的视觉比较。每行对应一项任务，自上而下依次为去噪、去模糊、超分、随机修复与盒状修复。每幅重建的 PSNR 值报告在相应图像下方。

**图 2（原文 Figure 2）：** 所有方法在 CelebA 上跨五项恢复任务的 PSNR 比较（自上而下依次为去噪、去模糊、超分、随机修复与盒状修复）。（图中列为 Clean、Degraded、PnP-GS、OT-ODE、D-Flow、Flow-Priors、PnP-Flow(1)、PnP-Flow(5)、HP-PnP-Flow(1)、HP-PnP-Flow(5)，每幅重建下方给出其 PSNR。）

**图 3（原文 Figure 3）：** 所有方法在 AFHQ-Cat 上跨五项恢复任务的 PSNR 比较（自上而下依次为去噪、去模糊、超分、随机修复与盒状修复）。（图中列设置与图 2 相同，每幅重建下方给出其 PSNR。）

图 2 与图 3 进一步展示了 HP-PnP-Flow 在两个数据集全部五项退化任务上强而一致的恢复性能。在 CelebA 上，我们的算法在超分、随机修复与盒状修复上相对 PnP-Flow 取得明显的 PSNR 改进。即便在单采样设置下，HP-PnP-Flow(1) 也达到或超过大多数竞争方法在其最佳设置下的表现，而通常所需迭代次数更少。

在视觉质量方面，HP-PnP-Flow 在五项任务上都能给出一致干净的重建，明显伪影很少，尽管在某些情形下可能出现轻微过平滑。相比之下，PnP-GS 在生成式恢复任务上竞争力较弱，而 D-Flow 在去噪与去模糊上表现较差。Flow-Priors 倾向于引入更明显的噪声与伪影，而 OT-ODE 较好地保留纹理，但在更不适定的恢复任务上效果较弱。总体而言，HP-PnP-Flow 在不同退化设置下提供了重建质量与鲁棒性的良好平衡。

### 4.5 消融研究

我们在随机修复（70% 像素缺失）与高斯噪声 \(\sigma=0.01\) 上进行消融研究，取 \(N=100\) 次迭代并设 \(\alpha=0.01\)。结果在 10 张测试图像上平均，以 PSNR（dB）的均值±标准差报告。

**初始偏移 \(t_0\)。** 为隔离初始时间偏移的作用，我们通过设 \(K=0\) 固定线性调度，并变化 \(t_0\in\{0,0.2,0.5,0.7,0.9\}\)，其中 \(t_0=0\) 对应原始 PnP-Flow。

**图 4（原文 Figure 4）：** 不同初始偏移 \(t_0\) 下的 PSNR 收敛曲线。（图中横轴为迭代步，纵轴为平均 PSNR（dB）；曲线依次为 PnP-Flow(\(t_0=0\))、PnP-Flow(\(t_0=0.2\))、PnP-Flow(\(t_0=0.5\))、PnP-Flow(\(t_0=0.7\))、PnP-Flow(\(t_0=0.9\)) 与 HP-PnP-Flow(\(t_0=0.5\))。）

**表 3（原文 Table 3）：** 不同初始偏移 \(t_0\) 下的 PSNR（dB）。

| | PnP-Flow（\(t_0=0\)） | \(t_0=0.2\) | \(t_0=0.5\) | \(t_0=0.7\) | \(t_0=0.9\) | HP-PnP-Flow |
|---|---|---|---|---|---|---|
| 平均 PSNR | 33.73 | 33.96 | 34.47 | 33.95 | 21.21 | **34.75** |
| 标准差 | 1.07 | 1.12 | 1.19 | 2.61 | 1.56 | 1.34 |

图 4 展示了不同 \(t_0\) 选择下的 PSNR 轨迹。与基线 \(t_0=0\) 相比，适度的正初始偏移加速了早期收敛。特别地，取 \(t_0=0.5\) 时平均 PSNR 为 34.47 dB，比 PnP-Flow 提升 0.74 dB，同时保持较低的波动性。对 \(t_0\in[0.2,0.7]\)，最终 PSNR 一致高于基线；当 \(t_0\) 过大（例如 \(t_0=0.9\)）时性能变差。此外，如表 3 所示，我们的算法相对最佳的“仅调节 \(t_0\)”变体又取得 0.28 dB 的改进。

**过渡系数 \(K\)。** 对消融研究，我们还考虑端点情形。我们定义 \(K=0\) 为纯线性调度、\(K=1\) 为纯几何调度 \(t_k=1-(1-t_0)\lambda^k\)。为评估过渡系数 \(K\) 的作用，我们固定 \(\lambda=0.965\) 并变化 \(K\in\{0,0.2,0.5,0.7,1.0\}\)。选择 \(K=0\) 会恢复 [28] 中使用的纯线性调度，而 \(K=1\) 对应纯几何调度。

**图 5（原文 Figure 5）：** 不同过渡系数 \(K\) 下的 PSNR 收敛曲线。（图中曲线依次为 PnP-Flow(\(K=0\))、PnP-Flow(\(K=0.2\))、PnP-Flow(\(K=0.5\))、PnP-Flow(\(K=0.7\))、PnP-Flow(\(K=1.0\)) 与 HP-PnP-Flow。）

**表 4（原文 Table 4）：** 不同过渡系数 \(K\) 下的 PSNR（dB）。

| | PnP-Flow（\(K=0\)） | \(K=0.2\) | \(K=0.5\) | \(K=0.7\) | \(K=1.0\) | HP-PnP-Flow |
|---|---|---|---|---|---|---|
| 平均 PSNR | 33.73 | 34.20 | 34.66 | 34.65 | 34.12 | **34.75** |
| 标准差 | 1.07 | 1.17 | 1.24 | 1.18 | 1.07 | 1.34 |

从图 5 可以看出，更大的 \(K\) 通过增加几何段的贡献来加速早期收敛。纯线性调度（\(K=0\)）的早期收敛最慢，而更大的 \(K\) 带来更快的初始 PSNR 提升。当 \(K=0.5\) 时，HP-PnP-Flow 在单因素变体中取得最高的最终 PSNR（34.66 dB），优于纯线性（\(K=0\)）与纯几何（\(K=1\)）调度。这表明两阶段设计有效结合了几何增长用于快速早期恢复、线性精化用于稳定收敛的互补优势。

如表 4 所示，所提出的 HP-PnP-Flow 结合了最优 \(t_0\)、混合时间调度与投影算子，在所有配置中同时取得最快的早期收敛与最高的最终 PSNR（34.75 dB），表明这三个组成部分提供了互补的收益。

## 5 结论

在本工作中，我们提出一种高效的混合—投影即插即用流（HP-PnP-Flow）算法，一种用于图像逆问题的改进即插即用算法，它把流匹配先验与混合时间调度、像素空间投影算子结合起来。此外，我们建立了 HP-PnP-Flow 的收敛性，而不必施加原 PnP-Flow 所要求的迭代有界假设（见 [28] 中的 Proposition 4），因为像素空间投影使迭代保持在规定的像素范围内。混合调度结合了几何与线性增长段，满足收敛条件，并且相对 PnP-Flow 所使用的线性调度取得更快的早期重建与更好的数值性能。在 CelebA 与 AFHQ-Cat 上跨五项退化任务的实验表明，HP-PnP-Flow 在大多数设置下取得最优或次优的 PSNR、SSIM 与 LPIPS，同时所需迭代次数少于 PnP-Flow（例如 AFHQ-Cat 上去模糊为 100 对 500 次迭代）。消融研究进一步表明，初始时间偏移 \(t_0\) 与混合调度各自独立地贡献性能收益，二者结合取得最佳总体性能。

仍有若干方向值得进一步研究。第一，我们计划在温和假设下为 HP-PnP-Flow 建立定量误差界。第二，探索所提混合时间调度能否推广到流匹配之外的其他基于生成模型的 PnP 框架，将是一个有意义的问题。

## 参考文献

[1] Michael Samuel Albergo and Eric Vanden-Eijnden. Building normalizing flows with stochastic interpolants. In International Conference on Learning Representations, 2023.

[2] Mariana S. C. Almeida and Mário Figueiredo. Deconvolving Images With Unknown Boundaries Using the Alternating Direction Method of Multipliers. IEEE Transactions on Image Processing, 22(8):3074–3086, 2013.

[3] Luigi Ambrosio, Nicola Gigli, and Giuseppe Savaré. Gradient flows: in metric spaces and in the space of probability measures. Springer, 2005.

[4] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman. D-Flow: Differentiating through Flows for Controlled Generation. In Forty-first International Conference on Machine Learning, 2024.

[5] Stephen Boyd, Neal Parikh, Eric Chu, Borja Peleato, and Jonathan Eckstein. Distributed Optimization and Statistical Learning via the Alternating Direction Method of Multipliers. Foundations and Trends® in Machine Learning, 3(1):1–122, 2011.

[6] Gabriel Cardoso, Sylvain Le Corff, Eric Moulines, et al. Monte Carlo guided denoising diffusion models for Bayesian linear inverse problems. In The Twelfth International Conference on Learning Representations, 2024.

[7] Stanley H Chan, Xiran Wang, and Omar A Elgendy. Plug-and-play ADMM for image restoration: Fixed-point convergence and applications. IEEE Transactions on Computational Imaging, 3(1):84–98, 2016.

[8] Ricky T. Q. Chen, Yulia Rubanova, Jesse Bettencourt, and David K Duvenaud. Neural ordinary differential equations. In S. Bengio, H. Wallach, H. Larochelle, K. Grauman, N. Cesa-Bianchi, and R. Garnett, editors, Advances in Neural Information Processing Systems, volume 31. Curran Associates, Inc., 2018.

[9] Yunjey Choi, Youngjung Uh, Jaejun Yoo, and Jung-Woo Ha. Stargan v2: Diverse image synthesis for multiple domains. In 2020 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 8185–8194. IEEE, 2020.

[10] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023.

[11] Patrick L Combettes and Jean-Christophe Pesquet. Proximal splitting methods in signal processing. In Fixed-point algorithms for inverse problems in science and engineering, pages 185–212. Springer, 2011.

[12] Patrick L Combettes and Valérie R Wajs. Signal recovery by proximal forward-backward splitting. Multiscale modeling & simulation, 4(4):1168–1200, 2005.

[13] Prafulla Dhariwal and Alexander Nichol. Diffusion models beat gans on image synthesis. Advances in Neural Information Processing Systems, 34:8780–8794, 2021.

[14] Jim Douglas and Henry H Rachford. On the numerical solution of heat conduction problems in two and three space variables. Transactions of the American mathematical Society, 82(2):421–439, 1956.

[15] Michael Elad, Bahjat Kawar, and Gregory Vaksman. Image denoising: The deep learning revolution and beyond—a survey paper. SIAM Journal on Imaging Sciences, 16(3):1594–1654, 2023.

[16] Yuchen Fan, Jiahui Yu, Yiqun Mei, Yulun Zhang, Yun Fu, Ding Liu, and Thomas S Huang. Neural sparse representation for image restoration. Advances in Neural Information Processing Systems, 33:15394–15404, 2020.

[17] D. Geman and Chengda Yang. Nonlinear image recovery with half-quadratic regularization. IEEE Transactions on Image Processing, 4(7):932–946, 1995.

[18] Dennis Hein, Afshin Bozorgpour, Dorit Merhof, and Ge Wang. Physics-inspired generative models in medical imaging. Annual Review of Biomedical Engineering, 27(1):499–525, 2025.

[19] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in Neural Information Processing Systems, 33:6840–6851, 2020.

[20] Samuel Hurault, Arthur Leclaire, and Nicolas Papadakis. Gradient Step Denoiser for convergent Plug-and-Play. In International Conference on Learning Representations (ICLR), Online, April 2022.

[21] Samuel Hurault, Arthur Leclaire, and Nicolas Papadakis. Proximal denoiser for convergent plug-and-play optimization with nonconvex regularization. In International Conference on Machine Learning, pages 9483–9505. PMLR, 2022.

[22] Fan Jia, Shen Mao, Xue-Cheng Tai, and Tieyong Zeng. A variational model for nonuniform low-light image enhancement. SIAM Journal on Imaging Sciences, 17(1):1–30, 2024.

[23] Shima Kamyab, Zohreh Azimifar, Rasool Sabzi, and Paul W. Fieguth. Survey of Deep Learning Methods for Inverse Problems. PeerJ Computer Science, 8:e951, 2022.

[24] Jonas Latz, Aretha L Teckentrup, and Simon Urbainczyk. Deep Gaussian process priors for Bayesian image reconstruction. Inverse Problems, 41(6):065016, 2025.

[25] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow Matching for Generative Modeling. In The Eleventh International Conference on Learning Representations, 2023.

[26] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. In International Conference on Learning Representations, 2023.

[27] Ziwei Liu, Ping Luo, Xiaogang Wang, and Xiaoou Tang. Deep learning face attributes in the wild. In Proceedings of the IEEE international conference on computer vision, pages 3730–3738, 2015.

[28] Ségolène Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. PnP-Flow: Plug-and-Play Image Restoration with Flow Matching. In The Thirteenth International Conference on Learning Representations (ICLR), 2025.

[29] Tim Meinhardt, Michael Moller, Caner Hazirbas, and Daniel Cremers. Learning proximal operators: Using denoising networks for regularizing inverse imaging problems. In Proceedings of the IEEE international conference on computer vision, pages 1781–1790, 2017.

[30] Jean-Christophe Pesquet, Audrey Repetti, Matthieu Terris, and Yves Wiaux. Learning maximally monotone operators for image recovery. SIAM Journal on Imaging Sciences, 14(3):1206–1237, 2021.

[31] Ashwini Pokle, Matthew J. Muckley, Ricky T. Q. Chen, and Brian Karrer. Training-free linear image inverses via flows. Transactions on Machine Learning Research, 2024.

[32] Adnan Qayyum, Inaam Ilahi, Fahad Shamshad, Farid Boussaid, Mohammed Bennamoun, and Junaid Qadir. Untrained Neural Network Priors for Inverse Imaging Problems: A Survey. IEEE Transactions on Pattern Analysis and Machine Intelligence, 45(5):6511–6536, 2023.

[33] Ernest Ryu, Jialin Liu, Sicheng Wang, Xiaohan Chen, Zhangyang Wang, and Wotao Yin. Plug-and-play methods provably converge with properly trained denoisers. In International Conference on Machine Learning, pages 5546–5557. PMLR, 2019.

[34] Nikita Singhal, Anup Kadam, Pravesh Kumar, Hritik Singh, Aaryan Thakur, et al. Study of recent image restoration techniques: a comprehensive survey. Jordanian Journal of Computers & Information Technology, 11(2):211, 2025.

[35] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. In International Conference on Learning Representations, 2021.

[36] Matthieu Terris, Audrey Repetti, Jean-Christophe Pesquet, and Yves Wiaux. Building firmly nonexpansive convolutional neural networks. In ICASSP 2020-2020 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pages 8658–8662. IEEE, 2020.

[37] K. Topolnicki, S. Sharma, Yu. Volkotrub, and M. Das. Exploring maximum likelihood and Bayesian approaches for two-dimensional image restoration: A machine learning perspective. Computer Physics Communications, 319:109913, 2026.

[38] Singanallur V Venkatakrishnan, Charles A Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In 2013 IEEE global conference on signal and information processing, pages 945–948. IEEE, 2013.

[39] Aamir Wali, Asma Naseer, Maria Tamoor, and SAM Gilani. Recent progress in digital image restoration techniques: A review. Digital Signal Processing, 141:104187, 2023.

[40] Guixian Xu, Jinglai Li, and Junqi Tang. A New Convergence Analysis of Plug-and-Play Proximal Gradient Descent Under Prior Mismatch. arXiv preprint arXiv:2601.09831, 2026.

[41] Kai Zhang, Yawei Li, Wangmeng Zuo, Lei Zhang, Luc Van Gool, and Radu Timofte. Plug-and-play image restoration with deep denoiser prior. IEEE Transactions on Pattern Analysis and Machine Intelligence, 44(10):6360–6376, 2021.

[42] Kai Zhang, Wangmeng Zuo, Yunjin Chen, Deyu Meng, and Lei Zhang. Beyond a Gaussian Denoiser: Residual Learning of Deep CNN for Image Denoising. IEEE Transactions on Image Processing, 26(7):3142–3155, July 2017.

[43] Yasi Zhang, Peiyu Yu, Yaxuan Zhu, Yingshan Chang, Feng Gao, Ying N Wu, and Oscar Leong. Flow priors for linear inverse problems via iterative corrupted trajectory matching. Advances in Neural Information Processing Systems, 37:57389–57417, 2024.

## 附录 A 超参数配置

我们报告 HP-PnP-Flow 与所有基线方法在 CelebA（表 5）与 AFHQ-Cat（表 6）上的最优超参数设置。这些设置是在验证集上以最大化 PSNR 为目标经网格搜索选出的。破折号“—”表示相应方法不适用于给定退化任务。

**表 5（原文 Table 5）：** CelebA 上的最优超参数设置。

| 方法 | 超参数 | 去噪 | 去模糊 | 超分 | 随机修复 | 盒状修复 |
|---|---|---|---|---|---|---|
| PnP-GS | \(\gamma\)（步长） | — | 2.0 | 2.0 | — | — |
| PnP-GS | \(\alpha\)（动量） | 1.0 | 0.3 | 1.0 | — | — |
| PnP-GS | \(\sigma_f\)（噪声因子） | 1.0 | 1.8 | 3.0 | — | — |
| PnP-GS | \(n_{\mathrm{iter}}\)（迭代次数） | 1 | 35 | 20 | 23 | — |
| OT-ODE | \(t_0\)（初始时间） | 0.3 | 0.4 | 0.1 | 0.1 | 0.1 |
| OT-ODE | \(\gamma\) | \(\sqrt{t}\) | \(\sqrt{t}\) | 常数 | 常数 | \(\sqrt{t}\) |
| Flow-Priors | \(\lambda\)（正则化） | 100 | 1000 | 10000 | 10000 | 10000 |
| Flow-Priors | \(\eta\)（学习率） | 0.01 | 0.01 | 0.1 | 0.01 | 0.01 |
| D-Flow | \(\lambda\)（正则化） | 0.001 | 0.001 | 0.001 | 0.01 | 0.001 |
| D-Flow | \(\alpha\)（混合） | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 |
| D-Flow | \(n_{\mathrm{iter}}\)（迭代次数） | 3 | 7 | 10 | 20 | 9 |
| PnP-Flow | \(\alpha\)（步长指数） | 0.8 | 0.01 | 0.3 | 0.01 | 0.5 |
| PnP-Flow | \(N\)（迭代次数） | 100 | 100 | 100 | 100 | 100 |
| HP-PnP-Flow（ours） | \(\eta\)（步长尺度） | 1.0 | 1.0 | 1.0 | 1.0 | 2.0 |
| HP-PnP-Flow（ours） | \(\alpha\)（步长指数） | 0.8 | 0.01 | 0.3 | 0.01 | 0.5 |
| HP-PnP-Flow（ours） | \(N\)（迭代次数） | 100 | 100 | 100 | 100 | 60 |
| HP-PnP-Flow（ours） | \(t_0\)（初始偏移） | 0.4 | 0.2 | 0.4 | 0.5 | 0.0 |
| HP-PnP-Flow（ours） | \(\lambda\)（衰减因子） | 0.965 | 0.9 | 0.965 | 0.965 | 0.99 |
| HP-PnP-Flow（ours） | \(K\)（过渡系数） | 0.3 | 0.3 | 0.7 | 0.7 | 0.2 |

注 1：PnP-Flow(1) 与 PnP-Flow(5) 在所有任务上共享相同的超参数。

注 2：HP-PnP-Flow(1) 与 HP-PnP-Flow(5) 在所有任务上共享相同的超参数。

**表 6（原文 Table 6）：** AFHQ-Cat 上的最优超参数设置。

| 方法 | 超参数 | 去噪 | 去模糊 | 超分 | 随机修复 | 盒状修复 |
|---|---|---|---|---|---|---|
| PnP-GS | \(\gamma\)（步长） | — | 2.0 | 2.0 | — | — |
| PnP-GS | \(\alpha\)（动量） | 1.0 | 0.3 | 1.0 | — | — |
| PnP-GS | \(\sigma_f\)（噪声因子） | 1.0 | 1.8 | 5.0 | — | — |
| PnP-GS | \(n_{\mathrm{iter}}\)（迭代次数） | 1 | 60 | 50 | 23 | — |
| OT-ODE | \(t_0\)（初始时间） | 0.3 | 0.3 | 0.1 | 0.1 | 0.1 |
| OT-ODE | \(\gamma\) | \(\sqrt{t}\) | \(\sqrt{t}\) | 常数 | 常数 | \(\sqrt{t}\) |
| Flow-Priors | \(\lambda\)（正则化） | 100 | 1000 | 10000 | 10000 | 10000 |
| Flow-Priors | \(\eta\)（学习率） | 0.01 | 0.01 | 0.1 | 0.01 | 0.01 |
| D-Flow | \(\lambda\)（正则化） | 0.001 | 0.001 | 0.001 | 0.001 | 0.01 |
| D-Flow | \(\alpha\)（混合） | 0.1 | 0.5 | 0.1 | 0.1 | 0.1 |
| D-Flow | \(n_{\mathrm{iter}}\)（迭代次数） | 3 | 20 | 20 | 20 | 9 |
| PnP-Flow | \(\alpha\)（步长指数） | 0.8 | 0.01 | 0.01 | 0.01 | 0.5 |
| PnP-Flow | \(N\)（迭代次数） | 100 | 500 | 500 | 200 | 100 |
| HP-PnP-Flow（ours） | \(\eta\)（步长尺度） | 1.2 | 1.0 | 1.2 | 1.0 | 2.0 |
| HP-PnP-Flow（ours） | \(\alpha\)（步长指数） | 0.8 | 0.01 | 0.01 | 0.01 | 0.5 |
| HP-PnP-Flow（ours） | \(N\)（迭代次数） | 100 | 100 | 100 | 100 | 60 |
| HP-PnP-Flow（ours） | \(t_0\)（初始偏移） | 0.4 | 0.2 | 0.4 | 0.3 | 0.0 |
| HP-PnP-Flow（ours） | \(\lambda\)（衰减因子） | 0.965 | 0.965 | 0.965 | 0.965 | 0.99 |
| HP-PnP-Flow（ours） | \(K\)（过渡系数） | 0.4 | 0.3 | 0.7 | 0.7 | 0.2 |

注 1：PnP-Flow(1) 与 PnP-Flow(5) 在所有任务上共享相同的超参数。

注 2：HP-PnP-Flow(1) 与 HP-PnP-Flow(5) 在所有任务上共享相同的超参数。

## 附录 B 与 PnP-Flow 的逐迭代比较

图 6–15 给出 HP-PnP-Flow 与 PnP-Flow 在两个数据集全部五项恢复任务上的逐迭代快照。所有实验均在单采样设置下进行。

- **图 6（原文 Figure 6）：** CelebA 上的去噪（\(\sigma=0.2\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 7（原文 Figure 7）：** AFHQ-Cat 上的去噪（\(\sigma=0.2\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 8（原文 Figure 8）：** CelebA 上的去模糊（\(\sigma=0.05,\ b=1.0\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 9（原文 Figure 9）：** AFHQ-Cat 上的去模糊（\(\sigma=0.05,\ b=3.0\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 10（原文 Figure 10）：** CelebA 上的超分（\(\times2,\ \sigma=0.05\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 11（原文 Figure 11）：** AFHQ-Cat 上的超分（\(\times4,\ \sigma=0.05\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 12（原文 Figure 12）：** CelebA 上的随机修复（70% 被掩蔽，\(\sigma=0.01\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 13（原文 Figure 13）：** AFHQ-Cat 上的随机修复（70% 被掩蔽，\(\sigma=0.01\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 14（原文 Figure 14）：** CelebA 上的盒状修复（\(40\times40,\ \sigma=0.05\)）。（a）PnP-Flow；（b）HP-PnP-Flow。
- **图 15（原文 Figure 15）：** AFHQ-Cat 上的盒状修复（\(80\times80,\ \sigma=0.05\)）。（a）PnP-Flow；（b）HP-PnP-Flow。

---

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、AMS 主题分类与关键词、第 1–5 节正文与全部小节（§2.1–2.4、§3、§4.1–4.5）、定义 2.1/2.2/3.2、命题 2.3/3.1（含证明）、定理 3.3（含证明）、式 (1.1)–(3.10)（保留原编号）、表 1–6（逐格转写，含原文粗体/下划线标记）、图 1–15 图注、算法 1–2、附录 A–B、参考文献 [1]–[43]（英文原条目）；许可：arXiv 预印本（公开可读）。**已知缺陷与核对说明：** ① pypdf 抽取在第 4、5 页含 NUL 字符且部分公式括号丢失，本页式 (1.1)–(3.10) 已按 PDF 渲染页（第 2、4–12 页）逐式核对，缺失括号按语义还原；② 表 1、表 2 的粗体（最优）与下划线（次优）标记按 PDF 高倍渲染（scale 5.2–11）逐列核对：CelebA 去模糊 PSNR 中 PnP-Flow(5) 34.65 加粗、HP-PnP-Flow(5) 34.65 加下划线；CelebA 盒状修复 LPIPS 中 HP-PnP-Flow(1) 0.024 加粗、D-Flow 0.024 加下划线（与原文渲染一致）；其余各列按“粗体=最优、下划线=次优”规则逐列核对，AFHQ-Cat 超分 LPIPS 的次优 0.150 属按排序规则补标、渲染确认不足；③ 表 3、表 4 仅 HP-PnP-Flow 列的平均 PSNR 加粗（原文如此）；④ 表 5、表 6 的破折号在 PDF 中为短横线，本页统一记为“—”；OT-ODE 的 \(\gamma\) 行按渲染页转写为 \(\sqrt{t}\) 或常数；⑤ 图 1、图 4、图 5 的图注与坐标轴/图例（含 HP-PnP-Flow(\(t_0=0.5\)) 等）按渲染页转写；图 2/3 与图 6–15 为图像网格，仅译图注与可见列名/PSNR 标签，未逐像素核对；⑥ 原文首页标注日期 November 3, 2026 与 arXiv 戳 2026-11-02 存在出入，按原文照录；⑦ 原文引言中“PnP-Flow 匹配方法”等措辞照原意译出，未做术语统一改写；⑧ 定理 3.3 的假设按原文完整译出（\(f\) 连续可微、\(v^\theta\) 连续、基分布 \(p_0\) 有界支撑、所有迭代预算使用相同初始化与相同隐变量序列），但原文未讨论实际使用的高斯型基分布并不满足“有界支撑”，也未说明推理时如何保证跨预算的同一噪声序列——这两点是值得后续 QA 或向作者确认的疑点，本页未擅自改写原假设。逐句逐式终校未做；建议后续 QA 重点复核：式 (3.1) 在 \(k=S\) 处两段的衔接、式 (3.6) 的展开与不等号方向、命题 3.1 证明中 \((N-S+1)\lambda^S\) 的放缩、表 1/表 2 中并列项的粗体与下划线归属、以及“N/A”单元格的呈现。

**登记（2026-11-04）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
