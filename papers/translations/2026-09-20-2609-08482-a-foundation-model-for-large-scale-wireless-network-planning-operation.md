---
layout: page
title: "面向大规模无线网络规划与运维的基础模型｜中文全文译文"
permalink: /papers/translations/2026-09-20-2609-08482-a-foundation-model-for-large-scale-wireless-network-planning-operation/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/8fbe6b9650945281/) · [原文 arXiv](https://arxiv.org/abs/2609.08482) · [全部目录](/papers/catalog/)

# 面向大规模无线网络规划与运维的基础模型

**原题：** A Foundation Model for Large-Scale Wireless Network Planning, Operation and Optimization  
**作者：** Xinyu Qin（2,3）、Wenqiang Pu（2，通讯作者）、Hongcheng Dong（2,3）、Bingsheng Peng（2,3）、Ye Xue（4）、Linzhi Shen（5）、Qi Yan（5）、Tsung-Hui Chang（1,2,3，通讯作者）、Zhi-Quan Luo（1,2,3）  
**单位：** 1 Shenzhen Loop Area Institute（深圳，中国）；2 深圳市大数据研究院（Shenzhen Research Institute of Big Data，深圳，中国）；3 香港中文大学（深圳）；4 中山大学（深圳）；5 华为技术有限公司（深圳）。通讯邮箱：changtsunghui@cuhk.edu.cn、wpu@sribd.cn。  
**版本：** arXiv:2609.08482v3（eess.SP），2026-09-23，原文 33 页（含图 1—6、扩展数据图 1—4、扩展数据表 1—3）。  
**代码/数据：** https://github.com/rorschaches/RadioWorld 。  
**范围与状态：** 全文中文译稿：摘要、引言、结果（含各任务小节）、讨论、方法（含式（1）—（8））、扩展数据表 1—3（逐格）、图 1—6 与扩展数据图 1—4 图注、参考文献 [1]—[39] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** ①骨架原写 "arXiv:2609.08482，2026-09-20"；本地 PDF 为 **arXiv:2609.08482v3 [eess.SP]，2026-09-23**，"2026-09-20" 应为站点推荐日期或早期版本日期。②第一单位 "Shenzhen Loop Area Institute" 的官方中文名未能从 PDF 确认，译文保留英文原名并标注"深圳，中国"，待 Lead/原文核验。

## 摘要

无线蜂窝网络是人类社会的结缔组织，依靠工程化基础设施与其周边环境之间持续进行的物理"对话"而维系。基站发出的无线电信号穿越地形、绕射过建筑、散射于街道，最终抵达数十亿用户；这些交互共同塑造了城市尺度的无线电环境，而每一项网络决策都建立在该环境之上。通过部署与优化来塑造这一环境，决定了社会所依赖的连通性；然而在城市尺度上有效学习该环境，并使其能泛化到不同城市与不同部署，仍是未解决的挑战。本文正面回答了这一问题，提出 **ChaRT**——一个从运营网络产生的测量报告中学习可迁移无线电表征的基础模型。这些报告无需专门测量活动即可提供海量的多小区、多波束观测，构成城市尺度学习的可扩展数据基础。ChaRT 在其架构中嵌入波束级角度结构、网络层级与传播体制多样性，并通过**上下文感知掩码波束建模**与**受信道模型约束的增强自蒸馏**进行预训练。我们在单座城市 3,503 个小区产生的**超过十亿条报告**（含 182 亿条波束级观测）上预训练 ChaRT。仅用一套权重，ChaRT 即可在未见城市中重建无线电环境，并迁移到无线电地图构建、新站预测与网络参数调优；仅用 1% 标注数据，它即可支持用户定位、波束预测、传播场景分类与信干噪比估计。所学表征还支持波束空间聚类，用于构建可复用的无线电网格。这些结果确立了 ChaRT 作为面向全网智能的可迁移基础。

## 引言

无线蜂窝网络是现代社会的神经系统，连接逾 50 亿用户，承载通信、感知与 AI 驱动服务，支撑数字经济、自动驾驶与工业自动化 [1]。在整个生命周期（初始部署、日常运维、优化与维护）管理这些网络本质上极具挑战：无线系统行为由物理传播、工程配置与人类活动共同塑造，并随这些因素变化而演化。传统运营商做法——路测活动、试错式参数调优与离线射线追踪仿真——无法扩展到这种耦合的城市级复杂性 [2]。因此**数字孪生网络（digital twin network，DTN）**已成为下一代网络管理的核心范式：用已部署无线电环境的虚拟副本预测网络行为并支持前瞻式优化 [3–6]。实现这一愿景需要这样的模型：它能学习无线电信号如何在复杂环境中传播，并在城市与部署之间迁移该能力，而无需为每种设置重建模型。然而，射线追踪仿真器与标准化无线传播模型（通称信道模型）等基于物理的工具需要详细的站点描述或场景假设 [7–10]，而任务特定的神经模型往往局限于其训练场景。

另一方面，基础模型在语言 [11,12]、视觉 [13,14] 以及遥感 [15]、心脏监测 [16]、基因组学 [17] 等科学领域的成功，指出了一条潜在路径：在广泛多样的无线电数据上预训练单个大模型，使其具备适配下游无线网络优化任务的能力。近期若干**无线基础模型（wireless foundation models，WFMs）**已在物理层探索这一方向，使用信道状态信息（CSI，刻画发射信号沿无线链路如何被改变）或原始 I/Q 采样（记录接收波形的幅度与相位）[18–23]。这些模型是有价值的原理验证，但由于两个结构性原因无法支撑网络级 DTN。在**数据轴**上，核心障碍是维数扩展：CSI 是高维、时变量——单个小区基站可能配备数百天线单元，每用户对应同量级信道矩阵，且其数值随用户移动与环境变化快速波动；跨数千个这样的小区采集真实 CSI 在时间与人力上都极其昂贵。现有 WFM 因此几乎全部在仿真信道上训练，继承了仿真器所编码的假设，而非从真实部署世界学习 [18–20]。在**模型轴**上，核心障碍是表征范围：单链路 CSI 测量本质上是对孤立的单个收发对的观测，编码了由反射、绕射与散射路径到达的无线信号所产生的该链路多径结构，却不携带关于周边网络的任何信息；决定网络性能的量需要跨多个小区的联合观测，而这种信息在任何单链路表征中都结构性缺失，与模型容量无关。

为捕获网络级无线电信息，5G 标准本身提供了自然起点。作为常规运营的一部分，每个活跃用户设备会周期性上报从周边小区观测到的信号强度，该记录被 3GPP 标准化为**测量报告（measurement report，MR）**[24]。无需额外硬件或昂贵测量活动，每天有数十亿条 MR 作为网络运营的自然副产物产生——尽管其中不含位置信息。每条 MR 样本包含跨多个小区与波束的联合观测，提供了可能支撑网络级无线电结构学习的空间与方向线索，而这是单链路 CSI 无法提供的。尽管 MR 数据捕获了全网丰富的多小区、多波束无线电观测，但能否以及如何构建一个跨城市泛化、并能迁移到下游网络管理任务的基础模型，却远非显然。必须解决三个挑战：如何在异构部署间一致地表征波束测量、如何从高度不完整的观测中学习全局传播结构、以及如何在统一模型中捕获支配全网无线电行为的多尺度依赖。

本文提出 **ChaRT（Chameleon Radio Transformer）**，据我们所知这是首个在真实世界、城市级运营 MR 数据上预训练与评估的无线基础模型，数据包含来自单座城市 5G 网络的逾十亿样本与 182 亿条波束级观测（图 1a）。结果表明 MR 数据含有可迁移的网络级传播结构：单套预训练权重无需重训或架构修改，即可泛化到预训练中未观测的城市、频段与部署场景（图 1b）。在 80% 掩码率下的跨城市零样本迁移中，ChaRT 相比 XGBoost 将波束级与小区级 RSRP 重建平均绝对误差（MAE）分别降低 25% 与 34%。在跨城市新站评估中，ChaRT 取得 $R^2=0.62$，而 TabPFN v2 为 $R^2=0.24$，XGBoost、Sionna 与 3GPP TR 38.901 为负值。对天线参数调优，它在五类参数上取得 $R^2=0.60$—0.80，而最强基线为 0.37—0.48。仅用 1% 本地标注数据，ChaRT 把平均定位误差从 111.0 m 降到 62.9 m，把波束预测准确率从 66.9% 提升到 75.4%，在视距/非视距（LoS/NLoS）分类上取得 83.0% 的宏 F1，并把以信干噪比（SINR）度量的干扰感知链路质量估计误差从 2.82 dB 降到 2.48 dB。同一冻结表征还支持波束空间聚类，用于构建空间紧凑且无线电同质的网格。这些结果表明，城市尺度无线电环境可作为可迁移基底被学习，为利用运营商已在采集的数据构建面向网络规划、运维与优化的基础模型开辟了可行路径。

## 结果

我们采集了来自中国运营 5G 网络的大规模 MR 数据集，用于预训练与评估 ChaRT，覆盖三座城市形态、网络密度与频段各异的主要城市（图 1a）。**城市 A**（16×18 km²，2.1/3.5 GHz）是密集城区宏站部署，含 3,503 个小区与逾十亿条 MR 样本，该单城市语料用于基础模型预训练。**城市 B**（8×7 km²，2.6 GHz）是中等密度城区部署，含 280 个小区、60 万条样本，载频不同。**城市 C**（2.5×2.5 km²，3.5 GHz）是稀疏郊区部署，含 16 个小区、70 万条样本。每条 MR 样本观测到数量可变的小区（均值 5.1）与波束——平均每样本含服务小区 5.8 个波束、邻区 8.7 个波束。波束级 RSRP 跨越很宽的动态范围：服务小区波束集中在约 $-90$ dBm，邻区波束分布在约 $-98$ dBm 并带有低于 $-120$ dBm 的长尾（图 1a）。总体上，该数据集覆盖多样的城市环境、网络规模与载频，为评估网络级无线基础模型的泛化提供了实用试验场。

**图 1**：数据基础与 ChaRT 总览。**a**，大规模跨城市 MR 数据集及其统计特性。中央地图标出中国的城市 A、城市 B 与城市 C，周边卫星视图展示其基站部署：城市 A（3,503 小区，2.1/3.5 GHz）、城市 B（280 小区，2.6 GHz）、城市 C（16 小区，3.5 GHz）。左下：每样本观测小区数与服务/邻区上报波束数的分布。右下：服务小区与邻区的波束级 RSRP 分布。**b**，ChaRT 在城市 A 运营 5G 网络的 182 亿条波束级观测上预训练与评估。每条 MR 样本记录多小区、多波束 RSRP 观测，经标记化后送入模型。冻结模型可直接用于零样本网络规划、运维与优化任务（无线电地图构建、新站部署预测、参数调优），或以 1% 标注数据适配有监督下游任务（定位、波束预测、场景分类、SINR 估计）。

基于这一大规模运营数据集，我们评估 ChaRT 在决定基础模型能否服务网络管理生命周期的关键能力上的表现：恢复缺失 RSRP 的能力使运营商得以构建日常管理所依赖的无线电地图；预测未部署站点与天线重配置覆盖的能力使规划与优化决策能在任何物理变更执行之前作出；以极少标签数据支持定位与波束管理等任务的能力，决定模型在新运营环境中部署的效率。这些能力目前各自需要专门测量活动、站点特定模型重训或大量标签数据，因而昂贵且难以在现网中规模化。我们证明，仅用运营 MR 数据训练的 ChaRT，可作为跨城市与跨部署（预训练中完全未见的部署）的城市级蜂窝网络管理实用基础。

### ChaRT 从跨不完整观测重建多波束 RSRP

从跨不完整观测重建多波束 RSRP 是无线电地图构建的前提。因此我们评估 ChaRT 能否从部分多小区、多波束上下文重建缺失 RSRP 值——这是下文所考虑网络生命周期任务背后的核心基础能力。

为厘清泛化维度，我们在三种严苛程度递增的场景下评估：分布内评估（城市 A 内随机划分）、空间外推（城市 A 中地理上不重叠的区域）与跨城市零样本迁移（城市 B 与城市 C，不做微调）。我们把 ChaRT 与均值填补、XGBoost [25] 与 TabPFN v2 [26] 比较。均值填补用同一小区内可用波束的平均 RSRP 填补缺失波束，当目标小区完全缺失时用其余小区的可用波束；其性能表明仅凭可用上下文的平均信号电平能在多大程度上解释缺失 RSRP，而不建模波束特定或小区间传播结构。XGBoost 是强梯度提升树基线，TabPFN v2 是面向表格预测的基于 Transformer 的基础模型。两种基于学习的基线获得与 ChaRT 相同的观测 RSRP 与物理配置的表格表示。我们以 MAE 作为主要工程指标，并辅以归一化均方误差（NMSE）与决定系数（$R^2$）分别刻画归一化重建保真度与解释方差。须线表示逐样本误差的 10—90 百分位，因而刻画异构无线条件下的重建可靠性。

我们评估两种互补的掩码设置。**波束级掩码**在其余已观测小区内隐藏单个波束，评估细粒度方向结构的恢复；**小区级掩码**同时移除所选小区的全部波束，要求模型从其余网络上下文推断完全未观测的小区。掩码率从 20% 到 80%；更高掩码率逐步抑制局部证据，对全局传播推理提出更高要求。

**图 2**：三种泛化设置下的波束级与小区级 RSRP 重建。**a**，波束级重建性能随波束掩码率的变化。**b**，小区级重建性能随小区掩码率的变化（每选定目标小区的全部波束被移除）。曲线给出 ChaRT、TabPFN v2、XGBoost 与均值填补的 MAE、NMSE 与 $R^2$。须线表示逐样本误差分布的 10—90 百分位。各行对应分布内评估、空间外推与跨城市零样本迁移。

**波束级恢复**：在三种场景、每个掩码率下 ChaRT 的 MAE 都最低（图 2a）。分布内评估中，MAE 从 20% 掩码的 1.93 dB 逐渐升至 80% 的 3.17 dB，在 80% 掩码下比 XGBoost（5.05 dB）低 37%、比 TabPFN v2（7.44 dB）低 57%、比均值填补（5.95 dB）低 47%。相对均值填补的巨大差距证实：可用上下文的平均信号电平无法解释波束间的方向性差异；准确恢复需要波束特定的传播建模。

除平均误差外，ChaRT 还显著收窄高误差尾部。分布内 80% 波束掩码下，其逐样本 MAE 的 10—90 百分位区间为 1.20—5.52 dB，而 XGBoost 为 2.21—8.42 dB、TabPFN v2 为 3.27—13.33 dB、均值填补为 2.38—9.77 dB。ChaRT 的 90 百分位误差比 XGBoost 低 34%、比 TabPFN v2 低 59%，表明其在困难传播条件下预测更可靠，而非仅在观测良好的样本上有改善。

该优势在分布偏移下依然保持。80% 波束掩码下，ChaRT 在空间外推与跨城市迁移中分别取得 3.65 dB 与 4.32 dB，相对 XGBoost（5.19 dB 与 5.75 dB）降低 30% 与 25%，相对 TabPFN v2（7.52 dB 与 8.75 dB）均降低 51%。跨城市迁移中 ChaRT 保持 $R^2=0.75$，而 XGBoost 为 0.63、TabPFN v2 为 0.25、均值填补为 0.60。在最温和的跨城市掩码条件（20%）下，XGBoost 的 $R^2$ 与 NMSE 略优于 ChaRT，尽管 MAE 更高；一旦掩码超过 20%，该优势即消失。这些结果表明：当密集上下文可用时，局部相关性与样本级信号均值已经够用；而随着可观测波束上下文减少，ChaRT 的优势日益明显——这恰是波束观测稀疏的运营网络所处的情形。

**小区级恢复**：当整个小区未被观测时 ChaRT 给出最大增益，该设置与网络规划优化相关——必须在不直接测量的情况下预测新站或重配置小区的覆盖（图 2b）。80% 小区掩码下，ChaRT 的 MAE 为 4.35 dB（分布内）、5.44 dB（空间外推）与 5.61 dB（跨城市），相对 XGBoost 降低 43%、29% 与 34%，相对 TabPFN v2 降低 45%、31% 与 38%。

ChaRT 推断的是小区特定的覆盖几何，而不仅是合理的平均信号电平。当目标小区全部波束被隐藏时，均值填补保留了关于整体 RSRP 量级的部分信息，却无法区分不同未观测小区：其跨城市 $R^2$ 从 20% 掩码的 0.54 降至 80% 的 0.25；ChaRT 在相同掩码率下保持 $R^2=0.61$——相对提升 144%——表明所学表征捕获了超出可观测上下文平均信号电平的小区特定 RSRP 结构。尾部可靠性优势同样明显：跨城市 80% 小区掩码下，ChaRT 的 90 百分位 MAE 为 9.03 dB，而 XGBoost 为 13.97 dB（降低 35%）、TabPFN v2 为 16.39 dB（降低 45%），证实 ChaRT 抑制了弱上下文或小区边缘条件下的大误差。

波束级与小区级结果确立了两项互补的基础能力：在部分观测小区内重建方向性波束结构，以及对完全未观测小区推断完整 RSRP 剖面。后者是接下来评估的零样本网络规划与优化任务的基础。

### ChaRT 零样本迁移到网络规划与优化

网络规划与优化要求运营商在物理执行之前评估诸如部署新小区、调整天线参数、重配置波束码本等决策，而目前每一项变更都需要测量活动或站点特定的射线追踪仿真，两者都无法扩展到现代运营商每天执行的数百次重配置。ChaRT 通过同一小区级掩码机制同时解决这两类任务：目标小区被掩码，其完整 RSRP 剖面仅由周边网络上下文预测，无需架构修改、无需标注数据。我们评估两项互补任务：新站部署预测（规划）与天线参数调优（优化）。

对新站预测，我们在空间外推与跨城市零样本迁移两种设置下评估。空间外推设置中，城市 A 中地理上不重叠区域（预训练未见）的 210 个小区被小区级掩码；跨城市场景中，城市 B 中 11 个新部署基站（共 22 个小区）被完全掩码。我们与 TabPFN v2、XGBoost、Sionna 射线追踪引擎 [8] 与 3GPP TR 38.901 统计信道模型 [10] 比较；所有方法获得相同的天线配置与网络上下文。

对参数调优，我们通过使用城市 A 在三个时间轮次采集的训练与测试数据来分离跨天线配置的泛化能力——期间运营商调整了所选小区的参数。模型仅在轮次 1 数据上预训练；测试使用轮次 2 与轮次 3 数据，其中天线参数相对轮次 1 发生变化的小区被小区级掩码，其调优后覆盖由周边上下文与更新后的配置向量预测。我们与 TabPFN v2、XGBoost 以及**局部化统计信道模型（LSCM）**[27] 比较——后者是基于物理的数据驱动方法，通过稀疏恢复从 RSRP 估计信道角度功率谱，并通过修改后的波束成形图样矩阵预测调优后覆盖。用于渲染地图的匿名化 UE 坐标取自通过知情用户众包计划 [28] 采集的带位置标注 MR 子集；相应测量与预测仅为可视化而做空间插值。

**新站部署预测**：ChaRT 仅用周边网络上下文预测没有任何目标站点测量的新小区覆盖。城市 A 的空间外推下（图 3a），**同站扩展小区**性能最高（$R^2=0.72$，MAE$=4.91$ dB），其目标小区与在用小区共享既有基站站址；其次是**跨频段小区**（$R^2=0.67$，MAE$=5.25$ dB），即在既有站址上以不同载频工作；再其次是**绿地新站**（$R^2=0.55$，MAE$=5.71$ dB），即引入新基站及其小区。该排序与每类部署可获得的跨小区上下文量一致。

在绿地场景中，ChaRT 在所评估方法中取得最高的覆盖预测性能：$R^2=0.55$，而 TabPFN v2 为 0.28；XGBoost、Sionna 与 3GPP TR 38.901 分别给出 $R^2=-0.62$、$-0.71$ 与 $-0.52$。射线追踪依赖详细的三维建筑几何、材料属性与站点特定校准，而统计信道模型缺乏方向性覆盖预测所需的局部环境信息。ChaRT 的表现与其预训练表征捕获天线配置、小区间几何与接收信号强度之间可迁移关系相符。

该优势延伸到跨城市迁移。对预训练未观测的城市 B 的新基站站址（图 3a），ChaRT 取得 $R^2=0.62$、MAE 为 5.28 dB，比 TabPFN v2（$R^2=0.24$、MAE$=6.92$ dB）的 MAE 低 38%；XGBoost、Sionna 与 3GPP TR 38.901 给出负 $R^2$。扩展数据图 1 中的无线电地图显示，ChaRT 的预测更贴合观测到的波束方向性、随距离的信号衰减与局域空间变化。这些结果表明 ChaRT 可支持初步候选站点筛选，同时减少对测量活动与逐站点模型校准的依赖。

**参数调优预测**：ChaRT 能准确预测天线调整后覆盖如何变化，使运营商可在部署前评估候选配置。我们评估城市 A 一次真实优化活动中的五类参数——天线机械方位角、机械下倾角、发射功率、天线电下倾角与波束码本——各采集轮次中被调整小区数汇总于扩展数据表 2（图 3b）。仅给定调优后的天线配置与周边网络上下文，ChaRT 在全部五类参数上取得 $R^2=0.60$—0.80，相对最强基线（TabPFN v2，$R^2=0.37$—0.48）在解释方差上有 25—40% 的相对差距。发射功率精度最高（$R^2=0.80$，MAE$=4.38$ dB），符合"功率变化近似一致地缩放 RSRP"的预期。天线机械方位角与机械下倾角更具挑战，因为它们方向性地重新分配辐射能量；ChaRT 仍保持 $R^2$ 为 0.60 与 0.62，而 XGBoost 给出负 $R^2$，LSCM 保持在 $R^2=0.28$ 以下。

LSCM 在 RSRP 与信道角度功率谱之间建立统计映射，但从单小区低维且不完整的 RSRP 观测恢复高维稀疏信道结构本质上是不适定的。ChaRT 通过以多小区网络上下文为条件绕过这一局限：周边小区的 RSRP 图样共同约束目标小区的传播环境，而模型已从数百万条运营 MR 样本中学到利用这一关系。ChaRT 的 10—90 百分位 MAE 在各参数类型上约为 XGBoost 的一半，表明其在多样传播条件下预测更可靠。

扩展数据图 2 的无线电地图比较显示，ChaRT 捕获了参数特定的覆盖效应。每类参数引起不同的空间印记：方位角与下倾角改变主波束朝向，发射功率改变覆盖足迹，波束码本重配置修改方向性图样；ChaRT 紧密复现这些变化的方向与幅度。LSCM 捕获了重配置后波束图样的方向偏移，但由于单小区 APS 恢复不适定而产生不准确的绝对 RSRP 值。XGBoost 产生噪声图样，尤其在叠加足迹中可见的建筑簇附近；而 TabPFN v2 产生平滑但方向不准的输出。插图放大进一步显示 ChaRT 追踪了调优后覆盖的局域空间再分配，与模型捕获观测 RSRP 图样中参数相关变化一致。

综上，新站与参数调优的结果表明，ChaRT 已从运营数据中学到可迁移的无线电传播知识，并能跨城市与跨天线参数泛化。所评估基线——代表当前最强的表格、树模型与物理启发方法——在所有需要联合推理网络上下文与天线配置的设置中均失败。对运营商而言，这意味着计划中的部署或天线配置变更的覆盖影响可在一次前向传播中估计，从而支持候选筛选并减轻传统工作流的测量与校准负担。

**图 3**：零样本网络规划与优化。**a**，空间外推与跨城市迁移下的新站预测。前三行分别报告城市 A 的同站扩展小区、跨频段小区与绿地新站；第四行报告预训练未观测的城市 B 中新部署基站。比较包含 ChaRT、TabPFN v2、XGBoost、Sionna 与 3GPP TR 38.901。**b**，城市 A 中对机械方位角、机械下倾角、发射功率、电下倾角与波束码本作变更后调优覆盖的预测。比较包含 ChaRT、TabPFN v2、XGBoost 与 LSCM。点为均值，水平条为（可得时）10—90 百分位。

**扩展数据图 1**：城市 B 跨城市零样本新站部署的无线电地图比较。每行对应一个位于地图中心的目标小区。建筑足迹叠加以指示周边城市环境。各列展示实测 RSRP 以及 ChaRT、TabPFN v2、XGBoost、Sionna 与 3GPP TR 38.901 模型的预测。RSRP 以 dBm 显示，插图放大呈现明显空间变化的区域。用于渲染地图的匿名化 UE 坐标取自通过知情用户众包计划 [28] 采集的稀疏带位置标注 MR 子集；测量与预测仅为可视化而做空间插值。

**扩展数据图 2**：天线参数调优下的无线电地图比较。每行给出一个被调整某项运营参数的代表性小区。自上而下依次涉及机械方位角、机械下倾角、发射功率、电下倾角与波束码本，对应设置分别从 $0^\circ$ 变到 $350^\circ$、$4^\circ$ 变到 $7^\circ$、每资源单元 $-0.2534$ 变到 $1.747$ dBm、$3^\circ$ 变到 $6^\circ$、波束码本索引 0 变到 7。目标小区位于各地图中心，建筑足迹指示周边城市环境。各列展示调优前后的实测 RSRP 以及 ChaRT、TabPFN v2、XGBoost 与 LSCM 的调优后预测。用于渲染地图的匿名化 UE 坐标取自知情用户众包计划 [28] 采集的稀疏带位置标注 MR 子集；测量与预测仅为可视化而做空间插值。

### ChaRT 支持数据高效的下游任务适配

预训练表征通过附着在冻结骨干上的轻量任务特定头支持五项下游应用：用户定位、波束预测、传播场景分类、SINR 估计与波束空间聚类（图 4a）。这些头不参与骨干预训练。对四项预测任务，相应的头在用城市 A 标注样本训练时保持预训练骨干冻结；随后评估跨城市迁移——把城市 A 训练的头直接用于目标城市（0%）而不做目标城市适配，或用 1% 或 10% 目标城市标注样本仅更新该头。1% 设置作为主要少样本配置被突出。对波束空间聚类，嵌入头把无线电数据空间划分为可复用无线电网格，供下游网络建模与分析。

对四项预测任务，我们用相同输入特征与三个通用基线比较——TabPFN v2、XGBoost 与任务特定 MLP。定位任务另含加权 $k$ 近邻（WKNN）指纹法 [29]；SINR 估计另含基于 RSRP 的参数模型（脚注 1），由服务小区功率与邻区聚合干扰之比估计 SINR。波束空间聚类的基线与评估协议在相应结果处一并说明。

> **脚注 1**：该参数模型估计 $\widehat{\mathrm{SINR}}=\alpha_s\cdot 10^{\mathrm{RSRP}_s/10}/\left(\alpha_I\sum_{c\in\mathcal N}10^{\mathrm{RSRP}_c/10}+\sigma^2\right)$，其中 $\mathrm{RSRP}_s$ 为服务小区功率、$\mathcal N$ 为上报邻区集，$(\alpha_s,\alpha_I,\sigma^2)$ 在验证集上以最小二乘拟合。

**用户定位**：从网络侧测量准确定位用户对基于位置的服务至关重要，但采集传统方法所需的密集指纹数据库在城市尺度上极其昂贵 [30]。由于协议约束与实际考量（含隐私法规），MR 数据按设计不含用户位置；不过通过众包计划（知情用户允许专有应用周期性上报 GPS 坐标与信号测量）可使一小部分 MR 样本带位置标注 [28]，这些稀疏带标注样本提供定位标签。无目标城市适配时，ChaRT 的平均定位误差为 111.0 m，比 XGBoost（152.3 m）低 27%、比 MLP（186.6 m）低 41%。这表明预训练表征已编码仅凭 RSRP 图样的粗糙空间结构（图 4b）。仅用 1% 标注数据，平均误差降到 62.9 m，在相同比例下相对最强基线（XGBoost，116.8 m）降低 46%。用 10% 时 ChaRT 达到 40.9 m，相对 WKNN（68.4 m）降低 40%、相对 XGBoost（89.2 m）降低 54%、相对 TabPFN v2（101.6 m）降低 60%。1% 处的显著改善与 10% 处的递减收益表明，预训练已捕获大部分相关空间结构，标注样本主要校准从所学表征到坐标的映射。

**波束预测**：为每个用户预测最强波束是 5G 网络中波束管理、初始接入与切换的核心 [31]。无目标城市适配时 ChaRT 的 top-1 准确率为 66.9%，比最强基线（MLP，44.3%）高 22.6 个百分点，表明无线特定预训练比基线从相同输入特征中学到的更能有效捕获波束级方向结构（图 4c）。仅用 1% 标注数据，ChaRT 达到 75.4%，已超过用 10% 标注数据训练的所有基线；用 10% 时达到 80.8%，比次优方法（TabPFN v2，62.3%）高 18.5 个百分点。随标签增多优势持续，表明仅靠下游监督无法完全替代预训练中获得的方向结构。

**场景分类**：区分视距（LoS）与非视距（NLoS）传播对自适应链路管理、切换优化与信道模型选择很重要，但运营网络中几乎无法获得真实传播标签。（0% 迁移时）基线宏 F1 为 62—66%（图 4d）。差距出现在数据稀缺区间：仅用 1% 标注数据，ChaRT 达到 83.0%，比 MLP（76.8%）高 6.2 个百分点、比 TabPFN v2（82.0%）高 1.0 个百分点。用 10% 时 ChaRT 达到 86.7%，而 XGBoost 为 86.1%、TabPFN v2 为 83.8%、MLP 为 81.5%。基于学习的方法在较大数据比例下收敛，表明在标签充足时 LoS/NLoS 传播是可分的，而 ChaRT 的优势集中在标注样本稀缺的区间。

**SINR 估计**：准确 SINR 估计是链路自适应、调度与干扰管理的基础，但需要关于服务信号与周边小区干扰的联合信息。直接从线性功率 RSRP 比值估计干扰的参数 SINR 模型在所有评估数据比例下 MAE 均高于 5 dB，表明仅凭原始功率比不足以准确估计（图 4e）。无目标城市适配时 ChaRT 的 MAE 为 2.82 dB，而 TabPFN v2 为 2.91 dB、MLP 为 3.03 dB、XGBoost 为 3.56 dB。用 1% 标注数据，MAE 降至 2.48 dB——比 TabPFN v2（2.71 dB）低 9%、比 XGBoost（3.02 dB）低 18%。用 10% 时 ChaRT 达到 2.18 dB，相对最强基线（XGBoost，2.42 dB）保持 10% 优势。由于 SINR 无法仅由单小区观测可靠推断，该结果直接证明预训练表征捕获了网络级干扰信息。

**波束空间聚类**：把传播条件相似的 MR 样本分组，可使网络优化在无线电网格上进行，而非把每次测量独立处理。我们把 ChaRT 与 BeamRSRP（直接在波束 RSRP 空间聚类）、OMP-APS（先由 RSRP 重建角度功率谱再聚类）以及 Channel Space Gridization Autoencoder（CSG-AE）[32] 比较。该实验中所有方法构建 $K=20{,}480$ 个网格。ChaRT 嵌入头在轮次 1 与 2 上用深度嵌入聚类（DEC）[33] 精化，随后冻结所学网格中心，在轮次 3 上做分配与评估。如图 4a 所示，ChaRT 取得最小的样本加权网格内平均半径 128.2 m，相对 BeamRSRP 降低 23.8%；它同时取得最低的 CellRSRP MAE 5.72 dB，分别优于 CSG-AE、OMP-APS 与 BeamRSRP 1.04 dB、1.56 dB 与 1.64 dB。BeamRSRP 的 BeamRSRP MAE 最低，因为它直接在评估所用的测量空间中聚类；尽管如此 ChaRT 仅落后 0.12 dB，同时分别优于 CSG-AE 与 OMP-APS 0.35 dB 与 0.68 dB。扩展数据图 3 的 t-SNE 可视化给出表征结构的定性视图：ChaRT 学到的表征形成更紧凑、分离更清晰的组，而基线表征呈现更强的跨网格混合。综合而言，这些结果表明 ChaRT 在保持波束级无线电同质性的同时，产生在物理空间上更紧凑、在小区级上更一致的无线电网格。

在四项预测任务中，ChaRT 从同一冻结骨干迁移到连续坐标、二值传播标签、离散波束索引与标量干扰估计，在所有评估数据比例上取得一致增益；其优势在数据稀缺区间最明显，1% 标注样本即可实现有效的任务适配。波束空间聚类进一步证明同一表征可把 MR 样本组织为空间紧凑、无线电同质的网格。综合而言，这些结果表明 ChaRT 编码的是无线电环境的通用描述，可高效特化到多样运营应用，而非必须为每个任务重建的任务特定特征空间。

**图 4**：冻结 ChaRT 表征的下游适配与评估。**a**，冻结骨干把 MR 观测编码为共享表征；轻量回归、分类与嵌入头支持四项预测任务与波束空间聚类。预测头用城市 A 标注样本训练后迁移到目标城市，嵌入头则把 MR 样本组织为可复用无线电网格。**b**，跨城市性能：从左到右依次为用户定位、最强波束预测、LoS/NLoS 场景分类与 SINR 估计。任务特定基线对用户定位为 WKNN、对 SINR 估计为基于 RSRP 的参数模型。**c**，在留出轮次 3 数据上的波束空间聚类性能。点为均值，水平条为 10—90 百分位；较低值表示更好的空间紧凑性或无线电同质性。

**扩展数据图 3**：留出轮次 3 数据上波束空间聚类表征的潜在组织。对各方法 50 个代表性无线电网格给出 t-SNE 投影，颜色表示网格分配。该投影用于定性比较跨网格混合与所学表征空间的组织方式，不用于量化簇分离或下游性能。

### ChaRT 的扩展随模型规模与同城数据量趋于饱和

ChaRT 随模型规模与预训练数据量增大而持续改善，但二者的边际收益都在减小（图 5）。我们把模型容量从 50 万参数变到 1.8 亿参数、把预训练数据量从 1000 万 MR 样本变到 10 亿（均取自城市 A 语料）。训练与测试区域地理上不重叠，泛化在留出空间区域以 40% 小区掩码率评估。

增加模型容量在每个数据规模下都降低 MAE，但每增加一个参数带来的改善迅速减小（图 5a）。在 10 亿预训练样本下，模型从 50 万参数增至 3500 万参数使 MAE 降低 0.33 dB，而进一步增至 1.8 亿参数只额外降低 0.08 dB。该趋势在考虑的各数据规模上一致。虽然 1.8 亿参数模型在整个扩展网格上优于 3500 万参数版本，但平均改善仅 0.07 dB。

增加同城预训练数据量呈现类似的递减收益模式（图 5b）。对 3500 万参数模型，把训练集从 1000 万增至 1.5 亿样本使 MAE 从 5.73 降至 5.57 dB，占 1000 万到 10 亿样本间总改善的 89%；超过 5 亿样本后性能变化很小，5 亿与 10 亿样本的 MAE 均为 5.55 dB。该效应也与模型规模有关：数据量增大 100 倍对 50 万参数模型降低 MAE 0.50 dB，而对 3500 万参数模型仅降低 0.18 dB。这些结果表明，随着语料增大，来自同一城市的额外测量提供的信息逐渐减少。联合扩展网格表明，在所评估设置下，超过约 3500 万参数与 5 亿 MR 样本后进一步改善有限（图 5c）。

对运营商而言，所观察到的饱和意味着：一旦更大模型与更多同城样本的收益开始递减，扩展工作应日益优先考虑数据多样性。把预训练扩展到更多城市、频段与部署配置，可能比进一步提高单城市内采样密度使模型接触更广的传播条件范围。这种扩展在运营上可行，因为 MR 由 3GPP 标准化并在已部署蜂窝网络中例行产生。

**图 5**：ChaRT 随模型规模与预训练数据量的扩展。**a**，在 1000 万到 10 亿 MR 样本的五个预训练数据规模下，验证 MAE 随模型规模的变化。**b**，对五种模型规模，验证 MAE 随预训练样本数的变化。**c**，联合扩展网格，颜色表示 MAE（dB）。整个网格的 MAE 从 6.38 变到 5.47 dB，对应总改善 0.91 dB；大部分改善发生在小模型、数据量较小的区间。

## 讨论

ChaRT 把无线机器智能从单链路、任务特定建模推进到从已部署蜂窝系统的网络级观测中进行可迁移学习。通过联合编码 MR 与物理小区配置，模型学到共享表征，支持无线电环境重建、网络规划与数据高效下游推断。其在所评估城市上的表现为如下判断提供了证据：小区、波束、配置与传播条件的耦合结构可以在一个共同模型中学习，而不必为每个站点与应用分别重建。更广泛地说，结果表明当观测与产生它们的配置相配对时，结构化运营数据可支撑大规模无线物理系统的可迁移建模。

这一共享表征为网络决策提供了共同的预测基础：无线电地图构建、新站评估与参数调优可表达为对同一模型的不同查询，而定位、波束预测与干扰感知估计只需轻量任务特定头与有限的目标城市监督。在未来的闭环系统中，运营测量可更新模型，网络控制器可用其预测评估候选动作。本研究建立了此类系统的预测组件，但与控制策略的集成以及对端到端网络目标的前瞻评估仍是开放问题。

本研究也界定了上述结论的范围。预训练使用城市 A 的数据，而迁移在两个额外城市与 sub-6 GHz 部署上评估，提供了跨不同网络密度、频率与部署条件的证据；仍需跨运营商、地区与网络架构的更广泛验证。MR 反映活跃用户的位置与运营商定义的报送策略，而非对物理环境的均匀采样，可能对低流量区域、弱覆盖区域与罕见传播条件表征不足。此外，ChaRT 当前产生点预测，不提供校准的不确定性估计。对参数调优，回顾性评估展示了真实运营变更下的预测精度，但量化其因果效应仍需前瞻性干预。当前结果支持预测、候选筛选与运营商决策支持，而校准不确定性与前瞻性验证是迈向自主闭环控制的下一步。

未来工作应跨运营商、地区、频段与部署类型扩展预训练，以判断更大的数据多样性能否在更大分布偏移下改善迁移。时间索引测量、流量状态、建筑几何与其他环境模态可支持对无线电环境如何演化并响应网络干预的动态建模。校准不确定性、更强的物理约束与分布外检测对判断何时可信任预测很重要。最终，需要前瞻性闭环试验来确定由所学表征驱动的决策是否能在真实运营变更下改善网络级性能。

## 方法

我们设计了一套统一方法，在 5G 大规模 MR 数据上预训练单个模型，使其学到可跨多样网络条件迁移的无线电传播表征。该方法包含五个组成部分：(i) **数据流水线**，摄入中国三座城市运营 5G 网络中超过十亿条 MR 样本，含约 182 亿条波束级观测，覆盖 3,799 个小区（载频 2.1、2.6 与 3.5 GHz，各城市统计见扩展数据表 1）；(ii) **建模框架**，把从无线电地图构建到网络参数调优的多样网络智能任务表述为同一**掩码波束预测目标**的实例；(iii) **物理启发的模型架构**，把波束级角度结构、网络层级与传播体制多样性嵌入统一的标记化器、注意力机制与专家混合设计；(iv) **上下文自蒸馏预训练策略**，在师生框架内统一掩码波束重建与表征对齐以防止局部插值塌缩，并通过传播不变量采用受信道模型约束的增强以促进跨多样网络配置的泛化；以及 (v) **应用协议**，使冻结模型通过不同掩码配置服务零样本运营任务，或以极少标注数据适配有监督下游任务。以下各节详述各组成部分；在城市 A 固定空间外推设置下的渐进消融进一步分离了各架构与预训练组件的贡献（扩展数据表 3）。

**数据采集与处理**：从中国三座城市的运营 5G 网络采集了超过十亿条 MR 样本（约 182 亿条波束级观测）。MR 由 3GPP 标准化 [24]，由用户设备在网络例行运营（含切换与周期上报）中自动生成，无需额外测量活动或专门基础设施。每条样本记录多波束 RSRP 值以及服务小区与邻区的标识。相应的小区配置——包括天线图样、位置、发射功率、载频、部署属性（宏站或非宏站、室内或室外）——从运营商的网络管理系统获取，并与 MR 数据离线关联。所有 UE 标识均被移除；匿名化 UE 坐标仅保留用于定位与地图可视化的带位置标注众包子集，其余 MR 样本不含位置信息。

**MR 观测模型**：每条 MR 样本被表示为无序集合 $\bigcup_{i=1}^{N}\{(c_{i,j},y_{i,j})\}_{j=1}^{M_i}$，其中 $N$ 为检测到的小区数，$M_i$ 为小区 $i$ 上报的波束数，$y_{i,j}$ 为第 $j$ 个波束的 RSRP 值，$c_{i,j}$ 为编码该波束物理身份的配置向量——包括波束辐射方向图、相对小区位置（脚注 2）、发射功率、载波波长与部署属性。$c_{i,j}$ 中若干项在同一小区的所有波束间共享（相对位置、功率、波长、部署属性），而波束辐射方向图逐波束不同。

> **脚注 2**：相对小区位置以同一 MR 样本中的服务小区为参照，从而减少对部署特定绝对坐标的依赖。

**信道模型基础**：$c_{i,j}$ 的关键组成部分是波束辐射方向图 $a_{i,j}$，定义为波束成形图样矩阵 $\mathbf A_i$ 的第 $j$ 行。在局部化统计信道模型 [27] 下，期望多波束 RSRP 向量 $\mathbf y_i\in\mathbb R^{M_i}$ 通过下式与信道角度功率谱（APS）$\mathbf x_i\in\mathbb R^{N_A}$ 相联系：

$$
\mathbf y_i=\mathbf A_i\mathbf x_i,\tag{1}
$$

其中 $\mathbf A_i\in\mathbb R^{M_i\times N_A}$ 由天线配置与波束码本决定，$N_A$ 为角度格数。这一线性关系促成了 ChaRT 的两项设计选择：标记化器通过辐射方向图行 $a_{i,j}$ 编码每个波束，使模型显式获知每个波束的角度选择性；预训练增强则通过在（1）上做稀疏恢复从观测波束重建近似信道 APS [27]，为教师网络产生物理一致的增强视图。

**掩码波束建模目标**：ChaRT 通过称为**上下文感知掩码波束建模（MBM）**的自监督目标预训练，沿用可扩展表征学习中更广泛的掩码重建范式 [34]。掩码策略把集合 $\mathcal S$ 划分为可见上下文集 $\mathcal S^c$ 与隐藏目标集 $\mathcal S^t$。模型学习预测器 $f_\Theta$。给定观测子集 $\mathcal S^c$ 与目标波束的物理配置，预测器估计被掩码的条目；参数 $\Theta$ 通过在训练语料 $\mathcal D$ 上最小化复合目标来优化：

$$
\min_{\Theta}\ \frac{1}{|\mathcal D|}\sum_{\mathcal S\in\mathcal D}\mathcal L\left(f_\Theta,\mathcal S^c,\mathcal S^t\right),\tag{2}
$$

其中 $\mathcal L$ 把重建监督与强制表征质量的辅助正则项结合；精确分解见下文"预训练 ChaRT"一节。通过该统一目标在大规模 MR 数据上预训练，模型习得对无线电传播的一般理解，可直接应用或高效适配到广泛的网络智能下游任务。

**架构**：ChaRT 的架构由蜂窝无线数据的三个物理先验塑造（图 6）：(i) 每个波束测量通过已知辐射方向图探测传播环境的特定角度扇区，这促成**物理启发的标记化器**——通过波束辐射方向图与小区几何编码波束身份，而非使用固定的单元或波束索引（图 6a）；(ii) 无线电传播呈现自然的两级层级——由局部散射环境支配的小区内波束相关性，以及由空间几何塑造的小区间依赖——这促成**层级掩码注意力**机制（图 6b）；(iii) 网络中各小区呈现需要专门处理的多样信道结构，这促成**信道结构引导的专家混合（CSG-MoE）**，把小区路由到体制特定的专家（图 6c）。

**测量报告标记化器**：MR 数据中每个波束观测到的 RSRP 由发射小区的物理配置与传播环境共同决定。为使模型能解耦这些因素并推理配置变化如何影响覆盖，标记化器显式把"观测到了什么（信号强度）"与"由哪个物理实体产生（波束与小区身份）"绑定，这与依赖固定顺序位置编码的标准序列标记化器形成对照。

对小区 $i$ 的第 $j$ 个波束，构造两个并行嵌入（图 6a）。RSRP 分支中，所有测量在标记化前转换到对数 dBm 尺度以压缩动态范围并改善数值稳定性；**RSRP 嵌入**通过多层感知机（MLP）把每个标量值 $y_{i,j}$ 映射为 $\mathbf e^{\mathrm{rsrp}}_{i,j}\in\mathbb R^d$。**指令嵌入** $\mathbf e^{\mathrm{inst}}_{i,j}\in\mathbb R^d$ 编码测量的物理身份：离散部署属性通过可学习查找表（LUT）映射，而连续属性——波束辐射方向图 $a_{i,j}$、相对小区位置 $\mathbf u_i$、发射功率 $P_i$ 与载波波长 $\lambda_i$——通过 MLP 编码。球谐函数（SH）为表示复杂天线辐射方向图提供了保留角度结构的紧凑基 [35]：原始图样 $a_{i,j}$ 在 $72\times91$ 角度网格上以方位 $5^\circ$、下倾 $2^\circ$ 间隔采样，得 6,552 个值；其 SH 展开截断到阶数 $L=15$ 产生 $(L+1)^2=256$ 个系数，在保留区分波束所需角度信息的同时把维数降低 25 倍。

对已观测波束，最终嵌入为 $\mathbf e_{i,j}=\mathbf e^{\mathrm{inst}}_{i,j}$，构成**上下文标记**。对被掩码或原本缺失的波束，RSRP 分量替换为可学习掩码嵌入 $\mathbf e^{\mathrm{mask}}\in\mathbb R^d$，得 $\mathbf e_{i,j}=\mathbf e^{\mathrm{inst}}_{i,j}+\mathbf e^{\mathrm{mask}}$，构成**查询标记**。由于每个波束的身份通过 $c_{i,j}$ 而非固定索引编码，且后续 Transformer 块不使用依赖顺序的位置编码，该架构是**置换等变**的 [36]：重排小区或波束只会重排相应输出而不改变其值，使 ChaRT 能适应 MR 样本的无序与变长结构。

**层级掩码注意力**：MR 数据呈现两级物理层级：每个小区内，波束级 RSRP 相关性由波束成形图样与局部多径结构支配；跨小区，依赖关系反映空间传播几何与小区间干扰。同时学习这两级结构至关重要——波束级恢复利用小区内相关重建单个缺失波束，而小区级预测需要跨小区推理以推断完全未观测站点的无线电环境。为避免在所有波束上施加全局注意力（这会混淆两个尺度并带来总波束数的二次代价），编码器被分解为浅层**小区内块**与深层**小区间块**（图 6b）。

在小区内块中，注意力限制在同一小区的波束之间。波束级注意力掩码阻止被掩码波束充当键，同时允许它们作为查询关注可见波束，确保每个小区的表征仅由观测测量构建，不发生被掩码条目的信息泄漏。小区内块之后，逐波束隐藏状态经均值池化压缩为单个小区级标记：

$$
\mathbf h_i=\frac{1}{M_i}\sum_{j=1}^{M_i}\mathbf h_{i,j}.
$$

深层小区间块随后在小区标记上施加类似的小区级掩码，使模型能推理跨网络的空间关系。这种两级分解映射蜂窝数据的物理层级，在单次前向传播中同时捕获小区内波束相关性与小区间传播几何。

**信道结构引导的专家混合**：网络中不同小区呈现多样信道结构，体现为不同的主导传播方向与多径剖面；单一共享前馈网络必须在这些异质体制间平均，限制其捕获结构特定图样的能力。为此，ChaRT 把每个小区间 Transformer 块中的前馈网络替换为**专家混合（MoE）**模块，按主导信道结构对每个小区级标记进行路由（图 6c）。受 DeepSeekMoE [37] 的共享专家隔离策略启发，MoE 模块由一个共享专家 $\mathrm{SE}(\cdot)$ 与 $E$ 个路由专家 $\{\mathrm{RE}_e(\cdot)\}_{e=1}^{E}$ 组成，各自实现为两层 MLP。共享专家处理每个小区标记以捕获跨信道体制共有的传播图样，而 top-1 路由策略仅激活门控概率最高的路由专家以建模结构特定特征：

$$
\mathrm{MoE}(\mathbf h_i)=\mathrm{SE}(\mathbf h_i)+\mathrm{RE}_{e^\star}(\mathbf h_i),\qquad e^\star=\arg\max_{e\in\{1,\ldots,E\}}p_e(\mathbf h_i),\tag{3}
$$

其中 $p_e(\mathbf h_i)$ 为分配给专家 $e$ 的路由概率。轻量门控网络把每个小区标记投影为 $E$ 个路由 logit，并施加 softmax 得到归一化概率分布 $p_e(\mathbf h_i)$。

标准 MoE 路由仅从端任务目标学习，因而不能保证专家特化对应物理上有意义的传播体制。为使路由决策与信道结构对齐，我们用**辅助最强波束预测任务**监督门控网络：由于每个波束照亮由其辐射方向图决定的特定角度扇区，最强波束索引为主导传播方向提供了物理代理。该辅助目标鼓励每个路由专家专门处理与相干主导传播方向关联的小区级标记（图 6c 右）。对代表性小区的空间分析给出了该机制的定性证据：与不含辅助最强波束目标的 vanilla MoE 相比，CSG-MoE 产生更连续、更具方向组织的专家区域，并跟随最强波束划分（扩展数据图 4）；因此它无需显式环境标签即可按信道结构划分表征空间。相应的辅助损失在下文预训练目标中定义。

**预训练 ChaRT**：把标准掩码重建直接用于稀疏 MR 数据有退化为局部插值的风险——模型学会通过平均邻近观测值填补缺失波束，而非编码跨城市迁移所需的全局传播结构。为克服该局限，ChaRT 采用**上下文自蒸馏**策略，把波束级重建与物理一致视图间的表征级对齐相结合（图 6d）。

**师生框架**：（2）中引入的预测器 $f_\Theta$ 分解为三部分：骨干编码器 $\mathcal E_\theta$（上文所述层级 Transformer）、把编码器输出映射为逐波束 RSRP 预测的重建头 $h_\psi$、以及把编码器输出映射到归一化嵌入空间用于表征对齐的投影头 $g_\phi$；完整参数集为 $\Theta=\{\theta,\psi,\phi\}$。

预训练期间维护编码器的两个副本：由梯度下降更新的**学生** $\mathcal E_{\theta_s}$，以及按学生权重指数移动平均（EMA）更新的**教师** $\mathcal E_{\theta_t}$：$\theta_t\leftarrow\lambda\theta_t+(1-\lambda)\theta_s$，衰减 $\lambda=0.996$。给定一条 MR 样本，掩码策略为学生产生部分上下文 $\mathcal S^c$；同时受信道模型约束的增强为教师产生完全可见的增强视图 $\mathcal S'$。学生从复合损失获得梯度，教师通过其 EMA 平滑参数提供缓慢演化且稳定的对齐目标。

**预训练目标**：（2）中的复合损失 $\mathcal L$ 分解为四项，各自应对不同的学习需求：

$$
\mathcal L_{\mathrm{total}}=\underbrace{\mathcal L_{\mathrm{rec}}}_{\text{波束重建}}+\beta\underbrace{\mathcal L_{\mathrm{dist}}}_{\text{表征对齐}}+\alpha_1\underbrace{\mathcal L_{\mathrm{aux}}}_{\text{专家路由}}+\alpha_2\underbrace{\mathcal L_{\mathrm{reg}}}_{\text{缺失波束惩罚}},\tag{4}
$$

其中 $(\beta,\alpha_1,\alpha_2)=(1.0,0.1,0.1)$。

**掩码波束重建（$\mathcal L_{\mathrm{rec}}$）** 驱动学生从部分上下文恢复被掩码目标波束的 RSRP 值：

$$
\mathcal L_{\mathrm{rec}}=\sum_{(c,y)\in\mathcal S^t}\left|y-h_\psi\left(\mathcal E_{\theta_s}(\mathcal S^c,c)\right)\right|.\tag{5}
$$

**表征对齐（$\mathcal L_{\mathrm{dist}}$）** 通过迫使学生对被掩码上下文的表征与教师对完整增强视图的表征全局一致，防止模型依赖局部插值。两个编码器输出经投影头 $g_{\phi_s}$ 与 $g_{\phi_t}$ 投影到归一化空间，经温度缩放 softmax 转为概率分布，并用交叉熵比较：

$$
\mathcal L_{\mathrm{dist}}=-\sum_{k=1}^{K}P_t^{(k)}\log P_s^{(k)},\tag{6}
$$

其中 $P_s$ 与 $P_t$ 为学生与教师在 $K$ 维上的分布，温度分别为 $\tau_s$ 与 $\tau_t$（$\tau_t<\tau_s$）。教师分布在 softmax 前由批次级 EMA 偏置中心化以防止表征塌缩 [38]。合起来，$\mathcal L_{\mathrm{rec}}$ 提供细粒度 RSRP 级监督，而 $\mathcal L_{\mathrm{dist}}$ 强制全局语义一致性，鼓励模型编码传播结构而非局部插值捷径。

**专家路由（$\mathcal L_{\mathrm{aux}}$）** 是交叉熵损失，通过上文最强波束预测任务监督 CSG-MoE 门控网络：

$$
\mathcal L_{\mathrm{aux}}=-\sum_{i}\sum_{e}\mathbb I(b^\star=e)\log p_e(\mathbf h_i),\tag{7}
$$

其中 $b^\star$ 为小区 $i$ 中最强观测波束的索引，$p_e(\mathbf h_i)$ 为路由概率。该损失使专家分配与主导传播方向对齐。

**缺失波束惩罚（$\mathcal L_{\mathrm{reg}}$）** 处理原始 MR 中因上报过滤或波束故障而缺失的波束。由于这些条目没有真实 RSRP，我们施加铰链惩罚以阻止不合理地强的预测：

$$
\mathcal L_{\mathrm{reg}}=\sum_{m\in\mathcal M}\max\left(0,\hat y_m-y_{\min}\right),\tag{8}
$$

其中 $\mathcal M$ 为原本缺失波束集合，$y_{\min}$ 为该小区可见波束中上报 RSRP 的最小值。

**多粒度掩码策略**：推理时 ChaRT 必须同时处理波束级查询（重建已观测小区内单个缺失波束）与小区级查询（预测完全未观测小区的覆盖）。为确保模型在训练中遇到两种粒度——这是学会在两个层级预测的必要条件 [39]——我们采用多粒度掩码策略：以概率 $p_{\mathrm{intra}}=0.4$ 对样本施加**波束级掩码**（每个小区内随机子集波束被隐藏）；以概率 $1-p_{\mathrm{intra}}$ 施加**小区级掩码**（随机选取小区的全部波束被隐藏）（图 6d 左）。掩码率在 20%—80% 间均匀采样，使模型接触部署中遇到的完整稀疏度范围。

**受信道模型约束的增强**：为教师视图 $\mathcal S'$ 设计有效增强，需要识别并扰动物理上有意义的参数——发射功率、波束码本、天线朝向——同时保持无线电传播的结构不变量。（1）中的信道模型提供了关键分解：它把每个观测分解为**配置相关分量**（波束成形图样矩阵 $\mathbf A$ 与发射功率）与**环境相关分量**（信道 APS $\mathbf x$），其线性映射 $\mathbf y=\mathbf A\mathbf x$ 即任何有效增强都必须遵守的传播不变量。忽略该结构的朴素扰动（如加性噪声或随机波束丢弃）可能产生违反不变量的观测—配置对，从而破坏对齐目标。

在**功率域**，从 $[a,b]$ 均匀采样的乘性因子与加性高斯噪声被联合施加到 RSRP 值和 $c_{i,j}$ 中相应发射功率上，在保持（1）所要求的线性 RSRP—功率关系的同时扰动功率相关参数。在**波束域**，首先通过（1）上的稀疏恢复从观测波束提取信道 APS $\hat{\mathbf x}$（传播不变量），把环境相关结构从不完整观测中分离出来；给定该估计 APS，通过变化配置相关分量生成增强视图：扰动波束码本或天线朝向得到修改后的图样矩阵 $\tilde{\mathbf A}$，并通过前向模型合成新的波束向量 $\tilde{\mathbf y}=\tilde{\mathbf A}\hat{\mathbf x}$（图 6d 左）。该过程同时稠密化缺失条目，并使模型接触原始数据中不存在的配置，从而在"估计传播分量保持不变"的信道模型假设下让模型接触配置相关的 RSRP 变化。观测严重不完整的小区被排除，以降低构造教师增强视图所用 APS 估计的不稳定性。通过约束所有扰动遵守（1）中的传播不变量，增强视图使模型接触多样的功率与配置条件，同时确保所学表征保持物理根基。

**面向网络智能任务的应用**：要求波束级 RSRP 的任务被直接表述为对预训练预测器的上下文条件查询，而需要其他输出的任务通过轻量任务特定头复用冻结表征。

**零样本推断**：对无线电地图构建，RSRP 缺失的波束构成目标集 $\mathcal S^t$，其余观测构成上下文集 $\mathcal S^c$。对新站部署预测，计划小区的全部波束视为目标查询，周边小区的观测提供网络上下文。对参数调优预测，目标小区用拟议天线配置查询，其余网络的观测构成 $\mathcal S^c$。三项任务中，预训练预测器直接估计目标波束级 RSRP，无需梯度更新或目标城市校准。

**少样本适配**：对需要波束级 RSRP 之外输出的应用，预训练骨干 $\mathcal E_\theta$ 保持冻结，仅用目标城市少量标注子集适配轻量任务特定头。源城市训练的头提供初始化，从而在不更新共享表征的情况下实现高效跨城市适配。UE 定位与 SINR 估计使用 MLP 回归头，分别以平均欧氏距离与 $L_1$ 损失优化；波束预测与传播场景分类使用带 softmax 输出的 MLP 分类器，以交叉熵优化。

**波束空间聚类**：除上述预测任务外，ChaRT 还支持组织大规模 MR 数据的波束空间聚类：MLP 嵌入头把池化后的小区级表征映射到样本级波束空间，深度嵌入聚类在此联合精化嵌入与可学习网格原型 [33]；基于原型的分配把连续无线电数据空间离散为可复用无线电网格，供下游网络建模与分析 [32]。

**数据可用性**：数据将通过 GitHub 开源：https://github.com/rorschaches/RadioWorld 。

**图 6**：ChaRT 的架构与预训练框架。**a**，测量报告标记化器把每个波束的物理配置与观测信号强度编码为统一嵌入，为已观测波束产生上下文标记、为被掩码或缺失波束产生查询标记。**b**，层级掩码注意力在浅层块中捕获小区内波束相关性、在深层块中捕获小区间空间依赖，被掩码条目仅作为查询。**c**，信道结构引导的专家混合把每个小区级标记路由到单个路由专家，而共享专家处理所有标记；辅助最强波束预测损失 $\mathcal L_{\mathrm{aux}}$ 监督路由器并使专家分配与主导传播方向对齐。**d**，上下文自蒸馏预训练为学生组合多粒度掩码、为教师组合受信道模型约束的增强；损失 $\mathcal L_{\mathrm{rec}}$、$\mathcal L_{\mathrm{reg}}$ 与 $\mathcal L_{\mathrm{dist}}$ 分别强制波束重建、缺失波束正则与跨视图表征对齐。

## 扩展数据

### 扩展数据表

**扩展数据表 1｜各城市数据集统计**（按原表逐格转录）

| City | MR samples | Beam observations | Cells | Area (km²) | Carrier (GHz) |
| --- | --- | --- | --- | --- | --- |
| City A | 1,003,362,798 | 18,207,030,406 | 3,503 | 16×18 | 2.1/3.5 |
| City B | 598,023 | 8,795,040 | 280 | 8×7 | 2.6 |
| City C | 702,732 | 6,382,334 | 16 | 2.5×2.5 | 3.5 |
| **Total** | **1,004,663,553** | **18,222,207,780** | **3,799** | – | – |

> **注**：MR samples 表示单条测量报告，beam observations 表示波束级 RSRP 记录。City A 为密集多频段城区部署，City B 为中等密度单频段城区部署，City C 为稀疏单频段郊区部署；加粗数值为数据集总计。

**扩展数据表 2｜各采集轮次间的参数变化**（按原表逐格转录）

| Parameter type | Round 1 → Round 2 | Round 1 → Round 3 |
| --- | --- | --- |
| Mechanical azimuth | 3 | 12 |
| Mechanical tilt | 8 | 15 |
| Transmit power | 2 | 4 |
| Electrical tilt | 3 | 19 |
| Beam codebook | 2 | 11 |

> **注**：Round 1 定义参考天线配置。表中条目报告的是相对 Round 1、在 Round 2 或 Round 3 中该参数发生变化的小区数。对参数调优评估，受影响小区被整体掩码，冻结的 ChaRT 模型从周边网络上下文与更新后的配置向量预测其调优后多波束覆盖。

**扩展数据表 3｜ChaRT 各组件的消融**（按原表逐格转录）

| Model configuration | MAE (dB) |
| --- | --- |
| Contextual self-distillation | 6.14 |
| + Channel-model-constrained augmentation | 5.71 |
| + Hierarchical masked attention | 4.98 |
| + CSG-MoE (ChaRT) | **4.72** |

> **注**：各组件在上一配置基础上累加。所有变体都在城市 A 空间外推下、以 40% 掩码率做小区级 RSRP 重建；MAE 表示平均绝对误差，数值越小越好，加粗为最佳结果。

### 扩展数据图

**扩展数据图 4**：专家分配的空间组织。**a**，观测到的 RSRP 分布。**b**，最强波束分配，呈现小区周边具有方向性组织的传播区域。**c**，不含辅助最强波束预测目标的 vanilla MoE 产生的专家分配——路由集中于少数专家并呈现明显的空间混合。**d**，CSG-MoE 产生的专家分配——分配形成更连续的方向性区域，与最强波束组织更吻合。专家索引表示类别路由身份，不含序数含义。结合引入 CSG-MoE 后重建 MAE 从 4.98 dB 降至 4.72 dB（扩展数据表 3），该定性比较与辅助目标促进更物理有序的专家路由一致。

## 图注与表注

**图 1**：数据基础与 ChaRT 总览（数据集统计、三城市部署、观测分布与预训练/迁移流程）。
**图 2**：三种泛化设置下的波束级与小区级 RSRP 重建（分布内、空间外推、跨城市零样本；掩码率 20%—80%）。
**图 3**：零样本网络规划与优化（新站部署预测：同站扩展、跨频段、绿地、跨城市；天线参数调优：机械方位角、机械下倾角、发射功率、电下倾角、波束码本）。
**图 4**：冻结 ChaRT 表征的下游适配与评估（定位、波束预测、LoS/NLoS 分类、SINR 估计、波束空间聚类）。
**图 5**：ChaRT 随模型规模与预训练数据量的扩展（模型规模轴、数据量轴与联合扩展网格）。
**图 6**：ChaRT 的架构与预训练框架（标记化器、层级掩码注意力、CSG-MoE、上下文自蒸馏）。
**扩展数据图 1**：城市 B 跨城市零样本新站部署的无线电地图比较（实测 RSRP 与 ChaRT、TabPFN v2、XGBoost、Sionna、3GPP TR 38.901 的预测）。
**扩展数据图 2**：天线参数调优下的无线电地图比较（机械方位角、机械下倾角、发射功率、电下倾角、波束码本）。
**扩展数据图 3**：留出轮次 3 数据上波束空间聚类表征的 t-SNE 投影。
**扩展数据图 4**：专家分配的空间组织（观测 RSRP、最强波束分配、vanilla MoE 与 CSG-MoE 的专家分配）。

**表注**：扩展数据表 1（各城市数据集统计）、表 2（采集轮次间参数变化）与表 3（组件消融）均已在「扩展数据」一节按原表逐格转录（表 1 已用 PyMuPDF 渲染原 PDF 第 29 页核对）。正文无其他表格。

## 参考文献

> 以下按原文编号 [1]—[39] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的连字与断行伪影已按常规写法整理，书目内容未改动。

[1] GSMA. The mobile economy 2026. Technical report, GSMA, 2026. URL https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-economy/wp-content/uploads/2026/02/The-Mobile-Economy-2026.pdf.

[2] Yang Li, Shutao Zhang, Xiaohui Ren, Jianhang Zhu, Jiajie Huang, Pengcheng He, Kaiming Shen, Zhiqiang Yao, Jie Gong, Tsung-Hui Chang, Qingjiang Shi, and Zhi-Quan Luo. Real-world wireless network modeling and optimization: From model/data-driven perspective. Chinese Journal of Electronics, 31:991–1012, 2022. doi: 10.1049/cje.2022.00.191.

[3] Latif U. Khan, Walid Saad, Dusit Niyato, Zhu Han, and Choong Seon Hong. Digital-twin-enabled 6G: Vision, architectural trends, and future directions. IEEE Communications Magazine, 60(1):74–80, 2022. doi: 10.1109/MCOM.001.21143.

[4] ITU-T. Digital twin network – requirements and architecture. Technical Report Recommendation Y.3090, International Telecommunication Union, 2022. URL https://www.itu.int/rec/T-REC-Y.3090-202202-I.

[5] Stefan Mihai, Mahnoor Yaqoob, Dang V. Hung, William Davis, Panos Towakel, Mohsen Raza, Mehmet Karamanoglu, Balbir Barn, Dhaval Shetve, R. Venkatesha Prasad, Hrishikesh Venkataraman, Ramona Trestian, and Huan X. Nguyen. Digital twins: A survey on enabling technologies, challenges, trends and future prospects. IEEE Communications Surveys & Tutorials, 24(4):2255–2291, 2022. doi: 10.1109/COMST.2022.3208773.

[6] Linbo Hui, Mowei Wang, Liang Zhang, Lu Lu, and Yong Cui. Digital twin for networking: A data-driven performance modeling perspective. IEEE Network, 37(3):200–208, 2023.

[7] Remcom. Wireless InSite: Site-specific radio propagation modelling software. https://www.remcom.com/wireless-insite-em-propagation-software, 2023. Accessed: 2026-05-02.

[8] Faycal Ait Aoudia, Jakob Hoydis, Merlin Nimier-David, Baptiste Nicolet, Sebastian Cammerer, and Alexander Keller. Sionna RT: Technical report, 2025. URL https://arxiv.org/abs/2504.21719.

[9] Stephan Jaeckel, Leszek Raschkowski, Karl Börner, and Lars Thiele. QuaDRiGa: A 3-D multi-cell channel model with time evolution for enabling virtual field trials. IEEE Transactions on Antennas and Propagation, 62(6):3242–3256, 2014. doi: 10.1109/TAP.2014.2310222.

[10] 3GPP. Study on channel model for frequencies from 0.5 to 100 GHz. Technical Report (TR) 38.901, 3rd Generation Partnership Project (3GPP), Jan. 2020. URL https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3173. Version 16.1.0.

[11] Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, and Dario Amodei. Language models are few-shot learners. In Advances in Neural Information Processing Systems (NeurIPS), volume 33, pages 1877–1901, 2020.

[12] Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample. LLaMA: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971, 2023. URL https://arxiv.org/abs/2302.13971.

[13] Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, and Ilya Sutskever. Learning transferable visual models from natural language supervision. In Proceedings of the 38th International Conference on Machine Learning (ICML), pages 8748–8763, 2021.

[14] Alexander Kirillov, Eric Mintun, Nikhila Ravi, Hanzi Mao, Chloe Rolland, Laura Gustafson, Tete Xiao, Spencer Whitehead, Alexander C. Berg, Wan-Yen Lo, Piotr Dollar, and Ross Girshick. Segment anything. In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pages 4015–4026, October 2023.

[15] Kang Wu, Yingying Zhang, Lixiang Ru, Bo Dang, Jiangwei Lao, Lei Yu, Junwei Luo, Zifan Zhu, Yue Sun, Jiahao Zhang, Qi Zhu, Jian Wang, Ming Yang, Jingdong Chen, Yongjun Zhang, and Yansheng Li. A semantic-enhanced multi-modal remote sensing foundation model for Earth observation. Nature Machine Intelligence, 7:1235–1249, 2025. doi: 10.1038/s42256-025-01078-8.

[16] Xiao Gu, Wei Tang, Jinpei Han, Veer Sangha, Fenglin Liu, Shreyank N. Gowda, Antonio H. Ribeiro, Patrick Schwab, Kim Branson, Lei Clifton, Antonio Luiz P. Ribeiro, Zhangdaihong Liu, and David A. Clifton. Cardiac health assessment across scenarios and devices using a multimodal foundation model pretrained on data from 1.7 million individuals. Nature Machine Intelligence, 8:220–233, 2026. doi: 10.1038/s42256-026-01180-5.

[17] Yong He, Pan Fang, Yongtao Shan, Yuanfei Pan, Yanhong Wei, Yichang Chen, Yihao Chen, Yi Liu, Zhenyu Zeng, Zhan Zhou, Feng Zhang, Adibvafa Esmaeili, Yongchao Bao, Le Zhang, Aoyun Tao, Hao Sun, Tao Yang, Liyang Sun, Sheng Wang, Tongqing Zhao, Yuhao Cui, and Lin Han. Generalized biological foundation model with unified nucleic acid and protein language. Nature Machine Intelligence, 2025. doi: 10.1038/s42256-025-01044-4.

[18] Boxun Liu, Xuanyu Liu, Shijian Gao, Xuesong Cai, Xiang Cheng, and Liuqing Yang. Wifo-2: a generalist foundation model unifies heterogeneous wireless system design. National Science Review, 13(18):nwag500, 09 2026. ISSN 2095-5138. doi: 10.1093/nsr/nwag500.

[19] Ahmed Alikhateeb, Gokul Charan, and Tareq Alkhateeb. Large wireless model (LWM): A foundation model for wireless channels. arXiv preprint arXiv:2411.08872, 2024. URL https://arxiv.org/abs/2411.08872.

[20] Ferhat Ozgur Catak, Murat Kuzlu, and Ulrich Cali. BERT4MIMO: A foundation model using BERT architecture for massive MIMO channel state information prediction. arXiv preprint arXiv:2501.01802, 2025.

[21] Fuhui Liu, Hangyu Zhang, Wei Wang, Wei Zhang, Cheng-Xiang Wang, Dusit Niyato, and Shuguang Cui. SpectrumFM: A foundation model for intelligent spectrum management. arXiv preprint arXiv:2505.06256, 2025.

[22] Yuxuan Wen, Yi Cui, Yifei Zhang, Wei Yu, Zhu Han, and Tony Q. S. Zhao. ICWLM: A multi-task wireless large model via in-context learning. arXiv preprint arXiv:2507.18167, 2025.

[23] Xinyu Liu, Xiaoyan Gao, Boxun Liu, Xinyu Cheng, and Lei Yang. LLM4WM: Adapting LLM for wireless multi-tasking. arXiv preprint arXiv:2501.12983, 2025.

[24] 3GPP. NR; Radio Resource Control (RRC); Protocol specification. Technical Specification (TS) 38.331, 3rd Generation Partnership Project (3GPP), 2025. URL https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3197. Version 16.20.0.

[25] Tianqi Chen and Carlos Guestrin. XGBoost: A scalable tree boosting system. In Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD), pages 785–794, 2016. doi: 10.1145/2939672.2939785.

