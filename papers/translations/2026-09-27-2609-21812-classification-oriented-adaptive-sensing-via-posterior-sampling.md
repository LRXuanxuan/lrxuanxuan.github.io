---
layout: page
title: "面向分类的贝叶斯后验采样自适应感知｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-21812-classification-oriented-adaptive-sensing-via-posterior-sampling/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/7f473bb5126bc0a3/) · [原文 arXiv](https://arxiv.org/abs/2609.21812) · [全部目录](/papers/catalog/)

# 面向分类的贝叶斯后验采样自适应感知

**原题：** Classification-oriented adaptive sensing via posterior sampling  
**作者：** Andriy Enttsel、Maxime Rousselot、Vincent Corlay（三菱电机欧洲研发中心，Mitsubishi Electric R&D Centre Europe）。原文该版本未给出作者邮箱。  
**版本：** arXiv:2609.21812v1（eess.SP），v1 日期 2026 年 9 月 18 日；原文 6 页。本页对应论文库 2026-09-27 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—VI 节、图 1—3 图注、附录（式（17）—（20）的推导）、参考文献 [1]—[26]（英文原条目）。原文为 6 页会议/短文格式，全文无编号表格；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文疑点）：** 原文缩写在本页首次出现时保留英文：compressed sensing（压缩感知）、AdaSense（基于扩散后验采样的自适应感知）、GMM（Gaussian mixture model，高斯混合模型）、MPPCA（mixture of probabilistic principal component analyzers，概率主成分分析混合）、PSNR（peak signal-to-noise ratio，峰值信噪比）、LDA（linear discriminant analysis，线性判别分析）、DDRM（denoising diffusion restoration models）、DDIM（denoising diffusion implicit models）。原文有两处拼写笔误：§III 中「addressed implicitely」应为「implicitly」、式（12）后「M_max guaranties termination」应为「guarantees termination」，本页按原意译为「隐式地处理」「保证终止」并在此加注。

## 摘要

扩散模型的最新进展使得通过后验采样实现高性能、逐实例自适应的压缩感知成为可能，且无需训练任务特定策略。现有方法通过最大化后验信号总方差来选择感知探针，因而主要是重构驱动的。我们提出一种分类驱动的扩展，其动机来自类条件高斯混合模型的闭式后验协方差——该协方差可分解为类内不确定性与类间不确定性。利用经校准的软分类器输出，我们从扩散后验样本中估计这两项不确定性，并提出一种面向分类的准则，用于在未测量子空间中选择主导感知方向。在 MNIST 与 CIFAR-10 上的实验把所得方法的分类精度、测量代价与重构质量同面向重构的对应方法进行比较。结果识别出语义后验不确定性带来更有利的分类—测量折中的情形，并量化了相应的重构代价。

**关键词：** 自适应压缩感知；扩散后验采样；任务驱动感知；主动分类。

## I. 引言

压缩感知从少于信号环境维数的线性测量中恢复稀疏信号 [1]、[2]。在经典压缩感知中，感知算子在观测未知信号之前即固定，且常从一个通用随机集合中抽取。

更具信息量的感知设计可通过利用统计或物理先验知识、按序列自适应于已观测信号、或面向下游任务而非仅重构来提高性能。

例如，基于「丰富度」（rakeness）的感知利用总体层面的二阶信号统计量来提升被捕获的信号能量，同时保持测量的多样性 [3]。物理知识同样可以指导测量设计，例如在基于振动的结构健康监测中利用模态信息与信号自适应表示 [4]、[5]。在这两种情形下，感知算子利用了信号模型，但一般并不针对单个测试实例的测量而自适应。

面向任务的压缩感知则针对推断来设计感知算子，使检测、分类、估计或滤波可直接由压缩观测完成 [6]。例如，smashed filter 用单像素相机演示了压缩域目标分类的这一原理 [7]。更一般地，这些方法表明为重构优化的测量对分类而言可能是次优的；但它们通常依赖固定的感知算子，而不是让采集过程自适应于剩余观测特有的不确定性。

高斯混合模型（GMM）提供了一个可处理的框架，把统计先验信息、面向任务的测量设计与序列自适应结合起来。测量可被选择用于在可选的重构之前判别可能的混合分量 [8]–[11]。然而，GMM 对复杂信号分布可能过于受限。

