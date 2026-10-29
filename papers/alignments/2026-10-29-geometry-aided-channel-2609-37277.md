---
layout: page
title: "GCD 原文—译文自然段定位表（2026-10-29）"
permalink: /papers/alignments/2026-10-29-geometry-aided-channel-2609-37277/
---

# GCD · 逐自然段原译定位表（初版）

**原文 PDF：** 16 页。**提取正文候选：** 99 个；其中判定为正文的候选 89 项，图表/元数据等候选 10 项。**译稿正文分块：** 87 项。**建立译段候选：** 89 项；初版 3 项父节歧义已定位实际子节；其中仅凭顺序猜测 26 项。

[打开现有中文译稿](/papers/translations/2026-10-29-geometry-aided-channel-2609-37277/) · [返回完整核查记录](/papers/translation-qa-2026-10-29/)

**极重要：这是逐条定位底稿，不是已完成的译文验收。** 每条已定位记录下方直接展示整个中文译段候选（不仅是前 240 个字）；同一中文段落可被多个源段重复引用，并不表示已确认一对一。 原文按 PDF 文字块及缩进提取，跨栏和跨页续段可能被拆为两项；一个原文段落可能对应多个中文段落，反之亦然。对照译段由章节顺序、相同数值、引用和技术术语自动建议；表中“候选”并不证明语义相符。没有找到或线索较弱的项目需要逐一人工核查。每个原文候选都保留原 PDF 页码、起始坐标、原文全文与中文候选段的段首；表格、公式、参考文献不计入自然段。带“非正文候选”的行用于保留提取痕迹，避免静默漏行。

## PDF 第 1 页 · 提取候选 6 项

### GCD-P0001 · 页内坐标 x=81.9, y=119.6

**原文章节（自动识别）：** front matter。**目标译稿章节：** I. 引言。**状态：** 非正文候选：作者/出版信息或表格。

**原文全文（PDF 文本层）：** Hongning Ruan, Zhaoyang Zhang, Zirui Chen, Ziqing Xing, Zhaohui Yang, and M´erouane Debbah

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0002 · 页内坐标 x=49, y=177.1

**原文章节（自动识别）：** front matter。**目标译稿章节：** 摘要。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Abstract—The acquisition of high-dimensional channel state information (CSI) in wireless multi-input multi-output (MIMO) orthogonal frequency division multiplexing (OFDM) communications usually requires high pilot overhead, or relies on accurate and complete positional or environmental information. In this paper, we propose a geometry-aided channel deduction (GCD) approach, which utilizes an uncalibrated digital twin (DT) with only approximate environmental geometry and positions to assist the channel acquisition. The key rationale behind is that, even imprecise geometric information, which can be easily obtained in advance through radio sensing technologies or existing geographic databases, provides certain structural features about the current channel; meanwhile, the coarse instantaneous channel estimates using only a small amount of pilots provide dedicated information that aligns with the channel structure and further compensates for the geometry inaccuracy and other channel unknowns. To this end, we first extract geometric features from the DT, which contain only simple structural information of the channel. Then we propose random prompt augmentation, a novel method to generate an appropriate prompt that converts geometric multi-path structure into a CSI-like representation while suppressing the disturbance of other unknown channel parameters. The prompt is then fused with the pilot-based instantaneous channel estimate via a channel deduction network. To further enhance the network’s versatility, we incorporate pilot configurations into the existing learning architecture to support variable pilot patterns. Comprehensive experiments validate the superiority of the proposed method, which demonstrates high channel acquisition quality, low pilot overhead, and strong robustness. Furthermore, the structural prompt also serves as scenario-related context, enabling our approach to generalize well in new scenarios.

**译稿位置：** [T003 · 第 21 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L21)；**译文候选全文：** 无线多输入多输出（MIMO）正交频分复用（OFDM）系统中的高维信道状态信息（CSI）获取，通常需要较大的导频开销，或者依赖准确而完备的位置与环境信息。本文提出几何辅助信道推断（geometry-aided channel deduction，GCD）方法，利用仅包含近似环境几何与位置、尚未经校准的数字孪生（DT）辅助信道获取。其基本依据是：即便几何信息不够准确，也能提供当前信道的一部分结构性特征，而且这些信息可通过无线感知或现有地理数据库提前获得；与此同时，借助少量导频得到的粗略瞬时信道估计可以提供与信道结构对应的特定信息，进一步补偿几何误差和其他未知信道因素。

**自动匹配线索：** channel、mimo、ofdm、geometry-aided、channel→信道、pilot→导频、geometry→几何、geometric→几何。

### GCD-P0003 · 页内坐标 x=49, y=535.2

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 研究背景。**状态：** 已找到相邻子节/同节的译文候选（尚未逐句校验）。

**原文全文（PDF 文本层）：** I. INTRODUCTION A. Background Future wireless networks are envisioned to evolve toward unprecedented levels of connectivity, data rate, spectral effi-

**译稿位置：** [源文件第 31 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L31)；**译文候选全文：** 未来无线网络将朝着更高连接密度

### GCD-P0004 · 页内坐标 x=49, y=596.4

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** I. 引言。**状态：** 非正文候选：作者/出版信息或表格。

**原文全文（PDF 文本层）：** Part of this work was presented at 2026 IEEE International Symposium on Personal, Indoor and Mobile Radio Communications (PIMRC) [1]. This work was supported in part by National Natural Science Foundation of China under Grants 62394292 and 624B2129, and in part by the Fundamental Research Funds for the Central Universities under Grant 226-2024-00069. (Corresponding Author: Zhaoyang Zhang) H. Ruan, Z. Zhang, Z. Chen, Z. Xing, and Z. Yang are with the College of Information Science and Electronic Engineering, Zhejiang University, Hangzhou 310027, China, and also with Zhejiang Provincial Laboratory of Multi-Modal Communication Networks and Intelligent Information Processing, Hangzhou 310027, China. H. Ruan, Z. Zhang and Z. Xing are also with the Institute of Fundamental and Transdisciplinary Research, Zhejiang University, Hangzhou 310058, China. (email: rhohenning@zju.edu.cn; ning ming@zju.edu.cn; ziruichen@zju.edu.cn; ziqing xing@zju.edu.cn; yang zhaohui@zju.edu.cn). M. Debbah is with the Research Institute for Digital Future, Khalifa University, 127788 Abu Dhabi, UAE (email: merouane.debbah@ku.ac.ae).

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0005 · 页内坐标 x=312, y=176.4

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 研究背景。**状态：** 已找到相邻子节/同节的译文候选（尚未逐句校验）。

**原文全文（PDF 文本层）：** ciency, and intelligence, enabled by a diverse range of emerging technologies, including extremely large-scale multipleinput multiple-output (MIMO) [2], terahertz communications, reconfigurable intelligent surfaces (RIS), stacked intelligent metasurfaces (SIM) [3], and integrated sensing and communication (ISAC) [4]. Along this evolution, the increasing scale of antenna arrays and wider transmission bandwidths are driving wireless channels toward higher dimensionality. Acquiring such high-dimensional channel state information (CSI) with low pilot overhead poses significant challenges. Since the physical environments experienced by channels under different subcarriers and antennas are similar, a subset of the CSI can be mapped to the entire CSI, thereby reducing pilot overhead. However, the complexity of electromagnetic (EM) propagation characteristics makes it difficult for traditional interpolation methods to achieve optimal performance. Some methods [5], [6] estimate path parameters using pilot measurements to obtain complete CSI, but they typically involve high computational complexity for parameter estimation. Deep learning excels at uncovering latent features and representing high-dimensional data, and has been applied to the field of channel estimation [7]. However, due to the dynamic and variable nature of wireless communication systems, such data-driven methods face challenges in terms of generalization. A key issue is whether deep neural networks can maintain their performance when channel propagation conditions change due to dynamic environmental variations or user mobility across different scenarios [8]. Additionally, the neural network should be able to adapt to diverse system configurations and variable pilot patterns. These factors directly influence the feasibility of learning methods to be deployed in real-world systems.

**译稿位置：** [源文件第 33 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L33)；**译文候选全文：** 由于不同天线和子载波对应的物理传播环境相似

### GCD-P0006 · 页内坐标 x=312, y=556.1

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** B. 相关工作。**状态：** 已找到相邻子节/同节的译文候选（尚未逐句校验）。

**原文全文（PDF 文本层）：** B. Related Works 1) Pilot-Based Channel Estimation: Deep neural networks have been widely used for channel estimation. For example, [9], [10] employ convolutional neural network (CNN) to perform frequency domain interpolation, where pilot symbols are inserted into certain subcarriers. [11] employs multi-layer perceptron (MLP) to perform spatial domain extrapolation, using CSI of a subset of antennas to infer that of other antennas. [12] proposed complex-domain MLP-Mixer (CMixer), which employs physics-inspired design to map partial estimates from a subset of antennas and subcarriers to complete spatialfrequency domain CSI, outperforming MLP- and CNN-based approaches. These neural networks are typically tailored to specific pilot configurations. Recent studies [13]–[15] have explored the potential of diffusion models in channel estimation, using posterior sampling to support arbitrary pilot

**译稿位置：** [源文件第 37 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L37)；**译文候选全文：** 1）基于导频的信道估计

## PDF 第 2 页 · 提取候选 9 项

### GCD-P0007 · 页内坐标 x=61.9, y=95.9

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Pilot-based channel estimation (pilot only) None ✓ ✓ ✓ ✓ [9]–[15]

**译稿位置：** [T012 · 第 63 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L63)；**译文候选全文：** 无线感知和既有地理数据库的发展，使静态环境地图相对容易获得，可据此建立近似的物理环境数字孪生。根据环境几何及收发机位置，可用射线追踪获取信道多径结构 [33]、[34]。即使几何存在误差，材料、天线方向图等多种因素不可观测，这些结构特征仍能作为有用先验；少量导频得到的即时估计则可补偿几何误差及其他未知因素。因而，无需电磁材料属性的未标定数字孪生也可有效辅助 CSI 获取。从网络训练角度看，几何先验还提供场景上下文，使网络可通过多场景协同训练抽取共性知识，改善新场景泛化。

**自动匹配线索：** channel→信道、estimation→估计、pilot→导频。

### GCD-P0008 · 页内坐标 x=172.2, y=113.6

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Past channels ✓ ✓ ✓ [16], [17] Position ✓ ✓ ✓ [18], [19] Real-time sensing ✓ ✓ ✓ [20] Radio environment ✓ ✓ [21]–[26]

**译稿位置：** [T013 · 第 65 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L65)；**译文候选全文：** 虽然与数字孪生 [35] 或信道知识地图（CKM）[36] 辅助导频估计的研究有共同点，但本文存在三方面区别。第一，理想数字孪生既要求误差远小于波长的极高几何精度，也需要采集与计算资源校准环境材料的未知电磁参数 [21]。本文仅用近似几何产生结构信息，并通过随机提示增强消除未知路径幅度、相位的干扰。第二，实时数字孪生往往需要在线射线追踪 [34]；本文只在离线阶段进行射线追踪，在线阶段根据用户位置在邻域中查询已有特征。第三，CKM 通常部署于 BS，需要上传用户位置才能查询 [37]，因此更适于上行并可能引发隐私顾虑；本文允许用户端本地储存和查询预提取的结构数据，支持下行 CSI 获取，同时不必向 BS 泄露用户精确位置。

**自动匹配线索：** environment→环境、21、[21]。

### GCD-P0009 · 页内坐标 x=65.3, y=126.8

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Pilot-free channel prediction (auxiliary information only)

**译稿位置：** [T013 · 第 65 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L65)；**译文候选全文：** 虽然与数字孪生 [35] 或信道知识地图（CKM）[36] 辅助导频估计的研究有共同点，但本文存在三方面区别。第一，理想数字孪生既要求误差远小于波长的极高几何精度，也需要采集与计算资源校准环境材料的未知电磁参数 [21]。本文仅用近似几何产生结构信息，并通过随机提示增强消除未知路径幅度、相位的干扰。第二，实时数字孪生往往需要在线射线追踪 [34]；本文只在离线阶段进行射线追踪，在线阶段根据用户位置在邻域中查询已有特征。第三，CKM 通常部署于 BS，需要上传用户位置才能查询 [37]，因此更适于上行并可能引发隐私顾虑；本文允许用户端本地储存和查询预提取的结构数据，支持下行 CSI 获取，同时不必向 BS 泄露用户精确位置。

**自动匹配线索：** channel→信道。

### GCD-P0010 · 页内坐标 x=174.1, y=157.2

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** Past channels ✓ ✓ ✓ ✓ [27] Position ✓ ✓ ✓ ✓ [28] Real-time sensing ✓ ✓ ✓ ✓ [29] Channel dataset ✓ ✓ ✓ ✓ [28], [30] Geometry ✓ ✓ ✓ ✓ ✓ Ours

**译稿位置：** [T013 · 第 65 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L65)；**译文候选全文：** 虽然与数字孪生 [35] 或信道知识地图（CKM）[36] 辅助导频估计的研究有共同点，但本文存在三方面区别。第一，理想数字孪生既要求误差远小于波长的极高几何精度，也需要采集与计算资源校准环境材料的未知电磁参数 [21]。本文仅用近似几何产生结构信息，并通过随机提示增强消除未知路径幅度、相位的干扰。第二，实时数字孪生往往需要在线射线追踪 [34]；本文只在离线阶段进行射线追踪，在线阶段根据用户位置在邻域中查询已有特征。第三，CKM 通常部署于 BS，需要上传用户位置才能查询 [37]，因此更适于上行并可能引发隐私顾虑；本文允许用户端本地储存和查询预提取的结构数据，支持下行 CSI 获取，同时不必向 BS 泄露用户精确位置。

**自动匹配线索：** channel→信道、geometry→几何。

### GCD-P0011 · 页内坐标 x=61.4, y=175.8

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Hybrid channel acquisition (pilot & auxiliary information)

**译稿位置：** [T014 · 第 67 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L67)；**译文候选全文：** 主要贡献为：建立基于可获得几何路径参数的 GCD 框架，用信道推断网络融合 DT 结构特征与基于导频的部分 CSI；提出随机提示增强，将简单几何转换为完整 CSI 形式，同时抑制未知因素；构造 GCDNet 与支持可变导频设置的 mGCDNet 两种网络；通过多种实验检验估计精度、几何误差鲁棒性、多场景训练与跨场景泛化。

**自动匹配线索：** channel→信道、pilot→导频。

### GCD-P0012 · 页内坐标 x=49, y=235.1

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** settings. However, such methods still require significant pilot resources to ensure channel estimation quality. In fact, when the multi-path characteristics of the channel are extremely complex, relying solely on limited pilot resources typically fails to provide sufficient channel features. 2) Pilot-Free Channel Prediction: Some studies have focused on achieving pilot-free channel prediction, based on the premise that some available information can be deterministically mapped to complete CSI. For example, the current channel can be predicted using channels from previous time slots [16], [17]. However, the small-scale mobility of users and subtle changes in the environment are often difficult to predict. Additionally, the auto-regressive inference accumulates prediction errors over time, leading to significant degradation in performance. Some studies [18], [19] utilize user positions to predict channel information, which require extremely high positioning accuracy, as any positioning errors comparable to the wavelength can cause drastic changes in prediction results. Furthermore, since the wireless channel is jointly influenced by the user position and the surrounding environment, channel prediction models solely relying on positions lack generalization capabilities in new scenarios. [20] utilizes multi-modal sensing data to achieve adaptive CSI generation in dynamic environment, which ignores the impact of unknown environmental EM characteristics. Other studies focus on reconstructing the physical environment to create a digital twin (DT) that reflect the characteristics of wireless signal propagation. For example, [21]–[23] utilize known environmental geometry and collect measured channel data to calibrate unknown environmental materials or learn EM interactions. The calibrated DT can be provided to a ray tracer to predict channel data at arbitrary positions. In contrast, [24]– [26] focus on reconstructing a wireless radiation field based on measured channel data, without requiring environmental geometry. Despite their effectiveness, these methods still rely on high-precision user positioning, and the calibration or reconstruction process incurs data collection and computational costs for each individual scenario. Furthermore, all these methods overlook the diversity of antenna radiation characteristics, which is influenced by numerous factors such as hardware conditions and user device orientations. As a result, when no pilot resources are available, it is practically only possible to obtain large-scale information – such as received signal

**译稿位置：** [T013 · 第 65 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L65)；**译文候选全文：** 虽然与数字孪生 [35] 或信道知识地图（CKM）[36] 辅助导频估计的研究有共同点，但本文存在三方面区别。第一，理想数字孪生既要求误差远小于波长的极高几何精度，也需要采集与计算资源校准环境材料的未知电磁参数 [21]。本文仅用近似几何产生结构信息，并通过随机提示增强消除未知路径幅度、相位的干扰。第二，实时数字孪生往往需要在线射线追踪 [34]；本文只在离线阶段进行射线追踪，在线阶段根据用户位置在邻域中查询已有特征。第三，CKM 通常部署于 BS，需要上传用户位置才能查询 [37]，因此更适于上行并可能引发隐私顾虑；本文允许用户端本地储存和查询预提取的结构数据，支持下行 CSI 获取，同时不必向 BS 泄露用户精确位置。

**自动匹配线索：** pilot→导频、channel→信道、estimation→估计、users→用户、21、[21]。

### GCD-P0013 · 页内坐标 x=446.6, y=72.9

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Low data collection cost Related works

**译稿位置：** [T014 · 第 67 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L67)；**译文候选全文：** 主要贡献为：建立基于可获得几何路径参数的 GCD 框架，用信道推断网络融合 DT 结构特征与基于导频的部分 CSI；提出随机提示增强，将简单几何转换为完整 CSI 形式，同时抑制未知因素；构造 GCDNet 与支持可变导频设置的 mGCDNet 两种网络；通过多种实验检验估计精度、几何误差鲁棒性、多场景训练与跨场景泛化。

