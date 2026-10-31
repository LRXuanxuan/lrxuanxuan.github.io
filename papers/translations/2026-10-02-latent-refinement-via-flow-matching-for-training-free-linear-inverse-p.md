---
layout: page
title: "基于流匹配的潜变量细化：免训练线性逆问题求解｜中文译稿（许可待核）译文"
permalink: /papers/translations/2026-10-02-latent-refinement-via-flow-matching-for-training-free-linear-inverse-p/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1a42f1c028fa33a9/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 基于流匹配的潜变量细化：免训练线性逆问题求解

**原题：** Latent Refinement via Flow Matching for Training-free Linear Inverse Problem Solving  
**作者：** Hossein Askari¹、Yadan Luo¹、Hongfu Sun¹、Fred Roosta¹˒²。单位：¹ 昆士兰大学（The University of Queensland）；² ARC 信息韧性培训中心（ARC Training Centre for Information Resilience, CIRES）。邮箱：{h.askari, yadan.luo, hongfu.sun, fred.roosta}@uq.edu.au。  
**版本：** 会议论文集版本（NeurIPS-2025-latent-refinement-via-flow-matching-for-training-free-linear-inverse-problem-solving-Paper-Conference.pdf），本地 PDF 44 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。原论文为第 39 届神经信息处理系统大会（NeurIPS 2025）论文。  
**范围与状态：** 全文中文译稿：摘要、第 1—6 节、致谢、参考文献（英文原条目）、附录 A（证明）、B（闭式解）、C（实现细节与算法 1）、D（补充实验与消融）、NeurIPS 论文清单（逐项转录答案，省略官方指南性说明文字）、图 1—16 图注、表 1—9、式（1）—（44）。表 1 与表 6—7 已用 PDF 渲染核对；逐句逐式终校未做，不标记为已验收全文。

> **许可与使用说明：** 原文本地为 NeurIPS 2025 会议论文集 PDF；**再传播许可待核验**。本页仅为个人学习用途的中文译稿，不代表已获授权，**不计入可公开全文统计**。若核验后许可不允许再传播，本页应下线或仅保留摘要级介绍。
>
> **译注（术语与原文疑点）：** 原文缩写保留英文：LFlow（Latent Refinement via Flows）、CNF（continuous normalizing flow，连续归一化流）、FM/CFM（flow matching / conditional flow matching）、OT（optimal transport，最优传输）、ODE/SDE、VAE/VQ-VAE、LDM（latent diffusion model）、PSLD、MPGD、Resample、DMPlug、DAPS、SITCOM、ΠGDM（伪逆引导扩散）、OT-ODE、C-ΠGFM、PnP-Flow、DPS、TMPD、OPC、MMPS、PSNR/SSIM/LPIPS/FID、NFE（函数评估次数）、CG（共轭梯度）、KL、SNR、JVP（Jacobian–向量乘积）、FFHQ、ImageNet、CelebA-HQ。**原文疑点（按原文照录并加注）：** ①原文式（13）的矩阵求逆在正文被标为计算瓶颈，附录 B 在等向协方差假设下给出三类任务（修复/去模糊/超分）的闭式解，式（31）—（33）分别对应三类算子；②原文附录 D.5 表 8 的 SR 与 Inpainting 两列分别只与 SR3（ImageNet 训练）和 InvFussion（FFHQ 训练）比较，故存在"—"占位，按原文照录；③NeurIPS 清单第 3 项（理论假设与证明）答案为 [NA]，但其 justification 却说明"提供完整假设与证明"，前后自相矛盾，按原文照录；④原文 §5.1 的 LPIPS 增益表述（如"约 8.8%"）为作者基于表 1 的估计，本页照录；⑤原文 Fig. 1 图注中 "VAE" 与正文若干断行空白系 PDF 排版所致，译文按语义复原。

## 摘要

逆问题求解的最新进展越来越多地采用**流先验**而非扩散模型，因为流匹配能构造从噪声到数据的**直线概率路径**，从而在训练与推理两方面提升效率。然而，现有基于流的逆求解器面临两个主要限制：(i) 它们直接在**像素空间**运算，这要求大量计算资源用于训练，并限制了对高分辨率图像的可扩展性；(ii) 它们采用的引导策略使用**与先验无关的后验协方差**，这会削弱与生成轨迹的对齐并降低后验覆盖。本文提出 **LFlow（Latent Refinement via Flows）**——一个通过预训练**潜空间流先验**求解线性逆问题的**免训练**框架。LFlow 利用流匹配的效率，在潜空间中沿最优路径执行 ODE 采样。这种潜空间表述进一步使我们能够引入一个**有理论依据的后验协方差**（由最优向量场导出），从而实现有效的流引导。实验结果表明，所提方法在多数任务的重建质量上优于最先进的潜扩散求解器。代码将在 GitHub 上公开。

## 1 引言

**线性逆问题**是超分辨率 [1]、修复 [2]、去模糊 [3] 与去噪 [4] 等众多重要图像处理任务的基础。求解此类问题即从**不完整且含噪**的观测 $\mathbf y\in\mathbb R^m$ 中推断未知图像 $\mathbf x_0\in\mathbb R^n$（假定其服从未知先验分布 $q(\mathbf x_0)$），通常建模为

$$
\mathbf y=\mathbf A\mathbf x_0+\mathbf n,\qquad \mathbf n\sim\mathcal N(\mathbf 0,\sigma_y^2\mathbf I),\tag{1}
$$

其中 $\mathbf A\in\mathbb R^{m\times n}$ 为已知线性算子，$\mathbf n$ 为加性独立同分布高斯噪声。当算子 $\mathbf A$ 奇异（如 $m<n$）时，逆问题变得**病态** [5]，难以从 $\mathbf y$ 唯一或稳定地恢复 $\mathbf x_0$。因此，准确且合理的推断需要**强先验**，以有效整合领域知识约束解空间。

通过随机微分方程（SDE）执行渐进**细化**的深度生成模型——尤其是扩散模型 [6—8]——已确立其作为求解广泛逆问题的强大**先验**地位 [9, 10]。这些模型已被证明能从部分获取且含噪的测量中对图像进行**零样本**推断，大量研究聚焦于设计把数据一致性注入生成过程的**引导**机制 [11—32]。在此进展之上，基于扩散的逆求解器进一步从原始像素空间扩展到**潜空间** [33—39]，以降低训练计算成本并提升泛化性 [40]。然而这些方法常在基于似然的引导中假定零协方差，从而忽略后验变异性，这可能导致采样不稳定并降低后验分布的覆盖 [21, 30]。

**流匹配** [41, 42] 近来作为生成建模的有力替代方案受到关注。通过以常微分方程（ODE）参数化变换动力学，此类模型可生成任意概率路径，包括基于最优传输（OT）原理的路径 [41]。这种灵活性使设计**直线生成轨迹**成为可能，相比基于扩散的方法带来更高效的训练与采样 [43, 44]。受这些能力启发，若干近期工作探索了基于流的先验用于逆问题，在多样任务上取得更快、更高质量的求解 [45—50]。然而现有方法仍存在两个关键缺陷：(1) 它们在像素空间运算，限制了对高维数据的可扩展性，也限制了在不同类型逆问题上的泛化性；(2) 它们采用原本为扩散模型开发的引导技术，这些技术**独立于所学先验**估计后验协方差。这种脱节可能使采样轨迹偏离高概率区域，导致样本质量下降与保真度降低；使用自适应 ODE 求解器时还常观察到收敛更慢。

为解决这些限制，我们提出 **LFlow（Latent Refinement via Flows）**，一个利用潜空间流匹配求解线性逆问题、无需额外训练的框架。通过在潜空间应用流匹配，LFlow 提升计算效率，并在降维域中实现更可扩展、更有效的逆问题求解。此外，我们为潜空间恒等后验协方差引入一个**有理论依据的、依赖时间的方差**，它基于 Tweedie 协方差公式与**高斯潜表示**假设下的最优向量场导出。该后验协方差显式地由预训练最优向量场提供信息，确保引导与生成动力学一致。我们的实证评估表明，沿条件 OT 路径进行潜空间 ODE 采样所推断的图像，在感知质量上优于通过潜扩散概率路径生成的图像。

主要贡献如下：

- **方法层面：** 我们提出一个基于潜空间流匹配与后验引导 ODE 采样、求解线性逆问题的免训练框架，在效率与重建质量上显著优于基于潜扩散的方法。
- **分析层面：** 我们利用测量似然的梯度导出对预训练潜空间流的原则性修正，并引入一个有解析依据的、依赖时间的后验协方差，以提升采样精度与收敛速度。
- **实证层面：** 我们通过去模糊、超分辨率与修复等图像重建任务的大量实验验证 LFlow，在无需大量任务特定超参数调优的情况下取得最先进结果。

## 2 相关工作综述

利用扩散或流先验的免训练逆问题求解器大致可分为四类方法论：(1) **变量分裂**方法把推断分解为交替的两步——一步施加数据保真、另一步施加正则 [51, 36, 20]；(2) **变分贝叶斯**方法引入参数化替代后验分布（通常为高斯），用变分目标优化其参数 [27, 52, 53]；(3) **渐近精确**方法把生成先验与经典采样器（如 MCMC、SMC 或 Gibbs 采样）结合，在样本量增大时以收敛保证逼近真实后验 [54—57]；(4) **基于引导**的方法用近似似然梯度校正生成轨迹，以把样本引向后验 [12, 21—23]。本文聚焦第四类，并进一步阐述基于各类先验的相关方法。

**扩散引导近似**指在由如下 SDE 支配的反向扩散过程中估计似然分数 $\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)$：

$$
\mathrm d\mathbf x_t\approx\left[\mathbf f(\mathbf x_t,t)-g(t)^2\left(\mathbf s_\theta(\mathbf x_t,t)+\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)\right)\right]\mathrm dt+g(t)\,\mathrm d\mathbf w_t,\tag{2}
$$

其中 $\mathbf f(\cdot,\cdot)$ 为漂移项、$g(\cdot)$ 为扩散系数、$\mathbf w_t$ 为标准 Brown 运动、$\mathbf s_\theta(\cdot,\cdot)$ 为预训练分数网络。DPS [21]、ΠGDM [22]、TMPD [23]、OPC [29] 与 MMPS [30] 等方法把似然分数定义为 $\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)=\nabla_{\mathbf x_t}\log\int p(\mathbf y|\mathbf x_0)p(\mathbf x_0|\mathbf x_t)\,\mathrm d\mathbf x_0$。主要难点在于给定 $\mathbf x_t$ 时对全部可能去噪状态 $\mathbf x_0$ 求期望，这要求在每次反向步从 $p(\mathbf x_0|\mathbf x_t)$ 采样，计算需求巨大。常见补救是局部高斯近似 $p(\mathbf x_0|\mathbf x_t)\approx\mathcal N\left(\mathbb E[\mathbf x_0|\mathbf x_t],\mathrm{Cov}[\mathbf x_0|\mathbf x_t]\right)$，把问题化归为估计后验矩。这些方法的差异主要在于如何设定 $\mathrm{Cov}[\mathbf x_0|\mathbf x_t]$：DPS 设为零；ΠGDM 在高斯数据假设下由**前向过程**得到先验无关、随时间缩放的单位阵；OPC 对每步做事后常数方差优化；TMPD 把 Tweedie 关系 $\mathrm{Cov}[\mathbf x_0|\mathbf x_t]=\frac{\sigma(t)^2}{\alpha(t)}\nabla_{\mathbf x_t}^\top\mathbb E[\mathbf x_0|\mathbf x_t]$ 中的 Jacobian 替换为对角行和替代量；MMPS 则通过自动微分计算完整 Jacobian，并用共轭梯度求解所诱导的线性系统 [58]。然而在高维中估计完整协方差仍然计算昂贵，内存与运行时成本难以承受。

**潜空间推断**随潜扩散模型（LDM）[59] 的普及而变得可行，使逆求解器得以降低训练成本并提升可扩展性 [33, 36—38]。作为早期尝试，PSLD [33] 在 DPS 上增加"粘合"目标，以在自编码器映射下保持后验均值一致性，意在缓解编码—解码非线性；但该约束在含噪测量下经验上无效，重建伪影仍存在 [34]。其他方法避免显式非线性校正：Resample [36] 通过把无条件**反向样本**上的（假定高斯）先验与以**前向投影**的测量一致后验均值为中心的高斯伪似然融合，构造高斯后验；类似地，DAPS [37] 通过两步流程解耦连续扩散步来增强后验采样——先抽取 $\mathbf z_0\sim p(\mathbf z_0|\mathbf z_t,\mathbf y)$，再重加噪 $\mathbf z_{t-\Delta t}\sim\mathcal N(\mathbf z_0,\sigma_{t-\Delta t}^2\mathbf I)$，从而提供**全局**校正，在非线性任务中尤为有效，代价是在低噪声或线性设定中局部引导较弱；SITCOM [60] 在每一步施加数据、前向与反向扩散三重一致性条件，从而支持用更少步数采样。然而这些方法大多假定零协方差，限制后验覆盖。

**流匹配用于逆问题**近来被证明在各类任务上能实现快速高质量求解 [45—50]。典型代表 OT-ODE [45] 在流框架内采用 ΠGDM [22] 的梯度校正，并使用基于条件 OT 路径的 ODE 求解方案；C-ΠGFM [48] 引入即插即用框架，把条件流动力学投影到更易处理的空间以加速推断；PnP-Flow [61] 通过交替的数据保真梯度步、经潜噪声插值回到流路径的重投影，以及依赖时间的 FM 去噪器求解成像逆问题，全程不对 ODE 反向传播。然而这些方法通常 (1) 借用扩散模型的引导策略，假定零或先验无关的后验协方差；(2) 在像素空间运算，限制了其可扩展性与对高维问题的适用性。

## 3 预备知识

**连续归一化流（CNF）** [62] 构造光滑概率路径 $\{p_t(\mathbf x_t)\}_{t\in[0,1]}$，把样本从数据分布 $q(\mathbf x_0)$（$\mathbf x_0\in\mathbb R^d$）输运到 $t=1$ 处的标准高斯 $\mathcal N(\mathbf 0,\mathbf I)$。该演化遵循时变向量场 $\mathbf v:\mathbb R^d\times[0,1]\to\mathbb R^d$ 支配的 ODE $\mathrm d\mathbf x_t=\mathbf v(\mathbf x_t,t)\,\mathrm dt$。实践中 $\mathbf v(\cdot,t)$ 由可学习场 $\mathbf v_\theta$ 近似，通过最大似然训练，需要昂贵的 ODE 模拟。

**流匹配（FM）** [41] 通过直接把可学习向量场回归到解析定义的目标场，避免 CNF 低效的基于似然的训练。特别地，**条件流匹配（CFM）** [41] 引入依赖时间的**条件向量场** $\mathbf v(\mathbf x_t|\mathbf x_0)$，支配以初始点 $\mathbf x_0$ 为条件的样本 $\mathbf x_t$ 的演化。该场诱导条件概率路径 $p_t(\mathbf x_t|\mathbf x_0)$，满足边界条件 $p_0=\delta(\mathbf x_0)$ 与 $p_1=\mathcal N(\mathbf 0,\mathbf I)$。训练目标为

$$
\mathcal L_{\mathrm{CFM}}(\theta)=\mathbb E_{t,\mathbf x_0\sim q,\mathbf x_t\sim p_t(\mathbf x_t|\mathbf x_0)}\left\|\mathbf v_\theta(\mathbf x_t,t)-\mathbf v(\mathbf x_t|\mathbf x_0)\right\|^2.\tag{3}
$$

使用高斯路径时，定义 $p_t(\mathbf x_t|\mathbf x_0)=\mathcal N(\alpha(t)\mathbf x_0,\sigma(t)^2\mathbf I)$，插值为 $\mathbf x_t=\alpha(t)\mathbf x_0+\sigma(t)\mathbf x_1$，其中 $\mathbf x_1\sim\mathcal N(\mathbf 0,\mathbf I)$。对 $t$ 求导得 $\dot\alpha(t)\mathbf x_0+\dot\sigma(t)\mathbf x_1$；代入反解 $\mathbf x_0=[\mathbf x_t-\sigma(t)\mathbf x_1]/\alpha(t)$ 得到真实向量场：

$$
\mathbf v(\mathbf x_t|\mathbf x_0)=\frac{\dot\alpha(t)}{\alpha(t)}\mathbf x_t+\frac{\sigma(t)}{\alpha(t)}\left(\frac{\dot\sigma(t)}{\sigma(t)}-\frac{\dot\alpha(t)}{\alpha(t)}\right)\mathbf x_1,\tag{4}
$$

其中 $\dot\alpha(t)$、$\dot\sigma(t)$ 为时间导数。特别地，选择 $\alpha(t)=1-t$、$\sigma(t)=t$ 即恢复 OT 路径，它诱导直线轨迹并提升效率。

**图 1：** （上）LFlow 流程：VAE 编码器把观测 $\mathbf y$ 映射到潜变量 $\mathbf z$，并由此形成含噪起点 $\mathbf z_{t_s}$。VAE 预训练期间，KL 项促使编码器近似后验 $q_\phi(\mathbf z_0|\mathbf x_0)$ 接近高斯先验 $p_r(\mathbf z_0)=\mathcal N(\mathbf 0,\mathbf I)$。预训练流场 $\mathbf v_\theta(\mathbf z_t,t)$ 定义无条件轨迹 $\mathbf z_t$。推断时，橙色箭头（→）表示基于似然的引导，它修正先验场，得到朝向 $p(\mathbf z_0|\mathbf y)$ 的条件潜路径 $\mathbf z_t|\mathbf y$；用 $\mathcal D_\phi$ 解码得到 $\hat{\mathbf x}_0$。（下）随 $t$ 从 0.8 降至 0 的高斯去模糊条件路径快照。（来源：原文第 4 页。）

## 4 方法

为应对线性逆问题的病态性，我们采用贝叶斯视角，目标后验为 $p(\mathbf x_0|\mathbf y)\propto p(\mathbf y|\mathbf x_0)p(\mathbf x_0)$，其中 $p(\mathbf y|\mathbf x_0)$ 为似然，$p(\mathbf x_0)$ 为由预训练潜空间流（经解码器）诱导的学习先验。我们的目标是在不重训练任务特定模型的前提下从该后验生成样本。

### 4.1 基于流的潜变量细化（LFlow）