深度神经网络与扩散模型用更丰富的学习信号模型替代了受限的参数先验 [12]、[13]。面向 MRI 与 ECG 的增量式方案配备了学习的性能预测器 [14]、[15]，使采集长度自适应于已获得的信息；但这些方法把固定的一组方向发送给剩余的不确定性。AdaSense [16] 则通过从测量条件化的扩散后验中采样、选择未测量方向中后验方差最大者、并在每次采集后重采样，实现序列自适应图像感知。该框架还被扩展到有损压缩 [17] 与语义通信 [18]。然而，最大化后验总方差仍然是面向重构的，可能优先关注与剩余类别歧义关系弱的变化来源。

受该局限的启发，我们引入 AdaSense 的一种面向分类的扩展，把感知导向与剩余类别决策相关的不确定性。一个预训练分类器为扩散后验样本分配软类别概率，使我们能够从 GMM 分析中估计类间协方差的样本近似。下一个探针在投影到未测量子空间后，沿该语义协方差的主导方向选择。每次采集后，后验被重采样、语义协方差被重新计算，使感知方向能自适应于不断变化的类别歧义。同一组后验预测概率定义了一个基于置信度的停止规则，从而产生依赖于图像的测量预算。

本文贡献有三方面：i）对 AdaSense 的一个 GMM 分析，说明为什么最大化后验总方差对分类而言可能是次优的；ii）一种面向分类的特化：用软类别分配从扩散后验样本估计语义类间协方差，并把自适应探针设计与基于置信度的停止相结合；iii）在 MNIST 与 CIFAR-10 上的评估，刻画分类精度、测量代价与重构质量之间的折中。

## II. 背景：基于后验采样的面向重构自适应感知

令 $x\in\mathbb R^D$ 表示未知信号。在第 $t$ 个阶段，令

$$
y_t=H_tx+n_t,\qquad n_t\sim\mathcal N\left(0,\sigma_n^2I_t\right),\tag{1}
$$

其中 $y_t\in\mathbb R^t$ 收集迄今已采集的 $t$ 个线性测量，$H_t\in\mathbb R^{t\times D}$ 把对应的感知探针作为行堆叠起来。探针被选为正交归一的，即 $H_tH_t^\top=I_t$。

在每个阶段，从当前信息状态 $(H_t,y_t)$ 中选取一个单位范数探针 $h_{t+1}\in\mathbb R^D$；随后采集相应的标量测量，并把 $h_{t+1}^\top$ 作为 $H_t$ 的新行追加。

在 AdaSense [16] 中，基于扩散的逆求解器从测量条件化的后验中生成样本：

$$
x_t^{(s)}\sim q_\theta(x\,|\,H_t,y_t),\qquad s=1,\dots,S,\tag{2}
$$

其中样本被约束为与已采集测量在假定测量噪声范围内一致，即 $\left\|H_tx_t^{(s)}-y_t\right\|_2\le\epsilon_t$ [19]。经验样本后验均值与无偏协方差为

$$
\hat\mu_t=\frac1S\sum_{s=1}^{S}x_t^{(s)},\qquad
\hat\Sigma_t=\frac{1}{S-1}\sum_{s=1}^{S}\tilde x_t^{(s)}\tilde x_t^{(s)\top},\tag{3}
$$

其中 $\tilde x_t^{(s)}=x_t^{(s)}-\hat\mu_t$。AdaSense 选择未测量子空间中方差最大的方向作为下一个探针：

$$
h_{t+1}^{\mathrm{AS}}=\arg\max_{\|h\|_2=1,\ H_th=0}h^\top\hat\Sigma_th.\tag{4}
$$

约束 $H_th=0$ 防止再次选择已测量过的方向。由于 $H_t$ 的行正交归一，$P_t=I-H_t^\top H_t$ 是到剩余感知子空间的正交投影算子。因此（4）由 $P_t\hat\Sigma_tP_t$ 的主导特征向量求解，它对应剩余后验图像不确定性最大的方向¹。每次采集后，扩散后验用更新后的状态 $(H_{t+1},y_{t+1})$ 重采样。在标准的面向重构设定中，该过程持续到达到预设的最大测量预算 $M_{\max}$，最终后验均值 $\hat\mu_{M_{\max}}$ 即为信号的 MMSE 估计重构。该方法总结于图 1（蓝色）。

