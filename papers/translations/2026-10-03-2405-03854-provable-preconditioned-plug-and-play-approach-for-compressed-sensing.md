---
layout: page
title: "压缩感知 MRI 重建的可证明预条件即插即用方法｜中文全文译文"
permalink: /papers/translations/2026-10-03-2405-03854-provable-preconditioned-plug-and-play-approach-for-compressed-sensing/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/6f8346f29fa83d16/) · [原文 arXiv](https://arxiv.org/abs/2405.03854) · [全部目录](/papers/catalog/)

# 压缩感知 MRI 重建的可证明预条件即插即用方法

**原题：** Provable Preconditioned Plug-and-Play Approach for Compressed Sensing MRI Reconstruction  
**作者：** Tao Hong（IEEE 会员）、Xiaojian Xu（IEEE 会员）、Jason Hu（IEEE 学生会员）、Jeffrey A. Fessler（IEEE 会士）  
**单位：** Tao Hong 就职于密歇根大学放射学系（Ann Arbor, MI 48109, USA），部分工作受美国国立卫生研究院（NIH）R01NS112233 项目资助；Xiaojian Xu、Jason Hu 与 Jeffrey A. Fessler 就职于密歇根大学电气与计算机工程系（Ann Arbor, MI 48109, USA）。  
**版本：** arXiv:2405.03854v2（eess.IV），2024 年 10 月 2 日，原文共 20 页（正文 14 页 + 补充材料 6 页）。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–V 节及全部小节、算法 1–3、引理 1、定理 1–2、式 (1)–(15)、附录 A–C（三个证明）、图 1–9 与图 S.1–S.7 图注、表 I–III 与表 S.I–S.II（逐格转写）、参考文献 [1]–[72]（英文原条目）以及补充材料 S.I–S.V 全部按原文结构录入。逐句逐式终校未做。

## 摘要

基于模型的方法在压缩感知（compressed sensing，CS）MRI 重建中起着关键作用。为基于模型的方法找到一个能有效描述目标图像族统计分布的先验至关重要。即插即用（plug-and-play，PnP）是一个以去噪算法作为先验或正则化器的通用框架。近期工作表明，在 CS MRI 重建中，采用基于预训练卷积神经网络的去噪器的 PnP 方法优于其他经典正则化器。然而，PnP 的数值求解器在 CS MRI 重建中可能很慢。本文提出一种预条件 PnP（preconditioned PnP，P²nP）方法以加速收敛。此外，我们给出了 P²nP 迭代的定点（fixed-point）收敛性证明。在非笛卡尔采样轨迹上的 CS MRI 重建数值实验说明了 P²nP 方法的有效性与高效性。

**关键词：** 预条件子；即插即用（PnP）；磁共振成像（MRI）；重建；非笛卡尔采样。

## I. 引言

磁共振成像（MRI）是一种无创医学成像技术，利用磁场获取器官、组织及其他结构的图像。MRI 扫描仪采集目标图像的傅里叶分量，称为 k 空间。然而，采集过程较慢。为加速采集，一种策略是对傅里叶分量进行欠采样，但这违反了 Nyquist 采样定理的条件，会在常规重建图像中造成混叠。为解决该问题，现代 MRI 扫描仪使用多线圈（并行成像）采集傅里叶分量，从而提供额外空间信息 [1–3]。此外，压缩感知（CS）MRI [4, 5] 通过采用合适的采样模式提高重建图像质量。实践中，CS MRI 与并行成像结合，通过求解如下复合最小化问题重建 MRI 图像：

$$
\hat{\mathbf x}=\arg\min_{\mathbf x\in\mathbb C^N}\ \underbrace{\frac12\|\mathbf A\mathbf x-\mathbf y\|_2^2}_{f(\mathbf x)}+\phi(\mathbf x),\tag{1}
$$

其中 \(\mathbf A\in\mathbb C^{ML\times N}\) 表示把图像 \(\mathbf x\) 映射为采集 k 空间数据 \(\mathbf y\) 的前向模型，\(L\) 为线圈数。\(\mathbf A\) 由一叠矩阵 \(\mathbf A_l\) 组成，即 \(\mathbf A=[\mathbf A_1;\mathbf A_2;\cdots;\mathbf A_L]\)，其中 \(\mathbf A_l\in\mathbb C^{M\times N}\triangleq\mathbf M\mathbf F\mathbf C_l\)。\(\mathbf M\in\mathbb R^{M\times N}\) 定义采样模式，\(\mathbf F\in\mathbb C^{N\times N}\) 表示（非均匀）傅里叶变换算子，\(\mathbf C_l\in\mathbb C^{N\times N}\) 表示第 \(l\) 个线圈的灵敏度图，且与具体患者有关。

数据保真项 \(f(\cdot)\) 促使图像 \(\mathbf x\) 与测量 \(\mathbf y\) 一致，\(\phi(\cdot)\) 是描述未知图像 \(\mathbf x\) 统计分布的正则化器，通常称为先验。已被证明对 MRI 重建有用的经典 \(\phi(\cdot)\) 选择包括全变差（total variation，TV）[4, 6, 7]、小波 [8, 9]、字典学习 [10, 11] 以及低秩 [12] 等；不同 \(\phi(\cdot)\) 选择的综述见 [13, 14]。过去十年中，深度学习（DL）因其优异性能在 MRI 图像重建中受到广泛关注。DL 不再手工设计显式先验，而是提供一种数据驱动工具来隐式编码图像先验。常见的基于 DL 的 MRI 重建方法包括端到端映射 [15] 与基于模型（也称物理知情）的深度展开 [16–20]。近来，利用生成模型学习先验以求解 MRI 重建也引起了广泛兴趣 [21, 22]。

即插即用（PnP）[23] 是 DL 的一种替代方案，它利用最有效的图像去噪器（如 BM3D [24] 或 DnCNN [25]），在多种成像任务中取得领先性能 [26–31]。与通常依赖大规模数据、针对预定义成像任务训练的 DL 方法不同，PnP 无需重新训练即可方便地定制到特定应用。这一特性对求解 CS MRI 问题尤其有益，因为其采样模式、线圈灵敏度图与图像分辨率在不同扫描之间可能差异很大。此外，即使测试数据相对去噪器训练数据是分布外的（out-of-distribution），PnP 方法仍能取得合理的重建结果 [32]。关于将 PnP 用于 MRI 重建的详细讨论见 [33]。

PnP 源于近端算法（proximal algorithms）[34]——一类求解式 (1) 的迭代算法。在第 \(k\) 次迭代，近端梯度法（又称迭代收缩阈值算法，ISTA）及其加速版本（FISTA）[35] 按下式更新：

$$
\mathbf x_{k+1}\leftarrow\operatorname{prox}_{\alpha\phi}\left(\mathbf z_k-\alpha\nabla f(\mathbf z_k)\right),\qquad
\mathbf z_{k+1}\leftarrow\mathbf x_{k+1}+c_k(\mathbf x_{k+1}-\mathbf x_k),\tag{2}
$$

其中 \(\alpha>0\) 为步长，\(c_k>0\) 编码加速机制，\(\nabla f(\cdot)\) 表示 \(f(\cdot)\) 的梯度。这里 \(\operatorname{prox}_{\alpha\phi}(\cdot)\) 表示近端算子

$$
\operatorname{prox}_{\alpha\phi}(\cdot)\triangleq\arg\min_{\mathbf x\in\mathbb C^N}\ \frac12\|\mathbf x-\cdot\|_2^2+\alpha\phi(\mathbf x).\tag{3}
$$

观察到式 (3) 可解释为去噪器，这启发了 PnP-(F)ISTA 算法：把近端算子替换为任意去噪器 \(D_\sigma(\cdot)\)。这里 \(\sigma^2\) 表示加性白高斯噪声的方差，与正则化强度有关，例如较大的 \(\sigma\) 意味着更强的正则化。在 PnP 实践中，通常在依据 \(\nabla f\) 的 Lipschitz 常数选定步长 \(\alpha\) 后，通过经验调参选取 \(\sigma\) 的值。PnP-ADMM [36] 是另一种流行的 PnP 方法，来自交替方向乘子法（ADMM）[37]。第 II 节讨论 PnP 方法及其收敛性质。

尽管大量文献阐述了把 PnP 用于图像重建的益处，但高效求解 PnP 优化问题在计算上仍然具有挑战性，尤其是多线圈非笛卡尔采样的 CS MRI 重建：前向模型 \(\mathbf A\) 的频繁使用导致显著计算开销。本文聚焦这一挑战，提出预条件 PnP（P²nP）方法以加速 PnP-(F)ISTA 算法的收敛速度。主要贡献概括如下：

1. 我们提出一种新的 PnP 预条件求解器 P²nP，可提高 PnP-(F)ISTA 算法的收敛速度。特别地，我们给出两种预条件子设计策略——固定与动态：前者利用前向模型 \(\mathbf A\) 预先确定，后者在每次迭代以可忽略的代价估计。由于动态预条件子的估计不依赖 \(\mathbf A\) 的计算，当计算 \(\mathbf A\mathbf x\) 代价高昂时它尤其有用。
2. 我们建立了 P²nP 的理论收敛性与稳定性分析。证明表明，在温和条件下，P²nP 对固定与动态预条件子都能实现定点收敛。
3. 我们在 PnP 框架中采用归一化等变（normalization-equivariant）去噪器。结果表明，相较普通 CNN 去噪器，噪声自适应且稳健的归一化等变去噪器能有效提升 PnP 性能，从而缓解现有 PnP 方法选取去噪强度困难的问题。
4. 我们在多种设置下广泛测试了用于多线圈非笛卡尔采样 CS MRI 重建的 P²nP，包括固定/动态预条件子、螺旋与径向采样轨迹以及归一化等变去噪器。数值结果表明，P²nP 在收敛速度与重建性能（定性与定量）两方面都稳定优于基线方法。

本文其余部分安排如下：第 II 节介绍 PnP 的若干常见变体与收敛性质；第 III 节提出预条件 PnP（P²nP）方法并讨论其收敛性质；第 IV 节总结 P²nP 在 CS MRI 重建中的实验验证及与已知基线方法的比较，并检验 P²nP 的收敛性以验证理论分析；第 V 节总结全文。

## II. PnP 方法预备知识

本节回顾 PnP 的不同变体及其收敛性质。PnP 是一类用黑箱去噪器解释先验的成像算法。例如，除 PnP-ADMM 与 PnP-(F)ISTA 之外，PnP 还可由其他算法导出，如 PnP-PDS [27]、PnP-HQS [38] 与 PnP-CE [29] 等。PnP 的一种替代方案是去噪正则化（regularization by denoising，RED）[39–41]，它构造显式的、嵌入了去噪器的正则函数。为加速 PnP 收敛，Tan 等 [42] 提出一种把拟 Newton 步并入可证明 PnP 框架的 PnP-拟 Newton 方法；但其方法相当复杂，且每一步的计算非常昂贵。Pendu 等 [43] 分析了以对角矩阵为预条件子的预条件 PnP-ADMM 算法。一般而言，对角矩阵对许多应用效果不佳，因为相应的 Hessian 矩阵并非对角占优。文献 [43] 的方法需要针对不同预条件子 \(\{\boldsymbol\Sigma\}\) 训练局部可调的去噪器，其中该去噪器求解

$$
\min_{\mathbf x\in\mathbb R^N}\ \frac12\|\boldsymbol\Sigma(\mathbf x-\cdot)\|_2^2+\alpha\phi(\mathbf x),\tag{4}
$$

其中 \(\boldsymbol\Sigma\) 为对角矩阵。\(\boldsymbol\Sigma\) 将作为额外通道用于训练去噪器。在实际应用中，为训练找到一组合适的 \(\{\boldsymbol\Sigma\}\) 并非易事；此外，当 \(\mathbf A\) 的显式表达未知时，寻找这样的对角预条件子也并不简单。

除了 PnP 的经验性成功，其收敛分析也取得了很大进展。Sreehari 等 [26] 给出了 PnP 关于某个隐式目标函数收敛的充分条件。Chan 等 [36] 针对有界去噪器建立了 PnP-ADMM 的定点收敛性。Buzzard 等 [29] 从共识均衡（consensus equilibrium）视角给出了 PnP 的定点解释。Teodoro 等 [44] 建立了采用线性化高斯混合模型去噪器的 PnP-ADMM 收敛性。Gavaskar 等 [45] 证明了线性去噪器情形下 PnP 具有显式代价函数时的收敛性。近期分析表明，在对去噪器作其他假设时也能保证 PnP 迭代的收敛性 [46–51]。RED 收敛分析的相关工作包括 [39, 41, 52]，其中 [53] 证明 RED 在非凸设定下可保证收敛到稳定点。关于 PnP 收敛性质的详细讨论见 [54] 及其参考文献。

## III. 所提方法

本节先给出 P²nP 方法，随后描述两种预条件子选择策略：固定与动态。我们还将给出 P²nP 的收敛性与稳定性分析。

**算法 1：预条件即插即用（P²nP）**

- 初始化：\(\mathbf x_1\) 与步长 \(\alpha>0\)。
- 迭代：
  1. 对 \(k=1,2,\ldots\) 执行
  2. \(\mathbf x_{k+1}\leftarrow D_\sigma\left(\mathbf x_k-\alpha\mathbf P\nabla f(\mathbf x_k)\right)\)。
  3. 结束循环

令 \(\mathbf P\succ\mathbf 0\) 表示 \(\mathbb C^{N\times N}\) 中的 Hermitian 正定矩阵。在第 \(k\) 次迭代，P²nP 求解如下问题：

$$
\begin{aligned}
\mathbf x_{k+1}&=\arg\min_{\mathbf u\in\mathbb C^N}\left\{\left\langle\nabla f(\mathbf x_k),\mathbf u-\mathbf x_k\right\rangle+\frac1{2\alpha}(\mathbf u-\mathbf x_k)^H\mathbf P^{-1}(\mathbf u-\mathbf x_k)+\phi(\mathbf u)\right\}\\
&=\arg\min_{\mathbf u\in\mathbb C^N}\left\{\frac12\left\|\mathbf u-\left(\mathbf x_k-\alpha\mathbf P\nabla f(\mathbf x_k)\right)\right\|_{\mathbf P^{-1}}^2+\alpha\phi(\mathbf u)\right\},
\end{aligned}\tag{5}
$$

其中 \(\alpha\) 为步长，\(H\) 表示 Hermitian 转置，并定义加权欧氏范数 \(\|\mathbf v\|_{\mathbf P^{-1}}^2\triangleq\mathbf v^H\mathbf P^{-1}\mathbf v\)。显然，若 \(\mathbf P=\mathbf I\)，则 P²nP 退化为 PnP-ISTA。

利用 \(\|\mathbf v\|_{\mathbf P^{-1}}^2\le\|\mathbf P^{-1}\|_2\|\mathbf v\|_2^2\)，我们通过如下更新去掉式 (5) 中的权重 \(\mathbf P^{-1}\)：

$$
\mathbf x_{k+1}=\arg\min_{\mathbf u\in\mathbb C^N}\ \frac12\left\|\mathbf u-\left(\mathbf x_k-\alpha\mathbf P\nabla f(\mathbf x_k)\right)\right\|_2^2+\frac{\alpha}{\eta}\phi(\mathbf u),\tag{6}
$$

其中 \(\eta\triangleq\|\mathbf P^{-1}\|_2>0\)。Aminifard 等 [55] 证明：用一个额外的线搜索步骤求解式 (6) 而非式 (5) 时，式 (1) 中函数值序列 \(\{f(\mathbf x_k)\}\) 的收敛性仍可得到保证。下一小节将给出更强的结果：即使没有额外线搜索步骤，在温和假设下 P²nP 的迭代序列 \(\{\mathbf x_k\}\) 仍收敛。

显然式 (6) 与式 (3) 中近端算子的定义非常相似。因此我们把这个近端算子替换为去噪器 \(D_\sigma\)，从而得到所提出的 P²nP 算法（算法 1）。可把式 (6) 中的 \(1/\eta\) 视为权衡参数：当 \(1/\eta>1\) 时应更强调 \(\phi(\mathbf u)\)，因此去噪器应使用比式 (3) 中更大的 \(\sigma\) 值。给定 \(\mathbf P\) 与步长 \(\alpha\) 的选择，可依据式 (6) 经验性地微调合适的 \(\sigma\) 值。

与 PnP-FISTA 类似，可以尝试用动量加速 P²nP。然而我们实验发现，PnP-FISTA 与加速版 P²nP 在运行"过多"迭代后性能都显著退化，该问题有待未来进一步研究。因此本文聚焦于算法 1。下面给出两种选择预条件子 \(\mathbf P\) 的方式。

### A. 固定预条件子

我们首先讨论 P²nP 的收敛性，以洞悉什么样的预条件子 \(\mathbf P\) 能提高收敛速度；随后说明实践中如何高效地选取固定的 \(\mathbf P\)。

**1）收敛分析。** 这里讨论 P²nP 的收敛条件与收敛速率界。首先假设去噪器是 Lipschitz 连续的，这是定点 PnP 分析中的标准假设 [47]，即假设 1。

**假设 1。** 去噪器 \(D_\sigma(\cdot):\mathbb C^N\to\mathbb C^N\) 以 \(1+\epsilon\)（\(\epsilon>0\)）为 Lipschitz 常数连续，即对所有 \(\mathbf x,\mathbf y\in\mathbb C^N\) 满足

$$
\|D_\sigma(\mathbf x)-D_\sigma(\mathbf y)\|\le(1+\epsilon)\|\mathbf x-\mathbf y\|.
$$

于是定理 1 给出 P²nP 迭代收敛到定点的充分条件。

**定理 1（固定预条件子下 P²nP 的收敛性）。** 假设 \(D_\sigma(\cdot)\) 满足假设 1。若

$$
r_0\triangleq(1+\epsilon)\rho\left(\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A\right)<1,\tag{7}
$$

则算法 1 生成的迭代序列收敛到定点；其中 \(\rho(\cdot)\) 表示谱半径，迭代的收敛速率以该 \(r_0\) 为上界。

证明见附录 A。

由定理 1，理想的 \(\alpha\mathbf P\) 应使 \(\rho(\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A)\) 最小。若 \(\mathbf A^H\mathbf A\succ\mathbf 0\)，理想选择是 \(\alpha\mathbf P=(\mathbf A^H\mathbf A)^{-1}\)，此时算法 1 一次迭代即可收敛到定点。然而这样的 \(\alpha\mathbf P\) 计算昂贵，且在 CS MRI 中 \(\mathbf A^H\mathbf A\) 为 Hermitian 半正定矩阵，因此选择这样的 \(\alpha\mathbf P\) 并不现实。

**2）预条件子 \(\alpha\mathbf P\) 的选择。** 寻找使 \(\rho(\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A)\) 最小的 \(\alpha\mathbf P\) 并非易事。科学计算领域一种已被证明有用的做法是极小化 \(\rho(\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A)\) 的上界 [56, 57]，即

$$
\min_{\alpha\mathbf P}\ \left\|\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A\right\|_F^2.\tag{8}
$$

在 CS MRI 中我们并不显式存储稠密矩阵 \(\mathbf A\)，因此使用式 (8) 具有挑战性；此外，由于线圈灵敏度图与患者有关，每次扫描的 \(\mathbf A\) 都不同，任何昂贵的预计算策略都不现实。本文提出使用多项式预条件子 [58]。把 \(\alpha\mathbf A^H\mathbf A\) 表示为 \(\alpha\mathbf A^H\mathbf A=\mathbf I-\bar{\mathbf A}\)，则理想预条件子为

$$
\left(\mathbf I-\bar{\mathbf A}\right)^{-1}=\mathbf I+\bar{\mathbf A}+\bar{\mathbf A}^2+\cdots.\tag{9}
$$

\(\alpha\mathbf A^H\mathbf A\) 的一个不完全逆即式 (9) 的截断形式，即 \(\mathbf P=\sum_{\gamma=1}^{\Gamma}a_\gamma(\bar{\mathbf A})^{\gamma-1}\)，其中 \(\Gamma\in\mathbb Z^+:\ge2\)。由于 \(\alpha\mathbf P\mathbf A^H\mathbf A=\sum_{\gamma=1}^{\Gamma}\bar p_\gamma(\alpha\mathbf A^H\mathbf A)^{\gamma}\)，可知 \(\mathbf P\) 也是 \(\mathbf A^H\mathbf A\) 的多项式。因此我们考虑如下多项式形式的 \(\mathbf P\)：

$$
\mathbf P=\sum_{\gamma=1}^{\Gamma}p_\gamma\left(\alpha\mathbf A^H\mathbf A\right)^{\gamma-1},\tag{10}
$$

其中 \(\{p_\gamma\}_\gamma\) 为一组标量。我们希望选择这组标量以最小化 \(\rho(\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A)\)。注意为得到有效的 \(\mathbf P\) 而寻找 \(\{p_\gamma\}_\gamma\) 的代价可以忽略。例如，Zulfiquar 等 [59] 取

$$
p_\gamma=\binom{\Gamma}{\gamma}(-1)^{\gamma-1},\tag{11}
$$

并把该多项式预条件子适配到 FISTA，用于小波域图像重建，即求解

$$
\mathbf x^*=\arg\min_{\mathbf x\in\mathbb R^N}\ \frac12\left\|\mathbf A\mathbf W^{-1}\mathbf x-\mathbf y\right\|_2^2+\nu\|\mathbf x\|_1,\tag{12}
$$

其中 \(\mathbf W\) 表示正交小波变换，\(\nu>0\) 为权衡参数；恢复图像为 \(\mathbf W^{-1}\mathbf x^*\)。Zulfiquar 等表明，求解式 (12) 时预条件 FISTA 的收敛速度显著快于普通 FISTA。

另一种做法见于 [60]：Iyer 等表明，在带低秩正则化的 CS MRI 重建中，Chebyshev 多项式预条件子十分有效。由于 \(\mathbf A^H\mathbf A\) 是 Hermitian 矩阵，其特征值全为实数，因此可以使用在最小化 \(\rho(\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A)\) 意义下最优的 Chebyshev 多项式预条件子。通过求出 \(\mathbf A^H\mathbf A\) 的最小与最大特征值，可解析地得到 \(\{p_\gamma\}_\gamma\) 的取值。在 CS MRI 中 \(\mathbf A\) 通常是欠定的，故 \(\mathbf A^H\mathbf A\) 的最小特征值为零，而最大特征值可用幂法求得。

采用递归实现时，计算 \(\mathbf P\mathbf x\) 总共需要计算 \((\Gamma-1)\) 次 \(\mathbf A^H\mathbf A\mathbf x\)。在现代 CS MRI 中，多线圈与非笛卡尔采集使计算 \(\mathbf A^H\mathbf A\mathbf x\) 同样昂贵，因此较大的 \(\Gamma\) 会显著增加计算开销。注意较大的 \(\Gamma\) 可得到更有效的预条件子，但会导致更高的计算代价。实践中其效率取决于采样轨迹、灵敏度图、线圈数与矩阵规模，因此最优的 \(\Gamma\) 应在有效性与额外计算之间取得平衡。本文所有实验均简单取 \(\Gamma=2\)。为进一步减少多项式预条件子的计算量，下一部分研究动态预条件子，其每次迭代的额外计算可以忽略。

### B. 动态预条件子

定理 1 表明，设计良好的预条件子应逼近 \(\mathbf A^H\mathbf A\) 的逆。因此另一种做法是用拟 Newton 方法 [61, 第 6 章] 估计一个逼近 \((\mathbf A^H\mathbf A)^{-1}\) 的 \(\mathbf P\)。参照 [62–64]，我们建议对复数据使用零记忆自缩放 Hermitian 秩 1（zero-memory self-scaling Hermitian rank-1，ZMSHR1）方法来定义这样的预条件子。算法 2 汇总了 ZMSHR1 方法。由于式 (14) 是一维最小化问题，我们直接搜索最小的 \(a\)。引理 1 给出算法 2 所生成变量的一些性质。

**引理 1。** 设 \(f(\mathbf x)=\frac12\|\mathbf A\mathbf x-\mathbf y\|_2^2\)，\(\mathbf x\in\mathbb C^N\)。则算法 2 中生成的 \(\tau_k\) 与 \(\langle\mathbf s_k,\mathbf v_k\rangle\) 为实数，且 \(\langle\mathbf s_k-\tau_k\mathbf v_k,\mathbf v_k\rangle\ge0\)。此外，所生成的 \(\tau_k\) 与 \(\mathbf P_k\in\mathbb C^{N\times N}\)（\(\forall k\)）有界：

$$
\frac1{2\theta_2}<\tau_k\le\frac1{\theta_1},\qquad
\frac1{2\theta_2}\preceq\mathbf P_k\preceq\frac{\delta+1}{\delta\theta_1},
$$

其中 \(\delta>0\)、\(\theta_1\in(0,1)\)、\(\theta_2\in(1,\infty)\)。

证明见附录 B。

引理 1 保证 \(\mathbf P_k\) 为正定矩阵。令 \(\eta_k\triangleq\|\mathbf P_k^{-1}\|_2\)。则第 \(k\) 次迭代时，动态预条件子版 P²nP 改用如下问题代替式 (6)：

$$
\mathbf x_{k+1}=\arg\min_{\mathbf u\in\mathbb C^N}\ \frac12\left\|\mathbf u-\left(\mathbf x_k-\alpha\mathbf P_k\nabla f(\mathbf x_k)\right)\right\|_2^2+\frac{\alpha}{\eta_k}\phi(\mathbf u).\tag{13}
$$

显然 \(\eta_k\) 每次迭代都不同，因此求解式 (13) 并不等价于对所有迭代执行固定 \(\sigma\) 的去噪器。Xu 等 [65] 证明：若 \(D_\sigma(\cdot)\) 表示图像数据在噪声标准差为 \(\sigma\) 时的最小均方误差（MMSE）去噪器，则 \(\frac1\mu D_\sigma(\mu\mathbf x)\)（\(\mu>0\)）是噪声水平为 \(\sigma^2/\mu^2\) 的图像的 MMSE 去噪器。此外 Xu 等 [50] 表明，BM3D [24] 与训练好的 CNN 去噪器等许多现代去噪器可在实验意义上视为 MMSE 去噪器。因此给定 \(\eta_k\) 时，若 \(D_\sigma(\cdot)\) 是 MMSE 去噪器，原则上可以通过（以某种方式）找到合适的 \(\eta_k^*\) 并运行 \(\frac1{\eta_k^*}D_\sigma(\eta_k^*\mathbf x)\) 来求解式 (13)；然而实践中找到 \(\eta_k^*\) 并非易事。

Herbreteau 等提出了一种归一化等变 CNN 去噪器，其性能与普通去噪器相当，且可对不同噪声水平的含噪图像去噪 [66]。具体而言，归一化等变去噪器具有特殊性质：对任意 \(\mu\in\mathbb R\)（\(\mu>0\)）与 \(\Delta\in\mathbb C\)，有 \(D_\sigma(\mu\mathbf x+\Delta\mathbf 1)=\mu D_\sigma(\mathbf x)+\Delta\mathbf 1\)，其中 \(\mathbf 1\) 表示全 1 向量。通过使用归一化等变去噪器，我们可以直接用 \(D_\sigma(\mathbf x_k-\alpha\mathbf P_k\nabla f(\mathbf x_k))\) 代替式 (13)，而无需针对不同的 \(\eta_k\) 调整相应的噪声水平 \(\sigma\)；该性质使动态预条件子的使用与固定预条件子情形同样实用。算法 3 汇总了带动态预条件子的 P²nP。第 IV-D 节比较归一化等变去噪器与普通去噪器的性能，结果表明归一化等变去噪器更优。下面讨论算法 3 的稳定性性质，保证算法 3 生成的迭代 \(\mathbf x_k\) 始终接近某个定点。

**1）稳定性分析。** 本部分给出使用动态预条件子时 P²nP 的稳定性分析，说明算法 3 在迭代 \(\mathbf x_k\) 保持有界的意义下是可靠的。先假设 \(f\) 的梯度有上界。

**假设 2。** 对算法 3 生成的 \(\forall\mathbf x_k\)，存在 \(R<\infty\) 使

$$
\|\nabla f(\mathbf x_k)\|\le R.
$$

该上界 \(R\) 在实践中存在，因为许多去噪算法的值域有界 [48]，且 \(\nabla f(\mathbf x)=\mathbf A^H(\mathbf A\mathbf x-\mathbf y)\)。定理 2 给出 \(\|\mathbf x_k-\mathbf x^*\|\) 的上界。

**定理 2（算法 3 的稳定性）。** 假设 Hermitian 正定矩阵 \(\mathbf P^*\) 满足 \(0\prec\mathbf P^*\preceq\lambda^*\mathbf I\)（\(\lambda^*<\infty\)），且 \(q\triangleq\left[(1+\epsilon)\rho(\mathbf I-\alpha\mathbf P^*\mathbf A^H\mathbf A)\right]<1\)。令 \(\{\mathbf P_k\}_k\) 表示由算法 2 生成的动态预条件子，并假设使用归一化等变去噪器。则算法 3 生成的 \(\mathbf x_k\) 与 \(\mathbf x^*\triangleq D_\sigma(\mathbf x^*-\alpha\mathbf P^*\nabla f(\mathbf x^*))\) 之间的距离满足

$$
\|\mathbf x_{k+1}-\mathbf x^*\|\le q^k\|\mathbf x_1-\mathbf x^*\|+\frac{(1+\epsilon)\alpha(\delta+1+\delta\theta_1\lambda^*)}{\delta\theta_1(1-q)}R.\tag{15}
$$

证明见附录 C。

由于 \(q<1\)，当 \(k\to\infty\) 时式 (15) 的第一项消失，距离 \(\|\mathbf x_k-\mathbf x^*\|\) 由第二项界定。实验中我们发现 \(R=\|\nabla f(\mathbf x_1)\|\)，因此一个 \(\|\nabla f(\mathbf x_1)\|\) 较小的良好初值有助于控制误差。此外，可通过把其他参数设为期望水平来控制误差界的精度；但若把参数调到强制很小的误差界，算法可能变得非常慢。实践中我们实验发现，不调整式 (15) 第二项的值也能取得算法 3 的优异 PSNR 性能，这与 [48, 定理 1] 的观察一致。该观察表明，实验中表现良好的参数可能对应极高的上界，说明进一步分析或可得到更紧的结果。

**算法 2：零记忆自缩放 Hermitian 秩 1（ZMSHR1）方法**

- 初始化：\(\mathbf x_{k-1}\)、\(\mathbf x_k\)、\(\nabla f(\mathbf x_{k-1})\)、\(\nabla f(\mathbf x_k)\)、\(\delta>0\)、\(\theta_1\in(0,1)\)、\(\theta_2\in(1,\infty)\)。
1. 令 \(\mathbf s_k\leftarrow\mathbf x_k-\mathbf x_{k-1}\)，\(\mathbf m_k\leftarrow\nabla f(\mathbf x_k)-\nabla f(\mathbf x_{k-1})\)。
2. 求 \(a\)，使得

$$
\min_a\left\{a\in[0,1]\ \middle|\ \mathbf v_k=a\mathbf s_k+(1-a)\mathbf m_k\right\}
$$
$$
\text{满足}\quad \theta_1\le\frac{\langle\mathbf s_k,\mathbf v_k\rangle}{\langle\mathbf s_k,\mathbf s_k\rangle},\qquad
\frac{\langle\mathbf v_k,\mathbf v_k\rangle}{\langle\mathbf s_k,\mathbf v_k\rangle}\le\theta_2.\tag{14}
$$

3. 计算 \(\tau_k\leftarrow\frac{\langle\mathbf s_k,\mathbf s_k\rangle}{\langle\mathbf s_k,\mathbf v_k\rangle}-\sqrt{\left(\frac{\langle\mathbf s_k,\mathbf s_k\rangle}{\langle\mathbf s_k,\mathbf v_k\rangle}\right)^2-\frac{\langle\mathbf s_k,\mathbf s_k\rangle}{\langle\mathbf v_k,\mathbf v_k\rangle}}\)。
4. 若 \(\langle\mathbf s_k-\tau_k\mathbf v_k,\mathbf v_k\rangle\le\delta\|\mathbf s_k-\tau_k\mathbf v_k\|\|\mathbf v_k\|\) 则
5. \(\mathbf u_k\leftarrow\mathbf 0\)。
6. 否则
7. \(\mathbf u_k\leftarrow\mathbf s_k-\tau_k\mathbf v_k\)。
8. 结束条件判断
9. 返回：\(\mathbf P_k\leftarrow\tau_k\mathbf I+\frac{\mathbf u_k\mathbf u_k^H}{\langle\mathbf s_k-\tau_k\mathbf v_k,\mathbf v_k\rangle}\)。

**算法 3：带动态预条件子的 P²nP**

- 初始化：\(\mathbf x_1\)、步长 \(\alpha\in\mathbb R\)，且 \(D_\sigma(\cdot)\) 为归一化等变去噪器。
- 迭代：
  1. 对 \(k=1,2,\ldots\) 执行
  2. 若 \(k==1\) 则
  3. \(\mathbf x_{k+1}\leftarrow D_\sigma\left(\mathbf x_k-\alpha\nabla f(\mathbf x_k)\right)\)。
  4. 否则
  5. 调用算法 2 得到 \(\mathbf P_k\)。
  6. \(\mathbf x_{k+1}\leftarrow D_\sigma\left(\mathbf x_k-\alpha\mathbf P_k\nabla f(\mathbf x_k)\right)\)。
  7. 结束条件判断
  8. 结束循环

## IV. 数值实验

本节研究 P²nP 在固定与动态预条件子下、针对螺旋与径向采样轨迹的 CS MRI 重建性能。对固定预条件子，我们检验式 (11) 与 Chebyshev 多项式两种情形，并研究 P²nP 的收敛性以验证分析；最后比较归一化等变去噪器与普通去噪器。下面先给出实验与算法设置，再展示重建结果。

**实验设置。** 我们用脑部与膝部 MRI 图像研究 P²nP 性能。脑部图像采用 [16] 使用的数据集，训练集 360 幅、测试集 164 幅。膝部图像采用 NYU fastMRI [67] 多线圈膝部数据集，先应用 ESPIRiT 算法 [68] 恢复复值图像，再从训练集与测试集分别取 700 与 6 个切片。随后把所有脑部与膝部图像裁剪并缩放为 \(256\times256\)。含噪图像通过加入方差为 \(0.1/255\) 的 i.i.d. 高斯噪声得到。去噪器采用 DRUNet [31]，并针对脑部与膝部图像分别训练归一化等变 [66] 与普通去噪器。训练时，两种去噪器都用批大小 16、以均方误差为损失函数；优化器为 ADAM [69]，学习率 \(10^{-4}\)，共执行 \(3\times10^3\) 次迭代训练去噪器。我们对脑部与膝部图像训练不同去噪器，但不同采集方式共用同一去噪器。

我们从脑部与膝部测试集中取六幅图像作为真值，并把图像最大幅度缩放到 1。图 1 给出六幅复值真值图像的幅度。对采样轨迹，我们用 6 个交错（interleaves）、1688 个读出点与 32 个线圈（螺旋轨迹），或 21 条黄金角旋转辐条、1024 个读出点与 32 个线圈（径向轨迹）来确定前向模型 \(\mathbf A\)。图 2 给出本文所用轨迹。我们对真值图像应用相应前向模型生成无噪多线圈 k 空间数据，再对所有线圈加入均值为零、方差为 \(10^{-3}\)（脑部）或 \(3\times10^{-4}\)（膝部）的复 i.i.d. 高斯噪声，得到相应的测量 \(\mathbf y\)。第 IV-C 与第 IV-D 节在螺旋采集下考察全部六幅脑部测试图像。补充材料给出笛卡尔采样轨迹的额外实验结果，以及螺旋与径向采集加速因子的计算方式。所有实验均用 PyTorch [70] 实现，运行于 NVIDIA GeForce RTX 3090。

**算法设置。** 步长 \(\alpha\) 取为 \(1/\|\mathbf A^H\mathbf A\|_2\)，其中谱范数用幂法计算。所有实验均以 \(\mathbf A^H\mathbf y\) 作为初始化。对带固定预条件子的 P²nP，我们研究两种策略：一是取 \(\Gamma=2\) 并由式 (11) 得到 \(\mathbf P_1^F=2-\alpha\mathbf A^H\mathbf A\)，称为"P²nP-F-1"；二是由 Chebyshev 多项式得到 \(\mathbf P_2^F=4-\frac{10}{3}\alpha\mathbf A^H\mathbf A\)，称为"P²nP-F-Cheb"。带动态预条件子的 P²nP 记为"P²nP-D"。算法 2 取 \(\delta=10^{-8}\)、\(\theta_1=2\times10^{-6}\)、\(\theta_2=200\)。我们主要把 P²nP 与 PnP-ISTA 和 PnP-ADMM 方法 [36, 47] 比较，因为这两种方法在温和假设下也具有可证明的定点收敛性。表 I 概述所有比较方法的算法流程。除第 IV-C 节为考察收敛性质而运行 500 次迭代外，所有算法均运行 200 次迭代。除第 IV-D 节比较两种去噪器差异外，所有实验都使用归一化等变去噪器。

**表 I（原文 Table I）：PnP-ISTA/ADMM 与 P²nP 的算法流程汇总**

| 方法 | 更新式 / 预条件子 |
|---|---|
| PnP-ISTA | \(\mathbf x_{k+1}=D_\sigma(\mathbf x_k-\alpha\nabla f(\mathbf x_k))\) |
| PnP-ADMM | \(\mathbf x_k=\arg\min_{\mathbf x}f(\mathbf x)+\frac12\lVert\mathbf x-\mathbf z_{k-1}\rVert_2^2\)；\(\bar{\mathbf z}_k=D_\sigma(\mathbf x_k+\mathbf z_{k-1})\)；\(\mathbf z_k=\mathbf z_{k-1}+\mathbf x_k-\bar{\mathbf z}_k\) |
| P²nP | \(\mathbf x_{k+1}=D_\sigma(\mathbf x_k-\alpha\mathbf P\nabla f(\mathbf x_k))\) |
| 　-P-F-1 | \(\mathbf P=2-\alpha\mathbf A^H\mathbf A\) |
| 　-P-F-Cheb | \(\mathbf P=4-\frac{10}{3}\alpha\mathbf A^H\mathbf A\) |
| 　-P-D | \(\mathbf P=\) 算法 2 |

### A. 螺旋采集重建

图 3 给出 P²nP 在脑部 1 图像上的性能。图 3(a) 表明，带固定与动态预条件子的 P²nP 在迭代次数上都比 PnP-ISTA 与 PnP-ADMM 收敛得更快，说明使用预条件子有效，且算法 3 收敛最快。此外，P²nP-F-Cheb 比 P²nP-F-1 更快，这与我们的预期一致，因为 P²nP-F-Cheb 是最优的。图 3(b) 给出 PSNR 随实际耗时（wall time）的变化。该实验中 P²nP-D 最具吸引力，因为它在迭代次数与实际耗时两方面都收敛得比其他算法快。图 3(b) 显示 P²nP-F-1 与 P²nP-F-Cheb 的耗时几乎是 ISTA 的两倍，因为二者执行 \(\mathbf A\mathbf x\) 的次数是 PnP-ISTA 的两倍；尽管如此，它们在耗时上仍比 PnP-ISTA 更快。PnP-ADMM 在所有方法中耗时最慢，因为 ADMM 每次迭代都要求解一个最小二乘问题，需要多次执行 \(\mathbf A\mathbf x\)。图 4 给出第 25、50、100、200 次迭代的重建图像以及第 200 次迭代的误差图，显示在相同迭代次数下 P²nP 取得了比 PnP-ISTA 更高的 PSNR 与更清晰的重建。此外图 4 还包含基于密度补偿（density compensation）的重建 [71]，清楚地展示了 PnP 框架的优势。

表 II 给出各方法在其他脑部测试图像上的重建性能，其中以 PnP-ADMM 取得的最高 PSNR 作为基准。首先，PnP-ISTA 的 PSNR 与 PnP-ADMM 相近。其次，由表 II 中每种方法的第一行可见，为达到相近 PSNR，P²nP 所需迭代次数与实际耗时都少于 PnP-ISTA 与 PnP-ADMM；P²nP 的这一稳定优势说明使用预条件子是有效的。此外，为达到相近 PSNR，P²nP-D 比 PnP-ADMM 快近 70 倍、比 PnP-ISTA 快 7–10 倍，说明动态预条件子的优势与高效性。表 II 中每种方法的第二行表明，P²nP-D 在运行完所有计划迭代后也取得了最高 PSNR。总体而言，该实验中 P²nP-D 在迭代次数与实际耗时两方面都是最快的算法；P²nP 不仅提高了数值效率，还取得了更高的 PSNR。补充材料给出螺旋采集下膝部图像的结果，其趋势与脑部图像类似。

**表 II（原文 Table II）：螺旋采集下各方法对另外 5 幅脑部测试图像的重建 PSNR 性能**

表注（原文）：对 PnP-ADMM，给出其最大 PSNR、对应迭代次数与耗时，并作为基准。对每种方法的每幅测试图像，第一行的第二列表示首次超过 PnP-ADMM 的 PSNR 时的迭代次数，第一列与第三列分别为相应 PSNR 与耗时；粗体数字表示首次超过 PnP-ADMM 的最快算法的迭代次数与耗时。第二行给出第 200 次迭代时的 PSNR 与耗时；蓝色数字表示第 200 次迭代的最高 PSNR。本页以**加粗**表示原"蓝色"（最高 PSNR）数值；最快迭代/耗时在本组实验中均为 P²nP-D 取得。

| 方法 | 2 PSNR↑ | iter.↓ | sec.↓ | 3 PSNR↑ | iter.↓ | sec.↓ | 4 PSNR↑ | iter.↓ | sec.↓ | 5 PSNR↑ | iter.↓ | sec.↓ | 6 PSNR↑ | iter.↓ | sec.↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PnP-ADMM | 34.29 | 200 | 147.6 | 34.51 | 200 | 152.2 | 34.09 | 200 | 149.3 | 32.78 | 200 | 148.7 | 31.70 | 200 | 148.8 |
| PnP-ISTA | 34.29 | 199 | 14.5 | 34.52 | 200 | 14.4 | 34.09 | 199 | 14.8 | 32.78 | 199 | 14.3 | 31.70 | 199 | 14.4 |
| PnP-ISTA | 34.30 | 200 | 14.6 | 34.52 | 200 | 14.4 | 34.10 | 200 | 14.9 | 32.79 | 200 | 14.4 | 31.71 | 200 | 14.5 |
| P²nP-F-1 | 34.32 | 76 | 10.4 | 34.53 | 76 | 10.5 | 34.10 | 76 | 10.7 | 32.82 | 80 | 10.9 | 31.72 | 79 | 10.8 |
| P²nP-F-1 | 36.00 | 200 | 27.4 | 36.17 | 200 | 27.5 | 35.91 | 200 | 28.2 | 34.85 | 200 | 27.1 | 33.74 | 200 | 27.4 |
| P²nP-F-Cheb | 34.33 | 37 | 5.1 | 34.55 | 37 | 5.2 | 34.13 | 37 | 5.2 | 32.84 | 39 | 5.3 | 31.72 | 38 | 5.2 |
| P²nP-F-Cheb | 37.37 | 200 | 27.4 | 37.57 | 200 | 28.1 | 37.38 | 200 | 27.1 | 36.65 | 200 | 27.1 | 35.9 | 200 | 27.4 |
| P²nP-D | 34.41 | 28 | 2.0 | 34.59 | 24 | 1.8 | 34.11 | 20 | 1.5 | 32.87 | 19 | 1.4 | 31.74 | 33 | 2.4 |
| P²nP-D | **37.40** | 200 | 14.5 | **38.02** | 200 | 14.9 | **38.01** | 200 | 14.8 | **37.43** | 200 | 14.4 | **36.53** | 200 | 14.5 |

### B. 径向采集重建

图 5 描述各方法在膝部 1 图像重建上的性能。与第 IV-A 节脑部图像实验的观察一致，P²nP 在迭代次数与实际耗时上都比 PnP-ADMM 与 PnP-ISTA 收敛得更快。此外在该实验中，P²nP-D 的收敛速率与 P²nP-F-Cheb 在迭代次数上相近，但 P²nP-D 在实际耗时上比 P²nP-F-Cheb 更快。虽然 P²nP-F-Cheb 的 PSNR 在迭代末尾略有下降，它仍比 P²nP-F-1 更快。与第 IV-A 节类似，P²nP-D 是最快的算法。图 6 给出各方法的重建图像。这里由于只使用 21 条辐条，重建图像存在一些混叠伪影；补充材料给出膝部 1 图像在螺旋采集下的重建，结果清晰得多。此外我们还测试了 55 条辐条的径向采集，结果汇总于补充材料，其中伪影显著减少。此时 P²nP 的 PSNR 仅比 PnP-ISTA 高约 1 dB（螺旋采集时约高 4.5 dB），主要原因在于该采集下预条件子的有效性。补充材料表明，在膝部同一图像上，螺旋采集与 55 条辐条径向采集下 P²nP 都显著优于 PnP-ISTA。

与表 II 类似，我们还测试了其他膝部图像，表 III 汇总结果。这里对部分测试图像，PnP-ISTA 的 PSNR 比 PnP-ADMM 略差；此外对部分图像（即 5 和 6），PnP-ISTA 的 PSNR 在迭代末尾略有下降。这在预期之内，因为定点收敛并不能保证重建图像的质量。与第 IV-A 节类似，P²nP 比 PnP-ISTA 与 PnP-ADMM 更快，且 P²nP-D 是超过 ADMM 性能最快的算法；不过对部分图像（即 2、3、4），P²nP-F-Cheb 取得了最高 PSNR。补充材料汇总了脑部图像在径向采集下的结果，趋势相似。

**表 III（原文 Table III）：各方法对另外 5 幅膝部测试图像在径向采集下的重建性能**

表注（原文）：数字含义与表 II 相同。"−" 表示该方法在 200 次迭代内无法达到比 ADMM 更高的 PSNR。本页以**加粗**表示原"蓝色"数值（第 200 次迭代最高 PSNR）。

| 方法 | 2 PSNR↑ | iter.↓ | sec.↓ | 3 PSNR↑ | iter.↓ | sec.↓ | 4 PSNR↑ | iter.↓ | sec.↓ | 5 PSNR↑ | iter.↓ | sec.↓ | 6 PSNR↑ | iter.↓ | sec.↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PnP-ADMM | 35.30 | 153 | 106.1 | 31.17 | 196 | 145.4 | 33.64 | 176 | 122 | 31.36 | 160 | 120.4 | 34.77 | 150 | 111.5 |
| PnP-ISTA | − | − | − | 31.17 | 200 | 14.5 | − | − | − | 31.36 | 154 | 11.3 | 34.77 | 145 | 10.4 |
| PnP-ISTA | 35.16 | 200 | 14.5 | 31.17 | 200 | 14.5 | 33.60 | 200 | 14.6 | 31.21 | 200 | 14.6 | 34.55 | 200 | 14.3 |
| P²nP-F-1 | 35.30 | 54 | 7.4 | 31.18 | 72 | 9.8 | 33.64 | 62 | 8.5 | 31.38 | 57 | 7.9 | 34.77 | 52 | 7.1 |
| P²nP-F-1 | 35.62 | 200 | 27.3 | 31.98 | 200 | 27.4 | 34.16 | 200 | 27.5 | 31.89 | 200 | 27.6 | 35.13 | 200 | 27.3 |
| P²nP-F-Cheb | 35.30 | 26 | 3.5 | 31.18 | 35 | 4.8 | 33.64 | 30 | 4.1 | 31.42 | 28 | 3.8 | 34.77 | 25 | 3.4 |
| P²nP-F-Cheb | **36.01** | 200 | 27.3 | **32.67** | 200 | 27.6 | **34.62** | 200 | 27.5 | 32.45 | 200 | 27.7 | 35.54 | 200 | 27.4 |
| P²nP-D | 35.38 | 19 | 1.4 | 31.20 | 20 | 1.5 | 33.76 | 19 | 1.4 | 31.76 | 17 | 1.3 | 34.85 | 20 | 1.5 |
| P²nP-D | 35.95 | 200 | 14.6 | 32.56 | 200 | 14.6 | 34.27 | 200 | 14.7 | **33.11** | 200 | 14.6 | **36.06** | 200 | 14.5 |

### C. 收敛性验证

本部分研究 P²nP 的收敛性。记 \(E(\mathbf x_k)=\|\mathbf x_k-D_\sigma(\mathbf x_k-\alpha\mathbf P\nabla f(\mathbf x_k))\|_2^2/\|\mathbf x_1\|_2^2\)，因此若 \(\mathbf x_k\to\mathbf x^*\)（\(\mathbf x^*\) 表示定点），则 \(E(\mathbf x_k)\to0\)。图 7(a) 给出 PnP-ISTA、P²nP-F-1 与 P²nP-F-Cheb 的 \(E(\mathbf x_k)\) 随迭代的变化，可以看到所有被测方法的 \(E(\mathbf x_k)\) 都趋于 0，且 P²nP 比 PnP-ISTA 收敛更快。我们还注意到阴影区域非常小，说明不同测试图像上的收敛性质相近。图 7(b) 给出 P²nP-D 的 \(\|\nabla f(\mathbf x_k)\|_2^2/\|\mathbf x_1\|_2^2\)，可见该量在第一次迭代取得最大值并趋于零，说明 \(R=\|\nabla f(\mathbf x_1)\|\)。

我们用 \(\rho_k\triangleq(\|\mathbf x_{k+1}-\mathbf x_k\|_2/\|\mathbf x_2-\mathbf x_1\|_2)^{1/k}\)（\(k\ge1\)）度量经验收敛速率，其中 \(\rho_k<1\) 意味着 \(\|\mathbf x_{k+1}-\mathbf x_k\|_2\) 趋于零。图 8 给出 PnP-ISTA 与带固定、动态预条件子的 P²nP 的 \(\rho_k\) 随迭代的变化。

### D. 普通去噪器与归一化等变去噪器比较

图 9 比较脑部测试图像上分别使用普通去噪器与归一化等变（"Norm-Equiv"）去噪器时 PnP-ISTA 的 PSNR。使用"Norm-Equiv"去噪器的 PnP-ISTA 的 PSNR 显著高于普通去噪器，且对运行更多迭代更稳健。这是因为相较普通去噪器，"Norm-Equiv"去噪器对噪声水平变化更稳健、更具自适应性 [66]。文献 [65] 说明了在 PnP 框架中为去噪器选择合适的噪声水平的重要性；我们的实验表明，"Norm-Equiv"去噪器可以成为自动处理该问题的颇有吸引力的选择。

## V. 结论

本文提出一种具有可证明收敛性的预条件 PnP 方法（P²nP）。我们表明，在 CS MRI 重建中 P²nP 能显著加快其无预条件对应算法的收敛速度。由于 CS MRI 的前向模型与患者有关，我们提出两种高效计算预条件子的策略（固定与动态）。相应数值实验证明，使用预条件子加速螺旋与径向轨迹 MRI 重建是有效且高效的。此外，我们在 PnP 框架中引入了归一化等变去噪器的使用。通过提供一种自适应方式来处理 PnP 中的噪声水平调参问题，使用归一化等变去噪器不仅使式 (13) 得以"求解"，还显著提高了重建 PSNR。

动态预条件子不要求对前向模型有任何显式知识，使其有望成为用 PnP 求解非线性反问题（如全波形反演 [72]）的高效求解器。另一个有前景的方向是对 P²nP 进行展开（unroll），这可能得到比其他方法更高效的图像重建网络。这些问题的进一步研究留待未来工作。

## 附录 A：定理 1 的证明

算法 1 的更新格式可写为 \(\mathbf x_{k+1}=T(\mathbf x_k)\)，其中 \(T(\mathbf x)\triangleq D_\sigma(\mathbf x-\alpha\mathbf P\nabla f(\mathbf x))\)。由 Banach 不动点定理，若映射 \(T(\mathbf x)\) 是压缩映射，则算法 1 保证收敛到定点。因此若 \(\mathbf x^*\) 是 \(T(\mathbf x)\) 的定点、即 \(\mathbf x^*=T(\mathbf x^*)\)，则在假设 1 下有

$$
\|\mathbf x_{k+1}-\mathbf x^*\|=\|T(\mathbf x_k)-T(\mathbf x^*)\|
$$
$$
=\|D_\sigma(\mathbf x_k-\alpha\mathbf P\nabla f(\mathbf x_k))-D_\sigma(\mathbf x^*-\alpha\mathbf P\nabla f(\mathbf x^*))\|
$$
$$
\le(1+\epsilon)\|\mathbf x_k-\mathbf x^*-\alpha\mathbf P(\nabla f(\mathbf x_k)-\nabla f(\mathbf x^*))\|
$$
$$
=(1+\epsilon)\|\mathbf x_k-\mathbf x^*-\alpha\mathbf P\mathbf A^H\mathbf A(\mathbf x_k-\mathbf x^*)\|
$$
$$
\le(1+\epsilon)\|\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A\|\cdot\|\mathbf x_k-\mathbf x^*\|.
$$

显然，若 \((1+\epsilon)\rho(\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A)<1\)，则算法 1 的迭代保证收敛，且收敛速率至多为 \((1+\epsilon)\rho(\mathbf I-\alpha\mathbf P\mathbf A^H\mathbf A)\)。

## 附录 B：引理 1 的证明

\(\tau_k\) 与 \(\langle\mathbf s_k,\mathbf v_k\rangle\) 为实数的证明来自 [7, 观察 1]。利用 \(\nabla f(\mathbf x)=\mathbf A^H(\mathbf A\mathbf x-\mathbf y)\)，并沿用 [64, 引理 A.3 与定理 4.2] 的推导，可以容易地证明 \(\langle\mathbf s_k-\tau_k\mathbf v_k,\mathbf v_k\rangle\) 非负以及 \(\tau_k\)、\(\mathbf P_k\) 的界，故此处省略细节。这里得到的 \(\mathbf P_k\) 界比 [64, 定理 4.2] 中给出的界紧得多：后者的界依赖图像尺寸，而本文的界不依赖。若考虑复平面上的通用非线性反问题，则引理 1 一般不再成立。

## 附录 C：定理 2 的证明

算法 3 在第 \(k\) 次迭代的更新格式可表示为 \(\mathbf x_{k+1}=T_k(\mathbf x_k)\)，其中 \(T_k(\mathbf x)=D_\sigma(\mathbf x-\alpha\mathbf P_k\nabla f(\mathbf x))\)。于是

$$
\|\mathbf x_{k+1}-\mathbf x^*\|\le(1+\epsilon)\|\mathbf x_k-\mathbf x^*-\alpha(\mathbf P_k\nabla f(\mathbf x_k)-\mathbf P^*\nabla f(\mathbf x^*))\|
$$
$$
\le(1+\epsilon)\|\mathbf I-\alpha\mathbf P^*\mathbf A^H\mathbf A\|\|\mathbf x_k-\mathbf x^*\|+(1+\epsilon)\alpha\|(\mathbf P_k-\mathbf P^*)\nabla f(\mathbf x_k)\|
$$
$$
\le q^k\|\mathbf x_1-\mathbf x^*\|+(1+\epsilon)\alpha\sum_{m=1}^{k}q^{k-m}\|(\mathbf P_m-\mathbf P^*)\nabla f(\mathbf x_m)\|
$$
$$
\le q^k\|\mathbf x_1-\mathbf x^*\|+(1+\epsilon)\alpha R\beta\sum_{m=1}^{k}q^{k-m}
\le q^k\|\mathbf x_1-\mathbf x^*\|+\frac{(1+\epsilon)\alpha R\beta}{1-q},
$$

其中 \(q\triangleq\left[(1+\epsilon)\rho(\mathbf I-\alpha\mathbf P^*\mathbf A^H\mathbf A)\right]\)，\(\beta\triangleq\max_{m\le k}\|\mathbf P_m-\mathbf P^*\|\le\max_{m\le k}\|\mathbf P_m\|+\|\mathbf P^*\|\le\frac{\delta+1}{\delta\theta_1}+\lambda^*\)。第一个不等式来自假设 1；第二个不等式由三角不等式与 Cauchy–Schwarz 不等式得到；第三个不等式通过递归应用前两个不等式得到；第四个不等式来自 \(R\) 与 \(\beta\) 的定义。

## 参考文献（英文原书目）

[1] K. P. Pruessmann, M. Weiger, M. B. Scheidegger, and P. Boesiger, “SENSE: sensitivity encoding for fast MRI,” Magnetic Resonance in Medicine, vol. 42, no. 5, pp. 952–962, 1999.

[2] M. A. Griswold, P. M. Jakob, R. M. Heidemann, M. Nittka, V. Jellus, J. Wang, B. Kiefer, and A. Haase, “Generalized autocalibrating partially parallel acquisitions (GRAPPA),” Magnetic Resonance in Medicine, vol. 47, no. 6, pp. 1202–1210, 2002.

[3] A. Deshmane, V. Gulani, M. A. Griswold, and N. Seiberlich, “Parallel MR imaging,” Journal of Magnetic Resonance Imaging, vol. 36, no. 1, pp. 55–72, 2012.

[4] M. Lustig, D. Donoho, and J. M. Pauly, “Sparse MRI: The application of compressed sensing for rapid MR imaging,” Magnetic Resonance in Medicine, vol. 58, no. 6, pp. 1182–1195, 2007.

[5] M. Lustig, D. L. Donoho, J. M. Santos, and J. M. Pauly, “Compressed sensing MRI,” IEEE Signal Processing Magazine, vol. 25, no. 2, pp. 72–82, 2008.

[6] L. I. Rudin, S. Osher, and E. Fatemi, “Nonlinear total variation based noise removal algorithms,” Physica D: Nonlinear Phenomena, vol. 60, no. 1-4, pp. 259–268, 1992.

[7] T. Hong, L. Hernandez-Garcia, and J. A. Fessler, “A complex quasi-Newton proximal method for image reconstruction in compressed sensing MRI,” IEEE Transactions on Computational Imaging, vol. 10, pp. 372–384, Feb. 2024.

[8] M. Guerquin-Kern, M. Haberlin, K. P. Pruessmann, and M. Unser, “A fast wavelet-based reconstruction method for magnetic resonance imaging,” IEEE Transactions on Medical Imaging, vol. 30, no. 9, pp. 1649–1660, 2011.

[9] M. V. Zibetti, E. S. Helou, R. R. Regatte, and G. T. Herman, “Monotone FISTA with variable acceleration for compressed sensing magnetic resonance imaging,” IEEE Transactions on Computational Imaging, vol. 5, no. 1, pp. 109–119, 2018.

[10] M. Aharon, M. Elad, and A. Bruckstein, “K-SVD: An algorithm for designing overcomplete dictionaries for sparse representation,” IEEE Transactions on Signal Processing, vol. 54, no. 11, pp. 4311–4322, 2006.

[11] S. Ravishankar and Y. Bresler, “MR image reconstruction from highly undersampled k-space data by dictionary learning,” IEEE Transactions on Medical Imaging, vol. 30, no. 5, pp. 1028–1041, 2011.

[12] W. Dong, G. Shi, X. Li, Y. Ma, and F. Huang, “Compressive sensing via nonlocal low-rank regularization,” IEEE Transactions on Image Processing, vol. 23, no. 8, pp. 3618–3632, 2014.

[13] J. A. Fessler, “Model-based image reconstruction for MRI,” IEEE Signal Processing Magazine, vol. 27, no. 4, pp. 81–9, Jul. 2010.

[14] ——, “Optimization methods for magnetic resonance image reconstruction: Key models and optimization algorithms,” IEEE Signal Processing Magazine, vol. 37, no. 1, pp. 33–40, 2020.

[15] S. Wang, Z. Su, L. Ying, X. Peng, S. Zhu, F. Liang, D. Feng, and D. Liang, “Accelerating magnetic resonance imaging via deep learning,” in IEEE 13th International Symposium on Biomedical Imaging (ISBI). IEEE, 2016, pp. 514–517.

[16] H. K. Aggarwal, M. P. Mani, and M. Jacob, “MoDL: Model-based deep learning architecture for inverse problems,” IEEE Transactions on Medical Imaging, vol. 38, no. 2, pp. 394–405, 2018.

[17] D. Gilton, G. Ongie, and R. Willett, “Deep equilibrium architectures for inverse problems in imaging,” IEEE Transactions on Computational Imaging, vol. 7, pp. 1123–1133, 2021.

[18] T. Chen, X. Chen, W. Chen, H. Heaton, J. Liu, Z. Wang, and W. Yin, “Learning to optimize: A primer and a benchmark,” Journal of Machine Learning Research, vol. 23, no. 189, pp. 1–59, 2022.

[19] Z. Ramzi, G. Chaithya, J.-L. Starck, and P. Ciuciu, “NC-PDNet: A density-compensated unrolled network for 2D and 3D non-Cartesian MRI reconstruction,” IEEE Transactions on Medical Imaging, vol. 41, no. 7, pp. 1625–1638, 2022.

[20] Z. Wang, X. Yu, C. Wang, W. Chen, J. Wang, Y.-H. Chu, H. Sun, R. Li, P. Li, F. Yang et al., “One for multiple: Physics-informed synthetic data boosts generalizable deep learning for fast MRI reconstruction,” arXiv preprint arXiv:2307.13220, 2023.

[21] Y. Song, L. Shen, L. Xing, and S. Ermon, “Solving inverse problems in medical imaging with score-based generative models,” in International Conference on Learning Representations, 2021.

[22] H. Chung and J. C. Ye, “Score-based diffusion models for accelerated MRI,” Medical Image Analysis, vol. 80, p. 102479, 2022.

[23] S. V. Venkatakrishnan, C. A. Bouman, and B. Wohlberg, “Plug-and-play priors for model based reconstruction,” in IEEE Global Conference on Signal and Information Processing. IEEE, 2013, pp. 945–948.

[24] K. Dabov, A. Foi, V. Katkovnik, and K. Egiazarian, “Image denoising by sparse 3-D transform-domain collaborative filtering,” IEEE Transactions on Image Processing, vol. 16, no. 8, pp. 2080–2095, 2007.

[25] K. Zhang, W. Zuo, Y. Chen, D. Meng, and L. Zhang, “Beyond a Gaussian denoiser: Residual learning of deep cnn for image denoising,” IEEE Transactions on Image Processing, vol. 26, no. 7, pp. 3142–3155, 2017.

[26] S. Sreehari, S. V. Venkatakrishnan, B. Wohlberg, G. T. Buzzard, L. F. Drummy, J. P. Simmons, and C. A. Bouman, “Plug-and-play priors for bright field electron tomography and sparse interpolation,” IEEE Transactions on Computational Imaging, vol. 2, no. 4, pp. 408–423, 2016.

[27] S. Ono, “Primal-dual plug-and-play image restoration,” IEEE Signal Processing Letters, vol. 24, no. 8, pp. 1108–1112, 2017.

[28] T. Meinhardt, M. Moeller, C. Hazirbas, and D. Cremers, “Learning proximal operators: Using denoising networks for regularizing inverse imaging problems,” in Proceedings of the IEEE International Conference on Computer Vision, Venice, Italy, Oct. 2017, pp. 1799–1808.

[29] G. T. Buzzard, S. H. Chan, S. Sreehari, and C. A. Bouman, “Plug-and-Play unplugged: Optimization free reconstruction using consensus equilibrium,” SIAM Journal on Imaging Sciences, vol. 11, no. 3, pp. 2001–2020, 2018.

[30] W. Dong, P. Wang, W. Yin, G. Shi, F. Wu, and X. Lu, “Denoising prior driven deep neural network for image restoration,” IEEE Transactions on Pattern Analysis and Machine Intelligence, vol. 41, no. 10, pp. 2305–2318, Oct. 2019.

[31] K. Zhang, Y. Li, W. Zuo, L. Zhang, L. Van Gool, and R. Timofte, “Plug-and-play image restoration with deep denoiser prior,” IEEE Transactions on Pattern Analysis and Machine Intelligence, vol. 44, no. 10, pp. 6360–6376, 2021.

[32] S. Shoushtari, J. Liu, E. P. Chandler, M. S. Asif, and U. S. Kamilov, “Prior mismatch and adaptation in pnp-admm with a nonconvex convergence analysis,” arXiv preprint arXiv:2310.00133, 2023.

[33] R. Ahmad, C. A. Bouman, G. T. Buzzard, S. Chan, S. Liu, E. T. Reehorst, and P. Schniter, “Plug-and-play methods for magnetic resonance imaging: Using denoisers for image recovery,” IEEE Signal Processing Magazine, vol. 37, no. 1, pp. 105–116, 2020.

[34] N. Parikh, S. Boyd et al., “Proximal algorithms,” Foundations and Trends® in Optimization, vol. 1, no. 3, pp. 127–239, 2014.

[35] A. Beck and M. Teboulle, “A fast iterative shrinkage-thresholding algorithm for linear inverse problems,” SIAM Journal on Imaging Sciences, vol. 2, no. 1, pp. 183–202, 2009.

[36] S. H. Chan, X. Wang, and O. A. Elgendy, “Plug-and-play admm for image restoration: Fixed-point convergence and applications,” IEEE Transactions on Computational Imaging, vol. 3, no. 1, pp. 84–98, 2017.

[37] S. Boyd, N. Parikh, E. Chu, B. Peleato, J. Eckstein et al., “Distributed optimization and statistical learning via the alternating direction method of multipliers,” Foundations and Trends® in Machine Learning, vol. 3, no. 1, pp. 1–122, 2011.

[38] K. Zhang, W. Zuo, S. Gu, and L. Zhang, “Learning deep CNN denoiser prior for image restoration,” in IEEE Conference on Computer Vision and Pattern Recognition, 2017, pp. 3929–3938.

[39] Y. Romano, M. Elad, and P. Milanfar, “The little engine that could: Regularization by denoising (RED),” SIAM Journal on Imaging Sciences, vol. 10, no. 4, pp. 1804–1844, 2017.

[40] T. Hong, Y. Romano, and M. Elad, “Acceleration of RED via vector extrapolation,” Journal of Visual Communication and Image Representation, p. 102575, 2019.

[41] E. T. Reehorst and P. Schniter, “Regularization by denoising: Clarifications and new interpretations,” IEEE Transactions on Computational Imaging, vol. 5, no. 1, pp. 52–67, 2019.

[42] H. Y. Tan, S. Mukherjee, J. Tang, and C.-B. Schönlieb, “Provably convergent plug-and-play quasi-Newton methods,” SIAM Journal on Imaging Sciences, vol. 17, no. 2, pp. 785–819, 2024.

[43] M. L. Pendu and C. Guillemot, “Preconditioned plug-and-play ADMM with locally adjustable denoiser for image restoration,” SIAM Journal on Imaging Sciences, vol. 16, no. 1, pp. 393–422, 2023.

[44] A. M. Teodoro, J. M. Bioucas-Dias, and M. A. T. Figueiredo, “A convergent image fusion algorithm using scene-adapted gaussian-mixture-based denoising,” IEEE Transactions on Image Processing, vol. 28, no. 1, pp. 451–463, Jan. 2019.

[45] R. G. Gavaskar, C. D. Athalye, and K. N. Chaudhury, “On plug-and-play regularization using linear denoisers,” IEEE Transactions on Image Processing, vol. 30, pp. 4802–4813, 2021.

[46] Y. Sun, B. Wohlberg, and U. S. Kamilov, “An online plug-and-play algorithm for regularized image reconstruction,” IEEE Transactions on Computational Imaging, vol. 5, no. 3, pp. 395–408, Sep. 2019.

[47] E. Ryu, J. Liu, S. Wang, X. Chen, Z. Wang, and W. Yin, “Plug-and-play methods provably converge with properly trained denoisers,” in International Conference on Machine Learning. PMLR, 2019, pp. 5546–5557.

[48] Y. Sun, Z. Wu, X. Xu, B. Wohlberg, and U. S. Kamilov, “Scalable plug-and-play ADMM with convergence guarantees,” IEEE Transactions on Computational Imaging, vol. 7, pp. 849–863, 2021.

[49] M. Terris, A. Repetti, J.-C. Pesquet, and Y. Wiaux, “Building firmly nonexpansive convolutional neural networks,” in IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP). IEEE, 2020, pp. 8658–8662.

