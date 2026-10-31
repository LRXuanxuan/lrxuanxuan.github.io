---
layout: page
title: "基于块扩散模型的图像先验学习｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-05-learning-image-priors-through-patch-based-diffusion-models-for-solving/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/07d1b455463c9f2c/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 基于块扩散模型的图像先验学习

**原题：** Learning Image Priors through Patch-based Diffusion Models for Solving Inverse Problems  
**作者：** Jason Hu、Bowen Song、Xiaojian Xu、Liyue Shen、Jeffrey A. Fessler  
**单位：** 密歇根大学电气与计算机工程系（Ann Arbor, MI 48109）；邮箱：{jashu, bowenbw, xjxu, liyues, fessler}@umich.edu。  
**版本：** 会议论文集版本（NeurIPS-2024-learning-image-priors-through-patch-based-diffusion-models-for-solving-inverse-problems-Paper-Conference.pdf），本地 PDF 36 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节正文、图 1–8 与表 1–3、附录 A（第 A.1–A.8 节，含表 4–8、图 A.1–A.13、算法 A.1–A.3、式 (A.1)–(A.8)）、NeurIPS 论文检查表 15 项问答，以及参考文献 70 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

扩散模型可从底层数据分布学习强图像先验并用于求解逆问题，但其训练过程计算昂贵且需要大量数据。这些瓶颈使多数现有工作难以用于高维、高分辨率数据（如三维图像）。本文提出一种仅用图像块训练扩散模型、从而为整幅图像学习高效数据先验的方法。具体地，我们提出基于块的位置感知扩散逆问题求解器 PaDIS：通过图像块及其位置编码得到整幅图像的得分函数，并将其作为求解逆问题的先验。我们表明该扩散模型在保持通过位置编码生成整幅图像能力的同时，提升了内存效率与数据效率。此外，所提 PaDIS 模型高度灵活，可与不同扩散逆问题求解器（DIS）搭配。我们证明，PaDIS 仅凭基于块的先验即可求解自然图像与医学图像域中的多种逆问题，包括 CT 重建、去模糊与超分辨率。值得注意的是，在训练数据有限时，PaDIS 优于此前在整幅图像先验上训练的 DIS 方法，展示了所提基于块先验学习的数据效率。代码：https://github.com/sundeco/PaDIS

## 1. 引言

扩散模型学习底层数据分布的先验，并可用该先验生成新图像 [1–3]。从干净的训练图像出发，逐步加入更高水平的噪声，最终得到与纯噪声难以区分的图像，可用神经网络学习图像分布的得分函数，记为 $s(x)=\nabla\log p(x)$。反向过程（采样或生成）则从纯噪声开始，用学到的得分函数迭代去噪，最终得到从底层分布 $p(x)$ 采样的干净图像。

逆问题在图像处理中无处不在，目标是从测量 $y$ 重建图像 $x$，其中 $y=A(x)+\epsilon$，$A$ 表示前向算子、$\epsilon$ 表示随机未知噪声。由贝叶斯公式，$p(x|y)$ 正比于 $p(x)\cdot p(y|x)$。因此要恢复 $x$，重要的是对先验 $p(x)$ 有良好估计，尤其当 $y$ 包含的信息远少于 $x$ 时。扩散模型以学习强先验的能力著称，因此用其求解逆问题的文献日益增多 [4–8]。

> **图 1（原文 Fig. 1）：** 所提块扩散逆问题求解器（PaDIS）方法的训练。每次训练迭代使用不同尺寸的图像块。X 与 Y 位置数组与图像块同尺寸，由图像块每个像素归一化后的 X、Y 坐标构成。

然而扩散模型需要大量训练数据与巨大算力才能生成高分辨率图像；Song 等 [2] 与 Ho 等 [3] 在 ImageNet [9] 与 LSUN [10] 数据集上、用超过百万张训练图像训练数天到数周才生成 $256\times256$ 图像。这一高成本促使研究者关注扩散模型的训练效率改进，例如在不同数据集上微调已有检查点 [11, 12] 以减少所需训练时间与数据。但该策略限制了可用网络架构范围，且要求存在预训练网络，从而限制应用范围。

除苛刻的训练数据与算力需求外，扩散模型在超大规模问题（如极高分辨率图像或三维图像）上也存在困难。为应对这些挑战，潜空间扩散模型 [13, 14] 被提出以在更小的潜空间中学习图像分布，但在潜空间中求解一般逆问题很困难 [15]。基于块的扩散模型也被提出以降低计算成本。例如 Wang 等 [16] 在图像块上训练，但在图像生成时最终仍依赖一次性计算整幅图像的得分函数；Ding 等 [17] 在特征空间使用块，需要额外的编码与解码步骤。对三维体数据，最常见的方法是把体数据拆分为二维切片 [12], [18]；这些方法在切片之间加入正则项以在采样期间强制一致性，因而并不提供计算整个体数据得分函数的自包含方法。这些应用特定的策略使这些方法难以适配到通用的扩散逆问题求解器 [5], [19], [7], [20]。

我们所提方法以统一方式应对这些挑战：在图像块而非整幅图像上训练扩散模型（见图 1）。我们把随机抽取块的位置提供给网络，以帮助其学习全局图像属性。由于每张训练图像包含许多块，所需训练数据集规模大幅减少，从生成高质量图像通常需要的数百万张降到仅几千甚至几百张（见表 5）。所需内存与训练时间也降低，因为无需把整幅图像反传通过网络。所提方法允许灵活的网络架构，只要求网络可接受任意尺寸图像（许多 UNet 具备该性质 [3]），因此架构设计比微调方法灵活得多。

推理时（见图 2），所提方法先对图像零填充，再以多种不同方式把它划分为块（见图 3），从而消除若使用不重叠块会在块间出现的边界伪影。我们发展了一种方法，用所提基于块的网络学到的块分布来表达整幅图像的分布。借助块的位置信息，该框架无需把整幅图像输入网络即可计算整幅图像的得分函数。与可能任务特定的先前块方法 [21–23] 不同，我们方法定义的先验可作为黑盒，与任意随机微分方程（SDE）求解器搭配从先验采样，或与任意通用逆问题求解器搭配做图像重建。我们在多个数据集与不同逆问题上实验，表明所提方法能合成为数可观的真实图像，并在逆问题上取得非常精确的重建。此外，PaDIS 为未来处理甚大规模、高维图像的生成与逆问题求解提供了有前景的途径。

总之，我们的主要贡献如下：

- 我们给出一个理论框架，仅通过图像块的得分函数学习高分辨率、高维图像的得分函数。
- 所提方法相比传统扩散模型大幅减少所需内存与训练数据。
- 训练出的网络具有高度灵活性，可与许多现有采样算法搭配，并且是首个能以无监督方式求解逆问题的基于块的模型。
- 我们在多种逆问题上实验，展示出优于整幅图像扩散模型方法的图像质量，同时资源开销低得多。

## 2. 背景与相关工作

**扩散模型。** 扩散模型定义一个向干净图像加噪的前向随机微分方程（SDE）[2]：对 $t\in[0,T]$、$x(t)\in\mathbb R^d$，有

$$
\mathrm dx=-\left(\beta(t)/2\right)x\,\mathrm dt+\sqrt{\beta(t)}\,\mathrm dw, \tag{1}
$$

其中 $\beta(t)$ 是该过程的噪声方差计划。$x(0)$ 的分布为数据分布，$x(T)$ 的分布（近似）为标准高斯。图像生成通过反向 SDE 完成 [24]：

$$
\mathrm dx=\left(-\beta(t)/2-\beta(t)\nabla_{x_t}\log p_t(x_t)\right)\mathrm dt+\sqrt{\beta(t)}\,\mathrm dw. \tag{2}
$$

训练神经网络学习得分函数 $\nabla_{x_t}\log p_t(x_t)$ 后，即可从噪声出发运行反向 SDE，得到从所学数据分布采样的样本。

为降低计算负担，潜空间扩散模型 [13] 被提出，把扩散过程放在小得多的潜空间中进行，从而加快训练与采样。但该方法需要针对固定数据集的预训练编码器与解码器 [25]，因此换数据集必须重训练，且仍需大量训练数据。基于块的扩散模型 [16, 17] 关注图像生成且只在图像块上训练。有监督的块扩散方法 [23, 26] 是任务特定的，不学习可应用于所有逆问题的无条件图像先验。其他块方法 [27–29] 学习无条件图像先验，但推理时需要整幅图像作为输入。最后还有加快采样的工作 [14, 30, 31]，与训练过程无关。

**求解逆问题。** 对多数真实逆问题，部分测量 $y$ 受损且不完整，因此即便无噪声，从 $x$ 到 $y$ 的映射也是多对一的，无法精确恢复 $x$。因此必须对 $x$ 施加先验。传统方法如全变差（TV）[32] 与小波变换 [33] 用于强制图像稀疏性；为捕捉更全局的信息，低秩方法也很流行 [34–37]。这些方法常涉及同时强制数据一致性与图像先验的优化问题。

近年来，数据驱动方法在信号与图像处理中日益流行 [38–42]。特别地，求解逆问题时若训练数据充足，学习到的先验可比传统方法的手工先验强得多。例如即插即用与正则化去噪方法 [43–49] 预训练一个去噪器，并在重建时迭代应用以恢复图像。相比 [50–53] 等监督深度学习方法，这些方法的优势在于同一去噪器可求解多种逆问题。

