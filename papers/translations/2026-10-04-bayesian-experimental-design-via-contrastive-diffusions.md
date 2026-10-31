---
layout: page
title: "基于对比扩散的贝叶斯实验设计｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-04-bayesian-experimental-design-via-contrastive-diffusions/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b35ad01081ff8480/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

> **许可与用途声明：** 本页依据本地会议论文集 PDF（ICLR 2025 出版版本）作中文全文翻译，**再传播许可待核验**；本页仅作个人学习用途，**不计入“可公开全文”统计**。原文版权归作者/出版方所有，引用请以 ICLR 2025 正式版本为准。

# 基于对比扩散的贝叶斯实验设计

**原题：** Bayesian Experimental Design via Contrastive Diffusions  
**作者：** Jacopo Iollo¹˒²˒³、Christophe Heinkelé²、Pierre Alliez³、Florence Forbes¹。单位：1 = 格勒诺布尔阿尔卑斯大学、Inria、CNRS、G-INP，法国（name.surname@inria.fr）；2 = Cerema, Endsum-Strasbourg，法国（christophe.heinkele@cerema.fr）；3 = 蓝色海岸大学、Inria，法国（name.surname@inria.fr）。  
**版本：** 会议论文集版本（ICLR 2025: Bayesian Experimental Design via Contrastive Diffusions — Paper Conference），本地 PDF 共 27 页（正文 10 页 + 致谢/参考文献 + 补充材料 A–F）；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–7 节（含 6.1–6.3）、致谢、参考书目英文原条目，以及补充材料 A（EIG 梯度的两种表达式）、B（对数池化与引理 1–2）、C（C.1 去噪扩散模型、C.2 条件扩散模型、C.3 梯度估计）、D（序贯 BOED）、E（SMC 式重采样）、F（F.1 SPCE/SNMC 准则、F.2 实现细节（F.2.1、F.2.2）、F.3 硬件、F.4 软件），全部图注（图 1–9）、表 1、算法 1–2 与公式 (1)–(56)；逐句逐式终校未做。

## 摘要

贝叶斯最优实验设计（BOED）是降低一连串实验成本的有力工具。当以期望信息增益（EIG）为基础时，设计优化等价于最大化先验与后验分布之间某种不可处理的期望对比。由于 BOED 固有的计算复杂度，把这种最大化扩展到高维、复杂场景一直是个难题。本文引入一种**池化后验分布（pooled posterior distribution）**，它具有低成本的采样性质，并通过一个新的 EIG 梯度表达式使 EIG 对比最大化变得可处理。我们用基于扩散的采样器计算池化后验的动力学，并借助双层优化的思想导出高效的采样–优化联合循环。由此获得的效率提升使我们能把 BOED 扩展到扩散模型久经检验的生成能力之上：把生成模型纳入 BOED 框架，我们扩展了其适用范围，使其可用于此前不切实际的场景。数值实验与与最先进方法的比较展示了本方法的潜力。

## 1 引言

在资源受限、实验代价高昂且有限的众多应用场景中，设计最优实验至关重要。本文假设设计由一些连续参数 $\boldsymbol\xi\in\mathcal E\subset\mathbb R^d$ 刻画，它指实验中可被控制、用以优化实验结果的部分，例如测量位置的选取。我们考虑贝叶斯设定：感兴趣参数为 $\boldsymbol\theta\in\Theta\subset\mathbb R^m$，设计被优化以最大化关于 $\boldsymbol\theta$ 的信息增益。贝叶斯最优实验设计（BOED）并非统计学的全新课题，见 Chaloner and Verdinelli (1995)；Sebastiani and Wynn (2000)；Amzal et al. (2006)，但近期随着机器学习技术的引入而重获关注，近期综述见 Rainforth et al. (2024)；Huan et al. (2024)。

最常见的方法是最大化所谓的期望信息增益（EIG），这是一种通过 Shannon 熵刻画信息的互信息准则。设 $p(\boldsymbol\theta)$ 为先验概率分布，$p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)$ 为定义观测 $\mathbf y\in\mathcal Y$ 生成过程的似然。假定先验与 $\boldsymbol\xi$ 无关，且 $p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)$ 有闭式。据我们所知，此前所有 BOED 方法还假定先验有闭式，我们称该设定为**基于密度的 BOED**。本文通过提高 BOED 的计算效率，首次打开通往基于扩散的生成模型的大门，并在先验仅通过样本可得时引入**基于数据的 BOED**，从而把可处理问题的范围拓宽到广泛的逆问题（Daras et al., 2024）。

EIG（下文记为 $I$）有多种等价表述，见 Foster et al. (2019)。它可写成在 $\boldsymbol\xi$ 处考虑观测 $\mathbf y$ 时的期望熵减（式 (1)），也可写成互信息（MI）或期望 Kullback–Leibler（KL）散度（式 (2)）。记 $p_{\boldsymbol\xi}(\boldsymbol\theta,\mathbf y)=p(\boldsymbol\theta,\mathbf y|\boldsymbol\xi)$ 为 $(\boldsymbol\theta,\mathbf Y)$ 的联合分布，并利用 $p(\boldsymbol\theta,\mathbf y|\boldsymbol\xi)=p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)p(\mathbf y|\boldsymbol\xi)=p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)p(\boldsymbol\theta)$，可得

$$
I(\boldsymbol\xi)=\mathbb E_{p(\mathbf y|\boldsymbol\xi)}\left[H(p(\boldsymbol\theta))-H(p(\boldsymbol\theta|\mathbf Y,\boldsymbol\xi))\right] \tag{1}
$$
$$
=\mathbb E_{p(\mathbf y|\boldsymbol\xi)}\left[{\rm KL}\left(p(\boldsymbol\theta|\mathbf Y,\boldsymbol\xi),p(\boldsymbol\theta)\right)\right]
={\rm MI}\left(p_{\boldsymbol\xi}\right), \tag{2}
$$

其中随机变量用大写字母表示，$\mathbb E_{p(\cdot)}[\cdot]$ 或 $\mathbb E_p[\cdot]$ 表示关于 $p$ 的期望，$H(p(\boldsymbol\theta))=-\mathbb E_{p(\boldsymbol\theta)}[\log p(\boldsymbol\theta)]$ 为 $p$ 的熵。联合分布 $p_{\boldsymbol\xi}$ 完全决定所有其他分布（边缘（先验）分布与条件（后验）分布），因此互信息可写成仅依赖 $p_{\boldsymbol\xi}\in\mathcal P(\Theta\times\mathcal Y)$ 的函数。下文 $\mathcal P(\Theta\times\mathcal Y)$、$\mathcal P(\Theta)$、$\mathcal P(\mathcal Y)$ 分别表示 $\Theta\times\mathcal Y$、$\Theta$、$\mathcal Y$ 上的概率测度集合。

在 BOED 中，我们寻找满足下式的 $\boldsymbol\xi^*$：

$$
\boldsymbol\xi^*\in\arg\max_{\boldsymbol\xi\in\mathbb R^d}I(\boldsymbol\xi)
=\arg\max_{\boldsymbol\xi\in\mathbb R^d}{\rm MI}(p_{\boldsymbol\xi}). \tag{3}
$$

上述优化通常称为静态设计优化。基于 EIG 的 BOED 的主要挑战在于：EIG 及其关于 $\boldsymbol\xi$ 的梯度都是**双重不可处理**的——其表达式都涉及对不可处理后验分布的期望，而后验本身也不易采样。后验分布一般只能通过提供近似样本的迭代算法获得。实践中，由于设计优化置于序贯场景中（依次规划一系列实验，每个后续设计都须计入前序），推断问题更加复杂。

为消除被积函数的不可处理性，已有工作提出优化 EIG 下界（Foster et al., 2019）。该下界可表示为可处理被积函数的期望，并随仿真预算增加而变紧。剩下的后验采样问题则被以不同方式解决。一类方法通过变分技术（Foster et al., 2019）或高效序贯 Monte Carlo（SMC）采样（Iollo et al., 2024；Drovandi et al., 2013）近似这个棘手的后验分布。另一类方法回避后验估计，用强化学习（RL）与离线策略学习绕开采样需求（Foster et al., 2021；Ivanova et al., 2021；Blau et al., 2022）。然而一些研究表明估计后验是有益的，如 Iollo et al. (2024) 与 Ivanova et al. (2024)——后者通过引入后验估计步骤改进 Foster et al. (2021) 以精炼所学策略。此外应记住，后验推断在 BOED 中处于核心地位，因为终极目标并非设计本身，而是获得关于感兴趣参数的信息；这在序贯场景中尤其困难。此前同时给出候选设计与后验分布估计的尝试（如 Foster et al., 2019；Iollo et al., 2024）本质上都是**两个交替阶段**：近似设计优化依赖近似后验采样，反之亦然。

本文提出一种新的**单阶段**方法，利用“采样即优化”的设定（Korba and Salim, 2022；Marion et al., 2025）——把采样视为概率分布空间上的优化任务。我们给出新的 EIG 梯度表达式（第 3 节），它表明 EIG 梯度是设计参数与某些采样结果的函数；这契合第 4 节为 BOED 改造的双层优化框架。于是每一步都能在**一个循环**中同时给出最优设计估计与当前后验分布的样本（第 5 节）。由此得到的高效流程既能处理传统的基于密度的采样器，也能处理基于数据的采样器（如极为成功的基于扩散的生成模型所提供的采样器）。由此获得的效率提升使 BOED 可应用于前所未有的更大规模问题，包括从计算机视觉到蛋白质工程与 MRI 的修复（inpainting）问题（Quan et al., 2024；Yang et al., 2019；Aali et al., 2023）。图 1 展示了 $28\times28$ 图像 $\boldsymbol\theta$ 重建问题的一个例子：从位于待选位置 $\boldsymbol\xi$ 的 $7\times7$ 子图像中重建，细节见第 6 节。为简化记号，我们首先在静态设计情形下呈现方法；序贯情形的适配在第 6 节说明，全部数值例子都采用序贯设定。

**图 1：** 由 7 张以七个中心像素 $\boldsymbol\xi$（设计）为中心的 $7\times7$ 子图像 $\mathbf y=\mathbf A_{\boldsymbol\xi}\boldsymbol\theta+\boldsymbol\eta$ 序贯重建 $28\times28$ 图像 $\boldsymbol\theta$（第 1 列）。优化设计与随机设计对比：测得的结果 $\mathbf y$（第 2 列 vs 第 3 列）与最高权重的参数 $\boldsymbol\theta$ 估计（重建）（上 vs 下行）。

## 2 相关工作

我们聚焦连续问题的基于梯度的 BOED。用一阶方法求解 (3) 需要计算 EIG $I$ 的梯度，其可处理性不优于 $I$ 本身。基于梯度的 BOED 一般基于随机梯度类算法（参见 Huan et al. (2024) 第 4.3.2 节）。这原则上需要无偏梯度估计器，不过也有研究考察了使用有偏 oracle 的随机逼近方案，如 Demidovich et al. (2023)；Liu and Tajbakhsh (2024)。为满足该要求，多数随机梯度方法从 EIG 下界出发，从而得到可处理的无偏梯度估计器；更具体地，EIG 下界通常能消除嵌套期望问题，如 Foster et al. (2019)。相反，关注直接 EIG 梯度估计器的工作很少，据我们所知仅有 Goda et al. (2022) 与 Ao and Li (2024)。Goda et al. (2022) 用 Rhee and Glynn (2015) 多层级嵌套 Monte Carlo（MLMC）估计器的随机版本，给出 EIG 梯度的无偏估计；Ao and Li (2024) 提出另一种估计器，使用 MCMC 采样器，从而得到有偏估计，但作者通过实验表明偏差可被做得可忽略。本文首先在第 3 节表明：这两种看似不同的方案实际上只在对不可处理后验分布的近似方式上不同；随后我们提出第三种计算 EIG 梯度的方式，它计算效率更高，且更能扩展到更大数据量与序贯设计场景。该新表达式利用了我们引入并命名为**池化后验分布**的分布。该分布具有有趣的采样性质，使我们能借助基于分数的采样技术，并与 Marion et al. (2025) 所谓的隐式扩散框架相联系。我们第 5 节的单循环流程受 Marion et al. (2025) 及近期双层优化进展（Yang et al., 2021；Dagréou et al., 2022；Hong et al., 2023）启发；但这些设定并不覆盖 EIG 这类双重不可处理目标——它既需要合适的梯度估计器，也需要采样算子（见本文第 3、4 节）。在 BOED 中，Foster et al. (2020) 已提出高效单循环流程，但它们严重依赖变分近似，在后验分布复杂时可能限制精度。

## 3 池化后验的 EIG 梯度估计

高效的 EIG 梯度估计器是准确、可扩展 BOED 的核心。由重参数化技巧导出的梯度往往优于基于分数技术得到的梯度，因为据报道其方差更低（Xu et al., 2019）。

**基于重参数化技巧的 EIG 梯度。** 假定 $p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)$ 使得 $\mathbf Y$ 可重写为 $\mathbf Y=T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)$，其中 $T_{\boldsymbol\xi,\boldsymbol\theta}$ 可逆，故 $\mathbf U=T^{-1}_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf Y)$，且 $\mathbf U$ 是与 $\boldsymbol\theta$、$\boldsymbol\xi$ 独立的随机变量、具有可处理分布 $p_U(\mathbf U)$。当直接模型对应加性高斯噪声时，该变换对 $\mathbf U$ 是线性的，$T_{\boldsymbol\xi,\boldsymbol\theta}$ 的存在性显然；更一般情形下也有结果保证此类变换存在（Papamakarios et al., 2021）。利用该变量替换可导出 EIG 梯度的两个表达式，即下文 (5) 与 (6)（详细步骤见附录 A）。记 $p_{\boldsymbol\xi}$ 为联合分布 $p(\boldsymbol\theta,\mathbf y|\boldsymbol\xi)$，$g$ 为与分数相关的量 $g(\boldsymbol\xi,\mathbf y,\boldsymbol\theta,\boldsymbol\theta')=\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf u)|\boldsymbol\theta',\boldsymbol\xi)|_{\mathbf u=T^{-1}_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf y)}$，并记 $h(\boldsymbol\xi,\mathbf y,\boldsymbol\theta,\boldsymbol\theta')=\nabla_{\boldsymbol\xi}p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf u)|\boldsymbol\theta',\boldsymbol\xi)|_{\mathbf u=T^{-1}_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf y)}$，第一个表达式为

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\mathbb E_{p_{\boldsymbol\xi}}\left[
g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta)
-\frac{\mathbb E_{p(\boldsymbol\theta')}\left[h(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta')\right]}
{\mathbb E_{p(\boldsymbol\theta')}\left[p(\mathbf Y|\boldsymbol\theta',\boldsymbol\xi)\right]}
\right]. \tag{4}
$$

对 (4) 的第二项采用重要性采样表述，取重要性分布 $q\in\mathcal P(\Theta)$（可依赖 $\mathbf y$、$\boldsymbol\theta$ 与 $\boldsymbol\xi$），进一步得到

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\mathbb E_{p_{\boldsymbol\xi}}\left[
g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta)
-\frac{\mathbb E_{q(\boldsymbol\theta'|\mathbf Y,\boldsymbol\theta,\boldsymbol\xi)}\left[\frac{p(\boldsymbol\theta')}{q(\boldsymbol\theta'|\mathbf Y,\boldsymbol\theta,\boldsymbol\xi)}h(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta')\right]}
{\mathbb E_{q(\boldsymbol\theta'|\mathbf Y,\boldsymbol\theta,\boldsymbol\xi)}\left[\frac{p(\boldsymbol\theta')}{q(\boldsymbol\theta'|\mathbf Y,\boldsymbol\theta,\boldsymbol\xi)}p(\mathbf Y|\boldsymbol\theta',\boldsymbol\xi)\right]}
\right]. \tag{5}
$$

