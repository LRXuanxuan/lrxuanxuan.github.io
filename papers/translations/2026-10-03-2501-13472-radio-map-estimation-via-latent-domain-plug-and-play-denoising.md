---
layout: page
title: "潜域即插即用去噪的无线电地图估计｜中文全文译文"
permalink: /papers/translations/2026-10-03-2501-13472-radio-map-estimation-via-latent-domain-plug-and-play-denoising/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1cbafcaa542d5384/) · [原文 arXiv](https://arxiv.org/abs/2501.13472) · [全部目录](/papers/catalog/)

# 潜域即插即用去噪的无线电地图估计

**原题：** Radio Map Estimation via Latent Domain Plug-and-Play Denoising  
**作者：** Le Xu、Lei Cheng、Junting Chen、Wenqiang Pu、Xiao Fu  
**单位：** L. Xu 与 X. Fu 为美国俄勒冈州立大学电气工程与计算机科学学院；L. Cheng 为浙江大学信息与电子工程学院（杭州，中国）；J. Chen 为香港中文大学（深圳）理工学院及深圳市未来网络智能研究院（FNii-Shenzhen）；W. Pu 为香港中文大学（深圳）深圳市大数据研究院。  
**版本：** arXiv:2501.13472v2（eess.SP），2025-06-26，原文 16 页（含 7 幅图、5 张表、附录 A—D）。  
**资助：** L. Cheng 受国家自然科学基金（NSFC）62371418 资助；J. Chen 受 NSFC 62171398 资助；L. Xu 与 X. Fu 受美国国家科学基金会（NSF）ECCS-2024058 资助；X. Fu 另受 NSF CCF-2210004 资助。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、附录 A—D、图 1—7 图注、表 I—V（逐格）、参考文献 [1]—[59] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2501.13472v1，2026-10-03"；本地 PDF 实为 **v2** 版本（arXiv:2501.13472v2 [eess.SP]，2025-06-26），"2026-10-03" 应为站点推荐日期而非论文提交日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

无线电地图估计（radio map estimation，RME），又称频谱制图（spectrum cartography），旨在从稀疏采样测量中重建不同域（如空间与频率）上的无线电干扰强度。为求解这一典型逆问题，最先进的 RME 方法依赖手工设计或数据驱动的无线电地图结构信息。然而，前者往往难以建模复杂的射频（RF）环境，后者需要大量训练——因而难以快速适应现场感知任务。本文提出一种基于即插即用（plug-and-play，PnP）去噪（源自计算成像的技术）的空—谱 RME 方法。其思路是利用这样一个观察：尽管自然图像与无线电地图等信号本身存在非平凡差异，它们的去噪操作却相似。因此，为自然图像设计或从自然图像学习的精巧去噪器可直接用于辅助 RME，避免使用无线电地图数据做训练。与传统直接在数据域操作的 PnP 方法不同，所提方法利用无线电地图的潜在物理结构，提出一种在潜域去噪的 ADMM 算法。该设计显著提升计算效率并增强噪声鲁棒性。本文还分析了若干理论层面，例如完整无线电地图的可恢复性与 ADMM 算法的收敛性。合成与真实数据实验验证了所提方法的有效性。

**索引词**：无线电地图估计；ADMM；即插即用去噪；张量补全；可恢复性分析。

## I. 引言

无线电地图估计（RME），又称频谱制图，旨在从稀疏获取的测量中构建跨不同域（如空间与频率）的接收信号指标（例如无线电干扰强度）地图。RME 对提升射频（RF）环境感知能力至关重要，也被视为更智能、更高效利用频谱资源的关键使能技术；见 [1]–[3]。

从信号处理角度看，RME 是一个不适定逆问题。与其他逆问题一样，RME 归结为对目标无线电地图施加恰当的结构约束以确保准确恢复。早期 RME 方法依赖手工构造的结构约束，例如平滑性、稀疏性 [4]–[6] 与低矩阵/张量秩 [7]–[9]。然而这些约束在实践中未必总成立，尤其是在复杂 RF 环境中（例如存在强阴影衰落时）。近期进展引入了数据驱动——尤其是基于深度学习——的结构约束。借助神经网络的表达能力，这些方法学习有效表示无线电地图的细节特征 [3, 10]–[14]。但基于神经网络的结构表示需要大量（历史或仿真生成的）无线电地图数据用于训练，而这些数据对于新环境或快速变化的环境往往不可得。

逆问题求解领域的一个显著进展是所谓即插即用（PnP）去噪框架 [15, 16]，它在计算成像界得到推广。PnP 方法利用精巧或深度学习得到的自然图像去噪器，求解其他类型数据的逆问题，例如海洋声速场（ocean sound speed field，SSF）数据 [17]、高光谱图像（HSI）数据 [18] 与磁共振成像（MRI）数据 [19, 20]。PnP 去噪的基本原理是：许多类型的数据（如自然图像与无线电地图）尽管数据特性不同，却共享相似的去噪过程——因为去噪归根结底是去除规则信号中的不规则扰动。PnP 方法的优势在于可直接利用大量成熟的自然图像去噪器（例如非局部均值（NLM）[21] 与 BM3D [22] 去噪器）；此外，由于自然图像丰富，基于深度神经网络的去噪器也易于训练 [23, 24]。

然而，把 PnP 去噪用于 RME 任务并不直接。现有大多数 PnP 去噪方法直接在数据域操作。在数据域对 RME 使用 PnP 可能带来可观计算量，因为无线电地图是高阶张量，而自然图像去噪器是为灰度或 RGB 图像设计的。此外，类张量信号（如无线电地图）在基于 PnP 去噪的处理下的可恢复性尚不清楚——而可恢复性正是此类估计问题的关键考量。即便对 PnP 算法数值行为中相对好理解的部分——收敛性——现有分析（如 [25]–[28]）也大多集中于数据无约束的表述；对于带有各种结构约束的无线电地图，这些分析不能直接适用。

**主要贡献。** 本工作为 RME 提出一种定制的 PnP 方法。具体贡献如下：

- **面向 RME 的潜域 PnP 去噪方法**：我们利用无线电地图的物理特性，为 RME 提出一种定制的 PnP 算法。注意到在合理条件下无线电地图容许一种空—谱分解，其中两个潜在分量分别表示感兴趣区域内的空间损耗场（spatial loss fields，SLFs）与发射机的功率谱密度（PSD）[4, 7, 10, 11, 29]–[31]。借助该分解，我们提出一种基于 PnP 的 ADMM 算法，仅对无线电地图的 SLF 使用灰度图像去噪器。这样，每个 ADMM 迭代中每个 SLF 只需一次去噪操作，计算负担相比数据域 PnP（每次 ADMM 迭代需要多得多的去噪操作）大幅降低。此外，显式利用无线电地图的分解结构天然更抗噪声。
- **可恢复性分析**：我们分析有限采样下真实无线电地图的可恢复性。借助隐式 PnP 正则化与线性去噪器的二次近端算子之间的联系 [27, 32, 33]，我们在自然图像中广泛使用的线性、对称图像去噪器下，为潜域 PnP 框架建立了样本复杂度界 [27, 28, 33, 34]。如前所述，PnP 去噪方法此前主要被视为计算框架，其统计特性（如可恢复性）研究甚少。[35] 是一个例外，但那里需要感知矩阵的受限等距性质（RIP），且结果针对数据域 PnP 去噪。我们的结果在不使用 RIP 的情况下填补了 RME 语境下的这一空白。
- **收敛性分析**：我们还为所提潜域 PnP 去噪 ADMM 算法提供收敛性支持。我们推广了数据域 PnP 的现有收敛结果 [25]，证明潜域方法在使用一大类去噪器时仍能达到不动点收敛。这一推广并非平凡，因为无线电地图的因子分解在目标函数中引入了非凸双线性项，而无线电地图的物理意义又引入了非负约束；这些复杂结构需要更细致的分析。除不动点收敛外，我们还证明：若采用线性去噪器，算法收敛到 Karush–Kuhn–Tucker（KKT）点。

我们在多种数据集上验证了所提基于 PnP 去噪的 RME 方法的有效性，包括基于统计模型的合成数据、基于射线追踪模型的合成数据以及真实数据。一个会议版本将发表于 ICASSP 2025 [36]，介绍潜域 PnP 去噪的基本思想；本期刊版本增加了额外的去噪器套件、分析了所构建估计器的可恢复性，并给出收敛性刻画。此外，与仅在有限统计无线电地图模型上做实验的会议版本不同，期刊版本在多种数据集上测试算法，包括统计模型 [37]、射线追踪模型 [38] 以及两个来自真实世界采集的数据集。

**记号**：本文中，$x\in\mathbb R$、$\mathbf x\in\mathbb R^N$、$\mathbf X\in\mathbb R^{M\times N}$ 与 $\mathcal X\in\mathbb R^{M\times N\times K}$ 分别表示标量、向量、矩阵与张量。$\mathbf X(i,j)$、$\mathbf X(i,:)$ 与 $\mathbf X(:,j)$ 分别表示 $\mathbf X$ 的第 $(i,j)$ 个元素、第 $i$ 行与第 $j$ 列；类似记号适用于向量与张量。$\operatorname{blkdiag}(\mathbf X_1,\ldots,\mathbf X_n)$ 表示第 $j$ 个对角块为 $\mathbf X_j$ 的分块对角矩阵。$\mathbf X$ 的值域空间记为 $\mathcal R(\mathbf X)$。指示函数 $\mathbf 1[\mathbf x\in\mathcal X]$ 在 $\mathbf x\in\mathcal X$ 时取 0，否则取 $+\infty$。$\mathbf 1_K\in\mathbb R^K$ 表示元素全为 1 的向量。$[N]$ 表示 1 到 $N$ 的全部整数集合，即 $\{1,2,\ldots,N\}$。符号 $\circ$ 与 $\circledast$ 分别表示外积与逐元素积（原文的逐元素积在 PDF 中为圆圈星形记号，本页统一记作 $\circledast$）。记号 $[\mathbf X]_+$ 表示把 $\mathbf X$ 投影到非负象限。

## II. 问题陈述与面临的挑战

### A. 问题陈述

考虑一个矩形区域内存在 $R$ 个发射机的场景。发射机在共享的 $K$ 个频带上发送信号。信号与环境（如建筑与树木）交互传播，因而传播不规则——在空间与频率上形成复杂的干扰功率传播图；见图 1。具体地，我们采用 [4, 7]–[11, 13] 中的问题设置：把矩形区域离散为 $M\times N$ 个网格，频率范围划分为 $K$ 个频点。目标是估计所有网格上离散化的功率谱密度（PSD）。这些离散 PSD 可紧凑地表示为一个三维无线电地图 $\mathcal X\in\mathbb R^{M\times N\times K}$，其中 $\mathcal X(m,n,k)$ 表示网格 $(m,n)$ 与频率 $k$ 处的 PSD。传感器稀疏部署在网格上，其位置由索引集合

$$
\Omega\subseteq\{(m,n)\mid m\in[M],\ n\in[N]\}
$$

收集。记号 $(m,n)\in\Omega$ 表示坐标 $(m,n)$ 的网格中存在传感器。假设网格 $(m,n)$ 处的传感器可测量接收信号在全部 $K$ 个频点上的 PSD。因此采样过程可建模为二值张量 $\mathcal O\in\{0,1\}^{M\times N\times K}$：若 $(m,n)\in\Omega$ 则 $\mathcal O(m,n,:)=\mathbf 1_K$，其余元素为零。用这些记号，观测测量可表示为

$$
\mathcal Y=\mathcal O\circledast(\mathcal X+\mathcal V),\tag{1}
$$

其中 $\mathcal V\in\mathbb R^{M\times N\times K}$ 表示噪声。RME 任务即从 $\mathcal Y$ 中重建 $\mathcal X$；另见图 1。

**图 1**：RME 任务示意。上方：空—谱无线电地图（左）与采样张量（右）；下方：利用稀疏测量（左）进行估计（右）。

### B. 现有方法

RME 任务显然是一个欠定、不适定的逆问题。传统逆问题求解技术，例如核插值 [4]–[6]、低秩矩阵补全 [9, 39] 与张量补全 [7, 8, 11]，已被用于求解 RME。这些方法往往效果不错，但当 RF 环境更具挑战（例如存在强阴影衰落）时性能可能退化。近期，基于深度学习的 RME 方法（如 [3, 10]–[14]）展现出捕获无线电地图复杂特征的良好能力。

利用深度学习做 RME 的一种常见方式是在收集到的无线电地图训练集 $\{\mathcal X_\ell\}_{\ell=1}^{L}$ 上训练神经网络。训练集可用成熟物理模型 [37]、数值仿真器 [38] 或真实世界历史数据获取。训练数据 $\mathcal X_\ell$ 被期望与目标无线电地图具有相似特性（如阴影衰落程度）。利用训练集，可训练神经预测器 $f_\theta(\cdot):\mathbb R^{M\times N\times K}\to\mathbb R^{M\times N\times K}$：

$$
\min_{\theta}\ \frac{1}{L}\sum_{\ell=1}^{L}\operatorname{div}\left(f_\theta(\mathcal O_\ell\circledast\mathcal X_\ell)\,\|\,\mathcal X_\ell\right),\tag{2}
$$

其中 $\operatorname{div}(\mathbf x\|\mathbf y)$ 表示某种散度（例如 $\mathbf x$ 与 $\mathbf y$ 的欧氏距离）。式（2）在概念上概括了早期学习类工作（如 [3, 12]–[14]）的思想。[10, 11] 更进一步，考虑训练 $\mathcal X_\ell$ 的生成模型，即 $\mathcal X_\ell=g_\beta(\mathbf q_\ell)$，其中 $g_\beta(\cdot):\mathbb R^d\to\mathbb R^{M\times N\times K}$ 把低维潜在表示映射到无线电地图的数据域。于是逆问题变为从观测中寻找低维 $\mathbf q$。这种基于生成模型的方法降低了训练的计算/建模复杂度，从而提升泛化能力 [10, 11]。

基于学习的 RME 在处理复杂 RF 环境方面有明显优势。但其缺点也很明显：第一，若训练集与测试场景存在分布失配，性能往往大幅下降，甚至需要重新训练，这阻碍了其快速适应新环境的能力；第二，考虑到 RF 配置的快速变化，获取高质量数据并非易事。

### C. 即插即用去噪

近年来，计算成像界提倡用 PnP 去噪框架求解逆问题 [15, 16, 19, 25, 27, 28]。PnP 的核心思想是引入成熟的图像去噪器来辅助处理其他类型数据（如海洋 SSF 与 MRI）的任务。例如，在从测量 $\mathbf y=\mathbf A\mathbf x$（$\mathbf A$ 为宽感知矩阵）恢复 $\mathbf x$ 的典型逆问题中，应用 PnP 框架从如下问题表述出发：

$$
\min_{\mathbf x,\mathbf z}\ \|\mathbf y-\mathbf A\mathbf x\|_2^2+\lambda r(\mathbf z)\tag{3a}
$$

$$
\text{s.t.}\quad \mathbf x=\mathbf z,\tag{3b}
$$

其中 $r(\cdot)$ 为假定的、用于刻画 $\mathbf x$ 特性的未显式指定的正则项，$\lambda$ 为正则参数。PnP 去噪框架的有趣之处在于 $r(\cdot)$ 不被显式指定，而由一个去噪操作来实现。为说明这一点，求解（3）的 ADMM [40] 算法在第 $j$ 次迭代包含如下步骤：

$$
\mathbf x^{(j+1)}\leftarrow\arg\min_{\mathbf x}\ \|\mathbf y-\mathbf A\mathbf x\|_2^2+\frac{\rho}{2}\|\mathbf x-\tilde{\mathbf x}^{(j)}\|_2^2\tag{4a}
$$

$$
\mathbf z^{(j+1)}\leftarrow\arg\min_{\mathbf z}\ \frac{\rho}{2\lambda}\|\mathbf z-\tilde{\mathbf z}^{(j)}\|_2^2+r(\mathbf z)\tag{4b}
$$

$$
\mathbf u^{(j+1)}\leftarrow\mathbf u^{(j)}+\mathbf x^{(j+1)}-\mathbf z^{(j+1)},\tag{4c}
$$

其中 $\tilde{\mathbf x}^{(j)}=\mathbf z^{(j)}-\mathbf u^{(j)}$、$\tilde{\mathbf z}^{(j)}=\mathbf x^{(j+1)}+\mathbf u^{(j)}$，$\mathbf u^{(j)}$ 为对偶变量，$\rho$ 为增广拉格朗日参数。值得注意的是，$\mathbf z$ 更新步（4b）可视为一个去噪过程——即希望用 $\mathbf z^{(j+1)}$ 从含噪版本 $\tilde{\mathbf z}^{(j)}$ 中提取信号，结构正则项 $r(\mathbf z)$ 充当先验信息。基于这一观察，把（4b）中的步骤替换为如下去噪操作是自然的 [15, 16]：

$$
\mathbf z^{(j+1)}\leftarrow D_\sigma(\tilde{\mathbf z}^{(j)}),\tag{5}
$$

其中 $D_\sigma$ 表示在噪声方差为 $\sigma^2$ 的噪声水平下工作的去噪器。

PnP 框架的主要假设是：许多类型的数据（如自然图像 [24, 25, 33]、MRI 图像 [19, 20]、海洋 SSF [17] 与层析图像 [27, 41]）共享相似的去噪过程。因此，可把成熟的自然图像去噪器用于许多其他类型信号，而无需为其开发或训练新去噪器。一些广泛使用的去噪器如下。

**1）线性去噪器**：许多来自图像处理的去噪器具有如下形式：

$$
D_\sigma(\tilde{\mathbf z}^{(j)})=\mathbf W\tilde{\mathbf z}^{(j)},\tag{6}
$$

其中 $\mathbf W\in\mathbb R^{MN\times MN}$ 为去噪矩阵，通常构造为对称的 [42]。经典去噪器，如盒式滤波器 [43]、高斯滤波器 [43] 与高斯混合模型（GMM）去噪器 [28, 44]，都是线性去噪器。此外，许多核去噪器也服从（6）的类似形式，但把滤波矩阵 $\mathbf W(\tilde{\mathbf z}^{(j)})$ 计算为 $\tilde{\mathbf z}^{(j)}$ 的函数；参见非局部均值（NLM）去噪器 [45] 及其对称化改型，如双随机梯度 NLM（DSG-NLM）去噪器 [27]。不过，在 ADMM PnP 去噪中，常见做法是在一定迭代次数后停止更新 $\mathbf W(\tilde{\mathbf z}^{(j)})$ [27]–[34]，例如在第 10 次迭代后固定 $\mathbf W=\mathbf W(\tilde{\mathbf z}^{(10)})$。因此这类去噪器在若干次迭代后本质上是线性的。

**2）非线性去噪器**：非线性去噪器设计更复杂，且可能比线性去噪器更强大，但分析起来更具挑战。最常用的非线性去噪器包括 BM3D 与基于深度神经网络的方法。

- **BM3D 去噪器**：BM3D 去噪器 [22] 以复杂而有结构的方式计算数据相关的滤波矩阵 $\mathbf W(\tilde{\mathbf z}^{(j)})$。具体地，BM3D 采用两阶段去噪：先硬阈值化，再做维纳滤波；两个阶段都在把图像中相似图像块堆叠而成的三维块上操作。在图像去噪领域，BM3D 被广泛用作基准 [42]。
- **深度神经去噪器**：深度去噪器（如 [23, 24]）可通过训练神经网络 $D_\sigma(\cdot):\mathbb R^{MN}\to\mathbb R^{MN}$ 学到：

$$
\min_{D_\sigma(\cdot)}\ \frac{1}{N}\sum_{\ell=1}^{N}\left\|\mathbf x_\ell-D_\sigma(\mathbf x_\ell+\mathbf v_\ell)\right\|_2^2,\tag{7}
$$

其中 $\{\mathbf x_\ell\}_{\ell=1}^{N}$ 为训练集，$\mathbf v_\ell$ 为方差 $\sigma^2$ 的随机噪声。由于自然图像丰富，训练此类去噪器相对容易。

### D. RME 语境下的挑战

把 PnP 框架（3）（4）直接用于 RME 任务，得到如下问题表述：

$$
\min_{\mathcal X,\mathcal Z}\ \|\mathcal O\circledast(\mathcal Y-\mathcal X)\|_F^2+\lambda r(\mathcal Z),\qquad\text{s.t.}\quad \mathcal X=\mathcal Z,\tag{8}
$$

且实现（4b）中的步骤需要对 $\mathcal X+\mathcal U$ 施加去噪器。然而 $\mathcal X$ 是尺寸为 $M\times N\times K$ 的三维张量，而典型图像去噪器是在二维灰度或 RGB 图像上训练的。为适应这一不匹配，一种方式是在（4b）步骤中把灰度图像去噪器重复应用 $K$ 次，导致高计算复杂度（见例如 [17, 18]）。另一个挑战在于理论理解：PnP 去噪方法的统计特性（如样本复杂度与可恢复性）受到的关注有限。现有分析基本逆模型（3）可恢复性的工作依赖感知矩阵 $\mathbf A$ 的 RIP 假设 [32, 35]，但这些无法回答 RME 语境下的关键问题——例如，多少传感器测量足以把真实无线电地图恢复到一定精度？此外，许多工作分析了 PnP ADMM 在 $\mathcal X$ 除 $r(\cdot)$ 正则外不受约束时的收敛性质（见例如 [25]–[28]）；但当无线电地图 $\mathcal X$ 具有复杂结构约束（正如我们将利用的）时，设计兼顾这些约束并保持收敛保证的 ADMM 更新并不简单。

## III. 提出方法

### A. 问题形式化

为提出面向 RME 定制的 PnP 去噪方法，我们的想法是把去噪器施加于无线电地图的**潜在因子**上。具体地，对无线电地图采用如下模型：

$$
\mathcal X(m,n,k)=\sum_{r=1}^{R}S_r(m,n)c_r(k)\iff\mathcal X=\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r,\tag{9}
$$

其中 $\mathbf S_r\in\mathbb R^{M\times N}$ 表示发射机 $r$ 在该区域上的空间损耗场（SLF），$\mathbf c_r\in\mathbb R^{K}$ 表示发射机 $r$ 在 $K$ 个频带上的 PSD，$\circ$ 表示外积，即 $[\mathbf x\circ\mathbf y]_{i,j,k}=\mathbf x(i,j)\mathbf y(k)$。根据物理含义，$\mathbf S_r$ 与 $\mathbf c_r$ 均非负。图 2 给出示意。该模型已被证明对在相对窄带上测得的无线电地图有效 [4, 8, 10, 11, 13, 30]。

**图 2**：无线电地图分解模型示意（各发射机的 SLF $\mathbf S_1,\mathbf S_2$ 与 PSD $\mathbf c_1,\mathbf c_2$ 通过外积叠加）。

在（9）下，我们提出如下形式化目标：

$$
\min_{\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R}}\ \left\|\mathcal O\circledast\left(\mathcal Y-\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r\right)\right\|_F^2+\lambda\sum_{r=1}^{R}r(\mathbf S_r)+\zeta\sum_{r=1}^{R}\mathbf c_r^T\mathbf c_r,\tag{10a}
$$

