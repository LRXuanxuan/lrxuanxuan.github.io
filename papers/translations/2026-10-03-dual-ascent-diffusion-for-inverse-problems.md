---
layout: page
title: "对偶上升扩散：面向逆问题｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-03-dual-ascent-diffusion-for-inverse-problems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/566d3c2e91637469/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 对偶上升扩散：面向逆问题

**原题：** Dual Ascent Diffusion for Inverse Problems  
**作者：** Minseo Kim、Axel Levy、Gordon Wetzstein。单位：斯坦福大学（Stanford University）。邮箱：{kminseo, axlevy, gordonwz}@stanford.edu。  
**版本：** 会议论文集版本（Kim_Dual_Ascent_Diffusion_for_Inverse_Problems_CVPR_2026_paper.pdf
https://openaccess.thecvf.com/content/CVPR2026/html/Kim_Dual_Ascent_），本地 PDF 10 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、第 1—5 节、参考文献（英文原条目）、图 1—5 图注、表 1—2、算法 1、式（1）—（12）。表 1 与表 2 已用 PDF 渲染逐格核对；本地 PDF 为 CVPR 2026 开放获取版（第 23622—23631 页），文中提到的附录 A—F 位于补充材料、本地 PDF 未包含，故本页不含附录正文（已在范围与状态中说明）。逐句逐式终校未做，不标记为已验收全文。

> **许可与使用说明：** 原文本地为 CVPR 2026 会议论文集 PDF（Computer Vision Foundation 开放获取版，除水印外与录用版一致，正式版见 IEEE Xplore）；**再传播许可待核验**。本页仅作个人学习用途的中文译稿，不代表已获授权，**不计入可公开全文统计**。若核验后许可不允许再传播，本页应下线或仅保留摘要级介绍。
>
> **译注（术语与原文疑点）：** 原文缩写保留英文：DDiff（Dual Ascent Diffusion）、MAP（maximum-a-posteriori，最大后验）、ADMM（alternating direction method of multipliers，交替方向乘子法）、PnP（plug-and-play，即插即用）、HQS（half-quadratic splitting，半二次分裂）、DPS、DAPS、DMPlug、DCDP、RED-diff、DDRM、DiffPIR、PSLD、ReSample、LDM/VQ-4、DDIM、NFE（neural function evaluations，神经函数评估次数）、PSNR/SSIM/LPIPS、FFHQ、ImageNet。**原文疑点（按原文照录并加注）：** ①原文式（1）中"↓"在 PDF 提取文本中为负号（argmin 后的取负），本页按数学含义写为 $-\left(\log p(\mathbf y|\mathbf x)+\log p(\mathbf x)\right)$；②原文式（2）的增广 Lagrangian 采用 $-\frac{\varepsilon}{2}\|\mathbf u\|_2^2$ 的常见形式（提取文本符号错乱），本页按 ADMM 标准形式复原并保留原意；③原文 §4.1 说明"相位恢复因任务本身不稳定而报告五次运行中的最佳结果"，其余任务为单次运行，原文未给出误差棒；④原文表 1 标题注明"95% 置信区间见附录 D"，而本地 10 页 PDF 不含附录，故本页无法转录该置信区间；⑤原文 §3.2 提到"固定点收敛（定理 1）"及附录 A 的证明，证明同样位于补充材料；⑥原文图 3 的对比为 10 张 FFHQ 验证图，图 4 为 10 张随机验证图（$\omega=0.3$ 的相位恢复），与 §4.2 正文描述一致。

## 摘要

病态逆问题在许多领域都是基础性问题，从天体物理到医学成像均涉及。新兴的扩散模型为求解这类问题提供了强大先验。然而现有的最大后验（MAP）方法或后验采样方法依赖不同的计算近似，导致样本不准确或次优。为解决该问题，我们提出一种利用**对偶上升**优化框架、以扩散模型为先验求解 MAP 问题的新方法。该框架在图像恢复问题上取得更好的图像质量（由多种指标衡量），对高测量噪声更稳健、速度更快，并且所估计的解比现有方法更忠实地反映观测。

## 1 引言

我们关注逆问题求解：从含噪且受损的观测 $\mathbf y$ 中估计未知图像或信号 $\mathbf x$。这类问题广泛出现在科学与工程中，例如图像恢复 [25]、天体物理 [1]、医学成像 [37]、蛋白质结构测定 [14, 23, 26] 等领域。在所有情形中，线性或非线性函数 $\mathcal A(\cdot)$ 建模特定领域的成像过程。尽管观测的似然 $p(\mathbf y|\mathbf x)$ 取决于噪声的统计模型，特定情形下存在闭式表达。例如，零均值独立同分布高斯噪声（方差 $\omega^2$）下的成像模型为 $\mathbf y=\mathcal A(\mathbf x)+\mathcal N(\mathbf 0,\omega^2)$，其对数似然为 $\log p(\mathbf y|\mathbf x)=-\frac{1}{2\omega^2}\|\mathbf y-\mathcal A(\mathbf x)\|_2^2$（相差一个与 $\mathbf x$ 无关的加性常数）。给定观测似然与先验 $p(\mathbf x)$，逆问题求解器在贝叶斯框架下要么最大化、要么从后验 $p(\mathbf x|\mathbf y)\propto p(\mathbf y|\mathbf x)p(\mathbf x)$ 采样。多数逆问题是病态的，使先验成为求解过程的关键组成部分。

**最大后验（MAP）** 方法旨在最大化后验，以在先验下找到最可能的解。早期方法使用"手工设计"先验以促进平滑、通过全变分 [3, 31] 促进分段常值，或在变换域中促进稀疏性 [12]；而多数现代方法使用某种神经网络 [44]。例如，即插即用（PnP）方法 [39]（常由交替方向乘子法（ADMM）[4] 实现）是求解 MAP 问题的流行而通用的框架，它把（高斯）去噪器作为先验。MAP 找到逆问题的单一最可能解；然而人们常常希望从所有可行解的后验中采样。因此，许多近期工作 [6, 7, 15, 19, 21, 22, 27, 34, 35, 41, 43] 聚焦于以强大预训练扩散模型为先验的后验采样，综述见 [9]。尽管这些近期扩散后验采样方法展现出巨大潜力，它们都从根本上受制于用于在优化中结合成像似然与先验的优化框架。

