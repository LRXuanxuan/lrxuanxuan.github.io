---
layout: page
title: "高维学习中的非渐近不确定性量化｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-05-non-asymptotic-uncertainty-quantification-in-high-dimensional-learning/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/53d36ad02cf82b3d/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

> **许可与用途声明：** 本页依据本地会议论文集 PDF（NeurIPS 2024 出版版本）作中文全文翻译，**再传播许可待核验**；本页仅作个人学习用途，**不计入“可公开全文”统计**。原文版权归作者/出版方所有，引用请以 NeurIPS 2024 正式版本为准。

# 高维学习中的非渐近不确定性量化

**原题：** Non-Asymptotic Uncertainty Quantification in High-Dimensional Learning  
**作者：** Frederik Hoppe\*（RWTH Aachen University）、Claudio Mayrink Verdun\*（Harvard University）、Hannah Laus\*（TU Munich & MCML）、Felix Krahmer（TU Munich & MCML）、Holger Rauhut（LMU Munich & MCML）。\* 表示同等贡献；通讯作者 hoppe@mathc.rwth-aachen.de。  
**版本：** 会议论文集版本（NeurIPS-2024-non-asymptotic-uncertainty-quantification-in-high-dimensional-learning-Paper-Conference），本地 PDF 共 32 页（正文 10 页 + 致谢/参考文献 + 补充材料 A–E + NeurIPS 论文清单）；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、正文第 1–6 节（含 5.1–5.2）、致谢、参考书目 89 条英文原条目，补充材料 A（主结果进一步讨论）、B（定理 2 与定理 3 的证明）、C（重尾版本定理 4）、D（更多数值评估，含表 1–3）、E（余项分布可视化）、NeurIPS 论文清单，全部图注（图 1–9）、算法 1–2 与公式 (1)–(9)；逐句逐式终校未做。

## 摘要

不确定性量化（UQ）是许多高维学习问题中提高预测置信度的关键而困难的课题。我们提出一种新的数据驱动 UQ 方法，用于回归问题，既适用于 LASSO 等经典优化方法，也适用于神经网络。最著名的 UQ 技术之一是去偏 LASSO：它通过把估计误差分解为高斯分量与渐近消失的偏差分量，使构造渐近置信区间成为可能。然而在有限维数据的实际问题中，偏差项往往大到不可忽略，导致置信区间过窄。本文严格处理该问题：对一大类预测器推导出一种数据驱动修正，通过从训练数据中估计偏差项的均值与方差（利用高维系综现象）来校正置信区间。由此得到**非渐近置信区间**，可避免在 MRI 诊断等关键应用中高估确定性。重要的是，我们的分析超越稀疏回归，扩展到神经网络等数据驱动预测器，从而提升模型驱动深度学习的可靠性。本文的发现弥合了既有理论与这类方法实际适用性之间的差距。

## 1 引言

过去几年，高维统计模型、逆问题及求解这些问题的学习方法取得了显著进展：新方法与新算法不断涌现，彻底改变了我们从复杂高维数据中提取洞见的能力 [1–3]；这些领域技术的理论基础也取得巨大成功。然而，为这些估计及其潜在参数建立严格的不确定性量化方法（例如为给定解构造置信区间）却相对滞后，相关理论大多仍难以企及。

例如在高维统计中，即便对 LASSO [4–6] 这类经典正则化估计器，也已证明无法用简单方式给出其估计量概率分布的闭式刻画（如 [7, Theorem 5.1]）。这反过来意味着，要建立可量化估计参数不确定性的严格置信区间极具挑战。为克服这一点，一系列工作 [8–10] 提出并分析了**去偏 LASSO**（desparsified LASSO），用以修正 LASSO 中 ℓ1 惩罚引入的偏差；关于 ℓ1 正则项所致偏差的讨论见 [9, Corollary 11] 与 [11]。上述工作导出的去偏估计器为 LASSO 构造尖锐置信区间建立了有原则的框架，开创了在预测变量数远多于观测数的高维回归问题中带 UQ 保证的统计推断途径。近期该估计器还被扩展到 ℓ1 最小化之外的多个方向，包括深度展开算法 [12, 13]，并应用于磁共振成像等众多领域——既用于经典高维回归技术，也用于近期学习方法 [12, 14]；详见下文第 2 节的“相关工作”段落。

去偏 LASSO 的思想是：其估计误差（去偏估计器与真值之差）可分解为**高斯分量**与**余项/偏差分量**。已有工作表明，在某些情形下余项分量的 ℓ∞ 范数以高概率消失（在渐近设定下，即底层模型维数按特定速率增长时），详见 [10, 15]。此时估计器被证明近似高斯，从而可导出置信区间。然而实践中需要处于非常高维、数据足够多的区间，这些假设才真正成立。在许多观测集有限的场景中，余项并不消失，甚至可能相当大；仅基于高斯分量构造的置信区间无法覆盖全部估计误差，因而所得区间过窄，导致高估确定性。在需要对向量系数幅值做高置信度估计的应用（如医学成像）中，该问题尤为严重。

此外，按去偏估计器的标准理论，对余项有多小的估计取决于能否很好地量化相应有偏估计器的 ℓ2 与 ℓ1 界（如 LASSO [10, 15]）。尽管这类经典回归估计器存在尖锐的 oracle 不等式（见相关工作），对展开算法却并非如此——后者的泛化界通常并不尖锐、甚至不存在。

本文针对高维学习中参数去偏估计器周围的**有效置信区间构造**这一难题。关键困难在于估计误差分解中的余项（见式 (3)），它妨碍了有限样本置信区间的建立。我们提出一种新的非渐近理论，显式刻画余项，从而能在有限样本区间构造可靠置信区间。进一步，我们把框架扩展到模型驱动神经网络的输出不确定性量化——这类网络用于求解逆问题，从而为现代深度学习技术的数据驱动 UQ 严格理论铺路。下面给出主要结果的非正式版本，详见第 3 节。

**定理 1（非正式版本）.** 设 $\mathbf x^{(1)},\dots,\mathbf x^{(l)}\in\mathbb C^N$ 为独立同分布数据。令 $\mathbf b^{(i)}=\mathbf A\mathbf x^{(i)}+\boldsymbol\varepsilon^{(i)}$ 为高维回归模型，噪声 $\boldsymbol\varepsilon^{(i)}\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{N\times N})$。利用这些数据，对显著性水平 $\alpha$ 可为新样本分量 $x^{(l+1)}_j$ 导出置信半径 $r_j(\alpha)$。令 $(\hat{\mathbf x}^u)^{(l+1)}_j$ 为基于（学习得到的）高维回归估计器 $\hat{\mathbf x}^{(i)}_j$ 的去偏估计。则

$$
\mathbb P\left(\left|(\hat{\mathbf x}^u)^{(l+1)}_j-x^{(l+1)}_j\right|\le r_j(\alpha)\right)\ge1-\alpha.
$$

定理 1 的意义远超经典正则化高维回归设定。例如，它能为展开网络（unrolled networks）[16] 等学习算法建立严格置信区间。据我们所知，在不依赖不可扩展的 Monte Carlo 方法的前提下为神经网络获得严格 UQ 结果仍是一个难题 [17]。为量化不确定性，我们的方法把模型驱动先验知识与数据驱动统计技术相结合：模型驱动部分利用噪声的高斯性来量化噪声数据本身带来的不确定性（对噪声的高斯假设并非限制，经中心极限定理型论证可扩展到非高斯分布，见 [10]；此处为清晰起见采用高斯噪声假设）；与之互补，数据驱动部分对量化估计器性能固有的不确定性至关重要。此外，我们的方法不要求关于估计器收敛性或质量性质的任何假设，这种灵活性使去偏方法可适用于广泛的估计器。

**贡献。** 本工作的主要贡献有三：¹

1. 我们通过发展非渐近理论来构造去偏 LASSO 估计器周围的置信区间，解决了图 1 所示的问题。与依赖渐近论证并忽略余项的既有方法不同，我们的有限样本分析显式计入余项，从而澄清了一个重要理论缺口，并在不依赖渐近机制的前提下给出严格保证。
2. 我们建立一个把去偏技术扩展到面向高维回归的模型驱动深度学习的一般框架。该结果使神经网络学到的估计器能够被有原则地度量不确定性——这对安全关键应用中的可靠决策至关重要。我们用 It-Net [18] 等最先进展开网络验证了该方法。
3. 对真实医学成像任务，我们证明去偏 LASSO 估计误差中的余项可被准确建模为高斯分布。基于该发现，我们导出提供比以往方法更尖锐不确定性估计的高斯修正置信区间，增强了去偏估计器在高风险医疗领域的实用性。

¹ 代码见 GitHub：https://github.com/frederikhoppe/UQ_high_dim_learning

**图 1：** 置信区间修正示意。图 1a、1b、1c 分别用标准去偏技术（无数据修正）与我们提出的方法（图 1b 为高斯修正——定理 3；图 1c 为数据修正——定理 2）构造置信区间，红点表示未被置信区间覆盖的分量。图 1d 给出全部分量上覆盖率的箱线图，图 1e 给出支撑集（非零像素）上的覆盖率箱线图；后两图中左侧箱体为渐近置信区间，右侧为基于 500 个特征向量的高斯修正非渐近置信区间。我们通过 LASSO 求解稀疏回归问题 $\mathbf y=\mathbf A\mathbf x+\boldsymbol\varepsilon$，其中 $\mathbf A\in\mathbb C^{4000\times10000}$、$\mathbf x\in\mathbb C^N$ 为 200-稀疏、噪声水平约 10%。在 250 个向量上、显著性水平 $\alpha=0.05$ 下，渐近置信区间的平均覆盖率为 $h^W(0.05)=0.9353$，支撑集上 $h^W_S(0.05)=0.8941$；所提方法的高斯修正给出 $h^G(0.05)=0.9684$、支撑集上 $h^G_S(0.05)=0.9421$，数据驱动修正则给出 $h(0.05)=h_S(0.05)=1$。细节见第 5.1 节与附录 D。

## 2 背景与问题表述

在许多实际应用中，我们遇到特征数远多于观测数的高维回归问题。该情形称为高维回归：我们希望从仅 $m$ 个目标测量 $\mathbf b\in\mathbb C^m$（$m\ll N$）中估计 $N$ 个特征 $\mathbf x_0\in\mathbb C^N$。数学上可表为线性模型 $\mathbf b=\mathbf A\mathbf x_0+\boldsymbol\varepsilon$，其中 $\mathbf A\in\mathbb C^{m\times N}$ 为测量矩阵，$\boldsymbol\varepsilon\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{N\times N})$ 为方差 $\sigma^2$ 的加性高斯噪声。在稀疏情形下（特征向量 $\mathbf x_0$ 仅有 $s$ 个非零元，$s\ll N$），一种流行方法是求解 LASSO，即求如下 ℓ1 正则化优化问题的估计器 $\hat{\mathbf x}$：

$$
\min_{\mathbf x\in\mathbb C^N}\ \frac{1}{2m}\left\|\mathbf A\mathbf x-\mathbf b\right\|_2^2+\lambda\left\|\mathbf x\right\|_1. \tag{1}
$$

然而已知 LASSO 估计器存在系统性偏差，其分布难以处理，给不确定性量化带来挑战 [7]。为此，近年发展了去偏技术 [8–10]。去偏 LASSO 估计器 $\hat{\mathbf x}^u$ 定义为

$$
\hat{\mathbf x}^u=\hat{\mathbf x}+\frac1m\mathbf M\mathbf A^*\left(\mathbf A\hat{\mathbf x}-\mathbf b\right), \tag{2}
$$

