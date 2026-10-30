---
layout: page
title: "逆问题中面向任务的共形预测不确定性量化｜中文全文译文"
permalink: /papers/translations/2026-10-03-2405-18527-task-driven-uncertainty-quantification-in-inverse-problems-via-conform/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/aea64912f5bf7b50/) · [原文 arXiv](https://arxiv.org/abs/2405.18527) · [全部目录](/papers/catalog/)

# 逆问题中面向任务的共形预测不确定性量化

**原题：** Task-Driven Uncertainty Quantification in Inverse Problems via Conformal Prediction  
**作者：** Jeffrey Wen、Rizwan Ahmad、Philip Schniter  
**单位：** 俄亥俄州立大学（The Ohio State University），Columbus OH 43210, USA；邮箱 wen.254@osu.edu、rizwan.ahmad@osumc.edu、schniter.1@osu.edu。  
**版本：** arXiv:2405.18527v2（cs.CV），2024 年 7 月 11 日；原文 26 页（正文 + 参考文献 + 附录 A—G）。  
**范围与状态：** 全文中文译稿：摘要、第 1—6 节、致谢、附录 A—G、图 1—10 图注、表 1—4 逐格转录、参考文献 [1]—[63]（英文原条目，按原编号）均按原文结构录入；逐句逐式终校未做。

## 摘要

在图像逆问题中，人们希望从缺失/损坏的测量中恢复图像。由于此类问题是不适定的，量化测量—恢复过程所引入的不确定性具有很大动机。受恢复图像被用于下游任务（例如软输出分类）的应用启发，我们提出一种以任务为中心的不确定性量化方法。具体而言，我们利用共形预测构造一个区间，保证以用户指定的概率包含真实图像产生的任务输出，并用该区间的宽度量化测量—恢复过程所贡献的不确定性。对于基于后验采样的图像恢复，我们构造局部自适应的预测区间。此外，我们提出在多轮中累积采集测量，一旦任务不确定性降到可接受水平以下就停止。我们在加速磁共振成像（magnetic resonance imaging, MRI）上演示了该方法：<https://github.com/jwen307/TaskUQ>。

**关键词：** 逆问题 · 不确定性量化 · 共形预测 · 后验采样 · MRI

## 1 引言

在图像逆问题中，人们希望从测量 $y=h(x)$ 中恢复图像 $x$，而该测量会对 $x$ 进行掩蔽、扭曲和/或加噪 [7]。线性逆问题——即 $y=Ax+\epsilon$，其中 $\epsilon$ 为噪声、$A$ 为已知前向算子——包括去模糊、超分辨、修补（inpainting）、着色、计算机断层成像（computed tomography, CT）与磁共振成像（MRI）[26]；非线性逆问题包括相位恢复、去量化与图像到图像翻译。这些问题通常是不适定的，即无法从 $y$ 完美推断 $x$。

多数图像恢复方法从测量 $y$ 给出单个"点估计" $\hat x$ [7]。仅凭 $\hat x$ 很难判断其相对于真实 $x$ 的准确程度，也就是说，$\hat x$ 并未量化逆问题的不适定性在测量—重建过程中引入的不确定性 [1]。这在医学影像等安全攸关的应用中是有问题的：$\hat x$ 中的幻觉或退化可能导致代价高昂的误诊 [8]。

已有若干方法在图像恢复过程中提供不确定性量化（uncertainty quantification, UQ）。一种做法是使用贝叶斯神经网络（Bayesian neural networks, BNN），把重建网络参数视为随机变量 [9,21,32,40,60]，从而通过度量参数分布不同抽样所生成重建之间的变化来量化认知（即模型）不确定性。后验采样方法 [2,6,14,19,20,30] 则从给定 $y$ 时合理 $x$ 的分布 $p(x|y)$（即后验）中抽取大量样本，旨在量化测量过程施加于 $x$ 的不确定性（即偶然不确定性）。也可以把 BNN 与后验采样结合，如 [22] 那样。

尽管 BNN 与后验采样方法生成的样本可以有多种用途，它们最常见的用途是计算逐像素的不确定性图像或"不确定度图"。若要为逐像素不确定性区间提供统计保证，可以使用共形预测 [4,29,36,53]。然而，这些逐像素不确定度图的价值并不明确。例如，在恢复图像时，我们通常关心的是多像素的视觉结构（如 MRI 中的病灶、幻觉），而单像素统计对此提供的信息很少。其次，不确定度图不易解释，它们往往只传达"平滑区域的逐像素不确定性小于边缘附近"这一信息（例如见图 7）。最后，逐像素不确定性与整体成像目标（往往是任务导向的，如判断肿瘤是否存在）之间的关系并不清楚。

评估多像素不确定性的一种方法是基于优化的贝叶斯不确定性量化（Bayesian Uncertainty Quantification by Optimization, BUQO）[52]，其目标是检验最大后验（MAP）重建中某个特定"感兴趣结构"是否真实存在。然而，它通过修补来假设"不含该结构时图像会是什么样"，而这一假设的正确性难以保证。

本文提出一种新的图像逆问题 UQ 框架，旨在提供更有影响力的不确定性度量：我们试图量化下游任务在输入重建图像与输入真实图像时表现差异的程度。我们的框架支持任意测量—重建流程，以及任何输出实值标量的下游任务。贡献如下。

1. 我们利用共形预测，在任务输出空间中构造一个区间，保证以用户指定的概率包含真实任务输出。该预测区间宽度为量化测量—重建对下游任务输出所贡献的不确定性提供了自然方式（见图 1）。
2. 对于基于后验采样的图像重建，我们提出构造自适应不确定性区间，当测量对下游任务真实输出提供更多确定性时，该区间会收缩（见图 2）。
3. 我们提出一种多轮采集协议：累积测量，直到任务不确定性降到可接受水平。
4. 我们在加速 MRI 上以"半月板撕裂的软输出分类"为任务演示该方法，并评估和比较了若干种共形预测器。

## 2 背景

共形预测 [3,54] 是一个用于生成具有预设统计保证的不确定性集合的框架。值得注意的是，它可以应用于任意黑箱预测器，而无需对数据做任何分布假设。下面介绍共形预测的基础，更准确地说，是其中常见的变体——分裂共形预测（split conformal prediction）[37,41]。假设有一个黑箱模型 $f:\mathcal X\to\mathcal Z$，从特征 $x\in\mathcal X$ 预测目标 $z\in\mathcal Z$；又有一个在训练 $f$ 时未见过的校准数据集 $d_{\mathrm{cal}}\triangleq\{(x_i,z_i)\}_{i=1}^{n}$，以及测试特征 $x_{\mathrm{test}}$ 与未知测试目标 $z_{\mathrm{test}}$。在分裂共形预测中，我们用校准数据构造预测集 $C(x_{\mathrm{test}};d_{\mathrm{cal}})\subset2^{\mathcal Z}$，它提供"边际覆盖"（marginal coverage）[38] 保证

$$
\Pr\left(Z_{\mathrm{test}}\in C(X_{\mathrm{test}};D_{\mathrm{cal}})\right)\geq1-\alpha,\tag{1}
$$

其中 $\alpha\in[0,1]$ 为用户指定的错误率。在式（1）及后文中，我们用大写字母表示随机变量、小写字母表示其实现。因此式（1）可理解为：在对随机校准数据 $D_{\mathrm{cal}}$ 与测试数据 $(X_{\mathrm{test}},Z_{\mathrm{test}})$ 取平均的意义下，集合 $C(X_{\mathrm{test}};D_{\mathrm{cal}})$ 以不低于 $1-\alpha$ 的概率包含正确目标 $Z_{\mathrm{test}}$。我们更希望得到形如 $\Pr\left(Z_{\mathrm{test}}\in C(X_{\mathrm{test}};D_{\mathrm{cal}})\mid X_{\mathrm{test}}=x_{\mathrm{test}}\right)\geq1-\alpha$ 的"条件覆盖"保证，但这通常是无法实现的 [38,55]。

下面给出构造预测集 $C(x_{\mathrm{test}};d_{\mathrm{cal}})$ 的标准做法。首先选择一个非一致性得分（nonconformity score）$s(x,z;f)\in\mathbb R$，对更差的预测赋予更高的值。然后从校准得分 $s_i=s(x_i,z_i;f)$ 计算经验分位数

$$
\hat q\triangleq\operatorname{Quantile}\left(\frac{\lceil(1-\alpha)(n+1)\rceil}{n};s_1,\ldots,s_n\right),\tag{2}
$$

最后构造

$$
C(x_{\mathrm{test}};d_{\mathrm{cal}})=\left\{z:s(x_{\mathrm{test}},z;f)\leq\hat q\right\}.\tag{3}
$$

在这些选择下，可以证明 [37,56]：当 $(X_1,Z_1),\ldots,(X_n,Z_n),(X_{\mathrm{test}},Z_{\mathrm{test}})$ 独立同分布，甚至在更弱的可交换（exchangeable）条件下 [54]，边际覆盖保证（1）成立。

构造非一致性得分 $s(x,z;f)$ 的方式很多。对实值目标 $z$，最简单的选择是绝对残差

$$
s(x,z;f)=|z-f(x)|\ \Rightarrow\ C(x;d_{\mathrm{cal}})=\left[f(x)-\hat q,\ f(x)+\hat q\right],\tag{4}
$$

它给出与 $x$ 无关的区间长度 $|C(x;d_{\mathrm{cal}})|=2\hat q$。后文将讨论若干其他选择。关于共形预测的更多内容，建议参阅优秀的综述 [3,54]。

## 3 提出的方法

假设采集到真实图像 $x$ 的测量 $y=h(x)$，由此计算图像恢复 $\hat x=g(y)$。理想上希望 $\hat x=x$，但对不适定逆问题而言这无法保证。虽然量化 $\hat x$ 与 $x$ 差异的方式很多（如 PSNR、SSIM [57]、LPIPS [62]、DISTS [18]），我们转而假设主要关心的是用 $\hat x$ 完成某个下游任务 $f(\hat x)\in\mathbb R$。作为贯穿全文的例子，考虑 $x$ 为医学图像、$y$ 为加速 MRI 测量、$f(\cdot)\in[0,1]$ 为旨在检测病理存在与否的分类器软输出。例如当 $f(\hat x)=0.7$ 时，分类器认为病理存在的概率为 70%。

当图像恢复不完美（即 $\hat x\neq x$）时，我们预期任务输出也不完美，即 $\hat z=f(\hat x)\neq f(x)=z$。因此我们强烈希望理解 $\hat z$ 与真实 $z$ 的接近程度，或者更进一步，构造一个带某种保证的预测区间 $C(\hat x)\subset\mathbb R$ 包含真实 $z$。区间宽度 $|C(\hat x)|$ 将量化测量—重建过程在预测真实任务输出 $z$ 时所贡献的不确定性。

我们强调，除要求 $f(\cdot)$ 输出一个实数外，本方法对 $f(\cdot)$ **不做任何假设**。例如若 $f(\cdot)$ 是软输出分类器，我们不假设它准确，甚至不假设它已校准 [25]。同样，本方法的目标不是评估任务本身固有的不确定性，而是评估测量—重建给任务额外带来的不确定性。对软输出分类器而言，（真实）输出 $z=f(x)=0.7$ 表达了 $x$ 中病理存在性的相当大不确定性；但如果真实 $z$ 能从 $\hat x$ 完美预测，那么测量—重建过程就没有引入额外不确定性。

为构造区间 $C(\hat x)$，我们使用共形预测。把第 2 节的方法适配到当前设定，使用校准集 $d_{\mathrm{cal}}=\{(\hat x_i,z_i)\}_{i=1}^{n}$（由"恢复图像—真实任务输出"对组成），并期望满足边际覆盖保证

$$
\Pr\left(Z\in C(\hat X;D_{\mathrm{cal}})\right)\geq1-\alpha,\tag{5}
$$

其中 $(\hat X_1,Z_1),\ldots,(\hat X_n,Z_n),(\hat X,Z)$ 可交换。式（5）及后文显式写出 $C(\hat x)$ 对校准数据的依赖。为构造校准集，假设可以访问真值样本 $\{x_i\}_{i=1}^{n}$、测量模型 $h(\cdot)$、重建模型 $g(\cdot)$ 与任务函数 $f(\cdot)$，由此可对 $i=1,\ldots,n$ 构造 $y_i=h(x_i)$、$\hat x_i=g(y_i)$、$z_i=f(x_i)$。

在某些情形中，我们可能拥有基于后验采样的图像重建模型，它由每个测量 $y_i$ 生成 $p$ 个恢复 $\{\hat x_i^{(j)}\}_{j=1}^{p}$，即 $\hat x_i^{(j)}=g(y_i,v_i^{(j)})$，其中 $\{v_i^{(j)}\}_{j=1}^{p}$ 为独立同分布码向量，通常 $v_i^{(j)}\sim\mathcal N(0,I)$。此时预测区间变为 $C(\{\hat x_i^{(j)}\}_{j=1}^{p};d_{\mathrm{cal}})$。后文将看到，后验采样有助于构造局部自适应的预测集。

下面描述构造预测区间 $C(\hat x;d_{\mathrm{cal}})$ 与 $C(\{\hat x_i^{(j)}\}_{j=1}^{p};d_{\mathrm{cal}})$ 的不同方式，随后描述利用局部自适应预测区间的多轮测量协议。方法的详细概览见图 2。

### 3.1 方法 1：绝对残差（AR）

首先考虑图像恢复给出真实 $x$ 的点估计 $\hat x=g(y)$ 的情形。如第 2 节所述，构造非一致性得分的简单方式是绝对残差（回顾式（4））：

$$
s(\hat x,z;f)=|z-f(\hat x)|.\tag{6}
$$

在校准集 $d_{\mathrm{cal}}$ 上评估该得分得到 $\{s_i\}_{i=1}^{n}$，其经验分位数 $\hat q$ 可按式（2）计算，并用于构造预测区间

$$
C(\hat x;d_{\mathrm{cal}})=\left[f(\hat x)-\hat q,\ f(\hat x)+\hat q\right],\tag{7}
$$

它进而提供边际覆盖性质（5）[37]。

注意，在这种得分选择下，区间宽度 $|C(\hat x;d_{\mathrm{cal}})|=2\hat q$ 随校准集 $d_{\mathrm{cal}}$ 变化，但不随 $\hat x$ 变化。因此对固定的 $d_{\mathrm{cal}}$，得分（6）无法区分一个 $\hat x$ 是否会比另一个 $\hat x$ 带来更大的任务输出不确定性。

### 3.2 方法 2：局部加权残差（LWR）

现在考虑拥有基于后验采样的恢复方法、对每个测量 $y$ 产生 $p$ 个恢复 $\{\hat x^{(j)}\}_{j=1}^{p}$ 的情形。我们对这 $p$ 个样本的准确程度或多样性不做任何假设，只假设对应的任务输出 $\hat z^{(j)}=f(\hat x^{(j)})$ 不全相同。

假设选择非一致性得分

$$
s(\{\hat x^{(j)}\},z;f)=\frac{|z-\bar z|}{\sigma_z}\quad\text{其中}\quad
\begin{cases}\bar z\triangleq\frac1p\sum_{j=1}^{p}f(\hat x^{(j)}),\\[4pt]\sigma_z\triangleq\sqrt{\frac1p\sum_{j=1}^{p}\left(f(\hat x^{(j)})-\bar z\right)^2},\end{cases}\tag{8}
$$

在校准集 $d_{\mathrm{cal}}$ 上评估得到得分 $\{s_i\}_{i=1}^{n}$，并按式（2）计算其经验分位数 $\hat q$。于是这种"局部加权残差"（LWR）方法的预测区间

$$
C(\{\hat x^{(j)}\};d_{\mathrm{cal}})=\left[\bar z-\sigma_z\hat q,\ \bar z+\sigma_z\hat q\right]\tag{9}
$$

提供式（5）的边际覆盖性质 [37]。

换言之，该方法先计算（近似的）后验样本 $\hat z^{(j)}\sim Z|Y=y$，再对其平均以近似条件均值 $\hat z_{\mathrm{mmse}}\triangleq\mathbb E(Z|Y=y)\approx\bar z$，并近似条件协方差的平方根 $\sqrt{\operatorname{cov}(Z|Y=y)}\approx\sigma_z$。精确计算时，条件协方差给出关于真实 $Z$ 能从测量 $y$ 估计到何种程度的有意义的不确定性度量，因为 $\operatorname{cov}(Z|Y=y)=\mathbb E((Z-\hat z_{\mathrm{mmse}})^2|Y=y)$。然而我们计算的 $\sigma_z$ 只是近似值。因此在校准集的帮助下，用缩放因子 $\hat q$ 调整 $\sigma_z$，得到满足边际覆盖准则（5）的预测区间 $[\bar z-\sigma_z\hat q,\ \bar z+\sigma_z\hat q]$。

重要的是，区间宽度 $|C(\{\hat x^{(j)}\};d_{\mathrm{cal}})|$ 现在通过 $\sigma_z$ 随 $\{\hat x^{(j)}\}_{j=1}^{p}$ 变化。后一性质称为"局部自适应性"（local adaptivity）[37]。

### 3.3 方法 3：共形化分位数回归（CQR）

另一种流行的局部自适应方法称为共形化分位数回归（CQR）[45]。其思想是用两个分位数回归器 [35] 构造非一致性得分：一个估计 $Z|Y=y$ 的 $\alpha/2$ 分位数，另一个估计 $(1-\alpha/2)$ 分位数。

为计算这些分位数估计，我们再次假设拥有基于后验采样的恢复方法，对每个测量 $y$ 产生 $p$ 个恢复 $\{\hat x^{(j)}\}_{j=1}^{p}$。由相应的任务输出 $\hat z^{(j)}=f(\hat x^{(j)})$，用

$$
\hat z(\omega)\triangleq\operatorname{Quantile}\left(\omega;\hat z^{(1)},\ldots,\hat z^{(p)}\right)\tag{10}
$$

计算经验分位数 $\hat z(\alpha/2)$ 与 $\hat z(1-\alpha/2)$。由这些分位数估计构造非一致性得分

$$
s(\{\hat x^{(j)}\},z;f)=\max\left\{\hat z\left(\frac{\alpha}{2}\right)-z,\ z-\hat z\left(1-\frac{\alpha}{2}\right)\right\},\tag{11}
$$

在校准集 $d_{\mathrm{cal}}$ 上评估得到 $\{s_i\}_{i=1}^{n}$，并按式（2）计算其 $\lceil(1-\alpha)(n+1)\rceil/n$ 经验分位数 $\hat q$。于是预测区间

$$
C(\{\hat x^{(j)}\};d_{\mathrm{cal}})=\left[\hat z\left(\frac{\alpha}{2}\right)-\hat q,\ \hat z\left(1-\frac{\alpha}{2}\right)+\hat q\right]\tag{12}
$$

提供式（5）中的边际覆盖 [45]。与式（9）一样，该区间也是局部自适应的。我们将在第 4 节比较这三种共形预测方法。

### 3.4 多轮测量协议

许多应用中，采集大量测量（即获取高维 $y$）代价显著，MRI 即为一例（细节见第 4 节）。对此类应用，我们提出在多轮中采集测量，一旦任务不确定性降到预设水平 $\tau$ 以下就停止。目标是以至少 $1-\alpha$ 的概率完成任务所需的最少测量数。

我们的做法是用预测区间宽度 $|C(\{\hat x^{(j)}\};d_{\mathrm{cal}})|$ 作为任务不确定性的度量。这要求区间是局部自适应的，如上述 LWR 与 CQR。具体如下：首先选择 $C>1$ 个嵌套的测量配置序列，使所得测量集满足 $\mathcal Y^{[1]}\subset\mathcal Y^{[2]}\subset\cdots\subset\mathcal Y^{[C]}$。然后对每个配置 $k=1,\ldots,C$ 采集校准集 $d_{\mathrm{cal}}^{[k]}$，并构造集合值函数 $C(\cdot;d_{\mathrm{cal}}^{[k]})$。测试时，先按第一个（即最小）配置采集测量 $y\in\mathcal Y^{[1]}$，由 $y$ 计算重建 $\{\hat x^{(j)}\}_{j=1}^{p}$，再由它们计算任务不确定性 $|C(\{\hat x^{(j)}\};d_{\mathrm{cal}}^{[1]})|$。若该不确定性降到期望的 $\tau$ 以下，就停止采集；否则采集 $\mathcal Y^{[2]}\setminus\mathcal Y^{[1]}$ 中的附加测量并重复该过程。图 3 总结了所提多轮协议。

## 4 数值实验

下面在 MRI [34] 上演示任务驱动的不确定性量化框架。MRI 在不使用电离辐射的情况下提供出色的软组织对比，但扫描时间很慢。加速 MRI 通过采集 Nyquist 采样定理所规定测量的 $1/R$ 来加速采集，整数 $R$ 称为"加速率"；当 $R>1$ 时逆问题不适定。

在 MRI 中，典型任务是诊断病理的存在与否。虽然该任务通常由放射科医师完成，但基于神经网络的分类有望在辅助放射科医师方面发挥重要作用 [12]。因此在实验中我们用神经网络实现任务 $f(\cdot)$，细节如下。

**数据。** 使用多线圈 fastMRI 膝关节数据集 [61]，特别是非抑脂子集，包括 484 个训练体数据（17,286 张训练切片/图像）与 100 个验证体数据（2,188 张验证图像）。病理标签来自 fastMRI+ [63]。对膝关节 MRI，半月板撕裂拥有最大的 fastMRI+ 标签集，因此选择半月板撕裂检测作为任务。为采集测量，我们在 k 空间用一组随机嵌套掩码对 fastMRI 数据做回顾性欠采样，加速率 $R\in\{16,8,4,2\}$，细节见补充材料。

**图像恢复。** 考虑两种恢复网络 $g(\cdot)$：点估计器使用最先进的 E2E-VarNet [49]，后验采样器使用条件归一化流（CNF）[58]。二者都是围绕 fastMRI 数据集专门设计的。另一种选择是 MRI 扩散采样器 [15]，但其性能略逊于 CNF，且采样速度慢 8000 倍 [58]。E2E-VarNet 与 CNF 均用单一模型训练以处理全部四种加速率。

**任务网络。** 任务网络 $f(\cdot)$ 采用 ResNet50 [27]。从 ImageNet 初始化出发，先用无监督 SimCLR 损失 [13] 预训练权重，再用 fastMRI+ 标签最小化二元交叉熵损失，细节见补充材料。

**经验验证。** 回顾边际覆盖保证（5）是在随机测试样本 $(\hat X,Z)$ 与随机校准数据 $D_{\mathrm{cal}}=\{(\hat X_1,Z_1),\ldots,(\hat X_n,Z_n)\}$ 上平均成立的。为经验验证边际覆盖并评估其他平均性能指标，我们按如下方式进行 $T=10000$ 次蒙特卡洛平均。在试验 $t$ 中，把 2,188 个样本的验证数据随机划分为索引 $i\in\mathcal I_{\mathrm{cal}}[t]$ 的 70% 校准折与索引 $i\in\mathcal I_{\mathrm{test}}[t]$ 的 30% 测试折，用校准数据 $d_{\mathrm{cal}}[t]=\{(\{\hat x_i^{(j)}\}_{j=1}^{p},z_i)\}_{i\in\mathcal I_{\mathrm{cal}}[t]}$ 构造共形预测器，并在测试折上评估性能。最后对 $T$ 次试验平均性能，细节见下。

### 4.1 加速率与共形预测方案的影响

已看到区间长度 $|C(\{\hat x^{(j)}\};d_{\mathrm{cal}})|$ 提供了量化测量—重建方案对半月板分类任务所贡献不确定性的方式。一个自然的问题是：区间长度如何受 MRI 加速率 $R$ 影响？我们研究如下。

对固定加速率 $R$，区间长度也受共形预测器选择的影响：其他条件相同时，更好的共形预测器产生更小的不确定性集合 [3]。因此另一个问题是：在 AR、LWR、CQR 之间做选择会如何影响区间长度？

为回答这些问题，我们计算"平均平均区间长度"
$$
\overline{\mathrm{MIL}}\triangleq\frac1T\sum_{t=1}^{T}\mathrm{MIL}[t],\qquad
\mathrm{MIL}[t]\triangleq\frac{1}{|\mathcal I_{\mathrm{test}}[t]|}\sum_{i\in\mathcal I_{\mathrm{test}}[t]}\left|C\left(\{\hat x_i^{(j)}\}_{j=1}^{p};d_{\mathrm{cal}}[t]\right)\right|.\tag{13}
$$

图 4 用 $T=10000$ 次试验、$p=32$ 个后验样本、错误率 $\alpha=0.05$，绘制三种共形预测器的平均平均区间长度随 $R$ 的变化。如图所示，如预期，随着采集更多测量（即 $R$ 降低），平均平均区间长度减小；图也显示，如预期，局部自适应的 LWR 与 CQR 方法给出的平均平均区间长度始终小于非自适应的 AR 方法。在这个意义上，后验采样优于点采样。

### 4.2 后验样本数的影响

上文看到测量过程与共形方法都影响预测区间长度。我们推测图像重建过程也会影响预测区间长度。为研究这一点，我们改变后验采样方案产生的样本数 $p$，理由是较小的 $p$ 对应不那么准确的恢复（例如较不准确的后续均值近似）。

图 4b 用 $T=10000$ 次试验、加速率 $R=16$、错误率 $\alpha=0.05$，绘制 LWR 与 CQR 的平均平均区间长度随 $p$ 的变化。如预期，区间长度随后验样本数 $p$ 增大而减小；但有趣的是，LWR 对小 $p$ 比 CQR 敏感得多。一个启示是：当与合适的共形预测方法配合时，较小的 $p$ 或许已足够。

### 4.3 覆盖率的经验验证

为验证边际覆盖保证（5）成立，我们把蒙特卡洛试验 $t$ 的经验覆盖率计算为
$$
\mathrm{EC}[t]\triangleq\frac{1}{|\mathcal I_{\mathrm{test}}[t]|}\sum_{i\in\mathcal I_{\mathrm{test}}[t]}\mathbf 1\left\{z_i\in C\left(\{\hat x_i^{(j)}\};d_{\mathrm{cal}}[t]\right)\right\},\tag{14}
$$
其中 $\mathbf 1\{\cdot\}$ 表示指示函数。已有理论（如 [3]）表明，当 $(\{\hat X_i^{(j)}\},Z_i)$ 与式（14）中的 $D_{\mathrm{cal}}[t]$ 是可交换随机变量对时，$\mathrm{EC}[t]$ 是随机的，且服从
$$
\mathrm{EC}[t]\sim\operatorname{BetaBin}\left(n_{\mathrm{test}},n_{\mathrm{cal}}+1-l_{\mathrm{cal}},l_{\mathrm{cal}}\right),\quad l_{\mathrm{cal}}\triangleq\lceil(n_{\mathrm{cal}}+1)\alpha\rceil,\tag{15}
$$
其中 $n_{\mathrm{test}}\triangleq|\mathcal I_{\mathrm{test}}[t]|$、$n_{\mathrm{cal}}\triangleq|\mathcal I_{\mathrm{cal}}[t]|$。

对三种共形方法，图 5 给出 $T=10000$、$\alpha=0.05$、$R=8$、$p=32$ 时由式（14）得到的 $\{\mathrm{EC}[t]\}_{t=1}^{T}$ 直方图。图示该直方图接近由式（15）理论分布的 $T$ 个样本所构造的直方图；图 5 还给出每种方法的平均经验覆盖率 $\frac1T\sum_{t=1}^{T}\mathrm{EC}[t]$，都非常接近目标值 $1-\alpha=0.95$。因此在实际中，共形预测的表现接近理论。

### 4.4 多轮测量

现在研究第 3.4 节多轮测量协议在加速 MRI 中的应用。为此，我们模拟在第 $k=1,\ldots,5$ 轮采集 MRI 切片，一旦 $\alpha=0.01$ 区间宽度 $|C(\{\hat x^{(j)}\};d_{\mathrm{cal}}^{[k]})|$ 降到阈值 $\tau=0.1$ 以下就停止。第一轮以加速率 $R^{[1]}=16$ 采集 k 空间测量，其余各轮分别额外采集 k 空间测量使 $R^{[2]}=8$、$R^{[3]}=4$、$R^{[4]}=2$、$R^{[5]}=1$。为定量评估，我们从 100 个体数据的 fastMRI 验证集中随机选择 8 个多层体数据作为测试体（其中一半标记为半月板撕裂、一半未标记），其余 92 个体用于校准，相应索引集记为 $\mathcal I_{\mathrm{test}}$ 与 $\mathcal I_{\mathrm{cal}}$。MRI 测量过程的更多细节见补充材料。

先讨论使用点采样 E2E-VarNet [49] 作图像恢复的 AR 共形预测方法。AR 产生与 $\hat x$ 无关（即非局部自适应）的预测区间 $C(\hat x;d_{\mathrm{cal}}^{[k]})$。因此校准之后立即可以知道：在错误率 $\alpha=0.01$ 下，$k=4$ 轮测量（即 $R=2$）是达到 $\tau=0.1$ 阈值的必要且充分条件。

LWR 与 CQR 共形预测方法都使用 CNF [58] 与 $p=32$ 个后验样本，产生局部自适应的预测区间 $C(\{\hat x^{(j)}\};d_{\mathrm{cal}}^{[k]})$。这使它们能对每个 $\{\hat x^{(j)}\}$ 评估区间长度，并在该长度降到阈值 $\tau$ 以下时立即停止测量。对测试图像 $i\in\mathcal I_{\mathrm{test}}$，把最终测量轮次记为
$$
k_i\triangleq\min\left\{k:\left|C\left(\{\hat x_i^{(j)}\};d_{\mathrm{cal}}^{[k]}\right)\right|<\tau\right\}.\tag{16}
$$
（注意 $\{\hat x_i^{(j)}\}$ 也随测量轮次 $k$ 变化，尽管记号未显式体现。）于是平均加速率为
$$
\bar R=\left(\frac{1}{|\mathcal I_{\mathrm{test}}|}\sum_{i\in\mathcal I_{\mathrm{test}}}\frac{1}{R^{[k_i]}}\right)^{-1}.\tag{17}
$$
表 1 给出 AR、LWR、CQR 三种共形方法的平均加速率，可见 AR 的 $\bar R=2$，因为它总是使用四轮测量；LWR 与 CQR 取得更高的平均加速率，因为在很大一部分情形中更少的测量轮次就已足够。表 1 还显示经验覆盖接近在相对较小测试集下应有的预期。

图 6 绘制 AR、LWR、CQR 的最终轮次 $\{k_i\}_{i\in\mathcal I_{\mathrm{test}}}$ 分布，同样表明 AR 总是使用四轮（即 $R=2$），而 LWR 与 CQR 通常使用更少轮次。但该图也显示 LWR 有时使用五轮测量。这似乎反直觉，但可解释如下：在 $k=4$ 时，AR 已校准到在除 $\alpha=1\%$ 之外的所有情形中真实得分 $z$ 都落在预测区间内，且该区间长度足够小以满足 $\tau=0.1$ 阈值；而 LWR（与 CQR）方法会根据 $\{\hat x^{(j)}\}$ 的难度自适应调整预测区间——多数情况下 LWR 区间小于 AR 区间，但在少数"困难"情形中 LWR 区间更宽，甚至宽到无法满足 $\tau=0.1$ 阈值，因此这些困难情形会进入第五轮测量。

基于上述讨论，可以猜想 AR 方法在 $k=4$ 轮接受的预测区间在某种意义上不如 LWR 在 $k=4$ 接受的区间，尽管它们长度都满足阈值。我们可以把预测区间中点解释为 $z$ 的估计，并评估该估计的绝对误差加以验证，称为"中心误差"：
$$
\mathrm{CE}\left(\{\hat x^{(j)}\},z\right)\triangleq\left|z-\frac{b_l+b_u}{2}\right|\quad\text{其中 }[b_l,b_u]=C\left(\{\hat x^{(j)}\};d_{\mathrm{cal}}\right).\tag{18}
$$
评估中心误差时，对每个体数据内的切片取最大值。表 1 列出平均最大中心误差，证实 LWR 小于 AR。

图 7 给出带半月板撕裂标签的测试图像的图像重建、逐像素标准差图与 CQR 预测区间示例。在 $R=16$ 这样的较高加速率下，后验样本 $\{\hat x^{(j)}\}$ 之间相对较大的变化导致分类器输出 $\{\hat z^{(j)}\}$ 之间相对较大的变化，从而产生较大的预测区间，即对真值分类器输出 $z$ 的较高不确定性。在 $R=4$ 这样的较低加速率下，后验样本之间相对较小的变化产生较小的预测区间，即对 $z$ 的较低不确定性。虽然逐像素标准差图也显示后验样本之间变化的减小，但从中难以对下游任务的不确定性下结论。例如，同样的逐像素变化可能来自一组在某些情形中明确显示撕裂证据、在另一些情形中明确显示相反证据的重建，也可能来自一组在所有情形中都明确显示撕裂证据、但受不同噪声实现污染的图像。我们的不确定性量化方法通过聚焦任务本身绕开了这些问题；此外，借助共形预测框架，它确保不确定性估计具有统计意义。

就实际实现而言，对体数据中的每张切片，在单块 NVIDIA A100 GPU 上，CNF 重建、ResNet-50 分类器输出与共形预测区间的计算在 $p=32$ 个样本时耗时 414 毫秒，$p=2$ 个样本时耗时 7.4 毫秒。

## 5 讨论

已有若干基于贝叶斯神经网络与后验采样的 MRI 不确定性量化工作（如 [11,15,17,20,21,30,40,47,58]）。它们产生一组可能的重建 $\{\hat x^{(j)}\}$，并通常由此计算逐像素不确定度图。共形预测方法也被提出用于为 MRI 与其他成像逆问题生成逐像素不确定度图 [4,29,36,53]，且带有统计保证。然而，当成像的最终目标是执行下游任务时，逐像素不确定度图的价值值得商榷。本文构造了一个带统计保证、包含真实图像任务输出的共形预测区间，聚焦于输出实值标量的任务（如软输出二分类）。

其他工作已将共形预测应用于 MRI 任务。Lu 等 [39] 考虑数据集 $\{(x_i,z_i)\}$，其中 MRI 图像 $x_i$ 与离散有序标签 $z_i\in\{1,\ldots,K\}$ 对病理严重程度分级。他们设计的预测器对测试 $x$ 输出集合 $Z(x)\in2^{K}$，保证以概率 $1-\alpha$ 包含真实标签 $z$。与本文不同，[39] 不涉及逆问题，且旨在量化离散 $z$ 中的不确定性。Sankaranarayanan 等 [46] 计算图像中语义属性存在与否的不确定性区间，并提到一个应用可能是 MRI 中的病理检测（尽管他们未实际开展）。虽然他们的高层目标与本文类似，但其方案需要训练好的"解耦"生成网络，在 MRI 情形中该网络需由病理概率生成 MRI 图像；据我们所知，MRI 领域尚不存在此类网络。相反，我们的方法只需要训练好的病理分类器 $f(\cdot)$，这应当容易获得。

**局限性。** 第一，本方法需要下游任务，而它并非总是可用。第二，我们仅在单一逆问题与任务上演示了方法，还需要在其他应用中验证。第三，我们的 MRI 应用设想是初步的，尚未准备好用于临床；由于我们用共形预测区间宽度作为重建图像诊断价值的代理，设计的若干方面（如分类器 $f(\cdot)$ 的选择、恢复算法 $g(\cdot)$、共形预测方法、阈值 $\tau$ 与错误率 $\alpha$）需要通过严谨的临床研究进行调参与验证。第四，为便于阐述，我们使用的共形方法（AR、LWR、CQR）较为简单，更先进的方法（如风险控制预测集（RCPS）[10]）可能表现更好。第五，我们只考虑输出单个实值标量的任务（如软输出二分类），扩展到更一般的任务将是有益的。最后，我们的后验采样器只考虑偶然不确定性；原则上可像 [22] 那样通过对生成器权重采样来纳入认知不确定性，但这需要更多工作。

## 6 结论

对图像逆问题，我们提出一种量化测量—重建过程对下游任务（如软输出分类）贡献多少不确定性的方法。具体而言，我们用共形预测构造一个区间，保证以高概率包含真实图像的任务输出。我们证明，对基于后验采样的图像恢复方法，预测区间可以做成自适应的；并提出一种多轮测量协议，在任务不确定性足够小时停止采集新数据。我们把方法应用于加速膝关节 MRI 的半月板撕裂检测，展示了加速率的显著提升。

## 致谢

本工作部分受美国国立卫生研究院（National Institutes of Health）资助（Grant R01-EB029957）。

## 图注与表注

### 表 1：多轮 MRI 仿真的平均指标（± 标准误，原 PDF 第 12 页）

| 方法 | 平均加速率 | 经验覆盖率 | 平均最大中心误差 |
|---|---|---|---|
| AR | 2.000 | 0.991 ± 0.008 | 0.032 ± 0.017 |
| LWR | 5.157 | 0.992 ± 0.005 | 0.020 ± 0.002 |
| CQR | 6.762 | 0.987 ± 0.008 | 0.044 ± 0.009 |

### 表 2：各数据折中的图像数量（原 PDF 第 22 页）

| | 训练 | 验证—校准 | 验证—测试 | 验证合计 |
|---|---|---|---|---|
| 图像数 | 17,286 | 1,531 | 656 | 2,188 |

### 表 3：不同加速率 $R$ 下的图像恢复指标（± 标准误，原 PDF 第 24 页）

| $R$ | 网络 | PSNR ↑ | SSIM ↑ | FID ↓ |
|---|---|---|---|---|
| 2 | E2E-VarNet | 42.341 ± 0.273 | 0.966 ± 0.002 | 2.847 |
| 2 | CNF | 41.366 ± 0.248 | 0.960 ± 0.002 | 2.575 |
| 4 | E2E-VarNet | 38.700 ± 0.238 | 0.937 ± 0.003 | 4.048 |
| 4 | CNF | 37.974 ± 0.216 | 0.926 ± 0.003 | 3.349 |
| 8 | E2E-VarNet | 36.120 ± 0.212 | 0.906 ± 0.003 | 5.680 |
| 8 | CNF | 35.593 ± 0.196 | 0.892 ± 0.004 | 4.346 |
| 16 | E2E-VarNet | 32.911 ± 0.194 | 0.859 ± 0.004 | 9.668 |
| 16 | CNF | 32.684 ± 0.177 | 0.842 ± 0.004 | 6.233 |

### 表 4：半月板撕裂分类器在验证集上的性能（原 PDF 第 26 页）

| Accuracy | Precision | Recall | AUROC |
|---|---|---|---|
| 0.775 | 0.391 | 0.929 | 0.922 |

### 图注

**图 1（原 PDF 第 3 页）：** 方法的高层概览：对真实图像 $x$、测量 $y=h(x)$、恢复 $\hat x=g(y)$ 与任务输出 $\hat z=f(\hat x)$，用共形预测构造区间 $C(\hat x;d_{\mathrm{cal}})\subset\mathbb R$，保证以 $P(Z\in C(\hat X;D_{\mathrm{cal}}))\geq1-\alpha$ 的意义包含真实任务输出 $z=f(x)$（$\alpha$ 为选定错误率）。图中标出重建、下游任务、共形预测与不确定性量化各环节。

**图 2（原 PDF 第 5 页）：** 方法的详细概览：对真实图像 $x$、测量 $y=h(x)$、重建 $\{\hat x^{(j)}\}_{j=1}^{p}$ 与任务输出 $\hat z^{(j)}=f(\hat x^{(j)})$，用校准集 $d_{\mathrm{cal}}=\{(\{\hat x_i^{(j)}\}_{j=1}^{p},z_i)\}_{i=1}^{n}$ 做共形预测，构造区间 $C(\{\hat x^{(j)}\};d_{\mathrm{cal}})=[b_l,b_u]$，保证以 $P(Z\in C(\{\hat X^{(j)}\};D_{\mathrm{cal}}))\geq1-\alpha$ 的意义包含真实任务输出 $z=f(x)$。

**图 3（原 PDF 第 7 页）：** 所提多轮测量协议。每一轮采集测量并计算重建与共形区间；若区间长度降到用户设定的阈值 $\tau$ 以下则停止；否则采集更多测量并重复，直到满足阈值。

**图 4（原 PDF 第 9 页）：** a) 平均平均区间长度随加速率 $R$ 的变化（$p=32$ 个样本）；b) 平均区间长度随 $p$ 的变化（$R=16$）。所有结果取 $\alpha=0.05$、$T=10000$ 次试验。

