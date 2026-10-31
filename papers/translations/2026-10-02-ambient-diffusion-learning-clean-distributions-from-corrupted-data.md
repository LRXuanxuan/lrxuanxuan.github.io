---
layout: page
title: "环境扩散：从受损数据学习干净分布｜中文译稿（许可待核）译文"
permalink: /papers/translations/2026-10-02-ambient-diffusion-learning-clean-distributions-from-corrupted-data/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/f1900748d3249be6/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 环境扩散：从受损数据学习干净分布

**原题：** Ambient Diffusion: Learning Clean Distributions from Corrupted Data  
**作者：** Giannis Daras、Kulin Shah、Yuval Dagan、Aravind Gollakota、Alexandros G. Dimakis、Adam Klivans  
**单位：** 得克萨斯大学奥斯汀分校（UT Austin）；加州大学伯克利分校（UC Berkeley）；Apple。  
**版本：** 会议论文集版本（NeurIPS-2023-ambient-diffusion-learning-clean-distributions-from-corrupted-data-Paper-Conference.pdf，第 37 届神经信息处理系统大会 NeurIPS 2023），本地 PDF 26 页。  
**许可与用途说明：** 原文为 NeurIPS 2023 会议论文集版本，**再传播许可待核验**；本页仅作**学习用途**，**不计入可公开全文**统计。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节正文（含图 1–6、表 1）、局限、致谢、第 A–E 节附录（含定理 4.1 与推论 A.1/A.2 证明、引理 A.3、训练与评估细节、表 2–7、图 7–11），以及参考文献 65 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

我们提出首个能够仅用高度受损样本学习未知分布的基于扩散的框架。该问题出现在无法获得或获取成本高昂的未受损样本的科学应用中。我们方法的另一个好处是能够训练更不可能记忆任何单个训练样本的生成模型，因为它们从未观察到干净训练数据。我们的核心思想是在扩散过程中引入额外的测量畸变，并要求模型从进一步受损的图像预测原始受损图像。我们证明，我们的方法导出的模型学习的是给定该额外测量损伤下完整未受损图像的条件期望。这对满足某些技术条件的任意损伤过程都成立（特别包括修复与压缩感知）。我们在标准基准（CelebA、CIFAR-10 与 AFHQ）上训练模型，并表明即便所有训练样本都有 90% 的像素缺失，我们仍能学习该分布。我们还表明，可以在小型受损数据集（例如含块状损伤的 MRI 扫描）上微调基础模型，并在不记忆训练集的情况下学习干净分布。

## 1 引言

扩散生成模型 [54, 23, 57] 正成为学习高维分布与求解逆问题的通用而强大的框架 [34, 11, 36, 28]。许多近期进展 [58, 30] 催生了 DALL·E 2 [45]、Latent Diffusion [50] 与 Imagen [52] 等文本条件基础模型，在一般图像域上性能惊人。训练这些模型需要访问高质量数据集，而这类数据可能昂贵或无法获得。例如，黑洞的直接图像无法观测 [12, 19]，高质量 MRI 图像需要长扫描时间，造成患者不适与运动伪影 [28]。

近来，Carlini 等 [8]、Somepalli 等 [55] 与 Jagielski 等 [27] 表明扩散模型会记忆训练集中的样本。此外，攻击者仅凭对模型的查询访问即可抽取数据集样本，带来隐私、安全与版权问题。对许多应用而言，我们可能想学习分布而非单个训练图像，例如学习 X 光扫描的分布而不记忆数据集中特定患者的扫描图像。因此，我们可能希望把损伤作为一种设计选择引入。我们表明，仅观测高度受损样本即可训练学习干净数据分布的扩散模型。

> **图 1（原文 Fig. 1）：** 左面板：用 CelebA-HQ 的 3000 张图像对 Deepfloyd IF 做普通微调的基线方法。我们展示生成样本及其在微调集中的最近邻。如图所示，生成样本常常与训练数据近乎相同，证实 Carlini 等 [8]、Somepalli 等 [55] 与 Jagielski 等 [27] 的相关工作所指出的：扩散模型常生成训练样本。右面板：我们用所提方法与 3000 张高度受损训练图像微调同一基础模型（Deepfloyd IF）。损伤加入噪声并移除 80% 的随机像素。我们展示生成样本与训练集最近邻。我们的方法仍能学习人脸的干净分布（如所示有一定质量下降），但不记忆训练数据。我们强调，训练全程从未访问干净训练数据。

**从受损数据进行监督学习的先前工作。** 解决此类问题的传统方法是训练一个复原模型，用监督学习根据测量预测干净图像 [47, 48, 63, 41]。开创性的 Noise2Noise [39] 工作提出了在没有任何无噪图像时学习去噪的实用算法。该框架及其推广 [5, 38, 59] 已应用于电子显微 [16]、断层图像重建 [62]、荧光图像重建 [65]、盲逆问题 [20, 5]、单目深度估计与蛋白质组学 [6]。另一相关方向使用 Stein 无偏风险估计（SURE）在无法获得无噪数据时优化去噪目标的无偏估计 [18]。我们强调，上述研究关注的是复原问题，而我们关注的是从干净分布采样的问题。基于监督学习的复原算法只在损伤水平相对较低时有效 [15]。然而，重建单个样本可能既不可行也不可取。相反，期望目标可能是学会从无损伤数据的分布生成全新且完全未见的样本，而不重建单个训练样本。事实上，对某些损伤过程，理论上可以仅从高度受损样本（例如仅随机一维投影）完美学习分布，尽管此类设定下单个样本去噪通常不可能。

AmbientGAN [7] 表明，在无限训练数据极限下，通过仅观测一维随机高斯向量上的投影，可从标量观测学习一般 $d$ 维分布。该理论要求无限强大的判别器，因此不适用于扩散模型。MCFlow [49] 是基于 EM 算法变体的框架，可用于从缺失数据训练归一化流模型。最后，MIWAE [42] 与 Not-MIWAE [26] 分别是损伤过程已知或未知时从缺失数据学习深度潜变量模型（如 VAE）的框架。

**我们的贡献。** 我们提出首个在训练集只含来自 $\mathcal D$ 的高度受损样本时学习未知分布的基于扩散的框架。具体地，我们考虑在给定受损样本 $\mathbf A\mathbf x_0$ 时学习从目标分布 $p_0(\mathbf x_0)$ 采样的任务，其中 $\mathbf A\sim p(\mathbf A)$ 是随机损伤矩阵（其实现与先验分布已知），$\mathbf x_0\sim p_0(\mathbf x_0)$。我们的核心思想是在扩散过程中引入额外测量畸变，并要求模型从进一步受损的图像预测原始受损图像。

- 我们给出一种算法，可证明地学习 $\mathbb E[\mathbf x_0\mid\tilde{\mathbf A}(\mathbf x_0+\sigma_t\boldsymbol\eta),\tilde{\mathbf A}]$，对所有噪声水平 $t$ 以及 $\tilde{\mathbf A}\sim p(\tilde{\mathbf A}\mid\mathbf A)$（$\mathbf A$ 的进一步受损版本）成立。该结果对一般损伤过程族 $\mathbf A\sim p(\mathbf A)$ 成立。对多种损伤过程，我们表明 $\tilde{\mathbf A}$ 引入的进一步退化可以非常小。
- 我们用该算法在标准基准（CelebA、CIFAR-10 与 AFHQ）上以不同损伤水平的训练数据训练扩散模型。
- 基于所学条件期望，我们给出目标分布 $p_0(\mathbf x_0)$ 的近似采样器。
- 我们表明，即便 90% 像素缺失，我们仍能相当好地学习未受损图像的分布。我们优于先前的先进方法 AmbientGAN [7] 与自然基线。
- 我们表明，我们的模型在求解某些逆问题上与最先进扩散模型相当甚至更优，且训练期间从未见过干净图像。我们的模型只需单步预测，而基线需要数百个扩散步。
- 我们用该算法微调预训练的基础扩散模型。微调可在单个 GPU 上数小时内完成，并可用少量受损样本学习分布。
- 我们表明，在足够受损数据上训练的模型不会记忆训练集。我们度量损伤量（控制记忆程度）、训练数据量与所学生成器质量之间的折中。
- 我们开源代码与模型：https://github.com/giannisdaras/ambient-diffusion。

## 2 背景

训练扩散模型包含两步。首先设计一个损伤过程，把数据分布逐渐变换为可采样的分布 [58, 14]。通常该损伤过程由如下 Ito SDE 描述：$\mathrm d\mathbf x=f(\mathbf x,t)\mathrm dt+g(t)\mathrm d\mathbf w$，其中 $\mathbf w$ 是标准 Wiener 过程。此类损伤过程可逆，反向过程同样由 Ito SDE 描述 [3]：$\mathrm d\mathbf x=\left[f(\mathbf x,t)-g^2(t)\nabla_{\mathbf x}\log p_t(\mathbf x)\right]\mathrm dt+g(t)\mathrm d\mathbf w$。扩散模型的设计者通常可自由选择漂移函数 $f(\cdot,\cdot)$ 与扩散函数 $g(\cdot)$。典型选择为令 $f(\mathbf x,t)=\mathbf 0$、$g(t)=\sqrt{\frac{\mathrm d\sigma_t^2}{\mathrm dt}}$（方差爆炸 SDE），或令 $f(\mathbf x,t)=-\beta(t)\mathbf x$、$g(t)=\sqrt{\beta(t)}$（方差保持 SDE）。两种选择都导致高斯终端分布，并等价于输入上的线性变换。扩散模型训练的目标是学习函数 $\nabla_{\mathbf x}\log p_t(\mathbf x)$，即得分函数。

为简化表述，本文聚焦导致条件分布 $\mathbf x_t=\mathbf x_0+\sigma_t\boldsymbol\eta$ 的方差爆炸 SDE。

Vincent [61] 表明，可通过优化得分匹配目标来学习第 $t$ 层的得分函数：

$$
J(\theta)=\frac12\mathbb E_{(\mathbf x_0,\mathbf x_t)}\left\|\mathbf h_\theta(\mathbf x_t,t)-\mathbf x_0\right\|^2. \tag{2.1}
$$

具体地，得分函数可用该目标的极小化者表示为

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)=\frac{\mathbf h_{\theta^\ast}(\mathbf x_t,t)-\mathbf x_t}{\sigma_t}. \tag{2.2}
$$

该结果揭示了得分函数与给定 $\mathbf x_t$ 时 $\mathbf x_0$ 的最佳复原模型之间的基本联系，即 Tweedie 公式 [17]。具体地，最优 $\mathbf h_{\theta^\ast}(\mathbf x_t,t)$ 由 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$ 给出，这意味着

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)=\frac{\overbrace{\mathbb E[\mathbf x_0\mid\mathbf x_t]}^{\text{最佳复原}}-\mathbf x_t}{\sigma_t}. \tag{2.3}
$$

受扩散模型这一复原解释的启发，Soft/Cold Diffusion 工作 [14, 4] 把扩散模型推广到非马尔可夫损伤过程：$\mathbf x_t=\mathbf C_t\mathbf x_0+\sigma_t\boldsymbol\eta$。具体地，Soft Diffusion 提出 Soft Score Matching 目标：

