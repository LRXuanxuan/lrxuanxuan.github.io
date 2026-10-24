---
layout: page
title: "BCT：流语言模型的贝叶斯一致温度调节｜中文译稿（待终校）"
permalink: /papers/translations/2026-10-24-bct-bayes-consistent-tempering-2610-27641/
math: true
toc: true
---

[← 返回论文库](/papers/) · [arXiv](https://arxiv.org/abs/2610.27641) · [原文 PDF](https://arxiv.org/pdf/2610.27641v1)

# BCT：流语言模型的贝叶斯一致温度调节

**原题：** BCT: Bayes-Consistent Tempering for Flow Language Models  
**作者：** Daisuke Oba、Hiroki Furuta、Naoaki Okazaki  
**单位：** 东京科学大学、AIST、NII LLMC  
**版本：** arXiv:2610.27641v1，2026-10-20，19 页。  
**覆盖状态：** 摘要、正文 1–6、附录 A–G、公式（1）–（26）、表 2–7、图 1–7 的文字说明及原文参考书目已收录；正文表 1 已完整恢复，仍待逐句逐式核验。本站不转载原图和 PDF。

## 摘要

温度缩放通常作为模型概率的一种事后变换。在由后验诱导的流语言模型中，这会造成两种失配。首先，后验温度调节会隐式改变终点分布以及中间噪声状态的分布，但去噪器仍然是在原始状态上训练的。其次，调节后的后验权重与为未经温度调节的流所推导的输运动力学相结合。这些失配会反映在实验结果中：降低温度对流语言模型在 GSM8K 上的改善，远不如对离散扩散语言模型那样稳定。

本文提出贝叶斯一致温度调节（Bayes-Consistent Tempering，BCT），使温度同时显式进入生成流的分布和动力学。其基于学习的实现方式在经过温度调节的中间状态上训练去噪器，并使用与之相匹配的温度化动力学来调节终点分布。针对常规训练得到的检查点，本文还推导了无需重新训练的变体。在采用两种去噪器架构的超球面流语言模型，以及采用 von Mises–Fisher 分布的流语言模型上，BCT 都能在较宽温度范围内改善 GSM8K 生成性能，并取得最好的温度调节效果。提升还延伸到数独任务，说明该方法有利于受严格约束的生成。在极低温度下，基于学习的实现也明显比免训练变体更加稳健，支持将温度视为训练和推理全过程中生成流的一个属性，而非事后施加的概率调整。

代码与模型权重：https://daioba.github.io/bct

**图 1：** BCT 的概念示意。后验温度调节会隐式改变终点分布和条件桥，而标准采样仍保留原条件速度及去噪器训练状态。BCT 恢复条件桥与采样动力学的一致性；其学习式版本进一步使训练分布与温度化条件桥一致。

## 1. 引言

温度缩放是语言生成中最简单的控制方式之一（Ackley 等，1985；Holtzman 等，2020）。在自回归模型中，将下一 token 的 logits 除以小于 1 的温度 $T$，会直接使采样分布更加尖锐。但在许多用于离散数据的流语言模型中，生成过程由去噪后验驱动：模型根据一个带噪中间状态预测干净的终点 token，再由这个后验诱导出将状态输运到 token 嵌入的速度（Stark 等，2024；Lee 等，2026；Deschenaux 与 Gulcehre，2026）。

只对后验进行温度缩放会产生两种不一致。首先，根据贝叶斯公式，后验温度调节不仅会隐式改变终点分布，还会改变条件桥——给定每个终点时，各时间点中间噪声状态的分布。然而去噪器只在未经温度调节的桥所生成的状态上训练，因此推理时遇到的状态分布发生了变化，训练却没有对应改变。其次，调节后验会改变各终点的权重，却没有修改它们各自的条件速度，尽管这些速度是针对原来的非温度化条件桥设计的。也就是说，温度改变了所隐含的生成分布，却没有一致地改变模型的训练和采样方式。

实验也能观察到这一问题。在 GSM8K 上，既有研究表明，降低温度对流语言模型的帮助很小；反之，MDLM（Sahoo 等，2024）和 Duo（Sahoo 等，2025）等离散扩散模型在低温解码时精度可显著提高（Deschenaux 与 Gulcehre，2026）。这一差异促使作者重新审视：在由后验诱导的流中，温度是否得到了正确处理？

本文提出贝叶斯一致温度调节 BCT，将温度视为生成流的一部分，而非去噪后验的事后变换（第 3 节）。其学习式实现首先在温度化条件桥采样的状态上训练去噪器；在推理时，再施加为调节终点分布且保持温度化桥不变所必需的贝叶斯校正，并使用由同一条件桥诱导的动力学。训练部分称为温度化流训练（Tempered-Flow Training，TFT），对应采样器称为 BCT-L。

作者还探讨在不重新训练的情况下，能够在多大程度上恢复推理时的一致性，为现有检查点设计了两个变体：BCT-P 同时调节终点分布和条件桥，并配套使用相匹配的动力学；BCT-E 只调节终点分布，保留原来的条件桥与动力学（第 3.2 节）。

对由后验诱导的流语言模型，BCT 不只是概念框架。实际应用时必须推导温度化条件桥及对应采样动力学，而且在具体模型中，这些量是可以计算的。例如 S-FLM（Deschenaux 与 Gulcehre，2026）的超球面几何结构使得二者均可显式推导。同样原理也可应用到使用 von Mises–Fisher 条件桥的 SFCD（Chemseddine 等，2026），虽然对应的解析温度调节规则和动力学有所不同。因此，BCT 并不局限于某种去噪器网络架构，而是取决于定义生成流的条件桥。

作者对两种去噪器架构（S-arch/DiT）的超球面流语言模型和一种 von Mises–Fisher 流语言模型进行了实验。BCT 在较宽温度范围内提高 GSM8K 表现（第 4 节），其中 BCT-L 在极低温度下特别稳健，优于无需重新训练的变体，体现了温度感知训练的优势。数独任务中的增益还表明该方法可能适用于受约束生成。

## 2. 预备知识

### 2.1 后验诱导流

考虑单个 token 位置，词表 $\mathcal V$ 有限，终点分布为 $\pi(x)$。令 $\mathbf z$ 表示连续潜状态，$t\in[0,1]$ 表示从噪声到数据的生成时间。对于每个终点 token $x$，条件桥 $q_t(\mathbf z\mid x)$ 描述给定终点时中间状态在时间 $t$ 的分布；它从与 token 无关的源分布 $p_0$ 开始，逐渐收敛到 token 嵌入 $\mathbf e_x$。条件桥密度均相对于潜空间上的固定参考测度 $\mu$ 定义。

相应的条件速度 $\mathbf u_t(\mathbf z\mid x)$ 负责输运状态，使其分布随时间遵循 $q_t(\cdot\mid x)$；形式上，条件桥与条件速度满足连续性方程。根据贝叶斯公式，去噪后验为

$$
r_t(x\mid\mathbf z)=
\frac{\pi(x)q_t(\mathbf z\mid x)}
{\sum_{y\in\mathcal V}\pi(y)q_t(\mathbf z\mid y)}. \tag{1}
$$

生成速度则是依据后验权重，对各个条件速度求加权平均：

$$
\mathbf u_t(\mathbf z)=
\sum_{x\in\mathcal V}r_t(x\mid\mathbf z)\mathbf u_t(\mathbf z\mid x). \tag{2}
$$

训练去噪器 $r_t^\eta(x\mid\mathbf z)$ 以近似 $r_t$，生成阶段在式（2）中以它替代真实后验。本文将这样构造的流称为**后验诱导流**。

### 2.2 标准温度调节

记 $\beta=1/T$。标准温度缩放将去噪后验替换为

$$
r_t^T(x\mid\mathbf z)\propto r_t(x\mid\mathbf z)^\beta,
\qquad
\mathbf u_t^T(\mathbf z)=
\sum_x r_t^T(x\mid\mathbf z)\mathbf u_t(\mathbf z\mid x). \tag{3}
$$

这改变了后验权重，却没有改变条件速度。实践中一般通过将去噪器 logits 除以温度 $T$ 实现。

根据式（1）：

$$
r_t(x\mid\mathbf z)^\beta\propto
\pi(x)^\beta q_t(\mathbf z\mid x)^\beta. \tag{4}
$$

因此，后验温度调节在代数上同时作用于终点因子和条件桥的似然。定义

$$
\begin{aligned}
\pi_T(x)&\propto\pi(x)^\beta,\\
q_{t,T}(\mathbf z\mid x)
&=\frac{q_t(\mathbf z\mid x)^\beta}{Z_{t,T}(x)},\\
Z_{t,T}(x)&=\int q_t(\mathbf z\mid x)^\beta\,d\mu(\mathbf z).
\end{aligned} \tag{5}
$$

由 $(\pi_T,q_{t,T})$ 诱导的后验与标准温度调节之间只差依赖 token 的归一化因子 $Z_{t,T}(x)$。因此，当 $Z_{t,T}(x)$ 与 $x$ 无关时，两者完全一致；本文研究的对称条件桥族就满足这一性质。

为清晰起见，正文均以单个 token 位置推导。对于序列，同样的分解可逐位置应用，只需将 $\pi(x)$ 改为由其他位置形成的上下文条件化终点分布，详见附录 A。

## 3. 贝叶斯一致温度调节

指定终点分布和条件桥后，后验权重与采样动力学应当对应同一个生成模型。特别是，对于温度化的 $(\pi_T,q_{t,T})$，采样器应使用其去噪后验、能够输运 $q_{t,T}$ 的条件速度 $\mathbf u_{t,T}(\mathbf z\mid x)$，以及该桥对应的初始源分布 $q_{0,T}$。

标准温度调节通常不满足这种一致性：即便它的后验在第 2 节的条件下对应温度化分布对，使用的却仍是原桥的条件速度 $\mathbf u_t(\mathbf z\mid x)$。与之不同，BCT 将终点分布、条件桥和采样动力学看作同一生成流的组成部分。作者首先构建学习式实现，使训练时看到的状态也与温度化桥一致；随后为常规训练模型推导事后校正变体。

### 3.1 学习式 BCT

BCT 的学习式实现 BCT-L 使训练和推理所采用的温度化桥一致。首先，去噪器不再从原桥 $q_t$ 采样训练中间状态，而是从 $q_{t,T}$ 采样。给定训练温度分布 $p(T)$，温度化流训练 TFT 通过通常的去噪损失优化：

$$
\mathcal L(\eta)=
\mathbb E_{T\sim p(T),\,t,\,x\sim\pi,\,\mathbf z\sim q_{t,T}(\cdot\mid x)}
[-\log r_{t,T}^\eta(x\mid\mathbf z)]. \tag{6}
$$

这里去噪器以 $T$ 为条件。由于终点 token 仍从原分布 $\pi$ 采样，中间状态则从温度化桥采样，贝叶斯意义下的最优去噪器是

$$
r_{t,T}(x\mid\mathbf z)=
\frac{\pi(x)q_{t,T}(\mathbf z\mid x)}
{\sum_y\pi(y)q_{t,T}(\mathbf z\mid y)}. \tag{7}
$$

因此，TFT 把温度化桥纳入学习后验，但单独使用 TFT 并不会改变终点分布。

推理时，BCT 以 $(\pi_T,q_{t,T})$ 为目标。其温度化后验可以直接由 TFT 后验表示：

$$
r_{t,T}^{\mathrm{BCT-L}}(x\mid\mathbf z)
\propto r_{t,T}(x\mid\mathbf z)^\beta\,
q_{t,T}(\mathbf z\mid x)^{1-\beta}. \tag{8}
$$

第二个因子是贝叶斯校正项，其作用是在保留去噪器已包含的温度化条件桥的同时，调节终点分布。由于实际学习的后验只是近似，作者允许依据留出数据选择校正强度：

$$
\ell_x^{\mathrm{BCT-L}}
=\beta\ell_x^\eta+\lambda(1-\beta)\log q_{t,T}(\mathbf z\mid x),
\qquad 0\le\lambda\le1. \tag{9}
$$

每个训练模型选择一个 $\lambda$，并在全部温度下共享这一值。

最后，BCT-L 使用输运温度化条件桥 $q_{t,T}$ 的条件速度：

$$
\mathbf u_{t,T}^{\mathrm{BCT-L}}(\mathbf z)=
\sum_x r_{t,T}^{\mathrm{BCT-L}}(x\mid\mathbf z)
\mathbf u_{t,T}(\mathbf z\mid x). \tag{10}
$$

采样从温度化源分布 $q_{0,T}$ 初始化。条件速度的具体形式取决于模型，第 3.3 节对本文的流结构分别推导。这样，TFT 与 BCT-L 将训练中间状态、终点分布和采样动力学统一到同一个生成流之中。

### 3.2 面向常规训练模型的事后 BCT 变体

作者进一步考察，对于已在原桥 $q_t$ 上完成训练的模型，不进行重新训练还能恢复多少一致性。为此提出 BCT-P 和 BCT-E。

**路径温度调节（BCT-P）。** BCT-P 保留后验温度调节，即同时隐式调节终点分布和条件桥；但是把原始条件动力学替换为温度化桥所对应的动力学。后验为

$$
r_{t,T}^{\mathrm{BCT-P}}(x\mid\mathbf z)
\propto\frac{r_t(x\mid\mathbf z)^\beta}{Z_{t,T}(x)}, \tag{11}
$$

对应速度为

$$
\mathbf u_{t,T}^{\mathrm{BCT-P}}(\mathbf z)=
\sum_x r_{t,T}^{\mathrm{BCT-P}}(x\mid\mathbf z)
\mathbf u_{t,T}(\mathbf z\mid x). \tag{12}
$$

当 $Z_{t,T}(x)$ 不依赖 $x$ 时，BCT-P 与标准温度缩放具有完全相同的后验权重；差异只在于 BCT-P 的条件速度与温度化桥相匹配。不过，BCT-P 的去噪器仍仅在原桥 $q_t$ 产生的状态上训练，因此其中间状态仍存在训练—推理失配。

**终点温度调节（BCT-E）。** BCT-E 完全避免对条件桥进行温度调节，保留未经调节的桥和条件动力学，只改变终点分布 $\pi$。根据贝叶斯公式，可以用原始去噪器表达后验：

$$
r_{t,T}^{\mathrm{BCT-E}}(x\mid\mathbf z)
\propto r_t(x\mid\mathbf z)^\beta q_t(\mathbf z\mid x)^{1-\beta}. \tag{13}
$$

以 logits 表示，则是

$$
\ell_x^E=\beta\ell_x+(1-\beta)\log q_t(\mathbf z\mid x). \tag{14}
$$

这些权重与原始条件速度 $\mathbf u_t(\mathbf z\mid x)$ 结合使用。

两种变体均无需重新训练。BCT-P 通过将动力学与温度化桥配套来恢复一致性；BCT-E 则通过同时保持桥和动力学不变来恢复一致性。

### 3.3 具体实现

在两类具有不同条件桥的后验诱导流模型上实现 BCT。

**超球面流。** S-FLM 将 token 嵌入和潜状态放置在单位球面上，并沿测地线将均匀源分布输运至每个终点。令 $\theta_x(\mathbf z)=\arccos\langle\mathbf z,\mathbf e_x\rangle$，$a_t=1-\alpha_t$ 表示时刻 $t$ 剩余的测地线比例。相对于球面面积测度，其条件桥密度为

$$
q_t(\mathbf z\mid x)\propto
\frac{\sin^{d-2}(\theta_x/a_t)}{\sin^{d-2}\theta_x}
\,\mathbf1_{\{\theta_x<a_t\pi\}}. \tag{15}
$$

该密度为 BCT-E 与 TFT 提供所需的条件桥似然。旋转对称性还保证 $Z_{t,T}(x)$ 与 $x$ 无关，因此 BCT-P 与标准温度调节采用相同的后验权重。

温度化条件桥 $q_{t,T}$ 仍然围绕 $\mathbf e_x$ 旋转对称，因此对应的条件速度与原 S-FLM 速度沿相同测地线方向，只是速度大小随温度改变：

$$
\mathbf u_{t,T}(\mathbf z\mid x)
=w_{t,T}(\theta_x)\mathbf u_t(\mathbf z\mid x). \tag{16}
$$

其中 $w_{t,T}$ 从一维连续性方程得到，推导见附录 B.3。同样的旋转对称性使得 $q_{t,T}$ 的精确采样可简化为极角的一维变换，从而让 TFT 直接从温度化桥采样训练状态（附录 B.4）。

**von Mises–Fisher 流。** Chemseddine 等（2026）采用 von Mises–Fisher 条件桥：

$$
q_t(\mathbf z\mid x)\propto
\exp(\kappa_t\langle\mathbf e_x,\mathbf z\rangle). \tag{17}
$$

温度化操作仍处于同一分布族：

$$
q_{t,T}(\mathbf z\mid x)\propto
\exp\left(\frac{\kappa_t}{T}
\langle\mathbf e_x,\mathbf z\rangle\right). \tag{18}
$$

因此 BCT 只需将 $\kappa_t$ 替换为 $\kappa_t/T$，并采用对应的条件动力学（附录 G）。TFT 也可直接从浓度参数为 $\kappa_t/T$ 的 vMF 分布采样训练状态。由于归一化因子与 $x$ 无关，BCT-P 在这种情况下同样与标准温度调节共享后验权重。

对于 vMF 流，温度化条件桥的证据项 $g_{t,T}(x,\mathbf z)=(\kappa_t/T)\langle\mathbf e_x,\mathbf z\rangle$ 可解析计算。因此在 TFT 中，作者将其显式包含于去噪器 logits，写成 $\ell_x^\eta=a_{\eta,x}+g_{t,T}(x,\mathbf z)$，只学习剩余项 $a_{\eta,x}$。这仍是同一 TFT 后验和 BCT-L 采样器的参数化形式，而非独立的训练方法。

## 4. 实验

### 4.1 实验设置

**主要设置。** 主要实验利用 S-FLM 在 GSM8K 上评估 BCT。按照 S-FLM 的设置，采用 TinyGSM 协议：对于 1319 道测试题，模型生成 Python 程序；若执行程序能返回参考答案，则视为解题成功。作者使用公开的 TinyGSM 检查点，包含两种去噪器骨干：中间激活位于超球面上的 Transformer（S-arch），以及标准扩散 Transformer（DiT）。二者共享条件桥、后验诱导速度和所有采样器，因此比较时只改变去噪器结构。

**额外设置。** 还开展两组实验，用于验证结论能否推广到其他情形。一是改变任务而保留超球面流，测试要求严格受限生成的 Sudoku-Hard。由于没有公开的数独检查点，作者遵循发布的训练配置，从头训练基于 DiT 的 S-FLM。二是改变流结构但保留任务：将 BCT 用于采用 vMF 桥而非 S-FLM 测地线桥的 SFCD，在相同 GSM8K 问题上评估其公开 TinyGSM 检查点。

**采样器。** 所有采样器均使用精确的后验诱导速度、1024 次函数评估（NFE），并沿用发布版采样器的其他设置；各方法仅在后验权重及条件速度上不同。比较标准温度调节、BCT-E、BCT-P 和 BCT-L。此外，报告只向最高概率 token 运动的 Top-1 速度，它不依赖温度，是标准温度调节在 $T\to0$ 时的极限。所有实验评估 $T\in\{1,0.8,0.6,0.5,0.4,0.3,0.2,0.1\}$。

**TFT 与 BCT-L。** 对每个骨干，在发布检查点的基础上额外进行 2000 次 TFT 训练更新，即原先 250000 次预训练更新的 0.8%。训练温度分布以概率 0.2 选取 $T=1$，以概率 0.1 选取 $T=0.1$，其余情况令 $\beta\sim U(1.25,5)$，覆盖所有评估温度。为保证公平，作为匹配训练对照的 Cont. 使用原配方额外训练相同的 2000 次。全部模型均使用 EMA 权重评估。式（9）的 $\lambda$ 只在 TinyGSM 验证集上为每个模型选择一次，并在不同温度下共享。

### 4.2 主要结果

图 2 和表 1 给出了两种去噪器骨干上的超球面流结果。由于 TFT 是从预训练模型继续训练而非从头训练，BCT-L 的公平对照应当是额外更新步数相同的 Cont.，两者的差别只在训练时是否引入温度。单纯继续训练带来的变化很小：Cont. 采用标准温度调节时，在全部温度点的表现与发布检查点相差不超过一个百分点；两个检查点上的免训练变体表现也类似。

**BCT-L 使低温解码有效。** 常规训练下，降低温度帮助很小：在 $T\le0.4$ 时，两种骨干的标准温度缩放精度均维持在 17%–18%，接近其 $T\to0$ 的 Top-1 参考水平。BCT-L 则在温度降低时持续改善，在 $T=0.1$ 时，S-arch 达到 $27.0\pm1.0\%$，DiT 达到 $26.0\pm0.6\%$；对于所有 $T<1$，均优于标准温度调节。

**推理时匹配动力学，在中等温度有明显收益。** 即使不再训练，BCT-P 也能大幅优于标准温度调节：在 S-arch 上，其最佳准确率提高约 6 个百分点，在 DiT 上约提高 10 个百分点。在中等温度下，它接近 BCT-L，甚至在 DiT 上略优。

**强温度调节需要在温度化桥上训练。** 在极低温下，BCT-P 会崩溃：$T=0.1$ 时两种骨干均低于标准温度调节。这符合训练—推理失配的解释：潜状态遵循温度化条件桥，但去噪器从未在这样的状态上训练，温度越低失配越大。BCT-L 则由于在温度化桥上训练而没有这种失配，因而在 $T=0.1$ 时精度最高。这突出说明训练状态与采样状态分布一致的重要性。

**保持条件桥不变较稳定，但收益较少。** BCT-E 保留去噪器训练使用的桥，因此不会在低温下退化，但它对标准温度调节的改进较有限，在每个 $T<1$ 的温度点都不如 BCT-L，且温度越低差距越大。

**表 1：** GSM8K 准确率（%），1319 道问题，NFE=1024，三次生成种子的均值 ± 样本标准差。下列数值完整对应原文表 1，按 S-arch 与 DiT 两个骨干分列。Cont. 表示额外以原配方继续训练 2000 步；S-FLM 表示发布检查点；TFT 是温度化继续训练版本。

**S-arch**

| T | TFT / BCT-L | Cont. / Standard | Cont. / BCT-E | Cont. / BCT-P | S-FLM / Standard | S-FLM / BCT-E | S-FLM / BCT-P |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1.0 | 12.6 ± 1.1 | 12.0 ± 0.5 | 12.0 ± 0.5 | 12.0 ± 0.5 | 12.5 ± 0.5 | 12.5 ± 0.5 | 12.5 ± 0.5 |
| 0.8 | 16.3 ± 0.2 | 14.1 ± 0.5 | 15.0 ± 0.5 | 15.9 ± 0.2 | 14.7 ± 0.7 | 15.0 ± 1.1 | 16.7 ± 0.2 |
| 0.6 | 20.4 ± 0.4 | 15.3 ± 0.6 | 16.5 ± 0.4 | 20.2 ± 0.3 | 15.6 ± 0.2 | 16.9 ± 0.3 | 19.7 ± 0.5 |
| 0.5 | 21.5 ± 0.3 | 16.8 ± 0.2 | 17.4 ± 0.4 | 21.7 ± 0.6 | 16.3 ± 0.5 | 17.7 ± 0.3 | 21.2 ± 0.6 |
| 0.4 | 23.0 ± 0.9 | 17.3 ± 0.7 | 18.3 ± 0.5 | 23.2 ± 0.5 | 17.1 ± 0.5 | 18.0 ± 1.1 | 22.9 ± 0.6 |
| 0.3 | 23.9 ± 1.0 | 17.3 ± 0.6 | 18.4 ± 0.2 | 22.3 ± 0.6 | 17.4 ± 0.6 | 18.5 ± 0.6 | 23.0 ± 0.5 |
| 0.2 | 25.1 ± 0.9 | 17.5 ± 0.3 | 18.7 ± 0.1 | 16.6 ± 1.1 | 17.6 ± 0.3 | 18.3 ± 0.1 | 18.3 ± 0.9 |
| 0.1 | 27.0 ± 1.0 | 17.5 ± 0.5 | 18.8 ± 0.1 | 3.9 ± 0.5 | 17.6 ± 0.5 | 18.3 ± 0.1 | 5.0 ± 0.4 |

**DiT**

| T | TFT / BCT-L | Cont. / Standard | Cont. / BCT-E | Cont. / BCT-P | S-FLM / Standard | S-FLM / BCT-E | S-FLM / BCT-P |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1.0 | 11.2 ± 1.3 | 11.7 ± 1.2 | 11.7 ± 1.2 | 11.7 ± 1.2 | 12.0 ± 1.0 | 12.0 ± 1.0 | 12.0 ± 1.0 |
| 0.8 | 16.2 ± 0.8 | 14.3 ± 0.4 | 15.2 ± 1.0 | 17.0 ± 0.4 | 14.0 ± 0.6 | 14.8 ± 0.9 | 17.3 ± 0.5 |
| 0.6 | 20.2 ± 0.5 | 16.5 ± 0.1 | 17.9 ± 0.4 | 20.8 ± 0.6 | 16.4 ± 0.1 | 18.1 ± 0.6 | 20.8 ± 0.9 |
| 0.5 | 22.0 ± 0.2 | 16.6 ± 1.1 | 18.9 ± 1.0 | 23.9 ± 0.9 | 16.9 ± 0.7 | 18.9 ± 1.6 | 23.8 ± 0.9 |
| 0.4 | 24.1 ± 0.3 | 17.0 ± 0.6 | 19.3 ± 0.3 | 26.2 ± 0.6 | 17.0 ± 0.9 | 19.6 ± 1.1 | 25.7 ± 0.7 |
| 0.3 | 25.2 ± 1.1 | 17.8 ± 0.9 | 19.7 ± 0.6 | 26.7 ± 0.2 | 17.2 ± 0.9 | 19.4 ± 0.5 | 26.7 ± 0.7 |
| 0.2 | 25.4 ± 0.5 | 18.0 ± 0.7 | 19.5 ± 0.7 | 27.8 ± 0.6 | 17.2 ± 0.8 | 19.5 ± 0.8 | 27.3 ± 0.6 |
| 0.1 | 26.0 ± 0.6 | 17.3 ± 0.2 | 19.4 ± 0.6 | 17.0 ± 0.6 | 17.2 ± 0.7 | 19.2 ± 0.6 | 16.7 ± 0.4 |

**图 2：** 两种骨干上，GSM8K 准确率随采样温度的变化（NFE=1024）。曲线是三次生成种子的均值，阴影带表示 ± 一个样本标准差。无前缀曲线使用发布检查点，Cont.（虚线）表示匹配的继续训练；$T=1$ 时所有 BCT 校正均为恒等变换。数值详见表 1。

### 4.3 超越“降低多样性”的收益

降低温度会使采样器更集中，因此 BCT-L 的低温收益可能只是以样本多样性为代价换取单次生成精度，而较高多样性的采样器也许可以通过生成更多样本追回准确率。为检验这一点，作者在 S-arch 上比较 BCT-L 与 Cont. 上的标准温度调节，计算 $K\in\{1,2,4,8\}$ 的 Pass@K。每题生成 8 个样本，再用 Chen 等（2021）的无偏估计量估计指标（图 3；细节见附录 D）。

对于每个 $T<1$ 和 $K\le8$，BCT-L 的 Pass@K 均更高，而且两种方法差异的 95% 配对 bootstrap 置信区间完全大于零。增加采样数量会提高两者的 Pass@K，但并不足以让标准温度调节追平 BCT-L。因此，BCT-L 的低温改进不能仅用“牺牲多样性”来解释。

**图 3：** GSM8K 的 Pass@K（S-arch，NFE=1024）。每道题生成八次并估计指标；阴影表示对题目进行 bootstrap 得到的 95% 置信区间，各面板共享纵坐标。

### 4.4 超越 GSM8K：Sudoku-Hard

Sudoku-Hard 用于检验结论能否推广到受严格约束的生成任务；每道数独题只有一个有效解。由于没有公开的数独检查点，作者从头训练基础模型，再通过继续训练获得 TFT。与第 4.2 节一样，BCT-L 的公平对照因此仍为 Cont.（图 4）。按照发布的 S-FLM 配置，采样使用 180 NFE。

降低温度会略微损害标准温度调节的表现，而 BCT-L 随着温度降低单调提高，最高达到 46.8%。无需训练的变体在低温下也有改进，且此任务中的 BCT-P 不会崩溃。不过，在所有 $T\le0.6$ 时，BCT-L 仍然最准确，而且温度越低领先幅度越大。基础检查点也出现相同趋势（附录 F）。

**图 4：** Sudoku-Hard 精确求解率（NFE=180）。三次生成种子的均值及 ± 一个样本标准差，基础检查点结果见原文表 5。

### 4.5 超越测地线条件桥：von Mises–Fisher 流

最后将 BCT 应用于 SFCD，其 von Mises–Fisher 条件桥取代了 S-FLM 的测地线桥（第 3.3 节）。使用公开的 TinyGSM 检查点，采样 NFE=1024，对 TFT 和 Cont. 继续训练，并在五个随机种子上取平均（附录 G）。

与 S-FLM 不同，SFCD 的标准温度调节本来就有效：温度从 1 降至 0.3 时，精度提高约 9 个百分点（图 5），说明不一致的温度调节对 vMF 桥造成的损害可能较小。因此需要回答：在标准温度调节已经有效的模型上，一致温度调节是否仍能带来好处？

答案是肯定的，主要体现在中等温度。BCT-L 在所有 $T\in[0.2,0.6]$ 下都优于标准温度调节，并在 $T=0.3$ 时达到测试采样器中最高的 $34.5\pm0.5\%$，而标准温度调节为 $32.6\pm0.6\%$，差距明显超过随机种子标准差。

在强温度调节下，学习式实现仍然稳定，而免训练变体表现恶化。BCT-L 在最低温时也会下降，这是 S-FLM 中没有出现的趋势，但仍保持在标准温度调节的水平（$T=0.1$ 时 31.7% 对 31.3%）。两种免训练变体都低于标准方法：BCT-P 与 S-FLM 中一样降至 28.5%；在 S-FLM 中相对稳定的 BCT-E 却在 $T\le0.2$ 时崩溃，精度基本降为零。原因可能在于，对该条件桥，其校正项 $-(\beta-1)\kappa_t\langle\mathbf e_x,\mathbf z\rangle$ 将学习 logits 与解析桥项之间的任何失配，按照 $\beta$ 和 $\kappa_t$ 放大。

因此，BCT-L 是 $T<1$ 时唯一从不低于标准温度调节的变体：即使流模型本身已能有效响应温度，一致的温度调节仍有收益；而在温度化桥上训练可使其在强温度调节下更为可靠。

**图 5：** BCT 在 vMF 流语言模型上随温度变化的 GSM8K 准确率（NFE=1024）：五个生成种子的均值和 ± 一个样本标准差。当 $T\le0.3$ 时 BCT-E 低于图中纵轴显示范围，详细结果见原文表 7。

## 5. 相关工作

**后验诱导流语言模型。** 非自回归语言模型包括离散扩散模型，以及将 token 映射到学习嵌入或 one-hot 向量等连续表示的连续扩散模型和流模型。在许多连续模型中，使用交叉熵训练的去噪器预测干净 token，其后验概率用于加权条件速度、漂移或分数函数。在球面结构中，S-FLM 沿超球面测地线输运潜状态，SFCD 则采用 von Mises–Fisher 条件桥；本文为这两种结构实现 BCT。

**温度与一致性。** 在自回归模型和离散扩散模型中，温度直接重标定 token 采样的分类分布；降低温度可显著改善离散扩散语言模型在 GSM8K 上的性能。连续扩散模型和流模型通常对分数函数或 token 后验进行温度缩放。对于连续数据，已有研究表明，温度调节通常与加噪操作不可交换：缩放后的分数不等于已加噪温度化分布的分数。已有不一致性修正研究主要针对其他情形，包括 Feynman–Kac 校正器对粒子群的重加权与重采样、高斯加噪下 $T>1$ 的分数缩放校正，以及在不改变混合权重的情况下调节局部温度的时间分数重标定。它们均未直接解决有限词表上的 token 后验诱导流：对后验进行温度调节时，条件桥隐式变化但条件速度没有变化。BCT 通过条件桥自身修复这一问题，无需粒子群，只沿单条采样轨迹完成校正，并将该校正推广到训练阶段。

**训练—推理失配。** 如果模型在测试时遇到的状态不同于训练时使用的状态，就会产生暴露偏差。这既见于自回归模型，也见于扩散模型；后者可以通过扰动训练输入或调整采样时间步减轻偏差。在这些研究中，失配来源于模型自身的预测误差。而温度调节导致的失配由一个已知的条件桥变化产生，因此 TFT 可以精确地从采样器实际遵循的温度化桥中抽取训练状态。

## 6. 结论

本文提出贝叶斯一致温度调节 BCT，将温度视为生成流的组成部分，而非对去噪后验施加的事后变换。BCT 对齐了温度化终点分布、中间状态分布、训练分布和采样动力学；针对常规训练检查点，其免训练变体也能恢复部分一致性。在采用两种去噪器架构的超球面流语言模型以及 vMF 流语言模型上，BCT 都能在较宽温度区间内改善 GSM8K 生成性能，而学习式实现即使在激进的强温度调节下，仍然比逐渐退化的事后变体更加稳健。这些改进还延伸至数独任务，说明 BCT 对严格约束的生成也有帮助。整体而言，实验表明，在后验诱导流语言模型中，最好将温度视为贯穿训练与推理的流模型属性。

## 局限与讨论

BCT 适用于那些可以推导或近似温度化条件桥及其采样动力学的后验诱导流。本文的具体推导覆盖 S-FLM 的超球面条件桥和 SFCD 的 vMF 条件桥。未来的重要研究方向是将 BCT 扩展到其他条件桥族。

## 致谢

本研究由日本产业技术综合研究所（AIST）与东京科学大学在 FRONTia 计划下开展。FRONTia 是由日本经济产业省（METI）和新能源产业技术综合开发机构（NEDO）牵头的国家计划，旨在开发用于 AI 机器人和物理 AI 的日本国产多模态基础模型。本工作还部分获得 JSPS KAKENHI 25H01137 项目及日本 JST K Program（JPMJKP24C3）资助。

## 参考文献（原始英文题录）

以下为论文第 10–12 页的原始英文参考书目，保留题名、作者和出版信息，按照源 PDF 的作者姓氏字母顺序排列。

David H. Ackley, Geoffrey E. Hinton, and Terrence J. Sejnowski. A learning algorithm for Boltzmann machines. Cognitive Science, 9(1):147–169, 1985.

Marianne Arriola, Aaron Gokaslan, Justin T Chiu, Zhihan Yang, Zhixuan Qi, Jiaqi Han, Subham Sekhar Sahoo, and Volodymyr Kuleshov. Block diffusion: Interpolating between autoregressive and diffusion language models. In The Thirteenth International Conference on Learning Representations, 2025.

Jacob Austin, Daniel D. Johnson, Jonathan Ho, Daniel Tarlow, and Rianne van den Berg. Structured denoising diffusion models in discrete state-spaces. In Advances in Neural Information Processing Systems, 2021.

Iskander Azangulov and Leo Zhang. Sampling from flow language models via marginal-conditioned bridges. arXiv preprint arXiv:2605.13681, 2026.

Heli Ben-Hamu, Itai Gat, Daniel Severo, Niklas Nolte, and Brian Karrer. Accelerated sampling from masked diffusion models via entropy bounded unmasking, 2025. URL https://arxiv. org/abs/2505.24857. Samy Bengio, Oriol Vinyals, Navdeep Jaitly, and Noam Shazeer. Scheduled sampling for sequence prediction with recurrent neural networks. In Advances in Neural Information Processing Systems, 2015.

Jannis Chemseddine, Gregor Kornhardt, and Gabriele Steidl. Spherical flows for sampling categorical data. arXiv preprint arXiv:2605.05629, 2026.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Ricky T. Q. Chen and Yaron Lipman. Flow matching on general geometries. In The Twelfth International Conference on Learning Representations, 2024.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

Oscar Davis, Samuel Kessler, Mircea Petrache, ˙Ismail ˙Ilkan Ceylan, Michael Bronstein, and Avishek Joey Bose. Fisher flow matching for generative modeling over discrete data. In Advances in Neural Information Processing Systems, 2024.

Justin Deschenaux and Caglar Gulcehre. Language modeling with hyperspherical flows. arXiv preprint arXiv:2605.11125, 2026. 10
 Sander Dieleman, Laurent Sartran, Arman Roshannai, Nikolay Savinov, Yaroslav Ganin, Pierre H. Richemond, Arnaud Doucet, Robin Strudel, Chris Dyer, Conor Durkan, Curtis Hawthorne, Remi ´ Leblond, Will Grathwohl, and Jonas Adler. Continuous diffusion for categorical data. arXiv preprint arXiv:2211.15089, 2022.

Yilun Du, Conor Durkan, Robin Strudel, Joshua B. Tenenbaum, Sander Dieleman, Rob Fergus, Jascha Sohl-Dickstein, Arnaud Doucet, and Will Grathwohl. Reduce, reuse, recycle: Compositional generation with energy-based diffusion models and MCMC. In Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pp. 8489–8510, 2023.

Ishaan Gulrajani and Tatsunori B. Hashimoto. Likelihood-based diffusion language models. In Advances in Neural Information Processing Systems, volume 36, 2023.

Mohsin Hasan, Viktor Ohanesian, Artem Gazizov, Yoshua Bengio, Alan Aspuru-Guzik, Roberto ´ Bondesan, Marta Skreta, and Kirill Neklyudov. Discrete Feynman-Kac correctors. arXiv preprint arXiv:2601.10403, 2026.

Ari Holtzman, Jan Buys, Li Du, Maxwell Forbes, and Yejin Choi. The curious case of neural text degeneration. In International Conference on Learning Representations, 2020.

Keya Hu, Linlu Qiu, Yiyang Lu, Hanhong Zhao, Tianhong Li, Yoon Kim, Jacob Andreas, and Kaiming He. Elf: Embedded language flows. arXiv preprint arXiv:2605.10938, 2026.

Jaehyeong Jo and Sung Ju Hwang. Continuous diffusion model for language modeling. In Advances in Neural Information Processing Systems, 2025.

Jaeyeon Kim, Seunggeun Kim, Taekyun Lee, David Z. Pan, Hyeji Kim, Sham Kakade, and Sitan Chen. Fine-tuning masked diffusion for provable self-correction. In International Conference on Machine Learning, 2026.

Chanhyuk Lee, Jaehoon Yoo, Manan Agarwal, Sheel Shah, Jerry Huang, Aditi Raghunathan, Seunghoon Hong, Nicholas M Boffi, and Jinwoo Kim. Flow map language models: One-step language modeling via continuous denoising. arXiv preprint arXiv:2602.16813, 2026.

Mingxiao Li, Tingyu Qu, Ruicong Yao, Wei Sun, and Marie-Francine Moens. Alleviating exposure bias in diffusion models through sampling with shifted time steps. In International Conference on Learning Representations, 2024.

Peizhuo Li, Emre Aksan, Alexandru-Eugen Ichim, Thabo Beeler, and Olga Sorkine-Hornung. Diversify diffusion with temperature sampling and variance-corrective time shifting. arXiv preprint arXiv:2607.10853, 2026.

Xiang Li, John Thickstun, Ishaan Gulrajani, Percy S Liang, and Tatsunori B Hashimoto. Diffusionlm improves controllable text generation. Advances in neural information processing systems, 35: 4328–4343, 2022.

Bingbin Liu, Sebastien Bubeck, Ronen Eldan, Janardhan Kulkarni, Yuanzhi Li, Anh Nguyen, Rachel Ward, and Yi Zhang. TinyGSM: achieving >80% on GSM8K with small language models. arXiv preprint arXiv:2312.09241, 2023.

Aaron Lou, Chenlin Meng, and Stefano Ermon. Discrete diffusion modeling by estimating the ratios of the data distribution. In International Conference on Machine Learning, 2024.

Shen Nie, Fengqi Zhu, Zebin You, Xiaolu Zhang, Jingyang Ou, Jun Hu, Jun Zhou, Yankai Lin, Ji-Rong Wen, and Chongxuan Li. Large language diffusion models. arXiv preprint arXiv:2502.09992, 2025.

Mang Ning, Enver Sangineto, Angelo Porrello, Simone Calderara, and Rita Cucchiara. Input perturbation reduces exposure bias in diffusion models. In International Conference on Machine Learning, 2023.

William Peebles and Saining Xie. Scalable diffusion models with transformers, 2023. URL https: //arxiv.org/abs/2212.09748. 11
 Marc’Aurelio Ranzato, Sumit Chopra, Michael Auli, and Wojciech Zaremba. Sequence level training with recurrent neural networks. In International Conference on Learning Representations, 2016.

Subham Sahoo, Marianne Arriola, Yair Schiff, Aaron Gokaslan, Edgar Marroquin, Justin Chiu, Alexander Rush, and Volodymyr Kuleshov. Simple and effective masked diffusion language models. Advances in Neural Information Processing Systems, 37:130136–130184, 2024.

Subham Sekhar Sahoo, Justin Deschenaux, Aaron Gokaslan, Guanghan Wang, Justin T Chiu, and Volodymyr Kuleshov. The diffusion duality. In Forty-second International Conference on Machine Learning, 2025. URL https://openreview.net/forum?id=9P9Y8FOSOk. Jiaxin Shi, Kehang Han, Zhe Wang, Arnaud Doucet, and Michalis Titsias. Simplified and generalized masked diffusion for discrete data. Advances in neural information processing systems, 37: 103131–103167, 2024.

Marta Skreta, Tara Akhound-Sadegh, Viktor Ohanesian, Roberto Bondesan, Alan Aspuru-Guzik, ´ Arnaud Doucet, Rob Brekelmans, Alexander Tong, and Kirill Neklyudov. Feynman-Kac correctors in diffusion: Annealing, guidance, and product of experts. In Proceedings of the 42nd International Conference on Machine Learning, volume 267 of Proceedings of Machine Learning Research, pp. 55906–55949, 2025.

Hannes Stark, Bowen Jing, Chenyu Wang, Gabriele Corso, Bonnie Berger, Regina Barzilay, and Tommi Jaakkola. Dirichlet flow matching with applications to dna sequence design. In Proceedings of the 41st International Conference on Machine Learning, pp. 46495–46513, 2024.

Yanbo Xu, Yu Wu, Sungjae Park, Zhizhuo Zhou, and Shubham Tulsiani. Temporal score rescaling for temperature sampling in diffusion and flow models. In International Conference on Machine Learning, 2026.

## 附录 A：序列

对于联合终点分布为 $\pi(\mathbf x)$ 的序列 $\mathbf x=(x_1,\ldots,x_L)$，若条件桥按 token 位置分解，则第 $l$ 个位置的后验需要对其他位置边缘化：

$$
\begin{aligned}
r_t(x_l\mid\mathbf z)
&=\frac{q_t(z^l\mid x_l)\widetilde\pi_t(x_l;\mathbf z^{-l})}
{\sum_y q_t(z^l\mid y)\widetilde\pi_t(y;\mathbf z^{-l})},\\
\widetilde\pi_t(x_l;\mathbf z^{-l})
&=\sum_{\mathbf x^{-l}}\pi(\mathbf x)
\prod_{j\ne l}q_t(z^j\mid x_j).
\end{aligned}\tag{19}
$$

这是将式（1）应用于位置 $l$ 的结果，只需以由其他位置条件化的终点分布 $\widetilde\pi_t(\cdot;\mathbf z^{-l})$ 替换 $\pi$。该分布不依赖 $z^l$。

因此，第 3 节提出的所有构造均可逐 token 位置使用，并对 $\widetilde\pi_t$ 施加温度调节；在 TFT 中，$\widetilde\pi_t$ 使用其他位置的温度化条件桥 $q_{t,T}$ 构造。对任意固定终点序列，各位置条件桥的乘积在相应条件速度的拼接作用下被输运，由乘积法则可知联合条件连续性方程成立。

不过，**这些方法都不会直接调节整个序列的联合终点分布**。要实现真正的联合终点温度调节，需要对包含 $\pi(\mathbf x)$ 和其他位置条件桥的上下文因子进行操作，而通常这并不正比于各方法所使用的 $\widetilde\pi^\beta$。自回归模型中的逐 token 温度调节也具有同样性质。

## 附录 B：超球面条件桥

全文以 $\theta=\theta_x(\mathbf z)$ 表示以 token 嵌入 $\mathbf e_x$ 为极点的极角，$\nu=d-2$，$\sigma$ 表示单位球面 $\mathbb S^{d-1}$ 上的面积测度，$a=a_t\in(0,1]$。在源端 $a=1$，随着时间 $t$ 增加而递减；桥只通过 $a$ 依赖时间。

### B.1 条件桥密度

S-FLM 在 $\mathbb S^{d-1}$ 上均匀采样 $\mathbf z_0$，并采用球面线性插值 $\mathbf z_t=\operatorname{SLERP}(\mathbf z_0,\mathbf e_x;\alpha_t)$。相对于 $\mathbf e_x$，状态可写为 $\mathbf z=\cos\theta\,\mathbf e_x+\sin\theta\,\boldsymbol\xi$，其中 $\boldsymbol\xi$ 位于与 $\mathbf e_x$ 正交的子空间中的单位球面 $\mathbb S^{d-2}$。面积测度分解为

$$
d\sigma(\mathbf z)=\sin^\nu\theta\,d\theta\,d\sigma_{d-2}(\boldsymbol\xi). \tag{20}
$$

令 $\omega=\theta_x(\mathbf z_0)$。代入 SLERP 的定义可得 $\mathbf z_t=\cos(a\omega)\mathbf e_x+\sin(a\omega)\boldsymbol\xi$：球面线性插值保持 $\boldsymbol\xi$ 不变，只把极角乘以 $a$。均匀源端的 $(\omega,\boldsymbol\xi)$ 具有与 $\sin^\nu\omega$ 成正比的密度。变量替换 $\omega\mapsto a\omega$ 的 Jacobian 为 $a$；再除以式（20）中的球面测度因子，得到

$$
q_t(\mathbf z\mid x)=
\frac{\sin^\nu(\theta/a)}
{a\,|\mathbb S^{d-1}|\,\sin^\nu\theta}
\mathbf1_{\{\theta<a\pi\}}, \tag{21}
$$

即正文式（15）。

### B.2 温度化条件桥

由式（20），对 $q_{t,T}(\cdot\mid x)\propto q_t(\cdot\mid x)^\beta$，方向 $\boldsymbol\xi$ 在 $\mathbb S^{d-2}$ 上均匀分布，且与极角独立。极角的边缘密度为

$$
m_{a,T}(\theta)=\frac{g_{a,T}(\theta)}{C_{a,T}},\qquad
g_{a,T}(\theta)=\sin^{\nu\beta}(\theta/a)
\sin^{\nu(1-\beta)}\theta,\quad
0<\theta<a\pi, \tag{22}
$$

其中 $C_{a,T}=\int_0^{a\pi}g_{a,T}(\theta)d\theta$。

旋转变换保持面积测度不变，并能将一个 token 的条件桥映射为其他 token 的条件桥，因此 $Z_{t,T}$ 只依赖 $(a,T,d)$。当 $\theta\to0$ 时，$g_{a,T}$ 如 $\theta^\nu$ 变化；当 $a<1$ 且 $\theta\to a\pi$ 时，则如 $(a\pi-\theta)^{\nu\beta}$ 变化。因此对于任意 $T>0$，归一化常数均有限，条件桥有效。其支撑集不依赖温度。在 $a=1$ 时，$g_{1,T}=\sin^\nu\theta$，所以温度化源分布与 S-FLM 的均匀源分布相同。

### B.3 温度化条件速度

将极角动力学记为 $d\theta/da=v_{a,T}(\theta)$。

**对称性降维。** $q_{t,T}$ 在保持 $\mathbf e_x$ 不变的正交变换下不变；令条件速度对这些变换等变。对于 $d\ge3$，满足该等变性要求的切向速度只能沿着从 $\mathbf e_x$ 远离的测地方向 $\mathbf e_\theta$，且其幅值只依赖 $\theta$。因此 $\mathbf u=\dot\theta\,\mathbf e_\theta$。

**一维连续性方程。** 由球面坐标的散度形式，将密度的连续性方程乘以极角 Jacobian 后可得

$$
\partial_a m_{a,T}(\theta)
+\partial_\theta\big(m_{a,T}(\theta)v_{a,T}(\theta)\big)=0. \tag{23}
$$

在极点采用无通量边界条件，积分得到唯一解 $v_{a,T}=-\partial_a M_{a,T}/m_{a,T}$，其中 $M_{a,T}(\theta)=\int_0^\theta m_{a,T}(\vartheta)d\vartheta$。

**闭式积分形式。** 对 $g_{a,T}$ 关于 $a$ 求导得到 $\partial_ag_{a,T}=-\nu\beta\theta\cot(\theta/a)g_{a,T}/a^2$。边界上的 $g_{a,T}(a\pi)=0$ 使得对 $C_{a,T}$ 求导不会产生边界项。记 $\overline H_{a,T}=\mathbb E_{\theta\sim m_{a,T}}[\theta\cot(\theta/a)]$，则

$$
v_{a,T}(\theta)=\frac{\nu\beta}{a^2}
\frac{\int_0^\theta
[\vartheta\cot(\vartheta/a)-\overline H_{a,T}]
g_{a,T}(\vartheta)d\vartheta}
{g_{a,T}(\theta)}. \tag{24}
$$

时间 $t$ 增加时 $da/dt=-\dot\alpha_t$，因此 $\dot{\mathbf z}=-\dot\alpha_tv_{a,T}(\theta)\mathbf e_\theta$。由于 $\operatorname{Log}_{\mathbf z}(\mathbf e_x)=-\theta\mathbf e_\theta$，它等价于

$$
\mathbf u_{t,T}(\mathbf z\mid x)=
w_{t,T}(\theta)\mathbf u_t(\mathbf z\mid x),\quad
w_{t,T}(\theta)=\frac{a_tv_{a_t,T}(\theta)}{\theta},\quad
\mathbf u_t=\frac{\dot\alpha_t}{a_t}\operatorname{Log}_{\mathbf z}(\mathbf e_x).
$$

这恢复正文式（16）。当 $T=1$ 时，分部积分得到 $\overline H_{a,1}=-a/\nu$，而式（24）简化为 $v_{a,1}=\theta/a$，于是 $w_{t,1}\equiv1$，与原始 S-FLM 条件速度相同。

### B.4 温度化条件桥的精确采样

将源极角和目标极角分别归一化为 $\psi=\omega/\pi$ 和 $\varphi=\theta/(a\pi)$，均属于 $(0,1)$。令 $F_{\rm src}$ 是密度正比于 $\sin^\nu(\pi\psi)$ 的累积分布函数（CDF），$F_{a,T}$ 是密度正比于 $\sin^{\nu\beta}(\pi\varphi)\sin^{\nu(1-\beta)}(a\pi\varphi)$ 的 CDF。定义分位数变换

$$
Q_{a,T}(\omega)=
a\pi F_{a,T}^{-1}\big(F_{\rm src}(\omega/\pi)\big). \tag{25}
$$

源分布和温度化桥的方向 $\boldsymbol\xi$ 都服从 $\mathbb S^{d-2}$ 上的均匀分布，且与极角独立。因此，令 $\theta=Q_{a,T}(\omega)$，再构造 $\mathbf z=\cos\theta\,\mathbf e_x+\sin\theta\,\boldsymbol\xi$，就能精确采样 $q_{t,T}(\cdot\mid x)$。当 $\beta=1$，有 $F_{a,1}=F_{\rm src}$，故 $\theta=a\omega$，恢复原始 SLERP。等价地，该采样也可看作采用依赖样本位置参数 $1-\theta/\omega$ 的 SLERP。

在 TFT 中，作者为每个批次中的 $(a_t,T)$ 构建目标 CDF，在靠近区间两端的地方采用几何加密网格，再对采样角度进行反演，不必在 $(a,T)$ 上保存插值表。

## 附录 C：留出集上选择校正系数 λ

**留出集。** S-FLM 使用的 TinyGSM 数据划分为 TFT 继续训练所读取的训练集以及不读取的 118216 道验证题。作者从验证集中随机选取 768 题，删除与训练集题目文本重复的 111 题，以及无法可靠恢复参考答案的 30 题（两组有 7 题重合），最终保留 634 道题；没有一道与 GSM8K 测试题重复。每题的参考答案通过执行 TinyGSM 提供的参考程序获得，生成程序也按 GSM8K 的方式评分。

**协议。** 对每一种骨干，使用 TFT 检查点、生成种子 1 和 GSM8K 采样协议，尝试 $\lambda\in\{0,0.25,0.5,0.75,1\}$。在 $T\in\{0.4,0.2,0.1\}$ 上取留出集精度平均值，选择分数最高的 $\lambda$；并列时偏向较大的值。结果 S-arch 选 $\lambda=0.5$，DiT 选 $\lambda=0.25$，在所有温度下共享。

**图 6：** 634 道留出 TinyGSM 题的 BCT-L 参数选择。细线表示各选择温度下的精度，粗线为三温度平均值，虚线标记选中的 $\lambda$。$\lambda=0$ 表示无贝叶斯校正，$\lambda=1$ 表示完整校正。

**表 2：** 634 道留出题中各温度下的正确题数，以及三温度平均准确率（%）。

| λ | S-arch T=.4 | T=.2 | T=.1 | 均值 % | DiT T=.4 | T=.2 | T=.1 | 均值 % | DiT 500步均值 % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 | 279 | 285 | 282 | 44.48 | 271 | 278 | 287 | 43.95 | 42.27 |
| 0.25 | 279 | 292 | 290 | 45.27 | 278 | 295 | 316 | **46.74** | **48.74** |
| 0.5 | 283 | 304 | 303 | **46.79** | 281 | 299 | 295 | 46.00 | 48.32 |
| 0.75 | 284 | 305 | 295 | 46.48 | 282 | 295 | 257 | 43.85 | 45.79 |
| 1 | 286 | 300 | 289 | 46.00 | 279 | 279 | 181 | 38.85 | 43.22 |

最后一列为训练 500 步后的 DiT TFT 检查点，不用于参数选择。

## 附录 D：S-arch 上的 Pass@K

本附录给出正文第 4.3 节的设置和完整数值。

**设置。** 在相同 8 个温度上，比较采用标准温度调节的 Cont. 与采用 BCT-L（$\lambda=0.5$）的 TFT。检查点、采样器、提示词和评分器与表 1 相同。每次采样器为每道题生成一次，因此总计 8 次生成来自种子 $1+10j$，$j=0,\ldots,7$；前三个种子与表 1 相同，并且生成结果完全一致。

如果某道题在 $n=8$ 次生成中有 $c$ 次正确，使用无偏估计量

$$
\operatorname{Pass@}K=
1-\frac{\binom{n-c}{K}}{\binom nK}
$$

并在 1319 道题上平均。置信区间通过对题目进行 10000 次 bootstrap 重采样获得；方法间差异使用配对 bootstrap。

**表 3：** GSM8K 的 Pass@K（%），每题生成八次，S-arch，1319 题。

| T | Cont. @1 | @2 | @4 | @8 | BCT-L @1 | @2 | @4 | @8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 12.3 | 19.6 | 28.3 | 37.5 | 12.7 | 20.2 | 29.0 | 37.7 |
| .8 | 14.4 | 22.5 | 32.1 | 42.0 | 16.5 | 25.1 | 34.7 | 44.5 |
| .6 | 15.8 | 24.3 | 34.1 | 44.5 | 20.2 | 29.8 | 40.3 | 51.3 |
| .5 | 16.9 | 25.8 | 36.0 | 46.8 | 21.8 | 31.3 | 41.2 | 51.1 |
| .4 | 17.4 | 26.3 | 36.7 | 47.5 | 23.3 | 32.9 | 42.8 | 52.5 |
| .3 | 17.6 | 26.7 | 36.9 | 47.3 | 24.4 | 33.7 | 43.2 | 52.5 |
| .2 | 17.7 | 26.6 | 36.6 | 47.2 | 25.3 | 34.5 | 43.4 | 51.9 |
| .1 | 17.8 | 26.8 | 37.0 | 47.5 | 27.1 | 35.7 | 43.9 | 51.1 |

Pass@1 是 8 次生成的单次准确率均值，与表 1 的 3 种子均值相差不超过 0.6 个百分点。

对于每个 $T<1$ 和 $K\le8$，BCT-L 减去标准温度调节的配对置信区间均严格大于零。在 $T=0.1$ 时，Pass@1 的差距为 9.2 [8.1,10.3] 个百分点，Pass@8 的差距为 3.6 [1.4,5.8] 个百分点。8 次生成中至少一次答对的题目数：BCT-L 在 $T=0.3$ 和 $0.1$ 时分别为 693、674 题；标准温度调节分别为 624、627 题。

## 附录 E：离散扩散基线上的标准温度缩放

直接对 Deschenaux 与 Gulcehre（2026）公开的 MDLM 和 Duo TinyGSM 检查点扫描温度，不重新训练或调参。两者沿用公开版祖先采样器：每步将去噪器 logits 除以 $T$ 后做 Softmax，再把温度化的干净 token 分布送入不变的逆向转移。MDLM 使用吸收态，Duo 使用均匀状态。在 $T=1$ 时，与原始采样器完全相同（在 32 步设置下，两种模型的 1319 道生成程序均一致）。实验使用 1024 步、种子 1，并沿用第 4.1 节 GSM8K 协议；S-FLM 使用种子 1 时标准温度调节的结果。

**图 7：** MDLM、Duo 与 S-FLM 两种骨干上，标准温度缩放对 GSM8K 精度的影响（NFE=1024，种子 1）。

**表 4：** 准确率（%）及括号内正确题数，全部 1319 题。

| T | MDLM | Duo | S-FLM S-arch | S-FLM DiT |
|---|---:|---:|---:|---:|
| 1 | 15.0 (198) | 18.6 (245) | 13.0 (172) | 11.7 (154) |
| .8 | 22.5 (297) | 23.0 (304) | 15.0 (198) | 13.9 (183) |
| .6 | 28.5 (376) | 28.3 (373) | 15.8 (208) | 16.3 (215) |
| .5 | 29.3 (386) | 29.5 (389) | 16.5 (218) | 17.3 (228) |
| .4 | 30.2 (398) | 32.1 (423) | 17.5 (231) | 17.0 (224) |
| .3 | 32.6 (430) | 34.0 (448) | 18.0 (238) | 16.9 (223) |
| .2 | 33.7 (445) | 35.3 (465) | 18.0 (237) | 17.1 (226) |
| .1 | 32.7 (431) | 36.2 (477) | 17.3 (228) | 16.9 (223) |

在 $T=0.1$ 时，MDLM 和 Duo 分别答对 32.7% 与 36.2%，与既有文献报告的约 33% 和 36% 一致；在 $T=1$ 时，本文得到 15.0% 与 18.6%，对照文献报告的 18.0% 与 17.2%。

## 附录 F：Sudoku-Hard

**任务。** 不做改动地使用 S-FLM 的 Sudoku-Hard 任务和题目生成器。每道题包含 30 个给定数字和唯一解（以解计数器核验）；48000 道训练题与 2000 道测试题之间既没有重复题目，也没有重复解。一个序列由题目及其解组成，二者均表示为有行分隔符的 81 位数字，词表共 12 个 token。采样时题目作为固定前缀，生成解与参考解完全一致才算成功。

**模型和训练。** 沿用发布版 S-FLM 数独训练配方：DiT 去噪器具有 8 个 block，隐藏维度 512，测地线条件桥配合截断自适应噪声日程，在单 GPU 上使用批次大小 256 训练 20000 步；AdamW 优化器在 warmup 后保持 $3\times10^{-4}$ 学习率，EMA 衰减率 0.9999，训练种子为 1。作者确认其代码在该配方上对发布代码实现逐位复现（1200 次更新后的权重、EMA 权重和优化器状态）。得到的模型称为基础检查点。Cont. 与 TFT 在此基础上恢复全部训练状态，再继续训练 2000 步；TFT 使用正文第 4.1 节的温度条件化设置。

**评估。** 采用发布版数独采样器，180 次函数评估、精确速度、argmax 解码、EMA 权重，单 GPU 每批处理 64 道题，生成种子为 1、11、21。除温度和 BCT 规则外，其他设置不变；给定随机种子时，所有采样器均使用相同初始噪声。在 $T=1$ 时，免训练变体只存在数值浮点差异，每个种子最多改变两道题的判定。

**选择 $\lambda$。** 使用同一个题目生成器、不同随机种子构建另外 2000 道互不重叠的留出题，按照附录 C 的协议选择。留出精度在所有选择温度下均随 $\lambda$ 增大，因此取 $\lambda=1$。

**表 5：** Sudoku-Hard 精确求解率（%），三个随机种子均值 ± 标准差，2000 测试题，NFE=180。

| T | 基础标准 | 基础 BCT-E | 基础 BCT-P | Cont. 标准 | Cont. BCT-E | Cont. BCT-P | TFT BCT-L |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 42.9±1.5 | 42.9±1.6 | 42.9±1.5 | 41.7±1.2 | 41.7±1.2 | 41.7±1.2 | 41.7±1.1 |
| .8 | 42.6±1.6 | 43.7±1.4 | 43.6±1.0 | 41.6±1.2 | 42.6±1.2 | 42.4±1.0 | 42.7±0.7 |
| .6 | 42.3±1.3 | 44.1±1.2 | 44.2±1.1 | 41.4±1.1 | 43.1±1.0 | 42.7±1.2 | 44.3±1.2 |
| .5 | 42.2±1.3 | 44.4±1.3 | 44.4±1.2 | 41.3±1.0 | 43.3±1.2 | 43.0±0.8 | 45.1±1.3 |
| .4 | 42.1±1.2 | 44.8±1.4 | 44.8±1.1 | 41.2±1.0 | 43.5±1.2 | 43.2±0.5 | 45.6±1.3 |
| .3 | 42.0±1.2 | 45.0±1.4 | 44.7±0.9 | 41.2±1.0 | 43.7±1.2 | 43.3±0.5 | 45.9±1.1 |
| .2 | 41.9±1.3 | 45.2±1.4 | 44.8±0.4 | 41.2±1.0 | 44.0±1.2 | 43.6±0.1 | 46.4±1.1 |
| .1 | 41.7±1.3 | 45.5±1.4 | 44.9±0.4 | 41.0±1.0 | 44.2±1.4 | 43.7±0.5 | 46.8±1.2 |

**表 6：** BCT-L 在 2000 道留出数独题上的 $\lambda$ 选择（生成种子 1，NFE=180）。未使用测试题。

| λ | T=.4 | T=.2 | T=.1 | 均值 |
|---|---:|---:|---:|---:|
| 0 | 41.8 | 40.8 | 40.1 | 40.9 |
| .25 | 42.8 | 43.5 | 43.3 | 43.2 |
| .5 | 44.0 | 44.5 | 44.9 | 44.5 |
| .75 | 44.9 | 45.4 | 46.9 | 45.7 |
| 1 | **45.6** | **46.3** | **47.5** | **46.5** |

## 附录 G：用于 von Mises–Fisher 流的 BCT

这里给出第 4.5 节的实现与评估细节。SFCD 将学习的 token 嵌入保持在单位球面，但采用浓度随时间增加、满足 $\kappa_0=0$ 的 vMF 条件桥 $q_t(\mathbf z\mid x)=\operatorname{vMF}(\mathbf e_x,\kappa_t)$。采样器在发布版所采用的时间重参数化网格上积分后验诱导速度。作者使用训练 250000 步的公开 TinyGSM 检查点，保留原架构、时间变换和采样器，只修改速度。

**vMF 桥的温度调节。** 温度化条件桥为 $\operatorname{vMF}(\mathbf e_x,\kappa_t/T)$，归一化因子不依赖 $x$，故 BCT-P 与标准温度调节具有相同的后验权重。原始条件速度可写为 $\mathbf u_t(\mathbf z\mid x)=\dot\kappa_t\mathbf V_{\kappa_t}(\mathbf z\mid x)$，其中 $\mathbf V_\kappa$ 在浓度增加时输运 vMF 分布。于是温度化条件速度为

$$
\mathbf u_{t,T}(\mathbf z\mid x)=
\frac{\dot\kappa_t}{T}
\mathbf V_{\kappa_t/T}(\mathbf z\mid x). \tag{26}
$$

即把发布版速度在浓度 $\kappa_t/T$ 处求值，并使浓度以原来的 $1/T$ 倍速度增加。BCT-P 与 BCT-L 在原发布版的时间变换网格上积分该速度。BCT-E 保留原始桥和动力学，在温度化 logits 中加入 $(1-\beta)\kappa_t\langle\mathbf e_x,\mathbf z\rangle$；在 $T=1$ 时所有变体都退化到原发布版采样器。

**TFT 与 BCT-L。** 网络输出剩余 logits $a_{\theta,x}$，后验为 $\operatorname{softmax}(a_{\theta,x}+g_x)$，其中解析项 $g_x=(\kappa_t/T)\langle\mathbf e_x,\mathbf z\rangle$。训练使用式（6）的交叉熵，温度通过 $\kappa_t/(T\kappa_{\max})$ 输入网络。式（9）的 BCT-L logits 化为 $\ell_x=\beta a_{\theta,x}+[\beta+\lambda(1-\beta)]g_x$。

**继续训练与评估。** Cont. 和 TFT 都从发布版检查点再训练 20000 步，前者沿用原配方（将时间变换固定），后者使用正文第 4.1 节的温度分布，并从 $q_{t,T}$ 抽取潜状态。两者使用继续训练期间积累的 EMA（衰减率 0.9999）；原始检查点仍使用发布版 EMA 权重。评估使用 SFCD 的 GSM8K 设置（1319 题、考虑时间变换的 ODE 采样器、NFE=1024、批次 32、原评分器），生成种子为 42–46。

**选择 $\lambda$。** 使用 1024 道未参与继续训练、也不与 GSM8K 测试集重合的 TinyGSM 验证题。$\lambda=0,0.25,0.5,0.75,1$ 对应平均精度分别为 51.92%、53.19%、53.87%、54.07%、54.39%，故选 $\lambda=1$。

**表 7：** SFCD 的 GSM8K 准确率（%），5 次生成的均值 ± 样本标准差，1319 题，NFE=1024。

| T | 发布标准 | 发布 BCT-E | 发布 BCT-P | Cont. 标准 | Cont. BCT-E | Cont. BCT-P | TFT BCT-L |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 23.55±.79 | 23.55±.79 | 23.55±.79 | 23.59±.71 | 23.59±.71 | 23.59±.71 | 21.55±.86 |
| .8 | 27.79±.83 | 29.19±1.43 | 29.39±.48 | 27.99±.27 | 29.80±.75 | 29.28±.74 | 28.19±.97 |
| .6 | 30.34±.63 | 31.71±.64 | 31.63±.77 | 30.61±.77 | 31.54±.78 | 32.43±.45 | 32.05±.47 |
| .5 | 30.80±.80 | 31.40±.62 | 32.36±1.03 | 31.80±.77 | 31.21±.47 | 33.28±.39 | 33.54±.63 |
| .4 | 31.19±.99 | 28.26±.52 | 33.39±.90 | 32.57±.83 | 26.37±.32 | 33.93±.58 | 34.33±.97 |
| .3 | 31.75±.91 | 15.30±.67 | 33.63±.69 | 32.62±.61 | 2.93±.25 | 33.54±.75 | **34.47±.55** |
| .2 | 31.71±.40 | .08±.11 | 32.05±.67 | 32.16±.40 | .02±.03 | 32.24±.28 | 33.24±1.12 |
| .1 | 30.99±.55 | 0±0 | 26.63±.85 | 31.25±.42 | 0±0 | 28.49±.54 | 31.68±.53 |

> **附录校对说明：** 附录 A–G 的主要文字、公式（19）–（26）及表 2–7 已补入。原论文参考文献已收录；正文表 1 已全部展开，少数数学公式排版仍需对照原 PDF 检查。
