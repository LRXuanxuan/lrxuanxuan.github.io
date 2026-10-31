---
layout: page
title: "先验辅助的掩码矢量量化 CSI 反馈｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-17769-prior-aided-masked-vector-quantization-csi-feedback-for-fdd-massive-mi/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/4cc6953f005fade6/) · [原文 arXiv](https://arxiv.org/abs/2609.17769) · [全部目录](/papers/catalog/)

# 先验辅助的掩码矢量量化 CSI 反馈

**原题：** Prior-Aided Masked Vector Quantization CSI Feedback for FDD Massive MIMO Systems  
**作者：** Yi Song¹、Tianyu Yang²、Kangda Zhi¹、Shuangyang Li¹、Fangzhou Wu²、Songyan Xue²、Giuseppe Caire¹。单位：¹ 柏林工业大学通信与信息论组（CommIT, Technische Universität Berlin），10587 Berlin, Germany（{yi.song, k.zhi, shuangyang.li, caire}@tu-berlin.de）；² 华为技术有限公司，中国（fangzhou.wu, xuesongyan@huawei.com）。  
**版本：** arXiv:2609.17769v1（cs.IT），2026 年 9 月 15 日提交，原文 16 页（IEEE 双栏期刊投稿格式，含图 1–5、表 I、算法 1、公式 (1)–(36)、参考文献 31 条）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VII 节（含 I-A–C、II-A–B、III-A–I、V-A–C、VI-A–D 等全部小节）、结论、全部图注（图 1–5，含子图说明）、表 I（逐格转录）、算法 1、公式 (1)–(36) 与 31 条参考文献英文原条目；原文无附录、无作者简介；逐句逐式终校未做。

## 摘要

下行信道状态信息（CSI）反馈是频分双工（FDD）大规模 MIMO 系统的关键瓶颈：用户设备（UE）必须在有限的上行（UL）预算内把其估计的信道传给基站（BS）。为在紧约束反馈下提升 CSI 重建精度，我们提出**先验辅助掩码矢量量化（PM-VQ）**——一种以平均角度–时延功率图为条件的、基于学习的分离信源–信道编码（SSCC）反馈方案，该功率图是 UE 与 BS 双方均可获得的信道二阶统计量的紧凑表示。在 PM-VQ 中，先验辅助编码器把 CSI 映射为潜在 token，空间自适应掩码模块（SAMM）在反馈预算内对最具信息量的 token 打分并挑选；被选中的 token 经矢量量化后连同其位置一并反馈，而自适应去掩码模块（ADM）在 BS 侧完成潜在表示，随后进行先验条件解码。为支持可变速率压缩，单个模型在一系列选中 token 数量上训练，从而无需重训练即可在多种反馈维度下工作。我们在 Sionna 生成的 3GPP TR 38.901 UMa 数据集上，把 PM-VQ 与三种代表性基线对比，重点关注信道能量散布在众多角度–时延系数上的、最具挑战性的弥散区。仿真结果表明，在该区间内 PM-VQ 在所有测试 SNR 水平与反馈维度下取得最低 NMSE；此外，即使角度–时延功率图先验仅由少量信道实现估计得到，它仍然有益。

**关键词：** CSI 反馈、FDD 大规模 MIMO、矢量量化、边信息、率–失真理论、掩码、去掩码、深度学习。

## I. 引言

准确的下行（DL）CSI 是新一代无线系统的基石，因为它直接决定 DL 预编码质量与可达频谱效率。随着系统向更多用户、更大天线阵列与更宽带宽扩展，以低复杂度、低时延、有限开销获取此类 CSI 变得日益关键。CSI 的获取方式取决于双工模式。在时分双工（TDD）系统中，信道互易性使基站（BS）能通过开环方式由上行（UL）导频直接推断 DL 信道，代价是对收发同步与硬件校准有更严格要求。频分双工（FDD）系统避免了这一校准负担，但缺乏信道互易性，使 DL CSI 获取本质上更难。此时需要闭环反馈：BS 发送公共导频，各 UE 估计 DL 信道并把压缩描述经 UL 反馈，BS 再由该反馈重建 CSI。该闭环暴露了导频/反馈开销与 CSI 重建精度之间的基本权衡。设计能在有限 UL 反馈预算下准确重建高维 DL CSI 的反馈方案，是本文所处理的核心问题。

### A. 上行反馈策略

按经典的分离信源–信道编码二分法 [1]，UE 经 UL 发往 BS 的 CSI 反馈主要有两种设计方式。在分离信源–信道编码（SSCC）中，UE 先用信源编码器把 DL CSI 压缩为比特流，再用信道码保护这些比特免受 UL 噪声影响；BS 译码接收比特并重建 CSI。在联合信源–信道编码（JSCC）中，UE 直接把 CSI 估计映射为 UL 信道符号，BS 从含噪接收符号重建 CSI。两种策略各有吸引人之处。SSCC 模块化且已被充分理解：在无限块长极限下，按 Shannon 信源–信道分离定理，率–失真最优信源码级联容量可达信道码是最优的。然而在实际有限块长系统中，这种理想行为未必能完全实现：对给定调制与编码配置，当瞬时 UL 信道质量低于其可支持工作区时，译码错误概率会迅速上升，产生熟悉的**陡崖效应（cliff effect）**；此外，比特级信源编码、信道编码与译码流水线还引入额外时延。JSCC 放弃了这种模块化，但通过把信源表示直接映射到信道输入，避免了显式比特接口，并在实际含噪反馈区间随 UL SNR 下降更为平缓。其主要困难在于码设计：信息论意义上的最优信源–信道映射原则上存在，但一般没有闭式解，而简单线性映射在反馈受限区间可能远离最优。

鉴于这些互补的优缺点，我们出于两点理由采用 SSCC 框架。第一，它可直接部署：5G NR 等 FDD 标准中的 CSI 上报是数字式的，UE 经标准化、带信道编码的上行控制信道传送比特；SSCC 比特流与该流水线兼容，而 JSCC 把 CSI 作为模拟信道符号发送，现有数字反馈链路并不支持。第二，也是更根本的，SSCC 框架让我们能够分别处理信源编码与信道编码：把率–失真最优信源码与最先进的近容量信道码结合后，CSI 反馈问题化为信源编码问题，设计可集中于信源编码器，而该编码器可围绕已被充分理解的率–失真原理构建。

在 5G NR 这类实际数字 UL 中，给定资源分配下可向 BS 可靠传送的信息比特速率取决于 UL SNR。对给定 UL SNR，可可靠支持的速率取决于所用调制编码方案（MCS）、译码器实现与目标块错误率。通过链路自适应，较高 UL SNR 一般允许更高阶调制与更高码率并保持规定可靠性，而较低 UL SNR 需要更稳健配置、从而支持更低信息速率。记该可可靠支持速率为 $R^{\rm ach}_{\rm ul}({\rm snr}_{\rm ul})$（单位为每复信道使用的信息比特），则 $\beta_{\rm fb}$ 个复 UL 反馈信道使用可提供满足下式的可靠反馈比特预算：

$$
B\le\beta_{\rm fb}R^{\rm ach}_{\rm ul}({\rm snr}_{\rm ul}). \tag{1}
$$

为在不依赖特定调制、信道码与译码器实现的前提下研究 CSI 压缩问题，我们采用理想化的容量可达信道编码模型。对本文考虑的复 AWGN UL 反馈信道，可靠可达速率的渐近上界为

$$
C_{\rm ul}({\rm snr}_{\rm ul})=\log_2\left(1+{\rm snr}_{\rm ul}\right) \tag{2}
$$

（单位：每复信道使用的比特）。在足够长块长与逼近容量的信道码下，可可靠支持的 UL 速率可逼近 $C_{\rm ul}({\rm snr}_{\rm ul})$。因此我们采用乐观的反馈预算

$$
B\le\beta_{\rm fb}C_{\rm ul}({\rm snr}_{\rm ul}). \tag{3}
$$

于是，对固定的 UL 反馈信道使用数 $\beta_{\rm fb}$，UL SNR 越高，$C_{\rm ul}({\rm snr}_{\rm ul})$ 越大，可可靠送达 BS 的 CSI 反馈比特数也越多。该抽象把含噪 UL 链路简化为 $\beta_{\rm fb}C_{\rm ul}({\rm snr}_{\rm ul})$ 比特的乐观可靠比特预算，使对比可聚焦于 CSI 信源编码问题，而非特定 UL 信道编码实现。

### B. 相关工作

**a) 理论指导：** CSI 反馈问题可建模为远程信源编码问题：UE 须在与 UL 反馈信道容量相关的速率约束下，把来自含噪 DL 信道观测的 DL CSI 编码。为研究信息论极限，Khalilsarai 等 [2, 3] 对高斯信道模型用远程率–失真理论导出了给定速率约束下 CSI 归一化均方误差（NMSE）的下界；相应的高 SNR 标定律刻画了误差如何随 DL 导频维数、UL 反馈维数与信道秩缩放。该结果为 CSI 反馈提供两条有用设计准则。第一，线性 JSCC 在除一种情形外的所有区间都达到最优高 SNR 标定；该例外区间是：DL 导频维数超过信道秩，而 UL 反馈维数仍小于该秩。在这一反馈受限区间，非线性编码原则上可改善标定行为。第二，对高斯信源，率–失真最优解的速率分配遵循信源协方差特征模上的反向注水：给高方差模分配更多速率，对低于注水线的模不分配速率。这表明高效反馈编码器应利用信道二阶统计量，并在各信道分量间非均匀地分配可用反馈预算。受此观察启发，Song 等 [4, 5] 利用空间相关信道的低秩特征空间 [6]，提出了对主导 Karhunen–Loève 系数以优化功率分配进行编码的低复杂度 JSCC 方案，表明利用信道协方差结构可显著简化 CSI 反馈并指导有限反馈资源的分配。

