---
layout: page
title: "扩散模型中实用且渐近精确的条件采样｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-05-practical-and-asymptotically-exact-conditional-sampling-in-diffusion-m/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/bb7d33856362d71f/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 扩散模型中实用且渐近精确的条件采样

**原题：** Practical and Asymptotically Exact Conditional Sampling in Diffusion Models  
**作者：** Luhuan Wu\*¹、Brian L. Trippe\*¹、Christian A. Naesseth²、David M. Blei¹、John P. Cunningham¹（\* 表示同等贡献，作者顺序由抛硬币决定）。单位：¹ 哥伦比亚大学（Columbia University）；² 阿姆斯特丹大学（University of Amsterdam）。邮箱：lw2827@columbia.edu、blt2114@columbia.edu、c.a.naesseth@uva.nl、david.blei@columbia.edu、jpc2181@columbia.edu。  
**版本：** 会议论文集版本（NeurIPS-2023-practical-and-asymptotically-exact-conditional-sampling-in-diffusion-models-Paper-Conference.pdf），本地 PDF 32 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。原论文为第 37 届神经信息处理系统大会（NeurIPS 2023）论文。  
**范围与状态：** 全文中文译稿：摘要、第 1—7 节、致谢、参考文献（英文原条目）、附录 A（TDS 细节与定理证明）、B（黎曼 TDS）、C（附加相关工作）、D（实证细节）、E（motif-scaffolding 应用细节）、图 1—3 与附录图 D—Q 图注、表 1、式（1）—（18）。表 1 已用 PDF 渲染逐格核对；逐句逐式终校未做，不标记为已验收全文。

> **许可与使用说明：** 原文本地为 NeurIPS 2023 会议论文集 PDF；**再传播许可待核验**。本页仅作个人学习用途的中文译稿，不代表已获授权，**不计入可公开全文统计**。若核验后许可不允许再传播，本页应下线或仅保留摘要级介绍。
>
> **译注（术语与原文疑点）：** 原文缩写保留英文：TDS（Twisted Diffusion Sampler）、TDS-IS、IS（importance sampling）、SMC / SMC-Diff、MCGdiff、ESS（effective sample size）、VE/VP（variance exploding / preserving）、DDPM、CG（classifier guidance）、RFdiffusion、FrameDiff、SE(3)/SO(3)、TN（tangent normal，切空间正态）、BA/CA（Bayes accuracy / classification accuracy）、scRMSD、SEM、FID、IS（Inception score）。**原文疑点/说明（按原文照录并加注）：** ①原文附录图编号为字母（Figure D—Q），而正文图为 Figure 1—3，属论文集排版中补充材料独立编号所致，本页按原文保留；②原文 §5.1 脚注说明"该似然除点 $\mathbf x=(0,0)$ 外光滑"；③原文附录 D.2.2 把 ΠGDM 的方差方案记作 "GDM"（图 J 图例），与正文中 ΠGDM 缩写不一致，按原文照录；④原文附录 A.5 的定理 2 与定理 3（Chopin 与 Papaspiliopoulos 命题 11.4）编号独立于正文定理 1；⑤原文 §6 报告"24 个 motif-scaffolding 基准问题中 TDS 与 RFdiffusion 各在 11 个上成功率更高，2 个问题两者均为 0%"，与图 O 的 24/25 问题说明一致（第 25 个问题 6VW1 因多链被排除）；⑥原文 D.2.3 的 Table 1 中 "Unconditional model" 性能取自 [9]，评估于 50k 样本、250 采样步，与其余三行的 16k 样本、100 步不同。

## 摘要

扩散模型已在分子设计与文本到图像生成等一系列条件生成任务上取得成功。然而这些成就主要依赖任务特定的条件训练或有缺陷的启发式近似。理想的条件生成方法应无需任务特定训练，即可对广泛的条件分布给出**精确样本**。为此我们提出**扭曲扩散采样器（Twisted Diffusion Sampler, TDS）**。TDS 是一种**序列 Monte Carlo（SMC）**算法，通过模拟一组带权粒子来瞄准扩散模型的条件分布。其核心思想是**扭曲（twisting）**——一种具有良好计算效率的 SMC 技术——用以在纳入启发式近似的同时不牺牲渐近精确性。我们首先在仿真与条件图像生成任务中发现，TDS 提供了统计—计算折中：粒子更多时近似更精确，但即便只用两个粒子也相较启发式有经验改进。随后我们转向**motif-scaffolding**（蛋白质设计中的核心任务），使用 TDS 在黎曼扩散模型上的扩展；在基准任务上，TDS 支持灵活的条件准则，并常优于最先进的条件训练模型。

## 1 引言

条件采样是机器学习工具箱中的基本原语。从一个在数据 $\mathbf x$ 上参数化分布 $p_\theta(\mathbf x)$ 的生成模型出发，把信息 $\mathbf y$ 纳入联合分布 $p_\theta(\mathbf x,\mathbf y)=p_\theta(\mathbf x)p(\mathbf y|\mathbf x)$，该联合分布进而蕴含条件分布 $p_\theta(\mathbf x|\mathbf y)$，所期望的输出即从中采样。

例如在蛋白质设计中，$p_\theta(\mathbf x)$ 可表示物理可实现蛋白质结构的分布，$\mathbf y$ 是赋予所需生化功能的子结构，则 $p_\theta(\mathbf x|\mathbf y)$ 的样本便是包含目标子结构的物理可实现结构 [如 34, 37]。扩散模型是一类在条件生成任务中已展示成功的生成模型 [18, 27, 33, 37]：它们通过从噪声逐步构建数据的迭代细化过程参数化分布 $p_\theta(\mathbf x)$；当用于条件生成时，该细化过程被修改以在每一步考虑条件信息 [9, 19, 27, 33]。

一种方法是在训练中纳入条件信息 [如 9, 27]：或修改无条件模型使其以 $\mathbf y$ 为输入，或训练独立的条件模型从部分含噪输入预测 $\mathbf y$。然而条件训练需要 (i) 收集大量成对的数据与条件信息样本 $(\mathbf x,\mathbf y)$；(ii) 在适配新条件任务时设计与训练任务特定模型。例如图像修复与类别条件图像生成都可基于同一（无条件）图像分布 $p_\theta(\mathbf x)$ 形式化为条件采样问题，但条件训练方法需在两套精心整理的条件输入上分别训练模型。

为避免条件训练，另一条研究路线使用直接在无条件扩散模型上操作的启发式近似：一旦训练好无条件模型 $p_\theta(\mathbf x)$，便可灵活结合各种条件准则生成定制输出。这些方法已被用于修复问题 [24, 33, 34] 与其他逆问题 [1, 6, 19, 32]。但这些启发式在多大程度上逼近其所模仿的精确条件分布并不清楚；例如在修复任务上，它们常无法给出同时与条件信息和无条件模型一致的输出 [40]。在需要精确条件分布的领域（如分子设计），这些顾虑至关重要——即便很小的近似误差也可能导致具有化学上不合理键长的原子结构。

本文提出一种从无条件扩散模型进行条件采样的**实用且渐近精确**方法。我们使用**序列 Monte Carlo（SMC）**——一种用于序列概率模型渐近精确推断的通用工具 [5, 10, 25]。SMC 通过一系列提议与加权机制模拟由加权轨迹（粒子）构成的集合，这些加权粒子构成对目标分布的渐近精确近似。本文的前提是认识到扩散模型的**序列结构**允许把 SMC 用于从条件分布 $p_\theta(\mathbf x|\mathbf y)$ 采样。我们设计了一种利用**扭曲**的 SMC 算法——扭曲是一种修改提议与加权机制以逼近最优选择的 SMC 技术 [15, 38]。最优扭曲虽不可行，但我们用近期条件采样的启发式方法 [如 19] 有效近似它，并通过加权机制纠正误差。所得算法保持对 $p_\theta(\mathbf x|\mathbf y)$ 的渐近精确性，且经验上即便仅用两个粒子也可能优于单纯启发式。

贡献总结：(i) 提出实用的 SMC 算法 **TDS**，用于扩散模型的渐近精确条件采样；(ii) 表明 TDS 适用于一系列条件生成问题，并可扩展到黎曼流形扩散模型；(iii) 在 MNIST 修复与类别条件生成任务上展示 TDS 相对启发式方法的实证改进；(iv) 在短支架（scaffold）的蛋白质 motif-scaffolding 问题上，TDS 提供更大灵活性，并取得比最先进条件训练模型更高的成功率。

## 2 背景：扩散模型与序列 Monte Carlo

**扩散模型。** 扩散模型从纯噪声 $\mathbf x_T$ 出发，通过迭代细化含噪数据 $\mathbf x_t$ 的序列生成数据点 $\mathbf x_0$。该过程把 $\mathbf x_0$ 的分布参数化为长度 $T$ 的 Markov 链的边缘：

$$
p_\theta(\mathbf x_0)=\int p(\mathbf x_T)\prod_{t=1}^{T}p_\theta(\mathbf x_{t-1}|\mathbf x_t)\,\mathrm d\mathbf x_{1:T},\tag{1}
$$

其中 $p(\mathbf x_T)$ 为易采样噪声分布，每个 $p_\theta(\mathbf x_{t-1}|\mathbf x_t)$ 为由第 $(T-t)$ 个细化步定义的转移分布。

扩散模型 $p_\theta$ 被拟合以匹配我们拥有样本的数据分布 $q(\mathbf x_0)$。为此设定前向过程 $q(\mathbf x_0)\prod_{t=1}^{T}q(\mathbf x_t|\mathbf x_{t-1})$ 逐步给数据加噪，其中 $q(\mathbf x_t|\mathbf x_{t-1})=\mathcal N(\mathbf x_t;\mathbf x_{t-1},\sigma^2)$，$\sigma^2$ 为正方差。拟合即找到 $\theta$ 使 $p_\theta(\mathbf x_{t-1}|\mathbf x_t)\approx q(\mathbf x_{t-1}|\mathbf x_t)$（前向过程的反向条件）。若对所有 $t$ 都实现该近似，且 $T\sigma^2$ 足够大使 $q(\mathbf x_T)$ 可近似为 $q(\mathbf x_T)\approx\mathcal N(\mathbf 0,T\sigma^2)=:p(\mathbf x_T)$，则 $p_\theta(\mathbf x_0)\approx q(\mathbf x_0)$。

特别地，当 $\sigma^2$ 足够小时，$q$ 的反向条件近似为高斯：

$$
q(\mathbf x_{t-1}|\mathbf x_t)\approx\mathcal N\left(\mathbf x_{t-1};\mathbf x_t+\sigma^2\nabla_{\mathbf x_t}\log q(\mathbf x_t),\sigma^2\right),\tag{2}
$$

其中 $q(\mathbf x_t)=\int q(\mathbf x_0)q(\mathbf x_t|\mathbf x_0)\,\mathrm d\mathbf x_0$，$\nabla_{\mathbf x_t}\log q(\mathbf x_t)$ 即（Stein）分数 [33]。为对应式（2），扩散模型通过分数网络 $\mathbf s_\theta(\mathbf x_t,t)$ 参数化 $p_\theta(\mathbf x_{t-1}|\mathbf x_t)$：

$$
p_\theta(\mathbf x_{t-1}|\mathbf x_t):=\mathcal N\left(\mathbf x_{t-1};\mathbf x_t+\sigma^2\mathbf s_\theta(\mathbf x_t,t),\sigma^2\right).\tag{3}
$$

当 $\mathbf s_\theta(\mathbf x_t,t)$ 被训练为逼近 $\nabla_{\mathbf x_t}\log q(\mathbf x_t)$ 时，有 $p_\theta(\mathbf x_{t-1}|\mathbf x_t)\approx q(\mathbf x_{t-1}|\mathbf x_t)$。值得注意的是，逼近分数等价于学习去噪神经网络 $\hat{\mathbf x}_\theta(\mathbf x_t,t)$ 以逼近 $\mathbb E_q[\mathbf x_0|\mathbf x_t]$：由 Tweedie 公式 [12, 28] 有 $\nabla_{\mathbf x_t}\log q(\mathbf x_t)=(\mathbb E_q[\mathbf x_0|\mathbf x_t]-\mathbf x_t)/t\sigma^2$，故可设 $\mathbf s_\theta(\mathbf x_t,t):=(\hat{\mathbf x}_\theta(\mathbf x_t,t)-\mathbf x_t)/t\sigma^2$。神经网络 $\hat{\mathbf x}_\theta(\mathbf x_t,t)$ 可用去噪分数匹配学习 [如 18, 35]。后文在上下文明确时省略 $\hat{\mathbf x}_\theta$ 与 $\mathbf s_\theta$ 中的 $t$ 参数。附录 A 把上述表述推广到实践中常用的扩散过程形式。

**序列 Monte Carlo。** SMC 是一种通用工具，用于从变量 $\mathbf x_{0:T}$ 上的一系列分布（终止于最终目标）近似采样 [5, 10, 14, 25]。SMC 通过在 $T$ 步迭代过程中生成 $K$ 个粒子 $\{\mathbf x_t^k\}_{k=1}^{K}$ 来近似这些目标。关键要素是提议 $r_T(\mathbf x_T)$、$\{r_t(\mathbf x_t|\mathbf x_{t+1})\}_{t=0}^{T-1}$ 与加权函数 $w_T(\mathbf x_T)$、$\{w_t(\mathbf x_t,\mathbf x_{t+1})\}_{t=0}^{T-1}$。在初始步 $T$，抽取 $K$ 个粒子 $\mathbf x_T^k\sim r_T(\mathbf x_T)$ 并令 $w_T^k:=w_T(\mathbf x_T^k)$，随后对 $t=T-1,\ldots,0$ 依次重复：

- 重采样 $\{\mathbf x_{t+1:T}^k\}_{k=1}^{K}\sim\mathrm{Multinomial}(\{\mathbf x_{t+1:T}^k\}_{k=1}^{K};\{w_{t+1}^k\}_{k=1}^{K})$；
- 提议 $\mathbf x_t^k\sim r_t(\mathbf x_t|\mathbf x_{t+1}^k)$，$k=1,\ldots,K$；
- 加权 $w_t^k:=w_t(\mathbf x_t^k,\mathbf x_{t+1}^k)$，$k=1,\ldots,K$。

提议与加权函数共同定义一系列中间目标分布

$$
\nu_t(\mathbf x_{0:T}):=\frac1{L_t}\left[r_T(\mathbf x_T)\prod_{t'=0}^{T-1}r_{t'}(\mathbf x_{t'}|\mathbf x_{t'+1})\right]\left[w_T(\mathbf x_T)\prod_{t'=t}^{T-1}w_{t'}(\mathbf x_{t'},\mathbf x_{t'+1})\right]\tag{4}
$$

其中 $L_t$ 为归一化常数。SMC 适用的经典例子是状态空间模型 [25, 第 1 章]，它描述潜状态序列 $\mathbf x_{0:T}$ 与观测 $\mathbf y_{0:T}$ 上的分布：每个中间目标 $\nu_t$ 构造为给定前 $T-t+1$ 个观测的后验 $p(\mathbf x_{0:T}|\mathbf y_{t:T})$，最终目标 $p(\mathbf x_{0:T}|\mathbf y_{0:T})$ 是给定全部观测的后验。SMC 的定义性质是：每一 $t$ 的加权粒子构成对 $\nu_t(\mathbf x_t)$ 的离散近似 $(\sum_{k'=1}^{K}w_{k'}^t)^{-1}\sum_{k=1}^{K}w_k^t\delta_{\mathbf x_t^k}(\mathbf x_t)$（$\delta$ 为 Dirac 测度），在粒子数趋于无穷时变得任意精确 [5, 命题 11.4]。因此通过选择 $r_t$ 与 $w_t$ 使 $\nu_0(\mathbf x_0)$ 匹配所需分布，即可保证在大计算量极限下任意低的近似误差。

## 3 扭曲扩散采样器：面向扩散模型条件分布的 SMC 采样