[26] Noah Hollmann, Samuel Müller, Lennart Purucker, Arjun Krishnakumar, Max Körfer, Shi Bin Hoo, Robin Tibor Schirrmeister, and Frank Hutter. Accurate predictions on small data with a tabular foundation model. Nature, 637:319–326, 2025. doi: 10.1038/s41586-024-08328-6.

[27] Shutao Zhang, Xinzhi Ning, Xi Zheng, Qingjiang Shi, Tsung-Hui Chang, and Zhi-Quan Luo. A physics-based and data-driven approach for localized statistical channel modeling. IEEE Transactions on Wireless Communications, 23(6):5409–5424, 2024. doi: 10.1109/TWC.2023.3326209.

[28] Xinyu Qin, Qi Yan, Shutao Zhang, Bingsheng Peng, Ye Xue, and Tsung-Hui Chang. A measurement report data-driven framework for localized statistical channel modeling. IEEE Transactions on Mobile Computing, pages 1–15, 2026. doi: 10.1109/TMC.2026.3667749.

[29] Zhinan Hu, Xin Chen, Zhenyu Zhou, and Shahid Mumtaz. Localization with cellular signal RSRP fingerprint of multiband and multicell. IEEE Journal on Selected Areas in Communications, 42(9):2380–2394, 2024. doi: 10.1109/JSAC.2024.3414000.