$$
J_{\mathrm{soft}}(\theta)=\frac12\mathbb E_{(\mathbf x_0,\mathbf x_t)}\left\|\mathbf C_t\left(\mathbf h_\theta(\mathbf x_t,t)-\mathbf x_0\right)\right\|^2, \tag{2.4}
$$

并表明通过广义 Tweedie 公式足以恢复得分函数：

$$
\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)=\frac{\mathbf C_t\mathbb E[\mathbf x_0\mid\mathbf x_t]-\mathbf x_t}{\sigma_t}. \tag{2.5}
$$

对这些广义模型，矩阵 $\mathbf C_t$ 是设计选择（类似于我们可选择的函数 $f,g$）。最重要的是，$t=0$ 时矩阵 $\mathbf C_t$ 变为单位矩阵、噪声 $\sigma_t$ 变为零，即我们观测到来自真实分布的样本。

## 3 方法

如引言所述，许多情形下我们观测不到未受损图像 $\mathbf x_0$，或出于设计（避免记忆与敏感数据泄漏）或因为无法获得干净数据。这里研究学习者只能访问干净数据的线性测量的情形，即 $\mathbf y_0=\mathbf A\mathbf x_0$，损伤矩阵 $\mathbf A:\mathbb R^m\to\mathbb R^n$。注意我们关注不可逆损伤矩阵。我们提出两个问题：

1. 仅给定受损样本（$\mathbf y_0=\mathbf A\mathbf x_0,\mathbf A$），能否对所有噪声水平 $t$ 学习 $\mathbb E[\mathbf x_0\mid\mathbf A(\mathbf x_0+\sigma_t\boldsymbol\eta),\mathbf A]$？
2. 若可以，能否用该复原模型 $\mathbb E[\mathbf x_0\mid\mathbf A(\mathbf x_0+\sigma_t\boldsymbol\eta),\mathbf A]$ 恢复任意噪声水平 $t$ 的 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$，从而通过 Tweedie 公式（式 2.3）给出的得分函数从真实分布采样？

我们在本文余下部分研究这些问题。对第一个问题，答案是肯定的，但需引入额外损伤（如下）。对第二个问题，我们在每个时间步 $t$ 直接用 $\mathbb E[\mathbf x_0\mid\mathbf A\mathbf x_t,\mathbf A]$（对选定 $\mathbf A$）近似 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$，并代入式 2.3。经验上，所得近似采样器给出良好结果。

### 3.1 训练

为清晰起见，先考虑随机修复情形。若把图像 $\mathbf x_0$ 视为向量，可把矩阵 $\mathbf A$ 视为对角矩阵：对应保留像素的项为 1、被擦除像素的项为 0。假设 $p(\mathbf A)$ 采样一个矩阵，其对角每个元素独立同分布，以概率 $1-p$ 取 1、以概率 $p$ 取 0。

我们希望训练函数 $\mathbf h_\theta$，它接收损伤矩阵 $\mathbf A$ 与受损图像的含噪版本

$$
\mathbf y_t=\underbrace{\mathbf A(\mathbf x_0+\sigma_t\boldsymbol\eta)}_{\mathbf x_t},\qquad\boldsymbol\eta\sim\mathcal N(\mathbf 0,\mathbf I),
$$

并产生条件期望的估计。最简单的想法是忽略缺失像素并优化：

$$
J_{\mathrm{naive}}^{\mathrm{corr}}(\theta)=\frac12\mathbb E_{(\mathbf x_0,\mathbf x_t,\mathbf A)}\left\|\mathbf A\left(\mathbf h_\theta(\mathbf A,\mathbf A\mathbf x_t,t)-\mathbf x_0\right)\right\|^2. \tag{3.1}
$$

尽管与 Soft Score Matching（式 2.4）相似，该目标不会学到条件期望。原因在于学习者在缺失像素上表现任意差从不受罚。形式上，任何满足 $\mathbf A\mathbf h_{\theta'}(\mathbf A,\mathbf y_t,t)=\mathbf A\mathbb E[\mathbf x_0\mid\mathbf A\mathbf x_t,\mathbf A]$ 的函数 $\mathbf h_{\theta'}$ 都是极小化者。

相反，我们提出在把样本输入模型之前进一步损伤它，并要求模型从进一步受损的图像预测原始受损样本。

具体地，我们随机地把 $\mathbf A$ 损伤为 $\tilde{\mathbf A}=\mathbf B\mathbf A$，其中 $\mathbf B$ 是在给定 $\mathbf A$ 时随机选取的矩阵。在缺失像素示例中，$\tilde{\mathbf A}$ 由 $\mathbf A$ 随机擦除在损伤 $\mathbf A$ 后仍存活的额外比例 $\delta$ 的像素得到。这里 $\mathbf B$ 为对角矩阵，每个元素以概率 $1-\delta$ 取 1、以概率 $\delta$ 取 0。我们将惩罚模型恢复样本 $\mathbf A\mathbf x_0$ 中可见的所有像素：既包括在 $\tilde{\mathbf A}\mathbf x_0$ 中存活的像素，也包括被 $\tilde{\mathbf A}$ 擦除的像素。形式化训练目标为最小化如下损失：

$$
J^{\mathrm{corr}}(\theta)=\frac12\mathbb E_{(\mathbf x_0,\mathbf x_t,\mathbf A,\tilde{\mathbf A})}\left\|\mathbf A\left(\mathbf h_\theta(\tilde{\mathbf A},\tilde{\mathbf A}\mathbf x_t,t)-\mathbf x_0\right)\right\|^2. \tag{3.2}
$$

我们算法的核心思想如下：学习者不知道某个缺失像素是因为我们从未拥有它（因而不知真值）而缺失，还是因为它作为进一步损伤的一部分被刻意擦除（此时我们确实知道真值）。因此，最好的学习者不能在未观测像素上不准确，因为以非零概率它可能在其中某些像素上被评估。注意训练好的模型在观测像素上表现为去噪器，在缺失像素上表现为修复器。我们还想强调，进一步损伤的概率 $\delta$ 可以任意小，只要保持为正。

进一步损伤的思想可从随机修复推广到更广的损伤过程族。例如，若 $\mathbf A$ 是 $m$ 行的随机高斯矩阵，可随机删除 $\mathbf A$ 的一行得到 $\tilde{\mathbf A}$。若 $\mathbf A$ 是块修复矩阵（即所有训练图像都缺失一个固定大小的随机块），可通过再损伤一个不重叠的缺失块构造 $\tilde{\mathbf A}$。进一步损伤的示例如图 2 所示。在理论部分，我们证明用我们的算法与样本（$\mathbf y_0=\mathbf A\mathbf x_0,\mathbf A$）恢复 $\mathbb E[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}]$ 所需的条件。我们的目标是在添加最小进一步损伤（即保持 $\tilde{\mathbf A}$ 接近 $\mathbf A$）的同时满足该条件。

> **图 2（原文 Fig. 2）：** 方法示意：给定含删除像素的训练数据，我们进一步擦除更多像素（以绿色示出）。我们把进一步受损的图像输入学习器，并在原始观测像素上评估它。训练时我们可以这样做，因为绿色像素值对我们是已知的。得分网络学习器无法知道某像素是一开始就缺失还是被我们损伤，因此得分网络学会在所有位置预测干净图像。我们的方法类似于对测试中随机子集题目评分，但学生并不知道哪些题目会被评。

### 3.2 采样

要用标准扩散表述从 $p_0(\mathbf x_0)$ 采样，我们需要 $\nabla_{\mathbf x_t}\log p_t(\mathbf x_t)$，这等价于拥有 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$（见式 2.3）。而我们的模型被训练为对 $p(\mathbf A)$ 支撑中的全部矩阵 $\mathbf A$ 预测 $\mathbb E[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}]$。

我们注意到，对随机修复，单位矩阵在技术上属于 $p(\mathbf A)$ 的支撑。然而若损伤概率 $p$ 至少为常数，看到单位矩阵的概率在 $\mathbf x_t$ 的维度上指数级小。因此不应期望我们的模型对属于 $p(\mathbf A)$ 分布尾部的损伤矩阵 $\mathbf A$ 给出良好估计。最简单的想法是采样掩码 $\tilde{\mathbf A}\sim p(\tilde{\mathbf A})$，并用 $\mathbb E[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}]$ 近似 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$。在该近似下，离散化采样规则为

$$
\mathbf x_{t-\Delta t}=\underbrace{\frac{\sigma_{t-\Delta t}}{\sigma_t}}_{\gamma_t}\mathbf x_t+\underbrace{\frac{\sigma_t-\sigma_{t-\Delta t}}{\sigma_t}}_{1-\gamma_t}\underbrace{\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]}_{\widehat{\mathbf x}_0}. \tag{3.3}
$$

该想法效果出奇地好。除另行说明，我们在主文所有实验中使用它，并表明即便 90% 像素缺失，也能生成与真实分布相当接近的样本（如 FID 与 Inception 等指标所示）。采样伪代码见算法 1。在附录（E.4 节）中，我们消融了另一种采样选择，它以更多函数评估为代价带来轻微改善。

> **算法 1　环境扩散固定掩码采样（用于 VE SDE）**
> **输入：** 噪声计划 $\{\sigma_t\}_0^T$、模型参数 $\theta$、用于离散化反向 ODE 的步长 $\Delta t$
> 采样 $\mathbf x_T\sim\mathcal N(\mathbf 0,\sigma_T^2\mathbf I)$　▷ 采样初始噪声
> 采样 $\tilde{\mathbf A}\sim p(\tilde{\mathbf A})$　▷ 采样一个掩码
> $t\leftarrow T$
> **repeat**
> 　$\mathbf y_t\leftarrow\tilde{\mathbf A}\mathbf x_t$　▷ 构造测量
> 　$\widehat{\mathbf x}_0\leftarrow\mathbf h_\theta(\mathbf y_t,\tilde{\mathbf A},t)$　▷ 用网络估计 $\mathbb E[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}]$
> 　$\mathbf x_{t-\Delta t}\leftarrow\frac{\sigma_{t-\Delta t}}{\sigma_t}\mathbf x_t+\frac{\sigma_t-\sigma_{t-\Delta t}}{\sigma_t}\widehat{\mathbf x}_0$　▷ 运行一步反向 ODE，用 $\widehat{\mathbf x}_0$ 近似 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$
> 　$t\leftarrow t-\Delta t$
> **until** $t\le\Delta t$
> **return** $\widehat{\mathbf x}_0$

我们强调，固定掩码采样器**不**带有从 $p_0(\mathbf x_0)$ 采样的理论保证。在附录中我们证明：只要能够从受损样本重建 $p_0(\mathbf x_0)$，也就能通过访问 $\mathbb E[\mathbf x_0\mid\mathbf A\mathbf x_t,\mathbf A]$ 重建它（引理 A.3）。但如局限部分所述，我们未能找到任何实现该点的实用算法。尽管如此，实验上固定掩码采样器性能很强，并优于此前为不同生成模型类别提出的基线。

## 4 理论

