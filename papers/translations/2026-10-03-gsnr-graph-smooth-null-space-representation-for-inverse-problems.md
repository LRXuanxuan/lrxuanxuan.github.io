---
layout: page
title: "GSNR：逆问题的图平滑零空间表示｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-03-gsnr-graph-smooth-null-space-representation-for-inverse-problems/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a44f41c0717082cc/) · 原文为会议论文集版本，许可待核验 · [全部目录](/papers/catalog/)

# GSNR：逆问题的图平滑零空间表示

**原题：** GSNR: Graph Smooth Null-Space Representation for Inverse Problems  
**作者：** Romario Gualdrón-Hurtado<sup>*</sup>、Roman Jacome<sup>*</sup>、Rafael S. Suárez、Henry Arguello（<sup>*</sup> 共同第一作者）  
**单位：** 哥伦比亚桑坦德工业大学（Universidad Industrial de Santander, Colombia, 680002）；邮箱：{yesid2238324, rajaccar, rafael2269082}@correo.uis.edu.co；henarfu@uis.edu.co。  
**版本：** 会议论文集版本（Gualdron-Hurtado_GSNR_Graph_Smooth_Null-Space_Representation_for_Inverse_Problems_CVPR_2026_paper.pdf，CVPR 2026，Open Access 版本由 Computer Vision Foundation 提供），本地 PDF 11 页；**再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。**  
**范围与状态：** 全文中文译稿：摘要、第 1–7 节及全部小节（3.1–3.2、4.1–4.3、5.1–5.4）、式 (1)–(14)、定义 1、定理 1–2、命题 1、注 1–2、表 1–2（逐格转写）、图 1–7 图注、致谢、参考文献 [1]–[55]（英文原条目）均按原文结构录入；原文无附录正文（补充材料为独立文件，本页仅按正文引用标注其位置）。逐句逐式终校未做。

## 摘要

成像逆问题是不适定的：由于感知矩阵存在非平凡零空间，与测量一致的解有无穷多个。常见图像先验（如稀疏性、平滑性或分数函数）只促进解落在一般图像流形上；然而这些先验并不约束**零空间分量**，因而可能使重建产生偏差。因此我们希望在重建框架中纳入有意义的零空间信息。受图上平滑图像表示的启发，我们提出**图平滑零空间表示**（Graph-Smooth Null-Space Representation，GSNR）——一种只对"不可见分量"施加结构的机制。具体地，给定图拉普拉斯矩阵，我们构造一个零空间受限拉普拉斯矩阵，用以编码零空间信号中相邻像素之间的相似性，并由 \(p\) 个最平滑的谱图模态（最低图频率）设计低维投影矩阵。该方法在理论与实践上都有重要意义：(i) 通过"仅零空间"图正则项改善收敛性；(ii) 提升**覆盖度**——\(p\) 个模态能捕捉多少零空间方差；(iii) 提升**可预测性**——这些模态能从测量中被推断到什么程度。我们把 GSNR 集成进著名的逆问题求解器（如 PnP、DIP 与扩散求解器），在四个场景中验证：图像去模糊、压缩感知、去马赛克与图像超分辨率；相对基线形式带来最高 4.3 dB 的一致改善，相对端到端学习模型在 PSNR 上带来最高 1 dB 的改善。

## 1. 引言

从有限数量的含噪测量重建图像，等价于求解如下形式的不定逆问题

$$
\mathbf y=\mathbf H\mathbf x^*+\boldsymbol\omega,\qquad\boldsymbol\omega\sim\mathcal N(\mathbf 0,\sigma^2\mathbf I),\tag{1}
$$

其中 \(\mathbf y\in\mathbb R^m\) 为测量向量，\(\mathbf x^*\in\mathbb R^n\) 为未知目标图像，\(\mathbf H\in\mathbb R^{m\times n}\) 为感知矩阵（\(m\le n\)），\(\boldsymbol\omega\) 为加性高斯噪声。通过为 \(\mathbf H\) 选用恰当结构，该表述覆盖广泛成像任务：压缩感知（CS）任务使用稠密感知矩阵 [5]；图像复原问题（去模糊 [53]、补全 [51]、超分辨率 [46]）由结构化 Toeplitz 或块对角矩阵建模；医学成像中的 MRI [26] 与 CT [2] 使用结构化的物理算子（如欠采样 Fourier 或 Radon 变换）。由于矩阵不稳定性和/或欠采样方案，(1) 变得不适定；因此引入先验知识或正则化对促进与 \(\mathbf x^*\) 期望结构一致的重建至关重要 [4]。\(\mathbf x^*\) 的估计通常表述为结合数据保真项与正则项的变分问题：

$$
\min_{\tilde{\mathbf x}}\ \underbrace{\tfrac12\|\mathbf H\tilde{\mathbf x}-\mathbf y\|_2^2}_{\text{数据保真：}g(\tilde{\mathbf x})}+\eta\underbrace{f(\tilde{\mathbf x})}_{\text{先验}},\tag{2}
$$

其中 \(g(\tilde{\mathbf x})\) 强制与测量一致，\(f(\tilde{\mathbf x})\) 纳入关于 \(\mathbf x^*\) 结构的先验知识。

近期研究为 \(f(\tilde{\mathbf x})\) 引入了数据驱动正则项，最著名的是即插即用（Plug-and-Play，PnP）[6, 20, 48, 52] 与去噪正则化（Regularization by Denoising，RED）[9, 34, 35]；它们通过隐式促进解落在训练图像数据集流形内，在广泛成像任务上取得显著成功 [20]（训练良好的去噪器学习了数据分数函数 [27]）。PnP 与 RED 使用学习到的去噪器，从而能把这些强深度复原网络整合进算法 [27, 44]。然而尽管通用且成功，这些先验在图像域运作，并不显式利用 \(\mathbf H\) 的结构——包括其**零空间**（null-space，NS）。

\(\mathbf x^*\) 只有一部分可通过 \(\mathbf H\) 观测。**值域—零空间分解**（range-null-space decomposition，RNSD）指出，任意 \(\mathbf x\in\mathbb R^n\) 可分解为 \(\mathbf x=\mathbf x_r+\mathbf x_n\)，其中 \(\mathbf x_r=\mathbf P_r\mathbf x\) 为位于 \(\mathbf H\) 值域空间的分量（\(\mathbf P_r=\mathbf H^\dagger\mathbf H\)），\(\mathbf x_n=\mathbf P_n\mathbf x\) 为位于其零空间的分量（零空间投影 \(\mathbf P_n=\mathbf I-\mathbf H^\dagger\mathbf H\)）。\(\mathbf x_n\) 对 \(\mathbf H\) 不可见，因为它属于其零空间：

$$
{\rm Null}(\mathbf H)=\left\{\mathbf x\in\mathbb R^n:\mathbf H\mathbf x=\mathbf 0\right\}=\left\{\mathbf x\in\mathbb R^n:\mathbf h_j^\top\mathbf x=0,\ j=1,\ldots,m\right\},
$$

其中 \(\mathbf h_j\in\mathbb R^n\) 为 \(\mathbf H\) 的第 \(j\) 行。这一解释启发了显式利用 \({\rm Null}(\mathbf H)\) 的方法：零空间网络（Null-Space Networks，NSN）[41] 与深度分解（Deep Decomposition）[7] 在**整个** \({\rm Null}(\mathbf H)\) 上运作，把所有不可见方向视为同等重要，忽略了自然、感知合理的图像只占据该空间中一个低维流形这一事实 [17]。为弥补该缺口，近期的**零空间非线性投影**（Nonlinear Projections of the Null-Space，NPN）框架 [17] 引入可学习的低维零空间投影矩阵 \(\mathbf S\in\mathbb R^{p\times n}\)（\(p\le n-m\)）：\(\mathbf S\) 依逆问题设计，使其行与 \(\mathbf H\) 正交，再联合优化一个零空间分量预测器 \(G(\mathbf y)\equiv\mathbf S\mathbf x^*\)，把 \({\rm span}(\mathbf S)\) 适应到 \({\rm Null}(\mathbf H)\) 的子空间。重建时 NPN 惩罚偏差 \(\|G(\mathbf y)-\mathbf S\tilde{\mathbf x}\|_2^2\)。

