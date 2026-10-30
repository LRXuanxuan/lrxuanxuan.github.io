---
layout: page
title: "AeroLat：面向去中心化无人机集群的信道感知潜空间语义通信｜中文全文译文"
permalink: /papers/translations/2026-10-08-2609-16947-aerolat-channel-aware-latent-space-semantic-communication-for-decentra/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/affccac6e46a2de7/) · [原文 arXiv](https://arxiv.org/abs/2609.16947) · [全部目录](/papers/catalog/)

# AeroLat：面向去中心化无人机集群的信道感知潜空间语义通信

**原题：** AeroLat: Channel-Aware Latent Space Semantic Communication for Decentralized UAV Swarms  
**作者：** Rajdeep Ghosh（IEEE 研究生会员）、Goparaju Venkata Seshachala Sree Vatsava、Sudip Misra（IEEE 会士、ACM 会士）  
**单位：** 印度理工学院卡拉格普尔分校计算机科学与工程系（Department of Computer Science and Engineering, Indian Institute of Technology Kharagpur, Kharagpur 721302, India）  
**版本：** arXiv:2609.16947v1（cs.NI），2026 年 9 月 15 日提交，原文 9 页。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VIII 节及其全部小节、式 (1)–(11)、图 1–9 图注、表 I–VII（逐格 Markdown）、参考文献 [1]–[27]（英文原条目）均按原文结构录入；原文无致谢与附录。逐句逐式终校未做。

## 摘要

在带宽受限、时变的无线链路上运行的去中心化自主无人机（Unmanned Aerial Vehicle，UAV）集群中，潜空间（latent space）通信为符号化消息提供了一种颇具吸引力的替代方案。然而，当同构的冻结模型接收离散化的感知输入时，其广播状态会向共享的提示模板坍缩。针对该问题，本文提出 **AeroLat**——一个采用证据注入（evidence injection）的信道感知潜空间语义通信框架。所得的潜状态随后经过一个显式的通信模型，其中涵盖带宽受限的序列化、加性噪声与信息陈旧性，从而能够对通信保真度与集群级协同进行联合评估。在多种子仿真中，AeroLat 可证明地对编解码器选择、故障以及集群规模增长保持稳健；它稳定地复现了“潜空间-集群”异常，而未做白化的对照组则恢复了坍缩。特别地，AeroLat 能够把虚假相似度（false similarity）降低 97.5%。

**关键词：** 语义通信；潜空间通信；多智能体系统；大语言模型；去中心化无人机集群；表征坍缩。

## I. 引言

面向任务型应用的无人机集群（例如灾后侦察、固体废弃物违规倾倒排查）搭载零样本感知能力与轻量级机载大语言模型（Large Language Model，LLM）推理器。由此产生的开放协同问题是：这类智能体应当如何共享其信念、想法或感知？对此的主流答案基于自然语言或结构化符号消息。然而，这一路线带来了先前工作所称的**符号瓶颈**（symbolic bottleneck）——发送端自回归解码的时延、把丰富的内部信念分布量化为单条离散报告，以及接收端的重编码歧义。有鉴于此，该方向上的近期进展把智能体间通信移入模型的连续潜空间。对无人机集群而言，潜空间通信的吸引力不止于避免语言生成的开销。当语言模型阅读文本时，它构造一个向量——一长串数字——来表示其内部状态，即它在选定下一个词之前当下"所想"的内容；而写出一句话会丢弃其中大部分信息，因为模型持有的是关于可能含义的整个分布，却必须输出一个特定的词串。潜空间通信跳过这一中间符号表示，在共享兼容表示空间的智能体之间直接交换内部模型状态。

### A. 动机

设想这样一项任务：一支小型机队在非结构化的河盆或城市边缘巡查废弃物堆积与碎片。没有任何智能体看到完整场景；每个智能体持有部分的、真正含混的视图。机队必须在飞行过程中、经共享无线介质、在同时运行感知的伴飞计算机上，就"是否存在异常"达成一致。该场景的三个性质驱动了后续每一项设计决策。第一，**符号瓶颈**因其在通信与决策两方面的可测量开销而构成具体的系统级挑战。如果智能体必须在发送前把信念序列化为语言，将叠加三重损失。实测中，在数据中心 GPU 上每条消息耗时 0.88 s，在边缘级 GPU 上为 3.1 s，远高于一次前向传播。另一方面，潜信道引入了可观的通信开销，而这一开销在很大程度上仍未被计入。

### B. 贡献

本文提出 AeroLat，一个面向去中心化无人机集群的潜空间语义通信栈。所提系统把广播的隐状态视为**需要工程设计的信号**，而非需要传递的张量。每个智能体首先把完整的零样本视觉后验表述给冻结的机载 LLM，其次取最后一层隐状态作为消息，最后用一个线性算子去除共享的提示模板子空间——该算子由每个智能体**独立且相同地**导出，无需训练、无需协同，每条消息一次投影。白化后的状态随后经过一条显式建模的空中链路（含擦除、抖动、带宽受限的序列化、噪声与量化），其所承载的任务信息被**测量**而非断言。因此，在仿真以及本栈的二十五次冷启动飞行中，一致性跟踪的是场景而不是提示。概括而言，本文贡献如下：

- 我们提出**证据注入**与**模板白化**——一个既不需要训练也不需要智能体间协同的共享线性算子，却能把判别性相似度恢复到 0.025，这是去中心化无人机集群通信领域的一项独特贡献。
- 我们在同一感知栈上，把所提模型与现有集群调度方法进行基准对比，使用 Welch 检验与 Mann–Whitney 检验（含 Holm 校正）在二十个种子运行上评估。
- 我们在 PX4/AirSim 的实体化实验（edge 级 GPU）中验证完整栈，覆盖编解码器比较、故障注入、受损信道以及机队规模扩展，以说明所提方法的有效性。

## II. 相关工作

研究者一直在为去中心化无人机集群的语义通信栈发展新方法。表 I 概述了现有研究格局。本节按两类简要介绍现有文献：1）潜空间智能体间通信；2）语义通信与无人机网络。

### A. 潜空间智能体间通信

Interlat [1] 通过最后隐状态建立端到端通信，并把压缩学习到短的潜前缀中。LatentMAS [2] 通过最后一层嵌入与共享的 KV 工作记忆展示了免训练的潜空间协同，报告相对基于文本的多智能体系统最多 14.6% 的精度提升与 4–4.3× 的推理加速。CIPHER [3] 用期望嵌入绕过 token 采样。ThoughtComm [4] 通过稀疏正则化自编码器建立可辨识性保证；KVComm [5] 则通过传输校准后的 KV 缓存实现潜空间通信。文献 [13] 探索了无共享潜几何的稠密模型间消息传递。跨模型潜空间对齐由相对表示 [14] 与语义对齐翻译 [15] 实现；单模型内的连续潜空间推理可追溯到 COCONUT [16] 与 CODI [17]，并在 [18] 中扩展到视觉—语言模型。[6] 把具有冗余、近乎相同状态的同构 LLM 委员会形式化为一种病态，并给出有效秩（effective-rank）族的多样性度量。

### B. 语义通信与无人机网络

DeepSC 及其后继工作 [7] 以学习式联合信源—信道编码传输任务相关语义；[8] 把语义视为 6G 的机遇；[9] 把语义编码与知识图谱结合。无人机协同机队已有研究关注任务级目标巡查：机群在能量与行程约束下按时对目标进行巡检，并在真实外场实验与仿真中得到验证 [10]；该路线优化的是"无人机飞往何处"，而本文处理的是"升空之后彼此说什么"，二者是同一系统的互补层次。由应用层状态驱动的跨层分配 [11] 正是本文熵门控（entropy-gated）编解码策略在语义流量上所要实例化的设计模式。文献 [19] 处理通信信道的负载管理；文献 [20] 通过语义感知的流分割方案研究了索引调制下的通信语义；文献 [21] 探索了仅由激光或仅由电池供电的无人机混合架构，以提高航程与续航。最后，通过设备放置与模型划分在异构边缘节点间实现协同 DNN 推理 [12]，正是本文实体化扩展实验独立识别出的瓶颈。文献 [22] 提出了一种同时考虑移动性与阴影效应的新信道模型。

**小结。** 在详细分析现有方法后可以看到：在一个处于运行中的实体化去中心化集群里，如何在受限的移动信道上传输有信息量、未坍缩的 LLM 潜状态并维持任务相关语义，仍存在未解决的缺口。当前潜空间多智能体方法表明隐状态、期望嵌入或 KV 表示可以替代显式文本并降低推理开销，但它们大多假设无损、同址的软件信道，未考察移动性、带宽、丢包或信息陈旧性。无人机网络研究建模了移动性、竞争、能量与边缘计算等约束，却把载荷语义视为不透明。

### 表 I（原文 Table I）：相关工作对比

表注（原文）：本问题所需的两个能力簇中的相关工作。✓ = 已处理；✗ = 未处理；p = 部分处理。上块表示潜空间多智能体通信；中块表示语义通信；下块表示无人机网络与移动计算。

| 工作 | 领域 | LLM 潜载荷 | 抗坍缩 | 实测信息量 | 信道模型 | 移动性/节点速度 | 实体平台 | 种子化统计 |
|---|---|---|---|---|---|---|---|---|
| Interlat [1] | 潜空间多智能体 | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | p |
| LatentMAS [2] | 潜空间多智能体 | ✓ | ✗ | p | ✗ | ✗ | ✗ | ✓ |
| CIPHER [3] | 潜空间多智能体 | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | p |
| ThoughtComm [4] | 潜空间多智能体 | ✓ | p | p | ✗ | ✗ | ✗ | ✓ |
| KVComm [5] | 潜空间多智能体 | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Collapse study [6] | LLM 委员会 | ✓ | p | ✗ | ✗ | ✗ | ✗ | ✓ |
| DeepSC [7] | 语义通信 | ✗ | ✗ | p | ✓ | ✗ | ✗ | ✓ |
| Semantics for 6G [8] | 语义通信 | ✗ | ✗ | p | ✓ | ✗ | ✗ | p |
| KG semantic comm. [9] | 语义通信 | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Drone squads [10] | 无人机机队 | ✗ | ✗ | ✗ | p | ✓ | ✓ | ✓ |
| CLEVER [11] | 异构网络视频 | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Cooperative DNN inf. [12] | 边缘推理 | ✗ | ✗ | ✗ | p | ✗ | p | ✓ |
| **AeroLat（本文）** | 无人机潜空间通信 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## III. 系统模型

### A. 平台与定时

每个无人机 \(i\in\{1,\ldots,N\}\)（\(N\) 为集群规模）运行 PX4 [23] 飞控，通过 MAVLink/UDP 消费 10 Hz 的位置设定点；同时运行感知—推理栈、用于零样本锚定的 CLIP ViT-B/32 [24]、用于在滚动推理间隔 \(T_{\rm inf}=3\ \mathrm s\) 上生成潜状态的 Qwen2.5-0.5B [25]，以及用于语义旁信道（side-channel）的 TCP 网状套接字。两个循环不共享锁；推理截止期（deadline）未命中也只会降低消息新鲜度，绝不会影响飞行稳定性。这种解耦是所提工作的架构不变式，如图 1 所示。

### B. 消息生成

在每个推理节拍，无人机 \(i\) 采集帧 \(I_i(t)\)，计算 \(C=13\) 个场景/异常类别上的 CLIP 后验 \(p_i(t)\in\Delta^{C-1}\) 与图像嵌入 \(v_i(t)\in\mathbb R^{512}\)，构造证据表述化（evidence-verbalized）提示 \(x_i(t)\)，并抽取最后 \(k=8\) 个 token 的最后一层隐状态：

$$
h_i(t)=\operatorname{vec}\!\left(H_{i,-k:}^{(L)}\right)\in\mathbb R^{7168},
\qquad d_{\rm model}=896.\tag{1}
$$

广播状态是白化后的残差 \(\psi_i(t)\)。在线上实测的载荷大小（含 16 B 头部）为：每个状态 fp32 为 28,688 B、fp16 为 14,352 B、int8 为 7,184 B、int4 为 3,600 B。

### C. 信道模型

每条有向链路 \((i\to j)\) 依次施加：

1. **信源编码：** 量化 \(Q_b(\cdot)\)，其中 \(b\in\{32,16,8,4\}\) 比特/维（整数模式采用按向量的对称缩放）；可选地做 top-\(s\) 幅度稀疏化，并按每个保留系数计入显式的 32 比特索引开销。链路速率为

$$
R_{\rm link}=R_{\rm tot}/\left(N(N-1)\right).\tag{2}
$$

2. **噪声：** 对模拟传输，按每符号 SNR \(\gamma\) 加入加性白高斯噪声（AWGN），即

$$
\hat\psi=\psi+w,\qquad w\sim\mathcal N\!\left(0,s^2I\right),\tag{3}
$$

其中 \(s^2=\mathbb E[\psi^2]/10^{\gamma/10}\)。

3. **陈旧性：** 接收端丢弃年龄超过信息年龄（age-of-information）阈值 \(A_{\max}\) 的状态，融合时对幸存状态按 \(e^{-A/T_a}\) 折减。

完整网状网的在途负载为 \(\Lambda(N)=N(N-1)\,8n_B/T_{\rm inf}\)；以 fp32 载荷计，在 \(N=3,5,10,20\) 时该值分别为 0.5、1.5、6.9、29.1 Mb/s。此处明确写出二次增长，是因为它同时驱动量化与学习式压缩。

### D. 复杂度与开销

对每个智能体、每个推理节拍，计算代价包括一次 CLIP 前向与一次 LLM 前向。白化投影的复杂度为 \(\mathcal O(mD)\)，其中 \(m=4\)、\(D=7168\)；相对 Transformer 前向其开销可忽略，实测 \(<1\ \mathrm{ms}\)。除此之外，量化需要 \(\mathcal O(D)\) 次运算，融合的复杂度为 \(\mathcal O(ND)\)（注意力至多在至多 \(N-1\) 个同伴状态上进行）。因此，除两次固定前向之外，每智能体的计算量为 \(\mathcal O(ND)\)，且不依赖任务时长，因为不保留历史。通信开销为每智能体每节拍广播 \(n_B\) 字节，从而给出上述聚合在途负载 \(\Lambda(N)=N(N-1)8n_B/T_{\rm inf}\)。

### E. 评价指标

本文用以下指标评价通信质量、任务性能与集群状态多样性。对 \(M\) 次被评估的传输（或任务回合），语义中继成功率定义为

$$
{\rm SR}=\frac1M\sum_{m=1}^{M}\mathbf 1\{S_m\},\tag{4}
$$

其中 \(S_m\) 表示第 \(m\) 个回合满足任务特定成功判据。协同时延计算为

$$
\tau=t_{\rm enc}+t_{\rm ch}+t_{\rm int},\tag{5}
$$

三项分别表示编码、信道与接收端解释时间。为评估所传比特在保持任务相关信息方面的效力，用信息密度

$$
\rho=\frac{\hat I(\hat\psi;Y)}{b},\tag{6}
$$

其中 \(\hat I(\hat\psi;Y)\) 是接收语义状态与任务变量 \(Y\) 之间的估计互信息，\(b\) 为传输比特数。我们还度量接收端解码假设的广度。令 \(q_{(1)}\ge q_{(2)}\ge\cdots\ge q_{(K)}\) 表示按降序排列的解码类别概率，定义

$$
P_{50}=\min\left\{k:\sum_{j=1}^{k}q_{(j)}\ge\frac12\right\}.\tag{7}
$$

因此 \(P_{50}\) 越小，解码信念越集中；越大则假设广度越大。一致性 \(C(t)\) 是白化状态 \(N\times N\) Gram 矩阵 \(S_{ij}=\cos(\psi_i(t),\psi_j(t))\) 的非对角元均值。最后，我们用有效秩监测潜状态坍缩。令 \(\Psi(t)=[\psi_1(t),\ldots,\psi_N(t)]^\top\in\mathbb R^{N\times D}\) 为堆叠的集群潜集合，\(\bar\Psi(t)\) 为其列中心化形式，\(s_1\ge\cdots\ge s_R>0\) 为 \(\bar\Psi(t)\) 的非零奇异值；令 \(\pi_r=s_r/\sum_q s_q\)，使 \(\pi_r\ge0\) 且 \(\sum_r\pi_r=1\)，则有效秩为

$$
{\rm erank}=\exp\!\left(-\sum_r\pi_r\ln\pi_r\right).\tag{8}
$$

该过程消耗一个自由度，因此 \({\rm erank}\in[1,N-1]\)。当集群状态坍缩到共同方向时，该度量趋近 1；当它们张成权重相当、彼此独立的方向时，趋近 \(N-1\)。

### 表 II（原文 Table II）：符号表

| 符号 | 含义 |
|---|---|
| \(D_i\) | 智能体（无人机）\(i\) |
| \(T_{\rm inf}\) | 感知/推理间隔（3 s） |
| \(I_i(t),v_i(t)\) | \(D_i\) 的帧与 CLIP 图像嵌入 |
| \(p_i(t),H_i(t)\) | \(C=13\) 类上的 CLIP 后验；其熵 |
| \(x_i(t)\) | 证据表述化的提示 |
| \(h_i(t)\) | 来自最后 \(k=8\) 个隐状态的原始潜向量，位于 \(\mathbb R^{7168}\) |
| \(\mu\) | 白化均值 |
| \(P\) | top-\(m\) 模板子空间 |
| \(\psi_i(t)\) | 白化后的广播状态 |
| \(\hat\psi_j\) | 收到的同伴状态（经信道后） |
| \(\lambda\) | 融合系数 |
| \(a_{jm}\) | 注意力权重 |
| \(A_m\) | 消息年龄 |
| \(T_a\) | 陈旧性折减常数 |
| \(Q_b(\cdot)\) | \(b\) 比特/维的量化器 |
| \(n_B\) | 载荷字节数 |
| \(p_\ell\) | 擦除概率 |
| \(\gamma\) | 每符号 SNR |
| \(R_{\rm tot}\) | 共享介质预算 |
| \(R_{\rm link}\) | 每链路速率 |
| \(\Lambda(N)\) | 网状网聚合在途负载 |
| \(D_{\rm sem}\) | 语义失真 \(1-\cos(\psi,\hat\psi)\) |
| \(C(t)\) | 白化后一致性 |
| \(v\) | 节点速度 |
| \(f_d\) | 多普勒频移 |
| \(T_c\) | 相干时间 |
| \(\tau\) | 时延 |
| \(\rho\) | 信息密度 |

## IV. 坍缩病态与 AeroLat 修正

### A. 模板白化

令 \(\{h_b(t)\}_{b=1}^{B}\) 为覆盖多样场景的原始潜向量校准缓冲。以均值 \(\mu\) 与中心化缓冲的前 \(m\) 个右奇异向量 \(P\in\mathbb R^{m\times D}\)，每个智能体广播 \(P\) 张成的模板子空间之外的残差，该残差承载场景特定的变化。由于所有智能体运行相同的冻结权重与确定性校准协议，\((\mu,P)\) 在整个机队中**无需协同**即可保持一致。所有相似度、一致性、融合与信道失真计算都在 \(\psi\) 上进行。取 \(m=4\) 时，该算子对每条消息只做一次 \(D\times m\) 的投影。

### B. 损伤下的融合，以及第二种坍缩机制

接收端 \(j\) 通过缩放点积注意力（含自身）融合本地的 \(\psi_j\) 与同伴状态，并按消息年龄 \(A_m\) 折减：

$$
a_{jm}\propto
\exp\!\left(\psi_j^\top\psi_m/\sqrt D\right)e^{-A_m/T_a},
\qquad
\psi_j^{\rm new}=\operatorname{norm}\!\left(
(1-\lambda)\psi_j+\lambda\sum_{m\neq j}\tilde a_{jm}\psi_m
\right).\tag{9}
$$

融合系数 \(\lambda\) 控制同伴信息的贡献，需经实验选取。此处有一个结构性要求：融合必须使用**新鲜**的感知潜状态作为 \(\psi_j\)，而不是上一轮融合后的状态。对已融合状态迭代式 (9) 是一个 DeGroot 平均过程，对任意 \(\lambda>0\)、不论场景多样性如何，都会收敛到一个共同向量。这导致一种与提示诱导的表征坍缩不同的**动力学坍缩**。为避免跨轮反复平均，AeroLat 每隔 \(T_{\rm inf}\) 重新初始化本地感知。

## V. 语义率—失真与信息量核算

在评估信道性能之前，我们首先刻画传输损伤对潜状态所承载几何结构与任务相关信息的影响。随后本节用互补的失真度量与信息量度量，在若干信道工作点上分析 AeroLat。

### A. 实测率—失真

在语料上扫描量化与稀疏化，得到图 2。必须如实说明：在这些维度上，一旦计入 32 比特索引开销，top-\(s\) 稀疏化**没有竞争力**；一般而言，在低于约 4× 压缩时，稀疏 int8 向量比稠密向量消耗更多线上字节。AWGN 稳健性见图 3；准确率一路保持平坦直到 0 dB，这正是数字符号分组在残余误比特下无法呈现的**优雅降级**曲线。

### B. 实测信息密度

我们用 \(I(\hat\psi;Y)\) 的两个下界（\(Y\) 为场景/异常类别）来量化接收潜状态 \(\hat\psi\) 中保留的任务相关信息：由探测误差 \(e\) 得到的 **Fano 界**

$$
I\ge H(Y)-H_b(e)-e\log_2\!\left(|\mathcal Y|-1\right),\tag{10}
$$

以及按工作点训练的神经评判器 **InfoNCE 界** \(I\ge\log N_b-\mathcal L_{\rm NCE}\)。表 III 同时报告二者与 \(\rho=\hat I/b\)。量化在任务信息上几乎免费（表 III），因此线密度在实测语义代价为零的情况下提高 8×。

### 表 III（原文 Table III）：每状态实测信息量与信息密度 \(\rho\)

表注（原文）：神经 InfoNCE 界与 Fano 界；任务上限 \(H(Y)=2.52\) 比特；0 dB 处的边际超出反映有限批估计器的方差。

| 工作点 | 比特/状态 | \(\hat I_{\rm NCE}\) | Fano | \(\rho\)（b/kb） |
|---|---|---|---|---|
| fp32，无噪 | 229,504 | ≥2.52 | 1.91 | 0.011 |
| fp16 | 114,816 | ≥2.52 | 1.91 | 0.022 |
| int8 | 57,472 | ≥2.52 | 1.90 | 0.044 |
| int4 | 28,800 | ≥2.52 | 1.88 | 0.088 |
| fp32 @ 10 dB | 229,504 | ≥2.52 | 1.83 | 0.011 |
| int8 @ 10 dB | 57,472 | ≥2.52 | 1.83 | 0.044 |
| fp32 @ 0 dB | 229,504 | ≥2.53 | 1.78 | 0.011 |

## VI. 学习式压缩：四损失协议

下面的四损失目标沿用 Interlat [1] 提出的分类法；本文在此的贡献是经验性的——已有工作只陈述这些损失而不训练、不剖析它们，而随后的留一损失消融为每一项赋予了实测作用。压缩器 \(M_c\) 把完整潜轨迹 \(\mathcal H_L\) 映射到 \(\mathcal H_K\in\mathbb R^{8\times896}\)，并以冻结的 LLM 作为测量装置来训练：

$$
\mathcal L=\mathcal L_{\rm task}+a\mathcal L_{\rm sep}+b\mathcal L_{\rm pref}+c\mathcal L_{\rm geom},\tag{11}
$$

其中 \(\mathcal L_{\rm task}\) 是冻结接收端在把 \(\mathcal H_K\) 作为软前缀的条件下生成正确结构化巡查报告时的交叉熵；\(\mathcal L_{\rm sep}=-{\rm JS}\left(p_\theta(\cdot\mid\mathcal C,\mathcal H),p_\theta(\cdot\mid\mathcal C,\tilde{\mathcal H})\right)\)，其中 \(\tilde{\mathcal H}\) 为批次错配的潜状态（"必须倾听"压力）；\(\mathcal L_{\rm pref}\) 是完整轨迹条件与压缩条件之间、按置信度加权的师生 KL；最后 \(\mathcal L_{\rm geom}=1-\cos(\bar z^{(A)},\bar z^{(D)})\) 对齐步平均的 actor 特征。如图 4 与表 IV 所示，训练在不到 38 个 epoch 内收敛，匹配前缀与错配前缀之间的 Jensen–Shannon 分离增加约 0.1 nat，从而确认了对传输潜状态的依赖。消融表明：\(\mathcal L_{\rm pref}\) 防止捷径学习，\(\mathcal L_{\rm geom}\) 保持潜取向，\(\mathcal L_{\rm sep}\) 强制前缀依赖且对任务损失影响很小。可选的压缩器把 int8 载荷从 57.5 kb 降到 14.3 kb；视觉前缀投影器进一步把验证探测准确率提高到 0.973。

### 表 IV（原文 Table IV）：压缩器训练与留一损失消融

表注（原文）：初始 → 最终损失值（完整训练 30 个 epoch；消融 15 个；为便于对照，完整训练在第 14 个 epoch 读到 \(\mathcal L_{\rm task}=0.405\)）。

| 运行 | \(\mathcal L_{\rm task}\) | \(\mathcal L_{\rm sep}\) | \(\mathcal L_{\rm pref}\) | \(\mathcal L_{\rm geom}\) |
|---|---|---|---|---|
| 完整 | 2.37→0.39 | −.01→−.11 | 3.36→1.52 | .38→.07 |
| 无 sep | →0.39 | （关闭） | →1.55 | →.08 |
| 无 pref | →0.008 | →−.13 | （关闭） | →.13 |
| 无 geom | →0.41 | →−.10 | →1.87 | （关闭） |

## VII. 实验评估

本节在受控设置与全栈设置两方面评估 AeroLat 的表征质量、信道稳健性、基线性能与集群可扩展性。在仿真阶段，我们采用高保真软件在环（Software-In-The-Loop，SITL）架构，与细致的 AirSim（Unreal Engine）邻域环境 [26] 交互，提供连续、非结构化的三维试验场。

### A. 协议

我们从 UC Merced 土地利用数据集 [27]（用于土地利用分类的高分辨率航空影像基准）中构建评价语料：1,000 幅航空图像，覆盖六个场景类别。拟合得到的白化器被导出为部署产物。语义层实验（探测评估、信道扫描、消融与扩展研究）在 10–20 个随机种子上进行，报告均值 ± 标准差以及 95% bootstrap 置信区间。基线比较采用 Welch \(t\) 检验、Mann–Whitney \(U\) 检验（含 Holm 校正）以及 Cohen \(d\)。全栈验证在 NVIDIA T1000（4 GB）上以 SITL 任务完成；语义层实验与训练在 RTX 6000 Ada 上进行，AirSim 也运行于该机。

### B. 坍缩与表征诊断

坍缩及其缓解见表 V。在 argmax 提示下，跨场景原始潜向量之间的平均余弦相似度为 0.9978。正是模板白化把混合场景上的判别性相似度恢复到 0.025，同时提高潜多样性（\({\rm erank}=233\)），表明语义内容与表示几何构成两种不同的失效模式。我们还在 \(H(Y)=2.52\) 比特、1,000 个样本的六类航空语料上检验表示，采用三项诊断：

- **D1（探测可恢复性）。** 五折线性探测在原始状态上得到 \(0.915\pm0.032\) 的准确率，白化后为 \(0.916\pm0.030\)，而由广播向量预测场景类别的随机准确率为 0.167。
- **D2（表征敏感性）。** 固定模板、只改变视觉输入时，场景间与场景内潜距离之比为 1.34。
- **D3（冲突融合/叠加）。** 在 \(\lambda=0.4\) 下融合来自两个**冲突**场景的白化潜状态，融合状态的探测 top-2 在 400 次试验中有 92.75% 同时包含两个来源假设（塌缩为单一假设：7.25%）。

### 表 V（原文 Table V）：坍缩的复现与修复

表注（原文）：每个条件 \(n=400\)；随机水平 \(=0.167\)。第 4 行即早期草稿中"1.00 相似度"旗标结果，此处给出解释。

| 指标 | Argmax 提示（此前系统） | 证据提示（AeroLat） |
|---|---|---|
| 探测准确率，原始 \(h\) | 0.593±0.071 | 0.923±0.020 |
| 探测准确率，白化 \(\psi\) | 0.500±0.065 | 0.878±0.037 |
| Fano 互信息（原始），比特 | 0.61 | 1.96 |
| 非对角余弦，原始 | 0.9978 | 0.9989 |
| 非对角余弦，白化 | 0.184 | 0.025 |
| 有效秩，原始→白化 | 7.9→4.1 | 164→233 |

### C. 基线比较

表 VI 与图 5 报告在**语义中继**协议下的正面对比：发送端感知场景、用被测编解码器编码消息、消息穿过仿真信道，接收端必须仅凭消息识别发送端所处场景。JSON 基线在时延与载荷大小上仍更高效，只需 120 字节的消息。潜表示还带来更锐利的解码信念（\(P_{50}=1.58\)），优于符号基线（约 2.25）；D3 亦确认在 92.75% 的试验中保留了冲突假设。概括而言，AeroLat 相对最佳符号基线把 SR 提高 0.24，代价是显著更大的传输载荷。

### D. 消融

- **\(\lambda\) 扫描与两种融合机制。** 在证据刷新（evidence-refreshed）动力学下（图 5），\(\lambda\) 呈现清晰的权衡：同场景一致性在 \(\lambda=0\to0.4\to1.0\) 时依次上升为 0.50→0.84→1.00，而融合状态的探测准确率在 \(\lambda\le0.3\) 时保持 1.000，\(\lambda=0.4\) 时为 0.978，之后退化（\(\lambda=0.5\) 时 0.933；\(\lambda=1.0\) 时 0.489）。在纯 gossip 动力学下（对已融合状态迭代融合），集群对**任意** \(\lambda\ge0.1\) 都收敛到跨场景一致性 1.0，而融合准确率坍缩到 0.489。
- **组件消融：**
  - **白化：** 实验发现探测准确率基本不变（0.915→0.916），而全语料上平均非对角余弦从 0.999 降至 0.188——改变的是几何而非内容，与表 V 一致。
  - **CLIP 锚定：** 从提示中移除视觉证据后，探测准确率降到 0.18 ≈ 随机水平，而保留时为 0.78。该结果识别出一种坍缩机制，并表明场景特定的视觉内容源自视觉锚定。抽取 token 数量的影响见图 5；与压缩器损失相关的消融汇总于表 IV。

### E. 移动性：节点运动下的时延与投递

如第 III-C 节所述，信道是静态的，但空中节点不是。因此，我们用标准的块衰落（block-fading）处理扩展链路模型以纳入移动性，并离线扫描。结果表明 int4 量化实际上**对任务无损**；移动性结果则表明，同样的压缩对时变信道中的可靠潜通信也至关重要。在 0.9 投递下限下，机队在 fp32 时支持 \(N=4\)，在 int4 时支持 \(N=10\)——这 8× 的速率缩减在任务信息上不付出代价，却换来 2.5× 更大的集群。该结果为在途负载趋势给出了直接可操作的解释，即直接对应网络设计所关心的可扩展性与可靠性约束。

### F. 全栈 SITL 实验

表 VI 报告实体化实验，图 9 展示一次采集任务中的代表性机载感知。由表 VI 与图 9 可得：

1. **任务结果可以带到飞行中。** AeroLat 在全部五次任务中都检测到异常；作为对比，JSON 基线三次运行中仅检测到一次，CoT 在两次被评估的任务中均失败。性能差异来自通信与推理开销，而非视觉感知的差异，尽管所有方法使用同一感知栈。特别地，CoT 在边缘平台上生成每条消息约需 3.1 s，使平均消息年龄升至 22.6 s，而 AeroLat 为 51 ms。
2. **坍缩在现场被复现。** 因此，白化后的 AeroLat 表示对视觉环境的变化敏感得多。

### 表 VI（原文 Table VI）：十八次任务的 SITL 实验

表注（原文）：一次任务挂起由每任务看门狗回收；17/18 次正常完成。粗体标出正文讨论的数值：潜编解码器的成功率以及两种失效特征（CoT 的网状泛洪、无白化对照的坍缩一致性）。

| 配置 | 任务数 | SR | 编码 ms（中位/p95） | 白化 \(C(t)\) | 投递 | 网状时延 |
|---|---|---|---|---|---|---|
| 符号 CoT | 2 | **0.00** | 3,137/3,464 | 0.638±0.083 | 1.00 | **22.6 s** |
| JSON 调度 | 3 | 0.33±0.47 | 71/79 | 0.886±0.041 | 1.00 | 39 ms |
| 潜空间，坏无人机 {1,2,3} | 3 | 0.67（2/3） | 114–120 | 0.83±0.06 | 1.00 | 13–60 ms |
| 潜空间，20% 丢包 + int8 + 50/25 ms 抖动 | 2 | 0.50 | 117/128 | 0.656±0.100 | 0.80 | 136 ms |
| 潜空间，无白化（对照） | 2 | 0.00 | 146/159 | **0.999±0.000** | 1.00 | 134 ms |
| 潜空间 | 5 | **1.00** | 117/127 | 0.678±0.094 | 1.00 | 51 ms |

### G. 实体化扩展与边缘算力上限

仿真扫描确定了网络可支持的通信负载。另一次飞行实验用于测量完整实体化栈的可扩展性。我们在同一台边缘主机上（该主机同时运行仿真器与全部 \(N\) 个自驾仪，以及共享的感知—LLM 流水线）增量式尝试 \(N\in\{5,10,15,20\}\)（每种规模两次种子任务，开启帧记录与逐节拍潜状态转储，某规模连续失败两次即自动中止）。有四点观察：

1. **飞行完成处任务指标平坦。** 每个规模下每一次完成的任务都确认了异常（SR=1.00），且网状投递率在一直到 \(N=10\) 的整个实验中保持 1.00，没有丢失一个潜数据包。
2. **规模扩展时不发生坍缩。** 循环白化状态的有效秩随集群规模近乎线性增长，从 1.9 到 3.8 和 7.6，约对应 \(0.75N\)。这表明增加无人机为集群的共享思维空间增加的是**维度**，而不是单一想法的冗余副本；同场景一致性也保持在判别带（0.63–0.68）内，而不是漂移到 0.999 的伪像。
3. **增长的是计算，而非带宽。** 编码时延中位数从 117 ms 升至 148 ms，更具决定性的是，平均接收消息年龄从 \(N=5\) 的 78 ms 跳到 \(N=10\) 的 2.9 s，而投递仍保持完美。该延迟是共享 GPU 上的推理排队，而非网络所致。随时可用的、感知陈旧性的融合吸收了这一点；SR 未受损，但这一趋势识别出边缘芯片上的真实扩展瓶颈。它与仿真结果中"网状网在 \(N=20\) 仍然成立（图 8）"恰好互为镜像：实体化实验表明，**处理器先饱和**。

### 表 VII（原文 Table VII）：实体化扩展实验

表注（原文）：该实验按设计是增量式的：每一规模必须先成功才尝试下一规模，因此失败边界本身即是一次测量。

| \(N\) | 任务数 | SR | 编码 ms | 白化 \(C(t)\) | erank | 消息年龄 |
|---|---|---|---|---|---|---|
| 3 | 5 | 1.00 | 117 | 0.678±0.094 | 1.9 | 51 ms |
| 5 | 3 | 1.00 | 119 | 0.649±0.070 | 3.8 | 78 ms |
| 10 | 2 | 1.00 | 148 | 0.632±0.068 | 7.6 | 2.9 s |
| 15 | 0/2 | 看门狗 900 s / 启动失败；11/15 升空，132 帧 | — | — | — | — |

### H. 与现有方法的比较

相对 Interlat，我们共享抽取协议与损失分类法，但把函数调用信道替换为一条经飞行中实时 TCP 网状网穿越的、仿真化的有损、含噪、带限网络，并直面实体化集群所面临的坍缩情形。相对 LatentMAS，我们共享免训练理念，但 KV 缓存工作记忆预设了无损同址传输，而 AeroLat 固定的 7,168 维状态是为具有可量化失真的预算受限链路设计的。相对坍缩文献 [6]，我们贡献了机制、一个闭式的去中心化缓解方法，以及"坍缩可分解为表征通道与动力学通道"的观察。相对 DeepSC 类语义通信 [7]–[9]，我们使用其评价工具集，但传输冻结 LLM 的原生状态，在无需训练编解码器的情况下实现优雅降级。

## VIII. 结论

AeroLat 把智能体间的潜空间通信从软件基准机制推进为面向无人机集群的、网络真实且经统计验证的语义通信系统。它识别并缓解了表征坍缩，显式建模了所传潜状态经历的通信损伤，并量化了跨信道保留的任务相关信息。

作为未来工作，我们将开展硬件在环的无线电实验，以在实测衰落、干扰与竞争中验证 AeroLat；我们还计划通过不同冻结模型之间的潜空间对齐，把框架扩展到异构无人机机队。

## 图注与表注

**图 1（原文 Fig. 1）：** 单个智能体 \(D_i\) 的 AeroLat 系统架构。(A) 零样本 CLIP 感知输出完整后验、图像嵌入、视觉熵与位姿，而非 argmax 标签；(B) 这些证据被表述进冻结 LLM 的提示；(C) 模板白化去除共享共模子空间。中部描绘异步 TCP 潜空间网状网，每个数据包一条连接，带序列号与发送时间戳，使接收端能够测量消息年龄。(D) 陈旧性感知的注意力融合；(E) 符号化飞行栈。

**图 2（原文 Fig. 2）：** 真实潜语料上的语义率—失真（十个种子）。从 fp32（229.5 kb/状态）到 int8（57.5 kb）的稠密量化在语义上无损（\(D_{\rm sem}\le2\times10^{-4}\)）；int4（28.8 kb）的几何代价为 \(D_{\rm sem}=0.067\)，而接收端探测准确率仍为 0.905：在该编解码器族内，速率可在任务失真开始之前被压缩 8×。

**图 3（原文 Fig. 3）：** AWGN 稳健性。从 30 dB 降到 0 dB SNR，几何失真增大（\(D_{\rm sem}\) 从 0.000 到 0.293），而接收端探测准确率保持平坦（0.892→0.889）：白化潜编码优雅降级，没有数字悬崖。

**图 4（原文 Fig. 4）：** 任务相关信息（InfoNCE 与 Fano 下界，柱）与每个信道工作点的密度 \(\rho\)（线）。状态基本承载了全部任务熵，并能在 int4 量化与 0 dB AWGN 同时存在时保持它。

**图 5（原文 Fig. 5）：** 二十个种子上的基线比较。从左到右：中继成功率、协同时延 \(\tau\)、信息密度 \(\rho\) 与假设广度 \(P_{50}\)。

**图 6（原文 Fig. 6）：** 丢包下的一致性（i.i.d. 与 Gilbert–Elliott 突发；\(N=5\) 融合网格，十个种子）。在高达 50% 的每种丢包率下，最终同场景一致性均为 1.00；丢包只增加收敛时间（1.9→2.3 轮）。

**图 7（原文 Fig. 7）：** 带宽上限下的信息年龄（50 ms 链路时延）：p95 消息年龄随每编解码器链路速率的变化。在 500 kb/s 时，量化把潜消息从 552 ms（fp32）降到 208 ms（int8）与 151 ms（int4），而 JSON 的下限为 100 ms；在 ≥5 Mb/s 时所有编解码器收敛。

**图 8（原文 Fig. 8）：** 网状网扩展（十个种子）：达到 \(C\ge0.9\) 所需轮次呈次线性增长（\(N=3\to20\) 时为 1.4→2.3）；在 int8 载荷、10% 丢包的共享 20 Mb/s 介质下，网状网在每个 \(N\) 上都保持 0.90 投递率与不变的收敛性。

**图 9（原文 Fig. 9）：** 无人机实际看到的画面。异质性正是要点：在任一时刻，集群持有彼此真正不同、各自含混的视图——\(D_1\) 把生成的簇读作"碎片"的概率仅为 \(p=0.25\)、\(H=2.28\) nat——而正是这种残余不确定性，由白化潜信道传输、并被基于 argmax 的 JSON 编解码器破坏。

## 参考文献（英文原书目）

[1] Z. Du, R. Wang, H. Bai, Z. Cao, X. Zhu, Y. Cheng, B. Zheng, W. Chen, and H. Ying, “Enabling agents to communicate entirely in latent space,” in Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), 2026, pp. 27 106–27 129.