如第 3 节所述，我们的关键目标之一是学习所有噪声水平下测量的最佳复原模型，即函数 $\mathbf h(\mathbf A,\mathbf y_t,t)=\mathbb E[\mathbf x_0\mid\mathbf y_t,\mathbf A]$。下面表明，在对 $\mathbf A$ 与 $\tilde{\mathbf A}$ 分布的一定假设下，式 3.2 的真实总体极小化者确实基本上就是上述形式。该假设形式化了"即使以 $\tilde{\mathbf A}$ 为条件，$\mathbf A$ 仍有相当变异性"这一思想，后者保证把 $\mathbf A\mathbf x_0$ 作为 $\tilde{\mathbf A}\mathbf x_t$ 与 $\tilde{\mathbf A}$ 的函数来预测的最佳方式是先最优预测 $\mathbf x_0$ 本身。所有证明见附录。

**定理 4.1。** 假设损伤矩阵 $\mathbf A$ 与进一步损伤 $\tilde{\mathbf A}$ 的联合分布。若对其支撑中的每个 $\tilde{\mathbf A}$ 都有 $\mathbb E_{\mathbf A\mid\tilde{\mathbf A}}[\mathbf A^T\mathbf A]$ 满秩，则式 3.2 中目标的唯一极小化者为

$$
\mathbf h_{\theta^\ast}\left(\tilde{\mathbf A},\mathbf y_t,t\right)=\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]. \tag{4.1}
$$

两个符合该框架的简单示例（见附录推论 A.1 与 A.2）为：

- **修复：** $\mathbf A\in\mathbb R^{n\times n}$ 为对角矩阵，每个元素 $A_{ii}\sim\mathrm{Ber}(1-p)$（$p>0$，各 $i$ 独立），额外噪声由如下方式生成：抽取 $\tilde{\mathbf A}\mid\mathbf A$ 使得 $\tilde{\mathbf A}_{ii}=A_{ii}\cdot\mathrm{Ber}(1-\delta)$（小 $\delta>0$，各 $i$ 独立）¹。
- **高斯测量：** $\mathbf A\in\mathbb R^{m\times n}$ 由 $m$ 行独立抽取自 $\mathcal N(\mathbf 0,\mathbf I_n)$ 构成，$\tilde{\mathbf A}\in\mathbb R^{m\times n}$ 在给定 $\mathbf A$ 时通过置零其最后一行构造。

注意式 4.1 中的极小化者并非我们最初期望的形式 $\mathbf h(\mathbf A,\mathbf y_t,t)=\mathbb E[\mathbf x_0\mid\mathbf A\mathbf x_t,\mathbf A]$。我们现在的 $\tilde{\mathbf A}$ 是进一步退化的矩阵。确实，满足定理 4.1 条件的一种平凡方式是完全独立于 $\mathbf A$ 构造 $\tilde{\mathbf A}$，例如总令 $\tilde{\mathbf A}=\mathbf 0$。但此时学到的函数不太有用。因此我们希望添加尽可能少的进一步噪声，确保 $\tilde{\mathbf A}$ 接近 $\mathbf A$。在修复噪声模型等自然噪声模型中，令额外损伤概率 $\delta\to0$，确实可确保 $\tilde{\mathbf A}$ 服从非常接近 $\mathbf A$ 的分布。

> **原文脚注 1：** $\mathrm{Ber}(q)$ 表示以 $q$ 的概率等于 1、以 $1-q$ 的概率等于 0 的 Bernoulli 随机变量。

## 5 实验评估

### 5.1 在受损数据上从头训练

我们的第一个实验是用不同损伤水平的受损训练数据从头训练扩散模型。这些实验使用的损伤模型是随机修复：通过以概率 $p$ 删除每个像素构造数据集。为构造矩阵 $\tilde{\mathbf A}$，我们进一步以概率 $\delta$ 删除 $\mathbf A$ 的每一行——这又移除了剩余像素中额外的 $\delta$ 比例。除另行说明，我们取 $\delta=0.1$。我们在 CIFAR-10、AFHQ 与 CelebA-HQ 上训练模型，全部模型的损伤水平为 $p\in\{0.0,0.2,0.4,0.6,0.8,0.9\}$。我们使用 EDM [30] 代码库训练模型，把卷积替换为已知在修复类问题上表现更好的门控卷积 [64]。为把掩码 $\tilde{\mathbf A}$ 作为额外输入送入模型，我们直接把它与图像 $\mathbf x$ 拼接。完整训练细节见附录 C 节。

我们首先评估模型在其训练任务（随机修复与噪声）上的复原性能，与在干净数据上训练的最先进扩散模型比较。具体地，对 AFHQ 与最先进的 EDM 模型 [30] 比较，对 CelebA 与 DDIM [56] 比较。这些模型并非为去噪训练，但可如 [60, 29] 那样利用去噪器中学习到的先验求解任意逆问题。我们实验了最先进的重建算法 DDRM [34] 与 DPS [11]。

表 1 汇总结果。我们的模型与其他扩散模型表现相当，尽管它从未在干净数据上训练。此外，它只需一步，而所有基线扩散模型都用数百步求解同一任务，性能却更低或相当。DDRM 的性能随着函数评估次数增加而改善，代价是更多计算；对 DPS，把步数增至 100 以上未见显著改善。我们在附录 E 节的表 3、表 5 中给出含噪修复测量下的结果及与监督方法的比较。我们要强调，我们比较的所有基线都有优势：它们在未受损数据上训练，而我们的模型只在受损数据上训练。该实验表明：i) 我们学习条件期望的训练算法有效；ii) 扩散模型被训练去逆转的损伤选择对求解逆问题很重要。

> **表 1（原文 Table 1）：** 我们的模型（在受损数据上训练）与最先进扩散模型在 CelebA（DDIM [56] 模型）与 AFHQ（EDM [30] 模型）上求解随机修复逆问题的比较。我们的模型与最先进扩散逆问题求解器表现相当，尽管它从未见过未受损训练数据；且只需一次得分函数评估。用标准预训练扩散模型求解该问题需要使用重建算法（如 DPS [11] 或 DDRM [34]），通常需要数百步。

| 数据集 | 损伤概率 | 方法 | LPIPS | PSNR | NFE |
|---|---|---|---|---|---|
| CelebA-HQ | 0.6 | 本文 | **0.037** | **31.51** | **1** |
| CelebA-HQ | 0.6 | DPS | 0.053 | 28.21 | 100 |
| CelebA-HQ | 0.6 | DDRM | 0.139 | 25.76 | 35 |
| CelebA-HQ | 0.6 | DDRM | 0.088 | 27.38 | 99 |
| CelebA-HQ | 0.6 | DDRM | 0.069 | 28.16 | 199 |
| CelebA-HQ | 0.8 | 本文 | **0.084** | **26.80** | **1** |
| CelebA-HQ | 0.8 | DPS | 0.107 | 24.16 | 100 |
| CelebA-HQ | 0.8 | DDRM | 0.316 | 20.37 | 35 |
| CelebA-HQ | 0.8 | DDRM | 0.188 | 22.96 | 99 |
| CelebA-HQ | 0.8 | DDRM | 0.153 | 23.82 | 199 |
| CelebA-HQ | 0.9 | 本文 | **0.152** | **23.34** | **1** |
| CelebA-HQ | 0.9 | DPS | 0.168 | 20.89 | 100 |
| CelebA-HQ | 0.9 | DDRM | 0.461 | 15.87 | 35 |
| CelebA-HQ | 0.9 | DDRM | 0.332 | 18.74 | 99 |
| CelebA-HQ | 0.9 | DDRM | 0.242 | 20.14 | 199 |
| AFHQ | 0.4 | 本文 | 0.030 | 33.27 | **1** |
| AFHQ | 0.4 | DPS | **0.020** | **34.06** | 100 |
| AFHQ | 0.4 | DDRM | 0.122 | 25.18 | 35 |
| AFHQ | 0.4 | DDRM | 0.091 | 26.42 | 99 |
| AFHQ | 0.4 | DDRM | 0.088 | 26.52 | 199 |
| AFHQ | 0.6 | 本文 | 0.062 | 29.46 | **1** |
| AFHQ | 0.6 | DPS | **0.051** | **30.03** | 100 |
| AFHQ | 0.6 | DDRM | 0.246 | 20.76 | 35 |
| AFHQ | 0.6 | DDRM | 0.166 | 22.79 | 99 |
| AFHQ | 0.6 | DDRM | 0.160 | 22.93 | 199 |
| AFHQ | 0.8 | 本文 | 0.124 | 25.37 | **1** |
| AFHQ | 0.8 | DPS | **0.107** | 25.30 | 100 |
| AFHQ | 0.8 | DDRM | 0.525 | 14.56 | 35 |
| AFHQ | 0.8 | DDRM | 0.295 | 18.08 | 99 |
| AFHQ | 0.8 | DDRM | 0.258 | 18.86 | 199 |

接下来，我们评估扩散模型作为生成模型的性能。据我们所知，唯一在受损数据训练上有定量结果的生成基线是 AmbientGAN [7]，它在 CIFAR-10 上训练。我们还与不用我们进一步损伤算法训练的扩散模型比较。结果见图 3。不用进一步损伤算法训练的扩散模型在低损伤水平下表现良好，但在高损伤下完全崩溃；相反，用进一步损伤训练的模型即便在高损伤水平下仍保持合理的损伤分数，在所有损伤水平范围上优于先前最先进的 AmbientGAN。

对 CelebA-HQ 与 AFHQ，我们未能找到在受损数据上训练的生成基线可作比较。尽管如此，我们报告 FID 与 Inception 分数并在表 4（原文以图 4 形式给出）中汇总结果，以鼓励该方向的进一步研究。如表所示，对 CelebA-HQ 与 AFHQ，即便 90% 像素被删除，我们仍能保持可观的 FID；对 CIFAR-10，性能下降更快，可能因为训练图像分辨率更低。

> **图 3（原文 Fig. 3）：** CIFAR-10 上性能随损伤水平的变化。我们与不用进一步损伤技巧训练的扩散模型及 AmbientGAN [7] 比较。环境扩散在所有损伤水平范围上都优于两个基线。

> **图 4（原文 Fig. 4）：** 用我们的算法在 CelebA-HQ、AFHQ 与 CIFAR-10 上训练的模型在随机修复下的 Inception/FID 结果。

| 数据集 | 损伤概率 | FID | Inception Score |
|---|---|---|---|
| CelebA-HQ | 0.0 | 3.26 | N/A |
| CelebA-HQ | 0.2 | 4.18 | N/A |
| CelebA-HQ | 0.6 | 6.08 | N/A |
| CelebA-HQ | 0.8 | 11.19 | N/A |
| CelebA-HQ | 0.9 | 25.53 | N/A |
| AFHQ | 0.0 | 2.41 | N/A |
| AFHQ | 0.2 | 4.47 | N/A |
| AFHQ | 0.4 | 6.96 | N/A |
| AFHQ | 0.6 | 10.11 | N/A |
| AFHQ | 0.8 | 16.78 | N/A |
| AFHQ | 0.9 | 41.00 | N/A |
| CIFAR-10 | 0.0 | 1.85 | 9.94 |
| CIFAR-10 | 0.2 | 11.70 | 7.97 |
| CIFAR-10 | 0.4 | 18.85 | 7.45 |
| CIFAR-10 | 0.6 | 28.88 | 6.88 |
| CIFAR-10 | 0.8 | 46.27 | 6.14 |

