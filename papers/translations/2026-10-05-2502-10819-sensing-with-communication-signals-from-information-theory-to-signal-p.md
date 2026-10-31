---
layout: page
title: "通感一体：从信息论到信号处理的通信信号感知｜中文全文译文"
permalink: /papers/translations/2026-10-05-2502-10819-sensing-with-communication-signals-from-information-theory-to-signal-p/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b63c4db5bb3e4f6d/) · [原文 arXiv](https://arxiv.org/abs/2502.10819) · [全部目录](/papers/catalog/)

# 通感一体：从信息论到信号处理的通信信号感知

**原题：** Sensing With Communication Signals: From Information Theory to Signal Processing  
**作者：** Fan Liu（Senior Member, IEEE）、Ya-Feng Liu（Senior Member, IEEE）、Yuanhao Cui（Member, IEEE）、Christos Masouros（Fellow, IEEE）、Jie Xu（Fellow, IEEE）、Tony Xiao Han（Senior Member, IEEE）、Stefano Buzzi（Senior Member, IEEE）、Yonina C. Eldar（Fellow, IEEE）、Shi Jin（Fellow, IEEE）  
**单位：** F. Liu、S. Jin：东南大学信息科学与工程学院移动通信国家重点实验室（南京 210096）；Y.-F. Liu：中国科学院数学与系统科学研究院计算数学与科学/工程计算研究所、科学与工程计算国家重点实验室（北京 100190）；Y. Cui：北京邮电大学通信工程系（北京 100876）；C. Masouros：伦敦大学学院电子与电气工程系（伦敦 WC1E 7JE）；J. Xu：香港中文大学（深圳）理工学院、深圳市未来网络智能研究院（FNii-Shenzhen）与广东省未来网络智能重点实验室（深圳 518172）；T. X. Han：华为技术有限公司；S. Buzzi：卡西诺与南拉齐奥大学电气与信息工程系（意大利卡西诺 I-03043）、米兰理工大学电子信息与生物工程系（米兰 I-20133）及意大利大学间通信联盟（CNIT，帕尔马 I-43124）；Y. C. Eldar：魏茨曼科学研究所数学与计算机科学学院（以色列雷霍沃特）。  
**版本：** arXiv:2502.10819v1（cs.IT），2025 年 2 月 15 日，原文 25 页。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VII 节（含各 A/B 小节）、结论、图 1—13 中文图注、表 I 逐格转录、参考文献 [1]—[122]（英文原条目，按原编号）按原文结构录入。原文为教程/综述论文，不含附录、作者简介与 NeurIPS 类清单，本页亦不含；逐句逐式终校未做。

## 摘要

通感一体化（Integrated Sensing and Communications, ISAC）范式有望成为未来 6G 网络的基石。为优化无线资源的使用，6G ISAC 系统需要把本身具有随机性的通信数据载荷信号同时用于感知与通信（S&C）。本教程论文对使用随机通信信号进行 ISAC 传输的基础理论与信号处理方法给出全面技术综述。我们首先从信息论角度引入 S&C 之间的确定性—随机折中（deterministic-random tradeoff, DRT），强调需要为随机 ISAC 信号专门设计信号处理技术。在此基础上，我们回顾以通信为中心的 ISAC 系统的核心信号模型与处理流程，分析随机 ISAC 信号的平均平方自相关函数（auto-correlation function, ACF）——它可作为多目标测距任务的基本性能度量。由这些理论结果出发，我们给出以通信为中心的 ISAC 系统三大关键部件的设计准则：调制方案、星座设计与脉冲成形滤波器，目标是在不损害通信效率的前提下提升感知性能，或在二者之间建立可伸缩的折中。随后我们把分析从单天线 ISAC 系统推广到多天线情形，讨论专门为随机 ISAC 信号设计的 MIMO 预编码技术的最新进展。最后，我们指出用通信信号进行感知领域的若干开放挑战与未来研究方向。

**索引词：** 通感一体化（Integrated Sensing and Communications, ISAC）、确定性—随机折中（deterministic-random tradeoff）、调制基（modulation basis）、星座设计（constellation design）、脉冲成形（pulse shaping）、多天线预编码（multi-antenna precoding）。

## I. 引言

### A. 背景与动机

下一代无线网络（5G-Advanced（5G-A）与 6G）正日益被视为支撑广泛新兴应用的关键使能技术，这些应用包括数字孪生、元宇宙、智慧城市、工业物联网（Industrial Internet-of-Things, IoT），以及由无人机（Unmanned Aerial Vehicle, UAV）驱动的低空经济 [1]、[2]。这些应用通过提供先进的数字体验、实时监测和智能自动化，有望深刻改变产业与社会。2023 年 5 月，国际电信联盟（International Telecommunications Union, ITU）完成了 IMT-2030 建议框架，即通常所称的全球 6G 愿景 [3]。这一成果标志着 6G 标准化进程正式启动，为下一代通信系统的研发奠定基础。在 ITU 确定的六大关键使用场景中，通感一体化（ISAC）尤为突出，是一项具有变革意义的创新 [4]、[5]。ISAC 旨在以无缝且高效的方式把无线感知与通信（S&C）功能整合为一体化方案，从而提升 6G 网络的性能与能力 [5]、[6]。通过把原生感知功能直接融入通信基础设施，支持 ISAC 的蜂窝网络将进一步释放前所未有规模的分布式感知能力；由此，它还能通过产生构建网络化智能所需的海量传感数据，支撑 6G 的另一关键场景——人工智能（AI）与通信的融合。

ISAC 技术可以按若干递进阶段来理解 [7]。最初阶段关注 S&C 系统对频谱资源的独立使用，确保二者互不干扰；随后阶段把 S&C 功能整合到共享射频前端；第三阶段即完全集成的 ISAC 系统，在同一频段内用共享波形在统一硬件平台上同时完成 S&C 功能 [6]。在这样的系统中，单个无线电信号既向通信用户传递数据信息，又从回波中获取目标的关键信息，例如感兴趣目标的距离、角度、速度、轨迹、尺寸与形状，甚至周围环境的图像。这种集成在物理层（PHY）带来相当大的挑战：需要创新的信令方案来支撑更高层的 ISAC 应用。在各类设计策略中，以下三种主要路径受到学术界与工业界的广泛关注。

1) **以感知为中心的设计**：把通信比特嵌入传统雷达波形，通常称为信息嵌入方法 [8]—[11]。以 chirp 波形为例，可通过波形的幅度、相位、频率乃至 chirp 速率来表示通信符号 [11]—[13]。此外，对于 MIMO 雷达系统，还可通过波束方向图旁瓣控制或索引调制等技术在空间域嵌入信息 [14]、[15]，例如把不同载频的波形在多根天线之间打乱 [10]、[16]。然而，多数以感知为中心的方法依赖慢时间编码以避免破坏雷达波形结构、从而保持 ISAC 系统的感知能力，因此数据速率通常较低，并受脉冲重复频率（pulse repetition frequency, PRF）限制 [17]。

2) **以通信为中心的设计**：与以感知为中心的设计相反，以通信为中心的方法直接在现有通信信令格式中实现感知功能。该方向的一些早期工作可追溯到码分多址（code-division multiple access, CDMA）时代，当时用 Oppermann 序列同时实现通信与雷达功能 [18]。一个更著名的例子是正交频分复用（orthogonal frequency division multiplexing, OFDM）波形 [19]、[20]，其感知能力在开创性论文 [21] 中得到验证。更进一步，正交时频空间（orthogonal time-frequency space, OTFS）调制因其在时延—多普勒域工作、而该域直接对应雷达目标的关键参数，被认为是 6G ISAC 应用的潜在候选波形 [22]—[24]。在近期发展中，一种名为仿射频分复用（affine frequency division multiplexing, AFDM）的新型通信波形被提出，用以提升 S&C 性能，特别是在高移动性场景中 [25]、[26]。虽然原则上任何通信信号都可用于 ISAC，且能在对通信功能影响最小的前提下保持通信性能，但这些信号并非专为目标检测或估计而设计，因此可能导致感知性能退化且难以调节。

3) **联合设计**：为在 S&C 之间取得可伸缩的折中，联合设计方法从零开始设计 ISAC 波形，而不是单纯依赖传统雷达或通信信号 [27]、[28]。在该框架下，ISAC 信令问题被表述为多目标优化问题，把具体的 S&C 性能度量作为代价函数或约束。例如在 MIMO 雷达波束方向图约束下最小化通信的用户间干扰 [29]—[32]，或在每用户信干噪比（signal-to-interference-plus-noise ratio, SINR）或通信传输速率约束下最小化感知的 Cramér–Rao 界（Cramér-Rao Bound, CRB）[33]—[35]。更近期，各类 ISAC 波形设计技术被用于处理硬件非理想性等问题 [36]—[39]。总体而言，联合设计方法为 ISAC 信令提供了显著的灵活性，但代价是相比另外两种设计显著更高的复杂度。

在三种设计理念中，以通信为中心的 ISAC 设计更有希望在实际 5G-A 与 6G 网络中部署，主要因为其实现成本低、与现有蜂窝基础设施完全兼容 [40]。事实上，ISAC 标准化正在第三代合作伙伴计划（3rd Generation Partnership Project, 3GPP）中顺利推进，其基础是 5G 新空口（5G New Radio, 5G NR）协议。例如，3GPP Release 18（Rel-18）的一个重点是改进设备定位 [41]，这对 5G-A 中的 ISAC 与无线感知至关重要。更进一步，2022 年 4 月面向 Rel-19 引入了技术报告 TR 22.837，确定 32 个 ISAC 用例 [42]；2023 年 8 月，技术规范 TS 22.137 给出了无线感知的服务需求，细化了八项关键性能指标（key performance indicator, KPI）[43]；2023 年 12 月，ISAC 信道建模研究获得批准 [44]。欧洲电信标准化协会（European Telecommunications Standards Institute, ETSI）也在开展互补工作，聚焦 ISAC 专用用例与安全。与此同时，IEEE 802.11bf 致力于增强用于感知的 WLAN 标准 [45]。此外，ISAC 的空口技术预计自 2025 年起在 3GPP Rel-20 中开展研究，并将在 Rel-21 下的首批 3GPP 6G 技术规范中最终确定 [46]。作为这一演进的一部分，以通信为中心的 ISAC 的 PHY 信令与处理技术研究将日益关键。

### B. 用随机通信信号进行感知

当前 5G NR 的 ISAC 信令框架高度依赖嵌入 NR 帧结构中的参考信号（即"导频"）。例如，如 3GPP Rel-18 所定义，能力降低（Reduced-Capability, RedCap）设备使用定位参考信号（positioning reference signal, PRS）进行下行定位测量，同时发送探测参考信号（sounding reference signal, SRS）进行上行定位 [41]、[47]。除 PRS 与 SRS 外，其他 PHY 参考信号也被探索用于感知，例如信道状态信息参考信号（CSI-RS）、解调参考信号（DMRS）与同步信号 [48]—[50]。这些信号通常由伪随机序列生成，包括 Zadoff-Chu 序列、m 序列与 Gold 序列，它们具有有利的自相关与互相关性质 [50]。尽管有这些优点，PHY 参考信号只占用至多 10%—15% 的时频资源，这严重限制了其在新兴 ISAC 用例中提供优异感知性能的能力；要提升感知性能就不可避免地需要在多帧上采集感知样本，从而带来过高的复杂度与时延。为填补这一空缺，一种有前景的做法是把数据载荷（占可用资源的 85% 以上）重新用于 S&C 任务。通过充分利用通信信号的全部带宽与时间长度，该做法可显著提升距离—多普勒分辨率以及目标检测与估计性能。

虽然利用数据载荷信号进行 ISAC 相比仅用导频的传统方案有显著的性能增益，但这些信号本身并非为感知应用而设计，因而在实现以通信为中心的 ISAC 系统时存在关键挑战。第一，与前面讨论的伪随机序列不同，数据载荷信号是携带有用信息的随机信号 [51]。这些信号按特定码本随机生成，其结构由信息源分布决定。ISAC 信息论的近期进展强调了 S&C 需求之间的一个关键差异：通信系统依靠随机信号高效传递信息，而雷达感知系统要求具有良好模糊特性的确定性信号。因此，ISAC 信号中嵌入的随机性提高了通信速率，却恶化了感知性能，导致 S&C 之间的确定性—随机折中（DRT）[52]—[55]。这一折中尤其与 ISAC 信号的输入分布有关 [56]，对刻画 S&C 的 Pareto 性能边界构成重大挑战。在此背景下，文献 [53] 考察了在向量高斯信道上工作的基本点对点（point-to-point, P2P）ISAC 系统，分别评估了通信最优与感知最优工作点处可达到的 S&C 性能，为利用 DRT 设计更复杂的 ISAC 系统提供了有价值的理论洞见。

第二，除了 ISAC 信息论推导出的理论结果的基础性之外，进一步评估与优化真实通信信号下可达到的感知性能也具有实际重要性 [52]—[55]。通信信号主要为数据传递而构思，其格式与传统雷达信号有根本不同。在最基本的层面上，实际通信信号可分解为以下关键部件 [57]：

- **信道编码**：把信息源编码为编码比特序列以提高传输可靠性。
- **星座符号**：由承载信息的比特序列映射得到。
- **正交归一模基**：通过构造离散时间信号来承载这些符号。
- **脉冲成形滤波器**：把离散时域样本转换为连续时间信号。
- **MIMO 预编码器**：多天线系统中实现多流或多层传输所必需。

上述每个部件都显著影响最终的感知性能，但它们的影响在很大程度上仍未被充分探索。为有效指导面向未来 6G 网络的以通信为中心的 ISAC 系统开发，深入理解通信系统这些核心要素如何影响感知性能是必要的。这一理解构成本篇教程论文研究的基本动机。

### C. 本文组织

在本教程论文中，我们对利用随机数据载荷信号的 P2P ISAC 系统基础理论与信号处理方法的最新进展给出全面技术综述 [52]—[55]、[58]—[62]。我们在第 II 节从信息论角度引入 S&C 之间的 DRT，强调专门为随机 ISAC 信号开发定制信号处理方法的必要性 [52]—[55]、[63]—[65]。具体而言，我们回顾状态相关无记忆 ISAC 信道的容量—失真（capacity-distortion, C-D）理论 [55]，刻画输入分布对 S&C 双方的影响；随后把分析推广到向量高斯信道，考察 ISAC 的 CRB—速率折中 [53]，揭示 ISAC 信号矩阵在感知最优与通信最优点处的最优分布与结构，并分别刻画可达到的 S&C 性能。

在这一理论基础之上，我们在第 III 节回顾以通信为中心的 ISAC 系统的核心信号模型与处理流程，重点分析随机 ISAC 信号的自相关函数（ACF），它是评估多目标测距应用中感知性能的关键度量 [58]。由于数据载荷固有的随机性，我们需要分析 ACF 的统计性质，而不是依赖某一具体实现。近期研究致力于在 Nyquist 脉冲成形框架下推导期望平方 ACF 的闭式表达，其中考虑任意调制技术与星座映射 [58]。该表达式被形象地描述为"海中冰山"结构：其中"冰山"代表随机 ISAC 信号 ACF 均值的平方，由脉冲成形滤波器决定；"海平面"对应方差，反映数据随机性带来的波动。

由这些结果出发，我们在第 IV 节进一步综述以通信为中心的 ISAC 系统三大关键部件的设计准则，包括调制方案 [59]、星座设计 [60] 与脉冲成形滤波器 [58]、[61]，目标是在不牺牲通信效率的前提下提升感知性能，或在二者之间建立可伸缩的折中。这种平衡对于在同一系统内无缝集成 S&C 功能至关重要。值得指出的是，我们证明在所有正交线性调制方案中，OFDM 对独立同分布（i.i.d.）QAM/PSK 符号取得最低的平均测距旁瓣电平 [59]。随后综述一种概率星座整形方法，在最大化通信速率的同时进一步降低 OFDM 信令的旁瓣电平 [60]；再给出一种 Nyquist 脉冲设计方法以重塑 ISAC 信号的 ACF [58]、[61]。此外，我们在第 V 节把讨论扩展到更复杂的 MIMO 情形，详述专门为随机 ISAC 信号设计的数据相关与数据无关 MIMO 预编码技术的最新进展 [62]。

最后，我们讨论用随机通信信号进行感知的若干开放挑战与有前景的未来研究方向。我们希望本工作能为在即将到来的 6G 网络中实现 ISAC 功能的持续努力提供有价值的贡献。

### 记号约定

全文用 $a$、$\mathbf a$ 与 $\mathbf A$ 分别表示随机标量、随机向量与随机矩阵，对应的确定性量记为 $a$、$\mathbf a$ 与 $\mathbf A$。$N$ 阶单位阵记为 $\mathbf I_N$；$N$ 阶离散 Fourier 变换（discrete Fourier transform, DFT）矩阵记为 $\mathbf F_N$，其 $(m,n)$ 元定义为 $\frac{1}{\sqrt N}e^{-j2\pi(m-1)(n-1)/N}$，其中 $j$ 为虚数单位。矩阵 $\mathbf A$ 与 $\mathbf B$ 之间的 Kronecker 积与 Hadamard 积分别记为 $\mathbf A\otimes\mathbf B$ 与 $\mathbf A\odot\mathbf B$。$\|\mathbf x\|_p$ 表示 $\ell_p$ 范数，省略下标时默认为 $\ell_2$ 范数。$\mathbb E(\cdot)$ 与 $\operatorname{var}(\cdot)$ 分别表示输入变量的期望与方差；$(\cdot)^{*}$、$(\cdot)^{T}$、$(\cdot)^{H}$ 分别表示复共轭、转置与 Hermitian 转置；$\mathbf a_n$ 表示 $\mathbf A$ 的第 $n$ 列。$\operatorname{Diag}(\cdot)$ 表示把参数置于方阵主对角线上所得的矩阵；$\operatorname{Tr}(\cdot)$ 表示方阵的迹，$\operatorname{rank}(\cdot)$ 表示矩阵的秩。上述记号中的下标在上下文清楚时可以省略。

## II. ISAC 系统中的确定性—随机折中：信息论视角

本节介绍 S&C 之间的基本 DRT，强调需要为随机 ISAC 信号开发专用信号处理技术。我们首先回顾状态相关无记忆 ISAC 信道的容量—失真（C-D）理论，从信息论角度把 S&C 折中表述为泛函优化问题；在此基础上把 DRT 推广到向量高斯 ISAC 信道，刻画 CRB—速率区域。

### A. 系统模型

考虑图 1 所示的 P2P ISAC 系统：ISAC 发射机（Tx）向感知目标辐射统一信号，同时向通信接收机（Rx）传递信息。与此同时，专用感知 Rx 或与 ISAC Tx 共址（单站模式），或单独放置并通过有线链路连接 Tx（协作双站模式）。两种情形下感知 Rx 都完全已知发射的 ISAC 信号，而通信 Rx 不知道，因为该信号携带面向通信用户的信息。具体而言，S&C 子系统的主要目标为：