然而自然图像占据 \({\rm Null}(\mathbf H)\) 内一个低维、有结构的子集，盲目学习任意子空间 \({\rm span}(\mathbf S^\top)\subset{\rm Null}(\mathbf H)\) 会浪费容量并引入偏差。本文提出一个有原则的框架，为 NS 提供新表示，从而最优选择有信息的 NS 方向。为此我们考虑两个主要最优性准则：**覆盖度**——投影矩阵 \(\mathbf S\) 表示了 \(\mathbf H\) 零空间的多少；**可预测性**——投影 \(\mathbf S\mathbf x\) 仅由测量 \(\mathbf y\) 估计有多容易。

受图像的图（平滑）表示 [28, 29] 启发，我们提出 **GSNR** 以克服 NS 表示与预测的上述缺陷。与成像逆问题中已被充分研究的图结构保持方法 [19, 28]（在图像 \(\mathbf x\) 上促进平滑）不同，我们的方法首次赋予 NS 分量 \(\mathbf x_n\) 图结构，该结构通过稀疏、半正定图拉普拉斯矩阵 \(\mathbf L\succeq\mathbf 0\) 定义，例如 4/8 最近邻（NN）图像网格，其边权编码局部像素相似性。随后我们在 \({\rm Null}(\mathbf H)\) 上构造**零空间受限拉普拉斯矩阵** \(\mathbf T:=\mathbf P_n\mathbf L\mathbf P_n\)。借助谱图理论，我们由 \(p\) 个最平滑的 NS 模态（对应前 \(p\) 个图 Fourier 模态）构造图平滑 NS 投影矩阵 \(\mathbf S\)。

所提 GSNR 改变了求解逆问题的方式——在传感器"失明"处提供精确的结构信息。通过选择零空间受限拉普拉斯矩阵的前 \(p\) 个最平滑特征模态，本方法：(i) 仅约束不可见分量而非整幅图像，从而减少幻觉与偏差；(ii) 改善条件数，使 PnP、DIP 与扩散求解器收敛更快更稳定；(iii) 提升数据效率——以较小的 \(p\) 捕捉大部分零空间变化（高覆盖度），并瞄准最容易从测量推断的模态（高可预测性）；(iv) 提供可操作的覆盖度/可预测性诊断曲线，从而客观选择 \(p\) 并为正则化提供依据。由于它与标准流程即插即用、且与前向算子无关，该方法可扩展到不同成像任务，把不适定的模糊性转化为有结构、可度量、可学习的成分。该构造的具体好处是：

1. 选中的图平滑零空间分量在低维投影下产生高覆盖度；
2. 用 GSNR 从 \(\mathbf y\) 预测 \(p\) 个零空间分量，比用常见基底更容易；
3. 预测的图零空间分量可通过正则化融入 PnP、深度变分与扩散求解器。

**图 1（原文 Figure 1）：** 对超分辨率任务（\({\rm SRF}=4\)、\(n=3\cdot128^2\)），从左到右依次展示真值、伴随重建（\(\mathbf H^\top\mathbf y\)）、真实零空间分量 \(\mathbf P_n\mathbf x^*\)，以及基于 \(\mathbf L_{4\text{nn}}\) 与 \(\mathbf L_{8\text{nn}}\) 的图零空间投影。

## 2. 相关工作

**学习式先验。** 求解 (2) 的常用方案是近端梯度下降（PGD）[30]；近期 PnP [20] 与 RED [35] 方法用学习到的去噪器替代 \(f(\tilde{\mathbf x})\) 的近端算子，从而无需显式解析形式即可引入数据驱动先验 [17]。这些框架虽达到最先进性能，却让 \({\rm Null}(\mathbf H)\) 基本不受约束——去噪器可自由修改对感知算子不可见的分量。

**零空间非线性投影（NPN）。** 为显式正则化未观测分量，[17] 在 \({\rm Null}(\mathbf H)\) 内引入任务特定的低维投影，强制学习到的 NS 预测与重建之间一致。本文在该原则基础上引入图平滑性分析以引导结构化零空间子空间的选择；我们的设计确保学习到的投影与数据的内在几何对齐，使 NS 分量既可从测量预测、又与图诱导的平滑先验一致。

**成像逆问题中的图论。** 变分正则化方法通过施加平滑或稀疏先验约束解空间：全变分 [38] 强制逐像素平滑，基于小波的稀疏先验 [13] 通过软阈值促进图像在变换域的稀疏表示。这些先验虽提升稳定性，但通常只限局部结构，并常把精细纹理或复杂几何过度平滑。为更好捕捉局部依赖，基于图与非局部的正则化方法被重新引入：[32] 提出自适应非局部正则化框架，联合估计图像与编码图像块相似性的图；但与经典先验一样，该框架只作用于重建图像，并不约束位于 \({\rm Null}(\mathbf H)\) 的图像分量。

## 3. 图平滑零空间表示

图给出数据的几何表示：顶点对应数据元素（如像素或图像块），加权边编码两两相似性 [42]。定义在加权无向图上的信号数学上记为 \(\mathcal G=(V,E,\mathbf W)\)，其中 \(V\) 为顶点集（\(|V|=n\)）、\(E\subseteq V\times V\) 为边集、\(\mathbf W\in\mathbb R^{n\times n}\) 为对称加权邻接矩阵（若 \((i,j)\in E\) 则 \(W_{ij}>0\)，否则 \(W_{ij}=0\)）。

### 3.1 图与拉普拉斯矩阵

非归一化图拉普拉斯矩阵为

$$
\mathbf L=\mathbf D-\mathbf W,\qquad(\mathbf L\mathbf x)_i=\sum_jW_{ij}(x_i-x_j),\tag{3}
$$

其中对角**度矩阵** \(\mathbf D=\operatorname{diag}(d_1,\ldots,d_n)\)、\(d_i=\sum_jW_{ij}\)。图上的二次型

$$
\mathbf x^\top\mathbf L\mathbf x=\tfrac12\sum_{i,j}W_{ij}(x_i-x_j)^2\tag{4}
$$

对具有较大权重的边上的差异施加惩罚。对对称 \(\mathbf W\)，\(\mathbf L\) 为实对称半正定（SPSD），其特征对 \(\{(\lambda_\ell,\mathbf v_\ell)\}\) 满足 \(0=\lambda_0\le\lambda_1\le\cdots\)（连通图上 \(\mathbf v_0\propto\mathbf 1\)）。\(\lambda_\ell\) 小的特征向量在权重大的边上变化缓慢，这启发了把 \(\lambda\) 解释为图频率。

关于 \(\mathbf L\) 的使用，我们聚焦两种图拓扑 [29]：

1. **4NN**：促进沿坐标轴的分片平滑，衰减水平/垂直起伏，得到各向异性（轴偏置）的图；边权 \(W_{ij}=1\)（\((i,j)\in E_4\)），其中 \(\mathbf p_i\in\mathbb Z^2\) 为像素坐标。
2. **8NN**：降低方向偏置，更接近各向同性 Laplace 算子，促进旋转不变的分片平滑，并在各方向上均匀抑制起伏；对应边集 \(E_8\) 包含 8 邻域连接。

我们在补充材料 A4.1 中把分析扩展到其他拓扑。

### 3.2 图平滑零模态

我们在 NS 内研究平滑性，把拉普拉斯矩阵限制为

$$
\mathbf T=\mathbf P_n\mathbf L\mathbf P_n.\tag{5}
$$

