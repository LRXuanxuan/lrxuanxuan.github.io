---
layout: page
title: "面向多用户毫米波无人机系统的移动性与反馈感知多级冲突触发混合波束赋形｜中文全文译文"
permalink: /papers/translations/2026-10-08-2609-15458-mobility-and-feedback-aware-multi-level-conflict-triggered-hybrid-beam/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/afeda7eb730cc0b0/) · [原文 arXiv](https://arxiv.org/abs/2609.15458) · [全部目录](/papers/catalog/)

# 面向多用户毫米波无人机系统的移动性与反馈感知多级冲突触发混合波束赋形

**原题：** Mobility- and Feedback-Aware Multi-Level Conflict-Triggered Hybrid Beamforming for Multi-User mmWave UAV Systems  
**作者：** Thuan Van Le（越南河内 Phenikaa 大学 Phenikaa 工程学院电子与电气工程系）、Nguyen Cong Luong（越南河内 Phenikaa 大学 Phenikaa 计算学院）、Xingwang Li（中国河南理工大学物理与电子信息工程学院）、Vo Nguyen Quoc Bao（越南胡志明市 Van Lang 大学 Van Lang 技术学院信息技术系）、Ngo Hoang Tu（越南胡志明市 Van Lang 大学 Van Lang 技术学院信息技术系，通讯作者），其中 Xingwang Li、Vo Nguyen Quoc Bao 为 IEEE 高级会员，Ngo Hoang Tu 为 IEEE 会员。  
**版本：** arXiv:2609.15458v1（eess.SP），原文标注日期 2026 年 9 月 14 日，共 17 页。  
**范围与状态：** 全文中文译稿：摘要、第 I—VII 节、结论、算法 1、全部图注与表注、参考文献（英文原条目 [1]—[38]）均按原文结构录入；表 I—V 已用 PDF 渲染图逐格核对。逐句逐式终校未做，不标记为已验收全文。

## 摘要

本文研究多用户大规模多输入多输出（MIMO）毫米波（mmWave）无人机（UAV）下行系统中的混合波束赋形问题，所考虑的损伤包括移动性引起的信道老化与波束训练反馈时延。基于紧凑时延报告的模拟波束选择本质上是一种部分观测决策，而额外的候选评估会消耗处理时间并缩短有效载荷区间。为在不始终开启候选搜索的前提下提升鲁棒性，我们提出一种移动性与反馈感知的多级细化策略，称为 MLR-TG。候选子集按预测净效用排序；该预测净效用由报告码字的量化复系数与 UAV 移动状态构造，而传输端的正则化迫零（RZF）预编码器在模拟子集确定之后，仅由导频估计的有效信道状态信息（CSI）计算一次。细化级别根据冲突严重度与老化敏感度自适应选择。该选择规则是"预测效用最大化"的双统计量近似，采用与系统规模无关的冲突得分，并在与评估集不相交的训练数据上离线校准。基于三维空地模型（含 UAV 姿态动态与公共信道轨迹）的仿真表明：相对于贪心扇区波束赋形，MLR-TG 将系统中断概率降低 26.7%，将第 5 百分位用户速率提升 53.9%，而净频谱效率仅相差 0.96%；相对于始终开启的全局 top-3 细化，MLR-TG 的净频谱效率提升 5.5%，同时候选评估次数减少 77.9%；相对于非因果 CSI 的级别 oracle，其净频谱效率差距在 3.4% 以内，而所需反馈比特数比全 CSI 报告少 86.9%。

**关键词：** 毫米波；动态无人机（UAV）；混合波束赋形；波束训练；信道老化；反馈时延；低复杂度波束选择。

## I. 引言

### A. 研究背景与文献综述

毫米波（mmWave）多输入多输出（MIMO）通信凭借可用的大带宽与高方向性传输，已成为 5G 及后 5G 高谱效（SE）无线系统的关键使能技术 [1]。然而，毫米波 MIMO 中的全数字波束赋形通常不切实际，因为每根天线都需要专用射频（RF）链，导致高硬件成本与功耗 [2]、[3]。混合波束赋形（hybrid beamforming，HBF）因此成为实用方案：它将高维模拟前/后处理与较低维数字处理相结合，在波束赋形性能、能量效率（EE）与实现复杂度之间取得有利折中 [4]、[5]。

这一折中在无人机（UAV）辅助的毫米波系统中更为突出 [6]、[7]。与地面链路相比，UAV 通信受益于更强的视距（LoS）传播、灵活部署与更好的空间覆盖，使毫米波传输对空中高速链路具有吸引力 [8]、[9]。然而，UAV 移动性带来额外挑战，包括多普勒引起的信道老化、波束失准、波束冲突以及快速变化的角域几何。若波束管理设计得不够保守，这些因素可能显著降低波束赋形性能 [10]–[12]。因此，毫米波多用户（MU）MIMO UAV 系统中的 HBF 必须同时考虑波束赋形增益、有限反馈、移动性敏感度、波束冲突与计算复杂度 [13]。与该问题相关的已有工作大致可分为三个方向。

1) **基于全信道状态信息（CSI）的 HBF。** 毫米波 MIMO UAV 系统的早期工作通常假设全 CSI 或高质量 CSI，从而可以采用基于优化的先进 HBF 设计。例如，Chen 等 [14] 研究了毫米波 MU 大规模 MIMO 系统中的 UAV 高度控制与 HBF 联合设计，通过基于加权最小均方误差（WMMSE）的交替优化（AO）达到接近全数字的性能；而带残差误差最小化的协作 AO [15] 与耦合预编码问题上的坐标下降 [16] 分别被用于单用户（SU）MIMO 与宽带 SU 大规模 MIMO UAV 链路。此外，Gao 等 [17] 针对 MU 大规模多输入单输出（MISO）系统提出数据驱动的 HBF 框架，利用端到端学习隐式获取 CSI，在保持高 SE 的同时降低导频与反馈开销。尽管性能较强，这些方法通常依赖精确或隐式学习的 CSI，并涉及计算密集的优化或训练过程；因此它们没有显式处理波束冲突消除，也不太适合信道快速时变、反馈受限且计算约束严格的 UAV 场景 [18]。

2) **UAV 移动性感知的毫米波波束管理。** 该方向的工作聚焦 UAV 通信中移动性感知的波束管理与信道动态。具体地，Wang 等 [9] 分析了毫米波 SU 大规模 MISO UAV 网络中模拟波束赋形与 HBF 之间的折中，指出 UAV 移动性对覆盖面积、EE 与 SE 的影响。在 UAV 辅助的 MU 毫米波 MISO 系统中，Zhao 等 [10] 提出将飞控信息与信道估计相结合的信道跟踪框架，以捕捉移动性引起的变化。文献 [12] 进一步研究了 MU 大规模 MISO 系统中 UAV 移动性下的波束跟踪，开发了自适应波束训练与角速度估计，以根据信道动态调整训练频率与波束宽度。此外，Hyun 等 [19] 为车联网（V2I）链路设计了移动性感知的波束策略，利用扩展卡尔曼滤波（EKF）跟踪，在高移动性场景下以更低反馈开销实现可靠波束对齐；一旦替换状态模型，同样的滤波原理即可迁移到空中平台。训练阶段本身的鲁棒性也得到了关注：考虑测量可靠性的软判决波束训练 [20]、宽带字典下带局部插值的自适应波束配对 [21]，以及预测主导抽头而非重新获取的、基于参数先验的波束域跟踪 [22]。这些工作有效处理了移动性引起的信道变化与波束对齐，但主要关注单链路可靠性与跟踪精度，没有显式考虑 MU 波束冲突或有限反馈下的自适应候选细化。

3) **基于码本的波束选择与有限反馈波束管理。** 该类工作将基于码本的波束训练与有限反馈波束管理视为全 CSI 获取的实用替代 [23]。SU MISO 系统中 UAV 波束赋形的现场测量量化了移动条件下反馈开销、信道互易性与更新率的影响 [24]，随后有工作提出混合反馈方案以在移动性引起的变化下提升吞吐 [25]。面向低空空地链路，还出现了全分集的高效量化 [26] 与抗同步和估计误差的卡尔曼滤波 [27]。在这些方法中，发射机依赖紧凑的波束指示、排序波束列表或基于码本的训练结果，而不是重建完整的瞬时信道，从而降低反馈开销并简化在线波束选择。

当基于码本的波束选择推广到 MU 场景时，由于用户设备（UE）争用有限的角域资源，波束选择变得更具挑战性。贪心与低复杂度波束选择方法因实现简单而具有吸引力。具体地，Singh 等 [28] 为 MU MISO 毫米波系统开发了联合 UE 与波束选择的贪心算法，在 MU 争用下改进加权和 SE；Murshed 等 [29] 为 MU 大规模 MIMO 毫米波系统提出干扰感知的贪心波束选择算法，在 SE 与计算复杂度之间取得有利折中。然而，此类贪心方法通常依赖瞬时选择规则，当 UE 竞争相近角方向、请求重叠波束或呈现模糊的波束偏好时缺乏鲁棒性。在这些情况下，纯贪心波束分配可能遭受波束分集不足与干扰管理退化。

### B. 新颖性与贡献

I-A 节的讨论揭示了一个现有文献尚未充分解决的基本空白。全 CSI HBF 方法在 UAV 移动性下产生大量信令与计算开销；移动性感知的波束跟踪方法能捕捉信道老化与波束失准，但不处理基于紧凑反馈的自适应 MU 波束选择；而基于码本与贪心的波束选择方法虽在有限反馈下工作，却依赖固定选择规则，不根据波束冲突、移动性引起的老化与反馈时延的联合效应来调整细化深度。值得注意的是，最优细化深度不仅取决于波束冲突的严重程度，还取决于 UAV 运动与波束管理时延所引起的预期"训练—传输"失配。忽略这种耦合会导致：在严重冲突下波束探索不足，或在强老化下处理时延过大。

为解决该局限，我们为毫米波 UAV 通信提出一种移动性与反馈感知的多级冲突触发混合波束赋形框架。核心思想是把传统的单级触发细化扩展为多级自适应策略。具体地，我们首先构造一个基础的单级设计，其中贪心扇区（greedy sector，GS）解作为默认的低复杂度模式；随后建立触发的全局 top-3 细化（TG3-TR）作为基线，并将其推广为多级细化策略，称为面向 GS 波束赋形的多级细化（multi-level refinement for GS beamforming，MLR-TG）。与"是否启用细化"的二元决策不同，该框架根据紧凑波束训练反馈所揭示的波束冲突结构以及移动性引起的老化预期严重度，动态选择细化深度。由此，发射机可以根据当前工作条件在 GS 波束赋形、扇区 top-2 细化、全局 top-2 细化与全局 top-3 细化之间切换。这使系统在严重老化下避免不必要的深层候选搜索，同时当波束冲突显著且预期失配仍适中时仍能利用更丰富的候选探索。

与现有文献相比，本文的新颖性总结于表 I，主要贡献如下：

1) **部分观测下的波束选择。** 我们将多级细化建模为"在 UAV 决策时刻实际掌握的信息（即量化的紧凑报告与自身移动状态）条件下的净和 SE 最大化"。仅依赖反馈的预测效用由报告的复波束系数组装预测有效信道，用老化相关系数对其进行折扣，并按各级自身的有效载荷比例计费。传输端的正则化迫零（RZF）预编码器在模拟子集提交之后，由导频估计的有效 CSI 计算一次，因此模拟选择阶段不需要瞬时传输时刻 CSI。
2) **带校准决策规则的多级策略。** 我们提出 MLR-TG 策略，它依据与系统规模无关的冲突得分与老化严重度度量，在 GS 波束赋形、扇区 top-2、全局 top-2 与全局 top-3 细化之间切换。该规则是受预测效用最大化启发而构造的、经校准的双统计量近似；其阈值在随机种子与评估集不相交的训练集上离线拟合，并证明了其单调性与精确退化性质。候选池由带硬上限的有界偏差枚举生成，使搜索在负载增长时仍可处理。
3) **因果的、计入开销的评估。** 我们在包含 UAV 高度、轨迹、姿态抖动、路径相关多普勒与热点 UE 部署的三维（3-D）空地模型上评估该框架，用同一条公共信道轨迹驱动所有方案，并在其实际发送的物理时刻进行评价。波束扫描、报告、决策时延与导频开销都计入所报告的频谱效率；每种方案的反馈以比特计；并用两个 oracle 界分别分离"级别选择"损失与"候选受限"损失。系统级仿真（SLS）报告净 SE、中断概率（OP）、尾部速率、公平性、级别统计、阈值敏感性与实测复杂度。

### C. 组织结构与符号约定

本文其余部分组织如下。第 II 节描述所考虑的系统模型、三维空地信道模型、因果帧时间线、紧凑波束训练反馈、GS 基线与多级候选细化。第 III 节建立部分观测选择问题、仅反馈的预测效用、冲突度量、老化严重度度量以及由此得到的自适应多级细化问题。第 IV 节介绍 TG3-TR 策略及其局限。第 V 节给出所提出的 MLR-TG 策略。第 VI 节通过大量仿真评估性能。最后，第 VII 节给出本文结论。

**数学符号。** $\mathcal{CN}(\mu,\sigma^2)$ 与 $\mathcal{U}(\cdot)$ 分别表示均值为 $\mu$、方差为 $\sigma^2$ 的复高斯分布与均匀分布；$\mathbb{E}\{\cdot\}$ 与 $\Pr(\cdot)$ 分别表示期望与概率；$\mathbb{C}^{M\times N}$ 表示 $M\times N$ 复值矩阵空间，$\mathbf{I}_N$ 表示 $N\times N$ 单位阵；对矩阵 $\mathbf{A}$，$[\mathbf{A}]_{m,n}$ 表示其 $(m,n)$ 元素；标量 $a$ 的模与集合 $\mathcal{A}$ 的势分别记为 $|a|$ 与 $|\mathcal{A}|$；向量 $\mathbf{a}$ 的 $\ell_2$ 范数与矩阵 $\mathbf{A}$ 的 Frobenius 范数分别记为 $\|\mathbf{a}\|_2$ 与 $\|\mathbf{A}\|_F$；$(\cdot)^T$ 与 $(\cdot)^H$ 分别表示转置与共轭转置；$\lceil\cdot\rceil$ 表示上取整算子；$\mathbb{1}(\cdot)$ 表示指示函数；对集合 $\mathcal{A}$ 与元素 $a\in\mathcal{A}$，$\mathcal{A}\setminus\{a\}$ 表示去掉 $a$ 后的集合。除特别说明外，大写粗体字母表示矩阵，小写粗体字母表示向量，小写字母表示标量，花体字母表示集合；全文假定 $k\in\mathcal{K}$。

**表 I：本文与相关工作的比较。**（✓ 表示该工作涉及对应要素；"—" 表示未涉及。来源：原文第 3 页。）

