---
layout: page
title: "几何先验与不确定性引导测量的稀疏增益无线电地图重建｜中文全文译文"
permalink: /papers/translations/2026-11-01-2604-05788-geouq-gfnet-sparse-gain-radio-map-with-geometry-priors-and-uncertainty/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/d96f1cff9c62a14d/) · [原文 arXiv](https://arxiv.org/abs/2604.05788/) · [全部目录](/papers/catalog/)

# 几何先验与不确定性引导测量的稀疏增益无线电地图重建

**原题：** Sparse Gain Radio Map Reconstruction With Geometry Priors and Uncertainty-Guided Measurement Selection  
**作者：** Zhihan Zeng、Ning Wei、Kaihe Wang、Phee Lep Yeoh、Fei Xu、Yue Xiu、Zhongpei Zhang（单位按 PDF 原文转写）  
**作者单位（PDF 首页脚注）：** Zhihan Zeng、Ning Wei、Yue Xiu、Zhongpei Zhang：电子科技大学（UESTC）无线通信国家级重点实验室，成都 611731，中国（E-mail: 202511220608@std.uestc.edu.cn, wn@uestc.edu.cn, xiuyue12345678@163.com, zhangzp@uestc.edu.cn）；Kaihe Wang：电子科技大学（UESTC），成都 611731，中国（E-mail: khewang@yeah.net）；Phee Lep Yeoh：澳大利亚昆士兰州 Petrie，阳光海岸大学 Moreton Bay 校区科学与工程技术学院（E-mail: pyeoh@usc.edu.au）；Fei Xu：北京中关村泛在-X（Ubiquitous-X）创新与应用研究院，中国（E-mail: xufei@zgc-xnet.com）；通讯作者：Ning Wei。  
**版本：** arXiv:2604.05788v2，2026-09-05；14 页；预印本/状态未确认。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VII 节及全部小节（含 §IV 方法、§V-A 数据划分、§V-B 训练策略、§V-C 评估指标）、表 I–III 逐格、图 1–10 图注、式 (1)–(35) 编号、算法 1 逐行、参考文献 [1]–[78] 英文原条目；许可：arXiv 预印本（公开可读）。原文无关键词段、无附录。逐句逐式终校未做。

## 摘要

无线电地图对环境感知无线通信、网络规划与无线电资源优化具有重要意义。然而，当仅有有限数量的测量可用时，密集无线电地图的构建仍然具有挑战性，在存在强遮挡、不规则几何与感知可达性受限的复杂城市环境中尤为如此。现有方法已探索插值、低秩制图、深度补全与信道知识地图（channel knowledge map，CKM）构建，但其中许多方法对**显式几何先验**的利用不够充分，或忽视了预测不确定性对后续感知的价值。本文从几何感知与主动感知的视角研究稀疏增益无线电地图重建。我们首先构建 **UrbanRT-RM**——一个可控的射线追踪（ray tracing）基准，包含多样的城市布局、多种基站部署与多种稀疏采样模式。随后提出 **GeoUQ-GFNet**，一个轻量网络，从稀疏测量与结构化场景先验中**联合预测**密集增益无线电地图与空间不确定性地图。预测的不确定性进一步用于在有限感知预算下引导**主动测量选择**。大量实验表明，所提 GeoUQ-GFNet 在使用 UrbanRT-RM 生成的不同场景与不同发射机部署下均取得强且一致的重建性能；此外，在相同额外测量预算下，不确定性引导的查询比非自适应采样带来更有效的重建改善。这些结果证明了将几何感知学习、不确定性估计与基准驱动评估相结合，用于复杂城市环境稀疏无线电地图重建的有效性。

## I. 引言

面向第六代（6G）无线网络的演进，预计将从根本上改变通信系统，使其从以连接为中心的基础设施转变为同时支撑通信、感知、计算、控制与自主决策的深度集成智能平台 [58], [63], [69]–[71]。在这一愿景中，未来网络不仅需要提供更高的**频谱效率**、更低的时延与更广的覆盖，还需要以原生、可扩展的方式获取、表示与利用环境知识。这一趋势与 IMT-2030 愿景一致：在 beyond-5G 与 6G 系统中，智能、泛在连接与环境感知运行被视为关键特征 [20]。在此背景下，空间信道知识表示正从辅助性支撑功能，转变为预测性与主动性无线运行的核心使能要素。

**无线电地图**给出了某一地理区域内无线传播条件的空间表示，对未来的智能无线系统日益重要 [7], [8], [13], [21], [72], [73]。通过把路损、接收功率或信道增益等信道相关量描述为位置的函数，无线电地图可支撑覆盖分析、部署优化、波束管理、导频削减、路由与环境感知等大量任务 [17], [20], [29], [30], [58], [61]–[63]。随着无线网络向更自适应、数据驱动与环境感知的方向演进，无线电地图正从辅助规划工具转变为感知辅助通信的核心基础设施组件 [19], [22], [65]–[68]。

尽管前景可观，在真实环境中构建准确的无线电地图仍然困难。原则上，密集地图需要对整个目标区域进行穷举测量；但由于感知预算有限、可达性受约束以及部署需求动态变化，这种获取方式在实践中往往代价过高。该困难在城市环境中尤为突出——在那里，传播同时受到遮挡、建筑几何、视距（line-of-sight，LoS）条件与发射机位置的影响。因此，实际问题并非基于密集测量的建图，而是**稀疏到密集的重建**（sparse-to-dense reconstruction），即：如何仅由一小部分可获取的观测推断出可靠的密集无线电地图 [23]。

长期以来，研究聚焦于利用插值、层析成像（tomography）、核回归与结构利用型恢复来进行无线电地图估计与信道增益制图。代表性工作包括基于空间反演、低秩结构、稀疏先验与边信息的无线电层析成像与制图方法 [25], [27], [28], [34], [38], [46], [47], [49], [51], [53]。这些方法提供了有价值的建模洞见，但它们通常依赖对空间平滑性、核相关或线性结构的较强假设，这限制了它们在高异构城市场景中的有效性。

近年来，深度学习通过直接从数据中学习复杂的非线性传播模式，显著推进了无线电地图重建。RadioUNet 与深度补全自编码器等早期深度模型表明，卷积网络能够从稀疏空间观测与环境输入中有效恢复密集地图 [18], [26], [35]–[37], [42], [44], [45], [48], [56], [74]–[78]。后续研究进一步探索了基于图的建模、图像修复（inpainting）、可变形注意力、受限区域重建，以及基于生成式扩散的无线电地图构建 [32], [40], [41], [43], [54], [55]。与此同时，新兴的**信道知识地图**（CKM）文献把构建范式扩展至图像修复、超分辨、扩散生成、流匹配、波束感知建图与跨接入点推断 [1]–[6], [14]–[16], [33]。这些进展清楚展示了数据驱动无线环境重建的潜力。

然而，仍存在两个重要空白。第一，尽管近来许多方法取得了很强的重建精度，在稀疏城市建图中对**细粒度几何先验**的显式融合仍然不足。已有工作开始利用来自深度图、点云与更高维场景表示的环境信息 [10]–[12], [55]，但在观测有限条件下的**稀疏增益地图补全**中，如何在一个统一的轻量架构内有效融合障碍物结构、建筑高度、相对发射机几何、可达性约束与稀疏测量，仍属研究不足。第二，多数现有重建方法主要优化**一次性预测**质量；而在实际测量活动中，更重要的问题往往是“下一步在哪里测量”。在这一意义上，预测不确定性不仅是辅助输出，更是主动感知的**决策变量**。尽管贝叶斯主动学习与自适应层析成像已证明不确定性感知采样在无线电地图重建中的价值 [24], [28], [52]，但几何感知深度重建与不确定性引导测量选择之间的整合仍然有限。

受上述观察启发，本文从以几何先验与不确定性引导感知为中心的问题导向视角，研究稀疏增益无线电地图重建。我们首先构建 **UrbanRT-RM**：一个覆盖多种合成城市场景的可控射线追踪基准，可在不同场景类别、基站部署与稀疏采样模式下进行系统分析。随后提出 **GeoUQ-GFNet**：一个几何感知且不确定性感知的重建网络，从稀疏观测与结构化场景先验中联合预测密集增益无线电地图与空间不确定性地图。该模型引入了**几何门控前端**（Geometry-Gated Front-End）以自适应融合异构输入，引入结合 Ghost 模块 [59] 与受 Kolmogorov–Arnold 网络（KAN）表示 [60] 启发的 Grid-KAN 式非线性增强的轻量多级编码器，以及分别用于增益预测与不确定性估计的**双输出头**。所预测的不确定性进一步用于在有限感知预算下引导主动测量选择。

本文的主要贡献概括如下。

- 我们提出了稀疏增益无线电地图重建的**几何感知且不确定性感知的表述**：显式计入可达性约束下的感知，并把重建与序贯测量决策联系起来。
- 我们构建了 **UrbanRT-RM**：一个可控射线追踪基准，用于解耦场景几何、发射机部署与稀疏采样模式对重建难度的影响。
- 我们提出了 **GeoUQ-GFNet**：一个带有几何门控前端与增益—不确定性双头的轻量几何感知网络，用于从稀疏观测联合完成密集无线电地图重建与不确定性估计。
- 我们进一步提出**不确定性引导的测量选择**策略，并表明在相同感知预算下，所学不确定性相比非自适应查询提高了样本效率。

本文其余部分组织如下。第 II 节回顾无线电地图重建、CKM 构建与不确定性感知主动感知的相关工作。第 III 节介绍系统模型与问题表述。第 IV 节给出所提 GeoUQ-GFNet 架构与不确定性引导测量选择策略。第 V 节描述 UrbanRT-RM 数据集生成流程与实验设置。第 VI 节报告重建与主动感知结果。最后，第 VII 节总结全文。

## II. 相关工作

### A. 传统无线电地图重建与制图

早期无线电地图估计研究主要依赖插值、层析成像与基于结构的恢复。经典无线电层析成像工作分析了测量几何、重建精度与空间分辨率之间的关系，随后把框架扩展至盲估计与自适应贝叶斯感知 [25], [27], [28], [57]。与之并行，信道增益制图研究了利用低秩与稀疏等结构先验恢复大尺度空间增益场 [34]。相关研究进一步考察了基于核的在线重建、量化测量学习、免位置制图与空频插值 [46], [47], [49], [51]。这些方法为无线电地图重建奠定了重要的理论与方法基础。然而，它们通常依赖显式统计假设或人工设计的空间模型，因而难以刻画由复杂城市几何、不规则遮挡与异构感知支撑所引起的高度非线性传播效应。

### B. 无线电地图与 CKM 的深度学习与生成式构建

深度学习通过从环境信息与稀疏观测学习到密集传播地图的非线性映射，显著改进了稀疏无线电地图重建。代表性的无线电地图估计方法包括 RadioUNet、深度补全自编码器、带学习型神经模型的张量补全、基于图注意力的重建、可变形注意力建模，以及面向 V2X、UAV 与动态无线电环境的若干任务特定变体 [35]–[37], [39]–[41], [43], [54], [56]。这些研究表明，在数据与环境上下文充分时，学习型模型可以显著优于经典恢复技术。

在新兴的 CKM 文献中，近期方法把该任务重新表述为图像补全、超分辨或生成式建模。例如，图像到图像的修复被用于从稀疏观测恢复密集信道知识地图 [1]，而超分辨式重建被用于从稀疏或粗粒度输入提升地图分辨率 [14]。基于扩散模型与流匹配的生成式方法进一步把构建范式扩展到确定性回归之外，为部分观测甚至无观测场景提供了更灵活的概率分布建模 [5], [6], [16]。此外，CKM 构建已从单天线增益地图拓展到多天线与波束感知设置，其中波束赋形向量、码本与跨 AP 信息被显式纳入映射过程 [2]–[4], [15]。近期工作还探索了基于点云的 CKM 构建、2D-to-3D 环境表示与 6D 场景感知建模 [10]–[12]。CKMImageNet 与 SpectrumNet 等公开基准进一步推动了 AI 无线电环境学习的标准化评估 [9], [31]。

尽管这些研究清楚展示了环境感知建模的重要性，许多现有方法要么相对较重，要么针对波束感知或生成式设置定制，要么主要面向一次性重建进行优化。对于本文所考虑的稀疏增益无线电地图任务，仍然需要一个轻量架构，能够在可达性约束下显式且有效地把结构化几何先验与稀疏测量融合起来。

### C. 不确定性感知重建与主动测量选择

在实际无线电地图采集中，挑战不仅在于从有限数据重建密集地图，还在于决定如何高效分配未来的测量。这推动了主动感知与不确定性感知采样方法的研究。面向无线电地图重建的**贝叶斯主动学习**已表明，通过优先选择信息量大的感知位置，不确定性估计可以显著提升样本效率 [24]。相关思想也出现在自适应贝叶斯无线电层析成像与基于 UAV 的主动频谱勘察中，其中不确定性或后验信息被用于引导序贯测量 [28], [50], [52]。这些工作说明不确定性对测量规划极具价值。然而，多数现有不确定性感知方法建立在**高斯过程**或贝叶斯推断框架之上，并未与现代几何感知深度重建网络紧密结合。因此，在稀疏城市无线电地图重建中，结构化场景先验、学习型不确定性与主动测量选择之间的交互仍研究不足。

### D. 本文的定位

与上述研究相比，本文主要在三个方面有所不同。第一，我们关注**显式可达性约束**下复杂城市环境中的稀疏增益无线电地图重建，这与真实的室外测量活动高度契合。第二，我们不把几何仅作为辅助输入，而是设计专用的**几何门控融合机制**，用结构先验与感知掩码调制稀疏观测特征。第三，我们显式地把**不确定性估计**与**主动测量选择**联系起来，使模型输出不仅服务于一次性重建，也服务于有限感知预算下的后续感知决策。此外，我们以 UrbanRT-RM 支撑该研究：这是一个可控射线追踪基准，专为稀疏无线电地图重建的场景级与部署级评估而设计。在这一意义上，所提框架处于几何感知深度无线电地图学习、基准驱动评估与不确定性感知主动感知的交汇处，而这一方向在当前文献中仍探索不足。

## III. 系统模型

### A. 网络场景

我们考虑复杂城市环境中的下行无线感知与重建场景，如图 1 所示。发射机（通常为基站，base station，BS）部署在已知位置 \(\mathbf p_{\mathrm{tx}}=[x_{\mathrm{tx}},y_{\mathrm{tx}},z_{\mathrm{tx}}]^{\mathsf T}\)，目标是在感兴趣的目标区域上推断密集无线电地图，遵循无线电地图与信道制图研究中广泛采用的基于传播地图的表述 [29], [34], [56]。设 \(\mathcal Q\subset\mathbb R^2\) 表示水平服务区域。为便于表示与学习，该区域被离散为 \(H\times W\) 网格。第 \((i,j)\) 个网格单元的中心坐标与相应的密集增益无线电地图 \(\mathbf G\) 定义为：

$$
\mathbf q_{i,j}=[x_{i,j},y_{i,j}]^{\mathsf T}\in\mathcal Q,\quad 1\le i\le H,\ 1\le j\le W,\tag{1}
$$

$$
\mathbf G\in\mathbb R^{H\times W},\tag{2}
$$

其中 \(G_{i,j}\) 表示与位置 \(\mathbf q_{i,j}\) 相关联的大尺度信道增益。

环境包含建筑与其他几何结构，它们深刻影响信号传播。这些确定性场景属性被编码为若干**几何地图**，包括障碍物占据、建筑高度、相对发射机位置、发射机距离与视距（line-of-sight，LoS）代理。由于测量只能在物理可行的室外区域采集，我们进一步定义**可达性掩码** \(\mathbf M_a\in\{0,1\}^{H\times W}\)：\(M_{a,i,j}=1\) 表示位置 \(\mathbf q_{i,j}\) 可供测量，而 \(M_{a,i,j}=0\) 对应建筑内部等不可达区域。该表述与实际无线电地图获取一致：地图的地理支撑、物理场景结构与可行感知区域都是已知的，或可由数字地图、射线追踪场景模型预先计算 [12], [32], [55]。

**图 1（原文 Fig. 1）：** 复杂三维城市环境中由稀疏测量重建无线电地图的场景示意。图中标注包括屋顶基站（Rooftop BS）、空中自主飞行器（Aerial Autonomous Vehicles，AAVs）、路侧基站（Roadside Base Station）、含障碍物与变化建筑高度的复杂三维城市环境、测量车辆数据点（Measurement Vehicle Data Points），以及图例“测量轨迹（Measurement Trajectory）／稀疏测量数据点／基站／信号遮挡”。

### B. 信道增益模型

本文的目标量是信道增益的空间分布。为支撑几何感知重建，把物理增益模型与确定性先验张量 \(\mathbf P\) 一并表述为：

$$
G(\mathbf q)=P_{\mathrm{tx}}-L(\mathbf q)-S(\mathbf q)+\varepsilon(\mathbf q),\tag{3}
$$

$$
\mathbf P=[\mathbf O,\mathbf H,\mathbf R_x,\mathbf R_y,\mathbf D,\mathbf L],\tag{4}
$$

其中对每个位置 \(\mathbf q\in\mathcal Q\)，\(P_{\mathrm{tx}}\) 表示以 dB 为尺度的发射功率，\(L(\mathbf q)\) 表示距离与几何相关的路损，\(S(\mathbf q)\) 表示由周围障碍物引起的阴影衰落，\(\varepsilon(\mathbf q)\) 刻画残余的小尺度起伏或数值近似效应。本文中，无线电地图由射线追踪仿真生成，主要反映环境中空间结构化的传播强度。因此，我们的重建目标应主要理解为由大尺度传播几何主导的位置相关增益场，而非单一载波相位实现下的瞬时快衰落。离散化后，连续场 \(G(\mathbf q)\) 由上文定义的网格地图 \(\mathbf G\) 表示 [29], [32], [34]。

在先验张量表示 (4) 中，\(\mathbf O\in\{0,1\}^{H\times W}\) 为障碍物占据地图，\(\mathbf H\in\mathbb R^{H\times W}\) 为建筑高度地图，\(\mathbf R_x\) 与 \(\mathbf R_y\in\mathbb R^{H\times W}\) 表示相对于发射机的水平坐标地图，\(\mathbf D\in\mathbb R^{H\times W}\) 为发射机到网格的距离地图，\(\mathbf L\in\{0,1\}^{H\times W}\) 为 LoS 代理地图，指示发射机与网格位置之间的直线是否被障碍物遮挡。这些地图为学习传播感知的空间补全提供了显式几何线索 [11], [55], [56]。

### C. 测量与观测模型

由于在所有位置上穷举测量代价高昂，只能观测可及网格点的一个稀疏子集。观测模型、稀疏增益地图与由此得到的完整网络输入归并如下：

$$
\mathbf Y=\mathbf M_s\odot(\mathbf G+\mathbf N),\tag{5}
$$

$$
\mathbf G_s=\mathbf M_s\odot\mathbf G,\tag{6}
$$

$$
\mathbf X=[\mathbf P,\mathbf G_s,\mathbf M_s,\mathbf M_a,\mathbf G_{\mathrm{init}}],\tag{7}
$$

其中 \(\mathbf M_s\in\{0,1\}^{H\times W}\) 表示满足 \(\mathbf M_s\preceq\mathbf M_a\) 的采样掩码（\(M_{s,i,j}=1\) 表示在 \(\mathbf q_{i,j}\) 处获取了测量），\(\odot\) 表示逐元素相乘，\(\mathbf N\in\mathbb R^{H\times W}\) 为测量噪声地图。在仿真基准中，测量噪声相对传播变化通常可以忽略，因此观测到的稀疏增益地图实际按式 (6) 计算。此外，\(\mathbf G_{\mathrm{init}}\in\mathbb R^{H\times W}\) 表示由 \((\mathbf G_s,\mathbf M_s,\mathbf M_a)\) 通过未观测可及区域上的邻域迭代填充构造的密集初始化地图，它提供一个粗略空间先验以减轻预测负担 [1], [35], [55]。

为研究测量支撑模式的影响，我们考虑三种代表性的稀疏采样模式。第一种是**随机采样**：观测位置从可及单元中随机选取。第二种是**网格采样**：测量遵循结构化的格点式部署。第三种是**道路约束采样**：测量仅限于道路可达轨迹。这些模式在相同采样率下产生不同的空间支撑模式，因而引入不同的重建难度 [24], [33], [52]。

### D. 重建与主动感知目标

给定式 (7) 中定义的稀疏观测与几何感知输入，总体任务研究稀疏到密集的无线电地图重建与不确定性引导的主动测量选择。关键映射与空间域子集定义为：

$$
\hat{\mathbf G}=f_\theta(\mathbf X),\tag{8}
$$

$$
\Omega_{\mathrm{unobs}}=\{(i,j)\mid M_{a,i,j}=1,\ M_{s,i,j}=0\},\tag{9}
$$

$$
\Omega_{\mathrm{cand}}=\{(i,j)\mid M_{a,i,j}=1,\ M_{s,i,j}=0\},\tag{10}
$$

$$
\mathcal Q^{(t)}\subseteq\Omega_{\mathrm{cand}},\tag{11}
$$

其中 \(\hat{\mathbf G}\) 为重建的密集无线电地图，\(\Omega_{\mathrm{unobs}}\) 表示有效但当前未观测的区域，\(\Omega_{\mathrm{cand}}\) 定义候选测量区域（与未观测的可及位置重合），\(\mathcal Q^{(t)}\) 表示第 \(t\) 次迭代所选择的查询位置子集。

第一个目标是最小化未观测可及位置 (9) 上的预测误差，使得对所有 \((i,j)\in\Omega_{\mathrm{unobs}}\) 有 \(\hat G_{i,j}\approx G_{i,j}\)。除均值增益地图外，模型还估计空间预测不确定性地图 \(\hat{\mathbf U}\in\mathbb R_+^{H\times W}\)，以反映重建置信度。在有限的感知预算下，第二个目标是设计主动感知策略，依据 \(\hat{\mathbf U}\) 从 \(\Omega_{\mathrm{cand}}\) 中合理选择新的测量位置 \(\mathcal Q^{(t)}\)，在固定查询预算下最大化总体重建改善 [24], [28], [52]。

## IV. 方法

### A. GeoUQ-GFNet 概览

所提 GeoUQ-GFNet 的整体架构如图 2 所示。给定式 (7) 定义的输入张量 \(\mathbf X\)，该网络被设计为联合预测密集增益地图与空间不确定性地图。模型由四个主要功能组件构成。第一，**几何门控前端**分别编码结构先验、相对位置特征与稀疏观测，然后执行自适应融合。第二，基于 Ghost 模块、Grid-KAN 块与大核卷积的**轻量多级编码器**负责多尺度特征提取。第三，基于特征金字塔网络（feature pyramid network，FPN）的**解码器**把浅层细节与深层语义上下文细致地结合。最后，**双预测头**联合给出增益重建与相应的不确定性估计。模型并不直接回归最终无线电地图，而是预测对初始化地图 \(\mathbf G_{\mathrm{init}}\) 的**残差修正**，这既稳定了训练，也促使网络专注于修正困难区域的初始化误差，这与深度补全与图像修复式重建策略一致 [1], [35], [55]。

**图 2（原文 Fig. 2）：** 所提 GeoUQ-GFNet 的整体架构。它通过几何门控前端整合异构的结构几何线索、相对位置特征与稀疏观测；随后用基于 Ghost 与 Grid-KAN 的编码器提取多尺度表示，再由特征金字塔网络（FPN）融合解码器处理；双头同时产生重建增益地图与预测不确定性地图，后者迭代地引导主动测量回路。图中还标出输入张量（\(H\times W\times 10\)）、结构分支（ACB Block、RepACB）、相对分支（\(1\times1\) Conv、DS Conv、Residual Block）、观测分支（DS Conv、几何门控）、编码阶段 1–3（Ghost Residual、Grid-KAN、Large-Kernel Block）、Depthwise Conv、FPN Fusion、Refinement Decoder、Mean Head 与 Uncertainty Head，以及“查询新测量—更新稀疏观测”的主动测量回路。

### B. 几何门控前端

为有效整合异构输入，我们首先把输入张量划分为三个语义上不同的组。**结构几何线索**记为 \(\mathbf X_{\mathrm{str}}=[\mathbf O,\mathbf H,\mathbf M_a,\mathbf L,\mathbf E]\)，其中 \(\mathbf E\) 表示由障碍物与高度不连续性导出的边缘线索。**相对位置特征**组织为 \(\mathbf X_{\mathrm{rel}}=[\mathbf R_x,\mathbf R_y,\mathbf D]\)，**观测特征**由 \(\mathbf X_{\mathrm{obs}}=[\mathbf G_s,\mathbf M_s,\mathbf G_{\mathrm{init}}]\) 构成。这三组分别由专用分支编码如下：

$$
\mathbf F_{\mathrm{str}}=f_{\mathrm{str}}(\mathbf X_{\mathrm{str}}),\tag{12}
$$

$$
\mathbf F_{\mathrm{rel}}=f_{\mathrm{rel}}(\mathbf X_{\mathrm{rel}}),\tag{13}
$$

$$
\mathbf F_{\mathrm{obs}}=f_{\mathrm{obs}}(\mathbf X_{\mathrm{obs}}),\tag{14}
$$

这里，\(f_{\mathrm{str}}(\cdot)\) 侧重提取几何感知的结构特征，\(f_{\mathrm{rel}}(\cdot)\) 刻画相对于发射机的大尺度空间趋势，\(f_{\mathrm{obs}}(\cdot)\) 嵌入稀疏测量线索，这与更广泛的环境感知无线电地图建模范式一致 [11], [54], [56]。

一项关键架构设计是：观测分支并不直接融合，而是被**几何相关门与掩码相关门**动态调制。这些门与由此得到的调制观测特征计算为：

$$
\mathbf G_{\mathrm{geo}}=g_{\mathrm{geo}}(\mathbf X_{\mathrm{str}}),\tag{15}
$$

$$
\mathbf G_{\mathrm{mask}}=g_{\mathrm{mask}}([\mathbf M_s,\mathbf M_a]),\tag{16}
$$

$$
\tilde{\mathbf F}_{\mathrm{obs}}=\mathbf F_{\mathrm{obs}}\odot(1+\mathbf G_{\mathrm{geo}}+\mathbf G_{\mathrm{mask}}).\tag{17}
$$

该机制在穿越障碍物与不可达区域时显式抑制无效或误导性的传播，同时保留来自观测位置的有用线索，这与受限区域无线电地图重建及几何引导补全密切相关 [32], [55]。最后，三个分支融合为 \(\mathbf F_0=f_{\mathrm{fuse}}([\mathbf F_{\mathrm{str}},\mathbf F_{\mathrm{rel}},\tilde{\mathbf F}_{\mathrm{obs}}])\)，其中 \(f_{\mathrm{fuse}}(\cdot)\) 由一个 \(1\times1\) 投影与残差细化实现。

**图 3（原文 Fig. 3）：** 几何门控前端示意图。观测特征由结构先验导出的几何门与掩码门动态调制，从而在物理墙体边界与不可达区域显式阻断无效信息传播。图中标明观测特征 \(\mathbf F_{\mathrm{obs}}\)、结构特征 \(\mathbf X_{\mathrm{str}}\) 经几何门控 \(g_{\mathrm{geo}}\) 与 \(g_{\mathrm{mask}}\) 后的权重地图（取值 \([0,1]\)）、\((1+\mathrm{Geo}+\mathrm{Mask})\) 总门控，以及“墙体边界信息阻断”可视化（占据地图、低门控权重、最终门控、门控后特征）。

### C. 轻量多级编码器

在融合特征 \(\mathbf F_0\) 之上，主干采用渐进式编码器上下文融合设计。编码器包含三个级联阶段，配置为：

$$
(\mathbf F_1,\mathbf S_1)=\mathcal E_1(\mathbf F_0),\tag{18}
$$

$$
(\mathbf F_2,\mathbf S_2)=\mathcal E_2(\mathbf F_1),\tag{19}
$$

$$
(\mathbf F_3,\mathbf S_3)=\mathcal E_3(\mathbf F_2),\tag{20}
$$

其中 \(\mathbf S_1\)、\(\mathbf S_2\)、\(\mathbf S_3\) 是为后续解码器融合而保留的多尺度特征。为提升效率，编码器主要采用 **Ghost 残差块**。对输入特征图 \(\mathbf Z\)，Ghost 残差变换抽象表示为 \(\mathcal G(\mathbf Z)=\phi(\mathbf Z+h_{\mathrm{ghost}}(\mathbf Z))\)，其中 \(h_{\mathrm{ghost}}(\cdot)\) 表示轻量特征生成，\(\phi(\cdot)\) 为非线性激活。与标准卷积块相比，该设计显著减少特征冗余，同时充分保持表征能力 [59]。整体编解码器组织也遵循现代深度无线电地图重建网络的实用设计理念 [35], [40], [56]。

### D. Grid-KAN 非线性增强

为更好地建模由遮挡过渡、阴影区域与距离相关衰减引起的复杂非线性，**Grid-KAN 块**被逻辑性地插入更深的编码阶段。给定中间特征图 \(\mathbf Z\)，Grid-KAN 层先把它投影到隐藏表示 \(\mathbf H\)，然后施加一组可学习的径向基响应，参数化为：

$$
\mathbf B_m=\exp\left(-\frac{(\mathbf H-\mathbf c_m)^2}{2\sigma_m^2}\right),\quad m=1,\ldots,M,\tag{21}
$$

其中 \(\mathbf c_m\) 与 \(\sigma_m\) 是可学习的中心与尺度，\(M\) 是严格设定的基函数个数。这些响应被有机地拼接并混合，形成输出特征 \(\mathcal K(\mathbf Z)=\psi([\mathbf B_1,\ldots,\mathbf B_M])\)，其中 \(\psi(\cdot)\) 表示综合的通道混合与投影。在总体设计中，Grid-KAN 与残差及深度可分离卷积操作结合，增强了主干拟合不规则信道变化模式的能力——这些模式仅靠普通卷积难以刻画 [45], [60]。

**图 4（原文 Fig. 4）：** Grid-KAN 模块的详细结构。中间特征被投影到隐藏维度，并由多个可学习径向基函数处理，其输出被拼接与混合，以增强非线性拟合能力。图中给出可学习基响应单元的公式 \(B_m=\exp\left(-\frac{(\mathbf H-\mathbf c_m)^2}{2\sigma_m^2}\right)\)、通道卷积与 \(1\times1\) 卷积混合，以及残差连接。

### E. 大核上下文建模

无线电地图重建既需要局部边界感知，也需要更广阔的空间上下文。因此，最深的编码阶段与瓶颈上下文模块采用**大核深度卷积**以稳健地扩大感受野。上下文特征在数学上写为 \(\mathbf F_{\mathrm{ctx}}=\mathcal C(\mathbf F_3)\)，其中 \(\mathcal C(\cdot)\) 组合了大核深度卷积、小核细化、通道混合与残差连接。该设计非常适合无线电地图补全，因为大尺度信号趋势主要由整体几何布局决定，而非纯粹的局部纹理连续性；这与近期深度重建与基于注意力的无线电地图估计研究一致 [32], [40], [56]。

### F. 基于 FPN 的多尺度融合

为高效合并浅层结构细节与深层语义特征，我们采用特征金字塔网络（feature pyramid network，FPN）风格的融合模块。多尺度特征首先被投影到公共通道维度、在空间上对齐，然后通过以下操作进一步细化：

$$
\mathbf F_{\mathrm{fpn}}=f_{\mathrm{fpn}}([p_1(\mathbf S_1),\mathrm{Up}(p_2(\mathbf S_2)),\mathrm{Up}(p_3(\mathbf F_{\mathrm{ctx}}))]),\tag{22}
$$

$$
\mathbf F_{\mathrm{ref}}=f_{\mathrm{ref}}(\mathbf F_{\mathrm{fpn}}).\tag{23}
$$

这里，\(p_1(\cdot)\)、\(p_2(\cdot)\)、\(p_3(\cdot)\) 为横向投影，\(\mathrm{Up}(\cdot)\) 表示标准双线性上采样，\(\mathbf F_{\mathrm{ref}}\) 作为最终预测头共享的表示。该多尺度融合策略也与依赖分层空间特征的既有无线电地图估计架构兼容 [35], [56]。

### G. 残差增益重建

GeoUQ-GFNet 不直接预测完整增益地图，而是估计对初始化地图 \(\mathbf G_{\mathrm{init}}\) 的目标残差修正，并有条件地合并以形成最终重建地图。这些映射变换的推进表示为：

$$
\Delta\mathbf G=f_{\mathrm{mean}}(\mathbf F_{\mathrm{ref}}),\tag{24}
$$

$$
\hat{\mathbf G}_u=\mathbf G_{\mathrm{init}}+\Delta\mathbf G,\tag{25}
$$

$$
\hat{\mathbf G}=\mathbf M_s\odot\mathbf G_s+(1-\mathbf M_s)\odot\hat{\mathbf G}_u.\tag{26}
$$

在实践中，实现时可选择把预测限制在物理合理的增益范围内，但核心解析表述严格由式 (26) 给出。该残差策略非常有利：初始化已捕获粗略的空间连续性，使网络能够严格专注于修正困难区域，如障碍物边界、非视距（non-line-of-sight，NLoS）过渡与稀疏支撑区域 [1], [35], [55]。

### H. 不确定性估计

为充分量化预测置信度，GeoUQ-GFNet 使用第二个预测头估计空间对数方差地图。具体而言，不确定性分支以若干与观测相关的掩码为条件对共享特征进行调整，并通过以下操作得到最终预测标准差地图：

$$
\mathbf F_{\mathrm{uq}}=f_{\mathrm{uq}}([\mathbf F_{\mathrm{ref}},\mathbf M_s,\mathbf M_a,\mathbf L]),\tag{27}
$$

$$
\mathbf S=f_{\mathrm{var}}(\mathcal K(\mathbf F_{\mathrm{uq}})),\qquad\text{其中}\ \mathbf S=\log\hat{\boldsymbol\sigma}^2,\tag{28}
$$

$$
\hat{\mathbf U}=\exp\left(\frac{1}{2}\mathbf S\right).\tag{29}
$$

于是，对每个位置 \((i,j)\)，模型输出 \(\hat G_{i,j}=\mu_{i,j}\) 与 \(s_{i,j}=\log\hat\sigma_{i,j}^2\)。我们在未观测可及区域上采用**异方差高斯似然**，建模为：

$$
\mathcal L_{\mathrm{NLL}}=\sum_{(i,j)\in\Omega_{\mathrm{unobs}}}\left[\frac{1}{2}e^{-s_{i,j}}\left(\hat G_{i,j}-G_{i,j}\right)^2+\frac{1}{2}s_{i,j}\right].\tag{30}
$$

该表述使模型能够可靠地为那些重建歧义本质上更高的困难区域赋予更大的不确定性，这与不确定性感知无线电地图采样文献一致 [24], [28]。

### I. 训练目标

为在重建保真度与不确定性质量之间取得均衡，完整训练目标把四个核心项纳入总损失计算 \(\mathcal L=\lambda_1\mathcal L_1+\lambda_{\mathrm{grad}}\mathcal L_{\mathrm{grad}}+\lambda_{\mathrm{nll}}\mathcal L_{\mathrm{NLL}}+\lambda_{\mathrm{var}}\mathcal L_{\mathrm{reg}}\)。这里，\(\mathcal L_1\) 是精确限定在 \(\Omega_{\mathrm{unobs}}\) 上的掩码 \(\ell_1\) 重建损失；\(\mathcal L_{\mathrm{grad}}\) 为梯度一致性损失，促使在保持边缘的同时获得连续的局部空间平滑性；\(\mathcal L_{\mathrm{NLL}}\) 是前述稳健异方差高斯负对数似然；\(\mathcal L_{\mathrm{reg}}\) 是用于稳定不确定性估计的方差正则项。该统一目标有效促使网络同时产生准确的密集无线电地图估计，以及对于下游主动感知场景仍然高度有意义的不确定性地图 [24], [35]。

**算法 1　无线电地图补全与主动感知**

```text
输入: 几何地图 {O, H, Rx, Ry, D, L, Ma}；初始稀疏观测 (Gs^(0), M^(0))；查询预算 K；主动迭代次数 T；已训练网络 F_θ
输出: 最终重建增益地图 Ĝ^(T)
1: Ginit^(0) ← Init(Gs^(0), M^(0), Ma)
2: for t = 0 to T−1 do
3:     X^(t) ← [O, H, Rx, Ry, D, L, Gs^(t), M^(t), Ma, Ginit^(t)]
4:     (ΔĜ^(t), S^(t)) ← F_θ(X^(t))
5:     Ĝu^(t) ← Ginit^(t) + ΔĜ^(t)
6:     Ĝ^(t) ← M^(t) ⊙ Gs^(t) + (1 − M^(t)) ⊙ Ĝu^(t)
7:     Û^(t) ← exp((1/2) S^(t))
8:     Ω^(t) ← {(i, j) | Ma,ij = 1, M_ij^(t) = 0}
9:     if Ω^(t) = ∅ then
10:        break
11:    end if
12:    Q^(t) ← TopK(Û^(t) ⊙ Ma ⊙ (1 − M^(t)))
13:    M^(t+1) ← M^(t) ∪ Q^(t)
14:    Gs^(t+1) ← M^(t+1) ⊙ G
15:    Ginit^(t+1) ← Init(Gs^(t+1), M^(t+1), Ma)
16: end for
17:
18: return Ĝ^(T)
```

### J. 不确定性引导的主动测量选择

除简单的一次性重建之外，我们还从根本上考虑一种迭代感知设置：模型可在严格受限的预算下主动请求额外测量。在第 \(t\) 次迭代，当前观测掩码记为 \(\mathbf M^{(t)}\)，模型同时预测重建无线电地图 \(\hat{\mathbf G}^{(t)}\) 与目标不确定性地图 \(\hat{\mathbf U}^{(t)}\)。候选查询位置被严格限制为可及但尚未观测的单元，构成集合 \(\Omega^{(t)}=\{(i,j)\mid M_{i,j}^{(t)}=0,\ M_{a,i,j}=1\}\)。下一次最优查询集合通过在候选区域上对不确定性值排序选取：

$$
\mathcal Q^{(t)}=\operatorname{TopK}\left(\hat{\mathbf U}^{(t)}\odot\mathbf M_a\odot(1-\mathbf M^{(t)})\right),
$$

其中 \(\operatorname{TopK}(\cdot)\) 返回得分最高的 \(K\) 个候选位置。在查询这些目标位置之后，稀疏测量地图与观测掩码按如下方式更新：

$$
\mathbf M^{(t+1)}=\mathbf M^{(t)}\cup\mathcal Q^{(t)},\tag{31}
$$

$$
\mathbf G_s^{(t+1)}=\mathbf M^{(t+1)}\odot\mathbf G.\tag{32}
$$

在该采集完成之后，基础初始化地图 \(\mathbf G_{\mathrm{init}}^{(t+1)}\) 由新更新的观测快速重算，模型随即再次应用于下一次迭代。完整的迭代流程总结于算法 1。由于显著较大的不确定性通常出现在支撑不足或几何困难的区域，这一直观策略自然地优先采集那些在数学上预期能以远高于无信息随机选择的效率改进最终无线电地图的测量 [24], [28], [52]。

## V. 实验设置

### A. 数据集生成

实验在所提出的 **UrbanRT-RM** 上进行，这是一个由合成城市场景生成的可控射线追踪基准。我们共构建七个场景实例，包括四个道路导向布局与三个非道路建筑布局。道路导向组包含十字路口场景、T 形路口场景、峡谷（canyon）场景与偏移十字路口场景；非道路组包含密集、中等与稀疏建筑布局。该设计使我们能够联合变化道路拓扑、建筑密度与空间遮挡复杂度，同时也补充了近期面向 AI 的 CKM 与无线电地图学习的基准工作 [9], [31]。

对每个场景，在建筑宽度、长度、高度与建筑间净距的几何约束下随机生成建筑。更具体地，地图范围为每个水平轴 400 m，全局地图分辨率为 \(512\times512\)，裁剪块（patch）大小为 \(128\times128\)，街道宽度固定为 30 m。依场景类别不同，建筑数量在 120 到 300 之间变化，从而产生低密度、中密度与高密度传播环境。每个场景包含 8 个从路侧（roadside）与屋顶（rooftop）模式中选取的基站部署，形成多样的发射机位置与观测几何。生成布局、三维场景实现、部署模式与射线追踪增益场的代表性示例如图 5 所示。这种受控的场景—部署设计也受到近期关于标准化 CKM/无线电地图数据集与城市稀疏测量评估的研究兴趣所启发 [9], [31], [32]。

**图 5（原文 Fig. 5）：** 所提 UrbanRT-RM 合成城市射线追踪数据集的示意。该数据集包含多样的二维道路/建筑布局、相应的三维几何场景实现、混合屋顶/路侧基站部署，以及由 Sionna RT 生成的密集增益地图；这些部分共同为不同遮挡与采样条件下的无线电地图重建提供配对的几何与传播数据。分图包括：(a) 混合屋顶与路侧基站部署模式；(b) 用于射线追踪的合成城市场景三维透视图；(c) 含道路几何、建筑与基站的二维场景布局；(d) 由射线追踪仿真器生成的密集增益地图。

密集增益地图由 Sionna RT 引擎在统一的传播配置下生成 [64]。载频设为 3.5 GHz，接收机高度设为 1.5 m，射线追踪深度限制为 3。对每个发射机，射线追踪求解器使用 \(2\times10^5\) 条采样射线在完整空间网格上计算密集增益场。因此，所得目标地图表示由距离衰减、阴影衰落与几何遮挡共同塑造的位置相关大尺度增益场，这与近期无线电地图与 CKM 研究采用的传播地图抽象一致 [29], [32], [56]。

基于生成的场景与基站配置，我们进一步构造几何感知的边信息通道，包括障碍物地图、高度地图、相对水平坐标、发射机距离、可及区域掩码与 LoS 代理地图。最终重建输入还包含稀疏观测与由迭代邻域传播得到的密集初始化，遵循深度无线电地图重建中把环境先验与稀疏观测相结合的一般思路 [12], [55], [56]。

为评估测量支撑的影响，我们在三种采样模式下生成稀疏观测，即随机采样、网格采样与道路约束采样。观测比例从 \(\{5\%,10\%,20\%,40\%\}\) 中选取。在主要对比中，我们聚焦随机 10% 设置，同时在随机 5%、网格 10% 与道路 10% 条件下开展补充实验。对每个有效基站，我们在建筑覆盖率与有效增益支撑约束下提取 160 个块，使每个块包含足够重建所需的结构多样性。显式变化观测比例与支撑模式的选择，也与此前关于 CKM/无线电地图构建中样本效率与数据需求的讨论相关 [24], [33]。

最终数据集索引在**块级别**建立，训练、验证与测试划分使用互不重叠的块标识生成，划分比例分别为 70%、15% 与 15%。由于划分按块标识而非采样变体进行，同一底层块的不同稀疏版本绝不会出现在不同数据分区中。这避免了信息泄漏并确保公平的评估协议，与近期无线电地图与 CKM 数据集中面向基准的评估实践一致 [9], [31]。

### B. 实现细节

**1) 硬件与软件环境：** 全部实验在一台配备 Intel Core i9-12900KF CPU、16 GB 显存的 NVIDIA GeForce RTX 5060 Ti GPU 与 64 GB 内存的工作站上进行。射线追踪基准使用 Python 3.11 结合 Sionna RT 与 TensorFlow 生成，重建模型以 PyTorch 2.x 实现。通过 CUDA 11.8 与 cuDNN 启用 GPU 加速。数据集生成流水线同样使用 Sionna RT 后端。

