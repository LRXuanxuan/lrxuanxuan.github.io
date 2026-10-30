---
layout: page
title: "贝叶斯逆问题的鲁棒 A-最优实验设计｜中文全文译文"
permalink: /papers/translations/2026-10-04-2305-03855-robust-a-optimal-experimental-design-for-bayesian-inverse-problems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/50d12cc7ed367df8/) · [原文 arXiv](https://arxiv.org/abs/2305.03855) · [全部目录](/papers/catalog/)

# 贝叶斯逆问题的鲁棒 A-最优实验设计

**原题：** Robust A-Optimal Experimental Design for Bayesian Inverse Problems  
**作者：** Ahmed Attia、Sven Leyffer、Todd Munson（美国阿贡国家实验室数学与计算机科学部；联系邮箱：attia@mcs.anl.gov、leyffer@anl.gov、tmunson@mcs.anl.gov）  
**版本：** arXiv:2305.03855v1（math.OC），2023 年 5 月 5 日 arXiv 提交；原文脚注注明投稿日期为 2023 年 5 月 9 日，原文 25 页。  
**关键词：** 实验设计、贝叶斯反演、随机学习、二值优化、鲁棒优化。  
**AMS 主题分类：** 62K05, 35Q62, 62F15, 35R30, 35Q93, 65C60, 93E35。  
**资助说明（原文首页脚注）：** 本文部分工作由美国能源部（DOE）科学办公室先进科学计算研究办公室通过“科学发现先进计算”（SciDAC）计划下的 FASTMath 研究所资助，合同编号 DE-AC02-06CH11357，依托阿贡国家实验室。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–5 节（含 2.1–2.4、3.1–3.1.2、3.2、4.1–4.6.4 等全部小节）、附录 A.1、图注（图 1–11）、算法 3.1–3.2 与 49 条参考文献英文原条目均按原文结构录入；公式 (2.1)–(A.8) 按原编号录入；逐句逐式终校未做。

## 摘要

贝叶斯逆问题的实验最优设计近来广受欢迎并受到大量关注，尤其在计算科学与贝叶斯反演领域。最优设计使一个预先定义的效用函数最大化，而该函数由逆问题的若干要素表述，一个例子是面向参数辨识的最优传感器布点。遵循这一简单表述的现有算法途径通常忽略逆问题要素的**误设（misspecification）**，例如先验或测量不确定度的误设。本文提出一种高效算法途径，用于为贝叶斯逆问题设计最优实验设计方案，使最优设计对逆问题要素的误设具有鲁棒性。具体地，我们针对不确定或误设的参数采用**最坏情形（worst-case）**途径，提出鲁棒目标，并给出优化此类目标的算法途径。文中既讨论**松弛**解法，也讨论**随机**解法，并对问题的解释与所提算法途径给出详细分析和洞见。我们针对参数辨识问题中的传感器布点开展了大量数值实验，以验证并分析所提途径。

## 1. 引言

逆问题在基于仿真的预测中起基础性作用，并在科学发现中具有重要价值。数据同化提供了一套工具，专门用于求解大尺度乃至极端尺度设定下的逆问题，并产生准确、可信的预测；例如参见 [15,16,18,22,30]。逆问题解的质量在很大程度上受观测配置质量与所采集数据质量的影响。最优实验设计（optimal experimental design，OED）提供了优化设计观测配置与数据采集策略的工具 [21,24,31,36,41]，以优化预先定义的目标，例如最大化从实验或观测数据中获得的信息增益。OED 近来在计算科学与贝叶斯反演领域引发了兴趣激增；例如参见 [1–5,9,10,20,25–28]。

贝叶斯 OED 途径把最优设计定义为：使观测和/或实验数据的信息增益最大、从而最大化反演参数（即贝叶斯逆问题之解）质量的设计。然而，在广泛科学应用中，逆问题的要素可能被误设或描述得很宽松。因此，最优设计需要考虑贝叶斯逆问题各要素的不确定性或误设。一般而言，鲁棒 OED [6,33–35,38–40,48] 关注的是：针对由不确定或误设参数引起的平均情形或最坏情形，优化观测配置。前者需要为不确定参数赋予概率描述，得到的是平均意义下最优的设计；后者则寻求在不确定参数的可容许集上针对目标的下界最优的设计，因此不需要概率描述，是针对最坏情形最优的设计。这通过所谓的 **max-min 设计** [19,23,35] 实现，而它在模型约束的贝叶斯 OED 中受到的关注很少。

本文致力于为贝叶斯反演中的鲁棒 OED 建立一套形式化途径与算法。具体地，我们提出一种算法途径，通过求解 max-min 最优设计来求解贝叶斯反演中的传感器布点问题，其中先验和/或观测的不确定度/协方差被误设。当先验对反演参数掌握的信息很少或不足时，或者当传感器精度信息未被完全明确时，这种鲁棒性尤为重要。此外，它有助于缓解由不准确观测算子产生的代表性误差被误设所带来的影响。本文方法可以方便地扩展到考虑其他不确定或误设的参数，例如先验均值、仿真窗口长度以及时间观测频率。我们聚焦于线性/线性化贝叶斯 OED 问题的 A-最优设计；不过，按照本文给出的策略，可以很容易地把方法扩展到其他效用函数。

全文组织如下。第 2 节给出贝叶斯反演、OED 与鲁棒设计的数学背景。第 3 节给出为贝叶斯反演表述并求解鲁棒 OED 问题的若干途径。第 4 节给出数值结果。第 5 节给出结论性评述。

## 2. 背景

本节简要回顾贝叶斯反演与贝叶斯 OED 问题，用于最优数据采集与传感器布点。

### 2.1 贝叶斯反演

考虑由下式描述的前向模型

$$
\mathbf y=\mathcal F(\boldsymbol\theta)+\boldsymbol\delta, \tag{2.1}
$$

其中 $\boldsymbol\theta$ 是模型参数，$\mathbf y\in\mathbb R^{N_{\rm obs}}$ 是观测，$\boldsymbol\delta\in\mathbb R^{N_{\rm obs}}$ 是观测误差。在多数应用中，观测误差（刻画模型预测与实际数据之间失配）被假定为高斯，$\boldsymbol\delta\sim\mathcal N(\mathbf 0,\boldsymbol\Gamma_{\rm noise})$，其中 $\boldsymbol\Gamma_{\rm noise}$ 为观测误差协方差矩阵。此时数据似然为

$$
\mathcal L(\mathbf y\mid\boldsymbol\theta)\propto
\exp\left\{-\frac12\left\|\mathcal F(\boldsymbol\theta)-\mathbf y\right\|_{\boldsymbol\Gamma_{\rm noise}^{-1}}^2\right\}, \tag{2.2}
$$

其中对向量 $\mathbf x$ 与尺寸相容的矩阵 $\mathbf A$，矩阵加权范数定义为 $\|\mathbf x\|_{\mathbf A}^2=\mathbf x^T\mathbf A\mathbf x$。不过需要注意的是，本文所提途径（见第 3 节）并不局限于高斯观测误差，可以扩展到其他误差模型。

逆问题指在模型动力学约束下，从含噪观测 $\mathbf y$ 中恢复模型参数 $\boldsymbol\theta$。在贝叶斯反演中，需要给定一个编码参数现有知识的先验，目标是研究在观测 $\mathbf y$ 约束下 $\boldsymbol\theta$ 的概率分布，即应用 Bayes 定理所得的后验。假定高斯先验 $\boldsymbol\theta\sim\mathcal N(\boldsymbol\theta_{\rm pr},\boldsymbol\Gamma_{\rm pr})$ 与线性参数–可观测量映射 $\mathcal F=\mathbf F$，后验同样是高斯的 $\mathcal N(\boldsymbol\theta^y_{\rm post},\boldsymbol\Gamma_{\rm post})$，且

$$
\boldsymbol\Gamma_{\rm post}=\left(\mathbf F^*\boldsymbol\Gamma_{\rm noise}^{-1}\mathbf F
+\boldsymbol\Gamma_{\rm pr}^{-1}\right)^{-1},\qquad
\boldsymbol\theta^y_{\rm post}=\boldsymbol\Gamma_{\rm post}
\left(\boldsymbol\Gamma_{\rm pr}^{-1}\boldsymbol\theta_{\rm pr}
+\mathbf F^*\boldsymbol\Gamma_{\rm noise}^{-1}\mathbf y\right). \tag{2.3}
$$

这一设定被称为**线性高斯情形**，因其简洁而在许多应用中流行，尤其在数值天气预报用于求解大规模逆问题的数据同化算法中。目前有大量工作致力于处理仿真与观测的高度非线性并处理非高斯误差，例如基于采样的方法，包括 Markov 链 Monte Carlo [12–15,17] 与粒子滤波 [30,42]。

### 2.2 贝叶斯反演的 OED

二值 OED 优化问题的一般形式为

$$
\boldsymbol\zeta_{\rm opt}=\arg\max_{\boldsymbol\zeta\in\{0,1\}^{n_s}}\ \mathcal U(\boldsymbol\zeta), \tag{2.4}
$$

其中 $\boldsymbol\zeta\in\{0,1\}^{n_s}$ 是与候选配置（如传感器位置或类型）相关联的二值设计变量（1 表示候选被激活，0 表示不激活），$\mathcal U(\boldsymbol\zeta)$ 是预先定义的效用函数，用于量化与逆问题的推断参数/状态相关联的设计质量；见第 2.3 节。在贝叶斯反演中，候选可以对应拟议的传感器位置、观测时间点，或对逆问题解的质量、或对同化系统预测能力有影响的其他控制变量。效用函数例如可以设为总结观测数据信息增益的函数。下文为叙述清晰，聚焦于传感器布点这一应用；但需注意，本文工作可以扩展到其他二值控制变量与效用函数。

优化问题 (2.4) 常附加一个促进稀疏的项 $-\alpha\Phi(\boldsymbol\zeta)$（$\alpha\ge0$）以避免稠密设计——函数 $\Phi(\boldsymbol\zeta)$ 对设计施加正则化或稀疏性——从而降低部署观测传感器的代价。正则化二值 OED 优化问题为

$$
\boldsymbol\zeta_{\rm opt}=\arg\max_{\boldsymbol\zeta\in\{0,1\}^{n_s}}\ 
\mathcal J(\boldsymbol\zeta):=\mathcal U(\boldsymbol\zeta)-\alpha\Phi(\boldsymbol\zeta). \tag{2.5}
$$

该罚项（软约束）例如可以编码观测资源约束：$\sum_{i}^{n_s}\zeta_i\le k$ 或 $\sum_i^{n_s}\zeta_i=k$；$k\in\mathbb Z_+$，例如待部署传感器数量的上界（或精确预算）。该罚函数也可以是稀疏化（可能不可微）的函数，例如 $\|\boldsymbol\zeta\|_0$。注意 $\Phi(\boldsymbol\zeta)$ 是在表述优化问题之后额外加入的辅助项，且罚项符号为负。我们把 OED 优化问题 (2.5) 定义为最大化问题，因为我们使用“效用函数”这一术语；不过，最大化可以很容易地替换为等价的最小化问题，此时效用函数替换为等价的最优性准则，罚项符号翻转（即取正）。更多细节见第 2.3 节。

用传统二值优化方法求解 (2.5) 在计算上难以承受，通常替换为一个松弛问题

$$
\boldsymbol\zeta_{\rm opt}=\arg\max_{\boldsymbol\zeta\in[0,1]^{n_s}}\ 
\mathcal J(\boldsymbol\zeta):=\mathcal U(\boldsymbol\zeta)-\alpha\Phi(\boldsymbol\zeta), \tag{2.6}
$$

其中与任一传感器相关联的设计变量被松弛为可取区间 $[0,1]$ 内的任意值，然后用基于梯度的优化方法求解松弛问题 (2.6)，以估计原二值优化问题 (2.5) 的解。在许多情况下，该途径需要对 (2.6) 的解施加取整方法（例如累加取整），才能得到原二值优化问题解的估计 [47]。然而，这种松弛对 OED 优化问题及所得实验设计的影响很少受到关注。一般而言，松弛生成一个连接二值域各角点（或其近似）的曲面，在此曲面上应用基于梯度的优化算法求解 (2.6)。因此，施加松弛时必须保证松弛目标 $\mathcal J$ 在区域 $[0,1]^{n_s}$ 上连续，且在区域的边界/角点处有恰当的极限。该问题在 [10] 中有广泛讨论，并将在第 2.3 节中再次讨论。

最近，[11] 针对二值 OED 提出了一种随机学习途径，以高效求解 (2.5)：通过对最优参数采样来获得最优设计：

$$
\mathbf p_{\rm opt}=\arg\max_{\mathbf p\in[0,1]^{n_s}}\ 
\Upsilon(\mathbf p):=\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\mathcal J(\boldsymbol\zeta)\right], \tag{2.7}
$$