考虑与给定似然函数 $p_{y|x_0}(\mathbf y|\mathbf x_0)$ 相关联的条件信息 $\mathbf y$。我们把 $\mathbf y$ 嵌入 $\mathbf x_{0:T}$ 与 $\mathbf y$ 的联合模型 $p_\theta(\mathbf x_{0:T},\mathbf y)=p_\theta(\mathbf x_{0:T})p_{y|x_0}(\mathbf y|\mathbf x_0)$，其中给定 $\mathbf x_0$ 时 $\mathbf y$ 与 $\mathbf x_{1:T}$ 条件独立。目标是采样 $p_\theta(\mathbf x_0|\mathbf y)$。本节开发 **TDS**——一种瞄准 $p_\theta(\mathbf x_0|\mathbf y)$ 的实用 SMC 算法。首先说明扩散模型的 Markov 结构如何允许把扩展条件分布因式分解为 SMC 可用的最终目标；然后说明扩散模型的去噪预测如何支持**扭曲**——一种使用近似"最优"提议与加权函数的 SMC 技术；最后把 TDS 扩展到似然非光滑的"修复"问题与黎曼扩散模型。

### 3.1 把条件扩散采样视为 SMC 过程

扩散模型的 Markov 结构允许一种可识别为 SMC 最终目标的因式分解。把条件分布扩展到包含 $\mathbf x_{1:T}$，写为

$$
p_\theta(\mathbf x_{0:T}|\mathbf y)=\frac{p_\theta(\mathbf x_{0:T},\mathbf y)}{p_\theta(\mathbf y)}=\frac1{p_\theta(\mathbf y)}\left[p(\mathbf x_T)\prod_{t=0}^{T-1}p_\theta(\mathbf x_t|\mathbf x_{t+1})\right]p_{y|x_0}(\mathbf y|\mathbf x_0)\tag{5}
$$

其边缘即所需 $p_\theta(\mathbf x_0|\mathbf y)$。把式（5）的扩散条件与式（4）的 SMC 目标比较，提示 SMC 可用。

例如考虑 SMC 算法的第一次尝试：设提议 $r_T(\mathbf x_T)=p(\mathbf x_T)$、$r_t(\mathbf x_t|\mathbf x_{t+1})=p_\theta(\mathbf x_t|\mathbf x_{t+1})$（$1\le t\le T$），加权函数 $w_T(\mathbf x_T)=w_t(\mathbf x_t,\mathbf x_{t+1})=1$（$1\le t\le T$）且 $w_0(\mathbf x_0,\mathbf x_1)=p_{y|x_0}(\mathbf y|\mathbf x_0)$。代入式（4）得到所需最终目标 $\nu_0=p_\theta(\mathbf x_{0:T}|\mathbf y)$，归一化常数 $L_0=p_\theta(\mathbf y)$。于是相应 SMC 算法产生最终样本与权重 $\{\mathbf x_0^k;w_0^k\}_{k=1}^{K}$，给出对所需 $p_\theta(\mathbf x_0|\mathbf y)$ 的渐近精确近似 $P^K(\mathbf x_0|\mathbf y):=(\sum_kw_0^k)^{-1}\sum_{k=1}^{K}w_0^k\delta_{\mathbf x_0^k}(\mathbf x_0)$。

上述做法本质上是以 $p_\theta(\mathbf x_{0:T})$ 为提议的重要性采样；当所有中间权重设为 1 时可跳过重采样步骤以降低方差。因此若 $p_\theta(\mathbf x_0|\mathbf y)$ 与 $p_\theta(\mathbf x_0)$ 差异过大，该方法将不可行：只有极小部分无条件样本具有高似然，精确估计 $p_\theta(\mathbf x_{0:T}|\mathbf y)$ 所需粒子数随 $\mathrm{KL}[p_\theta(\mathbf x_{0:T}|\mathbf y)\,\|\,p_\theta(\mathbf x_{0:T})]$ 指数增长 [3]。

### 3.2 扭曲扩散采样器

**扭曲**是 SMC 文献中用于减少良好近似所需粒子数的技术 [15, 16]。概言之，它引入一系列扭曲函数修改朴素提议与加权函数，使所得中间目标更接近最终目标。关于 SMC 中扭曲的背景见 Naesseth 等 [25, 第 3.2 章]。

**最优扭曲。** 考虑把 §3.1 的朴素提议 $r_t$ 乘以 $p_\theta(\mathbf y|\mathbf x_t)$，定义扭曲提议 $r_t^\ast$：

$$
r_T^\ast(\mathbf x_T)\propto p(\mathbf x_T)p_\theta(\mathbf y|\mathbf x_T),\qquad r_t^\ast(\mathbf x_t|\mathbf x_{t+1})\propto p_\theta(\mathbf x_t|\mathbf x_{t+1})p_\theta(\mathbf y|\mathbf x_t),\quad 0\le t<T.\tag{6}
$$

因子 $p_\theta(\mathbf y|\mathbf x_t)$ 即最优扭曲函数，因为它们使 SMC 采样器即便以单粒子运行也能从 $p_\theta(\mathbf x_{0:T}|\mathbf y)$ 抽取精确样本。

为看出单粒子为何是精确样本，由 Bayes 规则，式（6）的提议化为

$$
r_T^\ast(\mathbf x_T)=p_\theta(\mathbf x_T|\mathbf y),\qquad r_t^\ast(\mathbf x_t|\mathbf x_{t+1})=p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y),\quad 0\le t<T.\tag{7}
$$

因此若采样 $\mathbf x_T\sim r_T^\ast(\mathbf x_T)$ 并对 $t=T-1,\ldots,0$ 采样 $\mathbf x_t\sim r_t^\ast(\mathbf x_t|\mathbf x_{t+1})$，由 (i) 全概率定律与 (ii) 概率链式法则，即得 $\mathbf x_0\sim p_\theta(\mathbf x_0|\mathbf y)$。然而我们无法方便地从每个 $r_t^\ast$ 采样，因为 $p_\theta(\mathbf y|\mathbf x_t)$ 没有解析形式：$p_\theta(\mathbf y|\mathbf x_t)=\int p_{y|x_0}(\mathbf y|\mathbf x_0)p_\theta(\mathbf x_0|\mathbf x_t)\,\mathrm d\mathbf x_0$ 通过 $p_\theta(\mathbf x_0|\mathbf x_t)$ 依赖 $\mathbf x_t$，而后者又需从联合密度 $p_\theta(\mathbf x_{0:t-1}|\mathbf x_t)$ 边缘化掉 $\mathbf x_1,\ldots,\mathbf x_{t-1}$，其形式取决于对神经网络 $\hat{\mathbf x}_\theta$ 的 $t$ 次调用。

**可处理的扭曲。** 为避免这种不可处理性，我们通过

$$
\tilde p_\theta(\mathbf y|\mathbf x_t):=p_{y|x_0}\left(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t)\right)\approx p_\theta(\mathbf y|\mathbf x_t)\tag{8}
$$

近似最优扭曲函数——即在去噪估计 $\hat{\mathbf x}_\theta(\mathbf x_t)$（扩散模型在步骤 $t$ 对 $\mathbf x_0$ 的估计）处评估似然函数。该可处理的扭曲函数 $\tilde p_\theta(\mathbf y|\mathbf x_t)$ 是定义 TDS（算法 1）的关键要素。下面说明并开发其各组成部分。

式（8）的近似有两个良好性质。第一，$\tilde p_\theta(\mathbf y|\mathbf x_t)$ 可计算：它通过对 $\hat{\mathbf x}_\theta$ 的一次调用依赖 $\mathbf x_t$，而非像最优扭曲那样需要多次调用的不可处理积分。第二，随 $t$ 减小，$\tilde p_\theta(\mathbf y|\mathbf x_t)$ 越来越精确地逼近 $p_\theta(\mathbf y|\mathbf x_t)$——因为 $p_\theta(\mathbf x_0|\mathbf x_t)$ 集中在 $\mathbb E_{p_\theta}[\mathbf x_0|\mathbf x_t]$ 附近，而 $\hat{\mathbf x}_\theta$ 正是被拟合来逼近该值；在 $t=0$ 处可取 $\hat{\mathbf x}_\theta(\mathbf x_0)=\mathbf x_0$，于是 $\tilde p_\theta(\mathbf y|\mathbf x_0)=p_{y|x_0}(\mathbf y|\mathbf x_0)$。

接下来用式（8）构造一系列扭曲提议 $\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)$，以逼近式（7）中的最优提议 $p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)$。具体定义扭曲提议

$$
\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y):=\mathcal N\left(\mathbf x_t;\mathbf x_{t+1}+\sigma^2\mathbf s_\theta(\mathbf x_{t+1},\mathbf y),\tilde\sigma^2\right),\tag{9}
$$

其中

$$
\mathbf s_\theta(\mathbf x_{t+1},\mathbf y):=\mathbf s_\theta(\mathbf x_{t+1})+\nabla_{\mathbf x_{t+1}}\log\tilde p_\theta(\mathbf y|\mathbf x_{t+1})\tag{10}
$$

是条件分数的近似 $\mathbf s_\theta(\mathbf x_{t+1},\mathbf y)\approx\nabla_{\mathbf x_{t+1}}\log p_\theta(\mathbf x_{t+1}|\mathbf y)$，$\tilde\sigma^2$ 为提议方差。为简单可与 $p_\theta(\mathbf x_t|\mathbf x_{t+1})$ 的方差匹配取 $\tilde\sigma^2=\sigma^2$。式（9）建立在试图逼近条件前向过程反转的先前工作（如 [33, 31]）之上；式（10）中的梯度通过反向传播穿过 $\hat{\mathbf x}_\theta(\mathbf x_{t+1})$ 计算（该技术已被使用，如 [19, 32]），§4 将进一步讨论。

**扭曲目标与加权函数。** 由于 $\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)$ 一般不等于最优扭曲提议 $p_\theta(\mathbf x_t|\mathbf x_{t+1})$，必须引入非平凡的加权函数以确保所得 SMC 采样器收敛到所需最终目标。具体定义扭曲加权函数

$$
w_t(\mathbf x_t,\mathbf x_{t+1}):=\frac{p_\theta(\mathbf x_t|\mathbf x_{t+1})\tilde p_\theta(\mathbf y|\mathbf x_t)}{\tilde p_\theta(\mathbf y|\mathbf x_{t+1})\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)},\qquad t=0,\ldots,T-1\tag{11}
$$

并令 $w_T(\mathbf x_T):=\tilde p_\theta(\mathbf y|\mathbf x_T)$。若所有其他近似都精确，式（11）的加权函数将退化为最优的常数加权函数。

这些可处理的扭曲提议与加权函数定义了逐步逼近最终目标 $\nu_0=p_\theta(\mathbf x_{0:T}|\mathbf y)$ 的中间目标。把式（9）的 $\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)$ 与式（11）的 $w_t(\mathbf x_t,\mathbf x_{t+1})$ 分别代入式（4）中的 $r_t(\mathbf x_t|\mathbf x_{t+1})$ 并化简，得到中间目标

$$
\nu_t(\mathbf x_{0:T})\propto p_\theta(\mathbf x_{0:T}|\mathbf y)\left[\frac{\tilde p_\theta(\mathbf y|\mathbf x_t)}{p_\theta(\mathbf y|\mathbf x_t)}\prod_{t'=0}^{t-1}\frac{\tilde p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)}{p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)}\right].\tag{12}
$$

式（12）右端的方括号项可理解为 $\nu_t$ 相对最终目标 $\nu_0$ 从步骤 $t$ 到 0 累积的差异（推导见附录 A.3）。随 $t$ 趋于 0，$\tilde p_\theta(\mathbf y|\mathbf x_t)$ 对 $p_\theta(\mathbf y|\mathbf x_t)$ 的近似改善，且方括号内 $t$ 项乘积包含更少项——后者刻画实践提议与最优提议之间的差异。最后在 $t=0$ 处，由构造 $\tilde p_\theta(\mathbf y|\mathbf x_0)=p_\theta(\mathbf y|\mathbf x_0)$，式（12）化为 $\nu_0(\mathbf x_{0:T})=p_\theta(\mathbf x_{0:T}|\mathbf y)$，如所需。

**TDS 算法与渐近精确性。** 扭曲提议 $\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)$ 与加权函数 $w_t(\mathbf x_t,\mathbf x_{t+1})$ 一起给出 **TDS**（算法 1）。算法 1 为简单起见给出多项式重采样，实践中也可用其他重采样策略（如系统重采样 [5, 第 9 章]）。在附加条件下，TDS 对 $p_\theta(\mathbf x_0|\mathbf y)$ 给出任意精确的估计。关键是，该保证**不依赖**对推导扭曲提议与权重所用近似精度的任何假设；完整条件与证明见附录 A。

**定理 1（非正式）：** 令 $P^K(\mathbf x_0)=(\sum_{k'}^{K}w_{k'})^{-1}\sum_{k=1}^{K}w_k\delta_{\mathbf x_0^k}(\mathbf x_0)$ 表示算法 1 以 $K$ 个粒子返回的粒子与权重所定义的离散测度。在关于扭曲提议与加权函数的正则性条件下，$P^K(\mathbf x_0)$ 当 $K\to\infty$ 时集合收敛于 $p_\theta(\mathbf x_0|\mathbf y)$。

```text
Algorithm 1: Twisted Diffusion Sampler (TDS)
1  for k = 1 : K
2      x_T^k ~ p(x_T), w_k ← p̃_T^k = p̃_θ(y | x_T^k)          // 初始提议与权重
3  for t = T − 1, ···, 0
4      {x_{t+1}^k, p̃_{t+1}^k}_{k=1}^K ~ Multinomial({x_{t+1}^k, p̃_{t+1}^k}_{k=1}^K; {w_k}_{k=1}^K)   // 重采样
5      for k = 1 : K
6          s̃_k = (x̂_θ(x_{t+1}^k) − x_{t+1}^k)/(tσ²) + ∇_{x_{t+1}^k} log p̃_{t+1}^k   // 条件分数近似
7          x_t^k ~ p̃_θ(· | x_{t+1}^k, y) := N(x_{t+1}^k + σ² s̃_k, σ̃²)               // 提议
8          p̃_t^k ← p̃_θ(y | x_t^k)                                                  // 扭曲函数（式 (8)(13)(14)）
9          w_k ← p_θ(x_t^k | x_{t+1}^k) p̃_t^k / [p̃_θ(x_t^k | x_{t+1}^k, y) p̃_{t+1}^k]   // 权重
```

### 3.3 用于修复与附加自由度的 TDS

上面引入的扭曲函数 $\tilde p_\theta(\mathbf y|\mathbf x_t):=p_{y|x_0}(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t))$ 是一种方便选项，但仅在 $p_{y|x_0}(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t))$ 可微且严格为正时才合理。下面说明替代扭曲函数如何给出处理修复问题与更灵活条件设定的提议与加权函数。在这些扩展中算法 1 仍适用，只是扭曲函数定义不同。附录 A 给出更多细节，包括 TDS 对保持方差扩散模型 [18] 的适配。

**修复。** 考虑 $\mathbf x_0$ 可分割为观测维度 $M$ 与未观测维度 $\bar M$，即 $\mathbf x_0=[\mathbf x_{0,M},\mathbf x_{0,\bar M}]$，令 $\mathbf y=\mathbf x_{0,M}$ 并取 $p_{y|x_0}(\mathbf y|\mathbf x_0)=\delta_{\mathbf y}(\mathbf x_{0,M})$。目标即采样 $p_\theta(\mathbf x_0|\mathbf x_{0,M}=\mathbf y)=p_\theta(\mathbf x_{0,\bar M}|\mathbf x_{0,M})\delta_{\mathbf y}(\mathbf x_{0,M})$。这里对每个 $t>0$ 定义扭曲函数

$$
\tilde p_\theta(\mathbf y|\mathbf x_t,M):=\mathcal N\left(\mathbf y;\hat{\mathbf x}_\theta(\mathbf x_t)_M,t\sigma^2\right),\tag{13}
$$

并按式（9）与（11）设定扭曲提议与权重。式（13）的方差出于简单选为 $t\sigma^2=\mathrm{Var}_{p_\theta}[\mathbf x_t|\mathbf x_0]$；一般地，选择更贴近 $\mathrm{Var}_{p_\theta}[\mathbf y|\mathbf x_t]$ 的方差可能更优。对 $t=0$，以小的正方差类似地定义扭曲函数，如 $\tilde p_\theta(\mathbf y|\mathbf x_0)=\mathcal N(\mathbf y;\mathbf x_{0,M},\sigma^2)$。这一简化选择会略微改变最终目标；也可选择能保持渐近精确性的最终扭曲函数、提议与权重（见附录 A.4）。