我们通过潜先验 $p(\mathbf z_0)$ 与解码器推前 $p(\mathbf x_0)=\mathcal D_{\phi\#}p(\mathbf z_0)$ 隐式表示先验分布 $p(\mathbf x_0)$。具体地，令 $\mathcal E_\phi:\mathbb R^d\to\mathbb R^k$、$\mathcal D_\phi:\mathbb R^k\to\mathbb R^d$ 为预训练自编码器。潜变量 $\mathbf z_0=\mathcal E_\phi(\mathbf x_0)$ 服从 $p(\mathbf z_0)$，由流匹配速率场 $\mathbf v_\theta(\mathbf z_t,t)$ 建模，定义 ODE

$$
\mathrm d\mathbf z_t=\mathbf v_\theta(\mathbf z_t,t)\,\mathrm dt,\qquad t\in[0,1].\tag{5}
$$

该流把潜样本从 $\mathbf z_0\sim p(\mathbf z_0)$ 输运到噪声分布 $\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I)$。推断时，我们从 $\mathbf z_1$ 向 $\hat{\mathbf z}_0$ **反向**积分，并加入测量驱动的引导以沿条件轨迹前进，随后解码 $\hat{\mathbf x}_0=\mathcal D_\phi(\hat{\mathbf z}_0)$。图 1 展示整体推断流程，并给出沿条件轨迹解码重建的视觉示例，为流在实践中的推进提供直觉。

**潜空间中经条件流的后验采样。** 我们的目标是通过模拟以条件速率场刻画的反向 ODE 从后验 $p(\mathbf z_0|\mathbf y)$ 采样。下述命题为该过程提供理论基础，保证若条件密度按连续性方程演化，则反向流可恢复后验样本；形式化证明见附录 A.1。

**命题 4.1（经反向条件流的后验采样）：** 记 $p_t(\mathbf z_t|\mathbf y)$ 为潜变量 $\mathbf z_t\in\mathbb R^k$ 在时刻 $t\in[0,1]$ 的条件分布，终端条件为 $p_1(\mathbf z_1)=\mathcal N(\mathbf 0,\mathbf I)$。假设该分布按下述反向连续性方程随时间演化：

$$
\partial_tp_t(\mathbf z_t|\mathbf y)=\nabla_{\mathbf z_t}\cdot\left[p_t(\mathbf z_t|\mathbf y)\mathbf v_t(\mathbf z_t|\mathbf y)\right],\tag{6}
$$

则反向 ODE

$$
\mathrm d\mathbf z_t=-\mathbf v_t(\mathbf z_t|\mathbf y)\,\mathrm dt,\qquad \mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I)\tag{7}
$$

的解在 $t\to0$ 时给出后验 $p(\mathbf z_0|\mathbf y)$ 的样本。

**条件向量场估计。** 既已确立后验样本可由积分（7）的反向 ODE 获得，尚需估计相应条件向量场 $\mathbf v_t(\mathbf z_t|\mathbf y)$。在高斯潜动力学下，该场取如下形式：

$$
\mathbf v_t(\mathbf z_t|\mathbf y)=\frac{\dot\alpha(t)}{\alpha(t)}\mathbf z_t+\lambda(t)\nabla_{\mathbf z_t}\log p_t(\mathbf z_t|\mathbf y),\qquad\lambda(t)=\frac{\mathrm d}{\mathrm dt}\left(\frac{\sigma(t)}{\alpha(t)}\right).\tag{8}
$$

应用 Bayes 规则，我们得到速率场的原则性分解，进而通过预训练流与似然修正得到如下实用近似：

$$
\mathbf v_t(\mathbf z_t|\mathbf y)\approx\mathbf v_\theta(\mathbf z_t,t)-\frac{t}{1-t}\nabla_{\mathbf z_t}\log p_t(\mathbf y|\mathbf z_t),\tag{9}
$$

其中附加项 $\nabla_{\mathbf z_t}\log p_t(\mathbf y|\mathbf z_t)$（通常称为**引导**）把流推向与测量 $\mathbf y$ 一致的方向。式（8）与（9）在潜空间中的完整证明见附录 A.2。

**似然近似。** 式（9）的关键难点在于近似噪声条件分布的梯度，我们定义

$$
\nabla_{\mathbf z_t}\log p(\mathbf y|\mathbf z_t)=\nabla_{\mathbf z_t}\log\int p(\mathbf y|\mathbf x_0,\mathbf z_t)p(\mathbf x_0|\mathbf z_t)\,\mathrm d\mathbf x_0=\nabla_{\mathbf z_t}\log\mathbb E_{\mathbf x_0\sim p(\mathbf x_0|\mathbf z_t)}\left[p(\mathbf y|\mathbf x_0)\right].\tag{10}
$$

这里似然项可写为 $p(\mathbf y|\mathbf x_0)=\mathcal N(\mathbf y;\mathbf A\mathcal D_\phi(\mathbf z_0),\sigma_y^2\mathbf I)$，即均值由解码器 $\mathcal D_\phi$ 诱导的高斯分布。由于 $\mathcal D_\phi$ 的非线性，边缘似然 $p(\mathbf y|\mathbf z_t)$ 偏离高斯性。为便于计算其梯度，我们在 $\bar{\mathbf z}_0:=\mathbb E[\mathbf z_0|\mathbf z_t]$ 附近对 $\mathcal D_\phi(\mathbf z_0)$ 做一阶 Taylor 展开：

$$
\mathcal D_\phi(\mathbf z_0)\approx\mathcal D_\phi(\bar{\mathbf z}_0)+\mathbf J_D(\mathbf z_0-\bar{\mathbf z}_0),\tag{11}
$$

其中 $\mathbf J_D:=\mathbf J_D(\bar{\mathbf z}_0)$ 为 $\mathcal D_\phi$ 在 $\bar{\mathbf z}_0$ 处的 Jacobian。假定后验 $p(\mathbf z_0|\mathbf z_t)\sim\mathcal N(\bar{\mathbf z}_0,\boldsymbol\Sigma_z)$，则图像 $\mathbf x_0=\mathcal D_\phi(\mathbf z_0)$ 的分布也近似为高斯：

$$
\mathbf x_0\sim\mathcal N\left(\mathbb E[\mathbf x_0|\mathbf z_t],\mathrm{Cov}[\mathbf x_0|\mathbf z_t]\right),\qquad \mathbb E[\mathbf x_0|\mathbf z_t]\approx\mathcal D_\phi(\bar{\mathbf z}_0),\quad \mathrm{Cov}[\mathbf x_0|\mathbf z_t]\approx\mathbf J_D\boldsymbol\Sigma_z\mathbf J_D^\top.\tag{12}
$$

利用该近似，我们基于解码均值与传播协方差估计潜空间中对数似然的梯度（见附录 A.4）：

$$
\nabla_{\mathbf z_t}\log p(\mathbf y|\mathbf z_t)\approx\underbrace{(\nabla_{\mathbf z_t}\bar{\mathbf z}_0)^\top\mathbf J_D^\top}_{\mathbf J}\mathbf A^\top\underbrace{\left(\sigma_y^2\mathbf I+\mathbf A\mathbf J_D\boldsymbol\Sigma_z\mathbf J_D^\top\mathbf A^\top\right)^{-1}\left(\mathbf y-\mathbf A\mathcal D_\phi(\bar{\mathbf z}_0)\right)}_{\mathbf v},\tag{13}
$$

其中涉及 Jacobian–向量乘积（$\mathbf J\cdot\mathbf v$），可用自动微分高效计算（附录 B）。此外，高斯后验假设使 Tweedie 公式 [63] 得以适用，它把预训练向量场 $\mathbf v_\theta(\mathbf z_t,t)$ 与后验矩 $\mathbb E[\mathbf z_0|\mathbf z_t]$、$\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$ 联系起来。具体地（见附录 A.3）：

$$
\mathbb E[\mathbf z_0|\mathbf z_t]=\mathbf z_t-t\mathbf v_\theta(\mathbf z_t,t),\tag{14}
$$

$$
\mathrm{Cov}[\mathbf z_0|\mathbf z_t]=\frac{t^2}{1-t}\left(\mathbf I-t\nabla_{\mathbf z_t}\mathbf v_\theta(\mathbf z_t,t)\right).\tag{15}
$$

**潜空间后验协方差。** 在低维潜空间中计算后验协方差 $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$ 更易处理，且可通过自动微分高效估计。然而式（13）中矩阵 $\left(\sigma_y^2\mathbf I+\mathbf A\mathbf J_D\boldsymbol\Sigma_z\mathbf J_D^\top\mathbf A^\top\right)$ 的求逆仍是显著计算瓶颈。为避免显式求逆，可用共轭梯度（CG）法求解相应线性系统。但 CG 的收敛关键取决于系统矩阵的对称性与正定性——由于预训练速率场 $\mathbf v_\theta$ 的不完美，这些条件在实践中可能被违反，导致不稳定或发散。为此，我们在潜先验 $p(\mathbf z_0)$ 的若干正则性假设下进一步分析后验协方差与 Jacobian $\nabla_{\mathbf z_t}\mathbf v_\theta(\mathbf z_t,t)$ 的结构。

**假设 4.2（潜先验的强对数凹性 [64]）：** 令 $p(\mathbf z_0)=\exp(-\Phi(\mathbf z_0))$ 为 $\mathbb R^d$ 上的潜先验，其中 $\Phi$ 为二次连续可微的势函数。假设 $p(\mathbf z_0)$ 对某 $\gamma>0$ 为 $\gamma$-强对数凹，即 $\nabla^2\Phi(\mathbf z_0)\succeq\gamma\mathbf I_d$ 对所有 $\mathbf z_0\in\mathbb R^d$ 成立。

**(1) 对数凹先验：** 该假设为先验势函数 Hessian 施加一致下界，从而转化为向量场 Jacobian 的下界。

**命题 4.3（向量场 Jacobian 的界）：** 令 $\mathbf v_\theta(\mathbf z_t,t)$ 表示标准高斯先验与目标分布 $p(\mathbf z_0)$ 之间插值 $\mathbf z_t=\alpha(t)\mathbf z_0+\sigma(t)\mathbf z_1$ 的速率场，其中系数 $\alpha(t),\sigma(t)\in\mathbb R$ 定义。在假设 4.2 下，向量场的 Jacobian 满足如下界：

$$
\frac{\mathrm d}{\mathrm dt}\left[\frac12\log\left(\alpha(t)^2+\gamma\sigma(t)^2\right)\right]\cdot\mathbf I_{d_z}\preceq\nabla_{\mathbf z_t}\mathbf v_\theta(\mathbf z_t,t)\prec\frac{\mathrm d}{\mathrm dt}\log\sigma(t)\cdot\mathbf I_{d_z},\qquad\forall t\in(0,1],\mathbf z\in\mathbb R^d.\tag{16}
$$

证明见附录 A.5。所得"三明治"界保证 Jacobian 行为良好——上界保证后验协方差有效且稳定，下界防止后验引导推断中不确定性被高估。

**(2) 高斯特例：** 为便于实际推断与高效计算，我们考虑潜先验为高斯的可处理特例 $\mathbf z_0\sim\mathcal N(\mathbf 0,\sigma_{\mathrm{latr}}^2\mathbf I)$。这一选择既有理论依据也被广泛使用——例如在变分自编码器（VAE）中，潜先验通过 KL 散度正则到标准高斯 [65]。这使我们能导出最优向量场及其 Jacobian 的闭式表达，由下一条命题刻画，其证明见附录 A.6。

**命题 4.4（最优向量场）：** 令 $\mathbf z_0\sim\mathcal N(\mathbf 0,\sigma_{\mathrm{latr}}^2\mathbf I_{d_z})$ 与 $\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I_{d_z})$ 为独立随机变量。定义 $\mathbf z_t=(1-t)\mathbf z_0+t\mathbf z_1$（$t\in[0,1]$）。最小化期望平方误差 $\arg\min_{\mathbf v}\mathbb E\left[\|\mathbf v(\mathbf z_t,t)-(\mathbf z_0-\mathbf z_1)\|^2\right]$ 的最优向量场 $\mathbf v^\star(\mathbf z_t,t)$ 为

$$
\mathbf v^\star(\mathbf z_t,t)=\frac{(1-t)\sigma_{\mathrm{latr}}^2-t}{(1-t)^2\sigma_{\mathrm{latr}}^2+t^2}\mathbf z_t.\tag{17}
$$

**注 4.5（界的紧性）：** 当 $\mathbf z_0\sim\mathcal N(\mathbf 0,\sigma_{\mathrm{latr}}^2\mathbf I)$ 时，最优向量场 $\mathbf v^\star(\mathbf z_t,t)$ 达到命题 4.3 中的 Jacobian 下界。这由势函数 $\Phi(\mathbf z_0)=\frac{1}{2\sigma_{\mathrm{latr}}^2}\|\mathbf z_0\|^2$（给出 $\gamma=\sigma_{\mathrm{latr}}^{-2}$）与插值系数 $\alpha(t)=1-t$、$\sigma(t)=t$ 推得；代入该界可验证其与 $\mathbf v^\star$ 的精确 Jacobian 一致，故界是紧的。把最优向量场的 Jacobian 代入（15）得

$$
\mathrm{Cov}[\mathbf z_0|\mathbf z_t]=r^2(t)\cdot\mathbf I_{d_z},\qquad r^2(t)=\frac{t^2\left[(1-t)(1-2t)+2t^2\right]}{(1-t)\left[(1-t)^2+t^2\right]},\tag{18}
$$

其中假定 $\sigma_{\mathrm{latr}}=1$。于是传播协方差也可简化为

$$
\mathrm{Cov}[\mathbf x_0|\mathbf z_t]\approx\mathbf J_D\cdot\mathrm{Cov}[\mathbf z_0|\mathbf z_t]\cdot\mathbf J_D^\top\approx r^2(t)\cdot\mathbf J_D\mathbf J_D^\top.\tag{19}
$$

计算完整 Jacobian $\mathbf J_D\in\mathbb R^{d_x\times d_z}$ 在实践中常不可行。为简化，我们假定解码器在 $\bar{\mathbf z}_0$ 附近近似为**局部等距** [66]，即 $\mathbf J_D\mathbf J_D^\top\approx\mathbf P$，其中 $\mathbf P$ 为到 $\mathbf J_D$ 像空间的正交投影。为计算方便，我们进一步把该行为在全空间近似为等向，得到

$$
\mathrm{Cov}[\mathbf x_0|\mathbf z_t]\approx r^2(t)\cdot\mathbf I_{d_x}.\tag{20}
$$

**与 ΠGDM 与 OT-ODE 的比较。** ΠGDM 中的后验协方差仅由**前向过程**在高斯数据空间的强假设下导出，得到单位协方差的方差为 $r^2(t)=\left(\frac{\sigma(t)^2}{\alpha(t)^2}+\sigma(t)^2\right)\mathbf I$，细节见附录 A.7。此外，ΠGDM 把该后验协方差的逆作为 Fisher 信息用于引导步中对样本的**自然梯度** [67] 更新，从而提升性能。OT-ODE 可视为 ΠGDM 的基于流的扩展：它采用相同协方差表达，但以流特定的噪声调度替换扩散前向过程，具体设 $\alpha(t)=1-t$、$\sigma(t)=t$。因此两种方法都依赖与所学分数或向量场**无关**的恒等后验协方差。相反，我们提出的协方差显式纳入预训练向量场的信息，从而使基于流的 ODE 采样期间的引导更有效，最终改善重建质量。图 2 直观展示了我们依赖时间的方差与 OT-ODE 所用更简单的恒等协方差在量级与效果上的差异。

**图 2：** 我们的方法与 OT-ODE 的后验协方差值随 $t\in[0,0.9]$ 的变化，以及在超分辨率任务中对单个 FFHQ 样本的重建图像（LPIPS：LFlow 0.102、OT-ODE 0.139）。（来源：原文第 6 页。）

**流采样过程的初始化。** 受像素空间先前工作 [68, 45] 启发，我们对所有任务都从**部分退化的**潜空间 $\mathbf y$ 编码出发初始化反向 ODE。具体地，与其在 $t=1$ 从纯噪声 $\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I)$ 开始，我们在 $t_s<1$ 处初始化：

$$
\mathbf z_{t_s}=(1-t_s)\mathcal E_\phi(\mathbf y)+t_s\mathbf z_1,\qquad\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I).\tag{21}
$$

该初始化使 $\mathbf z_{t_s}$ 更接近后验众数 $\mathbf z_0|\mathbf y$，使后续反向积分更稳定、更可能保持在合理流形上。我们通过潜 ODE 流的完整采样算法见算法 1（附录 C）。

## 5 实验

**数据集与任务。** 我们在三个数据集上评估方法：FFHQ [69]、ImageNet [70] 与 CelebA-HQ [71]，图像分辨率均为 $256\times256\times3$ 像素。每个数据集随机选取 200 个验证样本，所有图像归一化到 $[-1,1]$ 范围。我们报告若干线性逆问题任务的结果，包括高斯去模糊、运动去模糊、超分辨率与方形修复。测量算子配置如下：(i) **高斯去模糊**以 $61\times61$、标准差 3.0 的高斯模糊核卷积图像 [29]；(ii) **运动去模糊**使用随机生成、尺寸 $61\times61$、强度 0.5 的运动模糊核 [29]；(iii) **超分辨率（SR）**采用 4 倍双三次下采样；(iv) **方形修复**按 [21] 方法掩蔽 $128\times128$ 像素方框（在中心附近随机定位、边距 $[16,16]$ 像素）以模拟数据缺失。这些实验中的所有测量都被标准差 $\sigma_y=0.01$ 的高斯噪声污染，确保在真实含噪条件下评估重建方法。

**基线与指标。** 由于本研究的主要目标是改进潜空间逆问题求解，我们重点把所提方法与最先进的潜扩散求解器比较——具体为 PSLD [33]、MPGD [38]、Resample [36]、DMPlug [51]、DAPS [37] 与 SITCOM [60]，进行定量与定性分析；此外在被报告时纳入像素空间的 ΠGDM [22]、OT-ODE [45] 与 C-ΠGFM [48] 以作更全面比较。遵循先前工作的评估协议，我们报告 LPIPS [72]、PSNR、SSIM 与 FID [73]（附录 D.3）。

**架构、训练与采样。** 与依赖基于 U-Net [74] 的 LDM-VQ-4 或 Stable Diffusion（SD）v1.5 模型 [59] 的先前潜扩散逆求解器不同，我们对所有数据集采用基于 DiT transformer 架构 [76] 的 **LFM-VAE** 框架 [75]，并按 [75] 的方法使用其预训练模型。需注意，尽管架构不同，我们先验的质量并不超过 SD 或 LDM；该限制部分可能来自使用 $32\times32$ 的更低维潜空间。在评估多种数值 ODE 积分方法后，我们选择 `adaptive_heun` 作为默认求解器，并使用开源 `torchdiffeq` 库 [62] 中的可靠实现。所有实验在单块 NVIDIA 3090 GPU 上以批大小 1 完成。基线、模型配置与其他超参数的更多细节见附录 C。