其中 $\mathbf M$ 为修正矩阵，可选取使 $\max_{i,j\in\{1,\dots,N\}}|(\mathbf M\hat{\boldsymbol\Sigma}-\mathbf I_{N\times N})_{ij}|$ 很小；这里 $\hat{\boldsymbol\Sigma}=\frac{\mathbf A^*\mathbf A}{m}$。$\mathbf M$ 的具体选法见 [15]。

值得注意的是，估计误差

$$
\hat{\mathbf x}^u-\mathbf x_0=\underbrace{\mathbf M\mathbf A^*\boldsymbol\varepsilon/m}_{=:\mathbf W}
+\underbrace{\left(\mathbf M\hat{\boldsymbol\Sigma}-\mathbf I_{N\times N}\right)\left(\mathbf x_0-\hat{\mathbf x}\right)}_{=:\mathbf R}, \tag{3}
$$

可分解为高斯分量 $\mathbf W\sim\mathcal{CN}(\mathbf 0,\frac{\sigma^2}{m}\hat{\boldsymbol\Sigma})$ 与余项 $\mathbf R$；在后者的意义上，若测量矩阵 $\mathbf A$ 为高斯矩阵，$\mathbf R$ 以高概率渐近消失 [15, Theorem 3.8]。该结果还被扩展到与有界正交系统（如有欠采样 Fourier 矩阵）相关的矩阵，使去偏 LASSO 可用于 MRI [19]。分解 (3) 及 $\mathbf R$ 的渐近行为使为去偏 LASSO 估计构造渐近有效的置信区间成为可能，从而为高维稀疏回归提供有原则的 UQ。

然而在有限数据的实际场景中，余项可能很大，使渐近置信区间不精确甚至误导（图 1 所示）。该问题在医学成像等高风险领域尤为突出——那里可靠的 UQ 对准确诊断与治疗规划至关重要。其次，去偏技术迄今仅限于误差可被良好量化的估计器，对深度学习架构下其行为如何仍是开放问题；在这些情形中余项行为基本未知，无法直接套用既有去偏方法，也阻碍了这些方法在风险敏感应用中的部署。

用展开算法求解 (1) 中 LASSO 的一个著名例子是 ISTA [20, 21]：

$$
\mathbf x^{k+1}=\mathcal S_\lambda\left(\left(\mathbf I_{N\times N}-\frac1\mu\mathbf A^T\mathbf A\right)\mathbf x^k+\frac1\mu\mathbf A^T\mathbf b\right),\qquad k\ge0,
$$

其中 $\mu>0$ 为步长参数，$\mathcal S_\lambda(\mathbf x)$ 为软阈值算子。工作 [22] 把每次 ISTA 迭代解释为循环神经网络（RNN）的一层。学习型 ISTA（LISTA）学习参数 $\mathbf W^k_1,\mathbf W^k_2,\lambda^k$ 以替代固定 ISTA 更新：

$$
\mathbf x^{k+1}=\mathcal S_{\lambda^k}\left(\mathbf W^k_2\mathbf x^k+\mathbf W^k_1\mathbf b\right).
$$

在该表述中，LISTA 把 $K$ 次迭代展开为 $K$ 层，每层有可学习参数 $(\mathbf W^k,\lambda^k)$；参数通过最小化训练数据 $(x^{(i)},b^{(i)})$ 上的重建误差 $\min_{\lambda,W}\frac1l\sum_{i=1}^l\|\mathbf x^k_i(\lambda,\mathbf W,\mathbf b^{(i)},\mathbf x^{(i)})-\mathbf x^{(i)}\|_2^2$ 学习。LISTA 等展开网络已显示出作为逆问题模型驱动深度学习方案的前景，利用领域知识提升性能；这类迭代式端到端网络方案为逆问题给出最先进重建结果 [18]。近期工作 [12] 提出基于去偏步骤的框架，专门为展开 LISTA 估计器导出置信区间；但与前述去偏 LASSO 文献类似，它只处理渐近设定。本文主要目标之一正是克服当前理论的这一局限。

**相关工作.**

**高维回归。** 高维回归与稀疏恢复如今已是成熟理论，见 [1, 3, 23] 及其参考文献。该背景下已提出多种 LASSO 扩展，如弹性网（elastic net）[24]、组 LASSO [25]、核范数惩罚 LASSO [26]、以及自适应 ℓ1 范数以控制错误发现率的 SLOPE [27]。除凸惩罚外，也探索了凹惩罚以解决 LASSO 的部分局限，如 SCAD 惩罚 [28] 与极小极大凹惩罚（MCP）[29]；还研究了 ℓp 范数（$p<1$）最小化的非凸 LASSO 变体 [30, 31] 与噪声盲变体如平方根 LASSO [32, 33]。求解 LASSO 及其变体的可扩展快速算法包括半光滑 Newton 法 [34] 与 IRLS [35]。

**LASSO 理论。** 由于该估计器无处不在且研究充分，难以列举全部相关文献。已有工作为 LASSO 建立了多种 oracle 不等式 [36–40]。另一关键理论结果是 LASSO 在变量选择意义下的一致性：[41] 与 [42] 建立 LASSO 一致性，[43] 分析设计矩阵满足限制等距性质时 LASSO 的稀疏行为。

**去偏估计器。** 在去偏 LASSO 的首批论文 [8–10] 之后，一些工作关注改进其有限样本性能与计算效率 [15, 44]。已证明为去偏 LASSO 导出的置信区间在极小极大意义下是尖锐的 [45]。去偏估计器已扩展到多个方向，如 [19, 44, 46, 47]；近期 [48] 为 ℓ1 范数之外的凸正则项的去偏估计器建立了渐近正态性结果。在 MR 图像方面，[49] 探索了带全变差正则项的逆问题去偏估计器。去偏估计器近期也被扩展到展开估计器——见下一段讨论——即 [12, 13]。

**算法展开与逆问题的模型驱动深度学习。** 把经典算法迭代步展开为深度神经网络架构的想法可追溯到 [22]，其提出学习型 ISTA（LISTA）以快速近似稀疏编码问题的解。若干工作扩展并改进了原始 LISTA 框架 [50–55]。[56] 提出学习型原始–对偶（Learned Primal-Dual）算法，展开原始–对偶混合梯度法用于断层重建；[57] 提出深度级联卷积网络（DC-CNN）用于动态 MRI 重建；[58] 展开近端梯度下降求解器以学习 1D TV 正则问题的参数；[16] 引入算法展开的一般框架；[59] 提出 MoDL，一种展开 ADMM 算法的 MRI 重建模型驱动深度学习方法；[60] 提出近端交替方向网络（PADNet）以展开非凸优化。关于展开及其与物理启发方法联系的更多信息见综述 [61, 62]。[18, 63] 提出 It-Net——把近端算子替换为 U-Net 的展开近端梯度下降方案；该方案赢得 AAPM Challenge 2021 [64]，该挑战旨在鉴定数据驱动技术求解 CT 逆问题的最先进水平。上述范式的一种推广是“学习优化”（learning to optimize）框架，即通过在样本问题上学习其表现来开发优化方法 [65, 66]。

**不确定性量化。** 已有少数工作尝试为成像处理所用展开网络在像素级量化不确定性，如 [67]；但这些方法基于贝叶斯网络与 MC dropout [68]，需要大量推断时间，且由于 dropout 对 UQ 而言是强正则项而损失重建性能。与先前工作不同，我们的贡献聚焦一种可扩展、易于实现于数据重建流程中的数据驱动方法。

近几年另一流行方法是共形预测（conformal prediction）[69, 70]，它针对给定水平 $\alpha$ 构造预测带 $\hat C_m:\mathcal X\to\{\mathcal B\text{ 的子集}\}$，使得对新独立同分布对 $(a_i,b_i)$ 有 $\mathbb P(b_{m+1}\in\hat C_n(a_{m+1}))\ge1-\alpha$，其中 $(a_i,b_i)\sim P$（$i=1,\dots,m$）为分布 $P$ 在 $\mathcal A\times\mathcal B$ 上的独立同分布特征–响应对，概率取于全部可用数据 $(a_i,b_i)$，$i=1,\dots,m+1$。该方法假定模型 $b_i=\langle a_i,x\rangle+\epsilon$ 中的回归系数 $x$ 固定。与此不同，去偏 LASSO 为单个像素 $x^{(l+1)}_j$（$j=1,\dots,N$）产生置信区间——当给定额定测量向量 $a_1,\dots,a_m$ 时有一组新数据点 $b^{(l+1)}_1,\dots,b^{(l+1)}_m$。近期一些论文为成像任务发展了基于共形预测的不确定性掩码 [71, 72]。与前者不同，我们的方法为给定新测试图像提供计算代价低廉的置信区间；与后者不同（它为每幅新图像的每个像素构造期望意义下成立的区间值函数，见 [72] 式 (2)），我们的方法对每幅新测试图像给出逐像素覆盖保证。

## 3 数据驱动置信区间

本节引入校正置信区间的数据驱动方法。我们不再由分解 $\hat{\mathbf x}^u-\mathbf x_0=\mathbf W+\mathbf R$ 在假定 $\mathbf R$ 渐近消失的前提下导出渐近置信区间，而是利用数据 $\{(\mathbf b^{(i)},\mathbf x^{(i)})\}_{i=1}^l$ 与集中不等式技术来估计偏差分量 $\mathbf R$ 的大小。我们继续利用高斯分量 $\mathbf W$ 的先验知识，同时把置信区间的适用性扩展到包括神经网络在内的广泛估计器类。方法总结在算法 1（用数据估计置信区间半径）与算法 2（构造置信区间所围绕的估计器）中。下面给出证明本方法有效性的主要结果。

**定理 2.** 设 $\mathbf x^{(1)},\dots,\mathbf x^{(l)}\in\mathbb C^N$ 为来自未知分布 $Q$ 的独立同分布复随机变量（代表真值数据）。假定 $\boldsymbol\varepsilon^{(i)}\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{m\times m})$ 为高维模型 $\mathbf b^{(i)}=\mathbf A\mathbf x^{(i)}+\boldsymbol\varepsilon^{(i)}$ 中的噪声，其中 $\mathbf A\in\mathbb C^{m\times N}$，且与 $\mathbf x^{(i)}$ 独立。令 $\hat{\mathbf X}:\mathbb C^m\to\mathbb C^N$ 为（学习得到的）估计函数，把数据 $\mathbf b^{(i)}$ 映射为对 $\mathbf x^{(i)}$ 的估计 $\hat{\mathbf x}^{(i)}$。对固定 $\mathbf A$ 与 $\mathbf M$，置 $|R^{(i)}_j|=|\mathbf e_j^T(\mathbf M\hat{\boldsymbol\Sigma}-\mathbf I_{N\times N})(\hat{\mathbf x}^{(i)}-\mathbf x^{(i)})|$。对 $j=1,\dots,N$，记真实但未知的均值为 $\mu_j=\mathbb E[|R^{(1)}_j|]$、未知方差为 $(\sigma^2_R)_j:=\mathbb E[(|R^{(1)}_j|-\mu_j)^2]$。令 $\hat S_j=\frac1l\sum_{i=1}^l|R^{(i)}_j|$ 为无偏样本均值估计，$(\hat\sigma^2_R)_j=\frac{1}{l-1}\sum_{i=1}^l(|R^{(i)}_j|-\hat S_j)^2$ 为无偏方差估计。取 $\alpha\in(0,1)$、$\gamma_j\in(0,1-\frac{1}{l\alpha})$。进一步，在模型 $\mathbf b^{(l+1)}=\mathbf A\mathbf x^{(l+1)}+\boldsymbol\varepsilon^{(l+1)}$ 中，对样本 $\mathbf x^{(l+1)}\sim Q$ 置置信域为 $C_j(\alpha)=\{z\in\mathbb C:|(\hat{\mathbf x}^u)^{(l+1)}_j-z|\le r_j(\alpha)\}$，其半径为

