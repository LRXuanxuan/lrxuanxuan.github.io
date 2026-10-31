---
layout: page
title: "CKM 辅助的双域跟踪与预测波束赋形｜中文全文译文"
permalink: /papers/translations/2026-07-12-2506-22796-channel-knowledge-map-assisted-dual-domain-tracking-and-predictive-bea/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/db2cce36b933a85f/) · [原文 arXiv](https://arxiv.org/abs/2506.22796) · [全部目录](/papers/catalog/)

# CKM 辅助的双域跟踪与预测波束赋形

**原题：** Channel Knowledge Map-assisted Dual-domain Tracking and Predictive Beamforming for High-Mobility Wireless Networks  
**作者：** Ruolin Du、Zhiqiang Wei（IEEE 会员）、Zai Yang（IEEE 高级会员）、Lei Yang（IEEE 高级会员）、Yong Zeng（IEEE 会士）、Derrick Wing Kwan Ng（IEEE 会士）、Jinhong Yuan（IEEE 会士）  
**单位：** Ruolin Du、Zhiqiang Wei、Zai Yang 就职于西安交通大学数学与统计学院（西安 710049，中国）；Zhiqiang Wei 同时任职于鹏城实验室（深圳 518055，中国）与琶洲实验室（广州 510555，中国，通讯作者）；Lei Yang 就职于中国科学院空间应用工程与技术中心（北京 100094，中国）；Yong Zeng 就职于东南大学移动通信国家重点实验室（南京 210096，中国）与紫金山实验室（南京 211111，中国）；Derrick Wing Kwan Ng 与 Jinhong Yuan 就职于新南威尔士大学电气工程与电信学院（Sydney, NSW 2052, Australia）。  
**版本：** arXiv:2506.22796v2（eess.SP），2026 年 1 月 10 日，原文 17 页。  
**资助说明：** 本工作部分受国家自然科学基金 U24A20214、秦创原高层次创新创业人才项目 QCYRCXM-2023-094、国家自然科学基金 12526209 与 12371464、国家自然科学基金 62571116 及江苏省杰出青年学者自然科学基金 BK20240070 资助；本文早期版本已在 IEEE ICC 2025 报告 [1]。  
**范围与状态：** 全文中文译稿：摘要、关键词、第 I–VIII 节及全部小节（含 A/B/C 子节与编号 1)、2) 子流程）、式 (1)–(29)、引理 1–2 及其证明、注 1–4、图 1–11 图注、参考文献 [1]–[53]（英文原条目）均按原文结构录入；原文无表格。逐句逐式终校未做。

## 摘要

本文提出一种面向高移动性无线网络的新型信道知识地图（channel knowledge map，CKM）辅助双域跟踪与预测波束赋形方案。其核心前提是：CKM 同时整合了坐标域与波束域，从而可在一个域中跟踪、同时把另一域的输入作为先验或测量。在坐标域（coordinate domain，C-Domain）中，采用扩展 Kalman 滤波器（extended Kalman filter，EKF）在视距（line-of-sight，LoS）存在与 LoS 缺失两种条件下跨时隙预测并跟踪移动通信接收机的状态（即位置与速度），其中 CKM 提供从多径信道参数到潜在目标位置的先验映射。在波束域（beam domain，B-Domain）中，更新后的接收机位置被反馈给 CKM，以提供到达角（angle of arrival，AoA）变化的先验信息；这些信息按每条路径的角度变化情形被纳入波束转移模型以进行有效波束跟踪。随后我们分析所考虑系统中各路径 AoA 估计的 Cramér–Rao 界（CRB），并提出一种联合预测波束赋形与功率分配设计以最小化 AoA 估计误差，直接提升多径波束跟踪精度、间接改善目标跟踪性能。仿真结果表明，与现有最优方法相比，所提方案在目标跟踪与波束跟踪两方面都取得显著改善，尤其在非视距（non-line-of-sight，NLoS）路径的 AoA 跟踪上，凸显了 CKM 在高移动性通信中同时促进目标跟踪与波束跟踪的潜在增益。

**关键词：** 跟踪、双域、信道知识地图、扩展 Kalman 滤波器、高移动性、预测波束赋形。

## I. 引言

### A. 背景

即将到来的第六代（6G）无线网络预期将实现前所未有的数据速率、更高的连接密度与更优的可靠性 [2]。6G 演进的一个关键方面是支持高移动性场景，这对涉及无人机（UAV）、地面车辆与高速列车的应用至关重要 [3], [4]。实践中，由于信道条件快速时变，加之信道矩阵在频率与空间域的扩展，这些高移动性场景给准确信道估计或预测带来了巨大挑战。估计这些动态大规模信道矩阵在计算上十分密集，且需要大量信道训练开销。因此，波束跟踪与预测波束赋形（beamforming，BF）等各种先进技术对于维持高移动性无线网络中的高质量链路至关重要，可实现系统对动态信道变化的实时自适应 [4]–[7]。此外，通信感知一体化（integrated sensing and communication，ISAC）已被确认为 6G 的六大关键应用场景之一 [8]。事实上，利用通信信号在高移动性无线网络中进行目标跟踪，不仅满足新兴定位服务需求，还能改善通信性能——尤其当移动目标同时就是通信终端时。

高移动性无线网络的关键挑战之一是跟踪移动通信终端（如车联网 V2X 中的车辆）的到达角（AoA）。多径 AoA 信息对信道重建与无线定位都必不可少。然而多径环境中的 AoA 跟踪远比视距（LoS）传播环境复杂，尤其是非视距（NLoS）路径：NLoS 路径通常经历比 LoS 路径更高的传播损耗，导致接收信号强度与 AoA 估计精度下降。此外，由车辆机动与随机障碍物出现引起的 AoA 快速变化，给多径 AoA 跟踪带来了重大挑战。同时，快速 AoA 变化使假设的波束转移模型与真实情况之间产生严重模型失配。更糟的是，随机的路径生灭或多径 AoA 的突发变化会显著降低波束转移的时间相关性，从而可能使传统波束跟踪算法失效 [9]。因此，引入额外环境信息对确保多径环境下可靠、准确的波束跟踪至关重要，然而这一潜力尚未被充分利用。

目标跟踪长期以来是雷达技术研究的基石 [6], [10]，并因 ISAC 范式的兴起而在无线通信领域重新受到关注。传统上，基于雷达的目标跟踪通常假设 LoS 传播并忽略多径效应，因为雷达常在开阔空间中、具有较大感知范围。然而 ISAC 运行在复杂传播环境（如城市）的无线基础设施上，感知范围通常限制在小区内（例如 500 米）[11]。因此在 ISAC 语境下，目标跟踪不可避免地要面对多径效应与 LoS 路径的随机缺失。遗憾的是，当 LoS 路径被遮挡时，由传播环境中散射体引起的 NLoS 路径与移动目标并不直接相关，这使其难以被显式用于目标跟踪。此时，获取全面的环境信息对 NLoS 传播环境下的有效波束跟踪与目标跟踪变得至关重要。

信道知识地图（CKM）是一种为特定区域连接环境信息与信道状态信息（CSI）的新技术 [2], [12], [13]。除有助于研究信道时间/频率相关性外，CKM 通过把地理位置映射到 CSI 而提供更多信道先验信息，从而实现更准确、更稳健的波束跟踪性能 [14]，尤其在 NLoS 传播环境中。然而仍存在挑战：发射端通常无法获得移动终端的位置信息，且如何有效融合信道时间相关性与 CKM 提供的信道先验信息仍不清晰。此外，CKM 还可被反向利用：把估计的 CSI 映射为地理先验信息，从而改善目标定位与跟踪性能。特别地，在 LoS 路径缺失时，CKM 可通过利用估计的 NLoS 路径参数提供地理先验信息，从而改善 NLoS 传播环境下的感知性能。然而在高移动性无线网络中获取准确多径信息本身就是一项挑战。因此本文旨在提出一种双域跟踪方案：同时在坐标域（C-Domain）进行目标跟踪、在波束域（B-Domain）进行波束跟踪，并通过 CKM 桥接这两个域。

在高移动性无线网络中，预测 BF 对维持一致链路质量至关重要，因为 CSI 获取与 BF 设计流程需要大量训练开销。具体地，发射端基于预测的 CSI 或多径 AoA 信息，预先设计为未来时隙优化系统通信和/或感知性能的 BF 策略。然而现有预测 BF 算法大多假设存在 LoS 路径 [15]，这在城市车联网等复杂环境中往往不成立：LoS 路径可能被高楼或其他车辆遮挡，而 NLoS 路径通常不可避免。此外，如 [7] 所分析，直接对准 LoS 路径 AoA 的 BF 在可达速率意义上并不总是最优策略，与多径信道下的最优 BF 相比性能差距接近三分之一。实际上，NLoS 传播环境中的有效预测 BF 设计可实现信道利用并提供更强的接收信号/回波功率，从而反过来改善波束跟踪性能。基于这一洞见，本文进一步设计一种为所提 CKM 辅助双域跟踪方案提供高质量测量的预测 BF 策略。

### B. 现有工作

波束跟踪在高移动性无线网络文献中已被广泛研究，不过多数现有研究依赖 LoS 主导信道模型。为缓解可高达 43.24% 的显著开销（第五代 5G 新空口网络中）[5]，研究者直接处理下行信号经移动终端反射的回波以估计其状态参数（如距离、速度、AoA 等）。例如 [6] 提出利用 AoA 时间相关性的波束跟踪算法，把单传输帧内的 AoA 变化建模为离散 Markov 过程；[16] 为简便采用"在格"（on-grid）AoA 转移模型，假设每条路径的 AoA 在若干预定角度网格点之间转移；[17] 则把波束跟踪问题表述为 Markov 决策过程，并利用强化学习框架优化相应训练波束序列，但计算代价较高。然而 [17] 采用的窄训练波束不足以跟踪高移动性场景中的快速波束变化。为此，研究者主张使用多个射频（RF）链产生多个探测波束以提升跟踪性能。另一方面，在目标跟踪方面，[18] 提出扩展 Kalman 滤波器（EKF）框架，基于回波信号测量与车辆状态演化模型跟踪车辆的位置与角度变化；[19] 提出 Bernoulli 高斯和滤波器以跟踪随机出现与消失的动态目标，尤其适用于多传感器场景；此外，无迹 Kalman 滤波器（UKF）[20] 与粒子滤波器 [21] 也被用于高移动性无线网络中的移动目标跟踪。

实践中 LoS 路径并不总是存在，无线信道中更常遇到 NLoS 路径，这给波束跟踪与目标跟踪都带来挑战（如前所述）。尽管已有少量工作研究 NLoS 传播环境下的波束与目标跟踪问题 [4], [9], [22]–[24]，但研究仍然有限。[4], [9] 采用 CKM 辅助 LoS 路径检测，通过在 LoS 路径缺失时禁用状态更新来提升目标跟踪鲁棒性；[22] 利用移动目标状态的概率密度函数缓解 NLoS 传播效应，采用 EKF 从已识别的 LoS 到达时间（TOA）测量中跟踪目标；[23] 通过多传感器信息融合联合估计目标轨迹与传感器—目标距离，提出面向 NLoS 环境的目标跟踪方案；[24] 则把深度学习（DL）应用于 NLoS 信道的 AoA 预测，但需要大量数据，且因需训练神经网络而带来昂贵计算负担。现有 NLoS 传播环境下波束跟踪方法的主要缺点包括：因高传播损耗而性能差，以及常用 NLoS 模型不切实际——后者忽略了随机障碍物导致的 NLoS 路径动态出现与消失。

预测 BF 已成为缓解频繁链路遮挡、降低高移动性通信系统中显著波束训练开销的关键策略。实践中，此类无线网络中的移动通信终端常沿固定路线（如高铁或高速公路）行驶，其位置与速度可预测，从而使预测 BF 可行。例如 [25] 提出一种带发射分集的低复杂度预测 BF 方案，与移动通信接收机预测位置相关联的 BF 向量在基站被预先计算并预存；[26] 引入利用相机图像与 DL 预测未来若干时隙最优波束索引的视觉辅助方法；[27] 基于历史 CSI 训练 DL 模型以预测未来波束图样。然而 [26]、[27] 两种方法都需要大量数据，且训练 DL 模型的计算需求很高。

一般而言，CKM 构建包含两个主要阶段：数据获取与地图生成 [12]。在数据获取阶段，位置特定的信道数据可来自基于仿真的方法（如对物理环境地图做射线追踪 [28]），或来自基于测量的方法，例如离线路测以及 3GPP 标准化的最小化路测（MDT）框架所支持的在线数据收集 [29]。在地图生成阶段，无模型插值与模型辅助学习构成重建的两大类方法 [30]–[35]。无模型方法（如 Kriging [30]、反距离加权（IDW）插值 [31]–[33] 与低秩矩阵补全 [34]）被近期文献广泛用作 CKM 生成的基本技术；模型辅助方法则把数据驱动学习与传播环境的几何模型结合以构建 CKM [35]，利用类射线追踪技术以更高精度与可扩展性推断环境特征。相比更复杂的 Kriging 或数据驱动学习方法，IDW 方法在插值精度与计算可扩展性之间提供了极佳折中，这对大规模高移动性仿真至关重要。

无线 CKM 辅助感知通过提供波束域与坐标域之间的接口扩展了设计可能性。[36] 提出 LoS 地图辅助的锚点选择方案以最小化测距的贝叶斯 Cramér–Rao 下界（BCRLB）；[37] 提出杂波角度地图（CLAM）以在目标检测前从感知信号中消除杂波相关分量，从而增强目标感知性能。据作者所知，CKM 尚未被充分用于辅助多径信道中的有效波束跟踪，而是被反向用于改善目标跟踪性能。事实上，CKM 连接 C-Domain 与 B-Domain，有望通过把一个域的信息作为另一域的测量来同时改善两个域的跟踪性能。这种整合催生了本文所提的双域跟踪方案。

### C. 本文贡献