$$
\text{s.t.}\quad \mathbf S_r\ge0,\ \mathbf c_r\ge0,\ \forall r\in[R],\tag{10b}
$$

其中 $\mathcal Y$ 由（1）定义，$r(\cdot)$ 为与去噪器相关的正则项，$\mathbf c_r^T\mathbf c_r$ 项用于让形式化更稳定，$\lambda$ 与 $\zeta$ 为正则参数。

在（10）中，$r(\cdot)$ 被施加于 SLF 上，而 SLF 构成（9）中的空间潜在因子。可以看到，这有助于设计比数据域形式化（8）所导出的更高效的 PnP 去噪算法。

### B. 所提算法

我们提出用 ADMM 求解（10）。首先把（10）改写为

$$
\min_{\{\mathbf S_r,\mathbf Z_r,\mathbf c_r\}_{r=1}^{R}}\ \left\|\mathcal O\circledast\left(\mathcal Y-\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r\right)\right\|_F^2+\lambda\sum_{r=1}^{R}r(\mathbf Z_r)+\zeta\sum_{r=1}^{R}\mathbf c_r^T\mathbf c_r,\qquad\text{s.t.}\ \mathbf S_r\ge0,\ \mathbf S_r=\mathbf Z_r,\ \mathbf c_r\ge0,\ \forall r\in[R].\tag{11}
$$

（11）的增广拉格朗日为

$$
\begin{aligned}
\mathcal L_\rho\left(\{\mathbf S_r,\mathbf c_r,\mathbf Z_r,\boldsymbol\Psi_r\}_{r=1}^{R}\right)&=\left\|\mathcal O\circledast\left(\mathcal Y-\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r\right)\right\|_F^2+\lambda\sum_{r=1}^{R}r(\mathbf Z_r)+\sum_{r=1}^{R}\left(\frac{\rho}{2}\|\mathbf S_r-\mathbf Z_r+\boldsymbol\Psi_r\|_F^2-\frac{\rho}{2}\|\boldsymbol\Psi_r\|_F^2\right)\\
&\quad+\zeta\sum_{r=1}^{R}\mathbf c_r^T\mathbf c_r,
\end{aligned}\tag{12}
$$

其中 $\rho$ 为增广拉格朗日参数，$\boldsymbol\Psi_r\in\mathbb R^{M\times N}$ 为缩放对偶变量 [40]。

ADMM 算法迭代更新原始变量 $\{\mathbf Z_r\}_{r=1}^{R}$、$\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R}$ 与对偶变量 $\{\boldsymbol\Psi_r\}_{r=1}^{R}$，具体更新如下。

**1）$\{\mathbf Z_r\}_{r=1}^{R}$ 更新**：关于 $\{\mathbf Z_r\}_{r=1}^{R}$ 最小化（12）可对每个 $r$ 解耦，即

$$
\mathbf Z_r\leftarrow\arg\min_{\mathbf Z_r}\ r(\mathbf Z_r)+\frac{\rho}{2\lambda}\|\mathbf S_r-\mathbf Z_r+\boldsymbol\Psi_r\|_F^2.\tag{13}
$$

与求解（4b）类似，关于每个 $\mathbf Z_r$ 求解（13）可视为噪声方差为 $\lambda/\rho$ 的去噪问题。因此 $\mathbf Z_r$ 可通过下式更新：

$$
\mathbf Z_r=D_{\sqrt{\lambda/\rho}}(\mathbf S_r+\boldsymbol\Psi_r),\tag{14}
$$

其中按文献 [15, 16] 设 $\sigma=\sqrt{\lambda/\rho}$。由（13）（14）可见，去噪器只需应用 $R$ 次，通常远小于 $K$——相比在数据域形式化（8）下求解去噪步，这节省大量时间。

**2）$\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R}$ 更新**：先把（12）中所有项重新表示为向量或矩阵形式。引入 $\mathcal Y$ 的矩阵化：

$$
\mathbf Y=[\mathcal Y(1,1,:),\mathcal Y(2,1,:),\ldots,\mathcal Y(M,N,:)]\,.\tag{15}
$$

此外，定义集合 $\Omega_{\mathrm{vec}}\subseteq[MN]$，使得 $(m,n)\in\Omega\iff n(M-1)+m\in\Omega_{\mathrm{vec}}$。于是 $\mathcal O\circledast\mathcal Y$ 中的非零元可用 $\mathbf Y(:,\Omega_{\mathrm{vec}})$ 表示，后者取出 $\mathbf Y$ 中所有被测量的列；图 3 给出 $\mathbf Y(:,\Omega_{\mathrm{vec}})$ 的示意。若无噪声，则下式成立：

$$
\mathbf Y(:,\Omega_{\mathrm{vec}})=\sum_{r=1}^{R}\mathbf c_r\mathbf s_r(\Omega_{\mathrm{vec}})^T,\tag{16}
$$

其中 $\mathbf s_r=\operatorname{vec}(\mathbf S_r)$。再定义 $\Omega_{\mathrm{vec}}^{\complement}=[MN]\setminus\Omega_{\mathrm{vec}}$，则 $\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R}$ 子问题可改写为

$$
\begin{aligned}
\min_{\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R}}\ &\left\|\mathbf Y(:,\Omega_{\mathrm{vec}})-\sum_{r=1}^{R}\mathbf c_r\mathbf s_r(\Omega_{\mathrm{vec}})^T\right\|_F^2+\frac{\rho}{2}\sum_{r=1}^{R}\left\|\mathbf s_r(\Omega_{\mathrm{vec}})-\mathbf z_r(\Omega_{\mathrm{vec}})+\boldsymbol\psi_r(\Omega_{\mathrm{vec}})\right\|_F^2+\zeta\sum_{r=1}^{R}\mathbf c_r^T\mathbf c_r\\
&+\frac{\rho}{2}\sum_{r=1}^{R}\left\|\mathbf s_r(\Omega_{\mathrm{vec}}^{\complement})-\mathbf z_r(\Omega_{\mathrm{vec}}^{\complement})+\boldsymbol\psi_r(\Omega_{\mathrm{vec}}^{\complement})\right\|_F^2,\qquad
\end{aligned}\tag{17}
$$

$$
\text{s.t.}\quad \mathbf s_r\ge0,\ \mathbf c_r\ge0,\ \forall r\in[R],
$$

其中 $\mathbf z_r=\operatorname{vec}(\mathbf Z_r)$、$\boldsymbol\psi_r=\operatorname{vec}(\boldsymbol\Psi_r)$。显然，在（17）中 $\{\mathbf s_r(\Omega_{\mathrm{vec}}),\mathbf c_r\}_{r=1}^{R}$ 与 $\{\mathbf s_r(\Omega_{\mathrm{vec}}^{\complement})\}_{r=1}^{R}$ 互不耦合，故可分别求解。关于 $\{\mathbf s_r(\Omega_{\mathrm{vec}}),\mathbf c_r\}_{r=1}^{R}$ 的最小化可视为带正则的非负矩阵分解（NMF）问题。NMF 有许多现成算法；这里采用分层交替最小二乘（HALS）方法 [46]，以块坐标下降（BCD）方式对不同 $r$ 的 $\mathbf s_r(\Omega_{\mathrm{vec}})$ 与 $\mathbf c_r$ 迭代更新。具体更新为