> **原文疑点：** 正文称"在表 4 中汇总结果"，但主文中该 FID/Inception 汇总数值在原文版面上排在"Figure 4"图注附近（本页按图 4 收录），而附录中另有"Table 4"（与 MisGAN 的对比）；主文该处引用编号可能不一致，此处按原文照录并加注。

> **图 5（原文 Fig. 5）：** 左面板：我们微调 Deepfloyd IF 扩散模型，使其成为脑肿瘤 MRI 图像的生成模型。我们使用仅 155 张图像的小数据集 [25]，并如图所示通过移除大块进行损伤。右面板：微调模型的生成样本。模型学习到完整脑肿瘤 MRI 图像的统计特性。训练集被缩放到 $64\times64$，但生成图像为 $256\times256$；更高分辨率只是借助级联 IF 模型的能力获得。

> **图 6（原文 Fig. 6）：** 在 3000 样本 CelebA 子集上微调 IF 模型时，生成样本到数据集中最近邻的相似度取值分布。请注意，相似度高于 0.95 大致对应同一人，低于 0.75 通常对应随机人脸。因此普通微调过程（红色）常生成与训练集近乎相同的图像；相反，用受损样本微调（蓝色）明显左移。视觉上我们从未观察到所提过程生成近乎相同的图像，定性结果另见 图 1。

### 5.2 在受损数据上微调基础模型

我们可以用该技术微调基础扩散模型。所有实验中我们使用 Deepfloyd 的 IF 模型 [2]，它是可用的最强大的开源扩散生成模型之一。我们选择它而非 Stable Diffusion [51]，因为它在像素空间工作（因而我们的算法直接适用）。

**记忆。** 我们表明可在有限数据集上微调基础模型而不记忆训练样本。该实验受 Carlini 等 [8]、Somepalli 等 [55] 与 Jagielski 等 [27] 近期工作的启发：这些工作表明扩散生成模型会记忆训练样本，且比 GAN 等先前生成模型记忆得明显更多，尤其在训练数据集较小时。具体地，Somepalli 等 [55] 在 CelebA 的规模为 {300, 3000, 30000} 的子集上训练扩散模型，并表明在 300 或 3000 个样本上训练的模型会记忆并公然复制训练集中的图像。

我们在 CelebA 的 3000 个训练样本子集上微调 IF 模型来复现该训练实验，结果见图 1。对 Deepfloyd IF 在 3000 张图像上的标准微调会记忆样本并产生训练集的近乎精确副本。相反，若在训练前通过删除 80% 像素损伤图像再微调，记忆急剧下降，生成图像与其数据集最近邻之间存在明显差异——尽管训练直到收敛。

为量化记忆，我们沿用 Somepalli 等 [55] 的方法：从每个模型生成 10000 张图像，并用 DINO [9]-v2 [46] 计算与训练图像的 top-1 相似度，结果见图 6。相似度高于 0.95 大致对应同一人，低于 0.75 通常对应随机人脸。标准微调（红色）常生成与训练集近乎相同的图像；而用受损样本微调（蓝色）明显左移。视觉上我们从未观察到所提过程生成近副本——另见 图 1。

我们在完整 CelebA 数据集上以不同损伤水平训练的模型上重复该实验，结果见附录图 8。如图所示，损伤水平越高，相似度分布左移越多，表明记忆越少；但这以性能下降为代价，如表 4 所报告。

**新领域与不同损伤。** 我们表明，给定有限规模的数据集，也可在数小时内、单块 GPU 上把预训练基础模型微调到新领域。图 5 给出在含 155 例脑肿瘤 MRI 图像数据集 [25] 上微调模型的生成样本。如图所示，模型学习到完整脑肿瘤 MRI 图像的统计特性，而训练只用了被随机方块遮挡 25% 区域的脑肿瘤图像。训练集被缩放到 $64\times64$，但生成图像通过级联 Deepfloyd IF 达到 $256\times256$。

**局限。** 本工作有若干局限。第一，生成器质量与损伤水平之间存在折中：损伤越高，生成器记忆训练样本部分的可能性越低，但质量下降；精确刻画该折中仍是开放问题。第二，本工作中我们只用非常简单的近似算法来用训练好的模型估计 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$。第三，除非对数据分布作假设，我们无法对任何训练样本的保护给出严格的隐私声明。我们在附录中表明用复原预言机可精确恢复 $\mathbb E[\mathbf x_0\mid\mathbf x_t]$，但尚无算法实现。最后，我们的方法无法处理同时含噪的测量；未来工作可如 [1] 那样利用 SURE 正则化处理该局限。

## 6 结论与讨论（译者按）

原文为 NeurIPS 2023 会议论文，**未设独立结论节**，以第 5.2 节末尾的 "Limitations" 段收尾。为便于页面结构阅读，此处按原文表述汇总其结论性内容（不新增原文未有的论断）：

我们提出了首个仅用高度受损样本学习未知分布的基于扩散的框架。核心思想是在扩散过程中引入额外测量畸变，并要求模型从进一步受损的图像预测原始受损图像；定理 4.1 表明该训练目标学习的是给定进一步损伤时完整未受损图像的条件期望。在 CelebA-HQ、AFHQ 与 CIFAR-10 上，即便 90% 像素缺失，我们仍能合理地学习未受损图像的分布，并在随机修复逆问题上以单步预测达到与最先进扩散模型相当的水平。用该算法微调基础模型（Deepfloyd IF）可在单 GPU 上数小时内完成，并显著降低对训练集的记忆；损伤水平、训练数据量与生成质量之间存在折中。原文指出的局限包括：高损伤下生成质量下降、仅使用简单近似采样算法、隐私保证需依赖数据分布假设，以及尚不能处理同时含噪的测量。

## 致谢与资助披露

作者感谢 Tom Goldstein 的有益讨论。本研究得到 NSF 基金 CCF 1763702、AF 1901292、CNS 2148141、Tripods CCF 1934932、NSF 机器学习基础研究所（IFML）2019844，得克萨斯高级计算中心（TACC），以及 Western Digital、WNCG IAP、UT Austin 机器学习实验室（MLL）、Cisco 与 Archie Straiton 讲席教授基金的研究捐赠支持。Giannis Daras 得到 Onassis 奖学金（Scholarship ID: F ZS 012-1/2022-2023）、Bodossaki 奖学金与 Leventis 奖学金支持。Aravind Gollakota 完成本工作时在 UT Austin。

## 参考文献（英文原书目）