$$
r_j(\alpha)=\frac{\sigma\left(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*\right)^{1/2}_{jj}}{\sqrt m}
\sqrt{\log\left(\frac{1}{\gamma_j\alpha}\right)}
+c_l(\alpha)\cdot(\hat\sigma_R)_j+\hat S_j,
\qquad
c_l(\alpha):=\sqrt{\frac{l^2-1}{l^2(1-\gamma_j)\alpha}-l}. \tag{4}
$$

则

$$
\mathbb P\left(x^{(l+1)}_j\in C_j(\alpha)\right)\ge1-\alpha. \tag{5}
$$

定理 2 给出获得保守置信区间的一种途径，其有效性已获证明，即以 $1-\alpha$ 的概率包含真实参数。其主要优点是不对分布 $Q$ 作任何假设（只要求 $\sigma^2_R$ 存在），因而广泛适用。因此定理 2 也涵盖最坏情形分布，表明即使在如此不良设定的情形也能量化不确定性；在医学成像中，这类确定性保证对准确诊断至关重要。证明利用了分量 $\mathbf W$ 的高斯性以及经验版 Chebyshev 不等式——在关于底层分布无信息时该不等式是紧的。详细证明见附录 B；关于定理 2 的深入讨论（包括实际简化与 $\gamma_j$ 对置信区间长度的依赖）见附录 A。

更高的确定性以更宽的置信区间为代价。若关于 $\mathbf R$ 的分布有额外信息（例如可被高斯分布近似），置信区间会变得更紧。该情形（包括 MRI 等相关设定）在第 4 节讨论。

**算法 1：置信半径的估计**

1: **输入：** 估计函数 $\hat{\mathbf X}$、字典矩阵 $\mathbf A$、修正矩阵 $\mathbf M$、数据点 $\{(\mathbf b^{(i)},\mathbf x^{(i)})\}_{i=1}^l$、显著性水平 $\alpha$
2: **for** $i=1,\dots,l$ **do**
3: 　按 $\hat{\mathbf x}^{(i)}=\hat{\mathbf X}(\mathbf b^{(i)})$ 与 $R^{(i)}_j=\mathbf e_j^T(\mathbf M\hat{\boldsymbol\Sigma}-\mathbf I_{N\times N})(\hat{\mathbf x}^{(i)}-\mathbf x^{(i)})$ 计算 $\hat{\mathbf x}^{(i)},\mathbf R^{(i)}\in\mathbb C^N$
4: **end for**
5: **for** $j=1,\dots,N$ **do**
6: 　估计 $\hat S_j=\frac1l\sum_{i=1}^l|R^{(i)}_j|$ 与 $(\hat\sigma^2_R)_j=\frac{1}{l-1}\sum_{i=1}^l(|R^{(i)}_j|-\hat S_j)^2$
7: 　求解 $r_j(\alpha)=\min_{\gamma\in(0,1-\frac{1}{l\alpha})}\ \frac{\sigma(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)^{1/2}_{jj}}{\sqrt m}\sqrt{\log\left(\frac{1}{\gamma\alpha}\right)}+c_l((1-\gamma)\alpha)\cdot(\hat\sigma_R)_j+\hat S_j$
8: **end for**
9: **输出：** 置信域半径 $\{r_j(\alpha)\}_{j=1}^N$

**算法 2：置信域的构造**

1: **输入：** 估计函数 $\hat{\mathbf X}$、字典矩阵 $\mathbf A$、修正矩阵 $\mathbf M$、测量 $\mathbf b$、半径 $\{r_j(\alpha)\}_{j=1}^N$（来自算法 1 或定理 3）
2: 计算估计器 $\hat{\mathbf x}=\hat{\mathbf X}(\mathbf b)$
3: 经 $\hat{\mathbf x}^u=\hat{\mathbf x}+\frac1m\mathbf M\mathbf A^*(\mathbf b-\mathbf A\hat{\mathbf x})$ 构造去偏估计器
4: **for** $j=1,\dots,N$ **do**
5: 　构造置信域 $C_j(\alpha)=\{z\in\mathbb C:|\hat{\mathbf x}^u_j-z|\le r_j(\alpha)\}$
6: **end for**
7: **输出：** 去偏估计器 $\hat{\mathbf x}^u$ 与置信域 $\{C_j(\alpha)\}_{j=1}^N$

## 4 高斯余项的置信区间

当余项分布已知且易于刻画时，能最直接地导出有效（即覆盖概率正确）的置信区间。此时更具信息量的分布假设可比定理 2（对余项不作假设）给出可能更紧的置信区间。本节假定余项可被高斯分布近似，导出非渐近置信区间。

**定理 3.** 设 $\hat{\mathbf x}^u\in\mathbb C^N$ 为 $\mathbf x\in\mathbb C^N$ 的去偏估计器，余项 $\mathbf R\sim\mathcal{CN}(\mathbf 0,\boldsymbol\Sigma_R/m)$。则 $C_j(\alpha)=\{z\in\mathbb C:|z-\hat{\mathbf x}^u_j|\le r_j(\alpha)\}$，其半径

$$
r^G_j(\alpha)=\frac{\left(\sigma^2(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)_{jj}+(\boldsymbol\Sigma_R)_{jj}\right)^{1/2}}{\sqrt m}\sqrt{\log\left(\frac{1}{\alpha}\right)} \tag{6}
$$

有效，即 $\mathbb P(x_j\in C_j(\alpha))\ge1-\alpha$。

证明见附录 B。我们指出该定理可推广到高斯情形之外：附录 C 给出重尾分布下该定理的证明；附录 E 通过实验表明，在许多相关实际设定中余项的高斯假设成立，从而使该假设下导出的置信区间可用。这些置信区间在非渐近可靠性（保证有限样本区间仍有效覆盖）与紧致性（提供有信息且精确的不确定性估计）之间取得审慎平衡。借助高斯近似——如图 7 所示，维数越高该近似越准确——本框架为高维预测问题的不确定性量化提供有原则且计算高效的方法。$\mathbf R$ 的方差可用给定数据估计，例如用定理 2 中的无偏方差估计器。

## 5 数值实验

我们通过两类设定下的大量数值实验评估非渐近置信区间的性能：(i) 经典去偏 LASSO 框架，用于把我们的非渐近置信区间与渐近置信区间对比；(ii) 学习框架，用学习得到的估计器（特别是 U-Net [73] 与 It-Net [18]）重建真实 MR 图像并量化不确定性。实验表明在实际非渐近区间中恰当计入余项的重要性。每个实验遵循相同结构：

1. **数据生成与管理：** 固定前向算子 $\mathbf A$，生成 $n>2$ 个特征向量 $\{\mathbf x^{(i)}\}_{i=1}^n$ 与噪声向量 $\{\boldsymbol\varepsilon^{(i)}\}_{i=1}^n$，$\boldsymbol\varepsilon^{(i)}\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{m\times m})$；由 $\mathbf b^{(i)}=\mathbf A\mathbf x^{(i)}+\boldsymbol\varepsilon^{(i)}$ 得到观测 $\{\mathbf b^{(i)}\}_{i=1}^n$。把数据 $\{(\mathbf b^{(i)},\mathbf x^{(i)})\}_{i=1}^n$ 划分为规模 $l$ 的估计集与规模 $k$ 的测试集（$l+k=n$）。若需学习估计器，则进一步划分为训练集、估计集与测试集。
2. **重建：** 视实验而定，以下列方式之一获得重建函数 $\hat{\mathbf X}$：经典 LASSO 设定用 LASSO；学习估计器实验则在训练数据上训练 U-Net [73] 或 It-Net [18] 作为重建函数 $\hat{\mathbf X}$。
3. **置信半径估计：** 以 $\mathbf A$、$\hat{\mathbf X}$、按 [15] 选取的 $\mathbf M$、估计数据 $\{(\mathbf b^{(i)},\mathbf x^{(i)})\}_{i=1}^l$ 及预定显著性水平 $\alpha\in(0,1)$ 运行算法 1，得到半径 $\{r_j(\alpha)\}_{j=1}^N$。由于对 $\gamma$ 做了优化，所用 $\gamma$ 即导致最小置信区间的最优值。要构造最终置信区间，半径需按去偏估计器居中：对每个新测量 $\mathbf b$，运行算法 2 得到与 $\mathbf b$ 对应特征向量 $\mathbf x$ 的定制置信区间。此外，我们基于定理 3 计算高斯修正的置信区间，用估计集以无偏方差估计器量化 $\mathbf R$ 的方差。
4. **评估：** 用测试数据 $\{(\mathbf b^{(i)},\mathbf x^{(i)})\}_{i=l+1}^n$ 评估修正效果。对每个 $\mathbf b^{(i)}$ 运行算法 2 得到 $\mathbf x^{(i)}$ 的置信区间 $\{C^{(i)}_j(\alpha)\}_{j=1}^N$。用 $h_j(\alpha)=\frac1k\sum_{i=l+1}^n\mathbf 1\{x^{(i)}_j\in C_j(\alpha)\}$ 估计 $\mathbb P(x^{(i)}_j\in C_j(\alpha))$，并对全部分量平均得 $h(\alpha)=\frac1N\sum_{j=1}^N h_j(\alpha)$。由于支撑集 $S$（非零像素）上的表现至关重要，定义支撑集上的击中率 $h^{(i)}_S=\frac{1}{|S|}\sum_{j=1}^N\mathbf 1\{x^{(i)}_j\in C_j(\alpha)\}$，并平均得 $h_S(\alpha)=\frac1k\sum_{i=l+1}^n h^{(i)}_S$（支撑集可能随 $i$ 变化）。对基于高斯修正半径的置信区间做同样计算。

### 5.1 稀疏模型驱动回归的 UQ

我们考虑与既有去偏 LASSO 文献（如 [9]）一致的设定，以说明本方法对现有 UQ 方法的扩展。前向算子为复高斯矩阵 $\mathbf A\in\mathbb C^{m\times N}$，$N=10000$、$m=0.6N$、$A_{ij}\sim\mathcal{CN}(0,1)$。生成 $n=750$ 个 $s=0.1N$-稀疏特征 $\mathbf x^{(i)}$：从 $1,\dots,N$ 随机选取 $m$ 个不同下标，幅值取自 $\mathcal{CN}(0,1)$。取相对噪声 $\frac{\|\boldsymbol\varepsilon^{(i)}\|}{\|\mathbf A\mathbf x^{(i)}\|}\approx0.2$，把数据划分为 $l=500$ 个估计数据与 $k=250$ 个测试数据。重建时求解 LASSO $\hat{\mathbf X}(\mathbf b):=\arg\min_{\mathbf x\in\mathbb C^N}\frac1m\|\mathbf A\mathbf x-\mathbf b\|+\lambda\|\mathbf x\|_1$，按 [19] 取 $\lambda=10\sigma\sqrt m(2+\sqrt{12\log(N)})$。显著性水平 $\alpha=0.05$，运行算法 1 得到置信半径，取 $\mathbf M=\mathbf I_{N\times N}$ [15] 并利用松弛 (9)。在 $l$ 个估计数据点上平均，ℓ2 与 ℓ∞ 范数比为 $\frac{\|\mathbf R\|_2}{\|\mathbf W\|_2}=0.9993$ 与 $\frac{\|\mathbf R\|_\infty}{\|\mathbf W\|_\infty}=1.1581$。既有文献通常在余项消失时测量 ℓ∞ 范数，因为它与逐像素置信区间相关；此处余项与高斯分量量级相当，故在置信区间推导中过于显著而不可忽略。