然而，这些渐近信息论刻画与实际 CSI 反馈之间仍存在重要缺口。率–失真可达性本质上是渐近的：当把每个 CSI 矩阵视为信源的一次实现时，率–失真函数 $R(D)$ 通过联合编码成块的信源实现来逼近，其渐近极限在信源编码块长趋于无穷时达到。相反，CSI 反馈天然是**单次（one-shot）**信源编码问题：在每个信道相干区间内，UE 必须在严格的时延预算下压缩当前 CSI 实现并把它传给 BS。因此 UE 一般无法累积任意长的 CSI 实现序列并用渐近最优的率–失真码联合编码。所以，尽管远程率–失真理论提供了基本性能基准并揭示了结构性原理（如高斯情形下的反向注水），它并未直接说明如何在单个 CSI 实现上、以实际有限速率编码器实现这些原理。基于前述理由，我们在 SSCC 框架内追求这些理论指导。因此我们所处理的开放问题是：如何设计可训练、可变速率、能在该单次区间有效运行、利用信道二阶统计量并在真实信道数据上跨信道分量有选择地分配反馈预算的信源编码器。

**b) 基于学习的反馈：** 多用户大规模 MIMO 中 CSI 反馈的严格时延与复杂度要求，催生了广泛的基于学习的反馈方案。基于学习的 JSCC 把 CSI 表示直接映射为信道输入，BS 从含噪接收符号重建 CSI。早期工作采用基于 CNN 的编解码器架构进行 CSI 反馈 [7]；后续研究引入 SNR 自适应传输策略 [8] 以及利用信道输出反馈的反馈辅助变体 [9] 来提升鲁棒性；JSCC 近期进展的全面综述见 [10]。并行地，大量工作研究了基于学习的 SSCC CSI 压缩，代表例子是 CsiNet [11]，它用 CNN 自编码器压缩并重建角度–时延 CSI；后续扩展通过扩大感受野 [12]、引入多分辨率特征提取 [13] 与融入生成先验 [14] 改善重建质量；基于学习的 SSCC 反馈方案综述见 [15]。更近期，TransNet [16] 等基于注意力的架构被引入以捕获 CSI 中的长程依赖，因而本文将其作为神经网络基线的骨干。

**c) 局限：** 尽管有这些进展，现有基于学习的 CSI 反馈方案仍存在若干驱动我们设计的局限。第一，由于潜在表示通常纯粹从数据学习得到，不同潜在分量可能携带不同数量的 CSI 信息，因此反馈预算应集中于最具信息量的分量；但多数现有方案并未在反馈预算下显式识别或优先处理最具信息量的分量。第二，虽然率–失真理论强调了信道二阶统计量的重要性，多数基于学习方案并未在压缩与重建过程中显式利用它；Zhuang 等 [17] 利用了信道二阶统计量，但仅在解码器端用于重建。这两点共同表明，编码器不仅应学习紧凑的 CSI 表示，还应**识别并优先处理统计上重要的潜在分量**。第三，多数基于学习的 CSI 反馈方案只支持固定压缩比，需要为每个反馈预算训练单独模型；现有变速率方法通常构造嵌套潜在表示并依可用资源发送前 $k$ 个特征 [18–20]，但其特征排序在不同信道实现间一般固定。第四，多数现有评估依赖由单一固定信道剖面（如标准化的 CDL-C 或 CDL-D 模型 [21]）生成的数据集，在时延剖面、角度扩展、阵列几何与用户布局上变化有限，从而限制了当部署环境与训练分布不同时关于泛化性的结论。

### C. 贡献

受上述局限驱动，我们提出一种基于学习的 SSCC 反馈方案，称为先验辅助掩码矢量量化（PM-VQ），用于 DL CSI 反馈。受率–失真最优解的反向注水结构启发，PM-VQ 以平均角度–时延功率图作为先验边信息，指导给定反馈预算下的非均匀潜在 token 选择。它把矢量量化的潜在压缩与先验感知的 token 掩码及基于掩码的潜在补全结合起来，使编码器只发送最具信息量的潜在 token，而 BS 由接收 token 重建完整信道，并在编码器、token 打分模块与解码器处注入信道统计先验。主要贡献概括如下。

- **多层级先验条件化：** 我们利用平均角度–时延功率图作为先验边信息，并在多个语义层级注入它：编码器中的门控融合、token 打分解码中的 SPADE 式调制、以及 BS 侧的先验跳跃连接。这使压缩与重建都以信道二阶统计量为条件。
- **选择性潜在 token 传输：** 我们引入空间自适应掩码模块（SAMM），它同时利用瞬时 CSI 与长期先验为潜在 token 打分，并只在可用反馈预算下保留最具信息量者；在 BS 侧，自适应去掩码模块（ADM）由接收到的量化 token 重建被掩掉的 token。
- **内容自适应的可变速率反馈：** 由于 SAMM 对每个信道实现选择数量可变的 token，单个训练好的模型无需重训练即可在多种反馈维度 $\beta_{\rm fb}$ 上工作，且选择随每个 CSI 样本自适应。
- **几何多样化的数据集：** 我们用 Sionna 仿真器在 3GPP TR 38.901 UMa 模型下生成 DL CSI 数据集，在固定 BS 周围采样多样化 UE 位置，从而引入超出单一剖面训练的几何多样性。
- **统一基准比较：** 我们在以信道使用数计量的同一 UL 反馈维度 $\beta_{\rm fb}$ 下比较 PM-VQ 与全部基线。在覆盖从弥散到稀疏各类信道秩条件的 UMa 数据集上，我们把评估聚焦于最具挑战性的弥散区——信道能量散布在众多角度–时延系数上。大量仿真表明，PM-VQ 在该区间内于各 SNR 水平与反馈维度 $\beta_{\rm fb}$ 下取得最佳 NMSE，且相对基线的优势尤为明显；结果还表明，即使角度–时延功率图本身含噪，先验仍带来可观增益。

本文余下部分安排如下：第 II 节介绍 FDD 大规模 MIMO-OFDM 系统模型、CSI 表示与先验信息；第 III 节给出所提 PM-VQ 反馈方案；第 IV 节详述数据集生成流程；第 V 节描述基线方法；第 VI 节给出仿真结果；第 VII 节总结全文。

## II. 系统模型

我们考虑 FDD 大规模 MIMO-OFDM 系统：配备 $N_{\rm BS}$ 元均匀线阵（ULA）的 BS 服务多个 UE，每个 UE 也配备 $N_{\rm UE}$ 元 ULA。由于各 UE 独立估计并反馈其信道，我们聚焦单个一般 UE 并在全文省略用户索引。设 $\mathcal F$ 表示所选 OFDM 子载波集合，$N_{\rm sc}=|\mathcal F|$。对子载波 $f\in\mathcal F$，设 $\mathbf H_f\in\mathbb C^{N_{\rm UE}\times N_{\rm BS}}$ 表示 DL 信道。为把反馈问题与导频设计和信道估计隔离，我们假定 UE 在反馈之前已**完全**获得其 DL 信道 $\{\mathbf H_f\}_f$。在此假设下，第 I 节的远程信源编码表述退化为对已知信道的直接压缩。我们的目标是单次（one-shot）反馈方案：在有限 UL 反馈预算下于 UE 侧压缩 CSI、在 BS 侧重建。

### A. 角度–时延 CSI 表示

我们不在天线–频域而改在角度–时延对偶域表示 CSI：由于传播路径的时延扩展与角度扩展有限，信道稀疏性在该域中显现，可用于信道压缩。对 UE 天线 $r$，设 $\mathbf H^{(r)}\in\mathbb C^{N_{\rm sc}\times N_{\rm BS}}$ 汇集其在所选子载波与 BS 天线上的天线–频率信道，其角度–时延表示为双侧酉 DFT：

$$
\mathbf H^{(r)}_{\rm ad}=\mathbf F^H_{N_{\rm sc}}\mathbf H^{(r)}\mathbf F_{N_{\rm BS}},\qquad
r=1,\dots,N_{\rm UE}, \tag{4}
$$

其中 $\mathbf F_N$ 为 $N$ 点酉 DFT 矩阵。左乘 $\mathbf F^H_{N_{\rm sc}}$ 把频率映射为时延，右乘 $\mathbf F_{N_{\rm BS}}$ 把 BS 天线映射为角度。把 $\{\mathbf H^{(r)}_{\rm ad}\}_{r=1}^{N_{\rm UE}}$ 堆叠得到角度–时延 CSI 张量 $\mathcal H_{\rm ad}\in\mathbb C^{N_{\rm sc}\times N_{\rm BS}\times N_{\rm UE}}$。由于酉性，该变换在保持信道能量的同时暴露出信道的稀疏时延–角度结构。

### B. 先验信息：平均角度–时延功率图

