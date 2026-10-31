---
layout: page
title: "等变即插即用图像重建｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-04-equivariant-plug-and-play-image-reconstruction/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/9b1a38cae9b994ed/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# 等变即插即用图像重建

**原题：** Equivariant Plug-and-Play Image Reconstruction  
**作者：** Matthieu Terris、Thomas Moreau、Nelly Pustelnik、Julian Tachella  
**单位：** Matthieu Terris 与 Thomas Moreau 就职于巴黎-萨克雷大学 / Inria / CEA（Université Paris-Saclay, Inria, CEA），法国帕莱索 91120；Nelly Pustelnik 与 Julian Tachella 就职于里昂高等师范学校（ENSL）与法国国家科研中心（CNRS）UMR 5672，法国里昂 69342。  
**版本：** 会议论文集版本（Terris_Equivariant_Plug-and-Play_Image_Reconstruction_CVPR_2024_paper.pdf，https://openaccess.thecvf.com/content/CVPR2024/html/Terris_Eq），本地 PDF 10 页，正文页码 25255—25264；CVPR 2024。再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、第 1—7 节（含第 3.1 节、第 4.1 节、第 5.1—5.4 节）、致谢、图 1—10 中文图注、表 1—4 逐格转录、参考文献 [1]—[54]（英文原条目，按原编号）均按原文结构录入；编号公式 (1)—(6) 与 (PnP)(RED)(ULA) 更新式按原文保留。原文为 CVPR 2024 Open Access 版本（页脚说明：除水印外与录用版一致，最终版见 IEEE Xplore），版权与再传播许可待核验，故本页不作可公开全文登记。逐句逐式终校未做。

## 摘要

即插即用（plug-and-play, PnP）算法构成求解逆成像问题的流行框架，它通过**去噪器**隐式地定义图像先验。这类算法可以利用强大的预训练去噪器求解广泛的成像任务，从而避免针对每个任务单独训练模型。遗憾的是，PnP 方法常表现出不稳定行为，妨碍其"通用性"的承诺，并导致重建图像质量欠佳。本文表明，对去噪器施加对某些变换群（旋转、反射和/或平移）的**等变性（equivariance）**，会显著提升算法的稳定性与重建质量。我们给出了理论分析，说明等变性在更好性能与稳定性中的作用；并给出一个简单算法：在算法的每次迭代中，对去噪器输入施加随机变换、对输出施加逆变换，即可对任意现有去噪器施加等变性。在多种成像模态与去噪网络上的实验表明，等变 PnP 算法相对非等变对应物同时改善了重建性能与稳定性。

## 1. 引言

线性逆成像问题在成像科学中无处不在，著名例子包括图像复原、磁共振成像（MRI）、计算机断层扫描与天文成像等。该设定下，目标是从经由

$$
\mathbf y=\mathbf A\mathbf x+\boldsymbol\epsilon\tag{1}
$$

获取的测量 $\mathbf y\in\mathbb R^m$ 中恢复图像 $\mathbf x\in\mathbb R^n$，其中 $\mathbf A:\mathbb R^n\to\mathbb R^m$ 为线性算子、$\boldsymbol\epsilon$ 为某随机噪声的实现。文献中已提出大量求解（1）类问题的方法，从变分方法 [6, 12]（求解代价函数最小化问题）到用深度神经网络端到端重建 [19, 22, 52]，以及近期的扩散算法 [9, 14, 21, 54]。

本文关注依赖**隐式去噪先验**的方法。例如，即插即用（PnP）算法 [20, 35, 45, 50] 提议把变分方法（由近端算法求解）中涉及的近端算子替换为对隐式图像先验建模的去噪器；类似地，去噪正则化（regularization-by-denoising, RED）方法提议用去噪器替换先验项的梯度步 [33]。虽然去噪器通常是以灰度或彩色自然图像训练的**高斯去噪器**，但它可以被插入到面向广泛图像相关问题（如 MRI 图像、CT 扫描等）的算法中，而不受输入图像性质的约束 [1, 26, 39, 43]。

然而，尽管在各种应用中取得成功的性能，这类算法往往存在**不稳定**问题，使其难以跨成像任务迁移，也难以从重建结果中推导统计估计。特别地，RED 与 PnP 算法常常需要仔细微调 [27, 32]，或偏离原优化算法才能高效应用 [10, 50]。因此已有若干工作致力于在建立与相关代价函数清晰联系的同时恢复 PnP/RED 算法的收敛性 [10, 17, 30, 35, 42]。但这些努力对去噪器引入了显著约束，导致**稳定性与重建性能之间的折中**：收敛的 PnP/RED 算法通常容易迁移到新问题，但性能不如经过微调、提前终止的非收敛对应物。

本文从理论与实证两方面研究等变性对依赖隐式去噪先验的算法的影响。更精确地说，我们证明对去噪器施加等变性会提升所得 PnP 算法的稳定性，并对隐式先验的 Jacobian 起到**对称化**作用。实验表明，所提等变方法能显著提升用 PnP 算法重建的图像质量，也提升使用 RED 或 Langevin 等流行算法框架时的质量。图 1 概述了所提方法在依赖隐式去噪先验的流行算法上提供的可能性。

（图 1、图 2 见"图注"一节。）

## 2. 相关工作

**稳定的即插即用算法。** 近期有大量工作致力于提供稳定的 PnP 算法。其中一个流行方向是约束去噪器架构，以保证其插入 PnP 方案时的稳定性：一些方法在去噪器训练损失中加入惩罚 Lipschitz 常数的正则项 [30, 35]，并可结合架构约束 [17, 42]；另一些工作则修改优化算法本身以保证稳定性 [10, 18, 27, 50]。保证算法收敛又能带来更好的跨成像任务迁移性 [43]，并支持迭代密集任务（如从后验分布采样 [23]）。然而，上述所有方法都以算法修改或对去噪器设计的强约束为代价，与原始的、去噪器无关的方法 [33, 45] 相对。

**成像逆问题中的等变性。** 在设计手工变分先验时，旋转、平移等变换下的等变性常是被期望的性质 [13, 36, 37]。几何集成（geometric ensembling）技术已在计算机视觉文献中为人所知，并被证明能改善图像超分辨的重建质量 [44]。对线性去噪器，Jacobian 的对称化已被证明能提升其性能 [28]。然而，除 [43, 50] 等个别例外，该策略在 PnP 文献中并未受到关注；据我们所知，等变性的作用尚未在依赖隐式去噪先验的算法背景下得到研究。在另一条但同样属于成像逆问题的工作线中，近期研究利用等变性设计展开（unrolled）网络架构 [5]，或构造自监督学习损失 [7]（如参见综述 [8]）。