**图 5（原 PDF 第 10 页）：** 对 AR、LWR、CQR 三种共形方法，各子图给出 $T=10000$ 次蒙特卡洛试验的经验覆盖率样本 $\{\mathrm{EC}[t]\}_{t=1}^{T}$ 的直方图（$\alpha=0.05$、$R=8$、$p=32$）及其理论分布；子图还标注 $\{\mathrm{EC}[t]\}_{t=1}^{T}$ 的经验均值，非常接近目标值 $1-\alpha=0.95$。

**图 6（原 PDF 第 12 页）：** 在给定加速率后被接受的切片比例，以及最终轮次 $k_i$ 的分布（AR、LWR、CQR 三种方法）。

**图 7（原 PDF 第 13 页）：** $R=16$ 与 $R=4$ 时的 MR 图像重建与 CQR 预测区间（错误率 $\alpha=0.01$，共 $p=32$ 个后验样本）。fastMRI+ 半月板撕裂边界框在红色区域放大；随着后验样本在半月板区域趋于一致，预测区间收缩。标准差图显示逐像素不确定性高的区域，但难以与下游任务建立联系。为更好突出撕裂，图像亮度被调高；建议放大查看。

**图 8（原 PDF 第 20 页）：** $T=10000$、$R=8$、$p=32$、$\alpha=0.05$ 时按类别与区间大小分层的覆盖率。(a) 类别条件覆盖：三种方法在两个类别上都接近 $1-\alpha=0.95$；(b) 大小分层覆盖：LWR 在各区间大小上的覆盖比 CQR 更稳定一致。