**2) 训练策略：** 所提 GeoUQ-GFNet 以随机 10% 稀疏观测设置为默认训练变体，针对无线电地图补全任务训练。除非另有说明，批次大小为 8，使用 AdamW 优化器、学习率 \(10^{-4}\)、权重衰减 \(10^{-5}\)，最多训练 120 个 epoch。使用 ReduceLROnPlateau 调度器，在验证损失饱和时把学习率降低为原来的 0.5 倍。采用早停，耐心值为 20 个 epoch。为稳定优化，训练全程使用最大范数为 1.0 的梯度裁剪。GeoUQ-GFNet 的配置与我们的代码库实现一致：基础通道宽度为 32，Grid-KAN 模块隐藏维度为 32，Ghost 比率为 2，FPN 通道维度为 64，每个 Grid-KAN 层中的径向基函数个数为 10。在报告实验中 dropout 率设为零。该轻量主干设计受到 Ghost 模块面向效率的特征生成与 KAN 式表示的非线性建模能力启发 [45], [59], [60]。

输入归一化按通道进行。高度地图以训练集中观测到的最大高度值归一化。相对坐标地图与距离地图使用训练集均值与标准差标准化。与增益相关的通道（包括稀疏增益与初始化增益）被裁剪到 \(-140\) dB 至 \(-50\) dB 的区间，然后线性归一化到 \([0,1]\)。目标增益地图以同样方式归一化。为提升泛化性，数据增强仅施加于训练集，具体包括随机旋转与水平或垂直翻转。增强过程中，相对坐标通道随几何操作一致变换，使其在旋转或反射后保持物理含义。对第 IV 节定义的复合训练目标，经验损失权重设为 \(\lambda_1=1.0\)、\(\lambda_{\mathrm{grad}}=0.05\)、\(\lambda_{\mathrm{nll}}=0.2\)、\(\lambda_{\mathrm{var}}=0.001\)。重建项与负对数似然项仅在未观测可及单元上计算，而梯度一致性项在全部有效可及区域上评估。为在优化期间保持数值稳定，不确定性头输出的预测对数方差地图被显式裁剪到 \([-6.0,2.0]\) 区间。对主动测量评估，已训练模型在测试块上迭代查询：初始稀疏观测更新 4 轮，每轮增加相当于块面积 1% 的额外观测预算。不确定性引导策略选择不确定性最高的未观测可及单元，随机基线使用相同预算但从候选集合中均匀采样。该评估协议与先前在匹配预算下比较不确定性驱动查询与无信息采样的主动无线电地图获取工作密切相关 [24], [28], [52]。

