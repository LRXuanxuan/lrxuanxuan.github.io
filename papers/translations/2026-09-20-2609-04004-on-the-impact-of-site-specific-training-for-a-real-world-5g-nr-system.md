---
layout: page
title: "站点特定训练对真实 5G NR 系统的影响｜中文全文译文"
permalink: /papers/translations/2026-09-20-2609-04004-on-the-impact-of-site-specific-training-for-a-real-world-5g-nr-system/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/3b08e5da92d95b3b/) · [原文 arXiv](https://arxiv.org/abs/2609.04004) · [全部目录](/papers/catalog/)

# 站点特定训练对真实 5G NR 系统的影响

**原题：** On the Impact of Site-Specific Training for a Real-World 5G NR System  
**作者：** Reinhard Wiesmayr（共同第一作者）、Nuri Berke Baytekin（共同第一作者）、Chris Dick、Christoph Studer  
**版本：** arXiv:2609.04004v1（cs.IT），2026-09-03，原文 8 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VII 节（含 II-A/B/C、III-A/B、IV-A/B/C/D、V-A/B、VI-A/B/C 全部小节）、结论、图 1–9 图注、脚注与参考文献 [1]–[26]（英文原条目）按原文结构录入；原文无表格、无附录。逐句逐式终校未做。

## 摘要

站点特定训练可在不增加计算复杂度的前提下改善无线接收机性能。然而，迄今的真实世界结果主要针对完全可训练的神经接收机与单层传输。我们研究三种接收机架构的站点特定微调：完全可训练神经接收机、模型驱动神经接收机与基于模型的接收机。我们使用苏黎世联邦理工学院（ETH Zurich）符合标准的 5G NR 测试平台的新测量数据来训练与评估这些接收机，包含双层上行传输，并涵盖间隔超过六个月的两次测量活动。结果表明：站点特定微调（i）显著改善完全可训练与模型驱动神经接收机，而对可调性较低的基于模型接收机仅带来边际增益；（ii）使一个同时针对单层与双层传输联合微调的单神经接收机接近分别为每种配置单独微调的接收机；（iii）在间隔超过六个月的测量活动之间仍然有效。我们还研究了使用由合成信道或站点特定测量估计的协方差矩阵进行站点特定线性最小均方误差信道估计；当与迭代检测与解码结合时，站点特定信道估计取得了我们在数据集中观察到的最低错误率。我们的微调代码与测量数据集已公开。

## I. 引言

站点特定训练通过利用特定部署区域的典型传播条件与射频（radio frequency，RF）硬件损伤，来优化该区域的无线接收机性能。常见方法有两种：（i）**站点特定微调**——用带标签数据集、通过随机梯度下降（stochastic gradient descent，SGD）调谐接收机算法参数；（ii）**站点特定参数自适应**——为给定站点估计经典接收机算法的参数。站点特定微调已被应用于多种多输入多输出（multiple-input multiple-output，MIMO）数据检测器：完全可调神经接收机（neural receiver，NRX）[1]–[3]，可调性最高但复杂度也最高；基于模型的接收机 [4]，建立在低复杂度经典算法之上，只引入少量通过深度展开（deep unfolding）[5] 调谐的超参数；以及模型驱动神经接收机（model-driven neural receiver，MDX）[6]，在灵活性与复杂度之间取得平衡。站点特定参数自适应则包括利用为给定站点估计的信道统计量进行信道估计算法 [7]。

关于可训练接收机算法的大多数结果依赖合成数据 [1]–[3]、[7]。然而文献 [8] 表明，基于合成数据的结果可能过于乐观。[9] 中的研究在合成数据上训练 NRX，并用来自定制单天线软件定义无线电（software-defined radio，SDR）装置的真实世界测量验证其性能；该研究揭示，当训练所用信道特性与具体站点匹配时 NRX 效果更好。我们在 [10] 中关于站点特定 NRX 微调的初步实验表明，用真实世界测量数据微调非常有效，即使在使用未参与训练的用户设备（user equipment，UE）数据集上也能把块错误率（block error rate，BLER）减半。但这些初步结果仅限于一种接收机架构与单用户、单层 MIMO 传输。

### A. 贡献

本文研究以下问题。**问题 1：**[10] 中报告的重大微调增益是否也适用于（i）其他接收机架构、（ii）双层传输、（iii）时间上分离的测量活动？**问题 2：**站点特定微调的增益与站点特定参数自适应的增益相比如何？为回答问题 1，我们在三种接收机架构上评估站点特定微调的效力：（i）[3] 中的完全可调 NRX；（ii）[6] 中的 MDX；（iii）[4] 中基于模型的深度展开交织检测与解码（deep-unfolded interleaved detection and decoding，DUIDD）接收机。为评估微调对单层和/或双层传输的效力、以及其在相隔半年以上的测量活动之间的时间鲁棒性，我们使用 ETH Zurich 符合标准的 5G 新空口（5G New Radio，5G NR）测试平台 [11] 的既有与新增空口（over-the-air，OTA）测量数据集，包含单层与双层传输数据。为回答问题 2，我们研究站点特定参数自适应：对非迭代与迭代接收机，比较使用由合成数据与站点特定测量数据估计的协方差矩阵的线性最小均方误差（linear minimum mean square error，LMMSE）信道估计。复现本文结果所需的测量数据集与微调代码已公开。

### B. 相关工作

可训练接收机通常在随机信道模型上评估 [1]–[4]、[6]、[7]。站点特定射线追踪数据已被用于 NRX 微调 [12]，并与随机信道模型结合增强 [13]。真实世界数据的微调结果仅限于我们自己在 [10] 中的初步实验与后续独立工作 [14]：我们的初步工作 [10] 提出了基于混合自动重传请求（hybrid automatic repeat request，HARQ）的数据提取与 NRX 微调流水线，并在多个部署场景中展示了真实世界增益；[14] 报告在定制单天线 SDR 装置上，用合成与实测数据以及仅来自成功传输的比特标签调谐另一种 NRX 架构所获得的增益。与之不同，我们把 [10] 的初步结果扩展到多种接收机架构、双层传输以及时间上分离的测量活动。

经典接收机算法可适配特定部署站点，例如通过估计站点特定统计参数实现；LMMSE 信道估计即依赖信道协方差矩阵 [15]。基于高斯混合模型（Gaussian mixture model，GMM）的数据驱动信道估计器同样依赖信道统计量，但 [7] 中的方法仅在合成信道数据上训练与评估。近期空口结果表明，当用含噪信道估计作为标签时，用实测数据训练神经信道估计器的增益有限 [14]。与之不同，我们通过恰当考虑噪声统计量、从含噪最小二乘（least squares，LS）观测中估计站点特定协方差矩阵，并把所得接收机性能与使用合成信道协方差估计的性能比较。

## II. 可调接收机架构

我们聚焦三种用于微调实验的接收机架构，它们都使用 LS 信道估计；更强的 LMMSE 信道估计器在第 VI 节研究。

### A. 完全可调神经接收机（NRX）

第一种是 [3] 中面向 5G NR 物理上行共享信道（physical uplink shared channel，PUSCH）接收的卷积与图神经网络（convolutional and graph neural network，CGNN）架构，结合 [12, Sec. IV-B] 的多损失训练方案，构成的完全可调 NRX。在该架构中，卷积状态初始化层处理接收到的正交频分复用（orthogonal frequency division multiplexing，OFDM）资源网格、初始 LS 信道估计以及指示各资源单元（resource element，RE）到下一个解调参考信号（demodulation reference signal，DMRS）距离的位置编码；连续的展开 CGNN 迭代把消息传递与卷积状态更新结合；读出层把最终状态变换为编码比特的软输出。我们使用含八次展开 CGNN 迭代的 Deep NRX（[12] 中称 "Large NRX"）进行初始训练（称为预训练）与后续微调。预训练与微调后的 Deep NRX 模型在评估时于两次展开迭代后停止，即得到 Shallow NRX；Shallow NRX 与 Deep NRX 分别约有 $1.2\cdot10^5$ 与 $4.4\cdot10^5$ 个活跃参数。

### B. 模型驱动神经接收机（MDX）

第二种是 [6] 中的 MDX，它把传统接收机算法与一个小型神经网络（neural network，NN）结合，实现联合信道估计与数据检测。在该架构中，先由 DMRS 得到导频辅助 LS 信道估计，并用传统 LMMSE 均衡得到数据符号估计；随后对每一层，接收机减去来自其他各层的估计干扰，并把数据符号估计复用为导频，获得数据辅助（且有望改进）的 LS 信道估计。一个含四个残差块的二维残差网络（ResNet）再把导频辅助与数据辅助信道估计组合起来；最后，所得精化估计用于最终 LMMSE 最大对数软输出数据检测 [6]。可调参数包括 ResNet 权重，以及缩放两个 LMMSE 均衡器与软输出级所用噪声方差的系数；所评估实现约含 $2.5\cdot10^3$ 个可调参数。

### C. 基于模型的 DUIDD 接收机

第三种是基于模型的接收机，源自经典迭代检测与解码（iterative detection and decoding，IDD）[16]——它在软输入软输出 MMSE-PIC 检测器 [17] 与低密度奇偶校验（low-density parity-check，LDPC）消息传递（message passing，MP）解码器之间迭代交换软信息。DUIDD 架构把数据检测与信道解码交织，并应用深度展开，使软信息交换、解码器消息阻尼与解码器状态前传可调 [4]。在站点特定微调实验中，我们把未调谐的经典 IDD 作为基线，并与预训练、微调后的 DUIDD 接收机比较，后者各使用 $I=2$ 个 MMSE-PIC 数据检测级；我们还评估 $I=1$ 的经典 IDD，此时 MMSE-PIC 退化为非迭代 LMMSE 检测。每个 MMSE-PIC 检测级之后是 $N_i=N_{\mathrm{MP}}/I$ 次 LDPC MP 解码迭代，故所有基于模型的 IDD 与 DUIDD 接收机的 MP 解码迭代总数固定为 $N_{\mathrm{MP}}=12$。IDD 与 DUIDD 接收机使用在 NVIDIA Sionna 中实现的 flooding min-sum 校验节点（check node，CN）更新；DUIDD 还应用 [4] 中的可调消息阻尼，且仅含 30 个可调参数。与 NRX、MDX 不同，DUIDD 接收机在调谐时包含 LDPC MP 解码器；NRX 与 MDX 是可调 MIMO 检测器，评估时与外部解码器组合。对 NRX、MDX 与强大的实时 NVIDIA Aerial 接收机 [18]（称 "MMSE Reference Rx"），我们使用 NVIDIA pyAerial 的 LDPC MP 解码器，$N_{\mathrm{MP}}=10$ 次迭代，采用分层归一化 min-sum CN 更新。

> 脚注 2（原文）：使用 10 次分层迭代的 LDPC MP 解码通常优于 12 次 flooding 迭代。但该选择是受实现约束所致。

## III. 站点特定部署场景

下面描述本文考虑的多种部署场景。所有数据集都由 PUSCH 时隙样本组成，每个样本包含一次完整上行（uplink，UL）传输时隙的 OFDM 域接收信号。测量使用商用现货（commercial-off-the-shelf，COTS）UE，在 ETH Zurich 符合标准的 5G NR 测试平台 [11] 上、于图 1 所示两个室内部署场景中获得。该测试平台基于 NVIDIA Aerial Testbed（ATB）软件平台 [19]，使用商用开放无线接入网（open RAN）无线单元（O-RU），每个含四根天线，带宽 100 MHz、中心频率 3.45 GHz、273 个物理资源块（physical resource block，PRB），子载波间隔 30 kHz，时分双工（time-division duplexing，TDD）时隙图样 3DSU（3 个下行（DL）、1 个特殊、1 个 UL）。用 `iperf3` 工具产生连续应用层上行流量，同时每次携带一个 UE 沿随机轨迹通过测量区域。测试平台从服务 O-RU 的前传接口记录每个时隙样本。用于微调与评估的时隙样本遵循图 2 所示 OFDM 资源网格。测试平台配置为低 PUSCH 信噪比（signal-to-noise ratio，SNR）目标，此时以 10% 目标 BLER 配置的链路自适应算法调度 16-QAM 传输；因此我们的测量捕捉了 MMSE Reference Rx 的 BLER—SNR 瀑布区内具有挑战性的工作点。

### A. 室内小实验室场景

**1）2025 年 11 月单层传输数据集。** 第一次测量活动于 2025 年 11 月在室内小实验室进行，此前已在 [10] 中描述。该场景覆盖约 $3.5\,\mathrm m\times3.5\,\mathrm m$ 的测量区域，周围是办公桌与实验室设备。四个 O-RU 布置在测量区域周围；服务 O-RU 位于右上角，与图 1a 中类似装置一致。该测量活动包含两次单层测量，分别使用 Samsung Galaxy S23 与 Apple iPhone 14 Pro，PUSCH SNR 目标为 7 dB。

**2）2026 年 6 月单层与双层传输数据集。** 第二次测量活动于 2026 年 6 月进行，仍在同一小实验室环境，距上述活动超过半年。该场景现覆盖 $5\,\mathrm m\times4\,\mathrm m$ 测量区域，仅有一个服务 O-RU，且无被动监听设备。该活动包含两次测量：单层测量使用 Samsung Galaxy S23、PUSCH SNR 目标 5 dB；双层测量使用 Google Pixel 9 Pro、目标 12 dB。单层传输始终使用码分复用（code division multiplexing，CDM）组 0 中的 DMRS 端口 0，双层传输分别使用 CDM 组 0 与 1 中的 DMRS 端口 0 与 2。

### B. 室内大办公室楼层场景

**1）2025 年 11 月单层传输数据集。** 第一次测量活动于 2025 年 11 月在室内大办公室楼层进行，此前已在 [10] 中描述。该场景约 $50\,\mathrm m\times30\,\mathrm m$，测量区域覆盖走廊与部分相邻房间，提供视距（line-of-sight，LOS）与非视距（non-line-of-sight，NLOS）传播条件。该活动包含两次单层测量，所用 UE 与 SNR 目标与 2025 年 11 月小实验室对应测量相同。

**2）2026 年 6 月单层与双层传输数据集。** 第二次测量活动于 2026 年 6 月进行，仍在同一大办公室楼层环境，距上述 2025 年 11 月活动超过半年。该场景现覆盖办公楼层的较小区域，包括约 $16\,\mathrm m\times12.5\,\mathrm m$ 的走廊区域，服务 O-RU 部署如图 1b 所示。单层与双层测量使用与 2026 年 6 月小实验室对应测量相同的 UE、上行层（uplink layer，ULL）配置、SNR 目标与 DMRS 配置。

## IV. 评估协议

下面详述数据提取流程、站点特定微调流程与性能评估方法。

### A. 微调数据提取流水线

我们把 [10] 的站点特定微调与评估流水线扩展到本文考虑的接收机架构与 ULL 配置。对每个记录的时隙样本，流水线从 NVIDIA Data Lake [20] 提取 OFDM 域接收信号以及相应调度与接收机配置。成功传输的真值比特标签由解码载荷比特得到；对失败传输，我们跟踪其 HARQ 进程，并从后续成功重传中获取载荷比特，然后按初始传输的冗余版本与扰码配置重新编码载荷比特，以重建其编码比特标签 [10]。我们保留 16-QAM 且调制编码方案（modulation and coding scheme，MCS）索引为 6–10 的时隙样本（依 [21, Table 5.1.3.1-2]）。对 DUIDD 微调与图 7 中相应接收机比较，我们把数据限制为 MCS 索引 10 与一种扰码配置。MDX、非迭代 LMMSE 接收机以及 IDD 与 DUIDD 接收机使用 NVIDIA pyAerial 噪声与干扰估计器 [22] 返回的标量预均衡宽带噪声方差估计；NRX 不需要此类噪声方差估计。

### B. 微调与测试的数据集划分

对每次测量活动与每种 ULL 配置，我们构造互不相交的微调与测试数据集。2025 年 11 月数据集（来自我们先前工作 [10]）采用跨 UE 的微调与测试划分；每个新的 2026 年 6 月数据集在人工选定的时间戳处划分为两个时间上不相交的微调与测试数据集，因为每次 2026 年 6 月测量只使用一个 UE。我们构造每个微调与测试数据集，使其约 10% 的传输块在 MMSE Reference Rx 下失败。同一比较中的所有接收机在同一测试时隙样本上评估。

> 脚注 3（原文）：一个传输块包含一个时隙内传输的全部编码比特。

### C. 站点特定微调流水线

我们按如下预训练初始化微调流水线。NRX 在随机化 3GPP UMi 信道上、使用 [10]、[12] 的单用户与双用户配置预训练，并调整其帧结构以匹配图 2 的资源网格。MDX 在合成 3GPP UMi 信道上、使用单用户单层传输配置与相同帧结构预训练。DUIDD 接收机在合成 3GPP UMi 信道与双层传输上预训练 $6\cdot10^3$ 个批次：先用二元交叉熵（binary cross-entropy，BCE）损失训练 $3\cdot10^3$ 个批次，再用归一化 LogSumExp BLER 损失 [23] 训练 $3\cdot10^3$ 个批次。

预训练后，我们用 BCE 损失对 NRX 与 MDX 微调 $10^5$ 个批次，每批 16 个时隙样本、跨四个连续 PRB（从 273 个 PRB 的全带时隙样本中裁剪）。DUIDD 接收机用 $2\cdot10^3$ 个批次、每批 16 个全带时隙样本微调：前 $10^3$ 批使用 BCE 损失，随后 $10^3$ 批使用归一化 LogSumExp BLER 损失。

### D. 站点特定性能评估

对站点特定性能评估，我们首先研究在由 PUSCH SNR 目标定义的实测 SNR 下的**数据集 BLER** [10, Sec. V-C]。数据集 BLER 是在固定测试数据集上、经离线接收机处理与 LDPC 解码后失败的传输块比例。注意测试数据集本身是从测量中采样得到的，使 MMSE Reference Rx 的数据集 BLER 约为 10%（参见第 IV-B 节）。与链路自适应下的系统级 BLER 不同，数据集 BLER 可在同一批记录传输上公平比较不同接收机。

其次，我们通过在测试数据集上加入复白高斯噪声，研究数据集 BLER 随一系列**有效 SNR** 的变化 [10, Sec. V-C]。记录的 OFDM 域接收信号服从模型 $y=s+n$，其中 $s\in\mathbb C$ 为来自全部活跃 ULL 的无噪信号分量（总功率 $E_s$），$n\in\mathbb C$ 为方差为 $N_0$ 的接收机噪声。我们按 $\tilde y=y+z$ 加入复高斯噪声 $z\sim\mathcal{CN}(0,N_z)$，其中 $N_z=\alpha(E_s+N_0)$、$\alpha\ge0$；被测接收机（含其 LS 信道估计器）随后处理 $\tilde y$。对原始有效 SNR $\gamma=E_s/N_0$（参见第 III 节定义的 PUSCH SNR 目标），所得有效 SNR 为

$$
\mathrm{SNR}_{\mathrm{eff}}=\frac{E_s}{N_0+\alpha(E_s+N_0)}=\frac{\gamma}{1+\alpha(\gamma+1)}. \tag{1}
$$

扫描 $\alpha\ge0$ 会降低有效 SNR，从而得到数据集 BLER 随有效 SNR 变化的曲线。

## V. 接收机微调结果

本节评估的 NRX、MDX、非迭代 LMMSE、IDD 与 DUIDD 接收机都使用 Sionna v0.19.2 标准 PUSCH LS 信道估计器得到的 LS 信道估计。该估计器对相邻导频子载波的每一对信道估计做频域正交覆盖码（orthogonal cover-code，OCC）合并取平均；我们称其输出为 **OCC 合并后 LS 估计**。MMSE Reference Rx 则使用带时延估计的多级最小均方误差（MMSE）信道估计 [18]。

### A. 单层传输结果

**1）模型驱动神经接收机微调。** 我们先分析站点特定微调对 MDX 的影响。图 3 比较预训练 MDX 与分别针对 2026 年 6 月单层小实验室与办公室楼层场景微调的两个 MDX。站点特定微调在小实验室把数据集 BLER 降低约三分之一（从 0.351 降到 0.237），在办公室楼层降低近一半（从 0.463 降到 0.240）。两种环境下 MMSE Reference Rx 的数据集 BLER 都低于微调后的 MDX。在相同的 2026 年 6 月小实验室测试数据上，图 4 显示 NRX 微调带来类似的约三分之一相对降低。尽管如此，无论预训练还是微调，NRX 的绝对数据集 BLER 都低于相应 MDX，代价是可调参数显著更多、推理时延更高 [6]。

**2）NRX 微调的时间鲁棒性。** 现在我们用相隔半年以上的两次测量活动数据，研究站点特定 NRX 微调的时间鲁棒性。图 4 在 2025 年 11 月（左）与 2026 年 6 月（右）单层小实验室数据上，比较预训练与微调的 Shallow NRX（上）与 Deep NRX（下）：对每次测量活动分别微调一个模型，并在两次活动上都评估。对两种 NRX 配置，用同一活动的数据微调与测试都得到最低数据集 BLER。微调与测试所用测量活动之间的时间间隔增大会提高数据集 BLER，对在 2026 年 6 月数据上测试的 Shallow NRX 最为明显；然而在任一次活动上微调过的 NRX，在另一次活动上测试时都优于预训练 NRX。这些观察表明站点特定微调随时间仍然有效，但也提示部署后应持续微调。

### B. 双层传输结果

**1）双层数据微调 vs. 单层+双层数据微调。** 我们在图 5 中研究 NRX 针对单层和/或双层传输微调、并在双层传输上评估的效力。仅用双层数据微调使两种 NRX 深度的数据集 BLER 都降低三分之一以上。微调后的 Deep NRX 明显优于 MMSE Reference Rx，而微调后的 Shallow NRX 数据集 BLER 仍较高。用单层与双层数据共同微调所得数据集 BLER 接近仅用双层数据微调的结果，绝对差至多 0.019：对 Deep NRX 可忽略，对 Shallow NRX 略大。

本文未展示的另一实验确认，在单层传输上评估时，NRX 针对单层和/或双层传输微调具有类似效力：用单层与双层数据共同微调所得数据集 BLER 接近仅用单层数据微调的结果，绝对差至多 0.004。

**2）NRX 微调带来的有效 SNR 改善。** 我们随后研究双层传输下站点特定 NRX 微调带来的有效 SNR 改善。图 6 按第 IV-D 节所述向双层小实验室数据集加入白高斯噪声，在有效 SNR 范围内评估预训练与微调后的 NRX。微调在整个所评估瀑布区改善数据集 BLER，并把达到 25% 数据集 BLER 所需有效 SNR 对 Shallow NRX 降低 0.83 dB、对 Deep NRX 降低 0.54 dB。

**3）基于模型的 DUIDD 接收机微调。** 图 7 比较非迭代 LMMSE 接收机（$I=1$）与未调谐经典 IDD、预训练与微调后的 DUIDD 接收机（均为 $I=2$），以及 Shallow NRX、Deep NRX 与 MMSE Reference Rx。所有接收机都在 2026 年 6 月双层小实验室数据上评估，且限制为 MCS 索引 10；这是与图 5 不同的测试子集，故 NRX 结果不可直接比较。

经典 IDD 相对非迭代 LMMSE 接收机降低数据集 BLER，预训练 DUIDD 进一步降低；然而 DUIDD 的站点特定微调只把数据集 BLER 再降低 0.004（绝对值）。这一边际增益表明，该接收机有限的可调性几乎没有留下进一步微调的空间。两种 NRX 配置都取得更低数据集 BLER 与比 DUIDD 大得多的微调增益，但复杂度也高得多。DUIDD 的复杂度与经典 IDD 相近，约为非迭代基线检测复杂度的两倍 [4, Sec. V-D]。该图比较的是完整接收机链：NRX 以隐式信道精化完成数据检测，并使用 NVIDIA pyAerial 的 LDPC MP 解码器（分层归一化 min-sum CN 更新）；IDD 与 DUIDD 则在 LS 信道估计上工作，并使用 flooding min-sum CN 更新。第 VI 节结果表明，当基于模型的接收机改用 LMMSE 信道估计时会有实质改善，提示更好的信道估计对数据集 BLER 的影响大于改进 MIMO 检测器。

## VI. 站点特定参数自适应

我们现研究使用由合成信道或站点特定测量估计的协方差矩阵时，LMMSE 信道估计对数据集 BLER 的影响。

### A. LMMSE 信道估计

与第 V 节聚焦 LS 信道估计不同，这里使用 Sionna v0.19.2 [24] 的 LMMSE 插值器对 LS 信道估计做平滑（即去噪与插值）。Sionna 通过依次沿接收天线、子载波与 OFDM 符号做一维平滑来近似联合三维 LMMSE 估计问题，我们按此顺序执行。对所考虑的 DMRS 配置，每个 CDM 组中只有一个端口活跃，因此每个导频都在其实际子载波处提供独立的信道观测。我们修改 Sionna 的 PUSCH LS 信道估计器以省略正交覆盖码平均，称其输出为**直接 LS 估计**。对某根接收天线、某个 DMRS 符号与某个传输层，令 $y[w]\in\mathbb C$ 为子载波 $w$ 上的接收 OFDM 域信号、$p[w]\in\mathbb C$ 为含正交覆盖码权重的发射 DMRS 符号，则直接 LS 估计为

$$
\hat z[w]=\frac{y[w]}{p[w]}=h[w]+e[w], \tag{2}
$$

其中 $h[w]\in\mathbb C$ 为信道系数，$e[w]\in\mathbb C$ 为 LS 估计误差。

对频域平滑，令 $\mathbf h\in\mathbb C^W$ 含某层与某接收天线在 $W=3276$ 个活跃子载波上的信道系数。把一个 DMRS 的 $N_p=1638$ 个导频子载波上的直接估计堆叠起来得

$$
\hat{\mathbf z}=\mathbf S\mathbf h+\mathbf e, \tag{3}
$$

其中 $\mathbf S\in\{0,1\}^{N_p\times W}$ 选择导频子载波（每行一个非零元），$\mathbf e\in\mathbb C^{N_p}$ 为 LS 估计误差。记频域信道协方差为 $\mathbf R_f=\mathbb E[\mathbf h\mathbf h^H]\in\mathbb C^{W\times W}$、误差协方差为 $\boldsymbol\Sigma_f\in\mathbb R^{N_p\times N_p}$，则频域 LMMSE 估计为

$$
\hat{\mathbf h}=\mathbf R_f\mathbf S^H\left(\mathbf S\mathbf R_f\mathbf S^H+\boldsymbol\Sigma_f\right)^{-1}\hat{\mathbf z}. \tag{4}
$$

空间与时间平滑类似，分别使用 $4\times4$ 的信道协方差 $\mathbf R_s$ 与 $13\times13$ 的 $\mathbf R_t$。我们为给定部署站点估计这三个信道协方差矩阵；相应误差协方差矩阵 $\boldsymbol\Sigma_s$、$\boldsymbol\Sigma_f$、$\boldsymbol\Sigma_t$ 在运行时由标量预均衡宽带噪声方差估计导出。

### B. 站点特定协方差矩阵估计

作为基线，我们用 [12] 随文发布的实现、从合成 3GPP UMi 信道实现 [25] 估计这三个协方差矩阵。该实现为随机化 UMi 拓扑采样真值全带 OFDM 域信道，并在信道实现上对所有未被各协方差矩阵表示的其余时隙样本张量维度平均其外积。

对站点特定估计，我们改用图 2 资源网格配置下的微调数据。三个估计器遵循同一原则：用 (2) 中的直接 LS 估计构成二阶矩，并去除其估计误差贡献。我们从仅含噪声的第 14 个 OFDM 符号估计所需误差统计量，方法是把其观测除以为获得相应直接 LS 估计所用 DMRS 序列值。下面描述各维度特定的估计流程与噪声校正。

**1）空间协方差矩阵。** 对每个时隙样本、传输层、DMRS 符号与导频子载波，把四根接收天线的直接 LS 估计堆叠为向量；对这些向量外积取平均即得空间二阶矩。我们以同样方式构成噪声向量并平均其外积，得到空间误差协方差 $\hat{\boldsymbol\Sigma}_s\in\mathbb C^{4\times4}$。从空间二阶矩中减去 $\hat{\boldsymbol\Sigma}_s$ 即得估计协方差矩阵 $\hat{\mathbf R}_s$。

**2）频率协方差矩阵。** 各层的 DMRS 只占据每隔一个子载波，因此其余子载波上没有直接 LS 估计，无法直接估计其互相关。我们因此假设所有子载波共享相同的边缘频率统计，并把 $\hat{\mathbf R}_f$ 限制为 Hermitian Toeplitz 形式。这一常见简化仅带来轻微性能损失 [7]，并可在广义平稳非相关散射（wide-sense stationary uncorrelated scattering，WSSUS）假设下得到解释 [26]。虽然我们并不预期信道是 WSSUS，该限制仍把参数个数从 $W^2$ 降到 $W$。于是我们估计相关序列 $r[q]=\mathbb E[h[w+q]h^*[w]]$（$q\in\{-W+1,\ldots,W-1\}$）。

先估计可用的偶数滞后。令 $\hat c_z[2q]$ 表示对所有有效子载波索引、时隙样本、接收天线、传输层与 DMRS 符号平均 $\hat z[w+2q]\hat z^*[w]$ 所得的经验相关。我们用同样方式、从处理后的噪声观测平均 $e[w+2q]e^*[w]$ 得到误差相关 $\hat c_e[2q]$。经噪声校正的偶数滞后为

$$
\hat r[2q]=\hat c_z[2q]-\hat c_e[2q],\quad q=0,\ldots,N_p-1. \tag{5}
$$

由于有效信道冲激响应短于循环前缀（cyclic prefix，CP），其频率响应随子载波平滑变化；我们对其相关序列作同样假设，通过平均相邻偶数滞后估计得到缺失的奇数滞后，对最后一个奇数滞后使用前一个偶数滞后估计。Hermitian 对称给出 $\hat r[-q]=\hat r^*[q]$，频域协方差为

$$
\left[\hat{\mathbf R}_f\right]_{i,j}=\hat r[i-j]. \tag{6}
$$

**3）时间协方差矩阵。** 对每个时隙样本、接收天线、传输层与导频子载波，我们把三个 DMRS 符号（$t\in\{1,6,11\}$）处的直接 LS 估计插值到全部 13 个 PUSCH 符号：在相邻 DMRS 符号之间做线性插值，并用 $t\in\{6,11\}$ 的估计外推 $t=11$ 之后的部分。把全部十三个 OFDM 符号的信道估计堆叠为向量并平均其外积，即得时间二阶矩。

令 $\mathbf A\in\mathbb R^{13\times3}$ 含相应的插值与外推权重。假设三个 DMRS 位置处的 LS 估计误差独立、方差为 $\hat\sigma_e^2$，则时间误差协方差为

$$
\hat{\boldsymbol\Sigma}_t=\hat\sigma_e^2\mathbf A\mathbf A^T, \tag{7}
$$

其中 $\hat\sigma_e^2$ 由处理后的噪声观测估计。从时间二阶矩中减去 $\hat{\boldsymbol\Sigma}_t$ 即得 $\hat{\mathbf R}_t$。最后，我们把负特征值置零，确保所有估计协方差矩阵半正定。

### C. 接收机自适应结果

由于 Sionna 的 LMMSE 信道估计器运行时间较长，以下评估所用测试数据集小于第 V 节中的评估，因此绝对数据集 BLER 数值只宜谨慎比较；与 NRX、MDX 及 MMSE Reference Rx 的比较还涉及不同的 LDPC 解码器算法。

**1）非迭代接收机结果。** 图 8 在含 LMMSE MIMO 检测与 $N_{\mathrm{MP}}=12$ 次 LDPC MP 解码迭代的非迭代接收机中，比较直接 LS 与 OCC 合并后 LS（二者均用线性插值）以及 LMMSE 信道估计。OCC 合并由于噪声平均，在单层与双层传输下都改善 LS 基线。由合成 UMi 信道得到的协方差估计在单层下甚至比直接 LS 估计更差，但在双层传输下优于两种 LS 配置。单层测量所用 PUSCH SNR 目标（5 dB）低于双层（12 dB），此时 LMMSE 估计器更强地依赖所假设的信道统计量，因而对协方差失配更敏感。改用站点特定而非合成数据估计协方差矩阵，使单层与双层传输的绝对数据集 BLER 分别降低 0.72 与 0.26，并与 MMSE Reference Rx 十分接近。

**2）迭代接收机结果。** 图 9 在 IDD 接收机中、随 MMSE-PIC MIMO 检测级数 $I$ 变化，比较直接 LS 信道估计（线性插值）与 LMMSE 信道估计。每个检测级之后是 $N_i=N_{\mathrm{MP}}/I$ 次 LDPC MP 解码迭代，使接收机总解码迭代数固定为 $N_{\mathrm{MP}}=12$ [4]。对所有信道估计器，增大 $I$ 都降低数据集 BLER。使用 UMi 协方差估计的 LMMSE 信道估计显著优于直接 LS 信道估计，而站点特定协方差估计又带来额外降低。站点特定配置在 $I=1$ 且无迭代检测时已略优于 MMSE Reference Rx，并在 $I=4$ 时把数据集 BLER 从 0.09 进一步降到 0.06。由于这是本工作中观察到的最低数据集 BLER，该结果表明信道估计质量在整体接收机性能中起关键作用。此外，站点特定参数自适应带来的数据集 BLER 改善甚至大于第 V 节与 [10] 中站点特定微调的改善。

## VII. 结论

我们已证明，站点特定微调能在实测 5G NR 数据上改善全部三种所评估的可调接收机架构。增益对两种神经接收机架构——模型驱动 MDX 与完全可调 NRX——显著，而对可调性有限的基于模型 DUIDD 接收机仅为边际。一个在单层与双层数据上共同微调的 NRX 即可支持两种配置，相比分别使用两个 NRX（一个仅用单层数据微调、另一个仅用双层数据微调）仅有轻微性能损失。微调在相隔半年以上的测量活动之间仍然有效。总体而言，我们的结果表明站点特定微调在不增加运行时复杂度的前提下，可跨架构、跨 ULL 配置、跨测量活动地改善真实世界接收机性能。

我们还证明了信道估计质量在整体接收机性能中起关键作用——可能甚至大于数据检测算法的选择。通过站点特定协方差估计实现的站点特定参数自适应，使 LMMSE 信道估计大幅优于使用由合成 UMi 信道估计的协方差矩阵的对应方案。结合该站点特定信道估计器，IDD 取得本研究报告中最低的数据集 BLER，并优于 MMSE Reference Rx，尽管它使用的是 flooding min-sum 解码器而非 pyAerial 的分层归一化 min-sum 解码器。

## 图注与表注

**图 1：** 2026 年 6 月两个室内部署场景的平面图（左）与服务 O-RU 照片（右）：（a）室内小实验室；（b）室内大办公室楼层。

**图 2：** 用于微调与测试的时隙样本的 OFDM 资源网格，展示 3276 个子载波中的 24 个以及来自第 1 层的 DMRS；第 2 层的 DMRS 占据 OFDM 符号 $t\in\{1,6,11\}$ 的偶数子载波。图中标注 DMRS／Masked（噪声）／Data 与子载波 $w$、OFDM 符号 $t$。

**图 3：** 2026 年 6 月单层传输测量下，预训练与微调 MDX 在小实验室（左）与办公室楼层（右）上的数据集 BLER（图例含 MDX (Pretrained)、MDX (FT: Small lab)、MDX (FT: Office floor)、MMSE Reference Rx；标注 $\Delta=0.114$、$\Delta=0.223$）。

**图 4：** 2025 年 11 月（左）与 2026 年 6 月（右）单层传输小实验室数据集上，预训练与微调 Shallow NRX（2 iter.）与 Deep NRX（8 iter.）的数据集 BLER；图例标明各 NRX 的微调数据集（"FT: Nov. 2025" 或 "FT: Jun. 2026"），并含 MMSE Reference Rx。

**图 5：** 2026 年 6 月小实验室双层传输数据集上，预训练与微调 Shallow NRX（2 iter.）与 Deep NRX（8 iter.）的数据集 BLER；NRX 或仅在双层数据上微调（"FT: 2 ULLs"）或在单层与双层数据上共同微调（"FT: 1+2 ULLs"）。

**图 6：** 2026 年 6 月小实验室双层传输数据集上，预训练与微调 Shallow NRX（2 iter.）与 Deep NRX（8 iter.）的数据集 BLER 随有效 SNR 的变化；箭头表示达到 25% 数据集 BLER 所需的有效 SNR 改善（0.83 dB 与 0.54 dB）。

**图 7：** 2026 年 6 月小实验室双层传输、MCS 索引 10 下，各接收机的数据集 BLER 性能；IDD 与 DUIDD 接收机使用 $I=2$ 个检测级。图例含 Classical LS + LMMSE、Classical IDD、DUIDD (Pretrained)、DUIDD (FT: Small lab)、Shallow NRX (Pretrained/FT)、Deep NRX (Pretrained/FT) 与 MMSE Reference Rx。

**图 8：** 非迭代 LMMSE 接收机使用线性插值的直接 LS、OCC 合并后 LS、或基于合成 UMi／站点特定协方差估计的 LMMSE 信道估计时的数据集 BLER；结果使用 2026 年 6 月单层（左）与双层（右）小实验室数据集。

**图 9：** 使用直接 LS 或基于合成 UMi／站点特定协方差估计的 LMMSE 信道估计时，数据集 BLER 随 MMSE-PIC 检测级数 $I$ 的变化；所有配置使用 $N_{\mathrm{MP}}=12$ 次 LDPC MP 解码迭代，并在 2026 年 6 月双层小实验室数据集上评估。

> **原文说明：** 原文全文不含表格（Table），仅有上述 9 幅图与式 (1)–(7)，因此本页不设表格转写。原文首页脚注包含：作者使用 OpenAI GPT 5.6 Sol 辅助准备稿件、所有输出经作者独立评估与核验；感谢 António Maia Barros 在测量中的支持；感谢 NVIDIA 对本研究的赞助；代码与数据集链接为 https://github.com/IIP-Group/site_specific_training 。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 8 页转录；未逐条核对 DOI）。

[1] M. Honkala, D. Korpi, and J. M. J. Huttunen, "DeepRx: Fully convolutional deep learning receiver," IEEE Trans. Wireless Commun., vol. 20, no. 6, pp. 3925–3940, 2021.

[2] D. Korpi, M. Honkala, J. M. Huttunen, and V. Starck, "DeepRx MIMO: Convolutional MIMO detection with learned multiplicative transformations," in Proc. IEEE Int. Conf. Commun. (ICC), Jun. 2021.

[3] S. Cammerer, F. Aït Aoudia, J. Hoydis, A. Oeldemann, A. Roessler, T. Mayer, and A. Keller, "A neural receiver for 5G NR multi-user MIMO," in Proc. IEEE Globecom Workshops, Mar. 2023.

[4] R. Wiesmayr, C. Dick, J. Hoydis, and C. Studer, "DUIDD: Deep-unfolded interleaved detection and decoding for MIMO wireless systems," in Proc. Asilomar Conf. Signals, Syst., Comput., Oct. 2022.

[5] A. Balatsoukas-Stimming and C. Studer, "Deep unfolding for communications systems: A survey and some new directions," in IEEE Int'l Workshop Signal Process. Sys. (SiPS), Oct. 2019.

[6] M. Abdollahpour, M. Bertuletti, Y. Zhang, Y. Li, L. Benini, and A. Vanelli-Coralli, "A compute&memory efficient model-driven neural 5G receiver for edge AI-assisted RAN," in Proc. IEEE Global Telecommun. Conf. (GLOBECOM), Dec. 2025.

[7] B. Fesl, M. Joham, S. Hu, M. Koller, N. Turan, and W. Utschick, "Channel estimation based on Gaussian mixture models with structured covariances," in Proc. Asilomar Conf. Signals, Syst., Comput., Oct. 2022.

[8] B. Böck, A. Kasibovic, and W. Utschick, "Wireless channel modeling for machine learning–a critical view on standardized channel models," arXiv:2510.12279, Oct. 2025.

[9] R. Luostari, D. Korpi, M. Honkala, and J. M. Huttunen, "Adapting to reality: Over-the-air validation of AI-based receivers trained with simulated channels," in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), Mar. 2025.