Goda et al. (2022) 在后一表达式中采用 $q$ 为后验分布的 Laplace 近似，并用于随机化 MLMC 流程，但未对该特定 $q$ 的选择给出理由；由此得到的估计器并非无偏，但可按 Rhee and Glynn (2015) 去偏。

另一种 EIG 梯度表达式是 Ao and Li (2024) 的出发点：

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\mathbb E_{p_{\boldsymbol\xi}}\left[
g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta)
-\mathbb E_{p(\boldsymbol\theta'|\mathbf Y,\boldsymbol\xi)}\left[g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta')\right]
\right]. \tag{6}
$$

由此得到附录 A 中的嵌套 Monte Carlo 估计器 (30)：从联合分布 $p_{\boldsymbol\xi}$ 取样本 $\{(\mathbf y_i,\boldsymbol\theta_i)\}_{i=1:N}$，并对每个 $\mathbf y_i$ 用 MCMC 过程从近似不可处理后验 $p(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi)$ 中取样本 $\{\boldsymbol\theta'_{i,j}\}_{j=1:M}$。有趣的是，令 (5) 中的重要性提议 $q(\boldsymbol\theta'|\mathbf y,\boldsymbol\theta,\boldsymbol\xi)=p(\boldsymbol\theta'|\mathbf y,\boldsymbol\xi)$ 也可恢复表达式 (6)，这清楚地解释了 Goda et al. (2022) 中 $q$ 选择的相关性。因此 Goda et al. (2022) 与 Ao and Li (2024) 的方法主要区别在于对后验的近似选择：Goda et al. (2022) 的 Laplace 近似仅在后验为单峰时相关，而实际中后验未必单峰；Ao and Li (2024) 的 MCMC 版本更具一般性，但代价更高——需运行 $N$ 次 MCMC 采样器，每次都针对不同的后验 $p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi)$。下面我们引入池化后验分布，并导出另一种计算上更高效的梯度表达式。

**使用池化后验提议的重要性采样 EIG 梯度估计器。** Ao and Li (2024) 只考虑静态设计，这掩盖了一个事实：在更现实的序贯设计场景中，其解因计算复杂度而不可处理，并面临嵌套估计的标准问题（Rainforth et al., 2018）。为避免该问题，我们对 (6) 的第二项采用重要性采样表述——其优点是把对 $\mathbf y$（及 $\boldsymbol\theta$）的依赖从采样部分移到被积函数部分。我们考虑不依赖 $\mathbf Y$ 与 $\boldsymbol\theta$ 的提议分布 $q\in\mathcal P(\theta)$，于是

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\mathbb E_{p_{\boldsymbol\xi}}\left[
g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta)
-\mathbb E_{q(\boldsymbol\theta'|\boldsymbol\xi)}\left[\frac{p(\boldsymbol\theta'|\mathbf Y,\boldsymbol\xi)}{q(\boldsymbol\theta'|\boldsymbol\xi)}g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta')\right]
\right], \tag{7}
$$

并可得到近似梯度

$$
\frac1N\sum_{i=1}^{N}\left[
g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta_i)
-\mathbb E_{q(\boldsymbol\theta'|\boldsymbol\xi)}\left[\frac{p(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi)}{q(\boldsymbol\theta'|\boldsymbol\xi)}g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta')\right]
\right]. \tag{8}
$$

(8) 的第二项仍需 $N$ 次重要性采样近似，其质量取决于提议分布 $q$ 的选择。理想的提议 $q$ 应易于仿真、权重至少可计算到常数倍，且 $q$ 与多个目标分布 $p(\cdot|\mathbf y_i,\boldsymbol\xi)$ 不应相距太远。给定来自 $p_{\boldsymbol\xi}$ 的 $N$ 个样本 $\{(\boldsymbol\theta_i,\mathbf y_i)\}_{i=1:N}$，我们因此取 $q=q_{\boldsymbol\xi,N}$，其中 $q_{\boldsymbol\xi,N}$ 是如下**对数池化**（即几何混合），且 $\sum_{i=1}^N\nu_i=1$：

$$
q_{\boldsymbol\xi,N}(\boldsymbol\theta)\propto\prod_{i=1}^{N}p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi)^{\nu_i}
\propto p(\boldsymbol\theta)\prod_{i=1}^{N}p(\mathbf y_i|\boldsymbol\theta,\boldsymbol\xi)^{\nu_i}. \tag{9}
$$

我们称 $q_{\boldsymbol\xi,N}$ 为**池化后验分布**，其在 (13) 中有更一般的定义。它使我们能评估候选设计 $\boldsymbol\xi$ 对来自先验的样本的影响。它与标准后验不同，因为优化期间并没有通过运行实验 $\boldsymbol\xi$ 得到的真实数据 $\mathbf y$；我们只有来自联合分布 $p_{\boldsymbol\xi}$ 的样本 $\{(\boldsymbol\theta_i,\mathbf y_i)\}_{i=1:N}$。池化后验可视为一种分布：给定来自先验的样本 $\{\boldsymbol\theta_i\}_{i=1:N}$，它计入候选实验 $\boldsymbol\xi$ 的所有可能结果。该 $q_{\boldsymbol\xi,N}$ 的选择在附录 B 中借助引理 2 予以论证：引理 2 表明，对 $\sum_{i=1}^N\nu_i=1$，$q_{\boldsymbol\xi,N}$ 是使对各后验 $p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi)$ 的加权 KL 和 $\sum_{i=1}^N\nu_i{\rm KL}(q,p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi))$ 最小的分布 $q$，从而构成高效的重要性采样提议。于是得到新的梯度估计器

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)\approx\frac1N\sum_{i=1}^{N}\left[
g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta_i)
-\frac1M\sum_{j=1}^{M}w_{i,j}\,g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta'_j)
\right], \tag{10}
$$

其中 $\{(\boldsymbol\theta_i,\mathbf y_i)\}_{i=1:N}$ 服从 $p_{\boldsymbol\xi}$，$\{\boldsymbol\theta'_j\}_{j=1:M}$ 服从 $q_{\boldsymbol\xi,N}$，且 $w_{i,j}=\frac{p(\boldsymbol\theta'_j|\mathbf y_i,\boldsymbol\xi)}{q_{\boldsymbol\xi,N}(\boldsymbol\theta'_j)}$ 为重要性采样权重。当该分式只能计算到常数倍时，我们采用自归一化重要性采样（SNIS），用未归一化的 $\tilde p$、$\tilde q_{\boldsymbol\xi,N}$：

$$
\tilde w_{i,j}=\frac{\tilde p(\boldsymbol\theta'_j|\mathbf y_i,\boldsymbol\xi)}{\tilde q_{\boldsymbol\xi,N}(\boldsymbol\theta'_j)}
=\frac{p(\mathbf y_i|\boldsymbol\theta'_j,\boldsymbol\xi)}{\prod_{\ell=1}^{N}p(\mathbf y_\ell|\boldsymbol\theta'_j,\boldsymbol\xi)^{\nu_\ell}},
\qquad
w_{i,j}=\frac{\tilde w_{i,j}}{\sum_{j=1}^{M}\tilde w_{i,j}}. \tag{11}
$$

尽管计算代价降低，用 (10) 计算梯度仍需要一个迭代采样算法，且理想上应运行大量迭代以获得 $p_{\boldsymbol\xi}$ 与池化后验 $q_{\boldsymbol\xi,N}$ 足够好的近似。在静态设计中，从联合分布采样一般不难（先验与似然假定可用），但在序贯设计中这成为问题（第 6.1 节详述）。序贯设计是本文与实践都要牢记的设定，实践中很少能完全达到精确分布。为评估其对梯度近似的影响，照 Marion et al. (2025) 的做法引入**梯度算子**会很方便。下一节我们说明如何把 Marion et al. (2025) 的形式化适配到我们的 BOED 任务。

## 4 通过采样的 EIG 优化

为用梯度估计器 (10) 最大化 EIG，需要来自联合分布 $p_{\boldsymbol\xi}$ 与池化后验提议 $q_{\boldsymbol\xi,N}$ 的样本。若朴素处理，会产生计算昂贵的嵌套采样–优化循环：每次更新设计参数 $\boldsymbol\xi$ 都需重新生成两个分布的新样本。为导出更高效的流程，我们把 Marion et al. (2025) 的框架适配到 BOED——该框架把采样与优化整合为单个双层优化循环。为此，需先把 EIG 梯度 $\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)$ 表达为三个关键组成部分的函数 $\Gamma$：联合分布 $p_{\boldsymbol\xi}$、提议分布 $q$ 与设计参数 $\boldsymbol\xi$ 本身。我们选择池化后验作为提议分布 $q$，其理由在于其有趣的采样性质；同时把 Marion et al. (2025) 的采样算子概念推广，以高效生成估计 EIG 梯度所需的样本。

**通过采样的梯度估计。** 定义 $\Gamma$ 为从 $\mathcal P(\Theta\times\mathcal Y)\times\mathcal P(\Theta)\times\mathbb R^d$ 到 $\mathbb R^d$ 的函数：

$$
\Gamma(p,q,\boldsymbol\xi)=\mathbb E_{p}\left[
g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta)
-\mathbb E_{q}\left[\frac{p(\boldsymbol\theta'|\mathbf Y)}{q(\boldsymbol\theta')}g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta')\right]
\right]. \tag{12}
$$

表达式 (7) 表明 $\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\Gamma(p_{\boldsymbol\xi},q,\boldsymbol\xi)$，其中 $q$ 是 $\boldsymbol\theta'$ 上的分布 $q(\boldsymbol\theta'|\boldsymbol\xi)$，可依赖 $\boldsymbol\xi$。于是梯度估计器 (10) 对应 $\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)\approx\Gamma(\hat p_{\boldsymbol\xi},\hat q_{\boldsymbol\xi,N},\boldsymbol\xi)$，其中 $\hat p_{\boldsymbol\xi}=\sum_{i=1}^N\delta_{(\boldsymbol\theta_i,\mathbf y_i)}$、$\hat q_{\boldsymbol\xi,N}=\sum_{j=1}^M\delta_{\boldsymbol\theta'_j}$。一般而言，从 $p_{\boldsymbol\xi}$（或其序贯对应物）与 $q_{\boldsymbol\xi,N}$ 采样都很困难，只能通过迭代过程实现。然而池化后验的一个有趣特点是它不增加额外的采样困难。

**池化后验分布。** 更一般地（细节见附录 B），我们定义

$$
q_{\boldsymbol\xi,\rho}(\boldsymbol\theta)\propto\exp\left(\mathbb E_{\rho}\left[\log p(\boldsymbol\theta|\mathbf Y,\boldsymbol\xi)\right]\right), \tag{13}
$$

其中 $\rho$ 是 $\mathcal Y$ 上的测度。当 $\rho(\mathbf y)=\sum_{i=1}^N\nu_i\delta_{\mathbf y_i}(\mathbf y)$ 且 $\sum_{i=1}^N\nu_i=1$ 时，即恢复 (9) 中的 $q_{\boldsymbol\xi,\rho}(\boldsymbol\theta)=q_{\boldsymbol\xi,N}(\boldsymbol\theta)$。池化后验的特殊结构使我们能用与采样单个后验 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)$ 相同的算法结构来采样它。事实上，$q_{\boldsymbol\xi,\rho}(\boldsymbol\theta)$ 的分数与后验分数相联系：

$$
\nabla_{\boldsymbol\theta}\log q_{\boldsymbol\xi,\rho}(\boldsymbol\theta)
=\mathbb E_{\rho}\left[\nabla_{\boldsymbol\theta}\log p(\boldsymbol\theta|\mathbf Y,\boldsymbol\xi)\right], \tag{14}
$$

对 $q_{\boldsymbol\xi,N}$，该式简化为 $\sum_{i=1}^N\nu_i\nabla_{\boldsymbol\theta}\log p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi)$。实践中，我们把采样的输出视为迭代所谓采样算子的随机过程的结果。

**迭代采样算子。** 迭代采样算子是 Marion et al. (2025) 引入的、到概率空间的映射。在我们的 BOED 设定中考虑两个这样的算子。第一个算子对每个 $\boldsymbol\xi$ 由一列从 $\mathcal P(\Theta\times\mathcal Y)$ 到自身的函数定义，记为 $\Sigma_s^{\mathbf Y,\boldsymbol\theta}(p,\boldsymbol\xi)$。采样定义为如下过程在 $s\to\infty$ 或某个有限 $s=S$ 时的结果：从 $p^{(0)}\in\mathcal P(\Theta\times\mathcal Y)$ 出发迭代

$$
p^{(s+1)}=\Sigma_s^{\mathbf Y,\boldsymbol\theta}\left(p^{(s)},\boldsymbol\xi\right), \tag{15}
$$

其中 $p^{(s)}$ 可以是显式的（例如 $p^{(s)}$ 为参数依赖 $s$ 的高斯分布），也可以由随机变量 $\mathbf X_s\sim p^{(s)}$ 表示。例如在基于密度的 BOED 中，取 $\mathbf X_s=(\mathbf Y_s,\boldsymbol\theta_s)$ 时，我们考虑收敛到 $p_{\boldsymbol\xi}$ 的 Langevin 扩散的 Euler 离散：

$$
\begin{aligned}
\mathbf y^{(s+1)}&=\mathbf y^{(s)}-\gamma_s\nabla_{\mathbf y}V\left(\mathbf y^{(s)},\boldsymbol\theta^{(s)},\boldsymbol\xi\right)+\sqrt{2\gamma_s}\,\mathbf B_{y,s},\\
\boldsymbol\theta^{(s+1)}&=\boldsymbol\theta^{(s)}-\gamma_s\nabla_{\boldsymbol\theta}V\left(\mathbf y^{(s)},\boldsymbol\theta^{(s)},\boldsymbol\xi\right)+\sqrt{2\gamma_s}\,\mathbf B_{\theta,s},
\end{aligned} \tag{16}
$$

其中 $\mathbf B_{y,s}$ 与 $\mathbf B_{\theta,s}$ 为独立标准高斯变量的实现，$\gamma_s$ 为步长，$V(\mathbf y,\boldsymbol\theta,\boldsymbol\xi)=-\log p(\boldsymbol\theta)-\log p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)$ 为 $p_{\boldsymbol\xi}$ 的势函数，即 $p_{\boldsymbol\xi}(\mathbf y,\boldsymbol\theta)\propto\exp(-V(\mathbf y,\boldsymbol\theta,\boldsymbol\xi))$。该动力学在 $s\to\infty$ 时收敛到 $p_{\boldsymbol\xi}$ 的样本。因此下文用记号 $\Sigma_s^{\mathbf Y,\boldsymbol\theta}$ 表示我们可以获得 $p^{(s+1)}$ 的样本——这等价于把 $\Sigma_s^{\mathbf Y,\boldsymbol\theta}$ 作用于由样本 $\{(\mathbf y_i^{(s)},\boldsymbol\theta_i^{(s)})\}_{i=1:N}$ 构造的 $p^{(s)}$ 经验版本。类似地，利用其分数表达式，可通过如下更新产生池化后验 $q_{\boldsymbol\xi,N}$ 的样本 $\{\boldsymbol\theta_j^{\prime(s+1)}\}_{j=1:M}$：