本工作并不追求可证明地从后验采样的方法，而是聚焦于推导一种能准确、高效地求解 MAP 问题的优化策略：先验由预训练扩散模型给出，优化框架为受 ADMM [4] 启发的**对偶上升**。我们的方法称为 **DDiff**，它更快，并在图像恢复问题（包括单图超分辨率、修复、去模糊、相位恢复与高动态范围成像）上取得优于现有技术的重建质量。此外，DDiff 对高测量噪声更稳健，且我们的重建更忠实地建模观测——残差更接近零。后者很重要，因为观测的对数似然 $\log p(\mathbf y|\mathbf x)$ 指示了扩散模型等生成先验在求解时引入的幻觉程度。值得注意的是，我们建立了**首个针对基于扩散的后验优化方法的固定点收敛证明**，并把框架扩展到潜空间设定，以便在紧凑特征空间中高效推断。

> **原文标注：** 本 CVPR 论文是 Computer Vision Foundation 提供的开放获取版本；除水印外与录用版一致，正式出版版本见 IEEE Xplore。

## 2 逆问题背景

### 2.1 最大后验解

最大后验（MAP）解旨在找到最大化后验 $p(\mathbf x|\mathbf y)\propto p(\mathbf y|\mathbf x)p(\mathbf x)$ 的解 $\mathbf x_{\mathrm{MAP}}$。通常通过最小化负对数似然实现：

$$
\mathbf x_{\mathrm{MAP}}=\arg\min_{\mathbf x}\left(-\log p(\mathbf y|\mathbf x)-\log p(\mathbf x)\right)=\frac{1}{2\omega^2}\left\|\mathbf y-\mathcal A(\mathbf x)\right\|_2^2-\log p(\mathbf x).\tag{1}
$$

交替方向乘子法（ADMM）[4] 是求解 MAP 问题的常用方法。ADMM 试图混合对偶分解与增广 Lagrangian 方法在约束优化中的优势。为此引入松弛变量 $\mathbf z$，把式（1）的目标分裂为数据保真项 $-\log p(\mathbf y|\mathbf x)$ 与对数先验项 $-\log p(\mathbf z)$，约束为 $\mathbf x=\mathbf z$。ADMM 随后构造分裂形式的增广 Lagrangian：

$$
\mathcal L_\varepsilon(\mathbf x,\mathbf z,\mathbf u)=\frac{1}{2\omega^2}\left\|\mathbf y-\mathcal A(\mathbf x)\right\|_2^2-\log p(\mathbf z)+\frac{\varepsilon}{2}\left\|\mathbf x-\mathbf z+\mathbf u\right\|_2^2-\frac{\varepsilon}{2}\left\|\mathbf u\right\|_2^2,\tag{2}
$$

其中 $\mathbf u$ 为对偶变量，$\varepsilon$ 为定义软约束强度的超参数。ADMM 随后采用交替梯度下降最小化增广 Lagrangian，得到对 $\mathbf x$、$\mathbf z$、$\mathbf u$ 的迭代更新：

$$
\mathbf x\leftarrow\arg\min_{\mathbf x}\frac{1}{2\omega^2}\left\|\mathbf y-\mathcal A(\mathbf x)\right\|_2^2+\frac{\varepsilon}{2}\left\|\mathbf x-\mathbf z+\mathbf u\right\|_2^2,\tag{3}
$$

$$
\mathbf z\leftarrow\arg\min_{\mathbf z}-\log p(\mathbf z)+\frac{\varepsilon}{2}\left\|\mathbf x-\mathbf z+\mathbf u\right\|_2^2,\tag{4}
$$

$$
=\mathcal D\left(\mathbf x+\mathbf u,\ \tilde\omega^2=\frac1\varepsilon\right),\tag{5}
$$

$$
\mathbf u\leftarrow\mathbf u+\mathbf x-\mathbf z.\tag{6}
$$

这里 $\mathbf x$-更新是不依赖先验的无约束最小二乘问题，常有闭式、至少是高效的解。即插即用图像恢复方法 [5, 39] 的一个重要洞见是：$\mathbf z$-更新（式（5））是变量 $\mathbf x+\mathbf u$ 上的去噪问题，可用任意高斯去噪器 $\mathcal D(\cdot,\tilde\omega^2)$ 在噪声水平 $\tilde\omega$ 下求解。对偶上升（例如由 ADMM 实现）在传统优化中带来若干好处，包括能利用对偶问题中的凸性，从而得到更简单、更高效、更稳健的优化方法 [4]。

### 2.2 扩散模型与后验采样

扩散模型的关键洞见在于：可先从另一易采样分布 $p_T$（如高斯）采样 $\mathbf x_T$，再迭代应用如下形式的反向扩散步来从目标分布 $p_0(\mathbf x)$ 采样：

$$
\mathbf x_{t-1}=\frac{1}{\sqrt{\alpha_t}}\left(\mathbf x_t+(1-\alpha_t)\mathbf s_\theta(\mathbf x_t,t)\right)+\sqrt{1-\alpha_t}\,\boldsymbol\epsilon\tag{7}
$$

对 $t=T,\dots,1$ 生成图像 $\mathbf x_0$，其中 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$。反向扩散过程 [2, 17] 近似相应前向扩散 $\mathbf x_t=\sqrt{\bar\alpha_t}\mathbf x_0+\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon$（$\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$）的逆轨迹。这里我们采用前向与反向扩散的方差保持形式 [18]。因子 $\alpha_t$ 与 $\bar\alpha_t=\prod_{s=0}^{t}\alpha_s$ 由扩散模型的噪声调度导出 [18]。重要的是，由参数 $\theta$ 定义的分数网络 $\mathbf s_\theta(\mathbf x_t,t)$ 是一个神经网络，逼近分数函数 $\nabla_{\mathbf x}\log p_t(\mathbf x)$ [36]，在扩散模型预训练阶段由训练数据学得。为更高效采样，去噪扩散隐式模型（DDIM）[33] 提供了扩散过程的非 Markov 反向参数化，用以替代式（7）的 Markov 表述：

$$
\mathbf x_{t-1}=\sqrt{\bar\alpha_{t-1}}\left(\frac{\mathbf x_t+(1-\bar\alpha_t)\mathbf s_\theta(\mathbf x_t,t)}{\sqrt{\bar\alpha_t}}\right)-\sqrt{1-\bar\alpha_{t-1}-\sigma_t^2}\left(\sqrt{1-\bar\alpha_t}\,\mathbf s_\theta(\mathbf x_t,t)\right)+\sigma_t\boldsymbol\epsilon,\tag{8}
$$

其中 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$，$\sigma_t$ 为推断时选定的调度。