扩散模型作为更强的先验，可从纯噪声生成整幅图像。多数用扩散模型求解逆问题的方法把问题写为条件生成问题 [54–56] 或后验采样问题 [4–7, 57]。前者的网络在训练时需要测量 $y$（或 $y$ 的适当缩放变换），因此这些任务特定训练的模型在重建时只对求解该特定逆问题有用。相反，后验采样框架的网络学习 $x$ 的无条件先验，可帮助求解与 $x$ 相关的任何逆问题而无需重训练。所提方法可与多数现有后验采样算法 [5–7, 58] 搭配。

## 3. 方法

为能求解大规模二维成像问题以及三维、四维逆问题，我们的目标是建立 $p(x)$ 的模型，且不要求把整幅图像 $x$ 输入任何神经网络。我们希望简单地把 $x$ 划分为不重叠块、学习每块的分布，再拼起来得到 $x$ 的分布。但这会导致块间边界伪影；直接使用重叠块会使被多个块覆盖的区域被多次更新，与扩散模型理论不一致。理想情况是用不重叠块更新 $x$，但采用多种不同的块铺排方案，使块间边界在整个扩散过程中不固定。

为此，我们对 $x_0$ 零填充并学习所得零填充图像的分布。更精确地，考虑 $N\times N$ 图像 $x_0$，整数 $1\le P<N$ 表示块尺寸，$k=\lfloor N/P\rfloor$。于是 $x_0$ 本可被 $(k+1)\times(k+1)$ 的不重叠块网格覆盖，但这需要 $(k+1)P-N$ 条额外的行与列。因此我们把 $x_0$ 四周各零填充 $M=(k+1)P-N$，得到 $N+2M$ 行与列的新图像。略滥用记号，也把该更大图像记为 $x$。令 $i,j$ 为 $1$ 到 $M$（含）间的正整数。图 3 展示了可把 $x$ 划分为 $(k+1)^2+1$ 个区域：其中 $(k+1)^2$ 个区域由把第 $i$ 至 $i+N+P$ 行、第 $j$ 至 $j+N+P$ 列构成的正方形均匀切成 $k+1$ 乘 $k+1$ 网格得到，每块为 $P\times P$；最后一个区域由 $x$ 中未被前 $(k+1)^2$ 个区域包含的剩余边界部分组成。该最后区域始终全为零，而 $(k+1)^2$ 个方形块完全覆盖中央 $N\times N$ 图像。

每一对整数 $i$、$j$ 对应一种可能的划分，故当 $i$ 与 $j$ 取遍所有可能值时，我们把 $x$ 的分布建模为如下乘积分布：

$$
p(x)=\prod_{i,j=1}^{i,j=M}p_{i,j,B}(x_{i,j,B})\prod_{r=1}^{(k+1)^2}p_{i,j,r}(x_{i,j,r})/Z, \tag{3}
$$

其中 $x_{i,j,B}$ 表示依赖具体 $i,j$ 的上述边界区域，$p_{i,j,B}$ 是该区域的概率分布，$x_{i,j,r}$ 是 $i,j$ 对应划分方案下的第 $r$ 个 $P\times P$ 块，$p_{i,j,r}$ 是该区域的概率分布，$Z$ 是适当缩放因子。基于块概率乘积的生成模型在 Markov 随机场文献中有悠久历史；见 §A.6。

整幅图像的得分函数直接由 (3) 得到：

$$
\nabla\log p(x)=\sum_{i,j=1}^{i,j=M}\left(s_{i,j,B}(x_{i,j,B})+\sum_{r=1}^{(k+1)^2}s_{i,j,r}(x_{i,j,r})\right). \tag{4}
$$

于是我们把整幅图像 $x$ 的得分函数表达为块 $x_{i,j,r}$ 与边界 $x_{i,j,B}$ 的得分之和。前者可按 §3.1 通过得分匹配学习。对后者，按构造，若 $x$ 是零填充图像则 $x_{i,j,B}$ 处处为零。因此对所有 $x$，$D(x_{i,j,B})=\mathbb E[x_{i,j,B},t=0\mid x_{i,j,B},t=T]$ 处处为零，其中 $D$ 表示去噪器函数；其得分函数的计算由 Tweedie 公式 [59] 平凡可得。

> **图 2（原文 Fig. 2）：** 所提块扩散逆问题求解器（PaDIS）方法的重建过程概览。从 $t=T$ 开始，每次迭代我们选取零填充图像的一个随机划分，用块上训练的神经网络得到整幅图像的得分函数。由于块位置不断移动，输出图像没有边界伪影。

> **图 3（原文 Fig. 3）：** 零填充并把图像划分为块的示意。

重要的是，与 [16] 和 [17] 等先前论文不同，我们的方法可仅向神经网络输入块就计算整幅图像的得分函数。这使为大幅图像学习黑盒得分函数成为可能，而直接训练扩散模型会因内存与时间约束不可行。此外，§4 表明在数据有限时，每张训练图像中存在的大量块使基于块的模型学到的底层分布模型优于整幅图像模型。

### 3.1 逐块训练

沿用 [16] 与 [14] 的工作，我们用得分匹配方法训练去噪器。神经网络 $D_\theta(x,\sigma_t)$ 接收含噪图像 $x$ 与噪声水平 $\sigma_t$，通过如下损失函数训练：

$$
\mathbb E_{t\sim\mathcal U(0,T)}\mathbb E_{x\sim p(x)}\mathbb E_{\epsilon\sim\mathcal N(\mathbf 0,\sigma_t^2\mathbf I)}\left\|D_\theta(x+\epsilon,\sigma_t)-x\right\|_2^2. \tag{5}
$$

由 Tweedie 公式 [59]，得分函数为 $s_\theta(x,\sigma_t)=(D_\theta(x,\sigma_t)-x)/\sigma_t^2$。这里我们要学习块 $x_{i,j,r}$ 的得分函数，因此把 (5) 应用于 $x$ 的块而非整幅图像。沿用 [16]，我们从零填充图像 $x$ 中随机抽取块。为纳入块的位置信息，先定义 x 位置数组为规模 $N+2M$ 的二维数组，由图像每个像素在 $-1$ 到 $1$ 之间缩放的 x 坐标构成；y 位置数组类似定义。随后抽取这两个位置数组的对应块，并沿含噪图像块的通道维拼接，作为网络输入；注意位置数组不加噪声。

直接应用 (5) 时，只需固定块尺寸 $P$ 并仅用尺寸 $P$ 的块训练。然而 [16] 发现用不同尺寸的块训练可减少训练时间，并使神经网络更好地学习跨区域依赖。因此我们既用尺寸 $P$ 的块训练，也用更小块训练，尺寸按随机调度方案选择。采用 [3] 的 UNet 架构后，同一网络可接受不同尺寸图像输入。附录给出实验细节。

### 3.2 采样与重建

所提学习 $p(x)$ 的基于块方法可与任何原本用于整幅图像扩散模型采样的方法搭配，如 Langevin 动力学 [1] 与 DDPM [3]，以及二阶求解器 [14]、DDIM [30] 等加速方法。训练时网络只接收图像块及其位置信息。然而我们表明，当采样迭代次数足够多时，所提方法仍能生成相当真实的整幅图像。但我们的主要目标是求解大规模逆问题，而非图像生成。

按 (4) 计算 $s(x)$ 需对所有 $(k+1)^2$ 个块的得分函数求和共 $M^2$ 次（对应选择 $i$、$j$ 的 $M^2$ 种方式）。由于 $M^2$ 的规模，该做法会慢得难以接受；因此每次迭代我们随机选择 $1$ 到 $M$ 间的整数 $i$ 与 $j$，只用外层求和中对应的那一项估计 $s(x)$。

> **算法 1　块扩散逆问题求解器（PaDIS）**
> **Require：** $\sigma_1<\sigma_2<\dots<\sigma_T$、$\epsilon>0$、$\zeta_i>0$、$P$、$M$、$y$
> 初始化 $x\sim\mathcal N(\mathbf 0,\sigma_T^2\mathbf I)$
> **for** $t=T:1$ **do**
> 　采样 $z\sim\mathcal N(\mathbf 0,\sigma_t^2\mathbf I)$
> 　置 $\alpha_t=\epsilon\cdot\sigma_t^2$
> 　随机选取整数 $i,j\in[1,M]$
> 　对全部 $1\le r\le(k+1)^2$，抽取块 $x_{i,j,r}$
> 　计算 $D_{i,j,r}=D_\theta(x_{i,j,r},\sigma_t)$
> 　置 $s_{i,j,r}=(D_{i,j,r}-x_{i,j,r})/\sigma_t^2$
> 　应用 (4) 得 $s=s(x,\sigma_t)$
> 　置 $x=x-\zeta_t\nabla_{x_t}\|y-A(D)\|_2^2$
> 　置 $x=x+\frac{\alpha_t}{2}s+\sqrt{\alpha_t}z$
> **end for**