**带自由度的修复。** 接下来考虑希望以某些观测维度为条件、但存在附加自由度的情形。例如 protein design 的 motif-scaffolding 中，我们希望以出现在蛋白质结构**任意位置**的功能 motif $\mathbf y$ 为条件，而非预设一组指标 $M$。为处理该情形，我们 (i) 令 $\mathcal M$ 为可能观测维度的集合；(ii) 以随机性表达"哪些维度被观测"的不确定性——对每个 $M\in\mathcal M$ 放置均匀先验 $p(M)=1/|\mathcal M|$；(iii) 把该新变量再次嵌入联合模型，以定义自由度似然 $p(\mathbf y|\mathbf x_0)=\sum_{M\in\mathcal M}p_\theta(M,\mathbf y|\mathbf x_0)=|\mathcal M|^{-1}\sum_{M\in\mathcal M}p(\mathbf y|\mathbf x_0,M)$。据此我们用扭曲函数

$$
\tilde p_\theta(\mathbf y|\mathbf x_t):=|\mathcal M|^{-1}\sum_{M\in\mathcal M}\tilde p_\theta(\mathbf y|\mathbf x_t,M)\tag{14}
$$

近似 $p_\theta(\mathbf y|\mathbf x_t)$，其中每个 $\tilde p_\theta(\mathbf y|\mathbf x_t,M)$ 按式（13）定义。注意当 $|\mathcal M|=1$ 时式（13）与（14）一致。式（14）的求和可高效计算，因为每一项都只通过同一个去噪估计 $\hat{\mathbf x}_\theta(\mathbf x_t)$ 依赖 $\mathbf x_t$，而后者只需计算一次；由于 $\hat{\mathbf x}_\theta(\mathbf x_t)$ 的计算是昂贵步骤，即便 $|\mathcal M|$ 很大，总运行时间也不会显著增加。

### 3.4 黎曼流形上的 TDS

TDS 只需少量修改即可扩展到黎曼扩散模型。黎曼扩散模型 [8] 的结构与欧氏情形类似，但条件分布由以分数近似参数化、随后做流形投影的**切空间正态（tangent normal）**分布定义（如 [4, 8]）。当假定模型（如 [39] 中那样）关联一个去噪网络 $\hat{\mathbf x}_\theta$ 时，扭曲函数也可类似地构造。对由似然定义的条件任务，式（8）的 $\tilde p_\theta(\mathbf y|\mathbf x_t)$ 适用。对修复（及推广的自由度情形），我们提出

$$
\tilde p_\theta(\mathbf y|\mathbf x_t)=\mathcal T\mathcal N_{\hat{\mathbf x}_\theta(\mathbf x_t)_M}\left(\mathbf y;\mathbf 0,t\sigma^2\right),\tag{15}
$$

其中 $\mathcal T\mathcal N_{\hat{\mathbf x}_\theta(\mathbf x_t)_M}(\mathbf 0,t\sigma^2)$ 为以 $\hat{\mathbf x}_\theta(\mathbf x_t)_M$ 为中心的切空间正态分布。与欧氏情形一样，$\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)$ 通过条件分数近似 $\mathbf s_\theta(\mathbf x_t,\mathbf y)=\mathbf s_\theta(\mathbf x_t)+\nabla_{\mathbf x_t}\log\tilde p(\mathbf y|\mathbf x_t)$ 定义，可由自动微分计算。细节见附录 B。

## 4 相关工作

近期有大量关于扩散模型条件生成的工作。这些先前工作要么需要任务特定的条件训练，要么涉及未经充分检验的近似，实践中可能性能不佳。更多相关工作见附录 C。

**梯度引导。** 我们用"梯度引导"泛指通过穿过神经网络 $\hat{\mathbf x}_\theta(\mathbf x_t)$ 的梯度纳入条件信息的一般方法。例如在修复设定中，Ho 等 [19] 提出用高斯近似 $\mathcal N(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t)_M,\alpha)$ 逼近 $p_\theta(\mathbf y|\mathbf x_t)$，由此得到如式（9）的修正转移分布，其条件分数近似为 $\mathbf s_\theta(\mathbf x_t,\mathbf y)=\mathbf s_\theta(\mathbf x_t)-\nabla_{\mathbf x_t}\|\mathbf y-\hat{\mathbf x}_\theta(\mathbf x_t)_M\|^2/\alpha$。当仅使用单粒子时，该方法与应用于修复任务的 TDS **完全一致**。类似的高斯近似也被 [6, 32] 用于其他逆问题。梯度引导也可使用非高斯近似，例如对给定似然 $p_{y|x_0}(\mathbf y|\mathbf x_0)$ 用 $p_{y|x_0}(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t))\approx p_\theta(\mathbf y|\mathbf x_t)$——该选择同样退化为单粒子的 TDS。经验上这些启发式可能性能不可靠，例如在图像修复问题中 [40]。相比之下，TDS 通过在提议中使用梯度引导而享有其优点，同时提供通过模拟更多粒子消除近似误差的机制。

**替换方法。** 替换方法 [33] 是仅用无条件扩散模型进行图像修复的方法，其思想是把中间样本 $\mathbf x_t$ 的观测维度 $\mathbf x_{t,M}$ 替换为观测 $\mathbf x_{0,M}$ 的含噪版本；但它是启发式近似，可能导致修复区域与观测区域不一致 [23]。此外替换方法只适用于修复问题：尽管近期工作把替换方法扩展到线性逆问题 [如 22]，但该方法没有精度保证，且不清楚如何扩展到任意可微似然。

**扩散模型的 SMC 采样器。** 与本文最接近的是 **SMC-Diff** [34]，它用 SMC 为修复问题提供渐近精确的条件样本。然而该先前工作 (i) 局限于修复情形；(ii) 仅在"学习到的扩散模型恰好匹配前向加噪过程"（实践中极少满足）的假设下提供渐近保证；此外 SMC-Diff 未利用扭曲函数。在并行工作中，Cardoso 等 [2] 提出 **MCGdiff**，一种使用辅助粒子滤波 [26] 框架提供渐近精确条件推断的替代 SMC 算法；与 TDS 相比，MCGdiff 避免计算去噪网络梯度，但仅适用于线性逆问题（修复为其特例）。

## 5 模拟研究与条件图像生成

我们首先在具有可处理精确条件分布的合成设定中检验 TDS 精度对粒子数的依赖（§5.1）；§5.2 在类别条件图像生成上把 TDS 与替代方法比较，图像修复实验见附录 D.2.2。全部细节见附录 D。

我们的评估包括：(1) TDS；(2) TDS-IS，使用 TDS 提议的重要性采样器；(3) IS，§3.1 描述的朴素重要性采样器；(4) 梯度引导。对修复类问题还额外包括：(5) 替换方法；(6) SMC-Diff。每个 SMC 采样器以 $K$ 个加权粒子 $(\sum_{k'}w_{k'})^{-1}\sum_kw_k\delta_{\mathbf x_0^k}$ 构成对 $p_\theta(\mathbf x_0|\mathbf y)$ 的近似；梯度引导与替换方法被视为类似的基于粒子的近似，其 $K$ 个独立样本视为权重均匀的 $K$ 个粒子。

**计算代价。** 与无条件生成相比，TDS 的计算代价 (i) 因计算条件分数近似时需对去噪网络反向传播而大一个常数因子；(ii) 与粒子数成线性关系。因此若要求高精度推断，推断代价可能相当大。相比之下，条件训练方法通过**摊销**（amortization）[13] 提供快速推断——大部分计算提前完成。因此对采样时计算量是首要关切的应用，条件训练方法可能更可取；另一方面，当似然准则易于获得（如通过干净数据上已有的分类器）而训练摊销模型存在困难时（如摊销训练所需的标注数据、神经网络工程经验与前期计算资源可能难以负担），TDS 可能更可取。

### 5.1 TDS 在二维模拟中的适用性与精度

本节探讨两个问题：(i) TDS 与其他方法能处理何种条件信息；(ii) TDS 的精度如何随粒子数变化。为此我们首先考虑一个对**二元高斯**的无条件扩散模型 $p_\theta(\mathbf x_0)$ 近似。该选择下前向过程的边缘分布也是高斯，故可解析定义可处理的分数函数 $p_\theta(\mathbf x_{0:T})$，无需神经网络近似；于是可在不受分数网络近似误差影响的情况下分析性能。二维扩散还允许用数值积分紧密逼近精确条件分布，作为真值。

我们考虑定义条件信息的三个测试用例：(1) **光滑似然**：$\mathbf y$ 是 $\mathbf x$ 欧氏范数的观测，带 Laplace 噪声，$p_\theta(\mathbf y|\mathbf x_0)=\exp\{|\|\mathbf x_0\|_2-\mathbf y|\}/2$，该似然几乎处处光滑¹；(2) **修复**：$\mathbf y$ 是 $\mathbf x_0$ 第一维的观测，$p_\theta(\mathbf y|\mathbf x_0,M=0)=\delta_{\mathbf y}(\mathbf x_{0,0})$；(3) **带自由度的修复**：$\mathbf y$ 是 $\mathbf x_0$ 第一或第二维的观测，$\mathcal M=\{0,1\}$，$p_\theta(\mathbf y|\mathbf x_0)=\frac12[\delta_{\mathbf y}(\mathbf x_{0,0})+\delta_{\mathbf y}(\mathbf x_{0,1})]$。所有情形都固定 $\mathbf y=0$，并考虑估计 $\mathbb E_{p_\theta}[\mathbf x_0|\mathbf y]$。

> **脚注 1（原文）：** 该似然除点 $\mathbf x=(0,0)$ 外光滑。

图 1 报告所需条件分布均值的估计误差，即 $\|\sum_kw_k\mathbf x_0^k-\mathbb E_q[\mathbf x_0|\mathbf y]\|_2$。TDS 提供计算—统计折中：使用更多粒子以 $O(1/K)$ 参数速率降低均方估计误差（注意 log-log 坐标下斜率为 $-1$），这符合标准 SMC 理论 [5, 第 11 章] 的预期。该收敛速率在光滑似然情形由 TDS、TDS-IS 与 IS 共享，在修复情形由 TDS 与 SMC-Diff 共享；然而 TDS-IS、IS 与 SMC-Diff 只分别适用于这些情形，而 TDS 适用于全部情形。唯一同样适用于三种设定的其他方法是梯度引导，但它呈现显著估计误差，且不随粒子数增加而改善。

**图 1：** 条件均值估计误差，含 2 倍标准误误差棒、对 25 次重复平均。TDS 适用于全部三个任务，且粒子越多精度越高。（来源：原文第 7 页。）

### 5.2 类别条件图像生成

接下来研究 TDS 在分数函数带神经网络近似时的性能，特别是**类别条件图像生成**任务：从 $p_\theta(\mathbf x_0|\mathbf y)\propto p_\theta(\mathbf x_0)p_{y|x_0}(\mathbf y|\mathbf x_0)$ 采样图像，其中 $p_\theta(\cdot)$ 为预训练图像扩散模型，$\mathbf y$ 为给定图像类别，$p_{y|x_0}(\mathbf y|\cdot)$ 为分类似然。为评估生成忠实度，我们用在指定似然的同一分类器对条件样本 $\mathbf x_0$ 的预测做分类准确率评估。所有实验遵循标准做法，在最终样本返回去噪均值 [18]。

在 MNIST 数据集上，我们把 TDS 与 TDS-IS、梯度引导、IS 比较。图 2a 比较给定类别 $y=7$ 时 TDS 与梯度引导的条件样本：梯度引导样本有明显伪影，多数不像数字 7；相比之下 TDS 生成真实且正确的数字。图 2b 给出粒子数 $K$ 影响的消融：对所有 SMC 采样器，更多粒子提升分类准确率，$K=64$ 时接近完美；梯度引导的性能（期望意义下）不随 $K$ 变化。值得注意的是，固定 $K$ 时 TDS 与 TDS-IS 性能相当，且优于梯度引导与 IS。我们随后把 TDS 用于更高维数据集：图 2c 给出在 ImageNet 数据集（$256\times256\times3$ 维）上用预训练扩散模型与预训练分类器的 TDS（$K=16$）样本，这些样本定性良好并捕捉到类别标签。附录 D.2.3 提供更多样本、与分类器引导 [9] 的比较以及 CIFAR-10 结果。

TDS 还可通过以**扭曲尺度（twist scale）**对扭曲函数取幂来扩展；该扩展与把对数分类概率梯度重新缩放的分类器引导文献相关，细节与消融见附录 D.2.1。

**图 2：** 图像类别条件生成任务。(a) MNIST：给定类别 "7" 的 TDS（$K=64$）与梯度引导样本（TDS 样本从单次 SMC 运行的 64 个粒子中随机选取）；(b) MNIST：分类准确率随 $K$ 的变化（1000 次运行平均，误差棒为 2 倍标准误）；(c) ImageNet：给定类别 "brambling" 的 TDS（$K=16$）样本（来自 4 次独立 SMC 运行）。（来源：原文第 9 页。）

## 6 计算蛋白质设计案例研究：motif-scaffolding 问题

蛋白质的生化功能通常由称为 **motif** 的少数原子赋予，而这些原子由整体蛋白质结构（称为 **scaffold**，支架）稳定 [36]。蛋白质设计中的一个核心任务是针对预期赋予功能的 motif 找出稳定支架。本节描述 TDS 在该任务上的应用，并把 TDS 与最先进的条件训练模型 **RFdiffusion** 比较，更多细节见附录 E。

给定支撑于可设计蛋白质结构的生成模型 $p_\theta(\mathbf x_0)$，可通过求解条件生成建模问题 [34] 构造合适支架：先把完整结构分割为 motif $\mathbf x_{0,M}$ 与支架 $\mathbf x_{0,\bar M}$（即 $\mathbf x_0=[\mathbf x_{0,M},\mathbf x_{0,\bar M}]$），再通过（近似）从 $p_\theta(\mathbf x_{0,\bar M}|\mathbf x_{0,M})$ 采样识别可能的兼容支架 [34]。

尽管 motif-scaffolding 的条件生成建模方法已为某些 motif 产生功能上经实验验证的结构 [37]，该问题整体仍未解决。此外，当前 motif-scaffolding 方法要求指定 motif 在完整支架一级序列中的位置，该选择可能需要专家知识与反复试错。我们假设通过精确条件采样可改进 motif-scaffolding，为此把 TDS 应用于 **FrameDiff**——一个把蛋白质骨架参数化为流形 $SE(3)^N$ 中 $N$ 个刚体（残基）集合的黎曼扩散模型 [39]²。$SE(3)$ 的每个元素由一个旋转矩阵与一个平移构成，参数化每个残基骨架原子的位置。

> **脚注 2（原文）：** https://github.com/jasonkyuyim/se3_diffusion

**似然、扭曲与自由度。** 我们对 motif-scaffolding 的方法与 §3.3 的修复情形类似：令 $p_{y|x_0}(\mathbf y|\mathbf x_0)=\delta_{\mathbf y}(\mathbf x_{0,M})$，其中 $\mathbf y\in SE(3)^M$ 描述 $M=|M|$ 个残基 motif 的骨架原子坐标。因此定义扭曲函数时采用 §3.4 的黎曼 TDS 表述。为消除"motif 在支架中的位置需预先指定"的要求，我们把 motif 位置作为自由度纳入：(i) 把 motif 在链中的索引视为掩码 $M$；(ii) 令 $\mathcal M$ 为长度等于 motif 长度的可能掩码集合；(iii) 应用式（14）在这些可能掩码上取平均。

对某些 scaffolding 问题，已知所有 motif 残基必须以连续索引出现；此时取 $\mathcal M$ 为全部可能的连续掩码。然而当 motif 残基只知出现在两个或更多可能不连续的块中时，可能放置数会过大，此时我们从至多某个最大掩码数（# Motif Locs.）中随机采样掩码。我们同样把 motif 的全局平移与旋转作为自由度消除——动机是：限制到 motif 的单一可能位姿会使条件分布变窄，从而增加推断难度。对平移，我们使用对 motif 质心与最终支架中位置不变的对数似然，即取 $p_{y|x_0}(\mathbf y|\mathbf x)=\delta_{P\mathbf y}(P\mathbf x_M)$，其中 $P$ 为去除向量质心的投影矩阵 [如 39, §3.3]；对旋转，我们在若干可能旋转（# Motif Rots.）上对似然取平均。