[50] X. Xu, Y. Sun, J. Liu, B. Wohlberg, and U. S. Kamilov, “Provable convergence of plug-and-play priors with MMSE denoisers,” IEEE Signal Processing Letters, vol. 27, pp. 1280–1284, 2020.

[51] J. Liu, S. Asif, B. Wohlberg, and U. Kamilov, “Recovery analysis for plug-and-play priors using the restricted eigenvalue condition,” Advances in Neural Information Processing Systems, vol. 34, pp. 5921–5933, 2021.

[52] R. Cohen, M. Elad, and P. Milanfar, “Regularization by denoising via fixed-point projection (RED-PRO),” SIAM Journal on Imaging Sciences, vol. 14, no. 3, pp. 1374–1406, 2021.

[53] B. Iskender, M. L. Klasky, and Y. Bresler, “RED-PSM: Regularization by denoising of factorized low rank models for dynamic imaging,” IEEE Transactions on Computational Imaging, vol. 10, pp. 832–847, 2024.

[54] U. S. Kamilov, C. A. Bouman, G. T. Buzzard, and B. Wohlberg, “Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications,” IEEE Signal Processing Magazine, vol. 40, no. 1, pp. 85–97, 2023.

[55] Z. Aminifard and S. Babaie-Kafaki, “An approximate Newton-type proximal method using symmetric rank-one updating formula for minimizing the nonsmooth composite functions,” Optimization Methods and Software, vol. 38, no. 3, pp. 529–542, 2023.

