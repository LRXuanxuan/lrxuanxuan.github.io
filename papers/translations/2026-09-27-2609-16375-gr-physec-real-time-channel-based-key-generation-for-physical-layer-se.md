---
layout: page
title: "gr-PHYSEC：基于信道的实时物理层密钥生成｜中文全文译文"
permalink: /papers/translations/2026-09-27-2609-16375-gr-physec-real-time-channel-based-key-generation-for-physical-layer-se/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/d006ba66a14e17d2/) · [原文 arXiv](https://arxiv.org/abs/2609.16375) · [全部目录](/papers/catalog/)

# gr-PHYSEC：基于信道的实时物理层密钥生成

**原题：** gr-PHYSEC: Real-time Channel-based Key Generation for Physical Layer Secure Wireless Communications  
**作者：** Jose A. Sanchez Viloria、George Sklivanitis、Dimitris Pados  
**单位：** 美国佛罗里达大西洋大学（Florida Atlantic University）互联自主与人工智能中心（Center for Connected Autonomy and AI，CA-AI.fau.edu），Boca Raton, FL, USA。  
**版本：** arXiv:2609.16375v1（cs.CR），2026 年 9 月 14 日，原文 7 页（第 15 届 GNU Radio Conference 会议论文，Copyright 2025 by the author(s)）。  
**代码：** https://github.com/C2A2-at-Florida-Atlantic-University/gr-PHYSEC  
**范围与状态：** 全文中文译稿：摘要、第 1–7 节及全部小节（2.1–2.2、3 的六个模块、5.1–5.3）、表 1（逐格转写）、图 1–9 图注、参考文献（18 条，英文原条目）均按原文结构录入（原文采用作者—年份排序、未编号，本页按原顺序补编号 [1]–[18] 以便引用与站点校验）；原文无编号公式（数学量均为行内表达）、无附录、无致谢段。逐句逐式终校未做。

## 摘要

保护无线通信免受窃听至关重要，在动态、去中心化环境中尤为如此。我们提出 **gr-PHYSEC**——一个用于实时物理层密钥生成的新 GNU Radio 树外（out-of-tree，OOT）模块。与传统依赖预共享秘密或计算复杂度的密钥生成不同，我们的方法从无线信道的固有随机性中派生对称密钥。我们在 GNU Radio 内嵌入一个已训练神经网络，在探测交换过程中提取可信双方（Alice 与 Bob）之间的信道特征；这些特征被量化为二进制密钥，经 Reed–Solomon 编码协调，再用 SHA-512 哈希进一步加固。生成的密钥随后直接用于加密数据。在 FAU CAAI 互联机器人测试平台上、使用 ADALM Pluto 软件定义无线电（SDR）与 NVIDIA Jetson Orin、以地面机器人平台开展的实地实验验证了该方法：结果表明密钥失配率低、随机性强，并已由面向密码应用的 NIST 随机与伪随机数发生器测试套件验证。该集成展示了 GNU Radio 如何支撑实时 AI 驱动的安全方案，拓展了软件定义安全通信的边界。本项目源代码见：https://github.com/C2A2-at-Florida-Atlantic-University/gr-PHYSEC 。

## 1. 引言

无线链路使通信流量暴露于被动与主动对手面前；然而对分布式、资源受限的基础设施无关自组网设备而言，对称密钥生成与交换仍是难题。

物理层密钥生成利用信道互易性、时变性与空间去相关，从空中探测中派生相似特征，而无需事先交换信息（Zhang et al., 2016b;a）。此前系统对接收信号强度（RSS）、信道状态信息（CSI）或信道冲激响应（CIR）进行量化，并通过交互协议或前向纠错（FEC）协调误差（Liu et al., 2013; Zeng et al., 2010; Mathur et al., 2008）。与此同时，物理层（PHY）深度学习已被证明在稳健特征提取、自动调制分类与射频（RF）指纹识别等应用中有效（O'Shea & Hoydis, 2017; Wang et al., 2017; Shen et al., 2021）。

现有实时密钥生成实现在信道探测、量化、协调与隐私放大上遵循相同流程，但信道探测方式与处理技术不同。一个 GNU Radio LoRa SDR 实现展示了远距离网络上的端到端探测、量化与纠错（Hu et al., 2023）。其他旨在促进 GNU Radio 物理层安全技术的实现，包括利用目标接收机 CSI 注入噪声的多输入单输出（MISO）系统，以及用于撤销伪随机序列相移、从而解码信号的单载波 Alamouti 编码系统（Ryland et al., 2017）。

本文首次演示点对点自组网无线通信中用于即时数据加密的实时物理层密钥生成。我们在支持 GPU 的软件定义无线电上实现并测试了 GNU Radio 树外（OOT）信号处理模块，用于在两个可信通信方 Alice 与 Bob 之间生成密钥。图 1 描绘了从训练到部署测试的端到端 AI 密钥生成流程。我们训练了一个带四元组损失（quadruplet loss）的卷积神经网络（CNN），把信道探测的 IQ 级频谱图映射为紧凑的信道嵌入。Alice 与 Bob 使用各自信道嵌入生成一个足够长的比特向量，使窃听者无论拥有多少计算资源、以暴力攻击估计该向量的计算都不可行。硬件损伤、信道探测交换缓慢与移动性都会影响信道互易性，因此生成密钥之间可能存在差异。Alice 与 Bob 采用基于 Reed–Solomon（RS）纠错编码的协调算法；为在协调过程中最小化泄露给 Eve 的信息量，使用 SHA-3 把协调后的比特向量映射为 512 位的随机比特序列，即所需密码密钥。

我们向软件定义无线电社区贡献了一个开源 GNU Radio OOT 项目 **gr-PHYSEC**：它在商用现货（COTS）SDR 硬件上实时实现密钥生成流水线（图 1 所述），由地面机器人平台上的 Jetson Orin GPU 平台控制。我们为控制流实现提供了简单的基于 PMT 的控制消息，以及可直接运行的流图。gr-PHYSEC 包含用于以下功能的 GNU Radio OOT 模块：协调两个 SDR 间的信道探测、短时傅里叶变换（STFT）频谱图生成、基于开放神经网络交换格式（ONNX）的深度学习推理、信道特征量化、用于密钥协调的 RS 编解码，以及经 SHA-512 哈希的隐私放大。我们还开发了面向消息的状态机，用于协调一对 SDR 之间的探测与协调算法所需的奇偶比特交换（含重传与确认协议）。项目源代码在 GitHub 上开源，包括预训练的 AI 特征提取器模型，以及用于在 NVIDIA Jetson 平台和 ADALM-Pluto SDR 上复现嵌入式部署的 Docker 容器。

**图 1（原文 Figure 1）：** 在 GNU Radio 中实现的 AI 辅助物理层密钥生成系统总体框图。

## 2. 密钥生成协议

图 1 描绘了我们在 GNU Radio 中实现的密钥生成协议。两个合法/可信方（Alice/Bob）执行双向信道探测；各接收机基于收到的 IQ 样本生成频谱图，并基于安装在各 SDR 节点上的预训练 CNN 特征提取器提取信道嵌入。神经网络输出被量化为 512 位初始秘密消息。Alice 使用 RS 编码器，随后把奇偶校验比特发送给 Bob 进行协调；Bob 把收到的奇偶比特与自己的初始秘密消息结合，用 RS 解码器协调比特差异。协议最后一步是隐私放大，以增强所需密码密钥的随机性（Yıldırım et al., 2025; Pelekanakis et al., 2021; Sklivanitis et al., 2021; Zhang et al., 2016a; Rukhin et al., 2010; MacWilliams & Sloane, 1977）。

### 2.1. 基于信道的特征提取

在双向信道探测期间，每个 SDR 节点缓存 \(L=8192\) 个 IQ 样本。我们用汉明窗 \(N=256\)、50% 重叠（\(R=128\)）计算 STFT，形成 \(M\times N\) 对数功率频谱图（\(M=31\)）（Allen, 1977）。一个 15 层 ResNet CNN 模型以 L2 范数与有界激活，把 \(31\times256\) 频谱图输入映射为 \(512\times1\) 元特征向量嵌入，以保证量化稳定（He et al., 2016）。我们用四元组损失函数训练该神经网络，目标是最小化 Alice↔Bob 信道嵌入之间的距离，同时最大化 Alice→Eve 与 Bob→Eve 嵌入之间的距离，其中 Eve 是充当被动窃听者的第三个 SDR 节点。我们的目标是保持信道互易性并增强空间去相关性。

**图 2（原文 Figure 2）：** gr-PHYSEC 模块：频谱图生成、特征提取器、特征量化、奇偶比特生成、协调与隐私放大。

### 2.2. 密钥生成

完成信道探测与特征提取后，Alice 与 Bob 对信道嵌入进行量化以生成初始秘密消息。由于信道互易性不完美与硬件损伤，我们预期两个消息之间会存在比特差异。记 \({\rm RS}(C,K)\) 为把 \(K=L/P\) 个符号（或 \(L\) 比特，其中 \(P\) 表示每符号比特数）作为输入、映射为 \(C=2^P-1\) 个符号码字的 RS 编码器；RS 码字的前 \(K\) 个符号与输入符号相同，其余 \(S=C-K\) 个符号为奇偶校验符号。我们取 \(C=255\)、\(K=128\)，并认为 Bob 无差错地收到 Alice 生成的奇偶校验符号。通过向自己的数据加入 \(S\) 个奇偶符号，Bob 的 \({\rm RS}(C,K)\) 解码器可检测不超过 \(S\) 个任意错误符号的组合，或定位并纠正不超过 \(T=\lfloor S/2\rfloor\) 个位置未知的错误符号。最后，Alice 与 Bob 对协调阶段输出的比特向量施加 SHA-3-512 哈希函数，产生定长输出比特向量，即所需的 512 位密码密钥。SHA-3 哈希函数的性质保证：即使 Eve 的协调向量与 Alice 的消息只差 1 比特，她的输出也会与 Alice 和 Bob 的输出完全不同（Rukhin et al., 2010）。

> **原文疑点：** 按原文定义，\({\rm RS}(255,128)\) 对应 \(C=2^P-1=255\Rightarrow P=8\) 比特/符号，输入长度应为 \(L=K\cdot P=1024\) 比特；而正文称神经网络输出被量化为 512 位初始秘密消息（且隐私放大输出亦为 512 位）。二者相差一倍，疑为符号-比特换算或输入长度的表述不一致。本页按原文照录并在此说明。

## 3. gr-PHYSEC

我们开发了六个 GNU Radio OOT 模块以实现密钥生成，另有若干模块控制两个 SDR 之间的信道探测与信息交换。图 2 展示各模块，图 8 与图 9 分别展示 Alice 与 Bob 的 GNU Radio 流图。

**频谱图生成。** 一个 Python 模块用 STFT（NumPy/FFT）与对数功率缩放对采集的 IQ 样本做预处理，产生频谱图。

**特征提取。** 该模块加载 ONNX 格式的 ResNet CNN 模型以进行基于信道的特征提取，并运行 ONNX runtime 推理产生信道嵌入；在 Jetson Orin 上由 CUDA execution provider 加速推理。

**特征量化。** 该模块以每个信道嵌入的算术均值作为阈值，把信道特征量化到 0 与 1 之间，并在 Alice 与 Bob 处输出初始秘密消息。

**协调。** 两个 GNU Radio 模块（奇偶生成与协调）实现协调算法；我们使用 Reed–Solomon 库的 Python/C++ 封装。Alice 用自己的量化信道特征向量经 \({\rm RS}(255,128)\) 编码器生成奇偶比特；Bob 用 Alice 的奇偶比特与本地生成的量化信道特征向量，经 \({\rm RS}(255,128)\) 解码器向 Alice 的消息协调。

**隐私放大。** 该模块实现协调后秘密消息的 SHA 哈希；用户可在不同 SHA-3 变体之间切换，并支持 128、256、512 位等不同输出密钥长度。

**控制器。** 一个轻量状态机协调以下步骤：(1) Bob→Alice 探测请求；(2) Alice 发送探测、Bob 接收；(3) Alice←Bob 探测请求；(4) Bob 发送探测、Alice 接收；(5) Alice 发送奇偶比特、Bob 接收；(6) 协调成功/失败确认。所有状态转移使用 PMT、用于探测收发的 PlutoSDR 源/汇模块以及用于信息交换的 ZMQ Pub/Sub。我们还开发了一个 Rx 门控 GNU Radio 模块，仅在 Alice 或 Bob 发送时控制经 PlutoSDR Source 流入的接收样本流。

## 4. 实验设置

我们在 FAU CAAI 的室内实验室环境中，从成对 SDR 设备采集 IQ 样本，并用第三个 SDR 充当被动窃听者。我们采集 Alice 与 Bob 之间的探测交换样本，同时让 Eve 监听双方的每次交换。我们在 NVIDIA A100 GPU 上训练 ResNet CNN 模型以进行基于信道的特征提取，并导出为 ONNX 格式，在 Jetson Orin 与 Jetson Nano 设备上部署并测试。实验考虑两个可信方（Alice/Bob）相距约 1 m，随后在不超过约 5 m 的范围内移动其中一个节点。每个节点由一台 Jetson Orin 与一块安装在机器人智能体上的 ADALM-Pluto SDR 组成（如图 3 所示）。我们在每个机器人智能体上构建 Docker 容器，其中包含运行 gr-PHYSEC 模块所需的全部依赖。各智能体的 PlutoSDR 调谐到 2.485 GHz 载频、采样率 1 MSps。我们还开发了一个关键性能指标（KPI）监控应用，用于触发节点启动密钥生成协议执行，并收集、可视化各阶段信息，如信道探测的 IQ 样本与频谱图、量化后的信道特征向量以及协调是否成功。我们利用所收集的信息计算比特失配率（bit disagreement rate，BDR）、密钥生成成功率与密钥生成时间。

**图 3（原文 Figure 3）：** Alice 与 Bob 实验设置。

## 5. 结果

### 5.1. 比特失配与协调

在 100 次实时密钥生成中，Alice/Bob 密钥之间的 BDR 通常处于 2–15% 区间。两个机器人智能体之间朝向与运动的变化使 BDR 增至约 56%（代表性中位数约 12.51%），这仍在 RS 纠错能力之内（见图 4）。采用 \({\rm RS}(255,128)\) 时，多数尝试的协调都成功，密钥生成成功率约 80%（图 5）。第 60 个 epoch 之后朝向与运动变化的影响在图 4 与图 5 中均有体现。较短的 RS 码（如 \({\rm RS}(191,128)\)）可降低奇偶交换开销，但也会降低成功率，这已在我们此前的物理层安全研究中得到证明（Yıldırım et al., 2025; Pelekanakis et al., 2021; Sklivanitis et al., 2021）。

**图 4（原文 Figure 4）：** 密钥生成成功率。

**图 5（原文 Figure 5）：** 每次交换的比特失配率。

### 5.2. 密钥随机性（NIST STS）

我们用 NIST 统计测试套件（Rukhin et al., 2010）评估所生成密钥的随机性，以检验 SHA-3 输出是否无相关性、且组成比特之间不含可利用的模式。NIST 软件由十五项不同测试构成；本文报告密钥生成研究中常用的一个有代表性的子集：单比特（频率）、块内频率、游程、块内最长 1 游程、离散傅里叶变换（谱）、非重叠模板匹配、序列、近似熵与累积和。

每项测试把一个协调后、经隐私放大的密码密钥视为一个二进制序列。我们对各测试的 \(p\) 值取平均，并计算 100 个独立生成密钥的通过率，结果汇总于表 1。

**表 1（原文 Table 1）：NIST 统计测试套件得分（平均测试得分与生成密钥的通过百分比）**

| 测试名称 | 平均测试得分 | 通过百分比 |
|---|---|---|
| 单比特（Monobit） | 0.51 | 99% |
| 块内频率（Frequency Within Block） | 0.524 | 98% |
| 游程（Runs） | 0.508 | 100% |
| 块内最长 1 游程（Longest Run Ones in a Block） | 0.211 | 84% |
| 离散傅里叶变换（Discrete Fourier Transform） | 0.477 | 98% |
| 非重叠模板匹配（Non Overlapping Template Matching） | 0.587 | 89% |
| 序列（Serial） | 0.527 | 99% |
| 近似熵（Approximate Entropy） | 0.517 | 100% |
| 累积和（Cumulative Sums） | 0.508 | 99% |

### 5.3. 时延与密钥生成速率

在我们的嵌入式设置中（以 Jetson Orin 为计算平台），平均密钥生成时间约为 1299 ms；该估计时间包含为实现双向探测交换而设置的约 400 ms 等待时间。更快/更优的控制链路、并行化探测交换，或 TensorRT/量化 CNN 均可降低时延（ONNX Runtime, 2025; O'Shea & Hoydis, 2017）。

**图 6（原文 Figure 6）：** 密钥生成时间（毫秒）。

**图 7（原文 Figure 7）：** 关键性能指标（KPI）监控界面。

> **原文疑点：** 图 6 图例标注为 "Average Time: 0.13 ms"，与正文所述平均密钥生成时间约 1299 ms 明显不一致（图中红色虚线位于约 1250 ms 处）。疑为图例标注单位或数值笔误（如应为约 1.3 s / 1299 ms）。本页按原文照录图注信息并在正文按原文的 1299 ms 表述。

## 6. 可复现性

OOT 模块、示例流图与 ONNX 模型见 https://github.com/C2A2-at-Florida-Atlantic-University/gr-PHYSEC 。我们提供了 gr-PHYSEC 库与 ONNX Runtime 在 Jetson 平台上的安装说明、包含 Alice 与 Bob SDR 节点控制流的示例流图，以及能实时提供探测交换与 BDR、密钥生成成功率、密钥生成时间等关键性能指标信息的 KPI 监控器。我们开发了可在 ARM 处理器上运行的 Docker 容器，并给出模块级参数默认值。各模块自包含、可替换（例如用不同波形进行信道探测）。

## 7. 结论与未来工作

gr-PHYSEC 提供了一个实用、可复现、在 GNU Radio 中实现的实时物理层密钥生成流水线。我们实现了在两个已认证节点 Alice 与 Bob 之间生成密码密钥的密钥生成协议；实验双向链路构建在低成本 COTS SDR 与边缘 AI 推理平台上。由于节点移动，所建立的链路经历了多种信道条件。未来工作将聚焦于通过适当的 MAC 层设计提高密钥生成成功率、降低密钥生成时间，并评估协议安全性——该安全性可能受到 Eve 相对 Alice/Bob 的位置以及 Eve 复杂程度的影响。

## 参考文献（英文原书目）

[1] Allen, J. Short term spectral analysis, synthesis, and modification by discrete fourier transform. IEEE Transactions on Acoustics, Speech, and Signal Processing, 25(3):235–238, 1977.

[2] He, K., Zhang, X., Ren, S., and Sun, J. Deep residual learning for image recognition. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), pp. 770–778, 2016.