使用零空间图算子 \(\mathbf T\in\mathbb R^{n\times n}\) 的原因在于：需要关注图像 NS 的某些几何性质，而这些性质由 \(\mathbf L\) 提取。令 \(\mathbf T\mathbf x=\mathbf P_n\mathbf L\mathbf P_n\mathbf x=\mathbf P_n\mathbf L\mathbf x_n\)，其中 \(\mathbf L\mathbf x_n\) 提取 NS 中差异最大的区域，再经 \(\mathbf P_n\) 重新投影回 NS，从而确保该运算仍是 NS 上的投影。图 1 由左至右展示了真值 \(\mathbf x^*\)、反投影 \(\mathbf H^\top\mathbf y\)、真实零空间分量 \(\mathbf P_n\mathbf x^*\)，以及超分辨率（SR）任务下两个图零空间投影 \(\mathbf P_n\mathbf L_{8\text{nn}}\mathbf P_n\mathbf x^*\) 与 \(\mathbf P_n\mathbf L_{4\text{nn}}\mathbf P_n\mathbf x^*\)。映射 \(\mathbf P_n\mathbf x^*\) 分离出对传感器不可见的信号内容，而 \(\mathbf P_n\mathbf L\mathbf P_n\mathbf x^*\) 强调 \(\mathbf L\mathbf x_n\) 落入 NS 的部分；这些图投影凸显了最平滑的"盲"信号分量（例如边缘附近的纹理）。

随后对 \(\mathbf T\) 作特征值分解：

$$
\mathbf T=\mathbf V\boldsymbol\mu\mathbf V^\top,\qquad 0=\mu_1\le\mu_2\le\cdots\le\mu_n,
$$

其中 \(\mathbf V\in\mathbb R^{n\times n}\) 正交。注意 \(\mathbf V\) 对角化 \(\mathbf T\)，故其列 \(\{\mathbf v_i\}\) 就是 \({\rm Null}(\mathbf H)\) 内的**图 Fourier 模态**：\(\mu_i\) 越小，所选图模态越平滑。\(\mathbf V\) 具有如下性质：i) 其列 \(\mathbf v_i\in{\rm Null}(\mathbf H)\) 正交归一，并按 \(\mu_i\) 排序；ii) 这些 \(\{\mathbf v_i\}\) 是探查 \(\mathbf x\) 的**图平滑零模态**。

由 \(\mathbf V\) 的前 \(p\) 列即得含 \(p\) 行的图平滑 NS 投影矩阵：

$$
\mathbf S=\underbrace{\mathbf V[:,1:p]^\top}_{\mathbf V_p^\top}=[\mathbf v_1,\ldots,\mathbf v_p]^\top\in\mathbb R^{p\times n}.\tag{6}
$$

注意 \(\mathbf S\) 只保留 \(p\) 个最平滑的零空间方向，\(\mathbf S\mathbf x\) 把 \(\mathbf x\) 的 NS 部分表示在按图频率递增排序的正交基上。特别地，由于 \(\mathbf S\) 的各行位于 \({\rm Null}(\mathbf H)\)，有 \(\mathbf S\mathbf P_r=\mathbf 0\)；\(\{\mathbf v_i\}_{i=1}^{p}\) 是 \(p\) 个拉普拉斯最平滑的正交零模态，故 \(\mathbf S\mathbf x\) 收集 \(\mathbf x\) 沿这 \(p\) 个方向的系数。

### 3.3 GSNR 预测器与重建目标

我们按如下方式训练 GSNR 预测器 \(G\)：

$$
G^*=\min_G\ \mathbb E\left[\left\|G(\mathbf y)-\mathbf S\mathbf x^*\right\|_2^2\right].\tag{7}
$$

即用神经网络 \(G\) 预测低维 GSNR。随后我们将给出理论基础，说明更大的可预测性将保证更好的重建。含 GSNR 项的重建目标为

$$
\min_{\tilde{\mathbf x}}\ g(\tilde{\mathbf x})+\eta f(\tilde{\mathbf x})+\gamma\left\|G^*(\mathbf y)-\mathbf S\tilde{\mathbf x}\right\|_2^2+\frac{\gamma_g}{2}\underbrace{\tilde{\mathbf x}^\top\mathbf T\tilde{\mathbf x}}_{\phi(\tilde{\mathbf x})},\tag{8}
$$

其中包含学习到的 GSNR 项，以及只作用于重建零空间分量的图正则项（分别由 \(\gamma\) 与 \(\gamma_g\) 加权）。该形式保持与近端/PnP/扩散（DM）求解器的兼容性。

## 4. 理论分析

我们基于零空间受限的谱表述对 GSNR 作理论分析，把 GSNR 设计/性能预测转化为 \(\mathbf T\) 上的有序特征值判据，从而得到用于选择 \(\mathbf S\)、\(p\)、\(\mathbf L\) 的有原则的特征排序与准则。理论结果概述如下：

- **覆盖度**：\(\mathbf T\) 的前 \(p\) 个特征模态给出 \({\rm Null}(\mathbf H)\) 的最优图平滑表示，以 \(p\ll n-m\) 覆盖较高的零空间谱能量。
- **极小极大最优性**：在 \({\rm Null}(\mathbf H)\) 内的图能量椭球上，同一 GSNR 基底是**最坏情形最优**的，从而给出零空间方向的有原则排序。
- **可预测性**：通过块精度/Schur 补分析，我们证明 GSNR 相对普通零空间基底具有更高的逐模态可恢复性。
- **收敛性**：图正则项带来更好的条件数与收敛性质。

在展开覆盖性的形式分析前，我们先验证三种设置的表示性能：i) \(\mathbf L=\mathbf I\)；ii) \(\mathbf L_{4\text{nn}}\)；iii) \(\mathbf L_{8\text{nn}}\)（第一种等价于仅取 NS 基底）。图 2(a) 中每行展示不同 \(p\) 下的投影 \(\mathbf x=(\mathbf H^\top\mathbf H+\mathbf S^\top\mathbf S)\mathbf x^*\)：上排（橙色）为 \(\mathbf L=\mathbf I\)、中排（绿色）为 \(\mathbf L_{8\text{nn}}\)、下排（蓝色）为 \(\mathbf L_{4\text{nn}}\)。对较小的 \(p\)，网格拉普拉斯已给出视觉上合理的人脸，而 \(\mathbf L=\mathbf I\) 仍产生噪声大、结构差的估计。各图上方数字为表示的 MSE；底部曲线给出所有 \(p\in\{1,\ldots,n-m\}\) 下的 MSE，说明图零空间投影用更小的 \(p\) 就取得更好的信号表示。

一般地，为度量低维算子 \(\mathbf S\) 能捕捉多少 NS 能量，我们使用**谱覆盖度**：

$$
C(p)=\frac{\operatorname{tr}\left(\mathbf S\,{\rm Cov}(\mathbf x_n)\mathbf S^\top\right)}{\operatorname{tr}\left({\rm Cov}(\mathbf x_n)\right)}\in[0,1],\tag{9}
$$

其中 \({\rm Cov}(\mathbf x)\) 为 \(\mathbf x\) 的协方差矩阵。把拉普拉斯特征向量视为图 Fourier 基底：前几个模态是平滑的低图频率模式，后面的模态越来越振荡 [29, 42]。\(C(p)\) 表示 NS 总方差中落在 \(\mathbf S\) 所保留的前 \(p\) 个图 Fourier 模态张成空间内的比例，类似 PCA 中的解释方差 [18]。直观上，若信号是图平滑的，大部分变异性集中在低频，覆盖度随 \(p\) 快速上升；否则覆盖度增长更慢，如同 PCA。补充材料 A4.2 给出覆盖度结果与特征值分析，验证图拉普拉斯比可学习矩阵更有用；A5 给出依据覆盖度选择合适 \(p\) 值的数学洞见。

**定义 1（高斯 Markov 随机场 [39]）** 图 \(\mathcal G=(V,E)\) 上的 GMRF 是零均值高斯向量 \(\mathbf x\in\mathbb R^n\)，其精度矩阵 \(\mathbf Q=\boldsymbol\Sigma^{-1}\in\mathbb R^{n\times n}\)（\(\boldsymbol\Sigma={\rm Cov}(\mathbf x)\)）稀疏，并编码图的**条件独立性**：