用扩散模型求解逆问题已有通用算法（如 [19] 与 [5]）以及更模型特定的算法（如 [6] 与 [7]）。这里我们证明方法适用于广泛逆问题，并选择不依赖前向算子特殊性质（如 [6], [7] 中系统矩阵的奇异值分解）的通用方法。我们发现 DPS [5] 结合 Langevin 动力学通常给出最稳定、最高质量的结果，因此以该方案作为核心算法。与 [5] 类似，步长取 $\zeta_i=\zeta/\|y-A(D(x))\|_2$。据我们所知，这是首个学习完全基于块的扩散先验并将其用于求解逆问题的工作；我们称方法为块扩散逆问题求解器（PaDIS）。每次迭代计算各块得分函数易于并行，从而支持快速采样与重建。算法 1 给出主图像重建算法的伪代码；附录给出其他已实现算法的伪代码。

最后，我们评论所提方法与 [18] 的一些高层相似性：两者都把图像以多种方式划分为较小部分。[18] 中一种划分由 x-y 方向的二维切片构成、另一种由 x-z 方向的二维切片构成；而我们的每种划分都由 $(k+1)^2$ 个方形块与外围边界区域构成。两种方法都在训练时独立学习各部分的得分函数；每次采样迭代都选取一种划分、独立计算各部分得分函数，再通过分别更新各部分来更新整幅图像。对我们的方法，零填充允许许多可能的图像划分并消除块间边界伪影。

## 4. 实验

**实验设置。** 主要 CT 实验使用 AAPM 2016 CT 挑战数据 [60]，它含 10 个三维体数据。我们在 Z 方向裁剪以选取 256 个切片，再把 XY 平面图像重新缩放为 $256\times256$。最后用其中 9 个体数据的 XY 切片定义 2304 张训练图像，并用第十个体数据的 25 个切片作为测试数据。对去模糊与超分辨率实验，我们使用 CelebA-HQ 数据集 [61] 的 3000 张图像子集（每张 $256\times256$）训练，以展示所提方法在训练数据有限时表现良好。预处理为把 RGB 值除以 255，使像素值都在 0 到 1 之间。测试数据为剩余图像中随机选取的 25 张子集。所有情形我们都报告测试图像上的平均指标：峰值信噪比（PSNR，dB）与结构相似性指标（SSIM）[62]；彩色图像的指标在 RGB 域计算。

主块网络大多以 $56\times56$ 的块尺寸训练，使目标图像在每个方向上可由 5 个块完全覆盖，同时最小化所需零填充量。块网络与整幅图像网络都采用 [14] 的网络架构。所有网络在 PyTorch 上用 Adam 优化器、2 块 A40 GPU 训练。附录给出超参数完整细节。

**图像生成。** 所提方法从未在整幅图像上训练，却能为整幅图像学习合理先验。图 4 给出 CT 数据集上用三种方法生成的结果：顶行用整幅图像训练的网络；中间行用 [16] 的方法，但训练与采样时都从未向网络提供整幅图像；底行用所提方法。中间行表明位置编码确实能在各位置生成相当合适的块，但简单独立生成各块再朴素拼装会导致明显的块间边界伪影（块间不一致）。所提方法通过随机块网格移位使用重叠块来解决该问题，生成图像整体连续。

> **图 4（原文 Fig. 4）：** CT 图像的无条件生成。顶行：整幅图像训练的网络生成；中间行：[16] 的仅块版本；底行：所提 PaDIS 方法。

**逆问题。** 我们在多种逆问题上测试所提方法：CT 重建、去模糊与超分辨率。CT 重建的前向与反向投影器使用 [63] 提供的实现。我们做两组稀疏视角 CT（SVCT）实验：一组用 8 个投影视角、一组用 20 个投影视角，均使用平行束前向投影器、探测器尺寸 512 像素。去模糊实验使用 $9\times9$ 的均匀模糊核，加入 $\sigma=0.01$ 的白高斯噪声，干净图像缩放在 0 到 1 之间。超分辨率实验使用 4 倍缩放因子、以平均方式下采样，并加入 $\sigma=0.01$ 的白高斯噪声。DPS 已被证明能从更多神经函数评估（NFE）中显著受益 [5]，故所有扩散模型实验使用 1000 NFE；附录 A.7 进一步讨论。

对比较方法，我们用第 3.1 节的去噪得分匹配方法在整幅图像上训练扩散模型；推理过程与块方法相同，只是每次迭代的图像得分函数直接用神经网络计算，而无需把零填充图像拆成块。我们还与两种传统方法比较：简单基线，以及用全变差正则项重建（ADMM-TV）。对 CT，基线为对测量 $y$ 应用滤波反投影的结果；对去模糊，基线即模糊图像；对超分辨率，基线为对低分辨率图像上采样并使用最近邻插值的结果。ADMM-TV 实现见 [64]。我们还实现两种即插即用（PnP）方法：PnP-ADMM [42] 与去噪正则化（RED）[46]。我们按 [65] 在每个数据集上训练去噪 CNN，再用其求解逆问题。

为进一步比较扩散模型方法，我们实现不同采样与数据一致性算法并与块先验结合：Langevin 动力学 [1]、预测–校正采样 [19] 与方差爆炸 DDNM（VE-DDNM）[7]。所有这些采样方法使用方差爆炸框架以保持一致并避免重训练网络。我们还比较另外两种把块先验组装为整幅图像先验的方式：块平均 [23] 与块拼接 [66]。附录 A.5 给出这些比较算法的伪代码。

表 1 给出主要逆问题求解结果。最佳结果为块模型训练约 12 小时后取得，而整幅图像模型需训练 24–36 小时，显示训练时间显著改善。此外，在测试数据集上平均指标时，所提方法在所有逆问题的 PSNR 与 SSIM 上都优于整幅图像方法。每次迭代所有块的得分函数可并行计算，因此这些方法的重建时间非常接近（均约每张图像 5 分钟）。若使用更多训练数据，整幅图像的结果可能更好，见附录 A.3 的数据量研究。

我们还做了消融研究，考察所提方法各参数的影响，即重建时使用不同块尺寸、变化数据集规模、块位置编码的重要性，以及不同采样与逆问题求解算法。结果见附录 A.2。

> **表 1（原文 Table 1）：** 三种不同逆问题上的定量结果比较。结果为测试数据集中全部图像的平均值，最优结果加粗。

| 方法 | CT（20 视角）PSNR↑ | SSIM↑ | CT（8 视角）PSNR↑ | SSIM↑ | 去模糊 PSNR↑ | SSIM↑ | 超分辨率 PSNR↑ | SSIM↑ |
|---|---|---|---|---|---|---|---|---|
| 基线 | 24.93 | 0.595 | 21.39 | 0.415 | 24.54 | 0.688 | 25.86 | 0.739 |
| ADMM-TV | 26.82 | 0.724 | 23.09 | 0.555 | 28.22 | 0.792 | 25.66 | 0.745 |
| PnP-ADMM [42] | 26.86 | 0.607 | 22.39 | 0.489 | 28.82 | 0.818 | 26.61 | 0.785 |
| PnP-RED [46] | 27.99 | 0.622 | 23.08 | 0.441 | 29.91 | 0.867 | 26.36 | 0.766 |
| 整幅图像扩散 | 32.84 | 0.835 | 25.74 | 0.706 | 30.19 | 0.853 | 29.17 | 0.827 |
| Langevin 动力学 [1] | 33.03 | 0.846 | 27.03 | 0.689 | 30.60 | 0.867 | 26.83 | 0.744 |
| 预测–校正 [19] | 32.35 | 0.820 | 23.65 | 0.546 | 28.42 | 0.724 | 26.97 | 0.685 |
| VE-DDNM [7] | 31.98 | 0.861 | 27.71 | 0.759 | – | – | 26.01 | 0.727 |
| 块平均 [23] | 33.35 | 0.850 | 28.43 | 0.765 | 29.41 | 0.847 | 27.67 | 0.802 |
| 块拼接 [66] | 32.87 | 0.837 | 26.71 | 0.710 | 29.69 | 0.849 | 27.50 | 0.780 |
| **PaDIS（本文）** | **33.57** | **0.854** | **29.48** | **0.767** | **30.80** | **0.870** | **29.47** | **0.846** |

除表 1 的主要逆问题外，我们还在三种附加逆问题上实验以展示方法在广泛逆问题上的有效性：60 视角 CT 重建、180 视角扇束重建，以及 $17\times17$ 均匀核去模糊。去模糊实验同样加入 $\sigma=0.01$ 的高斯噪声。表 2 给出这些实验的定量结果，图 A.10 给出视觉结果。

> **表 2（原文 Table 2）：** 附加逆问题实验。结果为测试数据集中全部图像的平均值，最优结果加粗。

| 方法 | CT（60 视角）PSNR↑ | SSIM↑ | CT 扇束 PSNR↑ | SSIM↑ | 强去模糊 PSNR↑ | SSIM↑ |
|---|---|---|---|---|---|---|
| 基线 | 25.89 | 0.746 | 20.07 | 0.521 | 21.14 | 0.569 |
| ADMM-TV | 30.93 | 0.833 | 25.78 | 0.719 | 26.03 | 0.724 |
| 整幅图像扩散 | 35.83 | 0.894 | 26.89 | 0.835 | 28.35 | 0.808 |
| **PaDIS（本文）** | **39.28** | **0.941** | **29.91** | **0.932** | **28.91** | **0.818** |