### C. 性能评估指标

我们同时使用归一化域与物理域指标评估重建质量。设 \(\hat{\mathbf G}\) 与 \(\mathbf G\) 分别表示预测与真值增益地图。所有指标在可及区域上计算；在与训练相关的分析中，更强调未观测可及单元上的误差。

归一化均方根误差（normalized root mean square error，RMSE）定义为：

$$
\mathrm{RMSE}_{\mathrm{norm}}=\sqrt{\frac{\sum_{i,j}M_{a,i,j}\left(\hat G^{\mathrm{norm}}_{i,j}-G^{\mathrm{norm}}_{i,j}\right)^2}{\sum_{i,j}M_{a,i,j}}}.\tag{33}
$$

在物理域中，我们以 dB 为单位报告均方根误差（RMSE）与平均绝对误差（mean absolute error，MAE）：

$$
\mathrm{RMSE}_{\mathrm{dB}}=\sqrt{\frac{\sum_{i,j}M_{a,i,j}\left(\hat G_{i,j}-G_{i,j}\right)^2}{\sum_{i,j}M_{a,i,j}}},\tag{34}
$$

$$
\mathrm{MAE}_{\mathrm{dB}}=\frac{\sum_{i,j}M_{a,i,j}\left|\hat G_{i,j}-G_{i,j}\right|}{\sum_{i,j}M_{a,i,j}}.\tag{35}
$$