$$
\mathbf s_r(\Omega_{\mathrm{vec}})=\left[\frac{1}{\mathbf c_r^T\mathbf c_r+\frac{\rho}{2}}\left(\frac{\rho}{2}\left(\mathbf z_r(\Omega_{\mathrm{vec}})-\boldsymbol\psi_r(\Omega_{\mathrm{vec}})\right)+\left(\mathbf Y(:,\Omega_{\mathrm{vec}})-\sum_{r'\neq r}^{R}\mathbf c_{r'}\mathbf s_{r'}(\Omega_{\mathrm{vec}})^T\right)^T\mathbf c_r\right)\right]_+,\tag{18}
$$

$$
\mathbf c_r=\left[\frac{\left(\mathbf Y(:,\Omega_{\mathrm{vec}})-\sum_{r'\neq r}^{R}\mathbf c_{r'}\mathbf s_{r'}(\Omega_{\mathrm{vec}})^T\right)\mathbf s_r(\Omega_{\mathrm{vec}})}{\mathbf s_r(\Omega_{\mathrm{vec}})^T\mathbf s_r(\Omega_{\mathrm{vec}})+\zeta}\right]_+.\tag{19}
$$

对于 $\mathbf s_r(\Omega_{\mathrm{vec}}^{\complement})$，可通过最小化（17）的最后一行求解，得到更新

$$
\mathbf s_r(\Omega_{\mathrm{vec}}^{\complement})=\left[\mathbf z_r(\Omega_{\mathrm{vec}}^{\complement})-\boldsymbol\psi_r(\Omega_{\mathrm{vec}}^{\complement})\right]_+.\tag{20}
$$

**3）$\{\boldsymbol\Psi_r\}_{r=1}^{R}$ 更新**：对偶变量 $\boldsymbol\Psi_r$ 可按标准 ADMM 方案（4c）更新：

$$
\boldsymbol\Psi_r=\boldsymbol\Psi_r+\mathbf S_r-\mathbf Z_r.\tag{21}
$$

所提**潜域 ADMM 即插即用去噪（LaPnP）**算法总结于算法 1。

**算法 1**　LaPnP：求解（10）

**输入**：观测张量 $\mathcal Y$、采样张量 $\mathcal O$、发射机数 $R$、增广拉格朗日参数 $\rho$、$\eta\in(0,1]$ 与 $\gamma>1$；
初始化 $\{\mathbf s_r,\mathbf c_r,\mathbf z_r,\boldsymbol\psi_r\}_{r=1}^{R}$；
**while** 未收敛 **do**
　用（14）更新 $\{\mathbf Z_r\}_{r=1}^{R}$；
　**for** $j=1$ 到 $J$ **do**
　　用（18）—（20）更新 $\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R}$；
　**end for**
　用（21）更新 $\{\boldsymbol\Psi_r\}_{r=1}^{R}$；
　**if** $\triangle^t\ge\eta\triangle^{t-1}$ **then**
　　$\rho\leftarrow\gamma\rho$；
　**end if**
**end while**

**图 3**：测量矩阵化示意。左：测量 $\mathcal O\circledast\mathcal Y$；右：$\mathbf Y(:,\Omega_{\mathrm{vec}})$。

### C. 进一步讨论

**1）初始化**：（10）是非凸问题，好的初始化往往有助于获得高质量解。这里采用与 [10] 类似的两步法初始化 $\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R}$。首先通过求解如下问题初始化 $\{\mathbf s_r(\Omega_{\mathrm{vec}}),\mathbf c_r\}_{r=1}^{R}$：

$$
\min_{\{\mathbf s_r(\Omega_{\mathrm{vec}}),\mathbf c_r\}_{r=1}^{R}}\ \left\|\mathbf Y(:,\Omega_{\mathrm{vec}})-\sum_{r=1}^{R}\mathbf c_r\mathbf s_r(\Omega_{\mathrm{vec}})^T\right\|_F^2,\qquad\text{s.t.}\ \mathbf s_r(\Omega_{\mathrm{vec}})\ge0,\ \mathbf c_r\ge0,\ \forall r\in[R],\tag{22}
$$

这是一个标准 NMF 问题。采用逐次投影算法（SPA）[47, 48]——一种基于贪婪搜索的自字典算法——求解（22）。当 PSD 相对稀疏时，该初始化尤其有用。之后采用最近邻插值法初始化未测量元素 $\{\mathbf s_r(\Omega_{\mathrm{vec}}^{\complement})\}_{r=1}^{R}$。对于 $\{\mathbf z_r,\boldsymbol\psi_r\}_{r=1}^{R}$，初始化为全零。

**2）非精确 HALS**：注意用于求解 $\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R}$ 子问题的 HALS 是迭代算法；若运行到收敛可能耗时很长，使算法 1 的内循环过慢。本工作采用非精确更新策略：把 HALS 的迭代次数固定为 $J$（实验中取 $J=20$ 这样的小整数）。由于 $J$ 较小，$\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R}$ 子问题可能未被精确求解；但如下文所示，即使在这种非精确子问题求解方案下，ADMM 算法仍保证收敛。

**3）$\rho$ 更新**：在 ADMM 迭代中增大 $\rho$ 可增强收敛性能 [25, 49]。沿用 [25] 中的策略，通过观察如下残差更新 $\rho$：

$$
\triangle^t=\frac{1}{\sqrt{MN}}\sum_{r=1}^{R}\left(\|\mathbf s_r^{(t)}-\mathbf s_r^{(t-1)}\|_2+\|\mathbf z_r^{(t)}-\mathbf z_r^{(t-1)}\|_2+\|\boldsymbol\psi_r^{(t)}-\boldsymbol\psi_r^{(t-1)}\|_2\right),\tag{23}
$$

其中 $t$ 为迭代序号。给定预先指定的 $\eta\in(0,1]$ 与 $\gamma>1$，若 $\triangle^t\ge\eta\triangle^{t-1}$ 则把 $\rho$ 替换为 $\gamma\rho$，否则保持不变。本文设 $\eta=0.95$、$\gamma=1.1$。

## IV. 性能分析

本节给出所提方法的性能刻画。

### A. 线性去噪下的可恢复性分析

第一个问题是我们形式化（10）的可恢复性——即，记 $\{\mathbf S_r^\star,\mathbf c_r^\star\}_{r=1}^{R}$ 为（10）的任一最优解、$\mathcal X^\natural$ 为真实无线电地图，能否建立 $\mathcal X^\star\approx\mathcal X^\natural$，其中 $\mathcal X^\star=\sum_{r=1}^{R}\mathbf S_r^\star\circ\mathbf c_r^\star$？

若 $r(\cdot)$ 有显式表达式，可恢复性分析类似于结构张量/矩阵补全的分析（见例如 [10, 11]）。然而在本工作中，结构正则项 $r(\cdot)$ 由去噪器 $D_\sigma(\cdot)$ 隐式实现。在 $\mathcal X^\natural$ 的潜域中、于未知 $r(\cdot)$ 下分析可恢复性通常很困难。最接近的工作是 [35]，其在压缩感知设置下进行，但它在数据域工作并依赖感知矩阵的 RIP 条件——二者都不适用于我们的设置。在采用复杂去噪器 $D_\sigma$（如深度去噪器或核去噪器）的 PnP 框架下建立可恢复性是一项具有挑战性的任务。本工作为线性去噪器情形给出（10）的可恢复性分析。为此作如下假设：

**假设 1**：对 $D_\sigma(\mathbf x)=\mathbf W\mathbf x$，$\mathbf W\in\mathbb R^{MN\times MN}$ 非负、对称且不可约 [50]。此外，$\mathbf W$ 的特征值（记为 $\lambda_i(\mathbf W)$，$i=1,\ldots,MN$）按降序排列，满足 $\lambda_1(\mathbf W)\le1$ 且对所有 $i>1$ 有 $\lambda_i(\mathbf W)\in[0,1)$。

许多线性去噪器（例如第 II-C 节提到的那些）都是非负、对称且不可约的 [27, 28, 42, 45]。此外，DSG-NLM、盒式去噪器、高斯滤波器与 GMM 去噪器（见第 II-C 节）均已知满足 $\lambda_1(\mathbf W)\le1$ 且对所有 $i>1$ 有 $\lambda_i(\mathbf W)\in[0,1)$ [28, 42]。例如，[27] 表明 DSG-NLM 中的去噪矩阵 $\mathbf W$ 是双随机（即行、列均为随机）且本原的 [51]；因此由 Perron–Frobenius 定理 [51]，此类 $\mathbf W$ 的最大特征值为 1，且该特征值的代数重数为 1 [27]。

利用假设 1，我们引用图像去噪中的如下经典结果 [27, 28, 32]–[34]：

**引理 1**：考虑近端算子

$$
\mathbf z^\star=\arg\min_{\mathbf z}\ \frac{\rho}{2\lambda}\|\mathbf E-\mathbf Z\|_F^2+r(\mathbf Z),\tag{24}
$$

其中 $\mathbf Z=\operatorname{mat}(\mathbf z)$。若 $\mathbf z^\star=\mathbf W\mathbf e$（$\mathbf e=\operatorname{vec}(\mathbf E)$），且 $\mathbf W$ 满足假设 1，则相应的 $r(\cdot)$ 可表示为

$$
r(\mathbf Z)=\frac{\rho}{2\lambda}\mathbf z^T\widetilde{\mathbf Q}(\widetilde{\boldsymbol\Lambda}^{-1}-\mathbf I)\widetilde{\mathbf Q}^T\mathbf z+\mathbf 1[\mathbf z\in\mathcal R(\widetilde{\mathbf Q})],\tag{25}
$$

其中 $\mathbf W=[\widetilde{\mathbf Q},\widetilde{\mathbf Q}^c]\operatorname{blkdiag}(\widetilde{\boldsymbol\Lambda},\mathbf 0)[\widetilde{\mathbf Q},\widetilde{\mathbf Q}^c]^T$ 为 $\mathbf W$ 的特征分解，$\widetilde{\mathbf Q}\in\mathbb R^{MN\times L}$ 与 $\widetilde{\mathbf Q}^c$ 分别为与非零特征值 $\widetilde{\boldsymbol\Lambda}\in\mathbb R^{L\times L}$ 和零特征值 $\mathbf 0$ 对应的特征向量。

借助引理 1，问题（10）可表示为如下显式形式：

$$
\min_{\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R}}\ \left\|\mathcal O\circledast\left(\mathcal Y-\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r\right)\right\|_F^2+\frac{\rho}{2}\sum_{r=1}^{R}\mathbf s_r^T\widetilde{\mathbf Q}_r(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\widetilde{\mathbf Q}_r^T\mathbf s_r+\zeta\sum_{r=1}^{R}\mathbf c_r^T\mathbf c_r,\tag{26}
$$

$$
\text{s.t.}\quad \mathbf S_r\ge0,\ \mathbf s_r\in\mathcal R(\widetilde{\mathbf Q}_r),\ \mathbf c_r\ge0,\ \forall r\in[R],
$$

其中约束 $\mathbf s_r\in\mathcal R(\widetilde{\mathbf Q}_r)$ 来自（25）中的指示函数。把（26）中的目标函数记为 $v_{\mathrm{obj}}(\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R})$。（26）的最优解可由下述引理刻画：

**引理 2**：假设对 $r\in[R]$，$\mathbf W_r=[\widetilde{\mathbf Q}_r,\widetilde{\mathbf Q}_r^c]\operatorname{blkdiag}(\widetilde{\boldsymbol\Lambda}_r,\mathbf 0)[\widetilde{\mathbf Q}_r,\widetilde{\mathbf Q}_r^c]^T$ 满足假设 1，且 $|\Omega|>1$。记 $(\{\mathbf S_r^\star,\mathbf c_r^\star\}_{r=1}^{R})$ 为（10）的任一最优解。则 $\mathbf G=\mathbf Q^T\boldsymbol\Xi^T\boldsymbol\Xi\mathbf Q+\frac{\rho}{2}(\boldsymbol\Lambda^{-1}-\mathbf I)$ 满秩，其中 $\mathbf Q=\operatorname{blkdiag}(\widetilde{\mathbf Q}_1,\ldots,\widetilde{\mathbf Q}_R)$、$\boldsymbol\Lambda=\operatorname{blkdiag}(\widetilde{\boldsymbol\Lambda}_1,\ldots,\widetilde{\boldsymbol\Lambda}_R)$、$\boldsymbol\Xi=[\operatorname{diag}(\mathbf o)\otimes\mathbf c_1^\star,\operatorname{diag}(\mathbf o)\otimes\mathbf c_2^\star,\ldots,\operatorname{diag}(\mathbf o)\otimes\mathbf c_R^\star]$，$\mathbf o\in\{0,1\}^{MN}$ 满足 $\mathbf o(\Omega_{\mathrm{vec}})=1$、$\mathbf o(\Omega_{\mathrm{vec}}^{\complement})=0$。此外有

$$
\sum_{r=1}^{R}\|\mathbf c_r^\star\|_2^2\le\frac{v_{\mathrm{obj}}^\natural}{\zeta}\triangleq\alpha,\tag{27a}
$$

$$
\sum_{r=1}^{R}\|\mathbf S_r^\star\|_F^2\le\frac{\left(\sqrt{2v_{\mathrm{obj}}^\natural}+\|\mathcal O\circledast\mathcal Y\|_F\right)^2}{\lambda_{\min}(\mathbf G)}\triangleq\beta,\tag{27b}
$$

其中 $v_{\mathrm{obj}}^\natural\triangleq v_{\mathrm{obj}}(\{\mathbf S_r^\natural,\mathbf c_r^\natural\}_{r=1}^{R})$，$\lambda_{\min}(\mathbf G)>0$ 表示 $\mathbf G$ 的最小特征值。

**证明**：见附录 A。

该引理对（26）的任一最优解施加了隐式约束。基于该引理，定义如下概念。

**定义 1（最优解集）**：（26）的最优解集 $\mathcal X_{\mathrm{sol}}$ 定义为

$$
\mathcal X_{\mathrm{sol}}=\left\{\mathcal X\ \middle|\ \mathcal X=\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r,\ \mathbf S_r\ge0,\ \sum_{r=1}^{R}\|\mathbf S_r\|_F^2\le\beta,\ \mathbf c_r\ge0,\ \sum_{r=1}^{R}\|\mathbf c_r\|_F^2\le\alpha\right\}.\tag{28}
$$

为继续推导，使用如下量：

**定义 2（采样诱导间隙）**：由 $\Omega$ 诱导的间隙定义为

$$
\operatorname{Gap}^\star(\Omega)=\sup_{\widetilde{\mathcal X}\in\mathcal X_{\mathrm{sol}}}\left|\frac{\|\mathcal O\circledast(\mathcal Y-\widetilde{\mathcal X})\|_F}{\sqrt{|\Omega|K}}-\frac{\|\mathcal Y-\widetilde{\mathcal X}\|_F}{\sqrt{MNK}}\right|.\tag{29}
$$

$\operatorname{Gap}^\star(\Omega)$ 表示（26）的任一最优解在 $\Omega$ 上的经验拟合误差与在整个 $[M]\times[N]\times[K]$ 上的拟合误差之间的最大差距；类似定义见 [10, 11, 52]。利用上述定义与引理，可得如下结果。

**定理 1（可恢复性）**：对（10）的任一最优解，如下不等式成立：

$$
\frac{1}{\sqrt{MNK}}\left\|\mathcal X^\star-\mathcal X^\natural\right\|_F\le\frac{\sqrt{v_{\mathrm{obj}}^\natural}}{\sqrt{|\Omega|K}}+\frac{1}{\sqrt{MNK}}\|\mathcal V\|_F+\operatorname{Gap}^\star(\Omega),\tag{30}
$$

其中 $\mathcal V$ 表示噪声。此外，以概率 $1-\delta$，

$$
\operatorname{Gap}^\star(\Omega)\le\sqrt{\frac{\epsilon^2}{|\Omega|}+\frac{\epsilon^2}{MN}+\varepsilon(\Omega,\delta,\epsilon)},
$$

其中

$$
\varepsilon(\Omega,\delta,\epsilon)=\sqrt{\left(\frac{1}{|\Omega|}-\frac{1}{MN}+\frac{1}{MN|\Omega|}\right)\frac{\xi^2}{2}\log\left(\frac{2N(\mathcal X_{\mathrm{sol}},\epsilon)}{\delta}\right)},
$$

$\xi\triangleq\frac{1}{K}(K\iota^2+\alpha\beta)$、$\iota=\|\mathcal Y\|_\infty$，$N(\mathcal X_{\mathrm{sol}},\epsilon)$ 表示 $\mathcal X_{\mathrm{sol}}$ 的 $\epsilon$-网的覆盖数。

**证明**：见附录 B。

在定理 1 的证明中，我们使用了与 [10] 类似的思想。例如，用间隙项（29）度量经验损失与真实损失之间的距离，用覆盖数刻画解集。定理 1 表明（10）的最优解接近真实值 $\mathcal X^\natural$。特别地，当样本数 $|\Omega|$ 足够大时，（30）中的 $\operatorname{Gap}^\star(\Omega)$ 可合理变小。此外，正则参数 $\rho$ 与 $\zeta$ 的选择对（30）的上界起重要作用：$\rho$、$\zeta$ 越大，根据（27）$\mathbf S^\star$ 与 $\mathbf C^\star$ 的解集越受限，从而 $N(\mathcal X_{\mathrm{sol}},\epsilon)$ 越小，（30）中的 $\operatorname{Gap}^\star(\Omega)$ 也越小；但（30）中依赖 $v_{\mathrm{obj}}^\natural$ 的第一项可能增大，因为更大的 $\rho$、$\zeta$ 会使（30）中的正则项整体更大。

### B. 收敛性分析

PnP 去噪下 ADMM 的收敛性已在文献中广泛研究（见例如 [25]–[28, 33]）。然而我们的形式化在潜域使用 PnP 去噪器，且空—谱分解使问题本质非凸；$\mathbf S_r$ 与 $\mathbf c_r$ 上的非负约束也使问题结构比现有分析更复杂。此类问题结构下的收敛行为需要专门分析。

本节推广 [25] 对数据域 ADMM PnP 去噪算法的分析，证明所提算法对一大类去噪器实现不动点收敛。需要说明，[25] 证明的推广并非平凡：在潜域处理 PnP 去噪器并处理 $\mathbf S_r$ 与 $\mathbf c_r$ 的非负性会带来新的复杂性。如下文所示，HALS 的特殊更新规则在建立算法 1 的收敛性中起关键作用。此外，我们将证明：对满足假设 1 的线性去噪器，算法不仅收敛到不动点，还到达问题（10）的 KKT 点——这比 [25] 的结论更强。与 [25] 类似，采用如下假设：

**假设 2**：去噪器有界，即

$$
\frac{\|D_\sigma(\mathbf X)-\mathbf X\|_F^2}{MN}\le\sigma^2C,\tag{31}
$$

其中 $\mathbf X\in\mathbb R^{M\times N}$，$\sigma^2=\lambda/\rho$ 表示噪声功率，$C$ 为与 $M,N,\sigma$ 无关的常数。

**假设 3**：函数 $f(\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R})=\left\|\mathcal O\circledast\left(\mathcal Y-\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r\right)\right\|_F^2$ 关于每个 $\mathbf s_r=\operatorname{vec}(\mathbf S_r)$ 的偏梯度有界，即存在 $L<\infty$ 使得

$$
\left\|\nabla_{\mathbf s_r}f(\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R})\right\|_2/\sqrt{MN}\le L.\tag{32}
$$

由于 $f(\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R})$ 是二次函数，其关于 $\mathbf s_r$ 的偏梯度取决于经验误差 $\mathcal O\circledast(\mathcal Y-\sum_{r=1}^{R}\mathbf S_r\circ\mathbf c_r)$ 与 $\mathbf c_r$。因此假设 3 本质上要求：在算法 1 的任一次迭代中，经验误差或 $\mathbf c_r$ 不会任意变大。该假设通常是合理的，因为较大的误差项会被（10）中的 $f(\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R})$ 惩罚，而较大的 $\mathbf c_r$ 会被 $\zeta\mathbf c_r^T\mathbf c_r$ 抑制。