$$
\boldsymbol\theta^{\prime(s+1)}=\boldsymbol\theta^{\prime(s)}
-\gamma'_s\sum_{i=1}^{N}\nu_i\nabla_{\boldsymbol\theta}V\left(\mathbf y_i,\boldsymbol\theta^{\prime(s)},\boldsymbol\xi\right)
+\sqrt{2\gamma'_s}\,\mathbf B_{\theta',s}. \tag{17}
$$

对 (13) 的一般池化后验采样算子，我们需要扩展 Marion et al. (2025) 的定义，为条件部分增加对某个分布 $\rho\in\mathcal P(\mathcal Y)$ 的依赖。第二个采样算子对给定 $\boldsymbol\xi$ 与 $\rho$，由一列从 $\mathcal P(\Theta)$ 到自身的参数化函数定义，记为 $\Sigma_s^{\boldsymbol\theta'}(q,\boldsymbol\xi,\rho)$，定义为如下过程从 $q^{(0)}\in\mathcal P(\Theta)$ 出发迭代的结果：

$$
q^{(s+1)}=\Sigma_s^{\boldsymbol\theta'}\left(q^{(s)},\boldsymbol\xi,\rho\right). \tag{18}
$$

例如当 $\rho=\sum_{i=1}^N\nu_i\delta_{\mathbf y_i}$ 时，$q^{(s+1)}=\Sigma_s^{\boldsymbol\theta'}(q^{(s)},\boldsymbol\xi,\rho)$ 可简写为 (17)。

**图 2：** 源定位示例。第 $k$ 次实验时的先验（左）与池化后验（右）样本。优化序列 $\boldsymbol\xi_0,\cdots,\boldsymbol\xi_T$（蓝叉）结束时得到的最终 $\boldsymbol\xi^*_k$（橙叉）。该优化通过使池化后验“尽可能不同于”先验来“对比”两个分布。

## 5 单循环对比式 EIG 优化

“通过采样做优化”的视角自然导向嵌套循环流程：用第 4 节规定的两个采样器运行内层循环以获得 $p_{\boldsymbol\xi}$ 与 $q_{\boldsymbol\xi,N}$ 的良好近似，如嵌套循环算法 1 所示。若把采样视为分布空间上的优化（Marion et al., 2025），则可导出更高效的单循环流程：如单循环算法 2 所示，在对 $\boldsymbol\xi$ 的每一步优化中，采样算子只用当前 $\boldsymbol\xi$ 作用一次，随后再更新 $\boldsymbol\xi$，如此交替。采样算子既可来自传统基于密度的采样（如 (16) 与 (17)，需要目标分布的表达式以计算分数），也可来自基于数据的采样（只有训练样本可用）。后一情形下，条件基于分数的生成模型已成为非常活跃的研究方向；下面我们说明如何把 Dou and Song (2024) 最近提出的一个此类框架用于我们的设定。

**算法 1：嵌套循环优化**

输入：初始设计 $\boldsymbol\xi_0\in\mathbb R^d$

- **for** $t=0:T-1$（外层 $\boldsymbol\xi$ 优化循环）**do**
  - $p_t^{(0)}\leftarrow p_0$，$q_t^{(0)}\leftarrow q_0$
  - **for** $s=0:S-1$（$p_{\boldsymbol\xi}$ 内层采样）**do**
    - $p_t^{(s+1)}=\Sigma_s^{\mathbf Y,\boldsymbol\theta}(p_t^{(s)},\boldsymbol\xi_t)$
  - **end**
  - $\hat p_{\boldsymbol\xi_t}\leftarrow p_t^{(S)}$
  - $\hat\rho_t\leftarrow\hat p_{\boldsymbol\xi_t}(\mathbf y)$（$\hat p_{\boldsymbol\xi_t}$ 关于 $\mathbf y$ 的边缘）
  - **for** $s'=1:S'-1$（$q_{\boldsymbol\xi,\rho}$ 内层采样）**do**
    - $q_t^{(s'+1)}=\Sigma_{s'}^{\boldsymbol\theta'}(q_t^{(s')},\boldsymbol\xi_t,\hat\rho_t)$
  - **end**
  - $\hat q_{\boldsymbol\xi_t}\leftarrow q_t^{(S')}$
  - 按 (12) 计算 $\nabla_{\boldsymbol\xi}I(\boldsymbol\xi_t)=\Gamma(\hat p_{\boldsymbol\xi_t},\hat q_{\boldsymbol\xi_t},\boldsymbol\xi_t)$
  - 用 SGD 或其他优化器更新 $\boldsymbol\xi_t$
- **end**

输出：$\boldsymbol\xi_T$。

**算法 2：单循环优化**

输入：初始设计 $\boldsymbol\xi_0\in\mathbb R^d$，$p^{(0)}\leftarrow p_0$，$q^{(0)}\leftarrow q_0$

- **for** $t=0:T-1$（采样–优化循环）**do**
  - $p^{(t+1)}=\Sigma_t^{\mathbf Y,\boldsymbol\theta}(p^{(t)},\boldsymbol\xi_t)$
  - $\hat\rho_{t+1}\leftarrow p^{(t+1)}_{\mathbf y}$（$p^{(t+1)}$ 关于 $\mathbf y$ 的边缘）
  - $q^{(t+1)}=\Sigma_t^{\boldsymbol\theta'}(q^{(t)},\boldsymbol\xi_t,\hat\rho_{t+1})$
  - 按 (12) 计算 $\nabla_{\boldsymbol\xi}I(\boldsymbol\xi_t)=\Gamma(p^{(t+1)},q^{(t+1)},\boldsymbol\xi_t)$
  - 用 SGD 或其他优化器更新 $\boldsymbol\xi_t$
- **end**

输出：$\boldsymbol\xi_T$。

**基于数据的采样器。** 在 BOED 中，我们关心从条件分布 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)$ 采样，目标有二：其一，需要从池化后验 $q_{\boldsymbol\xi,N}(\boldsymbol\theta)$ 采样，这要求以观测 $\mathbf y$ 为条件；其二，在序贯设计问题中（见 6.1 节与附录 D），需要以观测历史 $\mathcal D_{k-1}$ 为条件，产生 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 的样本。这两个问题都可在逆问题的扩散模型框架下处理（Daras et al., 2024）。当似然对应线性测量 $\mathbf Y=\mathbf A_{\boldsymbol\xi}\boldsymbol\theta+\boldsymbol\eta$、$\boldsymbol\eta\sim\mathcal N(0,\Sigma)$ 时，近期的一些尝试（如 Corenflos et al., 2025；Cardoso et al., 2024）已研究仅用预训练扩散模型的分数 $s_\phi(\boldsymbol\theta,t)$、无需任何重训练即可高效地从 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)$ 采样（细节见附录 C）。对条件采样而言，这意味着运行一条以条件分数 $\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta(t)|\mathbf y,\boldsymbol\xi)$ 为驱动的 SDE，而该分数不可处理（见式 (43) 与附录 C.2）。作为解决方案，Dou and Song (2024) 提出名为 FPS 的方法，用 $p_t(\boldsymbol\theta(t)|\mathbf y(t),\boldsymbol\xi)$ 近似 $p_t(\boldsymbol\theta(t)|\mathbf y,\boldsymbol\xi)$，其中 $\mathbf y(t)$ 为时刻 $t$ 的加噪观测。由于分数 $\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta(t)|\mathbf y(t),\boldsymbol\xi)$ 可写为 $\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta(t))+\nabla_{\boldsymbol\theta}\log p_t(\mathbf y(t)|\boldsymbol\theta(t),\boldsymbol\xi)$，我们可借助学习到的分数 $s_\phi(\boldsymbol\theta(t),t)$ 与 $\nabla_{\boldsymbol\theta}\log p_t(\mathbf y(t)|\boldsymbol\theta(t),\boldsymbol\xi)$ 的闭式，用近似分数的反向 SDE 近似从 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)$ 采样，见附录 C.2 的式 (45)。这使我们能高效地从 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 采样，并利用 $\nabla_{\boldsymbol\theta}\log q_{\boldsymbol\xi,N}(\boldsymbol\theta')=\sum_{i=1}^N\nu_i\nabla_{\boldsymbol\theta}\log p(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi)$，通过下面对 (45) 的扩展从池化后验采样，其中 $\mathbf y_i(t)$ 为 $\mathbf y_i$ 在前向 SDE 时刻 $t$ 的加噪版本：

$$
d\boldsymbol\theta'(t)=\left[
-\frac{\beta(t)}{2}\boldsymbol\theta'(t)
-\beta(t)\sum_{i=1}^{N}\nu_i\nabla_{\boldsymbol\theta}\log p_t\left(\boldsymbol\theta'(t)|\mathbf y_i(t),\boldsymbol\xi\right)
\right]dt+\sqrt{\beta(t)}\,d\mathbf B_t, \tag{19}
$$

此时上式中的 $t$ 从无穷大反向流向 $t=0$。实践中 (19) 用数值离散近似求解，并用 $\boldsymbol\theta'(T)\sim\mathcal N(\mathbf 0,\mathbf I)$（某较大有限 $T$）初始化过程；还可加入附录 E 所述的额外重采样 SMC 式步骤。该方法使我们能处理新的序贯基于数据的 BOED 任务，如 6.3 节所示。

> **原文疑点：** 式 (19) 直接把条件分数 $\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta'(t)|\mathbf y_i(t),\boldsymbol\xi)$ 置于漂移项中；但按正文同段对 FPS 的描述（以及附录 C.2 的式 (45)），该条件分数需分解为“无条件分数 + 条件似然分数”（$\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta'(t))+\nabla_{\boldsymbol\theta}\log p_t(\mathbf y(t)|\boldsymbol\theta'(t),\boldsymbol\xi)$）后，才能复用预训练扩散模型 $s_\phi$；式 (19) 的写法省略了该分解，若按字面理解为直接可算的条件分数则与 FPS 的可处理性论证不一致。本译按原文照录并加注。

**基于密度的采样器。** 基于密度的采样器中可提及基于分数的 MCMC 采样器，包括经非调整 Langevin 算法（ULA）与 Metropolis 调整 Langevin 算法（MALA）的 Langevin 动力学（Roberts and Tweedie, 1996）、Hamiltonian Monte Carlo（HMC）采样器（Hoffman and Gelman, 2014）。6.2 节用 Langevin 与序贯 Monte Carlo（SMC）给出一个序贯基于密度 BOED 任务的示例。

**对比式优化。** 用梯度表达式 (10) 优化 $\boldsymbol\xi$，会鼓励选取这样的 $\boldsymbol\xi$：要么使联合分布 $p_{\boldsymbol\xi}$ 的样本 $(\boldsymbol\theta_i,\mathbf y_i)$ 具有高概率 $p(\mathbf y_i|\boldsymbol\theta_i,\boldsymbol\xi)$，要么使池化后验的样本 $\boldsymbol\theta'_j$ 具有低概率 $p(\mathbf y_j|\boldsymbol\theta'_j,\boldsymbol\xi)$。这种对比行为在 (2) 中也可见——那里 EIG 定义为对实验结果取平均的后验与先验分布之间 KL。池化后验 $q_{\boldsymbol\xi,N}$ 随后被当作不可处理后验的代理，以执行该对比式优化。图 2 给出 6.2 节源定位示例中这种对比行为的可视化：它对应把下一个设计 $\boldsymbol\xi$ 设为能（从先验所有可能取值中）消除最多参数 $\boldsymbol\theta$ 取值的值（右图对比左图）。这类似于噪声对比估计（Gutmann and Hyvärinen, 2010）方法——那里模型参数被计算为使数据样本尽可能不同于噪声样本。更多图示见附录图 6。

## 6 数值实验

我们考虑两个序贯示例——基于密度的（6.2 节）与基于数据的（6.3 节）BOED——以说明本方法在这两种设定下都能扩展到序贯情形。

### 6.1 序贯贝叶斯实验设计

在序贯设定中，规划 $K$ 次实验的序列，并逐步计入相继收集的数据。在第 $k$ 步，我们希望依据此前结果 $\mathcal D_{k-1}=\{(\mathbf y_1,\boldsymbol\xi_1),\dots,(\mathbf y_{k-1},\boldsymbol\xi_{k-1})\}$ 选出最佳设计 $\boldsymbol\xi_k$。该场景下的期望信息增益为

$$
I_k(\boldsymbol\xi,\mathcal D_{k-1})=\mathbb E_{p(\mathbf y|\boldsymbol\xi,\mathcal D_{k-1})}\left[{\rm KL}\left(p(\boldsymbol\theta|\mathbf Y,\boldsymbol\xi,\mathcal D_{k-1}),p(\boldsymbol\theta|\mathcal D_{k-1})\right)\right],
$$