- **感知**：通过处理目标反射的回波，检测目标是否存在，并准确估计时延、多普勒与角度等关键参数。
- **通信**：通过处理通信信道输出的接收信号，解码 ISAC Tx 发送的信息比特。

该模型中通信性能通常用可达速率或信道容量衡量，此处从略；感知性能可用估计任务的均方误差（MSE）、检测任务的检测概率与虚警概率刻画，下面进一步解释。

- **估计度量**：估计精度可由真值与估计值之差评估。令 $h$ 为感知参数（如时延、多普勒或角度）的真值，$\hat h$ 为其估计，则估计误差用 MSE $\epsilon$ 量化为
$$
\epsilon:=\mathbb E\left(\left|h-\hat h\right|^2\right),\tag{1}
$$
其中期望对 $h$ 与 $\hat h$ 的潜在随机性取。
- **检测度量**：检测问题最简单的形式通常表述为二元假设检验：$H_0$ 表示感知 Rx 只检测到噪声，$H_1$ 表示收到目标回波加噪声。检测概率 $P_D$ 是目标存在时正确选择 $H_1$ 的概率；虚警概率是目标不存在时错误选择 $H_1$ 的概率。二者可表示为
$$
P_D=\Pr\left(H_1|H_1\right),\qquad P_{FA}=\Pr\left(H_1|H_0\right).\tag{2}
$$

值得注意的是，在信息论语境中检测与估计度量都可统一为一般化失真度量，由有界距离函数 $d(h,\hat h)$ 定义。对估计任务，常用失真函数为欧氏距离 $d(h,\hat h)=|h-\hat h|^2$，它导出式（1）的 MSE；对检测任务，可定义 $h\in\{0,1\}$ 表示目标存在/不存在，并用汉明距离 $d(h,\hat h)=h\oplus\hat h$ 作为失真度量。此时期望失真可写为 [52]
$$
\begin{aligned}
\mathbb E\left\{h\oplus\hat h\right\}
={}&(1\oplus1)\Pr\left(\hat h=1|h=1\right)+(0\oplus0)\Pr\left(\hat h=0|h=0\right)\\
&+(1\oplus0)\Pr\left(\hat h=1|h=0\right)+(0\oplus1)\Pr\left(\hat h=0|h=1\right)\\
={}&1-P_D+P_{FA}.
\end{aligned}\tag{3}
$$
在 Neyman–Pearson 准则 [66] 下（固定 $P_{FA}$），最小化式（3）的平均汉明失真等价于最大化检测概率。

下面引入 C-D 理论，用一般化失真度量作为感知的关键性能指标，而不指明具体的估计或检测任务。需要强调的是，C-D 理论是对图 1 具体 ISAC 传输模型的信息论抽象，旨在刻画任意 ISAC 信道模型与感知任务（含估计与检测）下 S&C 双方可达到的性能边界。

### B. 容量—失真理论

**1) 单站 ISAC 的信息论模型。** ISAC 系统对无线资源的共享在 S&C 性能之间形成内在折中。C-D 理论正是在统一框架下分析这种折中及其基本极限 [55]、[67]。该理论把 Shannon 最初为有损数据压缩提出的率失真框架 [51] 推广到 ISAC 系统。以 P2P 单站 ISAC 系统为例，把 ISAC 信道建模为无记忆状态相关延迟反馈信道 [55]、[63]—[65]，服从信道律（条件分布）$P_{yz|xh}$。这里 $x$ 表示输入 ISAC 信号；$h$ 为感兴趣的目标参数，可为时延、多普勒、角度，甚至表示目标存在/不存在的二元变量，也称为"感知信道状态"；$y$ 为通信 Rx 收到的信号，$z$ 为目标回波，建模为 ISAC 信道的延迟反馈。如图 2 的信息论模型所示，ISAC Tx 由编码器与估计器（共址感知 Rx）组成：编码器希望向通信接收机传递消息 $w$，同时依靠信道返回的回波检测/估计目标参数 $h$。在任意时隙 $i$，给定输入 $x_i$ 与状态实现 $h_i$（分别取自有限集 $\mathcal Y$、$\mathcal Z$、$\mathcal X$、$\mathcal H$），由信道律 $P_{yz|xh}(y_i,z_i|x_i,h_i)$ 生成信道输出 $y_i$ 与反馈 $z_i$；假设所有 $i$ 的 $h_i$ 独立同分布，服从 $P_h$。

基于上述模型，一个 $(2^{nR},n)$ ISAC 编码方案由以下部分组成 [55]：

- 大小至少为 $2^{nR}$ 的消息集 $\mathcal W$；
- 一系列编码函数 $\Phi_i:\mathcal W\times\mathcal Z^{i-1}\to\mathcal X$（$i=1,2,\ldots,n$），根据消息与历史反馈生成信道输入（ISAC 信号），即 $x_i=\Phi_i\left(w,z^{i-1}\right)$；
- 解码函数 $\psi:\mathcal H^n\times\mathcal Y^n\to\mathcal W$，利用通信输出序列 $y$ 与感知信道状态 $h$ 恢复发送消息，即 $\hat w=\psi\left(h^n,y^n\right)$；
- 状态估计器 $\hat h:\mathcal X^n\times\mathcal Z^n\to\hat{\mathcal H}^n$（$\hat{\mathcal H}^n$ 为重建状态值的有限集），利用发射的 ISAC 信号与反馈恢复实际状态序列，即 $\hat h^n=\hat h\left(x^n,z^n\right)$。

**2) S&C 性能评估。** 为评估 ISAC 系统的感知性能，用基于某种失真函数 $d(h,\hat h)$（如估计用欧氏距离、检测用汉明距离）的平均每块失真，定义为
$$
\Delta^{(n)}:=\mathbb E\left\{d\left(h^n,\hat h^n\right)\right\}=\frac1n\sum_{i=1}^{n}\mathbb E\left\{d\left(h_i,\hat h_i\right)\right\}.\tag{4}
$$
得益于 ISAC 信道的无记忆性，可证明最优估计器 $\hat h^{\star}$ 可单字母化，它最小化期望后验失真，即
$$
\hat h^{\star}(x,z):=\arg\min_{h'\in\hat{\mathcal H}}\sum_{h\in\mathcal H}P_{h|xz}(h|x,z)d(h,h').\tag{5}
$$
由此得到估计误差
$$
e(x)=\mathbb E\left\{d\left[h,\hat h^{\star}(x,z)\right]|x=x\right\},\tag{6}
$$
它在给定 ISAC 信号实例 $x$ 时充当感知代价函数。对通信性能，考虑发送消息的平均错误概率
$$
P_e^{(n)}:=\frac1{2^{nR}}\sum_{i=1}^{2^{nR}}\Pr\left(\hat w\neq i|w=i\right).\tag{7}
$$
为建模无线资源约束（如发射功率或带宽），引入 ISAC 信号 $x$ 的代价函数 $b(\cdot)$：
$$
\mathbb E\left\{b\left(x^n\right)\right\}=\frac1n\sum_{i=1}^{n}\mathbb E\left\{b\left(x_i\right)\right\}.\tag{8}
$$
给定资源预算 $B$，若存在 $(2^{nR},n)$ ISAC 编码方案使 [55]
$$
\lim_{n\to\infty}P_e^{(n)}=0,\tag{9a}
$$
$$
\lim_{n\to\infty}\Delta^{(n)}\leq D,\tag{9b}
$$
$$
\lim_{n\to\infty}\mathbb E\left\{b\left(x^n\right)\right\}\leq B,\tag{9c}
$$
则称率—失真—代价三元组 $\{R,D,B\}$ 可达。在此框架下，ISAC 系统的 C-D 折中定义为
$$
C_B(D)=\sup\left\{R\mid\{R,D,B\}\ \text{可达}\right\}.\tag{10}
$$
尽管上述定义明确了 C-D 折中的操作含义，但直接以可处理的方式计算 $C_B(D)$ 往往困难。为此，可证明下述信息论 C-D 函数（在 ISAC 信号分布 $P_x(x)$ 上最大化条件互信息（MI））与式（10）等价 [55]：
$$
C_B(D)=\arg\max_{P_x(x)}I(x;y|h)\tag{11a}
$$
$$
\text{s.t.}\quad\sum_{x\in\mathcal X}P_x(x)e(x)\leq D,\tag{11b}
$$
$$
\sum_{x\in\mathcal X}P_x(x)b(x)\leq B,\tag{11c}
$$
其中 $I(x;y|h)$ 为信道 $h$ 条件下输入 $x$ 与输出 $y$ 的条件 MI；式（11b）与（11c）分别为平均感知失真与资源代价约束。给定信道律 $P_{yz|xh}$，泛函优化问题（11）可用著名的 Blahut–Arimoto（BA）算法迭代求解 [68]、[69]。

**3) 示例。** 考虑标量线性高斯信道 $P_{yz|xh}$，其输入输出关系为 [63]
$$
y=hx+n,\qquad z=y,\tag{12}
$$
其中信道系数 $h\in\mathbb R$ 服从高斯分布，是待由 ISAC 信号 $x\in\mathbb R$ 估计的参数；$n\in\mathbb R$ 为零均值、单位方差的加性白高斯噪声（AWGN）。资源预算为发射功率，设为 $\mathbb E(|x|^2)\leq B=10$。这里通信 Rx 希望在收到 $y$ 后恢复 $x$，感知 Rx 则希望用最小均方误差（MMSE）估计器观测回波 $z$ 来估计 $h$。注意模型（12）假设完美反馈，这一玩具模型仅用于说明 C-D 折中，可能与后文讨论的真实 ISAC 传输场景并不完全一致。

图 3 通过数值求解问题（11）给出上述模型下的 C-D 折中结果及相应的最优 ISAC 信号分布。可观察到，在点 ① 与点 ④，$x$ 的最优输入分布分别为高斯分布与 BPSK 星座，对应通信最优与感知最优性能。沿 C-D 折中曲线，$P_x(x)$ 从高斯平滑演化为 BPSK，表明 ISAC 信号的随机性逐步降低 [63]。

### C. 向量高斯 ISAC 信道的 CRB—速率区域

**1) 通用框架。** 上述 C-D 理论就 ISAC 信道的输入分布清楚展示了 S&C 之间的 DRT。一个自然的问题是：这种折中在更复杂场景（如含多个感知参数的 MIMO 信道）是否成立？为此，文献 [53] 在如下 P2P 向量高斯 ISAC 信道模型下考察 S&C 之间的 CRB—速率折中：
$$
\mathbf Y_s=\mathbf H_s(\boldsymbol\eta)\mathbf X+\mathbf Z_s\tag{13a}
$$
$$
\mathbf Y_c=\mathbf H_c\mathbf X+\mathbf Z_c,\tag{13b}
$$
其中 $\mathbf X\in\mathbb C^{N_t\times N}$ 为 ISAC Tx 发射的双功能 ISAC 波形；$\mathbf Y_s\in\mathbb C^{N_s\times N}$ 与 $\mathbf Y_c\in\mathbb C^{N_c\times N}$ 分别为 S&C Rx 收到的信号矩阵；$\mathbf H_s\in\mathbb C^{N_s\times N_t}$ 与 $\mathbf H_c\in\mathbb C^{N_c\times N_t}$ 为 S&C 信道矩阵；$\mathbf Z_s\in\mathbb C^{N_s\times N}$ 与 $\mathbf Z_c\in\mathbb C^{N_c\times N}$ 为白高斯噪声矩阵，各元素独立同分布，分别服从 $\mathcal{CN}\left(0,\sigma_s^2\right)$ 与 $\mathcal{CN}\left(0,\sigma_c^2\right)$。此外，假设感知信道 $\mathbf H_s$ 是感知参数向量 $\boldsymbol\eta\in\mathbb R^K$ 的函数，具有先验分布 $P_{\eta}$，可包含一个或多个目标的时延、多普勒与角度参数。两个信道之间可能存在一定程度的相关性，取决于具体 ISAC 场景。

模型（13）是通用的，适用于如图 1 所示的单站与协作双站 ISAC 系统。在该配置中，配备 $N_t$ 根天线的 ISAC Tx 在 $N$ 个连续时隙上发射双功能 ISAC 信号 $\mathbf X$，在与 $N_c$ 天线 Rx 通信的同时感知目标；回波信号 $\mathbf Y_s$ 由 $N_s$ 天线感知 Rx 接收。因此把 $\mathbf X$ 建模为服从分布 $P_X(\mathbf X)$ 的随机矩阵，其实现对感知 Rx 完全已知、对通信 Rx 未知。

由于式（13b）表示 P2P MIMO 通信信道，可达通信速率完全由给定信道 $\mathbf H_c$ 条件下输入输出之间的 MI 刻画，即 $I(\mathbf X;\mathbf Y|\mathbf H_c)$，它是标量情形（11a）的推广。然而，与传统雷达系统不同，由于探测波形 $\mathbf X$ 的随机性，感知 CRB 不能直接刻画。为解决该问题，可把 $\mathbf X$ 视为随机但已知的冗余参数，借助 Miller–Chang 界（MCB）[70]：先对给定 $\mathbf X$ 实例计算 CRB，再对 $\mathbf X$ 取期望。对任意弱无偏估计 $\hat{\boldsymbol\eta}$，所得 MSE 由如下贝叶斯 MCB 下界界定：
$$
\epsilon:=\mathbb E\left\{\left\|\hat{\boldsymbol\eta}-\boldsymbol\eta\right\|^2\right\}\geq\mathbb E_{\mathbf X}\left\{\operatorname{Tr}\left(\mathbf M_{\boldsymbol\eta|\mathbf X}^{-1}\right)\right\},\tag{14}
$$
其中 $\mathbf M_{\boldsymbol\eta|\mathbf X}\in\mathbb C^{K\times K}$ 为 $\boldsymbol\eta$ 的贝叶斯 Fisher 信息矩阵（BFIM）[71]，可等价表示为样本协方差矩阵 $\mathbf R_X:=\frac1N\mathbf X\mathbf X^H$ 的仿射映射 [53]：
$$
\mathbf M_{\boldsymbol\eta|\mathbf X}=\Phi(\mathbf R_X):=\frac{N}{\sigma_s^2}\left(\sum_{n=1}^{r_1}\mathbf H_{1,n}\mathbf R_X^{T}\mathbf H_{1,n}^{H}+\sum_{m=1}^{r_2}\mathbf H_{2,m}\mathbf R_X\mathbf H_{2,m}^{H}+\mathbf M_P\right),\tag{15}
$$
其中 $\mathbf M_P$ 表示由 $P_{\eta}$ 贡献的先验 FIM，矩阵 $\mathbf H_{1,n}$ 与 $\mathbf H_{2,m}$ 由 Jacobian 矩阵 $\frac{\partial\operatorname{vec}(\mathbf H_s^{*})}{\partial\boldsymbol\eta}$ 分块得到。

式（14）的贝叶斯 MCB 可在高 SNR 下由最大后验（MAP）估计器达到 [71]。比较式（14）与（11b）可见，MCB 充当随机 ISAC 信号 $\mathbf X$ 的等效平均感知代价函数，尽管它不是传统的"失真"度量。因此，ISAC 系统中的 CRB—速率折中可表述为如下 Pareto 优化问题：
$$
\min_{P_X(\mathbf X)}\ \alpha\mathbb E\left\{\operatorname{Tr}\left[\left(\Phi(\mathbf R_X)\right)^{-1}\right]\right\}-(1-\alpha)I(\mathbf X;\mathbf Y_c|\mathbf H_c)\tag{16a}
$$
$$
\text{s.t.}\quad\mathbb E\left\{\operatorname{Tr}\left(\mathbf R_X\right)\right\}=P_T,\tag{16b}
$$
其中 $P_T$ 为平均发射功率预算，$\alpha\in[0,1]$ 为平衡 S&C 目标的参数。如图 4 所示，把 $\alpha$ 从 0 调到 1 即可描出两个目标的 Pareto 边界，得到可达到的 CRB—速率对，从而定义 ISAC 系统的 CRB—速率区域。

尽管（16）关于 $P_X$ 是凸的，但由于 $P_X$ 的无限维性，获得完整 CRB—速率边界在计算上仍具挑战。因此我们转而关注两个极端点 $P_{CS}$ 与 $P_{SC}$，它们分别代表通信与感知最优的 ISAC 信号分布；连接这两点的线段构成 CRB—速率区域的时间共享内界。

**2) $P_{CS}$ 处的 S&C 性能。** 给定式（13b）的线性高斯模型，$P_{CS}$ 处通信速率由高斯输入分布最大化：$\mathbf X$ 的每一列独立取自 $\mathcal{CN}\left(\mathbf 0,\tilde{\mathbf R}_X^{CS}\right)$，其统计协方差矩阵定义为
$$
\tilde{\mathbf R}_X^{CS}=\mathbf U_c\boldsymbol\Lambda^{CS}\mathbf U_c^{H},\tag{17}
$$
其中 $\mathbf U_c$ 含 $\mathbf H_c$ 的右奇异向量，$\boldsymbol\Lambda^{CS}$ 为对角阵，其特征值由注水功率分配确定。于是 $P_{CS}$ 处最优 ISAC 信号结构为
$$
\mathbf X^{CS}=\mathbf U_c\boldsymbol\Lambda_{CS}^{1/2}\mathbf D,\tag{18}
$$
其中 $\mathbf D$ 为携带信息的随机矩阵，元素独立同分布且服从 $\mathcal{CN}(0,1)$。$P_{CS}$ 处可达速率可由 Shannon 容量公式表示为
$$
C_{CS}=\mathbb E\left\{\log\det\left(\mathbf I+\sigma_c^{-2}\mathbf H_c\tilde{\mathbf R}_X^{CS}\mathbf H_c^{H}\right)\right\}.\tag{19}
$$
与取决于 $\mathbf X$ 统计协方差矩阵的通信速率不同，感知 CRB 由样本协方差矩阵 $\mathbf R_X$ 决定。由于 $P_{CS}$ 处 $\mathbf X^{CS}$ 服从高斯分布，$\mathbf R_X$ 服从复 Wishart 分布。遗憾的是，$P_{CS}$ 处的 CRB 涉及高度非线性函数期望的计算，不太可能写成闭式。为此可建立感知 CRB $\epsilon_{CS}$ 的上下界 [53]：
$$
\operatorname{Tr}\left\{\left[\Phi\left(\tilde{\mathbf R}_X^{CS}\right)\right]^{-1}\right\}\leq\epsilon_{CS}\leq\frac{N\cdot\operatorname{Tr}\left\{\left[\Phi\left(\tilde{\mathbf R}_X^{CS}\right)\right]^{-1}\right\}}{N-\min\left\{K,\operatorname{rank}\left(\tilde{\mathbf R}_X^{CS}\right)\right\}}.\tag{20}
$$
当 $N\to\infty$ 时两界趋于一致。