**定理 2（不动点收敛）**：假设假设 2 与 3 成立，则算法 1 的迭代收敛到不动点。换言之，存在 $\{\bar{\mathbf s}_r,\bar{\mathbf c}_r,\bar{\mathbf z}_r,\bar{\boldsymbol\psi}_r\}_{r=1}^{R}$，使得当 $t\to\infty$ 时对所有 $r\in[R]$ 有 $\|\mathbf s_r^{(t)}-\bar{\mathbf s}_r\|_2$、$\|\mathbf c_r^{(t)}-\bar{\mathbf c}_r\|_2$、$\|\mathbf z_r^{(t)}-\bar{\mathbf z}_r\|_2$ 与 $\|\boldsymbol\psi_r^{(t)}-\bar{\boldsymbol\psi}_r\|_2$ 趋于 0。

**证明**：见附录 C。

由定理 2，由于 $\boldsymbol\Psi_r$ 按（21）更新且收敛，这意味着当 $t$ 趋于无穷时 $\mathbf s_r^{(t)}$ 与 $\mathbf z_r^{(t)}$ 趋于一致。基于定理 2，对线性去噪器情形可给出更强的保证：

**定理 3（KKT 点收敛）**：假设假设 3 成立，且采用满足假设 1 与 2 的线性去噪器，则算法 1 到达问题（10）的 KKT 点。

**证明**：见附录 D。

## V. 数值结果

### A. 仿真设置

**1）评价指标**：为评估恢复性能，采用相对平方误差（RSE）：

$$
\mathrm{RSE}(\widehat{\mathcal X})=\frac{\|\widehat{\mathcal X}-\mathcal X^\natural\|_F^2}{\|\mathcal X^\natural\|_F^2},
$$

其中 $\widehat{\mathcal X}$ 与 $\mathcal X^\natural$ 分别表示估计与真实无线电地图。此外，我们还采用恢复无线电地图在**对数域**中的结构相似性指标（SSIM）[53]。SSIM 反映人眼感知的相似度，取值在 0 到 1 之间；对数变换有助于更好刻画低功率区域的恢复性能。由于无线电地图跨越多个频带，平均 SSIM（MSSIM）在 $K$ 个频带上取平均。

**2）对比基线**：我们实现两种经典插值方法，即薄板样条（TPS）[4] 与最近邻插值（NN）；使用基于 LL1 块项张量分解的 RME 方法，即 LL1 [7]；以及两种基于深度学习的方法，即 Nasdac 与 Dowjons [10]。另外还包含数据域 PnP 方法，它按 [17] 的方式逐频带去噪求解（8），我们称之为 DaPnP（以区别于所提 LaPnP）。结果取 50 次蒙特卡洛试验的平均。

**3）合成数据生成**：我们分别在基于统计模型 [37] 与射线追踪模型（RTM）[54, 55] 生成的两种仿真无线电地图上测试算法。来自 [37] 的统计模型（SM）刻画城市或郊区等典型场景下无线电传播的概率特性；SM 不描述瞬时信号传播，因而反映相对长期的“平均”无线电环境。RTM [54] 通过考虑无线电波与环境物体的瞬时交互来模拟传播，可纳入区域内建筑与其他障碍物的影响。两种模型均被广泛使用并受到文献关注（见例如 [3, 4, 7]–[14]）。

- **SM 数据**：仿真中考虑 $125\times125\ \mathrm{m}^2$ 区域，离散为 $51\times51$ 网格，网格尺寸 $2.5\times2.5\ \mathrm{m}^2$。传感器在 32 个离散频点上测量接收信号的功率谱密度，故无线电地图尺寸为 $51\times51\times32$。真实无线电地图按下式生成：

$$
\mathbf S_r^\natural(m,n)=\frac{10^{\upsilon_r(m,n)/10}}{\left\|d_0\cdot([m,n]-[m_r,n_r])\right\|_2^{\gamma}},\tag{33}
$$

其中 $d_0=2.5$ m，$[m,n]-[m_r,n_r]$ 表示坐标 $(m,n)$ 与第 $r$ 个发射机坐标之间的网格距离，$\gamma$ 为在 2 与 2.5 之间随机选取的路损指数。$\upsilon_r$ 表示对数正态阴影衰落，服从零均值高斯分布，自相关函数为 $\mathbb E[\upsilon_r(m_1,n_1)\upsilon_r(m_2,n_2)]=\sigma_s^2\exp(-d_0\|[m_1,n_1]-[m_2,n_2]\|_2/d_c)$，其中 $\sigma_s^2$ 为阴影方差、$d_c$ 为去相关距离。$\sigma_s$ 大而 $d_c$ 小表示强阴影效应，$\sigma_s$ 与 $d_c$ 的典型取值分别为 4—13 与 50—100。PSD 按 [10, 11] 的设置生成。每次试验随机选取 $|\Omega|=\tau MN$ 个样本，$\tau$ 为采样率。含噪情形下，噪声 $\mathcal V$ 取自零均值高斯分布，信噪比（SNR）定义为 $\mathrm{SNR}=10\log_{10}(\|\mathcal X^\natural\|_F^2/\|\mathcal V\|_F^2)$（dB）。
- **RTM 数据**：该仿真设置采用 RadioMapSeer 数据集 [55]，它包含 701 张城市地图，每张覆盖 $256\times256\ \mathrm{m}^2$ 区域，并进一步划分为 $256\times256$ 网格。为仿真效率，我们使用每张图为 $128\times128$ 网格的下采样版本。该数据集考虑不同数量的射线—环境交互次数，交互越多细节越丰富但计算复杂度越高；我们的仿真采用 IRT2 设置 [55]，即每条发射信号（射线）最多与环境（如建筑物）发生 2 次交互。RadioMapSeer 是二维数据集，不包含频率维度；为仿真三维无线电地图，我们把同一城市在 RadioMapSeer 中的单发射机地图作为 $\mathbf S_r^\natural$，并为每个发射机生成 $\mathbf c_r^\natural$，再按（9）构造无线电地图。

**4）算法设置**：对所提算法采用三种图像去噪器，即 DSG-NLM [27]、BM3D [22] 与 DRUnet [24]。DSG-NLM 与 BM3D 是免训练方法（见第 II-C 节）；DRUnet 是基于 U-Net 架构 [56] 的深度去噪器，在超过 8,500 张自然图像上训练 [24]。特别地，对 DSG-NLM 沿用 [27] 的策略，在算法 1 第 10 次迭代后停止更新去噪矩阵 $\mathbf W$——这意味着 10 次迭代后去噪器本质上是线性的。采用这些去噪器的所提方法分别记为 LaPnP-NLM、LaPnP-BM3D 与 LaPnP-DRU。在算法 1 中，对黑箱去噪器（如深度去噪器），我们在把输入数据送入去噪器前先做对数域变换，并在输出端做逆变换；这些变换可视为去噪器的额外层，可“压缩”输入数据的动态范围，从而提升神经网络去噪器的性能。注意我们不对线性去噪器做此类变换。

对于基线 Nasdac 与 Dowjons，训练使用由（33）生成的 500,000 个 SLF，每个 SLF 由均匀采样参数 $\gamma\in[2,2.5]$、$\sigma_s\in[3,8]$、$d_c\in[30,100]$ 生成 [10]。对 LL1，按 [7] 把发射机数设为真值，并把 SLF 的秩设为 $L=4$。

### B. SM 下的仿真结果

图 4 给出第 10 个频带恢复的无线电地图。图 4a 是 $\sigma_s=6$、$R=6$ 的结果：除 Nasdac 未能捕获右上角的高能量模式外，所有方法都给出视觉上合理的恢复。注意 LaPnP 系列不需要在 SLF 上训练（与 DowJons、Nasdac 不同），但性能仍颇具竞争力。图 4b 给出更困难的重阴影场景（$\sigma_s=10$、$R=2$）：三个 LaPnP 变体都能恢复高功率与低功率区域的准确轮廓；相反，其他方法倾向于给出过度平滑的无线电地图，无法有效恢复低功率区域。对 Nasdac 与 Dowjons，注意其训练数据由 $\sigma_s\le8$ 生成 [10]；本仿真中 $\sigma_s$ 超过 8，它们难以捕获无线电地图的细节特征。如前所述，此类训练—测试失配会导致这些学习类方法性能下降，而基于 PnP 的所提方法不存在该问题。

**图 4**：第 10 个频带恢复的无线电地图；$d_c=50$、$\tau=10\%$。(a) $\sigma_s=6$、$R=6$；(b) $\sigma_s=10$、$R=2$。（各子图含真实地图、观测、Nasdac、Dowjons、LL1 与三种 LaPnP 变体的恢复结果及对应 RSE/MSSIM。）

表 I 给出各方法在不同采样率 $\tau$ 下的性能。可以看到 LaPnP-BM3D 取得总体最佳性能；LaPnP-NLM 与 LaPnP-DRU 的性能与最佳的非 PnP 方法（即 Dowjons）相近。但值得注意的是，Dowjons 是在 500,000 个 SLF 上训练的深度学习方法，而所提方法完全无需训练。

**表 I　不同 $\tau$ 下的性能；$\sigma_s=6$、$d_c=50$、$R=6$**（逐格转录）

| RSE | $\tau$ | Nasdac | Dowjons | LL1 | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | 5% | 0.283 | 0.184 | 0.243 | 0.279 | 0.240 | 0.219 |
| | 10% | 0.221 | 0.130 | 0.138 | 0.151 | 0.137 | 0.129 |
| | 15% | 0.209 | 0.097 | 0.103 | 0.104 | 0.092 | 0.089 |
| | 20% | 0.201 | 0.080 | 0.079 | 0.078 | 0.073 | 0.069 |
| MSSIM | $\tau$ | Nasdac | Dowjons | LL1 | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| | 5% | 0.8085 | 0.8391 | 0.7617 | 0.8233 | 0.8166 | 0.8442 |
| | 10% | 0.8248 | 0.8504 | 0.8433 | 0.8725 | 0.8640 | 0.8869 |
| | 15% | 0.8262 | 0.8529 | 0.8553 | 0.8922 | 0.8848 | 0.9033 |
| | 20% | 0.8223 | 0.8544 | 0.8703 | 0.9046 | 0.9022 | 0.9165 |

表 II 汇总不同阴影方差 $\sigma_s^2$ 下的结果。三个 LaPnP 变体都给出有竞争力的 RSE，且 MSSIM 一致高于其他方法。特别是当 $\sigma_s\ge6$（中等至强阴影效应）时，LaPnP-BM3D 在 RSE 与 MSSIM 两项指标上都取得最佳性能；且随着 $\sigma_s$ 增大，LaPnP 类方法与其他方法的 MSSIM 差距变大。这同样源于深度学习方法的模型失配（Nasdac 与 Dowjons 在训练时使用了 $\sigma_s\le8$）。当阴影增强时，$\mathbf S_r$ 上的低秩假设不再成立，LL1 方法在较大 $\sigma_s$ 下表现不佳。

**表 II　不同 $\sigma_s$ 下的性能；$d_c=50$、$\tau=10\%$、$R=6$**（逐格转录）

| RSE | $\sigma_s$ | Nasdac | Dowjons | LL1 | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | 4 | 0.194 | 0.086 | 0.110 | 0.129 | 0.091 | 0.092 |
| | 6 | 0.241 | 0.125 | 0.140 | 0.159 | 0.130 | 0.125 |
| | 8 | 0.267 | 0.165 | 0.178 | 0.194 | 0.174 | 0.162 |
| | 10 | 0.309 | 0.222 | 0.224 | 0.235 | 0.223 | 0.209 |
| | 12 | 0.338 | 0.292 | 0.270 | 0.275 | 0.284 | 0.259 |
| | 14 | 0.387 | 0.356 | 0.328 | 0.329 | 0.335 | 0.309 |
| MSSIM | $\sigma_s$ | Nasdac | Dowjons | LL1 | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| | 4 | 0.8693 | 0.9006 | 0.8964 | 0.9157 | 0.9179 | 0.9307 |
| | 6 | 0.8136 | 0.8509 | 0.8549 | 0.8726 | 0.8774 | 0.8869 |
| | 8 | 0.7633 | 0.7956 | 0.7965 | 0.8226 | 0.8254 | 0.8413 |
| | 10 | 0.6943 | 0.7277 | 0.7319 | 0.7654 | 0.7733 | 0.7893 |
| | 12 | 0.6570 | 0.6884 | 0.6727 | 0.7388 | 0.7403 | 0.7607 |
| | 14 | 0.5959 | 0.6264 | 0.5969 | 0.6947 | 0.6996 | 0.7210 |

表 III 比较不同 SNR 下 DaPnP 与 LaPnP 的性能。无噪声时，DaPnP 类方法的性能与对应的 LaPnP 版本相当；含噪情形下，虽然所有方法性能都下降，但 DaPnP 类方法受影响明显更大。LaPnP 通过分解模型（9）同时处理所有频带，这与 PCA 类似，因而本质上对噪声更鲁棒。此外，DaPnP 的计算复杂度显著更高——三个 DaPnP 变体的运行时间是对应 LaPnP 版本的 4—5.2 倍。

**表 III　不同噪声下的性能；$\sigma_s=6$、$d_c=50$、$\tau=10\%$、$R=6$**（逐格转录；含运行时间）

| RSE | SNR/dB | DaPnP-NLM | DaPnP-DRU | DaPnP-BM3D | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | clean | 0.154 | 0.145 | 0.152 | 0.151 | 0.137 | 0.129 |
| | 20 | 0.162 | 0.147 | 0.156 | 0.158 | 0.140 | 0.131 |
| | 10 | 0.173 | 0.159 | 0.163 | 0.165 | 0.152 | 0.137 |
| MSSIM | SNR/dB | DaPnP-NLM | DaPnP-DRU | DaPnP-BM3D | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| | clean | 0.8794 | 0.8902 | 0.8858 | 0.8725 | 0.8640 | 0.8869 |
| | 20 | 0.4979 | 0.5702 | 0.5179 | 0.8301 | 0.8286 | 0.8382 |
| | 10 | 0.2118 | 0.3013 | 0.2274 | 0.7719 | 0.7603 | 0.7853 |
| Runtime/s | — | 112.96 | 251.93 | 8.86 | 21.69 | 52.90 | 2.21 |

### C. RTM 下的仿真结果

图 5 给出 RadioMapSeer 某地图第 10 个频带的结果。三个 LaPnP 变体都取得更准确的重建。基线 LL1 与 TPS 在低能量区域错误引入不存在的信号功率，NN 则在递归高能量区域重建不准确并出现明显块状伪影。注意 DowJons 与 Nasdac 的训练机制需要非平凡的修改才能纳入建筑地图，因此这两种基线未纳入 RTM 仿真。

**图 5**：第 10 个频带恢复的无线电地图；$\tau=5\%$、$R=3$（含真实地图、观测、LL1、TPS、NN 与三种 LaPnP 变体的结果及 RSE/MSSIM）。

表 IV 给出不同采样率下的性能（在 50 张随机选取的城市地图上平均）。可以看到 LaPnP-BM3D 与 LaPnP-DRUnet 一致地给出更优结果，尤其 MSSIM 显著高于 LL1 与 TPS。