> **脚注 1（原文）：** 更准确地说，原始 AdaSense 表述假设 $\epsilon_t=0$ 且测量严格一致，即 $H_tx_t^{(s)}=y_t$，于是下一个探针直接由 $h_{t+1}=\mathrm{eigvec}_{\max}(\hat\Sigma_t)$ 得到。对低噪声测量或近似测量一致的情形，我们改为引入 $P_t$，以去除沿先前已测方向的残余方差。

## III. 高斯混合后验下的解析特化

为揭示重构不确定性与分类不确定性之间的区别，我们在一个可处理的 GMM 先验下研究 AdaSense：

$$
p(x)=\sum_{c=1}^{K}w_c\,\mathcal N(x;\mu_c,\Sigma_c),\qquad w_c\ge0,\quad\sum_{c=1}^{K}w_c=1,\tag{5}
$$

其中 $w_c$、$\mu_c$、$\Sigma_c$ 分别表示分量 $c$ 的混合权重、均值向量与协方差矩阵。假设测量噪声为协方差 $R_t$ 的高斯噪声，可定义测量协方差 $G_{c,t}=H_t\Sigma_cH_t^\top+R_t$。将各分量对 $y_t$ 做条件化，得

$$
w_{c,t}=\frac{w_c\,\mathcal N\left(y_t;H_t\mu_c,G_{c,t}\right)}{\sum_{j=1}^{K}w_j\,\mathcal N\left(y_t;H_t\mu_j,G_{j,t}\right)},\tag{6}
$$

$$
\mu_{c|t}=\mu_c+\Sigma_cH_t^\top G_{c,t}^{-1}\left(y_t-H_t\mu_c\right),\tag{7}
$$

$$
\Sigma_{c|t}=\Sigma_c-\Sigma_cH_t^\top G_{c,t}^{-1}H_t\Sigma_c.\tag{8}
$$

后验均值为 $\mu_t=\sum_{c=1}^{K}w_{c,t}\mu_{c|t}$。由全协方差定律，后验协方差分解为

$$
\Sigma_t^{\mathrm{post}}=\underbrace{\sum_{c=1}^{K}w_{c,t}\Sigma_{c|t}}_{W_t}
+\underbrace{\sum_{c=1}^{K}w_{c,t}\left(\mu_{c|t}-\mu_t\right)\left(\mu_{c|t}-\mu_t\right)^\top}_{B_t}.\tag{9}
$$

（6）—（8）的证明见附录。$(\mu_t,\Sigma_t^{\mathrm{post}})$ 即（3）中基于样本量的闭式对应物。因此，把（4）中的 $\hat\Sigma_t$ 替换为 $\Sigma_t^{\mathrm{post}}$，就得到面向重构的后验协方差感知的一个无采样 GMM 特化；后验均值 $\mu_t$ 是对应的 MMSE 估计量。

当混合分量表示语义类别²时，（9）的分解把两种不同的不确定性来源分开。类内协方差 $W_t$ 刻画以类别为条件的残余信号变化，包括内在类别变化、干扰因素与重构细节；相反，类间协方差 $B_t$ 度量当前各类别条件后验均值之间的分歧。因此，类别模式歧义已经在软意义上被隐式地处理，但最大化 $h^\top(W_t+B_t)h$ 仍可能偏好那些信号方差很大而判别价值有限的方向。

值得注意的是，先前的基于 GMM 的方法利用了不同的后验量：Duarte-Carvajalino 等人 [10] 使用已识别分量的协方差 $\Sigma_{c|t}$，Carson 等人 [9] 对混合分布或其主导分量 $\Sigma_{c|t}$ 使用信息论准则，Braun 等人 [11] 在低 SNR 时使用后验加权的类内协方差 $W_t$。我们对 GMM 的使用是互补的：它给出后验协方差感知的一个解析特化，并强调类间项 $B_t$ 对重构同样重要。

> **脚注 2（原文）：** 对仅有重构的设定，GMM 可以无需标签地拟合。

### A. 面向分类的 GMM 采集

（9）的分解把每个类别内剩余的 后验不确定性同类别之间歧义所诱导的不确定性分开。这提示我们把面向重构的 GMM 感知所使用的总协方差替换为其类判别分量。类间（BC）准则为