为更有效地压缩与重建信道，我们利用信道二阶统计量作为先验信息。由于在大规模 MIMO 系统中估计并存储完整协方差代价高昂，我们改以角度–时延域的平均功率近似它。在稀疏多径信道中，DFT 基近似去相关角度–时延系数，因此逐系数功率捕获了主导的二阶结构。

所得平均功率图具有自然的功率谱密度（PSD）解释。对广义平稳随机过程，PSD 是自相关函数的 Fourier 变换，描述平均信号功率在频率上的分布。类似地，沿空间与频率维施加 DFT 把信道变换为离散角度–时延表示，因此 $\mathbb E[|\mathcal H_{\rm ad}|^2]$ 描述平均信道功率在角度–时延 bin 上的分布，可视为有限网格上的角度–时延功率谱。对单次实现，$|\mathcal H_{\rm ad}(s)|^2$ 给出瞬时功率分布；而对多次实现取平均则估计出潜在的慢变功率谱。

具体地，我们由 $S$ 个共享相同大尺度统计量（例如同一 UE 位置）的独立小尺度实现估计**平均角度–时延功率图**：

$$
\mathbf P^{(S)}=\frac{1}{S}\sum_{s=1}^{S}\left|\mathcal H_{\rm ad}(s)\right|^2
\in\mathbb R^{N_{\rm sc}\times N_{\rm BS}\times N_{\rm UE}}. \tag{5}
$$

因此 $\mathbf P^{(S)}$ 是潜在角度–时延功率谱 $\mathbb E[|\mathcal H_{\rm ad}|^2]$ 的样本平均估计。这种平均可行，是因为小尺度衰落通常比几何诱导的二阶统计量变化更快，所以多次信道实现可呈现不同瞬时衰落而共享近似相同的角度–时延功率分布。

原文脚注：$|\cdot|^2$ 按元素（elementwise）作用于张量。

我们假定 UE 与 BS 都维护历史角度–时延 CSI 缓冲区：UE 累积自身的信道估计，BS 累积此前反馈轮次已重建的 CSI。双方再由本地缓冲区按 (5) 直接计算功率图，故先验在两端均可用而无需任何额外反馈载荷。由于两个缓冲区由同一慢变大尺度统计量的相关实现构成，所得估计彼此一致，其间残余失配由第 VI 节所示 PM-VQ 对先验估计误差的鲁棒性所容忍。

## III. 所提先验辅助掩码矢量量化 CSI 反馈方案

本节给出所提 CSI 反馈方案——一种以先验边信息为条件的可学习 SSCC 设计。如图 1 所示，该方案建立在带矢量量化（VQ）的编解码器框架之上：UE 侧编码器把 DL CSI 压缩为潜在表示，潜在矢量量化为已学码本的索引并反馈，BS 侧解码器由接收索引重建 DL CSI。该框架在基于学习的 CSI 反馈中很标准 [15]，但存在三方面局限：

- 潜在维数由架构固定，网络须为每个目标压缩比重训练；
- 压缩映射纯由数据驱动：它利用高维 CSI 的冗余，却不提供任何度量来说明哪些潜在维更具信息量、应在有限反馈预算下优先；
- 没有把边信息融入压缩与重建设计的原则性机制。

所提先验辅助掩码矢量量化（PM-VQ）反馈方案逐一解决这些局限：它以单个训练模型通过改变发送的潜在 token 数支持一系列反馈维度；它对潜在 token 打分，使只有最具信息量者被反馈；它在编码器、SAMM 与解码器的多个位置融入先验边信息，即第 II-B 节引入的平均角度–时延功率图（假定 UE 与 BS 均可获得）。该方案由以下部分组成：

- **先验辅助编码器：** 以先验为条件把 DL CSI 压缩为潜在 token；
- **空间自适应掩码模块（SAMM）：** 基于 token 与先验功率图为每个潜在 token 分配重要性分数；
- **Top-$k$ 选择与缩放：** 保留分数最高的 $k$ 个 token，并按各自分数缩放每个保留 token；
- **矢量量化：** 量化被选中、缩放后的 token；码字索引与被选 token 位置经 UL 反馈信道送往 BS；
- **自适应去掩码模块（ADM）：** 在 BS 侧由接收码字与位置补全潜在表示；
- **先验辅助解码器：** 再次以先验为条件，由补全后的潜在表示重建 DL CSI。

PM-VQ 的进一步设计原则是：先验**不是**简单地与 CSI 在输入端拼接或相加，而是在多个语义层级注入：

(i) 多个编码器分辨率上的门控加性融合；
(ii) 用于 token 打分与解码的 SPADE 式调制 [22]；
(iii) BS 侧先验编码器，在不违反“BS 无法获得 UE 侧特征”这一 CSI 反馈约束的前提下合成 U-Net 跳跃连接。

这些注入点对应图 1 中从功率图指向编码器、SAMM 与解码器的虚线箭头。

**图 1：** 所提 PM-VQ 框架的系统框图。

### A. 非对称先验辅助 U-Net 骨干

编解码器骨干的动机来自大规模 MIMO-OFDM 角度–时延域 CSI 的两个性质。第一，角度–时延信道表现得像一幅结构化图像，其能量集中于少数局部簇；因此准确重建既需要定位主导簇的全局上下文，也需要描述各簇内系数的局部细节。第二，平均角度–时延功率图 $\mathbf P$ 已指示主导路径可能出现的位置，且 UE 与 BS 双方均可获得。

第一个性质促使采用类 U-Net 的多尺度架构 [23]：编码器逐步降低空间分辨率，使瓶颈潜在表示捕获全局信道结构；解码器逐步恢复分辨率以还原精细角度–时延细节。第二个性质决定该架构相对标准对称 U-Net 的改动方式。在传统 U-Net 中，编码器中间特征经跳跃连接直接送入解码器；但在 CSI 反馈中这些特征在 UE 侧计算，把它们传给 BS 会消耗额外反馈资源。因此我们采用**非对称** U-Net：UE 不发送任何中间特征，BS 解码器用从先验功率图提取的多尺度特征替代缺失的编码器跳跃特征，以零反馈代价传递相似的结构信息。

### B. 输入表示

我们把复角度–时延信道 $\mathcal H_{\rm ad}$ 视为双通道实值图像 $\mathbf X\in\mathbb R^{2\times H\times W}$，把其实部与虚部堆叠，其中高度 $H$ 索引时延、宽度 $W=N_{\rm BS}N_{\rm UE}$ 索引展平的角度对。先验功率图 $\mathbf P^{(S)}$ 被重塑并归一化到相同布局，得到 $\mathbf P\in\mathbb R^{1\times H\times W}$。两个输入互补：$\mathbf X$ 是待压缩的瞬时实现，而 $\mathbf P$ 概括了信道慢变的二阶几何。

### C. 带门控融合的先验辅助编码器

编码器把 CSI 图像与先验映射为紧凑的潜在特征图：

$$
\mathbf z_e=\mathcal E_\theta(\mathbf X,\mathbf P)\in\mathbb R^{C\times h\times w},\qquad K=hw, \tag{6}
$$

其中 $C$ 为潜在通道维数，$K=hw$ 为空间潜在 token 数；对位置 $i$ 记 $\mathbf z_{e,i}\in\mathbb R^{C}$。在架构上，$\mathcal E_\theta$ 是非对称 U-Net 的收缩路径：一个 $3\times3$ 卷积、$n_{\rm down}$ 个残差下采样阶段，以及一个把通道投影到 $C$ 的 $1\times1$ 卷积，使逐级下采样聚合日益全局的角度–时延上下文。

我们不止在输入处条件化，而是在每个编码器分辨率注入先验。在第 $\ell$ 阶段，给定 CSI 特征图 $\mathbf f_\ell$，把先验调整到相同分辨率、经小网络 $\rho_\ell(\cdot)$ 投影并融合为

$$
{\rm Fuse}_\ell\left(\mathbf f_\ell,\mathbf P\right)
=\mathbf f_\ell+\tanh(\alpha_\ell)\,\rho_\ell(\mathbf P)
+{\rm GN}\left(\mathbf f_\ell\right), \tag{7}
$$

其中 $\alpha_\ell$ 为可训练标量，${\rm GN}(\cdot)$ 为 GroupNorm。三项各有其用途：恒等项 $\mathbf f_\ell$ 原样传递 CSI 特征，保留其幅度信息；归一化项 ${\rm GN}(\mathbf f_\ell)$ 加入同一特征的尺度归一化版本，使激活在不同信道实现与网络层间保持一致的量级，从而让训练更稳定；先验项 $\rho_\ell(\mathbf P)$ 加入长期角度–时延功率结构（已调整为当前分辨率）。有界门控 $\tanh(\alpha_\ell)$ 让每个阶段学习应多强烈地依赖先验，在加入统计指导的同时不淹没瞬时 CSI。

### D. 空间自适应掩码模块

潜在表示形成后，UE 须在预算下决定发送哪些 token。空间自适应掩码模块（SAMM）是一个轻量网络，为每个潜在 token 打分：

$$
\mathbf s={\rm SAMM}\left(\mathbf z_e,\tilde{\mathbf P}\right)\in(0,1)^{K}, \tag{8}
$$

其中 $\tilde{\mathbf P}$ 是先验下采样到潜在分辨率并经小 CNN 精炼的结果；分数越高表示该 token 对重建越有用。SAMM 通过空间自适应归一化（SPADE）[22] 条件化先验。对特征图 $\mathbf h$，