**等变神经网络。** 更一般地，底层先验的不变性在大量应用中都是自然假设，构建等变神经网络架构的文献十分丰富 [4, 11, 47]。典型应用包括球面流形上的分割、机器人学、点云分析、数据增广等 [7, 15, 29, 34, 46, 53]。然而这些网络往往性能不及其他最先进架构；此外，加入复杂层（如上/下采样、类注意力层等）时很难不破坏最终网络的等变性。本文提供一种简单方法，可在**不加任何架构约束**的情况下使任意去噪器等变。

## 3. PnP 算法

求解（1）的传统变分方法把其重构为最小化问题。按最大后验方法，可得估计

$$
\hat{\mathbf x}=\arg\min_{\mathbf x}\ f(\mathbf x)+\lambda r(\mathbf x)\tag{2}
$$

其中 $f$ 为数据保真项、$r$ 为编码解的已知先验知识的正则项、$\lambda>0$ 为正则化参数。

PnP 方法提议把求解（2）的算法中出现的 $r$ 的近端算子 [2]（隐式梯度步）替换为去噪器 $\mathbf D$ [45]。对二次数据保真项 $f(\mathbf x)=\frac12\|\mathbf A\mathbf x-\mathbf y\|_2^2$ 的标准情形，经典 PnP 算法为

$$
\mathbf x_{k+1}=\mathbf D\left(\mathbf x_k-\gamma\mathbf A^\top(\mathbf A\mathbf x_k-\mathbf y)\right)\qquad\text{(PnP)}
$$

其中 $\gamma>0$ 为步长。

类似地，去噪正则化（RED）算法利用 Tweedie 公式 [33] 把 $r$ 的梯度近似为 $\nabla r(\mathbf x)\propto\mathbf x-\mathbf D(\mathbf x)$。基于该定义的简单显式梯度下降优化给出

$$
\mathbf x_{k+1}=\mathbf x_k-\gamma\mathbf A^\top(\mathbf A\mathbf x_k-\mathbf y)-\lambda\gamma\left(\mathbf x_k-\mathbf D(\mathbf x_k)\right).\qquad\text{(RED)}
$$

我们还考虑非调整 Langevin 算法（unadjusted Langevin algorithm, ULA）[23]，它旨在获得与负对数后验密度 $-\log p(\mathbf x\mid\mathbf y)\propto f(\mathbf x)+\lambda r(\mathbf x)$ 相关的样本，需要在 (RED) 的迭代中加入噪声，即

$$
\mathbf x_{k+1}=\mathbf x_k-\gamma\mathbf A^\top(\mathbf A\mathbf x_k-\mathbf y)-\lambda\gamma\left(\mathbf x_k-\mathbf D(\mathbf x_k)\right)+\sqrt{2\gamma}\,\boldsymbol\epsilon_k,\qquad\text{(ULA)}
$$

其中 $\boldsymbol\epsilon_k\sim\mathcal N(0,\mathbf I)$ 为标准高斯向量。

虽然 (PnP)、(RED)、(ULA) 存在许多不同变体，本文聚焦其最标准的形式。有趣的是，这些算法在依赖与具体成像模态无关的高斯去噪器的同时，在广泛成像任务上展现了出色性能；然而它们缺乏稳定性、存在潜在发散效应，损害了其通用性。

### 3.1 所提等变方法

直观上，成像先验应对某些变换群（如旋转、平移与反射）具有不变性。我们把群 $G$ 对应的变换记为 $\{T_g\}_{g\in G}$，其中 $T_g\in\mathbb R^{n\times n}$ 为**酉矩阵**（平移、旋转与图像反射均属此情形）。若对所有 $\mathbf x$ 与 $g\in G$ 有 $\mathbf D(T_g\mathbf x)=T_g\mathbf D(\mathbf x)$，则称 $\mathbf D$ 对群作用 $\{T_g\}_{g\in G}$ 等变。在算法层面，该要求转化为去噪器对感兴趣变换的等变性：若 $r(\mathbf x)$ 为 $G$-不变函数，则其近端算子与梯度（若存在）必为 $G$-等变函数 [5]。

使任意函数 $G$-等变的一个简单办法是在群上取平均。相应的平均去噪器

$$
\mathbf D_G(\mathbf x)\overset{\text{def}}{=}\frac{1}{|G|}\sum_{g\in G}T_g^{-1}\mathbf D(T_g\mathbf x)\tag{3}
$$

按构造即等变。对较大的群或较大的去噪架构 $\mathbf D$，计算平均去噪器可能计算量过大。然而本文提出用简单的**蒙特卡洛近似**：在算法的每一步只采样一个变换，即

$$
g\sim G,\qquad\widetilde{\mathbf D}_G(\mathbf x)=T_g^{-1}\mathbf D(T_g\mathbf x).\tag{4}
$$

于是 (PnP)、(RED)、(ULA) 的等变对应物只需在每次迭代中用蒙特卡洛估计（4）的一个样本来替换去噪器 $\mathbf D$。这些算法的显式形式见补充材料（SM）。

## 4. 理论分析

本节从理论上分析等变去噪器相对非等变对应物在性能与稳定性方面的优势。本节记去噪器的 Jacobian 为 $\mathbf J_{\mathbf x}\overset{\text{def}}{=}\nabla_{\mathbf x}\mathbf D(\mathbf x)$（即 $\partial\mathbf D/\partial\mathbf x(\mathbf x)$）。

**等变去噪器的最优性。** 我们首先表明：若信号分布是 $G$-不变的，则对任意去噪器 $\mathbf D$，其平均版本（3）取得相等或更好的去噪性能。这可通过计算关于信号与噪声分布的期望 $\ell_2$ 误差看出：

$$
\mathbb E\left\|\frac{1}{|G|}\sum_{g\in G}T_g^{-1}\mathbf D\left(T_g(\mathbf x+\boldsymbol\epsilon)\right)-\mathbf x\right\|\leqslant\frac{1}{|G|}\sum_{g\in G}\mathbb E\left\|T_g^{-1}\mathbf D\left(T_g(\mathbf x+\boldsymbol\epsilon)\right)-\mathbf x\right\|\leqslant\frac{1}{|G|}\sum_{g\in G}\mathbb E\left\|T_g^{-1}\mathbf D\left(T_gT_g^{-1}(\mathbf x+\boldsymbol\epsilon)\right)-T_g^{-1}\mathbf x\right\|\leqslant\mathbb E\left\|\mathbf D(\mathbf x+\boldsymbol\epsilon)-\mathbf x\right\|,
$$

其中期望对 $\mathbf x$ 与 $\boldsymbol\epsilon$ 取；第二行用三角不等式，第三行用到 (i) 当 $\mathbf x$ 与 $\boldsymbol\epsilon$ 的分布 $G$-不变时，对任意函数 $h:\mathbb R^n\mapsto\mathbb R$ 与群作用中的 $T_g$ 有 $\mathbb E h(\mathbf x)=\mathbb E h(T_g^{-1}\mathbf x)$，以及 (ii) 变换 $T_g$ 为等距。