对不确定性感知模型，我们额外通过**绝对预测误差与预测标准差之间的相关性**评估预测不确定性地图的有用性。更高的正相关表明模型为确实更难重建的区域赋予更大的不确定性，这对主动感知十分重要 [24], [28]。

对主动测量选择，我们报告每次额外测量预算增量之后的重建 RMSE。该指标直接反映固定感知预算下不确定性引导查询的实用价值。在对比中，不确定性引导选择与随机选择在完全相同的增量预算下评估，这使所得性能差距成为决策效用的直接指示 [24], [52]。

## VI. 结果与分析

本节评估场景级泛化性、总体重建精度、基站级鲁棒性，以及不确定性引导主动测量选择的实用价值。除非另有说明，文中所有数值比较均遵循表 I、表 II 与表 III 汇总的结果。

**表 I（原文 TABLE I）：场景级平均 RMSE（dB）**

| 场景类型 | Efficient-UNet | GeoUQ-GFNet | Nearest | ResNet-UNet | ViT-UNet |
|---|---|---|---|---|---|
| Building-medium | 5.6122 | **5.3739** | 7.8389 | 5.7396 | 7.1343 |
| Building-sparse | 6.0882 | **5.7654** | 9.0199 | 6.1814 | 6.8790 |
| Canyon | 5.7237 | **5.4255** | 8.0844 | 5.8100 | 6.9207 |
| Crossroad | 5.4449 | **5.2028** | 7.5684 | 5.5203 | 6.9970 |
| Offset-crossroad | 4.9781 | **4.7831** | 7.0034 | 5.0875 | 6.6338 |
| T-junction | 5.5080 | **5.3109** | 7.8881 | 5.6255 | 7.0008 |
| 全部场景平均 | 5.5592 | **5.3102** | 7.9005 | 5.6607 | 6.9276 |