**消融研究。** 我们首先在 in silico 自一致性评估 [34] 中考察 TDS 若干参数对成功率的影响。从基准集 [37] 中的单个问题（5IUS）出发，再测试完整集合。图 3a（左）表明成功率随粒子数单调上升：该设定下要获得非零成功率需计入多个 motif 位置（图 3a 左使用 1,000 个可能 motif 位置与 100 个旋转）。我们通过评估 TDS（$K=1$）在增加 motif 位置（100 个旋转）与增加旋转（1,000 个位置）下的成功率，检验自由度的影响（图 3a 中左、中右）：不计任一自由度时成功率为 0%，且成功率随位置数与旋转数增大而上升。我们还探索了图像任务（§5.2）中考虑的**启发式扭曲尺度**——此处扭曲尺度是对扭曲函数对数的乘性因子；图 3a（右）表明该测试用例上更大扭曲尺度给出更高成功率（使用 8 个粒子、1,000 个可能 motif 位置与 100 个旋转），但该趋势并非对所有问题单调成立（图 P）。

**完整基准上的评估。** 随后我们在 24 个 motif-scaffolding 问题组成的基准集 [37] 上评估 TDS，并与先前最先进方法 RFdiffusion 比较。RFdiffusion 与 FrameDiff 使用相同的蛋白质骨架刚体表示。TDS 以 $K=8$、扭曲尺度 2、100 个旋转与 1,000 个 motif 位置自由度运行（共 100,000 种组合）。总体而言，TDS（应用于 FrameDiff）与 RFdiffusion 性能相当（图 3b）：两者各在 24 个问题中的 11 个上取得更高成功率，且两个方法在两个问题上成功率均为 0%（完整结果见图 O）。这一性能是在 FrameDiff 不同于 RFdiffusion、并未被训练执行 motif-scaffolding 的情况下取得的。两方法各自表现更好的问题划分主要由**总支架长度**解释——TDS 在较小支架上取得更高成功率。我们怀疑这种随支架长度的性能变化源于底层扩散模型的性质：第一，RFdiffusion 无条件生成的长骨架比 FrameDiff 生成的可设计频率更高 [39]；第二，与 RFdiffusion 不同，FrameDiff 无法以固定 motif 序列为条件。

**图 3：** 蛋白质 motif-scaffolding 案例研究结果。(a) TDS motif-scaffolding 成功率（测试用例 5IUS）随粒子数、自由度与扭曲尺度的变化而提升；(b) 成功率更高的问题数（支架长度 <100 残基：FrameDiff 9 vs RFdiffusion 3；≥100 残基：2 vs 8；合计：11 vs 11）。（来源：原文第 10 页。）

## 7 讨论与结论（原文标题 Discussion）

我们提出 **TDS**——一种用于扩散模型的实用且渐近精确的条件采样算法。我们把 TDS 与其他方法比较，并在图像类别条件生成与修复任务上展示其有效性与灵活性；在短支架的蛋白质 motif-scaffolding 问题上，TDS 优于当前（条件训练的）最先进方法。

TDS 的一个局限是需要额外计算来模拟多个粒子。虽然在某些情形下仅用两个粒子即观察到性能改进，但最优粒子数取决于问题；此外计算效率取决于扭曲函数逼近精确条件分布的程度，而这又取决于无条件模型与条件信息。最后，为一般性约束选择扭曲函数可能具有挑战性。未来工作将聚焦于解决这些局限并提升计算效率。

**致谢。** 作者感谢 Hai-Dang Dau、Arnaud Doucet、Joe Watson 与 David Juergens 的有益讨论，感谢 Jason Yim 的讨论与代码，以及 David Baker 的额外指导。

## 参考文献（英文原书目）

[1] Arpit Bansal, Hong-Min Chu, Avi Schwarzschild, Soumyadip Sengupta, Micah Goldblum, Jonas Geiping, and Tom Goldstein. Universal guidance for diffusion models. arXiv preprint arXiv:2302.07121, 2023.
[2] Gabriel Cardoso, Yazid Janati El Idrissi, Sylvain Le Corff, and Eric Moulines. Monte Carlo guided diffusion for Bayesian linear inverse problems. arXiv preprint arXiv:2308.07983, 2023.
[3] Sourav Chatterjee and Persi Diaconis. The sample size required in importance sampling. The Annals of Applied Probability, 2018.
[4] Gregory Chirikjian and Marin Kobilarov. Gaussian approximation of non-linear measurement models on Lie groups. In 53rd IEEE Conference on Decision and Control. IEEE, 2014.
[5] Nicolas Chopin and Omiros Papaspiliopoulos. An introduction to sequential Monte Carlo. Springer, 2020.
[6] Hyungjin Chung, Jeongsol Kim, Michael T Mccann, Marc L Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In International Conference on Learning Representations, 2023.
[7] Justas Dauparas, Ivan Anishchenko, Nathaniel Bennett, Hua Bai, Robert J Ragotte, Lukas F Milles, Basile IM Wicky, Alexis Courbet, Rob J de Haas, Neville Bethel, Philip J Leung, Timothy Huddy, Sam Pellock, Doug Tischer, F Chan, Brian Koepnick, H Nguyen, Alex Kang, B Sankaran, Asim K. Bera, Neil P. King, and David Baker. Robust deep learning-based protein sequence design using ProteinMPNN. Science, 2022.
[8] Valentin De Bortoli, Emile Mathieu, Michael John Hutchinson, James Thornton, Yee Whye Teh, and Arnaud Doucet. Riemannian score-based generative modelling. In Advances in Neural Information Processing Systems, 2022.
[9] Prafulla Dhariwal and Alexander Nichol. Diffusion models beat GANs on image synthesis. Advances in Neural Information Processing Systems, 2021.
[10] Arnaud Doucet, Nando De Freitas, and Neil James Gordon. Sequential Monte Carlo methods in practice. Springer, 2001.
[11] Yilun Du, Conor Durkan, Robin Strudel, Joshua B Tenenbaum, Sander Dieleman, Rob Fergus, Jascha Sohl-Dickstein, Arnaud Doucet, and Will Grathwohl. Reduce, reuse, recycle: Compositional generation with energy-based diffusion models and MCMC. In International Conference on Machine Learning, 2023.
[12] Bradley Efron. Tweedie's formula and selection bias. Journal of the American Statistical Association, 2011.
[13] Samuel Gershman and Noah Goodman. Amortized inference in probabilistic reasoning. In Proceedings of the Annual Meeting of the Cognitive Science Society, 2014.
[14] Neil J Gordon, David J Salmond, and Adrian FM Smith. Novel approach to nonlinear/non-Gaussian Bayesian state estimation. In IEE Proceedings F (Radar and Signal Processing). IET, 1993.
[15] Pieralberto Guarniero, Adam M Johansen, and Anthony Lee. The iterated auxiliary particle filter. Journal of the American Statistical Association, 2017.
[16] Jeremy Heng, Adrian N Bishop, George Deligiannidis, and Arnaud Doucet. Controlled sequential Monte Carlo. Annals of Statistics, 2020.
[17] Jonathan Ho and Tim Salimans. Classifier-free diffusion guidance. arXiv preprint arXiv:2207.12598, 2022.
[18] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems, 2020.
[19] Jonathan Ho, Tim Salimans, Alexey A Gritsenko, William Chan, Mohammad Norouzi, and David J Fleet. Video diffusion models. In Advances in Neural Information Processing Systems, 2022.
[20] John M. Jumper, Richard Evans, Alexander Pritzel, Tim Green, Michael Figurnov, Olaf Ronneberger, Kathryn Tunyasuvunakool, Russ Bates, Augustin Zídek, Anna Potapenko, Alex Bridgland, Clemens Meyer, Simon A A Kohl, Andy Ballard, Andrew Cowie, Bernardino Romera-Paredes, Stanislav Nikolov, Rishub Jain, Jonas Adler, Trevor Back, Stig Petersen, David A. Reiman, Ellen Clancy, Michal Zielinski, Martin Steinegger, Michalina Pacholska, Tamas Berghammer, Sebastian Bodenstein, David Silver, Oriol Vinyals, Andrew W. Senior, Koray Kavukcuoglu, Pushmeet Kohli, and Demis Hassabis. Highly accurate protein structure prediction with AlphaFold. Nature, 2021.
[21] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. In Advances in Neural Information Processing Systems, 2022.
[22] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. In Advances in Neural Information Processing Systems, 2022.
[23] Andreas Lugmayr, Martin Danelljan, Andres Romero, Fisher Yu, Radu Timofte, and Luc Van Gool. Repaint: Inpainting using denoising diffusion probabilistic models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2022.
[24] Chenlin Meng, Yutong He, Yang Song, Jiaming Song, Jiajun Wu, Jun-Yan Zhu, and Stefano Ermon. SDEdit: Guided image synthesis and editing with stochastic differential equations. In International Conference on Learning Representations, 2021.
[25] Christian A Naesseth, Fredrik Lindsten, and Thomas B Schön. Elements of sequential Monte Carlo. Foundations and Trends in Machine Learning, 2019.
[26] Michael K Pitt and Neil Shephard. Filtering via simulation: Auxiliary particle filters. Journal of the American Statistical Association, 1999.
[27] Aditya Ramesh, Prafulla Dhariwal, Alex Nichol, Casey Chu, and Mark Chen. Hierarchical text-conditional image generation with CLIP latents. arXiv preprint arXiv:2204.06125, 2022.
[28] Herbert Robbins. An empirical Bayes approach to statistics. In 3rd Berkeley Symposium on Mathematical Statistics, 1956.
[29] Chitwan Saharia, William Chan, Huiwen Chang, Chris Lee, Jonathan Ho, Tim Salimans, David Fleet, and Mohammad Norouzi. Palette: Image-to-image diffusion models. In ACM SIGGRAPH 2022 Conference Proceedings, 2022.
[30] Chitwan Saharia, Jonathan Ho, William Chan, Tim Salimans, David J Fleet, and Mohammad Norouzi. Image super-resolution via iterative refinement. IEEE Transactions on Pattern Analysis and Machine Intelligence, 2022.
[31] Yuyang Shi, Valentin De Bortoli, George Deligiannidis, and Arnaud Doucet. Conditional simulation using diffusion Schrödinger bridges. In Uncertainty in Artificial Intelligence, 2022.
[32] Jiaming Song, Arash Vahdat, Morteza Mardani, and Jan Kautz. Pseudoinverse-guided diffusion models for inverse problems. In International Conference on Learning Representations, 2023.
[33] Yang Song, Jascha Sohl-Dickstein, Diederik P Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. Score-based generative modeling through stochastic differential equations. In International Conference on Learning Representations, 2020.
[34] Brian L Trippe, Jason Yim, Doug Tischer, Tamara Broderick, David Baker, Regina Barzilay, and Tommi Jaakkola. Diffusion probabilistic modeling of protein backbones in 3D for the motif-scaffolding problem. In International Conference on Learning Representations, 2023.
[35] Pascal Vincent. A connection between score matching and denoising autoencoders. Neural Computation, 2011.
[36] Jue Wang, Sidney Lisanza, David Juergens, Doug Tischer, Joseph L Watson, Karla M Castro, Robert Ragotte, Amijai Saragovi, Lukas F Milles, Minkyung Baek, Ivan Anishchenko, Wei Yang, Derrick R Hicks, Marc Exposit, Thomas Schlichthaerle, Jung-Ho Chun, Nathaniel Dauparas, Justas Bennett, Basile I M Wicky, Andrew Muenks, Frank DiMaio, Bruno Correia, Sergey Ovchinnikov, and David Baker. Scaffolding protein functional sites using deep learning. Science, 2022.
[37] Joseph L. Watson, David Juergens, Nathaniel R. Bennett, Brian L. Trippe, Jason Yim, Helen E. Eisenach, Woody Ahern, Andrew J. Borst, Robert J. Ragotte, Lukas F. Milles, Basile I. M. Wicky, Nikita Hanikel, Samuel J. Pellock, Alexis Courbet, William Sheffler, Jue Wang, Preetham Venkatesh, Isaac Sappington, Susana Vázquez Torres, Anna Lauko, Valentin De Bortoli, Emile Mathieu, Sergey Ovchinnikov, Regina Barzilay, Tommi S. Jaakkola, Frank DiMaio, Minkyung Baek, and David Baker. De novo design of protein structure and function with RFdiffusion. Nature, 2023.
[38] Nick Whiteley and Anthony Lee. Twisted particle filters. The Annals of Statistics, 2014.
[39] Jason Yim, Brian L Trippe, Valentin De Bortoli, Emile Mathieu, Arnaud Doucet, Regina Barzilay, and Tommi Jaakkola. SE(3) diffusion model with application to protein backbone generation. In International Conference on Machine Learning, 2023.
[40] Guanhua Zhang, Jiabao Ji, Yang Zhang, Mo Yu, Tommi Jaakkola, and Shiyu Chang. Towards coherent image inpainting using denoising diffusion implicit models. In International Conference on Machine Learning, 2023.

## 附录 A TDS 附加细节

本节给出 TDS 的附加细节。附录 A.1 描述其对其他常见扩散模型表述的推广；A.2 描述提议方差与重采样策略的选择；A.3 给出式（12）的推导；A.4 描述修复与带自由度修复应用中 TDS 最后一步的修改；A.5 给出定理 1 的完整陈述与证明。

### A.1 噪声方差非常数且保持方差缩放的扩散模型

§3 开发的 TDS 假设每个时间步加入方差恒为 $\sigma^2$ 的噪声，该选择对应"方差爆炸（VE）"扩散模型 [33] 的特定离散化。这里描述 TDS 对非常数方差调度与保持方差（VP）扩散模型 [18] 的推广。我们在实验中采用 VP 表述；尽管它引入额外记号，但已知在实践中效果良好 [33]。

**用于方差爆炸扩散模型的 TDS 算法。** VE 扩散模型把前向过程 $q$ 定义为

$$
q(\mathbf x_{1:T}|\mathbf x_0):=\prod_{t=1}^{T}q(\mathbf x_t|\mathbf x_{t-1}),\qquad q(\mathbf x_t|\mathbf x_{t-1}):=\mathcal N(\mathbf x_t;\mathbf x_{t-1},\sigma_t^2),\tag{16}
$$

其中 $\sigma_t^2$ 为递增方差序列，使 $q(\mathbf x_T)\approx\mathcal N(\mathbf 0,\bar\sigma_T^2)$，$\bar\sigma_t^2:=\sum_{t'=1}^{t}\sigma_{t'}^2$（$t=1,\ldots,T$）。于是可设 $p(\mathbf x_T)=\mathcal N(\mathbf 0,\bar\sigma_T^2)$ 以匹配 $q(\mathbf x_T)$。注意式（16）蕴含 $q(\mathbf x_t|\mathbf x_0)=\mathcal N(\mathbf x_t;\mathbf x_0,\bar\sigma_t^2)$。反向扩散过程 $p_\theta$ 参数化为

$$
p_\theta(\mathbf x_{0:T}):=p(\mathbf x_T)\prod_{t=T}^{1}p_\theta(\mathbf x_{t-1}|\mathbf x_t),\qquad p_\theta(\mathbf x_{t-1}|\mathbf x_t):=\mathcal N(\mathbf x_{t-1};\mathbf x_t+\sigma_t^2\mathbf s_\theta(\mathbf x_t,t),\sigma_t^2),
$$

其中分数网络 $\mathbf s_\theta$ 通过去噪网络 $\hat{\mathbf x}_\theta$ 建模：$\mathbf s_\theta(\mathbf x_t,t):=(\hat{\mathbf x}_\theta(\mathbf x_t,t;\theta)-\mathbf x_t)/\bar\sigma_t^2$。注意常数调度 $\sigma_t^2=\sigma^2$、$\bar\sigma_t^2=t\sigma^2$ 为其特例。一般 VE 模型的 TDS 算法描述于算法 1，其中第 6 行的 $t\sigma^2$ 替换为 $\bar\sigma_t^2$、第 7 行的 $\sigma^2$ 替换为 $\sigma_t^2$。

**推广到保持方差扩散模型。** 另一广泛使用的框架是保持方差（VP）扩散模型 [18]。VP 模型把前向过程 $q$ 定义为

$$
q(\mathbf x_{1:T}|\mathbf x_0):=\prod_{t=1}^{T}q(\mathbf x_t|\mathbf x_{t-1}),\qquad q(\mathbf x_t|\mathbf x_{t-1}):=\mathcal N\left(\mathbf x_t;\sqrt{1-\sigma_t^2}\,\mathbf x_{t-1},\sigma_t^2\right),
$$