$$
{\rm SPADE}\left(\mathbf h,\tilde{\mathbf P}\right)
=\left(1+\gamma(\tilde{\mathbf P})\right)\odot{\rm GN}(\mathbf h)
+\beta(\tilde{\mathbf P}), \tag{9}
$$

其中调制图 $\gamma(\cdot)$、$\beta(\cdot)$ 由先验经小卷积网络产生。与拼接不同，SPADE 在归一化之后重新注入先验，因而依据主导角度–时延簇直接调制特征统计量。给定分数后，UE 保留分数最高的 $k$ 个 token：

$$
\mathcal I={\rm top}\text{-}k(\mathbf s),\qquad m_i=\mathbf 1\{i\in\mathcal I\}, \tag{10}
$$

并丢弃其余 $K-k$ 个潜在 token。因此 SAMM 执行内容自适应选择：对每个实现，它把反馈预算花在预测最具信息量的潜在位置上。

### E. 分数缩放矢量量化

被选中的 token 经矢量量化映射为反馈比特。量化之前，先用逐 token 的 LayerNorm 归一化每个 token，再按其 SAMM 分数缩放：

$$
\tilde{\mathbf z}_{e,i}={\rm LN}\left(\mathbf z_{e,i}\right)s_i,\qquad i\in\mathcal I. \tag{11}
$$

LayerNorm 稳定了量化器所见的分布。分数缩放另有用途：由于挑选 token 的 top-$k$ 选择不可微，乘以 $s_i$ 正是把分数放到前向计算路径上的方式，使重建损失能够反向传播到 SAMM 分数、从而训练该选择网络。实际上，该缩放是把原本离散的 token 选择变得可端到端训练的桥梁。量化使用已学码本 $\mathcal C=\{\mathbf c_j\}_{j=1}^{J}$（$\mathbf c_j\in\mathbb R^C$），把每个 token 指派给最近码字：

$$
q_i=\arg\min_{j}\left\|\tilde{\mathbf z}_{e,i}-\mathbf c_j\right\|_2^2,\qquad
\mathbf z_{q,i}=\mathbf c_{q_i}. \tag{12}
$$

梯度经直通估计器穿过不可微的指派：

$$
\hat{\mathbf z}_{q,i}
=\tilde{\mathbf z}_{e,i}+{\rm sg}\left(\mathbf z_{q,i}-\tilde{\mathbf z}_{e,i}\right), \tag{13}
$$

其中 ${\rm sg}(\cdot)$ 为停止梯度算子，因此前向使用码字，反向更新分数缩放后的编码器 token。

### F. 反馈预算与保留 token 数

保留的 token 数直接由反馈预算决定。UE 应发送码字索引 $\{q_i\}_{i\in\mathcal I}$ 与所选位置 $\mathcal I$。位置无法由 BS 仅凭先验推断，因为掩码由 UE 侧潜在表示计算得到。设码本大小为 $J$，索引需 $k\log_2J$ 比特，而描述 $K$ 个位置中 $k$ 个 token 的支撑集需 $\log_2\binom{K}{k}\le Kh_2(k/K)$ 比特，其中 $h_2(\cdot)$ 为二元熵。因此我们把信源编码代价建模为

$$
B(K,k,J)=Kh_2\!\left(\frac{k}{K}\right)+k\log_2J, \tag{14}
$$

它上界了精确位置代价，故预算约束总被满足。给定第 I 节的可靠预算 $\beta_{\rm fb}C_{\rm ul}$，我们保留最大可允许 token 数

$$
k^{\star}=\max\left\{k:\,B(K,k,J)\le\beta_{\rm fb}C_{\rm ul}\right\}. \tag{15}
$$

由于 $\beta_{\rm fb}$、$C_{\rm ul}$、$K$ 与 $J$ 在 UE 与 BS 均已知，$k^{\star}$ 在两侧被相同地确定，无需信令通知。反馈资源因此直接决定 $k^{\star}$，而单个训练模型通过改变 $k^{\star}$ 服务任意预算，无需改动架构或重训练。

### G. 自适应去掩码模块

当 BS 收到 $k^{\star}$ 个被选中并量化的 token $\mathbf z_q=\{\mathbf z_{q,i}\}_{i\in\mathcal I}$ 及其网格位置 $\mathcal I$ 后，自适应去掩码模块（ADM）的目标是重建解码器所需的完整潜在 token 集合 $\hat{\mathbf z}\in\mathbb R^{C\times h\times w}$。为此，ADM 先恢复完整的 $K$-token 网格：把每个接收码字放在其自身位置，并用单个共享的可学习掩码 token 标记每个缺失位置：

$$
\tilde{\mathbf z}_{0,i}=
\begin{cases}
\mathbf z_{q,i}, & i\in\mathcal I,\\
\mathbf z_{\rm mask}, & i\notin\mathcal I,
\end{cases} \tag{16}
$$

从而把问题转化为由已接收位置补全缺失位置。设 $\mathbf m\in\{0,1\}^K$ 为被选位置的二值指示，$i\in\mathcal I$ 时 $m_i=1$，否则 $m_i=0$；于是 $\mathbf m$ 标记网格中已接收与缺失的条目。补全写作

$$
\hat{\mathbf z}={\rm ADM}\left(\tilde{\mathbf z}_0,\mathbf m\right). \tag{17}
$$

借鉴掩码生成模型 [24]，ADM 把补全拆成两部分：固定基线与学习修正。基线是重组网格的保维投影：

$$
\mathbf b=P_0\left(\tilde{\mathbf z}_0\right), \tag{18}
$$

它使接收码字有一条直达输出的通路，从而其信息被保留而非从头重建。在此基线上，一个 transformer 分支预测填补缺失位置所需的修正：

$$
\Delta\mathbf z=\mathcal R_\psi\left(\mathcal T_\psi\left(\mathbf b,\{\mathbf{p}_\ell\}_{\ell=0}^{L-1}\right)\right), \tag{19}
$$

其中 $\mathcal T_\psi$ 堆叠 $L$ 个掩码自注意力块，$\mathcal R_\psi$ 为卷积头。

> **原文疑点：** 式 (19) 中出现 $\{\mathbf{p}_\ell\}_{\ell=0}^{L-1}$，但正文未给出其定义；按上下文（堆叠的掩码自注意力块输入）应指位置嵌入或可学习提示向量。本译按原文照录并加注，未擅自补定义。

ADM 完全由接收 token 补全潜在表示，不使用先验；缺失位置经下述补全机制由可靠接收 token 推断。一个关键困难是：掩码 token 只是占位符，不携带信道信息，却与接收 token 位于同一网格。当网络重建某位置时，它通过组合网格上所有位置的信息来完成；若占位符在此组合中被赋予与接收 token 相同的权重，其空内容会泄漏进结果并破坏重建。因此网络必须把接收 token 的权重设得远高于占位符。我们用**渐进可靠性掩码**处理这一点：对每层 $\ell$ 构造软可靠性权重 $a^{(\ell)}$，设定第 $\ell$ 层应多大程度信任各位置。初始权重强烈偏向接收 token：

$$
a^{(0)}=\mathbf m+\epsilon\left(1-\mathbf m\right),\qquad 0<\epsilon\ll1, \tag{20}
$$

即接收位置权重为 1、缺失位置为近零权重 $\epsilon$。每层之后通过开平方把权重推向 1：

$$
a^{(\ell+1)}=\sqrt{a^{(\ell)}}. \tag{21}
$$

由于对 $(0,1)$ 中任何值反复开方都会把它推向 1，缺失位置随深度增加被逐渐更多地信任。在第 $\ell$ 层内，$a^{(\ell)}$ 控制上述组合：每个位置按当前可靠性正比地对结果贡献，故早先接收位置占主导，缺失位置只被逐步纳入。该调度产生由粗到细的补全：早期层几乎完全依赖可靠接收 token，用它们形成缺失位置的初步估计；后期层在这些位置已获得合理数值后，也逐步把它们纳入重建。如此，缺失位置先由可信信息而非空占位符恢复，再在整个网格上精炼。最后，ADM 把修正加回基线 $\mathbf b$，对接收位置与缺失位置使用由掩码 $\mathbf m$ 选择的分别强度：

$$
\hat{\mathbf z}=\mathbf b+\alpha_k\,\mathbf m\odot\Delta\mathbf z
+\alpha_u\left(1-\mathbf m\right)\odot\Delta\mathbf z, \tag{22}
$$

其中 $\alpha_k,\alpha_u$ 为可学习正标量。这使接收码字几乎原样通过，而须被推断的缺失位置获得更强修正。

### H. 先验条件解码器

ADM 补全潜在表示后，解码器把它映射回角度–时延图像：

$$
\hat{\mathbf X}=\mathcal D_\phi\left(\hat{\mathbf z},\mathbf P\right), \tag{23}
$$

遵循 U-Net 扩张路径：$1\times1$ 卷积先把 $\hat{\mathbf z}$ 映射进解码器特征空间，随后一个瓶颈多头自注意力块 [25] 在最粗尺度混合全局上下文，最后 $n_{\rm down}$ 个先验条件上采样块恢复原始分辨率。与标准 U-Net 的唯一偏离在于跳跃连接。U-Net 通常经跳跃连接把编码器中间特征送入解码器，但此处这些特征位于 UE 侧，若无额外反馈开销无法到达 BS。因此我们用由共享先验导出的多尺度特征替代 UE 侧跳跃特征：BS 侧先验编码器产生跳跃特征