**表 IV　RTM 与不同 $\tau$ 下的性能；$R=3$**（逐格转录）

| RSE | $\tau$ | LL1 | TPS | NN | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | 5% | 0.911 | 0.907 | 0.979 | 0.907 | 0.873 | 0.871 |
| | 10% | 0.782 | 0.777 | 0.807 | 0.689 | 0.680 | 0.634 |
| | 15% | 0.725 | 0.726 | 0.771 | 0.625 | 0.622 | 0.582 |
| | 20% | 0.620 | 0.612 | 0.606 | 0.564 | 0.428 | 0.452 |
| MSSIM | $\tau$ | LL1 | TPS | NN | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| | 5% | 0.8224 | 0.8692 | 0.9395 | 0.9399 | 0.9426 | 0.9464 |
| | 10% | 0.8277 | 0.8824 | 0.9555 | 0.9566 | 0.9615 | 0.9572 |
| | 15% | 0.8335 | 0.8992 | 0.9649 | 0.9648 | 0.9699 | 0.9682 |
| | 20% | 0.8406 | 0.9110 | 0.9695 | 0.9688 | 0.9737 | 0.9741 |

图 6 评估错误估计 $R$ 对所提方法的影响，其中真实 $R=3$。可以看到，低估 $R$ 会使所有 LaPnP 变体性能明显下降——这是可理解的，因为它导致分解模型的信息损失；而高估 $R$ 时性能保持相对稳定。

**图 6**：RTM 下不同估计 $\widehat R$ 的性能；$\tau=10\%$、$R=3$。(a) RSE；(b) MSSIM。

### D. 真实数据实验

该真实数据集 [57] 采集了曼海姆大学 $14\times34\ \mathrm{m}^2$ 室内区域 9 个频带上的信号强度。区域划分为 $1\times1\ \mathrm{m}^2$ 网格单元，因而无线电地图尺寸为 $14\times34\times9$。在 166 个网格单元中部署传感器，测量全部 9 个频点上的 PSD。该数据集的更多细节见 [7, 10, 57]。

图 7 给出 $\tau=5\%$ 时恢复的曼海姆无线电地图第 1、5、9 个频带。按 [10, 11]，所有方法的发射机数设为 $R=7$。基线 Nasdac 与 Dowjons 按前文训练，LL1 的设置沿用 [7]。可以看到，深度学习类方法与所提方法输出视觉上相似的结果，而 LL1 在如此低的采样率下完全失效。表 V 给出不同采样率下的性能指标：所提方法在 RSE 上优于其他方法，MSSIM 与 Dowjons 相近。再次强调，所提方法不需要任何与曼海姆数据环境匹配的无线电地图训练数据。

**图 7**：曼海姆数据实验中第 1、5、9 个频带恢复的无线电地图；$\tau=5\%$（含真实地图、观测、Nasdac、Dowjons、LL1 与三种 LaPnP 变体的结果及 RSE/MSSIM）。

**表 V　不同采样率下的性能，曼海姆数据集**（逐格转录）

| RSE | $\tau$ | Nasdac | Dowjons | LL1 | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | 5% | 0.812 | 0.756 | 2.065 | 0.783 | 0.807 | 0.764 |
| | 10% | 0.595 | 0.572 | 2.033 | 0.642 | 0.681 | 0.567 |
| | 15% | 0.564 | 0.540 | 1.935 | 0.535 | 0.581 | 0.499 |
| | 20% | 0.504 | 0.423 | 2.097 | 0.445 | 0.469 | 0.412 |
| MSSIM | $\tau$ | Nasdac | Dowjons | LL1 | LaPnP-NLM | LaPnP-DRU | LaPnP-BM3D |
| | 5% | 0.9880 | 0.9922 | 0.7346 | 0.9932 | 0.9928 | 0.9933 |
| | 10% | 0.9933 | 0.9927 | 0.7478 | 0.9931 | 0.9919 | 0.9936 |
| | 15% | 0.9945 | 0.9939 | 0.7543 | 0.9951 | 0.9934 | 0.9943 |
| | 20% | 0.9964 | 0.9947 | 0.7481 | 0.9957 | 0.9950 | 0.9953 |

## VI. 结论

本文重新审视 RME 问题，并提出一种基于 ADMM 的 PnP 去噪算法。该算法利用成熟的自然图像去噪器对无线电地图施加隐式结构约束，从而避免使用大量无线电地图进行昂贵训练，同时仍能挖掘复杂去噪器所刻画信号去噪过程中复杂而精细的结构信息。该方法也不像传统基于深度学习的 RME 方法那样存在训练—测试失配问题。与通常在数据域应用的传统 PnP 去噪方法不同，我们的方法把去噪器“嵌入”潜空间域，降低了计算复杂度并提升了噪声鲁棒性。文中还研究了无线电地图可恢复性与 ADMM 算法收敛性等关键理论层面，在合理条件下给出性能刻画。仿真与真实数据实验验证了算法有效性。

算法代码见 https://github.com/xumaomao94/LaPnP；曼海姆大学数据集见 https://ieee-dataport.org/open-access/crawdad-mannheimcompass-v-2008-04-11。

## 补充材料

### 附录 A：引理 2 的证明

如第 IV-A 节所述，在假设 1 下待解问题变为（26），其目标函数记为 $v_{\mathrm{obj}}(\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R})$。记（26）的最优解为 $\{\mathbf S_r^\star,\mathbf c_r^\star\}_{r=1}^{R}$、真值为 $\{\mathbf S_r^\natural,\mathbf c_r^\natural\}_{r=1}^{R}$，则如下不等式成立：

$$
v_{\mathrm{obj}}(\{\mathbf S_r^\star,\mathbf c_r^\star\}_{r=1}^{R})\le v_{\mathrm{obj}}(\{\mathbf S_r^\natural,\mathbf c_r^\natural\}_{r=1}^{R})=\frac{\rho}{2}\sum_{r=1}^{R}\mathbf s_r^{\natural T}\widetilde{\mathbf Q}_r(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\widetilde{\mathbf Q}_r^T\mathbf s_r^\natural+\zeta\sum_{r=1}^{R}\mathbf c_r^{\natural T}\mathbf c_r^\natural+\|\mathcal O\circledast\mathcal V\|_F^2\triangleq v_{\mathrm{obj}}^\natural.\tag{34}
$$

另一方面，$v_{\mathrm{obj}}(\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R})$ 有下界：