图 5 底部中，扩散模型方法的重建存在一些伪影，尽管整幅图像模型比 PaDIS 更明显。该情形测量被极度压缩，任何模型都很难得到诊断质量的重建；基线在定量指标上明显更差并出现严重模糊。临床环境中患者诊断通常使用含数百视角的 CT 扫描；图 5 顶部表明使用 60 视角时，所提方法给出好得多、无伪影的重建。尽管如此，我们展示了所提方法从极稀疏视角重建出可观图像质量的潜力，或可用于患者摆位等应用。

> **图 5（原文 Fig. 5）：** CT 重建结果。上方两行使用 60 视角，下方两行使用 20 视角。为更好显示器官对比，上图使用修正 Hounsfield 单位（HU），下图使用训练时所用同一尺度。

> **图 6（原文 Fig. 6）：** 含高斯噪声（$\sigma=0.01$）的去模糊结果。

> **图 7（原文 Fig. 7）：** 含高斯噪声（$\sigma=0.01$）的超分辨率结果。

最后，由于原始 AAPM 数据集含 $512\times512$ 分辨率的 CT 图像，我们在这些更高分辨率图像上做了 60 视角 CT 重建实验。由于数据不足，我们未在高分辨率图像上训练整幅图像模型；训练时零填充宽度取 64、最大块尺寸取 $64\times64$。图 8 给出这些实验的视觉结果。因此所提方法对多种逆问题与不同图像尺寸都能获得高质量重建。

> **表 3（原文 Table 3）：** $512\times512$ 图像 60 视角 CT 重建结果。结果为测试数据集中全部图像的平均值，最优结果加粗。

| 方法 | FBP | ADMM-TV | PaDIS |
|---|---|---|---|
| PSNR↑ | 28.38 | 29.48 | **36.93** |
| SSIM↑ | 0.699 | 0.788 | **0.899** |

> **图 8（原文 Fig. 8）：** 使用修正 HU 单位的 $512\times512$ 图像 60 视角 CT 重建结果。

## 5. 结论

本文提出一种仅通过图像块结合合适位置编码、用基于得分的扩散模型学习图像先验的方法。仿真结果表明该方法可用于求解多种逆问题。大量实验表明，在训练数据有限的条件下，所提方法优于涉及整幅图像扩散模型的方法。未来可在使用多尺度分辨率方法 [67, 68] 提高图像生成质量、使用加速方法加快重建，以及更高维图像重建方面开展更多工作。本文所提图像先验有潜力通过降低 CT 扫描的 X 射线剂量造福社会；生成模型存在诱导幻觉与被用于虚假信息的风险。

## 致谢与资助披露

本工作部分得到密歇根计算发现与工程研究所（MICDE）的资助以及 KLA 的捐赠支持。

## 参考文献（英文原书目）