[3] Hu, Yingying, Xu, Dongyang, and Zhang, Tiantian. Implementation and evaluation of physical layer key generation on sdr based lora platform. In 2023 IEEE 98th Vehicular Technology Conference (VTC2023-Fall), pp. 1–5, 2023. doi: 10.1109/VTC2023-Fall60731.2023.10333718.

[4] Liu, H., Wang, Y., Yang, J., and Chen, Y. Fast and practical secret key extraction by exploiting channel response. In Proceedings of IEEE INFOCOM, pp. 3048–3056, 2013.

[5] MacWilliams, F. J. and Sloane, N. J. A. The Theory of Error-Correcting Codes. North-Holland, Amsterdam, 1977.

[6] Mathur, S. et al. Radio telepathy: Extracting a secret key from an unauthenticated wireless channel. In Proceedings of the ACM International Conference on Mobile Computing and Networking (MobiCom), pp. 128–139, 2008.

[7] ONNX Runtime. Onnx runtime, 2025. URL https://onnxruntime.ai/. Accessed 2025.

[8] O'Shea, T. and Hoydis, J. An introduction to deep learning for the physical layer. IEEE Transactions on Cognitive Communications and Networking, 3(4):563–575, 2017.

[9] Pelekanakis, Konstantinos, Yıldırım, Seçkin Anıl, Sklivanitis, Georgios, Petroccia, Roberto, Alves, João, and Pados, Dimitris. Physical layer security against an informed eavesdropper in underwater acoustic channels: Feature extraction and quantization. In 2021 Fifth Underwater Communications and Networking Conference (UComms), pp. 1–5, 2021. doi: 10.1109/UComms50339.2021.9598102.

