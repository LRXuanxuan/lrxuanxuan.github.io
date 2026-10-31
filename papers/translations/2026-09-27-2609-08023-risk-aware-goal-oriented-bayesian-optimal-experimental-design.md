---
layout: page
title: "风险感知的目标导向贝叶斯最优实验设计｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-08023-risk-aware-goal-oriented-bayesian-optimal-experimental-design/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/d6b9d9ec4bd44c49/) · [原文 arXiv](https://arxiv.org/abs/2609.08023) · [全部目录](/papers/catalog/)

# 风险感知的目标导向贝叶斯最优实验设计

**原题：** Risk-Aware Goal-Oriented Bayesian Optimal Experimental Design  
**作者：** John D. Jakeman（通讯作者）、Rebekah White、Bart van Bloemen Waanders、Drew P. Kouri、Alen Alexanderian  
**单位：** J. D. Jakeman 为美国桑迪亚国家实验室（Sandia National Laboratories）AI Credibility Department；R. White 与 D. P. Kouri 为 Optimization and Uncertainty Quantification Department；B. van Bloemen Waanders 为 Scientific Machine Learning Department；A. Alexanderian 为美国北卡罗来纳州立大学数学系。  
**版本：** arXiv:2609.08023v1（stat.ME），2026-09-07，原文 39 页（含图 1—18、表 1—2、算法 1、附录 A—F）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 1—6 节、致谢与生成式 AI 声明、附录 A—F、图 1—18 图注、表 1—2（逐格）、参考文献 [1]—[20] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2609.08023，2026-09-27"；本地 PDF 为 **arXiv:2609.08023v1 [stat.ME]，2026-09-07**（正文首页日期 September 9, 2026），"2026-09-27" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

传统贝叶斯最优实验设计（OED）选择最能刻画模型参数的测量，但这些测量对下游预测可能是次优的。目标导向 OED 直接面向预测；然而现有目标导向准则同等看待预测不确定性的所有缩减，无法优先考虑罕见的、高后果的结果。本文提出一个**风险感知框架**，在三个层级上复合风险，每一层都推广了经典 I-最优与 G-最优设计的一个要素：对后验预测不确定性的**偏差度量**（推广预测方差）、在预测域上的**风险度量**（在 I-最优的平均与 G-最优的最坏情形选择之间插值），以及在数据集上的**风险度量**（推广期望）。我们由风险四边形（risk quadrangle）中的遗憾函数生成每一层级，从而一个三元组即可指定实践者的风险偏好。我们把设计松弛为单位单纯形上的连续权重，并构造对设计变量可微的嵌套求积估计器，使最优设计问题可用基于梯度的方法求解，避免对候选设计的组合搜索。对线性—高斯对数正态模型及其非线性扩展，我们推导出闭式目标函数，作为精确参考来验证估计器的收敛性。我们在一个由对流—扩散方程支配的逆问题中演示该框架，用于寻找最优传感器布局。我们发现风险感知设计显著优于期望信息增益基线——后者在统计上与随机分配无法区分。

**关键词**：目标导向最优实验设计；风险感知设计；传感器布局；不确定性量化；贝叶斯逆问题。

## 1. 引言

数学模型被用于预测物理与工程系统的行为，并为高后果决策提供依据，例如污染物是否会超过监管阈值、或部件是否会在服役载荷下失效。模型输入与参数（如边界条件、材料属性与源项）的不确定性会传播为驱动这些决策的模型输出的不确定性，我们称这些输出为**感兴趣量（QoI）**。降低这些 QoI 的不确定性通常需要采集实验数据，把不确定输入上的先验分布更新为后验分布；把该后验通过模型推送（**后验推前（posterior push-forward）**）即得到 QoI 上的诱导后验分布。测量受成本、时间与安全性限制，并且并非所有测量都同样有信息量，因此测量什么的选择至关重要。在贝叶斯框架下，最优实验设计（OED）通过先验地选择在给定预算下最大化期望信息增益的测量，把这一选择形式化。

贝叶斯 OED 的一种常见做法是优化后验分布的某个标量函数。经典准则（如 A-最优与 D-最优，或后验到先验的期望 Kullback–Leibler（KL）散度）面向参数，选择使参数后验尽可能集中的测量 [1, 5, 13, 15]。这些准则对参数估计有效，但许多应用关注下游任务（如预测 QoI）。在此背景下，面向参数的 OED（pOED）可能把精力花在与 QoI 仅弱耦合的参数方向上，只能带来预测性能的边际提升 [3]，从而促使研究替代方法 [6]。

目标导向最优实验设计（gOED）通过选择直接降低预测不确定性的实验来解决这一失配。gOED 不是使参数后验集中，而是面向后验推前——即把参数后验经参数到 QoI 映射得到的 QoI 分布。图 1 说明了在水道中传感器布局时两者的差异：pOED 把传感器放在最能约束入流参数的位置，但这些参数与下游 QoI 仅弱耦合，故其后验推前几乎不收紧；gOED 则把传感器沿流到受体的路径放置，显著降低预测不确定性。

**图 1**：pOED 与 gOED 在带流阻的水道中传感器布局的概念比较。左：候选传感器位置（圆点，大小表示设计权重）与定义 QoI 的受体位置（菱形）；pOED 设计（左上）与 gOED 设计（左下）把权重分配给不同传感器。右：两种设计下受体处 QoI 的先验（虚线）与后验（实线）推前分布。

现有 gOED 方法分为两类。基于 Laplace 的方法在高斯近似下优化后验推前协方差的某个泛函（通常为其迹或行列式），并在可能数据上取平均 [2, 18]；信息增益方法最大化先验与后验推前之间的期望 KL 散度，可容纳非线性与非高斯模型 [4, 20]。然而二者都无法按实践者的风险偏好定制：协方差同等惩罚均值两侧的偏差，即便只关心大的 QoI 值也无法优先考虑上尾；KL 散度奖励降低后验分布的整体不确定性，却无法偏好某一区域。此外两者对数据不确定性都是风险中性的：它们通过对所有可能数据集取平均来评估性能，因而罕见但不利的数据集与典型数据集权重相同。

在许多应用中，这种对风险的不敏感并不足够：恰当的设计准则必须**非对称地**响应预测不确定性，强调决策代价最高的结果。例如可靠性工程师关心峰值应力超过失效极限的概率，而不关心把 Lamé 参数均值附近的分布收紧。决策理论中的风险度量（如平均风险价值（AVaR，也称条件风险价值）与熵风险）提供了公理化方式来编码这类偏好并相应加权尾部行为。风险度量已在代理建模 [7] 与不确定性下的优化 [8] 中证明有价值，但风险感知准则在 OED 中的发展有限，且仅以依赖大样本近似的频率派形式 [11, 12] 被探讨，这可能不适用于小观测预算。这一空白促使本文发展该框架，把面向预测的 OED 与有原则的风险处理相结合。

本文的主要贡献是面向目标导向贝叶斯 OED 的**风险感知最优性准则**，它在三个层级上复合风险，每一层都推广经典 I-最优与 G-最优设计的一个要素。需要三个层级，是因为目标导向贝叶斯 OED 必须：(i) 在以数据为条件的后验推前中量化离散度——我们用**偏差度量**（如标准差），推广经典 I-最优与 G-最优所依赖的预测方差；(ii) 在多变量 QoI 的各分量间聚合性能——我们用统一 I-最优平均与 G-最优最坏情形聚合的**风险度量**；(iii) 在设计阶段考虑数据集本身的不确定性——我们用对可能数据实现的风险度量，推广基于期望的方法，并支持惩罚异常观测以增强鲁棒性的设计。在每个层级，我们用风险四边形 [14] 把单个遗憾函数（量化每种可能结果带来的不满）映射为匹配的偏差度量与风险度量。

为求解由风险感知目标导向 OED 准则诱导的传感器设计优化问题，我们建立在贝叶斯 OED 中常用、并在 [15] 中综述的嵌套“双环”蒙特卡洛估计器之上。这些估计器用外环在候选设计下抽取可能数据集、用内环对相应参数后验采样，以评估面向参数的效用。我们通过评估 QoI 后验推前的效用、并使用按实践者风险偏好定制的风险度量，把该嵌套估计模板推广到目标导向、风险感知设计。与现有目标导向 OED 方法不同，该估计器既避免基于协方差准则的线性化，也避免信息增益准则的核密度估计——后者在超过少数几个 QoI 后迅速退化，且对连续预测场失效 [17]。

由于实际设计涉及离散传感器选择与整数测量分配，精确问题是组合问题。我们通过允许单位单纯形上的连续权重、并复用固定的一组蒙特卡洛样本进行松弛，使目标函数成为设计权重的可微函数。我们进一步在对数正态推前的线性—高斯模型中推导若干风险感知设计目标的闭式表达式，作为验证嵌套估计器收敛性的精确参考。最后，我们在一个代表地表水质监测的 PDE 约束对流—扩散问题上演示该框架，表明不同风险偏好会给出不同的传感器布局，且面向参数的设计对目标导向目标可能次优。

本文其余部分组织如下：第 2 节给出贝叶斯逆问题、其目标导向变体与所得 OED 问题，并引入贯穿全文的线性—高斯示例；第 3 节介绍风险度量并用其构造风险感知 OED 目标；第 4 节给出计算风险感知设计的数值算法；第 5 节报告收敛性研究与对流—扩散传感器布局示例，比较风险感知目标导向设计与基于参数的 OED；第 6 节给出结论。

## 2. 问题表述

OED 选择设计，使所得数据对模型参数、或对表示为 QoI 的预测最有信息量。本节回顾相关背景，并引入贯穿全文的线性—高斯示例。

### 2.1 贝叶斯推断

贝叶斯推断从在设计 $w\in\mathcal W$ 下采集的数据 $y\in\mathcal Y\subset\mathbb R^K$ 估计模型参数 $\theta\in\Theta\subset\mathbb R^D$，其中 $\mathcal W$ 表示可容许设计集。为此它把编码观测前参数不确定性的先验密度 $p(\theta)$ 与似然 $p(y\mid\theta,w)$（在参数实现 $\theta$、设计 $w$ 下观测到 $y$ 的概率）相结合。贝叶斯公式把给定 $y$ 与 $w$ 时 $\theta$ 的后验密度定义为

$$
p(\theta\mid y,w)=\frac{p(y\mid\theta,w)p(\theta)}{p(y\mid w)}.\tag{1}
$$

分母为**证据**（边缘似然）$p(y\mid w)=\int_\Theta p(y\mid\theta,w)p(\theta)\,\mathrm d\theta$。指定似然的一种常见方式是通过把数据与参数联系起来的观测模型，典型例子是加性模型 $y=f(\theta,w)+\varepsilon$，其中 $f:\mathbb R^D\times\mathcal W\to\mathbb R^K$ 为在设计 $w$ 下由 $\theta$ 预测 $y$ 的参数到可观测量映射，$\varepsilon$ 为协方差 $\Gamma$ 的零均值高斯测量噪声。此时似然 $p(y\mid\theta,w)$ 为高斯分布 $\mathcal N(y;f(\theta,w),\Gamma)$。评估似然需要评估映射 $f$——当 $f$ 由 PDE 支配时该评估昂贵，导致证据项计算代价高。

### 2.2 目标导向贝叶斯推断

研究的目标往往不是参数推断本身，而是把参数推断作为预测无法直接观测的 QoI 的中间步骤，例如下游受体处的污染物浓度或机械部件中的峰值应力。通常把这些预测收集为向量值 QoI 映射 $q(\theta)=(q_1(\theta),\ldots,q_Q(\theta))\in\mathcal Q\subset\mathbb R^Q$，其分量 $q_j(\theta)$（$j=1,\ldots,Q$）为各标量预测。这些分量可以是有限个不同预测的集合，也可以是预测场在 $Q$ 个位置上的离散化。参数密度 $\pi(\theta)$ 随后诱导 QoI 上的密度，即 $\pi$ 经 $q$ 的推前：

$$
\pi_{\mathrm{pf}}(z)=\int_\Theta\delta(z-q(\theta))\pi(\theta)\,\mathrm d\theta,\tag{2}
$$

其中 $\delta(\cdot)$ 表示 Dirac delta。取 $\pi$ 为先验 $p(\theta)$ 或后验 $p(\theta\mid y,w)$，分别得到先验或后验推前。实践中推前分布常用蒙特卡洛传播近似：把样本 $\{\theta^{(i)}\}\sim\pi(\theta)$ 经 $q$ 映射，得到服从 $\pi_{\mathrm{pf}}$ 的 QoI 样本 $\{q(\theta^{(i)})\}$。由于后验依赖设计 $w$，其推前也依赖 $w$：设计控制数据能在多大程度上降低 QoI 的预测不确定性，目标导向设计正是利用这种依赖直接面向 QoI。

### 2.3 最优实验设计

OED 需要一个**设计目标** $U(w)$ 来量化设计 $w$ 下实验结果的期望质量，以及一个在其上优化的可行设计空间 $\mathcal W$。设计可以有多种参数化方式：可以在域 $\Xi$ 上连续优化传感器位置或测量时刻，得到 $\mathcal W=\Xi^S$（$S$ 个测量）；但此类可行集通常非凸、难以优化，且需事先固定 $S$。我们改而在固定候选条件集上采用松弛，得到便于基于梯度优化的凸可行集。

设 $\xi=\{\xi_1,\ldots,\xi_K\}\subset\Xi$ 为 $K$ 个候选实验条件，例如传感器位置、测量时刻或受控输入。我们用单纯形上的非负权重向量 $w=(w_1,\ldots,w_K)^\top$ 表示设计：

$$
\Delta_K:=\left\{w\in\mathbb R^K\ \middle|\ w_k\ge0\ \forall k,\ \sum_{k=1}^{K}w_k=1\right\},
$$

并把它作为该参数化下的设计空间 $\mathcal W$。这里 $w_k$ 是分配给条件 $\xi_k$ 的测量预算占总预算的比例，故权重充当各候选相对重要性的连续代理。测量数固定的设计可通过把优化权重舍入为整数分配得到，对此已有标准启发式 [19]。

由于设计时数据 $y$ 未知，设计目标必须考虑其分布 $p(y\mid w)$；常规目标通过在 $y\sim p(y\mid w)$ 上取期望来做到这一点。我们把目标 $U(w)$ 表述为设计下剩余的预测不确定性并使其最小化，从而较小值表示更好的设计：

$$
w^\star\in\arg\min_{w\in\Delta_K}U(w).\tag{3}
$$

面向参数 OED 的一个经典贝叶斯目标是**期望信息增益（EIG）**，定义为后验到先验的期望 KL 散度：