为应对多径传播与高移动性网络带来的挑战，本文提出一种 CKM 辅助双域跟踪框架。所提方案通过对一个域的状态演化建模、并利用另一域的测量/先验信息，同时进行 C-Domain 目标跟踪与 B-Domain 波束跟踪。为进一步改善波束跟踪性能，本文提出一种预测 BF 设计，以最小化多径间的最大 AoA 估计误差。主要贡献概括如下。

- 我们提出一种 CKM 辅助双域跟踪框架，有效整合坐标域与波束域的信息。在 C-Domain 中，以目标的位置与速度作为待更新状态，B-Domain 估计的信道参数作为测量：LoS 存在时直接使用，LoS 缺失时经 CKM 间接使用。在 B-Domain 中，以接收回波作为测量、多径 AoA 作为待更新状态，并融合 C-Domain 经 CKM 提供的先验信息。该整合能通过 CKM 参考移动目标的被跟踪状态来提升 B-Domain 跟踪精度，并通过反向利用 CKM 与已跟踪的 CSI 来改善目标跟踪精度。
- 在 C-Domain 中，我们提出基于 EKF 的目标跟踪算法以预测与跟踪移动用户终端的状态，并分别针对 LoS 存在与 LoS 缺失条件定义状态演化模型与测量模型。即使 LoS 路径被遮挡，所提方法仍可通过 CKM 利用 NLoS 路径信息保持连续目标跟踪。在 B-Domain 中，我们依据波束转移情形提出一种自适应先验信息融合策略来构造波束转移概率矩阵（TPM），以辅助 B-Domain 跟踪；该策略把信道时间相关性与 CKM 提供的信道先验信息有效结合。所提方法可利用 CKM 跟踪由动态环境导致的多径 AoA 快速乃至突发变化。
- 基于预测的 AoA，我们分析每条路径 AoA 估计的 Cramér–Rao 界（CRB）以准确刻画 AoA 估计误差；随后把预测 BF 与功率分配设计表述为一个优化问题，以最小化下一时隙多径间的最大 AoA 估计误差。我们提出一种次优方法：先基于预测 AoA 选择波束，再通过求解凸优化问题设计多波束间的功率分配。
- 我们开展大量仿真以评估所提双域跟踪与预测 BF 方案的优越性能。仿真结果表明，即使在复杂高移动性无线网络中，所提方案也能实现准确且连续的目标与波束跟踪，而传统跟踪方案往往失效；此外，所提预测 BF 与功率分配设计进一步提升了 B-Domain 跟踪精度，尤其对 NLoS 路径。

本文其余部分安排如下：第 II 节介绍系统模型；第 III 节给出所提 CKM 辅助双域跟踪框架；第 IV、V 节分别描述 C-Domain 与 B-Domain 跟踪算法；第 VI 节给出预测 BF 设计；第 VII 节给出数值结果；第 VIII 节总结全文。

**符号说明：** 矩阵用大写粗体字母、向量用小写粗体字母表示；\(\operatorname{vec}(\cdot)\) 表示向量化；\((\cdot)^T\)、\((\cdot)^H\)、\((\cdot)^*\) 分别表示转置、Hermitian 转置与复共轭；\(\mathbf I_N\) 为 \(N\) 维单位矩阵；\(\mathbf 1_N\) 为 \(N\) 维全 1 向量；\(\delta(\cdot)\) 为 Dirac delta 函数；\(\mathbb C\) 表示复空间；\(\mathbb E\) 为期望算子；\(\operatorname{Var}(\cdot)\) 与 \(\operatorname{Cov}(\cdot)\) 分别表示求方差与协方差；\(\operatorname{diag}(\cdot)\) 为对角算子；\(\hat x\) 表示变量 \(x\) 的估计；\(\otimes\) 为 Kronecker 积；\(\propto\) 表示左式正比于右式；\(\mathbf x\sim\mathcal{CN}(\boldsymbol\mu,\mathbf\Sigma)\) 表示均值 \(\boldsymbol\mu\)、协方差 \(\mathbf\Sigma\) 的循环对称复高斯向量；\(\mathbf x\sim\mathcal N(\boldsymbol\mu,\mathbf\Sigma)\) 表示实值高斯向量；\(\mathbf A_{k,:}\)、\(\mathbf A_{:,l}\)、\(\mathbf A_{k,l}\) 分别表示 \(\mathbf A\) 的第 \(k\) 行、第 \(l\) 列与第 \((k,l)\) 个元素；\(l_1\) 范数、\(l_2\) 范数与 Frobenius 范数分别记为 \(\|\cdot\|_1\)、\(\|\cdot\|_2\)、\(\|\cdot\|_F\)。

## II. 系统模型

考虑图 1 所示的下行高移动性无线车联网<sup>1</sup>（脚注 1：所考虑车联网是典型高移动性网络，所提双域跟踪框架可扩展到 UAV 网络等其他高移动性无线网络）。路侧单元（roadside unit，RSU）同时作为通信发射机与感知接收机，为移动车辆提供服务。全双工 RSU 配备 \(N_t\) 根发射天线与 \(N_r\) 根接收天线，二者均为半波长间距的均匀线阵（ULA）。车辆配备 \(N_s\) 元 ULA 以接收 RSU 信号。为便于表述，假设车辆沿与 RSU 天线阵列平行的道路行驶，先靠近 RSU、随后远离<sup>2</sup>（脚注 2：为便于展示所提双域跟踪框架，本文考虑文献 [5], [7], [9], [18] 所采用的简单跟踪场景；但该框架可扩展到更复杂的跟踪场景。对非平行直线运动，车辆速度可表示为沿 x、y 轴的二维向量，只需修改 C-Domain 的状态演化模型与测量模型；对曲线轨迹，由于时隙很短，可在相邻时隙间采用恒速模型，所提框架仍适用）。在所考虑系统模型中，车辆位置表示为 \(\mathbf q=[q_x,q_y]\)，速度记为 \(v_1\)；假设速度为标量，其符号表示沿 x 轴（图 1 中水平轴）的运动方向。

假设感兴趣的最长时间为 \(T_{\max}\)，被划分为若干长度为 \(\Delta T\) 的时隙，每个时隙进一步分为 \(L\) 个符号周期。假设每时隙内信道参数保持不变 [5], [18], [38]。RSU 在一个时隙内发送的 \(N_s\) 个数据流为 \(\mathbf S=[\mathbf s_1^T;\cdots;\mathbf s_{N_s}^T]=[\mathbf x_1,\ldots,\mathbf x_L]\in\mathbb C^{N_s\times L}\)，其中 \(\mathbf s_{n_s}\in\mathbb C^{L\times 1}\)（\(n_s\in\{1,\ldots,N_s\}\)）为第 \(n_s\) 个下行数据流，\(\mathbf x_l\in\mathbb C^{N_s\times 1}\) 为第 \(l\) 个快拍的发射信号（\(\forall l\in\{1,\ldots,L\}\)）。假设 \(S_{i,j}\sim\mathcal{CN}(0,1)\)（\(\forall i,j\)）独立同分布，故 \(\mathbb E[\mathbf x_i\mathbf x_j^H]=\delta(i-j)\mathbf I_{N_s}\)（\(\forall i,j\)）。由于不同数据流相互独立，对足够大的 \(L\) 有 \(\mathbf s_{n_s}^H\mathbf s_{n_s'}\approx\delta(n_s-n_s')L\)。第 \([\eta]\) 个时隙发送的 \(N_s\) 个下行数据流记为 \(\mathbf S[\eta]=[\mathbf x_1[\eta],\ldots,\mathbf x_L[\eta]]\in\mathbb C^{N_s\times L}\)。RSU 在第 \([\eta]\) 个时隙的预编码信号为 \(\widetilde{\mathbf S}[\eta]=\mathbf F[\eta|\eta-1]\mathbf S[\eta]\in\mathbb C^{N_t\times L}\)，其中 \(\mathbf F[\eta|\eta-1]\in\mathbb C^{N_t\times N_s}\) 为预测 BF 矩阵。高移动性场景中发射端难以获得完美 CSI，因此预测 BF 矩阵 \(\mathbf F[\eta|\eta-1]\) 基于所提双域跟踪框架中的预测 CSI 设计。

假设收发机之间存在有限个散射体，RSU 接收回波由散射体与移动车辆共同反射的信号组成。第 \(\eta\) 个时隙的感知信道为

$$
\mathbf H[\eta](t,\tau)=\sum_{i=1}^{P}\beta_i[\eta]\mathbf b(\theta_i[\eta])\mathbf a^H(\theta_i[\eta])\delta(\tau-\tau_i[\eta])e^{\mathrm{j}2\pi\mu_i[\eta]t},\tag{1}
$$

其中 \(i\in\{1,\ldots,P\}\) 为路径索引<sup>3</sup>（脚注 3：LoS 存在时 path 1 为 LoS 路径、path 2 为 NLoS 路径；LoS 缺失时 path 1 变为最强 NLoS 路径），\(\beta_i[\eta]\in\mathbb C\)、\(\tau_i[\eta]\in\mathbb R\) 与 \(\mu_i[\eta]\in\mathbb R\) 分别表示第 \(\eta\) 个时隙第 \(i\) 条路径的信道路径增益、往返时延与往返 Doppler 频移。\(\mathbf a(\theta[\eta])\) 与 \(\mathbf b(\theta[\eta])\) 分别表示 RSU 发射与接收 ULA 的导向矢量：

$$
\mathbf a(\theta[\eta])=\left[1,e^{\mathrm{j}\pi\cos(\theta[\eta])},\cdots,e^{\mathrm{j}\pi(N_t-1)\cos(\theta[\eta])}\right]^T\in\mathbb C^{N_t\times 1},
$$

$$
\mathbf b(\theta[\eta])=\left[1,e^{\mathrm{j}\pi\cos(\theta[\eta])},\cdots,e^{\mathrm{j}\pi(N_r-1)\cos(\theta[\eta])}\right]^T\in\mathbb C^{N_r\times 1}.
$$

信道路径增益 \(\beta_i[\eta]\) 同时包含车辆/散射体雷达截面积（RCS）与传播损耗的影响。记 \(\theta_i[\eta]\) 为第 \(i\) 条路径相对 RSU 的角度，并假设第 \([\eta]\) 时隙第 \(i\) 条路径在 RSU 的到达角（AoA）与离开角（AoD）相同，如 [18], [38] 所常用。

本文余下部分在不引起歧义时省略时隙索引。相应地，RSU 在 \(L\) 个符号周期内收到的回波信号 \(\mathbf R\) 为

$$
\mathbf R=\sum_{i=1}^{P}\beta_i\mathbf b(\theta_i)\mathbf a^H(\theta_i)\mathbf F\mathbf S_{l_i}\boldsymbol\Lambda_{k_i}+\mathbf Z\in\mathbb C^{N_r\times[L+\max(l_i)]},\tag{2}
$$

其中 \(\mathbf S_{l_i}\triangleq[\mathbf 0_{N_s\times l_i},\mathbf S,\mathbf 0_{N_s\times[\max(l_i)-l_i]}]\in\mathbb C^{N_s\times(L+\max(l_i))}\) 表示与第 \(i\) 条路径相关的延迟信号，\(l_i=\frac{\tau_i}{T_p}\) 表示时隙内的归一化延迟索引，\(T_p=\frac{\Delta T}{L}\) 为时域采样间隔。假设延迟均为采样间隔的整数倍，且通过在每个时隙起始插入适当的时间保护间隔，相邻时隙间不存在符号间干扰 [18]。\(\boldsymbol\Lambda_{k_i}\) 为 Doppler 频移矩阵，定义为 \(\boldsymbol\Lambda_{k_i}\triangleq\operatorname{diag}(\mathbf 0_{l_i},\boldsymbol\Lambda_{\rm shift}^{k_i},\mathbf 0_{\max(l_i)-l_i})\in\mathbb C^{(L+\max(l_i))\times(L+\max(l_i))}\)，其中 \(k_i=\mu_iT_p\) 表示归一化 Doppler 频移，\(\boldsymbol\Lambda_{\rm shift}^{k_i}=\operatorname{diag}(1,\ldots,e^{\mathrm{j}2\pi k_i(L-1)})\in\mathbb C^{L\times L}\)。噪声信号记为 \(\mathbf Z\)，其每个元素服从零均值、方差 \(\sigma_z^2\) 的 i.i.d. 高斯分布，即 \(\mathbf Z_{n_r,:}\sim\mathcal{CN}(\mathbf 0,\sigma_z^2\mathbf I_{L+\max(l_i)})\)（\(\forall n_r=1,\ldots,N_r\)），\(\sigma_z^2\) 为噪声功率。

CKM 旨在为感兴趣区域提供位置特定的信道参数元组。具体地，CKM 本质上是把用户终端位置 \(\mathbf q\) 映射为位置特定信道知识（如路径增益、角度、时延与 Doppler 频移）的映射函数<sup>4</sup>（脚注 4：在 CKM 文献 [12] 中，信道 Doppler 频移可由基于位置与速度信息的 CKM 获得；实践中 Doppler 信息可在动态环境中采样，或基于静态散射环境中的采样 Doppler 推断。本文聚焦跟踪算法设计，CKM 构建不在讨论范围；所提双域跟踪方案可自然扩展到 CKM 不含 Doppler 信息的情形）[12]：

$$
\mathcal M(\mathbf q,v_1)=\left\{(\alpha_i,\theta_i,\tau_i,\mu_i)\mid i=1,\cdots,P\right\},\tag{3}
$$

其中 \(\alpha_i\in\mathbb R\) 表示第 \(i\) 条路径相对 RSU 的传播功率损耗。信道路径增益为 \(\beta_i=\varepsilon\alpha_i^2\)，\(\varepsilon\) 为所考虑用户终端的时不变反射系数 [4], [6], [18]。需要指出，实践中 CKM 由采样数据经插值技术构建（如第 I-B 节所述），因此构建的 CKM 中存储的信道参数可能略偏离真值，从而引入 CKM 构建误差。为便于后文表述，假设 CKM 中存储的路径数与 (1) 中的路径数 \(P\) 相同。实践中感兴趣时段内的路径数可能时变，且与 CKM 中存储的路径数不一致，这需要进一步研究，留作未来工作。