### GCD-P0014 · 页内坐标 x=312, y=235.1

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** strength and channel gain [31], [32] – rather than complete CSI. While such information is useful in certain applications, it cannot be used for more complex wireless tasks, such as symbol detection and precoding in multi-path scenarios. 3) Hybrid Channel Acquisition: Recent studies have enhanced channel estimation by combining pilot resources with auxiliary information. On one hand, the supplementary channel features provided by the auxiliary information significantly reduce pilot overhead; on the other hand, by introducing a small amount of pilot resources, these methods relax the accuracy requirements for the auxiliary information, as some small-scale or unpredictable features can be calibrated through instantaneous estimates from pilots. For example, [27] proposed the channel deduction (CD) framework that combines estimation with prediction, leveraging past channels to provide large-scale features to reduce pilot overhead. [28] proposed position-aided CMixer (PCMixer) that fuses position and channel information to obtain the complete channel, thereby enabling tolerance for positioning errors. To obtain more accurate and scenario-aware features, recent studies have incorporated scenario information to enhance performance and generalization capability. For example, [29] extracts environmental features from multi-view images and combines it with partial CSI to obtain complete CSI. This method requires the mobile terminals to be equipped with sensing facilities and to continuously collect image data. [28] also proposed spatial channel deduction (SCD), which utilizes historical channel datasets from the current scenario to provide largescale features. Similarly, [30] extracts channel knowledge from a full DT to enhance channel estimation. While they achieve outstanding performance, the acquisition of real-world channel data is expensive, whereas the full DT requires accurate and comprehensive environmental information, leading to high costs for deployment in new scenarios. For clarity, we summarize relevant studies in Table I.

**译稿位置：** [T014 · 第 67 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L67)；**译文候选全文：** 主要贡献为：建立基于可获得几何路径参数的 GCD 框架，用信道推断网络融合 DT 结构特征与基于导频的部分 CSI；提出随机提示增强，将简单几何转换为完整 CSI 形式，同时抑制未知因素；构造 GCDNet 与支持可变导频设置的 mGCDNet 两种网络；通过多种实验检验估计精度、几何误差鲁棒性、多场景训练与跨场景泛化。

**自动匹配线索：** channel→信道、estimation→估计、pilot→导频、accuracy→精度。

### GCD-P0015 · 页内坐标 x=312, y=663.6

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** C. 动机与贡献。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** C. Motivations and Contributions Recent advances in radio sensing technologies and existing geographic databases enable us to easily obtain static environmental maps, thereby supporting the construction of an approximate DT of the physical world. By utilizing the environmental geometry and transceiver positions, the multipath structure of the channel can be obtained using a ray tracer

**译稿位置：** [T012 · 第 63 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L63)；**译文候选全文：** 无线感知和既有地理数据库的发展，使静态环境地图相对容易获得，可据此建立近似的物理环境数字孪生。根据环境几何及收发机位置，可用射线追踪获取信道多径结构 [33]、[34]。即使几何存在误差，材料、天线方向图等多种因素不可观测，这些结构特征仍能作为有用先验；少量导频得到的即时估计则可补偿几何误差及其他未知因素。因而，无需电磁材料属性的未标定数字孪生也可有效辅助 CSI 获取。从网络训练角度看，几何先验还提供场景上下文，使网络可通过多场景协同训练抽取共性知识，改善新场景泛化。

**自动匹配线索：** maps→地图、physical→物理、geometry→几何、channel→信道。

## PDF 第 3 页 · 提取候选 9 项

### GCD-P0016 · 页内坐标 x=49, y=56.9

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** [33], [34]. Although these geometric details may contain inaccuracies, and many factors, such as environmental materials and antenna radiation characteristics, remain unobservable, the obtained structural features serve as effective prior information to enhance channel estimation, thereby significantly reducing pilot overhead. Meanwhile, geometric errors and other channel unknowns can be effectively compensated through instantaneous channel estimates using a small amount of pilots. Therefore, an uncalibrated DT without EM material properties is sufficient to effectively assist in channel acquisition. Furthermore, from the perspective of neural network training, geometric prior also introduces scenario-related context, enabling the neural network to extract common knowledge across different scenarios through multi-scenario collaborative learning, thereby demonstrating strong generalization capabilities in new scenarios. Although our main idea shares the same spirit as recent studies that use DT [35] or channel knowledge map (CKM) [36] to enhance pilot-based channel estimation, it also differs significantly from these work in the following aspects. First, an ideal DT not only requires extremely high geometric accuracy with errors much smaller than the wavelength, but also entails substantial costs for data collection and computation to calibrate the unknown EM material properties [21]. In contrast, we use an approximate geometric map without specific material properties to provide only the channel structures and then generate appropriate prompts with them using a novel random prompt augmentation mechanism, which suppresses the disturbance of other channel unknowns, such as the amplitude attenuation and phase shift of each path. Second, real-time DTs require online ray tracing to continuously update channel features, which incurs significant computational overhead and inference latency [34]. In contrast, we employ only offline ray tracing to pre-extract channel features, and during online inference, we simply query them via neighborhood sampling based on user position, thereby avoiding the high costs associated with real-time ray tracing. Third, the CKM-based approaches typically maintain the CKM at the BS and require user positions for online CKM query [37], thus they are in general more suitable for uplink channel acquisition and may incur user privacy concerns. In contrast, our method stores and samples the pre-extracted channel features at the user end, which not only provides a solution for downlink CSI acquisition that usually involves more challenging spatial domain interpolation, but also completely circumvents the privacy issues. The main contributions of this paper are as follows:

**译稿位置：** [T016 · 第 75 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L75)；**译文候选全文：** 考虑从发射天线到接收天线的一条单频波传播链路 [38, 第 3 章]。天线的方向依赖辐射方向图定义为 $\mathbf g(\widehat{\mathbf k})=g(\widehat{\mathbf k})\widehat{\boldsymbol\psi}(\widehat{\mathbf k})$，其中 $\widehat{\mathbf k}$ 是三维辐射方向单位向量，$g$ 是复幅度增益，$\widehat{\boldsymbol\psi}$ 表示天线极化，即电场振荡方向。归一化约定 $g=1$ 对应无损各向同性天线。电场远场与 $d^{-1}e^{-jkd}\mathbf g(\widehat{\mathbf k})$ 成比例，$d$ 为传播距离，$k$ 为波数。

**自动匹配线索：** antenna→天线。

### GCD-P0017 · 页内坐标 x=59.8, y=618.8

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** • We conduct a detailed theoretical analysis of the channel model, treat geometric path parameters as easily obtainable channel features, and propose the geometryaided channel deduction (GCD) framework based on our analysis. This framework employs a channel deduction network to fuse geometric features extracted from the DT with pilot-based partial estimates, thereby deriving the complete channel.

**译稿位置：** [T017 · 第 77 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L77)；**译文候选全文：** 一般传播信道包含 $N_p$ 条路径。第 $p$ 条路径有长度 $d_p$、发射端出发方向 $\widehat{\mathbf k}_{T,p}$、接收端到达方向 $\widehat{\mathbf k}_{R,p}$ 及散射矩阵 $\boldsymbol\Xi_p=\xi_p\boldsymbol\Psi_p\in\mathbb C^{3\times3}$。$\xi_p$ 表示与环境电磁交互有关的复衰减和相移，$\boldsymbol\Psi_p$ 则表征不同极化分量间的相对幅相作用。LoS 路径满足 $\boldsymbol\Xi_p=\mathbf I$。

**自动匹配线索：** channel→信道。

### GCD-P0018 · 页内坐标 x=59.8, y=714.4

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** • We introduce random prompt augmentation, an innovative method to construct CSI prompts from simple structural information. This method not only converts geometric

**译稿位置：** [T017 · 第 77 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L77)；**译文候选全文：** 一般传播信道包含 $N_p$ 条路径。第 $p$ 条路径有长度 $d_p$、发射端出发方向 $\widehat{\mathbf k}_{T,p}$、接收端到达方向 $\widehat{\mathbf k}_{R,p}$ 及散射矩阵 $\boldsymbol\Xi_p=\xi_p\boldsymbol\Psi_p\in\mathbb C^{3\times3}$。$\xi_p$ 表示与环境电磁交互有关的复衰减和相移，$\boldsymbol\Psi_p$ 则表征不同极化分量间的相对幅相作用。LoS 路径满足 $\boldsymbol\Xi_p=\mathbf I$。

### GCD-P0019 · 页内坐标 x=331.9, y=56.9

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** structural features into a complete CSI-like representation, helping the network fuse channel information from different modalities, but also suppresses other unknown features, enabling the network to fully leverage dominant structural information.

**译稿位置：** [T017 · 第 77 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L77)；**译文候选全文：** 一般传播信道包含 $N_p$ 条路径。第 $p$ 条路径有长度 $d_p$、发射端出发方向 $\widehat{\mathbf k}_{T,p}$、接收端到达方向 $\widehat{\mathbf k}_{R,p}$ 及散射矩阵 $\boldsymbol\Xi_p=\xi_p\boldsymbol\Psi_p\in\mathbb C^{3\times3}$。$\xi_p$ 表示与环境电磁交互有关的复衰减和相移，$\boldsymbol\Psi_p$ 则表征不同极化分量间的相对幅相作用。LoS 路径满足 $\boldsymbol\Xi_p=\mathbf I$。

**自动匹配线索：** channel→信道。

### GCD-P0020 · 页内坐标 x=322.8, y=116.7

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** • We present two neural network implementations for channel information fusion. One is GCDNet, which builds upon existing advanced learning architecture; the other is mGCDNet, which integrates pilot positional information to support variable pilot configurations. By enriching the training data diversity, mGCDNet improves versatility and enables more comprehensive learning.

**译稿位置：** [T017 · 第 77 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L77)；**译文候选全文：** 一般传播信道包含 $N_p$ 条路径。第 $p$ 条路径有长度 $d_p$、发射端出发方向 $\widehat{\mathbf k}_{T,p}$、接收端到达方向 $\widehat{\mathbf k}_{R,p}$ 及散射矩阵 $\boldsymbol\Xi_p=\xi_p\boldsymbol\Psi_p\in\mathbb C^{3\times3}$。$\xi_p$ 表示与环境电磁交互有关的复衰减和相移，$\boldsymbol\Psi_p$ 则表征不同极化分量间的相对幅相作用。LoS 路径满足 $\boldsymbol\Xi_p=\mathbf I$。

**自动匹配线索：** channel→信道。

### GCD-P0021 · 页内坐标 x=322.8, y=200.3

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** • We conduct extensive experiments to evaluate the proposed schemes. The results demonstrate their excellent channel acquisition accuracy and strong robustness against non-ideal geometric information. Furthermore, by incorporating multiple scenarios into the training process, we further enhance their overall learning performance and generalization capability.

**译稿位置：** [T019 · 第 81 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L81)；**译文候选全文：** 信道频率响应为

**自动匹配线索：** channel→信道。

### GCD-P0022 · 页内坐标 x=312, y=288.1

**原文章节（自动识别）：** Index Terms—Channel acquisition, channel deduction, digital twin, ray tracing, cross-scenario g…。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** The remainder of this paper is organized as follows. Section II introduces the channel model and analyzes the availability of various channel features. Based on this analysis, Section III proposes the GCD framework and details its implementation. Section IV provides performance evaluation of proposed schemes. Finally, Section V concludes this paper.

**译稿位置：** [T019 · 第 81 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L81)；**译文候选全文：** 信道频率响应为

**自动匹配线索：** channel→信道。

### GCD-P0023 · 页内坐标 x=312, y=420.7

**原文章节（自动识别）：** A. Electromagnetic Wave Propagation。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** This subsection formulates the channel response of a singlefrequency wave propagating from a transmitting antenna to a receiving antenna [38, Chapter 3]. The direction-dependent radiation pattern of an antenna is defined as g(bk) = g(bk) b ψ(bk), where bk is a 3D unit vector representing the radiation direction, g(bk) is the complex amplitude gain, and b ψ(bk) represents the antenna polarization, i.e., the oscillation orientation of the transmitted field. g(bk) is normalized such that g(bk) = 1 corresponds to a lossless isotropic antenna1. Under this definition, the electric far field of an antenna is proportional to (1/d)e-jkdg(bk), where d is the propagation distance and k is the wavenumber. Generally, the propagation channel consists of Np paths, where the p-th path has the following properties: path length dp, departure direction bkT,p at the transmitter, arrival direction bkR,p at the receiver, and scattering matrix Ξp = ξpΨp ∈ C3×3, where ξp ∈C represents the attenuation and phase shift due to EM interactions between the wave and the scattering environment, and Ψp ∈ C3×3 accounts for the relative attenuations and phase shifts between different polarization components of the field. For the line-of-sight (LoS) path, Ξp is the identity matrix, i.e., Ξp = I.

**译稿位置：** [T017 · 第 77 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L77)；**译文候选全文：** 一般传播信道包含 $N_p$ 条路径。第 $p$ 条路径有长度 $d_p$、发射端出发方向 $\widehat{\mathbf k}_{T,p}$、接收端到达方向 $\widehat{\mathbf k}_{R,p}$ 及散射矩阵 $\boldsymbol\Xi_p=\xi_p\boldsymbol\Psi_p\in\mathbb C^{3\times3}$。$\xi_p$ 表示与环境电磁交互有关的复衰减和相移，$\boldsymbol\Psi_p$ 则表征不同极化分量间的相对幅相作用。LoS 路径满足 $\boldsymbol\Xi_p=\mathbf I$。

**自动匹配线索：** channel→信道、matrix→矩阵、environment→环境。

### GCD-P0024 · 页内坐标 x=312, y=721.1

**原文章节（自动识别）：** A. Electromagnetic Wave Propagation。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** θ, φ are the zenith and azimuth angles defining the radiation direction bk = [sin θ cos φ, sin θ sin φ, cos θ]T, and η is the antenna efficiency, i.e., the proportion of the input power that is converted into radiation.

**译稿位置：** [T020 · 第 88 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L88)；**译文候选全文：** $f$ 是载波频率，$c$ 为光速。发射和接收天线方向图分别为 $\mathbf g_T,\mathbf g_R$，路径系数为

**自动匹配线索：** antenna→天线。

## PDF 第 4 页 · 提取候选 11 项

### GCD-P0025 · 页内坐标 x=58.9, y=56.9

**原文章节（自动识别）：** A. Electromagnetic Wave Propagation。**目标译稿章节：** A. 电磁波传播。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** The channel frequency response can be expressed as

**译稿位置：** [T020 · 第 88 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L88)；**译文候选全文：** $f$ 是载波频率，$c$ 为光速。发射和接收天线方向图分别为 $\mathbf g_T,\mathbf g_R$，路径系数为

**自动匹配线索：** frequency→频率。

### GCD-P0026 · 页内坐标 x=49, y=112.1

**原文章节（自动识别）：** A. Electromagnetic Wave Propagation。**目标译稿章节：** A. 电磁波传播。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** where f is the frequency, τp = dp/c is the propagation delay of the p-th path, and c denotes the speed of light. Let the radiation patterns of the transmitting and receiving antennas be gT(bk) = gT(bk) b ψT(bk) and gR(bk) = gR(bk) b ψR(bk), respectively. Then the path coefficient αp ∈C is given by

**译稿位置：** [T020 · 第 88 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L88)；**译文候选全文：** $f$ 是载波频率，$c$ 为光速。发射和接收天线方向图分别为 $\mathbf g_T,\mathbf g_R$，路径系数为

**自动匹配线索：** frequency→频率、antennas→天线。

### GCD-P0027 · 页内坐标 x=49, y=205.6

**原文章节（自动识别）：** A. Electromagnetic Wave Propagation。**目标译稿章节：** A. 电磁波传播。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** which accounts for the propagation distance, antenna patterns, EM interactions between the wave and the environment, as well as the polarization mismatch between the incident wave and the receiving antenna.

**译稿位置：** [T021 · 第 97 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L97)；**译文候选全文：** 这一表达考虑传播距离、天线辐射、环境电磁交互以及入射与接收极化失配。

**自动匹配线索：** antenna→天线、environment→环境。

### GCD-P0028 · 页内坐标 x=49, y=282.4

**原文章节（自动识别）：** B. Channel Model。**目标译稿章节：** B. 信道模型。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** We consider a MIMO system employing orthogonal frequency division multiplexing (OFDM), where a base station (BS) equipped with Nt antennas serves single-antenna users via Nc subcarriers. The downlink channel from the BS to a single user is represented by the spatial-frequency domain channel matrix H ∈CNt×Nc. The frequency offset of the nc-th subcarrier is ∆fnc = nc∆f, where ∆f is the subcarrier spacing. Let dnt denote the relative position of the nt-th BS antenna with respect to the local origin. Assuming that the wavefront at the BS is locally planar, the antenna’s relative position results in the delay difference of ∆τnt,p = -dT ntbkT,p/c. By introducing frequency offsets and delay differences into (1), the frequency response for the nt-th antenna and nc-th subcarrier is

**译稿位置：** [T022 · 第 101 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L101)；**译文候选全文：** 考虑包含 $N_t$ 根 BS 天线和 $N_c$ 个子载波的 MIMO-OFDM 系统，BS 服务单天线用户。下行空频域信道记为 $\mathbf H\in\mathbb C^{N_t\times N_c}$。第 $n_c$ 个子载波相对频率偏移为 $\Delta f_{n_c}=n_c\Delta f$，$\Delta f$ 是子载波间距。令 $\mathbf d_{n_t}$ 表示第 $n_t$ 根 BS 天线相对本地原点的位置。假设 BS 端波前局部为平面波，由天线相对位置导致的传播延迟差为 $\Delta\tau_{n_t,p}=-\mathbf d_{n_t}^\mathsf T\widehat{\mathbf k}_{T,p}/c$。将频率与延迟偏移代入式（1），得到

**自动匹配线索：** frequency→频率、antennas→天线、users→用户、channel→信道。

### GCD-P0029 · 页内坐标 x=115.5, y=498

**原文章节（自动识别）：** B. Channel Model。**目标译稿章节：** B. 信道模型。**状态：** 非正文候选：疑似图表标签。

**原文全文（PDF 文本层）：** p=1 αpe-j2πfτpe-j2πnc∆fτpejkdT nt bkT,p. (4)

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0030 · 页内坐标 x=49, y=528.4

**原文章节（自动识别）：** B. Channel Model。**目标译稿章节：** B. 信道模型。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** To estimate the real-time channel, Nt,π antennas and Nc,π subcarriers are used to transmit non-precoded pilots, enabling the acquisition of the partial channel Hπ = H[Ω] ∈ CNt,π×Nc,π, where Ω= Ωt × Ωc is a subset of antennasubcarrier indices, and × denotes the Cartesian product. We assume that the pilots are evenly spaced in the Nt×Nc spatialfrequency grid. Therefore, the pilot pattern can be expressed in the following form:

**译稿位置：** [T024 · 第 117 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L117)；**译文候选全文：** 利用 $N_{t,\pi}$ 根天线、$N_{c,\pi}$ 个子载波发送未预编码导频，得到部分信道 $\mathbf H_\pi=\mathbf H[\Omega]\in\mathbb C^{N_{t,\pi}\times N_{c,\pi}}$，其中 $\Omega=\Omega_t\times\Omega_c$ 为导频在天线—子载波索引中的笛卡儿积。假设导频在 $N_t\times N_c$ 网格中均匀间隔，图样为