其中 $\mathbb P(\boldsymbol\zeta|\mathbf p)$ 是参数为 $\mathbf p$ 的多元 Bernoulli 分布，$\mathbf p$ 规定了 $\boldsymbol\zeta$ 各元素的成功/激活概率，即 $p_i\in[0,1]$。(2.7) 中的期望定义为

$$
\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\mathcal J(\boldsymbol\zeta)\right]
=\sum_{k=1}^{2^{n_s}}\mathcal J(\boldsymbol\zeta^{[k]})\,
\mathbb P(\boldsymbol\zeta^{[k]});\qquad
\boldsymbol\zeta\in\{0,1\}^{n_s}, \tag{2.8}
$$

其中设计 $\boldsymbol\zeta$ 的每一个可能二值（向量）取值由唯一索引 $k\in1,\dots,2^{n_s}$ 标识。一种简单的索引方案是依据设计 $\boldsymbol\zeta$ 的逐元素值定义唯一索引 $k:=1+\sum_{i=1}^{n_s}\zeta_i2^{i-1}$（$\zeta_i\in\{0,1\}$）。期望 (2.8) 并不显式计算，其导数按随机梯度途径高效近似。如 [11] 所述，与 (2.6) 不同，随机途径 (2.7) 在计算上高效，且不需要目标 $\mathcal J(\boldsymbol\zeta)$ 关于设计可微。本文在鲁棒设计背景下，采用并讨论求解二值 OED 优化问题 (2.5) 的这两种途径，即标准松弛 (2.6) 与随机途径 (2.7)。在第 2.3 节中，我们讨论贝叶斯 OED 中表述效用函数 $\mathcal U$ 的一般途径。

### 2.3 OED 效用函数

在传感器布点应用中，二值设计的作用是重构观测向量，或等价地重构观测误差协方差矩阵。在贝叶斯 OED 中（例如参见 [1–3,9,25,26]），通过把设计 $\boldsymbol\zeta$ 引入逆问题，观测协方差 $\boldsymbol\Gamma_{\rm noise}$ 被替换为其加权版本 $\mathbf W_\Gamma(\boldsymbol\zeta)$，从而得到加权数据似然

$$
\mathcal L(\mathbf y\mid\boldsymbol\theta;\boldsymbol\zeta)\propto
\exp\left\{-\frac12\left\|\mathcal F(\boldsymbol\theta)-\mathbf y\right\|_{\mathbf W_\Gamma(\boldsymbol\zeta)}^2\right\}, \tag{2.9}
$$

其中 $\mathbf W_\Gamma(\boldsymbol\zeta)$ 是精度矩阵 $\boldsymbol\Gamma_{\rm noise}^{-1}$ 的加权版本，由删除 $\boldsymbol\Gamma_{\rm noise}$ 中与非激活传感器对应的行（与列）得到。对二值设计 $\boldsymbol\zeta\in\{0,1\}^{n_s}$（即对 (2.5) 与 (2.7) 二者），可以通过如下定义加权精度矩阵来实现：

$$
\mathbf W_\Gamma(\boldsymbol\zeta):=
\left(\mathrm{diag}(\boldsymbol\zeta)\,\boldsymbol\Gamma_{\rm noise}\,\mathrm{diag}(\boldsymbol\zeta)\right)^\dagger
\equiv\mathbf L^T\left(\mathbf L\left(\mathrm{diag}(\boldsymbol\zeta)\boldsymbol\Gamma_{\rm noise}\mathrm{diag}(\boldsymbol\zeta)\right)\mathbf L^T\right)^{-1}\mathbf L, \tag{2.10}
$$

其中 $^\dagger$ 为 Moore–Penrose 伪逆，$\mathbf L:=\mathbf L(\boldsymbol\zeta)\in\mathbb R^{n_a\times n_s}$ 是一个稀疏矩阵，它从设计矩阵 $\mathbf W_\Gamma$ 中提取与设计 $\boldsymbol\zeta$ 的非零元素相对应的 $n_a:=\sum\zeta$ 个非零行/列。具体地，$\mathbf L$ 是一个二值矩阵：每一行 $i$ 只有一个元素等于 1，其列对应 $\boldsymbol\zeta$ 中第 $i$ 个非零元素的位置。然而在松弛情形下，加权似然通过把精度矩阵 $\boldsymbol\Gamma_{\rm noise}$ 替换为更一般的形式来表述：

$$
\mathbf W_\Gamma(\boldsymbol\zeta):=
\left(\mathbf W(\boldsymbol\zeta)\odot\boldsymbol\Gamma_{\rm noise}\right)^\dagger
\equiv\mathbf L^T\left(\mathbf L\left(\mathbf W(\boldsymbol\zeta)\odot\boldsymbol\Gamma_{\rm noise}\right)\mathbf L^T\right)^{-1}\mathbf L, \tag{2.11a}
$$

其中 $\odot$ 是 Hadamard（Schur）乘积，$\mathbf W(\boldsymbol\zeta)$ 是加权矩阵，其元素定义为

$$
\varpi(\zeta_i,\zeta_j)=
\begin{cases}
\omega_i\omega_j, & i\ne j,\\[2pt]
0, & i=j,\ \omega_i=0,\\[2pt]
\dfrac{1}{\omega_i^2}, & i=j,\ \omega_i\ne0,
\end{cases}
\qquad i,j=1,2,\dots,n_s, \tag{2.11b}
$$

其中 $\omega_i=\omega(\zeta_i)\in[0,1]$ 是与第 $i$ 个候选传感器相关联的权重，依据松弛设计 $\zeta_i\in[0,1]$ 的取值计算。该函数最简单形式为 $\omega_i(\zeta_i):=\zeta_i$；更多细节及其他形式的加权函数 $\varpi$ 见 [10]。加权精度矩阵的这种表述 (2.11) 保持了 OED 目标在区域边界处的连续性，从而生成一个松弛曲面，连接在区域角点（即二值设计处）评估的 OED 目标函数值。注意加权精度矩阵的一般形式 (2.11) 对二值设计 $\boldsymbol\zeta\in\{0,1\}^{n_s}$ 退化为 (2.10)。本文所提鲁棒 OED 途径（见第 3 节）遵循 [11] 的随机学习途径，只使用二值设计值、避免松弛设计，因此这里两种形式 (2.10) 与 (2.11) 可以等价使用。

> **原文疑点：** 此处原文写作 “the two forms (2.10) and (2.10) can be equivalently utilized here”，同一式号 (2.10) 重复出现；按上下文（二值形式 (2.10) 与一般加权形式 (2.11) 的等价性）应为 “(2.10) 与 (2.11)”。本译按上下文译为后一种理解，原文式号重复照录于此说明。

若问题是线性的，后验为高斯 (2.3)，其后验协方差 $\boldsymbol\Gamma_{\rm post}$ 与先验均值和实际数据实例无关。于是，最优设计可定义为：在实际部署观测传感器之前，使后验不确定度的某个标量摘要最优的设计。一般而言，在线性高斯设定下，多数 OED 效用函数（例如利用 Fisher 信息矩阵（FIM）或后验协方差矩阵的效用）都与先验均值和实际数据实例无关，只依赖仿真模型以及先验与观测噪声所规定的不确定度。流行的效用函数包括：A-最优设计的 $\mathcal U(\boldsymbol\zeta):=\mathrm{Tr}(\mathrm{FIM}(\boldsymbol\zeta))$ 与 D-最优设计的 $\mathcal U(\boldsymbol\zeta):=\log\det(\mathrm{FIM}(\boldsymbol\zeta))$。在线性高斯情形下，信息矩阵 FIM 等于后验协方差矩阵 (2.3) 的逆，即 $\mathrm{FIM}(\boldsymbol\zeta)\equiv\boldsymbol\Gamma_{\rm post}^{-1}(\boldsymbol\zeta)=\mathbf F^*\mathbf W_\Gamma(\boldsymbol\zeta)\mathbf F+\boldsymbol\Gamma_{\rm pr}^{-1}$，其中 $\mathbf F$ 与 $\mathbf F^*$ 分别为线性前向（参数–可观测量）算子及其伴随。然而当模型 $\mathcal F$ 非线性时，FIM 需要在真实参数处评估切线性模型，即 $\mathbf F=\partial\mathcal F|_{\boldsymbol\theta=\boldsymbol\theta_{\rm true}}$。因此，为获得最优设计，可以交替进行：求 $\boldsymbol\theta$ 的最大后验（MAP）估计，并在该估计附近用高斯近似求解 OED 问题。该途径等同于用 Laplacian 近似迭代求解 OED 问题，其中后验用在 MAP 估计附近的高斯近似 [9]。不过，该途径需要针对特定先验均值（假定高斯先验）与给定数据生成过程求解逆问题。注意当使用 FIM 时，最优设计定义为信息量的最大化者；而在后验不确定度情形下，最优设计由求解最小化问题定义。如第 2.2 节所述，两种情形下都必须相应地定义正则化的符号。本文为清晰起见只讨论前一种情形，即按 (2.5) 定义最优设计。处理非线性与/或非高斯的另一种途径，是用先验与后验之间的 KL 散度作为效用函数 [28]。

如第 1 节所述，本文聚焦于线性/线性化贝叶斯 OED 问题的 A-最优设计，即把效用函数定义为 FIM 的迹：

$$
\mathcal U(\boldsymbol\zeta):=\mathrm{Tr}\left(\mathrm{FIM}(\boldsymbol\zeta)\right)
:=\mathrm{Tr}\left(
\mathbf F^*\left(\mathbf W(\boldsymbol\zeta)\odot\boldsymbol\Gamma_{\rm noise}\right)^\dagger\mathbf F
+\boldsymbol\Gamma_{\rm pr}^{-1}
\right), \tag{2.12}
$$

其中加权精度矩阵 $\mathbf W_\Gamma(\boldsymbol\zeta)$ 由 (2.10) 定义。

### 2.4 鲁棒性的必要性：逆问题误设

在贝叶斯反演与贝叶斯 OED 中，最优设计 $\boldsymbol\zeta_{\rm opt}$ 高度依赖先验与观测误差模型的准确程度。具体地，利用 FIM 或后验协方差的效用函数，会受到先验协方差 $\boldsymbol\Gamma_{\rm pr}$ 与观测误差协方差 $\boldsymbol\Gamma_{\rm noise}$ 准确性的极大影响。先验选择在广泛的应用中仍是难题。此外，观测误差协方差 $\boldsymbol\Gamma_{\rm noise}$ 依据仪器误差与代表性误差（即把模型状态映射到观测空间的观测算子的不准确性）来指定。因此，在实际应用中，先验不确定度与观测误差不确定度都可能被轻易误设，或只能先验地知道到某种程度。这种误设或不确定性会改变各候选设计对应的效用值。人们可以指定不确定参数的一个名义值并用它求解 OED 问题；然而所得设计只对该特定选择最优，对名义值以外的情形可能给出很差的结果。因此，在求解 OED 问题时必须恰当地考虑这种误设。

在第 3 节中，我们这样表述 OED 问题：使所得设计对先验协方差 $\boldsymbol\Gamma_{\rm pr}$ 或观测误差协方差 $\boldsymbol\Gamma_{\rm noise}$ 的误设具有鲁棒性。我们还给出求解所表述鲁棒 OED 问题的算法流程。