[56] M. J. Grote and T. Huckle, “Parallel preconditioning with sparse approximate inverses,” SIAM Journal on Scientific Computing, vol. 18, no. 3, pp. 838–853, 1997.

[57] N. I. Gould and J. A. Scott, “Sparse approximate-inverse preconditioners using norm-minimization techniques,” SIAM Journal on Scientific Computing, vol. 19, no. 2, pp. 605–625, 1998.

[58] O. G. Johnson, C. A. Micchelli, and G. Paul, “Polynomial preconditioners for conjugate gradient calculations,” SIAM Journal on Numerical Analysis, vol. 20, no. 2, pp. 362–376, 1983.

[59] M. Zulfiquar Ali Bhotto, M. O. Ahmad, and M. Swamy, “An improved fast iterative shrinkage thresholding algorithm for image deblurring,” SIAM Journal on Imaging Sciences, vol. 8, no. 3, pp. 1640–1657, 2015.

[60] S. S. Iyer, F. Ong, X. Cao, C. Liao, L. Daniel, J. I. Tamir, and K. Setsompop, “Polynomial preconditioners for regularized linear inverse problems,” SIAM Journal on Imaging Sciences, vol. 17, no. 1, pp. 116–146, 2024.

[61] J. Nocedal and S. J. Wright, Numerical Optimization. Springer, 2006.