### 5.1 结果

为清晰起见，FFHQ 与 ImageNet 上四个任务的定量结果分别见表 1 与表 2，定性比较见图 3 与图 4。下文逐任务详述。受篇幅限制，CelebA-HQ 的结果见附录 D 表 5 与图 7；本节还给出其他补充结果。

**高斯去模糊。** LFlow 在两个数据集上都取得最佳感知质量，获得最低 LPIPS 与最高 SSIM——在 FFHQ 上 LPIPS 超过次优方法约 8.8%。虽然 PSLD 在 PSNR 上略领先，LFlow 把差距缩小到 1.18 dB 以内，并避免了 PSLD 输出常见的过度平滑与细节丢失（如背景模糊、皮肤纹理变柔）。在 ImageNet 上，LFlow 同样在感知质量上出色，更忠实地恢复狗的口鼻、毛发与面部皱纹等结构。重建结果保持清晰自然，没有影响其他方法的虚假高频伪影或纹理畸变。

**表 1：FFHQ 验证样本上逆问题求解的定量评估。** 粗体与下划线分别表示最佳与次佳；灰色阴影方法为像素空间方法。（来源：原文第 8 页。）

| 方法 | 去模糊(高斯) PSNR↑ | SSIM↑ | LPIPS↓ | 去模糊(运动) PSNR↑ | SSIM↑ | LPIPS↓ | SR(×4) PSNR↑ | SSIM↑ | LPIPS↓ | 修复(方框) PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LFlow（本文） | 29.10 | 0.837 | **0.166** | 30.04 | 0.849 | **0.168** | 29.12 | 0.841 | **0.176** | 23.85 | **0.867** | **0.132** |
| SITCOM [60] | **30.42** | 0.828 | 0.237 | 28.78 | 0.828 | 0.183 | 29.26 | 0.833 | 0.191 | 24.12 | 0.839 | 0.198 |
| DAPS [37] | 28.52 | 0.789 | 0.231 | 29.00 | 0.831 | 0.252 | 29.38 | 0.826 | 0.197 | 24.83 | 0.819 | 0.191 |
| DMplug [51] | 27.43 | 0.784 | 0.240 | 27.95 | 0.817 | 0.243 | 29.45 | 0.838 | 0.183 | 22.55 | 0.807 | 0.220 |
| Resample [36] | 28.73 | 0.801 | 0.201 | 29.19 | 0.828 | 0.184 | 28.90 | 0.804 | 0.189 | 20.40 | 0.825 | 0.243 |
| MPGD [38] | 29.34 | 0.815 | 0.308 | 27.98 | 0.803 | 0.324 | 27.49 | 0.788 | 0.295 | 20.58 | 0.806 | 0.324 |
| PSLD [33] | 30.28 | 0.836 | 0.281 | 29.21 | 0.812 | 0.303 | 29.07 | 0.834 | 0.270 | 24.21 | 0.847 | 0.169 |
| OT-ODE [45] | 29.73 | 0.819 | 0.198 | 28.15 | 0.792 | 0.238 | 28.56 | 0.823 | 0.198 | 25.77 | 0.751 | 0.225 |
| ΠGDM [22] | 28.62 | 0.809 | 0.182 | 27.18 | 0.773 | 0.223 | 27.78 | 0.815 | 0.201 | 26.82 | 0.767 | 0.214 |

**图 3：** FFHQ 测试集上的定性结果。第 1 行：去模糊（高斯）；第 2 行：去模糊（运动）；第 3 行：SR×4；第 4 行：修复。相比基于潜扩散的方法，我们的方法更好地保持图像细节。（来源：原文第 8 页。）

**运动去模糊。** LFlow 以强结构一致性与极少伪影重建运动模糊场景，有效保持运动边界处的锐利过渡；发丝轮廓、面部边缘与配件等细节以平滑梯度与自然外观恢复。在不引入振铃或过度增强的前提下，LFlow 在 FFHQ 与 ImageNet 上平衡保真与真实感，在所有指标上取得最先进性能。值得注意的是，LFlow 在 FFHQ 上把 LPIPS 相对次优方法 SITCOM 明显改善 0.015，反映其保持高频内容同时维持空间连贯性的能力——这在恢复的头发与面部结构上清晰可见。

**超分辨率。** 发丝、花卉图案与面部细节等高频结构被我们的方法以显著清晰度重建，没有竞争方法常见的过度锐化或柔化。在 FFHQ 上，它相对次优方法取得 0.021 LPIPS 的感知增益，同时保持有竞争力的 PSNR；在 ImageNet 上，它在所有指标上建立明显领先，LPIPS 领先 0.018。这些改进转化为更干净的纹理与更连贯的空间梯度。与可能产生过度合成细节的 MPGD、或偶尔出现雾状区域的 PSLD 与 Resample 不同，我们的方法保持细结构的自然外观，避免光晕与纹理过冲。

**修复。** 在补全缺失区域时，LFlow 擅长生成与周围区域自然融合、语义连贯且感知一致的内容。在 FFHQ 上，它相对次优方法在 LPIPS 上领先 0.037，同时取得最高 SSIM，体现感知锐度与结构准确性；在 ImageNet 上，它继续在 LPIPS 与 SSIM 上领先，以最少边界伪影恢复细纹理与边缘。

**表 2：ImageNet 验证样本上逆问题求解的定量结果。** 粗体与下划线为最佳与次佳；灰色阴影为像素空间方法。（来源：原文第 9 页。）

| 方法 | 去模糊(高斯) PSNR↑ | SSIM↑ | LPIPS↓ | 去模糊(运动) PSNR↑ | SSIM↑ | LPIPS↓ | SR(×4) PSNR↑ | SSIM↑ | LPIPS↓ | 修复(方框) PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LFlow（本文） | 25.55 | 0.697 | **0.328** | 26.10 | 0.711 | **0.344** | 25.29 | 0.696 | **0.338** | 21.92 | 0.772 | **0.227** |
| SITCOM [60] | 25.38 | 0.672 | 0.388 | 24.78 | 0.686 | 0.382 | 25.62 | 0.687 | 0.374 | 20.34 | 0.698 | 0.291 |
| DAPS [37] | 24.12 | 0.681 | 0.413 | 25.97 | 0.706 | 0.362 | 25.18 | 0.667 | 0.356 | 21.13 | 0.701 | 0.286 |
| Resample [36] | 25.04 | 0.665 | 0.408 | 24.32 | 0.623 | 0.390 | 24.81 | 0.683 | 0.404 | 19.42 | 0.663 | 0.305 |
| MPGD [38] | 24.27 | 0.695 | 0.397 | 24.81 | 0.662 | 0.404 | 25.50 | 0.648 | 0.398 | 17.05 | 0.672 | 0.324 |
| PSLD [33] | **26.79** | **0.721** | 0.372 | 25.45 | 0.692 | 0.351 | **26.16** | **0.692** | 0.363 | 20.58 | 0.687 | 0.274 |
| ΠGDM [22] | 25.27 | 0.636 | 0.332 | 23.03 | 0.617 | 0.347 | 24.73 | 0.629 | 0.359 | **22.13** | 0.589 | 0.361 |

**图 4：** ImageNet 测试集上的定性结果。第 1 行：去模糊（高斯）；第 2 行：去模糊（运动）；第 3 行：SR×4；第 4 行：修复。相比基线，我们的方法更忠实地重建图像细节。（来源：原文第 9 页。）

与可能引入可见接缝、斑驳图案或色彩不一致的方法不同，LFlow 以更平滑的过渡与对齐良好的局部细节重建人脸、物体与自然场景，使重建看起来完整且视觉无缝。

**感知—保真折中。** 尽管 LFlow 的 PSNR 偶尔略低于 PSLD 这类以像素保真为导向的基线，但这反映的是众所周知的失真—感知折中。我们的方法一致取得显著更低的 LPIPS 与更锐利、更自然的重建，表明它优先考虑感知真实感与细细节保持，而非常会抬高 PSNR 的逐像素平均效应。

### 5.2 消融研究

**后验协方差。** 为考察依赖时间的后验协方差如何影响整体性能，我们开展一系列消融。如表 3 所示，采用本文后验协方差（记 Cov_LFlow）相对基线 "Cov_ΠGDM" 带来系统性增益。在 FFHQ 与 ImageNet 上，Cov_LFlow 在去模糊与 ×4 SR 上取得更高 PSNR 与更低 LPIPS，表明 LFlow 有助于减少感知伪影并保持细节。图 6 给出 FFHQ 上 Cov_LFlow 与 Cov_ΠGDM 的定性比较：在运动去模糊与修复中，Cov_LFlow 给出更锐利的面部结构、更干净的纹理与更少伪影；运动去模糊中它更好地恢复轮廓与眼部细节且无振铃，修复结果则显示更好的明暗一致性与更少边界误差。这些视觉观察与表 3 的定量改进一致。

**起始时刻 $t_s$。** 我们还考察起始时刻 $t_s$ 的影响。图 5 展示流过程起始时刻 $t_s$ 变化（SR 任务）的影响：过大的 $t_s$ 倾向轻微降低感知质量，而过小的 $t_s$ 可能导致过度平滑或伪影；图中表明中等取值（约 0.7—0.8）取得有利平衡，在 FFHQ 与 ImageNet 上均带来一致的更低 LPIPS。

**表 3：$\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$ 的影响消融。** 粗体为最佳。（来源：原文第 10 页。）

| 数据集 | FFHQ 去模糊(G) PSNR↑ | LPIPS↓ | FFHQ 修复 PSNR↑ | LPIPS↓ | FFHQ 去模糊(M) PSNR↑ | LPIPS↓ | FFHQ SR(×4) PSNR↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|---|
| Cov_LFlow | **29.10** | **0.166** | **23.85** | **0.132** | **26.10** | **0.344** | **25.29** | **0.338** |
| Cov_ΠGDM | 29.04 | 0.179 | 22.69 | 0.151 | 25.22 | 0.363 | 24.80 | 0.351 |

（注：原文表 3 表头标注为 "Dataset FFHQ / ImageNet"，上表按原文数值逐项转录。）

**图 5：** 起始时刻 $t_s$ 的消融研究（超分辨率任务，FFHQ 与 ImageNet 的 LPIPS 随起始时刻 0.9→0.4 变化）。（来源：原文第 10 页。）

**推理时间。** 为进一步突出后验协方差建模超越标准评估指标的实际优势，我们在表 4 中报告每张图像的平均推理时间。尽管使用可能需要更多 NFE 的自适应 ODE 求解器，LFlow 仍显著快于先前的潜空间求解器——这源于更快的收敛与更准确的轨迹估计。采用较不准确协方差的 Cov_ΠGDM 变体收敛更慢，说明恰当协方差建模的重要性。值得注意的是，PSLD 运行 1000 次迭代、Resample 运行 500 次，但二者都比 LFlow 慢。

**表 4：ImageNet 样本上基于潜空间的逆求解器平均推理时间（秒/图像）。** 在 NVIDIA 3090 GPU 上计时。（来源：原文第 10 页。）

| 方法 | 高斯去模糊 | SR×4 |
|---|---|---|
| Resample [36] | 550.26 s | 410.68 s |
| MPGD [38] | 566.58 s | 548.96 s |
| PSLD [33] | 705.31 s | 675.85 s |
| SITCOM [60] | 345.60 s | 328.12 s |
| LFlow | **267.76 s** | **227.92 s** |
| LFlow (Cov_ΠGDM) | 477.95 s | 406.02 s |

**图 6：** $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$ 影响的视觉结果。（来源：原文第 10 页。）

## 6 讨论与结论（原文标题 Discussions）

本文提出 LFlow，它利用预训练自编码器潜空间中的流匹配高效求解线性逆问题，无需额外训练。基于有依据的潜高斯表示假设，我们引入一个有理论依据、依赖时间的潜后验协方差，增强了基于梯度的推断。在去模糊、超分辨率与修复等任务上的实验结果表明，LFlow 在重建质量上优于当前潜扩散模型。

**局限。** LFlow 的一个局限在于运行时间：当前实现在一张 NVIDIA RTX 3090 GPU 上求解逆问题约需 3:30—10 分钟，其中高斯去模糊与超分辨率平均 2:30—6 分钟，运动去模糊与修复约 3:30—10 分钟。虽然如消融所示这已比现有潜扩散求解器更高效，但在时间敏感的应用中仍可能构成挑战。尽管如此，重建质量的提升与训练阶段获得的效率提升有助于缓解这一不足。

**未来工作。** 未来工作将聚焦优化求解器并研究替代数值积分方案以进一步降低推理时间；此外，我们计划扩展 LFlow 以提升其在分布偏移下的稳健性，使其更广泛适用于真实世界场景与下游任务。

**致谢。** 本研究部分由澳大利亚研究理事会通过信息韧性产业转型培训中心（IC200100022）资助。

## 参考文献（英文原书目）