$$
\left\{\mathbf p^{(\rm skip)}_\ell\right\}_{\ell=1}^{n_{\rm down}}=\mathcal E_P\left(\mathbf P\right), \tag{24}
$$

它携带关于可能角度–时延支撑的高分辨率结构；同时先验金字塔产生尺度匹配的 SPADE 图

$$
\left\{\mathbf p^{(\rm mod)}_\ell\right\}_{\ell=1}^{n_{\rm down}}=\Pi_P\left(\mathbf P\right). \tag{25}
$$

每个上采样块随后把这些先验特征与当前解码器状态结合：

$$
\mathbf h_{\ell+1}=\mathcal U_\ell\left(\mathbf h_\ell,\mathbf p^{(\rm skip)}_\ell,\mathbf p^{(\rm mod)}_\ell\right), \tag{26}
$$

其中 $\mathcal U_\ell$ 上采样 $\mathbf h_\ell$、并入先验跳跃特征、施加如 (9) 的 SPADE 调制卷积并加入残差捷径。如此，解码器与编码器、SAMM 以同一先验为条件，却仅用 BS 已可获得的信息重建图像。

**算法 1　所提 PM-VQ CSI 反馈方案**

输入：CSI 图像 $\mathbf X$、先验图 $\mathbf P$、反馈维度 $\beta_{\rm fb}$

1. 由 (15) 的预算约束计算 $k^{\star}$
2. 编码 CSI 与先验：$\mathbf z\leftarrow\mathcal E_\theta(\mathbf X,\mathbf P)$
3. 生成潜在分辨率先验 $\tilde{\mathbf P}$
4. 为潜在 token 打分：$\mathbf s\leftarrow{\rm SAMM}(\mathbf z,\tilde{\mathbf P})$
5. 选择 token 位置：$\mathcal I\leftarrow{\rm top}\text{-}k^{\star}(\mathbf s)$
6. **for** $i\in\mathcal I$ **do**
7. 　归一化并分数缩放：$\tilde{\mathbf z}_i\leftarrow{\rm LN}(\mathbf z_i)s_i$
8. 　量化：$q_i\leftarrow\arg\min_j\|\tilde{\mathbf z}_i-\mathbf c_j\|_2^2$
9. **end for**
10. UE 反馈 $\{q_i\}_{i\in\mathcal I}$ 与 $\mathcal I$
11. BS 重建被选码字：$\mathbf z_{q,i}\leftarrow\mathbf c_{q_i}$
12. 由 (16) 组装稀疏网格 $\tilde{\mathbf z}_0$
13. 恢复完整潜在表示：$\hat{\mathbf z}\leftarrow{\rm ADM}(\tilde{\mathbf z}_0,\mathbf m)$
14. 解码 CSI：$\hat{\mathbf X}\leftarrow\mathcal D_\phi(\hat{\mathbf z},\mathbf P)$
15. 训练时计算 (27) 中的 $L$ 并更新全部可训练模块

### I. 训练目标

所有模块在单一目标下联合端到端训练，目标含四项：重建损失、VQ 承诺损失、ADM 潜在补全损失与码使用正则项：

$$
L=\lambda_{\rm rec}L_{\rm rec}+\lambda_{\rm cm}L_{\rm cm}
+\lambda_{\rm lat}L_{\rm lat}+\lambda_{\rm cu}L_{\rm cu}. \tag{27}
$$

重建损失 $L_{\rm rec}$ 是重建与真实角度–时延图像之间的归一化 MSE。承诺损失

$$
L_{\rm cm}=\frac{1}{|\mathcal I|}\sum_{i\in\mathcal I}
\left\|{\rm sg}\left(\mathbf z_{q,i}\right)-\tilde{\mathbf z}_{e,i}\right\|_2^2 \tag{28}
$$

把每个被选 token 拉向其码字。码字本身不用通常的码本损失更新，而由被指派编码器输出的指数滑动平均更新 [26]，从而在训练中稳定码本。潜在损失通过比较恢复的潜在表示 $\hat{\mathbf z}$ 与编码器潜在表示 $\mathbf z_e$ 来监督 ADM，并对接收位置与掩码位置分别加权：

$$
L_{\rm lat}=\omega_r\frac{\left\|\mathbf m\odot\left(\hat{\mathbf z}-{\rm sg}(\mathbf z_e)\right)\right\|_2^2}{\|\mathbf m\|_0}
+\omega_m\frac{\left\|\left(1-\mathbf m\right)\odot\left(\hat{\mathbf z}-{\rm sg}(\mathbf z_e)\right)\right\|_2^2}{\|1-\mathbf m\|_0}. \tag{29}
$$

我们令 $\omega_m>\omega_r$，使该损失让 ADM 保持接收 token 不变，而把精力集中于更难的缺失位置。最后一项码使用正则项通过让经验码字使用接近均匀来防止码本坍缩 [27–29]。设 $\mathcal B$ 为一批中被选 token 的集合。(12) 中的硬量化把每个 token 指派给单个最近码字，不可微且不提供关于其他码字的信号，因此我们改用软指派

$$
\pi_{i,j}=\frac{\exp\left(-\left\|\tilde{\mathbf z}_{e,i}-\mathbf c_j\right\|_2^2/\tau\right)}
{\sum_{j'=1}^{J}\exp\left(-\left\|\tilde{\mathbf z}_{e,i}-\mathbf c_{j'}\right\|_2^2/\tau\right)},\qquad
\bar p_j=\frac{1}{|\mathcal B|}\sum_{i\in\mathcal B}\pi_{i,j}, \tag{30}
$$

其中 $\pi_{i,j}$ 是 token $i$ 被量化为码字 $j$ 的（近似）概率：它在最近码字处最大并随距离衰减，由温度 $\tau=1$ 控制。对一批数据平均 $\pi_{i,j}$ 得 $\bar p_j$，即码字 $j$ 的平均使用率。把它们堆成 $\bar{\mathbf p}=(\bar p_1,\dots,\bar p_J)$ 得到码本上的经验使用分布，惩罚项即其与均匀分布的 KL 散度：

$$
L_{\rm cu}=\sum_{j=1}^{J}\bar p_j\log\frac{\bar p_j}{1/J}
=\log J-H\left(\bar{\mathbf p}\right), \tag{31}
$$

因此最小化 $L_{\rm cu}$ 最大化使用熵，使所有码字保持活跃。

## IV. 数据集生成

DL CSI 数据集由 Sionna 链路级仿真器 [30] 在 3GPP TR 38.901 城市宏小区（UMa）非视距（NLoS）信道模型 [21] 下生成。单个 BS 位于小区中心，$\mathbf d_{\rm BS}=[0,0,25]$ m；每个 UE 置于

$$
\mathbf d_{\rm UE}=\left[r\cos\theta,\ r\sin\theta,\ h_{\rm UE}\right]\,\text{m}, \tag{32}
$$

其中 $r$ 为水平 BS–UE 距离，$\theta$ 为方位角，$h_{\rm UE}$ 为 UE 高度。这些参数对每个 UE 独立抽取：

$$
\theta\sim\mathcal U[0,2\pi),\qquad
r\sim\mathcal U[35,250]\,\text{m},\qquad
h_{\rm UE}\sim\mathcal U[1.5,22.5]\,\text{m}. \tag{33}
$$

DL 载频为 $f_{\rm DL}=2.14$ GHz。BS 采用 $N_{\rm BS}=32$ 元单极化均匀线阵（ULA）与 TR 38.901 天线元方向图，每个 UE 配备 $N_{\rm UE}=4$ 个单极化天线元。正交频分复用（OFDM）网格含 $N_{\rm RB}=50$ 个资源块，每块含 12 个子载波，子载波间隔 $\Delta f=30$ kHz，由此在 18 MHz 带宽上得到 600 个子载波。为模拟基于子带的 CSI 上报，只保留每个资源块的中心子载波，即资源块 $r$（$r=0,\dots,N_{\rm RB}-1$）的子载波 $12r+6$。因此所得 CSI 表示含 $N_{\rm sc}=50$ 个子载波、间隔 360 kHz，直接取自全带信道响应而未经插值。

对给定 UE，模型先由以 BS–UE 拓扑为条件的 UMa 分布抽取大尺度参数（路损、阴影衰落、时延扩展、角度扩展与 Ricean $K$ 因子），再抽取簇时延、簇功率以及逐簇、逐射线的离开/到达角。在每个 UE 位置，我们固定上述全部量——即 BS 与 UE 位置、大尺度参数以及整个簇/射线几何（时延、功率与角度）——只对各实现中射线的随机初相重新采样。因此每次实现都是以固定拓扑与固定簇/射线几何为条件的**独立相位实现**，所得变化即由独立抽取相位的射线叠加形成的相干小尺度衰落。数据集按 UE 位置划分：7,500 个位置用于训练，750 个不相交位置用于测试；每个位置生成 20 次独立相位实现，共得 150,000 个训练样本与 15,000 个测试样本。此外，每个位置还生成一个与训练、测试样本都不相交的额外相位实现池，专供先验估计使用。

## V. 基线方法