**图 9（原 PDF 第 22 页）：** 各加速率 $R$ 下 2D 空间 Fourier 域的采样掩码。每条白线表示所采集样本的子集；掩码是嵌套的，即给定 $R$ 的掩码包含所有更高 $R$ 掩码中的全部样本。

**图 10（原 PDF 第 25 页）：** 若干加速率 $R$ 下 E2E-VarNet 与 CNF 的示例 MRI 重建，以及 CNF 的标准差图。

## 附录 A：条件覆盖实验（原 PDF 第 20 页）

如第 2 节所述，共形预测通常只提供边际覆盖保证。本节经验评估不同形式的条件覆盖。为此采用第 4 节的蒙特卡洛测试流程，取 $T=10000$、$R=8$、$p=32$、$\alpha=0.05$。

首先评估类别条件覆盖
$$
\Pr\left(Z\in C(\{\hat X^{(j)}\};D_{\mathrm{cal}})\mid X\ \text{被标记为}\ c\right)\tag{19}
$$
对 $c=0$（无病理）与 $c=1$（有病理）。图 8a 显示，虽然三种方法都接近期望的 95% 覆盖率，但 AR 方法的覆盖不足最严重——对类别 1 约为 93%。由于漏检的后果可能比虚警更严重，类别 1 的覆盖不足应审慎对待。使用类别条件共形预测 [55] 很可能获得更好的类别条件覆盖。