在后验采样问题中，我们希望从后验 $p(\mathbf x|\mathbf y)$ 采样。为此，许多近期方法沿用上述思路，但使用后验分数 $\nabla_{\mathbf x}\log p_t(\mathbf x|\mathbf y)=\nabla_{\mathbf x}\log p(\mathbf y|\mathbf x_t=\mathbf x)+\nabla_{\mathbf x}\log p_t(\mathbf x)$ 替代 $\nabla_{\mathbf x}\log p_t(\mathbf x)$。第二项等价于预训练扩散模型的无条件分数，但难点在第一项，即条件分数项。条件概率 $p(\mathbf y|\mathbf x_t)$ 可写为条件期望 $\mathbb E_{\mathbf x_0\sim p(\mathbf x_0|\mathbf x_t)}[p(\mathbf y|\mathbf x_0)]$，但用 Monte Carlo 样本近似该期望在计算上不可行（例如参见 Chung 等 [7]）。因此现有扩散后验采样方法把该条件分布近似为集中在 $\mathbf x_t$ 上的 Dirac delta [19]，或集中在 $\mathbb E_{\mathbf x_0\sim p(\mathbf x_0|\mathbf x_t)}[\mathbf x_0]$ 上 [7]。另有许多扩散后验采样方法被提出 [9]，各自对条件期望给出不同近似。最近，Zhang 等 [43] 提出 DAPS（Decoupled Annealing Posterior Sampling）——一种两步迭代方法，通过在 $t=0$ 处基于 Markov 链 Monte Carlo 的平衡步来缓解沿采样轨迹的误差累积。DAPS 在线性与非线性逆问题上均展示了最先进结果，但仍受制于对条件概率 $p(\mathbf x_0|\mathbf x_t)$ 的近似与 MCMC 步数的有限性。

## 3 方法

下面推导我们以预训练扩散模型为先验求解 MAP 问题的方法。

### 3.1 用于图像恢复的扩散即插即用 ADMM

我们把将 ADMM 与预训练扩散模型结合使用的朴素方法称为 **Diff-PnP-ADMM**。为此我们应用 §2.1 讨论的 ADMM 框架，并把预训练扩散模型用作 $\mathbf z$-更新（即式（5））中的一步去噪器 $\mathcal D$——通过应用 Tweedie 公式 [13]，把 $\mathbf z$-更新替换为

$$
\mathbf z\leftarrow\frac{1}{\sqrt{\bar\alpha_t}}\left(\mathbf x+\mathbf u+(1-\bar\alpha_t)\mathbf s_\theta(\mathbf x+\mathbf u,t)\right),\tag{9}
$$

其中 $t$ 在 ADMM 循环的每一步递减，这隐式约束了扩散调度 $\alpha_t$ 与软约束参数 $\varepsilon$ 之间的关系。

### 3.2 对偶上升扩散（DDiff）

ADMM 方法的核心是迭代三个步骤：$\mathbf x$-更新对应数据匹配步（式（3）），$\mathbf z$-更新可视为去噪步（式（5）），对偶更新源于为约束 $\mathbf x=\mathbf z$ 引入对偶变量 $\mathbf u$（式（6））。$\mathbf x$-更新与对偶更新可直接由原始 ADMM 框架导出；我们的方法贡献主要在于表明：预训练扩散模型可在 $\mathbf z$-更新中比朴素方法（式（9））更高效地使用。

**$\mathbf x$-更新。** 为使方法可直接应用于任何可微前向模型 $\mathcal A$（无论线性或非线性），我们把式（3）的最小化问题替换为单步梯度：

$$
\mathbf x\leftarrow\mathbf v-\varsigma\nabla_{\mathbf v}\left\|\mathbf y-\mathcal A(\mathbf v)\right\|_2^2,\qquad\mathbf v=\mathbf z-\mathbf u,\tag{10}
$$

其中 $\varsigma$ 为可在每次迭代调整的步长。该方法也称为线性化 ADMM [28]。

**$\mathbf u$-更新。** 对偶变量的更新直接由式（6）给出。

**$\mathbf z$-更新。** 按照式（5），$\mathbf z$-更新是对 $\mathbf x+\mathbf u$ 在某个噪声水平 $\tilde\omega^2$ 下去噪。然而必须注意：由于分数模型 $\mathbf s_\theta(\mathbf x,t)$ 只在来自 $p_t$ 的样本点上训练，当 $\mathbf x$ 在 $p_t$ 下不太可能（即 $p_t(\mathbf x)\approx0$）时，它只是真实分数的糟糕近似。换言之，时刻 $t$ 的分数模型只在属于时刻 $t$ 扩散流形的点上准确 [8]。由于 $\mathbf x+\mathbf u$ 一般不属于该流形，我们提出把 $\mathbf z$-更新替换为

$$
\mathbf z\leftarrow\frac{1}{\sqrt{\bar\alpha_t}}\left(\mathbf x_t+(1-\bar\alpha_t)\mathbf s_\theta(\mathbf x_t,t)\right),\tag{11}
$$

其中 $\mathbf x_t$ 按 $\mathbf x_T\sim\mathcal N(\mathbf 0,\mathbf I)$ 递推定义，且

$$
\mathbf x_{t-1}=\underbrace{\sqrt{\bar\alpha_{t-1}}\cdot\mathbf x+\sqrt{1-\bar\alpha_{t-1}-\sigma_t^2}\cdot\hat{\boldsymbol\epsilon}+\sigma_t\boldsymbol\epsilon}_{\text{DDIM 更新}}+\underbrace{\sqrt{\bar\alpha_{t-1}}\cdot\mathbf u}_{\text{重缩放的 }\mathbf u}.\tag{12}
$$

该式中 $\hat{\boldsymbol\epsilon}=\left(\mathbf x_t-\sqrt{\bar\alpha_t}\cdot\mathbf x\right)/\sqrt{1-\bar\alpha_t}$，$\sigma_t$ 为超参数。右端第一部分对应"预测 $\mathbf x_0$"取 $\mathbf x$ 的 DDIM 更新；第二部分加入对偶变量 $\mathbf u$，并按 $\mathbf x_{t-1}$ 的信号水平重缩放。

迭代地组合这三个步骤即定义我们的方法（算法 1）。我们证明 DDiff 的更新收敛到固定点 $(\mathbf x^\ast,\mathbf z^\ast,\mathbf u^\ast)$：在有界去噪器与有界梯度假设下，三个迭代序列均为 Cauchy 序列并收敛到极限（定理 1）；值得注意的是，该结果不要求先验凸。完整假设、证明与技术细节位于附录 A。