我们把所提方案与三种代表性反馈基线对比，全部在同一上行反馈维度 $\beta_{\rm fb}$ 与 UL SNR 下评估：一个 JSCC 方案、一个 SSCC 方案，以及一个免训练的压缩感知方案。两个学习基线均采用基于 transformer 的 TransNet 架构 [16]——它是基于学习 CSI 反馈中广泛使用且有竞争力的骨干，通过自注意力捕获长程角度–时延依赖。

### A. 基于 Transformer 的 JSCC 基线

JSCC 基线采用基于 TransNet 的反馈方案 [16]。transformer 编码器把角度–时延信道 $\mathcal H_{\rm ad}$ 直接映射为 $\beta_{\rm fb}$ 个复符号，并按每信道使用平均功率归一化为 1，经 AWGN 上行发送：

$$
\mathbf y_{\rm fb}=\mathbf x_{\rm fb}+\mathbf n_{\rm fb}, \tag{34}
$$

其中 $\mathbf x_{\rm fb}\in\mathbb C^{\beta_{\rm fb}}$ 为发送符号，$\mathbf n_{\rm fb}$ 为复 AWGN，其方差由 UL SNR 设定。随后对称的 transformer 解码器由 $\mathbf y_{\rm fb}$ 重建信道，编解码器联合训练以最小化信道 NMSE。由于编码器把模拟符号直接送过信道，每个 $\beta_{\rm fb}$ 与 UL SNR 组合都须训练单独模型。

### B. 基于 Transformer 的 SSCC 基线

SSCC 基线使用相同的 transformer 编解码器，但与所提方法一样反馈比特流而非模拟符号。编码器产生长度为 $\beta_{\rm out}$ 的潜在表示，每个条目经 sigmoid 与均匀 $Q$ 比特标量量化器，共得 $\beta_{\rm out}Q$ 比特。为在容量 $C_{\rm ul}$ 下匹配 (3) 中 $\beta_{\rm fb}$ 个信道使用的可靠预算，潜在长度取为

$$
\beta_{\rm out}=\left\lfloor\frac{\beta_{\rm fb}C_{\rm ul}}{Q}\right\rfloor. \tag{35}
$$

该模型端到端训练以最小化信道 NMSE。在固定预算 $\beta_{\rm fb}C_{\rm ul}$ 下，量化比特数 $Q$ 在分辨率与维数之间折中：较大 $Q$ 对每个系数量化更精细但可容纳的系数更少，较小 $Q$ 则以更粗分辨率保留更多系数。我们取 $Q=2$。

### C. 随机投影下的正交匹配追踪（OMP）

最后一个基线免训练，直接利用 $\mathcal H_{\rm ad}$ 的角度–时延稀疏性。信道被向量化并拆分为实部与虚部，形成 $\mathbf x\in\mathbb R^{n}$，$n=2N_{\rm sc}N_{\rm BS}N_{\rm UE}$；随后由随机感知矩阵 $\mathbf A\in\mathbb R^{M\times n}$ 压缩，其元素为 i.i.d. $\mathcal N(0,1/M)$，实测量数 $M=2\beta_{\rm fb}$ 与反馈维度相匹配。测量经 UL AWGN 信道接收为

$$
\mathbf y=\mathbf A\mathbf x+\mathbf n, \tag{36}
$$

噪声方差由 UL SNR 设定。由 $\mathbf y$，OMP 在稀疏约束 $\|\mathbf x\|_0\le k_{\rm sp}$ 下求解 $\min_{\mathbf x}\|\mathbf y-\mathbf A\mathbf x\|^2$ 以贪心恢复 $\mathbf x$，其中稀疏度 $k_{\rm sp}$ 由信道的经验能量集中度设定。因此 OMP 充当基于稀疏性的参照，既不需训练也不需信道统计量。

**表 I：** PM-VQ 架构与训练超参数。

| 超参数 | 取值 |
|---|---|
| **架构** | |
| 潜在 token 数 $K=hw$ | 208 |
| 潜在通道维数 $C$ | 16 |
| 下采样阶段数 $n_{\rm down}$ | 3 |
| ADM 自注意力块数 $L$ | 8 |
| 码本大小 $J$ | 512 |
| **训练** | |
| 优化器 | AdamW |
| 学习率调度 | cosine（$\eta_{\min}=10^{-5}$） |
| 峰值学习率（编码器 / VQ） | $1\times10^{-4}$ |
| 峰值学习率（解码器 / 先验） | $5\times10^{-5}$ |
| 峰值学习率（ADM） | $5\times10^{-4}$ |
| 峰值学习率（SAMM） | $2\times10^{-3}$ |
| 权重衰减 | $1\times10^{-4}$ |
| 梯度裁剪 | 5.0 |
| 轮数 | 500 |
| 批大小 | 125 |
| 保留 token 数范围 $k$ | $[3,200]$ |
| 码本 EMA 衰减 | 0.95 |
| 先验快照数 $S_{\rm tr}$（训练） | 20 |
| **损失权重 (27)、(29)** | |
| $\lambda_{\rm rec}$ | 1.0 |
| $\lambda_{\rm cm}$ | 0.05 |
| $\lambda_{\rm lat}$ | 0.05 |
| $\lambda_{\rm cu}$ | $10^{-3}$ |
| $\omega_r/\omega_m$ | 0.1 / 1.0 |

## VI. 仿真结果

我们在第 IV 节引入的 UMa 测试数据集上，把所提 PM-VQ 方案与第 V 节描述的三个基线对比。除非另有说明，PM-VQ 使用由 $S=20$ 次独立信道实现估计的测试时先验功率图。先验辅助编码器把每次信道实现映射为 $K=208$ 个潜在 token，每个维数 $C=16$；这些 token 用含 $J=512$ 条目的已学码本量化，故每个发送码字索引需 $\log_2J=9$ 比特。码本由指数滑动平均（EMA）更新，衰减因子 0.95。PM-VQ 全部组件以批大小 125、AdamW 优化器 [31] 与余弦学习率调度联合端到端训练 500 轮。训练期间，每批的选中 token 数 $k$ 在 3 到 200 之间采样；这种预算随机化使单个训练模型可在推理时通过改变 $k$ 支持多个反馈预算。相反，JSCC 与 SSCC 神经基线针对每个反馈维度与 UL SNR 的目标组合、用同一训练数据集分别训练。为公平比较，所有方案在相同 UL SNR 与相同反馈维度（$\beta_{\rm fb}$ 个复 UL 信道使用）下评估，重建精度以 NMSE 衡量。PM-VQ 的主要架构与训练超参数汇总于表 I。

为刻画不同散射环境下的性能，我们进一步按**信道秩**划分测试数据集。高信道秩对应能量散布在众多角度–时延簇上的、丰富的**弥散**信道；低秩对应由一两条强路径主导的**稀疏**信道。我们按信道秩对测试位置排序，并划分为四个等大小四分位 $Q_1$–$Q_4$，从最弥散（$Q_1$）到最稀疏（$Q_4$）。弥散信道对 CSI 反馈最具挑战性，因为其能量散布在众多不可忽略的系数上，而这恰是 PM-VQ 的先验引导 token 选择与先验条件重建所要利用的区间。因此我们把仿真研究聚焦于 $Q_1$ 弥散信道数据集。

### A. 固定反馈维度下 NMSE 随 UL SNR 的变化

我们首先在固定反馈维度 $\beta_{\rm fb}=128$ 下，把 UL SNR 从 $-5$ dB 扫到 20 dB，比较 PM-VQ 与三个基线。为隔离先验条件化的作用，我们还评估 **PM-VQ（无先验）**：它使用相同架构与选择性传输机制，但训练与评估均无先验信息。如图 2a 所示，PM-VQ 在每个测试 SNR 下都取得最低 NMSE，且其相对基线的优势随 UL 信道改善而扩大。无先验变体在低 SNR 区间效果较差，但随着 SNR 升高逐步超过各学习基线。在基线中，JSCC 在中低 SNR 范围表现更好，而 SSCC 在高 SNR 处更具竞争力。OMP 全程 NMSE 最高。

这些趋势反映了各方案如何利用 UL SNR 的提升。在固定 $\beta_{\rm fb}$ 下，JSCC 始终发送相同数量的模拟符号：更高 SNR 降低反馈噪声，却不扩大所发送的表示，因此一旦固定维数表示（而非信道噪声）成为主要瓶颈，其曲线便趋于平坦。SSCC 则把更高容量转化为更大的无错比特预算；由于其标量量化分辨率固定，额外预算增加了可发送系数的数量，使 SSCC 在 JSCC 曲线开始饱和后仍能继续改善。这一交叉反映了两种方案利用更好 UL 信道的不同方式，但并不意味着一概的优劣排序，因为 SSCC 假定容量可达信道编码，而两个学习基线依赖各自的架构与训练流程。

PM-VQ 共享 SSCC 机制——更高 SNR 换来更大的比特预算——但把它与内容自适应 token 选择、潜在补全和先验条件化结合。低 SNR 时只能反馈少量潜在 token，ADM 须由有限的接收信息推断大部分潜在表示；在该区间，功率图先验尤其有价值，因为它在不消耗瞬时反馈比特的情况下提供信道结构。随着 SNR 升高，SAMM 可转发更多高分 token，使解码器恢复逐步更精细的信道细节。与 PM-VQ（无先验）的对比进一步区分了两类增益来源：在极其有限的比特预算下，仅靠选择性传输与潜在补全不足以匹敌学习基线，先验是 PM-VQ 明显优势的来源；一旦预算允许更多 token，无先验变体本身即超过基线，表明内容自适应 token 传输与 ADM 的收益。完整 PM-VQ 始终更优，说明即使可获得更多潜在信息，先验条件重建仍持续带来可观改进。

