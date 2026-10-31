---
layout: page
title: "PHOENIX：基于物理表征与扩散后验推断的无线场景重建｜中文全文译文"
permalink: /papers/translations/2026-10-20-wireless-scene-reconstruction-2610-22120/
math: true
toc: true
---

{% raw %}

> **说明：** 本页为较早的译文版本，已被更新、更完整的版本取代，请阅读 [最新全文译文](/papers/translations/2026-10-20-wireless-scene-reconstruction-diffusion-2610-22120/)。

[← 返回论文库](/papers/) · [arXiv 原文](https://arxiv.org/abs/2610.22120)

# 利用无处不在的无线信号，通过物理约束表征上的扩散后验推断重建场景

**原题：** Scene Reconstruction Using Ubiquitous Wireless Signals via Diffusion Posterior Inference over Physics-Grounded Representations  
**作者：** Vahid Yazdnian、Yasaman Ghasempour（普林斯顿大学）  
**版本：** arXiv:2610.22120v1，2026 年 10 月 15 日，共 24 页。  
**译文状态：** 正文 1–5 节、附录 A–N 与全部参考文献均已译出（其中附录 C–N、F.1／F.2 证明与 29 条英文书目于 2026-10-30 补入）。仍为对照原文抽取文本的补译稿，逐句人工终校与图表数值复核尚未进行。**本稿不声明为已通过 QA 的完整全文译文**。

## 摘要

了解物理世界的空间布局对许多应用至关重要，但通常依赖的传感器（如相机和激光雷达）可能在黑暗、恶劣天气或墙体遮挡下失效。无线信号没有完全相同的局限：基站和用户之间的每条无线链路都会受到其经过、反射或被阻挡的建筑物影响，从而在通信两端测得的无线信道中留下周围场景的信息。

不过，从信道测量反推环境是一个严重的病态问题：单次测量只记录与其传播路径发生相互作用的结构，而这些观测即使在已覆盖区域内，也往往可以由多个合理场景解释。为此，本文将无线场景重建表述为后验推断，并提出一个包含两个互补阶段的层次化框架。首先，预训练的、符合传播物理规律的无线基础模型将每次信道测量转化为塑造该观测的场景结构表征。随后，扩散模型联合整合多次观测的表征，对建筑占用状态的后验分布进行建模与采样，最后根据样本共识输出重建结果。实验表明，该框架可以仅根据无线信道测量准确恢复建筑轮廓。性能关键取决于两项设计：物理约束表征显露与场景相关的信息，联合后验推断则能一致地整合互补观测。

## 1. 引言

每条无线链路实际上都在无意中测量其周围环境。基站发射的信号到达接收机之前可能被建筑物阻挡、从其他建筑物反射或在拐角发生绕射。因此，环境的形状实际上被“写入”了测得的无线信道。若能反过来解读这一信息，现有无线通信基础设施就有可能同时作为感知网络，在相机与激光雷达失效的暗处、恶劣天气或遮挡区域进行制图。灾害可能在短时间内改变街区布局，已部署无线网络提供的信道测量有望用于更新数字孪生，也可服务于无线网络优化与通感一体化。

利用波动测量恢复几何结构在声学中已有研究，例如根据回波和传播模型推断房间形状。射频场景重建则主要依赖专门雷达，通过几何推断、运动合成孔径、结构先验或学习型生成模型恢复占用网格和平面图。此类系统需要额外感知硬件，往往还要求在环境中移动。本文转而利用已部署通信基础设施自身产生的通信信号。

从原始无线信道恢复环境是本质上不适定的逆问题，不只是数据不足导致的偶然困难。一条信道观测只与传播路径作用到的结构有关，对其余结构的似然严格不变。在观测范围内，有限带宽与阵列孔径使传播时延、角度的分辨率有限；此外，结构对某条链路的作用只体现为反射、阻挡或者无影响。它随发射机、接收机位置改变，多个不同的场景可能对所有被观测链路发挥相同作用。因此单次测量对应的不是唯一场景，而是一族可能场景。

本文把待求对象定义为建筑占用布局的后验分布。观测能够确定哪些结构，后验就应在那些位置集中；观测无法约束的部分则保留不确定性。作者提出由物理约束基础模型与生成式后验解码器构成的双阶段框架：第一阶段学习环境如何影响电磁传播，并将每条链路编码为场景相关特征；第二阶段联合整合多个特征，并生成与全部测量一致的场景。最后对后验样本逐网格取共识。

作者在约 700 个完全未进入训练阶段的环境上评估，其中包括密集城市街区和稀疏建筑场景。与直接根据原始信道重建、或逐观测独立重建再融合的方案相比，物理表征与联合后验的组合性能最好。主要贡献包括不预设建筑数量和形状的概率问题建模、描述可恢复区域的理论分析、物理约束表征学习以及面向多视角观测的联合扩散重建。

## 2. 预备知识与问题建模

### 2.1 无线传播

基站信号经过环境决定的一组传播路径到达接收机。每条路径可以包含直接传播、镜面反射、边缘绕射或阻挡。对位于 $\mathbf p$ 的接收机，场景 $\mathbf s$ 所产生的传播路径集合记为 $\mathcal P(\mathbf s,\mathbf p)=\{(\alpha_\ell,\tau_\ell,\theta_\ell,\phi_\ell)\}_{\ell=1}^{L}$，分别记录路径复增益、时延和到达/离开方向。各参数取决于场景几何与传播属性。

宽带 MIMO 信道张量 $\mathbf H\in\mathbb C^{N_{\mathrm{tx}}\times N_{\mathrm{rx}}\times N_{\mathrm{sc}}}$ 的系数是所有路径贡献的叠加：

$$
H[t,r,f]=\sum_{\ell\in\mathcal P(\mathbf s,\mathbf p)}
\alpha_\ell a_r(\theta_\ell)a_t^*(\phi_\ell)e^{-j2\pi f\tau_\ell}.\tag{1}
$$

$a_t$ 和 $a_r$ 分别为发射、接收阵列响应。由此得到前向算子 $\mathbf H=\mathcal F(\mathbf s,\mathbf p)$。只有路径实际经过、发生反射或绕射、或者引起阻挡的结构会影响这次观测；作者称其所在区域为该观测的传播相关集合（propagation-relevant set），集合之外的结构不会改变对应信道。

### 2.2 逆问题

考虑一个基站与 $K$ 个用户之间的无线链路。第 $k$ 个用户位于 $\mathbf p_k$，贡献测量 $\mathbf H_k$，形成观测集合

$$
\mathcal O=\{(\mathbf H_k,\mathbf p_k)\}_{k=1}^{K}.
$$

令 $\mathcal A_k$ 表示第 $k$ 条链路的传播相关区域，所有观测共同约束的区域为 $\mathcal A=\bigcup_k\mathcal A_k$。将场景写为分辨率 $\Delta R$ 的二维二值占用网格 $\mathbf s\in\{0,1\}^{N\times N}$，其中 $s_i=1$ 表示单元格 $i$ 被建筑等物理结构占据。目标是利用 $\mathcal O$ 反求 $\mathbf s$，不对结构数量、形状、凸性或位置施加参数化假设。

逆问题的非唯一性有三个原因。第一，$\mathcal A$ 之外的任意结构改变对所有测量都没有影响，因此对应相同似然的场景数随未观测单元格数量指数增长。第二，即使位于 $\mathcal A$ 内，有限带宽和孔径也限制可分辨时延与角度，低于分辨率的不同几何布局可能无法区分。第三，建筑结构只通过对特定链路的反射、遮挡等作用进入信道；不同场景对全部链路可能具有相同的传播作用，这类歧义不是单靠提高硬件分辨率就能消除的。加入观测能扩大 $\mathcal A$，收缩可行场景集合，但不能保证得到唯一解。

### 2.3 概率表述

由于单一场景不一定能从数据中唯一识别，本文将解定义为场景后验

$$
p(\mathbf s\mid\mathcal O)\propto p(\mathcal O\mid\mathbf s)p(\mathbf s).
$$

观测似然只受 $\mathcal A$ 内的场景变化影响，将场景先验分解得到：

$$
p(\mathbf s\mid\mathcal O)=
\underbrace{p(\mathbf s_{\mathcal A}\mid\mathcal O)}_{\text{受观测约束}}
\underbrace{p(\mathbf s_{\mathcal A^c}\mid\mathbf s_{\mathcal A})}_{\text{由条件先验决定}}.\tag{2}
$$

逐网格边缘概率 $\pi_i=p(s_i=1\mid\mathcal O)$ 表示占用状态的不确定性。当 $i\in\mathcal A$ 时，增加观测可能令 $\pi_i$ 趋向 0 或 1；而在 $\mathcal A$ 之外，观测本身不会提供新的直接证据，概率仍受条件先验控制。确定性回归器必须对全部单元格输出一个结果，容易给没有数据约束的位置产生过度确定的预测；后验模型则可以表达这一差异。

由于 $p(\mathcal O\mid\mathbf s)$ 通过射线追踪等过程隐式定义而没有可用的闭式形式，作者使用物理一致的场景–测量样本 $(\mathbf s,\mathcal O)\sim\mathcal D$ 学习条件后验。

**图 1.** 基站与多个用户提供无线信道和用户位置；PHOENIX 将每次观测编码为场景相关特征；扩散解码器在这些特征条件下生成建筑布局样本；最终由样本共识输出重建的建筑轮廓。

## 3. 设计与方法

框架把两个任务分离：先学习环境怎样通过电磁传播塑造信道，再针对一组具体观测推断场景。第一阶段学习共同的传播规律；第二阶段将多个观测表征联合输入扩散模型。后者主要任务是综合证据生成合理场景，不必同时从头发现无线传播到环境几何的复杂映射。

### 3.1 物理约束表征学习

作者提出 PHOENIX（Physics-grounded Heterogeneous Observation Embedding for Neural Inference across wireless conteXts），这是学习跨无线传播情境物理信息的多模态基础模型。模型采用单流 Transformer，从信道、场景及位置的多模态关联中学习统一表示。

具体而言，输入 CSI 被转换为幅度和相位，再按天线对及相邻子载波划分为 token；场景高度图被分割成不重叠的空间块；接收机位置投影成一个位置 token。每个 token 还包含反映其物理来源的索引或空间坐标与模态嵌入。特殊的 PHYSC token 在非对称注意力掩码下聚合全部模态：它能注意其他模态 token，但不会成为这些 token 所使用的注意力键。这使其可以作为场景传播信息的集中表示。

为了让表征具有物理含义，作者设计两种互补的自监督目标。第一是**双向重建**：根据其余信道、位置和场景信息恢复被掩蔽的复数信道；反过来根据无线信道重建场景中被掩蔽的部分。特别地，场景掩蔽只在传播相关的空间块中进行，不要求模型凭没有证据的链路预测完全无关的几何区域。场景重建目标使用粗粒度占用状态，从而突出遮挡、反射和绕射的主要传播作用。

第二是**物理引导的跨模态蒸馏**。要求 PHYSC 表征重建与环境和链路几何有关的空间频谱，刻画不同传播方向的能量分布；并使其与实际造成该信道的传播相关场景块表征对齐。对于空间上不相关的链路，鼓励特征分离；对于距离较近、可能共用散射体的链路，适当放宽分离程度。这使压缩表示与物理传播作用联系起来。

预训练完成后冻结编码器 $f_\phi$，对每条观测得到特征

$$
\mathbf z_k=f_\phi(\mathbf H_k,\mathbf p_k),\qquad
\mathcal Z=\{\mathbf z_k\}_{k=1}^{K}.
$$

**图 2.** PHOENIX 的多模态输入、PHYSC 信息聚合、掩蔽块重建、空间频谱重建和场景对齐预训练流程。

### 3.2 场景的扩散后验

第二阶段学习条件分布 $p_\theta(\mathbf s\mid\mathcal Z)$。虽然最终布局为二值网格，但扩散过程使用连续的 analog bits：

$$
\mathbf x_0=2\mathbf s-1\in\{-1,+1\}^{N^2},\qquad
\widehat{\mathbf s}=\mathbf1[\mathbf x_0>0].
$$

正向扩散过程采用高斯扰动和余弦噪声调度：

$$
q(\mathbf x_t\mid\mathbf x_0)=\mathcal N\left(
\mathbf x_t;\sqrt{\overline\alpha_t}\mathbf x_0,
(1-\overline\alpha_t)\mathbf I\right),\qquad
\mathbf x_t=\sqrt{\overline\alpha_t}\mathbf x_0+
\sqrt{1-\overline\alpha_t}\boldsymbol\epsilon.\tag{3}
$$

其中 $\boldsymbol\epsilon\sim\mathcal N(0,\mathbf I)$。去噪器 $\epsilon_\theta(\mathbf x_t,t,\mathcal Z)$ 是网格 token Transformer，先在占用单元之间执行自注意力，再使用交叉注意力从不同无线观测的特征中读取与特定网格相关的证据。扩散时刻通过自适应层归一化输入。由于特征集合作为注意力键和值，该结构能够接受不同数量、任意排列的观测，而无需为不同 $K$ 重新训练。

训练时最小化噪声预测损失：

$$
\theta^\star=\arg\min_\theta
\mathbb E_{(\mathbf s,\mathcal O)\sim\mathcal D}
\mathbb E_{t,\boldsymbol\epsilon}
\left[\|\boldsymbol\epsilon-
\epsilon_\theta(\mathbf x_t,t,\mathcal Z)\|_2^2\right].\tag{4}
$$

PHOENIX 编码器被冻结，只更新扩散解码器参数。

**共识读出。** 推断时从学得的后验独立生成 $M$ 个二值占用网格，再计算逐单元的后验占用概率估计：

$$
\widehat\pi_i=\frac1M\sum_{m=1}^{M}\widehat s_i^{(m)},\qquad
\widehat s_i^{\mathrm{cons}}=
\mathbf1\left[\widehat\pi_i>\frac12\right].\tag{5}
$$

原文附录 F 的命题 3 证明，逐网格采样平均在 Hoeffding 界意义下向学习的后验边缘概率集中；命题 4 则在后验近似正确等条件下，将可观测集合内的恢复与观测数增长联系起来。共识读出与追求多样图像的生成任务不同：真实场景固定，后验样本之间的变化反映观测尚未消除的歧义，因此应保留样本间一致支持的结构。

**图 3.** 冻结的物理表征作为交叉注意力条件，扩散 Transformer 对网格占用状态反复去噪。

## 4. 实验

作者用包含 **11,000 个室外环境与 3,000 万条射线追踪信道观测**的数字孪生语料预训练 PHOENIX，再以其特征训练扩散后验模型，称为 Diffusion + FM。

另设置三种基线。Diffusion + Raw Meas. 以原始信道为扩散模型条件；Marginal Prob. + Raw Meas. 从每次原始信道独立输出逐格概率后融合；Marginal Prob. + FM 则从每次 PHOENIX 表征独立输出概率并用置信度融合。这样可分别检验物理表征和联合后验推断是否必要。

### 4.1 主要结果

**图 4.** 比较不同测试场景中各方法恢复的建筑轮廓。  
**表 1.** 原文报告的各方法在完整测试集上的平均指标：

| 方法 | 平衡准确率 | F1 | IoU |
|---|---:|---:|---:|
| Diffusion + Raw Meas. | 0.505 | 0.054 | 0.030 |
| Marginal Prob. + Raw Meas. | 0.621 | 0.397 | 0.251 |
| Marginal Prob. + FM | 0.738 | 0.633 | 0.470 |
| Diffusion + FM | **0.758** | **0.663** | **0.506** |

原文还报告 Diffusion + FM 的平衡准确率中位数 0.746、第 90 百分位 0.868；F1 的中位数 0.655、第 90 百分位 0.810；IoU 的中位数 0.487、第 90 百分位 0.680。

结果显示，只有联合使用物理表征与后验扩散，才获得最好的恢复结果。直接对原始信道训练扩散模型性能接近随机水平，这反映的是学习难度而不是原始信道缺少信息：模型必须同时发现传播–几何对应和学习场景后验。独立概率模型面对原始信道时也会因迫使单条链路预测整个场景而在无观测证据的区域过度自信；基于物理表征并仅在传播相关区域提供有效投票的版本因此效果更好。

进一步比较 Marginal Prob. + FM 和 Diffusion + FM，二者都使用物理表征，但后者联合推断整个场景的后验，而前者先独立预测再按固定规则融合。两者中位数 IoU 的相对差距较小，但第 90 百分位差距明显扩大，说明联合模型尤其能够利用互补测量中的联合证据。

### 4.2 单次观测概率的物理可解释性

**图 5.** 两个不同用户在同一环境中的逐网格占用概率及各自的传播路径。基于 PHOENIX 表征的边缘概率模型能恢复直射和反射路径上的空旷区域、负责反射的建筑面以及造成遮挡的结构；未受到观测约束的区域通常接近 0.5，表示信息不足。这种表现说明单次观测预测具有传播物理意义，不是任意的局部场景猜测。

### 4.3 场景建筑密度的影响

测试环境建筑占用比例约为 1%–70%，分为稀疏（88 个场景）、中等（565 个场景）和密集（18 个场景）三档。

**表 2.** Diffusion + FM 在三个密度区间的原文平均指标：

| 场景 | 平衡准确率 | F1 | IoU |
|---|---:|---:|---:|
| 稀疏 | 0.786 | 0.665 | 0.510 |
| 中等 | 0.752 | 0.659 | 0.501 |
| 密集 | 0.806 | 0.775 | 0.652 |

所提方法在三个区间表现最好，在密集场景的优势更加突出。相较 Marginal Prob. + FM，平衡准确率优势由稀疏场景的 2.9% 提高到密集场景的 13.2%，IoU 优势由 9.0% 提高至 42.7%。在密集场景中，一次观测通常只覆盖更局部的环境结构，联合模型比独立估计再融合更能利用不同路径提供的互补证据。

### 4.4 观测数目的影响

**图 6.** 比较每个场景具有 50–1000 次无线信道测量时的重建性能。训练时两个扩散解码器使用的测量数为 $K\in[100,500]$，因此也检验了测量数范围外的泛化。

随着观测数增加，基于 PHOENIX 表征的方法通常先改进再趋于饱和。新的链路特别是反射路径可能覆盖以前没有观测到的单元，扩大可观测集合；对已经观测到的单元，额外测量可以提高后验置信度。达到一定覆盖度后，更多观测主要重复已有证据，尚未被任何传播路径到达的结构仍不可恢复。直接使用原始信道的扩散基线则始终接近随机水平，说明缺少物理表征时，单纯增加测量量并不能解决模型学习的困难。

## 5. 结论

本文提出通过物理约束表征学习与联合生成式后验推断，从现有通信基础设施所收集的无线信道中重建环境几何。PHOENIX 从单次信道观测提取与传播场景相关的信息，扩散模型再联合处理多个观测特征，对完整占用布局建模和采样，最后通过样本共识输出建筑轮廓。

实验表明，仅凭通信信道测量也可以恢复环境中相当一部分建筑布局，并且物理表征和联合后验建模均具有独立贡献。这为使用无线基础设施维护环境地图、数字孪生与通感一体化提供了一条途径，同时也明确要求对未观测区域保持不确定性。

## 数学推导及完整实验表格补录（原论文第 4 节及附录）

### 表 1：不同模型的全部统计量

以下依次列出均值、中位数和第 90 百分位（P90），均来自原文表 1；↑ 表示越大越好。

| 方法 | 平衡准确率：均值 / 中位 / P90 | F1：均值 / 中位 / P90 | IoU：均值 / 中位 / P90 |
|---|---|---|---|
| Diffusion + Raw Meas. | 0.505 / 0.500 / 0.519 | 0.054 / 0.016 / 0.162 | 0.030 / 0.008 / 0.088 |
| Marginal Prob. + Raw Meas. | 0.621 / 0.618 / 0.668 | 0.397 / 0.398 / 0.503 | 0.251 / 0.248 / 0.336 |
| Marginal Prob. + FM | 0.738 / 0.739 / 0.803 | 0.633 / 0.642 / 0.737 | 0.470 / 0.473 / 0.584 |
| Diffusion + FM | **0.758 / 0.746 / 0.868** | **0.663 / 0.655 / 0.810** | **0.506 / 0.487 / 0.680** |

### 表 2：按建筑密度划分的全部模型结果

| 方法 | 稀疏（88）：准确率 / F1 / IoU | 中等（565）：准确率 / F1 / IoU | 密集（18）：准确率 / F1 / IoU |
|---|---|---|---|
| Diffusion + Raw Meas. | 0.518 / 0.066 / 0.039 | 0.503 / 0.048 / 0.027 | 0.508 / 0.179 / 0.105 |
| Marginal Prob. + Raw Meas. | 0.647 / 0.434 / 0.283 | 0.617 / 0.393 / 0.248 | 0.589 / 0.316 / 0.190 |
| Marginal Prob. + FM | 0.764 / 0.631 / 0.468 | 0.735 / 0.635 / 0.471 | 0.712 / 0.607 / 0.457 |
| Diffusion + FM | **0.786 / 0.665 / 0.510** | **0.752 / 0.659 / 0.501** | **0.806 / 0.775 / 0.652** |

### 表 3：用户位置存在噪声时的完整重建结果

这是附录中的额外对照：测试时给每条用户位置添加二维独立高斯误差 $\widetilde{\mathbf p}_k=\mathbf p_k+\mathbf e_k$，$\mathbf e_k\sim\mathcal N(\mathbf0,\sigma^2\mathbf I_2)$，每个坐标方向 $\sigma=5$ m，每个场景 $K=500$ 次观测；所有模型都只在**精确位置**上训练，位置误差仅在测试时引入。括号中的百分比是相对表 1 精确位置条件下指标均值的变化。

| 方法 | 平衡准确率：均值（变化） / 中位 / P90 | F1：均值（变化） / 中位 / P90 | IoU：均值（变化） / 中位 / P90 |
|---|---|---|---|
| Diffusion + Raw Meas. | 0.505 (±0.0%) / 0.500 / 0.517 | 0.053 (−1.5%) / 0.018 / 0.150 | 0.030 (±0.0%) / 0.009 / 0.081 |
| Marginal Prob. + Raw Meas. | 0.609 (−1.9%) / 0.604 / 0.655 | 0.374 (−5.9%) / 0.371 / 0.480 | 0.233 (−7.1%) / 0.228 / 0.315 |
| Marginal Prob. + FM | 0.728 (−1.4%) / 0.725 / 0.797 | 0.617 (−2.5%) / 0.619 / 0.714 | 0.453 (−3.7%) / 0.449 / 0.556 |
| Diffusion + FM | 0.696 (−8.2%) / 0.676 / 0.829 | 0.553 (−16.5%) / 0.538 / 0.763 | 0.397 (−21.6%) / 0.368 / 0.617 |

这项测试表明联合扩散模型虽然在准确位置条件下最好，但对训练中未见过的位置错位更为敏感：相互矛盾的空间证据使后验样本的建筑位置不一致，样本共识会抑制部分真实建筑，故 F1 和 IoU 降幅比平衡准确率更大。

### 附录 A–B：传播相关集合与不可辨识性的数学定义

第 $k$ 条链路的传播相关网格集合定义为

$$
\mathfrak a_k=\{i:\mathrm{cell}_i\cap\ell\ne\varnothing
\text{，其中 }\ell\in\mathcal P(\mathbf s,\mathbf p_k)\},
\qquad\mathcal A=\bigcup_{k=1}^{K}\mathfrak a_k.\tag{7}
$$

**命题 1：相容场景集合的基数。** 令 $\mathbf s^\star$ 为真实场景，$\mathcal S_k(\mathbf H_k)=\{\mathbf s:\mathcal F(\mathbf s,\mathbf p_k)=\mathbf H_k\}$ 为产生同一无噪信道的所有可能场景，则

$$
|\mathcal S_k(\mathbf H_k)|\ge 2^{|\mathfrak a_k^c|}.
$$

证明思路是：按传播相关集合的定义，$\mathfrak a_k^c$ 中的网格不影响任何产生当前观测的路径，所以任意翻转这些网格的占用状态都会产生相同信道。不同翻转子集共有 $2^{|\mathfrak a_k^c|}$ 个。对所有链路联合后得到下界 $|\mathcal S(\mathcal O)|\ge2^{|\mathcal A^c|}$。这只是未观测网格造成的不可辨识性；在可观测集合内仍可能存在其他歧义。

有限带宽 $B$ 对应时延分辨率 $\Delta\tau=1/B$；具有 $N_{\rm tx}$ 个单元的阵列孔径对应角度分辨率近似 $\Delta\theta\approx2/N_{\rm tx}$。当两个场景生成的路径参数在这些分辨率限制内不可区分时，存在原文式（8）的近似等价关系

$$
\{(\tau_\ell,\theta_\ell,\phi_\ell,\alpha_\ell)\}_{\mathbf s}
\equiv
\{(\tau_\ell,\theta_\ell,\phi_\ell,\alpha_\ell)\}_{\mathbf s'}
\quad\text{在 }(\Delta\tau,\Delta\theta)\text{ 分辨率下}.\tag{8}
$$

**命题 2：传播等价场景不可区分。** 如果 $\mathcal P(\mathbf s,\mathbf p_k)$ 与 $\mathcal P(\mathbf s',\mathbf p_k)$ 的各路径参数均相同，则 $\mathcal F(\mathbf s,\mathbf p_k)=\mathcal F(\mathbf s',\mathbf p_k)$，无论带宽或阵列孔径如何，单凭这条观测都无法区分两个场景。网格 $i$ 对链路 $k$ 的传播作用记为

$$
\rho_k(i)=\rho(i,\mathbf p_k,\mathbf s)
\in\{\mathrm{block},\mathrm{reflect},\mathrm{free},\mathrm{none}\}.\tag{9}
$$

四个值依次代表阻挡、反射或绕射、被有效路径穿越的自由空间，以及不参与也不阻挡有效路径。注意 $\rho_k(i)$ 取决于链路几何，不只是网格自身的占用状态。

对命题 1 的补充说明：该下界一般并不取等号。它只枚举了与 $\mathbf s^\star$ 在 $\mathfrak a_k$ 之外不同的场景；B.2 与 B.3 所述的歧义会贡献进一步在 $\mathfrak a_k$ 内部不同的成员。对观测集合聚合后，$\mathfrak a_k^c$ 被替换为 $\mathcal A^c$，于是 $|\mathcal S(\mathcal O)|\ge2^{|\mathcal A^c|}$：残余非唯一性在任何路径都未触及的网格数上呈指数增长。

**交互序列的混叠。** 不同的相互作用序列可以产生相同的路径参数。来自一个表面的单次镜面反射，与来自另外两个表面的连续两次反射，可能给出相同的总时延以及相同的出发角与到达角；此时两个场景对路径求和式的贡献完全相同。这里结构所扮演的角色本身不同（不同的网格在反射），但场景仍是传播等价的。该机制在几何使参数恰好重合时（例如对称布局）严格成立，否则近似成立，并与附录 B.2 的有限分辨率歧义叠加。

**占据不等于遮挡。** 一个网格可以已被占据，却仍然不能阻挡某条链路的视距段：基站与用户位于不同高度，直达射线会从低于该处射线高度的结构上方通过；而二维占据网格只记录“此处有建筑”，不记录建筑是否高到足以截断射线。因此某个网格可以属于某次观测的传播相关集合（它位于链路所用的一条路径上），而该次测量仍然不包含反对其被占据的证据：无阻挡信道与“射线从上方掠过的结构”同样相容。

### 附录 F：共识读出的采样误差界

**命题 3。** 令 $\widehat{\mathbf s}^{(1)},\dots,\widehat{\mathbf s}^{(M)}$ 为从学习后验 $p_\theta(\cdot\mid\mathcal Z)$ 独立抽取的二值占用样本，令 $\pi_i^\theta=p_\theta(s_i=1\mid\mathcal Z)$。逐网格后验概率估计 $\widehat\pi_i$ 满足 Hoeffding 不等式：

$$
\Pr\!\left(|\widehat\pi_i-\pi_i^\theta|\ge\varepsilon\right)
\le 2\exp(-2M\varepsilon^2).\tag{17}
$$

因此当 $\pi_i^\theta\ne1/2$ 时，共识估计与逐网格贝叶斯最优 0–1 损失决策不同的概率满足

$$
\Pr\!\left[
\widehat s_i^{\mathrm{cons}}\ne
\mathbf1[\pi_i^\theta>1/2]\right]
\le2\exp\!\left[-2M\left(\pi_i^\theta-\frac12\right)^2\right].\tag{18}
$$

并且 $\widehat\pi_i(1-\widehat\pi_i)\to\operatorname{Var}_\theta(s_i\mid\mathcal Z)$。上述结果要求样本独立且来自学得后验；它说明样本共识能稳定估计**模型自身**的边缘占用概率，并不自动证明模型后验等于真实后验。

**命题 4。** 在模型正确设定、表征 $\mathcal Z$ 对后验充分、各观测在给定真实场景条件下相互独立等假设下，对于 $i\notin\mathcal A$，后验边缘等于条件先验，新增观测不会直接降低该网格的不确定性；对 $i\in\mathcal A$，设 $n_i$ 为能够区分真实场景与该网格状态相反的候选场景的观测数，则其正确恢复概率随着 $n_i$ 增加而提高。该命题是带条件的极限论断，不是针对任何网络的无条件准确率保证。

#### F.1 命题 3 的证明

固定某个网格 $i$。每个样本 $\widehat s_i^{(m)}$ 是参数为 $\pi_i^\theta=p_\theta(s_i=1\mid\mathcal Z)$ 的伯努利变量；由于每条反向轨迹由独立噪声驱动，样本相互独立。

**(a) 集中性。** 变量有界于 $[0,1]$，Hoeffding 不等式即给出上文式（17）；再由强大数定律，$M\to\infty$ 时 $\widehat\pi_i\to\pi_i^\theta$。

**(b) 判决。** 共识 $\widehat s_i^{\mathrm{cons}}=\mathbf1[\widehat\pi_i>1/2]$ 与 $\mathbf1[\pi_i^\theta>1/2]$ 不同，只可能发生在 $\widehat\pi_i$ 落到 $1/2$ 的另一侧，这要求 $|\widehat\pi_i-\pi_i^\theta|\ge|\pi_i^\theta-1/2|$。在上文式（17）中取 $\varepsilon=|\pi_i^\theta-1/2|$，即得上文式（18）。极限 $\mathbf1[\pi_i^\theta>1/2]$ 正是 $p_\theta$ 下网格 $i$ 在 0–1 损失下的贝叶斯判决，即使逐网格汉明误差期望最小的判决：对伯努利后验，最优判决取更可能的值。

**(c) 方差。** 映射 $x\mapsto x(1-x)$ 连续，由连续映射定理，$\widehat\pi_i(1-\widehat\pi_i)\to\pi_i^\theta(1-\pi_i^\theta)=\operatorname{Var}_\theta[s_i\mid\mathcal Z]$。

**两点注记。** 第一，式（18）表明所需样本数按 $1/(\pi_i^\theta-1/2)^2$ 增长：边缘概率接近 $1/2$ 的网格正是需要大量抽样才能稳定、也是样本分歧最大的网格——估计的不稳定与它所反映的歧义是同一现象。第二，该命题针对的是**学得的**后验：抽样只是提取已编码在 $p_\theta$ 中的判决，自身不增加信息。

#### F.2 命题 4 的证明

作者不假设每个被覆盖网格都有统一的信息缺口，而是直接用“哪些观测能区分竞争假设”来定义相关计数。

**定义 1（区分性观测）。** 若 $\mathcal F(\mathbf s,\mathbf p_k)\ne\mathcal F(\mathbf s',\mathbf p_k)$，即两个场景对链路 $k$ 诱导出不同的路径参数，则称观测 $k$ 区分场景 $\mathbf s,\mathbf s'$。对网格 $i$，记 $n_i$ 为能够区分 $\mathbf s^\star$ 与“在网格 $i$ 上不同的备选场景”的观测数。

两类 $X_k=0$ 的情形被该定义天然排除：$i\notin\mathfrak a_k$ 的观测对网格 $i$ 不变；对该场景对“角色退化”的观测虽覆盖该网格，却按命题 2 在两个假设下诱导相同路径参数。两者都无需额外假设，且一般有 $n_i\le|\{k:i\in\mathfrak a_k\}|$。

假设：

- **（A1）模型正确设定。** $p_\theta(\cdot\mid\mathcal Z)=p(\cdot\mid\mathcal O)$，且 $\mathcal Z$ 对 $\mathbf s$ 充分。
- **（A2）前向不变性。** $p(\mathcal O\mid\mathbf s)$ 只通过 $\mathbf s_{\mathcal A}$ 依赖 $\mathbf s$。
- **（A3）条件独立。** 给定 $\mathbf s$ 时各观测相互独立。
- **（A4）正则性。** 对数似然比 $X_k$ 为次指数变量，其矩母函数在原点附近存在。

**(i) 不可观测网格。** 令 $i\notin\mathcal A$。将先验分解为 $p(\mathbf s)=p(\mathbf s_{\mathcal A})p(\mathbf s_{\mathcal A^c}\mid\mathbf s_{\mathcal A})$，并把（A2）代入贝叶斯公式，得到式（2）的分解，其中观测 $\mathcal O$ 不出现在第二个因子中。边缘化得 $\pi_i=p(s_i=1\mid\mathbf s_{\mathcal A})$：网格 $i$ 的信念完全由以场景可观测部分为条件的先验提供。随着数据使 $p(\mathbf s_{\mathcal A}\mid\mathcal O)$ 变尖，网格 $i$ 的方差收敛到先验条件方差 $\operatorname{Var}_{\mathrm{prior}}[s_i\mid\mathbf s_{\mathcal A}^\star]$，这是测量无法降低的下界。该结论在下述两种情形下都成立。

**(ii) 可观测网格。** 前向映射对**物理**场景（网格几何、建筑高度、材质属性，射线追踪据此计算传播）是确定的，但占据网格 $\mathbf s$ 是这一描述的粗粒度投影。记物理场景为 $\mathrm{g}$，许多 $\mathrm{g}$ 与同一网格相容且产生不同信道；因此进入后验的似然是边缘分布

$$
p(\mathbf H_k\mid\mathbf s)=\int p(\mathbf H_k\mid\mathrm{g})\,p(\mathrm{g}\mid\mathbf s)\,d\mathrm{g},\tag{19}
$$

即使仿真器本身无噪，它也是对信道实现的密度而非点质量，故下文的 KL 散度有定义。令 $\delta_i>0$ 表示在 $n_i$ 计及的区分性观测上、对网格 $i$ 处于竞争关系的备选场景 $\mathbf s'$ 取的最小散度 $\mathrm{KL}\!\left(p(\mathbf H_k\mid\mathbf s^\star)\,\|\,p(\mathbf H_k\mid\mathbf s')\right)$；区分性保证 $\delta_i>0$。由（A3），$\mathbf s^\star$ 与该备选场景之间的对数后验几率分解为

$$
L=\log\frac{p(\mathbf s^\star\mid\mathcal O)}{p(\mathbf s'\mid\mathcal O)}
=\underbrace{\log\frac{p(\mathbf s^\star)}{p(\mathbf s')}}_{=:L_0}+\sum_{k=1}^{K}X_k,\qquad
X_k=\log\frac{p(\mathbf H_k\mid\mathbf s^\star)}{p(\mathbf H_k\mid\mathbf s')},\tag{20}
$$

其中每个非区分性观测 $X_k\equiv0$，只留下 $n_i$ 个非零项。在真值下取期望有 $\mathbb E[X_k]\ge\delta_i$，故漂移 $\mathbb E[\sum_k X_k]\ge n_i\delta_i$ 随 $n_i$ 线性增长，而由独立性，和的标准差按 $O(\sqrt{n_i})$ 增长。网格 $i$ 上出错要求 $L\le0$，即和至少低于其均值 $n_i\delta_i+L_0$。Chernoff 界给出，对适当 $\lambda>0$，

$$
\Pr\!\left[\sum_k X_k+L_0\le0\right]
\le e^{\lambda L_0}\prod_{k\ \text{区分性}}\mathbb E\!\left[e^{-\lambda X_k}\right]
\le e^{-c\,n_i\delta_i},\tag{21}
$$

其中常数 $c>0$ 取决于次指数参数，当 $n_i$ 足够大时 $L_0$ 被吸收。结合（A1）与命题 3，共识以随 $n_i\delta_i$ 衰减的误差恢复 $s_i^\star$。

**注记。** 式（19）中的随机性源于问题本身，而不是测量噪声的产物：占据网格并不决定建筑高度、立面材质与亚网格几何，而这些都会塑造信道，因此一个网格的占据只在**分布意义上**约束所观测信道。这与附录 B.3 讨论的同一表征缺口有关：一条链路可能完全从被占据网格的上方通过。它也界定了任何数据量所能达到的极限，因为 $\delta_i$ 受网格未指定的物理场景部分限制，这也是第 4.4 节精度随观测累积仍饱和在 1 以下的原因之一。决定某个网格恢复的量是 $n_i$，即真正区分该处竞争假设的观测数，它同时排除了未覆盖观测与角色退化观测。因此角色退化不会终止恢复，只会减少有效信息观测数；只有当部署中的每条链路对某对在网格处不同的场景都不具区分性时，该网格才无法恢复。关于（A1）：扩散模型只在数据与容量极限下相合，有限规模下并不成立，因此该命题描述的是理想后验，实证问题是 $p_\theta$ 逼近它的程度；与以原始信道为条件的解码器对比，检验的正是该假设的“充分性”一半。关于（A2）：真实传播会把弱能量泄漏到主导路径之外，实践中 $\mathcal A$ 的边界是软的，$\mathcal A^c$ 上的集中是慢的而不是严格不存在。

### 附录 A、B.4 与 D：传播阵列模型、联合似然和完整预训练损失（式 6、10–16）

**附录 A：均匀线阵的空间响应（式 6）。** 对阵元间距为 $d$、波长为 $\lambda$、包含 $N$ 个阵元的均匀线阵，其方向响应为

$$
\mathbf a(\vartheta)=
\left[
1,\
e^{-j\frac{2\pi d}{\lambda}\sin\vartheta},\
\ldots,\
e^{-j\frac{2\pi d(N-1)}{\lambda}\sin\vartheta}
\right]^{T}.\tag{6}
$$

把该响应代入正文式（1）的传播路径求和式，即可得到每一收发天线对和子载波的信道系数；对带宽 $B$ 的时延分辨率近似为 $\Delta\tau=1/B$，对阵元数量 $N_{\mathrm{tx}}$ 的阵列，主视轴附近的角分辨率近似为 $\Delta\theta\approx2/N_{\mathrm{tx}}$。

**附录 B.4：条件独立观测的联合后验（式 10）。** 如果已知场景 $\mathbf s$ 时，不同用户的信道测量条件独立，那么多次观测的联合后验为

$$
p(\mathbf s\mid\mathcal O)\propto
p(\mathbf s)\prod_{k=1}^{K}p(\mathbf H_k\mid\mathbf s).\tag{10}
$$

增加观测使各条链路相容场景集合求交，从而收缩后验，但未被任何链路传播触及的网格仍具有非唯一性。

**附录 D：基础模型的物理引导预训练目标（式 11–16）。** 首先，对被掩蔽的信道 token 集合 $\mathcal M_{\mathrm{ch}}$，计算重建误差：

$$
\mathcal L_{\mathrm{ch}}=
\frac{1}{|\mathcal M_{\mathrm{ch}}|}
\sum_{i\in\mathcal M_{\mathrm{ch}}}
\|\widehat{\mathbf h}_i-\mathbf h_i\|_2^2.\tag{11}
$$

场景掩蔽只选择参与该链路传播的网格块 $\mathcal M_{\mathrm{scn}}\subseteq\mathfrak a_k$，并对二值占用标签 $o_i$ 应用交叉熵：

$$
\mathcal L_{\mathrm{scn}}=
-\frac1{|\mathcal M_{\mathrm{scn}}|}
\sum_{i\in\mathcal M_{\mathrm{scn}}}
\left[o_i\log\widehat o_i+
(1-o_i)\log(1-\widehat o_i)\right].\tag{12}
$$

接收机位置的掩蔽重建损失 $\mathcal L_{\mathrm{loc}}$ 由预测位置与真实位置的均方根误差定义，原文没有单独编号。

对发射与接收阵列方向 $\Psi\in\{\mathrm{tx},\mathrm{rx}\}$，由 CSI 在相应天线方向上的复响应 $\mathbf H_n^{(\Psi)}$ 的 DFT 构造方向空间谱：

$$
s_\Psi[b]=
\left|
\sum_{n=0}^{N_\Psi-1}
H_n^{(\Psi)}e^{-j2\pi nb/N_\Psi}
\right|^2,\qquad
\Psi\in\{\mathrm{tx},\mathrm{rx}\}.\tag{13}
$$

使用 Kullback–Leibler 散度对齐空间谱峰值，同时使用均方误差保持相对强度：

$$
\mathcal L_\Psi=
D_{\mathrm{KL}}\!\left(
\operatorname{softmax}(\mathbf s_\Psi)
\parallel
\operatorname{softmax}(\widehat{\mathbf s}_\Psi)
\right)+
\lambda_{\mathrm{MSE}}
\operatorname{MSE}(\widehat{\mathbf s}_\Psi,\mathbf s_\Psi).\tag{14}
$$

这里 $\lambda_{\mathrm{MSE}}$ 是对原文 $\lambda$ 的语义化下标标注，不改变其含义。为使 PHYSC token 与传播相关场景块特征对齐，定义对比损失：

$$
\mathcal L_{\mathrm{con}}=
-\frac1N\sum_{i=1}^{N}
\log\frac{
\exp(\mathbf z_i^{\mathrm{physc}}\cdot
\mathbf z_i^{\mathrm{scn}}/\tau)}
{\displaystyle\sum_{j=1}^{N}
w_{ij}\exp(\mathbf z_i^{\mathrm{physc}}\cdot
\mathbf z_j^{\mathrm{scn}}/\tau)}.\tag{15}
$$

其中 $\tau$ 是对比温度，$w_{ij}\in(0,1]$ 降低位置接近链路作为负样本的权重，以免惩罚实际拥有相似传播几何的样本。

合并各预训练项目，得完整目标

$$
\mathcal L_{\mathrm{pre}}=
\lambda_{\mathrm{ch}}\mathcal L_{\mathrm{ch}}+
\lambda_{\mathrm{scn}}\mathcal L_{\mathrm{scn}}+
\lambda_{\mathrm{loc}}\mathcal L_{\mathrm{loc}}+
\lambda_{\mathrm{spec}}
(\mathcal L_{\mathrm{tx}}+\mathcal L_{\mathrm{rx}})+
\lambda_{\mathrm{con}}\mathcal L_{\mathrm{con}}.\tag{16}
$$

以上重建模块只用于第一阶段基础模型的自监督预训练，预训练完成后舍弃；第二阶段使用冻结的 PHYSC 条件表征训练场景后验扩散模型。

**预训练解码器（附录 D 末段）。** 沿用掩蔽自编码的做法，一个轻量 Transformer 解码器接收已编码的可见 token，以及代表缺失输入的可学习 token，并预测相应的信道值、场景占用与位置。它只在预训练阶段使用，之后丢弃。

### 附录 C：基础模型架构与 token 化

**信道 token 化。** CSI 张量由实部／虚部转换为幅度与相位 $(a_{t,r,s},\phi_{t,r,s})$。对每个发射天线 $t$、接收天线 $r$ 以及由 $n_{\mathrm{sc}}$ 个相邻子载波构成的组 $g$，一个信道 token 由相应的幅度与相位值拼接而成：$x^{\mathrm{ch}}_{t,r,g}=[a_{t,r,g,1:n_{\mathrm{sc}}}\parallel\phi_{t,r,g,1:n_{\mathrm{sc}}}]\in\mathbb R^{2n_{\mathrm{sc}}}$，共 $N_{\mathrm{ch}}=N_{\mathrm{tx}}N_{\mathrm{rx}}N_{\mathrm{sc}}/n_{\mathrm{sc}}$ 个 token。每个 token 经可学习线性投影与层归一化映射到共享嵌入维 $d$。该设计保留完整的发射与接收天线分辨率（每个天线对携带不同空间信息），同时以分组子载波紧凑表示局部频率结构。

**场景与位置 token 化。** 高度图 $S\in\mathbb R^{N\times N}$ 被划分为不重叠的 $p\times p$ patch，展平后同样投影，得到 $(N/p)^2$ 个场景 token。接收机位置经单层线性层投影为一个位置 token。

**物理来源的位置与模态嵌入。** token 化捕捉内容而不含物理来源。对信道 token，沿发射、接收与子载波三个轴分别用正弦编码表示位置并拼接：$e^{\mathrm{ch}}_{t,r,g}=[\mathrm{PE}_{\mathrm{tx}}(t)\parallel\mathrm{PE}_{\mathrm{rx}}(r)\parallel\mathrm{PE}_{\mathrm{sc}}(g)]$，既保留阵列的空间结构，也保留信道的频率结构。对场景 patch，把 patch 相对基站的归一化距离与方位角的正弦特征输入两层 MLP，使每个 token 携带其与参考位置的几何关系。可学习模态嵌入 $m(i)\in\{m_{\mathrm{ch}},m_{\mathrm{scn}},m_{\mathrm{loc}}\}$ 标识 token 类型。最终的输入 token 是三者之和：token 包含什么、物理上来自何处、属于哪种模态。

**编码器。** 由于信道 token 数量远多于场景与位置 token，轻量预编码器块先只处理信道 token，在 $(t,r,g)$ 三个轴上使用旋转位置嵌入，以在跨模态融合前捕捉相邻天线与频率之间的局部相关性；绝对编码保留给后续阶段。随后所有 token 拼接为单一序列，以 [PHYSC] 为前缀，交给带合并 token 自注意力的单流 Transformer 处理，使全部模态从第一层起即可交互。二值注意力掩码实现正文所述的非对称性：[PHYSC] 对所有 token 都是无约束的查询，但在所有位置都被排除为键，因此它可以从序列读取信息，而没有任何 token 从它读取。

### 附录 E：扩散解码器细节

**噪声日程。** 采用余弦日程 $\bar\alpha_t=f(t)/f(0)$，其中

$$
f(t)=\cos^2\!\left(\frac{t/T+\varsigma}{1+\varsigma}\cdot\frac{\pi}{2}\right),
$$

偏移 $\varsigma=0.008$，$\beta_t=1-\bar\alpha_t/\bar\alpha_{t-1}$ 截断在 0.999 以保证数值稳定。

**去噪器。** 每个块包含：作用于网格 token、受时间步调制的自注意力；对条件集合的普通交叉注意力；受时间步调制的前馈网络。调制采用自适应层归一化方案：时间步嵌入为每个块产生 shift、scale 与 gate 参数，gate 初始化为零，使每个块初始时是恒等映射。交叉注意力不做调制，因为可变大小的条件集合不像标量时间步那样自然折叠为单一的全局调制向量。线性适配器把编码器嵌入维映射到解码器宽度，输出头零初始化。

**条件丢弃。** 训练时以概率 $p_{\mathrm{drop}}=0.15$ 把整个条件集合替换为可学习的空嵌入。作者把它作为正则项，防止模型过度依赖某一特定条件配置；采样时直接使用条件预测，不加引导。

**采样器。** 从 $\mathbf x_T\sim\mathcal N(0,\mathbf I)$ 出发做祖先采样。每一步先把干净场景估计 $\widehat{\mathbf x}_0=(\mathbf x_t-\sqrt{1-\bar\alpha_t}\,\epsilon_\theta(\mathbf x_t,t,\mathcal Z))/\sqrt{\bar\alpha_t}$ 截断到 $[-1,1]$，再构造后验均值，以稳定二值目标在 $t=0$ 处的轨迹。$M$ 条轨迹各由独立噪声驱动，最后一步按符号二值化——这正是附录 F 的集中性结果成立的条件。

### 附录 G：数据集与训练细节

**数据集。** 作者用 Sionna RT（Hoydis et al., 2023）在 200 个城市、超过 11,000 个室外城市场景上仿真信道，每个场景覆盖 200 m × 200 m 区域，三维建筑几何由 OpenStreetMap（OpenStreetMap contributors, 2023）经 Geo2SigMap 流程（Li et al., 2024）提取。仿真载频 5.8 GHz，带宽 100 MHz，128 个子载波。基站配备 $N_{\mathrm{tx}}=32$ 元均匀线阵，高度 15 m，每个环境服务 2,000 个以上随机放置的用户，每个用户配备 $N_{\mathrm{rx}}=8$ 元均匀线阵，高度 1.5 m。数据集包含 3,000 万以上样本，每个样本由复信道张量、用户位置和建筑高度图组成。占据网格在 $20\times20$ 网格、即 $\Delta R=10$ m 上获得，其网格与基础模型的场景 patch 一致。传播相关集合按附录 A 所述由射线追踪记录。

**基础模型预训练。** 编码器为 12 层 Transformer，嵌入维 512，上下文窗口 2,450 token，约 6,000 万可训练参数。预训练使用式（16）的目标和渐进式掩蔽组合比例；在 32 块 NVIDIA L40 GPU 上训练 9,600 GPU 小时、48 个 epoch，处理约 8,820 亿 token。

**扩散解码器训练。** 去噪器深度 6、宽度 192、6 个注意力头、MLP 比 4，用线性适配器把 512 维编码器嵌入映射到解码器宽度。由于编码器冻结，其 [PHYSC] 嵌入按场景最多 2,000 次观测一次性提取并缓存，因此解码器训练不经过编码器的前向或反向。扩散步数 $T=1000$，余弦日程见附录 E，条件丢弃概率 $p_{\mathrm{drop}}=0.15$。为用单一模型服务任意观测数，每个训练步的观测数从 $[K_{\min},K_{\max}]=[100,500]$ 均匀重抽，并在批次内的各场景间共享。训练用 AdamW，学习率 $10^{-4}$、权重衰减 $10^{-4}$，第一个 epoch 从 $0.1\times$ 基础学习率线性预热后余弦衰减，梯度范数截断 1.0；8 块 GPU、每 GPU 32 个场景，训练 100 个 epoch、每个 500 步。采样用条件预测、不加引导，共识由 $M=32$ 个样本形成。

**评测。** 全部模型在 671 个留出测试环境上评测。对每个场景，观测在扫描最大值 $K=1000$ 处一次性载入，更小的 $K$ 使用同一序列的前缀，因此各扫描点的观测集是嵌套的，$K$ 之间的差异反映新增观测而不是重采样。每个模型对各场景的逐观测编码只计算一次并在扫描点间复用；每个 $K$ 只重复融合步骤，或对两个扩散模型重复反向扩散采样。

### 附录 H：Marginal Prob. + FM 的逐观测解码器与置信度融合（式 22–24）

**逐观测解码器。** 该变体完整复用预训练模型，包括预训练阶段的轻量解码器。每次观测在高度图输入被完全掩蔽的条件下编码，解码器仅根据信道和位置预测每个场景 patch 的占据：

$$
q_{k,i}=\sigma\!\left(g_\psi(f_\phi(\mathbf H_k,\mathbf p_k))_i\right),\tag{22}
$$

即仅由观测 $k$ 支持的占据信念。与 Diffusion + FM 不同，这里编码器不冻结：$\phi$ 与 $\psi$ 在下述目标下联合微调。

**置信度塑形目标。** 令 $\mathfrak a_k$ 为观测 $k$ 的传播相关集合，$\partial\mathfrak a_k$ 为距 $\mathfrak a_k$ 一步（8 连通）但不在其中的网格，$u_k=(\mathfrak a_k\cup\partial\mathfrak a_k)^c$ 为其余网格。记 $\mathrm{BCE}_\beta(q,s)=-[\beta s\log q+(1-s)\log(1-q)]$ 为类别平衡交叉熵，$\beta=(1-\rho)/\rho$，$\rho$ 为场景中占据网格的比例，截断到 $[0.01,0.99]$。训练目标为

$$
\mathcal L_{\mathrm{marg}}=
\frac{1}{|\mathfrak a_k|}\sum_{i\in\mathfrak a_k}\mathrm{BCE}_\beta(q_{k,i},s_i)
-\lambda_c\frac{1}{|\mathfrak a_k|}\sum_{i\in\mathfrak a_k}|2q_{k,i}-1|
+\lambda_n\frac{1}{|\partial\mathfrak a_k|}\sum_{i\in\partial\mathfrak a_k}\mathrm{BCE}_\beta(q_{k,i},s_i)
+\lambda_u\frac{1}{|u_k|}\sum_{i\in u_k}\left(q_{k,i}-\frac12\right)^2.\tag{23}
$$

第一项拟合该观测真正约束的网格占据；第二项奖励在这些网格上给出高置信度；第三项以较小权重监督相关集合边界，因为路径相邻的网格只被部分约束；第四项把观测触及不到的网格预测拉向 $1/2$。正是最后一项赋予信念以含义：若只用交叉熵，每个网格都会被推向确定标签，信念也就不再能指示观测在何处没有信息。传播相关集合只在训练时用于构造该损失，推断时不需要。取 $\lambda_c=0.1$、$\lambda_n=0.3$、$\lambda_u=0.5$，第一项权重为 1。训练用 AdamW，学习率 $10^{-5}$、权重衰减 $10^{-4}$，每 GPU 32 次观测，第一个 epoch 线性预热后余弦衰减，梯度范数截断 1.0，训练 20 个 epoch，每个覆盖训练语料的四分之一。

**置信度门控的几何融合。** 逐观测信念由置信度门控的几何加权平均合并：一次观测只在其信念足够置信、且按网格到该链路的距离加权时才对某网格投票，

$$
w_{k,i}=\gamma_{k,i}\,\mathbf 1\!\left[|2q_{k,i}-1|>\tau_c\right],\qquad
\gamma_{k,i}=\exp\!\left(-\frac{d_{k,i}^2}{2\sigma^2}\right),
$$

$$
P_i=\frac{\sum_k w_{k,i}q_{k,i}}{\sum_k w_{k,i}},\qquad
\widehat s_i=\mathbf 1\!\left[P_i>\frac12\ \wedge\ \sum_k w_{k,i}>\kappa\right],\tag{24}
$$

其中 $d_{k,i}$ 是网格 $i$ 中心到基站—用户 $k$ 连线的距离。几何权重只依赖基站与用户位置，推断时已知；传播相关集合不被使用。没有得到足够加权投票的网格被判为自由，因此每个网格都有判决，全部指标都在整幅网格上计算。取 $\tau_c=0.75$、$\sigma=50$ m、$\kappa=0.05$。置信度门控使融合能够丢弃对某网格无信息的观测，而它之所以有效，正是因为式（23）把这类信念推向 $1/2$。

### 附录 I：基线实现（式 25–26）

**Diffusion + Raw Meas.** 去噪器结构、噪声日程、采样器与共识样本数都与 Diffusion + FM 完全相同。条件集合由原始观测经可学习 token 化器 $\tau_\omega$ 构成，并与解码器联合训练：

$$
\mathcal Z_{\mathrm{raw}}=\left\{\tau_\omega(\mathbf H_k,\mathbf p_k)\right\}_{k=1}^{K},\qquad
(\theta^\star,\omega^\star)=\arg\min_{\theta,\omega}\mathbb E_{(\mathbf s,\mathcal O)\sim\mathcal D}\mathbb E_{t,\boldsymbol\epsilon}\left[\left\|\boldsymbol\epsilon-\epsilon_\theta(\mathbf x_t,t,\mathcal Z_{\mathrm{raw}})\right\|_2^2\right].\tag{25}
$$

token 化器 $\tau_\omega$ 是 3 层、宽 256、8 头的浅层 Transformer 编码器。每次原始观测按基础模型的信道前端 token 化——每个收发天线对与 16 个子载波为一组构成一个 token，共 2,048 个信道 token，并沿发射、接收、子载波三个轴使用因式化正弦位置编码——再加上一个位置 token，编码序列经均值池化为每次观测一个 token。因此条件集合 $\mathcal Z_{\mathrm{raw}}$ 的基数与它所替代的 [PHYSC] 嵌入集合相同（均为 $K$），并通过线性适配器进入同一个去噪器。$\tau_\omega$ 与 $\theta$ 从零开始联合训练，学习率 $10^{-4}$，条件丢弃 0.15，$K$ 从 $[100,500]$ 抽取，在 32 块 GPU 上训练 100 个 epoch。由于解码器保持不变，它与 Diffusion + FM 的任何差异都可归因于条件。

**Marginal Prob. + Raw Meas.** 一个 12 层、宽 512、16 头的编码器 $h_\omega$（容量与基础模型编码器匹配，并使用相同的信道与位置 token 化）从零开始在单次原始观测上训练，配 $N^2$ 个可学习位置查询 token（每个网格一个）读出整幅网格的占据：

$$
\widetilde q_{k,i}=\sigma\!\left(h_\omega(\mathbf H_k,\mathbf p_k)_i\right),\qquad
\mathcal L_{\mathrm{naive}}=\frac{1}{N^2}\sum_{i=1}^{N^2}w_{k,i}\,\mathrm{BCE}_\beta(\widetilde q_{k,i},s_i),\quad
w_{k,i}=\begin{cases}3,&i\in\mathfrak a_k,\\1,&\text{其他}.\end{cases}\tag{26}
$$

训练用 AdamW，学习率 $5\times10^{-5}$、权重衰减 $10^{-4}$，每 GPU 32 次观测、共 32 块 GPU，第一个 epoch 线性预热后余弦衰减，梯度范数截断 1.0，训练 32 个 epoch，每个覆盖训练语料的四分之一。逐观测估计用与 Marginal Prob. + FM 相同的规则、即式（24）融合，参数完全一致，因此两个模型只在表征与训练目标上不同，在融合上相同。此处置信度门控失效：式（26）的损失不论观测是否约束某网格都用硬标签监督，相关网格虽被加权，但 $\mathfrak a_k$ 之外的网格仍被推向其占据标签而不是 $1/2$。因此对观测从未感知的网格，信念是自信的、能通过门控并进入平均。此时几何权重成为唯一剩余的筛选，而它反映的是与视距段的邻近程度而非传播相关集合：反射路径会到达远离该线段的网格，靠近线段的网格也未必与链路发生任何作用。

### 附录 J：评价指标（式 27）

对重建 $\widehat{\mathbf s}$ 与真值 $\mathbf s$，令 TP、FP、TN、FN 分别统计四种结果的网格数（以占据网格为正类），报告

$$
\mathrm{BA}=\frac12\left(\frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FN}}+\frac{\mathrm{TN}}{\mathrm{TN}+\mathrm{FP}}\right),\quad
\mathrm{F1}=\frac{2\,\mathrm{TP}}{2\,\mathrm{TP}+\mathrm{FP}+\mathrm{FN}},\quad
\mathrm{IoU}=\frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FP}+\mathrm{FN}}.\tag{27}
$$

平衡准确率对两类等权，因此常数或随机预测器不论占据比例都为 50%，这使它成为机会水平的合适指标；F1 与 IoU 只依赖占据类，对大多数场景中占主导的、被正确预测的自由空间不敏感，因而是更严格的轮廓恢复度量。对单个场景二者满足 $\mathrm{IoU}=\mathrm{F1}/(2-\mathrm{F1})$，但逐场景平均后不再相等，两者都报告以便与先前工作比较。全部指标在整幅 $N\times N$ 网格上逐场景计算，再对 671 个测试场景平均。

### 附录 K：预训练表征的物理解释（图 7）

第 3 节的层次设计基于一个论断：[PHYSC] token 概括的是产生观测的物理结构，而不是作为信号的信道。本附录不依赖重建任务，直接通过考察表征空间本身的几何来检验该论断。

**设置。** 用冻结的基础模型编码一组留出观测，把得到的 [PHYSC] 嵌入用 t-SNE（van der Maaten & Hinton, 2008）投影到二维（保留局部邻域结构）。作为对照，对计算这些嵌入所用的原始信道测量施加完全相同的投影。嵌入中可见而原始信道中不可见的结构，正是预训练目标所引入的结构，因为编码器不会创造信息（第 2.3 节）。作者按三种属性给同一对投影着色，每种属性对应传播问题的不同侧面：用户位置的空间簇、链路的主导传播方向、观测所在环境的身份。

**观察。** 图 7 给出投影结果。在三种着色下，[PHYSC] 嵌入都形成明显比原始信道更清晰的结构，且三者对本工作各有不同含义。

按**用户位置**可分，说明该表征区分链路终止于何处，这是把一次观测所携带的证据放到场景正确位置的前提。按**主导传播方向**可分，说明该表征解开了信道的角度分量——决定一条链路与哪些结构发生作用的出发与到达方向——而不是保留这些分量混合其中的原始叠加。按**场景身份**可分与本工作最直接相关：同一环境中的观测被编码到相近的点，尽管用户位置不同、观测到的信道不同。因此该表征携带的是产生测量的环境信息，而不只是测量本身，这正是来自同一场景的一组嵌入能成为该场景后验的有效条件集合的原因。

**与条件化论证的关系。** 原始信道所含信息不少于由它计算出的嵌入，因此图 7 的对比不是信息含量的对比，而是可获取性的对比。在原始空间中，共享同一环境的观测并不互为近邻，在该空间条件化的解码器必须先学会信道结构到场景结构的映射，才能利用条件；在表征空间中这一结构已经显露。这是第 3 节可学习性论证的几何对应物，也与第 4 节两种条件化方案的表现一致：以原始测量为条件的扩散解码器不随观测累积而改善，而以 [PHYSC] 嵌入为条件的同一解码器则会改善。

### 附录 L：位置信息的可得性（图 8）

每次无线观测表示为信道测量与其对应用户位置 $(\mathbf H_k,\mathbf p_k)$。为评估位置信息不完整的影响，作者把具有位置标签的测量比例从 10% 变到 100%，同时保持每个场景的测量总数固定 $K=500$。图 8 报告相应的平衡准确率。

图 8 的原文读数：除 Diffusion + Raw Meas. 外，所有模型都随位置可得性提高而改善并最终饱和。Diffusion + FM 从 10% 时的 0.56 提高到 100% 时的 0.76；Marginal Prob. + FM 从 0.62 升到 0.74；Marginal Prob. + Raw Meas. 从 0.54 升到 0.62。相反，Diffusion + Raw Meas. 全程维持在 0.50 附近。

位置信息之所以关键，是因为信道测量揭示了传播诱导的几何信息，但本身并不把该信息锚定到场景中的绝对位置。用户位置把传播证据映射到具体的场景网格，使模型能够对每次观测相关的结构作空间定位；因此减少位置可得性会直接减少可用于重建的空间锚定证据。

性能曲线在约一半测量带有位置信息后基本饱和，说明一旦建立足够的空间覆盖，额外的有标签观测收益递减。在低可得性时 Marginal Prob. + FM 一度优于 Diffusion + FM，随着带位置标签的观测增多次序反转。这一表现反映了两种推断机制的不同：边缘概率形式采用显式几何融合规则，在锚定证据稀疏时仍然有效；扩散模型则更受益于足够丰富、能够通过学得后验联合整合的观测集合。

最后，Diffusion + Raw Meas. 在整个扫描区间几乎不变的表现进一步说明，其重建质量差的主要原因不是位置信息不足，而是无法有效利用原始信道测量作为条件信息。

### 附录 M：位置噪声下的鲁棒性（径向误差统计与结果讨论）

附录 L 研究的是部分观测缺失位置标签的情形；部署中另一种非理想情形是每次观测都有位置、但位置不准确。因此作者用扰动后的用户位置 $\widetilde{\mathbf p}_k=\mathbf p_k+\mathbf e_k$、$\mathbf e_k\sim\mathcal N(\mathbf 0,\sigma^2\mathbf I_2)$、每个水平轴 $\sigma=5$ m、逐观测独立抽样，评测全部模型。所有模型都在精确位置上训练，噪声只在测试时施加，每场景 $K=500$ 次观测，其余设置与第 4 节相同。在该模型下径向误差 $\|\mathbf e_k\|$ 服从 Rayleigh 分布，中位数 $\sigma\sqrt{2\ln2}\approx5.9$ m，均值 $\sigma\sqrt{\pi/2}\approx6.3$ m，第 95 百分位约 12.2 m。这一范围与室外城市场景中的消费级 GNSS 水平相当（Merry & Bettinger, 2019；Palathinkal et al., 2026）。逐项数值见上文“表 3：用户位置存在噪声时的完整重建结果”；原文表 3 的题注为：“用户位置含噪（每轴 $\sigma=5$ m，$K=500$）下的重建。括号内为均值相对精确位置（表 1）的相对变化。”

**结果。** 表 3 表明两种自设计流程在位置非理想条件下仍远高于基线。值得注意的是，扩散解码器把每个嵌入都视为关于特定位置的精确证据，训练中从未见过错位证据；当不同观测的证据被移向不同方向时便相互冲突，后验样本在受影响网格上分歧、其边缘概率向 $1/2$ 移动，共识读出随之抑制本可恢复的轮廓。该机制主要移除真阳，这与 F1、IoU 的降幅大于平衡准确率一致。

Diffusion + FM 的敏感性属于训练—测试失配，而不是后验形式的局限，且可以直接处理：可把位置误差／缺失纳入观测模型，用扰动或缺失位置计算出的嵌入训练解码器，同时保持干净占据 $\mathbf s$ 作为目标，解码器便学习到这些条件下的 $p_\theta(\mathbf s\mid\widetilde{\mathcal Z})$；结构与训练目标都不变。作者把该实现留作未来工作。

### 附录 N：全部模型重建的可视化（图 9、10）

图 9 与图 10 分两页给出全部模型的重建结果与真值场景的视觉对比，每行依次为：真值、Diffusion + FM（本文）、Marginal Prob. + FM（本文）、Marginal Prob. + Raw Meas.、Diffusion + Raw Meas.。原文未提供逐场景定量数值；本站不上传图像，仅记录版式与列序。

### 原文的生成式 AI 使用声明与可复现性声明

**生成式 AI 使用声明（原文 AIUSE STATEMENT）。** 作者把生成式 AI 工具用作通用写作与编码助手：用于润色作者起草的文字，以及协助实现实验与作图脚本。作者没有用生成式 AI 工具做研究构思、推导理论结果，也没有用于检索或综述相关工作。全部 AI 辅助输出都经作者审查：文本与底层结果逐项核对，AI 辅助代码均被阅读、执行并按报告数值验证，理论论断及其假设与证明由作者推导与检查。作者对本工作的最终内容负责，包括借助生成式 AI 产出的所有文本、论断与产物。

**可复现性声明（原文 REPRODUCIBILITY STATEMENT）。** 作者力求每个环节可复现。问题表述、各理论论断的假设与命题的完整证明见附录 B、F；数据集构建（仿真配置、占据网格推导、传播相关集合提取）见附录 A、G；基础模型的结构与 token 化细节见附录 C，完整预训练目标见附录 D；扩散解码器、噪声日程与采样器见附录 E；所提流程、消融变体与两个基线的完整训练配置（优化器、学习率、日程、批大小、硬件）见附录 G、H、I；评价指标定义见附录 J；评测协议（包括测量扫描中如何抽取观测子集）见附录 G。训练与评测源码、预训练数据集与检查点将在论文发表时提供。

## 参考文献

原文采用作者—年份（author–year）引用制，参考文献表**未编号**。以下按原文顺序逐条转录英文原条目并加序号，便于站内引用核对（共 29 条，源文 pp. 10–12）。

[1] Ian F Akyildiz, Ahan Kak, and Shuai Nie. 6G and beyond: The future of wireless communications systems. IEEE Access, 8:133995–134030, 2020.

[2] Anatoly Bakushinsky and A Goncharsky. Ill-posed problems: theory and applications. Springer Science & Business Media, 2012.

[3] David Borts, Julian Ost, Shamik Basu, Tim Broedermann, Andrea Ramazzina, Christos Sakaridis, Mario Bijelic, and Felix Heide. Carafe: Camera-radar radiance fields for scene reconstruction. In Proceedings of the Special Interest Group on Computer Graphics and Interactive Techniques Conference Papers, pp. 1–12, 2026.

[4] Eugene Casmin and Rodolfo Oliveira. Survey on context-aware radio frequency-based sensing. Sensors, 25(3):602, 2025.

[5] Umut Demirhan and Ahmed Alkhateeb. Integrated sensing and communication for 6G: Ten key machine learning roles. IEEE Communications Magazine, 61(5):113–119, 2023.

[6] Laura Dodds, Maisy Lam, Waleed Akbar, Yibo Cheng, and Fadel Adib. Wave-former: Through-occlusion 3D reconstruction via wireless shape completion. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pp. 21713–21724, 2026.

[7] Ivan Dokmanić, Reza Parhizkar, Andreas Walther, Yue M Lu, and Martin Vetterli. Acoustic echoes reveal room shape. Proceedings of the National Academy of Sciences, 110(30):12186–12191, 2013.

[8] Yara El Baba, Andreas Walther, and Emanuël A P Habets. 3D room geometry inference based on room impulse response stacks. IEEE/ACM Transactions on Audio, Speech, and Language Processing, 26(5):857–872, 2018.

[9] Thomas Hehn, Markus Peschl, Tribhuvanesh Orekondy, Arash Behboodi, and Johann Brehmer. Differentiable and learnable wireless simulation with geometric transformers. In International Conference on Learning Representations (ICLR), 2025.

[10] Jonathan Ho, Ajay Jain, and Pieter Abbeel. Denoising diffusion probabilistic models. In Advances in Neural Information Processing Systems, volume 33, 2020.

[11] Jakob Hoydis, Fayçal Aït Aoudia, Sebastian Cammerer, Merlin Nimier-David, Nikolaus Binder, Guillermo Marcus, and Alexander Keller. Sionna RT: Differentiable ray tracing for radio propagation modeling. In IEEE Globecom Workshops (GC Wkshps), pp. 317–321, 2023.

[12] Haowen Lai, Zitong Lan, and Mingmin Zhao. Non-line-of-sight 3D reconstruction with radar. Advances in Neural Information Processing Systems, 38:72844–72869, 2026.

[13] Yiming Li, Zeyu Li, Zhihui Gao, and Tingjun Chen. Geo2SigMap: High-fidelity RF signal mapping using geographic databases. In IEEE International Symposium on Dynamic Spectrum Access Networks (DySPAN), pp. 277–285, 2024.

[14] Chris Xiaoxuan Lu, Stefano Rosa, Peijun Zhao, Bing Wang, Changhao Chen, John A Stankovic, Niki Trigoni, and Andrew Markham. See through smoke: Robust indoor mapping with low-cost mmWave radar. In Proceedings of the International Conference on Mobile Systems, Applications, and Services (MobiSys), pp. 14–27, 2020.

[15] Laurens van der Maaten and Geoffrey Hinton. Visualizing data using t-SNE. Journal of Machine Learning Research, pp. 2579–2605, 2008.

[16] Krista Merry and Pete Bettinger. Smartphone GPS accuracy study in an urban environment. PloS One, 14(7):e0219890, 2019.

[17] Alexander Quinn Nichol and Prafulla Dhariwal. Improved denoising diffusion probabilistic models. In International Conference on Machine Learning (ICML), pp. 8162–8171, 2021.

[18] OpenStreetMap contributors. OpenStreetMap. https://www.openstreetmap.org, 2023.

[19] Joshua Roy Palathinkal, Hardani Ismu Nabil, Muhammad Iqbal Rochman, Hossein Nasiri, Francis A Gatsi, and Monisha Ghosh. Evaluating smartphone GNSS accuracy for geofenced 6 GHz operations. In 2026 IEEE International Symposium on Spectrum Innovation (DySPAN), pp. 1–6. IEEE, 2026.

[20] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, et al. Learning transferable visual models from natural language supervision. In International Conference on Machine Learning, pp. 8748–8763. PMLR, 2021.

[21] Aditya Ramesh, Prafulla Dhariwal, Alex Nichol, Casey Chu, and Mark Chen. Hierarchical text-conditional image generation with CLIP latents. arXiv preprint arXiv:2204.06125, 2022.

[22] Yifei Sun, Jie Li, Tong Zhang, Rui Wang, Xiaohui Peng, Xiao Han, and Haisheng Tan. An indoor environment sensing and localization system via mmWave phased array. Journal of Communications and Information Networks, 7(4):383–393, 2022.

[23] Paolo Testolina, Michele Polese, Pedram Johari, and Tommaso Melodia. Boston Twin: The Boston digital twin for ray-tracing in 6G networks. In Proceedings of the ACM Multimedia Systems Conference (MMSys), pp. 441–447, 2024.

[24] Jiacheng Wang, Hongyang Du, Dusit Niyato, Jiawen Kang, Shuguang Cui, Xuemin Shen, and Ping Zhang. Generative AI for integrated sensing and communication: Insights from the physical layer perspective. IEEE Wireless Communications, 31(5):246–255, 2024.

[25] Inmo Yeon and Jung-Woo Choi. RGI-Net: 3D room geometry inference from room impulse responses with hidden first-order reflections. In IEEE International Workshop on Acoustic Signal Enhancement (IWAENC), pp. 439–443, 2024.

[26] Inmo Yeon, Iljoo Jeong, Seungchul Lee, and Jung-Woo Choi. EchoScan: Scanning complex room geometries via acoustic echoes. IEEE/ACM Transactions on Audio, Speech, and Language Processing, 2024.

[27] Mingmin Zhao, Tianhong Li, Mohammad Abu Alsheikh, Yonglong Tian, Hang Zhao, Antonio Torralba, and Dina Katabi. Through-wall human pose estimation using radio signals. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 7356–7365, 2018.

[28] Xiaopeng Zhao, Zhenlin An, Qingrui Pan, and Lei Yang. NeRF²: Neural radio-frequency radiance fields. In Proceedings of the Annual International Conference on Mobile Computing and Networking (MobiCom), 2023.

[29] Kaichen Zhou, Laura Dodds, Sayed Saad Afzal, and Fadel Adib. RISE: Single static radar-based indoor scene understanding. arXiv preprint arXiv:2511.14019, 2025.

## 范围与校对状态

原文附录 A–N 包含阵列模型、不可辨识性证明、基础模型结构与 token 化、预训练目标、扩散实现、共识命题的完整证明、数据集与训练配置、边际概率变体与基线细节、指标定义、表征物理解释、位置信息实验，以及全部模型的重建可视化。本页此前已补入题头、第 1—5 节、式（1）—（18）与表 1—3；本轮补译的是：命题 1 的下界说明与 B.2／B.3 的“交互序列混叠”“占据不等于遮挡”讨论；附录 C、E、G、H（式 22–24）、I（式 25–26）、J（式 27）、K（图 7）、L（图 8）、M（表 3 的统计口径与讨论）、N（图 9–10）的正文；附录 D 的预训练解码器说明；F.1／F.2 的完整证明（定义 1、假设 A1–A4、式 19–21）；原文的生成式 AI 使用声明与可复现性声明；以及全部 29 条参考文献（英文原条目、按原文顺序编号）。引用源文页码：pp. 10–24（其中书目 pp. 10–12，附录 A–F 为 pp. 12–18，附录 G–N 为 pp. 18–24）。

尚余：① 与源 PDF 的逐句逐式终校（本轮为依据抽取文本的补译，未做第二轮人工校对）；② 图 1–10 的原始图像未转录（站点不上传图像，仅保留中文图注与关键数值）；③ 附录 K 的 t-SNE 图与附录 N 的 10 组对比图无法以文字复现，仅记录版式；④ 个别上下标（如 $N_{\mathrm{tx}}$、$\mathcal A$）在 PDF 抽取中可能失真，已按上下文统一记号。**因此本页仍标记为“校对中”，不声明已通过全文验收。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原论文结构）已录入；页内“未完成/待终校”等提示指逐句逐式终校程度，不表示覆盖缺失，保留为历史记录。

{% endraw %}