其中 $\sigma_t^2$ 为递增方差序列，使 $q(\mathbf x_T)\approx\mathcal N(\mathbf 0,1)$，于是可设 $p(\mathbf x_T)=\mathcal N(\mathbf 0,1)$。定义 $\alpha_t:=1-\sigma_t^2$、$\bar\alpha_t:=\prod_{t'=1}^{t}\alpha_{t'}$、$\bar\sigma_t^2:=1-\bar\alpha_t$，则式（16）的边缘条件为 $q(\mathbf x_t|\mathbf x_0)=\mathcal N(\mathbf x_t;\sqrt{\bar\alpha_t}\mathbf x_0,\bar\sigma_t^2)$。反向扩散过程 $p_\theta$ 参数化为

$$
p_\theta(\mathbf x_{0:T}):=p(\mathbf x_T)\prod_{t=T}^{1}p_\theta(\mathbf x_{t-1}|\mathbf x_t),\qquad p_\theta(\mathbf x_{t-1}|\mathbf x_t):=\mathcal N\left(\mathbf x_{t-1};\frac{1}{\sqrt{\alpha_t}}\mathbf x_t+\frac{\sigma_t^2}{\sqrt{\alpha_t}}\mathbf s_\theta(\mathbf x_t,t),\sigma_t^2\right),
$$

其中 $\mathbf s_\theta$ 现通过去噪器定义为 $\mathbf s_\theta(\mathbf x_t,t):=(\sqrt{\bar\alpha_t}\hat{\mathbf x}_\theta(\mathbf x_t,t;\theta)-\mathbf x_t)/\bar\sigma_t^2$。算法 1 的 TDS 同样可扩展到 VP 模型：第 6 行的条件分数近似改为 $\tilde{\mathbf s}_k\leftarrow(\sqrt{\bar\alpha_{t+1}}\hat{\mathbf x}_\theta(\mathbf x_{t+1}^k)-\mathbf x_{t+1}^k)/\bar\sigma_{t+1}^2+\nabla_{\mathbf x_{t+1}^k}\log\tilde p_{t+1}^k$，第 7 行的提议改为 $\mathbf x_t^k\sim\tilde p_\theta(\cdot|\mathbf x_{t+1}^k,\mathbf y):=\mathcal N\left(\frac{1}{\sqrt{\alpha_{t+1}}}\mathbf x_{t+1}^k+\frac{\sigma_{t+1}^2}{\sqrt{\alpha_{t+1}}}\tilde{\mathbf s}_k,\tilde\sigma^2\right)$。

### A.2 TDS 参数

**提议方差。** 算法 1 第 7 行的提议分布关联方差参数 $\tilde\sigma^2$；一般该参数可依时间步变化（即第 7 行以 $\tilde\sigma_{t+1}^2$ 替代 $\tilde\sigma^2$）。除另作说明，我们设 $\tilde\sigma_{t+1}^2:=\mathrm{Var}_{p_\theta}[\mathbf x_t|\mathbf x_{t+1}]$，即无条件扩散模型的方差（通常与分数网络一起训练学习）。

**重采样策略。** 算法 1 第 4 行的多项式重采样可替换为其他策略，综述见 [25, 第 2 章]。实验中我们使用系统重采样。此外可考虑设置有效样本量（ESS）阈值（0 与 1 之间），仅当 ESS 低于该阈值时触发重采样步；ESS 阈值常用于提升 SMC 算法效率 [如 25, §2.2.2]，但为简单起见，除另作说明我们使用每步都重采样的 TDS。

### A.3 式（12）的推导

式（12）说明扩展中间目标 $\nu_t(\mathbf x_{0:T})$ 如何提供对最终目标 $p_\theta(\mathbf x_{0:T}|\mathbf y)$ 逐步更精确的近似（随 $t\to0$）。把式（9）的提议分布与式（11）的权重代入式（4）并化简即得：

$$
\nu_t(\mathbf x_{0:T})\propto\left[p(\mathbf x_T)\prod_{t'=0}^{T-1}\tilde p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)\right]\left[\tilde p(\mathbf y|\mathbf x_T)\prod_{t'=t}^{T-1}\frac{p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1})\tilde p_\theta(\mathbf y|\mathbf x_{t'})}{\tilde p_\theta(\mathbf y|\mathbf x_{t'+1})\tilde p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)}\right]
$$

重排并约去 $p_\theta$ 与 $\tilde p_\theta$ 项：

$$
=\left[p(\mathbf x_T)\prod_{t'=t}^{T-1}p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1})\right]\left[\tilde p_\theta(\mathbf y|\mathbf x_t)\prod_{t'=0}^{t-1}\tilde p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)\right]
$$

按概率链式法则合并 $p_\theta$ 项：

$$
=p_\theta(\mathbf x_{t:T})\tilde p_\theta(\mathbf y|\mathbf x_t)\prod_{t'=0}^{t-1}\tilde p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)
$$

应用 Bayes 规则并注意 $p_\theta(\mathbf y|\mathbf x_{t:T})=p_\theta(\mathbf y|\mathbf x_t)$：

$$
\propto p_\theta(\mathbf x_{t:T}|\mathbf y)\frac{\tilde p_\theta(\mathbf y|\mathbf x_t)}{p(\mathbf y|\mathbf x_t)}\prod_{t'=0}^{t-1}\tilde p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)
$$

注意 $p_\theta(\mathbf x_{0:T}|\mathbf y)=p_\theta(\mathbf x_{t:T}|\mathbf y)\prod_{t'=0}^{t-1}p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)$：

$$
=p_\theta(\mathbf x_{0:T}|\mathbf y)\left[\frac{\tilde p_\theta(\mathbf y|\mathbf x_t)}{p(\mathbf y|\mathbf x_t)}\prod_{t'=0}^{t-1}\frac{\tilde p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)}{p_\theta(\mathbf x_{t'}|\mathbf x_{t'+1},\mathbf y)}\right].
$$

最后一行即式（12）所需表达式。

### A.4 修复与带自由度修复的最后一步（渐近精确目标）

§3.3 中修复与带自由度修复的最终（$t=0$）扭曲函数不满足定理 2 的假设 $\tilde p_\theta(\mathbf y|\mathbf x_0)=p_{y|x_0}(\mathbf y|\mathbf x_0)$，这一选择使 TDS 最终目标相对精确条件 $p_\theta(\mathbf x_{0:T}|\mathbf y)$ 引入误差。对修复，为保持渐近精确性，可把最终提议与权重取为

$$
\tilde p_\theta(\mathbf x_0|\mathbf x_1,\mathbf y;M):=\delta_{\mathbf y}(\mathbf x_{0,M})p_\theta(\mathbf x_{0,\bar M}|\mathbf x_1),\qquad w_0(\mathbf x_0,\mathbf x_1)=1.
$$

可验证所得最终目标按式（4）即 $p_\theta(\mathbf x_0|\mathbf x_{0,M}=\mathbf y)$。类似地，对带自由度修复，可定义最终提议与权重为

$$
\tilde p_\theta(\mathbf x_0|\mathbf x_1,\mathbf y,M):=\sum_{M\in\mathcal M}\frac{p_\theta(\mathbf x_{0,M}|\mathbf x_1,M)}{\sum_{M'\in\mathcal M}p_\theta(\mathbf x_{0,M'}|\mathbf x_1,M')}\delta_{\mathbf y}(\mathbf x_{0,M})p_\theta(\mathbf x_{0,\bar M}|\mathbf x_1),\qquad w_0(\mathbf x_0,\mathbf x_1)=1.
$$

### A.5 TDS 的渐近精度——附加细节与完整定理陈述

本节 (i) 刻画模型与扭曲函数的充分条件，使 TDS 在粒子数增加时给出任意精确的估计；(ii) 讨论 §3 引入的扭曲函数 $\tilde p_\theta(\mathbf y|\mathbf x_t)$ 在实践中何时满足这些条件。先给出 TDS 渐近精度的充分条件定理。

**定理 2：** 令 $p_\theta(\mathbf x_{0:T})$ 为由式（1）与（3）定义的扩散生成模型，其中 $p_\theta(\mathbf x_t|\mathbf x_{t+1})=\mathcal N\left(\mathbf x_t|\mathbf x_{t+1}+\sigma_{t+1}^2\mathbf s_\theta(\mathbf x_{t+1}),\sigma_{t+1}^2\mathbf I\right)$，方差为 $\sigma_1^2,\ldots,\sigma_T^2$。令 $\tilde p_\theta(\mathbf y|\mathbf x_t)$ 为扭曲函数，

$$
r_t(\mathbf x_t|\mathbf x_{t+1})=\mathcal N\left(\mathbf x_t|\mathbf x_{t+1}+\sigma_{t+1}^2\left[\mathbf s_\theta(\mathbf x_{t+1})+\nabla_{\mathbf x_{t+1}}\log\tilde p_\theta(\mathbf y|\mathbf x_{t+1})\right],\tilde\sigma_{t+1}^2\right)
$$

为 $t=0,\ldots,T-1$ 的提议分布，令 $P^K=\sum_{k=1}^{K}w_0^k\delta_{\mathbf x_0^k}$ 为算法 1 以 $K$ 个粒子返回的加权粒子 $\{(\mathbf x_0^k,w_0^k)\}_{k=1}^{K}$。假设 (a) 最终扭曲函数为似然，$\tilde p_\theta(\mathbf y|\mathbf x_0)=p_{y|x_0}(\mathbf y|\mathbf x_0)$；(b) 首个扭曲函数 $\tilde p_\theta(\mathbf y|\mathbf x_T)$ 与后续扭曲函数之比 $\tilde p_\theta(\mathbf y|\mathbf x_t)/\tilde p_\theta(\mathbf y|\mathbf x_{t+1})$ 为正且有界；(c) 每个 $t>0$ 的 $\log\tilde p_\theta(\mathbf y|\mathbf x_t)$ 连续且关于 $\mathbf x_t$ 的梯度有界；(d) 提议方差大于模型方差，即对每个 $t$ 有 $\tilde\sigma_t^2>\sigma_t^2$。则 $P^K$ 以概率一集合收敛于 $p_\theta(\mathbf x_0|\mathbf y)$，即对每个集合 $A$，$\lim_{K\to\infty}P^K(A)=\int_Ap_\theta(\mathbf x_0|\mathbf y)\,\mathrm d\mathbf x_0$。

定理 2 的假设在常见应用中易于满足：

- 假设 (a) 可通过构造满足：取 $\tilde p_\theta(\mathbf y|\mathbf x_0)=p_{y|x_0}(\mathbf y|\mathbf x_0)$，并定义 $\hat{\mathbf x}_\theta(\mathbf x_0,t=0)=\mathbf x_0$。
- 假设 (b) 在以下情形满足：(i) $p_{y|x_0}(\mathbf y|\mathbf x)$ 关于 $\mathbf x$ 光滑且处处为正；(ii) $\tilde p_\theta(\mathbf y|\mathbf x_t)=p_{y|x_0}(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t))$，其中 $\hat{\mathbf x}_\theta(\mathbf x_t)$ 取值于某紧致域。假设 (b) 的另一个充分条件是 $p_{y|x_0}(\mathbf y|\mathbf x)$ 正且有界远离零——例如当 $p_{y|x_0}(\mathbf y|\mathbf x)$ 为带正则拟合的分类器时成立。
- 假设 (c) 是最强的假设。例如当 (i) $\tilde p_\theta(\mathbf y|\mathbf x_t)=p_{y|x_0}(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t))$、(ii) $p_{y|x_0}(\mathbf y|\mathbf x)$ 与 $\hat{\mathbf x}_\theta(\mathbf x_t)$ 关于 $\mathbf x$ 与 $\mathbf x_t$ 光滑且梯度一致有界时成立。虽然 $\hat{\mathbf x}_\theta(\cdot,t)$ 的光滑性可由跳跃连接与正则化鼓励，但 $\hat{\mathbf x}_\theta(\cdot,t)$ 可能出现尖锐过渡，尤其在 $t$ 接近零时。
- 假设 (d)（提议方差满足 $\tilde\sigma_t^2>\sigma_t^2$）对结论成立很可能并不必要；但该假设允许在证明中使用现有 SMC 理论结果。实践中我们的实验使用 $\tilde\sigma_t^2=\sigma_t^2$，或者可通过把每个 $\tilde\sigma_t^2$ 膨胀任意小量 $\delta$ 来满足该假设，而不显著影响采样器行为。

**定理 2 的证明：** 定理 2 刻画 SMC 算法收敛的一组条件。下面用我们的记号重述该结果。

**定理 3（Chopin 与 Papaspiliopoulos [5]——命题 11.4）：** 令 $\{(\mathbf x_0^k,w_0^k)\}_{k=1}^{K}$ 为以 $K$ 个粒子、使用多项式重采样的 SMC 算法在最后一次迭代返回的粒子与权重。若每个加权函数 $w_t(\mathbf x_t,\mathbf x_{t+1})$ 为正且有界，则对每个有界、$\nu_0$-可测函数 $\phi(\mathbf x_t)$，

$$
\lim_{K\to\infty}\sum_{k=1}^{K}w_0^k\phi(\mathbf x_0^k)=\int\phi(\mathbf x_0)\nu_0(\mathbf x_0)\,\mathrm d\mathbf x_0
$$

以概率一成立。定理 3 的直接推论是离散测度 $\hat P^K=\sum_{k=1}^{K}w_0^k\delta_{\mathbf x_0^k}$ 的集合收敛：对任意 $\nu_0$-可测集 $A$ 取 $\phi(\mathbf x)=\mathbf 1[\mathbf x\in A]$ 即可看出。该定理在欧氏设定（每个 $\mathbf x_t^k\in\mathbb R^D$）与黎曼设定下均适用。下面证明定理 2。

**证明。** 为证明定理，我们说明 (i) $\mathbf x_0$ 边缘最终目标 $\nu_0$ 是 $p_\theta(\mathbf x_0|\mathbf y)$；(ii) $P^K$ 集合收敛于 $\nu_0$。先由式（4）操作 $\nu_0$ 得到 $p_\theta(\mathbf x_{0:T}|\mathbf y)$ 以证明 (i)。由式（4）有

$$
\nu_0(\mathbf x_{0:T})=\frac1{L_0}\left[r(\mathbf x_T)\prod_{t=0}^{T-1}r_t(\mathbf x_t|\mathbf x_{t+1})\right]\left[w_T(\mathbf x_T)\prod_{t=0}^{T-1}w_{t'}(\mathbf x_t,\mathbf x_{t+1})\right].
$$

代入式（11）的权重：

$$
=\frac1{L_0}\left[p(\mathbf x_T)\prod_{t=0}^{T-1}r_t(\mathbf x_t|\mathbf x_{t+1})\right]\left[\tilde p_\theta(\mathbf y|\mathbf x_T)\prod_{t=0}^{T-1}\frac{p_\theta(\mathbf x_t|\mathbf x_{t+1})\tilde p_\theta(\mathbf y|\mathbf x_t)}{\tilde p_\theta(\mathbf y|\mathbf x_{t+1})r_t(\mathbf x_t|\mathbf x_{t+1})}\right]
$$

重排 $p_\theta$ 与 $r_t$ 项并约去 $r_t$：

$$
=\frac1{L_0}\left[p(\mathbf x_T)\prod_{t=0}^{T-1}p_\theta(\mathbf x_t|\mathbf x_{t+1})\right]\left[\tilde p_\theta(\mathbf y|\mathbf x_T)\prod_{t=0}^{T-1}\frac{\tilde p_\theta(\mathbf y|\mathbf x_t)}{\tilde p_\theta(\mathbf y|\mathbf x_{t+1})}\right]
$$

合并 $p_\theta$ 项：

$$
=\frac1{L_0}p_\theta(\mathbf x_{0:T})\left[\prod_{t=0}^{T-1}\frac{\tilde p_\theta(\mathbf y|\mathbf x_t)}{\tilde p_\theta(\mathbf y|\mathbf x_{t+1})}\right]\tilde p_\theta(\mathbf y|\mathbf x_T)
$$

约去 $\tilde p_\theta$ 项：

$$
=\frac1{L_0}p_\theta(\mathbf x_{0:T})\tilde p_\theta(\mathbf y|\mathbf x_0)
$$

由假设 (a) 认识到 $\tilde p_\theta(\mathbf y|\mathbf x_0)=p_{y|x_0}(\mathbf y|\mathbf x_0)$ 并应用 Bayes 规则（$L_0=p_\theta(\mathbf y)$）：

$$
=p_\theta(\mathbf x_{0:T}|\mathbf y).
$$

最后一行表明，一旦对 $\mathbf x_{1:T}$ 边缘化，即得所需 $\nu_0(\mathbf x_0)=p(\mathbf x_0|\mathbf y)$。接下来通过应用定理 3 证明 $P^K$ 以概率一收敛于 $\nu_0$。要应用定理 3，只需说明每一步的权重有上界（它们由概率（之比）定义，故为正）。由于步数 $T$ 有限，只需说明每个 $w_t$ 有界。初始权重为初始扭曲函数 $w_T(\mathbf x_T)=\tilde p_\theta(\mathbf y|\mathbf x_T)$，由假设 (b) 有界。下面处理中间权重。为说明后续步骤的加权函数有界，分解对数加权函数：

$$
\log w_t(\mathbf x_t,\mathbf x_{t+1})=\log\frac{\tilde p_\theta(\mathbf y|\mathbf x_t)}{\tilde p_\theta(\mathbf y|\mathbf x_{t+1})}+\log\frac{p_\theta(\mathbf x_t|\mathbf x_{t+1})}{r_t(\mathbf x_t|\mathbf x_{t+1})},
$$

并分别说明 $\log\tilde p_\theta(\mathbf y|\mathbf x_t)/\tilde p_\theta(\mathbf y|\mathbf x_{t+1})$ 与 $\log p_\theta(\mathbf x_t|\mathbf x_{t+1})/r_t(\mathbf x_t|\mathbf x_{t+1})$ 有界。第一项由假设 (b) 有界，下面处理第二项。

$\log p_\theta(\mathbf x_t|\mathbf x_{t+1})/r_t(\mathbf x_t|\mathbf x_{t+1})$ 的有界性由假设 (c) 与 (d) 推得。先写 $p_\theta(\mathbf x_t|\mathbf x_{t+1})=\mathcal N(\mathbf x_t|\hat{\boldsymbol\mu},\sigma_{t+1}^2\mathbf I)$，其中 $\hat{\boldsymbol\mu}=\mathbf x_{t+1}+\sigma_{t+1}^2\mathbf s_\theta(\mathbf x_{t+1})$，以及 $r_t(\mathbf x_t|\mathbf x_{t+1})=\mathcal N(\mathbf x_t|\hat{\boldsymbol\mu}_\psi,\tilde\sigma_{t+1}^2\mathbf I)$，其中 $\hat{\boldsymbol\mu}_\psi=\hat{\boldsymbol\mu}+\sigma_{t+1}^2\nabla_{\mathbf x_{t+1}}\log\tilde p_\theta(\mathbf y|\mathbf x_{t+1})$。则对数比化简为

$$
\log\frac{p_\theta(\mathbf x_t|\mathbf x_{t+1})}{r_t(\mathbf x_t|\mathbf x_{t+1})}=\log\frac{|2\pi\sigma_{t+1}^2\mathbf I|^{-1/2}\exp\{-(2\sigma_{t+1}^2)^{-1}\|\hat{\boldsymbol\mu}-\mathbf x_t\|^2\}}{|2\pi\tilde\sigma_{t+1}^2\mathbf I|^{-1/2}\exp\{-(2\tilde\sigma_{t+1}^2)^{-1}\|\hat{\boldsymbol\mu}_\psi-\mathbf x_t\|^2\}}
$$

重排并令 $C=\log\frac{|2\pi\sigma_{t+1}^2\mathbf I|^{-1/2}}{|2\pi\tilde\sigma_{t+1}^2\mathbf I|^{-1/2}}$：

$$
=-\frac12\left[\sigma_{t+1}^{-2}\|\hat{\boldsymbol\mu}-\mathbf x_t\|^2-\tilde\sigma_{t+1}^{-2}\|\hat{\boldsymbol\mu}_\psi-\mathbf x_t\|^2\right]+C
$$

展开并重排 $\|\hat{\boldsymbol\mu}_\psi-\mathbf x_t\|^2=\|\hat{\boldsymbol\mu}-\mathbf x_t\|^2+2\langle\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu},\hat{\boldsymbol\mu}-\mathbf x_t\rangle+\|\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu}\|^2$：

$$
=-\frac12\left[(\sigma_{t+1}^{-2}-\tilde\sigma_{t+1}^{-2})\|\hat{\boldsymbol\mu}-\mathbf x_t\|^2-2\tilde\sigma_{t+1}^{-2}\langle\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu},\hat{\boldsymbol\mu}-\mathbf x_t\rangle-\tilde\sigma_{t+1}^{-2}\|\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu}\|^2\right]+C
$$

令 $C'=C-\frac12\tilde\sigma_{t+1}^{-2}\|\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu}\|^2$ 并重排；注意由假设 (c) 有 $\|\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu}\|^2<\infty$：

$$
=-\frac12(\sigma_{t+1}^{-2}-\tilde\sigma_{t+1}^{-2})\|\hat{\boldsymbol\mu}-\mathbf x_t\|^2+\tilde\sigma_{t+1}^{-2}\langle\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu},\hat{\boldsymbol\mu}-\mathbf x_t\rangle+C'
$$

应用 Cauchy–Schwarz：

$$
\le-\frac12(\sigma_{t+1}^{-2}-\tilde\sigma_{t+1}^{-2})\|\hat{\boldsymbol\mu}-\mathbf x_t\|^2+\tilde\sigma_{t+1}^{-2}\|\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu}\|\cdot\|\hat{\boldsymbol\mu}-\mathbf x_t\|+C'
$$