**自动匹配线索：** channel→信道、antennas→天线、pilots→导频、pilot→导频。

### GCD-P0031 · 页内坐标 x=49, y=690.4

**原文章节（自动识别）：** B. Channel Model。**目标译稿章节：** B. 信道模型。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** where Rt and St denote the interval and the start of antenna indices in the spatial domain, while Rc and Sc denote those of subcarrier indices in the frequency domain. Specifically, within each coherence time block, during which the channel state is approximately constant, the BS

**译稿位置：** [T025 · 第 129 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L129)；**译文候选全文：** $R_t,S_t$ 分别是空间域天线导频的间隔和起点，$R_c,S_c$ 是频域子载波导频的间隔和起点。具体而言，在一个近似不变的信道相干块内，BS 在 $\Omega_c$ 中各子载波上进行 $N_q\ge N_{t,\pi}$ 次导频传输。第 $q$ 次在子载波 $n_c\in\Omega_c$ 上收到 $y_{q,n_c}=\mathbf h_{n_c}^\mathsf T\mathbf x_{q,n_c}+w_{q,n_c}$，其中 $\|\mathbf x_{q,n_c}\|_2^2=P$，噪声 $w_{q,n_c}\sim\mathcal{CN}(0,\sigma_w^2)$。

**自动匹配线索：** antenna→天线、coherence→相干、channel→信道。

### GCD-P0032 · 页内坐标 x=312, y=56.7

**原文章节（自动识别）：** B. Channel Model。**目标译稿章节：** B. 信道模型。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** transmits pilot symbols on each subcarrier in Ωc through Nq transmissions (Nq ≥Nt,π). In the q-th transmission, the received signal at the user on the nc-th subcarrier (nc ∈Ωc) is given by yq,nc = hT ncxq,nc + wq,nc, where hnc = H[: , nc] ∈CNt is the channel response on the nc-th subcarrier, xq,nc ∈CNt is the pilot vector for the q-th transmission, which satisfies ∥xq,nc∥2 2 = P, with P being the transmit power, and wq,nc ∼CN(0, σ2 w) is the thermal noise, with σ2 w being the thermal noise power. Based on a pilot transmission scheme similar to that in [39], we assume Nq = Nt,π, and on each subcarrier in Ωc, the antennas in Ωt transmit pilot symbols successively through the Nq transmissions, with the nt-th antenna (nt ∈Ωt) corresponding to the q(nt)-th transmission. In this case, each pilot vector xq,nc has only one non-zero element xq(nt),nc corresponding to the nt-th antenna, and the channel hnt,nc = H[nt, nc] at pilot positions can be simply estimated as h′ nt,nc = yq(nt),nc/xq(nt),nc = hnt,nc+ ewq(nt),nc, where ewq(nt),nc = wq(nt),nc/xq(nt),nc ∼CN(0, eσ2 w) is the estimation noise, eσ2 w = σ2 w/P is the estimation noise power. In this paper, by default, we consider the ideal noise-free case where the clean partial CSI Hπ can be obtained.

**译稿位置：** [T026 · 第 131 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L131)；**译文候选全文：** 按 [39] 的方案，取 $N_q=N_{t,\pi}$，$\Omega_t$ 中各天线在不同传输时隙轮流发送导频。于是每个导频向量只有一项非零，在导频位置能直接估计 $h'_{n_t,n_c}=y_{q(n_t),n_c}/x_{q(n_t),n_c}=h_{n_t,n_c}+\widetilde w_{q(n_t),n_c}$，其中估计噪声方差 $\widetilde\sigma_w^2=\sigma_w^2/P$。除专门的噪声实验外，论文默认能够获得无噪声的部分 CSI $\mathbf H_\pi$。

**自动匹配线索：** pilot→导频、noise→噪声、antennas→天线、antenna→天线、39、[39]。

### GCD-P0033 · 页内坐标 x=312, y=368.6

**原文章节（自动识别）：** C. Obtainable Channel Features We rewrite the MIMO-OFDM channel (4) as follows:。**目标译稿章节：** C. 可获取的信道特征。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** where ϕnt,nc, eα ∈CNp are Np-dimensional vectors, whose p-th elements are respectively defined as

**译稿位置：** [T027 · 第 135 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L135)；**译文候选全文：** 将式（4）改写为

### GCD-P0034 · 页内坐标 x=367.5, y=398.7

**原文章节（自动识别）：** C. Obtainable Channel Features We rewrite the MIMO-OFDM channel (4) as follows:。**目标译稿章节：** C. 可获取的信道特征。**状态：** 非正文候选：疑似图表标签。

**原文全文（PDF 文本层）：** ϕnt,nc,p = e-j2πnc∆fτpejkdT nt bkT,p, (7)

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0035 · 页内坐标 x=312, y=435.4

**原文章节（自动识别）：** C. Obtainable Channel Features We rewrite the MIMO-OFDM channel (4) as follows:。**目标译稿章节：** C. 可获取的信道特征。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** The first component of the channel model, ϕnt,nc, contains the phase offset caused by the nt-th antenna and nc-th subcarrier, which is determined by {(dp, bkT,p)}Np p=1 and (f, ∆f, dnt). The path parameters {(dp, bkT,p)}Np p=1, which serve as the geometric features describing the channel structure, can be obtained using ray tracing as long as the environmental map and the positions of the BS and the user are available. In practical applications, the BS can obtain the environmental map through radio sensing technologies or geographic information system (GIS), while the BS and the user can obtain their respective positions via global navigation satellite system (GNSS). However, for privacy reasons, the BS and users may be reluctant to disclose their positions externally. It should be noted that the acquired geometric information may exhibit errors that render the high-frequency phase term e-j2πfτp unpredictable [40]. Hence, we exclude e-j2πfτp from the expression of ϕnt,nc and incorporate it into the second component eα. As for (f, ∆f, dnt), these are fixed system configurations determined by frequency band allocation and antenna array layout, and we assume they can be obtained with precision. Consequently, ϕnt,nc can be computed using the available information. In contrast, the second component, eα, is typically unobtainable. To gain deeper insights into eα, we substitute αp in (8) with (2), yielding the following complete expression:

**译稿位置：** [T029 · 第 153 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L153)；**译文候选全文：** $\boldsymbol\phi$ 描述天线与子载波对应的相位偏移，取决于路径几何参数 $\{(d_p,\widehat{\mathbf k}_{T,p})\}_{p=1}^{N_p}$ 与系统参数 $(f,\Delta f,\mathbf d_{n_t})$。只要环境地图、BS 和用户位置已知，就可通过射线追踪得到多径长度与出发方向。实践中，环境地图可通过无线感知或 GIS 获取，位置可由 GNSS 等提供，但出于隐私考虑，收发方可能不愿向外部透露位置。

**自动匹配线索：** gnss、antenna→天线、parameters→参数、geometric→几何、ray→射线。

## PDF 第 5 页 · 提取候选 4 项

### GCD-P0036 · 页内坐标 x=49, y=301.5

**原文章节（自动识别）：** C. Obtainable Channel Features We rewrite the MIMO-OFDM channel (4) as follows:。**目标译稿章节：** C. 可获取的信道特征。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** which is the product of several factors. The only factor that can be explicitly obtained is λ/(4πdp), which describes the large-scale attenuation determined by the propagation distance. The scattering matrix Ξp depends on the EM properties of environmental materials, while the antenna patterns gT(bkT,p) and gR(bkR,p) depend on hardware conditions and antenna orientations. These factors are typically difficult to obtain. Furthermore, as mentioned earlier, the high-frequency term e-j2πfτp is unpredictable due to geometric errors. From the above analysis, it can be seen that ϕnt,nc represents the known structural features projected onto the nt-th antenna and nc-th subcarrier, whereas eα represents unknown information shared across different antennas and subcarriers. Therefore, although the channel data has a high dimension of O(NtNc), the dimension of the underlying unknown features is quite low. Thus, by fully leveraging available geometric prior information, the unknown features can be compensated with minimal pilot overhead, thereby achieving complete channel acquisition.

**译稿位置：** [T032 · 第 167 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L167)；**译文候选全文：** 其中唯一可直接确定的是传播距离给出的衰减 $\lambda/(4\pi d_p)$。散射矩阵取决于材料电磁性质，收发天线方向图则取决于硬件状态和设备朝向，高频相位又对几何误差敏感。所以 $\boldsymbol\phi$ 表示可获得的结构信息在天线与子载波上的投影，而 $\widetilde{\boldsymbol\alpha}$ 表示跨天线与子载波共享的未知信息。虽然 CSI 维度达到 $O(N_tN_c)$，潜在未知路径系数的维数却相对较低。利用已知几何信息可减少需要由导频补偿的未知量。

**自动匹配线索：** matrix→矩阵、antenna→天线、geometric→几何、antennas→天线。

### GCD-P0037 · 页内坐标 x=49, y=559

**原文章节（自动识别）：** III. PROPOSED FRAMEWORK。**目标译稿章节：** III. 所提框架。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** To leverage available structural features and improve channel acquisition efficiency, we propose a novel framework named geometry-aided channel deduction (GCD). As shown in Fig. 1, the BS maintains an uncalibrated DT as the scenario representation, which consists of the BS position and an approximate environmental map. The user retrieves geometric features from the scenario representation based on its own position and converts them into the scenario prompt using known system configurations, thereby providing contextual information about the scenario. Meanwhile, the instantaneous channel is partially estimated by the user based on the received signal and known pilots. Finally, a neural network deployed at the user side fuses the partial channel estimate with the scenario prompt to generate the complete channel. The following subsections detail the proposed framework, which is illustrated in Fig. 2(a).

**译稿位置：** [T033 · 第 173 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L173)；**译文候选全文：** 为利用已知结构信息提升信道获取效率，本文提出 GCD 框架。BS 维护一个未标定 DT，包含 BS 位置与近似环境地图。用户在本地根据其位置检索 DT 几何特征，并结合已知系统配置转为场景提示。同时，用户从导频及接收信号估计部分瞬时信道。最终在用户端部署神经网络，融合提示与部分 CSI 并生成完整 CSI。图 2(a) 展示具体流程。

**自动匹配线索：** channel→信道、framework→框架、map→地图、user→用户。

### GCD-P0038 · 页内坐标 x=312, y=72.1

**原文章节（自动识别）：** A. Geometric Feature Extraction。**目标译稿章节：** A. 几何特征提取。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Although the multi-path structure can be obtained via ray tracing based on the environmental map and transceiver positions, there are several drawbacks to directly applying this method. First, ray tracing requires positional information from both the BS and the user, which raises privacy concerns because regardless of which one performs the ray tracing, the other must disclose its position. Furthermore, the user position is constantly changing, which means ray tracing must be repeatedly performed based on real-time user positions. This consumes substantial computational resources and results in significant inference latency [34]. Considering these issues, we enable the BS to pre-extract multi-path features offline without requiring actual user positions. We first sample N virtual user positions x1, · · · , xN in the environmental map, ensuring these positions roughly cover the activity area of potential users. We then perform ray tracing using these positions to obtain the geometric feature set F = {(P1, x1), · · · , (PN, xN)}, where Pi = {(di,p, bki,p)}Np,i p=1 represents the channel structure at xi, Np,i denotes the number of paths from the BS to xi, and di,p, bki,p represent the length and departure direction of each path, respectively. Since F contains only path parameters at a finite number of discrete positions, F serves as a compact scenario representation with a small data volume and can be provisioned to the user during initial access and maintained at the user side. For multiple users within the same scenario, the same F can also be shared via broadcast or multicast, thereby reducing redundant transmission overhead. Once the user has obtained the complete information of F, the user is able to search for the nearest neighbors among the virtual user positions x1, · · · , xN within F based on its own position x, with its positional information used only locally. We denote the n nearest virtual user positions as xi1, · · · , xin and their corresponding channel structure as Pi1, · · · , Pin. Given the high similarity of scattering environment within the spatial neighborhood, the structural features at position x can be well approximated by those at its neighbors.

**译稿位置：** [T034 · 第 177 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L177)；**译文候选全文：** 直接根据真实用户位置在线射线追踪存在两个缺点：必须在 BS 与用户之间交换位置，造成隐私顾虑；用户位置变化又要求反复进行实时射线追踪，导致较大的计算开销和推理时延 [34]。

**自动匹配线索：** ray→射线、user→用户、computational→计算、users→用户、34、[34]。

### GCD-P0039 · 页内坐标 x=312, y=547

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Our proposed framework needs to fuse the geometric features and the partial CSI, which belong to different modalities and exhibit significant differences in data format. To ensure more learnable intra-modal fusion, we convert the geometric features Pi (i = i1, · · · , in) into the complete channel representation eHi ∈CNt×Nc, which serves as the contextual prompt that can be directly fused with the partial CSI Hπ. This modality alignment process appears similar to the process in vision-language models that converts images into the text representation (i.e., tokens). However, unlike the semantic relationship between text and images that is primarily determined by human cognition, the relationship between path parameters and channel responses is strictly constrained by the physical laws [41]. Simply applying a learnable module to transform these two modalities into the same feature space cannot guarantee compliance with the physical constraints, thereby reducing learning efficiency. Instead, we propose

**译稿位置：** [T038 · 第 193 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L193)；**译文候选全文：** GCD 要融合的几何特征与部分 CSI 属于不同模态，数据格式差异较大。为便于在同一表示空间中学习，作者把各 $\mathcal P_i$ 转为完整形状的伪信道 $\widetilde{\mathbf H}_i\in\mathbb C^{N_t\times N_c}$，作为能够与 $\mathbf H_\pi$ 直接融合的上下文提示。该模态对齐看似类似视觉语言模型把图像转换为文本 token，但路径参数和信道响应之间受确定的物理规律约束 [41]，若仅让可学习模块自行寻找映射，未必符合传播规律。随机提示增强不直接学习这种映射，而是根据式（6）的物理信道形式手动计算伪信道，让后续网络以和真实 CSI 相同的形式处理它。

**自动匹配线索：** geometric→几何、data→数据、channel→信道、models→模型、41、[41]。

## PDF 第 6 页 · 提取候选 9 项

### GCD-P0040 · 页内坐标 x=206.7, y=60

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** BS Side (Offline) User Side (Online)

**译稿位置：** [T038 · 第 193 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L193)；**译文候选全文：** GCD 要融合的几何特征与部分 CSI 属于不同模态，数据格式差异较大。为便于在同一表示空间中学习，作者把各 $\mathcal P_i$ 转为完整形状的伪信道 $\widetilde{\mathbf H}_i\in\mathbb C^{N_t\times N_c}$，作为能够与 $\mathbf H_\pi$ 直接融合的上下文提示。该模态对齐看似类似视觉语言模型把图像转换为文本 token，但路径参数和信道响应之间受确定的物理规律约束 [41]，若仅让可学习模块自行寻找映射，未必符合传播规律。随机提示增强不直接学习这种映射，而是根据式（6）的物理信道形式手动计算伪信道，让后续网络以和真实 CSI 相同的形式处理它。

### GCD-P0041 · 页内坐标 x=49, y=254.8

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** random prompt augmentation, which manually computes a pseudo channel eHi based on the channel model using the path parameters Pi, thus strictly adhering to the physical constraints and perfectly transforming the path parameters into a channel representation. The subsequent neural network can process the pseudo channel the same as real channels, thereby achieving seamless modality alignment. We assume that eHi[nt, nc] has a form similar to that in (6), i.e., ϕT i,nt,nc eαi. Here, the first component ϕi,nt,nc ∈CNp,i is obtainable given the multi-path structure and system configurations, and its p-th element can be calculated as in (7):

**译稿位置：** [T038 · 第 193 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L193)；**译文候选全文：** GCD 要融合的几何特征与部分 CSI 属于不同模态，数据格式差异较大。为便于在同一表示空间中学习，作者把各 $\mathcal P_i$ 转为完整形状的伪信道 $\widetilde{\mathbf H}_i\in\mathbb C^{N_t\times N_c}$，作为能够与 $\mathbf H_\pi$ 直接融合的上下文提示。该模态对齐看似类似视觉语言模型把图像转换为文本 token，但路径参数和信道响应之间受确定的物理规律约束 [41]，若仅让可学习模块自行寻找映射，未必符合传播规律。随机提示增强不直接学习这种映射，而是根据式（6）的物理信道形式手动计算伪信道，让后续网络以和真实 CSI 相同的形式处理它。

**自动匹配线索：** channel→信道、model→模型、parameters→参数、physical→物理。

### GCD-P0042 · 页内坐标 x=100.5, y=391.1

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 非正文候选：疑似图表标签。

**原文全文（PDF 文本层）：** ϕi,nt,nc,p = e-j2πnc∆fτi,pejkdT nt bki,p, (10)

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0043 · 页内坐标 x=49, y=413.8

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** and τi,p = di,p/c. Based on our previous analysis of (9), each element eαi,p of the second component eαi is the product of a large-scale attenuation factor λ/(4πdi,p) and a series of unknown factors. To handle the unknown channel parameters in eαi, we introduce a placeholder vector ezi ∈CNp,i to replace eαi, and compute eHi as follows:

**译稿位置：** [T040 · 第 204 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L204)；**译文候选全文：** 而未知路径复系数由随机占位向量 $\widetilde{\mathbf z}_i$ 替代：

### GCD-P0044 · 页内坐标 x=125.2, y=491

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 非正文候选：疑似图表标签。

**原文全文（PDF 文本层）：** eHi[nt, nc] = ϕT i,nt,nc ezi, (11)

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0045 · 页内坐标 x=49, y=511.9

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** where each element of ezi is modeled as a random variable obeying the complex Gaussian distribution:

**译稿位置：** [T041 · 第 216 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L216)；**译文候选全文：** $\sigma_z$ 控制未知因素的幅度尺度，实验设为 0.5，作者称方法对此参数不敏感。

### GCD-P0046 · 页内坐标 x=49, y=570.6

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** and σz is a hyperparameter that controls the magnitude scale of the unknown factors. Our method is robust to the selection of σz. In our experiments, σz is set to 0.5. The random placeholders introduced here serve multiple purposes. First, they supplement unknown information within the channels, converting known multi-path structure into the complete channel representation. This enables the subsequent neural network to fuse different channel information within the same feature space. Second, by introducing different realizations of the random placeholder for each pseudo channel, the neural network suppresses the influence of these unknown channel parameters, thereby focusing on exploiting useful known structural information shared by all pseudo channels. This is because the neural network is unlikely to learn regular patterns from random data, thus avoiding the learning of