```text
Algorithm 1 DDiff
Require: T, A(·), {σ_t}_{t=1}^T, {ᾱ_t}_{t=1}^T, s_θ, y, {ς_t}_{t=1}^T, t_0
1: 初始化 x_T ~ N(0, I), u = 0.
2: for t = T − 1 to 0 do
3:     z ← (1/√ᾱ_t) (x_t + (1−ᾱ_t) s_θ(x_t, t))
4:     ▷ 去噪步（式 11）
5:     x ← z − u − ς_t ∇_v ‖y − A(v)‖²，其中 v = z − u
6:     ▷ 测量步（式 10）
7:     ε̂ ← (1/√(1−ᾱ_t)) (x_t − √ᾱ_t · x)
8:     ε ~ N(0, I) 若 t > t_0，否则 ε = 0
9:     x_{t−1} ← √ᾱ_{t−1} · x + √(1−ᾱ_{t−1}−σ_t²) · ε̂ + σ_t ε + √ᾱ_{t−1} · u
10:    ▷ 反向扩散（式 12）
11:    u ← u + x − z
12:    ▷ 对偶更新（式 6）
13: end for
14: return x_0
```

### 3.3 基于潜扩散模型的 DDiff

给定预训练编码器 $\mathcal E$ 与解码器 $\mathcal D$，潜扩散模型（LDM）[29] 训练用于建模潜变量 $\mathbf z_0=\mathcal E(\mathbf x_0)$ 的分布 $p(\mathbf z_0)$，从而可通过 $\mathbf x_0=\mathcal D(\mathbf z_0)$ 重建。利用潜扩散模型通常比像素空间扩散带来更低的内存与计算需求。把 DDiff 扩展到该潜空间得到 **LatentDDiff**：它在紧凑潜表示上执行交替的数据保真与去噪更新，同时保持 DDiff 的对偶上升结构。完整算法表述、定量结果以及"在潜空间还是像素空间施加数据一致性"的讨论见附录 C。

### 3.4 与其他基于扩散的变量分裂方法的比较

先前方法（如 DiffPIR [46]、DCDP [24] 与 PnP-DM [42]）是基于 MAP 的优化方法，具体建立于**半二次分裂（HQS）** [16] 方法之上，其表述中缺少对偶变量。本工作自然扩展了现有框架，把它们从 HQS 风格方法转变为使用对偶变量的方法（包括 ADMM）。通过引入在迭代间累积约束违反量的 Lagrange 乘子，DDiff 在测量一致性至关重要的挑战性逆问题上带来更好的经验性能。特别地，我们注意到：从 DDiff 中移除对偶更新将恰好退化为 DiffPIR [46]（在恰当的 $\sigma_t$ 与 $\varsigma_t$ 选择下，见附录 E）。

## 4 实验

### 4.1 实验设置

**数据集与指标。** 我们在两个图像数据集上评估方法：FFHQ $256\times256$ [20] 与 ImageNet $256\times256$ [10]。对像素空间扩散模型，我们在 FFHQ 上使用来自 [7] 的预训练模型、在 ImageNet 上使用来自 [11] 的模型；对潜扩散模型，我们使用 [32]（FFHQ）与 [29]（ImageNet）的无条件 LDM-VQ4（下采样因子为 4 的自编码器）预训练模型。两个数据集均从验证集随机选取 100 张图像，归一化到 $[-1,1]$。主要评估指标包括峰值信噪比（PSNR）、结构相似性（SSIM）、学习感知图像块相似度（LPIPS）[45] 与残差误差（定义为 $\|\mathbf y-\mathcal A(\mathbf x)\|_2^2/\omega^2$，见附录 B），后者量化数据一致性程度。

**逆问题。** 方法在多个逆问题上评估。线性任务包括超分辨率（4 倍下采样）、高斯去模糊、运动去模糊、$128\times128$ 方框修复，以及移除 70% 像素的随机掩码修复；非线性任务包括相位恢复（过采样比 2.0，因任务本身不稳定而报告五次运行中的最佳结果）、非线性去模糊与高动态范围（2 倍动态范围）。所有测量都含加性高斯噪声（$\omega=0.05$）。

**基线。** 我们与最先进方法比较：DAPS [43]、DMPlug [40]、DCDP [24]、RED-diff [27]、DDRM [22]、DPS [7] 与 DiffPIR [46]。注意 DiffPIR 与 DDRM 未被证明能处理非线性任务。由于 DAPS 在基线中结果最佳，我们重点与其对比。对方法的潜扩散适配版，我们与 LatentDAPS [43]、PSLD [30] 与 ReSample [32] 比较；注意 PSLD 无法处理非线性逆任务。

### 4.2 主要结果

FFHQ 与 ImageNet 数据集上线性与非线性任务的定量评估见表 1。我们的方法在绝大多数任务上优于基线，尤其在感知相似度与残差误差方面；图 2 给出基线与本方法的定性比较，进一步说明这一点。总体而言，DDiff 以更少视觉伪影重建更细细节。更多定性示例与超参数细节见补充材料。

**表 1：定量评估。** 比较不同方法在 FFHQ 与 ImageNet 数据集上 5 个线性与 3 个非线性任务的表现；使用 100 张验证图像并报告平均指标值。最佳与次佳结果分别用粗体与下划线标出；所有任务在标准差 $\omega=0.05$ 的噪声下运行；95% 置信区间见附录 D。（来源：原文第 6 页。）

