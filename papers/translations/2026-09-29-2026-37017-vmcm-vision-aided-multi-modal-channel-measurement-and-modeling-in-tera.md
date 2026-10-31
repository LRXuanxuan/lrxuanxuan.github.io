---
layout: page
title: "VMCM：太赫兹城市宏小区视觉辅助多模态信道测量与建模｜中文全篇译稿（IEEE 正式版，许可待核验）"
permalink: /papers/translations/2026-09-29-2026-37017-vmcm-vision-aided-multi-modal-channel-measurement-and-modeling-in-tera/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/2c23b61880dd31f8/) · [IEEE DOI](https://doi.org/10.1109/TWC.2026.3701744) · [全部目录](/papers/catalog/)

# VMCM：太赫兹城市宏小区视觉辅助多模态信道测量与建模

**原题：** VMCM: Vision-Aided Multi-Modal Channel Measurement and Modeling in Terahertz Urban Macrocell  
**作者：** Yuanbo Li、Ziming Yu、Chong Han（Senior Member, IEEE）。单位：Yuanbo Li 与 Chong Han 为上海交通大学太赫兹无线通信交叉研究中心（TWC IRC），中国上海 200240（yuanbo.li@sjtu.edu.cn；chong.han@sjtu.edu.cn）；Ziming Yu 为华为技术有限公司，中国成都 611731（yuziming@huawei.com）。通讯作者：Chong Han。  
**版本：** IEEE Transactions on Wireless Communications，Vol. 25, 2026，pp. 18515–18530（本次源文 16 页）。收稿 2025-08-28；修回 2026-01-30、2026-05-21；录用 2026-05-31；当前版本日期 2026-06-16。DOI: 10.1109/TWC.2026.3701744。  
**来源与许可说明：** 骨架页首所标 “arXiv:2026.37017” 与 PDF 不符——该编号不符合 arXiv 的 YYMM.NNNNN 格式，且 PDF 首页为 IEEE TWC 正式出版页（卷期页码与 DOI 齐全），无 arXiv 页首标识。本页保留骨架的导航链接，但按 PDF 实际信息录入版本行；如需引用原文献，请使用上方 DOI 与 IEEE TWC 卷期页码。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–V 节（含 II-A–D、III-A–F、IV-A–E 等全部小节）、结论与未来工作、图注（图 1–17）、表 I（逐格转录）、公式 (1)–(29)、57 条参考文献英文原条目，以及原文文末三位作者简介；原文无附录；逐句逐式终校未做。

## 摘要

为在未来通信网络中实现超高速通信，0.1 THz 至 10 THz 的太赫兹（THz）频段因其丰富的频谱资源与宽连续的可用带宽，被设想为一项关键技术。实现可靠 THz 通信要求对 THz 信道有充分理解与准确刻画。尽管近期已开展多种信道测量与建模研究，但考虑到较大的小区半径与树叶损耗，城市宏小区（UMa）场景仍未得到充分研究。本文在 THz UMa 中开展了大量信道测量，并基于多模态数据输入（包括环境几何、全景图片与信道特性的统计分布）建立了准确的信道模型。具体地，我们在 220 GHz 开展了距离达 410 m 的大量信道测量活动，并具备纳秒级绝对时间同步。基于测量结果，我们详细分析了传播现象，并计算与统计建模了信道特性。此外，本文提出视觉辅助多模态信道模型（VMCM），它结合射线追踪、计算机视觉（CV）技术与统计方法：主导路径由射线追踪技术与 CV 方法确定性地生成；在射线追踪给出的路径增益之外，附加树叶损耗基于从全景图片中提取的树叶信息精确建模；为保持 VMCM 的低计算复杂度，非主导路径随后以统计方式生成。数值结果表明，与传统统计信道模型与射线追踪信道模型相比，VMCM 将路损建模误差降低了约 6 dB，显示出显著优势。此外，基于 VMCM 的初步链路性能评估表明，THz UMa 是可行的，但需要高天线增益与覆盖增强技术才能实现高频谱效率与广覆盖。

## I. 引言

过去几十年间，移动通信技术经历了快速演进，从第一代（1G）系统发展到当前的第五代（5G）网络。5G 的关键进展——如大规模多输入多输出（MIMO）、毫米波通信、网络虚拟化与软件化——已在商业、工业与消费领域带来显著收益 [2]。然而，全息传送、元宇宙与自动驾驶等新兴应用提出了超出 5G 能力的需求，从而推动了下一代通信系统的发展 [3], [4]。为支撑由智能应用与互联设备驱动的数据流量指数式增长，未来网络预期达到每秒数百吉比特量级的数据速率，并可能达到太比特每秒（Tbps）水平 [5]。在此背景下，覆盖 0.1–10 THz 的 THz 频段被设想为实现超高速通信的关键使能技术 [6], [7]。凭借丰富的频谱资源与极宽带宽（超过数十吉赫兹），THz 频段为克服现有无线系统的频谱拥塞与容量限制提供了有前景的解决方案。

实现 THz 无线通信的一项根本挑战，是全面理解 THz 波传播机理并准确刻画 THz 信道。在各类方法中，信道测量活动仍是获取真实信道数据最可信、最广泛采用的途径。过去十年间，人们在办公室、会议室、走廊、数据中心、街道峡谷与城市微小区（UMi）等多种室内外场景，围绕 140 GHz、220 GHz、300 GHz 等代表性频率开展了大量测量工作 [8]。值得注意的是，布伦瑞克工业大学（Technische Universität Braunschweig）的研究组自 2011 年起开展信道测量，主要围绕 300 GHz 附近的会议室、办公室与车–车场景 [9], [10], [11]；南加州大学研究了 140 GHz 与 220 GHz 附近的室外城市信道 [12], [13], [14]；纽约大学研究了 140 GHz 的工厂、办公室与 UMi 环境 [15], [16], [17], [18]；北京邮电大学在 105 GHz 与 132 GHz 的办公室、工厂与 UMi 场景开展了测量 [19], [20], [21]；重庆邮电大学聚焦室内信道刻画与建模，在走廊、大厅、实验室等多种室内环境中对 140 GHz 至 280 GHz 频段开展传播测量并开发了先进的聚类算法 [22], [23], [24]。在我们近期的工作中，也在室内外环境中、覆盖 140 GHz 至 400 GHz 的宽频段开展了系统测量 [25], [26], [27], [28], [29]。虽然主要测量工作集中于短距离场景，但考虑到超大规模多输入多输出（UM-MIMO）在未来 THz 通信中的可行性，THz 网络的应用场景不仅包括密集部署的小区，还包括如 [30] 所设想的 Tbps 集成接入回传（Tera-IAB）无线网络等长距离应用。在此背景下，小区半径在 400 m 至 500 m 量级的城市宏小区（UMa）场景在 THz 频段仍研究不足。本文旨在通过在 UMa 环境中开展大量 THz 信道测量与建模来填补这一空白。

信道研究的最终目标是建立准确、高效的信道模型，作为通信系统设计与性能评估的标准化基线。对 THz 频段，研究界已探索了一系列建模途径，包括确定性方法 [31], [32], [33]、统计方法 [34], [35], [36], [37] 与混合方法 [25], [29], [38], [39]。确定性途径（如射线追踪仿真）精度高，但计算复杂度显著；统计模型计算高效，但一般精度较低。为兼顾二者优势，近期工作聚焦于混合模型，力图在精度与复杂度之间取得平衡。尽管已有上述进展，现有 THz 信道模型仍未解决的一项关键挑战，是室外环境中树叶引起衰减的准确建模。缺乏站点特定信息的统计模型无法充分准确地刻画树叶损耗；而确定性模型依赖详细环境数据，由于树叶数量庞大且形态多变，高保真建模树叶并不可行。这些局限表明，仅依赖射频（RF）数据的信道模型不足以准确建模树叶引起的衰减。有鉴于此，融合多模态感知数据——尤其是视觉传感器数据——为解决这一挑战提供了有前景的途径。

视觉感知利用相机拍摄环境图像，再由计算机视觉（CV）算法处理，以提取定量的几何与语义特征。视觉感知数据为 RF 数据提供了缺失的新维度，可捕捉真实环境的特征，如物体位置、材料类型、环境形状与人体运动等 [40], [41], [42]。因此，这些额外信息可与 RF 数据结合，以增强波束跟踪与聚焦、定位、信道估计与预测等通信系统功能 [43], [44], [45], [46], [47]。例如，[44] 的作者提出了一种基于感知与 CV 技术的波束聚焦方案：它由视觉信息估计 UE 位置，再生成朝向该位置的波束，从而提升定位精度与波束聚焦增益。[47] 的作者提出了一种多模态感知辅助的信道预测技术，同时利用视觉感知与 RF 信号识别设备、人体与环境特征的位置，实现超过 77.1% 的信道预测精度提升。有鉴于此，我们探索如何把视觉模态融入信道模型，以准确捕捉室外环境中的 THz 传播特性。

本文在 THz UMa 场景中，使用基于相关的信道探测仪在 220 GHz 开展了大量信道测量，共测量 72 个接收端（Rx）位置，链路距离从 34 m 到 410 m。基于测量结果，我们进行了详细的传播分析并提取了关键信道特性。为准确建模 THz UMa 信道，我们提出一种混合信道模型——视觉辅助多模态信道模型（VMCM），它融合射线追踪、CV 技术与统计方法，通过融合环境几何、全景图片与信道参数统计分布等多模态数据输入来生成信道响应。特别地，树叶引起的衰减基于由 CV 技术从全景图像中提取的树叶信息精确建模。对比结果表明，VMCM 在 THz UMa 场景的建模精度与有效性上显著优于传统模型。最后，基于 VMCM 的链路级性能评估表明，在 UMa 环境中实现可靠的 THz 连接需要高天线增益与覆盖增强技术。本文的主要贡献概括如下。

- 我们使用基于相关的信道探测仪在 THz UMa 中开展了 220 GHz 的大量信道测量，共测量 72 个 Rx 位置，涵盖视距（LoS）、遮挡视距（OLoS）与非视距（NLoS）情形，发射端（Tx）与 Rx 之间的距离从 34 m 到 410 m。据作者所知，这是首个报告超过 400 m 的长距离 THz 信道测量的工作，其实现得益于高性能上/下变频器、显著基带处理增益与纳秒级绝对时间同步。
- 我们在 THz UMa 中进行了详细的传播分析与信道刻画。基于测得的功率时延谱（PDP），我们观察到树叶遮挡显著影响 LoS 路径强度，而建筑物、汽车、导向牌与金属柱等典型物体产生弱反射与散射路径。此外，我们计算并深入分析了信道特性。
- 我们利用全景图像与 CV 方法对树叶遮挡引起的附加损耗建模。采用基于 k 近邻（KNN）的树叶识别方法从全景图像中提取树叶，并施加相机位姿校正以准确确定树叶的角位置。基于这些树叶数据，树叶遮挡的附加损耗被建模为树叶覆盖率（FCR）的线性函数。
- 我们提出 VMCM，它融合 CV 方法、射线追踪与统计模型，用于 THz UMa 的准确信道建模。THz 信道中的主导多径分量（MPC）——包括 LoS 路径与一次反射路径——用射线追踪确定性地生成，其路径增益基于从全景图像提取的树叶信息进一步调整；其余弱 MPC 以统计方式生成。数值结果表明，所提 VMCM 在精度上优于传统统计模型与射线追踪模型。此外，我们基于 VMCM 评估了 THz UMa 的链路级性能，结果凸显了高天线增益与覆盖增强技术在建立有效 THz UMa 链路中的关键作用。

全文组织如下：第 II 节介绍信道测量活动；第 III 节给出 THz UMa 中的详细传播分析与信道刻画；第 IV 节提出、验证并讨论 VMCM；第 V 节总结全文。

## II. 信道测量活动

### A. 测量系统

为测量 THz 信道，我们使用基于相关的时域信道探测仪，如图 1(a) 所示。Tx 与 Rx 均包含基带处理单元与射频部分。信道冲激响应通过 Zadoff–Chu（ZC）序列的自相关来测量。此外，使用两个铷（Rb）钟分别为 Tx 与 Rx 子系统提供时钟参考与秒脉冲（1PPS）触发；两子系统以主–从模式连接，并在正式测量前预热数小时以同步 1PPS 信号。如图 1(b) 所示，Tx 与 Rx 系统分别安装在旋转器、升降台与推车上，以便捷地改变其指向、高度与位置。

**图 1：** 基于相关的时域信道探测仪。(a) 系统框图（Tx/Rx 基带与射频链路、Rb 钟与 1PPS 同步）；(b) 部署于旋转器、升降台与推车上的 Tx/Rx 实物。

### B. 测量活动

测量活动在上海交通大学校园内的南洋东路附近开展。校园内分布着高度 10 m 至 20 m 的建筑物，包括龙宾楼、文博楼与机械与动力工程学院（ME）大楼等。此外，校园内密集种植了高约 5 m 的常绿乔木。

为模拟 UMa 基站，Tx 部署在龙宾楼四层窗户伸出的水平横杆上，距地面高度 16.6 m，如图 2 中的插图照片所示。Tx 上安装鱼眼相机以拍摄被测场景的全景图像，这些图像随后用于树叶损耗建模。代表用户设备的 Rx 位于 1.6 m 高度，其位置在图 2 中以彩色圆点标出。共测量 72 个 Rx 位置，包括 19 个具有清晰 LoS 传播的位置、33 个被树叶或建筑部分遮挡的位置，以及 20 个处于 NLoS 区域的位置。Tx–Rx 间距从 34 m 到 410 m。

**图 2：** UMa 场景中的测量部署。Rx 位置以彩色圆点标注：橙色圆点表示 LoS 传播的 Rx 位置，绿色圆点与蓝色圆点分别表示 OLoS 与 NLoS 条件下的位置。

### C. 测量设置与链路预算分析

测量设置详述如下。测量频段中心频率为 220 GHz，带宽 1.536 GHz，因此时延分辨率为 0.65 ns。ZC 序列长度为 2048，对应最大时延 1332.7 ns 与最大路径长度 399.8 m。

注意在最远 Rx 位置，Tx/Rx 距离略微超过探测仪的最大路径长度，导致 CIR 结果出现循环移位。为此，我们把最后一个 Rx 位置测得的 CIR 手动扩展为 2154 个采样，将最后 106 个采样取自原始 CIR 结果的前 106 个采样，从而得到等效可测路径长度 420 m。

此外，Tx 通过标准 WR5 波导辐射 THz 波，天线增益为 5 dBi。相反，Rx 配备喇叭天线，增益 25 dBi、半功率波束宽度（HPBW）8°。为捕捉来自各方向的 MPC，我们通过机械旋转 Rx 执行方向扫描探测（DSS）：方位面从 0° 扫至 360°，俯仰面从 −20° 扫至 20°，步进 10°。在此设置下，一个 Rx 位置完成方向扫描约需 15 分钟；因此目前假定测量期间环境为静态。若要支持时变测量，需要提高系统测量速度，可能的方案包括把旋转器替换为转速更快的重定向旋转镜（ReRoMA）系统 [48]，以及使用多天线的 MIMO 测量 [49]。

在链路参数方面，Tx 发射功率为 12 dBm，Rx 噪声系数为 12 dB。为缓解噪声影响，测得的 CIR 经 1000 次平均处理，提供 30 dB 处理增益。据此可进行链路预算分析，如图 3 所示。Rx 基带处的信号强度因 Tx 天线增益、Rx 天线增益以及序列相关与平均带来的基带处理增益而增强，同时因传播路损而衰减。在噪声方面，按 1.536 GHz 带宽计算的 Johnson–Nyquist 噪声功率为 −83.5 dBm，随后被 12 dB 的 Rx 噪声系数放大。注意低噪声放大器（LNA）带来的 Rx 增益未计入链路预算，因为它们同时增强信号与噪声，不影响信噪比（SNR）。因此，基带接收 SNR 计算为 176.5 + PL dB。考虑到 400 m 处的自由空间路损（FSPL）约为 130 dB，系统在保持 SNR 高于 15 dB 的同时实现了 30 dB 动态范围，说明我们的信道探测仪适用于长距离测量。为验证链路预算分析的正确性，图 4 给出一个实测 PDP 示例：可观察到平均噪声底约为 −175 dB，与理论值一致。

**图 3：** 考虑本文测量设置的链路预算分析。注意此处省略了 Rx 增益，因为它们同时影响信号与噪声，从而对 SNR 没有影响。

**图 4：** 实测 PDP 的一个示例（横轴时延、纵轴功率，平均噪声底约 −175 dB）。

### D. 数据后处理

为在 THz UMa 中进行准确分析与建模，实测原始 CIR 数据必须经过细致处理，包括校准、时漂校正、信道估计与 MPC 聚类。首先进行背靠背校准以消除系统响应。虽然 Tx 与 Rx 子系统的两个 Rb 钟在测量前已同步，但两个 1PPS 信号会随时间逐渐漂移。为此，采用线性插值方法分段拟合时漂曲线，详见我们先前的工作 [27]。

此外，由于空间剖面通过 DSS 测得，天线响应会影响测量结果，我们通过使用 DSS-o-SAGE 算法 [50] 进行精确信道参数估计来缓解该影响。为分析 THz 信道中的簇参数，进而用基于多径分量距离（MCD）的带噪密度空间聚类（DBSCAN）算法把 MPC 分组成簇，表现出很强的聚类性能 [25]。

为优化处理时间，在信道参数估计过程中只提取路径增益超过预定阈值的 MPC。路径增益阈值设为

$$
\alpha_{\rm th}=10^{\left(\max\left(\alpha_1-R,\ {\rm NF}+M\right)/20\right)}, \tag{1}
$$

其中 $\alpha_1$ 表示最强路径的路径增益，$R$ 为动态范围（本文取 30 dB），$\max(A,B)$ 表示取 $A$ 与 $B$ 中的较大者。$\mathrm{NF}$ 指实测 CIR 的平均噪声底，对我们的探测仪为 −175 dB。$M$ 表示高于噪声底的裕量，用于消除噪声影响。文献 [14], [17], [18], [29] 通常取 $5\sim10$ dB，而本文取更高的 15 dB。原因在于 MPC 参数估计方法的差异，即文献广泛使用的消噪方法与本文的 DSS-o-SAGE 算法。消噪方法直接从 PDP 中提取 MPC，实际上是网格上搜索过程，即 MPC 的时延与方向落在离散的时延与方向格点上；而在 DSS-o-SAGE 中，时延与角度估计是离格的，可以取任意连续值。因此，由于 MPC 的真实时延与角度偏离离散格点并产生失配损耗，PDP 中观察到的峰值小于 DSS-o-SAGE 中估计的 MPC 路径增益；而在 DSS-o-SAGE 计算 MPC 路径增益时，这种失配损耗会被补偿。根据我们的经验，观察峰值与真实 MPC 路径增益的最大差异约为 10 dB，其中约 3 dB 来自时延失配、7 dB 来自角度失配。因此，为避免从噪声样本中产生虚假 MPC，判定估计路径被舍弃的路径增益阈值被设为比噪声底高 15 dB。

## III. 传播分析与信道特性

本节分析 THz UMa 中的传播现象与信道特性。首先辨识 THz UMa 中的主导传播路径并讨论其物理成因，同时考察影响 THz 波传播的主要物体；随后计算并分析关键信道特性，包括路损、阴影衰落、K 因子、时延扩展、角度扩展与簇参数。

### A. 传播分析

为分析传播现象，我们汇总不同 Rx 位置的 PDP 并展示于图 5。每个 Rx 位置的 PDP 由该位置所有方向上测得的 PDP 求和得到。功率低于 NF 的噪声样本被置为近零值（如 −200 dB），以防止多个 PDP 叠加导致噪声底升高。LoS/OLoS 与 NLoS 情形的 PDP 分别见图 5(a) 与 (b)，典型物体在图 5(c) 与 (d) 中突出显示（分别基于 Rx 16 与 Rx 42 附近拍摄的图像）。可作出如下观察。

第一，在 LoS/OLoS 情形下，LoS/OLoS 路径随 Rx 移动的演化清晰可见。由于 LoS/OLoS 路径的传播时延与 Tx–Rx 距离正相关，LoS/OLoS 路径的轨迹形成一条斜率对应光速的直线。值得注意的是，Rx 7–20 与 Rx 31–55 的 LoS 路径遮挡原因不同：前者受一栋 8 m 高建筑影响，如图 5(d) 所示；后者被树叶遮挡。第二，对于沿南洋东路的 Rx，PDP 中有若干轨迹源自导向牌与标志牌的后向散射路径；随着 Tx–Rx 距离增大，这些路径的传播时延减小，当 Rx 移动到比散射体更远时最终消失。导向牌与标志牌的位置在图 5(c) 中标出，与这些散射路径的演化相对应。在这些散射路径中，来自导向牌 2A 的一条较为显著，其余则弱得多，因为它们来自导向牌与标志牌的背面。第四，Rx 附近的金属柱与汽车在 Rx 沿途引起丰富的散射，但信号强度较弱，且这些散射事件随机出现、空间一致性不显著。第五，考虑 NLoS 情形下的 20 个 Rx 位置，由图 5(b) 可观察到，位于 NLoS 区域深处（即距 LoS 到 NLoS 转折点较远）的 Rx 位置几乎接收不到有效信号；对剩余 Rx 位置，THz 信道稀疏，只有少数路径来自汽车散射、金属柱散射与建筑反射/散射。这一观察表明，为确保 THz UMa 中有效的网络性能，可能需要覆盖增强技术。

> **原文疑点：** 本段观察列举的序号依次为 “First、Second、Fourth、Fifth”，原文缺 “Third”；本译按原文编号照录（未补写或改号），供读者留意。

综上，基于上述观察可以认为：THz 信道在 UMa 环境中是稀疏的、且可能是平稳的，因为 THz 信道由 LoS/OLoS 路径主导，且多数散射路径源自大型物体。尽管如此，仍需用时间/时变测量作进一步验证以佐证该结论。

**图 5：** THz UMa 中的传播分析。(a)、(b) 不同 Rx 位置测得的 PDP；(c)、(d) 影响 THz 传播的物体。

### B. 路损与阴影衰落

路损与阴影衰落是链路预算分析的关键参数。路损与来自所有传播路径的总接收功率有关，用近距离（close-in，CI）自由空间参考距离模型拟合，可表示为

$$
{\rm PL}^{\rm CI}\,[{\rm dB}]=10n\log_{10}\frac{d}{d_0}
+{\rm FSPL}(f_0,d_0)+\chi, \tag{2}
$$

其中 $n$ 表示路损指数（PLE），$d_0$ 为参考距离（本文取 1 m），$f_0$ 为中心频率 220 GHz。${\rm FSPL}(f_0,d_0)$ 表示相应频率与距离处的 FSPL，由 Friss 公式计算：

$$
{\rm FSPL}(f,d)\,[{\rm dB}]=20\log_{10}\frac{c}{4\pi fd}, \tag{3}
$$

其中 $c$ 表示光速。此外，阴影衰落记为服从零均值高斯分布的随机变量 $\chi$。

> **原文疑点：** 式 (3) 按原文排版为 $20\log_{10}\left(c/(4\pi fd)\right)$；按此形式，在 $f=220$ GHz、$d=400$ m 处将得到约 −131 dB，与本节所述“400 m 处 FSPL 约 130 dB”的正值不符。标准 Friss 自由空间路损公式为 $20\log_{10}\left(4\pi fd/c\right)$（对应 +131 dB）。本译按原文公式照录并加注，未作改动，请读者引用时留意。

值得注意的是，此处路损与阴影衰落的定义与窄带信道模型中广泛使用的大尺度衰落略有不同。在窄带系统中，传播信道通常建模为大尺度衰落（即路损与阴影衰落）与多径造成的小尺度衰落的乘积。路损描述信号强度随距离变化的总体趋势，其计算需要空间平均以消除多径叠加造成的小尺度衰落；而阴影衰落通常指由障碍物引起的大尺度衰减的变化。然而，随着带宽增大，通信系统的时延分辨率提高，信道建模范式也随之演进。宽帯信道建模的主流途径不再使用大尺度衰落与小尺度衰落的简单乘积，而是采用基于几何的随机模型（GBSM）[51], [52]。在 GBSM 框架中，首先生成簇功率并保证其总和为 1，随后对全部簇施加路损与阴影衰落以获得信道系数。因此，此处的路损与阴影衰落充当统一施加于所有 MPC 或簇的复合衰减因子。由于路损通常建模为关于距离对数的线性函数，阴影衰落只是描述残差误差的零均值高斯变量，不再与障碍物遮挡相关。

可作出如下观察。第一，测得的 PLE 在 LoS、OLoS 与 NLoS 情形分别为 1.93、2.55 与 3.00。LoS 情形的 PLE 接近 2，这是仅含 LoS 路径的自由空间的典型 PLE，说明 THz UMa 中的 NLoS 路径相对较弱。第二，LoS 情形下阴影衰落效应较弱，标准差为 1.22 dB；相比之下，OLoS 与 NLoS 情形的阴影效应更显著，标准差分别为 6.77 dB 与 7.64 dB。

**图 6：** THz UMa 中的路损与阴影衰落结果（含拟合模型与不同 LoS 状态的数据点）。

### C. K 因子

K 因子量化最强簇的主导程度，其结果拟合为对数正态分布，如图 7 所示。注意在多数 NLoS 位置只观测到一个簇甚至没有簇，导致 NLoS 情形的 K 因子数据不足以拟合模型，故此处省略。由图 7 的结果，LoS 与 OLoS 情形的平均 K 因子分别为 11.96 dB 与 5.63 dB。LoS 情形更高的 K 因子表明 LoS 簇的强主导性。在 OLoS 情形，THz 信道仍主要被 OLoS 簇主导，但由于 OLoS 簇功率被树叶与建筑的遮挡损耗衰减，K 因子小于 LoS 情形。

**图 7：** THz UMa 中的 K 因子结果与拟合模型。

### D. 时延扩展

MPC 的功率在时域上弥散，可能造成符号间干扰（ISI），在通信系统设计中必须仔细考虑。这种弥散可用均方根（RMS）时延扩展来刻画。测得的时延扩展值拟合为对数正态分布，如图 8 所示。对数正态分布的均值在 LoS、OLoS 与 NLoS 情形分别为 −8.17 log₁₀(s)（6.76 ns）、−7.67 log₁₀(s)（21.38 ns）与 −7.40 log₁₀(s)（39.81 ns）。这些时延扩展大于我们先前关于 THz 微小区场景的工作所报告的值，那里 LoS 情形的 DS 通常为几纳秒、NLoS 情形可达 20 ns [26], [28]。这一差异源于本文更高的基站高度，使系统能够接收到时延更大的 MPC（如来自导向牌与标志牌的散射路径），从而导致更大的时延扩展值。此外，随着 LoS 路径功率下降（从 LoS 情形过渡到 OLoS 与 NLoS 情形），时延扩展值增大。该趋势符合预期：当 LoS 路径功率减弱时，其他 NLoS 路径的影响更加显著。

**图 8：** THz UMa 中的 DS 结果与拟合模型。

### E. 角度扩展

与时延扩展类似，多径分量（MPC）的功率在空间域上弥散，用角度扩展来刻画。我们计算了到达方位扩展（ASA）与到达俯仰扩展（ESA）结果，并拟合为对数正态分布，如图 9 所示。平均 ASA 值在 LoS、OLoS 与 NLoS 情形分别为 0.99 log₁₀(°)（9.77°）、1.30 log₁₀(°)（19.95°）与 1.52 log₁₀(°)（33.11°）；平均 ESA 值在 LoS、OLoS 与 NLoS 情形分别为 0.64 log₁₀(°)（4.37°）、0.73 log₁₀(°)（5.37°）与 0.80 log₁₀(°)（6.31°）。与时延扩展的观察类似，随着 LoS 路径功率降低，可观察到更强的多径效应。

**图 9：** THz UMa 中的角度扩展值（ASA 与 ESA）。

### F. 簇参数

簇参数包括簇数目、簇时延扩展（CDS）、簇到达方位扩展（CASA）与簇到达俯仰扩展（CESA），计算与讨论如下。首先，平均簇数目在 LoS、OLoS 与 NLoS 情形分别为 2.80、4.17 与 1.67，表明 THz UMa 场景具有很强的稀疏性。有趣的是，簇数目在 OLoS 情形最大。这可归因于两个因素：一方面，由于 NLoS 情形传播损耗很大，簇数目非常有限；另一方面，由于数据处理时设置相对于最强路径功率的恒定动态范围，LoS 情形下落入该范围的 NLoS 簇数目少于 OLoS 情形，这是因为 LoS 路径功率更强。其次，簇时延与角度扩展的取值为：时延扩展 2.76 ns、3.05 ns 与 1.30 ns；ASA 1.88°、3.49° 与 2.30°；ESA 2.63°、3.63° 与 2.88°（分别对应 LoS、OLoS 与 NLoS 情形）。与时延扩展和角度扩展的结果不同，簇扩展没有明显随 LoS 状态变化的趋势，因为簇扩展高度依赖簇的形状，而簇形状由散射体的类型与尺寸决定，而非 LoS 条件。

## IV. 视觉辅助多模态信道模型

本节介绍 VMCM。首先，为准确建模树叶遮挡引起的附加损耗，利用基于 KNN 的树叶识别方法与相机位姿校正，从全景图像中确定树叶的准确角位置；随后基于 Tx 波束在角域中的 FCR，用分段线性模型对树叶损耗建模。进一步提出融合射线追踪、CV 技术与统计方法的 VMCM。最后，验证混合模型的性能，并与现有 3GPP 标准信道模型及射线追踪方法比较；并用 VMCM 在 THz UMa 中评估频谱效率（SE）与覆盖率等链路性能。

### A. 树叶位置确定

如前所述，树叶显著影响 THz UMa 中的传播损耗。为准确捕捉这一效应，我们使用全景图片获取准确的树叶信息，即树叶在角度空间中的位置，以支撑 THz 频段的树叶损耗建模。树叶位置的确定涉及相机位姿校正与树叶识别，如图 10 所示，具体说明如下。

**1）相机位姿校正：** 为获取树叶的位置，把相机置于与 Tx 相同的位置拍摄全景图像。全景相机利用等距柱状投影（equirectangular projection，ERP）把相机球坐标系中的物体映射到矩形图像，其投影关系为

$$
\phi_c=x_c\Delta\phi+\phi_{c,0}, \tag{4}
$$
$$
\theta_c=y_c\Delta\theta+\theta_{c,0}, \tag{5}
$$

其中 $\Delta\phi$ 与 $\Delta\theta$ 分别为方位面与俯仰面的角分辨率，$\phi_{c,0}$ 与 $\theta_{c,0}$ 为相机坐标系中右下角像素对应的角度。

拍摄全景图像时相机被任意放置，导致相机坐标系偏离当地东–北–天（ENU）坐标系，如图 10 所示。具体地，相机坐标系的 $x$ 轴（即 $\phi_c=\theta_c=0$）对准相机的指向，而 $y$、$z$ 轴对应相机镜头表面的左方向与上方向。相反，信道分析与建模广泛采用的坐标系是以 Tx 为中心的当地 ENU 坐标系。因此需要坐标旋转，把全景图像中捕捉到的物体映射到当地 ENU 坐标系。这通过 $z$–$y$–$z$ 旋转过程实现：对相机坐标系依次绕 $z$ 轴旋转 $\alpha$ 角、绕 $y$ 轴旋转 $\beta$ 角、再绕 $z$ 轴旋转 $\gamma$ 角，使其与当地 ENU 坐标系对齐。为确定旋转角，我们选取若干坐标已知的参考点（如图 10 所示），通过最小化相机系统中旋转后坐标与真实当地 ENU 坐标之间的距离来寻找最优旋转角：

$$
[\alpha_{z,1},\alpha_y,\alpha_{z,2}]
=\arg\min_{\alpha,\beta,\gamma}\sum_{i=1}^{I}
\left\|[\phi_w^i,\theta_w^i]-f_{\alpha,\beta,\gamma}^{z-y-z}(\phi_c^i,\theta_c^i)\right\|^2, \tag{6}
$$

其中 $I$ 表示参考点数目；$\phi_w^i$ 与 $\phi_c^i$ 分别为第 $i$ 个参考点在当地 ENU 坐标系与相机坐标系中的方位角，$\theta_w^i$ 与 $\theta_c^i$ 分别为对应的俯仰角。旋转函数可表示为绕 $z$ 轴与 $y$ 轴旋转函数的复合：

$$
f_{\alpha,\beta,\gamma}^{z-y-z}(\phi,\theta)
=f_\gamma^z\left(f_\beta^y\left(f_\alpha^z(\phi,\theta)\right)\right), \tag{7}
$$

其中绕 $z$ 轴与 $y$ 轴的旋转函数为

$$
f_\alpha^z(\phi,\theta)=[\phi+\alpha,\theta], \tag{8}
$$
$$
f_\alpha^y(\phi,\theta)=
\left[
\arctan\left(\frac{\cos\theta\sin\phi}{\cos\alpha\cos\theta\cos\phi+\sin\alpha\sin\theta}\right),
\right.
\tag{9}
$$
$$
\left.
\arcsin\left(-\sin\alpha\cos\theta\cos\phi+\cos\alpha\sin\theta\right)
\right]. \tag{10}
$$

通过简单的穷举搜索，得到旋转角为 $\alpha_{z,1}=87.3^\circ$、$\alpha_y=3.6^\circ$、$\alpha_{z,2}=104.1^\circ$。

**2）树叶识别：** 为对树叶损耗建模，必须从全景图像中提取树叶位置信息，为此采用基于 KNN 的树叶识别方法。鉴于全景图像尺寸较大（$3840\times3840$ 像素），直接处理整幅图像计算代价高、耗时长。为降低计算复杂度，我们先通过人工选取包含感兴趣树叶的粗略区域对图像做预滤波。此处感兴趣的树叶主要是环境中的树木，灌木因高度过低、不影响 THz 波传播而被略去。随后，用参考颜色高亮感兴趣树叶周围的像素；再通过寻找与参考颜色色差接近零的像素来提取粗略树叶区域：

$$
\mathcal S_{\rm Foliage}=\left\{(x_c,y_c);\
\Delta C\left({\rm RGB}[x_c,y_c],{\rm RGB}_{\rm ref}\right)<\Delta C_{\rm th}\right\}, \tag{11}
$$

其中 $x_c$ 与 $y_c$ 表示图像中的像素位置；${\rm RGB}[x,y]$ 表示第 $x$ 行、第 $y$ 列像素的 RGB 向量，${\rm RGB}_{\rm ref}$ 表示所选颜色的 RGB 向量（本文为 $(63,71,204)$）；$\Delta C_{\rm th}$ 为阈值参数（本文取 50）。色差度量表示为

$$
\Delta C(\mathbf C_1,\mathbf C_2)
=\sqrt{\left(2+\frac{\bar r}{256}\right)\Delta R^2+4\Delta G^2
+\left(2+\frac{255-\bar r}{256}\right)\Delta B^2}, \tag{12}
$$

其中中间变量计算为

$$
\bar r=\frac{C_{1,R}+C_{2,R}}{2}, \tag{13}
$$
$$
\Delta R=C_{1,R}-C_{2,R}, \tag{14}
$$
$$
\Delta G=C_{1,G}-C_{2,G}, \tag{15}
$$
$$
\Delta B=C_{1,B}-C_{2,B}, \tag{16}
$$

其中 $C_{1/2,R/G/B}$ 表示两种颜色的红/绿/蓝分量。

进一步，为从粗略树叶区域中准确提取树叶，采用 KNN 方法依据颜色特征区分树叶与其他物体。KNN 算法在特征空间中寻找距未标注像素最近的 $K$ 个已标注样本，并通过这 $K$ 个近邻的多数表决确定该像素的类别。因此，KNN 算法需要已标注数据才能把像素准确分类为树叶或非树叶。为此，我们在粗略树叶区域中人工标注了一些典型像素；标注同样用颜色涂画完成，红色代表树叶、蓝色代表非树叶物体。随后通过收集相应红、蓝区域的 RGB 值，得到树叶与非树叶物体的 RGB 值集合。之后以 (12) 的色差作为距离度量应用 KNN，判定树叶区域内给定像素属于树叶还是其他物体。由于近邻数 $N$ 会影响 KNN 性能，我们通过重复实验评估不同 $N$ 值下算法的准确率。具体地，60% 的标注数据用作训练集，其余 40% 作为测试集，结果示于图 11。

如图 11 所示，KNN 方法用于树叶识别的准确率很高（超过 98%），证实其有效性。此外，随着 $N$ 增大，分类准确率先升后降；当 $N=22$ 时达到最高准确率 98.3%，本文全程采用该值。借助 KNN 方法，可从全景图片中准确提取树叶，如图 10 所示。

将树叶识别结果与相机位姿校正的坐标旋转过程结合，即可在角度空间中确定树叶的准确位置，如图 10 右上图所示。该信息使得树叶损耗的精确建模成为可能，详见下一小节。

**图 10：** 树叶位置确定的步骤（全景图采集、相机位姿校正、KNN 树叶识别与角域位置结果）。

**图 11：** KNN 树叶识别准确率随近邻数 $N$ 的变化（最高 98.3%，$N=22$）。

### B. 视觉辅助的树叶损耗建模

在 THz 频段，影响 LoS 传播的树叶效应主要有两类，即透射与散射，如图 12 所示。一方面，THz 波穿过叶片时会发生衰减；鉴于叶片中的含水量对 THz 波的强吸收，THz 波穿过单个叶片的透射损耗可能相当显著。另一方面，由于 THz 频段波长极小（毫米或亚毫米量级），叶片可视为相对较大的物体，充当散射体产生丰富的散射路径。由于实际系统的时延分辨率有限，来自树叶、与 LoS 路径时延差很小的散射路径会叠加在 LoS 路径上。考虑到叶片数量庞大及其产生的散射路径，这些多径的叠加会导致观测到的 LoS 路径功率波动，类似于窄带系统中的小尺度衰落。

综上，树叶损耗包含两部分：由树叶透射引起的大尺度衰落，以及多径效应引起的小尺度衰落。总衰减因子可表示为

$$
\alpha_{\rm Fol}=T_L\times\chi_{\rm Fol}, \tag{17}
$$

其中 $T_L$ 表示透射损耗，$\chi_{\rm Fol}$ 表示小尺度衰落。由于存在主导的 LoS 路径，$\chi_{\rm Fol}$ 应服从 Rician 分布。

因此，我们的目标是准确建模 (17) 中的大尺度与小尺度衰落项。具体地，我们把大尺度项 $T_L$ 建模为关于 FCR 的分段线性函数，把小尺度衰落项 $\chi_{\rm Fol}$ 建模为 Rician 分布随机变量。详细讨论如下。

首先，FCR 可定义为

$$
r_{\rm fol}(\phi_w,\theta_w)
=\frac{N_S^{\rm Fol}(\phi_w,\theta_w)}{N_S(\phi_w,\theta_w)}, \tag{18}
$$

其中 $N_S^{\rm Fol}(\phi_w,\theta_w)$ 表示区域 $S(\phi_w,\theta_w)$ 中属于树叶的像素数，$N_S(\phi_w,\theta_w)$ 为区域 $S(\phi_w,\theta_w)$ 中的总像素数。区域 $S(\phi_w,\theta_w)$ 定义为 LoS 方向附近的邻域，$\phi_w$、$\theta_w$ 表示 LoS 路径的方位与俯仰方向。

$S(\phi_w,\theta_w)$ 的定义直接影响 FCR 的计算。为给出合理的 $S(\phi_w,\theta_w)$，我们假设只有位于以 Tx 与 Rx 位置为焦点的椭球内的树叶才会影响 Tx 与 Rx 之间的 LoS 传播，如图 12 所示。该椭球面为 LoS 路径与来自椭球内树叶的单次弹跳散射路径之间的时延差设定了上界，这与著名的 Fresnel 区的定义类似。因此，该假设是合理的，因为只有时延与 LoS 路径非常接近的 MPC 才会最终影响 LoS 信号强度。进一步，借鉴 Fresnel 区的观察，椭球在树叶位置处的横截面半径可表示为

$$
R\propto\sqrt{\frac{\lambda d_{\rm T\text{-}Fol}d_{\rm Fol\text{-}R}}{d_{\rm T\text{-}R}}}, \tag{19}
$$

其中 $d_{\rm T\text{-}Fol}$、$d_{\rm Fol\text{-}R}$ 与 $d_{\rm T\text{-}R}$ 分别表示 Tx、树叶与 Rx 之间的距离，如图 12 所示。

此外，容易推导出

$$
\frac{d_{\rm Fol\text{-}R}}{d_{\rm T\text{-}R}}
=\frac{h_{\rm Fol}-h_{\rm Rx}}{h_{\rm Tx}-h_{\rm Rx}}, \tag{20}
$$

其中 $h_{\rm Fol}$、$h_{\rm Rx}$ 与 $h_{\rm Tx}$ 分别为树叶、Rx 与 Tx 的高度。

由于测量中 Tx 与 Rx 高度保持不变，并假定树叶也处于固定高度（本文场景中约 5 m），容易看出 $d_{\rm Fol\text{-}R}/d_{\rm T\text{-}R}$ 为常数。于是有

$$
R\propto\sqrt{\lambda d_{\rm T\text{-}R}}. \tag{21}
$$

对本文测量的单载波系统忽略波长的影响，椭球在树叶位置处横截面的角半径可表示为

$$
R_\theta=\arctan\frac{R}{d_{\rm T\text{-}Fol}}. \tag{22}
$$

回顾 $d_{\rm T\text{-}Fol}$ 与总距离 $d_{\rm T\text{-}R}$ 成正比，可推出

$$
R_\theta\propto\frac{1}{\sqrt{d_{\rm T\text{-}R}}}. \tag{23}
$$

借助 (23)，最终可在角域中定义感兴趣区域 $S(\phi_w,\theta_w)$：

$$
\mathcal S(\phi_w,\theta_w)=
\left\{
\phi,\theta;\ 
D\left((\phi_w,\theta_w),(\phi,\theta)\right)<\frac{\phi_{\rm th}}{\sqrt{d_{\rm T\text{-}R}}}
\right\}, \tag{24}
$$

其中 $\phi_{\rm th}$ 为阈值参数，取决于椭球尺寸。两个方向之间的距离定义为

$$
D\left((\phi_1,\theta_1),(\phi_2,\theta_2)\right)
=\arccos\left(\cos\theta_1\cos\theta_2\cos(\phi_1-\phi_2)
+\sin\theta_1\sin\theta_2\right), \tag{25}
$$

该式容易由两个单位向量的点积推出，此处从略。

如前所述，大尺度衰落 $T_L$ 建模为关于 FCR 的分段线性函数。该建模方法源于两个重要推测。一方面，直观上成立的是：FCR 越大，$T_L$ 越大，因为树叶引起的 MPC 以及 LoS 路径会有更多遮挡与透射损耗。另一方面，当 FCR 很小时（例如低于某阈值 $r_{\rm th}$），$T_L$ 应保持在 1 附近。因此可表示为

$$
T_L=\begin{cases}
1, & \text{若 } r_{\rm fol}<r_{\rm th},\\[2pt]
a(r_{\rm fol}-r_{\rm th})+1, & \text{若 } r_{\rm fol}\ge r_{\rm th},
\end{cases} \tag{26}
$$

其中 $a$ 与 $r_{\rm th}$ 分别为模型的斜率与分段点。

基于测量结果，树叶损耗随后可拟合到 (17) 与 (26) 的模型。(24) 中决定椭球尺寸的阈值参数尚未确定；我们通过从 $\alpha_{\rm Fol}$ 中减去 $T_L$，寻找使总体残差误差最小的 $\phi_{\rm th}$ 取值，结果如图 13(a) 所示。可见 $\phi_{\rm th}=0.52$ 时总体残差误差最小，后续处理采用该值。

在阈值参数确定后，即可计算 FCR，并用分段线性模型拟合大尺度衰落 $T_L$，如图 13 所示。可以观察到，随着 FCR 增大，分段线性模型正确捕捉了树叶衰减因子的总体趋势。树叶衰减因子的波动随后用 Rician 分布随机变量 $\chi_{\rm Fol}$ 建模，其拟合参数为非中心参数 0.05、尺度参数 0.78。实际上，这些参数对应 K 因子为 −27 dB，意味着由于强烈的树叶多径效应，小尺度衰落几乎呈 Rayleigh 分布。

**图 12：** THz 频段中树叶效应的示意图（透射与散射，及 Tx、Rx、树叶几何与椭球关系）。

**图 13：** 树叶损耗的分段线性模型：(a) 阈值参数 $\phi_{\rm th}$ 的残差误差选择；(b) 大尺度衰落 $T_L$ 随 FCR 的分段线性拟合。

### C. THz UMa 中的混合信道建模

为准确刻画 UMa 场景中的 THz 无线信道，提出融合射线追踪、CV 技术与统计方法的 VMCM。基于 VMCM 生成信道实现的流程如图 14 所示，具体说明如下。

**1）步骤 1：用射线追踪生成主导 MPC。** 为实现高建模精度，采用确定性信道建模方法，即射线追踪技术。为进行射线追踪仿真，被测环境的环境数据取自 OpenStreetMap 网站（该网站提供由全球志愿者贡献的免费开源世界地图，www.openstreetmap.org）。需要强调，射线追踪仿真所用环境仅包含 THz UMa 场景中的建筑物，此阶段不考虑树叶；树叶损耗在后续步骤中计入。为降低计算复杂度，使用射线追踪只生成主导路径，包括 LoS 情形下的 LoS 路径与 NLoS 情形下的一次反射路径。也可能在某些深 NLoS 位置观测不到一次反射路径；此类位置视为中断（outage）位置，不再施加后续建模步骤。

**2）步骤 2：为主导路径生成树叶损耗。** 已证明 THz UMa 场景中的树叶会显著影响信号传播。因此，必须相应调整射线追踪生成的主导路径的路径增益，这通过施加 (17) 中的树叶损耗模型实现。例如，对给定 LoS 路径，一旦从射线追踪仿真已知其离开角（AoD），就可用 (18) 计算 FCR，再由 (17) 确定树叶损耗并施加到路径增益上。NLoS 情形下的一次反射路径遵循类似流程；不过该调整仅适用于从 Tx 到散射体的路径段，从散射体到 Rx 的树叶损耗此处未考虑，留作未来工作。

**3）步骤 3：用统计方法生成非主导 MPC。** 由于射线追踪仿真只生成一次反射路径以降低计算复杂度，其他 MPC（如散射路径）使用基于 3GPP 信道标准化文件（具体为 3GPP TR 38.901 [51]）的统计方法生成。3GPP 标准的实现使用 Fraunhofer Heinrich-Hertz-Institut（HHI）开发的准确定性无线信道发生器（QuaDriGa）[52]。为把 QuaDriGa 有效应用于本文特定场景，依据表 I 给出的信道特性分布参数对其进行参数化；这些参数由从测量结果中剔除主导路径效应后得到。

**4）步骤 4：信道冲激响应计算。** 经上述三步，MPC 的信道参数（包括路径增益、时延、AoD、到达角（AoA）等）均已确定。基于这些参数，把确定性地生成的主导 MPC 与统计生成的非主导 MPC 组合起来，即可构造信道冲激响应。如此，VMCM 在高建模精度与低计算复杂度之间取得良好平衡，其有效性将在下一小节验证。

**表 I：** 统计信道生成的拟合参数（Hybrid 与 Statistical 两种方式下 LoS/NLoS 各列的分布参数）。

| 参数 | Hybrid LoS | Hybrid NLoS | Statistical LoS | Statistical NLoS |
|---|---:|---:|---:|---:|
| PLE $n$ | 2.85 | 3.10 | 2.33 | 2.99 |
| SF [dB]：$\sigma_{SF}$ | 7.33 | 7.83 | 8.23 | 7.44 |
| KF [dB]：$\mu_{KF}$ | −1.10 | 7.68 | 8.12 | 0.23 |
| KF [dB]：$\sigma_{KF}$ | 3.73 | 2.74 | 6.23 | 2.77 |
| DS [$\log_{10}$ s]：$\mu_{DS}$ | −7.39 | −7.66 | −7.87 | −7.38 |
| DS [$\log_{10}$ s]：$\sigma_{DS}$ | 0.64 | 0.86 | 0.71 | 0.46 |
| ASA [$\log_{10}$ °]：$\mu_{ASA}$ | 1.66 | 1.20 | 1.17 | 1.54 |
| ASA [$\log_{10}$ °]：$\sigma_{ASA}$ | 0.37 | 0.87 | 0.53 | 0.27 |
| ESA [$\log_{10}$ °]：$\mu_{ESA}$ | 0.81 | 0.85 | 0.69 | 0.79 |
| ESA [$\log_{10}$ °]：$\sigma_{ESA}$ | 0.26 | 0.11 | 0.23 | 0.16 |
| 簇数目 | 4 | 1 | 4 | 2 |
| CDS [ns] | 3.49 | 1.40 | 2.94 | 1.67 |
| CASA [°] | 2.64 | 2.21 | 2.85 | 1.30 |
| CESA [°] | 3.66 | 3.67 | 3.23 | 2.30 |

**图 14：** THz UMa 中 VMCM 的信道生成步骤（射线追踪主导 MPC → 树叶损耗调整 → 统计非主导 MPC → 合成 CIR）。

### D. 性能验证与比较

为验证所提 VMCM 的有效性，我们在与信道测量相同的 Tx–Rx 位置重新生成信道实现，并与测量结果比较。作为对比，采用 QuaDriGa 实现的纯统计模型与射线追踪模型作为基准。具体地，统计模型的配置参数列于表 I，而射线追踪仿真考虑反射阶数低于 3 的反射路径。

为评估模型性能，不同模型的 DS 分布结果如图 15 所示。具体地，在 LoS 情形，平均时延扩展值对测量、统计模型、射线追踪与 VMCM 分别为 38.00 ns、39.87 ns、58.13 ns 与 34.19 ns。射线追踪的 DS 值偏大，原因在于其忽略树叶损耗，使得大传播时延的反射路径比测量中更强。在 NLoS 情形，相应的时延扩展值分别为 61.60 ns、71.33 ns、75.77 ns 与 66.72 ns；射线追踪模型在 NLoS 情形同样高估了时延扩展。综上，VMCM 与统计模型的 DS 值都与测量结果吻合较好，而射线追踪的结果略微偏离测量结果。

除统计意义上的精度外，考虑到站点特定应用的潜在需求，信道模型还需具备确定性的准确性并与真实信道测量一致。为此，我们选取一条包含 42 个测量位置的 Rx 路线进行模型性能验证，以检验不同模型能否准确捕捉 THz UMa 中的空间一致性与变化，如图 16(a) 所示。沿该 Rx 路线，LoS 条件从起始段的 NLoS 情形过渡到中段的 LoS 情形，再在末端回到 NLoS 情形；路线总长超过 500 m。不同模型得到的路损结果见图 16(b)，可得出若干关键观察。

第一，VMCM 准确捕捉了 NLoS 情形的中断位置（PL > 160 dB），如路线最初的 50 m 段。这一能力归功于 VMCM 的确定性分量；相反，统计模型与射线追踪模型无法复现该现象。一方面，统计模型随机生成信道实现、不包含站点特定信息，因而无法准确捕捉中断位置；另一方面，由于射线追踪忽略树叶损耗，路线末端的 NLoS 位置接收到强的高阶反射，导致路损值被显著低估。定量地，NLoS 情形下测量结果与建模结果之间的 RMSE 对 VMCM 为 6.00 dB、对统计建模方法为 9.05 dB、对射线追踪为 11.49 dB。第二，在 LoS 情形，VMCM 在路损建模上显著优于统计方法与射线追踪：统计方法只对实测信道数据做统计拟合，在单个实现上会产生较大偏差；而射线追踪方法无法捕捉树叶遮挡引起的路损波动。特别地，LoS 情形下测量与建模路损之间的 RMSE 对 VMCM 为 4.60 dB、对统计模型为 9.61 dB、对射线追踪为 7.16 dB，验证了所提途径的优越性。

**图 15：** 不同模型的时延扩展结果（测量、统计模型、射线追踪与 VMCM 的 DS 分布对比）。

**图 16：** 所考察 Rx 路线上的路损建模结果：(a) Rx 路线与 LoS/NLoS 分布；(b) 各模型的路损预测与测量对比（中断位置 PL > 160 dB；RMSE 见正文）。

### E. THz UMa 中的链路性能评估

本节基于 VMCM 评估 THz UMa 场景的链路性能，包括 SE 与覆盖率。具体地，给定预定的小区半径，Tx 位置设为信道测量活动所用位置，而 Rx 位置在定义的圆形小区区域内随机分布。需要强调，只考虑龙宾楼前方的半圆区域，因为 Tx 天线位于建筑物高度以下，无法为楼后区域提供覆盖。对这些随机生成的 Rx 位置，用 VMCM 生成相应信道实现并计算关联路损。于是，特定 Rx 位置接收到的 SNR 计算为

$$
\gamma=\frac{P_tG_tG_r10^{-{\rm PL}/10}}{FkTB}, \tag{27}
$$

其中 $P_t$ 表示发射功率，$G_t$ 与 $G_r$ 表示 Tx 与 Rx 的天线增益，$\mathrm{PL}$ 为用 VMCM 建模的路损值（dB），$F$ 为接收机噪声系数，$k$ 为 Boltzmann 常数，$T$ 与 $B$ 为温度与带宽。具体地，实际 THz 通信链路的参数设置如下：发射功率设为 13 dBm，系统温度与带宽分别假定为 300 K 与 2 GHz，噪声系数配置为 10 dB。关于天线增益，总增益（定义为 Tx 与 Rx 天线增益之和）被视为变量，因为增益值会随两端所用天线的类型与口径显著变化。

采用平均 SE 与覆盖率作为关键性能指标，计算如下：

$$
{\rm SE}=\frac{\sum_{n_{\rm Rx}}\log_2\left(1+\gamma_{n_{\rm Rx}}\right)}{N_{\rm Rx}}, \tag{28}
$$

$$
r_{\rm cov}={\rm Pr}\left(\gamma_{n_{\rm Rx}}>\gamma_{\rm th}\right), \tag{29}
$$

其中 $\gamma_{n_{\rm Rx}}$ 表示第 $n_{\rm Rx}$ 个随机生成的 Rx 位置处的接收 SNR，$N_{\rm Rx}$ 表示所考虑的 Rx 位置总数，${\rm Pr}(\cdot)$ 表示给定事件的概率。值得注意，该初步性能评估只考虑单输入单输出（SISO）系统；THz UMa 场景中的实际通信性能还可通过引入 MIMO 技术进一步提升。

基于 Monte Carlo 仿真，THz UMa 场景的链路性能结果如图 17 所示，可得出若干关键观察。第一，在高天线增益与小小区半径下（例如总天线增益 70 dB、小区半径 50 m），平均 SE 超过 10 bps/Hz，显示 THz 频段支撑超高速通信的强大潜力。第二，当天线增益降低且小区尺寸增大时，SE 显著退化。例如在天线增益 30 dB 时，平均 SE 在小区别半径 50 m 下降至 1.32 bps/Hz，在 400 m 下降至 0.19 bps/Hz。这凸显了采用高增益天线技术在 THz UMa 场景中实现高数据速率传输的关键重要性。第三，从覆盖率角度看，天线增益与小区半径对覆盖性能都起关键作用。一方面，增大天线增益会因接收 SNR 提升而显著改善覆盖率；另一方面，如第 III-A 节所述，许多 NLoS 位置的接收信号功率低于所考虑的 160 dB 路径增益阈值（对应 70 dBi 天线增益下 −6 dB 的 SNR）。因此，要确保这些 NLoS 区域的信号可靠性，有效的覆盖增强技术必不可少；有前景的途径包括智能反射面（IRS）[53] 与非智能反射面（NIRS）[54]。

**图 17：** 基于 VMCM 的 THz UMa 链路性能评估结果（平均 SE 与覆盖率随总天线增益和小区半径的变化）。

## V. 结论与未来工作

本文使用基于相关的信道探测仪在 THz UMa 场景中开展了 220 GHz 的大量信道测量，共测量 72 个 Rx 位置，覆盖 LoS、OLoS 与 NLoS 情形，Tx–Rx 间距达 410 m。基于测量结果，我们在 THz UMa 中进行了详细的传播分析与信道刻画。结果表明，THz 波传播显著受建筑物、汽车、树叶与金属柱等多种物体影响；信道特性的统计建模揭示 UMa 中的 THz 信道高度稀疏，多径效应较弱。进一步，为准确建模树叶引起的衰减，我们使用视觉数据确定树叶在角度空间中的精确位置：提出基于 KNN 的树叶识别方法从全景图像中提取树叶，并通过相机位姿校正进一步确定精确的树叶位置。最后，我们提出 VMCM，它融合射线追踪、CV 技术与统计方法，并基于多模态数据输入（用于射线追踪的环境几何、用于 CV 技术的全景图片、用于统计建模的统计分布）生成信道响应。数值结果表明 VMCM 相较现有信道模型的优越性：路损的 RMSE 从传统模型的约 10 dB 降至 VMCM 的约 4 dB。基于 VMCM 的链路性能评估表明，高增益天线与覆盖增强技术对于在 THz UMa 中建立有效通信链路至关重要。

值得注意的是，当前 VMCM 建立在静态数据输入之上，包括环境几何与全景图像。该框架可扩展以支持动态更新，从而为其融入数字孪生系统、实现实时网络优化铺平道路。例如，可用同步定位与建图（SLAM）算法进行实时几何重建，用连续视频监控更新树叶信息。在此背景下，VMCM 可充当数字孪生中的关键组件：由融合的视觉与传感器数据出发，构建物理环境的电磁感知数字副本；该副本在 VMCM 的引导下可指示通信网络调整参数以获得最优性能，从而有效连接数字世界与物理世界。为支撑上述前景，未来仍需提升 VMCM 的能力与效率。首先，VMCM 目前依赖人工预滤波与标注来完成树叶识别，这种人工参与阻碍了 VMCM 在数字孪生中的有效使用。为此，一个可能的解决方案是部署强大的图像分割神经网络，使树叶识别更通用、更高效 [40], [55]。其次，为在未来支持实时数字孪生，需要仔细考察并改进 VMCM 的计算复杂度。由于统计建模相当快，树叶损耗建模与射线追踪可能较为耗时，因为它们涉及复杂的图像处理与射线计算。在此背景下，对输入图像与几何进行剪枝，以及采用射线追踪加速技术，都是值得研究的方向 [56], [57]。

## 参考文献（英文原条目，按原文顺序）

[1] Y. Li, Y. Wang, Y. Lyu, Z. Yu, and C. Han, “220 GHz urban microcell channel measurement and characterization on a university campus,” in *Proc. IEEE Globecom Workshops (GC Wkshps)*, Cape Town, South Africa, 2024, pp. 1–5, doi: 10.1109/GCWkshp64532.2024.11101111.

[2] I. F. Akyildiz, A. Kak, and S. Nie, “6G and beyond: The future of wireless communications systems,” *IEEE Access*, vol. 8, pp. 133995–134030, 2020.

[3] W. Saad, M. Bennis, and M. Chen, “A vision of 6G wireless systems: Applications, trends, technologies, and open research problems,” *IEEE Netw.*, vol. 34, no. 3, pp. 134–142, May 2020.

[4] Z. Zhang et al., “6G wireless networks: Vision, requirements, architecture, and key technologies,” *IEEE Veh. Technol. Mag.*, vol. 14, no. 3, pp. 28–41, Sep. 2019.

[5] Z. Chen et al., “Terahertz wireless communications for 2030 and beyond: A cutting-edge frontier,” *IEEE Commun. Mag.*, vol. 59, no. 11, pp. 66–72, Nov. 2021.

[6] I. F. Akyildiz, C. Han, and S. Nie, “Combating the distance problem in the millimeter wave and terahertz frequency bands,” *IEEE Commun. Mag.*, vol. 56, no. 6, pp. 102–108, Jun. 2018.

[7] T. S. Rappaport et al., “Wireless communications and applications above 100 GHz: Opportunities and challenges for 6G and beyond,” *IEEE Access*, vol. 7, pp. 78729–78757, 2019.

[8] C. Han et al., “Terahertz wireless channels: A holistic survey on measurement, modeling, and analysis,” *IEEE Commun. Surveys Tuts.*, vol. 24, no. 3, pp. 1670–1707, 3rd Quart., 2022.

[9] S. Priebe, C. Jastrow, M. Jacob, T. Kleine-Ostmann, T. Schrader, and T. Kurner, “Channel and propagation measurements at 300 GHz,” *IEEE Trans. Antennas Propag.*, vol. 59, no. 5, pp. 1688–1698, May 2011.

[10] S. Priebe, M. Kannicht, M. Jacob, and T. Kürner, “Ultra broadband indoor channel measurements and calibrated ray tracing propagation modeling at THz frequencies,” *J. Commun. Netw.*, vol. 15, no. 6, pp. 547–558, Dec. 2013.

[11] J. M. Eckhardt, V. Petrov, D. Moltchanov, Y. Koucheryavy, and T. Kurner, “Channel measurements and modeling for low-terahertz band vehicular communications,” *IEEE J. Sel. Areas Commun.*, vol. 39, no. 6, pp. 1590–1603, Jun. 2021.

[12] N. A. Abbasi et al., “Double directional channel measurements for THz communications in an urban environment,” in *Proc. ICC - IEEE Int. Conf. Commun. (ICC)*, Jun. 2020, pp. 1–6.

[13] N. A. Abbasi et al., “THz band channel measurements and statistical modeling for urban D2D environments,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 3, pp. 1466–1479, Mar. 2023.

[14] N. A. Abbasi et al., “THz band channel measurements and statistical modeling for urban microcellular environments,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 7, pp. 6719–6734, Jul. 2024.

[15] Y. Xing, T. S. Rappaport, and A. Ghosh, “Millimeter wave and sub-THz indoor radio propagation channel measurements, models, and comparisons in an office environment,” *IEEE Commun. Lett.*, vol. 25, no. 10, pp. 3151–3155, Oct. 2021.

[16] Y. Xing and T. S. Rappaport, “Millimeter wave and terahertz urban microcell propagation measurements and models,” *IEEE Commun. Lett.*, vol. 25, no. 12, pp. 3755–3759, Dec. 2021.

[17] D. Shakya, S. Ju, O. Kanhere, H. Poddar, Y. Xing, and T. S. Rappaport, “Radio propagation measurements and statistical channel models for outdoor urban microcells in open squares and streets at 142, 73, and 28 GHz,” *IEEE Trans. Antennas Propag.*, vol. 72, no. 4, pp. 3580–3595, Apr. 2024.

[18] S. Ju, D. Shakya, H. Poddar, Y. Xing, O. Kanhere, and T. S. Rappaport, “142 GHz sub-terahertz radio propagation measurements and channel characterization in factory buildings,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 7, pp. 7127–7143, Jul. 2024.

[19] Y. Qin et al., “Time-varying channel measurement and analysis at 105 GHz in an indoor factory,” in *Proc. 18th Eur. Conf. Antennas Propag. (EuCAP)*, Mar. 2024, pp. 1–5.

[20] X. Liu et al., “Channel sparsity variation and model-based analysis on 6, 26, and 105 GHz measurements,” *IEEE Trans. Veh. Technol.*, vol. 73, no. 7, pp. 9387–9397, Jul. 2024.

[21] Z. Chang et al., “3GPP-like GBSM THz channel characterization, modeling, and simulation based on experimental observations,” 2023, arXiv:2305.14997.

[22] Y. Wang, X. Zhou, X. Liao, J. Zhang, and J. Zhang, “Channel measurements and multipath characterization for indoor sub-terahertz communication,” *IEEE Trans. Veh. Technol.*, vol. 74, no. 3, pp. 4393–4407, Mar. 2025.

[23] X. Liao, P. Zhou, Y. Wang, and J. Zhang, “Path loss modeling and environment features powered prediction for sub-THz communication,” *IEEE Open J. Antennas Propag.*, vol. 5, pp. 1734–1746, 2024.

[24] J. Luo et al., “An entropy-based adaptive DBSCAN clustering algorithm and its application in THz wireless channels,” *IEEE Trans. Antennas Propag.*, vol. 71, no. 12, pp. 9830–9837, Dec. 2023.

[25] Y. Chen, Y. Li, C. Han, Z. Yu, and G. Wang, “Channel measurement and ray-tracing-statistical hybrid modeling for low-terahertz indoor communications,” *IEEE Trans. Wireless Commun.*, vol. 20, no. 12, pp. 8163–8176, Dec. 2021.

[26] Y. Wang, Y. Lil, Y. Chen, Z. Yu, and C. Han, “Terahertz channel measurement and analysis on a university campus street,” in *Proc. ICC - IEEE Int. Conf. Commun.*, May 2023, pp. 2075–2080.

[27] Y. Li, Y. Wang, Y. Chen, Z. Yu, and C. Han, “Correlation-based dual-band THz channel measurements and characterization in a laboratory,” in *Proc. IEEE 35th Int. Symp. Pers., Indoor Mobile Radio Commun. (PIMRC)*, Sep. 2024, pp. 1–6.

[28] Y. Li, Y. Wang, Z. Chen, Y. Chen, Z. Yu, and C. Han, “Correlation-based channel measurement and link-level analysis for THz picocells on a university street,” in *Proc. IEEE 99th Veh. Technol. Conf. (VTC-Spring)*, Jun. 2024, pp. 1–5.

[29] Y. Wang, Y. Li, Z. Yu, and C. Han, “300 GHz dual-band channel measurement, analysis and modeling in L-shaped scenarios,” *IEEE Trans. Veh. Technol.*, vol. 74, no. 7, pp. 1–14, Jul. 2025.

[30] I. F. Akyildiz, C. Han, Z. Hu, S. Nie, and J. M. Jornet, “Terahertz band communication: An old problem revisited and research directions for the next decade,” *IEEE Trans. Commun.*, vol. 70, no. 6, pp. 4250–4285, Jun. 2022.

[31] O. Kanhere, H. Poddar, and T. S. Rappaport, “Calibration of NYURay for ray tracing using 28, 73, and 142 GHz channel measurements conducted in indoor, outdoor, and factory scenarios,” *IEEE Trans. Antennas Propag.*, vol. 73, no. 1, pp. 405–420, Jan. 2025.

[32] H. Yi et al., “Full-wave simulation and scattering modeling for terahertz communications,” *IEEE J. Sel. Topics Signal Process.*, vol. 17, no. 4, pp. 713–728, Jul. 2023.

[33] L. Azpilicueta et al., “Diffuse-scattering-informed geometric channel modeling for THz wireless communications systems,” *IEEE Trans. Antennas Propag.*, vol. 71, no. 10, pp. 8226–8238, Oct. 2023.

[34] S. Ju and T. S. Rappaport, “Statistical channel model of wideband sub-THz radio propagation in indoor factories at 142 GHz: Toward 6G industrial wireless networks,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 11, pp. 16316–16331, Nov. 2024.

[35] H. Poddar, S. Ju, D. Shakya, and T. S. Rappaport, “A tutorial on NYUSIM: Sub-terahertz and millimeter-wave channel simulator for 5G, 6G, and beyond,” *IEEE Commun. Surveys Tuts.*, vol. 26, no. 2, pp. 824–857, 2nd Quart., 2024.

[36] Z. Hu, Y. Li, and C. Han, “Transfer learning enabled transformer-based generative adversarial networks for modeling and generating terahertz channels,” *Commun. Eng.*, vol. 3, no. 1, pp. 1–14, Nov. 2024.

[37] J. Wang, C.-X. Wang, J. Huang, R. Feng, E.-H.-M. Aggoune, and Y. Chen, “A novel THz massive MIMO beam domain channel model for 6G wireless communication systems,” *IEEE Trans. Veh. Technol.*, vol. 72, no. 8, pp. 9704–9719, Aug. 2023.

[38] J. M. Eckhardt, T. Doeker, and T. Kürner, “Hybrid channel model for low terahertz links in a data center,” *IEEE Open J. Commun. Soc.*, vol. 5, pp. 4731–4745, 2024.

[39] R. Takahashi, A. Ghosh, M. Mao, and M. Kim, “Channel modeling and characterization of access, D2D, and backhaul links in a corridor environment at 300 GHz,” *IEEE Trans. Antennas Propag.*, vol. 73, no. 4, pp. 1954–1968, Apr. 2025.

[40] S. Minaee, Y. Boykov, F. Porikli, A. Plaza, N. Kehtarnavaz, and D. Terzopoulos, “Image segmentation using deep learning: A survey,” *IEEE Trans. Pattern Anal. Mach. Intell.*, vol. 44, no. 7, pp. 3523–3542, Jul. 2022.

[41] Z. Zou, K. Chen, Z. Shi, Y. Guo, and J. Ye, “Object detection in 20 years: A survey,” *Proc. IEEE*, vol. 111, no. 3, pp. 257–276, Mar. 2023.

[42] M. Ye, J. Shen, G. Lin, T. Xiang, L. Shao, and S. C. H. Hoi, “Deep learning for person re-identification: A survey and outlook,” *IEEE Trans. Pattern Anal. Mach. Intell.*, vol. 44, no. 6, pp. 2872–2893, Jun. 2022.

[43] M. Ouyang, F. Gao, Y. Wang, S. Zhang, P. Li, and J. Ren, “Computer vision-aided reconfigurable intelligent surface-based beam tracking: Prototyping and experimental results,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 12, pp. 8681–8693, Dec. 2023.

[44] S. Kim, J. Moon, J. Wu, B. Shim, and M. Z. Win, “Vision-aided positioning and beam focusing for 6G terahertz communications,” *IEEE J. Sel. Areas Commun.*, vol. 42, no. 9, pp. 2503–2519, Sep. 2024.

[45] W. Xu, F. Gao, X. Tao, J. Zhang, and A. Alkhateeb, “Computer vision aided mmWave beam alignment in V2X communications,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 4, pp. 2699–2714, Apr. 2023.

[46] S. Kim, S. Jeong, J. Wu, B. Shim, and M. Z. Win, “Large multimodal model-based environment-aware channel estimation,” *IEEE J. Sel. Areas Commun.*, vol. 43, no. 12, pp. 4059–4075, Dec. 2025.

[47] J. Moon, K. A. Ngo, B. Lee, and B. Shim, “Multi-modal sensing-aided channel prediction for 6G mmWave massive antenna systems,” *IEEE Trans. Cognit. Commun. Netw.*, vol. 12, pp. 2798–2813, 2026.

[48] A. F. Molisch et al., “Millimeter-wave V2X channel measurements in urban environments,” *IEEE Open J. Veh. Technol.*, vol. 6, pp. 520–541, 2025.

[49] S. S. Al-Bawri, W. M. Abdulkawi, A.-F.-A. Sheta, and M. Moniruzzaman, “A high-performance 3D eight-port THz-MIMO antenna system verified with machine learning for enhanced wireless communication systems,” *Int. J. Commun. Syst.*, vol. 38, no. 4, p. 6006, Mar. 2025.

[50] Y. Li, C. Han, Y. Chen, Z. Yu, and X. Yin, “DSS-o-SAGE: Direction-scan sounding-oriented SAGE algorithm for channel parameter estimation in mmWave and THz bands,” *IEEE Trans. Antennas Propag.*, vol. 73, no. 4, pp. 1969–1983, Apr. 2025.

[51] *Study on Channel Model for Frequencies From 0.5 to 100 GHz*, document TR 38.901, 3GPP, Dec. 2019.

[52] S. Jaeckel, L. Raschkowski, K. Börner, L. Thiele, F. Burkhardt, and E. Eberlein, “QuaDriGa—Quasi deterministic radio channel generator, user manual and documentation,” Fraunhofer Heinrich Hertz Institute, QuaDRiGa v1.2.3-307, Tech. Rep., Oct. 2020.

[53] Q. Xue et al., “A survey of beam management for mmWave and THz communications towards 6G,” *IEEE Commun. Surveys Tuts.*, vol. 26, no. 3, pp. 1520–1559, 3rd Quart., 2024.

[54] C. Han, Y. Li, Y. Wang, and Z. Yu, “Still waters run deep: Extend THz coverage with non-intelligent reflecting surface,” *IEEE Wireless Commun.*, vol. 31, no. 1, pp. 41–47, Feb. 2024.

[55] Y. Mo, Y. Wu, X. Yang, F. Liu, and Y. Liao, “Review the state-of-the-art technologies of semantic segmentation based on deep learning,” *Neurocomputing*, vol. 493, pp. 626–646, Jul. 2022.

[56] Y. Deng, Y. Ni, Z. Li, S. Mu, and W. Zhang, “Toward real-time ray tracing: A survey on hardware acceleration and microarchitecture techniques,” *ACM Comput. Surveys*, vol. 50, no. 4, pp. 1–41, Jul. 2018.

[57] H. Yi et al., “Ray tracing meets terahertz: Challenges and opportunities,” *IEEE Commun. Mag.*, vol. 62, no. 2, pp. 40–46, Feb. 2024.

**作者简介（原文文末）：** Yuanbo Li 于 2020 年获哈尔滨工业大学通信工程学士学位，2025 年获上海交通大学博士学位；自 2025 年起在中兴通讯任研究员，研究兴趣包括太赫兹频段信道建模与时变信道建模。Ziming Yu 于 2005 年获江西理工大学通信学士学位，2009 年获重庆邮电大学移动通信硕士学位；2012 年加入华为技术有限公司成都无线技术实验室 2012 实验室，研究兴趣包括毫米波信道测量、探测器系统设计与信道建模、THz 信道传播建模、通感一体化信道研究。Chong Han（Senior Member, IEEE）于 2016 年获美国佐治亚理工学院电子与计算机工程博士学位，现任上海交通大学 John Wu & Jane Sun 讲席副教授、太赫兹无线通信交叉研究中心（TWC IRC）主任；自 2021 年起任职于信息科学与电子工程学院协同媒体网络创新中心（CMIC），并自 2021 年起任 IEEE ComSoc 太赫兹通信技术工作组（原特别兴趣组 SIG）联合创始人兼副主席；研究兴趣包括太赫兹与毫米波通信，曾获 2024 年 IEEE ComSoc RCC 早期成就奖、德国亚历山大·冯·洪堡基金会 Bessel 研究奖与 2023 年 IEEE ComSoc 亚太杰出青年研究者奖，并担任 IEEE TWC、IEEE JSAC 与 IEEE JSTSP 客座编辑。

**原文插图：** 原 PDF 中的图 1–17 未重传至本页，仅保留中文图注；全部原图可通过 DOI 10.1109/TWC.2026.3701744 在 IEEE Xplore 查看。

---

**本页范围与校对状态：** 本页为 IEEE TWC 2026（Vol. 25, pp. 18515–18530，16 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–V 节（含 II-A–D、III-A–F、IV-A–E 等全部小节）、结论与未来工作、全部图注（图 1–17）、表 I（逐格转录）、公式 (1)–(29)、57 条参考文献英文原条目与文末三位作者简介。原文无附录；原文首页的资助与投稿信息（NSFC 62522115、W2512007；PIMRC 2024 会议版；收稿/修回/录用日期；DOI）已录入页首“版本”段。**逐句终校未做**：表 I 已用 PDF 页面渲染逐格核对（含 Hybrid/Statistical × LoS/NLoS 四列与 σ/μ 子行），式 (1)–(3)、(12)–(16)、(19)–(26) 已对照页面渲染核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 3 处“原文疑点”为翻译时发现的原文问题：§III-A 观察编号缺“Third”；式 (3) 的 FSPL 表达式按原文排版为 $20\log_{10}(c/(4\pi fd))$（与文中 130 dB 正值及标准 Friss 公式的倒数形式不一致）；首页 arXiv 号与 PDF 不符（已在“原文信息核对”中说明）。以上均按原文照录并加注，未作数值或表述改动。

{% endraw %}