- [1] Asad Aali, Marius Arvinte, Sidharth Kumar, and Jonathan I Tamir, "Solving inverse problems with score-based generative priors learned from noisy data," arXiv:2305.01166, 2023.
- [2] Stability AI, Deepfloyd IF, https://github.com/deep-floyd/IF, 2023.
- [3] Brian D.O. Anderson, "Reverse-time diffusion equation models," Stochastic Processes and their Applications, vol. 12, no. 3, pp. 313–326, 1982.
- [4] Arpit Bansal, Eitan Borgnia, Hong-Min Chu, Jie S Li, Hamid Kazemi, Furong Huang, Micah Goldblum, Jonas Geiping, and Tom Goldstein, "Cold diffusion: Inverting arbitrary image transforms without noise," arXiv:2208.09392, 2022.
- [5] Joshua Batson and Loic Royer, "Noise2self: Blind denoising by self-supervision," in International Conference on Machine Learning, PMLR, 2019, pp. 524–533.
- [6] Felix JB Bäuerlein and Wolfgang Baumeister, "Towards visual proteomics at high resolution," Journal of Molecular Biology, vol. 433, no. 20, p. 167187, 2021.
- [7] Ashish Bora, Eric Price, and Alexandros G Dimakis, "AmbientGAN: Generative models from lossy measurements," in International Conference on Learning Representations, 2018.
- [8] Nicholas Carlini, Florian Tramèr, Eric Wallace, Matthew Jagielski, Ariel Herbert-Voss, Katherine Lee, Adam Roberts, Tom Brown, Dawn Song, Úlfar Erlingsson, Alina Oprea, and Colin Raffel, "Extracting training data from large language models," in 30th USENIX Security Symposium (USENIX Security 21), 2021, pp. 2633–2650.
- [9] Mathilde Caron, Hugo Touvron, Ishan Misra, Hervé Jégou, Julien Mairal, Piotr Bojanowski, and Armand Joulin, "Emerging properties in self-supervised vision transformers," in Proceedings of the IEEE/CVF International Conference on Computer Vision, 2021, pp. 9650–9660.
- [10] Sitan Chen, Sinho Chewi, Jerry Li, Yuanzhi Li, Adil Salim, and Anru R Zhang, "Sampling is as easy as learning the score: Theory for diffusion models with minimal data assumptions," arXiv:2209.11215, 2022.
- [11] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye, "Diffusion posterior sampling for general noisy inverse problems," in The Eleventh International Conference on Learning Representations, 2023.
- [12] The Event Horizon Telescope Collaboration et al., "First M87 event horizon telescope results. IV. Imaging the central supermassive black hole," The Astrophysical Journal Letters, vol. 875, no. 1, p. L4, Apr. 2019.
- [13] Zhuo-Xu Cui, Chentao Cao, Shaonan Liu, Qingyong Zhu, Jing Cheng, Haifeng Wang, Yanjie Zhu, and Dong Liang, "Self-score: Self-supervised learning on score-based models for MRI reconstruction," arXiv:2209.00835, 2022.
- [14] Giannis Daras, Mauricio Delbracio, Hossein Talebi, Alex Dimakis, and Peyman Milanfar, "Soft diffusion: Score matching with general corruptions," Transactions on Machine Learning Research, 2023.
- [15] Mauricio Delbracio and Peyman Milanfar, "Inversion by direct iteration: An alternative to denoising diffusion for image restoration," arXiv:2303.11435, 2023.
- [16] Jeffrey M Ede, "Deep learning in electron microscopy," Machine Learning: Science and Technology, vol. 2, no. 1, p. 011004, 2021.
- [17] Bradley Efron, "Tweedie's formula and selection bias," Journal of the American Statistical Association, vol. 106, no. 496, pp. 1602–1614, 2011.
- [18] Yonina C. Eldar, "Generalized SURE for exponential families: Applications to regularization," IEEE Transactions on Signal Processing, vol. 57, no. 2, pp. 471–481, 2009.
- [19] Angela F Gao, Oscar Leong, He Sun, and Katherine L Bouman, "Image reconstruction without explicit priors," in ICASSP 2023, IEEE, 2023, pp. 1–5.
- [20] Shi Guo, Zifei Yan, Kai Zhang, Wangmeng Zuo, and Lei Zhang, "Toward convolutional blind denoising of real photographs," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019, pp. 1712–1722.
- [21] Kaiming He, Xinlei Chen, Saining Xie, Yanghao Li, Piotr Dollár, and Ross Girshick, "Masked autoencoders are scalable vision learners," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2022, pp. 16000–16009.
- [22] Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter, "GANs trained by a two time-scale update rule converge to a local Nash equilibrium," in Advances in Neural Information Processing Systems, vol. 30, 2017.
- [23] Jonathan Ho, Ajay Jain, and Pieter Abbeel, "Denoising diffusion probabilistic models," in Advances in Neural Information Processing Systems, vol. 33, 2020, pp. 6840–6851.
- [24] Jonathan Ho, Chitwan Saharia, William Chan, David J Fleet, Mohammad Norouzi, and Tim Salimans, "Cascaded diffusion models for high fidelity image generation," J. Mach. Learn. Res., vol. 23, no. 47, pp. 1–33, 2022.
- [25] "Huggingface Brain Tumor MRI Dataset," 2020. [Online]. Available: https://huggingface.co/datasets/miladfa7/Brain-MRI-Images-for-Brain-Tumor-Detection/
- [26] Niels Bruun Ipsen, Pierre-Alexandre Mattei, and Jes Frellsen, "not-MIWAE: Deep generative modelling with missing not at random data," arXiv:2006.12871, 2020.
- [27] Matthew Jagielski, Om Thakkar, Florian Tramèr, Daphne Ippolito, Katherine Lee, Nicholas Carlini, Eric Wallace, Shuang Song, Abhradeep Thakurta, Nicolas Papernot, and Chiyuan Zhang, "Measuring forgetting of memorized training examples," arXiv:2207.00099, June 2022.
- [28] Ajil Jalal, Marius Arvinte, Giannis Daras, Eric Price, Alexandros G Dimakis, and Jon Tamir, "Robust compressed sensing MRI with deep generative priors," in Advances in Neural Information Processing Systems, vol. 34, 2021, pp. 14938–14954.
- [29] Zahra Kadkhodaie and Eero P Simoncelli, "Solving linear inverse problems using the prior implicit in a denoiser," arXiv:2007.13640, 2020.
- [30] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine, "Elucidating the design space of diffusion-based generative models," arXiv:2206.00364, 2022.
- [31] Tero Karras, Miika Aittala, Samuli Laine, Erik Härkönen, Janne Hellsten, Jaakko Lehtinen, and Timo Aila, "Alias-free generative adversarial networks," in Advances in Neural Information Processing Systems, vol. 34, 2021, pp. 852–863.
- [32] Tero Karras, Samuli Laine, and Timo Aila, "A style-based generator architecture for generative adversarial networks," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019, pp. 4401–4410.
- [33] Tero Karras, Samuli Laine, Miika Aittala, Janne Hellsten, Jaakko Lehtinen, and Timo Aila, "Analyzing and improving the image quality of StyleGAN," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2020, pp. 8110–8119.
- [34] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song, "Denoising diffusion restoration models," in Advances in Neural Information Processing Systems.
- [35] Bahjat Kawar, Noam Elata, Tomer Michaeli, and Michael Elad, "GSURE-based diffusion model training with corrupted data," arXiv:2305.13128, 2023.
- [36] Bahjat Kawar, Gregory Vaksman, and Michael Elad, "SNIPS: Solving noisy inverse problems stochastically," in Advances in Neural Information Processing Systems, vol. 34, 2021, pp. 21757–21769.
- [37] Dongjun Kim, Seungjae Shin, Kyungwoo Song, Wanmo Kang, and Il-Chul Moon, "Soft truncation: A universal training technique of score-based diffusion model for high precision score estimation," in International Conference on Machine Learning, PMLR, 2022, pp. 11201–11228.
- [38] Alexander Krull, Tim-Oliver Buchholz, and Florian Jug, "Noise2void—learning denoising from single noisy images," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019, pp. 2129–2137.
- [39] Jaakko Lehtinen, Jacob Munkberg, Jon Hasselgren, Samuli Laine, Tero Karras, Miika Aittala, and Timo Aila, "Noise2Noise: Learning image restoration without clean data," arXiv:1803.04189, 2018.
- [40] Steven Cheng-Xian Li, Bo Jiang, and Benjamin Marlin, "MisGAN: Learning from incomplete data with generative adversarial networks," arXiv:1902.09599, 2019.
- [41] Hongyu Liu, Bin Jiang, Yi Xiao, and Chao Yang, "Coherent semantic attention for image inpainting," in 2019 IEEE/CVF International Conference on Computer Vision (ICCV), Oct. 2019.
- [42] Pierre-Alexandre Mattei and Jes Frellsen, "MIWAE: Deep generative modelling and imputation of incomplete data sets," in International Conference on Machine Learning, PMLR, 2019, pp. 4413–4423.
- [43] Sachit Menon, Alexandru Damian, Shijia Hu, Nikhil Ravi, and Cynthia Rudin, "PULSE: Self-supervised photo upsampling via latent space exploration of generative models," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2020, pp. 2437–2445.
- [44] Charles Millard and Mark Chiew, "A theoretical framework for self-supervised MR image reconstruction using sub-sampling via variable density Noisier2Noise," IEEE Transactions on Computational Imaging, vol. 9, pp. 707–720, 2023.
- [45] Alex Nichol, Aditya Ramesh, Pamela Mishkin, Prafulla Dariwal, Joanne Jang, and Mark Chen, DALL·E 2 pre-training mitigations, June 2022.
- [46] Maxime Oquab, Timothée Darcet, Théo Moutakanni, Huy Vo, Marc Szafraniec, Vasil Khalidov, Pierre Fernandez, Daniel Haziza, Francisco Massa, Alaaeldin El-Nouby, et al., "DINOv2: Learning robust visual features without supervision," arXiv:2304.07193, 2023.
- [47] Deepak Pathak, Philipp Krahenbuhl, Jeff Donahue, Trevor Darrell, and Alexei A Efros, "Context encoders: Feature learning by inpainting," in Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, 2016, pp. 2536–2544.
- [48] Elad Richardson, Yuval Alaluf, Or Patashnik, Yotam Nitzan, Yaniv Azar, Stav Shapiro, and Daniel Cohen-Or, "Encoding in style: A StyleGAN encoder for image-to-image translation," arXiv:2008.00951, 2020.
- [49] Trevor W Richardson, Wencheng Wu, Lei Lin, Beilei Xu, and Edgar A Bernal, "MCFlow: Monte Carlo flow models for data imputation," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2020, pp. 14205–14214.
- [50] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer, "High-resolution image synthesis with latent diffusion models," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2022, pp. 10684–10695.
- [51] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer, "High-resolution image synthesis with latent diffusion models," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2022, pp. 10684–10695.
- [52] Chitwan Saharia, William Chan, Saurabh Saxena, Lala Li, Jay Whang, Emily L Denton, Kamyar Ghasemipour, Raphael Gontijo Lopes, Burcu Karagol Ayan, Tim Salimans, et al., "Photorealistic text-to-image diffusion models with deep language understanding," in Advances in Neural Information Processing Systems, vol. 35, 2022, pp. 36479–36494.
- [53] Chitwan Saharia, William Chan, Saurabh Saxena, Lala Li, Jay Whang, Emily L Denton, Kamyar Ghasemipour, Raphael Gontijo Lopes, Burcu Karagol Ayan, Tim Salimans, et al., "Photorealistic text-to-image diffusion models with deep language understanding," in Advances in Neural Information Processing Systems, vol. 35, 2022, pp. 36479–36494.
- [54] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli, "Deep unsupervised learning using nonequilibrium thermodynamics," in International Conference on Machine Learning, PMLR, 2015, pp. 2256–2265.
- [55] Gowthami Somepalli, Vasu Singla, Micah Goldblum, Jonas Geiping, and Tom Goldstein, "Diffusion art or digital forgery? Investigating data replication in diffusion models," arXiv:2212.03860, 2022.
- [56] Jiaming Song, Chenlin Meng, and Stefano Ermon, "Denoising diffusion implicit models," arXiv:2010.02502, 2020.
- [57] Yang Song and Stefano Ermon, "Generative modeling by estimating gradients of the data distribution," in Advances in Neural Information Processing Systems, vol. 32, 2019.
- [58] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole, "Score-based generative modeling through stochastic differential equations," arXiv:2011.13456, 2020.
- [59] Julián Tachella, Dongdong Chen, and Mike Davies, "Unsupervised learning from incomplete measurements for inverse problems," arXiv:2201.12151, 2022.
- [60] Singanallur V Venkatakrishnan, Charles A Bouman, and Brendt Wohlberg, "Plug-and-play priors for model based reconstruction," in 2013 IEEE Global Conference on Signal and Information Processing, IEEE, 2013, pp. 945–948.
- [61] Pascal Vincent, "A connection between score matching and denoising autoencoders," Neural Computation, vol. 23, no. 7, pp. 1661–1674, 2011.
- [62] Ge Wang, Jong Chul Ye, and Bruno De Man, "Deep learning for tomographic image reconstruction," Nature Machine Intelligence, vol. 2, no. 12, pp. 737–748, 2020.
- [63] Jiahui Yu, Zhe Lin, Jimei Yang, Xiaohui Shen, Xin Lu, and Thomas Huang, "Free-form image inpainting with gated convolution," in 2019 IEEE/CVF International Conference on Computer Vision (ICCV), Oct. 2019.
- [64] Jiahui Yu, Zhe Lin, Jimei Yang, Xiaohui Shen, Xin Lu, and Thomas S Huang, "Free-form image inpainting with gated convolution," in Proceedings of the IEEE/CVF International Conference on Computer Vision, 2019, pp. 4471–4480.
- [65] Yide Zhang, Yinhao Zhu, Evan Nichols, Qingfei Wang, Siyuan Zhang, Cody Smith, and Scott Howard, "A Poisson-Gaussian denoising dataset with real fluorescence microscopy images," in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019, pp. 11710–11718.

> **原文疑点：** 参考文献 [50] 与 [51]、[52] 与 [53] 为同一条目重复著录（均为 Rombach 等 Latent Diffusion 与 Saharia 等 Imagen），原文正文分别引用 [50]/[51] 与 [52]/[53]；此处按原文编号照录并加注，未合并编号。

## 附录 A 证明

**定理 4.1 的证明。** 设 $\mathbf h_{\theta^\ast}$ 是式 3.2 的极小化者，简记

$$
\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)=\mathbf h_{\theta^\ast}\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)-\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]
$$

为 $\mathbf h_{\theta^\ast}$ 与所称最优解之差。下面证明 $\mathbf f$ 必须恒为零。首先，通过加减 $\mathbf A\mathbb E[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}]$，可把 $\theta=\theta^\ast$ 时式 3.2 的目标值展开为

$$
J^{\mathrm{corr}}(\theta^\ast)=\mathbb E_{\mathbf x_0,\mathbf x_t,\mathbf A,\tilde{\mathbf A}}\left\|\left(\mathbf A\mathbf x_0-\mathbf A\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]\right)-\mathbf A\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)\right\|^2
$$

$$
=\mathbb E\left\|\mathbf A\mathbf x_0-\mathbf A\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]\right\|^2+\mathbb E\left\|\mathbf A\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)\right\|^2-2\mathbb E\left[\left(\mathbf A\mathbf x_0-\mathbf A\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]\right)^T\mathbf A\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)\right].
$$

其中第一项是不可约误差，第三项由期望的塔性质消失：