**图 2：** 不同 UL SNR 下的 CSI 重建对比。(a) $\beta_{\rm fb}=128$ 时 NMSE 随 UL SNR 的变化（图例给出不同 $k$ 值、JSCC 基线、SSCC 基线、PM-VQ、PM-VQ（无先验）与 OMP）；(b) UL SNR $\in\{0,10,20\}$ dB、$\beta_{\rm fb}=128$ 时的角度–时延信道功率热图（依次为真实 CSI、JSCC 基线、SSCC 基线、PM-VQ、PM-VQ（无先验），并标注各方法的重建 NMSE）。

为补充平均 NMSE 曲线，图 2b 给出一个代表性 UE 的角度–时延信道功率。真实信道含若干簇，其能量散布到邻近 bin，因为连续的路径角度与时延无需与离散变换网格对齐。低 SNR 时基线主要保留最强分量，而完整 PM-VQ 重建出更多多簇结构；与 PM-VQ（无先验）相比，其簇也与真实角度–时延位置对齐得更准，说明在只能发送少量 token 时先验如何引导重建。随着 SNR 升高，SSCC 与两个 PM-VQ 变体恢复出额外结构，而 JSCC 仍受其固定表示限制。完整 PM-VQ 最忠实地保留弱分量并引入更少伪影，与其领先的 NMSE 曲线一致。

### B. 固定 UL SNR 下 NMSE 随反馈维度的变化

接下来把 UL SNR 固定为 20 dB，改变反馈维度 $\beta_{\rm fb}$（定义为复 UL 信道使用数）。如图 3a 所示，NMSE 总体上随 $\beta_{\rm fb}$ 增大而下降。完整 PM-VQ 在每个反馈维度下都取得最低 NMSE，其次是 PM-VQ（无先验），且它们相对基线的优势随 $\beta_{\rm fb}$ 增大而更明显。在学习基线中，JSCC 与 SSCC 在最小预算下性能相近：JSCC 起初改善更多，而一旦可用反馈变大，SSCC 受益更强。OMP 随 $\beta_{\rm fb}$ 改善但始终是最差方法。

在 20 dB 的高 UL SNR 下，改变 $\beta_{\rm fb}$ 主要改变各方案能传递多少信道信息。对 JSCC，更大反馈维度允许发送更多 UL 调制符号；对 SSCC，可靠比特预算成比例增长，使更多量化系数到达 BS；对 OMP，更大维度提供更多随机测量。虽然弥散信道在角度–时延域仍稀疏，其能量却分布在更多显著系数上，且离格泄漏把每条物理路径散布到邻近 bin；这种更高的有效稀疏性使贪心支撑恢复更难，从而限制了额外测量的收益。在 PM-VQ 中，更大反馈维度使 SAMM 能发送更多被选 token：初期增益可观，但一旦最具信息量的 token 已被传送，增益便递减。

我们接下来比较 PM-VQ 与 PM-VQ（无先验），以区分选择性潜在 token 传输与先验条件化的贡献。在最紧的反馈维度下，无先验变体与学习基线大致相当；随着反馈维度增大其优势增长，表明当可传送更多有信息量 token 时，选择性 token 传输与潜在补全日益有效。完整 PM-VQ 与其无先验变体之间持续存在的差距，揭示了功率图先验在整个反馈范围内的额外收益。因此完整 PM-VQ 在整个扫描中始终是最佳方案。

**图 3：** 不同反馈维度下的 CSI 重建对比。(a) UL SNR $=20$ dB 时 NMSE 随 $\beta_{\rm fb}\in\{38,70,128,170,226\}$ 的变化（图例给出对应 $k$ 值及 JSCC 基线、SSCC 基线、PM-VQ、PM-VQ（无先验）与 OMP）；(b) UL SNR $=20$ dB、$\beta_{\rm fb}\in\{38,128,226\}$ 时的角度–时延信道功率热图（依次为真实 CSI、JSCC 基线、SSCC 基线、PM-VQ、PM-VQ（无先验），并标注各方法的重建 NMSE）。

最后，图 3b 定性地比较了与图 2b 同一代表性信道的重建结果。在最小反馈维度下，JSCC 主要恢复一个主导簇，SSCC 恢复两个主导簇但漏掉较多弱结构，PM-VQ（无先验）也错置或合并了部分分量；完整 PM-VQ 利用先验把主导簇定位到更接近其真实角度–时延位置，并保留更多弱结构。随着反馈维度增大，所有方案都恢复出更多信道细节，但完整 PM-VQ 保持最准确的簇位置与最少杂散能量；在最大维度处其视觉变化相对较小，这与其平均 NMSE 曲线的趋平一致。总体上，定性重建与图 3a 的 NMSE 结果遵循相同的性能排序。

### C. 先验边信息的消融研究

前述 NMSE 研究表明先验边信息与内容自适应 token 选择都改善 CSI 重建。为理解先验增益来自何处，图 4 从三个互补角度考察先验：图 4a 度量单个已训练模型在推理时禁用各先验条件化通路后对其依赖有多强；图 4b 在不同先验配置下从头重训练模型，以确认这些结论不止适用于单个检查点；图 4c 考察推理时先验需被多准确地估计。

在模块级消融中，推理时移除一条通路而保持全部网络权重不变，因此所得性能损失反映已训练模型对该通路的依赖强度。**解码器跳跃通路最重要**：移除它会消除反馈范围内的大部分重建增益；编码器条件化的影响次之，解码器金字塔通路带来较小但一致的改善；相反，从 SAMM 中移除直接先验条件化对性能影响很小。这表明先验辅助编码器已在潜在 token 中嵌入足够统计信息，使 SAMM 能有效排序。ADM 未列入，因为它按设计不含先验，仅由接收 token 及其位置补全潜在表示。

这一排序源于非对称 U-Net 架构。UE 侧编码器特征若无额外反馈无法送往 BS，因此由先验导出的跳跃特征是解码器唯一的高分辨率、多尺度边信息来源；没有它们，解码器只能由低分辨率潜在表示恢复精细信道结构。编码器先验在量化与选择前塑造潜在表示，而解码器金字塔先验在上采样中精炼特征。因此，已训练模型主要把先验用于解码器的重建，尤其是通过由先验导出的跳跃连接。

接下来我们验证这些结论在网络重训练后是否仍成立，因为上述测试只在单个已训练模型中禁用通路。图 4b 比较三个从头训练的模型：完整 PM-VQ、仅使用解码器跳跃先验的模型、以及不使用先验的模型。其次序与推理时结果一致：完整模型在所有 $k$ 下 NMSE 最低，无先验模型最差，而仅解码器跳跃的模型更接近完整模型、而非无先验模型，恢复了大部分完整先验增益。这确认解码器跳跃路径承载了先验的大部分收益，其余路径提供较小但一致的改善。

在确定解码器跳跃通路是主要先验增益来源后，我们进一步追问先验需被多准确地估计。推理时完全不提供先验会使重建崩溃，这与对先验导出的解码器特征的强依赖一致（该测试反映先验训练过的模型对缺失边信息的响应，不等价于训练一个无先验的模型）。即便如此，即使粗略的功率图估计也能恢复大部分损失性能，而适度平均已接近良估计先验的结果。这表明 PM-VQ 主要需要粗略的角度–时延支撑，更准确的平均主要精炼功率数值。因此模型对适度先验估计误差鲁棒，但对先验完全缺失敏感。

**图 4：** PM-VQ 中先验边信息的消融。(a) 推理时移除各先验条件化通路的影响；(b) 不同先验配置下训练模型的比较（完整 PM-VQ、仅解码器跳跃先验、无先验）；(c) 先验估计质量的影响（无先验 $S=0$，$S=1,5,10,20$）。三图横轴均为选中 token 数 $k$（$K=208$）。

### D. Token 选择机制的消融研究

为研究 token 选择机制的作用，图 5 在保持其余 PM-VQ 流水线不变的情况下，把学到的 SAMM 规则与两种替代方案比较：**潜在能量选择**保留幅值最大的 token，**随机掩码**均匀随机地选择发送位置。SAMM 在整个反馈范围内取得最佳性能。潜在能量选择是强启发式：当反馈维度很小或很大时接近 SAMM，但在中等反馈维度下落后最明显。随机掩码全程明显更差，证实所发送 token 的**身份**（而非仅其数量）对重建很重要。

该行为来自各反馈维度下可获得的信息。在极紧约束下，SAMM 与能量规则都倾向于选择少数主导 token；在大的反馈维度下，最具信息量的 token 都得以保留，两种规则又变得相似。然而在中等反馈维度下，选择器必须在 token 强度、空间覆盖与冗余度之间、以及 ADM 能可靠补全的 token 之间做出平衡；仅凭幅值无法捕捉这些相互作用，而 SAMM 是与 ADM、解码器联合训练、按重建价值为 token 打分的。因此，学习到的内容自适应选择恰在该中间区间显示出最清晰的收益。