**图 1（原文 Fig. 1）：** 多径环境下高移动性车辆网络中的波束跟踪系统模型。

## III. CKM 辅助双域跟踪框架

在展开细节前，本节先给出所提 CKM 辅助双域跟踪框架的高层概览，如图 2 所示。该框架沿用了传统 Kalman 滤波框架 [3], [18], [39]，包含跨连续时隙的状态预测与更新步骤；不同之处在于，现有框架只在一个域内定义，而所提框架同时在波束域与坐标域中定义，并通过 CKM 互连。该双域框架旨在建立一个 CKM 辅助的跟踪框架，在 LoS 存在与 LoS 缺失两种条件下同时改善 C-Domain 与 B-Domain 的跟踪精度。具体地，C-Domain 跟踪旨在联合利用来自上一时隙的 C-Domain 先验与当前 B-Domain 测量，最大化车辆状态的后验概率（详见第 IV-D 节）；B-Domain 跟踪则旨在利用 C-Domain 状态预测与 CKM 先验信息，最大化多径 AoA 估计的后验概率（详见第 V-C 节）。预测波束赋形旨在增强 B-Domain 中的多径波束跟踪精度（详见第 VI 节），从而通过 CKM 辅助的信息交换间接改善 C-Domain 的目标跟踪精度。CKM 作为桥梁，实现两个域之间的双向信息交换：通过多径信道参数到潜在目标位置的映射为 C-Domain 目标跟踪提供先验，并通过相应的逆映射为 B-Domain 波束跟踪提供先验。

在 C-Domain 中，测量模型分 LoS 存在与 LoS 缺失两种情形处理。用索引 \(r=1,2\) 分别表示 LoS 存在与 LoS 缺失情形。对 LoS 存在情形，C-Domain 测量向量 \(\boldsymbol\beta_1[\eta]=[\tau_1[\eta],\nu_1[\eta],\cos(\theta_1[\eta])]^T\in\mathbb C^{3\times 1}\) 包含 LoS 路径的时延、Doppler 频移与 AoA 余弦；对 LoS 缺失情形，向量 \(\boldsymbol\beta_2[\eta]=[\boldsymbol\tau[\eta];\boldsymbol\mu[\eta];\cos(\boldsymbol\theta[\eta])]\in\mathbb C^{3P\times 1}\) 由全部 \(P\) 条路径的 B-Domain 估计路径参数 \(\boldsymbol\tau[\eta]\)、\(\boldsymbol\nu[\eta]\) 与 \(\boldsymbol\theta[\eta]\) 定义。另一方面，C-Domain 状态在两种情形下定义相同，由移动车辆的位置与速度组成，即 \(\boldsymbol\alpha[\eta]=[\mathbf q[\eta],v_1[\eta]]^T\in\mathbb R^{3\times 1}\)。当存在 LoS 路径时，采用利用 \(\boldsymbol\alpha[\eta]\) 与 \(\boldsymbol\beta_1[\eta]\) 之间几何关系的测量模型；否则利用连接多径参数估计与移动车辆状态的 CKM 构造测量模型（详见第 IV 节）。此外，两种情形采用相同的 C-Domain 状态演化模型，即恒速运动模型。在第 \([\eta]\) 个时隙，RSU 利用预测的车辆状态 \(\hat{\boldsymbol\alpha}[\eta|\eta-1]\) 与 C-Domain 测量 \(\boldsymbol\beta_r[\eta]\)（\(r=(1,2)\)），采用基于 EKF 的方法更新车辆状态（详见第 IV 节）；随后基于 C-Domain 状态演化模型预测第 \([\eta+1]\) 时隙的状态 \(\hat{\boldsymbol\alpha}[\eta+1|\eta]\)，用于第 \([\eta+1]\) 时隙的状态更新。

在 B-Domain 中，测量为 RSU 处的接收回波信号，状态对应多径 AoA。在时隙 \([\eta]\) 开始时，RSU 先基于预测 BF 矩阵 \(\mathbf F[\eta|\eta-1]\) 接收回波信号 \(\mathbf R[\eta]\)，并借助匹配滤波技术 [40], [41] 提取往返时延 \(\boldsymbol\tau[\eta]\in\mathbb R^{P\times 1}\) 与 Doppler 频移 \(\boldsymbol\mu[\eta]\in\mathbb R^{P\times 1}\)。注意不同传播路径具有不同的 \(\tau_i[\eta]\) 与 \(\nu_i[\eta]\)，因此 RSU 能够分离来自不同散射体的反射信号 \(\mathbf R_i[\eta]\)。对第 \(i\) 条路径，B-Domain 中的状态 \(\{\theta_i[\eta]\}_{i=1}^{P}\) 可通过融合来自上一时隙的状态预测 \(\{p(\theta_i[\eta|\eta-1])\}_{i=1}^{P}\) 与当前时隙的测量 \(\mathbf R_i[\eta]\) 来更新（详见第 V 节）。B-Domain 跟踪需要建立以波束 TPM 为特征的状态演化模型；该模型依赖信道时间相关性以及 CKM 中存储的先验信息，而后者又依赖车辆预测状态 \(\hat{\boldsymbol\alpha}[\eta+1|\eta]\)。具体地，图 2 中矩阵 \(\boldsymbol\Pi_i^{I}[\eta]\) 表示由车辆运动引起的第 \(i\) 条路径的 TPM，CKM 则基于 C-Domain 中的预测位置 \(\hat{\mathbf q}[\eta+1|\eta]\) 为每条路径生成波束 TPM \(\boldsymbol\Pi_i^{II}[\eta]\)。因此，与每条路径相关的 AoA 变化可被有效建模为离散 Markov 过程 [6]。

基于 B-Domain 状态演化模型与更新的 B-Domain 状态 \(\hat{\boldsymbol\theta}[\eta]\)，B-Domain 状态预测提供两类角度先验信息，即软预测 \(\{p(\theta_i[\eta+1|\eta])\}_{i=1}^{P}\) 与硬预测 \(\hat{\boldsymbol\theta}[\eta+1|\eta]\)：前者用于辅助 B-Domain 状态更新，后者用于设计预测波束赋形器。随后基于硬预测 \(\hat{\boldsymbol\theta}[\eta+1|\eta]\) 设计下一时隙的预测 BF 矩阵 \(\mathbf F[\eta+1|\eta]\)，以最小化多径间的最大 AoA 估计误差，该矩阵决定下一时隙的接收回波 \(\mathbf R[\eta+1]\)。通过融合软预测 \(p(\theta_i[\eta+1|\eta])\) 与第 \([\eta+1]\) 时隙的新测量 \(\mathbf R_i[\eta+1]\)，可有效更新 B-Domain 状态 \(\hat{\boldsymbol\theta}[\eta+1]\)。

此外，CKM 直接连接坐标域与波束域，并把环境感知嵌入两个域的跟踪过程。从 C-Domain 到 B-Domain，CKM 通过把车辆状态预测映射为先验 AoA 信息来增强波束跟踪性能，这对感知信噪比（SNR）较低的 NLoS 路径尤其有益；从 B-Domain 到 C-Domain，CKM 被反向用于在 LoS 缺失情形下基于多径参数测量推断车辆状态，从而在 LoS 存在与缺失两种情形下都保持连续的 C-Domain 跟踪。此外，由于 C-Domain 状态演化模型的相干时间显著超过 B-Domain 状态演化模型，C-Domain 跟踪还能利用 CKM 进一步改善 B-Domain 跟踪的连续性，尤其是在涉及随机路径生灭或多径 AoA 突发变化的场景中。然而，CKM 的不确定性与不准确性会影响所提双域跟踪的性能：在 CKM 充当 LoS 缺失情形测量模型的 C-Domain 中，这些不完美会直接降低目标状态估计精度；在 CKM 为多径 AoA 估计提供部分先验信息的 B-Domain 中，这些不完美会间接降低波束跟踪精度。

值得注意的是，多径 AoA 参数 \(\theta\) 在波束域与坐标域中的作用不同。在 B-Domain 中，它是状态，通过把回波信号 \(\mathbf R[\eta]\) 与软波束状态预测 \(\{p(\theta_i[\eta|\eta-1])\}_{i=1}^{P}\) 结合来更新；预期该先验信息可提升波束状态更新精度，尤其在低 SNR 场景中。在 C-Domain 中，\(\theta\) 被视为测量而非状态，用于更新车辆状态。

在一个时隙内，所提双域跟踪方案交替更新两个域中定义的状态，并借助 CKM 促进域间信息交换；跨时隙时仍遵循传统 Kalman 滤波框架，在两个域中分别执行状态预测以为下一时隙的状态更新提供先验。与传统雷达领域被动跟踪方法不同，ISAC 提供了根据多径预测 AoA 设计下一时隙感知信号的额外自由度，因此基于 B-Domain 状态预测的预测 BF 设计对提升所提双域跟踪性能至关重要。

**注 1：** 所提双域框架可自然扩展到时延、Doppler 频移等其他信道参数的联合跟踪。具体地，B-Domain 状态向量可扩展为在 AoA 之外还包含每条路径的时延与 Doppler 频移；此时可通过构造与 AoA 参数类似的 TPM 来建模时间状态演化，并需建立编码多信道参数联合分布的高维 CKM。但该扩展的代价是 B-Domain 跟踪计算复杂度增加。

**图 2（原文 Fig. 2）：** CKM 辅助双域跟踪框架。

## IV. CKM 辅助的 C-Domain 跟踪

本节提出一种 CKM 辅助的坐标域 EKF 跟踪方案，适用于 LoS 存在与 LoS 缺失两种情形。所提 C-Domain 跟踪方案需要识别 LoS 是否存在，该问题已在 [4], [9] 中研究。

### A. C-Domain 状态演化模型

考虑移动车辆在最长感兴趣时间内的恒速运动模型 [18]，C-Domain 状态演化模型为 \(\boldsymbol\alpha[\eta+1]=\mathbf E\boldsymbol\alpha[\eta]+\mathbf w_\alpha[\eta+1]\)，其中 \(\mathbf E=[1,0,\Delta T;0,1,0;0,0,1]^T\in\mathbb R^{3\times 3}\) 为状态转移矩阵，\(\mathbf w_\alpha[\eta+1]=[w_{q_x}[\eta+1],w_{q_y}[\eta+1],w_v[\eta+1]]^T\) 表示状态演化噪声。假设各状态演化噪声相互独立 [3], [18]，则 \(\mathbf w_\alpha[\eta+1]\sim\mathcal N(\mathbf 0,\mathbf Q_\alpha)\)，\(\mathbf Q_\alpha=\operatorname{diag}\{\sigma_{q_x}^2,\sigma_{q_y}^2,\sigma_v^2\}\)，可由 RSU 通过长期测量获得。

### B. LoS 存在时的 C-Domain 测量模型

若第 \([\eta]\) 个时隙存在 LoS 路径，C-Domain 测量由 LoS 路径的 AoA、时延与 Doppler 频移组成（以下标 "1" 标记）。基于图 1 所示几何关系，C-Domain 测量模型为

$$
\begin{cases}\tau_1[\eta]=\dfrac{2\|\mathbf q[\eta]\|_2}{c}+w_\tau[\eta]\in\mathbb R,\\[2mm]\mu_1[\eta]=-\dfrac{2v_1[\eta]q_y[\eta]f_c}{c\|\mathbf q[\eta]\|_2}+w_\mu[\eta]\in\mathbb R,\\[2mm]\cos(\theta_1[\eta])=\dfrac{q_x[\eta]}{\|\mathbf q[\eta]\|_2}+w_{\cos\theta}[\eta]\in(-1,1),\end{cases}\tag{4}
$$

其中 \(c\) 为光速、\(f_c\) 为信号载频；高斯随机变量 \(w_\tau[\eta]\)、\(w_\mu[\eta]\)、\(w_{\cos\theta}[\eta]\) 表示相应测量噪声，均值为零、方差分别为 \(\sigma_\tau^2\)、\(\sigma_\mu^2\)、\(\sigma_{\cos\theta}^2\)。把全部 C-Domain 可观测参数收集为向量 \(\boldsymbol\beta_1[\eta]=[\tau_1[\eta],\mu_1[\eta],\cos(\theta_1[\eta])]^T\in\mathbb R^{3\times 1}\)，测量模型为

$$
\boldsymbol\beta_1[\eta]=\mathbf g_1(\boldsymbol\alpha[\eta])+\mathbf w_{\boldsymbol\beta_1}[\eta],\tag{5}
$$

其中 \(\mathbf w_{\boldsymbol\beta_1}[\eta]=[w_\tau[\eta],w_\mu[\eta],w_{\cos\theta}[\eta]]^T\sim\mathcal N(\mathbf 0,\mathbf Q_{\boldsymbol\beta_1})\)、\(\mathbf Q_{\boldsymbol\beta_1}=\operatorname{diag}\{\sigma_\tau^2,\sigma_\mu^2,\sigma_{\cos\theta}^2\}\)；非线性测量函数 \(\mathbf g_1(\cdot):\mathbb R^{3\times 1}\to\mathbb R^{3\times 1}\) 由 (4) 定义。

### C. LoS 缺失时的 C-Domain 测量模型

实践中 LoS 路径可能被周边建筑或相邻车道的较大散射体遮挡。LoS 缺失时，C-Domain 测量向量为 \(\boldsymbol\beta_2[\eta]=[\boldsymbol\tau[\eta];\boldsymbol\mu[\eta];\cos(\boldsymbol\theta[\eta])]\in\mathbb C^{3P\times 1}\)，其中 \(\boldsymbol\tau[\eta]=[\tau_1[\eta],\ldots,\tau_P[\eta]]^T\)、\(\boldsymbol\mu[\eta]=[\mu_1[\eta],\ldots,\mu_P[\eta]]^T\)、\(\cos(\boldsymbol\theta[\eta])=[\cos(\theta_1[\eta]),\ldots,\cos(\theta_P[\eta])]^T\)。LoS 缺失时，所测 NLoS 路径参数与车辆状态并不直接相关。幸运的是，CKM 提供了位置特定的信道参数，把车辆位置与速度映射为路径时延、Doppler 频移与角度信息。因此 CKM 本身提供了一个测量函数，记为 \(\mathbf g_2(\cdot):\mathbb R^{3\times 1}\to\mathbb R^{3P\times 1}\)，把状态向量 \(\boldsymbol\alpha[\eta]\) 映射为测量向量 \(\boldsymbol\beta_2[\eta]\)。换言之，测量模型为