**译稿位置：** [T041 · 第 216 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L216)；**译文候选全文：** $\sigma_z$ 控制未知因素的幅度尺度，实验设为 0.5，作者称方法对此参数不敏感。

**自动匹配线索：** scale→尺度、method→方法、parameters→参数、0.5。

### GCD-P0047 · 页内坐标 x=312, y=254.8

**原文章节（自动识别）：** B. Random Prompt Augmentation。**目标译稿章节：** B. 随机提示增强。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** spurious correlations between the placeholders and the real channel. This strategy is analogous to data augmentation in neural network training, which prevents the neural network from overfitting to unimportant features within data samples. However, in our method, data augmentation is not applied to training samples but rather to the input prompt, enabling the network to identify important features within the contextual information.

**译稿位置：** [T042 · 第 218 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L218)；**译文候选全文：** 随机占位项发挥两种作用。首先，它补足原本不可获得的路径参数，使已知多径结构可以变成一个完整的 CSI 格式，便于在同一个特征空间进行融合。其次，每次形成伪 CSI 都对未知路径因素随机采样，网络不易从这些随机数中学习稳定规律，因此更可能关注伪信道之间共享的几何结构，而不依赖随机占位与真实 CSI 的虚假相关性。这类似数据增强对过拟合的抑制，但增强对象不是训练标签样本，而是输入的场景提示。

**自动匹配线索：** channel→信道、data→数据、network→网络、training→训练。

### GCD-P0048 · 页内坐标 x=312, y=379.7

**原文章节（自动识别）：** C. Channel Deduction Network。**目标译稿章节：** C. 信道推断网络。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** 1) GCDNet: Following [27], we fuse the pseudo channels with the partial channel using a channel deduction network and refer to it as GCDNet. It first pre-maps the partial CSI Hπ to the form of a complete CSI HPM ∈CNt×Nc. Then, the network fuses features from eHi1, · · · , eHin and HPM to obtain a more informative representation HFM ∈CNt×Nc. Finally, HFM is further refined to yield the final output bH. The channel pre-mapping module and the refinement module process channel data in spatial-frequency domain. Both modules are implemented using CMixer [12], whose network structure is illustrated in Fig. 3(a). CMixer treats the input Hin ∈CNt,in×Nc,in and the output Hout ∈CNt,out×Nc,out as real-valued tensors of shapes Nt,in × Nc,in × 2 and Nt,out × Nc,out × 2, respectively. It comprises K stacked interleaved layers for channel representation learning, as well as two interleaved linear projections for dimension transformation. The detailed structure of the interleaved layer is shown in Fig. 3(c). Its unique interleaved learning design closely aligns with the intrinsic structures of channel data, enabling CMixer to outperform existing learning methods in channel-related tasks with high parameter efficiency. In the channel deduction network, a K-layer CMixer is used to implement the pre-mapping module PM : CNt,π×Nc,π →CNt×Nc, converting the partial CSI Hπ to HPM = PM(Hπ). Meanwhile, another K-layer CMixer serves as the refinement module RM : CNt×Nc →CNt×Nc, generating the output bH = RM(HFM). The channel information fusion module is implemented using attention mechanism, which enables mutual interaction of channel features from eHi1, · · · , eHin and HPM. The detailed network structure is illustrated in Fig. 3(d)-(e). The input channels are first reshaped and compressed via linear

**译稿位置：** [T043 · 第 224 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L224)；**译文候选全文：** **1）GCDNet。** 遵照 [27]，使用信道推断网络融合伪信道与部分信道。先对 $\mathbf H_\pi$ 进行预映射，生成完整维度的 $\mathbf H_{\mathrm{PM}}\in\mathbb C^{N_t\times N_c}$；再融合邻域的 $\widetilde{\mathbf H}_{i_1},\ldots,\widetilde{\mathbf H}_{i_n}$ 与 $\mathbf H_{\mathrm{PM}}$，得到信息更丰富的 $\mathbf H_{\mathrm{FM}}$；最后精修成完整 CSI 输出 $\widehat{\mathbf H}$。

**自动匹配线索：** gcdnet、channel→信道、network→网络、27、[27]。

## PDF 第 7 页 · 提取候选 4 项

### GCD-P0049 · 页内坐标 x=49, y=268.6

**原文章节（自动识别）：** C. Channel Deduction Network。**目标译稿章节：** C. 信道推断网络。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** projection, transforming them into D-dimensional real-valued vectors. Learnable embeddings are added to these vectors to distinguish the features from instantaneous estimate or pseudo channels. Subsequently, these vectors are fed into an L-layer Transformer encoder for information interaction. Finally, the last output vector corresponding to HPM is transformed to the output channel via linear projection and reshaping. The entire process is expressed as HFM = FM( eHi1, · · · , eHin, HPM), where FM : CNt×Nc × · · · × CNt×Nc →CNt×Nc denotes the fusion module. 2) Mask-Enhanced GCDNet: The above implementation of the pre-mapping module takes only partial CSI Hπ as input, ignoring information about the pilot settings. Consequently, the entire network can only be applied to a fixed pilot pattern Ω, i.e., fixed intervals Rt, Rc and fixed starts St, Sc. To enhance the network’s universality, we incorporate pilot positional information into the pre-mapping module. We define the pilot mask M ∈{0, 1}Nt×Nc as follows, which indicates the pilot positions in the spatial-frequency grid.

**译稿位置：** [T043 · 第 224 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L224)；**译文候选全文：** **1）GCDNet。** 遵照 [27]，使用信道推断网络融合伪信道与部分信道。先对 $\mathbf H_\pi$ 进行预映射，生成完整维度的 $\mathbf H_{\mathrm{PM}}\in\mathbb C^{N_t\times N_c}$；再融合邻域的 $\widetilde{\mathbf H}_{i_1},\ldots,\widetilde{\mathbf H}_{i_n}$ 与 $\mathbf H_{\mathrm{PM}}$，得到信息更丰富的 $\mathbf H_{\mathrm{FM}}$；最后精修成完整 CSI 输出 $\widehat{\mathbf H}$。

**自动匹配线索：** gcdnet、channel→信道、network→网络。

### GCD-P0050 · 页内坐标 x=49, y=535

**原文章节（自动识别）：** C. Channel Deduction Network。**目标译稿章节：** C. 信道推断网络。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** According to the pilot positions, the partial CSI Hπ can be padded with zeros to obtain a sparse channel matrix eH = H ⊙M ∈CNt×Nc, where ⊙denotes the Hadamard product. We extend the network structure for pre-mapping, as shown in Fig. 3(b). The padded CSI eH is first converted to a realvalued tensor of shape Nt×Nc×2, and then concatenated with the mask M to obtain a composite tensor of shape Nt×Nc×3. Then it passes through K interleaved learning layers, which are quite similar to the original CMixer. Finally, we employ 1×1 convolution with 3 input channels and 2 output channels to transform the data shape from Nt×Nc×3 into Nt×Nc×2. We refer to this extended structure as mask-enhanced CMixer (mCMixer). The output is expressed as HPM = mPM( eH, M), where mPM : CNt×Nc ×{0, 1}Nt×Nc →CNt×Nc denotes the extended pre-mapping module. By replacing the original pre-mapping module with a Klayer mCMixer, the extended GCDNet is capable of processing partial channels with various pilot patterns. A comparison

**译稿位置：** [T048 · 第 247 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L247)；**译文候选全文：** 在非导频位置填零，得到稀疏 CSI $\widetilde{\mathbf H}=\mathbf H\odot\mathbf M\in\mathbb C^{N_t\times N_c}$。先将其转为 $N_t\times N_c\times2$ 的实数张量，再拼接掩码得到 $N_t\times N_c\times3$。经过 $K$ 个与原 CMixer 类似的交错学习层，最后使用输入通道数为 3、输出通道数为 2 的 $1\times1$ 卷积，恢复 $N_t\times N_c\times2$ 形状。扩展模块称为 mCMixer，预映射写为 $\mathbf H_{\mathrm{PM}}=\mathrm{mPM}(\widetilde{\mathbf H},\mathbf M)$。用它替换 GCDNet 的原预映射层，得到掩码增强网络 mGCDNet，可处理不同导频间隔与起点。

**自动匹配线索：** cmixer、mcmixer、gcdnet、pilot→导频、sparse→稀疏、network→网络。

### GCD-P0051 · 页内坐标 x=312, y=268.8

**原文章节（自动识别）：** C. Channel Deduction Network。**目标译稿章节：** C. 信道推断网络。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** between the original pre-mapping module and the extended pre-mapping module is illustrated in Fig. 2(b). We refer to this extended network as mask-enhanced GCDNet (mGCDNet).

**译稿位置：** [T048 · 第 247 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L247)；**译文候选全文：** 在非导频位置填零，得到稀疏 CSI $\widetilde{\mathbf H}=\mathbf H\odot\mathbf M\in\mathbb C^{N_t\times N_c}$。先将其转为 $N_t\times N_c\times2$ 的实数张量，再拼接掩码得到 $N_t\times N_c\times3$。经过 $K$ 个与原 CMixer 类似的交错学习层，最后使用输入通道数为 3、输出通道数为 2 的 $1\times1$ 卷积，恢复 $N_t\times N_c\times2$ 形状。扩展模块称为 mCMixer，预映射写为 $\mathbf H_{\mathrm{PM}}=\mathrm{mPM}(\widetilde{\mathbf H},\mathbf M)$。用它替换 GCDNet 的原预映射层，得到掩码增强网络 mGCDNet，可处理不同导频间隔与起点。

**自动匹配线索：** gcdnet、mgcdnet、network→网络。

### GCD-P0052 · 页内坐标 x=312, y=317

**原文章节（自动识别）：** C. Channel Deduction Network。**目标译稿章节：** C. 信道推断网络。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** D. Training and Inference The training of (m)GCDNet requires a dataset D collected in the communication scenario, where each data sample (H, x) contains the complete CSI and user position. Additionally, this scenario should provide a geometric feature set F as the scenario representation. Thanks to the scenario-related context introduced by the geometric prior, (m)GCDNet supports strong adaptation and generalization across various scenarios. Therefore, we adopt multi-scenario collaborative training to leverage the rich data from different scenarios for more comprehensive and thorough learning. Assume M different scenarios are involved in training, each with its own training dataset and geometric feature set. For the special case when M = 1, collaborative learning reduces to single-scenario learning, a quite common setting in existing studies. Furthermore, after introducing the mask-enhanced pre-mapping module, mGCDNet is capable of handling different pilot patterns. We introduce multiple pilot configurations {Ωℓ}ℓduring training to enhance the network’s universality and enable more thorough learning. At each training step, we uniformly sample a scenario index m from {1, · · · , M}, and then sample a CSI-position pair (H, x) from the m-th scenario’s dataset. Meanwhile, we sample Ωfrom all pre-defined pilot patterns {Ωℓ}ℓ. Using the complete CSI H and the pilot pattern Ω, we can derive the partial CSI Hπ, the padded CSI eH, and the pilot mask M, which serve as inputs to the channel deduction network. Subsequently, we follow the aforementioned procedure to acquire the complete CSI bH. To mitigate the impact of the absolute magnitude of channel responses, we normalize the CSI data before feeding it into the network. Specifically, we first use known partial CSI to estimate the average power, denoted as PH = ∥eH∥2 F/∥M∥1, and then normalize each input channel matrix H via H ←H/√PH. This ensures that the network inputs have a unit average power, which helps stabilize the training process and reduces the learning burden. The network is trained using the Adam optimizer, and the loss

**译稿位置：** [T048 · 第 247 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L247)；**译文候选全文：** 在非导频位置填零，得到稀疏 CSI $\widetilde{\mathbf H}=\mathbf H\odot\mathbf M\in\mathbb C^{N_t\times N_c}$。先将其转为 $N_t\times N_c\times2$ 的实数张量，再拼接掩码得到 $N_t\times N_c\times3$。经过 $K$ 个与原 CMixer 类似的交错学习层，最后使用输入通道数为 3、输出通道数为 2 的 $1\times1$ 卷积，恢复 $N_t\times N_c\times2$ 形状。扩展模块称为 mCMixer，预映射写为 $\mathbf H_{\mathrm{PM}}=\mathrm{mPM}(\widetilde{\mathbf H},\mathbf M)$。用它替换 GCDNet 的原预映射层，得到掩码增强网络 mGCDNet，可处理不同导频间隔与起点。

**自动匹配线索：** gcdnet、mgcdnet、pilot→导频、network→网络。

## PDF 第 8 页 · 提取候选 8 项

### GCD-P0053 · 页内坐标 x=49, y=414

**原文章节（自动识别）：** C. Channel Deduction Network。**目标译稿章节：** C. 信道推断网络。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** function is defined as the mean squared error (MSE) between the normalized H, bH, i.e., L = ∥H -bH∥2 F/(NtNc). During inference, we normalize the network inputs using the estimated magnitude √PH, similar to the training phase. To recover the acquired channel with absolute magnitude scale, the output CSI can be denormalized via bH ←√PH bH. Since ray tracing and feature extraction are performed offline in our approach, online inference only requires neighborhood search, pseudo CSI construction, and the neural network forward pass. Assuming that neighborhood search is implemented by identifying n minimum elements among the N distances between x and each of x1, · · · , xN, the overall computational complexity for neighborhood search is O(N + N log n) = O(N log n). The complexity for pseudo CSI construction is O(NtNcNpn), where Np is the maximum number of paths, while the forward pass of (m)GCDNet has a computational complexity of O(K(NcN 2 t + NtN 2 c ) + NtNcDn + L(D2n + Dn2)) [27].

**译稿位置：** [T043 · 第 224 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L224)；**译文候选全文：** **1）GCDNet。** 遵照 [27]，使用信道推断网络融合伪信道与部分信道。先对 $\mathbf H_\pi$ 进行预映射，生成完整维度的 $\mathbf H_{\mathrm{PM}}\in\mathbb C^{N_t\times N_c}$；再融合邻域的 $\widetilde{\mathbf H}_{i_1},\ldots,\widetilde{\mathbf H}_{i_n}$ 与 $\mathbf H_{\mathrm{PM}}$，得到信息更丰富的 $\mathbf H_{\mathrm{FM}}$；最后精修成完整 CSI 输出 $\widehat{\mathbf H}$。

**自动匹配线索：** gcdnet、inference→推断、network→网络、channel→信道、27、[27]。

### GCD-P0054 · 页内坐标 x=49, y=678.4

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** 1) Scenario Setup: We collect the environmental maps of four global cities from OpenStreetMap, including San Francisco, Shanghai, Singapore, and London. For each city, we manually set three BS positions, constructing 12 scenarios. The satellite images of these four cities and the 12 constructed scenarios are shown in Fig. 4 and Fig. 5, respectively. These

**译稿位置：** [T054 · 第 272 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L272)；**译文候选全文：** **1）场景构建。** 从 OpenStreetMap 获取旧金山、上海、新加坡和伦敦四座城市的环境地图，在每座城市手动布设三个 BS 位置，构成 12 个场景。四座城市的卫星图像和 12 个场景的环境地图分别见图 4、图 5。将环境地图导入 Sionna RT [42]，生成信道数据和几何特征。地面、建筑墙面和屋顶材料分别设置为混凝土、大理石与金属；允许最多五次反射的传播路径。每个场景中，用户在以 BS 为中心、$400\,\mathrm m\times400\,\mathrm m$ 的正方形区域内随机分布，用户高度为 1–2 m；虚拟用户位置按 $1\,\mathrm m\times1\,\mathrm m$ 的规则网格采样，高度固定为 1.5 m。

**自动匹配线索：** openstreetmap、maps→地图、satellite→卫星、12。

### GCD-P0055 · 页内坐标 x=322.4, y=331.9

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** (m)GCDNet (m)CMixer K = 3, N′ t = Nt, N′ c = Nc Transformer Encoder L = 6, D = 512

**译稿位置：** [T059 · 第 310 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L310)；**译文候选全文：** 另加入采用扩散模型后验采样（DMPS）[43] 的生成式信道估计基线，根据 [13] 的实现将原 CNN 去噪器换成扩散 Transformer（DiT）[44]；DiT 包含 8 个 block，隐藏维度 512，训练 10000 epoch。传统方法还包括线性最小均方误差（LMMSE）估计（协方差由训练数据估计），以及根据 [35] 的基投影思想加入几何先验的 LMMSE-BP。

**自动匹配线索：** transformer、512。

### GCD-P0056 · 页内坐标 x=322.4, y=356.5

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** (m)PCMixer CMixer e K = 8, N′ t = Nt, N′ c = Nc ResMLP eL = 6, D = 512

**译稿位置：** [T057 · 第 286 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L286)；**译文候选全文：** **2）比较基线及超参数。** 采用两种先进学习方法作为基线：仅凭导频信息的 CMixer 信道映射 [12]，以及结合用户位置和部分信道的 PCMixer [28]。PCMixer 使用两个具有隐藏维度 $D$ 的 $\widetilde L$ 层残差 MLP（ResMLP）分别处理位置和部分 CSI，通过 $1\times1$ 卷积融合，再经 $\widetilde K$ 层 CMixer 得到完整 CSI。原版 CMixer 和 PCMixer 只支持固定导频图样，为公平对比，本文分别引入 mCMixer 和拼接 $\widetilde{\mathbf H},\mathbf M$ 的掩码增强 PCMixer（mPCMixer）。此外，将部分网络隐藏维度扩大一倍，建立复杂度更高的 (m)PCMixer-L、(m)CMixer-L 基线。

**自动匹配线索：** pcmixer、cmixer、resmlp。

### GCD-P0057 · 页内坐标 x=312, y=421.7

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** environmental maps are imported into Sionna RT [42] to generate channel data and geometric features. The materials of the ground, building walls, and building roofs are set as concrete, marble, and metal, respectively. The propagation paths with no more than 5 reflections are enabled. In each scenario, the users are randomly distributed within a 400 m × 400 m square area centered on the BS. User heights range from 1 m to 2 m. Virtual user positions are sampled on a regular cell grid with a cell size of 1 m × 1 m and a height of 1.5 m. The BS is equipped with a uniform linear array (ULA) with Nt = 16 array elements. All users are equipped with randomly oriented dipole antennas to simulate diverse antenna radiation characteristics. The system center frequency is f = 5 GHz, and the bandwidth is set to 40 MHz and divided into Nc = 256 subcarriers. We consider the following pilot pattern settings, with details shown in Table II. Each setting defines a collection of pilot patterns {Ωℓ}ℓused in training.

