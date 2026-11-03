---
layout: page
title: "漂移生成建模（Drifting Models）｜中文全文译文"
permalink: /papers/translations/2026-11-03-2602-04770-generative-modeling-via-drifting/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/559408cea3232316/) · [原文 arXiv](https://arxiv.org/abs/2602.04770/) · [全部目录](/papers/catalog/)

# 漂移生成建模

**原题：** Generative Modeling via Drifting  
**作者：** Mingyang Deng、He Li、Tianhong Li、Yilun Du、Kaiming He  
**单位：** MIT¹、Harvard University²。原文脚注：¹ MIT；² Harvard University。项目页：lambertae.github.io/projects/drifting。  
**版本：** arXiv:2602.04770v2（PDF 首页 arXiv 戳：arXiv:2602.04770v2 [cs.LG]，6 Feb 2026）；28 页；作者项目页标注 NeurIPS 2026 Oral，本页按“已接收待刊”登记。  
**范围与状态：** 全文中文译稿：摘要、第 1–6 节正文与全部小节（§2、§3.1–3.5、§4、§5.1–5.3、§6）、致谢、式 (1)–(47)（保留原文编号）、表 1–11（逐格转写）、图 1–15 图注、算法 1–2 逐行、附录 A–C（A.1–A.9、B.1–B.5、C.1–C.2）、参考文献英文原条目 [1]–[70]；许可：CC BY 4.0（https://creativecommons.org/licenses/by/4.0/），按用户 2026-11-03 要求制作并公开本篇中文译文，保留署名与来源。逐句逐式终校未做。

## 摘要

生成建模（generative modeling）可以表述为学习一个映射 \(f\)，使其推前分布（pushforward distribution）与数据分布匹配。推前这一行为可以在推理时迭代地执行，例如在扩散/流式模型中。本文提出一种称为**漂移模型（Drifting Models）**的新范式：它在训练过程中演化推前分布，并自然支持一步推理。我们引入**漂移场（drifting field）**来控制样本的运动，并在分布匹配时达到平衡。由此得到一个训练目标，使神经网络的优化器能够演化该分布。在实验中，我们的一步生成器在 ImageNet 256×256 上取得当前最优（state-of-the-art）结果：潜空间 FID 为 1.54，像素空间 FID 为 1.61。我们希望本工作为高质量一步生成开辟新的机会。

**图 1（原文 Figure 1）：** 漂移模型。网络 \(f\) 执行推前操作 \(q=f_{\#}p_{\mathrm{prior}}\)，把先验分布 \(p_{\mathrm{prior}}\)（例如高斯分布，图中未画出）映射为推前分布 \(q\)（橙色）。训练目标是逼近数据分布 \(p_{\mathrm{data}}\)（蓝色）。随着训练迭代，我们得到模型序列 \(\{f_i\}\)，它对应推前分布序列 \(\{q_i\}\)。我们的漂移模型关注该推前分布在训练时的演化。我们引入漂移场（详见正文），它在 \(q\) 与 \(p_{\mathrm{data}}\) 匹配时趋近于零；该漂移场提供了一个用于训练的损失函数（纵轴为对数尺度）。（图中元素：上方一排等高线面板对应不同训练迭代下的分布 \(q\) 与 \(p_{\mathrm{data}}\)；下方曲线为损失随训练迭代下降的折线，横轴为 Training Iteration \(i\)，纵轴为 Loss，标度为 \(10^{-2}\)、\(10^{-3}\)、\(10^{-4}\)。）

## 1 引言

生成模型通常被认为比判别模型更具挑战性。判别建模通常关注把单个样本映射到其对应标签，而生成建模关心的是从一个分布到另一个分布的映射。这可以表述为学习一个映射 \(f\)，使先验分布 \(p_{\mathrm{prior}}\) 的推前与数据分布匹配，即 \(f_{\#}p_{\mathrm{prior}}\approx p_{\mathrm{data}}\)。从概念上说，生成建模学习的是一个**泛函**（functional，此处为 \(f_{\#}\)），它从一个函数（此处为一个分布）映射到另一个函数。

“推前”这一行为可以在推理时**迭代地**实现，例如在扩散（Diffusion）（Sohl-Dickstein et al., 2015）与流匹配（Flow Matching）（Lipman et al., 2022）等主流范式中。生成时，这些模型把噪声较大的样本映射到稍微干净一些的样本，逐步把样本分布演化到数据分布。这一建模范式可以看作把一个复杂的推前映射（即 \(f_{\#}\)）分解为一串更可行的变换，并在推理时依次施加。

本文提出**漂移模型（Drifting Models）**，一种新的生成建模范式。漂移模型的特点是：学习一个在**训练时**演化的推前映射，从而不再需要迭代式推理过程。该映射 \(f\) 由单次前向、非迭代的网络表示。由于深度学习优化中的训练过程本身就是迭代的，因此可以自然地把训练看作通过更新 \(f\) 来演化推前分布 \(f_{\#}p_{\mathrm{prior}}\)。见图 1。

为了驱动训练时推前分布的演化，我们引入一个**漂移场**来控制样本的运动。该场依赖于生成分布与数据分布。按定义，当两个分布匹配时该场变为零，从而到达一个样本不再漂移的平衡状态。

基于这一表述，我们提出一个简单的训练目标，即最小化生成样本的**漂移量**。该目标诱导样本运动，从而通过迭代优化（例如 SGD）演化底层的推前分布。我们进一步给出漂移场、神经网络模型与训练算法的设计。

漂移模型自然实现**单步**（“1-NFE”）生成，并取得很强的经验性能。在 ImageNet 256×256 上，在标准的潜空间生成协议下，我们取得 1-NFE 的 FID 1.54，在单步方法中创造了新的当前最优。即使与多步的扩散/流式模型相比，该结果仍具竞争力。此外，在更具挑战性的像素空间生成协议下（即不使用潜变量），我们取得 1-NFE 的 FID 1.61，显著优于先前的像素空间方法。这些结果表明，漂移模型为高质量、高效的生成建模提供了一个有前景的新范式。

## 2 相关工作

**基于扩散/流式的模型。** 扩散模型（例如 Sohl-Dickstein et al. 2015; Ho et al. 2020; Song et al. 2020）及其流式对应方法（例如 Lipman et al. 2022; Liu et al. 2022; Albergo et al. 2023）通过**微分方程**（SDE 或 ODE）来刻画从噪声到数据的映射。其推理时计算的核心是迭代更新，例如 \(\mathbf{x}_{i+1}=\mathbf{x}_i+\Delta\mathbf{x}_i\) 这样的形式，例如用 Euler 求解器。更新量 \(\Delta\mathbf{x}_i\) 依赖神经网络 \(f\)，因此生成需要多步网络评估。

大量工作致力于减少扩散/流式模型的步数。基于蒸馏的方法（例如 Salimans & Ho 2022; Luo et al. 2023; Yin et al. 2024; Zhou et al. 2024）把一个预训练的多步模型蒸馏为单步模型。另一条研究线旨在从头训练一步扩散/流式模型（例如 Song et al. 2023; Frans et al. 2024; Boffi et al. 2025; Geng et al. 2025a）。为实现这一目标，这些方法通过近似所诱导的轨迹，把 SDE/ODE 动力学纳入训练。相反，我们的工作提出了一种概念上不同的范式，不依赖扩散/流式模型中的 SDE/ODE 表述。

**生成对抗网络（GANs）。** GAN（Goodfellow et al., 2014）是一类经典模型，通过把生成样本与真实数据区分开来训练生成器。与 GAN 类似，我们的方法也涉及一个把噪声映射到数据的单次前向网络 \(f\)，其“优劣”由损失函数评估；但与 GAN 不同，我们的方法不依赖对抗式优化。

**变分自编码器（VAEs）。** VAE（Kingma & Welling, 2013）优化证据下界（ELBO），它由一个重构损失与一个 KL 散度项组成。使用高斯先验时，经典 VAE 就是一步生成器。如今 VAE 的主流应用往往退而采用从其他方法学到的先验，例如扩散（Rombach et al., 2022）或自回归模型（Esser et al., 2021），此时 VAE 实际充当分词器（tokenizer）。

**归一化流（NFs）。** NF（Rezende & Mohamed, 2015; Dinh et al., 2016; Zhai et al., 2024）学习从数据到噪声的映射，并优化样本的对数似然。这类方法需要可逆架构与可计算的 Jacobian。从概念上说，NF 在推理时相当于一步生成器，其计算由网络的逆完成。

**矩匹配。** 矩匹配方法（Dziugaite et al., 2015; Li et al., 2015）试图最小化生成分布与数据分布之间的最大均值差异（MMD）。矩匹配近来已被扩展到一步/少步扩散（Zhou et al., 2025）。与 MMD 相关，我们的方法也利用核函数以及正/负样本的概念。不过我们的方法关注一个在训练时显式控制样本漂移的漂移场。进一步讨论见 C.2。

**对比学习。** 我们的漂移场由来自数据分布的正样本与来自生成分布的负样本驱动。这在概念上关联于**对比表示学习**（contrastive representation learning）中的正、负样本（Hadsell et al., 2006; Oord et al., 2018）。对比学习的思想也被扩展到生成模型，例如 GAN（Unterthiner et al., 2017; Kang & Park, 2020）或流匹配（Stoica et al., 2025）。

## 3 用于生成的漂移模型

我们提出漂移模型，它把生成建模表述为通过漂移场在**训练时**演化推前分布。我们的模型在推理时自然实现一步生成。

### 3.1 训练时的推前

考虑一个神经网络 \(f:\mathbb{R}^{C}\mapsto\mathbb{R}^{D}\)。\(f\) 的输入为 \(\boldsymbol{\epsilon}\sim p_{\boldsymbol{\epsilon}}\)（例如任意 \(C\) 维噪声），输出记为 \(\mathbf{x}=f(\boldsymbol{\epsilon})\in\mathbb{R}^{D}\)。一般而言，输入与输出维度不必相等。

我们把网络输出的分布记为 \(q\)，即 \(\mathbf{x}=f(\boldsymbol{\epsilon})\sim q\)。在概率论中，\(q\) 称为 \(p_{\boldsymbol{\epsilon}}\) 在 \(f\) 下的**推前分布**，记为：

$$
q=f_{\#}p_{\boldsymbol{\epsilon}}.\tag{1}
$$

这里“\(f_{\#}\)”表示由 \(f\) 诱导的推前。直观上，该记号表示 \(f\) 把一个分布 \(p_{\boldsymbol{\epsilon}}\) 变换为另一个分布 \(q\)。生成建模的目标是找到 \(f\)，使得 \(f_{\#}p_{\boldsymbol{\epsilon}}\approx p_{\mathrm{data}}\)。

由于神经网络的**训练**本身是迭代的（例如 SGD），训练过程会产生模型序列 \(\{f_i\}\)，其中 \(i\) 表示训练迭代。这对应训练期间的一组推前分布 \(\{q_i\}\)，其中对每个 \(i\) 有 \(q_i=[f_i]_{\#}p_{\boldsymbol{\epsilon}}\)。训练过程逐步演化 \(q_i\) 使之匹配 \(p_{\mathrm{data}}\)。

当网络 \(f\) 被更新时，训练迭代 \(i\) 处的一个样本被隐式地“漂移”为：\(\mathbf{x}_{i+1}=\mathbf{x}_i+\Delta\mathbf{x}_i\)，其中 \(\Delta\mathbf{x}_i:=f_{i+1}(\boldsymbol{\epsilon})-f_i(\boldsymbol{\epsilon})\) 来自 \(f\) 的参数更新。这意味着 \(f\) 的更新决定了 \(\mathbf{x}\) 的“残差”，我们称其为“漂移”。

### 3.2 用于训练的漂移场

接下来，我们定义一个**漂移场**来控制样本 \(\mathbf{x}\)（进而推前分布 \(q\)）在训练时的演化。漂移场是一个在给定 \(\mathbf{x}\) 时计算 \(\Delta\mathbf{x}\) 的函数。形式化地，把该场记为 \(\mathbf{V}_{p,q}(\cdot):\mathbb{R}^{d}\to\mathbb{R}^{d}\)，我们有：

$$
\mathbf{x}_{i+1}=\mathbf{x}_i+\mathbf{V}_{p,q_i}(\mathbf{x}_i).\tag{2}
$$

这里 \(\mathbf{x}_i=f_i(\boldsymbol{\epsilon})\sim q_i\)，漂移之后我们记 \(\mathbf{x}_{i+1}\sim q_{i+1}\)。下标 \(p,q\) 表示该场依赖 \(p\)（例如 \(p=p_{\mathrm{data}}\)）与当前分布 \(q\)。

理想情况下，当 \(p=q\) 时，我们希望所有 \(\mathbf{x}\) 停止漂移，即 \(\mathbf{V}=\mathbf{0}\)。本文考虑如下命题：

**命题 3.1.** 考虑一个**反对称**（anti-symmetric）漂移场：

$$
\mathbf{V}_{p,q}(\mathbf{x})=-\mathbf{V}_{q,p}(\mathbf{x}),\quad\forall\mathbf{x}.\tag{3}
$$

则有：\(q=p\;\Rightarrow\;\mathbf{V}_{p,q}(\mathbf{x})=\mathbf{0},\ \forall\mathbf{x}\)。

证明是直接的¹。直观上，反对称意味着交换 \(p\) 与 \(q\) 只会翻转漂移的符号。该命题表明：如果推前分布 \(q\) 与数据分布 \(p\) 匹配，则对任意样本漂移为零，模型达到平衡。

> **脚注 1（原文脚注）：** ¹ \(q=p\Rightarrow\mathbf{V}_{p,q}=\mathbf{V}_{q,p}=-\mathbf{V}_{p,q}\Rightarrow\mathbf{V}_{p,q}=\mathbf{0}\)。

我们指出，反过来的蕴含关系，即 \(\mathbf{V}_{p,q}=\mathbf{0}\Rightarrow q=p\)，对任意选取的 \(\mathbf{V}\) 一般不成立。对于我们的核化表述（第 3.3 节），我们给出了 \(\mathbf{V}_{p,q}\approx\mathbf{0}\) 蕴含 \(q\approx p\) 的充分条件（附录 C.1）。

**训练目标。** 平衡性质启发我们定义一个训练目标。令 \(f_{\theta}\) 为以 \(\theta\) 参数化的网络，\(\mathbf{x}=f_{\theta}(\boldsymbol{\epsilon})\) 对应 \(\boldsymbol{\epsilon}\sim p_{\boldsymbol{\epsilon}}\)。在 \(\mathbf{V}=\mathbf{0}\) 的平衡处，我们建立如下**不动点**关系：

$$
f_{\hat{\theta}}(\boldsymbol{\epsilon})=f_{\hat{\theta}}(\boldsymbol{\epsilon})+\mathbf{V}_{p,q_{\hat{\theta}}}\left(f_{\hat{\theta}}(\boldsymbol{\epsilon})\right).\tag{4}
$$

这里 \(\hat{\theta}\) 表示能达到平衡的最优参数，\(q_{\hat{\theta}}\) 表示 \(f_{\hat{\theta}}\) 的推前。

该式启发了训练期间的不动点迭代。在迭代 \(i\) 处，我们试图满足：

$$
f_{\theta_{i+1}}(\boldsymbol{\epsilon})\leftarrow f_{\theta_i}(\boldsymbol{\epsilon})+\mathbf{V}_{p,q_{\theta_i}}\left(f_{\theta_i}(\boldsymbol{\epsilon})\right).\tag{5}
$$

我们把这个更新规则转换为损失函数：

$$
\mathcal{L}=\mathbb{E}_{\boldsymbol{\epsilon}}\left[\left\|\underbrace{f_{\theta}(\boldsymbol{\epsilon})}_{\text{prediction}}-\underbrace{\mathrm{stopgrad}\left(f_{\theta}(\boldsymbol{\epsilon})+\mathbf{V}_{p,q_{\theta}}\left(f_{\theta}(\boldsymbol{\epsilon})\right)\right)}_{\text{frozen target}}\right\|^{2}\right].\tag{6}
$$

这里，停止梯度（stop-gradient）操作提供一个来自上一次迭代的冻结状态，沿用（Chen & He, 2021; Song & Dhariwal, 2023）的做法。直观上，我们计算一个冻结的目标，并把网络预测向它移动。

我们指出，损失函数 \(\mathcal{L}\) 的**取值**等于 \(\mathbb{E}_{\boldsymbol{\epsilon}}\left[\|\mathbf{V}(f(\boldsymbol{\epsilon}))\|^{2}\right]\)，即漂移场 \(\mathbf{V}\) 的平方范数。借助停止梯度的形式，我们的求解器并不直接通过 \(\mathbf{V}\) 反传，因为 \(\mathbf{V}\) 依赖 \(q_{\theta}\)，而通过分布反传并非易事。相反，我们的表述**间接地**最小化该目标：它把 \(\mathbf{x}=f_{\theta}(\boldsymbol{\epsilon})\) 移向其漂移后的版本，即移向在这一迭代中被冻结的 \(\mathbf{x}+\Delta\mathbf{x}\)。

### 3.3 设计漂移场

场 \(\mathbf{V}_{p,q}\) 依赖两个分布 \(p\) 与 \(q\)。为得到可计算的表述，我们考虑如下形式：

$$
\mathbf{V}_{p,q}(\mathbf{x})=\mathbb{E}_{\mathbf{y}^{+}\sim p}\mathbb{E}_{\mathbf{y}^{-}\sim q}\left[\mathcal{K}(\mathbf{x},\mathbf{y}^{+},\mathbf{y}^{-})\right],\tag{7}
$$

其中 \(\mathcal{K}(\cdot,\cdot,\cdot)\) 是一个类核函数，描述三个样本点之间的交互。\(\mathcal{K}\) 可以可选地依赖 \(p\) 与 \(q\)。只要在 \(p=q\) 时 \(\mathbf{V}=\mathbf{0}\)，我们的框架就支持一大类函数 \(\mathcal{K}\)。

对于本工作的具体实例，我们引入一种由吸引与排斥驱动的 \(\mathbf{V}\) 形式。受**均值漂移**方法（Cheng, 1995）启发，我们定义如下场：

$$
\begin{aligned}
\mathbf{V}_{p}^{+}(\mathbf{x})&:=\frac{1}{Z_p}\mathbb{E}_p\left[k(\mathbf{x},\mathbf{y}^{+})(\mathbf{y}^{+}-\mathbf{x})\right],\\
\mathbf{V}_{q}^{-}(\mathbf{x})&:=\frac{1}{Z_q}\mathbb{E}_q\left[k(\mathbf{x},\mathbf{y}^{-})(\mathbf{y}^{-}-\mathbf{x})\right].
\end{aligned}\tag{8}
$$

这里 \(Z_p\) 与 \(Z_q\) 是归一化因子：

$$
Z_p(\mathbf{x}):=\mathbb{E}_p[k(\mathbf{x},\mathbf{y}^{+})],\qquad Z_q(\mathbf{x}):=\mathbb{E}_q[k(\mathbf{x},\mathbf{y}^{-})].\tag{9}
$$

直观上，式 (8) 计算向量差 \(\mathbf{y}-\mathbf{x}\) 的加权均值。权重由核 \(k(\cdot,\cdot)\) 给出，并经由式 (9) 归一化。随后我们定义 \(\mathbf{V}\) 为：

$$
\mathbf{V}_{p,q}(\mathbf{x}):=\mathbf{V}_{p}^{+}(\mathbf{x})-\mathbf{V}_{q}^{-}(\mathbf{x}).\tag{10}
$$

直观上，该场可视为被数据分布 \(p\) 吸引、被样本分布 \(q\) 排斥。这在图 2 中给出示意。

**图 2（原文 Figure 2）：** 单个样本漂移的示意。一个生成样本 \(\mathbf{x}\)（黑色）按向量 \(\mathbf{V}=\mathbf{V}_{p}^{+}-\mathbf{V}_{q}^{-}\) 漂移。这里 \(\mathbf{V}_{p}^{+}\) 是正样本（蓝色）的均值漂移向量，\(\mathbf{V}_{q}^{-}\) 是负样本（橙色）的均值漂移向量：见式 (8)。\(\mathbf{x}\) 被 \(\mathbf{V}_{p}^{+}\) 吸引、被 \(\mathbf{V}_{q}^{-}\) 排斥。（图中元素：左上方图例分别为“Positive samples \(\mathbf{y}^{+}\sim p\)”蓝点与“Negative samples \(\mathbf{y}^{-}\sim q\)”橙点；背景为两组等高线，中心一个黑点 \(\mathbf{x}\) 处画出两个箭头 \(\mathbf{V}_{q}^{-}\) 与 \(\mathbf{V}_{p}^{+}\)，以及合向量 \(\mathbf{V}\)。）

把式 (8) 代入式 (10)，得到：

$$
\mathbf{V}_{p,q}(\mathbf{x})=\frac{1}{Z_pZ_q}\mathbb{E}_{p,q}\left[k(\mathbf{x},\mathbf{y}^{+})k(\mathbf{x},\mathbf{y}^{-})(\mathbf{y}^{+}-\mathbf{y}^{-})\right].\tag{11}
$$

这里，向量差化简为 \(\mathbf{y}^{+}-\mathbf{y}^{-}\)；权重由两个核计算并联合归一化。该形式是式 (7) 的一个实例。容易看出 \(\mathbf{V}\) 是反对称的：\(\mathbf{V}_{p,q}=-\mathbf{V}_{q,p}\)。一般而言，我们的方法并不要求把 \(\mathbf{V}\) 分解为吸引与排斥；它只要求当 \(p=q\) 时 \(\mathbf{V}=\mathbf{0}\)。

**核。** 核 \(k(\cdot,\cdot)\) 可以是度量相似度的函数。本文采用：

$$
k(\mathbf{x},\mathbf{y})=\exp\left(-\frac{1}{\tau}\|\mathbf{x}-\mathbf{y}\|\right),\tag{12}
$$

其中 \(\tau\) 是温度（temperature），\(\|\cdot\|\) 是 \(\ell_2\) 距离。我们把 \(\tilde{k}(\mathbf{x},\mathbf{y})\triangleq\frac{1}{Z}k(\mathbf{x},\mathbf{y})\) 视为归一化核，它吸收了式 (11) 中的归一化。

在实践中，我们用 softmax 操作实现 \(\tilde{k}\)，其 logits 由 \(-\frac{1}{\tau}\|\mathbf{x}-\mathbf{y}\|\) 给出，softmax 在 \(\mathbf{y}\) 上取值。该 softmax 操作类似于对比学习中 InfoNCE（Oord et al., 2018）的做法。在我们的实现中，还在一个批内的 \(\{\mathbf{x}\}\) 集合上额外施加一次 softmax 归一化，这在实践中略微提升性能。该额外归一化不改变所得 \(\mathbf{V}\) 的反对称性质。

**平衡与匹配分布。** 由于式 (6) 中的训练损失鼓励最小化 \(\|\mathbf{V}\|^{2}\)，我们希望 \(\mathbf{V}\approx\mathbf{0}\) 能推出 \(q\approx p\)。虽然该蕴含关系对任意 \(\mathbf{V}\) 不成立，我们在经验上观察到 \(\|\mathbf{V}\|^{2}\) 的下降与生成质量的提升相关。在附录 C.1 中，我们给出一个可辨识性（identifiability）启发式论证：对于我们的核化构造，零漂移条件在一对 \((p,q)\) 上施加了大量双线性约束，在温和的非退化假设下这迫使 \(p\) 与 \(q\) 匹配（近似地）。

**随机训练。** 在随机训练（例如小批量优化）中，我们用经验均值近似式 (11) 中的期望来估计 \(\mathbf{V}\)。每个训练步，我们抽取 \(N\) 个噪声样本 \(\boldsymbol{\epsilon}\sim p_{\boldsymbol{\epsilon}}\)，计算一批 \(\mathbf{x}=f_{\theta}(\boldsymbol{\epsilon})\sim q\)。这些生成样本同时充当同一批内的负样本，即 \(\mathbf{y}^{-}\sim q\)。另一方面，我们采样 \(N_{\mathrm{pos}}\) 个数据点 \(\mathbf{y}^{+}\sim p_{\mathrm{data}}\)。漂移场 \(\mathbf{V}\) 就在这批正、负样本上计算。算法 1 给出这样一个训练步的伪代码，其中 `compute_V` 见 A.1 节。

**算法 1（原文 Algorithm 1）：** 训练损失。注意：为简洁起见，此处的负样本 `y_neg` 来自同一批生成数据，不过它们也可以包含其他来源的负样本。

```python
# f: generator
# y_pos: [N_pos, D], data samples

e = randn([N, C])        # noise
x = f(e)                 # [N, D], generated samples
y_neg = x                # reuse x as negatives

V = compute_V(x, y_pos, y_neg)
x_drifted = stopgrad(x + V)

loss = mse_loss(x - x_drifted)
```

### 3.4 在特征空间中漂移

到目前为止，我们直接在原始数据空间中定义目标 (6)。我们的表述可以扩展到任意特征空间。令 \(\phi\) 表示作用于真实样本或生成样本的特征提取器（例如图像编码器）。我们把损失 (6) 在特征空间中改写为：

$$
\mathbb{E}\left[\left\|\phi(\mathbf{x})-\mathrm{stopgrad}\left(\phi(\mathbf{x})+\mathbf{V}\left(\phi(\mathbf{x})\right)\right)\right\|^{2}\right].\tag{13}
$$

这里 \(\mathbf{x}=f_{\theta}(\boldsymbol{\epsilon})\) 是生成器的输出（例如图像）。\(\mathbf{V}\) 在特征空间中定义：在实践中，这意味着 \(\phi(\mathbf{y}^{+})\) 与 \(\phi(\mathbf{y}^{-})\) 充当正/负样本。值得注意的是，特征编码是训练时的操作，在推理时不使用。

这还可以进一步扩展到多个特征，例如在多个尺度与位置上：

$$
\sum_{j}\mathbb{E}\left[\left\|\phi_j(\mathbf{x})-\mathrm{stopgrad}\left(\phi_j(\mathbf{x})+\mathbf{V}\left(\phi_j(\mathbf{x})\right)\right)\right\|^{2}\right].\tag{14}
$$

这里 \(\phi_j\) 表示编码器 \(\phi\) 在第 \(j\) 个尺度和/或位置处的特征向量。使用 ResNet 式图像编码器（He et al., 2016）时，我们在多个尺度与位置上计算漂移损失，这为训练提供了更丰富的梯度信息。

特征提取器在高维数据生成中起着重要作用。由于我们的方法基于核 \(k(\cdot,\cdot)\) 来刻画样本相似度，我们希望语义相似的样本在特征空间中保持接近。这一目标与自监督学习（例如 He et al. 2020; Chen et al. 2020a）一致。我们使用预训练的自监督模型作为特征提取器。

**与感知损失的关系。** 我们的特征空间损失与感知损失（perceptual loss）（Zhang et al., 2018）相关，但概念上不同。感知损失最小化：\(\|\phi(\mathbf{x})-\phi(\mathbf{x}_{\mathrm{target}})\|_2^{2}\)，即回归目标是 \(\phi(\mathbf{x}_{\mathrm{target}})\)，需要把 \(\mathbf{x}\) 与其目标配对。相反，式 (13) 中的回归目标是 \(\phi(\mathbf{x})+\mathbf{V}\left(\phi(\mathbf{x})\right)\)，漂移发生在特征空间中，且不需要配对。原则上，我们的特征空间损失旨在匹配推前分布 \(\phi_{\#}q\) 与 \(\phi_{\#}p\)。

**与潜空间生成的关系。** 我们的特征空间损失与潜空间生成器（例如 Latent Diffusion（Rombach et al., 2022））的概念是**正交**的。在我们的情形中，使用 \(\phi\) 时，生成器 \(f\) 仍然可以在像素空间或分词器的潜空间中产生输出。如果生成器 \(f\) 位于潜空间而特征提取器 \(\phi\) 位于像素空间，则在从 \(\phi\) 提取特征之前要先施加分词器解码器。

### 3.5 无分类器引导

无分类器引导（classifier-free guidance, CFG）（Ho & Salimans, 2022）通过在类条件分布与无条件分布之间做外推来提升生成质量。我们的方法自然支持一种相关的引导形式。

在我们的模型中，给定类别标签 \(c\) 作为条件，底层目标分布 \(p\) 变为 \(p_{\mathrm{data}}(\cdot|c)\)，我们可以从中抽取正样本：\(\mathbf{y}^{+}\sim p_{\mathrm{data}}(\cdot|c)\)。为实现引导，我们从生成样本或来自不同类别的**真实**样本中抽取负样本。形式化地，负样本分布现在为：

$$
\tilde{q}(\cdot|c)\triangleq(1-\gamma)q_{\theta}(\cdot|c)+\gamma\,p_{\mathrm{data}}(\cdot|\varnothing).\tag{15}
$$

这里 \(\gamma\in[0,1)\) 是混合率，\(p_{\mathrm{data}}(\cdot|\varnothing)\) 表示**无条件**数据分布²。

> **脚注 2（原文脚注）：** ² 这里应当是排除类别 \(c\) 的数据分布。为简单起见，我们使用无条件数据分布。

学习目标是找到 \(\tilde{q}(\cdot|c)=p_{\mathrm{data}}(\cdot|c)\)。把它代入 (15)，得到：

$$
q_{\theta}(\cdot|c)=\alpha\,p_{\mathrm{data}}(\cdot|c)-(\alpha-1)\,p_{\mathrm{data}}(\cdot|\varnothing),\tag{16}
$$

其中 \(\alpha=\frac{1}{1-\gamma}\ge1\)。这意味着 \(q_{\theta}(\cdot|c)\) 要去近似条件数据分布与无条件数据分布的线性组合。这与原始 CFG 的精神一致。

在实践中，式 (15) 意味着：除了生成数据之外，我们还从 \(p_{\mathrm{data}}(\cdot|\varnothing)\) 的数据中采样额外的负样本。分布 \(q_{\theta}(\cdot|c)\) 对应一个类条件网络 \(f_{\theta}(\cdot|c)\)，与常见做法类似（Ho & Salimans, 2022）。我们指出，在我们的方法中，CFG 在设计上是一种**训练时**行为：推理时仍保持一步（1-NFE）的性质。

## 4 面向图像生成的实现

我们描述在 ImageNet（Deng et al., 2009）256×256 分辨率上做图像生成的实现。完整的实现细节见附录 A。

**分词器。** 默认情况下我们在潜空间中生成（Rombach et al., 2022）。我们采用标准的 SD-VAE 分词器，它产生 32×32×4 的潜空间，生成在该空间中进行。

**架构。** 我们的生成器（\(f_{\theta}\)）具有 DiT 式（Peebles & Xie, 2023）架构。其输入是 32×32×4 维高斯噪声 \(\boldsymbol{\epsilon}\)，输出是同样维度的生成潜变量 \(\mathbf{x}\)。我们使用 patch 大小 2，即类似 DiT/2。我们的模型使用 adaLN-zero（Peebles & Xie, 2023）来处理类条件或其他额外条件。

**CFG 条件化。** 我们沿用（Geng et al., 2025b）并采用 CFG-conditioning。训练时随机采样一个 CFG 尺度 \(\alpha\)（式 (16)）。负样本按 \(\alpha\) 准备（式 (15)），网络以该值为条件。推理时，\(\alpha\) 可以自由指定与变化而无需重训练。细节见 A.7。

**组批。** 算法 1 的伪代码描述的是 \(N=N_{\mathrm{neg}}\) 个生成样本的一批。实践中，当涉及类别标签时，我们采样一批 \(N_c\) 个类别标签。对每个标签，我们**独立**执行算法 1。相应地，有效批大小为 \(B=N_c\times N\)，它由 \(N_c\times N_{\mathrm{neg}}\) 个负样本与 \(N_c\times N_{\mathrm{pos}}\) 个正样本组成。

我们依据生成样本 \(\mathbf{x}\) 的数量定义一个“训练轮（training epoch）”。具体而言，每次迭代生成 \(B\) 个样本，对于规模为 \(N_{\mathrm{data}}\) 的数据集，一个轮对应 \(N_{\mathrm{data}}/B\) 次迭代。

**特征提取器。** 我们的模型在特征空间中用漂移损失训练（第 3.4 节）。特征提取器 \(\phi\) 是一个图像编码器。我们主要考虑 ResNet 式（He et al., 2016）编码器，用自监督学习预训练，例如 MoCo（He et al., 2020）与 SimCLR（Chen et al., 2020a）。当这些预训练模型工作在像素空间时，我们施加 VAE 解码器，把生成器的潜空间输出映射回像素空间再做特征提取。梯度经由特征编码器与 VAE 解码器反传。我们还研究了在潜空间中预训练的 MAE（He et al., 2022）（详见 A.3）。

对所有 ResNet 式模型，特征从多个阶段（即多尺度特征图）提取。式 (13) 中的漂移损失在每个尺度上计算后再组合。我们在 A.6 中详述。

**像素空间生成。** 虽然我们的实验主要关注潜空间生成，我们的模型也支持像素空间生成。此时 \(\boldsymbol{\epsilon}\) 与 \(\mathbf{x}\) 都是 256×256×3。我们使用 patch 大小 16（即 DiT/16）。特征提取器 \(\phi\) 直接作用于像素空间。

## 5 实验

### 5.1 玩具实验

**生成分布的演化。** 图 3 可视化了一个 2D 玩具案例：在三种初始化下，\(q\) 在训练时向一个双峰分布 \(p\) 演化。在这个玩具例子中，我们的方法逼近了目标分布，没有出现模式坍塌（mode collapse）。即使 \(q\) 被初始化在坍塌的单峰状态（最下一行），这一点也成立。这为我们的方法为何对模式坍塌稳健提供了直觉：如果 \(q\) 坍塌到某一个模式上，\(p\) 的其他模式会吸引样本，使它们继续移动并推动 \(q\) 继续演化。

**图 3（原文 Figure 3）：** 生成分布的演化。训练过程中分布 \(q\)（橙色）向双峰目标 \(p\)（蓝色）演化。我们展示了 \(q\) 的三种初始化：（上）初始化在两个模式之间；（中）初始化在远离两个模式处；（下）初始化坍塌到一个模式上。在所有初始化下，我们的方法都逼近目标分布，没有出现模式坍塌。（图中元素：左列为 Case 1/2/3 三行，每行自左至右为 Iter 0、Iter 8、Iter 20、Iter 80 的等高线图；图例为 Data \(p\) 与 Generated \(q\)。）

**样本的演化。** 图 4 展示了两个 2D 案例上的训练过程。一个小的 MLP 生成器被训练。损失（其取值等于 \(\|\mathbf{V}\|^{2}\)）随生成分布收敛到目标而下降。这与我们的动机一致：减小漂移并推向平衡，将近似得到 \(p=q\)。

**图 4（原文 Figure 4）：** 样本的演化。我们展示在不同训练迭代处采样的生成点，以及它们的损失值。损失（其取值等于 \(\|\mathbf{V}\|^{2}\)）随分布收敛到目标而下降。（纵轴为对数尺度。）（图中元素：两行 2D 案例，每行为 Iter 0、Iter 50、Iter 100、Iter 200、Iter 500、Iter 1000、Iter 2000、Ground Truth 的散点图；每行下方为对数尺度损失曲线，横轴 Training Iteration。）

### 5.2 ImageNet 实验

我们在 ImageNet 256×256 上评估模型。消融研究使用 SD-VAE 潜空间上的 B/2 模型，训练 100 个轮。漂移损失在由 latent-MAE 编码器计算的特征空间中。我们报告 50K 张生成图像上的 FID（Heusel et al., 2017）。下面分析结果。

**反对称性。** 我们的平衡推导要求漂移场是反对称的；见式 (3)。在表 1 中，我们做了一项**破坏性**研究，刻意打破这种反对称性。反对称情形（我们的消融默认）工作良好，而其他情形灾难性失败。直观上，对样本 \(\mathbf{x}\)，我们希望当 \(p\) 与 \(q\) 匹配时来自 \(p\) 的吸引被来自 \(q\) 的排斥抵消。这种平衡在破坏性情形中没有达到。

**表 1（原文 Table 1）：** 反对称性的重要性：打破反对称性会导致失败。这里，反对称情形在式 (10) 与式 (11) 中定义；其他破坏性情形以类似方式定义。（设置：B/2 模型，100 轮）

| 情形 | 漂移场 \(\mathbf{V}\) | FID |
|---|---|---|
| **反对称（默认）** | **\(\mathbf{V}^{+}-\mathbf{V}^{-}\)** | **8.46** |
| 1.5× 吸引 | \(1.5\mathbf{V}^{+}-\mathbf{V}^{-}\) | 41.05 |
| 1.5× 排斥 | \(\mathbf{V}^{+}-1.5\mathbf{V}^{-}\) | 46.28 |
| 2.0× 吸引 | \(2\mathbf{V}^{+}-\mathbf{V}^{-}\) | 86.16 |
| 2.0× 排斥 | \(\mathbf{V}^{+}-2\mathbf{V}^{-}\) | 112.84 |
| 仅吸引 | \(\mathbf{V}^{+}\) | 177.14 |

**正、负样本的分配。** 我们的方法采样正、负样本来估计 \(\mathbf{V}\)（见算法 1）。在表 2 中，我们在固定轮数与固定批大小 \(B\) 的条件下研究 \(N_{\mathrm{pos}}\) 与 \(N_{\mathrm{neg}}\) 的影响。

表 2 表明使用更大的 \(N_{\mathrm{pos}}\) 与 \(N_{\mathrm{neg}}\) 有益。更大的样本量预期能提升 \(\mathbf{V}\) 估计的精度，从而提升生成质量。这一观察与对比学习中的结果一致（Oord et al., 2018; He et al., 2020; Chen et al., 2020a）：在对比学习中更大的样本集合改善表示学习。

**表 2（原文 Table 2）：** 正、负样本的分配。在两个子表中，我们通过固定轮数（100）与批大小 \(B=N_c\times N_{\mathrm{pos}}\)（4096）来控制总计算量。这里 \(N_c\) 对应类别标签。在相同预算下，增加正样本（左）与负样本（右）都能改善生成质量。（设置：B/2 模型，100 轮）原文以粗体标出各子表末行中被强调的分配值与 FID。

（a）增加正样本（左子表）

| \(N_c\) | \(N_{\mathrm{pos}}\) | \(N_{\mathrm{neg}}\) | \(B\) | FID |
|---|---|---|---|---|
| 64 | 1 | 64 | 4096 | 20.43 |
| 64 | 16 | 64 | 4096 | 10.39 |
| 64 | 32 | 64 | 4096 | 8.97 |
| 64 | **64** | 64 | 4096 | **8.46** |

（b）增加负样本（右子表）

| \(N_c\) | \(N_{\mathrm{pos}}\) | \(N_{\mathrm{neg}}\) | \(B\) | FID |
|---|---|---|---|---|
| 512 | 8 | 8 | 4096 | 11.82 |
| 256 | 16 | 16 | 4096 | 10.16 |
| 128 | 32 | 32 | 4096 | 9.32 |
| 64 | 64 | **64** | 4096 | **8.46** |

**用于漂移的特征空间。** 我们的模型在特征空间中计算漂移损失（第 3.4 节）。表 3 比较了各特征编码器。使用 SimCLR（Chen et al., 2020a）与 MoCo v2（Chen et al., 2020b）的公开预训练编码器时，我们的方法取得不错的结果。

这些标准编码器工作在像素域，因此在训练时需要运行 VAE 解码器。为绕开这一点，我们用 MAE 目标（He et al., 2022）直接在潜空间上预训练一个 ResNet 式模型。由这个“latent-MAE”产生的特征空间表现很强（表 3）。增大 MAE 编码器宽度与预训练轮数都能提升生成质量；用分类器微调（“cls ft”）可把结果进一步提升到 3.36 FID。

**表 3（原文 Table 3）：** 用于漂移的特征空间。我们比较自监督学习（SSL）编码器。标准 SimCLR 与 MoCo 编码器取得有竞争力的结果，而我们定制的 latent-MAE 表现最好，并能从更大宽度与更长训练中获益。（生成器设置：B/2 模型，100 轮）原文表头 “feature encoder (\(\phi\))” 为跨列合并标题；末行 FID 3.36 为原文粗体。

| SSL 方法 | 架构 | 模块 | 宽度 | SSL 轮数 | FID |
|---|---|---|---|---|---|
| SimCLR | ResNet | bottleneck | 256 | 800 | 11.05 |
| MoCo-v2 | ResNet | bottleneck | 256 | 800 | 8.41 |
| latent-MAE（默认） | ResNet | basic | 256 | 192 | 8.46 |
| latent-MAE | ResNet | basic | 384 | 192 | 7.26 |
| latent-MAE | ResNet | basic | 512 | 192 | 6.49 |
| latent-MAE | ResNet | basic | 640 | 192 | 6.30 |
| latent-MAE | ResNet | basic | 640 | 1280 | 4.28 |
| latent-MAE + cls ft | ResNet | basic | 640 | 1280 | **3.36** |

表 3 的比较表明特征编码器的质量起重要作用。我们推测这是因为我们的方法依赖核 \(k(\cdot,\cdot)\)（见式 (12)）来度量样本相似度。在特征空间中更接近的样本通常产生更强的漂移，从而提供更丰富的训练信号。这一目标与自监督学习的动机一致。强的特征编码器会减少近乎“平坦”的核出现（即 \(k(\cdot,\cdot)\) 因所有样本相距很远而消失）。

另一方面，我们报告：在没有特征编码器的情况下，我们无法让方法在 ImageNet 上工作。此时即使存在潜空间 VAE，核也可能无法有效刻画相似度。我们把这一局限的进一步研究留待未来工作。

**系统级比较。** 除消融设置之外，我们还训练了更强的变体，并在表 4 中汇总。我们在表 5 中与先前方法比较。

我们的方法以**原生** 1-NFE 生成取得 1.54 FID。它优于此前的所有 1-NFE 方法，后者都基于对扩散/流式轨迹的近似。值得注意的是，我们的 Base 规模模型可与先前的 XL 规模模型竞争。我们最好的模型（FID 1.54）使用 CFG 尺度 1.0，这对应于基于扩散的方法中的“无 CFG”。我们的 CFG 表述在 FID 与 IS 之间存在权衡（见 B.3），与标准 CFG 类似。

我们在附录 B.5 的图 7–10 中提供未挑选（uncurated）的定性结果，CFG 取 1.0。此外，图 11–15 展示了与改进版 MeanFlow（iMF）（Geng et al., 2025b）——近期一个当前最优的单步方法——的并排比较。

**表 4（原文 Table 4）：** 从消融到最终设置。我们训练更多轮、针对该训练区间调整超参数，并使用更大的模型规模。原文以粗体标出最终设置所在行的 FID 1.54。

| 情形 | 架构 | 轮数（epoch） | FID |
|---|---|---|---|
| (a) 基线（来自表 3） | B/2 | 100 | 3.36 |
| (b) 更长训练 | B/2 | 320 | 2.51 |
| (c) 更长 + 调超参数 | B/2 | 1280 | 1.75 |
| (d) 更大模型 | L/2 | 1280 | **1.54** |

**表 5（原文 Table 5）：** 系统级比较：潜空间中的 ImageNet 256×256 生成。FID 在 50K 张图像上计算，凡适用者均以 CFG 报告。参数量为“生成器 + 解码器”。所有生成器均为从头训练（即未蒸馏）。原文中“多步扩散/流式”各行的文字为浅灰排印（仅作参照，分组标题行除外）；粗体为多步基线中的最优 FID 1.13（RAE+DiT\(^{\mathrm{DH}}\)-XL/2）与 Drifting Models 两行的方法名及最终 FID 1.54。

| 方法 | 空间 | 参数量 | NFE | FID↓ | IS↑ |
|---|---|---|---|---|---|
| *多步扩散/流式* | | | | | |
| DiT-XL/2（Peebles & Xie, 2023） | SD-VAE | 675M+49M | 250×2 | 2.27 | 278.2 |
| SiT-XL/2（Ma et al., 2024） | SD-VAE | 675M+49M | 250×2 | 2.06 | 270.3 |
| SiT-XL/2+REPA（Yu et al., 2024） | SD-VAE | 675M+49M | 250×2 | 1.42 | 305.7 |
| LightningDiT-XL/2（Yao et al., 2025） | VA-VAE | 675M+70M | 250×2 | 1.35 | 295.3 |
| RAE+DiT\(^{\mathrm{DH}}\)-XL/2（Zheng et al., 2025） | RAE | 839M+415M | 50×2 | **1.13** | 262.6 |
| *单步扩散/流式* | | | | | |
| iCT-XL/2（Song & Dhariwal, 2023） | SD-VAE | 675M+49M | 1 | 34.24 | – |
| Shortcut-XL/2（Frans et al., 2024） | SD-VAE | 675M+49M | 1 | 10.60 | – |
| MeanFlow-XL/2（Geng et al., 2025a） | SD-VAE | 676M+49M | 1 | 3.43 | – |
| AdvFlow-XL/2（Lin et al., 2025） | SD-VAE | 673M+49M | 1 | 2.38 | 284.2 |
| iMeanFlow-XL/2（Geng et al., 2025b） | SD-VAE | 610M+49M | 1 | 1.72 | 282.0 |
| *漂移模型* | | | | | |
| **Drifting Model, B/2** | SD-VAE | 133M+49M | 1 | 1.75 | 263.2 |
| **Drifting Model, L/2** | SD-VAE | 463M+49M | 1 | **1.54** | 258.9 |

**像素空间生成。** 我们的方法自然可以**不使用**潜空间 VAE，即生成器 \(f\) 直接产生 256×256×3 图像。此时特征编码器作用在生成图像上以计算漂移损失。我们采用与潜空间变体相似的配置；实现细节见附录 A。

表 6 比较了不同的像素空间生成器。我们的一步、像素空间方法取得 1.61 FID，优于或可竞争先前的多步方法。与其它一步、像素空间方法（GAN）相比，我们的方法仅用 87G FLOPs 即取得 1.61 FID；相比之下，StyleGAN-XL 用 1574G FLOPs 取得 2.30 FID。更多消融见 B.1。

**表 6（原文 Table 6）：** 系统级比较：像素空间中的 ImageNet 256×256 生成。FID 在 50K 张图像上计算，凡适用者均以 CFG 报告。参数量为生成器的参数量。所有生成器均为从头训练（即未蒸馏）。原文中“多步扩散/流式”整块文字以浅灰排印（表示仅供参照）；粗体为 SiD2, UViT/1 的 FID 1.38 与 Drifting Model, L/16 的 FID 1.61，以及 Drifting Models 两行的方法名。

| 方法 | 空间 | 参数量 | NFE | FID↓ | IS↑ |
|---|---|---|---|---|---|
| *多步扩散/流式* | | | | | |
| ADM-G（Dhariwal & Nichol, 2021） | pix | 554M | 250×2 | 4.59 | 186.7 |
| SiD, UViT/2（Hoogeboom et al., 2023） | pix | 2.5B | 1000×2 | 2.44 | 256.3 |
| VDM++, UViT/2（Kingma & Gao, 2023） | pix | 2.5B | 256×2 | 2.12 | 267.7 |
| SiD2, UViT/2（Hoogeboom et al., 2024） | pix | – | 512×2 | 1.73 | – |
| SiD2, UViT/1（Hoogeboom et al., 2024） | pix | – | 512×2 | **1.38** | – |
| JiT-G/16（Li & He, 2025） | pix | 2B | 100×2 | 1.82 | 292.6 |
| PixelDiT/16（Yu et al., 2025） | pix | 797M | 200×2 | 1.61 | 292.7 |
| *单步扩散/流式* | | | | | |
| EPG-L/16（Lei et al., 2025） | pix | 540M | 1 | 8.82 | – |
| *GAN* | | | | | |
| BigGAN（Brock et al., 2018） | pix | 112M | 1 | 6.95 | 152.8 |
| GigaGAN（Kang et al., 2023） | pix | 569M | 1 | 3.45 | 225.5 |
| StyleGAN-XL（Sauer et al., 2022） | pix | 166M | 1 | 2.30 | 265.1 |
| *漂移模型* | | | | | |
| **Drifting Model, B/16** | pix | 134M | 1 | 1.76 | 299.7 |
| **Drifting Model, L/16** | pix | 464M | 1 | **1.61** | 307.5 |

### 5.3 机器人控制实验

除图像生成之外，我们进一步在机器人控制上评估方法。我们的实验设计与协议沿用 **Diffusion Policy**（Chi et al., 2023）。Diffusion Policy 的核心是一个多步的、基于扩散的生成器；我们把它替换为我们的一步漂移模型。我们直接在用于控制的**原始**表示上计算漂移损失，不使用特征空间。结果在表 7 中。我们的 1-NFE 模型可匹敌或超过使用 100 NFE 的当前最优 Diffusion Policy。这一比较表明，漂移模型可以作为一个有前景的生成模型用于不同领域。

**表 7（原文 Table 7）：** 机器人控制：与 Diffusion Policy 的比较。评估协议沿用 Diffusion Policy（Chi et al., 2023）。本表涉及四个单阶段任务与两个多阶段任务。“Drifting Policy”（我们的）把多步 Diffusion Policy 生成器替换为我们的一步生成器。成功率报告为最后 10 个检查点的平均值。原文在每个任务行内对两者中较优的值加粗（并列时两列均加粗）；带浅灰底纹的行为分组标题行；“Drifting Policy”列标题（含 NFE: 1）为粗体。

| 任务 | 设置 | Diffusion Policy：NFE 100 | **Drifting Policy：NFE 1** |
|---|---|---|---|
| *单阶段任务（状态与视觉观测）* | | | |
| Lift | State | 0.98 | **1.00** |
| | Visual | **1.00** | **1.00** |
| Can | State | 0.96 | **0.98** |
| | Visual | 0.97 | **0.99** |
| ToolHang | State | 0.30 | **0.38** |
| | Visual | **0.73** | 0.67 |
| PushT | State | **0.91** | 0.86 |
| | Visual | 0.84 | **0.86** |
| *多阶段任务（状态观测）* | | | |
| BlockPush | Phase 1 | 0.36 | **0.56** |
| | Phase 2 | 0.11 | **0.16** |
| Kitchen | Phase 1 | **1.00** | **1.00** |
| | Phase 2 | **1.00** | **1.00** |
| | Phase 3 | **1.00** | 0.99 |
| | Phase 4 | **0.99** | 0.96 |

## 6 讨论与结论

我们提出了**漂移模型**，一种新的生成建模范式。我们模型的核心思想是在**训练时**对推前分布的演化建模。这使我们能够在迭代训练过程中关注更新规则，即 \(\mathbf{x}_{i+1}=\mathbf{x}_i+\Delta\mathbf{x}_i\)。这与在**推理时**执行迭代更新的扩散/流式模型形成对比。我们的方法在推理时自然实现一步生成。

鉴于我们的方法差异很大，仍有许多开放问题。例如，虽然我们证明了 \(q=p\Rightarrow\mathbf{V}=\mathbf{0}\)，但反过来的蕴含关系在理论上一般不成立。虽然我们设计的 \(\mathbf{V}\) 在经验上表现良好，但在什么条件下 \(\mathbf{V}\to\mathbf{0}\) 能导出 \(q\to p\) 仍不清楚。

从实践角度看，尽管本文给出了漂移建模的一个有效实例，我们的许多设计选择可能仍非最优。例如，漂移场及其核的设计、特征编码器、以及生成器架构都仍有待未来探索。

从更广的视角看，我们的工作把迭代式的神经网络训练重新阐释为一种分布演化的机制，这与扩散/流式模型背后的微分方程形成对照。我们希望这一视角能启发未来工作中对这一机制的其它实现方式的探索。

## 致谢

我们非常感谢 Google TPU Research Cloud（TRC）为我们提供 TPU 访问权限。我们感谢 Michael Albergo、Ziqian Zhong、Yilun Xu、Zhengyang Geng、Hanhong Zhao、Jiangqi Dai、Alex Fan 与 Shaurya Agrawal 的有益讨论。Mingyang Deng 部分受 MIT-IBM Watson AI Lab 的经费资助。

## 参考文献

（原文采用作者—年份制、未编号，条目按字母序排列；本页按同一字母顺序编号 [1]–[70] 以便检索，条目保留英文原文。）

[1] Albergo, M. S., Boffi, N. M., and Vanden-Eijnden, E. Stochastic interpolants: A unifying framework for flows and diffusions. arXiv preprint arXiv:2303.08797, 2023.

[2] Boffi, N. M., Albergo, M. S., and Vanden-Eijnden, E. Flow map matching with stochastic interpolants: A mathematical framework for consistency models. TMLR, 2025.

[3] Brock, A., Donahue, J., and Simonyan, K. Large scale GAN training for high fidelity natural image synthesis. arXiv preprint arXiv:1809.11096, 2018.

[4] Chen, T., Kornblith, S., Norouzi, M., and Hinton, G. A simple framework for contrastive learning of visual representations. In ICML, 2020a.

[5] Chen, X. and He, K. Exploring simple siamese representation learning. In CVPR, pp. 15750–15758, 2021.

[6] Chen, X., Fan, H., Girshick, R., and He, K. Improved baselines with momentum contrastive learning. arXiv preprint arXiv:2003.04297, 2020b.

[7] Cheng, Y. Mean shift, mode seeking, and clustering. TPAMI, 1995.

[8] Chi, C., Feng, S., Du, Y., Xu, Z., Cousineau, E., Burchfiel, B., and Song, S. Diffusion policy: Visuomotor policy learning via action diffusion. In RSS, 2023.

[9] Deng, J., Dong, W., Socher, R., Li, L.-J., Li, K., and Fei-Fei, L. ImageNet: A large-scale hierarchical image database. In CVPR, pp. 248–255. Ieee, 2009.

[10] Dhariwal, P. and Nichol, A. Diffusion models beat GANs on image synthesis. NeurIPS, 34:8780–8794, 2021.

[11] Dinh, L., Sohl-Dickstein, J., and Bengio, S. Density estimation using real NVP. arXiv preprint arXiv:1605.08803, 2016.

[12] Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., Dehghani, M., Minderer, M., Heigold, G., Gelly, S., Uszkoreit, J., and Houlsby, N. An image is worth 16x16 words: Transformers for image recognition at scale. In ICLR, 2021.

[13] Dziugaite, G. K., Roy, D. M., and Ghahramani, Z. Training generative neural networks via maximum mean discrepancy optimization. arXiv preprint arXiv:1505.03906, 2015.

[14] Esser, P., Rombach, R., and Ommer, B. Taming transformers for high-resolution image synthesis. In CVPR, pp. 12873–12883, 2021.

[15] Frans, K., Hafner, D., Levine, S., and Abbeel, P. One step diffusion via shortcut models. arXiv preprint arXiv:2410.12557, 2024.

[16] Geng, Z., Deng, M., Bai, X., Kolter, J. Z., and He, K. Mean flows for one-step generative modeling. arXiv preprint arXiv:2505.13447, 2025a.

[17] Geng, Z., Lu, Y., Wu, Z., Shechtman, E., Kolter, J. Z., and He, K. Improved mean flows: On the challenges of fastforward generative models. arXiv preprint arXiv:2512.02012, 2025b.

[18] Goodfellow, I. J., Pouget-Abadie, J., Mirza, M., Xu, B., Warde-Farley, D., Ozair, S., Courville, A., and Bengio, Y. Generative adversarial nets. NeurIPS, 2014.

[19] Hadsell, R., Chopra, S., and LeCun, Y. Dimensionality reduction by learning an invariant mapping. In CVPR, pp. 1735–1742, 2006.

[20] He, K., Zhang, X., Ren, S., and Sun, J. Deep residual learning for image recognition. In CVPR, pp. 770–778, 2016.

[21] He, K., Fan, H., Wu, Y., Xie, S., and Girshick, R. Momentum contrast for unsupervised visual representation learning. In CVPR, pp. 9729–9738, 2020.

[22] He, K., Chen, X., Xie, S., Li, Y., Dollár, P., and Girshick, R. Masked autoencoders are scalable vision learners. In CVPR, 2022.

[23] Henry, A., Dachapally, P. R., Pawar, S. S., and Chen, Y. Query-key normalization for transformers. In EMNLP, pp. 4246–4253, 2020.

[24] Heusel, M., Ramsauer, H., Unterthiner, T., Nessler, B., and Hochreiter, S. GANs trained by a two time-scale update rule converge to a local nash equilibrium. NeurIPS, 2017.

[25] Ho, J. and Salimans, T. Classifier-free diffusion guidance. arXiv preprint arXiv:2207.12598, 2022.

[26] Ho, J., Jain, A., and Abbeel, P. Denoising diffusion probabilistic models. NeurIPS, 33:6840–6851, 2020.

[27] Hoogeboom, E., Heek, J., and Salimans, T. Simple diffusion: End-to-end diffusion for high resolution images. In ICML, pp. 13213–13232. PMLR, 2023.

[28] Hoogeboom, E., Mensink, T., Heek, J., Lamerigts, K., Gao, R., and Salimans, T. Simpler diffusion (SiD2): 1.5 fid on ImageNet512 with pixel-space diffusion. arXiv preprint arXiv:2410.19324, 2024.

[29] Ioffe, S. and Szegedy, C. Batch normalization: Accelerating deep network training by reducing internal covariate shift. In ICML, pp. 448–456. pmlr, 2015.

[30] Kang, M. and Park, J. ContraGAN: Contrastive learning for conditional image generation. NeurIPS, 33:21357–21369, 2020.

[31] Kang, M., Zhu, J.-Y., Zhang, R., Park, J., Shechtman, E., Paris, S., and Park, T. Scaling up GANs for text-to-image synthesis. In CVPR, pp. 10124–10134, 2023.

[32] Kingma, D. and Gao, R. Understanding diffusion objectives as the ELBO with simple data augmentation. NeurIPS, 36:65484–65516, 2023.

[33] Kingma, D. P. and Welling, M. Auto-encoding variational bayes. arXiv preprint arXiv:1312.6114, 2013.

[34] Lei, J., Liu, K., Berner, J., Yu, H., Zheng, H., Wu, J., and Chu, X. There is no VAE: End-to-end pixel-space generative modeling via self-supervised pre-training. arXiv preprint arXiv:2510.12586, 2025.

[35] Li, T. and He, K. Back to basics: Let denoising generative models denoise. arXiv preprint arXiv:2511.13720, 2025.

[36] Li, Y., Swersky, K., and Zemel, R. Generative moment matching networks. In ICML, pp. 1718–1727. PMLR, 2015.

[37] Lin, S., Yang, C., Lin, Z., Chen, H., and Fan, H. Adversarial flow models. arXiv preprint arXiv:2511.22475, 2025.

[38] Lipman, Y., Chen, R. T., Ben-Hamu, H., Nickel, M., and Le, M. Flow matching for generative modeling. arXiv preprint arXiv:2210.02747, 2022.

[39] Liu, X., Gong, C., and Liu, Q. Flow straight and fast: Learning to generate and transfer data with rectified flow. arXiv preprint arXiv:2209.03003, 2022.

[40] Loshchilov, I. and Hutter, F. Decoupled weight decay regularization. In ICLR, 2019.

[41] Luo, W., Hu, T., Zhang, S., Sun, J., Li, Z., and Zhang, Z. Diff-Instruct: A universal approach for transferring knowledge from pre-trained diffusion models. NeurIPS, 36:76525–76546, 2023.

[42] Ma, N., Goldstein, M., Albergo, M. S., Boffi, N. M., Vanden-Eijnden, E., and Xie, S. SiT: Exploring flow and diffusion-based generative models with scalable interpolant transformers. In ECCV, pp. 23–40. Springer, 2024.

[43] Oord, A. v. d., Li, Y., and Vinyals, O. Representation learning with contrastive predictive coding. arXiv preprint arXiv:1807.03748, 2018.

[44] Peebles, W. and Xie, S. Scalable diffusion models with transformers. In CVPR, pp. 4195–4205, 2023.

[45] Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., Goh, G., Agarwal, S., Sastry, G., Askell, A., Mishkin, P., Clark, J., Krueger, G., and Sutskever, I. Learning transferable visual models from natural language supervision. In ICML, pp. 8748–8763. PmLR, 2021.

[46] Rezende, D. and Mohamed, S. Variational inference with normalizing flows. In ICML, pp. 1530–1538. PMLR, 2015.

[47] Rombach, R., Blattmann, A., Lorenz, D., Esser, P., and Ommer, B. High-resolution image synthesis with latent diffusion models. In CVPR, pp. 10684–10695, 2022.

[48] Ronneberger, O., Fischer, P., and Brox, T. U-Net: Convolutional networks for biomedical image segmentation. In MICCAI, 2015.

[49] Salimans, T. and Ho, J. Progressive distillation for fast sampling of diffusion models. arXiv preprint arXiv:2202.00512, 2022.

[50] Sauer, A., Schwarz, K., and Geiger, A. StyleGAN-XL: Scaling StyleGAN to large diverse datasets. In SIGGRAPH, pp. 1–10, 2022.

[51] Shazeer, N. GLU variants improve transformer. arXiv preprint arXiv:2002.05202, 2020.

[52] Sohl-Dickstein, J., Weiss, E., Maheswaranathan, N., and Ganguli, S. Deep unsupervised learning using nonequilibrium thermodynamics. In ICML, pp. 2256–2265. pmlr, 2015.

[53] Song, Y. and Dhariwal, P. Improved techniques for training consistency models. arXiv preprint arXiv:2310.14189, 2023.

[54] Song, Y., Sohl-Dickstein, J., Kingma, D. P., Kumar, A., Ermon, S., and Poole, B. Score-based generative modeling through stochastic differential equations. arXiv preprint arXiv:2011.13456, 2020.

[55] Song, Y., Dhariwal, P., Chen, M., and Sutskever, I. Consistency models. 2023.

[56] Stoica, G., Ramanujan, V., Fan, X., Farhadi, A., Krishna, R., and Hoffman, J. Contrastive flow matching. arXiv preprint arXiv:2506.05350, 2025.

[57] Su, J., Ahmed, M., Lu, Y., Pan, S., Bo, W., and Liu, Y. Roformer: Enhanced transformer with totary position embedding. IJON, 568:127063, 2024.

[58] Unterthiner, T., Nessler, B., Seward, C., Klambauer, G., Heusel, M., Ramsauer, H., and Hochreiter, S. Coulomb GANs: Provably optimal nash qquilibria via potential fields. arXiv preprint arXiv:1708.08819, 2017.

[59] Woo, S., Debnath, S., Hu, R., Chen, X., Liu, Z., Kweon, I. S., and Xie, S. ConvNeXt V2: Co-designing and scaling ConvNets with masked autoencoders. In CVPR, pp. 16133–16142, 2023.

[60] Wu, Y. and He, K. Group normalization. In ECCV, pp. 3–19, 2018.

[61] Yao, J., Yang, B., and Wang, X. Reconstruction vs. generation: Taming optimization dilemma in latent diffusion models. In CVPR, pp. 15703–15712, 2025.

[62] Yin, T., Gharbi, M., Zhang, R., Shechtman, E., Durand, F., Freeman, W. T., and Park, T. One-step diffusion with distribution matching distillation. In CVPR, pp. 6613–6623, 2024.

[63] Yu, S., Kwak, S., Jang, H., Jeong, J., Huang, J., Shin, J., and Xie, S. Representation alignment for generation: Training diffusion transformers is easier than you think. arXiv preprint arXiv:2410.06940, 2024.

[64] Yu, Y., Xiong, W., Nie, W., Sheng, Y., Liu, S., and Luo, J. PixelDiT: Pixel diffusion transformers for image generation. arXiv preprint arXiv:2511.20645, 2025.

[65] Zhai, S., Zhang, R., Nakkiran, P., Berthelot, D., Gu, J., Zheng, H., Chen, T., Bautista, M. A., Jaitly, N., and Susskind, J. Normalizing flows are capable generative models. arXiv preprint arXiv:2412.06329, 2024.

[66] Zhang, B. and Sennrich, R. Root mean square layer normalization. NeurIPS, 32, 2019.

[67] Zhang, R., Isola, P., Efros, A. A., Shechtman, E., and Wang, O. The unreasonable effectiveness of deep features as a perceptual metric. In CVPR, 2018.

[68] Zheng, B., Ma, N., Tong, S., and Xie, S. Diffusion transformers with representation autoencoders. arXiv preprint arXiv:2510.11690, 2025.

[69] Zhou, L., Ermon, S., and Song, J. Inductive moment matching. arXiv preprint arXiv:2503.07565, 2025.

[70] Zhou, M., Zheng, H., Wang, Z., Yin, M., and Huang, H. Score identity distillation: Exponentially fast distillation of pretrained diffusion models for one-step generation. In ICML, 2024.

## 附录 A 附加实现细节

表 8 汇总了消融研究与系统级比较所用的配置与超参数。我们给出详细的实验配置以便复现。所有消融研究共享一套共同的默认设置，而系统级比较使用放大后的配置。更多实现细节描述如下。

**表 8（原文 Table 8）：** ImageNet 256×256 的配置。原文为大量跨列合并单元格的表（分组行为浅灰底纹；共用取值跨所有配置列）。本页把跨全部配置列的合并单元格记为“（所有配置相同）”，对部分跨列的单元格在表注中说明。

| 项目 | ablation 默认 | B/2，latent（表 5） | L/2，latent（表 5） | B/16，pixel（表 6） | L/16，pixel（表 6） |
|---|---|---|---|---|---|
| *生成器架构* | | | | | |
| arch | DiT-B/2 | DiT-B/2 | DiT-L/2 | DiT-B/16 | DiT-L/16 |
| input size | 32×32×4 | 32×32×4 | 32×32×4 | 32×32×4 | 32×32×4 |
| patch size | 2×2 | 2×2 | 2×2 | 16×16 | 16×16 |
| hidden dim | 768 | 768 | 1024 | 768 | 1024 |
| depth | 12 | 12 | 24 | 12 | 24 |
| register tokens | 16 | 16 | 16 | 16 | 16 |
| style embedding tokens | 32 | 32 | 32 | 32 | 32 |
| *漂移损失的特征编码器* | | | | | |
| arch | ResNet | ResNet | ResNet | ResNet + ConvNeXt-V2 | ResNet + ConvNeXt-V2 |
| SSL pre-train method | latent-MAE | latent-MAE | latent-MAE | pixel-MAE | pixel-MAE |
| ResNet: input size | 32×32×4 | 32×32×4 | 32×32×4 | 256×256×3 | 256×256×3 |
| ResNet: conv1 stride | 1 | 1 | 1 | 8 | 8 |
| ResNet: base width | 256 | 640 | 640 | 640 | 640 |
| ResNet: block type | bottleneck（所有配置相同） | | | | |
| ResNet: blocks / stage | [3, 4, 6, 3]（所有配置相同） | | | | |
| ResNet: size / stage | [32², 16², 8², 4²]（所有配置相同） | | | | |
| MAE: masking ratio | 50%（所有配置相同） | | | | |
| MAE: pre-train epochs | 192 | 1280 | 1280 | 1280 | 1280 |
| classification finetune | No | 3k steps | 3k steps | 3k steps | 3k steps |
| *生成器优化器* | | | | | |
| optimizer | AdamW（\(\beta_1=0.9,\ \beta_2=0.95\)）（所有配置相同） | | | | |
| learning rate | 2e-4 | 4e-4 | 4e-4 | 2e-4 | 4e-4 |
| weight decay | 0.01 | 0.0 | 0.01 | 0.01 | 0.01 |
| warmup steps | 5k | 10k | 10k | 10k | 10k |
| gradient clip | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 |
| training steps | 30k | 200k | 200k | 100k | 100k |
| training epochs | 100 | 1280 | 1280 | 640 | 640 |
| EMA decay | 0.999 | {0.999, 0.9995, 0.9998, 0.9999}（跨其余四列合并） | | | |
| *漂移损失计算* | | | | | |
| class labels \(N_c\) | 64 | 128 | 128 | 128 | 128 |
| positive samples \(N_{\mathrm{pos}}\) | 64 | 128 | 64 | 128 | 128 |
| generated samples \(N_{\mathrm{neg}}\) | 64 | 64 | 64 | 64 | 64 |
| effective batch \(B\)（\(N_c\times N_{\mathrm{neg}}\)） | 4096 | 8192 | 8192 | 8192 | 8192 |
| temperatures \(\tau\) | {0.02, 0.05, 0.2}：每个 \(\tau\) 一个损失，所有损失项求和（所有配置相同） | | | | |
| *CFG 配置* | | | | | |
| train: CFG \(\alpha\) range | [1, 4] | [1, 4] | [1, 4] | [1, 4] | [1, 4] |
| train: CFG \(\alpha\) sampling | \(p(\alpha)\propto\alpha^{-3}\) | \(p(\alpha)\propto\alpha^{-5}\) | 50%：\(\alpha=1\)，50%：\(p(\alpha)\propto\alpha^{-3}\) | \(p(\alpha)\propto\alpha^{-5}\) | \(p(\alpha)\propto\alpha^{-5}\) |
| train: uncond samples \(N_{\mathrm{unc}}\) | 16 | 32 | 32 | 32 | 32 |
| inference: CFG \(\alpha\) search | [1.0, 3.5]（所有配置相同） | | | | |

### A.1 计算漂移场 \(\mathbf{V}\) 的伪代码

算法 2 给出计算 \(\mathbf{V}\) 的伪代码。该计算基于对式 (11) 与 (12) 取经验均值，实现为在 \(\mathbf{y}\) 样本轴上的 softmax。在实践中，我们进一步在 \(\mathbf{x}\) 样本轴上做归一化，也实现为在同一 logit 矩阵上的 softmax。我们在 B.2 中消融其影响。

值得注意的是，该实现保持了 \(\mathbf{V}\) 期望的性质。原则上，该实现可视为对一个漂移场的蒙特卡洛估计：

$$
\mathbf{V}_{p,q}(\mathbf{x})=\mathbb{E}_{\mathcal{B},p,q}\left[\tilde{K}_{\mathcal{B}}(\mathbf{x},\mathbf{y}^{+})\tilde{K}_{\mathcal{B}}(\mathbf{x},\mathbf{y}^{-})(\mathbf{y}^{+}-\mathbf{y}^{-})\right],\tag{17}
$$

其中 \(\mathcal{B}\) 由批内的其他样本构成，\(\tilde{K}_{\mathcal{B}}\) 表示基于 \(\mathcal{B}\) 内统计量对距离做归一化。该 \(\mathbf{V}\) 也满足 \(\mathbf{V}_{p,p}(\mathbf{x})=\mathbf{0}\)，因为当 \(p=q\) 时，项 \(\tilde{K}_{\mathcal{B}}(\mathbf{y}^{+},\mathbf{x})\tilde{K}_{\mathcal{B}}(\mathbf{y}^{-},\mathbf{x})(\mathbf{y}^{+}-\mathbf{y}^{-})\) 与项 \(\tilde{K}_{\mathcal{B}}(\mathbf{y}^{-},\mathbf{x})\tilde{K}_{\mathcal{B}}(\mathbf{y}^{+},\mathbf{x})(\mathbf{y}^{-}-\mathbf{y}^{+})\) 相互抵消。

**算法 2（原文 Algorithm 2）：** 计算漂移场 \(\mathbf{V}\)。

```python
def compute_V(x, y_pos, y_neg, T):
    # x: [N, D]
    # y_pos: [N_pos, D]
    # y_neg: [N_neg, D]
    # T: temperature

    # compute pairwise distance
    dist_pos = cdist(x, y_pos)     # [N, N_pos]
    dist_neg = cdist(x, y_neg)     # [N, N_neg]
    # ignore self (if y_neg is x)
    dist_neg += eye(N) * 1e6

    # compute logits
    logit_pos = -dist_pos / T
    logit_neg = -dist_neg / T

    # concat for normalization
    logit = cat([logit_pos, logit_neg], dim=1)

    # normalize along both dimensions
    A_row = logit.softmax(dim=-1)
    A_col = logit.softmax(dim=-2)
    A = sqrt(A_row * A_col)

    # back to [N, N_pos] and [N, N_neg]
    A_pos, A_neg = split(A, [N_pos,], dim=1)

    # compute the weights
    W_pos = A_pos     # [N, N_pos]
    W_neg = A_neg     # [N, N_neg]
    W_pos *= A_neg.sum(dim=1, keepdim=True)
    W_neg *= A_pos.sum(dim=1, keepdim=True)

    drift_pos = W_pos @ y_pos     # [N_x, D]
    drift_neg = W_neg @ y_neg     # [N_x, D]

    V = drift_pos - drift_neg
    return V
```

### A.2 生成器架构

**输入与输出。** 生成器的输入由随机噪声与条件化组成：

$$
f_{\theta}:(\boldsymbol{\epsilon},c,\alpha)\mapsto\mathbf{x}
$$

其中 \(\boldsymbol{\epsilon}\) 表示随机变量，\(c\) 是类别标签，\(\alpha\) 是 CFG 强度。\(\boldsymbol{\epsilon}\) 可以同时包含连续随机变量（例如高斯噪声）与离散随机变量（例如均匀分布的整数；见随机风格嵌入）。对潜空间模型，输出 \(\mathbf{x}\in\mathbb{R}^{32\times32\times4}\) 位于 SD-VAE 潜空间。对像素空间模型，输出 \(\mathbf{x}\in\mathbb{R}^{256\times256\times3}\) 直接就是图像。

**Transformer。** 我们采用 DiT 式 Transformer（Peebles & Xie, 2023）。沿用（Yao et al., 2025），我们使用 SwiGLU（Shazeer, 2020）、RoPE（Su et al., 2024）、RMSNorm（Zhang & Sennrich, 2019）与 QK-Norm（Henry et al., 2020）。输入的高斯噪声被分块（patchify）为 256 = 16×16 个 token（潜空间的 patch 大小为 2×2，像素空间为 16×16）。条件化 \((c,\alpha)\) 由 adaLN 处理，也由 in-context 条件化 token 处理。输出 token 被反分块（unpatchify）回目标形状。

**In-context token。** 沿用（Li & He, 2025），我们在序列前部预置 16 个可学习 token 用于 in-context 条件化（Peebles & Xie, 2023）。这些 token 由投影后的条件化向量与位置嵌入相加构成。

**随机风格嵌入。** 我们的框架允许高斯以外的任意噪声分布。受 StyleGAN（Sauer et al., 2022）启发，我们额外引入 32 个“风格 token”：每个都是对 64 个可学习嵌入组成的码本做随机索引的结果。它们被求和后加到条件化向量上。这不改变序列长度，在参数量与 FLOPs 上的开销可忽略。下表给出风格嵌入在我们消融默认设置上的效果（原文以粗体标出更优的 8.46）：

| | w/o style | w/ style |
|---|---|---|
| FID | 8.86 | **8.46** |

与扩散/流式方法不同，我们的方法可以自然处理不同类型的噪声或随机变量。使用随机风格嵌入时，输入随机变量由两部分组成：(1) 高斯噪声；(2) 用于风格嵌入的离散索引。我们的模型 \(f\) 产生它们联合分布的推前分布。

### A.3 ResNet 式 MAE 的实现

除标准自监督学习模型（MoCo（He et al., 2020）、SimCLR（Chen et al., 2020a））之外，我们还开发了一个定制的 ResNet 式 MAE 模型，作为漂移损失的特征编码器。

**概览。** 与基于 ViT（Dosovitskiy et al., 2021）的标准 MAE（He et al., 2022）不同，我们的 MAE 训练一个能提供多尺度特征的卷积 ResNet。对潜空间模型，输入与输出维度为 32×32×4；对像素空间模型，输入与输出维度为 256×256×3。

我们的 MAE 由 ResNet 式编码器配一个反卷积解码器构成，形成 U-Net 式（Ronneberger et al., 2015）编码器—解码器架构。在计算漂移损失时，我们只用 ResNet 式编码器做特征提取。

**MAE 编码器。** 编码器遵循经典 ResNet（He et al., 2016）设计。它把输入映射到多尺度特征图（ResNet 中为 4 个尺度）：

$$
\text{Encoder}:\mathbf{x}\mapsto\{f_1,f_2,f_3,f_4\}
$$

这里特征图 \(f_i\) 的维度为 \(H_i\times W_i\times C_i\)，其中 \(H_i\times W_i\in\{32^{2},16^{2},8^{2},4^{2}\}\)，\(C_i\in\{C,2C,4C,8C\}\)，\(C\) 是基础宽度。

该架构遵循标准 ResNet（He et al., 2016）设计，用 GroupNorm（GN）（Wu & He, 2018）代替 BatchNorm（BN）（Ioffe & Szegedy, 2015）。所有残差块都是“basic”块（即每个由两个 3×3 卷积组成）。沿用标准 ResNet-34（He et al., 2016）：编码器有一个 3×3 卷积（不做下采样）与 4 个阶段，各阶段块数为 [3, 4, 6, 3]；下采样（步长 2）发生在第 2 至第 4 阶段的第一个块处。

对潜空间（即 latent-MAE），该 ResNet 的输入为 32×32×4；对像素空间，256×256×3 的输入先被分块（按 8×8 patch）为 32×32×192。ResNet 在该输入上以 \(H\times W=32\times32\) 工作。

**MAE 解码器。** 解码器通过反卷积与跳连回到输入形状：

$$
\text{Decoder}:\{f_4,f_3,f_2,f_1\}\mapsto\hat{\mathbf{x}}.
$$

它从对 \(f_4\) 的一个 3×3 卷积块开始，随后是 4 个上采样块。每个上采样块执行：双线性 2×2 上采样 → 与编码器的跳连拼接 → GN → 两个带 GN 与 ReLU 的 3×3 卷积。最后一个 1×1 卷积产生输出通道。对像素空间，解码器在最后一层之后反分块回原始分辨率。

**掩码。** MAE 被训练为重建随机掩码的输入。与基于 ViT 的 MAE（He et al., 2022）不同（后者把被掩码的 token 从序列中移除），我们只是把被掩码的 patch 置零。对形状 \(H\times W=32\times32\) 的输入（无论潜空间还是像素空间情形），我们以置零方式掩码 2×2 的 patch。每个 patch 以 50% 概率被独立掩码。

**MAE 训练。** 我们在被掩码区域上最小化 \(\ell_2\) 重建损失。我们使用 AdamW（Loshchilov & Hutter, 2019），学习率 \(4\times10^{-3}\)、批大小 8192。使用衰减为 0.9995 的 EMA。沿用（He et al., 2022），我们对输入施加随机缩放裁剪（random resized crop）增强（对潜空间设置，图像在送入 VAE 编码器之前做增强）。

**分类微调。** 对我们最好的特征编码器（表 3 最后一行），我们用线性分类头微调该 MAE 模型。损失为 \(\lambda\mathcal{L}_{\mathrm{cls}}+(1-\lambda)\mathcal{L}_{\mathrm{recon}}\)。我们在该 MAE 上微调全部参数 3k 次迭代，其中 \(\lambda\) 按线性 warmup 日程变化：在前 1k 次迭代中从 0 增加到 0.1，在其余训练中保持 0.1 不变。

### A.4 其他预训练特征编码器

除我们定制的 MAE 之外，我们还评估了其他用于计算漂移损失的特征编码器。

**MoCo 与 SimCLR。** 我们评估在像素空间中于 ImageNet 上训练的公开自监督编码器：MoCo（He et al., 2020; Chen et al., 2020b）与 SimCLR（Chen et al., 2020a）。我们使用 ResNet-50 变体。对潜空间生成，我们在特征提取之前施加 VAE 解码器，把生成器输出从潜空间（32×32×4）映射到像素空间（256×256×3）。梯度同时经特征提取器与 VAE 解码器反传。

**使用 ConvNeXt-V2 的 MAE。** 在我们的像素空间生成器中，我们还研究了 ConvNeXt-V2（Woo et al., 2023）作为特征编码器。我们指出，ConvNeXt-V2 是一个用 MAE 目标自监督预训练、随后做分类微调的模型。与 ResNet 类似，ConvNeXt-V2 是多阶段架构。

### A.5 漂移损失的多尺度特征

给定一张图像，特征编码器在多个尺度上产生特征图，每个尺度有多个空间位置。我们对每个特征（例如每个尺度和/或每个位置）计算一个漂移损失。具体而言，我们对每个特征独立地计算核、漂移与相应损失。所得损失求和。

对 ResNet 的每个阶段，我们从每 2 个残差块的输出以及最终输出处提取特征。这得到一组特征图，每个形状为 \(H_i\times W_i\times C_i\)。对每个特征图，我们产生：

(a) \(H_i\times W_i\) 个向量，每个位置一个（各 \(C_i\) 维）；
(b) 1 个全局均值与 1 个全局标准差（各 \(C_i\) 维）；
(c) 在 2×2 patch 上计算的 \(\frac{H_i}{2}\times\frac{W_i}{2}\) 个均值向量与 \(\frac{H_i}{2}\times\frac{W_i}{2}\) 个标准差向量（各 \(C_i\) 维）；
(d) 在 4×4 patch 上计算的 \(\frac{H_i}{4}\times\frac{W_i}{4}\) 个均值向量与 \(\frac{H_i}{4}\times\frac{W_i}{4}\) 个标准差向量（各 \(C_i\) 维）。

此外，对编码器的输入（\(H_0\times W_0\times C_0\)），我们逐通道计算平方值（\(x^{2}\)）的均值，得到一个 \(C_0\) 维向量。

这里所有结果向量都是 \(C_i\) 维。我们对这些 \(C_i\) 维向量中的每一个都计算一个漂移损失。所有这些损失，加上不使用 \(\phi\) 的原始漂移损失，被求和。下表比较这些设计在我们消融默认设置上的效果（原文以粗体标出 8.46）：

| | (a,b) | (a-c) | (a-d) |
|---|---|---|---|
| FID | 9.58 | 9.10 | **8.46** |

这表明我们的方法从更丰富的特征集合中获益。我们指出，一旦跑完特征编码器，我们的漂移损失计算代价可忽略：与计算单个损失相比，计算多尺度、多位置损失的额外开销很小。

### A.6 特征与漂移归一化

为平衡来自多个特征的多个损失项，我们对每个特征 \(\phi_j\) 做归一化，其中 \(\phi_j\) 表示给定尺度内某个特定空间位置处的特征（见 A.5）。直观上，我们希望归一化使得核 \(k(\cdot,\cdot)\) 与漂移 \(\mathbf{V}\) 对特征的绝对量级不敏感。这使我们的模型能稳健地支持不同的特征编码器（见表 3）以及来自同一编码器的丰富特征集合。

**特征归一化。** 考虑特征 \(\phi_j\in\mathbb{R}^{C_j}\)。我们定义归一化尺度 \(S_j\in\mathbb{R}^{1}\)，归一化后的特征记为：

$$
\tilde{\phi}_j:=\phi_j/S_j.\tag{18}
$$

使用 \(\tilde{\phi}_j\) 时，式 (12) 中计算的 \(\ell_2\) 距离为：

$$
\mathrm{dist}_j(\mathbf{x},\mathbf{y})=\|\tilde{\phi}_j(\mathbf{x})-\tilde{\phi}_j(\mathbf{y})\|,\tag{19}
$$

其中 \(\mathbf{x}\) 表示生成样本，\(\mathbf{y}\) 表示正/负样本，\(\tilde{\phi}_j(\cdot)\) 表示在 \(j\) 处提取它们的特征。我们希望**平均**距离为 \(\sqrt{C_j}\)：

$$
\mathbb{E}_{\mathbf{x}}\mathbb{E}_{\mathbf{y}}[\mathrm{dist}_j(\mathbf{x},\mathbf{y})]\approx\sqrt{C_j}.\tag{20}
$$

为达到这一点，我们如下设置归一化尺度 \(S_j\)：

$$
S_j=\frac{1}{\sqrt{C_j}}\,\mathbb{E}_{\mathbf{x}}\mathbb{E}_{\mathbf{y}}\left[\|\phi_j(\mathbf{x})-\phi_j(\mathbf{y})\|\right].\tag{21}
$$

实践中，我们用批内所有 \(\mathbf{x}\) 与 \(\mathbf{y}\) 样本计算经验均值来替代期望。我们复用算法 2 中的 `cdist` 计算来计算成对距离。我们对 \(S_j\) 施加停止梯度，因为该标量在概念上是由上一批的样本计算得到的。

使用归一化特征后，式 (12) 中的核设为：

$$
k(\mathbf{x},\mathbf{y})=\exp\left(-\frac{1}{\tilde{\tau}_j}\|\tilde{\phi}_j(\mathbf{x})-\tilde{\phi}_j(\mathbf{y})\|\right),\tag{22}
$$

其中 \(\tilde{\tau}_j:=\tau\cdot\sqrt{C_j}\)。如此，温度 \(\tau\) 的取值不依赖特征量级或特征维度。我们设 \(\tau\in\{0.02,0.05,0.2\}\)（下文讨论）。

**漂移归一化。** 使用特征 \(\phi_j\) 时，所得漂移位于与 \(\phi_j\) 相同的特征空间中，记为 \(\mathbf{V}_j\)。我们对每个特征 \(\phi_j\) 的 \(\mathbf{V}_j\) 做漂移归一化。形式上，我们定义归一化尺度 \(\lambda_j\in\mathbb{R}^{1}\) 并记：

$$
\tilde{\mathbf{V}}_j:=\mathbf{V}_j/\lambda_j.\tag{23}
$$

同样，我们希望归一化后的漂移对特征量级不敏感：

$$
\mathbb{E}\left[\frac{1}{C_j}\|\tilde{\mathbf{V}}_j\|^{2}\right]\approx1.\tag{24}
$$

为达到这一点，我们如下设置 \(\lambda_j\)：

$$
\lambda_j=\sqrt{\mathbb{E}\left[\frac{1}{C_j}\|\mathbf{V}_j\|^{2}\right]}.\tag{25}
$$

实践中，期望用在整个批上计算的经验均值替代。

使用归一化特征与归一化漂移后，特征 \(\phi_j\) 的漂移损失为：

$$
\mathcal{L}_j=\mathrm{MSE}\left(\tilde{\phi}_j(\mathbf{x})-\mathrm{sg}\left(\tilde{\phi}_j(\mathbf{x})+\tilde{\mathbf{V}}_j\right)\right),\tag{26}
$$

其中 MSE 表示均方误差。总损失是所有特征上的和：\(\mathcal{L}=\sum_j\mathcal{L}_j\)。

**多温度。** 使用归一化后的特征距离时，温度 \(\tau\) 的取值决定了什么算作“近邻”。为提升在我们研究的各种特征与各种预训练模型之间的稳健性，我们采用多个温度。

形式上，对每个 \(\tau\) 值，我们按上述方式计算归一化漂移，记为 \(\tilde{\mathbf{V}}_{j,\tau}\)。然后我们计算聚合场：\(\tilde{\mathbf{V}}_j\leftarrow\sum_{\tau}\tilde{\mathbf{V}}_{j,\tau}\)，并把它用于式 (26) 的损失。

下表给出多温度在我们消融默认设置上的效果（原文以粗体标出 8.67 与 8.46）：

| \(\tau\) | 0.02 | 0.05 | 0.2 | {0.02, 0.05, 0.2} |
|---|---|---|---|---|
| FID | 10.62 | **8.67** | 8.96 | **8.46** |

使用多个温度可以比使用单个最优温度取得略好的结果。我们固定 \(\tau\in\{0.02,0.05,0.2\}\)，不需要在不同配置下调这一超参数。

**跨空间位置的归一化。** 对分辨率为 \(H_i\times W_i\) 的特征图，共有 \(H_i\times W_i\) 个逐位置特征。对每个位置分别计算归一化既慢又没必要。我们假设同一特征图内不同位置的特征共享同一归一化尺度。据此，我们把全部 \(H_i\times W_i\) 个位置拼接起来，在它们之上计算归一化尺度。特征归一化与漂移归一化都按此方式进行。

### A.7 无分类器引导（CFG）

为支持 CFG，训练时我们额外引入 \(N_{\mathrm{unc}}\) 个无条件样本（来自随机类别的真实图像）作为额外的负样本。在计算核时，这些样本以因子 \(w\) 加权。对生成样本 \(\mathbf{x}\)，它所比较的有效负分布为：

$$
\tilde{q}(\cdot|c)\triangleq\frac{(N_{\mathrm{neg}}-1)\cdot q_{\theta}(\cdot|c)+N_{\mathrm{unc}}w\cdot p_{\mathrm{data}}(\cdot|\varnothing)}{(N_{\mathrm{neg}}-1)+N_{\mathrm{unc}}w}.
$$

把该式与式 (15)(16) 比较，我们有：

$$
\gamma=\frac{N_{\mathrm{unc}}w}{(N_{\mathrm{neg}}-1)+N_{\mathrm{unc}}w}
\qquad\text{以及}\qquad
\alpha=\frac{1}{1-\gamma}=\frac{(N_{\mathrm{neg}}-1)+N_{\mathrm{unc}}w}{N_{\mathrm{neg}}-1}.
$$

给定 CFG 强度 \(\alpha\)，我们相应地计算 \(w\)，用于对核加权。同一权重 \(w\) 也用于计算全局距离归一化。

我们用 CFG-conditioning 训练模型（Geng et al., 2025b）。每次迭代，我们按预先定义的分布（见表 8）随机采样 \(\alpha\)，并计算相应的 \(w\) 以对无条件样本加权。\(\alpha\) 的取值是与类别标签 \(c\) 一起输入网络 \(f_{\theta}(\boldsymbol{\epsilon},c,\alpha)\) 的条件。

推理时，我们指定 \(\alpha\) 的一个取值。推理时的计算仍然是一步（1-NFE）。

### A.8 样本队列

我们的方法需要访问随机采样的**真实**（正/无条件）数据。这可以用专门的数据加载器实现。我们改为采用一个缓存数据的**样本队列**，类似 MoCo（He et al., 2020）中的队列。该实现在统计上以与专门数据加载器相似的方式采样数据。为完整起见，我们如下描述实现，同时指出数据加载器会是更原则化的方案。

对每个类别标签，我们维护一个大小为 128 的队列；对无条件样本（用于 CFG），我们维护一个单独的大小为 1000 的全局队列。每个训练步，我们把最新的 64 个新真实（正/无条件）样本连同其标签推入相应队列；最早的样本被出队。采样时，正样本从对应类别的队列中抽取，无条件样本从全局队列中抽取。我们采用无放回采样。

### A.9 训练循环

总结起来，训练循环中每一步如下进行：

1. 采样一批（\(N_c\)）类别标签。
2. 对每个标签 \(c\)，采样一个 CFG 尺度 \(\alpha\)。
3. 采样一批（\(N_{\mathrm{neg}}\)）噪声 \(\boldsymbol{\epsilon}\)。把 \((\boldsymbol{\epsilon},c,\alpha)\) 送入生成器 \(f\) 产生生成样本；
4. 采样正样本（同类，\(N_{\mathrm{pos}}\)）与无条件样本（用于 CFG，\(N_{\mathrm{unc}}\)）；
5. 对所有生成、正、无条件样本提取特征；
6. 用这些特征计算漂移损失。
7. 执行反传与参数更新。

## 附录 B 附加实验结果

### B.1 像素空间生成的消融

我们在表 9 与表 10 中给出像素空间生成的更多消融。表 9 比较特征编码器对像素空间生成器的影响。它表明特征编码器的选择在像素空间生成质量中起更显著的作用。较弱的 MAE 编码器得到 32.11 的 FID，而更强的 MAE 编码器把性能提升到 9.35 的 FID。我们进一步加入另一个同样以 MAE 目标预训练的特征编码器 ConvNeXt-V2（Woo et al., 2023）。这进一步把结果提升到 3.70 的 FID。

表 10 报告训练更久与使用更大模型的结果。由于时间有限，我们把像素空间模型训练 640 轮（相较潜空间对应模型的 1280 轮）；我们预期更长训练会带来进一步提升。我们在像素空间生成上取得 1.61 的 FID。这就是正文（表 6）中的结果。

**表 9（原文 Table 9）：** 像素空间生成的消融。我们研究直接在像素空间（不使用 VAE）生成。沿用与潜空间相同的 MAE 配方会得到更高的 FID，表明像素空间生成更具挑战性。把 MAE 与 ConvNeXt-V2 结合有助于缩小这一差距。潜空间结果列出以供参照。以下结果遵循消融设置（像素空间用 B/16 模型，100 轮）。原文表头“FID (100-epoch)”为跨 latent 与 pixel 两列的合并标题；latent（B/2）一列为浅灰排印（仅作参照），粗体为 3.70。

| 特征编码器 \(\phi\) | latent (B/2) | pixel (B/16) |
|---|---|---|
| MAE（宽度 256，轮数 192） | 8.46 | 32.11 |
| MAE（宽度 640，轮数 1280）+ cls ft. | 3.36 | 9.35 |
| + MAE 搭配 ConvNeXt-V2 | – | **3.70** |

**表 10（原文 Table 10）：** 像素空间生成：从消融到最终设置。在消融设置之外，我们比较导出表 6 结果的那些设置。原文以粗体标出最终设置所在行的 FID 1.61。

| 情形 | 架构 | 轮数（epoch） | FID |
|---|---|---|---|
| (a) 基线（来自表 9） | B/16 | 100 | 3.70 |
| (b) 更长 + 调超参数 | B/16 | 320 | 2.19 |
| (c) 更长训练 | B/16 | 640 | 1.76 |
| (d) 更大模型 | L/16 | 640 | **1.61** |

### B.2 核归一化的消融

在式 (11) 中，我们的漂移场由归一化核加权，可写为：

$$
\mathbf{V}(\mathbf{x})=\mathbb{E}_{p,q}\left[\tilde{k}(\mathbf{x},\mathbf{y}^{+})\tilde{k}(\mathbf{x},\mathbf{y}^{-})(\mathbf{y}^{+}-\mathbf{y}^{-})\right],\tag{27}
$$

其中 \(\tilde{k}(\cdot,\cdot)=\frac{1}{Z}k(\cdot,\cdot)\) 表示归一化核。原则上，该归一化通过在 \(\mathbf{y}\) 样本轴上的 softmax 操作来近似。我们的实现（算法 2）还在 \(\mathbf{x}\) 样本轴上额外施加 softmax。我们比较这些设计，以及另一个不做归一化（\(Z=1\)）的变体。

表 11 比较这三种设计。只用 \(\mathbf{y}\) 上的 softmax 表现良好（8.92 FID），而同时在 \(\mathbf{x}\) 与 \(\mathbf{y}\) 上做 softmax 可改善结果（8.46 FID）。另一方面，即使不做归一化，性能仍然不错，说明我们的方法具有稳健性。

我们指出，三种变体在 \(p=q\) 时都满足平衡条件 \(\mathbf{V}_{p,q}(\mathbf{x})=\mathbf{0}\)。这解释了为什么所有变体都表现尚可，以及为什么即使是破坏性设置（不归一化）也避免了灾难性失败。

**表 11（原文 Table 11）：** 核归一化的消融。在 \(\mathbf{x}\) 与 \(\mathbf{y}\) 两个轴上都做 softmax 归一化表现更好。另一方面，即使不做归一化表现也还不错，体现了我们方法的稳健性。（设置：B/2 模型，100 轮）原文以粗体标出默认行的 FID 8.46。

| 核归一化 | FID |
|---|---|
| 在 \(\mathbf{x}\) 与 \(\mathbf{y}\) 上 softmax（默认） | **8.46** |
| 仅在 \(\mathbf{y}\) 上 softmax | 8.92 |
| 不归一化 | 10.54 |

### B.3 CFG 的消融

在图 5 中，我们研究推理时使用的 CFG 尺度 \(\alpha\)。它表明，为我们模型发展的 CFG 表述表现出与扩散/流式模型中观察到的相似行为。增大 CFG 尺度会带来更高的 IS 值；而一旦超过 FID 的最优点，IS 的进一步提升就要以更差的 FID 为代价。

值得注意的是，对我们最好的模型（L/2），最优 FID 在 \(\alpha=1.0\) 处取得，这在扩散/流式模型中通常被视为“无 CFG”（尽管它们的“无 CFG”设置可以把 NFE 减半）。虽然我们的方法在推理时不需要运行无条件模型（与标准 CFG 相反），但训练会受到使用无条件真实样本作为负样本的影响。

**图 5（原文 Figure 5）：** CFG 尺度 \(\alpha\) 的影响。(a)：FID 对 \(\alpha\)；(b)：IS 对 \(\alpha\)；(c)：IS 对 FID。我们展示 L/2（实线）与 B/2（虚线）模型。与扩散/流式模型中的常见观察一致，CFG 尺度有效地在分布覆盖（由 FID 反映）与单图质量（由 IS 度量）之间做权衡。值得注意的是，对 L/2 模型，最优 FID 在 \(\alpha=1.0\) 处取得，这在扩散/流式模型中通常被视为“无 CFG”。对 B/2，最优 FID 在 \(\alpha=1.1\) 处取得。（图中元素：三个子图分别为 (a) FID vs CFG Scale、(b) IS vs CFG Scale、(c) IS vs FID；图例标注 L（实线圆点）与 B（虚线方块），(c) 中还标注了各点对应的 \(\alpha\) 值。）

### B.4 最近邻分析

在图 6 中，我们展示生成图像及其最近的真实图像。最近邻用 CLIP 特征从 ImageNet 训练集中检索得到。这些可视化表明，我们的方法生成的是在视觉上与其最近邻明显不同的新图像，而不是简单记忆训练样本。

**图 6（原文 Figure 6）：** 最近邻分析。每个面板展示一个生成样本及其 top-10 最近真实图像。最近邻基于 CLIP 编码器（Radford et al., 2021）的余弦相似度从 ImageNet 训练集中检索。我们的方法生成的是在视觉上与其最近邻明显不同的新图像。（图中元素：成对的面板，每个面板左列标注 Generated、其余列标注 Retrieved，逐行为不同类别图像。）

### B.5 定性结果

图 7–10 展示我们模型的未挑选样本。图 11–15 给出与改进版 MeanFlow（iMF）（Geng et al., 2025b）——当前最优的单步方法——的并排比较。

## 附录 C 附加推导

### C.1 关于零漂移平衡的可辨识性

在第 3 节中，我们证明了反对称性蕴含 \(p=q\Rightarrow\mathbf{V}(\mathbf{x})\equiv\mathbf{0}\)。这里我们研究其逆：在什么条件下 \(\mathbf{V}(\mathbf{x})\approx\mathbf{0}\) 能推出 \(p\approx q\)？一般而言，对任意向量场这并不保证。但我们论证，对于我们的特定构造，零漂移条件对分布施加了很强的约束。

为避免边界问题，我们假设 \(p\) 与 \(q\) 在 \(\mathbb{R}^{d}\) 上具有满支撑（例如通过无穷小的高斯平滑）。于是，对生成样本 \(\mathbf{x}\sim q\) 保证平衡条件 \(\mathbf{V}(\mathbf{x})\approx\mathbf{0}\)，实际上就等价于对所有 \(\mathbf{x}\in\mathbb{R}^{d}\) 都有 \(\mathbf{V}(\mathbf{x})\approx\mathbf{0}\)。

**设定。** 考虑一般的交互核 \(K(\mathbf{x},\mathbf{y}^{+},\mathbf{y}^{-})\in\mathbb{R}^{d}\) 与漂移场

$$
\mathbf{V}_{p,q}(\mathbf{x}):=\mathbb{E}_{\mathbf{y}^{+}\sim p,\,\mathbf{y}^{-}\sim q}\left[K(\mathbf{x},\mathbf{y}^{+},\mathbf{y}^{-})\right].\tag{28}
$$

我们假设 \(p\) 与 \(q\) 属于由线性无关基 \(\{\varphi_i\}_{i=1}^{m}\) 张成的有限维模型类：

$$
p(\mathbf{y})=\sum_{i=1}^{m}a_i\varphi_i(\mathbf{y}),\qquad q(\mathbf{y})=\sum_{i=1}^{m}b_i\varphi_i(\mathbf{y}),\tag{29}
$$

其中 \(\mathbf{a},\mathbf{b}\in\mathbb{R}^{m}\) 是系数向量。

**在测试位置上的双线性展开。** 考虑一组测试位置（探针）\(\mathcal{X}=\{\mathbf{x}_k\}_{k=1}^{N}\)，\(N\) 足够大（例如 \(N\gg m^{2}\)）。对每一对基指标 \((i,j)\)，我们通过如下方式计算其列来定义**诱导交互向量** \(\mathbf{U}_{ij}\in\mathbb{R}^{d\times N}\)：

$$
\mathbf{U}_{ij}[:,\mathbf{x}]\triangleq\iint K(\mathbf{x},\mathbf{y}^{+},\mathbf{y}^{-})\varphi_i(\mathbf{y}^{+})\varphi_j(\mathbf{y}^{-})\,\mathrm{d}\mathbf{y}^{+}\mathrm{d}\mathbf{y}^{-}\tag{30}
$$

对所有 \(\mathbf{x}\in\mathcal{X}\) 求值。把基展开代入式 (28)，在 \(\mathcal{X}\) 上求值的漂移场（存为矩阵 \(\mathbf{V}_{\mathcal{X}}\)）是一个双线性组合：

$$
\mathbf{V}_{\mathcal{X}}\triangleq\sum_{i=1}^{m}\sum_{j=1}^{m}a_ib_j\mathbf{U}_{ij}.\tag{31}
$$

这里 \(\mathbf{V}_{\mathcal{X}}\in\mathbb{R}^{d\times N}\)。在平衡处有 \(\mathbf{V}_{\mathcal{X}}=\mathbf{0}\)，这给出 \(dN\) 个线性方程。

**线性无关假设。** 我们的反对称条件意味着交换 \(p\) 与 \(q\) 会翻转场的符号。就基交互而言，这意味着 \(\mathbf{U}_{ij}=-\mathbf{U}_{ji}\)（从而 \(\mathbf{U}_{ii}=\mathbf{0}\)）。我们做如下**泛型非退化假设**：向量集合 \(\{\mathbf{U}_{ij}\}_{1\le i<j\le m}\) 在 \(\mathbb{R}^{dN}\) 中线性无关。该假设要求探针 \(\mathcal{X}\) 与核 \(K\) 非退化；如果所有 \(\mathbf{x}\) 都给出相同约束，线性无关性就会失效。对泛型选取的 \(K\) 与足够多样的探针 \(\mathcal{X}\)（且 \(dN\gg m^{2}\)），这种线性无关性是一个自然的非退化条件。

**平衡的唯一性。** 零漂移条件 \(\mathbf{V}(\mathbf{x})\equiv\mathbf{0}\) 蕴含 \(\mathbf{V}_{\mathcal{X}}=\mathbf{0}\)。按独立的基向量 \(\{\mathbf{U}_{ij}\}_{i<j}\) 归并各项，我们有：

$$
\sum_{1\le i<j\le m}(a_ib_j-a_jb_i)\mathbf{U}_{ij}=\mathbf{0}.\tag{32}
$$

由线性无关假设，系数必须为零：对所有 \(i,j\) 有 \(a_ib_j-a_jb_i=0\)。这意味着向量 \(\mathbf{a}\) 与 \(\mathbf{b}\) 平行（即 \(\mathbf{a}\propto\mathbf{b}\)）。由于 \(p\) 与 \(q\) 是概率密度（意味着 \(\int p=\int q=1\)），必须有 \(\mathbf{a}=\mathbf{b}\)，从而 \(p=q\)。

**与均值漂移场的联系。** 均值漂移场符合这一框架。更新向量（归一化之前）为 \(\mathbb{E}_{p,q}[k(\mathbf{x},\mathbf{y}^{+})k(\mathbf{x},\mathbf{y}^{-})(\mathbf{y}^{+}-\mathbf{y}^{-})]\)。假设归一化因子 \(Z_p\) 与 \(Z_q\) 有限，则条件 \(\mathbf{V}(\mathbf{x})=\mathbf{0}\) 蕴含分子积分为零，这对应于如下形式的交互核：

$$
K(\mathbf{x},\mathbf{y}^{+},\mathbf{y}^{-})=k(\mathbf{x},\mathbf{y}^{+})k(\mathbf{x},\mathbf{y}^{-})(\mathbf{y}^{+}-\mathbf{y}^{-}).\tag{33}
$$

该核产生了上文分析的双线性结构。由于我们可以选取 \(N\) 使 \(dN\gg m^{2}\)，测试空间的维度远大于基对的数目。因此，对泛型配置，\(\{\mathbf{U}_{ij}\}\) 的线性无关性预期成立。最后，对一般的分布 \(p\) 与 \(q\)，我们可以用足够大的基展开来近似它们，得到 \(\tilde{p}\) 与 \(\tilde{q}\)。当基近似足够精确时，\(\tilde{p}\approx p\)、\(\tilde{q}\approx q\)，且漂移场 \(\mathbf{V}_{\tilde{p},\tilde{q}}\approx\mathbf{V}_{p,q}\approx\mathbf{0}\)。由上述论证，\(\tilde{p}\approx\tilde{q}\)，从而 \(p\approx q\)。

上述论证对一般形式的漂移场都成立，只需温和的反退化假设。

### C.2 MMD 的漂移场

原则上，如果一个方法最小化两个分布 \(p\) 与 \(q\) 之间的某种差异，并在 \(p=q\) 处达到最小，那么从我们框架的视角看，就存在一个控制样本运动的漂移场 \(\mathbf{V}\)：我们可以令 \(\mathbf{V}\propto-\frac{\partial\mathcal{L}}{\partial\mathbf{x}}\)，它在 \(p=q\) 时为零。我们讨论在基于最大均值差异（MMD）（Li et al., 2015; Dziugaite et al., 2015）的损失下这一 \(\mathbf{V}\) 的表述。

**漂移损失的梯度。** 令 \(\mathbf{x}=f_{\theta}(\boldsymbol{\epsilon})\)，式 (6) 中我们的漂移损失可写为：

$$
\mathcal{L}=\mathbb{E}_{\mathbf{x}\sim q}[\mathcal{L}(\mathbf{x})]=\mathbb{E}_{\mathbf{x}\sim q}\left[\left\|\mathbf{x}-\mathrm{sg}\left(\mathbf{x}+\mathbf{V}(\mathbf{x})\right)\right\|^{2}\right],\tag{34}
$$

其中“sg”是 stop-gradient 的缩写。关于参数 \(\theta\) 的梯度由下式计算：

$$
\frac{\partial\mathcal{L}}{\partial\theta}=\mathbb{E}_{\mathbf{x}\sim q}\left[\frac{\partial\mathcal{L}(\mathbf{x})}{\partial\mathbf{x}}\frac{\partial\mathbf{x}}{\partial\theta}\right].\tag{35}
$$

其中 \(\frac{\partial\mathcal{L}(\mathbf{x})}{\partial\mathbf{x}}=2(\mathbf{x}-\mathrm{sg}(\mathbf{x}+\mathbf{V}(\mathbf{x})))=-2\mathbf{V}(\mathbf{x})\)。这给出：

$$
\mathbf{V}(\mathbf{x})=-\frac{1}{2}\frac{\partial\mathcal{L}(\mathbf{x})}{\partial\mathbf{x}}\tag{36}
$$

我们指出，该表述是通用的，对 \(\mathbf{V}\) 不施加约束，只要求 \(p=q\) 时 \(\mathbf{V}=\mathbf{0}\)。

我们的方法并不要求 \(\mathcal{L}\) 定义 \(p\) 与 \(q\) 之间的差异。不过，对其它依赖最小化差异 \(\mathcal{L}\) 的方法，我们可以通过 (36) 诱导出一个漂移场。只要 \(\mathcal{L}\) 在 \(p=q\) 时取最小，这就是有效的。

**MMD 损失的梯度。** 在基于 MMD 的方法（例如 Li et al. 2015）中，两个分布 \(p\) 与 \(q\) 的差异用平方 MMD 度量：

$$
\mathcal{L}_{\mathrm{MMD}^{2}}(p,q)=\mathbb{E}_{\mathbf{x},\mathbf{x}'\sim q}[\xi(\mathbf{x},\mathbf{x}')]-2\mathbb{E}_{\mathbf{y}\sim p,\mathbf{x}\sim q}[\xi(\mathbf{y},\mathbf{x})]+\text{const.}\tag{37}
$$

这里常数项是 \(\mathbb{E}_{\mathbf{y},\mathbf{y}'\sim p}[\xi(\mathbf{y},\mathbf{y}')]\)，它只依赖目标分布 \(p\) 且保持不变。\(\xi\) 是核函数。

考虑 \(\mathbf{x}=f_{\theta}(\boldsymbol{\epsilon})\)，\(\boldsymbol{\epsilon}\sim p_{\boldsymbol{\epsilon}}\)。在（Li et al., 2015）中执行的梯度估计对应于：

$$
\frac{\partial\mathcal{L}_{\mathrm{MMD}^{2}}}{\partial\theta}=\mathbb{E}_{\mathbf{x}\sim q}\left[\frac{\partial\mathcal{L}_{\mathrm{MMD}^{2}}(\mathbf{x})}{\partial\mathbf{x}}\frac{\partial\mathbf{x}}{\partial\theta}\right]\tag{38}
$$

其中关于 \(\mathbf{x}\) 的梯度由下式计算：

$$
\frac{\partial\mathcal{L}_{\mathrm{MMD}^{2}}(\mathbf{x})}{\partial\mathbf{x}}=2\mathbb{E}_{\mathbf{x}'\sim q}\left[\frac{\partial\xi(\mathbf{x},\mathbf{x}')}{\partial\mathbf{x}}\right]-2\mathbb{E}_{\mathbf{y}\sim p}\left[\frac{\partial\xi(\mathbf{x},\mathbf{y})}{\partial\mathbf{x}}\right].\tag{39}
$$

使用我们关于正、负样本的记号，重命名变量并改写为：

$$
\frac{\partial\mathcal{L}_{\mathrm{MMD}^{2}}(\mathbf{x})}{\partial\mathbf{x}}=2\mathbb{E}_{\mathbf{y}^{-}\sim q}\left[\frac{\partial\xi(\mathbf{x},\mathbf{y}^{-})}{\partial\mathbf{x}}\right]-2\mathbb{E}_{\mathbf{y}^{+}\sim p}\left[\frac{\partial\xi(\mathbf{x},\mathbf{y}^{+})}{\partial\mathbf{x}}\right].\tag{40}
$$

与式 (36) 比较，我们得到：

$$
\mathbf{V}_{\mathrm{MMD}}(\mathbf{x})\triangleq\mathbb{E}_{\mathbf{y}^{+}\sim p}\left[\frac{\partial\xi(\mathbf{x},\mathbf{y}^{+})}{\partial\mathbf{x}}\right]-\mathbb{E}_{\mathbf{y}^{-}\sim q}\left[\frac{\partial\xi(\mathbf{x},\mathbf{y}^{-})}{\partial\mathbf{x}}\right]\tag{41}
$$

这就是与 MMD 损失 \(\mathcal{L}_{\mathrm{MMD}^{2}}\) 对应的底层漂移场。

对径向核 \(\xi(\mathbf{x},\mathbf{y})=\xi(R)\)，其中 \(R=\|\mathbf{x}-\mathbf{y}\|^{2}\)，核的梯度为：

$$
\frac{\partial\xi(\mathbf{x},\mathbf{y})}{\partial\mathbf{x}}=2\xi'(\|\mathbf{x}-\mathbf{y}\|^{2})(\mathbf{x}-\mathbf{y})\tag{42}
$$

其中 \(\xi'\) 是函数 \(\xi(R)\) 的导数。相应地，式 (41) 变为：

$$
\begin{aligned}
\mathbf{V}_{\mathrm{MMD}}(\mathbf{x})=\,&\mathbb{E}_{\mathbf{y}^{+}\sim p}\left[2\xi'(\|\mathbf{x}-\mathbf{y}^{+}\|^{2})(\mathbf{x}-\mathbf{y}^{+})\right]\\
&-\mathbb{E}_{\mathbf{y}^{-}\sim q}\left[2\xi'(\|\mathbf{x}-\mathbf{y}^{-}\|^{2})(\mathbf{x}-\mathbf{y}^{-})\right]
\end{aligned}\tag{43}
$$

在（Li et al., 2015）中使用了高斯核：\(\xi(\mathbf{x},\mathbf{y})=\exp(-\frac{1}{2\sigma^{2}}\|\mathbf{x}-\mathbf{y}\|^{2})\)，从而 \(\xi'(\|\mathbf{x}-\mathbf{y}\|^{2})=-\frac{1}{2\sigma^{2}}\exp(-\frac{1}{2\sigma^{2}}\|\mathbf{x}-\mathbf{y}\|^{2})\)。

**联系与差异。** 使用我们对 \(\mathbf{V}=\mathbf{V}^{+}-\mathbf{V}^{-}\) 的定义（即式 (10)）时，我们有：

$$
\begin{aligned}
\mathbf{V}(\mathbf{x})={}&\mathbb{E}_{\mathbf{y}^{+}\sim p}\left[\tilde{k}(\mathbf{x},\mathbf{y}^{+})(\mathbf{y}^{+}-\mathbf{x})\right]\\
&-\mathbb{E}_{\mathbf{y}^{-}\sim q}\left[\tilde{k}(\mathbf{x},\mathbf{y}^{-})(\mathbf{y}^{-}-\mathbf{x})\right]
\end{aligned}\tag{44}
$$

把 (43) 与 (44) 比较，可以看出用于构建 MMD 漂移场的底层核是：

$$
\tilde{k}_{\mathrm{MMD}}(\mathbf{x},\mathbf{y})=-2\xi'(\|\mathbf{x}-\mathbf{y}\|^{2}).\tag{45}
$$

当 \(\xi\) 为高斯函数时，我们有：\(\tilde{k}(\mathbf{x},\mathbf{y})=\frac{1}{\sigma^{2}}\exp(-\frac{1}{2\sigma^{2}}\|\mathbf{x}-\mathbf{y}\|^{2})\)。不做归一化时，所得漂移不再满足算法 2 背后的假设，均值漂移的解释也随之失效。

作为对比，我们的通用表述可以使用**归一化**核：

$$
\tilde{k}(\mathbf{x},\mathbf{y})=\frac{1}{Z(\mathbf{x})}k(\mathbf{x},\mathbf{y})=\frac{1}{\mathbb{E}_{\mathbf{y}}[k(\mathbf{x},\mathbf{y})]}k(\mathbf{x},\mathbf{y}),\tag{46}
$$

其中期望在 \(p\) 或 \(q\) 上取。只有使用归一化核时，我们才有（见式 (11)）：

$$
\mathbf{V}(\mathbf{x})=\mathbb{E}_{p,q}\left[\tilde{k}(\mathbf{x},\mathbf{y}^{+})\tilde{k}(\mathbf{x},\mathbf{y}^{-})(\mathbf{y}^{+}-\mathbf{y}^{-})\right],\tag{47}
$$

这正是算法 2 的基础。

基于这一关系，我们总结本模型与基于 MMD 的方法之间的关键差异如下：

(i) 我们的方法围绕漂移场 \(\mathbf{V}\) 构建，它更灵活、更通用。

(ii) 我们的方法支持并利用**归一化**核 \(\frac{1}{Z}k(\mathbf{x},\mathbf{y})\)，而这无法从 MMD 的视角自然导出。

(iii) 我们以 \(\mathbf{V}\) 为中心的表述允许灵活的漂移步长（即 \(\mathbf{x}\leftarrow\mathbf{x}+\eta\mathbf{V}\)），因而自然支持 \(\mathbf{V}\) 归一化（见 A.6）。

(iv) 我们以 \(\mathbf{V}\) 为中心的表述使平衡概念能够自然扩展到支持 CFG，而 MMD 的 CFG 变体仍未被探索。

总之，尽管我们的方法有一个特例可归约为 MMD，我们以 \(\mathbf{V}\) 为中心的框架更通用，并带来了在实践中重要的独特可能性。在我们的实验中，我们未能用 MMD 框架得到合理的结果。

**图 7–15（第 20–28 页）：** 样例图页与定性比较。本批图页在原文中置于文末，本页把图注集中于此。

> 说明：第 20–28 页为纯样例图页（无可读正文），本页只翻译图注并注明页内为 ImageNet 类别图像网格或并排对比网格；图中类别标签（Class 编号与 ImageNet 英文类名）按原样保留。

**图 7（原文 Figure 7）：** 我们 latent-L/2 模型在 CFG = 1.0 下的未挑选样本（第 1/4 页）。FID = 1.54，IS = 258.9。（页内为 10 个 ImageNet 类别的生成图像网格。）

**图 8（原文 Figure 8）：** 我们 latent-L/2 模型在 CFG = 1.0 下的未挑选样本（第 2/4 页）。FID = 1.54，IS = 258.9。

**图 9（原文 Figure 9）：** 我们 latent-L/2 模型在 CFG = 1.0 下的未挑选样本（第 3/4 页）。FID = 1.54，IS = 258.9。

**图 10（原文 Figure 10）：** 我们 latent-L/2 模型在 CFG = 1.0 下的未挑选样本（第 4/4 页）。FID = 1.54，IS = 258.9。

**图 11（原文 Figure 11）：** 与改进版 MeanFlow（iMF）（Geng et al., 2025b）的并排比较（第 1/5 页）。左侧为我们的方法、右侧为 iMF，在 iMF 论文中可视化的**所有** ImageNet 类别上的未挑选样本。两种方法都以单次神经函数评估（1-NFE）生成图像。iMF 的可视化使用 CFG \(\omega=6.0\) 与区间 \([t_{\min},t_{\max}]=[0.2,0.8]\)，取得 FID 3.92 与 IS 348.2（DiT-XL/2）。为公平比较，我们把 CFG 尺度设为与 iMF 可视化的 IS 匹配，这使我们的方法（DiT-L/2）在 CFG=1.5 时取得 FID 3.01 与 IS 354.4。

**图 12（原文 Figure 12）：** 与改进版 MeanFlow（iMF）（Geng et al., 2025b）的并排比较（第 2/5 页）。其余说明同图 11（iMF 使用 CFG \(\omega=6.0\)、区间 \([0.2,0.8]\)，FID 3.92 / IS 348.2，DiT-XL/2；我们的方法在 CFG=1.5 时 FID 3.01 / IS 354.4，DiT-L/2）。

**图 13（原文 Figure 13）：** 与改进版 MeanFlow（iMF）（Geng et al., 2025b）的并排比较（第 3/5 页）。其余说明同图 11。

**图 14（原文 Figure 14）：** 与改进版 MeanFlow（iMF）（Geng et al., 2025b）的并排比较（第 4/5 页）。其余说明同图 11。

**图 15（原文 Figure 15）：** 与改进版 MeanFlow（iMF）（Geng et al., 2025b）的并排比较（第 5/5 页）。其余说明同图 11。

---

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、第 1–6 节正文与全部小节（§2 六个主题段、§3.1–3.5、§4、§5.1–5.3、§6）、致谢、式 (1)–(47)（保留原文编号）、表 1–11（逐格转写）与三处表内小表（A.2 风格嵌入、A.5 多尺度特征、A.6 多温度）、图 1–15 图注、算法 1–2 逐行代码、附录 A–C（A.1–A.9、B.1–B.5、C.1–C.2）、参考文献 [1]–[70] 英文原条目；原文无编号定理/引理环境（仅命题 3.1）、无关键词。许可：CC BY 4.0（https://creativecommons.org/licenses/by/4.0/）；按用户 2026-11-03 要求制作并公开本篇中文译文，保留署名与来源。

**已知缺陷与核对说明：** ① 底稿 pypdf 抽取在该 PDF 上丢失词间空格（如 `attraining-time`、`qmatchesp data`、`V=V +`），正文按 PDF 渲染页（2.0 倍）逐段复核；式 (1)–(47) 逐式对照渲染页核对并补齐编号，其中 (6)(13)(14) 的停止梯度范围、(8)–(11) 的归一化因子、(18)–(26) 的特征/漂移归一化、(28)–(33) 的可辨识性推导、(34)–(47) 的 MMD 推导均按渲染页转写。② 表 1–11 按渲染页逐格核对（含合并单元格、粗体、短横线行），并另做高倍裁剪核对了数值与粗体：表 1 的反对称默认行、表 2 两子表末行的分配值与 FID 8.46、表 3 末行 3.36、表 4 的 1.54、表 5 的 1.13 与 1.54、两行 Drifting Model 方法名、表 6 的 1.38 与 1.61 及两行 Drifting Model 方法名、表 7 每行较优值与 Drifting Policy 列标题、表 9 的 3.70、表 10 的 1.61、表 11 的 8.46。③ 原文的浅灰排印/底纹未在 Markdown 中复现，一律在表注中说明：表 5 与表 6 的多步基线各行文字为浅灰（表 6 为 RGB 153/255；两表的浅灰行均不含分组标题行）；表 9 的 latent (B/2) 列为浅灰文字；表 7 的分组标题行与表 8 的分组行为浅灰底纹。④ 表 7 的粗体规则为每个任务行内两者较优者加粗（并列时两列均加粗），据此逐格转写。⑤ 表 8 原文含大量跨列合并单元格：本页对跨全部配置列的单元格标注“（所有配置相同）”；对部分跨列的单元格在表注说明（`EMA decay` 的 {0.999, 0.9995, 0.9998, 0.9999} 覆盖除 ablation 默认外的四列）。⑥ 表 2 表注原文写作 “\(B=N_c\times N_{\mathrm{pos}}\) (4096)”，而左子表各行实际满足 \(B=N_c\times N_{\mathrm{neg}}=4096\)；本页按原文照录表注并在此注明该字面差异。⑦ 图 1–6 仅译图注并转写图中可见坐标轴/图例/子图标签；第 20–28 页为纯样例图页，只译图注并注明；图 12–15 的说明与图 11 相同，为避免重复以“其余说明同图 11”概括。⑧ 算法 1–2 保留原文 Python 伪代码（含变量名与注释），抽取文本中的连写（如 `keepdim=True`、`randn([N, C])`、`A_row * A_col`）已按渲染页还原；代码未逐行执行验证。⑨ 参考文献 [1]–[70]：原文为作者—年份制、未编号，本页按原文同一字母顺序编号；原文中的排印错误按原样保留（如 Su et al. 的 “totary position embedding”、Unterthiner et al. 的 “nash qquilibria”、若干会议名的大小写混排）；抽取中的变音符（如 Dollár、Vanden-Eijnden）按渲染页还原。⑩ 逐句逐式终校未做；建议后续 QA 重点复核：式 (6)/(13)/(14) 的 stopgrad 位置、式 (21)/(25) 的 \(\sqrt{C_j}\) 位置、式 (30) 的 \(\mathbf{U}_{ij}\) 列定义、式 (33) 的核形式、C.2 中 (44) 与 (47) 的核归一化位置、以及表 8 中 `ResNet: size / stage` 与 `EMA decay` 的合并范围。 ⑪ 原文自身存在一处内部不一致：表 8 的 `ResNet: block type` 标为 `bottleneck`（跨全部配置列），而 A.3 正文写“所有残差块都是 basic 块（各由两个 3×3 卷积组成）”、并给出 ResNet-34 式 [3,4,6,3] 配置；两处均按原文照录，未做统一或改写。

**登记（2026-11-03）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