**3) $P_{SC}$ 处的 S&C 性能。** 在 $P_{SC}$ 处评估 S&C 性能通常比 $P_{CS}$ 更困难，因为此时最优 ISAC 信号分布与可达通信速率都未被显式确定。记 $P_{SC}$ 处的 CRB 为 $\epsilon_{SC}$，可用 Jensen 不等式刻画：
$$
\mathbb E\left\{\operatorname{Tr}\left[\left(\Phi(\mathbf R_X)\right)^{-1}\right]\right\}\geq\operatorname{Tr}\left\{\left(\Phi\left[\mathbb E\left(\mathbf R_X\right)\right]\right)^{-1}\right\}\geq\operatorname{Tr}\left\{\left[\Phi\left(\tilde{\mathbf R}_X^{SC}\right)\right]^{-1}\right\}:=\epsilon_{SC},\tag{21}
$$
其中 $\tilde{\mathbf R}_X^{SC}$ 是 $P_{SC}$ 处的最优协方差矩阵，由求解确定性 CRB 最小化问题得到：
$$
\tilde{\mathbf R}_X^{SC}=\arg\min_{\tilde{\mathbf R}\succeq0,\ \tilde{\mathbf R}=\tilde{\mathbf R}^{H}}\operatorname{Tr}\left\{\left[\Phi(\tilde{\mathbf R})\right]^{-1}\right\}\quad\text{s.t.}\ \operatorname{Tr}(\tilde{\mathbf R})\leq P_T.\tag{22}
$$
式（21）取等号当且仅当
$$
\frac1N\mathbf X\mathbf X^H=\mathbf R_X=\mathbb E\left(\mathbf R_X\right)=\tilde{\mathbf R}_X^{SC},\tag{23}
$$
即 $\mathbf R_X$ 在 $P_{SC}$ 处变为确定性。这表明 $P_{SC}$ 处最优 ISAC 信号结构为
$$
\mathbf X^{SC}=\sqrt N\left(\tilde{\mathbf R}_X^{SC}\right)^{1/2}\mathbf Q=\sqrt N\mathbf U_s\boldsymbol\Lambda_{SC}^{1/2}\mathbf Q,\tag{24}
$$
其中 $\mathbf U_s$ 与 $\boldsymbol\Lambda_{SC}$ 为 $\tilde{\mathbf R}_X^{SC}$ 的特征向量与特征值，$\mathbf Q\in\mathbb C^{\operatorname{rank}(\Lambda_{SC})\times N}$ 为携带通信数据的半酉矩阵（即 $\mathbf Q\mathbf Q^H=\mathbf I$），属于 Stiefel 流形。由于 $\tilde{\mathbf R}_X^{SC}$ 的确定性，通信自由度（DoFs）被限制在 $\mathbf Q$ 上。此配置下可达通信速率为
$$
C_{SC}=\arg\max_{P_{\mathbf Q}(\mathbf Q)}I(\mathbf Q;\mathbf Y_c|\mathbf H_c)\quad\text{s.t.}\ \mathbf Q\mathbf Q^H=\mathbf I.\tag{25}
$$
推导 $C_{SC}$ 的显式表达很困难；但文献 [53] 表明，高 SNR 下 $P_{SC}$ 处的渐近速率为
$$
C_{SC}=\mathbb E\left\{\left(1-\frac{\operatorname{rank}\left(\boldsymbol\Lambda_{SC}\right)}{2N}\right)\log\det\left(\sigma_c^{-2}\mathbf H_c\tilde{\mathbf R}_X^{SC}\mathbf H_c^{H}\right)+c_0\right\}+O\left(\sigma_c^2\right),\tag{26}
$$
其中 $c_0$ 与 SNR 无关且当 $N\to\infty$ 时趋于零。式（26）的速率可由在 Stiefel 流形上均匀分布的 $\mathbf Q$ 渐近达到。

> **原文脚注（关于 $N\to\infty$ 的特殊情形）：** 当 $N\to\infty$ 时 $\mathbf R_X$ 在 $P_{SC}$ 处变为确定性，式（21）与（23）同时取等号；此时由于 $\mathbf R_X$ 的确定性，高斯信令对 S&C 同时最优，可优化协方差矩阵 $\mathbf R_X$ 以刻画 $P_{SC}$ 与 $P_{SC}$ 之间的完整 Pareto 边界，例如在 $\mathbf H_s(\boldsymbol\eta)$ 与 $\mathbf H_c$ 为确定性（而非本文语境下的随机）时可参见文献 [34]、[35]。但这仅作为一般情形（$N$ 有限）下 S&C 性能的上界。

**4) 向量高斯 ISAC 信道中的 DRT。** 现在通过在两个角点处考察 S&C 性能，讨论模型（13）的 DRT。首先，由式（18）与（24）的结构可见，当系统从通信最优点移向感知最优点时，ISAC 信号的随机性水平下降：通信码字从独立同分布高斯矩阵 $\mathbf D$ 变为均匀分布的半酉矩阵 $\mathbf Q$。这种 ISAC 信号最优输入分布的折中，可视为前述 C-D 理论中标量高斯信道高斯—BPSK 折中的推广。此外，DRT 也体现在 $P_{SC}$ 处的可达速率（25）中：通信自由度减少相比高斯容量 $C_{CS}$ 带来速率损失。反过来，ISAC 信号随机性增大会损害感知性能，如 CRB 所示：式（20）表明，相比 $P_{SC}$ 处具有确定性样本协方差矩阵的信号所能达到的最小 CRB，高斯分布 ISAC 信号可能使 CRB 放大超过 1 倍。

### D. 从 DRT 理论到随机 ISAC 信号处理

上述信息论洞见凸显了与 $\mathbf X$ 输入分布相关的 S&C 折中，揭示了 ISAC 系统中的新设计自由度，并带来一系列研究机会，尤其是在使用随机通信信号的 ISAC 传输方面。与传统依赖确定性信号或结构化伪随机序列（如 m 序列或 Gold 序列）的雷达系统不同，未来 6G ISAC 系统必须利用通信数据承载信号进行感知，而这些信号因其信息承载特性而具有随机性。这种随机性在提升通信速率的同时，也可能在回波中引入随机起伏，从而可能恶化目标检测与估计性能。因此，必须为随机 ISAC 信号定义新的感知性能度量，并开发定制处理技术。

在 ISAC 理论基础上，下面综述标准通信信号可达感知性能刻画的最新研究进展，并探讨如何设计基本功能模块以最小化感知损失或实现灵活的 S&C 性能折中。这涉及调制方案、星座映射、脉冲成形滤波器与 MIMO 预编码器的配置。其他关键方面（如信源与信道编码、采样与量化）代表有价值的未来研究方向，因篇幅限制本文不涉及。后续各节先分别在单天线系统的第 III 节与第 IV 节深入讨论随机通信信号的 ISAC 传输，再在第 V 节把分析推广到 MIMO-ISAC 系统。

## III. 以通信为中心的 ISAC 传输

本节研究图 1 基本 P2P ISAC 模型的具体信号处理方法，考虑由 ISAC Tx、通信 Rx 与感知 Rx 组成的单天线 ISAC 系统。ISAC Tx 发射面向通信 Rx 的随机数据载荷信号；同时感知 Rx 捕获该信号经多个目标反射的回波，并随后估计目标的时延参数。与第 II-C 节的系统设置与假设一致，信息符号向量 $\mathbf s$ 对通信 Rx 未知，但对感知 Rx 完全已知。

### A. 以通信为中心的 ISAC 信号模型

考虑如下通用基带 ISAC 信号：
$$
\tilde x(t)=\sum_{n=0}^{N-1}x_np(t-nT),\tag{27}
$$
其中 $T$ 为符号时长，$p(t)$ 为脉冲成形滤波器的冲激响应，$\mathbf x=[x_0,x_1,\ldots,x_{N-1}]^T\in\mathbb C^{N\times1}$ 表示 $N$ 个离散时域样本，由
$$
\mathbf x=\mathbf U\mathbf s=\sum_{n=0}^{N-1}s_n\mathbf u_n\tag{28}
$$
生成，其中 $\mathbf s=[s_0,s_1,\ldots,s_{N-1}]^T\in\mathbb C^{N\times1}$ 表示 $N$ 个独立取自星座 $\mathcal S$ 的数据符号，$\mathbf U=[\mathbf u_0,\mathbf u_1,\ldots,\mathbf u_{N-1}]\in\mathcal U(N)$ 为 $N$ 维酉矩阵，表示时域的正交归一模基。注意信号模型（27）是第 II-B 节信息论模型的实际实现。三个部件的假设如下。

**1) 星座。** 全文采用零均值、零伪方差、单位功率的旋转不变星座 $\mathcal S$，定义为
$$
\mathbb E(s)=0,\quad\mathbb E(s^2)=0,\quad\mathbb E(|s|^2)=1,\quad\forall s\in\mathcal S.\tag{29}
$$
需要指出，最常用的星座（如 PSK、QAM、APSK）都满足这些条件；两个例外是 BPSK 与 8-QAM，它们在现代蜂窝无线网络中很少使用。此外星座不必均匀分布：若采用概率星座整形（PCS）技术，每个点可以不同概率发送，这将在后文讨论。

**2) 调制基。** 承载信息符号的调制基 $\mathbf U\in\mathcal U(N)$ 在更广义语境下常称为"波形"，$\mathcal U(N)$ 表示 $N$ 阶酉群。为清楚起见，下面列出几个典型例子：

- **SC 调制**：$\mathbf U=\mathbf I_N$。此时信令基仅由 $N$ 个时域 Kronecker-delta 函数构成，形成单载波（SC）信号。
- **OFDM 调制**：$\mathbf U=\mathbf F_N^H$，其中 $\mathbf F_N\in\mathbb C^{N\times N}$ 为 $N$ 维 DFT 矩阵。此时信令基由 $N$ 个正交正弦函数构成，它们在频域也是 Kronecker-delta 函数。
- **CDMA 调制**：$\mathbf U=\mathbf C_N$，其中 $\mathbf C_N\in\mathbb C^{N\times N}$ 为 $N$ 维 Hadamard 矩阵，对应 CDMA2000 中广泛使用的 Walsh 码 [72]。
- **AFDM 调制**：$\mathbf U=\boldsymbol\Lambda_{c_1}^H\mathbf F_N^H\boldsymbol\Lambda_{c_2}^H$，其中 $\boldsymbol\Lambda_c=\operatorname{Diag}\left(1,e^{-j2\pi c_1^2},\ldots,e^{-j2\pi c_N^2}\right)$。该配置使 $\mathbf U$ 成为具有可调参数 $c_1$、$c_2$ 的逆离散仿射 Fourier 变换（IDAFT）矩阵，符号置于仿射 Fourier 变换（AFT）域 [19]。
- **OTFS 调制**：$\mathbf U=\mathbf F_{N_1}^H\otimes\mathbf I_{N_2}$。此时符号映射到时延—多普勒（DD）域，其中 $N_1$、$N_2$ 分别表示占用时隙数与子载波数；OTFS 本质上是二维调制方案 [73]。

为便于在频域高效处理信号，假设在信号 $\mathbf x$ 上添加循环前缀（CP），且其长度大于目标或通信路径的最大时延。

**3) 脉冲成形滤波器。** 脉冲成形滤波器通过消除符号间干扰（ISI）并限制信令带宽，在现代无线通信系统中起关键作用。这里采用单边带宽为 $B$、滚降因子为 $\alpha$ 的带限 Nyquist 原型脉冲，符号时长为 $T=\frac{1+\alpha}{2B}$。Nyquist 脉冲保证符号间零 ISI，可表示为
$$
\tilde p(nT)=\begin{cases}1,&n=0\\0,&n\neq0\end{cases},\quad\forall n\in\mathbb Z,\tag{30}
$$
其中 $\tilde p(\tau)=\int p(t)p^{*}(t-\tau)dt$ 为 $p(t)$ 的 ACF。它等价于频域条件（折叠谱准则）[57]
$$
\sum_{m=-\infty}^{\infty}g\left(f+\frac mT\right)=T,\tag{31}
$$
其中 $g(f)$ 为 $\tilde p(\tau)$ 的 Fourier 变换，也是脉冲 $p(t)$ 的平方频谱。

### B. 通信与感知的信号处理

本小节详述 S&C 的信号处理流程（亦见图 5）。不失一般性，把通信信道与感知信道建模为分别含 $I$ 条路径与 $Q$ 个目标的线性时不变（LTI）多径信道，其时域冲激响应为
$$
h_c(t)=\sum_{i=1}^{I}\beta_i\delta(t-\tau_{c,i}),\qquad h_s(t)=\sum_{q=1}^{Q}\gamma_q\delta(t-\tau_{s,q}),\tag{32}
$$
其中 $\delta(t)$ 为 Dirac-delta 函数，$\beta_i$ 与 $\gamma_q$ 分别表示第 $i$ 条通信路径与第 $q$ 个感知目标的复幅度，$\tau_{c,i}$ 与 $\tau_{s,q}$ 为相应的时延。为简单起见，此处省略多普勒相移对两个信道的影响，留待后文讨论。注意 $h_c(t)$ 与 $h_s(t)$ 可能因几何环境而呈现一定相关性，这意味着通信路径与感知目标可能部分重叠；这种重叠引出了 S&C 的另一个基本折中，称为子空间折中（ST），因篇幅所限本文不深入讨论其细节，感兴趣的读者可参阅文献 [54]。

**1) 接收信号模型。** 发射 ISAC 信号 $\tilde x(t)$ 后，通信 Rx 与感知 Rx 处的接收信号为
$$
y_c(t)=h_c(t)*\tilde x(t)+z_c(t)=\sum_{i=1}^{I}\beta_i\sum_{n=0}^{N-1}x_np(t-nT-\tau_{c,i})+z_c(t),\tag{33a}
$$
$$
y_s(t)=h_s(t)*\tilde x(t)+z_s(t)=\sum_{q=1}^{Q}\gamma_q\sum_{n=0}^{N-1}x_np(t-nT-\tau_{s,q})+z_s(t),\tag{33b}
$$
其中 $z_c(t)$ 与 $z_s(t)$ 表示零均值白高斯噪声，方差分别为 $\sigma_c^2$ 与 $\sigma_s^2$。对通信 Rx，目标是用信道 $h_c(t)$ 的估计从式（33a）检测嵌入 $\tilde x(t)$ 的信息符号 $\mathbf s$；相反，感知 Rx 的目标是利用 $\tilde x(t)$ 的先验知识，从式（33b）的观测中检测 $Q$ 个目标并提取相应的时延参数 $\{\tau_{s,q}\}$。

**2) 通信信号处理。** 先讨论通信 Rx 侧的处理过程。收到 $y_c(t)$ 后，通信 Rx 用脉冲成形滤波器进行逐符号匹配滤波（MF），得到输出信号 [57]
$$
\tilde y_c(\tau)=\int y_c(t)p^{*}(t-\tau)dt.\tag{34}
$$
在 $\tau=\ell T$（$\ell\in\mathbb Z$）处采样得
$$
\tilde y_c(\ell T)=\sum_{i=1}^{I}\beta_i\sum_{n=0}^{N-1}x_n\tilde p_{\ell-n,\tau_{c,i}}+\tilde z_{c,\ell},\tag{35}
$$
其中 $\tilde p_{k,\tau}:=\tilde p(kT-\tau)$，$\tilde z_{c,\ell}=\int z_c(t)p^{*}(t-\ell T)dt$ 为输出噪声，仍服从高斯分布。把 $\tilde{\mathbf y}_c$ 定义为离散 MF 输出向量，其第 $(\ell+1)$ 个元素对应 $\tilde y_c(\ell T)$，则
$$
\tilde{\mathbf y}_c=\sum_{i=1}^{I}\beta_i\tilde{\mathbf P}_i\mathbf x+\tilde{\mathbf z}_c:=\mathbf H_c\mathbf U\mathbf s+\tilde{\mathbf z}_c,\tag{36}
$$
其中 $\tilde{\mathbf z}_c=[\tilde z_{c,0},\tilde z_{c,1},\ldots,\tilde z_{c,N-1}]^T$，且
$$
\tilde{\mathbf P}_i=\begin{bmatrix}\tilde p_{0,\tau_{c,i}}&\tilde p_{-1,\tau_{c,i}}&\cdots&\tilde p_{-N+1,\tau_{c,i}}\\\tilde p_{1,\tau_{c,i}}&\tilde p_{0,\tau_{c,i}}&\cdots&\tilde p_{-N+2,\tau_{c,i}}\\\vdots&\vdots&\ddots&\vdots\\\tilde p_{N-1,\tau_{c,i}}&\tilde p_{N-2,\tau_{c,i}}&\cdots&\tilde p_{0,\tau_{c,i}}\end{bmatrix}\tag{37}
$$
为 Toeplitz 矩阵，因而等效信道矩阵 $\mathbf H_c$ 也是 Toeplitz 的。若在时域序列 $\mathbf x$ 上添加 CP，则从接收信号中去除 CP 后 $\mathbf H_c$ 近似为循环矩阵。可观察到由于 $\mathbf H_c\mathbf U$ 不是对角阵，$\mathbf s$ 各元素之间存在 ISI。为恢复信息符号，需要通过信道均衡消除 ISI，通常先用已知导频符号估计 $\mathbf H_c$，再基于估计实现均衡器。为降低信号处理复杂度，可采用 OFDM 调制，即令 $\mathbf U=\mathbf F_N^H$，于是
$$
\begin{aligned}
\tilde{\mathbf y}_c^{\mathrm{OFDM}}&=\mathbf H_c\mathbf F_N^H\mathbf s+\tilde{\mathbf z}_c\\
&=\sqrt N\mathbf F_N^H\operatorname{Diag}\left(\mathbf F_N\mathbf h_c\right)\mathbf F_N\mathbf F_N^H\mathbf s+\tilde{\mathbf z}_c\\
&=\sqrt N\mathbf F_N^H\operatorname{Diag}\left(\mathbf F_N\mathbf h_c\right)\mathbf s+\tilde{\mathbf z}_c,
\end{aligned}\tag{38}
$$
其中利用了循环矩阵可被 DFT 矩阵对角化的性质 [74]，$\mathbf h_c$ 表示 $\mathbf H_c$ 的第一列。相应地，对式（38）做 DFT 即可去除 ISI：
$$
\mathbf F_N\tilde{\mathbf y}_c^{\mathrm{OFDM}}=\sqrt N\operatorname{Diag}\left(\mathbf F_N\mathbf h_c\right)\mathbf s+\mathbf F_N\tilde{\mathbf z}_c,\tag{39}
$$
它可方便地按 $N$ 个并行 AWGN 信道处理。

虽然 OFDM 通过把多径信道对角化最小化了符号检测复杂度，其他调制方案（如 SC、CDMA、AFDM 与 OTFS）也可用于满足特定应用需求，例如在高移动性信道中确保可靠通信。