$$
\boldsymbol\beta_2[\eta]=\mathbf g_2(\boldsymbol\alpha[\eta])+\mathbf w_{\boldsymbol\beta_2}[\eta],\tag{6}
$$

其中 \(\mathbf w_{\boldsymbol\beta_2}[\eta]\sim\mathcal N(\mathbf 0,\mathbf Q_{\boldsymbol\beta_2})\in\mathbb R^{3P\times 1}\) 为测量噪声向量，LoS 缺失情形相应测量噪声协方差矩阵假设<sup>5</sup>（脚注 5：本文假设 (5) 与 (6) 中同类型信道参数估计具有相同测量噪声方差，因为 CKM 中存储的信道参数同样来自长期信道测量 [12]）为 \(\mathbf Q_{\boldsymbol\beta_2}=\operatorname{diag}\{\sigma_\tau^2\mathbf I_P,\sigma_\mu^2\mathbf I_P,\sigma_{\cos\theta}^2\mathbf I_P\}\)。如文献 [9], [18] 所常用，我们假设 C-Domain 测量估计误差服从高斯分布，这是 EKF 框架的要求。实践中 \(\sigma_\tau^2\)、\(\sigma_{\cos\theta}^2\) 与 \(\sigma_{\cos\theta}^2\) 取决于天线孔径、带宽、帧长乃至 BF 策略；路径参数估计误差与上述资源的关系具体由参数估计方法决定。为简单起见，本文在所采用的 C-Domain 中假设固定测量噪声方差。

### D. 基于 EKF 的 C-Domain 跟踪

由于 LoS 存在情形 (5) 与 LoS 缺失情形 (6) 的测量模型均为非线性，我们采用 EKF [42] 在 C-Domain 中跟踪车辆状态。在时隙 \(\eta\)，假设已知在 \(\eta\) 时隙估计的状态向量 \(\boldsymbol\alpha[\eta]\in\mathbb R^{3\times 1}\)，对 \([\eta+1]\) 时隙的状态预测为

$$
\hat{\boldsymbol\alpha}[\eta+1|\eta]=\mathbf E\hat{\boldsymbol\alpha}[\eta],\tag{7}
$$

预测协方差矩阵 \(\mathbf C_r[\eta+1|\eta]\in\mathbb R^{3\times 3}\)（\(r=1,2\)）为 \(\mathbf C_r[\eta+1|\eta]=\mathbf E\mathbf C_r[\eta]\mathbf E^T+\mathbf Q_\alpha\)，其中 \(\mathbf C_r[\eta]\) 为第 \([\eta]\) 时隙 C-Domain 状态更新的后验协方差矩阵。

**1）LoS 存在情形。** 为在第 \([\eta]\) 时隙更新状态，EKF 在预测状态附近采用线性化测量模型<sup>6</sup>（脚注 6：本文记号中只有状态预测与状态更新带帽号（如 \(\hat{\boldsymbol\alpha}[\eta|\eta-1]\) 与 \(\hat{\boldsymbol\alpha}[\eta]\)），其他变量（如测量 \(\boldsymbol\beta[\eta|\eta-1]\) 与 \(\boldsymbol\beta[\eta]\)）不带帽号）。具体地，有 \(\boldsymbol\beta_1[\eta]\approx\mathbf g_1(\hat{\boldsymbol\alpha}[\eta|\eta-1])+\mathbf G_1(\boldsymbol\alpha[\eta]-\hat{\boldsymbol\alpha}[\eta|\eta-1])+\mathbf w_{\boldsymbol\beta_1}[\eta]\)，其中 \(\hat{\boldsymbol\alpha}[\eta|\eta-1]\) 为 \([\eta-1]\) 时隙预测的 C-Domain 状态，\(\mathbf G_1\in\mathbb R^{3\times 3}\) 为 \(\mathbf g_1\) 关于状态向量的 Jacobian 矩阵：

$$
\mathbf G_1=\left.\frac{\partial\mathbf g_1}{\partial\boldsymbol\alpha}\right|_{\hat{\boldsymbol\alpha}[\eta|\eta-1]}
=\begin{bmatrix}\frac{\partial\tau_1[\eta]}{\partial q_x[\eta]}&\frac{\partial\tau_1[\eta]}{\partial q_y[\eta]}&0\\[2mm]\frac{\partial\mu_1[\eta]}{\partial q_x[\eta]}&\frac{\partial\mu_1[\eta]}{\partial q_y[\eta]}&\frac{\partial\mu_1[\eta]}{\partial v_1[\eta]}\\[2mm]\frac{\partial\cos(\theta_1[\eta])}{\partial q_x[\eta]}&\frac{\partial\cos(\theta_1[\eta])}{\partial q_y[\eta]}&0\end{bmatrix}_{\hat{\boldsymbol\alpha}[\eta|\eta-1]}
$$
$$
=\left.\begin{bmatrix}\frac{2q_x[\eta]}{c\|\mathbf q[\eta]\|_2}&\frac{2q_y[\eta]}{c\|\mathbf q[\eta]\|_2}&0\\[2mm]-\frac{2v_1[\eta]f_cq_y[\eta]q_x[\eta]}{c\|\mathbf q[\eta]\|_2^3}&\frac{2f_cv_1[\eta](q_x[\eta])^2}{c\|\mathbf q[\eta]\|_2^3}&-\frac{2q_y[\eta]f_c}{c\|\mathbf q[\eta]\|_2}\\[2mm]\frac{q_y[\eta]^2}{\|\mathbf q[\eta]\|_2^3}&-\frac{q_x[\eta]q_y[\eta]}{\|\mathbf q[\eta]\|_2^3}&0\end{bmatrix}\right|_{\hat{\boldsymbol\alpha}[\eta|\eta-1]}.\tag{8}
$$

把状态预测 \(\hat{\boldsymbol\alpha}[\eta|\eta-1]\) 代入上式即得 \(\mathbf G_1\)。

**2）LoS 缺失情形。** 在 LoS 缺失情形下，(6) 中利用 CKM 的测量函数 \(\mathbf g_2(\cdot)\) 相当于提供一张基于车辆位置获取多径参数测量的查找表。为更新车辆状态，可建立线性化测量模型：

$$
\boldsymbol\beta_2[\eta]\approx\mathbf g_2(\hat{\boldsymbol\alpha}[\eta|\eta-1])+\mathbf G_2(\boldsymbol\alpha[\eta]-\hat{\boldsymbol\alpha}[\eta|\eta-1])+\mathbf w_{\boldsymbol\beta_2}[\eta],\tag{9}
$$

其中 \(\mathbf g_2(\hat{\boldsymbol\alpha}[\eta|\eta-1])\in\mathbb R^{3P\times 1}\) 可基于预测车辆状态查询 CKM 得到。在 LoS 缺失情形下，由于多径传播，NLoS 路径的 AoA 可能随车辆微小移动而显著变化，因此需要高空间分辨率的 CKM 才能捕捉这种角度变化。Jacobian 矩阵 \(\mathbf G_2\) 表示测量函数 \(\mathbf g_2(\cdot)\) 关于 C-Domain 状态向量的偏导数，按如下方式数值计算：

$$
\mathbf G_2=\left.\frac{\partial\mathbf g_2}{\partial\boldsymbol\alpha}\right|_{\hat{\boldsymbol\alpha}[\eta|\eta-1]}
=\left.\left[\frac{\partial\mathbf g_2}{\partial q_x},\frac{\partial\mathbf g_2}{\partial q_y},\frac{\partial\mathbf g_2}{\partial v_1}\right]\right|_{\hat{\boldsymbol\alpha}[\eta|\eta-1]},\tag{10}
$$

其中 \(\frac{\partial\mathbf g_2}{\partial q_x}=[\mathbf g_2(q_x[\eta]+\Delta q_x,q_y[\eta],v_1[\eta])-\mathbf g_2(\boldsymbol\alpha[\eta])]/\Delta q_x\)、\(\frac{\partial\mathbf g_2}{\partial q_y}=[\mathbf g_2(q_x[\eta],q_y[\eta]+\Delta q_y,v_1[\eta])-\mathbf g_2(\boldsymbol\alpha[\eta])]/\Delta q_y\)、\(\frac{\partial\mathbf g_2}{\partial v_1}=[\mathbf g_2(q_x[\eta],q_y[\eta],v_1[\eta]+\Delta v_1)-\mathbf g_2(\boldsymbol\alpha[\eta])]/\Delta v_1\)，\(\Delta q_x\)、\(\Delta q_y\) 与 \(\Delta v_1\) 表示 C-Domain 状态的小扰动。注意 \(\mathbf G_2\) 的每个元素量化多径参数随 C-Domain 状态向量的变化。

遵循标准 EKF 框架 [18]，所提 C-Domain 跟踪在 LoS 存在（\(r=1\)）与 LoS 缺失（\(r=2\)）两种情形下的流程如下：(1) 线性化：\(\boldsymbol\beta_r[\eta]\approx\mathbf g_r(\hat{\boldsymbol\alpha}[\eta|\eta-1])+\mathbf G_r(\boldsymbol\alpha[\eta]-\hat{\boldsymbol\alpha}[\eta|\eta-1])+\mathbf w_{\boldsymbol\beta_r}[\eta]\)；(2) Kalman 增益矩阵：\(\mathbf K_r=\mathbf C_r[\eta|\eta-1]\mathbf G_r^T(\mathbf G_r\mathbf C_r[\eta|\eta-1]\mathbf G_r^T+\mathbf Q_{\boldsymbol\beta_r})^{-1}\)；(3) 状态更新：\(\hat{\boldsymbol\alpha}[\eta]=\hat{\boldsymbol\alpha}[\eta|\eta-1]+\mathbf K_r(\boldsymbol\beta_r[\eta]-\mathbf g_r(\hat{\boldsymbol\alpha}[\eta|\eta-1]))\)；(4) 后验协方差矩阵：\(\mathbf C_r[\eta]=(\mathbf I_3-\mathbf K_r\mathbf G_r)\mathbf C_r[\eta|\eta-1]\)；(5) 状态预测：\(\hat{\boldsymbol\alpha}[\eta+1|\eta]=\mathbf E\hat{\boldsymbol\alpha}[\eta]\)；(6) 预测协方差矩阵：\(\mathbf C_r[\eta+1|\eta]=\mathbf E\mathbf C_r[\eta]\mathbf E^T+\mathbf Q_\alpha\)。关于 EKF 的更多细节，感兴趣的读者可参阅 [3], [9], [18], [39]。注意 \(\boldsymbol\beta_r[\eta]\) 总是由接收信号获得；在 LoS 缺失情形下，测量模型以 CKM 为特征，CKM 提供从目标状态到多径参数的数值映射，从而确保连续、稳定的状态更新。所提 EKF 方案的计算复杂度在 LoS 存在情形下为常数级 \(\mathcal O(1)\)，而在 LoS 缺失情形下因 Kalman 增益计算需对 \(3P\times 3P\) 矩阵求逆而增至 \(\mathcal O(P^3)\)。

## V. CKM 辅助的 B-Domain 跟踪

### A. B-Domain 状态演化模型

与 [43], [6] 类似，定义角度网格 \(\boldsymbol\Theta\triangleq\{\tilde\theta_\kappa=\frac{\pi(\kappa-1)}{N_\theta}\}_{\kappa=1}^{N_\theta}\)，以 \(N_\theta\) 个等分段覆盖整个角度空间 \([0,\pi)\)。B-Domain 状态演化模型定义为离散 Markov 过程，即

$$
p(\boldsymbol\theta_i[\eta+1|\eta])=p(\boldsymbol\theta_i[\eta])\boldsymbol\Pi_i[\eta]\in[0,1]^{1\times N_\theta},\tag{11}
$$

其中 \(\boldsymbol\Pi_i[\eta]\in\mathbb R^{N_\theta\times N_\theta}\) 表示第 \([\eta]\) 时隙第 \(i\) 条路径 AoA 的 TPM，\(p(\boldsymbol\theta_i[\eta])\) 与 \(p(\boldsymbol\theta_i[\eta+1|\eta])\) 分别表示第 \(i\) 条路径在第 \([\eta]\) 时隙的 AoA 概率质量函数（PMF）与第 \([\eta+1]\) 时隙的预测 PMF。第 \([\eta]\) 时隙第 \(i\) 条路径 TPM 的 \((\kappa,\iota)\) 元素为 \(\boldsymbol\Pi_i[\eta]_{\kappa,\iota}=\Pr\{\theta_i[\eta+1]=\tilde\theta_\iota\mid\theta_i[\eta]=\tilde\theta_\kappa\}\)（\(\forall\kappa,\iota\in\{1,\ldots,N_\theta\}\)）。显然 TPM 应满足：(1) \(0\le\boldsymbol\Pi_i[\eta]_{\kappa,\iota}\le1\)（\(\forall\kappa,\iota\)）；(2) 每行之和为 1，即 \(\|\boldsymbol\Pi_i[\eta]_{\kappa,:}\|_1=1\)（\(\forall\kappa\)）。

信道时间相关性与 CKM 都提供关于波束转移的先验信息，因此都影响 TPM。我们把这两个来源的融合建模为 TPM 的凸组合，且如 [44], [45] 所建立，该凸组合在数学上仍然有效。于是第 \([\eta]\) 时隙第 \(i\) 条路径的角度 TPM 建模为

$$
\boldsymbol\Pi_i[\eta]=\left(1-c_{\Pi_i}[\eta]\right)\cdot\boldsymbol\Pi_i^{I}[\eta]+c_{\Pi_i}[\eta]\cdot\boldsymbol\Pi_i^{II}[\eta],\tag{12}
$$