[30] Abubakar Salihu, Markus Rupp, and Stefan Schwarz. Self-supervised and invariant representations for wireless localization. IEEE Transactions on Wireless Communications, 23(8):8281–8296, 2024. doi: 10.1109/TWC.2023.3348203.

[31] Mohammed Alrabeiah and Ahmed Alkhateeb. Deep learning for mmwave beam and blockage prediction using sub-6 ghz channels. IEEE Transactions on Communications, 68(9):5504–5518, 2020. doi: 10.1109/TCOMM.2020.3006325.

[32] Juntao Wang, Feng Yin, Tian Ding, Tsung-Hui Chang, Zhi-Quan Luo, and Qi Yan. Learning to gridize: Segment physical world by wireless communication channel. IEEE Transactions on Mobile Computing, 2026.

[33] Junyuan Xie, Ross Girshick, and Ali Farhadi. Unsupervised deep embedding for clustering analysis. In International conference on machine learning, pages 478–487. PMLR, 2016.

[34] Kaiming He, Xinlei Chen, Saining Xie, Yanghao Li, Piotr Dollár, and Ross Girshick. Masked autoencoders are scalable vision learners. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 16000–16009, June 2022.

[35] Arne Schmitz, Thomas Karolski, and Leif Kobbelt. Using spherical harmonics for modeling antenna patterns. In 2012 IEEE Radio and Wireless Symposium, pages 155–158. IEEE, 2012. doi: 10.1109/RWS.2012.6175298.