**3) 感知信号处理。** 现在转向处理感知接收信号（33b）以提取目标时延参数，第一步同样是对观测回波 $y_s(t)$ 做 MF。与通信情形形成鲜明对比，感知所用匹配滤波器是发射基带信号 $\tilde x(t)$ 而非脉冲成形滤波器 $p(t)$，从而输出 [75]
$$
\begin{aligned}
\tilde y_s(\tau)&=\int y_s(t)\tilde x^{*}(t-\tau)dt\\
&=\sum_{q=1}^{Q}\gamma_q\int\tilde x(t-\tau_{s,q})\tilde x^{*}(t-\tau)dt+\int z_s(t)\tilde x^{*}(t-\tau)dt\\
&=\sum_{q=1}^{Q}\gamma_qR(\tau-\tau_{s,q})+\tilde z_s(\tau),\quad 0\leq\tau\leq NT,
\end{aligned}\tag{40}
$$
其中 $R(\tau)=\int\tilde x(t)\tilde x^{*}(t-\tau)dt$ 为 ISAC 信号 $\tilde x(t)$ 的 ACF，$\tilde z_s(\tau)$ 为输出高斯噪声。值得指出，压缩感知等其他方法也可用于降低采样率、提高分辨率 [76]。为突出随机数据对感知性能的影响，这里采用最基本的 MF 方法测距，更先进算法的研究留作未来工作。

值得注意的是，$\tilde y_s(\tau)$ 可解释为 $Q$ 个时移版本 $R(\tau)$ 的线性组合加噪声，在雷达文献中常称为距离像 [77]。为检测目标，通常在平方 MF 输出 $|\tilde y_s(\tau)|^2$ 中识别 $Q$ 个峰。图 6 给出一个例子：OFDM 信号、16-PSK 星座与根升余弦（RRC）脉冲成形，$Q=3$ 个不同幅度的目标分别位于 10 m、20 m 与 25 m；在 SNR = 0 dB 下用恒虚警率（CFAR）检测器等阈值算法完成目标检测 [77]。为提升感知性能，希望 $|\tilde y_s(\tau)|^2$ 在 $\tau=\tau_q$ 处呈高峰而在其他位置保持低旁瓣，这同时有利于目标检测与估计。

为进一步提升感知性能，可采用相干积分技术有效降低旁瓣与噪声水平。该方案中 ISAC Tx 发送 $M$ 个独立同分布信息符号序列 $\mathbf s^{(0)},\mathbf s^{(1)},\ldots,\mathbf s^{(M-1)}$，即发射 $M$ 个 ISAC 信号 $\tilde x^{(0)}(t),\tilde x^{(1)}(t),\ldots,\tilde x^{(M-1)}(t)$。假设目标参数 $\{\gamma_q\}_{q=1}^Q$ 与 $\{\tau_{s,q}\}_{q=1}^Q$ 在 $M$ 个传输时隙内保持不变，则感知 Rx 可通过对 $M$ 个接收回波做匹配滤波得到 $M$ 个距离像 $\tilde y_s^{(0)}(\tau),\ldots,\tilde y_s^{(M-1)}(\tau)$。相干积分这些 MF 输出得
$$
\frac1M\sum_{m=0}^{M-1}\tilde y_s^{(m)}(\tau)=\frac1M\sum_{q=1}^{Q}\gamma_q\sum_{m=0}^{M-1}R^{(m)}(\tau-\tau_{s,q})+\frac1M\sum_{m=0}^{M-1}\tilde z_s^{(m)}(\tau),\quad 0\leq\tau\leq NT,\tag{41}
$$
其中 $R^{(m)}(\tau)$ 为 $\tilde x^{(m)}(t)$ 的 ACF，$\tilde z_s^{(m)}(\tau)$ 表示第 $m$ 个匹配滤波器的输出噪声。

可观察到式（41）的噪声项被平均，其方差得到降低；此外，整体目标感知性能现在关键取决于相干积分后 ACF 的几何形状，定义为
$$
\bar R(\tau):=\frac1M\sum_{m=0}^{M-1}R^{(m)}(\tau),\quad 0\leq\tau\leq NT.\tag{42}
$$
后文将表明，由于 $M$ 个实现之间的独立性，$\bar R(\tau)$ 的旁瓣电平也得到抑制。由于 ISAC 信号 $\tilde x^{(m)}(t)$ 携带的通信符号具有随机性，$\bar R(\tau)$ 成为随机函数。因此更有必要分析其统计性质而非关注单一实现。特别地，由于 $\bar R(\tau)$ 是复值函数，我们旨在刻画其平方幅度的期望值：
$$
\mathbb E\left(|\bar R(\tau)|^2\right)=\mathbb E\left(\left|\frac1M\sum_{m=0}^{M-1}\int\tilde x^{(m)}(t)\tilde x^{(m)*}(t-\tau)dt\right|^2\right).\tag{43}
$$
后续小节回顾近期关于为一般通信信号推导（43）闭式表达的研究成果，并基于（43）的数学结构给出设计 ISAC 信号的有用洞见。

### C. ISAC 信号 ACF 的刻画

**1) ACF 的离散化。** 为便于分析，先在时间网格 $T_s=\frac TL$ 上离散 ISAC 信号 $\tilde x(t)$，得
$$
\tilde x(kT_s)=\sum_{n=0}^{N-1}x_np(kT_s-nT)=\sum_{n=0}^{N-1}x_n\delta(kT_s-nT)\circledast p(kT_s),\tag{44}
$$
其中 $k=0,1,\ldots,LN-1$，$\circledast$ 表示因添加 CP 而产生的循环卷积。注意需要 $L>1$ 才能刻画脉冲成形对感知性能的影响；若 $L=1$，由于 Nyquist 脉冲的零 ISI 性质，离散化简化为 $\mathbf x=\mathbf U\mathbf s$，但这样就忽略了脉冲成形滤波器对 ACF 主瓣与旁瓣的贡献。

定义 $p_k:=p(kT_s)$、$\tilde x_k:=\tilde x(kT_s)$，则脉冲与基带信号的离散版本可表示为向量 $\mathbf p=[p_0,p_1,\ldots,p_{LN-1}]^T$ 与 $\tilde{\mathbf x}=[\tilde x_0,\tilde x_1,\ldots,\tilde x_{LN-1}]^T$，脉冲能量归一化为 $\|\mathbf p\|^2=1$。在实际通信 Tx 中，脉冲成形可通过上采样与插值过程数字化实现，把（44）改写为向量形式
$$
\tilde{\mathbf x}=\mathbf P\mathbf x_{\mathrm{up}},\tag{45}
$$
其中
$$
\mathbf x_{\mathrm{up}}=\left[x_0,\mathbf 0_{L-1}^T,x_1,\mathbf 0_{L-1}^T,\ldots,x_{N-1},\mathbf 0_{L-1}^T\right]^T,\tag{46}
$$
$\mathbf P\in\mathbb C^{LN\times LN}$ 为循环矩阵
$$
\mathbf P=\begin{bmatrix}p_0&p_{LN-1}&\cdots&p_1\\p_1&p_0&\cdots&p_2\\\vdots&\vdots&\ddots&\vdots\\p_{LN-1}&p_{LN-2}&\cdots&p_0\end{bmatrix},\tag{47}
$$
它在发射前把 $\mathbf x$ 插值为更高分辨率。相应地，ACF $R(\tau)$ 的离散版本为
$$
R_k=\tilde{\mathbf x}^H\mathbf J_k\tilde{\mathbf x}=\mathbf x_{\mathrm{up}}^H\mathbf P^H\mathbf J_k\mathbf P\mathbf x_{\mathrm{up}},\quad k=0,1,\ldots,LN-1,\tag{48}
$$
其中 $\mathbf J_k\in\mathbb C^{LN\times LN}$ 为第 $k$ 个周期时移矩阵，定义为 [78]
$$
\mathbf J_k=\begin{bmatrix}\mathbf 0&\mathbf I_{LN-k}\\\mathbf I_k&\mathbf 0\end{bmatrix},\tag{49}
$$
且
$$
\mathbf J_{-k}=\mathbf J_{LN-k}=\mathbf J_k^T=\begin{bmatrix}\mathbf 0&\mathbf I_k\\\mathbf I_{LN-k}&\mathbf 0\end{bmatrix}.\tag{50}
$$
注意 $\mathbf J_k$ 的周期性同样源于 CP 的添加。由此，相干积分 ACF（42）的离散版本为
$$
\bar R_k=\frac1M\sum_{m=0}^{M-1}\tilde{\mathbf x}^{(m)H}\mathbf J_k\tilde{\mathbf x}^{(m)}.\tag{51}
$$

**2) ACF 的"海中冰山"结构。** 为揭示随机信令下以通信为中心的 ISAC 传输，文献 [58] 推导了 $|\bar R_k|^2$ 期望的闭式：
$$
\begin{aligned}
\mathbb E\left(|\bar R_k|^2\right)&=\underbrace{N\left|\tilde{\mathbf f}_{k+1}^{H}\tilde{\mathbf g}_k\right|^2}_{\text{冰山}}+\underbrace{\frac1M\left\{\|\tilde{\mathbf g}_k\|^2+(\kappa-2)N\left\|\tilde{\mathbf V}^{T}\left(\tilde{\mathbf g}_k\odot\tilde{\mathbf f}_{k+1}^{*}\right)\right\|^2\right\}}_{\text{海平面}}\\
&=\left|\mathbb E(\bar R_k)\right|^2+\operatorname{var}(\bar R_k),\quad k=0,1,\ldots,LN-1,
\end{aligned}\tag{52}
$$
其中 $\tilde{\mathbf f}_{k+1}\in\mathbb C^{N\times1}$ 包含 $LN$ 阶 DFT 矩阵 $\mathbf F_{LN}$ 第 $(k+1)$ 列的前 $N$ 个元素，$\tilde{\mathbf V}\in\mathbb R^{N\times N}$ 定义为
$$
\tilde{\mathbf V}=(\mathbf F_N\mathbf U)\odot\left(\mathbf F_N^{*}\mathbf U^{*}\right),\tag{53}
$$
其中 $\mathbf U$ 为调制基。由于 $\tilde{\mathbf V}$ 由酉矩阵 $\mathbf F_N\mathbf U$ 的逐元素平方生成，它是非负实元素的双随机矩阵 [79]，每行每列之和为 1。此外，$\kappa$ 表示所采用星座 $\mathcal S$ 的峰度，定义为 [59]
$$
\kappa:=\frac{\mathbb E\left\{|s-\mathbb E(s)|^4\right\}}{\mathbb E\left\{|s-\mathbb E(s)|^2\right\}^2}=\mathbb E(|s|^4),\quad\forall s\in\mathcal S,\tag{54}
$$
即星座归一化的四阶矩。最后，由折叠谱准则与滚降因子 $\alpha\leq1$，向量 $\tilde{\mathbf g}_k\in\mathbb C^{N\times1}$ 由脉冲 $p$ 的平方频谱按如下方式确定：
$$
\tilde{\mathbf g}_k=\mathbf g+\left(\mathbf 1_N-\mathbf g\right)e^{-j2\pi\frac kL},\tag{55}
$$
其中 $\mathbf g=[g_0,g_1,\ldots,g_{N-1}]^T$ 包含平方频谱 $N\left(\mathbf F_{LN}\mathbf p\right)\odot\left(\mathbf F_{LN}^{*}\mathbf p^{*}\right)\in\mathbb C^{LN\times1}$ 的前 $N$ 个样本。值得注意的是，三种信令模块——调制基、星座与脉冲成形——对 ACF 形状的影响都被式（52）很好地捕捉。

式（52）揭示了有趣的"海中冰山"结构。"冰山"部分代表 $\bar R_k$ 均值的平方，可以严格证明它对应脉冲本身的平方 ACF [58]：
$$
N\left|\tilde{\mathbf f}_{k+1}^{H}\tilde{\mathbf g}_k\right|^2=\left|\mathbf p^H\mathbf J_k\mathbf p\right|^2,\quad k=0,1,\ldots,LN-1.\tag{56}
$$
该"冰山"分量决定了（52）的整体形状；而"海平面"由 $\bar R_k$ 的方差驱动，主要来自通信符号的随机性。通过对 $M$ 个独立同分布 ISAC 信号的 $M$ 个 MF 输出做相干积分，"海平面"可按因子 $M$ 显著降低。

**3) 示例。** 图 7 给出一个例子：OFDM 信令、16-QAM 星座、$\alpha=0.35$ RRC 脉冲成形、过采样比 $L=10$，比较不同 $M$ 值下的平均平方 ACF。值得注意的是，随机 OFDM 信号的 ACF 在主瓣附近与脉冲的 ACF 高度吻合，代表"冰山"的"尖端"；超出该区域后，旁瓣由"海平面"分量主导。把相干积分次数从 $M=1$ 增加到 100 再到 1000，可观察到"海平面"分别下降 20 dB 与 30 dB，从而在平均平方 ACF 中显露更多"冰山"分量。

基于这些观察，下面综述针对随机 ISAC 信号在调制基、星座设计与脉冲成形方面的优化进展。这些改进旨在保持最优通信质量的同时提升感知性能，或在 S&C 之间建立可伸缩的折中。

## IV. 随机 ISAC 信号的波形设计

本节给出以通信为中心的 ISAC 系统三个核心部件的设计准则，重点是重塑随机 ISAC 信号 ACF 的统计性质。具体目标是在 MF 框架下最小化式（51）中 $\bar R_k$ 的平均峰均旁瓣电平比（peak-to-sidelobe level ratio, PSLR），从而提升距离域的多目标感知性能；利用随机信号估计多普勒与角度等其他关键参数留作未来研究。

根据文献 [58]、[59]，任意调制基、星座映射与脉冲成形滤波器下 ACF 的平均主瓣电平可闭式表达为
$$
\mathbb E(|\bar R_0|^2)=N^2+\frac{(\kappa-1)N}{M},\tag{57}
$$
表明主瓣电平仅由星座峰度决定。此外，当相干积分次数 $M$ 足够大时，峰度的影响可忽略，平均主瓣电平近似为常数 $N^2$。由此，只需优化平均旁瓣电平，可表述为如下通用优化问题：
$$
\min_{\mathbf U\in\mathcal U(N),\ P_s(s),\ 0\leq\mathbf g\leq1}\ \mathbb E(|\bar R_k|^2),\quad\forall k\in\mathcal K_{SL},\tag{58}
$$
其中 $\mathbf U$ 与 $\mathbf g$ 分别为上述调制基与脉冲平方频谱，$P_s(s)$ 表示输入星座分布，$\mathcal K_{SL}$ 指旁瓣区域。虽然求（58）的全局最优解仍十分困难，下面分别详述各部件的通用设计方法。

### A. 调制基设计

由式（52）可见，调制基仅通过"海平面"部分中的平方范数项 $\left\|\tilde{\mathbf V}^T\left(\tilde{\mathbf g}_k\odot\tilde{\mathbf f}_{k+1}^{*}\right)\right\|^2$ 影响旁瓣电平。对给定的脉冲成形滤波器与星座，式（58）简化为
$$
\min_{\mathbf U\in\mathcal U(N)}(\kappa-2)\left\|\tilde{\mathbf V}^{T}\left(\tilde{\mathbf g}_k\odot\tilde{\mathbf f}_{k+1}^{*}\right)\right\|^2\quad\text{s.t.}\ \tilde{\mathbf V}=(\mathbf F_N\mathbf U)\odot\left(\mathbf F_N^{*}\mathbf U^{*}\right).\tag{59}
$$
显然，最优调制基取决于 $(\kappa-2)$ 的符号，该量也称为超峰度（excess kurtosis）[80]。值得注意的是，若星座服从标准复高斯分布，即 $s\sim\mathcal{CN}(0,1)$，则峰度等于 2；此时每个时滞 $k$ 处的平均旁瓣电平与所选调制基无关，因为标准高斯分布在酉变换下不变。受此启发，我们把星座分为两类：亚高斯（$\kappa<2$）与超高斯（$\kappa>2$）。需要指出，常用星座（如 QAM 与 PSK）都是亚高斯，其峰度值汇总于表 I。同时，超高斯星座在高能效或采用非相干通信方法的场景中可能具有优势 [81]—[83]，典型例子包括索引调制与半径指数增长的 APSK 星座 [59]。

**1) 亚高斯星座的测距最优调制。** 先讨论亚高斯星座的调制设计。此时问题（59）退化为
$$
\max_{\mathbf U\in\mathcal U(N)}\left\|\tilde{\mathbf V}^{T}\left(\tilde{\mathbf g}_k\odot\tilde{\mathbf f}_{k+1}^{*}\right)\right\|^2\quad\text{s.t.}\ \tilde{\mathbf V}=(\mathbf F_N\mathbf U)\odot\left(\mathbf F_N^{*}\mathbf U^{*}\right).\tag{60}
$$
虽然问题（60）一般非凸，但文献 [58] 证明其全局最优解具有如下结构：
$$
\mathbf U_{\mathrm{sub}}^{\star}=\mathbf F_N^{H}\boldsymbol\Pi\operatorname{Diag}(\boldsymbol\theta),\tag{61}
$$
其中 $\boldsymbol\Pi$ 为任意 $N$ 阶置换矩阵，$\boldsymbol\theta\in\mathbb C^{N\times1}$ 可为任意单位模元素向量。这对应 OFDM 调制，并允许子载波上的置换与相移。回顾 $\tilde{\mathbf V}$ 是双随机矩阵，式（61）的最优性通过证明当 $\tilde{\mathbf V}$ 为任意实置换矩阵 $\boldsymbol\Pi$ 时（60）的目标函数最大而建立；该结果利用 $\ell_2$ 范数的 Schur 凸性与优序（majorization）概念导出 [84]—[86]，更多技术细节见 [58]。总体而言，式（61）表明：对亚高斯星座，OFDM 在每个时滞处取得最低的平均测距旁瓣。

**2) 超高斯星座的测距最优调制。** 现转向 $\kappa>2$ 的超高斯星座。此时问题（59）变为
$$
\min_{\mathbf U\in\mathcal U(N)}\left\|\tilde{\mathbf V}^{T}\left(\tilde{\mathbf g}_k\odot\tilde{\mathbf f}_{k+1}^{*}\right)\right\|^2\quad\text{s.t.}\ \tilde{\mathbf V}=(\mathbf F_N\mathbf U)\odot\left(\mathbf F_N^{*}\mathbf U^{*}\right).\tag{62}
$$
再次利用 $\ell_2$ 范数的 Schur 凸性并采用类似论证，容易证明当双随机矩阵为均匀矩阵，即 $\tilde{\mathbf V}=\frac1N\mathbf 1\mathbf 1^T$ 时目标最小。相应地，最优调制基取
$$
\mathbf U_{\mathrm{super}}^{\star}=\boldsymbol\Pi\operatorname{Diag}(\boldsymbol\theta),\tag{63}
$$
对应 SC 调制，并允许时域符号的任意置换与相移。总体而言，式（63）表明：对超高斯星座，SC 在每个时滞处取得最低的平均测距旁瓣。

**3) 示例。** 图 8 用标准 16-QAM（峰度 1.32）验证亚高斯星座下 OFDM 的最优性，比较三种调制基下的平均平方 ACF：OFDM、SC 与 CDMA2000（$\mathbf U$ 为 Hadamard 矩阵），发送 $N=128$ 个独立同分布符号，过采样比 $L=10$，采用 $\alpha=0.35$ 的 RRC 脉冲成形。正如理论结果所预测，图 8 表明 OFDM 在每个时滞处产生最低旁瓣，比 SC 与 CDMA 均改善 5 dB。此外，对 $M=100$ 个独立同分布 MF 输出进行相干积分后，所有信令方案在"海平面"区域的旁瓣电平都下降 20 dB。