接着评估大小分层覆盖 [5]
$$
\Pr\left(Z\in C(\{\hat X^{(j)}\};D_{\mathrm{cal}})\mid\left|C(\{\hat X^{(j)}\};D_{\mathrm{cal}})\right|\in\mathcal S\right)\tag{20}
$$
对区间大小 $\mathcal S\in\{[0,0.05],[0.05,0.1],[0.1,0.15],[0.15,0.2],[0.2,1]\}$。图 8b 显示 LWR 的大小分层覆盖比 CQR 一致得多。不过在 $\tau\leq0.05$ 的多轮采样等情形中，可能只关心小长度区间的覆盖（如长度不超过 0.05），而图 8b 表明 CQR 在这种情况下覆盖很好。

## 附录 B：MRI 测量模型（原 PDF 第 20—21 页）

此处给出所用加速多线圈 MRI 设置的细节。设 $\mathbf w\in\mathbb C^{l}$ 为表征人体某切片的真实 2D 图像，多线圈 MRI 扫描仪产生空间 Fourier 域（"k 空间"）输出
$$
\mathbf u_b=\mathbf P\mathbf F\mathbf S_b\mathbf w+\boldsymbol\epsilon_b\in\mathbb C^{m}\quad b=1,\ldots,B,\tag{21}
$$
其中 $b$ 为线圈索引，$\mathbf P\in\mathbb R^{m\times l}$ 为由 $l\times l$ 单位阵的 $m$ 行组成的采样矩阵，$\mathbf F\in\mathbb C^{l\times l}$ 为 2D 酉离散 Fourier 变换（DFT）矩阵，$\mathbf S_b\in\mathbb C^{l\times l}$ 为建模第 $b$ 个线圈灵敏度的对角阵，$\boldsymbol\epsilon_b\in\mathbb C^{m}$ 为测量噪声 [43]。全采样 MRI 扫描用 $m=l$，加速 MRI 扫描用 $m<l$，其中 $R\triangleq l/m$ 为加速率。