$$
p(\mathbf x)\propto\exp\left(-\tfrac12\mathbf x^\top\mathbf Q\mathbf x\right),\qquad Q_{i,j}=0\ \leftrightarrow\ (i,j)\notin E,
$$

在需要相邻像素平滑处，我们定义精度矩阵 \(\mathbf Q=\alpha\mathbf L+\epsilon\mathbf I\)（\(\alpha>0,\epsilon>0\)）。

### 4.1 覆盖性：图平滑零空间

在上述设定下，我们得到关于 NS 覆盖度提升的如下保证。

**定理 1（图平滑零空间的覆盖性）** 考虑 (5) 中 \(\mathbf T\) 的构造。NS 的协方差 \({\rm Cov}(\mathbf x_n)\) 是 \(\mathbf T\) 的谱函数，即 \({\rm Cov}(\mathbf x_n)=\mathbf V\operatorname{diag}(\lambda_1,\ldots,\lambda_n)\mathbf V^\top\)，其中 \(\lambda_i=\frac{1}{\alpha\mu_i+\epsilon}\)、\(\lambda_1\ge\lambda_2\cdots\ge\lambda_n\)。按 (6) 构造 \(\mathbf S\) 时，以拉普拉斯矩阵 \(\mathbf L\) 的 GMRF 覆盖度记为 \(C_{\mathbf L}(p)\)，\(\mathbf L=\mathbf I\) 时的覆盖度记为 \(C_{\mathbf I}(p)\)，则对每个 \(p=1,\ldots,n-m\) 有 \(C_{\mathbf L}(p)\ge C_{\mathbf I}(p)\)。（证明见补充材料 A1。）

我们在图 2(b)(c) 中展示该效应：2(b) 中 \(\mathbf L_{8\text{nn}}\) 与 \(\mathbf L_{4\text{nn}}\) 的 RNSD 表示误差比 \(\mathbf I\) 下降更快；2(c) 中 \(\mathbf T\) 的特征值谱显示，与纯 NS 投影 \(\mathbf P_n\) 的平坦谱不同，图拉普拉斯呈现平滑递增的特征值。由定理 1 可知，平坦谱（\(\mathbf L=\mathbf I\) 时 \(\mu_i=1\)）给出 \(C_{\mathbf I}(p)=p/q\)，覆盖度仅随 \(p\) 线性增长；而特征值递增的拉普拉斯可实现更快的覆盖度增长。

第二个理论结果给出 NS 覆盖的极小极大最优性。首先定义 NS 分量的可行集

$$
\mathcal M_\tau:=\left\{\mathbf x_n\in{\rm Null}(\mathbf H):\mathbf x_n^\top\mathbf L\mathbf x_n\le\tau\right\}.
$$

**定理 2（极小极大最优性）** 令 \(V_p={\rm span}\{\mathbf v_1,\ldots,\mathbf v_p\}\)、\(\mathbf P_{V_p}\) 为其投影算子。则在所有 \(p\) 维子空间 \(V\subset{\rm Null}(\mathbf H)\) 中（只要 \(\mu_{p+1}>0\)），有

$$
\min_{\dim(V)=p}\ \sup_{\mathbf x_n\in\mathcal M_\tau}\left\|(\mathbf I-\mathbf P_V)\mathbf x_n\right\|_2^2=\sup_{\mathbf x_n\in\mathcal M_\tau}\left\|(\mathbf I-\mathbf P_{V_p})\mathbf x_n\right\|_2^2=\frac{\tau}{\mu_{p+1}}.
$$

（证明见补充材料 A2。）

**注 1** 取 \(\mathbf S\) 使其行为 \(\{\mathbf v_1^\top,\ldots,\mathbf v_p^\top\}\)，对以图能量 \(\mathbf x^\top\mathbf T\mathbf x\) 度量下的 NS 覆盖而言可证为最优。随 \(p\) 增大，保证的最坏情形误差以 \(1/\mu_{p+1}\) 衰减，对图拉普拉斯（许多 \(\mu_j\) 很小）衰减很快。\(\mathbf L=\mathbf I\) 时 \(\mathbf T=\mathbf P_n\)（平坦谱），故 \(\mu_{p+1}=1\) 且界无改善，这解释了为何无几何设计无法高效覆盖 NS。

### 4.2 零空间投影的可预测性

量化 NS 投影 \(\mathbf S\mathbf x^*\) 由测量 \(\mathbf y\) 的可预测程度同样重要。我们通过线性估计建立**统计耦合**分析。

**命题 1（逐模态可预测性界）** 设 \(\mathbf x\in\mathbb R^n\) 为零均值高斯，协方差 \(\mathbf C\)、精度 \(\mathbf Q=\mathbf C^{-1}\)。设 \(\mathbf H\in\mathbb R^{m\times n}\)，并把到 \(\mathcal R:={\rm Range}(\mathbf H^\top)\) 与 \(\mathcal N:={\rm Null}(\mathbf H)\) 的正交投影分别记为 \(\mathbf P_r\)、\(\mathbf P_n\)。按分解 \(\mathbb R^n=\mathcal R\oplus\mathcal N\) 分块：

$$
\mathbf Q=\begin{bmatrix}\mathbf Q_{rr}&\mathbf Q_{rn}\\\mathbf Q_{nr}&\mathbf Q_{nn}\end{bmatrix},\qquad \mathbf C=\begin{bmatrix}\mathbf C_{rr}&\mathbf C_{rn}\\\mathbf C_{nr}&\mathbf C_{nn}\end{bmatrix}.
$$

假设 \(\mathbf Q_{nn}\succ\mathbf 0\) 在 \(\mathcal N\) 上成立，令 \(\{\mathbf v_j\}\) 为 \(\mathbf Q_{nn}\) 的正交归一特征基，\(\mathbf Q_{nn}\mathbf v_j=\mu_j\mathbf v_j\)（\(\mu_j>0\)）。定义第 \(j\) 个零空间系数 \(a_j:=\mathbf v_j^\top\mathbf x_n\)，其中 \(\mathbf x_n:=\mathbf P_n\mathbf x\)。考虑 (1) 的测量并记 \(\mathbf C_y=\mathbf H\mathbf C_{rr}\mathbf H^\top+\sigma^2\mathbf I_m\)。则由 \(\mathbf y\) 对 \(a_j\) 的最优线性预测器的总体 \(R^2\) 满足

$$
\rho_j^2:=\frac{{\rm Cov}(a_j,\mathbf y)^\top\mathbf C_y^{-1}{\rm Cov}(\mathbf y,a_j)}{{\rm Var}(a_j)}\le\frac{c_j}{c_j+\mu_j},\qquad c_j:=\mathbf v_j^\top\left(\mathbf Q_{rn}\mathbf C_{rr}\mathbf Q_{nr}\right)\mathbf v_j.
$$

（证明见补充材料 A3。）

**注 2** 若先验为 \(\mathbf L\) 上的 GMRF，精度 \(\mathbf Q=\alpha\mathbf L+\varepsilon\mathbf I\)，则 \(\mathbf Q_{nn}=\alpha\mathbf T+\varepsilon\mathbf P_n\)（\(\mathbf T:=\mathbf P_n\mathbf L\mathbf P_n\)），可取 \(\{\mathbf v_j\}\) 为 \(\mathbf T\) 的特征模态（图平滑，且 \(\mathbf Q_{rn}=\alpha\mathbf L_{rn}\)）。因此越平滑的零模态（\(\lambda_j(\mathbf T)\) 越小）越可预测。若 \(\mathbf L=\mathbf I\)（各向同性先验），则 \(\mathbf Q=\gamma\mathbf I\)、\(\mathbf Q_{rn}=\mathbf P_r\mathbf Q\mathbf P_n=\mathbf 0\)，故所有 \(j\) 的 \(c_j=0\)：范围空间与零空间之间**没有统计耦合**。