- [1] Y. Song and S. Ermon, "Generative modeling by estimating gradients of the data distribution," in Advances in Neural Information Processing Systems, vol. 32, 2019.
- [2] Y. Song, J. Sohl-Dickstein, D. P. Kingma, A. Kumar, S. Ermon, and B. Poole, "Score-based generative modeling through stochastic differential equations," in 9th International Conference on Learning Representations (ICLR), 2021.
- [3] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Advances in Neural Information Processing Systems, vol. 33, 2020, pp. 6840–6851.
- [4] H. Chung, B. Sim, D. Ryu, and J. C. Ye, Improving Diffusion Models for Inverse Problems using Manifold Constraints, 2022.
- [5] H. Chung, J. Kim, M. T. Mccann, M. L. Klasky, and J. C. Ye, "Diffusion posterior sampling for general noisy inverse problems," in The Eleventh International Conference on Learning Representations, 2023.
- [6] B. Kawar, M. Elad, S. Ermon, and J. Song, Denoising Diffusion Restoration Models, 2022.
- [7] Y. Wang, J. Yu, and J. Zhang, Zero-Shot Image Restoration Using Denoising Diffusion Null-Space Model, 2022.
- [8] B. Kawar, G. Vaksman, and M. Elad, SNIPS: Solving Noisy Inverse Problems Stochastically, 2021.
- [9] O. Russakovsky et al., ImageNet Large Scale Visual Recognition Challenge, 2015.
- [10] F. Yu, A. Seff, Y. Zhang, S. Song, T. Funkhouser, and J. Xiao, LSUN: Construction of a Large-scale Image Dataset using Deep Learning with Humans in the Loop, 2016.
- [11] T. Moon, M. Choi, G. Lee, J.-W. Ha, and J. Lee, "Fine-tuning diffusion models with limited data," in NeurIPS 2022 Workshop on Score-Based Methods, 2022.
- [12] H. Chung, D. Ryu, M. T. McCann, M. L. Klasky, and J. C. Ye, Solving 3D Inverse Problems using Pre-trained 2D Diffusion Models, 2022.
- [13] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer, High-Resolution Image Synthesis with Latent Diffusion Models, 2022.
- [14] T. Karras, M. Aittala, T. Aila, and S. Laine, Elucidating the Design Space of Diffusion-Based Generative Models, 2022.
- [15] B. Song, S. M. Kwon, Z. Zhang, X. Hu, Q. Qu, and L. Shen, Solving Inverse Problems with Latent Diffusion Models via Hard Data Consistency, 2023.
- [16] Z. Wang, Y. Jiang, H. Zheng, P. Wang, P. He, Z. Wang, W. Chen, and M. Zhou, Patch Diffusion: Faster and More Data-Efficient Training of Diffusion Models, 2023.
- [17] Z. Ding, M. Zhang, J. Wu, and Z. Tu, Patched Denoising Diffusion Models For High-Resolution Image Synthesis, 2023.
- [18] S. Lee, H. Chung, M. Park, J. Park, W.-S. Ryu, and J. C. Ye, Improving 3D Imaging with Pre-Trained Perpendicular 2D Diffusion Models, 2023.
- [19] H. Chung and J. C. Ye, "Score-based diffusion models for accelerated MRI," Medical Image Analysis, vol. 80, p. 102479, 2022.
- [20] Y. Song, L. Shen, L. Xing, and S. Ermon, "Solving inverse problems in medical imaging with score-based generative models," in International Conference on Learning Representations, 2022.
- [21] W. Xia, W. Cong, and G. Wang, Patch-Based Denoising Diffusion Probabilistic Model for Sparse-View CT Reconstruction, 2022.
- [22] W. Xia, H. W. Tseng, C. Niu, W. Cong, X. Zhang, S. Liu, R. Ning, S. Vedantham, and G. Wang, Parallel Diffusion Model-based Sparse-view Cone-beam Breast CT, 2024.
- [23] O. Ozdenizci and R. Legenstein, "Restoring vision in adverse weather conditions with patch-based denoising diffusion models," IEEE Transactions on Pattern Analysis & Machine Intelligence, vol. 45, no. 8, pp. 10346–10357, Aug. 2023.
- [24] B. D. Anderson, "Reverse-time diffusion equation models," Stochastic Processes and their Applications, vol. 12, no. 3, pp. 313–326, 1982.
- [25] P. Esser, R. Rombach, and B. Ommer, Taming Transformers for High-Resolution Image Synthesis, 2021.
- [26] W. Xia, C. Niu, W. Cong, and G. Wang, Sub-volume-based denoising diffusion probabilistic model for cone-beam CT reconstruction from incomplete data, 2023.
- [27] F. Bieder, J. Wolleb, A. Durrer, R. Sandkuehler, and P. C. Cattin, "Denoising diffusion models for memory-efficient processing of 3D medical images," Proc. Mach. Learning Res., vol. 227, pp. 552–567, 2024.
- [28] T. Luhman and E. Luhman, Improving diffusion model efficiency through patching, 2022.
- [29] W. Peebles and S. Xie, "Scalable diffusion models with transformers," arXiv:2212.09748, 2023.
- [30] J. Song, C. Meng, and S. Ermon, Denoising Diffusion Implicit Models, 2022.
- [31] C. Lu, Y. Zhou, F. Bao, J. Chen, C. Li, and J. Zhu, DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps, 2022.
- [32] P. J. Huber, Robust Statistics. New York: Wiley, 1981.
- [33] I. Daubechies, M. Defrise, and C. De Mol, "An iterative thresholding algorithm for linear inverse problems with a sparsity constraint," Comm. Pure Appl. Math., vol. 57, no. 11, pp. 1413–1457, Nov. 2004.
- [34] W. Ren, X. Cao, J. Pan, X. Guo, W. Zuo, and M.-H. Yang, "Image deblurring via enhanced low-rank prior," IEEE Transactions on Image Processing, vol. 25, no. 7, pp. 3426–3437, 2016.
- [35] S. Li et al., "An efficient iterative cerebral perfusion CT reconstruction via low-rank tensor decomposition with spatial–temporal total variation regularization," IEEE Transactions on Medical Imaging, vol. 38, no. 2, pp. 360–370, 2019.
- [36] A. Spantini, A. Solonen, T. Cui, J. Martin, L. Tenorio, and Y. Marzouk, Optimal low-rank approximations of Bayesian linear inverse problems, 2015.
- [37] J. Assländer, M. A. Cloos, F. Knoll, D. K. Sodickson, J. Hennig, and R. Lattanzi, "Low rank alternating direction method of multipliers reconstruction for MR fingerprinting," Magnetic Resonance in Medicine, vol. 79, no. 1, pp. 83–96, Mar. 2017.
- [38] J. Liu, Y. Sun, X. Xu, and U. S. Kamilov, Image Restoration using Total Variation Regularized Deep Image Prior, 2018.
- [39] Z. Li, X. Xu, J. Hu, J. Fessler, and Y. Dewaraja, "Reducing SPECT acquisition time by predicting missing projections with single-scan self-supervised coordinate-based learning," Journal of Nuclear Medicine, vol. 64, suppl. 1, P1014, 2023.
- [40] J. Hu, B. T.-W. Lin, J. H. Vega, and N. R.-L. Tsiang, "Predictive models of driver deceleration and acceleration responses to lead vehicle cutting in and out," Transportation Research Record, vol. 2677, no. 5, pp. 92–102, 2023.
- [41] X. Xu, W. Gan, S. V. V. N. Kothapalli, D. A. Yablonskiy, and S. U. Kamilov, CoRRECT: A Deep Unfolding Framework for Motion-Corrected Quantitative R2* Mapping, 2022.
- [42] X. Xu, J. Liu, Y. Sun, B. Wohlberg, and U. S. Kamilov, "Boosting the performance of plug-and-play priors via denoiser scaling," in 54th Asilomar Conf. on Signals, Systems, and Computers, 2020, pp. 1305–1312.
- [43] Y. Sun, Z. Wu, X. Xu, B. E. Wohlberg, and U. Kamilov, "Scalable plug-and-play ADMM with convergence guarantees," IEEE Transactions on Computational Imaging, vol. 7, July 2021.
- [44] X. Xu, Y. Sun, J. Liu, B. Wohlberg, and U. S. Kamilov, "Provable convergence of plug-and-play priors with MMSE denoisers," IEEE Signal Processing Letters, vol. 27, pp. 1280–1284, 2020.
- [45] J. Liu, X. Xu, W. Gan, S. Shoushtari, and U. Kamilov, "Online deep equilibrium learning for regularization by denoising," in Advances in Neural Information Processing Systems, 2022.
- [46] Y. Hu, J. Liu, X. Xu, and U. S. Kamilov, Monotonically Convergent Regularization by Denoising, 2022.
- [47] J. Liu, Y. Sun, W. Gan, X. Xu, B. Wohlberg, and U. S. Kamilov, "Stochastic deep unfolding for imaging inverse problems," in ICASSP 2021, pp. 1395–1399.
- [48] P. Cascarano, A. Benfenati, U. S. Kamilov, and X. Xu, Constrained Regularization by Denoising with Automatic Parameter Selection, 2024.
- [49] A. H. Al-Shabili, X. Xu, I. Selesnick, and U. S. Kamilov, Bregman Plug-and-Play Priors, 2022.
- [50] K. H. Jin, M. T. McCann, E. Froustey, and M. Unser, "Deep convolutional neural network for inverse problems in imaging," IEEE Transactions on Image Processing, vol. 26, no. 9, pp. 4509–4522.
- [51] A. Lahiri, G. Maliakal, M. L. Klasky, J. A. Fessler, and S. Ravishankar, "Sparse-view cone beam CT reconstruction using data-consistent supervised and adversarial learning from scarce training data," IEEE Transactions on Computational Imaging, vol. 9, pp. 13–28, 2023.
- [52] M. Sonogashira, M. Shonai, and M. Iiyama, "High-resolution bathymetry by deep-learning-based image superresolution," PloS One, vol. 15, no. 7, e0235487, 2020.
- [53] E. Whang, D. McAllister, A. Reddy, A. Kohli, and L. Waller, "SeidelNet: An aberration-informed deep learning model for spatially varying deblurring," in SPIE, vol. 12438, 2023, 124380Y.
- [54] M. Delbracio and P. Milanfar, Inversion by Direct Iteration: An Alternative to Denoising Diffusion for Image Restoration, 2024.
- [55] G.-H. Liu, A. Vahdat, D.-A. Huang, E. A. Theodorou, W. Nie, and A. Anandkumar, I2SB: Image-to-Image Schrödinger Bridge, 2023.
- [56] H. Chung, J. Kim, and J. C. Ye, Direct Diffusion Bridge using Data Consistency for Inverse Problems, 2023.
- [57] G. Cardoso, Y. J. E. Idrissi, S. L. Corff, and E. Moulines, Monte Carlo guided Diffusion for Bayesian linear inverse problems, 2023.
- [58] H. Chung, B. Sim, D. Ryu, and J. C. Ye, "Improving diffusion models for inverse problems using manifold constraints," in Advances in Neural Information Processing Systems, vol. 35, 2022, pp. 25683–25696.
- [59] B. Efron, "Tweedie's formula and selection bias," Journal of the American Statistical Association, vol. 106, no. 496, pp. 1602–1614, 2011.
- [60] C. H. McCollough et al., "Results of the 2016 low dose CT grand challenge," Medical Physics, vol. 44, no. 10, e339–e352, Oct. 2017.
- [61] Z. Liu, P. Luo, X. Wang, and X. Tang, "Deep learning face attributes in the wild," in Proceedings of International Conference on Computer Vision (ICCV), Dec. 2015.
- [62] Z. Wang, A. C. Bovik, H. R. Sheikh, and E. P. Simoncelli, "Image quality assessment: From error visibility to structural similarity," IEEE Transactions on Image Processing, vol. 13, no. 4, pp. 600–612, Apr. 2004.
- [63] O. D. Team, ODL: Operator Discretization Library, https://odlgroup.github.io/odl/guide/geometry_guide.html, accessed April 2024, 2022.
- [64] T. Hong, L. Hernandez-Garcia, and J. A. Fessler, "A complex quasi-Newton proximal method for image reconstruction in compressed sensing MRI," IEEE Transactions on Computational Imaging, vol. 10, pp. 372–384, 2024.
- [65] O. Ronneberger, P. Fischer, and T. Brox, "U-Net: Convolutional networks for biomedical image segmentation," arXiv:1505.04597, 2015.
- [66] J. L. Rumberger, X. Yu, P. Hirsch, M. Dohmen, V. E. Guarino, A. Mokarian, L. Mais, J. Funke, and D. Kainmueller, How Shift Equivariance Impacts Metric Learning for Instance Segmentation, 2021.
- [67] J. Gu, S. Zhai, Y. Zhang, J. M. Susskind, and N. Jaitly, "Matryoshka diffusion models," in Proc. Intl. Conf. on Learning Representations, 2024.
- [68] Y. He, S. Yang, H. Chen, X. Cun, M. Xia, Y. Zhang, X. Wang, R. He, Q. Chen, and Y. Shan, "ScaleCrafter: Tuning-free higher-resolution visual generation with diffusion models," in Proc. Intl. Conf. on Learning Representations, 2024.
- [69] H. Chung, B. Sim, and J. C. Ye, Come-Closer-Diffuse-Faster: Accelerating Conditional Diffusion Models for Inverse Problems through Stochastic Contraction, 2022.
- [70] J. Besag, "Spatial interaction and the statistical analysis of lattice systems," Journal of the Royal Statistical Society, vol. 36, no. 2, pp. 192–236, 1974.

## 附录 A 附录 / 补充材料

本附录用于论文 "Learning Image Priors through Patch-based Diffusion Models for Solving Inverse Problems"（NeurIPS 2024）。

### A.1 附加逆问题求解实验

图 A.1、A.2、A.3、A.4 给出附加的逆问题求解结果。图 A.1 给出 20 视角 CT 重建的更多示例切片；图 A.2 给出 8 视角 CT 重建的更多示例切片；图 A.3 给出人脸图像去模糊的更多示例；图 A.4 给出人脸图像超分辨率的更多示例。

> **图 A.1（原文 Fig. A.1）：** 7 个不同测试切片的 20 视角 CT 重建附加结果。

> **图 A.2（原文 Fig. A.2）：** 7 个不同测试切片的 8 视角 CT 重建附加结果。

> **图 A.3（原文 Fig. A.3）：** 含高斯噪声（$\sigma=0.01$）去模糊的附加结果。

> **图 A.4（原文 Fig. A.4）：** 含高斯噪声（$\sigma=0.01$）超分辨率的附加结果。

### A.2 消融研究

我们做四个消融研究，评估不同参数对所提方法性能的影响。与表 1 类似，实验在测试数据集全部图像上进行并计算平均指标。§A.3 给出这些研究的可视化。

**块尺寸的影响。** 我们考察重建时所用块尺寸 $P$ 对 20 视角 CT 重建问题的影响。为与主要实验保持一致，我们继续在可能时用更小块增强训练（主块尺寸 56，同时用 32 与 16 训练），并保持相同网络架构。每个实验按 (3) 需要不同零填充量。附录 A.4 给出完整细节。重建时整个算法使用同一块尺寸。"块尺寸"取 256 对应在整幅图像上训练扩散模型（无零填充）。表 4 表明，要针对给定训练集规模取得最佳结果，需仔细选择块尺寸。块尺寸过小时网络难以捕捉整幅图像的全局信息；尽管位置信息在此有帮助，块间仍可能不一致，因此所学图像先验次优，尽管块先验可能学得很好。另一极端，很大块尺寸与整幅图像扩散模型需要更多内存训练与运行；此时因训练数据有限、网络无法学好块先验，图像质量下降。

> **表 4（原文 Table 4）：** 块尺寸 $P$ 对 CT 重建的影响。