**显式先验的存在性。** 去噪器能与显式（PnP 或 RED）先验相关联的必要条件是**Jacobian 对称**，即 $\mathbf J_{\mathbf x}=\mathbf J_{\mathbf x}^\top$，见 [31, 定理 1]。遗憾的是，多数最先进去噪器不具备该性质。在足够大的群上做平均可导致对称 Jacobian。特别地，若去噪器为线性且 $G$ 包含平移与反射，则去噪器**必定**具有对称 Jacobian：

**命题 1.** 任何对二维平移以及垂直与水平反射的群作用等变的线性去噪器 $\mathbf D$，其 Jacobian 对称。

**证明：** 设 $\mathbf D_G(\mathbf x)=\mathbf M\mathbf x$，Jacobian 为 $\mathbf M\in\mathbb R^{n\times n}$。对二维平移作用等变的矩阵 $\mathbf M$ 具有循环（circulant）形式，即 $\mathbf M=\operatorname{circ}(\mathbf d)$，其中 $\mathbf d\in\mathbb R^n$ 为滤波器。于是转置 Jacobian 也是循环矩阵 $\mathbf M^\top=\operatorname{circ}(\mathbf d')$，$\mathbf d'\in\mathbb R^n$ 为转置滤波器。由于 $\mathbf D$ 还对垂直与水平反射等变，$\mathbf d$ 为偶实向量，从而 $\mathbf M=\mathbf M^\top$。

虽然该结果只适用于线性去噪器，非线性去噪器的对称性在加入等变性后同样会改善：表 1 给出若干流行非线性去噪器在 10 个不同 $64\times64$ 图像块上平均后的相对对称误差 $\|\mathbf J_{\mathbf x}-\mathbf J_{\mathbf x}^\top\|_F^2/\|\mathbf J_{\mathbf x}\|_F^2$，$G$-等变去噪器 $\mathbf D_G$ 的误差显著小于非等变对应物。

**去噪器的 Lipschitz 常数。** PnP 算法的稳定性关键取决于去噪器的 Lipschitz 常数 [20, 35]。例如，若去噪器 Lipschitz 常数小于 1，则在合适步长下 (PnP) 与 (RED) 的迭代均收敛。由于两个映射之和的 Lipschitz 常数小于等于二者 Lipschitz 常数之和，平均等变去噪器的 Lipschitz 常数必然小于等于非等变者的常数。若限于线性去噪器，还可证明：只要主奇异向量不等变，等变去噪器的常数严格更小：

**命题 2.** 设 $\mathbf D(\mathbf x)=\mathbf M\mathbf x$ 为线性去噪器，其奇异值分解为 $\mathbf M=\sum_{i=1}^n\lambda_i\mathbf u_i\mathbf v_i^\top$，$\lambda_1>\lambda_2\geqslant\cdots\geqslant\lambda_n\geqslant0$。若主成分 $\mathbf u_1\mathbf v_1^\top$ 非 $G$-等变，则平均去噪器 $\mathbf D_G$ 的 Lipschitz 常数严格小于 $\mathbf D$ 的 Lipschitz 常数。

**证明：** 对任意 $p$ 个矩阵 $\mathbf A_1,\ldots,\mathbf A_p$，$\left\|\frac1p\sum_{g=1}^p\mathbf A_g\right\|=\frac1p\sum_{g=1}^p\|\mathbf A_g\|$ 当且仅当所有矩阵共享相同的主左右奇异向量。$G$-平均去噪器可写为 $\mathbf D_G=\frac{1}{|G|}\sum_{g=1}^{|G|}\mathbf A_g$，其中 $\mathbf A_g:=T_g\mathbf MT_g^{-1}$。由于奇异向量定义为 $\mathbf u_i'=T_g\mathbf u_i$、$\mathbf v_i'=T_g\mathbf v_i$（$i=1,\ldots,n$），$\mathbf A_g$ 与 $\mathbf M$ 具有相同奇异值。因为 $\mathbf u_1\mathbf v_1^\top$ 不等变，存在某个 $g\in G$ 使 $T_g\mathbf u_1\mathbf v_1^\top T_g^{-1}\neq\mathbf u_1\mathbf v_1$；于是求和 $\sum_gT_g\mathbf MT_g^{-1}$ 中至少有两项不共享相同主奇异向量，从而 $\|\mathbf M\|>\left\|\frac{1}{|G|}\sum_gT_g\mathbf MT_g^{-1}\right\|$。$\square$

实践中，我们观察到多数流行非线性去噪器的常数显著更小：表 2 给出若干去噪器在 10 个不同 $64\times64$ 图像块上平均的局部 Lipschitz 常数（即 Jacobian 的谱范数），平均去噪器可具有显著更小的常数。

**群作用与前向算子的相互作用。** 目前为止我们关注等变去噪器相关性质；然而 $\mathbf A$ 的（缺乏）等变性同样对 PnP 的收敛起重要作用。(PnP) 的迭代即使在去噪器 Lipschitz 常数大于 1 时也可能收敛，只要复合映射

$$
\mathbf D\circ\left(\mathbf I-\gamma\mathbf A^\top\mathbf A\right)\tag{5}
$$

的 Lipschitz 常数小于 1。若 $\mathbf A^\top\mathbf A$ 与 $\mathbf D$ 的谱**不相干**，即 $\mathbf A^\top\mathbf A$ 与去噪器 Jacobian 在不同基下对角化，则（5）的 Lipschitz 常数可能小于 $\mathbf D$ 的常数。由于前向算子谱与等变去噪器谱之间的不相干性，(RED) 与 (ULA) 迭代也出现类似的稳定化现象。下述命题以线性去噪器形式化该直觉：

**命题 3.** 设 $\mathbf x$ 为灰度图像，$\{T_g\}_{g\in G}$ 为包含二维平移的变换群，$\mathbf D_G$ 为线性 $G$-等变去噪器。若 $\mathbf A^\top\mathbf A$ 非 $G$-等变，则它不与 $\mathbf D$ 的 Jacobian 共享相同奇异向量。

**证明：** 设 $\mathbf D(\mathbf x)=\mathbf M\mathbf x$、Jacobian 为 $\mathbf M\in\mathbb R^{n\times n}$。矩阵 $\mathbf B\in\mathbb R^{n\times n}$ 对二维平移作用 $G$-等变，当且仅当它可对角分解为 $\mathbf B=\mathbf F\operatorname{diag}(\mathbf d)\mathbf F^*$，其中 $\mathbf F$ 为二维 Fourier 变换（见 [40, 第 4.1 节]）。因此若 $\mathbf D$ 为 $G$-等变，则 $\mathbf M$ 在 Fourier 域对角，而非等变的 $\mathbf A^\top\mathbf A$ 不具有这样的对角化。$\square$

表 3 给出映射（5）在若干流行非线性去噪器下的局部 Lipschitz 常数，其中 $\mathbf A$ 为随机 inpaint 算子（它对平移、旋转与反射都不等变）。这些常数小于表 2 中的值且低于 1，从而保证该特定算子下 PnP 迭代的收缩性；等变去噪器的常数小于非等变对应物。

### 4.1 非线性示例

我们用单隐层神经网络去噪器演示前一小节分析的部分性质。更精确地说，考虑 $\mathbf D$ 为近端算子的轻微扰动，即

$$
\mathbf D(\mathbf x)=\mathbf B_2\operatorname{prox}_{\lambda\|\cdot\|_1}(\mathbf B_1\mathbf x)\tag{6}
$$

其中 $\mathbf B_1\in\mathbb R^{n\times n}$ 满足 $\mathbf B_1\mathbf B_1^\top=\mathbf B_1^\top\mathbf B_1=\mathbf I$，$\mathbf B_2=(\mathbf B_1^\top+\mathbf P)$，$\mathbf P\in\mathbb R^{n\times n}$ 为小幅随机扰动。特别地，若 $\mathbf P=\mathbf 0$，则该去噪器是良定义的近端算子，即 $\mathbf D(\mathbf x)=\operatorname{prox}_{\lambda\|\mathbf B_1\cdot\|_1}(\mathbf x)$，对应良定义的先验 $r(\mathbf x)=\|\mathbf B_1\mathbf x\|_1$。我们强调，当 $\mathbf P\neq\mathbf 0$ 时，先验上并不存在与（6）中去噪器生成的 (PnP) 迭代相对应的损失函数 $g$。此外，假设 $\mathbf B_1$ 是 $G$-等变的。

利用 $\mathbf B_1$ 与 $\operatorname{prox}_{\lambda\|\cdot\|_1}$ 是 $G$-等变函数这一事实，可写出 $G$-等变去噪器（详细推导见 SM）：

$$
\mathbf D_G(\mathbf x)=\left(\mathbf B_1^\top+\mathbf P_G\right)\operatorname{prox}_{\lambda\|\cdot\|_1}(\mathbf B_1\mathbf x),
$$

其中 $\mathbf P_G=\frac{1}{|G|}\sum_{g\in G}T_g^{-1}\mathbf P T_g$ 为 $G$-平均扰动。若原扰动不等变，则 $0\leqslant\|\mathbf P_G\|_F^2<\|\mathbf P\|_F^2$，等变去噪器将更接近近端算子 $\operatorname{prox}_{\lambda\|\mathbf B_1\cdot\|_1}(\mathbf x)$。图 2 在二维玩具示例中展示了两种具体 $\mathbf A$ 选择下 (PnP) 序列在含/不含（3）中群平均时的行为，其中 $G$ 为翻转群（详见 SM）：两种情形下，含等变去噪器的算法都收敛到接近先验 $-\lambda r(\mathbf x)=-\lambda\|\mathbf B_1\mathbf x\|_1$ 全局最小值的点，而非等变算法生成的序列发散。

## 5. 实验结果

本节评估所提等变方法对不同算法与线性逆成像问题的影响。我们的实现基于 DeepInverse 库 [41]。

### 5.1 所考虑的问题

**图像去模糊与超分辨。** 该设定中，取（1）的 $\mathbf y=\mathbf h\ast\mathbf x+\boldsymbol\epsilon$，$\mathbf h$ 为卷积核、$\ast$ 为循环卷积。我们考虑高斯去模糊（$\mathbf h$ 为标准差 1 的高斯核）与运动去模糊（$\mathbf h$ 为 [24] 中的第一个核）。除特别说明外，$\boldsymbol\epsilon$ 为标准差 0.01 的高斯噪声。图像超分辨（SR）设定中，（1）写作 $\mathbf y=(\mathbf h\ast\mathbf x)\downarrow_S+\boldsymbol\epsilon$，$\mathbf h$ 为标准差 1 的高斯核、$S$ 为下采样因子；$S=2$（对应 $S=4$）时 $\boldsymbol\epsilon$ 为标准差 0.01（对应 0.05）的高斯噪声。我们在 Set3C 数据集与 BSD10 数据集（BSD68 的一个 10 图子集）上测试所提方法。

**MRI。** 该设定中考虑（1）的 $\mathbf y=\mathbf M\mathbf F\mathbf x$，$\mathbf M$ 为二值掩码、$\mathbf F$ 为二维 Fourier 变换。沿用 [48]，我们考虑 $\times4$ 与 $\times8$ 加速因子；与前一问题不同，此处不向测量加噪。方法在 [48] 全采样 k 空间数据验证集的 10 图子集上测试。

**算法与骨干去噪器。** 我们考虑若干骨干预训练去噪器，即 DRUNet [50]、SCUNet [51]、SwinIR [25]、DiffUNet [16]、DnCNN [49] 及其 1-Lipschitz 版本（LipDnCNN，来自 [30]）以及梯度步去噪器 GSNet [17]。这些架构代表了最先进图像重建架构，涵盖卷积与注意力层。我们强调，除 DnCNN 表现出近似平移等变外，这些网络对平移或旋转均不等变。骨干去噪器的选择可能影响所选算法：例如本文依赖的 DnCNN 与 SwinIR 去噪器针对固定噪声水平训练，限制了算法微调能力；此外 DiffUNet 与 SCUNet 架构只能用于彩色图像，因此在 MRI 问题上无法使用。除特别说明外，每个算法运行 $10^4$ 次迭代。

**基线。** 本文主要研究等变先验对 PnP 算法稳定性的影响，因此把所提方法与可视为一类收敛 PnP 算法的变分方法比较。具体地，我们使用小波去噪器（即 $\mathbf D(\mathbf x)=\operatorname{prox}_{\lambda\|\cdot\|_1}(\mathbf x)$，$\Psi$ 为冗余小波字典）以及总广义变分（TGV）去噪器 [3]。带 Lipschitz 去噪器的 (PnP) 算法对应 [30] 的方法，它保证 (PnP) 算法收敛。我们还将方法与非收敛、微调 PnP 的代表——最先进的 DPIR 算法 [50] 比较：DPIR 运行少量步数的半二次分裂算法并使用微调的衰减步长。此外与梯度步 PnP 算法 [17] 比较，它利用非凸隐式先验与回溯，代表最先进的收敛 PnP 算法。

### 5.2 PnP 与 RED 算法的稳定性

PnP 算法的不稳定性常表现为重建图像中的不真实伪影。图 3 展示了该现象，并表明所提方法能够规避这一缺陷。

图 4 给出不同问题与骨干架构下 PSNR 与收敛判据 $\|\mathbf x_{k+1}-\mathbf x_k\|/\|\mathbf x_k\|$ 的演化。对这些问题中的每一个，(PnP) 中的去噪水平 $\sigma$ 对 DnCNN（对应 DRUNet）骨干设为 $\sigma=0.01$（对应 $\sigma=0.015$）。我们看到，含等变去噪器的 (PnP) 算法在迭代中 PSNR 比非等变对应物更稳定。特别地，从图 4 右栏可观察到，$G$-等变 DnCNN 的 (PnP) 算法收敛速率与 Lipschitz 去噪器算法的行为相匹配。最后，我们注意到所提等变方法同样有益于依赖 Lipschitz 骨干去噪器的收敛 (PnP) 算法。我们进一步强调，用等变蒙特卡洛估计得到的重建与用确定性 Reynolds 平均得到的重建一致（见表 5）。

对 (RED) 算法，我们观察到类似行为。$\times2$ SR 问题上的重建见图 6，相应收敛曲线见图 7。对非等变 DRUNet 骨干，重建图像出现明显几何伪影，而在等变情形这些伪影消失。

不过我们强调，所提方法在某些设定下可能无法稳定算法。例如对 SCUNet 骨干去噪器，无论 (PnP) 算法的经典版本还是等变版本，从第 50 次迭代起重建中都会出现强烈伪影（见图 5）。类似地，我们未观察到 DiffUNet 骨干下 (RED) 算法的收敛，因此需要提前终止算法才能获得良好重建结果。

最后，若干研究表明噪声水平 $\sigma$ 对 PnP 算法稳定性起重要作用：增大 $\sigma$ 可能有助于解决不稳定问题，但代价是重建过度平滑。

### 5.3 与前向算子核的相互作用

前文中我们看到等变去噪器可防止 (PnP) 迭代中出现伪影。尽管这些伪影在视觉上不自然，它们并不与良好的数据保真度量矛盾。事实上，PnP 算法完全不控制 $\ker(\mathbf A)$，而由于逆问题（1）的欠定性，该空间本质上是非平凡的；因此重建过程中出现的伪影很可能属于 $\ker(\mathbf A)$。

该现象可在 MRI 情形中说明：$\ker(\mathbf A)$ 对应 Fourier 域中未采样的子空间。此时 $\mathbf A$ 不是旋转等变的，而命题 3 提示对先验施加等变性可改善稳定性。图 8 展示了含与不含所提等变算法更新的重建：在标准（非等变）设定下，第 $i=10^3$ 与 $j=10^4$ 次迭代之间出现轻微伪影；这些伪影在 $\mathbf x_j$ 中可能不易察觉，但绘制差值 $\mathbf x_j-\mathbf x_i$ 时清晰可见。有趣的是，这些伪影的 Fourier 谱在未采样频率处能量显著更高。等变算法的同一实验不出现此类伪影，Fourier 谱也更均匀。

### 5.4 从 RED 先验采样

所提方法带来的稳定性提升，为依赖隐式去噪先验的更稳健采样算法（如 (ULA)）打开了大门——这类算法需要足够多的迭代次数才能获得良好估计。图 9 给出用 (ULA) 算法、以等变与非等变 DRUNet 骨干得到的估计均值与方差：在非等变设定下，我们在估计均值与方差上都观察到与确定性情形类似的伪影；这些伪影在等变情形消失。

图 10 最左图进一步说明该现象：我们注意到，经过数百次迭代后，非等变 (ULA) 算法的重建质量崩溃，得到无意义的 MCMC 链；强制等变性可改善该情形，而在 (PnP) 中增大去噪器的噪声水平能显著改善局面（见图 10 最右图）。

## 6. 局限

虽然实验表明所提方法在算法稳定性与重建图像质量上都优于非等变对应物，我们强调它仍可能发散和/或产生幻觉伪影。例如可见图 4 中 DRUNet 骨干的情形：在若干次迭代后平均 PSNR 下降；或图 5 中 SCUNet 骨干的情形：出现严重重建伪影。特别地，使用 SCUNet 骨干时，所提等变方法相对非等变对应物并无明显改善。

## 7. 结论

本文针对隐式去噪先验提出一种简单而有效的近似等变方法。本质上，该方法在算法每一步随机采样并施加一个群作用。尽管简单，该方法展现出有趣的理论性质：例如对线性去噪器，它可强制 Jacobian 对称——这是从隐式去噪先验推导显式先验时的基石性质。此外可以证明，等变线性去噪器的 Lipschitz 常数只会低于其非等变对应物，从而改善所得 PnP 算法的稳定性。我们展示了等变性对多种架构 Jacobian 的对称化作用，并说明其对三类成像算法（PnP、RED、ULA）的稳定化效果。重要的是，与文献中常见情况不同，这一稳定化过程**不会损害重建质量**。然而，尽管等变性在稳定性与图像重建质量方面带来显著改善，所提方法仍可能发散、并在重建中受到伪影污染。

## 致谢

本工作受 BrAIN 项目（ANR-20-CHIA-0016）资助，并通过 GENCI 分配的 2023-AD011014344 获得 IDRIS 的 HPC 资源。J. T. 受 ANR 的 JCJC 项目 UNLIP 资助。

## 图注与表注

### 表 1：Jacobian 对称性误差（原 PDF 第 4 页）

表 1 给出若干去噪器在 10 个不同 $64\times64$ 图像块上的平均 Jacobian 对称误差 $\|\mathbf J_{\mathbf x}-\mathbf J_{\mathbf x}^\top\|_F^2/\|\mathbf J_{\mathbf x}\|_F^2$；等变去噪器通过在 90 度旋转与反射群上平均得到。

| Lipschitz | DnCNN | DnCNN（$\sigma_d=0.01$） | SCUNet | SwinIR | DRUNet |
|---|---|---|---|---|---|
| Standard $\mathbf D$ | 0.014 | 0.022 | 0.954 | 0.604 | 0.030 |
| Equivariant $\mathbf D_G$ | 0.003 | 0.005 | 0.710 | 0.291 | 0.008 |

### 表 2：去噪器的局部 Lipschitz 常数（原 PDF 第 4 页）

在 16 个图像块上平均的局部 Lipschitz 常数；等变去噪器在 90 度旋转与反射群上平均得到。

| Lipschitz | DnCNN | DnCNN（$\sigma_d=0.01$） | SCUNet | SwinIR | DRUNet |
|---|---|---|---|---|---|
| Standard $\mathbf D$ | 1.06 | 1.44 | 5.78 | 6.28 | 1.57 |
| Equivariant $\mathbf D_G$ | 0.92 | 1.18 | 4.19 | 4.05 | 1.26 |

### 表 3：PnP 迭代的局部 Lipschitz 常数（原 PDF 第 5 页）

表 3 给出映射 $\|\mathbf J_{\mathbf x}(\mathbf I-\mathbf A^\top\mathbf A)\|$ 的局部 Lipschitz 常数，其中 $\mathbf A$ 为随机 inpaint 算子；等变去噪器在 90 度旋转与反射群上平均得到。

| Lipschitz | DnCNN | DnCNN（$\sigma_d=0.01$） | SCUNet | SwinIR | DRUNet |
|---|---|---|---|---|---|
| Standard | 0.91 | 0.91 | 0.62 | 0.69 | 0.83 |
| Equivariant | 0.79 | 0.78 | 0.52 | 0.67 | 0.70 |

### 表 4：不同图像复原任务下 (PnP) 的平均重建 PSNR（原 PDF 第 6 页）

表 4 给出使用不同骨干去噪器的 (PnP) 算法在多种图像复原问题上的平均重建 PSNR（dB）。第 1、3、5 行为非等变去噪器（LipDnCNN、DnCNN、DRUNet）的结果，第 2、4、6 行为其等变对应物（Eq. LipDnCNN、Eq. DnCNN、Eq. DRUNet）；底部四行为标准重建方法的基准。"div." 表示该方法发散。

| 方法 | Deblur (motion) Set3C | Deblur (motion) BSD10 | Deblur (Gaussian) Set3C | Deblur (Gaussian) BSD10 | MRI $\times4$ | MRI $\times8$ |
|---|---|---|---|---|---|---|
| LipDnCNN [30] | 31.7±2.0 | 30.9±0.7 | 32.1±2.5 | 32.6±0.9 | 30.6±2.6 | 26.4±2.3 |
| Eq. LipDnCNN | 31.8±2.0 | 31.1±0.6 | 32.1±2.5 | 32.7±0.9 | 30.7±2.7 | 26.6±2.2 |
| DnCNN | 29.9±1.9 | 30.4±0.3 | 22.0±6.0 | 29.6±4.6 | 28.6±4.3 | div. |
| Eq. DnCNN | 30.7±1.6 | 30.9±0.1 | 29.8±3.1 | 33.0±0.6 | 30.1±3.9 | 24.6±2.9 |
| DRUNet | 10.1±1.5 | 16.5±9.8 | 14.6±8.8 | 17.5±10.5 | 27.7±4.0 | 16.9±8.6 |
| Eq. DRUNet | 18.0±6.0 | 28.4±2.3 | 25.3±10.1 | 31.9±1.1 | 30.7±3.0 | 22.0±6.0 |
| wavelets | 29.6±2.0 | 27.2±1.0 | 31.2±2.5 | 30.9±0.8 | 28.6±2.1 | 25.4±1.8 |
| TGV | 29.2±2.1 | 26.7±1.3 | 30.7±2.5 | 30.5±0.9 | 28.5±2.3 | 24.8±2.1 |
| GSPnP [17] | 34.6±0.2 | 33.5±1.9 | 35.1±0.7 | 31.4±3.3 | n/a | n/a |
| DPIR [50] | 33.9±1.9 | 35.0±0.5 | 33.0±2.5 | 34.6±0.7 | 28.4±2.2 | 25.1±1.9 |

### 图注

**图 1（原 PDF 第 2 页）：** 依赖隐式去噪先验的算法的不稳定性可通过引入等变性解决。在测试时刻对去噪器施加近似等变性，无需重训练隐式先验，即可同时稳定算法并改善重建质量。左：加速 MRI 问题上的 PnP 算法；中：运动模糊问题的非调整 Langevin 采样算法（给出相关 Markov 链的估计均值与方差）；右：$4\times$ 超分辨问题上的 RED 算法。

**图 2（原 PDF 第 5 页）：** 使用近似近端算子的 (PnP) 算法（蓝线）与等变对应物（红线）的行为对比。等高线为（2）中 $r(\mathbf x)=\|\mathbf B_1\mathbf x\|_1$ 的损失；星号表示各序列的极限点（若存在），绿点表示初始化点。

**图 3（原 PDF 第 6 页）：** 在 Set3C 样本、DRUNet 骨干的 (PnP) 上进行运动去模糊的结果：真值、$\mathbf A^\top\mathbf y$、标准算法（PSNR 30.30）与等变算法（PSNR 31.65）（$\mathbf A^\top\mathbf y$ 的 PSNR 为 16.65）。

**图 4（原 PDF 第 7 页）：** 三种不同成像问题上，不同骨干去噪器插入 (PnP) 时的平均 PSNR（左）与收敛判据 $\|\mathbf x^{k+1}-\mathbf x^k\|/\|\mathbf x^k\|$（右）随迭代次数的变化。上排：DnCNN；中排：DRUNet；下排：1-Lipschitz DnCNN。

**图 5（原 PDF 第 7 页）：** 在 BSD10 样本（细节）上、标准差 $\sigma=0.02$ 的高斯去模糊，插入 (PnP) 的不同去噪骨干结果：Wavelets（28.64）、TGV（28.40）、GSNet（29.22）、SCUNet（标准 23.54 / 等变 25.14）、SwinIR（标准 27.85 / 等变 27.83）、DRUNet（标准 9.58 / 等变 29.22）、DnCNN（标准 29.66 / 等变 30.36）。

**图 6（原 PDF 第 7 页）：** 不同骨干去噪器下 (RED) 算法在 $\times2$ SR 问题上的结果：中列 DiffUNet（标准 21.55 / 等变 22.26），右列 DRUNet（标准 20.75 / 等变 24.94）（左列为观测与真值）。

**图 7（原 PDF 第 7 页）：** 与图 6 重建对应的、不同骨干去噪器下 (RED) 算法 PSNR 随迭代的演化。

**图 8（原 PDF 第 8 页）：** (PnP) 迭代（非 1-Lipschitz DnCNN 骨干）重建的演化。上排：真值、反投影数据 $\mathbf A^\top\mathbf y$、Fourier 掩码；第二（对应第三）行从左到右：第 $j=10^4$ 次迭代的重建（标准 PSNR 34.10 / 等变 35.26）；第 $j=10^4$ 与 $i=10^3$ 次迭代重建之差 $|\mathbf x_j-\mathbf x_i|$；Fourier 域中的差（对数尺度显示）。

**图 9（原 PDF 第 8 页）：** 在 BSD10 样本、DRUNet 骨干 (ULA) 算法下对运动模糊问题采样后验均值与方差：标准与等变情形的对比（左列观测与真值，中列标准估计，右列等变估计）。

**图 10（原 PDF 第 8 页）：** 在运动去模糊与 DRUNet 先验下用 (ULA) 算法采样，比较标准与等变情形。左：Set3C 某样本的 MCMC 链样本 PSNR；右：Set3C 数据集上平均 PSNR 随去噪先验噪声水平 $\sigma$ 的变化。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、页码与在线链接。

[1] Rizwan Ahmad, Charles A Bouman, Gregery T Buzzard, Stanley Chan, Sizhuo Liu, Edward T Reehorst, and Philip Schniter. Plug-and-play methods for magnetic resonance imaging: Using denoisers for image recovery. IEEE Signal Processing Magazine, 37(1):105–116, 2020.

[2] Heinz H Bauschke, Patrick L Combettes, Heinz H Bauschke, and Patrick L Combettes. Correction to: Convex Analysis and Monotone Operator Theory in Hilbert Spaces. Springer, 2017.

[3] Kristian Bredies, Karl Kunisch, and Thomas Pock. Total generalized variation. SIAM Journal on Imaging Sciences, 3(3):492–526, 2010.

[4] Michael M Bronstein, Joan Bruna, Taco Cohen, and Petar Veličković. Geometric deep learning: Grids, groups, graphs, geodesics, and gauges. arXiv preprint arXiv:2104.13478, 2021.

[5] Elena Celledoni, Matthias J Ehrhardt, Christian Etmann, Brynjulf Owren, Carola-Bibiane Schönlieb, and Ferdia Sherry. Equivariant neural networks for inverse problems. Inverse Problems, 37(8):085006, 2021.

[6] Antonin Chambolle and Thomas Pock. An introduction to continuous optimization for imaging. Acta Numerica, 25:161–319, 2016.

[7] Dongdong Chen, Julián Tachella, and Mike E Davies. Equivariant imaging: Learning beyond the range space. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 4379–4388, 2021.

[8] Dongdong Chen, Mike Davies, Matthias J Ehrhardt, Carola-Bibiane Schönlieb, Ferdia Sherry, and Julián Tachella. Imaging with equivariant deep learning: From unrolled network design to fully unsupervised learning. IEEE Signal Processing Magazine, 40(1):134–147, 2023.

[9] Hyungjin Chung, Jeongsol Kim, Michael T Mccann, Marc L Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. arXiv preprint arXiv:2209.14687, 2022.

[10] Regev Cohen, Michael Elad, and Peyman Milanfar. Regularization by denoising via fixed-point projection (red-pro). SIAM Journal on Imaging Sciences, 14(3):1374–1406, 2021.

[11] Taco Cohen and Max Welling. Group equivariant convolutional networks. In International conference on machine learning, pages 2990–2999. PMLR, 2016.

[12] Patrick L Combettes, Laurent Condat, J-C Pesquet, and BC Vũ. A forward-backward view of some primal-dual optimization methods in image recovery. In 2014 IEEE International Conference on Image Processing (ICIP), pages 4141–4145. IEEE, 2014.

[13] Laurent Condat. Discrete total variation: New definition and minimization. SIAM Journal on Imaging Sciences, 10(3):1258–1290, 2017.

[14] Valentin De Bortoli, James Thornton, Jeremy Heng, and Arnaud Doucet. Diffusion schrödinger bridge with applications to score-based generative modeling. Advances in Neural Information Processing Systems, 34:17695–17709, 2021.

[15] Fabian Fuchs, Daniel Worrall, Volker Fischer, and Max Welling. Se (3)-transformers: 3d roto-translation equivariant attention networks. Advances in neural information processing systems, 33:1970–1981, 2020.

[16] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. Advances in neural information processing systems, 33:6840–6851, 2020.

[17] Samuel Hurault, Arthur Leclaire, and Nicolas Papadakis. Gradient step denoiser for convergent plug-and-play. In International Conference on Learning Representations, 2021.

[18] Samuel Hurault, Antonin Chambolle, Arthur Leclaire, and Nicolas Papadakis. Convergent plug-and-play with proximal denoiser and unconstrained regularization parameter. arXiv preprint arXiv:2311.01216, 2023.

[19] Kyong Hwan Jin, Michael T McCann, Emmanuel Froustey, and Michael Unser. Deep convolutional neural network for inverse problems in imaging. IEEE transactions on image processing, 26(9):4509–4522, 2017.

[20] Ulugbek S Kamilov, Charles A Bouman, Gregery T Buzzard, and Brendt Wohlberg. Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications. IEEE Signal Processing Magazine, 40(1):85–97, 2023.

[21] Bahjat Kawar, Michael Elad, Stefano Ermon, and Jiaming Song. Denoising diffusion restoration models. Advances in Neural Information Processing Systems, 35:23593–23606, 2022.

[22] Florian Knoll, Jure Zbontar, Anuroop Sriram, Matthew J Muckley, Mary Bruno, Aaron Defazio, Marc Parente, Krzysztof J Geras, Joe Katsnelson, Hersh Chandarana, et al. fastmri: A publicly available raw k-space and dicom dataset of knee images for accelerated mr image reconstruction using machine learning. Radiology: Artificial Intelligence, 2(1):e190007, 2020.

[23] Rémi Laumont, Valentin De Bortoli, Andrés Almansa, Julie Delon, Alain Durmus, and Marcelo Pereyra. Bayesian imaging using plug & play priors: when langevin meets tweedie. SIAM Journal on Imaging Sciences, 15(2):701–737, 2022.

[24] Anat Levin, Yair Weiss, Fredo Durand, and William T Freeman. Understanding and evaluating blind deconvolution algorithms. In 2009 IEEE conference on computer vision and pattern recognition, pages 1964–1971. IEEE, 2009.

[25] Jingyun Liang, Jiezhang Cao, Guolei Sun, Kai Zhang, Luc Van Gool, and Radu Timofte. Swinir: Image restoration using swin transformer. In Proceedings of the IEEE/CVF international conference on computer vision, pages 1833–1844, 2021.

[26] Renhao Liu, Yu Sun, Jiabei Zhu, Lei Tian, and Ulugbek S Kamilov. Recovery of continuous 3d refractive index maps from discrete intensity-only measurements using neural fields. Nature Machine Intelligence, 4(9):781–791, 2022.

[27] Tim Meinhardt, Michael Moller, Caner Hazirbas, and Daniel Cremers. Learning proximal operators: Using denoising networks for regularizing inverse imaging problems. In Proceedings of the IEEE International Conference on Computer Vision, pages 1781–1790, 2017.

[28] Peyman Milanfar. Symmetrizing smoothing filters. SIAM Journal on Imaging Sciences, 6(1):263–284, 2013.

[29] Philip Müller, Vladimir Golkov, Valentina Tomassini, and Daniel Cremers. Rotation-equivariant deep learning for diffusion mri. arXiv preprint arXiv:2102.06942, 2021.

[30] Jean-Christophe Pesquet, Audrey Repetti, Matthieu Terris, and Yves Wiaux. Learning maximally monotone operators for image recovery. SIAM Journal on Imaging Sciences, 14(3):1206–1237, 2021.

[31] Edward T Reehorst and Philip Schniter. Regularization by denoising: Clarifications and new interpretations. IEEE transactions on computational imaging, 5(1):52–67, 2018.

[32] JH Rick Chang, Chun-Liang Li, Barnabas Poczos, BVK Vijaya Kumar, and Aswin C Sankaranarayanan. One network to solve them all–solving linear inverse problems using deep projection models. In Proceedings of the IEEE International Conference on Computer Vision, pages 5888–5897, 2017.

[33] Yaniv Romano, Michael Elad, and Peyman Milanfar. The little engine that could: Regularization by denoising (red). SIAM Journal on Imaging Sciences, 10(4):1804–1844, 2017.

[34] Cédric Rommel, Thomas Moreau, and Alexandre Gramfort. Deep invariant networks with differentiable augmentation layers. Advances in Neural Information Processing Systems, 35:35672–35683, 2022.

[35] Ernest Ryu, Jialin Liu, Sicheng Wang, Xiaohan Chen, Zhangyang Wang, and Wotao Yin. Plug-and-play methods provably converge with properly trained denoisers. In International Conference on Machine Learning, pages 5546–5557. PMLR, 2019.

[36] Andrew K Saydjari and Douglas P Finkbeiner. Equivariant wavelets: Fast rotation and translation invariant wavelet scattering transforms. IEEE Transactions on Pattern Analysis and Machine Intelligence, 45(2):1716–1731, 2022.

[37] Ivan W Selesnick, Richard G Baraniuk, and Nick C Kingsbury. The dual-tree complex wavelet transform. IEEE signal processing magazine, 22(6):123–151, 2005.

[38] Jean-Pierre Serre et al. Linear representations of finite groups. Springer, 1977.

[39] Vasiliki Stergiopoulou, Subhadip Mukherjee, Luca Calatroni, and Laure Blanc-Féraud. Fluctuation-based deconvolution in fluorescence microscopy using plug-and-play denoisers. In International Conference on Scale Space and Variational Methods in Computer Vision, pages 498–510. Springer, 2023.

[40] Julián Tachella, Dongdong Chen, and Mike Davies. Sensing theorems for unsupervised learning in linear inverse problems. Journal of Machine Learning Research, 24(39):1–45, 2023.

[41] Julian Tachella, Dongdong Chen, Samuel Hurault, and Matthieu Terris. DeepInverse: A deep learning framework for inverse problems in imaging, 2023.

[42] Matthieu Terris, Audrey Repetti, Jean-Christophe Pesquet, and Yves Wiaux. Building firmly nonexpansive convolutional neural networks. In ICASSP 2020-2020 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pages 8658–8662. IEEE, 2020.

[43] Matthieu Terris, Arwa Dabbech, Chao Tang, and Yves Wiaux. Image reconstruction algorithms in radio interferometry: From handcrafted to learned regularization denoisers. Monthly Notices of the Royal Astronomical Society, 518(1):604–622, 2023.

[44] Radu Timofte, Rasmus Rothe, and Luc Van Gool. Seven ways to improve example-based single image super resolution. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 1865–1873, 2016.

[45] Singanallur V Venkatakrishnan, Charles A Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In 2013 IEEE global conference on signal and information processing, pages 945–948. IEEE, 2013.

[46] Dian Wang, Robin Walters, Xupeng Zhu, and Robert Platt. Equivariant q learning in spatial action spaces. In Conference on Robot Learning, pages 1713–1723. PMLR, 2022.

[47] Maurice Weiler and Gabriele Cesa. General e (2)-equivariant steerable cnns. Advances in neural information processing systems, 32, 2019.

[48] Jure Zbontar, Florian Knoll, Anuroop Sriram, Tullie Murrell, Zhengnan Huang, Matthew J Muckley, Aaron Defazio, Ruben Stern, Patricia Johnson, Mary Bruno, et al. fastmri: An open dataset and benchmarks for accelerated mri. arXiv preprint arXiv:1811.08839, 2018.

[49] Kai Zhang, Wangmeng Zuo, Yunjin Chen, Deyu Meng, and Lei Zhang. Beyond a gaussian denoiser: Residual learning of deep cnn for image denoising. IEEE transactions on image processing, 26(7):3142–3155, 2017.

[50] Kai Zhang, Yawei Li, Wangmeng Zuo, Lei Zhang, Luc Van Gool, and Radu Timofte. Plug-and-play image restoration with deep denoiser prior. IEEE Transactions on Pattern Analysis and Machine Intelligence, 44(10):6360–6376, 2021.

[51] Kai Zhang, Yawei Li, Jingyun Liang, Jiezhang Cao, Yulun Zhang, Hao Tang, Radu Timofte, and Luc Van Gool. Practical blind denoising via swin-conv-unet and data synthesis. arXiv preprint arXiv:2203.13278, 2022.

[52] Yulun Zhang, Kai Zhang, Zheng Chen, Yawei Li, Radu Timofte, Junpei Zhang, Kexin Zhang, Rui Peng, Yanbiao Ma, Licheng Jia, et al. Ntire 2023 challenge on image super-resolution (x4): Methods and results. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 1864–1883, 2023.

[53] Minghan Zhu, Shizhong Han, Hong Cai, Shubhankar Borse, Maani Ghaffari, and Fatih Porikli. 4d panoptic segmentation as invariant and equivariant field prediction. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 22488–22498, 2023.

[54] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 1219–1229, 2023.

**本页范围与校对状态：** 本页依据 CVPR 2024 Open Access 版（本地 PDF 10 页；正文页码 25255—25264；页脚说明：除水印外与录用版一致，最终版见 IEEE Xplore）完成全文中文翻译：摘要、第 1 节引言、第 2 节相关工作、第 3 节 PnP 算法（含 (PnP)(RED)(ULA) 更新式与第 3.1 节等变方法（3）（4））、第 4 节理论分析（等变最优性推导、命题 1—3 及证明、第 4.1 节非线性示例（5）（6））、第 5 节实验（5.1—5.4）、第 6 节局限、第 7 节结论、致谢、图 1—10 中文图注、表 1—4 逐格转录、参考文献 [1]—[54] 英文原条目（按原编号）均按原文结构录入；编号公式 (1)—(6) 按原文保留。表 1、表 2、表 4 已用本地 PDF 第 4、6 页渲染图逐格核对一致；表 3 按抽取文本转录（未单独渲染核对，但数值量级与表 2 一致）。**逐句逐式终校未做**；图 1—10 的图像内容未数字化，只转录图注与正文给出的关键数值（如 PnP 运动去模糊 PSNR 16.65→30.30→31.65、RED ×2 SR DiffUNet 21.55→22.26 与 DRUNet 20.75→24.94 等）；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①正文提到 "see Tab. 5"（确定性 Reynolds 平均与蒙特卡洛估计的一致性比较），表 5 位于补充材料（SM），本地 PDF 未含 SM，故本页未转录；②式（5）在原文排版中为 $\mathbf D\circ(\mathbf I-\gamma\mathbf A^\top\mathbf A)$，本文按原文写法保留；③命题 3 证明中用到 "$B$ 对平移等变当且仅当可 Fourier 对角化" 的引理（引 [40, Section 4.1]）；④该文为 CVPR 2024 会议论文，版权与再传播许可待核验，**本页不登记为可公开全文**。

{% endraw %}