为验证上述理论，图 3 给出 SR 情形（\({\rm SRF}=4\)、\(n=64^2\)）下 \(\mathbf L\in\{\mathbf I,\mathbf L_{8\text{nn}},\mathbf L_{4\text{nn}}\}\) 的逐模态可预测性（各面板索引排序相同）。索引 \([0,m-1]\) 对应与范围空间相关的特征对，故所有设置的可预测性都高。观察结果：(i) \(\mathbf L=\mathbf I\) 时谱在 NS 上恒定、并在其外降为 0，而两种网格拉普拉斯都呈现 \(\mu_j\) 的平滑单调增长；(ii) 相应地，网格拉普拉斯下存在一长串非零可预测性的模态，而 \(\mathbf L=\mathbf I\) 下只有很小一个初始模态块有可预测性、其余基本为 0。另注意 \(\mathbf L_{4\text{nn}}\) 在更多特征模态上比 \(\mathbf L_{8\text{nn}}\) 可预测性更高，这与图 2(c) 中更快的特征值增长一致。该分析基于线性估计框架、利用 NS 的 GMRF 先验；实践中"统计耦合"也可通过式 (7) 中预测器 \(G\) 的监督学习实现。我们还用

$$
\frac{\left\|G^*(\mathbf y)-\mathbf S\mathbf x^*\right\|_2^2}{\mathbb E\left[\left\|\mathbf S\mathbf x^*\right\|_2^2\right]}\tag{10}
$$

评估可预测性。图 4(a)(b) 给出 CS 任务下不同算子 \(\mathbf S\) 的覆盖度与可预测性（同一感知矩阵 \(\mathbf H\)，使用 CIFAR-10 的 \(N=10000\) 张图像）：NPN（\(\mathbf L=\mathbf I\)）按 [17, 式 3] 得到，GSNR 使用 \(\mathbf L=\mathbf L_{8\text{nn}}\)，均取每个 \(\mathbf S\) 的前 \(p\) 行。补充材料 A9 给出 CS 的附加结果，A7 给出覆盖度相关内容。

### 4.3 收敛性分析

考虑求解 (8)（不含 \(\|G^*(\mathbf y)-\mathbf S\mathbf x\|\) 项；该项的详细分析见 [17, 定理 1]）的 PnP–PGD 迭代：

$$
\mathbf x_{k+1}=\mathcal D_\sigma\left(\mathbf x_k-\alpha\left(\nabla g(\mathbf x_k)+\gamma_g\nabla\phi(\mathbf x_k)\right)\right)\tag{11}
$$

$$
=\mathcal D_\sigma\left(\mathbf x_k-\alpha\left(\mathbf H^\top(\mathbf H\mathbf x_k-\mathbf y)+\gamma_g\mathbf T\mathbf x_k\right)\right),\tag{12}
$$

其中 \(\mathcal D_\sigma\) 为有界去噪器，满足 \(\|\mathcal D_\sigma(\mathbf u)-\mathcal D_\sigma(\mathbf v)\|\le\sqrt{1+\delta}\|\mathbf u-\mathbf v\|\)（如 [17, 假设 2]），因为 \(\nabla\phi(\mathbf x_k)=\mathbf T^\top\mathbf x_k=\mathbf T\mathbf x_k\)。令 \(\lambda_{\min}>0\) 与 \(\lambda_{\max}\) 为 \(\mathbf A_{\gamma_g}=\mathbf H^\top\mathbf H+\gamma_g\mathbf T\) 在 \({\rm span}({\rm Range}(\mathbf H^\top)\cup{\rm Null}(\mathbf H))=\mathbb R^n\) 上的极端特征值。则对任意步长 \(\alpha\in(0,2/\lambda_{\max})\)，

$$
\left\|\mathbf x_{k+1}-\mathbf x^*\right\|\le(1+\delta)\left\|\mathbf I-\alpha\mathbf A_{\gamma_g}\right\|_2\left\|\mathbf x_k-\mathbf x^*\right\|\tag{13}
$$

$$
\le\rho\left\|\mathbf x_k-\mathbf x^*\right\|,\tag{14}
$$

其中 \(\rho=(1+\delta)\max\{1-\alpha\lambda_{\min},\alpha\lambda_{\max}-1\}\)。特别地，若 \(\rho<1\)，则迭代为压缩映射并线性收敛到不动点；最优 \(\alpha\)（对该线性系统）为 \(2/(\lambda_{\min}+\lambda_{\max})\)。与基线（\(\gamma_g=0\)）相比，加入 \(\gamma_g\mathbf T\)：(i) 使 \(\mathbf A_{\gamma_g}\) 即使在 \({\rm Null}(\mathbf H)\) 上也正定，保证二次子问题解唯一；(ii) 降低条件数 \(\kappa\)，因为 \(\mathbf T\) 恰作用于 \(\mathbf H^\top\mathbf H\) 很小的方向，从而改善收敛性与最优 \(\rho\)。

**图 2（原文 Figure 2）：** SR 任务的覆盖度与谱分析。(a) 不同 \(p\) 下 \(\mathbf x^*=\mathbf H^\top\mathbf H\mathbf x^*+\mathbf S^\top\mathbf S\mathbf x^*\)（\(\mathbf S\) 由式 (6) 定义，\(\mathbf L=\mathbf I\) 橙色、\(\mathbf L=\mathbf L_{4\text{nn}}\) 绿色、\(\mathbf L=\mathbf L_{8\text{nn}}\) 蓝色）；(b) RNSD 表示误差随 \(p\) 的变化；(c) \(\mathbf T\) 归一化特征值随索引的变化。

**图 3（原文 Figure 3）：** SR 情形（\({\rm SRF}=4\)、\(n=64^2\)）下 \(\mathbf L\in\{\mathbf I,\mathbf L_{8\text{nn}},\mathbf L_{4\text{nn}}\}\) 的逐模态可预测性。

**图 4（原文 Figure 4）：** CS 任务下 (a) 覆盖度与 (b) 可预测性随 \(p\) 的变化。

## 5. 实验

为验证所提方法，我们用 PyTorch [31] 实现，并用 DeepInverse 库 [43] 基准测试不同求解器。由于本工作不提出特定网络 \(G\)，我们用 U-Net 模型 [37]（四级 2D 编码—解码架构）验证：编码器使用双卷积块（通道数 \(C,2C,4C,8C\)，\(C=64\)）与 \(2\times2\) 最大池化，解码器使用带跳跃连接的最近邻上采样，把特征细化回 \(C\) 通道后由最终 \(1\times1\) 卷积输出。网络用 Adam 优化器 [21]、学习率 \(10^{-3}\) 训练 50 个 epoch。所有实验取噪声方差 \(\sigma^2=0.05\)。

### 5.1 实验设置

我们考虑如下逆问题。**压缩感知（CS）**：\(\mathbf H\in\{-1,1\}^{m\times n}\) 取 Hadamard 矩阵 \(\mathbf A\in\{-1,1\}^{n\times n}\) 的前 10% 行 [5]，在 CIFAR-10 [23] 与 CelebA [25] 数据集上验证。**超分辨率（SR）**：取 \(n=3\cdot128^2\)、SR 因子 \({\rm SRF}=4\)（即 \(m=3\cdot32^2\)），在 CelebA [25] 上验证，使用 10,000 张缩放至 \(128\times128\) 的训练图像；另给出合成孔径相关结果。**去马赛克**：使用缩放至 \(64\times64\) 的 CelebA 与 Bayer 滤色阵列 [3] 采集模式。**去模糊**：取 \(n=64^2\cdot3\)，使用带宽 \(\sigma_k=1\) 的二维高斯核，在缩放至 \(64\times64\) 的 CelebA [25] 与 Places365 [54] 上验证，训练图像 10,000 张、批大小 32。