| $P$ | PSNR↑ | SSIM↑ |
|---|---|---|
| 8 | 32.57 | 0.844 |
| 16 | 32.57 | 0.829 |
| 32 | 32.72 | 0.853 |
| 56 | **33.57** | **0.854** |
| 96 | 33.36 | 0.854 |
| 256 | 32.84 | 0.835 |

**训练数据集规模的影响。** 本工作的关键动机是大规模逆问题训练数据有限。为考察小数据集对所提方法相对标准整幅图像模型的影响，我们在 CT 数据集的随机子集上训练网络。表 5 汇总结果。关键地，尽管块模型与整幅图像模型的重建质量都随数据集变小而下降，但整幅图像模型的下降剧烈得多、也明显得多，尤其当数据集很小时。该行为与先前工作一致——那些工作用含数千张图像的大数据集从头训练传统扩散模型。

> **表 5（原文 Table 5）：** 数据集规模对 CT 重建的影响。

| 数据集规模 | 块方法 PSNR↑ | SSIM↑ | 整幅图像 PSNR↑ | SSIM↑ |
|---|---|---|---|---|
| 144 | 32.28 | 0.841 | 29.12 | 0.804 |
| 288 | 32.43 | 0.837 | 31.09 | 0.829 |
| 576 | 33.03 | 0.846 | 31.81 | 0.835 |
| 1152 | 33.01 | 0.849 | 31.36 | 0.834 |
| 2304 | **33.57** | **0.854** | 32.84 | 0.835 |

**位置编码的影响。** 缺少位置编码信息的块模型不可能生成高质量图像，因为根本无法学习任何全局信息。我们证明位置信息对用块模型求解逆问题同样关键。我们对比了以不含位置编码的网络做 CT 重建与含位置编码的网络结果。根据 [69]，在某些设置下求解逆问题，用某个基线图像而非纯噪声初始化（传统做法）可能有益。为让未学位置信息的网络可能利用大致位于正确位置的块获得更好初始化，我们也做了以基线初始化的实验。表 6 表明两种情形下网络都完全未能学到块先验，重建质量很低。因此位置信息对学好整幅图像先验至关重要。

> **表 6（原文 Table 6）：** 位置编码对 CT 重建的影响。

| 设置 | PSNR↑ | SSIM↑ |
|---|---|---|
| 无位置编码 | 23.25 | 0.459 |
| 无位置编码 + 初始化 | 24.51 | 0.518 |
| 有位置编码 | **33.57** | **0.854** |

**采样方法。** 所提方法的一个优点是它提供整幅图像的黑盒先验，且完全通过神经网络在图像块上的运算计算。我们通过把多种不同采样与逆问题求解算法与块先验搭配（并与整幅图像先验比较）来展示该方法的通用性。实现的采样方法包括带数据保真梯度下降项的 Langevin 动力学 [1] 与求解 SDE 的预测–校正方法 [19]。由于观察到 Langevin 动力学更稳定、结果更好，我们也在该方法上结合依赖硬约束的零空间方法 [7] 与 DPS [5]。为在这些实现间共用同一网络检查点，我们用方差爆炸 SDE [2] 作为训练与重建的主干。DPS [5] 与 DDNM [7] 原本用 VP-SDE 框架训练的网络实现；这里我们用 VE-SDE 框架实现这些方法。表 7 表明总体上 VE-DPS 表现最佳，且块方法始终优于整幅图像方法；不过块方法在所有实现方法上都取得合理结果，表明所学图像先验确实足够灵活，可与多种采样算法搭配。附录 A.4 给出实现算法的更多细节。

> **表 7（原文 Table 7）：** 不同采样方法下的 CT 重建结果比较（块方法 vs 整幅图像）。

| 方法 | 块方法 PSNR↑ | SSIM↑ | 整幅图像 PSNR↑ | SSIM↑ |
|---|---|---|---|---|
| Langevin 动力学 | 33.03 | 0.846 | 30.92 | 0.813 |
| 预测–校正 | 32.35 | 0.820 | 18.95 | 0.149 |
| VE-DDNM | 31.98 | **0.861** | 29.49 | 0.830 |
| VE-DPS | **33.57** | 0.854 | 32.84 | 0.835 |

> **原文疑点：** 表 7 的表题为 "Dataset size effect on CT reconstruction"（数据集规模对 CT 重建的影响），但表格内容实为不同采样/逆问题求解方法的比较，与表 5 表题重复；疑为表题笔误，此处按原文照录并加注。

### A.3 消融研究图像

图 A.5 给出用不同块尺寸对两张示例测试图像应用 PaDIS 的结果。主要结果（即表 1 所示）使用 $P=56$。对某些其他块尺寸，图像中可见一些伪影：小块尺寸下图像平滑区域布满"虚假"特征，部分锐利特征变得更模糊。顶行右半部分的虚假特征在应用整幅图像模型时尤其明显。不同块尺寸的运行时间相当接近，其中 $P=8$ 因所需块数很多而明显更长。这些实验的图像尺寸足够小，所有块的得分函数可并行计算；但对更大规模问题（如高分辨率二维图像或三维图像），大块尺寸会因内存约束不可行。

> **图 A.5（原文 Fig. A.5）：** PaDIS 在不同块尺寸下对 20 视角 CT 重建的结果。

图 A.6 给出所提方法与整幅图像扩散模型在不同训练数据集规模下对 20 视角 CT 重建的结果。PaDIS 的图像质量随训练数据集缩小在视觉上保持稳定，因为每张图像包含数千个块，有助于避免过拟合与记忆；而整幅图像模型的质量下降明显得多：图像的锐利特征丢失、图像变模糊。因此在数据更受限的应用（如医学成像）中，我们的方法可能获益更大。

> **图 A.6（原文 Fig. A.6）：** 不同数据集规模下 20 视角 CT 重建结果。顶行为 PaDIS 重建，底行为整幅图像模型重建。

图 A.7 在两张不同图像上展示把位置编码信息加入块网络的重要性。不含位置信息时，网络只是学习所有块的混合，导致图像非常模糊，并因数据保真项产生许多伪影；即便提供更好的图像初始化，同样的模糊依然存在。

> **图 A.7（原文 Fig. A.7）：** PaDIS 在不同位置编码方法下对 20 视角 CT 重建的结果。

图 A.8 给出所提方法与整幅图像扩散模型在不同采样与逆问题求解算法下的结果。预测–校正算法在使用整幅图像模型时完全失败，表明该模型在此有限数据设置下无法被很好地训练。定量上 DPS 对 PaDIS 表现最好；视觉上所有方法都得到合理结果，尽管前四种方法存在较多次要伪影。这仍表明块先验灵活、可与多种现有算法搭配。

> **图 A.8（原文 Fig. A.8）：** PaDIS 在不同采样与逆问题求解算法下对 20 视角 CT 重建的结果。顶行为 PaDIS，底行为整幅图像模型。

### A.4 实验参数

我们按 [14] 训练块网络与整幅图像网络。由于图像缩放在 0 到 1 之间，我们选择最大噪声水平 $\sigma=40$、最小噪声水平 $\sigma=0.002$。所有块网络使用相同 UNet 架构：基础通道乘子为 128，四层每分辨率通道数为 1、2、2、2。我们还使用概率 0.05 的 dropout 连接，以及半衰期为 500K 个块的指数滑动平均权重衰减以避免过拟合。最后学习率取 $2\cdot10^{-4}$，主块尺寸的批大小为 128，两个更小块尺寸的批大小为 256 与 512。整个模型约 6000 万权重。对整幅图像模型，除把第四层每分辨率通道数增至 4 使模型约 1.1 亿权重外，其余参数保持一致，批大小为 8。

对图像生成与求解逆问题，我们使用经精细调节以优化各问题性能的几何间隔递减噪声水平，块模型与整幅图像模型使用同一组参数：

- 20 视角 CT：$\sigma_{\max}=10$，$\sigma_{\min}=0.002$
- 8 视角 CT：$\sigma_{\max}=10$，$\sigma_{\min}=0.003$
- 去模糊：$\sigma_{\max}=40$，$\sigma_{\min}=0.005$
- 超分辨率：$\sigma_{\max}=40$，$\sigma_{\min}=0.01$

线性逆问题的 ADMM-TV 方法求解如下优化问题

$$
\arg\max_x\ \frac12\|y-Ax\|_2^2+\lambda\,\mathrm{TV}(x), \tag{A.1}
$$

其中 $\mathrm{TV}(x)$ 表示 $x$ 的 L1 全变差，问题用交替方向乘子法求解。对 CT 重建、去模糊与超分辨率，我们分别取 $\lambda=0.001$、$0.002$、$0.006$。

**消融研究细节。** 对每个块尺寸，我们在可能时用主块尺寸并配合更小块训练。但由于未修改网络架构，而该架构对图像做 3 次 2 倍下采样，输入维度必须是 8 的倍数。此外，除另行说明，我们沿用与主要实验类似的块调度方法。最后为避免过多零填充，对较大块尺寸，我们使用小于下一个 2 的幂的块尺寸，使主图像仍能被同样数量的块完全覆盖。细节如下：

- $P=8$：只用该块尺寸训练，因为无法使用更小块。
- $P=16$：用块尺寸 8 与 16 训练，概率分别为 0.3 与 0.7。
- $P=32$：用块尺寸 8、16、32 训练，概率分别为 0.2、0.3、0.5。
- $P=56$：用块尺寸 16、32、56 训练，概率分别为 0.2、0.3、0.5；零填充宽度设为 $5\cdot56-256=24$。
- $P=96$：用块尺寸 32、64、96 训练，概率分别为 0.2、0.3、0.5；零填充宽度设为 $3\cdot96-256=32$。