[62] M. Osborne and L. Sun, “A new approach to symmetric rank-one updating,” IMA Journal of Numerical Analysis, vol. 19, no. 4, pp. 497–507, 1999.

[63] F. Curtis, “A self-correcting variable-metric algorithm for stochastic optimization,” in International Conference on Machine Learning. PMLR, 2016, pp. 632–641.

[64] X. Wang, X. Wang, and Y.-X. Yuan, “Stochastic proximal quasi-Newton methods for non-convex composite optimization,” Optimization Methods and Software, vol. 34, no. 5, pp. 922–948, 2019.

[65] X. Xu, J. Liu, Y. Sun, B. Wohlberg, and U. S. Kamilov, “Boosting the performance of plug-and-play priors via denoiser scaling,” in 2020 54th Asilomar Conference on Signals, Systems, and Computers. IEEE, 2020, pp. 1305–1312.

[66] S. Herbreteau, E. Moebel, and C. Kervrann, “Normalization-equivariant neural networks with application to image denoising,” Advances in Neural Information Processing Systems, vol. 36, 2024.

[67] J. Zbontar, F. Knoll, A. Sriram, T. Murrell, Z. Huang, M. J. Muckley, A. Defazio, R. Stern, P. Johnson, M. Bruno et al., “fastMRI: An open dataset and benchmarks for accelerated MRI,” arXiv preprint arXiv:1811.08839, 2018.