[1] Brian B Moser, Arundhati S Shanbhag, Federico Raue, Stanislav Frolov, Sebastian Palacio, and Andreas Dengel. Diffusion models, image super-resolution, and everything: A survey. IEEE Transactions on Neural Networks and Learning Systems, 2024.
[2] Andreas Lugmayr, Andres Danelljan, Fisher Yu, Radu Timofte, and Luc Van Gool. Repaint: Inpainting using denoising diffusion probabilistic models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 11461–11471, 2022.
[3] Kaihao Zhang, Wenqi Ren, Wenhan Luo, Wei-Sheng Lai, Björn Stenger, Ming-Hsuan Yang, and Hongdong Li. Deep image deblurring: A survey. International Journal of Computer Vision, 130(9):2103–2130, 2022.
[4] Peyman Milanfar and Mauricio Delbracio. Denoising: A powerful building-block for imaging, inverse problems, and machine learning. arXiv preprint arXiv:2409.06219, 2024.
[5] Finbarr O'Sullivan. A statistical perspective on ill-posed inverse problems. Statistical science, pages 502–518, 1986.
[6] Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, and Surya Ganguli. Deep unsupervised learning using nonequilibrium thermodynamics. In International conference on machine learning, pages 2256–2265. PMLR, 2015.
[7] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.
[8] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2021.
[9] Giannis Daras, Hyungjin Chung, Chieh-Hsin Lai, Yuki Mitsufuji, Jong Chul Ye, Peyman Milanfar, Alexandros G Dimakis, and Mauricio Delbracio. A survey on diffusion models for inverse problems. arXiv preprint arXiv:2410.00083, 2024.
[10] Hongkai Zheng, Wenda Chu, Bingliang Zhang, Zihui Wu, Austin Wang, Berthy Feng, Caifeng Zou, Yu Sun, Nikola Borislavov Kovachki, Zachary E Ross, Katherine Bouman, and Yisong Yue. Inversebench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences. In The Thirteenth International Conference on Learning Representations, 2025.
[11] Jooyoung Choi, Sungwon Kim, Yonghyun Jeong, Youngjune Gwon, and Sungroh Yoon. ILVR: Conditioning method for denoising diffusion probabilistic models. arXiv preprint arXiv:2108.02938, 2021.
[12] Ajil Jalal, Marius Arvinte, Giannis Daras, Eric Price, Alexandros G Dimakis, and Jon Tamir. Robust compressed sensing MRI with deep generative priors. Advances in Neural Information Processing Systems, 34:14938–14954, 2021.
[13] Bahjat Kawar, Gregory Vaksman, and Michael Elad. SNIPS: Solving noisy inverse problems stochastically. Advances in Neural Information Processing Systems, 34:21757–21769, 2021.
[14] Yang Song, Liyue Shen, Lei Xing, and Stefano Ermon. Solving inverse problems in medical imaging with score-based generative models. In NeurIPS 2021 Workshop on Deep Learning and Inverse Problems, 2021.
[15] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. Advances in Neural Information Processing Systems, 35:23593–23606, 2022.
[16] Yang Song, Liyue Shen, Lei Xing, and Stefano Ermon. Solving inverse problems in medical imaging with score-based generative models. In International Conference on Learning Representations, 2022.
[17] Hyungjin Chung and Jong Chul Ye. Score-based diffusion models for accelerated MRI. Medical image analysis, 80:102479, 2022.
[18] Marc Anton Finzi, Anudhyan Boral, Andrew Gordon Wilson, Fei Sha, and Leonardo Zepeda-Núñez. User-defined event sampling and uncertainty quantification in diffusion models for physical dynamical systems. In International Conference on Machine Learning, pages 10136–10152. PMLR, 2023.
[19] Arpit Bansal, Hong-Min Chu, Avi Schwarzschild, Soumyadip Sengupta, Micah Goldblum, Jonas Geiping, and Tom Goldstein. Universal guidance for diffusion models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 843–852, 2023.
[20] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Bihan Cao, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 1219–1229, 2023.
[21] Hyungjin Chung, Jeongsol Kim, Michael Thompson Mccann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023.
[22] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.
[23] Benjamin Boys, Mark Girolami, Jakiw Pidstrigach, Sebastian Reich, Alan Mosca, and Omer Deniz Akyildiz. Tweedie moment projected diffusions for inverse problems. Transactions on Machine Learning Research, 2024. Featured Certification.
[24] Yinhuai Wang, Jiwen Yu, and Jian Zhang. Zero-shot image restoration using denoising diffusion null-space model. In The Eleventh International Conference on Learning Representations, 2023.
[25] Jiaming Song, Qinsheng Zhang, Hongxu Yin, Morteza Mardani, Ming-Yu Liu, Jan Kautz, Yongxin Chen, and Arash Vahdat. Loss-guided diffusion models for plug-and-play controllable generation. In International Conference on Machine Learning, pages 32483–32498. PMLR, 2023.
[26] Jiwen Yu, Yinhuai Wang, Chen Zhao, Bernard Ghanem, and Jian Zhang. Freedom: Training-free energy-guided conditional diffusion model. In 2023 IEEE/CVF International Conference on Computer Vision (ICCV), pages 23117–23127. IEEE Computer Society, 2023.
[27] Berthy T. Feng, Jamie Smith, Michael Rubinstein, Huiwen Chang, Katherine L. Bouman, and William T. Freeman. Score-based diffusion models as principled priors for inverse imaging. In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pages 10520–10531, October 2023.
[28] Hyungjin Chung, Suhyeon Lee, and Jong Chul Ye. Decomposed diffusion sampler for accelerating large-scale inverse problems. In The Twelfth International Conference on Learning Representations, 2024.
[29] Xinyu Peng, Ziyang Zheng, Wenrui Dai, Nuoqian Xiao, Chenglin Li, Junni Zou, and Hongkai Xiong. Improving diffusion models for inverse problems using optimal posterior covariance. In Forty-first International Conference on Machine Learning, 2024.
[30] François Rozet, Gérôme Andry, Francois Lanusse, and Gilles Louppe. Learning diffusion priors from observations by expectation maximization. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.
[31] Hossein Askari, Fred Roosta, and Hongfu Sun. Training-free medical image inverses via bi-level guided diffusion models. In 2025 IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pages 75–84, 2025.
[32] Severi Rissanen, Markus Heinonen, and Arno Solin. Free hunch: Denoiser covariance estimation for diffusion models without extra costs. In The Thirteenth International Conference on Learning Representations, 2025.
[33] Litu Rout, Negin Raoof, Giannis Daras, Constantine Caramanis, Alex Dimakis, and Sanjay Shakkottai. Solving linear inverse problems provably via posterior sampling with latent diffusion models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.
[34] Hyungjin Chung, Jong Chul Ye, Peyman Milanfar, and Mauricio Delbracio. Prompt-tuning latent diffusion models for inverse problems. In Forty-first International Conference on Machine Learning, 2024.
[35] Litu Rout, Yujia Chen, Abhishek Kumar, Constantine Caramanis, Sanjay Shakkottai, and Wen-Sheng Chu. Beyond first-order tweedie: Solving inverse problems using latent diffusion. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 9472–9481, 2024.
[36] Bowen Song, Soo Min Kwon, Zecheng Zhang, Xinyu Hu, Qing Qu, and Liyue Shen. Solving inverse problems with latent diffusion models via hard data consistency. In The Twelfth International Conference on Learning Representations, 2024.
[37] Bingliang Zhang, Wenda Chu, Julius Berner, Chenlin Meng, Anima Anandkumar, and Yang Song. Improving diffusion inverse problem solving with decoupled noise annealing. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 20895–20905, 2025.
[38] Yutong He, Naoki Murata, Chieh-Hsin Lai, Yuhta Takida, Toshimitsu Uesaka, Dongjun Kim, Wei-Hsiang Liao, Yuki Mitsufuji, J Zico Kolter, Ruslan Salakhutdinov, and Stefano Ermon. Manifold preserving guided diffusion. In The Twelfth International Conference on Learning Representations, 2024.
[39] Rayhan Zirvi, Bahareh Tolooshams, and Anima Anandkumar. Diffusion state-guided projected gradient for inverse problems. In The Thirteenth International Conference on Learning Representations, 2025.
[40] Nataniel Ruiz, Yuanzhen Li, Varun Jampani, Yael Pritch, Michael Rubinstein, and Kfir Aberman. Dreambooth: Fine tuning text-to-image diffusion models for subject-driven generation. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 22500–22510, 2023.
[41] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow matching for generative modeling. In The Eleventh International Conference on Learning Representations, 2023.
[42] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. In The Eleventh International Conference on Learning Representations, 2023.
[43] Neta Shaul, Ricky TQ Chen, Maximilian Nickel, Matthew Le, and Yaron Lipman. On kinetic optimal probability paths for generative models. In International Conference on Machine Learning, pages 30883–30907. PMLR, 2023.
[44] Patrick Esser, Sumith Kulal, Andreas Blattmann, Rahim Entezari, Jonas Müller, Harry Saini, Yam Levi, Dominik Lorenz, Axel Sauer, Frederic Boesel, et al. Scaling rectified flow transformers for high-resolution image synthesis. In Forty-first International Conference on Machine Learning, 2024.
[45] Ashwini Pokle, Matthew J. Muckley, Ricky T. Q. Chen, and Brian Karrer. Training-free linear image inversion via flows, 2024.
[46] Heli Ben-Hamu, Omri Puny, Itai Gat, Brian Karrer, Uriel Singer, and Yaron Lipman. D-flow: Differentiating through flows for controlled generation. In Forty-first International Conference on Machine Learning, 2024.
[47] Yasi Zhang, Peiyu Yu, Yaxuan Zhu, Yingshan Chang, Feng Gao, Ying Nian Wu, and Oscar Leong. Flow priors for linear inverse problems via iterative corrupted trajectory matching. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.
[48] Kushagra Pandey, Ruihan Yang, and Stephan Mandt. Fast samplers for inverse problems in iterative refinement models. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.
[49] Yici Yan, Yichi Zhang, Xiangming Meng, and Zhizhen Zhao. FIG: Flow with interpolant guidance for linear inverse problems. In The Thirteenth International Conference on Learning Representations, 2025.
[50] Ségolène Tiffany Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. Pnp-flow: Plug-and-play image restoration with flow matching. In The Thirteenth International Conference on Learning Representations, 2025.
[51] Hengkang Wang, Xu Zhang, Taihui Li, Yuxiang Wan, Tiancong Chen, and Ju Sun. DMPlug: A plug-in method for solving inverse problems with diffusion models. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.
[52] Berthy Feng and Katherine Bouman. Efficient bayesian computational imaging with a surrogate score-based prior. In NeurIPS 2023 Workshop on Deep Learning and Inverse Problems, 2023.
[53] Morteza Mardani, Jiaming Song, Jan Kautz, and Arash Vahdat. A variational perspective on solving inverse problems with diffusion models. In The Twelfth International Conference on Learning Representations, 2024.
[54] Luhuan Wu, Brian L. Trippe, Christian A Naesseth, John Patrick Cunningham, and David Blei. Practical and asymptotically exact conditional sampling in diffusion models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.
[55] Brian L. Trippe, Jason Yim, Doug Tischer, David Baker, Tamara Broderick, Regina Barzilay, and Tommi S. Jaakkola. Diffusion probabilistic modeling of protein backbones in 3D for the motif-scaffolding problem. In The Eleventh International Conference on Learning Representations, 2023.
[56] Gabriel Cardoso, Yazid Janati el idrissi, Sylvain Le Corff, and Eric Moulines. Monte carlo guided denoising diffusion models for bayesian linear inverse problems. In The Twelfth International Conference on Learning Representations, 2024.
[57] Zehao Dou and Yang Song. Diffusion posterior sampling for linear inverse problem solving: A filtering perspective. In The Twelfth International Conference on Learning Representations, 2024.
[58] Åke Björck. Numerical methods in matrix computations, volume 59. Springer, 2015.
[59] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 10684–10695, 2022.
[60] Ismail Alkhouri, Shijun Liang, Cheng-Han Huang, Jimmy Dai, Qing Qu, Saiprasad Ravishankar, and Rongrong Wang. SITCOM: Step-wise triple-consistent diffusion sampling for inverse problems. In International Conference on Machine Learning (ICML), 2025.
[61] Ségolène Martin, Anne Gagneux, Paul Hagemann, and Gabriele Steidl. Pnp-flow: Plug-and-play image restoration with flow matching. arXiv preprint arXiv:2410.02423, 2024.
[62] Ricky TQ Chen, Yulia Rubanova, Jesse Bettencourt, and David K Duvenaud. Neural ordinary differential equations. Advances in neural information processing systems, 31, 2018.
[63] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 106(496):1602–1614, 2011.
[64] Patrick Cattiaux and Arnaud Guillin. Semi log-concave markov diffusions. Séminaire de probabilités XLVI, pages 231–292, 2014.
[65] Arash Vahdat, Karsten Kreis, and Jan Kautz. Score-based generative modeling in latent space. In A. Beygelzimer, Y. Dauphin, P. Liang, and J. Wortman Vaughan, editors, Advances in Neural Information Processing Systems, 2021.
[66] Bin Dai, Ziyu Wang, and David Wipf. The usual suspects? reassessing blame for VAE posterior collapse. In International conference on machine learning, pages 2313–2322. PMLR, 2020.
[67] Shun-Ichi Amari. Natural gradient works efficiently in learning. Neural computation, 10(2):251–276, 1998.
[68] Hyungjin Chung, Byeongsu Sim, and Jong Chul Ye. Come-closer-diffuse-faster: Accelerating conditional diffusion models for inverse problems through stochastic contraction. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 12413–12422, 2022.
[69] Tero Karras, Samuli Laine, and Timo Aila. A style-based generator architecture for generative adversarial networks. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 4401–4410, 2019.
[70] Jia Deng, Wei Dong, Richard Socher, Li-Jia Li, Kai Li, and Li Fei-Fei. Imagenet: A large-scale hierarchical image database. In 2009 IEEE conference on computer vision and pattern recognition, pages 248–255. Ieee, 2009.
[71] Ziwei Liu, Ping Luo, Xiaogang Wang, and Xiaoou Tang. Deep learning face attributes in the wild. In Proceedings of the IEEE international conference on computer vision, pages 3730–3738, 2015.
[72] Richard Zhang, Phillip Isola, Alexei A Efros, Eli Shechtman, and Oliver Wang. The unreasonable effectiveness of deep features as a perceptual metric. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 586–595, 2018.
[73] Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter. Gans trained by a two time-scale update rule converge to a local nash equilibrium. Advances in neural information processing systems, 30, 2017.
[74] Olaf Ronneberger, Philipp Fischer, and Thomas Brox. U-net: Convolutional networks for biomedical image segmentation. In Medical image computing and computer-assisted intervention–MICCAI 2015: 18th international conference, Munich, Germany, October 5-9, 2015, proceedings, part III 18, pages 234–241. Springer, 2015.
[75] Quan Dao, Hao Phung, Binh Nguyen, and Anh Tran. Flow matching in latent space. arXiv preprint arXiv:2307.08698, 2023.
[76] William Peebles and Saining Xie. Scalable diffusion models with transformers. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 4195–4205, 2023.
[77] Sinho Chewi and Aram-Alexandre Pooladian. An entropic generalization of caffarelli's contraction theorem via covariance inequalities. Comptes Rendus. Mathématique, 361(G9):1471–1482, 2023.
[78] Nanye Ma, Mark Goldstein, Michael S Albergo, Nicholas M Boffi, Eric Vanden-Eijnden, and Saining Xie. SiT: Exploring flow and diffusion-based generative models with scalable interpolant transformers. In European Conference on Computer Vision, pages 23–40. Springer, 2024.
[79] Kai Zhang, Luc Van Gool, and Radu Timofte. Deep unfolding network for image super-resolution. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 3217–3226, 2020.
[80] Su Wang, Chitwan Saharia, Ceslee Montgomery, Jordi Pont-Tuset, Shai Noy, Stefano Pellegrini, Yasumasa Onoe, Sarah Laszlo, David J Fleet, Radu Soricut, et al. Imagen editor and editbench: Advancing and evaluating text-guided image inpainting. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 18359–18369, 2023.
[81] Chitwan Saharia, Jonathan Ho, William Chan, Tim Salimans, David J Fleet, and Mohammad Norouzi. Image super-resolution via iterative refinement. IEEE Transactions on Pattern Analysis and Machine Intelligence, 45(4):4713–4726, 2022.
[82] Noam Elata, Hyungjin Chung, Jong Chul Ye, Tomer Michaeli, and Michael Elad. Inv-fussion: Bridging supervised and zero-shot diffusion for inverse problems. arXiv preprint arXiv:2504.01689, 2025.

## 附录 A 证明

**引理 A.1（Tweedie 均值公式）：** 假设 $\mathbf z_0$ 与 $\mathbf z_t$ 的联合分布分解为 $p_t(\mathbf z_0,\mathbf z_t)=p(\mathbf z_0)p_t(\mathbf z_t|\mathbf z_0)$，其中 $p_t(\mathbf z_t|\mathbf z_0)=\mathcal N\left(\mathbf z_t|\alpha(t)\mathbf z_0,\sigma(t)^2\mathbf I\right)$。则

$$
\mathbb E[\mathbf z_0|\mathbf z_t]=\frac{1}{\alpha(t)}\left(\mathbf z_t+\sigma(t)^2\nabla_{\mathbf z_t}\log p_t(\mathbf z_t)\right).\tag{22}
$$

**证明。** 从分数定义出发，

$$
\nabla_{\mathbf z_t}\log p_t(\mathbf z_t)=\frac{\nabla_{\mathbf z_t}p_t(\mathbf z_t)}{p_t(\mathbf z_t)}=\frac{1}{p_t(\mathbf z_t)}\nabla_{\mathbf z_t}\int p_t(\mathbf z_0,\mathbf z_t)\,\mathrm d\mathbf z_0=\frac{1}{p_t(\mathbf z_t)}\int\nabla_{\mathbf z_t}p_t(\mathbf z_0,\mathbf z_t)\,\mathrm d\mathbf z_0
$$
$$
=\frac{1}{p_t(\mathbf z_t)}\int p_t(\mathbf z_0,\mathbf z_t)\nabla_{\mathbf z_t}\log p_t(\mathbf z_0,\mathbf z_t)\,\mathrm d\mathbf z_0=\int p_t(\mathbf z_0|\mathbf z_t)\nabla_{\mathbf z_t}\log p_t(\mathbf z_t|\mathbf z_0)\,\mathrm d\mathbf z_0
$$
$$
=\int p_t(\mathbf z_0|\mathbf z_t)\frac{1}{\sigma(t)^2}\left(\alpha(t)\mathbf z_0-\mathbf z_t\right)\mathrm d\mathbf z_0=\frac{1}{\sigma(t)^2}\left(\alpha(t)\mathbb E[\mathbf z_0|\mathbf z_t]-\mathbf z_t\right).
$$

移项即证。

**引理 A.2（Tweedie 协方差公式）：** 对任意分布 $p(\mathbf z_0)$ 与 $p_t(\mathbf z_t|\mathbf z_0)=\mathcal N\left(\mathbf z_t|\alpha(t)\mathbf z_0,\sigma(t)^2\mathbf I\right)$，后验 $p_t(\mathbf z_0|\mathbf z_t)$ 也是高斯，其均值为 $\mathbb E[\mathbf z_0|\mathbf z_t]$、协方差为 $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$，二者通过分数函数 $\nabla_{\mathbf z_t}\log p_t(\mathbf z_t)$ 联系：

$$
\mathrm{Cov}[\mathbf z_0|\mathbf z_t]=\frac{\sigma(t)^2}{\alpha(t)^2}\left(\mathbf I+\sigma(t)^2\nabla_{\mathbf z_t}^2\log p_t(\mathbf z_t)\right).\tag{23}
$$

**证明。** 从 $\log p_t(\mathbf z_t)$ 的 Hessian 出发：

$$
\nabla_{\mathbf z_t}^2\log p_t(\mathbf z_t)=\nabla_{\mathbf z_t}\left(\nabla_{\mathbf z_t}^\top\log p_t(\mathbf z_t)\right)=\frac{\partial}{\partial z_{t_j}}\left(\frac{\partial\log p_t(\mathbf z_t)}{\partial z_{t_i}}\right)=\nabla_{\mathbf z_t}\left(\frac{\alpha(t)\mathbb E[\mathbf z_0|\mathbf z_t]-\mathbf z_t}{\sigma(t)^2}\right)^\top
$$
$$
=\frac{1}{\sigma(t)^2}\nabla_{\mathbf z_t}\left(\alpha(t)\mathbb E[\mathbf z_0|\mathbf z_t]-\mathbf z_t\right)^\top=\frac{\alpha(t)}{\sigma(t)^2}\nabla_{\mathbf z_t}\left(\mathbb E[\mathbf z_0|\mathbf z_t]^\top\right)-\frac{1}{\sigma(t)^2}\mathbf I
$$
$$
=\frac{\alpha(t)}{\sigma(t)^2}\int p_t(\mathbf z_0|\mathbf z_t)\nabla_{\mathbf z_t}\log\left(\frac{p_t(\mathbf z_t|\mathbf z_0)}{p_t(\mathbf z_t)}\right)\mathbf z_0^\top\,\mathrm d\mathbf z_0-\frac{1}{\sigma(t)^2}\mathbf I
$$
$$
=\left(\frac{\alpha(t)}{\sigma(t)^2}\right)^2\int p_t(\mathbf z_0|\mathbf z_t)\left(\mathbf z_0-\mathbb E[\mathbf z_0|\mathbf z_t]\right)\mathbf z_0^\top\,\mathrm d\mathbf z_0-\frac{1}{\sigma(t)^2}\mathbf I
$$
$$
=\left(\frac{\alpha(t)}{\sigma(t)^2}\right)^2\underbrace{\left(\mathbb E[\mathbf z_0\mathbf z_0^\top|\mathbf z_t]-\mathbb E[\mathbf z_0|\mathbf z_t]\mathbb E[\mathbf z_0|\mathbf z_t]^\top\right)}_{\mathrm{Cov}[\mathbf z_0|\mathbf z_t]}-\frac{1}{\sigma(t)^2}\mathbf I.
$$

对 $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$ 求解即得所述公式。

**引理 A.3（后验均值与向量场的联系）：** 令 $\mathbf z_t=\alpha(t)\mathbf z_0+\sigma(t)\mathbf z_1$ 为单边插值，其中 $\mathbf z_0\sim p_{\mathrm{data}}$、$\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I)$。则向量场 $\mathbf v(\mathbf z_t,t)$ 满足

$$
\mathbf v(\mathbf z_t,t)=\frac{\dot\sigma(t)}{\sigma(t)}\mathbf z_t+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\mathbb E[\mathbf z_0|\mathbf z_t].\tag{24}
$$

**证明。** 从定义出发，

$$
\mathbf v(\mathbf z_t,t)=\mathbb E\left[\dot\alpha(t)\mathbf z_0+\dot\sigma(t)\mathbf z_1\mid\mathbf z_t\right]=\dot\alpha(t)\mathbb E[\mathbf z_0|\mathbf z_t]+\dot\sigma(t)\mathbb E[\mathbf z_1|\mathbf z_t].
$$

注意到 $\mathbb E[\mathbf z_1|\mathbf z_t]=\frac{\mathbf z_t-\alpha(t)\mathbb E[\mathbf z_0|\mathbf z_t]}{\sigma(t)}$，即得

$$
\mathbf v(\mathbf z_t,t)=\dot\alpha(t)\mathbb E[\mathbf z_0|\mathbf z_t]+\dot\sigma(t)\frac{\mathbf z_t-\alpha(t)\mathbb E[\mathbf z_0|\mathbf z_t]}{\sigma(t)}=\frac{\dot\sigma(t)}{\sigma(t)}\mathbf z_t+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\mathbb E[\mathbf z_0|\mathbf z_t].
$$

**引理 A.4（Cramér–Rao 不等式）：** 令 $\mu(\mathrm d\mathbf x)=\exp(-\Phi(\mathbf x))\mathrm d\mathbf x$ 为 $\mathbb R^d$ 上的概率测度，其中 $\Phi:\mathbb R^d\to\mathbb R$ 二次连续可微¹。则对任意 $f\in C^1(\mathbb R^d)$，