| 任务 | 方法 | FFHQ PSNR (↑) | SSIM (↑) | LPIPS (↓) | Residual (↓) | ImageNet PSNR (↑) | SSIM (↑) | LPIPS (↓) | Residual (↓) |
|---|---|---|---|---|---|---|---|---|---|
| **超分辨率 4×** | DDiff（本文） | **30.07** | **0.824** | 0.211 | **0.0028** | **25.81** | **0.656** | 0.396 | **0.0038** |
| | DAPS | 29.34 | 0.783 | **0.190** | 0.0029 | 25.44 | 0.636 | **0.295** | 0.0047 |
| | DMPlug | 28.55 | 0.742 | 0.220 | 0.0038 | 24.22 | 0.649 | 0.432 | 0.0039 |
| | DPS | 24.42 | 0.486 | 0.346 | 0.0050 | 21.10 | 0.351 | 0.408 | 0.0052 |
| | DiffPIR | 23.71 | 0.440 | 0.423 | 0.0087 | 20.75 | 0.312 | 0.517 | 0.0093 |
| | DCDP | 26.65 | 0.641 | 0.410 | 0.0079 | 23.51 | 0.542 | 0.460 | 0.0060 |
| | DDRM | 26.32 | 0.763 | 0.286 | 0.0075 | 22.26 | 0.513 | 0.473 | 0.0072 |
| **修复（方框）** | DDiff（本文） | **24.88** | **0.831** | 0.110 | **0.0077** | 21.15 | **0.743** | 0.240 | **0.0119** |
| | DAPS | 24.12 | 0.742 | 0.174 | 0.0099 | **21.22** | 0.714 | **0.230** | 0.0150 |
| | DPS | 23.68 | 0.810 | **0.079** | **0.0033** | 19.63 | 0.725 | 0.254 | 0.0412 |
| | DiffPIR | 19.02 | 0.527 | 0.252 | 0.0106 | 16.02 | 0.520 | 0.329 | 0.0145 |
| | DCDP | 23.67 | 0.729 | 0.232 | 0.0101 | 20.45 | 0.732 | 0.248 | 0.0132 |
| | DDRM | 22.15 | 0.701 | 0.209 | 0.0099 | 18.52 | 0.713 | 0.254 | 0.0194 |
| | RED-diff | 14.57 | 0.578 | 0.586 | 0.0451 | 13.98 | 0.628 | 0.367 | 0.0437 |
| **修复（随机）** | DDiff（本文） | **33.08** | **0.877** | **0.050** | **0.0205** | **28.39** | **0.758** | **0.136** | **0.0241** |
| | DAPS | 30.76 | 0.801 | 0.156 | 0.0293 | 27.32 | 0.725 | 0.189 | 0.0788 |
| | DMPlug | 31.65 | 0.852 | 0.137 | 0.0290 | 26.09 | 0.740 | 0.245 | 0.0316 |
| | DPS | 30.79 | 0.807 | 0.083 | 0.0217 | 27.31 | 0.737 | 0.235 | 0.0980 |
| | DiffPIR | 18.53 | 0.362 | 0.622 | 0.0264 | 15.82 | 0.191 | 0.842 | 0.1080 |
| | DCDP | 25.67 | 0.757 | 0.224 | 0.0398 | 20.40 | 0.723 | 0.253 | 0.1001 |
| **高斯去模糊** | DDiff（本文） | 28.87 | **0.800** | **0.119** | **0.0026** | 22.29 | 0.471 | 0.415 | **0.0046** |
| | DAPS | **29.63** | 0.789 | 0.177 | 0.0027 | **25.90** | **0.658** | **0.269** | 0.0084 |
| | DMPlug | 22.98 | 0.537 | 0.288 | 0.0036 | 14.82 | 0.188 | 0.680 | 0.0147 |
| | DPS | 27.77 | 0.704 | 0.140 | 0.0029 | 21.07 | 0.528 | 0.392 | 0.0073 |
| | DiffPIR | 26.16 | 0.624 | 0.297 | 0.0031 | 21.64 | 0.393 | 0.497 | 0.0093 |
| | DCDP | 16.75 | 0.173 | 0.701 | 0.0141 | 16.06 | 0.183 | 0.674 | 0.0195 |
| | DDRM | 24.87 | 0.725 | 0.246 | 0.0052 | 21.14 | 0.457 | 0.464 | 0.0113 |
| | RED-diff | 12.18 | 0.149 | 1.232 | 0.0348 | 12.22 | 0.128 | 0.613 | 0.0256 |
| **运动去模糊** | DDiff（本文） | 28.24 | 0.785 | **0.129** | **0.0058** | 24.16 | 0.585 | 0.242 | **0.0079** |
| | DAPS | **29.17** | **0.797** | 0.186 | 0.0059 | **26.61** | **0.710** | **0.241** | 0.0085 |
| | DMPlug | 21.95 | 0.512 | 0.304 | 0.0076 | 14.81 | 0.170 | 0.696 | 0.0199 |
| | DPS | 27.93 | 0.714 | 0.130 | 0.0061 | 23.36 | 0.611 | 0.321 | 0.0082 |
| | DiffPIR | 22.01 | 0.327 | 0.499 | 0.0074 | 18.93 | 0.248 | 0.586 | 0.0084 |
| | DCDP | 9.536 | 0.039 | 0.855 | 0.0547 | 9.491 | 0.066 | 0.771 | 0.0511 |
| **相位恢复** | DDiff（本文） | **29.94** | **0.816** | **0.120** | **0.0040** | 18.54 | **0.494** | **0.262** | **0.0059** |
| | DAPS | 29.60 | 0.768 | 0.182 | 0.0049 | **20.23** | 0.449 | 0.397 | 0.0085 |
| | DPS | 22.24 | 0.540 | 0.307 | 0.0514 | 16.03 | 0.396 | 0.444 | 0.1040 |
| | DiffPIR | 10.04 | 0.036 | 0.783 | 0.1811 | 9.61 | 0.021 | 0.794 | 0.2410 |
| | DCDP | 15.20 | 0.420 | 0.616 | 0.1060 | 11.63 | 0.201 | 0.700 | 0.1220 |
| | RED-diff | 14.88 | 0.386 | 0.656 | 0.1721 | 13.89 | 0.266 | 0.639 | 0.1121 |
| **非线性去模糊** | DDiff（本文） | **31.48** | **0.873** | **0.120** | **0.0027** | **29.68** | **0.805** | **0.207** | **0.0035** |
| | DAPS | 28.45 | 0.764 | 0.188 | 0.0042 | 27.28 | 0.718 | 0.213 | 0.0048 |
| | DMPlug | 27.17 | 0.791 | 0.187 | 0.0051 | 22.99 | 0.603 | 0.366 | 0.0104 |
| | DPS | 25.39 | 0.643 | 0.258 | 0.0095 | 28.42 | 0.691 | 0.271 | 0.0053 |
| | DiffPIR | 19.79 | 0.331 | 0.583 | 0.0273 | 22.13 | 0.459 | 0.435 | 0.0167 |
| | DCDP | 28.87 | 0.852 | 0.177 | 0.0038 | 25.22 | 0.700 | 0.299 | 0.0105 |
| | RED-diff | 29.89 | 0.783 | 0.185 | 0.0040 | 28.07 | 0.624 | 0.306 | 0.0051 |
| **高动态范围** | DDiff（本文） | 26.05 | **0.873** | **0.129** | **0.0459** | 26.50 | 0.800 | **0.108** | **0.0541** |
| | DAPS | **27.39** | 0.846 | 0.163 | 0.0505 | 26.10 | **0.825** | 0.171 | 0.0717 |
| | DPS | 25.79 | 0.793 | 0.165 | 0.0734 | 22.72 | 0.721 | 0.273 | 0.1951 |
| | DiffPIR | 17.69 | 0.645 | 0.296 | 0.1292 | 18.23 | 0.637 | 0.289 | 0.2105 |
| | RED-diff | 21.28 | 0.431 | 0.359 | 0.0921 | 21.02 | 0.567 | 0.479 | 0.1322 |