[68] M. Uecker, P. Lai, M. J. Murphy, P. Virtue, M. Elad, J. M. Pauly, S. S. Vasanawala, and M. Lustig, “ESPIRiT—an eigenvalue approach to autocalibrating parallel MRI: where SENSE meets GRAPPA,” Magnetic Resonance in Medicine, vol. 71, no. 3, pp. 990–1001, 2014.

[69] D. Kingma and J. Ba, “Adam: A method for stochastic optimization,” arXiv preprint arXiv:1412.6980, 2014.

[70] A. Paszke, S. Gross, F. Massa, A. Lerer, J. Bradbury, G. Chanan, T. Killeen, Z. Lin, N. Gimelshein, L. Antiga et al., “Pytorch: An imperative style, high-performance deep learning library,” Advances in Neural Information Processing Systems, vol. 32, 2019.

[71] J. G. Pipe and P. Menon, “Sampling density compensation in mri: rationale and an iterative numerical solution,” Magnetic Resonance in Medicine, vol. 41, no. 1, pp. 179–186, 1999.

[72] L. Métivier, R. Brossier, J. Virieux, and S. Operto, “Full waveform inversion and the truncated Newton method,” SIAM Journal on Scientific Computing, vol. 35, no. 2, pp. B401–B437, 2013.