在其余 $k=250$ 个数据点上评估，数据驱动与高斯修正的平均击中率为 $h(0.05)=1$、$h_S(0.05)=1$ 与 $h^G(0.05)=0.9691$、$h^G_S(0.05)=0.8948$。忽略余项则给出 $h^W(0.05)=0.8692$ 与 $h^W_S(0.05)=0.6783$，显著更低且违反指定显著性水平 0.05。图 2 给出某数据点 $\mathbf x^{(i)}$ 上各类置信区间。对 $h_j(0.05)$、$h^{(i)}_S(0.05)$、$h^G_j(0.05)$ 与 $(h^G_S)^{(i)}(0.05)$ 的详细可视化见附录图 4c 与 4i。不同稀疏回归设定（包括欠采样 Fourier 矩阵）的进一步实验见附录 D。

### 5.2 用展开神经网络做 MRI 重建的 UQ

我们把去偏方法扩展到面向 MRI 重建的模型驱动深度学习：在 NYU fastMRI 数据集² [74, 75] 的单线圈膝关节图像上使用 U-Net 与 It-Net。前向算子为欠采样 Fourier 算子 $\mathbf P\mathbf F\in\mathbb C^{m\times N}$，$N=320\times320$、$m=0.6N$，$\mathbf F$ 为 Fourier 矩阵、$\mathbf P$ 为径向掩码（见图 5b）。噪声水平 $\sigma$ 取使相对噪声约为 0.1。数据划分为训练集（33370 个切片）、验证集（5346 个切片）、估计集（1372 个切片）与测试集（100 个切片）。

随后训练一个 8 层 It-Net [18]，损失为 MS-SSIM [76] 与 ℓ1 损失的组合，优化器为 Adam、学习率 $5\text{e-}5$、训练 15 个 epoch，得到重建函数 $\hat{\mathbf X}$。在显著性水平 $\alpha=0.1$ 下运行算法 1 构造置信半径，此时针对图像实部而非幅值，取 $\mathbf M=\mathbf I_{N\times N}$ [15] 并利用松弛 (9)。在 $l$ 个估计数据点上平均有 $\frac{\|\mathbf R\|_2}{\|\mathbf W\|_2}=0.38$ 与 $\frac{\|\mathbf R\|_\infty}{\|\mathbf W\|_\infty}=0.49$，表明余项显著、不可忽略。在测试数据上评估，数据驱动修正的平均击中率为 $h(0.1)=0.9998$、$h_S(0.1)=0.9995$，高斯修正的平均击中率为 $h^G(0.1)=0.9485$、$h^G_S(0.1)=0.9353$；此处支撑集指图像中最大的 10% 像素，因为背景在数值上无法清晰界定。忽略余项时渐近置信区间的击中率为 $h^W(0.1)=0.9306$ 与 $h^W_S(0.1)=0.9152$，与稀疏回归设定一样显著更低。图 3 给出一幅图像 $\mathbf x^{(i)}$ 某区域上数据驱动修正与渐近置信区间，并含基于高斯修正与渐近击中率的分布箱线图。MRI 重建 UQ 的更多实验见附录 D 与表 2、表 3。

² 本文实验数据取自 NYU fastMRI Initiative 数据库（fastmri.med.nyu.edu）[74, 75]。数据仅由 NYU fastMRI 研究者提供，他们未对本文提出任何想法、分析或写作贡献。NYU fastMRI 研究者名单见 fastmri.med.nyu.edu，可能更新。

**图 2：** 第 5.1 节稀疏回归设定中某评估特征向量上的渐近型（2a）、高斯修正（2b）与数据驱动修正（2c）置信区间。

**图 3：** 按 5.2 节所述用 It-Net 得到的重建。3b 为数据驱动修正 90% 置信区间，3c 为渐近 90% 置信区间，对应 $320\times320$ 膝关节图像 3a 中 50 像素的区域；3d 为 95% 置信水平下高斯修正与渐近置信区间击中率的箱线图。

## 6 结论（结语）

本文提出一种基于去偏估计器的数据驱动不确定性量化方法，导出非渐近置信区间。该方法通过纳入余项分量的估计来修正渐近置信区间，具有坚实的理论基础。修正可基于先验知识（例如余项的高斯分布），我们也给出了无需额外信息的数据驱动修正。这种数据驱动特性增强了其对广泛估计器（包括模型驱动深度学习技术）的适用性。实验确认了理论发现，表明即使在经典稀疏回归设定中余项也过于显著而不可忽略；把方法应用于 MRI 时，在图像支撑集上取得了显著更好的击中率。

**局限与未来方向。** 尽管本方法修正了余项，更大的余项需要更大修正，从而导致更宽的置信区间。目标是使区间窄到有信息、又宽到在给定样本量与数据变异性下符合实际。因此，获得小的余项以避免过宽的置信区间至关重要。此外，方法精度取决于余项均值与方差估计的质量，数据越多该估计越好；在数据更多时，区间长度可在更大参数集上最小化。未来方向包括研究给定数据量下所提置信区间与半径的尖锐性，以及研究估计更高阶矩时如何改进置信区间长度。我们相信本方法适用于多种深度学习架构，包括 MRI 中视觉 Transformer 等 [77]；在不同问题上用最先进架构检验该方法的通用性将展示其广泛用途。

## 致谢

我们感谢德国联邦教育与研究部在项目“SparseMRI3D+: Compressive Sensing und Quantifizierung von Unsicherheiten für die beschleunigte multiparametrische quantitative Magnetresonanztomografie（FZK 05M20WOA）”中提供的经费支持。

## 参考文献（英文原条目，按原文顺序）