其中 \(\boldsymbol\Pi_i^{I}[\eta]\) 表示由信道时间相关性引起的 TPM，\(\boldsymbol\Pi_i^{II}[\eta]\) 表示利用 CKM 提供的信道先验信息设计的 TPM。实常数 \(c_{\Pi_i}[\eta]\in[0,1]\) 为选择 CKM 所提供的转移机制 \(\boldsymbol\Pi_i^{II}[\eta]\) 的概率，\((1-c_{\Pi_i}[\eta])\) 则对应选择由信道时间相关性提供的转移机制 \(\boldsymbol\Pi_i^{I}[\eta]\) 的概率。\(c_{\Pi_i}[\eta]\) 的取值取决于波束转移情形、接收回波 SNR、目标车辆相对 RSU 的水平速度以及所构建 CKM 的质量。

如前所述，即使在高移动性无线网络中，只要不存在路径的随机生灭，相邻两时隙间第 \(i\) 条路径的 AoA 应保持接近。参照 [43], [46]，第 \([\eta]\) 时隙某路径 \(\boldsymbol\Pi_i^{I}\) 的 \((\kappa,\iota)\) 元素为

$$
\left\{\boldsymbol\Pi_i^{I}[\eta]\right\}_{\kappa,\iota}=\begin{cases}\zeta\xi^{|\kappa-\iota|},&\text{若 }|\kappa-\iota|\le\epsilon,\\0,&\text{否则},\end{cases}\tag{13}
$$

其中 \(\forall i\in\{1,\ldots,P\}\)。参数 \(\xi\in[0,1]\) 刻画角度随时间的变化速度：\(\xi\to0\) 表示几乎不变，\(\xi\to1\) 表示变化显著。变量 \(\epsilon\) 表示 AoA 变化的边界，\(\zeta\) 为归一化系数（如 [6], [17]）。\(\xi\) 与 \(\epsilon\) 都依赖车辆相对 RSU 的速度，即 \(\sin(\hat\theta_1[\eta+1|\eta])\hat v_1[\eta+1|\eta]\)。另一方面，第 \([\eta]\) 时隙 \(\boldsymbol\Pi_i^{II}\) 的 \((\kappa,\iota)\) 元素为

$$
\left\{\boldsymbol\Pi_i^{II}[\eta]\right\}_{\kappa,\iota}=\varsigma\exp\left(-\frac{\left(\hat\theta_i[\eta+1|\eta]-\tilde\theta_\iota\right)^2}{2\sigma_{\rm CKM}^2}\right),\quad\forall\kappa,\tag{14}
$$

其中 \(\varsigma=1/\left(\sum_{\iota=1}^{N_\theta}\exp\left(-\frac{(\hat\theta_i[\eta+1|\eta]-\tilde\theta_\iota)^2}{2\sigma_{\rm CKM}^2}\right)\right)\) 为归一化系数，\(\hat\theta_i[\eta+1|\eta]\) 为 CKM 在 (3) 中基于 (7) 的预测车辆状态 \(\hat{\boldsymbol\alpha}[\eta+1|\eta]\) 所提供的第 \(i\) 条路径预测 AoA，\(\tilde\theta_\iota=\frac{\pi(\iota-1)}{N_\theta}\) 为网格 \(\boldsymbol\Theta\) 上第 \(\iota\) 个角度，\(\sigma_{\rm CKM}^2\) 作为波束转移方差，计入角度测量噪声与 CKM 不确定性。图 3 给出 \(\boldsymbol\Pi_i\)、\(\boldsymbol\Pi_i^{I}\) 与 \(\boldsymbol\Pi_i^{II}\) 的典型示例。

此外，B-Domain 状态演化模型应取决于波束转移情形。图 4 展示两条路径的角度随时间变化，其中 path 1 为 LoS 路径、path 2 为 NLoS 路径。在感兴趣时间内，波束转移情形可依据以下三类角度变化确定：

- **平稳转移（I）：** 此时由于 AoA 的时间相关变化以及 CKM 在车辆位置与 AoA 之间的映射，\(\boldsymbol\Pi_i^{I}\) 与 \(\boldsymbol\Pi_i^{II}\) 均可用，\(c_{\Pi_i}\in(0,1)\)。在接收回波 SNR 较低或目标车辆相对 RSU 水平速度较高时，倾向于较大的 \(c_{\Pi_i}\)——此时较弱的时间相关性或不可靠测量需要更依赖 CKM 先验；反之，所构建 CKM 质量较低时则转向依赖时间相关性，使 \(c_{\Pi_i}\) 较小。
- **非平稳但可预测转移（II）：** 由于环境中已被 CKM 记录的固定散射体，角度可能突变（图中黄色箭头所示）。此时角度转移不具时间相关性，\(\boldsymbol\Pi_i^{I}\) 无法利用；所幸 CKM 已存储该波束转移，故基于 \(\boldsymbol\Pi_i^{II}\) 角度转移仍可预测，此时 \(c_{\Pi_i}=1\)。
- **非平稳且不可预测转移（III）：** 由环境中随机出现的散射体/障碍物引起随机遮挡（图中红色星号所示）。此时 AoA 预测不可能、也无先验信息可用，可采用均匀分布，即 \(p(\boldsymbol\theta_i[\eta+1|\eta])=\frac{1}{N_\theta}\cdot\mathbf 1_{N_\theta}\)。

LoS 路径遮挡的假设检验已在 [4], [9] 中提出以改善目标跟踪性能。类似地，基于相邻时隙间估计的时延与 Doppler 频移，RSU 可确定每条路径的波束转移情形。本文为简单起见假设角度变化模型各类情形的假设检验是完美的，这便于在所提双域跟踪与预测波束赋形框架中建立 B-Domain 状态演化模型。

### B. B-Domain 测量模型

收到反射回波后，RSU 可计算接收信号 \(\mathbf R\) 与发射信号 \(\widetilde{\mathbf S}\) 之间的互模糊函数（CAF）[40] 以估计多径时延与 Doppler 频移。遵循 (2)，当 \(\tau\) 与 \(\mu\) 分别完美对齐第 \(i\) 条路径的时延与 Doppler 频移时，匹配滤波输出出现峰值，即 \(\{\hat l_i,\hat k_i\}=\arg\max_{l_i,k_i}\|\mathbf R\boldsymbol\Lambda_{k_i}^H\mathbf S_{l_i}^H\|_F^2\)（\(i=1,\ldots,P\)）。

**引理 1：** 假设 \(L\to\infty\) 且 \(\frac{1}{T_p}\to\infty\)，在获得完美时延与 Doppler 频移估计后，与第 \(i\) 条路径相关的接收信号 \(\mathbf R_i\) 可被分离，且为

$$
\mathbf R_i\approx L\beta_i\mathbf b(\theta_i)\mathbf a^H(\theta_i)\mathbf F+\mathbf Z\boldsymbol\Lambda_{k_i}^H\mathbf S_{l_i}^H\in\mathbb C^{N_r\times N_s},\tag{15}
$$

对任意 \(i=1,\cdots,P\) 成立。

**证明：** 把 (2) 代入匹配滤波后的接收信号：