| 工作 | 系统 | UAV | HBF | 毫米波 | 有限反馈 | 移动性 | 波束冲突 | 技术 / 贡献 |
|---|---|---|---|---|---|---|---|---|
| [14]–[16] | SU/MU（大规模）MIMO | ✓ | ✓ | ✓ | — | — | — | 全 CSI 优化：联合高度控制与基于 WMMSE 的 AO、带残差误差最小化的 AO，以及耦合预编码问题上的坐标下降 |
| [9]、[10]、[17] | SU/MU 大规模 MISO | ✓ | ✓ | ✓ | ✓ | ✓ | — | 隐式 CSI 的数据驱动 HBF；UAV 移动性对覆盖、EE 与 SE 的刻画；融合飞控信息的信道跟踪 |
| [12]、[19] | SU 大规模 MISO、V2I | ✓ | — | ✓ | ✓ | ✓ | — | 带角速度估计的自适应波束训练；基于扩展卡尔曼滤波的跟踪与降低的反馈开销 |
| [20]–[22] | RIS 辅助 / 大规模 SU | — | — | ✓ | ✓ | ✓ | — | 软判决波束训练；带局部插值的自适应波束配对；主导抽头的参数先验辅助波束域跟踪 |
| [24]–[27] | SU MISO / MIMO / SISO | ✓ | — | — | ✓ | ✓ | — | 反馈开销与更新率的现场刻画；混合反馈方案；全分集高效量化；抗同步误差的卡尔曼滤波 |
| [28]、[29] | MU MISO / 大规模 MIMO | — | — | ✓ | ✓ | ✓ | — | 面向加权和 SE 的贪心联合 UE 与波束选择；兼顾 SE 与复杂度的干扰感知贪心波束选择 |
| 本文 | MU 大规模 MISO | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 提出 MLR-TG，在 GS、扇区 top-2、全局 top-2 与全局 top-3 细化之间动态切换，平衡 SE、中断鲁棒性、公平性与计算复杂度 |

## II. 系统模型

### A. 多用户 HBF 毫米波 UAV 下行

考虑如图 1 所示的 MU 毫米波 UAV 下行系统：一架 UAV 配备包含 $N_t$ 根天线的均匀线阵（ULA）与 $N_{\mathrm{RF}}$ 条 RF 链，服务 $K$ 个单天线地面 UE [9]、[14]。令 $\mathcal{K}=\{1,\ldots,K\}$ 表示 $K$ 个 UE 的集合。为平衡波束赋形能力与硬件成本，UAV 采用混合模拟—数字预编码架构：模拟级提供方向性波束赋形增益，数字级则在降维后的有效信道上抑制用户间干扰。

在波束管理帧 $n$ 上，采用数字基带预编码器 $\mathbf{F}_{\mathrm{BB}}[n]=[\mathbf{f}_1[n],\ldots,\mathbf{f}_k[n],\ldots,\mathbf{f}_K[n]]\in\mathbb{C}^{N_{\mathrm{RF}}\times K}$，其中 $\mathbf{f}_k[n]\in\mathbb{C}^{N_{\mathrm{RF}}\times 1}$ 表示 UE $k$ 的基带预编码向量。随后构造模拟 RF 预编码器 $\mathbf{F}_{\mathrm{RF}}[n]\in\mathbb{C}^{N_t\times N_{\mathrm{RF}}}$，其所有元素具有恒模，即 $|[\mathbf{F}_{\mathrm{RF}}[n]]_{p,q}|=1/\sqrt{N_t},\ \forall p,q$。相应地，UAV 的发送信号为

$$
\mathbf{x}[n]=\mathbf{F}_{\mathrm{RF}}[n]\mathbf{F}_{\mathrm{BB}}[n]\mathbf{s}[n]
=\sum_{k\in\mathcal{K}}\mathbf{F}_{\mathrm{RF}}[n]\mathbf{f}_k[n]s_k[n],\tag{1}
$$

其中 $\mathbf{s}[n]=[s_1[n],\ldots,s_k[n],\ldots,s_K[n]]\in\mathbb{C}^{K\times 1}$ 为所有 UE 发送符号组成的向量，满足 $\mathbb{E}\{|s_k[n]|^2\}=1,\forall k$。在 UAV 的实际发送功率约束下，$\mathbf{F}_{\mathrm{BB}}[n]$ 被归一化以满足 [30]–[32]

$$
\sum_{k\in\mathcal{K}}\|\mathbf{F}_{\mathrm{RF}}[n]\mathbf{f}_k[n]\|_2^2\le P_t.\tag{2}
$$

因此，UE $k$ 的接收信号可写为

$$
y_k[n]=\mathbf{h}_k^H[n]\mathbf{F}_{\mathrm{RF}}[n]\sum_{j\in\mathcal{K}}\mathbf{f}_j[n]s_j[n]+z_k[n],\tag{3}
$$

其中 $\mathbf{h}_k[n]\in\mathbb{C}^{N_t\times 1}$ 表示 UAV 与 UE $k$ 之间的信道系数向量，$z_k[n]\sim\mathcal{CN}(0,\sigma^2)$ 为 UE $k$ 处均值为零、方差为 $\sigma^2$ 的加性高斯白噪声。基于式（3），UE $k$ 的瞬时信干噪比（SINR）为

$$
\gamma_k[n]=\frac{\left|\mathbf{h}_k^H[n]\mathbf{F}_{\mathrm{RF}}[n]\mathbf{f}_k[n]\right|^2}
{\sum_{j\in\mathcal{K}\setminus\{k\}}\left|\mathbf{h}_k^H[n]\mathbf{F}_{\mathrm{RF}}[n]\mathbf{f}_j[n]\right|^2+\sigma^2}.\tag{4}
$$

相应地，可达和 SE 表示为

$$
R_{\mathrm{sum}}[n]=\sum_{k\in\mathcal{S}[n]}\log_2\left(1+\gamma_k[n]\right),\tag{5}
$$

其中 $\mathcal{S}[n]\subseteq\mathcal{K}$ 且 $|\mathcal{S}[n]|=\min(K,N_{\mathrm{RF}})$ 为帧 $n$ 中被调度的 UE 集合（定义见第 II-E 节）。当 $K\le N_{\mathrm{RF}}$ 时，每个 UE 都被服务且 $\mathcal{S}[n]=\mathcal{K}$。

### B. 三维空地信道与平台姿态动态

UAV—UE 链路被建模为具有有限条主导传播路径的稀疏毫米波信道。该模型适合 UAV 辅助毫米波系统：空中链路通常 LoS 主导且高度方向性，而平台移动性使波束对齐与信道跟踪对用户几何与运动特别敏感 [8]、[9]。我们不在每一帧独立地抽取路径角度，而是由三维几何为每个拓扑生成一条连续时间信道轨迹，使角度漂移、路径相关多普勒与路径损耗都源自平台运动 [33]、[34]。UAV 以高度 $H_U$ 飞行，速度矢量为常值 $\mathbf{v}=v[\cos\psi_v,\sin\psi_v,0]^T$，故其在连续时间 $t$ 的位置为 $\mathbf{p}_U(t)=\mathbf{p}_U(0)+\mathbf{v}t$。$K$ 个 UE 被撒布在半径为 $r_{\min}$ 与 $R_c$ 的地面环带内，其中比例 $\varrho_h$ 的 UE 位于 $N_h$ 个半径为 $r_h$ 的热点内——因为角域相近的 UE 正是波束冲突发生的场景。UE $k$ 的第 $l$ 条路径指向散射体位置 $\mathbf{q}_{k,l}$，其中 $\mathbf{q}_{k,1}$ 为 UE 本身，$\mathbf{q}_{k,l}\ (l\ge 2)$ 在其周围的地面杂波环内抽取。由于 ULA 只能分辨离开方向在其轴线上的投影，记 $\mathbf{u}_a(t)$ 为该轴的单位向量，则路径 $(k,l)$ 的方向余弦为

$$
\Omega_{k,l}(t)=\mathbf{u}_a^T(t)\frac{\mathbf{q}_{k,l}-\mathbf{p}_U(t)}{d_{k,l}(t)},
\qquad
d_{k,l}(t)=\left\|\mathbf{q}_{k,l}-\mathbf{p}_U(t)\right\|_2,\tag{6}
$$

相应的归一化阵列响应向量写为

$$
\mathbf{a}(\Omega)=\left[1,e^{j\pi\Omega},\ldots,e^{j\pi(N_t-1)\Omega}\right]^T/\sqrt{N_t},\tag{7}
$$

其中天线间距 $d=\lambda/2$，$\lambda$ 为载波波长。当离开方向位于包含阵列轴的平面内时，即恢复经典形式 $\Omega=\sin\theta$。旋翼 UAV 保持航迹时会持续修正姿态，由此产生的角速率远大于平移改变离开方向的速率。因此阵列轴带有偏航—俯仰抖动，即 $\mathbf{u}_a(t)=[\cos\psi(t)\cos\chi(t),\sin\psi(t)\cos\chi(t),\sin\chi(t)]^T$，其中

$$
\psi(t)=\psi_v+\frac{\Omega_y}{2\pi f_a}\left[\sin(2\pi f_a t+\phi_y)-\sin\phi_y\right],\tag{8}
$$

俯仰角 $\chi(t)$ 有类似表达式；$f_a$ 为姿态环频率，峰值速率 $\Omega_y=\omega_0+\omega_1v/v_{\mathrm{ref}}$ 随空速增大。于是 UE $k$ 在时刻 $t$ 的信道可写为

$$
\mathbf{h}_k(t)=\sqrt{G_k}\sum_{l=1}^{L}\sqrt{p_{k,l}}\,g_{k,l}(t)
e^{-j2\pi d_{k,l}(t)/\lambda+j\varphi_{k,l}}\,\mathbf{a}\left(\Omega_{k,l}(t)\right),\tag{9}
$$

其中 $L$ 为主导路径数；$G_k$ 为大规模增益，由自由空间路径损耗、文献 [34] 的 LoS 概率及其对应的非视距（NLoS）额外损耗以及对数正态阴影决定；$p_{k,1}=\kappa_R/(\kappa_R+1)$、$p_{k,l}=1/[(\kappa_R+1)(L-1)]\ (l\ge 2)$ 按 Rician 因子 $\kappa_R$ 分配功率；$\varphi_{k,l}$ 为随机初始相位。路径相关多普勒无需单独参数，因为它就是式（9）中传播相位的时间导数，即 $f^{\mathrm{D}}_{k,l}(t)=-\lambda^{-1}\mathbf{v}^T(\mathbf{q}_{k,l}-\mathbf{p}_U(t))/d_{k,l}(t)$。主导分量为镜面分量，即对 LoS UE 有 $g_{k,1}(t)=1$；每个散射分量服从 Clarke 正弦和过程 $g_{k,l}(t)=N_o^{-1/2}\sum_{i=1}^{N_o}e^{j(2\pi f^{\max}_D t\cos\alpha_i+\phi_i)}$，其中 $f^{\max}_D=v/\lambda$，$\alpha_i,\phi_i\sim\mathcal{U}(0,2\pi)$ 在每个拓扑中只抽取一次，从而所有方案复用同一实现。

波束训练与数据传输发生在两个不同的物理时刻，二者之间的间隔正是波束决策过时的根源。令 $t_{\mathrm{tr}}[n]$ 表示帧 $n$ 的波束扫描被测得的时刻，$t_{\mathrm{tx}}(\ell[n])$ 表示帧 $n$ 在细化级别 $\ell[n]\in\{0,1,2,3\}$ 下发送有效载荷的时刻；其中 $\ell[n]=0$ 对应 GS 基线，$\ell[n]=1$ 对应扇区 top-2 细化，$\ell[n]=2$ 对应全局 top-2 细化，$\ell[n]=3$ 对应全局 top-3 细化（详见第 II-E 节）。两个时刻均由第 II-C 节的帧时间线读出。于是 UE $k$ 的训练信道与传输信道分别为 $\mathbf{h}^{\mathrm{tr}}_k[n]=\mathbf{h}_k(t_{\mathrm{tr}}[n])$ 与 $\mathbf{h}_k[n]=\mathbf{h}_k(t_{\mathrm{tx}}(\ell[n]))$，二者之间的失配由下式决定：

$$
\tau_{\mathrm{tot}}(\ell[n])=t_{\mathrm{tx}}(\ell[n])-t_{\mathrm{tr}}[n]
=\tau_{\mathrm{sw}}+\tau_{\mathrm{fb}}+\tau_{\mathrm{proc}}(\ell[n])+\tau_{\mathrm{p}},\tag{10}
$$

其中 $\tau_{\mathrm{sw}}$ 汇总波束扫描的后半段与上行报告，$\tau_{\mathrm{fb}}$ 为反馈时延，$\tau_{\mathrm{proc}}(\ell[n])$ 为级别 $\ell[n]$ 的决策时延，$\tau_{\mathrm{p}}$ 为用于有效信道获取的导频持续时间。

为便于解析处理，用一阶 Gauss–Markov 抽象概括信道对 $(\mathbf{h}^{\mathrm{tr}}_k[n],\mathbf{h}_k[n])$：

$$
\mathbf{h}_k[n]=\rho(\ell,n)\,\mathbf{h}^{\mathrm{tr}}_k[n]
+\sqrt{1-\rho^2(\ell,n)}\,\mathbf{e}_k[n],\tag{11}
$$

其中 $\mathbf{e}_k[n]$ 为创新分量，与 $\mathbf{h}^{\mathrm{tr}}_k[n]$ 不相关且具有相同的二阶统计量；$\rho(\ell,n)\in[0,1]$ 为时间相关系数。采用标准指数老化模型，

$$
\rho(\ell,n)=\exp\left(-\beta f_D[n]\tau_{\mathrm{tot}}(\ell[n])\right),\tag{12}
$$

其中 $\beta>0$ 为相关常数，$f_D[n]=v[n]/\lambda$ 为与 UAV 速度 $v[n]$ 关联的多普勒频率 [11]、[12]。因此，更高的 UAV 速度或更长的时延会降低信道相关性，并增大"基于训练信息选出的波束在数据传输前过时"的风险。

**备注 1（老化抽象的适用范围）。** 式（12）只出现在需要闭式预测量的地方，即第 III-B 节的候选度量。所有报告结果均由基于几何的模型式（9）生成，因此由角度漂移与姿态抖动引起的波束失准是被显式复现的，而不是被吸收进一个标量。每个 UE 的公共相位旋转不改变可达 SINR，因此式（12）需要复现的量是所报告波束域签名的相位不变相关性，而非原始信道向量的相关性。第 VI 节把 $\beta$ 拟合到基于几何的模型，并报告拟合的残差误差。

### C. 因果帧时间线与净频谱效率

波束管理消耗空口时间，而更深的候选搜索消耗更多空口时间。若让每种方案承担相同的开销，就会掩盖本文所讨论的核心折中。因此，每个持续时间为 $T_f$ 的波束管理帧被划分为：由 $M$ 个符号组成的穷举下行波束扫描、$K$ 个符号的上行报告、反馈时延 $\tau_{\mathrm{fb}}$、决策时延 $\tau_{\mathrm{proc}}(\ell[n])$、用于获取有效信道的 $N_p$ 个解调导频符号，以及剩余有效载荷。设 $T_s$ 为符号时长，则帧 $n$ 的决策在

$$
t_{\mathrm{tx}}(\ell)=\left(M+K+N_p\right)T_s+\tau_{\mathrm{fb}}+\tau_{\mathrm{proc}}(\ell),\tag{13}
$$

处可用（自帧开始计时）。若某方案的决策在当前帧结束前仍未就绪，则被流水线化到下一帧边界，因此有效载荷比例为

$$
\eta(\ell)=\frac{N_w(\ell)T_f-t_{\mathrm{tx}}(\ell)}{N_w(\ell)T_f},
\qquad
N_w(\ell)=\left\lceil\frac{t_{\mathrm{tx}}(\ell)}{T_f}\right\rceil.\tag{14}
$$

