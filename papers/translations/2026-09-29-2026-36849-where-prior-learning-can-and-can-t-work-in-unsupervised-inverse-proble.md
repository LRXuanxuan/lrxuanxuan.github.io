---
layout: page
title: "先验学习在无监督逆问题中何时有效、何时失效｜中文全篇译稿（IEEE 正式版，许可待核验）"
permalink: /papers/translations/2026-09-29-2026-36849-where-prior-learning-can-and-can-t-work-in-unsupervised-inverse-proble/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/cb776d0adb3a7f72/) · [IEEE DOI](https://doi.org/10.1109/TSP.2026.3684951) · [IEEE Xplore](https://ieeexplore.ieee.org/document/11487988/) · [全部目录](/papers/catalog/)

> **来源与许可说明：** 本 PDF 为 **IEEE Transactions on Signal Processing, vol. 74, 2026, pp. 1805–1817** 的期刊正式版（DOI: 10.1109/TSP.2026.3684951；2026 年 4 月 20 日在线发表，当前版本日期 2026 年 5 月 21 日），并非 arXiv 预印本。页面头部"原文 arXiv"链接为论文库骨架登记信息（`arxiv.org/abs/2026.36849`），与本文正式出处不一致，特此说明；本页按 PDF 实际出处标注版本信息。

# 先验学习在无监督逆问题中何时有效、何时失效

**原题：** Where Prior Learning Can and Can't Work in Unsupervised Inverse Problems  
**作者：** Benoît Malézieux、Florent Michel、Thomas Moreau、Matthieu Kowalski（通讯作者）  
**单位：** Benoît Malézieux、Florent Michel 与 Thomas Moreau 就职于 Inria、Université Paris-Saclay、CEA（Palaiseau，法国）；Matthieu Kowalski 就职于 Université Paris-Saclay、Inria、CNRS 与数字科学跨学科实验室（LISN，Gif-sur-Yvette，法国）。  
**版本：** IEEE Transactions on Signal Processing, vol. 74, 2026, pp. 1805–1817（DOI: 10.1109/TSP.2026.3684951），原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–IV 节及全部小节（含 A/B/C 子节与"Contribution"段）、命题 II.1 与 II.2、例 II.3 与 II.4、式 (1)–(27)、附录 A–B（两个证明）、致谢、图 1–11 图注、参考文献 [1]–[44]（英文原条目）均按原文结构录入；原文无表格；原第 13 页末三份作者简介不属于正文，未逐段翻译。逐句逐式终校未做。

## 摘要

线性逆问题是指从低维空间中的含噪、不完整（或被压缩）观测中恢复信号。许多近期方法通过学习数据先验来弥补信息损失，通常使用成对的干净样本与退化样本。然而这类有监督方法在无监督场景中并不适用——此时没有真值信号可用。本文聚焦于先验以"学习得到的字典 + 稀疏码"形式出现的情形，从理论与实验两方面分析此类无监督先验学习的局限。我们首先证明：当观测通过**单一测量算子**获得时，学习字典在根本上不可行；**多个算子**可使恢复成为可能，前提是这些算子足够多样、能够张成整个信号空间。我们进一步研究弱结构先验的作用——这类先验可通过优化约束或深度学习架构引入——并从实验上表明：只有当它们与所处理的逆问题良好适配时，才会优于手工设计的先验。

**关键词：** 逆问题；无监督学习；字典学习。

## I. 引言

线性逆问题在观测科学中无处不在，例如成像 [1]、神经科学 [2] 与天体物理 [3]。它们是指从远程、含噪的测量 \(Y\in\mathbb R^{m\times N}\) 中重建信号 \(X\in\mathbb R^{n\times N}\)：测量由 \(X\) 的线性变换 \(\mathbf A\in\mathbb R^{m\times n}\) 获得，并叠加噪声 \(B\in\mathbb R^{m\times N}\)，即 \(Y=\mathbf A X+B\)。这里 \(m\) 与 \(n\) 分别表示测量维度与信号维度，\(N\) 为需要求解的问题数。由于 \(Y\) 的维度 \(m\) 通常远小于 \(X\) 的维度 \(n\)，这些问题是不适定的：多组信号都可能产生同一组观测；噪声带来的测量不确定性还会进一步增加可能生成给定测量的信号数量。为了在所有可能解中选出最合理的解，研究者依赖数据先验知识。

为进一步约束逆问题，一个常见假设是未知信号 \(X\) 在字典 \(D\) 上存在稀疏表示，即 \(X=DZ\)，其中 \(Z\) 包含稀疏系数。由此得到模型 \(Y=\mathbf A DZ+B\)，它构成字典学习方法的基础。该设定下字典 \(D\) 与稀疏码 \(Z\) 均未知，必须从测量 \(Y\) 中联合估计。这类模型已成功应用于大量场景——当信号结构过于复杂、难以用预定义基刻画，却可以从数据中学到时，它们尤为有效。

早期方法使用手工设计的字典或正交基来施加稀疏性，例如成像中的小波或音频中的 Gabor 函数 [4]。这些先验在某些领域有效，但往往难以刻画真实世界信号的多样性与复杂度。作为替代，数据驱动的字典学习 [5], [6], [7] 在血细胞检测 [8]、MEG 信号分析 [9] 等任务中被证明有效，使模型能够自适应地调整表示以匹配观测数据。最后，当真值数据可用时，先验也可以从真值数据中学习：例如基于深度学习的框架 [10], [11], [12] 提出把预训练去噪器嵌入迭代算法，以即插即用（Plug-and-Play，PnP）方式 [13] 求解问题。

近来，面向字典学习技术的展开（unrolling）方法 [14], [15] 引起了显著兴趣。然而这些方法需要干净信号，而干净信号在音频或成像中有时可得，在神经影像、天体物理等领域却常常不可得。

尽管数据驱动方法在有监督逆问题背景下已被广泛研究，近期工作开始关注无监督场景，并提出仅从被污染数据中学习的新算法 [16], [17], [18]。文献 [19] 与 [20] 的作者证明：要从测量中辨识信号，一个必要条件是以多个算子测量、且这些算子张成整个空间；或者当只有一个算子可用时，在模型中引入弱先验知识，例如群结构与等变性。其他基于深度学习的工作则利用成功的网络架构，在无法获得任何真值数据的条件下恢复图像。特别是深度图像先验（Deep Image Prior）表明，CNN 本身含有足够的先验信息，可在去噪、修补等多个逆问题中恢复图像 [21]。最后，也有少量工作表明，可以从**不完整数据**中学习字典，尤其是在缺失值或成像修补背景下 [22], [23], [24]。另一条研究路线研究了大规模矩阵的在线分解：每次迭代从数据中随机选取部分信息加以聚合 [25], [26]。这与从不完整数据学习字典等价，区别在于同一样本可从不同角度被多次观察，而在逆问题语境中这几乎不可能。

**贡献。** 本文探索用于求解逆问题的无监督先验学习，并指出该领域中的实际局限。更具体地说，假设信号在某个字典下稀疏，并基于"看到整个空间是准确辨识信号的**必要条件**"这一思想 [20]，我们聚焦于无监督字典学习这一具体情形。与在一般层面讨论先验学习的 [20] 不同，本文强调：在字典学习设定下，观测到整个信号空间是**必要但不充分**的——字典的恢复还严重依赖于稀疏码的可辨识性。据我们所知，此前只有 [27] 讨论过充分条件；本文提出的必要条件因此细化并补充了对逆问题中盲先验学习的理解，尤其针对稀疏表示。我们首先在第 II-A 节证明：在无监督设定下，字典学习只能学到位于 \(\mathbf A\) 的零空间正交补（记为 \(\ker(\mathbf A)^\perp\)）中的字典；随后在第 II-B 节研究通过多个算子进行字典学习的可能性，证明命题 II.1 导出的必要条件（即所学字典被限制在测量算子的值域内）可以直接推广到多算子情形。然而，即使这些算子共同张成整个空间，该条件仍不足以恢复——它们的结构可能使问题更具挑战性。

作为第二项贡献，我们研究基于卷积的技术在信号恢复任务中的有效性。在第 III 节我们开展大量实验，评估三种流行方法的实际表现：(i) 卷积字典学习（Convolutional Dictionary Learning，CDL），用以从实验上验证第 II 节关于无监督字典学习局限的理论发现；(ii) 深度图像先验（DIP），其先验即深度卷积架构；(iii) 即插即用方法（PnP），它把卷积神经网络去噪器作为变分方法中的近端算子。我们的结果表明：这些方法对修补（inpainting）有效，但对去模糊（deblurring）还需要额外的先验信息。换言之，这种弱卷积先验必须为去模糊作适配，同时又要保持对修补任务的适用性。

## II. 逆问题中先验学习的主要瓶颈

处理逆问题时，信号维度通常大于测量维度。这意味着观测过程丢失了信号的部分信息，尤其是落在算子 \(\mathbf A\) 零空间中的部分。为应对该问题，我们考察这种降维对字典学习的影响——字典学习即学习一组可用于重建信号的基向量。命题 II.2 给出单算子下这种退化对字典学习影响的理论分析，并证明该必要条件可推广到多算子，进而讨论其实际含义。

### A. 单一测量算子下的字典学习

字典学习假设信号可在由模式（也称为原子）构成的冗余基上分解为稀疏表示。换言之，目标是恢复信号 \(X\in\mathbb R^{n\times N}=DZ\)，其中 \(Z\in\mathbb R^{L\times N}\) 为稀疏码，\(D\in\mathbb R^{n\times L}\) 为含 \(L\) 个原子的字典。以基于 Lasso 的字典学习为例，恢复 \(X\) 需要求解如下形式的问题：

$$
\min_{Z\in\mathbb R^{L\times N},D\in\mathcal C}\ \frac12\|\mathbf A DZ-Y\|_2^2+\lambda\|Z\|_1,\tag{1}
$$

其中 \(\lambda\) 为正则化超参数，\(\mathcal C\) 为约束集合，通常约束 \(D\) 的每一列 \(\ell_2\) 范数不超过 1，即 \(\|D_j\|_2\le1\)，其中 \(D_j\) 表示 \(D\) 的第 \(j\) 列。

我们首先想理解测量算子 \(\mathbf A\) 的结构如何影响字典的可辨识性。在命题 II.1 中，我们聚焦于修补设定：此时 \(\mathbf A\) 为二值掩膜，即具有 \(m\) 个非零元素的对角矩阵。

为说明该结果的直观来源，考虑真值字典 \(D_0\) 与另一个字典 \(D\)，后者与 \(D_0\) 的差异在于 \(\mathbf A\) 的零空间方向上的扰动。由于 \(\mathbf A(D-D_0)=0\)，对任意给定 \(Z\)，\(D\) 与 \(D_0\) 都产生相同的重建 \(\mathbf A DZ\)，因此重建误差完全相同。然而这两个字典诱导的稀疏码不同：使用 \(D\) 通常会导致更高的 \(\ell_1\) 范数，因为稀疏码 \(Z\) 必须补偿 \(D\) 中落在 \(\ker(\mathbf A)\) 内的分量。换言之，\(\mathbf A\) 零空间中的方向对数据保真项而言是"不可见"的，但要付出稀疏性代价。

因此，最小化总目标（重建 + 稀疏）会偏向在 \(\ker(\mathbf A)\) 中为零的字典。下述命题形式化了这一直觉，并证明把 \(D_0\) 投影到可见部分 \(\ker(\mathbf A)^\perp=\operatorname{range}(\mathbf A^T)\) 只会改善目标值。

**命题 II.1：** 考虑对角测量矩阵 \(\mathbf A=\operatorname{diag}(a_1,\ldots,a_m,0,\ldots,0)\in\mathbb R^{n\times n}\)，其中 \(m<n\) 且 \(a_1\ge\cdots\ge a_m>0\)。令 \(D_0\in\mathbb R^{n\times L}\)，并令 \(D'\) 满足

$$
D'=\left(\frac{\|D_{0,j}\|}{\|D_{0,j,m}\|}D_{0,j,m}\bigg/\ 0_{n-m}\right)_{1\le j\le L},\qquad\text{其中}\ D_0=\binom{D_{0,m}}{D_{0,n-m}}.
$$

则

$$
\min_{Z}\ \frac12\|\mathbf A D'Z-Y\|_2^2+\lambda\|Z\|_1\ \le\ \min_{Z}\ \frac12\|\mathbf A D_0Z-Y\|_2^2+\lambda\|Z\|_1.
$$

当 \(\lambda=0\) 时该不等式取等号，因为两个字典给出相同的重建；当 \(\lambda>0\) 时，等号成立当且仅当 \(D_0\) 在 \(\ker(\mathbf A)\) 上为零。

所有证明见附录 A（原文 Section A）。可以注意到，该结果在 \(\lambda=0\) 时仍然成立：此时目标退化为重建误差 \(\|\mathbf A DZ-Y\|_2\)。这种"可见/不可见"分解如图 1 所示。

在这个简单情形中，命题表明最优字典必须在 \(\mathbf A\) 的零空间上为零。证明的核心思想是：由于不变性，字典学习的最优解包含在等价类 \(\{PSD'+V\}\) 中，其中 \(P\) 为置换矩阵，\(S\) 为缩放矩阵，\(D'\) 为秩至多 \(m\) 的矩阵，\(V\) 为秩至多 \(n-m\) 的矩阵且满足 \(PSD'\in\ker(\mathbf A)^\perp\)。给定该等价类中的字典 \(PSD'+V\)，经过适当重缩放后，字典 \(PSD'\) 总是更优的极小点。因此求解器会把 \(\ker(\mathbf A)\) 中的所有方向置零，同时增大其他行的范数，并相应减小 \(Z\) 中的对应数值，从而降低 \(\ell_1\) 范数。命题 II.2 把命题 II.1 推广到矩形矩阵情形。

**命题 II.2：** 设 \(\mathbf A\in\mathbb R^{m\times n}\) 为测量矩阵，\(m<n\)，\(Y\in\mathbb R^{m\times N}\) 为观测数据。若字典 \(D\in\mathbb R^{n\times L}\) 是

$$
\min_{Z\in\mathbb R^{L\times N},D\in\mathcal C}\ \frac12\|\mathbf A DZ-Y\|_2^2+\lambda\|Z\|_1
$$

的解，则 \(D\in\ker(\mathbf A)^\perp\)。

本质上，若只使用一个测量矩阵，我们只能期望学到秩不超过 \(m\) 的字典。根据 [20]，当假设信号空间没有额外约束时，单个 \(m<n\) 的算子无法恢复信号；这里我们补充了该结果，说明只能学到算子值域内的字典。[27] 已证明，在关于算子的特定约束下字典可以被唯一辨识；命题 II.2 则表明，辨识算子值域之外的任何内容都是不可能的。

**维度降低使值域空间内的字典学习同样变难。** 即使在信号的值域空间内，也不总能可靠地学到好的字典。可辨识性或局部恢复的保证严重依赖于稀疏码 \(Z\) 的准确估计 [28], [29], [30]；当测量维度 \(m\) 小于信号维度 \(n\) 时，该估计变得不稳定。例如，若 \(D\) 为高斯随机字典，压缩感知理论指出 \(n\ge2s\ln(L/s)\)（\(s\) 为 \(Z\) 的稀疏度）是能以高概率恢复 \(Z\) 的充分条件 [31]。当字典被矩阵 \(\mathbf A\) 退化后，该约束变为 \(m\ge2s\ln(L/s)\)，而能够可靠恢复的稀疏码必须稀疏得多、其比例接近 \(m/n\)，以补偿信息损失。这意味着：随着数据被污染，恢复字典中不位于 \(\mathbf A\) 零空间的部分也会变得更困难。

为展示逆问题中恢复字典的困难，我们做了如下实验：构造 \(100\times100\) 的随机高斯字典，并用典型的 Bernoulli–Gaussian 模型生成稀疏信号；随后施加压缩感知算子生成测量；最后通过交替最小化求解式 (1) 来估计字典与信号——固定 \(D\) 时用 FISTA 估计稀疏码 \(Z\)，再用投影梯度下降更新 \(D\) 以施加逐列范数约束。

我们基于字典各列之间的 Pearson 相关性评估字典质量。为使度量对符号与置换不变，采用最优线性指派

$$
S(C)=\max_{\sigma\in S_L}\ \frac1L\sum_{j=1}^{L}\left|C_{\sigma(j),j}\right|,
$$

其中 \(S_L\) 为 \([1,L]\) 的置换群，\(C\) 为代价矩阵，其第 \((i,j)\) 个元素比较第一个字典的第 \(i\) 个原子与第二个字典的第 \(j\) 个原子。该度量可用匈牙利算法计算 [32]，字典被完美恢复时取值为 1。在测量算子 \(\mathbf A\in\mathbb R^{m\times n}\)、数据由归一化原子的字典 \(D\in\mathbb R^{n\times L}\) 生成的逆问题背景下，可达到的最高分数为

$$
S_{\max}=\frac1L\sum_{j=1}^{L}\left(\frac{D_{j,m}}{\|D_{j,m}\|},\ 0_{n-m}\right)^T D_j=\frac1L\sum_{j=1}^{L}\|D_{j,m}\|.\tag{2}
$$

我们把不同稀疏度与不同测量规模 \(m\) 下得到的分数，与取原字典在 \(\ker(\mathbf A)^\perp\) 中投影所能达到的完美分数进行比较。

图 2 给出恢复分数随测量规模与 Bernoulli–Gaussian 信号稀疏度的变化。当维度 \(m\) 减小时恢复分数下降；较小的 \(m\) 需要很高的稀疏度才能在 \(\mathbf A\) 的值域内恢复字典。

### B. 通过多个算子观测数据

当观测通过单一测量算子获得时，从压缩数据学习字典的能力受到根本限制。然而，若使用多个算子、每个算子提供对底层信号的不同投影，就有可能"看到"整个空间并恢复有意义的字典。本节通过假设所有观测均来自共享的真值信号 \(X\in\mathbb R^{n\times N}\)、并通过 \(N_m\) 个不同的线性算子 \(\mathbf A_i\in\mathbb R^{m\times n}\) 测得，来形式化这一直觉：

$$
Y_i=\mathbf A_i X,\qquad i=1,\ldots,N_m.\tag{3}
$$

我们希望学习字典 \(D\in\mathbb R^{n\times L}\) 与共享稀疏码 \(Z\in\mathbb R^{L\times N}\)，使 \(X\approx DZ\)。由间接观测进行字典学习的问题于是写为

$$
F(D,Z)=\sum_{i=1}^{N_m}\frac12\|Y_i-\mathbf A_iDZ\|_F^2+\lambda\|Z\|_1,\tag{4}
$$

与之相对，无退化（即完整访问 \(X\)）时的对应目标为

$$
F^{\rm full}(D,Z)=\frac12\|X-DZ\|_F^2+\lambda\|Z\|_1.\tag{5}
$$

这两个问题都是非凸的，通常用交替最小化求解，在稀疏编码与字典更新之间交替。尽管许多近期方法依赖基于梯度的优化 [7], [33]，较早或专门化的方法曾使用 K-SVD [6]、MOD [34] 等非梯度技术进行字典更新。

在两种表述中，字典 \(D\) 的优化都在固定稀疏码 \(Z\) 下进行。于是关于 \(D\) 的梯度为

$$
\nabla_D F^{\rm full}(D,Z)=(DZ-X)Z^T,\tag{6}
$$

$$
\nabla_D F(D,Z)=\sum_{i=1}^{N_m}\mathbf A_i^T(\mathbf A_iDZ-Y_i)Z^T.\tag{7}
$$

把 \(Y_i=\mathbf A_iX\) 代入式 (7)，得

$$
\nabla_D F(D,Z)=\sum_{i=1}^{N_m}\mathbf A_i^T\mathbf A_i(DZ-X)Z^T.\tag{8}
$$

因此间接损失的梯度与全数据梯度之间通过一个线性变换相联系：

$$
\nabla_D F(D,Z)=\left(\sum_{i=1}^{N_m}\mathbf A_i^T\mathbf A_i\right)\nabla_D F^{\rm full}(D,Z).\tag{9}
$$

矩阵 \(\sum_i\mathbf A_i^T\mathbf A_i\) 起到一种度量的作用，对全数据目标的梯度方向进行重新加权。当该矩阵可逆时，有无测量算子的两种梯度通过一个线性变换对齐，并在相同的临界点处消失。因此，假设同一底层信号 \(X\) 通过多个算子观测、且稀疏码 \(Z\) 在所有观测间共享，则从压缩测量学习字典本质上等价于在度量变换意义下求解全数据问题。

若 \(\sum_i\mathbf A_i^T\mathbf A_i\) 不是满秩，则联系 \(\nabla_D F(D,Z)\) 与 \(\nabla_D F^{\rm full}(D,Z)\) 的变换不再可逆。此时退化问题可能出现全数据表述中不存在的额外临界点。这些伪极小值会困住优化过程，导致学到的字典虽能较好解释观测 \(Y_i\)，却对应更不稀疏的表示或信号空间中错误的方向。当各个算子 \(\mathbf A_i\) 过于压缩或冗余、无法共同刻画信号的完整结构时，这种情形尤为典型。我们在高度压缩的设定中实验观察到此类行为：稀疏编码失败，字典恢复变得不可靠。

这一等价关系凸显了**算子多样性**的重要性：若测量算子 \(\{\mathbf A_i\}\) 共同张成整个环境空间，即 \(\sum_i\mathbf A_i^T\mathbf A_i\) 满秩，则间接观测所含信息足以恢复信号结构与字典。该分析直接联系到第 II-A 节所述的理论瓶颈：无法观测整个信号空间会阻碍有意义先验的辨识；而 \(\sum_i\mathbf A_i^T\mathbf A_i\) 满秩这一条件保证整个信号空间确实通过这组测量算子被"看到"。

然而必须强调，该条件只是字典恢复的**必要**条件。实践中成功恢复还依赖于稀疏码 \(Z\) 的可辨识性，而若每个算子的测量数 \(m\) 太小，后者可能失败。因此，尽管多算子理论上可能提供足够信息，稀疏编码保证——进而字典恢复——在强压缩机制下仍可能失效。

下面给出两个多算子逆问题的例子，以说明无监督字典学习的挑战。

**例 II.3（压缩感知，CS）：** 考虑所有 \(\mathbf A_i\) 均为具有独立高斯元素的随机矩阵的情形。此时 \((\mathbf A_1^T,\cdots,\mathbf A_{N_m}^T)\) 也是 \(n\times N_mm\) 维随机高斯矩阵，因此当 \(N_m\ge\lfloor n/m\rfloor+1\) 时它以概率 1 满秩（秩为 \(n\)）。图 3 表明这是恢复 \(D\) 的必要条件，但当 \(m\) 太小时并不充分，原因可能是稀疏编码变得低效。关于多视图压缩字典学习的更多理论洞见见 [35], [36], [37]。

**例 II.4（修补）：** 现在考虑所有 \(\mathbf A_i\) 均为系数服从参数 \(p_1,\cdots,p_n\) 的 Bernoulli 分布的二值掩膜，即 \(\mathbf A_i=\operatorname{diag}(a_i^1,\cdots,a_i^n)\)，其中每个 \(a_i^j\) 以概率 \(p_j\) 取 1。若对每个坐标 \(j\) 都存在指标 \(i\) 使 \(a_i^j=1\)，则 \((\mathbf A_1^T,\cdots,\mathbf A_{N_m}^T)\) 的秩等于 \(n\)；该事件发生的概率为 \(\prod_j\left(1-(1-p_j)^{N_m}\right)\)。图 4 表明与 CS 类似，这是恢复合适字典的必要但不充分条件。即使样本数足以补偿缺失值，在严重降维后数据的稀疏度仍会对算法恢复正确字典的能力起重要作用。

为说明真实数据中的情形，我们考虑图像修补的例子。设 \(\mathbf A\in\{0,1\}^{h\times w}\) 为用于观测图像 \(X\in[0,1]^{h\times w}\) 的二值掩膜，\(Y=\mathbf A\odot X\) 为观测图像。虽然把整幅图像一次处理时算子是唯一的，但从图像的大小为 \(n\) 的图块上学习字典，等价于式 (4) 中多个算子的字典学习。记 \(\mathbf A_{ij}=\operatorname{diag}(\mathbf A_{ni:n(i+1),nj:n(j+1)})\)、\(Y_{ij}=\operatorname{vect}(Y_{ni:n(i+1),nj:n(j+1)})\) 为第 \((i,j)\) 个图块，则基于图块的字典学习求解

$$
\min_{Z_{ij},D\in\mathcal C}\ \sum_{i,j}\frac12\|\mathbf A_{ij}DZ_{ij}-Y_{ij}\|_2^2+\lambda\|Z_{ij}\|_1.\tag{10}
$$

若图像足够大且被掩膜遮挡的像素不太多，字典应可恢复。图 5 给出在 \(256\times256\) 灰度图像上、随缺失值比例变化的 PSNR（峰值信噪比）与恢复分数；该图像的掩膜含给定比例的缺失像素。随后把图像划分成 \(10\times10\) 的图块，并在这些图块上学习大小为 100 的字典，取 \(\lambda=0.1\)（在无缺失值的实验设定中表现良好的取值）。我们通过比较有掩膜与无掩膜时得到的字典来计算恢复分数，并用给定原子对应的稀疏激活 \(Z\) 绝对值的平均值对代价加权：

$$
W=\left(\sum_{i=1}^{N}|Z_{1,i}|,\cdots,\sum_{i=1}^{N}|Z_{L,i}|\right)^T\bigg/\sum_{i,j}|Z_{i,j}|\tag{11}
$$

$$
C=D_0^T\left(D^T\odot W\right)^T.\tag{12}
$$

该分数更好地反映原子的有用性，并能计入"在自然信号上学到的字典可能包含很少被使用的无关原子"这一事实。我们重复该实验 10 次。当缺失值比例超过 50% 时恢复分数下降；否则即使字典从退化观测中学得，图像仍被成功恢复。这正是字典学习在无监督图像修补文献 [22], [23], [24] 中取得良好效果的原因。

命题 II.2 表明字典学习不会在测量矩阵的零空间内起作用。使用多个算子可缓解该问题：整个信号空间通过不同矩阵 \(\mathbf A_i\) 被看到，从而缩小有效零空间。然而，我们在合成数据与真实数据上的实验也表明，这仅是学到好字典的必要条件。某些情况下信息退化过重，稀疏码无法恢复；此时降低观测维度可能成为字典学习的硬性限制。下文将以成像中的卷积为例，说明精心选择的弱先验知识如何打破该限制，并允许从单算子的核空间中恢复信息。

## III. 通过卷积引入的弱先验知识

卷积在深度学习中的应用 [38] 已在从图像分类到重建的广泛任务中取得巨大成功。卷积神经网络能高效分析平移不变数据，同时减少参数数量。

本节旨在解释卷积作为无监督图像重建的弱先验知识为何有效、又受何限制。在简要讨论相关方法后，我们针对去模糊与修补问题，对基于卷积的先验学习开展全面的实验研究。

### A. 基于卷积的先验学习方法

我们研究三种基于先验学习的方法：卷积字典学习 [40]、即插即用 [10] 与深度图像先验 [21]。卷积字典学习（CDL）从信号 \(Y\) 学习相对小尺寸的卷积核，以稀疏地重建信号；基于 \(\ell_1\) 的表述为

$$
\min_{z_k,d_k\in\mathcal C}\ \frac12\left\|\mathbf A\sum_k d_k*z_k-Y\right\|_2^2+\lambda\sum_k\|z_k\|_1.\tag{13}
$$

该表述可解释为对所有信号图块施加共享的局部字典：每个卷积隐式定义一个作用于信号不同部分的局部线性算子。该结构实际上与例 II.4 所述的多算子设定相似——图块级的退化充当不同测量。这些局部算子的多样性使字典恢复在该设定下成为可能。

深度图像先验（DIP）利用 CNN 架构，通过在隐空间取随机码向量 \(z\) 并优化网络参数，把观测图像投影到适配的值域空间：

$$
\min_\theta\ \|Y-\mathbf A f_\theta(z)\|_2^2.\tag{14}
$$

与 DIP 的原始表述 [21] 一致，网络直接在被退化的观测 \(Y\) 上训练，无法访问真值信号 \(X\)。

即插即用（PnP）是一种受近端梯度下降启发的迭代算法，其从观测 \(Y\) 恢复图像的形式为

$$
X_{n+1}=f_\theta\left(X_n-\tau\mathbf A^*(AX_n-Y)\right)\qquad\forall n\ge1,\tag{15}
$$

其中 \(X_0=0\)，\(\tau\) 为步长，\(f_\theta\) 为图像去噪器。在经典 PnP 方法中，去噪器 \(f_\theta\) 在干净信号 \(X\) 上预训练，通常采用有监督深度学习。与之不同，我们在此考虑更具挑战性的无监督设定：\(f_\theta\) 必须直接在被退化的测量 \(Y\) 上学习，无法访问真值数据。该情形代表了神经影像、天体物理等干净数据不可得的领域。需要强调，我们的结果凸显的是"仅从 \(Y\) 学习先验"的局限，不应被理解为对传统 PnP 方法的批评——后者在不同假设下运行。

CDL 与 DIP 是无监督方法，可直接应用于单次观测，因为先验直接从退化数据学习或固定、无需训练集。由于我们关注无监督设定，PnP 被改造为在退化数据上训练去噪器。注意这里偏离了经典 PnP 文献：\(f_\theta\) 被用作重建器而非去噪器，这与近期把 PnP 扩展到更复杂恢复操作的工作 [41] 一致。在此情形下，我们假设可访问数据集 \((Y_i)_{1\le i\le N}\)，其中每个 \(Y_i=AX_i+\epsilon_i\) 是原图像 \(X_i\) 经同一算子 \(\mathbf A\) 与高斯噪声 \(\epsilon_i\) 退化后的观测。我们由观测数据集生成含噪图像 \(Y'_i=Y_i+\epsilon'_i\)，并训练 DnCNN [42]，在 \(\mathbf A\) 的值域空间内由 \(Y'_i\) 恢复 \(Y_i\)：

$$
\min_\theta\ \frac1N\sum_i\left\|\mathbf A\left(f_\theta(Y'_i)-Y_i\right)\right\|_2^2,\tag{16}
$$

其中 \(X\) 与 \(Y\) 具有相同维度（在适当的边界条件下）。其想法是检验在何种情况下，网络架构能够通过从 \(\mathbf A\) 值域空间中的信息学习，来补偿 \(\mathbf A\) 核空间中的信息缺失。为指出这些先验学习算法的局限，我们将把它们与基于全变差（TV）[43] 和小波稀疏表示 [4] 的两种重建方法比较。目标是在多种情境下凸显无监督方法的硬性局限。因此，我们在**最优（oracle）超参数**下评估各算法达到的性能——即能带来最佳性能的超参数。虽然在比较不同方法时评估超参数敏感性是必要的，但这与本文研究正交：本文关注的是相似方法在有监督与无监督训练下的差异。

### B. 为什么卷积在修补类任务上可能有效

关于无监督逆问题中先验学习的已有工作，常在修补任务上评估所提方法的性能 [19], [21]，并取得相比有监督学习技术非常好的效果。这里我们给出一些分析，以理解为何该任务在仅用卷积字典或神经网络、且无法访问真值数据时仍可完成。

**a）从不完整数据学习卷积字典。** 为理解修补中发生了什么，考虑一个简单的**一维信号**例子。设 \(X_t\) 为宽平稳（wide sense stationary，WSS）随机过程，\(\mathbf A_t\) 为均值为 \(\rho\) 的 i.i.d. Bernoulli 过程。观测信号 \(Y_t=A_tX_t\) 也是 WSS 随机过程，其自相关函数 \(R_Y(\tau)\) 为

$$
R_Y(\tau)=\mathbb E\left[A_tX_tA_{t+\tau}X_{t+\tau}\right]=R_X(\tau)\mathbb E\left[A_tA_{t+\tau}\right]\tag{17}
$$

$$
=\rho^2R_X(\tau)\mathbf 1_{\tau\ne0}+\rho R_X(\tau)\mathbf 1_{\tau=0}.\tag{18}
$$

于是 Wiener–Khintchine 定理保证 \(X\) 与 \(Y\) 的功率谱密度成正比。这表明当信号样本足够多时，掩膜过程不会影响原信号 \(X\) 的频谱，平移不变先验便可利用所有频率的信息。这意味着原信号被完整观测（所有频率都得以恢复），因而任务可解。直观地说，当在平移不变信号上学习小卷积核的参数时，信号的各个子部分充当不同观测，且可能具有不同测量算子。对足够大的信号，由于缺失像素随机分布，信号的各子部分被完整观测，从而使逆问题可行。

**b）字典恢复。** 我们在图 6 中展示该观察的实际含义：CDL 从一幅图像中恢复由 10 个数字组成的字典的能力，取决于图像尺寸与可用像素比例 \(\rho\)。正如预期，当 \(\rho\) 不过低（\(>0.5\)）时，用于生成图像的字典的恢复随图像尺寸增大而改善。这表明当信号足够大时，使用卷积来利用图像的平移不变性、从退化图像学习字典是可行的。必须注意，访问所有频率只是学到好字典的必要条件：当缺失值太多时，稀疏编码假设不再成立。还需注意，这些观察不适用于非平稳信号，因为非平稳信号不具有平移不变性。

**c）无监督重建。** 图像重建中也可观察到类似效应。自然图像足够稳定，使基于卷积的算法能从信号中存在的所有频率学习。图 7(a) 给出一个例子：单幅自然图像经随机二值掩膜与高斯噪声退化，图中报告 CDL、DIP 以及基于 TV 与小波的方法在不同缺失像素比例和不同 SNR 水平（无噪声、20 dB、12 dB、6 dB）下、在掩膜核空间与值域空间中的重建 PSNR。PSNR 基于真值数据 \(X\) 与恢复结果 \(\hat X\) 计算。重建误差被分解为值域空间与核空间两部分，二者行为不同。对低噪声水平，无监督方法达到有监督方法的性能，说明算法表现得就像看到了完整数据。注意 PSNR 的整体损失也主要来自核空间 PSNR 的下降，因为缺失像素越多该空间越大。当噪声过高时，无监督先验学习方法即使在 \(\mathbf A\) 的值域空间内也无法学到合适先验，导致整体结果较差。

对 PnP 方法可得类似结论。这里"有监督 PnP"指使用在干净信号上学习得到的去噪器的 PnP 重建算法；"无监督 PnP"指直接由观测按式 (16) 学习先验。两种情形下，我们都训练基于 DnCNN 的去噪器（使用 Imagenette 数据集中的图像），并把它插入迭代重建算法。图 7(b) 给出不同 SNR 与缺失像素比例下的结果。与单图像示例类似，无监督 PnP 能从 \(\mathbf A\) 值域空间所学信息中恢复核空间信息，且只要掩膜像素比例与噪声不过大（即 SNR ≥ 20 dB、缺失像素比例低于 50%），其表现与有监督版本接近。噪声水平更高时，无监督 PnP 在值域空间中的性能下降，因而核空间中的性能也下降。

这些实验凸显：在噪声水平不过高（SNR ≥ 20 dB）时，无监督方法的表现与有监督 CDL 相当，并且在 \(\mathbf A\) 的核空间中优于手工先验。它们成功地在 \(\mathbf A\) 的值域空间内学习，并泛化到核空间。当噪声增大、学习信号结构变得更困难时，TV 与小波往往更稳健。图 8 给出无噪声情形下的可视化示例：无监督算法在二值掩膜（50% 像素缺失）退化后成功恢复原图像，PSD 显示低频与高频都被恢复（尽管 CDL 情形存在振铃伪影）。然而 CDL 与 DIP 对噪声敏感，在含噪场景中无法从观测中恢复相关频率。

### C. 卷积在去模糊中的陷阱

如修补所示，当所有频率都被保留时卷积效果良好。然而若干逆问题需要恢复部分频谱缺失的信号：超分辨率中信号所有奇数频率丢失；去模糊中信号经过低通滤波退化后才被观测。如第 II-B 节所述，从退化观测学习在此情形会失败。与修补不同，此类基于傅里叶的算子的值域空间在与平移算子复合后保持不变。因此这些问题无法从卷积先验中受益：卷积先验无法补全频谱，信号空间的一部分始终未被看到。下面聚焦去模糊的例子。

利用 Parseval 等式，CDL 问题可在傅里叶域重写为

$$
\min_{z_k,d_k}\ \frac12\left\|\hat{\mathbf A}\sum_k\hat d_k\hat z_k-\hat Y\right\|_2^2+\lambda\sum_k\|z_k\|_1,\tag{19}
$$

其中 \(\hat x\) 表示信号 \(x\) 的傅里叶变换。对去模糊，由于频谱 \(\hat{\mathbf A}\) 是低通的，所有高频信息都已丢失。因此最优字典所含原子 \((d_k)_k\) 的高频被置零——原因与命题 II.1 所指出的相同。图 9 说明了这一点：在模糊图像上学到的原子不含高频（看起来模糊），而在修补图像上学到的原子含高频。

图 10 给出模糊图像在多种方法下的重建及其 PSD。这些结果表明，CDL 与 DIP 都无法恢复模糊跨度之外（即高频）的信息：CDL 把所有高频置零，DIP 则添加噪声。我们还看到，小波能更好地恢复高频，因其特殊结构把低频与高频联系起来。图 11(a) 给出这些方法在不同模糊尺度下的性能，并分解为核空间与值域空间。所有方法都因核空间重建差而性能迅速下降。我们还注意到，**有监督 CDL 相比无监督 CDL 没有提升**。我们推测原因在于所学字典不允许这样做——它没有把核空间与值域空间的信息联系起来。

同样的现象出现在图 11(b) 的 PnP 中：核空间中有监督与无监督学习之间存在性能差距。这表明无监督学习带来的性能损失再次主要由核空间损失导致。然而与修补不同，即使模糊尺度较小，各噪声水平下无监督与有监督学习的差距都显著，说明该问题本质上比修补更难——我们需要具有适配结构、能够恢复高频的先验，例如 [44] 提出的尺度不变性（scale invariance）。

## IV. 结论

要求解无监督逆问题，重要的是拥有能覆盖整个空间的多个算子，或在模型中引入适当约束以利用数据的结构与不变性。然而，当算子条件数过差（如去模糊）时，先验知识必须补偿信息缺失；此时仅依赖卷积是不够的，即使在可访问干净数据的有监督设定下也是如此。

现有方法存在局限，这凸显了需要创新策略：既能学习对算子退化稳健的字典，又足够通用以适应广泛的逆问题。这类方法将是我们在存在复杂、病态算子时有效重建信号方面的重要一步。要发展稳健、抗算子的字典，需要多方面的方法，把先进机器学习技术与对问题结构及物理的深刻洞见结合起来。

## 附录 A：命题 II.1 的证明

令 \(Z_0\in\arg\min_Z\frac12\|\mathbf A D_0Z-Y\|_2^2+\lambda\|Z\|_1\)。令 \(Z'_j=\frac{\|D_{0,j,m}\|}{\|D_{0,j}\|}Z_{0j}\)。则

$$
\|\mathbf A D'Z'-Y\|_2=\|\mathbf A D'_0Z'_0-Y\|_2\tag{20}
$$

$$
\|Z'\|_1\le\|Z_0\|_1\tag{21}
$$

结论成立。

> **原文疑点：** 式 (20) 在原文中排版为等号；但结合式 (21) 与证明思路看，此处应比较构造点 \((D',Z')\) 与原最优点 \((D_0,Z_0)\) 的目标值（通常为"\(\le\)"），原文等号形式疑为排版/笔误。本页按原文照录，不作改动。

## 附录 B：命题 II.2 的证明

设 \(\mathbf A\in\mathbb R^{m\times n}\)、\(Y\in\mathbb R^{m\times N}\)。我们要求解

$$
\min_{D\in\mathcal C,Z}\ \frac12\|\mathbf A DZ-Y\|_2^2+\lambda\|Z\|_1.\tag{22}
$$

对 \(\mathbf A\) 做奇异值分解，得

$$
\mathbf A=U\Lambda V^*,\qquad\text{其中}\ U\in\mathbb R^{m\times m},\ V\in\mathbb R^{n\times n},\quad UU^*=I_m,\ VV^*=I_n,
$$

$$
\Lambda=\begin{bmatrix}a_1&0&\cdots&0&\cdots&0\\0&a_2&\cdots&0&\cdots&0\\\vdots&\vdots&\ddots&\vdots&\vdots&\vdots\\0&0&\cdots&a_m&\cdots&0\end{bmatrix}.
$$

于是

$$
\min_{D\in\mathcal C,Z}\ \frac12\|\mathbf A DZ-Y\|_2^2+\lambda\|Z\|_1\tag{23}
$$

$$
=\min_{D\in\mathcal C,Z}\ \frac12\|U\Lambda V^*DZ-Y\|_2^2+\lambda\|Z\|_1\tag{24}
$$

$$
=\min_{D\in\mathcal C,Z}\ \frac12\|\Lambda V^*DZ-U^*Y\|_2^2+\lambda\|Z\|_1\tag{25}
$$

$$
=\min_{\tilde D\in\mathcal C,Z,\ D=V\tilde D,\ \tilde Y=U^*Y}\ \frac12\|\Lambda\tilde DZ-\tilde Y\|_2^2+\lambda\|Z\|_1.\tag{26}
$$

通过给 \(\Lambda\) 补零使其成为方阵、并在测量向量 \(U^*Y\) 末尾补零以保持维度一致，问题化为

$$
\min_{D\in\mathcal C,Z}\ \frac12\|\Lambda\tilde DZ-\tilde Y\|_2^2+\lambda\|Z\|_1
$$
$$
\text{s.t.}\quad\Lambda=\operatorname{diag}(a_1,\cdots,a_m,0,\cdots,0),\quad\tilde Y=\binom{U^*Y}{0_{n-m}}.\tag{27}
$$

于是命题 II.1 适用，最优字典包含在 \(\ker(\mathbf A)^\perp\) 中。

## 致谢

作者感谢 Julian Tachella 的有益讨论。

## 参考文献（英文原书目）

[1] A. Ribes and F. Schmitt, “Linear inverse problems in imaging,” IEEE Signal Process. Mag., vol. 25, no. 4, pp. 84–99, Jul. 2008.

[2] A. Gramfort, M. Kowalski, and M. Hämäläinen, “Mixed-norm estimates for the M/EEG inverse problem using accelerated gradient methods,” Phys. Med. Biol., vol. 57, no. 7, pp. 1937–1961, 2012.

[3] J.-L. Starck, “Sparsity and inverse problems in astrophysics,” J. Phys. Conf. Ser., vol. 699, no. 1, p. 012010, 2016.

[4] Mallat, S. A Wavelet Tour of Signal Processing. San Francisco, CA, USA: Academic, 2008.

[5] B. A. Olshausen and D. J. Field, “Sparse coding with an overcomplete basis set: A strategy employed by V1?” Vision Res., vol. 37, no. 23, pp. 3311–3325, 1997.

[6] M. Aharon, M. Elad, and A. Bruckstein, “K-SVD: An algorithm for designing overcomplete dictionaries for sparse representation,” IEEE Trans. Signal Process., vol. 54, no. 11, pp. 4311–4322, Nov. 2006.

[7] J. Mairal, F. Bach, J. Ponce, and G. Sapiro, “Online learning for matrix factorization and sparse coding,” J. Mach. Learn. Res., vol. 11, no. 1, pp. 19–60, 2009.

[8] F. Yellin, B. D. Haeffele, and R. Vidal, “Blood cell detection and counting in holographic lens-free imaging by convolutional sparse dictionary learning and coding,” in Proc. Int. Symp. Biomed. Imag., Piscataway, NJ, USA: IEEE Press, 2017, pp. 650–653.

[9] T. Dupré la Tour, T. Moreau, M. Jas, and A. Gramfort, “Multivariate convolutional sparse coding for electromagnetic brain signals,” in Proc. Adv. Neural Inf. Process. Syst., 2018, vol. 31, pp. 3292–3302.

[10] S. H. Chan, X. Wang, and O. A. Elgendy, “Plug-and-play ADMM for image restoration: Fixed-point convergence and applications,” IEEE Trans. Comput. Imag., vol. 3, no. 1, pp. 84–98, Mar. 2017.

[11] Y. Romano, M. Elad, and P. Milanfar, “The little engine that could: Regularization by denoising (RED),” SIAM J. Imag. Sci., vol. 10, no. 4, pp. 1804–1844, 2017.

[12] J. R. Chang, C.-L. Li, B. Poczos, B. Vijaya Kumar, and A. C. Sankaranarayanan, “One network to solve them all—solving linear inverse problems using deep projection models,” in Proc. IEEE Int. Conf. Comput. Vision, 2017, pp. 5888–5897.

[13] A. Brifman, Y. Romano, and M. Elad, “Turning a denoiser into a super-resolver using plug and play priors,” in Proc. IEEE Int. Conf. Image Process. (ICIP), Piscataway, NJ, USA: IEEE Press, 2016, pp. 1404–1408.

[14] B. Malézieux, T. Moreau, and M. Kowalski, “Understanding approximate and unrolled dictionary learning for pattern recovery,” in Proc. Int. Conf. Learn. Representations, 2022.

[15] B. Tolooshams and D. E. Ba, “Stable and interpretable unrolled dictionary learning,” Trans. Mach. Learn. Res., Aug. 2022.

[16] J. Lehtinen et al., “Noise2Noise: Learning image restoration without clean data,” in Proc. Int. Conf. Mach. Learn., 2018, pp. 2965–2974.

[17] A. Bora, E. Price, and A. G. Dimakis, “AmbientGAN: Generative models from lossy measurements,” in Proc. Int. Conf. Learn. Representations, 2018.

[18] J. Liu, Y. Sun, C. Eldeniz, W. Gan, H. An, and U. S. Kamilov, “RARE: Image reconstruction using deep priors learned without groundtruth,” IEEE J. Sel. Topics Signal Process., vol. 14, no. 6, pp. 1088–1099, Oct. 2020.

[19] D. Chen, J. Tachella, and M. E. Davies, “Equivariant imaging: Learning beyond the range space,” in Proc. IEEE/CVF Int. Conf. Comput. Vis., 2021, pp. 4379–4388.

[20] J. Tachella, D. Chen, and M. Davies, “Sensing theorems for unsupervised learning in linear inverse problems,” J. Mach. Learn. Res., vol. 24, no. 39, pp. 1–45, 2023.

[21] D. Ulyanov, A. Vedaldi, and V. Lempitsky, “Deep image prior,” in Proc. IEEE Conf. Comput. Vision Pattern Recognit., 2018, pp. 9446–9454.

[22] Z. Szabó, B. Póczos, and A. Lőrincz, “Online group-structured dictionary learning,” in Proc. CVPR, Piscataway, NJ, USA: IEEE Press, 2011, pp. 2865–2872.

[23] C. Studer and R. G. Baraniuk, “Dictionary learning from sparsely corrupted or compressed signals,” in Proc. IEEE Int. Conf. Acoust., Speech Signal Process. (ICASSP), Piscataway, NJ, USA: IEEE Press, 2012, pp. 3341–3344.

[24] V. Naumova and K. Schnass, “Dictionary learning from incomplete data for efficient image restoration,” in Proc. 25th Eur. Signal Process. Conf. (EUSIPCO), Piscataway, NJ, USA: IEEE Press, 2017, pp. 1425–1429.

[25] A. Mensch, J. Mairal, B. Thirion, and G. Varoquaux, “Dictionary learning for massive matrix factorization,” in Proc. Int. Conf. Mach. Learn., 2016, pp. 1737–1746.

[26] A. Mensch, J. Mairal, B. Thirion, and G. Varoquaux, “Stochastic subsampling for factorizing huge matrices,” IEEE Trans. Signal Process., vol. 66, no. 1, pp. 113–128, Jan. 2018.

[27] S. Gleichman and Y. C. Eldar, “Blind compressed sensing,” IEEE Trans. Inf. Theory, vol. 57, no. 10, pp. 6958–6975, Oct. 2011.

[28] S. Arora, R. Ge, T. Ma, and A. Moitra, “Simple, efficient, and neural algorithms for sparse coding,” in Proc. Conf. Learn. Theory, 2015, pp. 113–149.

[29] R. Gribonval, R. Jenatton, and F. Bach, “Sparse and spurious: Dictionary learning with noise and outliers,” IEEE Trans. Inf. Theory, vol. 61, no. 11, pp. 6298–6319, Nov. 2015.

[30] N. Chatterji and P. L. Bartlett, “Alternating minimization for dictionary learning with random initialization,” in Proc. Adv. Neural Inf. Process. Syst., 2017, vol. 30.

[31] S. Foucart and H. Rauhut, “An invitation to compressive sensing,” in A Mathematical Introduction to Compressive Sensing. New York, NY, USA: Springer-Verlag, 2013, pp. 1–39.

[32] D. F. Crouse, “On implementing 2D rectangular assignment algorithms,” IEEE Trans. Aerosp. Electron. Syst., vol. 52, no. 4, pp. 1679–1696, Aug. 2016.

[33] A. Agarwal, A. Anandkumar, P. Jain, and P. Netrapalli, “Learning sparsely used overcomplete dictionaries via alternating minimization,” SIAM J. Optim., vol. 26, no. 4, pp. 2775–2799, 2016.

[34] K. Engan, S. O. Aase, and J. H. Husoy, “Method of optimal directions for frame design,” in Proc. IEEE Int. Conf. Acoust., Speech, Signal Process. Proc. ICASSP99 (Cat. No. 99CH36258), Piscataway, NJ, USA: IEEE Press, 1999, vol. 5, pp. 2443–2446.

[35] F. P. Anaraki and S. M. Hughes, “Compressive k-SVD,” in Proc. IEEE Int. Conf. Acoust., Speech Signal Process., Piscataway, NJ, USA: IEEE Press, 2013, pp. 5469–5473.

[36] F. Pourkamali-Anaraki, S. Becker, and S. M. Hughes, “Efficient dictionary learning via very sparse random projections,” in Proc. Int. Conf. Sampling Theory IEEE Int. Symp. Spread Spectr. Tech. Appl. (SampTA), Piscataway, NJ, USA: IEEE Press, 2015, pp. 478–482.

[37] T. Chang, B. Tolooshams, and D. Ba, “Randnet: Deep learning with compressed measurements of images,” in Proc. IEEE 29th Int. Workshop Mach. Learn. Signal Process. (MLSP), Piscataway, NJ, USA: IEEE Press, 2019, pp. 1–6.

[38] Y. LeCun, L. Bottou, Y. Bengio, and P. Haffner, “Gradient-based learning applied to document recognition,” Proc. IEEE, vol. 86, no. 11, pp. 2278–2324, Nov. 1998.

[39] A. Paszke et al., “PyTorch: An imperative style, high-performance deep learning library,” in Proc. Adv. Neural Inf. Process. Syst., 2019, pp. 8026–8037.

[40] R. Grosse, R. Raina, H. Kwong, and A. Y. Ng, “Shift-invariant sparse coding for audio classification,” in Proc. Twenty-Third Conf. Uncertainty in Artif. Intell., vol. 8, Jul. 2007, pp. 149–158, Art. no. 9.

[41] Y. Hu, M. Delbracio, P. Milanfar, and U. Kamilov, “A restoration network as an implicit prior,” in Proc. 12th Int. Conf. Learn. Representations, 2024. [Online]. Available: https://openreview.net/forum?id=x7d1qXEn1e

[42] K. Zhang, W. Zuo, Y. Chen, D. Meng, and L. Zhang, “Beyond a Gaussian denoiser: Residual learning of deep CNN for image denoising,” IEEE Trans. Image Process., vol. 26, no. 7, pp. 3142–3155, Jul. 2017.

[43] A. Chambolle, V. Caselles, D. Cremers, M. Novaga, and T. Pock, “An introduction to total variation image analysis,” Theor. Found. Numerical Methods Sparse Recovery, vol. 9, nos. 263–340, 2010, Art. no. 227.

[44] J. Scanvic, M. Davies, P. Abry, and J. Tachella, “Self-supervised learning for image super-resolution and deblurring,” 2023, arXiv:2312.11232.

## 图注与表注

**图 1（原文 Fig. 1）：** 命题 II.1 对字典学习的推论。可见部分（\(\ker(\mathbf A)^\perp=\operatorname{range}(\mathbf A^T)\)）：数据保真项只能通过 \(\mathbf A|_{\ker(\mathbf A)^\perp}\) 约束 \(D_{\rm vis}\)。不可见部分（\(\ker(\mathbf A)\)）：\(\mathbf A\) 把 \(x_{\rm inv}=D_{\rm inv}z\) 映射为 0，因此数据保真项对 \(D_{\rm inv}\) 是盲的；但 \(D_{\rm inv}\ne0\) 会抬高 \(\lambda\|Z\|_1\)，于是最优 \(D^*\in\ker(\mathbf A)^\perp\)：\(D_{\rm inv}\) 被驱向零，\(x_{\rm inv}\) 无法被恢复。

**图 2（原文 Fig. 2）：** 高斯字典 \(100\times100\) 经单一压缩感知算子（\(m\times100\)）退化后的恢复分数。当维度 \(m\) 减小时，字典中不位于零空间的部分只有在信号足够稀疏时才能被恢复。

**图 3（原文 Fig. 3）：** 高斯字典 \(100\times100\) 经 \(N_m\) 个 \(m\times100\) 压缩感知算子、针对稀疏度 \(s=0.1\) 的 Bernoulli–Gaussian 信号退化后的恢复分数。恢复字典的必要条件为 \(N_m\ge\lfloor n/m\rfloor+1\)，但当 \(m\) 太小时该条件并不充分。

**图 4（原文 Fig. 4）：** 由尺寸 \(100\times100\) 的高斯字典与稀疏度 \(s\)（非零坐标的平均比例）的 Bernoulli–Gaussian 稀疏码生成数据，随后用可用坐标比例为 \(p\) 的二值掩膜退化数据，再用交替最小化（AM）在多个 \(\lambda\) 取值下求解式 (4)，学习 \(100\times100\) 的字典。图中给出算法恢复字典的能力随 \(p\)、训练样本数与数据稀疏度的变化；"字典恢复"定义为恢复分数至少达到 0.95。结果从三个角度展示：(左) 恢复字典所需的最少样本数随稀疏度与可用坐标比例的变化——样本数大于 \(10^4\) 表示无法恢复；(中) 可恢复字典的最大稀疏度 \(s\)（非零坐标的最大比例）随样本数与可用坐标比例的变化——取值为 0 表示无法恢复；(右) 恢复所需的最小可用坐标比例随样本数与稀疏度的变化——取值为 1 表示无法恢复。这些图表明，无论训练样本数多少，可学习的内容都受缺失值比例与稀疏度的硬性限制；访问整个信号空间并不是恢复字典的充分条件。

**图 5（原文 Fig. 5）：** 修补情形下，PSNR（左）与加权恢复分数（右）随字典学习中自然图像图块缺失值比例的变化。当测量空间维度足够大时，算法成功恢复图像与有监督字典。

**图 6（原文 Fig. 6）：** 卷积字典的恢复分数随图像尺寸与可用像素比例 \(\rho\) 的变化。在比例足够高时，增大图像尺寸可提升质量。

**图 7（原文 Fig. 7）：** 无监督与有监督方法在修补任务上的 PSNR。(a) 在 \(256\times256\) 灰度图像上，基于 CDL、DIP、TV 与小波的重建 PSNR 随缺失像素比例与噪声的变化；无监督先验学习仅在噪声不过高时有效。(b) 有监督与无监督即插即用的 PSNR 随可用像素比例与噪声的变化；噪声过高时，无监督 PnP 在 \(\mathbf A\) 的核空间与值域空间中都无法恢复图像。

**图 8（原文 Fig. 8）：** 无噪声情形下、含 50% 缺失像素的 \(256\times256\) RGB 图像的重建、PSNR 与 PSD。PSD 揭示了 CDL 重建中的振铃伪影；无监督算法恢复出原图像的完整频谱，表现与手工方法相当。

**图 9（原文 Fig. 9）：** 用 CDL（\(\lambda=0.1\)，原子尺寸 \(20\times20\)）在图 8 图像上学到的字典中的 40 个原子：修补（左）与去模糊（右）。去模糊情形下高频被置零，导致原子模糊。

**图 10（原文 Fig. 10）：** 无噪声情形下，经归一化 \(10\times10\) 高斯核（标准差 0.3）模糊的 \(256\times256\) RGB 图像的重建、PSNR 与 PSD。PSD 清楚表明：与修补所得结果相比，高频部分几乎没有任何学习。

**图 11（原文 Fig. 11）：** 无监督与有监督方法在去模糊任务上的 PSNR。(a) 在 \(256\times256\) 灰度图像上，基于 CDL、DIP、TV 与小波的各重建方法在多个 SNR 下、在模糊算子的完整空间、核空间与值域空间中的 PSNR；此时无监督先验学习方法无法在核空间中恢复信息，更出人意料的是，有监督 CDL 在核空间中同样表现困难。(b) 对 \(160\times160\) 灰度图像、多个 SNR 下基于 PnP 的重建，在完整空间、核空间与值域空间中的 PSNR 随模糊尺度的变化；此时无监督先验学习方法无法在核空间中恢复信息，更出人意料的是，有监督 PnP 在核空间中同样表现困难。

> **表注：** 原文没有表格。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–IV 节全部正文与子节（含"贡献"段、A/B/C 子节）、命题 II.1 与 II.2、例 II.3 与 II.4、式 (1)–(27)（含附录 A–B 的证明式）、致谢、图 1–11 图注（其中图 7 与图 11 含 (a)/(b) 子图注，已按 PDF 渲染页核对）、参考文献 [1]–[44]（英文原条目、按原编号），以及页首"原文信息核对"说明。**原文为 IEEE Transactions on Signal Processing 期刊正式版**（vol. 74, 2026, pp. 1805–1817），骨架登记的 arXiv 链接与正式出处不一致，已加注说明并保留骨架链接不改动；原文无表格；原第 13 页末的三份作者简介（Malézieux、Moreau、Kowalski；Florent Michel 无简介）不属于正文，未逐段翻译。原文疑点一处已加注（式 (20) 的等号）。逐句逐式终校未做；长公式与命题陈述（式 (20)–(27)、命题 II.1 中 \(D'\) 的定义等）均按 PDF 渲染页逐式核对后转写。

{% endraw %}