$$
\mathbb E_{\mathbf x_0,\mathbf x_t,\mathbf A,\tilde{\mathbf A}}\left[\left(\mathbf x_0-\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]\right)^T\mathbf A^T\mathbf A\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)\right]
$$

$$
=\mathbb E_{\mathbf A,\tilde{\mathbf A},\tilde{\mathbf A}\mathbf x_t}\left[\left(\mathbb E_{\mathbf x_0\mid\mathbf A,\tilde{\mathbf A},\tilde{\mathbf A}\mathbf x_t}\left[\mathbf x_0-\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]\right]\right)^T\mathbf A^T\mathbf A\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)\right]=0.
$$

因此 $J^{\mathrm{corr}}(\theta^\ast)$ 中真正依赖参数值 $\theta^\ast$ 的只有第二项。下面表明第二项可被消为零，且这恰在 $\mathbf f$ 恒为零时发生：

$$
\mathbb E\left\|\mathbf A\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)\right\|^2=\mathbb E\left[\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)^T\mathbb E_{\mathbf A\mid\mathbf x_0,\mathbf x_t,\tilde{\mathbf A}}\left[\mathbf A^T\mathbf A\right]\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)\right]
$$

$$
=\mathbb E_{\mathbf x_0,\mathbf x_t,\tilde{\mathbf A}}\left[\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)^T\mathbb E_{\mathbf A\mid\tilde{\mathbf A}}\left[\mathbf A^T\mathbf A\right]\mathbf f\left(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right)\right].
$$

对每个 $\tilde{\mathbf A}$ 与 $\mathbf x_0,\mathbf x_t$，由假设 $\mathbb E_{\mathbf A\mid\tilde{\mathbf A}}[\mathbf A^T\mathbf A]$ 满秩，故内层二次型在 $\mathbf f(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A})=\mathbf 0$ 时最小。进一步，该项整体消失恰在该式对支撑中每个 $\tilde{\mathbf A}$ 与 $\mathbf x_0,\mathbf x_t$ 成立时，这意味着 $\mathbf f$ 恒为零。

**推论 A.1（修复噪声模型）。** 考虑如下修复噪声模型：$\mathbf A\in\mathbb R^{n\times n}$ 为对角矩阵，每个元素 $A_{ii}\sim\mathrm{Ber}(1-p)$（$p>0$，各 $i$ 独立）；额外噪声由抽取 $\tilde{\mathbf A}\mid\mathbf A$ 生成，使得 $\tilde{\mathbf A}_{ii}=A_{ii}\mathrm{Ber}(1-\delta)$（小 $\delta>0$，各 $i$ 独立）。则式 3.2 中目标的唯一极小化者为 $\mathbf h_{\theta^\ast}(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A})=\mathbb E[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}]$。

**证明。** 由定理 4.1，只需证明对支撑中任意 $\tilde{\mathbf A}$，$\mathbb E_{\mathbf A\mid\tilde{\mathbf A}}[\mathbf A^T\mathbf A]$ 满秩。固定 $\tilde{\mathbf A}$ 的任一实现，它是仅含 0 与 1 的对角矩阵。对 $\tilde{\mathbf A}_{ii}=1$ 的索引 $i$，给定 $\tilde{\mathbf A}$ 时任意抽取的 $\mathbf A$ 都有 $A_{ii}=1$，即 $\Pr(A_{ii}=1\mid\tilde{\mathbf A}_{ii}=1)=1$。对 $\tilde{\mathbf A}_{ii}=0$ 的索引 $i$，由贝叶斯公式

$$
\Pr\left(A_{ii}=1\mid\tilde{\mathbf A}_{ii}=0\right)=\frac{\Pr\left(A_{ii}=1,\tilde{\mathbf A}_{ii}=0\right)}{\Pr\left(A_{ii}=0,\tilde{\mathbf A}_{ii}=0\right)+\Pr\left(A_{ii}=1,\tilde{\mathbf A}_{ii}=0\right)}=\frac{(1-p)\delta}{(1-p)\delta+p}=:q.
$$

因此 $\mathbb E_{\mathbf A\mid\tilde{\mathbf A}}[\mathbf A^T\mathbf A]=\mathbb E_{\mathbf A\mid\tilde{\mathbf A}}[\mathbf A]$ 是对角矩阵，在 $\tilde{\mathbf A}_{ii}=1$ 处为 1、在 $\tilde{\mathbf A}_{ii}=0$ 处为 $q$；由于 $q>0$，它显然满秩。

**推论 A.2（高斯测量噪声模型）。** 考虑如下噪声模型：我们仅观测真值的 $m$ 个独立高斯测量，然后进一步省略其中一个测量。$\mathbf A\in\mathbb R^{m\times n}$ 由 $m$ 行独立抽取自 $\mathcal N(\mathbf 0,\mathbf I_n)$ 构成，$\tilde{\mathbf A}\in\mathbb R^{m\times n}$ 在给定 $\mathbf A$ 时通过置零最后一行构造。则式 3.2 中目标的唯一极小化者为 $\mathbf h_{\theta^\ast}(\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A})=\mathbb E[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}]$。

**证明。** 同样由定理 4.1，只需证明对支撑中任意 $\tilde{\mathbf A}$，$\mathbb E_{\mathbf A\mid\tilde{\mathbf A}}[\mathbf A^T\mathbf A]$ 满秩。固定 $\tilde{\mathbf A}$ 的任一实现，其形式为 $\tilde{\mathbf A}=[\mathbf a_1^T;\dots;\mathbf a_{m-1}^T;\mathbf 0^T]$。则显然给定 $\tilde{\mathbf A}$ 时 $\mathbf A$ 的分布为 $\mathbf A\mid\tilde{\mathbf A}=[\mathbf a_1^T;\dots;\mathbf a_{m-1}^T;\mathbf b_m^T]$，其中 $\mathbf b_m\sim\mathcal N(\mathbf 0,\mathbf I_n)$。这里 $\mathbf b_m$ 完全独立地抽取自 $\mathcal N(\mathbf 0,\mathbf I_n)$。初等运算可得

$$
\mathbb E_{\mathbf A\mid\tilde{\mathbf A}}\left[\mathbf A^T\mathbf A\right]=\mathbb E_{\mathbf b_m\sim\mathcal N(\mathbf 0,\mathbf I_n)}\left[\tilde{\mathbf A}^T\tilde{\mathbf A}+\mathbf b_m\mathbf b_m^T\right]=\tilde{\mathbf A}^T\tilde{\mathbf A}+\mathbf I_n,
$$

它显然满秩（实际上为半正定且特征值严格为正）。

### A.1 归约

本节论证：若存在算法能从独立同分布样本 $(\mathbf A\mathbf x_0,\mathbf A)$（$\mathbf A\sim p(\mathbf A)$、$\mathbf x_0\sim p_0(\mathbf x_0)$）恢复目标分布 $p_0(\mathbf x_0)$，则存在算法无需样本访问、而用预言机（给定 $t$、$\mathbf x$ 与支撑中的 $\mathbf A$，返回 $\mathbb E[\mathbf x_0\mid\mathbf A\mathbf x_t]$）恢复 $p_0(\mathbf x_0)$。

事实上，对任意 $\mathbf A$，Chen 等 [10] 表明在数据分布 $p_0(\mathbf x_0)$ 的某些最小假设下（见 [10, 假设 1–3]），可仅凭对任意 $t$ 与 $\mathbf x$ 的 $\mathbb E[\mathbf A\mathbf x_0\mid\mathbf A\mathbf x_t]$ 访问恢复 $\mathbf A\mathbf x_0$ 的分布。使用我们的预言机与该定理，可对支撑中所有 $\mathbf A$ 恢复 $\mathbf A\mathbf x_0$ 的分布。通过这些分布采样，也可获得 $\mathbf A\sim p(\mathbf A)$、$\mathbf x_0\sim p_0(\mathbf x_0)$ 的 $\mathbf A\mathbf x_0$ 样本。因此若这些样本足以恢复 $p_0(\mathbf x_0)$，则拥有这些条件期望的预言机同样足够。

该直觉可形式化如下。固定损伤矩阵上的分布 $p_{\mathbf A}(\mathbf A)$。对分布 $p_0(\mathbf x_0)$，记 $\mathrm{corrupt}(p_{\mathbf A},p_0)$ 为 $(\mathbf A,\mathbf A\mathbf x_0)$ 对的分布，其中 $\mathbf A\sim p_{\mathbf A}(\mathbf A)$、$\mathbf x_0\sim p_0(\mathbf x_0)$。我们说可由随机损伤 $\mathbf A\sim p_{\mathbf A}(\mathbf A)$ 重建 $p_0(\mathbf x_0)$，若：对任意满足 Chen 等 [10] 假设 1–3 的两个分布 $p_0(\mathbf x_0)$ 与 $p_0'(\mathbf x_0')$，由 $\mathrm{corrupt}(p_{\mathbf A},p_0)=\mathrm{corrupt}(p_{\mathbf A},p_0')$ 可推出 $p_0=p_0'$。类似地，我们说可由给定 $\mathbf A\sim p(\mathbf A)$ 的条件期望重建 $p_0(\mathbf x_0)$，若：对任意满足 [10] 假设 1–3 的 $p_0$ 与 $p_0'$，若对所有 $\mathbf x,t$ 与 $p_{\mathbf A}$ 支撑中的 $\mathbf A$ 有

$$
\mathbb E_{(\mathbf x_0,\mathbf x_t)\sim p_{0,t}}\left[\mathbf x_0\mid\mathbf A\mathbf x_t=\mathbf x\right]=\mathbb E_{(\mathbf x_0',\mathbf x_t')\sim p_{0,t}'}\left[\mathbf x_0'\mid\mathbf A\mathbf x_t'=\mathbf x\right] \tag{A.1}
$$

则 $p_0=p_0'$。这里 $p_{0,t}(\mathbf x_0,\mathbf x_t)$ 由采样 $\mathbf x_0\sim p_0$ 与 $\mathbf x_t=\mathbf x_0+\sigma_t\boldsymbol\eta$（$\boldsymbol\eta\sim\mathcal N(\mathbf 0,\mathbf I)$）得到；$p_{0,t}'$ 同理。我们给出如下引理。

**引理 A.3。** 固定分布 $p_{\mathbf A}(\mathbf A)$。若可由随机损伤 $\mathbf y_0=\mathbf A\mathbf x_0$（$\mathbf A\sim p_{\mathbf A}(\mathbf A)$）重建 $p_0(\mathbf x_0)$，则可由计算条件期望 $\mathbb E[\mathbf x_0\mid\mathbf A\mathbf x_t,\mathbf A]$（$\mathbf A\sim p_{\mathbf A}(\mathbf A)$、$\mathbf x_t=\mathbf x_0+\sigma_t\boldsymbol\eta$）的预言机重建 $p_0(\mathbf x_0)$。

**证明。** 假设可由随机损伤 $\mathbf A\sim p_{\mathbf A}(\mathbf A)$ 重建 $p_0(\mathbf x_0)$，我们要证可由给定 $\mathbf A\sim p_{\mathbf A}(\mathbf A)$ 的条件期望重建 $p_0(\mathbf x_0)$。为此令 $p_0(\mathbf x_0)$ 与 $p_0'(\mathbf x_0')$ 为满足 Chen 等 [10] 假设 1–3 的两个分布，并假设 (A.1) 成立，我们要证 $p_0=p_0'$。固定 $p_{\mathbf A}$ 支撑中的某个 $\mathbf A$。由 Chen 等 [10]，存在算法仅凭 $\mathbb E[\mathbf A\mathbf x_0\mid\mathbf A\mathbf x_t,\mathbf A]$ 访问即可从 $\mathbf A\mathbf x_0$（$\mathbf x_0\sim p_0$）的分布采样；同理存在算法仅凭 $\mathbb E[\mathbf A\mathbf x_0'\mid\mathbf A\mathbf x_t',\mathbf A]$ 访问即可从 $\mathbf A\mathbf x_0'$ 的分布采样。由于假设这两个条件期望相同，$\mathbf A\mathbf x_0$ 的分布等于 $\mathbf A\mathbf x_0'$ 的分布，从而 $\mathrm{corrupt}(p_{\mathbf A},p_0)=\mathrm{corrupt}(p_{\mathbf A},p_0')$。由可由随机损伤重建 $p_0$ 的假设即得 $p_0=p_0'$。证毕。