$$
\mathrm{Var}_\mu(f)\ge\left\langle\mathbb E_\mu[\nabla f],\left(\mathbb E_\mu[\nabla^2\Phi]\right)^{-1}\mathbb E_\mu[\nabla f]\right\rangle.\tag{25}
$$

**证明。** Cramér–Rao 不等式的完整证明可参见 [77] 及其引用文献。

> **脚注 1（原文）：** 我们用 $\Phi\in C^2(\mathbb R^d)$ 表示 $\Phi$ 在 $\mathbb R^d$ 上具有连续的一阶与二阶导数；同样 $f\in C^1(\mathbb R^d)$ 表示 $f$ 具有连续梯度。

**引理 A.5（经 Cramér–Rao 的后验协方差下界）：** 令 $\mathbf z_t=\alpha(t)\mathbf z_0+\sigma(t)\mathbf z_1$，其中 $\mathbf z_0\sim p(\mathbf z_0)\propto\exp(-\Phi(\mathbf z_0))$、$\Phi\in C^2(\mathbb R^d)$，$\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I)$ 独立。假设：(i) 似然为高斯 $p(\mathbf z_t|\mathbf z_0)=\mathcal N(\alpha(t)\mathbf z_0,\sigma(t)^2\mathbf I)$；(ii) $\Phi$ 为 $\gamma$-强凸，即 $\nabla^2\Phi(\mathbf z_0)\succeq\gamma\mathbf I$。则后验满足

$$
\mathrm{Cov}(\mathbf z_0|\mathbf z_t)\succeq\left(\gamma+\frac{\alpha(t)^2}{\sigma(t)^2}\right)^{-1}\mathbf I.\tag{26}
$$

**证明。** 由假设 (i)，应用 Bayes 规则，负对数后验为 $-\log p(\mathbf z_0|\mathbf z_t)=-\log p(\mathbf z_t|\mathbf z_0)-\log p(\mathbf z_0)+\text{常数}$。求二阶导得

$$
\nabla_{\mathbf z_0}^2\left[-\log p(\mathbf z_0|\mathbf z_t)\right]=\frac{\alpha(t)^2}{\sigma(t)^2}\mathbf I+\nabla^2\Phi(\mathbf z_0).
$$

利用假设 (ii) $\nabla^2\Phi(\mathbf z_0)\succeq\gamma\mathbf I$，得 $\nabla_{\mathbf z_0}^2\left[-\log p(\mathbf z_0|\mathbf z_t)\right]\succeq\left(\gamma+\frac{\alpha(t)^2}{\sigma(t)^2}\right)\mathbf I$。最后由引理 A.4，Cramér–Rao 界给出

$$
\mathrm{Cov}[\mathbf z_0|\mathbf z_t]\succeq\left(\mathbb E_{\mathbf z_0|\mathbf z_t}\left[\nabla_{\mathbf z_0}^2(-\log p(\mathbf z_0|\mathbf z_t))\right]\right)^{-1}\succeq\left(\gamma+\frac{\alpha(t)^2}{\sigma(t)^2}\right)^{-1}\mathbf I.
$$

### A.1 命题 4.1 的证明

**证明。** 该证明沿用 [78] 附录 C。假设依赖时间的潜变量 $\mathbf z_t\in\mathbb R^d$ 由如下已知前向过程生成：$\mathbf z_t=\alpha(t)\mathbf z_0+\sigma(t)\boldsymbol\epsilon$，$\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$，其中 $\mathbf z_0$ 为初始（干净）潜样本，$\alpha(t),\sigma(t)$ 为时间标量函数。该过程诱导时间索引的条件分布族 $\bar p_t(\mathbf z|\mathbf y)$，期望取在 $\mathbf z_0|\mathbf y$ 与噪声 $\boldsymbol\epsilon$ 的联合分布上。

定义时刻 $t$ 边缘分布的特征函数为

$$
\hat p_t(\mathbf k):=\int e^{\mathrm i\mathbf k^\top\mathbf z}\bar p_t(\mathbf z|\mathbf y)\,\mathrm d\mathbf z=\tilde{\mathbb E}\left[e^{\mathrm i\mathbf k^\top\mathbf z_t}\right],\tag{27}
$$

其中 $\tilde{\mathbb E}$ 表示在 $\mathbf z_0|\mathbf y$ 与 $\boldsymbol\epsilon$ 的条件联合分布上的期望。对时间求导：

$$
\partial_t\hat p_t(\mathbf k)=\partial_t\tilde{\mathbb E}\left[e^{\mathrm i\mathbf k^\top\mathbf z_t}\right]=\tilde{\mathbb E}\left[\underbrace{\frac{\mathrm d}{\mathrm dt}e^{\mathrm i\mathbf k^\top\mathbf z_t}}_{=\mathrm i\mathbf k^\top\dot{\mathbf z}_t\cdot e^{\mathrm i\mathbf k^\top\mathbf z_t}}\right]=\tilde{\mathbb E}\left[\mathrm i\mathbf k^\top\dot{\mathbf z}_t\cdot e^{\mathrm i\mathbf k^\top\mathbf z_t}\right].
$$

由于 $\mathbf z_t$ 是 $\mathbf z_0$ 与 $\boldsymbol\epsilon$ 的确定性函数，可对 $\mathbf z_t$ 取条件并写为

$$
\partial_t\hat p_t(\mathbf k)=\mathbb E_{\bar p_t(\mathbf z)}\left[\tilde{\mathbb E}\left[\mathrm i\mathbf k^\top\dot{\mathbf z}_t\mid\mathbf z_t=\mathbf z\right]\cdot e^{\mathrm i\mathbf k^\top\mathbf z}\right]=\mathrm i\mathbf k^\top\int\underbrace{\tilde{\mathbb E}\left[\dot{\mathbf z}_t\mid\mathbf z_t=\mathbf z\right]}_{:=\tilde{\mathbf v}_t(\mathbf z)}\cdot e^{\mathrm i\mathbf k^\top\mathbf z}\bar p_t(\mathbf z|\mathbf y)\,\mathrm d\mathbf z.
$$

另一方面，由特征函数定义，

$$
\partial_t\hat p_t(\mathbf k)=\partial_t\int e^{\mathrm i\mathbf k^\top\mathbf z}\bar p_t(\mathbf z|\mathbf y)\,\mathrm d\mathbf z=\int e^{\mathrm i\mathbf k^\top\mathbf z}\partial_t\bar p_t(\mathbf z|\mathbf y)\,\mathrm d\mathbf z.
$$

令 $\partial_t\hat p_t(\mathbf k)$ 的两个表达式相等，得

$$
\int e^{\mathrm i\mathbf k^\top\mathbf z}\partial_t\bar p_t(\mathbf z|\mathbf y)\,\mathrm d\mathbf z=\mathrm i\mathbf k^\top\int\tilde{\mathbf v}_t(\mathbf z)e^{\mathrm i\mathbf k^\top\mathbf z}\bar p_t(\mathbf z|\mathbf y)\,\mathrm d\mathbf z.
$$

利用恒等式 $\nabla_{\mathbf z}e^{\mathrm i\mathbf k^\top\mathbf z}=\mathrm i\mathbf k\cdot e^{\mathrm i\mathbf k^\top\mathbf z}$ 与分部积分，把梯度从 $e^{\mathrm i\mathbf k^\top\mathbf z}$ 移到密度项：

$$
\int e^{\mathrm i\mathbf k^\top\mathbf z}\partial_t\bar p_t(\mathbf z|\mathbf y)\,\mathrm d\mathbf z=-\int e^{\mathrm i\mathbf k^\top\mathbf z}\nabla_{\mathbf z}\cdot\left(\tilde{\mathbf v}_t(\mathbf z)\bar p_t(\mathbf z|\mathbf y)\right)\mathrm d\mathbf z.
$$

最后，由于两式对所有 $\mathbf k$ 相等，其逆 Fourier 变换也相等，故

$$
\partial_t\bar p_t(\mathbf z|\mathbf y)=-\nabla_{\mathbf z}\cdot\left(\tilde{\mathbf v}_t(\mathbf z)\bar p_t(\mathbf z|\mathbf y)\right).
$$

这正是漂移场为 $\tilde{\mathbf v}_t$ 的连续性（Fokker–Planck）方程。因此，从 $\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I)$ 出发把 ODE $\frac{\mathrm d\mathbf z_t}{\mathrm dt}=-\tilde{\mathbf v}_t(\mathbf z_t)$ 反向积分，即可得到所需样本 $\mathbf z_0\sim\bar p_0(\mathbf z|\mathbf y)$。

### A.2 条件向量场

**证明。** 由引理 A.3，无条件向量场为

$$
\mathbf v(\mathbf z_t,t)=\frac{\dot\sigma(t)}{\sigma(t)}\mathbf z_t+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\mathbb E[\mathbf z_0|\mathbf z_t].
$$

由引理 A.1，有 $\mathbb E[\mathbf z_0|\mathbf z_t]=\frac{1}{\alpha(t)}\left(\mathbf z_t+\sigma(t)^2\nabla_{\mathbf z_t}\log p_t(\mathbf z_t)\right)$。代入得

$$
\mathbf v(\mathbf z_t,t)=\frac{\dot\alpha(t)}{\alpha(t)}\mathbf z_t+\frac{\sigma(t)}{\alpha(t)}\left(\dot\alpha(t)\sigma(t)-\dot\sigma(t)\alpha(t)\right)\nabla_{\mathbf z_t}\log p_t(\mathbf z_t).
$$

对 $\mathbf y$ 取条件后，分数变为 $\nabla_{\mathbf z_t}\log p_t(\mathbf z_t|\mathbf y)=\nabla_{\mathbf z_t}\log p_t(\mathbf z_t)+\nabla_{\mathbf z_t}\log p_t(\mathbf y|\mathbf z_t)$。因此条件向量场为

$$
\mathbf v(\mathbf z_t,\mathbf y,t)=\mathbf v(\mathbf z_t,t)+\frac{\sigma(t)}{\alpha(t)}\left(\dot\alpha(t)\sigma(t)-\dot\sigma(t)\alpha(t)\right)\nabla_{\mathbf z_t}\log p_t(\mathbf y|\mathbf z_t).
$$

最后，选择线性调度 $\alpha(t)=1-t$、$\sigma(t)=t$ 可化简为

$$
\mathbf v(\mathbf z_t,\mathbf y,t)=\mathbf v(\mathbf z_t,t)-\frac{t}{1-t}\nabla_{\mathbf z_t}\log p_t(\mathbf y|\mathbf z_t).
$$

把无条件速率 $\mathbf v(\mathbf z_t,t)$ 用参数化估计器 $\mathbf v_\theta(\mathbf z_t,t)$ 近似，即得

$$
\mathbf v(\mathbf z_t,\mathbf y,t)\approx\mathbf v_\theta(\mathbf z_t,t)-\frac{t}{1-t}\nabla_{\mathbf z_t}\log p_t(\mathbf y|\mathbf z_t).
$$

### A.3 后验均值（式 (14)）与后验协方差（式 (15)）的推导

**证明。** 由引理 A.3 已知

$$
\mathbf v(\mathbf z_t,t)=\frac{\dot\sigma(t)}{\sigma(t)}\mathbf z_t+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\mathbb E[\mathbf z_0|\mathbf z_t].
$$

取 $\alpha(t)=1-t$、$\sigma(t)=t$，可得 $\mathbb E[\mathbf z_0|\mathbf z_t]=\mathbf z_t-t\mathbf v(\mathbf z_t,t)$。同时由引理 A.1 与 A.2 可证

$$
\mathrm{Cov}[\mathbf z_0|\mathbf z_t]=\frac{\sigma(t)^2}{\alpha(t)}\nabla_{\mathbf z_t}^T\mathbb E[\mathbf z_0|\mathbf z_t],
$$

故 $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]=\frac{t^2}{1-t}\left(\mathbf I-t\nabla_{\mathbf z_t}\mathbf v_\theta(\mathbf z_t,t)\right)$。

### A.4 潜空间中噪声条件分数近似的证明

**证明。** 假设 $\mathbf x_0$ 上的似然与后验为高斯：$p(\mathbf y|\mathbf x_0)=\mathcal N(\mathbf A\mathbf x_0,\sigma_y^2\mathbf I_m)$、$p(\mathbf x_0|\mathbf x_t)=\mathcal N(\mathbf m,\boldsymbol\Sigma)$，其中 $\mathbf x_0,\mathbf x_t\in\mathbb R^n$、$\mathbf y\in\mathbb R^m$、$\mathbf A\in\mathbb R^{m\times n}$、$\mathbf m:=\mathbb E[\mathbf x_0|\mathbf x_t]$、$\boldsymbol\Sigma:=\mathrm{Cov}[\mathbf x_0|\mathbf x_t]$。定义 $\mathbf S:=\sigma_y^2\mathbf I_m+\mathbf A\boldsymbol\Sigma\mathbf A^\top\in\mathbb R^{m\times m}$、$\mathbf r:=\mathbf y-\mathbf A\mathbf m\in\mathbb R^m$，则

$$
p(\mathbf y|\mathbf x_t)=\int p(\mathbf y|\mathbf x_0)p(\mathbf x_0|\mathbf x_t)\,\mathrm d\mathbf x_0=\mathcal N(\mathbf A\mathbf m,\mathbf S),
$$

对数似然为 $\log p(\mathbf y|\mathbf x_t)=-\frac m2\log(2\pi)-\frac12\log\det\mathbf S-\frac12\mathbf r^\top\mathbf S^{-1}\mathbf r$。分两部分计算其对 $\mathbf x_t\in\mathbb R^n$ 的梯度。

(1) 对数行列式项：$\nabla_{\mathbf x_t}\log\det\mathbf S=\mathrm{Tr}\left(\mathbf S^{-1}\nabla_{\mathbf x_t}\mathbf S\right)$，$\frac{\partial\mathbf S}{\partial x_{t,i}}=\mathbf A\frac{\partial\boldsymbol\Sigma}{\partial x_{t,i}}\mathbf A^\top$，故

$$
\nabla_{\mathbf x_t}\log\det\mathbf S=\begin{bmatrix}\mathrm{Tr}\left(\mathbf A^\top\mathbf S^{-1}\mathbf A\cdot\frac{\partial\boldsymbol\Sigma}{\partial x_{t,1}}\right)\\ \vdots\\ \mathrm{Tr}\left(\mathbf A^\top\mathbf S^{-1}\mathbf A\cdot\frac{\partial\boldsymbol\Sigma}{\partial x_{t,n}}\right)\end{bmatrix}\in\mathbb R^n.
$$

(2) 二次项：

$$
\nabla_{\mathbf x_t}\left(\mathbf r^\top\mathbf S^{-1}\mathbf r\right)=-2(\nabla_{\mathbf x_t}\mathbf m)^\top\mathbf A^\top\mathbf S^{-1}\mathbf r-\begin{bmatrix}\mathrm{Tr}\left(\mathbf S^{-1}\mathbf r\mathbf r^\top\mathbf S^{-1}\cdot\frac{\partial\mathbf S}{\partial x_{t,1}}\right)\\ \vdots\\ \mathrm{Tr}\left(\mathbf S^{-1}\mathbf r\mathbf r^\top\mathbf S^{-1}\cdot\frac{\partial\mathbf S}{\partial x_{t,n}}\right)\end{bmatrix}\in\mathbb R^n.
$$

合并两部分得

$$
\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)=-(\nabla_{\mathbf x_t}\mathbf m)^\top\mathbf A^\top\mathbf S^{-1}\mathbf r-\frac12\begin{bmatrix}\mathrm{Tr}\left(\mathbf A^\top\mathbf S^{-1}\mathbf A\cdot\frac{\partial\boldsymbol\Sigma}{\partial x_{t,1}}\right)+\mathrm{Tr}\left(\mathbf S^{-1}\mathbf r\mathbf r^\top\mathbf S^{-1}\cdot\frac{\partial\mathbf S}{\partial x_{t,1}}\right)\\ \vdots\\ \mathrm{Tr}\left(\mathbf A^\top\mathbf S^{-1}\mathbf A\cdot\frac{\partial\boldsymbol\Sigma}{\partial x_{t,n}}\right)+\mathrm{Tr}\left(\mathbf S^{-1}\mathbf r\mathbf r^\top\mathbf S^{-1}\cdot\frac{\partial\mathbf S}{\partial x_{t,n}}\right)\end{bmatrix}.
$$

假设 $\mathrm{Cov}[\mathbf x_0|\mathbf x_t]$ 相对 $\mathbf x_t$ 缓慢变化，忽略其梯度，得近似

$$
\nabla_{\mathbf x_t}\log p(\mathbf y|\mathbf x_t)\approx(\nabla_{\mathbf x_t}\mathbf m)^\top\mathbf A^\top\mathbf S^{-1}\mathbf r=(\nabla_{\mathbf x_t}\mathbb E[\mathbf x_0|\mathbf x_t])^\top\mathbf A^\top\left(\sigma_y^2\mathbf I_m+\mathbf A\boldsymbol\Sigma\mathbf A^\top\right)^{-1}\left(\mathbf y-\mathbf A\mathbb E[\mathbf x_0|\mathbf x_t]\right).
$$

现在把该公式原则性地推广到**潜空间**。令 $\mathbf z_0$、$\mathbf z_t$ 为潜变量，$\mathcal D_\phi$ 为（一般非线性的）解码器，使 $\mathbf x_0=\mathcal D_\phi(\mathbf z_0)$。则似然可写为 $p(\mathbf y|\mathbf z_0)=\mathcal N(\mathbf y;\mathbf A\mathcal D_\phi(\mathbf z_0),\sigma_y^2\mathbf I)$，即具有**非线性均值**的高斯。进一步假设 $p(\mathbf z_0|\mathbf z_t)=\mathcal N(\bar{\mathbf z}_0,\boldsymbol\Sigma_z)$，其中 $\bar{\mathbf z}_0:=\mathbb E[\mathbf z_0|\mathbf z_t]$、$\boldsymbol\Sigma_z:=\mathrm{Cov}[\mathbf x_0|\mathbf z_t]$。由于 $\mathcal D_\phi$ 非线性，$p(\mathbf y|\mathbf z_t)$ 并非高斯；我们用 $\bar{\mathbf z}_0$ 处的一阶 Taylor 展开近似 $\mathcal D_\phi(\mathbf z_0)$：$\mathcal D_\phi(\mathbf z_0)\approx\mathcal D_\phi(\bar{\mathbf z}_0)+\mathbf J_D(\bar{\mathbf z}_0)(\mathbf z_0-\bar{\mathbf z}_0)$，其中 $\mathbf J_D(\bar{\mathbf z}_0)$ 为 $\mathcal D_\phi$ 在 $\bar{\mathbf z}_0$ 处的 Jacobian。利用该近似，$\mathbf x_0$ 上的分布近似为高斯：