由于真实线圈图 $\{\mathbf S_b\}$ 未知且难以估计，MRI 逆问题可表述为恢复"线圈图像" $\mathbf x\triangleq[\mathbf x_1^{\top},\ldots,\mathbf x_B^{\top}]^{\top}$（其中 $\mathbf x_b\triangleq\mathbf S_b\mathbf w$）而非真实图像 $\mathbf w$。给定估计的线圈图像 $\{\hat{\mathbf x}_b\}$，真实图像的幅度 $|\mathbf w|$ 可用"平方和开根"（RSS）[44] 估计为
$$
\widehat{|\mathbf w|}=\sqrt{\sum_{b=1}^{B}|\hat{\mathbf x}_b|^{2}}.\tag{22}
$$
此外，通常把 k 空间测量 $\mathbf u_b$ 转换到空间域 $\mathbf y_b\triangleq\mathbf F^{H}\mathbf P^{\top}\mathbf u_b$（称为"零填充"图像），并在送入恢复方法前堆叠为 $\mathbf y\triangleq[\mathbf y_1^{\top},\ldots,\mathbf y_B^{\top}]^{\top}$；同理，堆叠后的空间域噪声为 $\boldsymbol\epsilon=[(\mathbf F^{H}\mathbf P^{\top}\boldsymbol\epsilon_1)^{\top},\ldots,(\mathbf F^{H}\mathbf P^{\top}\boldsymbol\epsilon_B)^{\top}]^{\top}$。于是用
$$
\mathbf A\triangleq\operatorname{blkdiag}\left\{\mathbf F^{H}\mathbf P^{\top}\mathbf P\mathbf F,\ldots,\mathbf F^{H}\mathbf P^{\top}\mathbf P\mathbf F\right\},\tag{23}
$$
可把逆问题写成第 1 节所述形式：
$$
\mathbf y=\mathbf A\mathbf x+\boldsymbol\epsilon.\tag{24}
$$