$$
\mathrm{EIG}(w):=\mathbb E_{p(y\mid w)}\left[\phi_{\mathrm{KL}}(p(\theta\mid y,w)\|p(\theta))\right]=\int_{\mathcal Y}\int_\Theta\ln\left(\frac{p(\theta\mid y,w)}{p(\theta)}\right)p(\theta\mid y,w)p(y\mid w)\,\mathrm d\theta\,\mathrm dy.\tag{4}
$$

EIG 度量参数不确定性的期望缩减，故信息量更大的设计 EIG 更大。由于我们的约定是惩罚剩余的不确定性，因此最小化其相反数，即定义 KL 设计目标

$$
U_{\mathrm{KL}}(w):=-\mathrm{EIG}(w).\tag{5}
$$

最小化 $U_{\mathrm{KL}}(w)$ 选择这样的设计：其在可能数据集 $y\sim p(y\mid w)$ 上平均的后验，在 KL 意义上尽可能不同于先验。这对参数估计是自然的，但不按各参数方向对 QoI 映射 $q$ 的影响加以区分。该局限促使我们发展第 3 节的目标导向与风险感知目标，并在全文中以 EIG 作为比较基线。

### 2.4 线性高斯示例

为建立直观并支持对计算框架的解析验证，我们引入一个贯穿全文的具体示例。考虑线性观测模型 $f(\theta,w)=A\theta$ 与加性高斯噪声：

$$
y=A\theta+\varepsilon,\qquad \varepsilon\mid w\sim\mathcal N(0,\Gamma_{\mathrm{eff}}(w)).\tag{6}
$$

这里 $A\in\mathbb R^{K\times D}$ 为观测矩阵，其各行由固定候选位置决定，故 $\mathcal Y\subseteq\mathbb R^K$。设计只通过噪声进入：具体地，定义跨候选独立、独立同分布的基线噪声协方差 $\Gamma=\operatorname{diag}(\sigma_{\varepsilon,1}^2,\ldots,\sigma_{\varepsilon,K}^2)$，并令权重 $w_k$ 缩放候选 $k$ 处的精度，得到对角有效噪声协方差

$$
\Gamma_{\mathrm{eff}}(w)=\operatorname{diag}\left(\frac{\sigma_{\varepsilon,1}^2}{w_1},\ldots,\frac{\sigma_{\varepsilon,K}^2}{w_K}\right).
$$

权重越大，该候选处的有效方差越小。取高斯先验 $\theta\sim\mathcal N(\mu,\Sigma)$ 时模型是共轭的：后验为高斯，其协方差 $\Sigma^\ast(w)$ 依赖设计、均值 $\mu^\ast(y,w)$ 依赖数据，闭式表达见附录 A。

为说明具有非高斯预测分布的目标导向设计，我们定义 QoI 映射为线性泛函的逐分量指数：

$$
q(\theta)=\exp\left(\Psi^\top\theta\right)\in\mathbb R^Q,\tag{7}
$$

其中 $\Psi=[\psi_1,\ldots,\psi_Q]\in\mathbb R^{D\times Q}$，每个 $\psi_j\in\mathbb R^D$ 指定一个预测方向。各分量索引预测空间变量：每个方向 $\psi_j=\psi(x_j)$ 关联一个位置 $x_j\in\mathcal X_{\mathrm{qoi}}$，因此相邻分量对应相邻预测位置。由于 $\Psi^\top\theta$ 在先验与后验下均服从高斯，$q(\theta)$ 的相应先验与后验推前分布为对数正态。于是尽管参数后验为高斯，推前却是非高斯的，使该基准既非平凡又可解析处理，且第 3 节引入的风险感知设计目标有闭式表达。

该示例也揭示了面向参数设计的核心局限。图 2 对比两种设计：$w_A$ 使传感器与观测模型对齐，沿 $\theta_1$ 方向急剧压缩后验；而 $w_B$ 与 QoI 方向 $\psi$ 对齐，改为沿 $\theta_2$ 压缩。尽管 $w_A$ 产生更集中的后验，其后验推前与先验推前相似；而 $w_B$ 显著降低预测不确定性（图 2b）。因此两种设计在不同不确定性度量下结论相反：$w_A$ 在参数空间准则（后验协方差行列式，图 2c）上占优，$w_B$ 在推前标准差（图 2d）上占优。一个设计因此可以极具参数信息量、却无助于预测——极端情形是把传感器放在只刻画与 QoI 正交的参数维度处。这正是第 3 节发展目标导向目标的动机。

**图 2**：对数正态运行示例（第 2.4 节）的观测模型、QoI 映射与后验推前。(a) 参数空间：各向异性先验（蓝色实线等高线）与设计 $w_A$（红）和 $w_B$（黑）下的 $2\sigma$ 后验椭圆，箭头标记 QoI 方向 $\psi$。(b) $q(\theta)=\exp(\psi^\top\theta)$ 的先验（灰虚线）与 $w_A$（红，几乎与先验相同）和 $w_B$（黑，明显更窄）下的后验推前。(c, d) 先验、$w_A$ 与 $w_B$ 下的后验协方差行列式 $\det(\Sigma^\ast(w))$ 与推前标准差 $\mathrm{Std}_{p(\theta\mid y,w)}[q]$。

## 3. 风险感知目标导向设计目标


### 3.1 偏差度量与风险度量

**偏差度量** $\mathcal D_{\mathrm{pf}}$ 量化随机变量 $Z$ 的非恒定性：它非负、当且仅当 $Z$ 几乎必然为常数时为零，且对平移不敏感，即对任意常数 $c\in\mathbb R$ 有 $\mathcal D_{\mathrm{pf}}[Z+c]=\mathcal D_{\mathrm{pf}}[Z]$。它常由量化实践者不满的**遗憾度量** $\mathcal V$ 生成；具体地，偏差为最优重中心化后的最小期望误差：

$$
\mathcal D(Z)=\inf_{d\in\mathbb R}\left\{d+\mathcal V(Z-d)\right\}-\mathbb E[Z].\tag{8}
$$

某些偏差度量可由**遗憾函数** $v:\mathbb R\to\mathbb R$ 及其关联的误差函数 $e(x)=v(x)-x$ 生成，它们定量编码实践者对大的高后果事件的厌恶。$v$ 的形状决定如何惩罚散布：对称遗憾同等惩罚两个方向的偏离（如同标准差），适合两个方向都重要的情况；非对称遗憾对一侧尾部加权更重，适合只有一个方向重要的情况，例如污染物浓度超过监管阈值（示例遗憾函数见图 3）。

**风险度量** $\mathcal R$ [14] 对如下问题给出定量回答：“给定不确定性偶尔会把随机结果 $Z$ 推到阈值 $\tau$ 之上，$Z$ 相对 $\tau$ 是否可接受？”，并产生同时反映分布位置与其不利结果权重的标量汇总 $\mathcal R[Z]$。我们关注可分解为均值与相应偏差的风险度量，使同一遗憾函数同时确定两个算子，即

$$
\mathcal R(Z)=\mathbb E[Z]+\mathcal D(Z)=\inf_{d\in\mathbb R}\left\{d+\mathbb E[v(Z-d)]\right\}.\tag{9}
$$

本框架在第 1 层接受任何有效偏差度量、在第 2、3 层接受任何有效风险度量。本文以三个遗憾度量族为代表示例（表 1）：安全裕度族、AVaR 与熵风险。安全裕度族是对称的，同等惩罚均值上下两侧的偏离（脚注 1）；AVaR 忽略低于 $(1-\alpha)$-分位数的偏离并对上尾取平均；熵族以指数方式把分布向上尾重新加权。相应遗憾函数及其在参考分布上的作用见图 3 与图 4。AVaR 用 $\mathrm{VaR}_\alpha[Z]=\inf\{z\in\mathbb R\mid\mathbb P(Z\le z)\ge\alpha\}$ 定义为

$$
\mathcal R_\alpha^{\mathrm{AVaR}}(Z)=\mathrm{VaR}_\alpha[Z]+\frac{1}{1-\alpha}\mathbb E[\max(0,Z-\mathrm{VaR}_\alpha[Z])]=\frac{1}{1-\alpha}\int_\alpha^1\mathrm{VaR}_t[Z]\,\mathrm dt.\tag{10}
$$

**表 1　遗憾、偏差与风险度量族**（按原表逐格转录）

| 族 | 遗憾度量 | 偏差度量 | 风险度量 |
| --- | --- | --- | --- |
| （安全裕度） | $\mathcal V(Z)=c\lVert Z\rVert_2+\mathbb E[Z]$ | $\mathcal D(Z)=c\,\mathrm{Std}[Z]$ | $\mathcal R(Z)=\mathbb E[Z]+c\,\mathrm{Std}[Z]$ |
| （AVaR） | $\mathcal V(Z)=\mathbb E\left[\frac{\max(0,Z)}{1-\alpha}\right]$ | $\mathcal D(Z)=\mathrm{AVaR}_\alpha[Z-\mathbb E[Z]]$ | $\mathcal R(Z)=\mathrm{AVaR}_\alpha[Z]$ |
| （熵） | $\mathcal V(Z)=\mathbb E\left[\frac{1}{\lambda}\left(e^{\lambda Z}-1\right)\right]$ | $\mathcal D(Z)=\frac{1}{\lambda}\log\mathbb E\left[e^{\lambda(Z-\mathbb E[Z])}\right]$ | $\mathcal R(Z)=\frac{1}{\lambda}\log\mathbb E\left[e^{\lambda Z}\right]$ |

> **脚注 1**：产生“均值加标准差”风险度量（本文所用；见表 1）的安全裕度偏差度量无法写成遗憾函数的期望；但安全裕度族的“均值加方差”变体可表示为遗憾函数 $v(t)=t+ct^2$ 的期望。

**图 3**：表 1 三个族的遗憾函数 $v(t)$，在 $t\in[-1.2,2]$ 上绘出以显示非对称性。(a) 线性对称遗憾 $v(t)=t+ct^2$（安全裕度族的方差形式），两个 $c$ 值，两个符号被同等惩罚。(b) 分段线性遗憾（AVaR）：负偏离零惩罚，正偏离以斜率 $1/(1-\alpha)$ 惩罚，当 $\alpha\to1$ 时发散。(c) 指数遗憾 $v(t)=(e^{\lambda t}-1)/\lambda$（熵），两个 $\lambda$ 值；遗憾在 $t<0$ 时为负（阴影），故低于均值的结果减小偏差，而高于均值的结果被超二次惩罚。

**图 4**：各偏差度量在第 1 层输出 $d_j$ 的参考分布上的作用（黑色曲线；右偏，是推前偏差值的典型形状）。各面板中灰色虚线为均值 $\mu$，彩色点线为风险度量值 $\mathcal R$，灰色双向箭头表示偏差 $\mathcal D=\mathcal R-\mu$。(a) 标准差（$c=1$）：阴影区为均值 $\pm1\sigma$。(b) AVaR 偏差（$\alpha=0.8$）：$\alpha$-分位数以上的阴影尾部区域定义条件均值 $\mathcal R^{\mathrm{AVaR}}$。(c) 熵偏差（$\lambda=1.2$）：紫色曲线为指数重加权密度；低于均值的结果（浅绿）权重小于 1 而减小偏差，高于均值的结果（浅紫）权重大于 1 而被放大。

### 3.2 设计目标

设计目标复合三个阶段，每个阶段都对后验推前中的一个不确定性来源应用偏差或风险度量。为简洁，我们用算子下标表示其所作用的分布或测度，方括号中的参数为被汇总的随机变量（不在括号内重复条件）。对固定数据集，第 1 层对每个标量 QoI 分量 $q_j(\theta)$ 的后验推前应用偏差度量；把该推前偏差记为 $\mathcal D^{\mathrm{pf}}$，第 1 层输出为

$$
d_j(y,w):=\mathcal D^{\mathrm{pf}}_{p(\theta\mid y,w)}[q_j(\theta)],\tag{11}
$$

即分量 $q_j(\theta)$ 后验推前的偏差。对同一固定数据集，第 2 层在预测域 $\mathcal X_{\mathrm{qoi}}$ 上的概率测度 $\mu$ 下，用风险度量在 QoI 各分量间聚合这些偏差，得到一个标量：

$$
r(y,w):=\mathcal R^{\mathrm{QoI}}_\mu[d_1(y,w),\ldots,d_Q(y,w)].\tag{12}
$$

测度 $\mu$ 设定各预测位置的相对重要性：对标量 QoI 集合，它是用户指定的重要性权重（各分量上的离散概率质量）；对离散化的场，它是近似 $\mathcal X_{\mathrm{qoi}}$ 上积分的求积规则。两种情形下 $\mu$ 在计算上都由预测权重向量 $\{\gamma_j\}_{j=1}^{Q}$（$\gamma_j\ge0$、$\sum_j\gamma_j=1$）表示，把 $\mu$ 离散到 $Q$ 个受体位置；均匀权重 $\gamma_j=1/Q$ 恢复分量上的平均。

由于设计时数据尚未观测，第 3 层在数据边缘分布 $p(y\mid w)$ 上聚合 $r(y,w)$。复合三个阶段即得完整的风险感知目标导向设计目标：

$$
U(w)=\underbrace{\mathcal R^{\mathrm{data}}_{p(y\mid w)}}_{\text{level 3：数据风险}}\left[\underbrace{\mathcal R^{\mathrm{QoI}}_\mu}_{\text{level 2：QoI 风险}}\left[\underbrace{\left(\mathcal D^{\mathrm{pf}}_{p(\theta\mid y,w)}[q_j(\theta)]\right)_{j=1}^{Q}}_{\text{level 1：偏差}}\right]\right],\tag{13}
$$

我们在 $w\in\Delta_K$ 上最小化它。由于每个阶段都由偏差或风险度量构成，$U(w)$ 非负，且仅当不存在后验不确定性时为零。下面三个小节依次处理各阶段，给出其算子、在运行示例上的作用，以及它提出的偏好引出问题。

### 3.3 第 1 层：后验推前的偏差

第 1 层对标量 QoI 分量的后验推前应用偏差度量，产生（11）中的偏差 $d_j(y,w)$。推前（以及 $d_j$）依赖观测数据 $y$，且只捕获推前的散布而非其均值。在运行示例（第 2.4 节）中，各分量 $q_j(\theta)=\exp(\psi_j^\top\theta)$ 的后验推前为一元对数正态；应用 $c=1$ 的安全裕度偏差（即标准差）对每个数据集返回一个标量。由于推前随数据变化，该标量在不同实现间变化，形成图 5 中的偏差曲面。由于预测方向 $\psi_j=\psi(x_j)$ 随预测位置 $x_j$ 连续变化（第 2.4 节），偏差在分量间平滑变化，故尽管曲面由有限个分量拼成，看起来仍平滑。