因此，全文使用的性能指标为净（或有效）和 SE：

$$
\bar{R}_{\mathrm{sum}}\left(\mathcal{B}[n],\ell[n];n\right)
=\eta(\ell[n])\,R_{\mathrm{sum}}\left(\mathcal{B}[n],\ell[n];n\right),\tag{15}
$$

其中式（5）的 $R_{\mathrm{sum}}$ 在方案实际发送的物理时刻 $t_{\mathrm{tx}}(\ell[n])$ 的信道实现上求值。所有方案均由同一条信道轨迹与同一组随机抽样驱动，仅在实际发送时刻与所保留的有效载荷上不同。按表 II 的参数，四个级别分别在帧开始后 $t_{\mathrm{tx}}=2.35$、$2.48$、$2.54$、$2.84$ ms 发送，并保留有效载荷比例 $\eta(0:3)=(0.765,0.753,0.746,0.716)$。

### D. 基于码本的波束训练与紧凑反馈

有限波束训练反馈下模拟波束选择的质量，不仅影响波束赋形增益，也影响后续数字级的干扰抑制能力。UAV 采用预定义波束码本

$$
\mathcal{C}=\{\mathbf{c}_1,\ldots,\mathbf{c}_m,\ldots,\mathbf{c}_M\},\tag{16}
$$

其中每个码字 $\mathbf{c}_m\in\mathbb{C}^{N_t\times 1}$ 为基于 ULA 结构导出的恒模波束赋形向量，$M$ 为波束码本维度。值得注意的是，基于码本的波束训练在毫米波系统中被广泛用作全 CSI 获取的实用替代，特别是在有限反馈与移动性约束下 [4]、[5]。码本被划分为 $N_s$ 个互不相交的角扇区：