其中 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 与 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi,\mathcal D_{k-1})$ 分别充当静态情形 (2) 中先验与后验的对应物（详见附录 D）。主要区别在于我们不再能直接获得第 $k$ 步先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 的样本；但由于 $p(\boldsymbol\theta|\mathcal D_{k-1})\propto p(\boldsymbol\theta)\prod_{n=1}^{k-1}p(\mathbf y_n|\boldsymbol\theta,\boldsymbol\xi_n)$ 且 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi,\mathcal D_{k-1})\propto p(\boldsymbol\theta)p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)\prod_{n=1}^{k-1}p(\mathbf y_n|\boldsymbol\theta,\boldsymbol\xi_n)$，我们仍可计算这些分布的分数，并运行类似 (15) 与 (18) 的采样算子。为强调其对 $\mathcal D_{k-1}$ 的依赖，记作 $\Sigma_s^{\mathbf Y,\boldsymbol\theta|\mathcal D_{k-1}}(p^{(s)},\boldsymbol\xi)$ 与 $\Sigma_s^{\boldsymbol\theta'|\mathcal D_{k-1}}(q^{(s)},\boldsymbol\xi,\rho)$；示例见 6.2 节的 (20) 与 (21)。

**评估指标与对比。** 我们称本方法为 **CoDiff**。6.2 节与近期其他方法比较，即 Blau et al. (2022) 的基于强化学习方法 RL-BOED、Foster et al. (2020) 的变分先验对比估计 VPCE，以及基于退火序贯 Monte Carlo 采样器的最新方法 PASOA（Iollo et al., 2024）；我们还与该方法的非退火版本（SMC）以及随机基线比较——随机基线用随机生成的设计仿真观测 $\{\mathbf y_1,\cdots,\mathbf y_K\}$。这些方法的更多细节见附录 F.2。为在信息增益层面比较各方法，我们采用 Foster et al. (2021) 提出、Blau et al. (2022) 使用的序贯先验对比估计（SPCE）与序贯嵌套 Monte Carlo（SNMC）界；这些量使我们能仅依据产生的设计序列比较方法，通过包含总 EIG 的 $[{\rm SPCE},{\rm SNMC}]$ 区间。其表达式见附录 F.1。我们还给出所产生样本与真实参数 $\boldsymbol\theta$ 之间的 $L^2$ Wasserstein 距离。对不提供后验估计或后验质量较差的方法（RL-BOED、VPCE、Random），我们在其设计与观测序列上用退火 SMC 得到的后验样本上计算 Wasserstein 距离；相反，SMC 的 Wasserstein 距离在 SMC 后验样本上计算。6.3 节中评估主要是定性的，因为先前方法不适用，我们也未发现能处理此类生成式设定的既有尝试。

### 6.2 源定位

我们给出一个受 Foster et al. (2021)；Blau et al. (2022) 启发的源定位示例。设定为 $\mathbb R^2$ 中的 $C$ 个源，未知位置 $\boldsymbol\theta=\{\boldsymbol\theta_1,\dots,\boldsymbol\theta_C\}$，挑战在于确定最优测量位置以准确推断源位置。当在位置 $\boldsymbol\xi\in\mathbb R^2$ 测量时，信号强度定义为 $\mu(\boldsymbol\theta,\boldsymbol\xi)=b+\sum_{c=1}^{C}\frac{\alpha_c}{m+\|\boldsymbol\theta_c-\boldsymbol\xi\|_2^2}$，其中 $\alpha_c$、$b$、$m$ 为预定义常数。假定每个源位置服从标准高斯先验 $\boldsymbol\theta_c\sim\mathcal N(\mathbf 0,\mathbf I_2)$，并把似然建模为对数正态：$(\log\mathbf y|\boldsymbol\theta,\boldsymbol\xi)\sim\mathcal N(\log\mu(\boldsymbol\theta,\boldsymbol\xi),\sigma)$，$\sigma$ 为标准差。该实验取 $C=2$、$\alpha_1=\alpha_2=1$、$m=10^{-4}$、$b=10^{-1}$、$\sigma=0.5$，并规划 $K=30$ 次序贯设计优化。按单循环算法 2 的记号，我们考虑算子 $\Sigma_t^{\mathbf Y,\boldsymbol\theta|\mathcal D_{k-1}}(p^{(t)},\boldsymbol\xi_t)$ 与 $\Sigma_t^{\boldsymbol\theta'|\mathcal D_{k-1}}(q^{(t)},\boldsymbol\xi_t,\hat\rho_{t+1})$，它们分别对应批量样本 $\{(\mathbf y_i^{(t)},\boldsymbol\theta_i^{(t)})\}_{i=1:N}$ 与 $\{\boldsymbol\theta_j^{\prime(t)}\}_{j=1:M}$ 的更新（规模 $N=200$、$M=200$），其中 $\hat\rho_{t+1}=\sum_{i=1}^N\nu_i\delta_{\mathbf y_i^{(t+1)}}$，采用 Langevin 扩散。

利用该示例中似然可用这一事实，从中采样很直接，采样算子迭代简化为（$i=1:N$，$j=1:M$）

$$
\boldsymbol\theta_i^{(t+1)}=\boldsymbol\theta_i^{(t)}+\gamma_t\nabla_{\boldsymbol\theta}\log p\left(\boldsymbol\theta_i^{(t)}|\mathcal D_{k-1}\right)+\sqrt{2\gamma_t}\,\mathbf B_{\theta,t},
\qquad
\mathbf y_i^{(t+1)}\sim p\left(\mathbf y|\boldsymbol\theta_i^{(t+1)},\boldsymbol\xi_t\right) \tag{20}
$$
$$
\boldsymbol\theta_j^{\prime(t+1)}=\boldsymbol\theta_j^{\prime(t)}
+\gamma'_t\sum_{i=1}^{N}\nu_i\nabla_{\boldsymbol\theta}\log p\left(\boldsymbol\theta_j^{\prime(t)}|\mathbf y_i^{(t+1)},\boldsymbol\xi_t,\mathcal D_{k-1}\right)
+\sqrt{2\gamma'_t}\,\mathbf B_{\theta',t}. \tag{21}
$$

实践中 Langevin 扩散可能陷入局部极小，使采样过慢、跟不上优化进程。为此我们用 Chen et al. (2024) 提出的扩散 Gibbs（DiGS）MCMC 核增强 Langevin 扩散。DiGS 是一种辅助变量 MCMC 方法，其辅助变量 $\tilde{\mathbf X}$ 是原变量 $\mathbf X$ 的加噪版本；它交替从 $p(\tilde{\mathbf x}|\mathbf x)$（通过高斯卷积引入噪声）与 $p(\mathbf x|\tilde{\mathbf x})$（用基于分数的更新——此处为 Langevin 扩散——把样本去噪回原空间）采样，从而增强混合、帮助跳出局部模态。以共 400 个样本计，每次测量步耗时 2.9 s；该样本量很有参考意义，因为它通常是 6.3 节扩散模型中能负担的样本量。整个实验重复 100 次，每次源位置随机。图 3 给出随 $k$ 变化的 SPCE 中位数、加权样本与真实源位置之间的 $L^2$ Wasserstein 距离，以及 SNMC。CoDiff 明显优于所有其他方法，在信息增益与后验估计两方面都有显著改进：它在 SPCE 上相对非短视的 RL-BOED 结果提升 30%，并给出高得多的 SNMC；$L^2$ Wasserstein 距离低两个数量级，说明我们的测量质量更高。

### 6.3 用扩散模型进行图像重建

我们构造一个模拟实验设计任务，以说明本方法能处理与高维参数 $\boldsymbol\theta$ 的逆问题相关的设计参数。考虑仅从图像像素的部分观测恢复隐藏图像的任务：待恢复图像记为 $\boldsymbol\theta$；一次实验对应选取一个像素 $\boldsymbol\xi$，以它为中心放置观测掩码，使该处图像可见；于是测得的观测 $\mathbf y$ 是 $\boldsymbol\theta$ 的掩码版本。似然来自模型 $\mathbf Y=\mathbf A_{\boldsymbol\xi}\boldsymbol\theta+\boldsymbol\eta$，其中 $\mathbf A_{\boldsymbol\xi}$ 是以 $\boldsymbol\xi$ 为中心的方形掩码，$\boldsymbol\eta$ 为高斯变量。图像先验采用为生成 MNIST 数据集（LeCun et al., 1998）训练的扩散模型。目标是为 $7\times7$ 掩码序贯选取最佳中心像素位置，从而以最少的实验次数重建整幅 $28\times28$ MNIST 图像；掩码越小，最优选取掩码中心越有意义。使用算法 2 与附录 F.2.2 规定的基于扩散的采样算子。优化掩码放置带来的增益见图 1 与附录图 9；表 1 以结构相似性指标（SSIM）（Wang et al., 2004）度量的重建质量给出定量确认（细节见附录 F.2.2）。渐进重建过程见图 4、图 7 与图 8：待恢复数字在第 1 列；相继选出的掩码（红色线框）在第 2 列，并给出逐步显露出的图像部分；重建本身可由最后 16 列的后验样本估计，每次实验上行给出 16 幅最可能的重建图像，下行给出 16 幅较不可能的重建图像。随实验次数增加，后验样本逐渐集中到正确数字上。

**图 3：** 源定位。100 次 rollout 上 SPCE、$L^2$ Wasserstein 距离（对数刻度）与 SNMC 随实验次数 $k$ 的中位数与标准误。样本数 $N+M=400$。

**图 4：** 图像重建。前 6 次实验（行）：图像真值、第 $k$ 次实验的测量、来自当前先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 的样本（上行权重最高、下行权重最低）。随流程推进，样本逐步纳入历史测量信息。每个设计步约耗时 7.3 s。

**表 1：** CoDiff 与随机设计的重建质量对比（SSIM，取值于 $[-1,1]$，越高越好）。

| 度量（Measure） | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| CoDiff | .227 | .338 | .528 | .673 | .789 | .826 |
| Random | .168 | .275 | .350 | .391 | .421 | .463 |

## 7 结论

我们提出了梯度式 BOED 的新方法 CoDiff，它支持非常高效的实现。在传统基于密度的设定中，与最先进方法相比，它以更高的精度与更低的计算代价展示了性能。此外，我们的方法还能处理基于数据的采样——据我们所知，这是 BOED 向基于扩散的生成模型的首次扩展。通过把极为成功的扩散模型框架集成进采样算子，我们得以在扩散过程进行的同时优化设计参数 $\boldsymbol\xi$，并在一个涉及高维图像参数的全新 BOED 应用中加以展示。本方法的基础在于新的 EIG 梯度估计器、双层优化、条件扩散模型及其在逆问题中的应用。得益于这一进展，特定逆问题任务有多少训练好的扩散模型，就可能有多少新的 BOED 应用。当前局限包括：CoDiff 仍是贪心方法；需要似然的显式表达式；用扩散处理逆问题时目前只支持线性前向模型。不过非线性设定是活跃的研究方向，该领域的进展可直接用于我们的框架。通过考虑没有似然显式表达式的设定，并研究基于仿真的推断（如 Ivanova et al., 2021；Kleinegesse and Gutmann, 2021；Kleinegesse et al., 2020 所发展的方法），本方法的适用性也可被扩展。此外，尽管我们在基于密度的 BOED 中已表明贪心方法可优于有远见的强化学习流程，在基于数据的设定中研究向非短视方法的扩展（如 Iqbal et al., 2024）将是值得关注的。

## 致谢

作者感谢审稿人与领域主席提出有趣而有用的意见，并感谢 Inria Challenge 项目 ROAD-AI 的部分资助。本工作使用了 GENCI-IDRIS 的 HPC/AI 资源（Grant 2023-AD011014217R1）。Pierre Alliez 得到法国政府通过 3IA Côte d'Azur“Investments in the Future”项目（由国家科研署 ANR-19-P3IA-0002 管理）的支持。

## 参考文献（英文原条目，按原文顺序）

[1] Aali, A., Arvinte, M., Kumar, S., and Tamir, J. I. (2023). Solving inverse problems with score-based generative priors learned from noisy data. In *2023 57th Asilomar Conference on Signals, Systems, and Computers*, pages 837–843. IEEE.
[2] Alquier, P. (2024). User-friendly Introduction to PAC-Bayes Bounds. *Foundations and Trends in Machine Learning*, 17(2):174–303.
[3] Amari, S.-i. (2007). Integration of Stochastic Models by Minimizing α-Divergence. *Neural Computation*, 19(10):2780–2796.
[4] Amzal, B., Bois, F., Parent, E., and Robert, C. P. (2006). Bayesian-Optimal Design via Interacting Particle Systems. *Journal of the American Statistical Association*, 101(474):773–785.
[5] Anderson, B. D. (1982). Reverse-time diffusion equation models. *Stochastic Processes and their Applications*, 12(3):313–326.
[6] Ao, Z. and Li, J. (2024). On Estimating the Gradient of the Expected Information Gain in Bayesian Experimental Design. In *Proceedings of the AAAI Conference on Artificial Intelligence*, volume 38, pages 20311–20319.
[7] Babuschkin, I., Baumli, K., Bell, A., Bhupatiraju, S., Bruce, J., Buchlovsky, P., Budden, D., Cai, T., Clark, A., Danihelka, I., Dedieu, A., Fantacci, C., Godwin, J., Jones, C., Hemsley, R., Hennigan, T., Hessel, M., Hou, S., Kapturowski, S., Keck, T., Kemaev, I., King, M., Kunesch, M., Martens, L., Merzic, H., Mikulik, V., Norman, T., Papamakarios, G., Quan, J., Ring, R., Ruiz, F., Sanchez, A., Schneider, R., Sezener, E., Spencer, S., Srinivasan, S., Stokowiec, W., Wang, L., Zhou, G., and Viola, F. (2020). The DeepMind JAX Ecosystem.
[8] Blau, T., Bonilla, E. V., Chades, I., and Dezfouli, A. (2022). Optimizing sequential experimental design with deep reinforcement learning. In *Proceedings of the 39th International Conference on Machine Learning (ICML)*, volume 162, pages 2107–2128. PMLR.
[9] Bradbury, J., Frostig, R., Hawkins, P., Johnson, M. J., Leary, C., Maclaurin, D., Necula, G., Paszke, A., VanderPlas, J., Wanderman-Milne, S., and Zhang, Q. (2020). JAX: composable transformations of Python+NumPy programs.
[10] Cardoso, G., el idrissi, Y. J., Corff, S. L., and Moulines, E. (2024). Monte Carlo guided Denoising Diffusion models for Bayesian linear inverse problems. In *The Twelfth International Conference on Learning Representations (ICLR)*.
[11] Carvalho, L., Villela, D., Coelho, F., and Bastos, L. (2022). Bayesian Inference for the Weights in Logarithmic Pooling. *Bayesian Analysis*, 1(1):1–29.
[12] Chaloner, K. and Verdinelli, I. (1995). Bayesian experimental design: A review. *Statistical Science*, 10(3):273–304.
[13] Chatterjee, S. and Diaconis, P. (2018). The sample size required in importance sampling. *The Annals of Applied Probability*, 28(2):1099–1135.
[14] Chen, W., Zhang, M., Paige, B., Hernández-Lobato, J. M., and Barber, D. (2024). Diffusive Gibbs sampling. In *Proceedings of the 41st International Conference on Machine Learning (ICML)*, volume 235, pages 7731–7747. PMLR.
[15] Corenflos, A., Zhao, Z., Särkkä, S., Sjölund, J., and Schön, T. B. (2025). Conditioning diffusion models by explicit forward-backward bridging. In *The 28th International conference on Artificial Intelligence and Statistics (AISTATS)*.
[16] Dagréou, M., Ablin, P., Vaiter, S., and Moreau, T. (2022). A framework for bilevel optimization that enables stochastic and global variance reduction algorithms. In *Advances in Neural Information Processing Systems*.
[17] Daras, G., Chung, H., Lai, C.-H., Mitsufuji, Y., Milanfar, P., Dimakis, A. G., Ye, C., and Delbracio, M. (2024). A survey on diffusion models for inverse problems. https://giannisdaras.github.io/publications/diffusion_survey.pdf.
[18] Demidovich, Y., Malinovsky, G., Sokolov, I., and Richtárik, P. (2023). A Guide Through the Zoo of Biased SGD. In *Thirty-seventh Conference on Neural Information Processing Systems*.
[19] Dhariwal, P. and Nichol, A. (2021). Diffusion models beat GANx on image synthesis. *Advances in neural information processing systems*, 34:8780–8794.
[20] Donsker, M. and Varadhan, S. (1976). Asymptotic evaluation of certain Markov process expectations for large time—III. *Communications on Pure and Applied Mathematics*, 29(4):389–461.
[21] Dou, Z. and Song, Y. (2024). Diffusion posterior sampling for linear inverse problem solving: A filtering perspective. In *The Twelfth International Conference on Learning Representations (ICLR)*.
[22] Drovandi, C. C., McGree, J., and Pettitt, A. N. (2013). Sequential Monte Carlo for Bayesian sequentially designed experiments for discrete data. *Computational Statistics & Data Analysis*, 57(1):320–335.
[23] Efron, B. (2011). Tweedie’s formula and selection bias. *Journal of the American Statistical Association*, 106(496):1602–1614.
[24] Foster, A., Ivanova, D. R., Malik, I., and Rainforth, T. (2021). Deep Adaptive Design: Amortizing Sequential Bayesian Experimental Design. In *Proceedings of the 38th International Conference on Machine Learning (ICML)*, volume 161, pages 3384–3395. PMLR.
[25] Foster, A., Jankowiak, M., Bingham, E., Horsfall, P., Teh, Y. W., Rainforth, T., and Goodman, N. (2019). Variational Bayesian Optimal Experimental Design. In *Advances in Neural Information Processing Systems*, pages 14059–14070.
[26] Foster, A., Jankowiak, M., O’Meara, M., Teh, Y. W., and Rainforth, T. (2020). A Unified Stochastic Gradient Approach to Designing Bayesian-Optimal Experiments. In *Proceedings of the 23rd International Conference in Artificial Intelligence and Statistics*, volume 108, pages 2959–2969.
[27] Goda, T., Hironaka, T., Kitade, W., and Foster, A. (2022). Unbiased MLMC Stochastic Gradient-Based Optimization of Bayesian Experimental Designs. *SIAM Journal on Scientific Computing*, 44(1):A286–A311.
[28] Gumbel, E. (1961). Bivariate logistic distribution. *Journal of American Statistical Association*, pages 335–349.
[29] Gutmann, M. and Hyvärinen, A. (2010). Noise-contrastive estimation: A new estimation principle for unnormalized statistical models. In *Proceedings of the thirteenth international conference on artificial intelligence and statistics*, pages 297–304. JMLR Workshop and Conference Proceedings.
[30] Hoffman, M. D. and Gelman, A. (2014). The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo. *Journal of Machine Learning Research*, 15(47):1593–1623.
[31] Hong, M., Wai, H., Wang, Z., and Yang, Z. (2023). A two-timescale stochastic algorithm framework for bilevel optimization: Complexity analysis and application to actor-critic. *SIAM Journal on Optimization*, 33:147–180.
[32] Huan, X., Jagalur, J., and Marzouk, Y. (2024). Optimal experimental design: Formulations and computations. *Acta Numerica*, 33:715–840.
[33] Hyvärinen, A. (2005). Estimation of Non-Normalized Statistical Models by Score Matching. *Journal of Machine Learning Research*, 6(24):695–709.
[34] Iollo, J., Heinkelé, C., Alliez, P., and Forbes, F. (2024). PASOA-PArticle baSed Bayesian Optimal Adaptive design. In *Proceedings of the 41st International Conference on Machine Learning (ICML)*, volume 235, pages 21020–21046. PMLR.
[35] Iqbal, S., Corenflos, A., Särkkä, S., and Abdulsamad, H. (2024). Nesting particle filters for experimental design in dynamical systems. In *Proceedings of the 41st International Conference on Machine Learning (ICML)*, volume 235. PMLR.
[36] Ivanova, D. R., Foster, A., Kleinegesse, S., Gutmann, M. U., and Rainforth, T. (2021). Implicit deep adaptive design: Policy-based experimental design without likelihoods. *Advances in neural information processing systems*, 34:25785–25798.
[37] Ivanova, D. R., Hedman, M., Guan, C., and Rainforth, T. (2024). Step-DAD: Semi-Amortized Policy-Based Bayesian Experimental Design. *ICLR 2024 Workshop on Data-centric Machine Learning Research (DMLR)*.
[38] Kingma, D. and Ba, J. (2015). Adam: A method for stochastic optimization. In *International Conference on Learning Representations (ICLR)*, San Diega, CA, USA.
[39] Kleinegesse, S., Drovandi, C., and Gutmann, M. U. (2020). Sequential Bayesian Experimental Design for Implicit Models via Mutual Information. *Bayesian Analysis*, 16:773–802.
[40] Kleinegesse, S. and Gutmann, M. U. (2021). Gradient-based Bayesian Experimental Design for Implicit Models using Mutual Information Lower Bounds. *ArXiv*, abs/2105.04379.
[41] Knoblauch, J., Jewson, J., and Damoulas, T. (2022). An Optimization-Centric View on Bayes’ Rule: Reviewing and Generalizing Variational Inference. *Journal of Machine Learning Research*, 23(1).
[42] Korba, A. and Salim, A. (2022). Sampling as first-order optimization over a space of probability measures. Tutorial at the 39th International Conference on Machine Learning (ICML).
[43] Kullback, S. (1959). *Information Theory and Statistics*. Wiley.
[44] LeCun, Y., Bottou, L., Bengio, Y., and Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE*, 86(11):2278–2324.
[45] Liu, Y. and Tajbakhsh, S. D. (2024). Stochastic Optimization Algorithms for Problems with Controllable Biased Oracles. https://arxiv.org/abs/2306.07810.
[46] Malik, H. J. and Abraham, B. (1973). Multivariate logistic distributions. *Annals of Statistics*, 3:588–590.
[47] Marion, P., Korba, A., Bartlett, P., Blondel, M., Bortoli, V. D., Doucet, A., Llinares-López, F., Paquette, C., and Berthet, Q. (2025). Implicit diffusion: Efficient optimization through stochastic sampling. In *The 28th International conference on Artificial Intelligence and Statistics (AISTATS)*.
[48] Minka, T. (2005). Divergence measures and message passing. Technical report, Research, Microsoft.
[49] Papamakarios, G., Nalisnick, E., Rezende, D. J., Mohamed, S., and Lakshminarayanan, B. (2021). Normalizing flows for probabilistic modeling and inference. *Journal of Machine Learning Research*, 22(1).
[50] Quan, W., Chen, J., Liu, Y., Yan, D.-M., and Wonka, P. (2024). Deep learning-based image and video inpainting: A survey. *International Journal of Computer Vision*, 132(7):2367–2400.
[51] Rainforth, T., Cornish, R., Yang, H., Warrington, A., and Wood, F. (2018). On nesting Monte Carlo estimators. In *International Conference on Machine Learning (ICML)*, pages 4267–4276. PMLR.
[52] Rainforth, T., Foster, A., Ivanova, D. R., and Bickford Smith, F. (2024). Modern Bayesian Experimental Design. *Statistical Science*, 39(1):100–114.
[53] Rhee, C.-h. and Glynn, P. W. (2015). Unbiased estimation with square root convergence for SDE models. *Operations Research*, 63(5):1026–1043.
[54] Roberts, G. O. and Tweedie, R. L. (1996). Exponential convergence of Langevin distributions and their discrete approximations. *Bernoulli*, 2(4):341–363.
[55] Sebastiani, P. and Wynn, H. P. (2000). Maximum entropy sampling and optimal Bayesian experimental design. *Journal of the Royal Statistical Society: Series B (Statistical Methodology)*.
[56] Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., and Poole, B. (2021). Score-based generative modeling through stochastic differential equations. In *The Ninth International Conference on Learning Representations (ICLR)*.
[57] Wang, Z., Bovik, A. C., Sheikh, H. R., and Simoncelli, E. P. (2004). Image Quality Assessment: From Error Visibility to Structural Similarity. *IEEE Transactions on Image Processing*, 13(4):600–612.
[58] Xu, M., Quiroz, M., Kohn, R., and Sisson, S. A. (2019). Variance reduction properties of the reparameterization trick. In *The 22nd international conference on artificial intelligence and statistics*, pages 2711–2720. PMLR.
[59] Yang, J., Ji, K., and Liang, Y. (2021). Provably Faster Algorithms for Bilevel Optimization. In *Advances in Neural Information Processing Systems*.
[60] Yang, K. K., Wu, Z., and Arnold, F. H. (2019). Machine-learning-guided directed evolution for protein engineering. *Nature methods*, 16(8):687–694.

## 补充材料

### A EIG 梯度的两种表达式

下面两种方法（Goda et al., 2022 与 Ao and Li, 2024）都从用重参数化技巧导出的 EIG 梯度表达式出发。利用变量替换 $\mathbf Y=T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)$，可导出 EIG 梯度如下：

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\mathbb E_{p_U(\mathbf u)p(\boldsymbol\theta)}\left[\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta;\boldsymbol\xi)\right]
-\mathbb E_{p_U(\mathbf u)p(\boldsymbol\theta)}\left[\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)\right]. \tag{22}
$$