$$
h_{t+1}^{\mathrm{BC}}=\arg\max_{\|h\|_2=1,\ H_th=0}h^\top B_th,\tag{10}
$$

其解为 $P_tB_tP_t$ 的主导特征向量。因此它瞄准的是那些合理的类别条件后验均值分歧最大的未观测方向。类内变异性可作为归一化项重新引入，以惩罚类条件不确定性高的方向。由此得到受 LDA 启发的正则化 Fisher（RF）准则 [20]：

$$
h_{t+1}^{\mathrm{RF}}=\arg\max_{\|h\|_2=1,\ H_th=0}\frac{h^\top B_th}{h^\top\left[W_t+(\gamma+\sigma_n^2)I\right]h},\qquad\gamma>0,\tag{11}
$$

它可在当前剩余子空间中作为广义特征值问题求解。因此，三种准则的差别只在于它们优先考虑哪种不确定性：面向重构的感知使用 $W_t+B_t$，（10）隔离出 $B_t$，而（11）用类内变异性对类间分歧做归一化。

GMM 的类别责任（responsibility）还提供了分类置信度度量，并支持依赖于信号的感知预算。在 GMM 正确设定的情况下，$w_{c,t}=p(C=c|y_t)$ 即类别 $c$ 的精确后验概率。对 MAP 决策 $\hat c_t=\arg\max_cw_{c,t}$，有 $\Pr(C=\hat c_t|y_t)=\max_cw_{c,t}$，即最大责任度就是 MAP 预测正确的条件概率。对测量分布取平均即得 MAP 分类精度 $\mathbb E_{y_t}[\max_cw_{c,t}]=\Pr(C=\hat C_t)$。该恒等式为如下依赖于信号的停止规则与最终预测提供了概率基础：

$$
t^\star=\min\left\{t:\ \max_cw_{c,t}\ge\tau_{\mathrm{stop}}\ \text{或}\ m_t\ge M_{\max}\right\},\tag{12}
$$

$$
\hat c=\arg\max_cw_{c,t^\star}.\tag{13}
$$

阈值 $\tau_{\mathrm{stop}}$ 规定期望的后验置信度，而 $M_{\max}$ 保证终止。

## IV. 面向分类的后验采样自适应感知

现在我们（9）—（13）中的 GMM 量转换到扩散后验采样设定。对（2）中的每个扩散后验样本，我们用一个经校准的分类器产生软类别责任向量：

$$
w_t^{(s)}=\mathrm{softmax}\left(z_\phi\left(x_t^{(s)}\right)/T\right),\qquad \bar w_t=\frac1S\sum_{s=1}^{S}w_t^{(s)},\tag{14}
$$

其中 $z_\phi(\cdot)$ 表示分类器 logits，$T$ 通过在独立校准集上做温度缩放（temperature scaling）[21] 拟合得到。我们用 $w_{c,t}^{(s)}$ 与 $\bar w_{c,t}$ 分别表示 $w_t^{(s)}$ 与 $\bar w_t$ 的第 $c$ 个分量。

与解析的 GMM 责任度不同，$\bar w_{c,t}$ 结合了近似扩散后验、有限 Monte Carlo 样本池与一个学习分类器，因而未必等于真实后验类别概率。当把 $\max_c\bar w_{c,t}$ 用作停止的置信度分数时，校准因而很重要。于是，在基于扩散的流水线中，校准估计 $\bar w_{c,t}$ 在停止与预测规则（12）—（13）中替换解析责任度 $w_{c,t}$；阈值 $\tau_{\mathrm{stop}}$ 随后通过在独立验证集上的经验扫描选取，以达到目标分类精度。

然后我们估计软类别条件后验均值与类间协方差：

$$
\hat\mu_{c,t}=\frac{\sum_sw_{c,t}^{(s)}x_t^{(s)}}{\sum_sw_{c,t}^{(s)}},\qquad
\hat B_t=\frac{1}{S-1}\sum_{s=1}^{S}\sum_{c=1}^{K}w_{c,t}^{(s)}\hat\delta_{c,t}\hat\delta_{c,t}^\top,\tag{15}
$$