[2] J. Zou, R. Qiu, G. Li, X. Yang, K. Tieu, P. Lu, K. Shen, H. Tong, Y. Choi, J. He et al., “Latent collaboration in multi-agent systems,” arXiv preprint arXiv:2511.20639, 2025.

[3] C. Pham, B. Liu, Y. Yang, Z. Chen, T. Liu, J. Yuan, B. Plummer, Z. Wang, and H. Yang, “Let models speak ciphers: Multiagent debate through embeddings,” in International Conference on Learning Representations, vol. 2024, 2024, pp. 51 899–51 928.

[4] Y. Zheng, Z. Zhao, Z. Li, Y. Xie, M. Gao, L. Zhang, and K. Zhang, “Thought communication in multiagent collaboration,” Advances in Neural Information Processing Systems, vol. 38, pp. 123 389–123 418, 2026.

[5] H. Ye, Z. Gao, M. Ma, Q. Wang, Y. Fu, M.-Y. Chung, Y. Lin, Z. Liu, J. Zhang, D. Zhuo et al., “Kvcomm: Online cross-context kv-cache communication for efficient llm-based multi-agent systems,” Advances in Neural Information Processing Systems, vol. 38, pp. 17 882–17 928, 2026.

[6] D. Patel, “Representational collapse in multi-agent llm committees: Measurement and diversity-aware consensus,” arXiv preprint arXiv:2604.03809, 2026.