**图 5**：运行示例第 1 层标准差度量的图示。左：数据 $y^{(1)}$ 与 $y^{(M)}$ 两个实现下联合后验密度 $p(q_j,\theta\mid y^{(m)},w)$，沿 QoI 曲线集中。右：在 QoI 分量（横轴）与数据实现（纵轴）上插值得到的标准差曲面，两个数据实现以水平线标出。

偏差度量的选择编码实践者如何评价散布，并改变图 5 右面板中的曲面。标准差对称，适合两个方向的偏离同等重要的情况；当只有一个方向带来后果时（例如污染物浓度只在超过阈值时才危险），更偏好对上尾加权更重的 AVaR 或熵偏差。因此最小化所得目标即选择最能减小散布的设计，并按实践者偏好对各方向的偏离加权。

### 3.4 第 2 层：QoI 分量间的聚合

对向量值或场值 QoI $q=(q_1(\theta),\ldots,q_Q(\theta))$，第 1 层为每个分量产生一个偏差，第 2 层用预测域风险度量 $\mathcal R^{\mathrm{QoI}}_\mu$ 把它们聚合为（12）中的 $r(y,w)$。在运行示例上，第 2 层把偏差曲面的预测位置轴压缩为曲线 $r(y,w)$，每个数据集一个标量。图 6 给出同一曲面上两种风险度量选择下的该曲线：二者都随数据上升，但汇总偏差剖面的方式不同——$\mathrm{AVaR}_\alpha$ 只对表现最差的那部分预测位置取平均，而熵度量以指数方式把整个剖面向其上尾重新加权。

**图 6**：第 2 层 QoI 风险度量：固定设计 $w$ 下在 QoI 分量间聚合偏差 $d_j$。左：图 5 的偏差曲面，标出两个数据实现（水平虚线）。中：两个数据实现的偏差剖面 $d_j$，水平线标出由 $\mathrm{AVaR}_\alpha$ 与熵风险度量给出的标量 $r(y,w)$。右：所得 $r(y,w)$ 作为数据 $y$ 的函数，标出两个实现。

在第 2 层指定 $\alpha\in[0,1)$ 提供了控制“平均预测不确定性”与“极端预测不确定性”相对权重的可调机制：I-最优（$\alpha=0$）恢复空间平均的不确定性，而增大 $\alpha$ 更重地惩罚极端不确定性——若存在关键位置（如下游人口中心，或靠近敏感基础设施的传感器），预测性能差在那里后果不成比例地高，这一点可能高度相关。当 $\alpha$ 从 0 变到 1 时，目标从平均扫向单个最坏分量。若第 1 层用标准差，这正是 I-最优与 G-最优之间的经典插值 [11]。

### 3.5 第 3 层：数据实现间的聚合

由于最优设计在采集数据 $y$ 之前就已确定，第 2 层聚合的输出 $r(y,w)$ 在边缘分布 $p(y\mid w)$ 下本身是随机的。第 3 层用风险度量对其聚合，得到标量设计目标：

$$
U(w):=\mathcal R^{\mathrm{data}}_{p(y\mid w)}[r(y,w)].\tag{14}
$$

在运行示例上，$r$ 的诱导分布右偏：多数数据集给出中等偏差，但一小部分不利结果给出不成比例大的 $r$。图 7 给出该分布上的两种第 3 层选择：均值对所有数据集同等加权，而 $\mathrm{AVaR}_\beta$ 集中于右尾。

**图 7**：第 3 层数据风险度量作用于第 2 层聚合 $r$（$y\sim p(y\mid w)$）的概率密度。标准贝叶斯 OED 目标取平均（风险中性），而 $\mathrm{AVaR}_\beta$（$\beta=0.9$）对不利的大值加权高于小值。

第 3 层度量的选择回答了实践者愿意承受多大可能实现的不利数据集暴露。若在可能数据集上平均而言正确即可接受，利用均值的标准贝叶斯 OED 方法是自然选择；但若实践者希望防范不利数据集、即便牺牲平均性能，$\mathrm{AVaR}_\beta$ 只在最差 $(1-\beta)$ 部分数据集上对 $r(y,w)$ 取平均，故目标度量最不利结果下剩余的不确定性，最小化它因而选择在最不利数据集下（而非平均意义上）最能降低不确定性的设计。相反，安全裕度 $\mathcal R^{\mathrm{sm}}_c$ 提供了具有工程解释的替代：当 $c$ 覆盖均值以上所选个数的标准差时设计以高概率可接受，$c$ 越大越保守。

**当偏好无法达成一致时**：实践中多个利益相关者可能持有相互竞争的风险偏好，或单个利益相关者对其风险态度确实不确定。与其承诺单一设定，不如考察最优设计对偏差与风险度量选择的敏感程度，从而识别哪些选择实质影响设计。我们在第 5.4 节用一种成本有效的方法演示：量化各层级与各风险度量对推荐实验的改变程度。

## 4. 估计与优化

设计目标 $U(w)=\mathcal R^{\mathrm{data}}_{p(y\mid w)}\left[\mathcal R^{\mathrm{QoI}}_\mu\left[\mathcal D^{\mathrm{pf}}_{p(\theta\mid y,w)}[q(\theta)]\right]\right]$ 嵌套三个操作：对每个 QoI 分量在 $p(\theta\mid y,w)$ 上的内层后验偏差 $\mathcal D^{\mathrm{pf}}$（第 1 层）、在 QoI 分量间聚合的风险度量 $\mathcal R^{\mathrm{QoI}}$（第 2 层）、以及在数据边缘 $p(y\mid w)$ 上的外层风险度量 $\mathcal R^{\mathrm{data}}$（第 3 层）。对一般非线性模型与先验，第 1 层与第 3 层是针对无闭式表达的分布的期望，故必须用采样近似；相反，第 2 层作用于已采样的逐分量偏差，无需额外前向模型评估。本节发展在此基础上估计与最小化 $U(w)$ 的计算机制。尽管第 3 节的三层框架对似然或设计空间不加结构限制，下面发展的估计器与梯度表达式专门针对第 2.4 节的加权高斯似然与单纯形设计参数化；其他高斯观测模型或连续设计空间的类似推导可行但本文不展开。

### 4.1 双环估计器

评估风险感知目标需要在三个层级各用一个求积规则。我们用一般节点与权重写出每个规则，以便任何求积策略（如蒙特卡洛、准蒙特卡洛、稀疏网格等）都可替换而不修改算法。我们聚焦第 1 层与第 3 层，因为第 2 层规则只是把实践者给定的节点与权重作为预测域上的加权和施加。

**外环求积：数据实现**：为生成可能数据 $y\sim p(y\mid w)$，我们从模型本身生成可能数据集：从先验抽取参数、经前向模型推送，并加入第 2.1 节加权高斯观测似然的测量噪声。该模型中似然由噪声协方差决定，设计通过在各候选间分配测量预算进入。基线协方差为对角 $\Gamma=\operatorname{diag}(\sigma_{\varepsilon,1}^2,\ldots,\sigma_{\varepsilon,K}^2)$，权重 $w_k$ 缩放候选 $k$ 处的精度，故有效协方差为 $\Gamma_{\mathrm{eff}}(w)=\operatorname{diag}(\sigma_{\varepsilon,k}^2/w_k)$，如运行示例（6）。所得对数似然为

$$
\log p(y\mid\theta,w)\propto-\frac{1}{2}\sum_{k=1}^{K}\frac{w_k}{\sigma_{\varepsilon,k}^2}\left(y_k-f_k(\theta,w)\right)^2.\tag{15}
$$

权重 $w_k$ 越大，第 $k$ 项越尖锐；$w_k=0$ 则把候选 $k$ 从实验中移除。为支持基于梯度的设计优化，我们用重参数化技巧生成数据。取外环求积节点与权重 $\{(\theta^{(m)},\omega_m^{\mathrm{out}})\}_{m=1}^{M}$，把每个 $\theta^{(m)}$ 作为 $p(\theta,\varepsilon)$ 的联合样本抽取，并把每个数据实现构造为

$$
y_k^{(m)}=f_k(\theta^{(m)},w)+\frac{\sigma_{\varepsilon,k}}{\sqrt{w_k}}\varepsilon_k^{(m)},\qquad k=1,\ldots,K,\tag{16}
$$

其中 $\varepsilon^{(m)}\sim\mathcal N(0,I)$ 在 $w$ 变化时保持固定。这把设计依赖从采样分布移入确定性变换：一旦 $\theta^{(m)}$ 与 $\varepsilon^{(m)}$ 固定，$y^{(m)}(w)$ 就是 $w$ 的可微函数，从而可计算梯度。后续表达式中我们略去 $w$ 参数而简写 $y^{(m)}$，仅当设计依赖是重点时（如第 4.3 节）才恢复。

**内环求积：经重要性权重的后验**：第 1 层偏差是后验 $p(\theta\mid y^{(m)},w)$ 下的期望，而它对每个外环数据集 $y^{(m)}$ 都不同。为每个 $y^{(m)}$ 从头重采样后验会使内环代价随外环样本数增长——这种开销正是朴素双环估计器难以承受的原因。为避免这一点，我们抽取一组先验样本，并用重要性权重把它们向每个数据集的后验重新加权，使同一批内环样本可在所有外环数据样本上复用。

为计算 QoI 分量 $q_j(\theta)$ 的第 1 层偏差（第 2.2 节），我们从先验 $\pi$ 抽取内环求积节点与权重 $\{(\theta^{(n)},\omega_n^{\mathrm{in}})\}_{n=1}^{N}$，用它们估计归一化常数（证据）与 $q_j$ 关于后验的矩。例如把后验标准差经自归一化重要性采样表示为先验期望：

$$
\mathrm{Std}_{p(\theta\mid y,w)}[q_j]=\left[\frac{\mathbb E_{\pi(\theta)}\left[q_j^2(\theta)p(y^{(m)}\mid\theta,w)\right]}{p(y^{(m)}\mid w)}-\left(\frac{\mathbb E_{\pi(\theta)}\left[q_j(\theta)p(y^{(m)}\mid\theta,w)\right]}{p(y^{(m)}\mid w)}\right)^2\right]^{1/2}.\tag{17}
$$

我们用**同一**求积规则 $\{(\theta^{(n)},\omega_n^{\mathrm{in}})\}$ 计算分子矩与分母中的证据 $p(y^{(m)}\mid w)$。这把（17）压缩为由自归一化重要性权重支配的和之比：