(22) 的第一项只涉及已知似然，一般不成问题。对第二项可用

$$
\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)
=\frac{\nabla_{\boldsymbol\xi}p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)}{p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)}, \tag{23}
$$

其中 $p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)=\mathbb E_{p(\boldsymbol\theta')}[p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)]$，且

$$
\nabla_{\boldsymbol\xi}p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)
=\nabla_{\boldsymbol\xi}\mathbb E_{p(\boldsymbol\theta')}\left[p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)\right]
=\mathbb E_{p(\boldsymbol\theta')}\left[\nabla_{\boldsymbol\xi}p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)\right] \tag{24}
$$
$$
=\mathbb E_{p(\boldsymbol\theta')}\left[p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)\right]. \tag{25}
$$

随后，视用 (24) 还是 (25)，可导出两种 EIG 梯度表达式。用 (24) 与 $p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)=\mathbb E_{p(\boldsymbol\theta')}[p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)]$ 得

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\mathbb E_{p_U(\mathbf u)p(\boldsymbol\theta)}\left[
\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta;\boldsymbol\xi)
-\frac{\mathbb E_{p(\boldsymbol\theta')}\left[\nabla_{\boldsymbol\xi}p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)\right]}
{\mathbb E_{p(\boldsymbol\theta')}\left[p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)\right]}
\right]
=\mathbb E_{p_{\boldsymbol\xi}}\left[
g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta)
-\frac{\mathbb E_{p(\boldsymbol\theta')}\left[h(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta')\right]}
{\mathbb E_{p(\boldsymbol\theta')}\left[p(\mathbf Y|\boldsymbol\theta',\boldsymbol\xi)\right]}
\right], \tag{26}
$$

其中 $g(\boldsymbol\xi,\mathbf y,\boldsymbol\theta,\boldsymbol\theta')=\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf u)|\boldsymbol\theta',\boldsymbol\xi)|_{\mathbf u=T^{-1}_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf y)}$，$h(\boldsymbol\xi,\mathbf y,\boldsymbol\theta,\boldsymbol\theta')=\nabla_{\boldsymbol\xi}p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf u)|\boldsymbol\theta',\boldsymbol\xi)|_{\mathbf u=T^{-1}_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf y)}$。在第二项中引入额外的重要性分布 $q(\boldsymbol\theta'|\mathbf y,\boldsymbol\theta,\boldsymbol\xi)$，即得 Goda et al. (2022) 所用的表达式

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\mathbb E_{p_{\boldsymbol\xi}}\left[
g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta)
-\frac{\mathbb E_{q(\boldsymbol\theta'|\mathbf Y,\boldsymbol\theta,\boldsymbol\xi)}\left[\frac{p(\boldsymbol\theta')}{q(\boldsymbol\theta'|\mathbf Y,\boldsymbol\theta,\boldsymbol\xi)}h(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta')\right]}
{\mathbb E_{q(\boldsymbol\theta'|\mathbf Y,\boldsymbol\theta,\boldsymbol\xi)}\left[\frac{p(\boldsymbol\theta')}{q(\boldsymbol\theta'|\mathbf Y,\boldsymbol\theta,\boldsymbol\xi)}p(\mathbf Y|\boldsymbol\theta',\boldsymbol\xi)\right]}
\right], \tag{27}
$$

并可导出估计器

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)\approx\frac1N\sum_{i=1}^{N}\left[
g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta_i)
-\frac{\frac1M\sum_{j=1}^{M}\frac{p(\boldsymbol\theta'_{i,j})}{q(\boldsymbol\theta'_{i,j}|\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\xi)}h(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta'_{i,j})}
{\frac1M\sum_{j=1}^{M}\frac{p(\boldsymbol\theta'_{i,j})}{q(\boldsymbol\theta'_{i,j}|\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\xi)}p(\mathbf y_i|\boldsymbol\theta'_{i,j},\boldsymbol\xi)}
\right], \tag{28}
$$

其中 $\{(\mathbf y_i,\boldsymbol\theta_i)\}_{i=1:N}$ 由联合分布 $p_{\boldsymbol\xi}$ 仿真，且对每个 $i=1:N$，$\{\boldsymbol\theta'_{i,j}\}_{j=1:M}$ 为 $q(\cdot|\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\xi)$ 的样本。Goda et al. (2022) 用 (28) 时取 $N=1$。即便采样完美，该估计器因第二项的分式而非无偏，但可按 Rhee and Glynn (2015) 去偏；Rhee and Glynn (2015) 的随机化 MLMC 流程是一种事后通用流程，可更一般地用于对一串可能的有偏估计器去偏（只要这些估计器一致）。

或者，把 (25) 代入 (23)，可得另一 EIG 梯度表达式。将 (25) 代入 (23) 得

$$
\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)
=\mathbb E_{p(\boldsymbol\theta')}\left[\frac{p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)}{p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\xi)}\right]
=\mathbb E_{p(\boldsymbol\theta'|T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U),\boldsymbol\xi)}\left[\nabla_{\boldsymbol\xi}\log p(T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)|\boldsymbol\theta',\boldsymbol\xi)\right],
$$

结合上面 $g$ 的定义，得

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)=\mathbb E_{p_{\boldsymbol\xi}}\left[
g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta)
-\mathbb E_{p(\boldsymbol\theta'|\mathbf Y,\boldsymbol\xi)}\left[g(\boldsymbol\xi,\mathbf Y,\boldsymbol\theta,\boldsymbol\theta')\right]
\right]. \tag{29}
$$

该替代表达式 (29) 是 Ao and Li (2024) 的出发点，随后他们使用估计器

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)\approx\frac1N\sum_{i=1}^{N}\left[
g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta_i)
-\mathbb E_{q(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi)}\left[g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta')\right]
\right],
$$

其中 $\{(\mathbf y_i,\boldsymbol\theta_i)\}_{i=1:N}$ 如前为联合分布 $p_{\boldsymbol\xi}$ 的样本，且对每个 $\mathbf y_i$，$q(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi)$ 是不可处理后验 $p(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi)$ 的可处理近似。具体地，Ao and Li (2024) 用 MCMC 过程取样本 $\{\boldsymbol\theta'_{i,j}\}_{j=1:M}$，并令 $q(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi)=\frac1M\sum_{j=1}^{M}\delta_{\boldsymbol\theta'_{i,j}}$，从而得到如下嵌套 Monte Carlo 估计器：

$$
\nabla_{\boldsymbol\xi}I(\boldsymbol\xi)\approx\frac1N\sum_{i=1}^{N}\left[
g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta_i)
-\frac1M\sum_{j=1}^{M}g(\boldsymbol\xi,\mathbf y_i,\boldsymbol\theta_i,\boldsymbol\theta_{i,j})
\right]. \tag{30}
$$

### B 对数池化作为良好的重要性采样提议

考虑用提议分布 $q$ 与目标分布 $p$ 做重要性采样时，Chatterjee and Diaconis (2018) 证明：在一定条件下，重要性采样与自归一化重要性采样（SNIS）估计器要以高概率取得小的 $L_1$ 误差，所需仿真抽样次数大致为 $\exp({\rm KL}(p,q))$（SNIS 见 Chatterjee and Diaconis (2018) 定理 1.2）。类似地，选择使重要性采样估计器方差最小的提议分布，等价于寻找与 $p$ 的 $\chi^2$ 距离小的分布，见 Minka (2005) 附录 E。更一般地，寻找良好提议 $q$ 与最小化 $p$ 与 $q$ 之间的 $\alpha$-散度或 $f$-散度相关，这些散度关于 $p,q$ 联合凸（Minka, 2005）。本文以 ${\rm KL}(q,p)$ 作为 $p$ 与 $q$ 接近程度的度量；该选择归根结底是任意的，但优点是能导出一个可解释、且具有有趣采样性质的提议。为论证 (9) 中的池化后验 $q_{\boldsymbol\xi,N}$ 及其在 (10) 中的使用，我们借助下文引理 2 表明：对 $\sum_{i=1}^N\nu_i=1$，使对各后验 $p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi)$ 的加权 KL 和 $\sum_{i=1}^N\nu_i{\rm KL}(q,p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi))$ 最小的分布 $q^*$ 为

$$
q^*(\boldsymbol\theta)\propto p(\boldsymbol\theta)\prod_{i=1}^{N}p(\mathbf y_i|\boldsymbol\theta,\boldsymbol\xi)^{\nu_i} \tag{31}
$$
$$
\propto\prod_{i=1}^{N}p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi)^{\nu_i}, \tag{32}
$$

即各后验分布 $p(\boldsymbol\theta|\mathbf y_i,\boldsymbol\xi)$ 的**对数池化**（或几何混合）。引理 2 来自 Alquier (2024) 提及的一个引理（其引理 2.2）的应用，该引理在下面作为引理 1 回顾。引理 1 在参数空间 $\Theta$ 有限的情形下自 Kullback（Kullback, 1959）起就已知，一般情形归功于 Donsker and Varadhan (1976)。回忆 $\mathcal P(\Theta)$ 表示 $\Theta$ 上概率测度集合，$p$ 为 $\mathcal P(\Theta)$ 中给定概率测度。

**引理 1（Donsker–Varadhan 变分公式）.** 对任意可测有界函数 $f:\Theta\to\mathbb R$，关于 $q\in\mathcal P(\Theta)$ 的上确界

$$
\sup_{q\in\mathcal P(\Theta)}\left\{\mathbb E_q\left[f(\boldsymbol\theta)\right]-{\rm KL}(q,p)\right\}
$$

由如下 Gibbs 测度 $p_f$ 取得，其关于 $p$ 的密度为 $\frac{dp_f}{dp}=\frac{\exp(f(\boldsymbol\theta))}{\mathbb E_p[\exp(f(\boldsymbol\theta))]}$。

如下引理 2 是引理 1 的应用。

**引理 2.** 对给定概率测度 $p\in\mathcal P(\Theta)$ 与 $\mathcal Y$ 上的测度 $\rho$（不必为概率测度），对任意概率测度 $q\in\mathcal P(\Theta)$ 定义

$$
\ell(q)=\mathbb E_q\left[\mathbb E_{Y\sim\rho}\left[\log p(Y|\boldsymbol\theta)\right]\right]-{\rm KL}(q,p). \tag{33}
$$

由 Donsker–Varadhan 变分公式（引理 1）可知，$\ell(q)$ 关于 $q$ 的上确界由 Gibbs 测度 $q^*$ 取得，其关于 $p$ 的密度满足 $q^*(\boldsymbol\theta)\propto p(\boldsymbol\theta)\exp(\mathbb E_{Y\sim\rho}[\log p(Y|\boldsymbol\theta)])$。此外，最大化 $\ell$ 等价于最小化 $\mathbb E_{Y\sim\rho}[{\rm KL}(q(\boldsymbol\theta),p(\boldsymbol\theta|Y))]$，即 $q^*$ 是使（关于 $y$ 取平均的）对各 $p(\boldsymbol\theta|\mathbf y)$ 的 KL 最小的测度。

**引理 2 的证明.** $q^*$ 的表达式直接由把引理 1 应用于 $f(\boldsymbol\theta)=\mathbb E_{Y\sim\rho}[\log p(Y|\boldsymbol\theta)]$（假定它作为 $\boldsymbol\theta$ 的函数可测有界，这需在实践中检验）得到。第二部分来自把 $\ell$ 重写为

$$
\ell(q)=\mathbb E_{Y\sim\rho}\left[\mathbb E_{\boldsymbol\theta\sim q}\left[\log\left(p(Y|\boldsymbol\theta)p(\boldsymbol\theta)\right)-\log q(\boldsymbol\theta)\right]\right]
=-\mathbb E_{Y\sim\rho}\left[{\rm KL}\left(q,p(\boldsymbol\theta|Y)\right)\right]+\mathbb E_{Y\sim\rho}\left[\log p(Y)\right].
$$

**例：** 如前所述，我们的池化后验 $q_{\boldsymbol\xi,N}$ 即把该结果应用于 $\rho=\sum_{i=1}^N\nu_i\delta_{\mathbf y_i}$（$\sum_{i=1}^N\nu_i=1$）。当 $\sum_{i=1}^N\nu_i=1$ 时，该结果也可由 Amari (2007) 更一般的结果（对任意 $\alpha$-散度陈述，见其定理 2 取 $\alpha=1$）得到；连续权重版本也在 Amari (2007) 中提及（定理 4，证明引其他文献）。我们在此给出 KL（$\alpha=1$）情形的简单证明。

**注 1：** 若 $\rho=\delta_{\mathbf y}$ 或 $\rho=\sum_{i=1}^N\delta_{\mathbf y_i}$，即恢复后验分布的标准变分表述（参见 Knoblauch et al., 2022 表 1）。后验分布 $p(\boldsymbol\theta|\mathbf y_1,\dots,\mathbf y_N)$ 与对数池化（其权重 $\nu_i$ 之和为 1）的区别在于赋予先验的相对权重。该结果对非常一般的 $\ell$（不必表示为期望）也成立。

**注 2：** 关于对数池化，该结果与 Carvalho et al. (2022) 的结果（其注 3.1）类似：在 KL 之和 $\sum_{i=1}^N{\rm KL}(q,p(\boldsymbol\theta|\mathbf y_i))$ 的情形下，最优池化权重相等，即 $\nu_i=\frac1N$。

**注 3：** 池化后验分布也可作为受约束的均值场解得到。事实上容易证明 $q^*$ 也是使联合分布与某乘积形式近似（其一个因子固定为 $\rho(\mathbf y)$）之间的 KL 最小的测度：$q^*=\arg\min_{q\in\mathcal P(\Theta)}{\rm KL}(q(\boldsymbol\theta)\rho(\mathbf y),p(\boldsymbol\theta,\mathbf Y))$。

### C 基于扩散的生成模型

#### C.1 去噪扩散模型

给定仅通过一组 $\boldsymbol\theta$ 样本可得的分布 $p_0\in\mathcal P(\Theta)$，扩散模型基于向可得样本加噪，使得能学习“去噪”的反向过程。该学习到的过程随后可用于生成新样本：从随机噪声样本一直去噪回原始数据分布。作为合适的加噪过程，我们的实验采用 Dhariwal and Nichol (2021) 的方差保持 SDE：

$$
d\tilde{\boldsymbol\theta}^{(t)}=-\frac{\beta(t)}{2}\tilde{\boldsymbol\theta}^{(t)}dt+\sqrt{\beta(t)}d\tilde{\mathbf B}_t, \tag{34}
$$

其中 $\beta(t)>0$ 为线性噪声调度，控制时刻 $t$ 加入的噪声量。求解 SDE (34) 得

$$
\left(\tilde{\boldsymbol\theta}^{(t)}|\tilde{\boldsymbol\theta}^{(0)}\right)\sim\mathcal N\left(
\tilde{\boldsymbol\theta}^{(0)}\exp\left(-\frac12\int_0^t\beta(s)ds\right),
\left(1-\exp\left(-\int_0^t\beta(s)ds\right)\right)\mathbf I\right), \tag{35}
$$

可写成

$$
\tilde{\boldsymbol\theta}^{(t)}=\sqrt{\bar\alpha_t}\,\tilde{\boldsymbol\theta}^{(0)}+\sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon,
\qquad
\bar\alpha_t=\exp\left(-\int_0^t\beta(s)ds\right), \tag{36}
$$

其中 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$ 为标准高斯随机变量。经足够大时间 $T$ 后，$p_0$ 的样本被近似变换为标准高斯分布的样本。

反向去噪过程随后可写成扩散过程 (34) 的反向，如 Anderson (1982) 所述：

$$
d\boldsymbol\theta(t)=\left[-\frac{\beta(t)}{2}\boldsymbol\theta(t)-\beta(t)\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta(t))\right]dt+\sqrt{\beta(t)}d\mathbf B_t, \tag{37}
$$

其中 $t$ 从无穷大反向流向 $t=0$，$p_t$ 为 (34) 中 $\tilde{\boldsymbol\theta}^{(t)}$ 的分布。实践中该过程从某个较大有限 $T$ 开始，假定 $\boldsymbol\theta(T)\sim\mathcal N(\mathbf 0,\mathbf I)$。本附录中我们改为让时间 $t$ 从 0 增到 $T$，利用 (37) 可等价地写为

$$
d\boldsymbol\theta(t)=\left[\frac{\beta(T-t)}{2}\boldsymbol\theta(t)+\beta(T-t)\nabla_{\boldsymbol\theta}\log p_{T-t}(\boldsymbol\theta(t))\right]dt+\sqrt{\beta(T-t)}d\mathbf B_t, \tag{38}
$$

此时以 $\boldsymbol\theta(0)\sim\mathcal N(\mathbf 0,\mathbf I)$ 初始化。求解该反向 SDE，$T$ 较大时 $\boldsymbol\theta(T)$ 的分布接近 $p_0$，从而可近似从 $p_0$ 采样。

加噪数据分布在时刻 $t$ 的分数函数 $\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta)$ 不可处理，故用参数 $\phi$ 的神经网络 $s_\phi(\boldsymbol\theta,t)$ 估计。分数匹配（Hyvärinen, 2005）通过最小化如下损失训练 $s_\phi$：

$$
\mathbb E_{p_t(\boldsymbol\theta)}\left[\left\|s_\phi(\boldsymbol\theta,t)-\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta)\right\|^2\right]. \tag{39}
$$

由于 $p_t(\boldsymbol\theta)$ 仍未知、只能得到 (35) 中 $p_t(\boldsymbol\theta|\tilde{\boldsymbol\theta}^{(0)})$ 的样本，Song et al. (2021) 把该损失改写为

$$
\mathbb E_{t\sim\mathcal U[0,T]}\mathbb E_{p_0(\boldsymbol\theta^{(0)})}\mathbb E_{p_t(\boldsymbol\theta|\boldsymbol\theta^{(0)})}\left[
\lambda(t)\left\|s_\phi(\boldsymbol\theta,t)-\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta|\boldsymbol\theta^{(0)})\right\|^2
\right], \tag{40}
$$

其中 $\lambda(t)>0$ 为权重函数，可让训练更关注某些时间步；通常取 $\lambda(t)$ 与 (35) 在时刻 $t$ 的方差成反比。

一旦通过最小化 (40) 训练好神经网络 $s_\phi$，即可对反向 SDE (38) 运行数值格式，生成近似服从目标分布 $p_0$ 的新样本。例如对 (38) 运行 Euler–Maruyama 格式，得到反向过程的如下更新步：

$$
\boldsymbol\theta^{(t+\Delta t)}=\boldsymbol\theta^{(t)}+\frac{\beta(T-t)}{2}\boldsymbol\theta^{(t)}\Delta t
+\beta(T-t)s_\phi\left(\boldsymbol\theta^{(t)},T-t\right)\Delta t
+\sqrt{\beta(T-t)\Delta t}\,\boldsymbol\epsilon. \tag{41}
$$

于是用足够小的 $\Delta t$ 运行反向过程 (41)，即可近似从 $p_0$ 生成样本。

#### C.2 条件扩散模型

当给定某测量 $\mathbf y$、希望从某条件分布 $p_0(\boldsymbol\theta|\mathbf y)$ 产生样本时，就出现条件扩散模型；从条件分布采样是逆问题中出现的问题。使用扩散模型时已有大量解决方案（见 Daras et al., 2024 的近期综述）。本节说明我们应用中所采用的方法。着眼于实验设计的应用，此处假定

$$
\mathbf Y=\mathbf A_{\boldsymbol\xi}\boldsymbol\theta+\boldsymbol\eta, \tag{42}
$$

其中 $\boldsymbol\eta\sim\mathcal N(\mathbf 0,\sigma^2\mathbf I)$ 为测量噪声，$\mathbf A_{\boldsymbol\xi}$ 为表示在 $\boldsymbol\xi$ 处实验的算子。

从条件分布 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)$ 采样，可对如下条件 SDE 运行反向扩散过程：

$$
d\boldsymbol\theta(t)=\left[\frac{\beta(T-t)}{2}\boldsymbol\theta(t)+\beta(T-t)\nabla_{\boldsymbol\theta}\log p_{T-t}(\boldsymbol\theta(t)|\mathbf y,\boldsymbol\xi)\right]dt+\sqrt{\beta(T-t)}d\mathbf B_t, \tag{43}
$$

即把通常的分数 $\nabla_{\boldsymbol\theta}\log p_{T-t}(\boldsymbol\theta(t))$ 换为条件分数 $\nabla_{\boldsymbol\theta}\log p_{T-t}(\boldsymbol\theta(t)|\mathbf y,\boldsymbol\xi)$。条件 SDE 的主要目标是无需为新条件分数重新训练新网络 $s_\phi$ 即可从 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)$ 生成样本。用前向过程表述，条件分数可写成

$$
\nabla_{\tilde{\boldsymbol\theta}}\log p_t\left(\tilde{\boldsymbol\theta}^{(t)}|\mathbf y,\boldsymbol\xi\right)
=\nabla_{\tilde{\boldsymbol\theta}}\log p_t\left(\mathbf y|\tilde{\boldsymbol\theta}^{(t)},\boldsymbol\xi\right)
+\nabla_{\tilde{\boldsymbol\theta}}\log p_t\left(\tilde{\boldsymbol\theta}^{(t)}\right), \tag{44}
$$

于是可利用在无条件情形下训练以估计分数 $\nabla_{\tilde{\boldsymbol\theta}}\log p_t(\tilde{\boldsymbol\theta}^{(t)})$ 的预计算网络 $s_\phi$。若我们知道如何计算第一项 $\nabla_{\tilde{\boldsymbol\theta}}\log p_t(\mathbf y|\tilde{\boldsymbol\theta}^{(t)},\boldsymbol\xi)$，就能运行反向过程 (43) 从条件分布 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)$ 生成样本。不幸的是该项没有闭式。作为解决方案，Dou and Song (2024) 提出用可处理的 $\nabla_{\tilde{\boldsymbol\theta}}\log p_t(\mathbf y(t)|\tilde{\boldsymbol\theta}^{(t)},\boldsymbol\xi)$ 近似不可处理的 $\nabla_{\tilde{\boldsymbol\theta}}\log p_t(\mathbf y|\tilde{\boldsymbol\theta}^{(t)},\boldsymbol\xi)$，其中 $\mathbf y(t)$ 为 $\mathbf y$ 在时刻 $t$ 的加噪版本。于是可运行如下反向 SDE 从条件分布 $p(\boldsymbol\theta|\mathbf y,\boldsymbol\xi)$ 生成样本：

