---
layout: page
title: "BeamRMX：辐射方向图驱动的可泛化波束学习｜中文全文译文"
permalink: /papers/translations/2026-09-18-2609-00615-beamrmx-radiation-pattern-driven-learning-for-generalizable-beam-radio/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b0c122a090867595/) · [原文 arXiv](https://arxiv.org/abs/2609.00615) · [全部目录](/papers/catalog/)

# BeamRMX：辐射方向图驱动的可泛化波束学习

**原题：** BeamRMX: Radiation-Pattern-Driven Learning for Generalizable Beam Radio Map Prediction and Beam Management  
**作者：** Yue Zhang（张越，Student Member, IEEE）、Xiucheng Wang（王熙成，Graduate Student Member, IEEE）、Wenshuo Chen（陈文硕，Student Member, IEEE）、Nan Cheng（承楠，Senior Member, IEEE）  
**单位：** 西安电子科技大学 ISN 国家重点实验室与通信工程学院（西安 710071）；香港科技大学（广州）（广州 511453）。通讯作者：承楠。  
**版本：** arXiv:2609.00615v1（eess.SP），v1 日期 2026 年 9 月 1 日；原文 13 页。  
**原文信息核对：** PDF 页首 arXiv 戳为 "arXiv:2609.00615v1 [eess.SP] 1 Sep 2026"，与库内登记编号 2609.00615 一致；首页脚注给出国家重点研发计划（2024YFB907500）资助信息；代码见 https://github.com/ZY021023/BeamRMX-code。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I–VI 节正文与编号小节、图 1–4 中文图注（含子图 a/b）、表 I–IV 逐格转写、问题 1、式 (1)–(31)，以及参考文献 34 条英文原条目（按原编号）。逐句逐式终校未做。

## 摘要

面向第六代（6G）无线网络的演进正推动更大规模天线阵列与高度定向的多波束传输，使精确掌握波束相关的空间覆盖对波束管理与环境感知网络运行变得重要。无线电图（radio map，RM）提供了此类表示，但传统 RM 预测假设全向或发射机级辐射。在波束赋形多输入多输出（MIMO）系统中，同一传播场景会产生许多依赖配置的波束无线电图（beam radio map，BeamRM），给波束表示与泛化带来挑战。现有方法要么把预测条件化于波束描述符，要么把波束图作为通用架构的辅助输入。我们提出 BeamRMX——据我们所知，这是首个把空间辐射方向图作为主要 BeamRM 查询、并学习场景几何如何把它变换为接收功率场的专用框架。XBase 学习辐射查询与场景几何之间的多尺度交互，而可选的 Evidence Adapter 使用来自同一场景的少量跨配置 BeamRM。匹配域与零样本实验相对确定性基线与扩散基线均取得一致增益，包括在未见场景上平均绝对误差降低 26.1%、在未见配置上降低 47.8%。跨配置证据进一步改善重建与扇区内波束细化。代码见 https://github.com/ZY021023/BeamRMX-code。

**索引词：** 波束无线电图、无线电图预测、XL-MIMO、空间激励、场景泛化、跨配置证据、波束管理。

## I. 引言

面向第六代（6G）无线网络的演进正推动更宽频段、更大天线阵列与日益定向的多波束传输 [1]–[7]。波束赋形虽带来可观的阵列增益与空间选择性，却也使由此形成的无线环境强烈依赖激活波束与无线配置。波束赋形状态决定发送辐射方向图，但并不直接揭示其与传播环境相互作用后的接收功率分布。因此，精确掌握这种波束相关的空间无线条件，不仅对波束管理重要，也对覆盖评估、网络规划与其他环境感知无线功能重要。

无线电图（RM）通过把地理位置与接收信号特征关联起来，为空间无线条件提供了自然表示 [8]–[10]。现有 RM 预测方法已取得实质进展，但多数假设全向或发射机级辐射，此时一个传播场景对应一个基本固定的空间响应 [11]–[14]。该假设在波束赋形多输入多输出（MIMO）系统中不再成立。即便对同一发射机与环境，不同载频、阵列配置与波束赋形状态也会产生显著不同的接收功率场，如图 1 所示。我们把这类依赖配置的空间响应称为**波束无线电图**（BeamRM）。

尽管基于学习的 RM 预测已取得实质进展，针对 BeamRM 预测的专门工作仍有限。近期研究已开始对波束相关空间响应建模，但如何把目标波束表示给预测器仍是核心问题。BeamCKM 通过依赖码本的波束表示进行波束感知信道图构建，BeamCKMDiff 则把条件变量扩展到连续波束赋形向量 [15], [16]。前者通过预定义波束标识区分辐射状态，后者给出波束赋形状态的连续描述。然而两种情形下，波束主要在参数域表示，网络仍需推断相应辐射方向图如何分布在预测区域上。当预测必须跨越大不同于训练中所见的波束状态、码本或阵列配置时，这种对波束特定参数化的依赖会越来越受限。

近来引入的**波束图**通过把每种无线配置对应的辐射方向图解析投影到预测区域，提供了更显式的表示 [13]。在原始的极大规模 MIMO（XL-MIMO）基准中，波束图作为物理信息空间特征提供给现有预测器。BeamRMX 进一步把该空间辐射表示用作 BeamRM 预测的主要查询，而非辅助输入。由此，波束索引、波束赋形向量、码本与阵列配置都在学习传播之前被表达在共同的空间域中。该表示取决于最终空间辐射方向图，而非用于生成它的具体参数，从而为跨异构波束与阵列配置的预测提供了更合适的基础。

把波束查询空间化还暴露出现有方法的第二个缺口。空间辐射方向图规定功率如何被发射向环境，而场景几何决定该功率如何被阻挡、衰减与再分布。使用波束图的现有基准主要把这两类信息源拼接，并依赖通用预测架构隐式学习其交互 [13]。因此，尽管波束图缩小了表示差距，仍需要专门的学习方法对传播场景如何把指定辐射方向图变换为接收功率场建模。BeamRMX 通过其完整的仅查询预测器 XBase 弥合该缺口：它分别编码空间辐射查询与场景几何，并学习二者的多尺度交互。据我们所知，XBase 是首个针对该表述专门设计的架构。

当新部署没有可用无线观测时，仅查询预测至关重要。然而实践中，新的目标配置很少出现在完全未被观测的环境中。随着阵列变大、波束变窄，刻画一个部署所需的波束状态数大幅增加，使逐波束穷举测量或反复高保真仿真成本日益高昂。同时，无线网络是渐进演化的，而非推倒重建。在引入高频、大阵列或窄波束配置之前，同一区域可能已在旧频段、较小阵列或较宽波束配置下被刻画过。早期部署阶段积累的测量、仿真与历史 BeamRM 因而构成预测新配置的潜在有价值信息来源。

来自目标场景的源 BeamRM 包含关于场景相关阻挡、衰减与多径的已实现信息。然而它们并非目标 BeamRM 的稀疏观测，因为每张源图对应不同的空间激励，无法直接复制或插值到目标场中。因此源辅助问题在于：提取跨配置共享的传播信息，并用它降低仅查询预测的不确定性，而不观测目标 BeamRM、也不在推理时更新模型参数。

BeamRMX 用可选的 Evidence Adapter 应对该设定。当源 BeamRM 不可用时，XBase 作为完整的仅查询预测器运行。当同一场景的少量源 BeamRM 可用时，适配器把它们与其对应的源激励一起解释，并利用可迁移的跨配置证据细化冻结的 XBase 预测。目标配置被排除在支持集之外，推理期间既不需要目标 BeamRM 观测，也不需要参数更新。本文主要贡献总结如下。

1) **空间激励条件化的 BeamRM 预测表述：** 在波束图表示的基础上，我们把空间激励从辅助的阵列条件化特征提升为 BeamRM 查询的主要表示。这把异构波束与配置状态置于共同的空问查询域，并把 BeamRM 预测重新表述为学习传播场景如何把指定激励场变换为已实现接收功率场，而非要求预测器从依赖配置的描述符中隐式推断空间辐射。由于该表述取决于空间辐射本身而非其特定参数化，原则上可超越固定码本与阵列波束赋形，扩展到其他可空间表示的辐射源方向图。
2) **首个面向空间激励条件化 BeamRM 学习的专用架构：** 据我们所知，XBase 是首个围绕该"激励到场"表述显式设计的专用学习架构。它保持空间激励与场景几何的独立表示，并学习二者的结构化交互，而非依赖通用波束条件化或输入拼接。所提方法在匹配域、场景不相交与配置不相交协议下系统评估，以考察学习有效性与仅查询泛化性。
3) **面向渐进网络演化的源辅助 BeamRM 预测：** 我们引入 Evidence Adapter，利用来自旧式或低复杂度无线配置的少量同场景 BeamRM，作为未观测目标 BeamRM 的跨配置传播证据。适配器在保留精确的仅查询路径的同时细化冻结的仅查询预测，且既不需要目标 BeamRM 观测，也不需要测试时参数更新。在 strict-small 协议下的评估表明，有限的历史无线信息可显著改善未见场景中的 BeamRM 预测，并增强下游扇区内波束细化。

