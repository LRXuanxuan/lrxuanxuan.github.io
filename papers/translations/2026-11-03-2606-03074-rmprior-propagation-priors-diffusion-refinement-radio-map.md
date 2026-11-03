---
layout: page
title: "RMPrior：传播先验与扩散精修桥接的无线电地图高效构建｜中文全文译文"
permalink: /papers/translations/2026-11-03-2606-03074-rmprior-propagation-priors-diffusion-refinement-radio-map/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/df43fa3be5813f1c/) · [原文 arXiv](https://arxiv.org/abs/2606.03074/) · [全部目录](/papers/catalog/)

# RMPrior：传播先验与扩散精修桥接的无线电地图高效构建

**原题：** RMPrior: Bridging Propagation Priors and Diffusion Refinement for Efficient Radio Map Construction  
**作者：** Zixuan Guo*、Xiucheng Wang†、Nan Cheng†（*School of Physics, Xidian University 西安电子科技大学物理学院，西安 710071；†State Key Laboratory of ISN and School of Telecommunications Engineering, Xidian University 西安电子科技大学综合业务网理论及关键技术国家重点实验室与通信工程学院，西安 710071。单位按 PDF 首页原文转写；邮箱：24179100067@stu.xidian.edu.cn、xcwang_1@stu.xidian.edu.cn、dr.nan.cheng@ieee.org）  
**版本：** arXiv:2606.03074v1（v1 标注 2026-06-02）；6 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–V 节全部正文与小节（§II.A–B、§III.A–B、§IV.A–E）、定理 1–3、问题 1、式 (1)–(14)、表 I–III（逐格转写）、图 1–3 图注、参考文献 [1]–[15]（英文原条目）；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

## 摘要

扩散模型通过迭代去噪实现高保真的无线电地图构建，但其采样开销限制了它在动态无线系统中的实用性——在这些系统中，无线电地图必须被反复刷新。与此同时，经典传播模型编码了有价值的场景级知识，而标准扩散推理从纯高斯噪声出发初始化，把这部分知识完全丢弃。本文通过一种**中间起始（mid-start）采样策略**把传播先验与扩散精修桥接起来：匹配的传播先验被扰动到某个中间扩散时间步，预训练的扩散骨干只执行剩余的逆向步骤，从而把计算集中在多径感知的精修上，而不是从噪声出发做全量重建。我们给出理论分析：建立初始化间隙的上界、给出截断能够提升重建保真度的充分条件，并对激进截断下的先验质量敏感性给出形式化刻画。在 IRT4HighRes 上的实验表明，当 \(P_{\mathrm{start}}=0.5\) 时，所提方法取得 2.01× 加速，同时在 NMSE、RMSE、SSIM 与 PSNR 上相对全步基线均有提升。对三个不同保真度传播模型进行的先验质量消融证实：重建质量随先验质量变化，且该敏感性在更短的逆向轨迹下被放大，与理论预测一致。这些结果还表明，中间起始的重建质量可以作为给不同传播模型的场景级保真度排序的代理指标。

**关键词：** 无线电地图构建（Radio map construction）；扩散模型（diffusion model）；传播先验（propagation prior）；推理加速（inference acceleration）。

## 1 引言

无线电地图给出大规模无线传播的空间表示，是覆盖分析、部署规划、波束管理与环境感知网络控制的基础。因此，构建精确的无线电地图在模型驱动与数据驱动两个社区中都长期受到关注 [1]。经典方法依赖几何感知的传播模型，例如基于射线的近似与主径模型（dominant path model, DPM）[2]–[4]。这类基于物理的方法编码了关于传播环境的宝贵知识，包括主要反射与绕射路径、场景几何以及大尺度路损结构。然而，它们通常会简化或忽略高阶多径交互，这限制了它们在复杂室内与密集城市场景中的重建保真度。基于学习的方法（包括 RadioUNet、深度高斯过程估计器与基于 GAN 的方法）通过在实测或仿真无线电地图数据上训练，可以达到更高的保真度 [5]–[7]。这些模型在推理时通常很快，但它们作为直接回归器或一次性生成器工作，并不利用基于物理的模型所能提供的结构化传播知识。

扩散模型为无线电地图构建提供了更具表达力的生成框架。去噪扩散概率模型（DDPM）与去噪扩散隐式模型（DDIM）等基础形式表明，通过迭代去噪可以实现高保真合成 [8], [9]。在无线电地图领域，RadioDiff 与 RMDM 表明，基于扩散的重建在保真度指标上可以优于更早的基于学习的方法 [10], [11]；而面向效率的变体则探索更轻量的生成骨干，或在相关样本之间复用轨迹 [12], [13]。尽管有这些进展，迭代逆向采样仍然计算昂贵。在动态无线系统中，无线电地图必须跨发射机位置、候选部署位置或连续时隙反复刷新，这种累积推理成本会成为实际瓶颈。与此同时，经典模型所编码的传播知识在扩散推理期间基本未被使用：无论是否已有粗粒度但有信息量的先验，扩散推理总是从纯高斯噪声开始。

本文弥合基于物理的传播先验与基于扩散的精修之间的鸿沟。核心思想是：由 DPM 生成的匹配无线电地图已经捕捉了给定场景与发射机配置下的主要传播布局，这种结构化知识可以被注入扩散采样过程，以替代无信息量的纯噪声初始化。具体而言，我们把匹配的 DPM 无线电地图扰动到某个中间扩散时间步，并只在剩余轨迹上执行逆向去噪。于是扩散模型被用于多径感知的精修，而不是从零重建整张无线电地图。该中间起始策略是纯推理式的，不需要重训练基础扩散模型。我们在预训练的 RMDM [11] 骨干上实例化该策略，并在 IRT4HighRes 上评估：用完整测试域做主要比较，用稀疏子集做工作范围敏感性分析，用 720 样本的重叠子集做先验质量消融。先验质量消融进一步比较三个不同保真度的传播模型作为初始化来源，表明重建质量随先验质量变化，并提示中间起始扩散还可以作为评估不同传播模型场景级保真度的代理手段。主要贡献如下：

1. 我们提出一种纯推理的中间起始扩散采样策略，把传播先验与扩散精修桥接起来以构建无线电地图。匹配的 DPM 先验被扰动到某个中间扩散时间步，并用于在预训练 RMDM 骨干上初始化逆向过程，使扩散模型聚焦于残余多径的精修，而不是从噪声出发做全量重建。
2. 我们在一个包含 7920 个测试样本的高分辨率射线追踪无线电地图数据集上评估所提方法。当 \(P_{\mathrm{start}}=0.5\) 时，该方法把平均推理延迟降低 2.01×，同时在 NMSE、RMSE、SSIM 与 PSNR 上相对全步基线均有提升，说明基于物理的初始化不仅节省计算，还降低了累积采样误差。
3. 我们在 720 样本的重叠子集上，对三个不同保真度的传播模型进行先验质量消融。结果表明，随着先验信息量下降，重建质量持续退化，且这种敏感性在更激进的截断下增强。这一发现凸显了先验质量的核心作用，并提示中间起始扩散重建可以作为评估不同传播模型场景级精度的间接手段。

## 2 预备知识与问题表述

### 2.1 条件 DDPM

我们采用条件 DDPM 表述 [8]。令 \(x_0\in\mathbb R^{H\times W}\) 表示图像域中的目标无线电地图，其中每个像素编码对应空间位置处的路损值；并令 \(c\) 表示预训练扩散骨干所使用的条件信息。前向过程按照方差时间表 \(\{\beta_t\}_{t=1}^{T}\) 把干净无线电地图逐渐扰动为高斯噪声，其中 \(\alpha_t=1-\beta_t\)，\(\bar\alpha_t=\prod_{i=1}^{t}\alpha_i\)。时间步 \(t\) 处的前向边缘分布为

$$
q(x_t\mid x_0)=\mathcal N\left(x_t;\sqrt{\bar\alpha_t}x_0,(1-\bar\alpha_t)I\right).\tag{1}
$$

去噪网络 \(\epsilon_\theta(x_t,t,c)\) 在条件 \(c\) 下预测注入的噪声，并以条件噪声预测目标训练：

$$
\mathcal L_{\mathrm{diff}}=\mathbb E_{x_0,c,t,\epsilon}\left[\left\|\epsilon-\epsilon_\theta(x_t,t,c)\right\|_2^2\right],\tag{2}
$$

$$
x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon,\qquad\epsilon\sim\mathcal N(0,I).\tag{3}
$$

在标准 DDPM 推理下，采样从 \(x_T\sim\mathcal N(0,I)\) 开始，并施加完整的 \(T\) 步逆向链以恢复 \(x_0\) 的估计。在每个逆向步，模型预测噪声分量，并据此获得前一时间步的后验均值。每步转移为

$$
x_{t-1}=\frac{1}{\sqrt{\alpha_t}}\left(x_t-\frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\epsilon_\theta(x_t,t,c)\right)+\sigma_t z,\tag{4}
$$

其中 \(z\sim\mathcal N(0,I)\)，\(\sigma_t\) 为后验方差。这一表述表明，每个逆向步都会对去噪网络做一次完整前向，从而使总推理成本与 \(T\) 成正比。

### 2.2 问题表述

令 \(x_P\in\mathbb R^{H\times W}\) 表示由基于物理的模型针对与目标样本相同的场景布局、发射机位置与输出网格所生成的匹配传播先验。这样的先验编码了主要传播结构，包括大尺度路损分布与主要遮挡区域，但忽略了高阶多径交互。根据可用的场景信息与计算预算，该先验可由基于几何的、经验的或简化的解析传播模型产生，各自提供不同水平的场景级保真度。

标准 DDPM 推理从纯高斯噪声 \(x_T\sim\mathcal N(0,I)\) 初始化，从而丢弃了全部可用的物理知识。当匹配的传播先验已经可用时，这是一种浪费，因为早期的逆向步必须重建先验已经提供的大尺度传播结构。本文的目标是设计一种纯推理的采样策略，利用 \(x_P\) 中的结构信息来减少逆向去噪步数，同时保持重建保真度。令 \(\mathcal I:\mathbb R^{H\times W}\to\mathbb R^{H\times W}\) 表示把匹配先验转换为扩散兼容起始状态的初始化映射，令 \(\mathcal R_\theta(\cdot,t_s,c)\) 表示使用预训练骨干从时间步 \(t_s\) 到 0 的逆向去噪链，并令 \(\mathcal L_{\mathrm{recon}}^{\mathrm{full}}\) 表示从 \(x_T\sim\mathcal N(0,I)\) 出发的全链基线的期望重建损失。该问题形式化如下。

**问题 1。**

$$
\min_{t_s,\mathcal I}\;t_s,\tag{5}
$$

$$
\mathrm{s.t.}\quad\hat x_0=\mathcal R_\theta\left(\mathcal I(x_P),t_s,c\right),\tag{5a}
$$

$$
\mathbb E\left[\left\|\hat x_0-x_0\right\|_2^2\right]\le\mathcal L_{\mathrm{recon}}^{\mathrm{full}},\tag{5b}
$$

$$
t_s\in\{1,\ldots,T\}.\tag{5c}
$$

## 3 提出的方法

图 1 概括了所提流程。核心思想是把基于物理的先验所编码的结构化传播知识与预训练扩散模型的表达性精修能力桥接起来。我们不从无信息量的高斯噪声出发启动每条逆向轨迹，而是由匹配先验构造一个场景对齐的中间状态，并让扩散模型聚焦于残余的多径精修。

**图 1（原文 Fig. 1）：** 所提 RMPrior 流程总览。匹配的传播先验被扰动到由 \(P_{\mathrm{start}}\) 指定的中间扩散状态，并且只在剩余轨迹上执行逆向去噪。传播先验提供主要路损布局作为结构化初始化，而扩散模型精修先验所忽略的多径细节。图中把流程与标准 DDPM 过程并置：标准 DDPM 过程从真值（Ground Truth）出发做全量前向加噪到 \(x_T\)，再执行完整逆向去噪步；RMPrior 过程则从匹配的 DPM 先验（Matched DPM Prior）出发，前向加噪到 \(P_{\mathrm{start}}\) 对应的 \(x_{t_{\mathrm{start}}}\)，随后只执行截断去噪（Truncated Denoising）——即剩余的逆向步 \(t_{\mathrm{start}},t_{\mathrm{start}}-1,\ldots,t_0\)——由 U-Net 完成，得到 RMPrior RM。

### 3.1 中间起始扩散采样

我们把问题 1 中的初始化映射 \(\mathcal I\) 实例化为前向加噪。本文中的匹配先验 \(x_P\) 取自主径模型（DPM）[4]，它提供粗粒度但场景对齐的传播布局。对选定的起始时间步 \(t_s\in\{1,\ldots,T\}\)，中间起始状态构造为

$$
\mathcal I(x_P)=x_P^{t_s}=\sqrt{\bar\alpha_{t_s}}x_P+\sqrt{1-\bar\alpha_{t_s}}\epsilon,\qquad\epsilon\sim\mathcal N(0,I).\tag{6}
$$

随后只从 \(t_s\) 开始执行逆向过程：

$$
x_{t-1}\sim p_\theta(x_{t-1}\mid x_t,c),\qquad t=t_s,t_s-1,\ldots,1.\tag{7}
$$

去噪网络与所有已学习参数保持不变。唯一的修改是起始状态：基线在 \(t=T\) 处从各向同性噪声初始化，而所提方法在 \(t=t_s\) 处从场景对齐的中间状态初始化，该状态保留了 \(x_P\) 的主要传播布局。于是扩散模型被用于恢复先验所忽略的多径感知细节，而不是从零重建整张无线电地图。

我们用一个归一化标量 \(P_{\mathrm{start}}\in(0,1]\) 参数化起始点，并把它映射为离散索引 \(t_s=\lfloor P_{\mathrm{start}}T\rfloor\)。取 \(P_{\mathrm{start}}=1.0\) 即恢复全步基线。由于去噪网络在每次逆向步中被评估一次，采样成本随 \(P_{\mathrm{start}}\) 近似线性缩放，把网络评估次数（NFE）从 \(T\) 降到 \(\lfloor P_{\mathrm{start}}T\rfloor\)。该参数控制重建工作量在基于物理的先验与学习型精修之间如何分配。第 4 节的实验使这一权衡可以被直接观测。

### 3.2 理论分析

我们给出三个形式化结果。定理 1 刻画中间起始状态与理想的前向加噪真值之间的初始化间隙。定理 2 确定截断在何时降低总重建误差。定理 3 表明先验质量敏感性在更激进的截断下增大。

**1）初始化间隙。** 令

$$
x_{t_s}^{\mathrm{GT}}=\sqrt{\bar\alpha_{t_s}}x_0+\sqrt{1-\bar\alpha_{t_s}}\epsilon
$$

表示把真值 \(x_0\) 前向加噪到时间步 \(t_s\) 所得到的理想中间状态。式 (6) 中的中间起始状态 \(x_P^{t_s}\) 由于 \(x_P\) 与 \(x_0\) 之间的失配而不同于 \(x_{t_s}^{\mathrm{GT}}\)。

**定理 1（初始化间隙上界，Initialization gap bound）。** 在相同的噪声实现 \(\epsilon\) 下，

$$
\left\|x_P^{t_s}-x_{t_s}^{\mathrm{GT}}\right\|_2=\sqrt{\bar\alpha_{t_s}}\left\|x_P-x_0\right\|_2.\tag{8}
$$

**证明。** 展开两个状态并消去共享的噪声项，得到

$$
x_P^{t_s}-x_{t_s}^{\mathrm{GT}}=\sqrt{\bar\alpha_{t_s}}\left(x_P-x_0\right).\tag{9}
$$

取 \(\ell_2\) 范数即得结论。□

定理 1 表明，初始化间隙正比于先验失配 \(\|x_P-x_0\|_2\)，并由 \(\sqrt{\bar\alpha_{t_s}}\) 缩放。由于 \(\sqrt{\bar\alpha_{t_s}}\) 随 \(t_s\) 减小而增大，较小的 \(P_{\mathrm{start}}\) 会保留更多先验失配，而较大的 \(P_{\mathrm{start}}\) 通过更强的加噪将其衰减。

**2）截断获益的条件。** 我们假设逆向链是一个压缩映射，每一步把到理想轨迹的距离按因子 \(\gamma_t\in(0,1)\) 缩小；并令 \(\delta_t\) 表示时间步 \(t\) 处的每步去噪器近似误差。令 \(\hat x_0^{\mathrm{full}}\) 与 \(\hat x_0^{\mathrm{mid}}\) 分别表示全链采样与中间起始采样的重建结果。

**定理 2（截断获益条件，Truncation benefit condition）。** 当

$$
\sqrt{\bar\alpha_{t_s}}\left\|x_P-x_0\right\|_2\cdot\prod_{t=1}^{t_s}\gamma_t
<
\sum_{t=t_s+1}^{T}\delta_t\cdot\prod_{j=1}^{t-1}\gamma_j\tag{10}
$$

时，中间起始采样取得比全链基线更低的重建误差。

**证明。** 在压缩假设下，中间起始的误差上界为

$$
\left\|\hat x_0^{\mathrm{mid}}-x_0\right\|_2
\le
\sqrt{\bar\alpha_{t_s}}\left\|x_P-x_0\right\|_2\prod_{t=1}^{t_s}\gamma_t
+
\sum_{t=1}^{t_s}\delta_t\prod_{j=1}^{t-1}\gamma_j.\tag{11}
$$

由于 \(\bar\alpha_T\approx0\)，全链从无信息量的噪声出发，给出

$$
\left\|\hat x_0^{\mathrm{full}}-x_0\right\|_2
\le
\sum_{t=1}^{T}\delta_t\prod_{j=1}^{t-1}\gamma_j.\tag{12}
$$

把式 (11) 从式 (12) 中相减可知：当被移除步骤的累积误差超过收缩后的初始化间隙时，中间起始是有益的，即得到式 (10)。□

式 (10) 的左侧表示来自物理先验的、经收缩的初始化间隙。右侧是截断所消除的、从第 \(t_s+1\) 步到第 \(T\) 步的累积去噪器误差。当先验接近真值、且每步去噪器误差在早期重噪步骤中不可忽略时，该条件更容易被满足。它解释了 \(P_{\mathrm{start}}=0.5\) 在保真度上优于全步基线这一经验观察。

**3）截断下的先验质量敏感性。** 考虑两个先验 \(x_P^{(1)}\) 与 \(x_P^{(2)}\)，其失配水平满足 \(d_1=\|x_P^{(1)}-x_0\|_2<d_2=\|x_P^{(2)}-x_0\|_2\)。

**定理 3（敏感性放大，Sensitivity amplification）。** 在相同的压缩假设下，两个先验之间的重建误差差满足

$$
\Delta E(t_s)\le\sqrt{\bar\alpha_{t_s}}\left(d_2-d_1\right)\prod_{t=1}^{t_s}\gamma_t.\tag{13}
$$

此外，\(\Delta E(t_s)\) 随 \(t_s\) 减小而单调增大。

**证明。** 由式 (11)，两个先验共享相同的累积去噪器误差项。它们的误差上界之差为

$$
\Delta E(t_s)\le\sqrt{\bar\alpha_{t_s}}\left(d_2-d_1\right)\prod_{t=1}^{t_s}\gamma_t.\tag{14}
$$

减小 \(t_s\) 会增大 \(\sqrt{\bar\alpha_{t_s}}\)，并因所用压缩步数更少而增大 \(\prod_{t=1}^{t_s}\gamma_t\)。两个因子都会放大 \(\Delta E(t_s)\)。□

定理 3 形式化说明了为什么先验质量在激进截断下变得更关键。在中等 \(P_{\mathrm{start}}\) 下，逆向链有足够的压缩步数来吸收高保真先验与低保真先验之间的初始化差异。在较小 \(P_{\mathrm{start}}\) 下，可用的压缩步数更少，且缩放因子 \(\sqrt{\bar\alpha_{t_s}}\) 更大，从而放大性能差距。该结果为实验中的先验质量消融提供了理论支持。

> **译注（校对疑点）：** 式 (10) 的推导是把式 (11) 与式 (12) 两条**误差上界**相减得到的充分条件；两个上界之差不能保证真实误差之间具有同样的排序，因此定理 2，以及由同一上界差导出的定理 3 的单调性陈述，都应按“充分条件式”表述理解，不能据此推出实际误差排序。此点按原文如实转写，详见文末“本页范围与校对状态”。

## 4 实验结果

### 4.1 实验设置

我们在 IRT4HighRes 上评估所提方法。该数据集是由先进射线追踪仿真生成的高分辨率无线电地图数据集，捕捉真实城市环境中的复杂多径传播。数据集包含 99 个场景，每个场景有 80 个发射机位置，共产生 7920 个测试样本。使用预训练的 RMDM 骨干 [11]，并在固定的 DDPM 采样时间表下取 \(T=100\) 个时间步。基线对应 \(P_{\mathrm{start}}=1.0\)，它精确复现从纯高斯噪声出发的全步 RMDM 采样。RME-GAN [7] 与 RadioUNet [5] 作为有代表性的现有方法纳入比较。所有运行时间都在单块 NVIDIA RTX 4090 GPU 上测量。我们报告 NMSE、RMSE、SSIM 与 PSNR 以评估重建质量。稀疏 IRT4 子集用于 \(P_{\mathrm{start}}\) 敏感性分析。由 IRT4HighRes 与辅助的 ke [14]/cost [15] 先验数据集之间共享的九个场景 ID 构成的 720 样本重叠子集用于先验质量消融：匹配的 DPM 先验 \(x_P\) 被替换为质量更低的 ke 与 cost 先验，而扩散骨干与逆向步预算保持固定。

### 4.2 IRT4HighRes 上的主要结果

表 I 报告主要结果。在 \(P_{\mathrm{start}}=0.5\) 时，所提方法把延迟从 514 ms 降到 256 ms（2.01× 加速），同时把 NMSE 从 0.00688 改善到 0.00683、RMSE 从 0.01808 改善到 0.01794、SSIM 从 0.93910 改善到 0.93935、PSNR 从 35.28 dB 改善到 35.39 dB。速度与保真度的同时改善与定理 2 一致：DPM 先验提供了信息量足够充分的初始化，使收缩后的初始化间隙小于被移除的早期步所累积的去噪器误差。\(P_{\mathrm{start}}\in[0.4,0.6]\) 的中等起始保留最佳的速度—质量平衡，其中 \(P_{\mathrm{start}}=0.5\) 提供最佳的总体保真度。超出该范围后，\(P_{\mathrm{start}}=0.3\) 与 0.25 进一步降低运行时间，但误差指标开始上升，因为剩余逆向链太短，无法收缩初始化间隙。

**表 I（原文 Table I）：** IRT4HighRes 上的定量结果。**粗体（原文为粗体红字）** 与 <u>下划线（原文为下划线蓝字）</u> 分别表示最优与次优结果。\(P_{\mathrm{start}}=1.0\) 精确复现全步 RMDM 基线。加速比与 PSNR 增益相对 RMDM（35.28 dB、514 ms）报告。

| 方法 | \(P_{\mathrm{start}}\) | NMSE↓ | RMSE↓ | SSIM↑ | PSNR (dB)↑ | 时间 (ms)↓ | 加速比 (×) | PSNR 增益 |
|---|---|---|---|---|---|---|---|---|
| RME-GAN | – | 0.01150 | 0.03030 | 0.93230 | 30.54 | **42.0** | – | – |
| RadioUNet | – | 0.05904 | 0.04796 | 0.82094 | 26.73 | <u>60.0</u> | – | – |
| RMDM | – | 0.00688 | 0.01808 | 0.93910 | 35.28 | 514.0 | – | – |
| Ours | 1.00 | 0.00688 | 0.01808 | 0.93910 | 35.28 | 514.0 | ×1.00 | – |
| Ours | 0.90 | 0.00686 | 0.01806 | 0.93922 | 35.29 | 465.0 | ×1.11 | ↑0.03% |
| Ours | 0.80 | 0.00686 | 0.01806 | 0.93916 | 35.28 | 418.0 | ×1.23 | – |
| Ours | 0.70 | <u>0.00685</u> | 0.01804 | 0.93921 | 35.30 | 359.0 | ×1.43 | ↑0.06% |
| Ours | 0.60 | <u>0.00685</u> | <u>0.01802</u> | <u>0.93928</u> | 35.33 | 313.0 | ×1.64 | ↑0.14% |
| Ours | 0.50 | **0.00683** | **0.01794** | **0.93935** | <u>35.39</u> | 256.0 | ×2.01 | ↑0.31% |
| Ours | 0.40 | 0.00691 | 0.01810 | 0.93917 | **35.41** | 206.0 | ×2.50 | **↑0.37%** |
| Ours | 0.30 | 0.00723 | 0.01838 | 0.93846 | 35.21 | 154.0 | <u>×3.34</u> | ↓0.20% |
| Ours | 0.25 | 0.00751 | 0.01871 | 0.93789 | 35.05 | 138.0 | **×3.72** | ↓0.65% |

### 4.3 工作范围敏感性

表 II 报告稀疏 IRT4 子集上对 \(P_{\mathrm{start}}\) 的敏感性。这些值是在不同子集上报告的，不能与全域结果直接比较。同样的模式依然成立：\(P_{\mathrm{start}}=0.5\) 取得最低的 NMSE 与 RMSE，而 \(P_{\mathrm{start}}=0.4\) 以略差的误差指标为代价提供最高的 SSIM。更激进的起始 \(P_{\mathrm{start}}=0.3\) 与 0.25 在所有指标上表现出一致的退化。该子集实验确认了主评估中的设计选择：中等截断提供最有利的权衡，而过度激进的截断留下的去噪预算不足以恢复细节。

**表 II（原文 Table II）：** 稀疏 IRT4 子集上的 \(P_{\mathrm{start}}\) 敏感性。**粗体（原文为粗体红字）** 与 <u>下划线（原文为下划线蓝字）</u> 分别表示最优与次优结果。

| \(P_{\mathrm{start}}\) | NMSE↓ | RMSE↓ | SSIM↑ | PSNR (dB)↑ | 时间 (ms)↓ |
|---|---|---|---|---|---|
| 0.60 | <u>0.00903</u> | <u>0.02058</u> | 0.93110 | <u>33.79</u> | 312 |
| 0.50 | **0.00895** | **0.02053** | <u>0.93218</u> | **33.82** | 259 |
| 0.40 | 0.00928 | 0.02096 | **0.94210** | 33.77 | 207 |
| 0.30 | 0.00952 | 0.02114 | 0.92439 | 33.44 | <u>158</u> |
| 0.25 | 0.00959 | 0.02134 | 0.92224 | 33.28 | **139** |

**图 2（原文 Fig. 2）：** 不同 \(P_{\mathrm{start}}\) 设置下的视觉比较。中等起始比激进截断更可靠地保持全局传播布局与局部衰减细节。图中各列依次为 Ground Truth、\(P_{\mathrm{start}}=0.50\)、\(P_{\mathrm{start}}=0.40\)、\(P_{\mathrm{start}}=0.30\)、\(P_{\mathrm{start}}=0.25\) 与 Baseline，共展示四个场景。

### 4.4 先验质量消融

表 III 在 720 样本重叠子集上隔离先验质量的作用。匹配的 DPM 先验在 \(P_{\mathrm{start}}=0.5\) 与 \(P_{\mathrm{start}}=0.3\) 下都取得最佳结果；cost 先验 [15] 造成中等程度的退化，而 ke 先验 [14] 造成大得多的下降。在 \(P_{\mathrm{start}}=0.5\) 时，把 DPM 替换为 cost 会使 PSNR 从 36.42 dB 退化到 35.09 dB，而 ke 把它降到 32.99 dB。在 \(P_{\mathrm{start}}=0.3\) 时，差距急剧扩大：DPM 仍达到 36.16 dB，但 cost 降到 30.35 dB，ke 降到 25.54 dB。在固定的 \(P_{\mathrm{start}}\) 下，不同先验类型的运行时间几乎不变，说明性能差距是由初始化质量而非计算预算驱动的。

**表 III（原文 Table III）：** 720 样本重叠子集（场景 ID：615、647、654、662、664、681、684、695、698）上的先验质量消融。**粗体（原文为粗体红字）** 与 <u>下划线（原文为下划线蓝字）</u> 分别表示最优与次优结果。表中 ke 指 knife-edge 先验，cost 指 COST 231 先验。

| 先验 | \(P_{\mathrm{start}}\) | NMSE↓ | RMSE↓ | SSIM↑ | PSNR (dB)↑ | 时间 (ms)↓ |
|---|---|---|---|---|---|---|
| DPM | 0.50 | **0.00494** | **0.01595** | **0.95173** | **36.42** | 257.0 |
| DPM | 0.30 | <u>0.00544</u> | <u>0.01654</u> | <u>0.95043</u> | <u>36.16</u> | <u>154.2</u> |
| ke | 0.50 | 0.00846 | 0.02321 | 0.94475 | 32.99 | 256.9 |
| ke | 0.30 | 0.04602 | 0.05636 | 0.89074 | 25.54 | **154.0** |
| cost | 0.50 | 0.00585 | 0.01816 | 0.94974 | 35.09 | 259.6 |
| cost | 0.30 | 0.01754 | 0.03304 | 0.93447 | 30.35 | 155.8 |

这一放大效应正是定理 3 所预测的。在较小的 \(P_{\mathrm{start}}\) 下，缩放因子 \(\sqrt{\bar\alpha_{t_s}}\) 更大、可用的压缩步数更少，因此高保真与低保真先验之间的重建误差差 \(\Delta E(t_s)\) 被放大。排序 DPM > cost > ke 在两个测试的 \(P_{\mathrm{start}}\) 值下都一致，而更激进截断下差距的扩大确认了定理 3 的单调性结果。一个额外的观察是：三个先验之间的重建质量排序反映了它们各自的场景级建模保真度水平，这提示中间起始扩散重建可以作为一项代理指标，用于评估不同传播模型捕捉给定场景主要空间结构的程度。

### 4.5 可视化分析

图 3 说明匹配 DPM 先验的作用。该先验捕捉粗粒度的传播布局，包括主要遮挡区域与大尺度路损分布，但缺少精确无线电地图所需的精细强度细节。从这个结构化状态开始逆向去噪，使扩散模型把更新集中在多径精修上，而不是从噪声重建整张图。这一视觉证据与表 I 的定量增益以及表 III 的先验质量敏感性一致。

**图 3（原文 Fig. 3）：** IRT4HighRes 上的视觉比较。DPM 先验捕捉粗粒度布局，而在 \(P_{\mathrm{start}}=0.5\) 下的中间起始去噪恢复了高保真细节。图中三列依次为 Ground Truth、Matched DPM Prior 与 Reconstruction。

图 2 可视化改变 \(P_{\mathrm{start}}\) 的影响。在 \(P_{\mathrm{start}}=0.5\) 与 0.4 时，重建地图在全局传播轮廓与局部衰减过渡上都保持接近真值。在 \(P_{\mathrm{start}}=0.3\) 与 0.25 时，细粒度强度图样中可见的偏差变得更频繁。视觉趋势与表 II 的数值行为一致：适度加噪的先验提供了足够结构来加速采样，而过度激进的截断留下的去噪预算太少，无法恢复细节。

## 5 结论

本文提出了一种中间起始扩散采样策略，把基于物理的传播先验与学习型扩散精修桥接起来以构建无线电地图；并给出理论分析，表明重建收益同时取决于先验质量与截断深度。我们在包含 7920 个样本的高分辨率射线追踪数据集上验证了该策略，在 \(P_{\mathrm{start}}=0.5\) 时展示了 2.01× 的推理加速与同步的保真度提升；并通过先验质量消融确认，重建质量始终跟随初始化来源的场景级精度。所提方法特别适合动态无线网络——在这些网络中，无线电地图必须跨发射机位置或时变场景反复刷新，因为该方法在不需要模型重训练的前提下大幅降低了每次更新的延迟。未来工作将探索基于场景复杂度自适应选择 \(P_{\mathrm{start}}\)，以及把该策略扩展到 DDPM 之外的其它生成骨干。

## 参考文献

[1] N. C. Xiucheng Wang, Yuhao Pan, "A tutorial on learning-based radio map construction: Data, paradigms, and physics-awareness," arXiv preprint arXiv:2603.17499, 2026.

[2] G. A. Deschamps, "Ray techniques in electromagnetics," Proc. IEEE, vol. 60, no. 9, pp. 1022–1035, 1972.

[3] X. Wang, Q. Zhang, N. Cheng, R. Sun, Z. Li, S. Cui, and X. Shen, "Radiodiff-k2: Helmholtz equation informed generative diffusion model for multi-path aware radio map construction," IEEE J. Sel. Areas Commun., vol. 44, pp. 2318–2333, 2026.

[4] R. Wahl, G. Wölfle, P. Wertz, P. Wildbolz, and F. Landstorfer, "Dominant path prediction model for urban scenarios," in Proceedings of 14th IST mobile and wireless communications summit, 2005, pp. 1–5.

[5] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.

[6] X. Wang, X. Wang, S. Mao, J. Zhang, S. C. Periaswamy, and J. Patton, "Indoor radio map construction and localization with deep gaussian processes," IEEE Internet Things J., vol. 7, no. 11, pp. 11 238–11 249, 2020.

[7] S. Zhang, A. Wijesinghe, and Z. Ding, "Rme-gan: A learning framework for radio map estimation based on conditional generative adversarial network," IEEE Internet Things J., vol. 10, no. 20, pp. 18 016–18 027, 2023.

[8] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," Advances Neural Inf. Process. Syst., vol. 33, pp. 6840–6851, 2020.

[9] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," in Proceedings of the 2020 International Conference on Learning Representations (ICLR), 2020, pp. 1–12.

[10] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, "RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction," Ieee Trans. Cognit. Commun. Networking, Early Access, pp. 1–13, 2024.

[11] H. Jia, W. Chen, Z. Huang, H. Xiao, N. Jia, K. Wu, S. Lai, and Y. Yue, "Rmdm: Radio map diffusion model with physics informed," in Proceedings of the 33rd ACM International Conference on Multimedia (MM)'25. Association for Computing Machinery, 2025.

[12] X. Wang, P. Zheng, N. Cheng, R. Sun, J. Chen, K. Tao, Z. Yin, Z. Liu, and Y. Zeng, "Radiodiff-turbo: Lightweight generative large electromagnetic model for wireless digital twin construction," in IEEE INFOCOM 2025 - IEEE Conference on Computer Communications Workshops (INFOCOM WKSHPS), 2025, pp. 1–6.

[13] X. Wang, P. Zheng, H. Jia, N. Cheng, R. Sun, C. Zhou, and X. Shen, "Radiodiff-flux: Efficient radio map construction via generative denoise diffusion model trajectory midpoint reuse," IEEE Trans. Cogn. Commun. Netw., vol. 12, pp. 4882–4895, 2026.

[14] C. L. Giovaneli, "An analysis of simplified solutions for multiple knife-edge diffraction," IEEE Transactions on Antennas and Propagation, vol. 32, no. 3, pp. 297–301, 1984.

[15] L. M. Correia, "A view of the cost 231-bertoni-ikegami model," in 2009 3rd European conference on antennas and propagation. IEEE, 2009, pp. 1681–1685.

**本页范围与校对状态：** 本页覆盖原文全部内容——摘要、关键词、第 I–V 节正文与全部小节（§II.A–B、§III.A–B、§IV.A–E）、定理 1–3（含证明转述）、问题 1（式 (5)、(5a)–(5c)）、式 (1)–(14)、表 I–III（逐格转写，含原文的粗体最优与下划线次优标记）、图 1–3 图注、参考文献 [1]–[15]（英文原条目）；许可：arXiv 预印本（公开可读）。**核对方式：** 全部 6 页均用 pypdfium2（scale=2.0）渲染后逐页目视核对；表 I–III 另做 2.2× 局部放大核对粗体/下划线标记；pypdf 抽取的第 2 页文本含控制字符（0x00/0x01/0x12/0x13）导致读取工具拒读，该页内容全部按 PDF 渲染页转写。**已知缺陷与核对说明：** ① **定理 2/3 的推导疑点（重要）：** 原文以式 (11)、(12) 两条**误差上界**相减得到式 (10)，再由式 (11) 的上界差给出式 (13)–(14)；两个上界之差不能推出真实误差之间具有同样的排序，因此定理 2 的“截断获益条件”与定理 3 的“单调性”只能按充分条件式表述理解，不能据此断言实际误差排序或实际误差随截断加深而单调放大。正文定理 3 之后已加“译注”提示，此处重申。② 表 I 的 Gain(PSNR) 列：原文仅把最优值 ↑0.37% 标为粗体，未标次优；本页照原样保留（↑0.31% 未加下划线）。③ 表 I 的 Time 列最优为 RME-GAN 的 42.0 ms（粗体）、次优为 RadioUNet 的 60.0 ms（下划线）——该列比较包含基线方法，与正文以 RMDM 为参照的加速比口径不同；照原文保留，未改写。④ 表 III 的 PSNR 列：DPM 0.50 的 36.42 dB 为粗体最优、DPM 0.30 的 36.16 dB 为下划线次优；Time 列最优为 ke 0.30 的 154.0 ms（粗体）、次优为 DPM 0.30 的 154.2 ms（下划线）——该表时间最优并非由 DPM 取得，属跨指标比较的正常结果，未做改写。⑤ 图 1–3 为位图；图 1 的流程标签、图 2 的列顺序与图 3 的三列内容按渲染页转写，未推测图中未标注的数值（正文明确给出的数字已按原文录入）。⑥ 参考文献存在原文笔误/非规范大小写（如 [1] 作者名 “N. C. Xiucheng Wang”、[10] “Ieee”、[3] “Radiodiff-k2”、[15] “cost 231-bertoni-ikegami”），按原文如实照录；仅将 pypdf 抽取中错位的变音符号还原（Wölfle、Ç. Yapar）。⑦ 公式 (5a)–(5c) 在原文中与目标函数 (5) 同属一个优化问题块，本页拆为四个带式号的显示块，以保留 (5a)–(5c) 编号。⑧ 数字核对：\(P_{\mathrm{start}}=0.5\) 时 514 ms→256 ms（2.01×）、NMSE 0.00688→0.00683；\(P_{\mathrm{start}}=0.3\) 时 DPM/knife-edge/COST 的 PSNR 分别为 36.16/25.54/30.35 dB——均与 PDF 表 I/表 III 渲染页一致（knife-edge 即表中 ke，COST 231 即表中 cost）。逐句逐式终校未做。

---

**登记（2026-11-03）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