**图 6（原文 Fig. 6）：** 场景级 RMSE 热图，单位 dB（横轴为 Efficient-UNet、GeoUQ-GFNet、Nearest、ResNet-UNet、ViT-UNet，纵轴为 Building-medium、Building-sparse、Canyon、Crossroad、Offset-crossroad、T-junction）。

**图 7（原文 Fig. 7）：** 按场景类型分组的 RMSE（柱状图，横轴为六类场景，纵轴为 RMSE (dB)，图例为五个对比模型）。

场景相关行为首先报告于表 I、图 6 与图 7。可以观察到若干清晰规律。第一，GeoUQ-GFNet 在每个场景类别中都是最佳模型。其在全部场景类型上的平均 RMSE 为 5.3102 dB，低于 Efficient-UNet 的 5.5592 dB、ResNet-UNet 的 5.6607 dB、ViT-UNet 的 6.9276 dB 与 Nearest 的 7.9005 dB。第二，场景难度并不均匀。Building-sparse 对所有方法而言都是最难的一类，而 Offset-crossroad 最容易。例如，GeoUQ-GFNet 在 Building-sparse 上取得 5.7654 dB，但在 Offset-crossroad 上仅为 4.7831 dB。所有其他模型呈现相同趋势。这在物理上与场景几何一致：稀疏建筑布局既包含大片开阔区域，又包含陡峭的遮挡过渡，使增益场更难由有限观测推断；相比之下，Offset-crossroad 布局的几何结构更规则，占主导的空间传播趋势更易恢复。第三，最近邻插值基线在每个场景中都始终远弱于学习型模型。这证实稀疏无线电地图重建不应被视为纯粹的局部插值问题。由于缺失区域由几何、可见性与观测支撑共同塑造，我们的结果凸显了学习传播感知空间结构的必要性。