**译稿位置：** [T054 · 第 272 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L272)；**译文候选全文：** **1）场景构建。** 从 OpenStreetMap 获取旧金山、上海、新加坡和伦敦四座城市的环境地图，在每座城市手动布设三个 BS 位置，构成 12 个场景。四座城市的卫星图像和 12 个场景的环境地图分别见图 4、图 5。将环境地图导入 Sionna RT [42]，生成信道数据和几何特征。地面、建筑墙面和屋顶材料分别设置为混凝土、大理石与金属；允许最多五次反射的传播路径。每个场景中，用户在以 BS 为中心、$400\,\mathrm m\times400\,\mathrm m$ 的正方形区域内随机分布，用户高度为 1–2 m；虚拟用户位置按 $1\,\mathrm m\times1\,\mathrm m$ 的规则网格采样，高度固定为 1.5 m。

**自动匹配线索：** sionna、maps→地图、channel→信道、data→数据、geometric→几何、42、400、1.5、[42]。

### GCD-P0058 · 页内坐标 x=322.8, y=642.5

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** • Fixed R & fixed S (FRFS): In each domain (space or frequency), both the pilot interval and start are fixed. In this case, there is only one possible pilot pattern.

**译稿位置：** [T056 · 第 276 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L276)；**译文候选全文：** 考虑三种导频图样配置：固定间隔、固定起点（FRFS），空间和频率域都只有一个固定图样；固定间隔、可变起点（FRVS），导频数不变但位置不同；可变间隔、可变起点（VRVS），两域的间隔和起点均可变化。

**自动匹配线索：** frfs、frequency→频率、pilot→导频。

### GCD-P0059 · 页内坐标 x=322.8, y=678.3

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** • Fixed R & variable S (FRVS): In each domain, the pilot interval is fixed, while the start is variable. In this case, the number of pilots is fixed, but these pilots are inserted at variable positions in the spatial-frequency grid.

**译稿位置：** [T056 · 第 276 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L276)；**译文候选全文：** 考虑三种导频图样配置：固定间隔、固定起点（FRFS），空间和频率域都只有一个固定图样；固定间隔、可变起点（FRVS），导频数不变但位置不同；可变间隔、可变起点（VRVS），两域的间隔和起点均可变化。

**自动匹配线索：** frvs、pilot→导频、pilots→导频。

### GCD-P0060 · 页内坐标 x=322.8, y=726.1

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** • Variable R & variable S (VRVS): In each domain, both the pilot interval and start are variable.

**译稿位置：** [T058 · 第 298 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L298)；**译文候选全文：** 由于训练数据多样性不同，FRFS、FRVS、VRVS 分别训练 1000、4000、10000 个 epoch。批大小 500，初始学习率 $10^{-4}$，每完成训练总时长的十分之一，乘以 0.8 衰减。训练时伪信道数量 $n$ 在 0–16 间随机取值，测试默认 $n=16$。表 IV 给出各网络的参数量和浮点运算量。对于 GCD，几何特征集 $\mathcal F$ 约占 1 M 的存储，远小于网络参数量（约 20 M）；伪信道构造开销不足 10 MFLOPs，相比神经网络数百 MFLOPs 的前向成本很小。

**自动匹配线索：** vrvs。

## PDF 第 9 页 · 提取候选 6 项

### GCD-P0061 · 页内坐标 x=49, y=177.6

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** 2) Baselines and Parameter Settings: We adopt two advanced learning schemes for channel acquisition as baselines. One is CMixer-based channel mapping [12], which utilizes a eK-layer CMixer to generate the complete channel using only pilot-based estimates. The other is PCMixer [28], which first processes the user position and partial channel separately using two eL-layer ResMLPs with hidden size D, followed by 1 × 1 convolutional fusion, and finally generates the full channel via a eK-layer CMixer for refinement. The original implementations of CMixer and PCMixer only support fixed pilot pattern. To better align with our work, we extend these two baselines to their mask-enhanced versions. For CMixerbased channel mapping, we introduce mCMixer proposed in the previous section to support channel mapping with variable pilot patterns. For PCMixer, we replace its input Hπ with the concatenation of eH and M, yielding mask-enhanced PCMixer (mPCMixer). The detailed parameter settings of these network structures are shown in Table III. Besides, we double the hidden dimensions of the network modules in (m)PCMixer and (m)CMixer, resulting in additional baselines named (m)PCMixer-L and (m)CMixer-L, which possess a significantly higher level of complexity than (m)GCDNet. We employ different numbers of training epochs for the three pilot pattern settings in Table II due to their difference in training data diversity. Specifically, we train each network for 1000 epochs under the FRFS setting, for 4000 epochs under the FRVS setting, and for 10000 epochs under the VRVS setting. The batch size is set to 500. The learning rate is initially set to 10-4 and decayed by a factor of 0.8 every 1/10 of the training duration. During training, the number of pseudo channels n is randomly selected from 0 to 16. During testing, n is set to 16 by default. Table IV shows the number of parameters and the floating-point operations (FLOPs) of networks in the above schemes2. In addition, we introduce generative channel estimation as another baseline, which employs diffusion model based posterior sampling (DMPS) [43]. We implement this scheme based on the implementation of [13], except that we replace the denoising network, originally a CNN, with more advanced diffusion Transformer (DiT) [44]. In our experiment, the DiT consists of 8 DiT blocks with a hidden size of 512 and is trained for 10000 epochs. To demonstrate the advantages of deep learning methods

**译稿位置：** [T059 · 第 310 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L310)；**译文候选全文：** 另加入采用扩散模型后验采样（DMPS）[43] 的生成式信道估计基线，根据 [13] 的实现将原 CNN 去噪器换成扩散 Transformer（DiT）[44]；DiT 包含 8 个 block，隐藏维度 512，训练 10000 epoch。传统方法还包括线性最小均方误差（LMMSE）估计（协方差由训练数据估计），以及根据 [35] 的基投影思想加入几何先验的 LMMSE-BP。

**自动匹配线索：** dmps、transformer、channel→信道、training→训练、data→数据、estimation→估计、10000、43、13、44、[43]、[13]、[44]。

### GCD-P0062 · 页内坐标 x=49, y=702.7

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** 2For GCD, the data volume of the geometric feature set F (approximately 1 M) is relatively small compared to the model parameters (approximately 20 M), and the computational cost for pseudo channel construction (less than 10 MFLOPs) is negligible compared to the neural network inference (hundreds of MFLOPs).

**译稿位置：** [T058 · 第 298 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L298)；**译文候选全文：** 由于训练数据多样性不同，FRFS、FRVS、VRVS 分别训练 1000、4000、10000 个 epoch。批大小 500，初始学习率 $10^{-4}$，每完成训练总时长的十分之一，乘以 0.8 衰减。训练时伪信道数量 $n$ 在 0–16 间随机取值，测试默认 $n=16$。表 IV 给出各网络的参数量和浮点运算量。对于 GCD，几何特征集 $\mathcal F$ 约占 1 M 的存储，远小于网络参数量（约 20 M）；伪信道构造开销不足 10 MFLOPs，相比神经网络数百 MFLOPs 的前向成本很小。

**自动匹配线索：** mflops、data→数据、geometric→几何、parameters→参数、channel→信道、20、10。

### GCD-P0063 · 页内坐标 x=312, y=56.9

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** over traditional signal processing algorithms, we also compare with the classical linear minimum mean squared error (LMMSE) channel estimation, where the covariance matrix is computed based on training data. Furthermore, we incorporate the idea of basis projection proposed in [35] into LMMSE, thereby forming another baseline, LMMSE-BP, which similarly utilizes environmental geometry as prior knowledge. 3) Evaluation Metrics: We evaluate the channel acquisition quality for each data sample using normalized MSE (NMSE) and cosine correlation ρ, which are defined as

**译稿位置：** [T059 · 第 310 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L310)；**译文候选全文：** 另加入采用扩散模型后验采样（DMPS）[43] 的生成式信道估计基线，根据 [13] 的实现将原 CNN 去噪器换成扩散 Transformer（DiT）[44]；DiT 包含 8 个 block，隐藏维度 512，训练 10000 epoch。传统方法还包括线性最小均方误差（LMMSE）估计（协方差由训练数据估计），以及根据 [35] 的基投影思想加入几何先验的 LMMSE-BP。

**自动匹配线索：** lmmse、lmmse-bp、channel→信道、estimation→估计、training→训练、data→数据、35、[35]。

### GCD-P0064 · 页内坐标 x=312, y=240.1

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** where hnc, bhnc are the nc-th columns of H, bH, respectively. To translate the channel acquisition accuracy into meaningful communication gains, we use the average achievable rate (AAR) to evaluate the performance of precoding based on the acquired CSI, which is defined as

**译稿位置：** [T061 · 第 324 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L324)；**译文候选全文：** 其中 $\mathbf h_{n_c}$ 与 $\widehat{\mathbf h}_{n_c}$ 分别是第 $n_c$ 个子载波的真实和估计信道列向量。为将估计精度转化为通信性能，采用平均可达速率（AAR）评价基于估计 CSI 的预编码：

**自动匹配线索：** channel→信道、accuracy→精度。

### GCD-P0065 · 页内坐标 x=312, y=343.5

**原文章节（自动识别）：** A. Experimental Settings。**目标译稿章节：** A. 实验设置。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** where vnc ∈CNt denotes the precoding vector for the ncth subcarrier, which is assumed to have a unit power, i.e., ∥vnc∥2 2 = 1. For simplicity, we employ maximum ratio transmission (MRT), whose precoding vector is given by vnc = bh∗ nc/∥bhnc∥2, where the acquired channel bhnc accounts for estimation noise (with a power of eσ2 w = σ2 w/P). As a reminder, P and σ2 w represent the BS transmit power and thermal noise power, respectively. The thermal noise power can be calculated as σ2 w = kTB, where k = 1.38 × 10-23 J/K is the Boltzmann constant, T = 290 K is the temperature, and B is the system bandwidth.

**译稿位置：** [T062 · 第 333 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L333)；**译文候选全文：** $\mathbf v_{n_c}\in\mathbb C^{N_t}$ 是单位功率预编码向量。采用最大比传输（MRT），即 $\mathbf v_{n_c}=\widehat{\mathbf h}_{n_c}^*/\|\widehat{\mathbf h}_{n_c}\|_2$，估计信道含功率 $\widetilde\sigma_w^2=\sigma_w^2/P$ 的噪声。热噪声功率为 $\sigma_w^2=kTB$，$k=1.38\times10^{-23}$ J/K，$T=290$ K，$B$ 为带宽。

**自动匹配线索：** power→功率、channel→信道、estimation→估计、noise→噪声、1.38、23、290。

### GCD-P0066 · 页内坐标 x=312, y=510.9

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** In this subsection, we train and evaluate all schemes in a single scenario – San Francisco BS 1. The training, validation, and testing datasets comprise 40 k, 10 k, and 10 k data samples, respectively. 1) Training under Different Pilot Pattern Settings: To verify the effectiveness of the mask enhancement, we evaluate the channel acquisition performance with networks trained under different pilot pattern settings, i.e., FRFS, FRVS, and VRVS. For fair comparison, all schemes are evaluated under Rt = 4, Rc = 16. The NMSE performance of mask-free schemes are shown in Fig. 6(a). When trained and evaluated with fixed pilot pattern (FRFS), CMixer struggles to perform effectively due to the complex multi-path characteristics and limited pilot resources. In contrast, both PCMixer and GCDNet utilize additional information, thereby achieving superior accuracy. However, under the FRVS setting, all these schemes fail because they do not utilize the necessary information about pilot patterns. Worse still, these schemes are not applicable to the VRVS setting, as their network structures strictly determine the partial channel size, thus only supporting fixed pilot interval.

**译稿位置：** [T064 · 第 339 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L339)；**译文候选全文：** **1）不同导频图样设置下的训练。** 检验 FRFS、FRVS 和 VRVS 下的性能，公平起见统一在 $R_t=4,R_c=16$ 的图样上评价。图 6(a) 展示无掩码网络的 NMSE：固定导频（FRFS）时，CMixer 因多径复杂且导频有限而效果不佳，PCMixer/GCDNet 由于利用辅助信息可更准确；在 FRVS 下，无掩码网络没有导频位置输入，因而全部出现性能失败。VRVS 的可变导频间隔还会改变部分 CSI 的输入尺寸，原网络在结构上根本无法处理。

**自动匹配线索：** frfs、frvs、vrvs、nmse、training→训练、pilot→导频、network→网络、16。

## PDF 第 10 页 · 提取候选 4 项

### GCD-P0067 · 页内坐标 x=77.4, y=217.3

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 非正文候选：表格或图注。

**原文全文（PDF 文本层）：** FRFS FRVS VRVS NMSE (dB) ρ NMSE (dB) ρ NMSE (dB) ρ Mean Median Mean Median Mean Median Mean Median Mean Median Mean Median mGCDNet -8.60 -14.45 0.9412 0.9854 -9.95 -17.46 0.9614 0.9940 -9.69 -16.37 0.9602 0.9924 mPCMixer -11.98 -16.65 0.9712 0.9903 -9.29 -14.68 0.9550 0.9876 -7.53 -12.01 0.9359 0.9801 mCMixer -1.17 -1.47 0.6001 0.7424 -6.18 -12.24 0.9034 0.9805 -6.77 -12.45 0.9061 0.9825 mPCMixer-L -12.97 -18.47 0.9782 0.9944 -8.85 -13.67 0.9518 0.9857 -6.44 -9.67 0.9264 0.9700 mCMixer-L -1.58 -2.55 0.6440 0.8134 -8.61 -17.12 0.9410 0.9937 -7.02 -12.65 0.9122 0.9852

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0068 · 页内坐标 x=49, y=326.4

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** The NMSE performance of mask-enhanced schemes are shown in Fig. 6(b). All schemes perform well under the FRVS and VRVS settings. Notably, the performance of mGCDNet and mCMixer under the FRVS and VRVS settings is even better than under the FRFS setting, indicating that variable pilot patterns enrich the training data and facilitate more comprehensive learning. Furthermore, it can be observed that under the FRVS and VRVS settings, the proposed mGCDNet achieves the best performance among all schemes, even though it has much fewer parameters and FLOPs than mPCMixer- L or mCMixer-L. Table V presents the quantitative results under different settings, further validating the superiority of the proposed mGCDNet under variable pilot configurations. In Fig. 6(c), we evaluate mask-enhanced schemes with variable pilot patterns under different noise conditions. The noisy estimate can be expressed as H′ π = Hπ + W, where W ∈CNt,π×Nc,π is the additive noise matrix whose elements are independently sampled from CN(0, eσ2 w), with eσ2 w being the estimation noise power. We define the signal-to-noise ratio (SNR) as PH/eσ2 w. As SNR decreases, the performance of all schemes degrades. Notably, mGCDNet exhibits stronger robustness to input noise under VRVS compared to FRVS, which once again validates the advantages of enriching training pilot configurations. In the remainder of this section, we evaluate the maskenhanced schemes that are trained under the VRVS setting, as it improves performance, robustness, and universality. 2) Performance under Different Pilot Intervals: Fig. 7(a) illustrates the performance of different schemes under various pilot intervals (Rt, Rc). To provide a more comprehensive demonstration, we select three groups of pilot intervals (Rt, Rc), plotting the cumulative distribution function (CDF) of NMSE under the ideal noise-free condition in Fig. 7(b)- (d) and the NMSE performance under different SNR in Fig. 7(e)-(g). Table VI shows the detailed quantitative results under

**译稿位置：** [T064 · 第 339 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L339)；**译文候选全文：** **1）不同导频图样设置下的训练。** 检验 FRFS、FRVS 和 VRVS 下的性能，公平起见统一在 $R_t=4,R_c=16$ 的图样上评价。图 6(a) 展示无掩码网络的 NMSE：固定导频（FRFS）时，CMixer 因多径复杂且导频有限而效果不佳，PCMixer/GCDNet 由于利用辅助信息可更准确；在 FRVS 下，无掩码网络没有导频位置输入，因而全部出现性能失败。VRVS 的可变导频间隔还会改变部分 CSI 的输入尺寸，原网络在结构上根本无法处理。

**自动匹配线索：** nmse、frvs、vrvs、frfs、pilot→导频、training→训练。

### GCD-P0069 · 页内坐标 x=312, y=326.4

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** the noise-free condition. Clearly, DMPS and LMMSE can work effectively only when pilot resources are abundant (e.g., Rt = 2, Rc = 4), because when only a small number of pilots are observed, neither the diffusion model nor the covariance matrix provides sufficient prior information to determine the complete CSI. Although LMMSE-BP improves LMMSE’s performance by utilizing basis projection based on geometric prior, it relies heavily on the initial performance of LMMSE channel estimation. Therefore, poor LMMSE performance hinders the performance improvement of LMMSE-BP. mCMixer also exhibits severe performance degradation under conditions with very few pilots (e.g., Rt = 8, Rc = 64). In contrast, mPCMixer and mGCDNet operate properly across various pilot intervals by utilizing auxiliary information, and mGCDNet consistently outperforms the other schemes. In the remainder of this section, all schemes are evaluated under Rt = 4, Rc = 16 to strike a balance between channel acquisition quality and pilot overhead.

**译稿位置：** [T065 · 第 357 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L357)；**译文候选全文：** **2）不同导频间隔下的性能。** 图 7(a) 汇总不同 $(R_t,R_c)$ 下的中位 NMSE。作者选取 $(8,64)$、$(4,16)$、$(2,4)$ 三种代表性间隔，分别在图 7(b)–(d) 给出无噪 NMSE 的 CDF，并在图 7(e)–(g) 给出随 SNR 变化的中位 NMSE。表 VI 为无噪定量结果。DMPS 和 LMMSE 只有导频充足时（如 $R_t=2,R_c=4$）才有效，因为导频过少时，扩散模型或协方差不能单独给出确定完整 CSI 所需的充分先验。LMMSE-BP 虽利用几何基投影改善 LMMSE，但仍受初始 LMMSE 质量限制。mCMixer 在极稀疏导频（$R_t=8,R_c=64$）下也明显退化。mPCMixer 和 mGCDNet 借助辅助信息能在不同导频间隔下工作，后者持续优于其他方法。

**自动匹配线索：** dmps、lmmse、lmmse-bp、mcmixer、pilot→导频、pilots→导频、model→模型、geometric→几何、64、16。