其中 $\hat\delta_{c,t}=\hat\mu_{c,t}-\hat\mu_t$。因此，无需假设扩散后验为高斯，$\hat B_t$ 即可从软标签扩散样本中估计（9）的类间项。类内项的估计为

$$
\hat W_t=\frac{1}{S-1}\sum_{s=1}^{S}\sum_{c=1}^{K}w_{c,t}^{(s)}\left(x_t^{(s)}-\hat\mu_{c,t}\right)\left(x_t^{(s)}-\hat\mu_{c,t}\right)^\top,\tag{16}
$$

于是 $\hat\Sigma_t=\hat W_t+\hat B_t$（定义见（3））对应（9）。扩散策略直接由 GMM 规则得到：具体地，在（10）与（11）中用 $(\hat B_t,\hat W_t)$ 替换 $(B_t,W_t)$，在（13）中用校准估计 $\bar w_{c,t}$ 替换 $w_{c,t}$。子空间约束与求解过程不变，且不引入额外的优化问题。

在每个阶段，用大小为 $S$ 的一个后验样本池估计类别责任与协方差项、评估停止条件、设计下一个探针。采集后，后验在 $(H_{t+1},y_{t+1})$ 下重采样，全部估计被重新计算。因此，感知方向与依赖于信号的测量预算都自适应于剩余的 后验类别歧义。完整方法总结于图 1。

## V. 数值证据

### A. 实验设置

我们在 MNIST [22] 与 CIFAR-10 [23] 数据集上评估所提框架，图像缩放至 $[-1,1]$。我们把解析 GMM 实例化为按标签定义的 MPPCA [24]，每个类别使用一个低秩 PPCA 分量，秩对 MNIST 取 $r=64$、对 CIFAR-10 取 $r=256$。对 MNIST 上的扩散后验采样，我们沿用 AdaSense 设置并使用 DDRM [19] 逆求解器；对 CIFAR-10，我们使用预训练的 `google/ddpm-cifar10-32` 模型 [13] 并采用投影条件化重构 [25]。两种情形均用 DDIM [26] 采样，逆扩散步数对 MNIST 为 $L=20$、对 CIFAR-10 为 $L=25$。MNIST 使用方差 $\sigma_n^2=0.01$ 的加性高斯白噪声测量，即 $R_t=0.01I$；CIFAR-10 实验无噪声（$R_t=0$）。岭正则化参数 $\gamma$ 设为 $0.001$。

我们比较基于扩散的 AdaSense（Diff-AS）、类间（Diff-BC）与正则化 Fisher（Diff-RF）采集，使用 $S=32$ 个后验样本；MPPCA 变体使用精确后验矩。所有方法在相同的 1000 张测试图像上评估，MNIST 取 $M_{\max}=32$ 次测量、CIFAR-10 取 $M_{\max}=256$。分类使用预训练的 `resnet56` CIFAR-10 分类器，以及在 MNIST 上训练、测试精度达 99.2% 的卷积分类器。分类器概率通过温度缩放 [21] 校准，温度参数 $T$ 在由 2000 张干净图像构成的独立集上拟合。

### B. 结果与讨论

图 2 比较分别使用基于扩散的后验与解析 MPPCA 后验的 AS、BC 与 RF。分类精度与后验均值重构 PSNR 被报告为停止时平均测量数的函数。

在 MNIST 上（图 2(a)—(b)），基于扩散的 Diff-BC 平均用 5.5 次测量即达到约 95% 的精度，而 Diff-AS 需 6.5 次，测量代价降低约 15%（图 2(a)）。该优势在接近饱和时减小。解析 MPPCA 策略在中等目标精度下更高效，用更少测量即达到约 93% 的精度，但其饱和点低于基于扩散的策略。如预期，AS 取得最高 PSNR，而 BC 以适度的 PSNR 下降换取更高的分类效率（图 2(b)）。

在 CIFAR-10 上（图 2(c)—(d)），MPPCA 策略在明显更低的精度处饱和，这可能是因为每个类别只有一个低秩分量，无法刻画复杂的类条件分布。在 100—130 的平均测量范围内，Diff-BC 比 Diff-AS 高约 3—4 个百分点（图 2(c)）。另一方面，达到约 85% 的精度，Diff-BC 约需 110 次测量、Diff-AS 约需 140 次，相当于降低 20%；在这一范围内，BC 仅带来 0.5—0.8 dB 的 PSNR 代价（图 2(d)）。