**表 II（原文 TABLE II）：总体重建性能**

| 模型 | RMSE (dB) | MAE (dB) | 误差—不确定性相关性 |
|---|---|---|---|
| GeoUQ-GFNet | **7.1025** | **1.6191** | **0.5818** |
| Efficient-UNet | 7.7557 | 2.0449 | 0.5780 |
| ViT-UNet | 7.7895 | 2.0978 | 0.5814 |
| ResNet-UNet | 7.8529 | 2.1139 | 0.5813 |
| Nearest | 11.9412 | 3.7052 | 0.0000 |

随后，总体对比汇总于表 II。GeoUQ-GFNet 取得最佳 RMSE（7.1025 dB）、最佳 MAE（1.6191 dB）与最佳误差—不确定性相关性（0.5818）。Efficient-UNet 是第二强的模型，RMSE 为 7.7557 dB、MAE 为 2.0449 dB。ViT-UNet 与 ResNet-UNet 紧随其后，且都明显优于最近邻插值基线。GeoUQ-GFNet 的改进是实质性的，而非边际性的：相对 Efficient-UNet，RMSE 降低约 0.65 dB；相对 ViT-UNet 与 ResNet-UNet，降低分别约为 0.69 dB 与 0.75 dB。MAE 的排序与 RMSE 排序完全一致。这些结果表明，所提设计同时改善了全局重建保真度与局部误差幅度。同样重要的是，不确定性分支并未削弱重建质量：相反，同一模型既取得最佳重建指标，又取得最高的误差—不确定性相关性，这支持了本文的核心论断——引入不确定性估计无需牺牲一次性预测质量。

除平均指标之外，检验一个代表性的定性示例也很有价值。图 8 给出一个十字路口场景、其真值无线电地图以及 GeoUQ-GFNet 的相应预测。可以作出若干观察。第一，预测地图保留了从所选基站辐射出的主导传播结构，并准确捕获与道路几何对齐的强走廊。第二，主要能量分支与遮挡引起的角度过渡得到良好保持，说明模型不只是对场做平滑，而能够恢复具有物理意义的空间结构。第三，尽管在某些弱反射区域与细节分支上仍存在轻微的局部差异，增益场的整体拓扑与真值高度一致。该定性案例补充了上述定量结果，并从视觉上表明所提模型不仅能重建平均强度水平，还能重建真实场景的主要几何传播模式。

**图 8（原文 Fig. 8）：** 十字路口场景的代表性定性示例。所提模型很好地恢复了真值无线电地图的主导传播走廊与主要角度能量结构。分图包括：(a) 场景布局与基站位置；(b) 真值无线电地图；(c) GeoUQ-GFNet 预测。

图 9 的基站级热图提供了更细致的分析。这里我们保留每个场景中最具代表性的三个基站实例，这使对比比完整基站列表更易读，同时仍保留跨场景趋势。主要结论保持不变：GeoUQ-GFNet 在几乎所有列出的基站实例上给出最低 RMSE，而 Nearest 始终是最弱基线。这一结果很重要，因为它表明所提模型的增益并未集中在少数有利发射机上，而是跨不同基站部署、跨道路导向与建筑主导环境持续存在。基站级视图还揭示了有意义的场景内差异。在 Canyon 族中，对每个模型而言 BS 2 都比 BS 0 与 BS 1 容易得多；在 Building-sparse 族中，BS 2 明显比 BS 0 与 BS 1 更难。这是符合预期的，因为改变基站位置会改变角度可见性、遮挡配置以及视距与非视距区域之间的平衡。因此，仅凭场景平均值不足以刻画稀疏无线电地图难度。强模型必须同时对场景拓扑与基站部署保持鲁棒，而图 9 的结果支持 GeoUQ-GFNet 满足这一结论。

**图 9（原文 Fig. 9）：** 各场景中按基站分组的 RMSE 热图，单位 dB（纵轴为各场景的 BS_0、BS_1、BS_2 等实例）。

**表 III（原文 TABLE III）：预算比例 0.04 下的主动感知对比**

| 模型 | UQ RMSE (dB) | Rand. RMSE (dB) | 增益 (dB) |
|---|---|---|---|
| GeoUQ-GFNet | **3.1002** | **5.9144** | **2.8142** |
| ViT-UNet | 3.4558 | 6.2599 | 2.8041 |
| Efficient-UNet | 3.5101 | 6.2742 | 2.7641 |
| ResNet-UNet | 3.5543 | 6.3106 | 2.7563 |
| Nearest | 9.8791 | 9.8791 | 0.0000 |

最具实用重要性的结果涉及主动测量选择。最终对比汇总于表 III，GeoUQ-GFNet 的完整预算轨迹示于图 10。有若干观察尤为重要。第一，不确定性引导感知为所有学习型模型带来大幅增益。在最终额外感知预算比例 0.04 处，GeoUQ-GFNet 达到 3.1002 dB，而随机选择仍为 5.9144 dB，对应 2.8142 dB 的增益。Efficient-UNet、ResNet-UNet 与 ViT-UNet 也分别呈现 2.7641 dB、2.7563 dB 与 2.8041 dB 的类似大幅增益。第二，最近邻基线没有增益，因为它不提供有用的不确定性估计，因此无法支撑有信息的查询选择。第三，GeoUQ-GFNet 的改进曲线在整个感知过程中平滑且单调：RMSE 从 6.79 dB 降至 5.49 dB，再降至 4.48 dB、3.73 dB，最后降至 3.10 dB；相比之下，随机策略在相同预算范围内仅从 6.79 dB 降至 5.91 dB。这一结果直接支持了本文的核心论点：预测不确定性的主要价值不仅在于置信度报告，更在于在有限感知预算下引导“下一步在哪里测量”。换言之，不确定性具有很强的决策效用，且该效用大于仅从一次性重建指标中看到的差距。

综合来看，这些结果为稀疏增益无线电地图重建给出以下三点新结论：(1) GeoUQ-GFNet 在重建精度与不确定性质量上均为总体最强的模型；(2) 场景几何与基站部署都对重建难度有强影响，因此评估不应只停留在单一平均值上；(3) 最重要的是，不确定性作为测量获取的决策信号尤其有价值。这正是稀疏无线电地图重建不应仅作为空间预测任务、而应同时作为**测量感知的决策问题**来研究的原因。

**图 10（原文 Fig. 10）：** GeoUQ-GFNet 的主动感知结果。随着额外感知预算从 0 增加到 0.04，不确定性引导查询稳步降低 RMSE，并明显优于随机选择。

## VII. 结论

本文研究了几何与感知约束下的稀疏增益无线电地图重建。我们构建了一个可控射线追踪基准 **UrbanRT-RM**，包含多个场景、基站部署与采样模式；并开发了 **GeoUQ-GFNet**，用于联合增益重建与不确定性估计。结果表明，GeoUQ-GFNet 取得最佳总体重建性能，并在不同场景类型与基站部署下保持鲁棒。结果还表明，重建难度强烈依赖场景几何与发射机位置；同时，预测不确定性对主动测量选择尤为有用——不确定性引导查询带来的增益远大于一次性重建本身的改善。这些发现提示：稀疏无线电地图重建不仅应被视为空间预测问题，也应被视为几何感知且测量感知的决策问题。

## 参考文献（英文原条目）

[1] Z. Jin, L. You, J. Wang, X.-G. Xia, and X. Gao, "An I2I Inpainting Approach for Efficient Channel Knowledge Map Construction," IEEE Trans. Wireless Commun., vol. 24, no. 2, pp. 1415–1429, Feb. 2025.

[2] H. Wang, X. Shi, H. Zhang, Y. Cao, S. Yang, J. Wang, and K. Huang, "BeamCKM: A Framework of Channel Knowledge Map Construction for Multi-Antenna Systems," arXiv preprint arXiv:2511.18376, 2025.

[3] L. Zhao, Y. Wang, X. Wang, Z. Fei, and Y. Zeng, "BeamCKMDiff: Beam-Aware Channel Knowledge Map Construction via Diffusion Transformer," arXiv preprint arXiv:2601.10207, 2026.

[4] H. Wang, X. Shi, H. Zhang, Y. Cao, and J. Wang, "Beamforming-Codebook-Aware Channel Knowledge Map Construction for Multi-Antenna Systems," arXiv preprint arXiv:2505.16132, 2025.

[5] Z. Huang, Y. Zeng, S. Fu, X. Xu, and H. Du, "Channel Knowledge Map Construction via Guided Flow Matching," unpublished manuscript / preprint, 2025.

[6] Y. Zhu, X. Liao, Z. Gao, L. Zeng, and Y. Zeng, "Channel Knowledge Map Construction via Physics-Inspired Diffusion Model Without Prior Observations," arXiv preprint arXiv:2512.02757, 2025.

[7] X. Liu, S. Sun, M. Tao, A. Kaushik, and H. Yan, "Channel Knowledge Maps for 6G Wireless Networks: Construction, Applications, and Future Challenges," review manuscript, 2025.

[8] X. Wang, Y. Shi, T. Wang, Y. Huang, Z. Hu, L. Chen, and Z. Jiang, "Channel Knowledge Map-Aided Channel Prediction With Measurements-Based Evaluation," IEEE Trans. Commun., vol. 73, no. 5, pp. 3622–3636, May 2025.

[9] Z. Wu, D. Wu, S. Fu, Y. Qiu, and Y. Zeng, "CKMImageNet: A Dataset for AI-Based Channel Knowledge Map Towards Environment-Aware Communication and Sensing," arXiv preprint arXiv:2504.09849, 2025.

[10] J. Zhou, C. Hu, G. Wu, Z. Ren, H. Hu, J. Zhang, R. Zhang, and J. Xu, "6D Channel Knowledge Map Construction via Bidirectional Wireless Gaussian Splatting," arXiv preprint arXiv:2510.26166, 2025.