$$
d\boldsymbol\theta(t)=\left[\frac{\beta(T-t)}{2}\boldsymbol\theta(t)+\beta(T-t)\nabla_{\boldsymbol\theta}\log p_{T-t}\left(\mathbf y(T-t)|\boldsymbol\theta(t),\boldsymbol\xi\right)
+\beta(T-t)\nabla_{\boldsymbol\theta}\log p_{T-t}(\boldsymbol\theta(t))\right]dt+\sqrt{\beta(T-t)}d\mathbf B_t. \tag{45}
$$

加噪序列 $\mathbf y(t)$ 可用类似 (36) 的加噪过程生成：

$$
\mathbf y(t)=\sqrt{\bar\alpha_t}\,\mathbf y+\sqrt{1-\bar\alpha_t}\,\mathbf A_{\boldsymbol\xi}\boldsymbol\epsilon,
\qquad
\bar\alpha_t=\exp\left(-\int_0^t\beta(s)ds\right), \tag{46}
$$

利用前向模型 (42) 可写成

$$
\mathbf y(t)=\mathbf A_{\boldsymbol\xi}\tilde{\boldsymbol\theta}^{(t)}+\sqrt{\bar\alpha_t}\,\boldsymbol\eta. \tag{47}
$$

于是可计算 $\nabla_{\tilde{\boldsymbol\theta}}\log p_t(\mathbf y(t)|\tilde{\boldsymbol\theta}^{(t)},\boldsymbol\xi)$：

$$
\nabla_{\tilde{\boldsymbol\theta}}\log p_t\left(\mathbf y(t)|\tilde{\boldsymbol\theta}^{(t)},\boldsymbol\xi\right)
=\frac{1}{\sigma^2\bar\alpha_t}\mathbf A_{\boldsymbol\xi}^{\top}\left(\mathbf y(t)-\mathbf A_{\boldsymbol\xi}\tilde{\boldsymbol\theta}^{(t)}\right). \tag{48}
$$

#### C.3 梯度估计