在解析 MPPCA 后验下，RF 一致优于 BC；该排序在扩散设定下并不保持，因为 RF 依赖类内协方差的一个可能不稳定的有限样本估计。增大 $\gamma$ 会减小该估计的影响，RF 逐步趋近 BC。总体而言，后验总协方差仍更适合重构，而类间协方差提供更有利的分类—测量折中。

为评估统计自适应与图像特定自适应的收益，我们还考虑两个固定探针基线，同时保持流水线其余部分不变，因此只有停止时刻依赖于图像。随机探针（Diff-Random，橙线）不利用任何数据集统计量，取得的精度与 PSNR 有限。PCA 探针（Diff-PCA，灰线）则捕捉从训练集学到的二阶统计量，在自适应探针估计受小后验样本池限制的低测量预算下具有竞争力。随着采集推进，自适应方法通常更有效，不过即便在高精度 CIFAR-10 区间，Diff-PCA 仍与 Diff-AS 接近。这一结果提示一种潜在混合策略：先使用固定的一批 PCA 探针，再切换为图像自适应采集。

最后，图 3 表明把后验样本数减至 $S=8$ 相比 $S=32$ 会降低分类—测量折中。在 MNIST 上，Diff-BC 的性能接近 Diff-AS，而在 CIFAR-10 上 BC 仍保持相当的性能提升。

## VI. 结论

我们引入了扩散后验自适应感知的一种面向分类的扩展。一个 GMM 分析把后验协方差分解为类内与类间分量，表明按总方差采集可能把测量分配给了判别价值有限的残余变化。我们从分类器加权的扩散后验样本中估计类间协方差，并用其主导剩余方向作为自适应探针。在 MNIST 与 CIFAR-10 上的实验显示出更好的分类—测量折中，同时重构 PSNR 只适度下降。未来工作将考虑直接的期望 Bayes 风险下降、用于更快后验推断的 PCA/GMM—扩散混合方法，以及向其他任务的扩展。

## 图注与表注

**图 1（原文第 3 页）：** 基于后验采样的自适应感知：面向重构的流程（蓝色）与面向分类的流程（红色），共享模块以绿色表示。流程为：扩散后验采样 → 软分类器 → 按式（10）或（11）选择语义探针 / 按式（4）选择重构探针 → 按式（12）判定停止；判定为是则输出，否则继续采集并重采样。

**图 2（原文第 4 页）：** 在自适应停止时刻的分类精度与重构 PSNR。上排为 MNIST，下排为 CIFAR-10；(a)(c) 为精度随停止时平均测量数的变化，(b)(d) 为 PSNR 随停止时平均测量数的变化。图例方法：MPPCA-AS、MPPCA-BC、MPPCA-RF、Diff-AS、Diff-BC、Diff-RF、Diff-PCA、Diff-Random。

**图 3（原文第 5 页）：** 图 2 高精度区域中的后验样本数消融。横轴为停止时平均测量数，纵轴为精度（%）；MNIST 约 90—100%、CIFAR-10 约 70—90% 区间；对比 Diff-AS、Diff-BC、Diff-PCA 在 $S=8$ 与 $S=32$ 下的表现。

**表注：** 原文全文无编号表格（仅图 1—3），故本页无需转录表格。

## 附录

### 附录：式（6）—（9）的证明

以类别 $c$ 为条件，先验与测量模型为

$$
x\,|\,c\sim\mathcal N(\mu_c,\Sigma_c),\qquad y_t=H_tx+n_t,\qquad n_t\sim\mathcal N(0,R_t),
$$

其中 $n_t$ 与 $x$ 独立。因此，

$$
\mathbb E[y_t\,|\,c]=H_t\mu_c,\qquad \mathrm{Cov}(x,y_t\,|\,c)=\Sigma_cH_t^\top,\tag{17}
$$

$$
\mathrm{Cov}(y_t\,|\,c)=H_t\Sigma_cH_t^\top+R_t=G_{c,t}.\tag{18}
$$

由此可得