**图 1：** 鲁棒二值优化示意图。设计变量有两个可能取值 $\boldsymbol\zeta\in\{0,1\}$；为简单起见，不确定参数假定为有限集 $\lambda\in\{\lambda_i\mid i=1,\dots,5\}$。此处的鲁棒最优设计为 $\zeta_{\rm opt}=0$，因为它取到下界 $\{\min_\lambda\mathcal J(0,\lambda),\min_\lambda\mathcal J(1,\lambda)\}$ 的最大值。

## 3. 鲁棒贝叶斯 OED

为了恰当考虑逆问题要素或参数的误设，必须为误设/不确定参数恰当刻画一个可容许集。本文聚焦于把先验协方差 $\boldsymbol\Gamma_{\rm pr}$ 与观测误差协方差作为不确定参数，并分别独立研究两种情形。为此，假定先验协方差参数化为 $\boldsymbol\Gamma_{\rm pr}:=\boldsymbol\Gamma_{\rm pr}(\lambda_{\rm pr})$，其中 $\lambda_{\rm pr}\in\Lambda_{\rm pr}$；类似地，假定观测误差协方差参数化为 $\boldsymbol\Gamma_{\rm noise}:=\boldsymbol\Gamma_{\rm noise}(\lambda_{\rm noise})$，其中 $\lambda_{\rm noise}\in\Lambda_{\rm noise}$。于是效用函数取形式 $\mathcal U(\boldsymbol\zeta,\lambda_{\rm pr},\lambda_{\rm noise})$；又因为 $\mathcal J$ 是效用函数 $\mathcal U$ 的正则化版本，目标函数也取形式 $\mathcal J(\boldsymbol\zeta,\lambda_{\rm pr},\lambda_{\rm noise})$。注意参数化形式必须保证所得协方差算子/矩阵对称正定。

为使讨论更具一般性，用 $\lambda\in\Lambda$ 表示不确定参数，其中 $\Lambda$ 是 $\lambda$ 的可容许集。这里 $\lambda$ 可以是先验协方差的参数 $\lambda=\lambda_{\rm pr}$、数据不确定度参数 $\lambda=\lambda_{\rm noise}$，或二者兼有 $(\lambda_{\rm pr}^T,\lambda_{\rm noise}^T)^T$。于是效用函数与正则化目标取一般形式 $\mathcal U(\boldsymbol\zeta,\lambda)$ 与 $\mathcal J(\boldsymbol\zeta,\lambda)$。

我们先在第 3.1 节讨论通过针对最坏情形（max-min）优化来鲁棒化二值优化问题 (2.5) 的效果与洞见，随后从第 3.2 节开始给出所提途径。

### 3.1 二值优化问题鲁棒化的洞见

如第 1 节所述，我们采用保守途径（Wald 的极大极小模型 [44,45]）来表述并求解鲁棒 OED 问题。具体地，我们关心表述并求解 (2.5) 的鲁棒对应问题，以找到针对最坏情形（worst-case，WC）的最优设计。于是，定义对 $\lambda$ 的误设具有鲁棒性的最优设计为

$$
\boldsymbol\zeta_{\rm WC-opt}=\arg\max_{\boldsymbol\zeta\in\{0,1\}^{n_s}}\ 
\min_{\lambda\in\Lambda}\ \mathcal J(\boldsymbol\zeta,\lambda). \tag{3.1}
$$

该途径寻求设计 $\boldsymbol\zeta$，使目标 $\mathcal J$ 相对不确定参数所定义的最坏情形最大化，即相对 $\lambda$ 定义的下包络最大化。图 1 对一维二值设计 $\boldsymbol\zeta\in\{0,1\}$ 给出了鲁棒二值优化的简单示意说明。

注意为不确定参数选取名义值可能导致错误的解。例如，若只针对名义值 $\lambda=\lambda_5$ 求解二值优化问题，则最优解（即使目标最大化的设计）为 $\zeta=1$，这与鲁棒最优设计 $\zeta_{\rm opt}=0$ 不同。还要注意，由不确定参数构造的下界 $\{\min_\lambda\mathcal J(0,\lambda),\min_\lambda\mathcal J(1,\lambda)\}$ 并非由不确定参数的单一取值形成。因此，把 OED 优化问题的解限制在某个特定名义值上，一般不会得到鲁棒最优设计。

我们指出，对 A-最优鲁棒设计，可以去掉对不确定先验 $\lambda_{\rm pr}$ 的依赖，因为它不影响最优设计。这一观察来自如下等价关系：

$$
\begin{aligned}
&\max_{\boldsymbol\zeta\in\{0,1\}^{n_s}}\min_{\lambda\in\Lambda}\ 
\mathrm{Tr}\left(\mathrm{FIM}(\boldsymbol\zeta)\right)
:=\mathrm{Tr}\left(
\mathbf F^*\left(\mathbf W(\boldsymbol\zeta)\odot\boldsymbol\Gamma_{\rm noise}(\lambda_{\rm noise})\right)^\dagger\mathbf F
+\boldsymbol\Gamma_{\rm pr}(\lambda_{\rm pr})^{-1}\right)\\
\Leftrightarrow\;&
\max_{\boldsymbol\zeta\in\{0,1\}^{n_s}}\min_{\lambda\in\Lambda}
\left\{
\mathrm{Tr}\left(\mathbf F^*\left(\mathbf W(\boldsymbol\zeta)\odot\boldsymbol\Gamma_{\rm noise}(\lambda_{\rm noise})\right)^\dagger\mathbf F\right)
+\mathrm{Tr}\left(\boldsymbol\Gamma_{\rm pr}(\lambda_{\rm pr})^{-1}\right)
\right\}\\
\Leftrightarrow\;&
\max_{\boldsymbol\zeta\in\{0,1\}^{n_s}}\min_{\lambda\in\Lambda}
\mathrm{Tr}\left(\mathbf F^*\left(\mathbf W(\boldsymbol\zeta)\odot\boldsymbol\Gamma_{\rm noise}(\lambda_{\rm noise})\right)^\dagger\mathbf F\right)
+\min_{\lambda\in\Lambda}\mathrm{Tr}\left(\boldsymbol\Gamma_{\rm pr}(\lambda_{\rm pr})^{-1}\right),
\end{aligned}
$$

其中第一式到第二式用到迹算子的线性性，第二式到第三式用到第二个迹与 $\boldsymbol\zeta$ 无关这一事实。因此，我们的分析中不纳入 $\boldsymbol\Gamma_{\rm pr}$ 的不确定性。不过我们也要指出，对其他鲁棒设计（例如 D-最优鲁棒设计），先验的不确定性需要纳入考虑。

#### 3.1.1 一般算法求解途径

算法 3.1 是 [29] 给出的、用于求解 max-min 优化问题 (3.1) 及其他松弛的一般采样型途径。

**算法 3.1　求解 max-min 优化问题 (3.1) 的算法**

输入：初始猜测 $\boldsymbol\zeta^{(0)}$；以及来自不确定参数可容许集的初始样本 $\widehat\Lambda^{(k)}:=\{\lambda^{(i)}\in\Lambda\mid i=1,\dots,k-1\}$

输出：$\boldsymbol\zeta_{\rm WC-opt}$

1. 初始化 $l=0$
2. **while** 未收敛 **do**
3. 　$\boldsymbol\zeta^{(l+1)}\leftarrow\arg\max_{\boldsymbol\zeta}\min_{\lambda'\in\widehat\Lambda^{(k+l-1)}}\mathcal J(\boldsymbol\zeta,\lambda)$
4. 　$\lambda^{(k+l)}\leftarrow\arg\min_{\lambda\in\Lambda}\mathcal J(\boldsymbol\zeta^{(l+1)},\lambda)$
5. 　$\widehat\Lambda^{(k+l)}\leftarrow\widehat\Lambda^{(k+l-1)}\cup\{\lambda^{(k+l)}\}$
6. 　$l\leftarrow l+1$
7. **end while**
8. $\boldsymbol\zeta_{\rm WC-opt}\leftarrow\boldsymbol\zeta^{(l+1)}$
9. **return** $\boldsymbol\zeta_{\rm WC-opt}$

算法 3.1 从不确定参数的一个初始有限样本 $\widehat\Lambda\subset\Lambda$ 出发，交替求解两个优化问题。第一个（第 3 步）是更新目标变量（此处为设计）$\boldsymbol\zeta$ 的最大化问题；第二个（第 4 步）是更新不确定参数的最小化问题，所得参数随后用于扩大样本 $\widehat\Lambda$，直到收敛。鲁棒 OED 的 max-min 保守途径可追溯到早期工作 [33,35,46]；但已有工作（例如 [6,46]）指出，尽管该途径很重要，由于 max-min 优化带来的计算开销，它并未被广泛使用。例如，按算法 3.1 的步骤求解 (3.1)，需要枚举所有可能的二值设计，并且依 $\lambda$ 的性质，还需要探查不确定参数 $\lambda$ 的空间。

两个优化步骤（第 3 步与第 4 步）可以按基于梯度的途径执行；但这样做需要对二值设计施加松弛，从而允许 $\boldsymbol\zeta$ 取 $[0,1]$ 中的所有值。此外，第 3 步涉及目标 $f(\boldsymbol\zeta,\lambda)$ 关于目标变量 $\boldsymbol\zeta$ 在不确定参数的有限样本 $\widehat\Lambda$ 上的导数，这将需要引入广义梯度（generalized gradient）的概念 [37]。然而下面我们将说明，通过在相应的 Bernoulli 参数上优化，可以避免广义梯度带来的复杂性。本文提出并讨论一种高效途径，以克服此类障碍，为贝叶斯逆问题的传感器布点给出鲁棒最优设计。第 3.1.2 节分享我们对求解 (3.1) 的朴素尝试的洞见，随后在第 3.2 节给出所提途径。

#### 3.1.2 朴素松弛与随机表述

如第 2.2 节所述，为求解 (3.1)，我们可以把外层优化问题替换为松弛 (2.6) 或随机表述 (2.7)。这相当于把优化问题 (3.1) 替换为下列两种表述之一：

$$
\boldsymbol\zeta_{\rm WC-opt}=\arg\max_{\boldsymbol\zeta\in[0,1]^{n_s}}\ 
\min_{\lambda\in\Lambda}\ \mathcal J(\boldsymbol\zeta,\lambda) \tag{3.2a}
$$

$$
\mathbf p^{\rm WC-opt}_\lambda=\arg\max_{\mathbf p\in[0,1]^{n_s}}\ 
\min_{\lambda\in\Lambda}\ \Upsilon(\mathbf p,\lambda)
:=\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\mathcal J(\boldsymbol\zeta,\lambda)\right]. \tag{3.2b}
$$

(3.2a) 把外层二值优化问题替换为松弛设计空间上的松弛问题；而 (3.2b) 把外层问题替换为随机表述，其目标是找到对误设参数 $\lambda$ 鲁棒的最优观测策略（激活概率）。如 [11] 所述，松弛形式 (3.2a) 要求罚项可微，且求解过程需要指定效用函数 $\mathcal U$ 关于设计 $\boldsymbol\zeta$ 的导数；而 (3.2b) 既不要求罚项可微，也不要求效用函数关于设计的导数。

这些表述鲁棒二值 OED 优化问题的尝试相当直观，但两种表述 (3.2a) 与 (3.2b) 彼此不等价，也不等价于原鲁棒二值优化问题 (3.1)。图 2 说明了这一点，它把图 1 的示例分别按 (3.2a)（左）与 (3.2b)（右）的表述加以扩展。

**图 2：** 与图 1 类似。左：用 (3.2a) 把设计松弛到区域 $[0,1]$；右：使用随机表述 (3.2b)。两种表述 (3.2) 的最优解不相等，且都不同于原鲁棒二值优化问题 (3.1) 的解。

注意，尽管松弛构造的下界包络处处连续，但该示例中关于设计 $\boldsymbol\zeta$（或随机表述中的 Bernoulli 参数 $\mathbf p$）的可微性并未保持，因此对表述 (3.2) 一般不能保证可微性。这意味着无法用基于梯度的优化程序求解外层（最大化）优化问题。此外，该情形下两种表述 (3.2) 的最优解都是非二值的，这必须借助取整方法才能得到原鲁棒二值 OED 优化问题 (3.1) 解的二值估计。第 3.2 节给出一种克服此类障碍的表述。