## 附录 C：掩码细节（原 PDF 第 21—22 页）

第 4.4 节模拟多轮测量过程：在第 $k=1,\ldots,5$ 轮采集 k 空间样本，使截至第 $k$ 轮的累积样本对应加速率 $R^{[k]}\in\{16,8,4,2,1\}$。所采集 2D 样本的图样称为"采样掩码"，掩码选择对恢复质量影响很大。

本文使用笛卡尔掩码，采样图样由 2D k 空间中的整行构成。对第 $k=1$ 轮，使用为加速率 $R^{[1]}=16$ 设计的黄金比例偏移（Golden Ratio Offset, GRO）掩码 [31]，其中 [31] 的"$\alpha$"与"$s$"参数取 $s=15$、$\alpha=8$（勿与本文其他处的 $\alpha$ 与 $s$ 混淆）。这给出 k 空间中心一个密集采样的矩形区域，称为自校准信号（ACS）区域，宽 9 行。

对第 $k=2$ 轮，先在 k 空间中心额外采集 7 行，使 ACS 区域宽度为 16；随后按与到中心距离成反比的采样概率额外采集 k 空间行，直到累积加速率达到 $R^{[2]}=8$。接下来两轮重复该过程，分别得到宽度 24 与 32 的 ACS 区域以及 $R^{[3]}=4$、$R^{[4]}=2$ 的累积加速率。所得四个掩码见图 9。最后一轮在整个 k 空间采样，达到加速率 $R^{[5]}=1$。

## 附录 D：数据细节（原 PDF 第 22 页）

此处提供论文所用数据集的更多细节。如第 4 节所述，我们对图像恢复与病理分类任务均使用多线圈 fastMRI 膝关节数据集的非抑脂子集 [61]。它包含来自 484 个训练体数据的 17,286 张训练图像。根据 fastMRI+ [63] 标注，其中有 1,921 张图像存在半月板撕裂。对验证集，使用每个体数据中间 80% 的切片，共 2,188 张图像，其中 324 张图像含半月板撕裂。在蒙特卡洛实验中，我们随机抽取 70% 验证数据作为校准集、30% 作为测试集，得到 1,531 张校准图像与 656 张测试图像。数据划分汇总于表 2。

fastMRI [61] 数据集由 NYU fastMRI 计划采集，公开可用于研究目的。图像与元数据已去标识化，并由提供方人工检查是否包含受保护健康信息；数据集的整理属于经 IRB 批准的研究的一部分。

## 附录 E：网络与训练细节（原 PDF 第 23 页）

所有模型均使用 Adam 优化器 [33]，默认参数 $\beta_1=0.9$、$\beta_2=0.999$。每个重建网络都用全部四种加速率训练：具体而言，每个 epoch 中每个样本都从四个采样掩码中均匀随机抽取一个，使模型在训练期间以不同加速率看到每个训练样本。

对 E2E-VarNet，使用作者在 [50] 的实现，保留 fastMRI 膝部排行榜列出的默认参数，以结构相似性（SSIM）[57] 损失训练 50 个 epoch，学习率 0.0001、批大小 16。

对 CNF，我们修改 [59] 的代码。为更好处理多种加速率，把条件网络的初始通道数增大到 256；并在每个流步末尾加入 iMAP [51] 可逆注意力模块，使用每层 2 层、共 10 个流步。CNF 以负对数似然为损失训练 150 个 epoch，学习率 0.0001、批大小 8。

对软输出二分类网络，从 ResNet50 [27] 出发并用 ImageNet [16] 上训练的网络权重初始化。该任务网络接收 3 通道图像，因此我们用 RSS（22）把多线圈图像转换为幅度图像，并送入分类器的全部三个输入通道。先用 SimCLR [13] 自监督预训练 500 个 epoch（学习率 0.0002、批大小 128）；再以监督方式最小化二元交叉熵损失训练 100 个 epoch。监督训练期间，使用 $\ell_2$ 有界投影梯度下降攻击（10 步、扰动预算 1.5），以使网络对 $\ell_2$ 有界对抗攻击具有鲁棒性；对抗训练用 robustness 包 [23] 实现。分类器训练学习率 0.0001、批大小 128、权重衰减 0.01。为避免对训练数据过拟合，在验证数据上接收机工作特性曲线下面积（AUROC）最大的 epoch 处早停。

所有网络均用 PyTorch [42] 与 PyTorch Lightning [24] 实现，代码见 <https://github.com/jwen307/TaskUQ>。

## 附录 F：图像恢复性能（原 PDF 第 23—24 页）