$$
\mathbb E[\mathbf x_0|\mathbf z_t]\approx\mathcal D_\phi(\bar{\mathbf z}_0),\qquad\mathrm{Cov}[\mathbf x_0|\mathbf z_t]\approx\mathbf J_D(\bar{\mathbf z}_0)\boldsymbol\Sigma_z\mathbf J_D(\bar{\mathbf z}_0)^\top.
$$

应用与像素空间相同的后验分数近似（使用解码均值与传播协方差）：

$$
\nabla_{\mathbf z_t}\log p(\mathbf y|\mathbf z_t)\approx(\nabla_{\mathbf z_t}\bar{\mathbf z}_0)^\top\mathbf J_D(\bar{\mathbf z}_0)^\top\mathbf A^\top\left(\sigma_y^2\mathbf I+\mathbf A\mathbf J_D(\bar{\mathbf z}_0)\boldsymbol\Sigma_z\mathbf J_D(\bar{\mathbf z}_0)^\top\mathbf A^\top\right)^{-1}\left(\mathbf y-\mathbf A\mathcal D_\phi(\bar{\mathbf z}_0)\right).
$$

该表达式是基于解码器一阶线性化与高斯传播的、良定义且有依据的潜空间后验分数近似。

### A.5 命题 4.3 的证明

**证明。** 目标是计算 Jacobian $\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)$。由引理 A.3 有

$$
\mathbf v(\mathbf z_t,t)=\frac{\dot\sigma(t)}{\sigma(t)}\mathbf z_t+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\mathbb E[\mathbf z_0|\mathbf z_t].
$$

对 $\mathbf z_t$ 求梯度得

$$
\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)=\frac{\dot\sigma(t)}{\sigma(t)}\mathbf I+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\nabla_{\mathbf z_t}\mathbb E[\mathbf z_0|\mathbf z_t].
$$

由引理 A.1，后验均值为 $\mathbb E[\mathbf z_0|\mathbf z_t]=\frac{1}{\alpha(t)}\left(\mathbf z_t+\sigma(t)^2\nabla_{\mathbf z_t}\log p_t(\mathbf z_t)\right)$，故其梯度为

$$
\nabla_{\mathbf z_t}\mathbb E[\mathbf z_0|\mathbf z_t]=\frac{1}{\alpha(t)}\left(\mathbf I+\sigma(t)^2\nabla_{\mathbf z_t}^2\log p_t(\mathbf z_t)\right).
$$

代入 Jacobian 表达式得

$$
\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)=\frac{\dot\sigma(t)}{\sigma(t)}\mathbf I+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\cdot\frac{1}{\alpha(t)}\left(\mathbf I+\sigma(t)^2\nabla_{\mathbf z_t}^2\log p_t(\mathbf z_t)\right).
$$

应用引理 A.2，对数密度的 Hessian 可表示为 $\sigma(t)^2\nabla_{\mathbf z_t}^2\log p_t(\mathbf z_t)=\frac{\alpha(t)^2}{\sigma(t)^2}\mathrm{Cov}[\mathbf z_0|\mathbf z_t]-\mathbf I$，即 $\mathbf I+\sigma(t)^2\nabla_{\mathbf z_t}^2\log p_t(\mathbf z_t)=\frac{\alpha(t)^2}{\sigma(t)^2}\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$。因此 Jacobian 变为

$$
\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)=\frac{\dot\sigma(t)}{\sigma(t)}\mathbf I+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\cdot\frac{\alpha(t)}{\sigma(t)^2}\mathrm{Cov}[\mathbf z_0|\mathbf z_t].
$$

由引理 A.4，若 $p(\mathbf z_0)$ 为 $\gamma$-半对数凸，则 Cramér–Rao 不等式给出 $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]\succeq\left(\gamma+\frac{\alpha(t)^2}{\sigma(t)^2}\right)^{-1}\mathbf I$。把该界代入 Jacobian 表达式得

$$
\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)\succeq\left(\frac{\dot\sigma(t)}{\sigma(t)}+\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\cdot\frac{\alpha(t)}{\sigma(t)^2}\cdot\left(\gamma+\frac{\alpha(t)^2}{\sigma(t)^2}\right)^{-1}\right)\mathbf I.\tag{28}
$$

该式化简为

$$
\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)\succeq\left(\frac{\gamma\sigma(t)\dot\sigma(t)+\alpha(t)\dot\alpha(t)}{\gamma\sigma(t)^2+\alpha(t)^2}\right)\mathbf I.\tag{29}
$$

最后注意到右端可写为 $\eta(t):=\frac{\mathrm d}{\mathrm dt}\left[\frac12\log\left(\alpha(t)^2+\gamma\sigma(t)^2\right)\right]=\frac{\gamma\sigma(t)\dot\sigma(t)+\alpha(t)\dot\alpha(t)}{\gamma\sigma(t)^2+\alpha(t)^2}$，即 $\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)\succeq\eta(t)\mathbf I$。

现在假设后验协方差半正定：$\mathrm{Cov}[\mathbf z_0|\mathbf z_t]\succeq0$。定义标量系数 $c(t):=\left(\dot\alpha(t)-\frac{\dot\sigma(t)\alpha(t)}{\sigma(t)}\right)\cdot\frac{\alpha(t)}{\sigma(t)^2}$，则 Jacobian 简化为 $\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)=\frac{\dot\sigma(t)}{\sigma(t)}\cdot\mathbf I+c(t)\cdot\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$。由于 $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]\succeq0$，$c(t)$ 的符号决定不等号方向：若 $c(t)\ge0$，则 $c(t)\cdot\mathrm{Cov}[\mathbf z_0|\mathbf z_t]\succeq0$，$\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)\succeq\frac{\dot\sigma(t)}{\sigma(t)}\cdot\mathbf I$；若 $c(t)<0$，则 $\nabla_{\mathbf z_t}\mathbf v(\mathbf z_t,t)\preceq\frac{\dot\sigma(t)}{\sigma(t)}\cdot\mathbf I$。特别地，在常见情形 $\alpha(t)=1-t$、$\sigma(t)=t$ 下，对一切 $t\in(0,1]$ 有 $c(t)<0$，故 Jacobian 有上界。证毕。

### A.6 命题 4.4 的证明

**命题 A.6（最优向量场）：** 令 $\mathbf z_0\sim\mathcal N(\mathbf 0,\sigma_{\mathrm{latr}}^2\mathbf I)$ 与 $\mathbf z_1\sim\mathcal N(\mathbf 0,\mathbf I)$ 独立，定义 $\mathbf z_t=(1-t)\mathbf z_0+t\mathbf z_1$（$t\in[0,1]$）。最小化 $\arg\min_{\mathbf v}\mathbb E\left[\|\mathbf v(\mathbf z_t,t)-(\mathbf z_0-\mathbf z_1)\|^2\right]$ 的最优向量场为

$$
\mathbf v^\star(\mathbf z_t,t)=\frac{(1-t)\sigma_{\mathrm{latr}}^2-t}{(1-t)^2\sigma_{\mathrm{latr}}^2+t^2}\mathbf z_t.
$$

**证明。** 由于损失函数为二次且 $\mathbf v^\star(\mathbf z_t,t)$ 仅依赖 $\mathbf z_t$ 与 $t$，最优向量场为条件期望 $\mathbf v^\star(\mathbf z_t,t)=\mathbb E[\mathbf z_0-\mathbf z_1|\mathbf z_t]$。给定 $\mathbf z_0$、$\mathbf z_1$ 为独立高斯、$\mathbf z_t$ 为二者的线性组合，$\mathbf z_0,\mathbf z_1,\mathbf z_t$ 的联合分布为多元高斯。我们利用多元正态性质计算 $\mathbb E[\mathbf z_0|\mathbf z_t]$ 与 $\mathbb E[\mathbf z_1|\mathbf z_t]$。先确定协方差矩阵：$\boldsymbol\Sigma_{z_0z_0}=\sigma_{\mathrm{latr}}^2\mathbf I$、$\boldsymbol\Sigma_{z_1z_1}=\mathbf I$、$\boldsymbol\Sigma_{z_0z_1}=\mathbf 0$（因 $\mathbf z_0$、$\mathbf z_1$ 独立）。再计算 $\mathbf z_0$ 与 $\mathbf z_t$ 的协方差：

$$
\boldsymbol\Sigma_{z_0z_t}=\mathbb E\left[\mathbf z_0\mathbf z_t^\top\right]=(1-t)\mathbb E\left[\mathbf z_0\mathbf z_0^\top\right]+t\mathbb E\left[\mathbf z_0\mathbf z_1^\top\right]=(1-t)\sigma_{\mathrm{latr}}^2\mathbf I.
$$

类似地，$\mathbf z_1$ 与 $\mathbf z_t$ 的协方差：$\boldsymbol\Sigma_{z_1z_t}=\mathbb E\left[\mathbf z_1\mathbf z_t^\top\right]=(1-t)\mathbb E\left[\mathbf z_1\mathbf z_0^\top\right]+t\mathbb E\left[\mathbf z_1\mathbf z_1^\top\right]=t\mathbf I$。$\mathbf z_t$ 的方差为 $\boldsymbol\Sigma_{z_tz_t}=(1-t)^2\boldsymbol\Sigma_{z_0z_0}+t^2\boldsymbol\Sigma_{z_1z_1}=(1-t)^2\sigma_{\mathrm{latr}}^2\mathbf I+t^2\mathbf I=\left((1-t)^2\sigma_{\mathrm{latr}}^2+t^2\right)\mathbf I=s^2\mathbf I$，其中 $s^2=(1-t)^2\sigma_{\mathrm{latr}}^2+t^2$。$\mathbf z_0,\mathbf z_1,\mathbf z_t$ 的联合协方差矩阵为

$$
\boldsymbol\Sigma_w=\begin{bmatrix}\boldsymbol\Sigma_{z_0z_0} & \boldsymbol\Sigma_{z_0z_1} & \boldsymbol\Sigma_{z_0z_t}\\ \boldsymbol\Sigma_{z_1z_0} & \boldsymbol\Sigma_{z_1z_1} & \boldsymbol\Sigma_{z_1z_t}\\ \boldsymbol\Sigma_{z_tz_0} & \boldsymbol\Sigma_{z_tz_1} & \boldsymbol\Sigma_{z_tz_t}\end{bmatrix}=\begin{bmatrix}\sigma_{\mathrm{latr}}^2\mathbf I & \mathbf 0 & (1-t)\sigma_{\mathrm{latr}}^2\mathbf I\\ \mathbf 0 & \mathbf I & t\mathbf I\\ (1-t)\sigma_{\mathrm{latr}}^2\mathbf I & t\mathbf I & s^2\mathbf I\end{bmatrix}.
$$

利用多元正态条件期望性质，计算

$$
\mathbb E[\mathbf z_0|\mathbf z_t]=\boldsymbol\Sigma_{z_0z_t}\left(\boldsymbol\Sigma_{z_tz_t}\right)^{-1}\mathbf z_t=\frac{(1-t)\sigma_{\mathrm{latr}}^2}{s^2}\mathbf z_t,\qquad \mathbb E[\mathbf z_1|\mathbf z_t]=\boldsymbol\Sigma_{z_1z_t}\left(\boldsymbol\Sigma_{z_tz_t}\right)^{-1}\mathbf z_t=\frac{t}{s^2}\mathbf z_t.
$$

因此最优向量场为

$$
\mathbf v^\star(\mathbf z_t,t)=\mathbb E[\mathbf z_0-\mathbf z_1|\mathbf z_t]=\mathbb E[\mathbf z_0|\mathbf z_t]-\mathbb E[\mathbf z_1|\mathbf z_t]=\left(\frac{(1-t)\sigma_{\mathrm{latr}}^2}{s^2}-\frac{t}{s^2}\right)\mathbf z_t=\frac{(1-t)\sigma_{\mathrm{latr}}^2-t}{(1-t)^2\sigma_{\mathrm{latr}}^2+t^2}\mathbf z_t.
$$

### A.7 ΠGDM 中协方差的证明

（ΠGDM [22]）令 $\mathbf x_0\sim\mathcal N(\mathbf 0,\sigma_{\mathrm{data}}^2\mathbf I)$，考虑前向过程 $\mathbf x_t=\alpha(t)\mathbf x_0+\sigma(t)\mathbf x_1$、$\mathbf x_1\sim\mathcal N(\mathbf 0,\mathbf I)$。则条件协方差 $\mathrm{Cov}[\mathbf x_0|\mathbf x_t]$ 为

$$
\mathrm{Cov}[\mathbf x_0|\mathbf x_t]=\frac{\sigma_{\mathrm{data}}^2\sigma(t)^2}{\alpha(t)^2\sigma_{\mathrm{data}}^2+\sigma(t)^2}\mathbf I.\tag{30}
$$

**证明。** 由于 $\mathbf x_0$ 与 $\mathbf x_1$ 为独立高斯、$\mathbf x_t$ 为线性组合，$\mathbf x_0,\mathbf x_t$ 联合高斯，且 $\mathrm{Cov}[\mathbf x_t]=\alpha(t)^2\sigma_{\mathrm{data}}^2\mathbf I+\sigma(t)^2\mathbf I$，

$$
\mathrm{Cov}[\mathbf x_t,\mathbf x_0]=\mathbb E\left[(\mathbf x_t-\mathbb E[\mathbf x_t])(\mathbf x_0-\mathbb E[\mathbf x_0])^\top\right]=\alpha(t)\mathrm{Cov}[\mathbf x_0]=\alpha(t)\sigma_{\mathrm{data}}^2\mathbf I.
$$

利用高斯条件协方差的标准公式 $\mathrm{Cov}[\mathbf x_0|\mathbf x_t]=\mathrm{Cov}[\mathbf x_0]-\mathrm{Cov}[\mathbf x_0,\mathbf x_t]\mathrm{Cov}[\mathbf x_t]^{-1}\mathrm{Cov}[\mathbf x_t,\mathbf x_0]$，并代入 $\mathrm{Cov}[\mathbf x_0]=\sigma_{\mathrm{data}}^2\mathbf I$，得

$$
\mathrm{Cov}[\mathbf x_0|\mathbf x_t]=\sigma_{\mathrm{data}}^2\mathbf I-\left(\alpha(t)\sigma_{\mathrm{data}}^2\mathbf I\right)\left(\alpha(t)^2\sigma_{\mathrm{data}}^2+\sigma(t)^2\right)^{-1}\left(\alpha(t)\sigma_{\mathrm{data}}^2\mathbf I\right),
$$

化简即得 $\mathrm{Cov}[\mathbf x_0|\mathbf x_t]=\frac{\sigma_{\mathrm{data}}^2\sigma(t)^2}{\alpha(t)^2\sigma_{\mathrm{data}}^2+\sigma(t)^2}\mathbf I$。

## 附录 B 计算式（13）中向量 $\mathbf v$ 的闭式解

本节在等向后验协方差假设（即 $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]=r(t)^2\mathbf I$）下导出计算向量 $\mathbf v$ 的高效闭式表达。先引入必要记号。

**记号。**
- 令 $\mathbf m\in\{0,1\}^{d\times1}$ 表示图像或信号中的采样位置。
- 与 $\mathbf m$ 关联的下采样算子为 $\mathbf D_m\in\{0,1\}^{\|\mathbf m\|_0\times d}$，它只选取与 $\mathbf m$ 非零元对应的行（即向量的分量）。例如等间隔取 1 的 $s$ 倍下采样记为 $\mathbf D_{\downarrow s}$。
- $\mathbf D_{\Downarrow s}$ 表示另一种**分块**下采样器，对向量中每 $s$ 个块（每块大小 $d/s$）取平均。
- $\mathbf F$ 为 $d\times d$ 的（酉）Fourier 变换矩阵，$\mathbf F_{\downarrow s}$ 为维数 $d/s$ 的信号对应的变换矩阵。
- $\hat{\mathbf v}$ 表示向量 $\mathbf v$ 的 Fourier 变换，$\bar{\mathbf v}$ 表示其复共轭。
- 记号 $\odot$ 表示逐元素（Hadamard）乘；当向量/矩阵维数匹配时，除法“/”或“÷”也逐元素进行。

**引理 B.1（下采样等价性）：** 空间域中的标准 $s$ 倍下采样等价于频域中的 $s$ 倍分块下采样，具体为 $\mathbf D_{\Downarrow s}=\mathbf F_{\downarrow s}\mathbf D_{\downarrow s}\mathbf F^{-1}$。

**证明。** 细节见 [79, 29]。

### B.1 图像修复

图像修复的观测模型可写为

$$
\mathbf y=\underbrace{\mathbf D_m}_{=\mathbf A}\mathbf x_0+\mathbf n,\tag{31}
$$

其中 $\mathbf n$ 为噪声。可定义 $\mathbf y$ 的便捷**补零**版本 $\tilde{\mathbf y}=\mathbf D_m^\top\mathbf y=\mathbf m\odot(\mathbf x_0+\tilde{\mathbf n})$、$\tilde{\mathbf n}\sim\mathcal N(\mathbf 0,\mathbf I)$。图像修复中 $\mathbf v$ 的闭式解为

$$
\mathbf v=\frac{\tilde{\mathbf y}-\left(\mathbf m\odot\mathcal D_\phi(\mathbb E[\mathbf z_0|\mathbf z_t])\right)}{\sigma_y^2+r(t)^2}.
$$

**证明。** 从更一般的形式出发，

$$
\mathbf v=\mathbf D_m^\top\left(\sigma_y^2\mathbf I+r(t)^2\mathbf D_m\mathbf D_m^\top\right)^{-1}\left(\mathbf y-\mathbf D_m\mathcal D_\phi\left(\mathbb E[\mathbf z_0|\mathbf z_t]\right)\right).
$$

由于在 $\mathbf y$ 的支撑上 $\mathbf D_m\mathbf D_m^\top=\mathbf I$ 且 $\left(\sigma_y^2\mathbf I+r(t)^2\mathbf I\right)^{-1}=1/(\sigma_y^2+r(t)^2)$，简化得

$$
\mathbf v=\frac{\mathbf D_m^\top\left(\mathbf y-\mathbf D_m\mathcal D_\phi(\mathbb E[\mathbf z_0|\mathbf z_t])\right)}{\sigma_y^2+r(t)^2}=\frac{\tilde{\mathbf y}-\mathbf m\odot\mathcal D_\phi\left(\mathbb E[\mathbf z_0|\mathbf z_t]\right)}{\sigma_y^2+r(t)^2}.
$$

由 $\tilde{\mathbf y}=\mathbf D_m^\top\mathbf y=\mathbf m\odot(\mathbf x_0+\tilde{\mathbf n})$ 即得所述闭式解。

### B.2 图像去模糊

