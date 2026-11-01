---
layout: page
title: "ChronoChart：面向无标签室内定位的系统无关信道图表｜中文全文译文"
permalink: /papers/translations/2026-11-01-2610-25199-chronochart-setup-agnostic-indoor-localization/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/7a8f47c8b4332d21/) · [原文 arXiv](https://arxiv.org/abs/2610.25199/) · [全部目录](/papers/catalog/)

# ChronoChart：面向无标签室内定位的系统无关信道图表

**原题：** ChronoChart: Setup-Agnostic Channel Charting for Label-Free Indoor Localization  
**作者：** Majid Sharghi Foroushani、Jonas Pirkl、Jonathan Ott、Maximilian Stahlke、George Yammine、Tobias Feigl、Christopher Mutschler（单位按 PDF 原文转写）  
**单位：** ¹ 弗劳恩霍夫集成电路研究所（Fraunhofer IIS）定位与网络部，德国纽伦堡 90411；² 埃尔朗根-纽伦堡大学编程系统实验室（Programming Systems Lab），德国埃尔朗根 91052；³ 纽伦堡工业大学（UTN）机器学习与定位系统实验室，德国纽伦堡；作者联系邮箱：`{firstname.lastname}@iis.fraunhofer.de`。  
**版本：** arXiv:2610.25199v1（PDF 首页 arXiv 戳：arXiv:2610.25199v1 [eess.SP]，18 Oct 2026），2026；6 页；已接受待刊（IPIN 2026，作者声明待收入会议录）。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VI 节及全部小节（II-A–C、III-A–E、IV-A–D、V-A–C）、式 (1)–(3)、表 I–IV 逐格、图 1–2 图注、参考文献 [1]–[27]（英文原条目），并含原文首页资助脚注与文内脚注 1–2；许可：arXiv 预印本（公开可读）。逐句逐式终校未做。

**资助致谢（原文第 1 页脚注）：** 作者感谢联邦研究、技术与空间部（BMFTR）在研究计划“通信系统——Souverän. Digital. Vernetzt.”（资助号 16KIS2429K）框架下对 xG-RIC 项目的支持。

## 摘要

基于无线电的精确室内定位在多径丰富且动态的室内环境中仍具挑战性。监督式指纹方法通过学习从无线信道测量到物理位置的映射获得较高定位精度，但需要昂贵的位置标签与频繁重校准。信道图表（Channel Charting, CC）通过学习信道状态信息（Channel State Information, CSI）的低维表示来规避这一限制，且不需要位置标签，由此得到的信道图表中相邻点对应相邻的物理位置。然而，主流 CC 方法依赖与系统相关的非相似度度量，例如基于 ADP、CIRA 或 PDR 的距离，并依赖预计算的 \(O(n^2)\) 距离矩阵，从而限制了可扩展性与跨无线电系统的可迁移性。我们提出 ChronoChart，一个时间戳监督的 CC 框架，训练时仅需 CSI 与时间戳、无需先验知识。该方法联合优化互补的目标：使用由时间导出的正负样本的三元组损失以建立粗粒度全局结构、促使图表中轨迹平滑的时间邻近损失，以及约束不同增强表示之间一致性的联合嵌入损失。在真实 5G、MIMO 与被动 UWB 数据上的评估表明，我们的方法与依赖定制距离度量的既有 CC 基线持平或更优，并保持可扩展性、可适用于异构无线电系统。

## I. 引言

基于无线电的室内定位是低能见度环境中的关键使能技术 [1]。然而精确室内定位仍具挑战性，因为反射、阴影遮蔽、被遮挡的视距（line-of-sight, LOS）路径与环境动态会强烈影响信号传播。因此，传统的基于 RSSI、AoA 或 TDoA 的方法依赖准确的传播模型，在复杂室内环境中性能常常下降。

指纹方法通过把观测到的 CSI 与带标签的参考测量相匹配来获得较高的定位精度 [2, 3]，但需要大量现场勘测，且当环境变化时需要频繁重校准。这限制了其在大规模或动态部署中的实用性。CC 已作为监督式指纹的无标签替代方案出现。它把高维 CSI 嵌入低维信道图表，使图中相邻点对应相邻的物理位置 [4, 5]。由于训练不需要真值坐标，CC 显著降低了部署成本。流形学习方法（PCA、Isomap、Sammon 映射）能揭示局部结构，但缺少对未见样本的可学习映射 [6]。参数化方法，即自编码器 [4]、孪生网络 [7] 与三元组网络 [8]，通过学习可应用于新测量的编码器解决了这一局限。

尽管有这些进展，主流 CC 方法仍依赖与系统相关的设计选择。基于测地距离的孪生方法改善了全局一致性，但需要内存复杂度为 \(O(n^2)\) 的预计算成对距离矩阵 [9]。它们还依赖与无线电相关的非相似度度量，例如基于 ADP、CIRA 或 PDR 的距离 [9–11]。另一些方法引入时间、惯性或加速度约束以改善轨迹平滑性与全局图表结构 [12–14]。这些方法虽然有效，但需要额外先验、辅助传感器、精心设计的度量或昂贵的预处理。于是，一个开放问题浮现出来：如何在无位置标签、无无线电相关距离度量、无传播先验、无楼层平面图、无惯性测量，也无预计算距离矩阵的情况下，获得全局一致的信道图表。

为解决该问题，我们提出 ChronoChart，一个面向无标签室内定位的时间戳监督 CC 框架。ChronoChart 用来自时间戳的弱监督取代与系统相关的距离工程：时间上接近的样本很可能在空间上接近，而时间上远离的样本提供对比结构。如图 1 所示，它仅由 CSI 与时间戳训练一个共享编码器，联合优化三个互补目标：带由时间导出的正样本与负样本的三元组损失、促使图表轨迹平滑的时间邻近损失，以及促成鲁棒的数据驱动表示的联合嵌入损失。这些目标使用 NashMTL [15] 组合，以缓解多目标训练过程中的梯度冲突。因此，ChronoChart 无需辅助信息。我们在异构的真实无线电系统上评估 ChronoChart，包括 Fraunhofer 5G、Dichasus 分布式 MIMO 与被动 UWB。实验表明，ChronoChart 在 Fraunhofer 5G 与被动 UWB 数据集上优于非参数 CC、仅三元组训练与孪生基线，同时在 Dichasus 上取得与测地损失方法可比的性能。消融研究进一步确认，三元组、时间邻近与联合嵌入目标提供互补的改进，并在非均匀运动下提升鲁棒性。

**图 1（原文 Fig. 1）：** ChronoChart 使用由时间导出的三元组，从 CSI 样本与时间戳训练一个共享编码器。三元组损失（绿色）、时间邻近损失（橙色）与联合嵌入损失（紫色）经 NashMTL 组合，不依赖与系统相关的先验。

**表 I（原文 TABLE I；原文位于第 2 页页首，介于引言贡献段与结构说明段之间）：** 监督要求与系统要求的比较。

| 方法 | 位置标签↓ | 系统相关度量↓ | \(O(n^2)\) 矩阵↓ | 辅助信息↓ | 小批量训练↑ |
|---|---|---|---|---|---|
| 指纹定位 [2, 3] | 是 | 否 | 否 | 否 | 是 |
| 孪生网络 + ADP/CIRA [7, 9, 10] | 否 | 是 | 是 | 否 | 是 |
| 基于 PDR 的 CC [11] | 否 | 是 | 是 | 是 | 是 |
| 测地损失 [14] | 否 | 是 | 是 | 是 | 否 |
| 时间自编码器 [12] | 否 | 否 | 否 | 是 | 是 |
| **ChronoChart** | 否 | 否 | 否 | 否 | 是 |

本文结构如下。第 II 节回顾相关工作。第 III 节介绍 ChronoChart。第 IV 节描述数据集、基线与评估指标。第 V 节给出结果与消融研究，随后第 VI 节总结。

## II. 相关工作

### A. 基于指纹的定位

基于指纹的定位利用监督训练数据，学习从 RSS 或 CSI 等无线电测量到物理位置的映射。在具备密集带标签指纹时，这些方法可获得较高精度 [2, 3]。然而，收集参考位置需要耗费大量人力的现场勘测，且环境变化会降低性能并需要重校准 [2, 3]。这促使研究者探索在保持定位精度的同时降低部署成本的无标签替代方案。

### B. 信道图表

CC 作为一种无标签范式被提出，它把高维 CSI 映射到反映无线电几何的低维图表 [4, 5]。早期方法提取慢变信道特征（例如大尺度衰落），并应用 PCA、MDS、Isomap 或 Sammon 映射等非参数降维方法 [4, 6]。由于 CC 训练时不需要真值坐标，与监督式定位相比它大幅降低了标注工作量 [4, 16]。然而，非参数方法不提供对未见测量的参数化映射，限制了其在线定位中的应用。基于深度学习的 CC 通过学习可嵌入新样本的编码器解决了这一局限。自编码器 [4, 12]、孪生网络 [7] 与三元组网络 [8, 13] 利用由输入数据本身或由侧信息导出的成对或三元组约束，从无线电测量中学习信道图表。不变表示与自监督表示学习提升了鲁棒性 [16]。然而，纯局部或相对约束在缺乏额外结构时仍难以恢复全局一致的图表。为改善全局一致性，若干方法引入与无线电相关的非相似度度量、测地距离或额外的定位约束。例子包括基于角度-时延功率谱（angle-delay profile, ADP）与时间戳辅助的非相似度度量 [10]、基于 CIRA 的全局 CC [9]、基于 PDR 的 CC [11]，以及带加速度约束的批式测地损失 [14]。其他工作 [17–20] 把 CC 与经典定位技术或几何约束相结合，以在真实世界坐标中获得图表。时间或惯性约束也被用于在学习到的表示中促使轨迹平滑 [10, 12–14]。这些方法虽然有效，但依赖与系统相关的度量、辅助传感器、传播或运动先验、图构建参数或预计算的成对距离矩阵。这提升了精度，但限制了可扩展性与跨异构无线电系统的可迁移性。

### C. 自监督表示学习

自监督表示学习利用数据中的结构，在无人工标签的情况下学习嵌入。掩码预测方法随机掩蔽输入的一部分，并从其余上下文重建缺失信息 [21]。联合嵌入方法约束同一样本的不同视图或增强的表示之间的一致性 [22, 23]。为避免表示崩塌，一些方法使用目标网络的指数移动平均 [23]，而基于一致性的半监督方法则不需要此类教师模型 [22]。

然而，图像式的增强并不能直接迁移到无线电测量，后者中合适的不变性并不那么明显。因此，ChronoChart 使用掩码作为一种与无线电无关的扰动，并约束掩码与未掩码 CSI 表示之间的一致性。该联合嵌入目标通过促成鲁棒的数据驱动嵌入，补充时间三元组损失与时间邻近损失。

## III. 方法

ChronoChart 训练时仅使用 CSI 与时间戳。它用时间戳监督学习取代与系统相关的距离工程，且不需要与无线电相关的非相似度度量、惯性测量、楼层平面图或预计算的成对距离矩阵。时间约束此前已被使用，但既有方法往往依赖自编码器重建、手工设计的非相似度度量、带阈值的图构建或额外运动信息。ChronoChart 则仅用时间戳生成弱训练关系，并在小批量训练框架中把它们与对比式目标及一致性目标相结合。

本节给出无标签信道图表问题的表述（III-A），介绍核心思想（III-B），描述架构（III-C）、训练目标（III-D）以及基于 NashMTL 的优化（III-E）。

### A. 问题表述

设 \(\mathbf H_i\in\mathbb C^{A\times S}\) 表示在时间戳 \(t_i\) 记录的 CSI 快照，其中 \(A\) 为天线数，\(S\) 为子载波数。训练集由 \(\mathcal D=\{(\mathbf H_i,t_i)\}_{i=1}^{N}\) 给出，且不含位置标签。仅为评估，设 \(\mathbf p_i\in\mathbb R^{D}\) 表示对应的物理位置。CC 的目标是学习编码器 \(f_\theta:\mathbf H_i\mapsto\mathbf z_i\in\mathbb R^{d}\)，把每个 CSI 快照映射到低维信道图表表示 \(\mathbf z_i\)，使图表中的距离反映物理环境中的空间关系。理想情况下，物理空间中接近的样本 \(\|\mathbf p_i-\mathbf p_j\|_2\) 在图表中也应接近 \(\|\mathbf z_i-\mathbf z_j\|_2\)。由于图表是在没有绝对位置标签的情况下学习的，其坐标系仅可识别到全局变换，且仅在评估时与物理坐标对齐。

ChronoChart 在受限监督设定下解决该问题：训练时仅使用 CSI 样本与时间戳。它不需要位置标签、与无线电相关的非相似度度量、传播先验、楼层平面图、惯性测量或预计算的成对距离矩阵。

### B. 核心思想

ChronoChart 利用 \(\mathcal D=\{(\mathbf H_i,t_i)\}_{i=1}^{N}\) 中的时间戳导出 CSI 样本之间的弱空间关系。对锚点样本 \(\mathbf H_i\)，时间上接近的样本被视为正候选，而该时间邻域之外的样本作为弱负候选 [8]：

$$
\mathcal P_i=\{j\neq i\mid |t_i-t_j|\le T\},\qquad
\mathcal N_i=\{j\neq i\mid |t_i-t_j|> T\}.
$$

这利用了如下假设：在连续运动下，小的时间差通常意味着小的空间位移。

由于时间邻近只是弱线索，且在非均匀运动、轨迹交叉或接近静止的时段下并不完美，ChronoChart 把由时间戳导出的监督与表示一致性结合起来。给定嵌入 \(\mathbf z_i=f_\theta(\mathbf H_i)\)，训练目标由三个互补项组成：一个基于时间戳的三元组损失，约束正样本与负样本之间的相对次序；一个时间邻近损失，正则化时间相邻嵌入之间的距离；以及一个联合嵌入损失，对齐同一 CSI 样本的两个视图。所得的多目标问题用 NashMTL 优化，以减少各目标之间的冲突梯度。

### C. 模型架构

ChronoChart 使用共享编码器 \(f_\theta\) 把 CSI 测量映射到低维信道图表嵌入。¹

> ¹ 我们对每个数据集使用与基线方法相同的编码器架构，以确保性能增益来自 ChronoChart。

#### 1) 基于 MLP 的模型

对 Dichasus 数据集，我们使用文献 [10] 中基于多层感知机（MLP）的架构。输入特征为在所有可用天线的信道冲激响应（Channel Impulse Response, CIR）之间计算的互相关。与使用批归一化的基线模型不同，我们采用层归一化，以避免依赖批级统计量——它对小批量并不稳定。

#### 2) 基于 CNN 的模型

对 Fraunhofer 5G 与被动 UWB 数据集，我们使用文献 [9] 中基于 CNN 的架构。我们不依赖批统计量做归一化：在卷积层使用 InstanceNorm2D，在 MLP 组件中使用层归一化。

### D. 训练目标

#### 1) 基于时间戳的三元组损失

三元组损失提供 ChronoChart 的结构骨架。对每个锚点样本 \(\mathbf H_a\)，我们从其时间邻域采样正样本 \(\mathbf H_p\)，从该邻域之外采样负样本 \(\mathbf H_n\)，如 III-B 所定义。对应的嵌入为 \(\mathbf z_a=f_\theta(\mathbf H_a)\)、\(\mathbf z_p=f_\theta(\mathbf H_p)\)、\(\mathbf z_n=f_\theta(\mathbf H_n)\)。我们定义

$$
d_{\rm pos}=\|\mathbf z_a-\mathbf z_p\|_2,\qquad
d_{\rm neg}=\|\mathbf z_a-\mathbf z_n\|_2.
$$

基于 softmax 的三元组损失为

$$
\mathcal L_{\rm triplet}=-\log\left(\frac{\exp(-d_{\rm pos})}{\exp(-d_{\rm pos})+\exp(-d_{\rm neg})}\right).\tag{1}
$$

该目标促使时间上接近的样本比时间上远离的样本嵌入得更近。与基于距离矩阵的孪生方法不同，三元组损失只需要采样的时间关系，因此在标准小批量上即可优化。它防止表示崩塌，并建立局部乃至粗粒度的全局图表结构。

正样本在长度为 \(T\) 的时间窗口内选取，² 负样本则从该窗口之外采样。时间窗口 \(T\) 是用于定义正候选的唯一采样参数。它不编码与无线电相关的距离度量，也不用于构建全局成对距离矩阵。

> ² \(T\) 对 Dichasus 为 2.5 s、对 5G 为 1.0 s、对被动 UWB 为 1.9 s。当 \(T\) 处于所选值附近约 2 s 的范围内时，结果保持稳定（相对变化低于 18%）。

#### 2) 时间邻近损失

三元组损失约束正负样本之间的相对次序，但并未显式约束时间相邻样本之间的距离。因此我们加入时间邻近损失，以促使信道图表中的轨迹平滑。设 \(\mathcal T\) 表示一个小批量中的锚点-正样本对集合，\(\Delta t_{ij}=|t_i-t_j|\) 为样本 \(i\) 与 \(j\) 之间的时间距离。我们为每对分配权重

$$
w_{ij}=1-\frac{2\Delta t_{ij}}{T},
$$

使更近的时间邻居获得更强的强调。时间邻近损失定义为

$$
\mathcal L_{\rm time}=
\frac{\sum_{(i,j)\in\mathcal T} w_{ij}\big(\|\mathbf z_i-\mathbf z_j\|_2-k\Delta t_{ij}\big)^2}
{\sum_{(i,j)\in\mathcal T} w_{ij}},\tag{2}
$$

其中 \(k>0\) 是可训练的缩放因子，用于把时间距离与嵌入空间的尺度对齐，从而保证优化过程中时间差与嵌入距离可比。该式通过促使时间相邻样本的嵌入保持接近来正则化图表轨迹。由于时间距离只是空间位移的弱代理——尤其是在非均匀运动下——该损失被用作补充约束，而非独立的监督信号。

#### 3) 联合嵌入损失

仅使用时间邻近在非均匀运动、轨迹交叉或接近静止的时段下并不可靠。为补充由时间戳导出的目标，我们引入联合嵌入损失，以促成鲁棒的数据驱动表示。遵循基于一致性的自监督学习 [22]，我们利用同一输入的两个互补视图：原始未修改特征与掩码变体。设 \(\mathbf z_i=f_\theta(\mathbf H_i)\) 表示未掩码输入的嵌入，设 \(\widehat{\mathbf z}_i\) 表示施加随机特征掩码后得到的嵌入。我们使用 90% 的掩码比例。对基于 MLP 的架构，我们在互相关特征计算完成后施加掩码；对基于 CNN 的架构，我们在卷积特征提取器之后、回归 MLP 之前施加掩码。联合嵌入损失为

$$
\mathcal L_{\rm JE}=\frac{1}{|\mathcal B|}\sum_{i\in\mathcal B}\big\|\mathbf z_i-\widehat{\mathbf z}_i\big\|_2^2,\tag{3}
$$

其中 \(\mathcal B\) 表示小批量。该目标约束（未）掩码表示之间的一致性，使嵌入对缺失、含噪或损坏的输入特征不敏感。它促使编码器捕获并非只由时间邻近决定的稳定信道结构。

### E. 多目标优化

ChronoChart 组合三个目标：基于时间戳的三元组损失 \(\mathcal L_{\rm triplet}\)、时间邻近损失 \(\mathcal L_{\rm time}\) 与联合嵌入损失 \(\mathcal L_{\rm JE}\)。在多目标设定中，不同损失的梯度会相互冲突，可能导致次优收敛或训练振荡。我们没有用固定的静态权重组合这些损失，而是使用 NashMTL 在每个训练步计算一个冲突被减小的更新方向。设 \(\mathbf g_k=\nabla_\theta\mathcal L_k\) 表示目标 \(k\) 的梯度。NashMTL 把多任务优化表述为一个议价博弈，在每个步求解目标之间的纳什均衡，以导出自适应的逐任务权重 \(\alpha_k\)。最终更新方向为 \(\sum_k\alpha_k\mathbf g_k\)，其中 \(\alpha_k\) 通过求解一个约束二次规划得到。这减少了目标之间的破坏性干扰，同时避免人工调参的损失权重。对消融研究，我们使用 UPGrad [24]，它给出三元组、时间邻近与联合嵌入损失各自的可解释系数 \(\lambda_1\)、\(\lambda_2\)、\(\lambda_3\)。这使我们能够在固定 \(\lambda_1=1\) 的同时变化 \(\lambda_2\) 与 \(\lambda_3\)，从而研究各分量的贡献。

## IV. 实验设置

### A. 数据集

我们在三个覆盖异构无线电设置的真实室内数据集上评估 ChronoChart：5G、分布式 MIMO 与被动 UWB。对所有数据集，ChronoChart 仅用无线电测量与时间戳训练，不使用位置标签。真值位置仅用于评估，此时学习到的图表通过最优仿射变换对齐到物理坐标。为刻画运动条件，表 II 报告由各数据集的真值轨迹导出的速度统计量。

**表 II（原文 TABLE II）：** 统计量 [m/s]；变异系数（coefficient of variation, CoV）。

| 数据集 | 均值 | 标准差 | 最小值 | 最大值 | CoV |
|---|---|---|---|---|---|
| Dichasus | 0.227 | 0.082 | 0.000 | 0.729 | 0.362 |
| Fraunhofer 5G | 0.902 | 0.351 | 0.000 | 2.295 | 0.389 |
| 被动 UWB | 0.703 | 0.135 | 0.137 | 0.980 | 0.193 |

**Fraunhofer 5G 数据集** [25] 包含在多径传播丰富的工业室内环境中，由一台配备六个分布式天线的 5G 基站采集的 CSI 测量。该设置代表一个主动无线电定位场景，使用 SISO 发射机与分布式接收机基础设施。

**Dichasus 数据集** [26] 包含分布式 MIMO 信道测量，由 4 个各配备 8 根天线的天线阵在具有多径传播的 L 形室内区域周围采集得到。

**被动 UWB 数据集** [27] 包含约 40 分钟的训练数据与两个测试集（记为 P1 与 P2），来自一个在类办公环境中运行的被动 UWB 系统，使用全连接的 14 链路 UWB 网格与三名受试者。

### B. 训练协议

我们使用 Adam 优化器训练所有模型，学习率为 \(10^{-3}\)，批大小为 512，训练 200 个轮次。由于训练是随机的，每个实验用不同的随机种子重复 15 次，我们报告性能的中位数。ChronoChart 对每个数据集使用与该数据集对应基线相同的编码器架构，仅改变训练目标。

### C. 基线方法

我们把 ChronoChart 与非参数、神经以及基于度量的 CC 基线比较。**PCA 与 Isomap**：应用于 CSI 特征的经典非参数降维方法 [6]。它们提供无标签嵌入，但不为未见样本学习编码器。**仅三元组 CC**：只用基于时间戳的三元组损失训练的神经 CC 基线 [8]。该基线隔离时间邻近损失与联合嵌入损失的效果。**孪生网络**：用与系统相关的距离约束训练的成对网络 [7]。我们对 Dichasus 使用基于 ADP 的距离 [10]，对 Fraunhofer 5G 数据集使用基于 CIRA 的距离 [9]，对被动 UWB 数据集使用基于 PDR 的距离 [11]。**测地损失**：对 Dichasus 数据集，我们额外报告 [14] 中带加速度约束的不确定性感知测地损失方法。

### D. 评估指标

我们用最优仿射变换把学习到的图表对齐到真值坐标后评估定位精度。设 \(\widehat{\mathbf p}_i\) 为对齐后的估计，\(e_i=\|\widehat{\mathbf p}_i-\mathbf p_i\|_2\) 为定位误差。我们报告 \( \mathrm{MAE}=\frac{1}{N}\sum_i e_i \)、\( \mathrm{DRMS}=\sqrt{\frac{1}{N}\sum_i e_i^2} \)、中位误差 CEP 与第 95 百分位误差 R95，单位均为米。对图表质量，我们报告连续性（continuity, CT）、可信性（trustworthiness, TW）与 Kruskal 应力（Kruskal stress, KS）。CT/TW 越高表示局部邻域保持越好；KS 越低表示全局距离保持越好。

## V. 结果

### A. 总体性能

表 III 在所有数据集上比较 ChronoChart 与非参数、仅三元组、孪生与测地损失基线。ChronoChart 始终优于 PCA、Isomap 与仅三元组训练。在 Fraunhofer 5G 与被动 UWB 数据集上，ChronoChart 在所比较方法中取得最佳的定位性能。例如在 Fraunhofer 5G 上，它把 MAE 从基于 CIRA 的孪生基线的 1.331 m 降到 0.692 m。在被动 UWB 上，ChronoChart 在 P1 与 P2 上也优于基于 PDR 的孪生基线。在 Dichasus 上，ChronoChart 略微取得最低误差，MAE 比测地损失方法低约 7 cm。但该方法使用测地约束与加速度正则化，而 ChronoChart 训练时仅使用 CSI 与时间戳。因此，ChronoChart 在避免与系统相关的距离工程的同时取得了有竞争力的精度。图 2 的定性结果支持这些定量发现。ChronoChart 在不同无线电模态下产生具有一致全局结构与平滑轨迹的信道图表。这些图表表明，时间戳监督训练无需依赖预计算的成对距离矩阵或与无线电相关的非相似度度量，即可恢复有意义的空间结构。

**图 2（原文 Fig. 2）：** Fraunhofer 5G 与被动 UWB 数据集信道图表的定性比较。子图：(a) 5G 参考；(b) 5G PCA；(c) 5G Isomap；(d) 5G Siamese；(e) 5G ChronoChart；(f) 被动参考；(g) 被动 PCA；(h) 被动 Isomap；(i) 被动 Siamese PDR；(j) 被动 ChronoChart。

**表 III（原文 TABLE III）：** 不同方法的性能比较。说明：原文此表为 15 个随机种子的中位表现；各指标在图表经最优仿射变换对齐到真实位置后计算（MAE/DRMS/CEP/R95 单位为米；KS 越低越好；CT/TW 越高越好）。原文以“Data”列跨行分组，本页按行重写数据列。

| 数据 | 方法 | MAE↓ | DRMS↓ | CEP↓ | R95↓ | KS↓ | CT/TW↑ |
|---|---|---|---|---|---|---|---|
| Dichasus | PCA | 2.915 m | 3.294 m | 2.786 m | 5.670 m | 0.567 | 0.836 / 0.805 |
| Dichasus | Isomap | 2.842 m | 3.216 m | 2.753 m | 5.368 m | 0.537 | 0.818 / 0.810 |
| Dichasus | Triplet-only | 1.230 m | 1.554 m | 0.907 m | 3.251 m | 0.218 | 0.987 / 0.973 |
| Dichasus | Siamese w. ADP [10] | 0.490 m | 0.584 m | 0.441 m | 1.026 m | 0.071 | 0.996 / 0.996 |
| Dichasus | Geodesic loss [14] | 0.330 m | 0.409 m | 0.277 m | 0.719 m | 0.069 | 0.998 / 0.998 |
| Dichasus | **ChronoChart** | **0.264 m** | **0.329 m** | **0.217 m** | **0.633 m** | **0.0546** | **0.998 / 0.998** |
| Fraunhofer 5G | PCA | 3.646 m | 4.116 m | 3.383 m | 7.143 m | 0.327 | 0.919 / 0.902 |
| Fraunhofer 5G | Isomap | 2.696 m | 3.164 m | 2.394 m | 5.932 m | 0.246 | 0.961 / 0.949 |
| Fraunhofer 5G | Triplet-only | 1.453 m | 1.842 m | 1.219 m | 3.202 m | 0.139 | 0.987 / 0.987 |
| Fraunhofer 5G | Siamese w. CIRA [9] | 1.331 m | 1.601 m | 1.187 m | 2.790 m | 0.139 | 0.985 / 0.984 |
| Fraunhofer 5G | **ChronoChart** | **0.692 m** | **1.232 m** | **0.419 m** | **1.733 m** | **0.087** | **0.991 / 0.995** |
| 被动 UWB P1 | PCA | 1.335 m | 1.462 m | 1.344 m | 2.262 m | 0.65 | 0.626 / 0.584 |
| 被动 UWB P1 | Isomap | 1.436 m | 1.536 m | 1.490 m | 2.231 m | 0.699 | 0.560 / 0.548 |
| 被动 UWB P1 | Triplet only | 0.241 m | 0.287 m | 0.214 m | 0.514 m | 0.139 | 0.983 / 0.984 |
| 被动 UWB P1 | Siamese w. PDR [27] | 0.273 m | 0.326 m | 0.238 m | 0.587 m | 0.145 | 0.974 / 0.974 |
| 被动 UWB P1 | **ChronoChart** | **0.164 m** | **0.198 m** | **0.144 m** | **0.349 m** | **0.095** | **0.993 / 0.993** |
| 被动 UWB P2 | PCA | 1.502 m | 1.617 m | 1.580 m | 2.357 m | 0.688 | 0.606 / 0.585 |
| 被动 UWB P2 | Isomap | 1.546 m | 1.648 m | 1.647 m | 2.233 m | 0.742 | 0.543 / 0.527 |
| 被动 UWB P2 | Triplet only | 0.280 m | 0.324 m | 0.257 m | 0.572 m | 0.141 | 0.982 / 0.983 |
| 被动 UWB P2 | Siamese w. PDR [27] | 0.236 m | 0.287 m | 0.204 m | 0.508 m | 0.127 | 0.981 / 0.981 |
| 被动 UWB P2 | **ChronoChart** | **0.195 m** | **0.228 m** | **0.178 m** | **0.393 m** | **0.096** | **0.991 / 0.991** |

### B. 可扩展性与系统无关性

ChronoChart 的主要优势不仅是定位精度，还在于系统相关工程量的减少。孪生与测地基线需要为无线电系统定制的距离度量，例如 Dichasus 的 ADP、5G 的 CIRA，或被动 UWB 的基于 PDR 的距离。此外，测地方法需要预计算并存储内存复杂度为 \(O(n^2)\) 的成对距离矩阵。测地损失方法还需联合处理整个数据集以施加加速度约束。相比之下，ChronoChart 在标准小批量上运行，不需要预计算距离矩阵，并在所有数据集上使用相同的时间戳监督训练原则。除标准训练超参数外，ChronoChart 只引入一个时间采样窗口 \(T\) 与一个掩码比例。窗口 \(T\) 用于采样弱正候选，并不定义与无线电相关的距离度量或图结构。这使我们区别于那些需要人工设计的非相似度度量、图构建参数、辅助运动信息或环境相关先验的方法。

### C. 消融研究

表 IV 在固定三元组系数 \(\lambda_1=1\) 的同时，用 UPGrad 系数 \(\lambda_2\) 与 \(\lambda_3\) 研究时间邻近损失与联合嵌入损失的贡献。条目 \((\lambda_2=0,\ \lambda_3=0)\) 对应仅三元组基线。在 Fraunhofer 5G 与 Dichasus 上，加入时间邻近损失或联合嵌入损失中的任一项都能显著改善性能，说明两个目标都带来了三元组损失之外的信息。两个损失同时启用时结果最佳。对 Fraunhofer 5G，误差从仅三元组训练的 2.18 m 降至同时使用两个目标时的 0.84 m。对 Dichasus，误差从 1.23 m 降至 0.38 m。在一定的非零 \(\lambda_2\) 与 \(\lambda_3\) 取值范围内性能保持相对稳定，表明方法对辅助目标的精确权重并不过度敏感。这些结果支持三个目标的预期作用：三元组损失提供结构骨架并防止崩塌，时间邻近损失促使图表轨迹平滑，联合嵌入损失通过约束掩码与未掩码表示之间的一致性提升鲁棒性。尽管存在非均匀运动（表 II），改进依然保持，表明 ChronoChart 对真实的轨迹变化与接近静止的时段是鲁棒的。

**表 IV（原文 TABLE IV）：** 时间损失（\(\lambda_2\)）与联合嵌入损失（\(\lambda_3\)）不同 UPGrad 损失系数的比较。数值表示以米为单位的欧氏定位误差；加粗为原文标注的最佳值。

**(a) Fraunhofer 5G 数据集**

| \(\lambda_3\backslash\lambda_2\) | 0.0 | 0.5 | 1.0 | 1.5 |
|---|---|---|---|---|
| 0.0 | 2.18 | 0.99 | 1.04 | 0.97 |
| 0.5 | 1.01 | 0.94 | 0.98 | 0.98 |
| 1.0 | 1.01 | **0.84** | 0.98 | 0.94 |
| 1.5 | 1.14 | 0.86 | 0.98 | 0.86 |

**(b) Dichasus 数据集**

| \(\lambda_3\backslash\lambda_2\) | 0.0 | 0.5 | 1.0 | 1.5 |
|---|---|---|---|---|
| 0.0 | 1.23 | 0.62 | 0.80 | 0.55 |
| 0.5 | 0.66 | 0.40 | 0.48 | 0.40 |
| 1.0 | 0.48 | **0.38** | **0.38** | 0.39 |
| 1.5 | 0.66 | 0.41 | 0.39 | 0.39 |

## VI. 结论

我们提出了 ChronoChart，一个面向无标签室内定位的时间戳监督 CC 框架。它仅由 CSI 样本与时间戳学习信道图表，不需要先验，即不需要位置标签、与无线电相关的非相似度度量、传播先验、楼层平面图、惯性测量或预计算的成对距离矩阵。该框架组合三个互补目标：用于粗粒度图表结构的时间戳三元组损失、用于轨迹平滑性的时间邻近损失，以及用于鲁棒表示的联合嵌入损失。在真实 5G、分布式 MIMO 与被动 UWB 数据集上的实验表明，ChronoChart 与依赖定制距离度量的基线持平或更优，同时保持可扩展性、可适用于异构无线电系统。消融研究确认这三个目标提供互补的改进。由于 ChronoChart 把时间邻近用作空间邻近的弱代理，它适用于持续移动的发射机或目标，但在长时间静止、不规则采样或高度非均匀运动下可能失效。

## 参考文献

以下按原文参考文献顺序照录英文原条目（含卷期、页码、年份与 DOI 等书目信息）。

[1] Faheem Zafari, Athanasios Gkelias, and Kin K. Leung. “A Survey of Indoor Localization Systems and Technologies”. In: *IEEE Commun. Surveys Tuts.* 21.3 (2019), pp. 2568–2599. DOI: 10.1109/COMST.2019.2911558.

[2] Josyl Mariela Rocamora et al. “Survey of CSI Fingerprinting-Based Indoor Positioning and Mobility Tracking Systems”. In: *IET Signal Process.* 14.7 (2020), pp. 407–419. DOI: 10.1049/iet-spr.2020.0028.

[3] Hongxiu Zhao, Wafa Njima, and Xun Zhang. “High-Accuracy and Real-Time Fingerprint-Based Continual Learning Localization System in Dynamic Environment”. In: *Sensors* 25.5 (2025), p. 1289. DOI: 10.3390/s25051289.

[4] Christoph Studer et al. “Channel Charting: Locating Users Within the Radio Environment Using Channel State Information”. In: *IEEE Access* 6 (2018), pp. 47682–47698. DOI: 10.1109/ACCESS.2018.2866979.

[5] Paul Ferrand et al. “Wireless Channel Charting: Theory, Practice, and Applications”. In: *IEEE Commun. Mag.* 61.6 (2023), pp. 124–130. DOI: 10.1109/MCOM.001.2200344.

[6] Katherine C. Kempfert et al. “A Comparison Study on Nonlinear Dimension Reduction Methods With Kernel Variations: Visualization, Optimization and Classification”. In: *Intell. Data Anal.* 24.2 (2020), pp. 267–290. DOI: 10.3233/IDA-194486.

[7] Eric Lei et al. “Siamese Neural Networks for Wireless Positioning and Channel Charting”. In: *Proc. 57th Annu. Allerton Conf. Commun., Control, Comput.* Monticello, IL, 2019, pp. 200–207. DOI: 10.1109/ALLERTON.2019.8919897.

[8] Paul Ferrand et al. “Triplet-Based Wireless Channel Charting: Architecture and Experiments”. In: *IEEE J. Sel. Areas Commun.* 39.8 (2021), pp. 2361–2373. DOI: 10.1109/JSAC.2021.3087251.

[9] Maximilian Stahlke et al. “Indoor Localization With Robust Global Channel Charting: A Time-Distance-Based Approach”. In: *IEEE Trans. Mach. Learn. Commun. Netw.* 1.1 (2023), pp. 3–17. DOI: 10.1109/TMLCN.2023.3256964.

[10] Phillip Stephan, Florian Euchner, and Stephan ten Brink. “Angle-Delay Profile-Based and Timestamp-Aided Dissimilarity Metrics for Channel Charting”. In: *IEEE Trans. Commun.* 72.9 (2024), pp. 5611–5625. DOI: 10.1109/TCOMM.2024.3386571.

[11] Maximilian Stahlke et al. “Velocity-Based Channel Charting With Spatial Distribution Map Matching”. In: *IEEE J. Indoor Seamless Position. Navig.* 2 (2024), pp. 230–239. DOI: 10.1109/JISPIN.2024.3424768.

[12] Pengzhi Huang et al. “Improving Channel Charting With Representation-Constrained Autoencoders”. In: *Proc. IEEE 20th Int. Workshop Signal Process. Adv. Wireless Commun. (SPAWC)*. Cannes, France, 2019, pp. 1–5. DOI: 10.1109/SPAWC.2019.8815478.

[13] Brian Rappaport et al. “Improving Channel Charting Using a Split Triplet Loss and an Inertial Regularizer”. In: *Proc. 17th Int. Symp. Wireless Commun. Syst. (ISWCS)*. Berlin, Germany, 2021, pp. 1–6. DOI: 10.1109/ISWCS49558.2021.9562215.

[14] Florian Euchner, Phillip Stephan, and Stephan ten Brink. “Uncertainty-Aware Dimensionality Reduction for Channel Charting With Geodesic Loss”. In: *Proc. 58th Asilomar Conf. Signals, Syst., Comput.* Pacific Grove, CA, 2024, pp. 1665–1672. DOI: 10.1109/IEEECONF60004.2024.10942819.

[15] Aviv Navon et al. “Multi-Task Learning as a Bargaining Game”. In: *Proceedings of the 39th International Conference on Machine Learning*. Baltimore, MD, 2022, pp. 16428–16446.

[16] Artan Salihu, Markus Rupp, and Stefan Schwarz. “Self-Supervised and Invariant Representations for Wireless Localization”. In: *IEEE Trans. Wireless Commun.* 23.8 (2024), pp. 8281–8296. DOI: 10.1109/TWC.2023.3348203.

[17] Florian Euchner, Phillip Stephan, and Stephan ten Brink. “Augmenting Channel Charting With Classical Wireless Source Localization Techniques”. In: *Proc. 57th Asilomar Conf. Signals, Syst., Comput.* Pacific Grove, CA, 2023, pp. 1641–1647. DOI: 10.1109/IEEECONF59524.2023.10477049.

[18] Sueda Taner, Victoria M. T. Palhares, and Christoph Studer. “Channel Charting in Real-World Coordinates With Distributed MIMO”. In: *IEEE Trans. Wireless Commun.* 24.9 (2025), pp. 7286–7300. DOI: 10.1109/TWC.2025.3559723.

[19] Yuhao Zhang et al. “UNILocPro: Unified Localization Integrating Model-Based Geometry and Channel Charting”. In: *arXiv:2510.27394 [eess.SP]* (2025). DOI: 10.48550/arXiv.2510.27394.

[20] Mohsen Ahadi et al. “TDoA-Based Self-Supervised Channel Charting With NLoS Mitigation”. In: *IEEE Trans. Mach. Learn. Commun. Netw.* 24.9 (2026), pp. 1–13. DOI: 10.1109/TMLCN.2026.3688619.

[21] Kaiming He et al. “Masked Autoencoders Are Scalable Vision Learners”. In: *Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit. (CVPR)*. New Orleans, LA, 2022, pp. 16000–16009. DOI: 10.1109/CVPR52688.2022.01553.

[22] Samuli Laine and Timo Aila. “Temporal Ensembling for Semi-Supervised Learning”. In: *Proc. Int. Conf. Learn. Represent. (ICLR)*. Toulon, France, 2017, pp. 6–24.

[23] Jean-Bastien Grill et al. “Bootstrap Your Own Latent: A New Approach to Self-Supervised Learning”. In: *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*. Vol. 33. Virtual, 2020, pp. 21271–21284.

[24] Pierre Quinton and Valérian Rey. “Jacobian Descent for Multi-Objective Optimization”. In: *arXiv:2406.16232 [CS.LG]* (2024). DOI: 10.48550/arXiv.2406.16232.

[25] Fraunhofer Institute for Integrated Circuits IIS. *Fingerprinting Dataset for Positioning*. 2024. URL: https://www.iis.fraunhofer.de/en/ff/lv/dataanalytics/pos/fingerprinting-dataset-for-positioning.html.

[26] Florian Euchner et al. “A Distributed Massive MIMO Channel Sounder for ‘Big CSI Data’-Driven Machine Learning”. In: *Proc. 25th Int. ITG Workshop Smart Antennas (WSA)*. French Riviera, France, 2021, pp. 289–294.

[27] Raffael Poeggel et al. “Passive Channel Charting: Locating Passive Targets Using a UWB Mesh”. In: *Proc. 15th Int. Conf. Indoor Position. Indoor Navig. (IPIN)*. Tampere, Finland, 2025, pp. 1–6. DOI: 10.1109/IPIN66788.2025.11213350.

**本页范围与校对状态：** 本页覆盖原文全部内容：摘要、第 I–VI 节及全部小节（II-A–C、III-A–E、IV-A–D、V-A–C）、式 (1)–(3)、表 I–IV（逐格转写）、图 1–2 图注、参考文献 [1]–[27]（英文原条目），并含原文首页资助脚注与文内脚注 1–2。**核对方式：** 先按分页抽取文本（pypdf 6.10.0，6 页）翻译，再把 PDF 第 1–6 页渲染为 PNG 逐页核对；表 I（监督/系统要求）、表 II（速度统计）、表 III（20 行 × 8 列性能）、表 IV（两组 4×4 系数网格）与式 (1)–(3) 的符号、上下标、数值均已对照 PDF 渲染版逐格核验，数值照抄未改。**已知缺陷与核对疑点：**
1. 原文表 I 未在正文中以“Tbl. I”显式引用（表格位于第 2 页页首），本页按原始页面位置置于引言贡献段与“本文结构如下”段之间，并已在表题注明。
2. 缩写 ADP、CIRA、PDR 原文未逐一给出全称：ADP 可由参考文献 [10] 题名确定即 angle-delay profile（角度-时延功率谱）；CIRA 与 PDR 在原文中仅作为与系统相关的度量名称出现，本文保留原缩写，未作推测性展开。
3. 表 III 的“Data”列在原文为跨行分组（Dichasus、Fraunhofer 5G、Passive UWB P1、Passive UWB P2），Markdown 不支持跨行，本页在每行重复数据列标签，数值与分组未改。
4. 表 III 中 ChronoChart 在 Fraunhofer 5G 的 DRMS（1.232 m）高于 Siamese 基线的 DRMS（1.601 m）但 MAE 更低，此为原文数值，未做改写；表 IV 的数值为 UPGrad 消融下的“欧氏定位误差（米）”，与表 III 的仿射对齐后 MAE 口径不同，引用时需区分。
5. 图 1、图 2 的图形细节（编码器/损失连接框、散点颜色编码与参考轨迹）无法在译文中复现，本页仅给出图注译文；原文两张图均为定性结果，无可转写数值。
6. 参考文献 [20] 的卷期页码“IEEE Trans. Mach. Learn. Commun. Netw. 24.9 (2026), pp. 1–13”与 [15] 无 DOI 等，均按 PDF 原文照录，未作学术性更正。
7. 术语约定：channel charting 统一译为“信道图表”，channel chart 译为“信道图表”（未用“信道图”）；triplet loss = 三元组损失；label-free = 无标签；joint embedding = 联合嵌入；NashMTL、UPGrad、CIRA、ADP、PDR 保留原名/原缩写；表 I 的“Setup metric”译为“系统相关度量”。
8. 式 (2) 中的集合符号 \(\mathcal T\) 与时间窗 \(T\) 同形不同体，原文即如此写法，本页保留原记号以免混淆。
原文为 6 页会议短文（IPIN 2026），无附录、无关键词小节；**逐句逐式终校未做**，供后续 QA 重点核对：表 III/表 IV 数值、式 (1)–(3) 记号、以及 III-D 中正样本窗口 \(T\) 的三处数据集取值说明。

---

**登记（2026-11-01）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。

{% endraw %}