本文其余部分组织如下：第 II 节回顾相关工作，第 III 节表述仅查询与源辅助 BeamRM 预测问题，第 IV 节给出所提 BeamRMX 框架，第 V 节报告实验结果与讨论，最后第 VI 节总结全文。

> **图 1（原文 Fig. 1）：** BeamRM 概念：同一传播场景把不同波束赋形引起的辐射方向图变换为不同的接收功率图。

## II. 相关工作

本节回顾基于学习的无线电图预测、波束感知表示以及借助辅助无线证据的泛化。

### A. 基于学习的无线电图预测

代表性方法包括几何条件化的编码器–解码器网络、对抗模型、图神经网络与扩散式预测器 [11], [12], [17], [18]。扩散式 RM 预测建立在去噪扩散概率建模之上 [19]，而近期物理信息变体把传播相关约束纳入生成式重建 [20]。传播感知学习也已通过显式利用环境语义与几何相关传播结构得到探索 [21]。公开数据集与基准挑战进一步推动了基于学习的无线电图预测的标准化评估 [22]。

这些方法确立了基于学习的预测作为反复测量或射线追踪的高效替代。然而多数方法针对全向或弱定向假设下的发射机级无线电图。它们的主要任务因此是学习环境到覆盖的映射，而波束产生的、依赖配置的空间激励或被省略，或仅通过辅助参数表示。直接用于 BeamRM 预测，便会把波束相关辐射行为的相当一部分留给模型从训练数据中推断。

### B. 波束感知无线电图预测中的波束表示

更广泛地，信道知识图（CKM）为环境感知通信提供站点特定的信道相关信息表示 [23]。已有工作通过天线方向图投影、波束标识与配置描述符把方向信息纳入无线电图与信道图预测器。阵元方向图或定向增益投影比各向同性发射机模型更显式地暴露空间指向性 [24]，但一般不能刻画阵列几何、相干波束赋形与载频的联合效应。

BeamCKM 通过依赖码本的波束条件化表示不同辐射状态 [15]。这种表示可区分预定义波束族内的波束，但不能显式描述每个波束如何照射预测区域。BeamCKMDiff 进一步用连续波束赋形向量条件化替代离散波束标识 [16]，给出更丰富的辐射状态描述。然而波束赋形向量仍是全局描述符，预测器仍须推断底层阵列与波束赋形参数如何转化为空间辐射方向图。因此这些方法主要在参数域而非传播发生的空间域表示波束。

波束图表示通过把依赖配置的辐射解析转换为预测区域上的空间特征来弥合该缺口 [13]。它在引入环境相关阻挡与多径之前，提供了显式的网格对齐辐射先验。原始多配置基准主要通过特征拼接把波束图纳入现有预测器，并展示其相对标量配置编码的明显优势，包括在跨配置与跨环境评估下。

这些研究主要确立了应向 BeamRM 预测器提供何种方向信息，尚未充分回答应如何处理该信息。纳入波束图的现有模型大多沿用通用图像到图像架构，并把空间激励与环境信息放在同一特征流中，尽管前者规定呈现给环境的辐射、后者决定该辐射如何被变换。这在空间波束表示与场景条件化"激励到场"变换的专门学习之间留下了明显的方法论缺口。

### C. 泛化与无线证据辅助预测

BeamRM 泛化涉及两类互补的分布偏移。场景不相交评估测试对未见地理布局的迁移，而跨配置评估改变呈现给环境的频率、天线、辐射方向图或波束条件。已有研究在不同协议下考察了跨环境预测、跨频迁移、天线方向图变化与跨波束泛化 [13], [15], [16], [18]。能跨场景迁移的模型未必能泛化到未见辐射条件，反之亦然。

辅助无线信息也被用于改进无线电图构建。稀疏重建方法假设目标图的一个子集被直接观测 [17], [18], [25]–[28]，而少样本迁移与测试时自适应则用有限目标域信息专门化预测器 [29], [30]。BeamCKM 进一步引入 M3ChanNet，利用环境剖面与实时多波束观测作为波束感知图构建的边信息 [15]。这些方法展示了纳入额外无线信息的价值，但与本文考虑的源辅助设定不同。我们的支持集由同一场景中其他无线配置的少量 BeamRM 组成，而目标配置的同场景 BeamRM 未被观测。稀疏目标观测与跨配置源 BeamRM 都可能提供无线证据，但其语义根本不同：前者直接对目标场采样；后者描述同一环境如何变换了其他空间激励。同样，与少样本或测试时参数自适应不同，本文考虑的源辅助设定把这种跨配置响应用作前馈证据，而不更新模型参数。因此合适的预测器必须保留可靠的仅查询路径、仅从源图中提取可迁移的场景信息，并避免把源响应当作目标 BeamRM 的直接替代。

先前工作分别推进了基于几何的 RM 预测、波束表示与辅助无线信息的利用。可泛化的 BeamRM 预测需要把这些要素结合起来：异构辐射条件需要共同的空间表示，该激励的场景相关变换必须被学习，而源 BeamRM 必须在不观测、也不对目标 BeamRM 优化的前提下被利用。这些要求促成了本文考虑的表述。

## III. 问题建模

我们把 BeamRM 预测表述为分离三种信息角色：目标空间激励、传播场景，以及来自其他配置的可选同场景无线证据。前两者定义仅查询预测，第三者支持源辅助预测。

### A. 以空间激励为条件的 BeamRM 预测

考虑传播场景 $s\in\mathcal S$，它在 $H\times W$ 空间区域上表示为

$$
\mathbf G_s\in\mathbb R^{C_g\times H\times W}, \tag{1}
$$

其中 $\mathbf G_s$ 包含预测器可用的环境信息。令 $\Omega_s$ 表示相应的空间评估网格，包括其相对发射机的坐标配准。

目标辐射查询记为 $q=(c,\rho)$，其中 $c$ 指定底层无线配置（如载频、阵列架构与天线特性），$\rho$ 指定定向辐射状态（如波束赋形或指向状态）。沿用 [13] 的波束图表述，它在 $\Omega_s$ 上的原始波束图可确定性计算为

$$
\mathbf B_{\Omega_s,q}=\Psi_{\mathrm{beam}}(q;\Omega_s)\in\mathbb R^{H\times W}. \tag{2}
$$

下标 $s$ 只反映评估网格及其相对发射机的配准，而非场景相关传播。一旦 $q$ 与 $\Omega_s$ 固定，波束图不含任何场景相关阻挡或多径信息。下文记 $\mathbf B_{s,q}\equiv\mathbf B_{\Omega_s,q}$。

可输入模型的空间激励构造为

$$
\mathbf E_{s,q}=\phi_{\mathrm{exc}}\left(\mathbf B_{s,q};\Omega_s\right)\in\mathbb R^{C_e\times H\times W}, \tag{3}
$$

其中 $\phi_{\mathrm{exc}}(\cdot)$ 把波束图与相对发射机的空间线索结合。因此 $\mathbf E_{s,q}$ 是目标辐射状态的空间表示。在仅查询路径中，无线查询 $q$ 通过波束图 $\mathbf B_{s,q}$ 影响预测，不向 XBase 提供单独的查询嵌入。

目标 BeamRM 及其有效区域掩码记为

$$
\mathbf Y_{s,q}\in\mathbb R^{H\times W},\qquad \mathbf M_{s,q}\in\{0,1\}^{H\times W}, \tag{4}
$$

其中 $\mathbf Y_{s,q}$ 是对应接收功率场，$\mathbf M_{s,q}$ 标识用于监督与评估的有效像素。掩码本身不作为目标侧无线证据。

对固定场景，不同辐射查询产生不同空间激励，从而产生不同 BeamRM。我们把底层传播过程表示为

$$
\mathbf Y_{s,q}=\mathcal T_s\left(\mathbf E_{s,q}\right), \tag{5}
$$

其中 $\mathcal T_s$ 表示未知的场景条件化传播变换。因此 BeamRM 预测被表述为学习场景如何把指定空间激励变换为相应接收功率场，而非直接把配置描述符与输出图关联。

### B. 仅查询泛化情形

没有同场景无线证据时，预测按下式进行

$$
\widehat{\mathbf Y}_{s,q}^{0}=\mathcal F_\theta^{0}\left(\mathbf G_s,\mathbf E_{s,q}\right), \tag{6}
$$

其中上标 $0$ 表示仅查询预测。我们考虑三种互补情形。**匹配（matched）情形**评估训练与测试样本服从同一场景–配置分布时的学习有效性。两种零样本情形满足

$$
\text{Scene-ZS：}\ \mathcal S_{\mathrm{tr}}\cap\mathcal S_{\mathrm{te}}=\varnothing,\qquad
\text{Config-ZS：}\ \mathcal C_{\mathrm{tr}}\cap\mathcal C_{\mathrm{te}}=\varnothing, \tag{7}
$$