当采样在有限时间范围的扩散模型上进行时，相应采样算子的最初若干迭代可能给出噪声过大的样本，从而导致信息量很小的梯度估计。Marion et al. (2025) 提出的一种解决方案是使用排队技巧，需在内存中存储一个样本队列；内存负担高，仅对少量粒子可接受。我们提出一种更简单的方案：用 Tweedie 公式（Efron, 2011）做一次性反向步，把可能噪声过大的 $\boldsymbol\theta(t)$ 替换为条件均值 $\mathbb E[\tilde{\boldsymbol\theta}^{(0)}|\tilde{\boldsymbol\theta}^{(T-t)}=\boldsymbol\theta(t)]$，这可理解为其在时刻 0 的预测。Tweedie 公式给出该预测的闭式：

$$
\hat{\boldsymbol\theta}^{(t)}=\mathbb E\left[\tilde{\boldsymbol\theta}^{(0)}|\tilde{\boldsymbol\theta}^{(T-t)}=\boldsymbol\theta(t)\right]
=\boldsymbol\theta(t)+\left(1-\bar\alpha_{T-t}\right)\frac{\nabla_{\boldsymbol\theta}\log p_{T-t}\left(\boldsymbol\theta(t)\right)}{\sqrt{\bar\alpha_{T-t}}}. \tag{49}
$$

随后用 $\hat{\boldsymbol\theta}^{(t)}$ 的值计算梯度，而 $\boldsymbol\theta(t)$ 按上述反向 SDE 更新为 $\boldsymbol\theta^{(t+1)}$。这只在小 $t$ 时真正有影响，因为 $t$ 大时 $\hat{\boldsymbol\theta}^{(t)}$ 与 $\boldsymbol\theta^{(t)}$ 会趋于接近。该额外计算不增加代价，因为 (49) 所用分数值在 (45) 中已计算过。

### D 序贯贝叶斯实验设计

在该框架中，实验条件被序贯确定，利用逐步获得的测量。这种序贯视角称为序贯设计或迭代设计。在序贯设定中，假定规划 $K$ 次实验序列。对每次实验，我们希望用已观测数据 $\mathcal D_{k-1}=\{(\mathbf y_1,\boldsymbol\xi_1),\dots,(\mathbf y_{k-1},\boldsymbol\xi_{k-1})\}$ 选出最佳 $\boldsymbol\xi_k$。给定该设计，用 $\boldsymbol\xi_k$ 做实验并得到结果 $\mathbf y_k$；随后把 $\boldsymbol\xi_k$ 与 $\mathbf y_k$ 加入 $\mathcal D_{k-1}$ 得到新集合 $\mathcal D_k=\mathcal D_{k-1}\cup(\mathbf y_k,\boldsymbol\xi_k)$。每步之后，我们对 $\boldsymbol\theta$ 的信念被更新并由当前后验 $p(\boldsymbol\theta|\mathcal D_k)$ 概括，后者在第 $k+1$ 步充当下一步先验。假定观测条件独立，则

$$
p(\boldsymbol\theta|\mathcal D_k)\propto p(\boldsymbol\theta)\prod_{n=1}^{k}p(\mathbf y_n|\boldsymbol\theta,\boldsymbol\xi_n) \tag{50}
$$

且

$$
p(\mathbf y,\boldsymbol\theta|\boldsymbol\xi,\mathcal D_{k-1})\propto p(\boldsymbol\theta)\,p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)\prod_{n=1}^{k-1}p(\mathbf y_n|\boldsymbol\theta,\boldsymbol\xi_n). \tag{51}
$$

贪心设计可视为把每个设计 $\boldsymbol\xi_k$ 当作最后一个来选取，即 $\boldsymbol\xi_k$ 取使下式最大的 $\boldsymbol\xi^*_k$：

$$
\boldsymbol\xi^*_k=\arg\max_{\boldsymbol\xi}I_k(\boldsymbol\xi,\mathcal D_{k-1}),
\qquad
I_k(\boldsymbol\xi,\mathcal D_{k-1})=\mathbb E_{p^k_{\boldsymbol\xi}}\left[\log\frac{p^k_{\boldsymbol\xi}(\boldsymbol\theta,\mathbf Y)}{p(\mathbf Y|\boldsymbol\xi,\mathcal D_{k-1})p(\boldsymbol\theta|\mathcal D_{k-1})}\right]={\rm MI}\left(p^k_{\boldsymbol\xi}\right), \tag{52}
$$

其中 $p^k_{\boldsymbol\xi}$ 表示联合分布 $p(\mathbf y,\boldsymbol\theta|\boldsymbol\xi,\mathcal D_{k-1})=p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)p(\boldsymbol\theta|\mathcal D_{k-1})$。分布 $p^k_{\boldsymbol\xi}$ 涉及当前先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$，后者没有闭式且不易采样。通过定义势 $V_k$，可把 $p^k_{\boldsymbol\xi}$ 写成 Gibbs 分布：$p^k_{\boldsymbol\xi}(\mathbf y,\boldsymbol\theta)\propto\exp(-V_k(\mathbf y,\boldsymbol\theta,\boldsymbol\xi))$，其中

$$
V_k(\mathbf y,\boldsymbol\theta,\boldsymbol\xi)=-\log p(\boldsymbol\theta)-\log p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)-\sum_{n=1}^{k-1}\log p(\mathbf y_n|\boldsymbol\theta,\boldsymbol\xi_n)
=V(\mathbf y,\boldsymbol\theta,\boldsymbol\xi)+\tilde V_k(\boldsymbol\theta),
$$

$V(\mathbf y,\boldsymbol\theta,\boldsymbol\xi)$ 已在第 4 节定义。注意 $p^k_{\boldsymbol\xi}$ 关于 $\boldsymbol\theta$ 的边缘即第 $k-1$ 步后验（亦即当前先验）$p(\boldsymbol\theta|\mathcal D_{k-1})$，关于 $\mathbf y$ 的边缘为 $p(\mathbf y|\boldsymbol\xi,\mathcal D_{k-1})=\mathbb E_{p(\boldsymbol\theta|\mathcal D_{k-1})}[p(\mathbf y|\boldsymbol\theta,\mathcal D_{k-1})]$。一旦算出新 $\boldsymbol\xi_k$ 并完成新观测 $\mathbf y_k$，第 $k$ 步后验即为 $p(\boldsymbol\theta|\mathbf y_k,\boldsymbol\xi_k,\mathcal D_{k-1})$，它是 $p(\mathbf y_k,\boldsymbol\theta|\boldsymbol\xi_k,\mathcal D_{k-1})$ 的条件分布。

### E 序贯 Monte Carlo（SMC）式重采样

处理序贯 BOED 时，SMC 是必不可少的补充。在基于密度的 BOED 中，它已在序贯场景中被利用，并显示出对生成样本质量的实质改进（Iollo et al., 2024）。SMC 在更简单的静态情形也有用，因为它能改进生成的 $\boldsymbol\theta$ 与对比样本 $\boldsymbol\theta'$ 的质量，从而提高梯度估计器 (30) 的精度。重采样步是 SMC 中特别核心的一步，下面先在基于密度的情形回顾。用我们的框架，也可在基于数据的情形导出 SMC 式重采样方案；这在生成模型语境下正成为流行策略（Dou and Song, 2024；Cardoso et al., 2024）。

**基于密度的 BOED。** 在静态基于密度 BOED 中，先验 $p(\boldsymbol\theta)$ 与似然 $p(\mathbf y|\boldsymbol\theta,\boldsymbol\xi)$ 有闭式。在序贯实验语境中，我们希望从当前先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 生成 $N$ 个样本 $\boldsymbol\theta_1,\dots,\boldsymbol\theta_N$，并从池化后验 $q_{\boldsymbol\xi,N}(\boldsymbol\theta')$ 生成 $M$ 个样本 $\boldsymbol\theta'_1,\dots,\boldsymbol\theta'_M$。由于 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 与 $q_{\boldsymbol\xi,N}(\boldsymbol\theta')\propto\prod_{i=1}^N p(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi,\mathcal D_{k-1})^{\nu_i}$ 都可计算到归一化常数，把第 4 节的采样算子扩展到对样本 $\boldsymbol\theta_1,\dots,\boldsymbol\theta_N$ 与 $\boldsymbol\theta'_1,\dots,\boldsymbol\theta'_M$ 加入重采样步很直接，其权重为 $w_i$ 与 $w'_j$：