[1] Martin J Wainwright. *High-dimensional statistics: A non-asymptotic viewpoint*, volume 48. Cambridge university press, 2019.
[2] Christophe Giraud. *Introduction to high-dimensional statistics*. Chapman and Hall/CRC, 2021.
[3] John Wright and Yi Ma. *High-dimensional data analysis with low-dimensional models: Principles, computation, and applications*. Cambridge University Press, 2022.
[4] Scott Chen and David L Donoho. Examples of basis pursuit. In *Wavelet Applications in Signal and Image Processing III*, volume 2569, pages 564–574. SPIE, 1995.
[5] Robert Tibshirani. Regression shrinkage and selection via the lasso. *Journal of the Royal Statistical Society Series B: Statistical Methodology*, 58(1):267–288, 1996.
[6] Trevor Hastie, Robert Tibshirani, Jerome H Friedman, and Jerome H Friedman. *The elements of statistical learning: data mining, inference, and prediction*, volume 2. Springer, 2009.
[7] Keith Knight and Wenjiang Fu. Asymptotics for Lasso-Type Estimators. *The Annals of Statistics*, 28(5):1356–1378, 2000.
[8] C.-H. Zhang and S. S. Zhang. Confidence intervals for low dimensional parameters in high dimensional linear models. *Journal of the Royal Statistical Society: Series B (Statistical Methodology)*, 76(1):217–242, 2014.
[9] A. Javanmard and A. Montanari. Confidence intervals and hypothesis testing for high-dimensional regression. *Journal of Machine Learning Research*, 15:2869–2909, 2014.
[10] S. van de Geer, P. Bühlmann, Y. Ritov, and R. Dezeure. On asymptotically optimal confidence regions and tests for high-dimensional models. *The Annals of Statistics*, 42(3), 2014.
[11] Cun Hui Zhang and Jian Huang. The sparsity and bias of the lasso selection in high-dimensional linear regression. *Annals of Statistics*, 36(4):1567–1594, 2008.
[12] Frederik Hoppe, Claudio Mayrink Verdun, Hannah Laus, Felix Krahmer, and Holger Rauhut. Uncertainty quantification for learned ISTA. In *2023 IEEE 33rd International Workshop on Machine Learning for Signal Processing (MLSP)*, pages 1–6. IEEE, 2023.
[13] Pierre C Bellec and Kai Tan. Uncertainty quantification for iterative algorithms in linear models with application to early stopping. *arXiv preprint arXiv:2404.17856*, 2024.
[14] Frederik Hoppe, Felix Krahmer, Claudio Mayrink Verdun, Marion I Menzel, and Holger Rauhut. High-Dimensional Confidence Regions in Sparse MRI. In *ICASSP 2023-2023 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP)*, pages 1–5. IEEE, 2023.
[15] A. Javanmard and A. Montanari. Debiasing the lasso: Optimal sample size for Gaussian designs. *The Annals of Statistics*, 46(6A), 2018.
[16] Vishal Monga, Yuelong Li, and Yonina C Eldar. Algorithm unrolling: Interpretable, efficient deep learning for signal and image processing. *IEEE Signal Processing Magazine*, 38(2):18–44, 2021.
[17] Jakob Gawlikowski, Cedrique Rovile Njieutcheu Tassi, Mohsin Ali, Jongseok Lee, Matthias Humt, Jianxiang Feng, Anna Kruspe, Rudolph Triebel, Peter Jung, Ribana Roscher, et al. A survey of uncertainty in deep neural networks. *Artificial Intelligence Review*, 56(Suppl 1):1513–1589, 2023.
[18] Martin Genzel, Ingo Gühring, Jan Macdonald, and Maximilian März. Near-exact recovery for tomographic inverse problems via deep learning. In *International Conference on Machine Learning*, pages 7368–7381. PMLR, 2022.
[19] Frederik Hoppe, Felix Krahmer, Claudio Mayrink Verdun, Marion I Menzel, and Holger Rauhut. Uncertainty quantification for sparse Fourier recovery. *arXiv preprint arXiv:2212.14864*, 2022.
[20] Ingrid Daubechies, Michel Defrise, and Christine De Mol. An iterative thresholding algorithm for linear inverse problems with a sparsity constraint. *Communications on Pure and Applied Mathematics*, 57(11):1413–1457, 2004.
[21] A. Beck and M. Teboulle. A Fast Iterative Shrinkage-Thresholding Algorithm for Linear Inverse Problems. *SIAM Journal on Imaging Sciences*, 2(1):183–202, 2009.
[22] Karol Gregor and Yann LeCun. Learning fast approximations of sparse coding. In *Proceedings of the 27th international conference on machine learning*, pages 399–406, 2010.
[23] Simon Foucart and Holger Rauhut. *A Mathematical Introduction to Compressive Sensing*. Springer New York, 2013.
[24] Hui Zou and Trevor Hastie. Regularization and variable selection via the elastic net. *Journal of the Royal Statistical Society Series B: Statistical Methodology*, 67(2):301–320, 2005.
[25] Ming Yuan and Yi Lin. Model Selection and Estimation in Regression with Grouped Variables. *Journal of the Royal Statistical Society Series B: Statistical Methodology*, 68(1):49–67, 2005.
[26] Vladimir Koltchinskii, Karim Lounici, and Alexandre B. Tsybakov. Nuclear-norm penalization and optimal rates for noisy low-rank matrix completion. *The Annals of Statistics*, 39(5):2302–2329, 2011.
[27] Malgorzata Bogdan, Ewout Van Den Berg, Chiara Sabatti, Weijie Su, and Emmanuel Candès. SLOPE–Adaptive Variable Selection via Convex Optimization. *The Annals of Applied Statistics*, 9(65):1103–1140, 2015.
[28] Jianqing Fan and Runze Li. Variable selection via nonconcave penalized likelihood and its oracle properties. *Journal of the American Statistical Association*, 96(456):1348–1360, 2001.
[29] Cun Hui Zhang. Nearly unbiased variable selection under minimax concave penalty. *Annals of Statistics*, 38(2):894–942, 2010.
[30] Le Zheng, Arian Maleki, Haolei Weng, Xiaodong Wang, and Teng Long. Does ℓp-Minimization Outperform ℓ1-Minimization? *IEEE Transactions on Information Theory*, 63(11):6896–6935, 2017.
[31] Alain Rakotomamonjy, Rémi Flamary, Joseph Salmon, and Gilles Gasso. Convergent working set algorithm for lasso with non-convex sparse regularizers. In *International Conference on Artificial Intelligence and Statistics*, pages 5196–5211. PMLR, 2022.
[32] Alexandre Belloni, Victor Chernozhukov, and Lie Wang. Square-root lasso: pivotal recovery of sparse signals via conic programming. *Biometrika*, 98(4):791–806, 2011.
[33] Claudio Mayrink Verdun, Oleh Melnyk, Felix Krahmer, and Peter Jung. Fast, blind, and accurate: Tuning-free sparse regression with global linear convergence. In *The Thirty Seventh Annual Conference on Learning Theory*, pages 3823–3872. PMLR, 2024.
[34] Xudong Li, Defeng Sun, and Kim-Chuan Toh. A highly efficient semismooth Newton augmented Lagrangian method for solving Lasso problems. *SIAM Journal on Optimization*, 28(1):433–458, 2018.
[35] Christian Kümmerle, Claudio Mayrink Verdun, and Dominik Stöger. Iteratively reweighted least squares for basis pursuit with global linear convergence rate. *Advances in Neural Information Processing Systems*, 34:2873–2886, 2021.
[36] Florentina Bunea, Alexandre Tsybakov, and Marten Wegkamp. Sparsity oracle inequalities for the Lasso. *Electronic Journal of Statistics*, 1:169–194, 2007.
[37] Vladimir Koltchinskii. Sparsity in penalized empirical risk minimization. In *Annales de l'IHP Probabilités et statistiques*, volume 45, pages 7–57, 2009.
[38] Fei Ye and Cun-Hui Zhang. Rate minimaxity of the Lasso and Dantzig selector for the ℓq loss in ℓr balls. *The Journal of Machine Learning Research*, 11:3519–3540, 2010.
[39] Garvesh Raskutti, Martin J Wainwright, and Bin Yu. Minimax rates of estimation for high-dimensional linear regression over ℓq-balls. *IEEE transactions on information theory*, 57(10):6976–6994, 2011.
[40] Arnak Dalalyan, Mohamed Hebiri, and Johannes C Lederer. On the prediction performance of the Lasso. *Bernoulli*, 23(1):552–581, 2017.
[41] Peng Zhao and Bin Yu. On model selection consistency of Lasso. *The Journal of Machine Learning Research*, 7:2541–2563, 2006.
[42] Martin J Wainwright. Sharp thresholds for High-Dimensional and noisy sparsity recovery using ℓ1-Constrained Quadratic Programming (Lasso). *IEEE transactions on information theory*, 55(5):2183–2202, 2009.
[43] Simon Foucart, Eitan Tadmor, and Ming Zhong. On the sparsity of LASSO minimizers in sparse data recovery. *Constructive Approximation*, 57(2):901–919, 2023.
[44] Sai Li. Debiasing the debiased Lasso with bootstrap. *Electronic Journal of Statistics*, 14:2298–2337, 2020.
[45] T Tony Cai and Zijian Guo. Confidence Intervals for High-Dimensional Linear Regression: Minimax Rates and Adaptivity. *The Annals of Statistics*, pages 615–646, 2017.
[46] Zijian Guo, Domagoj Čevid, and Peter Bühlmann. Doubly debiased lasso: High-dimensional inference under hidden confounding. *Annals of statistics*, 50(3):1320, 2022.
[47] Pierre C Bellec and Cun-Hui Zhang. De-biasing the lasso with degrees-of-freedom adjustment. *Bernoulli*, 28(2):713–743, 2022.
[48] Pierre C Bellec and Cun-Hui Zhang. Debiasing convex regularized estimators and interval estimation in linear models. *The Annals of Statistics*, 51(2):391–436, 2023.
[49] Frederik Hoppe, Claudio Mayrink Verdun, Hannah Laus, Sebastian Endt, Marion I. Menzel, Felix Krahmer, and Holger Rauhut. Imaging with Confidence: Uncertainty Quantification for High-dimensional Undersampled MR Images. In *Proceedings of European Conference on Computer Vision (ECCV)*, 2024.
[50] Daisuke Ito, Satoshi Takabe, and Tadashi Wadayama. Trainable ISTA for sparse signal recovery. *IEEE Transactions on Signal Processing*, 67(12):3113–3125, 2019.
[51] Kailun Wu, Yiwen Guo, Ziang Li, and Changshui Zhang. Sparse coding with gated learned ISTA. In *International conference on learning representations*, 2019.
[52] Jialin Liu and Xiaohan Chen. ALISTA: Analytic weights are as good as learned weights in LISTA. In *International Conference on Learning Representations (ICLR)*, 2019.
[53] Xiaohan Chen, Jialin Liu, Zhangyang Wang, and Wotao Yin. Hyperparameter tuning is all you need for LISTA. *Advances in Neural Information Processing Systems*, 34:11678–11689, 2021.
[54] Aviad Aberdam, Alona Golts, and Michael Elad. Ada-lista: Learned solvers adaptive to varying models. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 44(12):9222–9235, 2021.
[55] Ziyang Zheng, Wenrui Dai, Duoduo Xue, Chenglin Li, Junni Zou, and Hongkai Xiong. Hybrid ISTA: Unfolding ISTA with convergence guarantees using free-form deep neural networks. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 45(3):3226–3244, 2022.
[56] Jonas Adler and Ozan Öktem. Learned primal-dual reconstruction. *IEEE transactions on medical imaging*, 37(6):1322–1332, 2018.
[57] Jo Schlemper, Jose Caballero, Joseph V Hajnal, Anthony N Price, and Daniel Rueckert. A deep cascade of convolutional neural networks for dynamic MR image reconstruction. *IEEE transactions on Medical Imaging*, 37(2):491–503, 2017.
[58] Hamza Cherkaoui, Jeremias Sulam, and Thomas Moreau. Learning to solve TV regularised problems with unrolled algorithms. *Advances in Neural Information Processing Systems*, 33:11513–11524, 2020.
[59] Hemant K Aggarwal, Merry P Mani, and Mathews Jacob. MoDL: Model-based deep learning architecture for inverse problems. *IEEE transactions on medical imaging*, 38(2):394–405, 2018.
[60] Risheng Liu, Shichao Cheng, Long Ma, Xin Fan, and Zhongxuan Luo. Deep proximal unrolling: Algorithmic framework, convergence analysis and applications. *IEEE Transactions on Image Processing*, 28(10):5013–5026, 2019.
[61] Jian Zhang, Bin Chen, Ruiqin Xiong, and Yongbing Zhang. Physics-inspired compressive sensing: Beyond deep unrolling. *IEEE Signal Processing Magazine*, 40(1):58–72, 2023.
[62] Simon Arridge, Peter Maass, Ozan Öktem, and Carola-Bibiane Schönlieb. Solving inverse problems using data-driven models. *Acta Numerica*, 28:1–174, 2019.
[63] Martin Genzel, Jan Macdonald, and Maximilian März. Solving inverse problems with deep neural networks–robustness included? *IEEE transactions on pattern analysis and machine intelligence*, 45(1):1119–1134, 2022.
[64] Emil Y Sidky and Xiaochuan Pan. Report on the AAPM deep-learning sparse-view CT grand challenge. *Medical physics*, 49(8):4935–4943, 2022.
[65] Ke Li and Jitendra Malik. Learning to Optimize. In *International Conference on Learning Representations*, 2016.
[66] Tianlong Chen, Xiaohan Chen, Wuyang Chen, Howard Heaton, Jialin Liu, Zhangyang Wang, and Wotao Yin. Learning to optimize: A primer and a benchmark. *Journal of Machine Learning Research*, 23(189):1–59, 2022.
[67] Canberk Ekmekci and Mujdat Cetin. Uncertainty quantification for deep unrolling-based computational imaging. *IEEE Transactions on Computational Imaging*, 8:1195–1209, 2022.
[68] Yarin Gal and Zoubin Ghahramani. Dropout as a bayesian approximation: Representing model uncertainty in deep learning. In *international conference on machine learning*, pages 1050–1059. PMLR, 2016.
[69] Glenn Shafer and Vladimir Vovk. A tutorial on conformal prediction. *Journal of Machine Learning Research*, 9(3), 2008.
[70] Vladimir Vovk, Alexander Gammerman, and Glenn Shafer. *Algorithmic learning in a random world*, volume 29. Springer, 2005.
[71] Gilad Kutiel, Regev Cohen, Michael Elad, Daniel Freedman, and Ehud Rivlin. Conformal prediction masks: Visualizing uncertainty in medical imaging. In *International Workshop on Trustworthy Machine Learning for Healthcare*, pages 163–176. Springer, 2023.
[72] Anastasios N Angelopoulos, Amit Pal Kohli, Stephen Bates, Michael Jordan, Jitendra Malik, Thayer Alshaabi, Srigokul Upadhyayula, and Yaniv Romano. Image-to-image regression with distribution-free uncertainty quantification and applications in imaging. In *International Conference on Machine Learning*, pages 717–730. PMLR, 2022.
[73] Olaf Ronneberger, Philipp Fischer, and Thomas Brox. U-net: Convolutional networks for biomedical image segmentation. In *Medical image computing and computer-assisted intervention–MICCAI 2015*, pages 234–241. Springer, 2015.
[74] Jure Zbontar, Florian Knoll, Anuroop Sriram, Tullie Murrell, Zhengnan Huang, Matthew J. Muckley, Aaron Defazio, Ruben Stern, Patricia Johnson, Mary Bruno, et al. fastMRI: An Open Dataset and Benchmarks for Accelerated MRI, 2019.
[75] Florian Knoll, Jure Zbontar, Anuroop Sriram, Matthew J. Muckley, Mary Bruno, Aaron Defazio, Marc Parente, Krzysztof J. Geras, Joe Katsnelson, Hersh Chandarana, et al. fastMRI: A Publicly Available Raw k-Space and DICOM Dataset of Knee Images for Accelerated MR Image Reconstruction Using Machine Learning. *Radiology: Artificial Intelligence*, 2(1):e190007, 2020.
[76] Zhou Wang, Eero P Simoncelli, and Alan C Bovik. Multiscale structural similarity for image quality assessment. In *The Thirty-Seventh Asilomar Conference on Signals, Systems & Computers, 2003*, volume 2, pages 1398–1402. IEEE, 2003.
[77] Kang Lin and Reinhard Heckel. Vision transformers enable fast and robust accelerated mri. In *International Conference on Medical Imaging with Deep Learning*, pages 774–795. PMLR, 2022.
[78] John G. Saw, Mark C. K. Yang, and Tse Chin Mo. Chebyshev Inequality with Estimated Mean and Variance. *The American Statistician*, 38(2):130–132, 1984.
[79] Santiago Aja-Fernández and Gonzalo Vegas-Sánchez-Ferrero. *Statistical analysis of noise in MRI*. Springer International Publishing, 2016.
[80] Tingni Sun and Cun-Hui Zhang. Scaled sparse linear regression. *Biometrika*, 99(4):879–898, 2012.
[81] Stephen Reid, Robert Tibshirani, and Jerome Friedman. A study of error variance estimation in lasso regression. *Statist. Sinica*, pages 35–67, 2016.
[82] Christopher Kennedy and Rachel Ward. Greedy variance estimation for the LASSO. *Appl. Math. Optim.*, 82(3):1161–1182, 2020.
[83] Christophe Giraud, Sylvie Huet, and Nicolas Verzelen. High-dimensional regression with unknown variance. *Statist. Sci.*, 27(4):500–518, 2012.
[84] Lee H Dicker. Variance estimation in high-dimensional linear models. *Biometrika*, 101(2):269–284, 2014.
[85] X Liu, S Zheng, and X Feng. Estimation of error variance via ridge regression. *Biometrika*, 107(2):481–488, 2020.
[86] Guo Yu and Jacob Bien. Estimating the error variance in a high-dimensional linear model. *Biometrika*, 106(3):533–546, 2019.
[87] Bartolomeo Stellato, Bart P. G. van Parys, and Paul J. Goulart. Multivariate Chebyshev Inequality With Estimated Mean and Variance. *The American Statistician*, 71(2):123–127, 2017.
[88] Esa Ollila, David E. Tyler, Visa Koivunen, and H. Vincent Poor. Complex Elliptically Symmetric Distributions: Survey, New Results and Applications. *IEEE Transactions on Signal Processing*, 60(11):5597–5625, 2012.
[89] S. R. Becker, E. J. Candès, and M. C. Grant. Templates for convex cone problems with applications to sparse signal recovery. *Mathematical programming computation*, 3(3):165–218, 2011.