其中 $\mathcal S$ 与 $\mathcal C$ 分别表示场景集与无线配置集。Scene-ZS 测试对未见传播环境的迁移，而 Config-ZS 测试对训练中完全缺席的无线配置（包括其全部定向状态）的迁移。两种情形独立评估，以隔离相应的分布偏移。任何仅查询情形下，推理时都没有同场景 BeamRM 可用。

### C. Strict-Small 源辅助预测

我们进一步考虑未见目标场景 $s$，其中有少量 BeamRM 在其他无线配置下可用。令 $q_i=(c_i,\rho_i)$ 表示同一场景中的第 $i$ 个源查询，$K$-shot 支持集为

$$
\mathcal Z_{s,q}^{K}=\left\{\left(\mathbf B_{s,q_i},\mathbf Y_{s,q_i},\mathbf M_{s,q_i},q_i\right)\right\}_{i=1}^{K}, \tag{8}
$$

其中每张源 BeamRM 与其生成时的查询和波束图配对。源辅助预测于是写为

$$
\widehat{\mathbf Y}_{s,q}^{K}=\mathcal F_\theta\left(\mathbf G_s,\mathbf E_{s,q},q,\mathcal Z_{s,q}^{K}\right). \tag{9}
$$

在 strict-small 协议下，每个支持配置满足

$$
c_i\neq c,\quad c_i\in\mathcal C_{\mathrm{small}}(c),\qquad i=1,\dots,K, \tag{10}
$$

其中 $\mathcal C_{\mathrm{small}}(c)$ 是部署复杂度低于目标配置的预定义配置集合。因此目标配置被排除在支持池之外，没有目标 BeamRM 像素被观测，推理期间模型参数保持不变。

尽管源 BeamRM 与目标共享传播场景，它们对应不同的空间激励。因此它们提供的是共同环境的已实现跨配置证据，而非目标场的直接观测。

基于上述定义，整体 BeamRM 预测任务表述如下。

> **问题 1：**
> $$
> \min_\theta\ \mathbb E\left[\mathcal L_{\mathrm{RM}}\left(\widehat{\mathbf Y}_{s,q}^{K},\mathbf Y_{s,q};\mathbf M_{s,q}\right)\right]
> $$
> $$
> \text{s.t.}\quad \widehat{\mathbf Y}_{s,q}^{K}=\mathcal F_\theta\left(\mathbf G_s,\mathbf E_{s,q},q,\mathcal Z_{s,q}^{K}\right),\qquad
> \mathcal F_\theta\left(\mathbf G_s,\mathbf E_{s,q},q,\varnothing\right)=\mathcal F_\theta^{0}\left(\mathbf G_s,\mathbf E_{s,q}\right), \tag{11}
> $$
> 其中 $\mathcal L_{\mathrm{RM}}(\cdot)$ 表示掩码感知的 BeamRM 重建损失，$\mathcal Z_{s,q}^{0}=\varnothing$，且当 $K>0$ 时支持配置受 (10) 约束。因此 $K=0$ 给出仅查询预测，而 $K>0$ 允许在无目标 BeamRM 观测、无推理时参数更新的情况下做 strict-small 源辅助预测。

## IV. 所提 BeamRMX 框架

BeamRMX 通过两个非对称组件实例化第 III 节的表述。XBase 作为完整的仅查询预测器，逼近场景条件化的激励到场变换 $\mathcal T_s$。当同场景跨配置证据可用时，可选的 Evidence Adapter 通过门控残差修正细化冻结的 XBase 预测。

本节中，功率值的波束图与 BeamRM 都表示在 $[0,1]$ 上共同的仿射归一化尺度，$\Pi_Y(\cdot)$ 表示逐元素裁剪到该范围。由于使用同一仿射映射，归一化功率差与相应的 dB 域值保持成正比。

### A. 框架概览

给定场景表示 $\mathbf G_s$ 与目标空间激励 $\mathbf E_{s,q}$，XBase 产生

$$
\left(\widehat{\mathbf Y}_{s,q}^{0},\mathbf Z_{s,q}^{0}\right)=\mathcal F_X\left(\mathbf G_s,\mathbf E_{s,q};\theta_X\right), \tag{12}
$$

其中 $\widehat{\mathbf Y}_{s,q}^{0}$ 是完整的仅查询 BeamRM，$\mathbf Z_{s,q}^{0}$ 是暴露给 Evidence Adapter 的目标侧表示。当 $K>0$ 时，适配器从冻结的 XBase 锚点与支持集 $\mathcal Z_{s,q}^{K}$ 估计残差修正：

$$
\Delta_{s,q}^{K}=\mathcal A\left(\widehat{\mathbf Y}_{s,q}^{0},\mathbf Z_{s,q}^{0},\mathbf G_s,q,\mathcal Z_{s,q}^{K};\theta_A\right), \tag{13}
$$

$$
\widehat{\mathbf Y}_{s,q}^{K}=\Pi_Y\left(\widehat{\mathbf Y}_{s,q}^{0}+\Delta_{s,q}^{K}\right),\qquad \Delta_{s,q}^{0}=\mathbf 0. \tag{14}
$$

因此 XBase 仍是独立预测器，而非需要后续修正的预备阶段。当 $K=0$ 时，整个支持分支在结构上被旁路，BeamRMX 精确返回 $\widehat{\mathbf Y}_{s,q}^{0}$，如图 2 所示。

### B. XBase：场景条件化的激励到场学习

如图 2(a) 所示，XBase 在显式学习交互之前保持空间激励与传播几何的不同角色。因此它通过两个独立的四阶段 ConvNeXt V2 编码器 [31] 分别处理 $\mathbf E_{s,q}$ 与 $\mathbf G_s$：

$$
\left\{\mathbf U_e^{(\ell)}\right\}_{\ell=1}^{L}=\mathcal E_e\left(\mathbf E_{s,q}\right),\qquad
\left\{\mathbf U_g^{(\ell)}\right\}_{\ell=1}^{L}=\mathcal E_g\left(\mathbf G_s\right). \tag{15}
$$

这里 $\mathbf E_{s,q}$ 是目标辐射状态的空间表示，其配置依赖性通过 $\mathbf E_{s,q}$ 中包含的目标波束图编码；XBase 不使用额外的全局查询嵌入。激励流包含目标波束图与相对发射机的空间线索，而几何流表示建筑与边界相关的场景结构。

实现上，波束条件化编码器接收 5 个通道：目标波束图、发射机位置图、两个归一化坐标图与发射机距离图。几何编码器接收 11 个通道，描述建筑高度与占用、场景边缘与边界带、边界距离、水平与垂直高度梯度、角点响应、归一化坐标与发射机距离。目标 BeamRM 从不包含在任何输入流中。

在每个分辨率层级，两个流通过交叉条件化融合交互：

$$
\left[\Gamma_e^{(\ell)},\Gamma_g^{(\ell)}\right]=\sigma\left(\mathcal H_\Gamma^{(\ell)}\left(\mathrm{Concat}\left(\mathbf U_e^{(\ell)},\mathbf U_g^{(\ell)}\right)\right)\right), \tag{16a}
$$

$$
\mathbf Z^{(\ell)}=\mathcal H_F^{(\ell)}\left(\mathrm{Concat}\left(\Gamma_e^{(\ell)}\odot\mathbf U_e^{(\ell)},\Gamma_g^{(\ell)}\odot\mathbf U_g^{(\ell)}\right)\right). \tag{16b}
$$

学习到的掩码在融合前使每个流以另一流为条件，既保持其不同信息角色，又在多个空间尺度上建模激励–几何交互。这与输入级拼接形成对比：后者在编码各自结构之前就合并了两类信息。

特征金字塔网络（FPN）式解码器 [32] 给出

$$
\mathbf Z_{s,q}^{0}=\mathcal D_X\left(\left\{\mathbf Z^{(\ell)}\right\}_{\ell=1}^{L}\right). \tag{17}
$$

解码后的表示被映射到主导响应与场景相关调制图：

$$
\mathbf Y_{s,q}^{\mathrm{base}}=\mathcal H_{\mathrm{base}}\left(\mathbf Z_{s,q}^{0},\mathbf E_{s,q}\right),\qquad
\mathbf V_{s,q}=\sigma\left[\mathcal H_{\mathrm{vis}}\left(\mathbf Z_{s,q}^{0},\mathbf G_s\right)\right]. \tag{18}
$$

两个残差头进一步捕捉激励–几何与边界敏感修正：

$$
\mathbf R_{s,q}^{\mathrm{dir}}=\mathcal H_{\mathrm{dir}}\left(\mathbf Z_{s,q}^{0},\mathbf E_{s,q},\mathbf G_s\right),\qquad
\mathbf R_{s,q}^{\mathrm{bd}}=\mathcal H_{\mathrm{bd}}\left(\mathbf Z_{s,q}^{0},\mathbf G_s\right). \tag{19}
$$