### 3.2 鲁棒二值优化：随机学习途径

我们把随机鲁棒二值优化问题表述为

$$
\mathbf p^{\rm WC-opt}_\lambda=\arg\max_{\mathbf p\in[0,1]^{n_s}}\ 
\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\min_{\lambda\in\Lambda}\mathcal J(\boldsymbol\zeta,\lambda)\right]. \tag{3.3}
$$

形式 (3.3) 构造了一个期望曲面（光滑），它连接目标（关于 $\lambda$ 的）在所有可能二值设计变量 $\boldsymbol\zeta\in\{0,1\}^{n_s}$ 处的最小值。这一事实借助第 3.1 节与第 3.1.2 节所用的示例加以说明，并在图 3 中示意给出。

**图 3：** 与图 2 类似，此处使用随机表述 (3.3)。

该表述可应用于一般鲁棒二值优化问题。这里我们在引言所述的传感器布点二值 OED 问题背景下讨论表述与算法途径。具体地，我们如下表述鲁棒 A-OED 的随机优化问题 (3.4)：

$$
\mathbf p^{\rm WC-opt}_\lambda=\arg\max_{\mathbf p\in[0,1]^{n_s}}\ 
\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\min_{\lambda\in\Lambda}\mathcal J(\boldsymbol\zeta,\lambda)\right],
$$
$$
\mathcal J(\boldsymbol\zeta,\lambda)=\mathrm{Tr}\left(\mathrm{FIM}(\boldsymbol\zeta,\lambda)\right)-\alpha\Phi(\boldsymbol\zeta),
$$
$$
\mathrm{FIM}(\boldsymbol\zeta,\lambda)=\mathbf F^*\left(
\mathrm{diag}(\boldsymbol\zeta)\boldsymbol\Gamma_{\rm noise}(\lambda)\mathrm{diag}(\boldsymbol\zeta)
\right)^\dagger\mathbf F+\boldsymbol\Gamma_{\rm pr}^{-1}, \tag{3.4}
$$

其中所有设计变量都是二值的，即 $\zeta_i\in\{0,1\}$，$i=1,\dots,n_s$。数值求解优化问题 (3.4) 时，为求解外层优化问题并不需要目标 $\mathcal J$ 关于设计 $\boldsymbol\zeta$ 可微；按定义，该目标连续且关于 Bernoulli 参数 $\mathbf p$ 可微。然而为求解内层优化问题，目标 $\mathcal J$ 必须关于不确定参数 $\lambda$ 可微。注意罚函数 $\Phi$ 与不确定参数无关，因此不要求其可微。

为求解 (3.4)，我们扩展算法 3.1，把外层优化问题的目标函数定义为 (3.4) 中已给出的、带罚项的鲁棒 A-最优 OED 随机目标

$$
\Upsilon(\mathbf p,\lambda):=\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\min_\lambda\mathcal J(\boldsymbol\zeta,\lambda)\right].
$$

因此，需要导出随机目标 $\Upsilon(\mathbf p,\lambda)$ 关于 Bernoulli 分布超参数 $\mathbf p$ 的导数。期望关于 Bernoulli 分布超参数 $\mathbf p$ 的导数，借助 [11] 中解释的核技巧（kernel trick）近似。具体地，由 [11, Equation 3.9] 可得

$$
\begin{aligned}
\nabla_{\mathbf p}\Upsilon(\mathbf p,\lambda)
&=\nabla_{\mathbf p}\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\min_\lambda\mathcal J(\boldsymbol\zeta,\lambda)\right]
=\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\min_\lambda\mathcal J(\boldsymbol\zeta,\lambda)\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta|\mathbf p)\right]\\
&\approx\frac{1}{N_{\rm ens}}\sum_{k=1}^{N_{\rm ens}}
\min_\lambda\mathcal J(\boldsymbol\zeta^{[k]},\lambda)\,
\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta^{[k]}|\mathbf p),
\end{aligned} \tag{3.5}
$$

其中给定 $N_{\rm ens}>0$ 个从参数为 $\mathbf p$ 的多元 Bernoulli 分布抽取的样本 $\{\boldsymbol\zeta^{[k]}\sim\mathbb P(\boldsymbol\zeta|\mathbf p)\mid k=1,\dots,N_{\rm ens}\}$，且 Bernoulli 分布的对概率梯度 $\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta^{[k]}|\mathbf p)$ 为

$$
\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta|\mathbf p)
=\sum_{i=1}^{n_s}\left(\frac{\zeta_i}{p_i}+\frac{\zeta_i-1}{1-p_i}\right)\mathbf e_i;\qquad
p_i\in(0,1), \tag{3.6}
$$

其中 $\mathbf e_i$ 是 $\mathbb R^{n_s}$ 中的第 $i$ 个单位向量，$p_i$ 是 $\mathbf p$ 的第 $i$ 个元素。

如第 3.1.1 节所述，为求解外层（最大化）问题，算法 3.1 需要在不确定参数的有限样本 $\widehat\Lambda\subset\Lambda$ 上导出梯度。此情形下的梯度为

$$
\nabla_{\mathbf p}\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\min_{\lambda\in\widehat\Lambda}\mathcal J(\boldsymbol\zeta,\lambda)\right]
\approx\frac{1}{N_{\rm ens}}\sum_{k=1}^{N_{\rm ens}}
\mathcal J(\boldsymbol\zeta^{[k]},\lambda^*)\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta|\mathbf p), \tag{3.7a}
$$

$$
\lambda^*\in\arg\min_{\lambda\in\widehat\Lambda}\ \mathcal J(\boldsymbol\zeta,\lambda). \tag{3.7b}
$$

注意 (3.5) 与 (3.7) 都要求计算 $\min_\lambda\mathcal J(\boldsymbol\zeta^{[k]},\lambda)$，即目标 $\mathcal J$（在有限个 $\lambda$ 上）在名义二值设计 $\boldsymbol\zeta^{[k]}$ 处的最小值。反过来，数值求解算法 3.1 第 4 步的内层优化问题需要梯度 $\nabla_\lambda\mathcal J(\boldsymbol\zeta,\lambda)=\nabla_\lambda\mathcal U(\boldsymbol\zeta,\lambda)$，这要求明确 $\mathcal J$ 对 $\lambda$ 的依赖关系。关于 $\lambda=\lambda_{\rm noise}$ 的梯度在附录 A.1 中导出，其结果为

$$
\nabla_{\lambda_{\rm noise}}\mathcal J(\boldsymbol\zeta,\lambda)
=-\sum_{i=1}^{n_s}\mathrm{Tr}\left(
\mathbf F^*\mathbf W_\Gamma\mathrm{diag}(\boldsymbol\zeta)
\frac{\partial\boldsymbol\Gamma_{\rm noise}(\lambda_{\rm noise})}{\partial\lambda_{{\rm noise},i}}
\mathrm{diag}(\boldsymbol\zeta)\mathbf W_\Gamma\mathbf F
\right)\mathbf e_i, \tag{3.8}
$$

其中 $\mathbf W_\Gamma=\mathbf W_\Gamma(\boldsymbol\zeta;\lambda_{\rm noise})$ 由 (2.10) 给出。注意 (3.8) 中参数化观测误差协方差矩阵的导数依赖于具体应用，因此将在数值实验背景下进一步讨论；见第 4 节。

**通过方差缩减提升性能.** 如 [11] 所述，利用随机梯度近似的算法，其性能可以通过降低随机梯度估计量的变异性而显著提升。这例如可以通过使用对偶变量（antithetic variates）或重要性采样，并向目标引入一个基线常数 $b$、把 $\mathcal J(\boldsymbol\zeta,\lambda)$ 替换为 $\mathcal J(\boldsymbol\zeta,\lambda)-b$ 来实现。基线的最优值 $b^{\rm opt}$ 随后选取为使梯度随机估计的总方差最小。此情形下（参见 [11] 中关于最优基线的讨论），梯度 (3.7a) 替换为

$$
\nabla_{\mathbf p}\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}
\left[\min_{\lambda\in\widehat\Lambda}\mathcal J(\boldsymbol\zeta,\lambda)-b^{\rm opt}\right]
\approx\frac{1}{N_{\rm ens}}\sum_{k=1}^{N_{\rm ens}}
\left(\mathcal J(\boldsymbol\zeta^{[k]},\lambda^{*[k]})-b^{\rm opt}\right)
\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta|\mathbf p), \tag{3.9a}
$$

$$
b^{\rm opt}\approx\widehat b^{\rm opt}:=
\frac{
\sum_{e=1}^{N_b}\left(
\sum_{j=1}^{N_{\rm ens}}\mathcal J(\boldsymbol\zeta^{[e,j]},\lambda^{*[e,j]})\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta^{[e,j]}|\mathbf p)
\right)^T
\left(
\sum_{j=1}^{N_{\rm ens}}\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta^{[e,j]}|\mathbf p)
\right)}
{N_{\rm ens}N_b\displaystyle\sum_{i=1}^{n_s}\frac{1}{p_i-p_i^2}}, \tag{3.9b}
$$

$$
\lambda^{*[k]}=\arg\min_{\lambda\in\widehat\Lambda}\ \mathcal J(\boldsymbol\zeta^{[k]},\lambda)
=\arg\min_{\lambda\in\widehat\Lambda}\ \mathrm{Tr}\left(\mathrm{FIM}(\boldsymbol\zeta^{[k]},\lambda)\right), \tag{3.9c}
$$

其中我们引入基线以降低随机估计量的变异性，如 (3.9a) 所示。此情形下，$\lambda^{*[k]}$ 是在有限样本 $\widehat\Lambda$ 上、对样本中第 $k$ 个二值设计 $\boldsymbol\zeta^{[k]}$ 使 $\mathcal J$ 取最小值的那个不确定参数 $\lambda$，而不是最小化期望值 $\mathbb E[\mathcal J]$ 的样本平均近似。这降低了基线自身的随机性，从而降低随机梯度的变异性，进而使优化算法表现更好。

**完整算法表述.** 我们以算法 3.2 给出鲁棒随机最速上升（steepest ascent）途径的完整算法描述，作为第 3.2 节的结尾。

**算法 3.2　求解鲁棒随机 OED 问题 (3.4) 的算法**

输入：初始策略参数 $\mathbf p^{(0)}\in(0,1)^{n_s}$；步长 $(\gamma_1,\gamma_2)$；样本量 $N_{\rm ens},N_b,m$；以及来自不确定参数可容许集的初始样本 $\widehat\Lambda^{(k)}:=\{\lambda^{(i)}\in\Lambda\mid i=1,\dots,k\}$

输出：$\boldsymbol\zeta_{\rm WC-opt}$