## 补充材料

**补充材料：压缩感知 MRI 重建的可证明预条件即插即用方法**  
作者：Tao Hong（IEEE 会员）、Xiaojian Xu（IEEE 会员）、Jason Hu（IEEE 学生会员）、Jeffrey A. Fessler（IEEE 会士）

### S.I. 螺旋采集重建

图 S.1 给出膝部 1 图像在螺旋采集下 PSNR 随迭代与实际耗时的变化。可以看到 P²nP-F-1/Cheb 与 P²nP-D 在迭代次数与实际耗时上都比 PnP-ISTA 与 PnP-ADMM 收敛更快。此外，P²nP-D 在耗时上比 P²nP-F-Cheb 更快，但 P²nP-F-Cheb 最终取得更高的 PSNR。该设置下 P²nP-F-1 在耗时上仅比 PnP-ISTA 与 PnP-ADMM 略快。图 S.2 给出各方法的重建图像。显然，P²nP 以更少迭代次数取得比 PnP-ISTA 与 PnP-ADMM 更高的 PSNR，说明使用预条件子有效。表 S.I 描述其他膝部测试图像的结果；显然，在脑部测试图像上可观察到相似趋势。

> **原文疑点：** 表 S.I 的表题写作 "5 other brain test images"（脑部），但本节正文称 "Table S.I describes the results of other knee test images"（膝部），两处不一致；本页按表题照录（brain），保留原文措辞。此外表 S.II 的表题亦写作 "brain test images"。