$$
\begin{bmatrix}x\\y_t\end{bmatrix}\Big|\,c\ \sim\ \mathcal N\left(\begin{bmatrix}\mu_c\\H_t\mu_c\end{bmatrix},\ \begin{bmatrix}\Sigma_c & \Sigma_cH_t^\top\\ H_t\Sigma_c & G_{c,t}\end{bmatrix}\right).\tag{19}
$$

于是测量的边缘分布为 $p(y_t|c)=\mathcal N(y_t;H_t\mu_c,G_{c,t})$。把该似然与 $p(c)=w_c$ 通过 Bayes 公式结合即得（6）。把标准条件高斯公式应用于（19）即得（7）与（8）。最后，对潜类别变量应用全协方差定律得

$$
\mathrm{Cov}(x\,|\,y_t)=\mathbb E\left[\mathrm{Cov}(x\,|\,y_t,c)\,|\,y_t\right]+\mathrm{Cov}\left(\mathbb E[x\,|\,y_t,c]\,|\,y_t\right).\tag{20}
$$

把 $\mathrm{Cov}(x|y_t,c)=\Sigma_{c|t}$、$\mathbb E[x|y_t,c]=\mu_{c|t}$ 与 $p(c|y_t)=w_{c,t}$ 代入（20）即直接得到（9）。

## 参考文献（英文原书目）