**4) 关于 OFDM/SC 最优性的讨论。** 上述结果为以通信为中心的 ISAC 系统的调制格式提供了有价值的设计洞见。虽然这些发现在数学上是严格的，但进一步理解 OFDM/SC 的最优性需要回答一个关键问题：这些数学结果背后的物理解释是什么？

为给出物理洞见，我们从 Fourier 对偶性与中心极限定理（CLT）的角度考察该问题。考虑如图 9a 所示的无限带宽信号，其幅度谱完全平坦。根据 Fourier 对偶性，这意味着其 ACF 在时延域是 Dirac-delta 函数——这是测距的理想感知信号，因为它产生无模糊的完美 MF 输出。然而如图 9b 所示，通信数据载荷中的随机起伏导致 ISAC 信号平方谱的波动，进而在 ACF 中产生随机旁瓣。直观上，这说明最小化 ISAC 信号的平均测距旁瓣电平，等价于最小化其频域表示的波动；该波动可用平方谱的方差量化，并与信号的频域峰度成正比。因此，降低测距旁瓣可通过最小化信号的频域峰度实现。

为深入探讨，我们重新考察图 9c 所示的 ISAC 调制基设计。如式（28）的通用模型所述，调制基可解释为对独立同分布符号序列 $\mathbf s$ 施加酉旋转 $\mathbf U$；相应地，频域数字样本为 $\mathbf F_N\mathbf U\mathbf s$，其中乘积 $\mathbf F_N\mathbf U$ 仍为酉矩阵。根据 CLT，对具有独立同分布元素的随机向量施加线性变换，所得分布渐近趋于高斯分布。因此，任何酉变换 $\mathbf F_N\mathbf U$ 都会提高独立同分布亚高斯符号（如 QAM 与 PSK）的峰度，同时降低独立同分布超高斯符号的峰度。所以，当 $\mathbf s$ 为亚高斯时，最小化向量 $\mathbf F_N\mathbf U\mathbf s$ 的峰度的最优策略是保留其峰度，即令 $\mathbf F_N\mathbf U=\mathbf I_N$，对应 OFDM 调制；反之，若 $\mathbf s$ 为超高斯，由于任何酉变换都会降低其峰度，最优策略是对 $\mathbf s$ 做最大化旋转，此时合适的变换为 $\mathbf F_N\mathbf U=\mathbf F_N$，对应 SC 调制。

### B. 星座设计

现在把注意力从调制格式转向星座设计。如式（52）所述，$\mathbb E(|\bar R_k|^2)$ 仅通过峰度依赖星座。对给定的调制格式与脉冲成形滤波器，由于 $\kappa\geq1$，任何 PSK 星座都能取得最小峰度（进而最小旁瓣）；但相比同阶 QAM，PSK 的通信速率可能更低，这再次凸显 ISAC 系统中的 DRT [53]。

为平衡通信可达速率与感知测距旁瓣电平，一种实用方法是星座整形 [87]、[88]，它最初是为提升数字通信系统的频谱与能量效率而设计的。星座整形技术可大致分为两类：概率星座整形（PCS）与几何星座整形（GCS）。PCS 通过分布匹配器修改星座的概率密度函数（PDF），把比特流映射到期望的星座概率分布；GCS 则直接优化星座符号的幅度与相位。两类技术都能重塑所采用星座的统计特性。

**1) 面向 ISAC 的概率星座整形。** 对 ISAC 星座设计问题，我们聚焦 PCS 方法，它可表述为在测距旁瓣电平门限下最大化通信 MI 的优化问题 [60]：
$$
\max_{P_s(s)}\ I(\tilde{\mathbf y}_c;\mathbf s)\quad\text{s.t.}\ \mathbb E(|s|^4)\leq c_0,\ \mathbb E(|s|^2)=1,\ \mathbb E(s)=0,\ \mathbb E(s^2)=0,\ s\in\mathcal S,\tag{64}
$$
其中 $P_s(s)$ 表示星座分布，$\tilde{\mathbf y}_c$ 表示通信接收端的 MF 输出信号，$c_0\geq1$ 为预先确定的常数，用于控制星座峰度、确保平均测距旁瓣保持在可接受范围内；字母表 $\mathcal S$ 表示离散星座点集合，必须满足式（29）的归一化功率与旋转对称约束。

问题（64）本质上是泛函优化问题，因为优化变量 $P_s(s)$ 是定义在 $\mathcal S$ 上的函数。事实上，问题（64）可视为式（11）C-D 折中问题的一个特例，其中峰度约束充当感知代价函数。然而由于离散字母表 $\mathcal S$，目标函数中的 MI 没有闭式表达。为解决该挑战，文献 [60] 针对 OFDM 调制下的 $M_s$ 阶 QAM 星座提出了一种基于优化的 PCS 方法。此时多径通信信道被对角化为 $N$ 个并行正交 AWGN 信道，从而可聚焦于每个单标量 AWGN 信道的 MI，记为 $I(y_c;s)$。

令 $\mathbf p_s=[p_{s,1},p_{s,2},\ldots,p_{s,M_s}]^T$ 表示所考虑 $M_s$ 阶 QAM 星座的概率分布向量，$s_m$ 为第 $m$ 个 QAM 符号。按定义，MI 可表示为 [89]
$$
\begin{aligned}
I(y_c;s)&=\sum_{m=1}^{M_s}p_{s,m}\int p(y_c|s_m)\log\frac{p(y_c|s_m)}{p(y_c)}dy_c\\
&=\max_{q(s_m|y_c)}\underbrace{\sum_{m=1}^{M_s}p_{s,m}\int p(y_c|s_m)\log\frac{q(s_m|y_c)}{p(y_c)}dy_c}_{\mathcal F(\mathbf p_s,q_{s|y_c})},
\end{aligned}\tag{65}
$$
其中 $q(s_m|y_c)$ 为从接收信号集 $\mathcal Y_c$ 到星座字母表 $\mathcal S$ 的概率转移函数，$q_{s|y_c}$ 为其离散化形式。于是优化问题（64）可改写为 [60]
$$
\max_{\mathbf p_s}\max_{q_{s|y_c}}\mathcal F(\mathbf p_s,q_{s|y_c})\quad\text{s.t.}\ \sum_{m=1}^{M_s}p_{s,m}|s_m|^4\leq c_0,\ \sum_{m=1}^{M_s}p_{s,m}|s_m|^2=1,\ \sum_{m=1}^{M_s}p_{s,m}s_m=0,\ \sum_{m=1}^{M_s}p_{s,m}s_m^2=0,\ \sum_{m=1}^{M_s}p_{s,m}=1,\ p_{s,m}\geq0,\ \forall m,\tag{66}
$$
其中最后两个约束是因为 $\mathbf p_s$ 是概率单纯形上的点。这里 $\mathcal F(\mathbf p_s,q_{s|y_c})$ 关于 $\mathbf p_s$ 与 $q_{s|y_c}$ 联合凹，且所有约束关于概率向量 $\mathbf p_s$ 都是线性的，因此是凸规划。利用这一事实，文献 [60] 提出了改进的 Blahut–Arimoto（MBA）算法：构造（66）的 Lagrange 乘子，交替迭代求解 $\mathbf p_s$ 与 $q_{s|y_c}$，MBA 方法可确保高效收敛到全局最优。

**2) 示例。** 图 10 给出说明 PCS 方法有效性的例子。图 10a 显示 16-QAM 与 64-QAM 星座在不同峰度门限 $c_0$ 下的最优 PCS 结果，每个点的概率用颜色深浅表示。随着峰度门限降低，模值接近或恰为单位模的符号以更高概率发送，而位于较大或较小圆上的符号使用概率降低。这与 DRT 理论一致：感知偏好恒模星座。这不可避免地降低通信 MI，从而与通信速率形成平滑折中。注意降低 ACF 旁瓣电平可提升距离域中的弱目标检测性能，因为强杂波旁瓣会显著干扰甚至掩盖弱目标的主瓣。基于这一认识，图 10b 展示 64-QAM 在 OFDM 调制下、不同发射 SNR 时的显式 S&C 性能，突出在强杂波环境下感知弱目标可达的通信速率与检测概率。通过调节 $c_0$，PCS 方法提供 S&C 性能度量之间的可伸缩折中，显著优于标准均匀分布 64-QAM 与 64-PSK 星座之间的朴素时间共享方案。

### C. 脉冲成形设计

本节最后讨论在给定星座与调制基下 ISAC 的脉冲成形设计方法。细看式（52）可见，$\mathbb E(|\bar R_k|^2)$ 是 $\tilde{\mathbf g}_k$ 的凸二次函数，因而关于脉冲平方频谱（向量 $\mathbf g$）是凸的。因此可在 $\mathbf g$ 的可行集内最小化旁瓣区域 $\mathcal K_{SL}$ 内的旁瓣电平。

**1) 通用脉冲成形设计。** 先讨论 $\mathbf g$ 的约束。显然式（55）隐含满足折叠谱准则（31），保证脉冲的 Nyquist 性质从而消除 ISI，这确保通信性能不受影响。此外，脉冲滚降因子 $\alpha\in[0,1]$ 意味着 $\mathbf g$ 的 $(1-\alpha)N$ 个元素为 0 或 1。令 $N_\alpha=\alpha N$，并假设 $N-N_\alpha$ 为偶数，这些约束可表示为
$$
g_n=\begin{cases}0,&\text{若 }0\leq n\leq\dfrac{N-N_\alpha}{2}-1,\\[4pt]1,&\text{若 }\dfrac{N+N_\alpha}{2}\leq n\leq N-1.\end{cases}\tag{67}
$$
此外，为保证滚降部分单调递增，施加约束
$$
g_{n+1}-g_n\geq0,\quad\frac{N-N_\alpha}{2}\leq n\leq\frac{N+N_\alpha}{2}-2.\tag{68}
$$
最后，脉冲功率已归一化，给出约束
$$
\sum_{n=0}^{N-1}g_n=\frac N2.\tag{69}
$$
因此通用脉冲成形问题可表述为 [61]
$$
\min_{0\leq\mathbf g\leq1}\ \mathbb E(|\bar R_k|^2),\quad\forall k\in\mathcal K_{SL}\qquad\text{s.t.}\ (67)-(69),\tag{70}
$$
这是一个线性约束凸 Pareto 问题。

**2) 冰山整形。** 为进一步简化问题，注意到当相干积分次数 $M$ 足够大时，$\mathbb E(|\bar R_k|^2)$ 的几何形状主要由"冰山"部分决定。基于此观察，可专注于整形"冰山"，即脉冲成形滤波器本身的平方 ACF，而不必同时最小化"冰山"与"海平面"两部分的旁瓣。此时目标是最小化冰山在区域 $\mathcal K_{SL}$ 内的旁瓣之和，或该区域内的最大旁瓣，得到 [58]
$$
\min_{0\leq\mathbf g\leq1}\ \sum_{k\in\mathcal K_{SL}}\left|\tilde{\mathbf f}_{k+1}^{H}\tilde{\mathbf g}_k\right|^2\quad\text{或}\quad\max_{k}\left|\tilde{\mathbf f}_{k+1}^{H}\tilde{\mathbf g}_k\right|^2\qquad\text{s.t.}\ (67)-(69),\tag{71}
$$
这是一个线性约束凸二次规划，可用现成数值工具高效求解。

**3) 示例。** 图 11 给出带相干积分的 ISAC 脉冲成形滤波器设计示例：应用式（71）的冰山整形技术，最小化区域 [23.74 m, 31.24 m] 内的测距旁瓣之和。ISAC 信号采用 OFDM 调制，携带 $N=128$ 个独立同分布 16-QAM 符号，过采样比 $L=10$。为展示降低"冰山"旁瓣带来的性能提升，考虑两目标检测场景：一个目标位于 20 m，另一个位于 30 m；20 m 目标幅度比 30 m 目标高 43—46 dB。基准为 RRC 脉冲成形，RRC 与冰山整形技术的滚降因子都设为 $\alpha=0.35$。图 11a 给出有/无相干积分的测距均方根误差（RMSE）曲线：在相干积分之前，RRC 与冰山整形的测距性能都很差；但对 $M=1000$ 个独立同分布 MF 输出信号相干积分后，测距 RMSE 降低超过 78%；此外冰山整形方法相比 RRC 对应方案在测距精度上额外提升 50%。这一性能提升也可在图 11b 的相应距离像中清楚看到：无相干积分时，弱目标被"海平面"产生的旁瓣掩盖，导致较大的测距误差；经 1000 次相干积分后，"海平面"旁瓣被有效降低 30 dB，此后测距性能主要由脉冲本身产生的旁瓣决定。此时对采用设计脉冲的 ISAC 信令方案，由于感兴趣距离区域内旁瓣被最小化，弱目标对应的峰可被准确检测；而对 RRC 脉冲成形，弱目标可能因 24.5 m 处的高旁瓣而被错误定位。

## V. 随机 ISAC 信号的 MIMO 预编码

本节把分析从单天线系统推广到多天线情形，为随机信令下的 MIMO ISAC 系统构思专用预编码器。先在第 V-A 节介绍信号模型，再分别在第 V-B 与 V-C 节给出仅感知与 ISAC 系统的预编码设计问题求解算法。

### A. 信号模型与遍历 LMMSE

考虑 P2P 单站 MIMO ISAC 系统：BS 配备 $N_t$ 根发射天线，其感知 Rx 配备 $N_s$ 根接收天线，服务一个具有 $N_c$ 根接收天线的通信用户（CU），同时检测一个或多个目标。假设目标感知在由 $N$ 个时域快拍组成的相干处理区间上进行。沿用式（13）的向量高斯模型，S&C 的 MIMO 信号模型为
$$
\mathbf Y_c=\mathbf H_c\mathbf X+\mathbf Z_c,\tag{72a}
$$
$$
\mathbf Y_s=\mathbf H_s\mathbf X+\mathbf Z_s.\tag{72b}
$$
其中 $\mathbf Y_c\in\mathbb C^{N_c\times N}$ 表示 CU 接收端的接收信号矩阵，$\mathbf Y_s\in\mathbb C^{N_s\times N}$ 表示 BS 感知接收端的回波；$\mathbf H_c\in\mathbb C^{N_c\times N_t}$ 为 P2P MIMO 信道，$\mathbf H_s\in\mathbb C^{N_s\times N_t}$ 为待估计的空域目标冲激响应（TIR）矩阵；$\mathbf Z_c\in\mathbb C^{N_c\times N}$ 与 $\mathbf Z_s\in\mathbb C^{N_s\times N}$ 为加性噪声，各元素分别服从 $\mathcal{CN}(0,\sigma_c^2)$ 与 $\mathcal{CN}(0,\sigma_s^2)$；$\mathbf X\in\mathbb C^{N_t\times N}$ 表示 ISAC 信号矩阵。此外，假设 TIR 矩阵 $\mathbf H_s$ 服从广义平稳随机过程，使统计相关矩阵 $\mathbf R_H=\mathbb E\{\mathbf H_s^H\mathbf H_s\}$ 保持不变。

对模型（72）作几点说明。第一，模型（72）与 MIMO-OFDM 设置下的（33）一致，可解释为子信道上的窄带 S&C 信号；相应地，$\mathbf H_s$ 与 $\mathbf H_c$ 是为每个子载波定义的 S&C 信道矩阵。第二，该模型可视为通用向量高斯模型（13）的特例，待估计参数为感知信道矩阵本身，即 $\boldsymbol\eta=\operatorname{vec}(\mathbf H_s)$。就感知而言，本节只关注每个子载波的 TIR 矩阵 $\mathbf H_s$ 估计，随后将在所有子载波上汇总以进一步提取目标的时延与角度参数。

进一步说明（72）中的 ISAC 信号矩阵 $\mathbf X$，其表示为
$$
\mathbf X=\mathbf W\mathbf S,\tag{73}
$$
其中 $\mathbf W\in\mathbb C^{N_t\times N_t}$ 为待优化的预编码矩阵，$\mathbf S\in\mathbb C^{N_t\times N}$ 为数据载荷矩阵。令 $f(\mathbf W;\mathbf S)$ 表示式（6）所述的通用感知代价函数。本节目标是在给定 $\mathbf S$ 的（统计）信息下设计预编码矩阵 $\mathbf W$，以优化感知代价函数 $f(\mathbf W;\mathbf S)$。

分析并挖掘代价函数 $f(\mathbf W;\mathbf S)$ 的结构，常能为相应优化问题的解提供有价值的洞见 [90]、[91]。为便于讨论，本节以线性最小均方误差（LMMSE）预编码器作为感知代价函数 $f(\mathbf W;\mathbf S)$ 的具体例子。给定 ISAC 信号 $\mathbf X$ 与感知信道相关矩阵 $\mathbf R_H$，著名的 LMMSE 估计器为
$$
\hat{\mathbf H}_s=\mathbf Y_s\left(\mathbf X^H\mathbf R_H\mathbf X+\sigma_s^2N_s\mathbf I_N\right)^{-1}\mathbf X^H\mathbf R_H,\tag{74}
$$
其 MSE 为 [92]
$$
f(\mathbf W;\mathbf S)=\operatorname{Tr}\left\{\left(\mathbf R_H^{-1}+\frac{1}{\sigma_s^2N_s}\mathbf W\mathbf S\mathbf S^H\mathbf W^H\right)^{-1}\right\}.\tag{75}
$$
据此，预编码设计问题可直接表述为
$$
\min_{\mathbf W}\ f(\mathbf W;\mathbf S)\quad\text{s.t.}\ \|\mathbf W\|_F^2\leq P_T,\tag{76}
$$
其中 $P_T$ 为发射功率预算。

传统 MIMO 雷达系统中，（73）的 $\mathbf S$ 为确定性的正交训练信号，满足 $\frac1N\mathbf S\mathbf S^H=\mathbf I_{N_t}$ [93]。此时问题（76）简化为
$$
\min_{\mathbf W}\operatorname{Tr}\left\{\left(\mathbf R_H^{-1}+\frac{1}{\sigma_s^2N_s}\mathbf W\mathbf W^H\right)^{-1}\right\}\tag{77a}
$$
$$
\text{s.t.}\ \|\mathbf W\|_F^2\leq P_T.\tag{77b}
$$
该问题有闭式注水解 [92]：
$$
\mathbf W_{\mathrm{WF}}=\sqrt{\frac{\sigma_s^2N_s}{N}}\mathbf Q\left\{\max\left(\mu_0\mathbf I_{N_t}-\boldsymbol\Lambda^{-1},\mathbf 0\right)\right\}^{\frac12},\tag{78}
$$
其中 $\mathbf Q\boldsymbol\Lambda\mathbf Q^H$ 为 $\mathbf R$ 的特征值分解，$\mu_0$ 为使 $\|\mathbf W_{\mathrm{WF}}\|_F^2=P_T$ 的常数（即"水位"）。