[7] H. Xie, Z. Qin, G. Y. Li, and B.-H. Juang, “Deep learning enabled semantic communication systems,” IEEE transactions on signal processing, vol. 69, pp. 2663–2675, 2021.

[8] M. Sana and E. C. Strinati, “Learning semantics: An opportunity for effective 6g communications,” in 2022 IEEE 19th Annual Consumer Communications & Networking Conference (CCNC). IEEE, 2022, pp. 631–636.

[9] N. Hello, P. Di Lorenzo, and E. C. Strinati, “Semantic communication enhanced by knowledge graph representation learning,” in 2024 IEEE 25th International Workshop on Signal Processing Advances in Wireless Communications (SPAWC). IEEE, 2024, pp. 876–880.

[10] N. Bartolini, A. Coletta, G. Maselli et al., “A multi-trip task assignment for early target inspection in squads of aerial drones,” IEEE Transactions on Mobile Computing, vol. 20, no. 11, pp. 3099–3116, 2020.

[11] S. Colonnese, F. Cuomo, L. Chiaraviglio, V. Salvatore, T. Melodia, and I. Rubin, “Clever: A cooperative and cross-layer approach to video streaming in hetnets,” IEEE Transactions on Mobile Computing, vol. 17, no. 7, pp. 1497–1510, 2017.