$$
\mathcal{C}=\bigcup_{q=1}^{N_s}\mathcal{C}_q,
\qquad
\mathcal{C}_q\cap\mathcal{C}_{q'}=\emptyset,\quad
\forall q'\ne q,\ q'\in\{1,\ldots,N_s\}.\tag{17}
$$

在波束训练期间，UE $k$ 在训练信道上测量各波束增益：

$$
g^{\mathrm{tr}}_{k,m}[n]=\left|\left(\mathbf{h}^{\mathrm{tr}}_k[n]\right)^H\mathbf{c}_m\right|^2,
\qquad \forall m\in\{1,\ldots,M\}.\tag{18}
$$

每个 UE 不反馈全 CSI，而是返回由波束训练指示组成的紧凑反馈包。这种紧凑报告更适合对移动性敏感的毫米波 UAV 系统——频繁的高维 CSI 更新会带来大量开销 [8]、[21]、[35]。该反馈包必须足够丰富，使每一细化级别都能仅凭它执行。因此 UE $k$ 按式（18）对码本排序，保留最强的 $L_r$ 个码字，并报告其索引与相应的量化复系数，即

$$
\mathbf{bI}_k[n]=\left\{\mathrm{bq}_k[n],\left(\mathrm{bb}_{k,i}[n],\mathrm{bc}_{k,i}[n]\right)_{i=1}^{L_r}\right\},\tag{19}
$$

其中 $\mathrm{bq}_k[n]$ 为主导扇区索引，$\mathrm{bb}_{k,1}[n],\ldots,\mathrm{bb}_{k,L_r}[n]$ 为按增益递减排序的报告码字索引，$\mathrm{bc}_{k,i}[n]$ 为 $(\mathbf{h}^{\mathrm{tr}}_k[n])^H\mathbf{c}_{\mathrm{bb}_{k,i}[n]}$ 的量化版本——其幅度在对数域用 $q_A$ 比特、相位用 $q_P$ 比特量化。第 III-C 节冲突度量所用的报告候选列表与量化波束间隙指示，也从同一反馈包中读出，即 $\mathbf{bT}_k[n]=\{\mathrm{bb}_{k,i}[n]\}_{i=1}^{L_r}$ 与 $\mathrm{b\Delta}_k[n]=20\log_{10}(|\mathrm{bc}_{k,1}[n]|/|\mathrm{bc}_{k,2}[n]|)$，因此不额外消耗比特。报告复系数而不是增益，是本框架自洽的关键：UAV 可以对由报告码字构成的任意候选子集打分，而无需获取任何进一步的已知信道信息（见第 III-B 节）。由此产生的上行有效载荷为每 UE 每帧 $B_{\mathrm{UE}}=L_r\lceil\log_2 M\rceil+\lceil\log_2 N_s\rceil+L_r(q_A+q_P)$ 比特。作为对比，全 CSI 报告需要每 UE $N_t(q_A+q_P)$ 比特，而采用每码字一个 $q_g=6$ 比特标量度量的全波束质量报告需要每 UE $Mq_g$ 比特。第 VI 节的表 IV 针对所考虑配置对上述各项进行评估。

**有效信道获取。** 报告系数被 $\tau_{\mathrm{tot}}(\ell[n])$ 老化且经过粗量化，这对候选子集排序尚可容忍，但不足以反演一个 $N_{\mathrm{RF}}\times N_{\mathrm{RF}}$ 的有效信道。因此数字预编码器只在模拟子集确定之后才构造。一旦施加 $\mathbf{F}_{\mathrm{RF}}[n]$，就通过它发送 $N_p$ 个专用导频符号，每个被调度 UE 估计并以每系数 $q_{\mathrm{eff}}$ 比特报告其 $N_{\mathrm{RF}}$ 维有效信道，使 UAV 获得

$$
\widehat{\mathbf{H}}_{\mathrm{eff}}[n]=\mathbf{H}_{\mathrm{eff}}[n]+\mathbf{E}[n],
\qquad
[\mathbf{E}[n]]_{k,i}\sim\mathcal{CN}(0,\sigma_e^2),\tag{20}
$$

其中 $\sigma_e^2=\sigma^2/(\rho_p N_p)$，$\rho_p$ 为导频功率提升因子。该阶段在第 VI 节比较的每种方案中相同，在式（13）中对所有方案计费，并且是所提框架中唯一引入瞬时信道知识的环节。

### E. GS 基线与多级候选细化

每帧只能支持 $N_{\mathrm{RF}}$ 条数据流，因此当 $K>N_{\mathrm{RF}}$ 时必须定义被调度集合。令 $\bar{R}_k[n]$ 表示 UE $k$ 获得的指数平均净速率，$\mathcal{S}[n]\subseteq\mathcal{K}$ 且 $|\mathcal{S}[n]|=\min(K,N_{\mathrm{RF}})$ 表示被调度集合。UE 按比例公平度量 $\log_2(1+|\mathrm{bc}_{k,1}[n]|^2)/\bar{R}_k[n]$ 的递减顺序被接纳；若某被接纳 UE 的最强码字已被占用，则顺延到其报告列表的下一项；$\bar{R}_k[n]$ 在每帧后用遗忘因子 $\epsilon_{\mathrm{pf}}$ 更新。因此公平性是在时间维度而非单帧内核算的，未被调度的 UE 在第 VI 节的均值中贡献零速率。下文的波束选择问题针对 $\mathcal{S}[n]$ 陈述，式（5）与式（4）中所有对 $K$ 的求和都限制在 $\mathcal{S}[n]$ 上。对未被调度的 UE $k\notin\mathcal{S}[n]$，令 $\mathbf{f}_k[n]=\mathbf{0}$。于是信号与功率表达式仍然成立，只是仅被调度的 UE 贡献非零发送流。

利用紧凑反馈，UAV 首先构造称为 $\ell[n]=0$ 的低复杂度 GS 基线：把每个被调度 UE 的最强报告波束视为其偏好波束，去除重复波束，并用报告候选中强而未用的波束补足缺失的 RF 链 [36, Alg. 1]。令

$$
\mathcal{B}_{\mathrm{GS}}[n]=\{b_1[n],\ldots,b_{N_{\mathrm{RF}}}[n]\}\tag{21}
$$

表示所得的 GS 波束子集，其中 $b_i[n]\in\{1,\ldots,M\}$ 为第 $i$ 条 RF 链所选码字的索引。相应地，模拟预编码器构造为

$$
\mathbf{F}^{\mathrm{GS}}_{\mathrm{RF}}[n]
=\left[\mathbf{c}_{b_1[n]},\ldots,\mathbf{c}_{b_{N_{\mathrm{RF}}}[n]}\right].\tag{22}
$$

给定模拟波束子集后，数字预编码器用 RZF 设计。对贪心基线，有效信道为

$$
\mathbf{H}^{\mathrm{GS}}_{\mathrm{eff}}[n]=\left(\mathbf{H}[n]\right)^H\mathbf{F}^{\mathrm{GS}}_{\mathrm{RF}}[n],\tag{23}
$$

其中 $\mathbf{H}[n]=[\mathbf{h}_1[n],\ldots,\mathbf{h}_{|\mathcal{S}[n]|}[n]]\in\mathbb{C}^{N_t\times|\mathcal{S}[n]|}$ 是被调度 UE 信道的拼接矩阵。随后，数字预编码器由式（20）中基于导频的估计 $\widehat{\mathbf{H}}^{\mathrm{GS}}_{\mathrm{eff}}[n]$ 构造：

$$
\mathbf{F}^{\mathrm{GS}}_{\mathrm{BB}}[n]
=\left(\widehat{\mathbf{H}}^{\mathrm{GS}}_{\mathrm{eff}}[n]\right)^H
\left(\widehat{\mathbf{H}}^{\mathrm{GS}}_{\mathrm{eff}}[n]\left(\widehat{\mathbf{H}}^{\mathrm{GS}}_{\mathrm{eff}}[n]\right)^H
+\mu\mathbf{I}_{|\mathcal{S}[n]|}\right)^{-1},\tag{24}
$$

其中 $\mu\triangleq|\mathcal{S}[n]|/\rho_{\mathrm{tx}}>0$ 为正则化参数，$\rho_{\mathrm{tx}}\triangleq P_t/\sigma^2$ 为发送信噪比（SNR）。最后，式（24）中的 $\mathbf{F}^{\mathrm{GS}}_{\mathrm{BB}}[n]$ 被归一化以满足式（2）。

GS 计算高效，但当反馈指示模糊、过时或受 MU 波束争用严重影响时可能变得次优。为在不总是调用完整候选搜索的前提下提升鲁棒性，允许 UAV 激活第 II-B 节定义、第 V-B 节构造的细化级别 $\ell[n]\in\{1,2,3\}$ 之一，它同时决定候选池维度与式（10）中的处理时延。

**备注 2（候选池的排序）。** 不同级别的候选池按搜索基数排序，而不是按集合包含关系排序。某扇区内次强的波束未必属于同一 UE 的全局 top-2 或 top-3 列表；而去重后的补束可能返回任何更大级别候选池都不包含的子集。此外，级别 1 与级别 2 在相同基数下探索码本的两个不同区域：一个限制在报告扇区内，一个横跨所有扇区。因此不作嵌套性质的主张；某一级别的收益既来自"在哪里搜索"，也来自"搜索多广"。

## III. 问题建模

值得注意的是，UAV 并非在每帧从完美瞬时 CSI 进行模拟波束选择，而是基于紧凑波束训练反馈 $\mathbf{bI}[n]=[\mathbf{bI}_1[n],\cdots,\mathbf{bI}_k[n],\cdots,\mathbf{bI}_K[n]]$ 做出波束管理决策 [23]。基于这种有限且时延的反馈，UAV 不仅必须决定是否激活候选细化，还必须决定细化深度与最终模拟波束子集。

### A. 联合细化级别与波束子集选择

给定紧凑反馈 $\mathbf{bI}[n]$，UAV 联合确定细化级别 $\ell[n]$ 与模拟波束子集 $\mathcal{B}[n]$，以最大化数据传输期间的可达和 SE。传输时刻的信道 $\mathbf{H}[n]$ 在决策时不可观测，因此目标是以 UAV 实际掌握的信息为条件的式（15）净和 SE，即紧凑报告与自身移动状态 $(v[n],\tau_{\mathrm{fb}})$（可由机载导航单元获得）。问题建模为

$$
\max_{\ell[n],\,\mathcal{B}[n]}\ \mathbb{E}\left\{\bar{R}_{\mathrm{sum}}(\mathcal{B}[n],\ell[n];n)\,\middle|\,\mathbf{bI}[n],v[n],\tau_{\mathrm{fb}}\right\}\tag{25a}
$$

$$
\text{s.t.}\quad \ell[n]\in\{0,1,2,3\},\tag{25b}
$$

$$
\mathcal{B}[n]\in\mathcal{P}_{\ell[n]}[n],\tag{25c}
$$

$$
|\mathcal{B}[n]|=N_{\mathrm{RF}},\tag{25d}
$$

$$
\tau_{\mathrm{tot}}(\ell[n])=\tau_{\mathrm{sw}}+\tau_{\mathrm{fb}}+\tau_{\mathrm{proc}}(\ell[n])+\tau_{\mathrm{p}},\tag{25e}
$$

$$
\sum_{k\in\mathcal{S}[n]}\left\|\mathbf{F}_{\mathrm{RF}}[n]\mathbf{f}_k[n]\right\|_2^2\le P_t,\tag{25f}
$$

其中 $\mathcal{P}_{\ell[n]}[n]$ 表示与细化级别 $\ell[n]$ 关联的候选池，$\bar{R}_{\mathrm{sum}}(\mathcal{B}[n],\ell[n];n)$ 在 $t_{\mathrm{tx}}(\ell[n])$ 的传输信道上、以式（14）的有效载荷比例 $\eta(\ell[n])$ 求值。

问题（25）凸显一个关键折中：提高细化级别会扩大候选池，可能改善模拟波束选择，但也会增加处理时延、缩短有效载荷，并加剧移动性引起的训练—传输失配。因此，最优细化级别并非先验固定，而同时取决于反馈所揭示的波束冲突结构与信道老化的严重程度。

### B. 仅反馈的预测效用

式（25a）中的条件期望没有闭式，因此用一个除式（19）之外不消耗任何信息的预测量替代。对候选子集 $\mathcal{B}=\{b_1,\ldots,b_{N_{\mathrm{RF}}}\}$，UAV 组装预测有效信道 $\widetilde{\mathbf{G}}(\mathcal{B},\ell)\in\mathbb{C}^{|\mathcal{S}|\times N_{\mathrm{RF}}}$，其元素取自报告并按预测相关系数折扣，即

$$
\left[\widetilde{\mathbf{G}}(\mathcal{B},\ell)\right]_{k,i}=
\begin{cases}
\rho(\ell,n)\,\mathrm{bc}_{k,j}[n], & b_i=\mathrm{bb}_{k,j}[n]\ \text{对某个}\ j,\\
0, & \text{其他},
\end{cases}\tag{26}
$$

其中 $\rho(\ell,n)$ 由式（12）与式（10）的 $\tau_{\mathrm{tot}}(\ell)$ 给出。UE $k$ 未报告的码字是未知而非不存在的，式（11）的创新项也未知。二者被汇总为每 UE 的残余功率

$$
\varepsilon_k^2(\mathcal{B},\ell)
=\left(1-\rho^2(\ell,n)\right)\left|\mathrm{bc}_{k,1}[n]\right|^2
+\zeta\left|\mathrm{bc}_{k,L_r}[n]\right|^2 m_k(\mathcal{B}),\tag{27}
$$

其中 $m_k(\mathcal{B})$ 统计 $\mathcal{B}$ 中 UE $k$ 未报告的码字数，$\zeta\in(0,1)$ 为泄漏常数。对 $\widetilde{\mathbf{G}}$ 施加 RZF 并将结果归一化到发送功率，得到预测流矩阵 $\widetilde{\mathbf{T}}=\widetilde{\mathbf{G}}\widetilde{\mathbf{F}}_{\mathrm{BB}}$，由此计算预测 SINR：

$$
\widetilde{\gamma}_k(\mathcal{B},\ell)
=\frac{\rho_{\mathrm{tx}}\left|[\widetilde{\mathbf{T}}]_{k,k}\right|^2}
{1+\rho_{\mathrm{tx}}\sum_{j\ne k}\left|[\widetilde{\mathbf{T}}]_{k,j}\right|^2
+\rho_{\mathrm{tx}}\varepsilon_k^2(\mathcal{B},\ell)},\tag{28}
$$

并对 $(\mathcal{B},\ell)$ 定义预测净效用

$$
\widetilde{U}(\mathcal{B},\ell)
=\eta(\ell)\sum_{k\in\mathcal{S}[n]}\log_2\left(1+\widetilde{\gamma}_k(\mathcal{B},\ell)\right).\tag{29}
$$

于是问题（25）被替换为其可预测的对应问题：

$$
\left(\ell^{\star}[n],\mathcal{B}^{\star}[n]\right)
=\arg\max_{\ell\in\{0,1,2,3\}}\ \max_{\mathcal{B}\in\mathcal{P}_{\ell}[n]}\widetilde{U}(\mathcal{B},\ell),\tag{30}
$$

该问题仅凭紧凑报告即可执行。对单个级别求解内层最大化是可以承受的，但若在每帧对所有四个级别求解，就会抵消自适应深度的意义——UAV 将每帧付出最深级别的代价。因此第 III-C—III-E 节构造报告的两个标量统计量，用于在任何候选池构建之前预测 $\ell^{\star}[n]$；第 VI 节量化该近似相对于"评估全部四个级别的 oracle"的代价。

### C. 来自波束训练反馈的冲突度量

给定模拟波束子集 $\mathcal{B}_{\mathrm{GS}}[n]$，该基线的可靠性取决于报告波束指示所揭示的波束争用与模糊程度。为量化这一影响，我们基于四个轻量分量定义冲突得分：扇区碰撞、波束碰撞、波束模糊与波束补全需求。

令 $n_q[n]$ 表示最强报告波束属于扇区 $q\in\{1,\ldots,N_s\}$ 的被调度 UE 数，$m_b[n]$ 表示其中以波束 $b\in\{1,\ldots,M\}$ 为最强波束的 UE 数，$\widetilde{\mathcal{B}}_{\mathrm{GS}}[n]$ 表示补束之前不同最强报告波束的集合。扇区碰撞计数、波束碰撞计数、模糊 UE 数与补全贪心集合所需波束数分别为

$$
C_{\mathrm{sec}}[n]=\sum_{q=1}^{N_s}n_q[n]\left(n_q[n]-1\right)/2,\tag{31}
$$

$$
C_{\mathrm{beam}}[n]=\sum_{b=1}^{M}m_b[n]\left(m_b[n]-1\right)/2,\tag{32}
$$

$$
C_{\mathrm{amb}}[n]=\sum_{k\in\mathcal{S}[n]}\mathbb{1}\left(\mathrm{b\Delta}_k[n]<\Delta_{\mathrm{th}}\right),\tag{33}
$$

$$
C_{\mathrm{fill}}[n]=\max\left(0,\ N_{\mathrm{RF}}-\left|\widetilde{\mathcal{B}}_{\mathrm{GS}}[n]\right|\right),\tag{34}
$$

其中 $\Delta_{\mathrm{th}}$ 为预设的模糊阈值，$\mathrm{b\Delta}_k[n]$ 为从式（19）读出的量化波束间隙指示。因此，波束模糊由最强与次强报告波束之间的间隙刻画，波束补全则由无 UE 认领的 RF 链数刻画。

四个计数处于不同量级，且随系统规模增长的方式不同：两个碰撞计数按 $|\mathcal{S}[n]|^2$ 缩放，模糊计数按 $|\mathcal{S}[n]|$ 缩放，补全计数按 $N_{\mathrm{RF}}$ 缩放。因此，原始计数的固定加权和对 $K$、$M$、$N_s$ 或 $N_{\mathrm{RF}}$ 并不不变，负载变化时同一阈值也无法复用。此外，波束碰撞按构造必然也是扇区碰撞，两个计数重叠，同一事件会被重复计费。于是每个分量按其自身最大值归一化，波束碰撞从扇区计数中扣除，权重归一化为和为一，即

$$
S_{\mathrm{conf}}[n]=\frac{\omega_1\bar{C}_{\mathrm{sec}}[n]+\omega_2\bar{C}_{\mathrm{beam}}[n]+\omega_3\bar{C}_{\mathrm{amb}}[n]+\omega_4\bar{C}_{\mathrm{fill}}[n]}{\omega_1+\omega_2+\omega_3+\omega_4},\tag{35}
$$

其中 $S=|\mathcal{S}[n]|$，

$$
\bar{C}_{\mathrm{sec}}[n]=\frac{C_{\mathrm{sec}}[n]-C_{\mathrm{beam}}[n]}{S(S-1)/2},\quad
\bar{C}_{\mathrm{beam}}[n]=\frac{C_{\mathrm{beam}}[n]}{S(S-1)/2},\quad
\bar{C}_{\mathrm{amb}}[n]=\frac{C_{\mathrm{amb}}[n]}{S},\quad
\bar{C}_{\mathrm{fill}}[n]=\frac{C_{\mathrm{fill}}[n]}{N_{\mathrm{RF}}},
$$

而 $\omega_1,\omega_2,\omega_3,\omega_4$ 为非负加权系数。当 $S<2$ 时，归一化的扇区与波束碰撞项定义为 0。因此该得分对任意系统规模都取值于 $[0,1]$，第 III-E 节校准的阈值可以跨 $K$ 迁移而无需重新调参（第 VI 节验证）。$S_{\mathrm{conf}}[n]$ 越大，说明 GS 波束子集越可能次优，提示更深的候选细化可能有益。

### D. 决策前老化严重度

除波束冲突外，候选细化的收益还取决于移动性引起的信道老化。更丰富的候选搜索能提升训练信道上的波束选择精度，但也带来额外处理时延，并在 UAV 移动性高或反馈时延大时效果下降。为刻画该折中，定义老化严重度度量

$$
A[n]=\alpha_v\,v[n]/v_{\mathrm{ref}}+\alpha_\tau\,\tau_{\mathrm{fb}}/\tau_{\mathrm{ref}},\tag{36}
$$

其中 $v_{\mathrm{ref}}$ 与 $\tau_{\mathrm{ref}}$ 分别为参考速度与参考时延（归一化常数），系数 $\alpha_v,\alpha_\tau\ge0$ 为加权因子。$A[n]$ 越大表示训练—传输失配越严重，从而抑制过激的细化。

式（36）的两个自变量对 UAV 都是无需信令即已知的：$v[n]$ 由机载导航单元读出，$\tau_{\mathrm{fb}}$ 是配置的系统参数——这正是 $A[n]$ 在决策时刻可用的原因。该度量是"在训练快照上选出、在 $t_{\mathrm{tx}}$ 使用的波束"所承受期望损失的线性代理，即

$$
\Delta G(v,\tau)=\mathbb{E}\left\{
10\log_{10}\frac{g^{\mathrm{tr}}_{k,\mathrm{bb}_{k,1}}\left(t_{\mathrm{tx}}\right)}
{\max_m g^{\mathrm{tr}}_{k,m}\left(t_{\mathrm{tx}}\right)}
\right\},\tag{37}
$$

即所报告波束在传输时刻相对最佳波束仍能提供的增益。驱动 $\Delta G$ 的机制有两种：漫散射分量的去相关（由 $f^{\max}_D\tau_{\mathrm{tot}}$ 从而由 $v$ 主导），以及姿态动态式（8）产生的角度漂移（其峰值速率也随 $v$ 增长）。两种机制都对 $v$ 与 $\tau_{\mathrm{fb}}$ 单调；第 VI 节验证，在基于几何的模型上测得的 $\Delta G$ 对 $A[n]$ 单调，故一个标量摘要足以对细化级别排序。保留线性形式是因为 $(\alpha_v,\alpha_\tau)$ 与阈值是联合校准的，从而把 $\Delta G$ 的形状吸收进阈值取值。

### E. 多级细化决策

为支持更灵活的细化机制，所提设计允许多个细化级别。细化级别由冲突严重度与老化严重度的联合效应决定：冲突得分越高越倾向更深细化，老化越严重越倾向更浅细化。令 $(\tau_1,\tau_2,\tau_3)$ 与 $(A_1,A_2)$ 分别表示递增的冲突阈值与老化阈值，满足 $\tau_1<\tau_2<\tau_3$、$A_1<A_2$。多级决策为

$$
\ell[n]=\Psi\left(S_{\mathrm{conf}}[n],A[n]\right),\tag{38}
$$

其中 $\Psi(\cdot)$ 表示如下规则映射：

$$
\ell[n]=
\begin{cases}
0, & S_{\mathrm{conf}}[n]<\tau_1,\\
1, & \tau_1\le S_{\mathrm{conf}}[n]<\tau_2,\ A[n]<A_2,\\
0, & \tau_1\le S_{\mathrm{conf}}[n]<\tau_2,\ A[n]\ge A_2,\\
2, & \tau_2\le S_{\mathrm{conf}}[n]<\tau_3,\ A[n]<A_1,\\
1, & \tau_2\le S_{\mathrm{conf}}[n]<\tau_3,\ A_1\le A[n]<A_2,\\
3, & S_{\mathrm{conf}}[n]\ge\tau_3,\ A[n]<A_1,\\
2, & S_{\mathrm{conf}}[n]\ge\tau_3,\ A_1\le A[n]<A_2,\\
1, & S_{\mathrm{conf}}[n]\ge\tau_3,\ A[n]\ge A_2.
\end{cases}\tag{39}
$$

该表述反映了所提框架的核心设计原则：只有当波束冲突足够严重且移动性引起的偏置仍适中时，才选择更深细化。

式（39）的映射是受式（30）可预测选择问题启发、经校准的双统计量近似。记 $\widetilde{U}^{\star}(\ell)=\max_{\mathcal{B}\in\mathcal{P}_{\ell}[n]}\widetilde{U}(\mathcal{B},\ell)$，则可预测级别选择器将计算 $\ell^{\star}[n]=\arg\max_{\ell}\widetilde{U}^{\star}(\ell)$。然而在每帧对全部四个级别执行该最大化，需要构造并评估每个候选池，从而消除自适应细化的计算收益。

在线映射改用两个统计量，它们在候选构造之前即可用，概括互补效应。冲突得分 $S_{\mathrm{conf}}[n]$ 度量紧凑报告中可观测的 MU 波束争用、模糊与补束需求程度：冲突得分越小，越缺乏"需要扩大候选搜索"的证据；得分越大，说明细化潜在收益越大。相反，老化度量 $A[n]$ 概括与移动性、反馈时延以及更深搜索后可用有效载荷减少相关的期望损失。这两种趋势引出式（39）的单调结构：所选细化深度对冲突严重度非减、对老化严重度非增。本文不主张该双统计量映射对每一帧都精确求解式（30）。

阈值通过设计阶段的离线校准获得：生成一组信道轨迹训练集（随机种子与评估集不相交，覆盖 $v\in[0,80]$ m/s 与 $\tau_{\mathrm{fb}}\in[0,5]$ ms），对每帧执行全部四个级别，并通过网格搜索保留使实现的等比公平网络效用 $\sum_{k\in\mathcal{S}[n]}\log\bar{R}_k[n]$ 最大的 $(\tau,A)$ 取值。式（30）为固定被调度集合定义逐帧波束选择效用，而阈值校准使用等比公平网络效用以计入长期调度目标。采用等比公平效用的原因是它与调度器一致，并奖励对服务较差 UE 的保护——细化对这些 UE 尤其有用。只有离线校准使用实现速率；在线运行时策略只观测紧凑报告与移动状态。第 VI 节报告拟合得到的阈值、其与逐帧最优级别的一致率，以及全部五个阈值与冲突权重的敏感性研究。

给定所选级别后，UAV 构建相应候选池并选出使预测效用最大的子集（详见第 V-C 节）。因此所提设计不依赖固定触发器；单级触发策略是式（38）在"只有一种细化级别可用"时的特例。

## IV. 单级冲突触发细化作为特例

在深入所提多级策略之前，先描述一种单级冲突触发细化策略，它启发了整体框架。其核心思想是：保留 GS 解作为默认低复杂度模式，仅当报告波束指示表明当前实现易发生冲突时，才激活更深的候选搜索。由此得到单级触发的全局 top-3 细化策略，称为 TG3-TR：UAV 由紧凑波束训练反馈计算冲突得分，当得分超过预设阈值 $\tau_{\mathrm{trig}}$ 时调用固定的全局 top-3 候选搜索。相应决策与波束子集分别为

$$
u_{\mathrm{TG3}}[n]=
\begin{cases}
0, & S_{\mathrm{conf}}[n]<\tau_{\mathrm{trig}},\\
1, & S_{\mathrm{conf}}[n]\ge\tau_{\mathrm{trig}},
\end{cases}\tag{40}
$$

$$
\mathcal{B}_{\mathrm{TG3}}[n]=
\begin{cases}
\mathcal{B}_{\mathrm{GS}}[n], & u_{\mathrm{TG3}}[n]=0,\\
\arg\max_{\mathcal{B}[n]\in\mathcal{P}_3[n]}\widetilde{U}(\mathcal{B}[n],3), & u_{\mathrm{TG3}}[n]=1,
\end{cases}\tag{41}
$$

其中候选排序使用与所提策略相同的仅反馈效用，因此 TG3-TR 与 MLR-TG 的差异仅在于细化深度如何选取。令 $\tau_{\mathrm{trig}}=\tau_2$ 并在式（39）中禁用级别 1 与 2，即可恢复式（40），因此 TG3-TR 是所提映射的二值限制，而不是另行设计的方法。

**备注 3（基线与动机）。** 值得注意的是，TG3-TR 在典型信道条件下保持低复杂度 GS 解，仅当冲突严重度超过触发阈值（即 $S_{\mathrm{conf}}[n]\ge\tau_{\mathrm{trig}}$）时才激活更丰富的候选搜索。尽管简单，TG3-TR 本质上受固定细化深度所限。冲突轻微时，全局 top-3 搜索可能不必要地昂贵；在高移动性或大反馈时延下，同样的深度又过于激进，因为它延长决策时延、通过式（14）缩短有效载荷并加剧训练—传输失配。此外，当老化适中而波束争用严重时，二元开/关细化策略无法利用报告波束候选的结构。这些局限促使我们提出更一般的框架，使 UAV 不仅决定是否激活细化，还决定合适的细化深度，从而在第 V 节形成所提 MLR-TG。

TG3-TR 在第 VI 节作为基准保留，并通过把算法 1 限制到 $\ell[n]\in\{0,3\}$ 来执行，故无需单独列出。

## V. 提出的移动性与反馈感知多级细化策略

本节给出所提 MLR-TG 策略。它分两阶段运行：UAV 先评估冲突与老化严重度以选择细化级别，随后要么保留 GS 解，要么执行与级别相关的候选搜索。这在典型或老化主导的场景中保持 GS 波束赋形的低复杂度，同时在波束冲突严重且预期失配仍适中时启用更强细化。

### A. GS 初始化与级别选择

在帧 $n$，UAV 按第 II-E 节由 $\mathbf{bI}[n]$ 构造 GS 波束子集 $\mathcal{B}_{\mathrm{GS}}[n]$，作为默认低复杂度解。随后，UAV 按式（35）计算冲突得分 $S_{\mathrm{conf}}[n]$、按式（36）计算老化严重度 $A[n]$，并通过式（39）的映射确定细化级别。有限争用（即 $S_{\mathrm{conf}}[n]<\tau_1$）或严重老化（即 $A[n]\ge A_2$）导致较浅级别，而最深级别仅在 $S_{\mathrm{conf}}[n]\ge\tau_3$ 且 $A[n]<A_1$ 时达到。因此，细化不是二元开/关决策，这正是 MLR-TG 区别于单级触发设计之处。

### B. 级别相关候选池构造

对不同细化级别 $\ell[n]$，UAV 构造相应候选池。$\ell[n]=0$ 的情形已在第 II-E 节描述，下面详述 $\ell[n]\in\{1,2,3\}$。

级别 $\ell[n]=1$ 执行扇区 top-2 细化：UE $k$ 的候选集限制在其报告的主导扇区内的两个最强波束；级别 $\ell[n]=2$ 与 $\ell[n]=3$ 分别探索跨所有扇区的两个与三个最强报告波束。三个候选集分别为

$$
\mathcal{U}^{(1)}_k[n]\subseteq\mathcal{C}_{\mathrm{bq}_k[n]},
\qquad
\left|\mathcal{U}^{(1)}_k[n]\right|\le2,\tag{42}
$$

$$
\mathcal{U}^{(2)}_k[n]=\left\{\text{两强波束}\in\mathbf{bT}_k[n]\right\},\tag{43}
$$

$$
\mathcal{U}^{(3)}_k[n]=\left\{\text{三强波束}\in\mathbf{bT}_k[n]\right\},\tag{44}
$$

因此级别 1 在最相关的角域内提供轻量细化，级别 2 在相同基数下实现跨扇区探索，级别 3 是所考虑的最丰富模式。

对给定细化级别 $\ell[n]\in\{1,2,3\}$，从每个 UE 专属集合 $\mathcal{U}^{(\ell[n])}_k[n]$ 中各选一个波束，形成一个原始波束组合，即

$$
\widetilde{\mathcal{B}}^{(i)}_{\ell[n]}[n]
=\left\{u^{(i)}_1[n],\ldots,u^{(i)}_K[n]\right\},
\qquad
u^{(i)}_k[n]\in\mathcal{U}^{(\ell[n])}_k[n],\tag{45}
$$

表示第 $i$ 个原始组合。每个组合内的重复波束被去除；若不同波束数小于 $N_{\mathrm{RF}}$，则用聚合训练增益最大且未被使用的波束补足其余 RF 链，即

$$
\bar{g}_m[n]=\sum_{k\in\mathcal{K}}g^{\mathrm{tr}}_{k,m}[n],
\qquad \forall m\in\{1,\ldots,M\}.\tag{46}
$$

去重与补束后得到基数为 $N_{\mathrm{RF}}$ 的有效波束子集，构成级别 $\ell[n]$ 的候选池：

$$
\mathcal{P}_{\ell[n]}[n]
=\left\{\widetilde{\mathcal{B}}^{(1)}_{\ell[n]}[n],\ldots,
\widetilde{\mathcal{B}}^{(N_{\mathrm{cand}}(\ell[n],n))}_{\ell[n]}[n]\right\}.\tag{47}
$$

这里 $N_{\mathrm{cand}}(\ell[n],n)$ 表示保留的候选数。去重之前，$\ell[n]\in\{1,2\}$ 时原始搜索规模至多 $2^{|\mathcal{S}[n]|}$，$\ell[n]=3$ 时至多 $3^{|\mathcal{S}[n]|}$。穷举乘积会在阵列饱和之前很久就变得不可处理，因此枚举是有界的而非完全的。按报告增益递减把 UE $k$ 的选项编号为 $i_k\in\{1,\ldots,|\mathcal{U}^{(\ell)}_k[n]|\}$，组合按相对各 UE 最强选项的总偏差 $\sum_k(i_k-1)$ 递增生成，并在硬上限 $N_{\max}$ 处停止枚举，即

$$
\mathcal{P}_{\ell[n]}\subseteq\left\{
\widetilde{\mathcal{B}}:\ \sum_{k\in\mathcal{S}[n]}(i_k-1)\le D_{\ell[n]}
\right\},
\qquad
\left|\mathcal{P}_{\ell[n]}\right|\le N_{\max},\tag{48}
$$

其中 $D_{\ell[n]}$ 是能容纳于上限内的最大偏差半径。于是，仅在少数位置偏离贪心分配的组合被优先探索，这符合问题结构——冲突通常只涉及少数争用 UE。当完整乘积可容纳时即被完整恢复，第 VI 节配置中的级别 1 与 2 属于此情形。因此，细化级别直接控制候选池维度，并通过式（10）控制处理时延。

**备注 4。** 不同细化级别对应的候选池，在"在哪里搜索"与"搜索多广"两方面都不同。具体地，扇区 top-2 细化在报告的主导扇区内做局部搜索，全局 top-2 细化把搜索扩展到跨扇区的两个最强波束，全局 top-3 细化进一步扩大候选空间。因此更高细化级别以更高处理复杂度与时延为代价提供更丰富的搜索空间。

**命题 1（单调性与精确退化）。** 令 $\Psi(S_{\mathrm{conf}},A)$ 表示式（39）的映射。则：(i) 对每个固定 $S_{\mathrm{conf}}$，$\Psi(S_{\mathrm{conf}},A)$ 关于 $A$ 非增；对每个固定 $A$，$\Psi(S_{\mathrm{conf}},A)$ 关于 $S_{\mathrm{conf}}$ 非减；(ii) MLR-TG 退化为 GS 基线，即 $\Psi(S_{\mathrm{conf}},A)=0$，当且仅当 $S_{\mathrm{conf}}<\tau_1$，或 $\tau_1\le S_{\mathrm{conf}}<\tau_2$ 且 $A\ge A_2$；(iii) MLR-TG 与始终开启的全局 top-3 细化一致，即 $\Psi(S_{\mathrm{conf}},A)=3$，当且仅当 $S_{\mathrm{conf}}\ge\tau_3$ 且 $A<A_1$。

**证明。** 固定 $S_{\mathrm{conf}}$ 并逐列读取式（39）。当 $S_{\mathrm{conf}}<\tau_1$ 时，对所有 $A$ 级别为 0；当 $\tau_1\le S_{\mathrm{conf}}<\tau_2$ 时，级别在 $A<A_2$ 与 $A\ge A_2$ 上分别取 1 与 0；当 $\tau_2\le S_{\mathrm{conf}}<\tau_3$ 时，在 $A<A_1$ 与 $A\ge A_1$ 上分别取 2 与 1；当 $S_{\mathrm{conf}}\ge\tau_3$ 时，在 $A<A_1$、$A_1\le A<A_2$、$A\ge A_2$ 上分别取 3、2、1。每一列都是 $A$ 的非增阶梯函数，这给出 (i) 的前半部分。固定 $A$ 并沿四个冲突区间逐行读取，得到序列：对 $A\ge A_2$ 为 $(0,1,1,1)$，对 $A_1\le A<A_2$ 为 $(0,1,1,2)$，对 $A<A_1$ 为 $(0,1,2,3)$；它们都关于 $S_{\mathrm{conf}}$ 非减，这给出 (i) 的后半部分。(ii) 与 (iii) 分别收集式（39）中取值为 0 与 3 的单元格，且按构造是穷尽的。证毕。

**备注 5（严重老化下的解释）。** 老化严重度大并不一般性地强制贪心模式。当 $S_{\mathrm{conf}}\ge\tau_3$ 且 $A\ge A_2$ 时，映射返回 $\ell=1$；当 $\tau_2\le S_{\mathrm{conf}}<\tau_3$ 且 $A_1\le A<A_2$ 时，也返回 $\ell=1$——因此严重冲突总能保留至少最廉价的细化级别。设计所强制执行的精确性质是命题 1(i) 的单调性，即所选深度从不随老化严重度增加，也从不随冲突严重度减小。

### C. 候选评估与最终波束选择

对每个候选波束子集 $\mathcal{B}[n]\in\mathcal{P}_{\ell[n]}[n]$，UAV 构造相应模拟预编码器：

$$
\mathbf{F}_{\mathrm{RF}}\left(\mathcal{B}[n];n\right)
=\left[\mathbf{c}_{b_1[n]},\mathbf{c}_{b_2[n]},\ldots,\mathbf{c}_{b_{N_{\mathrm{RF}}}[n]}\right],\tag{49}
$$

$$
\mathcal{B}[n]=\{b_1[n],\ldots,b_{N_{\mathrm{RF}}}[n]\}.\tag{50}
$$

随后对候选排序，只实现胜出者。若用 $R_{\mathrm{sum}}$ 对每个候选排序，需要传输时刻信道，或为每个候选单独测量有效信道，而在模拟级提交之前二者都不可得。因此排序使用仅反馈效用式（29），并组织为两阶段，使精确预测量只在关键处使用。第一阶段用闭式代理对所有 $|\mathcal{P}_{\ell[n]}[n]|$ 个候选打分：该闭式代理把式（28）中的 $\widetilde{\mathbf{T}}$ 替换为分配给各 UE 的码字的报告增益，用残余因子 $\kappa_{\mathrm{res}}\in(0,1)$ 对其余码字的增益加权（代表数字级无法消除的干扰），并对两个 UE 必须共享的码字计入其全部增益；每个候选的运算量为 $O(|\mathcal{S}[n]|L_r)$。第二阶段保留 $N_{\mathrm{top}}(\ell[n])$ 个最佳的不同子集，对每个子集按式（26）组装 $\widetilde{\mathbf{G}}$ 并精确评估式（29），于是

$$
\mathcal{B}^{\star}[n]=
\begin{cases}
\mathcal{B}_{\mathrm{GS}}[n], & \ell[n]=0,\\
\arg\max_{\mathcal{B}[n]\in\mathcal{P}^{\mathrm{top}}_{\ell[n]}[n]}
\widetilde{U}\left(\mathcal{B}[n],\ell[n]\right), & \ell[n]\in\{1,2,3\},
\end{cases}\tag{51}
$$

其中 $\mathcal{P}^{\mathrm{top}}_{\ell[n]}\subseteq\mathcal{P}_{\ell[n]}$ 收集被提升的子集，$N_{\mathrm{top}}(\ell)$ 随级别增长。一旦 $\mathcal{B}^{\star}[n]$ 确定，就执行一次式（20）的导频阶段，并按

$$
\mathbf{F}_{\mathrm{BB}}\left(\mathcal{B}^{\star}[n];n\right)
=\widehat{\mathbf{H}}^H_{\mathrm{eff}}\left(\mathcal{B}^{\star}[n];n\right)
\times\left(\widehat{\mathbf{H}}_{\mathrm{eff}}\left(\mathcal{B}^{\star}[n];n\right)
\widehat{\mathbf{H}}^H_{\mathrm{eff}}\left(\mathcal{B}^{\star}[n];n\right)
+\mu\mathbf{I}_{|\mathcal{S}[n]|}\right)^{-1}\tag{52}
$$

计算数字预编码器，随后归一化以满足式（2）的发送功率约束。无论选择哪个级别，每帧恰好执行一次导频阶段与一次基于导频估计有效 CSI 的传输 RZF 反演。用于仅反馈候选预测的任何额外正则化反演都限于被提升的子集，并在 $C_{\mathrm{ex}}$ 中显式计费。MLR-TG 最终得到的模拟与数字预编码器分别表示为

$$
\mathbf{F}^{\star}_{\mathrm{RF}}[n]=\mathbf{F}_{\mathrm{RF}}\left(\mathcal{B}^{\star}[n];n\right),\tag{53}
$$

$$
\mathbf{F}^{\star}_{\mathrm{BB}}[n]=\mathbf{F}_{\mathrm{BB}}\left(\mathcal{B}^{\star}[n];n\right).\tag{54}
$$

值得注意的是，式（54）中的 $\mathbf{F}^{\star}_{\mathrm{BB}}[n]$ 也被归一化以保证式（2）。该流程表明级别选择与候选评估紧密耦合：老化严重度高时，策略倾向较浅细化或退回 GS 基线；而冲突得分高且失配仍适中时，策略扩大候选空间并采用更深细化。

### D. 总体算法与复杂度分析

算法 1 总结所提 MLR-TG 流程。UAV 从紧凑波束训练反馈出发，计算冲突得分与老化严重度，选择细化级别，执行与级别相关的候选构造，随后进行仅反馈的预测效用评估。传输 RZF 预编码器只在最终模拟波束子集选定之后才形成。该自适应策略根据当前工作条件调整细化深度，而不是在帧间施加固定细化强度。

**算法 1：所提 MLR-TG——移动性与反馈感知多级细化**

- **输入：** 紧凑反馈 $\mathbf{bI}[n]$、UAV 速度 $v[n]$、反馈时延 $\tau_{\mathrm{fb}}$、码本 $\mathcal{C}$、扇区划分 $\{\mathcal{C}_q\}_{q=1}^{N_s}$，以及校准阈值 $\tau_1,\tau_2,\tau_3,A_1,A_2$。
- **输出：** 最终模拟预编码器 $\mathbf{F}^{\star}_{\mathrm{RF}}[n]$ 与数字预编码器 $\mathbf{F}^{\star}_{\mathrm{BB}}[n]$。
1. 按式（21）构造 GS 波束子集 $\mathcal{B}_{\mathrm{GS}}[n]$；
2. 按式（35）计算冲突得分 $S_{\mathrm{conf}}[n]$；
3. 按式（36）计算老化严重度度量 $A[n]$；
4. 用式（39）确定细化级别 $\ell[n]$；
5. **若** $\ell[n]=0$ **则**
6. 　令 $\mathcal{B}^{\star}[n]\leftarrow\mathcal{B}_{\mathrm{GS}}[n]$；
7. **否则**
8. 　用式（48）构建有界偏差候选池 $\mathcal{P}_{\ell[n]}[n]$；
9. 　用闭式代理为每个候选打分，并把 $N_{\mathrm{top}}(\ell[n])$ 个最佳不同子集提升到 $\mathcal{P}^{\mathrm{top}}_{\ell[n]}[n]$；
10. 　**对每个** 候选 $\mathcal{B}[n]\in\mathcal{P}^{\mathrm{top}}_{\ell[n]}[n]$ **执行**
11. 　　用式（26）组装预测有效信道 $\widetilde{\mathbf{G}}(\mathcal{B}[n],\ell[n])$，用式（27）计算残余功率；
12. 　　用式（29）评估预测净效用 $\widetilde{U}(\mathcal{B}[n],\ell[n])$；
13. 　**结束**
14. 　令 $\mathcal{B}^{\star}[n]\leftarrow\arg\max_{\mathcal{B}[n]\in\mathcal{P}^{\mathrm{top}}_{\ell[n]}[n]}\widetilde{U}(\mathcal{B}[n],\ell[n])$；
15. **结束**
16. 按式（53）返回最终模拟预编码器 $\mathbf{F}^{\star}_{\mathrm{RF}}[n]$；
17. 通过 $\mathbf{F}^{\star}_{\mathrm{RF}}[n]$ 发送 $N_p$ 个导频，并用式（20）获取 $\widehat{\mathbf{H}}_{\mathrm{eff}}[n]$；
18. 用式（54）计算数字预编码器 $\mathbf{F}^{\star}_{\mathrm{BB}}[n]$，将其归一化以满足式（2）并返回。

**备注 6。** 在 UAV 移动性下，更深的候选搜索未必改善端到端性能。更高级别虽可能提高基于报告训练信息的波束选择精度，但也带来更长处理时延，从而造成更大的训练—传输失配。所提 MLR-TG 策略通过在老化严重度显著时降低细化深度，显式利用这一折中。

下面由算法 1 推导 MLR-TG 的复杂度，写出矩阵维度，并把一次复乘累加计为八次实数浮点运算（FLOPs），记 $S=|\mathcal{S}[n]|$。每种细化模式都被计入相同的每帧公共开销，只有与级别相关的候选评估项随所选细化深度变化。公共项包括 UE 侧码本相关 $O(8KMN_t)$、贪心构造与补束 $O(2KS+N_{\mathrm{RF}}M)$、冲突与老化度量 $O(6K+2N_s)$、有效信道形成 $O(8SN_{\mathrm{RF}}N_p)$，以及选择之后单次传输 RZF 阶段 $O(16S^2N_{\mathrm{RF}}+\tfrac{8}{3}S^3)$，即

$$
C_{\mathrm{com}}=O\left(8KMN_t+N_{\mathrm{RF}}M+8SN_{\mathrm{RF}}N_p
+16S^2N_{\mathrm{RF}}+\frac{8}{3}S^3\right).\tag{55}
$$

级别 $\ell$ 的细化项包括：对 $\bar{N}_\ell$ 个候选做粗打分，每个候选需 $C_{\mathrm{cs}}=O\left(S(3L_r+4)+S\log_2 S+2N_{\mathrm{RF}}+\tfrac{1}{4}N_{\mathrm{RF}}M\right)$ FLOPs；以及对 $N_{\mathrm{top}}(\ell)$ 个被提升子集做精确评估，每个需 $C_{\mathrm{ex}}=O\left(SL_rN_{\mathrm{RF}}+24S^2N_{\mathrm{RF}}+\tfrac{20}{3}S^3\right)$ FLOPs，后者覆盖 $\widetilde{\mathbf{G}}$ 的组装、其 Gram 矩阵、正则化逆与预测流矩阵。由此得到 MLR-TG 的 FLOPs 数为四种模式的加权组合：

$$
\bar{C}_{\mathrm{MLR}}=C_{\mathrm{com}}
+\sum_{\ell=1}^{3}\varrho_\ell\left(\bar{N}_\ell C_{\mathrm{cs}}+N_{\mathrm{top}}(\ell)C_{\mathrm{ex}}\right),\tag{56}
$$

其中 $0\le\varrho_\ell\le1$ 表示长期内选择细化级别 $\ell$ 的帧比例，满足 $\sum_{\ell=0}^{3}\varrho_\ell=1$；$\bar{N}_1,\bar{N}_2,\bar{N}_3$ 为平均候选池基数（别处写作 $\bar{N}_{\mathrm{S2}},\bar{N}_{\mathrm{G2}},\bar{N}_{\mathrm{G3}}$）。$\varrho_\ell$ 与 $\bar{N}_\ell$ 均在第 VI 节实测；令 $\varrho_3=1$ 或 $\varrho_0=1$ 分别恢复始终开启的全局 top-3 细化（AG3）或纯 GS，因此三种基于码本的方案在同一套计费下比较。式（10）的决策时延由同一计数给出，即 $\tau_{\mathrm{proc}}(\ell)=\tau_{\mathrm{pipe}}+C_{\mathrm{ref}}(\ell)/\Theta$，其中 $\Theta$ 为机载处理器的持续吞吐量，$\tau_{\mathrm{pipe}}$ 见表 II；结论对 $\Theta$ 的敏感性通过时延缩放扫描检验。

因此，MLR-TG 并非总是付出最深级别的代价。它在每一级别都使用同一个紧凑反馈包（19），因为细化级别只影响候选评估的范围，不需要额外的高维 CSI 反馈。

## VI. 仿真结果与讨论

### A. 仿真参数与基准方案

本节给出系统级仿真（SLS），在第 II-C 节的因果时间线下评估所提框架。每次抽取独立拓扑，各包含一个 UAV 航向、一个 UE 部署、散射体位置、阴影抽样与 Clarke 相位，并对每个拓扑仿真 20 个连续波束管理帧，使信道连续演化且卡尔曼基准能维持状态。主工作点使用 250 个拓扑（即 5000 帧），参数扫描使用 100 个，设计研究使用 60 个。所有方案看到相同的拓扑、轨迹与导频噪声抽样，仅在实际发送时刻上不同。全部参数列于表 II，各方案可用的信息列于表 III，老化常数 $\beta$ 是拟合到基于几何的模型而非假设值。

可实现的基于码本方案——GS、KF-BT、TG3-TR、AG3 与 MLR-TG——使用式（20）中相同的选择后有效信道获取阶段，并由所得估计构造传输 RZF 预编码器。FD-RZF 与 OMP-RZF 保留表 III 中明确列出的全 CSI 假设，而 Oracle-L 与 Oracle-C 为非因果界。

为进行基准比较，将算法 1 实现的所提 MLR-TG 与八种方案对比：全数字正则化迫零（FD-RZF）、基于正交匹配追踪且数字预编码为 RZF 的 HBF（OMP-RZF）、纯 GS 波束赋形、卡尔曼滤波波束跟踪（KF-BT）、触发的全局 top-3 细化（TG3-TR）、始终开启的全局 top-3 细化（AG3）与两个 oracle。FD-RZF [37] 作为不受模拟波束赋形约束的全数字上界；OMP-RZF [38] 代表传统稀疏 HBF 方法，其模拟预编码器在同一个 $M$ 码字字典上经正交匹配追踪（OMP）获得，数字预编码器用 RZF。相应地，$M_{\mathrm{OMP}}=M$ 表示 OMP 字典大小，OMP 模拟阶段执行 $N_{\mathrm{RF}}$ 次原子选择迭代。纯 GS 遵循 [36, Alg. 1]，这是一种低复杂度基线，直接从最强报告 UE 波束中选择波束，必要时补束。KF-BT 是受波束跟踪文献 [12]、[19]、[22] 启发的移动性感知基准：每个 UE 对其主导路径的方向余弦运行两状态扩展卡尔曼滤波，由码字索引驱动，测量方差为 $(2/M)^2/12$，UAV 服务最接近 $t_{\mathrm{tx}}$ 时刻预测状态的码字，因此 KF-BT 预期了基于码本方案在相同报告开销下所要吸收的漂移。TG3-TR 仅对易冲突实现激活固定的全局 top-3 细化，使用 $\tau_{\mathrm{trig}}=\tau_2$ 的触发器（40）；表 III 复杂度表达式中 $\varrho_{\mathrm{TG3}}\in[0,1]$ 表示该触发器激活的长期帧比例，在主工作点等于 0.045。相反，AG3 在每一帧都施加全局 top-3 细化，即算法 1 中始终选择 $\ell=3$。两个 oracle 分别隔离两种损失来源，即级别选择与候选受限。Oracle-L 在每一级别自身的传输时刻信道上评估该级别的胜出者并保留最佳，从而给出"任何级别选择规则在相同物理时延下可达到"的上界。Oracle-C 在公共级别 0 时延下，在传输时刻信道上评估 32 个最有希望的级别 3 候选并保留最佳，从而给出"一旦去除时延、任何候选选择规则可达到"的上界。由于 Oracle-C 搜索的是候选池的子集，它本身又是无限制 oracle 的下界。

**表 II：仿真参数。**（来源：原文第 13 页。）

| 参数 | 取值 | 参数 | 取值 |
|---|---|---|---|
| 载频、带宽 | 28 GHz、100 MHz | UAV 高度 $H_U$ | 100 m |
| 天线数 $N_t$ | 128 | 小区半径 $R_c$、$r_{\min}$ | 200、20 m |
| RF 链数 $N_{\mathrm{RF}}$ | 8 | UAV 速度 $v$ | 40 m/s |
| UE 数 $K$ | 8 | Rician 因子 $\kappa_R$ | 10 dB |
| 路径数 $L$ | 3 | 路径损耗指数 LoS/NLoS | 2.0 / 3.0 |
| 码本 $M$、扇区数 $N_s$ | 128、8 | NLoS 额外损耗 | 20 dB |
| 报告规模 $L_r$ | 5 | 阴影 LoS/NLoS | 4 / 6 dB |
| $(q_A,q_P,q_{\mathrm{eff}})$ | (5, 5, 10) 比特 | 热点 $(\varrho_h,N_h,r_h)$ | (0.5, 2, 15 m) |
| 符号时长 $T_s$（120 kHz 子载波间隔） | 8.93 μs | 姿态 $(\omega_0,\omega_1;f_a)$ | (0.15, 1.5) rad/s；2 Hz |
| 帧长 $T_f$、时延 $\tau_{\mathrm{fb}}$ | 10、1 ms | Clarke 振荡器数、散射体环 | 8、15 m |
| 导频 $N_p$、功率提升 $\rho_p$ | 8、10 | 发送 SNR $\rho_{\mathrm{tx}}$ | 5 dB |
| 处理器 $\Theta$、$\tau_{\mathrm{pipe}}$ | 2 GFLOP/s、60 μs | SINR 阈值 $\gamma_{\mathrm{th}}$ | 1 dB |
| 候选池上限 $N_{\max}$、$N_{\mathrm{top}}(1:3)$ | 1024；(8, 16, 32) | 间隙阈值 $\Delta_{\mathrm{th}}$、$\epsilon_{\mathrm{pf}}$ | 3 dB；0.05 |
| 泄漏 $\zeta$ | 0.5 | 每拓扑帧数 | 20 |
| 冲突权重 $(\omega_1,\omega_2,\omega_3,\omega_4)$ | (1, 1.5, 0.75, 0.5) | 残余干扰 $\kappa_{\mathrm{res}}$ | 0.12 |
| 老化参考 $(v_{\mathrm{ref}},\tau_{\mathrm{ref}})$ | (50 m/s, 2 ms) | 老化权重 $(\alpha_v,\alpha_\tau)$ | (1, 1) |
| 校准 $(\tau_1,\tau_2,\tau_3)$ | (0.04, 0.16, 0.23) | 校准 $(A_1,A_2)$；拟合 $\beta$ | (0.90, 2.30)；$7.12\times10^{-3}$ |

**表 III：各方案的信息、反馈、时延与复杂度假设。** $C_{\mathrm{com}}$、$C_{\mathrm{cs}}$、$C_{\mathrm{ex}}$ 定义于式（55）与第 V 节，$S=|\mathcal{S}[n]|$。（来源：原文第 14 页。）

| 方案 | 模拟阶段所用知识 | 上行报告 | 计算复杂度（FLOPs） | 平均 FLOPs | $\tau_{\mathrm{proc}}$（μs） |
|---|---|---|---|---|---|
| FD-RZF | 自身传输时刻的完整瞬时 CSI（genie） | $N_t$ 个复系数 | $O(8N_tS^2+\tfrac{8}{3}S^3+8N_tS)$ | $7.5\times10^{4}$ | 98 |
| OMP-RZF | 训练时刻获取的完整 CSI，随后老化 | $N_t$ 个复系数 | $O(8N_{\mathrm{RF}}M_{\mathrm{OMP}}N_tS)+C_{\mathrm{com}}$ | $8.9\times10^{6}$ | 4523 |
| GS | 仅最强报告索引 | 1 个索引 | $C_{\mathrm{com}}$ | $1.5\times10^{4}$ | 68 |
| KF-BT | 最强报告索引 + 每 UE 扩展卡尔曼滤波（EKF）状态 | 1 个索引 | $C_{\mathrm{com}}+O(40K)$ | $1.5\times10^{4}$ | 68 |
| TG3-TR | 紧凑报告（19） | $L_r$ 个索引—系数对 | $C_{\mathrm{com}}+\varrho_{\mathrm{TG3}}(\bar{N}_{\mathrm{G3}}C_{\mathrm{cs}}+N_{\mathrm{top}}(3)C_{\mathrm{ex}})$ | $5.9\times10^{4}$ | 68/553 |
| AG3 | 紧凑报告（19） | $L_r$ 个索引—系数对 | $C_{\mathrm{com}}+\bar{N}_{\mathrm{G3}}C_{\mathrm{cs}}+N_{\mathrm{top}}(3)C_{\mathrm{ex}}$ | $9.9\times10^{5}$ | 553 |
| MLR-TG | 紧凑报告（19） | $L_r$ 个索引—系数对 | $C_{\mathrm{com}}+\sum_{\ell=1}^{3}\varrho_\ell(\bar{N}_\ell C_{\mathrm{cs}}+N_{\mathrm{top}}(\ell)C_{\mathrm{ex}})$，即式（56） | $2.3\times10^{5}$ | 68–553 |
| Oracle-L / Oracle-C | 每级别自身传输时刻的非因果 CSI，且处于公共级别 0 时延下 | genie | — | — | 每级别 / 68 |

### B. 性能评估

报告四项指标：按帧平均的式（15）净和 SE；用于分离空口开销与波束选择质量的原始和 SE $R_{\mathrm{sum}}$；每 UE 净速率的第 5 百分位；以及系统 OP，即至少一个被调度 UE 低于目标 SINR 的帧的经验比例：

$$
P_{\mathrm{out}}=\frac{1}{N_f}\sum_{n=1}^{N_f}\mathbb{1}\left(\min_{k\in\mathcal{S}[n]}\gamma_k[n]<\gamma_{\mathrm{th}}\right),\tag{57}
$$

其中 $N_f$ 为仿真帧数，使用前须把阈值换算到线性尺度，即 $\gamma_{\mathrm{th}}=10^{1/10}=1.259$，对应每 UE 的 SE 阈值 $\log_2(1+\gamma_{\mathrm{th}})=1.176$ bps/Hz。公平性由同一拓扑内累计的长期平均净速率 $\bar{R}_k$ 的 Jain 指数 $J=(\sum_{k\in\mathcal{K}}\bar{R}_k)^2/(K\sum_{k\in\mathcal{K}}\bar{R}_k^2)$ 度量，它计入未被调度 UE 的零速率，因而度量的是跨时间而非帧内的公平性。

在讨论各方案之前，先验证模型抽象。在基于几何的模型上、$v=40$ m/s 时测得：报告波束域签名的相位不变相关性在 1 ms 后从 1 衰落到 0.929，5 ms 后降到 0.893；而原始复信道向量的相关性在 1 ms 后已降至 0.376——这正是模拟级能容忍而数字级不能容忍的时延差异。用最小二乘把式（12）拟合到波束域相关性得到 $\beta=7.12\times10^{-3}$，归一化均方根误差为 0.027，全文采用该拟合值而非假设值。扫描 $v\in[0,80]$ m/s 与 $\tau_{\mathrm{fb}}\in[0,5]$ ms，式（37）所定义的报告波束在传输时刻的平均增益损失跨度为 0 至 −3.36 dB，其与 $A[n]$ 的秩相关为 0.875，因此单个标量已足够接近地对工作点排序，从而对级别排序。第 III-E 节的离线校准返回 $(\tau_1,\tau_2,\tau_3)=(0.04,0.16,0.23)$ 与 $(A_1,A_2)=(0.90,2.30)$；拟合规则在 42.7% 的校准帧中复现逐帧最优级别，而只损失 3.59% 的 oracle 效用——因为相邻级别常常接近，选次优的代价很小。

图 2(a) 与 2(b) 分别给出平均净和 SE 随发送 SNR 与热点半径的变化。如图 2(a) 所示，所有方案的净和 SE 都随 SNR 增长，FD-RZF 全程最高，因为它被赋予完整的瞬时 CSI 与 $N_t$ 条 RF 链。在基于码本的方案中，MLR-TG 与 GS 在 10 dB 以下彼此相差 1% 以内；当 $\rho\ge15$ dB 时 MLR-TG 成为最强，并在 20 dB 时超过 GS 3.3%——因为消除波束冲突是一种干扰效应，只有系统离开噪声受限区后才显现。特别地，AG3 在 5 dB 时比 GS 低 6.1%，尽管其原始和 SE 比 GS 高 0.3%，差额正是它每帧花费在全局 top-3 搜索上的空口时间。OMP-RZF 的净和 SE 在所有方案中最低，5 dB 时为 13.9 bps/Hz，表 III 给出两点原因：其字典搜索耗费 $8.9\times10^6$ FLOPs，即在假设处理器上占一帧的 45%；其贪心原子选择是把全数字预编码器作为一个整体去匹配，而不是为每个 UE 分配一个码字，因此服务较弱的 UE 没有专属波束。KF-BT 在 5 dB 时达到 GS 净和 SE 的 86%。

图 2(b) 表明，所有方案的净和 SE 都随热点半径从 1 m 增至 40 m 而增长；在此期间，方向余弦的热点内平均间隔从 0.17 个波束宽度增至 6.65 个，平均冲突得分从 0.112 降至 0.074，MLR-TG 选择的平均级别从 1.01 降至 0.84。可靠性增益则朝相反方向变化：MLR-TG 相对 GS 的中断概率（OP）在 $r_h=1$ m 时仅降低 4.1%，而在 $r_h=40$ m 时降低 21.8%——因为挤在单个波束宽度内的 UE 无法靠任何码字分配分离开来。

图 3(a) 与 3(b) 分别给出系统 OP 随 UAV 速度与反馈时延的变化。如图 3(a) 所示，在整个速度范围内，MLR-TG 在可实现有限反馈方案中取得最低 OP：在 $v=0$ 时相对 GS 降低 21.1%，在 $v=80$ m/s 时降低 29.9%。相比之下，GS 与 TG3-TR 的 OP 随速度几乎不变，这与上文报告波束域相关性衰减较慢相一致。KF-BT 的 OP 从 0.272 升至 0.566，其净和 SE 从 45.4 降至 34.5 bps/Hz。这一退化源于其匀速状态模型只能捕捉平滑平移运动，却捕捉不到式（8）中的偏航与俯仰修正——其速率随空速增长。因此，在所考虑的旋翼姿态动态下，仅靠角度预测变得不那么有效。图 3(b) 表明，MLR-TG 在 $\tau_{\mathrm{fb}}=3$ ms 之前保持最低 OP；在 $\tau_{\mathrm{fb}}=5$ ms 时，老化严重度足够大，MLR-TG 在 98.5% 的帧中选择贪心模式，其 OP 随之升至 0.259，净和 SE 21.23 bps/Hz 与 GS 几乎相同。同一工作点上，AG3 取得低 24.8% 的 OP，但以净和 SE 下降 13.7% 为代价。该结果体现了 MLR-TG 的预期行为：由于策略是用净速率的等比公平效用校准的，当额外可靠性收益不再补偿相应空口损失时，它会避免更深细化。

图 4(a) 与 4(b) 分别给出 UE 负载对系统 OP 与 Jain 指数的影响，其中 $N_{\mathrm{RF}}=8$ 固定，因此 $K=12$ 与 $K=16$ 会启用第 II-E 节的调度器。在 $K=8$ 校准的阈值在每个负载下原样复用，这是因为式（35）的冲突得分按分量归一化。如图 4(a) 所示，所有方案的 OP 都随 $K$ 增长，因为更多 UE 竞争相同的角域资源；MLR-TG 在 $K=8$、12、16 时相对 GS 分别降低 27.7%、18.8%、10.3%。边距收窄源于负载：$K=16$ 时调度器已丢弃一半 UE，剩余冲突正是任何码字分配都无法消除的。图 4(b) 表明，MLR-TG 在每个负载下都取得基于码本方案中最高的 Jain 指数，$K=8$ 时为 0.9735（GS 为 0.9629）；按被调度 UE 归一化的净速率 5.63 对 5.69 bps/Hz 也确认，公平性增益并非通过牺牲强 UE 获得。

图 5 报告使自适应行为可见的级别选择统计。级别分布对 UAV 速度几乎不变：在 $v\in[0,80]$ m/s 范围内贪心模式在 9.3% 至 14.2% 的帧中被选中，这与波束域相关性的缓慢衰减一致；而图 5(a) 显示反馈时延上的急剧转变：在 $\tau_{\mathrm{fb}}=3$ ms 之前，细化在约 88% 的帧中处于激活状态，到 $\tau_{\mathrm{fb}}=5$ ms 时骤降至 1.5%，此时老化严重度越过 $A_2$。图 5(b) 显示驱动该选择的机制：所选级别随冲突得分上升，两个最深级别只出现在争用最激烈的帧中。在主工作点上平均而言，策略在 11.4%、88.3%、0.3% 与不足 0.1% 的帧中分别选择 $\ell=0,1,2,3$；$\ell=3$ 的稀少本身就是结果而非疏漏——AG3 展示了每帧选择它的代价。

图 6(a) 在公共随机数下围绕校准值扫描五个阈值，使差异成对可比。把 $\tau_1$ 从 0.02 提高到 0.14（即在更少帧中细化）只使净和 SE 提高 1.1%，却使 OP 上升 41.1%、第 5 百分位速率下降 43.6%——这正是校准所解决的折中，也是拟合 $\tau_1$ 落在该范围"偏向可靠性一侧"的原因。扫描 $A_2$ 从老化一侧暴露出同样的开关行为：当 $A_2=1.1$ 时，工作点的老化严重度超过阈值，细化被完全禁用，第 5 百分位速率从 2.10 降至 1.19 bps/Hz；而任何 $A_2\ge1.4$ 都不改变策略。其余三个阈值 $\tau_2$、$\tau_3$、$A_1$ 在扫描范围内使所有指标变化不超过 0.1%，因为在该工作点上冲突得分超过 $\tau_2$ 的帧不足 5%，它们只在争用最激烈的帧中才起作用。把波束碰撞权重 $\omega_2$ 在 $[0.5,3]$ 内变化使净和 SE 变化 0.26%、OP 变化 1.6%。在 $(\tau_2,A_1)$ 平面上的二维扫描确认同一结论：净和 SE 变化 0.45%、OP 变化为其均值的 10.9%。因此，在该工作区间内，策略对五个阈值中的三个以及冲突权重不敏感；真正重要的两个（$\tau_1$ 与 $A_2$）起开/关作用，在求和速率与可靠性之间权衡，而不是使两者同时恶化。图 6(b) 扫描报告规模：净和 SE 在 $L_r=4$ 时饱和（相差 0.1% 以内），而 OP 持续改善，从 $L_r=2$ 时的 0.357 降到 $L_r=8$ 时的 0.244。我们采用 $L_r=5$，因为它以每帧 1344 比特捕获了 92% 可达的中断概率降幅，而该开销是 $L_r=8$ 所需 1752 比特的 77%。单独扫描系数分辨率时，净和 SE 在 $q_A=q_P=5$ 比特处饱和，超过后变化小于 0.05%；而降到 2 比特会损失 2.7%。

**表 IV：每波束管理帧的波束训练与反馈开销**（$K=8$、$N_{\mathrm{RF}}=8$、$M=128$、$N_t=128$、$L_r=5$）。（来源：原文第 15 页。）

| 项目 | GS、KF-BT | TG3-TR、AG3、MLR-TG | 全波束报告 | 全 CSI |
|---|---|---|---|---|
| 波束扫描符号数 | 128 | 128 | 128 | 128 |
| 用于 $\mathbf{H}_{\mathrm{eff}}$ 的导频符号数 | 8 | 8 | 8 | 8 |
| 每 UE 波束报告（比特） | 7 | 88 | 768 | 1280 |
| 波束报告，$K$ 个 UE（比特） | 56 | 704 | 6144 | 10240 |
| 有效 CSI 报告（比特） | 640 | 640 | 640 | 0 |
| 每帧合计（比特） | 696 | 1344 | 6784 | 10240 |
| 相对全 CSI 的降幅 | 93.2% | 86.9% | 33.8% | — |

表 IV 量化了"报告是紧凑的"这一主张。波束扫描与导频阶段对每种方案相同，而报告阶段不同。所提反馈包每 UE 88 比特、每帧 1344 比特，比全 CSI 报告低 86.9%，比每个码字 $q_g=6$ 比特的全波束质量报告低 80.2%，若只比较波束管理报告则比全 CSI 低 93.1%。相对于 GS 与 KF-BT 使用的仅最强索引报告，紧凑包每帧多出 648 比特。该报告开销是固定的，不依赖于某帧所选的细化级别。

**表 V：主工作点的平均性能**（$\rho=5$ dB、$v=40$ m/s、$\tau_{\mathrm{fb}}=1$ ms、$K=N_{\mathrm{RF}}=8$、5000 帧）。（来源：原文第 16 页。）

| 方案 | 净和 SE（bps/Hz） | 原始和 SE（bps/Hz） | 系统 OP | Jain 指数 | 第 5 百分位速率（bps/Hz） | 反馈（比特/帧） |
|---|---|---|---|---|---|---|
| FD-RZF | 51.373 | 67.449 | 0.0064 | 0.9965 | 5.182 | 10240 |
| OMP-RZF | 13.541 | 42.438 | 0.8824 | 0.8867 | 0.014 | 10240 |
| 纯 GS | 45.319 | 59.267 | 0.2814 | 0.9665 | 1.214 | 696 |
| KF-BT | 39.015 | 51.023 | 0.4034 | 0.9612 | 0.698 | 696 |
| TG3-TR | 45.259 | 59.331 | 0.2814 | 0.9667 | 1.207 | 1344 |
| AG3 | 42.554 | 59.426 | 0.2200 | 0.9731 | 1.632 | 1344 |
| 所提 MLR-TG | 44.886 | 59.528 | 0.2064 | 0.9742 | 1.868 | 1344 |
| Oracle-L | 46.465 | 61.293 | 0.2084 | 0.9768 | 2.341 | genie |
| Oracle-C | 46.872 | 61.299 | 0.1170 | 0.9858 | 3.879 | genie |

表 V 汇总主工作点。所提 MLR-TG 在可实现的基于码本方案中取得最高原始和 SE（59.53 bps/Hz）与第二高净和 SE（44.89 bps/Hz），后者比 GS 低 0.96%、比 AG3 高 5.48%。可靠性指标对方案的区分远比和速率清晰：MLR-TG 相对 GS 降低系统 OP 26.7%，相对 TG3-TR 降低 26.7%，相对 AG3 降低 6.2%，相对 KF-BT 降低 48.8%；相对同样四种方案，第 5 百分位 UE 速率分别提升 53.9%、54.8%、14.5% 与 167.6%。因此，MLR-TG 以贪心基线的空口开销获得始终开启深度细化的可靠性，这正是策略校准所针对的折中。对照两个界，MLR-TG 净和 SE 比 Oracle-L 低 3.4%，OP 与之相差 1% 以内——说明用两个标量预测级别而不是评估全部四个级别，代价很小；而与 Oracle-C 的剩余差距（净和 SE 4.2%、OP 为 1.8 倍）源于候选受限与决策时延，而非级别规则。此处 TG3-TR 与 GS 无法区分，因为其单一触发器只在 4.5% 的帧中触发——这正是促使多级设计的固定深度触发局限。

按表 II 参数，表 III 比较了所考虑方案的计算复杂度。每种模式共享的每帧开销在 UAV 侧为 $1.50\times10^{4}$ FLOPs，此外 $K$ 个 UE 联合用于码本相关的开销为 $1.05\times10^{6}$ FLOPs（属接收侧开销，对所有基于码本方案相同）。粗阶段每个候选耗费 448 FLOPs，精确预测 RZF 阶段每个被提升子集耗费 $1.60\times10^{4}$ FLOPs，因此细化项在级别 3 达到 $9.71\times10^{5}$ FLOPs，而级别 1 为 $2.43\times10^{5}$。按实测级别频率，MLR-TG 平均每帧 $2.31\times10^{5}$ FLOPs，比 AG3 的 $9.87\times10^{5}$ 低 76.6%，是纯 GS 的 $1.50\times10^{4}$ 的 15 倍；它平均每帧评估 226.8 个候选子集，而 AG3 为 1024 个。TG3-TR 在 4.5% 的帧中触发，平均 $5.9\times10^{4}$ FLOPs——这正是其性能在表 V 中与 GS 无法区分的算术原因。OMP-RZF 是开销最大的方案，为 $8.93\times10^{6}$ FLOPs，主要来自 $N_{\mathrm{RF}}$ 次"残差对整个字典"的相关运算。作为参考，在仿真主机上对同样的四个级别例程测得的实际运行时间为 18.5、789、1057、2687 μs，即比建模时延高 3 至 5 倍，这是脚本环境的解释开销。全文使用建模时延，因为它代表由所述处理器吞吐模型预测的实现级时延；脚本环境的实际运行时间仅作为可复现性参考报告。把建模时延按 $\kappa_{\mathrm{proc}}\in[0.25,8]$ 缩放，即把假定处理器从 8 扫到 0.25 GFLOP/s，会按预期方向改变排序：AG3 在该范围内损失 58.3% 的净和 SE，MLR-TG 损失 18.3%，GS 损失 7.0%。在 $\kappa_{\mathrm{proc}}=0.25$ 时 MLR-TG 是三者中最好的（45.89 对 GS 的 45.64 bps/Hz），因此"自适应深度"的价值随平台能力增强而增大，"不把深度固定在最大值"的价值随平台变弱而增大。

## VII. 结论

本文为 MU 毫米波 UAV 系统提出一种移动性与反馈感知、冲突触发的 HBF 框架。在 GS 基线与单级 TG3-TR 策略的基础上，所提 MLR-TG 策略依据报告波束指示的冲突严重度与预期老化严重度选择细化深度，使更深的候选细化仅在其增益足以补偿处理代价与时延时才被调用。让框架与发射机所能掌握的信息保持一致，改变了策略的价值所在。在每种方案都为其消耗的空口时间计费的因果时间线下，自适应细化深度的价值体现在业务分布的尾部而非和速率上：所提策略以与贪心基线相差 1% 以内的净和 SE，换取超过四分之一的中断概率降幅与约一半的第 5 百分位 UE 速率提升，同时候选子集评估次数比始终开启的全局 top-3 细化少 77.9%。在相同报告开销下用卡尔曼跟踪器预测波束方向，在所考虑设置中效果不如消除 MU 冲突——在该设置中平台姿态修正构成旋翼 UAV 角域动态的主要成分；最深细化级别在不足 0.1% 的帧中被选中，量化了穷举候选搜索偿还其时延的稀有程度。UE 规模与复杂度结果进一步确认了在异构工作条件下有利的性能—复杂度折中。未来研究可考虑把所提框架扩展到宽带与多载波毫米波 UAV 系统、在线或基于学习的阈值自适应、多天线 UE 以及轨迹感知的波束管理。

## 图注与表注

**图 1（原文第 4 页）：** 所考虑的 MU 毫米波 UAV 下行系统模型，包含基于码本的波束训练与紧凑波束反馈。图中示出 UAV 基站（ULA）、$K$ 个地面 UE、主导 LoS 与稀疏 NLoS 路径、码本波束训练、反馈时延 $\tau_{\mathrm{fb}}$、处理时延 $\tau_{\mathrm{proc}}(\ell[n])$ 以及传输时刻的训练信道/传输信道失配 $\tau_{\mathrm{tot}}(\ell[n])=t_{\mathrm{tx}}(\ell[n])-t_{\mathrm{tr}}[n]$。

**图 2（原文第 13 页）：** 平均净和 SE 随 (a) 发送 SNR 与 (b) 热点半径 $r_h$ 的变化。图例包含 FD-RZF、OMP-RZF、GS、KF-BT、TG3-TR、AG3、MLR-TG 与 Oracle-L；正文报道：10 dB 以下 MLR-TG 与 GS 相差 1% 以内，$\rho\ge15$ dB 后 MLR-TG 最强，20 dB 时超 GS 3.3%；5 dB 时 AG3 比 GS 低 6.1%，OMP-RZF 净和 SE 最低（13.9 bps/Hz）。

**图 3（原文第 14 页）：** 系统中断概率随 (a) UAV 速度与 (b) 反馈时延的变化。正文报道：MLR-TG 在可实现有限反馈方案中全程 OP 最低，$v=0$ 与 $v=80$ m/s 时相对 GS 分别降低 21.1% 与 29.9%；KF-BT 的 OP 从 0.272 升至 0.566；$\tau_{\mathrm{fb}}=5$ ms 时 MLR-TG 在 98.5% 帧退回贪心模式，OP 升至 0.259、净和 SE 21.23 bps/Hz。

**图 4（原文第 15 页）：** UE 数 $K$ 对 (a) 系统中断概率与 (b) Jain 公平性指数的影响，$N_{\mathrm{RF}}=8$，$K>N_{\mathrm{RF}}$ 时采用比例公平调度。正文报道：$K=8,12,16$ 时 MLR-TG 相对 GS 的 OP 降幅为 27.7%、18.8%、10.3%；$K=8$ 时 Jain 指数 0.9735 对 GS 的 0.9629，按被调度 UE 归一化的净速率为 5.63 对 5.69 bps/Hz。

**图 5（原文第 15 页）：** 各细化级别被选中的频率，随 (a) 反馈时延与 (b) 冲突得分 $S_{\mathrm{conf}}$ 的变化。正文报道：主工作点上 $\ell=0,1,2,3$ 的帧占比为 11.4%、88.3%、0.3% 与不足 0.1%；$\tau_{\mathrm{fb}}=3$ ms 前细化激活率约 88%，$\tau_{\mathrm{fb}}=5$ ms 时降至 1.5%。

**图 6（原文第 15 页）：** 所提策略在净和 SE 与系统 OP 上的设计研究，包含 (a) 五个阈值与 (b) 报告规模的影响。正文报道：$\tau_1$ 从 0.02 增至 0.14 时净和 SE 升 1.1%、OP 升 41.1%、第 5 百分位速率降 43.6%；$A_2=1.1$ 时细化被完全禁用，第 5 百分位速率从 2.10 降至 1.19 bps/Hz；$L_r=4$ 时净和 SE 饱和，OP 从 $L_r=2$ 的 0.357 降至 $L_r=8$ 的 0.244。

**表注汇总：** 表 I 为与相关工作的对比（原文第 3 页）；表 II 为仿真参数（第 13 页）；表 III 为各方案信息/反馈/时延/复杂度假设（第 14 页）；表 IV 为每帧波束训练与反馈开销（第 15 页）；表 V 为主工作点平均性能（第 16 页）。上述五表均已在正文中逐格转录，并已用 PDF 渲染图核对勾选符号与数值。

## 参考文献（英文原书目）

[1] M. Oubassghir and M. Boulouird, "A survey on mmWave and massive MIMO for 5G and beyond: Potential and challenges," in Proc. IEEE Congr. Inf. Sci. Technol., 2025, pp. 298–303.
[2] S. Gherekhloo, K. Ardah, and M. Haardt, "Fully digital and hybrid beamforming design for millimeter-wave MIMO-OFDM two-way relaying systems," in Proc. IEEE Statist. Signal Process. Workshop (SSP), 2021, pp. 296–300.
[3] W. Ahmad, H. Zhang, Y. Chen, and N. Iqbal, "Full digital transmit beamforming with low RF complexity for large-scale mmWave MIMO system," in Proc. IEEE Int. Conf. Commun. (ICC), 2020, pp. 1–6.
[4] O. E. Ayach, S. Rajagopal, S. Abu-Surra, Z. Pi, and R. W. Heath, "Spatially sparse precoding in millimeter wave MIMO systems," IEEE Trans. Wireless Commun., vol. 13, no. 3, pp. 1499–1513, Mar. 2014.
[5] F. Sohrabi and W. Yu, "Hybrid digital and analog beamforming design for large-scale antenna arrays," IEEE J. Sel. Topics Signal Process., vol. 10, no. 3, pp. 501–513, 2016.
[6] N. N. Dao, Q. V. Pham, N. H. Tu, T. T. Thanh, V. N. Q. Bao, D. S. Lakew, and S. Cho, "Survey on aerial radio access networks: Toward a comprehensive 6G access infrastructure," IEEE Commun. Surv. Tut., vol. 23, no. 2, pp. 1193–1225, Secondquarter 2021.
[7] W. Khawaja, I. Guvenc, D. W. Matolak, U.-C. Fiebig, and N. Schneckenburger, "A survey of air-to-ground propagation channel modeling for unmanned aerial vehicles," IEEE Commun. Surv. Tut., vol. 21, no. 3, pp. 2361–2391, 2019.
[8] W. Khawaja, O. Ozdemir, and I. Guvenc, "UAV air-to-ground channel characterization for mmWave systems," in Proc. IEEE Veh. Technol. Conf. (VTC), 2017, pp. 1–5.
[9] Y. Wang, M. Giordani, X. Wen, and M. Zorzi, "On the beamforming design of millimeter wave UAV networks: Power vs. capacity trade-offs," Comput. Netw., vol. 205, p. 108746, 2022.
[10] J. Zhao, F. Gao, L. Kuang, Q. Wu, and W. Jia, "Channel tracking with flight control system for UAV mmWave MIMO communications," IEEE Commun. Lett., vol. 22, no. 6, pp. 1224–1227, 2018.
[11] H. Chang, C.-X. Wang, R. Feng, C. Huang, L. Hou, and E.-H. M. Aggoune, "Beam domain channel modeling and prediction for UAV communications," IEEE Trans. Wireless Commun., vol. 24, no. 2, pp. 969–983, 2025.
[12] L. Yang and W. Zhang, "Beam tracking and optimization for UAV communications," IEEE Trans. Wireless Commun., vol. 18, no. 11, pp. 5367–5379, 2019.
[13] L. Zhang, W. Zhang, M. Jia, and L. Xu, "UAV-BS millimeter-wave 3-D hybrid beamforming with low power consumption," in Proc. IEEE Int. Conf. Commun. (ICC), 2023, pp. 4664–4670.
[14] Z. Chen, J. Tang, H. Tang, X. Zhang, D. K. Chun So, N. Zhao, and K.-K. Wong, "Hybrid beamforming optimization for UAV-enabled mmWave beamspace MIMO system," in Proc. IEEE Int. Conf. Commun. Technol. (ICCT), 2021, pp. 638–643.
[15] Y. Wang, R. Zhang, X. Liu, L. Gan, and Y. Feng, "Cooperative hybrid beamforming design in multi-UAV MmWave MIMO systems," IET Commun., vol. 17, no. 12, pp. 1384–1393, 2023.
[16] T. Mir, M. Waqas, S. Tu, C. Fang, W. Ni, R. MacKenzie, X. Xue, and Z. Han, "Relay hybrid precoding in UAV-assisted wideband millimeter-wave massive MIMO system," IEEE Trans. Wireless Commun., vol. 21, no. 9, pp. 7040–7054, 2022.
[17] Z. Gao, M. Wu, C. Hu, F. Gao, G. Wen, D. Zheng, and J. Zhang, "Data-driven deep learning based hybrid beamforming for aerial massive MIMO-OFDM systems with implicit CSI," IEEE J. Sel. Areas Commun., vol. 40, no. 10, pp. 2894–2913, 2022.
[18] D. J. Love, R. W. Heath, V. K. N. Lau, D. Gesbert, B. D. Rao, and M. Andrews, "An overview of limited feedback in wireless communication systems," IEEE J. Sel. Areas Commun., vol. 26, no. 8, pp. 1341–1365, 2008.
[19] S.-H. Hyun, J. Song, K. Kim, J.-H. Lee, and S.-C. Kim, "Adaptive beam design for V2I communications using vehicle tracking with extended Kalman filter," IEEE Trans. Veh. Technol., vol. 71, no. 1, pp. 489–502, 2022.
[20] Z. Albataineh, H. B. Salameh, M. A. Bataineh, and A. Ababneh, "Reliability-aware soft-decision beam training for RIS-assisted mmWave systems," IEEE Open J. Commun. Soc., vol. 7, pp. 3987–4006, 2026.
[21] Z. Albataineh, H. Bany Salameh, M. Al Bataineh, and A. M. Alshorman, "Adaptive beam pairing and local interpolation for robust analytical beam training in RIS-assisted wideband THz systems," IEEE Open J. Commun. Soc., pp. 1–1, 2025.
[22] Z. Albataineh, H. Bany Salameh, and M. Umar, "Parametric a priori-aided beamspace channel tracking for terahertz massive MIMO systems," IEEE Access, vol. 14, pp. 37 080–37 098, 2026.
[23] M. Giordani, M. Polese, A. Roy, D. Castor, and M. Zorzi, "A tutorial on beam management for 3GPP NR at mmWave frequencies," IEEE Commun. Surv. Tut., vol. 21, no. 1, pp. 173–196, 2019.
[24] Y. Shi, R. Enami, J. Wensowitch, and J. Camp, "UABeam: UAV-based beamforming system analysis with in-field air-to-ground channels," in Proc. IEEE Int. Conf. Sens. Commun. Netw. (SECON). IEEE, 2018, pp. 1–9.
[25] Y. Shi, M. Badi, D. Rajan, and J. Camp, "Channel reciprocity analysis and feedback mechanism design for mobile beamforming systems," IEEE Trans. Veh. Technol., vol. 70, no. 6, pp. 6029–6043, 2021.
[26] R. Rajashekar, M. Di Renzo, K. Hari, and L. Hanzo, "A beamforming-aided full-diversity scheme for low-altitude air-to-ground communication systems operating with limited feedback," IEEE Trans. Commun., vol. 66, no. 12, pp. 6602–6613, 2018.
[27] S. Hanna and D. Cabric, "Distributed transmit beamforming: Design and demonstration from the lab to UAVs," IEEE Trans. Wireless Commun., vol. 22, no. 2, pp. 778–792, 2022.
[28] S. K. Singh, S. Sahu, A. Thawait, P. Chaporkar, and G. S. Kasbekar, "NGUB: Novel greedy algorithms for user and beam selection in mmWave networks," in IEEE Proc. Int. Conf. Ubiquitous Future Netw. (ICUFN), 2023, pp. 421–426.
[29] R. U. Murshed, M. Saheed Ullah, and M. Saquib, "A fast effective greedy approach for MU-MIMO beam selection in mm-Wave and THz communications," in Proc. IEEE Annu. Conf. Inf. Sci. Syst. (CISS), 2024, pp. 1–6.
[30] N. H. Tu, M. Kim, and K. Lee, "Semi-static hybrid beamforming for O-RAN mmWave massive MIMO systems," IEEE Trans. Wireless Commun., vol. 24, no. 11, pp. 9791–9808, Nov. 2025.
[31] ——, "Hybrid beamforming and deep-learning-enabled precoding for O-RAN mmWave massive MIMO," IEEE Trans. Wireless Commun., vol. 25, pp. 4053–4069, 2026.
[32] N. H. Tu and K. Lee, "Multi-RIS-aided cell-free mmWave massive MIMO with short-packet uRLLC: Passive and hybrid active beamforming," IEEE Trans. Wireless Commun., vol. 25, pp. 14 908–14 924, 2026.
[33] 3GPP, "Study on enhanced LTE support for aerial vehicles," 3rd Generation Partnership Project (3GPP), Tech. Rep. TR 36.777, V15.0.0, 2018.
[34] A. Al-Hourani, S. Kandeepan, and S. Lardner, "Optimal LAP altitude for maximum coverage," IEEE Wireless Commun. Lett., vol. 3, no. 6, pp. 569–572, 2014.
[35] J. Zhao, H. Xie, F. Gao, W. Jia, S. Jin, and H. Lin, "Time varying channel tracking with spatial and temporal BEM for massive MIMO systems," IEEE Trans. Wireless Commun., vol. 17, no. 8, pp. 5653–5666, 2018.
[36] K. Wu, J. A. Zhang, X. Huang, Y. J. Guo, and L. Hanzo, "Simultaneous beam and user selection for the beamspace mm-Wave/THz massive MIMO downlink," IEEE Trans. Commun., vol. 71, no. 3, pp. 1785–1797, 2023.
[37] L. D. Nguyen, H. D. Tuan, T. Q. Duong, and H. V. Poor, "Multi-user regularized zero-forcing beamforming," IEEE Trans. Signal Process., vol. 67, no. 11, pp. 2839–2853, 2019.
[38] J. Noh, T. Kim, J.-Y. Seol, and C. Lee, "Zero-forcing based hybrid beamforming for multi-user millimeter wave systems," IET Commun., vol. 10, no. 18, pp. 2670–2677, 2016.

**本页范围与校对状态：** 本页覆盖 arXiv:2609.15458v1 全文 17 页：摘要、第 I—VII 节、结论、算法 1、图 1—6 图注、表 I—V（逐格转录，已用 PDF 渲染图核对勾选符号与数值）、参考文献 [1]—[38]（英文原条目，按原编号保留）。原文无附录，故未设附录；原文的图内曲线未作数字化读值，只保留正文给出的关键数值。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、表格数值的独立复算均未做），因此本页不标记为已验收全文；若需引用具体数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.15458) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