[10] Rukhin, A. et al. A statistical test suite for random and pseudorandom number generators for cryptographic applications. Technical Report SP 800-22 Rev. 1a, National Institute of Standards and Technology, 2010.

[11] Ryland, Kevin, Lichtman, Marc, and Clancy, T. Implementation of two physical layer security techniques in an ota system. Proceedings of the GNU Radio Conference, 2(1):9, 2017. URL https://pubs.gnuradio.org/index.php/grcon/article/view/24.

[12] Shen, G. et al. Radio frequency fingerprint identification for LoRa using deep learning. IEEE Journal on Selected Areas in Communications, 39(8):2604–2616, 2021.

[13] Sklivanitis, George, Pelekanakis, Konstantinos, Yıldırım, Seçkin Anıl, Petroccia, Roberto, Alves, João, and Pados, Dimitris A. Physical layer security against an informed eavesdropper in underwater acoustic channels: Reconciliation and privacy amplification. In 2021 Fifth Underwater Communications and Networking Conference (UComms), pp. 1–5, 2021. doi: 10.1109/UComms50339.2021.9598159.

[14] Wang, T. et al. Deep learning for wireless physical layer: Opportunities and challenges. China Communications, 14(11):92–111, 2017.

[15] Yıldırım, Seçkin, Pelekanakis, Konstantinos, Sklivanitis, George, Pados, Dimitris A., Paglierani, Pietro, Petroccia, Roberto, Alves, João, Molfese, Francesco, and Cuomo, Francesca. Secret underwater acoustic key generation challenged by eve's simulator. IEEE Journal of Oceanic Engineering, 50(2):489–506, 2025. doi: 10.1109/JOE.2023.3281978.