## 附录 B 更广泛影响与风险

生成模型总体上可能以多种形式对社会产生深远影响，并伴随若干相关风险 [43, 32, 33, 31]。除其他潜在应用外，它们可被用于制造欺骗性图像与延续社会偏见。据我们所知，本文并未放大这些既有风险。关于文中 MRI 结果，我们要澄清：我们不主张此类结果具有诊断价值。该实验仅作为玩具式演示，说明用受损样本学习 MRI 扫描分布可能可行。在我们的算法进入临床试验之前，必须与放射科医生合作开展大量进一步研究。最后，我们要再次强调：尽管我们的方法看起来缓解了生成模型中的记忆问题，但除非对数据分布作假设，我们无法保证任何训练样本的隐私。因此我们强烈建议，在该研究课题得到进一步研究之前，不要将该算法用于隐私重要的应用。

## 附录 C 训练细节

我们开源代码与模型以促进该领域的进一步研究：https://github.com/giannisdaras/ambient-diffusion。

本文所有实验中，我们都沿通道维把图像与掩码拼接，以把网络条件化于测量算子，即修复掩码作为额外输入通道。

**从头训练的模型。** 我们在 CelebA-HQ、AFHQ 与 CIFAR-10 上以不同损伤水平从头训练模型。前两个数据集分辨率设为 $64\times64$，CIFAR-10 训练于 $32\times32$。我们从 EDM [30] 官方实现出发并作必要修改。架构上唯一改动是把卷积层替换为已知在修复问题上表现良好的门控卷积 [64]。我们观察到该改动显著稳定了训练，尤其在高损伤区间。与 EDM 一样，我们使用 DDPM++ [37] 的架构。

为避免额外设计复杂度，我们尽量让超参数接近 EDM 论文。我们观察到在高损伤水平下加入梯度裁剪有用，否则训练常会发散。所有实验使用最大范数为 1.0 的梯度裁剪。我们强调，遗憾的是即便有梯度裁剪，高损伤水平（$p\ge0.8$）的训练有时仍会发散；每次发生时我们从更早的检查点重启训练。其余超参数见表 2。

> **表 2（原文 Table 2）：** 训练超参数。

| 数据集 | 迭代数 | 批大小 | 学习率 | SDE | $p$ | $\delta$ | 增广概率 | 通道乘子 | Dropout |
|---|---|---|---|---|---|---|---|---|---|
| CIFAR-10 | 200000 | 512 | 1e-3 | VP | {0.2, 0.4, 0.6, 0.8} | 0.1 | 0.12 | (1, 1, 1, 1) | 0.13 |
| AFHQ | 200000 | 256 | 2e-4 | VP | {0.2, 0.4, 0.6, 0.8, 0.9} | 0.1 | 0.15 | (1, 2, 2, 2) | 0.25 |
| CelebA-HQ（$p\le0.8$） | 200000 | 256 | 2e-4 | VP | {0.2, 0.6, 0.8} | 0.1 | 0.15 | (1, 2, 2, 2) | 0.1 |
| CelebA-HQ（$p=0.9$） | 200000 | 256 | 2e-4 | VP | 0.9 | 0.3 | 0.15 | (1, 2, 2, 2) | 0.1 |

（原文表 2 中 $\delta$、增广概率与通道乘子存在跨行合并单元格；本页按合并关系展开为逐数据集行。）

从头训练扩散模型计算量相当大。我们所有模型训练 200000 次迭代：CIFAR-10 模型各需在 6 块 A100 GPU 上约 2 天；AFHQ 与 CelebA-HQ 模型各需约 6 天。这些数字与 EDM 论文报告的性能大致匹配，表明我们在矩阵 $\mathbf A$ 上所需的额外损伤并未增加训练时间。

由于训练这些模型的计算复杂度较高，我们无法充分优化超参数，例如额外损伤中的 $\delta$ 概率。对更高损伤（如 $p=0.9$），我们注意到必须增大 $\delta$ 才能让模型学会在未观测像素上表现良好。CIFAR-10 上小规模消融见 表 7。

**微调 Deepfloyd 的 IF。** 我们通过 `diffusers` 库访问 Deepfloyd 的 IF [2] 模型。该模型是级联扩散模型 [24]：流水线第一部分是输出 $64\times64$ 分辨率图像的文本条件扩散模型；接下来有两个同时以输入文本与上一阶段低分辨率输出为条件的扩散模型；第一个上采样模块把分辨率从 $64\times64$ 提高到 $256\times256$，最后一个从 $256\times256$ 提高到 $1024\times1024$。

为降低微调计算需求，我们只微调处理 $64\times64$ 分辨率图像的第一个文本条件扩散模型；微调完成后，再使用完整模型生成高分辨率图像。

微调时批大小设为 32、学习率 $3\mathrm e-6$，最多训练 15000 步，并保留在我们进一步损伤的像素上误差最低的检查点。为进一步降低计算需求，我们使用 8 位 Adam 优化器并以半精度训练。

CelebA 微调实验中我们设 $\delta=0.1$、$p=0.8$，实验了完整训练集、规模 3000 的子集（见 图 1）与规模 300 的子集。对仅用 300 个高度受损样本训练的模型，我们未观察到记忆，但样本质量很低。直观上，我们的算法提供了控制记忆与保真度折中的方式；充分探索该折中是非常有前景的未来方向。MRI 实验中我们使用两个各遮挡 25% 图像的非重叠块，并在其中一个上评估模型。

我们所有微调实验可在数小时内完成：15000 次迭代在单块 A100 GPU 上约需 10 小时，但最佳检查点通常在训练早期即可获得。

## 附录 D 评估细节

**FID 评估。** 我们的 FID [22] 分数相对于训练集计算，这是标准做法，例如见 [23, 30, 58]。对从头训练的每个模型，我们用种子 0–49999 生成 50000 张图像，随后使用 EDM [30] 论文官方实现的代码计算 FID。

## 附录 E 附加实验

### E.1 含噪测量下的复原性能

在正文表 1 中，我们比较了我们的模型与普通扩散模型（用未受损图像训练）的复原性能，任务是随机修复，因为用我们的模型求解该逆问题很直接。用训练好的生成模型求解任意（线性或非线性）逆问题可能可行，但我们把该方向留作未来工作。

本节进一步比较我们的模型（用随机修复图像训练）在含噪测量修复任务上的表现。具体地，我们希望给定测量 $\mathbf y_t=\mathbf A(\mathbf x_0+\sigma_{y_t}\boldsymbol\eta)$（$\boldsymbol\eta\sim\mathcal N(\mathbf 0,\mathbf I)$）预测 $\mathbf x_0$。如全文一样，假设掩码矩阵 $\mathbf A$ 已知。根据式 4.1，我们学到的正是 $\mathbf h_\theta(\mathbf y_t,\mathbf A,t)=\mathbb E[\mathbf x_0\mid\mathbf A\mathbf x_t=\mathbf y_t,\mathbf A]$，因此可用我们的模型一次预测求解该问题。

我们使用 EDM [30] 在 AFHQ 上训练的最先进模型作为基线（与正文相同）。要用该预训练模型求解含噪随机修复逆问题，需要重建算法；我们再次实验 DPS 与 DDRM，二者都能处理测量含噪的逆问题。结果见表 3。如表所示，我们的模型显著优于使用 DDRM 重建算法的 EDM 模型，并与使用 DPS 重建算法的 EDM 模型表现相当。

> **表 3（原文 Table 3）：** 我们的模型（在受损数据上训练）与最先进扩散模型在 AFHQ 上求解含噪随机修复逆问题的比较。

| 数据集 | 损伤概率 | 测量噪声（$\sigma_{y_0}$） | 方法 | LPIPS | PSNR | NFE |
|---|---|---|---|---|---|---|
| AFHQ | 0.4 | 0.05 | 本文 | 0.0861 | 29.46 | **1** |
| AFHQ | 0.4 | 0.05 | DPS | **0.0846** | **29.83** | 100 |
| AFHQ | 0.4 | 0.05 | DDRM | 0.2061 | 24.47 | 35 |
| AFHQ | 0.4 | 0.05 | DDRM | 0.1739 | 25.38 | 99 |
| AFHQ | 0.4 | 0.05 | DDRM | 0.1677 | 25.58 | 199 |
| AFHQ | 0.6 | 0.05 | 本文 | 0.1031 | 27.40 | **1** |
| AFHQ | 0.6 | 0.05 | DPS | **0.0949** | **27.92** | 100 |
| AFHQ | 0.6 | 0.05 | DDRM | 0.4066 | 18.73 | 35 |
| AFHQ | 0.6 | 0.05 | DDRM | 0.3626 | 19.49 | 99 |
| AFHQ | 0.6 | 0.05 | DDRM | 0.3506 | 19.70 | 199 |
| AFHQ | 0.8 | 0.05 | 本文 | 0.1792 | **23.21** | **1** |
| AFHQ | 0.8 | 0.05 | DPS | **0.1778** | 23.01 | 100 |
| AFHQ | 0.8 | 0.05 | DDRM | 0.5879 | 13.65 | 35 |
| AFHQ | 0.8 | 0.05 | DDRM | 0.5802 | 13.99 | 99 |
| AFHQ | 0.8 | 0.05 | DDRM | 0.5753 | 14.09 | 199 |

### E.2 附加比较

我们补充与 MisGAN [40] 在 CIFAR-10 与 CelebA 上的比较。MisGAN 把 AmbientGAN 推广到测量算子未知的情形：作者提出额外的生成器，用对抗训练学习对损伤机制建模。结果见表 4。

> **表 4（原文 Table 4）：** 与 MisGAN 的比较。