1. 初始化 $l=0$
2. **while** 未收敛 **do**
3. 　更新 $l\leftarrow l+1$
4. 　$\mathbf p^{(l+1)}\leftarrow\arg\max_{\mathbf p}\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p^{(l)})}\left[\min_{\lambda'\in\widehat\Lambda^{(k+l-1)}}\mathcal J(\boldsymbol\zeta,\lambda)\right]$　▷ 调用 STOCPARAMOPT
5. 　更新 $\lambda^{(k+l)}\leftarrow\arg\min_{\lambda\in\Lambda}\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p^{(l+1)})}\left[\mathcal J(\boldsymbol\zeta,\lambda)\right]$　▷ 调用 NOISEOPT
6. 　$\widehat\Lambda^{(k+l)}\leftarrow\widehat\Lambda^{(k+l-1)}\cup\{\lambda^{(k+l)}\}$
7. **end while**
8. $\mathbf p^{\rm WC-opt}_\lambda\leftarrow\mathbf p^{(l+1)}$
9. 采样 $S=\{\boldsymbol\zeta^{[j]}\sim\mathbb P(\boldsymbol\zeta\mid\mathbf p^{\rm WC-opt}_\lambda);\ j=1,\dots,m\}$
10. 对样本 $S$ 中的每个 $\boldsymbol\zeta$，计算 $\mathcal J(\boldsymbol\zeta,\lambda^{k+l})$
11. **return** $\boldsymbol\zeta^{\rm WC-opt}_\lambda$：样本 $S$ 中使 $\mathcal J$ 取最大值的那个设计 $\boldsymbol\zeta$。
12. **procedure** STOCPARAMOPT$(\gamma_1,\mathbf p^{(0)},\widehat\Lambda,N_b,N_{\rm ens})$
13. 　初始化 $n=0$
14. 　**while** 未收敛 **do**
15. 　　采样 $S=\{\boldsymbol\zeta^{[j]}\sim\mathbb P(\boldsymbol\zeta|\mathbf p^{(n)});\ j=1,\dots,N_{\rm ens}\times N_b\}$
16. 　　用 (3.6) 对 $\forall\boldsymbol\zeta\in S$ 计算 $\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta|\mathbf p)$
17. 　　**for** $S$ 中的每个设计 $\boldsymbol\zeta^{[k]}$ **do**
18. 　　　评估 $\{\mathcal J(\boldsymbol\zeta^{[k]},\lambda)\ \forall\lambda\in\widehat\Lambda\}$；$\lambda^{*[k]}$ 对应其中最小值。　▷ (3.9c)
19. 　　**end for**
20. 　　用 (3.9b) 计算最优基线估计 $\widehat b^{\rm opt}$
21. 　　计算 $\widehat{\mathbf g}^{(n)}=\frac{1}{|S|}\sum_{\boldsymbol\zeta\in S}\left(\mathcal J(\boldsymbol\zeta,\lambda^*)-\widehat b^{\rm opt}\right)\nabla_{\mathbf p}\log\mathbb P(\boldsymbol\zeta|\mathbf p)$　▷ (3.9a)
22. 　　$\mathbf p^{(n+1)}\leftarrow\mathbf P_{0,1}\left(\mathbf p^{(n)}+\gamma_1\widehat{\mathbf g}^{(n)}\right)$
23. 　　更新 $n\leftarrow n+1$
24. 　**end while**
25. 　$\mathbf p^{\rm opt}\leftarrow\mathbf p^{(n)}$
26. 　**return** $\mathbf p^{\rm opt}$
27. **end procedure**
28. **function** NOISEOPT$(\gamma_2,\mathbf p,\widehat\Lambda,N_{\rm ens})$
29. 　初始化 $n=0$
30. 　初始化 $\lambda^{(0)}=\mathrm{mean}(\widehat\Lambda)$
31. 　采样 $S=\{\boldsymbol\zeta^{[j]}\sim\mathbb P(\boldsymbol\zeta|\mathbf p);\ j=1,\dots,N_{\rm ens}\}$
32. 　**while** 未收敛 **do**
33. 　　更新 $n\leftarrow n+1$
34. 　　**for** $j\leftarrow1$ **to** $N_{\rm ens}$ **do**
35. 　　　用 (3.8) 计算 $\mathbf g^{(n)}[j]=\nabla_\lambda\mathcal J(\boldsymbol\zeta^{[j]},\lambda)$　▷ 使用 (3.8)
36. 　　**end for**
37. 　　$\mathbf g^{(n)}\leftarrow\frac{1}{N_{\rm ens}}\sum_{j=1}^{N_{\rm ens}}\mathbf g^n[j]$
38. 　　更新 $\lambda^{(n+1)}\leftarrow\lambda^{(n)}-\gamma_2\mathbf g^{(n)}$
39. 　**end while**
40. 　**return** $\lambda^{\rm opt}$
41. **end function**

算法 3.2 的每次迭代中，第 4 步在给定当前不确定参数有限样本 $\widehat\Lambda$ 的条件下寻求最优策略 $\mathbf p$，随后第 5 步在给定由当前 $\mathbf p$ 值所定义策略的条件下，通过寻找不确定参数 $\lambda$ 的最优值来扩展 $\widehat\Lambda$。由于 (3.3) 中的内层优化问题对当前策略参数 $\mathbf p$ 寻求 $\arg\min_\lambda\mathcal J(\boldsymbol\zeta,\lambda)$，因此要么必须在所有可能设计上求最小值（这需要暴力枚举，因而不可行），要么采用随机途径，把内层优化问题等价替换为 $\arg\min_\lambda\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}[\mathcal J(\boldsymbol\zeta,\lambda)]$，再按算法 3.2 第 29–40 步所述的随机梯度途径求解。

注意算法 3.2 第 4 步中，最优策略可能是退化的，即概率 $p_i\in\{0,1\}$。这会使第 5 步的内层优化问题只在该退化策略上搜索（最坏情形只在这个角点处考察）。因此，我们可能不希望精确求解外层问题，而只向最优策略迈出少数几步。此外，由于期望曲面不一定是凸的，优化器可能陷入局部最优。此情形下，当最优解唯一时，可以保证其为二值；于是可以对所得策略加入随机扰动并继续，直至收敛到退化策略。然而若最优解不唯一，最优解可能是非二值概率，此时通过采样在最优解集中寻找解。

## 4. 数值实验

本节讨论所提鲁棒 OED 途径在一个二维平流问题上的数值结果，该问题模拟封闭有界域中污染物浓度的演化。本文所有数值实验均使用可扩展软件包 PyOED [8]，重现实验的脚本已从 [7] 公开。

我们采用一个模拟封闭域中污染物浓度演化的实验，其设置与 [11] 类似。目标是优化传感器布点，以准确辨识污染物源（即仿真初始时刻污染物的分布），或实现最优数据采集。此处的最优性按 A-最优途径定义，其中观测噪声方差并非精确已知。具体地，假定观测误差协方差矩阵 $\boldsymbol\Gamma_{\rm noise}=\boldsymbol\Gamma_{\rm noise}(\lambda)$ 由某参数 $\lambda\in\Lambda$ 参数化，且 $\Lambda$ 已知。我们首先描述仿真的实验设置与观测模型（因而给出参数–可观测量映射），以及先验与观测噪声模型；然后描述鲁棒 OED 优化问题，并讨论结果与算法 3.2 的性能。

### 4.1 模型设置：平流–扩散

实验采用平流–扩散（advection–diffusion，AD）模型，模拟污染物场 $u=u(\mathbf x,t)$ 在仿真时间段 $[0,T]$ 内于封闭域 $D$ 上的时空演化。具体地，污染物场 $u=u(\mathbf x,t)$ 满足 AD 方程

$$
u_t-\kappa\Delta u+\mathbf v\cdot\nabla u=0\quad\text{在 }D\times(0,T],\qquad
u(\mathbf x,0)=\theta\quad\text{在 }D,\qquad
\kappa\nabla u\cdot\mathbf n=0\quad\text{在 }\partial D\times[0,T], \tag{4.1}
$$

其中 $\kappa>0$ 为扩散系数，$\mathbf v$ 为速度场，$D=[0,1]^2$ 为空间域，其中包含两个矩形区域，用以模拟域内两栋建筑，污染物流动不会穿过或进入其中。域边界 $\partial D$ 既包括外部边界，也包括两栋建筑的墙面。

AD 模型 (4.1) 的有限元离散在图 4（左）中示意。污染物源的真值（即本实验所用污染物的初始分布）见图 4（右）。沿用 [11,32] 的同一设置，速度场 $\mathbf v$ 假定已知，由侧壁驱动流动的稳态 Navier–Stokes 方程求解得到；见图 4（中）。

### 4.2 观测设置

我们考虑一组固定的候选位置，即传感器位置不随时间改变。首先考虑只允许两个候选传感器的情况，然后考虑分布在域中、数量 $n_s$ 递增的候选空间观测网格点；见图 5。

传感器在预先定义的一或多个观测时刻 $\{t_1,\dots,t_{n_t}\}\subset[0,T]$ 采集其所在位置的污染物浓度。观测时刻数为 $n_t=16$，由 $t_1+s\Delta t$ 给出，其中首次观测在 $t_1=1$ 进行；$\Delta t=0.2$ 是模型的仿真时间步长；且 $s=0,1,\dots,20$。于是，观测向量 $\mathbf y\in\mathbb R^{N_{\rm obs}}$ 表示测得的时空浓度，即在预定义位置与时刻上的观测，观测空间维数为 $N_{\rm obs}=n_s\times n_t$。

> **原文疑点：** 原文称观测时刻数 $n_t=16$，却给出 $s=0,1,\dots,20$；若按 $t_1=1$、$\Delta t=0.2$ 与 $s=0,\dots,20$ 计算，将得到 21 个时刻（1.0 至 5.0），与 $n_t=16$ 不一致（若取 $s=0,\dots,15$ 则为 16 个）。本译按原文照录两个数值，不做改动，供读者留意。

观测误差分布为 $\mathcal N(\mathbf 0,\boldsymbol\Gamma_{\rm noise})$，其中 $\boldsymbol\Gamma_{\rm noise}\in\mathbb R^{N_{\rm obs}\times N_{\rm obs}}$ 描述观测误差的时空相关性；设计矩阵取为块对角矩阵 $\mathbf W=\mathbf I\otimes\mathrm{diag}(\boldsymbol\zeta)$，以应对空间观测被堆叠为时空观测向量这一事实。这里 $\mathbf I\in\mathbb R^{n_t\times n_t}$ 是单位矩阵，$\otimes$ 是矩阵 Kronecker 积。

### 4.3 前向算子、伴随算子与先验

参数–可观测量映射（前向算子）$\mathbf F$ 是线性的，把模型初始条件（模型参数）$\boldsymbol\theta$ 映射到观测空间。具体地，$\mathbf F$ 表示在时间区间 $[0,T]$ 上的前向仿真，随后施加在观测时刻对传感器位置的限制。模型伴随由 $\mathbf F^*:=\mathbf M^{-1}\mathbf F^T$ 给出，其中 $\mathbf M$ 是有限元质量矩阵。沿用 [20]，我们使用高斯先验 $\mathcal N(\boldsymbol\theta_{\rm pr},\boldsymbol\Gamma_{\rm pr})$，其中先验协方差矩阵 $\boldsymbol\Gamma_{\rm pr}$ 是 $\mathcal A^{-2}$ 的离散，$\mathcal A$ 为拉普拉斯算子。

### 4.4 不确定参数

我们假定 $\boldsymbol\Gamma_{\rm noise}$ 并非精确已知，并由不确定参数 $\lambda$ 参数化。具体地，数值实验中把观测噪声协方差矩阵定义为 $\boldsymbol\Gamma_{\rm noise}:=\mathrm{diag}\left(\lambda^2\right)$，其中平方逐元素计算，且 $\lambda$ 的每个元素可取区间 $[0.02,0.04]$ 中的任意值。因此，评估 (3.8) 所需的噪声矩阵导数为 $\dfrac{\partial\boldsymbol\Gamma_{\rm noise}(\lambda)}{\partial\lambda_i}=2\lambda_i\mathbf e_i\mathbf e_i^T$，定义域相同。不确定参数的界通过在内层优化问题中对不确定参数施加如下界约束来建模：

$$
0.02\le\lambda_i\le0.04,\qquad\forall i=1,\dots,n_s. \tag{4.2}
$$

### 4.5 优化设置

按 [11] 的建议，算法 3.2 以初始 Bernoulli 参数（初始策略）$\mathbf p^{(0)}\in(0,1)^{n_s}=(p_1^{(0)},\dots,p_{n_s}^{(0)})^T=(0.5,\dots,0.5)^T$ 初始化，即所有传感器被激活或不激活的概率相等。所有实验的最大迭代次数 $\ell$ 设为 100；若内层或外层优化问题均无改进，或达到最大迭代次数，算法终止。优化程序（内层与外层）无改进通过设置 $\texttt{TOL}=1e{-}8$ 与 $\texttt{PGTOL}=1e{-}8$ 判定，即优化器在满足下列任一条件时终止：$|\Upsilon_n-\Upsilon_{n-1}|<\texttt{TOL}$（其中 $\Upsilon^{(n)}$ 是第 $n$ 次迭代时外层问题随机目标的值），或 $\max_{i=1,\dots,n}|g_i|\le\texttt{PGTOL}$（其中 $g_i$ 是相应优化问题投影梯度的第 $i$ 个分量）。外层随机优化问题（算法 3.2 第 22 步）的学习率为 $\gamma_1=1e{-}4$，最大迭代次数设为 5。选择小学习率与小迭代次数的组合，是为了防止随机优化程序过快收敛到退化策略，否则会限制算法在收敛前探查不确定参数空间的能力。