[36] Juho Lee, Yoonho Lee, Jungtaek Kim, Adam Kosiorek, Seungjin Choi, and Yee Whye Teh. Set transformer: A framework for attention-based permutation-invariant neural networks. In Proceedings of the 36th International Conference on Machine Learning, volume 97 of Proceedings of Machine Learning Research, pages 3744–3753. PMLR, 09–15 Jun 2019.

[37] Damai Dai, Chengqi Deng, Chenggang Zhao, R. X. Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Y. Wu, Zhenda Xie, Y. K. Li, Panpan Huang, Fuli Luo, Chong Ruan, Zhifang Sui, and Wenfeng Liang. DeepSeekMoE: Towards ultimate expert specialization in mixture-of-experts language models. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1280–1297, Bangkok, Thailand, August 2024. doi: 10.18653/v1/2024.acl-long.70.

[38] Mathilde Caron, Hugo Touvron, Ishan Misra, Hervé Jégou, Julien Mairal, Piotr Bojanowski, and Armand Joulin. Emerging properties in self-supervised vision transformers. In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pages 9650–9660, October 2021.

[39] Zihan Zhou, Chenguang Wang, Hongyi Ye, Yongtao Guan, and Tianshu Yu. Incomplete data, complete dynamics: A diffusion approach. In The Fourteenth International Conference on Learning Representations, 2026. URL https://openreview.net/forum?id=NYvvkBlSX2.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要；引言；结果（数据基础与总体性能、"ChaRT 从跨不完整观测重建多波束 RSRP"、"ChaRT 零样本迁移到网络规划与优化"、"ChaRT 支持数据高效的下游任务适配"、"ChaRT 的扩展随模型规模与同城数据量趋于饱和"）；讨论；方法（数据采集与处理、MR 观测模型、信道模型基础、掩码波束建模目标、架构、预训练 ChaRT、预训练目标、多粒度掩码、受信道模型约束的增强、面向网络智能任务的应用、脚注 2）；扩展数据表 1—3（逐格）；图 1—6 与扩展数据图 1—4 图注；参考文献 [1]—[39] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—6 与扩展数据图 1—4 的图像本体未复制（站点不上传图片），仅中文图注与正文数值；③扩展数据表 1—3 已按原表逐格转录，其中表 1 用 PyMuPDF 渲染原 PDF 第 29 页核对；④作者简介、利益冲突与版权声明不在正文范围，未收录；⑤正文中部分公式为嵌入小段（如均值池化式）未编号，原文亦未编号；公式（1）—（8）已全部收录；⑥骨架版本日期 "2026-09-20" 与 PDF 实际 v3 2026-09-23 不同，已按 PDF 更新并加注；⑦第一单位 "Shenzhen Loop Area Institute" 中文名未能从 PDF 确认，保留英文原名。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
