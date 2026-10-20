---
layout: page
title: "PHOENIX：基于物理表征与扩散后验推断的无线场景重建｜中文译稿（校对中）"
permalink: /papers/translations/2026-10-20-wireless-scene-reconstruction-2610-22120/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [arXiv 原文](https://arxiv.org/abs/2610.22120)

# 利用无处不在的无线信号，通过物理约束表征上的扩散后验推断重建场景

**原题：** Scene Reconstruction Using Ubiquitous Wireless Signals via Diffusion Posterior Inference over Physics-Grounded Representations  
**作者：** Vahid Yazdnian、Yasaman Ghasempour（普林斯顿大学）  
**版本：** arXiv:2610.22120v1，2026 年 10 月 15 日，共 24 页。  
**译文状态：** 正文 1–5 节、核心数学定义及主要实验结论已译。附录 A–N、参考文献及部分原始数据未完成逐项翻译与验收。**本稿不是已通过 QA 的完整全文译文**。

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

$
\mathfrak a_k=\{i:\mathrm{cell}_i\cap\ell\ne\varnothing
\text{，其中 }\ell\in\mathcal P(\mathbf s,\mathbf p_k)\},
\qquad\mathcal A=\bigcup_{k=1}^{K}\mathfrak a_k.\tag{7}
$

**命题 1：相容场景集合的基数。** 令 $\mathbf s^\star$ 为真实场景，$\mathcal S_k(\mathbf H_k)=\{\mathbf s:\mathcal F(\mathbf s,\mathbf p_k)=\mathbf H_k\}$ 为产生同一无噪信道的所有可能场景，则

$
|\mathcal S_k(\mathbf H_k)|\ge 2^{|\mathfrak a_k^c|}.
$

证明思路是：按传播相关集合的定义，$\mathfrak a_k^c$ 中的网格不影响任何产生当前观测的路径，所以任意翻转这些网格的占用状态都会产生相同信道。不同翻转子集共有 $2^{|\mathfrak a_k^c|}$ 个。对所有链路联合后得到下界 $|\mathcal S(\mathcal O)|\ge2^{|\mathcal A^c|}$。这只是未观测网格造成的不可辨识性；在可观测集合内仍可能存在其他歧义。

有限带宽 $B$ 对应时延分辨率 $\Delta\tau=1/B$；具有 $N_{\rm tx}$ 个单元的阵列孔径对应角度分辨率近似 $\Delta\theta\approx2/N_{\rm tx}$。当两个场景生成的路径参数在这些分辨率限制内不可区分时，存在原文式（8）的近似等价关系

$
\{(\tau_\ell,\theta_\ell,\phi_\ell,\alpha_\ell)\}_{\mathbf s}
\equiv
\{(\tau_\ell,\theta_\ell,\phi_\ell,\alpha_\ell)\}_{\mathbf s'}
\quad\text{在 }(\Delta\tau,\Delta\theta)\text{ 分辨率下}.\tag{8}
$

**命题 2：传播等价场景不可区分。** 如果 $\mathcal P(\mathbf s,\mathbf p_k)$ 与 $\mathcal P(\mathbf s',\mathbf p_k)$ 的各路径参数均相同，则 $\mathcal F(\mathbf s,\mathbf p_k)=\mathcal F(\mathbf s',\mathbf p_k)$，无论带宽或阵列孔径如何，单凭这条观测都无法区分两个场景。网格 $i$ 对链路 $k$ 的传播作用记为

$
\rho_k(i)=\rho(i,\mathbf p_k,\mathbf s)
\in\{\mathrm{block},\mathrm{reflect},\mathrm{free},\mathrm{none}\}.\tag{9}
$

四个值依次代表阻挡、反射或绕射、被有效路径穿越的自由空间，以及不参与也不阻挡有效路径。注意 $\rho_k(i)$ 取决于链路几何，不只是网格自身的占用状态。

### 附录 F：共识读出的采样误差界

**命题 3。** 令 $\widehat{\mathbf s}^{(1)},\dots,\widehat{\mathbf s}^{(M)}$ 为从学习后验 $p_\theta(\cdot\mid\mathcal Z)$ 独立抽取的二值占用样本，令 $\pi_i^\theta=p_\theta(s_i=1\mid\mathcal Z)$。逐网格后验概率估计 $\widehat\pi_i$ 满足 Hoeffding 不等式：

$
\Pr\!\left(|\widehat\pi_i-\pi_i^\theta|\ge\varepsilon\right)
\le 2\exp(-2M\varepsilon^2).\tag{17}
$

因此当 $\pi_i^\theta\ne1/2$ 时，共识估计与逐网格贝叶斯最优 0–1 损失决策不同的概率满足

$
\Pr\!\left[
\widehat s_i^{\mathrm{cons}}\ne
\mathbf1[\pi_i^\theta>1/2]\right]
\le2\exp\!\left[-2M\left(\pi_i^\theta-\frac12\right)^2\right].\tag{18}
$

并且 $\widehat\pi_i(1-\widehat\pi_i)\to\operatorname{Var}_\theta(s_i\mid\mathcal Z)$。上述结果要求样本独立且来自学得后验；它说明样本共识能稳定估计**模型自身**的边缘占用概率，并不自动证明模型后验等于真实后验。

**命题 4。** 在模型正确设定、表征 $\mathcal Z$ 对后验充分、各观测在给定真实场景条件下相互独立等假设下，对于 $i\notin\mathcal A$，后验边缘等于条件先验，新增观测不会直接降低该网格的不确定性；对 $i\in\mathcal A$，设 $n_i$ 为能够区分真实场景与该网格状态相反的候选场景的观测数，则其正确恢复概率随着 $n_i$ 增加而提高。该命题是带条件的极限论断，不是针对任何网络的无条件准确率保证。

### 附录 A、B.4 与 D：传播阵列模型、联合似然和完整预训练损失（式 6、10–16）

**附录 A：均匀线阵的空间响应（式 6）。** 对阵元间距为 $d$、波长为 $\lambda$、包含 $N$ 个阵元的均匀线阵，其方向响应为

$
\mathbf a(\vartheta)=
\left[
1,\
e^{-j\frac{2\pi d}{\lambda}\sin\vartheta},\
\ldots,\
e^{-j\frac{2\pi d(N-1)}{\lambda}\sin\vartheta}
\right]^{T}.\tag{6}
$

把该响应代入正文式（1）的传播路径求和式，即可得到每一收发天线对和子载波的信道系数；对带宽 $B$ 的时延分辨率近似为 $\Delta\tau=1/B$，对阵元数量 $N_{\mathrm{tx}}$ 的阵列，主视轴附近的角分辨率近似为 $\Delta\theta\approx2/N_{\mathrm{tx}}$。

**附录 B.4：条件独立观测的联合后验（式 10）。** 如果已知场景 $\mathbf s$ 时，不同用户的信道测量条件独立，那么多次观测的联合后验为

$
p(\mathbf s\mid\mathcal O)\propto
p(\mathbf s)\prod_{k=1}^{K}p(\mathbf H_k\mid\mathbf s).\tag{10}
$

增加观测使各条链路相容场景集合求交，从而收缩后验，但未被任何链路传播触及的网格仍具有非唯一性。

**附录 D：基础模型的物理引导预训练目标（式 11–16）。** 首先，对被掩蔽的信道 token 集合 $\mathcal M_{\mathrm{ch}}$，计算重建误差：

$
\mathcal L_{\mathrm{ch}}=
\frac{1}{|\mathcal M_{\mathrm{ch}}|}
\sum_{i\in\mathcal M_{\mathrm{ch}}}
\|\widehat{\mathbf h}_i-\mathbf h_i\|_2^2.\tag{11}
$

场景掩蔽只选择参与该链路传播的网格块 $\mathcal M_{\mathrm{scn}}\subseteq\mathfrak a_k$，并对二值占用标签 $o_i$ 应用交叉熵：

$
\mathcal L_{\mathrm{scn}}=
-\frac1{|\mathcal M_{\mathrm{scn}}|}
\sum_{i\in\mathcal M_{\mathrm{scn}}}
\left[o_i\log\widehat o_i+
(1-o_i)\log(1-\widehat o_i)\right].\tag{12}
$

接收机位置的掩蔽重建损失 $\mathcal L_{\mathrm{loc}}$ 由预测位置与真实位置的均方根误差定义，原文没有单独编号。

对发射与接收阵列方向 $\Psi\in\{\mathrm{tx},\mathrm{rx}\}$，由 CSI 在相应天线方向上的复响应 $\mathbf H_n^{(\Psi)}$ 的 DFT 构造方向空间谱：

$
s_\Psi[b]=
\left|
\sum_{n=0}^{N_\Psi-1}
H_n^{(\Psi)}e^{-j2\pi nb/N_\Psi}
\right|^2,\qquad
\Psi\in\{\mathrm{tx},\mathrm{rx}\}.\tag{13}
$

使用 Kullback–Leibler 散度对齐空间谱峰值，同时使用均方误差保持相对强度：

$
\mathcal L_\Psi=
D_{\mathrm{KL}}\!\left(
\operatorname{softmax}(\mathbf s_\Psi)
\parallel
\operatorname{softmax}(\widehat{\mathbf s}_\Psi)
\right)+
\lambda_{\mathrm{MSE}}
\operatorname{MSE}(\widehat{\mathbf s}_\Psi,\mathbf s_\Psi).\tag{14}
$

这里 $\lambda_{\mathrm{MSE}}$ 是对原文 $\lambda$ 的语义化下标标注，不改变其含义。为使 PHYSC token 与传播相关场景块特征对齐，定义对比损失：

$
\mathcal L_{\mathrm{con}}=
-\frac1N\sum_{i=1}^{N}
\log\frac{
\exp(\mathbf z_i^{\mathrm{physc}}\cdot
\mathbf z_i^{\mathrm{scn}}/\tau)}
{\displaystyle\sum_{j=1}^{N}
w_{ij}\exp(\mathbf z_i^{\mathrm{physc}}\cdot
\mathbf z_j^{\mathrm{scn}}/\tau)}.\tag{15}
$

其中 $\tau$ 是对比温度，$w_{ij}\in(0,1]$ 降低位置接近链路作为负样本的权重，以免惩罚实际拥有相似传播几何的样本。

合并各预训练项目，得完整目标

$
\mathcal L_{\mathrm{pre}}=
\lambda_{\mathrm{ch}}\mathcal L_{\mathrm{ch}}+
\lambda_{\mathrm{scn}}\mathcal L_{\mathrm{scn}}+
\lambda_{\mathrm{loc}}\mathcal L_{\mathrm{loc}}+
\lambda_{\mathrm{spec}}
(\mathcal L_{\mathrm{tx}}+\mathcal L_{\mathrm{rx}})+
\lambda_{\mathrm{con}}\mathcal L_{\mathrm{con}}.\tag{16}
$

以上重建模块只用于第一阶段基础模型的自监督预训练，预训练完成后舍弃；第二阶段使用冻结的 PHYSC 条件表征训练场景后验扩散模型。

## 待校对的附录与参考文献

原文附录 A–N 包括阵列模型、逆问题歧义的数学描述、PHOENIX 架构与预训练损失、扩散实现细节、共识理论证明和更多实验配置。**这些附录的长证明、全部参考文献、表 1–2 的非均值统计及更多图表尚未完整转写；因此本页面不应被标记为全文完成。**

{% endraw %}