[10] N. B. Baytekin, R. Wiesmayr, S. Cammerer, C. Dick, and C. Studer, "Site-specific finetuning of neural receivers with real-world 5G NR measurements," IEEE Int. Workshop Signal Process. Advances Wireless Commun. (SPAWC), Sep. 2026.

[11] R. Wiesmayr, F. Zumegen, S. Taner, C. Dick, and C. Studer, "CSI-based user positioning, channel charting, and device classification with an NVIDIA 5G testbed," in Proc. Asilomar Conf. Signals, Syst., Comput., Oct. 2025.

[12] R. Wiesmayr, S. Cammerer, F. Aït Aoudia, J. Hoydis, J. Zakrzewski, and A. Keller, "Design of a standard-compliant real-time neural receiver for 5G NR," in Int'l Conf. Machine Learning Commun. Netw., May 2025.

[13] B. Durfee, J. De Ocampo, N. Nguyen, S. Tadik, and G. D. Durgin, "Enhancing neural receiver performance through novel training strategies," in IEEE Opportunity Research Scholars Symp., Apr. 2025.

[14] R. Luostari, D. Korpi, O. Tirkkonen, and H. Holma, "Input-correlated supervision noise limits the benefits of OTA training for learned receivers," arXiv:2608.12918, Aug. 2026.