对所有这些成像任务，我们利用 \(\mathbf H\) 的性质构造零空间受限拉普拉斯 \(\mathbf T\) 与矩阵 \(\mathbf S\)（计算细节见补充材料 A5）；并在 A6 中对 GSNR 做全面消融。式 (9) 的覆盖度定义给出协方差计算的一般表达；实践中我们按中心化图像 \(\mathbf x_i\) 及其零空间投影 \(\mathbf x_{n,i}=\mathbf P_n(\mathbf x_i-\bar{\mathbf x})\) 计算。

### 5.2 扩散求解器

我们用两个扩散模型（DM）求解器 DPS [8] 与 DiffPIR [55]（其与本方法的适配细节见补充材料 A8）。图 5 比较加与不加 GSNR 项的 DPS 与 DiffPIR：所有情形下基线 DM 已能生成合理人脸，但常在高频结构（发丝、眉毛、面部轮廓）周围留下残余模糊与混叠；用 GSNR 替代通用 NS 基底后，重建明显更锐利、更接近真值——下颌与鼻部边缘更清晰、纹理更少被冲淡、低分辨率观测 \(\mathbf y\) 的块状伪影进一步被抑制。这些定性改善与各面板所示的 SSIM/PSNR 数值一致：相对基线 DiffPIR/DPS 的 dB 增益不大但系统一致（例如 \(p=0.1n\) 时），说明该术语帮助扩散先验消解 NS 模糊性，而不是幻觉出任意细节。换言之，DM 仍提供强图像先验，但 GSNR 把它引导到由图平滑、可从 \(\mathbf y\) 预测且与前向模型相容的 NS 方向，从而得到更准确、稳定的重建。补充材料 A8 还给出 GSNR 在隐空间 DM [15, 36] 中的集成。

### 5.3 与端到端方法的比较

表 1 报告 SR 与去马赛克任务的 PSNR，比较经典 PnP、所提 GSNR-PnP 变体、NPN 与若干强深度学习基线。两个任务上，使用图拉普拉斯 \(\mathbf L_{4\text{nn}}\) 与 \(\mathbf L_{8\text{nn}}\) 的 GSNR-PnP 都取得最佳性能。对 SR，GSNR-PnP 相对普通 PGD-PnP 约有 **2 dB** 增益，并对 NPN（\(\mathbf L=\mathbf I\)）与任务特定的展开/级联架构都有清晰优势；对去马赛克，问题不适定性较弱，绝对增益较小，但 GSNR-PnP 仍相对 PGD-PnP、NPN 与深度基线有一致改善。总体而言，这些结果表明：把图平滑 NS 结构注入标准 PnP 求解器，可一致地优于 (i) 无几何信息的 PnP/NPN 基线与 (ii) 专门的深度展开或级联架构，在最欠定的 SR 任务上收益尤为显著。补充材料 A10、A11 分别给出去马赛克与 SR 的附加结果。

**表 1（原文 Table 1）：CelebA 测试集上超分辨率与去马赛克任务的定量比较（PSNR，越高越好）**

| 方法 | 超分辨率 PSNR (dB) | 去马赛克 PSNR (dB) |
|---|---|---|
| PnP [20] | 27.37 | 39.35 |
| NPN [17] | 29.21 | 39.77 |
| DDN-Cascade [7] | 28.92 | 37.83 |
| DDN-Independent [7] | 28.81 | 38.92 |
| DNSN [41] | 26.52 | 39.33 |
| Unrolling [50] | 28.97 | 38.82 |
| **GSNR-PnP w. \(\mathbf L_{8\text{nn}}\)** | **29.38** | **39.88** |
| **GSNR-PnP w. \(\mathbf L_{4\text{nn}}\)** | **29.42** | **39.89** |

注：原文以加粗/下划线区分每个任务的最佳与次佳结果；本页按原文数值照录（两行 GSNR 变体分别为该表的最佳与次佳）。

### 5.4 即插即用

我们使用 PGD-PnP [16, 20]，但 GSNR 也可方便地适配 ADMM [6] 或 HQS [33] 等其他形式。我们使用三种去噪器：Lipschitz 训练的 DnCNN（Lip-DnCNN）[40]、DRUNet [52] 与基于软阈值近端的小波去噪器（Daubechies 8、4 级）[12]。为提升 PGD-PnP 的稳定性与性能，我们采用等变去噪技术 [45]（两次随机 \(90^\circ\) 旋转与两次反射）。

**去模糊**：表 2 报告 Places365 与 CelebA 上不同图变体与去噪器下的最终 PSNR。所有设置中 NPN 与 GSNR 都显著优于基线 PGD-PnP：CelebA 上对 Lip-DnCNN 与小波去噪器增益约 **+2 dB**，Places365 上约 **+1.5–2 dB**。使用 \(\mathbf L_{8\text{nn}}\) 的 GSNR 变体在两个数据集、两种去噪器上都相对 NPN 有小而一致的改善，说明把 NS 结构注入 NS 有助于求解器恢复更锐利的细节而不致过拟合。有趣的是，本实验中额外图罚项开/关（\(\gamma_g\) ✓ vs. ✘）对最终 PSNR 影响可忽略，说明学习到的 GSNR 已捕捉到去模糊所需的大部分有用图结构。图 6 给出使用 DnCNN 去噪器的去模糊收敛行为：基线 PnP-PGD 曲线稳步上升但在较低 PSNR 平台饱和；相反两个 GSNR 变体（\(\gamma_g=0\) 与 \(\gamma_g=0.1\)）都收敛到明显更高的最终 PSNR，证实图平滑零空间表示改善了算法的**不动点**。显式的"仅零空间"图罚项（\(\gamma_g=0.1\)）主要影响瞬态阶段：它在最初几百次迭代加速收敛，更早达到接近峰值的 PSNR。图 7 进一步展示 PnP、NPN 与 GSNR 在不同 \(\mathbf L\) 与去噪器下的结果。

**表 2（原文 Table 2）：去模糊（\(\sigma_k=1\)，\(n=64^2\cdot3\)，\(p=0.8n\)）在 Places365 与 CelebA 测试集上的最终 PSNR（dB），使用 Lip-DnCNN 与小波去噪器**

| 方法 | \(\gamma_g\) | Places365 Lip-DnCNN | Places365 Wavelet | CelebA Lip-DnCNN | CelebA Wavelet |
|---|---|---|---|---|---|
| Baseline (PGD-PnP) | – | 31.58 | 30.78 | 35.26 | 33.64 |
| NPN [17] | – | 33.22 | 33.17 | 37.86 | 37.68 |
| GSNR w. \(\mathbf L_{8\text{nn}}\) | ✘ | 33.60 | 33.59 | 38.18 | 37.99 |
| GSNR w. \(\mathbf L_{8\text{nn}}\) | ✓ | 33.60 | 33.59 | 38.18 | 37.99 |

**图 5（原文 Figure 5）：** 扩散模型求解器（DPS [8] 与 DiffPIR [55]）在 Baseline、NPN [17] 与使用 \(\mathbf L_{4\text{nn}}\)、\(\mathbf L_{8\text{nn}}\) 的 GSNR 下的结果（\(p=0.1n\)）。

**图 6（原文 Figure 6）：** 使用 Lip-DnCNN 的 PnP-PGD 基线与 GSNR 变体（\(\mathbf L_{8\text{nn}}\)，含/不含零空间受限拉普拉斯正则项）的去模糊收敛曲线。

**图 7（原文 Figure 7）：** PnP、NPN 与 GSNR 在不同 \(\mathbf L\) 与去噪器下的结果比较。

## 6. 局限与讨论