[16] Zeng, K., Wu, D., Chan, A., and Mohapatra, P. Exploiting multiple antenna diversity for shared secret key generation in wireless networks. In Proceedings of IEEE INFOCOM, pp. 1–9, 2010.

[17] Zhang, J., Duong, T. Q., Marshall, A., and Woods, R. Key generation from wireless channels: A review. IEEE Access, 4:614–626, 2016a.

[18] Zhang, J. et al. Experimental study on key generation for physical layer security in wireless communications. IEEE Access, 4:4464–4477, 2016b.

## 图注与表注

**图 1（原文 Figure 1）：** 在 GNU Radio 中实现的 AI 辅助物理层密钥生成系统总体框图（从训练到部署与测试的端到端流程）。

**图 2（原文 Figure 2）：** gr-PHYSEC 的组成模块：频谱图生成、特征提取器、特征量化、奇偶比特生成、协调与隐私放大。

**图 3（原文 Figure 3）：** Alice 与 Bob 的实验设置（Jetson Orin + ADALM-Pluto SDR，搭载于机器人智能体，约 1 m 间距，移动范围不超过约 5 m）。

**图 4（原文 Figure 4）：** 密钥生成成功率（第 60 个 epoch 之后的朝向/运动变化影响可见）。

**图 5（原文 Figure 5）：** 每次交换的比特失配率。

