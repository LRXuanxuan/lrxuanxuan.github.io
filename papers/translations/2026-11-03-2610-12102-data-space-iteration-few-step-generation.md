---
layout: page
title: "数据空间迭代的少步生成｜中文全文译文"
permalink: /papers/translations/2026-11-03-2610-12102-data-space-iteration-few-step-generation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/7342ab30ff421c7f/) · [原文 arXiv](https://arxiv.org/abs/2610.12102/) · [全部目录](/papers/catalog/)

# 数据空间迭代的少步生成

**原题：** Few-Step Generation via Data-Space Iteration  
**作者：** Shanchuan Lin、Yansong Peng、Fu-Yun Wang、Haoqi Fan（单位按 PDF 原文转写）  
**单位：** ByteDance Seed（字节跳动 Seed）。原文脚注：† 通讯作者，邮箱 `peterlin@bytedance.com`。  
**版本：** arXiv:2610.12102v1（PDF 首页 arXiv 戳：arXiv:2610.12102v1 [cs.LG]，8 Oct 2026）；21 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、第 1–5 节正文与全部小节（§2.1–2.6、§3.1–3.5）、AI 使用声明、致谢、式 (1)–(26)（保留原文编号）、表 1–8（逐格转写）、图 1–3 图注、算法 1–2 逐行代码、附录 A–G、参考文献英文原条目（原文作者—年份制、按字母序排列，本页按同一顺序编号 [1]–[72]）；许可：CC BY 4.0。逐句逐式终校未做。

## 摘要

流匹配（flow matching）已成为训练高质量生成模型的可扩展范式，但从所学概率流采样需要大量网络评估。蒸馏可以把这一代价降低到一次或少数几次评估；然而一步生成往往会牺牲质量，使少步生成成为实际的工作区间。现有少步方法沿概率流执行迭代计算，因此需要一个固定的、手工选定的时间步离散化。该离散化通常按启发式选定，且调优代价高昂；当不同样本或不同空间位置的精化难度不同时，它也可能成为一种限制。我们提出**数据空间迭代（data-space iteration）**，一个完全移除流离散化的少步生成框架。从噪声出发，共享生成器直接在数据空间中精化其预测，每一次迭代都被训练为在其能力允许范围内产生最好的样本。我们的表述只需极小的改动即可与分布匹配蒸馏（DMD）结合，从而在匹配的训练设置下对不同迭代方法做受控比较。在类别条件 ImageNet 256×256 上，数据空间迭代优于标准离散化基线，并达到或超过通过时间表搜索选出的变体，且无需针对时间表的训练。这些结果表明，对于快速生成而言，数据空间迭代为离散化流空间迭代提供了一个简单而有效的替代方案。

**图 1（原文 Figure 1）：** （a）现有少步生成器在概率流空间中执行迭代采样，需要一个预先定义、可能次优的时间步离散化。（b）我们的方法在数据空间中完成全部精化，去除离散化瓶颈并获得更好性能。（图中面板说明：（a）流空间迭代——从噪声 \(z\) 经 \(\hat{\mathbf{x}}_{t_r}\)、\(\hat{\mathbf{x}}_{t_{r+1}}\) 到 \(\hat{\mathbf{x}}_0\)，转移由 \(G_\theta(\hat{\mathbf{x}}_{t_r},t_r,t_{r+1})\to\hat{\mathbf{x}}_{t_{r+1}}\) 给出；（b）数据空间迭代——从噪声 \(z\) 出发，共享生成器按 \(\hat{\mathbf{x}}_0^{(r)}\to\hat{\mathbf{x}}_0^{(r+1)}\) 反复精化数据预测 \(G_\theta(\hat{\mathbf{x}}_0^{(r)},z,r)\to\hat{\mathbf{x}}_0^{(r+1)}\)。）

## 1 引言

流匹配（Lipman et al., 2023）已成为现代生成模型可扩展的预训练范式。通过在简单噪声与数据分布之间学习连续概率流，它为高容量图像与视频生成器提供了稳定而灵活的基础（Seawead et al., 2025; Seedance et al., 2025; 2026）。然而，这一优势伴随推理时的代价：生成高质量样本需要对所学流做数值积分，通常需要大量网络评估。这一代价推动了大量蒸馏方法，用于把预训练流匹配模型转换为可一步或仅少数步采样的生成器（Salimans & Ho, 2022; Song et al., 2023; Frans et al., 2025; Geng et al., 2025）。

原则上，蒸馏可以以一步生成为目标。然而在实践中，单次网络评估提供的有效计算深度有限，激进的一步蒸馏往往导致可见的质量退化（Lin et al., 2025a）。因此少步生成已成为更实用的工作点：用少量额外评估换取显著提升的样本质量。这也正是已部署高分辨率生成系统最相关的区间——四步采样常被用作延迟与保真度之间较为有利的折中（Zheng et al., 2026b）。

尽管取得了这些进展，现有少步生成器仍在概率流空间中执行迭代计算。无论方法是先去噪、再重新加噪到下一个噪声水平，还是直接学习中间流边缘分布之间的映射，生成本身都围绕一个手工选定的流时间区间离散化来组织。该离散化通常被视为固定的设计选择，而不是生成器中可学习的组件。

对基于自轨迹展开反向蒸馏（self-rollout backward distillation）（Yin et al., 2024a; Kohler et al., 2024）的现代蒸馏流程而言，固定离散化尤其受限。在这些方法中，每次生成器更新都在生成器自身先前展开步所产生的状态上训练。因此，展开时间表必须在训练期间定义，而不只是在推理时选择。在因果流式视频生成等应用中，自轨迹展开更为核心，因为模型必须学会精化自己生成的历史（Lin et al., 2025b; Huang et al., 2025; Zheng et al., 2026a）。然而，用于展开的时间步离散化通常是启发式选定的（Hoogeboom et al., 2023; Esser et al., 2024）。在备选时间表上搜索代价高昂，因为每个候选时间表都可能需要训练一个不同的蒸馏生成器。

促使我们提出该表述的一个直觉是：可能并不存在普遍最优的时间步离散化。一个去噪转移的难度可能取决于正在生成的样本：不同提示或类别可以诱导出语义与频谱复杂度不同的样本，因而可能偏好不同的有效步长。类似地，具有不同频率内容的空间区域可能受益于不同形式的精化。然而单个全局流时间步却让每个样本与每个位置都沿同一去噪时间表推进。这一观察促使我们研究：是否可以在没有固定概率流离散化的情况下组织精化。

我们提出**数据空间迭代（data-space iteration）**用于少步生成。我们的生成器不沿离散化的概率流路径反复移动，而是直接在数据空间中完成全部精化。从一个初始噪声样本出发，生成器反复更新当前的数据空间预测。每个精化步都被训练为在给定当前估计与原始噪声的情况下，输出其能力所允许的最佳样本。该表述从生成器的迭代采样过程中移除了时间步离散化超参数，并让模型把全部计算用于直接改进样本。

我们的方法只需对广泛使用的分布匹配蒸馏（DMD）框架（Yin et al., 2024b;a）做极小修改即可训练。真实流模型与虚假流模型、DMD 目标以及自轨迹展开训练结构都被保留；只把生成器展开从概率流迭代改为数据空间迭代。这使得比较尤其受控：训练配方保持不变，只改变迭代采样空间。

我们在类别条件 ImageNet 256×256 生成（Russakovsky et al., 2015）上评估，使用预训练的 SiT-XL/2（Ma et al., 2024）流匹配教师骨干。在匹配的 DMD 训练设置下，数据空间迭代优于标准离散化基线，并达到或超过通过时间表搜索选出的变体。这些结果表明：移除手工指定的流时间离散化可以在保持或提升生成质量的同时，免去训练时间表特定生成器的需要。

## 2 方法

### 2.1 流匹配背景

令 \(\mathbf{x}_0\sim p_{\mathrm{data}}\) 为数据样本，\(\mathbf{x}_1\sim p_{\mathrm{noise}}\) 为独立噪声样本。流匹配通过一个连续流连接这两个分布。一种常见选择是线性插值：

$$
\mathbf{x}_t=(1-t)\mathbf{x}_0+t\mathbf{x}_1,\quad t\in[0,1].\tag{1}
$$

训练一个神经网络 \(v_\phi\) 来预测该流的速度：

$$
\frac{\mathrm{d}\mathbf{x}_t}{\mathrm{d}t}=v_\phi(\mathbf{x}_t,t).\tag{2}
$$

为生成样本，我们抽取 \(\mathbf{x}_1\sim p_{\mathrm{noise}}\)，并从 \(t=1\) 到 \(t=0\) 反向求解该常微分方程（ODE）。精确的数值求解通常需要数十到数百次网络评估。蒸馏把这一昂贵过程替换为一个只需少数几次评估即可产生样本的生成器。

### 2.2 现有少步生成范式

现有少步方法在概率流空间中执行迭代。我们将其归为两类范式。

**流—重加噪迭代（flow-renoise iteration）。** 给定时间表点 \(t_r\) 处的噪声状态，生成器预测数据端点：

$$
\hat{\mathbf{x}}_0=G_\theta(\mathbf{x}_{t_r},t_r).\tag{3}
$$

为继续迭代，该预测在下一时间表点 \(t_{r+1}<t_r\) 处与噪声混合：

$$
\hat{\mathbf{x}}_{t_{r+1}}=(1-t_{r+1})\hat{\mathbf{x}}_0+t_{r+1}\boldsymbol{\varepsilon},\quad \boldsymbol{\varepsilon}\sim p_{\mathrm{noise}}.\tag{4}
$$

所得噪声状态被送回生成器，并重复“预测—重加噪”过程。原始 DMD 方法（Yin et al., 2024b;a）、一致性模型（Song et al., 2023; Song & Dhariwal, 2024; Lu & Song, 2025; Luo et al., 2023a; Wang et al., 2024b）以及多种其他方法（Lin et al., 2025a; Ren et al., 2024; Sauer et al., 2024b;a）是该范式的代表。

**流映射迭代（flow-map iteration）。** 流映射方法不在每一步预测数据端点，而是学习相邻时间表点之间的直接转移：

$$
\hat{\mathbf{x}}_{t_{r+1}}=G_\theta(\mathbf{x}_{t_r},t_r,t_{r+1}).\tag{5}
$$

生成过程通过在这些映射上沿连续时间区间复合，直到到达 \(t_R=0\)。Phased DMD（Fan et al., 2026）、MeanFlow（Geng et al., 2025; 2026; Zhou et al., 2026; Zhang et al., 2026; Peng et al., 2026）以及许多其他方法（Salimans & Ho, 2022; Wang et al., 2024a; Yan et al., 2024; Lin et al., 2024b; Lin & Yang, 2024; Lin et al., 2026a; Frans et al., 2025）是该范式的例子。

**对流时间离散化的依赖。** 现有方法用流时间来定义生成过程中的进度。因此它们必须选择某个时间表，例如 \(1=t_0>t_1>\cdots>t_R=0\)。对于自轨迹展开蒸馏，该时间表决定了训练期间所见的状态，并且必须在训练开始前固定。测试另一时间表通常需要训练另一个模型。全局时间表还被所有样本与空间位置共享，这促使我们考虑一种无时间表的替代方案。数据空间迭代通过在步与步之间传递数据预测（而不是流状态），移除了流时间时间表。

### 2.3 通过数据空间迭代的少步生成

给定噪声 \(\mathbf{z}\sim p_{\mathrm{noise}}\)，我们用零初始化数据空间估计：

$$
\hat{\mathbf{x}}_0^{(0)}=\mathbf{0},\tag{6}
$$

并通过反复应用共享生成器来精化它：

$$
\hat{\mathbf{x}}_0^{(r+1)}=G_\theta\left(\hat{\mathbf{x}}_0^{(r)},\mathbf{z},r\right),\quad r=0,\ldots,R-1.\tag{7}
$$

这里 \(r\) 是精化索引，\(R\) 是网络评估的最大次数。每一步都提供相同的源噪声 \(\mathbf{z}\)，而对 \(r\) 的条件化让共享生成器在每一阶段使用不同的更新。

每个生成器输出都是数据空间中的预测。与流—重加噪不同，我们的方法不在预测之间加入噪声；与流映射不同，它不在中间流时间构造状态。每一步都被训练为产生有效样本，并可以利用前一次预测来改进其输出。因此采样不需要流时间时间表。

### 2.4 通过分布匹配蒸馏训练

数据空间迭代只需对标准 DMD 训练做很小改动。我们保留冻结的预训练流模型 \(v_{\mathrm{real}}=v_\phi\) 与辅助的虚假流模型 \(v_{\mathrm{fake}}=v_\psi\)。虚假模型由预训练模型初始化，\(\psi\leftarrow\phi\)，并额外以精化索引为条件：\(v_{\mathrm{fake}}(\mathbf{x}_\tau,\tau,r)\)。它被训练为在每个精化步跟踪生成器分布。

**生成器更新。** 我们采样精化索引 \(r\in\{0,\ldots,R-1\}\) 与噪声 \(\mathbf{z}\sim p_{\mathrm{noise}}\)。我们先在不跟踪梯度的情况下运行 \(r\) 个精化步，得到 \(\hat{\mathbf{x}}_0^{(r)}\)。然后执行一次带梯度的步：

$$
\hat{\mathbf{x}}_0^{(r+1)}=G_\theta\left(\hat{\mathbf{x}}_0^{(r)},\mathbf{z},r\right).\tag{8}
$$

接着采样独立噪声样本 \(\boldsymbol{\varepsilon}\sim p_{\mathrm{noise}}\) 与 DMD 加噪时间 \(\tau\)，并对新预测加噪：

$$
\hat{\mathbf{x}}_\tau^{(r+1)}=(1-\tau)\hat{\mathbf{x}}_0^{(r+1)}+\tau\boldsymbol{\varepsilon}.\tag{9}
$$

生成器用 DMD 损失训练：

$$
\mathcal{L}_{\mathrm{dmd}}(\theta)=\mathbb{E}_{\mathbf{z},r,\tau,\boldsymbol{\varepsilon}}\left[w(\tau)\,\mathrm{sg}\left[v_{\mathrm{real}}\left(\hat{\mathbf{x}}_\tau^{(r+1)},\tau\right)-v_{\mathrm{fake}}\left(\hat{\mathbf{x}}_\tau^{(r+1)},\tau,r\right)\right]^{\top}\hat{\mathbf{x}}_0^{(r+1)}\right],\tag{10}
$$

其中 \(\mathrm{sg}[\cdot]\) 表示停止梯度，\(w(\tau)\) 是加权函数。因此真实与虚假流预测之差给出了一个固定的更新方向，把生成器分布推向数据分布。

**虚假模型更新。** 与生成器更新交替进行，我们在带噪的生成器样本上训练虚假流模型。对上述线性路径，其目标速度为 \(\boldsymbol{\varepsilon}-\hat{\mathbf{x}}_0^{(r+1)}\)，给出

$$
\mathcal{L}_{\mathrm{fake}}(\psi)=\mathbb{E}_{\mathbf{z},r,\tau,\boldsymbol{\varepsilon}}\left[\left\|v_{\mathrm{fake}}\left(\hat{\mathbf{x}}_\tau^{(r+1)},\tau,r\right)-\left(\boldsymbol{\varepsilon}-\hat{\mathbf{x}}_0^{(r+1)}\right)\right\|_2^2\right].\tag{11}
$$

注意，这种自轨迹展开策略在基于 DMD 的少步生成器中已是标准做法。我们只改变展开过程：现有方法沿概率流迭代，而我们的方法在数据空间中迭代。核心 DMD 表述保持不变，因此与匹配的 DMD 基线相比，我们的方法不增加额外计算或内存。

**训练目标的范围。** 一些先前的基于 DMD 的方法会加入辅助对抗（GAN）损失（Goodfellow et al., 2014）或整流流目标（Liu et al., 2023）。我们省略这些组件，因为它们引入额外的损失权重与设计选择，扩大搜索空间，使迭代方法本身的效果更难被隔离。我们的目标不是把一切可用技术组合起来追求当前最优性能，而是为比较迭代采样方法提供一个简单、受控且可复现的设置。

### 2.5 生成器实现

我们通过对预训练速度网络 \(v_\phi(\mathbf{x}_t,t)\) 做最小修改来构造生成器。令 \(g_\theta\) 表示修改后的网络，用预训练参数初始化，\(\theta\leftarrow\phi\)。源噪声 \(\mathbf{z}\) 使用原始输入投影。我们为当前估计 \(\hat{\mathbf{x}}_0^{(r)}\) 增加一个单独的投影，并把两个投影输入相加。我们还把 \(r\) 的嵌入加到现有的时间步条件化通路上。原始流时间输入在每次生成器评估时固定为 \(t=1\)。

生成器输出为

$$
\hat{\mathbf{x}}_0^{(r+1)}=G_\theta\left(\hat{\mathbf{x}}_0^{(r)},\mathbf{z},r\right):=\mathbf{z}-g_\theta\left(\hat{\mathbf{x}}_0^{(r)},\mathbf{z},r,t=1\right).\tag{12}
$$

对线性路径，目标速度是 \(\mathbf{x}_1-\mathbf{x}_0\)。在噪声端点，令 \(\mathbf{x}_1=\mathbf{z}\)，就得到相应的数据预测 \(\mathbf{x}_0=\mathbf{z}-v\)。这促使我们从 \(\mathbf{z}\) 中减去预测速度。该构造保留了预训练参数化，只增加数据空间精化所需的输入。

新增参数通常可以忽略，且时间步投影 MLP 可以替换为常数 \(t=1\) 嵌入，因此模型规模实际上会变小，详见附录。

### 2.6 与不动点模型的联系

反复应用共享生成器类似于不动点模型（Bai et al., 2019），其输出由平衡点定义：

$$
\mathbf{x}^\star=G_\theta(\mathbf{x}^\star,\mathbf{z}).\tag{13}
$$

我们的表述在两方面不同。第一，我们的生成器以 \(r\) 为条件，因此其更新可以随精化步变化。第二，我们在每一步都施加分布匹配目标，而不是只在收敛后施加。因此，展开的每个前缀（直到训练的最大 \(R\)）都被鼓励产生有效样本。

我们也不要求迭代收敛到不动点。匹配每一步的边缘输出分布并不迫使不同步实现同一从噪声到数据的映射。为检验更一致的映射是否有益，我们考虑加入可选的最优传输正则项（Lin et al., 2026a; Rakitin et al., 2026）：

$$
\mathcal{L}_{\mathrm{ot}}(\theta)=\lambda_{\mathrm{ot}}\,\mathbb{E}_{\mathbf{z},r}\left[\left\|G_\theta\left(\hat{\mathbf{x}}_0^{(r)},\mathbf{z},r\right)-\mathbf{z}\right\|_2^2\right].\tag{14}
$$

与分布匹配结合时，该正则目标使每一步偏向学习同一个从 \(\mathbf{z}\) 到数据分布的 Wasserstein-2 最优传输，这可能促使连续预测更稳定。然而，正如我们后续实验所示，它并未带来任何改进。

## 3 实验

### 3.1 实验设置

遵循少步生成的先前工作，我们在潜空间中评估类别条件 ImageNet 256×256 生成基准（Rombach et al., 2022）¹。所有方法都使用 Transformer 架构，具体为 DiT-XL/2（Peebles & Xie, 2023）。我们报告 50k 类别平衡生成样本相对 ImageNet 训练集的 Fréchet Inception Distance（FID）（Heusel et al., 2017），数值越低表示质量越好。我们用函数评估次数（NFE）度量采样开销。对预训练流匹配骨干，我们直接采用 SiT-XL/2 检查点（Ma et al., 2024）。

对 DMD 训练，我们设 \(R=4\)，使训练出的生成器支持最多四步生成；如后续实验所示，使用更多步数不会进一步改善 FID。我们使用 Adam（Kingma & Ba, 2015）优化，学习率 \(1\times10^{-4}\)、批大小 256，并在所有实验中使用。我们对 \(G_\theta\) 的每次更新执行四次 \(v_{\mathrm{fake}}\) 的优化更新。所有模型训练 40 个 epoch。

> **脚注 1（原文脚注）：** ¹ https://huggingface.co/stabilityai/sd-vae-ft-mse

### 3.2 数据空间迭代生成的消融研究

**DMD 加权。** 如表 1a 所示，DMD 时间步加权会影响最终 FID。我们首先在均匀时间步采样下搜索损失加权函数 \(w(\tau)\)，发现训练更强调高噪声时间步时性能最好。随后我们用对 \(\tau\) 的重要性采样替代损失加权。在等价设置下，重要性采样始终优于损失加权。我们把这一改进归因于它对每个 minibatch 的更高效利用：不是给均匀采样批次中的一部分分配低权重，而是把更多样本分配给对目标贡献最大的时间步。重要性采样还使训练 \(G_\theta\) 所用的时间步分布与训练 \(v_{\mathrm{fake}}\) 所用的一致。

**表 1（原文 Table 1）：** 数据空间迭代生成器的消融研究。FID 越低越好。（a）DMD 时间步加权（细节见附录）；（b）生成器对 \(r\) 的条件化；（c）Adam 优化器 betas；（d）最优传输正则项。原文以粗体标出最终采用的设置所在行（a 中 \(w(\tau)=\tau\) 与 \(\tau\sim\mathrm{Beta}(2.50,1)\) 两个设置，b–d 中更优的一行）。

（a）DMD 时间步加权

| \(\tau\) | \(w(\tau)\) | 1NFE | 2NFE | 3NFE | 4NFE | 备注 |
|---|---|---|---|---|---|---|
| Uniform(0,1) | \((1-\tau)^2/\tau\) | 爆炸 | — | — | — | 等价于无加权的 score 表述。 |
| Uniform(0,1) | \((1-\tau)/\tau\) | 爆炸 | — | — | — |  |
| Uniform(0,1) | \(1-\tau\) | 8.24 | 6.91 | 6.05 | 5.66 | 等价于把梯度作用于 \(\hat{\mathbf{x}}_\tau\)。 |
| Uniform(0,1) | 1 | 4.32 | 3.67 | 3.57 | 3.61 |  |
| Uniform(0,1) | \(\tau\) | **3.94** | **2.99** | **2.78** | **2.87** |  |
| Uniform(0,1) | \(\tau^2\) | 5.31 | 3.45 | 3.13 | 2.99 |  |
| Uniform(0,1) | \((1-\tau)\tau\) | 4.32 | 3.45 | 3.44 | 3.43 | 未做动态归一化的 DMD 加权。 |
| Uniform(0,1) | \((1-\tau)\tau\frac{CS}{\lVert\hat{x}-x\rVert_1}\) | 4.24 | 3.24 | 3.22 | 3.22 | DMD 加权。 |
| Beta(2.00, 1) | 1 | 3.77 | 2.72 | 2.58 | 2.55 | 等价于均匀采样下的 \(w(\tau)=\tau\)。 |
| Beta(2.50, 1) | 1 | **3.85** | **2.68** | **2.47** | **2.46** | 在两者之间插值。 |
| Beta(3.00, 1) | 1 | 4.63 | 2.98 | 2.73 | 2.64 | 等价于均匀采样下的 \(w(\tau)=\tau^2\)。 |

（b）生成器对 \(r\) 的条件化

| 生成器 | 1NFE | 2NFE | 3NFE | 4NFE |
|---|---|---|---|---|
| \(G(\hat{\mathbf{x}}_0,\mathbf{z})\) | 3.91 | 3.06 | 2.73 | 2.63 |
| \(G(\hat{\mathbf{x}}_0,\mathbf{z},r)\) | **3.85** | **2.68** | **2.47** | **2.46** |

（c）Adam 优化器 betas

| Betas | 1NFE | 2NFE | 3NFE | 4NFE |
|---|---|---|---|---|
| (0.9, 0.95) | 3.99 | 2.90 | 2.73 | 2.66 |
| (0.0, 0.95) | **3.85** | **2.68** | **2.47** | **2.46** |

（d）最优传输正则项

| \(\lambda_{\mathrm{ot}}\) | 1NFE | 2NFE | 3NFE | 4NFE |
|---|---|---|---|---|
| 0 | **3.85** | **2.68** | **2.47** | **2.46** |
| 1e-6 | 3.90 | 2.74 | 2.54 | 2.47 |

**生成器对 \(r\) 的条件化。** 如表 1b 所示，让生成器以精化步 \(r\) 为条件始终改善性能。该条件化把共享生成器当前所处的精化阶段告知它，使其能施加与阶段相适应的修正，而不是在每一步使用同一更新规则。

**Adam 优化器 betas。** 如表 1c 所示，我们发现设 \(\beta_1=0.0\) 始终改善性能。这表明在我们的设置下移除一阶动量对 DMD 训练有益。我们在其余所有实验中使用该设置。

**最优传输正则项。** 如表 1d 所示，最优传输正则项在我们的设置下没有改善性能。相反，加入平方 \(\ell_2\) 正则项相对无正则模型略微降低 FID。因此我们在最终方法中不使用该正则项。

### 3.3 不同采样方法间的消融研究

本节我们跨数据空间迭代、流—重加噪迭代以及用 phased DMD（Fan et al., 2026）训练的流映射迭代开展消融研究。所有方法使用相同的自轨迹展开训练流程，\(R=4\)。流—重加噪在中间步即可产生有效样本，因此我们可以在每个 NFE 报告 FID。相反，流映射模型只为四步生成训练，因此我们只在 4NFE 报告其 FID。

**跨方法的 DMD 加权。** 表 2a 报告每种采样方法的 DMD 加权搜索。在每一个比较的加权设置下，数据空间迭代都优于流—重加噪方法。两种方法表现出相同趋势：当 DMD 目标更强调高噪声时间步时，FID 改善。由于 phased DMD 仅通过采样 \(\tau\in[t_{r+1},1]\) 来训练从 \(t_r\) 到 \(t_{r+1}\) 的映射，我们也用完全相同的设置训练数据空间方法，以获得匹配比较。在比较的加权设置下，数据空间迭代同样优于流映射方法。

**表 2（原文 Table 2）：** 不同采样方法间的消融研究。FID 越低越好。（a）DMD 时间步加权；（b）无分类器引导（CFG）；（c）采样时间步离散化。原文以粗体标出各方法块内的较优值与选定设置，并用浅灰底纹标注选定或失效行；本页数值按 PDF 渲染逐格照录，粗体标记未逐格复现（说明见文末）。

（a）DMD 时间步加权。三列方法块依次为“数据空间迭代（Ours）”“流—重加噪”“流映射”，前三者各报告 1–4NFE，流映射只报告 4NFE。

| \(\tau\) | \(w(\tau)\) | Ours 1NFE | Ours 2NFE | Ours 3NFE | Ours 4NFE | 流—重加噪 1NFE | 2NFE | 3NFE | 4NFE | 流映射 4NFE |
|---|---|---|---|---|---|---|---|---|---|---|
| Uniform(0, 1) | 1 | 4.32 | 3.67 | 3.57 | 3.61 | 5.07 | 4.41 | 4.29 | 4.08 | — |
| Uniform(0, 1) | \(\tau\) | 3.94 | 2.99 | 2.78 | 2.87 | 4.64 | 3.82 | 3.47 | 3.42 | — |
| Beta(2.50, 1) | 1 | 3.85 | 2.68 | 2.47 | 2.46 | 4.45 | 3.22 | 2.67 | 2.75 | — |
| Uniform(\(t_{r+1}\), 1) | 1 | 44.91 | 4.08 | 2.24 | 2.51 | — | — | — | — | 2.55 |
| Uniform(\(t_{r+1}\), 1) | \(\tau\) | 44.20 | 4.86 | 2.53 | 2.49 | — | — | — | — | 2.57 |

（b）无分类器引导（CFG）

| CFG 尺度 | 时间步范围 | Ours 1NFE | Ours 2NFE | Ours 3NFE | Ours 4NFE | 流—重加噪 1NFE | 2NFE | 3NFE | 4NFE | 流映射 4NFE |
|---|---|---|---|---|---|---|---|---|---|---|
| 1.0（禁用） | — | 3.85 | 2.68 | 2.47 | 2.46 | 4.45 | 3.22 | 2.67 | 2.75 | 2.55 |
| 1.1 | [0.0, 1.0] | 3.06 | 2.61 | 2.60 | 2.59 | 3.63 | 2.80 | 2.74 | 2.97 | 2.96 |
| 1.2 | [0.0, 1.0]（同上） | 3.28 | 3.23 | 3.26 | 3.27 | 3.52 | 3.21 | 3.71 | 4.15 | 3.78 |
| 1.1 | [0.0, 0.7] | 3.22 | 2.47 | 2.37 | 2.35 | 3.61 | 2.70 | 2.55 | 2.74 | 2.93 |
| 1.1 | [0.0, 0.6] | 3.31 | 2.47 | 2.33 | 2.29 | 4.02 | 2.89 | 2.51 | 2.61 | 2.86 |
| 1.1 | [0.0, 0.5] | 3.53 | 2.50 | 2.33 | 2.35 | 4.05 | 2.92 | 2.51 | 2.66 | 2.90 |

（c）采样时间步离散化

| 移位因子 \(\gamma\) | 离散化 | CFG | 流—重加噪 1NFE | 2NFE | 3NFE | 4NFE | 流映射 4NFE |
|---|---|---|---|---|---|---|---|
| 0.5 | [1.00, 0.60, 0.33, 0.14] | 否 | 4.47 | 2.84 | 2.67 | 2.84 | 2.52 |
| 1.0（均匀） | [1.00, 0.75, 0.50, 0.25] | 否 | 4.45 | 3.22 | 2.67 | 2.75 | 2.55 |
| 2.0 | [1.00, 0.86, 0.67, 0.40] | 否 | 4.20 | 3.44 | 2.88 | 2.72 | 2.48 |
| 0.5 | [1.00, 0.60, 0.33, 0.14] | 是 | 3.74 | 2.78 | 2.54 | 2.71 | 2.52 |
| 1.0（均匀） | [1.00, 0.75, 0.50, 0.25] | 是 | 4.02 | 2.89 | 2.51 | 2.61 | 2.86 |
| 2.0 | [1.00, 0.86, 0.67, 0.40] | 是 | 3.71 | 2.80 | 2.56 | 2.69 | 2.37 |

**CFG 超参数搜索。** 表 2b 总结我们的无分类器引导（CFG）（Ho & Salimans, 2021）搜索。在所有可比较的 CFG 配置下，数据空间迭代都始终优于流—重加噪与流映射。我们首先在 \(\tau\) 的完整时间步范围上施加标准 CFG，发现它会恶化性能。随后我们把 CFG 限制在 \(\tau\) 的有限区间（Kynkäänniemi et al., 2024）。有趣的是，CFG 会降低流映射方法的性能。启用 CFG 时，仅在 \(\tau\in[0.0,0.6]\) 上使用 1.1 的引导尺度可在所有方法中取得最佳总体性能。

**时间步离散化搜索。** 至此，流—重加噪与流映射都使用均匀的“尾部”流时间离散化 \([1.0,0.75,0.5,0.25]\) 作为基线（Lin et al., 2024a）。我们把它作为默认值，因为先前少步生成方法在同一架构下采用了它，并在 ImageNet 256×256 设置上取得了当前最优性能（Frans et al., 2025; Zhang et al., 2026; Wang et al., 2026; Zhou et al., 2026; Lin et al., 2026a）。遵循先前工作（Esser et al., 2024），我们通过对均匀离散化施加以下移位函数，实验不同的时间步离散化：

$$
\mathrm{shift}(t;\gamma)=\frac{\gamma t}{1+(\gamma-1)t},\tag{15}
$$

其中 \(\gamma\) 是移位因子。表 2c 表明，改变离散化会显著影响流—重加噪的中间步 FID，并大幅改变流映射的 CFG FID。有趣的是，移位参数在不同方法或 CFG 设置下与最终性能没有可预测的相关性，这凸显了预测最优时间步离散化的困难。

### 3.4 主要比较

表 3 报告主要结果，并处理两个不同的比较。我们的主要比较使用先前少步方法采用的均匀离散化。这代表了实践者在不训练多个时间表特定生成器的情况下选择一个合理时间表的标准化设置。我们另外报告离散化搜索中的最佳结果，作为 oracle 式比较。在自轨迹展开设置下，要得到该结果需要为每个候选时间表训练一个单独的生成器。

**表 3（原文 Table 3）：** 主要结果。FID 越低越好。原文将 Data-space DMD（本方法）两行加粗；CFG 列在原文为跨行合并单元格，此处按行展开为 No/Yes。

| 方法 | 范式 | 离散化 | CFG | 250NFE | 1NFE | 2NFE | 3NFE | 4NFE |
|---|---|---|---|---|---|---|---|---|
| Flow Matching | flow-ODE | uniform | No | 8.26 | — | — | — | — |
| DMD | flow-renoise | uniform | No | — | 4.45 | 3.22 | 2.67 | 2.75 |
| DMD | flow-renoise | oracle（3 者最优） | No | — | 4.20 | 3.44 | 2.88 | 2.72 |
| Phased DMD | flow-map | uniform | No | — | — | — | — | 2.55 |
| Phased DMD | flow-map | oracle（3 者最优） | No | — | — | — | — | 2.48 |
| **Data-space DMD** | data-space | none | No | — | **3.85** | **2.68** | **2.47** | **2.46** |
| Flow Matching | flow-ODE | uniform | Yes | 2.06 | — | — | — | — |
| DMD | flow-renoise | uniform | Yes | — | 4.02 | 2.89 | 2.51 | 2.61 |
| DMD | flow-renoise | oracle（3 者最优） | Yes | — | 4.02 | 2.89 | 2.51 | 2.61 |
| Phased DMD | flow-map | uniform | Yes | — | — | — | — | 2.86 |
| Phased DMD | flow-map | oracle（3 者最优） | Yes | — | — | — | — | 2.37 |
| **Data-space DMD** | data-space | none | Yes | — | **3.31** | **2.47** | **2.33** | **2.29** |

在标准均匀离散化下，数据空间迭代在所有报告的 NFE 设置下都始终优于流—重加噪与流映射。即使允许从三种离散化中做 oracle 选择，流映射也只是缩小差距并仍略微落后；而流—重加噪仍大幅落后。因此，数据空间迭代无需时间表搜索或时间表特定训练就取得了更强性能。附加指标见附录。

有趣的是，在无引导设置下，所有 DMD 蒸馏模型都显著优于流匹配教师。我们猜测这一改进源于 DMD 所用反向 KL 目标的模式寻求（mode-seeking）行为，如先前研究所述（Karras et al., 2024; Zheng et al., 2025; Lin et al., 2026b）。

### 3.5 可视化

图 2 可视化了数据空间迭代与流—重加噪的中间生成状态，以及流映射的最终输出。

尽管训练时没有使用最优传输正则项，也没有对精化轨迹施加任何其他显式损失约束，数据空间迭代生成器仍学会了从先前预测中精化结构与细节。相反，流—重加噪在迭代间表现出较大的内容变化：已经令人满意的区域可能在重加噪过程中被丢弃，并以不同内容重新生成，浪费模型容量。定量测量见附录。

**图 2（原文 Figure 2）：** 迭代生成轨迹的可视化。每行使用相同的初始噪声与类别条件。基于流的方法使用均匀离散化。（图中排版：左侧 4 列为本方法数据空间迭代的 1NFE–4NFE，中间 4 列为流—重加噪的 1NFE–4NFE，最右 1 列为流映射的 4NFE；共 4 行，对应 4 个 ImageNet 类别样本。）

## 4 相关工作

**少步蒸馏。** 基于 ODE 的蒸馏方法通过匹配教师转移、速度或一致性目标来压缩流轨迹（Salimans & Ho, 2022; Geng et al., 2025; Frans et al., 2025; Song et al., 2023）。然而逐点回归目标往往产生模糊样本。近期工作表明分布级目标可以显著改进此类蒸馏生成器（Lin et al., 2025a; Zheng et al., 2026b）。分布匹配蒸馏（DMD）（Yin et al., 2024b;a）建立在变分得分蒸馏（Wang et al., 2023; Luo et al., 2023b）之上，已成为被广泛采用的方法。正交方向的工作改进了 DMD 的扩展、参数化与得分估计（Ge et al., 2026; Cheng et al., 2026; Zhou et al., 2025; Chen et al., 2026; Lu et al., 2025）；这些进展与我们关注的生成器迭代空间互补。

**优化时间步离散化。** 先前工作优化了流模型的推理时离散化，但使用跨样本共享的单一时间表（Xue et al., 2024; Park et al., 2025）。近期方法转而训练一个单独的预测器，以与流模型相同的输入为条件，产生样本特定的离散化（Tong et al., 2025; Yuan et al., 2026）。该方法不能直接与自轨迹展开蒸馏兼容，因为后者必须在蒸馏训练期间指定时间步时间表。

**自条件化（Self-conditioning）。** 与我们的方法最接近的联系是自条件化（Chen et al., 2023; Strudel et al., 2022; Dieleman et al., 2022）。现有自条件化方法用先前评估的预测来精化模型的速度场，而生成仍然沿 ODE 积分该场。我们的方法则把数据预测本身当作迭代状态，因此数据空间精化直接构成少步生成过程。

**深度平衡模型。** 我们的表述也类似于深度平衡模型；第 2.6 节详述了关键的概念差异。近期工作把这一范式用于生成式蒸馏（Geng et al., 2023），在解码成图像之前先求解内部隐藏表示中的不动点。该方法需要平衡点特定的架构与求解器。相比之下，我们的方法只需最小的架构改动，因此更适合蒸馏现有的预训练生成模型。

**循环架构。** 循环 Transformer 通过反复应用共享 Transformer 块来扩展有效深度（Jeddi et al., 2026; Goyal et al., 2026）。近期工作通过端到端训练带分布匹配目标的循环 Transformer，探索了这一想法用于生成建模（Lin et al., 2026a）。然而该方法要在整个展开的循环上反向传播。由此产生的训练计算与内存开销在实践中可能成为障碍。数据空间迭代则是对现有蒸馏训练流程的轻量、即插即用式修改。

## 5 结论

我们提出了用于少步生成的数据空间迭代。通过直接精化数据预测，我们的方法免除了固定流时间离散化的需要，并以最小改动集成到 DMD 中。在类别条件 ImageNet 256×256 上，它优于标准均匀离散化基线，并达到或超过经时间表搜索的变体，且无需时间表特定训练。这些结果表明，数据空间精化是一种简单而有效的快速生成途径。

**局限。** 数据空间迭代需要自轨迹展开训练。当自轨迹展开本来就是必需的时候，这不带来额外代价，但在其他情况下是一个缺点。如果更偏好基于 ODE 的蒸馏目标而不是分布级目标，数据空间迭代可以用成对的数据与噪声样本训练，但更高效的训练方法仍有待探索。

**附加内容与未来工作。** 遵循先前少步生成研究，正文聚焦于 ImageNet 256×256 生成。我们还在附录中提供了 UNet 架构上的 CIFAR-10 结果。我们在附录中给出超参数、架构与代码细节。把数据空间迭代扩展到文生图生成与其他模态留待未来工作。

## AI 使用声明

在本工作中，我们使用生成式 AI 工具协助起草与改进论文文本、组织表格与图、以及实现与复查代码。我们没有使用生成式 AI 工具运行实际训练任务或整理引用。我们已复查所有经 AI 协助的工作，以确保文本、代码、表格与图准确反映我们的意图。我们对本工作的最终内容（包括借助生成式 AI 产生的文本、论断或制品）承担责任。

## 致谢

我们衷心感谢 Wei Tang 在本项目开发过程中给予的宝贵指导、富有洞见的讨论与持续支持。

## 参考文献

（原文采用作者—年份制、未编号，条目按字母序排列；本页按同一字母顺序编号 [1]–[72] 以便检索，条目保留英文原文。）

[1] Shaojie Bai, J. Zico Kolter, and Vladlen Koltun. Deep equilibrium models. In H. Wallach, H. Larochelle, A. Beygelzimer, F. d'Alché-Buc, E. Fox, and R. Garnett (eds.), Advances in Neural Information Processing Systems, volume 32. Curran Associates, Inc., 2019.

[2] Siyi Chen, Shaowei Liu, Yixuan Jia, Zian Wang, Huan Ling, Qing Qu, and Jun Gao. Data-forcing distillation: Restoring diversity and fidelity in few-step video generation. In ICML 2026 Workshop on Foundations of Deep Generative Models: Understanding Memorization, Generalization, and Reasoning, 2026.

[3] Ting Chen, Ruixiang Zhang, and Geoffrey Hinton. Analog bits: Generating discrete data using diffusion models with self-conditioning. In The Eleventh International Conference on Learning Representations, 2023.

[4] Zhenglin Cheng, Peng Sun, Jianguo Li, and Tao Lin. Twinflow: Realizing one-step generation on large models with self-adversarial flows. In The Fourteenth International Conference on Learning Representations, 2026.

[5] Prafulla Dhariwal and Alexander Quinn Nichol. Diffusion models beat GANs on image synthesis. In A. Beygelzimer, Y. Dauphin, P. Liang, and J. Wortman Vaughan (eds.), Advances in Neural Information Processing Systems, 2021.

[6] Sander Dieleman, Laurent Sartran, Arman Roshannai, Nikolay Savinov, Yaroslav Ganin, Pierre H. Richemond, A. Doucet, Robin Strudel, Chris Dyer, Conor Durkan, Curtis Hawthorne, Rémi Leblond, Will Grathwohl, and Jonas Adler. Continuous diffusion for categorical data. ArXiv, abs/2211.15089, 2022.

[7] Patrick Esser, Sumith Kulal, Andreas Blattmann, Rahim Entezari, Jonas Müller, Harry Saini, Yam Levi, Dominik Lorenz, Axel Sauer, Frederic Boesel, Dustin Podell, Tim Dockhorn, Zion English, and Robin Rombach. Scaling rectified flow transformers for high-resolution image synthesis. In Forty-first International Conference on Machine Learning, 2024.

[8] Xiangyu Fan, Zesong Qiu, Zhuguanyu Wu, Fanzhou Wang, Zhiqian Lin, Tianxiang Ren, Dahua Lin, Ruihao Gong, and Lei Yang. Phased dmd: Few-step distribution matching distillation via score matching within subintervals. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 41667–41676, June 2026.

[9] Kevin Frans, Danijar Hafner, Sergey Levine, and Pieter Abbeel. One step diffusion via shortcut models. In The Thirteenth International Conference on Learning Representations, 2025.

[10] Xingtong Ge, Xin Zhang, Tongda Xu, Yi Zhang, Xinjie Zhang, Yan Wang, and Jun Zhang. Senseflow: Scaling distribution matching for flow-based text-to-image distillation. In The Fourteenth International Conference on Learning Representations, 2026.

[11] Zhengyang Geng, Ashwini Pokle, and J Zico Kolter. One-step diffusion distillation via deep equilibrium models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.

[12] Zhengyang Geng, Mingyang Deng, Xingjian Bai, J Zico Kolter, and Kaiming He. Mean flows for one-step generative modeling. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[13] Zhengyang Geng, Yiyang Lu, Zongze Wu, Eli Shechtman, J. Zico Kolter, and Kaiming He. Improved mean flows: On the challenges of fastforward generative models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 30467–30476, June 2026.

[14] Ian J Goodfellow, Jean Pouget-Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sherjil Ozair, Aaron Courville, and Yoshua Bengio. Generative adversarial nets. Advances in Neural Information Processing Systems, 27, 2014.

[15] Sahil Goyal, Swayam Agrawal, Gautham Govind Anil, Prateek Jain, Sujoy Paul, and Aditya Kusupati. Elt: Elastic looped transformers for visual generation. arXiv preprint arXiv:2604.09168, 2026.

[16] Martin Heusel, Hubert Ramsauer, Thomas Unterthiner, Bernhard Nessler, and Sepp Hochreiter. Gans trained by a two time-scale update rule converge to a local nash equilibrium. Advances in Neural Information Processing Systems, 30, 2017.

[17] Jonathan Ho and Tim Salimans. Classifier-free diffusion guidance. In NeurIPS 2021 Workshop on Deep Generative Models and Downstream Applications, 2021.

[18] Emiel Hoogeboom, Jonathan Heek, and Tim Salimans. Simple diffusion: end-to-end diffusion for high resolution images. In Proceedings of the 40th International Conference on Machine Learning, ICML'23. JMLR.org, 2023.

[19] Xun Huang, Zhengqi Li, Guande He, Mingyuan Zhou, and Eli Shechtman. Self forcing: Bridging the train-test gap in autoregressive video diffusion. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[20] Ahmadreza Jeddi, Marco Ciccone, and Babak Taati. Loopformer: Elastic-depth looped transformers for latent reasoning via shortcut modulation. In The Fourteenth International Conference on Learning Representations, 2026.

[21] Tero Karras, Miika Aittala, Timo Aila, and Samuli Laine. Elucidating the design space of diffusion-based generative models. In Alice H. Oh, Alekh Agarwal, Danielle Belgrave, and Kyunghyun Cho (eds.), Advances in Neural Information Processing Systems, 2022.

[22] Tero Karras, Miika Aittala, Tuomas Kynkäänniemi, Jaakko Lehtinen, Timo Aila, and Samuli Laine. Guiding a diffusion model with a bad version of itself. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.

[23] Diederik P. Kingma and Jimmy Ba. Adam: A method for stochastic optimization. In International Conference on Learning Representations (ICLR), 2015.

[24] Jonas Kohler, Albert Pumarola, Edgar Schönfeld, Artsiom Sanakoyeu, Roshan Sumbaly, Peter Vajda, and Ali Thabet. Imagine flash: Accelerating emu diffusion models with backward distillation. arXiv preprint arXiv:2405.05224, 2024.

[25] Alex Krizhevsky. Learning multiple layers of features from tiny images, 2009. URL https://cave.cs.toronto.edu/kriz/learning-features-2009-TR.pdf.

[26] Tuomas Kynkäänniemi, Miika Aittala, Tero Karras, Samuli Laine, Timo Aila, and Jaakko Lehtinen. Applying guidance in a limited interval improves sample and distribution quality in diffusion models. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024.

[27] Shanchuan Lin and Xiao Yang. Animatediff-lightning: Cross-model diffusion distillation. arXiv preprint arXiv:2403.12706, 2024.

[28] Shanchuan Lin, Bingchen Liu, Jiashi Li, and Xiao Yang. Common diffusion noise schedules and sample steps are flawed. In 2024 IEEE/CVF Winter Conference on Applications of Computer Vision (WACV), pp. 5392–5399. IEEE, 2024a.

[29] Shanchuan Lin, Anran Wang, and Xiao Yang. Sdxl-lightning: Progressive adversarial diffusion distillation. arXiv preprint arXiv:2402.13929, 2024b.

[30] Shanchuan Lin, Xin Xia, Yuxi Ren, Ceyuan Yang, Xuefeng Xiao, and Lu Jiang. Diffusion adversarial post-training for one-step video generation. In Forty-second International Conference on Machine Learning, 2025a.

[31] Shanchuan Lin, Ceyuan Yang, Hao He, Jianwen Jiang, Yuxi Ren, Xin Xia, Yang Zhao, Xuefeng Xiao, and Lu Jiang. Autoregressive adversarial post-training for real-time interactive video generation. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025b.

[32] Shanchuan Lin, Ceyuan Yang, Zhijie Lin, Hao Chen, and Haoqi Fan. Adversarial flow models. In Forty-third International Conference on Machine Learning, 2026a.

[33] Shanchuan Lin, Ceyuan Yang, Zhijie Lin, Hao Chen, and Haoqi Fan. Continuous adversarial flow models. In European Conference on Computer Vision, pp. 645–663. Springer, 2026b.

[34] Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, and Matthew Le. Flow matching for generative modeling. In The Eleventh International Conference on Learning Representations, 2023.

[35] Xingchao Liu, Chengyue Gong, and Qiang Liu. Flow straight and fast: Learning to generate and transfer data with rectified flow. In The Eleventh International Conference on Learning Representations, 2023.

[36] Cheng Lu and Yang Song. Simplifying, stabilizing and scaling continuous-time consistency models. In The Thirteenth International Conference on Learning Representations, 2025.

[37] Yanzuo Lu, Yuxi Ren, Xin Xia, Shanchuan Lin, Xing Wang, Xuefeng Xiao, Andy J Ma, Xiaohua Xie, and Jian-Huang Lai. Adversarial distribution matching for diffusion distillation towards efficient image and video synthesis. In 2025 IEEE/CVF International Conference on Computer Vision (ICCV), pp. 16818–16829. IEEE, 2025.

[38] Simian Luo, Yiqin Tan, Longbo Huang, Jian Li, and Hang Zhao. Latent consistency models: Synthesizing high-resolution images with few-step inference. arXiv preprint arXiv:2310.04378, 2023a.

[39] Weijian Luo, Tianyang Hu, Shifeng Zhang, Jiacheng Sun, Zhenguo Li, and Zhihua Zhang. Diff-instruct: A universal approach for transferring knowledge from pre-trained diffusion models. In Thirty-seventh Conference on Neural Information Processing Systems, 2023b.

[40] Nanye Ma, Mark Goldstein, Michael S Albergo, Nicholas M Boffi, Eric Vanden-Eijnden, and Saining Xie. Sit: Exploring flow and diffusion-based generative models with scalable interpolant transformers. In European Conference on Computer Vision, pp. 23–40. Springer, 2024.

[41] Yong-Hyun Park, Chieh-Hsin Lai, Satoshi Hayakawa, Yuhta Takida, and Yuki Mitsufuji. Jump your steps: Optimizing sampling schedule of discrete diffusion models. In International Conference on Learning Representations, volume 2025, pp. 96272–96300, 2025.

[42] William Peebles and Saining Xie. Scalable diffusion models with transformers. In Proceedings of the IEEE/CVF international conference on computer vision, pp. 4195–4205, 2023.

[43] Yansong Peng, Kai Zhu, Yu Liu, Pingyu Wu, Hebei Li, Xiaoyan Sun, and Feng Wu. FACM: Flow-anchored consistency models. In The Fourteenth International Conference on Learning Representations, 2026.

[44] Denis Rakitin, Ivan Shchekotov, Viacheslav Meshchaninov, and Dmitry Vetrov. One-step optimal transport via regularized distribution matching distillation. In Forty-third International Conference on Machine Learning, 2026.

[45] Yuxi Ren, Xin Xia, Yanzuo Lu, Jiacheng Zhang, Jie Wu, Pan Xie, Xing Wang, and Xuefeng Xiao. Hyper-sd: Trajectory segmented consistency model for efficient image synthesis. Advances in Neural Information Processing Systems, 37:117340–117362, 2024.

[46] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pp. 10684–10695, 2022.

[47] Olga Russakovsky, Jia Deng, Hao Su, Jonathan Krause, Sanjeev Satheesh, Sean Ma, Zhiheng Huang, Andrej Karpathy, Aditya Khosla, Michael Bernstein, et al. Imagenet large scale visual recognition challenge. International Journal of Computer Vision, 115(3):211–252, 2015.

[48] Tim Salimans and Jonathan Ho. Progressive distillation for fast sampling of diffusion models. In International Conference on Learning Representations, 2022.

[49] Axel Sauer, Frederic Boesel, Tim Dockhorn, Andreas Blattmann, Patrick Esser, and Robin Rombach. Fast high-resolution image synthesis with latent adversarial diffusion distillation. In SIGGRAPH Asia 2024 Conference Papers, pp. 1–11, 2024a.

[50] Axel Sauer, Dominik Lorenz, Andreas Blattmann, and Robin Rombach. Adversarial diffusion distillation. In European Conference on Computer Vision, pp. 87–103. Springer, 2024b.

[51] Team Seawead, Ceyuan Yang, Zhijie Lin, Yang Zhao, Shanchuan Lin, Zhibei Ma, Haoyuan Guo, Hao Chen, Lu Qi, Sen Wang, et al. Seaweed-7b: Cost-effective training of video generation foundation model. arXiv preprint arXiv:2504.08685, 2025.

[52] Team Seedance, Heyi Chen, Siyan Chen, Xin Chen, Yanfei Chen, Ying Chen, Zhuo Chen, Feng Cheng, Tianheng Cheng, Xinqi Cheng, et al. Seedance 1.5 pro: A native audio-visual joint generation foundation model. arXiv preprint arXiv:2512.13507, 2025.

[53] Team Seedance, De Chen, Liyang Chen, Xin Chen, Ying Chen, Zhuo Chen, Zhuowei Chen, Feng Cheng, Tianheng Cheng, Yufeng Cheng, et al. Seedance 2.0: Advancing video generation for world complexity. arXiv preprint arXiv:2604.14148, 2026.

[54] Yang Song and Prafulla Dhariwal. Improved techniques for training consistency models. In The Twelfth International Conference on Learning Representations, 2024.

[55] Yang Song, Prafulla Dhariwal, Mark Chen, and Ilya Sutskever. Consistency models. In Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pp. 32211–32252. PMLR, 23–29 Jul 2023.

[56] Robin Strudel, Corentin Tallec, Florent Altché, Yilun Du, Yaroslav Ganin, Arthur Mensch, Will Grathwohl, Nikolay Savinov, Sander Dieleman, L. Sifre, and Rémi Leblond. Self-conditioned embedding diffusion for text generation. ArXiv, abs/2211.04236, 2022.

[57] Vinh Tong, Trung-Dung Hoang, Anji Liu, Guy Van den Broeck, and Mathias Niepert. Learning to discretize denoising diffusion odes. In International Conference on Learning Representations, volume 2025, pp. 47244–47282, 2025.

[58] Fu-Yun Wang, Zhaoyang Huang, Alexander Bergman, Dazhong Shen, Peng Gao, Michael Lingelbach, Keqiang Sun, Weikang Bian, Guanglu Song, Yu Liu, et al. Phased consistency models. Advances in Neural Information Processing Systems, 37:83951–84009, 2024a.

[59] Fu-Yun Wang, Zhaoyang Huang, Weikang Bian, Xiaoyu Shi, Keqiang Sun, Guanglu Song, Yu Liu, and Hongsheng Li. Animatelcm: Computation-efficient personalized style video generation without personalized video data. In SIGGRAPH Asia 2024 Technical Communications, SA '24, New York, NY, USA, 2024b. Association for Computing Machinery. ISBN 9798400711404. doi: 10.1145/3681758.3698013.

[60] Zhengyi Wang, Cheng Lu, Yikai Wang, Fan Bao, Chongxuan Li, Hang Su, and Jun Zhu. Prolificdreamer: High-fidelity and diverse text-to-3d generation with variational score distillation. In Thirty-seventh Conference on Neural Information Processing Systems, 2023.

[61] Zidong Wang, Yiyuan Zhang, Xiaoyu Yue, Xiangyu Yue, Yangguang Li, Wanli Ouyang, and Lei Bai. Transition models: Rethinking the generative learning objective. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 29178–29189, June 2026.

[62] Shuchen Xue, Zhaoqiang Liu, Fei Chen, Shifeng Zhang, Tianyang Hu, Enze Xie, and Zhenguo Li. Accelerating diffusion sampling with optimized time steps. In 2024 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 8292–8301. IEEE, 2024.

[63] Hanshu Yan, Xingchao Liu, Jiachun Pan, Jun Hao Liew, Qiang Liu, and Jiashi Feng. Perflow: Piecewise rectified flow as universal plug-and-play accelerator. Advances in Neural Information Processing Systems, 37:78630–78652, 2024.

[64] Tianwei Yin, Michaël Gharbi, Taesung Park, Richard Zhang, Eli Shechtman, Fredo Durand, and William T. Freeman. Improved distribution matching distillation for fast image synthesis. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024a.

[65] Tianwei Yin, Michaël Gharbi, Richard Zhang, Eli Shechtman, Frédo Durand, William T. Freeman, and Taesung Park. One-step diffusion with distribution matching distillation. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 6613–6623, June 2024b.

[66] Liangyu Yuan, Ruoyu Wang, Tong Zhao, Dingwen Fu, Mingkun Lei, Beier Zhu, and Chi Zhang. Few-step diffusion sampling through instance-aware discretizations. In Conference on Computer Vision and Pattern Recognition 2026, 2026.

[67] Huijie Zhang, Aliaksandr Siarohin, Willi Menapace, Michael Vasilkovsky, Sergey Tulyakov, Qing Qu, and Ivan Skorokhodov. Alphaflow: Understanding and improving meanflow models. In The Fourteenth International Conference on Learning Representations, 2026.

[68] Kaiwen Zheng, Yongxin Chen, Huayu Chen, Guande He, Ming-Yu Liu, Jun Zhu, and Qinsheng Zhang. Direct discriminative optimization: Your likelihood-based visual generative model is secretly a GAN discriminator. In Forty-second International Conference on Machine Learning, 2025.

[69] Kaiwen Zheng, Guande He, Min Zhao, Jintao Zhang, Hua-Yu Chen, Jianfei Chen, Chen-Hsuan Lin, Mingying Liu, Jun Zhu, and Qianli Ma. Causal-rcm: A unified teacher-forcing and self-forcing open recipe for autoregressive diffusion distillation in streaming video generation and interactive world models. ArXiv, abs/2606.25473, 2026a.

[70] Kaiwen Zheng, Yuji Wang, Qianli Ma, Huayu Chen, Jintao Zhang, Yogesh Balaji, Jianfei Chen, Ming-Yu Liu, Jun Zhu, and Qinsheng Zhang. Large scale diffusion distillation via score-regularized continuous-time consistency. In The Fourteenth International Conference on Learning Representations, 2026b.

[71] Linqi Zhou, Mathias Parger, Ayaan Haque, and Jiaming Song. Terminal velocity matching. In The Fourteenth International Conference on Learning Representations, 2026.

[72] Mingyuan Zhou, Yi Gu, Huangjie Zheng, Liangchen Song, Guande He, Yizhe Zhang, Wenze Hu, and Yinfei Yang. Score distillation of flow matching models. ArXiv, abs/2509.25127, 2025.

## 附录 A 实现细节

**表 4（原文 Table 4）：** 用于训练数据空间迭代生成器的最终架构与训练设置。

| 配置项 | 取值 |
|---|---|
| **模型架构（DiT-XL/2）** | |
| 参数量 | 674M |
| FLOPs | 119G |
| 深度 | 28 |
| 隐藏维数 | 1152 |
| 注意力头数 | 16 |
| Patch 大小 | \(2\times2\) |
| **数据** | |
| 图像形状 | \(3\times256\times256\) |
| 潜变量形状 | \(4\times32\times32\) |
| **优化** | |
| 训练 epoch 数 | 40 |
| 全局批大小 | 256 |
| 优化器 | Adam |
| 学习率调度 | 常数 |
| 生成器学习率 | \(1\times10^{-4}\) |
| 虚假模型学习率 | \(1\times10^{-4}\) |
| Adam(\(\beta_1\), \(\beta_2\)) | (0.0, 0.95) |
| 权重衰减 | 0.0 |
| 梯度裁剪 | 无 |
| 每次生成器更新对应的虚假模型更新次数 | 4 |
| DMD 时间步分布 | \(\tau\sim\mathrm{Beta}(2.5,1)\) |
| DMD 加权函数 | \(w(\tau)=1\) |
| EMA 衰减 | 0.9999 |
| 数值精度 | TF32 |
| **无分类器引导** | |
| CFG 尺度 | 1.1 |
| CFG 教师时间步范围 | [0.0, 0.6] |
| 虚假模型预热 | 100 次迭代 |

表 4 总结了我们实验中使用的架构与训练超参数。生成器与虚假流模型都使用预训练 SiT 骨干的 XL/2 配置。生成器与虚假模型用相同的常数学习率优化，且我们为每次生成器更新执行四次虚假模型更新。我们不使用权重衰减或梯度裁剪。对 DMD 目标，教师时间步按 \(\tau\sim\mathrm{Beta}(2.5,1)\) 采样，并使用常数加权函数 \(w(\tau)=1\)。我们维护生成器参数的指数滑动平均（衰减 0.9999），并用平均后的参数进行评估。所有训练都在 TF32 精度下进行。

为 \(\hat{\mathbf{x}}_0^{(r)}\) 新增的投影按原始 SiT 初始化方式初始化，且不使用偏置。新增的 \(r\) 嵌入在生成器与虚假速度网络中均从 \(\mathcal{N}(0,0.02)\) 初始化。虚假速度网络接收精化索引 \(r\)，并在所有迭代方法比较中保持相同。训练期间，我们简单地把精化索引采样为 \(r=i\bmod R\)，其中 \(i\) 是当前训练迭代。

原始 SiT-XL/2 模型有 675,129,632 个参数。新增的 \(\hat{\mathbf{x}}_0^{(r)}\) 输入投影与 \(r\) 嵌入增加 24,192 个参数。然而，我们可以移除时间步投影 MLP 并用常数 \(t=1\) 嵌入替代，这使参数减少 1,626,624 个。因此，我们的最终模型有 673,527,200 个参数，甚至少于原始模型。

对无分类器引导的结果，我们使用 1.1 的引导尺度，并仅在教师时间步区间 \([0.0,0.6]\) 上施加引导。使用 CFG 训练时，我们对虚假模型做 100 次迭代的预热，这可在启用 CFG 时防止训练发散。

## 附录 B 可复现性

所有模型的结果可在配 8 块 GPU（每块 80 GB HBM3 显存）并具有高带宽 GPU 互连的 GPU 服务器上于一天内复现。由于数据空间迭代与流映射的最终 FID 接近，我们运行三次训练并使用独立的评估种子。表中报告平均 FID。两种方法的标准差均低于 0.05。

## 附录 C 完整指标

表 5 报告我们在有、无分类器引导下的完整评估结果。遵循 ADM（Dhariwal & Nichol, 2021），我们使用其提供的评估代码，并在 FID 之外报告空间 FID（sFID）、Inception Score（IS）、精确率（Precision）与召回率（Recall）。我们把这些附加指标作为参考列入，同时按先前工作（Geng et al., 2025; 2026; Frans et al., 2025; Song et al., 2023; Song & Dhariwal, 2024; Lu & Song, 2025）以 FID 作为主要评估指标。FID 与所有其他指标都在 50,000 个类别平衡生成样本上评估。

**表 5（原文 Table 5）：** 完整指标。（a）无引导；（b）有引导。原文以粗体标出部分单元格，本页按渲染所见保留。

（a）无引导

| 方法 | NFE | FID↓ | sFID↓ | IS↑ | Prec.↑ | Rec.↑ |
|---|---|---|---|---|---|---|
| Flow Matching (SiT)（Ma et al., 2024） | 250 | 8.26 | 6.32 | 131.65 | 0.68 | 0.67 |
| DMD（Yin et al., 2024b;a） | 1 | 4.45 | 5.98 | 192.52 | 0.76 | 0.58 |
| DMD | 2 | 3.22 | 4.67 | 209.88 | 0.79 | 0.57 |
| DMD | 3 | 2.67 | 4.40 | 223.88 | 0.82 | 0.56 |
| DMD | 4 | 2.75 | 4.62 | 224.94 | **0.84** | 0.55 |
| Phased DMD（Fan et al., 2026） | 4 | 2.55 | 5.05 | **245.76** | 0.83 | 0.56 |
| Data-space DMD（Ours） | 1 | 3.85 | 5.32 | 196.55 | 0.78 | 0.59 |
| Data-space DMD | 2 | 2.68 | 4.59 | 221.69 | 0.81 | 0.58 |
| Data-space DMD | 3 | 2.47 | 4.49 | 228.00 | 0.81 | 0.58 |
| Data-space DMD | 4 | **2.46** | **4.48** | 228.59 | 0.81 | **0.59** |

（b）有引导

| 方法 | NFE | FID↓ | sFID↓ | IS↑ | Prec.↑ | Rec.↑ |
|---|---|---|---|---|---|---|
| Flow Matching (SiT)（Ma et al., 2024） | 250×2 | 2.06 | 4.49 | 277.50 | 0.83 | 0.59 |
| DMD（Yin et al., 2024b;a） | 1 | 4.02 | 6.11 | 209.10 | 0.78 | 0.56 |
| DMD | 2 | 2.89 | 4.72 | 225.05 | 0.81 | 0.56 |
| DMD | 3 | 2.51 | 4.40 | 241.14 | 0.84 | 0.55 |
| DMD | 4 | 2.61 | 4.54 | 243.98 | **0.85** | 0.54 |
| Phased DMD（Fan et al., 2026） | 4 | 2.86 | 5.18 | **271.99** | **0.85** | 0.53 |
| Data-space DMD（Ours） | 1 | 3.31 | 5.19 | 213.21 | 0.79 | 0.58 |
| Data-space DMD | 2 | 2.47 | 4.44 | 238.99 | 0.81 | 0.57 |
| Data-space DMD | 3 | 2.33 | 4.42 | 243.31 | 0.82 | 0.58 |
| Data-space DMD | 4 | **2.29** | **4.42** | 242.71 | 0.82 | **0.58** |

## 附录 D 更多可视化

图 3 可视化了连续精化步之间的差异。

**图 3（原文 Figure 3）：** 迭代生成轨迹及其逐步差分的可视化。对每个样本，第一行显示生成的图像，第二行显示相邻步之间的带符号差分，并与较后一步对齐。零差分用所有图像共用的固定归一化映射为中灰。（图中排版：左侧 4 列为数据空间迭代（Ours）的 1NFE–4NFE，右侧 4 列为流—重加噪的 1NFE–4NFE。）

表 6 量化连续展开步之间的变化。具体而言，对每个步 \(r\)，我们计算 50k 类别平衡生成样本上的平均 L2 差异 \(\mathbb{E}\|\mathbf{x}_0^{(r)}-\mathbf{x}_0^{(r+1)}\|_2\)。差异在 VAE 解码后的 RGB 像素空间中度量，像素值归一化到 \([0,1]\)。

**表 6（原文 Table 6）：** 在 50k 样本上度量的展开步间平均 L2 差异。

| 方法 | \(r=1\) | \(r=2\) | \(r=3\) |
|---|---|---|---|
| Flow-renoise（流—重加噪） | 82.72 | 51.18 | 29.91 |
| Data-space（数据空间） | 59.65 | 44.25 | 35.98 |

## 附录 E 代码

算法 1 给出核心 PyTorch 实现。两个展开函数体现了数据空间迭代与流—重加噪迭代之间的唯一差异；`dmd_step` 实现二者共享的 DMD 目标。采样的索引 \(r\in\{0,\ldots,R-1\}\) 标识正在被优化的精化步：步 \(0,\ldots,r-1\) 在不跟踪梯度的情况下评估，随后是产生 \(\hat{\mathbf{x}}_0^{(r+1)}\) 的、跟踪梯度的步 \(r\)。这里 `data` 包含一个潜变量批次及其类别标签，而 `gen_step` 选择交替的生成器或虚假模型更新。为清晰起见，分布式训练、优化器步与 EMA 更新被省略。

**算法 1（原文 Algorithm 1）：** 带数据空间与流—重加噪展开的核心 DMD 训练步。

```python
def rollout_data_space(gen, z, c, r, track_grad):
    x_hat = torch.zeros_like(z)
    for i in range(r + 1):
        with torch.set_grad_enabled(track_grad and i == r):
            x_hat = z - gen(x_hat, z, c, i)
    return x_hat

def rollout_flow_renoise(gen, z, c, r, track_grad, R=4):
    x_hat = torch.zeros_like(z)
    for i, t_r in enumerate(torch.arange(R, 0, -1, device=z.device)[:r + 1] / R):
        t_r = t_r.expand(z.shape[0])
        t_r4 = t_r[:, None, None, None]
        eps = z if i == 0 else torch.randn_like(z)
        x_tr = (1.0 - t_r4) * x_hat + t_r4 * eps
        with torch.set_grad_enabled(track_grad and i == r):
            x_hat = x_tr - t_r4 * gen(x_tr, t_r, c)
    return x_hat

def dmd_step(gen, v_real, v_fake, data, r, rollout_fn, gen_step=True, use_cfg=False):
    x, c = data
    B = x.shape[0]
    z, eps = torch.randn_like(x), torch.randn_like(x)
    tau = torch.distributions.Beta(2.5, 1.0).sample((B,)).to(x.device)
    tau4 = tau[:, None, None, None]
    x_hat = rollout_fn(gen, z, c, r, track_grad=gen_step)
    x_tau = (1.0 - tau4) * x_hat + tau4 * eps
    if not gen_step:
        return F.mse_loss(v_fake(x_tau, tau, c, r), eps - x_hat)
    with torch.no_grad():
        v_pos = v_real(x_tau, tau, c)
        if use_cfg:
            c_null = torch.full_like(c, 1000)
            v_null = v_real(x_tau, tau, c_null)
            v_cfg = v_null + 1.1 * (v_pos - v_null)
            v_pos = torch.where(tau4 <= 0.6, v_cfg, v_pos)
        direction = v_pos - v_fake(x_tau, tau, c, r)
    return (x_hat * direction).mean()
```

算法 2 给出对应的 Phased DMD 基线。在展开到第 \(r\) 个相位的端点 \(t_{r+1}\) 之后，它从该相位的合法区间采样 DMD 加噪时间 \(\tau\)，并在施加 DMD 目标之前对中间流状态重新加噪。

**算法 2（原文 Algorithm 2）：** 带流映射展开的核心 Phased DMD 训练步。

```python
def rollout_flow_map(gen, z, c, r, track_grad, R=4):
    x_tr = z
    dt = 1.0 / R
    for i in range(r + 1):
        t_r = torch.full((z.shape[0],), 1.0 - i * dt, device=z.device)
        with torch.set_grad_enabled(track_grad and i == r):
            x_tr = x_tr - dt * gen(x_tr, t_r, c)
    return x_tr

def phased_dmd_step(gen, v_real, v_fake, data, r, gen_step=True, use_cfg=False, R=4):
    x, c = data
    B = x.shape[0]
    z, eps = torch.randn_like(x), torch.randn_like(x)
    x_next = rollout_flow_map(gen, z, c, r, track_grad=gen_step, R=R)
    t_next = torch.full((B,), 1.0 - (r + 1) / R, device=x.device)
    u = 0.02 + 0.98 * torch.rand(B, device=x.device)  # Uniform(0.02, 1)
    tau = t_next + (1.0 - t_next) * u
    t_next4, tau4 = t_next[:, None, None, None], tau[:, None, None, None]
    a = (1.0 - tau4) / (1.0 - t_next4)
    b = (tau4 ** 2 - (t_next4 * a) ** 2) ** 0.5
    x_tau = a * x_next + b * eps
    if not gen_step:
        target = (
            ((1.0 - t_next4) ** 2 * tau4 + (1.0 - tau4) * t_next4 ** 2)
            / ((1.0 - t_next4) ** 2 * b) * eps
            - x_next / (1.0 - t_next4)
        )
        return F.mse_loss(v_fake(x_tau, tau, c, r), target)
    with torch.no_grad():
        v_pos = v_real(x_tau, tau, c)
        if use_cfg:
            c_null = torch.full_like(c, 1000)
            v_null = v_real(x_tau, tau, c_null)
            v_cfg = v_null + 1.1 * (v_pos - v_null)
            v_pos = torch.where(tau4 <= 0.6, v_cfg, v_pos)
        direction = v_pos - v_fake(x_tau, tau, c, r)
    return (x_next * direction).mean()
```

## 附录 F DMD 加权函数及其联系

**\(w(\tau)=(1-\tau)^2/\tau\)。** 原始 DMD 生成器更新可以写为停止梯度替代目标

$$
\mathcal{L}_{\mathrm{score}}=-\mathbb{E}\left[\mathrm{sg}\left[s_{\mathrm{real}}(\mathbf{x}_\tau,\tau)-s_{\mathrm{fake}}(\mathbf{x}_\tau,\tau)\right]^{\top}\mathbf{x}_\tau\right],\tag{16}
$$

其中 \(s_{\mathrm{real}}\) 与 \(s_{\mathrm{fake}}\) 分别表示真实与虚假得分。对线性路径 \(\mathbf{x}_\tau=(1-\tau)\mathbf{x}_0+\tau\mathbf{x}_1\)，其中 \(\mathbf{x}_1\) 服从标准高斯噪声，速度预测器与其对应得分满足

$$
s(\mathbf{x}_\tau,\tau)=-\frac{\mathbb{E}[\mathbf{x}_1\mid\mathbf{x}_\tau]}{\tau}=-\frac{\mathbf{x}_\tau}{\tau}-\frac{1-\tau}{\tau}v(\mathbf{x}_\tau,\tau),\tag{17}
$$

因为 \(\mathbb{E}[\mathbf{x}_1\mid\mathbf{x}_\tau]=\mathbf{x}_\tau+(1-\tau)v(\mathbf{x}_\tau,\tau)\)。项 \(-\mathbf{x}_\tau/\tau\) 在真实与虚假模型之间相消，因此

$$
-\left(s_{\mathrm{real}}(\mathbf{x}_\tau,\tau)-s_{\mathrm{fake}}(\mathbf{x}_\tau,\tau)\right)^{\top}\mathbf{x}_\tau=\frac{1-\tau}{\tau}\left(v_{\mathrm{real}}(\mathbf{x}_\tau,\tau)-v_{\mathrm{fake}}(\mathbf{x}_\tau,\tau)\right)^{\top}\mathbf{x}_\tau.\tag{18}
$$

因此，把得分差转换为速度差会贡献一个因子 \((1-\tau)/\tau\)。当该更新通过重加噪操作作用于干净生成器预测 \(\hat{\mathbf{x}}_0\) 时，还有一个额外的因子 \(1-\tau\)，因为

$$
\mathbf{x}_\tau=(1-\tau)\hat{\mathbf{x}}_0+\tau\boldsymbol{\varepsilon},\qquad\frac{\partial\mathbf{x}_\tau}{\partial\hat{\mathbf{x}}_0}=1-\tau.\tag{19}
$$

更精确地，

$$
\nabla_\theta\mathcal{L}_{\mathrm{score}}=-\mathbb{E}\left[(1-\tau)\,\mathrm{sg}\left[s_{\mathrm{real}}(\mathbf{x}_\tau,\tau)-s_{\mathrm{fake}}(\mathbf{x}_\tau,\tau)\right]^{\top}\frac{\partial\hat{\mathbf{x}}_0}{\partial\theta}\right]\tag{20}
$$

$$
=\mathbb{E}\left[\frac{(1-\tau)^2}{\tau}\,\mathrm{sg}\left[v_{\mathrm{real}}(\mathbf{x}_\tau,\tau)-v_{\mathrm{fake}}(\mathbf{x}_\tau,\tau)\right]^{\top}\frac{\partial\hat{\mathbf{x}}_0}{\partial\theta}\right].\tag{21}
$$

因此，通过 \(\mathbf{x}_\tau\) 反向传播的无加权、基于得分的 DMD 更新，等价于在我们基于速度的 \(\hat{\mathbf{x}}_0\) 目标中使用 \(w(\tau)=(1-\tau)^2/\tau\)。

**\(w(\tau)=(1-\tau)/\tau\)。** 或者，考虑把原始得分差直接作用于 \(\hat{\mathbf{x}}_0\)，用停止梯度替代目标

$$
\mathcal{L}_{\mathrm{score},\mathbf{x}_0}=-\mathbb{E}\left[\mathrm{sg}\left[s_{\mathrm{real}}(\mathbf{x}_\tau,\tau)-s_{\mathrm{fake}}(\mathbf{x}_\tau,\tau)\right]^{\top}\hat{\mathbf{x}}_0\right].\tag{22}
$$

此时没有来自重加噪的额外 Jacobian 因子。使用上面的得分—速度关系给出

$$
\nabla_\theta\mathcal{L}_{\mathrm{score},\mathbf{x}_0}=\mathbb{E}\left[\frac{1-\tau}{\tau}\,\mathrm{sg}\left[v_{\mathrm{real}}(\mathbf{x}_\tau,\tau)-v_{\mathrm{fake}}(\mathbf{x}_\tau,\tau)\right]^{\top}\frac{\partial\hat{\mathbf{x}}_0}{\partial\theta}\right].\tag{23}
$$

因此，\(w(\tau)=(1-\tau)/\tau\) 等价于直接作用于 \(\hat{\mathbf{x}}_0\) 的原始得分差表述。两种加权在 \(\tau\to0\) 时都发散。遵循原始 DMD 设置（Yin et al., 2024b），我们因此在这些消融中把采样时间步限制为 \(\tau\ge\tau_{\min}=0.02\)；尽管如此，两次运行在我们的实验中仍然发散。

**\(w(\tau)=1-\tau\)。** 该加权等价于把速度差直接作用于 \(\hat{\mathbf{x}}_\tau\)，因为通过 \(\hat{\mathbf{x}}_\tau=(1-\tau)\hat{\mathbf{x}}_0+\tau\boldsymbol{\varepsilon}\) 反向传播会贡献因子 \(1-\tau\)。

**\(w(\tau)=1\)。** 该加权等价于把速度差直接作用于 \(\hat{\mathbf{x}}_0\)。

**\(w(\tau)=\tau\) 与 \(w(\tau)=\tau^2\)。** 这些加权没有直接的理论联系。我们用它们来逐步更强调高噪声时间步，这在经验上改善了 FID。

**\(w(\tau)=(1-\tau)\tau\)。** 原始 DMD 更新（Yin et al., 2024b）在 \(\alpha_\tau(s_{\mathrm{fake}}-s_{\mathrm{real}})\) 上使用自适应权重

$$
\tilde{w}_\tau=\frac{\sigma_\tau^2}{\alpha_\tau}\frac{CS}{\left\|\mu_{\mathrm{base}}(\mathbf{x}_\tau,\tau)-\hat{\mathbf{x}}_0\right\|_1}\tag{24}
$$

由于

$$
s_{\mathrm{fake}}-s_{\mathrm{real}}=\frac{\alpha_\tau}{\sigma_\tau^2}\left(\mu_{\mathrm{fake}}-\mu_{\mathrm{real}}\right),\tag{25}
$$

噪声时间表因子在去噪预测差上约化为 \(\alpha_\tau\)。对线性路径，\(\alpha_\tau=1-\tau\)、\(\sigma_\tau=\tau\)、\(\mu=\mathbf{x}_\tau-\tau v\)，所以

$$
\mu_{\mathrm{fake}}-\mu_{\mathrm{real}}=\tau\left(v_{\mathrm{real}}-v_{\mathrm{fake}}\right).\tag{26}
$$

因此，在省略自适应归一化之后，有效速度加权为 \(\alpha_\tau\tau=(1-\tau)\cdot\tau\)。

**\(w(\tau)=(1-\tau)\tau\frac{CS}{\|\hat{\mathbf{x}}-\mathbf{x}\|_1}\)。** 这保留了原始 DMD 更新的自适应梯度归一化，其中 \(C\) 是通道数，\(S\) 是空间位置数。

**Beta 分布。** 表 7 给出三个概率密度函数。由于 \(\mathrm{Beta}(a,1)\) 的密度为 \(p(\tau)=a\tau^{a-1}\)，\(\mathrm{Beta}(2.00,1)\) 等价于 \(w(\tau)=\tau\)，\(\mathrm{Beta}(3.00,1)\) 等价于 \(w(\tau)=\tau^2\)，各自最多相差一个常数缩放因子；\(\mathrm{Beta}(2.50,1)\) 在二者之间插值。

**表 7（原文 Table 7）：** 三种 Beta 分布的概率密度函数。（图中三个子图分别为 \(\mathrm{Beta}(2.00,1)\)、\(\mathrm{Beta}(2.50,1)\) 与 \(\mathrm{Beta}(3.00,1)\) 的密度曲线；横轴为 \(\tau\in[0,1]\)，纵轴为密度；\(\mathrm{Beta}(2.00,1)\) 为线性递增，另两者依次更向上凸。）

## 附录 G CIFAR-10 实验

遵循先前工作的惯例（Geng et al., 2025），我们另外在无条件 CIFAR-10 生成（Krizhevsky, 2009）（\(32\times32\)）上使用 EDM（Karras et al., 2022）提供的 SongUNet 架构（55M）进行实验。为简单起见，我们不做额外的超参数消融，也不使用数据增强等辅助技术。我们首先用标准流匹配目标与线性时间表训练教师。所得流匹配教师在 250 NFE 下取得 FID-50k 3.54。然后我们使用与正文相同的实验设置训练 DMD、phased DMD 与我们提出的数据空间 DMD。所得 FID 报告在表 8 中。

**表 8（原文 Table 8）：** CIFAR-10 结果。原文以粗体标出各列最优值。

| 方法 | 1NFE | 2NFE | 3NFE | 4NFE |
|---|---|---|---|---|
| DMD | **11.21** | 11.14 | 9.93 | 10.03 |
| Phased DMD | — | — | — | 11.72 |
| Data-space DMD | 12.20 | **8.28** | **8.32** | **8.62** |

对一步生成，数据空间迭代与流—重加噪退化为本质相同的表述；因此我们并不期望两种方法中任一具有固有优势。在 1NFE 下，数据空间迭代在 ImageNet 上优于流—重加噪（如正文所报告），但在 CIFAR-10 上略差。我们把这一差异归因于优化动力学的不同。因此我们的分析主要关注 NFE>1 时的性能，并把观察到的差异归因于不同的迭代策略。

---

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、第 1–5 节正文与全部小节（§2.1–2.6、§3.1–3.5）、AI 使用声明、致谢、式 (1)–(26)（保留原文编号）、表 1–8（逐格转写，含原文粗体标记）、图 1–3 图注、算法 1–2 逐行代码、附录 A–G、参考文献 [1]–[72]（英文原条目，按原文作者—年份字母序编号）；原文无关键词、无编号定理/引理环境；许可：CC BY 4.0。**已知缺陷与核对说明：** ① pypdf 抽取把表格列边界与公式上下标打散（如 Table 3 表头、式 (10)/(24) 等），本页表 1–8 与式 (1)–(26) 已按 PDF 渲染页（第 4–8、15–21 页，表格另做高倍裁剪）逐格/逐式核对；② 表 1 的粗体为原文标出的最终采用设置所在行（a 中 \(w(\tau)=\tau\) 行与 \(\tau\sim\mathrm{Beta}(2.50,1)\) 行；b–d 中更优的一行），按渲染页逐格转写；③ 表 2 的原文粗体标记（各方法块内较优值/选定配置）与浅灰底纹未逐格复现，数值逐格照录并在表注说明；④ 表 3 原文 CFG 列为跨行合并单元格，本页按行显式展开为 No/Yes；⑤ 表 5 按渲染页保留原文粗体：无引导时 DMD 4NFE 的 Prec 0.84、Phased DMD 的 IS 245.76、本方法 4NFE 的 FID 2.46/sFID 4.48/Rec 0.59；有引导时 DMD 4NFE 的 Prec 0.85、Phased DMD 的 IS 271.99 与 Prec 0.85、本方法 4NFE 的 FID 2.29/sFID 4.42/Rec 0.58；其余单元格未加粗（原文即如此）；⑥ 表 8 粗体为 1NFE 的 11.21、2NFE 的 8.28、3NFE 的 8.32、4NFE 的 8.62，按渲染页核对；⑦ 图 1–3 仅译图注并转写图中可见标号与轴/色标说明，未内嵌图像；算法 1–2 保留原文 Python 代码（含变量名与注释）未改写，pypdf 抽取中 `with torch.…` 与 `i == r` 的连写已按 Python 语法还原，代码本身未逐行执行验证；⑧ 参考文献 [1]–[72] 原文为作者—年份制且未编号，本页按原文同一字母顺序编号；pypdf 抽取的变音符（如 Kynkäänniemi、Schönfeld、Müller、Rémi、Michaël 等）已按常规拼写还原。逐句逐式终校未做；建议后续 QA 重点复核：式 (10) 的转置位置与停止梯度范围、式 (24)–(26) 的 DMD 自适应权重推导、表 2b 中 CFG 时间范围合并单元格的归属、表 5 中 sFID/Rec 的粗体是否为列最优、以及算法 1 中 `eps = z if i == 0 else torch.randn_like(z)` 的原文写法。

**登记（2026-11-03）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