GSNR 的一个局限是需要对零空间受限拉普拉斯 \(\mathbf T\) 做特征值分解（EVD）；在大图像尺度下这需要可观的算力。不过该计算对每组 \((\mathbf H,\mathbf L,n,p)\) 只需**离线做一次**，随后可复用于学习网络 \(G\) 与重建步骤；补充材料 A13 给出详细的运行时分析。此外，本方法面向**线性**逆问题；对非线性逆问题（如相位恢复）的适配需要仔细建模感知算子的可逆性质及其依赖输入的模糊性。近期工作 [14] 为神经网络（非线性函数）发展了零空间性质的推广，为学习最优零空间分量开辟了新前沿。

## 7. 结论与展望

我们提出了 **GSNR**：图平滑零空间表示——它让逆问题求解器不仅知道"测量约束了什么"，也知道"如何利用传感器永远看不到的自由度（零空间）"。GSNR 不对整幅图像做正则化，而是通过零空间受限拉普拉斯 \(\mathbf T=\mathbf P_n\mathbf L\mathbf P_n\) 为零空间 \({\rm Null}(\mathbf H)\) 构造与图平滑对齐的低维基，并可选地在推断时加入"仅零空间"图罚项。理论上，最平滑的 \(\mathbf T\) 模态对零空间分量是极小极大最优的；在 GMRF 先验下，它们可证能比无几何选择捕捉更多零空间方差，并与测量具有更强的统计耦合。实践中，这带来更好的合理解覆盖度、更高的零空间信号分量可预测性以及更好的条件数，进而转化为 PnP 与基于扩散的求解器更快、更稳定的收敛。展望未来，与其把 \(\mathbf L\) 固定为手工网格拉普拉斯，学习图结构或采用可解释的图神经算子，有望得到更能反映语义结构的数据自适应 GSNR 基；此外，对生成式求解器中 GSNR 的更严格研究，可能为在不破坏其概率解释的前提下把图平滑零空间约束注入这些框架提供有原则的途径。

**致谢。** 本工作受美国海军研究办公室（OFFICE OF NAVAL RESEARCH）资助，Grant W911NF2510165，项目名 "ADVANCED ALGORITHMS FOR DISTRIBUTED BEAMFORMING"。本文档所含观点与结论属作者本人，不应被解释为代表 OFFICE OF NAVAL RESEARCH 或美国政府的官方政策（明示或暗示）。

## 参考文献（英文原书目）

[1] Eirikur Agustsson and Radu Timofte. NTIRE 2017 challenge on single image super-resolution: Dataset and study. In The IEEE Conference on Computer Vision and Pattern Recognition (CVPR) Workshops, 2017.

[2] Daniel Otero Baguer, Johannes Leuschner, and Maximilian Schmidt. Computed tomography reconstruction using deep image prior and learned reconstruction methods. Inverse Problems, 36(9):094004, 2020.

[3] Bryce E Bayer. Color imaging array, 1976. US Patent 3,971,065.

[4] Martin Benning and Martin Burger. Modern regularization methods for inverse problems. Acta Numerica, 27:1–111, 2018.

[5] E. J. Candes and M. B. Wakin. An introduction to compressive sampling. IEEE Signal Processing Magazine, 25(2):21–30, 2008.

[6] Stanley H Chan, Xiran Wang, and Omar A Elgendy. Plug-and-play ADMM for image restoration: Fixed-point convergence and applications. IEEE Transactions on Computational Imaging, 3(1):84–98, 2016.

[7] Dongdong Chen and Mike E Davies. Deep decomposition learning for inverse imaging problems. In Computer Vision – ECCV 2020, 2020.

[8] Hyungjin Chung, Jeongsol Kim, Michael Thompson McCann, Marc Louis Klasky, and Jong Chul Ye. Diffusion posterior sampling for general noisy inverse problems. In The Eleventh International Conference on Learning Representations, 2023.

[9] Regev Cohen, Michael Elad, and Peyman Milanfar. Regularization by denoising via fixed-point projection (RED-PRO). SIAM Journal on Imaging Sciences, 14(3):1374–1406, 2021.

[10] Yuning Cui, Syed Waqas Zamir, Salman Khan, Alois Knoll, Mubarak Shah, and Fahad Shahbaz Khan. AdaIR: Adaptive all-in-one image restoration via frequency mining and modulation. In The Thirteenth International Conference on Learning Representations, 2025.

[11] Emanuele Dalsasso, Xiangli Yang, Loïc Denis, Florence Tupin, and Wen Yang. SAR image despeckling by deep neural networks: from a pre-trained model to an end-to-end training strategy. Remote Sensing, 2020.

[12] D. L. Donoho. De-noising by soft-thresholding. IEEE Transactions on Information Theory, 41(3):613–627, 1995.

[13] David L Donoho and Iain M Johnstone. Ideal spatial adaptation by wavelet shrinkage. Biometrika, 81(3):425–455, 1994.

[14] Yamit Ehrlich, Nimrod Berman, and Assaf Shocher. Pseudoinvertible neural networks, 2026.

[15] Yutong He, Naoki Murata, Chieh-Hsin Lai, Yuhta Takida, Toshimitsu Uesaka, Dongjun Kim, Wei-Hsiang Liao, Yuki Mitsufuji, J Zico Kolter, Ruslan Salakhutdinov, and Stefano Ermon. Manifold preserving diffusion models. 2024.

[16] Samuel Hurault, Antonin Chambolle, Arthur Leclaire, and Nicolas Papadakis. A relaxed proximal gradient descent algorithm for convergent plug-and-play with proximal denoiser. In International Conference on Scale Space and Variational Methods in Computer Vision, 2023.

[17] Roman Jacome, Romario Gualdrón-Hurtado, León Suárez-Rodríguez, and Henry Arguello. NPN: Non-Linear Projections of the Null-Space for Imaging Inverse Problems. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

[18] Ian T Jolliffe and Jorge Cadima. Principal component analysis: a review and recent developments. Philosophical Transactions of the Royal Society A, 374(2065):20150202, 2016.

[19] Vassilis Kalofolias. How to learn a graph from smooth signals. In Proceedings of the 19th International Conference on Artificial Intelligence and Statistics, pages 920–929, 2016.

[20] Ulugbek S. Kamilov, Charles A. Bouman, Gregery T. Buzzard, and Brendt Wohlberg. Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications. IEEE Signal Processing Magazine, 40(1):85–97, 2023.

[21] DP Kingma and J Ba. Adam: a method for stochastic optimization, 2014.

[22] Lingshun Kong, Jiangxin Dong, Jinhui Tang, Ming-Hsuan Yang, and Jinshan Pan. Efficient visual state space model for image deblurring. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2023.

[23] A. Krizhevsky. Learning multiple layers of features from tiny images. Master's thesis, University of Toronto, 2009.

[24] Richard B Lehoucq, Danny C Sorensen, and Chao Yang. ARPACK users' guide: solution of large-scale eigenvalue problems with implicitly restarted Arnoldi methods. SIAM, 1998.

[25] Ziwei Liu, Ping Luo, Xiaogang Wang, and Xiaoou Tang. Deep learning face attributes in the wild. In Proceedings of International Conference on Computer Vision (ICCV), 2015.

[26] Michael Lustig, David L Donoho, Juan M Santos, and John M Pauly. Compressed sensing MRI. IEEE Signal Processing Magazine, 25(2):72–82, 2008.

[27] Peyman Milanfar and Mauricio Delbracio. Denoising: a powerful building block for imaging, inverse problems and machine learning. Philosophical Transactions A, 383(2299):20240326, 2025.

[28] Sunil K Narang, Yung Hsuan Chao, and Antonio Ortega. Graph-wavelet filterbanks for edge-aware image processing. In 2012 IEEE Statistical Signal Processing Workshop (SSP), pages 141–144, 2012.

[29] Antonio Ortega, Pascal Frossard, Jelena Kovačević, José MF Moura, and Pierre Vandergheynst. Graph signal processing: Overview, challenges, and applications. Proceedings of the IEEE, 106(5):808–828, 2018.

[30] Neal Parikh and Stephen Boyd. Proximal algorithms. Foundations and Trends in Optimization, 1(3):127–239, 2014.