**图 6（原文 Figure 6）：** 密钥生成时间（毫秒，横轴为双向探测交换序号 1–100）。

**图 7（原文 Figure 7）：** 关键性能指标（KPI）监控界面（实时显示 Alice/Bob 探测交换、样本/频谱图、量化特征与密钥生成信息）。

**图 8（原文 Figure 8）：** Alice 的 GNU Radio 流图。

**图 9（原文 Figure 9）：** Bob 的 GNU Radio 流图。

**表注：** 原文共 1 张表（表 1，NIST 统计测试套件得分），已在本页第 5.2 节逐格转写。

**本页范围与校对状态：** 本页覆盖原文摘要、第 1–7 节全部正文与小节（2.1–2.2、第 3 节六个模块、5.1–5.3）、表 1（9 行逐格转写，用 PDF 渲染页 p5 核对）、图 1–9 图注、参考文献 18 条（英文原条目，按原文作者—年份排序）。原文无编号公式（Reed–Solomon 参数、STFT 参数等均为行内数学表达）、无附录、无致谢段。**原文疑点（已加注 2 处）：** ① 按原文 \({\rm RS}(255,128)\) 的定义（\(C=2^P-1\)、\(P=8\)、输入 \(K\) 个符号）推得输入长度应为 1024 比特，与正文所述 512 位初始秘密消息不一致；② 图 6 图例标注平均时间 0.13 ms，与正文约 1299 ms 不一致。两处均按原文照录并说明。逐句逐式终校未做；供后续 QA 重点核对：STFT 参数（\(L=8192\)、\(N=256\)、\(R=128\)、\(M=31\)）、CNN/ResNet 层数与特征维度、表格数值与图 6 标注。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