**图 2：** 定性结果。DPS [7] 与 DAPS [43] 相比，DDiff 给出更锐利、更干净的结果。所有任务在标准差 $\omega=0.05$ 的噪声下运行（列：超分辨率 4×、高斯去模糊、运动去模糊、相位恢复）。（来源：原文第 5 页。）

此外，DDiff 对更高测量噪声表现出显著更强的稳健性。如图 3 所示，虽然在极低测量噪声区域（约 $\omega<0.05$）其 PSNR 可能略低于 DAPS，但随 $\omega$ 增大 PSNR 下降更慢；在所有噪声水平下 DDiff 的 LPIPS 总体低于 DAPS。LPIPS 呈类似趋势，尤其在相位恢复任务中，DDiff 在高噪声区（$\omega=0.3$）把 LPIPS 降至约三分之一。DDiff 与 DAPS 在极端测量噪声（$\omega=0.3$）下的重建质量对比见图 4。这些结果表明，DDiff 更适合求解测量噪声突出的挑战性逆问题，例如低剂量 CT 重建。

**图 3：** 测量噪声水平的影响。随噪声增大，DDiff 表现出更强稳健性；评估使用 10 张 FFHQ 验证图。(a) 高斯去模糊；(b) 相位恢复。（来源：原文第 7 页。）

**图 4：** 高测量噪声水平下的定性结果。在相位恢复任务（$\omega=0.3$）上，用 10 张随机选取的验证图比较本方法（DDiff）与 DAPS [43]。尽管测量噪声严重，DDiff 成功恢复相干的全局结构与面部语义，而 DAPS 重建出现强烈损坏与噪声伪影。（来源：原文第 7 页。）

### 4.3 消融研究

**时间效率与样本质量评估。** 扩散方法采样速度最主要的限制因素之一是神经函数评估次数（NFE），它衡量推断期间执行的分数模型评估次数。因此我们在图 5 中评估本方法与现有基线的平均采样时间与样本质量随 NFE 的变化。在相同 NFE 下，DDiff 相比 DAPS 取得更好的感知质量与更快的采样速度。计算效率的提升源于两个关键因素：梯度计算所需反向传播减少，以及采样迭代中不含额外 MCMC 过程——而 DAPS 框架中两者都存在。

**图 5：** 时间效率与样本质量评估。纵轴为 LPIPS，横轴为在 GeForce RTX 2080 Ti 12GB GPU 上生成单张样本图像所需时间（秒）。方法名后的数字（500、2k 等）表示 NFE；评估使用 100 张 FFHQ 验证图。(a) 高斯去模糊；(b) 相位恢复。（来源：原文第 8 页。）

**对偶变量与加噪步的作用。** 为说明对偶变量 $\mathbf u$ 与算法中额外加噪步（式（12））的重要性，我们开展实验，把 DDiff（含加噪、含 $\mathbf u$）与另外三个变体比较：Diff-PnP-HQS（无加噪、无 $\mathbf u$）、Diff-PnP-ADMM（无加噪、含 $\mathbf u$）与 DDiff-HQS（含加噪、无 $\mathbf u$），结果见表 2。分析表明，单独实现对偶变量会降低性能，Diff-PnP-ADMM 的指标劣于 Diff-PnP-HQS 即为证据：没有加噪步时，对偶变量引入高频伪影，损害扩散模型效果。然而当与加噪步结合时，对偶变量带来显著性能提升，DDiff 相对 DDiff-HQS 的更优定量指标即为证据。实验结果确认，对偶变量与加噪步这两个组件必须一起实现——从 Diff-PnP-HQS 到 DDiff 的显著性能提升即说明了这一点。

**表 2：对偶变量与加噪步的消融。** 把 DDiff（含加噪、含 $\mathbf u$）与其他变体比较：Diff-PnP-HQS（无加噪、无 $\mathbf u$）、Diff-PnP-ADMM（无加噪、含 $\mathbf u$）与 DDiff-HQS（含加噪、无 $\mathbf u$）；各变体完整算法描述见附录 F。所有方法使用相同 DDIM 噪声调度以公平比较；评估使用 10 张 FFHQ 验证图并报告平均指标值；最佳与次佳分别用粗体与下划线标出。（来源：原文第 8 页。）

| 方法 | 超分辨率 4× PSNR↑ | SSIM↑ | LPIPS↓ | Res.↓ | 修复(方框) PSNR↑ | SSIM↑ | LPIPS↓ | Res.↓ | 修复(随机) PSNR↑ | SSIM↑ | LPIPS↓ | Res.↓ | 高斯去模糊 PSNR↑ | SSIM↑ | LPIPS↓ | Res.↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DDiff（本文） | **30.10** | **0.821** | **0.199** | **0.0034** | **26.01** | **0.855** | **0.087** | **0.0032** | **33.21** | **0.883** | **0.043** | **0.0028** | **29.08** | **0.801** | **0.112** | **0.0025** |
| DDiff-HQS | 25.45 | 0.558 | 0.369 | 0.0057 | 19.01 | 0.566 | 0.221 | 0.0091 | 15.37 | 0.254 | 0.790 | 0.0167 | 26.32 | 0.642 | 0.267 | 0.0031 |
| Diff-PnP-ADMM | 13.79 | 0.434 | 0.572 | 0.0304 | 12.72 | 0.546 | 0.486 | 0.0298 | 16.79 | 0.540 | 0.402 | 0.0087 | 6.18 | 0.077 | 0.820 | 0.2552 |
| Diff-PnP-HQS | 14.04 | 0.447 | 0.535 | 0.0287 | 12.61 | 0.557 | 0.476 | 0.0271 | 15.85 | 0.513 | 0.431 | 0.0168 | 5.82 | 0.036 | 0.858 | 0.2812 |
| **运动去模糊** | | | | | **相位恢复** | | | | **非线性去模糊** | | | | **高动态范围** | | | |
| DDiff（本文） | **28.14** | **0.779** | **0.112** | **0.0026** | **30.58** | **0.834** | **0.096** | **0.0028** | **31.25** | **0.867** | **0.111** | **0.0033** | **26.95** | **0.877** | **0.109** | **0.0072** |
| DDiff-HQS | 21.75 | 0.396 | 0.397 | 0.0036 | 12.86 | 0.114 | 0.679 | 0.0057 | 13.51 | 0.186 | 0.543 | 0.1252 | 17.76 | 0.672 | 0.284 | 0.1260 |
| Diff-PnP-ADMM | 6.35 | 0.089 | 0.810 | 0.1840 | 12.84 | 0.266 | 0.637 | 0.0081 | 5.23 | 0.007 | 0.830 | 0.2463 | 7.85 | 0.126 | 0.875 | 0.4797 |
| Diff-PnP-HQS | 6.39 | 0.091 | 0.813 | 0.1752 | 13.63 | 0.287 | 0.597 | 0.0077 | 6.02 | 0.086 | 0.827 | 0.2537 | 7.56 | 0.098 | 0.885 | 0.5287 |

