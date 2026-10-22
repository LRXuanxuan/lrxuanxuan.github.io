---
layout: page
title: "可逆双 Lipschitz 适配器的流匹配语义潜空间对齐｜中文主体译稿（附录待补）"
permalink: /papers/translations/2026-10-22-semantic-latent-alignment-flow-matching/
math: true
toc: true
---

[← 返回论文库](/papers/) · [arXiv 原文](https://arxiv.org/abs/2610.21332)

# 使用可逆双 Lipschitz 适配器进行流匹配的语义潜空间对齐

**原题：** Semantic Latent Alignment for Flow Matching with Invertible Bi-Lipschitz Adapters  
**作者：** Felix Nützel、Mischa Dombrowski、Luca Hagen、Bernhard Kainz  
**机构：** 埃尔朗根—纽伦堡大学；帝国理工学院。  
**版本：** arXiv:2610.21332v1（2026 年 10 月 15 日），17 页。  
**进度：** 摘要、正文第 1–7 节、公式（1）–（8）、实验表 1–9、附录 A–C 的构造、命题及证明和图 1–5 的图注均已录入。参考文献目录已按 PDF 原始英文书目信息补入（自动提取，仍待人工核对断行和链接）；实验图像仅保留文字图注及原 PDF 链接，未将图像嵌入页面。仍待终校，**不标记为已验收全文**。

## 摘要

预训练潜空间必须在压缩、重建质量与下游生成器学习其坐标的难易程度之间进行权衡，这使得将潜空间适配到不同领域或任务变得复杂：继续训练不仅代价高昂，而且如果没有新的对齐目标，通常也不能改善下游生成质量。本文选择保持编码器和解码器不变，仅修改它们之间的坐标系统：采用一种可逆的双 Lipschitz 适配器，离线地将潜空间对齐到语义教师模型，并在随后进行的类别条件流匹配训练中冻结该适配器。可逆性保留了与预训练自编码器的兼容性，而双 Lipschitz 约束限制了对齐过程中潜空间几何结构能够发生的形变程度。这为在保留原始潜空间压缩与重建性质的同时改善其语义组织提供了一种简单途径。

在两个医学影像数据集上，受约束的潜空间适配改善了特征评价指标、随机种子稳定性以及反事实编辑强度，同时仍保持具有竞争力的下游分类性能。相比之下，尽管不受约束的适配仍然可逆，却可能变得高度各向异性且对扰动敏感。这说明控制几何畸变至关重要。实验表明，经过恰当约束的事后适配可以成为一种参数高效、无需额外调参的替代方案，而无须在生成训练过程中联合修改表征。

## 1. 引言

潜空间生成模型，包括潜空间扩散模型（Rombach et al., 2022）和流匹配（Lipman et al., 2023），在预训练变分自编码器（VAE）（Kingma & Welling, 2013）生成的压缩表征上运行。VAE 通常针对压缩率与重建失真之间的权衡进行优化（Alemi et al., 2018；Bozkurt et al., 2021）。但是，适合重建的表征未必容易被下游模型学习。因此，潜空间表征的设计实际上包含第三个维度，即下游可学习性。本文将可学习性定义为：在下游处理流程所采用的观测机制下，容量有限的学习器从某种表征中恢复任务相关结构的容易程度。它既取决于表征保留了哪些信息，也取决于这些信息如何排列。

微调自编码器可以适配表征，但也会改变解码器坐标，需要重新建立潜变量缓存，并且增加代价较高的适配阶段，而适配后的潜变量依然可能难以学习。另一方面，REPA（Yu et al., 2025）等方法在生成器训练期间对齐模型内部的特征。它们改善的是生成器，而非潜空间表征本身；每次训练生成器都需要重新支付对齐成本。本文研究一种事后适配方案：只调整一次潜变量坐标，随后在不同流匹配模型中复用。

具体而言，在冻结的自编码器与生成器之间放置一个空间可逆适配器。利用缓存的潜变量和冻结语义教师模型的特征离线训练该适配器。流匹配模型在适配后的潜变量上运行；适配器的逆变换再将生成样本映射回预训练解码器所要求的坐标。如果求逆精确，编码器—解码器的重建映射完全不变。尽管如此，不受约束的可逆映射仍可能产生几乎塌缩的潜变量，因此本文采用双 Lipschitz 设计，通过一个可由数据估计的标量同时约束正反向畸变。

为实现教师对齐，本文采用线性中心化核对齐（centered kernel alignment，CKA）（Kornblith et al., 2019），它只比较两个空间的相对相似度矩阵。这一点十分重要：适配后的潜变量和教师模型的嵌入处于不同且维数很高的空间，并不存在共同坐标系统。在两个医学影像数据集上，从样本质量、语义覆盖度、合成数据训练效用和反事实生成等方面评估该方法，并与未经适配的潜空间、在线生成器对齐、自编码器适配以及约束较弱的可逆映射进行比较。

本文贡献如下。

1. 提出一种事后潜空间适配器，它在构造上满足可逆性与双 Lipschitz 条件；通过 CKA 离线对齐语义教师，并在流匹配期间冻结。自编码器及流匹配目标均保持不变，而单个标量 $\lambda$ 对正反向几何畸变提供闭式保证。
2. 适配器无需额外调参：可利用教师三元组的必要条件确定 $\lambda$，根据训练数据上的标签几何选择教师模型，二者均在生成器训练之前确定。在两个数据集上，教师选择与下游结果一致，且方法在跨度八倍的 $\lambda$ 范围内有效。
3. 在所测试数据集上，适配器与在线生成器对齐和自编码器适配相比具有竞争力，在各适配方法中表现出最低的跨随机种子领域 FID 方差，产生更强的反事实编辑；其参数量比 REPA 的投影头少 405 倍，计算成本远低于自编码器微调。
4. 表明仅有可逆性并不充分：缺少 Lipschitz 控制的可逆映射会接近秩亏并造成生成失败；只适配干净数据端点而不适配整条流路径，虽可获得较好的单次结果，却缺乏稳定性。

**图 1：** 语义潜空间适配。上部：在冻结自编码器缓存的潜变量 $z$ 上离线训练可逆适配器 $g_\theta$，最大化适配潜变量与冻结语义教师 $\phi(x)$ 之间的线性 CKA。双 Lipschitz 约束限制潜空间几何畸变，$g_\theta^{-1}$ 返回解码器所需坐标。下部：适配器冻结后，在适配潜空间中训练并采样流匹配模型。整个噪声路径经过 $g_\theta$ 推前，因而源分布变为 $g_{\theta\#}\mathcal N(0,I)$；生成潜变量经逆变换后送入解码器。

## 2. 相关工作

已有研究主要通过修改编码器—解码器组合、对齐生成器内部表征或者变换现有潜空间来改进潜空间生成。本文研究第三类方法，并额外要求变换可逆且具有良好的数值条件。

**潜空间生成的语义对齐。** Yao et al.（2025）和 Xu et al.（2025）分别在 VA-VAE 与 ReaLS 中使用语义先验训练视觉 tokenizer；EQ-VAE 则采用等变正则化微调自编码器（Kouzelis et al., 2025）。另一些方法不改变 VAE。典型代表 REPA 在生成器训练期间将去噪器的中间状态与冻结视觉编码器的特征对齐（Yu et al., 2025）。Singh et al.（2025）进一步修改 REPA，强调教师特征的空间结构。与上述方法不同，本文同时保持 VAE 和流匹配目标不变。

**可逆潜空间变换。** 可逆神经网络主要有几类架构：耦合层（Dinh et al., 2015；2017；Kingma & Dhariwal, 2018）、自回归映射（Kingma et al., 2016；Papamakarios et al., 2017）、可逆残差块（Behrmann et al., 2019；Chen et al., 2019）以及连续时间流（Grathwohl et al., 2019）。多数方法作为归一化流训练，其中可逆性是计算目标函数的必要条件，因为最大似然包含变量变换项 $\log|\det J|$，映射必须可逆且其 Jacobian 行列式可处理。这类映射可用于构造更丰富的变分后验，或拟合预训练自编码器潜变量的分布；本质上是把一个分布输运至另一个分布。

本文中的可逆映射并不是密度模型，而是可逆的潜变量坐标变换。适配器使编码潜变量与语义教师对齐，其逆变换则将生成潜变量映射回冻结解码器熟悉的坐标。由于目标并不要求无限制的输运，因此可以约束映射接近等距变换，以限制原有潜空间的几何畸变。为此，本文使用可逆残差块，并同时控制伸展和收缩。相关研究使用相互独立的 Lipschitz 上下界为单调残差层提供保证，而本文将二者联系起来，用一个标量表征畸变预算。

## 3. 问题设置

**记号。** $\|\cdot\|$ 表示欧氏范数。对可微映射 $g:\mathbb R^m\to\mathbb R^m$，$J_g(z)$ 是 $z$ 处的 Jacobian，奇异值为 $\sigma_1(J_g(z))\ge\cdots\ge\sigma_m(J_g(z))\ge0$；当最小奇异值大于零时，条件数为 $\kappa(J_g)=\sigma_1/\sigma_m$。$\sigma$ 专指奇异值，$t$ 为流匹配路径参数；$g_\#p$ 表示测度 $p$ 在映射 $g$ 下的推前（pushforward）。

**潜变量。** 令 $E:\mathbb R^{H\times W\times3}\to\mathbb R^{C\times h\times w}$ 为预训练编码器，$D$ 为对应解码器。将潜空间 $Z$ 视为 $\mathbb R^m$，其中 $m=Chw$，并对展开后的潜变量张量采用欧氏范数。缓存数据为 $\{(z_i,y_i)\}_{i=1}^{N}$，其中 $z_i=E(x_i)$，$y_i$ 为单一类别标签。

**语义教师。** 冻结图像编码器 $\phi$ 提供语义参照。适配器的目标使用教师的全局图像嵌入 $\phi(x)\in\mathbb R^d$，即每幅图像对应一个向量，比较的是图像整体。与之相比，REPA、VA-VAE、ReaLS 等空间对齐基线使用教师的 patch 网格 $\phi(x)\in\mathbb R^{d\times h'\times w'}$，逐位置对齐潜变量或隐藏状态特征。

**双 Lipschitz 映射。** 若映射 $f:\mathbb R^m\to\mathbb R^m$ 对所有 $x,y$ 满足

$$
\mu\|x-y\|\le\|f(x)-f(y)\|\le\nu\|x-y\|,
\quad 0<\mu\le\nu,\tag{1}
$$

则称 $f$ 为 $(\mu,\nu)$-双 Lipschitz 映射。下界确保单射性，上界限制畸变。当 $\mu=\nu=1$ 时，该映射为等距变换；两者接近 1 时，映射近似等距。可微双 Lipschitz 映射的 Jacobian 在每一点均满足最小奇异值不小于 $\mu$、最大奇异值不大于 $\nu$。对于整个 $\mathbb R^m$ 上的 $C^1$ 微分同胚，这一条件也可反过来推出双 Lipschitz 性质。

**中心化核对齐。** 对 $n$ 幅图像，以 $P$ 表示将适配后的潜变量张量转化为单幅图像特征向量的操作，构造以 $P(g_\theta(z_i))$ 为行的矩阵 $X\in\mathbb R^{n\times p}$，以及以教师特征 $\phi(x_i)$ 为行的矩阵 $Y\in\mathbb R^{n\times q}$，对二者逐列中心化。Gram 矩阵 $K=XX^\top$ 和 $L=YY^\top$ 的各个元素对应两幅图像在适配器或教师看来有多相似。线性 CKA 为两种相似度模式之间的余弦：

$$
\mathrm{CKA}(X,Y)=\frac{\langle K,L\rangle_F}{\|K\|_F\|L\|_F},
\qquad \langle K,L\rangle_F=\sum_{i,j}K_{ij}L_{ij}.\tag{2}
$$

当两空间对全部图像对的相似性判断一致时，该值为 1；当两种相似度模式不相关时，该值为 0。

**流匹配。** 流匹配沿给定概率路径回归速度场。对于 FLUX 类型模型，采用插值 $z_t=(1-t)z+t\epsilon$，$\epsilon\sim\mathcal N(0,I)$，$t$ 由流匹配调度器采样。因此，$t=0$ 对应干净潜变量，回归目标为 $\epsilon-z$。

## 4. 方法

### 4.1 总体方法

方法如图 1 所示：首先训练可逆适配器 $g_\theta$，使潜空间与教师 $\phi$ 的嵌入在语义上对齐。训练流匹配时，冻结的 $g_\theta$ 将缓存的原始潜变量映射到适配坐标；推理时，$g_\theta^{-1}$ 将生成潜变量带回解码器所需的坐标：

$$
z=E(x),\qquad \widetilde z=g_\theta(z),\qquad
x\approx D(g_\theta^{-1}(\widetilde z)).\tag{3}
$$

适配器不改变潜变量维数，精确求逆时，重建映射与原始的 $D\circ E$ 相同。根据式（1），它满足 $\mu=e^{-\lambda}$、$\nu=e^\lambda$ 的双 Lipschitz 条件，因此可以旋转、弯曲和缩放潜空间，但任意距离的伸展或收缩倍数均不超过 $e^\lambda$。单一标量 $\lambda$ 便决定了允许的几何变化幅度。

### 4.2 利用教师对齐潜变量

对缓存潜变量进行语义对齐时，用 $P$ 将空间潜变量张量映射为每幅图像一个向量，主要优化目标为

$$
\mathcal L_{\mathrm{CKA}}
=1-\mathrm{CKA}\big(P(g_\theta(z)),\phi(x)\big).\tag{4}
$$

本文使用两种 $P$：Pool 0 将完整适配潜变量展平（$32\times64\times64=131{,}072$ 维）；Pool 8 先平均池化到 $8\times8$ 网格，再展平（2,048 维），以便在比较前舍弃精细空间细节。线性 CKA 比较中心化 Gram 矩阵，因此关注样本之间的关系结构，而不依赖各特征向量的各向同性尺度。这适合没有共享坐标系统的两种表征空间。

### 4.3 畸变预算

仅靠可逆性仍然不够。缺少约束的可逆映射可能严重改变原空间，破坏重要结构，使表征几乎无法使用。无约束对照实验确实呈现了这种失效：估计的最大奇异值超过 360，归一化参与率低于 0.013（表 7）。

因此，本文将可逆残差块与采用 Cayley 参数化的正交混合层交替组合，构成 $g_\theta$。各残差块写为 $B_i(x)=c_ix+r_i(c_ix)$，其中 $c_i=\cosh\lambda_i$，且 $\mathrm{Lip}(r_i)\le\tanh\lambda_i<1$。$r_i$ 是一个小型空间卷积堆栈，通过将各权重重缩放到给定范数来约束 Lipschitz 常数。因此，该常数具有闭式表达，在训练任意阶段均成立，无需另外运行认证过程。根据可逆残差块的压缩映射论证，每个块都是 $\mathbb R^m$ 上的双射，上下界为 $c_i(1\pm\tanh\lambda_i)=e^{\pm\lambda_i}$。正交混合层是等距映射，所以整体组合满足式（1），其中

$$
\mu=e^{-\lambda},\qquad \nu=e^\lambda,\qquad
\lambda=\sum_i\lambda_i\ge0.\tag{5}
$$

因此，增大 $\lambda$ 可以允许更大的压缩或伸展。命题 1 和 2 证明了式（5），架构细节见附录 A。本文采用闭式界而非更紧的认证界，是因为映射作用于 $C\times h\times w$ 张量，界必须能在多个卷积之间组合；每个样本都要在采样循环中求逆，而求逆应保持简单的不动点迭代；预算本身被用作保护原始潜空间性质的约束，因而保守的上界并非问题。

**根据数据选择 $\lambda$。** 畸变预算必须足够大，使适配器能够再现教师对样本相对距离的判断。考虑由教师排序的三元组，记原潜空间的距离比为 $\rho_z=d_z(i,j)/d_z(i,k)$，教师距离比为 $\rho_\phi=d_\phi(i,j)/d_\phi(i,k)\le1$。为了在该三元组上达到教师的相对距离，必要条件为

$$
\lambda\ge\frac12\max\{0,\log\rho_z-\log\rho_\phi\}.\tag{6}
$$

该条件对每个三元组是局部必要条件。每个数据集采样 1,500 个锚点、每个锚点 20 个教师近邻及 20 个随机候选，式（6）右侧的第 99 百分位均约为 0.5，三个采样种子之间变化不足 0.01。因此，两个数据集均取 $\lambda=0.5$，覆盖 99.3% 与 98.5% 的采样三元组，对应 $\mu=0.607$、$\nu=1.649$。第 5.5 节还比较 $\lambda\in\{0.25,0.5,1.0,2.0\}$，说明方法在整个范围内均有效。

### 4.4 适配坐标中的流匹配

冻结适配器之后，还需确定如何将其引入流匹配路径。设 $h_\theta=N\circ g_\theta$，其中 $N$ 是第 5.1 节中的固定预处理。$N$ 不是本文学习的适配器的一部分，也不包含在其双 Lipschitz 认证中。令 $z$ 为干净潜变量，$\epsilon\sim\mathcal N(0,I)$，路径参数 $t=0$ 对应干净端点，$z_t=(1-t)z+t\epsilon$。

本文主要采用整条路径的推前：

$$
x_t=h_\theta(z_t),\qquad
u_t=J_{h_\theta}(z_t)(\epsilon-z).\tag{7}
$$

这将整个参考路径传输到冻结适配器和固定预处理构成的坐标系统中。干净端点为 $h_\theta(z)$，源端点为 $x_1=h_\theta(\epsilon)$，其分布为 $(h_\theta)_\#\mathcal N(0,I)$。因此，源分布、目标分布和全部中间状态都以 $h_\theta$ 诱导的坐标表示，相应的速度通过前向模式 Jacobian—向量积（JVP）求得。命题 3 给出了固定预处理之前适配器部分的速度范数界。

作为消融实验，还考虑端点插值：

$$
x_t=(1-t)h_\theta(z)+t\epsilon,\qquad
u_t=\epsilon-h_\theta(z).\tag{8}
$$

该方式只对干净端点进行适配，同时保留标准高斯源。两者均为有效的流匹配目标，并在 $t=0$ 具有相同的适配目标分布，但源分布、中间几何及回归目标各不相同（见表 4）。

## 5. 实验

### 5.1 设置与评价

**数据集。** 主数据集是从 MIMIC-CXR 中筛选的单标签子集，包含 8 类疾病，训练、验证和测试样本数分别为 66,586、8,261 和 8,361。另一医学影像模态为 CT-RATE 的单标签切片划分，包含 15 类疾病，训练、验证和测试样本数分别为 13,309、2,229 和 6,767。两个数据集的类别分布均具有明显的长尾特征。

**指标。** 使用 Fréchet Inception Distance（FID）衡量样本质量，用 Image Retrieval Score（IRS）衡量多样性。为兼顾医学影像真实性与一般视觉保真度，分别在领域特定和领域无关的特征空间中计算这些指标。MIMIC-CXR 使用 CheXNet 风格的 DenseNet-121 特征提取器，CT-RATE 使用在其训练集上训练的 DenseNet-121；一般视觉特征采用 DINOv2。下游效用通过“以合成数据训练、以真实数据测试”（TSTR）评价，使用合成图像训练 DenseNet-121，并在真实测试集上评估。鉴于数据长尾分布，报告宏平均 F1 和平衡准确率。反事实编辑使用 TorchXRayVision DenseNet-121 作为评价器，以 LPIPS 和非目标诊断改变来衡量编辑的最小改动程度，并以目标类别真实图像的 FID 衡量真实性。

**训练与推理。** 模型采用 FLUX.2 潜变量进行训练，因为已有研究指出，它们在所比较的表征中具有最好的综合可学习性。适配器训练 200 个 epoch，这是一个较粗略的经验选择，因为损失通常只经过几个 epoch 就会饱和。不过，适配训练代价较低：适配器只有 36,871 个参数，比 REPA 投影头少约 405 倍；即使训练 200 个 epoch，计算成本仍低于微调整个自编码器 5 个 epoch 的 VA-VAE 和 10 个 epoch 的 ReaLS。流匹配训练之前，所有潜变量表征（包括未适配基线）都使用训练缓存统计量，按通道中心化并缩放至标准差 0.5。解码之前逆转该固定仿射预处理，再应用 $g_\theta^{-1}$。

MIMIC-CXR 上的流匹配训练为 10 个 epoch；CT-RATE 样本量较少，因此训练 30 个 epoch。每个模型使用随机种子 0、1、2，不使用 classifier-free guidance。每个流匹配种子对应生成三个不同随机种子、类别均衡、各 50,000 张图像的集合，分别用于特征评价及 TSTR 训练。

### 5.2 主要结果

表 1 将适配器与未经修改的潜空间、REPA 在线对齐和三种自编码器适配方案进行比较。没有任何方法在全部列都取得最佳值，但本文适配器是在两个数据集的几乎全部指标上均位列前两名的唯一方法。在 CT-RATE 上，该方法四个特征指标均为最佳，使 CT-FID 从 20.23 降至 15.46、DINOv2 FID 从 186.9 降至 111.9，同时达到并列最佳平衡准确率。在 MIMIC-CXR 上，该方法在 DINOv2 特征空间表现最好，在领域特征空间位居第二，VA-VAE 则领先；REPA 的合成数据训练指标最好。不过，VA-VAE 和 REPA 的优势未能迁移到 CT-RATE：VA-VAE 未能改善相对未适配基线的 CT-FID，REPA 的宏平均 F1 反而更低。自编码器适配方法的稳定性也较差，ReaLS 在两个数据集的 DINOv2 FID 上均退化，而完整微调在 MIMIC-CXR 的三个运行中有一次发散。

在 MIMIC-CXR 上，本适配器也是最稳定的方法：跨流匹配随机种子的 CXR-FID 标准差为 0.69，未适配时为 7.50，REPA 和 VA-VAE 约为 2.9；DINOv2 FID 标准差为 0.84，而其他方法均至少为 6.90。图 3 说明，无论评价生成质量还是下游指标，相对于均值的波动也具有类似特征。

**表 1：生成质量与 TSTR 效用（均值 ± 三个流匹配种子的样本标准差）**

| 数据集 | 方法 | 领域 FID↓ | DINOv2 FID↓ | 领域 IRS↑ | DINOv2 IRS↑ | bAcc↑ | 宏 F1↑ |
|---|---|---:|---:|---:|---:|---:|---:|
| MIMIC-CXR | 不适配 | 20.16±7.50 | 28.09±13.74 | .315±.103 | .412±.115 | .557±.021 | .168±.046 |
| MIMIC-CXR | REPA | 19.34±2.90 | 26.13±9.16 | .331±.060 | .430±.111 | .590±.012 | .233±.010 |
| MIMIC-CXR | VA-VAE | 15.05±2.92 | 23.56±9.07 | .414±.063 | .463±.089 | .563±.024 | .179±.032 |
| MIMIC-CXR | ReaLS | 19.05±1.35 | 185.59±6.90 | .207±.018 | .121±.002 | .544±.005 | .094±.014 |
| MIMIC-CXR | 完整 VAE 微调 | 39.32±34.49 | 441.29±708.44 | .239±.184 | .262±.216 | .570±.023 | .210±.024 |
| MIMIC-CXR | CKA 适配器 | 17.87±.69 | 22.27±.84 | .353±.010 | .478±.010 | .570±.009 | .194±.017 |
| CT-RATE | 不适配 | 20.23±.16 | 186.9±7.0 | .865±.008 | .558±.019 | .528±.011 | .084±.013 |
| CT-RATE | REPA | 20.15±3.59 | 143.8±66.6 | .865±.032 | .670±.201 | .526±.017 | .071±.025 |
| CT-RATE | VA-VAE | 20.67±6.19 | 168.0±83.4 | .863±.066 | .636±.182 | .526±.011 | .087±.028 |
| CT-RATE | ReaLS | 97.78±6.89 | 359.3±36.0 | .448±.012 | .355±.048 | .521±.005 | .051±.009 |
| CT-RATE | 完整 VAE 微调 | 26.38±2.56 | 245.7±20.7 | .807±.018 | .480±.039 | .526±.008 | .092±.018 |
| CT-RATE | CKA 适配器 | 15.46±1.38 | 111.9±39.2 | .890±.024 | .745±.094 | .528±.009 | .086±.023 |

表注：领域 FID 在 MIMIC-CXR 上使用 CheXNet 特征及训练集，在 CT-RATE 上使用 CT 领域 DenseNet-121 特征及测试集；DINOv2 使用 ViT-B/14 特征。IRS 按真实测试集归一化；TSTR 在 50,000 张类别均衡的合成图像上训练 DenseNet-121，并在真实测试集上评估。

### 5.3 反事实可控性

为检验反事实生成的可控性，按照既有方法将真实图像的潜变量沿学习到的流反演，再在目标类别条件下进行反向积分并解码。表 2 在 MIMIC-CXR 上评价两种干预：为“无异常”胸片增加一项病灶，以及从患病胸片中移除病灶。评价器为 TorchXRayVision 分类器，既没有参与生成器训练，也没有参与教师训练。适配器在两种方向上均实现更强的编辑：添加病灶时目标概率平均变化为 0.192，而无适配时为 0.172；移除病灶时分别为 0.113 与 0.098。适配后的结果也更接近真实目标类别图像（图 2）。不过，更强的编辑同时改变了更多非目标内容，LPIPS 和非目标发现变化均略高。因此，适配器以部分选择性为代价获得更高的编辑强度。与生成质量类似，其跨种子的波动约为基线的一半。

**表 2：MIMIC-CXR 上的反事实编辑（均值 ± 标准差）**

| 干预 | 目标概率变化↑ | 非目标变化↓ | LPIPS↓ | FID↓ |
|---|---:|---:|---:|---:|
| 添加：不适配 | .172±.035 | .149±.028 | .068±.013 | 2.42±.31 |
| 添加：本文方法 | .192±.017 | .168±.012 | .086±.010 | 2.22±.12 |
| 移除：不适配 | .098±.016 | .106±.016 | .078±.014 | .89±.11 |
| 移除：本文方法 | .113±.008 | .121±.005 | .097±.005 | .74±.05 |

**图 2：** 表 2 反事实编辑的效果与目标真实性。点表示三个流匹配种子的均值，误差棒表示一个样本标准差；适配器提高了目标概率，并降低了添加和移除操作的目标类别 FID。

### 5.4 教师选择

语义教师决定了适配器施加何种语义结构。因此，本文在训练任何生成器之前，仅根据训练数据确定教师（附录 C.1、表 9）。MedImageInsight 在 MIMIC-CXR 上略有领先，MedSigLIP 则在 CT-RATE 上明显领先，生成器结果反映了这两种差距。在 MIMIC-CXR 上，将 MedImageInsight 替换为 MedSigLIP，表 3 的所有指标仍处于一个随机种子标准差范围内；但在 CT-RATE 上，如果改用 MedImageInsight（生成种子 0），CT-FID 会从 15.46 升至 19.13，宏平均 F1 约减半，从 0.086 降至 0.046。将适配潜变量池化到 $8\times8$ 后再计算 CKA，可将平均 CXR-FID 降至 14.13，但种子间离散程度约增大三倍。

**表 3：MIMIC-CXR 教师与池化策略消融**

| 教师 | 池化 | FID↓ | IRS↑ | bAcc↑ | 宏 F1↑ |
|---|---:|---:|---:|---:|---:|
| MedImageInsight | 8 | 14.13±2.00 | .524±.046 | .567±.017 | .183±.043 |
| MedSigLIP | 0 | 18.00±.53 | .478±.021 | .574±.016 | .185±.028 |
| MedImageInsight | 0 | 17.87±.69 | .478±.010 | .570±.009 | .194±.017 |

这里 Pool 0 在展平后的全部潜变量上计算 CKA，Pool 8 先平均池化到 $8\times8$；其余实验默认采用 MedImageInsight、Pool 0、$\lambda=0.5$ 和推前路径。

### 5.5 消融与分析

**流匹配路径。** 端点插值的平均 CXR-FID 比推前路径更低，但其跨流匹配种子的标准差几乎增大十倍，并且下游两项指标都更差（表 4）。使源分布和全部中间状态保持在适配坐标中，是获得可重复结果的关键，因此本文其余实验均采用推前路径。

**表 4：MIMIC-CXR 上的流匹配路径**

| 路径 | CXR-FID↓ | bAcc↑ | 宏 F1↑ |
|---|---:|---:|---:|
| 仅端点适配 | 15.94±6.69 | .565±.021 | .173±.034 |
| 整条路径推前 | 17.87±.69 | .570±.009 | .194±.017 |

**畸变预算与求逆成本。** 表 5 扫描了第 4.3 节估计值附近的 $\lambda$。从 0.25 到 2 的全部预算均得到可比较的结果，CXR-FID 介于 11.45 和 17.22 之间；下游分数没有超出表 1 种子波动范围的明确趋势。因此，除了基于三元组进行初始估计之外，畸变预算不需要额外调节。适配器对单个样本求逆只需 0.69 ms，占生成过程的 0.075%，往返重建误差为 $4.3\times10^{-6}$（表 8）。

**表 5：MIMIC-CXR 畸变预算消融**

| $\lambda$ | 认证区间 $[\mu,\nu]$ | FID↓ | IRS↑ | F1↑ |
|---|---|---:|---:|---:|
| 0.25 | [.779,1.284] | 11.45 | .518 | .189 |
| 1.00 | [.368,2.718] | 17.22 | .477 | .137 |
| 2.00 | [.135,7.389] | 16.48 | .483 | .173 |
| 0.50 | [.607,1.649] | 12.48 | .570 | .123 |

上述扫描固定使用 MedImageInsight、Pool 8、流匹配与生成随机种子 0；$\lambda=0.5$ 在扫描之前已经确定。

**适配器结构。** 表 6 将本文残差适配器替换为耦合流。其条件网络经过范数控制的耦合结构能够达到相近性能，而条件网络不受约束的耦合结构虽然仍然可逆，却在生成任务上失败，CXR-FID 介于 58.8 和 724.4 之间，IRS 接近零。表 7 说明其中原因：不受约束的映射在某些方向上会产生超过 360 倍的伸展，并接近秩亏；而经过认证的适配器实际局部伸展幅度不超过约 6%。因此，受控耦合结构也能够工作，但只有残差适配器对完整映射提供了明确的解析证书。

**表 6：MIMIC-CXR 上的适配器结构比较**

| 映射 | 条件网络 | FID↓ | IRS↑ | bAcc↑ | F1↑ |
|---|---|---:|---:|---:|---:|
| 加性耦合 | 受控 | 19.63 | .415 | .582 | .210 |
| 仿射耦合 | 受控 | 17.13 | .477 | .576 | .210 |
| 有理二次样条耦合 | 受控 | 113.98 | .006 | .520 | .113 |
| 加性耦合 | 自由 | 102.38 | .005 | .524 | .124 |
| 仿射耦合 | 自由 | 58.83 | .031 | .508 | .031 |
| 有理二次样条耦合 | 自由 | 724.44 | .000 | .503 | .029 |
| 本文残差块 | 有认证 | 18.33 | .464 | .572 | .202 |

**表 7：八个验证锚点的局部 Jacobian 指标**

| 映射 | 认证界 | 最大奇异值估计 | 参与率 PR |
|---|---|---:|---:|
| 认证残差 | [.607,1.649] | 1.042–1.056 | .9997 |
| 自由仿射耦合 | 无 | 363.2 | .0076 |
| 自由残差 | 无 | 1473.9 | .0121 |

**表 8：单样本适配器耗时和数值求逆误差**

| 测量量 | 数值 |
|---|---:|
| 正向映射 | 0.40 ms |
| 逆映射 | 0.69 ms |
| 往返误差 | $4.3\times10^{-6}$ |
| 占生成时间比例 | 0.075% |

**图 3：** 三个 MIMIC-CXR 流匹配种子间的相对波动，柱高为样本标准差与均值之比。推前路径在 CXR-FID、平衡准确率和宏平均 F1 三个指标上均比端点插值、无适配以及两个 VAE 基线更稳定，但 REPA 的宏平均 F1 相对波动更低。

## 6. 讨论

结果说明，对潜变量坐标进行一次小规模、冻结的修改，能够与重新训练自编码器或者修改生成器训练的方法竞争，同时比其他适配方法具有更好的种子稳定性。本文方法有三个实用特征：第一，只有一个意义明确的超参数，即畸变预算 $\lambda$；它可在训练前从数据估计，并在八倍跨度范围内有效。第二，语义教师也可仅根据训练数据选择，而且两个数据集上的选择均与下游结果一致。第三，适配器代价低：只需几 GPU 小时拟合一次，便可供每次流匹配训练复用，单次求逆耗时不到一毫秒，并且不修改自编码器和流匹配损失。消融实验说明了稳定性来自何处：缺少 Lipschitz 控制的可逆映射仍可能接近秩亏，导致生成失败；仅调整干净端点虽然偶尔取得不错结果，但不稳定。双向约束畸变，并让整条路径保持在适配坐标中，才能使提升具有可重复性。

**局限性。** 本文按照推荐设置并采用医学教师实现了自编码器适配基线，但更多的调参可能增强部分基线——尽管避免这种调参成本本身也是本文方法的优点。适配器只能注入语义教师本来就具有的结构，因此依赖教师是否能在目标领域形成良好的标签几何，CT-RATE 教师比较反映了这一点。最后，尽管反事实编辑强度更高，但非目标内容改变也略多，所以其主要优点是增强编辑强度。

## 7. 结论

本文引入一种可逆、双 Lipschitz 适配器，在线下将预训练潜变量与语义教师对齐，并在流匹配训练中保持冻结。在 MIMIC-CXR 和 CT-RATE 上，它与生成器对齐及自编码器适配方法相比具有竞争力，跨随机种子更稳定，成本仅为后者的一小部分。其唯一的超参数可由数据估计，教师模型也可以在任何生成器训练前选定。因此，受约束的事后适配提供了一种简明途径，无需重新训练自编码器或者修改生成目标，就能提高固定潜空间的可学习性。

## 致谢与复现声明

作者感谢埃尔朗根—纽伦堡大学国家高性能计算中心 NHR@FAU 在 NHR 项目 b180dc 下提供科研支持与高性能计算资源；NHR 由德国联邦和巴伐利亚州政府支持，其部分硬件由德国研究基金会 DFG 项目 440719683 资助。

原文第 5.1 节提供了复现主要实验所需的设置；补充材料还提供代码、环境复现脚本和实验表格。适配器架构的细节见附录 A，主要论断的证明见附录 B。

## 参考文献（保留原文英文书目）

以下为原 PDF 的参考文献目录，保留英文作者、题名、会议/期刊及链接。PDF 的自动提取可能保留原版换行，正式引用时请核对原始 PDF。

Alexander Alemi, Ben Poole, Ian Fischer, Joshua Dillon, Rif A. Saurous, and Kevin Murphy. Fixing
a broken ELBO. In Jennifer Dy and Andreas Krause (eds.), Proceedings of the 35th International
Conference on Machine Learning, volume 80 of Proceedings of Machine Learning Research,
pp. 159–168. PMLR, 10–15 Jul 2018. URL https://proceedings.mlr.press/v80/
alemi18a.html.
Jens Behrmann, Will Grathwohl, Ricky T. Q. Chen, David Duvenaud, and Joern-Henrik Jacobsen.
Invertible residual networks. In Kamalika Chaudhuri and Ruslan Salakhutdinov (eds.), Proceedings
of the 36th International Conference on Machine Learning, volume 97 of Proceedings of Machine
Learning Research, pp. 573–582. PMLR, 09–15 Jun 2019. URL https://proceedings.
mlr.press/v97/behrmann19a.html.
Black Forest Labs. Representation comparison. https://bfl.ai/research/
representation-comparison, 2025. Accessed: 2026-09-15.
Vanessa Bohm and Uro ¨ s Seljak. Probabilistic autoencoder. ˇ Transactions on Machine Learning
Research, 2022. doi: 10.48550/ARXIV.2006.05479. URL https://openreview.net/
forum?id=AEoYjvjKVA.
Alican Bozkurt, Babak Esmaeili, Jean-Baptiste Tristan, Dana Brooks, Jennifer Dy, and Jan-Willem
van de Meent. Rate-regularization and generalization in variational autoencoders. In Arindam
Banerjee and Kenji Fukumizu (eds.), Proceedings of The 24th International Conference on Artifi￾cial Intelligence and Statistics, volume 130 of Proceedings of Machine Learning Research, pp.
3880–3888. PMLR, 13–15 Apr 2021. URL https://proceedings.mlr.press/v130/
bozkurt21a.html.
Ricky T. Q. Chen, Jens Behrmann, David Kristjanson Duvenaud, and Jorn-Henrik Jacobsen. Residual ¨
flows for invertible generative modeling. ArXiv, abs/1906.02735, 2019. URL https://api.
semanticscholar.org/CorpusID:174801267.
Noel C. F. Codella, Ying Jin, Shrey Jain, Yu Gu, Ho Hin Lee, Asma Ben Abacha, Alberto Santamaria￾Pang, Will Guyman, Naiteek Sangani, Sheng Zhang, Hoifung Poon, Stephanie Hyland, Shruthi
Bannur, Javier Alvarez-Valle, Xue Li, John Garrett, Alan McMillan, Gaurav Rajguru, Madhu
Maddi, Nilesh Vijayrania, Rehaan Bhimai, Nick Mecklenburg, Rupal Jain, Daniel Holstein, Naveen
Gaur, Vijay Aski, Jenq-Neng Hwang, Thomas Lin, Ivan Tarapov, Matthew Lungren, and Mu Wei.
Medimageinsight: An open-source embedding model for general domain medical imaging, 2024.
URL https://arxiv.org/abs/2410.06542.
Joseph Paul Cohen, Joseph D. Viviano, Paul Bertin, Paul Morrison, Parsa Torabian, Matteo Guarrera,
Matthew P Lungren, Akshay Chaudhari, Rupert Brooks, Mohammad Hashir, and Hadrien Bertrand.
TorchXRayVision: A library of chest X-ray datasets and models. In Medical Imaging with Deep
Learning, 2022. URL https://github.com/mlmed/torchxrayvision.
Corentin Dancette, Julien Khlaut, Antoine Saporta, Helene Philippe, Elodie Ferreres, Baptiste
Callard, Theo Danielou, L ´ eo Alberge, L ´ eo Machado, Daniel Tordjman, et al. Curia: A multi-modal ´
foundation model for radiology. arXiv preprint arXiv:2509.06830, 2025.
Laurent Dinh, David Krueger, and Yoshua Bengio. Nice: Non-linear independent components
estimation, 2015. URL https://arxiv.org/abs/1410.8516.
Laurent Dinh, Jascha Sohl-Dickstein, and Samy Bengio. Density estimation using real NVP. In
International Conference on Learning Representations, 2017. URL https://openreview.
net/forum?id=HkpbnH9lx.
Mischa Dombrowski, Weitong Zhang, Sarah Cechnicka, Hadrien Reynaud, and Bernhard Kainz.
Image generation diversity issues and how to tame them. In Proceedings of the IEEE/CVF
Conference on Computer Vision and Pattern Recognition (CVPR), pp. 3029–3039, June 2025.
Mischa Dombrowski, Felix Nutzel, and Bernhard Kainz. The learnability gap in medical latent ¨
diffusion, 2026. URL https://arxiv.org/abs/2605.17087.
Conor Durkan, Artur Bekasov, Iain Murray, and George Papamakarios. Neural spline flows.
In H. Wallach, H. Larochelle, A. Beygelzimer, F. d'Alche-Buc, E. Fox, and R. Gar- ´
nett (eds.), Advances in Neural Information Processing Systems, volume 32. Curran Asso￾ciates, Inc., 2019. URL https://proceedings.neurips.cc/paper_files/paper/
2019/file/7ac71d433f282034e088473244df8c02-Paper.pdf.
Will Grathwohl, Ricky T. Q. Chen, Jesse Bettencourt, and David Duvenaud. Scalable reversible
generative models with free-form continuous dynamics. In International Conference on Learning
Representations, 2019. URL https://openreview.net/forum?id=rJxgknCcK7.
Ibrahim Ethem Hamamci, Sezgin Er, Chenyu Wang, Furkan Almas, Ayse Gulnihan Simsek, Sevval Nil
Esirgun, Irem Dogan, Omer Faruk Durugol, Benjamin Hou, Suprosanna Shit, et al. Generalist
foundation models from a multimodal dataset for 3d computed tomography. Nature Biomedical
Engineering, pp. 1–19, 2026.
Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter.
Gans trained by a two time-scale update rule converge to a local nash equilibrium, 2018. URL
https://arxiv.org/abs/1706.08500.
Gao Huang, Zhuang Liu, Laurens van der Maaten, and Kilian Q. Weinberger. Densely connected
convolutional networks. In Proceedings of the IEEE Conference on Computer Vision and Pattern
Recognition (CVPR), July 2017.
Alistair E. W. Johnson, Tom J. Pollard, Seth J. Berkowitz, Nathan R. Greenbaum, Matthew P.
Lungren, Catherine Y. Deng, Roger G. Mark, and Steven Horng. Mimic-cxr, a de-identified
publicly available database of chest radiographs with free-text reports. Scientific Data, 6(1):317,
2019. doi: 10.1038/s41597-019-0322-0.
Diederik P. Kingma and Max Welling. Auto-encoding variational bayes. CoRR, abs/1312.6114, 2013.
URL https://api.semanticscholar.org/CorpusID:216078090.
Diederik P. Kingma, Tim Salimans, and Max Welling. Improved variational inference with inverse
autoregressive flow. ArXiv, abs/1606.04934, 2016. URL https://api.semanticscholar.
org/CorpusID:11514441.
Durk P Kingma and Prafulla Dhariwal. Glow: Generative flow with invertible 1x1 convolu￾tions. In S. Bengio, H. Wallach, H. Larochelle, K. Grauman, N. Cesa-Bianchi, and R. Gar￾nett (eds.), Advances in Neural Information Processing Systems, volume 31. Curran Asso￾ciates, Inc., 2018. URL https://proceedings.neurips.cc/paper_files/paper/
2018/file/d139db6a236200b21cc7f752979132d0-Paper.pdf.
Simon Kornblith, Mohammad Norouzi, Honglak Lee, and Geoffrey Hinton. Similarity of neural
network representations revisited. In Kamalika Chaudhuri and Ruslan Salakhutdinov (eds.),
Proceedings of the 36th International Conference on Machine Learning, volume 97 of Proceedings
of Machine Learning Research, pp. 3519–3529. PMLR, 09–15 Jun 2019. URL https://
proceedings.mlr.press/v97/kornblith19a.html.
Theodoros Kouzelis, Ioannis Kakogeorgiou, Spyros Gidaris, and Nikos Komodakis. EQ-VAE:
Equivariance regularized latent space for improved generative image modeling. In Forty-second
International Conference on Machine Learning, 2025. URL https://openreview.net/
forum?id=UWhW5YYLo6.
Yuheng Li, Yuan Gao, Haoyu Dong, Yuxiang Lai, Shansong Wang, Mojtaba Safari, James E. Baciak,
and Xiaofeng Yang. Universal ct representations from anatomy to disease phenotype through
agglomerative pretraining, 2026. URL https://arxiv.org/abs/2605.21906.
Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow
matching for generative modeling. In The Eleventh International Conference on Learning Repre￾sentations, 2023. URL https://openreview.net/forum?id=PqvMRDCJT9t.
Xingchao Liu, Chengyue Gong, and qiang liu. Flow straight and fast: Learning to generate and transfer
data with rectified flow. In The Eleventh International Conference on Learning Representations,
2023. URL https://openreview.net/forum?id=XVjTT1nw5z.
Miguel Monteiro, Fabio De Sousa Ribeiro, Nick Pawlowski, Daniel C. Castro, and Ben Glocker.
Measuring axiomatic soundness of counterfactual image models. In The Eleventh International
Conference on Learning Representations, 2023. URL https://openreview.net/forum?
id=lZOUQQvwI3q.
Maxime Oquab, Timothee Darcet, Theo Moutakanni, Huy V. Vo, Marc Szafraniec, Vasil Khalidov, ´
Pierre Fernandez, Daniel Haziza, Francisco Massa, Alaaeldin El-Nouby, Russell Howes, Po-Yao
Huang, Hu Xu, Vasu Sharma, Shang-Wen Li, Wojciech Galuba, Mike Rabbat, Mido Assran,
Nicolas Ballas, Gabriel Synnaeve, Ishan Misra, Herve Jegou, Julien Mairal, Patrick Labatut,
Armand Joulin, and Piotr Bojanowski. Dinov2: Learning robust visual features without supervision,
2023.
George Papamakarios, Theo Pavlakou, and Iain Murray. Masked autoregressive flow for density
estimation. In I. Guyon, U. Von Luxburg, S. Bengio, H. Wallach, R. Fergus, S. Vishwanathan, and
R. Garnett (eds.), Advances in Neural Information Processing Systems, volume 30. Curran Asso￾ciates, Inc., 2017. URL https://proceedings.neurips.cc/paper_files/paper/
2017/file/6c1da886822c67822bcf3679d04369fa-Paper.pdf.
Pranav Rajpurkar, Jeremy Irvin, Kaylie Zhu, Brandon Yang, Hershel Mehta, Tony Duan, Daisy
Ding, Aarti Bagul, Curtis Langlotz, Katie Shpanskaya, Matthew P. Lungren, and Andrew Y. Ng.
Chexnet: Radiologist-level pneumonia detection on chest x-rays with deep learning, 2017. URL
https://arxiv.org/abs/1711.05225.
Danilo Rezende and Shakir Mohamed. Variational inference with normalizing flows. In Francis Bach
and David Blei (eds.), Proceedings of the 32nd International Conference on Machine Learning,
volume 37 of Proceedings of Machine Learning Research, pp. 1530–1538, Lille, France, 07–09
Jul 2015. PMLR. URL https://proceedings.mlr.press/v37/rezende15.html.
Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Bjorn Ommer. High- ¨
resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF Confer￾ence on Computer Vision and Pattern Recognition (CVPR), pp. 10684–10695, June 2022.
Pedro Sanchez and Sotirios A. Tsaftaris. Diffusion causal models for counterfactual estimation. In
Bernhard Scholkopf, Caroline Uhler, and Kun Zhang (eds.), ¨ Proceedings of the First Conference
on Causal Learning and Reasoning, volume 177 of Proceedings of Machine Learning Research,
pp. 647–668. PMLR, 11–13 Apr 2022. URL https://proceedings.mlr.press/v177/
sanchez22a.html.
Andrew Sellergren, Sahar Kazemzadeh, Tiam Jaroensri, Atilla Kiraly, Madeleine Traverse, Timo
Kohlberger, Shawn Xu, Fayaz Jamil, C´ıan Hughes, Charles Lau, Justin Chen, Fereshteh Mahvar,
Liron Yatziv, Tiffany Chen, Bram Sterling, Stefanie Anna Baby, Susanna Maria Baby, Jeremy Lai,
Samuel Schmidgall, Lu Yang, Kejia Chen, Per Bjornsson, Shashir Reddy, Ryan Brush, Kenneth
Philbrick, Mercy Asiedu, Ines Mezerreg, Howard Hu, Howard Yang, Richa Tiwari, Sunny Jansen,
Preeti Singh, Yun Liu, Shekoofeh Azizi, Aishwarya Kamath, Johan Ferret, Shreya Pathak, Nino
Vieillard, Ramona Merhej, Sarah Perrin, Tatiana Matejovicova, Alexandre Rame, Morgane Riviere, ´
Louis Rouillard, Thomas Mesnard, Geoffrey Cideron, Jean bastien Grill, Sabela Ramos, Edouard
Yvinec, Michelle Casbon, Elena Buchatskaya, Jean-Baptiste Alayrac, Dmitry Lepikhin, Vlad
Feinberg, Sebastian Borgeaud, Alek Andreev, Cassidy Hardin, Robert Dadashi, Leonard Hussenot, ´
Armand Joulin, Olivier Bachem, Yossi Matias, Katherine Chou, Avinatan Hassidim, Kavi Goel,
Clement Farabet, Joelle Barral, Tris Warkentin, Jonathon Shlens, David Fleet, Victor Cotruta,
Omar Sanseviero, Gus Martins, Phoebe Kirk, Anand Rao, Shravya Shetty, David F. Steiner, Can
Kirmizibayrak, Rory Pilgrim, Daniel Golden, and Lin Yang. Medgemma technical report, 2026.
URL https://arxiv.org/abs/2507.05201.
Jaskirat Singh, Xingjian Leng, Zongze Wu, Liang Zheng, Richard Zhang, Eli Shechtman, and Saining
Xie. What matters for representation alignment: Global information or spatial structure? arXiv
preprint arXiv:2512.10794, 2025.
Ivan Skorokhodov, Sharath Girish, Benran Hu, Willi Menapace, Yanyu Li, Rameen Abdal, Sergey
Tulyakov, and Aliaksandr Siarohin. Improving the diffusability of autoencoders. In Forty-second
International Conference on Machine Learning, 2025. URL https://openreview.net/
forum?id=2hEDcA7xy4.
Ruigang Wang, Krishnamurthy Dj Dvijotham, and Ian Manchester. Monotone, bi-lipschitz, and
polyak-Łojasiewicz networks. In Ruslan Salakhutdinov, Zico Kolter, Katherine Heller, Adrian
Weller, Nuria Oliver, Jonathan Scarlett, and Felix Berkenkamp (eds.), Proceedings of the 41st
International Conference on Machine Learning, volume 235 of Proceedings of Machine Learning
Research, pp. 50379–50399. PMLR, 21–27 Jul 2024. URL https://proceedings.mlr.
press/v235/wang24p.html.
Zhisheng Xiao, Qing Yan, and Yali Amit. Generative latent flow. arXiv: Computer Vision and
Pattern Recognition, 2019. URL https://api.semanticscholar.org/CorpusID:
203702623.
Wanghan Xu, Xiaoyu Yue, Zidong Wang, Yao Teng, Wenlong Zhang, Xihui Liu, Luping Zhou, Wanli
Ouyang, and Lei Bai. Exploring representation-aligned latent space for better generation. arXiv
preprint arXiv:2502.00359, 2025.
Jingfeng Yao, Bin Yang, and Xinggang Wang. Reconstruction vs. generation: Taming optimization
dilemma in latent diffusion models. 2025 IEEE/CVF Conference on Computer Vision and Pattern
Recognition (CVPR), pp. 15703–15712, 2025. URL https://api.semanticscholar.
org/CorpusID:275211938.
Sihyun Yu, Sangkyung Kwak, Huiwon Jang, Jongheon Jeong, Jonathan Huang, Jinwoo Shin, and
Saining Xie. Representation alignment for generation: Training diffusion transformers is easier
than you think. In International Conference on Learning Representations, 2025.
Richard Zhang, Phillip Isola, Alexei A Efros, Eli Shechtman, and Oliver Wang. The unreasonable
effectiveness of deep features as a perceptual metric. In CVPR, 2018.
Wentao Zhang, Yutong Zhang, Yuxin Zheng, and Wentao Mo. A general framework for activation
function optimization based on mollification theory. Mathematics, 14(1), 2026. ISSN 2227-7390.
doi: 10.3390/math14010072. URL https://www.mdpi.com/2227-7390/14/1/72.
Boyang Zheng, Nanye Ma, Shengbang Tong, and Saining Xie. Diffusion transformers with represen￾tation autoencoders. In The Fourteenth International Conference on Learning Representations,
2026. URL https://openreview.net/forum?id=0u1LigJaab.

## 附录 A. 适配器的构造

**逐层常数。** 每个残差分支 $r_i$ 由 $1\times1$ 逐点卷积（pointwise convolution）、$3\times3$ 逐通道卷积（depthwise convolution）及交替出现的 SiLU 激活函数组成。对逐点卷积，将其权重矩阵重新缩放到一个固定的 Frobenius 范数，因为 Frobenius 范数给出谱范数的上界；对逐通道卷积，将卷积核重新缩放到固定 $\ell_1$ 范数，由 Young 不等式，该范数是卷积算子诱导范数的一个上界。

记 SiLU 的 Lipschitz 常数为 $L_{\mathrm{SiLU}}\approx1.1$（Zhang et al., 2026）。将每个隐藏卷积的算子范数归一化到不超过 $1/L_{\mathrm{SiLU}}$，使其与后续 SiLU 激活的组合成为 1-Lipschitz 映射。输出卷积的算子范数则约束为不超过 $\tanh\lambda_i$。各层的上界相乘，因此得到

$$
\operatorname{Lip}(r_i)\le\tanh\lambda_i.
$$

这一界通过权重归一化直接保证，不需要幂迭代，并在初始化和每次参数更新后始终成立。

**从 $\mathbb R^m$ 到自身的双射性。** 第 3 节中基于奇异值的刻画需要映射成为从 $\mathbb R^m$ 到其自身的微分同胚，而不是仅仅映射到它在空间中的像，因此单射性还不够。压缩性提供了剩余条件。对任意目标向量 $y$，映射 $u\mapsto y-r_i(u)$ 在 $\mathbb R^m$ 上具有压缩系数 $\tanh\lambda_i<1$。根据 Banach 不动点定理，存在唯一 $u$ 满足 $u+r_i(u)=y$，而 $x=u/c_i$ 满足 $B_i(x)=y$。因此，每个残差块都是 $\mathbb R^m$ 到其自身的双射。经 Cayley 参数化得到的混合矩阵是正交矩阵，因而也是 $\mathbb R^m$ 上的等距双射；它们的组合同时保持可逆性和满射性。

**数值求逆。** 对各残差块，利用上述压缩性质执行不动点迭代 $b\leftarrow y-s\,r_i(b)$，其中 $s$ 为残差块的门控值。最多迭代 50 次，容差为 $10^{-6}$。表 8 给出了实际往返误差与单样本延迟。

## 附录 B. 证明

本附录证明正文第 4 节使用的各项命题。下文 $g_\theta$ 始终表示第 4.3 节的适配器。

### B.1 复合适配器的畸变预算

**命题 1（单个残差块的双 Lipschitz 界）。** 设 $B(x)=cx+r(cx)$，其中 $c>0$ 且 $\operatorname{Lip}(r)\le\gamma<1$。则 $B$ 是一个具有常数 $(c(1-\gamma),c(1+\gamma))$ 的双 Lipschitz 映射。特别地，当 $c=\cosh\lambda$、$\gamma=\tanh\lambda$ 时，双 Lipschitz 界为 $(e^{-\lambda},e^\lambda)$。

**证明。** 令 $u=cx$、$v=cy$，则

$$
B(x)-B(y)=(u-v)+\bigl(r(u)-r(v)\bigr).
$$

由三角不等式及 $\operatorname{Lip}(r)\le\gamma$，

$$
\begin{aligned}
\|B(x)-B(y)\|
&\le\|u-v\|+\gamma\|u-v\|\\
&=c(1+\gamma)\|x-y\|.
\end{aligned}
$$

另一方面，由反三角不等式，

$$
\begin{aligned}
\|B(x)-B(y)\|
&\ge\|u-v\|-\gamma\|u-v\|\\
&=c(1-\gamma)\|x-y\|.
\end{aligned}
$$

由于 $\gamma<1$，下界严格为正。代入指定的 $c$ 和 $\gamma$ 得到

$$
\cosh\lambda(1\pm\tanh\lambda)
=\cosh\lambda\pm\sinh\lambda=e^{\pm\lambda}.
$$

证毕。

**命题 2（复合映射；对应正文式（5））。** 令

$$
g_\theta=Q_{K+1}\circ B_K\circ\cdots\circ B_1\circ Q_1,
$$

其中每个 $B_i$ 都满足命题 1，预算 $\lambda_i\ge0$，而每个 $Q_i$ 都是正交变换。则 $g_\theta$ 是 $(e^{-\lambda},e^\lambda)$-双 Lipschitz 映射，$\lambda=\sum_i\lambda_i$。

**证明。** 若 $f_1$ 是 $(\mu_1,\nu_1)$-双 Lipschitz 映射，$f_2$ 是 $(\mu_2,\nu_2)$-双 Lipschitz 映射，则对全部 $x,y$ 有

$$
\begin{aligned}
\mu_2\mu_1\|x-y\|
&\le\mu_2\|f_1(x)-f_1(y)\|\\
&\le\|f_2(f_1(x))-f_2(f_1(y))\|\\
&\le\nu_2\nu_1\|x-y\|.
\end{aligned}
$$

因而复合映射的上下界分别为各映射对应常数的乘积。正交变换 $Q$ 满足 $\|Qx-Qy\|=\|x-y\|$，只贡献系数 1。将命题 1 所给出的各块常数相乘，即得 $\prod_i e^{\pm\lambda_i}=e^{\pm\sum_i\lambda_i}$。证毕。

**命题 3（推前速度；对应正文式（7））。** 设 $g_\theta$ 可微。则对任意 $z_t$ 和任意 $v\in\mathbb R^m$，有

$$
e^{-\lambda}\|v\|
\le\|J_{g_\theta}(z_t)v\|
\le e^\lambda\|v\|.
$$

特别地，推前速度 $u_t=J_{g_\theta}(z_t)(\epsilon-z)$ 满足

$$
e^{-\lambda}\|\epsilon-z\|
\le\|u_t\|
\le e^\lambda\|\epsilon-z\|.
$$

**证明。** 根据第 3 节的性质，可微的 $(\mu,\nu)$-双 Lipschitz 映射，其 Jacobian 在所有点均满足

$$
\sigma_{\min}(J_{g_\theta}(z))\ge e^{-\lambda},
\qquad
\sigma_{\max}(J_{g_\theta}(z))\le e^\lambda.
$$

以矩阵奇异值对 $\|J_{g_\theta}(z_t)v\|$ 给出上下界，即得结论。证毕。

### B.2 三元组畸变预算

**命题 4（必要预算；对应正文式（6））。** 固定三元组 $(i,j,k)$，记原潜空间的距离比为 $\rho_z=d_z(i,j)/d_z(i,k)$，教师特征空间的距离比为 $\rho_\phi=d_\phi(i,j)/d_\phi(i,k)$。若一个 $(e^{-\lambda},e^\lambda)$-双 Lipschitz 映射 $g_\theta$ 能使适配后的距离满足

$$
\frac{d_{\widetilde z}(i,j)}{d_{\widetilde z}(i,k)}
\le\rho_\phi,
$$

则必须有

$$
\lambda\ge\frac12\max\bigl(0,\log\rho_z-\log\rho_\phi\bigr).
$$

**证明。** 令 $\widetilde z=g_\theta(z)$。由双 Lipschitz 条件，对任意样本对均有

$$
e^{-\lambda}d_z(i,j)
\le d_{\widetilde z}(i,j)
\le e^\lambda d_z(i,j),
$$

而样本对 $(i,k)$ 满足相同形式的上下界。以最小可能的分子除以最大可能的分母，得到适配后距离比的下界：

$$
\frac{d_{\widetilde z}(i,j)}
{d_{\widetilde z}(i,k)}
\ge
\frac{e^{-\lambda}d_z(i,j)}
{e^\lambda d_z(i,k)}
=e^{-2\lambda}\rho_z.
$$

根据假设，上式左侧不超过 $\rho_\phi$，因此 $e^{-2\lambda}\rho_z\le\rho_\phi$，即 $2\lambda\ge\log\rho_z-\log\rho_\phi$。再结合 $\lambda\ge0$，得证。

**备注 5。** 命题 4 只给出必要条件，不给出充分条件。它为单个三元组提供预算下界，但并不保证预算内存在某个映射达到指定距离比，更不能保证同一个映射能够同时满足所有三元组。因此，第 4.3 节通过采样分位数计算的数值应被理解为合理预算的下界参考，而非达到可行性的精确临界点；其敏感性还需要如第 5.5 节那样直接实验验证。

## 附录 C. 教师选择与定性样本

### C.1 教师选择

在训练任何适配器或生成器之前，只使用训练划分中的数据固定各数据集的教师模型。对每个候选教师，在相同的 8,000 张单标签训练图像上（随机种子 0）测量三种嵌入特性。

第一项是**标签几何**，即教师嵌入与独热标签矩阵之间的线性 CKA。分别以 $32\times32$ 像素缩略图（像素基准）和适配器接收的展平 FLUX.2 潜变量为分母报告相对比值。第二种比值量化了相对于潜变量，CKA 对齐目标还能够引入多少标签结构。

第二项是**近邻检索**，即 10 个最近邻中的同类样本比例，排除与查询图像来自同一患者（MIMIC-CXR）或同一扫描体积（CT-RATE）的近邻。只在带有病灶的查询图像上评分，两个数据集分别为 2,083 和 5,191 个查询，随机基线为 0.047 与 0.100。

第三项是**混杂比例**，即近邻中来自同一患者或同一体积的样本比例，数值越低越好。最终选择在标签几何及检索表现上领先的嵌入。表 9 列出所有候选。

**表 9：每个数据集使用 8,000 张训练图像进行教师选择**

| 数据集 | 特征提取方式 | 标签 CKA | 相对像素 | 相对潜变量 | 同类检索↑ | 混杂率↓ |
|---|---|---:|---:|---:|---:|---:|
| MIMIC | 32×32 像素 | 0.023 | 1.00 | 0.71 | 0.076 | 0.002 |
| MIMIC | MedSigLIP，池化 | 0.121 | 5.35 | 3.78 | 0.163 | 0.016 |
| MIMIC | MedSigLIP，图像嵌入 | 0.182 | 8.01 | 5.66 | 0.209 | 0.017 |
| MIMIC | MedImageInsight，池化 | 0.192 | 8.46 | 5.97 | 0.279 | 0.017 |
| MIMIC | MedImageInsight，图像嵌入 | 0.198 | 8.75 | 6.18 | 0.281 | 0.016 |
| CT-RATE | 32×32 像素 | 0.079 | 1.00 | 0.99 | 0.130 | 0.232 |
| CT-RATE | MedSigLIP，池化 | 0.175 | 2.20 | 2.19 | 0.198 | 0.181 |
| CT-RATE | MedSigLIP，图像嵌入 | 0.194 | 2.45 | 2.44 | 0.202 | 0.154 |
| CT-RATE | MedImageInsight，池化 | 0.120 | 1.52 | 1.51 | 0.197 | 0.112 |
| CT-RATE | MedImageInsight，图像嵌入 | 0.116 | 1.47 | 1.46 | 0.197 | 0.106 |
| CT-RATE | Curia，CLS | 0.137 | 1.73 | 1.72 | 0.182 | 0.263 |
| CT-RATE | FlexiCT-2D，CLS | 0.095 | 1.20 | 1.19 | 0.167 | 0.214 |

表注：标签 CKA 通过教师嵌入与独热标签的线性 CKA 计算；两个相对值分别除以像素基准与展平 FLUX.2 潜变量的结果。检索指标统计排除同患者或同体积样本后 10 个近邻中的同类比例，混杂率则衡量近邻中的同患者/同体积比例。CT 原生编码器 Curia 和 FlexiCT-2D 没有图文投影头，因此使用类别 token 代替图像嵌入。

两个数据集最终选择了不同教师。在 MIMIC-CXR 上，MedImageInsight 在标签几何指标上以 6.18 倍（相对于原潜变量）略胜 MedSigLIP 的 5.66 倍，并在检索上明显领先。对于 CT-RATE，MedSigLIP 的标签几何为 2.44 倍，显著高于其他候选的最高 1.72 倍；CT 原生编码器则保留了比像素基准更强的体积身份信息。第 5.4 节比较了这些差距与下游性能之间的对应关系。

### C.2 定性样本

图 4 和图 5 展示表 1 全部方法产生的**未经人工筛选**的图像。对每个类别，选择流匹配随机种子 0、生成随机种子 0 下该类的第一张生成图像。每列最上方显示对应类别测试集中的第一张真实图像。没有任何样本经过筛除、重新生成或重新排列。

**图 4：** CT-RATE 的未筛选生成样本，覆盖全部 15 类，包括“无异常”、六类非局灶性发现（从支气管壁增厚到其他非局灶性发现），以及八类局灶性发现（从线状阴影到其他局灶性发现）。切片以后侧朝下的方向显示。每列对应一个类别，该列所有生成结果采用相同初始噪声。

**图 5：** MIMIC-CXR 的未筛选生成样本，流匹配随机种子与生成随机种子均为 0。每列为一个疾病类别，该列全部生成结果从同一初始噪声出发。

