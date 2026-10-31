---
layout: page
title: "WiFi-Diffusion：细粒度 WiFi 无线电地图估计｜中文全文译文"
permalink: /papers/translations/2026-07-12-2503-12004-wifi-diffusion-achieving-fine-grained-wifi-radio-map-estimation-with-u/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/870d5593d1b05f78/) · [原文 arXiv](https://arxiv.org/abs/2503.12004) · [全部目录](/papers/catalog/)

# WiFi-Diffusion：细粒度 WiFi 无线电地图估计

**原题：** WiFi-Diffusion: Achieving Fine-Grained WiFi Radio Map Estimation With Ultra-Low Sampling Rate by Diffusion Models  
**作者：** Zhiyuan Liu、Shuhang Zhang、Qingyu Liu、Hongliang Zhang、Lingyang Song  
**版本：** arXiv:2503.12004v3（eess.SP），2025-06-12，原文 16 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VII 节（含 IV-A/B/C/D、V-A/B/C 全部小节）、结论、表 I–VII 逐格、图 1–16 图注、基金与作者单位说明、参考文献 [1]–[34]（英文原条目）按原文结构录入；原文无附录。逐句逐式终校未做。

## 摘要

无线电地图给出某地理区域内各点的感兴趣通信参数（如接收信号强度）。它可用于提升该区域内频谱利用效率，对非授权 WiFi 频谱尤为关键。细粒度无线电地图估计问题，是利用区域中稀疏分布传感器采集的少量无线电样本推断高分辨率无线电地图。该问题因**超低采样率**而具有挑战性——可用样本数远少于无线电地图估计所需的高分辨率。我们提出 **WiFi-Diffusion**——一种利用扩散模型实现细粒度 WiFi 无线电地图估计的新型生成式框架。WiFi-Diffusion 运用生成式 AI 的创造力来应对超低采样率挑战，由三个模块组成：1）**增强模块（boost block）**，利用障碍物布局等先验信息优化扩散模型；2）**生成模块（generation block）**，利用扩散模型生成细粒度无线电地图的候选集；3）**选举模块（election block）**，以无线电传播模型为指引从候选集中选出最佳细粒度无线电地图。大量仿真表明：1）在相同超低采样率下，WiFi-Diffusion 生成的细粒度无线电地图比最先进（state-of-the-art，SOTA）方法好一个数量级；2）WiFi-Diffusion 只需 SOTA 五分之一的采样率，即可取得与之相当的细粒度无线电地图质量。

**索引词：** WiFi 频谱、细粒度无线电地图、扩散模型、生成式 AI。

## I. 引言

无线电地图刻画通信信道中感兴趣的参数，例如某地理区域内每一点的接收信号强度（received signal strength，RSS）[1]。它可显著改善许多无线应用的性能，使动态频谱接入 [2]、频谱共享 [3] 与干扰管理 [4] 等功能成为可能。细粒度无线电地图是面向大地理区域的高分辨率无线电地图，对 WiFi 尤为重要——WiFi 工作于非授权频谱，在塑造未来无线连接方面起关键作用。当前 WiFi 频谱被大量设备广泛使用并传输海量数据；据估计全球近 70% 的互联网流量经由 WiFi 网络 [5]。随着 WiFi 流量预期快速增长，需要无线电识别、频谱管理与网络资源分配等先进技术来确保 WiFi 提供快速、可靠、泛在的连接。细粒度无线电地图可作为在大区域内高效利用 WiFi 不可或缺的基础。

无线电地图估计问题通常可分为两类：无采样问题与基于采样的问题。无采样问题利用发射机信息估计无线电地图，现有研究包括 [6]–[9]。无采样问题假设已知发射机信息（如数量、位置与发射功率）。该假设较强，实践中可能不成立，尤其对工作于非授权频谱的 WiFi——用户往往面对许多未知发射机。相反，基于采样的问题利用某些先验信息（如障碍物布局，以及稀疏分布于地理区域的传感器采集的有限数量无线电样本）预测无线电地图。本文聚焦 WiFi 频谱下基于采样的细粒度无线电地图估计问题。

求解基于采样无线电地图估计问题的方法通常可分为两类：基于插值的方法与基于深度学习的方法。基于插值的方法利用数学与统计方法估计无线电地图，著名方法包括径向基函数（radial basis function，RBF）[10]、样条 [11] 与普通克里金 [12]。然而这些方法往往难以为动态且地理上复杂的真实环境构建高质量无线电地图——它们依赖数学计算，未考虑某些关键先验信息（如障碍物布局），而后者会显著影响无线电信号传播。

近期前沿深度学习技术被应用于无线电地图估计问题，超越了传统基于插值的方法：Levie 等 [13] 提出基于 U-Net 的无线电地图估计方案；Teganya 等 [14] 与 Locke 等 [15] 设计了基于自编码器的方法；He 等 [16] 设计了基于 ResNet 的方法；其他深度学习方法（如前馈神经网络 [17]、生成对抗网络 [18] 与图注意力网络 [3]）也被用于无线电地图估计。

细粒度无线电地图估计因**超低采样率**而困难，即无线电地图所需高分辨率与传感器采集的极小样本数之间存在固有冲突。实践中，可采集无线电样本的传感器价格高昂：即使如 Ettus USRP B200mini 这样的低端传感器也要 1000 美元以上。要生成如 [13]、[14] 中 256×256 分辨率的无线电地图，即使 1% 的采样率也需 600 个以上传感器，总成本超过 60 万美元，不具可行性。因此，无线电地图估计方法必须在超低采样率（如低于 0.1%）下生成细粒度、高质量地图。然而现有深度学习方法（如 [15]、[14]、[16]、[17]、[18]、[13]、[3]）的采样率在 1% 到 10% 之间，都无法在超低采样率下构建细粒度、高质量无线电地图。

为应对超低采样率挑战，本文利用先进的基于扩散的生成技术进行无线电地图估计。相比传统判别模型，生成模型的一个关键优势是其"跳出框框思考"（out-of-the-box thinking）能力——能从有限输入生成大量多样化预测。这种创造力使生成模型非常适合在超低采样率下估计无线电地图。最突出、最强大的生成模型之一是扩散模型，它首先在 [19] 中提出并在 [20] 中显著改进，此后被成功应用于图像合成 [21]、自然语言处理 [22] 与分子设计 [23] 等任务。据我们所知，我们是首个用基于扩散的生成技术求解无线电地图估计问题的工作。具体而言，我们设计 WiFi-Diffusion——一种能在超低采样率下生成细粒度、高质量无线电地图的基于扩散模型算法。

如图 1 所示，WiFi-Diffusion 的核心思想是：先用扩散模型生成细粒度无线电地图的候选集，再从集合中选出最佳地图作为最终输出。为优化最终输出质量，WiFi-Diffusion 解决以下两个关键问题：

- 如何提升候选集中无线电地图的质量？
- 如何从候选集中找出最佳地图？

为解决第一个问题，WiFi-Diffusion 引入**增强模块**：把先验信息（包括障碍物布局、无线电传播规律与采集的无线电样本）作为带自注意力的 UNet 模型的输入。该 UNet 模型从构建无线电地图的视角识别地理区域内的"关键点"（critical points），并把这些点的信息传递给扩散模型。随后 WiFi-Diffusion 在**生成模块**中利用扩散模型从有限样本生成一组细粒度无线电地图候选。尽管候选图质量可被前面的增强模块提升，但由于超低采样率，多数候选图质量很差，只有少数准确。于是 WiFi-Diffusion 进入**选举模块**解决第二个问题、从候选集中选出最佳地图：以数学无线电传播模型为指引，识别候选集中最符合传播模型的地图，并将其选为最终输出。通过这一由三模块组成的新型生成框架，WiFi-Diffusion 能在超低采样率下生成细粒度、高质量无线电地图。

具体而言，本文主要贡献总结如下：

- 我们提出 WiFi-Diffusion——一种面向 WiFi 频谱细粒度无线电地图估计的新型生成框架。为应对细粒度无线电地图估计的超低采样率挑战，WiFi-Diffusion 利用基于扩散的生成模型的创造力产生多样化细粒度无线电地图候选集，再从该集合中识别并选出最佳地图作为最终输出。据我们所知，我们是首个用基于扩散的生成技术求解基于采样的无线电地图估计问题的工作。
- 尽管扩散模型能生成多样化细粒度无线电地图，但其中多数质量很差、仅少数准确。为保证高质量最终输出，WiFi-Diffusion 在候选生成之前引入增强模块、在其后引入选举模块：增强模块利用障碍物布局、无线电传播原理与采集样本等先验信息提升扩散模型生成的候选质量；选举模块以数学无线电传播模型为指引从多样化候选中找出最佳地图。借助增强、生成与选举三个模块，WiFi-Diffusion 能在超低采样率下生成细粒度、高质量无线电地图。
- 基于 5750 MHz（WiFi 5G）BART-Lab 无线电地图数据集的大量仿真表明 WiFi-Diffusion 有效：具体地，1）WiFi-Diffusion 在采样率低于 0.1% 时即可生成细粒度、高质量无线电地图；2）在相同超低采样率下，其生成的细粒度无线电地图比 SOTA 好十倍；3）WiFi-Diffusion 只需 SOTA 五分之一采样率即可生成相当的细粒度无线电地图。

全文其余部分组织如下：第 II 节描述系统模型并引入无线电地图估计问题；第 III 节给出 WiFi-Diffusion 设计的关键思想；第 IV 节给出设计细节；第 V 节通过大量仿真评估其性能；第 VI 节讨论潜在应用；第 VII 节总结全文。

## II. 问题描述

考虑二维感兴趣区域 $\mathcal Y\subset\mathbb R^2$。考虑传感器集合 $\mathcal S=\{1,2,\cdots,k\}$（传感器数量为 $k$），每个传感器 $s\in\mathcal S$ 位于唯一坐标 $\mathbf y_s\in\mathcal Y$。每个传感器 $s$ 在其位置 $\mathbf y_s$ 测量给定 WiFi 频段 $\mathcal F$ 上的 RSS，记 $r_s(f)$ 为频率 $f\in\mathcal F$ 上的 RSS（假设测量期间小时空偏移上的快衰落效应已被平均掉）。这些无线电样本 $r_s(f)$（$s\in\mathcal S$、$f\in\mathcal F$）上报给融合中心，融合中心依应用可以是基站或云服务器。为便于数学分析，本文将焦点收窄到单一频率 $f$，只考虑 $s\in\{1,2,\cdots,k\}$ 在相应位置 $\mathbf y_s\in\mathcal Y$ 的空间样本 RSS $r_s$；并把连续空间 $\mathcal Y$ 离散为 $H\times W$ 网格（高 $H$、宽 $W$）。于是每个位置 $\mathbf y_s$ 对应网格索引 $(h_s,w_s)$，其中 $h_s\in\{0,1,\cdots,H-1\}$、$w_s\in\{0,1,\cdots,W-1\}$。定义 $\mathbf S_k$ 为 $H\times W$ 矩阵，其索引 $(h_s,w_s)$ 处的元素 $\mathbf S_k(h_s,w_s)$ 在该网格点无传感器时为 0，否则为位于 $(h_s,w_s)$ 的传感器 $s$ 采集的 RSS 值 $r_s$。

为使结论贴近现实，我们考虑环境障碍物（具体为建筑物）。这些结构可占据区域 $\mathcal Y$ 内任意网格点，常覆盖多个相邻点。我们认为被占据网格点没有 RSS，但它们确实通过把无线电波反射回环境、阻挡或显著衰减穿过它们的无线电波，影响周围区域的 RSS。本文用矩阵 $\mathbf B$ 表示建筑布局，其索引 $(h_s,w_s)$ 处的元素 $\mathbf B(h_s,w_s)$ 在网格点 $(h_s,w_s)$ 无建筑时为 0，否则为 1。

无线电地图估计问题要求融合中心利用 $\mathbf S_k$ 与 $\mathbf B$ 推断（估计）区域 $\mathcal Y$ 内每个网格点的 RSS。具体如图 2 所示：该问题要求融合中心利用图 2a（$\mathbf S_k$，给出采集的无线电样本 RSS 值）与图 2b（$\mathbf B$，建筑布局）的信息，推断图 2c（感兴趣区域内每个位置的 RSS 值）。

**表 I　关键记号汇总**

| 符号 | 定义 |
|---|---|
| $\mathcal Y$ | 无线电地图所在区域 |
| $k$ | 传感器采集的无线电样本数 |
| $\mathcal S$ | 可采集无线电样本的 $k$ 个传感器集合 |
| $H$ | 一张无线电地图中每行的网格（点）数 |
| $W$ | 一张无线电地图中每列的网格（点）数 |
| $\mathbf S_k$ | $H\times W$ 矩阵：索引 $(h_s,w_s)$ 处无传感器时为 0，否则为该传感器采集样本的 RSS 值 |
| $\mathbf B$ | 建筑布局 |

## III. WiFi-Diffusion：基本思想

细粒度无线电地图估计问题极为困难，因为传感器采集的样本数相对于实际要估计的无线电地图高分辨率而言极小。当图中仅已知极小比例（如 0.1%）的点时，传统方法几乎不可能构建无线电地图。为克服该挑战，我们提出 WiFi-Diffusion——一种利用基于扩散的生成技术在超低采样率下构建细粒度、高质量无线电地图的算法。

如图 3 所示，WiFi-Diffusion 由三个模块组成：增强模块、生成模块与选举模块。下面简要描述这三个模块。由于讨论增强模块必须先清楚理解生成模块，我们先描述生成模块。

**模块 2：生成模块。** 在该模块中，WiFi-Diffusion 使用基于扩散的生成模型去噪扩散隐式模型（Denoising Diffusion Implicit Model，DDIM）从有限的已知无线电样本产生细粒度无线电地图候选集。生成模型具有"跳出框框思考"的能力，可从极有限输入做出多样化预测（尽管其中多数可能不准确）。对细粒度无线电地图估计问题，我们用 DDIM 仅从少量（仿真中低于 0.1%）无线电样本生成多张（仿真中 64 张）细粒度无线电地图。尽管这些生成地图大多可能显著偏离真实无线电环境，我们期望集合中存在少数高质量地图。

**模块 1：增强模块。** 尽管 DDIM 等生成模型具有创造力，但极有限的无线电样本数常导致候选集主要或完全由低质量地图构成。因此在生成模块之前设计增强模块、提升候选集中地图质量很重要。具体地，增强模块利用建筑布局、无线电传播原理与采集无线电样本等先验信息，作为带自注意力的 UNet 模型输入；该 UNet 模型从构建无线电地图的视角识别地理区域 $\mathcal Y$ 内的"关键点"，并把其信息传递给 DDIM 供后续生成模块使用。

**模块 3：选举模块。** 即使有增强模块，DDIM 生成的候选集中仍有许多低质量地图。因此需要在生成模块之后设计选举模块，从候选集中找出最佳地图。具体地，选举模块以数学无线电传播模型为指引，识别候选集中最符合传播模型的地图，将其选为最佳地图并作为最终输出。

借助上述三个模块，WiFi-Diffusion 能在采样率极低时构建细粒度、高质量无线电地图。下一节描述三个模块的细节。

## IV. WiFi-Diffusion：设计细节

WiFi-Diffusion 由三个模块组成：增强模块、生成模块与选举模块。本节描述各模块设计细节。

### A. 增强模块

本模块目标是提升 DDIM 在后续生成模块中产生的细粒度无线电地图质量。在该模块中，我们设计 AttUnet——一种带自注意力的 UNet 模型，用于定位区域 $\mathcal Y$ 内的"关键点"。AttUnet 基于先验信息（建筑布局、无线电传播规律与已知无线电样本的 RSS 值）预测这些关键点处的 RSS 值，然后把预测提供给 DDIM。尽管 DDIM 作为扩散模型擅长关注重要特征，但缺乏对底层物理规律的深入理解；通过纳入 AttUnet 具有物理规律意识的预测，DDIM 性能可得到改善。此外，AttUnet 通过向 DDIM 提供额外无线电样本的 RSS 信息（即对已识别关键点预测的 RSS 值）来增强 DDIM。同时使用已识别关键点与有限采集样本，DDIM 相比仅用有限采集样本能生成更高质量的细粒度无线电地图。

需要清楚：在没有建筑的环境中预测高功率无线电的传播对 DDIM 更容易；相反，在有建筑的复杂环境中预测低功率无线电的传播对 DDIM 挑战更大。我们把带建筑的复杂环境视为包含对 DDIM 关键的点所在区域。

AttUnet 架构如图 4 所示，参数详见表 II。具体地，AttUnet 先生成细粒度无线电地图的粗略估计；随后我们把关键点视为地图上 RSS 存在局部突变、或 RSS 变化率突然改变的位置——这些现象通常源于电磁波与建筑及其他波之间的复杂相互作用。为识别这些关键点，我们沿多个方向平移局部窗口以分析窗口内区域：若平移导致 RSS 强度出现显著变化，则认为对应点是关键点。

**表 II　AttUnet 参数**

| 层编号 | 输入 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 输出 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 输入通道 | 3 | 128 | 128 | 256 | 256 | 512 | 512 | 512 | 512 | 256 | 256 | 128 | 128 |
| 输出通道 | 128 | 128 | 256 | 256 | 512 | 512 | 512 | 512 | 256 | 256 | 128 | 128 | 1 |
| 输入分辨率 | 256 | 256 | 128 | 64 | 32 | 16 | 8 | 8 | 16 | 32 | 64 | 128 | 256 |
| 输出分辨率 | 256 | 128 | 64 | 32 | 16 | 8 | 8 | 16 | 32 | 64 | 128 | 256 | 256 |
| 是否带注意力 | — | — | — | — | — | — | ✓ | ✓ | ✓ | — | — | — | — |

数学上，AttUnet 生成的地图 $\mathbf x_a$ 在给定窗口 $w(x,y)$ 与平移 $[u,v]$ 时外观变化为

$$
E(u,v)=\sum_{x,y}w(x,y)\left[\mathbf x_a(x+u,y+v)-\mathbf x_a(x,y)\right]^2, \tag{1}
$$

其中 $\mathbf x_a(x,y)$ 是地图 $\mathbf x_a$ 中位于 $(x,y)$ 的点的 RSS，$w(x,y)$ 为高斯窗函数——其中心权重高、边缘权重低，可有效去除 $\mathbf x_a$ 中噪声并使 $\mathbf x_a$ 连续平滑。$E(u,v)$ 在 $(0,0)$ 邻域内的局部二次近似由二阶 Taylor 展开给出：

$$
E(u,v)\approx E(0,0)+[u\ v]\begin{bmatrix}E_u'(0,0)\\ E_v'(0,0)\end{bmatrix}+\frac{1}{2}[u\ v]\begin{bmatrix}E_{uu}''(0,0)&E_{uv}''(0,0)\\ E_{uv}''(0,0)&E_{vv}''(0,0)\end{bmatrix}\begin{bmatrix}u\\ v\end{bmatrix}, \tag{2}
$$

可简化为

$$
E(u,v)\approx[u\ v]\,\mathbf M\begin{bmatrix}u\\ v\end{bmatrix}, \tag{3}
$$

其中

$$
\mathbf M:=\sum_{x,y}w(x,y)\begin{bmatrix}\left((\mathbf x_a)_x'\right)^2&(\mathbf x_a)_x'(\mathbf x_a)_y'\\ (\mathbf x_a)_x'(\mathbf x_a)_y'&\left((\mathbf x_a)_y'\right)^2\end{bmatrix}. \tag{4}
$$

由二次型对角化方法有

$$
\mathbf M=\mathbf R^{-1}\begin{bmatrix}\lambda_1&0\\0&\lambda_2\end{bmatrix}\mathbf R. \tag{5}
$$

给定点 $(x,y)$，先计算 $\mathbf M$ 再求 $\lambda_1,\lambda_2$；若 $\lambda_1,\lambda_2$ 都很大，则地图 $\mathbf x_a$ 在该点的 RSS 变化剧烈，我们视该点为关键点。

总体而言，增强模块先用 AttUnet 从采集的已知无线电样本与建筑布局生成初步细粒度无线电地图，再从无线电传播规律视角识别地图中的关键点。在增强模块末端，我们把预测的无线电样本（已识别关键点及其对应预测 RSS 值）与传感器采集的已知样本一起传递给 DDIM。为进一步增强 DDIM 性能，我们还在地图中随机选取特定数量的点，把其预测 RSS 值传给 DDIM。与 $\mathbf S_k$ 类似，定义 $\mathbf{ES}_k$ 为 $H\times W$ 矩阵，其索引 $(h_s,w_s)$ 处的元素 $\mathbf{ES}_k(h_s,w_s)$ 在该网格点为关键点、随机选取点或已采集无线电样本点时表示相应 RSS 值，否则为 0。图 5a 给出 $\mathbf S_k$ 示例、图 5c 给出 $\mathbf{ES}_k$ 示例，图 5b 给出含原始点（对应已知无线电样本）、增强模块识别的关键点与随机选取点的无线电地图示例。$\mathbf{ES}_k$ 是增强模块的输出，也是后续生成模块的输入。

### B. 生成模块

本模块目标是生成多样化的细粒度无线电地图候选集，我们采用 DDIM 实现该目标。

我们把细粒度无线电地图估计任务视为生成问题：把细粒度无线电地图视为从 $(H\times W)$ 维分布中抽取的样本。通过从可用无线电地图数据集中学习该分布，我们能有效应对超低采样率挑战，即使待估计地图中已知无线电样本数极少也能生成细粒度、高质量无线电地图。

假设待估计的细粒度无线电地图 $\mathbf x_0$ 在给定 $\mathbf B$ 与 $\mathbf{ES}_k$ 下服从某条件概率分布 $\mathcal X_c$。我们用去噪扩散概率模型（Denoising Diffusion Probabilistic Model，DDPM）[20] 学习 $\mathcal X_c$。DDPM 的关键思想是把 $\mathcal X_c$ 变换为标准正态分布 $\mathcal N(0,\mathbf I)$，再训练神经网络建模反向过程，从而建立从 $\mathcal N(0,\mathbf I)$ 回到 $\mathcal X_c$ 的映射。借助 DDPM，我们可以通过在 $\mathcal N(0,\mathbf I)$ 中采样得到 $\mathcal X_c$ 的样本值。

具体地，DDPM 包含两个过程：前向过程（扩散过程）与反向过程（逆扩散过程）。

**前向过程。** 它是马尔可夫链。我们手工构造转移核 $q(\mathbf x_t\mid\mathbf x_{t-1})$，把数据分布逐步变换为易处理的先验分布。转移核的典型设计是高斯扰动：

$$
q(\mathbf x_t\mid\mathbf x_{t-1})=\mathcal N\left(\mathbf x_t;\sqrt{1-\beta_t}\,\mathbf x_{t-1},\beta_t\mathbf I\right), \tag{6}
$$

其中 $\beta_t$ 为模型训练前选定的超参数。利用链式法则与概率的马尔可夫性，把 $\mathbf x_1,\mathbf x_2,\ldots,\mathbf x_t$ 在给定 $\mathbf x_0$ 下的联合分布记为

$$
q(\mathbf x_1,\ldots,\mathbf x_t\mid\mathbf x_0)=\prod_{i=1}^{t}q(\mathbf x_i\mid\mathbf x_{i-1}). \tag{7}
$$

基于重参数化技巧有

$$
\begin{cases}
\mathbf x_1=\sqrt{1-\beta_1}\,\mathbf x_0+\beta_1\boldsymbol\epsilon\\
\mathbf x_2=\sqrt{1-\beta_2}\,\mathbf x_1+\beta_2\boldsymbol\epsilon\\
\vdots\\
\mathbf x_t=\sqrt{1-\beta_t}\,\mathbf x_{t-1}+\beta_t\boldsymbol\epsilon
\end{cases}\tag{8}
$$

其中 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$。令 $\alpha_t:=1-\beta_t$、$\bar\alpha_t:=\prod_{s=0}^{t}\alpha_s$，可对上式联合分布做边缘化：

$$
\mathbf x_t=\sqrt{\bar\alpha_t}\,\mathbf x_0+\sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon, \tag{9}
$$

$$
q(\mathbf x_t\mid\mathbf x_0)=\mathcal N\left(\mathbf x_t;\sqrt{\bar\alpha_t}\,\mathbf x_0,(1-\bar\alpha_t)\mathbf I\right). \tag{10}
$$

考虑到

$$
\lim_{t\to\infty}\bar\alpha_t=\lim_{t\to\infty}\prod_{s=0}^{t}\alpha_s=\lim_{t\to\infty}\prod_{s=0}^{t}(1-\beta_s)=0, \tag{11}
$$

有

$$
\lim_{t\to\infty}\mathbf x_t\sim\mathcal N(\mathbf 0,\mathbf I). \tag{12}
$$

**反向过程。** 既然可通过加噪把 $\mathcal X_c$ 变换为 $\mathcal N(0,\mathbf I)$，我们同样可通过去噪把 $\mathcal N(0,\mathbf I)$ 映射回 $\mathcal X_c$——这就是 DDPM 的反向过程。

在反向过程中真实分布 $q(\mathbf x_{t-1}\mid\mathbf x_t)$ 不可得；但加入条件后验概率 $\mathbf x_0$ 后，可由 Bayes 定理与马尔可夫链性质得到：

$$
q(\mathbf x_{t-1}\mid\mathbf x_t,\mathbf x_0)=\frac{q(\mathbf x_{t-1},\mathbf x_t,\mathbf x_0)}{q(\mathbf x_t,\mathbf x_0)}=\frac{q(\mathbf x_t\mid\mathbf x_{t-1})q(\mathbf x_{t-1}\mid\mathbf x_0)}{q(\mathbf x_t\mid\mathbf x_0)}=\mathcal N\left(\mathbf x_{t-1};\tilde{\boldsymbol\mu}_t(\mathbf x_t,\mathbf x_0),\tilde\beta_t\mathbf I\right). \tag{13}
$$

因此只要扩散基于正态分布，反向过程即可求解。

逆向马尔可夫链可由先验分布 $p(\mathbf x_t)=\mathcal N(\mathbf x_t;\mathbf 0,\mathbf I)$ 与可学习转移核 $p_\theta(\mathbf x_{t-1}\mid\mathbf x_t)$（用 $p_\theta(\mathbf x_{t-1}\mid\mathbf x_t)$ 表示 $q(\mathbf x_{t-1}\mid\mathbf x_t,\mathbf x_0)$）表示。可学习转移核形式为

$$
p_\theta(\mathbf x_{t-1}\mid\mathbf x_t)=\mathcal N\left(\mathbf x_{t-1};\boldsymbol\mu_\theta(\mathbf x_t,t),\boldsymbol\Sigma_\theta(\mathbf x_t,t)\right), \tag{14}
$$

其中 $\theta$ 表示模型参数，$\boldsymbol\mu_\theta(\mathbf x_t,t)$ 可由与 AttUnet 架构相同的深度神经网络求解，$\boldsymbol\Sigma_\theta(\mathbf x_t,t)$ 为时间相关参数。把条件 $\{\mathbf B,\mathbf{ES}_k\}$ 记为 $\mathbf c$，有

$$
p_\theta(\mathbf x_{t-1}\mid\mathbf x_t,\mathbf c)=\mathcal N\left(\mathbf x_{t-1};\boldsymbol\mu_\theta(\mathbf x_t,t),\boldsymbol\Sigma_\theta(\mathbf x_t,t)\right). \tag{15}
$$

训练时，去噪模型以如下目标训练：

$$
\nabla_\theta\left\|\boldsymbol\epsilon-\boldsymbol\epsilon_\theta\left(\sqrt{\bar\alpha_t}\mathbf x_0+\sqrt{1-\bar\alpha_t}\boldsymbol\epsilon,t,\mathbf c\right)\right\|^2, \tag{16}
$$

其中 $\boldsymbol\epsilon\sim\mathcal N(\mathbf 0,\mathbf I)$ 为噪声，$\boldsymbol\epsilon_\theta$ 为去噪模型。

推理时，我们的目标是从 $\mathcal N(\mathbf 0,\mathbf I)$ 采样的不同噪声生成多样化结果（细粒度无线电地图）。DDPM 的重要局限是推断并生成高质量结果需要大量迭代。为此我们在推理时使用 DDIM [24]：DDIM 显著减少推理时间，同时保持生成结果的高质量；而且 DDIM 可在模型训练后无缝应用，无需重训即可把 DDPM 模型直接转换为 DDIM 模型。

DDIM 按如下方式从 $\mathbf x_t$ 推断 $\mathbf x_{t-1}$：

$$
\mathbf x_{t-1}=\underbrace{\sqrt{\alpha_{t-1}}\left(\frac{\mathbf x_t-\sqrt{1-\alpha_t}\,\boldsymbol\epsilon_\theta(\mathbf x_t,t)}{\sqrt{\alpha_t}}\right)}_{\text{预测的 }\mathbf x_0}+\underbrace{\sqrt{1-\alpha_{t-1}-\sigma_t^2}\cdot\boldsymbol\epsilon_\theta(\mathbf x_t,t)}_{\text{指向 }\mathbf x_t\text{ 的方向}}+\underbrace{\sigma_t\boldsymbol\epsilon_t}_{\text{随机噪声}}, \tag{17}
$$

其中 $\sigma_t^2=\eta\cdot\frac{\sqrt{(1-\alpha_{t-1})/(1-\alpha_t)}}{\sqrt{(1-\alpha_t/\alpha_{t-1})}}$。若 $\eta=1$，DDIM 与 DDPM 相同；若 $\eta=0$，DDIM 求解常微分方程。生成模块的训练与推断如图 6 所示。在生成模块末端，我们得到 DDIM 从 $\mathbf B$ 与 $\mathbf{ES}_k$ 生成的一组多样化细粒度无线电地图候选。

### C. 选举模块

本模块目标是从生成模块产生的多样化细粒度无线电地图候选集中识别最佳地图。我们以无线电传播模型为指引，识别集合中最符合传播模型的地图并视其为最佳地图。

如上一模块所述并在图 7 中示意，扩散模型 DDIM 可建立从噪声分布 $\mathcal N(\mathbf 0,\mathbf I)$ 到条件 $\mathbf c$ 下条件分布 $\mathcal X_c$ 的映射：

$$
\mathbf x_{z_i}=\mathrm{DDIM}(\mathbf z_i,\mathbf c), \tag{18}
$$

其中 $\mathbf x_{z_i}\in\mathcal X_c$、$\mathbf z_i\in\mathcal N(\mathbf 0,\mathbf I)$（$i\in\{1,2,\cdots,m\}$，$m$ 为 DDIM 生成的地图候选数）。

无线电地图估计问题要求结果 $\mathbf x_{z_i}$ 接近真实无线电地图 $\mathbf x_0$。因此我们从 $\{\mathbf z_1,\mathbf z_2,\cdots,\mathbf z_m\}$ 生成 $\{\mathbf x_{z_1},\mathbf x_{z_2},\cdots,\mathbf x_{z_m}\}$，并选出最接近 $\mathbf x_0$ 的 $\mathbf x_z$ 作为输出。考虑到真实地图 $\mathbf x_0$ 未知，直观上我们打算用已知无线电样本 RSS 值与 DDIM 预测 RSS 值之间的均方误差（Mean-Square Error，MSE）损失近似 $\mathbf x_{z_i}$ 与 $\mathbf x_0$ 的距离，即

$$
\mathrm{MSE}(\mathbf x_{z_i},\mathbf x_0)\sim\mathrm{spMSE}(\mathbf x_{z_i},\mathbf S_k)=\mathrm{MSE}(\mathbf x_{z_i}\cdot\mathrm{mask}_k,\mathbf S_k), \tag{19}
$$

其中 $\mathrm{mask}_k$ 表示除索引 $(h_s,w_s)$（对应 $\mathbf S_k$ 中非零元素）处的元素外全为零的掩模矩阵。由上式有

$$
\mathbf x_z=\arg\min_{\mathbf x_{z_i}}\left\{\mathrm{spMSE}(\mathbf S_k,\mathbf x_{z_i})\right\}. \tag{20}
$$

然而我们注意到 $\mathrm{spMSE}(\mathbf x_{z_i},\mathbf S_k)$ 在实践中不能很好地近似 $\mathrm{MSE}(\mathbf x_{z_i},\mathbf x_0)$，主要由于超低采样率（$\mathbf S_k$ 中几乎所有元素为零）。回忆增强模块中 AttUnet 生成了无线电地图 $\mathbf x_a$，这里用 $\mathbf x_a$ 帮助选图。我们引入修正因子 $\mathrm{res}$：

$$
\mathrm{MSE}(\mathbf x_0,\mathbf x_{z_i})=\mathrm{MSE}(\mathbf x_a,\mathbf x_{z_i})+\mathrm{res}, \tag{21}
$$

其中 $\mathrm{res}$ 的值可由不同分析方法导出。ResNet [16] 近年来被广泛用于特征提取；在 WiFi-Diffusion 中我们用它预测 $\mathrm{res}$：把 $\mathbf x_a$、$\mathbf x_{z_i}$、LoG（Laplacian of Gaussian）算子处理信息（边缘检测）以及 $\mathbf x_{z_i}$ 的高功率图（示例见图 8）一起提供给 ResNet 以学习修正因子 $\mathrm{res}$。

除 MSE 外，我们还在选举模块中纳入无线电传播模型作为选图指引。需要注意，获得待估计无线电地图的精确传播模型几乎不可能，尤其在复杂环境中。我们不关注传播难以预测的复杂区域（如带建筑的低功率区），而关注传播更直接的较简单区域（如无建筑的高功率区）：用传播模型计算这些简单区域内各点的 RSS 值，再与 DDIM 给出地图在其处的估计值比较；把估计 RSS 与传播模型计算值高度吻合的地图视为高质量地图。

具体地，选举模块把发射机附近的高功率区视为较简单区域。鉴于发射机附近近似满足无线电传播的理想条件，该区域内 RSS 分布预期遵循 Friis 传输公式 [25]：

$$
\frac{P_r}{P_t}=\frac{A_rA_t}{d^2\lambda^2}, \tag{22}
$$

其中 $P_t$ 为馈入发射天线的功率，$P_r$ 为接收天线输出端可用功率，$A_r$ 为接收天线有效面积，$A_t$ 为发射天线有效面积，$d$ 为天线间距离，$\lambda$ 为波长。

Friis 传输公式适用于两个单端口天线情形，其前提包括极化匹配、足够大的距离 $d$（满足远场条件）与发射天线互易性。在选举模块中，我们采用适用于多端口天线阵列的广义 Friis 传输公式 [26]：

$$
G_U=\frac{P_r}{P_t}\approx\frac{\mathbf x^H\mathbf y_{oi}^H\left(\mathbf y_{oo}+\mathbf y_{oo}^H\right)^{-1}\mathbf y_{oi}\mathbf x}{\mathbf x^H\left(\mathbf y_{ii}+\mathbf y_{ii}^H\right)\mathbf x}, \tag{23}
$$

其中 $\mathbf y_{ii}$ 为输入端口自导纳，$\mathbf y_{oi}$ 为输入端口到输出端口的互导纳，$\mathbf y_{oo}$ 为输出端口自导纳；输入端口连接内部导纳矩阵 $\mathbf y_{si}$ 与开路电压 $\mathbf v_{si}=\mathbf v_i+\mathbf y_{si}^{-1}\mathbf i_i$，且 $\mathbf x=(\mathbf y_{ii}+\mathbf y_{si})^{-1}\mathbf y_{si}\mathbf v_{si}$。自由空间远场情形下无线电传播遵循式 (23)，且正比关系 $\mathbf y_{oi}\propto\lambda/d$，于是

$$
G_U^{\mathrm{MAX}}=G_A^{\mathrm{MAX}}\left(\frac{\lambda}{4\pi d}\right)^2,\qquad G_U^{\mathrm{MIN}}=G_A^{\mathrm{MIN}}\left(\frac{\lambda}{4\pi d}\right)^2, \tag{24}
$$

其中 $G_A^{\mathrm{MAX}}$ 与 $G_A^{\mathrm{MIN}}$ 为收发阵列相对朝向的无量纲函数。

尽管发射机信息并非我们所研究无线电地图估计问题的输入，但在选举模块开始时，我们已从 DDIM 得到细粒度无线电地图候选集，很容易从候选集中每张地图学习发射机信息。结合上述无线电传播原理与已学到的发射机信息，可用极坐标预测发射机附近的 RSS 分布，记为 $\mathrm{RSS}_{\mathrm{phy}}(O,d,\theta)$；这里 $O$ 表示发射机中心，极轴对齐原始数据的 $x$ 轴。

为在 DDIM 生成的候选地图集中找出最佳地图，我们聚焦以发射机为中心的圆形区域并计算相应 RSS 值，再把这些计算值与各候选地图在相同位置的 RSS 值比较；候选地图质量由相似程度决定，用 MSE 量化。此外，我们从发射机发出探测射线并考察 RSS 沿射线传播直到与建筑相交的变化；通过评估观测 RSS 行为是否符合无线电传播物理规律所预测的平滑衰减模式，来评价结果的可靠性。

图 9 给出一个仿真示例（具体仿真设置见第 V 节），说明选举模块如何利用无线电传播规律从候选集中找出最佳无线电地图。图 9a 是含三个发射机的真实（真值）无线电地图；图 9b 与图 9c 都是估计地图，其中图 9b 优于图 9c。图 9d 比较不同地图在以第一个发射机为中心的圆形区域内的 RSS 值：可见较好地图（蓝色结果）的 RSS 与真实地图（绿色结果）高度吻合，而较差地图（红色结果）明显偏离；图 9e、9f 对第二、第三个发射机为中心的圆形区域呈现类似模式。图 9g 展示沿第一发射机发射射线的 RSS 变化：较好地图（蓝色）的 RSS 变化远接近零，而较差地图（红色）则不然；图 9h、9i 有类似观察。

总体而言，我们定义如下指标 $\mathrm{rate}_{\mathrm{phy}}$：

$$
\mathrm{rate}_{\mathrm{phy}}=\frac{1}{n}\sum_{i}^{n}\left\{\alpha\cdot\int_0^{2\pi}\left(\mathrm{RSS}_{\mathrm{phy}}(O_i,d,\theta)-\mathbf x_{z_i}(O_i,d,\theta)\right)^2+(1-\alpha)\cdot\sum_{l}^{\text{射线数}}\left(\frac{\partial\mathbf x_{z_i}}{\partial l}\middle/\sigma\right)\right\}, \tag{25}
$$

其中 $n$ 为发射机数，$\alpha$ 为超参数，$\sigma$ 为波动强度阈值。在选举模块中，我们计算 $\mathbf x_a$ 与 $\mathbf x_{z_i}$ 之间的 MSE 以及 $\mathrm{rate}_{\mathrm{phy}}$ 以找出最佳地图 $\mathbf x_z$。具体地，定义

$$
\mathbf x_z=\begin{cases}
\arg\min_{\mathbf x_{z_i}}\left\{\lambda\cdot\mathrm{spMSE}(\mathbf S_k,\mathbf x_{z_i})+\hat\lambda\cdot\mathrm{rate}_{\mathrm{phy}}\right\},&k>100\\[4pt]
\arg\min_{\mathbf x_{z_i}}\left\{\lambda\cdot\mathrm{MSE}(\mathbf x_a,\mathbf x_{z_i})+\mathrm{res}+\hat\lambda\cdot\mathrm{rate}_{\mathrm{phy}}\right\},&k\le100
\end{cases}\tag{26}
$$

其中 $\hat\lambda=(1-\lambda)$。

### D. 小结

总之，WiFi-Diffusion 是一种基于三模块扩散模型的细粒度无线电地图估计算法：增强模块利用建筑布局、无线电传播原理与采集无线电样本等先验信息，提升扩散模型生成的细粒度无线电地图候选质量；生成模块利用基于扩散的生成模型的创造力产生多样化细粒度无线电地图候选集；选举模块以数学无线电传播模型为指引，从扩散模型产生的多样化候选中找出最佳细粒度地图。下一节用大量仿真验证 WiFi-Diffusion 能在超低采样率下生成细粒度、高质量无线电地图，并显著优于 SOTA。

## V. 评估

本节评估 WiFi-Diffusion：先用案例研究评估其性能、展示其在超低采样率下构建细粒度高质量无线电地图的能力；再用大量仿真与多种基线算法比较，说明其在超低采样率下显著优于 SOTA；接着通过消融研究分析增强模块与选举模块各自对整体性能的贡献；此外进行鲁棒性研究，评估其在无线电地图估计的多种极端场景下（如单图发射机数变化、发射机位于地图之外、采集样本极少至 3 个）的性能；最后给出模型规模与训练成本，并用仿真表明即使把 SOTA 放大到相当或更大的复杂度与计算开销，WiFi-Diffusion 仍保持显著性能优势。

### A. 仿真设置

我们使用来自 [27]、[28] 的开源 BART-Lab 无线电地图数据集 ¹ 进行评估。该数据集由仿真软件 Altair Feko [29] 从 WinProp 获得，含 2000 张无线电地图，单图发射机数在 1–3 之间变化，含 2000 种从 OpenStreetMap [30] 提取的美国建筑布局，建筑高度设为 10 m。数据集包含 5 个频段（1750、2750、3750、4750、5750 MHz）的仿真无线电地图；我们专门使用 5750 MHz（WiFi 5G）数据。考虑到原始地图分辨率不同，为保持一致，我们从每张图随机选取 $256\times256$ 分辨率的区域，共得到 1776 张 $256\times256$ 无线电地图。对 WiFi-Diffusion，1300 张用于训练、376 张用于测试、100 张用于推断（评估）。

我们考虑的传感器采集样本数 $k$ 极小：$k\in\{200,150,100,50,25,10\}$。由于每张无线电地图分辨率为 $256\times256$，评估采样率为 $\frac{k}{H\times W}\in\{0.31\%,0.23\%,0.15\%,0.08\%,0.04\%,0.02\%\}$。

我们在 NVIDIA RTX 4090 GPU 与 AMD EPYC 9654 CPU 上实现 WiFi-Diffusion：深度学习代码用 PyTorch 构建，DDPM 推断步数为 1000（$t=1000$），DDIM 推断步数为 10（$u=10$）；生成模块对每个问题实例生成 64 张地图候选（$m=64$）。

为评估 WiFi-Diffusion，我们与以下基于插值的基线比较：

- **RBF [10]：** 在已知数据点周围构造基函数网络，用这些基函数的线性组合近似未知点取值。
- **样条（Splines）[11]：** 用分段低次多项式近似已知数据点之间曲线或曲面上的未知点取值。
- **普通克里金（ordinary kriging）[12]：** 用半变异函数描述空间自相关，并通过已知点观测数据的加权平均估计未知点取值。

我们还与以下基于深度学习的基线比较：

- **RadioUnet [13]：** 用 UNet 估计无线电地图。UNet 是卷积神经网络（convolutional neural network，CNN）架构，以对称 U 形结构为特征，由"编码器"（收缩路径）与"解码器"（扩张路径）组成。
- **SkipResidualAutoencoder [15]：** 用自编码器构建无线电地图。自编码器主要设计用于学习数据的有效表示；该基线的隐藏层数设为 128。
- **ResNet [16]：** 也评估 ResNet34：把最后全连接层改为两个以 SiLU 激活相连的 MLP 层，并用 sigmoid 激活输出；为把提取特征转换为 $256\times256$ 地图，最后一层大小设为 65536。

为量化算法性能，使用 MSE、均方根误差（Root Mean Square Error，RMSE）、归一化均方误差（Normalized Mean Square Error，NMSE）与峰值信噪比（Peak Signal to Noise Ratio，PSNR）[31]：

- **MSE：** 原始真值与预测值之差的平方的平均：

$$
\mathrm{MSE}=\frac{1}{H\times W}\sum_{h=0}^{H-1}\sum_{w=0}^{W-1}\left[I(h,w)-\hat I(h,w)\right]^2, \tag{27}
$$

其中 $I(h,w)$ 为点 $(h,w)$ 处的原始真实 RSS 值，$\hat I(h,w)$ 为该点预测 RSS 值。

- **RMSE：** MSE 的平方根：

$$
\mathrm{RMSE}=\sqrt{\mathrm{MSE}}. \tag{28}
$$

- **NMSE：** 归一化 MSE：

$$
\mathrm{NMSE}=\frac{\sum_{h=0}^{H-1}\sum_{w=0}^{W-1}\left[I(h,w)-\hat I(h,w)\right]^2}{\sum_{h=0}^{H-1}\sum_{w=0}^{W-1}I(h,w)^2}. \tag{29}
$$

- **PSNR：** 估计最大 RSS 与 RMSE 之比，通常用分贝对数表示：

$$
\mathrm{PSNR}=20\cdot\log_{10}\left(\frac{\mathrm{MAX}_I}{\mathrm{RMSE}}\right), \tag{30}
$$

其中 $\mathrm{MAX}_I$ 为无线电地图上点的最大 RSS 值。

由上定义可见，MSE、RMSE、NMSE 越小或 PSNR 越大，说明构建的无线电地图质量越高。

### B. 仿真结果

**案例研究。** 案例研究中有 $k=50$ 个传感器随机分布在地图上（采样率 0.08%）。图 10 给出不同算法构建的无线电地图：可见 WiFi-Diffusion 构建的地图非常接近真值（真实无线电地图），且明显比 6 种基线算法都准确得多。

**更多仿真。** 表 III 给出不同 $k$（样本数）下 WiFi-Diffusion 与基线的仿真结果比较。对每个 $k$ 用 100 张无线电地图评估，报告指标（MSE、RMSE、NMSE、PSNR）为这 100 张图的平均值。可见 WiFi-Diffusion 在从 10 到 200 的每个 $k$ 上都优于全部基线；且在超低采样率下，WiFi-Diffusion 的 MSE 可比基线最多低 10 倍（即至多为其十分之一）。例如：

- **WiFi-Diffusion vs RBF：** $k=25$ 时 WiFi-Diffusion 的 MSE 为 0.0027，比 RBF 的 0.0429 低 15 倍以上。
- **WiFi-Diffusion vs 样条：** $k=25$ 时 MSE 为 0.0027，比样条的 0.0948 低 35 倍以上。
- **WiFi-Diffusion vs 普通克里金：** $k=100$ 时 MSE 为 0.0008，比普通克里金的 0.0126 低 15 倍以上。
- **WiFi-Diffusion vs ResNet：** $k=100$ 时 MSE 为 0.0008，比 ResNet 的 0.0084 低 10 倍以上。
- **WiFi-Diffusion vs RadioUnet：** $k=25$ 时 MSE 为 0.0027，比 RadioUnet 的 0.0450 低 15 倍以上。
- **WiFi-Diffusion vs SkipResidualAutoencoder：** $k=25$ 时 MSE 为 0.0027，比 SkipResidualAutoencoder 的 0.0239 低 10 倍以上。

此外，构建相当质量（MSE 相近）的无线电地图时，WiFi-Diffusion 所需样本数至多只需各基线的五分之一。例如：

- **WiFi-Diffusion vs RBF：** 构建 MSE 不超过 0.0080 的地图，WiFi-Diffusion 需 10 个样本，RBF 需 200 个以上。
- **WiFi-Diffusion vs 样条：** 同样目标下 WiFi-Diffusion 需 10 个样本，样条需 200 个以上。
- **WiFi-Diffusion vs 普通克里金：** 同样目标下 WiFi-Diffusion 需 10 个样本，普通克里金需 200 个以上。
- **WiFi-Diffusion vs ResNet：** 同样目标下 WiFi-Diffusion 需 10 个样本，ResNet 需 150 个。
- **WiFi-Diffusion vs RadioUnet：** 同样目标下 WiFi-Diffusion 需 10 个样本，RadioUnet 需 100 个。
- **WiFi-Diffusion vs SkipResidualAutoencoder：** 同样目标下 WiFi-Diffusion 需 10 个样本，SkipResidualAutoencoder 需 50 个。

图 11 给出不同 $k$ 下 WiFi-Diffusion 与三种深度学习基线的仿真曲线。可见当 $k\ge50$ 时 WiFi-Diffusion 的 MSE 接近 0，意味着它在低于 0.1% 的采样率下即可生成细粒度、高质量无线电地图；相比之下 ResNet 的 MSE 对任意 $k$ 都显著大于 0，RadioUnet 与 SkipResidualAutoencoder 的 MSE 在 $k\ge150$ 时才接近 0、在 $k\le100$ 时仍远大于 0。因此三种基线都无法在低于 0.1% 的采样率下生成细粒度、高质量无线电地图；对 RMSE、NMSE 与 PSNR 也可得出类似结论。

**表 III　不同无线电样本数下 WiFi-Diffusion 与基线算法的仿真结果比较**

| 样本数 $k$ | 指标 | RBF | 样条 | 普通克里金 | ResNet | RadioUnet | Autoencoder | WiFi-Diffusion |
|---|---|---|---|---|---|---|---|---|
| 10 | MSE↓ | 0.0535 | 0.1522 | 0.0144 | 0.0142 | 0.1005 | 0.0646 | **0.0079** |
| 10 | RMSE↓ | 0.2314 | 0.3901 | 0.1201 | 0.1192 | 0.3171 | 0.2542 | **0.0892** |
| 10 | NMSE↓ | 0.2012 | 0.5646 | 0.0530 | 0.0542 | 0.3696 | 0.2367 | **0.0293** |
| 10 | PSNR↑ | 12.70 | 8.175 | 18.40 | 18.46 | 9.975 | 11.89 | **20.98** |
| 25 | MSE↓ | 0.0429 | 0.0948 | 0.0108 | 0.0104 | 0.0450 | 0.0239 | **0.0027** |
| 25 | RMSE↓ | 0.2073 | 0.3079 | 0.1043 | 0.1020 | 0.2122 | 0.1546 | **0.0527** |
| 25 | NMSE↓ | 0.1556 | 0.3450 | 0.0402 | 0.0389 | 0.1649 | 0.0906 | **0.0106** |
| 25 | PSNR↑ | 13.66 | 10.23 | 19.62 | 19.81 | 13.46 | 16.21 | **25.56** |
| 50 | MSE↓ | 0.0361 | 0.0627 | 0.0101 | 0.0092 | 0.0159 | 0.0071 | **0.0013** |
| 50 | RMSE↓ | 0.1901 | 0.2505 | 0.1008 | 0.0959 | 0.1262 | 0.0843 | **0.0365** |
| 50 | NMSE↓ | 0.1299 | 0.2340 | 0.0385 | 0.0336 | 0.0590 | 0.0259 | **0.0049** |
| 50 | PSNR↑ | 14.41 | 12.02 | 19.92 | 20.36 | 17.97 | 21.47 | **28.73** |
| 100 | MSE↓ | 0.0377 | 0.0405 | 0.0126 | 0.0084 | 0.0029 | 0.0021 | **0.0008** |
| 100 | RMSE↓ | 0.1944 | 0.2013 | 0.1126 | 0.0921 | 0.0541 | 0.0468 | **0.0287** |
| 100 | NMSE↓ | 0.1406 | 0.1513 | 0.0465 | 0.0311 | 0.0110 | 0.0080 | **0.0029** |
| 100 | PSNR↑ | 14.22 | 13.92 | 18.96 | 20.70 | 25.32 | 26.58 | **30.81** |
| 150 | MSE↓ | 0.0330 | 0.0313 | 0.0194 | 0.0080 | 0.0013 | 0.0016 | **0.0007** |
| 150 | RMSE↓ | 0.1817 | 0.1771 | 0.1393 | 0.0895 | 0.0370 | 0.0404 | **0.0265** |
| 150 | NMSE↓ | 0.1199 | 0.1144 | 0.0716 | 0.0297 | 0.0048 | 0.0061 | **0.0025** |
| 150 | PSNR↑ | 14.81 | 15.03 | 17.12 | 20.96 | 28.61 | 27.86 | **31.52** |
| 200 | MSE↓ | 0.0312 | 0.0271 | 0.0283 | 0.0085 | 0.0011 | 0.0013 | **0.0006** |
| 200 | RMSE↓ | 0.1767 | 0.1648 | 0.1682 | 0.0922 | 0.0333 | 0.0369 | **0.0252** |
| 200 | NMSE↓ | 0.1189 | 0.1003 | 0.1036 | 0.0316 | 0.0040 | 0.0050 | **0.0023** |
| 200 | PSNR↑ | 15.05 | 15.65 | 15.48 | 20.70 | 29.52 | 28.65 | **31.95** |

**消融研究。** 表 IV 给出消融研究结果，清楚表明增强模块与选举模块的必要性：去掉任一模块，WiFi-Diffusion 性能都显著下降，凸显它们在整体功能中的关键作用。

**表 IV　评估 WiFi-Diffusion 各模块的消融研究**

| 设置：增强模块 | 设置：选举模块 | MSE（$k=10$） | MSE（$k=25$） | MSE（$k=50$） | MSE（$k=100$） | MSE（$k=150$） | MSE（$k=200$） |
|---|---|---|---|---|---|---|---|
| × | × | 0.03170 | 0.01980 | 0.00912 | 0.00226 | 0.00125 | 0.00111 |
| ✓ | × | 0.01246 | 0.00392 | 0.00199 | 0.00139 | 0.00125 | 0.00128 |
| × | ✓ | 0.02359 | 0.01198 | 0.00611 | 0.00200 | 0.00089 | 0.00065 |
| ✓ | ✓ | **0.00796** | **0.00277** | **0.00133** | **0.00082** | **0.00070** | **0.00063** |

下面用仿真进一步验证选举模块的有效性。考虑到推理时真实无线电地图（待预测地图）未知，与我们所提选举模块设计不同，一种直观设计是选出预测 RSS 值最接近传感器采集无线电样本的候选地图。具体地，可计算如下 $\mathrm{MSE}_r$：

$$
\mathrm{MSE}_r=\frac{1}{k}\sum_{i=1}^{k}\left[I_i-\hat I_i\right]^2, \tag{31}
$$

其中 $I_i$ 表示传感器 $i$ 的实测 RSS 值，$\hat I_i$ 表示生成地图中相应位置的预测 RSS 值；把最小化 $\mathrm{MSE}_r$ 的候选认定为最优地图。

图 12 展示一个有代表性的仿真实例：生成模块产生的 64 张细粒度无线电地图候选集及其相应 MSE 值，显示出显著的质量差异——最佳地图 MSE 为 0.0013，最差为 0.0040，说明 WiFi-Diffusion 中选举模块是必要的。我们所提选举设计成功识别出 MSE 最低（0.0013）的最优地图（红色地图），而仅基于最小化 $\mathrm{MSE}_r$ 的简单选举设计选出了较差候选（蓝色地图，MSE 为 0.0021）。此外，我们在不同样本数 $k$ 下仿真更多实例，结果汇总于表 V：一致表明我们所提选举模块设计优于基于 $\mathrm{MSE}_r$ 的直观基线，尤其在 $k=10$、$k=25$、$k=100$ 时。总体而言，图 12 与表 V 既证明了在 WiFi-Diffusion 中纳入选举模块的必要性，也证明了我们所提设计优于替代方案。

**表 V　验证 WiFi-Diffusion 选举模块有效性的仿真结果**

| 设置 | MSE（$k=10$） | MSE（$k=25$） | MSE（$k=50$） | MSE（$k=100$） | MSE（$k=150$） | MSE（$k=200$） |
|---|---|---|---|---|---|---|
| 无选举模块 | 0.01246 | 0.00392 | 0.00199 | 0.00139 | 0.00125 | 0.00128 |
| 使用最小化 (31) 的选举模块 | 0.00970 | 0.00292 | 0.00138 | 0.00093 | 0.00073 | 0.00068 |
| 使用 (26) 所定义的自研选举模块 | **0.00796** | **0.00277** | **0.00133** | **0.00082** | **0.00070** | **0.00063** |

选举模块通过以无线电传播规律为指引，从生成模块产生的候选地图集中选出高质量地图，从而提升 WiFi-Diffusion 性能。WiFi-Diffusion 的三模块机制源自扩散模型等生成式 AI 方法在产生多样、创新解方面的固有优势：WiFi-Diffusion 有效利用了这种生成优势，而 RadioUnet、SkipResidualAutoencoder 与 ResNet 等传统判别模型虽提供稳定预测，但其本质限制了产生多样输出变化的能力；因此很难给它们加上类似的选举模块来提升性能。

**鲁棒性研究。** 我们强调，所研究的无线电地图估计问题并不依赖发射机细节（如数量或位置）的先验知识。这里我们关心 WiFi-Diffusion 在不同发射机配置下的性能。图 13 给出不同发射机数场景下 WiFi-Diffusion 与三种深度学习基线的无线电地图：图 13a 为单发射机结果、图 13b 为双发射机结果（均 $k=50$）。结果表明 WiFi-Diffusion 无论发射机数如何都能稳定生成细粒度、高质量无线电地图，并显著优于基线。

此外，图 14 评估当部分发射机位于地图之外时 WiFi-Diffusion 的鲁棒性：图 14a 中地图内无发射机、地图外有两个，图 14b 中地图内有两个、地图外有一个（均 $k=50$）。图 14 表明即使部分发射机位于地图之外，WiFi-Diffusion 仍能构建细粒度、高质量无线电地图，显著优于基线。

我们还评估了一个极端挑战场景：采样率接近 0，即 $k=3$。结果如图 15 所示：尽管用仅 3 个已知样本预测 $256\times256$ 网格的 RSS 值极为困难，WiFi-Diffusion 仍能产生粗略的无线电地图；相比之下，六种基线算法甚至无法生成无线电地图的基本表示。该比较凸显了 WiFi-Diffusion 在估计无线电地图时的卓越鲁棒性，尤其在采样率接近 0 的极端挑战场景下。

**模型规模与训练成本。** 由于其固有复杂性，扩散模型通常比传统深度学习架构（如 UNet）需要更多参数与更长计算时间。如表 VI 所示（比较各算法的模型规模（参数量）、推断时间与训练时间），WiFi-Diffusion 比基线方法大得多也慢得多。一个关键问题随之而来：

> 若把基线方法的参数规模增至与 WiFi-Diffusion 相当或更大，它们是否会取得相当甚至超越 WiFi-Diffusion 的性能？

我们通过全面评估从经验上回答该问题：对三种基线模型（RadioUnet、Autoencoder、ResNet）分别通过增加深度（层数）、扩大宽度（通道维度）进行增强，并训练到参数量与计算时间相当或超过 WiFi-Diffusion 的水平；所得改进变体分别记为 RadioUnet+、Autoencoder+ 与 ResNet+。表 VII 汇总了所有评估算法的模型规模（参数量）、推断时间与训练时间，可见增强基线（RadioUnet+、Autoencoder+、ResNet+）的模型规模更大、训练时间更长。

**表 VI　不同算法的参数量、推断时间与训练时间**（m：百万；s：秒；h：小时）

| 算法 | RadioUnet | Autoencoder | ResNet | WiFi-Diffusion |
|---|---|---|---|---|
| 参数量 | 13 m | 4 m | 89 m | 122 m |
| 推断时间 | 0.06 s | 0.06 s | 0.07 s | 7.82 s |
| 训练时间 | 19 h | 7 h | 11 h | 44 h |

**表 VII　不同算法的参数量、推断时间、训练时间与 MSE 结果**（m：百万；s：秒；h：小时）

| 方法 | 参数量 | 推断时间 | MSE（$k=25$） | MSE（$k=50$） | 训练时间 |
|---|---|---|---|---|---|
| RadioUnet | 13,274,031（13 m） | 0.06 s | 0.0450 | 0.0159 | 19 h |
| RadioUnet+ | 144,249,256（144 m） | 0.44 s | 0.0153 | 0.0032 | 48 h |
| Autoencoder | 3,553,945（4 m） | 0.06 s | 0.0239 | 0.0071 | 7 h |
| Autoencoder+ | 127,491,225（127 m） | 0.11 s | 0.0123 | 0.0042 | 55 h |
| ResNet | 88,981,248（89 m） | 0.07 s | 0.0104 | 0.0092 | 11 h |
| ResNet+ | 161,984,512（162 m） | 0.11 s | 0.0101 | 0.0091 | 45 h |
| WiFi-Diffusion | 60,823,169 × 2（122 m） | 7.82 s | **0.0027** | **0.0013** | 44 h |

图 16 比较不同算法的推断时间，并给出 WiFi-Diffusion 与基线方法 MSE 之比；表 VII 也给出各算法的推断时间与 MSE。由图 16 与表 VII 可见：（i）WiFi-Diffusion 构建的无线电地图显著优于任何增强基线（RadioUnet+、Autoencoder+、ResNet+）——$k=25$ 时其 MSE 比任何增强基线低 70%，$k=50$ 时低 60%；（ii）尽管 WiFi-Diffusion 的推断时间长于任何增强基线，但其绝对推断时间仍然实用可接受，从不超过 10 秒，可支持实时无线电地图生成；此外值得强调，人为增加任何增强基线方法的推断时间并不会改善其构建地图的质量。

### C. 小结

总之，本节评估表明：

- WiFi-Diffusion 能在采样率低于 0.1% 时生成细粒度、高质量无线电地图。
- 在相同超低采样率下，WiFi-Diffusion 精度更优，其无线电地图 MSE 比基线方法低一个数量级。
- WiFi-Diffusion 在细粒度无线电地图生成中只需基线方法 20% 的采样率即可取得相当精度（MSE）。
- 增强、生成与选举三个模块对 WiFi-Diffusion 在无线电地图估计上的高性能都不可或缺。
- 即使把基线方法放大到与 WiFi-Diffusion 相当或更大的模型规模与训练成本，WiFi-Diffusion 仍保持显著更优的精度，其无线电地图 MSE 比基线方法低 60% 以上。

## VI. WiFi-Diffusion：潜在应用

WiFi-Diffusion 生成细粒度、高质量无线电地图，给出 WiFi 频谱下某地理区域每一点处感兴趣通信参数（如 RSS），可改善许多基于 WiFi 的无线网络性能，包括无人机（unmanned aerial vehicle，UAV）网络、工业物联网（industrial Internet of Things，IoT）与车联网（Internet of Vehicles，IoV）。

**UAV 网络。** 它作为关键通信基础设施，使多架无人机之间实现无线连接与信息交换 [32]。配备机载传感器的现代 UAV 可采集并传输无线电样本；边缘服务器可借助 WiFi-Diffusion 利用这些采集样本构建并实时向各 UAV 分发细粒度、准确的无线电地图。这些地图为 UAV 提供其指定飞行轨迹上各频段 RSS 值的预测能力，从而使每架 UAV 能根据时空变化自适应调整传输参数、动态优化频谱接入策略；此时 WiFi-Diffusion 可用于改善 UAV 沿飞行轨迹数据传输的吞吐量等关键性能指标。

**工业 IoT。** 它是工业环境中互连的智能设备、传感器与机械网络，用于采集、分析并处理数据以优化制造、物流与其他工业运行 [33]。WiFi-Diffusion 能生成细粒度、高质量无线电地图，提供工业环境内跨空间、时间与频率域的频谱利用分析；这些洞见有助于动态优化智能设备、传感器与机械的部署与频谱接入策略。实施 WiFi-Diffusion 可系统性提升关键工业通信指标（尤其时延与可靠性），确保任务关键工业运行的及时、鲁棒数据传输。

**IoV。** 它通过车联万物（Vehicle-to-Everything，V2X）通信连接车辆、基础设施与用户，构成智能生态，实现实时安全告警、交通优化与自动驾驶 [34]。对开放无线协议的依赖使该系统易受有意干扰攻击与无意干扰影响；为缓解这些脆弱性，WiFi-Diffusion 生成的细粒度、高质量无线电地图可提供关键防御机制：提供动态频谱感知能力，并支持跨时间、空间与频率域预测干扰模式。这些地图赋予 IoV 抗干扰能力，使其能自适应重构通信策略，例如主动切换到未受污染频率。

## VII. 结论

无线电地图给出特定频段内某地理区域各点的感兴趣通信参数（如接收信号强度），可用于提升频谱利用效率，对 WiFi 频谱尤为关键。细粒度无线电地图估计问题利用稀疏分布传感器的样本推断高分辨率无线电地图，其独特挑战在于超低采样率——无线电样本数显著少于无线电地图估计所需的高分辨率。

本文设计了 WiFi-Diffusion——一种利用扩散模型进行细粒度 WiFi 无线电地图估计的新型生成框架，由三个模块组成：1）增强模块，利用障碍物布局与无线电传播规律等先验信息优化扩散模型；2）生成模块，用扩散模型生成细粒度无线电地图候选集；3）选举模块，以数学无线电传播模型为指引从候选集中选出最佳细粒度无线电地图。大量仿真表明：1）WiFi-Diffusion 在采样率极低（低于 0.1%）时即可构建高质量、细粒度无线电地图；2）在相同采样率下，其无线电地图可比 SOTA 好一个数量级（10 倍）；3）WiFi-Diffusion 只需 SOTA 五分之一采样率即可生成相当质量的无线电地图。

## 基金与作者单位说明

基金：本工作部分受国家自然科学基金 Grant 62401025 资助；部分受广东省基础与应用基础研究基金——广东省深圳市联合基金青年基金项目 Grant 2023A1515110120 资助。

作者单位：Zhiyuan Liu 就职于北京大学深圳研究生院电子与计算机工程学院（深圳 518055，邮箱 liuzhiyuan@stu.pku.edu.cn）；Shuhang Zhang 就职于鹏城实验室（深圳 518055，邮箱 zhangshh01@pcl.ac.cn）；Qingyu Liu 就职于北京大学深圳研究生院电子与计算机工程学院及鹏城实验室（邮箱 qy.liu@pku.edu.cn）；Hongliang Zhang 就职于北京大学电子学院（北京 100871，邮箱 hongliang.zhang@pku.edu.cn）；Lingyang Song 就职于北京大学电子学院、北京大学深圳研究生院电子与计算机工程学院及鹏城实验室（邮箱 lingyang.song@pku.edu.cn）。

## 图注与表注

**图 1：** WiFi-Diffusion——基于扩散模型的超低采样率细粒度无线电地图估计框架（含前向/反向过程、条件、候选无线电地图集合与选举、"跳出框框思考"、建筑布局与采集无线电样本作为条件）。

**图 2：** 无线电地图估计问题示意：（a）已知无线电样本；（b）建筑布局；（c）无线电地图。

**图 3：** WiFi-Diffusion 架构总览（建筑布局与采集无线电样本作为输入，经增强模块 AttUnet、生成模块 DDIM 与选举模块，得到最佳无线电地图）。

**图 4：** WiFi-Diffusion 增强模块中所用 AttUnet 的架构（含 DownBlock、MidBlock、UpAttBlock、ResBlock、Self-Attention、GroupNorm、SiLU、ConvTrans 与跳跃连接）。

**图 5：** 增强模块输出点的种类：（a）$\mathbf S_k$；（b）地图 $\mathbf x_a$（含原始点、关键点、随机点）；（c）$\mathbf{ES}_k$。

**图 6：** WiFi-Diffusion 生成模块的训练与推断：（a）基于 DDPM 的训练；（b）基于 DDIM 的推断。

**图 7：** WiFi-Diffusion 选举模块示意。

**图 8：** 选举模块用于学习修正因子 $\mathrm{res}$ 的信息：（a）$\mathbf x_a$；（b）$\mathbf x_{z_i}$；（c）高功率图；（d）LoG。

**图 9：** 示例说明 WiFi-Diffusion 选举模块如何以无线电传播规律为指引选出高质量无线电地图（含真值地图、两张估计地图、以三个发射机为中心圆形区域内不同地图 RSS 对比、沿射线 RSS 变化等子图）。

**图 10：** 案例研究（$k=50$）中不同算法构建的无线电地图（Ground Truth、WiFi-Diffusion、RadioUnet、SkipResidualAutoencoder、ResNet、rbf、splines、ordinary kriging）。

**图 11：** 不同采样率下 WiFi-Diffusion 与深度学习基线的结果比较（MSE、RMSE、NMSE、PSNR 随采样率变化）。

**图 12：** 生成模块在 $k=25$ 的一个仿真实例中产生的 64 张无线电地图候选集及其 MSE 值（红色地图为选举模块识别的最佳地图；蓝色地图为按式 (31) 中 $\mathrm{MSE}_r$ 最小选出的地图，明显更差）。

**图 13：** 不同发射机数下不同算法构建的无线电地图（$k=50$）：（a）仅 1 个发射机；（b）2 个发射机。

**图 14：** 部分发射机位于地图之外时不同算法构建的无线电地图（$k=50$）：（a）地图内无发射机、地图外 2 个；（b）地图内 2 个、地图外 1 个。

**图 15：** 仅有 3 个采集无线电样本时不同算法构建的无线电地图。

**图 16：** 不同算法的 MSE 与推断时间仿真结果：（a）$k=25$；（b）$k=50$（横轴为推断时间对数刻度，纵轴为 WiFi-Diffusion 与基线的 MSE 比）。

**表 I：** 关键记号汇总（符号与定义，逐格见正文表 I）。

**表 II：** AttUnet 参数（层编号、输入通道、输出通道、输入分辨率、输出分辨率与是否带注意力，逐格见正文表 II）。

**表 III：** 不同无线电样本数下 WiFi-Diffusion 与基线算法的仿真结果比较（$k\in\{10,25,50,100,150,200\}$，MSE/RMSE/NMSE/PSNR，逐格见正文表 III）。

**表 IV：** 评估 WiFi-Diffusion 各模块的消融研究（增强模块 ×/✓ 与选举模块 ×/✓ 的四种组合，逐格见正文表 IV）。

**表 V：** 验证 WiFi-Diffusion 选举模块有效性的仿真结果（无选举模块、最小化 (31) 的选举模块、式 (26) 的自研选举模块，逐格见正文表 V）。

**表 VI：** 不同算法的参数量、推断时间与训练时间（RadioUnet、Autoencoder、ResNet、WiFi-Diffusion，逐格见正文表 VI）。

**表 VII：** 不同算法的参数量、推断时间、训练时间与 MSE 结果（含增强基线 RadioUnet+/Autoencoder+/ResNet+，逐格见正文表 VII）。

> **原文说明：** 原文无附录；正文末为结论，随后为参考文献。文内脚注 ¹ 给出数据集链接 https://github.com/BRATLab-UCD/Radiomap-Data ；脚注 ² 说明表 VI 中 WiFi-Diffusion 参数量近 122 百万，其中增强模块与生成模块各近 61 百万。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v3 第 15–16 页转录；未逐条核对 DOI）。

[1] D. Romero and S.-J. Kim, "Radio map estimation: A data-driven approach to spectrum cartography," IEEE Signal Processing Magazine, vol. 39, no. 6, pp. 53–72, 2022.

[2] X.-L. Huang, Y. Gao, X.-W. Tang, and S.-B. Wang, "Spectrum mapping in large-scale cognitive radio networks with historical spectrum decision results learning," IEEE Access, vol. 6, pp. 21 350–21 358, 2018.

[3] X. Li, S. Zhang, H. Li, X. Li, L. Xu, H. Xu, H. Mei, G. Zhu, N. Qi, and M. Xiao, "RadioGAT: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks," IEEE Transactions on Wireless Communications, vol. 23, no. 11, pp. 1–1, 2024.

[4] V. Rakovic, D. Denkovski, V. Atanasovski, and L. Gavrilovska, "Radio resource management based on radio environmental maps: Case of smart-WiFi," in Proc. of IEEE ICT, Thessaloniki, Greece, May 16-18, 2016.

[5] Cisco, "Cisco visual networking index: global mobile data traffic forecast update, 2017–2022," 2019.

[6] K. Rizk, J.-F. Wagen, and F. Gardiol, "Two-dimensional ray-tracing modeling for propagation prediction in microcellular environments," IEEE Transactions on Vehicular Technology, vol. 46, no. 2, pp. 508–518, 1997.

[7] R. Wahl, G. Wölfle, P. Wildbolz, and F. Landstorfer, "Dominant path prediction model for urban scenarios," in Proc. of IST Mobile and Wireless Communications, Dresden, Germany, June 19-23, 2005.

[8] J. A. Bazerque and G. B. Giannakis, "Distributed spectrum sensing for cognitive radio networks by exploiting sparsity," IEEE Transactions on Signal Processing, vol. 58, no. 3, pp. 1847–1862, 2010.

[9] T. Zugno, M. Drago, M. Giordani, M. Polese, and M. Zorzi, "Toward standardization of millimeter-wave vehicle-to-vehicle networks: Open challenges and performance evaluation," IEEE Communications Magazine, vol. 58, no. 9, pp. 79–85, 2020.

[10] C. M. Bishop, Neural Networks for Pattern Recognition. New York, NY, USA: Oxford University Press, Inc., 1995.

[11] J. A. Bazerque, G. Mateos, and G. B. Giannakis, "Group-lasso on splines for spectrum cartography," IEEE Transactions on Signal Processing, vol. 59, no. 10, pp. 4648–4663, 2011.

[12] G. Boccolini, G. Hernández-Peñaloza, and B. Beferull-Lozano, "Wireless sensor network for spectrum cartography based on kriging interpolation," in Proc. of IEEE PIMRC, Sydney, Australia, September 09-12, 2012.

[13] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Transactions on Wireless Communications, vol. 20, no. 6, pp. 4001–4015, 2021.

[14] Y. Teganya and D. Romero, "Deep completion autoencoders for radio map estimation," IEEE Transactions on Wireless Communications, vol. 21, no. 3, pp. 1710–1724, 2022.

[15] W. Locke, N. Lokhmachev, Y. Huang, and X. Li, "Radio map estimation with deep dual path autoencoders and skip connection learning," in Proc. of IEEE PIMRC, Toronto, Canada, September 05-08, 2023.

[16] K. He, X. Zhang, S. Ren, and J. Sun, "Deep residual learning for image recognition," in Proc. of CVPR, Las Vegas, USA, June 27-30, 2016.

[17] M. Ayadi, A. Ben Zineb, and S. Tabbane, "A UHF path loss model using learning machine for heterogeneous networks," IEEE Transactions on Antennas and Propagation, vol. 65, no. 7, pp. 3675–3683, 2017.

[18] A. Creswell, T. White, V. Dumoulin, K. Arulkumaran, B. Sengupta, and A. A. Bharath, "Generative adversarial networks: An overview," IEEE Signal Processing Magazine, vol. 35, no. 1, pp. 53–65, 2018.

[19] J. Sohl-Dickstein, E. A. Weiss, N. Maheswaranathan, and S. Ganguli, "Deep unsupervised learning using nonequilibrium thermodynamics," in Proc. of ICML, Lille, France, July 06-11, 2015.

[20] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Proc. of NeurIPS, virtual only conference, December 06-12, 2020.

[21] P. Dhariwal and A. Nichol, "Diffusion models beat GANs on image synthesis," in Proc. of NeurIPS, virtual only conference, December 06-14, 2021.

[22] J. Austin, D. D. Johnson, J. Ho, D. Tarlow, and R. van den Berg, "Structured denoising diffusion models in discrete state-spaces," in Proc. of NeurIPS, virtual only conference, December 06-14, 2021.

[23] J. S. Lee, J. Kim, and P. M. Kim, "Score-based generative modeling for de novo protein design," Nature Computational Science, vol. 3, no. 5, pp. 382–392, 2023.

[24] J. Song, C. Meng, and S. Ermon, "Denoising diffusion implicit models," in Proc. of ICLR, virtual only conference, May 03-07, 2021.

[25] H. Friis, "A note on a simple transmission formula," Proceedings of the IRE, vol. 34, no. 5, pp. 254–256, 1946.

[26] L. Jelinek, M. Capek, E. Clavelier, K. F. Warnick, and F. Broyde, "A generalized Friis transmission formula for multiport antenna arrays," in Proc. of IEEE AP-S/INC-USNC-URSI, Firenze, Italy, July 14-19, 2024.

[27] S. Zhang, T. Yu, B. Choi, F. Ouyang, and Z. Ding, "Radiomap inpainting for restricted areas based on propagation priority and depth map," IEEE Transactions on Wireless Communications, vol. 23, no. 8, pp. 9330–9344, 2024.

[28] S. Zhang, B. Choi, F. Ouyang, and Z. Ding, "Physics-inspired machine learning for radiomap estimation: Integration of radio propagation models and artificial intelligence," IEEE Communications Magazine, vol. 62, no. 8, pp. 155–161, 2024.

[29] Altair, Altair WinProp 2021 Documentation, Altair, Troy, Michigan, USA, 2021, Accessed: 2024-12-02. [Online]. Available: https://2021.help.altair.com/2021/winprop/index.htm

[30] OpenStreetMap Contributor Terms, "OpenStreetMap," https://www.openstreetmap.org/, 2024.

[31] A. Horé and D. Ziou, "Image quality metrics: Psnr vs. ssim," in Proc. of IEEE ICPR, Istanbul, Turkey, August 23-26, 2010.

[32] Y. Zeng, S. Chen, Y. Cui, J. Yang, and Y. Fu, "Joint resource allocation and trajectory optimization in UAV-enabled wirelessly powered MEC for large area," IEEE Internet of Things Journal, vol. 10, no. 17, pp. 15 705–15 722, 2023.

[33] M. Tanveer, A. Badshah, A. U. Khan, H. Alasmary, and S. A. Chaudhry, "CMAF-IIoT: Chaotic map-based authentication framework for industrial internet of things," Internet of Things, vol. 23, p. 100902, 2023.

[34] G. Yan, K. Liu, C. Liu, and J. Zhang, "Edge intelligence for internet of vehicles: A survey," IEEE Transactions on Consumer Electronics, vol. 70, no. 2, pp. 4858–4877, 2024.

**本页范围与校对状态：** 本页为 arXiv:2503.12004v3 的全文中文译稿：摘要、正文第 I–VII 节（含 IV-A/B/C/D、V-A/B/C 全部小节）、结论、基金与作者单位说明、表 I–VII 逐格、图 1–16 图注与参考文献 [1]–[34]。公式编号沿用原文 (1)–(31)。表 II、表 III、表 IV、表 V 已用 PDF 第 5、11、12 页渲染图逐格核对（含表 III 的 6 个 $k$ × 7 方法 × 4 指标、表 IV/V 的六列 MSE）；表 VI、表 VII 与表 I 按原文文本层录入。原文有 2 条脚注（数据集链接、WiFi-Diffusion 参数量构成）已译入说明。**原文无附录**，故未设附录节。图内曲线与图像未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误（表 III 中部分基线指标随 $k$ 增大反而不单调，如普通克里金 MSE 从 $k=100$ 的 0.0126 升到 $k=200$ 的 0.0283，属原文数据本身，照录）。骨架"版本"行原为 2026-07-12（收录日），已按 BRIEF2 结构改为 arXiv:2503.12004v3（2025-06-12，依据 PDF 页眉 "arXiv:2503.12004v3 [eess.SP] 12 Jun 2025"）；作者为 Zhiyuan Liu、Shuhang Zhang、Qingyu Liu、Hongliang Zhang、Lingyang Song；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