## 5 结论

本工作提出 **DDiff**——一个求解基于扩散模型的逆问题的对偶上升框架，其定量与定性重建质量优于最先进方法，在高测量噪声水平下尤为突出。通过在原空间与对偶空间中联合优化，并谨慎适配 ADMM 的 $\mathbf z$-更新，我们的方法有效利用预训练扩散先验，提升感知质量、测量一致性与运行时间。DDiff 对噪声高度稳健且计算高效，使其适用于求解大规模复杂逆问题。未来工作包括把框架扩展到更高维数据（如 3D 或视频表示），这既带来额外挑战也带来机会。

## 参考文献（英文原书目）

[1] Kazunori Akiyama, Antxon Alberdi, Walter Alef, Keiichi Asada, Rebecca Azulay, Anne-Kathrin Baczko, David Ball, Mislav Baloković, John Barrett, Dan Bintley, et al. First M87 Event Horizon Telescope results. IV. Imaging the central supermassive black hole. The Astrophysical Journal Letters, 875(1):L4, 2019.
[2] Brian DO Anderson. Reverse-time diffusion equation models. Stochastic Processes and their Applications, 12(3):313–326, 1982.
[3] Amir Beck and Marc Teboulle. Fast gradient-based algorithms for constrained total variation image denoising and deblurring problems. IEEE Transactions on Image Processing, 18(11):2419–2434, 2009.
[4] Stephen Boyd, Neal Parikh, Eric Chu, Borja Peleato, Jonathan Eckstein, et al. Distributed optimization and statistical learning via the alternating direction method of multipliers. Foundations and Trends® in Machine Learning, 3(1):1–122, 2011.
[5] Stanley H Chan, Xiran Wang, and Omar A Elgendy. Plug-and-play ADMM for image restoration: Fixed-point convergence and applications. IEEE Transactions on Computational Imaging, 3(1):84–98, 2016.
[6] Jooyoung Choi, Sungwon Kim, Yonghyun Jeong, Youngjune Gwon, and Sungroh Yoon. ILVR: Conditioning method for denoising diffusion probabilistic models. arXiv preprint arXiv:2108.02938, 2021.
[7] Hyungjin Chung, Jeongsol Kim, Michael T Mccann, Marc L Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. arXiv preprint arXiv:2209.14687, 2022.
[8] Hyungjin Chung, Byeongsu Sim, Dohoon Ryu, and Jong Chul Ye. Improving diffusion models for inverse problems using manifold constraints. Advances in Neural Information Processing Systems, 35:25683–25696, 2022.
[9] Giannis Daras, Hyungjin Chung, Chieh-Hsin Lai, Yuki Mitsufuji, Jong Chul Ye, Peyman Milanfar, Alexandros G Dimakis, and Mauricio Delbracio. A survey on diffusion models for inverse problems. arXiv preprint arXiv:2410.00083, 2024.
[10] Jia Deng, Wei Dong, Richard Socher, Li-Jia Li, Kai Li, and Li Fei-Fei. ImageNet: A large-scale hierarchical image database. In 2009 IEEE Conference on Computer Vision and Pattern Recognition, pages 248–255, 2009.
[11] Prafulla Dhariwal and Alexander Quinn Nichol. Diffusion models beat GANs on image synthesis. In Advances in Neural Information Processing Systems, 2021.
[12] David L Donoho. Compressed sensing. IEEE Transactions on Information Theory, 52(4):1289–1306, 2006.
[13] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106(496):1602–1614, 2011.
[14] Alisia Fadini, Minhuan Li, Airlie J McCoy, Thomas C Terwilliger, Randy J Read, Doeke Hekstra, and Mohammed AlQuraishi. AlphaFold as a prior: Experimental structure determination conditioned on a pretrained neural network. bioRxiv, pages 2025–02, 2025.
[15] Berthy T Feng, Jamie Smith, Michael Rubinstein, Huiwen Chang, Katherine L Bouman, and William T Freeman. Score-based diffusion models as principled priors for inverse imaging. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 10520–10531, 2023.
[16] Donald Geman and Chengda Yang. Nonlinear image recovery with half-quadratic regularization. IEEE Transactions on Image Processing, 4(7):932–946, 1995.
[17] Ulrich G Haussmann and Etienne Pardoux. Time reversal of diffusions. The Annals of Probability, pages 1188–1205, 1986.
[18] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. arXiv preprint arXiv:2006.11239, 2020.
[19] Ajil Jalal, Marius Arvinte, Giannis Daras, Eric Price, Alexandros G Dimakis, and Jon Tamir. Robust compressed sensing MRI with deep generative priors. Advances in Neural Information Processing Systems, 34:14938–14954, 2021.
[20] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. IEEE Trans. Pattern Anal. Mach. Intell., 43(12):4217–4228, 2021.
[21] Bahjat Kawar, Gregory Vaksman, and Michael Elad. SNIPS: Solving noisy inverse problems stochastically. Advances in Neural Information Processing Systems, 34:21757–21769, 2021.
[22] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. Advances in Neural Information Processing Systems, 35:23593–23606, 2022.
[23] Axel Levy, Eric R Chan, Sara Fridovich-Keil, Frédéric Poitevin, Ellen D Zhong, and Gordon Wetzstein. Solving inverse problems in protein space using diffusion-based priors. arXiv preprint arXiv:2406.04239, 2024.
[24] Xiang Li, Soo Min Kwon, Ismail R Alkhouri, Saiprasad Ravishanka, and Qing Qu. Decoupled data consistency with diffusion purification for image restoration. arXiv preprint arXiv:2403.06054, 2024.
[25] Jingyun Liang, Jiezhang Cao, Guolei Sun, Kai Zhang, Luc Van Gool, and Radu Timofte. SwinIR: Image restoration using swin transformer. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 1833–1844, 2021.
[26] Sai Advaith Maddipatla, Nadav Bojan Sellam, Sanketh Vedula, Ailie Marx, and Alex Bronstein. Generative modeling of protein ensembles guided by crystallographic electron densities. arXiv preprint arXiv:2412.13223, 2024.
[27] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. arXiv preprint arXiv:2305.04391, 2023.
[28] Neal Parikh, Stephen Boyd, et al. Proximal algorithms. Foundations and Trends® in Optimization, 1(3):127–239, 2014.
[29] Robin Rombach, A. Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. 2022 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 10674–10685, 2021.
[30] Litu Rout, Negin Raoof, Giannis Daras, Constantine Caramanis, Alex Dimakis, and Sanjay Shakkottai. Solving linear inverse problems provably via posterior sampling with latent diffusion models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.
[31] Leonid I Rudin, Stanley Osher, and Emad Fatemi. Nonlinear total variation based noise removal algorithms. Physica D: Nonlinear Phenomena, 60(1-4):259–268, 1992.
[32] Bowen Song, Soo Min Kwon, Zecheng Zhang, Xinyu Hu, Qing Qu, and Liyue Shen. Solving inverse problems with latent diffusion models via hard data consistency. In The Twelfth International Conference on Learning Representations, 2024.
[33] Jiaming Song, Chenlin Meng, and Stefano Ermon. Denoising diffusion implicit models. arXiv preprint arXiv:2010.02502, 2020.
[34] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.
[35] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. arXiv preprint arXiv:2011.13456, 2020.
[36] Yang Song, Conor Durkan, Iain Murray, and Stefano Ermon. Maximum likelihood training of score-based diffusion models. Advances in Neural Information Processing Systems, 34:1415–1428, 2021.
[37] Yang Song, Liyue Shen, Lei Xing, and Stefano Ermon. Solving inverse problems in medical imaging with score-based generative models. arXiv preprint arXiv:2111.08005, 2021.
[38] Phong Tran, Anh Tran, Quynh Phung, and Minh Hoai. Explore image deblurring via encoded blur kernel space. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 2021.
[39] Singanallur V Venkatakrishnan, Charles A Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In 2013 IEEE Global Conference on Signal and Information Processing, pages 945–948. IEEE, 2013.
[40] Hengkang Wang, Xu Zhang, Taihui Li, Yuxiang Wan, Tiancong Chen, and Ju Sun. DMPlug: A plug-in method for solving inverse problems with diffusion models. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.
[41] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. arXiv preprint arXiv:2212.00490, 2022.
[42] Zihui Wu, Yu Sun, Yifan Chen, Bingliang Zhang, Yisong Yue, and Katherine Bouman. Principled probabilistic imaging using diffusion models as plug-and-play priors. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.
[43] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. arXiv preprint arXiv:2407.01521, 2024.
[44] Kai Zhang, Wangmeng Zuo, Yunji Jin Chen, Deyu Meng, and Lei Zhang. Beyond a Gaussian denoiser: Residual learning of deep CNN for image denoising. IEEE Transactions on Image Processing, 26(7):3142–3155, 2017.
[45] Richard Zhang, Phillip Isola, Alexei A. Efros, Eli Shechtman, and Oliver Wang. The unreasonable effectiveness of deep features as a perceptual metric. In 2018 IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 586–595, 2018.
[46] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 1219–1229, 2023.