利用 $\max_x\left(-\frac a2x^2+bx\right)=\frac{b^2}{2a}$（其中由假设 (d) $a=\sigma_{t+1}^{-2}-\tilde\sigma_{t+1}^{-2}>0$）作上界：

$$
\le\frac12\frac{(\tilde\sigma_{t+1}^{-2}\|\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu}\|)^2}{\sigma_{t+1}^{-2}-\tilde\sigma_{t+1}^{-2}}+C'=\frac{\tilde\sigma_{t+1}^{-4}}{2(\sigma_{t+1}^{-2}-\tilde\sigma_{t+1}^{-2})}\|\hat{\boldsymbol\mu}_\psi-\hat{\boldsymbol\mu}\|^2+C'
$$

注意 $\hat{\boldsymbol\mu}_\psi=\hat{\boldsymbol\mu}+\sigma_{t+1}^2\nabla_{\mathbf x_{t+1}}\log\tilde p_\theta(\mathbf y|\mathbf x_{t+1})$：

$$
=\frac{\tilde\sigma_{t+1}^{-4}}{2(\sigma_{t+1}^{-2}-\tilde\sigma_{t+1}^{-2})}\sigma_{t+1}^4\left\|\nabla_{\mathbf x_{t+1}}\log\tilde p_\theta(\mathbf y|\mathbf x_{t+1})\right\|^2+C'\le C''.
$$

最后一行由假设 (c)（扭曲函数梯度有界）得到。上述推导因此表明每个 $w_t$ 有界，从而完成证明。

## 附录 B 黎曼扭曲扩散采样器

本附录给出 §3 引入的 TDS 到黎曼扩散模型扩展的更多细节：先介绍切空间正态分布，再给出以切空间正态参数化的黎曼扩散模型背景，然后描述 TDS 到这些模型的扩展，最后说明算法 1 在该设定下如何修改。

**切空间正态分布。** 正如高斯是式（3）中欧氏扩散模型的基础参数族，**切空间正态**（tangent normal，见 [4, 8]）是黎曼扩散模型生成的基础，故在此回顾。切空间正态可视为两步流程所蕴含的分布：给定流形上的变量 $\mathbf x$，第一步在切空间 $T_{\mathbf x}$ 中采样变量 $\bar{\mathbf y}$——若 $\{\mathbf h_1,\ldots,\mathbf h_D\}$ 为 $T_{\mathbf x}$ 的正交基，可生成

$$
\bar{\mathbf y}=\boldsymbol\mu+\sum_{d=1}^{D}\sigma\epsilon_d\cdot\mathbf h_d,
$$

其中 $\epsilon_d$ 独立同分布 $\sim\mathcal N(0,1)$，$\sigma^2>0$ 为方差参数。第二步把 $\bar{\mathbf y}$ 投影回流形得到 $\mathbf y=\exp_{\mathbf x}\{\bar{\mathbf y}\}$，$\exp_{\mathbf x}\{\cdot\}$ 表示 $\mathbf x$ 处的指数映射。所得 $\mathbf y$ 的分布记为 $\mathcal T\mathcal N_{\mathbf x}(\boldsymbol\mu,\sigma^2)$。由构造，$T_{\mathbf x}$ 是以 $\mathbf x$ 为原点的欧氏空间，故当 $\|\boldsymbol\mu\|_2=0$ 时 $\mathcal T\mathcal N_{\mathbf x}(\boldsymbol\mu,\sigma^2)$ 以 $\mathbf x$ 为中心；又因黎曼流形局部欧氏，$\sigma^2$ 较小时指数映射接近恒等映射，切空间正态本质上是 $\mathbf x$ 处流形上的窄高斯分布。记 $\mathcal T\mathcal N_{\mathbf x}(\mathbf y;\boldsymbol\mu,\sigma^2)$ 为在 $\mathbf y$ 处评估的切空间正态密度。由于该流程涉及从 $\bar{\mathbf y}$ 到 $\mathbf y$ 的变量替换（经指数映射），切空间正态密度计算为

$$
\mathcal T\mathcal N_{\mathbf x}(\mathbf y;\boldsymbol\mu,\sigma^2)=\mathcal N\left(\exp_{\mathbf x}^{-1}\{\mathbf y\};\boldsymbol\mu,\sigma^2\right)\left|\frac{\partial}{\partial\mathbf y}\exp_{\mathbf x}^{-1}\{\mathbf y\}\right|,
$$

其中 $\exp_{\mathbf x}^{-1}\{\mathbf y\}$ 为指数映射的逆（从流形到 $T_{\mathbf x}$），$\left|\frac{\partial}{\partial\mathbf y}\exp_{\mathbf x}^{-1}\{\mathbf y\}\right|$ 为指数映射 Jacobian 的行列式；当流形位于 $\mathbb R$ 的更高维子集时，取该 Jacobian 的正奇异值之积。

**黎曼扩散模型与切空间正态分布。** 黎曼扩散模型通过**测地随机游走**推进 [8]：在每步 $t$，先在 $T_{\mathbf x_{t+1}}$ 中采样 $\bar{\mathbf x}_t$——若 $\{\mathbf h_1,\ldots,\mathbf h_D\}$ 为 $T_{\mathbf x_{t+1}}$ 的正交基，可生成

$$
\bar{\mathbf x}_t=\sigma_{t+1}^2\mathbf s_\theta(\mathbf x_{t+1})+\sum_{d=1}^{D}\sigma_{t+1}\epsilon_d\cdot\mathbf h_d,
$$

其中 $\epsilon_d$ 独立同分布 $\sim\mathcal N(0,1)$。随后把 $\bar{\mathbf x}_t$ 投影回流形得到 $\mathbf x_t=\exp_{\mathbf x_{t+1}}\{\bar{\mathbf x}_t\}$。这等价于从切空间正态分布采样

$$
\mathbf x_t\sim p(\mathbf x_t|\mathbf x_{t+1})=\mathcal T\mathcal N_{\mathbf x_{t+1}}\left(\mathbf x_t;\sigma_{t+1}^2\mathbf s_\theta(\mathbf x_{t+1}),\sigma_{t+1}^2\right).
$$

**黎曼扩散模型的 TDS。** 扩展 TDS 只需适当的扭曲提议与权重类比。该扩展要求扩散模型同时关联流形值去噪估计 $\hat{\mathbf x}_\theta$——例如当 $\mathbf s_\theta(\mathbf x_t,t):=\nabla_{\mathbf x_t}\log q(\mathbf x_t|\mathbf x_0=\hat{\mathbf x}_\theta)$（$\hat{\mathbf x}_\theta=\hat{\mathbf x}_\theta(\mathbf x_t,t)$）时即如此。与欧氏情形不同，对任意黎曼流形，去噪估计与可计算分数近似之间的关系未必存在；但对李群，当前向扩散为 Brown 运动时可计算分数近似存在 [39, 命题 3.2]。对正且可微的 $p_{y|x_0}(\mathbf y|\mathbf x_0)$，我们同样选择扭曲函数 $\tilde p_\theta(\mathbf y|\mathbf x_t):=p_{y|x_0}(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t))$。接下来是修复与带自由度修复情形：假设 $\mathbf x_0$ 位于多维流形（如 $SE(3)^N$），未掩码观测 $\mathbf y=\mathbf x_{0,M}$（$M\subset\{1,\ldots,N\}$）位于低维子流形（如 $SE(3)^{|M|}$，$|M|<N$）。此时扭曲函数的构造与 §3.3 完全相同，只把式（13）中的正态密度替换为切空间正态：

$$
\tilde p_\theta(\mathbf y|\mathbf x_t)=\mathcal T\mathcal N_{\hat{\mathbf x}_\theta(\mathbf x_t)_M}\left(\mathbf y;\mathbf 0,\bar\sigma_t^2\right).
$$

对所有情形，我们提出扭曲提议

$$
\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)=\mathcal T\mathcal N_{\mathbf x_{t+1}}\left(\mathbf x_t;\sigma_{t+1}^2\mathbf s_\theta(\mathbf x_{t+1},\mathbf y),\tilde\sigma_{t+1}^2\right)\tag{17}
$$

其中与欧氏情形一样 $\mathbf s_\theta(\mathbf x_t,\mathbf y)=\mathbf s_\theta(\mathbf x_t)+\nabla_{\mathbf x_t}\log\tilde p(\mathbf y|\mathbf x_t)$。中间步骤的权重按欧氏情形（式（11））计算：

$$
w_t(\mathbf x_t,\mathbf x_{t+1}):=\frac{p_\theta(\mathbf x_t|\mathbf x_{t+1})\tilde p_\theta(\mathbf y|\mathbf x_t)}{\tilde p_\theta(\mathbf y|\mathbf x_{t+1})\tilde p_\theta(\mathbf x_t|\mathbf x_{t+1},\mathbf y)}=\frac{\mathcal T\mathcal N_{\mathbf x_{t+1}}\left(\mathbf x_t;\sigma_{t+1}^2\mathbf s_\theta(\mathbf x_{t+1}),\sigma_{t+1}^2\right)\tilde p_\theta(\mathbf y|\mathbf x_t)}{\tilde p_\theta(\mathbf y|\mathbf x_{t+1})\mathcal T\mathcal N_{\mathbf x_{t+1}}\left(\mathbf x_t;\sigma_{t+1}^2\mathbf s_\theta(\mathbf x_{t+1},\mathbf y),\tilde\sigma_{t+1}^2\right)}.
$$

尽管提议与目标贡献相同的 Jacobian 行列式项并相互抵消，它们仍保留在扭曲函数中。

**把 TDS 算法适配到黎曼设定。** 把算法 1 转换到黎曼设定只需两处修改。第一处在算法 1 第 6 行：假定无条件分数通过转移密度函数计算，即 $\mathbf s_\theta(\mathbf x_{t+1}):=\nabla_{\mathbf x_{t+1}}\log q_{t+1|0}(\mathbf x_{t+1}|\hat{\mathbf x}_\theta)$（$\hat{\mathbf x}_\theta=\hat{\mathbf x}_\theta(\mathbf x_{t+1})$）；注意上式梯度忽略 $\hat{\mathbf x}_\theta$ 对 $\mathbf x_{t+1}$ 的依赖。第 6 行的条件分数近似替换为

$$
\tilde{\mathbf s}_k\leftarrow\tilde p_\theta(\cdot|\mathbf x_{t+1}^k,\mathbf y):=\nabla_{\mathbf x_{t+1}^k}\log q_{t+1|0}(\mathbf x_{t+1}^k|\hat{\mathbf x}_\theta)+\nabla_{\mathbf x_{t+1}^k}\log\tilde p_{t+1}^k,\qquad\hat{\mathbf x}_\theta=\hat{\mathbf x}_\theta(\mathbf x_{t+1}^k).
$$