最终仅查询预测为

$$
\widehat{\mathbf Y}_{s,q}^{0}=\Pi_Y\left(\mathbf V_{s,q}\odot\mathbf Y_{s,q}^{\mathrm{base}}+\mathbf R_{s,q}^{\mathrm{dir}}+\mathbf R_{s,q}^{\mathrm{bd}}\right). \tag{20}
$$

这里 $\mathbf V_{s,q}$ 按场景结构软调制主导的波束条件化响应。方向与边界残差头分别捕捉局部激励–几何偏差与边界敏感细节。这些组件提供传播相关的归纳偏置，而非对单次反射、绕射或其他传播机制的显式分解。

> **图 2（原文 Fig. 2）：** BeamRMX 架构。(a) 仅查询的 XBase 学习从目标空间激励与场景几何到 BeamRM 的场景条件化变换。(b) 可选的 Evidence Adapter 利用同场景跨配置 BeamRM，对冻结的 XBase 输出产生门控残差细化。适配器在 $K=0$ 时旁路、$K>0$ 时激活，且无测试时参数更新。

### C. Evidence Adapter：跨配置传播证据

如图 2(b) 所示，Evidence Adapter 仅在存在同场景源证据时激活。当 $K>0$ 时，每张支持 BeamRM 与其源激励 $\mathbf E_{s,q_i}=\phi_{\mathrm{exc}}(\mathbf B_{s,q_i};\Omega_s)$ 配对。为暴露已实现源响应与相应波束图的差异，我们构造

$$
\mathbf D_i^{\mathrm{bp}}=\mathbf M_{s,q_i}\odot\left(\mathbf Y_{s,q_i}-\mathbf B_{s,q_i}\right). \tag{21}
$$

该"响应–先验"差异仅用作学习到的证据线索，不被解释为孤立的物理传播分量。

支持输入及其编码表示为

$$
\mathbf X_i^{S}=\phi_S\left(\mathbf E_{s,q_i},\mathbf Y_{s,q_i},\mathbf M_{s,q_i},\mathbf D_i^{\mathrm{bp}},\mathbf G_s\right),\qquad
\mathcal E_S\left(\mathbf X_i^{S}\right)=\left(\left\{\mathbf U_i^{S,(\ell)}\right\}_{\ell=1}^{L_S},\mathbf u_i^{S}\right), \tag{22}
$$

其中 $\phi_S(\cdot)$ 还纳入由可用源图导出的细节、梯度与边界敏感线索。

不同源配置未必同样有信息量。因此我们采用基于注意力的关系加权 [33]。令 $\mathbf t_{s,q}^{0}$ 为从 $\mathbf Z_{s,q}^{0}$ 池化得到的目标 token，$r(q,q_i)$ 编码目标查询与源查询之间的关系。关系感知聚合为

$$
\beta_i=\psi\left(\mathbf t_{s,q}^{0},\mathbf u_i^{S},r(q,q_i)\right),\qquad
\alpha_i=\mathrm{softmax}_i\left(\{\beta_j\}_{j=1}^{K}\right),
$$

$$
\mathbf u_S^{K}=\sum_{i=1}^{K}\alpha_i\mathbf u_i^{S},\qquad
\mathbf U_S^{(\ell),K}=\sum_{i=1}^{K}\alpha_i\mathbf U_i^{S,(\ell)}. \tag{23}
$$

关系描述符包括频率、天线配置与定向状态差异。该关系感知加权只作用于已选定的支持项，与支持选择本身不同。候选支持先按第 V-C 节的查询感知效用准则从允许的 strict-small 池中选出，随后 (23) 在所选集合上做学习到的聚合。

为记号紧凑，令 $\mathcal U_S^{K}=\{\mathbf U_S^{(\ell),K}\}_{\ell=1}^{L_S}$ 表示聚合后的多尺度支持特征。聚合证据随后与冻结的 XBase 表示融合为

$$
\mathbf H_{s,q}^{K}=\mathcal F_A\left(\widehat{\mathbf Y}_{s,q}^{0},\mathbf Z_{s,q}^{0},\mathcal U_S^{K},\mathbf u_S^{K}\right), \tag{24a}
$$

$$
\mathbf P_{s,q}^{K}=\mathcal H_P\left(\mathbf H_{s,q}^{K},\widehat{\mathbf Y}_{s,q}^{0}\right),\qquad
\mathbf C_{s,q}^{K}=\sigma\left[\mathcal H_C\left(\mathbf H_{s,q}^{K},\widehat{\mathbf Y}_{s,q}^{0}\right)\right], \tag{24b}
$$

$$
\left[\mathbf R_{\mathrm{low}}^{K},\mathbf R_{\mathrm{hf}}^{K}\right]=\mathcal H_R\left(\mathbf H_{s,q}^{K},\mathbf P_{s,q}^{K}\right). \tag{24c}
$$

这里 $\mathbf P_{s,q}^{K}$ 是适配器内部使用的支持导出目标估计，两个残差提案分别捕捉大范围校准与局部细节修正。

为防止跨不同激励的无差别迁移，修正由 shot、支持质量、区域与置信度因子控制：

$$
\gamma^{K}=g_K(K),\qquad \eta_{\mathrm{qual}}^{K}=\sigma\left[h_{\mathrm{qual}}\left(\mathbf t_{s,q}^{0},\mathbf u_S^{K}\right)\right],
$$

$$
\mathbf G_{\mathrm{reg}}^{K}=\sigma\left[\mathcal H_{\mathrm{reg}}\left(\mathbf H_{s,q}^{K}\right)\right],\qquad
\mathbf G_{s,q}^{K}=\gamma^{K}\eta_{\mathrm{qual}}^{K}\mathbf G_{\mathrm{reg}}^{K}\odot\frac{1+\mathbf C_{s,q}^{K}}{2}. \tag{25}
$$

最终修正为

$$
\Delta_{s,q}^{K}=\mathbf G_{s,q}^{K}\odot\left(\mathbf R_{\mathrm{low}}^{K}+\mathbf R_{\mathrm{hf}}^{K}\right),\qquad
\widehat{\mathbf Y}_{s,q}^{K}=\Pi_Y\left(\widehat{\mathbf Y}_{s,q}^{0}+\Delta_{s,q}^{K}\right). \tag{26}
$$

门控机制在可用证据较弱、空间无关或与目标查询不一致时限制跨配置修正。

### D. 两阶段学习与推理

BeamRMX 分两阶段训练。XBase 先作为仅查询预测器独立优化：

$$
\mathcal L_X=\mathcal L_{\mathrm{valid}}^{X}+\lambda_{\mathrm{aux}}\mathcal L_{\mathrm{aux}}^{X}+\lambda_{\mathrm{str}}\mathcal L_{\mathrm{str}}^{X}, \tag{27}
$$

其中各项分别监督有效区域重建、辅助结构化输出以及区域/细节敏感一致性。这些目标不需要路径级物理标签。

该阶段结束后，$\theta_X$ 被冻结，只训练 Evidence Adapter。情景式训练采样目标查询与 $K$ 可变的 strict-small 支持集，使用

$$
\mathcal L_A=\mathcal L_{\mathrm{valid}}^{A}+\lambda_{\mathrm{det}}\mathcal L_{\mathrm{det}}^{A}+\lambda_{\mathrm{prior}}\mathcal L_{\mathrm{prior}}+\lambda_{\mathrm{gain}}\mathcal L_{\mathrm{gain}}+\lambda_{\mathrm{sp}}\mathcal L_{\mathrm{sp}}+\lambda_{\mathrm{nh}}\mathcal L_{\mathrm{nh}}+\lambda_{\mathrm{kd}}\mathcal L_{\mathrm{kd}}. \tag{28}
$$

前两项监督最终重建与空间细节；$\mathcal L_{\mathrm{prior}}$ 与 $\mathcal L_{\mathrm{gain}}$ 训练有用的证据条件化估计与修正；$\mathcal L_{\mathrm{sp}}$ 限制不必要的大范围自适应；$\mathcal L_{\mathrm{kd}}$ 把更可靠的丰富支持行为迁移到低 shot 设置。

基于间隔的无害项显式抑制相对冻结锚点的显著退化。令 $\mathcal V_{s,q}=\{p\in\Omega_s:\mathbf M_{s,q}(p)=1\}$ 表示有效像素集，并定义逐点误差 $\varepsilon_{s,q}^{K}(p)=|\widehat{\mathbf Y}_{s,q}^{K}(p)-\mathbf Y_{s,q}(p)|$，$\varepsilon_{s,q}^{0}(p)$ 类似定义。无害惩罚为

$$
\mathcal L_{\mathrm{nh}}=\frac{1}{|\mathcal V_{s,q}|}\sum_{p\in\mathcal V_{s,q}}\left[\varepsilon_{s,q}^{K}(p)-\varepsilon_{s,q}^{0}(p)-\epsilon_{\mathrm{nh}}\right]_{+}. \tag{29}
$$