**图 5：** PM-VQ 中 token 选择规则的影响（PM-VQ（SAMM 选择）、PM-VQ（潜在能量选择）、PM-VQ（随机掩码）；横轴为选中 token 数 $k$，$K=208$）。

## VII. 结论

我们提出了 PM-VQ——一种用于 FDD CSI 反馈的可变速率 SSCC 方案，以平均角度–时延功率图作为边信息。SAMM 选择要经矢量量化并发送的潜在 token，而无先验的 ADM 在 BS 侧补全缺失的潜在位置。预算随机化训练使同一模型无需重训练即可在多种反馈维度上工作。在具有挑战性的弥散区，PM-VQ 在所有测试的 UL SNR 与反馈维度下都优于基线。消融表明先验增益主要来自解码器跳跃通路；编码器与解码器金字塔条件化提供次级增益，而向 SAMM 直接输入先验贡献很小。粗略的功率图估计已足以获得大部分收益，但完全移除先验会造成性能损失。相反，SAMM 的学习选择规则仍然重要，并优于潜在能量选择与随机掩码，尤其在中等反馈维度下。这些发现给出一条清晰的设计原则：把先验主要用于 BS 侧的重建引导，并用学习到的内容自适应选择来分配瞬时反馈预算。

## 参考文献（英文原条目，按原文顺序）

[1] C. E. Shannon, “A mathematical theory of communication,” *Bell Syst. Tech. J.*, vol. 27, no. 3, pp. 379–423, 1948.

[2] M. B. Khalilsarai, Y. Song, T. Yang, and G. Caire, “Channel state acquisition in FDD massive MIMO: Rate–distortion bound and effectiveness of ‘analog’ feedback,” in *Proc. IEEE Int. Symp. Inf. Theory (ISIT)*, 2022, pp. 2505–2510.

[3] ——, “FDD massive MIMO channel training: Optimal rate–distortion bounds and the spectral efficiency of ‘one-shot’ schemes,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 9, pp. 6018–6032, 2023.

[4] Y. Song, T. Yang, M. Barzegar Khalilsarai, and G. Caire, “Downlink CSIT under compressed feedback: Joint versus separate source–channel coding,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 10, pp. 8429–8444, 2025.

[5] ——, “Joint vs. separate source–channel coding in CSI feedback for massive MIMO,” in *Proc. IEEE Int. Conf. Commun. (ICC)*, 2024, pp. 5129–5134.

[6] Z. Jiang, A. F. Molisch, G. Caire, and Z. Niu, “Achievable rates of FDD massive MIMO systems with spatial channel correlation,” *IEEE Trans. Wireless Commun.*, vol. 14, no. 5, pp. 2868–2882, 2015.

[7] M. B. Mashhadi, Q. Yang, and D. Gündüz, “CNN-based analog CSI feedback in FDD MIMO-OFDM systems,” in *Proc. IEEE Int. Conf. Acoust., Speech Signal Process. (ICASSP)*, 2020, pp. 8579–8583.

[8] J. Xu, B. Ai, N. Wang, and W. Chen, “Deep joint source–channel coding for CSI feedback: An end-to-end approach,” *IEEE J. Sel. Areas Commun.*, vol. 41, no. 1, pp. 260–273, 2023.

[9] D. B. Kurka and D. Gündüz, “DeepJSCC-f: Deep joint source–channel coding of images with feedback,” *IEEE J. Sel. Areas Inf. Theory*, vol. 1, no. 1, pp. 178–193, 2020.

[10] D. Gündüz, M. A. Wigger, T.-Y. Tung, P. Zhang, and Y. Xiao, “Joint source–channel coding: Fundamentals and recent progress in practical designs,” *Proc. IEEE*, vol. 113, no. 9, pp. 888–919, 2025.

[11] C.-K. Wen, W.-T. Shih, and S. Jin, “Deep learning for massive MIMO CSI feedback,” *IEEE Wireless Commun. Lett.*, vol. 7, no. 5, pp. 748–751, 2018.

[12] J. Guo, C.-K. Wen, S. Jin, and G. Y. Li, “Convolutional neural network-based multiple-rate compressive sensing for massive MIMO CSI feedback: Design, simulation, and analysis,” *IEEE Trans. Wireless Commun.*, vol. 19, no. 4, pp. 2827–2840, 2020.

[13] Z. Lu, J. Wang, and J. Song, “Multi-resolution CSI feedback with deep learning in massive MIMO system,” in *ICC 2020 - 2020 IEEE International Conference on Communications (ICC)*, 2020, pp. 1–6.

[14] B. Tolba, M. Elsabrouty, M. G. Abdu-Aguye, H. Gacanin, and H. M. Kasem, “Massive MIMO CSI feedback based on generative adversarial network,” *IEEE Commun. Lett.*, vol. 24, no. 12, pp. 2805–2808, 2020.

[15] J. Guo, C.-K. Wen, S. Jin, and G. Y. Li, “Overview of deep learning-based CSI feedback in massive MIMO systems,” *IEEE Trans. Commun.*, vol. 70, no. 12, pp. 8017–8045, 2022.

[16] Y. Cui, A. Guo, and C. Song, “TransNet: Full attention network for CSI feedback in FDD massive MIMO systems,” *IEEE Wireless Commun. Lett.*, vol. 11, no. 5, pp. 903–907, 2022.

[17] J. Zhuang, X. He, Y. Wang, J. Liu, and W. Wang, “CovNet: Covariance information-assisted CSI feedback for FDD massive MIMO systems,” *IEEE Wireless Communications Letters*, vol. 14, no. 3, pp. 641–645, 2025.

[18] J. Lee, J. Kim, and Y. Choi, “Learning variable-rate CSI compression with multi-stage vector quantization,” in *ICC 2024-IEEE International Conference on Communications*. IEEE, 2024, pp. 5123–5128.

[19] S. K. Ankireddy, H. Kim, J. Cho, and H. Kim, “Residual diffusion models for variable-rate joint source–channel coding of MIMO CSI,” *IEEE J. Sel. Areas Commun.*, vol. 44, pp. 3620–3633, 2026.

[20] V. Rizzello, M. Nerini, M. Joham, B. Clerckx, and W. Utschick, “User-driven adaptive CSI feedback with ordered vector quantization,” *IEEE Wireless Communications Letters*, vol. 12, no. 11, pp. 1956–1960, 2023.

[21] 3GPP, “Study on channel model for frequencies from 0.5 to 100 GHz,” 3rd Generation Partnership Project (3GPP), Technical Report TR 38.901, May 2024, version 18.0.0.

[22] T. Park, M.-Y. Liu, T.-C. Wang, and J.-Y. Zhu, “Semantic image synthesis with spatially-adaptive normalization,” in *Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit. (CVPR)*, 2019, pp. 2332–2341.

[23] O. Ronneberger, P. Fischer, and T. Brox, “U-Net: Convolutional networks for biomedical image segmentation,” in *Proc. Int. Conf. Med. Image Comput. Comput.-Assist. Intervent. (MICCAI)*, 2015, pp. 234–241.

[24] H. Chang, H. Zhang, L. Jiang, C. Liu, and W. T. Freeman, “MaskGIT: Masked generative image transformer,” in *Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit. (CVPR)*, 2022, pp. 11 305–11 315.

[25] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin, “Attention is all you need,” in *Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2017, pp. 5998–6008.

[26] A. van den Oord, O. Vinyals, and K. Kavukcuoglu, “Neural discrete representation learning,” in *Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2017, pp. 6306–6315.

[27] S. Dieleman, A. van den Oord, and K. Simonyan, “The challenge of realistic music generation: Modelling raw audio at scale,” in *Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2018.

[28] A. Baevski, Y. Zhou, A. Mohamed, and M. Auli, “wav2vec 2.0: A framework for self-supervised learning of speech representations,” in *Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2020.

[29] J. Zhang, F. Zhan, C. Theobalt, and S. Lu, “Regularized vector quantization for tokenized image synthesis,” in *Proc. IEEE/CVF Conf. Comput. Vis. Pattern Recognit. (CVPR)*, 2023, pp. 18 467–18 476.

[30] J. Hoydis, S. Cammerer, F. A. Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, “Sionna: An open-source library for next-generation physical layer research,” *arXiv preprint arXiv:2203.11854*, 2022.

[31] I. Loshchilov and F. Hutter, “Decoupled weight decay regularization,” *arXiv preprint arXiv:1711.05101*, 2017.

**原文插图：** 原 PDF 中的图 1–5 未重传至本页，仅保留中文图注与图中关键标注（如各方法的 NMSE 读数与 $k$ 值）；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.17769v1（cs.IT，16 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–VII 节（含 I-A–C、II-A–B、III-A–I、V-A–C、VI-A–D 等全部小节）、结论、全部图注（图 1–5，含图 2–4 的子图说明）、表 I（逐格转录）、算法 1、公式 (1)–(36) 与 31 条参考文献英文原条目；原文无附录、无作者简介。**逐句终校未做**：表 I 的架构与训练超参数已用 PDF 页面渲染逐格核对；式 (6)–(7)、(26)、(35) 等关键式亦对照页面渲染核对；但尚未完成逐句逐式的独立复核。页内 1 处“原文疑点”为原文记号缺失：式 (19) 中出现的 $\{\mathbf{p}_\ell\}_{\ell=0}^{L-1}$ 在正文中未给出定义（按上下文应为位置嵌入/可学习提示向量），本译按原文照录并加注。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