由于论文聚焦于预测区间长度等不确定性度量，读者可能想知道 E2E-VarNet 与 CNF 恢复方法在峰值信噪比（PSNR）、结构相似性指数（SSIM）[57] 与 Fréchet Inception 距离（FID）[28] 等传统图像恢复指标上的表现。本节给出这些细节。

计算这些指标时，使用式（22）的 RSS 幅度近似；并按 fastMRI 论文 [61] 的做法，在整个体数据而非单张切片上计算 PSNR 与 SSIM。对 CNF，PSNR 与 SSIM 在由 $p=32$ 个后验样本平均得到的后验均值近似上计算；计算 FID 时使用 VGG-16 嵌入 [48]、CNF 的 $p=1$ 个样本，并用整个训练集计算参考统计量。

表 3 给出 E2E-VarNet 与 CNF 在若干加速率 $R$ 下于整个验证集上的 PSNR、SSIM 与 FID。可见 E2E-VarNet 在 PSNR 与 SSIM 上略优于 CNF，但在 FID 上不然。由于模型被训练以处理四种加速率，表 3 的结果略低于原 E2E-VarNet 与 CNF 论文 [49]、[58] 所报告的结果。

图 10 给出 E2E-VarNet 与 CNF 的示例重建以及 CNF 的标准差图。如预期，后验标准差随加速因子 $R$ 增大而减小。

## 附录 G：分类器性能（原 PDF 第 24 页）

读者可能还想知道我们的软输出半月板撕裂分类器在标准分类指标上的表现。表 4 给出在第 4 节所述验证集上、使用 fastMRI+ [63] 半月板撕裂标注评估的准确率、精确率、召回率与 AUROC。可见分类器召回率较高但精确率较低，这在半月板撕裂诊断语境中可能更好，因为漏检的代价可能高于虚警。鉴于训练分类器的数据集相对较小，我们推测这些指标可通过更多数据和更好的类别平衡大幅改善。尽管如此，我们相信该分类器足以作为任务驱动的不确定性评估工具。

## 参考文献（英文原书目）

以下按原 PDF 第 16—19 页的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] Abdar, M., Pourpanah, F., Hussain, S., Rezazadegan, D., Liu, L., Ghavamzadeh, M., Fieguth, P., Cao, X., Khosravi, A., Acharya, U.R., et al.: A review of uncertainty quantification in deep learning: Techniques, applications and challenges. Information Fusion 76, 243–297 (2021)

[2] Adler, J., Öktem, O.: Deep Bayesian inversion. arXiv:1811.05910 (2018)

[3] Angelopoulos, A.N., Bates, S.: Conformal prediction: A gentle introduction. Foundations and Trends in Machine Learning 16(4), 494–591 (2023). https://doi.org/10.1561/2200000101

[4] Angelopoulos, A.N., Kohli, A.P., Bates, S., Jordan, M.I., Malik, J., Alshaabi, T., Upadhyayula, S., Romano, Y.: Image-to-image regression with distribution-free uncertainty quantification and applications in imaging. In: Proc. Intl. Conf. on Machine Learning (2022). https://doi.org/10.48550/arXiv.2202.05265

[5] Angelopoulos, A.N., Bates, S., Jordan, M., Malik, J.: Uncertainty sets for image classifiers using conformal prediction. In: Proc. Intl. Conf. on Learning Representations (2020)

[6] Ardizzone, L., Kruse, J., Wirkert, S., Rahner, D., Pellegrini, E.W., Klessen, R.S., Maier-Hein, L., Rother, C., Köthe, U.: Analyzing inverse problems with invertible neural networks. In: Proc. Intl. Conf. on Learning Representations (2019)

[7] Arridge, S., Maass, P., Öktem, O., Schönlieb, C.B.: Solving inverse problems using data-driven models. Acta Numerica 28, 1–174 (Jun 2019)

[8] Banerji, C.R.S., Chakraborti, T., Harbron, C., MacArthur, B.D.: Clinical AI tools must convey predictive uncertainty for each individual patient. Nature Medicine 29(12), 2996–2998 (2023). https://doi.org/10.1038/s41591-023-02562-7

[9] Barbano, R., Zhang, C., Arridge, S., Jin, B.: Quantifying model uncertainty in inverse problems via Bayesian deep gradient descent. In: Proc. IEEE Intl. Conf. on Pattern Recognition. pp. 1392–1399 (2021). https://doi.org/10.1109/ICPR48806.2021.9412521

[10] Bates, S., Angelopoulos, A., Lei, L., Malik, J., Jordan, M.: Distribution-free, risk-controlling prediction sets. Journal of the ACM 68(6) (2021). https://doi.org/10.1145/3478535

[11] Bendel, M., Ahmad, R., Schniter, P.: A regularized conditional GAN for posterior sampling in inverse problems. Proc. Neural Information Processing Systems Conf. (2023)

[12] Boeken, T., Feydy, J., Lecler, A., Soyer, P., Feydy, A., Barat, M., Duron, L.: Artificial intelligence in diagnostic and interventional radiology: Where are we now? Diagnostic and Interventional Imaging 104(1), 1–5 (2023)

[13] Chen, T., Kornblith, S., Norouzi, M., Hinton, G.: A simple framework for contrastive learning of visual representations. In: Proc. Intl. Conf. on Machine Learning. pp. 1597–1607 (2020)

[14] Chung, H., Kim, J., McCann, M.T., Klasky, M.L., Ye, J.C.: Diffusion posterior sampling for general noisy inverse problems. In: Proc. Intl. Conf. on Learning Representations (2023)

[15] Chung, H., Ye, J.C.: Score-based diffusion models for accelerated MRI. Med. Image Analysis 80, 102479 (2022)

[16] Deng, J., Dong, W., Socher, R., Li, L.J., Li, K., Fei-Fei, L.: Imagenet: A large-scale hierarchical image database. In: Proc. IEEE Conf. on Computer Vision and Pattern Recognition. pp. 248–255 (2009)

[17] Denker, A., Schmidt, M., Leuschner, J., Maass, P.: Conditional invertible neural networks for medical imaging. Journal of Imaging 7(11), 243 (2021)

[18] Ding, K., Ma, K., Wang, S., Simoncelli, E.P.: Image quality assessment: Unifying structure and texture similarity. IEEE Trans. on Pattern Analysis and Machine Intelligence 44(5), 2567–2581 (2020)

[19] Durmus, A., Moulines, E., Pereyra, M.: Efficient Bayesian computation by proximal Markov chain Monte Carlo: When Langevin meets Moreau. SIAM Journal on Imaging Sciences 11(1), 473–506 (2018)

[20] Edupuganti, V., Mardani, M., Vasanawala, S., Pauly, J.: Uncertainty quantification in deep MRI reconstruction. IEEE Trans. on Medical Imaging 40(1), 239–250 (Jan 2021)

[21] Ekmekci, C., Cetin, M.: Uncertainty quantification for deep unrolling-based computational imaging. IEEE Trans. on Computational Imaging 8, 1195–1209 (2022). https://doi.org/10.1109/TCI.2022.3233185

[22] Ekmekci, C., Cetin, M.: Quantifying generative model uncertainty in posterior sampling methods for computational imaging. In: Proc. Neural Information Processing Systems Workshop (2023)

[23] Engstrom, L., Ilyas, A., Salman, H., Santurkar, S., Tsipras, D.: Robustness (python library) (2019), https://github.com/MadryLab/robustness

[24] Falcon, W., et al.: Pytorch lightning (2019), https://github.com/PyTorchLightning/pytorch-lightning

[25] Guo, C., Pleiss, G., Sun, Y., Weinberger, K.Q.: On calibration of modern neural networks. In: Proc. Intl. Conf. on Machine Learning. vol. 70, pp. 1321–1330 (2017)

[26] Hammernik, K., Küstner, T., Yaman, B., Huang, Z., Rueckert, D., Knoll, F., Akçakaya, M.: Physics-driven deep learning for computational magnetic resonance imaging: Combining physics and machine learning for improved medical imaging. IEEE Signal Processing Magazine 40(1), 98–114 (2023)

[27] He, K., Zhang, X., Ren, S., Sun, J.: Deep residual learning for image recognition. In: Proc. IEEE Conf. on Computer Vision and Pattern Recognition. pp. 770–778 (2016)

[28] Heusel, M., Ramsauer, H., Unterthiner, T., Nessler, B., Hochreiter, S.: GANs trained by a two time-scale update rule converge to a local Nash equilibrium. In: Proc. Neural Information Processing Systems Conf. vol. 30 (2017)

[29] Horwitz, E., Hoshen, Y.: Conffusion: Confidence intervals for diffusion models. arXiv.2211.09795 (2022). https://doi.org/10.48550/arXiv.2211.09795