## 补充材料

本补充材料中，A 节详细讨论主结果中未在正文展开的若干方面；B 节给出定理 2 与定理 3 的证明（前者建立数据驱动置信区间，后者假定余项可被高斯分布近似）；附录 C 在重尾分布假设下构造类似定理 3 的置信区间；D 节用若干数值实验（经典高维回归与模型驱动神经网络）确认理论发现；E 节可视化余项的近似高斯分布，说明定理 3 在相关设定中的适用性。

### A 主结果的进一步讨论

本附录深入讨论主要理论结果定理 2 的技术细节与实践考量，包括置信区间半径分析、概率解释，以及面向实现的理论假设松弛。

**半径长度：** 为最小化半径长度，$\gamma_j\in(0,1-\frac{1}{l\alpha})$ 应取如下问题的极小点：

$$
\min_{\gamma_j\in(0,1-\frac{1}{l\alpha})}
\frac{\sigma(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)^{1/2}_{jj}}{\sqrt m}\sqrt{\log\left(\frac{1}{\gamma_j\alpha}\right)}
+\sqrt{\frac{l^2-1}{l^2(1-\gamma_j)\alpha}-l}\cdot(\hat\sigma_R)_j, \tag{7}
$$

对给定显著性水平 $\alpha$，要在较大集合上最小化就需要较多数据 $l$。对固定估计 $\hat S_j$ 与 $(\hat\sigma^2_R)_j$，数据越多置信区间长度可能越小。若假定 $R_j=0$，则 $\hat S_j=0$、$(\hat\sigma^2_R)_j=0$，此时 $\gamma=1$ 是有效选择，函数 $\frac{\sigma(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)^{1/2}_{jj}}{\sqrt m}\sqrt{\log(\frac{1}{\gamma_j\alpha})}$ 有定义且取最小。此情形半径与 [9, 10, 15] 导出的渐近半径一致（除这些工作处理实值情形外），也与 [12] 中取 $\mathbf M=\mathbf I_{N\times N}$ 的结果一致。在这个意义上，渐近置信区间可视为所提方法的特例。

显著性水平 $\alpha$ 依赖 $\gamma_j$ 与 $l$，以保证 $c_l(\cdot)$ 有定义。对大数据集 $\mathbf x^{(1)},\dots,\mathbf x^{(l)}$（即 $l$ 大），有 $\lim_{l\to\infty}c_l(\alpha)=\lim_{l\to\infty}\sqrt{\frac{1-1/l^2}{(1-\gamma_j)\alpha}-\frac1l}=\frac{1}{\sqrt{(1-\gamma_j)\alpha}}$。

> **原文疑点：** 式 (4) 半径中的余项系数写作 $c_l(\alpha)$，但其定义 $c_l(\alpha):=\sqrt{\frac{l^2-1}{l^2(1-\gamma_j)\alpha}-l}$ 内部已含 $(1-\gamma_j)$（算法 1 第 7 行写作 $c_l((1-\gamma)\alpha)$）；正文与算法对该系数的自变量记号不一致，按定义式理解应为 $c_l((1-\gamma_j)\alpha)$。本译按原文照录并加注。

**概率讨论：** (5) 中的概率取于噪声以及 $Q$ 的随机性。置信圆 $C_j(\alpha)$ 由两个随机变量构成：去偏估计 $\hat{\mathbf x}^u_j$ 与半径 $r_j(\alpha)$。前者依赖随机噪声并可能依赖训练数据；后者依赖估计 $\hat S_j$ 与 $\hat\sigma_R$，而它们又同时依赖噪声与数据 $\mathbf x^{(1)},\dots,\mathbf x^{(l)}$。

应用经验版 Chebyshev 不等式 [78] 的关键要求是变量 $|R^{(1)}_j|,\dots,|R^{(l)}_j|$ 独立同分布。因此估计函数 $\hat{\mathbf X}$ 必须与用于估计 $\mathbf R^{(1)},\dots,\mathbf R^{(l)}$ 的数据 $\mathbf x^{(1)},\dots,\mathbf x^{(l)}$ 独立。为此，我们用与 $\mathbf x^{(1)},\dots,\mathbf x^{(l)}$ 独立的数据集训练估计函数 $\hat{\mathbf X}$。然而 $|R^{(1)}|$（因而 $|R^{(i)}|$）的均值与方差依赖噪声 $\boldsymbol\varepsilon^{(1)}$ 的方差，即 $\sigma^2$；因此不同噪声水平 $\sigma$ 需要重新估计 $|R^{(1)}|$ 的均值与方差。全文假定噪声水平固定且已知。后者基于两点：第一，置信区间大小依赖 $\sigma$，而本文主要关注基于余项 $R^{(1)}$ 确定置信区间大小，故希望抑制噪声水平估计等其他影响因素；第二，在医学成像等领域，关于噪声水平有大量先验知识，例如 MRI 中的噪声水平可直接从扫描仪测得 [79]。若噪声水平未知，也有估计方法：在去偏 LASSO 文献中最常用的是 scaled LASSO [80]，稀疏回归中的其他方法（LASSO 语境或更一般高维模型）见 [81–86]。

**实践中的假设松弛：** 实践中常有 $|R^{(1)}_1|,\dots,|R^{(1)}_N|$ 同分布，从而 $\mu_1=\dots=\mu_N$、$(\sigma^2_R)_1=\dots=(\sigma^2_R)_N$。尽管证明要求 $|R^{(i)}_j|$ 独立，某些情形下可放松该假设，逐像素统一估计均值与方差：

$$
\hat S=\frac{1}{l\cdot N}\sum_{i=1}^{l}\sum_{j=1}^{N}R^{(i)}_j,
\qquad
\hat\sigma^2_R=\frac{1}{l\cdot N-1}\sum_{i=1}^{l}\sum_{j=1}^{N}\left(R^{(i)}_j-\hat S\right)^2. \tag{8}
$$

这不仅节省计算资源，还因样本数更多而提高精度。此外，不必对每个 $j\in\{1,\dots,N\}$ 求解优化问题 (7)，可取 $\gamma_1=\dots=\gamma_N$ 为下式的极小点：

$$
\min_{\gamma_j\in(0,1-\frac{1}{l\alpha})}
\frac{\sigma\sum_{j=1}^{N}(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)^{1/2}_{jj}}{\sqrt{mN}}\sqrt{\log\left(\frac{1}{\gamma_j\alpha}\right)}
+c_l((1-\gamma_j)\alpha)\cdot\frac1N\sum_{j=1}^{N}(\hat\sigma_R)_j, \tag{9}
$$

随后用一个 $\gamma$ 计算可能各不相同的半径 $r_j(\alpha)$。

**不确定性类型：** 把估计误差分解为高斯项与余项，使我们几乎可分别处理两类不确定性。高斯项 $\mathbf W$ 量化来自固有点击测量噪声的**偶然不确定性**；余项 $\mathbf R$ 处理**认知不确定性**，我们以纯数据驱动方式量化它——对两个不同反向模型（如两个不同神经网络），可用它相对于真值比较两者的估计误差。在这个意义上，本技术更像一种更一般的推断不确定性方法。

### B 证明

**定理 2 的证明。** 命题 $x^{(l+1)}_j\in C_j(\alpha)$ 等价于 $|(\hat{\mathbf x}^u)^{(l+1)}_j-x^{(l+1)}_j|\le r_j(\alpha)$。为证 (5)，我们证明 $\mathbb P(|(\hat{\mathbf x}^u)^{(l+1)}_j-x^{(l+1)}_j|\ge r_j(\alpha))\le\alpha$。下一步把半径写成 $r(\alpha)=r_W(\alpha)+r_R(\alpha)$。由分解 $(\hat{\mathbf x}^u)^{(l+1)}_j-x^{(l+1)}_j=W_j+R_j$，对固定 $j\in\{1,\dots,N\}$ 得

$$
\mathbb P\left(\left|(\hat{\mathbf x}^u_j)^{(l+1)}-x^{(l+1)}_j\right|\ge r^W_j(\alpha)+r^R_j(\alpha)\right)
=\mathbb P\left(|W_j+R_j|\ge r^W_j(\alpha)+r^R_j(\alpha)\right)
$$
$$
\le\mathbb P\left(|W_j|+|R_j|\ge r^W_j(\alpha)+r^R_j(\alpha)\right)
\le\mathbb P\left(|W_j|\ge r^W_j(\alpha)\right)+\mathbb P\left(|R_j|\ge r^R_j(\alpha)\right),
$$

最后一步由鸽巢原理得到。为估计第一项，置 $r^W_j(\alpha):=\frac{\sigma(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)^{1/2}_{jj}}{\sqrt m}\sqrt{\log(\frac{1}{\gamma_j\alpha})}$。由于 $|W_j|\sim\text{Rice}\left(0,\frac{\sigma(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)^{1/2}_{jj}}{\sqrt{2m}}\right)$，得

$$
\mathbb P\left(|W_j|\ge r^W_j(\alpha)\right)
=\frac{2m}{\sigma^2\hat\Sigma_{jj}}\int_{r^W_j(\alpha)}^{+\infty}x\exp\left(-\frac{x^2m}{\sigma^2(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)_{jj}}\right)dx
=\int_{(r^W_j(\alpha))^2\frac{m}{\sigma^2(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)_{jj}}}^{+\infty}\exp(-u)du
$$
$$
=\exp\left(-\frac{(r^W_j(\alpha))^2m}{\sigma^2(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)_{jj}}\right)
=\exp\left(-\log\frac{1}{\gamma_j\alpha}\right)=\gamma_j\alpha.
$$

为估计 $\mathbb P(|R_j|\ge r^R_j(\alpha))$，置 $r^R_j(\alpha)=c_l(\alpha)\cdot(\hat\sigma_R)_j+\hat S_j$，该选择给出

$$
\mathbb P\left(|R_j|\ge r^R_j(\alpha)\right)
=\mathbb P\left(|R_j|-\hat S_j\ge r^R_j(\alpha)-\hat S_j\right)
\le\mathbb P\left(\left||R_j|-\hat S_j\right|\ge r^R_j(\alpha)-\hat S_j\right)
=\mathbb P\left(\frac{\left||R_j|-\hat S_j\right|}{(\hat\sigma_R)_j}\ge c_l(\alpha)\right).
$$