$$
\begin{aligned}
&v_{\mathrm{obj}}(\{\mathbf S_r,\mathbf c_r\}_{r=1}^{R})\ge\left\|\mathcal O\circledast\left(\mathcal Y-\sum_{r=1}^{R}\mathbf S_r^\star\circ\mathbf c_r^\star\right)\right\|_F^2+\frac{\rho}{2}\sum_{r=1}^{R}\mathbf s_r^{\star T}\widetilde{\mathbf Q}_r(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\widetilde{\mathbf Q}_r^T\mathbf s_r^\star\\
&\quad\ge\frac{1}{2}\left(\left\|\mathcal O\circledast\left(\mathcal Y-\sum_{r=1}^{R}\mathbf S_r^\star\circ\mathbf c_r^\star\right)\right\|_F+\sqrt{\frac{\rho}{2}\sum_{r=1}^{R}\mathbf s_r^{\star T}\widetilde{\mathbf Q}_r(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\widetilde{\mathbf Q}_r^T\mathbf s_r^\star}\right)^2\\
&\quad\ge\frac{1}{2}\left(\left\|\mathcal O\circledast\sum_{r=1}^{R}\mathbf S_r^\star\circ\mathbf c_r^\star\right\|_F+\sqrt{\frac{\rho}{2}\sum_{r=1}^{R}\mathbf s_r^{\star T}\widetilde{\mathbf Q}_r(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\widetilde{\mathbf Q}_r^T\mathbf s_r^\star}-\|\mathcal O\circledast\mathcal Y\|_F\right)^2.
\end{aligned}\tag{35}
$$

进一步定义 $\mathbf s^\star\in\mathbb R^{MNR}$ 为 $\mathbf S^\star=[\mathbf s_1^\star,\ldots,\mathbf s_R^\star]$ 的向量化，$\mathbf Q\in\mathbb R^{MNR\times LR}$ 为块对角矩阵 $\operatorname{blkdiag}(\widetilde{\mathbf Q}_1,\ldots,\widetilde{\mathbf Q}_R)$，$\boldsymbol\Lambda\in\mathbb R^{LR\times LR}$ 为对角矩阵 $\operatorname{blkdiag}(\widetilde{\boldsymbol\Lambda}_1,\ldots,\widetilde{\boldsymbol\Lambda}_R)$。为简化记号，假设对所有 $r\in[R]$，$\mathbf W_r=\widetilde{\mathbf Q}_r\widetilde{\boldsymbol\Lambda}_r\widetilde{\mathbf Q}_r^T$ 的秩为 $L$；即使不同 $r$ 的秩不同，证明仍然成立。关于 $\mathbf s^\star$ 相关项可得如下不等式：

$$
\begin{aligned}
&\left(\left\|\mathcal O\circledast\sum_{r=1}^{R}\mathbf S_r^\star\circ\mathbf c_r^\star\right\|_F+\sqrt{\frac{\rho}{2}\sum_{r=1}^{R}\mathbf s_r^{\star T}\widetilde{\mathbf Q}_r(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\widetilde{\mathbf Q}_r^T\mathbf s_r^\star}\right)^2\\
&\quad\ge\left\|\mathcal O\circledast\sum_{r=1}^{R}\mathbf S_r^\star\circ\mathbf c_r^\star\right\|_F^2+\frac{\rho}{2}\sum_{r=1}^{R}\mathbf s_r^{\star T}\widetilde{\mathbf Q}_r(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\widetilde{\mathbf Q}_r^T\mathbf s_r^\star=\mathbf s^{\star T}\boldsymbol\Xi^T\boldsymbol\Xi\mathbf s^\star+\frac{\rho}{2}\mathbf s^{\star T}\mathbf Q(\boldsymbol\Lambda^{-1}-\mathbf I)\mathbf Q^T\mathbf s^\star,
\end{aligned}\tag{36}
$$

其中 $\boldsymbol\Xi\in\mathbb R^{MNK\times MNR}$ 定义为

$$
\boldsymbol\Xi=\left[\operatorname{diag}(\mathbf o)\otimes\mathbf c_1^\star,\ \operatorname{diag}(\mathbf o)\otimes\mathbf c_2^\star,\ \ldots,\ \operatorname{diag}(\mathbf o)\otimes\mathbf c_R^\star\right],\tag{37}
$$

$\mathbf o$ 为采样矩阵 $\mathcal O$ 的向量化。结合（34）（35）（36）可得

$$
\mathbf s^{\star T}\left(\boldsymbol\Xi^T\boldsymbol\Xi+\frac{\rho}{2}\mathbf Q(\boldsymbol\Lambda^{-1}-\mathbf I)\mathbf Q^T\right)\mathbf s^\star\le\left(\sqrt{2v_{\mathrm{obj}}^\natural}+\|\mathcal O\circledast\mathcal Y\|_F\right)^2.\tag{38}
$$

考虑到（26）中的约束 $\mathbf s_r\in\mathcal R(\widetilde{\mathbf Q}_r)$ 可重写为 $\mathbf s_r=\widetilde{\mathbf Q}_r\mathbf t_r$，且由于 $\widetilde{\mathbf Q}_r^T\widetilde{\mathbf Q}_r=\mathbf I$ 有 $\mathbf Q^T\mathbf Q=\mathbf I$，上述不等式可重写为

$$
\mathbf t^{\star T}\left(\mathbf Q^T\boldsymbol\Xi^T\boldsymbol\Xi\mathbf Q+\frac{\rho}{2}(\boldsymbol\Lambda^{-1}-\mathbf I)\right)\mathbf t^\star\le\left(\sqrt{2v_{\mathrm{obj}}^\natural}+\|\mathcal O\circledast\mathcal Y\|_F\right)^2,\tag{39}
$$

其中 $\mathbf t^\star$ 表示 $[\mathbf t_1^{\star T},\ldots,\mathbf t_R^{\star T}]^T$。

下面证明在假设 1 下 $\mathbf G\triangleq\mathbf Q^T\boldsymbol\Xi^T\boldsymbol\Xi\mathbf Q+\frac{\rho}{2}(\boldsymbol\Lambda^{-1}-\mathbf I)$ 正定（p.d.）。由于 $\mathbf G$ 显然半正定（p.s.d.），只需证明对任意非平凡 $\mathbf t$ 有 $\mathbf t^T\mathbf G\mathbf t\ne0$。用反证法：假设存在这样的 $\mathbf t$ 使 $\mathbf t^T\mathbf G\mathbf t=0$，则可分解为

$$
\mathbf t^T\mathbf G\mathbf t=\sum_{r=1}^{R}\left(\mathbf t_r^T\left(\widetilde{\mathbf Q}_r^T\boldsymbol\Xi_r^T\boldsymbol\Xi_r\widetilde{\mathbf Q}_r+\frac{\rho}{2}(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\right)\mathbf t_r\right)=0,
$$

这进一步意味着对任意 $r\in[R]$ 有

$$
\mathbf t_r^T\widetilde{\mathbf Q}_r^T\boldsymbol\Xi_r^T\boldsymbol\Xi_r\widetilde{\mathbf Q}_r\mathbf t_r=0,\quad\text{且}\tag{40a}
$$

$$
\rho\mathbf t_r^T(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\mathbf t_r=0,\tag{40b}
$$

其中 $\boldsymbol\Xi_r\in\mathbb R^{MNK\times MN}$ 定义为 $\operatorname{diag}(\mathbf o)\otimes\mathbf c_r^\star$——即 $\boldsymbol\Xi$ 的第 $r$ 个块。根据假设 1，$\widetilde{\boldsymbol\Lambda}_r$ 的对角元素满足 $\widetilde{\boldsymbol\Lambda}_r(1,1)\le1$ 且对 $i>1$ 有 $\widetilde{\boldsymbol\Lambda}_r(i,i)\in(0,1)$。若 $\widetilde{\boldsymbol\Lambda}_r(1,1)<1$，则对任何非零 $\mathbf t_r$，（40b）都不可能成立，故 $\mathbf G$ 正定。否则若 $\widetilde{\boldsymbol\Lambda}_r(1,1)=1$，则（40b）要求 $\mathbf t_r(2:L)=0$（因为 $\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I$ 是对角矩阵，其零空间由 $\mathbf e_1$ 张成，$\mathbf e_i$ 表示第 $i$ 个单位向量）。把这一结果代入（40a）得

$$
\boldsymbol\Xi_r\widetilde{\mathbf Q}_r(:,1)\mathbf t_r(1)=0.\tag{41}
$$

矩阵 $\boldsymbol\Xi_r$ 的列秩为 $|\Omega|$，其零空间由 $\{\mathbf e_i\mid i\in\Omega_{\mathrm{vec}}^{\complement}\}$ 张成。为验证这一点，注意 $\boldsymbol\Xi_r=\operatorname{diag}(\mathbf o)\otimes\mathbf c_r^\star$，其中 $\mathbf o(j)=1$（若 $j\in\Omega_{\mathrm{vec}}$）、$\mathbf o(j)=0$（若 $j\in\Omega_{\mathrm{vec}}^{\complement}$）；于是 $\boldsymbol\Xi_r\mathbf e_j$ 取出 $\boldsymbol\Xi_r$ 的第 $j$ 列，当 $j\in\Omega_{\mathrm{vec}}$ 时等于 $\mathbf e_j\otimes\mathbf c_r^\star$，当 $j\in\Omega_{\mathrm{vec}}^{\complement}$ 时为 0。要使（41）成立，$\widetilde{\mathbf Q}_r(:,1)$ 必须位于 $\boldsymbol\Xi_r$ 的零空间。由于 $\Omega_{\mathrm{vec}}$ 与 $\Omega_{\mathrm{vec}}^{\complement}$ 互补，位于零空间（即为 $\{\mathbf e_i\mid i\in\Omega_{\mathrm{vec}}^{\complement}\}$ 的线性组合）要求 $\widetilde{\mathbf Q}_r(\Omega_{\mathrm{vec}},1)=0$。然而 $\widetilde{\mathbf Q}(:,1)$ 是 $\mathbf W_r$ 的主特征向量；由假设 1，$\mathbf W_r$ 非负且不可约，根据 Perron–Frobenius 定理 [50]，其主特征向量必全为正元素。这与 $\widetilde{\mathbf Q}_r(\Omega_{\mathrm{vec}},1)=0$ 矛盾。故 $\mathbf G$ 正定。

记 $\mathbf G$ 的最小特征值为 $\lambda_{\min}$，由（39）可得

$$
\|\mathbf s^\star\|_2^2=\|\mathbf t^\star\|_2^2\le\frac{\left(\sqrt{2v_{\mathrm{obj}}^\natural}+\|\mathcal O\circledast\mathcal Y\|_F\right)^2}{\lambda_{\min}}.\tag{42}
$$

接下来刻画 $\{\mathbf c_r\}_{r=1}^{R}$ 的解集。考虑（34）以及 $v_{\mathrm{obj}}(\{\mathbf S_r^\star,\mathbf c_r^\star\}_{r=1}^{R})\ge\zeta\sum_{r=1}^{R}\mathbf c_r^{\star T}\mathbf c_r^\star$，可得

$$
\|\mathbf c^\star\|_2^2=\sum_{r=1}^{R}\mathbf c_r^{\star T}\mathbf c_r^\star\le\frac{v_{\mathrm{obj}}(\{\mathbf S_r^\star,\mathbf c_r^\star\}_{r=1}^{R})}{\zeta}\le\frac{v_{\mathrm{obj}}^\natural}{\zeta},\tag{43}
$$

其中 $\mathbf c^\star$ 表示 $\mathbf C^\star=[\mathbf c_1^\star,\mathbf c_2^\star,\ldots,\mathbf c_R^\star]$ 的向量化。

### 附录 B：定理 1 的证明

本附录先给出引理 3——它给出（26）最优解集的覆盖数 [58]，是定理 1 证明的关键组成部分；随后给出定理 1 的详细证明。

**A. 解集的覆盖数**

记包含 $\mathbf S^\star$ 与 $\mathbf C^\star$ 的解集分别为 $\mathcal S$ 与 $\mathcal K$。基于引理 2 可刻画这些集合。回顾 $\beta=(\sqrt{2v_{\mathrm{obj}}^\natural}+\|\mathcal O\circledast\mathcal Y\|_F)^2/\lambda_{\min}$、$\alpha=v_{\mathrm{obj}}^\natural/\zeta$。进一步定义

$$
\mathcal S=\left\{\mathbf S=[\mathbf s_1,\ldots,\mathbf s_R]\in\mathbb R^{MN\times R}\ \middle|\ \mathbf S\ge0,\ \|\mathbf S\|_F^2\le\beta\right\},\qquad \mathcal K=\left\{\mathbf C=[\mathbf c_1,\ldots,\mathbf c_R]\in\mathbb R^{K\times R}\ \middle|\ \mathbf C\ge0,\ \|\mathbf C\|_F^2\le\alpha\right\}.
$$

其中 $\|\mathbf S\|_F^2=\sum_{r=1}^{R}\|\mathbf S_r\|_F^2=\sum_{r=1}^{R}\|\mathbf s_r\|_2^2$，且 $\mathbf s_r=\operatorname{vec}(\mathbf S_r)$。恢复无线电地图的解集定义为

$$
\mathcal X_{\mathrm{sol}}=\left\{\mathbf X=\mathbf C\mathbf S^T\in\mathbb R^{K\times MN}\ \middle|\ \mathbf C\in\mathcal K,\ \mathbf S\in\mathcal S\right\}.
$$

**引理 3（覆盖数）**：$\mathcal X_{\mathrm{sol}}$ 的 $\epsilon_x$-网的覆盖数 $N(\mathcal X_{\mathrm{sol}},\epsilon_x)$ 满足如下上界：

$$
N(\mathcal X_{\mathrm{sol}},\epsilon_x)\le\alpha^{KR/2}\beta^{MNR/2}\left(3(\sqrt{\alpha}+\sqrt{\beta})/\epsilon_x\right)^{R(K+MN)}.\tag{44}
$$

**证明**：根据 $\mathcal S$ 的定义，每个可能的 $\mathbf s$ 被限制在半径为 $\sqrt{\beta}$ 的欧氏球内，故 $\epsilon$-网的覆盖数满足 [59]：

$$
N(\mathcal S,\epsilon)\le\left(3\sqrt{\beta}/\epsilon\right)^{MNR}.\tag{45}
$$

类似地有

$$
N(\mathcal K,\epsilon)\le\left(3\sqrt{\alpha}/\epsilon\right)^{KR}.\tag{46}
$$

设 $\widetilde{\mathbf S}$ 取自 $\mathcal S$ 的以 $\mathbf S$ 为中心的 $\epsilon$-网、$\widetilde{\mathbf C}$ 取自 $\mathcal K$ 的以 $\mathbf C$ 为中心的 $\epsilon$-网，则对任意 $\widetilde{\mathbf S}$ 与 $\widetilde{\mathbf C}$ 有

$$
\begin{aligned}
\|\widetilde{\mathbf X}-\mathbf X\|_F&=\|\widetilde{\mathbf C}\widetilde{\mathbf S}^T-\mathbf C\mathbf S^T\|_F=\|\widetilde{\mathbf C}\widetilde{\mathbf S}^T-\widetilde{\mathbf C}\mathbf S^T+\widetilde{\mathbf C}\mathbf S^T-\mathbf C\mathbf S^T\|_F\\
&\le\|\widetilde{\mathbf C}\widetilde{\mathbf S}^T-\widetilde{\mathbf C}\mathbf S^T\|_F+\|\widetilde{\mathbf C}\mathbf S^T-\mathbf C\mathbf S^T\|_F\\
&\le\|\widetilde{\mathbf C}\|_F\|\widetilde{\mathbf S}-\mathbf S\|_F+\|\mathbf S\|_F\|\widetilde{\mathbf C}-\mathbf C\|_F\le(\sqrt{\alpha}+\sqrt{\beta})\epsilon.
\end{aligned}\tag{47}
$$

因此 $\widetilde{\mathbf X}=\widetilde{\mathbf C}\widetilde{\mathbf S}^T$ 位于以 $\mathbf X=\mathbf C\mathbf S^T$ 为中心的 $(\sqrt{\alpha}+\sqrt{\beta})\epsilon$-网内。考虑 $\mathcal S$ 与 $\mathcal C$ 的 $\epsilon$-网所有可能组合，$\mathcal X_{\mathrm{sol}}$ 的 $(\sqrt{\alpha}+\sqrt{\beta})\epsilon$-网覆盖数可由 $N(\mathcal S,\epsilon)$ 与 $N(\mathcal K,\epsilon)$ 之积上界：

$$
N(\mathcal X_{\mathrm{sol}},(\sqrt{\alpha}+\sqrt{\beta})\epsilon)\le\left(3\sqrt{\alpha}/\epsilon\right)^{KR}\left(3\sqrt{\beta}/\epsilon\right)^{MNR},\tag{48}
$$

令 $\epsilon_x=(\sqrt{\alpha}+\sqrt{\beta})\epsilon$ 即等价于（44）。

**B. 定理陈述的证明**

对（26）的任一最优解 $\mathbf X^\star$，可推导

$$
\begin{aligned}
\frac{1}{\sqrt{MNK}}\left\|\mathbf X^\star-\mathbf X^\natural\right\|_F&=\frac{1}{\sqrt{MNK}}\left\|\mathbf X^\star-\mathbf Y+\mathcal V\right\|_F\le\frac{1}{\sqrt{MNK}}\left\|\mathbf X^\star-\mathbf Y\right\|_F+\frac{1}{\sqrt{MNK}}\|\mathcal V\|_F\\
&\le\frac{1}{\sqrt{|\Omega|K}}\left\|\mathcal O\circledast(\mathbf X^\star-\mathbf Y)\right\|_F+\frac{1}{\sqrt{MNK}}\|\mathcal V\|_F+\underbrace{\left|\frac{\|\mathcal O\circledast(\mathbf X^\star-\mathbf Y)\|_F}{\sqrt{|\Omega|K}}-\frac{\|\mathbf X^\star-\mathbf Y\|_F}{\sqrt{MNK}}\right|}_{\operatorname{Gap}(\mathbf X^\star,\Omega)}\\
&\le\frac{\sqrt{v_{\mathrm{obj}}^\natural}}{\sqrt{|\Omega|K}}+\frac{\|\mathcal V\|_F}{\sqrt{MNK}}+\operatorname{Gap}(\mathbf X^\star,\Omega)\\
&\le\frac{\sqrt{v_{\mathrm{obj}}^\natural}}{\sqrt{|\Omega|K}}+\frac{\|\mathcal V\|_F}{\sqrt{MNK}}+\sup_{\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}}\operatorname{Gap}(\widetilde{\mathbf X},\Omega),
\end{aligned}\tag{49}
$$

其中第二个不等式由三角不等式得到，第三个不等式由 $\mathbf X^\star$ 的最优性得到，即 $\|\mathcal O\circledast(\mathbf X^\star-\mathbf Y)\|_F\le v_{\mathrm{obj}}(\{\mathbf S_r^\star,\mathbf c_r^\star\}_{r=1}^{R})\le v_{\mathrm{obj}}^\natural$。

为简洁，记 $\sup_{\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}}\operatorname{Gap}(\widetilde{\mathbf X},\Omega)$ 为 $\operatorname{Gap}^\star(\Omega)$。此外定义

$$
d\operatorname{Loss}(\mathbf X)=\frac{1}{|\Omega|K}\sum_{(i,j)\in\Omega}\left\|\mathbf Y(i,j,:)-\mathbf X(i,j,:)\right\|_2^2,\qquad \operatorname{Loss}(\mathbf X)=\frac{1}{MNK}\sum_{i\in[M],j\in[N]}\left\|\mathbf Y(i,j,:)-\mathbf X(i,j,:)\right\|_2^2.
$$

则 $\operatorname{Gap}(\widetilde{\mathbf X},\Omega)$ 可表示为 $|\sqrt{d\operatorname{Loss}(\widetilde{\mathbf X})}-\sqrt{\operatorname{Loss}(\widetilde{\mathbf X})}|$。此外如下不等式成立：

$$
\frac{1}{K}\left\|\mathbf Y(i,j,:)-\widetilde{\mathbf X}(i,j,:)\right\|_2^2\le\frac{1}{K}\left(\|\mathbf Y(i,j,:)\|_2^2+\|\widetilde{\mathbf X}(i,j,:)\|_2^2\right)\le\frac{1}{K}(K\iota^2+\alpha\beta)\triangleq\xi,\tag{50}
$$

其中 $\iota=\max_{i,j,k}\mathcal Y(i,j,k)$；第一个不等式因为 $\mathbf Y$ 与 $\widetilde{\mathbf X}$ 均非负，第二个不等式因为 $\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}$。把该 $\|\mathbf Y(i,j,:)-\widetilde{\mathbf X}(i,j,:)\|_2^2/K$ 的上界代入 Serfling 无放回抽样形式的 Hoeffding 不等式，得

$$
\Pr\left(\left|d\operatorname{Loss}(\widetilde{\mathbf X})-\operatorname{Loss}(\widetilde{\mathbf X})\right|\ge\nu\right)\le2\exp\left(-\frac{2|\Omega|\nu^2}{(1-(|\Omega|-1)/(MN))\xi^2}\right).\tag{51}
$$

根据 $\operatorname{Gap}^\star(\Omega)$ 的定义，仍需考虑整个解集 $\mathcal X_{\mathrm{sol}}$，而非（51）中的某个具体实例。记 $\mathcal X_{\mathrm{sol}}$ 的 $\epsilon$-网中心为 $\{\mathbf X_i\}_{i=1}^{N(\mathcal X_{\mathrm{sol}},\epsilon_x)}$，基于（51）可得

$$
\begin{aligned}
&\Pr\left(\sup_{i\in N(\mathcal X_{\mathrm{sol}},\epsilon)}\left|d\operatorname{Loss}(\mathbf X_i)-\operatorname{Loss}(\mathbf X_i)\right|\ge\nu\right)=\Pr\left(\bigcup_{i\in N(\mathcal X_{\mathrm{sol}},\epsilon)}\left\{|d\operatorname{Loss}(\mathbf X_i)-\operatorname{Loss}(\mathbf X_i)|\ge\nu\right\}\right)\\
&\quad\le\sum_{i}^{N(\mathcal X_{\mathrm{sol}},\epsilon)}\Pr\left(\left|d\operatorname{Loss}(\mathbf X_i)-\operatorname{Loss}(\mathbf X_i)\right|\ge\nu\right)\le2N(\mathcal X_{\mathrm{sol}},\epsilon)\exp\left(-\frac{2|\Omega|\nu^2}{(1-(|\Omega|-1)/(MN))\xi^2}\right).
\end{aligned}\tag{52}
$$

等价地，以概率 $1-\delta$ 下式成立：

$$
\sup_{i}\left|d\operatorname{Loss}(\mathbf X_i)-\operatorname{Loss}(\mathbf X_i)\right|\le\underbrace{\sqrt{\left(\frac{1}{|\Omega|}-\frac{1}{MN}+\frac{1}{MN|\Omega|}\right)\frac{\xi^2}{2}\log\left(\frac{2N(\mathcal X_{\mathrm{sol}},\epsilon)}{\delta}\right)}}_{\varepsilon(\Omega,\delta,\epsilon)}.\tag{53}
$$

对任意 $\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}$，它必属于某个以 $\{\mathbf X_i\}_{i=1}^{N(\mathcal X_{\mathrm{sol}},\epsilon)}$ 为中心的 $\epsilon$-网。记该 $\epsilon$-网中心为 $\mathbf X_c$，则以概率 $1-\delta$ 有

$$
\begin{aligned}
\sup_{\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}}\left|d\operatorname{Loss}(\widetilde{\mathbf X})-\operatorname{Loss}(\widetilde{\mathbf X})\right|&=\sup_{\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}}\left|d\operatorname{Loss}(\widetilde{\mathbf X})-d\operatorname{Loss}(\mathbf X_c)+d\operatorname{Loss}(\mathbf X_c)-\operatorname{Loss}(\widetilde{\mathbf X})+\operatorname{Loss}(\mathbf X_c)-\operatorname{Loss}(\mathbf X_c)\right|\\
&\le\sup_{\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}}\left\{\left|d\operatorname{Loss}(\mathbf X^\star)-d\operatorname{Loss}(\mathbf X_c)\right|+\left|\operatorname{Loss}(\mathbf X_c)-\operatorname{Loss}(\widetilde{\mathbf X})\right|+\left|d\operatorname{Loss}(\mathbf X_c)-\operatorname{Loss}(\mathbf X_i)\right|\right\}\\
&\le\frac{\epsilon^2}{|\Omega|}+\frac{\epsilon^2}{MN}+\varepsilon(\Omega,\delta,\epsilon),
\end{aligned}\tag{54}
$$

其中最后一个不等式来自 $\epsilon$-网的定义。因此以概率 $1-\delta$ 有

$$
\operatorname{Gap}^\star(\Omega)=\sup_{\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}}\left|\sqrt{d\operatorname{Loss}(\widetilde{\mathbf X})}-\sqrt{\operatorname{Loss}(\widetilde{\mathbf X})}\right|\le\sup_{\widetilde{\mathbf X}\in\mathcal X_{\mathrm{sol}}}\sqrt{\left|d\operatorname{Loss}(\widetilde{\mathbf X})-\operatorname{Loss}(\widetilde{\mathbf X})\right|}=\sqrt{\frac{\epsilon^2}{|\Omega|}+\frac{\epsilon^2}{MN}+\varepsilon(\Omega,\delta,\epsilon)}.\tag{55}
$$

### 附录 C：定理 2 的证明

我们沿用 [25] 的证明思路，把算法 1 的 ADMM 更新分为如下三种情形：

- **情形 1**：$\triangle^{t+1}\ge\eta\triangle^t$ 发生无穷多次，而 $\triangle^{t+1}<\eta\triangle^t$ 发生有限次；
- **情形 2**：$\triangle^{t+1}\ge\eta\triangle^t$ 发生有限次，而 $\triangle^{t+1}<\eta\triangle^t$ 发生无穷多次；
- **情形 3**：$\triangle^{t+1}\ge\eta\triangle^t$ 与 $\triangle^{t+1}<\eta\triangle^t$ 均发生无穷多次，

其中 $\triangle^t$ 为（23）定义的残差。本证明只关注非平凡的情形 1 的收敛性质，因为情形 2 中 $\triangle^{t+1}<\eta\triangle^t$ 的无穷多次出现已蕴含变量收敛；情形 3 中两种条件均出现无穷多次，是情形 1 与情形 2 的组合，故由二者的收敛性质其收敛性也有保证；详见 [25] 的论证。