[11] Y. Wang, W. Guo, C. Huang, G. Chen, Y. Zhang, and S. Cui, "Point Cloud Environment-Based Channel Knowledge Map Construction," arXiv preprint arXiv:2506.21112, 2025.

[12] Y. Wang, C. Huang, S. Zhang, G. Chen, W. Guo, S. Lan, L. Xu, X. Cheng, X. Tang, and S. Cui, "Towards Precise Channel Knowledge Map: Exploiting Environmental Information from 2D Visuals to 3D Point Clouds," arXiv preprint arXiv:2510.08140, 2025.

[13] J. Liu, G. Ding, Y. Xu, J. Gu, H. Wang, J. Wang, and X. Zhou, "Channel Knowledge Map-Assisted Routing Scheme for Low-Altitude Economy," IEEE Trans. Veh. Technol., early access, 2025.

[14] S. Wang, X. Xu, and Y. Zeng, "Deep Learning-Based CKM Construction with Image Super-Resolution," arXiv preprint arXiv:2411.08887, 2025.

[15] Z. Dai, D. Wu, X. Xu, and Y. Zeng, "Generating CKM Using Others' Data: Cross-AP CKM Inference with Deep Learning," IEEE Trans. Veh. Technol., early access, 2025.

[16] S. Fu, Z. Wu, D. Wu, and Y. Zeng, "Generative CKM Construction using Partially Observed Data with Diffusion Model," in Proc. IEEE VTC2025-Spring, 2025.

[17] X. Shi, H. Wang, Y. Cao, H. Zhang, S. Yang, and J. Wang, "Leveraging Channel Knowledge Map for Multi-User Hierarchical Beam Training Under Position Uncertainty," arXiv preprint arXiv:2511.22902, 2025.

[18] B. Yang, W. Zhang, and S. Zhang, "AIGC-Based Radio Map Construction for Channel Estimation in Low-Altitude Economy," in Proc. IEEE/CIC Int. Conf. Commun. China Workshops, 2025.

[19] L. Cai, G. Xu, Q. Zhang, Z. Song, and W. Zhang, "Deep Learning Based Channel Estimation for Deep-Space Communications," IEEE Trans. Veh. Technol., vol. 74, no. 12, pp. 19743–19755, Dec. 2025.

[20] R. Sun, N. Cheng, C. Li, W. Quan, H. Zhou, Y. Wang, W. Zhang, and X. Shen, "A Comprehensive Survey of Knowledge-Driven Deep Learning for Intelligent Wireless Network Optimization in 6G," IEEE Commun. Surveys Tuts., vol. 28, pp. 1099–1135, 2026.

[21] B. Yang, W. Wang, and W. Zhang, "Radio Map-Based Beamforming Assisted With Reduced Pilots," IEEE Trans. Wireless Commun., vol. 24, no. 10, pp. 8878–8891, Oct. 2025.

[22] M. Gao, G. Xu, Z. Song, Q. Zhang, and W. Zhang, "Performance Analysis of LEO Satellite-Assisted Deep Space Communication Systems," IEEE Trans. Aerosp. Electron. Syst., vol. 61, no. 5, pp. 12628–12648, Oct. 2025.

[23] C. Wu, Z. Yang, and C. Xiao, "Automatic Radio Map Adaptation for Indoor Localization Using Smartphones," IEEE Trans. Mobile Comput., vol. 17, no. 3, pp. 517–531, Mar. 2018.

[24] K. D. Polyzos, A. Sadeghi, W. Ye, S. Sleder, K. Houssou, J. Calder, Z.-L. Zhang, and G. B. Giannakis, "Bayesian Active Learning for Sample Efficient 5G Radio Map Reconstruction," IEEE Trans. Wireless Commun., vol. 23, no. 12, pp. 19382–19396, Dec. 2024.

[25] D. Romero, D. Lee, and G. B. Giannakis, "Blind Radio Tomography," IEEE Trans. Signal Process., vol. 66, no. 8, pp. 2055–2069, Apr. 2018.

[26] R. K. Jaiswal, M. Elnourani, S. Deshmukh, and B. Beferull-Lozano, "A Data-Driven Transfer Learning Method for Indoor Radio Map Estimation," IEEE Trans. Veh. Technol., vol. 75, no. 3, pp. 4261–4277, Mar. 2026.

[27] R. K. Martin, A. Folkerts, and T. Heinl, "Accuracy vs. Resolution in Radio Tomography," IEEE Trans. Signal Process., vol. 62, no. 10, pp. 2480–2490, May 2014.

[28] D. Lee, D. Berberidis, and G. B. Giannakis, "Adaptive Bayesian Radio Tomography," IEEE Trans. Signal Process., vol. 67, no. 8, pp. 1964–1979, Apr. 2019.

[29] D. Romero, P. Q. Viet, and R. Shrestha, "Aerial Base Station Placement via Propagation Radio Maps," IEEE Trans. Commun., vol. 72, no. 9, pp. 5349–5364, Sep. 2024.

[30] D. Wu, Y. Zeng, S. Jin, and R. Zhang, "Environment-Aware Hybrid Beamforming by Leveraging Channel Knowledge Map," IEEE Trans. Wireless Commun., vol. 23, no. 5, pp. 4990–5005, May 2024.

[31] S. Zhang, S. Jiang, W. Lin, Z. Fang, K. Liu, H. Zhang, and K. Chen, "Generative AI on SpectrumNet: An Open Benchmark of Multiband 3-D Radio Maps," IEEE Trans. Cogn. Commun. Netw., vol. 11, no. 2, pp. 886–899, Apr. 2025.

[32] X. Chen, X. Zhong, Z. Zhang, L. Dai, and S. Zhou, "High-Efficiency Urban 3D Radio Map Estimation Based on Sparse Measurements," IEEE Trans. Veh. Technol., vol. 74, no. 10, pp. 16488–16493, Oct. 2025.

[33] X. Xu and Y. Zeng, "How Much Data Is Needed for Channel Knowledge Map Construction?," IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13011–13021, Oct. 2024.

[34] D. Lee, S.-J. Kim, and G. B. Giannakis, "Channel Gain Cartography for Cognitive Radios Leveraging Low Rank and Sparsity," IEEE Trans. Wireless Commun., vol. 16, no. 9, pp. 5953–5966, Sep. 2017.

[35] Y. Teganya and D. Romero, "Deep Completion Autoencoders for Radio Map Estimation," IEEE Trans. Wireless Commun., vol. 21, no. 3, pp. 1710–1724, Mar. 2022.

[36] S. Shrestha, X. Fu, and M. Hong, "Deep Spectrum Cartography: Completing Radio Map Tensors Using Learned Neural Models," IEEE Trans. Signal Process., vol. 70, pp. 1170–1185, 2022.

[37] S. Roger, M. Brambilla, B. Camajori Tedeschini, C. Botella-Mascarell, M. Cobos, and M. Nicoli, "Deep-Learning-Based Radio Map Reconstruction for V2X Communications," IEEE Trans. Veh. Technol., vol. 73, no. 3, pp. 3863–3876, Mar. 2024.

[38] J. A. Bazerque and G. B. Giannakis, "Distributed Spectrum Sensing for Cognitive Radio Networks by Exploiting Sparsity," IEEE Trans. Signal Process., vol. 58, no. 3, pp. 1847–1862, Mar. 2010.

[39] X. Chen, J. Wang, and Q. Huang, "Dynamic Spectrum Cartography: Reconstructing Spatial-Spectral-Temporal Radio Frequency Map via Tensor Completion," IEEE Trans. Signal Process., vol. 73, pp. 1184–1199, 2025.

[40] K. Liu, C. Qiu, K. Chen, Q. Zheng, L. Song, and Y. Wang, "Paying Deformable Attention to Sparse Spatial Observations for Deep Radio Map Estimation," IEEE Trans. Cogn. Commun. Netw., vol. 12, pp. 1436–1450, 2026.

[41] H. Zhao, Q. Hao, Y. He, H. Huang, H. Sari, F. Adachi, and G. Gui, "Radio Map Reconstruction Based on Deep Denoising Regularization for UAV Communications," IEEE Trans. Veh. Technol., vol. 74, no. 6, pp. 9876–9881, Jun. 2025.

[42] B. Li and J. Chen, "Radio Map-Assisted Approach for Interference-Aware Predictive UAV Communications," IEEE Trans. Wireless Commun., vol. 23, no. 11, pp. 16725–16741, Nov. 2024.

[43] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, "RadioDiff: An Effective Generative Diffusion Model for Sampling-Free Dynamic Radio Map Construction," IEEE Trans. Cogn. Commun. Netw., vol. 11, no. 2, pp. 738–750, Apr. 2025.

[44] X. Mu, Y. Liu, L. Guo, J. Lin, and R. Schober, "Intelligent Reflecting Surface Enhanced Indoor Robot Path Planning: A Radio Map-Based Approach," IEEE Trans. Wireless Commun., vol. 20, no. 7, pp. 4732–4747, Jul. 2021.

[45] C. Liao, X. Ge, M. He, Y. Zheng, and S. Liu, "KAN-Based Interpretable Radio Map Prediction Framework With Symbolic Data Fusion," IEEE Trans. Cogn. Commun. Netw., vol. 12, pp. 1788–1802, 2026.

[46] M. Kasparick, R. L. G. Cavalcante, S. Valentin, S. Stanczak, and M. Yukawa, "Kernel-Based Adaptive Online Reconstruction of Coverage Maps With Side Information," IEEE Trans. Veh. Technol., vol. 65, no. 7, pp. 5461–5473, Jul. 2016.

[47] D. Romero, S.-J. Kim, G. B. Giannakis, and R. Lopez-Valcarce, "Learning Power Spectrum Maps From Quantized Power Measurements," IEEE Trans. Signal Process., vol. 65, no. 10, pp. 2547–2560, May 2017.

[48] R. K. Jaiswal, M. Elnourani, S. Deshmukh, and B. Beferull-Lozano, "Leveraging Transfer Learning for Radio Map Estimation via Mixture of Experts," IEEE Trans. Cogn. Commun. Netw., vol. 12, pp. 846–863, 2026.

[49] Y. Teganya, D. Romero, L. M. Lopez Ramos, and B. Beferull-Lozano, "Location-Free Spectrum Cartography," IEEE Trans. Signal Process., vol. 67, no. 15, pp. 4013–4028, Aug. 2019.