图像去模糊的观测模型为

$$
\mathbf y=\mathbf x_0*\mathbf k+\mathbf n,\tag{32}
$$

其中 $\mathbf k$ 为模糊核、$*$ 为循环卷积算子。用 Fourier 变换可写为 $\mathbf y=\underbrace{\mathbf F^{-1}\mathrm{diag}(\hat{\mathbf k})\mathbf F}_{=\mathbf A}\mathbf x_0+\mathbf n$，其中 $\hat{\mathbf k}$ 为 $\mathbf k$ 的 DFT。在等向协方差假设下，$\mathbf v$ 的闭式解为

$$
\mathbf v=\mathbf F^{-1}\left(\frac{\bar{\hat{\mathbf k}}\odot\mathbf F\left[\mathbf y-\mathbf A\mathcal D_\phi\left(\mathbb E[\mathbf z_0|\mathbf z_t]\right)\right]}{\sigma_y^2+r(t)^2|\hat{\mathbf k}|^2}\right).
$$

**证明。** 由于 $\mathbf A$ 为卷积型实线性算子，有 $\mathbf A^T=\mathbf A^H$，故 $\mathbf v=\mathbf A^\top\left(\sigma_y^2\mathbf I+r(t)^2\mathbf A\mathbf A^\top\right)^{-1}\left[\mathbf y-\mathbf A\mathcal D_\phi(\mathbb E[\mathbf z_0|\mathbf z_t])\right]$。代入 $\mathbf A=\mathbf F^{-1}\mathrm{diag}(\hat{\mathbf k})\mathbf F$ 并在频域化简（利用频域的对角结构），即得上述频域表达式。

### B.3 超分辨率

沿用 [79]，超分辨率观测模型近似为

$$
\mathbf y=\left(\mathbf x_0*\mathbf k\right)\downarrow_s+\mathbf n,\tag{33}
$$

其规范化形式可写为 $\mathbf y=\mathbf D_{\downarrow s}\mathbf F^{-1}\mathrm{diag}(\hat{\mathbf k})\mathbf F\mathbf x_0+\mathbf n$。因此 $\mathbf A=\mathbf D_{\downarrow s}\mathbf F^{-1}\mathrm{diag}(\hat{\mathbf k})\mathbf F$。等向假设下的闭式解为

$$
\mathbf v=\mathbf F^{-1}\left(\frac{\bar{\hat{\mathbf k}}\odot_s\mathbf F_{\downarrow s}\left[\mathbf y-\mathbf A\mathcal D_\phi\left(\mathbb E[\mathbf z_0|\mathbf z_t]\right)\right]}{\sigma_y^2+r(t)^2\left(\bar{\hat{\mathbf k}}\odot\hat{\mathbf k}\right)_{\Downarrow s}}\right),
$$

其中 $\odot_s$ 表示分块 Hadamard 乘。

**证明。** 由于 $\mathbf A^T=\mathbf A^H$ 且 $\mathbf A=\mathbf D_{\downarrow s}\mathbf F^{-1}\mathrm{diag}(\hat{\mathbf k})\mathbf F$，得 $\mathbf A^\top=\mathbf F^\top\mathrm{diag}(\bar{\hat{\mathbf k}})\left(\mathbf F^{-1}\right)^\top\mathbf D_{\downarrow s}^\top$。应用引理 B.1（即 $\mathbf D_{\downarrow s}\mathbf F^{-1}=\mathbf F_{\downarrow s}^{-1}\mathbf D_{\Downarrow s}$ 及其共轭转置版本），把逆 $\left(\sigma_y^2\mathbf I+r(t)^2\mathbf A\mathbf A^\top\right)^{-1}$ 化为“下采样”Fourier 域中的对角形式，即得上述表达式。

## 附录 C 实现细节

```text
Algorithm 1 LFlowSampling：线性逆问题的后验引导潜 ODE 推断
1:  输入：测量 y、编码器 E_φ、解码器 D_φ、前向算子 A、预训练向量场 v_θ(·,t)（t ∈ [t_s, 0]，t_s = 0.8），K = 2
2:  初始化：z_{t_s} ← (1-t_s) E_φ(y) + t_s z_1，z_1 ~ N(0, I)
3:  for t = t_s down to 0 do
4:      z̄_0 ← z_t - t v_θ(z_t, t)                        ▷ 后验均值预测，式 (14)
5:      r²(t) ← t²/(1-t) (1 - t ∇_{z_t} v_θ(z_t, t))    ▷ 后验协方差估计，式 (18)
6:      ∇_{z_t} log p(y|z_t) ← (∇_{z_t} D_φ(z̄_0))^⊤ A^⊤ (y - A D_φ(z̄_0)) / (σ_y² I + r²(t) A A^⊤)   ▷ 式 (13)
7:      for k = 1 to K do
8:          v_θ(z_t, y, t) ← v_θ(z_t, t) - (t/(1-t)) ∇_{z_t} log p(y|z_t)   ▷ 向量场的 K 步更新，式 (9)
9:      end for
10:     z_{t-Δt} ← ODESolverStep(z_t, v_θ(z_t, y, t))
11: end for
12: 返回：x_0 ← D_φ(z_0)
```

### C.1 LFlow

- **求解器参数：** 对修复与运动去模糊任务，绝对与相对容差（`atol`、`rtol`）设为 $10^{-3}$；对高斯去模糊与超分辨率任务设为 $10^{-5}$。
- 所有任务设超参数 $K=2$、$t_s=0.8$——这些值由验证性能上的消融选出，在各任务间平衡引导强度与重建保真。
- 为保证维数兼容，测量 $\mathbf y$ 被上采样（如双三次插值）以匹配潜编码器输入尺寸。为一致性，我们与本方法及相关基线均采用与 [29] 相同的超分辨率与去模糊算子。
- 对修复任务，我们把 PSLD 方法 [33] 提出的策略纳入 LFlow：该策略重建与图像已知部分无缝衔接的缺失区域，写为 $\mathbf x_0=\mathbf A^T\mathbf A\mathbf x_0+(\mathbf I-\mathbf A^T\mathbf A)\mathcal D_\phi(\mathbf z_0)$。与生成整幅图像、可能与观测不一致的 DPS 采样器不同，该方法确保观测被直接应用到生成图像的对应部分，未掩码区域保持不变 [80]。对运动去模糊、高斯去模糊与超分辨率等其他任务，因不涉及方框修复，该额外步骤不需要，即 $\mathbf x_0=\mathcal D_\phi(\mathbf z_0)$。

### C.2 对比方法

**PSLD [33]** 在解码与编码之间向 $\mathbf A$ 的子空间施加正交投影以强制保真：

$$
\mathbf z_{t-1}=\mathrm{DDIM}(\mathbf z_t)-\rho\nabla_{\mathbf z_t}\left(\left\|\mathbf y-\mathbf A\mathcal D_\phi\left(\mathbb E[\mathbf z_0|\mathbf z_t]\right)\right\|_2^2+\gamma\left\|\mathbb E[\mathbf z_0|\mathbf z_t]-\mathcal E_\phi\left(\mathcal D_\phi\left(\mathbb E[\mathbf z_0|\mathbf z_t]\right)\right)\right\|_2^2-\mathcal E_\phi\left(\mathbf A^\top\mathbf y+(\mathbf I-\mathbf A^\top\mathbf A)\mathcal D_\phi\left(\mathbb E[\mathbf z_0|\mathbf z_t]\right)\right)\right).\tag{34}
$$

我们使用固定步长 $\rho$，并按 [36] 的建议选择 $\gamma$。实验中我们依赖官方 PSLD 实现²及其默认配置；具体地，ImageNet 实验使用 Stable Diffusion v1.5（一般认为比 LDM-VQ4 更稳健）。PSLD 旨在通过强制潜变量在自编码后为不动点，使其保持在自然流形附近；该思路理论上似有依据，但经验上已被证明无效 [34]。

> **脚注 2（原文）：** https://github.com/LituRout/PSLD

**Resample [36]** 先用 Tweedie 公式（式（22））从上一采样 $\mathbf z_{t+1}$ 估计干净潜预测 $\mathbf z_0^{\mathrm{est}}(\mathbf z_{t+1})$，再用 DDIM 更新潜状态：

$$
\mathbf z'_t=\mathrm{DDIM}\left(\mathbf z_0^{\mathrm{est}}(\mathbf z_{t+1}),\mathbf z_{t+1}\right).\tag{35}
$$

更新后的样本 $\mathbf z'_t$ 随后通过下式投影回测量一致的潜变量 $\mathbf z_t^{\mathrm{proj}}$：