$$
\tilde w_n^{(m)}(w)=\frac{\omega_n^{\mathrm{in}}p(y^{(m)}\mid\theta^{(n)},w)}{\sum_{n'=1}^{N}\omega_{n'}^{\mathrm{in}}p(y^{(m)}\mid\theta^{(n')},w)},\tag{18}
$$

从而把名义上 $N\times M$ 的采样问题变为 $N+M$ 的问题。代价是分子与分母估计现在相关——使该比率成为真实后验方差的有偏估计——但偏差在 $N\to\infty$ 时消失，且估计器对本文讨论的所有风险感知效用保持渐近一致。

### 4.2 估计算法

算法 1 把外环数据实现与内环重要性权重组装为设计目标估计：它遍历数据实现、复用共享内环规则计算每个 QoI 分量的后验偏差，并先在各分量间（第 2 层）、最后在数据间（第 3 层）聚合。与这些层级对应的算子 $\mathcal D^{\mathrm{pf}}$、$\mathcal R^{\mathrm{QoI}}$、$\mathcal R^{\mathrm{data}}$ 各自通过代入第 3.1 节族中的表达式实现；第 2 层聚合按第 3.1 节引入的预测权重 $\{\gamma_j\}_{j=1}^{Q}$（即 $\mu$ 的离散化）对 QoI 分量加权。算法中记号 $\{\hat d_j^{(m)},\gamma_j\}_j$ 表示原子为 $\hat d_j^{(m)}$、权重为 $\gamma_j$ 的经验加权分布；类似地第 3 层为 $\{\hat r^{(m)},\omega_m^{\mathrm{out}}\}_m$。每个风险算子恰好消费这种表示，可在不触碰算法其他部分的情况下替换。由于所有外环与内环样本只生成一次并在各设计评估间保持固定，算法返回 $w$ 的确定性函数——这一性质在第 4.3 节计算梯度时被利用。

继续运行示例（偏差度量为标准差 $\mathcal D^{\mathrm{pf}}=\mathrm{Std}$），把重要性权重 $\tilde w_n^{(m)}(w)$ 代入（17）可吸收证据因子，得到可计算的逐分量形式

$$
\hat d_j^{(m)}(w)=\left[\sum_{n=1}^{N}\tilde w_n^{(m)}(w)q_j(\theta^{(n)})^2-\left(\sum_{n=1}^{N}\tilde w_n^{(m)}(w)q_j(\theta^{(n)})\right)^2\right]^{1/2},\tag{19}
$$

它对每个分量复用共享权重 $\tilde w_n^{(m)}(w)$ 与缓存的 QoI 值 $q_j(\theta^{(n)})$，无需额外前向模型评估。证据 $\hat p(y^{(m)}\mid w)$ 作为中间量保留，因为它在第 4.3 节的梯度中被复用。

算法 1 的设计使改变实践者风险偏好变得直接。AVaR 算子是唯一例外：它在原始样本上非光滑，故用光滑代理 $\widehat{\mathrm{AVaR}}_{\alpha,\delta}$ 替代——通过在 AVaR 的对偶表示中加入惩罚项、并在 $\delta\to\infty$ 时恢复 $\mathrm{AVaR}_\alpha$ 得到 [9,10]（附录 D.4）；其他风险度量对经验权重直接可微。附录 C 给出对照附录 B 闭式设计目标表达式验证嵌套求积估计器收敛性的研究。

**算法 1**　三层风险感知目标导向 OED 设计目标

**输入**：设计 $w\in\Delta_K$；外环求积 $\{(\theta^{(m)},\varepsilon^{(m)},\omega_m^{\mathrm{out}})\}_{m=1}^{M}$（$\theta^{(m)}\in\mathbb R^D$、$\varepsilon^{(m)}\in\mathbb R^K$）；内环求积 $\{(\theta^{(n)},\omega_n^{\mathrm{in}})\}_{n=1}^{N}$；预测权重 $\{\gamma_j\}_{j=1}^{Q}$；层级选择 $\mathcal D^{\mathrm{pf}}$、$\mathcal R^{\mathrm{QoI}}$、$\mathcal R^{\mathrm{data}}$。
**输出**：设计目标估计 $\hat U(w)$。
1: // 数据生成（外环样本）
2: 评估前向模型：$G_{:,m}\leftarrow f(\theta^{(m)},w)$，$m=1,\ldots,M$；// $G\in\mathbb R^{K\times M}$
3: 噪声缩放（对角）：$E_{k,m}\leftarrow(\sigma_{\varepsilon,k}/\sqrt{w_k})\varepsilon_k^{(m)}$，对所有 $k,m$；// $E\in\mathbb R^{K\times M}$
4: 数据矩阵：$Y\leftarrow G+E$；置 $y^{(m)}\leftarrow Y_{:,m}$；
5: // 先验空间预计算（可跨设计复用）
6: 评估 QoI：$Q_{j,n}\leftarrow q_j(\theta^{(n)})$，对所有 $j,n$；// $Q\in\mathbb R^{Q\times N}$
7: // 外环循环
8: **for** $m=1,\ldots,M$ **do**
9: 　对数似然：$\ell_{mn}\leftarrow\log p(y^{(m)}\mid\theta^{(n)},w)$，$n=1,\ldots,N$；
10: 　证据估计：$\hat p(y^{(m)}\mid w)\leftarrow\sum_{n=1}^{N}\omega_n^{\mathrm{in}}e^{\ell_{mn}}$；
11: 　重要性权重：$\tilde w_n^{(m)}(w)\leftarrow\omega_n^{\mathrm{in}}e^{\ell_{mn}}/\hat p(y^{(m)}\mid w)$；// 共享内环规则
12: 　偏差：$\hat d_j^{(m)}\leftarrow\mathcal D^{\mathrm{pf}}\left[\{\tilde w_n^{(m)}(w),Q_{j,n}\}_n\right]$，$j=1,\ldots,Q$；
13: 　第 2 层聚合：$\hat r^{(m)}\leftarrow\mathcal R^{\mathrm{QoI}}\left[\{\hat d_j^{(m)},\gamma_j\}_j\right]$；
14: **end for**
15: 第 3 层聚合：$\hat U\leftarrow\mathcal R^{\mathrm{data}}\left[\{\hat r^{(m)},\omega_m^{\mathrm{out}}\}_m\right]$；
16: **return** $\hat U$

### 4.3 梯度计算与优化

由于所有外环与内环样本只抽取一次并在各设计评估间固定，算法 1 定义真实设计目标 $U(w)$ 的确定性近似 $\hat U(w)$。具体地，算法返回样本平均近似（SAA），其中 $w$ 只通过重参数化数据（16）与重要性权重（18）进入，二者都对 $w$ 可微，故 $\hat U$ 也可微——除 AVaR 内的非光滑指示函数外处处可微，该处我们如下文所述作光滑化。因此设计问题归结为连续、光滑优化

$$
\hat w^\star=\arg\min_{w\in\Delta_K}\hat U(w),\tag{20}
$$

我们用 Scipy 的信赖域内点算法求解。以这种方式用梯度求解 $w$ 避免了一些 OED 方法对候选传感器集的组合搜索。还需注意（16）在 $w_k=0$ 处奇异，故优化中强制 $w_k>10^{-6}$（$\forall k$）。

梯度 $\nabla_w\hat U$ 可通过算法 1 的自动微分获得：这是最简单、也是我们推荐的快速原型路线，但每个优化器步都要遍历 $M\times N$ 双重求和的完整计算图。梯度也有闭式表达，因为 $w$ 只在两处进入估计器：重参数化数据（16）与重要性权重（18）。该闭式表达复用前向传播中已缓存的数量（尤其对数似然 $\ell_{mn}$），故无需额外前向模型评估，代价仅为目标函数评估的常数倍。附录 D 推导该闭式梯度（我们在实验中使用它），以及光滑 AVaR 代理 $\widehat{\mathrm{AVaR}}_{\alpha,\delta}$（其偏差在 $\delta\to\infty$ 时消失）。

## 5. 数值实验

本节展示该框架的两个推论。第一，单一风险聚合器选择可连续地在 I-最优与 G-最优之间插值。第二，在现实的基于 PDE 的逆问题中，所得设计在性质上彼此不同、也与 KL 基线不同。当观测几何与 QoI 结构失配时，参数信息量大的传感器与预测信息量大的传感器往往不同，故为参数估计优化的设计在改善预测不确定性方面可能并不优于随机设计。

尽管三层构造（13）是通用的，每个实验只使用表 2 所列设计目标的一个子集，选取以反映风险偏好范围：从风险中性（U1：std/mean/mean），经 QoI 层与数据层风险厌恶（U2—U4），到以非对称偏差度量替换标准差的第 1 层变体（U5：entropic/mean/mean）；安全裕度变体 U6（std/mean/mean + $c\cdot$Std）仅出现在附录的估计器收敛性研究中。期望信息增益（KL）作为面向参数的基线纳入；KL 不是（13）的实例，因为它面向完整参数后验而非推前，但它在全文中用作比较基准。

**表 2　本文使用的命名设计目标**（按原表逐格转录；每个目标对应三层框架（13）中偏差、QoI 风险与数据风险的具体选择；KL 目标列出以作比较，但不是本框架的实例）

| 标签 | 第 1 层（$\mathcal D^{\mathrm{pf}}$） | 第 2 层（$\mathcal R^{\mathrm{QoI}}$） | 第 3 层（$\mathcal R^{\mathrm{data}}$） |
| --- | --- | --- | --- |
| U1 | std | mean | mean |
| U2 | std | AVaR$_\alpha$ | mean |
| U3 | std | mean | AVaR$_\beta$ |
| U4 | std | AVaR$_\alpha$ | AVaR$_\beta$ |
| U5 | entropic | mean | mean |
| U6 | std | mean | mean $+c\cdot$Std |
| KL | 期望信息增益（面向参数的基线） | — | — |

### 5.1 I–G 插值

以下实验表明第 2 层的 AVaR 参数 $\alpha$ 提供经典 I-最优与 G-最优设计之间的连续插值，所用目标为 U2（std/AVaR$_\alpha$/mean；见表 2）。为使第 2 层聚合具有多变量目标，我们使用第 2.4 节的对数正态运行示例，把其 QoI 从标量扩展为向量：在 $[-2/3,2/3]$ 上等距放置 $Q=100$ 个预测位置并评估 QoI 映射（7）。观测模型、基、先验与噪声协方差见附录 C。在第 2 层对预测位置均匀加权 $\gamma_j=1/Q$，使 AVaR 扫描的两个端点与经典准则重合：$\alpha=0$ 时 $\mathrm{AVaR}_0$ 退化为期望，目标在预测域上平均后验偏差，恢复 I-最优；而当 $\alpha\to1$（此处取 $\alpha_{\max}=0.95$）时 $\mathrm{AVaR}_\alpha$ 趋近 QoI 分量上的最大值，近似 G-最优。因此在这些端点之间扫描 $\alpha$ 即勾勒出从平均情形到最坏情形设计的路径。此外，使用精确 AVaR 或我们数值结果所用的光滑 AVaR 时，所得目标在 $\alpha\in[0,1)$ 上连续。这些数值结果有理论支撑：第一，附录 F 证明光滑 $\mathrm{AVaR}_\alpha$ 泛函在 $\alpha\in[0,1)$ 上连续；第二，由于第 3 层是数据上的期望，该连续性（在对第 2 层输出的温和可积性假设下）传递为完整设计目标关于 $\alpha$ 的连续性。该论证直接推广到经典 $\mathrm{AVaR}_\alpha$，其在 $\alpha\in[0,1)$ 上的连续性可由与附录 F 类似论证得到。

对每个 $\alpha$，我们求解设计问题

$$
w^\star(\alpha)=\arg\min_{w\in\Delta_K}U_\alpha(w),\tag{21}
$$

其中 $U_\alpha$ 是在 AVaR 水平 $\alpha$ 处评估的 U2 设计目标。扫描按 $\alpha$ 升序延续（continuation），对 MC 与精确优化同样施加：最小水平从均匀设计初始化，之后每个水平从上一网格点的最优设计初始化。扫描使用 20 个等距水平 $\alpha\in[0,\alpha_{\max}]$；MC 优化用 $M=N=4000$ 个样本，精确优化用 $10^4$ 个外环样本评估解析目标。在每个最优设计 $w^\star(\alpha)$ 处，我们评估三个目标以检验连续性：(i) 匹配目标 $U_\alpha(w^\star(\alpha))$，在与该设计优化相同的 AVaR 水平处评估；(ii) I-最优目标 $U_0(w^\star(\alpha))$；(iii) G-最优代理 $U_{\alpha_{\max}}(w^\star(\alpha))$。按构造，匹配曲线与 I-最优曲线必须在 $\alpha=0$ 处重合，匹配曲线与 G-最优曲线必须在 $\alpha=\alpha_{\max}$ 处重合。

图 8 给出曲线 (i)—(iii) 随 $\alpha$ 变化的行为。如预期，$U_\alpha(w^\star(\alpha))$ 在 $\alpha=0$ 处对应 I-最优目标，在 $\alpha=\alpha_{\max}$ 处对应 G-最优代理。对 $0<\alpha<1$，$U_\alpha(w^\star(\alpha))$ 单调递增，在两个经典最优之间提供连续的非线性插值。尽管目标平滑变化，底层设计并不平滑：图 8 右面板显示最优权重在整个 $\alpha$ 扫描中差异显著。传感器 9 对所有 $\alpha$ 都给出非零权重，而其他所有传感器在某些 $\alpha$ 处权重为零。对多数传感器位置，权重在整个 $\alpha$ 范围内（连续与不连续地）变化，凸显风险偏好可对所得设计产生实质影响。权重的跳变源于设计目标存在多个局部极小，其目标值几乎相同但权重构型不同；当 $\alpha$ 越过阈值时，最小化者从一个这样的吸引域移到另一个，故尽管最优目标值本身连续变化，设计会突然改变。

**图 8**：第 2.4 节运行示例上的 I–G 最优性插值。左：最优设计 $w^\star(\alpha)$ 处设计目标值随 $\alpha$ 的变化。红色标记：匹配目标 $U_\alpha(w^\star(\alpha))$ 的蒙特卡洛估计。蓝色虚线：I-最优目标 $U_0(w^\star(\alpha))$。绿色点划线：G-最优代理 $U_{\alpha_{\max}}(w^\star(\alpha))$。右：最优传感器（纵轴）权重随 $\alpha$ 的变化。

### 5.2 对流—扩散测试问题

其余实验都使用同一个 PDE 约束的传感器布局问题（代表地表水质监测），先在此描述再看结果。实验目标是：当未知空间分布的污染物在上游水道中释放并被输运至下游受体时，通过布置有限数量传感器来预测将到达一组下游受体的污染物浓度，从而为该预测提供信息。

**前向模型**：污染物浓度 $c(x,t;\theta)$ 由对流与扩散输运，在单位正方形 $\Omega=[0,1]^2$ 上按

$$
\partial_tc+u\cdot\nabla c-D\Delta c=s(x;\theta)\tag{22}
$$

演化，源项为 $s(x;\theta)$、扩散率为 $D$，左右边界为 Robin 条件 $D\partial_nc+0.1c=0$，其余边界为零通量 Neumann 条件，初始条件为零；时间积分采用 Crank–Nicolson，$\Delta t=0.25$，直到最终时刻 $T=4$。我们采用对流占优区间 $D=0.005$，此时示踪剂沿速度场设定的狭窄通道行进。区域（图 9）包含三个矩形障碍物，把污染物从左输运到右的定常速度场 $u(x)$ 通过一次求解不可压缩 Navier–Stokes 方程得到，采用 Taylor–Hood $P_2/P_1$ 有限元（入口剖面 $u_x=[x_2(1-x_2)]^{3/2}$，壁面与障碍物无滑移，出口无应力，运动粘度 $\nu=1/Re=0.08$、$Re=12.5$）。障碍物产生回流区与尾流，故从源区到下游受体的输运路径并不平凡；所得速度场见图 9 右面板。

**图 9**：单位正方形上带三个矩形障碍物的对流—扩散基准设置。左：对数正态源场 $s(x;\theta)$ 的代表性实现，支撑在左侧条带 $[0,0.25]\times[0,1]$、其余为零。右：定常 Navier–Stokes 速度场 $u(x)$ 的流线叠加在速度幅值 $|u|$ 的等值线图上，灰色障碍物周围可见回流区。

**贝叶斯逆问题**：以下实验中我们把源视为不确定的，并从传感器数据推断它。我们把源建模为对数正态随机场 $s(x;\theta)=\exp\left(\sum_{k=1}^{D}\sqrt{\lambda_k}\phi_k(x)\theta_k\right)$，来自平方指数高斯过程的截断 Karhunen–Loève 展开（保留 $D=10$ 项、相关长度 $0.1$、标准差 $0.3$），支撑在左侧条带 $[0,0.25]\times[0,1]$。我们给系数 $\theta\in\mathbb R^D$ 赋独立标准高斯先验；所得源场的代表性实现见图 9 左面板。随后用第 2.1 节的似然按贝叶斯公式把该先验更新为 $\theta$ 上的后验，观测为图 10 传感器位置处的示踪剂浓度测量，并用前向模型（22）预测这些测量；测量受标准差 0.1 的独立同分布高斯噪声污染。

**目标导向预测**：贝叶斯推断降低源参数 $\theta$ 的不确定性，但必须量化这种降低对下游预测的影响。因此我们把后验经一个 QoI 映射推前，该映射返回最终时刻 $T=4$、图 10 中 $Q$ 个受体位置处的浓度，即 $q_j(\theta)=c(x_j^{\mathrm{pred}},T;\theta)$，受体位于障碍物下游（$x_1\ge5/7$）；设计旨在降低该推前中的不确定性。

**设计问题**：面向参数与目标导向的解都依赖所采集数据，故传感器布局决定推断与预测的信息量。因此我们用本文的 OED 表述在图 10 的 $K$ 个候选传感器位置上优化测量权重。候选位置是网格的 space-filling 子集，由 maximin 准则选出。为确定最优权重 $w\in\Delta_K$，我们用第 4 节的估计器在单纯形上求解设计问题（20）。

为求解 OED 问题，定常 Navier–Stokes 速度在开始时计算一次，并对所有先验样本复用，故每个样本的前向求解只涉及由采样源场驱动的瞬态对流—扩散求解。不过每次这样的求解仍然昂贵。算法 1 的外环与内环样本与 $w$ 无关（第 4.2 节），因此我们并行预生成由 $(M+N)$ 个浓度场样本构成的缓存数据集，然后在后续各小节中为每次设计优化与交叉评估复用它，不再做额外 PDE 求解。在此设置下，我们可考察风险偏好如何塑造最优设计，以及优化一个未能充分反映自身偏好的目标会带来什么后果。

### 5.3 风险偏好塑造设计

本小节研究不同风险偏好对应最优设计的稳定性。具体地，我们针对表 2 中面向参数的 KL 基线，优化五个目标导向设计目标 U1—U5，使用 SciPy 的 trust-constr 算法、线性单纯形约束、收敛容差 $\mathrm{gtol}=10^{-8}$，并以均匀分配 $w=1/K$ 为起点。所有设计目标都从同一缓存数据集估计，$M=N=4000$ 个外环与内环样本；QoI 层与数据层的 AVaR 水平均为 $\alpha=\beta=0.9$，U5 的熵偏差取 $\lambda=0.9$。

为衡量各优化设计对用于构造它的特定模拟数据集的敏感性，我们在缓存数据集的 30 个独立自助（bootstrap）重采样（有放回，样本量 $(M,N)$）上重复优化。所得 30 个设计构成优化器 $w^\star$ 作为训练数据函数的经验分布，我们在图 11 中以逐传感器箱线图汇总。为便于阅读，这里只展示均值优化权重在至少一个设计目标下超过显示阈值 $0.145$ 的五个候选（其余 45 个候选在每个目标下都低于该阈值而被省略；该阈值是绘图选择、无统计含义）。每个设计目标（包括 KL 基线）几乎把所有重量集中在 $K=50$ 个候选中至多五个上。我们预期此处观察到的稀疏性由与渐近频率派 OED [16] 中类似机制诱导：具体地，把 Carathéodory 定理应用于半正定 Fisher 信息矩阵的凸集，可把任何最优设计测度的支撑大小界定为至多 $\frac{1}{2}D(D+1)$ 个原子；此外当候选集张成 $\mathbb R^D$ 时，实践中只有 $D$ 个非零权重就足够。

各设计目标的差异在于：它们在这种稀疏支撑内集中得有多紧、以及在五个选中位置之间如何分配权重，并把最大权重分配给不同传感器。图 11 中，按自助样本的中位权重，U1、U2、U3、U4、U5 的主导选择都是传感器 26——它位于第一个障碍物上方、源条带下游不远的流动上支（见图 10）；但 U1 反而把最大权重放在传感器 38。目标导向设计目标对传感器 26 分配的最大与最小权重之差超过 $0.4$。因此目标选择对主测量站点位置有一阶影响，而不只影响剩余预算如何分配。对清晰首选传感器的唯一例外是 U5：其在传感器 38 处的自助箱（约 0.34—0.40）与 U1 在同一传感器处的箱重叠，且其传感器 26 权重（约 0.41）仅略大。对 U5 而言，在该样本量下传感器 26 与 38 之间的选择确实不确定。

设计目标在激活哪些次级传感器上也存在分歧。在传感器 6 处，U1、U2、U5 的权重远高于均匀水平 $1/K$，而 U3、U4 与 KL 处于或低于该水平：一些目标导向设计目标激活传感器 6，另一些则使其实际失活。传感器 34 处可见类似但更小的不对称性。激活模式与尾部厌恶相关：强尾部厌恶的 U3 与 U4 权重集中得最窄。相对于这些目标间差距，自助箱较窄，故差异不能归因于训练集采样变异。

作为一个整体看，五个目标导向设计目标把权重集中在传感器 26 与 38，并在其他位置只放小权重。KL 基线的行为偏离这一模式：其权重分散在四个传感器 $[38,8,6,34]$ 上，每个的中位权重都在 $[0.15,0.22]$ 区间（图 11）。其中只有传感器 38 与目标导向的主选择重叠；传感器 8、6、34 在 U3 与 U4（最厌恶尾部的目标导向效用）下都位于均匀线以下，在其他目标下处于或略高于均匀线。相反，传感器 26 从目标导向效用获得最多约 $0.72$ 权重，却从 KL 获得几乎为零。KL 设计的自助变异也明显小于目标导向设计，在每个活跃传感器处箱都更窄；这反映参数信息准则在重采样下比驱动风险厌恶设计的尾部敏感量估计得更稳定。

这些现象背后的机制是：KL 选择那些观测能约束源参数的传感器，而不论这些参数方向是否经对流—扩散算子传播到下游受体。因此只有当观测几何恰好使两种“信息”概念对齐时，参数信息传感器与预测信息传感器才重合；在对流占优区间它们并不重合；附录 E 表明当输运更具扩散性时这种对齐会恢复。

### 5.4 为错误目标优化的代价

上一小节表明最优设计在各风险感知目标间不同。为量化这些差异对预测不确定性的影响，我们对设计做交叉评估：具体地，记 $w_j^\star$ 为最小化设计目标 $U_j$ 的设计，我们计算 $U_i(w_j^\star)$，即目标 $U_i$ 在目标 $U_j$ 最优处的取值。

图 12 每个面板给出 $U_i(w)$ 在大量均匀随机单纯形设计上的分布，并绘出全部六个优化设计处 $U_i(w_j^\star)$ 的竖直标记，从而可直接读出 $j\neq i$ 时的退化程度。KL 最优设计 $w_{\mathrm{KL}}^\star$ 在任一六个目标导向设计目标下评估时都接近相应随机设计分布的有利边缘——与最好随机设计相当，但仍距相应目标导向最优约一个直方图宽度。反向交叉评估从 KL 一侧给出相同定性图景：六个目标导向设计 $w_j^\star$ 在 KL 设计目标下评估时，与单纯形上的随机分配几乎无法区分。这里，为参数优化得到的预测性能不优于随机设计，而为预测优化得到的参数性能也不优于随机设计。这些结果凸显了在指定 OED 目标时直接面向推断目标的重要性。

除凸显预测导向策略的重要性外，图 12 的结果还凸显了风险如何编码进面向预测的目标同样重要。虽然每个目标导向设计 $w_i^\star$ 在 $U_j$（$j\neq i$）下评估都优于 $U_j$ 下所有随机设计，但这些目标值与最优 $U_i(w_i^\star)$ 之间存在显著差异，某些情形差距达 20—25%。值得注意的是，这些差异小于“参数 vs 目标导向”的差距，表明在此情形下直接面向决策 QoI 影响最大。这是因为所有目标导向目标都面向预测质量、只在偏差如何聚合上不同；因此它们彼此共享的结构多于它们各自与面向参数 KL 目标的共享结构，故为某一风险偏好调优的风险感知设计在另一偏好下仍保留部分价值。

虽然错误指定目标类别（参数 vs 预测）对设计影响最大，我们认为风险偏好应始终在可能时被引出并纳入。当难以引出或难以达成一致时，实践者应转而研究设计对风险偏好的敏感程度。敏感性可用本节程序度量：为每个候选目标优化设计并比较它们。当前向模型运行成本高时，该敏感性可廉价计算，因为所有设计都在同一缓存样本集上优化与比较，无需额外仿真。

结合图 11 的自助传感器权重分布与图 12 的随机设计直方图，这两张图给实践者两个诊断——最优设计的训练数据敏感性与“参数 vs 预测”失配——二者都来自同一缓存数据集，故可在承诺某一实验设计策略之前获得，且除拟合原估计器所用之外无需任何前向求解。

我们提出的诊断凸显了参数导向与预测导向目标之间差异、以及各风险偏好之间差异的相对重要性。不过这些差异依问题而定；附录 E 使其具体化：随着扩散率 $D$ 增大重复该分析表明，当输运从强对流占优区间转向扩散占优区间时，风险偏好的影响减弱——信息区域变宽，目标导向设计与 KL 设计趋于一致，错误指定目标类别的“定性”代价软化为有界的定量误差。附录还说明如何用最大余数规则把在任一物理区间、用任一目标计算的设计转换为整数测量预算，该规则保持连续设计的权重层级。这弥合了上文分析的连续最优与实践者最终部署的离散分配之间的差距。

**图 10**：单位正方形上 $K=50$ 个候选传感器位置（白色圆圈、带编号）与 $Q=20$ 个 QoI 受体位置（橙色方块、带编号）的布局；三个灰色方框为流动障碍物。候选传感器是避开障碍物边界的 maximin 分布内部网格点；受体是下游条带 $x_1\ge5/7$ 内的 maximin 分布点，与候选传感器不相交。为便于读取传感器标签，$x$ 轴被拉伸。

**图 11**：对流占优区间下 30 个重采样训练集上最优传感器权重的自助分布。显示的是均值权重在至少一个设计目标下超过显示阈值 $0.145$ 的五个传感器位置（其余 45 个候选为可读性省略）。箱线图按传感器索引（横轴）分组、按设计目标着色，均匀分配 $1/K$ 以水平虚线标出。

**图 12**：随机生成的单纯形设计上的设计目标值直方图，每个设计目标一个面板，对流占优区间。竖直标记：六个优化设计 $w_j^\star$ 在该面板设计目标下评估的目标值，越低越优。

## 6. 结论

本文提出一个把风险偏好纳入目标导向贝叶斯最优实验设计范式的新框架。标准方法用期望、偏差或散度聚合预测不确定性，这些量隐式编码了（往往是风险中性的）偏好，可能导致次优的数据采集——尤其在目标导向语境中，关于罕见或高后果事件的不确定性可能无法通过优化平均行为来捕获。我们的风险感知框架借助风险四边形构造三层 OED 目标，分离后验偏差、向量值 QoI 的聚合、以及可能数据上的聚合。我们给出对应数值实现算法，它建立在现有双环估计器之上，并展示常见偏差与风险度量选择——如标准差、平均风险价值（AVaR）、熵风险与安全裕度设计——如何纳入该框架与实现策略。

我们在一个闭式可解示例以及一个对流—扩散 PDE 示例上演示该方法，其中可观测量对推断参数是非线性的。这些测试用例说明：当最终目标是预测下游 QoI 时，面向参数的方法可能表现不佳，从而促使采用目标导向策略。此外，我们比较了六个反映不同风险偏好的目标导向设计，表明此类偏好可显著影响所得设计：风险厌恶与风险中性设计目标把主测量放在物理上不同的位置。我们还通过六个目标导向目标（外加面向参数目标）下的设计性能交叉比较，评估最优设计策略对风险偏好选择的敏感性。

该方法虽有效，但有两个主要局限，源于为便于连续单纯形优化而把设计编码为对角噪声加权矩阵。第一，这一选择依赖观测模型为高斯；推广到非高斯似然需要不同的 $w$ 进入似然的方式，或不同的后验估计方案。第二，当传感器噪声极大时，该参数化导致嵌套重要性加权估计器在超过约 100 个候选传感器位置后缩放变差。

除解决上述两个局限外，未来工作应聚焦于把本工作扩展到序贯 OED，并通过用摊销生成模型替代重要性采样步骤来降低计算代价。迭代更新后验的序贯策略会自然契合本文提出的算法框架，因为重要性权重可递归更新。不过序贯与批处理 OED（本文所述）都可受益于使用生成模型（如基于归一化流的模型）来降低成本。综合这些扩展，可把风险感知目标导向设计从当前估计器支持的区间，拓展到更大的候选集、非高斯似然以及实践中遇到的序贯设置，同时保留对风险偏好的有原则处理——本文已确立其重要性。

## 致谢

本文描述客观的技术结果与分析。文中可能表达的任何主观观点或意见，不一定代表美国能源部或美国政府的观点。Sandia National Laboratories 是一个多任务实验室，由 National Technology and Engineering Solutions of Sandia, LLC（Honeywell International, Inc. 的全资子公司）为美国能源部国家核安全管理局根据合同 DE-NA-0003525 管理和运营。本材料基于美国能源部科学办公室高级科学计算研究办公室（ASCR）在合同 24-028431、Field Work Proposal 编号 23-02526 与早期职业研究计划下支持的工作，以及 Sandia National Laboratories 计算与信息科学实验室指导的研究与开发计划。

**生成式 AI 在写作过程中的声明**：在本工作准备期间，作者使用了 SandiaAI - Chat 与 Claude (Anthropic) 协助编辑与措辞，并核对稿件与计算结果的一致性。使用该工具/服务后，作者按需审查并编辑了内容，并对出版内容承担全部责任。


## 参考文献

> 以下按原文编号 [1]—[20] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “¨”“´” 等变音伪影已按常规写法整理，书目内容未改动。

[1] Alen Alexanderian. Optimal experimental design for infinite-dimensional Bayesian inverse problems governed by PDEs: A review. Inverse Problems, 37(4):043001, mar 2021. doi: 10.1088/1361-6420/abe10c.

[2] Ahmed Attia, Alen Alexanderian, and Arvind K. Saibaba. Goal-oriented optimal design of experiments for large-scale Bayesian linear inverse problems. Inverse Problems, 34(9):095009, jul 2018. doi: 10.1088/1361-6420/aad210.

[3] T. Butler, J. D. Jakeman, and T. Wildey. Optimal experimental design for prediction based on push-forward probability measures. Journal of Computational Physics, 416:109518, 2020. ISSN 0021-9991. doi: https://doi.org/10.1016/j.jcp.2020.109518.

[4] Atlanta Chakraborty, Xun Huan, and Tommie Catanach. A likelihood-free approach to goal-oriented Bayesian optimal experimental design, 2024. URL https://arxiv.org/abs/2408.09582.

[5] Kathryn Chaloner and Isabella Verdinelli. Bayesian experimental design: A review. Statist. Sci., 10(3):273–304, 08 1995. doi: 10.1214/ss/1177009939.

[6] Jeffrey Donatelli, John Jakeman, Michael Shields, Anne Gelb, Felix Herrmann, Sanket Jantre, et al. Basic research needs for inverse methods for complex systems under uncertainty. Technical Report OSTI:2583339, U.S. Department of Energy, Office of Scientific and Technical Information, September 2025.

[7] John D. Jakeman, Drew P. Kouri, and J. Gabriel Huerta. Surrogate modeling for efficiently, accurately and conservatively estimating measures of risk. Reliability Engineering & System Safety, page 108280, 2022. ISSN 0951-8320. doi: https://doi.org/10.1016/j.ress.2021.108280.

[8] D. P. Kouri and T. M. Surowiec. Risk-averse PDE-constrained optimization using the conditional value-at-risk. SIAM Journal on Optimization, 26(1):365–396, 2016. doi: 10.1137/140954556.

[9] Drew P. Kouri and Thomas M. Surowiec. Epi-regularization of risk measures. Mathematics of Operations Research, 45(2):774–795, 2020.

[10] Drew P. Kouri and Thomas M. Surowiec. A primal–dual algorithm for risk minimization. Mathematical Programming, 193(1):337–363, 2022.

[11] Drew P. Kouri, John D. Jakeman, and J. Gabriel Huerta. Risk-adapted optimal experimental design. SIAM/ASA Journal on Uncertainty Quantification, 10(2):687–716, 2022. doi: 10.1137/20M1357615.

[12] Cheng Peng, Drew P. Kouri, and Stan Uryasev. Efficient and robust optimal design for quantile regression based on linear programming. Computational Statistics & Data Analysis, 192:107892, 2024.

[13] Tom Rainforth, Adam Foster, Desi R. Ivanova, and Freddie Bickford Smith. Modern Bayesian Experimental Design. Statistical Science, 39(1):100–114, 2024. doi: 10.1214/23-STS915.

[14] R. Tyrrell Rockafellar and Stan Uryasev. The fundamental risk quadrangle in risk management, optimization and statistical estimation. Surveys in Operations Research and Management Science, 18(1):33–53, 2013. ISSN 1876-7354. doi: https://doi.org/10.1016/j.sorms.2013.03.001.

[15] Elizabeth G. Ryan, Christopher C. Drovandi, James M. McGree, and Anthony N. Pettitt. A review of modern computational algorithms for Bayesian optimal design. International Statistical Review, 84(1):128–154, 2016. doi: https://doi.org/10.1111/insr.12107.

[16] S. D. Silvey. Optimal Design. Chapman and Hall, London, 1980.

[17] George R. Terrell and David W. Scott. Variable Kernel Density Estimation. The Annals of Statistics, 20(3):1236–1265, 1992. doi: 10.1214/aos/1176348768.

[18] Keyi Wu, Peng Chen, and Omar Ghattas. An offline-online decomposition method for efficient linear Bayesian goal-oriented optimal experimental design: Application to optimal sensor placement. SIAM Journal on Scientific Computing, 45(1):B57–B77, 2023. doi: 10.1137/21M1466542.

[19] Jing Yu, Victor M. Zavala, and Mihai Anitescu. A scalable design of experiments framework for optimal sensor placement. Journal of Process Control, 67:44–55, 2018. ISSN 0959-1524. doi: https://doi.org/10.1016/j.jprocont.2017.03.011.

[20] Shijie Zhong, Wanggang Shen, Tommie Catanach, and Xun Huan. Goal-oriented Bayesian optimal experimental design for nonlinear models using Markov chain Monte Carlo, 2025. URL https://arxiv.org/abs/2403.18072.

## 附录 A：线性高斯模型的后验与推前统计量

我们汇总运行示例与实验所用线性高斯模型的后验与推前统计量。后续各附录均使用此处定义的记号。

### A.1 模型设定

设 $\theta\in\mathbb R^D$ 为参数向量，先验 $\theta\sim\mathcal N(\mu,\Sigma)$。观测服从线性模型

$$
y=A\theta+\varepsilon,\qquad\varepsilon\mid w\sim\mathcal N(0,\Gamma_{\mathrm{eff}}(w)),\tag{23}
$$

其中 $A\in\mathbb R^{K\times D}$ 为观测（Vandermonde）矩阵，元素 $A_{ij}=x_i^{j-1}$ 在候选位置 $x_1,\ldots,x_K$ 处取值；基线噪声为对角 $\Gamma=\operatorname{diag}(\sigma_{\varepsilon,1}^2,\ldots,\sigma_{\varepsilon,K}^2)$，各候选间噪声独立、可能异方差。给候选 $k$ 分配权重 $w_k$ 即缩放其精度，得到对角有效噪声协方差 $\Gamma_{\mathrm{eff}}(w)=\operatorname{diag}(\sigma_{\varepsilon,k}^2/w_k)$，故权重 $w_k$ 越大、位置 $k$ 处的有效噪声越小。其逆 $\Gamma_{\mathrm{eff}}(w)^{-1}=\operatorname{diag}(w_k/\sigma_{\varepsilon,k}^2)$ 出现在下文各后验表达式中。多项式基实验中我们使用 4 次基（$D=5$）、$K=10$ 个在 $[-1,1]$ 上等距的候选位置、所有 $k$ 的公共噪声标准差 $\sigma_{\varepsilon,k}=0.5$、以及各向同性先验 $\Sigma=\sigma_0^2I$（$\sigma_0=0.5$）。

### A.2 后验分布

由于模型是线性—高斯的，后验为高斯：$\theta\mid y,w\sim\mathcal N(\mu^\ast,\Sigma^\ast)$，其中

$$
\Sigma^\ast=\left(\Sigma^{-1}+A^\top\Gamma_{\mathrm{eff}}(w)^{-1}A\right)^{-1},\tag{24}
$$

$$
\mu^\ast=\Sigma^\ast\left(A^\top\Gamma_{\mathrm{eff}}(w)^{-1}y+\Sigma^{-1}\mu\right).\tag{25}
$$

关键在于 $\Sigma^\ast$ 只依赖设计 $w$，不依赖数据 $y$。

### A.3 后验均值在数据上的分布

由于 $y=A\theta+\varepsilon$ 且 $(\theta,\varepsilon)$ 独立，$\mu^\ast$ 在数据边缘分布 $y\sim p(y\mid w)$ 下是高斯随机变量。定义

$$
R:=\Sigma^\ast A^\top\Gamma_{\mathrm{eff}}(w)^{-1},\qquad R_0:=RA.\tag{26}
$$

由于 $\mu^\ast=Ry+\Sigma^\ast\Sigma^{-1}\mu$ 且 $\mathbb E_{p(y\mid w)}[y]=A\mu$，$\mu^\ast$ 在数据上的均值为

$$
\nu:=\mathbb E_{p(y\mid w)}[\mu^\ast]=RA\mu+\Sigma^\ast\Sigma^{-1}\mu=(R_0+\Sigma^\ast\Sigma^{-1})\mu=\Sigma^\ast\left(A^\top\Gamma_{\mathrm{eff}}(w)^{-1}A+\Sigma^{-1}\right)\mu=\Sigma^\ast{\Sigma^\ast}^{-1}\mu=\mu.\tag{27}
$$

故 $\nu=\mu$：后验均值在期望意义上对先验均值无偏。$\mu^\ast$ 在数据上的协方差为

$$
C:=\operatorname{Cov}[\mu^\ast,\mu^\ast]=R\operatorname{Cov}[y,y]R^\top=R_0\Sigma R_0^\top+R\Gamma R^\top,\tag{28}
$$

其中 $\operatorname{Cov}[y,y]=A\Sigma A^\top+\Gamma$。

### A.4 对数正态推前

对 QoI 映射 $q_j(\theta)=\exp(\psi_j^\top\theta)$，定义对数均值 $\tau_j:=\psi_j^\top\mu^\ast$ 与后验对数方差 $\sigma_j^2:=\psi_j^\top\Sigma^\ast\psi_j$。由于 $\psi_j^\top\theta\mid y,w\sim\mathcal N(\tau_j,\sigma_j^2)$，每个 QoI 分量服从对数正态分布：$q_j(\theta)\mid y,w\sim\mathcal L\mathcal N(\tau_j,\sigma_j^2)$。其条件标准差可分解为

$$
d_j(y,w)\equiv\mathrm{Std}[q_j(\theta)\mid y,w]=K_j\exp(\tau_j),\tag{29}
$$

其中**确定性尺度因子**

$$
K_j=\exp\left(\tfrac{1}{2}\sigma_j^2\right)\sqrt{\exp(\sigma_j^2)-1}\tag{30}
$$

只通过 $\Sigma^\ast$ 依赖 $w$。对数均值 $\tau_j$ 在数据上为高斯，且

$$
\nu_j:=\mathbb E[\tau_j]=\psi_j^\top\mu,\qquad \sigma_{\tau,j}^2:=\operatorname{V}[\tau_j]=\psi_j^\top C\psi_j.\tag{31}
$$

## 附录 B：解析设计目标表达式——标量 QoI

我们对标量 QoI 情形（$Q=1$）推导设计目标 U1—U4 与 EIG 基线的闭式表达。全文 $K$、$\tau$、$\nu$、$\sigma^2$、$\sigma_\tau^2$ 如附录 A 定义（因 $Q=1$ 而略去分量下标 $j$）。特别地，$d(y,w)=K\exp(\tau)$，其中 $\tau\sim\mathcal N(\nu,\sigma_\tau^2)$ 为在数据边缘下。

### B.1 U1：期望标准差

**命题 B.1**：$U_1(w)=\mathbb E_{p(y\mid w)}[d(y,w)]=K\exp\left(\nu+\frac{1}{2}\sigma_\tau^2\right)$。

**证明**：由于 $d=Ke^\tau$ 且 $\tau\sim\mathcal N(\nu,\sigma_\tau^2)$，随机变量 $d/K$ 服从对数正态。对数正态 $\mathcal L\mathcal N(\mu,\sigma^2)$ 的均值为 $e^{\mu+\sigma^2/2}$，即得结论。$\square$

### B.2 U3：标准差在数据上的 AVaR$_\beta$

**命题 B.2**：

$$
U_3(w)=\mathrm{AVaR}_\beta[d(y,w)]=K\exp\left(\nu+\frac{1}{2}\sigma_\tau^2\right)\frac{1}{1-\beta}\bar\Phi\left(\sqrt{\sigma_\tau^2}-\Phi^{-1}(\beta)\right).\tag{32}
$$

**证明**：随机变量 $d=Ke^\tau$ 为对数正态，参数为 $\log K+\nu$ 与 $\sigma_\tau^2$。对对数正态 $X\sim\mathcal L\mathcal N(\mu_X,\sigma_X^2)$，$\beta$-分位数为 $q_\beta=e^{\mu_X+\sigma_X\Phi^{-1}(\beta)}$，条件尾部期望为

$$
\mathrm{AVaR}_\beta[X]=\frac{\mathbb E_{p(y\mid w)}[X]}{1-\beta}\bar\Phi\left(\sigma_X-\Phi^{-1}(\beta)\right).
$$

代入 $\mu_X=\log K+\nu$、$\sigma_X=\sqrt{\sigma_\tau^2}$、$\mathbb E_{p(y\mid w)}[X]=K\exp(\nu+\sigma_\tau^2/2)$ 即得（32）。$\square$

### B.3 U4：安全裕度

**命题 B.3**：对安全因子 $c\ge0$，

$$
U_4(w)=\mathbb E_{p(y\mid w)}[d]+c\,\mathrm{Std}[d(y,w)]=K\exp\left(\nu+\frac{1}{2}\sigma_\tau^2\right)\left(1+c\sqrt{\exp(\sigma_\tau^2)-1}\right).\tag{33}
$$

**证明**：由命题 B.1 有 $\mathbb E_{p(y\mid w)}[d]=U_1$。对对数正态 $d/K\sim\mathcal L\mathcal N(\nu,\sigma_\tau^2)$：$\operatorname{Var}_{p(y\mid w)}[d]=K^2e^{2\nu+\sigma_\tau^2}(e^{\sigma_\tau^2}-1)$，故 $\mathrm{Std}_{p(y\mid w)}[d]=Ke^{\nu+\sigma_\tau^2/2}\sqrt{e^{\sigma_\tau^2}-1}=U_1\sqrt{e^{\sigma_\tau^2}-1}$。代入 $U_4=\mathbb E_{p(y\mid w)}[d]+c\,\mathrm{Std}_{p(y\mid w)}[d]$ 即得（33）。$\square$

### B.4 EIG 基线

数值实验所用的基于 KL 的基线是**完整参数后验**（而非其到预测方向 $\psi$ 的投影）上的期望信息增益（EIG）。对附录 A 的线性—高斯模型，该 EIG 有闭式表达，且因后验协方差不依赖实现数据而与数据无关。

**命题 B.4**：设 $F(w)=A^\top\Gamma_{\mathrm{eff}}(w)^{-1}A$ 为设计加权 Fisher 信息，则

$$
U_{\mathrm{KL}}(w):=\mathbb E_{p(y\mid w)}\left[\mathrm{KL}(p(\theta\mid y,w)\|p(\theta))\right]=\frac{1}{2}\log\frac{\det\Sigma}{\det\Sigma^\ast}=\frac{1}{2}\log\det\left(I+\Sigma F(w)\right).\tag{34}
$$

**证明**：对高斯 $p(\theta)=\mathcal N(\mu,\Sigma)$ 与 $p(\theta\mid y,w)=\mathcal N(\mu^\ast,\Sigma^\ast)$，KL 散度的标准形式为

$$
\mathrm{KL}(p(\theta\mid y,w)\|p(\theta))=\frac{1}{2}\left[\operatorname{tr}\left(\Sigma^{-1}\Sigma^\ast\right)-D+\log\frac{\det\Sigma}{\det\Sigma^\ast}+(\mu^\ast-\mu)^\top\Sigma^{-1}(\mu^\ast-\mu)\right].\tag{35}
$$

对 $y\sim p(y\mid w)$ 取期望：前三项与 $y$ 无关（附录 A.2 给出 $\Sigma^\ast$ 不依赖 $y$）；对二次项，由 $\mathbb E_{p(y\mid w)}[\mu^\ast]=\mu$（27）与 $\operatorname{Cov}[\mu^\ast,\mu^\ast]=C$（28）得

$$
\mathbb E_{p(y\mid w)}\left[(\mu^\ast-\mu)^\top\Sigma^{-1}(\mu^\ast-\mu)\right]=\operatorname{tr}\left(\Sigma^{-1}C\right).
$$

对 $\theta$ 在 $p(\theta,y\mid w)$ 下应用全方差公式、并利用 $\Sigma^\ast$ 与 $y$ 无关，得 $\Sigma=\Sigma^\ast+C$，故 $\operatorname{tr}(\Sigma^{-1}C)=D-\operatorname{tr}(\Sigma^{-1}\Sigma^\ast)$，恰好抵消（35）的前两项。剩下的对数行列式给出（34）的中间表达式。Fisher 形式来自 ${\Sigma^\ast}^{-1}=\Sigma^{-1}+F(w)$（24），它给出 $\Sigma{\Sigma^\ast}^{-1}=I+\Sigma F(w)$，从而 $\det(\Sigma)/\det(\Sigma^\ast)=\det(I+\Sigma F(w))$。$\square$

## 附录 C：设计目标估计器的收敛性

本附录验证第 4.2 节的嵌套求积设计目标估计器收敛到附录 B 的闭式参考，量化其精度对内外求积点数的依赖，并用随机移位 Halton 序列比较蒙特卡洛（MC）采样与准蒙特卡洛（QMC）。

为使与精确参考的比较可行，我们使用第 2.4 节的线性高斯模型——这是设计目标具有附录 B 闭式表达的唯一设置。取 4 次多项式基 $\psi(x)=[1,x,x^2,x^3,x^4]^\top$，故 $A\in\mathbb R^{K\times(p+1)}$ 为在 $[-1,1]$ 上 $K=10$ 个等距观测位置处取值的 Vandermonde 矩阵。QoI 映射（7）在单个预测位置 $x_{\mathrm{pred}}=0$ 处评估，得到标量 QoI（$Q=1$）；先验取 $\theta\sim\mathcal N(0,0.25I)$、基线噪声协方差 $\Gamma=0.25I$。

我们在均匀设计 $w=1/K$ 处，对四个解析值可得的命名设计目标评估估计器——U1（std/mean/mean）、U3（std/mean/AVaR$_\beta$，$\beta=0.9$）、U6（std/mean/mean$+c\cdot$Std，$c=1$）与 KL。对每个目标，我们生成 $R=1000$ 个独立数据实现、对每个计算估计 $\hat U_{M,N}^{(r)}$，并构造均方误差的蒙特卡洛近似

$$
\mathrm{MSE}(\hat U_{M,N})\approx\frac{1}{R}\sum_{r=1}^{R}\left(U-\hat U_{M,N}^{(r)}\right)^2=\mathrm{Bias}^2(\hat U_{M,N})+\mathrm{Var}(\hat U_{M,N}),\tag{36}
$$

其中 $U$ 为解析值。从同一批 $R$ 个重复估计平方偏差 $(\mathbb E[\hat U_{M,N}]-U)^2$ 与方差 $\mathbb E[(\hat U_{M,N}-\mathbb E[\hat U_{M,N}])^2]$，可分离这两种误差来源，从而看出各区间中哪一种限制精度。对 QMC，各重复对应独立 Halton 移位，因而保持该偏差—方差分解。

图 13 报告内环与外环样本数依次扫描时（先在 $M=4000$ 下变化 $N$，再在 $N=4000$ 下变化 $M$）的两个误差分量。对预测类目标 U1、U3、U6，细化内环使两个分量都下降；由于全过程方差都高于平方偏差，可达精度由方差决定。KL 目标行为不同，且有结构性原因：其 log-sum-exp 形式在内环收敛很快，故一旦 $N\gtrsim200$ 内环贡献已可忽略，总误差在外环设定的下限处平台化。此时再增加内环样本会降低 KL 估计器的 Jensen 偏差，但无法触及此时占主导的外环采样方差，故 MSE 不再改善。

外环扫描确认了这种分工。对预测类目标，偏差与方差再次同时下降、方差占主导，故增大 $M$ 继续换取精度。KL 的行为与其内环行为相反：其方差随 $M$ 单调下降，而平方偏差基本保持不变，因为偏差由 $N$ 固定、从而与抽取多少外环样本无关。在所有目标上，相同样本数下 QMC 外环采样都达到比 MC 更低的方差，这是 Halton 序列低差异结构的直接结果。综合这些扫描可见估计器收敛到解析参考，并识别出对给定目标应细化哪个环：预测类目标细化内环，KL 细化外环。

**图 13**：U1、U3、U6 与 KL 效用（在均匀设计权重处评估）的 MC（虚线）与 QMC（实线）估计器的 MSE 分解（MSE = Bias² + Var）。上排：内环扫描（变化 $N$，$M=4000$ 固定）。下排：外环扫描（变化 $M$，$N=4000$ 固定）。第 4.2 节的解耦估计器在所有外环样本间共享同一内环样本集。

## 附录 D：梯度推导

我们推导样本平均 OED 目标关于设计权重 $w$ 的精确梯度，所用求积样本在优化前抽取一次并保持固定。D.1 节给出一般三层链式法则，D.5 节专门讨论 Std/Mean/Mean 配置（设计目标 U1）。

### D.1 重参数化观测与对数似然

固定来自先验—噪声联合分布的外环样本 $\{(\theta^{(m)},\varepsilon^{(m)})\}_{m=1}^{M}$（$\varepsilon^{(m)}\sim\mathcal N(0,I)$）与内环先验样本 $\{\theta^{(n)}\}_{n=1}^{N}$。如附录 A，基线噪声协方差为对角 $\Gamma=\operatorname{diag}(\sigma_{\varepsilon,1}^2,\ldots,\sigma_{\varepsilon,K}^2)$，设计以对角加权 $W=\operatorname{diag}(w)$ 进入，故生成人工观测的重参数化按传感器分离。对每个外环样本 $m$ 与传感器 $k$，

$$
y_k^{(m)}=A_k^\top\theta^{(m)}+\frac{\sigma_{\varepsilon,k}}{\sqrt{w_k}}z_k^{(m)},\tag{37}
$$

其中 $z_k^{(m)}$ 为 $\varepsilon^{(m)}$ 的第 $k$ 个元素，潜噪声实现在优化全程只抽取一次并固定。这使每个 $y^{(m)}$ 成为 $w$ 的确定性可微函数；且由于加权按传感器作用，把 $w_k$ 减小到零会把传感器 $k$ 上的有效噪声放大到无穷。

对数似然继承同样的按传感器分离结构。对内外样本 $n$ 与外环实现 $m$，对数似然为

$$
\ell_{mn}(w)=-\frac{1}{2}\sum_{k=1}^{K}\left[\log\frac{\sigma_{\varepsilon,k}^2}{w_k}+\frac{w_ke_{mnk}^2}{\sigma_{\varepsilon,k}^2}\right]+\text{const},\tag{38}
$$

其中 $e_{mnk}=y_k^{(m)}-A_k^\top\theta^{(n)}$ 为位置 $k$ 处的残差。由于 $y_k^{(m)}$ 经（37）依赖 $w$，偏导数有三项贡献：

$$
\frac{\partial\ell_{mn}}{\partial w_k}=\underbrace{\frac{1}{2w_k}}_{\text{对数行列式}}-\underbrace{\frac{e_{mnk}^2}{2\sigma_{\varepsilon,k}^2}}_{\text{二次项}}+\underbrace{\frac{e_{mnk}z_k^{(m)}}{2\sigma_{\varepsilon,k}\sqrt{w_k}}}_{\text{重参数化}}.\tag{39}
$$

前两项来自高斯对数密度；第三项计入 $y^{(m)}$ 对设计的隐式依赖。

### D.2 证据与归一化重要性权重

外环样本 $m$ 的边缘似然（证据）为

$$
\hat p(y^{(m)}\mid w)=\sum_{n=1}^{N}\omega_n^{\mathrm{in}}\exp\left(\ell_{mn}(w)\right),\tag{40}
$$

其中 $\omega_n^{\mathrm{in}}$ 为内环求积权重（蒙特卡洛时均匀取 $1/N$）。归一化重要性权重

$$
\tilde w_n^{(m)}(w)=\frac{\omega_n^{\mathrm{in}}\exp\left(\ell_{mn}(w)\right)}{\hat p(y^{(m)}\mid w)}\tag{41}
$$

近似后验 $p(\theta^{(n)}\mid y^{(m)},w)$，并对每个 $m$ 满足 $\sum_n\tilde w_n^{(m)}(w)=1$。其关于 $w_k$ 的梯度由商法则给出：

$$
\frac{\partial\tilde w_n^{(m)}(w)}{\partial w_k}=\tilde w_n^{(m)}(w)\left[\frac{\partial\ell_{mn}}{\partial w_k}-\sum_{n'}\tilde w_{n'}^{(m)}(w)\frac{\partial\ell_{mn'}}{\partial w_k}\right],\tag{42}
$$

其中括号内为对数似然梯度的重要性加权均值，这是把梯度经归一化传播所必需的。

### D.3 穿越三个层级的链式法则

（13）的样本平均近似为

$$
\hat U(w)=\mathcal R^{\mathrm{data}}\left[\mathcal R^{\mathrm{QoI}}\left[\hat d_j(y^{(m)},w)\right]_{j=1}^{Q}\right]_{m=1}^{M},\tag{43}
$$

其中 $\hat d_j$ 为预测分量 $j$ 与外环样本 $m$ 处的偏差估计。梯度通过依次对每个层级施加链式法则来组装。

1. **第 1 层（偏差）**：对每个预测分量 $j$ 与外环样本 $m$，计算 $\hat d_{jm}(w)$ 及其偏导 $\partial\hat d_{jm}/\partial w_k$（具体偏差类型见 D.5 与 D.4 节）。
2. **第 2 层（QoI 风险）**：对每个 $m$，把 $\mathcal R^{\mathrm{QoI}}$ 作用于 $(\hat d_{1m},\ldots,\hat d_{Qm})$ 得逐实现标量 $\hat r_m(w)$。链式法则给出 $\partial\hat r_m/\partial w_k=\sum_{j=1}^{Q}\frac{\partial\mathcal R^{\mathrm{QoI}}}{\partial\hat d_{jm}}\cdot\frac{\partial\hat d_{jm}}{\partial w_k}$。对均值 $\partial\mathcal R^{\mathrm{QoI}}/\partial\hat d_{jm}=1/Q$；对 AVaR$_\alpha$，偏导为下文 D.4 节的投影权重 $\pi_{jm}^\ast$；对熵风险 $\frac{1}{\lambda}\log\frac{1}{Q}\sum_je^{\lambda\hat d_{jm}}$，为指数倾斜权重 $e^{\lambda\hat d_{jm}}/\sum_{j'}e^{\lambda\hat d_{j'm}}$。
3. **第 3 层（数据风险）**：把 $\mathcal R^{\mathrm{data}}$ 作用于 $(\hat r_1,\ldots,\hat r_M)$ 得目标估计 $\hat U(w)$。梯度为 $\partial\hat U/\partial w_k=\sum_{m=1}^{M}\frac{\partial\mathcal R^{\mathrm{data}}}{\partial\hat r_m}\cdot\frac{\partial\hat r_m}{\partial w_k}$，风险度量相关权重同第 2 层。

完整 Jacobian $\nabla_w\hat U(w)$ 只需前向传播中已计算的数量，使梯度代价仅为函数评估代价的常数倍。

### D.4 光滑 AVaR 的求值与梯度

离散分布（样本 $\{f_i\}_{i=1}^{N}$、概率权重 $\{v_i\}_{i=1}^{N}$ 且和为 1）在水平 $\alpha\in[0,1)$ 处的标准 AVaR 为

$$
\mathrm{AVaR}_\alpha[f]=\mathrm{VaR}_\alpha[f]+\frac{1}{1-\alpha}\sum_{i=1}^{N}v_i\max(0,f_i-\mathrm{VaR}_\alpha[f]),\tag{44}
$$

其中 $\mathrm{VaR}_\alpha[f]$ 为 $\alpha$-分位数。正部函数 $t\mapsto\max(0,t)$ 使（44）不可微。我们使用对偶（风险包络）表示 [9] 的正则化；也可以改用原始—对偶风险最小化算法 [10] 来避免光滑化。

**对偶表示与光滑化**：精确 AVaR 有对偶表示

$$
\mathrm{AVaR}_\alpha[f]=\max_{\pi\in\mathcal C_\alpha}\sum_{i=1}^{N}\pi_if_i,\tag{45}
$$

其中 AVaR 风险包络为 $\mathcal C_\alpha=\left\{\pi\in\mathbb R^N:0\le\pi_i/v_i\le(1-\alpha)^{-1},\ \sum_i\pi_i=1\right\}$。光滑版本为 Moreau–Yosida 近似：

$$
\widehat{\mathrm{AVaR}}_{\alpha,\delta}(f)=\max_{\pi\in\mathcal C_\alpha}\left\{\sum_{i=1}^{N}\pi_if_i-\frac{1}{2\delta}\sum_{i=1}^{N}\frac{\pi_i^2}{v_i}\right\},\qquad\delta>0.\tag{46}
$$

$\widehat{\mathrm{AVaR}}_{\alpha,\delta}$ 与 $\mathrm{AVaR}_\alpha$ 的误差为 $O(\delta^{-1})$，故 $\delta\to\infty$ 时 $\widehat{\mathrm{AVaR}}_{\alpha,\delta}\to\mathrm{AVaR}_\alpha$ [9,10]。

**经加权投影计算**：（46）的最大化者是 $s_i=\delta v_if_i$ 在 $V^{-1}$ 加权范数下到 $\mathcal C_\alpha$ 的投影，由加权截断求解：

$$
\pi_i^\ast=\min\left(\frac{v_i}{1-\alpha},\max(0,s_i-\mu v_i)\right),\tag{47}
$$

其中强制 $\sum_i\pi_i^\ast=1$ 的 Lagrange 乘子 $\mu$ 通过如下方式求出：对分段线性函数 $\mu\mapsto\sum_i\pi_i^\ast-1$ 的折点排序，再用二分法确定含根的区间。光滑目标的取值为

$$
\widehat{\mathrm{AVaR}}_{\alpha,\delta}(f)=\sum_{i=1}^{N}\pi_i^\ast f_i-\frac{1}{2\delta}\sum_{i=1}^{N}\frac{(\pi_i^\ast)^2}{v_i}.\tag{48}
$$

**梯度**：当权重 $v_i$ 不依赖 $w$ 时，梯度为

$$
\nabla_w\widehat{\mathrm{AVaR}}_{\alpha,\delta}(f)=\sum_{i=1}^{N}\pi_i^\ast\nabla_wf_i.\tag{49}
$$

当 $v_i=v_i(w)$（设计相关的重要性权重）时，由于二分法活跃集不连续，没有闭式梯度；梯度通过光滑投影的反向模式自动微分传播。全文取 $\delta=10^5$；风险水平 $\alpha$ 在第 5 节按实验指定。

### D.5 特例：Std/Mean/Mean（设计目标 U1）

对 $\mathcal D^{\mathrm{pf}}=\mathrm{Std}$、$\mathcal R^{\mathrm{QoI}}=\mathrm{Mean}$、$\mathcal R^{\mathrm{data}}=\mathrm{Mean}$ 与标量 QoI（$Q=1$），样本平均目标为

$$
\hat U_1(w)=\sum_{m=1}^{M}\omega_m^{\mathrm{out}}\sigma_m(w),\tag{50}
$$

其中 $\omega_m^{\mathrm{out}}$ 为外环求积权重，且

$$
\sigma_m(w)=\sqrt{V_m(w)},\qquad V_m=M_m^{(2)}-\left[M_m^{(1)}\right]^2,\tag{51}
$$

后验矩为

$$
M_m^{(p)}(w)=\sum_{n=1}^{N}\tilde w_n^{(m)}(w)f_n^p,\qquad p=1,2,\tag{52}
$$

$f_n=q(\theta^{(n)})$ 为内环样本 $n$ 处（固定）的 QoI 值。

**矩的梯度**：对（52）求导并代入（42）得

$$
\frac{\partial M_m^{(p)}}{\partial w_k}=\sum_{n=1}^{N}f_n^p\frac{\partial\tilde w_n^{(m)}(w)}{\partial w_k},\qquad p=1,2.\tag{53}
$$

**方差与标准差梯度**：由链式法则，

$$
\frac{\partial V_m}{\partial w_k}=\frac{\partial M_m^{(2)}}{\partial w_k}-2M_m^{(1)}\frac{\partial M_m^{(1)}}{\partial w_k},\tag{54}
$$

$$
\frac{\partial\sigma_m}{\partial w_k}=\frac{1}{2\sigma_m}\frac{\partial V_m}{\partial w_k}.\tag{55}
$$

**目标梯度**：把（50）与（55）结合得

$$
\frac{\partial\hat U_1}{\partial w_k}=\sum_{m=1}^{M}\omega_m^{\mathrm{out}}\frac{\partial\sigma_m}{\partial w_k}.\tag{56}
$$

其他偏差度量（方差、熵）的梯度结构相同，只需把 $\sigma_m$ 替换为重要性加权矩的相应泛函。

## 附录 E：对流—扩散实验——区间复现

本附录汇总对流—扩散传感器布局实验（第 5.2 节）在扩散占优（$D=0.1$、$\mathrm{Pe}_h=0.024$）与中等（$D=0.02$、$\mathrm{Pe}_h=0.120$）区间的复现。各区间只在示踪剂扩散率 $D$ 上不同，并以网格 Péclet 数 $\mathrm{Pe}_h=|u|_{\max}h/(2D)$ 概括，其中 $h$ 为局部网格单元尺寸、$|u|_{\max}$ 为 Navier–Stokes 解的最大速度幅值。正文报告的对流占优区间为 $D=0.005$、$\mathrm{Pe}_h=0.484$。每个区间用活跃候选传感器的自助权重箱线图（图 15 与图 16）以及叠加六个优化设计交叉评估的随机设计直方图（图 17 与图 18）记录。

**活跃传感器与自助变异**：扩散占优与中等区间的箱线图（图 15、图 16）复现了对流占优箱线图（图 11）的定性结构：$K=50$ 个候选传感器中的一小部分在每个设计目标下获得几乎全部权重，相对于目标间差距自助箱较窄，且设计目标在主导与次级传感器的选择上都存在分歧。区间变化带来两个定量差异。第一，随着输运更具扩散性，主导的目标导向传感器向上游移动：在对流占优设计中紧邻第一个障碍物之后锚定的传感器 26 失去主导地位，让位于放置在域中更靠左的传感器，这与平流路径的收缩一致。第二，每个活跃传感器处的目标间散布收缩：对流占优区间，单一主导传感器处六个目标导向设计目标的散布接近 $0.4$；中等区间接近 $0.2$；扩散占优区间六个目标导向设计目标把权重集中在相同的两三个传感器上，散布低于 $0.1$。

**KL 与目标导向设计的分离**：在对流占优区间，KL 基线把权重放在每个目标导向设计目标都忽略的传感器上（第 5.3 节）；两组主导传感器互不相交（图 11）。随着输运更具扩散性，这种分离收窄：中等区间 KL 与目标导向的首选传感器不同但部分重叠（图 16）；扩散占优区间 KL 主导传感器与目标导向主导传感器在主选择上重合，分歧仅限次级分配（图 15）。物理机制与上文讨论的传感器移动相同：当扩散拓宽信息区域时，单个传感器可同时约束源参数（KL 所奖励）与下游预测（目标导向设计目标所奖励），故两种“信息”概念不再那么正交。

**失配设计的实际代价**：随机设计直方图（图 17、图 18）显示交叉评估惩罚相应收缩。在对流占优区间（图 12），KL 最优设计在任一目标导向设计目标下评估都深处于随机设计分布内部——与单纯形上的任意分配相当——而六个目标导向设计在 KL 目标下反向亦然。中等区间，KL 最优设计向各目标导向设计目标的随机设计直方图有利边缘移动；其相对匹配最优的惩罚可见，但远小于对流区间。扩散占优区间该惩罚进一步收缩：KL 最优设计与六个目标导向最优在任一设计目标下都位于匹配最优约一个直方图宽度以内，参数导向与预测导向设计之间的交叉评估不对称性减弱。因此，错误指定目标类别在对流占优区间所招致的“定性”错误，随着扩散拓宽每个候选可得的信息而软化为有界的定量误差。

**舍入为可部署的整数预算**：可部署设计需要把连续最优 $w^\star\in\Delta_K$ 舍入为整数测量分配 $n^\star\in\mathbb Z_{\ge0}^K$ 且 $\sum_kn_k^\star=S$，$S$ 为总测量预算。我们建议使用 Hamilton 最大余数分配规则：先给每个传感器 $\lfloor Sw_k^\star\rfloor$ 个测量，再把剩余 $S-\sum_k\lfloor Sw_k^\star\rfloor$ 个测量分配给小数部分 $Sw_k^\star-\lfloor Sw_k^\star\rfloor$ 最大的传感器。图 14 给出对流占优区间中风险厌恶最强的设计目标 U3 在三个预算 $S\in\{5,10,20\}$ 下的结果。最小预算把全部五个测量放在左上的一对传感器上，其中在 U3 集中约 $0.7$ 连续权重的传感器 26 处放多个测量。随着 $S$ 增大，主导传感器的计数先增加，只有当这些站点承载了相称数量的测量后，额外传感器才被激活以填充次级支撑。因此舍入分配从小预算的高度集中过渡到大预算的空间多样化，尊重连续最优的权重层级而无需单独的整数优化。该行为在三个区间定性不变，只是底层连续最优（从而被填充的具体站点）不同。增大 $S$ 先增加主导传感器的测量计数，然后激活额外传感器填充连续最优的次级支撑。

**图 14**：对流占优区间 U3 最优在三个预算 $S\in\{5,10,20\}$ 下的舍入整数测量分配。实心标记：活跃传感器位置，大小表示该位置的整数测量数。
**图 15**：扩散占优区间（$D=0.1$、$\mathrm{Pe}_h=0.024$）下 30 个重采样训练集上最优传感器权重的自助分布；格式同图 11。
**图 16**：中等区间（$D=0.02$、$\mathrm{Pe}_h=0.120$）下 30 个重采样训练集上最优传感器权重的自助分布；格式同图 11。
**图 17**：扩散占优区间（$D=0.1$、$\mathrm{Pe}_h=0.024$）的随机设计直方图与最优交叉评估；格式同图 12。
**图 18**：中等区间（$D=0.02$、$\mathrm{Pe}_h=0.120$）的随机设计直方图与最优交叉评估；格式同图 12。

## 附录 F：光滑 AVaR 值函数的连续性

本附录验证如下论断：最优光滑 AVaR 路径关于置信参数 $\alpha\in[0,1)$ 连续。设 $f:\Delta_K\to L^1$、$r>0$、$t\in[1,\infty)$，考虑最优值函数

$$
h(t):=\min_{w\in\Delta_K}\sup_{\theta\in\mathcal A_t}\left\{\mathbb E[\theta f(w)]-\frac{1}{2r}\mathbb E[\theta^2]\right\},
$$

其中 $\mathcal A_t:=\{\theta\in L^\infty\mid\mathbb E[\theta]=1,\ 0\le\theta\le t\ \text{a.s.}\}$，$L^1$ 与 $L^\infty$ 分别表示绝对可积与本质有界随机变量的 Lebesgue 空间。回顾内层最大化问题是光滑 AVaR 的对偶表示。最终我们将证明 $\alpha\mapsto h(1/(1-\alpha))$ 连续。为此先证明 $h(\cdot)$ 有限、凹且递增，从而连续；目标函数作为连续映射的复合即连续。

首先注意，对任意 $t_1,t_2\in[1,\infty)$ 与 $\lambda\in[0,1]$，有 $\lambda\mathcal A_{t_1}+(1-\lambda)\mathcal A_{t_2}\subseteq\mathcal A_{\lambda t_1+(1-\lambda)t_2}$（左侧为集合的 Minkowski 和）。为证该包含关系，令 $\theta_1\in\mathcal A_{t_1}$、$\theta_2\in\mathcal A_{t_2}$，则 $\mathbb E[\lambda\theta_1+(1-\lambda)\theta_2]=\lambda\mathbb E[\theta_1]+(1-\lambda)\mathbb E[\theta_2]=\lambda+(1-\lambda)=1$，且 $0\le\lambda\theta_1+(1-\lambda)\theta_2\le\lambda t_1+(1-\lambda)t_2$ a.s.，故 $\lambda\theta_1+(1-\lambda)\theta_2\in\mathcal A_{\lambda t_1+(1-\lambda)t_2}$。利用该包含关系可得

$$
h(\lambda t_1+(1-\lambda)t_2)\ge\min_{w\in\Delta_K}\left\{\mathbb E[(\lambda\theta_1+(1-\lambda)\theta_2)f(w)]-\frac{1}{2r}\mathbb E[(\lambda\theta_1+(1-\lambda)\theta_2)^2]\right\}\ge\min_{w\in\Delta_K}\left\{\lambda\left(\mathbb E[\theta_1f(w)]-\frac{1}{2r}\mathbb E[\theta_1^2]\right)+(1-\lambda)\left(\mathbb E[\theta_2f(w)]-\frac{1}{2r}\mathbb E[\theta_2^2]\right)\right\}
$$

对任意 $\theta_1\in\mathcal A_{t_1}$、$\theta_2\in\mathcal A_{t_2}$ 与 $\lambda\in[0,1]$ 成立，其中第二个不等式来自 $\theta\mapsto-\frac{1}{2r}\mathbb E[\theta^2]$ 的凹性。对 $\theta_1$、$\theta_2$ 最大化右端，并注意“和的最小值不小于各自最小值之和”即证 $h(\cdot)$ 凹。此外，由于对所有 $t_2\ge t_1\ge1$ 有 $\mathcal A_{t_1}\subseteq\mathcal A_{t_2}$，$\mathcal A_{t_2}$ 上的上确界不小于 $\mathcal A_{t_1}$ 上的上确界，故 $h(\cdot)$ 递增。最后，由于对所有 $w\in\Delta_K$ 有 $f(w)\in L^1$，$h(\cdot)$ 有限；这三条性质保证 $h(\cdot)$ 在 $[1,\infty)$ 上连续。因此 $\alpha\mapsto h(1/(1-\alpha))$ 在 $[0,1)$ 上连续且递增，因为它是连续递增映射的复合。

## 图注与表注

**图 1**：pOED 与 gOED 在带流阻水道中传感器布局的概念比较（含候选传感器位置、受体位置与先验/后验推前分布）。
**图 2**：对数正态运行示例的观测模型、QoI 映射与后验推前：(a) 参数空间与后验椭圆；(b) 先验与两种设计下的后验推前；(c, d) 后验协方差行列式与推前标准差。
**图 3**：表 1 三个族的遗憾函数 $v(t)$（对称、AVaR 分段线性、指数）。
**图 4**：各偏差度量在参考分布上的作用（标准差、AVaR 偏差、熵偏差）。
**图 5**：运行示例第 1 层标准差度量：联合后验密度与偏差曲面。
**图 6**：第 2 层 QoI 风险度量：偏差曲面、偏差剖面与聚合曲线。
**图 7**：第 3 层数据风险度量作用于 $r$ 的概率密度（均值 vs $\mathrm{AVaR}_\beta$）。
**图 8**：I–G 最优性插值（目标值与最优传感器权重随 $\alpha$ 的变化）。
**图 9**：对流—扩散基准设置（源场实现与定常速度场）。
**图 10**：$K=50$ 个候选传感器与 $Q=20$ 个 QoI 受体位置布局（含障碍物）。
**图 11**：对流占优区间最优传感器权重的自助分布。
**图 12**：对流占优区间的随机设计直方图与最优交叉评估。
**图 13**：MC 与 QMC 估计器的 MSE 分解（内环与外环扫描）。
**图 14**：对流占优区间 U3 最优的舍入整数测量分配（$S=5,10,20$）。
**图 15**：扩散占优区间最优传感器权重的自助分布。
**图 16**：中等区间最优传感器权重的自助分布。
**图 17**：扩散占优区间的随机设计直方图与最优交叉评估。
**图 18**：中等区间的随机设计直方图与最优交叉评估。

**表注**：表 1 为遗憾、偏差与风险度量三个族（安全裕度、AVaR、熵），见第 3.1 节逐格转录；表 2 为本文使用的命名设计目标 U1—U6 与 KL 基线，见第 5 节逐格转录。算法 1 已按原算法逐行转录。

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与关键词；第 1 节引言（图 1）；第 2 节问题表述（2.1—2.4，式（1）—（7），图 2）；第 3 节风险感知目标导向设计目标（3.1—3.5，式（8）—（14），表 1，图 3—7，脚注 1）；第 4 节估计与优化（4.1—4.3，式（15）—（20），算法 1）；第 5 节数值实验（5.1—5.4，式（21）—（22），表 2，图 8—12）；第 6 节结论；致谢与生成式 AI 声明；参考文献 [1]—[20] 英文原书目；附录 A（式（23）—（31））；附录 B（命题 B.1—B.4，式（32）—（35））；附录 C（式（36），图 13）；附录 D（式（37）—（56））；附录 E（图 14—18）；附录 F（连续性证明）；图 1—18 图注与表注。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—18 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 1 已用 PyMuPDF 渲染原 PDF 第 8 页逐格核对，表 2 按抽取文本与版式逐格转录；④作者简介与版权声明不在正文范围，未收录；⑤原文个别记号印刷不一致（如式（19）中 $q_j$ 与 QoI 值 $f_n$ 的用例、附录 D.5 中式（52）的 $\tilde w_n^{(m)}(w)$ 重复括号），译文按上下文整理；⑥本页在我撰写途中被外部进程追加了“登记”页脚与 raw/endraw 标记，我已把全部正文/附录/参考文献插入到该页脚之前，该页脚与 raw/endraw 标记保留在文件末尾。**qa_complete=false。**

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