这里 $[x]_{+}=\max(x,0)$。该项惩罚超出容差 $\epsilon_{\mathrm{nh}}$ 的有害修正，而不要求每个被修正像素都优于 XBase。

推理期间 $\theta_X$ 与 $\theta_A$ 都保持固定。当 $K=0$ 时，支持分支被旁路，精确返回仅查询预测。当 $K>0$ 时，XBase 只评估一次，Evidence Adapter 在单次前向中产生门控修正。不进行梯度更新、目标图优化或测试时微调。

## V. 实验结果与讨论

本节从三个互补角度评估 BeamRMX。第一，考察匹配域、场景零样本（Scene-ZS）与配置零样本（Config-ZS）下的仅查询预测。第二，评估来自低复杂度配置的少量同场景 BeamRM 能否在无目标观测、无测试时参数更新的情况下改善未观测目标 BeamRM 的预测。第三，分析哪些证据机制造成源辅助增益，以及所得 BeamRM 改善能否转化为更可靠的扇区内波束细化。

### A. 实验设置

实验在 [13] 引入的多配置 XL-MIMO 无线电图数据集上进行。该数据集含来自 800 个城市场景的 78,400 张基于射线追踪的 BeamRM，覆盖 1.8 至 6.7 GHz 的五个载频、多种阵列几何与尺寸，以及最多 1024 个天线阵元的定向阵列。载频、阵列配置与波束指向状态的组合在每个场景产生 98 个具体频率–阵列–波束查询条件。每个样本含一个场景表示、一张依赖配置的波束图与相应的 BeamRM。

所有场景表示、波束图与目标 BeamRM 都在 $128\times128$ 的公共空间分辨率下处理。$(-300,0)$ dB 范围内的有效自由空间接收功率线性映射到 $[0,1]$，建筑与无效区域用相应有效性掩码排除。平均绝对误差（MAE）与均方根误差（RMSE）在换算回 dB 域后于有效自由空间像素上计算，而峰值信噪比（PSNR）与结构相似性指数（SSIM）在单位数据范围的归一化 BeamRM 上评估并采用相同有效区域处理。除另行说明，所有比较方法使用相同数据划分、空间分辨率、归一化、有效性掩码与指标实现。

所有实验以 PyTorch 实现，在 NVIDIA A40 GPU 上运行。XBase 采用四阶段 ConvNeXt V2 编码器与 FPN 式解码器，用 AdamW 混合精度训练 50 个 epoch，按验证 MAE 选择检查点。Evidence Adapter 随后在 XBase 冻结的情况下训练 16 个 epoch，学习率 $5\times10^{-5}$、权重衰减 $2\times10^{-2}$。情景式适配器训练中，$K\in\{0,1,2,4,8\}$ 按概率 $\{0.05,0.45,0.35,0.10,0.05\}$ 采样，强调实际相关的低 shot 区间。推理时没有模型进行目标侧参数更新。完整训练配置与评估脚本见公开代码仓库。

**模型规模与推理效率：** XBase 含 89.3M 参数，与我们实验中改配的 BeamCKM 类预测器（105.6M–113.0M）规模相当。可选的 Evidence Adapter 引入 42.3M 可训练参数，使完整源辅助模型达 131.6M 参数（XBase 保持冻结）。在我们的 NVIDIA A40 评估实现下，仅查询的 XBase 每次查询约需 50.2 ms，源辅助推理在 $K\in\{1,2,4\}$ 时约需 60–62 ms。尽管所评估的扩散式预测器参数更少，其迭代采样流程每次查询约需 115–121 ms。因此所提框架保持单遍推理，在跨配置证据可用时仅带来适度时延增加。

### B. 仅查询多配置预测

我们首先在引入任何同场景无线证据之前评估 BeamRMX 的仅查询预测能力。每个方法都获得场景表示、发射机信息与目标查询对应的空间波束图，但不能访问同场景源 BeamRM、稀疏目标测量、部分目标图或目标标签。该设置隔离各模型从目标空间激励先验学习场景条件化变换到相应接收功率场的能力。

比较对象包括 RadioWNet + Beam Map、BeamCKM、RadioDiff 与 BeamCKMDiff。RadioWNet 遵循多配置数据集研究 [13] 中建立的波束条件化 W-Net 基准。改配的 BeamCKM 基线使用波束条件化输入的确定性编码器–解码器预测器 [15]，而 RadioDiff 代表扩散式无线电图预测器 [12]。BeamCKMDiff 把连续波束感知条件化与扩散 Transformer 架构结合 [16], [34]。为做表示受控的比较，所有方法都被提供相同的目标波束图作为空间波束表示；因此 BeamCKM 与 BeamCKMDiff 从各自原始的波束描述符改配到相同波束图输入，同时保留其主要预测架构。该设置把学习架构与波束表示差异分离开来。

考虑三种互补的仅查询协议：

- **匹配域：** 78,400 个场景–查询样本随机划分为 54,880 个训练、7,840 个验证与 15,680 个测试样本。场景与无线查询分布可在子集间重叠，而单个样本互不相交。该设置作为已见域参照。
- **Scene-ZS：** 800 个场景划分为 560 个训练、80 个验证与 160 个测试场景，每个场景保留全部 98 个频率–阵列–波束查询条件。因此所得 15,680 个测试样本完全来自模型训练中缺席的传播场景。
- **Config-ZS：** 完整无线配置在训练、验证与测试间分离，同时保留全部 800 个场景。一个 6.7 GHz、64 阵元、8 波束配置仅用于验证，而另一个不同的 6.7 GHz、256 阵元、16 波束配置保留用于测试。其余所有配置用于训练，得到 59,200 个训练、6,400 个验证与 12,800 个测试样本。

Scene-ZS 与 Config-ZS 探测互补的泛化维度，因此并非可直接比较的难度度量。前者 withheld 传播场景，后者 withheld 整个无线配置。特别地，Config-ZS 测试配置及其定向状态关联的任何 BeamRM 都未用于模型训练或检查点选择。

> **表 I（原文 Table I）：** 匹配域、Scene-ZS 与 Config-ZS 协议下的仅查询 BeamRM 预测。

| 协议 | 指标 | RadioWNet | BeamCKM | RadioDiff | BeamCKMDiff | BeamRMX | 相对最优基线的增益 |
|---|---|---|---|---|---|---|---|
| 匹配域 | MAE（dB）↓ | 6.1612 | 4.8713 | 5.0010 | 7.1315 | **2.0991** | ↓56.91% |
| 匹配域 | RMSE（dB）↓ | 9.5377 | 6.9161 | 7.0782 | 10.4604 | **4.1597** | ↓39.85% |
| 匹配域 | PSNR（dB）↑ | 30.9427 | 33.0515 | 32.7574 | 29.7024 | **37.1613** | ↑4.1098 dB |
| 匹配域 | SSIM↑ | 0.7015 | 0.8216 | 0.8120 | 0.7468 | **0.9073** | ↑0.0857 |
| Scene-ZS | MAE（dB）↓ | 6.9671 | 6.7375 | 6.7331 | 7.8319 | **4.9749** | ↓26.11% |
| Scene-ZS | RMSE（dB）↓ | 10.4689 | 9.7920 | 9.9510 | 11.7170 | **9.0415** | ↓7.66% |
| Scene-ZS | PSNR（dB）↑ | 29.9977 | 30.2605 | 30.2803 | 28.8026 | **31.5072** | ↑1.2269 dB |
| Scene-ZS | SSIM↑ | 0.6622 | 0.7592 | 0.7679 | 0.7200 | **0.8106** | ↑0.0427 |
| Config-ZS | MAE（dB）↓ | 6.1466 | 5.4694 | 5.3107 | 8.6834 | **2.7748** | ↓47.75% |
| Config-ZS | RMSE（dB）↓ | 8.8138 | 7.5310 | 7.3779 | 11.9391 | **5.0562** | ↓31.47% |
| Config-ZS | PSNR（dB）↑ | 31.3766 | 32.2486 | 32.4379 | 28.4284 | **35.4660** | ↑3.0281 dB |
| Config-ZS | SSIM↑ | 0.6976 | 0.8006 | 0.8245 | 0.7179 | **0.8695** | ↑0.0450 |

表 I 首先表明，BeamRMX 在匹配域设置下已是强仅查询预测器。它取得 2.0991 dB 的 MAE，把最佳竞争 MAE 降低 56.91%，RMSE 降低 39.85%。PSNR 与 SSIM 的一致优势进一步表明该增益不限于整体功率偏移。由于该协议未引入分布偏移，这些结果确立了 XBase 作为空间激励条件化 BeamRM 学习专用预测器的有效性。