在情形 1 下，$\rho^{t+1}=\gamma\rho^t$ 执行无穷多次。不失一般性，假设每次迭代都执行。先考虑用去噪器更新 $\mathbf Z_r$（对应（14））。根据假设 2 可得

$$
\frac{\left\|\mathbf z_r^{(t+1)}-\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)\right\|_2}{\sqrt{MN}}=\frac{\left\|D_\sigma\!\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)-\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)\right\|_2}{\sqrt{MN}}\le\sigma\sqrt{C}=\sqrt{\frac{\lambda}{\rho^t}}\sqrt{C},\tag{56}
$$

其中最后一个等号来自 $\mathbf z_r$ 更新中取 $\sigma=\sqrt{\lambda/\rho^t}$（见（14））。

接着考虑 $\mathbf s_r$ 的更新。在算法 1 中，第 $(t+1)$ 次更新 $\{\mathbf s_r^{(t+1)},\mathbf c_r^{(t+1)}\}_{r=1}^{R}$ 由用 HALS 方法求解（17）得到。该方法以第 $t$ 次更新 $\{\mathbf s_r^{(t)},\mathbf c_r^{(t)},\mathbf z_r^{(t+1)},\boldsymbol\psi_r^{(t)}\}_{r=1}^{R}$ 为初值，迭代 $J$ 步。这里只关注第 $J$ 次迭代的解，即 $\{\mathbf s_r^{(t+1,J)},\mathbf c_r^{(t+1,J)}\}_{r=1}^{R}$（简记为 $\{\mathbf s_r^{(t+1)},\mathbf c_r^{(t+1)}\}_{r=1}^{R}$）。根据（18）与（20），$\mathbf s_r^{(t+1)}$ 也可表示为 $\mathbf s_r^{(t+1)}=\max\{\mathbf u_r^{(t+1)},\mathbf 0\}$，其中 $\mathbf u_r^{(t+1)}$ 表示（12）关于 $\mathbf s_r$ 无约束最小化的解。具体地，$\mathbf u_r^{(t+1)}$ 由令（12）的导数为 0 得到，即

$$
\frac{1}{\rho^t}\nabla_{\mathbf s_r}f\left(\left\{\mathbf s_{r'}^{(t+1,J)},\mathbf c_{r'}^{(t+1,J)}\right\}_{r'=1}^{r-1},\mathbf s_r,\mathbf c_r^{(t+1,J-1)},\left\{\mathbf s_{r'}^{(t+1,J-1)},\mathbf c_{r'}^{(t+1,J-1)}\right\}_{r'=r+1}^{R}\right)\Bigg|_{\mathbf s_r=\mathbf u_r^{(t+1)}}=-\left(\mathbf u_r^{(t+1)}-\mathbf z_r^{(t+1)}+\boldsymbol\psi_r^{(t)}\right).\tag{57}
$$

为简洁，记关于 $\mathbf s_r$ 的偏梯度（在 $\mathbf s_r=\mathbf u_r^{(t+1)}$ 处取值）为 $\nabla_{\mathbf s_r}f|_{\mathbf s_r=\mathbf u_r^{(t+1)}}$。两边加 $\mathbf s_r^{(t)}$ 并整理，得

$$
\begin{aligned}
\mathbf u_r^{(t+1)}-\mathbf s_r^{(t)}&=-\frac{1}{\rho^t}\nabla_{\mathbf s_r}f|_{\mathbf s_r=\mathbf u_r^{(t+1)}}+\mathbf z_r^{(t+1)}-\mathbf s_r^{(t)}-\boldsymbol\psi_r^{(t)}\\
&=-\frac{1}{\rho^t}\nabla_{\mathbf s_r}f|_{\mathbf s_r=\mathbf u_r^{(t+1)}}+D_{\sigma^t}\!\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)-\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right).
\end{aligned}\tag{58}
$$

于是可推导

$$
\begin{aligned}
\frac{\left\|\mathbf s_r^{(t+1)}-\mathbf s_r^{(t)}\right\|_2}{\sqrt{MN}}&=\frac{\left\|\max\{\mathbf u_r^{(t+1)},\mathbf 0\}-\mathbf s_r^{(t)}\right\|_2}{\sqrt{MN}}\le\frac{\left\|\mathbf u_r^{(t+1)}-\mathbf s_r^{(t)}\right\|_2}{\sqrt{MN}}\\
&\le\frac{\left\|\nabla_{\mathbf s_r}f|_{\mathbf s_r=\mathbf u_r^{(t+1)}}\right\|_2}{\rho^t\sqrt{MN}}+\frac{\left\|D_{\sigma^t}\!\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)-\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)\right\|_2}{\sqrt{MN}}\le\frac{L}{\rho^t}+\sqrt{\frac{\lambda}{\rho^t}}\sqrt{C},
\end{aligned}\tag{59}
$$

其中第一个不等式来自 $\mathbf s_r^{(t)}$ 的非负性，第二个不等式来自（58）与三角不等式，最后一个不等式来自假设 2 与 3。

类似地，由（21）中 $\boldsymbol\psi_r$ 的更新有

$$
\begin{aligned}
\frac{\left\|\boldsymbol\psi_r^{(t+1)}\right\|_2}{\sqrt{MN}}&=\frac{\left\|\boldsymbol\psi_r^{(t)}+\mathbf s_r^{(t+1)}-\mathbf z_r^{(t+1)}\right\|_2}{\sqrt{MN}}=\frac{\left\|\boldsymbol\psi_r^{(t)}+\mathbf s_r^{(t+1)}-\left(\boldsymbol\psi_r^{(t)}+\mathbf s_r^{(t)}\right)+\left(\boldsymbol\psi_r^{(t)}+\mathbf s_r^{(t)}\right)-\mathbf z_r^{(t+1)}\right\|_2}{\sqrt{MN}}\\
&\le\frac{\left\|\mathbf s_r^{(t+1)}-\mathbf s_r^{(t)}\right\|_2+\left\|\boldsymbol\psi_r^{(t)}+\mathbf s_r^{(t)}-D_{\sigma^t}\!\left(\boldsymbol\psi_r^{(t)}+\mathbf s_r^{(t)}\right)\right\|_2}{\sqrt{MN}}\le\frac{L}{\rho^t}+2\sqrt{\frac{\lambda}{\rho^t}}\sqrt{C},
\end{aligned}\tag{60}
$$

进而

$$
\frac{\left\|\boldsymbol\psi_r^{(t+1)}-\boldsymbol\psi_r^{(t)}\right\|_2}{\sqrt{MN}}\le\frac{\left\|\boldsymbol\psi_r^{(t+1)}\right\|_2+\left\|\boldsymbol\psi_r^{(t)}\right\|_2}{\sqrt{MN}}\le L\left(\frac{1}{\rho^t}+\frac{1}{\rho^{t-1}}\right)+2\sqrt{\lambda C}\left(\frac{1}{\sqrt{\rho^t}}+\frac{1}{\sqrt{\rho^{t-1}}}\right).\tag{61}
$$

最后对 $\mathbf z_r$ 可推导

$$
\begin{aligned}
\frac{\left\|\mathbf z_r^{(t+1)}-\mathbf z_r^{(t)}\right\|_2}{\sqrt{MN}}&=\frac{\left\|\mathbf z_r^{(t+1)}-\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)+\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)-\left(\mathbf s_r^{(t-1)}+\boldsymbol\psi_r^{(t-1)}\right)+\left(\mathbf s_r^{(t-1)}+\boldsymbol\psi_r^{(t-1)}\right)-\mathbf z_r^{(t)}\right\|_2}{\sqrt{MN}}\\
&\le\Big(\left\|D_{\sigma^t}\!\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)-\left(\mathbf s_r^{(t)}+\boldsymbol\psi_r^{(t)}\right)\right\|_2+\left\|D_{\sigma^{t-1}}\!\left(\mathbf s_r^{(t-1)}+\boldsymbol\psi_r^{(t-1)}\right)-\left(\mathbf s_r^{(t-1)}+\boldsymbol\psi_r^{(t-1)}\right)\right\|_2\\
&\qquad+\left\|\mathbf s_r^{(t)}-\mathbf s_r^{(t-1)}\right\|_2+\left\|\boldsymbol\psi_r^{(t)}-\boldsymbol\psi_r^{(t-1)}\right\|_2\Big)\Big/\sqrt{MN}\\
&\le\sqrt{\lambda C}\left(\frac{1}{\sqrt{\rho^t}}+\frac{4}{\sqrt{\rho^{t-1}}}+\frac{2}{\sqrt{\rho^{t-2}}}\right)+L\left(\frac{2}{\rho^{t-1}}+\frac{1}{\rho^{t-2}}\right).
\end{aligned}\tag{62}
$$

由于 $\rho^t$ 单调递增，不难验证 $\{\mathbf s_r^{(t)}\}_{t=1}^{\infty}$、$\{\mathbf z_r^{(t)}\}_{t=1}^{\infty}$ 与 $\{\boldsymbol\psi_r^{(t)}\}_{t=1}^{\infty}$ 都是 Cauchy 序列。因此当 $t\to\infty$ 时，$\{\mathbf s_r^{(t)},\mathbf z_r^{(t)},\boldsymbol\psi_r^{(t)}\}_{r=1}^{R}$ 收敛到不动点 $\{\bar{\mathbf s}_r,\bar{\mathbf z}_r,\bar{\boldsymbol\psi}_r\}_{r=1}^{R}$。注意 $\{\mathbf c_r\}_{r=1}^{R}$ 的更新对应求解一个带唯一极小点的严格凸二次优化问题，该极小点依赖于 $\{\mathbf s_r,\mathbf z_r,\boldsymbol\psi_r\}_{r=1}^{R}$；结合 $\{\mathbf s_r,\mathbf z_r,\boldsymbol\psi_r\}_{r=1}^{R}$ 的收敛性可知 $\{\mathbf c_r\}_{r=1}^{R}$ 也收敛。

### 附录 D：定理 3 的证明

假设线性去噪器满足假设 1，则根据引理 1，（10）可显式表示为（26）。（26）的 KKT 条件为

$$
\nabla_{\mathbf s_r}f(\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R})+\lambda\nabla_{\mathbf s_r}g(\mathbf s_r)+\boldsymbol\alpha_r+\widetilde{\mathbf Q}_r^c\boldsymbol\gamma_r=\mathbf 0,\quad\forall r\in[R],\tag{63a}
$$

$$
\nabla_{\mathbf c_r}f(\{\mathbf s_r,\mathbf c_r\}_{r=1}^{R})+2\zeta\mathbf c_r+\boldsymbol\beta_r=\mathbf 0,\quad\forall r\in[R],\tag{63b}
$$

$$
\mathbf s_r\ge0,\ \mathbf c_r\ge0,\quad\forall r\in[R],\tag{63c}
$$

$$
\boldsymbol\alpha_r\le0,\ \boldsymbol\beta_r\le0,\quad\forall r\in[R],\tag{63d}
$$

$$
\boldsymbol\alpha_r\circledast\mathbf s_r=\mathbf 0,\ \boldsymbol\beta_r\circledast\mathbf c_r=\mathbf 0,\quad\forall r\in[R],\tag{63e}
$$

$$
\mathbf s_r^T\widetilde{\mathbf Q}_r^c=\mathbf 0,\quad\forall r\in[R],\tag{63f}
$$

其中根据（26），$g(\mathbf s_r)=(\rho/2\lambda)\mathbf s_r^T\widetilde{\mathbf Q}_r(\widetilde{\boldsymbol\Lambda}_r^{-1}-\mathbf I)\widetilde{\mathbf Q}_r^T\mathbf s_r$。对偶变量 $\boldsymbol\alpha_r$、$\boldsymbol\beta_r$ 与 $\boldsymbol\gamma_r$ 分别对应约束 $\mathbf s_r\ge0$、$\mathbf c_r\ge0$ 与 $\mathbf s_r^T\widetilde{\mathbf Q}_r^c=\mathbf 0$。

注意（63f）等价于（26）中的 $\mathbf s_r\in\mathcal R(\widetilde{\mathbf Q}_r)$，因为由引理 1 中的定义有 $\widetilde{\mathbf Q}_r\perp\widetilde{\mathbf Q}_r^c$。这里采用（63f）是因为其等式形式可简化表达。由于定理 2 保证算法 1 收敛到不动点 $\{\bar{\mathbf s}_r,\bar{\mathbf c}_r,\bar{\mathbf z}_r\}_{r=1}^{R}$，只需验证 $\bar{\mathbf s}_r$ 与 $\bar{\mathbf c}_r$ 对某组 $\boldsymbol\alpha_r$、$\boldsymbol\beta_r$、$\boldsymbol\gamma_r$ 满足（63）中的 KKT 条件。首先，根据引理 1，$\mathbf z_r$ 更新（13）是如下严格凸问题的最优解：

$$
\min_{\mathbf z}\ \lambda g(\mathbf z_r)+\frac{\rho}{2}\|\bar{\mathbf s}_r-\mathbf z_r+\bar{\boldsymbol\psi}_r\|_2^2,\qquad\text{s.t.}\ \mathbf z_r^T\widetilde{\mathbf Q}_r^c=\mathbf 0.\tag{64}
$$

因此存在对偶变量 $\boldsymbol\kappa_r$ 使（64）的 KKT 条件成立：

$$
\lambda\nabla_{\mathbf z_r}g(\mathbf z_r)\Big|_{\mathbf z_r=\bar{\mathbf z}_r}-\rho\bar{\boldsymbol\psi}_r+\widetilde{\mathbf Q}_r^c\boldsymbol\kappa_r=\mathbf 0,\tag{65a}
$$

$$
\bar{\mathbf z}_r^T\widetilde{\mathbf Q}_r^c=\mathbf 0,\tag{65b}
$$

其中根据定理 2，在（65a）中用到 $\bar{\mathbf s}_r=\bar{\mathbf z}_r$。

接着考虑 $\mathbf s_r$ 的子问题，即关于 $\mathbf s_r$ 求解问题（17），重写如下：

$$
\min_{\mathbf s_r}\ f\left(\mathbf s_r,\bar{\mathbf c}_r,\{\bar{\mathbf s}_{r'},\bar{\mathbf c}_{r'}\}_{r'=1,r'\neq r}^{R}\right)+\frac{\rho}{2}\|\mathbf s_r-\bar{\mathbf z}_r+\bar{\boldsymbol\psi}_r\|^2,\qquad\text{s.t.}\ \mathbf s_r\ge0.\tag{66}
$$

由于（66）是带非负约束的严格凸二次问题，它有唯一最优解，由（18）与（20）的更新给出。此外，根据算法 1 的收敛性，一旦整个解序列收敛，该解应为不动点，即 $\bar{\mathbf s}_r$。因此当 $t=\infty$ 的极限处，存在对偶变量 $\boldsymbol\chi_r$ 使（66）的 KKT 条件成立：

$$
\nabla_{\mathbf s_r}f\Big|_{\mathbf s_r=\bar{\mathbf s}_r}+\rho\bar{\boldsymbol\psi}_r+\boldsymbol\chi_r=\mathbf 0,\tag{67a}
$$

$$
\bar{\mathbf s}_r\ge0,\ \boldsymbol\chi_r\le0,\ \boldsymbol\chi_r\circledast\bar{\mathbf s}_r=\mathbf 0,\tag{67b}
$$

其中 $\nabla_{\mathbf s_r}f(\mathbf s_r,\bar{\mathbf c}_r,\{\bar{\mathbf s}_{r'},\bar{\mathbf c}_{r'}\}_{r'=1,r'\neq r}^{R})|_{\mathbf s_r=\bar{\mathbf s}_r}$ 简记为 $\nabla_{\mathbf s_r}f|_{\mathbf s_r=\bar{\mathbf s}_r}$，（67a）来自驻点条件与 $\bar{\mathbf s}_r=\bar{\mathbf z}_r$。类似地，对 $\{\bar{\mathbf c}_r\}$ 存在 $\boldsymbol\omega_r$ 使

$$
\nabla_{\mathbf c_r}f\Big|_{\mathbf c_r=\bar{\mathbf c}_r}+2\zeta\bar{\mathbf c}_r+\boldsymbol\omega_r=\mathbf 0,\tag{68a}
$$

$$
\bar{\mathbf c}_r\ge0,\ \boldsymbol\omega_r\le0,\ \boldsymbol\omega_r\circledast\bar{\mathbf c}_r=\mathbf 0.\tag{68b}
$$