### GCD-P0070 · 页内坐标 x=312, y=546.9

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** 3) Impact of Prompt Length and Position Error: Fig. 8(a) illustrates mGCDNet’s performance under various prompt lengths, i.e., the number of neighboring samples n. As n increases, the performance of mGCDNet first improves and then tends to plateau. Even with only a single neighboring sample, mGCDNet still outperforms other schemes by a wide margin. Recall that the pseudo channels eHi(i = i1, · · · , in) are derived from the geometric features of n neighboring samples in F, with each sample assigned a random placeholder ezi. Here, we try a different strategy: instead of searching for n neighboring samples, we use only the nearest one and repeat its geometric features for n times, assigning a different placeholder each time. The results are shown by the dashed lines in Fig. 8(a). We observe that the performance difference between reusing a single neighbor n times and using n neighbors is negligible. This suggests that the performance gain from increasing n primarily stems from the multiple

**译稿位置：** [T065 · 第 357 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L357)；**译文候选全文：** **2）不同导频间隔下的性能。** 图 7(a) 汇总不同 $(R_t,R_c)$ 下的中位 NMSE。作者选取 $(8,64)$、$(4,16)$、$(2,4)$ 三种代表性间隔，分别在图 7(b)–(d) 给出无噪 NMSE 的 CDF，并在图 7(e)–(g) 给出随 SNR 变化的中位 NMSE。表 VI 为无噪定量结果。DMPS 和 LMMSE 只有导频充足时（如 $R_t=2,R_c=4$）才有效，因为导频过少时，扩散模型或协方差不能单独给出确定完整 CSI 所需的充分先验。LMMSE-BP 虽利用几何基投影改善 LMMSE，但仍受初始 LMMSE 质量限制。mCMixer 在极稀疏导频（$R_t=8,R_c=64$）下也明显退化。mPCMixer 和 mGCDNet 借助辅助信息能在不同导频间隔下工作，后者持续优于其他方法。

**自动匹配线索：** mgcdnet、geometric→几何、results→结果。

## PDF 第 11 页 · 提取候选 6 项

### GCD-P0071 · 页内坐标 x=78.3, y=310.3

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** Rt = 8, Rc = 64 Rt = 4, Rc = 16 Rt = 2, Rc = 4 NMSE (dB) ρ NMSE (dB) ρ NMSE (dB) ρ Mean Median Mean Median Mean Median Mean Median Mean Median Mean Median mGCDNet -7.70 -12.90 0.9437 0.9857 -9.69 -16.37 0.9602 0.9924 -10.43 -17.36 0.9643 0.9938 mPCMixer -5.59 -9.18 0.9143 0.9694 -7.53 -12.01 0.9359 0.9801 -8.48 -12.79 0.9424 0.9819 mCMixer -1.91 -4.28 0.6987 0.8982 -6.77 -12.45 0.9061 0.9825 -9.47 -14.82 0.9492 0.9890 DMPS -0.01 -0.01 0.2418 0.1584 -0.12 -0.12 0.3619 0.3499 -1.32 -7.87 0.6611 0.9518 LMMSE 0.07 0.18 0.3106 0.3176 0.05 0.75 0.4773 0.4814 -4.59 -8.32 0.8187 0.9253 LMMSE-BP -0.23 -0.10 0.8626 0.9259 -1.52 -0.68 0.9163 0.9664 -7.65 -12.33 0.9593 0.9947

**译稿位置：** [T065 · 第 357 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L357)；**译文候选全文：** **2）不同导频间隔下的性能。** 图 7(a) 汇总不同 $(R_t,R_c)$ 下的中位 NMSE。作者选取 $(8,64)$、$(4,16)$、$(2,4)$ 三种代表性间隔，分别在图 7(b)–(d) 给出无噪 NMSE 的 CDF，并在图 7(e)–(g) 给出随 SNR 变化的中位 NMSE。表 VI 为无噪定量结果。DMPS 和 LMMSE 只有导频充足时（如 $R_t=2,R_c=4$）才有效，因为导频过少时，扩散模型或协方差不能单独给出确定完整 CSI 所需的充分先验。LMMSE-BP 虽利用几何基投影改善 LMMSE，但仍受初始 LMMSE 质量限制。mCMixer 在极稀疏导频（$R_t=8,R_c=64$）下也明显退化。mPCMixer 和 mGCDNet 借助辅助信息能在不同导频间隔下工作，后者持续优于其他方法。

**自动匹配线索：** nmse、mgcdnet、mpcmixer、mcmixer、64、16。

### GCD-P0072 · 页内坐标 x=49, y=585

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** realizations of the random placeholder. Next, we introduce errors to user positions. The approximate position is represented as bx = x + ∆x, where ∆x is the position error following a 2D uniform distribution on [-l, l]× [-l, l], with l being the error scale3. The results are shown in Fig. 8(b). As the position error increases, the performance of both mGCDNet and mPCMixer degrades. When l &lt; 4 m, mGCDNet consistently demonstrates a performance advantage over the other schemes, performing well within the positioning

**译稿位置：** [T068 · 第 376 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L376)；**译文候选全文：** 随后向用户位置加入误差 $\widehat{\mathbf x}=\mathbf x+\Delta\mathbf x$，$\Delta\mathbf x$ 在 $[-l,l]\times[-l,l]$ 上均匀分布，$l$ 为误差尺度。图 8(b) 表明位置误差增大时 mGCDNet、mPCMixer 都会退化，但当 $l&lt;4$ m 时 mGCDNet 始终保持优势。使用多个不同邻居的版本对位置误差略更鲁棒，因为即使检索位置出现明显偏差，多个邻居形成的空间邻域仍可能覆盖真实位置、提供近似的结构特征 [8]。这里用户位置按二维处理，忽略高度；由于用户高度通常仅在 1–2 m 范围内，虚拟用户高度统一设为 1.5 m，不会影响二维邻域检索。

**自动匹配线索：** mgcdnet、mpcmixer、user→用户、distribution→分布。

### GCD-P0073 · 页内坐标 x=49, y=702.7

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** 3Here, we represent the user position as a 2D vector, omitting height information. Since user heights typically fall within in a narrow range (e.g., [1 m, 2 m]), we simply assign all virtual user positions the same height (1.5 m). Consequently, real user height values are unnecessary here as they do not affect the neighborhood search result.

**译稿位置：** [T068 · 第 376 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L376)；**译文候选全文：** 随后向用户位置加入误差 $\widehat{\mathbf x}=\mathbf x+\Delta\mathbf x$，$\Delta\mathbf x$ 在 $[-l,l]\times[-l,l]$ 上均匀分布，$l$ 为误差尺度。图 8(b) 表明位置误差增大时 mGCDNet、mPCMixer 都会退化，但当 $l&lt;4$ m 时 mGCDNet 始终保持优势。使用多个不同邻居的版本对位置误差略更鲁棒，因为即使检索位置出现明显偏差，多个邻居形成的空间邻域仍可能覆盖真实位置、提供近似的结构特征 [8]。这里用户位置按二维处理，忽略高度；由于用户高度通常仅在 1–2 m 范围内，虚拟用户高度统一设为 1.5 m，不会影响二维邻域检索。

**自动匹配线索：** user→用户、1.5。

### GCD-P0074 · 页内坐标 x=329.8, y=443

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 非正文候选：作者/出版信息或表格。

**原文全文（PDF 文本层）：** Scenario Scheme NMSE (dB) ρ Mean Median Mean Median

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0075 · 页内坐标 x=312, y=552.3

**原文章节（自动识别）：** B. Single-Scenario Learning。**目标译稿章节：** B. 单场景学习。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** accuracy achievable by existing systems. We also observe that using n distinct neighboring samples exhibits slightly stronger robustness against position errors than reusing the nearest neighbor n times. This is because, even if the position used for neighborhood sampling is significantly biased, multiple neighboring samples may still form a region that covers the true position and provides approximate structural features [8].

**译稿位置：** [T068 · 第 376 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L376)；**译文候选全文：** 随后向用户位置加入误差 $\widehat{\mathbf x}=\mathbf x+\Delta\mathbf x$，$\Delta\mathbf x$ 在 $[-l,l]\times[-l,l]$ 上均匀分布，$l$ 为误差尺度。图 8(b) 表明位置误差增大时 mGCDNet、mPCMixer 都会退化，但当 $l&lt;4$ m 时 mGCDNet 始终保持优势。使用多个不同邻居的版本对位置误差略更鲁棒，因为即使检索位置出现明显偏差，多个邻居形成的空间邻域仍可能覆盖真实位置、提供近似的结构特征 [8]。这里用户位置按二维处理，忽略高度；由于用户高度通常仅在 1–2 m 范围内，虚拟用户高度统一设为 1.5 m，不会影响二维邻域检索。

**自动匹配线索：** times、[8]。

### GCD-P0076 · 页内坐标 x=312, y=666.6

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** In this subsection, we train each scheme using training data from the first 6 scenarios jointly and evaluate it across all 12 scenarios. The training, validation, and testing datasets for each scenario contain 20 k, 10 k, and 10 k data samples, respectively. 1) Performance in Original and New Scenarios: Fig. 9(a) shows the NMSE performance of different schemes across the

**译稿位置：** [T069 · 第 382 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L382)；**译文候选全文：** 从 12 个场景中选择前 6 个联合训练，在全部 12 个场景上评估。每个场景的训练、验证和测试数据分别含 20k、10k 和 10k 样本。

**自动匹配线索：** training→训练、data→数据、testing→测试、samples→样本、12。

## PDF 第 12 页 · 提取候选 6 项

### GCD-P0077 · 页内坐标 x=49, y=474.9

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** first 6 scenarios involved in training. Both mGCDNet and mPCMixer utilize auxiliary information to enhance channel acquisition accuracy and achieve multi-scenario joint learning, with mGCDNet consistently outperforming mPCMixer. Fig. 9(b) shows the NMSE performance across the remaining 6 scenarios, where all schemes are evaluated directly without additional training or finetuning. mPCMixer and mCMixer completely fail in these unseen scenarios. In contrast, mGCD- Net demonstrates excellent generalization ability, achieving satisfactory NMSE performance on most testing samples in the new scenarios. Table VII presents the quantitative results of different schemes in San Francisco BS 1 and Singapore BS 1, which serve as examples of the learned scenarios and the unseen scenarios, respectively. These results further validate the superiority of the proposed mGCDNet. Besides, we introduce AAR as an additional evaluation metric. Fig. 10 illustrates the precoding performance under different BS transmit power values P in the two example scenarios. mGCDNet exhibits particular advantage in unseen scenarios, with AAR values comparable to those in learned scenarios and significantly outperforming other schemes. This result demonstrates the feasibility of mGCDNet for precoding in cross-scenario applications.

**译稿位置：** [T070 · 第 384 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L384)；**译文候选全文：** **1）已见与未见场景。** 图 9(a) 展示参与训练的前 6 个场景。mGCDNet 和 mPCMixer 均能利用辅助信息改善信道估计并完成多场景联合学习，mGCDNet 始终表现更好。图 9(b) 则展示其余 6 个完全未见场景，所有方法都不进行额外训练或微调。mPCMixer 和 mCMixer 在新场景中基本失效，而 mGCDNet 仍能对大部分测试样本提供令人满意的 NMSE。表 VII 选取旧金山 BS 1（已见）和新加坡 BS 1（未见）进行定量说明。

**自动匹配线索：** mgcdnet、mpcmixer、nmse、mcmixer、training→训练、channel→信道、testing→测试、samples→样本。

### GCD-P0078 · 页内坐标 x=312, y=56.7

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** 2) Performance under Non-Ideal Geometric Information: To verify mGCDNet’s robustness against non-ideal geometric information, we directly test mGCDNet in one of the unseen scenarios – Singapore BS 1. First, we consider the following cases of inaccurate environmental maps:

**译稿位置：** [T072 · 第 402 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L402)；**译文候选全文：** **2）非理想几何信息。** 为评估不准确环境几何的影响，直接在未见的新加坡 BS 1 场景测试 mGCDNet。考虑四种情况：①动态车辆出现在真实场景中，但环境地图只包含静态建筑：手动添加车辆并重新生成信道，几何特征不变；②部分建筑缺失：移除 BS 附近建筑以明显改变传播路径，再生成几何特征；③建筑高度有误：调整若干建筑高度，再生成几何特征；④建筑位置偏差：分别扰动建筑位置，再提取结构特征。具体示意见图 11(a)。

**自动匹配线索：** mgcdnet、geometric→几何、maps→地图。

### GCD-P0079 · 页内坐标 x=322.8, y=117.3

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** • Real-world traffic flow: There are moving vehicles that affect the channel, but the environmental map captures only static buildings. In our experiment, we manually place several vehicles in the environmental map, as shown in Fig. 11(a) (left). We then regenerate the channel data while keeping the geometric features unchanged.

**译稿位置：** [T072 · 第 402 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L402)；**译文候选全文：** **2）非理想几何信息。** 为评估不准确环境几何的影响，直接在未见的新加坡 BS 1 场景测试 mGCDNet。考虑四种情况：①动态车辆出现在真实场景中，但环境地图只包含静态建筑：手动添加车辆并重新生成信道，几何特征不变；②部分建筑缺失：移除 BS 附近建筑以明显改变传播路径，再生成几何特征；③建筑高度有误：调整若干建筑高度，再生成几何特征；④建筑位置偏差：分别扰动建筑位置，再提取结构特征。具体示意见图 11(a)。

**自动匹配线索：** channel→信道、map→地图、geometric→几何、11。

### GCD-P0080 · 页内坐标 x=322.8, y=189.1

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** • Missing buildings: Some buildings are missing from the environmental map. We manually remove some buildings near the base station to ensure a significant change in the propagation paths, as shown in Fig. 11(a) (middle), and then regenerate the geometric features.

**译稿位置：** [T072 · 第 402 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L402)；**译文候选全文：** **2）非理想几何信息。** 为评估不准确环境几何的影响，直接在未见的新加坡 BS 1 场景测试 mGCDNet。考虑四种情况：①动态车辆出现在真实场景中，但环境地图只包含静态建筑：手动添加车辆并重新生成信道，几何特征不变；②部分建筑缺失：移除 BS 附近建筑以明显改变传播路径，再生成几何特征；③建筑高度有误：调整若干建筑高度，再生成几何特征；④建筑位置偏差：分别扰动建筑位置，再提取结构特征。具体示意见图 11(a)。

**自动匹配线索：** map→地图、geometric→几何、11。

### GCD-P0081 · 页内坐标 x=322.8, y=248.8

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** • Incorrect building heights: Some buildings in the environmental map lack accurate height information. In this case, we manually adjust the heights of some buildings, as shown in Fig. 11(a) (right), and then regenerate the geometric features.

**译稿位置：** [T072 · 第 402 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L402)；**译文候选全文：** **2）非理想几何信息。** 为评估不准确环境几何的影响，直接在未见的新加坡 BS 1 场景测试 mGCDNet。考虑四种情况：①动态车辆出现在真实场景中，但环境地图只包含静态建筑：手动添加车辆并重新生成信道，几何特征不变；②部分建筑缺失：移除 BS 附近建筑以明显改变传播路径，再生成几何特征；③建筑高度有误：调整若干建筑高度，再生成几何特征；④建筑位置偏差：分别扰动建筑位置，再提取结构特征。具体示意见图 11(a)。

**自动匹配线索：** map→地图、geometric→几何、11。

### GCD-P0082 · 页内坐标 x=312, y=308.6

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** • Building position errors: The building positions in the environmental map are biased. Similar to inaccurate user positions, we independently introduce biased positions for each building in the environmental map. We then regenerate the geometric features. The results are shown in Fig. 11(b). Under traffic conditions, mGCDNet exhibits little performance change. This is because, compared to static background buildings, moving vehicles are relatively small in size and thus have a relatively minor impact on the channel. In contrast, non-ideal information regarding the buildings has a greater impact on mGCDNet’s performance, as these cases may alter the number or visibility of propagation paths. Nevertheless, mGCDNet maintains satisfactory performance on most testing samples. In Fig. 12(a)-(b), we introduce errors to the BS position and user positions. It can be observed that the performance exhibits a similar trend as the BS/user position error increases. Next, we consider the imperfect ray tracing results. In Fig. 12(c), we evaluate the impact of the number of paths by limiting the maximum number and removing exceeding paths. As the number of retained paths decreases, the NMSE performance of mGCDNet gradually declines. Meanwhile, the NMSE performance also depends on the lengths of the retained paths, as shorter paths usually exhibit less attenuation and have a greater impact on the channel. Hence, retaining shorter paths results in a smaller performance decline compared to retaining the same number of longer paths. In Fig. 12(d), we evaluate the impact of path depth. i.e., the number of interactions with the environment. As the maximum depth decreases, the NMSE performance of mGCDNet also degrades. Overall, mGCDNet maintains stable performance when the number of retained paths exceeds 8 to 16 and the maximum depth is at least 3. 3) Finetuning in New Scenarios: When deployed in unseen scenarios, performance degradation on hard testing samples is inevitable due to the significant difference in data distribution compared to the previous scenarios involved in training. Nevertheless, by leveraging the common knowledge gained from

**译稿位置：** [T073 · 第 406 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L406)；**译文候选全文：** 还考虑不完整的射线追踪结果。图 12(c) 通过限制保留路径数，发现路径越少，NMSE 一般越差；保留较短路径比保留等量较长路径更有利，因为短路径一般传播衰减较小、影响更大。图 12(d) 减少允许的最大环境交互次数（路径深度），NMSE 也会恶化。综合来看，当保留超过 8–16 条路径，最大路径深度不小于 3 时，mGCDNet 表现较稳定。

**自动匹配线索：** mgcdnet、nmse、results→结果、ray→射线、environment→环境、12、16。

## PDF 第 13 页 · 提取候选 5 项

### GCD-P0083 · 页内坐标 x=88.5, y=133.8

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Real-world traffic flow Missing buildings Incorrect building heights

**译稿位置：** [T073 · 第 406 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L406)；**译文候选全文：** 还考虑不完整的射线追踪结果。图 12(c) 通过限制保留路径数，发现路径越少，NMSE 一般越差；保留较短路径比保留等量较长路径更有利，因为短路径一般传播衰减较小、影响更大。图 12(d) 减少允许的最大环境交互次数（路径深度），NMSE 也会恶化。综合来看，当保留超过 8–16 条路径，最大路径深度不小于 3 时，mGCDNet 表现较稳定。