[15] V. Savaux and Y. Louët, "LMMSE channel estimation in OFDM context: a review," IET Signal Processing, vol. 11, no. 2, pp. 123–134, 2017.

[16] B. Hochwald and S. Ten Brink, "Achieving near-capacity on a multiple-antenna channel," IEEE Trans. Commun., vol. 51, no. 3, pp. 389–399, Mar. 2003.

[17] C. Studer, S. Fateh, and D. Seethaler, "ASIC implementation of soft-input soft-output MIMO detection using MMSE parallel interference cancellation," IEEE J. Solid-State Circuits, vol. 46, no. 7, pp. 1754–1765, 2011.

[18] NVIDIA, Aerial PHY 5G Algorithms: ChannelEstimator, 2025, accessed: 2026-01-14. [Online]. Available: https://docs.nvidia.com/aerial/cuda-accelerated-ran/24-3/pyaerial/api_reference/aerial.phy5g.algorithms.html#aerial.phy5g.algorithms.channel_estimator.ChannelEstimator

[19] NVIDIA, Aerial Testbed (ATB), 2026, formerly ARC-OTA. Accessed: 2026-07-03. [Online]. Available: https://docs.nvidia.com/aerial/testbed/latest/

[20] NVIDIA, Data Lake, 2026, accessed: 2026-07-08. [Online]. Available: https://docs.nvidia.com/aerial/cuda-accelerated-ran/latest/data_lake/index.html