[1] Emmanuel J. Candès, Justin Romberg, and Terence Tao, "Robust uncertainty principles: Exact signal reconstruction from highly incomplete frequency information," IEEE Transactions on Information Theory, vol. 52, no. 2, pp. 489–509, Feb. 2006.
[2] David L. Donoho, "Compressed sensing," IEEE Transactions on Information Theory, vol. 52, no. 4, pp. 1289–1306, Apr. 2006.
[3] Mauro Mangia, Fabio Pareschi, Valerio Cambareri, Riccardo Rovatti, and Gianluca Setti, "Rakeness-based design of low-complexity compressed sensing," IEEE Transactions on Circuits and Systems I: Regular Papers, vol. 64, no. 5, pp. 1201–1213, 2017.
[4] Federica Zonzini, Matteo Zauli, Mauro Mangia, Nicola Testoni, and Luca De Marchi, "Model-assisted compressed sensing for vibration-based structural health monitoring," IEEE Transactions on Industrial Informatics, vol. 17, no. 11, pp. 7338–7347, 2021.
[5] Gabriele Ravaglia, Said Quqa, Andriy Enttsel, Mauro Mangia, Antonio Palermo, and Federica Zonzini, "Adaptive compressed sensing with masked sensing matrices and support estimation-based decoding for structural health monitoring applications," in Proceedings of the 34th European Signal Processing Conference (EUSIPCO), Bruges, Belgium, 2026.
[6] Mark A. Davenport, Petros T. Boufounos, Michael B. Wakin, and Richard G. Baraniuk, "Signal processing with compressive measurements," IEEE Journal of Selected Topics in Signal Processing, vol. 4, no. 2, pp. 445–460, Apr. 2010.
[7] Mark A. Davenport, Marco F. Duarte, Michael B. Wakin, Jason N. Laska, Dharmpal Takhar, Kevin F. Kelly, and Richard G. Baraniuk, "The smashed filter for compressive classification and target recognition," in Proceedings of SPIE Computational Imaging V, 2007, vol. 6498, p. 64980H.
[8] Guoshen Yu and Guillermo Sapiro, "Statistical compressed sensing of Gaussian mixture models," IEEE Transactions on Signal Processing, vol. 59, no. 12, pp. 5842–5858, 2011.
[9] William R. Carson, Minhua Chen, Miguel R. D. Rodrigues, Robert Calderbank, and Lawrence Carin, "Communications-inspired projection design with application to compressive sensing," SIAM Journal on Imaging Sciences, vol. 5, no. 4, pp. 1185–1212, 2012.
[10] Julio M. Duarte-Carvajalino, Guoshen Yu, Lawrence Carin, and Guillermo Sapiro, "Task-driven adaptive statistical compressive sensing of Gaussian mixture models," IEEE Transactions on Signal Processing, vol. 61, no. 3, pp. 585–600, 2013.
[11] Gábor Braun, Sebastian Pokutta, and Yao Xie, "Info-greedy sequential adaptive compressed sensing," IEEE Journal of Selected Topics in Signal Processing, vol. 9, no. 4, pp. 601–611, June 2015.
[12] Johannes Schwab, Stephan Antholzer, and Markus Haltmeier, "Deep null space learning for inverse problems: convergence analysis and rates," Inverse Problems, vol. 35, no. 2, pp. 025008, Jan. 2019.
[13] Jonathan Ho, Ajay Jain, and Pieter Abbeel, "Denoising diffusion probabilistic models," in Advances in Neural Information Processing Systems, 2020, vol. 33, pp. 6840–6851.
[14] A. Marchioni, F. Martinini, L. Manovi, S. Cortesi, R. Rovatti, G. Setti, and M. Mangia, "Adapted compressed sensing with incremental encoder and deep performance predictor for low-power sensor node design," in 2023 IEEE International Instrumentation and Measurement Technology Conference (I2MTC), 2023, pp. 1–6.
[15] Filippo Martinini, Mauro Mangia, Alex Marchioni, Gianluca Setti, and Riccardo Rovatti, "Incremental undersampling MRI acquisition with neural self assessment," Signal Processing, vol. 228, pp. 109746, 2025.
[16] Noam Elata, Tomer Michaeli, and Michael Elad, "Adaptive compressed sensing with diffusion-based posterior sampling," in European Conference on Computer Vision, 2024.
[17] Noam Elata, Tomer Michaeli, and Michael Elad, "PSC: Posterior sampling-based compression," Transactions on Machine Learning Research, 2025.
[18] Bingxuan Xu, Haotian Wu, Xiaodong Xu, and Deniz Gunduz, "Diffusion posterior sampling with channel feedback for adaptive semantic communication," in ICC 2026 - IEEE International Conference on Communications, 2026, pp. 1–6.
[19] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song, "Denoising diffusion restoration models," in Advances in Neural Information Processing Systems, 2022, vol. 35, pp. 23593–23606.
[20] Ronald A. Fisher, "The use of multiple measurements in taxonomic problems," Annals of Eugenics, vol. 7, no. 2, pp. 179–188, 1936.
[21] Chuan Guo, Geoff Pleiss, Yu Sun, and Kilian Q. Weinberger, "On calibration of modern neural networks," in Proceedings of the 34th International Conference on Machine Learning, 2017, pp. 1321–1330.
[22] Yann LeCun, Léon Bottou, Yoshua Bengio, and Patrick Haffner, "Gradient-based learning applied to document recognition," Proceedings of the IEEE, vol. 86, no. 11, pp. 2278–2324, 1998.
[23] Alex Krizhevsky, "Learning multiple layers of features from tiny images," Tech. Rep., University of Toronto, 2009.
[24] Michael E. Tipping and Christopher M. Bishop, "Mixtures of probabilistic principal component analyzers," Neural Computation, vol. 11, no. 2, pp. 443–482, 1999.
[25] Yinhuai Wang, Jiwen Yu, and Jian Zhang, "Zero-shot image restoration using denoising diffusion null-space model," in International Conference on Learning Representations, 2023.
[26] Jiaming Song, Chenlin Meng, and Stefano Ermon, "Denoising diffusion implicit models," in International Conference on Learning Representations, 2021.

**本页范围与校对状态：** 本页覆盖 arXiv:2609.21812v1（eess.SP，2026 年 9 月 18 日）全文 6 页：摘要、第 I—VI 节、图 1—3 图注、附录（式（17）—（20）的证明）、参考文献 [1]—[26]（英文原条目，按原编号保留）。原文为 6 页短文（会议/letter 格式），全文无编号表格，故本页未转录表格；原文无独立编号算法、无定理环境。已加注 2 处原文拼写笔误（「implicitely」「guaranties」，均按原意译出并加注）。校对说明：源文抽取文本含 4 个 NUL 字节导致读取异常，已生成去 NUL 的干净副本 `sources\batch9-2609-21812-clean.txt` 用于核对（未改动原文与站点）；式（14）—（16）及第 IV 节的 $\bar w$（校准估计）记号已用 `render.py` 渲染 PDF 第 3 页并按图核对（抽取文本丢失了上划线，本页按 PDF 用 $\bar w_{c,t}$、$\bar w_t$ 表示校准估计）。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、图内曲线数值均未独立复算/数字化）；图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.21812v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