### S.II. 径向采集重建

图 S.3 描述脑部 1 测试图像在径向采集下 PSNR 随迭代与实际耗时的变化。由图 S.3 可见 P²nP 比 PnP-ISTA 与 PnP-ADMM 收敛更快；此外 P²nP-D 在迭代次数上与 P²nP-F-Cheb 相近，但在耗时上更快。表 S.II 给出其他测试图像的结果，说明加入预条件子的有效性。

### S.III. 55 条辐条的径向采集重建

图 S.5 描述膝部 1 测试图像在 55 条辐条径向采集下的重建。显然，21 条辐条径向采集中的不良伪影消失，P²nP-D 在第 200 次迭代取得最高 PSNR。

### S.IV. 笛卡尔采集重建

本节给出采用笛卡尔采样的结果。图 S.6 描述膝部 1 图像的下采样掩膜，并比较各方法 PSNR 随迭代与实际耗时的变化。此外我们还测试了脑部 1 图像，结果见图 S.7。由图 S.6 与 S.7 可见，P²nP 仍优于 PnP-ISTA，说明本文方法的有效性。

### S.V. 非笛卡尔采样中的加速因子

本节描述我们计算非笛卡尔采样加速因子（acceleration factor，AF）的方法。为免混淆，本节所用记号自成体系。对径向采集，用下式计算加速因子（AF）：

$$
{\rm AF}=\frac{N_{\rm spokes,fully\ sampled}}{N_{\rm spokes,acquired}}.
$$

我们通过笛卡尔采样中的相位编码线数来近似 \(N_{\rm spokes,fully\ sampled}\)。对螺旋采集，完整覆盖 k 空间所需的交错数应保证相邻螺旋臂间距满足 Nyquist 准则，即

$$
N_{\rm interleaves}=\frac{2\pi k_{\max}}{\Delta k},
$$

其中 \(k_{\max}=\frac1{2\Delta x}\)（\(\Delta x\) 表示图像分辨率），且 \(\Delta k\le\frac1{\rm FOV}\)。于是

$$
N_{\rm interleaves}=\pi\times\frac{\rm FOV}{\Delta x}=\pi\times{\rm Matrix\ Size},
$$

从而

$$
{\rm AF}=\frac{N_{\rm interleaves}}{N_{\rm acquired,interleaves}}.
$$

## 图注与表注