[12] P. Dai, B. Han, K. Li, X. Xu, H. Xing, and K. Liu, “Joint optimization of device placement and model partitioning for cooperative dnn inference in heterogeneous edge computing,” IEEE Transactions on Mobile Computing, vol. 24, no. 1, pp. 210–226, 2024.

[13] S. Wu, Y. Wang, and Q. Yao, “Dense communication between language models,” arXiv e-prints, pp. arXiv–2505, 2025.

[14] L. Moschella, V. Maiorca, M. Fumero, A. Norelli, F. Locatello, and E. Rodolà, “Relative representations enable zero-shot latent space communication,” arXiv preprint arXiv:2209.15430, 2022.

[15] V. Maiorca, L. Moschella, A. Norelli, M. Fumero, F. Locatello, and E. Rodolà, “Latent space translation via semantic alignment,” Advances in Neural Information Processing Systems, vol. 36, pp. 55 394–55 414, 2023.

[16] S. Hao, S. Sukhbaatar, D. Su, X. Li, Z. Hu, J. Weston, and Y. Tian, “Training large language models to reason in a continuous latent space, 2024,” URL https://arxiv.org/abs/2412.06769, vol. 98, 2022.

[17] Z. Shen, H. Yan, L. Zhang, Z. Hu, Y. Du, and Y. He, “Codi: Compressing chain-of-thought into continuous space via self-distillation,” in Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, 2025, pp. 677–693.