内层优化问题（算法 3.2 第 5 步）使用有限记忆 Broyden–Fletcher–Goldfarb–Shanno（LBFGS）程序 [49] 求解，以强制满足第 4.4 节所述不确定参数域给出的界约束，即 $\lambda_i\in[0.02,0.04]\ \forall i=1,\dots,n_s$。步长 $\gamma_2$ 用标准线搜索途径优化。在我们的实现中，使用 PyOED 优化程序，它采用 Python 科学计算包 SciPy [43] 提供的 LBFGS 实现。

> **原文疑点：** 原文此处在括号中两次写作 “(Step Algorithm 3.2)”，即“（算法 3.2 第 X 步）”中的步号缺失（外层梯度对应算法 3.2 第 22 步；内层优化对应第 5 步与第 28–41 行的 NOISEOPT 过程）。本译按上下文补出对应步号并在此说明，原文交叉引用残缺照录。

算法终止后，它从最终策略中采样 $m=5$ 个设计。若最终策略 $\mathbf p^{\rm opt}$ 退化，则所有采样设计相同且等于该策略 $\mathbf p^{\rm opt}$；当最优解唯一时通常如此。否则，这些设计按成功概率为 $\mathbf p^{\rm opt}$ 的多元 Bernoulli 分布采样生成。算法选取目标值最高的设计；不过在我们的实验中也会检查整个样本以作验证。

随机梯度 (3.9) 通过设置集合规模 $N_{\rm ens}=N_b=32$ 来评估。尽管实验中我们注意到集合数小得多时性能类似，但为统计一致性仍采用这些设置。

### 4.6 数值结果

下面给出上述实验的数值结果。

#### 4.6.1 两个候选传感器的结果

我们使用算法 3.2 给出 $n_s=2$ 个候选传感器的结果。此处舍弃罚项，等价于在 (3.4) 中把罚参数设为 $\alpha=0$。图 6 展示应用算法 3.2 得到的进展与结果。具体地，图 6（左）展示优化算法（在连续迭代中）的行为，并与不确定参数 $\lambda$ 所有取值对应的期望曲面比较；图 6（右）则便于把优化过程的结果与暴力搜索比较。由于无法枚举不确定参数的所有可能取值（除非它们构成小集合），我们在采样集 $\widehat\Lambda$ 上执行暴力搜索。

**图 6：** 左：多个不确定参数取值 $\lambda=(\sigma_1,\sigma_2)$ 下随机目标函数 $\Upsilon(\boldsymbol\zeta)=\mathbb E_{\boldsymbol\zeta\sim\mathbb P(\boldsymbol\zeta|\mathbf p)}[\mathcal J(\boldsymbol\zeta,\lambda)]$ 的曲面（在算法 3.2 求解内层最小化问题时生成），并突出显示算法 3.2 的结果（优化路径）。两个方向各取 10 个等间距点（$p_i$ 的取值）来生成曲面图。右：在有限样本 $\widehat\Lambda$ 上，对所有可能设计 $\boldsymbol\zeta\in\{0,1\}^{n_s=2}$ 评估的目标 $\mathcal J(\boldsymbol\zeta,\lambda)$ 值。图中按 (2.8) 所用枚举方案，对 4 个可能设计（索引 1 至 4）给出结果；对每个不确定参数 $\lambda$ 选取一种独特颜色，并以同色圆圈绘出该 $\lambda$ 下 4 个可能设计处的 $\mathcal J$ 值。算法 3.2 生成的最优解以红色星标出。黑色虚线绘于最优目标值水平，因此可用于判别优化算法返回解的质量（例如最优性间隙）。此处不施加正则化（例如稀疏化），即把罚参数设为 $\alpha=0$。

如图 6（右）所示，全局最优解 $\mathbf p_{\rm opt}=(1,1)^T$ 唯一，算法在此情形下经 1 次迭代便成功恢复全局最优解。注意算法每次迭代先更新策略参数 $\mathbf p$，然后更新不确定参数 $\lambda$，这解释了图 6（左）的结果。此情形下的最优解（即最优策略 $\mathbf p_{\rm opt}$）是退化的：算法返回的 5 个设计样本全部相同（均等于最优策略 $\boldsymbol\zeta=(1,1)^T$），即图 6（右）中的红色星标。注意不同不确定参数取值形成的期望曲面彼此相交，如图 6（左）所示；这意味着下界并非由不确定参数的某一个特定取值形成，因此如第 3.1 节所讨论，用名义值求解 OED 优化问题很可能得到错误结果。

> **原文疑点：** 本小节原文在“全局最优解”处写作 “$\mathbf p_{\rm opt}=(1,1)^T$”，而该符号在全文其他处表示 Bernoulli 策略参数（连续取值）；此处实际应为二值设计 $\boldsymbol\zeta_{\rm opt}=(1,1)^T$（原文后文亦写作 “$\boldsymbol\zeta=(1,1)^T$”）。本译照录原式并在此说明记号混用。

#### 4.6.2 五个候选传感器的结果

当 $n_s=5$ 时，可能观测配置（即可能二值设计）的数目为 $2^5=32$。因此，我们可以通过在这些可能设计上、结合不确定参数的采样集 $\widehat\Lambda$ 做暴力搜索来获得最优解，并用它验证所提途径的输出。本实验中我们通过设置罚项来强制稀疏，所用函数促进稀疏。具体地，使用 $\ell_0$ 范数对鲁棒设计强制稀疏，并把罚函数定义为 $\Phi(\boldsymbol\zeta):=\|\boldsymbol\zeta\|_0^2$。注意由于设计空间是二值的，$\ell_0$ 与 $\ell_1$ 等价，且二者均非光滑。为获得显著的稀疏程度，我们把罚参数设为 $\alpha=10$。罚参数 $\alpha$ 一般可通过启发式途径（例如在正则化语境中已发展成熟的 L 曲线）选取，以达到期望的稀疏水平。图 7 给出本实验下算法 3.2 的结果。

**图 7：** 可能设计的数目为 $2^{n_s}=2^5=32$，每个设计绘于横轴。对每个设计，目标值针对优化过程生成的样本中不确定参数的所有取值（即 $\lambda\in\widehat\Lambda$）绘出。每个 $\lambda$ 取值有独特颜色，（推荐）最优解以红色星标出。全局最优值（黑色虚线）通过在全部可能设计与优化算法生成样本中全部不确定参数取值 $\lambda\in\widehat\Lambda$ 上求 max-min 值得到。左：设计在横轴上按 (2.8) 的枚举方案排序。右：与左图相同，但设计在横轴上按非零元素个数（从 0 到 $n_s=5$）分组。

图 7（左）展示在优化算法终止后返回的设计样本（此处从最终策略采样 5 个设计）处评估的目标值。此处算法在最大迭代次数（100）处终止，最终策略为非退化的，即 Bernoulli 激活概率 $\mathbf p$ 的某些元素非二值，这给我们机会去探查最优解附近的多个高质量设计。采样设计要么覆盖、要么非常接近全局最优。因此算法可以指向全局最优处或附近的多个候选解，并在需要时为从业者或领域专家提供最终决策依据。不过此处算法推荐解（采样设计中目标值最大者）实际上与全局最优解一致。从最终策略采样的设计的稀疏程度，可以通过重排暴力搜索图（即图 7（左））得到更好的检视，使得横轴上的设计按激活传感器数（即 $\boldsymbol\zeta$ 中等于 1 的元素个数）分组，如图 7（右）所示。算法建议的传感器位置与全局鲁棒最优解的对比见图 8。

图 9 展示算法 3.2 在连续迭代中的性能。此处无法像上文讨论的二维情形那样可视化目标函数值的曲面；不过我们给出在优化算法各连续迭代所生成策略的样本处评估的随机目标 $\Upsilon(\boldsymbol\zeta,\lambda)$ 的值，见图 9（左）。注意算法每次迭代中，随机目标值被评估并绘制两次：第一次是在外层优化程序更新策略时，第二次是在内层优化程序更新不确定参数时。

算法 3.2 所用随机学习途径的一个重要方面是：算法在趋向退化策略（即最优解）时，倾向于重复利用此前访问过的设计样本，这是该算法一个显著的计算优势。这一点由图 9（右）支持，该图给出每次迭代执行的新函数评估次数。第 4.6.4 节将进一步讨论这一点，那里描述一种记录算法所考察 $(\boldsymbol\zeta,\lambda)$ 对并在之后复用、而非重新评估目标的途径。

#### 4.6.3 十个候选传感器的结果

一种常见情形是资源受限时把传感器限制在预算 $\tau$ 内。此时可以通过设置罚项（例如 $\Phi(\boldsymbol\zeta):=|\|\boldsymbol\zeta\|_0-\tau|$）并选取足够大的罚参数 $\alpha$ 来强制预算约束。这里把候选传感器数设为 $n_s=10$、预算设为 $\tau=3$。此时可能设计选择的数目为 $2^{10}$，其中只有 $C(10,3)=120$ 个设计满足预算约束。这些可能设计中的每一个都可以针对不确定参数 $\lambda$ 的任一取值评估。本实验结果汇总于图 10，其行为与前面几种情形类似。算法返回的设计样本，其目标值几乎与全局最优相同，且稀疏水平相近。

#### 4.6.4 效率与采样设计的复用

算法 3.2 遵循 [11] 提出的途径，在有限二值可行域 $\{0,1\}^{n_s}$ 上求解外层优化问题。随着算法朝最优解推进，激活概率 $\mathbf p$ 移向退化 Bernoulli分布的参数，即对设计 $\boldsymbol\zeta$ 的所有元素，激活概率都移向 $\{0,1\}$。Bernoulli 随机变量的方差等于 $p(1-p)$，这意味着激活概率越接近边界 $\{0,1\}$，变异性越小（最小为 0），而在 $p=0.5$ 处变异性最大。因此，当算法朝优化变量（即激活概率 $\mathbf p$）移向退化分布推进时，它倾向于重采样此前迭代中已经用过的设计，从而显著降低计算代价。[11] 利用这一点，记录采样设计 $\boldsymbol\zeta$ 的索引及相应目标值 $\mathcal J(\boldsymbol\zeta)$（例如存于字典中）；每次迭代需要目标值时先检查该字典，只有字典中不存在时才计算目标值。

本文沿用类似策略，并在算法 3.2 中使用。这里需要同时记录采样设计 $\boldsymbol\zeta$ 与不确定参数取值 $\lambda$，以及相应的目标值 $\mathcal J(\boldsymbol\zeta,\lambda)$。我们使用如下简单哈希途径：把设计与不确定参数增广为一个向量 $\mathbf h=[\boldsymbol\zeta^T,\lambda^T]$，再生成唯一哈希值；该哈希值作为字典的键，值为目标 $\mathcal J(\boldsymbol\zeta,\lambda)$。每次请求目标值 $\mathcal J$ 时都调用该过程，从而可以先查找此前算过的结果。这一途径非常有效，因为它消除了冗余计算，显著节省计算代价，尤其对外层优化问题。图 11 的结果清楚地体现了这一点：该图给出所提算法在问题基数 $n_s$ 递增时连续迭代中的行为。具体地，图 11（左）给出基数递增时连续迭代中新的目标函数调用次数（即对 $(\boldsymbol\zeta,\lambda)$ 的新组合评估目标 $\mathcal J$ 的次数）。为清晰起见，该图截取到 8 次迭代，并说明在本实验中其余所有迭代上，对所有基数 $n_s$，新函数评估次数均为 0。图 11（右）给出冗余率，其定义为 $1-\dfrac{\text{唯一 }(\boldsymbol\zeta,\lambda)\text{ 对数}}{\text{采样设计 }(\boldsymbol\zeta,\lambda)\text{ 总数}}$。冗余率既对整体优化过程（内层与外层优化问题合计）评估，也对外层优化问题单独给出。