| 数据集 | 损伤概率 | 方法 | FID |
|---|---|---|---|
| CelebA | 0.6 | MisGAN | 37.42 |
| CelebA | 0.6 | 环境扩散 | **6.08** |
| CelebA | 0.8 | MisGAN | 100.0 |
| CelebA | 0.8 | 环境扩散 | **11.19** |
| CelebA | 0.9 | MisGAN | 141.11 |
| CelebA | 0.9 | 环境扩散 | **25.53** |
| CIFAR-10 | 0.4 | MisGAN | 18.95 |
| CIFAR-10 | 0.4 | 环境扩散 | **18.85** |
| CIFAR-10 | 0.6 | MisGAN | 49.30 |
| CIFAR-10 | 0.6 | 环境扩散 | **28.88** |
| CIFAR-10 | 0.8 | MisGAN | 111.50 |
| CIFAR-10 | 0.8 | 环境扩散 | **46.27** |

### E.3 与监督方法的比较

为完整起见，我们补充与 Masked AutoEncoder [21] 的比较，后者是求解随机修复问题的先进监督方法。该论文官方仓库不含在 AFHQ 上训练的模型，我们与在 iNaturalist 数据集上训练的可用模型比较，这是我们能找到的语义上最接近的数据集。我们强调该模型训练时可访问未受损图像。结果见表 5。如表所示，我们的方法与 DPS 优于该监督基线。我们强调，该实验仅为完整性而纳入，并不排除随机修复存在更优监督替代方案的可能。

> **表 5（原文 Table 5）：** 与 MAE [21]（求解随机修复复原任务的先进监督方法）的比较。

| 损伤概率 | 方法 | LPIPS | PSNR | NFE |
|---|---|---|---|---|
| 0.4 | 本文 | 0.0304 | **33.27** | **1** |
| 0.4 | DPS | **0.0203** | **34.06** | 100 |
| 0.4 | MAE | 0.0752 | 28.88 | 1 |
| 0.6 | 本文 | 0.0628 | **29.46** | **1** |
| 0.6 | DPS | **0.0518** | **30.03** | 100 |
| 0.6 | MAE | 0.0995 | 25.89 | 1 |
| 0.8 | 本文 | 0.1245 | **25.37** | **1** |
| 0.8 | DPS | **0.1078** | 25.30 | 100 |
| 0.8 | MAE | 0.1794 | 22.01 | 1 |

### E.4 采样器消融

由引理 A.3，若可用受损样本学习 $p_0(\mathbf x_0)$，则也可用我们学到的模型从 $p_0(\mathbf x_0)$ 采样。尽管这样的算法存在，我们并不知道它是什么。

正文中我们提出了一个简单的采样想法——固定掩码采样器。它在整个采样过程中固定一个掩码，因此用该算法采样等价于先从 $p_0(\mathbf x_0)$ 的边缘采样部分像素，再在最后一步用最佳重建（条件期望）补齐其余像素。该简单采样器表现非常出色，我们在正文全程使用它。

**带重建引导的采样。** 在固定掩码采样器中，任意时刻的预测都是当前值与预测去噪图像的凸组合；当 $t\to0$ 时 $\gamma_t\to0$。因此对掩蔽像素，固定掩码采样器输出的是在给定观测像素时其取值的条件期望，随着损伤增大这会导致平均效应。为纠正该问题，我们在更新中加入一项：重建引导项。先前采样器的问题在于模型从未见过某些像素；我们希望用不同掩码评估模型，但模型在不同掩码下输出的去噪图像可能差异很大。为处理该问题，我们加入额外项，强制更新使重建图像保持一致。带重建引导的采样器更新变为

$$
\mathbf x_{t-\Delta t}=\underbrace{\frac{\sigma_{t-\Delta t}}{\sigma_t}}_{\gamma_t}\mathbf x_t+\underbrace{\frac{\sigma_t-\sigma_{t-\Delta t}}{\sigma_t}}_{1-\gamma_t}\left(\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]-\frac{w_t}{2}\nabla_{\mathbf x_t}\mathbb E_{\tilde{\mathbf A}'\sim p(\tilde{\mathbf A}')}\left[\left\|\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}\mathbf x_t,\tilde{\mathbf A}\right]-\mathbb E\left[\mathbf x_0\mid\tilde{\mathbf A}'\mathbf x_t,\tilde{\mathbf A}'\right]\right\|^2\right]\right). \tag{E.1}
$$

该采样器受 Imagen [53] 中重建引导项启发。我们在表 6 中消融该替代采样器的性能。对重建引导采样器，我们每次随机选取四个掩码，并在固定掩码采样器上加入额外更新项，确保其预测与使用另外四个掩码（关于当前迭代 $\mathbf x_t$ 有不同上下文）的预测相差不大。引导参数 $w_t$ 设为 $5\mathrm e-4$。如表所示，该采样器改善了性能，尤其在低损伤概率下，此时额外掩码为仅给定单一固定掩码的预测提供了关于当前状态的大量信息；但更高损伤下其收益消失。鉴于二者表现相当，而重建引导采样器计算密集得多（每个额外掩码每步需一次额外预测），我们选择在正文所有实验中使用固定掩码采样器。

> **表 6（原文 Table 6）：** 固定掩码采样器与重建引导采样器的比较。

| 采样器类型 | 损伤概率 | FID | Inception Score |
|---|---|---|---|
| 固定掩码 | 0.2 | 11.70 | 7.97 |
| 固定掩码 | 0.4 | 18.85 | 7.45 |
| 固定掩码 | 0.6 | 28.88 | 6.88 |
| 固定掩码 | 0.8 | 46.27 | 6.14 |
| 重建引导 | 0.2 | **11.59** | **8.01** |
| 重建引导 | 0.4 | **18.52** | **7.51** |
| 重建引导 | 0.6 | 28.90 | **6.91** |
| 重建引导 | 0.8 | 46.31 | 6.13 |

### E.5 $\delta$ 消融

我们方法的一个超参数是 $\delta$，控制额外损伤强度。对随机修复，$\delta$ 需为正才能学会为缺失像素预测干净图像；另一方面，$\delta$ 增大时预测任务难度也增大（最终控制生成性能）。表 7 给出 CIFAR-10 上不同 $\delta$ 取值下的性能变化。推荐设置为 $\delta=0.1$，但对 $\delta$ 做超参数搜索可能带来性能提升。

> **表 7（原文 Table 7）：** $\delta$ 取值的消融。

| $p$ | $\delta$ | Inception Score |
|---|---|---|
| 0.4 | 0.0 | 6.70（来自图 5） |
| 0.4 | 0.1 | 7.45（来自图 6） |
| 0.4 | 0.4 | 6.95（为 rebuttal 新增的实验） |

> **原文疑点：** 表 7 备注中"来自图 5""来自图 6"的图号与正文图号（图 3 为 CIFAR-10 损伤曲线、图 4 为 FID/IS 汇总）不匹配，疑为旧版本图号残留；此处按原文照录并加注。

### E.6 附加图

图 7 给出 AFHQ 受损图像的重建，其中第 3、4 列为在干净数据上训练的 EDM AFHQ 模型，第 5 列为在受损数据上训练的我们的模型。复原任务为概率 $p=0.8$ 的随机修复，最后两行还含测量噪声 $\sigma_{y_0}=0.05$。

> **原文疑点：** E.6 节正文称图 7 的复原任务为 $p=0.8$ 的随机修复，而图 7 图注写的是 $p=0.6$；两处不一致，此处按原文分别照录并加注。

图 8 重复正文图 6 的实验，但针对在完整 CelebA 数据集上以不同损伤水平训练的模型。如图所示，损伤水平升高使相似度分布明显左移，表明记忆减少；这以性能下降为代价，如表 4 所报告。

> **图 7（原文 Fig. 7）：** 用干净数据训练的 EDM AFHQ 模型（第 3、4 列）与在受损数据上训练的我们的模型（第 5 列）对 AFHQ 受损图像的重建。复原任务为概率 $p=0.6$ 的随机修复，最后两行还含测量噪声 $\sigma_{y_0}=0.05$。

> **图 8（原文 Fig. 8）：** 在完整 CelebA 数据集上以不同损伤水平微调 IF 模型时，生成样本到数据集最近邻的相似度分布。相似度高于 0.95 大致对应同一人，低于 0.75 对应近乎随机人脸。损伤水平升高使分布明显左移，表明记忆减少。

在其余页面中，我们给出不同损伤水平 $p$ 下模型的非精选无条件生成结果。

> **图 9（原文 Fig. 9）：** 左列：不同损伤水平 $p$ 下随机修复的 CelebA-HQ 训练数据集（存活概率为 $(1-p)\cdot(1-\delta)$）。右列：用相应参数训练的模型的无条件生成。如图所示，提高损伤水平会使生成略有变差，但即便每张训练图像平均 93% 像素缺失，我们仍能相当好地学习分布。

> **图 10（原文 Fig. 10）：** 左列：不同损伤水平 $p$ 下随机修复的 AFHQ 训练数据集（存活概率为 $(1-p)\cdot(1-\delta)$）。右列：用相应参数训练的模型的无条件生成。如图所示，提高损伤水平会使生成略有变差，但即便每张训练图像平均 91% 像素缺失，我们仍能相当好地学习分布。

> **图 11（原文 Fig. 11）：** 左列：不同损伤水平 $p$ 下随机修复的 CIFAR-10 训练数据集（存活概率为 $(1-p)\cdot(1-\delta)$）。右列：用相应参数训练的模型的无条件生成。如图所示，提高损伤水平会使生成略有变差，但在高损伤下我们仍能相当好地学习分布。

## 图注与表注索引

本页图 1–11 的中文图注与表 1–7 的表注均按原文出现位置内联在正文与附录中（图 1–6 与表 1 见正文第 1、3、5 节，图 7–11 与表 2–7 见附录 A–E 及原文第 22–26 页生成样例页），此处不重复罗列。原文为 NeurIPS 会议单栏排版，图以浮动方式放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页为 NeurIPS 2023 会议论文集版本（26 页）的中文译稿：摘要、第 1–5 节正文、图 1–6 与表 1、局限、致谢与资助披露、参考文献 65 条英文原条目（按原编号）、附录 A–E（定理 4.1 及推论 A.1/A.2 证明、引理 A.3 与归约、更广泛影响、训练细节与表 2、评估细节、附加实验与表 3–7、图 7–11）。公式与表格已对照 PDF 渲染页核对：式 (2.1)–(2.5)、(3.1)–(3.3)、(4.1)、(A.1)、(E.1) 逐式核对；表 1 用第 8 页渲染图逐格核对（CelebA-HQ/AFHQ 各三档损伤、Ours/DPS/DDRM 全部数值一致），表 2 用第 18 页放大截图逐格核对（含跨行合并单元格的展开说明），表 3–7 按原文第 19–21 页表格数据转写并核对列结构。已加注三处原文疑点：(i) 正文"表 4 汇总 FID/Inception"与原文版面上 Figure 4/附录 Table 4 的编号不一致；(ii) 表 7 备注引用"图 5/图 6"与正文图号不匹配；(iii) E.6 节文字称图 7 的 $p=0.8$ 而图注写 $p=0.6$；另加注参考文献 [50]/[51]、[52]/[53] 重复著录。本页不上传原文图片，图 3–11 的生成样例与曲线不作数字化估算；正文与表格中的实验数值按原文转写。**许可待核验，本页仅作学习用途，不计入可公开全文。** 逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。

{% endraw %}