值得注意的是，$\tilde{\mathbf s}_k$ 是取值于 $T_{\mathbf x_{t+1}^k}$ 的黎曼梯度。第二处修改是把算法 1 第 7 行的提议改为切空间正态，如式（17）所定义。

## 附录 C 附加相关工作

**带条件信息的训练。** 若干方法训练神经网络直接采样条件扩散模型，包括：(i) 以条件信息嵌入做条件训练，如用于图像去噪 [30] 与文本到图像生成 [27]；(ii) 以状态空间子集做条件训练，如用于蛋白质设计 [37] 与图像修复 [29]；(iii) 分类器引导 [9, 33]——一种生成指定类别样本的方法，需训练依赖时间的分类器对每个 $t$ 逼近 $p_\theta(\mathbf y|\mathbf x_t)$，而训练此类分类器可能不便且昂贵；(iv) 无分类器引导 [17]——在分类器引导基础上不训练分类器，而是训练以类别信息为额外输入的扩散模型。

**Langevin 与 Metropolis–Hastings 步。** 一些先前工作探索在采样方案中使用 Markov 链 Monte Carlo 步以更好地逼近条件分布。例如非调整 Langevin 动力学 [19, 33] 或 Hamiltonian Monte Carlo [11] 原则上可在步数很多时实现渐近精确采样。然而这些策略只在（不现实的）"无条件模型恰好匹配前向过程"假设下保证瞄准联合模型的条件分布；实践中加入此类步可能恶化样本，推测是近似误差所致 [21]。相比之下，TDS 不要求学习到的扩散模型恰好匹配前向加噪过程的假设。

## 附录 D 实证结果附加细节

### D.1 二维问题上的合成扩散模型

**前向过程。** 我们的前向过程为保持方差（VP）型（见附录 A），$T=100$ 步，二次方差调度：$\sigma_t^2=\sigma_{\min}^2+(t/T)^2\sigma_{\max}^2$，$\sigma_{\min}^2=10^{-5}$、$\sigma_{\max}^2=10^{-1}$。

**无条件目标分布与似然。** 我们用两种不同的无条件目标分布评估各方法：1. 均值在 $(1/2,1/2)$、协方差 0.9 的二元高斯；2. 三成分高斯混合，混合比例 $[0.3,0.5,0.2]$，均值 $[(1.54,-0.29),(-2.18,0.57),(-1.09,-1.40)]$，标准差 0.2。我们按 §5.1 的三个似然评估条件分布。图 D 给出与图 1 类似但以高斯混合为无条件目标的结果；第二个例子中我们使用修复自由度的一个变体：$\mathbf y=1$、$\mathcal M=\{[1],[2]\}$，故 $p_{y|x_0}(\mathbf y|\mathbf x_0)=\delta_{\mathbf y}(\mathbf x_{0,1})+\delta_{\mathbf y}(\mathbf x_{0,2})$。

**图 D：** 高斯混合无条件目标下条件均值估计误差（2 倍标准误误差棒，25 次重复平均）；TDS 适用于全部三个任务且粒子越多精度越高。（来源：原文第 21 页。）

### D.2 图像条件生成实验

我们在 MNIST（$28\times28\times1$ 维）上对类别条件生成与修复任务开展大量消融（附录 D.2.1、D.2.2），并在附录 D.2.3 展示 TDS 对更高维数据集（CIFAR10 $32\times32\times3$ 与 ImageNet256 $256\times256\times3$）的适用性。

#### D.2.1 MNIST 上的类别条件生成

**设置。** MNIST 上我们使用保持方差框架搭建扩散模型，架构基于 guided diffusion 代码库³，配置为：通道数 64、注意力分辨率 "28,14,7"、残差块数 3、学习 sigma（即学习 $p_\theta(\mathbf x_{t-1}|\mathbf x_t)$ 的方差）=True、resblock updown=True、dropout=0.1、方差调度 "linear"。我们在 60k 张 MNIST 训练图像上以批大小 128、学习率 $10^{-4}$ 训练 60k 个 epoch，训练用 $T=1{,}000$、采样用 $T=100$。用于类别条件生成与评估的分类器为预训练 ResNet50⁴，在与扩散模型相同的 MNIST 训练图像上训练。此外我们引入 **TDS-truncate** 变体，在 $t=10$ 处截断 TDS 过程并返回预测 $\hat{\mathbf x}_\theta(\mathbf x_{10})$。

> **脚注 3（原文）：** https://github.com/openai/guided-diffusion
>
> **脚注 4（原文）：** 下载自 https://github.com/VSehwag/minimal-diffusion

**样本图。** 为补充图 2a 中类别 7 的样本图，我们给出其余 9 个类别与其他方法的样本。我们观察到梯度引导样本有明显伪影，而其余 4 种方法产生真实且正确的数字；但 IS 或 TDS-IS 的多数样本因重要性权重坍缩而相同；相比之下 TDS 与 TDS-truncate 的样本多样性更大，后者变化略多。

**扭曲尺度消融。** 我们考虑以扭曲尺度 $\gamma$ 对扭曲函数取幂并重新归一化，即令新扭曲函数为 $\tilde p_\theta(\mathbf y|\mathbf x_t;\gamma)\propto p_{y|x_0}(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t))^{\gamma}$；特别地 $t=0$ 时设 $p_{y|x_0}(\mathbf y|\mathbf x_0;\gamma)\propto p_{y|x_0}(\mathbf y|\mathbf x_0)^{\gamma}$。该修改意味着目标条件分布变为 $p_\theta(\mathbf x_0|\mathbf y;\gamma)\propto p_\theta(\mathbf x_0)p_{y|x_0}(\mathbf y|\mathbf x_0)^{\gamma}$。取 $\gamma>1$ 使分类似然更尖锐，可能有助于把样本扭向特定类别；TDS（以及 TDS-IS 与梯度引导）仍以该新扭曲函数定义适用。扭曲尺度的使用类似分类器引导文献中引入的引导尺度，后者用于乘上对数分类概率的梯度 [9]。

**图 E：** MNIST 类别条件生成：单次运行中从 64 个粒子中随机选取的 16 个条件样本，给定类别 $\mathbf y$（自上而下 $y=0,1,2,3,4,5,6,8,9$）。（来源：原文第 22 页。）

图 F 中我们考察不同扭曲尺度对 TDS、TDS-IS 与梯度引导分类准确率的影响，考虑两种评估方式：第一，由神经网络分类器计算的分类准确率（评估设置同 §5.2）；第二，人工评定的分类准确率——由一位人工（作者之一）检查生成的数字类别是否正确且无伪影。由于人工评估昂贵，我们只评估 TDS、TDS-IS（均取 $K=64,2$）与梯度引导；每次运行按关联权重从 $K$ 个粒子中随机抽取一个粒子，对每个类别标签进行 64 次运行，共 640 个样本用于人工评估。

图 Fa 给出神经网络分类器的分类准确率：总体而言更大扭曲尺度提升分类准确率；对 TDS 与 TDS-IS，粒子数 $K$ 越小时提升越显著。图 Fb 给出人工评定准确率：此时更大扭曲尺度未必更好——适度较大的扭曲尺度（$\gamma=2,3$）通常有助提升准确率，而过大的扭曲尺度（$\gamma=10$）降低准确率。例外是 $K=64$ 的 TDS：任何 $\gamma>1$ 相对 $\gamma=1$ 都使准确率变差。撇开扭曲尺度，我们发现更多粒子 $K$ 提升人工评定准确率（回忆梯度引导是 $K=1$ 的 TDS 特例）：相同扭曲尺度下 $K=1,2,64$ 的 TDS 准确率递增。此外 $K=64$、$\gamma=1$ 的 TDS 与 TDS-IS 几乎达到完美准确率；$K$ 对人工评定准确率的影响与 §5.2 神经网络分类器评估的先前发现一致。

**图 F：** MNIST 类别条件生成：不同扭曲尺度下的分类准确率——顶部为由神经网络分类器计算、底部为人工评定。(a) 分类准确率随粒子数 $K$ 变化（不同扭曲尺度；1000 次随机运行平均，误差带为 2 倍标准误）；(b) 人工评定准确率随扭曲尺度变化（TDS $K=64,2$；TDS-IS $K=64,2$；梯度引导；640 个随机样本平均，误差带为 2 倍标准误）。（来源：原文第 23 页。）

我们注意到神经网络评估与人工评估在扭曲尺度效应上存在差异。我们推测：使用过大扭曲尺度时，生成样本可能落在数据流形之外，但仍保留神经网络分类器可识别的特征，从而导致人工评定准确率低而分类器准确率高。为验证该假设，我们在图 G 给出类别 6 的样本：例如图 Ge 中 $\gamma=1$ 的梯度引导在 64 个样本中有 31 个质量良好，其余样本常类似其他数字（如 3、4、8）；$\gamma=10$ 的梯度引导有 34 个质量良好样本，但其余多数样本形似 6 且有许多伪影。

**图 G：** MNIST 类别条件生成：给定类别 6、从 64 次随机运行中选取的样本（不同扭曲尺度）。自上而下：TDS（$K=64$）、TDS（$K=2$）、TDS-IS（$K=64$）、TDS-IS（$K=2$）、梯度引导。适度较大的扭曲尺度通常提升样本质量；但过大扭曲尺度（如 10）会使数字形状畸变、伪影增多，尽管仍保留可能让分类器识别类别的有用特征。（来源：原文第 24 页。）

**有效样本量。** 有效样本量（ESS）是诊断 SMC 采样器性能的常用指标，对 $K$ 个加权粒子 $\{\mathbf x_t^k,w_t^k\}_{k=1}^{K}$ 定义为 $(\sum_kw_t^k)^2/(\sum_k(w_t^k)^2)$，恒介于 0 与 $K$ 之间。图 H 给出 TDS、TDS-IS 与 IS 的 ESS 轨迹比较：TDS 的 ESS 总体呈上升趋势并接近 $K=64$；尽管最后几步 TDS 的 ESS 下降约一半，仍高于分别恶化到约 1 与 6 的 TDS-IS 与 IS。实践中可用上文引入的 TDS-truncate 变体避免最后几步的 ESS 下降。

**图 H：** ESS 轨迹（100 次运行平均，$K=64$）。（来源：原文第 25 页。）

#### D.2.2 MNIST 上的图像修复

修复任务是给定观测部分 $\mathbf x_{0,M}=\mathbf y$ 时从 $p_\theta(\mathbf x_0|\mathbf x_{0,M}=\mathbf y)$ 采样图像。这里按 §3.3 把 $\mathbf x_0=[\mathbf x_{0,M},\mathbf x_{0,\bar M}]$ 分割为观测维度 $M$ 与未观测维度 $\bar M$。本实验考虑两类观测维度：(1) $M=$"half"，观测图像左半；(2) $M=$"quarter"，观测图像左上四分之一。我们运行 TDS、TDS-IS、梯度引导、SMC-Diff 与替换方法对 10,000 张验证图像做修复，并纳入在 $t=10$ 截断的 TDS-truncate（返回 $\hat{\mathbf x}_\theta(\mathbf x_{10})$）。

**扭曲函数方差调度。** 我们用灵活方差调度 $\{\hat\sigma_t^2\}$ 把式（13）的扭曲函数扩展为 $\tilde p_\theta(\mathbf y|\mathbf x_t,M):=\mathcal N(\mathbf y|\hat{\mathbf x}_\theta(\mathbf x_t)_M,\hat\sigma_t^2)$。理想地 $\hat\sigma_t^2$ 应匹配 $\mathrm{Var}_{p_\theta}[\mathbf y|\mathbf x_t,M]$；在 TDS 中我们选择 $\hat\sigma_t^2=\frac{(\bar\sigma_t^2/\bar\alpha_t)\cdot\tau^2}{\bar\sigma_t^2/\bar\alpha_t+\tau^2}$，其中 $\tau^2=0.12$ 为训练数据的估计样本方差（对像素平均）。该选择受 Song 等 [32, 附录 A.3] 启发：若数据分布 $q(\mathbf x_0)=\mathcal N(\mathbf 0,\tau^2)$、$q(\mathbf x_t|\mathbf x_0)=\mathcal N(\mathbf x_t|\sqrt{\bar\alpha_t}\mathbf x_0,\sigma_t^2)$，则按 Bayes 规则 $\mathrm{Var}_q[\mathbf x_0|\mathbf x_t]=\frac{(\bar\sigma_t^2/\bar\alpha_t)\tau^2}{(\bar\sigma_t^2/\bar\alpha_t)+\tau^2}$。改变 $\hat\sigma_t^2$ 的效果类似附录 D.2.1 中用扭曲尺度对扭曲函数取幂；特别地对高斯分布，取幂对应重新缩放方差：$\mathcal N(\mathbf x|\boldsymbol\mu,(\sigma/\sqrt\gamma)^2)\propto\mathcal N(\mathbf x|\boldsymbol\mu,\sigma^2)^{\gamma}$。

**指标。** 我们考虑 3 个指标：(1) 用 ESS 比较不同 SMC 采样器（TDS、TDS-IS、SMC-Diff）的粒子效率；(2) 以下游任务锚定采样器性能——对部分观测图像 $\mathbf x_{0,M}=\mathbf y$ 做分类：用分类器预测修复图像 $\mathbf x_0$ 的类别 $\hat z$，并相对未掩码图像真值类别 $z^\ast$（MNIST 数据集提供）计算准确率，分类器与 §5.2 相同。考虑从以 $\mathbf x_{0,M}=\mathbf y$ 为条件的采样器抽取的 $K$ 个加权粒子 $\{\mathbf x_0^k;w_0^k\}_{k=1}^{K}$（权重已归一化），定义**贝叶斯准确率（BA）**为 $\mathbf 1\{\hat z(\mathbf y)=z^\ast\}$，其中 $\hat z(\mathbf y):=\arg\max_{z=1:10}\sum_{k=1}^{K}w_0^kp(z;\mathbf x_0^k)$；$\hat z(\mathbf y)$ 可视为给定 $\mathbf y$ 的 Bayes 最优分类器 $\hat z^\ast(\mathbf y)$ 的近似：

$$
\hat z^\ast(\mathbf y):=\arg\max_{z=1:10}p_\theta(z|\mathbf x_{0,M}=\mathbf y)=\arg\max_{z=1:10}\int p_\theta(\mathbf x_0|\mathbf x_{0,M}=\mathbf y)p(z;\mathbf x_0)\,\mathrm d\mathbf x_0\tag{18}
$$

（式（18）中假定分类器 $p_{y|x_0}(\cdot|\mathbf x_0)$ 为全图上的最优分类器）。(3) 我们还考虑**分类准确率（CA）**：$\sum_{k=1}^{K}w_0^k\mathbf 1\{\hat z(\mathbf x_0^k)=z^\ast\}$，其中 $\hat z(\mathbf x_0^k):=\arg\max_{z=1:10}p_{y|x_0}(z|\mathbf x_0^k)$。BA 与 CA 评估采样器的不同侧面：BA 关注多个粒子中的最优预测，CA 关注其加权平均预测。

**不同方法的比较结果。** 图 I 给出不同采样器的 ESS 轨迹、BA 与 CA。总体观察与 §5.2 类别条件生成任务类似，只是那里没有 SMC-Diff 与替换方法。替换方法在所有设定下 CA 与 BA 最低。把 TDS 与 SMC-Diff 比较，我们发现 SMC-Diff 的 ESS 一致高于 TDS，但在 CA 与 BA 上均被 TDS 超越。我们还注意到尽管梯度引导 CA 较低，其 BA 与 TDS 相当——这是因为只要梯度引导在 $K$ 个粒子中生成少量优质样本，最优预测即可准确，从而得到高 BA。

**图 I：** MNIST 图像修复。上方面板为观测维度 $M=$"half"，下方面板为 $M=$"quarter"。(i) 左列：ESS 轨迹（TDS、TDS-IS、SMC-Diff，均 $K=64$，对 100 张不同图像平均）；(ii) 右列：分类准确率与贝叶斯准确率（10,000 张图像平均）；(iii) 比较上下两面板可见，在更难的 $M=$"quarter" 修复问题上 TDS 的 ESS 更高但 CA 与 BA 更低。（来源：原文第 27 页。）