**图 4：** 平流–扩散模型 (4.1) 的域与离散、速度场以及真值（真实初始条件）。两个方块表示两栋建筑（分别记为 B1 与 B2），流动不允许进入其中。左：物理域 $D$（含外边界与两栋建筑）及模型网格离散。中：常速度场 $\mathbf v$。右：真实初始条件（初始时刻的污染物浓度，色标约 0.00–0.56）。

**图 5：** 分布在域中的候选传感器位置数 $n_s$ 变化示意；每种情形下候选传感器从 1 到 $n_s$ 编号（三个面板分别为 $n_s=2$、$n_s=5$、$n_s=10$）。

**图 8：** 与图 7 结果对应。此处给出全局最优设计（左），并与算法生成样本中的各唯一设计（右侧 3 个）比较。

**图 9：** 与图 7 结果对应。左：在优化算法各连续迭代所生成策略的样本处评估的随机目标 $\Upsilon(\boldsymbol\zeta,\lambda)$ 值（并标出 $\mathbb E(\mathcal J)$ 的全局最优水平）。右：算法每次迭代产生的新目标 $\mathcal J$ 评估次数，即算法此前未考察过的 $(\boldsymbol\zeta,\lambda)$ 对上的函数评估次数。

**图 10：** 与图 7 类似。此处候选传感器数设为 $n_s=10$，并通过把罚函数设为 $\Phi(\boldsymbol\zeta):=|\|\boldsymbol\zeta\|_0-3|$、罚参数设为 $\alpha=50$ 来强制 3 个激活传感器的预算。左：设计在横轴上按枚举方案 (2.8) 索引。右：设计在横轴上按激活传感器数（即 $\boldsymbol\zeta$ 中等于 1 的元素个数）分组。

**图 11：** 算法 3.2 在基数 $n_s$ 递增时的结果。左：每次迭代产生的新函数评估 $\mathcal J(\boldsymbol\zeta,\lambda)$ 次数。右：外层优化问题的总冗余率与整体冗余率。

## 5. 讨论与结论性评述

本文针对鲁棒二值优化问题提出了一种新途径，并将其应用于传感器布点的 OED。该途径把鲁棒优化问题准确地表述为随机规划，并按照高效的、基于采样的随机优化途径求解。

本文途径继承了随机二值优化途径 [11] 的优点与局限。本工作涉及三个主要挑战。首先是外层优化问题学习率的最优选择。这实际上是多数随机优化程序共有的常见障碍；通常采用经验途径选择学习率，本文亦然。具体地，用一组学习率求解优化问题，并采用表现良好者。然而该途径对高维问题并不实用，此类参数的自动调优变得至关重要，这将在未来工作中考虑。其次，所提求解算法可以生成目标值接近全局最优的设计，但可能陷入局部最优。当外层优化问题快速收敛到某个二值设计（或参数 $\mathbf p$ 为二值的退化策略），或由于期望曲面（即随机目标函数）的非凸性时，陷入局部最优在意料之中。对前一种情形，当算法快速收敛到退化策略（激活概率）后，外层最大化问题在后续迭代中不会离开该值（退化策略），内层优化问题只在该域的角点处更新不确定参数的值。这可以通过在每次迭代只走少量步（或采用更小的步长/学习率）使迭代点保持在域内部、同时更新不确定参数样本而缓解。对后一种情形，由于全局最优解不唯一，或期望曲面在概率域 $(0,1)$ 内部可能非凸，算法可能陷入次优的非退化策略；当算法发现局部最优时对策略加入随机扰动即可缓解。第三，尽管数值结果表明该优化途径性能良好，但并没有全局最优性保证。全局最优性颇具挑战，将在另文中研究，例如把激活概率本身建模为随机变量，并考虑诸如 Hamiltonian Monte Carlo 之类可用于全局优化的高效采样途径。

## 附录 A　梯度推导：鲁棒 A-最优性

本节给出实现算法 3.2 所需的梯度的详细推导。具体地，附录 A.1 给出效用函数关于不确定参数（即参数化观测误差协方差矩阵）的梯度推导；该梯度由 (3.8) 总结，并由算法 3.2 第 35 步使用。我们先在引理 A.1 中给出设计加权精度矩阵 $\mathbf W_\Gamma(\boldsymbol\zeta,\lambda)$ 逐点导数的闭式。该恒等式对一般加权方案 (2.11) 成立，因而适用于 (2.10) 定义的二值设计这一特殊情形。

**引理 A.1.** 给定加权精度矩阵 $\mathbf W_\Gamma(\boldsymbol\zeta)$ 的定义 (2.11)，有

$$
\partial\mathbf W_\Gamma(\boldsymbol\zeta,\lambda)
=-\mathbf W_\Gamma(\boldsymbol\zeta,\lambda)\,
\partial\left(\mathbf W(\boldsymbol\zeta)\odot\boldsymbol\Gamma_{\rm noise}(\lambda)\right)
\mathbf W_\Gamma(\boldsymbol\zeta,\lambda). \tag{A.1}
$$

**证明.** 考虑两种情形。第一，设 $\boldsymbol\zeta\in(0,1]^{n_s}$。此时 $\mathbf W_\Gamma=\left(\mathbf W\odot\boldsymbol\Gamma_{\rm noise}\right)^{-1}$，于是由矩阵逆的导数法则可得

$$
\partial\mathbf W_\Gamma=-\mathbf W_\Gamma\,\partial\mathbf W_\Gamma^{-1}\,\mathbf W_\Gamma
=-\mathbf W_\Gamma\,\partial\left(\mathbf W\odot\boldsymbol\Gamma_{\rm noise}\right)\mathbf W_\Gamma.
$$

第二，考虑设计 $\boldsymbol\zeta$ 位于松弛域 $[0,1]^{n_s}$ 的边界、其中某些元素等于零的情形。沿用 [10, Appendix A] 中的论证，把噪声协方差矩阵 $\boldsymbol\Gamma_{\rm noise}$ 与加权矩阵 $\mathbf W$ 表示为分块矩阵：

$$
\boldsymbol\Gamma_{\rm noise}=\begin{bmatrix}\mathbf A & \mathbf B\\ \mathbf B^T & \mathbf D\end{bmatrix};\qquad
\mathbf W=\begin{bmatrix}\mathbf W_A & \mathbf W_B\\ \mathbf W_B^T & \mathbf W_D\end{bmatrix};\qquad
\mathbf W\odot\boldsymbol\Gamma_{\rm noise}=
\begin{bmatrix}\mathbf A\odot\mathbf W_A & \mathbf B\odot\mathbf W_B\\ \mathbf B^T\odot\mathbf W_B^T & \mathbf D\odot\mathbf W_D\end{bmatrix}, \tag{A.2}
$$

其中假定 $\mathbf A$ 与 $\mathbf W_A$ 都对应 $\boldsymbol\zeta$ 中等于 0 的元素；通过置换可达此形式。此情形下，由权重定义 (2.11b)，$\mathbf W_A=\mathbf 0$ 且 $\mathbf W_B=\mathbf 0$，因此

$$
\mathbf W_\Gamma=\left(\mathbf W\odot\boldsymbol\Gamma_{\rm noise}\right)^\dagger
=\begin{bmatrix}\mathbf 0 & \mathbf 0\\ \mathbf 0 & \left(\mathbf D\odot\mathbf W_D\right)^{-1}\end{bmatrix}. \tag{A.3}
$$

于是此情形下

$$
\partial\mathbf W_\Gamma=\partial\left(\boldsymbol\Gamma_{\rm noise}\odot\mathbf W\right)^\dagger
=\begin{bmatrix}\mathbf 0 & \mathbf 0\\ \mathbf 0 & -\left(\mathbf D\odot\mathbf W_D\right)^{-1}\partial\left(\mathbf D\odot\mathbf W_D\right)\left(\mathbf D\odot\mathbf W_D\right)^{-1}\end{bmatrix}, \tag{A.4}
$$

且

$$
\partial\left(\boldsymbol\Gamma_{\rm noise}\odot\mathbf W\right)
=\begin{bmatrix}\mathbf 0 & \mathbf 0\\ \mathbf 0 & \partial\left(\mathbf D\odot\mathbf W_D\right)\end{bmatrix}. \tag{A.5}
$$

于是，把 (A.3) 与 (A.5) 结合便立即得到 (A.1)：

$$
\begin{aligned}
\mathbf W_\Gamma\,\partial\left(\mathbf W\odot\boldsymbol\Gamma_{\rm noise}\right)\mathbf W_\Gamma
&=\begin{bmatrix}\mathbf 0 & \mathbf 0\\ \mathbf 0 & \left(\mathbf D\odot\mathbf W_D\right)^{-1}\end{bmatrix}
\begin{bmatrix}\mathbf 0 & \mathbf 0\\ \mathbf 0 & \partial\left(\mathbf D\odot\mathbf W_D\right)\end{bmatrix}
\begin{bmatrix}\mathbf 0 & \mathbf 0\\ \mathbf 0 & \left(\mathbf D\odot\mathbf W_D\right)^{-1}\end{bmatrix}\\
&=-\partial\mathbf W_\Gamma,
\end{aligned} \tag{A.6}
$$

证毕。

注意无论导数是对松弛设计（经由加权矩阵 $\mathbf W$）还是对不确定参数（经由观测噪声矩阵 $\boldsymbol\Gamma_{\rm noise}$）求取，引理 A.1 都成立。

### A.1 关于不确定参数的导数

这里推导数值求解算法 3.2 第 5 步与第 18 步中优化问题所需的梯度 $\nabla_\lambda\mathcal J(\boldsymbol\zeta,\lambda)=\nabla_\lambda\mathcal U(\boldsymbol\zeta,\lambda)$。我们利用罚函数 $\Phi$ 与不确定参数 $\lambda$ 无关这一事实。对不确定参数 $\lambda=\lambda_{\rm noise}$，

$$
\begin{aligned}
\frac{\partial\mathcal U(\boldsymbol\zeta,\lambda_{\rm noise})}{\partial\lambda_{{\rm noise},j}}
&=\frac{\partial}{\partial\lambda_{{\rm noise},j}}\mathrm{Tr}\left(
\mathbf F^*\mathbf W_\Gamma(\boldsymbol\zeta;\lambda_{\rm noise})\mathbf F+\boldsymbol\Gamma_{\rm pr}^{-1}
\right)\\
&\stackrel{\text{(A.1)}}{=}-\mathrm{Tr}\left(
\mathbf F^*\mathbf W_\Gamma(\boldsymbol\zeta;\lambda_{\rm noise})
\left(\mathbf W(\boldsymbol\zeta)\odot
\frac{\partial\boldsymbol\Gamma_{\rm noise}(\lambda_{\rm noise})}{\partial\lambda_{{\rm noise},j}}
\right)
\mathbf W_\Gamma(\boldsymbol\zeta;\lambda_{\rm noise})\mathbf F
\right),
\end{aligned} \tag{A.7}
$$

由此得到梯度的最终形式：

$$
\nabla_{\lambda_{\rm noise}}\mathcal U(\boldsymbol\zeta,\lambda_{\rm noise})
=-\sum_j\mathrm{Tr}\left(
\mathbf F^*\mathbf W_\Gamma(\boldsymbol\zeta;\lambda_{\rm noise})
\left(\mathbf W(\boldsymbol\zeta)\odot
\frac{\partial\boldsymbol\Gamma_{\rm noise}(\lambda_{\rm noise})}{\partial\lambda_{{\rm noise},j}}
\right)
\mathbf W_\Gamma(\boldsymbol\zeta;\lambda_{\rm noise})\mathbf F
\right)\mathbf e_j, \tag{A.8}
$$

其中 $\mathbf e_j$ 是 $\mathbb R^n$ 中的第 $j$ 个单位向量，$n$ 是 $\lambda$ 的维数。

## 参考文献（英文原条目，按原文顺序）