与传统雷达系统形成鲜明对比，ISAC 系统必须使用随机信号进行目标感知。由于如式（72a）所示高斯信号可达到 P2P 高斯信道容量，这里以 ISAC 系统的高斯信令为例。令 $\mathbf S=[\mathbf s_1,\mathbf s_2,\ldots,\mathbf s_N]\in\mathbb C^{N_t\times N}$ 表示发射的随机 ISAC 信号，其各列独立同分布且服从零均值、协方差 $\mathbf I_{N_t}$ 的复高斯分布，即 $\mathbf s_\ell\sim\mathcal{CN}(\mathbf 0,\mathbf I_{N_t})$。此时问题（76）的目标函数成为随机变量（因为它依赖随机变量 $\mathbf S$）。因此自然考虑计入信号随机性的遍历 LMMSE（ELMMSE），定义为 [62]
$$
f_{\mathrm{ELMMSE}}(\mathbf W):=\mathbb E\left\{\operatorname{Tr}\left[\left(\mathbf R_H^{-1}+\frac{1}{\sigma_s^2N_s}\mathbf W\mathbf S\mathbf S^H\mathbf W^H\right)^{-1}\right]\right\},\tag{79}
$$
其中期望对 $\mathbf S$ 取。ELMMSE 可解释为遍历通信速率的感知类比 [94]，可视为随机 ISAC 信号所达到 MSE 的时间平均。

### B. 仅感知预编码设计

本部分探讨随机信令下的仅感知预编码设计，作为稍后详述的 ISAC 预编码的性能基准。相应优化问题可表述为
$$
\min_{\mathbf W}\ f_{\mathrm{ELMMSE}}(\mathbf W)\quad\text{s.t.}\ \|\mathbf W\|_F^2\leq P_T.\tag{80}
$$
针对问题（80），我们给出两种预编码方案：数据相关预编码（DDP）与数据无关预编码（DIP）。

**1) 数据相关预编码。** 令 $\{\mathbf S_m\}_{m=1}^{M}$ 表示 $M$ 个独立同分布高斯数据实现。在单站模式下，每个 $\mathbf S_m$ 对 ISAC Tx 与感知 Rx 均已知。因此问题（80）中的预编码矩阵 $\mathbf W$ 可设计为 $\mathbf S$ 在所有数据实现上的函数，记为 $\mathbf W_m:=\mathbf W(\mathbf S_m)$。相应优化问题变为
$$
\min_{\mathbf W_m}\operatorname{Tr}\left\{\left(\mathbf R_H^{-1}+\frac{1}{\sigma_s^2N_s}\mathbf W_m\mathbf S_m\mathbf S_m^H\mathbf W_m^H\right)^{-1}\right\}\quad\text{s.t.}\ \|\mathbf W_m\|_F^2\leq P_T.\tag{81}
$$
对每个给定数据实现 $\mathbf S_m$，问题（81）有闭式解，见文献 [62, 定理 1]。具体地，令 $\mathbf S_m=\mathbf U_m\boldsymbol\Sigma_m\mathbf V_m^H$ 为 $\mathbf S_m$ 的奇异值分解（SVD），并定义矩阵 $\boldsymbol\Pi_0$ 为
$$
\boldsymbol\Pi_0=\begin{bmatrix}0&0&\cdots&1\\0&\cdots&1&0\\\vdots&\vdots&\ddots&\vdots\\1&0&\cdots&0\end{bmatrix}.\tag{82}
$$
则问题（81）的修正注水解为 [95]
$$
\mathbf W_m^{\mathrm{opt}}=\mathbf Q\left[\left(\mu_n\boldsymbol\Theta_m^{\frac12}-\mathbf B_m\right)^{+}\right]^{\frac12}\boldsymbol\Pi_0\mathbf U_m^H,\quad m=1,2,\ldots,M,\tag{83}
$$
其中 $\boldsymbol\Theta_m=\frac{1}{\sigma_s^2N_s}\boldsymbol\Pi_0\boldsymbol\Sigma_m\boldsymbol\Sigma_m^T\boldsymbol\Pi_0$，$\mathbf B_m=(\boldsymbol\Lambda\boldsymbol\Theta_m)^{-1}$，$\mu_m$ 为满足发射功率约束 $\|\mathbf W_m^{\mathrm{opt}}\|_F^2=P_T$ 的参数。

由式（83）的 $\mathbf W_m^{\mathrm{opt}}$ 表达显然可见，预编码矩阵 $\mathbf W_m$ 依赖数据实现 $\mathbf S_m$；因此该方案称为数据相关预编码（DDP）。由于 DDP 方案基于瞬时数据实现自适应设计，它一般能达到最小 ELMMSE；但代价是较高的计算复杂度。

**2) 数据无关预编码。** 与 DDP 不同，DIP 方案旨在寻找与信号实现无关的预编码器 $\mathbf W$。鉴于 $f_{\mathrm{ELMMSE}}$ 的闭式表达难以获得，数据无关预编码器可通过应用随机梯度下降（SGD）算法离线求解问题（80）得到，从而在估计性能与计算复杂度之间取得良好折中。下面详述 SGD 算法。

令 $f(\mathbf W;\mathbf S)$ 如式（75）定义。$f(\mathbf W;\mathbf S)$ 关于变量 $\mathbf W$ 在给定点 $\mathbf W_0$ 处的梯度为
$$
\nabla f(\mathbf W_0;\mathbf S)=-\left(\mathbf R_H^{-1}+\frac{1}{\sigma_s^2N_s}\mathbf W_0\mathbf S\mathbf S^H\mathbf W_0^H\right)^{-2}\frac{\mathbf W_0\mathbf S\mathbf S^H}{\sigma_s^2N_s}.\tag{84}
$$
相应地，$f_{\mathrm{ELMMSE}}$ 关于 $\mathbf W$ 在点 $\mathbf W_0$ 处的梯度为
$$
\nabla f_{\mathrm{ELMMSE}}(\mathbf W_0)=\mathbb E\left\{\nabla f(\mathbf W_0;\mathbf S)\right\},\tag{85}
$$
它同样没有闭式表达。为此，SGD 的核心思想是用一个小批量样本上评估的梯度近似（85）的真实梯度：
$$
\hat\nabla f_{\mathrm{ELMMSE}}(\mathbf W_0)=\frac{1}{|\mathcal D|}\sum_{\mathbf S\in\mathcal D}\nabla f(\mathbf W_0;\mathbf S),\tag{86}
$$
其中 $\mathcal D$ 表示在点 $\mathbf W_0$ 处生成的高斯样本数。在投影 SGD 算法的第 $r$ 次迭代中，预编码矩阵 $\mathbf W$ 更新为
$$
\mathbf W^{(r+1)}=\operatorname{Proj}\left\{\mathbf W^{(r)}-\varepsilon^{(r)}\hat\nabla f_{\mathrm{ELMMSE}}\left(\mathbf W^{(r)}\right)\right\},\tag{87}
$$
其中 $\varepsilon^{(r)}$ 为步长（"学习率"），$\operatorname{Proj}\{\cdot\}$ 为到问题（80）可行集（即球约束）上的投影算子。

关于上述 SGD 算法有几点说明。第一，为保证（投影）SGD 算法收敛，（87）中的非负步长 $\varepsilon^{(r)}$ 必须满足 [96]、[97]
$$
\sum_{r=1}^{\infty}\varepsilon^{(r)}=\infty\quad\text{且}\quad\sum_{r=1}^{\infty}\left|\varepsilon^{(r)}\right|^2<\infty.\tag{88}
$$
第二，增大批量大小 $|\mathcal D|$ 可降低真实梯度近似误差的方差，从而在计算效率与鲁棒性方面改善数值性能；但代价是需要计算更多局部梯度。由大数定律，当批量大小趋于无穷时，（86）的梯度收敛到（85）的真实梯度，（投影）SGD 算法实际上退化为（投影）GD 算法。最后，把动量信息引入 SGD 可加速其收敛；特别地，文献 [62] 引入了带动量的 SGD 改进版本，用以在存在复未知变量时求解问题（80）。

**3) 示例。** 图 12 给出一个例子，展示专为随机信号设计的 MIMO 预编码在仅感知场景下的优越性：考虑 $N_t=N_s=32$、$N=24$ 与 $N_t=N_s=64$、$N=48$ 两种参数设置，比较 DDP 与 DIP 方法在不同 SNR 下可达到的 ELMMSE，并以注水预编码器（78）为基准方案。三种方法的结果都对 1000 次独立同分布高斯信号样本的随机实现取平均。正如理论分析所预测，DDP 方案总体取得最低 ELMMSE，DIP 次之；另一方面，为确定性训练信号量身定制的注水预编码器相比 DDP 与 DIP 设计存在 3 dB 性能损失以及严重的误差底，这证实了计入数据随机性的必要性。

### C. ISAC 预编码设计

本小节把预编码设计从上一小节的仅感知场景扩展到 ISAC 场景。全小节假设（72a）的信道矩阵 $\mathbf H_c$ 完全已知，则（72a）P2P 高斯信道的可达通信速率（bps/Hz）为 [98]
$$
R(\mathbf W)=\log\det\left(\mathbf I_{N_c}+\sigma_c^{-2}\mathbf H_c\mathbf W\mathbf W^H\mathbf H_c^H\right).\tag{89}
$$
ISAC 系统中的预编码设计问题可表述为在通信性能与功率预算约束下最小化 ELMMSE：
$$
\min_{\mathbf W}\ f_{\mathrm{ELMMSE}}(\mathbf W)\quad\text{s.t.}\ R(\mathbf W)\geq R_0,\ \|\mathbf W\|_F^2\leq P_T,\tag{90}
$$
其中 $R_0$ 对应通信速率要求。再次针对问题（90）给出 DDP 与 DIP 两种预编码方案。

**1) 数据相关预编码。** 沿用第 V-B 节的方法与记号。引入辅助变量 $\boldsymbol\Omega_m=\mathbf W_m\mathbf W_m^H$，可把问题（90）的速率约束改写为
$$
\tilde R(\boldsymbol\Omega_m):=\log\det\left(\mathbf I_{N_c}+\sigma_c^{-2}\mathbf H_c\boldsymbol\Omega_m\mathbf H_c^H\right)\geq R_0.\tag{91}
$$
对给定数据实现 $\mathbf S_m$，数据相关预编码器 $\mathbf W$ 可通过求解关于 $\mathbf W_m$ 的如下优化问题得到：
$$
\min_{\mathbf W_m,\boldsymbol\Omega_m}\ f(\mathbf W_m;\mathbf S_m)\quad\text{s.t.}\ \tilde R(\boldsymbol\Omega_m)\geq R_0,\ \boldsymbol\Omega_m=\mathbf W_m\mathbf W_m^H,\ \|\mathbf W\|_F^2\leq P_T.\tag{92}
$$
文献 [62] 提出了一种基于惩罚的交替优化（AO）算法求解问题（92）。该算法本质上是把 AO 用于求解（92）的惩罚版本：
$$
\min_{\mathbf W_m,\boldsymbol\Omega_m}\ f(\mathbf W_m;\mathbf S_m)+\frac{\rho}{2}\left\|\boldsymbol\Omega_m-\mathbf W_m\mathbf W_m^H\right\|_F^2\quad\text{s.t.}\ \tilde R(\boldsymbol\Omega_n)\geq R_0,\ \|\mathbf W\|_F^2\leq P_T,\tag{93}
$$
其中 $\rho>0$ 为惩罚参数。具体地，关于变量 $\boldsymbol\Omega_m$ 的问题（93）是凸的，可高效求解；关于另一变量 $\mathbf W_m$ 的相应子问题可用投影梯度下降算法处理。关于所提基于惩罚的 AO 算法的更多细节，请参见文献 [62, 第 IV 节]。

**2) 数据无关预编码。** 引入辅助变量 $\boldsymbol\Omega=\mathbf W\mathbf W^H$，并在目标函数中为该等式约束添加惩罚项，得到问题（90）的如下惩罚版本：
$$
\min_{\mathbf W,\boldsymbol\Omega}\ \mathbb E_{\mathbf S}\left\{f(\mathbf W;\mathbf S)\right\}+\frac{\rho}{2}\left\|\boldsymbol\Omega-\mathbf W\mathbf W^H\right\|_F^2\quad\text{s.t.}\ \tilde R(\boldsymbol\Omega)\geq R_0,\ \|\mathbf W\|_F^2\leq P_T.\tag{94}
$$
该问题可用与问题（93）类似的方式、借助 AO 算法求解，唯一区别是关于变量 $\mathbf W$ 的子问题用投影 SGD 算法求解。

**3) 示例。** 图 13 展示 $N_t=N_s=32$、$N=20$ 与 32、SNR = 15 dB 时 DDP 与 DIP 方案在 S&C 性能之间的折中。基准技术是在通信速率与功率约束下最小化确定性 LMMSE（77a）的预编码设计。可以清楚观察到，对 $N=20$，DIP 设计相比基准方法获得 3 bps/Hz 的通信速率提升，同时取得相同的感知 ELMMSE；此外，DDP 在满足所需通信速率的同时，相比 DIP 使 ELMMSE 降低 1.5 dB 以上。

## VI. 开放问题与未来方向

本节强调用随机通信信号进行感知的开放问题，并指出该领域有前景的未来研究方向。

### A. 开放问题

**1) 二维模糊函数刻画。** 当前研究主要利用 ACF 分析以通信为中心的 ISAC 信号的感知性能，但这仅提供系统性能的部分视图。具体而言，ACF 表示模糊函数（AF）的零多普勒切片 [75]，只刻画静态或准静态条件下的多目标测距性能。未来 6G 网络预期同时支持大量移动目标与用户的 S&C 服务，此时包含时延与多普勒参数的二维 AF 将是评估随机 ISAC 信号感知性能更相关、更恰当的度量。然而，鉴于二维 AF 由随机 ISAC 信号在时频域的二维自相关导出，分析其在任意信令格式下的统计性质仍是重大挑战。

**2) 随机 ISAC 信令下的失配滤波与稀疏恢复。** 本文以及多数现有文献中，感知信号处理都在 MF 框架下进行：把接收回波信号与发射 ISAC 信号的副本卷积形成距离像，并基于定位所得峰进行目标检测。虽然 MF 在每个峰处最大化目标 SNR，但它在降低数据载荷引起的旁瓣电平方面可能并非最优。为此，失配滤波（MMF）可作为一种更通用的方法进一步改善感知性能，它把滤波器的冲激响应设计为发射 ISAC 信号的非线性函数。MMF 的一个例子是倒数滤波（Reciprocal Filtering）[99]，它在频域对回波信号做逐元素除法。倒数滤波可有效消除随机数据产生的旁瓣，得到无"海平面"的干净"冰山"；但它可能因放大噪声而遭受 SNR 下降。因此，必须在随机 ISAC 信令下开发兼顾旁瓣抑制与 SNR 损失的新型 MMF 技术。此外，匹配追踪类稀疏恢复技术及其变体可利用雷达目标固有的稀疏性提升感知分辨率 [100]；但要全面解决 ISAC 信号随机性及其对这类算法性能影响带来的挑战，仍需系统研究。

**3) 自适应调制。** 第 IV-B 节已表明，感知偏好功率波动较小甚至恒模的信号，代价是通信速率下降。然而这些信号往往具有更高能效、提供更高 SNR，并有机会利用无线干扰 [101]。这为通过自适应调制（AM）方案 [102]、[103] 与建设性干扰（CI）利用 [104] 挽回部分速率损失提供了可能。一方面，这有机会把上述 S&C 折中转向更有利的通信性能，从而在以通信为中心的 ISAC 场景中更好地保障通信 QoS；另一方面，这类方法需要开发与本文综述的 ISAC 信令协同设计的新型 AM 方法，以及基于上述星座整形的 ISAC 定制 CI 方法。

**4) 用信道编码信号进行感知。** 信道编码是现代通信系统的关键部件，它通过向信息比特添加冗余来减少或纠正译码错误。目前多数以通信为中心的 ISAC 系统研究聚焦于未编码信号，即星座符号独立同分布地取自预定义码本。本文虽研究了调制方案、星座设计、脉冲成形滤波器与 MIMO 预编码器对感知性能的影响，但信道编码的影响仍基本未被探索 [105]。因此，在各种实际信道编码方案（如 Turbo、LDPC、Polar 码）下评估随机 ISAC 信号的感知性能，并针对均衡的 S&C 性能优化这些编码，将是很有价值的工作。

### B. 未来方向

**1) 网络化感知与使用通信信号的 ISAC。** 在本文考虑的 P2P ISAC 设置之上，网络化感知与 ISAC 是在大范围内实现无缝感知与通信的变革性途径 [106]—[110]。通过利用 BS 与分布式移动设备之间的协作，网络化 ISAC 对无人机低空经济、智慧交通系统等应用尤具前景 [111]、[112]。与传统 P2P 单站与双站系统不同，网络化感知与 ISAC 面临独特挑战，尤其在干扰管理方面：分布式节点的同时传输可能显著降低全网 S&C 性能，而通信信号固有的随机性进一步复杂化了干扰分析与管理的难度。为应对该挑战，需要围绕 BS 同步、自适应 BS 分簇与调度、协作预编码、网络级联合资源分配开展全面研究。例如，可把 BS 动态分组为簇，簇内联合预编码可利用交叉链路干扰作为有益信号，而簇间干扰协调对缓解簇间干扰至关重要。根据数据信息的可用性，多个 BS 可采用 DDP 与 DIP 技术，在不牺牲通信质量的前提下提升感知性能。此时，多 BS 间数据相关与数据无关预编码器的联合优化变得关键，分布式算法设计在降低信令开销的同时实现性能提升方面发挥重要作用。

**2) 使用通信信号的安全 ISAC。** 通过 ISAC 基础设施实现泛在感知，也为无线网络带来全新的安全漏洞 [113]：i) **数据安全**：把数据纳入探测 ISAC 信号，使其容易被潜在的恶意雷达目标窃听，而且目标照射通常使用大功率；即使数据本身加密，仅仅检测到通信链路的存在也可能危及通信隐私 [114]、[115]。ii) **感知隐私**：无线网络引入的感知功能可能被恶意节点利用，独立感知环境中潜在的敏感信息 [116]；这是蜂窝网络中从未需要担心的全新漏洞。由于不存在数据链路（即恶意节点独立感知其环境的能力），高层安全方法并不适用。威胁的严重性要求为 ISAC 量身定制新一代 PHY 安全方案。本文综述的星座、脉冲成形与预编码设计需要在 PHY 安全下重新调节，并可在防护数据窃听与对抗感知方面发挥关键作用。它们与人工噪声设计、干扰、协作安全等经典 PHY 安全方法的协同设计几乎仍是空白。最重要的是，尽管 ISAC 中的数据安全正在理论上被探索 [117]，感知隐私领域仍缺乏设计度量、信号处理方案与传输机制的信息论框架。