## 图注与表注

**图 1（原文第 3 页）：** DDiff 概览（以运动去模糊为例）。DDiff 在每个 ADMM 迭代内交替执行三步更新（$\mathbf x$-、$\mathbf z$-与对偶更新）。随迭代推进，原变量 $\mathbf x$ 与 $\mathbf z$ 逐渐对齐，而对偶变量 $\mathbf u$ 趋于零，表明收敛到固定点 $(\mathbf x^\ast,\mathbf z^\ast,\mathbf u^\ast)$；该演化直观展示了附录 A 分析的固定点收敛行为。此处 ADMM 迭代索引与扩散时间步按设计取为相同。
**图 2（原文第 5 页）：** 定性结果（超分辨率 4×、高斯去模糊、运动去模糊、相位恢复；噪声 $\omega=0.05$），DDiff 相比 DPS 与 DAPS 更锐利、更干净。
**图 3（原文第 7 页）：** 测量噪声水平的影响（10 张 FFHQ 验证图）：(a) 高斯去模糊；(b) 相位恢复。
**图 4（原文第 7 页）：** 高噪声（$\omega=0.3$）相位恢复的定性结果（10 张随机验证图），DDiff 恢复相干全局结构与面部语义，DAPS 出现强烈损坏与噪声伪影。
**图 5（原文第 8 页）：** 时间效率与样本质量（RTX 2080 Ti，100 张 FFHQ 验证图）：(a) 高斯去模糊；(b) 相位恢复；方法名后的数字为 NFE。

**表注汇总：** 表 1（原文第 6 页）为 8 个任务在 FFHQ/ImageNet 上的定量评估（PSNR↑、SSIM↑、LPIPS↓、Residual↓，100 张验证图，噪声 $\omega=0.05$；粗体/下划线为最佳/次佳；95% 置信区间见附录 D——本地 PDF 未含附录）；表 2（原文第 8 页）为对偶变量与加噪步的消融（8 个任务、4 个变体、10 张 FFHQ 验证图；各变体完整描述见附录 F）。两表均已用 PDF 渲染（第 6、8 页）逐格核对。

**本页范围与校对状态：** 本页覆盖本地 CVPR 2026 会议论文集 10 页 PDF（论文编号 23622—23631）全文：摘要、第 1—5 节、算法 1、图 1—5 图注、表 1—2、式（1）—（12）、参考文献 [1]—[46]（英文原条目）。**许可状态：会议论文集版本（CVF 开放获取版），再传播许可待核验；本页仅作学习用途、不计入可公开全文统计（已在页首声明）。** 原文提及的附录 A—F（定理 1 证明、残差定义、LatentDDiff 完整算法与结果、95% 置信区间、DiffPIR 等价性说明、各变体算法）位于补充材料，**本地 10 页 PDF 未包含**，故本页不转录附录正文——这属于原文范围缺口而非翻译遗漏。表格核对：用 `render.py` 渲染 PDF 第 6、8 页并逐格核对表 1（8 个任务 × 7 个方法 × 8 列指标）与表 2（8 个任务 × 4 个变体 × 4 列指标）。原文疑点已在页首译注列出（式 (1)(2) 符号按数学含义复原、相位恢复报告五次最佳、论文未给误差棒、附录缺失、图 3/4 样本量等），均按原文照录并加注。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内图像未数字化转写。因此本页不标记为已验收全文；若需核对具体公式或数值，请以本地会议论文集 PDF 为准。
{% endraw %}