**扭曲函数方差调度的消融。** 我们比较以下三种方案：1. **DPS**：$\hat\sigma_t:=2\|\hat{\mathbf x}_\theta(\mathbf x_t)_M-\mathbf y\|^2\sigma_t^2$，改编自 DPS 方法 [6, 算法 1]；2. **ΠGDM**：$\hat\sigma_t:=\sigma_t^2/\sqrt{\bar\alpha_t}$，改编自 ΠGDM 方法 [32, 算法 1]；3. **TDS**：$\hat\sigma_t^2=\frac{(\bar\sigma_t^2/\bar\alpha_t)\tau^2}{(\bar\sigma_t^2/\bar\alpha_t)+\tau^2}$，$\tau^2=0.12$。图 J 给出 TDS、TDS-IS 与梯度引导在不同扭曲尺度方案下的分类准确率：我们的选择与 ΠGDM 性能相近，并在多数情形优于 DPS；例外是 $M=$"quarter" 且 $K$ 较大时，采用 ΠGDM 或 DPS 扭曲尺度选择的 TDS 有更高 CA（见图 Jb 左面板）。

**图 J：** MNIST 图像修复：扭曲尺度消融。上：$M=$"half"；下：$M=$"quarter"。(a)/(b) 不同扭曲尺度方案下的分类准确率（图例含 DPS、GDM/ΠGDM、Ours）。（来源：原文第 28 页。）

#### D.2.3 ImageNet 与 CIFAR-10 上的类别条件生成

**ImageNet。** 我们用来自 https://github.com/openai/guided-diffusion/tree/main 的同一无条件模型，比较 TDS（粒子数 $K=1,16$）与**分类器引导（CG）**。CG 同样使用该仓库中在含噪输入上训练的分类器。对 TDS，我们使用在时间步 0 处评估的同一分类器，以模仿标准训练分类器。对 1000 个类别标签各生成 16 张图像，使用 100 个采样步。TDS 使用扭曲尺度 10，CG 使用引导尺度 10。值得注意的是，给定固定类别，TDS（$K=16$）在单次 SMC 运行中生成相关样本，而 TDS（$K=1$）与 CG 生成 16 个独立样本。图 K 中我们观察到 TDS 能忠实捕捉类别且图像质量与 CG 相当，尽管多样性低于 CG 与 TDS（$K=1$）。图 L 给出随机选取类别的更多样本。我们也报告了原始论文 [9] 中无条件模型的结果（在 50k 样本、250 采样步上评估，见附录 D.2.3）。TDS 与 CG 分类准确率相近；TDS 的 FID 与无条件模型相近而 Inception score 更好；CG 的 FID 与 Inception score 优于 TDS。我们推测该差异源于 TDS（$K=16$）单次运行内粒子间的样本相关性（从而多样性更低）。

**表 1：ImageNet 样本质量比较。** 前三行方法在 16k 个样本（100 步）上评估；无条件模型性能取自 [9]，在 50k 个样本（250 步）上评估。（来源：原文第 27 页。）

| 方法 | Classification Accuracy ↑ | FID ↓ | Inception Score ↑ |
|---|---|---|---|
| TDS（$K=16$） | 99.90% | 26.65 | 64.03 |
| TDS（$K=1$） | 99.63% | 26.05 | 44.45 |
| Classifier Guidance | 99.17% | 14.03 | 100.33 |
| Unconditional model | n/a | 26.21 | 39.70 |

**图 K：** $256\times256$ ImageNet：给定类别 "brambling"，TDS（$P=16$）、TDS（$P=1$）与分类器引导的样本。（来源：原文第 28 页。）

**图 L：** $256\times256$ ImageNet：15 个随机类别样本。自上而下：TDS（$P=16$）、TDS（$P=1$）、分类器引导。（来源：原文第 29 页。）

**CIFAR-10。** 我们以扭曲尺度 1、100 个采样步运行 TDS（$K=16$），使用 https://github.com/openai/improved-diffusion 的扩散模型与 https://github.com/VSehwag/minimal-diffusion/tree/main 的分类器。TDS 生成忠实且多样的图像（见图 M），但我们发现 TDS 偶尔会为类别 "truck" 生成错误样本（图 M 最后一面板）。最后我们在图 N 给出三个图像数据集的 ESS 轨迹：MNIST 在最后阶段出现突然的 ESS 下降，CIFAR10 有时也有，而 ImageNet 通常没有。从机制上看，ESS 下降意味着最终与中间目标分布之间存在大差异；我们推测此类差异可能源于去噪网络在 $t=0$ 附近的不规则性。实践中可考虑提前截断 TDS 过程以避免此类 ESS 下降并促进粒子多样性（已在附录 D.2.1 与 D.2.2 研究）。

**图 M：** CIFAR10：给定不同类别标签的 TDS（$K=16$，单次 SMC 运行内）样本：(a) airplane；(b) deer；(c) horse；(d) ship；(e) truck；(f) 失效模式。多数情形 TDS 生成真实且多样的图像；最后一面板给出类别 "truck" 的失效模式。（来源：原文第 29 页。）

**图 N：** MNIST、CIFAR-10 与 ImageNet 模型上 TDS（$K=16$，100 采样步）的两个示例 ESS 轨迹。（来源：原文第 29 页。）

## 附录 E Motif-scaffolding 应用细节

**蛋白质骨架的无条件模型。** 这里使用 Yim 等 [39] 描述的扩散生成模型 **FrameDiff**。FrameDiff 把 $N$ 残基蛋白质骨架参数化为由旋转与平移定义的刚体集合 $\mathbf x_0=[(R_1,\mathbf z_1),\ldots,(R_N,\mathbf z_N)]\in SE(3)^N$。$SE(3)$ 是三维特殊欧氏群（一个黎曼流形）：每个 $R_n\in SO(3)$（三维特殊正交群）为旋转矩阵，每个 $\mathbf z_n\in\mathbb R^3$ 为平移。$R_n$ 与 $\mathbf z_n$ 一起描述如何通过平移与旋转一个以 $C_\alpha$ 碳为原点的理想残基坐标，得到每个残基三个骨架原子 C、$C_\alpha$、N 的坐标。条件信息则是 motif $\mathbf y=\mathbf x_{0,M}\in SE(3)^{|M|}$（某 $M\subset\{1,\ldots,N\}$）。FrameDiff 是连续时间扩散模型，步数为其超参数；我们在所有实验中使用 200 步。网络架构与前向/反向扩散过程细节见 [39]。

**motif-scaffolding 的扭曲函数。** 定义扭曲函数时，我们使用式（15）引入的 $p_\theta(\mathbf y|\mathbf x_t)$ 切空间正态近似。此时切空间正态在每个残基上、在旋转与平移分量上分别因式分解：平移分量在 $\mathbb R^3$ 中表示，故按前面欧氏情形处理（使用附录 A 的保持方差扩展）；旋转分量在 $SO(3)$ 中表示，切空间正态可按附录 B 所述、用 $SO(3)$ 上已知的指数映射计算。特别地，我们使用扭曲函数

$$
\tilde p_\theta(\mathbf y|\mathbf x_t,M)=\prod_{m=1}^{|M|}\mathcal N\left(\mathbf y_m^T;\hat{\mathbf x}_\theta(\mathbf x_t)_M^T,\ 1-\bar\alpha_t\right)\mathcal T\mathcal N_{\hat{\mathbf x}_\theta(\mathbf x_t)_M^R}\left(\mathbf y_m^R;\mathbf 0,\bar\sigma_t^2\right),
$$

其中 $\mathbf y_m^T,\hat{\mathbf x}_\theta(\mathbf x_t)_M^T\in\mathbb R^3$ 表示 motif 第 $m$ 个残基及其由 $\mathbf x_t$ 的预测所关联的平移；$\mathbf y_m^R,\hat{\mathbf x}_\theta(\mathbf x_t)_M^R\in SO(3)$ 表示旋转分量的对应量。此外 $1-\bar\alpha_t=\mathrm{Var}_q[\mathbf x_t|\mathbf x_0]$，$\bar\sigma_t^2$ 为前向过程在步 $t$ 关联的 Brown 运动时间 [39]。为更简单，我们的实现进一步用 motif 旋转与去噪预测旋转之差的平方 Frobenius 范数近似旋转上切空间正态的对数密度（如 [37] 中那样）；该近似在 $\bar\sigma_t\to0$ 时精确，且避免计算逆指数映射及其 Jacobian。

**motif 旋转与平移自由度。** 我们同样希望把 motif 的旋转与平移作为自由度消除。再次以随机性表示对 motif 旋转的不确定性，把旋转以均匀先验增广进联合模型，写为 $p_{y|x_0}(\mathbf y|\mathbf x_0)=\int p(R)p_{y|x_0}(\mathbf y|\mathbf x_0,R)\,\mathrm dR$，其中 $p_{y|x_0}(\mathbf y|\mathbf x_0,R)=\delta_{R\mathbf y}(\mathbf x_0)$，$p(R)$ 为 $SO(3)$ 上的均匀密度（Haar 测度），$R\mathbf y$ 表示用 $R$ 旋转 $\mathbf y$ 所描述的刚体。为计算可行性，我们用有限个旋转子采样定义的 Monte Carlo 近似该积分，$\mathcal R=\{R_k\}$（$|\mathcal R|=$# Motif Rots.）。合起来有

$$
\tilde p_\theta(\mathbf y|\mathbf x_t)=|\mathcal R|^{-1}\cdot|\mathcal M|^{-1}\sum_{R\in\mathcal R}\sum_{M\in\mathcal M}\tilde p_\theta(R\mathbf y|\mathbf x_t,M).
$$

上述子采样引入 motif 位置与旋转的子采样数作为超参数。值得注意的是，条件训练方法并不直接处理这些自由度，故先前工作随机采样这些变量的单个值 [34, 36, 37]。

**评估细节。** 我们对生成骨架采用自一致性评估 [34]：(i) 用固定的骨架序列设计（逆折叠）生成编码该骨架的候选氨基酸序列；(ii) 对序列做前向折叠得到骨架结构预测；(iii) 以初始骨架与预测结构的一致性（自一致性）评判其质量。我们沿用 [37] 的评估与成功判据，包括步骤 (i) 使用 ProteinMPNN [7]、步骤 (ii) 使用 AlphaFold [20] 对单序列（无多序列比对）折叠。评估中使用默认设置的 ProteinMPNN [7] 为每个采样骨架生成 8 条序列；[37, 方法表 9] 中未标为可重设计的位置保持固定。前向折叠使用 AlphaFold [20]。我们把"成功"定义为：生成的骨架至少有 1 条序列满足 motif 上 scRMSD < 1 Å 且全骨架 scRMSD < 2 Å。我们在 [37, 方法表 9] 引入的基准集 24/25 个问题上评估 TDS；第 25 个问题（6VW1）因涉及多链、FrameDiff 无法表示而被排除。FrameDiff 要求指定支架总长度；所有重复中我们把支架固定为 Watson 等 [37, 方法表 9] 所给总长度区间的中位数（例如 116 变为 125、62-83 变为 75）。如正文所述，处理 motif 放置自由度时我们限制不连续 motif 的可能放置数：为选择这些放置，我们 (i) 限制掩码使 motif 索引按预先指定顺序放置（不置换），且不分离在源 PDB 文件中连续出现的残基；(ii) 当可能放置仍过多时随机子采样，得到至多某最大规模（# Motif Locs.）的掩码集 $\mathcal M$。我们不强制 [37] 的 "contig" 描述所指定的段间距。

**重采样。** 所有 motif-scaffolding 实验使用系统重采样；所有情形使用 ESS 阈值 $K/2$，即仅当有效样本量低于该水平时才触发重采样步。

**图 O：** 完整 motif-scaffolding 基准集结果。纵轴为至少 200 次重复中的成功比例；误差棒为均值 ±2 倍标准误；支架短于 100 残基的问题加粗。TDS（$K=8$）在多数短支架问题上优于最先进方法（RFdiffusion）。（来源：原文第 31 页。）

**图 P：** 增大扭曲尺度对 motif-scaffolding 基准问题的影响各异。（来源：原文第 31 页。）

### E.1 附加结果

**扭曲尺度对更多 motif 的影响。** 图 3a 显示成功率随扭曲尺度单调上升，但该趋势并非对每个问题成立；图 P 通过在五个额外基准问题上比较不同扭曲尺度的成功率说明这一点。**有效样本量因问题而异。** 图 Q 给出采样生成过程中两个示例 ESS 轨迹：对 6EXZ-med，重采样被触发 38 次（其中 14 次在最后 25 步）；对 5IUS，重采样被触发 63 次（其中 13 次在最后 25 步）。这些轨迹在大基准上具有代表性。**把 TDS 应用于 RFdiffusion。** 我们还尝试把 TDS 用于 RFdiffusion [37]——一个使用与 FrameDiff 相同骨架结构表示的扩散模型，但与 FrameDiff 不同，它以条件样例（把骨架的一段作为期望 motif 输入）与无条件样例（只提供含噪骨架）的混合训练。尽管在基准评估中我们把 motif 信息作为显式条件输入提供，我们推理 TDS 也应适用于 RFdiffusion（条件信息不作为输入提供）；然而我们无法计算数值稳定的梯度（无论关于骨架表示的旋转还是平移分量），这导致扭曲提议分布同样不稳定、轨迹在即便单粒子时也频繁发散。我们推测该不稳定性源于 RFdiffusion 的结构预测预训练与有限微调，这可能使其在未拟合出光滑分数近似的情况下也能取得良好性能。

**图 Q：** 两个 motif-scaffolding 示例的 ESS 轨迹：(左) 6EXZ-med；(右) 5IUS。两者均 $K=8$、重采样阈值 $0.5K$；红色虚线表示重采样时刻。（来源：原文第 32 页。）

## 图注与表注

**图 1（原文第 7 页）：** 条件均值估计误差（2 倍标准误误差棒，25 次重复平均），TDS 适用于三个任务且粒子越多精度越高。
**图 2（原文第 9 页）：** 图像类别条件生成任务（MNIST 类别 7 的 TDS 与梯度引导样本；MNIST 分类准确率随 $K$ 变化；ImageNet 类别 "brambling" 的 TDS 样本）。
**图 3（原文第 10 页）：** 蛋白质 motif-scaffolding 案例研究结果（(a) 成功率随粒子数、自由度、扭曲尺度提升；(b) 成功率更高的问题数对比）。
**图 D—Q（原文第 21—32 页附录）：** 高斯混合目标的估计误差（D）、MNIST 各类样本与扭曲尺度评估（E、F、G）、ESS 轨迹（H、N、Q）、MNIST 修复结果与消融（I、J）、ImageNet 样本（K、L）、CIFAR10 样本与失效模式（M）、完整基准结果（O）、扭曲尺度影响（P）。

**表注汇总：** 表 1（原文第 27 页）为 ImageNet 样本质量比较（TDS $K=16$/$K=1$、分类器引导、无条件模型；分类准确率、FID、Inception score）。该表已用 `render.py` 渲染 PDF 第 27 页逐格核对；原文全文仅此一张编号表格，其余为图。

**本页范围与校对状态：** 本页覆盖 NeurIPS 2023 会议论文集版本（本地 32 页）全文：摘要、第 1—7 节、致谢、参考文献 [1]—[40]（英文原条目）、附录 A（A.1—A.5，含式 (16)、定理 2/3 与完整证明）、B（黎曼 TDS，式 (17)）、C（附加相关工作）、D（D.1—D.2.3 实证细节与式 (18)）、E（motif-scaffolding 应用细节与 E.1）、NeurIPS 论文清单（原文未含 checklist，故无此节）、图 1—3 与附录图 D—Q 图注、表 1、式（1）—（18）。**许可状态：会议论文集版本，再传播许可待核验；本页仅作学习用途、不计入可公开全文统计（已在页首声明）。** 表格核对：表 1 已用 `render.py` 渲染 PDF 第 27 页逐格核对（TDS 99.90%/26.65/64.03；TDS $K=1$ 99.63%/26.05/44.45；CG 99.17%/14.03/100.33；无条件模型 n/a/26.21/39.70）。原文疑点/说明已在页首译注列出（附录图字母编号、§5.1 似然光滑性脚注、附录 D 中 "GDM" 与 ΠGDM 记号混用、定理编号独立、基准排除 6VW1、表 1 评估口径不同），均按原文照录并加注。未做逐句逐式字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内图像未数字化转写。因此本页不标记为已验收全文；若需核对具体公式或数值，请以本地会议论文集 PDF 为准。
{% endraw %}