**3) 人工智能（AI）辅助的感知与 ISAC。** 本文聚焦感知与 ISAC 的信息论与信号处理方面，而 AI 最近已成为关键使能技术，尤其在处理面向识别任务的感知与 ISAC 信号方面 [118]、[119]。例如深度学习算法正日益用于姿态与活动识别等应用。AI 与感知、ISAC 的融合既带来新挑战也带来令人兴奋的机遇。采用随机通信信号时的一个关键挑战是：设计能够有效处理相应回波信号的 AI 算法变得复杂。一个有前景的解决途径是把成熟的模型驱动雷达信号处理方法与创新的数据驱动 AI 技术相结合。另一个重要挑战是定义新的感知性能度量（如识别准确率），并理解其与调制类型、发射通信信号协方差矩阵等设计参数之间的关系，以指导系统优化。引入 AI 使在二者之间建立定量联系尤为困难。尽管存在这些挑战，AI 也为解决这些问题提供了强大工具：AI 技术可对感知性能度量与信号参数之间的复杂非线性关系建模，提供传统方法难以获得的洞见；此外 AI 可通过端到端学习 [120] 优化各种功能模块（如星座的输入分布），使其成为推进感知与 ISAC 技术发展的宝贵资产。

**4) 使用通信信号的感知—通信—供能一体化（ISCAP）。** 除支持感知与通信外，无线电信号还可通过无线功率传输（WPT）向传感器与 IoT 设备等低功耗设备无线输送能量。随着频谱资源日益受限，未来无线网络预计将把感知、通信与 WPT 相结合，形成多功能 ISCAP 网络 [121]、[122]。ISCAP 在设计信号波形、优化通信信号以平衡感知、通信与 WPT 折中方面带来新挑战。与传统 ISAC 系统不同，ISCAP 必须应对 WPT 的独特需求：能量收集效率高度依赖发射波形的特性。由于能量收集设备中射频（RF）到直流（DC）转换过程的非线性，通常青睐高峰均功率比（PAPR）波形以最大化功率传输效率。为克服这些挑战，优化调制、波形设计与波束成形至关重要。虽然已有一些初步研究探索了简化 ISCAP 场景中的波形与波束成形设计，但全面的系统级分析与设计仍不成熟。例如，在计入实际能量收集约束的同时，分析 OFDM、CDMA、OTFS 等各种波形下的 WPT 性能，是很有前景的研究方向；同样，把数据相关与数据无关预编码技术扩展到 ISCAP 也值得研究。

## VII. 结论

本教程论文考察了以通信为中心的 ISAC 传输领域的最新进展，它通过把随机数据载荷信号同时用于 S&C 任务，最大化资源利用效率。我们首先讨论 ISAC 的信息论基础，强调开发专为随机 ISAC 信号定制的信号处理技术的必要性。随后回顾以通信为中心的 ISAC 系统的核心模型与方法，特别关注 ISAC 信号 ACF 统计性质的分析——这对评估多目标感知性能至关重要。进一步，我们把大量讨论用于 ISAC 系统关键部件的设计准则，包括调制方案、星座设计与脉冲成形滤波器，强调在不牺牲通信性能的前提下优化感知功能的重要性，或在某些情况下开发支撑两种功能的可伸缩折中。在此基础上，我们还探讨了 MIMO 系统的进展，特别是针对随机数据载荷信号构思的专用感知与 ISAC 预编码技术。最后，论文指出若干开放研究挑战，并勾勒以通信为中心的 ISAC 传输的未来方向。我们希望本工作有助于指导与现有蜂窝网络兼容的 ISAC 空口技术的持续发展，并为 ISAC 在未来 6G 无线网络中的标准化与实现作出贡献。

## 图注与表注

### 表 I：典型亚高斯星座的峰度值（原 PDF 第 13 页）

| 星座 | PSK | 16-QAM | 64-QAM | 128-QAM |
|---|---|---|---|---|
| 峰度 | 1 | 1.32 | 1.381 | 1.3427 |

| 星座 | 256-QAM | 512-QAM | 1024-QAM | 2048-QAM |
|---|---|---|---|---|
| 峰度 | 1.3953 | 1.3506 | 1.3988 | 1.3525 |

### 图注

**图 1（原 PDF 第 4 页）：** P2P ISAC 模型：ISAC Tx 发射统一信号，既感知目标又与通信 Rx 通信；专用感知 Rx 或与 ISAC Tx 共址（单站模式），或单独放置但通过有线链路与 ISAC Tx 相连（协作双站模式）。

**图 2（原 PDF 第 5 页）：** P2P 单站 ISAC 系统的信息论模型。ISAC Tx 含编码器与估计器（感知 Rx）；信道律为 $P_{yz|xh}$，目标状态先验为 $P_h$；通信 Rx 从 $y$ 恢复 $\hat w$，感知 Rx 从发射信号 $x$ 与反馈 $z$ 恢复 $\hat h$。

**图 3（原 PDF 第 6 页）：** $B=10$ 时实值标量高斯信道的 C-D 折中边界，以及沿边界的最优输入分布 $P_x(x)$。(a) 容量—失真边界（Pareto 边界与时间共享内界）；(b)—(e) 点 ①、②、③、④ 处的 $P_x(x)$，可见分布从高斯（①，通信最优）平滑过渡到 BPSK（④，感知最优）。

**图 4（原 PDF 第 7 页）：** P2P 单站 ISAC 系统的 CRB—速率折中。图中标出 $P_{cs}$、$P_{sc}$ 两个角点、对应速率 $C_{cs}$、$C_{sc}$、失真 $\epsilon_{cs}$、$\epsilon_{sc}$，以及实际边界与内界（时间共享内界）。

**图 5（原 PDF 第 9 页）：** 图 1 中 P2P ISAC 模型的信号处理流程。通信 Rx 旨在存在多径干扰时正确检测符号，感知 Rx 旨在提取多个目标的距离参数；图中给出星座映射、调制（$\mathbf x=\mathbf U\mathbf s$）、脉冲成形、Tx/Rx 射频链、逐符号 MF、Nyquist 采样、符号检测与去映射，以及回波 MF、过采样、距离像与目标检测等环节。

**图 6（原 PDF 第 11 页）：** OFDM 信号配 PSK 星座的距离像示例，包含位于 10 m、20 m 与 25 m 的 3 个目标（SNR = 0 dB，RRC 脉冲成形）。

**图 7（原 PDF 第 12 页）：** OFDM 信号的平均平方 ACF 及相应相干积分版本；16-QAM 星座、$\alpha=0.35$ RRC 脉冲成形，$N=128$、$L=10$、$M=1$、100 与 1000。随着 $M$ 增大，"海平面"分别下降 20 dB 与 30 dB，"冰山"（RRC 的 ACF）逐渐显露。

**图 8（原 PDF 第 13 页）：** SC、CDMA 与 OFDM 信号的平均平方 ACF 及相应相干积分版本；16-QAM 星座、$\alpha=0.35$ RRC 脉冲成形，$N=128$、$L=10$、$M=1$ 与 100。OFDM 在各时滞处旁瓣最低（相对 SC 与 CDMA 改善 5 dB），相干积分后旁瓣下降 20 dB。

**图 9（原 PDF 第 14 页）：** OFDM 与 SC 调制最优性的物理解释。(a) 理想情形：完全平坦的频谱导致时域 Dirac-delta 形式的 ACF；(b) 随机数据载荷使平方谱产生起伏，从而在 ACF 中引入随机旁瓣；(c) 最优调制基最小化平方谱的起伏，该起伏由 $\mathbf F_N\mathbf U\mathbf s$ 的峰度度量，而 $\mathbf F_N\mathbf U$ 为酉变换。

**图 10（原 PDF 第 16 页）：** 随机 ISAC 信号 PCS 技术的示例。(a) 在不同峰度门限 $c_0$ 下 16-QAM 与 64-QAM 的 PCS 结果；(b) 通过把 PCS 的 $c_0$ 从 1 调到 1.381（均匀 64-QAM 的峰度），在 OFDM 调制与 64-QAM 星座、不同发射 SNR 下实现的感知检测概率与通信可达速率之间的显式性能折中。

**图 11（原 PDF 第 17 页）：** OFDM 配 16-QAM 星座时两个目标的测距性能与距离像，$N=128$、$\alpha=0.35$、$L=10$、$M=1000$，感兴趣距离区域为 [23.74 m, 31.24 m]。(a) 有/无相干积分时的测距 RMSE 曲线（RRC 与设计脉冲对比）；(b) 有/无相干积分时的距离像。

**图 12（原 PDF 第 19 页）：** 高斯信令下 DDP 与 DIP 方案相对传统注水方案可达的感知性能，分别给出 $N_t=32$、$N=24$ 与 $N_t=64$、$N=48$ 两种情形（横轴 SNR，纵轴 ELMMSE；图中标出误差底）。

**图 13（原 PDF 第 20 页）：** 不同预编码设计下的 S&C 性能折中，参数设置为 $N_t=N_s=32$、$N=20$ 与 32、SNR = 15 dB。

## 参考文献（英文原书目）

以下按原 PDF 第 22—25 页的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI、页码与在线链接。

[1] M. Chafii, L. Bariah, S. Muhaidat, and M. Debbah, “Twelve scientific challenges for 6G: Rethinking the foundations of communications theory,” IEEE Commun. Surveys Tuts., vol. 25, no. 2, pp. 868–904, Second Quarter 2023.

[2] W. Saad, M. Bennis, and M. Chen, “A vision of 6G wireless systems: Applications, trends, technologies, and open research problems,” IEEE Network, vol. 34, no. 3, pp. 134–142, 2019.

[3] ITU-R WP5D, “Draft New Recommendation ITU-R M. [IMT. Framework for 2030 and Beyond],” 2023.

[4] Y. Cui, F. Liu, X. Jing, and J. Mu, “Integrating sensing and communications for ubiquitous IoT: Applications, trends and challenges,” IEEE Network, vol. 35, no. 5, pp. 158–167, 2021.

[5] J. A. Zhang, M. L. Rahman, K. Wu, X. Huang, Y. J. Guo, S. Chen, and J. Yuan, “Enabling joint communication and radar sensing in mobile networks - A survey,” IEEE Commun. Surveys Tuts., vol. 24, no. 1, pp. 306–345, 2022.

[6] F. Liu, Y. Cui, C. Masouros, J. Xu, T. X. Han, Y. C. Eldar, and S. Buzzi, “Integrated sensing and communications: Toward dual-functional wireless networks for 6G and beyond,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1728–1767, 2022.

[7] F. Liu, L. Zheng, Y. Cui, C. Masouros, A. P. Petropulu, H. Griffiths, and Y. C. Eldar, “Seventy years of radar and communications: The road from separation to integration,” IEEE Signal Process. Mag., vol. 40, no. 5, pp. 106–121, 2023.

[8] A. Hassanien, M. G. Amin, Y. D. Zhang, and F. Ahmad, “Signaling strategies for dual-function radar-communications: An overview,” IEEE Aerosp. Electron. Syst. Mag., 2016.

[9] A. Hassanien, M. G. Amin, E. Aboutanios, and B. Himed, “Dual-function radar communication systems: A solution to the spectrum congestion problem,” IEEE Signal Process. Mag., vol. 36, no. 5, pp. 115–126, 2019.

[10] A. Hassanien, M. G. Amin, Y. D. Zhang, and F. Ahmad, “Dual-function radar-communications: Information embedding using sidelobe control and waveform diversity,” IEEE Trans. Signal Process., vol. 64, no. 8, pp. 2168–2181, Apr. 2016.

[11] M. Temiz, C. Horne, N. J. Peters, M. A. Ritchie, and C. Masouros, “An experimental study of radar-centric transmission for integrated sensing and communications,” IEEE Trans. Microw. Theory Techn., vol. 71, no. 7, pp. 3203–3216, 2023.

[12] M. Roberton and E. R. Brown, “Integrated radar and communications based on chirped spread-spectrum techniques,” in IEEE MTT-S Int. Microw. Symp. Dig., vol. 1, Aug. 2003, pp. 611–614.

[13] G. N. Saddik, R. S. Singh, and E. R. Brown, “Ultra-wideband multifunctional communications/radar system,” IEEE Trans. Microw. Theory Technol., vol. 55, no. 7, pp. 1431–1437, Jul. 2007.

[14] D. Ma, N. Shlezinger, T. Huang, Y. Liu, and Y. C. Eldar, “FRaC: FMCW-based joint radar-communications system via index modulation,” IEEE J. Sel. Topics Signal Process., vol. 15, no. 6, pp. 1348–1364, 2021.

[15] T. Huang, N. Shlezinger, X. Xu, Y. Liu, and Y. C. Eldar, “MAJoRCom: A dual-function radar communication system using index modulation,” IEEE Trans. Signal Process., vol. 68, pp. 3423–3438, 2020.

[16] A. Hassanien, M. G. Amin, Y. D. Zhang, F. Ahmad, and B. Himed, “Non-coherent PSK-based dual-function radar-communication systems,” in Proc. IEEE Radar Conf. (RadarConf), May 2016, pp. 1–6.

[17] L. Zheng, M. Lops, Y. C. Eldar, and X. Wang, “Radar and communication coexistence: An overview: A review of recent methods,” IEEE Signal Process. Mag., vol. 36, no. 5, pp. 85–99, 2019.

[18] M. Jamil, H.-J. Zepernick, and M. I. Pettersson, “On integrated radar and communication systems using Oppermann sequences,” in MILCOM 2008 - 2008 IEEE Military Communications Conference, 2008, pp. 1–6.

[19] K. Wu, J. A. Zhang, X. Huang, and Y. J. Guo, “Integrating low-complexity and flexible sensing into communication systems,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1873–1889, 2022.

[20] K. Wu, J. A. Zhang, Z. Ni, X. Huang, Y. J. Guo, and S. Chen, “Joint communications and sensing employing optimized MIMO-OFDM signals,” IEEE Internet Things J., vol. 11, no. 6, pp. 10 368–10 383, 2024.

[21] C. Sturm and W. Wiesbeck, “Waveform design and signal processing aspects for fusion of wireless communications and radar sensing,” Proc. IEEE, vol. 99, no. 7, pp. 1236–1259, Jul. 2011.

[22] L. Gaudio, M. Kobayashi, G. Caire, and G. Colavolpe, “On the effectiveness of OTFS for joint radar parameter estimation and communication,” IEEE Trans. Wireless Commun., vol. 19, no. 9, pp. 5951–5965, 2020.

[23] W. Yuan, L. Zhou, S. K. Dehkordi, S. Li, P. Fan, G. Caire, and H. V. Poor, “From OTFS to DD-ISAC: Integrating sensing and communications in the delay Doppler domain,” IEEE Wireless Commun., vol. 31, no. 6, pp. 152–160, 2024.

[24] M. F. Keskin, C. Marcus, O. Eriksson, A. Alvarado, J. Widmer, and H. Wymeersch, “Integrated sensing and communications with MIMO-OTFS: ISI/ICI exploitation and delay-Doppler multiplexing,” IEEE Trans. Wireless Commun., pp. 1–1, 2024.

[25] A. Bemani, N. Ksairi, and M. Kountouris, “Affine frequency division multiplexing for next generation wireless communications,” IEEE Trans. Wireless Commun., vol. 22, no. 11, pp. 8214–8229, 2023.

[26] ——, “Integrated sensing and communications with affine frequency division multiplexing,” IEEE Wireless Commun. Lett., vol. 13, no. 5, pp. 1255–1259, 2024.

[27] D. Ma, N. Shlezinger, T. Huang, Y. Liu, and Y. C. Eldar, “Joint radar-communication strategies for autonomous vehicles: Combining two key automotive technologies,” IEEE Signal Process. Mag., vol. 37, no. 4, pp. 85–97, Jul. 2020.

[28] D. Ma, N. Shlezinger, T. Huang, Y. Shavit, M. Namer, Y. Liu, and Y. C. Eldar, “Spatial modulation for joint radar-communications systems: Design, analysis, and hardware prototype,” IEEE Trans. Veh. Technol., vol. 70, no. 3, pp. 2283–2298, 2021.

[29] F. Liu, L. Zhou, C. Masouros, A. Li, W. Luo, and A. Petropulu, “Toward dual-functional radar-communication systems: Optimal waveform design,” IEEE Trans. Signal Process., vol. 66, no. 16, pp. 4264–4279, Aug 2018.

[30] F. Liu, C. Masouros, A. Li, H. Sun, and L. Hanzo, “MU-MIMO communications with MIMO radar: From co-existence to joint transmission,” IEEE Trans. Wireless Commun., vol. 17, no. 4, pp. 2755–2770, Apr. 2018.

[31] X. Liu, T. Huang, and Y. Liu, “Transmit design for joint MIMO radar and multiuser communications with transmit covariance constraint,” IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1932–1950, 2022.

[32] X. Liu, T. Huang, N. Shlezinger, Y. Liu, J. Zhou, and Y. C. Eldar, “Joint transmit beamforming for multiuser MIMO communications and MIMO radar,” IEEE Trans. Signal Process., vol. 68, pp. 3929–3944, 2020.

[33] F. Liu, Y.-F. Liu, A. Li, C. Masouros, and Y. C. Eldar, “Cramér-Rao bound optimization for joint radar-communication beamforming,” IEEE Trans. Signal Process., vol. 70, pp. 240–253, 2022.

[34] Z. Ren, Y. Peng, X. Song, Y. Fang, L. Qiu, L. Liu, D. W. K. Ng, and J. Xu, “Fundamental CRB-rate tradeoff in multi-antenna ISAC systems with information multicasting and multi-target sensing,” IEEE Trans. Wireless Commun., vol. 23, no. 4, pp. 3870–3885, 2024.

[35] H. Hua, T. X. Han, and J. Xu, “MIMO integrated sensing and communication: CRB-rate tradeoff,” IEEE Trans. Wireless Commun., vol. 23, no. 4, pp. 2839–2854, 2024.

[36] P. Pulkkinen and V. Koivunen, “Model-based online learning for active ISAC waveform optimization,” IEEE J. Sel. Topics Signal Process., pp. 1–15, 2024.

[37] V. Koivunen, M. F. Keskin, H. Wymeersch, M. Valkama, and N. González-Prelcic, “Multicarrier ISAC: Advances in waveform design, signal processing, and learning under nonidealities,” IEEE Signal Process. Mag., vol. 41, no. 5, pp. 17–30, 2024.

[38] J. Zhang, C. Masouros, F. Liu, Y. Huang, and A. L. Swindlehurst, “Low-complexity joint radar-communication beamforming: From optimization to deep unfolding,” IEEE J. Sel. Topics Signal Process., pp. 1–16, 2025.

[39] Z. Wu, Y.-F. Liu, W.-K. Chen, and C. Masouros, “Quantized constant-envelope waveform design for massive MIMO DFRC systems,” IEEE J. Sel. Areas Commun., pp. 1–1, 2025.

[40] Z. Wei, H. Qu, Y. Wang, X. Yuan, H. Wu, Y. Du, K. Han, N. Zhang, and Z. Feng, “Integrated sensing and communication signals toward 5G-A and 6G: A survey,” IEEE Internet Things J., vol. 10, no. 13, pp. 11 068–11 092, 2023.