Scene-ZS 结果检验所学激励到场关系能否迁移到完全未见的传播环境。BeamRMX 取得 4.9749 dB 的 MAE，相对最佳竞争结果降低 26.11%；它也在所有评估方法中获得最佳 RMSE、PSNR 与 SSIM。值得注意的是，相对 RMSE 降幅（7.66%）比 MAE 改善更温和。这表明尽管 BeamRMX 大幅改善整体空间预测精度，当传播环境本身未见时，困难的高误差区域仍然棘手。该结果既支撑所提激励–几何交互的价值，也揭示了几何与目标激励单独无法完全解决的残余场景不确定性。

Config-ZS 评估另一种外推：完整的 6.7 GHz、256 阵元、16 波束测试配置在模型训练与检查点选择中均缺席，而底层场景仍通过其他配置得到表示。在该配置不相交协议下，BeamRMX 取得 2.7748 dB 的 MAE 与 5.0562 dB 的 RMSE，分别比最佳基线的相应误差降低 47.75% 与 31.47%。它还把 PSNR 从 32.4379 提升到 35.4660 dB、SSIM 从 0.8245 提升到 0.8695，对应增益为 3.0281 dB 与 0.0450。功率域误差与结构指标的一致改善表明 Config-ZS 优势不限于整体接收功率校准，还扩展到保持波束相关空间响应。更重要的是，结果表明空间激励表述可迁移到模型开发中完全缺席的无线配置，而非依赖从训练样本中学到的配置特定关联。

**训练种子鲁棒性：** 为评估对训练随机性的敏感性，我们用三个随机种子独立训练 BeamRMX，同时固定 Scene-ZS 与 Config-ZS 数据划分及所有其他实验设置。所得 Scene-ZS MAE 为 4.9359±0.0344 dB，其中变化量表示独立训练运行的样本标准差。Config-ZS 下相应 MAE 为 2.8567±0.0787 dB。两种情形下运行间波动都显著小于表 I 中相对最强竞争方法的性能裕度，表明所观察到的零样本增益对训练初始化与随机优化不敏感。

图 3 比较了代表性的 Scene-ZS 与 Config-ZS 预测。这些示例通过直接对比相同目标查询下的重建 BeamRM 来补充聚合结果。所有方法都在一定程度上恢复了主导的波束条件化空间响应，而 BeamRMX 在局部高响应与低响应区域更贴近真值分布。因此视觉比较与表 I 的定量增益一致，而共同的接收功率尺度避免了各方法独立归一化夸大表面差异。

在三种协议下，基线性能随评估情形明显变化。BeamCKM 在匹配域设置中是最强基线，而 RadioDiff 在分布偏移下更具韧性，在 Config-ZS 的全部四项指标上居第二。这一对比凸显关键折中：BeamCKM 等确定性设计在训练与测试条件一致时表现出色，扩散式方法则保持更强泛化性。把 BeamCKMDiff 从向量条件化改为空间波束图表示会降低其有效性，反映其架构在处理异构多场景设置时的困难。在所有设置下，BeamRMX 在每项指标上都取得最佳成绩，证实其对未见场景与未见无线配置的双重适应性。不过，匹配域与 Scene-ZS 之间的性能差距表明几何单独无法解决的残余场景不确定性——这为纳入同场景跨配置证据提供了明确理由。

> **图 3（原文 Fig. 3）：** 匹配域、Scene-ZS 与 Config-ZS 评估协议下的定性 BeamRM 预测。图中展示一个代表性匹配域示例、两个 Scene-ZS 示例与两个 Config-ZS 示例。每行内所有方法使用相同接收功率色标。

### C. 未见场景中的 Strict-Small 源辅助预测

我们接着研究有限的同场景无线证据能否降低未见传播环境中仅查询预测的残余不确定性。实验使用 160 个 Scene-ZS 测试场景，并聚焦 6.7 GHz、1024 阵元、64 波束的目标配置，产生 10,240 个目标查询。支持 BeamRM 取自同一场景但来自不同无线配置，且这些配置不超过 64 个天线阵元。目标配置被排除在支持池之外，也没有目标 BeamRM 的稀疏观测或部分图可用。在该 strict-small 协议下，我们评估 $K\in\{0,1,2,4\}$ 个支持，不做任何推理时参数更新。因此目标使用 1024 阵元阵列，而每个允许的支持配置至多含 64 个天线阵元，且目标配置按构造被排除。

对每个目标查询，允许的支持先受 strict-small 约束限制，再用查询感知效用准则排序。该效用结合源–目标波束与配置关系、源侧有效性与细节线索、与冻结仅查询锚点的一致性，以及所选支持间的冗余惩罚。前 $K$ 个候选构成 Evidence Adapter 使用的支持集。选择器只使用目标查询、冻结的仅查询预测与可用源侧信息，不使用任何目标 BeamRM 值。

对每个方法，$K=0$ 表示其在同一目标配置上评估的仅查询锚点。在 BeamRMX 中，Evidence Adapter 恰在 $K=0$ 时被旁路，故输出与冻结 XBase 相同。所得 $K=0$ 性能与表 I 的 Scene-ZS 结果不同，因为后者对所有无线查询条件平均，而本实验只评估 6.7 GHz、1024 阵元、64 波束目标配置。

为判断同场景证据的收益是否特定于 BeamRMX，我们为两个互补基线构造源辅助变体。BeamCKM 被选为最接近的波束感知参照，因为其 M3ChanNet 扩展已把环境剖面与多波束观测作为辅助信息纳入 [15]；RadioDiff 代表强生成式 RM 预测器，也是第 V-B 节中最具竞争力的零样本基线之一。二者都被改配到相同 strict-small 信息边界，并获得与 BeamRMX 完全相同的查询感知支持情景。BeamCKM-Support 把源 BeamRM 纳入其确定性流程，而 RadioDiff-Support 用聚合源观测增强其扩散条件。所有方法使用相同目标查询、支持基数、支持情景与指标。

> **表 II（原文 Table II）：** 160 个未见场景上 strict-small 协议下的源辅助 BeamRM 预测。

| 指标 | BeamCKM-Support $K=0$ | BeamCKM-Support $K=1$ | BeamCKM-Support $K=2$ | BeamCKM-Support $K=4$ | RadioDiff-Support $K=0$ | RadioDiff-Support $K=1$ | RadioDiff-Support $K=2$ | RadioDiff-Support $K=4$ | BeamRMX $K=0$ | BeamRMX $K=1$ | BeamRMX $K=2$ | BeamRMX $K=4$ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MAE（dB）↓ | 6.7336 | 4.7637 | 4.7635 | 4.7635 | 6.4681 | 5.2391 | 5.1547 | 5.1850 | **5.9665** | **3.9178** | **3.7237** | **3.7095** |
| RMSE（dB）↓ | 9.9306 | 7.0330 | 7.0328 | 7.0329 | 9.8527 | 7.7761 | 7.6632 | 7.7083 | **9.5182** | **6.7461** | **6.4150** | **6.3883** |
| PSNR（dB）↑ | 30.1792 | 33.1113 | 33.1116 | 33.1116 | 30.4214 | 32.4092 | 32.5434 | 32.4960 | **30.7559** | **33.8350** | **34.2372** | **34.2732** |
| SSIM↑ | 0.7601 | 0.8354 | 0.8354 | 0.8354 | 0.7764 | 0.8209 | 0.8240 | 0.8232 | **0.7776** | **0.8818** | **0.8915** | **0.8924** |

表 II 表明，即便极少量的同场景跨配置证据也提供了超越仅查询预测的大量信息。对 BeamRMX，单个支持就把 MAE 从 5.9665 降至 3.9178 dB，对应 34.3% 的降低。RMSE、PSNR 与 SSIM 同时改善，表明该收益不限于全局功率调整，而扩展到重建的空间响应。由于目标 BeamRM 本身完全未被观测，这些增益表明源配置包含可跨不同空间激励迁移的场景特定信息。

收益还呈现明显的少 shot 饱和趋势。把支持数从 $K=1$ 增至 $K=2$ 使 BeamRMX 的 MAE 进一步从 3.9178 降至 3.7237 dB，而增至 $K=4$ 仅带来边际改善（3.7095 dB）。其他重建指标遵循相同趋势。因此大部分有用的同场景信息可从前一两个有信息量的支持中恢复，额外配置带来的回报递减。该性质对渐进网络部署尤为重要：此时少量旧式或低复杂度无线信息可能已可用，而对新大阵列配置的穷举刻画并不可取。

BeamRMX 也比两个支持增强基线更有效地利用可用证据。在 $K=4$ 时，其 MAE 比 BeamCKM-Support 低 22.1%、比 RadioDiff-Support 低 28.5%。更重要的是，随额外证据可用，各方法响应不同。BeamCKM-Support 在第一个支持后基本饱和，RadioDiff-Support 从 $K=1$ 到 $K=2$ 有改善但 $K=4$ 时无进一步收益。BeamRMX 则随支持增加保持一致（尽管递减）的改善。这表明源证据的价值不仅取决于其可用性，还取决于能否把配置特定的响应模式与对目标查询仍有用的场景信息分离。