### GCD-P0084 · 页内坐标 x=49, y=559

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** pre-training in previous scenarios, mGCDNet can efficiently adapt to these new scenarios with only a small amount of training data and computational resources. To illustrate this point, we perform a few steps of finetuning using data from the new scenario Singapore BS 1. As shown in Fig. 13(a), even after hundreds of finetuning steps, the performance of mCMixer and mPCMixer in the new scenario remains inferior to the initial performance of mGCDNet without any finetuning. Furthermore, as shown in Fig. 13(b), both mCMixer and mPCMixer exhibit catastrophic forgetting in previous scenarios, resulting in severe performance degradation. In contrast, mGCDNet benefits from multi-scenario pre-training, enabling it to quickly adapt to new scenarios while maintaining outstanding performance in previous ones. More specifically, with only a small number of finetuning steps, mGCDNet can rapidly generalize well to those hard samples in new scenarios,

**译稿位置：** [T074 · 第 411 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L411)；**译文候选全文：** **3）在新场景中微调。** 当新场景的数据分布与既有训练场景差异很大时，困难样本上性能退化难以避免。但多场景训练获得的共性知识可使 mGCDNet 以少量新场景数据和算力快速适应。作者使用新加坡 BS 1 的少量数据微调。图 13(a) 显示即使经过数百个微调步骤，mCMixer 和 mPCMixer 在新场景中的效果仍不及 mGCDNet 完全不微调的初始表现；图 13(b) 还显示这两个基线在先前场景中出现灾难性遗忘。mGCDNet 则既能快速适应新场景困难样本，又能保持旧场景上的性能，微调后新场景的 NMSE 分布更加集中。

**自动匹配线索：** mgcdnet、mcmixer、mpcmixer、training→训练、data→数据、initial→初始、samples→样本、13。

### GCD-P0085 · 页内坐标 x=362.7, y=215.2

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** BS 1 5 GHz 40 MHz 1 × 16 Short dipole BS 2 3.5 GHz 20 MHz 1 × 16 Short dipole BS 3 5 GHz 20 MHz 4 × 4 λ/2 dipole

**译稿位置：** [T073 · 第 406 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L406)；**译文候选全文：** 还考虑不完整的射线追踪结果。图 12(c) 通过限制保留路径数，发现路径越少，NMSE 一般越差；保留较短路径比保留等量较长路径更有利，因为短路径一般传播衰减较小、影响更大。图 12(d) 减少允许的最大环境交互次数（路径深度），NMSE 也会恶化。综合来看，当保留超过 8–16 条路径，最大路径深度不小于 3 时，mGCDNet 表现较稳定。

**自动匹配线索：** 16。

### GCD-P0086 · 页内坐标 x=323, y=313.6

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** London BS 1 4.6 GHz 20 MHz 4 × 4 TR 38.901 BS 2 5 GHz 40 MHz 4 × 4 Isotropic BS 3 2.4 GHz 20 MHz 1 × 16 Short dipole ASU Campus 3.5 GHz 20 MHz 1 × 16 Isotropic

**译稿位置：** [T075 · 第 415 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L415)；**译文候选全文：** **4）跨系统配置泛化。** 进一步构造每个场景的频率、带宽、BS 阵列几何与方向图均不同的另一组数据集。利用 Sionna RT 重新生成 12 个场景的信道（最多五次反射），并加入来自 DeepMIMO [45] 的 ASU Campus 室外场景，后者由 Wireless Insite 仿真，考虑最多六次反射、一次绕射或一次散射。ASU 的卫星图见图 15(a)，各系统参数见表 VIII。

**自动匹配线索：** campus。

### GCD-P0087 · 页内坐标 x=312, y=641.9

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** thereby achieving more concentrated NMSE distribution. 4) Generalization across System Configurations: To evaluate the generalization capabilities across different system configurations, we generate another group of channel datasets, where each scenario has its own carrier frequency, bandwidth, BS antenna array geometry, and antenna pattern. We first employ Sionna RT to regenerate channel data based on the 12 scenarios with new system configurations. We enable the propagation paths with no more than 5 reflections. Addition-

**译稿位置：** [T075 · 第 415 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L415)；**译文候选全文：** **4）跨系统配置泛化。** 进一步构造每个场景的频率、带宽、BS 阵列几何与方向图均不同的另一组数据集。利用 Sionna RT 重新生成 12 个场景的信道（最多五次反射），并加入来自 DeepMIMO [45] 的 ASU Campus 室外场景，后者由 Wireless Insite 仿真，考虑最多六次反射、一次绕射或一次散射。ASU 的卫星图见图 15(a)，各系统参数见表 VIII。

**自动匹配线索：** sionna、channel→信道、datasets→数据集、frequency→频率、geometry→几何、12。

## PDF 第 14 页 · 提取候选 4 项

### GCD-P0088 · 页内坐标 x=68, y=69.5

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 非正文候选：作者/出版信息或表格。

**原文全文（PDF 文本层）：** Scenario Scheme NMSE (dB) ρ Mean Median Mean Median

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0089 · 页内坐标 x=49, y=373.6

**原文章节（自动识别）：** C. Multi-Scenario Learning。**目标译稿章节：** C. 多场景学习。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** ally, to involve different ray tracing platforms and settings, we introduce the ASU Campus scenario from DeepMIMO [45], an outdoor scenario with channel data simulated using Wireless Insite. The satellite image of this scenario is shown in Fig. 15(a). The simulation considers paths containing up to 6 reflections, 1 diffraction, or 1 scattering event. The detailed system configurations of these scenarios are shown in Table VIII. We train each scheme in the first 6 scenarios and evaluate directly across all 13 scenarios, including the newly added ASU Campus.

**译稿位置：** [T075 · 第 415 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L415)；**译文候选全文：** **4）跨系统配置泛化。** 进一步构造每个场景的频率、带宽、BS 阵列几何与方向图均不同的另一组数据集。利用 Sionna RT 重新生成 12 个场景的信道（最多五次反射），并加入来自 DeepMIMO [45] 的 ASU Campus 室外场景，后者由 Wireless Insite 仿真，考虑最多六次反射、一次绕射或一次散射。ASU 的卫星图见图 15(a)，各系统参数见表 VIII。

**自动匹配线索：** campus、deepmimo、wireless、insite、channel→信道、data→数据、satellite→卫星、simulation→仿真、45、15、[45]。

### GCD-P0090 · 页内坐标 x=312, y=483.8

**原文章节（自动识别）：** D. Ablation Studies on Prompt Design。**目标译稿章节：** D. 提示设计的消融实验。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** In this subsection, we design several alternative approaches to incorporate the geometric information and compare them with the proposed random prompt augmentation method. All these methods follow the same framework – fusing partial CSI with geometric features to acquire full CSI. The only difference among them lies in how the geometric features are handled. Through this comparison, we demonstrate that the proposed prompt design not only outperforms traditional channel estimation methods but also excels at leveraging geometric information compared with other geometry-aided methods. Specifically, we devise the following methods:

**译稿位置：** [T077 · 第 456 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L456)；**译文候选全文：** 为验证随机提示增强的价值，作者设计另外三种使用几何信息的方式，均遵循“部分 CSI + 几何特征 → 完整 CSI”的框架，区别仅在于几何结构怎样转换为提示：

**自动匹配线索：** geometric→几何、framework→框架。

### GCD-P0091 · 页内坐标 x=322.8, y=618.7

**原文章节（自动识别）：** D. Ablation Studies on Prompt Design。**目标译稿章节：** D. 提示设计的消融实验。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** • Geometry-channel fusion (GCF): This scheme allows the neural network to learn on its own how to convert the geometric path parameters into an appropriate prompt that can be fused with the partial CSI. Since the number of paths is uncertain and there is no specific order among the different paths, we employ a Transformer without positional embedding to process the path parameters Pi, followed by average pooling to obtain a latent feature vector pi ∈RD. We use a shared Transformer to process the geometric features of all n neighbors, thereby obtaining n feature vectors pi1, · · · , pin. These feature

**译稿位置：** [T078 · 第 458 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L458)；**译文候选全文：** **几何—信道融合（GCF）。** 让神经网络自行学习把几何路径参数转为可融合的提示。由于路径数量可变、路径之间没有确定顺序，使用不带位置嵌入的 Transformer 处理 $\mathcal P_i$，经平均池化形成潜在向量 $\mathbf p_i\in\mathbb R^D$。所有 $n$ 个邻居共用同一个 Transformer，所得 $n$ 个向量作为上下文送入信息融合模块，称为 mGCFNet。

**自动匹配线索：** transformer、network→网络、geometric→几何、parameters→参数。

## PDF 第 15 页 · 提取候选 8 项

### GCD-P0092 · 页内坐标 x=68.9, y=219

**原文章节（自动识别）：** D. Ablation Studies on Prompt Design。**目标译稿章节：** D. 提示设计的消融实验。**状态：** 待核候选（弱线索）。

**原文全文（PDF 文本层）：** vectors serve as the contextual prompt and are fed into the channel information fusion module. We refer to this scheme as mGCFNet.

**译稿位置：** [T078 · 第 458 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L458)；**译文候选全文：** **几何—信道融合（GCF）。** 让神经网络自行学习把几何路径参数转为可融合的提示。由于路径数量可变、路径之间没有确定顺序，使用不带位置嵌入的 Transformer 处理 $\mathcal P_i$，经平均池化形成潜在向量 $\mathbf p_i\in\mathbb R^D$。所有 $n$ 个邻居共用同一个 Transformer，所得 $n$ 个向量作为上下文送入信息融合模块，称为 mGCFNet。

**自动匹配线索：** mgcfnet、channel→信道。

### GCD-P0093 · 页内坐标 x=59.8, y=254.8

**原文章节（自动识别）：** D. Ablation Studies on Prompt Design。**目标译稿章节：** D. 提示设计的消融实验。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** • Basis-channel fusion (BCF): This scheme draws inspiration from several existing studies on DT-aided channel acquisition [30], [35]. We select the path parameters Pi of the nearest neighbor and compute a set of matrices {Φi,p}Np,i p=1 , with each matrix Φi,p ∈CNt×Nc defined as Φi,p[nt, nc] = ϕi,nt,nc,p (see (10)). These matrices form a basis (which may be non-orthogonal) of the channel subspace. We feed these Np,i basis matrices as the contextual prompt into the channel information fusion module. We refer to this scheme as mBCFNet.

**译稿位置：** [T079 · 第 460 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L460)；**译文候选全文：** **基—信道融合（BCF）。** 借鉴 DT 辅助信道获取 [30]、[35]，只选择最近邻的路径结构，逐路径计算矩阵 $\boldsymbol\Phi_{i,p}\in\mathbb C^{N_t\times N_c}$，其元素 $\Phi_{i,p}[n_t,n_c]=\phi_{i,n_t,n_c,p}$（式 10）。这些矩阵构成信道子空间的一组基（不要求正交），作为上下文提示送入融合模块，称为 mBCFNet。

**自动匹配线索：** mbcfnet、channel→信道、matrices→矩阵、matrix→矩阵、30、35、10、[30]、[35]。

### GCD-P0094 · 页内坐标 x=59.8, y=374.7

**原文章节（自动识别）：** D. Ablation Studies on Prompt Design。**目标译稿章节：** D. 提示设计的消融实验。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** • Deterministic pseudo channel construction: This method is similar to the proposed prompt design, with the difference being that the placeholder is not random. Specifically, we construct a deterministic pseudo channel eH(D) i ∈CNt×Nc by replacing the unknown eαi with a placeholder ez(D) i :

**译稿位置：** [T083 · 第 479 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L479)；**译文候选全文：** 接下来在前 6 个场景联合训练，测试全部 12 场景。图 17 显示多场景训练改善了 mBCFNet、mGCFNet 的效果，mBCFNet 甚至优于 mGCDNet(D)。图 18(a) 显示已见场景中，增大提示长度可以改善各方法性能，可能因为多场景协同训练迫使网络学习利用上下文。图 18(b) 中，未见场景上的 mGCDNet、mGCDNet(D)、mBCFNet 能够借助提示发挥作用，mGCFNet 则基本失效。可能的原因是 GCF 不利用显式信道模型，只能从训练数据学习“几何 → CSI”的映射，一旦新场景分布显著变化就缺乏泛化能力。

**自动匹配线索：** channel→信道、method→方法。

### GCD-P0095 · 页内坐标 x=125.6, y=454.2

**原文章节（自动识别）：** D. Ablation Studies on Prompt Design。**目标译稿章节：** D. 提示设计的消融实验。**状态：** 非正文候选：疑似图表标签。

**原文全文（PDF 文本层）：** eH(D) i [nt, nc] = ϕT i,nt,nc ez(D) i , (17)

**译文位置：** 未定位；必须根据原 PDF 查漏或检查跨段对应。

### GCD-P0096 · 页内坐标 x=68.9, y=476.1

**原文章节（自动识别）：** D. Ablation Studies on Prompt Design。**目标译稿章节：** D. 提示设计的消融实验。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** where each element of ez(D) i is

**译稿位置：** [T084 · 第 481 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L481)；**译文候选全文：** 总体而言，把物理信道模型纳入提示构造的三种方案均能支持多场景学习和一定跨场景泛化，而随机增强的 mGCDNet 在单场景与多场景实验中表现最优，支持随机提示增强的有效性。

### GCD-P0097 · 页内坐标 x=49, y=529

**原文章节（自动识别）：** 2 σz. (18)。**目标译稿章节：** V. 结论。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** Compared with (12), the variable z(D) i,p here is a constant value instead of a random one. We set this value as the expected magnitude of the original random variable, i.e., z(D) i,p = E[|zi,p|], with zi,p ∼CN(0, σ2 z) as defined in (12). We refer to mGCDNet with this prompt design as mGCDNet (D). All these schemes adopt the same training setting as the proposed mGCDNet. We first train each scheme in a single scenario – San Francisco BS 1. Fig. 16(a) shows the CDF of NMSE. We can observe that mGCDNet performs best while mGCDNet (D) ranks second. Both mBCFNet and mGCFNet perform poorly. Fig. 16(b) investigates the impact of prompt length on performance. For mBCFNet, a prompt length of n means retaining the basis matrices corresponding to at most n shortest paths; for the other three schemes, the prompt length represents the number of neighboring samples. We observe that as the prompt length increases, the performance of mBCFNet and mGCFNet actually declines. This suggests

**译稿位置：** [T085 · 第 489 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L489)；**译文候选全文：** 本文提出几何辅助信道推断 GCD 框架，从数字孪生中提取几何先验并与少量导频获得的粗略 CSI 估计融合。根据无线信道的物理结构，作者设计了场景提示的生成与随机增强方法；同时借鉴先进学习架构实现信道信息融合，并加入导频位置掩码以支持可变配置。实验表明，方法能以较低导频开销获取高质量 CSI，对存在误差的几何信息表现出鲁棒性，并具有较好的跨场景泛化能力。

### GCD-P0098 · 页内坐标 x=312, y=56.9

**原文章节（自动识别）：** 2 σz. (18)。**目标译稿章节：** V. 结论。**状态：** 仅顺序候选，必须核实。

**原文全文（PDF 文本层）：** that these two schemes fail to effectively utilize the auxiliary geometric information within the prompt. Next, we train each scheme in the first 6 scenarios and evaluate across all 12 scenarios. The results are shown in Fig. 17. Compared with the single-scenario case, the performance of mBCFNet and mGCFNet improves due to multi-scenario learning, and mBCFNet even outperforms mGCDNet (D). Fig. 18(a) and Fig. 18(b) illustrate the impact of prompt length on performance in learned and unseen scenarios, respectively. In the learned scenario, the performance of all schemes improves as the prompt length increases, indicating that all schemes can utilize the contextual information within the prompt. This contrasts with the results in single-scenario learning in Fig. 16(b), likely because these schemes have to learn to exploit the contextual information within the prompt during training to accommodate multiple scenarios. In the unseen scenario, mGCDNet, mGCDNet (D), and mBCFNet perform well with the assistance of contextual prompts, whereas mGCFNet completely fails. This may be because mGCFNet does not leverage the channel model and can only learn to convert the geometric information to CSI prompt based on training data, thus lacking generalization capabilities in new scenarios where the data distribution changes drastically. Overall, mGCDNet, mGCDNet (D), and mBCFNet incorporate the channel model into prompt design, successfully achieving multi-scenario collaborative learning and crossscenario generalization. Among these schemes, mGCDNet achieves the best performance in both single-scenario and multi-scenario cases, validating the effectiveness of the proposed random prompt augmentation method.

**译稿位置：** [T085 · 第 489 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L489)；**译文候选全文：** 本文提出几何辅助信道推断 GCD 框架，从数字孪生中提取几何先验并与少量导频获得的粗略 CSI 估计融合。根据无线信道的物理结构，作者设计了场景提示的生成与随机增强方法；同时借鉴先进学习架构实现信道信息融合，并加入导频位置掩码以支持可变配置。实验表明，方法能以较低导频开销获取高质量 CSI，对存在误差的几何信息表现出鲁棒性，并具有较好的跨场景泛化能力。

**自动匹配线索：** geometric→几何、channel→信道、method→方法。

### GCD-P0099 · 页内坐标 x=312, y=462.3

**原文章节（自动识别）：** V. CONCLUSION。**目标译稿章节：** V. 结论。**状态：** 待核候选（术语/数值线索）。

**原文全文（PDF 文本层）：** In this paper, we propose a channel acquisition framework named GCD, which extracts geometric prior information from the DT and fuses it with pilot-based coarse estimates. We carefully design the method for scenario prompt generation and augmentation by considering the physical structure of channel data. For channel information fusion, we draw upon advanced learning architecture while enhancing it to support variable pilot configurations. Comprehensive experimental results validate the superiority of the proposed schemes, which achieve high-quality channel acquisition with low pilot overhead, strong robustness to biased geometric information, and significant cross-scenario generalization capability. Our work highlights the importance of prompting and pretraining for wireless models. By providing necessary and accessible prompts – such as environmental geometry, pilot patterns, and system configurations – the model can undergo thorough pre-training using rich data from multiple scenarios with variable pilot patterns and diverse system configurations, thereby learning universal knowledge and in turn enhancing the model’s intelligence. Furthermore, modality transformation and network architecture design that adhere to the physical structure of wireless channels also contribute to improving the model’s learning efficiency. These insights may serve as references for future wireless model design.