[30] Jalal, A., Arvinte, M., Daras, G., Price, E., Dimakis, A., Tamir, J.: Robust compressed sensing MRI with deep generative priors. In: Proc. Neural Information Processing Systems Conf. (2021)

[31] Joshi, M., Pruitt, A., Chen, C., Liu, Y., Ahmad, R.: Technical report (v1.0)–pseudo-random cartesian sampling for dynamic MRI. arXiv:2206.03630 (2022)

[32] Kendall, A., Gal, Y.: What uncertainties do we need in Bayesian deep learning for computer vision? In: Proc. Neural Information Processing Systems Conf. (2017)

[33] Kingma, D.P., Ba, J.: Adam: A method for stochastic optimization. In: Proc. Intl. Conf. on Learning Representations (2015)

[34] Knoll, F., Hammernik, K., Zhang, C., Moeller, S., Pock, T., Sodickson, D.K., Akcakaya, M.: Deep-learning methods for parallel magnetic resonance imaging reconstruction: A survey of the current approaches, trends, and issues. IEEE Signal Processing Magazine 37(1), 128–140 (Jan 2020)

[35] Koenker, R., Bassett, G.: Regression quantiles. Econometrica 46(1) (1978). https://doi.org/10.2307/1913643

[36] Kutiel, G., Cohen, R., Elad, M., Freedman, D., Rivlin, E.: Conformal prediction masks: Visualizing uncertainty in medical imaging. In: Proc. Intl. Conf. on Learning Representations (2023)

[37] Lei, J., G’Sell, M., Rinaldo, A., Tibshirani, R.J., Wasserman, L.: Distribution-free predictive inference for regression. Journal of the American Statistical Association (2018)

[38] Lei, J., Wasserman, L.: Distribution-free prediction bands for non-parametric regression. Journal of the Royal Statistical Society 76 (2014). https://doi.org/10.1111/rssb.12021

[39] Lu, C., Angelopoulos, A.N., Pomerantz, S.: Improving trustworthiness of AI disease severity rating in medical imaging with ordinal conformal prediction sets. Proc. Intl. Conf. on Medical Image Computation and Computer-Assisted Intervention (2022). https://doi.org/10.48550/arXiv.2207.02238

[40] Narnhofer, D., Effland, A., Kobler, E., Hammernik, K., Knoll, F., Pock, T.: Bayesian uncertainty estimation of learned variational MRI reconstruction. IEEE Trans. on Medical Imaging 41(2), 279–291 (2022)

[41] Papadopoulos, H., Proedrou, K., Vovk, V., Gammerman, A.: Inductive confidence machines for regression. In: Proc. European Conf. on Machine Learning. pp. 345–356 (2002). https://doi.org/10.1007/3-540-36755-1_29

[42] Paszke, A., Gross, S., Massa, F., Lerer, A., Bradbury, J., Chanan, G., Killeen, T., Lin, Z., Gimelshein, N., Antiga, L., Desmaison, A., Kopf, A., Yang, E., DeVito, Z., Raison, M., Tejani, A., Chilamkurthy, S., Steiner, B., Fang, L., Bai, J., Chintala, S.: PyTorch: An imperative style, high-performance deep learning library. In: Proc. Neural Information Processing Systems Conf. pp. 8024–8035 (2019)

[43] Pruessmann, K.P., Weiger, M., Scheidegger, M.B., Boesiger, P.: SENSE: Sensitivity encoding for fast MRI. Magnetic Resonance in Medicine 42(5), 952–962 (1999)

[44] Roemer, P.B., Edelstein, W.A., Hayes, C.E., Souza, S.P., Mueller, O.M.: The NMR phased array. Magnetic Resonance in Medicine 16(2), 192–225 (1990)

[45] Romano, Y., Patterson, E., Candès, E.J.: Conformalized quantile regression. In: Proc. Neural Information Processing Systems Conf. pp. 3543–3553 (2019). https://doi.org/10.48550/arXiv.1905.03222

[46] Sankaranarayanan, S., Angelopoulos, A.N., Bates, S., Romano, Y., Isola, P.: Semantic uncertainty intervals for disentangled latent spaces. In: Proc. Neural Information Processing Systems Conf. (2022). https://doi.org/10.48550/arXiv.2207.10074

[47] Schlemper, J., Castro, D.C., Bai, W., Qin, C., Oktay, O., Duan, J., Price, A.N., Hajnal, J., Rueckert, D.: Bayesian deep learning for accelerated MR image reconstruction. In: Proc. Machine Learning for Medical Image Reconstruction Workshop. pp. 64–71 (2018)

[48] Simonyan, K., Zisserman, A.: Very deep convolutional networks for large-scale image recognition. arXiv:1409.1556 (2014)

[49] Sriram, A., Zbontar, J., Murrell, T., Defazio, A., Zitnick, C.L., Yakubova, N., Knoll, F., Johnson, P.: End-to-end variational networks for accelerated MRI reconstruction. In: Proc. Intl. Conf. on Medical Image Computation and Computer-Assisted Intervention. pp. 64–73 (2020)

[50] Sriram, A., Zbontar, J., Murrell, T., Defazio, A., Zitnick, C.L., Yakubova, N., Knoll, F., Johnson, P.: End-to-end variational networks for accelerated MRI reconstruction. https://github.com/facebookresearch/fastMRI (2020)

[51] Sukthanker, R.S., Huang, Z., Kumar, S., Timofte, R., Van Gool, L.: Generative flows with invertible attentions. In: Proc. IEEE Conf. on Computer Vision and Pattern Recognition (2022). https://doi.org/10.48550/arXiv.2106.03959

[52] Tang, M., Repetti, A.: A data-driven approach for Bayesian uncertainty quantification in imaging. arXiv (2023). https://doi.org/10.48550/arXiv.2304.11200

[53] Teneggi, J., Tivnan, M., Stayman, J.W., Sulam, J.: How to trust your diffusion model: A convex optimization approach to conformal risk control (2023). https://doi.org/10.48550/arXiv.2302.03791

[54] Vovk, V., Gammerman, A., Shafer, G.: Algorithmic Learning in a Random World. Springer (2005)

[55] Vovk, V.: Conditional validity of inductive conformal predictors. In: Asian Conf. Mach. Learn. pp. 475–490 (2012)

[56] Vovk, V., Gammerman, A., Saunders, C.: Machine-learning applications of algorithmic randomness. In: Proc. Intl. Conf. on Machine Learning. pp. 444–453 (1999)

[57] Wang, Z., Bovik, A.C., Sheikh, H.R., Simoncelli, E.P.: Image quality assessment: From error visibility to structural similarity. IEEE Trans. on Image Processing 13(4), 600–612 (Apr 2004)

[58] Wen, J., Ahmad, R., Schniter, P.: A conditional normalizing flow for accelerated multi-coil MR imaging. In: Proc. Intl. Conf. on Machine Learning (2023)

[59] Wen, J., Ahmad, R., Schniter, P.: MRI CNF (2023), https://github.com/jwen307/mri_cnf

[60] Xue, Y., Cheng, S., Li, Y., Tian, L.: Reliable deep-learning-based phase imaging with uncertainty quantification. Optica 6(5) (2019). https://doi.org/10.1364/OPTICA.6.000618

[61] Zbontar, J., et al.: fastMRI: An open dataset and benchmarks for accelerated MRI. arXiv:1811.08839 (2018)

[62] Zhang, R., Isola, P., Efros, A.A., Shechtman, E., Wang, O.: The unreasonable effectiveness of deep features as a perceptual metric. In: Proc. IEEE Conf. on Computer Vision and Pattern Recognition. pp. 586–595 (2018)

[63] Zhao, R., Yaman, B., Zhang, Y., Stewart, R., Dixon, A., Knoll, F., Huang, Z., Lui, Y.W., Hansen, M.S., Lungren, M.P.: fastMRI+: Clinical pathology annotations for knee and brain fully sampled magnetic resonance imaging data. Scientific Data 9(1), 152 (2022). https://doi.org/10.1038/s41597-022-01255-z

**本页范围与校对状态：** 本页依据 arXiv:2405.18527v2（cs.CV，2024-07-11，26 页）完成全文中文翻译：摘要、第 1—6 节（含 3.1—3.4、4.1—4.4 等小节）、致谢、附录 A—G、图 1—10 中文图注、表 1—4 逐格转录、参考文献 [1]—[63] 英文原条目（按原编号）。公式编号 (1)—(24) 按原文保留。表 1—4 的数值已用 PDF 第 12、22、24、26 页渲染图逐格核对。**逐句逐式终校未做**；图内曲线未作数字化读取，只转录图注与正文给出的关键数值；参考文献未联网核验 DOI、页码与在线链接。原文为 MICCAI 格式论文（含补充材料附录），已在正文中照原结构保留附录 A—G。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