$$
\mathbf R_i=\underbrace{\sum_{j=1}^{P}\beta_j\mathbf b(\theta_j)\mathbf a^H(\theta_j)\mathbf F\mathbf S_{l_j}\boldsymbol\Lambda_{k_j}\boldsymbol\Lambda_{k_i}^H\mathbf S_{l_i}^H}_{\text{信号与干扰：}\mathbf R_i'}+\underbrace{\mathbf Z\boldsymbol\Lambda_{k_i}^H\mathbf S_{l_i}^H}_{\text{噪声：}\mathbf R_i''}.\tag{16}
$$

为便于推导，不失一般性假设 \(l_j\le l_i\)（\(\forall j<i\)）。\(\mathbf R_i'\) 可简化为

$$
\mathbf R_i'=\beta_i\mathbf b(\theta_i)\mathbf a^H(\theta_i)\mathbf F\mathbf S\mathbf S^H+\sum_{j\ne i}\beta_j\mathbf b(\theta_j)\mathbf a^H(\theta_j)\mathbf F\mathbf S_{l_j}\operatorname{diag}\left(\mathbf 0_{l_i},\boldsymbol\Lambda_{ji},\mathbf 0_{[\max(l_j)-l_j]}\right)\mathbf S_{l_i}^H,\tag{17}
$$

其中 \(\boldsymbol\Lambda_{ji}\triangleq\{\boldsymbol\Lambda_{\rm shift}^{k_i}\}_{(l_i-l_j+1):L,(l_i-l_j+1):L}\{\boldsymbol\Lambda_{\rm shift}^{k_i}\}_{1:(L-l_i+l_j),1:(L-l_i+l_j)}^H\)。由此可得

$$
\mathbf R_i'=\beta_i\mathbf b(\theta_i)\mathbf a^H(\theta_i)\mathbf F\mathbf S\mathbf S^H+\sum_{j\ne i}\beta_j\mathbf b(\theta_j)\mathbf a^H(\theta_j)\mathbf F\left(\sum_{l=l_i+1}^{L+l_j}\mathbf x_{L-l_j}\mathbf x_{L-l_i}^H\{\boldsymbol\Lambda_{ji}\}_{l,l}\right)\approx L\beta_i\mathbf b(\theta_i)\mathbf a^H(\theta_i)\mathbf F.\tag{18}
$$

因此对任意 \(i=1,\cdots,P\)，由 \(\mathbf R_i\approx L\beta_i\mathbf b(\theta_i)\mathbf a^H(\theta_i)\mathbf F+\mathbf Z\boldsymbol\Lambda_{k_i}^H\mathbf S_{l_i}^H\in\mathbb C^{N_r\times N_s}\) 即得 \(\mathbf R_i\)。

引理 1 使 RSU 能够利用估计的时延与 Doppler 频移分离来自不同路径的接收信号以进行 AoA 估计。根据 (15)，第 \(i\) 条路径相关的接收信号可改写为 \(\mathbf r_i\triangleq\operatorname{vec}(\mathbf R_i)=L\beta_i(\mathbf F^T\otimes\mathbf b(\theta_i))\mathbf a^*(\theta_i)+(\mathbf S_{l_i}^*\otimes\mathbf Z)\operatorname{vec}(\boldsymbol\Lambda_{k_i}^H)\in\mathbb C^{N_sN_r\times 1}\)。

**引理 2：** 给定第 \(i\) 条路径的 AoA \(\theta_i\)，\(\mathbf r_i\) 为复多元高斯随机变量，\(\mathbf r_i\sim\mathcal{CN}(L\beta_i(\mathbf F^T\otimes\mathbf b(\theta_i))\mathbf a^*(\theta_i),\sigma_z^2L\mathbf I_{N_sN_r})\)。

**证明：** 显然 \(\mathbf r_i\) 的均值为 \(\mathbb E\{\mathbf r_i\}=L\beta_i(\mathbf F^T\otimes\mathbf b(\theta_i))\mathbf a^*(\theta_i)\)。接着推导 \(\mathbf r_i\) 的协方差矩阵。考虑一个 \(N_r\) 维向量 \(\tilde{\mathbf z}_n\)，定义为 \(\tilde{\mathbf z}_n=\mathbf Z_{:,(l_i+1):(l_i+L)}\mathbf D_n^{H,:}\)，其中 \(\mathbf Z_{:,(l_i+1):(l_i+L)}\in\mathbb C^{N_r\times L}\)、\(\mathbf D=\mathbf S\boldsymbol\Lambda_{\rm shift}^{k_i}\in\mathbb C^{N_s\times L}\)。于是

$$
\{\tilde{\mathbf z}_n\}_m=\mathbf Z_{m,(l_i+1):(l_i+L)}\mathbf D_{n,:}^H=\sum_{l=1}^{L}Z_{m,(l_i+l)}S_{n,l}^*e^{-\mathrm{j}2\pi\mu_ilT_p},\tag{19}
$$

其方差为 \(\sigma^2(\{\tilde{\mathbf z}_n\}_m)=\sigma_z^2\sum_{l=1}^{L}|S_{n,l}^*e^{-\mathrm{j}2\pi\mu_ilT_p}|^2=\sigma_z^2L\)。鉴于 \(Z_{m,(l_i+l)}\) 与 \(Z_{m',(l_i+l')}\) 独立同分布，即 \(\mathbb E\{Z_{m,(l_i+l)}Z_{m',(l_i+l')}^*\}=\delta(m-m')\)，只需证明 \(\{\tilde{\mathbf z}_n\}_m\) 独立同分布：

$$
\mathbb E\left\{\{\tilde{\mathbf z}_n\}_m\{\tilde{\mathbf z}_{n'}\}_{m'}^*\right\}=\sum_{l=1}^{L}\sum_{l'=1}^{L}\mathbb E\left\{Z_{m,(l_i+l)}Z_{m',(l_i+l')}^*\right\}S_{n,l}^*e^{-\mathrm{j}2\pi\mu_ilT_p}S_{n',l'}e^{\mathrm{j}2\pi\mu_il'T_p}=\sum_{l=1}^{L}\sum_{l'=1}^{L}\delta(m-m')\delta(l-l')=\delta(m-m')\delta(n-n').\tag{20}
$$

基于引理 2，可得 \(\theta_i\) 的似然函数为

$$
p(\mathbf r_i|\theta_i)=\frac{1}{(L\pi\sigma_z^2)^{N_sN_r}}\exp\left\{-\frac{1}{2\sigma_z^2}\bar{\mathbf r}_i^H\bar{\mathbf r}_i\right\},\tag{21}
$$

其中 \(\bar{\mathbf r}_i=\mathbf r_i-L\beta_i(\mathbf F^T\otimes\mathbf b(\theta_i))\mathbf a^*(\theta_i)\)。

### C. B-Domain 跟踪

B-Domain 跟踪同样包含两个部分：B-Domain 状态预测与状态更新，其中状态预测分为硬预测与软预测。在时隙 \(\eta\) 中，B-Domain 软状态预测已在 (11) 中定义；硬状态预测为

$$
\hat\theta_i[\eta+1|\eta]=\arg\max\Pr\left(\theta_i[\eta+1|\eta]\right).\tag{22}
$$

基于 \([\eta-1]\) 时隙的 B-Domain 软状态预测 \(p(\theta_i[\eta|\eta-1])\) 与 (15) 中的新测量 \(\mathbf R_i[\eta]\)，可利用最大后验（MAP）准则更新第 \([\eta]\) 时隙第 \(i\) 条路径的 AoA，即

$$
\hat\theta_i[\eta]=\max_{\theta_i[\eta]}p(\theta_i[\eta]|\mathbf R_i[\eta])\propto\max_{\theta_i[\eta]}p(\mathbf r_i[\eta]|\theta_i[\eta])p(\theta_i[\eta|\eta-1]),\tag{23}
$$

其中对非平稳且不可预测转移（III）情形，\(p(\theta_i[\eta|\eta-1])=\frac{1}{N_\theta}\)，(23) 退化为最大似然估计。AoA 估计已在信号处理与无线通信领域被广泛研究，已有多种成熟算法可求解 (23)，如子空间方法 [47] 与压缩感知技术 [48]。本文更关注双域跟踪框架，且 (23) 只涉及一个角度参数，故简单地采用穷举搜索求解。

## VI. CKM 辅助的预测波束赋形

本节先推导多径 AoA 估计的 CRB，随后利用从上一时隙获得的信道先验信息，为后续时隙设计预测 BF，以最小化各路径 AoA 估计的最大 CRB。值得注意的是，准确的 B-Domain 跟踪对目标跟踪与通信都有益，这促使我们设计预测 BF 以优化下一时隙的 B-Domain 跟踪性能。双域跟踪与通信性能之间的权衡是所考虑系统的一个关键问题，但 C-Domain 跟踪性能依赖 B-Domain 跟踪性能，因而可能是预测 BF 策略的复杂函数；此外，优化通信性能需考虑基于各路径预测 AoA 的预测 CSI 不确定性，这将导致复杂的优化问题。作为提出双域跟踪框架的首次尝试，本文在预测 BF 设计中只考虑 B-Domain 跟踪性能，双域跟踪语境下感知—通信权衡的优化留待未来工作。

### A. 多径 AoA 估计的 CRB

CRB 是任意无偏估计器方差的下界 [42]，可刻画多径 AoA 估计性能。对每条路径，给定 (21) 的似然函数，未知参数 \(\theta_i\) 的 Fisher 信息（FI）[42] 为 \(\mathcal J(\theta_i)=-\mathbb E\left(\frac{\partial^2\ln p(\mathbf r_i|\theta_i)}{\partial\theta_i^2}\right)=\frac{L^2|\beta_i|^2}{\sigma_z^2}\mathbf j(\theta_i)^H\mathbf j(\theta_i)\)，其中 \(\mathbf j(\theta_i)=\left(\mathbf F^T\otimes\frac{\partial\mathbf b(\theta_i)}{\partial\theta_i}\right)\mathbf a^*(\theta_i)\)，导向矢量 \(\mathbf b(\theta_i)\) 关于 \(\theta_i\) 的导数为 \(\frac{\partial\mathbf b(\theta_i)}{\partial\theta_i}=\mathrm{j}\pi\cos(\theta_i-\pi/2)\operatorname{diag}(0,\ldots,N_r-1)\mathbf b(\theta_i)\)。根据 CRB 定义 [42]，AoA 估计的均方误差（MSE）下界为 \(\mathcal J(\theta_i)\) 的逆，即

$$
\mathbb E\left[(\hat\theta_i-\theta_i)^2\right]\ge\frac{1}{\mathcal J(\theta_i)}\triangleq{\rm CRB}(\theta_i).\tag{24}
$$

**注 2：** 后验 Cramér–Rao 界（PCRB）同时纳入测量数据与 \(\theta_i\) 的先验信息，常被用于刻画波束跟踪框架中的估计性能 [18]。然而如图 4 所讨论，对波束转移情形的第三类（非平稳且不可预测转移），先验信息可能不可用；而且在头两类 AoA 变化情形中，由 TPM 获得的先验信息是数值性的，无法纳入 PCRB 推导。因此我们采用 CRB 作为多径 AoA 估计性能指标。注意在第 \([\eta]\) 时隙，(24) 中的 CRB 依赖第 \([\eta+1]\) 时隙 \(\theta_i\) 的真值，而该真值不可得；然而 (22) 中 B-Domain 硬状态预测提供了 AoA 预测 \(\hat\theta_i[\eta+1|\eta]\)，可代入 (24) 计算 CRB。我们指出，这是把 \(\theta_i\) 的先验信息嵌入其预测估计误差的一种方式，如文献 [18] 所常用。

### B. 预测 BF 设计

在第 \([\eta]\) 时隙，最小化最大预测 AoA 估计误差 \({\rm CRB}(\theta_i[\eta+1|\eta])\) 的预测 BF 设计表述为如下优化问题：

$$
\min_{\mathbf F[\eta+1|\eta]}\ \max_i\left\{{\rm CRB}(\theta_i[\eta+1|\eta])\right\}\quad\text{s.t.}\ \left\|\mathbf F[\eta+1|\eta]\right\|_F^2\le P_t,\tag{25}
$$

其中 \(\mathbf F[\eta+1|\eta]\in\mathbb C^{N_t\times N_s}\) 为预测 BF 矩阵，\(P_t\) 为 RSU 总发射功率。利用 (24)，预测 BF 设计问题可重写为

$$
\max_{\mathbf F[\eta+1|\eta]}\ \min_i\left\{\mathcal J(\theta_i[\eta+1|\eta])\right\}\quad\text{s.t.}\ \left\|\mathbf F[\eta+1|\eta]\right\|_F^2\le P_t.\tag{26}
$$

注意问题 (26) 因目标函数非凸而难以全局求解。作为折中，我们提出波束选择与多波束功率分配的两步优化方案。具体地，预测 BF 矩阵定义为模拟波束导向矩阵 \(\mathbf A[\eta+1|\eta]\in\mathbb C^{N_t\times N_s}\) 与对角功率分配矩阵 \(\boldsymbol\Gamma[\eta+1|\eta]\in\mathbb R^{N_s\times N_s}\) 之积，即 \(\mathbf F[\eta+1|\eta]=\mathbf A[\eta+1|\eta]\boldsymbol\Gamma[\eta+1|\eta]\)，其中 \(\boldsymbol\Gamma[\eta+1|\eta]\triangleq\operatorname{diag}(\sqrt{\gamma_1[\eta+1|\eta]},\cdots,\sqrt{\gamma_{N_s}[\eta+1|\eta]})\)，\(\gamma_{n_s}[\eta+1|\eta]\) 表示第 \([\eta+1]\) 时隙分配给第 \(n_s\) 个波束的功率。

**1）波束选择。** 导向矩阵 \(\mathbf A[\eta+1|\eta]\) 基于 B-Domain 硬状态预测设计，其第 \(n_s\) 列为

$$
\mathbf A_{:,n_s}[\eta+1|\eta]=\mathbf a\left(\hat\theta_{n_s}[\eta+1|\eta]\right)\in\mathbb C^{N_t\times 1},\quad\forall n_s,\tag{27}
$$

其中 \(\hat\theta_{n_s}[\eta+1|\eta]\) 为 (22) 中第 \([\eta]\) 时隙第 \(n_s\) 条路径的预测 AoA。若 \(N_s<P\)，应选择信道路径增益较高的预测 AoA 用于 BF；反之若 \(N_s\ge P\)，则可选择全部 \(P\) 条路径的预测 AoA。本文提出选择最强路径以改善双域跟踪性能：对 B-Domain 跟踪，选择最强路径通常带来更高接收 SNR，从而得到更可靠的 AoA 估计与预测，这对维持波束对准至关重要；对 C-Domain 跟踪，目标状态估计的 Fisher 信息由最强路径主导——具体地，LoS 路径通过其与目标状态相关的确定性几何关系提供解析测量模型、给出高质量测量，而在 LoS 缺失情形下最强 NLoS 路径变得关键，借助作为数值测量模型的 CKM 得以实现连续跟踪。

**2）功率分配。** 第二步是在给定导向矩阵 \(\mathbf A[\eta+1|\eta]\) 的基础上求最优功率分配矩阵 \(\boldsymbol\Gamma[\eta+1|\eta]\)。给定 \(\mathbf A[\eta+1|\eta]\) 时 (26) 的目标函数为

$$
\mathcal J(\theta_i[\eta+1|\eta])=\frac{L^2\pi^2|a_i[\eta+1|\eta]|^2}{\sigma_z^2}\left\{\left[\left(\boldsymbol\Gamma^T[\eta+1|\eta]\mathbf A^T[\eta+1|\eta]\right)\otimes\left(\operatorname{diag}(0,\ldots,N_r-1)\mathbf b(\theta_i[\eta+1|\eta])\right)\right]\mathbf a^*(\theta_i[\eta+1|\eta])\right\}^H\cdot\left\{\left[\left(\boldsymbol\Gamma^T[\eta+1|\eta]\mathbf A^T[\eta+1|\eta]\right)\otimes\left(\operatorname{diag}(0,\ldots,N_r-1)\mathbf b(\theta_i[\eta+1|\eta])\right)\right]\mathbf a^*(\theta_i[\eta+1|\eta])\right\},\tag{28}
$$

为简便记 \(a_i\triangleq\beta_i\sin(\theta_i)\)（\(\forall i\)）。由于本文关注每个时隙的功率分配，省略 (28) 中的时间索引，即 \(\boldsymbol\beta_i[\eta+1|\eta]\)、\(\boldsymbol\Gamma[\eta+1|\eta]\)、\(\mathbf A[\eta+1|\eta]\)、\(\theta_i[\eta+1|\eta]\) 与 \(a_i[\eta+1|\eta]\) 分别记作 \(\beta_i\)、\(\boldsymbol\Gamma\)、\(\mathbf A\)、\(\theta_i\) 与 \(a_i\)。利用 Kronecker 积的混合乘积性质，可得 \(\mathcal J(\theta_i)=(L^2\pi^2a_i^2/\sigma_z^2)\mathbf c^H(\theta_i)(\boldsymbol\Gamma^T\otimes\operatorname{diag}(0,\ldots,N_r-1))^H(\boldsymbol\Gamma^T\otimes\operatorname{diag}(0,\ldots,N_r-1))\mathbf c(\theta_i)\)，其中 \(\mathbf c(\theta_i)\triangleq(\mathbf A^T\otimes\mathbf b(\theta_i))\mathbf a^*(\theta_i)\in\mathbb C^{N_sN_r\times1}\) 可基于 (27) 计算。再次利用 Kronecker 积混合乘积性质得 \(\mathcal J(\theta_i)=(L^2\pi^2a_i^2/\sigma_z^2)\mathbf c^H(\theta_i)[\boldsymbol\Gamma\boldsymbol\Gamma^H\otimes\operatorname{diag}^2(0,\ldots,N_r-1)]\mathbf c(\theta_i)\)。最终 (28) 中 \(\mathcal J(\theta_i)\) 可改写为 \(\mathcal J(\theta_i)=(L^2\pi^2a_i^2/\sigma_z^2)\sum_{n_s=1}^{N_s}\gamma_{n_s}\sum_{g=1}^{N_r}|\{\mathbf c(\theta_i)\}_{(n_s-1)N_r+g}|^2(g-1)^2\)，其中 \(\{\mathbf c(\theta_i)\}_k\) 表示向量 \(\mathbf c(\theta_i)\) 的第 \(k\) 个元素。进一步引入辅助变量 \(t\ge0\) 以界定 \(\mathcal J(\theta_i)\) 的最小值，问题 (26) 可等价改写为

$$
\min_{t,\gamma_1,\ldots,\gamma_{N_s}}\ t\quad\text{s.t.}\ t\le a_i^2\sum_{n_s=1}^{N_s}\gamma_{n_s}c_{i,n_s},\quad\sum_{n_s=1}^{N_s}\gamma_{n_s}\le\frac{P_t}{N_t},\quad\gamma_{n_s}\ge0,\ \forall i,\forall n_s,\tag{29}
$$

其中 \(c_{i,n_s}=\sum_{g=1}^{N_r}|\{\mathbf c(\theta_i)\}_{(n_s-1)N_r+g}|^2(g-1)^2\)。经上述一系列变换可验证，功率分配问题 (29) 为凸问题，可用 CVX [49] 等现成数值凸规划工具求解。问题 (29) 是具有 \(N_s+1\) 个变量与 \((P\times N_s)+1\) 个线性约束的线性规划问题，可用内点法在多项式时间内求解，复杂度为 \(\mathcal O((P+N_s)^{3.5})\) [50]。对本文仿真的典型参数设置，该过程需要少于 \(10^4\) 次浮点运算，通常可在数毫秒内完成（取决于所用处理器），远低于时隙时长 \(\Delta T\)。

**注 3：** 值得注意，波束选择步骤同时定义了后续功率分配设计的优化空间与地景，从而直接决定所选波束间的功率分布。在 (29) 中，波束选择确定优化变量 \(\gamma_1,\ldots,\gamma_{N_s}\) 的个数，进而决定问题维度；功率分配随后在所选波束间优化功率分布，以最小化各路径 AoA 估计的最大误差。此外，(29) 的系数 \(c_{i,n_s}\) 共同依赖于 RSU 的发射与接收导向矢量以及波束选择矩阵 \(\mathbf A\)；反过来，功率分配影响下一时隙更新与预测的 AoA，进而间接影响波束选择。

**注 4：** (25) 的表述可通过引入通信约束（如最小可达速率或最大中断概率约束）推广为联合优化问题，该约束基于预测 CSI，从而具体体现感知—通信权衡。更严格的通信约束（如更高的最低速率要求）倾向于把更多发射功率分配给通信，从而减少沿预测 AoA 集中的功率、增大 AoA 估计的 CRB；反之，较宽松的通信约束允许更多功率集中于预测 AoA，从而最小化 AoA 估计误差。面向感知与通信的预测波束赋形联合优化是我们未来工作的重要方向。

## VII. 仿真结果

本节给出数值结果以评估所提 CKM 辅助双域跟踪与预测 BF 框架的性能。

### A. 仿真参数与基线方案

RSU 位于原点，车辆从坐标 \([-20\ \text{m},10\ \text{m}]^T\) 出发、沿道路以初速 10 m/s 行驶。感兴趣时间 \(T_{\max}=4\) s，时隙时长 \(\Delta T=0.02\) s；载频 \(f_c\) 设为 30 GHz，采样间隔 \(T_p\) 为 \(10^{-8}\) 秒。最大时延与 Doppler 频移索引均设为 100；总发射功率 \(P_t\) 为 16 W，角度网格尺寸 \(N_\theta=7200\)。对 C-Domain 状态演化噪声，位置标准差 \(\sigma_{q_x},\sigma_{q_y}\) 设为 \(10^{-3}\) m，\(\sigma_v\) 为 \(10^{-3}\) m/s；时延与 Doppler 频移测量噪声标准差分别为 \(\sigma_\tau=10^{-8}\) s 与 \(\sigma_\mu=20\) Hz；角度测量噪声标准差为 \(\sigma_{\cos(\theta)}=0.01\)，AoA 变化模型参数为 \(\xi=0.8\)、\(\epsilon=\hat v\sin(\hat\theta_1)N_\theta/20\) 与 \(\sigma_{\rm CKM}=10^{-3}\)。每条累积分布函数（CDF）曲线由 100 次 Monte Carlo 运行获得。

利用 MATLAB 中的射线追踪工具箱生成真值信道信息 [51]。设计一个 CKM 记录 \(P=2\) 条最强信道路径，分别记为 path 1 与 path 2<sup>7</sup>（脚注 7：仿真环境呈现两条主导传播路径、捕捉所考虑场景的主要多径结构，故设 \(P=2\)；所提方案适用于更多传播路径的情形）。CKM 采用 KNN 的 IDW 方法、以有限的 3200 个射线追踪数据样本构建（如文献 [31]–[33] 所常用）。所选样本量在所考虑区域达到约 0.1 m 的空间分辨率，与相邻时隙间的车辆位移（\(v\Delta T=0.2\) m）相当。假设传播环境中静态大尺寸障碍物引起的时变相关遮挡出现在第 140 至 175 时隙之间，而瞬态障碍物引起的随机遮挡事件以一定遮挡概率出现。注意实践中 NLoS 路径比 LoS 路径更易被遮挡 [52]，因此可把 LoS 路径的遮挡概率定义为 \(p_{\rm blk}\)，NLoS 路径的遮挡概率定义为 \(1-(1-p_{\rm blk})^2\)（因 NLoS 路径可视为两条 LoS 路径的串联）。注意 LoS 缺失发生在 LoS 路径被遮挡时；此外 NLoS 路径的遮挡不被视为 LoS 缺失情形。

对平稳转移情形，所有路径与时隙的 TPM 常数设为 \(c_{\Pi_i}[\eta]=0.6\)。该值依据图 5 中观察到的 \(c_{\Pi_i}\) 与跟踪精度关系确定——该图显示平均 AoA 跟踪误差随 \(c_{\Pi_i}\) 增大先减小、后增大，path 1 尤为明显。初始的跟踪精度改善源于适中的 \(c_{\Pi_i}\) 利用 (12) 中角度 TPM 的 CKM 先验来增强多径 AoA 估计；然而 CKM 先验本质上并不完美，因其输入位置是预测而非实测，会在预测与真实 AoA 之间引入失配。C-Domain 跟踪误差连同 CKM 构建不确定性进一步降低 B-Domain 跟踪精度，因此平均 AoA 跟踪误差随 \(c_{\Pi_i}\) 继续增大而上升。

本节采用 [4] 所述基线方法以展示所提框架的收益。具体地，[4] 的基线算法把 LoS 路径遮挡检测结果与基于 EKF 的跟踪框架结合，联合跟踪位置、速度与 LoS 路径 AoA。注意该基线仅基于 LoS 信道模型设计，未考虑 NLoS 路径信息；因此我们假设基线方案在 LoS 存在情形下能完美分离 LoS 路径的接收信号用于跟踪。若 LoS 路径缺失，感知接收机忽略 NLoS 路径观测、仅执行状态预测以预测车辆位置、速度与 LoS 路径 AoA（如 [4] 所考虑）。

### B. 跟踪性能

图 6 以车辆位置均方根误差（RMSE）与 path 1 AoA 估计绝对误差展示双域跟踪性能。与基线方案相比，所提双域 EKF 跟踪框架确保连续目标跟踪，即使在长时间 LoS 缺失期间也取得更高跟踪精度。这是因为所提方案全面建模了波束转移情形，并有效利用 CKM 提取 NLoS 路径信息用于定位。此外可见所有位置跟踪 RMSE 曲线随时间先上升、随后下降/稳定：这源于 EKF 算法的跟踪精度需要若干次迭代才能稳定。另外当 path 1 被随机遮挡时，最强 NLoS 路径的 AoA 不可预测地变化，导致波束失准与 AoA 跟踪误差的尖峰（图 6 中星号所示）。AoA 跟踪误差大多集中在 0° 附近，说明 B-Domain 跟踪即使在随机遮挡下也保持较高的 AoA 估计精度。相反，当 LoS 路径因随机遮挡而消失、且诱导路径远离预测波束方向时会出现较大跟踪误差，甚至偶尔接近 180°。这是因为 B-Domain 状态的突然变化导致严重波束失准，使诱导路径的接收 SNR 显著下降。所幸这些尖峰不会显著影响整体位置跟踪精度，因为 C-Domain 在 LoS 存在与 LoS 缺失情形下的测量模型不同。注意图 6 未给出多径 AoA 估计精度，因为基线只跟踪 LoS 路径的 AoA。在最初几个时隙中，基线方案后续时隙的 LoS 路径 AoA 大于所提框架，因为第 V-C 节提出的基于 MAP 的更新准则在回波信号测量不可靠或 SNR 较低时有效融入了先验信息；相反，基线的目标跟踪与波束跟踪误差都随时隙增大，最终位置跟踪 RMSE 甚至超过 10 米、path 1 AoA 跟踪误差达 50 度。这是因为在 LoS 缺失情形下，[4] 的基线方案把回波信号测量视为无意义，仅依赖状态演化模型预测后续时隙的车辆位置与 LoS 路径 AoA；而所采用的状态演化模型可能存在模型失配，随时隙增加，目标跟踪与波束跟踪误差都会放大。

图 7 考虑更高噪声功率以评估所提方案性能。噪声功率更高时，更大的天线阵列可因更高 BF 增益改善跟踪精度，但也会增加波束失准的可能性（如图 7 所示）。对 \(N_t=N_r=64\) 的较大天线阵列，当车辆靠近 RSU（特别是第 80–100 时隙之间）时，即使 path 1 尚未被遮挡，目标跟踪与波束跟踪性能都会变差。事实上，path 1 的 AoA 在这些时隙变化很快，B-Domain 状态预测变得不准，故较大天线阵列的窄波束预测 BF 更容易丢失移动目标。

注意图 6 与图 7 中，基线方法都因随机路径遮挡而无法在所考虑的复杂高移动性无线网络中保持准确跟踪。所提 CKM 辅助双域跟踪框架优于基线有两个关键原因：其一，基于 C-Domain 跟踪结果，CKM 为 B-Domain 跟踪提供额外先验信息，即使在较差信道条件下也提升 AoA 跟踪精度；其二，文献 [4], [5], [7], [53] 等传统基于 EKF 的目标跟踪方案对模型失配误差高度敏感——所假设测量模型与实际传播环境存在差异；相反，所提框架除在 LoS 存在情形使用传统基于几何的测量模型外，还在 LoS 缺失情形利用 CKM 充当测量函数。

此外，图 8a 与 8b 给出不同 \(N_t\)、\(N_r\) 配置下（分别对应图 6 与图 7）path 1 与 path 2 的 AoA 跟踪误差 CDF。由于噪声功率 \(\sigma_z^2\) 较低，图 8a 在所有路径与天线配置下都一致地呈现比图 8b 更好的 AoA 估计精度；相反，图 8b 表明更高的测量噪声功率显著影响 AoA 跟踪精度，path 2 尤为明显。这种退化在非平稳且不可预测的波束状态转移期间最为明显——此时 AoA 估计只依赖当前观测信号，因而对噪声引起的失真更敏感。与图 7 的观察一致，增加天线数并不总是有利于 AoA 跟踪，尤其对 path 2（NLoS 路径）与噪声功率较高的情形。由于 NLoS 路径具有更高随机遮挡概率，波束更宽的较小天线阵列覆盖 path 2 突发变化 AoA 的概率更高，因而可能在 B-Domain 提供高质量信号测量。需要强调，\(p_{\rm blk}=0.15\) 意味着 path 1 有 85% 的 AoA 估计在先验信息辅助下获得、path 2 有 72.25% 的 AoA 估计得到先验信息支持。在图 8a 与 8b 中，先验信息辅助下的 AoA 跟踪误差都低于 10 度，说明融入先验信息即使在低 SNR 条件下也能显著改善 AoA 跟踪精度，尤其对 NLoS 路径；这一发现凸显了所提方法在存在显著噪声与高速移动目标时仍能保持准确角度估计的鲁棒性。

图 9 进一步印证了上述分析：虽然更大天线阵列在平稳或可预测情形下可提供更好的 AoA 跟踪精度，但它们对传播环境中意外的波束状态转移更敏感。图 10 进一步表明，与其他两类波束状态转移相比，非平稳且不可预测转移（III）会降低 AoA 跟踪性能，尤其对 NLoS 路径与较大天线阵列的情形。事实上，在第三类波束状态转移中，没有信道先验信息、仅依赖接收信号时，由于 NLoS 路径的传播损耗远高于 LoS 路径，估计其 AoA 十分困难；此外此时 RSU 难以预测波束，较大天线阵列的预测 BF 更可能遭遇波束失准。

### C. 预测 BF 性能

图 11 表明，引入预测 BF 并优化功率分配（PA）可显著改善多径 AoA 跟踪精度。对 path 1，图 11 显示等功率分配的 BF 取得最高跟踪精度，其次是带优化 PA 的预测 BF，第三是不使用预测 BF 的情形；对 path 2，带优化 PA 的预测 BF 取得最高 AoA 跟踪精度，其次是等功率分配的预测 BF，最后是不使用预测 BF 的情形。功率分配的优化平衡了不同传播路径间的感知性能：通过在多个波束间分配功率，所提方法有效改善了路径增益较低路径的 AoA 跟踪性能。这对 NLoS 路径尤为重要——带优化 PA 的预测 BF 可通过补偿其传播损耗来增强跟踪性能。总体而言，预测 BF 与优化 PA 的结合为复杂环境中的多径 AoA 跟踪提供了更稳健的解决方案。

**图 3（原文 Fig. 3）：** 第 \(i\) 条路径的角度 TPM。

**图 4（原文 Fig. 4）：** 各路径角度随时间的变化。

**图 5（原文 Fig. 5）：** 所有路径与时隙的平均 AoA 跟踪误差随 \(c_{\Pi_i}[\eta]\) 的变化（\(\sigma_z^2=10^{-6}\) W，\(N_t=N_r=32\)，\(p_{\rm blk}=0.15\)）。

**图 6（原文 Fig. 6）：** 所提双域框架与基线的跟踪性能随时间索引的变化（\(\sigma_z^2=10^{-9}\) W，\(p_{\rm blk}=0.15\)）。上：不同 \(N_t=N_r\) 下的位置跟踪 RMSE；下：path 1 AoA 跟踪误差（含随机遮挡标记）。

**图 7（原文 Fig. 7）：** 所提双域框架与基线的跟踪性能随时间索引的变化（\(\sigma_z^2=10^{-6}\) W，\(p_{\rm blk}=0.15\)）。上：不同 \(N_t=N_r\) 下的位置跟踪 RMSE；下：path 1 AoA 跟踪误差（含随机遮挡标记）。

**图 8（原文 Fig. 8）：** B-Domain 多径 AoA 跟踪误差的 CDF（\(p_{\rm blk}=0.15\)）。(a) \(\sigma_z^2=10^{-9}\) W；(b) \(\sigma_z^2=10^{-6}\) W；均含 \(N_t=N_r=8,16,32,64\) 下 path 1 与 path 2 的曲线。

**图 9（原文 Fig. 9）：** 多径 AoA 跟踪性能（\(\sigma_z^2=10^{-6}\) W）。上：\(N_t=N_r=16\)；下：\(N_t=N_r=64\)；图中给出各路径真实 AoA 与被跟踪 AoA，并标出随机遮挡。

**图 10（原文 Fig. 10）：** 平均 AoA 跟踪误差随天线数的变化：path 1 与 path 2 分别对应转移情形（III）与转移情形（I）、（II）。

**图 11（原文 Fig. 11）：** 不同预测 BF 方案的 AoA 跟踪误差 CDF：带优化 PA 的预测 BF、带等功率 PA 的预测 BF、不使用预测 BF（各含 path 1 与 path 2）。

## VIII. 结论

本文提出一种面向高移动性无线网络的 CKM 辅助双域跟踪与预测 BF 框架。在 C-Domain 中，提出基于 EKF 的目标跟踪方法，在 LoS 存在与 LoS 缺失两种条件下都有效。在 B-Domain 中，为每条路径构造结合信道时间相关性与 CKM 先验信息的角度 TPM 以辅助 AoA 跟踪。此外，我们分析了 AoA 估计的 CRB，并提出预测 BF 与功率分配设计，以最小化下一时隙多径间的最大 AoA 估计误差。仿真结果证实，CKM 显著提升了目标跟踪与波束跟踪精度，尤其在复杂高移动性无线通信网络中；此外，引入预测 BF 与优化功率分配进一步改善了 AoA 跟踪性能，尤其对传播损耗较高的 NLoS 路径。该框架可扩展到多用户与多 UAV 网络，以适应多个节点的同时运动。所提技术是智能交通系统发展的关键进展，可为 6G 网络提供更高的通信可靠性与效率。

## 参考文献（英文原书目）

[1] R. Du, Z. Wei, Z. Yang, Y. Zeng, and D. W. K. Ng, “Channel knowledge map-assisted dual-domain tracking for high-mobility wireless networks,” in 2025 IEEE ICC Workshops, Montreal, Canada, Jun. 2025, pp. 1–6.

[2] Y. Zeng and X. Xu, “Toward environment-aware 6G communications via channel knowledge map,” IEEE Wireless Commun., vol. 28, no. 3, pp. 84–91, Jun. 2021.

[3] Z. Wei, F. Liu, C. Liu, Z. Yang, D. W. K. Ng, and R. Schober, “Integrated sensing, navigation, and communication for secure UAV networks with a mobile eavesdropper,” IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7060–7078, Dec. 2024.

[4] Y. Zhao, X. Xu, Y. Zeng, and F. Liu, “Sensing-assisted predictive beamforming with NLoS identification,” 2023 IEEE ICC, pp. 6455–6460, May 2023.

[5] Y. Li, F. Liu, Z. Du, W. Yuan, and C. Masouros, “ISAC-Enabled V2I networks based on 5G NR: How much can the overhead be reduced?” pp. 691–696, May 2023.

[6] D. Zhang, A. Li, M. Shirvanimoghaddam, P. Cheng, Y. Li, and B. Vucetic, “Fast beam tracking for millimeter-wave systems under high mobility,” in 2019 IEEE ICC, May 2019, pp. 1–6.

[7] Y. Cui, Q. Zhang, Z. Feng, Q. Wen, Z. Wei, F. Liu, and P. Zhang, “Seeing is not always believing: ISAC-assisted predictive beam tracking in multipath channels,” IEEE Wireless Commun. Lett., vol. 13, no. 1, pp. 14–18, Jan. 2024.

[8] ITU, “Introduction to (6g) | IMT-2030,” [Online]. Available: https://www.tonex.com/training-courses/introduction-to-6g-imt-2030/.

[9] S. Zeng, X. Xu, Y. Zeng, and F. Liu, “CKM-assisted LoS identification and predictive beamforming for cellular-connected UAV,” in 2023 IEEE ICC, May 2023, pp. 2877–2882.

[10] C. Zhang, D. Guo, and P. Fan, “Tracking angles of departure and arrival in a mobile millimeter wave channel,” in 2016 IEEE ICC. Kuala Lumpur, Malaysia: IEEE, May 2016, pp. 1–6.

[11] B. Ma, H. Shah-Mansouri, and V. W. S. Wong, “Full-duplex relaying for d2d communication in millimeter wave-based 5g networks,” IEEE Trans. Wireless Commun., vol. 17, no. 7, pp. 4417–4431, Apr. 2018.

[12] Y. Zeng, J. Chen, J. Xu, D. Wu, X. Xu, S. Jin, X. Gao, D. Gesbert, S. Cui, and R. Zhang, “A tutorial on environment-aware communications via channel knowledge map for 6G,” IEEE Commun. Surv. Tutorials, vol. 26, no. 3, pp. 1478–1519, Feb. 2024.

[13] X. Xu and Y. Zeng, “How much data is needed for channel knowledge map construction?” IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13 011–13 021, Oct. 2024.

[14] D. Wu, Y. Zeng, S. Jin, and R. Zhang, “Environment-aware hybrid beamforming by leveraging channel knowledge map,” IEEE Trans. Wireless Commun., vol. 23, no. 5, pp. 4990–5005, May 2024.

[15] S. Shaham, M. Ding, M. Kokshoorn, Z. Lin, S. Dang, and R. Abbas, “Fast channel estimation and beam tracking for millimeter wave vehicular communications,” IEEE Access, vol. 7, pp. 141 104–141 118, Sep. 2019.

[16] D. Zhang, A. Li, M. Shirvanimoghaddam, P. Cheng, Y. Li, and B. Vucetic, “Codebook-based training beam sequence design for millimeter-wave tracking systems,” IEEE Trans. Wireless Commun., vol. 18, no. 11, pp. 5333–5349, 2019.

[17] J. Seo, Y. Sung, G. Lee, and D. Kim, “Training beam sequence design for millimeter-wave MIMO systems: A POMDP framework,” IEEE Trans. Signal Process., vol. 64, no. 5, pp. 1228–1242, Mar. 2016.

[18] F. Liu, W. Yuan, C. Masouros, and J. Yuan, “Radar-assisted predictive beamforming for vehicular links: Communication served by sensing,” IEEE Trans. Wireless Commun., vol. 19, no. 11, pp. 7704–7719, Nov. 2020.

[19] B. Ristic, B.-T. Vo, B.-N. Vo, and A. Farina, “A tutorial on bernoulli filters: Theory, implementation and applications,” IEEE Trans. Signal Process., vol. 61, no. 13, pp. 3406–3430, Apr. 2013.

[20] S. G. Larew and D. J. Love, “Adaptive beam tracking with the unscented kalman filter for millimeter wave communication,” IEEE Signal Process Lett., vol. 26, no. 11, pp. 1658–1662, 2019.

[21] J. Lim, H.-M. Park, and D. Hong, “Beam tracking under highly nonlinear mobile millimeter-wave channel,” IEEE Commun. Lett., vol. 23, no. 3, pp. 450–453, 2019.

[22] L. Yi, S. G. Razul, Z. Lin, and C.-M. See, “Target tracking in mixed LOS/NLOS environments based on individual TOA measurement detection,” in 2010 IEEE SAMSP Workshop, 2010, pp. 153–156.

[23] S. Li, M. Hedley, I. B. Collings, and D. Humphrey, “Joint trajectory and ranging offset estimation for accurate tracking in NLOS environments,” IEEE Trans. Aerosp. Electron. Syst., vol. 56, no. 1, pp. 3–14, 2020.

[24] R. Wang, P. V. Klaine, O. Onireti, Y. Sun, M. A. Imran, and L. Zhang, “Deep learning enabled beam tracking for non-line of sight millimeter wave communications,” IEEE Open J. Commun. Soc., vol. 2, pp. 1710–1720, Jul. 2021.

[25] X. Chen, J. Lu, P. Fan, and K. B. Letaief, “Massive MIMO beamforming with transmit diversity for high mobility wireless communications,” IEEE Access, vol. 5, pp. 23 032–23 045, Oct. 2017.

[26] Y. Tian and C. Wang, “Vision-aided beam tracking: Explore the proper use of camera images with deep learning,” in 2021 IEEE VTC, Sep. 2021, pp. 01–05.

[27] J. Zhang, G. Zheng, Y. Zhang, I. Krikidis, and K.-K. Wong, “Deep learning based predictive beamforming design,” IEEE Trans. Veh. Technol., vol. 72, no. 6, pp. 8122–8127, Jan. 2023.

[28] Y.-G. Lim, Y. J. Cho, M. S. Sim, Y. Kim, C.-B. Chae, and R. A. Valenzuela, “Map-based millimeter-wave channel models: An overview, data for B5G evaluation and machine learning,” IEEE Wireless Commun., vol. 27, no. 4, pp. 54–62, Aug. 2020.

[29] J. Johansson, W. A. Hapsari, S. Kelley, and G. Bodog, “Minimization of drive tests in 3GPP release 11,” IEEE Commun. Mag., vol. 50, no. 11, pp. 36–43, Nov. 2012.

[30] S.-J. Kim, E. Dall'Anese, and G. B. Giannakis, “Cooperative spectrum sensing for cognitive radios using kriged kalman filtering,” IEEE J. Sel. Topics Signal Process., vol. 5, no. 1, pp. 24–36, Feb. 2011.

[31] J.-P. Chilès and P. Delfiner, Geostatistics: Modeling Spatial Uncertainty. New York, U.S.A.: John Wiley & Sons, 2009.

[32] T. M. Cover and P. E. Hart, “Nearest neighbor pattern classification,” IEEE Trans. Inf. Theory, vol. 13, no. 1, pp. 21–27, Jan. 1967.

[33] K. Li, P. Li, Y. Zeng, and J. Xu, “Channel knowledge map for environment-aware communications: EM algorithm for map construction,” in 2022 IEEE WCNC. Austin, TX, USA: IEEE, Apr. 2022, pp. 1659–1664.

[34] S. Chouvardas, S. Valentin, M. Draief, and M. Leconte, “A method to reconstruct coverage loss maps based on matrix completion and adaptive sampling,” in Proc. IEEE Int. Conf. Acoust., Speech Signal Process. (ICASSP), 2016, pp. 6390–6394.

[35] B. R. Hamilton, X. Ma, R. J. Baxley, and S. M. Matechik, “Propagation modeling for radio frequency tomography in wireless networks,” IEEE J. Sel. Areas Commun., vol. 8, no. 1, pp. 55–65, 2013.

[36] Y. Long, Y. Zeng, X. Xu, and Y. Huang, “Environment-aware wireless localization enabled by channel knowledge map,” in 2022 IEEE GCC, Dec. 2022, pp. 5354–5359.

[37] Z. Xu, Z. Zhou, D. Wu, and Y. Zeng, “Channel knowledge map-enhanced clutter suppression for integrated sensing and communication,” in 2024 IEEE/CIC ICCC Workshops, Oct. 2024, pp. 90–95.

[38] W. Yuan, Z. Wei, S. Li, J. Yuan, and D. W. K. Ng, “Integrated sensing and communication-assisted orthogonal time frequency space transmission for vehicular networks,” IEEE J. Sel. Top. Signal Process., vol. 15, no. 6, pp. 1515–1528, Oct. 2021.

[39] J. Wu, W. Yuan, and L. Bai, “On the interplay between sensing and communications for UAV trajectory design,” IEEE Internet Things J., vol. 10, no. 23, pp. 20 383–20 395, Oct. 2023.

[40] G. San Antonio, D. R. Fuhrmann, and F. C. Robey, “MIMO radar ambiguity functions,” IEEE J. Sel. Top. Signal Process., vol. 1, no. 1, pp. 167–177, May 2007.

[41] B. Friedlander, “On transmit beamforming for MIMO radar,” IEEE Trans. Aerosp. Electron. Syst., vol. 48, no. 4, pp. 3376–3388, Oct. 2012.

[42] S. M. Kay, Fundamentals of statistical signal processing. Prentice-Hall, Inc., 1993.

[43] D. Zhang, S. Shen, C. She, M. Xiao, Z. Pang, Y. Li, and L. Wang, “Training beam sequence design for mmwave tracking systems with and without environmental knowledge,” IEEE Trans. Wireless Commun., vol. 21, no. 12, pp. 10 780–10 795, Dec. 2022.

[44] M. Marcus and H. Minc, A Survey of Matrix Theory and Matrix Inequalities. Courier Corporation, 1992, vol. 14.

[45] M. Baake and J. Sumner, “On equal-input and monotone markov matrices,” Adv. Appl. Probab., vol. 54, no. 2, pp. 460–492, 2022.

[46] K. Chen, C. Qi, C.-X. Wang, and G. Y. Li, “Beam training and tracking for extremely large-scale MIMO communications,” IEEE Trans. Wireless Commun., vol. 23, no. 5, pp. 5048–5062, Oct. 2024.

[47] P. Stoica and A. Nehorai, “MUSIC, maximum likelihood, and Cramer-Rao bound: further results and comparisons,” IEEE Trans. Acoust. Speech Signal Process., vol. 38, no. 12, pp. 2140–2150, Dec. 1990.

[48] Z. Yang and X. Wu, “New low rank optimization model and convex approach for robust spectral compressed sensing,” 2021. [Online]. Available: https://arxiv.org/abs/2101.06433

[49] M. Grant and S. Boyd, “CVX: Matlab software for disciplined convex programming, version 2.1,” https://cvxr.com/cvx, Mar. 2014.

[50] N. Karmarkar, “A new polynomial-time algorithm for linear programming,” in Proc. 16th Annu. ACM Symp. Theory Comput. (STOC), Apr. 1984, pp. 302–311.

[51] I. The MathWorks, “Ray tracing in RFPROP,” https://www.mathworks.com/help/antenna/ref/rfprop.raytracing.html, accessed: 2025-01-17.

[52] K. Dong, M. Mizmizi, D. Tagliaferri, and U. Spagnolini, “Vehicular blockage modelling and performance analysis for mmwave V2V communications,” in 2022 IEEE ICC, May 2022, pp. 3604–3609.

[53] K. Yu and Y. J. Guo, “Statistical NLoS identification based on AoA, ToA, and signal strength,” IEEE Trans. Veh. Technol., vol. 58, no. 1, pp. 274–286, May 2009.

## 图注与表注

**图注：** 图 1–11 的图注已随文置于相应位置（图 1 见第 II 节，图 2 见第 III 节，图 3–5 见第 V-VII 节相关位置，图 6–11 见第 VII 节）。其中图 5 为 \(c_{\Pi_i}[\eta]\) 对平均 AoA 跟踪误差的影响曲线（path 1、path 2，转移情形 I 与 II），图 8 含两个子图（对应不同噪声功率），图 9 含两个子图（\(N_t=N_r=16\) 与 \(64\)），图 11 为三种预测 BF 方案的 AoA 跟踪误差 CDF（含 path 1 与 path 2）。

> **表注：** 原文没有表格（仿真参数在第 VII-A 节正文中给出）。

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VIII 节全部正文与子节（I-A/B/C、IV-A–D、V-A–C、VI-A/B、VII-A–C）、式 (1)–(29)、引理 1–2 及其完整证明、注 1–4、图 1–11 图注、参考文献 [1]–[53]（英文原条目，编号与原文一致）。原文无表格、无附录、无致谢段（资助信息为首页脚注，已录为"资助说明"）。全部公式按 PDF 渲染页（p8 等）与正文逐式核对；重点核对式 (8) 的 Jacobian 矩阵与式 (28) 的 Kronecker 结构。**原文说明：** 原文中公式 (28) 排印在第 12 页末、内容延续至第 13 页顶部（"at the top of next page"），本页按完整公式呈现；原文符号 \(\theta\) 同时用于 AoA 变量与角度网格点 \(\tilde\theta_\kappa\)，已按原文区分。逐句逐式终校未做；供后续 QA 重点核对：式 (8)、(28) 的矩阵元素、式 (12)–(14) 的 TPM 定义与归一化系数、式 (29) 的线性规划表述。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