[50] Y. Zeng, X. Xu, S. Jin, and R. Zhang, "Simultaneous Navigation and Radio Mapping for Cellular-Connected UAV With Deep Reinforcement Learning," IEEE Trans. Wireless Commun., vol. 20, no. 7, pp. 4205–4220, Jul. 2021.

[51] K. Sato, K. Suto, K. Inage, K. Adachi, and T. Fujii, "Space-Frequency-Interpolated Radio Map," IEEE Trans. Veh. Technol., vol. 70, no. 1, pp. 714–725, Jan. 2021.

[52] R. Shrestha, D. Romero, and S. P. Chepuri, "Spectrum Surveying: Active Radio Map Estimation With Autonomous UAVs," IEEE Trans. Wireless Commun., vol. 22, no. 1, pp. 627–640, Jan. 2023.

[53] D. Romero, T. N. Ha, R. Shrestha, and M. Franceschetti, "Theoretical Analysis of the Radio Map Estimation Problem," IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13722–13737, Oct. 2024.

[54] X. Li, S. Zhang, H. Li, X. Li, L. Xu, H. Xu, H. Mei, G. Zhu, N. Qi, and M. Xiao, "RadioGAT: A Joint Model-Based and Data-Driven Framework for Multi-Band Radiomap Reconstruction via Graph Attention Networks," IEEE Trans. Wireless Commun., vol. 23, no. 11, pp. 17777–17792, Nov. 2024.

[55] S. Zhang, T. Yu, B. Choi, F. Ouyang, and Z. Ding, "Radiomap Inpainting for Restricted Areas Based on Propagation Priority and Depth Map," IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 9330–9344, Aug. 2024.

[56] R. Levie, C. Yapar, G. Kutyniok, and G. Caire, "RadioUNet: Fast Radio Map Estimation With Convolutional Neural Networks," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, Jun. 2021.

[57] J. Wilson and N. Patwari, "See-Through Walls: Motion Tracking Using Variance-Based Radio Tomography Networks," IEEE Trans. Mobile Comput., vol. 10, no. 5, pp. 612–621, May 2011.

[58] D. C. Nguyen, M. Ding, P. N. Pathirana, A. Seneviratne, J. Li, D. Niyato, O. Dobre, and H. V. Poor, "6G Internet of Things: A Comprehensive Survey," IEEE Internet Things J., vol. 9, no. 1, pp. 359–383, Jan. 2022.

[59] K. Han, Y. Wang, Q. Tian, J. Guo, C. Xu, and C. Xu, "GhostNet: More Features From Cheap Operations," in Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit., pp. 1580–1589, 2020.

[60] Z. Liu, Y. Wang, S. Vaidya, F. Ruehle, J. Halverson, M. Soljačić, T. Y. Hou, and M. Tegmark, "KAN: Kolmogorov–Arnold Networks," in Proc. Int. Conf. Learn. Represent., 2025.

[61] N. Kato, Z. M. Fadlullah, F. Tang, B. Mao, S. Tani, A. Okamura, and J. Liu, "Optimizing Space-Air-Ground Integrated Networks by Artificial Intelligence," IEEE Wireless Commun., vol. 26, no. 4, pp. 140–147, Aug. 2019.

[62] J. Liu, Y. Shi, Z. M. Fadlullah, and N. Kato, "Space-Air-Ground Integrated Network: A Survey," IEEE Commun. Surveys Tuts., vol. 20, no. 4, pp. 2714–2741, 2018.

[63] W. Saad, M. Bennis, and M. Chen, "A Vision of 6G Wireless Systems: Applications, Trends, Technologies, and Open Research Problems," IEEE Netw., vol. 34, no. 3, pp. 134–142, May 2020.

[64] J. Hoydis, F. Aït Aoudia, S. Cammerer, M. Nimier-David, N. Binder, G. Marcus, and A. Keller, "Sionna RT: Differentiable Ray Tracing for Radio Propagation Modeling," in Proc. IEEE Globecom Workshops (GC Wkshps), pp. 317–321, 2023.

[65] Z. Zeng, K. Wang, Z. Zhang, and Y. Xiu, "GAC-KAN: An Ultra-Lightweight GNSS Interference Classifier for GenAI-Powered Consumer Edge Devices," arXiv preprint arXiv:2602.11186, 2026.

[66] Z. Zeng, Y. Zhao, K. Wang, D. Niyato, Y. Xiu, L. Chen, Z. Zhang, and N. Wei, "PhyG-MoE: A Physics-Guided Mixture-of-Experts Framework for Energy-Efficient GNSS Interference Recognition," arXiv preprint arXiv:2601.12798, 2026.

[67] Z. Zeng, Y. Zhao, K. Wang, D. Niyato, H. Shu, J. Zhao, Y. Huang, Y. Xiu, Z. Zhang, and N. Wei, "SKANet: A Cognitive Dual-Stream Framework with Adaptive Modality Fusion for Robust Compound GNSS Interference Classification," arXiv preprint arXiv:2601.12791, 2026.

[68] Z. Zeng, H. Shu, K. Wang, L. Chen, A. Hussain, Y. Huang, J. Zhao, Y. Xiu, and Z. Zhang, "JSR-GFNet: Jamming-to-Signal Ratio-Aware Dynamic Gating for Interference Classification in future Cognitive Global Navigation Satellite Systems," arXiv preprint arXiv:2602.00042, 2026.

[69] Y. Xiu et al., "Robust Optimization for Movable Antenna-Aided Cell-Free ISAC With Time Synchronization Errors," IEEE Trans. Wireless Commun., vol. 25, pp. 10082–10097, 2026.

[70] Y. Xiu et al., "Power Source Allocation for RIS-aided Integrating Sensing, Communication, and Power Transfer Communication Systems Based on NOMA," IEEE Trans. Mob. Comput., pp. 1–14, 2026.

[71] Y. Xiu et al., "Movable Antenna-Aided Cooperative ISAC Network with Time Synchronization Error and Imperfect CSI," IEEE Trans. Commun., p. 1, 2025.

[72] Y. Xiu et al., "Latency Minimization for Movable Relay-Aided D2D-MEC Communication Systems," IEEE Trans. Mob. Comput., vol. 25, no. 1, pp. 533–549, 2026.

[73] Y. Xiu, W. Lyu, P. L. Yeoh, Y. Ai, and N. Wei, "Secure Enhancement for RIS-Aided UAV with ISAC: Robust Design and Resource Allocation," IEEE Trans. Veh. Technol., pp. 1–16, 2025.

[74] Z. Zhang, Y. Xiu, Z. Dong, J. Yin, M. J. Khabbaz, C. Assi, and N. Wei, "Crosstalk-Resilient Beamforming for Movable Antenna Enabled Integrated Sensing and Communication," IEEE Wireless Commun. Lett., p. 1, 2026.

[75] Z. Zhang, Y. Xiu, P. L. Yeoh, G. Liu, Z. Wu, and N. Wei, "Distortion-Aware Hybrid Beamforming for Integrated Sensing and Communication," IEEE Commun. Lett., vol. 30, pp. 682–686, 2026.

[76] X. Dong, W. Lyu, R. Yang, Y. Xiu, W. Mei, and Z. Zhang, "Movable Antenna Enhanced Secure Simultaneous Wireless Information and Power Transfer," IEEE Commun. Lett., vol. 29, no. 10, pp. 2356–2360, 2025.

[77] Y. Xiu et al., "Robust Beamforming Design for Near-Field DMA-NOMA mmWave Communications With Imperfect Position Information," IEEE Trans. Wireless Commun., vol. 24, no. 2, pp. 1678–1692, 2025.

[78] S. Yang et al., "Flexible WMMSE Beamforming for MU-MIMO Movable Antenna Communications," IEEE Trans. Signal Process., vol. 73, pp. 4479–4491, 2025.

**本页范围与校对状态：** 本页覆盖原文摘要、第 I–VII 节全部正文与小节（III-A–D、IV-A–J、V-A–C、VI、VII）、式 (1)–(35) 编号、算法 1 逐行、表 I–III（逐格转写并与 PDF 渲染图像逐项核对）、图 1–10 图注、参考文献 [1]–[78]（英文原条目，按 PDF 渲染页逐条核对）。原文无关键词段、无附录。**已知缺陷与原稿疑点（按原样保留，未擅自修正）：** ① 式 (9) 与式 (10) 在 PDF 中排印完全相同（\(\Omega_{\mathrm{unobs}}\) 与 \(\Omega_{\mathrm{cand}}\) 定义为同一集合），疑为原稿重复定义，本页按原文编号原样保留；② 原稿存在多个符号复用：\(L(\mathbf q)\)（路损）与 \(\mathbf L\)（LoS 代理地图）、\(S(\mathbf q)\)（阴影衰落）与 \(\mathbf S\)（对数方差）、\(\mathbf H\)（建筑高度地图）与 \(H\)（网格高度）、以及 \(M\)（Grid-KAN 基函数个数）等，本页按原文保留；③ 第 IV-H 节中 \(\hat{\mathbf U}=\exp(\frac12\mathbf S)\) 为向量形式，而式 (30) 的 \(\mathcal L_{\mathrm{NLL}}\) 逐元素写作 \(s_{i,j}\)，原文混用，本页保留；④ 第 IV-J 节与算法 1 第 8 行使用 \(M^{(t)}_{i,j}=0\)，而式 (9)(10) 使用 \(M_{s,i,j}=0\)，记号略有出入，按原文；⑤ 图 6、图 7、图 9 为热图/柱状图，原文仅在正文定性讨论其趋势，未逐格引用格子内数值，本页只译图注、未转写图中数字；⑥ 第 IV-E 节开头一句在 PDF 中跨页断排（"The context feature is mathematically written" / "as \(\mathbf F_{\mathrm{ctx}}=\mathcal C(\mathbf F_3)\)"），本页已合并为完整句。逐句逐式终校未做；供后续 QA 重点核对：式 (17) 门控残差加性形式、式 (21) 中 \(\mathbf H\) 的指代、式 (26) 的掩码合并、算法 1 第 3/6 行记号、以及表 I–III 与正文数字的一致性。

**登记（2026-11-01）：** 本篇按 2026-10-30 口径登记为“可公开全文译文”——全文覆盖已录入；逐句逐式终校未做。
{% endraw %}