### A.5 比较算法

本节给出所实现替代采样算法的伪代码，其结果见表 7。为简洁，这里展示使用整幅图像扩散模型的版本；使用所提方法的版本只需按算法 1 所述过程计算 $s=s(x,\sigma_i)$ 即可直接实现。

> **算法 A.1　Langevin 动力学图像重建**
> **Require：** $\sigma_1<\dots<\sigma_T$、$\epsilon>0$、$\zeta_i>0$、$y$
> 初始化 $x\sim\mathcal N(\mathbf 0,\sigma_T^2\mathbf I)$
> **for** $i=T:1$ **do**
> 　采样 $z\sim\mathcal N(\mathbf 0,\sigma_i^2\mathbf I)$
> 　置 $\alpha_i=\epsilon\cdot\sigma_i^2$
> 　用神经网络得 $D=D_\theta(x,\sigma_i)$
> 　置 $s=(D-x)/\sigma_i^2$
> 　置 $x=x+\zeta_iA^T(y-A(x))$
> 　置 $x=x+\frac{\alpha_i}{2}s+\sqrt{\alpha_i}z$
> **end for**
> **return** $x$

> **算法 A.2　预测–校正采样图像重建**
> **Require：** $\sigma_1<\dots<\sigma_T$、$\epsilon>0$、$\zeta_i>0$、$r$、$y$
> 初始化 $x\sim\mathcal N(\mathbf 0,\sigma_T^2\mathbf I)$
> **for** $i=T:1$ **do**
> 　置 $x=x+(\sigma_{i+1}^2-\sigma_i^2)s_\theta(x,\sigma_{i+1})$
> 　置 $x=x+\zeta_iA^T(y-A(x))$
> 　采样 $z\sim\mathcal N(\mathbf 0,\mathbf I)$
> 　置 $x=x+\sqrt{\sigma_{i+1}^2-\sigma_i^2}z$
> 　采样 $z\sim\mathcal N(\mathbf 0,\mathbf I)$
> 　置 $\epsilon_i=2r\frac{\|z\|_2}{\|s_\theta(x,\sigma_i)\|_2}$
> 　置 $s=s_\theta(x,\sigma_i)$
> 　置 $x=x+\epsilon_is+\sqrt{2\epsilon_i}z$
> 　置 $x=x+\zeta_iA^T(y-A(x))$
> **end for**
> **return** $x$

> **算法 A.3　DDNM**
> **Require：** $\sigma_1<\dots<\sigma_T$、$\epsilon>0$、$\zeta_i>0$、$y$
> 初始化 $x\sim\mathcal N(\mathbf 0,\sigma_T^2\mathbf I)$
> **for** $i=T:1$ **do**
> 　采样 $z\sim\mathcal N(\mathbf 0,\sigma_i^2\mathbf I)$
> 　置 $\alpha_i=\epsilon\cdot\sigma_i^2$
> 　用神经网络得 $D=D_\theta(x,\sigma_i)$
> 　置 $D=A^\dagger y+D-A^\dagger A(D)$
> 　置 $s=(D-x)/\sigma_i^2$
> 　置 $x=x+\frac{\alpha_i}{2}s+\sqrt{\alpha_i}z$
> **end for**
> **return** $x$

所有情形使用与主要 20 视角 CT 重建实验相同的噪声计划。对 Langevin 动力学与 DDNM，取 $\epsilon=1$，最终结果对该参数不敏感。对 Langevin 动力学与预测–校正采样，取 $\zeta_i=0.3/\|y-A(x)\|_2$，与 DPS 的步长选择类似。沿用 [19] 的工作，PC 采样取 $r=0.16$。块方法与整幅图像方法使用相同参数。表 8 给出 20 视角 CT 重建在测试数据集上各实现方法的平均运行时间。

> **表 8（原文 Table 8）：** 20 视角 CT 重建中各方法在测试数据集图像上的平均运行时间。

| 方法 | 运行时间（s）↓ |
|---|---|
| 基线 | 0.1 |
| ADMM-TV | 1 |
| PnP-ADMM | 8 |
| PnP-RED | 22 |
| 整幅图像扩散 | 172 |
| Langevin 动力学 | 98 |
| 预测–校正 | 189 |
| VE-DDNM | 105 |
| PaDIS（VE-DPS） | 195 |

### A.6 马尔可夫随机场解释

马尔可夫随机场（MRF）是表示某些图像分布的工具，尤其适用于基于块的扩散模型。描述 MRF 与本工作的联系需要一些记号：令 $x=\{x_s:s\in\mathcal S\}$ 表示随机场，索引 $\mathcal S$ 表示位置（site）。邻域系统 $\mathcal N$ 定义为 $\mathcal N=\{\mathcal N_s:s\in\mathcal S\}$。若

$$
p(x_s|x_{\mathcal S-\{s\}})=p(x_s|x_{\mathcal N_s}),\qquad\forall x\in\mathcal X,\ \forall s\in\mathcal S, \tag{A.2}
$$

则 $x\in\mathcal X$ 的模型是 $\mathcal S$ 上关于邻域系统 $\mathcal N$ 的 MRF。因此，每个位置（通常取为像素）在给定其余像素时的分布只依赖其邻域像素。

由 Hammersley–Clifford 定理 [70]，满足处处 $p(x)>0$ 的此类 MRF 可改写为 $p(x)=\frac1Z e^{-U(x)}$，其中 $Z$ 是归一化常数。此时 $U(x)$ 称为能量函数，形式为 $U(x)=\sum_{c\in\mathcal C}V_c(x)$，即所有可能团（clique）上团势 $V_c(x)$ 之和。于是 MRF 模型的得分函数为

$$
s(x)=\nabla\log p(x)=-\nabla U(x)=-\sum_c\nabla V_c(x). \tag{A.3}
$$

若令邻域系统为图像的块，则 $V_c$ 对应图像第 $c$ 个块的团势，$-\nabla V_c(x)$ 表示该块的得分函数。记 $\mathbf G_c$ 为从整幅图像中提取第 $c$ 个块对应像素的宽二元矩阵，定义 $V_c(x)=V(\mathbf G_cx,c^\ast)$，其中 $c^\ast$ 表示用于第 $c$ 个块的位置编码方法；此时我们只需一个（块）团函数 $V$。最终该模型下的总得分函数变为

$$
s(x)=\sum_c\mathbf G_c' s_V\left(\mathbf G_cx,c^\ast\right), \tag{A.4}
$$

其中 $s_V(v,c^\ast)\triangleq-\nabla_vV(v,c^\ast)$ 是各块共享的、以位置编码为输入的得分函数。

本工作中我们用参数为 $\theta$ 的神经网络近似 $s_V$，并用去噪得分匹配通过如下损失函数训练网络：

$$
\mathcal L(\theta)=\mathbb E_{t\sim\mathcal U(0,T)}\mathbb E_{x\sim p(x)}\mathbb E_{\epsilon\sim\mathcal N(\mathbf 0,\sigma_t^2\mathbf I)}\left\|s_\theta(x+\epsilon,\sigma_t)+\epsilon/\sigma_t^2\right\|_2^2 \tag{A.5}
$$

$$
=\mathbb E_{t\sim\mathcal U(0,T)}\mathbb E_{x\sim p(x)}\mathbb E_{\epsilon\sim\mathcal N(\mathbf 0,\sigma_t^2\mathbf I)}\left\|\sum_c\mathbf G_c' s_V\left(\mathbf G_cx,c^\ast;\theta\right)+\epsilon/\sigma_t^2\right\|_2^2. \tag{A.6}
$$

该推导对块不作任何假设；特别地，即便每次迭代的块相互重叠，该训练得分函数的方法仍然成立。但重叠会使训练代价高昂，因为损失函数每次训练迭代都需对所有块的求和反向传播。我们用不重叠块规避该问题（在给定重建迭代内；即我们的方法只在不同迭代之间"重叠"）。对不重叠块，求和可改写为

$$
\mathcal L(\theta)=\mathbb E_{t}\mathbb E_{x}\mathbb E_{\epsilon}\left\|\sum_c\mathbf G_c' s_V\left(\mathbf G_cx,c^\ast;\theta\right)+\mathbf G_c'\mathbf G_c\epsilon/\sigma_t^2\right\|_2^2 \tag{A.7}
$$

$$
=\mathbb E_{t\sim\mathcal U(0,T)}\mathbb E_{x\sim p(x)}\mathbb E_{\epsilon\sim\mathcal N(\mathbf 0,\sigma_t^2\mathbf I)}\mathbb E_{\text{随机 }c}\left\|s_V\left(\mathbf G_cx,c^\ast;\theta\right)+\mathbf G_c\epsilon/\sigma_t^2\right\|_2^2. \tag{A.8}
$$

该损失函数计算容易得多：我们现在可随机选取块并对单个块做去噪得分匹配，而无需一次考虑整幅图像；它与 (A.5) 等价。

### A.7 加速方法