于是把（67a）与（65a）相加并令 $\mathbf s_r=\bar{\mathbf s}_r$、$\boldsymbol\alpha_r=\boldsymbol\chi_r$、$\boldsymbol\gamma_r=\boldsymbol\kappa_r$ 即得（63a）；令 $\mathbf c_r=\bar{\mathbf c}_r$、$\boldsymbol\beta_r=\boldsymbol\omega_r$ 由（68a）得（63b）；（63）中其余条件直接由（65b）（67b）（68b）得到。

## 图注与表注

**图 1**：RME 任务示意。上方：空—谱无线电地图（左）与采样张量（右）；下方：利用稀疏测量（左）进行估计（右）。
**图 2**：无线电地图分解模型示意（发射机 1、2 的 SLF 与 PSD 经外积叠加成无线电地图）。
**图 3**：测量矩阵化示意。左：测量 $\mathcal O\circledast\mathcal Y$；右：$\mathbf Y(:,\Omega_{\mathrm{vec}})$。
**图 4**：第 10 个频带恢复的无线电地图；$d_c=50$、$\tau=10\%$。(a) $\sigma_s=6$、$R=6$；(b) $\sigma_s=10$、$R=2$。（各子图含真实地图、观测与各方法的恢复结果及 RSE/MSSIM。）
**图 5**：第 10 个频带恢复的无线电地图；$\tau=5\%$、$R=3$。（含真实地图、观测、LL1、TPS、NN 与三种 LaPnP 变体的结果及 RSE/MSSIM。）
**图 6**：RTM 下不同估计 $\widehat R$ 的性能；$\tau=10\%$、$R=3$。(a) RSE；(b) MSSIM。
**图 7**：曼海姆数据实验中第 1、5、9 个频带恢复的无线电地图；$\tau=5\%$。（含真实地图、观测、Nasdac、Dowjons、LL1 与三种 LaPnP 变体及 RSE/MSSIM。）

**表注**：表 I—V 已分别在第 V-B、V-C、V-D 节按原表逐格转录；表 I 为不同采样率 $\tau$ 的性能（$\sigma_s=6$、$d_c=50$、$R=6$）；表 II 为不同阴影方差 $\sigma_s$ 的性能（$d_c=50$、$\tau=10\%$、$R=6$）；表 III 为不同噪声下的性能（含运行时间）；表 IV 为 RTM 下不同 $\tau$ 的性能（$R=3$）；表 V 为曼海姆数据集不同采样率下的性能。

## 参考文献

> 以下按原文编号 [1]—[59] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的 “Y .”“¨” 等空格/变音伪影已按常规写法整理，书目内容未改动。

[1] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, “A tutorial on environment-aware communications via channel knowledge map for 6G,” IEEE Commun. Surveys Tuts., 2024.

[2] S. Bi, J. Lyu, Z. Ding, and R. Zhang, “Engineering radio maps for wireless resource management,” IEEE Wireless Commun., vol. 26, no. 2, pp. 133–141, 2019.

[3] D. Romero and S.-J. Kim, “Radio map estimation: A data-driven approach to spectrum cartography,” IEEE Signal Process. Mag., vol. 39, no. 6, pp. 53–72, 2022.

[4] J. A. Bazerque, G. Mateos, and G. B. Giannakis, “Group-lasso on splines for spectrum cartography,” IEEE Trans. Signal Process., vol. 59, no. 10, pp. 4648–4663, 2011.

[5] S.-J. Kim, E. Dall’Anese, and G. B. Giannakis, “Cooperative spectrum sensing for cognitive radios using kriged kalman filtering,” IEEE J. Sel. Topics Signal Process., vol. 5, no. 1, pp. 24–36, 2010.

[6] G. Boccolini, G. Hernández-Peñaloza, and B. Beferull-Lozano, “Wireless sensor network for spectrum cartography based on kriging interpolation,” in Proc. IEEE International Symposium on Personal, Indoor and Mobile Radio Communications (PIMRC), 2012.

[7] G. Zhang, X. Fu, J. Wang, X.-L. Zhao, and M. Hong, “Spectrum cartography via coupled block-term tensor decomposition,” IEEE Trans. Signal Process., vol. 68, pp. 3660–3675, 2020.

[8] H. Sun and J. Chen, “Integrated interpolation and block-term tensor decomposition for spectrum map construction,” IEEE Trans. Signal Process., vol. 72, pp. 3896–3911, 2024.

[9] ——, “Propagation map reconstruction via interpolation assisted matrix completion,” IEEE Trans. Signal Process., vol. 70, pp. 6154–6169, 2022.

[10] S. Shrestha, X. Fu, and M. Hong, “Deep spectrum cartography: completing radio map tensors using learned neural models,” IEEE Trans. Signal Process., vol. 70, pp. 1170–1184, 2022.

[11] S. Timilsina, S. Shrestha, and X. Fu, “Quantized radio map estimation using tensor and deep generative models,” IEEE Trans. Signal Process., vol. 72, pp. 173–189, 2024.

[12] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, “RadioUnet: Fast radio map estimation with convolutional neural networks,” IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.

[13] Y. Teganya and D. Romero, “Deep completion autoencoders for radio map estimation,” IEEE Trans. Wireless Commun., vol. 21, no. 3, pp. 1710–1724, 2021.

[14] S. Roger, M. Brambilla, B. C. Tedeschini, C. Botella-Mascarell, M. Cobos, and M. Nicoli, “Deep-learning-based radio map reconstruction for V2X communications,” IEEE Trans. Veh. Technol., vol. 73, no. 3, pp. 3863–3871, 2024.

[15] U. S. Kamilov, C. A. Bouman, G. T. Buzzard, and B. Wohlberg, “Plug-and-play methods for integrating physical and learned models in computational imaging: Theory, algorithms, and applications,” IEEE Signal Process. Mag., vol. 40, no. 1, pp. 85–97, 2023.

[16] S. V. Venkatakrishnan, C. A. Bouman, and B. Wohlberg, “Plug-and-play priors for model based reconstruction,” in Proc. IEEE Global Conference on Signal and Information Processing (GlobalSIP), 2013.

[17] S. Li, L. Cheng, X. Fu, and J. Li, “Zero-shot reconstruction of ocean sound speed field tensors: A deep plug-and-play approach,” The Journal of the Acoustical Society of America, vol. 155, no. 5, pp. 3475–3489, 2024.

[18] Y.-Y. Liu, X.-L. Zhao, Y.-B. Zheng, T.-H. Ma, and H. Zhang, “Hyperspectral image restoration by tensor fibered rank constrained optimization and plug-and-play regularization,” IEEE Trans. Geosci. Remote Sens., vol. 60, pp. 1–17, 2022.

[19] K. Wei, A. Aviles-Rivero, J. Liang, Y. Fu, C.-B. Schönlieb, and H. Huang, “Tuning-free plug-and-play proximal algorithm for inverse imaging problems,” in Proc. International Conference on Machine Learning (ICML). PMLR, 2020.

[20] J. Liu, Y. Sun, C. Eldeniz, W. Gan, H. An, and U. S. Kamilov, “Rare: Image reconstruction using deep priors learned without groundtruth,” IEEE J. Sel. Topics Signal Process., vol. 14, no. 6, pp. 1088–1099, 2020.

[21] A. Buades, B. Coll, and J.-M. Morel, “A non-local algorithm for image denoising,” in Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR). IEEE, 2005.

[22] K. Dabov, A. Foi, V. Katkovnik, and K. Egiazarian, “Image denoising by sparse 3-D transform-domain collaborative filtering,” IEEE Trans. Image Process., vol. 16, no. 8, pp. 2080–2095, 2007.

[23] K. Zhang, W. Zuo, and L. Zhang, “FFDNet: Toward a fast and flexible solution for CNN-based image denoising,” IEEE Trans. Image Process., vol. 27, no. 9, pp. 4608–4622, 2018.

[24] K. Zhang, Y. Li, W. Zuo, L. Zhang, L. Van Gool, and R. Timofte, “Plug-and-play image restoration with deep denoiser prior,” IEEE Trans. Pattern Anal. Mach. Intell., vol. 44, no. 10, pp. 6360–6376, 2021.

[25] S. H. Chan, X. Wang, and O. A. Elgendy, “Plug-and-play ADMM for image restoration: Fixed-point convergence and applications,” IEEE Trans. Comput. Imag., vol. 3, no. 1, pp. 84–98, 2016.

[26] E. Ryu, J. Liu, S. Wang, X. Chen, Z. Wang, and W. Yin, “Plug-and-play methods provably converge with properly trained denoisers,” in Proc. International Conference on Machine Learning (ICML). PMLR, 2019.

[27] S. Sreehari, S. V. Venkatakrishnan, B. Wohlberg, G. T. Buzzard, L. F. Drummy, J. P. Simmons, and C. A. Bouman, “Plug-and-play priors for bright field electron tomography and sparse interpolation,” IEEE Trans. Comput. Imag., vol. 2, no. 4, pp. 408–423, 2016.

[28] A. M. Teodoro, J. M. Bioucas-Dias, and M. A. T. Figueiredo, “A convergent image fusion algorithm using scene-adapted Gaussian-mixture-based denoising,” IEEE Trans. Image Process., vol. 28, no. 1, pp. 451–463, 2019.

[29] J. A. Bazerque and G. B. Giannakis, “Distributed spectrum sensing for cognitive radio networks by exploiting sparsity,” IEEE Trans. Signal Process., vol. 58, no. 3, pp. 1847–1862, 2009.

[30] D. Romero, S.-J. Kim, G. B. Giannakis, and R. López-Valcarce, “Learning power spectrum maps from quantized power measurements,” IEEE Trans. Signal Process., vol. 65, no. 10, pp. 2547–2560, 2017.

[31] D. Lee, S.-J. Kim, and G. B. Giannakis, “Channel gain cartography for cognitive radios leveraging low rank and sparsity,” IEEE Trans. Wireless Commun., vol. 16, no. 9, pp. 5953–5966, 2017.

[32] R. G. Gavaskar, C. D. Athalye, and K. N. Chaudhury, “On exact and robust recovery for plug-and-play compressed sensing,” Signal Processing, vol. 211, p. 109100, 2023.

[33] ——, “On plug-and-play regularization using linear denoisers,” IEEE Trans. Image Process., vol. 30, pp. 4802–4813, 2021.

[34] S. H. Chan, “Performance analysis of plug-and-play ADMM: A graph signal processing perspective,” IEEE Trans. Comput. Imag., vol. 5, no. 2, pp. 274–286, 2019.

[35] J. Liu, S. Asif, B. Wohlberg, and U. Kamilov, “Recovery analysis for plug-and-play priors using the restricted eigenvalue condition,” in Proc. Advances in Neural Information Processing Systems (NeurIPS), 2021.

[36] L. Xu, L. Cheng, J. Chen, W. Pu, and X. Fu, “Radio map estimation via latent-domain plug-and-play denoisers,” in Proc. IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2025.

[37] A. Goldsmith, Wireless Communications. Cambridge University Press, 2005.

[38] J. Hoydis, S. Cammerer, F. Ait Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, “Sionna: An open-source library for next-generation physical layer research,” arXiv preprint, Mar. 2022.

[39] S. Chouvardas, S. Valentin, M. Draief, and M. Leconte, “A method to reconstruct coverage loss maps based on matrix completion and adaptive sampling,” in Proc. IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2016.

[40] S. Boyd, N. Parikh, E. Chu, B. Peleato, J. Eckstein et al., “Distributed optimization and statistical learning via the alternating direction method of multipliers,” Foundations and Trends® in Machine Learning, vol. 3, no. 1, pp. 1–122, 2011.

[41] S. Majee, T. Balke, C. A. J. Kemp, G. T. Buzzard, and C. A. Bouman, “Multi-slice fusion for sparse-view and limited-angle 4d ct reconstruction,” IEEE Trans. Comput. Imag., vol. 7, pp. 448–462, 2021.

[42] P. Milanfar, “A tour of modern image filtering: New insights and methods, both practical and theoretical,” IEEE Signal Process. Mag., vol. 30, no. 1, pp. 106–128, 2013.

[43] R. Szeliski, Computer Vision: Algorithms and Applications. Springer Nature, 2022.

[44] G. Yu, G. Sapiro, and S. Mallat, “Solving inverse problems with piecewise linear estimators: From gaussian mixture models to structured sparsity,” IEEE Trans. Image Process., vol. 21, no. 5, pp. 2481–2499, 2011.

[45] P. Milanfar and M. Delbracio, “Denoising: A powerful building-block for imaging, inverse problems, and machine learning,” arXiv preprint arXiv:2409.06219, 2024.

[46] G. Zhou, A. Cichocki, Q. Zhao, and S. Xie, “Nonnegative matrix and tensor factorizations: An algorithmic perspective,” IEEE Signal Process. Mag., vol. 31, no. 3, pp. 54–65, 2014.

[47] N. Gillis and S. A. Vavasis, “Fast and robust recursive algorithms for separable nonnegative matrix factorization,” IEEE Trans. Pattern Anal. Mach. Intell., vol. 36, no. 4, pp. 698–714, 2014.

[48] X. Fu, W.-K. Ma, T.-H. Chan, and J. M. Bioucas-Dias, “Self-dictionary sparse regression for hyperspectral unmixing: Greedy pursuit and pure pixel search are related,” IEEE J. Sel. Topics Signal Process., vol. 9, no. 6, pp. 1128–1141, 2015.

[49] T. Goldstein, B. O’Donoghue, S. Setzer, and R. Baraniuk, “Fast alternating direction optimization methods,” SIAM Journal on Imaging Sciences, vol. 7, no. 3, pp. 1588–1623, 2014.

[50] R. A. Horn and C. R. Johnson, Matrix Analysis. Cambridge University Press, 2012.

[51] A. Berman and R. J. Plemmons, Nonnegative Matrices in the Mathematical Sciences. SIAM, 1994.

[52] Y.-X. Wang and H. Xu, “Stability of matrix factorization for collaborative filtering,” in Proc. International Conference on Machine Learning (ICML). PMLR, 2012.

[53] Z. Wang, A. Bovik, H. Sheikh, and E. Simoncelli, “Image quality assessment: from error visibility to structural similarity,” IEEE Trans. Image Process., vol. 13, no. 4, pp. 600–612, 2004.

[54] Z. Yun and M. F. Iskander, “Ray tracing for radio propagation modeling: Principles and applications,” IEEE Access, vol. 3, pp. 1089–1100, 2015.

[55] Ç. Yapar, R. Levie, G. Kutyniok, and G. Caire, “Dataset of pathloss and ToA radio maps with localization application,” arXiv preprint:2212.11777, 2022. [Online]. Available: https://arxiv.org/abs/2212.11777

[56] O. Ronneberger, P. Fischer, and T. Brox, “U-net: Convolutional networks for biomedical image segmentation,” in Proc. Medical Image Computing and Computer-Assisted Intervention (MICCAI), 2015.

[57] T. King, S. Kopf, T. Haenselmann, C. Lubberger, and W. Effelsberg, “CRAWDAD dataset mannheim/compass (v. 2008-04-11),” 2008, [Online]. Available: https://ieee-dataport.org/open-access/crawdad-mannheimcompass-v-2008-04-11.

[58] D.-X. Zhou, “The covering number in learning theory,” Journal of Complexity, vol. 18, no. 3, pp. 739–767, 2002.

[59] S. Shalev-Shwartz and S. Ben-David, Understanding Machine Learning: From Theory to Algorithms. Cambridge University Press, 2014.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含三条贡献、会议版本说明与记号系统）；第 II 节问题陈述与挑战（式（1）—（8），图 1）；第 III 节提出方法（式（9）—（23）、算法 1、图 2—3）；第 IV 节性能分析（假设 1—3、引理 1—2、定理 1—3、定义 1—2，式（24）—（32））；第 V 节数值结果（式（33）与 RSE/SNR 定义、表 I—V 逐格、图 4—7 讨论）；第 VI 节结论；附录 A—D（式（34）—（68））；图 1—7 图注与表注；参考文献 [1]—[59] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—7 的图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I—V 为矢量表格，已用 PyMuPDF 渲染原 PDF 第 9、10、11 页逐格核对后转录；④原文在数学记号上存在少量排版不一致（如 $\circledast$ 的符号字形、式（45）—（48）中的覆盖数指数写法），转录时按 PDF 渲染结果处理；⑤作者简介与版权声明不在正文范围，未收录。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