[21] ETSI, "ETSI TS 138 214 V16.2.0: Physical layer procedures for data," Tech. Rep., Jul. 2020.

[22] NVIDIA, pyAerial, 2026, aerial CUDA-Accelerated RAN 25-3 documentation. Accessed: 2026-07-06. [Online]. Available: https://docs.nvidia.com/aerial/cuda-accelerated-ran/25-3/pyaerial/index.html

[23] R. Wiesmayr, G. Marti, C. Dick, H. Song, and C. Studer, "Bit error and block error rate training for ML-assisted communication," in Proc. IEEE Int. Conf. Acoust., Speech, Signal Process. (ICASSP), Jun. 2023.

[24] J. Hoydis, S. Cammerer, F. Ait Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, "Sionna: An open-source library for next-generation physical layer research," arXiv:2203.11854, Mar. 2022.

[25] ETSI, "Study on channel model for frequencies from 0.5 to 100 GHz," 3GPP TR 38.901, Nov. 2020, Version 16.1.0.

[26] B. Böck, M. Baur, N. Turan, D. Semmler, and W. Utschick, "A statistical characterization of wireless channels conditioned on side information," IEEE Wireless Commun. Lett., vol. 13, no. 12, pp. 3508–3512, 2024.

**本页范围与校对状态：** 本页为 arXiv:2609.04004v1 的全文中文译稿：摘要、正文第 I–VII 节（含 II-A/B/C、III-A/B、IV-A/B/C/D、V-A/B、VI-A/B/C 全部小节）、结论、图 1–9 图注、脚注 1–3 与参考文献 [1]–[26]。公式编号沿用原文 (1)–(7)。**原文全文不含表格**，仅有 9 幅图，故本页未设表格转写（已在"图注与表注"节注明）。原文首页脚注中披露使用 OpenAI GPT 5.6 Sol 辅助准备稿件、所有输出经作者独立核验，并列出代码/数据集链接与 NVIDIA 赞助致谢，均已如实译入。原文无致谢独立章节、无附录。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误（个别图例数值与正文叙述的细小差异属原图标注，照录）。骨架"版本"行原为 2026-09-20（收录日），已按 BRIEF2 结构改为 arXiv:2609.04004v1（2026-09-03，依据 PDF 页眉 "arXiv:2609.04004v1 [cs.IT] 3 Sep 2026"）；作者为 Reinhard Wiesmayr（共同第一作者）、Nuri Berke Baytekin（共同第一作者）、Chris Dick、Christoph Studer；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