[31] Adam Paszke, Sam Gross, Francisco Massa, Adam Lerer, James Bradbury, Gregory Chanan, Trevor Killeen, Zeming Lin, Natalia Gimelshein, Luca Antiga, Alban Desmaison, Andreas Kopf, Edward Yang, Zachary DeVito, Martin Raison, Alykhan Tejani, Sasank Chilamkurthy, Benoit Steiner, Lu Fang, Junjie Bai, and Soumith Chintala. PyTorch: An imperative style, high-performance deep learning library. In Advances in Neural Information Processing Systems, 2019.

[32] Gabriel Peyré, Sébastien Bougleux, and Laurent Cohen. Non-local regularization of inverse problems. In Computer Vision – ECCV 2008, pages 57–68, 2008.

[33] Arash Rasti-Meymandi, Aboozar Ghaffari, and Emad Fatemizadeh. Plug and play augmented HQS: Convergence analysis and its application in MRI reconstruction. Neurocomputing, 518:1–14, 2023.

[34] Edward T Reehorst and Philip Schniter. Regularization by denoising: Clarifications and new interpretations. IEEE Transactions on Computational Imaging, 5(1):52–67, 2018.

[35] Yaniv Romano, Michael Elad, and Peyman Milanfar. The little engine that could: Regularization by denoising (RED). SIAM Journal on Imaging Sciences, 10(4):1804–1844, 2017.

[36] Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, and Björn Ommer. High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2022.

[37] Olaf Ronneberger, Philipp Fischer, and Thomas Brox. U-Net: Convolutional networks for biomedical image segmentation. In International Conference on Medical Image Computing and Computer-Assisted Intervention, 2015.

[38] Leonid I. Rudin, Stanley Osher, and Emad Fatemi. Nonlinear total variation based noise removal algorithms. Physica D: Nonlinear Phenomena, 60(1–4):259–268, 1992.

[39] Havard Rue and Leonhard Held. Gaussian Markov random fields: theory and applications. Chapman and Hall/CRC, 2005.

[40] Ernest Ryu, Jialin Liu, Sicheng Wang, Xiaohan Chen, Zhangyang Wang, and Wotao Yin. Plug-and-play methods provably converge with properly trained denoisers. In International Conference on Machine Learning, 2019.

[41] Johannes Schwab, Stephan Antholzer, and Markus Haltmeier. Deep null space learning for inverse problems: convergence analysis and rates. Inverse Problems, 35(2):025008, 2019.

[42] David I Shuman, Sunil K Narang, Pascal Frossard, Antonio Ortega, and Pierre Vandergheynst. The emerging field of signal processing on graphs: Extending high-dimensional data analysis to networks and other irregular domains. IEEE Signal Processing Magazine, 30(3):83–98, 2013.

[43] Julián Tachella, Matthieu Terris, Samuel Hurault, Andrew Wang, Leo Davy, Jérémy Scanvic, Victor Sechaud, Romain Vo, Thomas Moreau, Thomas Davies, Dongdong Chen, Nils Laurent, Brayan Monroy, et al. DeepInverse: A deep learning framework for inverse problems in imaging. 2024.

[44] Hong Ye Tan, Subhadip Mukherjee, and Junqi Tang. Solving imaging inverse problems using plug-and-play denoisers: Regularization and optimization perspectives, 2025.

[45] Matthieu Terris, Thomas Moreau, Nelly Pustelnik, and Julian Tachella. Equivariant plug-and-play image reconstruction. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2024.

[46] Jing Tian and Kai-Kuang Ma. A survey on super-resolution imaging. Signal, Image and Video Processing, 5:329–342, 2011.

[47] Xiangpeng Tian, Xiangyu Liao, Xiao Liu, Meng Li, and Chao Ren. Degradation-aware feature perturbation for all-in-one image restoration. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2025.

[48] Singanallur V. Venkatakrishnan, Charles A. Bouman, and Brendt Wohlberg. Plug-and-play priors for model based reconstruction. In 2013 IEEE Global Conference on Signal and Information Processing, 2013.

[49] Lizhi Wang, Chen Sun, Ying Fu, Min H Kim, and Hua Huang. Hyperspectral image reconstruction using a deep spatial-spectral prior. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019.

[50] Jinxi Xiang, Yonggui Dong, and Yunjie Yang. FISTA-Net: Learning a fast iterative shrinkage thresholding network for inverse problems in imaging. IEEE Transactions on Medical Imaging, 40(5):1329–1339, 2021.

[51] Jiahui Yu, Zhe Lin, Jimei Yang, Xiaohui Shen, Xin Lu, and Thomas S Huang. Generative image inpainting with contextual attention. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, 2018.

[52] Kai Zhang, Yawei Li, Wangmeng Zuo, Lei Zhang, Luc Van Gool, and Radu Timofte. Plug-and-play image restoration with deep denoiser prior. IEEE Transactions on Pattern Analysis and Machine Intelligence, 44(10):6360–6376, 2022.

[53] Kaihao Zhang, Wenqi Ren, Wenhan Luo, Wei-Sheng Lai, Björn Stenger, Ming-Hsuan Yang, and Hongdong Li. Deep image deblurring: A survey. International Journal of Computer Vision, 130(9):2103–2130, 2022.

[54] Bolei Zhou, Agata Lapedriza, Aditya Khosla, Aude Oliva, and Antonio Torralba. Places: A 10 million image database for scene recognition. IEEE Transactions on Pattern Analysis and Machine Intelligence, 40(6):1452–1464, 2018.

[55] Yuanzhi Zhu, Kai Zhang, Jingyun Liang, Jiezhang Cao, Bihan Wen, Radu Timofte, and Luc Van Gool. Denoising diffusion models for plug-and-play image restoration. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition Workshops, 2023.

## 图注与表注

**图注：** 图 1–7 的图注已随文置于相应位置（图 1、图 2 见第 1、4.1 节；图 3、图 4 见第 4.2 节；图 5 见第 5.2 节；图 6、图 7 见第 5.4 节）。图 1 展示真值、伴随重建、零空间投影与基于 4NN/8NN 的图零空间投影；图 2 为超分辨率的覆盖度与谱分析；图 3 为逐模态可预测性；图 4 为 CS 的覆盖度与可预测性；图 5 为扩散求解器定性比较；图 6 为去模糊收敛曲线；图 7 为不同图拉普拉斯与去噪器下的比较。

**表注：** 表 1（超分辨率与去马赛克 PSNR 比较，CelebA 测试集）与表 2（去模糊最终 PSNR，Places365/CelebA × Lip-DnCNN/小波）均已在本页逐格转写；原文以加粗与下划线区分各列最佳/次佳结果，本页按原文数值照录。

**本页范围与校对状态：** 本页覆盖原文摘要、第 1–7 节全部正文与小节（3.1–3.2、4.1–4.3、5.1–5.4）、式 (1)–(14)、定义 1、定理 1–2、命题 1、注 1–2、表 1–2（逐格转写）、图 1–7 图注、致谢、参考文献 [1]–[55]（英文原条目）。原文正文无附录（补充材料 A1–A13 为独立文件，本页按正文引用标注其位置而未展开）。**许可说明（重要）：** 原文为 CVPR 2026 会议论文集版本（Open Access 版本由 Computer Vision Foundation 提供），再传播许可条款待核验；本页为个人学习用途的中文译稿，**不计入可公开全文统计**，页首与页尾均保留该说明。**原文说明：** 表 2 中 GSNR 的 ✘/✓（是否启用零空间图罚项）两行数值完全相同，与正文"该罚项对最终 PSNR 影响可忽略"一致，本页照录。逐句逐式终校未做；供后续 QA 重点核对：式 (5)–(10) 的谱表述与覆盖度/可预测性定义、定理 1–2 的条件（\(\mu_{p+1}>0\)、\(\lambda_i=1/(\alpha\mu_i+\epsilon)\)）、表 1–2 数值。

{% endraw %}