$$
w_i=\frac{\tilde w_i}{\sum_{i=1}^{N}\tilde w_i},\quad \tilde w_i=\tilde p(\boldsymbol\theta_i);
\qquad
w'_j=\frac{\tilde w'_j}{\sum_{j=1}^{M}\tilde w'_j},\quad \tilde w'_j=\tilde q(\boldsymbol\theta'_j),
$$

其中 $\tilde p$ 与 $\tilde q$ 分别为 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 与 $q_{\boldsymbol\xi,N}(\boldsymbol\theta')$ 的未归一化版本。

**基于数据的 BOED。** 在基于数据的 BOED 设定下，假定可访问一个条件扩散模型，以生成 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 与 $q_{\boldsymbol\xi,N}(\boldsymbol\theta')$ 的样本。可原样使用 Dou and Song (2024) 提出的重采样方案来改进 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 的样本质量，因为它是常规条件分布。该重采样方案基于 FPS 更新：$\boldsymbol\theta_j^{(t)}$ 先按 $p(\boldsymbol\theta^{(t+1)}|\boldsymbol\theta^{(t)},\mathbf y(T-t-1),\boldsymbol\xi,\mathcal D_{k-1})$ 经反向 SDE 移动为 $\boldsymbol\theta_j^{(t+1)}$，该条件分布满足

$$
p\left(\boldsymbol\theta^{(t+1)}|\boldsymbol\theta^{(t)},\mathbf y(T-t-1),\boldsymbol\xi,\mathcal D_{k-1}\right)
\propto p_t\left(\boldsymbol\theta^{(t+1)}|\boldsymbol\theta^{(t)},\mathcal D_{k-1}\right)p\left(\mathbf y(T-t-1)|\boldsymbol\theta^{(t+1)},\boldsymbol\xi\right), \tag{53}
$$

其中 $p_t(\boldsymbol\theta^{(t+1)}|\boldsymbol\theta^{(t)},\mathcal D_{k-1})$ 由无条件扩散模型给出闭式，$p(\mathbf y(T-t-1)|\boldsymbol\theta^{(t+1)},\boldsymbol\xi)$ 由 (47) 给出。由于这两个分布都是高斯，$p(\boldsymbol\theta^{(t+1)}|\boldsymbol\theta^{(t)},\mathbf y(T-t-1),\boldsymbol\xi,\mathcal D_{k-1})$ 可写成闭式，重采样权重可写为

$$
w_i=\frac{\tilde w_i}{\sum_{i=1}^{N}\tilde w_i},\qquad
\tilde w_i=p\left(\mathbf y(T-t-1)|\boldsymbol\theta_i^{(t)},\boldsymbol\xi\right), \tag{54}
$$

其中 $p(\mathbf y(T-t-1)|\boldsymbol\theta_i^{(t)},\boldsymbol\xi)$ 可处理（细节见 Dou and Song, 2024）。对池化后验 $q_{\boldsymbol\xi,N}(\boldsymbol\theta')\propto\prod_{i=1}^{N}p(\boldsymbol\theta'|\mathbf y_i,\boldsymbol\xi,\mathcal D_{k-1})^{\nu_i}$，更新 (53) 取形式

$$
\prod_{i=1}^{N}p\left(\boldsymbol\theta^{(t+1)}|\boldsymbol\theta^{(t)},\mathbf y_i(T-t-1),\boldsymbol\xi,\mathcal D_{k-1}\right)^{\nu_i}
\propto p_t\left(\boldsymbol\theta^{(t+1)}|\boldsymbol\theta^{(t)},\mathcal D_{k-1}\right)\prod_{i=1}^{N}p\left(\mathbf y_i(T-t-1)|\boldsymbol\theta^{(t+1)},\boldsymbol\xi\right)^{\nu_i}
$$
$$
\propto\prod_{i=1}^{N}\left(p_t\left(\boldsymbol\theta^{(t+1)}|\boldsymbol\theta^{(t)},\mathcal D_{k-1}\right)p\left(\mathbf y_i(T-t-1)|\boldsymbol\theta^{(t+1)},\boldsymbol\xi\right)\right)^{\nu_i}, \tag{55}
$$

从而得到如下重采样权重：

$$
w'_j=\frac{\tilde w'_j}{\sum_{j=1}^{M}\tilde w'_j},\qquad
\tilde w'_j=\prod_{i=1}^{N}p\left(\mathbf y_i(T-t-1)|\boldsymbol\theta_j^{\prime(t)},\boldsymbol\xi\right)^{\nu_i}.
$$

### F 数值实验

#### F.1 序贯先验对比估计（SPCE）与序贯嵌套 Monte Carlo（SNMC）准则

Foster et al. (2021) 提出的 SPCE 是评估设计序列质量的可处理量。对 $K$ 次实验、$\mathcal D_K=\{(\mathbf y_1,\boldsymbol\xi_1),\cdots,(\mathbf y_K,\boldsymbol\xi_K)\}$ 与 $L$ 个对比变量，SPCE 定义为

$$
{\rm SPCE}(\boldsymbol\xi_1,\cdots,\boldsymbol\xi_K)=\mathbb E\left[\log\frac{\prod_{k=1}^{K}p(\mathbf Y_k|\boldsymbol\theta_0,\boldsymbol\xi_k)}
{\frac1{L+1}\sum_{\ell=0}^{L}\prod_{k=1}^{K}p(\mathbf Y_k|\boldsymbol\theta_\ell,\boldsymbol\xi_k)}\right], \tag{56}
$$

其中期望取于 $\prod_{k=1}^K p(\mathbf y_k|\boldsymbol\xi_k,\boldsymbol\theta_0)$ 与 $\prod_{\ell=0}^{L}p(\boldsymbol\theta_\ell)$。SPCE 是总 EIG 的下界——总 EIG 指整条设计参数序列 $\boldsymbol\xi_1,\dots,\boldsymbol\xi_K$ 带来的期望信息增益——当 $L\to\infty$ 时变紧。此外 SPCE 的优点在于只使用来自先验 $p(\boldsymbol\theta)$ 的样本，而不使用相继后验分布的样本，这使它成为仅依据设计序列比较方法的公平准则。给定真实参数值 $\boldsymbol\theta^*$ 与设计序列 $\{\boldsymbol\xi_k\}_{k=1:K}$，用 $p(\mathbf y|\boldsymbol\theta^*,\boldsymbol\xi_k)$ 分别仿真观测 $\{\mathbf y_k\}_{k=1:K}$。于是对给定 $\mathcal D_K$，相应 SPCE 通过从先验采样 $\boldsymbol\theta_1,\cdots,\boldsymbol\theta_L$ 数值估计为

$$
{\rm SPCE}(\mathcal D_K)=\frac1N\sum_{i=1}^{N}\left\{\log\frac{\prod_{k=1}^{K}p(\mathbf y_k|\boldsymbol\theta^*,\boldsymbol\xi_k)}
{\frac1{L+1}\left(\prod_{k=1}^{K}p(\mathbf y_k|\boldsymbol\theta^*,\boldsymbol\xi_k)+\sum_{\ell=1}^{L}\prod_{k=1}^{K}p(\mathbf y_k|\boldsymbol\theta^i_\ell,\boldsymbol\xi_k)\right)}\right\}.
$$

类似地，Foster et al. (2021) 还引入了总 EIG 的上界，称为序贯嵌套 Monte Carlo（SNMC）准则：

$$
{\rm SNMC}(\boldsymbol\xi_1,\cdots,\boldsymbol\xi_K)=\mathbb E\left[\log\frac{\prod_{k=1}^{K}p(\mathbf Y_k|\boldsymbol\theta_0,\boldsymbol\xi_k)}
{\frac1L\sum_{\ell=1}^{L}\prod_{k=1}^{K}p(\mathbf Y_k|\boldsymbol\theta_\ell,\boldsymbol\xi_k)}\right].
$$

如 Foster et al. (2021)（附录 A）所示，SPCE 随 $L$ 增大而增大，并以 $O(L^{-1})$ 的收敛速度在 $L\to\infty$ 时达到总 EIG；对给定 $L$，SPCE 被 $\log(L+1)$ 界住，而 SNMC 上界可能无界。与 Blau et al. (2022) 一样，若取 $L=10^7$ 计算 SPCE 与 SNMC，则 SPCE 的界为 $\log(L+1)=16.12$。实践中这不影响数值方法比较，因为包含总 EIG 的区间 $[{\rm SPCE},{\rm SNMC}]$ 仍明显可区分。

#### F.2 实现细节

**F.2.1 源示例。** 对 VPCE（Foster et al., 2020）与 RL-BOED（Blau et al., 2022），我们使用 github.com/csiro-mlai/RL-BOED 的代码，并按其中推荐的设置复现各自论文的结果。VPCE 以短视方式优化 EIG 下界，用变分近似估计后验分布；RL-BOED 是非短视方法，不提供后验分布。由得到的观测与设计值序列，我们按上述方式计算 SPCE 与 SNMC，并复现了各自论文中的结果。对 PASOA 与 SMC 流程，我们使用 github.com/iolloj/pasoa 的代码；PASOA 是短视方法，用序贯 Monte Carlo（SMC）采样器与退火优化 EIG 下界，同时提供后验估计；称为 SMC 的方法是不带退火的变体。

对 CoDiff，池化后验分布中的 $\nu_i$ 取 $\nu_i=\frac1N$。第 $k$ 次实验步的当前先验与后验分布分别用第 $k-1$ 步的先验与后验样本初始化。设计优化用 Adam 优化器，采用指数学习率衰减调度，初始学习率 $10^{-2}$、衰减率 $0.98$。DiGS 方法（Chen et al., 2024）中的 Langevin 步长取 $10^{-2}$。联合优化–采样循环运行 5000 步。图 5 给出当前先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 的样本，随 $k$ 增加逐渐集中到真实源附近。附录图 6 给出某中间步 $k$ 时当前先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 与池化后验分布的样本对比，以说明其对比性质。

**F.2.2 MNIST 示例。** 该例中似然易由 $\mathbf Y=\mathbf A_{\boldsymbol\xi}\boldsymbol\theta+\boldsymbol\eta$ 导出，其中 $\mathbf Y$、$\boldsymbol\theta$ 与 $\boldsymbol\eta$ 可自然视为像素阵列。变换 $T_{\boldsymbol\xi,\boldsymbol\theta}$ 就是 $T_{\boldsymbol\xi,\boldsymbol\theta}(\mathbf U)=\mathbf A_{\boldsymbol\xi}\boldsymbol\theta+\mathbf U$，$U=\eta$ 为高斯变量。然而为契合我们的理论框架，图像需被视为连续空间域上的映射，使 $\boldsymbol\xi$ 可视为连续参数且 $\mathbf A_{\boldsymbol\xi}\boldsymbol\theta$ 关于 $\boldsymbol\xi$ 可微。这在图像处理与分析中很常见：2D 图像常被视为连续 2D 域上的映射（见 Rein van den Boomgaard and Leo Dorst, 2021 讲义），坐标轴为 $x_1$ 与 $x_2$。也就是说，对 $(x_1,x_2)\in\mathbb R^2$、$\boldsymbol\xi=(\xi_1,\xi_2)\in\mathbb R^2$，我们认为像素阵列 $\boldsymbol\theta$ 是 2D 函数 $\theta(x_1,x_2)$ 的离散采样表示，并（连续与采样表示滥用同一记号地）定义

$$
Y(x_1,x_2)=A_{\boldsymbol\xi}\left(\theta(x_1,x_2)\right)+\eta(x_1,x_2),
$$

其中 $A_{\boldsymbol\xi}(\cdot)$ 是依赖某长度 $h$ 的掩码算子：

$$
A_{\boldsymbol\xi}\left(\theta(x_1,x_2)\right)=
\begin{cases}
\theta(x_1,x_2), & (x_1,x_2)\in S_{\boldsymbol\xi,h},\\
0, & \text{否则},
\end{cases}
$$

而 $S_{\boldsymbol\xi,h}=\{(x_1,x_2)\in\mathbb R^2:\xi_1-h\Delta_1\le x_1\le\xi_1+h\Delta_1,\ \xi_2-h\Delta_2\le x_2\le\xi_2+h\Delta_2\}$，$\Delta_1,\Delta_2$ 为沿 $x_1$、$x_2$ 轴的采样距离。

为能关于 $\boldsymbol\xi$ 求导，需考虑 $\mathbf A_{\boldsymbol\xi}$ 的光滑版本 $\mu_{\boldsymbol\xi,s}$。经典做法是用 2D 高斯核 $G_s$（如两个 1D 高斯核之积，正尺度 $s=(s_1,s_2)$）卷积。实践上这相当于平滑掩码的锐利边界，注意 $s\to0$ 时 $\mu_{\boldsymbol\xi,s}\to\mathbf A_{\boldsymbol\xi}$：

$$
\mu_{\boldsymbol\xi,s}(x_1,x_2)=\left(A_{\boldsymbol\xi}(\theta)*G_s\right)(x_1,x_2)
=\left(A_0(\theta)*G_s\right)(x_1-\xi_1,x_2-\xi_2)
=\mu_{0,s}(x_1-\xi_1,x_2-\xi_2),
$$

其中第二个等式用到 $A_{\boldsymbol\xi}(\theta(x_1,x_2))=A_0(\theta(x_1-\xi_1,x_2-\xi_2))$。由此可知，无论 $A_0(\theta)$ 是什么，与 $G_s$ 卷积都会使 $\mu_{0,s}$ 成为其自变量连续且无穷可微的函数。于是对 $i=1,2$，

$$
\frac{\partial\mu_{\boldsymbol\xi,s}}{\partial\xi_i}(x_1,x_2)=\frac{\partial\mu_{0,s}}{\partial\xi_i}(x_1-\xi_1,x_2-\xi_2)
=-\frac{\partial\mu_{0,s}}{\partial x_i}(x_1-\xi_1,x_2-\xi_2)
=-\left(A_0(\theta)*\frac{\partial G_s}{\partial x_i}\right)(x_1-\xi_1,x_2-\xi_2).
$$

这些导数定义了本文展开中所需的全部梯度。若 $A_0$ 为 Heaviside 阶跃函数，其与某分布的卷积给出该分布的累积分布函数（cdf）。把高斯核替换为均值 0、尺度 $s=(s_1,s_2)$ 的二元 logistic 分布 $\mathcal L$ 时，同样推导成立。多元 logistic 分布（Gumbel, 1961；Malik and Abraham, 1973）推广了一元 logistic 分布，其 pdf 为 $L_2(x_1,x_2;s)=\frac{2!\exp(-x_1/s_1-x_2/s_2)}{s_1s_2\left(1+\exp(-x_1/s_1)+\exp(-x_2/s_2)\right)^3}$，cdf 有闭式 $\frac{1}{1+\exp(-x_1/s_1)+\exp(-x_2/s_2)}$。实践中我们简单取两个独立一元 logistic 分布（均值 0、尺度 $s_i$，$i=1,2$）之积，$L_1(x_i;s_i)=\frac{\exp(-x_i/s_i)}{s_i\left(1+\exp(-x_i/s_i)\right)^2}$；1D logistic 分布的 cdf 即 sigmoid 函数 $S(x_i;s_i)=\frac{1}{1+\exp(-x_i/s_i)}$。于是 Heaviside 阶跃函数与这种 logistic 分布的卷积就是光滑 sigmoid。MNIST 例中掩码长度取 $h=7$、采样距离 $\Delta_1=\Delta_2=1$，并使用尺度 $s_1=s_2=0.1$ 的 2D 乘积 logistic 核。利用 2D 掩码可写成如下乘积 $A_{\boldsymbol\xi}=\left(H(x_1-\xi_1+h)+H(\xi_1+h-x_1)-1\right)\left(H(x_2-\xi_2+h)+H(\xi_2+h-x_2)-1\right)$（$H$ 为 1D Heaviside 阶跃函数），可得光滑的 $\mu_{\boldsymbol\xi,s}$：

$$
\mu_{\boldsymbol\xi,s}(x_1,x_2)=\left(S(x_1-\xi_1+h;s_1)+S(\xi_1+h-x_1;s_1)-1\right)\left(S(x_2-\xi_2+h;s_2)+S(\xi_2+h-x_2;s_2)-1\right).
$$

第 6.3 节数值实验使用 MNIST 数据集（LeCun et al., 1998）与时变 SDE (34)，噪声调度为 $\beta(t)=b_{\min}+(b_{\min}-b_{\max})\frac{t-t_0}{T-t_0}$（其中 $b_{\max}=5$、$b_{\min}=0.2$、$t_0=0$、$T=2$）。常规分数匹配训练 3000 个 epoch，批大小 256，使用 Adam 优化器（Kingma and Ba, 2015）；我们使用梯度裁剪，训练在单张 A100 GPU 上完成。

> **原文疑点：** 原文给出的噪声调度 $\beta(t)=b_{\min}+(b_{\min}-b_{\max})\frac{t-t_0}{T-t_0}$ 与随后参数取值 $b_{\max}=5$、$b_{\min}=0.2$ 相互矛盾：当 $t=T$ 时该式给出 $\beta(T)=b_{\min}+(b_{\min}-b_{\max})=0.2-4.8=-4.6<0$，而 VP-SDE 的噪声调度应随 $t$ 增大（由 $b_{\min}$ 增至 $b_{\max}$）且始终为正。疑为符号笔误，原式应为 $\beta(t)=b_{\min}+(b_{\max}-b_{\min})\frac{t-t_0}{T-t_0}$。本译按原文照录并加注，未改动公式。

采样算子的更新方程由 SDE (19) 导出（用于池化后验 $q_{\boldsymbol\xi,N}(\boldsymbol\theta')$ 的对比样本），由 (45) 导出（用于当前先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 的样本），其中 $\mathcal D_{k-1}$ 可无障碍地加入条件部分；这些更新分别等价于 (55) 与 (53)。重采样权重按 E 节计算。

图 7 与图 8 给出更多图像重建过程。待恢复数字在第 1 列；相继选出的掩码（红色线框）在第 2 列，并给出逐步显露出的图像部分；重建本身可由最后 16 列的后验样本估计，每次实验上行给出 16 幅最可能的重建图像，下行给出 16 幅较不可能的重建图像。随实验次数增加，后验样本逐渐集中到正确数字上。

图 9 表明设计优化是有效的：优化掩码位置（第 2 列）比随机选择掩码中心（第 3 列）给出更好的结果；最后 14 列中后验权重最高的样本在优化情形下也明显更接近真实数字。设计优化的优越性能在表 1 中得到定量确认——该表以结构相似性指标（SSIM）（Wang et al., 2004）度量 CoDiff 与随机设计的重建质量。随机选取 20 幅真值数字图像，在 6 次相继实验的每一次之后计算 CoDiff 与随机重建的 SSIM；表 1 报告 20 幅数字上的 SSIM 中位数。SSIM 是 $[-1,1]$ 之间的十进制数值：1 表示完全相似，0 表示不相似，$-1$ 表示完全反相关。

#### F.3 硬件细节

6.2 节源示例可在本地运行，已在 Apple M1 Pro 16Gb 芯片上测试，但 GPU 上可获得更快的运行时间。6.3 节 MNIST 示例在单张 A100 80Gb GPU 上运行。

#### F.4 软件细节

我们的代码用 Jax（Bradbury et al., 2020）实现，使用 Flax 作为神经网络库、Optax 作为优化库（Babuschkin et al., 2020）。代码见 https://github.com/jcopo/ContrastiveDiffusions。

**图 5：** 源定位示例。实验 0（先验样本）、4、8 与 12。随着新的设计位置（橙色叉）被选出，样本集中到真实源（红色叉）附近。权重较低的样本为蓝色，权重较高的为黄色。

**图 6：** 若干源定位示例。第 $k$ 次实验时的先验（左）与池化后验（右）样本。优化序列 $\boldsymbol\xi_0,\cdots,\boldsymbol\xi_T$（蓝叉）结束时得到的最终 $\boldsymbol\xi^*_k$（橙叉）。该优化通过使池化后验“尽可能不同于”先验来“对比”两个分布。

**图 7：** 图像重建。前 7 次实验（行）：图像真值、第 $k$ 次实验的测量、来自当前先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 的样本（上行权重最高、下行权重最低）。随流程推进，样本逐步纳入历史测量信息。

**图 8：** 图像重建。前 7 次实验（行）：图像真值、第 $k$ 次实验的测量、来自当前先验 $p(\boldsymbol\theta|\mathcal D_{k-1})$ 的样本（上行权重最高、下行权重最低）。随流程推进，样本逐步纳入历史测量信息。

**图 9：** 由 7 张序贯选取的、位于 7 个中心像素 $\boldsymbol\xi$ 的 $7\times7$ 子图像 $\mathbf y=\mathbf A_{\boldsymbol\xi}\boldsymbol\theta+\boldsymbol\eta$ 重建图像 $\boldsymbol\theta$（第 1 列）。优化设计与随机设计对比：测得的结果 $\mathbf y$（第 2 列 vs 第 3 列）与最高权重的参数 $\boldsymbol\theta$ 估计（重建）（上 vs 下行）。

**原文插图：** 原 PDF 中的图 1–9 未重传至本页，仅保留中文图注与图中关键标注；全部原图可查阅 ICLR 2025 正式版本。

---

**本页范围与校对状态：** 本页依据本地会议论文集 PDF（ICLR 2025 出版版本，27 页）作中文全译：摘要、正文第 1–7 节（含 6.1–6.3）、致谢、参考书目 60 条英文原条目，以及补充材料 A–F（A 两种 EIG 梯度表达式；B 对数池化与引理 1–2 及证明、注 1–3；C 去噪/条件扩散模型与梯度估计；D 序贯 BOED；E SMC 式重采样；F SPCE/SNMC 准则、实现细节 F.2.1–F.2.2、硬件与软件），含算法 1–2、表 1（逐格渲染核对）、图 1–9 图注与式 (1)–(56)。**再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。****逐句终校未做**：表 1 已用 PDF 页面渲染核对（Measure 1–6 行 CoDiff/Random 全部数值）；正文定理/引理/算法与关键公式已对照页面文本层核对，但尚未完成逐句逐式的独立复核。页内 2 条“原文疑点”加注：①式 (19) 直接使用条件分数 $\nabla_{\boldsymbol\theta}\log p_t(\boldsymbol\theta'(t)|\mathbf y_i(t),\boldsymbol\xi)$，与同段 FPS 需将其分解为“无条件分数 + 条件似然分数”才能复用预训练 $s_\phi$ 的论证不一致（原文写法省略了该分解）；②补充材料 F.2.2 的噪声调度 $\beta(t)=b_{\min}+(b_{\min}-b_{\max})\frac{t-t_0}{T-t_0}$ 与 $b_{\max}=5$、$b_{\min}=0.2$ 矛盾（$t=T$ 时 $\beta=-4.6<0$），疑为符号笔误，应为 $(b_{\max}-b_{\min})$。均按原文照录并说明，未作数值或表述改动。

{% endraw %}