这些结果支撑 Evidence Adapter 的核心设计原则。同场景源 BeamRM 不应被当作目标场的直接近似；它们提供的是共享传播环境的配置条件化观测。关系感知证据聚合与门控残差细化使 BeamRMX 能利用该信息，同时把冻结的仅查询预测保持为稳定锚点。下一小节考察哪些组件造成该增益，以及所得 BeamRM 改善能否转化为更可靠的波束管理决策。

### D. 证据机制与扇区内波束细化效用

我们先做受控机制诊断评估 Evidence Adapter，再考察重建增益是否改善扇区内波束细化。

**证据机制分析：** 从 160 个未见测试场景中均匀随机抽取一次 40 场景子集，并在所有机制诊断中固定，抽取时不参考模型输出或场景级性能。所有 $K=2$ 变体使用同一训练好的 BeamRMX 检查点与同一 strict-small 支持池。诊断分别移除源 BeamRM 内容、禁用空间区域门、或把查询感知效用选择替换为均匀随机的允许支持。高频（HF）MAE 是细节敏感的 dB 域重建指标，在我们评估代码实现的高频准则下于有效自由空间区域上评估；无害违例率表示源辅助预测使冻结 XBase 锚点退化超出规定容差的有效像素比例。这些固定检查点实验旨在受控未见场景子集上探查机制趋势，而非对独立重训练变体做全测试集排名。

> **表 III（原文 Table III）：** 40 个未见场景上的固定检查点机制诊断。

| 变体 | MAE（dB）↓ | 高频 MAE（dB）↓ | 无害违例率（%）↓ |
|---|---|---|---|
| XBase，$K=0$ | 5.5354 | 13.4462 | – |
| 完整 BeamRMX，$K=2$ | **3.4252** | **4.7323** | **10.18** |
| 移除源 BeamRM | 5.5363 | 15.5742 | 19.29 |
| 移除区域门 | 6.9513 | 7.1210 | 52.56 |
| 随机支持 | 3.6979 | 5.8082 | 11.13 |

表 III 揭示证据机制的三方面。移除源 BeamRM 内容几乎完全消除了源辅助增益：MAE 从 3.4252 升至 5.5363 dB，基本回到 $K=0$ 的 XBase 水平，而 HF MAE 退化更严重。因此改善主要来自已实现的同场景无线证据，而非仅来自额外适配器结构或源配置元数据。

有用证据还必须被保守迁移。移除空间区域门使 MAE 升至 6.9513 dB（比仅查询 XBase 锚点更差），并把无害违例率提高到 52.56%。因此仅获得有信息量的源 BeamRM 并不保证目标预测更好：不受控的残差注入会引入显著负迁移。该结果直接支撑第 IV-C 节的門控残差设计，它限制跨配置证据可修改冻结预测的位置。

随机支持选择造成较小但一致的退化。随机允许支持仍相对 XBase 有实质改善，证实同场景无线响应本身构成有用信息的主要来源。不过完整方法把 MAE 从 3.6979 改善到 3.4252 dB，并取得更好的 HF 精度与更低的无害违例率。因此证据表明支持相关性影响同场景信息能被多有效地迁移，而更大增益来自已实现源 BeamRM 的存在及其修正的空间控制。

**扇区内波束细化效用：** 我们进一步评估这些 BeamRM 重建改善是否为下游波束管理提供有用信息。由于 64 个目标波束构成连续角度扇区码本而非全方位码本，任务被表述为在候选扇区确定后的扇区内波束细化。令 $\mathcal B$ 表示目标波束集。对场景 $s$，参考服务功率面与由预测 BeamRM 选出的波束为

$$
P_s^{\mathrm{serv}}(p)=\max_{b\in\mathcal B}\mathbf Y_{s,b}(p),\qquad
\widehat b_s(p)=\arg\max_{b\in\mathcal B}\widehat{\mathbf Y}_{s,b}(p). \tag{30}
$$

由此得到的波束选择遗憾定义为

$$
\mathcal R_s(p)=P_s^{\mathrm{serv}}(p)-\mathbf Y_{s,\widehat b_s(p)}(p), \tag{31}
$$

它度量在位置 $p$ 处选择预测 BeamRM 所偏好波束、而非真实最佳波束造成的接收功率损失。因此遗憾为零表示预测 BeamRM 选到真值最优波束。当 $\widehat b_s(p)$ 属于位置 $p$ 处真值接收功率最高的三个波束时，发生 Top-3 命中。

服务功率 MAE 在所有目标波束均有效的空间交集上计算。Top-3 命中率与波束选择遗憾在参考服务功率不低于 −110 dBm 的位置评估；该阈值定义参考覆盖评估区域，而非运行覆盖保证。为额外评估强波束响应的空间定位，足迹交并比（IoU）由每个目标 BeamRM 的前 5% 功率区域计算，并在波束与场景上平均。

源辅助改善在波束管理层依然明显。相对其仅查询锚点，$K=2$ 的 BeamRMX 把服务功率 MAE 降低 40.5%、平均波束选择遗憾降低 16.5%，同时改善 Top-3 命中率、95 百分位（P95）波束选择遗憾与高响应足迹重叠。它在表 IV 的所有通信导向指标上取得最佳结果。这些增益表明额外无线证据不仅改善逐点 BeamRM 重建，也改善候选波束响应的相对排序与空间定位，这些直接关系到波束细化。

> **表 IV（原文 Table IV）：** 160 个未见场景上的扇区内波束细化效用。

| 指标 | BeamCKM-Support $K=0$ | BeamCKM-Support $K=2$ | RadioDiff-Support $K=0$ | RadioDiff-Support $K=2$ | BeamRMX $K=0$ | BeamRMX $K=2$ |
|---|---|---|---|---|---|---|
| 服务 MAE（dB）↓ | 6.735 | 5.525 | 6.458 | 4.053 | **6.071** | **3.612** |
| Top-3 命中（%）↑ | 67.48 | 68.85 | 67.17 | 67.64 | **77.87** | **79.96** |
| 平均遗憾（dB）↓ | 4.148 | 3.671 | 4.367 | 3.528 | **3.439** | **2.873** |
| P95 遗憾（dB）↓ | 16.986 | 15.657 | 17.739 | 14.593 | **15.744** | **13.502** |
| 足迹 IoU↑ | 0.549 | 0.582 | 0.593 | 0.672 | **0.614** | **0.741** |

图 4 的场景级经验分布进一步表明改善并非仅由少数有利环境驱动。相对其 $K=0$ 锚点，$K=2$ 的 BeamRMX 把服务功率 MAE 与平均遗憾分布都推向更低值。配对的场景级 bootstrap 分析给出服务功率 MAE 平均改善 2.460 dB，95% 置信区间为 [2.224, 2.715] dB，且全部 160 个测试场景都观测到改善。结合机制诊断，这些结果表明受控使用同场景跨配置证据可从 BeamRM 重建到下游扇区内波束细化效用带来一致增益。

> **图 4（原文 Fig. 4）：** 160 个未见场景上服务功率 MAE 与平均波束选择遗憾的场景级经验累积分布函数（CDF）：(a) 服务功率 MAE；(b) 波束选择遗憾。

## VI. 结论

本文研究了波束赋形无线系统中可泛化的 BeamRM 预测：同一传播场景内不同波束与无线配置产生不同接收功率场。BeamRMX 通过在空间域显式表示目标辐射状态，并把 BeamRM 预测表述为学习场景如何把该空间辐射查询变换为相应接收功率场，来应对这一"一场景–多 BeamRM"设定。该共同空间表示支持跨异构波束状态与配置的预测，而 XBase 显式学习辐射与场景几何的交互。匹配域、未见场景与未见配置设置下的实验一致验证了该表述的有效性与泛化性。当同场景无线证据可用时，可选的 Evidence Adapter 在无目标观测、无测试时更新的情况下提供进一步细化。所得 BeamRM 也改善服务功率估计与扇区内波束细化。未来工作将研究基于测量的验证以及更广泛的波束与阵列配置。

## 参考文献（英文原书目）