[18] T.-H. Pham and C. Ngo, “Multimodal chain of continuous thought for latent-space reasoning in vision-language models,” arXiv preprint arXiv:2508.12587, 2025.

[19] I. Maity, S. Misra, and C. Mandal, “Core: Prediction-based control plane load reduction in software-defined iot networks,” IEEE Transactions on Communications, vol. 69, no. 3, pp. 1835–1844, 2020.

[20] X. Guo, Y. Xu, D. He, H. Hong, Z. Chen, C. Zhang, Y. Wu, and W. Zhang, “Spatial semantic communication: When semantic transmission meets index modulation,” arXiv preprint arXiv:2607.19934, 2026.

[21] A. M. Abdelhady, C. Diaz-Vilor, M. Barzegaran, H. Jafarkhani, and A. M. Eltawil, “Optimization of hybrid laser-battery-powered uav-assisted backscatter communications,” IEEE Transactions on Communications, vol. 73, no. 11, pp. 11 690–11 706, 2025.

[22] P. S. Bithas, V. Nikolaidis, A. G. Kanatas, and G. K. Karagiannidis, “Uav-to-ground communications: Channel modeling and uav selection,” IEEE Transactions on Communications, vol. 68, no. 8, pp. 5135–5144, 2020.

[23] L. Meier, D. Honegger, and M. Pollefeys, “Px4: A node-based multithreaded open source robotics framework for deeply embedded platforms,” in 2015 IEEE international conference on robotics and automation (ICRA). IEEE, 2015, pp. 6235–6240.

