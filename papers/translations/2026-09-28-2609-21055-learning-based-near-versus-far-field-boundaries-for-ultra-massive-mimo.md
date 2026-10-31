---
layout: page
title: "超大规模 MIMO 近场与远场边界的学习方法｜中文全文译文"
permalink: /papers/translations/2026-09-28-2609-21055-learning-based-near-versus-far-field-boundaries-for-ultra-massive-mimo/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/b4efda7fab668f1f/) · [原文 arXiv](https://arxiv.org/abs/2609.21055) · [全部目录](/papers/catalog/)

# 超大规模 MIMO 近场与远场边界的学习方法

**原题：** Learning-based near- versus far-field boundaries for ultra-massive MIMO communications  
**作者：** Simon Tarboush$^{*}$、Nour Kouzayha$^{\dagger}$、Hadi Sarieddeen$^{\ddagger}$、Tareq Y. Al-Naffouri$^{\dagger}$、Giuseppe Caire$^{*}$  
**单位：** $^{*}$ 柏林工业大学电气工程与计算机科学学院通信与信息论教研室（Technische Universität Berlin），德国柏林；$^{\dagger}$ 阿卜杜拉国王科技大学（KAUST）计算机、电气与数学科学与工程学部（CEMSE）电气与计算机工程专业，沙特阿拉伯图瓦勒；$^{\ddagger}$ 贝鲁特美国大学（AUB）电气与计算机工程系，黎巴嫩。邮箱：simon.tarboush、caire@tu-berlin.de；nour.kouzayha、tareq.alnaffouri@kaust.edu.sa；hadi.sarieddeen@aub.edu.lb。  
**版本：** 已录用发表于 IEEE NextGCom 2026（原文标注 Copyright ©2026 IEEE）；arXiv:2609.21055v1（cs.IT），2026 年 9 月 17 日；原文 4 页。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—V 节、资助声明、图 1—2 中文图注、表 I 逐格转录、参考文献 [1]—[18]（英文原条目，按原编号）均按原文结构录入；原文为 4 页会议短文，无附录与作者简介。逐句逐式终校未做。

## 摘要

无线通信与感知的信号处理技术在近场传播区制与远场传播区制之间有着根本差异。因此，准确识别适用的传播区域，对于在超大规模 MIMO（ultra-massive MIMO, UM-MIMO）系统中实现高效波束成形与信道估计至关重要。本文提出一种**完全无监督**的学习框架，仅基于接收信号测量来区分近场与远场传播，且是在估计通信距离**之前**、**不依赖信道状态信息**地进行判别。所提方法利用 UM 阵列各子阵之间接收信号的空间功率变化，作为受物理启发的特征提取阶段，随后采用 OPTICS 聚类算法推断通信区域。在不同系统配置与不同信噪比（SNR）水平下的仿真结果表明，所提方法能准确识别近场与远场区域，并与理论边界保持一致。

**索引词：** 近/远场分类、平面波传播、球面波传播、无监督学习。

## I. 引言

超大规模多输入多输出（UM-MIMO）系统拥有数千个天线阵元（antenna element, AE）[1]、[2]，正在塑造未来无线通信的形态。受带宽需求驱动，工作频率正从 sub-6 GHz 向中高频段 [3]、毫米波与太赫兹（THz）频段 [4] 迁移。空间与频谱自由度的这些进展，对满足下一代网络日益增长的需求至关重要。

UM 阵列孔径与极短波长的结合，从根本上改变了电磁传播特性。特别地，远场假设不再普遍成立，即使在中等的通信距离下，近场通信也变得不可避免 [5]、[6]。与仅考虑相位变化的远场平面波模型（planar wave model, PWM）不同，辐射近场需要球面波模型（spherical wave model, SWM）来准确刻画幅度与相位变化，这显著增加了信号处理的复杂度。

已有大量研究从理论上定义了近场/远场边界，所用判据包括相位变化（如经典 Rayleigh 距离（RD）及其 MIMO 扩展 [7]）、阵列与波束成形增益（有效 Rayleigh 距离（ERD）[8] 与 Björnson 距离 [9]）、信道增益与秩 [10]、[11]、信号幅度与相位变化 [12]、信道容量 [13]，以及宽带系统的带宽感知近场判据 [14] 等 [15]。然而，评估这些边界通常需要先验已知通信距离、阵列孔径、到达角或离开角等参数。遗憾的是，实践中这些信息在初始接入阶段一般不可得，而是在链路建立之后才被估计。我们的前期工作 [6]、[16] 已表明，在进行信道估计或波束成形之前识别适用的传播区制，可以显著提高估计精度并降低计算复杂度。然而，这些方案依赖启发式规则来确定场边界，且在低信噪比（SNR）区制下性能退化——而在实际系统中，配置波束成形器与合并器之前的初始接入阶段恰恰常处于这种低 SNR 区制。此外，这些方法在多样且动态的环境中缺乏鲁棒性。

受这些挑战驱动，本文提出一种**完全无监督**的学习框架，仅基于接收信号测量来区分近场与远场传播区域。所提方法不依赖信道状态信息、用户位置或带标签的训练数据。具体地，在子阵式阵列（array-of-subarrays, AoSA）架构中，先计算各子阵接收信号之间的成对功率差，并将其作为物理启发的特征；随后用 OPTICS 聚类算法处理这些特征，以推断底层传播区制。

## II. 系统模型与问题表述

我们考虑一个带宽为 $B$、中心频率为 $f_c$ 的下行窄带多用户单载波系统。进一步假设 AoSA 架构包含 $Q_T$ 个发射子阵（subarray, SA）与 $Q_R$ 个接收 SA，其中每个发射与接收 SA 分别采用由 $\bar Q_T$ 与 $\bar Q_R$ 个 AE 构成的均匀线阵（ULA），从而形成 $Q_R\bar Q_R\times Q_T\bar Q_T$ 的 UM-MIMO 配置，如图 1 所示。每个 SA 仅连接一条射频（RF）链路，以符合功率与硬件约束；每个 AE 连接一个模拟有限分辨率移相器。具体地，对第 $q_T$ 个 SA，波束成形向量具有恒模与可变相移，相移取自集合 $\left\{0,\frac{2\pi}{2^{Q_T^{\mathrm{quant}}}},\ldots,\frac{2\pi(2^{Q_T^{\mathrm{quant}}}-1)}{2^{Q_T^{\mathrm{quant}}}}\right\}$（对应 $Q_T^{\mathrm{quant}}$ 位量化移相器）。接收端 RF 合并器遵循与发射端相同的假设。

（图 1 见"图注与表注"一节。）

精确的信道模型在任意通信距离下都采用 SWM。对第 $q_T$ 个发射（Tx）SA 与第 $q_R$ 个接收（Rx）SA 之间的频率选择性时不变信道，UM-MIMO 信道由所有 AE 对之间信道增益 $h^{\mathrm{SWM}}(\bar q_R,\bar q_T)$ 汇集而成 [17]：

$$
\mathbf H_{q_R,q_T}^{\mathrm{SWM}}=\begin{bmatrix}h^{\mathrm{SWM}}(1,1)&\cdots&h^{\mathrm{SWM}}(1,\bar Q_T)\\ \vdots&h^{\mathrm{SWM}}(\bar q_R,\bar q_T)&\vdots\\ h^{\mathrm{SWM}}(\bar Q_R,1)&\cdots&h^{\mathrm{SWM}}(\bar Q_R,\bar Q_T)\end{bmatrix},\tag{1}
$$

$$
h^{\mathrm{SWM}}(\bar q_R,\bar q_T)=\sqrt{\frac{1}{L}}\sum_{\ell=1}^{L}\alpha_\ell\left(f_c,d_\ell(\bar q_R,\bar q_T)\right)e^{-j\frac{2\pi}{\lambda_c}d_\ell(\bar q_R,\bar q_T)},\tag{2}
$$

其中 $L$ 表示路径数，$\alpha_\ell$ 为第 $\ell$ 条复路径增益，$\lambda_c=\frac{c_0}{f_c}$ 为波长（$c_0$ 为光速），$d_\ell(\bar q_R,\bar q_T)$ 为第 $\bar q_T$ 个发射 AE 与第 $\bar q_R$ 个接收 AE 之间第 $\ell$ 条传播路径的长度。路径增益在各 AE 间变化——即使对视线路径也是如此——因为路径损耗包含扩散损耗与分子吸收损耗，二者都随载频与通信距离变化（更多细节以及信道模型表达式见 [6]、[17]）。

当发射端与接收端之间的通信距离远大于阵列孔径时，PWM 可近似 SWM。因此式（2）中的距离 $d_\ell(\bar q_R,\bar q_T)$ 会用远场假设近似 [7]：远场下两个 AE 的信道增益只在相位上不同，相位差取决于 AE 间距与离开角（AoD）$\theta$（或到达角（AoA）$\phi$）[6]。于是信道响应为

$$
\mathbf H_{q_R,q_T}^{\mathrm{PWM}}=\sqrt{\frac{\bar Q_R\bar Q_T}{L}}\sum_{\ell=1}^{L}\alpha_\ell\left(f_c,d_\ell^{\mathrm{FF}}\right)e^{-j\frac{2\pi}{\lambda_c}d_\ell^{\mathrm{FF}}}\mathbf a_R(\phi_\ell)\mathbf a_T^{\top}(\theta_\ell),\tag{3}
$$

其中 $d^{\mathrm{FF}}$ 按远场近似计算，$\theta,\phi\in[-\pi/2,\pi/2]$，发射/接收阵列响应向量 $\mathbf a_T(\cdot)\in\mathbb C^{\bar Q_T\times1}$ / $\mathbf a_R(\cdot)\in\mathbb C^{\bar Q_R\times1}$ 为

$$
\mathbf a(\theta)=\frac{1}{\sqrt{\bar Q}}\left[e^{j\frac{2\pi}{\lambda_c}\delta\sin(\theta)\bar{\mathbf q}}\right],\tag{4}
$$

其中 $\bar{\mathbf q}=\left[0,1,\cdots,\bar Q-1\right]^{\top}$，$\delta$ 为 AE 间距。

由式（1）与（3）可见，不同信道模型所包含的未知参数不同。通常，近场适用的信道模型——进而适用的信道估计与波束成形策略——是 SWM，而 PWM 已被证明在远场区域足够准确。然而在实际场景中，移动终端会在系统的近场区域与远场区域之间迁移。这要求在接收端启动任何信号处理技术之前，先确定用户所处的区域。

## III. 提出的机器学习框架

尽管监督学习具备分类能力，但它在这里并不合适：一是用已知标签区分近场与远场信号本身较为简单；二是更根本的问题在于，任何距离标签都会偏向其所用的真值边界，而不同边界采用不同的方法/度量来区分这些区域。

所提方案首先进行**波束训练阶段**以采集若干测量；随后利用每条 RF 链的接收信号计算功率变化度量 $\eta$，由其构造特征矩阵并输入无监督聚类算法。$\eta$ 的直观含义是概括所有 Rx SA 上接收功率的变异性。在第二阶段，采用**基于排序点识别聚类结构（ordering points to identify the clustering structure, OPTICS）**[18] 聚类算法作为核心无监督学习部分。

在波束训练过程中，发射端与接收端使用预先计算并存储于波束码本中的随机波束成形与合并权重，这些权重通过对角度做均匀随机采样得到。发射波束成形权重从参考 Tx SA 发出，同时通过随机合并在所有 Rx SA 上接收导频。在该阶段，$\mathbf f_{m_T}$ 与 $\mathbf w_{m_R}$ 分别表示波束成形与合并权重向量，其中 $M_T$ 为发射波束成形测量次数，$M_R$ 为接收端不同合并测量的次数。

因此，对第 $q_T$ 个 Tx SA 经过总共 $M_R\times M_T$ 个训练波束后，接收信号可表示为 [6]

$$
\mathbf Y_{q_R,q_T}=\sqrt{P}\mathbf W^H\mathbf H_{q_R,q_T}^{\mathrm{SWM}}\mathbf F+\mathbf W^H\mathbf N,\tag{5}
$$

其中 $P$ 为训练阶段每次传输的总功率，$\mathbf W=\left[\mathbf w_1,\mathbf w_2,\cdots,\mathbf w_{M_R}\right]^{\top}$ 为 $\bar Q_R\times M_R$ 合并矩阵，$\mathbf F=\left[\mathbf f_1,\mathbf f_2,\cdots,\mathbf f_{M_T}\right]^{\top}$ 为 $\bar Q_T\times M_T$ 波束成形矩阵，$\mathbf N$ 为 $M_R\times M_T$ 噪声矩阵，由噪声向量 $\mathbf n\sim\mathcal{CN}\left(0,\sigma_n^2\mathbf I\right)$ 构成，$\sigma_n^2$ 为噪声功率。

尽管确定场边界看似复杂，但可以利用近场与远场的物理特性：可以预期，远场区域各 SA 之间的信号变化极小，而近场区域则出现显著变化。因此，我们按式（5）接收信号的向量化形式定义归一化向量 $\boldsymbol\chi_{q_r,1}=\frac{\left|\operatorname{vec}\left(\mathbf Y_{q_R,1}\right)\right|}{\left\|\operatorname{vec}\left(\mathbf Y_{q_R,1}\right)\right\|}$。选择度量 $\eta$ 捕捉所有 Rx SA 上接收功率的最大变化，定义为

$$
\eta=\max\left\{\left[\eta_{1,2},\cdots,\eta_{r,c},\cdots,\eta_{Q_R-1,Q_R}\right]\right\},\qquad \eta_{r,c}=\left(\boldsymbol\chi_{q_r,1}-\boldsymbol\chi_{q_c,1}\right)^H\left(\boldsymbol\chi_{q_r,1}-\boldsymbol\chi_{q_c,1}\right),\tag{6}
$$

其中 $r=\{1,\cdots,Q_R-1\}$、$c=\{r+1,\cdots,Q_R\}$。该阶段的输出（$\eta$ 的取值）相当于典型机器学习流程中的特征提取过程。

有了预处理后的特征，框架采用 OPTICS 聚类进行无监督学习。与 K-means 或层次聚类等传统聚类方法不同——后者需要预先知道簇数，且常假设簇为球形或大小均匀——OPTICS 旨在发现任意形状与密度的簇。这使其特别适合当前问题：近场与远场区域之间的空间过渡往往是渐进而非均匀的，并强烈受天线几何、用户位置与底层传播环境影响。OPTICS 的工作方式是扫描所有输入数据点（即各接收位置上的 $\eta$ 值），评估每个点与其邻居的连接紧密程度；它不直接把点分配给簇，而是产生一个有序列表，反映每个点与周围点的连接紧松程度，从而增强其处理多密度簇的能力。

## IV. 数值结果

为评估所提框架的性能，我们使用 TeraMIMO 信道模拟器 [17] 仿真一个 THz 频段 UM-MIMO 系统，系统参数汇总于表 I。我们强调，所有仿真都使用 SWM 信道模型，因为它是所有通信距离下最准确的模型。测量在 $30\,\mathrm{m}\times30\,\mathrm{m}$ 的二维网格上采集，分辨率为 1 m。在每个点上、对每种测量配置，都进行若干次信道与噪声实现。我们强调，模型既不能直接获得信道矩阵，也不能直接获得接收端的 $x$—$y$ 位置。在我们的框架内，尽管 OPTICS 不需要预定义的簇数，但最终仍需要二值化的近场/远场判决。实现上，按各 OPTICS 簇的平均功率变化特征对簇排序：先按平均特征值对簇排序，把最大簇判为近场，因为 $\eta$ 越大意味着空间功率变化越强；其余簇都判为远场；随后按最近的观测 $\eta$ 为噪声点赋值。这样在进行二值聚类的同时，仍让 OPTICS 根据输入特征自然识别出一致且良好分离的区域。注意我们也尝试了若干其他聚类算法，如 K-means 与凝聚层次聚类，但其识别结果没有意义，因此本文只呈现关键结果以传达主要发现。

在评估图 2 的数值结果时，我们还加入了一些参考边界，其解析表达式见 [11, 表 I]，定义如下：

- **MIMO-ARD [7]**：MIMO 信道与采用近场阵列响应向量的信道模型之间的最大相位误差不超过 $\frac{\pi}{8}$。
- **有效 RD（ERD）[8]**：远场模型下的归一化波束成形增益不低于用近场计算所得波束成形增益的 95%。
- **等功率线 [10]**：归一化接收功率近似等于 1。
- **阈值距离 [15]**：SWM 与 PWM 最大特征值之比等于预先给定的阈值。

图 2 表明，所提方案始终能识别出良好分离的近场（红色）与远场（蓝色）区域。即使采用不同的训练测量比例，分类仍然鲁棒，仅在场的过渡边界处有极小的精度损失。然而在 SNR $=-4$ dB 时，会出现一些退化，表现为散落的误判点，在最低训练比例下尤为明显。我们省略了高 SNR 的图，因为那不是实际场景。此外，令人意外的是，聚类结果与 ERD 边界 [8] 吻合得相当好——这是合理的，因为我们使用远场随机波束训练并度量了接收信号之间的功率差。再次说明，实践中通信距离是在信道估计与定位流程之后才被估计的。与 ERD 的这种强烈一致性尤其有趣，因为我们的框架不需要用户位置、传播距离或阵列几何等任何知识。关于计算复杂度，尽管原始接收测量可能维度很高，但经特征提取后，OPTICS 的输入只是一组标量 $\eta$ 观测（每个位置一个）；此外，特征提取的计算量随接收 SA 数而非 AE 总数扩展。因此，所提方法以很小的计算负载提供了可扩展的解决方案。

## V. 结论

本文提出了一种用于 UM-MIMO 阵列系统近场与远场识别的完全无监督学习框架。我们提出的无监督学习框架能够基于近场与远场信号的固有特性有效地对其分类，并在低接收 SNR 水平下也判定当前用户处于近区还是远区。通过把接收信号变化用作特征并应用 OPTICS 聚类，我们在不需要用户位置、信道真值或监督训练的情况下实现了鲁棒分类。

## 资助声明

S. Tarboush 的工作受欧盟「地平线欧洲」玛丽·斯克沃多夫斯卡-居里博士网络计划 "Intelligent sensing and communication as training network for perceptive mobile networks in 6G (ISAC-NEWTON)"（Grant 101169496）资助。G. Caire 的工作受德国 BMFTR 在 "Souverän. Digital. Vernetzt." 计划下的联合项目 6G-RIC（Project IDs 16KISK030）资助。N. Kouzayha 与 T. Y. Al-Naffouri 的工作受 KAUST 赞助研究办公室（OSR）Award No. ORFS-CRG12-2024-6478 资助。H. Sarieddeen 的工作受 AUB 大学研究委员会（URB）与垂直整合项目（VIP）计划资助。

## 图注与表注

### 表 I：仿真参数（原 PDF 第 3 页）

| 参数 | 取值 |
|---|---|
| 工作频率 $f_c$ | 0.3 THz |
| 系统带宽 $B$ | 1 GHz |
| 发射/接收子阵数 $Q_T/Q_R$ | 1/4 |
| 发射/接收阵元数 $\bar Q_T/\bar Q_R$ | 256/16 |
| 阵元间距 $\delta_T=\delta_R$ | $\{\frac{\lambda_c}{2}\}$ |
| 子阵间距 $\{\Delta_T,\Delta_R\}$ | $\{\bar Q_T\delta_T,\bar Q_R\delta_R\}$ |
| 训练波束数 $M_T/M_R$ | $\bar Q_T/n$ / $\bar Q_R$，$n\in\{2,4,8\}$ |
| 接收 SNR | $\{-4,0,4,8\}$（dB） |

### 图注

**图 1（原 PDF 第 2 页）：** 近场与远场区域识别问题示意：基站与多个用户均采用 UM-MIMO AoSA 架构。

**图 2（原 PDF 第 4 页）：** 不同 SNR 水平与波束训练配置下的近场（红色）与远场（蓝色）区域识别结果。子图对应 (a) SNR$=$0 dB、$M_T=\bar Q_T/2$；(b) SNR$=$0 dB、$M_T=\bar Q_T/4$；(c) SNR$=$0 dB、$M_T=\bar Q_T/8$；(d) SNR$=-4$ dB、$M_T=\bar Q_T/2$；(e) SNR$=-4$ dB、$M_T=\bar Q_T/4$；(f) SNR$=-4$ dB、$M_T=\bar Q_T/8$。图中还叠加了 MIMO-ARD、等功率线、有效 RD（ERD）与阈值距离四条参考边界。

## 参考文献（英文原书目）

以下按原 PDF 的编号逐条转录英文书目，保留英文原貌与原始编号；本页未翻译条目文字，也未联网核验 DOI 与在线链接。

[1] Z. Wang et al., "A tutorial on extremely large-scale MIMO for 6G: Fundamentals, signal processing, and applications," IEEE Commun. Surveys Tuts., vol. 26, no. 3, pp. 1560–1605, 2024.

[2] H. Lu et al., "A tutorial on near-field XL-MIMO communications towards 6G," IEEE Commun. Surveys Tuts., vol. 26, no. 4, pp. 2213–2257, 2024.

[3] E. Björnson et al., "Enabling 6G performance in the upper mid-band by transitioning from massive to gigantic MIMO," IEEE Open J. of the Commun. Soc., vol. 6, pp. 5450–5463, 2025.

[4] H. Sarieddeen, M.-S. Alouini, and T. Y. Al-Naffouri, "An overview of signal processing techniques for terahertz communications," Proc. IEEE, vol. 109, no. 10, pp. 1628–1665, August 2021.

[5] Y. Liu et al., "Near-field communications: A comprehensive survey," IEEE Commun. Surveys Tuts., vol. 27, no. 3, pp. 1687–1728, 2024.

[6] S. Tarboush, A. Ali, and T. Y. Al-Naffouri, "Cross-field channel estimation for ultra massive-MIMO THz systems," IEEE Trans. Wireless Commun., vol. 23, no. 8, pp. 8619–8635, 2024.

[7] Y. Lu and L. Dai, "Near-field channel estimation in mixed LoS/NLoS environments for extremely large-scale MIMO systems," IEEE Trans. Commun., vol. 71, no. 6, pp. 3694–3707, 2023.

[8] M. Cui and L. Dai, "Near-field wideband beamforming for extremely large antenna arrays," IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 13110–13124, 2024.

[9] E. Björnson, Ö. T. Demir, and L. Sanguinetti, "A primer on near-field beamforming for arrays and reconfigurable intelligent surfaces," in Proc. Asilomar Conf. Signals, Systems and Computers (Asilomar), 2021, pp. 105–112.

[10] L. Renwang, S. Shu, and T. Meixia, "Applicable regions of spherical and plane wave models for extremely large-scale array communications," China Communications, vol. 22, no. 5, pp. 128–151, 2025.

[11] S. Sun et al., "How to differentiate between near field and far field: Revisiting the Rayleigh distance," IEEE Commun. Mag., vol. 63, no. 1, pp. 22–28, 2025.

[12] H. Lu and Y. Zeng, "Communicating with extremely large-scale array/surface: Unified modeling and performance analysis," IEEE Trans. Wireless Commun., vol. 21, no. 6, pp. 4039–4053, November 2021.

[13] J.-S. Jiang and M. Ingram, "Spherical-wave model for short-range MIMO," IEEE Transactions on Communications, vol. 53, no. 9, pp. 1534–1541, 2005.

[14] N. Deshpande et al., "A wideband generalization of the near-field region for extremely large phased-arrays," IEEE Wireless Commun. Lett., vol. 12, no. 3, pp. 515–519, 2023.

[15] F. Bohagen, P. Orten, and G. E. Oien, "On spherical vs. plane wave modeling of line-of-sight MIMO channels," IEEE Trans. Commun., vol. 57, no. 3, pp. 841–849, 2009.

[16] S. Tarboush, A. Ali, and T. Y. Al-Naffouri, "Near or far: On determining the appropriate channel estimation strategy in cross-field communication," in Proc. IEEE Sensor Array and Multichannel Sig. Process. Workshop, 2024, pp. 1–5.

[17] S. Tarboush et al., "TeraMIMO: A channel simulator for wideband ultra-massive MIMO terahertz communications," IEEE Trans. Veh. Technol., vol. 70, no. 12, pp. 12325–12341, October 2021.

[18] M. Ankerst et al., "Optics: Ordering points to identify the clustering structure," ACM Sigmod record, vol. 28, no. 2, pp. 49–60, 1999.

**本页范围与校对状态：** 本页依据 arXiv:2609.21055v1（cs.IT，2026-09-17，4 页；已录用 IEEE NextGCom 2026）完成全文中文翻译：摘要、索引词、第 I—V 节、资助声明、图 1—2 中文图注、表 I 逐格转录、参考文献 [1]—[18] 英文原条目（按原编号）均按原文结构录入。编号公式 (1)—(6) 按原文保留（(1)(2) 球面波信道、(3)(4) 平面波信道与阵列响应、(5) 接收信号、(6) 功率变化特征）。表 I 已用 PDF 第 3 页渲染图逐格核对一致；图 1—2 的图注按原文第 2、4 页内容转录。**逐句逐式终校未做**；图 2 的区域识别地图未作数字化读取，只转录图注与正文给出的信息（如 SNR=-4 dB 处出现散落误判点、与 ERD 边界高度一致）；参考文献未联网核验 DOI、页码与在线链接。原文疑点已就地加注：①参考文献 [10] 的作者名在原文中写作 "L. Renwang, S. Shu, and T. Meixia"，第三位作者名序疑为原始排版/抽取所致，本页照原文转录、未擅自更正；②原文为 4 页会议短文，无附录、作者简介与代码链接；③表 I 中 "Tx/RX AEs" 的大小写与原文排版一致。本页为全文译稿，不宣称已通过逐式校对验收。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
