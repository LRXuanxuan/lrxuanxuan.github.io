---
layout: page
title: "乳腺成像全波形反演中的即插即用流匹配探索｜中文全文译文"
permalink: /papers/translations/2026-11-01-2610-32185-pnp-flow-matching-for-full-waveform-inversion-on-breast-imaging/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/170f73a229228f5e/) · [原文 arXiv](https://arxiv.org/abs/2610.32185/) · [全部目录](/papers/catalog/)

# 乳腺成像全波形反演中的即插即用流匹配探索

**原题：** An exploration of plug-and-play flow matching for full-waveform inversion on breast imaging  
**作者：** Cristina Garcia-Cardona、Siting Liu、Fatma Terzioglu、Shanyin Tong、Lu Zhang（单位按 PDF 原文转写）  
**版本：** arXiv:2610.32185v1，2026-10-23；27 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 1–5 节（含 §2.1/2.2、§3.1/3.2、§4.1/4.2/4.3/4.4）、算法 1–2、注 1–4、式 (1)–(18)、表 1–3 与表 C1 逐格、图 1–4 与图 B1 图注、附录 A–C、致谢/声明/代码可用性、参考文献 [1]–[58]（英文原条目）；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

## 摘要

全波形反演（full-waveform inversion，FWI）从测量波形重建声速场，其做法是求解一个优化问题，使测量波形与数值波传播模型所预测的波形之间的差异最小。然而，为该优化问题选择合适的正则化并不容易：正则化既要稳定反演，又要保留与问题相关的结构。这促使我们研究一个可能性——用从代表性声速图像中学到的先验来改进重建。在本工作中，我们把即插即用流匹配（plug-and-play flow matching，PnP-Flow）适配到 FWI：将波形失配更新（waveform-misfit updates）与来自预训练流先验的更新交替执行。我们在无噪、纯透射（transmission-only）平面波数据上，通过与总变差（total variation，TV）正则化的对比，考察 PnP-Flow 重建的有效性。我们分别针对背景为常数、背景空间变化的两类圆包含体（circular-inclusion）模型族训练独立的流先验。我们既在这些分布内的圆模型上评估该方法，也通过一种显著分布偏移（distribution shift）来评估：把高斯圆（Gaussian-circle）先验与重建设置迁移到乳腺体模（breast phantom）图像块上，且不再训练、不重新调参。在相同的波形失配更新次数下，所提出的 PnP-Flow 框架总体上提高了圆模型的重建精度，并比 TV 基线更准确地恢复了乳腺病灶对比度（lesion contrast）。

**关键词：** 全波形反演（full-waveform inversion）、即插即用重建（plug-and-play reconstruction）、流匹配（flow matching）、学习先验（learned prior）、声学成像（acoustic imaging）。

## 1 引言

全波形反演（FWI）旨在重建支配波动方程的空间变化物理参数，其途径是求解一个优化问题：使测量波形与数值波传播模型所预测波形之间的差异最小 [1–3]。FWI 最初主要在地球物理成像中发展起来 [4, 5]，用于从地震波形测量推断地下介质属性；此后它越来越多地被用于其他基于波的逆问题，包括医学超声成像 [6–10]。在超声层析成像（ultrasound tomography，UST）中，FWI 尤其有前景：阵列式采集可在大量发射–接收对上、在很宽的频率范围内提供测量，从而得到信息丰富的波形数据，用于对组织声学属性做高分辨率定量重建 [6, 11]。

FWI 面向定量乳腺 UST 已被广泛研究。早期工作展示了从乳腺超声测量中对声学属性做波形重建的可行性 [8, 12]；后续工作则通过源编码（source encoding）、频率延拓（frequency continuation）、数据预处理以及改进初始化等技术，提升了计算效率与鲁棒性 [9, 11]。更进一步的发展纳入了衰减建模与显式正则化 [13, 14]。近年来，计算能力的进步使得高分辨率三维乳腺 FWI 成为可能 [10]，也使从离体（in vitro）与在体（in vivo）环形阵列测量中联合重建声速与衰减成为可能 [15]。在乳腺 UST 之外，FWI 也被用于定量骨成像 [7, 16] 与经颅超声成像，包括高分辨率数值研究、专用采集系统以及实验性脑体模重建 [17–19]。最近面向在体超声测量的应用进一步表明，FWI 在真实的医学成像场景中潜力正在增长 [20]。

尽管具有上述潜力，FWI 仍然颇具挑战。参数到数据的映射（parameter-to-data map）高度非线性，由此得到的波形失配目标函数一般非凸。因此基于梯度的方法可能收敛到不理想的局部极小，尤其当预测波形与测量波形中的对应特征错位超过约半个周期时——这会导致所谓周期跳跃（cycle skipping）现象 [2, 5, 21]。因而 FWI 可能对初始化高度敏感。此外，有限的采集覆盖、受限的频率成分、测量噪声与建模误差，都可能使未知介质的部分特征仅被数据弱约束 [5]。这些困难促使人们把先验信息引入反演。

把先验信息引入 FWI 的一种标准做法，是引入显式正则项来促进平滑性、稀疏性或分片正则性等性质 [14]。尽管这类经典正则化能显著改善 FWI 的稳定性，但它们所编码的先验信息受限于惩罚项的规定形式。例如，基于平滑性或稀疏性的正则化对未知量施加相对简单的结构假设，可能无法充分反映更广泛一类可容许波速场的统计特征。学习先验（learned priors）提供了一种更灵活的替代：它直接从代表性训练数据中提取统计与结构信息 [22]。即插即用（plug-and-play，PnP）方法通过把数据一致性步骤与图像先验模型分离，提供了一种把这类先验引入逆问题的机制 [23]。该框架已从使用 BM3D [24] 等经典去噪器、DnCNN [25] 等学习型卷积去噪器，演化到使用表达能力越来越强的深度生成模型，包括基于分数的（score-based）、扩散（diffusion）与流匹配（flow matching）模型 [26–29]。相应地，已有若干策略被提出，把深度生成模型纳入 PnP 型逆问题求解器 [30–34]。

基于学习的方法同样开始被引入医学 FWI。这些工作包括：在常规 FWI 之前对缺失的低频数据做学习型外推 [35]、面向经颅超声成像的分解–下降学习（decomposition-descent learning）[36]、迭代重建的深度展开（deep unfolding）[37]，以及针对未知声速场的神经网络参数化或隐式正则化 [38–40]。在医学成像之外的相关进展包括：未经训练的深度图像先验 [41]、基于经典或预训练深度去噪器的即插即用表述 [42, 43]、与 FWI 耦合的基于扩散的生成先验 [44–47]，以及把学习与波动物理结合起来的混合方法 [48, 49]；另见近期综述 [50]。

然而，当目标与训练数据所代表的分布不一致时，学习先验可能变得不那么可靠。在此类情形下，学习得到的更新可能偏向训练集所特有的特征，同时削弱对拟合测量波形重要的结构。这促使我们不仅在分布内（in-distribution）设置下考察该方法，还要在显著分布偏移下考察。

受 [34] 的 PnP-Flow 框架启发，我们提出一种 FWI 重建方法：把若干块波形失配更新与由预训练流匹配先验诱导的更新交替进行，并以最终的 PnP 迭代结果作为重建。我们的数值研究回答两个主要问题：其一，在波形失配更新次数相同的条件下，所提流程相对 TV-FWI 是否改进小包含体的重建；其二，在显著分布偏移下且不做额外调参时，学习先验对恢复局部化特征是否仍然有益。为了同时刻画整体重建质量与小尺度局部特征的恢复，我们在与总变差正则化 FWI（TV-FWI）基线对比时，同时评估整幅图像的重建误差与病灶对比度误差。在相同的波形失配更新次数下，PnP-Flow 在圆包含体模型上总体取得更低的重建误差，在乳腺体模图像上取得更低的病灶对比度误差。

本文的主要贡献如下：

- 我们把 PnP-Flow 框架适配到非线性全波形反演：把预训练的流匹配先验与若干块波形失配更新耦合起来。该先验仅从声速场学习得到，而数据一致性更新则纳入波动方程正演模型及其伴随（adjoint）。
- 我们针对两类圆包含体模型族分别训练先验，并表明在相同波形失配更新次数下，所提方法比所选定的 TV-FWI 配置取得更低的重建误差。
- 我们评估分布外（out-of-distribution）迁移：把高斯圆先验与重建设置应用到乳腺体模图像块上，不再训练、不重新调参，并表明在相应迁移设置下，病灶对比度恢复相对 TV-FWI 有所改进。

本文其余部分组织如下。第 2 节介绍全波形反演问题，并讨论把先验信息纳入 FWI 的挑战。第 3 节给出所提出的 PnP-Flow 表述与重建算法。第 4 节描述实验设置，并先在两族圆包含体模型上、随后在分布偏移下使用乳腺体模图像评估所提方法。第 5 节讨论主要发现与所提方法的局限。附录给出优化算法、训练数据与学习先验的细节，以及重建对测量噪声的敏感性。

## 2 问题表述与背景

### 2.1 全波形反演

设 \(\Omega\subset\mathbb{R}^{d}\) 表示物理区域，\(m(\mathbf{x})>0\) 表示声波速度。对第 \(s\) 个源，相应波场 \(u_s(\mathbf{x},t_{\mathrm{w}};m)\) 满足波动方程

$$
\frac{1}{m^{2}(\mathbf{x})}\,\frac{\partial^{2}u_s}{\partial t_{\mathrm{w}}^{2}}-\Delta u_s=q_s(\mathbf{x},t_{\mathrm{w}}),\qquad (\mathbf{x},t_{\mathrm{w}})\in\Omega\times(0,T],\tag{1}
$$

以及适当的初始条件与边界条件。这里 \(t_{\mathrm{w}}\) 表示物理波场时间；\(q_s(\mathbf{x},t_{\mathrm{w}})\) 表示源项[^fn1]。设 \(\mathcal{P}\) 表示在检波器位置对波场采样的观测算子。与源 \(s\) 相关联的测量数据建模为

$$
\mathbf{d}_s^{\delta}=\mathcal{P}u_s(m)+\boldsymbol{\eta}_s,\tag{2}
$$

其中 \(\boldsymbol{\eta}_s\) 表示测量噪声与建模误差，\(\delta=\|\boldsymbol{\eta}_s\|\) 表示噪声水平。无噪数据也直接写作 \(\mathbf{d}_s=\mathcal{P}u_s(m)\)。我们定义与源相关的正演算子

$$
F_s(m):=\mathcal{P}u_s(m).\tag{3}
$$

汇总全部 \(N_s\) 个源的测量，得到

$$
F(m):=\begin{bmatrix}F_1(m)\\ \vdots\\ F_{N_s}(m)\end{bmatrix},\qquad \mathbf{d}^{\delta}:=\begin{bmatrix}\mathbf{d}_1^{\delta}\\ \vdots\\ \mathbf{d}_{N_s}^{\delta}\end{bmatrix}.\tag{4}
$$

FWI 相当于反演非线性映射 \(F:\mathcal{X}\to\mathcal{Y}\)，其中 \(\mathcal{X}\) 表示可容许波速场的集合，而 \(\mathcal{Y}:=\prod_{s=1}^{N_s}\mathcal{Y}_s\) 是包含所有源激励所对应的检波器时间道（detector–time trace）的数据空间。例如，若每个源产生的波场在 \(N_r\) 个检波器位置上、在时间区间 \((0,T)\) 内被记录，则可取 \(\mathcal{Y}_s=L^{2}(0,T;\mathbb{R}^{N_r})\)，并在 \(\mathcal{Y}\) 上取相应的乘积范数。在离散设置下，\(\mathcal{X}\) 与 \(\mathcal{Y}\) 分别退化为波速场与测量波形数据的有限维表示。

由于非线性正演映射一般不存在显式的反演公式，FWI 通常被表述为数值优化问题。一种标准做法是：通过最小化预测波形与观测波形之间平方 \(L^{2}\) 差异来估计波速场，

$$
m^{\star}=\arg\min_{m\in\mathcal{X}}\ \Phi(m;\mathbf{d}^{\delta}),\tag{5}
$$

其中

$$
\Phi(m;\mathbf{d}^{\delta}):=\frac{1}{2}\left\|F(m)-\mathbf{d}^{\delta}\right\|_{\mathcal{Y}}^{2}=\frac{1}{2}\sum_{s=1}^{N_s}\left\|\mathcal{P}u_s(m)-\mathbf{d}_s^{\delta}\right\|_{L^{2}(0,T;\mathbb{R}^{N_r})}^{2}.\tag{6}
$$

[^fn1]: 为简化起见，在这个一般性表述中我们使用内部源以便说明。视应用而定，源也可能被规定在边界上。在我们的数值实验中，源与接收器都位于边界上；所用的具体采集配置见第 4 节。

### 2.2 FWI 中的正则化与先验建模

FWI 所产生的非线性最小二乘问题 (5) 在过去数十年间已被广泛研究（例如见 [4, 5, 17, 51]）。其梯度可以利用伴随状态法（adjoint-state method）[52, 53] 高效计算，从而避免显式构造参数到数据映射的完整 Jacobian。尽管如此，每次梯度计算仍需要求解正演与伴随波动方程，且通常要针对多个源激励进行。因此，在高空间与时间分辨率下反复优化在计算上仍可能相当昂贵。

正如第 1 节所讨论，波形失配目标函数是非线性且一般非凸的，而实际测量可能使波速场的某些成分仅被弱约束。因此，仅最小化数据失配项可能得不到稳定或物理上合理的重建。一种标准做法是通过正则化引入关于未知波速场的先验信息，从而得到

$$
m^{\star}=\arg\min_{m\in\mathcal{X}}\Big\{\Phi(m;\mathbf{d}^{\delta})+\lambda R(m)\Big\},\tag{7}
$$

其中 \(R\) 编码关于可容许波速场的先验假设，\(\lambda>0\) 控制数据保真与正则化之间的平衡。经典例子包括 Tikhonov 型正则化

$$
R_{\mathrm{Tik}}(m)=\|Lm\|_{L^{2}(\Omega)}^{2},\tag{8}
$$

其中 \(L\) 可以表示恒等算子或某个空间导数算子；以及总变差正则化

$$
R_{\mathrm{TV}}(m)=\|\nabla m\|_{L^{1}(\Omega)}.\tag{9}
$$

经空间离散后，这些正则化会产生我们熟悉的 \(\ell^{2}\) 型与 \(\ell^{1}\) 型惩罚项。特别地，当 \(L\) 为导数算子时，Tikhonov 正则化 (8) 通过惩罚大的空间变化来偏向空间上光滑的波速场；相比之下，总变差 (9) 促进空间梯度的稀疏性，因而很适合保留尖锐界面与分片光滑结构。关于这些经典正则化方法的进一步讨论，建议感兴趣的读者参阅 [54, 55] 及其中的参考文献。

正如第 1 节所论述，除用固定的解析惩罚项来规定先验信息之外，另一种做法是直接从代表性波速场中学习先验；例如见 [22, 56]。在本工作中，我们用一个生成模型来学习关于合理波速场分布的统计信息，并研究如何把这样一个学习得到的模型作为灵活的先验信息来源纳入 FWI。

这一视角与直接从测量学习到波速场的逆映射有着本质区别。有监督的反演网络试图逼近从波形数据到相应模型的映射，因此通常需要成对的“测量–模型”训练样本。这样的学习型逆映射还可能依赖于采集几何、源的配置以及用于生成训练数据的正演模型。相比之下，生成先验可以仅用波速场训练，从而把模型统计规律的学习与测量过程分离开来。一旦训练完成，先验即可通过反演中所用的基于物理的正演模型与观测数据耦合。重要的是，这样的学习先验不必由显式的正则化泛函 \(R(m)\) 来表示；其信息可以通过由生成模型导出的算子引入，而波动方程数据保真项则继续强制与观测保持一致。这种分离自然导致一种即插即用表述：学习模型在基于物理的迭代重建过程中充当先验算子。在本工作中，我们用流匹配生成模型实现这一想法，并通过这种即插即用机制把由此得到的基于流的算子纳入 FWI；细节见第 3 节。

## 3 所提方法

### 3.1 面向 FWI 的 PnP-Flow 表述

在本工作中，我们把 [34] 的 PnP-Flow 方法适配到第 2.1 节所述的 FWI 问题，把一个学习型流匹配去噪器与偏微分方程（PDE）约束的数据一致性更新耦合起来。首先，我们按 [34] 回顾如何从流匹配生成模型构造去噪算子。具体而言，设 \(P_0\) 表示一个简单潜分布（本文取 \(\mathcal{N}(0,I)\)），\(P_1\) 表示可容许模型参数的目标分布（例如内部含若干圆的波场）。通过条件流匹配目标训练一个时变向量场 \(v_\theta:\mathbb{R}^{d_m}\times[0,1]\to\mathbb{R}^{d_m}\)：

$$
\mathcal{L}_{\mathrm{CFM}}(\theta)=\mathbb{E}_{\{t\sim\mathcal{U}[0,1],\,z_0\sim P_0,\,z_1\sim P_1\}}\Big[\big\|v_\theta\big((1-t)z_0+tz_1,\,t\big)-(z_1-z_0)\big\|_2^{2}\Big].\tag{10}
$$

相应的学习型去噪器为

$$
D_t^{\theta}(z)=z+(1-t)\,v_\theta(z,t).\tag{11}
$$

对于使总体流匹配损失最小的理想向量场，相应的算子等于在给定插值输入 \((1-t)z_0+tz_1=z\) 时干净目标 \(z_1\) 的条件均值。学习得到的算子 \(D_t^{\theta}\) 逼近这一估计量，这也为把它用作去噪器提供了依据。

随后，我们可以借助 [34] 的 PnP-Flow 构造，把这一学习到的先验信息 \(v_\theta\) 纳入第 2.1 节的 FWI 表述。设 \(\mathbf{m}\in\mathbb{R}^{d_m}\) 表示波速函数 \(m(\mathbf{x})\) 的离散表示。下面概述面向 FWI 的 PnP-Flow 表述，它在 PDE 约束的数据一致性更新与学习型去噪更新之间交替。

设 \(\mathbf{m}_n\) 表示第 \(n\) 次外层迭代时的当前波速估计。我们首先只使用 FWI 目标做一次数据一致性更新。为使表述不依赖于特定的优化方法，我们写作

$$
\mathbf{z}_n=\mathcal{G}_n^{\Phi}\big(\mathbf{m}_n;\mathbf{d}^{\delta}\big),\tag{12}
$$

其中 \(\mathcal{G}_n^{\Phi}\) 表示施加于数据保真项 \(\Phi(\mathbf{m};\mathbf{d}^{\delta})\) 上的一步或多步优化。例如，单步梯度下降对应 \(\mathbf{z}_n=\mathbf{m}_n-\eta_n\nabla\Phi(\mathbf{m}_n;\mathbf{d}^{\delta})\)，\(\eta_n>0\)，与 [34] 相同；而在我们的表述中，\(\mathcal{G}_n^{\Phi}\) 由在学习先验步骤之前施加的若干次 Adam 更新组成。无论哪种情形，迭代的这一部分只依赖观测波形数据与波动方程正演模型；学习先验不进入数据一致性块。

随后，输出 \(\mathbf{z}_n\) 与学习到的流先验耦合。时刻 \(t\) 的基于流的去噪器被设计为作用于与流路径相应中间层级相关联的状态。由于 \(\mathbf{z}_n\) 由 FWI 更新产生，一般并不具有这种形式，PnP-Flow 引入一个中间投影步骤。从基分布中抽取独立样本 \(\boldsymbol{\xi}_n\sim\mathcal{N}(0,I)\)，构造

$$
\widetilde{\mathbf{z}}_n=(1-t_n)\boldsymbol{\xi}_n+t_n\mathbf{z}_n.\tag{13}
$$

这一插值把当前数据一致的估计嵌入到规定的流层级上，并生成施加时变先验算子所用的输入。基于流的去噪更新则由施加学习型去噪器 (11) 得到，

$$
\mathbf{m}_{n+1}=D_{t_n}^{\theta}(\widetilde{\mathbf{z}}_n)=\widetilde{\mathbf{z}}_n+(1-t_n)\,v_\theta(\widetilde{\mathbf{z}}_n,t_n).\tag{14}
$$

算子 \(D_{t_n}^{\theta}\) 纳入从波速模型训练集成中学到的统计信息，并把当前估计推向该学习分布所偏好的模型。按照 PnP-Flow 构造 [34]，我们用 (13) 中的独立噪声样本构造多个插值场，并按 (14) 对其去噪输出取平均，以期提高每次先验更新的鲁棒性。这可写作 \(\mathbf{m}_{n+1}=\sum_{l=1}^{M}D_{t_n}^{\theta}\big((1-t_n)\boldsymbol{\xi}_{n,l}+t_n\mathbf{z}_n\big)/M\)。

因此，一次外层 PnP-Flow-FWI 迭代在两个不同的信息来源之间交替，并由重投影步骤在两者之间起中介作用。数据一致性块 (12) 完全由测量波形与波动方程物理决定，而去噪更新 (14) 纳入从代表性波速模型学到的信息。这种模块化结构对 FWI 尤其有用：流模型可以仅用波速模型离线训练，无需成对的“波形–模型”样本；而采集几何与观测数据只在重建过程中通过 FWI 目标进入。因此，学习先验并不显式编码某一特定的收发配置，原则上可以复用于与同一类波速模型相关联的不同测量数据。

此外，流时间参数 \(t_n\) 控制这两个成分之间的相互作用。通过 (13)，它决定当前数据一致估计与基分布样本混合的强度；通过 (14)，它还控制随后基于流的先验更新的幅度与性质。因此，为 \(t_n\) 规定一个调度方案，就提供了一种在重建过程中调节学习先验影响力的自然机制。

式 (12)、(13)、(14) 定义了所提出的 PnP-Flow FWI 重建，细节在第 3.2 节汇总。

> **注 1（Remark 1）** 为把 PnP-Flow 与经典正则化联系起来，可考虑对 (7) 的空间离散形式应用前向–后向分裂（forward–backward splitting）：它会在 (12) 的单步梯度下降之后接上一个近端更新
>
> $$
> \mathbf{m}_{n+1}=\mathrm{prox}_{\eta_n R}(\mathbf{z}_n),\tag{15}
> $$
>
> 其中这里的 \(R\) 表示离散化后的正则化泛函，任何可容许性约束都可通过指示函数（indicator function）纳入。PnP 的核心思想是用一个去噪算子替代该近端步骤，从而在不需要显式泛函 \(R\) 的情况下引入先验信息 [23]。在所提出的 FWI 方法中，这一角色由基于流的去噪器承担。

### 3.2 算法

现在我们汇总第 3.1 节所讨论的算法，它在数据一致性更新与学习型流匹配去噪器之间交替。该算法在相继的去噪器/先验更新之间执行多次 Adam 迭代 [57]，以便在把重建限制到预训练去噪器分布之前充分强制物理与数据一致性。完整流程见算法 1。

**算法 1：PnP-Flow 全波形反演**

| 行 | 算法步骤 |
|---|---|
| 1 | **输入：** 初始波速模型 \(\mathbf{m}_0\)、数据失配目标 \(\Phi(\cdot;\mathbf{d}^{\delta})\) 与模型梯度 \(\nabla\Phi(\cdot;\mathbf{d}^{\delta})\)、预训练流匹配向量场 \(v_\theta\)、流起始时间 \(t_{\mathrm{start}}\) 与上限时间 \(t_{\mathrm{max}}\)、外层迭代数 \(N_{\mathrm{out}}\)、内层迭代数 \(N_{\mathrm{in}}\)、去噪器内采样数 \(M\)、基础学习率 \(\eta_0\)、仿射变换与重建映射 \(\mathcal{A},\mathcal{A}^{-1}\)，以及算法 2 中的 Adam 参数 |
| 2 | \(\Delta t=(t_{\mathrm{max}}-t_{\mathrm{start}})/(N_{\mathrm{out}}N_{\mathrm{in}})\)，\(t_{-1}=t_{\mathrm{start}}\) |
| 3 | **for** \(n=0,\ldots,N_{\mathrm{out}}-1\) **do** |
| 4 | &emsp;内层优化迭代： |
| 5 | &emsp;\(\mathbf{m}^{(0)}=\mathbf{m}_n\)，\(t^{(0)}=t_{n-1}\)；把两个 Adam 矩都重置为零 |
| 6 | &emsp;**for** \(k=0,\ldots,N_{\mathrm{in}}-1\) **do** |
| 7 | &emsp;&emsp;\(\mathbf{g}^{(k)}=\nabla\Phi(\mathbf{m}^{(k)};\mathbf{d}^{\delta})\) |
| 8 | &emsp;&emsp;\(\eta^{(k)}=\eta_0\,(1-t^{(k)})\) |
| 9 | &emsp;&emsp;用算法 2 计算 \(\Delta\mathbf{m}^{(k)}(\mathbf{g}^{(k)})\) 并更新 Adam 矩 |
| 10 | &emsp;&emsp;\(\mathbf{m}^{(k+1)}=\mathbf{m}^{(k)}+\eta^{(k)}\Delta\mathbf{m}^{(k)}(\mathbf{g}^{(k)})\) |
| 11 | &emsp;&emsp;\(t^{(k+1)}=t^{(k)}+\Delta t\) |
| 12 | &emsp;**end for** |
| 13 | &emsp;\(t_n=t^{(N_{\mathrm{in}})}\) |
| 14 | &emsp;施加流匹配去噪器： |
| 15 | &emsp;\(\mathbf{z}_n=\mathcal{A}(\mathbf{m}^{(N_{\mathrm{in}})})\) &emsp;▷ 归一化用的仿射变换 |
| 16 | &emsp;**for** \(\ell=1,\ldots,M\) **do** |
| 17 | &emsp;&emsp;抽取独立高斯噪声样本 \(\boldsymbol{\xi}_{n,\ell}\sim\mathcal{N}(0,I)\) |
| 18 | &emsp;&emsp;\(\widetilde{\mathbf{z}}_{n,\ell}=(1-t_n)\boldsymbol{\xi}_{n,\ell}+t_n\mathbf{z}_n\) &emsp;▷ 线性插值 |
| 19 | &emsp;&emsp;\(\widetilde{\mathbf{m}}_{n+1,\ell}=D_{t_n}^{\theta}(\widetilde{\mathbf{z}}_{n,\ell})=\widetilde{\mathbf{z}}_{n,\ell}+(1-t_n)v_\theta(\widetilde{\mathbf{z}}_{n,\ell},t_n)\) &emsp;▷ 施加 FM 去噪器 |
| 20 | &emsp;**end for** |
| 21 | &emsp;\(\mathbf{m}_{n+1}=\dfrac{1}{M}\sum\limits_{\ell=1}^{M}\mathcal{A}^{-1}(\widetilde{\mathbf{m}}_{n+1,\ell})\) &emsp;▷ 对重建候选取平均 |
| 22 | **end for** |
| 23 | **return** 重建波速模型 \(\mathbf{m}_{N_{\mathrm{out}}}\) |

> **注 2（Remark 2）** 在算法 1 中，Adam 状态在每次外层迭代开始时被重置。仿射映射 \(\mathcal{A}\) 把周期网格嵌入（periodic grid embedding）与从物理波速单位到先验模型 \(P_1\) 取值范围的归一化结合起来。其逆 \(\mathcal{A}^{-1}\) 对流输出做反归一化，并去除重复的周期端点，从而在原始波速场 PDE 网格上恢复该场。

> **注 3（Remark 3，收敛性）** Martin 等人 [34] 在其命题 4 的假设下建立了原始 PnP-Flow 迭代的收敛性。我们的方法把该迭代适配到非线性波形反演，并在先验更新之间使用多次 Adam 更新。对这一修改后迭代的收敛性分析仍是未决问题。

算法 1 中的两个成分——Adam 块与 FM 去噪器——扮演互补的角色。Adam 迭代促进与测量数据以及支配性波动方程的一致性，而流匹配更新把重建输运到学习到的训练数据分布上。较小的 \(t_{\mathrm{start}}\) 会给高斯噪声分配更大的权重，并产生更长的流轨迹，从而带来更强的先验正则化。

算法 1 中每次 Adam 迭代的计算代价主要来自评估多源目标函数及其梯度。具体而言，\(\Phi(\mathbf{m};\mathbf{d}^{\delta})\) 在 \(N_s\) 个源上累加失配，其中每个源都涉及一次波动方程的解 \(u_s\)。评估每个源的失配需要一次正演波动方程求解，而计算其梯度还需一次额外的伴随方程求解。因此，每次 Adam 迭代大约需要 \(2N_s\) 次 PDE 求解，而一个数据一致性块大约需要 \(2N_sN_{\mathrm{in}}\) 次 PDE 求解。相比之下，每次流匹配先验更新需要 \(M\) 次对学习向量场 \(v_\theta\) 的求值。参数 \(N_{\mathrm{in}}\) 与 \(M\) 分别决定分配给数据一致性与先验更新的计算量，而 \(t_{\mathrm{start}}\) 控制先验输运的强度。因此，它们的选择在计算代价、物理一致性与学习正则化之间做出权衡。

## 4 数值实验

我们提出以下问题：当两种方法每次运行使用相同次数的波形失配更新时，在含包含体的声速场上训练的流先验相对于 TV-FWI 是否改进重建；它如何影响恢复出的包含体对比度；以及这些改进能否在不重新训练、不重新调参的情况下延伸到乳腺体模。我们聚焦于小包含体，考察正则化如何影响其恢复出的对比度。我们首先用各自模型族中训练的先验，评估常数背景与空间变化背景下圆包含体的重建精度与对比度恢复（第 4.2 与 4.3 节）。为考察这些收益能否延伸到训练族之外，我们随后在不重新训练的情况下把高斯圆先验应用到乳腺体模上，并保留各方法在高斯圆实验中的重建设置而不重新调参（第 4.4 节）。

### 4.1 实验设置

**正演模型与数据采集。** 在数值实验中，我们考虑的 FWI 正演模型遵循区域 \(\Omega=(0,1)\times(-1,0)\) 上的声波方程 (1)，采用零初始条件、左右两侧周期边界条件、底部齐次 Neumann 边界条件。空间均匀的源通过顶边界通量

$$
\partial_y u_s(\mathbf{x},0,t_{\mathrm{w}})=w_{f_s}(t_{\mathrm{w}})
$$

对每个炮（shot）\(s\) 施加，其时间剖面为 Ricker 型，并在中心频率 \(f_s\) 上各不相同（如图 1 所示），

$$
w_{f_s}(t_{\mathrm{w}}):=\Big[1-2\pi^{2}f_s^{2}\,(t_{\mathrm{w}}-1.5/f_s)^{2}\Big]\exp\Big[-\pi^{2}f_s^{2}\,(t_{\mathrm{w}}-1.5/f_s)^{2}\Big].
$$

我们的实验中没有内部源，即 (1) 中 \(q_s=0\)。总计使用十二个炮，中心频率 \(f_s\in\{3,4,\ldots,14\}\)，所有接收器都布置在区域的下边界。

波动方程在空间上采用中心二阶有限差分、在时间上采用显式二阶时间推进格式离散。空间网格包含 63 个水平与 64 个垂直网格点。对每个目标波速场 \(\mathbf{m}^{\dagger}\)，时间步长取为 \(\Delta t=0.4/(63\sqrt{2}\max\mathbf{m}^{\dagger})\) 以满足 CFL 条件，并在相应的反演过程中保持不变。下边界上的全部 63 个网格点 \(\{x_r\}_{r=1}^{63}\) 都被用作接收器。我们模拟 1000 个时间步，并每隔一个时间步记录接收器处的波场：

$$
d_{s,r,n}=u_s\big((x_r,-1),\,2n\Delta t;\mathbf{m}^{\dagger}\big),\qquad n=0,1,2,\ldots,499.
$$

这些量在我们的数值实验中直接用作每个炮的合成测量 \(\mathbf{d}_s\)，即我们使用无噪数据[^fn2]。因此，取总数据 \(\mathbf{d}=(\mathbf{d}_1,\ldots,\mathbf{d}_{12})\)，相应的离散波形失配目标为

$$
\Phi(\mathbf{m};\mathbf{d})=\frac{1}{2}\sum_{s=1}^{12}\sum_{r=1}^{63}\sum_{n=0}^{499}\big|u_s\big((x_r,-1),2n\Delta t;\mathbf{m}\big)-d_{s,r,n}\big|^{2}.
$$

**图 1（原文 Fig. 1）：** 三项研究共用的平面波采集。在每个特定频率的炮中，顶边界施加空间均匀的源通量，波向下方的接收器传播。  
图面说明（据原文插图）：图中标注了入射传播方向、顶部源边界（均匀通量，每个 \(f_s\in\{3,\ldots,14\}\) 一个炮）、底部接收器（下边界全部 63 个网格点，其上 \(\partial_yu_s=0\)）以及左右周期边界。

[^fn2]: 主要实验使用无噪数据。我们也用含噪测量测试了该方法；见表 C1。由于结果与无噪情形定性相似，为简化呈现，正文报告无噪结果。

**重建算法与误差度量。** 我们把所提出的 PnP-Flow 方法（算法 1）与标准的 TV 正则化 FWI 方法比较，后者改为求解如下优化问题

$$
\arg\min_{\mathbf{m}}\ \Phi(\mathbf{m};\mathbf{d})+\lambda_{\mathrm{TV}}\mathcal{R}_{\mathrm{TV},\varepsilon_{\mathrm{TV}}}(\mathbf{m}),\tag{16}
$$

$$
\mathcal{R}_{\mathrm{TV},\varepsilon_{\mathrm{TV}}}(\mathbf{m}):=\sum_{i,j}\sqrt{(m_{i+1,j}-m_{ij})^{2}+(m_{i,j+1}-m_{ij})^{2}+\varepsilon_{\mathrm{TV}}},\qquad\varepsilon_{\mathrm{TV}}=10^{-4}.
$$

该优化同样用 Adam 迭代求解，采用常数步长与算法 2 中给出的更新方向，后文称之为 TV-FWI。

TV-FWI 与 PnP-Flow 都从常数场 \(\mathbf{m}_0=\mathbf{8}\) 初始化。PnP-Flow 按算法 1 执行，使用在含若干圆的图像上预训练的 FM 去噪器（细节见附录 B），初始学习率 \(\eta_0=0.1\)、流起始时间 \(t_{\mathrm{start}}=0.5\)、上限时间 \(t_{\mathrm{max}}=1\)。实验中取 \(N_{\mathrm{out}}=50\) 次外层迭代，每次包含 \(N_{\mathrm{in}}=50\) 次内层优化迭代，随后执行一次流先验更新。我们把每次内层优化迭代称为一次**数据更新**。

在每次流先验更新中，使用 \(M=8\) 个独立高斯噪声样本生成八个去噪提案，并对其取平均，得到下一次外层迭代的起始场。因此，一次完整的 PnP-Flow 重建包含 \(50\times50=2500\) 次数据更新与 50 次流先验更新。为公平比较 PnP-Flow 与 TV-FWI，我们对 TV-FWI 也使用总计 2500 次 Adam 更新，使二者处于相近的计算代价下。在 NVIDIA RTX 6000 Ada GPU 上，PnP-Flow 的重建约需 58 s，TV-FWI 约需 52 s。

对目标 \(\mathbf{m}_i^{\dagger}\) 与重建 \(\widehat{\mathbf{m}}_i\)，我们用求解器网格上的相对 \(L^{2}\) 误差衡量重建精度，

$$
e_i(\widehat{\mathbf{m}}_i)=\|\widehat{\mathbf{m}}_i-\mathbf{m}_i^{\dagger}\|_2/\|\mathbf{m}_i^{\dagger}\|_2.\tag{17}
$$

然而需要注意，由于相对 \(L^{2}\) 误差是在整幅图像上计算的，即使某个局部包含体的对比度恢复得很差，它也可能仍然较小。因此我们引入第二个度量来刻画包含体对比度。具体而言，对目标 \(i\) 中的每个包含体 \(j\)，我们把包含体内部的平均波速与其邻近背景的平均波速作比较。设 \(K_{ij}\) 表示去掉一个像素边界层后真实包含体的内部，设 \(R_{ij}\) 表示由距该包含体 2–5 个像素的像素组成的周围背景区域。属于任何真实包含体的像素都被从 \(R_{ij}\) 中排除。这些区域由真值目标确定，并在评估所有重建时保持固定。对离散波速场 \(\mathbf{m}\)，我们定义包含体对比度为

$$
C_{ij}(\mathbf{m})=\mathrm{mean}_{K_{ij}}\,\mathbf{m}-\mathrm{mean}_{R_{ij}}\,\mathbf{m}.
$$

因此，当包含体的平均波速高于其局部背景时 \(C_{ij}(\mathbf{m})\) 为正，低于时则为负。目标 \(i\) 的相应对比度误差定义为

$$
E_{C,i}(\widehat{\mathbf{m}}_i)=\frac{1}{n_i}\sum_{j=1}^{n_i}\big|C_{ij}(\widehat{\mathbf{m}}_i)-C_{ij}(\mathbf{m}_i^{\dagger})\big|,\tag{18}
$$

其中 \(n_i\) 是目标 \(i\) 中被评估的包含体数量。对圆模型数据（第 4.2–4.3 节），真值目标中每个空间上独立的包含体区域都被评估。对乳腺数据（第 4.4 节），只评估指定的目标病灶，故 \(n_i=1\)；属于其他已标注病灶的像素被从周围背景区域中排除。对比度误差与波速场具有相同的单位。

最后，由于 FM 去噪器给 PnP-Flow 引入了随机性，我们对每个目标执行四次独立的 PnP-Flow 重建。对相对 \(L^{2}\) 误差 (17) 与对比度误差 (18)，我们都取四次运行的中位数作为该目标的误差。TV-FWI 是确定性的，因此对每个目标只评估一次。对每种方法，我们报告在所有目标上的误差中位数，并报告 PnP-Flow 的中位误差低于相应 TV-FWI 误差的目标数量。

### 4.2 常数背景上的圆

我们首先在分段常数场（含圆包含体，即声速与周围背景不同的区域）上，检验 PnP-Flow 在匹配的数据更新预算下是否提高精度。我们在 50 幅测试图像上评估两种方法，这些图像在声速为 8 的均匀背景中嵌入更快与更慢的包含体。学习先验在同一模型族的独立图像上训练，包含体的大小、位置与声速均有变化，因此该实验提供分布内比较。均匀区域与尖锐界面也与 TV 正则化相容，使 TV-FWI 成为这一比较的自然基线。因此，我们与参数为 \(\lambda_{\mathrm{TV}}=0.0003\)、步长为 0.1 的 TV-FWI 比较，这些参数用另一组常数背景图像选定。

在每次运行 2500 次数据更新的名义预算下，PnP-Flow 的相对 \(L^{2}\) 误差中位数为 1.92%，TV-FWI 为 2.65%；见表 1。这一改进也反映在逐目标比较中：PnP-Flow 在 50 幅图像中的 39 幅上具有更低的相对 \(L^{2}\) 误差。包含体对比度误差中位数对 PnP-Flow 为 0.051，对 TV-FWI 为 0.316，且 PnP-Flow 在 50 幅图像中的 48 幅上具有更低的对比度误差。含噪数据的敏感性测试见表 C1；在所测试的噪声水平下，两种方法的两个误差度量变化都很小，且 PnP-Flow 在两个度量上都保持更低的中位误差。

图 2 展示了两个代表性测试图像的重建结果。在案例 17 中，PnP-Flow 以更锐利的边界与更准确的对比度恢复包含体，而 TV-FWI 产生更平滑的边界并低估对比度。因此 PnP-Flow 取得了显著更低的相对 \(L^{2}\) 误差（0.40% 对 0.83%）。在案例 39 中，两种方法都锐利地恢复出包含体边界，但 PnP-Flow 略微偏移了较大包含体的边界，导致其重建误差略高于 TV-FWI（1.38% 对 1.36%）。

因此，在匹配的更新预算下，对大多数常数背景测试图像，PnP-Flow 相对于所选定的 TV-FWI 配置降低了重建误差。

**表 1（原文 Table 1）：常数背景圆，全部 50 幅图像。** 相对 \(L^{2}\) 误差为百分数，按图像取中位数汇总；PnP-Flow 使用每幅图像在四次独立运行上的中位误差。每次运行使用所列预算，且不对场做平均。TV-FWI 使用 \(\lambda_{\mathrm{TV}}=0.0003\)、步长 0.1。对比度误差为第 4.1 节的包含体对比度误差，单位为模型声速单位，按图像取中位数汇总。

| 重建方案 | 每次运行的更新次数 | 相对 \(L^{2}\) 误差中位数（%） | 对比度误差中位数 |
|---|---|---|---|
| 常数起点，\(m=8\) | 0 | 6.57 | 2.016 |
| PnP-Flow（各图四次运行的中位误差） | 2,500 | 1.92 | 0.051 |
| TV-FWI | 2,500 | 2.65 | 0.316 |

**图 2（原文 Fig. 2）：** 常数背景圆：TV-FWI 与 PnP-Flow（seed 0）在 2500 次更新后的重建与绝对误差图。案例 17 与 39 分别给出 PnP-Flow 与 TV-FWI 相对 \(L^{2}\) 重建误差更低的例子。每个案例内部共用色标。  
图面说明（据原文插图）：列为真值、TV-FWI（2500 次更新，案例 17：相对 \(L^{2}\) 0.83%；案例 39：1.36%）、PnP-Flow seed 0（2500 次更新，案例 17：0.40%；案例 39：1.38%）；行为声速与绝对误差；案例 17 声速色标 8.2–8.6、绝对误差 0–0.6，案例 39 声速色标 7–9、绝对误差 0–1.0。

### 4.3 空间变化高斯背景上的圆

我们接着考虑一个更非均匀的目标族，其背景波速在空间上变化。我们保留第 4.2 节所用的相同 50 个包含体几何，但把常数背景替换为围绕背景值 8 的空间相关高斯变化。这些变化在多个空间尺度上含有结构，因此重建必须同时恢复局部化的包含体与空间变化的背景。一个独立的流匹配先验在该高斯背景族生成的场上训练；因此该实验仍是分布内测试。数据生成与先验训练的细节见附录 B。

TV-FWI 使用 \(\lambda_{\mathrm{TV}}=0.003\)、步长 0.01。在每次重建 2500 次数据更新的预算下，50 个测试目标上的相对 \(L^{2}\) 误差中位数对 PnP-Flow 为 3.67%，对 TV-FWI 为 4.69%；见表 2。在逐目标意义上，PnP-Flow 在 50 个目标中的 48 个上具有更小的重建误差。因此，在此处所考虑的重建设置下，PnP-Flow 在高斯背景测试集的多数目标上给出比 TV-FWI 更低的相对 \(L^{2}\) 误差。在包含体对比度上，中位误差对 PnP-Flow 为 0.239，对 TV-FWI 为 0.851，且 PnP-Flow 在 50 个目标中的 49 个上具有更低的对比度误差。

代表性重建见图 3。案例 17 含有与图 2 中相应常数背景例子相同的包含体几何。在该案例中，PnP-Flow 恢复了包含体边界与大部分真实对比度，而 TV-FWI 只恢复了约一半对比度。案例 2 是 TV-FWI 取得更低相对 \(L^{2}\) 误差的两个目标之一。在此，PnP-Flow 高估了大尺寸低速包含体的范围，且其恢复的背景不如 TV-FWI 产生的更平滑背景准确。两种方法都没有很好地分辨细尺度背景纹理，且在此例中两种方法都只弱弱地恢复了高速包含体。这些案例既展示了 PnP-Flow 在保留包含体对比度上的典型优势，也展示了一种失效模式：学习先验扭曲了包含体几何与背景结构。

**表 2（原文 Table 2）：高斯背景圆，全部 50 幅图像。** 表中各项为按图像取的中位数，相对 \(L^{2}\) 误差以百分数报告。对 PnP-Flow，每幅图像贡献其在所列数据更新预算下四次独立运行的中位误差；重建不在运行之间取平均。TV-FWI 使用 \(\lambda_{\mathrm{TV}}=0.003\)、步长 0.01，这些参数在另一组高斯背景图像上选定。

| 重建方案 | 每次运行的更新次数 | 相对 \(L^{2}\) 误差中位数（%） | 对比度误差中位数 |
|---|---|---|---|
| 常数起点，\(m=8\) | 0 | 7.45 | 2.061 |
| PnP-Flow（各图四次运行的中位误差） | 2,500 | 3.67 | 0.239 |
| TV-FWI | 2,500 | 4.69 | 0.851 |

**图 3（原文 Fig. 3）：** 高斯背景圆：TV-FWI 与 PnP-Flow（seed 0）在 2500 次数据更新后的重建与相应绝对误差图。案例 17 与 2 分别使 PnP-Flow 与 TV-FWI 取得更低的相对 \(L^{2}\) 误差。案例 17 使用与图 2 中案例 17 相同的包含体几何。每个案例内部共用色标。  
图面说明（据原文插图）：案例 17——TV-FWI 相对 \(L^{2}\) 3.54%、PnP-Flow 2.52%，声速色标 7.5–8.5、绝对误差 0.00–1.00；案例 2——TV-FWI 5.39%、PnP-Flow 6.82%，声速色标 6–9、绝对误差 0.0–2.0。

### 4.4 乳腺体模图像中的病灶识别

我们以一个更接近医学成像应用的场景来结束比较。具体而言，我们处理在乳腺体模图像中寻找病灶的问题。与空间变化高斯背景上的圆类似，乳腺体模图像中含有看起来像局部化包含体的病灶，必须在具有变化纹理的组织内部识别出来。尽管乳腺体模案例的界面与纹理不同于第 4.3 节的具体数据，其设置是类似的：非均匀背景与包含体识别任务。因此，我们直接取用上一节训练好的高斯圆先验模型而不重新训练，并检验它作为乳腺体模图像案例中病灶对比度重建与检测先验的有效性。需要注意，鉴于公开乳腺影像数据在一定程度上有限（部分出于隐私保护的原因），能够构建廉价的数据代理（data proxy）来训练精巧但数据饥渴的模型（如扩散生成模型），并在这种内在分布偏移下分析性能，是有用的。

在实验中，我们使用由 Li 等人 [58] 的数值声学乳腺体模导出的目标。这些体模包含四类乳腺组织：'A' 以脂肪为主，'B' 含散在纤维腺体组织，'C' 为不均匀致密型，'D' 为极度致密型。我们选取 32 个不同的母体模（parent phantom），每类 8 个，并构建包含 32 个图像块的测试集，每个图像块取自不同的体模。可用的体模标注使我们能够选择目标病灶并确定图像块的大小与位置。为把我们的方法应用于这些声学数据，声速通过 \(m=m_{\mathrm{m/s}}\cdot 8/1450\) 映射到模型单位，从而一个模型单位约对应 181 m/s。新的波形用第 4.1 节所述的采集方式生成。

在主要比较中，TV-FWI 与 PnP-Flow 保留第 4.3 节的参数设置，不做乳腺专用的调参。我们按第 4.1 节的定义报告相对 \(L^{2}\) 误差与病灶对比度误差，其中核心区与环带由体模标注确定。表 3 报告了两种方法在 2500 次更新时的整幅图像相对 \(L^{2}\) 误差与病灶对比度误差，以及常数起始场 \(m=8\) 的相应数值。两种方法大致把常数起点的整幅图像误差中位数减半：PnP-Flow 从 2.99% 降至 1.56%，TV-FWI 降至 1.52%。整幅图像误差相近，PnP-Flow 在 32 个图像块中的 17 个上取得更低误差，整体上没有明显优于 TV-FWI。然而在病灶对比度上，PnP-Flow 的中位误差低于 TV-FWI，为 0.214 对 0.263 模型声速单位，并在 32 个图像块中的 28 个上具有更低误差。

对 A–C 型中的每一型，PnP-Flow 在其全部八个图像块上都有更低的对比度误差。D 型的结果则是混合的：PnP-Flow 在八个图像块中的四个上误差更低，而 TV-FWI 的中位对比度误差更低。该队列四型中，D 型的中位真实病灶对比度也最低。图 4 展示了各案例之间的差异。在 B 型例子中，两种方法都低估病灶对比度，但 PnP-Flow 恢复得更准确。在 D 型例子中，PnP-Flow 高估了较弱的病灶对比度，而 TV-FWI 更接近真值。

**表 3（原文 Table 3）：迁移到全部 32 个乳腺图像块。** TV-FWI 使用高斯背景选定出的 \(\lambda_{\mathrm{TV}}=0.003\) 与步长 0.01；PnP-Flow 使用高斯圆先验与重建设置。表中各项为按图像块取的中位数；PnP-Flow 使用每个图像块在四次独立运行上的中位误差，且不对场取平均。对比度误差单位为模型声速单位。

| 重建方案 | 每次运行的更新次数 | 相对 \(L^{2}\) 误差中位数（%） | 对比度误差中位数 |
|---|---|---|---|
| 常数起点，\(m=8\) | 0 | 2.99 | 0.381 |
| PnP-Flow（各图像块四次运行的中位误差） | 2,500 | 1.56 | 0.214 |
| TV-FWI | 2,500 | 1.52 | 0.263 |

**图 4（原文 Fig. 4）：** 乳腺重建与以病灶为中心的裁剪图，分别为 TV-FWI 与 PnP-Flow seed 0，均取 2500 次更新（即表 3 的预算）。B 型案例 8 与 D 型案例 29 在对比度误差上分别有利于 PnP-Flow 与 TV-FWI。每个案例内部共用色标；真值面板以白色标出腐蚀后的病灶核心、以橙色标出环带。  
图面说明（据原文插图）：列为真值、TV（2500 次更新）、PnP seed 0（2500 次更新）；B 型案例 8 的对比度分别为 0.520、0.202、0.256，D 型案例 29 的对比度分别为 0.072、0.057、0.111；色标为声速（B 型约 8.0–8.5，D 型约 7.9–8.6）。

## 5 结论

我们通过把波形失配更新与来自预训练流先验的更新交替执行，将 PnP-Flow 适配到非线性全波形反演。在匹配的计算预算下，所提方法在所测试的两类圆包含体模型族——常数背景上的圆与空间变化高斯背景上的圆——上都比 TV-FWI 取得更低的整幅图像误差中位数与包含体对比度误差。在两种情形下，先验都仅从声速图像学到，而测量信息在重建过程中通过波形失配更新进入。这使得模型统计规律的学习与测量过程分离，从而构成一种通用的数据驱动正则化方法，其训练不依赖采集几何或源配置。

在更真实的场景中，乳腺实验表明分布外性能并非必然，且取决于所评估的特征。在迁移高斯圆先验与两种方法的重建设置、且不做乳腺专用调参的情况下，PnP-Flow 改善了病灶对比度恢复，同时给出与 TV-FWI 相当的整幅图像误差。这一区别支持在全局重建误差之外同时评估局部对比度。PnP-Flow 的乳腺重建中也含有类似训练包含体的圆润结构（图 4），表明在组织纹理仍不准确的同时病灶对比度可以改善。对常数背景圆，PnP-Flow 在所测试的各测量噪声水平上也优于 TV-FWI（表 C1）。

未来工作方向包括：对求解非线性问题时 PnP-Flow 的完整理论收敛性分析；以及评估迁移学习场景——在数据可得性有限（如某些医学成像问题）时，利用合成数据求解其他实验设置。

**致谢。** 作者感谢由北卡罗来纳大学教堂山分校于 2025 年 8 月 4–8 日主办的数据与数学科学研究协作工作坊（Research Collaboration Workshop in the Science of Data and Mathematics，WiSDM）的支持，本工作即发端于此。F. Terzioglu 的工作部分由国家科学基金会（NSF）资助 DMS-2206279 支持。LZ 部分由 NSF 资助 DMS-2231482 支持。

## 声明

本文使用了一个基于 AI 的语言工具协助编辑稿件，以改进拼写、语法与文风。作者随后按需审阅并修改了文本，并对已发表文章的内容承担全部责任。

作者使用 Claude Code（Anthropic）协助编写与调试数值实验所用软件。所有代码随后由作者审阅与测试，作者对软件与所报告结果承担全部责任。

## 代码可用性

代码见 <https://github.com/siting6/pnpflow-fwi-numerics>。

## 附录 A Adam 优化算法

下面汇总我们在数值实验中使用的截断 Adam 优化算法（不做偏差校正），它用于更新从 PDE 约束与数据失配导出的基于物理的方向。

**算法 2：带梯度截断的 Adam 更新方向**

| 行 | 算法步骤 |
|---|---|
| 1 | **输入：** 梯度 \(\mathbf{g}^{(k)}\)、先前的 Adam 状态 \(\boldsymbol{\mu}^{(k)},\boldsymbol{\nu}^{(k)}\)（\(\boldsymbol{\mu}^{(0)}=\mathbf{0},\boldsymbol{\nu}^{(0)}=\mathbf{0}\)）、Adam 参数 \(\beta_1,\beta_2,\epsilon\)，以及梯度截断阈值 \(G\) |
| 2 | \(\bar{\mathbf{g}}^{(k)}=\mathbf{g}^{(k)}\min\{1,\ G/(\lVert\mathbf{g}^{(k)}\rVert_2+10^{-12})\}\) |
| 3 | \(\boldsymbol{\mu}^{(k+1)}=\beta_1\boldsymbol{\mu}^{(k)}+(1-\beta_1)\bar{\mathbf{g}}^{(k)}\) |
| 4 | \(\boldsymbol{\nu}^{(k+1)}=\beta_2\boldsymbol{\nu}^{(k)}+(1-\beta_2)(\bar{\mathbf{g}}^{(k)})^{2}\) |
| 5 | \(\Delta\mathbf{m}^{(k)}(\mathbf{g}^{(k)})=-\boldsymbol{\mu}^{(k+1)}/(\sqrt{\boldsymbol{\nu}^{(k+1)}}+\epsilon)\) |
| 6 | **return** 方向 \(\Delta\mathbf{m}^{(k)}\) 与更新后的 Adam 状态 \(\boldsymbol{\mu}^{(k+1)},\boldsymbol{\nu}^{(k+1)}\) |

> **注 4（Remark 4）** 算法 2 中的全局 \(\ell^{2}\) 截断在把梯度范数限制到 \(G\) 的同时保持其方向，从而减弱异常大的 FWI 梯度所引起的不稳定。平方 \((\bar{\mathbf{g}}^{(k)})^{2}\) 表示逐元素平方，而不是内积或矩阵乘积；且 Adam 矩未做偏差校正。在数值实验中，我们取 \((\beta_1,\beta_2)=(0.9,0.999)\)、截断阈值 \(G=10\)。

## 附录 B 训练数据与学习先验

**圆族。** 我们构造两族训练场，它们共享相同的圆包含体，但背景不同。常数背景场在声速为 8 的背景上包含一到三个互不重叠的圆包含体。包含体声速位于 \([4,12]\)，其半径为区域宽度的 0.06 至 0.14 倍。我们在 \(256\times256\) 网格上生成这些场，并用众数池化（mode pooling）下采样到 \(64\times64\)。由这些下采样场出发，我们保留包含体、把背景替换为 \(8+\sigma G\)，从而构造高斯背景族，其中 \(\sigma\sim\mathcal{U}[0.15,0.45]\)。这里 \(G\) 是由三个空间尺度上的高斯平滑噪声组合而成的标准化随机场。图 B1 展示了共享的包含体几何与两类背景。两族共用 4,884 个训练几何、100 个验证几何与 50 个测试几何（测试集从训练与验证中留出）。对高斯族，训练集、验证集与测试集分别生成独立的背景实现。

**先验训练。** 使用这些数据集，我们把训练场归一化到 \([-1,1]\)，并用最优传输条件流匹配（optimal-transport conditional flow matching）为每一族训练一个独立先验。两个模型使用相同的时间条件 U-Net 架构与训练配置：300 个 epoch、批大小 32、学习率 \(2\times10^{-4}\)，并采用预热后接余弦衰减的调度。训练期间，我们维护模型权重的指数滑动平均（EMA），衰减率为 0.9999。对每个模型，我们选择验证损失最低的检查点。选定的高斯背景先验用于高斯圆实验，并在乳腺体模迁移实验中复用。

**图 B1（原文 Fig. B1）：** 具有常数（上）与高斯（下）背景及匹配圆几何的代表性 \(64\times64\) 训练场。各列分别展示一个、两个与三个包含体。  
图面说明（据原文插图）：面板 (a)–(f) 依次为常数背景的一/二/三个圆与高斯背景的一/二/三个圆；色标为波速（project units，投影单位），范围 4–12。

## 附录 C 对测量噪声的敏感性

在这些含噪数据的敏感性测试中，两种方法的中位误差相对于无噪结果变化很小：相对 \(L^{2}\) 误差最多变化 0.19 个百分点，对比度误差最多变化 0.014。在此噪声范围内，PnP-Flow 的表现优于 TV-FWI（结果为表 C1）。

**表 C1（原文 Table C1）：常数背景比较对加性测量噪声的敏感性。** 我们在同样 50 幅测试图像上重复表 1 的比较，并向数据中加入测量噪声。所有重建设置都保持为无噪数据时所用的数值。对每幅图像与每个炮，我们加入独立的零均值高斯噪声，其标准差为干净炮记录均方根值的 0.03、0.10 或 0.316 倍，分别对应 30.5 dB、20 dB 与 10 dB；每幅图像的同一噪声实现被两种方法共用。我们报告每次运行 2500 次更新的名义预算下的相对 \(L^{2}\) 中位误差与对比度中位误差。PnP-Flow 各行使用与表 1 不同的四次独立运行，故其无噪条目与表 1 略有差异。

| 噪声水平 | 重建方案 | 相对 \(L^{2}\) 误差中位数（%） | 对比度误差中位数 |
|---|---|---|---|
| 无噪 | PnP-Flow | 1.79 | 0.049 |
| 无噪 | TV-FWI | 2.65 | 0.316 |
| 30.5 dB | PnP-Flow | 1.77 | 0.048 |
| 30.5 dB | TV-FWI | 2.66 | 0.312 |
| 20 dB | PnP-Flow | 1.79 | 0.063 |
| 20 dB | TV-FWI | 2.67 | 0.303 |
| 10 dB | PnP-Flow | 1.89 | 0.063 |
| 10 dB | TV-FWI | 2.84 | 0.319 |

具体而言，在 10 dB 时 PnP-Flow 在 50 幅图像中的 42 幅上具有更低的相对 \(L^{2}\) 误差，并在 50 幅中的 49 幅上具有更低的对比度误差。

## 参考文献

[1] Akcelik, V., Biros, G., Ghattas, O.: Parallel multiscale Gauss-Newton-Krylov methods for inverse wave propagation. In: SC'02: Proceedings of the 2002 ACM/IEEE Conference on Supercomputing, pp. 41–41 (2002). IEEE

[2] Bunks, C., Saleck, F.M., Zaleski, S., Chavent, G.: Multiscale seismic waveform inversion. Geophysics 60(5), 1457–1473 (1995)

[3] Chen, K., Sacchi, M.D.: Time-domain elastic Gauss–Newton full-waveform inversion: a matrix-free approach. Geophysical Journal International 223(2), 1007–1039 (2020)

[4] Tarantola, A.: Inversion of seismic reflection data in the acoustic approximation. Geophysics 49(8), 1259–1266 (1984)

[5] Virieux, J., Operto, S.: An overview of full-waveform inversion in exploration geophysics. Geophysics 74(6) (2009) https://doi.org/10.1190/1.3238367. pp. WCC1–WCC26

[6] Bachmann, E., Tromp, J.: Source encoding for viscoacoustic ultrasound computed tomography. The Journal of the Acoustical Society of America 147(5), 3221–3235 (2020)

[7] Bernard, S., Monteiller, V., Komatitsch, D., Lasaygues, P.: Ultrasonic computed tomography based on full-waveform inversion for bone quantitative imaging. Physics in Medicine & Biology 62(17), 7011–7035 (2017) https://doi.org/10.1088/1361-6560/aa7e5a

[8] Wiskin, J., Borup, D.T., Johnson, S.A., Berggren, M.: Non-linear inverse scattering: High resolution quantitative breast tissue tomography. The Journal of the Acoustical Society of America 131(5), 3802–3813 (2012) https://doi.org/10.1121/1.3699240

[9] Sandhu, G.Y., Li, C., Roy, O., Schmidt, S., Duric, N.: Frequency domain ultrasound waveform tomography: Breast imaging using a ring transducer. Physics in Medicine & Biology 60(14), 5381–5398 (2015) https://doi.org/10.1088/0031-9155/60/14/5381

[10] Lucka, F., Pérez-Liva, M., Treeby, B.E., Cox, B.T.: High resolution 3D ultrasonic breast imaging by time-domain full waveform inversion. Inverse Problems 38(2), 025008 (2022) https://doi.org/10.1088/1361-6420/ac3b64

[11] Wang, K., Matthews, T., Anis, F., Li, C., Duric, N., Anastasio, M.A.: Waveform inversion with source encoding for breast sound speed reconstruction in ultrasound computed tomography. IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control 62(3), 475–493 (2015) https://doi.org/10.1109/TUFFC.2014.006788

[12] Pratt, R.G., Huang, L., Duric, N., Littrup, P.J.: Sound-speed and attenuation imaging of breast tissue using waveform tomography of transmission ultrasound data. In: Medical Imaging 2007: Physics of Medical Imaging, vol. 6510. SPIE, Bellingham, WA (2007). https://doi.org/10.1117/12.708789. Article 65104S

[13] Pérez-Liva, M., Herraiz, J.L., Udías, J.M., Miller, E., Cox, B.T., Treeby, B.E.: Time domain reconstruction of sound speed and attenuation in ultrasound computed tomography using full wave inversion. The Journal of the Acoustical Society of America 141(3), 1595–1604 (2017) https://doi.org/10.1121/1.4976688

[14] Matthews, T.P., Wang, K., Li, C., Duric, N., Anastasio, M.A.: Regularized dual averaging image reconstruction for full-wave ultrasound computed tomography. IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control 64(5), 811–825 (2017) https://doi.org/10.1109/TUFFC.2017.2682061

[15] Ali, R., Mitcham, T.M., Brevett, T., Calderón Agudo, O., Durán Martinez, C., Li, C., Doyley, M.M., Duric, N.: 2-D slicewise waveform inversion of sound speed and acoustic attenuation for ring array ultrasound tomography based on a block LU solver. IEEE Transactions on Medical Imaging 43(8), 2988–3000 (2024) https://doi.org/10.1109/TMI.2024.3383816

[16] Fincke, J., Zhang, X., Shin, B., Ely, G., Anthony, B.W.: Quantitative sound speed imaging of cortical bone and soft tissue: Results from observational data sets. IEEE Transactions on Medical Imaging 41(3), 502–514 (2022) https://doi.org/10.1109/TMI.2021.3115790

[17] Guasch, L., Calderón Agudo, O., Tang, M.-X., Nachev, P., Warner, M.: Full-waveform inversion imaging of the human brain. npj Digital Medicine 3, 28 (2020) https://doi.org/10.1038/s41746-020-0240-8

[18] Cudeiro-Blanco, J., Cueto, C., Bates, O., Strong, G., Robins, T., Toulemonde, M., Warner, M., Tang, M.-X., Calderón Agudo, O., Guasch, L.: Design and construction of a low-frequency ultrasound acquisition device for 2-D brain imaging using full-waveform inversion. Ultrasound in Medicine & Biology 48(10), 1995–2008 (2022) https://doi.org/10.1016/j.ultrasmedbio.2022.05.023

[19] Robins, T.C., Cueto, C., Cudeiro, J., Bates, O., Calderon Agudo, O., Strong, G., Guasch, L., Warner, M., Tang, M.-X.: Dual-probe transcranial full-waveform inversion: A brain phantom feasibility study. Ultrasound in Medicine & Biology 49(10), 2302–2315 (2023) https://doi.org/10.1016/j.ultrasmedbio.2023.06.001

[20] Ulrich, I.E., Boehm, C., Marty, P., Noe, S., Korta Martiartu, N., Dean-Ben, X.L., Razansky, D., Fichtner, A.: Quantitative in-vivo full-waveform ultrasound tomography workflow integrating reflection imaging and resolution analysis. Physics in Medicine & Biology 71(13), 135039 (2026) https://doi.org/10.1088/1361-6560/ae7cd6

[21] Sirgue, L., Pratt, R.G.: Efficient waveform inversion and imaging: A strategy for selecting temporal frequencies. Geophysics 69(1), 231–248 (2004)

[22] Arridge, S., Maass, P., Öktem, O., Schönlieb, C.-B.: Solving inverse problems using data-driven models. Acta Numerica 28, 1–174 (2019)

[23] Venkatakrishnan, S.V., Bouman, C.A., Wohlberg, B.: Plug-and-play priors for model based reconstruction. In: 2013 IEEE Global Conference on Signal and Information Processing, pp. 945–948 (2013). IEEE

[24] Dabov, K., Foi, A., Katkovnik, V., Egiazarian, K.: Image restoration by sparse 3D transform-domain collaborative filtering. In: Astola, J.T., Egiazarian, K.O., Dougherty, E.R. (eds.) Image Processing: Algorithms and Systems VI, vol. 6812, pp. 62–73. SPIE, Bellingham, WA (2008). https://doi.org/10.1117/12.766355. International Society for Optics and Photonics

[25] Zhang, K., Zuo, W., Chen, Y., Meng, D., Zhang, L.: Beyond a Gaussian denoiser: Residual learning of deep CNN for image denoising. IEEE Transactions on Image Processing 26(7), 3142–3155 (2017) https://doi.org/10.1109/TIP.2017.2662206

[26] Song, Y., Ermon, S.: Generative modeling by estimating gradients of the data distribution. In: Advances in Neural Information Processing Systems, vol. 32 (2019)

[27] Ho, J., Jain, A., Abbeel, P.: Denoising diffusion probabilistic models. In: Advances in Neural Information Processing Systems, vol. 33, pp. 6840–6851 (2020)

[28] Song, Y., Sohl-Dickstein, J., Kingma, D.P., Kumar, A., Ermon, S., Poole, B.: Score-based generative modeling through stochastic differential equations. In: International Conference on Learning Representations (2021)

[29] Lipman, Y., Chen, R.T.Q., Ben-Hamu, H., Nickel, M., Le, M.: Flow Matching for Generative Modeling. Paper presented at the 11th International Conference on Learning Representations, ICLR 2023. Preprint at https://arxiv.org/abs/2210.02747 (2023)

[30] Graikos, A., Malkin, N., Jojic, N., Samaras, D.: Diffusion models as plug-and-play priors. In: Advances in Neural Information Processing Systems, vol. 35, pp. 14715–14728 (2022)

[31] Zhu, Y., Zhang, K., Liang, J., Cao, J., Wen, B., Timofte, R., Van Gool, L.: Denoising diffusion models for plug-and-play image restoration. In: Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 1219–1229 (2023)

[32] Wu, Z., Sun, Y., Chen, Y., Zhang, B., Yue, Y., Bouman, K.L.: Principled probabilistic imaging using diffusion models as plug-and-play priors. In: Proceedings of the 38th Conference on Neural Information Processing Systems (NeurIPS) (2024)

[33] Park, C.Y., Hu, Y., McCann, M.T., Garcia-Cardona, C., Wohlberg, B., Kamilov, U.S.: Plug-and-play priors as a score-based method. In: IEEE International Conference on Image Processing, Anchorage, Alaska (2025)

[34] Martin, S., Gagneux, A., Hagemann, P., Steidl, G.: PnP-Flow: Plug-and-Play Image Restoration with Flow Matching. Preprint at https://arxiv.org/abs/2410.02423 (2025)

[35] Robins, T., Camacho, J., Calderon Agudo, O., Herraiz, J.L., Guasch, L.: Deep-learning-driven full-waveform inversion for ultrasound breast imaging. Sensors 21(13), 4570 (2021) https://doi.org/10.3390/s21134570

[36] Tong, J., Wang, X., Ren, J., Lin, M., Li, J., Sun, H., Yin, F., Liang, L., Liu, Y.: Transcranial ultrasound imaging with decomposition descent learning-based full waveform inversion. IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control 69(12), 3297–3307 (2022) https://doi.org/10.1109/TUFFC.2022.3217512

[37] Cohen, N., Kvich, Y., Guo, R., Eldar, Y.C.: Deep unfolding of full waveform inversion for quantitative ultrasound imaging. In: 2025 IEEE International Conference on Acoustics, Speech, and Signal Processing (ICASSP), pp. 1–5. IEEE, Piscataway, NJ (2025). https://doi.org/10.1109/ICASSP49660.2025.10889143

[38] Yan, W., Zhang, Q., Wu, Y., Liu, Z., Zhang, H., Wang, Z., Yuan, J., Ding, M., Yuchi, M., Qiu, W.: Untrained neural network-based full-waveform inversion for breast sound speed imaging in ultrasound computed tomography. IEEE Transactions on Instrumentation and Measurement 74, 1–14 (2025) https://doi.org/10.1109/TIM.2025.3554289

[39] Wang, Z., Yan, W., Liu, Z., Yuchi, M., Qiu, W.: P2INR-FWI: An implicit neural representation method for speed of sound image reconstruction in ultrasound computed tomography. In: Medical Image Computing and Computer Assisted Intervention – MICCAI 2025. Lecture Notes in Computer Science, vol. 15961, pp. 420–430. Springer, Cham (2025). https://doi.org/10.1007/978-3-032-04937-7_40

[40] Cui, S., Lian, Y., Tian, X., Huang, Y., Yu, J., Zhang, Y., Cai, X.: Full-wave inversion for speed-of-sound imaging in ultrasound tomography via self-supervised learning. In: 2025 IEEE International Ultrasonics Symposium (IUS), pp. 1–4. IEEE, Piscataway, NJ (2025). https://doi.org/10.1109/IUS62464.2025.11201294

[41] Wang, Z., Xiao, J., Li, D., Li, B., Zhang, J., Ta, D.: Full waveform inversion guided wave tomography with a recurrent neural network. Ultrasonics 133, 107043 (2023) https://doi.org/10.1016/j.ultras.2023.107043

[42] Fu, H., Yang, L., Miao, X.: An efficient plug-and-play regularization method for full waveform inversion. Journal of Geophysics and Engineering 20(6), 1140–1149 (2023) https://doi.org/10.1093/jge/gxad073

[43] Zhang, B., Wang, L.: Progressive plug and play full waveform inversion with multitask learning. Scientific Reports 15, 19805 (2025) https://doi.org/10.1038/s41598-025-04506-2

[44] Wang, F., Huang, X., Alkhalifah, T.A.: A prior regularized full waveform inversion using generative diffusion models. IEEE Transactions on Geoscience and Remote Sensing 61, 1–11 (2023) https://doi.org/10.1109/TGRS.2023.3337014

[45] Shan, S., Zhu, M., Lin, Y., Lu, L.: Regularization by denoising diffusion models for solving inverse PDE problems with application to full waveform inversion. Communications Physics 9, 242 (2026) https://doi.org/10.1038/s42005-026-02677-6

[46] Shen, Y., Chen, Y., Engquist, B.: Diffusion-guided optimization for full waveform inversion. arXiv preprint arXiv:2607.21987 (2026)

[47] Zheng, H., Chu, W., Zhang, B., Wu, Z., Wang, A., Feng, B.T., Zou, C., Sun, Y., Kovachki, N., Ross, Z.E., Bouman, K.L., Yue, Y.: InverseBench: Benchmarking plug-and-play diffusion priors for inverse problems in physical sciences. In: International Conference on Learning Representations (2025). https://arxiv.org/abs/2503.11043

[48] Borcea, L., Mamonov, A., Ren, K., Yang, H., Yi, C.: ROMNet: a hybrid reduced order modeling and machine learning approach to waveform inversion. arXiv preprint arXiv:2608.25160 (2026)

[49] Ding, W., Ren, K., Zhang, L.: Coupling deep learning with full waveform inversion. arXiv preprint arXiv:2203.01799 (2022)

[50] Lin, Y., Feng, S., Theiler, J., Chen, Y., Villa, U., Rao, J., Greenhall, J., Pantea, C., Anastasio, M.A., Wohlberg, B.: Survey of deep learning and physics-based approaches in computational wave imaging. Proceedings of the IEEE (2026) https://doi.org/10.1109/JPROC.2026.3684003

[51] Pratt, R.G.: Seismic waveform inversion in the frequency domain; part 1, theory and verification in a physical scale model. Geophysics 64(3), 888–901 (1999)

[52] Plessix, R.-E.: A review of the adjoint-state method for computing the gradient of a functional with geophysical applications. Geophysical Journal International 167(2), 495–503 (2006)

[53] Bates, O., Guasch, L., Strong, G., Caradoc Robins, T., Calderon-Agudo, O., Cueto, C., Cudeiro, J., Tang, M.: A probabilistic approach to tomography and adjoint state methods, with an application to full waveform inversion in medical ultrasound. Inverse Problems 38(4), 045008 (2022)

[54] Modrak, R., Tromp, J.: Seismic waveform inversion best practices: regional, global and exploration test cases. Geophysical Journal International 206(3), 1864–1889 (2016)

[55] Esser, E., Guasch, L., Leeuwen, T., Aravkin, A.Y., Herrmann, F.J.: Total variation regularization strategies in full-waveform inversion. SIAM Journal on Imaging Sciences 11(1), 376–406 (2018)

[56] Lunz, S., Öktem, O., Schönlieb, C.-B.: Adversarial regularizers in inverse problems. Advances in Neural Information Processing Systems 31 (2018)

[57] Kingma, D.P., Ba, J.: Adam: A method for stochastic optimization. In: International Conference on Learning Representations (2015). https://arxiv.org/abs/1412.6980

[58] Li, F., Villa, U., Park, S., Anastasio, M.A.: 3-D stochastic numerical breast phantoms for enabling virtual imaging trials of ultrasound computed tomography. IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control 69(1), 135–146 (2021)

**本页范围与校对状态：** 本页覆盖原文全部可读内容——摘要、关键词、第 1–5 节正文与全部小节（§2.1–2.2、§3.1–3.2、§4.1–4.4）、算法 1–2（逐行编号）、注 1–4（Remark 1–4）、式 (1)–(18)（保留原编号）、表 1–3 与表 C1（逐格转写）、图 1–4 与图 B1 的图注、致谢/声明/代码可用性、附录 A–C、参考文献 [1]–[58]（英文原条目）。原文无定理或命题，只有 4 条 Remark，均已完整翻译。

核对与已知情况：① 已把 PDF 第 4、7、9、11、13、14、17、20、21 页渲染为图像，逐项核对式 (1)–(2)、式 (10)–(12)、算法 1、算法 2、式 (16)、表 1、表 3、表 C1、图 B1 与附录 A–C；式 (13)–(15)、(17)–(18)、表 2 与图 2–4 以 pypdf 文本层为准并与上述渲染页交叉比对，未见缺行。② 原文的页脚注释有 2 条（式 (1) 中源项的位置说明、主要实验使用无噪数据的说明），本页以 Markdown 脚注（脚注 1、脚注 2）原样保留在相应位置。③ 图 1–4 与图 B1 为位图，本页按原文图注翻译，并另加一行“图面说明（据原文插图）”记录从渲染页核对的列名、相对 \(L^{2}\) 数值与色标范围；未复制图像本身。④ 参考文献在 PDF 文本层中存在换行断词与重音符号分离（如 Pérez-Liva、Udías、Calderón Agudo、Öktem、Schönlieb），本页已复原为重音形式，条目内容未改动。⑤ 表 1–3 与表 C1 在 PDF 中表头为两行排版（“Median relative \(L^{2}\) error (%)”与“Median contrast error”），本页合并为一行四列表格，数值逐格照抄。⑥ 原文正文中“Section B”“Table C1”“Figure B1”等交叉引用编号保持原样。⑦ 附录 C 的首句在 PDF 中跨 p20–p21 两页、被表 C1 隔开，本页把该句拆为表前一句与表后一句，未改动其含义。**未做逐句逐式终校**（译稿为一次通译，术语统一为：FWI＝全波形反演、PnP＝即插即用、flow matching＝流匹配、inclusion＝包含体、lesion＝病灶、phantom＝体模、contrast error＝对比度误差、data update＝数据更新）。

**登记（2026-11-01）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