$$
\mathcal N\left(\mathbf z_t^{\mathrm{proj}};\frac{\sigma_t^2\sqrt{\bar\alpha_t}\mathbf z_0^{\mathrm{cond}}+(1-\bar\alpha_t)\mathbf z'_t}{\sigma_t^2+(1-\bar\alpha_t)},\frac{\sigma_t^2(1-\bar\alpha_t)}{\sigma_t^2+(1-\bar\alpha_t)}\mathbf I_k\right),\tag{36}
$$

其中 $\mathbf z_0^{\mathrm{cond}}$ 为满足测量约束的潜向量，由求解如下优化问题获得：

$$
\mathbf z_0^{\mathrm{cond}}\in\arg\min_{\mathbf z}\frac12\left\|\mathbf y-\mathbf A(\mathcal D_\phi(\mathbf z))\right\|_2^2,\qquad\text{以 }\mathbf z_0^{\mathrm{est}}(\mathbf z_{t+1})\text{ 初始化}.\tag{37}
$$

这里 $\sigma_t^2$ 为可调超参数、控制先验与数据保真之间的折中，$\bar\alpha_t$ 为预定义的 DDIM 噪声调度参数。实验采用作者公开实现³，在 FFHQ 与 ImageNet 上使用预训练 LDM-VQ4 模型 [59] 及其默认超参数、500 步 DDIM 采样器。Resample 通过把无条件模型的反向先验与以一致潜变量为中心的测量知情似然平衡，改进潜扩散采样，确保样本同时对齐数据流形与观测测量。

> **脚注 3（原文）：** https://github.com/soominkwon/resample

**MPGD [38]** 通过只对干净潜估计（而非含噪输入）计算梯度来加速推断，避免繁重的链式法则展开。其潜空间梯度更新为

$$
\mathbf z_{t-1}=\mathrm{DDIM}(\mathbf z_t)-\eta\nabla_{\mathbb E[\mathbf z_0|\mathbf z_t]}\left\|\mathbf y-\mathbf A(\mathcal D_\phi(\mathbb E[\mathbf z_0|\mathbf z_t]))\right\|^2.\tag{38}
$$

注意 MPGD 与 PSLD 一样使用 Stable Diffusion v1.5，更多信息见其 GitHub 仓库⁴。

> **脚注 4（原文）：** https://github.com/KellyYutongHe/mpgd_pytorch/

**DAPS [37]**⁵ 通过由潜先验与测量似然引导的 Langevin 动力学细化潜估计。初始估计 $\mathbf z_0^{(0)}$ 由潜分数模型从 $\mathbf z_t$ 求解概率流 ODE 得到。在每个内迭代 $j=0,\dots,N-1$，潜估计 $\mathbf z_0^{(j)}\in\mathbb R^d$ 更新为

$$
\mathbf z_0^{(j+1)}=\mathbf z_0^{(j)}+\eta_t\left(\nabla_{\mathbf z_0^{(j)}}\log p(\mathbf z_0^{(j)}|\mathbf z_t)+\nabla_{\mathbf z_0^{(j)}}\log p(\mathbf y|\mathbf z_0^{(j)})\right)+\sqrt{2\eta_t}\boldsymbol\epsilon_j,\qquad\boldsymbol\epsilon_j\sim\mathcal N(\mathbf 0,\mathbf I).\tag{39}
$$

其中 $\eta_t$ 为 Langevin 步长；第一项通过潜分数模型反映先验引导，第二项通过解码与评估似然强制与测量一致。DAPS 通过解耦时间步、直接由边缘后验 $p(\mathbf z_t|\mathbf y)$ 采样每个含噪状态 $\mathbf z_t$，避免了扩散模型中局部 Markov 更新的局限；它通过交替进行 MCMC 后验引导去噪与噪声再注入完成后验采样，从而实现大的全局校正并改善非线性逆问题推断。

> **脚注 5（原文）：** https://github.com/zhangbingliang2019/DAPS

**SITCOM（逐步三重一致采样）[60]** 施加三个互补一致性条件——测量、前向扩散与逐步反向扩散——使扩散轨迹以更少反向步保持测量一致。通过在每一步优化预训练扩散模型的输入，SITCOM 确保数据流形、测量空间与扩散过程之间的三重一致，从而高效求解逆问题。在每步 $t$，SITCOM 施加三重一致：

**(S1) 测量一致优化：**

$$
\hat{\mathbf v}_t:=\arg\min_{\mathbf v'_t}\underbrace{\left\|\mathbf A\left(\frac{1}{\sqrt{\alpha_t}}\left[\underbrace{\mathbf v'_t-\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon_\theta(\mathbf v'_t,t)}_{C_2}\right]\right)-\mathbf y\right\|_2^2}_{C_1}+\lambda\underbrace{\left\|\mathbf z_t-\mathbf v'_t\right\|_2^2}_{C_3}.\tag{40}
$$

**(S2) 去噪：**

$$
\hat{\mathbf z}'_0=\frac{1}{\sqrt{\alpha_t}}\left[\hat{\mathbf v}_t-\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon_\theta(\hat{\mathbf v}_t,t)\right],\tag{41}
$$

**(S3) 采样（前向步）：**

$$
\mathbf z_{t-1}=\sqrt{\bar\alpha_{t-1}}\hat{\mathbf z}'_0+\sqrt{1-\bar\alpha_{t-1}}\boldsymbol\epsilon.\tag{42}
$$

三者共同强制 $C_1$（测量）、$C_2$（反向轨迹）与 $C_3$（前向扩散）一致性。实现细节与超参数依赖官方 GitHub 仓库⁶。SITCOM 在每一步微调去噪器输入，使其去噪输出匹配测量且保持接近当前状态；随后用 Tweedie 公式计算干净估计并经前向核重加噪，使下一步输入保持在分布内。

> **脚注 6（原文）：** https://github.com/sjames40/SITCOM

**DMPlug [51]**⁷ 把整个反向扩散过程 $R(\cdot)$ 视为从种子到对象的确定性函数，直接对种子 $\mathbf z$ 优化求解逆问题：

$$
\mathbf z^*\in\arg\min_{\mathbf z}\ell\left(\mathbf y,\mathbf A(R(\mathbf z))\right)+\Omega(R(\mathbf z)),\qquad\mathbf x^*=R(\mathbf z^*).\tag{43}
$$

多数现有基于扩散的逆问题方法以**逐步**方式把反向扩散与测量投影交错，但这常破坏**流形可行**（保持在数据流形 $\mathcal M$ 上）与**测量可行**（满足 $\{\mathbf x|\mathbf y=\mathbf A(\mathbf x)\}$）。相反，DMPlug 不是逐步的：它通过保持预训练反向过程**完整**来维持流形可行，同时以全局优化促进 $\mathbf y\approx\mathbf A(\mathbf x)$。

> **脚注 7（原文）：** https://github.com/sun-umn/DMPlug

**ΠGDM [22]** 考虑如下梯度更新方案：

$$
\mathbf x_{t-1}=\mathrm{DDIM}(\mathbf x_t)-\eta\left((\mathbf y-\mathbf A(\mathbb E[\mathbf x_0|\mathbf x_t]))^\top\left(r_t^2\mathbf A\mathbf A^\top+\sigma_y^2\mathbf I\right)^{-1}\mathbf A\frac{\partial\mathbb E[\mathbf x_0|\mathbf x_t]}{\partial\mathbf x_t}\right)^\top,\tag{44}
$$

其中 $\eta$ 控制步长，$\sigma_y$ 表示测量噪声水平，$r_t$ 为恒等后验协方差的时间相关尺度。该方法我们使用 [29] 提供的官方可靠代码。

**OT-ODE [45]** 把 ΠGDM [22] 的梯度引导扩展到经最优传输路径的 ODE 采样，其恒等协方差方差为 $r^2(t)=\left(\frac{\sigma(t)^2}{\alpha(t)^2}+\sigma(t)^2\right)\mathbf I$。此外，条件期望 $\mathbb E[\mathbf x_0|\mathbf x_t]$ 按附录 A.3 的关系由速率场 $\mathbf v_\theta(\mathbf x_t,t)$ 计算。为公平比较，我们使用与 LFlow 相同的求解器即 adaptive Heun。

## 附录 D 补充实验与消融

### D.1 CelebA-HQ（$256\times256\times3$）

**表 5：CelebA-HQ 验证样本上线性逆问题求解的定量结果。** 粗体与下划线为最佳与次佳；灰色阴影方法为像素空间方法。（来源：原文第 29 页。）

| 方法 | 去模糊(G) PSNR↑ | SSIM↑ | LPIPS↓ | 去模糊(M) PSNR↑ | SSIM↑ | LPIPS↓ | SR(×4) PSNR↑ | SSIM↑ | LPIPS↓ | 修复(方框) PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LFlow（本文） | 29.06 | 0.825 | **0.164** | 30.14 | 0.845 | **0.167** | 28.92 | 0.830 | **0.170** | 24.82 | **0.876** | **0.123** |
| SITCOM [60] | 28.74 | 0.792 | 0.275 | 28.05 | 0.776 | 0.324 | 28.45 | 0.812 | 0.208 | 21.45 | 0.733 | 0.216 |
| DAPS [37] | 26.66 | 0.773 | 0.314 | 27.22 | 0.766 | 0.251 | 28.29 | 0.798 | 0.227 | 21.15 | 0.807 | 0.202 |
| Resample [36] | 28.07 | 0.742 | 0.239 | 28.37 | 0.804 | 0.232 | 29.84 | 0.806 | 0.193 | 19.49 | 0.797 | 0.237 |
| PSLD [33] | 29.47 | **0.833** | 0.310 | 29.75 | 0.821 | 0.313 | **31.65** | 0.829 | 0.246 | 24.03 | 0.812 | 0.165 |
| MPGD [38] | **29.85** | 0.821 | 0.302 | 29.09 | 0.792 | 0.348 | 29.01 | 0.760 | 0.280 | 23.80 | 0.773 | 0.198 |
| OT-ODE [45] | 27.83 | 0.789 | 0.292 | 26.15 | 0.758 | 0.326 | 28.95 | 0.784 | 0.251 | 22.37 | 0.790 | 0.225 |
| C-ΠGFM [48] | 28.26 | 0.801 | 0.280 | 27.18 | 0.743 | 0.335 | 29.52 | 0.805 | 0.226 | 22.84 | 0.798 | 0.219 |

**图 7：** CelebA-HQ 测试集上的定性结果。第 1 行：去模糊（高斯）；第 2 行：去模糊（运动）；第 3 行：SR×4；第 4 行：修复。（来源：原文第 29 页。）

在 CelebA-HQ 上，LFlow 在四个任务中均取得最低 LPIPS，并在 3/4 任务中取得最高 SSIM：LPIPS 分别为 0.164（高斯去模糊）、0.167（运动去模糊）、0.170（超分辨率）与 0.123（修复），其中修复任务相对次优方法领先 0.042；PSNR 全程保持有竞争力，在两个任务中排名第一、其余接近领先。这些定量收益反映在视觉结果中：两个去模糊任务中 LFlow 恢复更锐利的眼部轮廓、面部边缘与皮肤纹理，避免 MPGD 与 PSLD 中的振铃或过度锐化；超分辨率中它以平滑过渡保持睫毛、嘴唇等细节，维持自然梯度且不引入伪影；修复任务中 LFlow 给出色调与几何连贯的语义一致补全，而其他方法表现出明暗失配、接缝或斑驳纹理。这些结果突出 LFlow 在多样面部重建中恢复细结构并保持感知真实感的能力。

### D.2 CelebA-HQ（$512\times512\times3$）

我们进一步在高分辨率 CelebA-HQ 数据集（$512\times512\times3$）上测试并评估方法，展示其处理复杂图像处理任务的稳健能力。图 8 展示了我们的方法在各类任务中提升图像质量的有效性与通用性。

**图 8：** CelebA-HQ $512\times512$ 数据集上的补充结果。第 1 行：去模糊（高斯）；第 2 行：去模糊（运动）；第 3 行：SR×4；第 4 行：修复。（来源：原文第 30 页。）

### D.3 FID 分数结果

**表 6：FFHQ、CelebA-HQ 与 ImageNet 上四个逆问题的 FID↓ 分数。**（来源：原文第 31 页。）

| 方法 | 去模糊(G) FFHQ | CelebA | ImageNet | 去模糊(M) FFHQ | CelebA | ImageNet | SR(×4) FFHQ | CelebA | ImageNet | 修复(方框) FFHQ | CelebA | ImageNet |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LFlow（本文） | **52.48** | **47.79** | 88.76 | **57.11** | **48.53** | 82.89 | **58.49** | 51.07 | 92.28 | **34.40** | **30.78** | **117.45** |
| SITCOM [60] | 74.80 | 76.72 | **72.95** | 70.18 | 70.26 | 68.64 | 67.30 | 62.58 | 90.55 | 45.25 | 50.05 | 123.62 |
| DAPS [37] | 72.45 | 65.58 | 75.51 | 76.23 | 67.23 | 89.17 | 65.78 | 48.47 | 83.42 | 51.28 | 45.59 | 126.36 |
| DMplug [51] | 78.50 | — | — | 75.35 | — | — | 80.86 | — | — | 60.36 | — | — |
| Resample [36] | 59.64 | 52.47 | 63.35 | 69.74 | 63.12 | 85.90 | 78.62 | 59.47 | 105.25 | 55.60 | 68.31 | 138.84 |
| MPGD [38] | 64.20 | 61.37 | 102.58 | 70.32 | 88.7 | 146.58 | 90.55 | 84.43 | 119.12 | 84.53 | 53.15 | 154.28 |
| PSLD [33] | 62.49 | 57.92 | 87.39 | 68.94 | 75.21 | 124.73 | 66.22 | 70.66 | 80.58 | 43.89 | 40.18 | 119.12 |
| OT-ODE [45] | 56.72 | 62.23 | — | 53.55 | 58.12 | — | 60.71 | **47.83** | — | 40.31 | 37.92 | — |
| C-ΠGFM [48] | — | 56.85 | — | — | 50.54 | — | — | 45.10 | — | — | 34.96 | — |

PSNR 与 SSIM 是常用的恢复指标，量化像素级保真；LPIPS 与 FID 则被视为感知指标，评估高层语义相似性或感知质量。本文关注含噪测量下的图像重建任务；在此类设定中，FID 等感知指标虽对评估以视觉真实感为优先的生成模型有效，但主要衡量分布级相似性，可能忽略结构细节，尤其在细粒度信息关键时；此外，当重建图像感知上合理却显著偏离真值时，FID 可能产生误导 [49]。相反，PSNR 与 SSIM 对噪声抑制与内容保持提供客观评估，这在我们的实验中至关重要。尽管如此，我们仍报告上述三个数据集、四个任务的 FID 分数。如表 6 所示，我们的算法在恢复与感知指标之间取得平衡折中：在含噪图像重建任务中，它既给出最佳恢复指标，也取得较强感知分数。

### D.4 超参数 $K$ 的消融

为评估超参数 $K$ 的影响，我们在 FFHQ 数据集上开展消融。如表 7 所示，$K=2$ 相比 $K=1$ 在各任务上平均性能略好；我们也测试了 $K\ge3$，结果显示改进可忽略而计算成本更高。因此我们采用 $K=2$，它在保持合理推理时间的同时带来一致收益。

**表 7：FFHQ 上参数 $K$ 的消融。** 增大 $K$ 带来边际收益但成本更高；$K=2$ 在性能与效率之间取得最佳折中。（来源：原文第 31 页。）

| $K$ | GDB PSNR↑ | SSIM↑ | LPIPS↓ | MDB PSNR↑ | SSIM↑ | LPIPS↓ | SR PSNR↑ | SSIM↑ | LPIPS↓ | BIP PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 28.72 | 0.829 | 0.172 | 29.71 | 0.842 | 0.173 | 28.80 | 0.834 | 0.183 | 23.59 | 0.859 | 0.136 |
| 2 | **29.10** | **0.837** | **0.166** | **30.04** | **0.849** | **0.168** | **29.12** | **0.841** | **0.176** | **23.85** | **0.867** | **0.132** |

### D.5 LFlow 与监督式方法的比较

我们纳入了使用条件扩散模型得到的**监督式**结果。相比 SR3 [81] 与 InvFussion [82] 等**监督式**逆方法，本方法具有若干关键优势：

- LFlow 是零样本方法，无需重训练即可泛化到多样任务；而**监督式**方法需要为每个具体任务训练单独模型。
- LFlow 对变化的退化类型稳健，而**监督式**方法面对分布偏移时常泛化不佳。
- LFlow 在某些数据集与分辨率上性能显著更好——例如 $256\times256$ 的 FFHQ。

这些优势在表 8 中清晰体现。

**表 8：LFlow 与监督式基线在两个任务（超分辨率与方框修复）上的比较。** 超分辨率与 SR3（在 ImageNet 上训练）比较；方框修复与 InvFussion（在 FFHQ 上训练）比较。（来源：原文第 32 页。）

| 方法 | SR PSNR↑ | SSIM↑ | LPIPS↓ | Inpainting PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|
| SR3 [81] | 24.65 | **0.708** | 0.347 | – | – | – |
| InvFussion [82] | – | – | – | 20.12 | 0.827 | 0.215 |
| LFlow（本文） | **25.29** | 0.696 | **0.338** | **23.85** | **0.867** | **0.132** |

### D.6 预训练模型与算法转换

**预训练模型的转换。** 从离散时间扩散模型到连续时间流模型的转换最早由 [45] 引入，其做法是对齐两个过程的信噪比（SNR）。原则上，这使离散扩散步 $\{\tau\}$ 可映射到连续流时间 $t$ 并相应缩放噪声。然而该映射在限制性假设下才实际有效——即两条轨迹服从相同分布路径（如高斯）且使用线性噪声调度。对具有相似线性调度的预训练模型，该转换可行；但对离散时间潜扩散模型（如 LDM、Stable Diffusion），其自定义非线性调度破坏了干净的 SNR 对齐，常需解非线性甚至三次方程才能推断一致的流时间。

**算法转换。** 除转换预训练模型本身外，还必须考虑采样**算法**。若干基线本质上是离散时间的：其更新规则依赖有限噪声网格与逐步重加噪核。此类设计并不总能获得连续时间对应物，因此直接转换并非普遍可行。尽管如此，我们成功把两个代表性方法 PSLD 与 MPGD 扩展到连续时间流设定：把它们的投影—修正步重写为 ODE 采样器内的无穷小更新，得到在精神上紧密遵循原算法、同时以预训练流先验运行的连续时间对应物。相反，本质依赖离散重加噪的算法（如 DAPS）若不经大幅重新设计则无法忠实映射。

**表 9：FFHQ 上 LFlow 与 CT-MPGD、CT-PSLD 连续时间版本在四个逆问题上的定量比较。** 粗体与下划线为最佳与次佳。（来源：原文第 32 页。）

| 方法 | 去模糊(G) PSNR↑ | SSIM↑ | LPIPS↓ | 去模糊(M) PSNR↑ | SSIM↑ | LPIPS↓ | SR(×4) PSNR↑ | SSIM↑ | LPIPS↓ | 修复(方框) PSNR↑ | SSIM↑ | LPIPS↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LFlow（本文） | 29.10 | 0.837 | **0.166** | **30.04** | **0.849** | **0.168** | **29.12** | **0.841** | **0.176** | **23.85** | **0.867** | **0.132** |
| PSLD [33] | **30.28** | **0.836** | 0.281 | 29.21 | 0.812 | 0.303 | 29.07 | 0.834 | 0.270 | 24.21 | 0.847 | 0.169 |
| CT-PSLD | 27.11 | 0.783 | 0.332 | 25.98 | 0.770 | 0.356 | 26.53 | 0.772 | 0.331 | 20.60 | 0.790 | 0.252 |
| MPGD [38] | 29.34 | 0.815 | 0.308 | 27.98 | 0.803 | 0.324 | 27.49 | 0.788 | 0.295 | 20.58 | 0.806 | 0.324 |
| CT-MPGD | 24.96 | 0.765 | 0.343 | 24.30 | 0.751 | 0.375 | 24.69 | 0.740 | 0.338 | 20.01 | 0.780 | 0.353 |

**讨论。** 表 9 清楚表明**算法转换**并非平凡。尽管我们成功把 PSLD 与 MPGD 重写为连续时间对应物（CT-PSLD 与 CT-MPGD），二者相比原离散时间版本均出现显著性能下降。重要的是，我们保持比较公平——采用与 LFlow 相同的 ODE 求解器（adaptive Heun）。这表明仅把扩散先验替换为流先验、同时保留算法结构，并不能保证在连续时间中获得有竞争力的性能；该差距反而凸显设计本质上兼容基于 ODE 的流表述的采样策略的必要性，这正是我们提出的 LFlow 框架所实现的。

### D.7 补充视觉结果（建议放大查看）

**图 9：** FFHQ 数据集上的补充高斯去模糊结果。（来源：原文第 33 页。）
**图 10：** CelebA-HQ 数据集上的补充高斯去模糊结果。（来源：原文第 33 页。）
**图 11：** CelebA-HQ 数据集上的补充运动去模糊结果。（来源：原文第 34 页。）
**图 12：** ImageNet 数据集上的补充运动去模糊结果。（来源：原文第 34 页。）
**图 13：** FFHQ 数据集上的补充超分辨率结果。（来源：原文第 35 页。）
**图 14：** CelebA-HQ 数据集上的补充超分辨率结果。（来源：原文第 35 页。）
**图 15：** FFHQ 数据集上的补充修复结果。（来源：原文第 36 页。）
**图 16：** CelebA-HQ 数据集上的补充修复结果。（来源：原文第 37 页。）

## NeurIPS 论文清单

> 原文此处为 NeurIPS 2025 官方清单。以下逐项转录**问题与答案**，并附原文 justification 的译文；官方指南性说明文字从简（省略）。

1. **主张：** 摘要与引言中的主要主张是否准确反映论文贡献与范围？**[Yes]** —— 我们仅声称提出一种新方法（第 4 节描述），并在 §5.1 与 §5.2 与先前方法比较。
2. **局限：** 论文是否讨论作者工作的局限？**[Yes]** —— 我们在第 2 节讨论局限。
3. **理论假设与证明：** 对每个理论结果，是否提供完整假设与完整（且正确）的证明？**[NA]** —— 对文中每个理论结果，我们显式给出完整假设并包含完整逐步证明；所有推导均经数学正确性检查、无遗漏步骤；在适当时给出假设（如正则性或凸性条件）的形式化陈述，并在正文或附录提供完整证明以保证透明与可复现。
4. **实验结果可复现性：** 论文是否充分披露复现主要实验结果所需的所有信息？**[Yes]** —— 稿件描述了所有方法与实验，提供了算法；代码将在后续更新中提供。
5. **数据与代码的开放获取：** 论文是否提供数据与代码的开放获取及充分说明以忠实复现主要实验结果？**[No]** —— 我们计划在接收后公开完整代码库与复现所有实验结果的说明；投稿时因匿名要求与仓库清理无法提供代码；我们确认所有实验可复现，并将以详细脚本与配置说明记录。
6. **实验设置/细节：** 论文是否给出理解结果所需的所有训练与测试细节（如数据划分、超参数及其选择方式、优化器类型等）？**[Yes]** —— 实验细节见附录 C。
7. **实验统计显著性：** 论文是否恰当且正确地报告误差棒或其他统计显著性信息？**[No]** —— 为表 1、2、7 计算误差棒需要对每个模型在不同数据集上重新训练多次。
8. **实验计算资源：** 对每个实验，论文是否提供复现所需计算资源（计算单元类型、内存、执行时间）的充分信息？**[Yes]** —— 所有实验在配备单块 NVIDIA RTX 3090 GPU 的本地机器上完成；实验细节见附录 C。
9. **伦理准则：** 论文研究是否在各方面符合 NeurIPS 伦理准则？**[Yes]** —— 我们已阅读并同意 NeurIPS 伦理准则。
10. **更广泛影响：** 论文是否讨论工作的潜在正面与负面社会影响？**[NA]** —— 本工作没有社会影响。
11. **防护措施：** 论文是否描述了为负责任发布高误用风险数据或模型所设的防护措施？**[NA]** —— 本论文不构成此类风险。
12. **既有资产的许可：** 论文所用资产（如代码、数据、模型）的创建者或原始所有者是否被恰当署名，许可与使用条款是否被明确提及并恰当遵守？**[Yes]** —— FFHQ、ImageNet 与 CelebA 数据集按其各自的非商业研究许可使用并恰当引用；任何第三方代码或预训练模型（如用于流匹配的）均在兼容的开源许可（如 MIT）下使用并在正文中引用。
13. **新资产：** 论文引入的新资产是否有充分文档，且文档是否随资产提供？**[NA]** —— 论文未发布新资产。
14. **众包与人类受试者研究：** 对众包实验与人类受试者研究，论文是否包含给参与者的完整说明与截图（如适用）以及报酬细节？**[NA]** —— 论文不涉及众包，也不涉及人类受试者研究。
15. **机构审查委员会（IRB）批准或等效审查：** 论文是否描述研究参与者可能承担的风险、是否向受试者披露该风险、以及是否获得 IRB 批准（或依据所在国家/机构要求的等效批准/审查）？**[NA]** —— 论文不涉及众包，也不涉及人类受试者研究。
16. **LLM 使用声明：** 若 LLM 是本研究的核心方法中重要、原创或非标准的组成部分，论文是否描述其使用？**[NA]** —— 本工作核心方法任何部分均不涉及大语言模型（LLM）；LLM 未被用于设计算法、生成模型输出或开展任何实验，仅用于少量写作支持与清晰度改进，不影响研究的科学原创性或严谨性。

## 图注与表注

**图 1（原文第 4 页）：** LFlow 流程与沿条件路径的高斯去模糊快照（详见 §3 图注）。
**图 2（原文第 6 页）：** 我们的方法与 OT-ODE 的后验协方差随 $t$ 的变化及重建示例。
**图 3（原文第 8 页）：** FFHQ 上四类逆问题的定性结果（第 1 行高斯去模糊、第 2 行运动去模糊、第 3 行 SR×4、第 4 行修复）。
**图 4（原文第 9 页）：** ImageNet 上四类逆问题的定性结果。
**图 5（原文第 10 页）：** 起始时刻 $t_s$ 的消融（超分辨率，FFHQ 与 ImageNet）。
**图 6（原文第 10 页）：** $\mathrm{Cov}[\mathbf z_0|\mathbf z_t]$ 影响的视觉结果。
**图 7（原文第 29 页）：** CelebA-HQ 测试集定性结果（四行对应四类任务）。
**图 8（原文第 30 页）：** CelebA-HQ $512\times512$ 的补充结果（四类任务）。
**图 9—16（原文第 33—37 页）：** 各数据集上的补充高斯/运动去模糊、超分辨率与修复视觉结果。

**表注汇总：** 表 1（第 8 页）FFHQ 定量评估；表 2（第 9 页）ImageNet 定量评估；表 3（第 10 页）后验协方差消融；表 4（第 10 页）推理时间；表 5（第 29 页）CelebA-HQ 定量评估；表 6（第 31 页）FID 分数；表 7（第 31 页）参数 $K$ 消融；表 8（第 32 页）与监督式方法比较；表 9（第 32 页）与连续时间版本（CT-PSLD/CT-MPGD）比较。表 1—2 与表 5—9 的粗体/下划线规则同表 1 说明（最佳/次佳）；像素空间方法以灰色阴影标注。表 1、表 6—7 已用 PDF 渲染（第 8、31 页）核对，其余表按原文文本抽取逐格转录。

**本页范围与校对状态：** 本页覆盖 NeurIPS 2025 会议论文集版本（本地 44 页）全文：摘要、第 1—6 节、致谢、参考文献 [1]—[82]（原文编号条目）、附录 A（证明，含引理 A.1—A.5 与 A.1—A.7 各证明、式 (22)—(30)）、附录 B（三类任务的闭式解，引理 B.1 与式 (31)—(33)）、附录 C（实现细节、算法 1、式 (34)—(44)）、附录 D（补充实验、表 5—9、图 7—16）、NeurIPS 论文清单（16 项答案逐项转录）。共图 16、表 9、编号式 (1)—(44)。**许可状态：会议论文集版本，再传播许可待核验；本页仅作学习用途、不计入可公开全文统计（已在页首声明）。** 表格核对：用 `render.py` 渲染 PDF 第 8、31 页并核对表 1（FFHQ 9 行 × 12 列）与表 6、7；其余表按原文文本抽取逐格转录。原文疑点已在页首译注列出（表 8 占位、清单第 3 项前后矛盾、LPIPS 增益表述、PDF 排版断行等），均按原文照录并加注。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内图像未数字化转写，图注只给出布局与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以本地会议论文集 PDF 为准。
{% endraw %}