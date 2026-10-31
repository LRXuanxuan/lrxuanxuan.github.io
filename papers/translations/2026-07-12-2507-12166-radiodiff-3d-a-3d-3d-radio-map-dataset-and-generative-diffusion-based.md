---
layout: page
title: "RadioDiff-3D：三维无线电地图数据集与生成扩散｜中文全文译文"
permalink: /papers/translations/2026-07-12-2507-12166-radiodiff-3d-a-3d-3d-radio-map-dataset-and-generative-diffusion-based/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/dc124267e48719cb/) · [原文 arXiv](https://arxiv.org/abs/2507.12166) · [全部目录](/papers/catalog/)

# RadioDiff-3D：三维无线电地图数据集与生成扩散

**原题：** RadioDiff-3D: A 3D×3D Radio Map Dataset and Generative Diffusion Based Benchmark for 6G Environment-Aware Communication  
**作者：** Xiucheng Wang（Graduate Student Member, IEEE）、Qiming Zhang、Nan Cheng（Senior Member, IEEE）、Junting Chen（Member, IEEE）、Zezhong Zhang（Member, IEEE）、Zan Li（Fellow, IEEE）、Shuguang Cui（Fellow, IEEE）、Xuemin (Sherman) Shen（Fellow, IEEE）  
**单位：** Xiucheng Wang、Nan Cheng 与 Zan Li 为西安电子科技大学 ISN 国家重点实验室与通信工程学院（西安 710071，中国）；Qiming Zhang 为西安电子科技大学人工智能学院（西安 710071，中国）；Junting Chen、Zezhong Zhang 与 Shuguang Cui 为香港中文大学（深圳）理工学院、深圳市未来网络智能研究院（FNii-Shenzhen）与广东省未来智能网络重点实验室；Xuemin (Sherman) Shen 为加拿大滑铁卢大学电子与计算机工程系。（Xiucheng Wang 与 Qiming Zhang 对本工作贡献相同；通讯作者：Nan Cheng。）  
**资助：** 国家重点研发计划（2024YFB907500）。  
**版本：** arXiv:2507.12166v1（cs.LG），2025-07-16，原文 18 页（含图 1—10、表 I—VIII）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、图 1—10 图注、表 I—VIII（逐格）、参考文献 [1]—[71] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** ①骨架原写 "arXiv:2507.12166，2026-07-12"；本地 PDF 为 **arXiv:2507.12166v1 [cs.LG]，2025-07-16**，"2026-07-12" 应为站点推荐日期。②摘要末尾数据集链接在 PDF 抽取文本中被截断（仅有 "The dataset is available at" 后缺失 URL），此处照缺并加注，待 Lead/原文核验。

## 摘要

无线电地图（radio map，RM）是使能环境感知无线通信的关键基础，它提供无线信道特征的空间分布。尽管近期数据驱动的 RM 构建取得进展，但现有方法大多只关注固定二维平面上的路径损耗预测，忽略了到达方向（DoA）、到达时间（ToA）与垂直空间变化等关键参数。这一局限主要源于静态学习范式，使其难以泛化到训练数据分布之外。为应对这些挑战，我们提出 **UrbanRadio3D**——一个在真实城市环境中通过射线追踪构建的大规模、高分辨率三维 RM 数据集。UrbanRadio3D 在三维空间上以路径损耗、DoA 与 ToA 三项指标覆盖，规模是既有数据集的 37 倍以上，构成新颖的 **3D×3D 数据集**，其高度层数是先前最先进（SOTA）数据集的 7 倍。为对三维 RM 构建进行基准测试，我们提出一种采用**三维卷积算子**的 UNet。此外，我们进一步提出 **RadioDiff-3D**——一种利用三维卷积架构的、基于扩散模型的生成式框架。RadioDiff-3D 既支持发射机位置已知的辐射感知场景，也支持基于稀疏空间观测的辐射未知场景。在 UrbanRadio3D 上的大量评估验证：RadioDiff-3D 在多样环境动态下构建丰富、高维无线电地图时取得优越性能，本工作为三维环境感知通信的未来研究提供了基础数据集与基准。数据集可在以下地址获取：（原文此处 URL 缺失，见页首页面信息核对注）。

**索引词**：无线电地图；路径损耗；到达方向；到达时间；扩散模型；生成式人工智能。

## I. 引言

为支撑第六代（6G）网络中沉浸式通信与超可靠低时延服务不断增长的需求，必须显著提升频谱效率与网络覆盖 [1]–[4]。这一目标正推动网络架构向**超大规模多输入多输出（XL-MIMO）**系统（天线阵列超过 1024 单元 [5]–[7]）与**超密集网络（UDN）**（密集部署接入点 [8]）演进。然而，这一演进给传统基于导频的信道估计带来前所未有的挑战，因为需获取的信道状态信息（CSI）规模变得极其庞大 [5]。在 XL-MIMO 场景中，导频传输与估计可能占用整个时隙的 90% 以上，严重削弱频谱效率目标并使实时自适应不可行 [9]。与此同时，为扩展覆盖并支持动态用户分布，6G 网络将纳入大量移动接入节点，如自主飞行器（AAV）与低轨卫星 [8], [10]–[12]。这些节点的移动性要求前瞻式轨迹规划以维持可靠连接与服务质量（QoS），而这又需要在节点到达之前掌握空间信道变化的先验知识 [13]。综合而言，这些趋势要求从依赖导频的机制转向**环境感知通信**——利用环境信息推断信道特征而无需依赖直接测量。在此背景下，**无线电地图（RM）**已成为关键使能技术：它提供无线信道特征（如路径损耗）的预计算空间表示，可指导 6G 复杂环境中的实时网络优化与轨迹控制 [14], [15]。

尽管无线电地图为环境感知通信带来诸多益处，其构建仍是技术难题 [15]。高保真 RM 生成传统上依赖数值求解 Maxwell 方程或 Helmholtz 波动方程，例如时域有限差分（FDTD）法 [20]；但 FDTD 计算复杂度极高，其实际应用仅限于跨越数个电磁波长的区域 [20]。即便采用电磁射线追踪（ERT）等近似技术，在街道尺度城市环境中生成 RM 往往每个实例也需数十分钟 [21]，使这些方法不适合 6G 动态场景中的实时或近实时推断。为此，基于神经网络（NN）的方法因能以较高速度与可接受精度推断 RM 而受到广泛关注 [17]。然而现有 NN 方法——包括卷积神经网络（CNN）[17], [22]、图神经网络（GNN）[23]，乃至最先进的生成式大模型方法 [24]——大多局限于构建固定高度（通常 1.5 m）处的二维路径损耗分布。该局限源于缺乏包含多样且密集采样三维无线电环境数据的公开数据集。根据统计学习理论，神经网络本质上受限于其训练集所呈现的数据分布，因而无法泛化到未被表示的垂直或方向维度 [25]。因此，现有模型在对体域射频知识有需求的应用（如精确波束成形、用户定位、实时三维覆盖规划）中效用有限。更关键的是，其无法生成三维无线电地图，严重限制了其在 AAV 导航等安全攸关任务中的适用性 [26], [27]。实践中 AAV 常在非授权工业科学医疗（ISM）频段上高度动态的空域运行，易受强而异构的干扰 [26]；因此若无法获取空间丰富的三维 RM 数据，轨迹规划将变为次优甚至危险。可见，亟需新一代 RM 数据集与模型，超越二维路径损耗预测，实现跨三维空间的鲁棒、多维推断，以支撑先进 6G 应用中的智能决策。

为应对上述局限，本文提出一个全面的大规模 **3D×3D RM 数据集**，其基于真实城市建筑高度与几何、采用射线追踪电磁仿真流程构建。该数据集空间分辨率为 1 立方米，包含超过一千万个带标注数据点，规模超出既有 RM 数据集 37 倍以上。与此前局限于固定高度二维路径损耗信息的数据集 [17], [18] 不同，所提数据集捕获丰富的多维信道特征，包括路径损耗、方位与俯仰两个维度的到达方向（DoA）以及到达时间（ToA）。这种对空间传播的细致表示构成推进三维感知无线智能的基础基准。此外，数据的体域特性揭示了不仅存在于平面相邻网格点之间、还沿垂直维度存在的复杂空间相关性，使学习模型能利用层间依赖进行更准确高效的 RM 构建。为充分利用这些性质，我们提出新颖的生成式框架 **RadioDiff-3D**，采用嵌入三维卷积架构的去噪扩散概率模型。与传统逐切片二维推断 RM 的神经网络不同，RadioDiff-3D 直接在三维空间合成跨不同高度的高保真 RM。此外，该模型设计为同时处理**辐射感知**与**辐射未知**两类场景：前者利用已知环境与发射机信息为协作基站构建三维 RM；后者利用稀疏采样观测与环境先验估计非协作发射机的干扰分布。这种双模式生成能力不仅把 RM 构建的适用性扩展到更真实复杂的场景，也为 AAV 轨迹优化与竞争频谱环境中的干扰规避导航等关键应用提供必要的态势感知。本文主要贡献总结如下。

1. 与此前主要关注固定高度二维路径损耗分布的 RM 数据集（如 RadioMapSeer）不同，UrbanRadio3D 引入 **3D×3D 信道表示**，在三维环境分布上刻画路径损耗、DoA 与 ToA 三项指标的空间分布。这种多模态、空间连续的结构可对仰角敏感的传播效应进行深度建模，支撑三维定位、高度感知波束成形与体域覆盖优化等先进任务。
2. UrbanRadio3D 引入大规模、空间分辨的数据集，具有 1 米立方分辨率，利用对多样建筑高度与布局的真实城市几何进行高保真射线追踪生成。该数据集以一致体素格式跨多模态与多接收高度组织，把结构化电磁仿真数据与三维卷积、扩散式 AI 模型连接起来，便于高效集成到基于学习的体域重建框架，并促进无线 AI 研究的可复现性。
3. 本文提出两种三维无线电地图（RM）构建基准模型：第一种是采用 UNet 架构与三维卷积算子的卷积基线，作为体域 CNN 方法的代表性基准；第二种称为 **RadioDiff-3D** 的生成式扩散模型，利用三维卷积在完整空间体上合成高保真无线电地图。通过在全三维上建模联合空间依赖，RadioDiff-3D 能重建稠密、多特征的三维信道表示，超越先前工作常见的固定高度预测局限。

## II. 相关工作与预备知识

### A. RM 构建方法

RM 构建已从早期测量驱动插值发展到最新的全生成式、环境感知合成。为清晰起见，我们把先前工作分为两条脉络：从稀疏路径损耗测量（SPM）重建场的**基于采样的推断**，以及利用环境先验与数据驱动模型绕过现场探测的**无采样推断**。对二者进行细致综述，是理解本文工作技术定位所必需的。

典型工作流始于校准扫描器遍历感兴趣区域采集 SPM，随后进行空间插值。早期蜂窝部署依赖反距离加权（IDW）与 $K$ 近邻（KNN）插值，其中未测量点的估计是其 $K$ 个最近观测的凸组合，权重随欧氏距离衰减 [29], [30]。这些方案计算简单，却把路径损耗视为各向同性场，忽略街道、建筑立面与植被带来的各向异性，一旦采样密度降到约每个路灯一个点以下（密集城区试验中），误差便相当可观 [31]。为编码局部曲率，研究者采用局部多项式回归（亦称局部多项式拟合），用加权最小二乘对邻域样本拟合一阶或二阶曲面 [32], [33]。这降低了平缓梯度上的偏差，但仍忽略跨邻域相关性。更严格的统计基础由 Kriging 提供：普通 Kriging 假设二阶平稳，从数据估计半变差函数，并在该协方差模型下导出最小化均方误差（MSE）的最佳线性无偏预测器 [34], [35]。Kriging 在其线性子空间内最优，但其矩阵求逆代价为 $O(N^3)$，当样本达数千时负担沉重。为兼顾稀疏性与长程相关性，矩阵与张量补全把区域离散为网格，并利用大规模路径损耗矩阵的经验低秩性 [36], [37]；当观测模式满足不相干条件时，核范数最小化可从不足 10% 的样本恢复整个街区。然而对不规则采样，可辨识性会失效；插值辅助补全用局部 Kriging 估计填补缺失像素，在保持全局低秩的同时维持可恢复性 [36]。再生核 Hilbert 空间中的核回归把 Kriging 与高斯过程回归联系起来，其双核设计可分离缓慢变化的路径损耗趋势与快速变化的局部阴影，并提供闭式解 [38]。时间动态引入额外复杂性：Kriged Kalman 滤波在状态空间框架下把时变测量与空间 Kriging 融合，得到可跟踪移动障碍与季节变化的递推预测器 [34]；该滤波器虽有效，却继承了 Kriging 在状态维数上的三次复杂度。尽管经数十年改进，基于采样的推断仍有两个结构性弱点：其一，对 SPM 的依赖使其不适用于安全攸关设施、灾区或空中走廊等路测不可行的场景；其二，在 NLOS 区域，插值误差随样本间距超线性增长，一旦采样密度低于地形特定阈值便迅速恶化——这一效应已在 "Interference Cartography Manager" 现场试验中得到验证 [31], [39]。

为规避这些局限，无采样方法以数字地表模型（DSM）、建筑轮廓、基站元数据与土地利用标签等先验信息为条件。最早的体现是确定性射线追踪：通过三维模型发射电磁射线计算路径损耗图；现代多次反射求解器虽可达高保真，但数据获取与计算在城市尺度上仍不可承受 [40], [41]。于是注意力转向从粗粒度环境栅格直接学习 RM 生成器的统计代理模型，其里程碑是 RadioUNet——把建筑掩膜的二值栅格输入 U-Net，并用逐像素 MSE 损失回归二维路径损耗场 [17]。RadioUNet 在未见过的欧洲城区显著优于 IDW 与 Kriging，但其感受野虽多尺度、终究仍是局部的。RadioNet 通过在 U-Net 瓶颈后插入 Transformer 注意力层扩展了 RadioUNet，使网络能学习长程绕射相关性——例如跨越庭院相隔平行街道的持续阴影——从而提升公里级地图上的精度 [42]。认识到城市拓扑天然具有图结构，GNN 已被提出用于 RM 预测：在 GAT-REM 与 GraphREM 中，建筑、街道与基站成为节点，边编码视距或一阶绕射关系，注意力加权消息传递在图上传播特征，从而对具有未见街区布局的新城市获得鲁棒泛化 [43], [44]。不过这些模型仍是判别式的：对给定环境输出单一确定性地图，无法表达动态或部分已知场景中传播的固有不确定性。

生成式范式试图弥合这一表达力缺口。RME-GAN 用对抗判别器增强卷积生成器，使合成 RM 在服从 MSE 重建项的同时接近真实地图的经验分布 [22]；但对抗监督虽锐化空间纹理，RME-GAN 仍需稀疏 SPM 作为条件锚点，无法真正无采样部署。与测量依赖的决定性决裂由 RadioDiff 系列实现：RadioDiff [24] 训练去噪扩散概率模型（DDPM）反转马尔可夫高斯扰动过程，仅以建筑栅格与基站坐标为条件，从而直接从环境数据合成 RM；RadioDiff-$k^2$ [45] 引入基于分数的“知识迁移”步骤，把合成射线追踪数据与有限真实测量耦合，弥合仿真到现实的差距；RadioDiff-Inv [46] 则把同一扩散内核用于逆问题，例如从部分 RM 推断缺失的基站位置。这些扩散模型在 DeepREM 与 RadioMapSeer 基准上均达到新的最先进归一化 MSE，且关键地，在向百万像素级不规则形状区域外推时保持稳定。环境模型辅助框架构成另一无采样分支：空间损耗场模型把阴影视为沿加权传播椭圆的增量损耗积分，并求解线性逆问题以从稀疏节点对观测恢复损耗场 [18], [24], [47]；相反，虚拟障碍物模型用电磁“障碍物类别”替代真实几何，每类由可穿透参数与可学习位置刻画，随后通过非线性最小二乘或 CNN 代理联合精化障碍物布放与路径损耗参数 [48]–[50]。这些模型对三维收发机对具有良好外推性，但其非凸目标与对障碍物类别启发式的依赖限制了可扩展性。

上述文献的一个统一观察是：多数已发表工作仍局限于单个固定高度平面，并只关注大尺度路径损耗。对波束成形、干扰协调与厘米级定位不可或缺的三维关键描述量（DoA、ToA、时延扩展与角度扩展）在现有 RM 预测器中几乎完全缺失 [39], [51]。在架构上，主流 CNN 与 Transformer 骨干采用二维卷积核或二维轴注意力，在数学上无法捕获高层与空中网络固有的体域传播图样。具有共配准几何、材料元数据与丰富信道标签的公开高分辨率三维数据集稀缺，进一步加剧了训练三维原生模型的困难。因此逐渐形成的共识是：深度生成学习是通往低成本、可扩展 RM 构建的最可行路径，前提是解决两个瓶颈：其一，神经算子必须重新设计以原生处理三维空间关系（如稀疏三维卷积、点云 Transformer 或体域扩散核）；其二，社区必须整理并发布跨多频段、极化状态与发射机高度的高精度三维信道数据集。本文提出的框架通过引入三维扩散基元并在新编纂的毫米波三维数据集上展示其有效性，同时应对这两个挑战，从而为真正的环境感知三维无线智能奠定基础。

### B. RM 的数据获取

公开的无线电地图与信道数据集是无线通信中大量基于学习的研究的关键基础。该领域早期发展主要利用合成射线追踪技术以规避大规模数据采集的高昂代价 [15]。代表性例子是 DeepMIMO，它提供可扩展的参数化数据集生成器，可在多样城市场景的百万级用户位置上导出 sub-6 GHz、28 GHz 与 60 GHz MIMO 信道矩阵 [52]。这些合成语料提供无可比拟的环境精度与规模，为环境几何与材料属性提供完美真值；然而它们本质上受其底层射线追踪引擎内嵌假设的约束，缺乏实测中由硬件引起的非理想性与动态效应。

合成 RM 的一种广泛采用方法依赖解析信道模型：直接计算闭式传播表达式得到大尺度路径损耗面。实践中多数研究采用标准化指南规定的对数正态阴影衰落公式——最典型的是 3GPP 城市微站（UMi）与城市宏站（UMa）模型，其确定性分量把平均路径损耗表示为收发机（TX–RX）间距的函数，而零均值对数正态项捕获阴影方差 [53]。在指定全部基站的地理坐标与配置参数（高度、辐射功率、天线方向图、载频）后，可在密集空间网格上评估解析模型得到路径损耗场并存储为 RM。近期基于学习的研究用这些解析生成的数据集预训练、微调或监督神经 RM 生成器 [54]–[56]。

解析生成的 RM 虽在计算上有吸引力，但移植到真实部署时保真度有限：其底层对数距离公式本质上忽略了位置特定的传播机制，如街道峡谷绕射、不规则屋顶散射、植被衰减与材料相关穿透损耗。这些省略在合成路径损耗与实测之间造成不容忽视的偏差（常超过 10 dB），从而削弱波束管理、厘米级定位与前瞻式干扰协调等下游任务所需的空间一致性。为缓解该缺陷，近期研究试图把环境知识（通过显式电磁仿真或数据驱动校正）注入 RM 合成流程；特别是基于确定性射线追踪的近似物理求解器获得关注 [57]：通过在详细几何模型上近似求解 Maxwell 方程，射线追踪产生更丰富的信道描述量分布，更契合实测观测，但计算代价显著更高。

为弥补这一真实性差距，近期引入了大规模测量驱动数据集。RadioGAT 提出结合对数距离路径损耗模型与图注意力网络（GAT）的混合框架，可从稀疏测量重建多频段 RM；其数据集覆盖十个城市子区域、五个载频的射线追踪结果，在有限监督下表现强劲 [18]，但其无线电地图局限于收发机处于同一高度的二维布局，忽略了随高度变化的信号传播、XL-MIMO 近场效应与垂直非平稳等关键三维现象，因而限制了其与无人机辅助通信等仰角敏感应用的相关性 [9]。融入更多几何真实性的努力可见于 RMDirectionalBerlin 数据集，它利用激光雷达导出的建筑高度剖面与定向屋顶天线更真实反映部署条件 [59]，含 7.4 万余张地图，支持无几何推理与基于航空影像的视觉学习；但它缺乏 CIR 级粒度（不保留 DoA、ToA 或多径丰富度），且局限于单城市与 3.5 GHz，无法分析地理或频谱泛化性。RadioMapSeer 数据集提供更广的城市多样性，用低/高保真射线追踪在欧洲六座城市仿真 5.6 万个 RM 样本 [17]，其成对仿真特别适合迁移学习与模型蒸馏研究；但仍存在关键局限：所有建筑按统一 25 米高度建模、忽略植被与动态散射体、仅支持单一频率且无 CSI 级标签，限制了其在三维感知或时延敏感建模中的使用。在规模上，CKMImageNet 提供层次化存储结构，把大规模链路测量与 64×64 像素热图可视化及相应环境图像切片结合，支持细粒度查询与多基站场景（如北京 42 个发射机与 50 万用户的仿真）[19]；它虽在连接视觉与物理域方面具有开创性，但许多场景缺乏显式 DoA/DoD 或 ToA 标注，且多数切片仅用单一基站布局仿真，限制了干扰拓扑的多样性。为支持大规模多域分析，SpectrumNet [16] 提供迄今最全面的基于图像的数据集之一，涵盖 11 类地形、5 个频段、3 个接收高度（1.5 m、30 m、200 m）与合成气候剖面的 30 余万张无线电地图，是首批支持高度感知 CKM 与非地面链路建模的数据集之一；但其空间粒度较粗、仅限少数离散高度，且只提供标量路径损耗，遗漏了对高移动性 6G 场景中波束成形、定位与信道重建至关重要的方向与时序信道特征。

### C. 生成式扩散模型

近期生成建模的进展中，扩散模型成为 GAN [60] 与变分自编码器（VAE）[61] 等传统框架的有前景替代，具有更好的训练稳定性与高质量样本生成 [62]–[66]。与依赖对抗目标、常遇训练不稳定的 GAN 不同，扩散模型采用基于似然的表述，通过去噪过程把样本从噪声逐步精化为数据 [67]。其中，去噪扩散概率模型（DDPM）在计算机视觉、自然语言处理与强化学习等多个领域取得显著成功 [68]。DDPM 把数据生成过程建模为两阶段马尔可夫链，包含前向扩散与反向去噪过程。前向过程向干净数据 $x_0$ 逐步加入高斯噪声，得到序列 $x_1,x_2,\ldots,x_T$，定义为

$$
q(x_1,\ldots,x_T\mid x_0)=\prod_{t=1}^{T}q(x_t\mid x_{t-1}),\tag{1}
$$

$$
q(x_t\mid x_{t-1})=\mathcal N\left(\sqrt{1-\beta_t}x_{t-1},\beta_t\mathbf I\right),\tag{2}
$$

其中 $\beta_t$ 为随时间调度的小噪声方差。利用累积乘积 $\bar\alpha_t=\prod_{s=1}^{t}(1-\beta_s)$，给定 $x_0$ 时 $x_t$ 的分布有闭式表达：

$$
q(x_t\mid x_0)=\mathcal N\left(\sqrt{\bar\alpha_t}x_0,(1-\bar\alpha_t)\mathbf I\right),\tag{3}
$$

$$
x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon,\qquad\epsilon\sim\mathcal N(0,\mathbf I).\tag{4}
$$

反向过程通过学习反向转移分布来重建原始数据：

$$
p_\theta(x_{t-1}\mid x_t)=\mathcal N\left(\mu_\theta(x_t,t),\beta_t\mathbf I\right),\tag{5}
$$

$$
\mu_\theta(x_t,t)=\frac{1}{\sqrt{\alpha_t}}\left(x_t-\frac{1-\alpha_t}{\sqrt{1-\bar\alpha_t}}\epsilon_\theta(x_t,t)\right)+\beta_t\mathbf I.\tag{6}
$$

尽管理论上正确的方差缩放因子为 $\beta_t$，[68] 已表明使用 $\beta_t$ 可简化实现且不降低性能。

DDPM 虽保真度高，但依赖大量去噪步数，显著影响推理时延。为此引入**去噪扩散隐式模型（DDIM）**作为确定性、非马尔可夫替代 [69]。DDIM 保持与 DDPM 训练目标的兼容性，但重新定义反向过程以支持更快的确定性采样：

$$
x_t=\sqrt{\bar\alpha_t}x_0+\sqrt{1-\bar\alpha_t}\epsilon,\qquad\epsilon\sim\mathcal N(0,\mathbf I),\tag{7}
$$

$$
\epsilon_t=\frac{x_t-\sqrt{\bar\alpha_t}x_0}{\sqrt{1-\bar\alpha_t}},\tag{8}
$$

$$
x_{t-1}=\sqrt{\bar\alpha_{t-1}}x_0+\sqrt{1-\bar\alpha_{t-1}}\epsilon_t.\tag{9}
$$

## III. UrbanRadio3D 的性质

### A. 三维无线电地图数据集构建

本节详述 UrbanRadio3D 数据集的构建。该数据集使用 Altair 软件套件中的 WinProp 模块，对真实城市环境中的三维射频传播进行仿真。它包含 701 个不同城市区域，每个区域建模为 $256\times256$ m²、每像素1米空间分辨率的面积。这些区域取自代表性全球城市，包括 Kara、柏林、格拉斯哥、卢布尔雅那、伦敦与特拉维夫，捕获多样的建筑与地理特征。为增强真实性，仿真考虑各城市不同的建筑高度（6.6 m 至 19.8 m）。对每个城市地图随机选取 200 个发射机位置，并在 1 m 至 20 m、以 1 米为步长的接收机高度上进行仿真。该设置共产生 $701\times200\times20=2.84$ 百万个仿真实例，形成能准确反映城市场景体域无线传播的大规模数据集。每个仿真结果存储为高分辨率 PNG 图像，在三个维度上保持 1 米空间精度。数据集包含多种信号模态，如路径损耗、DoA 与 ToA，以及支撑高级建模的辅助表示，包括建筑结构多边形掩膜、编码建筑高度的灰度高程图与发射机位置图。值得注意的是，数据集同时纳入 DPM 仿真与辅助信道指标，以确保物理可解释性与建模一致性。关键仿真参数汇总于表 III。每个发射机以 23 dBm/Hz 通过全向天线在 5.9 GHz 载频发射，代表未来 6G 系统的毫米波场景。接收机标称高度设为 1.5 m，并在 1—20 m 垂直范围内采集测量以支持完整三维建模。对路径损耗、DoA 与 ToA 分量施加阈值处理，以抑制物理上不合理的离群值并确保模型训练聚焦于有意义的信号交互。全部数据使用**主路径模型（DPM）**[70] 生成，在计算效率与物理精度之间取得平衡。为构建体域三维无线电地图，我们使用电磁仿真器 FEKO，它在固定接收高度的二维平面上进行电磁场渲染；由于每次仿真只返回特定高度的结果，我们在 20 个不同高度层（从地面到屋顶高度）分别进行仿真。该流程为每个城市场景有效产生 20 个水平切片，再堆叠形成无线信道特性的完整三维空间分布。每个二维切片内的空间分辨率设为 1 米，与 RadioMapSeer [17] 的设置一致，以确保可复现性并与现有基准公平比较。

材料属性仿真采用 WinProp 软件提供的默认材料参数。为简化建模过程，仿真中所有建筑立面被赋予相同的默认材料属性（汇总于表 IV）。该方法假定所有建筑表面的电磁行为一致，便于大规模仿真，同时保持合理的物理近似。

**图 1**：三个示例区域的二维视图（上）与三维视图（下）。
**图 2**：三维射线追踪视图。

### B. 数据集可视化

为直观展示数据集，我们给出若干组可视化，以说明数据的多样性与丰富性。这些可视化包括不同接收高度（1 米至 20 米）的路径损耗图，突出信号传播如何受高程变化与建筑遮挡影响。如图 5 所示，除路径损耗外，我们还可视化 ToA、DoA 方位角、DoA 俯仰角等辅助信道特性与射线追踪传播路径（图 2），提供对无线电传播环境更全面的视角。此外，如图 3 所示，数据集还提供结构与空间信息图，包括建筑分割图、建筑高度图与发射机位置图。这些图有助于更好地理解城市空间语境，对几何学习、波束成形与定位等任务至关重要。

值得注意的是，当观测高度超过周边建筑高度时，这些结构可能在无线电地图中“消失”。这是因为接收机获得了到发射机的清晰视距，消除了原本会造成信号衰减或反射的遮挡，从而显著改变空间信号图样。

**表 III　三维无线电地图的补充参数**（按原表逐格转录）

| 参数 | 取值 |
| --- | --- |
| 地图尺寸 | $256\times256$ m² |
| 像素长度 | 1 m |
| 接收机高度 | 1.5 m |
| 观测高度 | 1.0—20.0 m |
| 建筑高度范围 | 6.6—19.8 m |
| 发射功率 | 23 dBm/Hz |
| 中心载频 | 5.9 GHz |
| 路径损耗最小阈值 | $-169.0$ dB |
| 路径损耗最大阈值 | $-92.0$ dB |
| ToA 最小阈值 | 0.0 ns |
| ToA 最大阈值 | 1180.0 ns |
| DoA 方位角最小阈值 | 0.0 Rad |
| DoA 方位角最大阈值 | 6.3 Rad |
| DoA 俯仰角最小阈值 | 0.5 Rad |
| DoA 俯仰角最大阈值 | 2.25 Rad |

**表 IV　仿真所用默认材料参数**（按原表逐格转录）

| 参数 | 取值 |
| --- | --- |
| 表面厚度 | 10.0 cm |
| 表面粗糙度 | 0.0000 µm |
| 工作频率 | 2000 MHz |
| 材料选择规则 | 采用最近频率 |
| 传输损耗 | 20.0 dB |
| 反射损耗 | 9.0 dB |
| 绕射入射（最小） | 8.0 dB |
| 绕射入射（最大） | 15.0 dB |
| 绕射损耗 | 5.0 dB |
| 相对介电常数 $\varepsilon_r$ | 4.0 |
| 相对磁导率 $\mu_r$ | 1.0 |
| 电导率 $\sigma$ | 0.01 S/m |

### C. 数据集命名约定

本研究使用的数据集遵循标准化文件夹结构与文件命名约定，以确保一致性并便于访问。在根目录下，数据集按五个模态目录组织：`pathLoss`、`Doa_Azi`、`Doa_Ele`、`ToA` 与 `propagation_ray`。每个模态文件夹包含标记为 `h1` 至 `h20` 的子目录，对应 1 m 至 20 m 的接收机高度层。在每个高度子文件夹内，数据文件命名如下：

$$
\mathcal Y=\{\text{BID}\_X\text{X\_Y}\text{Y.png},\ \text{npy}\}.\tag{10}
$$

其中 BID 表示建筑标识符，X 与 Y 表示发射机位置的水平坐标。

**图 4**：文件 `103_62X_125Y.png` 的可视化。按命名约定，第一个字段（`103`）为建筑标识符（BID）；第二个字段（`62X`）为发射机 X 坐标；第三个字段（`125Y`）为全局地图中发射机的 Y 坐标。该图像对应 1 m 高度层，清晰展示了发射机周边及附近的路径损耗分布。

### D. 数据归一化与热图生成

为确保不同空间位置间的一致性，并支持有效可视化与模型训练，我们对所有信道参数（包括路径损耗 PL）、到达时间（ToA，或 Delay）、到达方向方位角（DoA_Azi）与到达方向俯仰角（DoA_Ele）采用全局归一化策略。每个参数使用表 III 规定的固定全局最小/最大阈值单独归一化，归一化公式定义为

$$
x_{\mathrm{norm}}=\begin{cases}0,&x<x_{\min},\\[2pt]\dfrac{x-x_{\min}}{x_{\max}-x_{\min}},&x_{\min}\le x\le x_{\max},\\[2pt]1,&x>x_{\max},\end{cases}\tag{11}
$$

其中 $x$ 为原始参数值，$x_{\min}$ 与 $x_{\max}$ 为预定义的全局最小/最大阈值，$x_{\mathrm{norm}}\in[0,1]$ 为归一化结果。若用于可视化或模型输入，可按需把归一化值进一步映射到 $[0,255]$ 范围。

## IV. 基于扩散的三维 RM 生成

### A. 三维 RM 构建的问题表述

为支撑 6G 网络中的先进上下文感知应用，本工作聚焦构建三维多模态 RM，它不仅捕获空间信号传播，还包含角度与 ToA 等丰富信道特征。与局限于固定高度平面路径损耗分布的传统二维 RM 表示不同，所提框架把无线电制图任务推广到体域：每个空间点由三个轴向上的一组信道参数描述。具体地，RM 表示为四维张量 $R\in\mathbb R^{H\times W\times D\times C}$，其中 $(H,W,D)$ 为空间维数、$C$ 为信道模态数。这些模态包括路径损耗、DoA（含方位与俯仰分量）与 ToA。这种更丰富的表示对实现三维定位、高度敏感波束成形与体域干扰感知规划等关键 6G 功能至关重要。环境定义为三维占据栅格 $E\in\{0,1\}^{H\times W\times D}$，其每个体素表示是否存在不同形状与高度的物理障碍物（如建筑）。基于该环境语境，三维 RM 构建可在如下两种实际设置下表述。

**1）已知基站与环境信息时的 RM 构建**：该设置下环境几何 $E$ 与发射基站配置（位置、高度与辐射特性）均已知，任务是从这些输入直接预测完整 RM 张量 $R$。这对应条件生成问题：RM 基于环境先验与已知源参数合成，反映由三维几何塑造的合理信道分布。

**2）稀疏采样与环境信息时的 RM 构建**：该场景下环境布局 $E$ 完全已知，但发射机位置与特性未知或不可访问；取而代之的是一组稀疏信号观测 $S=\{(x_i,y_i,z_i,r_i)\}_{i=1}^{N}$，其中 $r_i$ 表示特定三维位置处路径损耗、DoA 或 ToA 等信道参数的部分测量。目标是从这些稀疏测量与环境先验重建完整 RM 张量 $R$。该设置对未知或非协作发射机场景中的频谱感知、干扰检测与覆盖估计尤为重要。

通过把 RM 建模为带角度与时序描述量的结构化三维张量，所提框架相比传统标量场重建实现更全面的环境感知。两种表述共同支持发射机已知与发射机无关两类应用，为复杂 6G 城市环境中的统一体域无线电制图奠定基础。

### B. 带三维算子的扩散模型

为在复杂三维环境中实现高保真、多模态 RM 构建，我们提出 RadioDiff-3D——一种为体域无线信号生成设计的条件去噪扩散概率模型（DDPM）。与在固定高度平面上估计路径损耗的先前工作不同，RadioDiff-3D 构建三维张量值 RM $R\in\mathbb R^{H\times W\times D\times C}$，其中 $(H,W,D)$ 为空间维数（水平、垂直与高度），$C$ 为信号模态数（路径损耗、方位/俯仰 DoA 与 ToA）。这种多模态表示对支撑三维波束成形、干扰感知无人机导航与实时体域覆盖评估等先进 6G 用例至关重要。

**1）潜变量扩散建模**：设输入 RM 张量 $R$ 经变分编码器 $\mathcal E_\phi$ 映射到潜空间，得到压缩表示 $z_0=\mathcal E_\phi(R)$。扩散过程通过前向随机过程 $\{q(z_t|z_0)\}_{t=1}^{T}$ 用高斯噪声逐步扰动 $z_0$，其中每个时间步 $t$ 的转移定义为

$$
q(z_t|z_0)=\mathcal N\left(z_t;\sqrt{\bar\alpha_t}z_0,(1-\bar\alpha_t)\mathbf I\right),\tag{12}
$$

其中 $\bar\alpha_t=\prod_{s=1}^{t}(1-\beta_s)$ 为累积噪声缩放，$\{\beta_t\}_{t=1}^{T}$ 为方差调度。去噪反向过程通过训练神经网络 $\epsilon_\theta(z_t,t,C)$ 预测每步所加噪声来学习，目标是最小化期望去噪损失：

$$
\mathcal L_{\mathrm{diff}}=\mathbb E_{z_0,\epsilon,t}\left[\left\|\epsilon_\theta(z_t,t,C)-\epsilon\right\|^2\right],\tag{13}
$$

其中 $z_t=\sqrt{\bar\alpha_t}z_0+\sqrt{1-\bar\alpha_t}\epsilon$，$C$ 表示条件信息。

**2）两种应用设置下的条件生成**：RadioDiff-3D 支持两类不同应用场景下的条件生成。第一类场景中，环境 $E\in\{0,1\}^{H\times W\times D}$（建筑三维占据栅格）与基站配置 $r=(x_{\mathrm{BS}},y_{\mathrm{BS}},z_{\mathrm{BS}},P_t)$ 已知，条件向量 $C=f_{\mathrm{cond}}(E,r)$ 通过交叉注意力或类 FiLM 调制传入去噪 U-Net 的每个残差块。这使模型学习分布 $p_\theta(z_0|E,r)$，生成同时符合信号传播规律与城市拓扑的 RM 张量。第二类场景中基站未知或非协作，但可获得稀疏信号样本 $S=\{(x_i,r_i)\}_{i=1}^{N}$（$x_i=(x,y,z)$，$r_i\in\mathbb R^{C}$ 含路径损耗、DoA 与 ToA），模型以 $(E,S)$ 为条件生成 $R$。为强制生成区域与观测区域一致，我们采用**重建引导的条件采样**：推理时预测的 RM 被修正为

$$
\tilde z_t=z_t-\lambda_t\nabla_{z_t}\left\|R_\theta(z_t)-S_{\mathrm{interp}}\right\|^2,\tag{14}
$$

其中 $S_{\mathrm{interp}}$ 为插值到张量分辨率的稀疏采样 RM，$\lambda_t$ 为随时间变化的引导系数。

**3）带条件的三维 U-Net**：RadioDiff-3D 的骨干是由残差块与注意力层组成的三维卷积 U-Net。输入为含噪三维潜张量 $z_t\in\mathbb R^{H\times W\times D\times C}$，输出为预测噪声 $\epsilon_\theta$ 或去噪潜变量 $\hat z_0$。每个残差块通过交叉注意力整合来自 $C$ 的条件嵌入：

$$
\operatorname{Attn}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V,\tag{15}
$$

$$
Q=W_qF,\tag{16}
$$

$$
K,V=W_kC,\ W_vC,\tag{17}
$$

其中 $F$ 为当前特征图，$C$ 经广播或投影以匹配空间分辨率。跳跃连接桥接编码器与解码器层，后期阶段施加频谱精化模块以捕获高频细节。

**4）自回归逐高度生成**：为在不产生高内存或计算代价的前提下高效构建大型三维 RM 张量，RadioDiff-3D 支持自回归垂直生成。具体地，在生成到高度 $z=d-1$ 的切片后，模型通过下式把下一层切片 $R_{:,:,d,:}$ 条件化于前一层 $R_{:,:,d-1,:}$：

$$
R_{:,:,d,:}\sim p_\theta\left(R_{:,:,d,:}\mid R_{:,:,d-1,:},C\right).\tag{18}
$$

该方法确保生成体在垂直方向的连续性，并支持跨不同建筑高度的可扩展推理。

**图 5**：不同观测高度（米）下信道特性的可视化。上排：3 m、6 m、9 m、12 m 与 15 m 处的路径损耗图。第二排：相同高度处的 ToA 扩展图。第三排：DoA 俯仰角分布。第四排：相同高度处的 DoA 方位角分布。
**图 6**：坐标 296_X46_Y114、接收机高度 3 m 处的测量结果，展示同一体素网格上路径损耗、ToA 扩展、DoA 俯仰角与 DoA 方位角的空间图，并附相应色条以定量指示物理值与建筑区域默认零值。
**图 7**：三维条件扩散模型框架总览（训练时以完整三维无线电地图为输入、学习用三维去噪 U-Net 预测所加高斯噪声；去噪以稀疏采样点、基站位置、建筑位置与建筑高度图为条件；推理时从纯噪声逐步生成全分辨率三维无线电地图）。

## V. 实验过程

本实验基于我们自研的三维扩散神经网络模型开展。为确保结果可复现与可比较，我们采用一系列标准化实验设置，并严格控制数据预处理与模型训练的各个方面。

### A. 初步验证实验

在开展全规模实验之前，我们先进行初步验证实验以验证所提方法的可行性。该初步研究中，从原始训练集随机选取 10% 用于训练，并从原始测试集抽取 100 个样本用于评估。训练配置包括批大小 2、学习率 $1\times10^{-4}$、每次输入 4 帧；训练全程启用自动混合精度（AMP）以在不牺牲性能的前提下提升计算效率，其他设置与全量实验保持一致以确保可比性。重要的是，整个初步实验在**无采样**设置下进行，即生成过程不施加任何采样技术。

**表 V**（见下文表格）给出完整采样步数（1000 步）下的性能：RMSE 0.0653、NMSE 0.0534、SSIM 0.8309、PSNR 24.00。此外我们系统观察了 RMSE、NMSE、SSIM 与 PSNR 等评估指标的变化，从而在开展大规模实验前全面评估实验设置的可靠性与有效性。为更直观理解该初步阶段的模型性能，我们在图 8 中可视化展示了生成帧与对比帧。

### B. 数据集与输入准备

为取得最佳性能，我们从 UrbanRadio3D 数据集中选取特定数据，聚焦 1 m 至 4 m 高度的场景；从该子集提取路径损耗数据作为模型输出，组织为四维张量 $R\in\mathbb R^{H\times W\times4\times1}$。

在无采样的基线设置中，我们使用三张环境特征图作为模型输入：建筑分割图、建筑高度图与发射机位置图。这些图沿通道维拼接形成四维输入张量 $R\in\mathbb R^{H\times W\times4\times3}$，作为三维扩散模型的条件输入。在采用采样策略的实验中，我们进一步纳入采样图以提供更详细的空间信息；此时输入张量扩展为 $R\in\mathbb R^{H\times W\times4\times4}$，第四维包含原有三张特征图与采样图。这一增强配置使模型能更好捕获稀疏信号分布，从而提升无线电地图生成的质量与效率。

原始数据集 $D_{\mathrm{all}}$ 由 $N$ 个样本构成，每个样本对应由不同坐标与波束成形配置唯一刻画的空间采样实例。数据集划分为两个不相交子集，训练集 $D_{\mathrm{train}}$ 与测试集 $D_{\mathrm{test}}$，满足

$$
D_{\mathrm{all}}=D_{\mathrm{train}}\cup D_{\mathrm{test}},\qquad D_{\mathrm{train}}\cap D_{\mathrm{test}}=\varnothing,\tag{19}
$$

$$
|D_{\mathrm{train}}|=\lfloor0.9\times N\rfloor,\qquad |D_{\mathrm{test}}|=N-|D_{\mathrm{train}}|.\tag{20}
$$

划分在文件级随机进行：打乱样本索引，把前 90% 分配给训练集、其余 10% 分配给测试集。由于每个样本的空间坐标与波束成形设置唯一，$D_{\mathrm{train}}$ 与 $D_{\mathrm{test}}$ 的交集为空，确保两子集间不存在空间或语义重叠。这种严格分离保证统计独立性，消除训练到测试阶段的信息泄漏可能。

### C. 采样策略

为研究采样策略对 RM 构建性能的影响，我们开展带采样信息的 RM 构建实验。这些策略旨在通过选取代表性像素对输入张量进行稀疏化。模型训练期间，我们同时采用均匀与随机采样策略从构建的三维无线电地图中稀疏选取数据点，采样率取 10%，即对每切片 $256\times256$ 像素的三维张量，每个高度层约使用 6,553 个体素用于训练。该采样密度在计算可处理性与模型泛化能力之间取得平衡。

**1）均匀采样**：均匀采样从每帧中均匀选取固定数量像素形成稀疏张量。给定张量 $R\in\mathbb R^{H\times W\times D\times C}$，其中 $H$ 与 $W$ 为每帧高宽、$D$ 为帧数、$C$ 为通道数。设 $I\subseteq\{1,\ldots,H\times W\}$ 为每帧均匀采样像素的索引集，均匀采样操作可数学表示为

$$
S_{\mathrm{uniform}}(h,w,d,c)=\begin{cases}R(h,w,d,c),&(h,w)\in I_{\mathrm{uniform}},\\ 0,&\text{否则},\end{cases}\tag{21}
$$

其中 $S_{\mathrm{uniform}}$ 为所得稀疏张量，采样像素保持原值，未采样像素置零。

**2）随机采样**：随机采样从每帧随机选取像素子集生成稀疏张量，可表示为

$$
S_{\mathrm{random}}(h,w,d,c)=\begin{cases}R(h,w,d,c),&(h,w)\in I_{\mathrm{random}},\\ 0,&\text{否则},\end{cases}\tag{22}
$$

其中 $I_{\mathrm{random}}$ 表示随机选取的像素索引。

### D. 实验参数配置

训练过程配置若干关键超参数以优化模型性能：批大小 2、学习率 $5\times10^{-5}$、指数移动平均（EMA）衰减率 0.995；为提升计算效率启用 AMP，且每 10 次迭代更新一次 EMA；采用在回归任务中以有效性著称的 $L_1$ 损失函数；模型在 NVIDIA 4090 设备上训练。这些超参数经仔细选取，以在训练速度与稳定性之间取得平衡，并通过上述设置优化模型的收敛性与泛化能力。

### E. 性能指标

为全面评估生成 RM 的重建质量，我们开展定性与定量分析。图 9 给出不同高度下预测与真实 RM 的视觉比较，显示空间结构与信号分布上的明显差异。这些定性观察由若干广泛采用的图像质量指标定量支撑，包括均方根误差（RMSE）、归一化均方误差（NMSE）、结构相似性指标（SSIM）与峰值信噪比（PSNR），汇总于表 VI。

**1）MSE**：MSE 通过平均原图与最终图像像素强度差的平方计算：

$$
\mathrm{MSE}=\frac{1}{MN}\sum_{m=1}^{M}\sum_{n=1}^{N}\left(I_b(m,n)-I(m,n)\right)^2,\tag{23}
$$

其中 $e(m,n)$ 为真值与预测图像的误差差，$M$ 与 $N$ 为图像高宽。NMSE 是 MSE 的缩放版本，用于评估预测精度；构建 RM 时 RMSE 即 MSE 的平方根：

$$
\mathrm{NMSE}=\frac{\sum_{m=1}^{M}\sum_{n=1}^{N}\left(I_b(m,n)-I(m,n)\right)^2}{\sum_{m=1}^{M}\sum_{n=1}^{N}I^2(m,n)},\tag{24}
$$

$$
\mathrm{RMSE}=\sqrt{\mathrm{MSE}}.\tag{25}
$$

**2）SSIM**：SSIM 是受人类视觉系统启发的质量评估指标。由于 SSIM 主要衡量纹理差异，而 RM（重建地图）含大量高频细节，故 SSIM 适合评估生成结果的质量。此外我们认为应更多关注信号辐射的亮度、信号辐射与周边区域的对比度，以及 RM 重建中地理地图的准确性——这与 SSIM 的三个关键分量（亮度、对比度与结构信息）一致，计算如下：

$$
l(x,y)=\frac{2\mu_X(x,y)\mu_Y(x,y)+C_1}{\mu_X^2(x,y)+\mu_Y^2(x,y)+C_1},\tag{26}
$$

$$
c(x,y)=\frac{2\sigma_X(x,y)\sigma_Y(x,y)+C_2}{\sigma_X^2(x,y)+\sigma_Y^2(x,y)+C_2},\tag{27}
$$

$$
s(x,y)=\frac{\sigma_{XY}(x,y)+C_3}{\sigma_X(x,y)\sigma_Y(x,y)+C_3},\tag{28}
$$

其中 $x$ 与 $y$ 对应两幅不同输入图像，$\mu_x$、$\sigma_x$ 与 $\sigma_{xy}$ 分别为 $x$ 的均值、方差以及 $x$ 与 $y$ 之间的协方差；$C_1$、$C_2$、$C_3$ 为常数，定义为 $C_1=(K_1L)^2$、$C_2=(K_2L)^2$、$C_3=C_2/2$，$L$ 为数据动态范围。基于这些参数，结构相似性可计算为

$$
\mathrm{SSIM}(x,y)=\frac{(2\mu_x\mu_y+C_1)(\sigma_{xy}+C_2)}{(\mu_x^2+\mu_y^2+C_1)(\sigma_x^2+\sigma_y^2+C_2)}.\tag{29}
$$

**3）PSNR**：PSNR 定义为信号最大可能功率与干扰其表示精度的噪声功率之比，通常以分贝（dB）表示，对重建的感知质量给出近似度量。图像评估中 PSNR 越高一般表示质量越好。对 RM 而言准确边缘信号至关重要，故 PSNR 不仅用于评估整体图像质量，也用于评估生成 RM 中边缘细节的质量：

$$
\mathrm{PSNR}=10\log_{10}\left(\frac{\mathrm{MAX}_I^2}{\mathrm{MSE}}\right),\tag{30}
$$

其中 $\mathrm{MAX}_I$ 为图像最大可能像素值（此处为 1），$\mathrm{MSE}$ 为（23）中的均方误差。

### F. 推理时间

为评估模型推理阶段的计算效率，我们测量不同 DDIM 采样步数下生成完整 RM 所需时间。如表 VII 所示，推理时间随采样步数近似线性增长：使用 20 步时推理时间仅 2.43 秒，增至 200 步时显著延长至 24.35 秒。这凸显了重建质量与计算代价之间的明确折中，对实时或资源受限部署场景至关重要。

### G. 3D-UNet 架构概述

3D-UNet [71] 是传统 UNet 架构基线模型的扩展，其在无线电地图构建中的有效性已由 RadioUNet [17]、RME-GAN [22] 与 RadioDiff [24] 等先前工作（均采用基于 CNN 的架构）证明。三维卷积算子的使用进一步使模型能高效捕获体域无线环境中的空间相关性。标准二维 UNet 广泛用于图像分割任务，而 3D-UNet 通过用三维卷积与池化操作替代二维对应操作，把能力扩展到三维数据。该设计使模型能捕获跨深度、高度与宽度的空间语境，特别适合涉及体域或时序序列的任务（如医学成像或时空建模）。

该架构保留原 UNet 的编码器—解码器结构：编码器逐步降低空间分辨率以捕获高层特征，解码器对称重建输出并通过跳跃连接整合低层空间信息。这种组合使数据中复杂空间关系的精确定位与准确表示成为可能。3D-UNet 的关键优势包括：

- 通过同时考虑三维邻域增强空间特征学习；
- 有效建模体域相关性与上下文；
- 在需要稠密预测的任务上表现强劲。

### H. 3D-UNet 在本实验中的应用

实验中我们采用 3D-UNet 模型学习从环境特征到无线传播特性的映射。网络输入由三张空间特征图组成：建筑分割图、建筑高度图与发射机位置图；它们沿通道维堆叠形成四维张量 $R\in\mathbb R^{H\times W\times4\times3}$，其中 $H$ 与 $W$ 为空间分辨率，深度维（4）对应离散高度层（1 m、2 m、3 m、4 m），通道维（3）表示输入特征。模型训练以预测三种无线信道特性：ToA 图、DoA 方位角（DoA_Azi）与 DoA 俯仰角（DoA_Ele）。每个目标表示为形状为 $R\in\mathbb H\times W\times4\times1$ 的独立四维张量，与输入共享相同的空间与高度分辨率。

### I. 3D-UNet 性能指标

我们用四个标准指标评估基于 3D-UNet 的模型性能：RMSE、NMSE、SSIM 与 PSNR。这些指标捕获预测质量的不同方面，包括精度、结构保真度与感知质量。评估在与训练集不相交的 1000 个测试样本上进行；ToA、DoA_Azi 与 DoA_Ele 的预测结果汇总于表 VIII，视觉比较见图 10，与表 VIII 的数值结论一致。

**图 8**：位置 (562, 39, 117) 在高度 H=1 至 H=4 处预测帧与真实帧的比较（上排为预测帧，下排为对应真实帧）。
**图 9**：位置 (535, 93, 232) 在高度 H=1 至 H=4 处预测帧与真实帧的比较（上排预测、下排真实）。
**图 10**：1 m（H1）与 3 m（H3）高度处 Delay、DoA_Ele 与 DoA_Azi 的 3D-UNet 预测与真值视觉比较（每行并排展示预测与对应真值）。

## VI. 结论

本文提出 UrbanRadio3D——一个在真实城市环境中捕获空间、角度与时间传播特征的高分辨率 **3D×3D 无线电地图数据集**。为探索基于学习的体域 RM 构建的可行性，我们建立了基准模型，包括条件扩散模型 RadioDiff-3D 与传统三维卷积神经网络 3D-UNet，并在发射机已知与发射机无关两类设置下跨路径损耗、DoA 与 ToA 模态进行评估。这些结果证明了数据驱动三维 RM 生成的可行性，并为未来研究提供了强基线。所提数据集与框架为推进 6G 网络中的环境感知无线通信与智能决策提供了基础工具集。未来工作将聚焦于把数据集扩展到多频段场景，并把物理先验融入生成建模；此外，整合体域 Transformer 架构在增强长程空间建模能力方面具有强劲潜力，尤其适用于动态或大规模城市环境中存在非局部依赖的情形。

## 表格

**表 I　不同 RM 数据集的比较**（按原表逐格转录，红色/加粗为所提数据集）

| 属性 | UrbanRadio3D（本文） | SpectrumNet [16] | RadioMapSeer [17] | RadioGAT [18] | CKMImageNet [19] |
| --- | --- | --- | --- | --- | --- |
| 数据集规模 | 11.2M | 300k | 56k | 21K | 72k |
| 高度层数 | 20 | 3 | 1 | 1 | 1 |
| 地图数量 | 701 | 764 | 701 | 10 | 42 |
| 基站位置数 | 200 | 4 | 80 | 3 | 1~42 |
| 地图尺寸 | 256×256 | 128×128 | 256×256 | 200×200 | 128×128 |
| 水平分辨率 | 1 m | 10 m | 1 m | 5 m | 2 m |
| 高度分辨率 | 1 m | N/A | N/A | N/A | N/A |
| 真实建筑形状 | ✔ | ✔ | ✔ | ✔ | ✔ |
| 真实建筑高度 | ✔ | ✔ | ✗ | ✗ | ✔ |
| 路径损耗 | ✔ | ✔ | ✔ | ✔ | ✔ |
| DoA_Azi | ✔ | ✗ | ✗ | ✗ | 少量 |
| DoA_Ele | ✔ | ✗ | ✗ | ✗ | 少量 |

**表 II　不同 RM 构建方法的比较**（按原表逐格转录）

| 属性 | RadioDiff-3D（本文） | RadioDiff [24] | RadioUNet [17] | RME-GAN [22] | LocUNet [28] |
| --- | --- | --- | --- | --- | --- |
| 路径损耗预测 | ✔ | ✔ | ✔ | ✔ | ✔ |
| ToA 预测 | ✔ | ✗ | ✗ | ✗ | ✔ |
| DoA_Ele 预测 | ✔ | ✗ | ✗ | ✗ | ✗ |
| DoA_Azi 预测 | ✔ | ✗ | ✗ | ✗ | ✗ |
| 采样信息 | 可选 | 不可 | 可选 | 必需 | 不可 |
| 环境维数 | 3D | 2D | 2D | 2D | 2D |
| 生成式 AI | ✔ | ✔ | ✗ | ✗ | ✗ |

**表 V　完整采样步数下的性能评估**（按原表逐格转录）

| 方法 | RMSE | NMSE | SSIM | PSNR |
| --- | --- | --- | --- | --- |
| 无采样（1000 步） | 0.0653 | 0.0534 | 0.8309 | 24.00 |

**表 VI　无额外采样策略的 DDIM 采样（200 步）评估指标**（按原表逐格转录）

| 采样方法 | RMSE | NMSE | SSIM | PSNR |
| --- | --- | --- | --- | --- |
| 无采样 | 0.1325 | 0.3472 | 0.6453 | 19.57 |
| 采样（采样率 10%） | 0.0481 | 0.0550 | 0.8187 | 29.23 |

**表 VII　不同步数下 DDIM 采样的推理时间**（按原表逐格转录）

| 方法 | 步数 | 推理时间（s） |
| --- | --- | --- |
| DDIM 采样 | 20 | 2.4300 |
| DDIM 采样 | 30 | 3.6574 |
| DDIM 采样 | 50 | 6.1171 |
| DDIM 采样 | 100 | 12.5732 |
| DDIM 采样 | 200 | 24.3526 |

**表 VIII　各输出的评估指标**（按原表逐格转录）

| 方法 | 输出 | RMSE | NMSE | SSIM | PSNR |
| --- | --- | --- | --- | --- | --- |
| 无采样 | ToA | 0.0287 | 0.0046 | 0.9740 | 31.25 |
| 无采样 | DoA_Azi | 0.0921 | 0.0496 | 0.8603 | 21.85 |
| 无采样 | DoA_Ele | 0.0744 | 0.0227 | 0.9156 | 24.27 |
| 随机采样（采样率 10%） | ToA | 0.0147 | 0.0012 | 0.9881 | 36.98 |
| 随机采样（采样率 10%） | DoA_Azi | 0.0362 | 0.0070 | 0.9582 | 29.55 |
| 随机采样（采样率 10%） | DoA_Ele | 0.0317 | 0.0039 | 0.9669 | 31.45 |
| 均匀采样（采样率 10%） | ToA | 0.0140 | 0.0010 | 0.9849 | 37.39 |
| 均匀采样（采样率 10%） | DoA_Azi | 0.0299 | 0.0047 | 0.9677 | 31.18 |
| 均匀采样（采样率 10%） | DoA_Ele | 0.0227 | 0.0021 | 0.9783 | 34.29 |

**表注**：表 III（三维无线电地图补充参数）与表 IV（仿真默认材料参数）已在本页第 III 节逐格转录；表 I、II、V、VI、VII、VIII 在本节逐格转录。表 I 已用 PyMuPDF 渲染原 PDF 第 2 页核对；表 VII 的推理时间随步数近似线性增长，与正文描述一致。

## 图注与表注

**图 1**：三个示例区域的二维视图（上排）与三维视图（下排）。
**图 2**：三维射线追踪视图。
**图 3**：数据集中结构与空间信息图的示例（建筑分割图、建筑高度图与发射机位置图）。
**图 4**：文件 `103_62X_125Y.png` 的可视化（BID=103、发射机 X 坐标=62、Y 坐标=125，对应 1 m 高度层）。
**图 5**：不同观测高度（米）下信道特性可视化（上排路径损耗、第二排 ToA 扩展、第三排 DoA 俯仰角、第四排 DoA 方位角）。
**图 6**：坐标 296_X46_Y114、接收高度 3 m 处的多参数测量结果（路径损耗、ToA 扩展、DoA 俯仰角、DoA 方位角，同体素网格对齐并附色条）。
**图 7**：三维条件扩散模型框架总览（训练与推理流程、条件输入）。
**图 8**：位置 (562, 39, 117) 在高度 H=1—H=4 处预测帧与真实帧比较。
**图 9**：位置 (535, 93, 232) 在高度 H=1—H=4 处预测帧与真实帧比较。
**图 10**：1 m 与 3 m 高度处 Delay、DoA_Ele、DoA_Azi 的 3D-UNet 预测与真值比较。

**表注**：表 I（数据集比较）、表 II（构建方法比较）、表 III（补充参数）、表 IV（材料参数）、表 V（完整采样性能）、表 VI（DDIM 200 步指标）、表 VII（推理时间）、表 VIII（各输出指标）均已按原表逐格转录于本页第 III 节与「表格」一节。

## 参考文献

> 以下按原文编号 [1]—[71] 转录英文原书目，条目文字不翻译；PDF 抽取文本中被截断的条目（部分卷/页信息缺失）以"（原文截断）"标注，书目内容未改动。

[1] N. Cheng, F. Chen, W. Chen, Z. Cheng, Q. Yang, C. Li, and X. Shen, “6G omni-scenario on-demand services provisioning: vision, technology and prospect (in Chinese),” Sci Sin Inform, vol. 54, pp. 1025–1054, 2024.

[2] X. Shen, J. Gao, M. Li, C. Zhou, S. Hu, M. He, and W. Zhuang, “Toward immersive communications in 6G,” Front. Comput. Sci, vol. 4, 2022.（原文截断）

[3] S. B. Prathiba, G. Raja, S. Anbalagan, K. Dev, S. Gurumoorthy, and A. P. Sankaran, “Federated learning empowered computation offloading and resource management in 6G-V2X,” IEEE Trans. Network Sci., vol. 9, no. 5, pp. 3234–3243, 2022.

[4] R. W. Liu, M. Liang, J. Nie, W. Y. B. Lim, Y. Zhang, and M. Guizani, “Deep learning-powered vessel trajectory prediction for improving smart traffic services in maritime internet of things,” IEEE Trans. Network Sci., vol. 9, no. 5, pp. 3080–3094, 2022.

[5] Y. Han, S. Jin, C.-K. Wen, and X. Ma, “Channel estimation for extremely large-scale massive MIMO systems,” IEEE Wireless Commun. Lett., vol. 9, no. 5, pp. 633–637, 2020.

[6] Y. Mu, N. Garg, and T. Ratnarajah, “Federated learning in massive MIMO 6G networks: Convergence analysis and communication-efficient design,” IEEE Trans. Network Sci., vol. 9, no. 6, pp. 4220–4234, 2022.

[7] C. Luo, J. Ji, Q. Wang, X. Chen, and P. Li, “Channel state information prediction for 5G wireless communications: A deep learning approach,” IEEE Trans. Network Sci., vol. 7, no. 1, pp. 227–236, 2018.

[8] X. Liu, H. Zhang, M. Sheng, W. Li, S. Al-Rubaye, and K. Long, “Ultra dense satellite-enabled 6G networks: Resource optimization and interference management,” China Communications, 2023.

[9] Z. Wang, J. Zhang, H. Du, D. Niyato, S. Cui, B. Ai, M. Debbah, K. B. Letaief, and H. V. Poor, “A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications,” IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1560–1605, 2024.

[10] Y. Wang, Z. Su, N. Zhang, and A. Benslimane, “Learning in the air: Secure federated learning for UAV-assisted crowdsensing,” IEEE Trans. Network Sci., vol. 8, no. 2, pp. 1055–1069, 2021.

[11] J. Wang, C. Jin, Q. Tang, N. N. Xiong, and G. Srivastava, “Intelligent ubiquitous network accessibility for wireless-powered MEC in UAV-assisted B5G,” IEEE Trans. Network Sci., vol. 8, no. 4, pp. 2801–2813, 2021.

[12] S. Huang, A. Liu, S. Zhang, T. Wang, and N. N. Xiong, “BD-VTE: A novel baseline data based verifiable trust evaluation scheme for smart network systems,” IEEE Trans. Network Sci., vol. 8, no. 3, pp. 2087–2105, 2021.

[13] N. Cheng, F. Lyu, W. Quan, C. Zhou, H. He, W. Shi, and X. Shen, “Space/aerial-assisted computing offloading for IoT applications: A learning-based approach,” IEEE J. Select. Areas Commun., vol. 37, no. 5, 2019.

[14] Y. Zeng and X. Xu, “Toward environment-aware 6G communications via channel knowledge map,” IEEE Wireless Commun., vol. 28, no. 3, 2021.

[15] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, “A tutorial on environment-aware communications via channel knowledge map for 6G,” IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1478–1519, 2024.

[16] S. Zhang, S. Jiang, W. Lin, Z. Fang, K. Liu, H. Zhang, and K. Chen, “Generative AI on SpectrumNet: An open benchmark of multiband 3D radio maps,” IEEE Trans. Cognit. Commun. Networking, 2024.

[17] R. Levie, Ç. Yapar, G. Kutyniok, and G. Caire, “RadioUNet: Fast radio map estimation with convolutional neural networks,” IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 4001–4015, 2021.

[18] X. Li, S. Zhang, H. Li, X. Li, L. Xu, H. Xu, H. Mei, G. Zhu, N. Qi, and M. Xiao, “RadioGAT: A joint model-based and data-driven framework for multi-band radiomap reconstruction via graph attention networks,” IEEE Trans. Wireless Commun., 2024.

[19] D. Wu, Z. Wu, Y. Qiu, S. Fu, and Y. Zeng, “CKMImageNet: A comprehensive dataset to enable channel knowledge map construction via computer vision,” in 2024 IEEE/CIC International Conference on Communications in China (ICCC Workshops). IEEE, 2024, pp. 114–119.

[20] D. S. Jones, The Theory of Electromagnetism. Elsevier, 2013.

[21] G. A. Deschamps, “Ray techniques in electromagnetics,” Proc. IEEE, vol. 60, no. 9, pp. 1022–1035, 1972.

[22] S. Zhang, A. Wijesinghe, and Z. Ding, “RME-GAN: A learning framework for radio map estimation based on conditional generative adversarial network,” IEEE Internet Things J., vol. 10, no. 20, pp. 18 016–18 027, 2023.

[23] G. Chen, Y. Liu, T. Zhang, J. Zhang, X. Guo, and J. Yang, “A graph neural network based radio map construction method for urban environment,” IEEE Commun. Lett., 2023.

[24] X. Wang, K. Tao, N. Cheng, Z. Yin, Z. Li, Y. Zhang, and X. Shen, “RadioDiff: An effective generative diffusion model for sampling-free dynamic radio map construction,” IEEE Trans. Cognit. Commun. Networking, vol. 11, no. 2, pp. 738–750, 2025.

[25] V. N. Vapnik et al., Statistical Learning Theory. Wiley New York, 1998.

[26] Y. Qiu, X. Chen, K. Mao, X. Ye, H. Li, F. Ali, Y. Huang, and Q. Zhu, “Channel knowledge map construction based on a UAV-assisted channel measurement system,” Drones, vol. 8, no. 5, p. 191, 2024.

[27] X. Wang, L. Fu, N. Cheng, R. Sun, T. Luan, W. Quan, and K. Aldubaikhy, “Joint flying relay location and routing optimization for 6G UAV–IoT networks: A graph neural network-based approach,” Remote Sens., vol. 14, no. 17, p. 4377, 2022.

[28] Ç. Yapar, R. Levie, G. Kutyniok, and G. Caire, “LocUNet: Fast urban positioning using radio maps and deep learning,” in ICASSP 2022. IEEE, 2022, pp. 4063–4067.

[29] T. Cover and P. Hart, “Nearest neighbor pattern classification,” IEEE Trans. Inform. Theory, vol. 13, no. 1, pp. 21–27, 1967.

[30] J.-P. Chiles and P. Delfiner, Geostatistics: Modeling Spatial Uncertainty. John Wiley & Sons, 2012.

[31] A. B. H. Alaya-Feki, S. B. Jemaa, B. Sayrac, P. Houze, and E. Moulines, “Informed spectrum usage in cognitive radio networks: Interference cartography,” in 2008 IEEE 19th International Symposium on Personal, Indoor and Mobile Radio Communications. IEEE, 2008, pp. 1–5.

[32] K. A. Copeland, “Local polynomial modelling and its applications,” 1994.（原文截断）

[33] H. Sun and J. Chen, “Regression assisted matrix completion for reconstructing a propagation field with application to source localization,” in ICASSP 2022. IEEE, 2022, pp. 3353–3357.

[34] S.-J. Kim, E. Dall’Anese, and G. B. Giannakis, “Cooperative spectrum sensing for cognitive radios using kriged Kalman filtering,” IEEE J. Sel. Topics Signal Process., vol. 5, no. 1, pp. 24–36, 2010.

[35] E. Dall’Anese, S.-J. Kim, and G. B. Giannakis, “Channel gain map tracking via distributed kriging,” IEEE Trans. Veh. Technol., vol. 60, no. 3, pp. 1205–1211, 2011.

[36] H. Sun and J. Chen, “Propagation map reconstruction via interpolation assisted matrix completion,” IEEE Trans. Signal Process., vol. 70, 2022.

[37] G. Zhang, X. Fu, J. Wang, X.-L. Zhao, and M. Hong, “Spectrum cartography via coupled block-term tensor decomposition,” IEEE Trans. Signal Process., vol. 68, pp. 3660–3675, 2020.

[38] R. Nikbakht, A. Jonsson, and A. Lozano, “Dual-kernel online reconstruction of power maps,” in 2018 IEEE Global Communications Conference (GLOBECOM). IEEE, 2018, pp. 1–5.

[39] K. Sato and T. Fujii, “Kriging-based interference power constraint: Integrated design of the radio environment map and transmission power,” IEEE Transactions on Cognitive Communications and Networking, vol. 3, no. 1, pp. 13–25, 2017.

[40] Y.-G. Lim, Y. J. Cho, M. S. Sim, Y. Kim, C.-B. Chae, and R. A. Valenzuela, “Map-based millimeter-wave channel models: An overview, data for B5G evaluation and machine learning,” IEEE Wireless Communications, vol. 27, no. 4, pp. 54–62, 2020.

[41] Q. Zhu, K. Mao, M. Song, X. Chen, B. Hua, W. Zhong, and X. Ye, “Map-based channel modeling and generation for U2V mmWave communication,” IEEE Trans. Veh. Technol., vol. 71, no. 8, pp. 8004–8015, 2022.

[42] D. M. Gutierrez-Estevez, I. F. Akyildiz, and E. A. Fadel, “Spatial coverage cross-tier correlation analysis for heterogeneous cellular networks,” IEEE Trans. Veh. Technol., vol. 63, no. 8, pp. 3917–3926, 2014.

[43] Y. Teganya and D. Romero, “Deep completion autoencoders for radio map estimation,” IEEE Trans. Wireless Commun., vol. 21, no. 3, 2022.

[44] S. Shrestha, X. Fu, and M. Hong, “Deep spectrum cartography: Completing radio map tensors using learned neural models,” IEEE Trans. Signal Process., vol. 70, pp. 1170–1184, 2022.

[45] X. Wang, Q. Zhang, N. Cheng, R. Sun, Z. Li, S. Cui, and X. Shen, “RadioDiff-$k^2$: Helmholtz equation informed generative diffusion model for multi-path aware radio map construction,” arXiv preprint, 2025.（原文截断）

[46] X. Wang, Z. Fang, and N. Cheng, “RadioDiff-Inverse: Diffusion enhanced Bayesian inverse estimation for ISAC radio map construction,” arXiv preprint arXiv:2504.14298, 2025.

[47] H. Li, K. Gupta, C. Wang, N. Ghose, and B. Wang, “RadioNet: Robust deep-learning based radio fingerprinting,” in Proceedings of the 2022 IEEE Conference on Communications and Network Security (CNS), 2022.

[48] J. Chen, O. Esrafilian, D. Gesbert, and U. Mitra, “Efficient algorithms for air-to-ground channel reconstruction in UAV-aided communications,” in 2017 IEEE Globecom Workshops (GC Wkshps). IEEE, 2017.

[49] B. Zhang and J. Chen, “Constructing radio maps for UAV communications via dynamic resolution virtual obstacle maps,” in 2020 IEEE 21st International Workshop on Signal Processing Advances in Wireless Communications (SPAWC). IEEE, 2020, pp. 1–5.

[50] W. Liu and J. Chen, “Geography-aware radio map reconstruction for UAV-aided communications and localization,” in ICC 2021-IEEE International Conference on Communications. IEEE, 2021, pp. 1–6.

[51] J. A. Bazerque and G. B. Giannakis, “Nonparametric basis pursuit via sparse kernel-based learning: A unifying view with advances in blind methods,” IEEE Signal Process. Mag., vol. 30, no. 4, pp. 112–125, 2013.

[52] A. Alkhateeb, “DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications,” arXiv preprint, 2019.（原文截断）

[53] N. Docomo et al., “5G channel model for bands up to 100 GHz,” Technical report, Tech. Rep., 2016.

[54] Y. Teganya and D. Romero, “Deep completion autoencoders for radio map estimation,” IEEE Trans. Wireless Commun., vol. 21, no. 3, 2022.

[55] F. Zhou, C. Wang, G. Wu, Y. Wu, Q. Wu, and N. Al-Dhahir, “Accurate spectrum map construction for spectrum management through intelligent frequency-spatial reasoning,” IEEE Trans. Commun., vol. 71, no. 7, 2023.

[56] S. Shrestha, X. Fu, and M. Hong, “Deep spectrum cartography: Completing radio map tensors using learned neural models,” IEEE Trans. Signal Process., vol. 70, pp. 1170–1184, 2022.

[57] A. W. Mbugua, Y. Chen, L. Raschkowski, L. Thiele, S. Jaeckel, and W. Fan, “Review on ray tracing channel simulation accuracy in sub-6 GHz outdoor deployment scenarios,” IEEE Open Journal of Antennas and Propagation, vol. 2, pp. 22–37, 2020.

[58] G. Liebmann, “Field plotting and ray tracing in electron optics: A review of numerical methods,” Advances in Electronics and Electron Physics, vol. 2, pp. 101–149, 1950.

[59] F. Jaensch, G. Caire, and B. Demir, “Radio map estimation–an open dataset with directive transmitter antennas and initial experiments,” arXiv preprint, 2023.（原文截断）

[60] A. Creswell, T. White, V. Dumoulin, K. Arulkumaran, B. Sengupta, and A. A. Bharath, “Generative adversarial networks: An overview,” IEEE Signal Process. Mag., vol. 35, no. 1, pp. 53–65, 2018.

[61] D. P. Kingma, M. Welling et al., “Auto-encoding variational bayes,” arXiv preprint, 2013.（原文截断）

[62] Y. Kang, J. Kang, J. Wen, T. Zhang, Z. Yang, D. Niyato, and Y. Zhang, “Confidence-regulated generative diffusion models for reliable AI agent migration in vehicular metaverses,” arXiv preprint arXiv:2505.12710, 2025.

[63] J. Wang, H. Du, Y. Liu, G. Sun, D. Niyato, S. Mao, D. I. Kim, and X. Shen, “Generative AI based secure wireless sensing for ISAC networks,” IEEE Trans. Inf. Forensics Secur., pp. 1–1, 2025.

[64] X. Qin, M. Sun, J. Dai, P. Ma, Y. Cao, J. Zhang, J. Wang, X. Xu, P. Zhang, and D. Niyato, “Generative AI meets wireless networking: An interactive paradigm for intent-driven communications,” IEEE Transactions on Cognitive Communications and Networking, pp. 1–1, 2025.

[65] J. Liu, M. Xiao, J. Wen, J. Kang, R. Zhang, T. Zhang, D. Niyato, W. Zhang, and Y. Liu, “Optimizing resource allocation for multi-modal semantic communication in mobile AIGC networks: A diffusion-based game approach,” IEEE Transactions on Cognitive Communications and Networking, 2024.（原文截断）

[66] C. Zhao, J. Wang, R. Zhang, D. Niyato, D. I. Kim, and H. Du, “Signal detection in near-field communication with unknown noise characteristics: A diffusion model method,” arXiv preprint arXiv:2409.14031, 2024.

[67] F.-A. Croitoru, V. Hondru, R. T. Ionescu, and M. Shah, “Diffusion models in vision: A survey,” IEEE Trans. Pattern Anal. Mach, vol. 45, no. 9, pp. 10 850–10 869, 2023.

[68] J. Ho, A. Jain, and P. Abbeel, “Denoising diffusion probabilistic models,” Advances in Neural Information Processing Systems (NeurIPS), vol. 33, 2020.

[69] J. Song, C. Meng, and S. Ermon, “Denoising diffusion implicit models,” in Proceedings of the 2020 International Conference on Learning Representations (ICLR), 2020, pp. 1–12.

[70] R. Wahl, G. Wölfle, P. Wertz, P. Wildbolz, and F. Landstorfer, “Dominant path prediction model for urban scenarios,” in 14th IST Mobile and Wireless Communications Summit, 2005, pp. 1–5.

[71] Ö. Çiçek, A. Abdulkadir, S. S. Lienkamp, T. Brox, and O. Ronneberger, “3D U-Net: Learning dense volumetric segmentation from sparse annotation,” in International Conference on Medical Image Computing and Computer-Assisted Intervention, 2016.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（含三条贡献）；第 II 节相关工作与预备知识（A RM 构建方法、B RM 数据获取、C 生成式扩散模型，式（1）—（9））；第 III 节 UrbanRadio3D 的性质（A 数据集构建、B 可视化、C 命名约定（式（10））、D 归一化（式（11）），表 III、表 IV，图 1—4）；第 IV 节基于扩散的三维 RM 生成（A 问题表述、B 带三维算子的扩散模型：潜变量扩散（式（12）（13））、条件生成（式（14））、带条件三维 U-Net（式（15）—（17））、自回归逐高度生成（式（18）），图 5—7）；第 V 节实验过程（A 初步验证与表 V；B 数据集与输入准备（式（19）（20））；C 采样策略（式（21）（22））；D 参数配置；E 性能指标（式（23）—（30））与表 VI；F 推理时间与表 VII；G 3D-UNet 架构；H 应用；I 性能指标与表 VIII，图 8—10）；第 VI 节结论；表格一节（表 I、II、V、VI、VII、VIII 逐格转录）；图注与表注；参考文献 [1]—[71] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做；②图 1—10 图像本体未复制（站点不上传图片），仅中文图注与正文数值；③表 I—VIII 均按原表逐格转录，其中表 I 已用 PyMuPDF 渲染原 PDF 第 2 页核对，表 III/IV/V/VII/VIII 按抽取文本逐格核对；④作者简介与版权声明不在正文范围，未收录；⑤原文若干参考文献在 PDF 抽取文本中被截断（卷/页或 arXiv 号缺失），已逐条标注"（原文截断）"，未擅自补全；⑥摘要末尾数据集 URL 在原文中被截断；⑦骨架版本日期 "2026-07-12" 与 PDF 实际 v1 2025-07-16 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}