**图 1（原文 Fig. 1）：** 六幅脑部与膝部复值真值图像的幅度。(a)–(f) 为脑部 1–6，(g)–(l) 为膝部 1–6。

**图 2（原文 Fig. 2）：** 本文使用的非笛卡尔 k 空间采样轨迹。(a) 螺旋（Spiral）；(b) 径向（Radial）。

**图 3（原文 Fig. 3）：** 螺旋采集下脑部 1 图像的 PSNR 随 (a) 迭代次数与 (b) 实际耗时（GPU）的变化；曲线包含 P²nP-D、P²nP-F-Cheb、P²nP-F-1、PnP-ISTA 与 PnP-ADMM。

**图 4（原文 Fig. 4）：** 螺旋采集下脑部 1 图像在第 25、50、100、200 次迭代的重建结果；每个图像左下角标注 PSNR，第五列为第 200 次迭代重建图像的误差图（\(\times5\)）。由于 PnP-ADMM 结果与 PnP-ISTA 类似，图中省略；DC 表示基于密度补偿的重建；加速因子约为 130。

**图 5（原文 Fig. 5）：** 径向采集下膝部 1 图像的 PSNR 随 (a) 迭代次数与 (b) 实际耗时（GPU）的变化。

**图 6（原文 Fig. 6）：** 径向采集下膝部 1 图像在第 25、50、100、200 次迭代的重建结果；每个图像左下角标注 PSNR，第五列为第 200 次迭代重建图像的误差图（\(\times5\)）。DC 表示基于密度补偿的重建；加速因子约为 12。

**图 7（原文 Fig. 7）：** (a) PnP-ISTA、P²nP-F-1 与 P²nP-F-Cheb 定点收敛性的数值测试（纵轴为 \(E(\mathbf x_k)\)）；(b) P²nP-D 的 \(\|\nabla f(\mathbf x_k)\|_2^2/\|\mathbf x_1\|_2^2\) 随迭代的变化。

> **原文疑点：** 图 7(b) 图注写作 "\(\|\nabla f(\mathbf x_k)\|\) values"，而正文与该子图纵轴标注为 \(\|\nabla f(\mathbf x_k)\|_2^2/\|\mathbf x_1\|_2^2\)；本页按图轴标注转写。

**图 8（原文 Fig. 8）：** PnP-ISTA、P²nP-F-1、P²nP-F-Cheb 与 P²nP-D 的收敛速率对比：在六幅脑部测试图像（螺旋采集）上平均的 \(\rho_k\)；每条曲线的阴影区域表示各脑部测试图像上 \(\rho_k\) 的范围（右图为末段放大）。

**图 9（原文 Fig. 9）：** PnP-ISTA 分别使用归一化等变去噪器与普通去噪器时、随迭代变化的平均 PSNR；每条曲线的阴影区域表示螺旋采集下各脑部测试图像 PSNR 的范围。

**表 I（原文 Table I）：** PnP-ISTA/ADMM 与 P²nP 的算法流程汇总（见第 IV 节"算法设置"处）。

**表 II（原文 Table II）：** 螺旋采集下各方法对另外 5 幅脑部测试图像的重建 PSNR 性能；表注与颜色约定见该表。

**表 III（原文 Table III）：** 各方法对另外 5 幅膝部测试图像在径向采集下的重建性能；表注与颜色约定见该表。

**图 S.1（原文 Fig. S.1）：** 螺旋采集下膝部 1 测试图像的 PSNR 随 (a) 迭代次数与 (b) 实际耗时（GPU）的变化。

**图 S.2（原文 Fig. S.2）：** 螺旋采集下膝部 1 图像在第 25、50、100、200 次迭代的重建结果；每个图像左下角标注 PSNR，第五列为第 200 次迭代重建图像的误差图（\(\times5\)）。因 PnP-ADMM 结果与 PnP-ISTA 类似而省略；DC 表示基于密度补偿的重建；加速因子约为 130。

**图 S.3（原文 Fig. S.3）：** 径向采集下脑部 1 测试图像的 PSNR 随 (a) 迭代次数与 (b) 实际耗时（GPU）的变化。

**图 S.4（原文 Fig. S.4）：** 径向采集下脑部 1 图像在不同算法下第 25、50、100、200 次迭代的重建结果；每个图像左下角标注 PSNR，第五列为第 200 次迭代重建图像的误差图（\(\times5\)）。DC 表示基于密度补偿的重建；加速因子约为 12。

**图 S.5（原文 Fig. S.5）：** 55 条辐条径向采集下膝部 1 图像在第 25、50、100、200 次迭代的重建结果；第五列为第 200 次迭代重建图像的误差图（\(\times5\)）。

**图 S.6（原文 Fig. S.6）：** 笛卡尔采样下膝部 1 图像的下采样掩膜（a），以及 PSNR 随 (b) 迭代次数与 (c) 实际耗时的变化；加速因子为 2。

**图 S.7（原文 Fig. S.7）：** 笛卡尔采样下脑部 1 图像的 PSNR 随 (a) 迭代次数与 (b) 实际耗时的变化。

**表 S.I（原文 Table S.I）：** 螺旋采集下各方法对另外 5 幅（表题写作 brain）测试图像的重建 PSNR 性能。

| 方法 | 2 PSNR↑ | iter.↓ | sec.↓ | 3 PSNR↑ | iter.↓ | sec.↓ | 4 PSNR↑ | iter.↓ | sec.↓ | 5 PSNR↑ | iter.↓ | sec.↓ | 6 PSNR↑ | iter.↓ | sec.↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PnP-ADMM | 37.85 | 200 | 147.8 | 34.33 | 200 | 148 | 34.96 | 200 | 147.4 | 33.53 | 200 | 148.9 | 34.24 | 200 | 147.8 |
| PnP-ISTA | 37.85 | 200 | 14.6 | 34.33 | 199 | 14.6 | 34.96 | 199 | 14.5 | 33.54 | 199 | 14.4 | 34.25 | 199 | 14.5 |
| PnP-ISTA | 37.85 | 200 | 14.6 | 34.34 | 200 | 14.7 | 34.97 | 200 | 14.6 | 33.55 | 200 | 14.5 | 34.26 | 200 | 14.6 |
| P²nP-F-1 | 37.85 | 75 | 10.3 | 34.36 | 85 | 11.7 | 34.96 | 84 | 11.5 | 33.57 | 87 | 11.8 | 34.27 | 90 | 12.3 |
| P²nP-F-1 | 39.03 | 200 | 27.4 | 36.43 | 200 | 27.5 | 36.73 | 200 | 27.5 | 35.92 | 200 | 27.2 | 36.44 | 200 | 27.4 |
| P²nP-F-Cheb | 37.91 | 37 | 5 | 34.36 | 41 | 5.7 | 34.99 | 41 | 5.6 | 33.56 | 42 | 5.7 | 34.28 | 44 | 6.1 |
| P²nP-F-Cheb | 39.66 | 200 | 27.5 | 38.03 | 200 | 27.5 | **38.15** | 200 | 27.5 | 37.77 | 200 | 27.4 | 38.14 | 200 | 27.5 |
| P²nP-D | 38.34 | 36 | 2.6 | 34.33 | 21 | 1.5 | 35.06 | 26 | 1.9 | 33.58 | 35 | 2.6 | 34.29 | 23 | 1.7 |
| P²nP-D | **39.80** | 200 | 14.6 | **38.23** | 200 | 14.5 | 37.90 | 200 | 14.8 | **38.04** | 200 | 14.6 | **38.21** | 200 | 14.6 |

**表 S.II（原文 Table S.II）：** 径向采集下各方法对另外 5 幅脑部测试图像的重建性能。

| 方法 | 2 PSNR↑ | iter.↓ | sec.↓ | 3 PSNR↑ | iter.↓ | sec.↓ | 4 PSNR↑ | iter.↓ | sec.↓ | 5 PSNR↑ | iter.↓ | sec.↓ | 6 PSNR↑ | iter.↓ | sec.↓ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PnP-ADMM | 30.76 | 181 | 134.5 | 31.31 | 181 | 132.7 | 30.79 | 182 | 133.3 | 29.63 | 175 | 129.1 | 29.23 | 163 | 121.8 |
| PnP-ISTA | − | − | − | − | − | − | − | − | − | − | − | − | − | − | − |
| PnP-ISTA | 30.73 | 200 | 14.5 | 31.29 | 200 | 14.3 | 30.77 | 200 | 14.4 | 29.59 | 200 | 14.4 | 29.14 | 200 | 14.4 |
| P²nP-F-1 | 30.77 | 66 | 9.0 | 31.31 | 64 | 8.7 | 30.81 | 65 | 8.8 | 29.64 | 61 | 8.4 | 29.24 | 58 | 8.0 |
| P²nP-F-1 | 31.38 | 200 | 27.4 | 31.95 | 200 | 27.3 | 31.46 | 200 | 27.2 | 30.25 | 200 | 27.3 | 29.67 | 200 | 27.5 |
| P²nP-F-Cheb | 30.80 | 33 | 4.6 | 31.35 | 32 | 4.4 | 30.83 | 32 | 4.3 | 29.66 | 30 | 4.1 | 29.23 | 28 | 3.8 |
| P²nP-F-Cheb | 31.93 | 200 | 27.7 | 32.50 | 200 | 27.3 | 32.03 | 200 | 27.1 | **30.82** | 200 | 27.2 | **30.13** | 200 | 27.3 |
| P²nP-D | 30.77 | 18 | 1.3 | 31.41 | 24 | 1.8 | 30.83 | 20 | 1.4 | 29.66 | 25 | 1.8 | 29.23 | 27 | 2.0 |
| P²nP-D | **32.07** | 200 | 14.7 | **32.68** | 200 | 14.3 | **32.04** | 200 | 14.4 | 30.51 | 200 | 14.5 | 28.70 | 200 | 14.5 |

> **表注：** 表 S.I 与 S.II 的粗体/蓝色约定与表 II 相同；本页以**加粗**标出各图像第 200 次迭代的最高 PSNR（按表中数值核对）。表 S.II 中 PnP-ISTA 第一行为"−"，表示该方法在 200 次迭代内无法超过 PnP-ADMM 的 PSNR。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–V 节全部正文与子节、算法 1–3、引理 1、定理 1–2、式 (1)–(15)、附录 A–C（定理 1、引理 1、定理 2 的完整证明）、正文图 1–9 与补充图 S.1–S.7 图注、表 I–III 与补充表 S.I–S.II（逐格转写，矢量表格均用 PDF 渲染页核对）、参考文献 [1]–[72]（英文原条目按原编号），以及补充材料 S.I–S.V（含加速因子计算式）。原文无致谢。需要说明：原文表 II/III/S.I/S.II 以"粗体/蓝色"标注最快算法与最高 PSNR，本页以加粗表示最高 PSNR 并在表注中说明；两处原文不一致（表 S.I 表题写作 brain 而正文写作 knee；图 7(b) 图注与图轴标注符号不同）已加"原文疑点"注。逐句逐式终校未做；供后续 QA 重点核对：表 II/III/S.I/S.II 中"首次超过 PnP-ADMM"的迭代/耗时、图 4/6/S.2/S.4/S.5 的逐方法 PSNR 标注（本页图注未逐列枚举这些数值，以免因抽取误差引入错误）。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