现在应用经验版 Chebyshev 不等式 [78, 87]，得

$$
\mathbb P\left(\frac{\left||R_j|-\hat S_j\right|}{(\hat\sigma_R)_j}\ge c_l(\alpha)\right)
\le\min\left\{1,\frac{1}{l+1}\left\lceil\frac{(l+1)(l^2-1+lc_l(\alpha)^2)}{l^2c_l(\alpha)^2}\right\rceil\right\}
\le\min\left\{1,\frac{l^2-1+lc_l(\alpha)^2}{l^2c_l(\alpha)^2}\right\}
$$
$$
=\min\left\{1,\frac{l^2-1+\frac{l^2-1}{l(1-\gamma_j)\alpha}-1}{l\left(\frac{l^2-1}{l(1-\gamma_j)\alpha}-1\right)}\right\}
=\min\left\{1,\frac{1+\frac1{l(1-\gamma_j)\alpha}-\frac1l}{1-\frac1{l(1-\gamma_j)\alpha}}\right\}
=(1-\gamma_j)\alpha,
$$

从而 $\mathbb P(|(\hat{\mathbf x}^u)^{(l+1)}_j-x^{(l+1)}_j|\ge r_j(\alpha))\le\gamma_j\alpha+(1-\gamma_j)\alpha=\alpha$，证毕。

**定理 3 的证明。** 与定理 2 的证明类似，把误差写成 $W_j+R_j$，其中 $W_j\sim\mathcal{CN}(0,\frac{\sigma^2}{m}(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)_{jj})$、$R_j\sim\mathcal{CN}(0,\frac{1}{m}(\boldsymbol\Sigma_R)_{jj})$，且二者独立，故 $W_j+R_j\sim\mathcal{CN}(0,\frac{1}{m}(\sigma^2(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)_{jj}+(\boldsymbol\Sigma_R)_{jj}))$。对半径 (6)，$|\hat{\mathbf x}^u_j-x_j|^2$ 服从尺度为 $\frac{1}{m}(\sigma^2(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)_{jj}+(\boldsymbol\Sigma_R)_{jj})$ 的指数分布，故 $\mathbb P(|\hat{\mathbf x}^u_j-x_j|\ge r^G_j(\alpha))=\exp(-\frac{m(r^G_j(\alpha))^2}{\sigma^2(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)_{jj}+(\boldsymbol\Sigma_R)_{jj}})=\alpha$，证毕。

### C 定理 3 的重尾版本

下面给出定理 3 的一个版本，示范余项服从已知重尾分布时如何导出置信区间半径。

**定理 4.** 设 $\hat{\mathbf x}^u\in\mathbb C^N$ 为 $\mathbf x\in\mathbb C^N$ 的去偏估计器，余项服从自由度为 $\nu>2$ 的复 $t$ 分布，即 $\mathbf R\sim\mathcal{C}t_\nu(\mathbf 0,\boldsymbol\Sigma_R)$。则 $C_j(\alpha)=\{z\in\mathbb C:|z-\hat{\mathbf x}^u_j|\le r_j(\alpha)\}$，其半径

$$
r_j(\alpha)=\frac{\sigma(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)^{1/2}_{jj}}{\sqrt m}\sqrt{\log\left(\frac{1}{\gamma_j\alpha}\right)}
+\sqrt{\frac{(\boldsymbol\Sigma_R)_{jj}\nu}{2}}\sqrt{(1-\gamma_j)^{-2/\nu}\alpha^{-2\nu}-1}
$$

有效，即 $\mathbb P(x_j\in C_j(\alpha))\ge1-\alpha$。

**证明.** 与定理 2 的证明类似，可界住估计误差 $|\hat{\mathbf x}^u_j-x_j|$：$\mathbb P(|\hat{\mathbf x}^u_j-x_j|\ge r_j(\alpha))=\mathbb P(|W_j+R_j|>r_j(\alpha))\le\mathbb P(|W_j|>r^W_j(\alpha))+\mathbb P(|R_j|>r^R_j(\alpha))$。$\mathbb P(|W_j|>r^W_j(\alpha))$ 由高斯噪声决定，其计算与定理 2 相同，其中 $r^W_j(\alpha)=\frac{\sigma(\mathbf M\hat{\boldsymbol\Sigma}\mathbf M^*)^{1/2}_{jj}}{\sqrt m}\sqrt{\log(\frac{1}{\gamma_j\alpha})}$。若 $\mathbf R\sim\mathcal{C}t_\nu(\mathbf 0,\boldsymbol\Sigma_R)$，则边缘 $R_j$ 也服从复 $t$ 分布，即 $R_j\sim(0,(\boldsymbol\Sigma_R)_{jj})$（见 [88]）。此外 $|R_j|$ 的概率密度为 $f(r)=\frac{2r}{(\boldsymbol\Sigma_R)_{jj}}\left(1+\frac{2r^2}{\nu(\boldsymbol\Sigma_R)_{jj}}\right)^{-\nu/2-1}$。因此

$$
\mathbb P\left(|R_j|>r^R_j(\alpha)\right)=\int_{r_j(\alpha)}^{\infty}f(r)dr
=\left[-\frac{1}{\left(\frac{2r^2}{(\boldsymbol\Sigma_R)_{jj}\nu}+1\right)^{\nu/2}}\right]_{r_j(\alpha)}^{\infty}
=\frac{1}{\left(\frac{2r^2}{(\boldsymbol\Sigma_R)_{jj}\nu}+1\right)^{\nu/2}}.
$$

令该概率等于 $(1-\gamma_j)\alpha$，即得 $r^R_j(\alpha)=\sqrt{\frac{(\boldsymbol\Sigma_R)_{jj}\nu}{2}}\sqrt{(1-\gamma_j)^{-2/\nu}\alpha^{-2\nu}-1}$。由于 $\nu>2$，有 $(1-\gamma_j)^{-2/\nu}\alpha^{-2\nu}>1$。合并 $r_j(\alpha)=r^W_j(\alpha)+r^R_j(\alpha)$ 即完成证明。

### D 更多数值评估

为确认“纳入偏差分量使置信区间更稳健”的理论发现，我们在此给出更多数值实验。

**经典模型驱动回归的 UQ。** 此处实验使用 Tfocs [89]。与第 5.1 节实验类似，我们在测量矩阵为高斯矩阵与欠采样 Fourier 矩阵的经典稀疏回归设定中开展进一步实验，不同设定及结果见表 1。结果显示：所提方法的高斯修正显著提高击中率（尤其在支撑集上），同时适度增加置信区间长度；数据驱动修正取得更好的击中率，但置信区间更大。在良态设定（如表 1 第二列）中，基于渐近置信区间的击中率 $h^W(0.05)$ 整体接近 95%，但在关键特征即支撑集上，渐近击中率失效。特别地，我们的修正在病态回归问题（如第三个高斯列）中至关重要。渐近置信区间与高斯修正后的击中率更详细的可视化见图 4。

**神经网络 MRI 重建的 UQ。** 本节给出神经网络 MRI 重建 UQ 的更多实验。我们的实验设置与代码基于 [18] 的论文与代码³，所用数据集为 fastMRI 单线圈膝关节数据集（文档见 [74, 75]）。

表 2 给出用 8 层 It-Net 学习重建函数 $\hat{\mathbf X}$ 的结果，覆盖 60%、40%、30% 径向欠采样，以及通过加入标准差 $\sigma=60$ 与 $\sigma=84$ 的复高斯噪声所得噪声水平。类似地，表 3 给出 U-Net 的结果。图 6 对每个实验以箱线图比较 95% 置信水平下渐近击中率与高斯修正击中率。注意这些实验中我们只对图像实部构造置信区间，因为 fastMRI 数据集只提供实值数据；由于这一特性，无法研究虚部幅值的分布，高斯修正置信区间也无法用于幅值。为此，并为了确保三类置信区间的有效比较，我们决定即使在渐近与数据驱动设定下也只研究实部的置信区间。

所有 It-Net 与 U-Net 均以 MS-SSIM 损失 [76]、ℓ1 损失与 Adam 优化器的组合训练，学习率 $5\text{e-}5$、epsilon $1\text{e-}4$、权重衰减 $1\text{e-}5$。

³ https://github.com/jmaces/robust-nets

**表 1：** 高斯矩阵与 Fourier 矩阵上的稀疏回归实验（每个实验使用 500 个估计数据与 250 个评估数据）。

| 指标 | 高斯 1000 | 高斯 10000 | 高斯 10000 | Fourier 1000 | Fourier 10000 | Fourier 100000 |
|---|---|---|---|---|---|---|
| 欠采样率 | 50% | 40% | 60% | 40% | 60% | 50% |
| 稀疏度 | 7.5% | 2% | 10% | 5% | 10% | 5% |
| 相对噪声 | 15% | 10% | 20% | 15% | 5% | 10% |
| R/W ℓ2-比 | 0.7062 | 0.5117 | 0.9993 | 0.5446 | 0.5924 | 0.4701 |
| R/W ℓ∞-比 | 0.8191 | 0.5161 | 1.1581 | 0.5752 | 0.6088 | 0.4794 |
| 平均渐近半径 $r^W(0.05)$ | 0.0116 | 0.0027 | 0.0049 | 0.0130 | 0.0011 | 0.0008 |
| 平均半径 $r^G(0.05)$（定理 3） | 0.0142 | 0.0031 | 0.0069 | 0.0148 | 0.0013 | 0.0009 |
| 平均半径 $r(0.05)$（定理 2） | 0.0304 | 0.0060 | 0.0155 | 0.0295 | 0.0026 | 0.0016 |
| $h^W(0.05)$ | 0.9437 | 0.9353 | 0.8692 | 0.9582 | 0.9246 | 0.9444 |
| $h^G(0.05)$ | 0.9787 | 0.9684 | 0.9691 | 0.9799 | 0.9665 | 0.9687 |
| $h(0.05)$ | 1 | 1 | 1 | 1 | 1 | 0.9999 |
| $h^W_S(0.05)$ | 0.7661 | 0.8941 | 0.6783 | 0.8629 | 0.8745 | 0.9041 |
| $h^G_S(0.05)$ | 0.8852 | 0.9421 | 0.8948 | 0.9226 | 0.9396 | 0.9425 |
| $h_S(0.05)$ | 0.9999 | 1 | 1 | 0.9999 | 1 | 0.9998 |

**图 4：** 稀疏回归实验击中率的箱线图，设定按表 1 描述。第一行为全部分量上的击中率，第二行为支撑集上的击中率（如 4a 与 4g 对应表 1 第一列，4b 与 4h 对应第二列，依此类推）。每个图中左箱为渐近击中率，右箱为高斯修正击中率，水平线标出期望的 95%。

**图 5：** fastMRI 数据集的膝关节 MRI 真值图像（5a）[74, 75]、径向采样掩码（5b）与欠采样 k 空间数据（5c）。

It-Net 训练 15 个 epoch，U-Net 训练 20 个 epoch，批大小均为 40。每个 U-Net 有 2 个输入输出通道、24 个基础通道，把图像编码到 $20\times20$ 大小、最多 384 个通道。It-Net 在每一层把 U-Net 用作残差网络，并在每层每个 U-Net 周围带数据一致性部分。

比较两表可见，It-Net 一般有更好的击中率与更好的 R/W 比，这是因为其重建更准确。此外，全部像素上的击中率都高于仅在支撑集上得到的击中率。对安全关键应用要获得可靠结果，获得高于置信水平的击中率至关重要，尤其在支撑集上；否则可能整体达到某置信水平，却无法信任感兴趣的像素。