**译稿位置：** [T086 · 第 491 行](https://github.com/LRXuanxuan/lrxuanxuan.github.io/blob/main/papers/translations/2026-10-29-geometry-aided-channel-2609-37277.md#L491)；**译文候选全文：** 这项工作强调提示和预训练对无线通信模型的重要性。通过提供环境几何、导频图样、系统配置等必要且易获取的提示，可用多个场景中多样化的导频配置和硬件条件开展充分预训练，使模型学习具有一定普适性的知识。遵循电磁传播结构进行模态转换与网络架构设计，也有助于提高学习效率；这些认识可为未来无线模型设计提供参考。

**自动匹配线索：** geometric→几何、pilot→导频、pretraining→预训练、models→模型。

## PDF 第 16 页 · 提取候选 0 项

本页未提取到符合正文特征的文字块（可能以公式、图片、表格或参考文献为主）。

## 暂未被自动指向的中文译段（39 项）

这些译段不一定多余；可能由一对多翻译或原文解析失误造成。

- T001 · 第 1 行 ·  · --- layout: page title: "几何辅助信道推断：部分 CSI 与未标定数字孪生｜中文译稿（待终校）" permalink: /papers/translations/2026-10-29-geometry-aided-channel-2609-37277/ math: …
- T002 · 第 14 行 ·  · **原题：** Geometry-Aided Channel Deduction with Partial Channel Estimates and Uncalibrated Digital Twin **作者：** Hongning Ruan、Zhaoyang Zhang、Zirui …
- T004 · 第 23 行 · 摘要 · 为此，作者首先从数字孪生中提取仅包含简单信道结构的几何特征，然后提出“随机提示增强”（random prompt augmentation）：把几何多径结构转为类似 CSI 的提示表示，同时抑制其他未知信道参数所造成的干扰。随后通过信道推断网络融合提示与基于导频的瞬时信道估计。为了进一步提…
- T005 · 第 25 行 · 摘要 · **关键词：** 信道获取、信道推断、数字孪生、射线追踪、跨场景泛化。
- T006 · 第 31 行 · A. 研究背景 · 未来无线网络将朝着更高连接密度、数据速率、频谱效率及智能化程度发展，推动技术包括超大规模 MIMO [2]、太赫兹通信、可重构智能表面（RIS）、堆叠智能超表面（SIM）[3] 与通信感知一体化（ISAC）[4]。阵列尺寸增大和带宽扩展令信道维数快速上升，低导频开销获取高维 CSI 越来越…
- T007 · 第 33 行 · A. 研究背景 · 由于不同天线和子载波对应的物理传播环境相似，可用 CSI 的一个子集推断完整 CSI，从而降低导频开销。然而，复杂电磁传播机制使传统插值不容易取得最优性能。部分方法 [5]、[6] 从导频测量估计路径参数再重建 CSI，但参数估计往往需要较高复杂度。深度学习能够提取高维数据的潜在特征，已应…
- T008 · 第 37 行 · B. 相关工作 · **1）基于导频的信道估计。** 神经网络已被广泛用于信道估计。例如，[9]、[10] 利用卷积神经网络（CNN）在频域插值，[11] 利用多层感知机（MLP）从部分天线 CSI 外推其他天线。文献 [12] 提出受物理结构启发的复数域 MLP-Mixer（CMixer），将部分天线—子载…
- T009 · 第 39 行 · B. 相关工作 · **2）无导频信道预测。** 这类研究基于某些辅助信息可以确定性映射到完整 CSI 的假设，使用过去时隙的信道 [16]、[17]、用户位置 [18]、[19]、实时感知 [20] 或无线环境信息 [21]–[26] 进行预测。但小尺度移动与微小环境变化难以预测，自回归会累积误差。仅凭位置…
- T010 · 第 41 行 · B. 相关工作 · 一些工作 [21]–[23] 利用已知环境几何及实测信道数据校准材料参数或学习电磁交互，然后使用标定的数字孪生和射线追踪预测任意位置的信道；另一些方法 [24]–[26] 则不依赖显式环境几何，而根据实测信道重建无线辐射场。但这些方法往往仍需要高精度定位，并在每个场景产生额外数据采集和计算…
- T011 · 第 43 行 · B. 相关工作 · **3）混合信道获取。** 近期研究尝试把导频与辅助信息融合：辅助信息提供信道先验结构以减少导频，少量即时导频又可校准不可预测的小尺度变化并降低对辅助信息精度的要求。[27] 的信道推断（CD）框架利用历史信道提供大尺度特征；[28] 的位置辅助 CMixer（PCMixer）融合位置和 …
- T015 · 第 69 行 · C. 动机与贡献 · 第二节给出电磁传播及信道模型，第三节描述 GCD 及实现，第四节评估性能，第五节总结。
- T018 · 第 79 行 · A. 电磁波传播 · 天线方向图的严格归一化约束为 $\int_0^{2\pi}\int_0^\pi \&#124;\mathbf g(\widehat{\mathbf k})\&#124;^2\sin\theta\,d\theta\,d\phi=4\pi\eta$，其中 $\theta,\phi$ 是天顶角和…
- T023 · 第 108 行 · B. 信道模型 · 近似展开为
- T028 · 第 141 行 · C. 可获取的信道特征 · 其中 $\boldsymbol\phi_{n_t,n_c},\widetilde{\boldsymbol\alpha}\in\mathbb C^{N_p}$，其第 $p$ 个元素为
- T030 · 第 155 行 · C. 可获取的信道特征 · 几何数据存在误差，因此载频相关的快速相位项 $e^{-j2\pi f\tau_p}$ 可能无法预测 [40]。作者故意不把它放进可获得的结构特征 $\boldsymbol\phi$，而是并入未知的 $\widetilde{\boldsymbol\alpha}$。相比之下，工作频率、子载波间…
- T031 · 第 157 行 · C. 可获取的信道特征 · 将式（2）代入式（8）得
- T035 · 第 179 行 · A. 几何特征提取 · 因此，作者改为由 BS 离线预提取多径信息，无需真实用户位置。首先在环境地图上采样 $N$ 个虚拟用户位置 $\mathbf x_1,\ldots,\mathbf x_N$，粗略覆盖潜在用户活动区域。然后在这些位置开展射线追踪，获得几何特征集合
- T036 · 第 187 行 · A. 几何特征提取 · $\mathcal P_i$ 表示虚拟位置 $\mathbf x_i$ 的信道结构，$N_{p,i}$ 是从 BS 到该位置的路径数，$d_{i,p}$ 与 $\widehat{\mathbf k}_{i,p}$ 是路径长度和出发方向。由于 $\mathcal F$ 只包含离散有限位置的路…
- T037 · 第 189 行 · A. 几何特征提取 · 用户获得 $\mathcal F$ 后，可在本地利用自身位置 $\mathbf x$ 检索距离最近的 $n$ 个虚拟位置 $\mathbf x_{i_1},\ldots,\mathbf x_{i_n}$ 及相应结构 $\mathcal P_{i_1},\ldots,\mathcal P_{…
- T039 · 第 195 行 · B. 随机提示增强 · 设 $\widetilde H_i[n_t,n_c]=\boldsymbol\phi_{i,n_t,n_c}^\mathsf T\widetilde{\mathbf z}_i$，其中几何结构与系统配置可确定
- T044 · 第 226 行 · C. 信道推断网络 · 预映射和精修模块在空频域处理信道，都使用 CMixer [12]，其结构见图 3(a)。CMixer 将复输入 $\mathbf H_{\mathrm{in}}\in\mathbb C^{N_{t,\mathrm{in}}\times N_{c,\mathrm{in}}}$ 和复输出 $\…
- T045 · 第 228 行 · C. 信道推断网络 · 一个 $K$ 层 CMixer 实现预映射 $\mathrm{PM}:\mathbb C^{N_{t,\pi}\times N_{c,\pi}}\to\mathbb C^{N_t\times N_c}$，产生 $\mathbf H_{\mathrm{PM}}=\mathrm{PM}(\ma…
- T046 · 第 230 行 · C. 信道推断网络 · 信道信息融合模块采用注意力机制，使即时估计与多个伪信道的特征相互交互，结构见图 3(d)–(e)。各输入信道先经形状变换与线性投影压缩为 $D$ 维实数向量，再叠加可学习嵌入，以区分即时估计与场景伪信道。随后输入具有 $L$ 层的 Transformer 编码器进行信息交互。取对应 $\m…
- T047 · 第 238 行 · C. 信道推断网络 · **2）掩码增强 GCDNet。** 以上预映射仅接收部分 CSI，不包含导频位置，因此只能适用固定的导频图样 $\Omega$（即 $R_t,R_c,S_t,S_c$ 均固定）。为提高通用性，作者把导频位置显式输入预映射模块。定义空频网格上的二值掩码
- T049 · 第 253 行 · D. 训练与推理 · 训练 (m)GCDNet 需要来自通信场景的数据集 $\mathcal D$，每个样本 $(\mathbf H,\mathbf x)$ 含完整 CSI 和用户位置，同时该场景应提供几何特征集 $\mathcal F$。由于几何先验带来场景上下文，可跨不同场景进行协同训练。假设共有 $M$ …
- T050 · 第 255 行 · D. 训练与推理 · 每个训练步骤先从 $\{1,\ldots,M\}$ 均匀抽取场景索引 $m$，再从对应数据集采样 $(\mathbf H,\mathbf x)$，同时从导频图样集中采样 $\Omega$。据此从完整 CSI 构造 $\mathbf H_\pi$、零填充 CSI $\widetilde{\m…
- T051 · 第 257 行 · D. 训练与推理 · 为减轻信道绝对幅度变化的影响，作者根据已知部分 CSI 估计平均功率 $P_H=\&#124;\widetilde{\mathbf H}\&#124;_F^2/\&#124;\mathbf M\&#124;_1$，在输入网络前执行 $\mathbf H\leftarrow\mathbf H…
- T052 · 第 263 行 · D. 训练与推理 · 推理阶段同样使用 $\sqrt{P_H}$ 对输入归一化，再对预测执行 $\widehat{\mathbf H}\leftarrow\sqrt{P_H}\widehat{\mathbf H}$，恢复绝对幅度尺度。
- T053 · 第 265 行 · D. 训练与推理 · 由于射线追踪与特征提取离线执行，在线只需邻居搜索、伪 CSI 生成与网络前向传播。若在 $N$ 个虚拟位置的距离中寻找最小的 $n$ 个，邻域搜索开销为 $O(N+N\log n)=O(N\log n)$。伪 CSI 构造开销为 $O(N_tN_cN_p n)$，其中 $N_p$ 为最大路…
- T055 · 第 274 行 · A. 实验设置 · BS 配备 $N_t=16$ 单元均匀线性阵列（ULA）。用户配置随机取向偶极天线，以模拟不同的方向图。系统载频 $f=5$ GHz，带宽 40 MHz，划分为 $N_c=256$ 个子载波。
- T060 · 第 312 行 · A. 实验设置 · **3）评价指标。** 用归一化均方误差（NMSE）和余弦相关系数 $\rho$ 衡量每个样本的 CSI 获取质量：
- T063 · 第 337 行 · B. 单场景学习 · 本节仅使用旧金山 BS 1 场景训练和评估，训练、验证、测试集分别为 40k、10k、10k 样本。
- T066 · 第 370 行 · B. 单场景学习 · 后续采用 $R_t=4,R_c=16$ 作为信道质量与导频开销的折中。
- T067 · 第 374 行 · B. 单场景学习 · **3）提示长度及位置误差。** 图 8(a) 考察邻域数量 $n$。随 $n$ 增大，mGCDNet 的性能先提高后趋于饱和；即便只有一个邻居，也能明显优于其他方法。作者还测试另一种方案：只检索最近的一个邻居，把它的几何特征重复 $n$ 次，每次使用独立随机占位向量。图中虚线显示，这与采…
- T071 · 第 397 行 · C. 多场景学习 · 另外使用 AAR 评价预编码。图 10 表示在这两个场景中随 BS 发射功率变化的性能。mGCDNet 尤其在未见场景中优势显著，其 AAR 与已见场景相近并明显优于其他方法，说明 GCD 具备跨场景预编码应用潜力。
- T076 · 第 435 行 · C. 多场景学习 · 在前 6 个场景联合训练，在全部 13 个场景上直接评估。图 14(a) 为已见场景，mGCDNet 持续优于基线；图 14(b) 为未见场景，基线方法在新场景中基本失效，而 mGCDNet 仍可泛化到部分样本，尤其是新加坡 BS 1。这些样本可能与训练场景的数据分布有重叠，因此作者认为增…
- T080 · 第 462 行 · D. 提示设计的消融实验 · **确定性伪信道。** 与本文方案相同地按物理模型计算伪 CSI，但把未知路径占位从随机量改为常数，定义
- T081 · 第 475 行 · D. 提示设计的消融实验 · 常数取为式（12）中复高斯随机量的模的期望 $\mathbb E&#124;z_{i,p}&#124;$，对应网络记为 mGCDNet(D)。
- T082 · 第 477 行 · D. 提示设计的消融实验 · 四种方法采用相同训练设置。单场景旧金山 BS 1 的结果见图 16(a)：mGCDNet 最优、mGCDNet(D) 次之，mBCFNet 与 mGCFNet 表现较差。图 16(b) 中，增大提示长度反而使后两者退化，说明它们未能有效利用几何提示；对 BCF，提示长度表示保留的最短路径基…

## 跨栏或跨页续段检查清单（自动提示）

下列原文块可能属于同一个自然段的两个片段，也可能被公式、图、表或正文分段打断。仅按首尾字符检测，**不是已经确定的段落合并**。逐段核校时应依 PDF 版面确认并决定是否将两个 ID 合并。

- GCD-P0013（第 2 页）→ GCD-P0014（第 2 页）：前块末尾「Low data collection cost Related works」；后块开头「strength and channel gain [31], [32] – rather than complete CS」。
- GCD-P0018（第 3 页）→ GCD-P0019（第 3 页）：前块末尾「tructural information. This method not only converts geometric」；后块开头「structural features into a complete CSI-like representation, h」。
- GCD-P0025（第 4 页）→ GCD-P0026（第 4 页）：前块末尾「The channel frequency response can be expressed as」；后块开头「where f is the frequency, τp = dp/c is the propagation delay o」。
- GCD-P0026（第 4 页）→ GCD-P0027（第 4 页）：前块末尾「bk), respectively. Then the path coefficient αp ∈C is given by」；后块开头「which accounts for the propagation distance, antenna patterns,」。
- GCD-P0028（第 4 页）→ GCD-P0029（第 4 页）：前块末尾「equency response for the nt-th antenna and nc-th subcarrier is」；后块开头「p=1 αpe-j2πfτpe-j2πnc∆fτpejkdT nt bkT,p. (4)」。
- GCD-P0031（第 4 页）→ GCD-P0032（第 4 页）：前块末尾「ring which the channel state is approximately constant, the BS」；后块开头「transmits pilot symbols on each subcarrier in Ωc through Nq tr」。
- GCD-P0046（第 6 页）→ GCD-P0047（第 6 页）：前块末尾「gular patterns from random data, thus avoiding the learning of」；后块开头「spurious correlations between the placeholders and the real ch」。
- GCD-P0048（第 6 页）→ GCD-P0049（第 7 页）：前块末尾「he input channels are first reshaped and compressed via linear」；后块开头「projection, transforming them into D-dimensional real-valued v」。
- GCD-P0050（第 7 页）→ GCD-P0051（第 7 页）：前块末尾「ing partial channels with various pilot patterns. A comparison」；后块开头「between the original pre-mapping module and the extended pre-m」。
- GCD-P0052（第 7 页）→ GCD-P0053（第 8 页）：前块末尾「 The network is trained using the Adam optimizer, and the loss」；后块开头「function is defined as the mean squared error (MSE) between th」。
- GCD-P0056（第 8 页）→ GCD-P0057（第 8 页）：前块末尾「er CMixer e K = 8, N′ t = Nt, N′ c = Nc ResMLP eL = 6, D = 512」；后块开头「environmental maps are imported into Sionna RT [42] to generat」。
- GCD-P0063（第 9 页）→ GCD-P0064（第 9 页）：前块末尾「ized MSE (NMSE) and cosine correlation ρ, which are defined as」；后块开头「where hnc, bhnc are the nc-th columns of H, bH, respectively. 」。
- GCD-P0064（第 9 页）→ GCD-P0065（第 9 页）：前块末尾「ce of precoding based on the acquired CSI, which is defined as」；后块开头「where vnc ∈CNt denotes the precoding vector for the ncth subca」。
- GCD-P0068（第 10 页）→ GCD-P0069（第 10 页）：前块末尾「e)-(g). Table VI shows the detailed quantitative results under」；后块开头「the noise-free condition. Clearly, DMPS and LMMSE can work eff」。
- GCD-P0071（第 11 页）→ GCD-P0072（第 11 页）：前块末尾「26 0.9259 -1.52 -0.68 0.9163 0.9664 -7.65 -12.33 0.9593 0.9947」；后块开头「realizations of the random placeholder. Next, we introduce err」。
- GCD-P0074（第 11 页）→ GCD-P0075（第 11 页）：前块末尾「Scenario Scheme NMSE (dB) ρ Mean Median Mean Median」；后块开头「accuracy achievable by existing systems. We also observe that 」。
- GCD-P0076（第 11 页）→ GCD-P0077（第 12 页）：前块末尾「(a) shows the NMSE performance of different schemes across the」；后块开头「first 6 scenarios involved in training. Both mGCDNet and mPCMi」。
- GCD-P0083（第 13 页）→ GCD-P0084（第 13 页）：前块末尾「orld traffic flow Missing buildings Incorrect building heights」；后块开头「pre-training in previous scenarios, mGCDNet can efficiently ad」。
- GCD-P0086（第 13 页）→ GCD-P0087（第 13 页）：前块末尾「1 × 16 Short dipole ASU Campus 3.5 GHz 20 MHz 1 × 16 Isotropic」；后块开头「thereby achieving more concentrated NMSE distribution. 4) Gene」。
- GCD-P0088（第 14 页）→ GCD-P0089（第 14 页）：前块末尾「Scenario Scheme NMSE (dB) ρ Mean Median Mean Median」；后块开头「ally, to involve different ray tracing platforms and settings,」。
- GCD-P0091（第 14 页）→ GCD-P0092（第 15 页）：前块末尾「by obtaining n feature vectors pi1, · · · , pin. These feature」；后块开头「vectors serve as the contextual prompt and are fed into the ch」。
- GCD-P0097（第 15 页）→ GCD-P0098（第 15 页）：前块末尾「rmance of mBCFNet and mGCFNet actually declines. This suggests」；后块开头「that these two schemes fail to effectively utilize the auxilia」。