- [1] Z. Wang, J. Zhang, H. Du, D. Niyato, S. Cui, B. Ai, M. Debbah, K. B. Letaief, and H. V. Poor, "A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications," IEEE Communications Surveys & Tutorials, vol. 26, no. 3, pp. 1560–1605, 2024.
- [2] S. Dang, O. Amin, B. Shihada, and M.-S. Alouini, "What should 6G be?" Nature Electronics, vol. 3, no. 1, pp. 20–29, 2020.
- [3] N. Cheng, F. Chen, W. Chen, Z. Cheng, Q. Yang, C. Li, and X. Shen, "6G omni-scenario on-demand services provisioning: Vision, technology and prospect (in Chinese)," Sci Sin Inform, vol. 54, pp. 1025–1054, 2024.
- [4] J. Wen, J. Nie, Y. Zhong, C. Yi, X. Li, J. Jin, Y. Zhang, and D. Niyato, "Diffusion-model-based incentive mechanism with prospect theory for edge AIGC services in 6G IoT," IEEE Internet of Things Journal, vol. 11, no. 21, pp. 34 187–34 201, 2024.
- [5] N. Cheng, F. Lyu, W. Quan, C. Zhou, H. He, W. Shi, and X. Shen, "Space/aerial-assisted computing offloading for IoT applications: A learning-based approach," IEEE Journal on Selected Areas in Communications, vol. 37, no. 5, pp. 1117–1129, 2019.
- [6] R. W. Heath, N. González-Prelcic, S. Rangan, W. Roh, and A. M. Sayeed, "An overview of signal processing techniques for millimeter wave MIMO systems," IEEE Journal of Selected Topics in Signal Processing, vol. 10, no. 3, pp. 436–453, 2016.
- [7] M. Giordani, M. Polese, A. Roy, D. Castor, and M. Zorzi, "A tutorial on beam management for 3GPP NR at mmWave frequencies," IEEE Communications Surveys & Tutorials, vol. 21, no. 1, pp. 173–196, 2019.
- [8] A. Alkhateeb, "DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications," 2019, arXiv:1902.06435.
- [9] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, "A tutorial on environment-aware communications via channel knowledge map for 6G," IEEE Communications Surveys & Tutorials, vol. 26, no. 3, pp. 1478–1519, 2024.
- [10] J. Hoydis, S. Cammerer, F. Ait Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, "Sionna: An open-source library for next-generation physical layer research," 2022, arXiv:2203.11854.
- [11] R. Levie, C. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast radio map estimation with convolutional neural networks," IEEE Transactions on Wireless Communications, vol. 20, no. 6, pp. 4001–4015, 2021.
- [12] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, "RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction," IEEE Transactions on Cognitive Communications and Networking, vol. 11, no. 2, pp. 738–750, 2025.
- [13] X. Li, Y. Han, Z. Lu, S. Jin, and C.-K. Wen, "U6G XL-MIMO radiomap prediction: Multi-config dataset and beam map approach," 2026, arXiv:2603.06401.
- [14] X. Wang, Q. Zhang, N. Cheng, J. Chen, Z. Zhang, Z. Li, S. Cui, and X. Shen, "RadioDiff-3D: A 3D×3D radio map dataset and generative diffusion based benchmark for 6G environment-aware communication," IEEE Transactions on Network Science and Engineering, vol. 13, pp. 3773–3789, 2026.
- [15] H. Wang, X. Shi, H. Zhang, Y. Cao, S. Yang, J. Wang, and K. Huang, "BeamCKM: A framework of channel knowledge map construction for multi-antenna systems," 2025, arXiv:2511.18376.
- [16] L. Zhao, Y. Wang, X. Wang, Z. Fei, and Y. Zeng, "BeamCKMDiff: Beam-aware channel knowledge map construction via diffusion transformer," in Proc. IEEE INFOCOM, 2026, pp. 1–6.
- [17] S. Zhang, A. Wijesinghe, and Z. Ding, "RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network," IEEE Internet of Things Journal, vol. 10, no. 20, pp. 18 016–18 027, 2023.
- [18] X. Li, S. Zhang, H. Li, X. Li, L. Xu, H. Xu, H. Mei, G. Zhu, N. Qi, and M. Xiao, "RadioGAT: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks," IEEE Transactions on Wireless Communications, vol. 23, no. 11, pp. 17 777–17 792, 2024.
- [19] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Advances in Neural Information Processing Systems, vol. 33, 2020, pp. 6840–6851.
- [20] X. Wang, Q. Zhang, N. Cheng, R. Sun, Z. Li, S. Cui, and X. Shen, "RadioDiff-k2: Helmholtz equation informed generative diffusion model for multi-path aware radio map construction," IEEE Journal on Selected Areas in Communications, vol. 44, pp. 2318–2333, 2026.
- [21] W. Liu and J. Chen, "UAV-aided radio map construction exploiting environment semantics," IEEE Transactions on Wireless Communications, vol. 22, no. 9, pp. 6341–6355, 2023.
- [22] C. Yapar, F. Jaensch, R. Levie, G. Kutyniok, and G. Caire, "The first pathloss radio map prediction challenge," in ICASSP 2023 - 2023 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), 2023, pp. 1–2.
- [23] Y. Zeng and X. Xu, "Toward environment-aware 6G communications via channel knowledge map," IEEE Wireless Communications, vol. 28, no. 3, pp. 84–91, 2021.
- [24] F. Jaensch, G. Caire, and B. Demir, "Radio map prediction from aerial images and application to coverage optimization," IEEE Transactions on Wireless Communications, vol. 25, pp. 308–320, 2026.
- [25] Y. Teganya and D. Romero, "Deep completion autoencoders for radio map estimation," IEEE Transactions on Wireless Communications, vol. 21, no. 3, pp. 1710–1724, 2022.
- [26] Y. Qiu, X. Chen, K. Mao, X. Ye, H. Li, F. Ali, Y. Huang, and Q. Zhu, "Channel knowledge map construction based on a UAV-assisted channel measurement system," Drones, vol. 8, no. 5, p. 191, 2024.
- [27] H. Sun and J. Chen, "Energy-modified leverage sampling for radio map construction via matrix completion," IEEE Signal Processing Letters, vol. 31, pp. 1780–1784, 2024.
- [28] X. Wang, Z. Fang, N. Cheng, R. Sun, H. Zhou, Z. Su, Z. Li, and X. Shen, "RadioDiff-Inverse: Diffusion enhanced Bayesian inverse estimation for ISAC radio map construction," IEEE Transactions on Wireless Communications, vol. 25, pp. 14 611–14 626, 2026.
- [29] X. Wang, Z. Guo, N. Cheng, Z. Yin, R. Sun, and X. Shen, "RadioDiff-FS: Physics-informed manifold alignment in few-shot diffusion models for high-fidelity radio map construction," IEEE Internet of Things Journal, 2026.
- [30] Z. Sun, B. Fan, Q. Liu, S. Zhang, and L. Song, "RadioPiT: Radio map generation with pixel transformer driven by ultra-sparse real-world data," in Proc. Asia-Pacific Conf. Commun. (APCC), 2025.
- [31] S. Woo, S. Debnath, R. Hu, X. Chen, Z. Liu, I. S. Kweon, and S. Xie, "ConvNeXt V2: Co-designing and scaling convnets with masked autoencoders," in Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit. (CVPR), 2023, pp. 16 133–16 142.
- [32] T.-Y. Lin, P. Dollár, R. Girshick, K. He, B. Hariharan, and S. Belongie, "Feature pyramid networks for object detection," in Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR), 2017, pp. 936–944.
- [33] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin, "Attention is all you need," Advances in Neural Information Processing Systems, vol. 30, 2017.
- [34] W. Peebles and S. Xie, "Scalable diffusion models with transformers," in Proc. IEEE/CVF Int. Conf. Comput. Vis. (ICCV), 2023, pp. 4172–4182.

## 图注与表注索引

本页图 1–4 的中文图注（含图 2(a)(b)、图 4(a)(b) 子图说明）与表 I–IV 的表注均按原文出现位置内联在正文中（图 1 见第 I 节末，图 2 见第 IV-B 节，图 3 见第 V-B 节，图 4 见第 V-D 节；表 I 见第 V-B 节，表 II 与表 III 见第 V-C 与 V-D 节，表 IV 见第 V-D 节），此处不重复罗列。原文为 IEEE 期刊双栏排版，图以浮动方式跨栏放置，本页按逻辑出现顺序内联。

**本页范围与校对状态：** 本页覆盖 arXiv:2609.00615v1 全文（13 页）的中文译稿：摘要、索引词、第 I–VI 节正文与编号小节、图 1–4 的中文图注（含子图）、表 I–IV 的逐格转写、问题 1、式 (1)–(31)，以及参考文献 34 条英文原条目（按原编号）。公式与表格已对照 PDF 渲染页核对：式 (1)–(31) 逐式核对（重点 (6)–(11)、(12)–(20)、(21)–(26)、(27)–(31)）；表 I 用第 8 页渲染图逐格核对（三种协议十二行数值与"相对最优基线增益"列全部一致），表 II–IV 按原文第 11–12 页表格抽取数据转写并核对列结构（表 II 为 3 方法 × K∈{0,1,2,4} 共十二列）。本页不上传原文图片，图 3–4 的定性重建与 CDF 曲线数值不作数字化估算；正文与表格中的实验数值按原文转写。原文疑点：表 I 中 BeamCKM 与 RadioDiff 在被改配到相同波束图输入后，RadioDiff 在 Scene-ZS/Config-ZS 部分指标上优于 BeamCKM，而正文表述与之一致，未发现需加注的矛盾；本页未发现明确数值矛盾。逐句终校未做；个别术语的中译仍以英文原词首次出现时标注为准。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