[1] A. Alexanderian, Optimal experimental design for infinite-dimensional Bayesian inverse problems governed by PDEs: A review, *Inverse Problems*, 37 (2021), p. 043001.

[2] A. Alexanderian, P. J. Gloor, O. Ghattas, et al., On Bayesian A-and D-optimal experimental designs in infinite dimensions, *Bayesian Analysis*, 11 (2016), pp. 671–695.

[3] A. Alexanderian, N. Petra, G. Stadler, and O. Ghattas, A-optimal design of experiments for infinite-dimensional Bayesian linear inverse problems with regularized ℓ0-sparsification, *SIAM Journal on Scientific Computing*, 36 (2014), pp. A2122–A2148.

[4] A. Alexanderian, N. Petra, G. Stadler, and O. Ghattas, A fast and scalable method for A-optimal design of experiments for infinite-dimensional Bayesian nonlinear inverse problems, *SIAM Journal on Scientific Computing*, 38 (2016), pp. A243–A272.

[5] A. Alexanderian and A. K. Saibaba, Efficient D-optimal design of experiments for infinite-dimensional Bayesian linear inverse problems, *SIAM Journal on Scientific Computing*, 40 (2018), https://arxiv.org/abs/1711.05878.

[6] S. Asprey and S. Macchietto, Designing robust optimal dynamic experiments, *Journal of Process Control*, 12 (2002), pp. 545–556.

[7] A. Attia, PyOED: An extensible suite for data assimilation and model-constrained optimal design of experiments, 2023, https://gitlab.com/ahmedattia/pyoed.

[8] A. Attia and S. E. Ahmed, PyOED: An extensible suite for data assimilation and model-constrained optimal design of experiments, *arXiv preprint arXiv:2301.08336*, (2023).

[9] A. Attia, A. Alexanderian, and A. K. Saibaba, Goal-oriented optimal design of experiments for large-scale Bayesian linear inverse problems, *Inverse Problems*, 34 (2018), p. 095009.

[10] A. Attia and E. Constantinescu, Optimal experimental design for inverse problems in the presence of observation correlations, *SIAM Journal on Scientific Computing*, 44 (2022), pp. A2808–A2842.

[11] A. Attia, S. Leyffer, and T. Munson, Stochastic learning approach for binary optimization: Application to Bayesian optimal design of experiments, *SIAM Journal on Scientific Computing*, 44 (2022), pp. B395–B427.

[12] A. Attia, A. Moosavi, and A. Sandu, Cluster sampling filters for non-Gaussian data assimilation, *Atmosphere*, 9 (2018), p. 213.

[13] A. Attia, V. Rao, and A. Sandu, A sampling approach for four dimensional data assimilation, in *Dynamic Data-Driven Environmental Systems Science*, Springer, 2015, pp. 215–226.

[14] A. Attia, V. Rao, and A. Sandu, A hybrid Monte Carlo sampling smoother for four dimensional data assimilation, *International Journal for Numerical Methods in Fluids*, (2016), https://doi.org/10.1002/fld.4259. fld.4259.

[15] A. Attia and A. Sandu, A hybrid Monte Carlo sampling filter for non-Gaussian data assimilation, *AIMS Geosciences*, 1 (2015), pp. 4–1–78, https://doi.org/http://dx.doi.org/10.3934/geosci.2015.1.41.

[16] A. Attia, R. Ștefănescu, and A. Sandu, The reduced-order hybrid Monte Carlo sampling smoother, *International Journal for Numerical Methods in Fluids*, (2016), https://doi.org/10.1002/fld.4255. fld.4255.

[17] A. Attia, R. Ștefănescu, and A. Sandu, The reduced-order hybrid Monte Carlo sampling smoother, *International Journal for Numerical Methods in Fluids*, 83 (2017), pp. 28–51.

[18] R. Bannister, A review of operational methods of variational and ensemble-variational data assimilation, *Quarterly Journal of the Royal Meteorological Society*, 143 (2017), pp. 607–633.

[19] S. Biedermann and H. Dette, A note on maximin and Bayesian D-optimal designs in weighted polynomial regression, tech. report, Technical Report, 2003.

[20] T. Bui-Thanh, O. Ghattas, J. Martin, and G. Stadler, A computational framework for infinite-dimensional Bayesian inverse problems Part I: the linearized case, with application to global seismic inversion, *SIAM Journal on Scientific Computing*, 35 (2013), pp. A2494–A2523.

[21] D. R. Cox, *Planning of experiments*, Wiley, 1958.

[22] R. Daley, *Atmospheric data analysis*, Cambridge University Press, 1991.

[23] H. Dette, V. B. Melas, and A. Pepelyshev, Standardized maximin E-optimal designs for the Michaelis–Menten model, *Statistica Sinica*, (2003), pp. 1147–1163.

[24] V. Fedorov and J. Lee, Design of experiments in statistics, in *Handbook of semidefinite programming*, R. S. H. Wolkowicz and L. Vandenberghe, eds., vol. 27 of Internat. Ser. Oper. Res. Management Sci., Kluwer Acad. Publ., Boston, MA, 2000, pp. 511–532.

[25] E. Haber, L. Horesh, and L. Tenorio, Numerical methods for experimental design of large-scale linear ill-posed inverse problems, *Inverse Problems*, 24 (2008), pp. 125–137.

[26] E. Haber, L. Horesh, and L. Tenorio, Numerical methods for the design of large-scale nonlinear discrete ill-posed inverse problems, *Inverse Problems*, 26 (2010), p. 025002.

[27] E. Haber, Z. Magnant, C. Lucero, and L. Tenorio, Numerical methods for A-optimal designs with a sparsity constraint for ill-posed inverse problems, *Computational Optimization and Applications*, (2012), pp. 1–22.

[28] X. Huan and Y. M. Marzouk, Simulation-based optimal Bayesian experimental design for nonlinear systems, *Journal of Computational Physics*, 232 (2013), pp. 288–317.

[29] E. S. Levitin and B. T. Polyak, Constrained minimization methods, *USSR Computational mathematics and mathematical physics*, 6 (1966), pp. 1–50.

[30] I. M. Navon, Data assimilation for numerical weather prediction: a review, in *Data assimilation for atmospheric, oceanic and hydrologic applications*, Springer, 2009, pp. 21–65.

[31] A. Pázman, *Foundations of optimum experimental design*, D. Reidel Publishing Co., 1986.

[32] N. Petra and G. Stadler, Model variational inverse problems governed by partial differential equations, Tech. Report 11-05, The Institute for Computational Engineering and Sciences, The University of Texas at Austin, 2011.

[33] L. Pronzato, A minimax equivalence theorem for optimum bounded design measures, *Statistics & Probability Letters*, 68 (2004), pp. 325–331.

[34] L. Pronzato and É. Walter, Robust experiment design via stochastic approximation, *Mathematical Biosciences*, 75 (1985), pp. 103–120.

[35] L. Pronzato and É. Walter, Robust experiment design via maximin optimization, *Mathematical Biosciences*, 89 (1988), pp. 161–176.

[36] F. Pukelsheim, *Optimal design of experiments*, John Wiley & Sons, New York, 1993.

[37] R. T. Rockafellar, *Convex Analysis*, Princeton University Press, Princeton, N.J., 1970.

[38] C. R. Rojas, J. S. Welsh, G. C. Goodwin, and A. Feuer, Robust optimal experiment design for system identification, *Automatica*, 43 (2007), pp. 993–1008.

[39] D. Telen, F. Logist, E. Van Derlinden, and J. F. Van Impe, Robust optimal experiment design: A multi-objective approach, *IFAC Proceedings Volumes*, 45 (2012), pp. 689–694.

[40] D. Telen, D. Vercammen, F. Logist, and J. Van Impe, Robustifying optimal experiment design for nonlinear, dynamic (bio)chemical systems, *Computers & Chemical Engineering*, 71 (2014), pp. 415–425.

[41] D. Uciński, Optimal sensor location for parameter estimation of distributed processes, *International Journal of Control*, 73 (2000), pp. 1235–1248.

[42] S. Vetra-Carvalho, P. J. Van Leeuwen, L. Nerger, A. Barth, M. U. Altaf, P. Brasseur, P. Kirchgessner, and J.-M. Beckers, State-of-the-art stochastic data assimilation methods for high-dimensional non-Gaussian problems, *Tellus A: Dynamic Meteorology and Oceanography*, 70 (2018), pp. 1–43.

[43] P. Virtanen, R. Gommers, T. E. Oliphant, M. Haberland, T. Reddy, D. Cournapeau, E. Burovski, P. Peterson, W. Weckesser, J. Bright, S. J. van der Walt, M. Brett, J. Wilson, K. J. Millman, N. Mayorov, A. R. J. Nelson, E. Jones, R. Kern, E. Larson, C. J. Carey, İ. Polat, Y. Feng, E. W. Moore, J. VanderPlas, D. Laxalde, J. Perktold, R. Cimrman, I. Henriksen, E. A. Quintero, C. R. Harris, A. M. Archibald, A. H. Ribeiro, F. Pedregosa, P. van Mulbregt, and SciPy 1.0 Contributors, SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python, *Nature Methods*, 17 (2020), pp. 261–272, https://doi.org/10.1038/s41592-019-0686-2.

[44] A. Wald, Statistical decision functions which minimize the maximum risk, *Annals of Mathematics*, (1945), pp. 265–280.

[45] A. Wald, *Statistical decision functions*, Wiley, 1950.

[46] E. Walter and L. Pronzato, Robust experiment design: between qualitative and quantitative identifiabilities, *Identifiability of parametric models*, (1987), pp. 104–113.

[47] J. Yu, V. M. Zavala, and M. Anitescu, A scalable design of experiments framework for optimal sensor placement, *Journal of Process Control*, (2017).

[48] C. Zang, M. Friswell, and J. Mottershead, A review of robust optimal design and its application in dynamics, *Computers & Structures*, 83 (2005), pp. 315–326.

[49] C. Zhu, R. H. Byrd, P. Lu, and J. Nocedal, Algorithm 778: L-BFGS-B: Fortran subroutines for large-scale bound-constrained optimization, *ACM Transactions on Mathematical Software (TOMS)*, 23 (1997), pp. 550–560.

**Argonne 声明（原文文末）：** 本投稿手稿由 UChicago Argonne, LLC（阿贡国家实验室的运营方，“Argonne”）创作。Argonne 是美国能源部科学办公室实验室，依据合同编号 DE-AC02-06CH11357 运营。美国政府对本文及其代表其行事的他方保留一项已付清的、非排他性的、不可撤销的全球许可，用于复制、准备衍生作品、向公众分发副本，以及由美国政府或代表其公开表演和公开展示。能源部将依据 DOE 公共获取计划（http://energy.gov/downloads/doe-public-access-plan）为这些联邦资助研究成果提供公共获取。

**原文插图：** 原 PDF 中的图 1–11 未重传至本页，仅保留中文图注与图中关键数值；全部原图可通过页首的原文 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2305.03855v1（SIAM 期刊格式，25 页）的全文中文译稿，覆盖摘要、正文第 1–5 节（含 2.1–2.4、3.1–3.1.2、3.2、4.1–4.6.4 等全部小节）、附录 A（含引理 A.1 及其证明、A.1 节梯度推导）、全部图注（图 1–11）、算法 3.1–3.2（逐步中文表述）、公式 (2.1)–(A.8) 以及 49 条参考文献英文原条目；原文无表格；文末 Argonne 声明照录。**逐句终校未做**：公式的下标/上标、算法步号与图注中的数值已对照 PDF 文本层与页面渲染核对（含 (2.11b) 的分段定义、(3.9b) 的基线公式、算法 3.2 的 41 个步骤以及 §4.5 的容差/学习率设置），但尚未完成逐句逐式的独立复核。页内 4 处“原文疑点”为翻译时发现的原文内部不一致（§2.3 式号重复、§4.2 观测时刻数与 $s$ 取值不一致、§4.5 交叉引用 “Step Algorithm 3.2” 缺步号、§4.6.1 $\mathbf p_{\rm opt}$ 与 $\boldsymbol\zeta$ 记号混用），均按原文照录并加注，未作数值或表述改动。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