实验在配备 AMD EPYC 7F52 16 核 CPU 与 NVIDIA A100 PCIe 40GB GPU 的台式机上、用 Pytorch 1.9 完成。实验代码见补充材料。每个 It-Net 运行约 5 小时、每个 U-Net 约 2 小时、其余每个实验约 30 分钟，因此 MRI 重建实验总计约 48 小时；经典模型驱动回归实验每个需 5 至 30 分钟，总计不足 3 小时。

**表 2：** 8 次迭代 It-Net 的实验结果（击中率在 $k=100$ 个样本上平均）。

| 指标 | 60% 欠采样 | 60% 欠采样 | 40% 欠采样 | 40% 欠采样 | 30% 欠采样 | 30% 欠采样 |
|---|---|---|---|---|---|---|
| 噪声水平 | 15% | 10% | 12% | 8% | 10% | 7% |
| R/W ℓ2-比 | 0.3558 | 0.3800 | 0.6332 | 0.6922 | 0.8759 | 0.5759 |
| R/W ℓ∞-比 | 0.3842 | 0.4929 | 0.6268 | 0.6924 | 1.0614 | 0.6282 |
| $h(0.05)$ | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| $h^G(0.05)$ | 0.9797 | 0.9791 | 0.9826 | 0.9818 | 0.9831 | 0.9770 |
| $h^W(0.05)$ | 0.9726 | 0.9689 | 0.9714 | 0.9649 | 0.9690 | 0.9518 |
| $h(0.1)$ | 0.9998 | 0.9998 | 0.9999 | 0.9999 | 1.0 | 0.9999 |
| $h^G(0.1)$ | 0.9486 | 0.9485 | 0.9544 | 0.9539 | 0.9553 | 0.9448 |
| $h^W(0.1)$ | 0.9359 | 0.9306 | 0.9338 | 0.9241 | 0.9299 | 0.9033 |
| $h_S(0.05)$ | 1.0 | 0.9999 | 1.0 | 1.0 | 1.0 | 1.0 |
| $h^G_S(0.05)$ | 0.9739 | 0.9711 | 0.9789 | 0.9729 | 0.9798 | 0.9707 |
| $h^W_S(0.05)$ | 0.9656 | 0.9589 | 0.9663 | 0.9520 | 0.9642 | 0.9421 |
| $h_S(0.1)$ | 0.9997 | 0.9995 | 0.9999 | 0.9998 | 0.9999 | 0.9998 |
| $h^G_S(0.1)$ | 0.9385 | 0.9353 | 0.9476 | 0.9392 | 0.9493 | 0.9347 |
| $h^W_S(0.1)$ | 0.9246 | 0.9152 | 0.9257 | 0.9053 | 0.9225 | 0.8906 |

**表 3：** U-Net 的实验结果（击中率在 $k=100$ 个样本上平均）。

| 指标 | 60% 欠采样 | 60% 欠采样 | 40% 欠采样 | 40% 欠采样 | 30% 欠采样 | 30% 欠采样 |
|---|---|---|---|---|---|---|
| 噪声水平 | 15% | 10% | 12% | 8% | 10% | 7% |
| R/W ℓ2-比 | 0.2747 | 0.3976 | 0.6182 | 0.6671 | 1.2641 | 1.3399 |
| R/W ℓ∞-比 | 0.3923 | 0.4292 | 0.5681 | 0.7082 | 1.1668 | 1.2501 |
| $h(0.05)$ | 0.9999 | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| $h^G(0.05)$ | 0.9657 | 0.9688 | 0.9737 | 0.9767 | 0.9768 | 0.978 |
| $h^W(0.05)$ | 0.9569 | 0.9552 | 0.9583 | 0.9535 | 0.9517 | 0.9418 |
| $h(0.1)$ | 0.9993 | 0.9997 | 0.9998 | 0.9999 | 1.0 | 1.0 |
| $h^G(0.1)$ | 0.9238 | 0.9296 | 0.9377 | 0.9443 | 0.9432 | 0.9465 |
| $h^W(0.1)$ | 0.9098 | 0.9077 | 0.9125 | 0.9060 | 0.9022 | 0.8886 |
| $h_S(0.05)$ | 0.9999 | 0.9999 | 1.0 | 1.0 | 1.0 | 1.0 |
| $h^G_S(0.05)$ | 0.9679 | 0.9677 | 0.975 | 0.9727 | 0.9779 | 0.9757 |
| $h^W_S(0.05)$ | 0.9594 | 0.9541 | 0.9602 | 0.9483 | 0.9542 | 0.9398 |
| $h_S(0.1)$ | 0.9994 | 0.9996 | 0.9999 | 0.9998 | 1.0 | 0.9999 |
| $h^G_S(0.1)$ | 0.9276 | 0.9282 | 0.9401 | 0.9388 | 0.946 | 0.9446 |
| $h^W_S(0.1)$ | 0.9141 | 0.9064 | 0.9156 | 0.9002 | 0.9061 | 0.8876 |

**图 6：** 神经网络实验击中率的箱线图，设定按表 2 与表 3 描述。第一行为不同 It-Net 在 95% 置信区间下的击中率，第二行为 U-Net 在 95% 置信区间下的击中率（如 6a 与 6g 对应两表第一列）。每个图中左箱为渐近击中率，右箱为高斯修正击中率。

### E 余项分布可视化

图 7 给出一系列直方图，展示本文稀疏回归中全部实验设定下余项实部的经验分布。这些直方图证明余项可被高斯分布近似，且维数越高近似越精确：在低维情形，经验分布与高斯形式有偏差，但随着维数增大这些偏差减小；在高维区间，经验分布与高斯近似的吻合程度极好。这种紧密吻合有力支持了定理 3 关键假设的有效性，使置信区间的高斯修正可行。图 8 给出本文 U-Net 六个不同实验设定下余项实部的经验分布直方图。图 9 给出 It-Net 实验的直方图：多数情形下余项实部服从均值为 0 的高斯分布，唯二例外是图 8e 与 8f，它们对应 30% 欠采样的 U-Net 实验。

**图 7：** 余项分量经验分布的直方图：把 $\mathbf R$ 的实部画为直方图，红线为高斯拟合。对表 1 所述每个实验可视化余项的一个实现（7a 对应第一列、7b 对应第二列，依此类推；虚部图形类似）。

**图 8：** 余项分量经验分布的直方图（U-Net 实验；实部为直方图，红线为高斯拟合）。

**图 9：** 余项分量经验分布的直方图（It-Net 实验）：把 $\mathbf R$ 的实部画为直方图，红线为高斯拟合。对表 2 所述每个实验可视化余项的一个实现（9a 对应第一列、9b 对应第二列，依此类推）。

## NeurIPS 论文清单

以下为会议模板要求的论文清单条目（问、答与作者给出的理由）；模板中每条之后的通用“Guidelines”说明为会议模板固定文本，此处从略。

1. **主张。** 问：摘要与引言中的主要主张是否准确反映论文贡献与范围？答：**是**。理由：本文发展了高维学习中非渐近不确定性量化的理论，并如摘要所述把该理论应用于神经网络与学习算法，弥合理论与实践。
2. **局限。** 问：论文是否讨论了工作的局限？答：**是**。理由：见第 6 节；我们讨论了更大余项需要更大修正、导致更宽置信区间，方法精度依赖余项均值与方差估计质量（数据越多越好），并把所给结果的尖锐性留作未来工作。
3. **理论假设与证明。** 问：对每个理论结果，论文是否给出完整假设与完备（且正确）的证明？答：**是**。理由：全部理论结果均有证明，定理 2 与定理 3 在 B 节证明，定理 1 是定理 2 的非正式版本；全部假设在定理陈述中给出，证明依赖的结果均有引用。
4. **实验结果可复现性。** 问：论文是否充分披露复现主要实验结果所需的信息？答：**是**。理由：实验信息主要在第 5 节，更多信息见附录 D；另提供含代码的 GitHub。
5. **数据与代码的开放获取。** 问：论文是否以足够说明提供数据与代码的开放获取？答：**是**。理由：将发布包含全部代码与复现说明的 GitHub 仓库。
6. **实验设置/细节。** 问：论文是否规定了全部训练与测试细节（数据划分、超参数、模型选择等）？答：**是**。理由：主要实验设置见第 5 节，详细设置见附录 D。
7. **实验统计显著性。** 问：论文是否恰当报告误差棒或给出其定义？答：**是**。理由：相应的箱线图与置信区间见图 4–6 与附录 D。
8. **实验计算资源。** 问：每个实验的计算资源信息是否充分？答：**是**。理由：信息见附录 D；论文未使用超出常规的资源。
9. **伦理准则。** 问：研究是否在各方面符合 NeurIPS 伦理准则？答：**是**。理由：已核对伦理准则，本文符合其各项要求。
10. **更广泛影响。** 问：论文是否讨论潜在正面与负面社会影响？答：**是**。理由：本文为机器学习问题发展严格的置信区间框架，重点在医学成像等关键应用中的可靠性。
11. **防护措施。** 问：论文是否描述了负责任部署所需的防护措施？答：**不适用**。理由：本文发展机器学习问题的置信区间，不涉及高风险部署的具体防护。
12. **既有资产的许可。** 问：所用资产（代码、数据、模型）的创建者是否被正确引用与致谢？答：**是**。理由：使用了 NYU fastMRI 数据集 [74, 75]，并按原始要求引用。
13. **新资产。** 问：论文引入的新资产是否有充分文档？答：**是**。理由：唯一新资产是我们的代码，随论文作为补充材料提供。
14. **众包与人类受试者研究。** 问：论文是否包含给参与者的完整说明、截图及报酬细节？答：**不适用**。理由：实验基于公开的 NYU fastMRI 数据集 [74, 75]，不涉众包或人类受试者。
15. **伦理审查委员会（IRB）批准。** 问：论文是否描述了研究参与者可能承受的风险、是否已告知，以及是否获得 IRB 或等效批准？答：**不适用**。理由：本文为理论研究（但对医学图像领域可能有重大影响），所用图像均为公开且匿名化的，无需 IRB 或等效批准。

**原文插图：** 原 PDF 中的图 1–9 未重传至本页，仅保留中文图注与图中关键标注；全部原图可查阅 NeurIPS 2024 正式版本。

---

**本页范围与校对状态：** 本页依据本地会议论文集 PDF（NeurIPS 2024 出版版本，32 页）作中文全译：摘要、正文第 1–6 节（含 5.1–5.2 与局限）、致谢、参考书目 89 条英文原条目，补充材料 A–E（含表 1–3、图 1–9 图注）、算法 1–2、定理 1–4 与 NeurIPS 论文清单 15 项；含公式 (1)–(9)。**再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。****逐句终校未做**：表 1、表 2、表 3 均已用 PDF 页面渲染逐格核对（表 1 的 14 行指标 × 6 个设定、表 2/3 的 14 行 × 6 个设定）；定理 2–4、算法 1–2 与式 (1)–(9) 已对照页面文本层核对；补充材料 B 中两定理证明按原文推导链译出关键不等式（Rice 分布积分与经验 Chebyshev 界），但极长中间步骤未逐行重排；NeurIPS 清单的模板通用 Guidelines 为固定文本，已注明从略。页内 1 条“原文疑点”加注：式 (4) 中余项系数正文写作 $c_l(\alpha)$，而其定义在 $c_l(\cdot)$ 内部已含 $(1-\gamma_j)$（算法 1 写作 $c_l((1-\gamma)\alpha)$），正文与算法的自变量记号不一致，按定义应理解为 $c_l((1-\gamma_j)\alpha)$。均按原文照录并说明，未作数值或表述改动。

{% endraw %}