[24] A. Radford, J. W. Kim, C. Hallacy, A. Ramesh, G. Goh, S. Agarwal, G. Sastry, A. Askell, P. Mishkin, J. Clark et al., “Learning transferable visual models from natural language supervision,” in International conference on machine learning. PmLR, 2021, pp. 8748–8763.

[25] B. Hui, J. Yang, Z. Cui, J. Yang, D. Liu, L. Zhang, T. Liu, J. Zhang, B. Yu, K. Lu et al., “Qwen2. 5-coder technical report,” arXiv preprint arXiv:2409.12186, 2024.

[26] S. Shah, D. Dey, C. Lovett, and A. Kapoor, “Airsim: High-fidelity visual and physical simulation for autonomous vehicles,” in Field and service robotics: Results of the 11th international conference. Springer, 2017, pp. 621–635.

[27] Y. Yang and S. Newsam, “Bag-of-visual-words and spatial extensions for land-use classification,” in Proc. 18th ACM SIGSPATIAL Int. Conf. Advances in Geographic Information Systems (GIS), San Jose, CA, USA, 2010, pp. 270–279.

**本页范围与校对状态：** 本页覆盖原文摘要、关键词、第 I–VIII 节全部正文（含 VIII 节的未来工作）、式 (1)–(11)、表 I–VII（逐格转写，矢量表已用 PDF 渲染页逐格核对）、图 1–9 图注、参考文献 [1]–[27]（英文原条目、按原编号）。原文无致谢与附录。需要说明的抽取限制：(1) 源抽取文本中部分交叉引用显示为 "Fig.?? / Table ??"（PDF 文本层引用标记丢失），本页按上下文以"图 5 / 表 IV"等实际编号表述，未臆造新数据；(2) 表 VII 第 4 行（N=15）原文即记录为"看门狗 900 s / 启动失败"，非数值失败边界，照录；(3) 图 1–9 为示意图/曲线图，本页不复制图片、不对图内曲线作数字化估算。逐句逐式终校未做。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