[41] H.-S. Cha, G. Lee, A. Ghosh, M. Baker, S. Kelley, and J. Hofmann. (2024) “5G NR positioning enhancements in 3GPP release-18”. [Online]. Available: https://arxiv.org/abs/2401.17594

[42] 3GPP, “Feasibility study on integrated sensing and communication (release 19),” 3GPP, Tech. Rep. TR 22.837 v19.4.0, April 2022.

[43] ——, “Service requirements for integrated sensing and communication; Stage 1 (release 19),” 3GPP, Tech. Rep. TS22.137 v19.1.0, August 2023.

[44] ——, “Summary #1 on ISAC channel modelling,” 3GPP TSG RAN WG1, Tech. Rep. R1-240xxxx, April 2024.

[45] R. Du, H. Hua, H. Xie, X. Song, Z. Lyu, M. Hu, Narengerile, Y. Xin, S. McCann, M. Montemurro, T. X. Han, and J. Xu, “An overview on IEEE 802.11bf: WLAN sensing,” IEEE Commun. Surveys Tuts., 2024, early access.

[46] X. Lin. (2023) “The bridge toward 6G: 5G-advanced evolution in 3GPP release 19”. [Online]. Available: https://arxiv.org/abs/2312.15174

[47] Z. Wei, Y. Wang, L. Ma, S. Yang, Z. Feng, C. Pan, Q. Zhang, Y. Wang, H. Wu, and P. Zhang, “5G PRS-based sensing: A sensing reference signal approach for joint sensing and communication system,” IEEE Trans. Veh. Technol., vol. 72, no. 3, pp. 3250–3263, 2023.

[48] Z. Wei, F. Li, H. Liu, X. Chen, H. Wu, K. Han, and Z. Feng, “Multiple reference signals collaborative sensing for integrated sensing and communication system towards 5G-A and 6G,” IEEE Trans. Veh. Technol., vol. 73, no. 10, pp. 15 185–15 199, 2024.

[49] Q. Zhang, K. Ji, Z. Wei, Z. Feng, and P. Zhang, “Joint communication and sensing system performance evaluation and testbed: A communication-centric approach,” IEEE Network, vol. 38, no. 5, pp. 286–294, 2024.

[50] Y. Cui, X. Jing, and J. Mu, “Integrated sensing and communications via 5G NR waveform: Performance analysis,” in Proc. ICASSP, 2022, pp. 8747–8751.

[51] T. M. Cover and J. A. Thomas, Elements of Information Theory. John Wiley & Sons, 1999.

[52] F. Liu, Y. Xiong, K. Wan, T. X. Han, and G. Caire, “Deterministic-random tradeoff of integrated sensing and communications in gaussian channels: A rate-distortion perspective,” in Proc. IEEE ISIT, 2023, pp. 2326–2331.

[53] Y. Xiong, F. Liu, Y. Cui, W. Yuan, T. X. Han, and G. Caire, “On the fundamental tradeoff of integrated sensing and communications under Gaussian channels,” IEEE Trans. Inf. Theory, vol. 69, no. 9, pp. 5723–5751, 2023.

[54] Y. Xiong, F. Liu, K. Wan, W. Yuan, Y. Cui, and G. Caire, “From torch to projector: Fundamental tradeoff of integrated sensing and communications,” IEEE BITS Inf. Theory Mag., pp. 1–13, 2024.

[55] M. Ahmadipour, M. Kobayashi, M. Wigger, and G. Caire, “An information-theoretic approach to joint sensing and communication,” IEEE Trans. Inf. Theory, vol. 70, no. 2, pp. 1124–1146, 2024.

[56] Y. Zhang, S. Aditya, and B. Clerckx, “Input distribution optimization in OFDM dual-function radar-communication systems,” IEEE Trans. Signal Process., vol. 72, pp. 5258–5273, 2024.

[57] J. G. Proakis and M. Salehi, Digital Communications. McGraw-hill, 2008.

[58] F. Liu, Y. Xiong, S. Lu, S. Li, W. Yuan, C. Masouros, S. Jin, and G. Caire. (2025) “Uncovering the iceberg in the sea: Fundamentals of pulse shaping and modulation design for random ISAC signals”. [Online]. Available: https://arxiv.org/abs/2501.01721

[59] F. Liu, Y. Zhang, Y. Xiong, S. Li, W. Yuan, F. Gao, S. Jin, and G. Caire. (2024) “OFDM achieves the lowest ranging sidelobe under random ISAC signaling”. [Online]. Available: https://arxiv.org/abs/2407.06691

[60] Z. Du, F. Liu, Y. Xiong, T. X. Han, Y. C. Eldar, and S. Jin, “Reshaping the ISAC tradeoff under OFDM signaling: A probabilistic constellation shaping approach,” IEEE Trans. Signal Process., vol. 72, pp. 4782–4797, 2024.

[61] Z. Liao, F. Liu, S. Li, Y. Xiong, W. Yuan, C. Masouros, and M. Lops, “Pulse shaping for random ISAC signals: The ambiguity function between symbols matters,” IEEE Trans. Wireless Commun., 2024, early access.

[62] S. Lu, F. Liu, F. Dong, Y. Xiong, J. Xu, Y.-F. Liu, and S. Jin, “Random ISAC signals deserve dedicated precoding,” IEEE Trans. Signal Process., vol. 72, pp. 3453–3469, 2024.

[63] M. Kobayashi, G. Caire, and G. Kramer, “Joint state sensing and communication: Optimal tradeoff for a memoryless case,” in 2018 IEEE International Symposium on Information Theory (ISIT), 2018, pp. 111–115.

[64] M. Kobayashi, H. Hamad, G. Kramer, and G. Caire, “Joint state sensing and communication over memoryless multiple access channels,” in 2019 IEEE International Symposium on Information Theory (ISIT), 2019, pp. 270–274.

[65] M. Ahmadipour, M. Wigger, and M. Kobayashi, “Joint sensing and communication over memoryless broadcast channels,” in 2020 IEEE Information Theory Workshop (ITW), 2021, pp. 1–5.

[66] S. M. Kay, Fundamentals of Statistical Signal Processing, Vol. II: Detection Theory. Englewood Cliffs, NJ, USA: Prentice Hall, 1998.

[67] A. Liu, Z. Huang, M. Li, Y. Wan, W. Li, T. X. Han, C. Liu, R. Du, D. K. P. Tan, J. Lu, Y. Shen, F. Colone, and K. Chetty, “A survey on fundamental limits of integrated sensing and communication,” IEEE Commun. Surveys Tuts., vol. 24, no. 2, pp. 994–1034, 2nd quarter 2022.

[68] S. Arimoto, “An algorithm for computing the capacity of arbitrary discrete memoryless channels,” IEEE Trans. Inf. Theory, vol. 18, no. 1, pp. 14–20, 1972.

[69] R. Blahut, “Computation of channel capacity and rate-distortion functions,” IEEE Trans. Inf. Theory, vol. 18, no. 4, pp. 460–473, 1972.

[70] R. Miller and C. Chang, “A modified Cramér-Rao bound and its applications (corresp.),” IEEE Trans. Inf. Theory, vol. 24, no. 3, pp. 398–400, 1978.

[71] H. L. Van Trees, Detection, Estimation, and Modulation theory, Part I: Detection, Estimation, and Linear Modulation Theory. John Wiley & Sons, 2004.

[72] R. Derryberry, S. Gray, D. Ionescu, G. Mandyam, and B. Raghothaman, “Transmit diversity in 3G CDMA systems,” IEEE Commun. Mag., vol. 40, no. 4, pp. 68–75, 2002.

[73] R. Hadani, S. Rakib, M. Tsatsanis, A. Monk, A. J. Goldsmith, A. F. Molisch, and R. Calderbank, “Orthogonal time frequency space modulation,” in Proc. IEEE Wireless Commun. Network Conf. (WCNC), 2017, pp. 1–6.

[74] B. Bamieh. (2018) “Discovering transforms: A tutorial on circulant matrices, circular convolution, and the discrete Fourier transform”. [Online]. Available: https://arxiv.org/abs/1805.05533

[75] N. Levanon and E. Mozeson, Radar Signals. John Wiley & Sons, 2004.

[76] D. Cohen and Y. C. Eldar, “Sub-Nyquist radar systems: Temporal, spectral, and spatial compression,” IEEE Signal Process. Mag., vol. 35, no. 6, pp. 35–58, 2018.

[77] M. A. Richards, Fundamentals of Radar Signal Processing. McGraw-Hill Education, 2005.

[78] P. Stoica, H. He, and J. Li, “On designing sequences with impulse-like periodic correlation,” IEEE Signal Process. Lett., vol. 16, no. 8, pp. 703–706, 2009.

[79] O. Chterental and D. Ž. Doković, “On orthostochastic, unistochastic and qustochastic matrices,” Linear Algebra and Its Applications, vol. 428, no. 4, pp. 1178–1201, 2008.

[80] L. T. DeCarlo, “On the meaning and use of kurtosis,” Psychological Methods, vol. 2, no. 3, p. 292, 1997.

[81] I. Abou-Faycal, M. Trott, and S. Shamai, “The capacity of discrete-time memoryless rayleigh-fading channels,” IEEE Trans. Inf. Theory, vol. 47, no. 4, pp. 1290–1301, 2001.

[82] M. Gursoy, H. Poor, and S. Verdu, “The noncoherent Rician fading channel-part I: Structure of the capacity-achieving input,” IEEE Trans. Wireless Commun., vol. 4, no. 5, pp. 2193–2206, 2005.

[83] ——, “Noncoherent Rician fading channel-part II: Spectral efficiency in the low-power regime,” IEEE Trans. Wireless Commun., vol. 4, no. 5, pp. 2207–2221, 2005.

[84] C. Xing, S. Wang, S. Chen, S. Ma, H. V. Poor, and L. Hanzo, “Matrix-monotonic optimization − Part I: Single-variable optimization,” IEEE Trans. Signal Process., vol. 69, pp. 738–754, 2021.

[85] ——, “Matrix-monotonic optimization − Part II: Multi-variable optimization,” IEEE Trans. Signal Process., vol. 69, pp. 179–194, 2021.

[86] C. Xing, S. Ma, and Y. Zhou, “Matrix-monotonic optimization for MIMO systems,” IEEE Trans. Signal Process., vol. 63, no. 2, pp. 334–348, 2015.

[87] J. Barrueco, J. Montalban, E. Iradier, and P. Angueira, “Constellation design for future communication systems: A comprehensive survey,” IEEE Access, vol. 9, pp. 89 778–89 797, 2021.

[88] J. Cho and P. J. Winzer, “Probabilistic constellation shaping for optical fiber communications,” J. Lightwave Technol., vol. 37, no. 6, pp. 1590–1607, 2019.

[89] R. W. Yeung, Information Theory and Network Coding. Springer Nature, 2008.

[90] S. P. Boyd and L. Vandenberghe, Convex Optimization. Cambridge University Press, 2004.

[91] Y.-F. Liu, T.-H. Chang, M. Hong, Z. Wu, A. Man-Cho So, E. A. Jorswieck, and W. Yu, “A survey of recent advances in optimization methods for wireless communications,” IEEE J. Sel. Areas Commun., vol. 42, no. 11, pp. 2992–3031, 2024.

[92] M. Biguesh and A. B. Gershman, “Training-based MIMO channel estimation: A study of estimator tradeoffs and optimal training signals,” IEEE Trans. Signal Process., vol. 54, no. 3, pp. 884–893, Feb. 2006.

[93] J. Li and P. Stoica, “MIMO radar with colocated antennas,” IEEE Signal Process. Mag., vol. 24, no. 5, pp. 106–114, Sept. 2007.

[94] D. Tse and P. Viswanath, Fundamentals of wireless communication. Cambridge university press, 2005.

[95] B. Tang, J. Tang, and Y. Peng, “Waveform optimization for MIMO radar in colored noise: Further results for estimation-oriented criteria,” IEEE Trans. Signal Process., vol. 60, no. 3, pp. 1517–1522, Nov. 2011.

[96] L. Bottou, “Online learning and stochastic approximations,” Online Learning in Neural Networks, vol. 17, no. 9, p. 142, 1998.

[97] A. Liu, V. K. Lau, and B. Kananian, “Stochastic successive convex approximation for non-convex constrained stochastic optimization,” IEEE Trans. Signal Process., vol. 67, no. 16, pp. 4189–4203, Jul. 2019.

[98] A. Goldsmith, Wireless communications. Cambridge university press, 2005.

[99] M. F. Keskin, M. M. Mojahedian, J. O. Lacruz, C. Marcus, O. Eriksson, A. Giorgetti, J. Widmer, and H. Wymeersch. (2024) “Fundamental trade-offs in monostatic ISAC: A holistic investigation towards 6G”. [Online]. Available: https://arxiv.org/abs/2401.18011

[100] Y. C. Eldar and G. Kutyniok, Compressed Sensing: Theory and Applications. Cambridge university press, 2012.

[101] A. Li, D. Spano, J. Krivochiza, S. Domouchtsidis, C. G. Tsinos, C. Masouros, S. Chatzinotas, Y. Li, B. Vucetic, and B. Ottersten, “A tutorial on interference exploitation via symbol-level precoding: Overview, state-of-the-art and future directions,” IEEE Commu. Surv. Tut., vol. 22, no. 2, pp. 796–839, 2020.

[102] S. T. Chung and A. Goldsmith, “Degrees of freedom in adaptive modulation: A unified view,” IEEE Trans. Commun., vol. 49, no. 9, pp. 1561–1571, 2001.

[103] A. Li and C. Masouros, “A two-stage vector perturbation scheme for adaptive modulation in downlink MU-MIMO,” IEEE Trans. Veh. Technol., vol. 65, no. 9, pp. 7785–7791, 2016.

[104] C. Masouros and G. Zheng, “Exploiting known interference as green signal power for downlink beamforming optimization,” IEEE Trans. Signal Process., vol. 63, no. 14, pp. 3628–3640, 2015.

[105] M. Ahmadipour, M. Wigger, and M. Kobayashi, “Coding for sensing: An improved scheme for integrated sensing and communication over MACs,” in Proc. IEEE ISIT, 2022, pp. 3025–3030.

[106] K. Meng, C. Masouros, G. Chen, and F. Liu, “Network-level integrated sensing and communication: Interference management and BS coordination using stochastic geometry,” IEEE Trans. Wireless Commun., vol. 23, no. 12, pp. 19 365–19 381, 2024.

[107] K. Meng, C. Masouros, A. P. Petropulu, and L. Hanzo, “Cooperative ISAC networks: Opportunities and challenges,” IEEE Wireless Commun., pp. 1–8, 2024.

[108] ——, “Cooperative ISAC networks: Performance analysis, scaling laws and optimization,” IEEE Trans. Wireless Commun., pp. 1–1, 2024.

[109] G. Cheng, Y. Fang, J. Xu, and D. W. K. Ng, “Optimal coordinated transmit beamforming for networked integrated sensing and communications,” IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 8200–8214, 2024.

[110] Y. Huang, Y. Fang, X. Li, and J. Xu, “Coordinated power control for network integrated sensing and communication,” IEEE Trans. Veh. Technol., vol. 71, no. 12, pp. 13 361–13 365, 2022.

[111] Z. Lyu, G. Zhu, and J. Xu, “Joint maneuver and beamforming design for uav-enabled integrated sensing and communication,” IEEE Trans. Wireless Commun., vol. 22, no. 4, pp. 2424–2440, 2023.

[112] G. Cheng, X. Song, Z. Lyu, and J. Xu. (2024) “Networked isac for low-altitude economy: Coordinated transmit beamforming and uav trajectory design”. Submitted to IEEE Trans. Wireless Commun. [Online]. Available: https://arxiv.org/abs/2406.16946

[113] Z. Wei, F. Liu, C. Masouros, N. Su, and A. P. Petropulu, “Toward multi-functional 6G wireless networks: Integrating sensing, communication, and security,” IEEE Commun. Mag., vol. 60, no. 4, pp. 65–71, 2022.

[114] N. Su, F. Liu, Z. Wei, Y.-F. Liu, and C. Masouros, “Secure dual-functional radar-communication transmission: Exploiting interference for resilience against target eavesdropping,” IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 7238–7252, 2022.

[115] N. Su, F. Liu, and C. Masouros, “Secure radar-communication systems with malicious targets: Integrating radar, communications and jamming functionalities,” IEEE Trans. Wireless Commun., vol. 20, no. 1, pp. 83–95, 2021.

[116] J. Zou, C. Masouros, F. Liu, and S. Sun, “Securing the sensing functionality in ISAC networks: An artificial noise design,” IEEE Trans. Veh. Technol., vol. 73, no. 11, pp. 17 800–17 805, 2024.

[117] O. Günlü, M. R. Bloch, R. F. Schaefer, and A. Yener, “Secure integrated sensing and communication,” IEEE J. Sel. Areas Inf. Theory, vol. 4, pp. 40–53, 2023.

[118] Y. Cui, X. Cao, G. Zhu, J. Nie, and J. Xu, “Edge perception: Intelligent wireless sensing at network edge,” IEEE Commun. Mag., 2024, early access.

[119] G. Zhu, Z. Lyu, X. Jiao, P. Liu, M. Chen, J. Xu, S. Cui, and P. Zhang, “Pushing ai to wireless network edge: An overview on integrated sensing, communication, and computation towards 6G,” Science China Information Sciences, vol. 66, no. 3, p. 130301, 2023.

[120] B. Geiger, F. Liu, S. Lu, A. Rode, and L. Schmalen. (2025) “Joint optimization of geometric and probabilistic constellation shaping for OFDM-ISAC systems”. [Online]. Available: https://arxiv.org/abs/2501.11583

[121] Y. Chen, H. Hua, J. Xu, and D. W. K. Ng, “ISAC meets SWIPT: Multi-functional wireless systems integrating sensing, communication, and powering,” IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 8264–8280, 2024.

[122] Y. Chen, Z. Ren, J. Xu, Y. Zeng, D. Ng, and S. Cui. (2024) “Integrated sensing, communication, and powering (ISCAP): Towards multi-functional 6G wireless networks”. Submitted to IEEE Trans. Wireless Commun. [Online]. Available: https://arxiv.org/abs/2401.03516

**本页范围与校对状态：** 本页依据 arXiv:2502.10819v1（cs.IT，2025-02-15，25 页）完成全文中文翻译：摘要、索引词、第 I—VII 节全部正文与 A/B 小节、结论、图 1—13 中文图注、表 I 逐格转录、参考文献 [1]—[122] 英文原条目（按原编号）。公式编号 (1)—(94) 按原文保留。表 I 的峰度数值已用 PDF 第 13 页渲染图逐格核对。原文为教程/综述论文，不含附录、作者简介等非正文内容，故本页不含。**逐句逐式终校未做**；图内曲线未作数字化读取，只转录图注与正文给出的关键数值；参考文献未联网核验 DOI、页码与在线链接；图 1—2、5、9 等示意图按正文与图注转写，未逐像素核对。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