尽管扩散模型能生成高质量图像，其迭代生成过程通常需要约 1000 次神经函数评估（NFE）[2, 3]，这是主要缺点。近年来在提升扩散模型采样速度方面已有大量工作 [14, 30, 31]。为复用同一训练好的网络，可先导出得分函数 $s(x,\sigma)$（由通过 (5) 训练的去噪器网络 $D(x,\sigma)$ 容易计算）与残差函数 $\epsilon(x,t)$（如 [3] 中用神经网络近似）之间的代数关系。得分匹配网络 $s_\theta(x,\sigma)$ 学习把 $x+\sigma\epsilon$ 映射为 $x$，而残差网络学习把 $x_t=\sqrt{\alpha_t}x_0+\sqrt{1-\alpha_t}\epsilon$ 映射为 $\epsilon$（$\epsilon\sim\mathcal N(0,I)$）。因此可把 $\frac{x_t}{\sqrt{\alpha_t}}=x_0+\frac{\sqrt{1-\alpha_t}}{\sqrt{\alpha_t}}\epsilon$ 作为含噪图像输入去噪得分匹配网络，使正确输出为 $x_0$；对应噪声水平为 $\sigma_t=\frac{\sqrt{1-\alpha_t}}{\sqrt{\alpha_t}}$。最后网络输出需按 $s_\theta(x)=-\epsilon(x)/\sigma$ 缩放。借助该变换，通过 (5) 训练的网络也可用于需要 $\epsilon_\theta$ 的采样算法。

基于这些想法，我们按 [14] 实现了 EDM 采样器（SDE 二阶求解器），它可在 18 次迭代内生成高保真图像（每次迭代需两次 NFE，共 36 NFE）。我们还实现了 50 个采样步的 DDIM [30]。图 A.9 给出这些方法与块先验以及 300 NFE 的 Langevin 动力学的结果。EDM 采样器产生明显边界伪影，DDIM 生成的图像也有不连续部分。该行为源于计算块先验的随机方式：按算法 1，我们随机选择整数 $i,j$ 来划分零填充图像并据该划分计算得分函数。因此每步尝试去除大量噪声的加速采样算法在去除边界伪影方面往往更差。该局限使加速采样算法难以用于我们的方法，是未来研究方向。

> **图 A.9（原文 Fig. A.9）：** 不同加速算法下 CT 图像的生成。顶行为 EDM 采样器 [14]，中间行为 DDIM [30]，底行为所提方法。

### A.8 附加图

图 A.10 给出表 2 中附加逆问题的视觉结果。

> **图 A.10（原文 Fig. A.10）：** 附加逆问题实验的结果。自上而下：60 视角 CT、扇束 CT、强去模糊；自左而右：基线、ADMM-TV、整幅图像扩散、PaDIS、真值。

为进一步探索把块组装成整幅图像的不同方法，我们按 [23] 与 [66] 的方法考察无条件生成的 CT 图像。与所提方法不同，这两种方法在所有时间步中块位置固定；此外必须使用重叠块以避免边界伪影。主要区别在于处理重叠像素的方式：[66] 用新的块更新覆盖重叠区域，而 [23] 对重叠区域取平均。我们使用与主要实验相同的 CT 图像训练检查点，块尺寸 56、重叠 8。图 A.11 给出生成图像：两种方法都能避免边界伪影，但生成图像的总体结构质量低于所提方法生成的图像（见表 4）。这表明所提方法最有效地把块先验组合为整幅图像的先验。

> **图 A.11（原文 Fig. A.11）：** 用块拼接 [66]（顶行）与块平均 [23]（底行）无条件生成的 CT 图像；可与图 4 中所提方法生成的图像比较。

图 A.12 与 A.13 分别给出测试数据集中每张图像在使用整幅图像模型与所提方法时的 PSNR。图中表明我们的方法在测试数据集上表现出相当一致的性能提升。

> **图 A.12（原文 Fig. A.12）：** 去模糊中整幅图像模型与所提方法在测试数据集每张图像上的 PSNR 比较。

> **图 A.13（原文 Fig. A.13）：** 超分辨率中整幅图像模型与所提方法在测试数据集每张图像上的 PSNR 比较。

## NeurIPS 论文检查表

以下为原文 NeurIPS 2024 论文检查表 15 项问答的译文；原文在每项后附的通用"Guidelines"为会议模板说明文字，非本文内容，未逐条译出。

1. **主张：** 摘要与引言的主要主张是否准确反映论文贡献与范围？**答：[是]。** 理由：摘要与引言中的主张都在论文其余部分得到展开。
2. **局限性：** 论文是否讨论局限？**答：[是]。** 理由：结论简要陈述了若干局限，附录（尤其 A.7 节）更深入讨论。
3. **理论假设与证明：** 每个理论结果是否给出完整假设与完整正确证明？**答：[是]。** 理由：第 3 节所作假设均清楚陈述；论文不含定理，但 A.6 节为所用部分算法提供理论解释。
4. **实验结果可复现性：** 论文是否充分披露复现主要实验结果所需信息？**答：[是]。** 理由：算法伪代码、超参数选择与数据集均在正文与附录完整给出。
5. **数据与代码的开放获取：** 论文是否提供数据与代码的开放获取及充分说明？**答：[是]。** 理由：我们已公开复现主要实验结果的代码，链接在摘要中给出。
6. **实验设置/细节：** 论文是否说明理解结果所需的全部训练与测试细节？**答：[是]。** 理由：实验全部细节已在第 4 节与 A.4 节给出。
7. **实验统计显著性：** 论文是否恰当报告误差条或其他统计显著性信息？**答：[否]。** 理由：未为主要结果提供误差条，因为结果是大量不同图像的平均、各项定量指标差异较大，不确定性意义不大；对同一批图像多次运行算法以获取不确定性测量在计算上昂贵。
8. **实验计算资源：** 论文是否提供复现实验所需计算资源的充分信息？**答：[是]。** 理由：实验所用计算资源与运行时间已在论文中说明。
9. **伦理准则：** 研究是否在各方面符合 NeurIPS 伦理准则？**答：[是]。** 理由：我们已阅读伦理准则并核对研究符合之。
10. **更广泛影响：** 论文是否讨论潜在正面与负面社会影响？**答：[是]。** 理由：我们在结论中讨论社会收益（降低 CT 剂量）与风险（幻觉与虚假信息）。
11. **防护措施：** 论文是否描述负责任发布高误用风险数据或模型的防护措施？**答：[是]。** 理由：所用模型可生成图像，但数据集已核查安全；由于模型只能生成与训练数据相似的图像，可生成图像也应符合该安全性。
12. **现有资产许可：** 所用资产（代码、数据、模型）的创作者或所有者是否被恰当署名、许可与使用条款是否明确说明并遵守？**答：[是]。** 理由：我们已引用论文使用的全部工作与数据集。
13. **新资产：** 论文引入的新资产是否有良好文档并随资产提供？**答：[不适用（NA）]。** 理由：论文描述了所用数据与方法，但我们尚未有时间把代码与数据整理为共享仓库。
14. **众包与人类受试者研究：** 论文是否包含给参与者的完整说明、截图及报酬细节？**答：[不适用]。** 理由：论文不涉及众包或人类受试者研究。
15. **机构审查委员会（IRB）批准或同等审查：** 论文是否描述研究参与者潜在风险、是否披露、是否获得 IRB 批准或同等审查？**答：[不适用]。** 理由：论文不涉及众包或人类受试者研究。

> **原文疑点：** 检查表第 13 项答"[不适用]"并称"尚未有时间把代码与数据整理为共享仓库"，而摘要与第 1 节均给出代码链接 https://github.com/sundeco/PaDIS 并称代码已公开；两处口径不一致，此处按原文照录并加注。

## 图注与表注索引

本页图 1–8、图 A.1–A.13 的中文图注与表 1–8 的表注均按原文出现位置内联在正文中（图 1–3 见第 1 与第 3 节，图 4–8 见第 4 节，表 1–3 见第 4 节，表 4–8 与图 A.1–A.13 见附录 A.1–A.8），此处不重复罗列。原文为 NeurIPS 会议单栏排版，图以浮动方式放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 NeurIPS 2024 会议论文集版本（本地 PDF 36 页）的中文译稿：摘要、第 1–5 节正文、图 1–8 与表 1–3、附录 A（A.1–A.8 节，含表 4–8、图 A.1–A.13、算法 A.1–A.3、式 (A.1)–(A.8)）、NeurIPS 论文检查表 15 项问答，以及参考文献 70 条英文原条目（按原编号；DOI 与部分页码从略）。公式与表格已对照 PDF 渲染页核对：式 (1)–(5) 与 (A.1)–(A.8) 逐式核对；表 1 用第 8 页渲染图逐格核对（基线至 PaDIS 共 11 行、四种问题全部数值一致），表 6–7 用第 20 页渲染图逐格核对（并发现表 7 表题错误），表 2–5、表 8 按原文表格数据转写并核对列结构。已加注两处原文疑点：(i) 表 7 表题误写为"Dataset size effect on CT reconstruction"，实为采样方法比较且与表 5 表题重复；(ii) 检查表第 13 项称代码与数据未整理为共享仓库，而摘要与第 1 节已给出代码链接。本页不上传原文图片，图 4–8、图 A.1–A.13 的重建图与生成样例不作数字化估算；正文与表格中的实验数值按原文转写。**再传播许可待核验，本页仅作学习用途，不计入可公开全文。** 逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。

{% endraw %}
