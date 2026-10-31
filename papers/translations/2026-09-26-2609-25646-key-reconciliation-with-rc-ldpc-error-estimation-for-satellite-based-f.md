---
layout: page
title: "卫星通信的 RC-LDPC 密钥协商与错误估计｜中文全文译文"
permalink: /papers/translations/2026-09-26-2609-25646-key-reconciliation-with-rc-ldpc-error-estimation-for-satellite-based-f/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/a578962c1b06d133/) · [原文 arXiv](https://arxiv.org/abs/2609.25646) · [全部目录](/papers/catalog/)

# 卫星通信的 RC-LDPC 密钥协商与错误估计

**原题：** Key Reconciliation with RC-LDPC/Error Estimation for Satellite-based FSO/QKD Systems  
**作者：** Cuong T. Nguyen（IEEE 研究生会员）、Hoang D. Le（IEEE 会员）、Anshul Jaiswal（IEEE 高级会员）、Swaminathan R.（IEEE 高级会员）、Anh T. Pham（IEEE 高级会员）。单位：Cuong T. Nguyen、Hoang D. Le、Anh T. Pham 在会津大学计算机科学与工程系，日本福岛 965-8580（邮箱：cuong98hp@gmail.com；hoangle@u-aizu.ac.jp；pham@u-aizu.ac.jp）；Anshul Jaiswal 在印度理工学院鲁尔基分校电子与通信工程系，印度鲁尔基 247667（邮箱：anshul.jaiswal@ece.iitr.ac.in）；Swaminathan R. 在印度理工学院印多尔分校电气工程系，印度印多尔（邮箱：swamiramabadran@iiti.ac.in）。通讯作者：Hoang D. Le。  
**版权与 DOI：** 原文标注 © 2026 IEEE（个人使用许可，其余用途须获 IEEE 许可）；DOI: 10.1109/TVT.2026.3725740。原文注明本工作由电信先进基金会（TAF）与日本学术振兴会（JSPS）KAKENHI（Grant Number 24K14918）资助。**版权与再传播许可需另行核验。**  
**版本：** arXiv:2609.25646v1（cs.NI），v1 日期 2026 年 9 月 22 日；原文 16 页（IEEE 期刊论文格式，页眉为 "IEEE JOURNAL, VOL. XX, NO. Y, AUG. 2026"）。本页对应论文库 2026-09-26 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—VII 节、附录 A（RC-LDPC 码族设计示例）、附录 B（引理 1 证明）、附录 C（引理 2 证明）、图 1—12 图注、表 I—II、式（1）—（39）、参考文献 [1]—[47]（英文原条目）。两张表均逐格转录并与 PDF 渲染核对；逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与原文疑点）：** 原文缩写在本页首次出现时保留英文：QKD（quantum key distribution，量子密钥分发）、FSO（free-space optics，自由空间光通信）、LEO（low Earth orbit，低地球轨道）、IoV（Internet of Vehicles，车联网）、QBER（quantum bit-error rate，量子误码率）、SKT（secret-key throughput，密钥吞吐量）、RC-LDPC（rate-compatible low-density parity-check，速率兼容低密度奇偶校验）、CV-QKD（continuous-variable QKD，连续变量 QKD）、SIM/BPSK（subcarrier intensity modulation / binary phase-shift keying，副载波强度调制/二进制相移键控）、DT/DD（dual-threshold/direct detection，双阈值/直接检测）、CLWC（cloud liquid water content，云液态水含量）、URA（unauthorized receiver attack，未授权接收机攻击）、PDF/CDF/PMF、GG（Gamma-Gamma，伽马-伽马湍流模型）、EB（exponentiated Weibull，指数化威布尔分布）、GoF（goodness of fit，拟合优度）、FER（frame-error rate，误帧率）、PEG（progressive edge growth，渐进边增长）、TLE（two-line element，两行轨道根数）、UAV、AWGN。**原文疑点（按原文照录并加注）：** ①§V 中公开信道数据率记作 $R_b^{\mathrm{RF}}$（如式（17））与 $R_b^{\mathrm{Pub}}$（§VI-A）两种记号混用，按原文照录；②表 II 中 $\zeta=2.75$ 行的正态分布拟合参数为 $(\mu_N,\sigma_N)=(1.8442,0.0206)$，而其余各行 $\mu_N$ 约为 0.013—0.047 量级（例如 $\zeta=2.5$ 行为 0.0166），该行数值疑为原文笔误，按原文照录；③图 9 图例在 PDF 抽取文本中出现若干字符损坏（如 "B(ind KR"、"Pro,osed Design"），应为 "Blind KR" 与 "Proposed Design"，本页按语义译出并保留原意；④原文 §V-B 式（20）与式（21）中 $\chi=\max(\alpha,\chi_\epsilon)$ 与 $\chi_\epsilon=\min(\epsilon,N_r)$ 的记号依赖上下标，本页按原文照录。

## 摘要

卫星自由空间光（FSO）量子密钥分发（QKD）系统近期因其支撑全球安全应用的潜力而受到显著研究关注。然而，由天气条件与卫星移动造成的 FSO 信道固有不确定性，会在合法用户之间引起量子误码率（QBER）的剧烈波动。这使得设计高效的密钥协商——QKD 后处理中的关键步骤——尤为困难。本文提出一种将原图速率兼容（RC）低密度奇偶校验（LDPC）码与基于伴随式的错误估计方法相结合的密钥协商方案。所提错误估计方法在不要求额外信息泄露的前提下减少了通信轮数。此外，据我们所知，本文首次建立端到端密钥吞吐量（SKT）的解析评估框架，同时计入不完美错误估计与动态 FSO 信道条件的影响。数值结果表明，所提方案在不同 FSO 信道条件下始终优于传统盲协商，并为系统参数选择提供了实用准则。最后，我们通过一个纳入 Starlink 低地球轨道（LEO）卫星与移动地面车辆数据的案例研究验证了所提框架。

**关键词：** 量子密钥分发；密钥协商；LEO 卫星；FSO 信道；原图 LDPC 码；基于伴随式的错误估计。

## I. 引言

近年来，卫星量子密钥分发（QKD）吸引了日益增长的全球关注，SpeQtral-1 [1]、Q4S 任务 [2] 与 QEYSSat [3] 等任务即为佐证。QKD 利用量子原理实现信息论安全的密钥共享，使其对计算技术的进步具有韧性 [4]。当与卫星自由空间光（FSO）链路结合时，QKD 可支撑包括车联网（IoV）在内的全球、安全、无线应用。此类系统的可行性已通过若干里程碑实验得到验证，尤其是 Micius [5] 与 SOTA [6]。因此，卫星 FSO/QKD 被视为未来量子安全互联网的基石 [7]。

QKD 系统分两个阶段运行：量子传输与后处理。在量子阶段，两个合法用户（Alice 与 Bob）交换量子态以生成相关密钥材料。在后处理中，筛选步骤由于量子信道噪声与潜在窃听而生成相关但不完美的密钥，其质量由量子误码率（QBER）刻画。这些失配在密钥协商阶段通过认证的公开通信加以纠正 [8]。基于低密度奇偶校验（LDPC）码的伴随式协商被广泛采用，也是本文的重点。由于密钥协商是计算最密集的步骤，且往往是 QKD 系统的吞吐量瓶颈，高效的协商设计对卫星 FSO/QKD 部署至关重要。

本文提出一种用于卫星 FSO/QKD 系统的盲协商方案，并建立完整的端到端密钥吞吐量（SKT）框架。主要贡献如下：

- **第一**，我们提出面向卫星 FSO/QKD 系统的盲密钥协商联合设计：将原图速率兼容 LDPC（RC-LDPC）码与基于伴随式的错误估计方案相结合。虽然这些组件已被分别研究，但针对卫星特有挑战对它们进行联合优化构成本文的关键贡献。
- **第二**，据我们所知，我们首次建立覆盖传统盲协商与所提方案的端到端 SKT 分析的综合理论框架。该框架纳入主要 FSO 损伤（大气湍流、云覆盖与对准误差）以及基于伴随式错误估计带来的不完美性。Monte Carlo 仿真验证了解析结果。
- **第三**，我们通过曲线拟合推导弹块 QBER 的概率密度函数（PDF），并用拟合优度指标评估候选分布，从而刻画其统计行为；所得 PDF 用于系统级性能分析。
- **最后**，数值结果通过基于 Starlink LEO 卫星与地面车辆数据的案例研究给出实用洞见，展示所提设计的有效性。

本文其余部分组织如下：第 II 节回顾相关工作并讨论研究动机；第 III 节描述整体系统、FSO 信道模型与所考虑的 QKD 协议；第 IV 节给出所提设计细节；第 V 节给出所提设计在 SKT 方面的理论分析；第 VI 节给出数值结果与讨论；第 VII 节总结全文。

## II. 相关工作

表 I 从密钥协商设计与性能评估理论框架两个方面列出了本节讨论的相关工作。

首先，协商设计中的一个首要关注点是选择合适的码率，在纠正所有错误的同时最小化交换的伴随位数量。由于卫星 FSO/QKD 系统固有的高时延与高度波动的 QBER [22]，该问题尤为关键。为解决该问题，已有工作聚焦于为卫星 FSO/QKD 系统开发自适应速率协商方案 [9]–[11]。在该设计中，两个合法用户共享一组不同码率的 LDPC 码；基于准确估计的 QBER，选择一个合适的码率在一次通信轮内纠正错误。值得注意的是，Xiaoyu 等人 [9] 考虑了面向星载设备无关 QKD 系统的短码长 LDPC 码速率自适应协商；[10] 比较了卫星 QKD 系统的固定速率与自适应速率协商，正如预期，在较宽的 QBER 范围内速率自适应方法的译码后 QBER 优于固定速率方法；最近，[11] 研究了实时卫星 QKD 系统在各种约束下最大化译码率的协商策略。

文献 [9]–[11] 依赖准确 QBER 估计器的假设，而这对自适应速率协商方案的有效设计至关重要。实践中错误估计并不完美，估计的 QBER 可能被低估或高估；两种情况都会导致不必要的信息泄露，尤其在被低估而采用新码率时，有时还会导致筛选块被丢弃。为缓解不完美错误估计的影响，一种替代方案是盲协商 [12]。该方法与自适应速率方法的关键区别在于使用速率兼容（RC）-LDPC 码族：该结构可通过复用高速率码的信息来使用更低速率的码。因此，若发生低估，盲协商可逐步降低码率直至合适水平。[12] 中盲协商的初始设计采用打孔与缩短技术构造 RC-LDPC 码族：Alice 先通过向她筛选后的密钥添加随机比特来创建扩展密钥，这些比特在 Bob 的伴随式译码中被当作打孔与缩短比特；若译码失败，Alice 通过公开信道向 Bob 揭示更多打孔比特，从而降低码率，提高 Bob 成功译码的概率。

沿用 [12] 的设计，大量盲协商研究已针对基于光纤的 QKD 系统展开 [13]–[18]。[13] 提出对称盲协商设计以较传统方法提升系统效率；Zhihong 等人 [14] 在盲协商设计中考虑步长变化技术以缩短操作时间；[15] 提出基于 Polar 码的盲协商设计；Mao 等人提出通过复用伴随位来最小化信息泄露的方法 [16]；[17] 提出面向工业 QKD 系统、基于盲协商与先验错误估计的密钥协商设计；[18] 提出专门面向盲协商的原图 LDPC 码设计与构造方法——其中原图 LDPC 码指由含少量元素的小图构造的结构化 LDPC 码类，相比非结构化 LDPC 码，此类码在 QBER 剧烈波动时可提供高效硬件实现与灵活速率自适应 [21]。

除我们在 [21] 中的报告外，文献中尚无针对卫星 FSO/QKD 的原图 RC-LDPC 盲协商设计。[21] 的设计未考虑错误估计：协商过程总是从最高码率开始，逐步降低速率直至译码成功或用尽所有码成员；在某些情形下，该设计可能需要多个通信轮才能达到最优码率。当后处理直接在高时延星地公开信道上进行时，这一点在实时场景中尤为关键。为解决该问题，有必要把错误估计纳入设计。

一种常用方法是随机采样：双方通过公开信道揭示其筛选块的一小部分并比较以估计 QBER。由于这些比特为 Eve 所知，之后必须丢弃 [23]。因此该方法降低密钥生成率，在量子信道高损耗已使速率偏低的场合可能并不适用；此外它总需要一轮交换来揭示比特，在平均 QBER 较低时可能低效。另一类方案利用先前筛选块的 QBER 值估计当前块的 QBER [17]、[24]；然而对于卫星 QKD 链路——其衰落比光纤 QKD 链路更严重、逐筛选块 QBER 波动显著——这些方法可能不准确。最近，基于伴随式的错误估计方法被提出并应用于 QKD 系统 [19]、[20]。其核心思想是：每个筛选块的 QBER 可基于所交换的伴随位进行估计。如所示，该方法与盲协商结合使用时，可在 FSO QKD 链路上正常工作而不泄露额外信息。因此，该方法为在卫星 FSO/QKD 系统中设计基于原图 RC-LDPC 码的盲协商提供了潜在解决方案。

为全面评估方案有效性，必须评估端到端密钥吞吐量（SKT）。该指标反映 QKD 系统每秒处理的平均秘密比特数，同时考虑量子阶段与后处理阶段。此外，提供一个综合理论框架以洞悉卫星 FSO/QKD 系统端到端性能至关重要。由于涉及众多挑战，该任务艰巨且并非直接；加之错误估计并不总是准确，需要深入考察该因素对系统性能的影响。据我们所知，此类设计与理论框架在文献中此前并不存在，这促使我们开展本工作。

**表 I：相关工作贡献比较（✓ 表示已考虑）。**（来源：原文第 2 页。）

| 工作 | 考虑的卫星 QKD 系统 | 实践（如 Starlink 数据） | 盲协商 | 原图 LDPC 码 | 基于伴随式的错误估计 | 吞吐量分析 | 不完美错误估计 |
|---|---|---|---|---|---|---|---|
| [9]–[11] | ✓ | | | | | | |
| [12]–[17] | | | ✓ | | | | |
| [18] | | | ✓ | ✓ | | | |
| [19]、[20] | | | | | ✓ | | |
| [21] | ✓ | | ✓ | ✓ | | ✓ | |
| 本文 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## III. 系统描述

本节先描述支撑安全 IoV 应用的卫星 FSO/QKD 系统，然后给出 LEO 到车辆的 FSO 信道模型，最后回顾所考虑的非相干 CV-QKD 协议实现。

### A. 系统模型

图 1 给出面向安全 IoV 应用的 LEO 卫星 FSO/QKD 系统。特别地，我们在"太空互联网"背景下聚焦安全的 LEO 星地车辆通信场景：LEO 卫星（Alice）尝试向地面车辆（Bob）分发密钥。我们考虑未授权接收机攻击（URA），即地面窃听者（Eve）试图通过在波束足迹内接收来窃听下行量子信号；Eve 也可监听公开信道上交换的信息。

所考虑系统分为两个阶段：(i) 量子阶段与 (ii) 后处理阶段。此外，我们把时间划分为超帧，定义为双方获得并协商预先定义数量筛选块 $N_b$ 的时长。在每个超帧内，量子阶段与后处理阶段同时执行：超帧始于 Alice 开始通过量子信道共享密钥材料的时刻，持续到最后一个筛选块通过公开信道完成协商的那一刻。图 2 给出该系统的超帧示例，其中量子阶段与后处理阶段分别在量子 FSO 信道与公开信道上进行。

在量子阶段，Alice 生成密钥材料并通过 FSO 信道与 Bob 共享。这里采用基于 SIM/BPSK 与双阈值检测的非相干 CV-QKD 协议 [25]（详见 §III-C）。假设信道相干时间为 $t_{\mathrm{coh}}$，即衰落系数 $h(t)$ 每隔 $t_{\mathrm{coh}}$ 秒变化一次。Bob 在收集 $n_{\mathrm{sift}}$ 个筛选比特后形成一个筛选块 $F_i$（$1\le i\le N_b$）并放入先进先出队列；一旦 Bob 收集到 $N_b$ 个筛选块，便停止接收密钥材料直至下一个超帧。

在后处理阶段，Alice 与 Bob 通过筛选、密钥协商与隐私放大等步骤把共享的密钥材料转换为安全密钥。这些步骤通过认证的公开信道进行。前两步在队列中的每个筛选块上顺序且独立执行。关于筛选步骤，对每个筛选块，Bob 向 Alice 发送他可检测到信号的时间戳信息。我们假设每个时间戳为 64 比特的实数值 [26]。因此筛选步骤需经公开信道传输的信息量为 $n_{\mathrm{sp}}=64n_{\mathrm{sift}}$。收到该信息后，Alice 相应形成她的筛选块。

**图 1：** 面向安全 IoV 应用的 LEO 卫星 FSO/QKD 系统与 QKD 协议框图。（来源：原文第 2、3 页。）

**图 2：** 所考虑系统的一个超帧示例：量子阶段在量子信道上进行、后处理阶段在公开信道上进行。（来源：原文第 4 页。）

关于密钥协商步骤，我们考虑使用原图 LDPC 码与错误估计的盲协商，详见第 IV 节。若协商失败，双方丢弃其筛选块；否则把已协商块存入缓冲区。至于隐私放大步骤，其目的是移除整个过程中可能泄露给 Eve 的信息。常用方法是利用从通用哈希族中选出的共享哈希函数，把已协商密钥压缩为更短但更安全的密钥 [27]。特别地，在收集足够多的已协商块 $N_{\mathrm{sb}}$ 后，双方把它们拼接为长度 $n_{\mathrm{PA}}=n_{\mathrm{sift}}N_{\mathrm{sb}}$ 比特的长块，然后独立地对所构造块执行通用哈希以获得安全密钥 [28]。本文采用的假设为：(i) 公开信道被假定为已认证且无差错¹；(ii) 协商失败且该失败未被双方检测到的概率可忽略²。

> **脚注 1（原文）：** 公开信道的认证可通过附加校验哈希摘要 [24] 保证，而可靠性由稳健纠错码 [29] 保证。
>
> **脚注 2（原文）：** 该概率可通过交换已协商块的哈希摘要 [30] 降至任意水平。

### B. FSO 信道模型

对于 LEO 到车辆的 FSO 信道模型，我们考虑三类主要损伤³，即云衰减 $h_c$、大气湍流 $h_t$ 与对准误差引起的波动 $h_{p,X}$，其中 $X\in\{B,E\}$ 用于区分布勃与 Eve 的系数。则复合信道系数为 $h_X=h_ch_th_{p,X}$。各损伤细节如下。

> **脚注 3（原文）：** 注意现有光接收机设计可有效补偿 LEO 卫星与移动地面车辆之间的多普勒效应 [31]。

**1）云衰减：** 由于云中液态水粒子的存在，光信号可能经历散射，导致光功率下降。根据 [32]，云衰减系数为

$$
h_c=\exp\left[-\sigma H_c\sec(\xi)\right],\tag{1}
$$

其中 $H_c$ 为云层垂直厚度，$\xi$ 为天顶角。此外，$\sigma$ 为以光波长 $\lambda$ 与能见度 $V$ 表示的函数形式的衰减系数 [29, (12)]；并且 $V=1.002/(M_cN_c)^{0.6473}$，其中 $M_c$（g/m³）为云液态水含量（CLWC），$N_c$（cm⁻³）为云滴数浓度 [29]。

**2）大气湍流：** 该现象引起闪烁效应，导致接收机探测器处接收功率波动。为建模较宽的湍流强度范围，我们采用 Gamma-Gamma（GG）模型，其概率密度函数（PDF）为 [33]

$$
f_{GG}(h_t)=\frac{2(\alpha\beta)^{\frac{\alpha+\beta}{2}}}{\Gamma(\alpha)\Gamma(\beta)}h_t^{\frac{\alpha+\beta}{2}-1}K_{\alpha-\beta}\left(2\sqrt{\alpha\beta h_t}\right),\tag{2}
$$

其中 $\Gamma(\cdot)$ 为 Gamma 函数，$K_{\alpha-\beta}(\cdot)$ 为 $\alpha-\beta$ 阶第二类修正 Bessel 函数。此外，尺度参数 $\alpha$ 与 $\beta$ 分别表示大气中散射过程大尺度与小尺度单元的有效数目，可根据 Rytov 方差 $\sigma_R^2$ 计算 [29, (15)]。

**3）广义对准误差模型：** 由于光束的几何扩展，探测器只能收集接收功率的一部分，其近似为 [34]

$$
h_{p,X}\approx A_0\exp\left(-\frac{2\rho_X^2}{w_{L_{\mathrm{eq}}}^2}\right),\tag{3}
$$

其中 $\rho_X$ 为波束足迹中心与 Bob/Eve 探测器中心之间的径向位移向量，$A_0=[\mathrm{erf}(v)]^2$ 为 $\rho=0$ 时收集功率的比例，$v=(\sqrt{\pi}r_a)/(\sqrt{2}w_{L,\mathrm{eff}})$，$r_a$ 为接收孔径半径，$\mathrm{erf}(\cdot)$ 为误差函数，$w_{L_{\mathrm{eq}}}=\sqrt{w^2_{L,\mathrm{eff}}}\frac{\sqrt{\pi}\mathrm{erf}(v)}{2v\exp(-v^2)}$ 为等效波束宽度。此外，$w_{L,\mathrm{eff}}\approx w_0\sqrt{(1-\frac{L}{F_0})^2+(\frac{2L}{k_{\mathrm{wave}}w_0^2})^2}$ 为有效波束宽度，其中 $L=(H_s-H_v)\sec(\xi)$ 为斜距，$H_s$ 为卫星高度，$H_v$ 为车辆高度，$F_0$ 为曲率相位前半径，$k_{\mathrm{wave}}=2\pi/\lambda$ 为波数，$w_0=\frac{\lambda}{\pi\theta}$ 为波束腰半径，$\theta$ 为发散半角 [33]。

至于 LEO 到 Bob 的信道，卫星光波束中心与 Bob 探测器中心之间对准误差的主要来源为 (1) 卫星振动；(2) Bob 速度的持续变化在短时间内无法被卫星跟踪。这里考虑最一般的情形，即 $x$、$y$ 轴位移是两个独立高斯随机变量，具有不同均值 $(\mu_x,\mu_y)$ 与方差 $(\sigma_x^2,\sigma_y^2)$。换言之，$\rho_B=(\rho_{B,x},\rho_{B,y})$，其中 $\rho_{B,x}\sim\mathcal N(\mu_x,\sigma_x^2)$、$\rho_{B,y}\sim\mathcal N(\mu_y,\sigma_y^2)$。因此径向位移 $\rho_B=\|\rho_B\|$ 服从 Beckmann 分布，并可用修正 Rayleigh 分布近似为 [35]

$$
f_{\rho_B}(\rho_B)=\frac{\rho_B}{\sigma_{\mathrm{mod}}^2}\exp\left(-\frac{\rho_B^2}{2\sigma_{\mathrm{mod}}^2}\right),\quad\rho_B>0,\tag{4}
$$

其中 $\sigma_{\mathrm{mod}}=\left(\frac{3\mu_x^2\sigma_x^4+3\mu_y^2\sigma_y^4+\sigma_x^6+\sigma_y^6}{2}\right)^{1/3}$ 为修正方差近似。利用（3）与（4），可得 $h_p$ 的 PDF 为

$$
f_{h_{p,B}}(h_{p,B})=\frac{\phi_{\mathrm{mod}}^2}{A_{\mathrm{mod}}^{\phi_{\mathrm{mod}}^2}}h_{p,B}^{\phi_{\mathrm{mod}}^2-1},\quad 0\le h_{p,B}\le A_{\mathrm{mod}},\tag{5}
$$

其中 $A_{\mathrm{mod}}=A_0\exp\left(\frac1{\phi_{\mathrm{mod}}^2}-\frac1{2\phi_x^2}-\frac1{2\phi_y^2}-\frac{\mu_x^2}{2\sigma_x^2\phi_x^2}-\frac{\mu_y^2}{2\sigma_y^2\phi_y^2}\right)$，$\phi_{\mathrm{mod}}$、$\phi_y$、$\phi_x$ 分别为 Bob 接收机处等效波束腰与抖动标准差之比、$x$ 与 $y$ 轴抖动方差。它们可写为 $\phi_{\mathrm{mod}}=w_{L_{\mathrm{eq}}}/2\sigma_{\mathrm{mod}}$、$\phi_x=w_{L_{\mathrm{eq}}}/2\sigma_x$、$\phi_y=w_{L_{\mathrm{eq}}}/2\sigma_y$。

对于 Eve 的对准误差模型，假设 Eve 的探测器位于同一接收平面、距 Bob 接收机 $d_E$ 米。此时 Bob 处的失准条件同样影响 Eve。特别地，令 $P$ 表示 Bob 探测器中心的坐标，$Q=\begin{bmatrix}X'\\Y'\end{bmatrix}+P$ 表示失准波束足迹中心的坐标，其中 $X'$ 与 $Y'$ 分别为 $x$ 与 $y$ 轴上的波束位移。Eve 探测器中心与失准波束足迹中心之间的距离 $\rho_E$ 由 $r_E^2=\|Q\|^2=\left\|\begin{bmatrix}X'\\Y'\end{bmatrix}\right\|^2+2\begin{bmatrix}X'\\Y'\end{bmatrix}^TP+\|P\|^2=\rho_B^2+2\begin{bmatrix}X'\\Y'\end{bmatrix}^TP+d_E^2$ 给出。因此 Eve 的对准误差系数可近似为 [36]

$$
h_{p,E}\approx A_{\mathrm{mod}}\exp\left(-\frac{2\rho_B^2}{w^2_{L_{\mathrm{eq}}}}\right)\exp\left(-\frac{2d_E^2}{w^2_{L_{\mathrm{eq}}}}\right)\exp(-U),\tag{6}
$$

其中 $U=\frac4{w^2_{L_{\mathrm{eq}}}}\begin{bmatrix}X'\\Y'\end{bmatrix}^TP$ 是均值为零、方差 $\sigma_U^2=\frac{16\sigma^2_{\mathrm{mod}}d_E^2}{w^4_{L_{\mathrm{eq}}}}$ 的正态随机变量。

**4）复合信道模型：** 通过把 GG 分布近似为混合 Gamma 分布，Bob 的复合信道 PDF 导出为 [37]

$$
f_{h_B}(h_B)=\chi h_B^{\phi_{\mathrm{mod}}^2-1}\sum_{i=1}^{n}a_i\xi_i^{\phi_{\mathrm{mod}}^2-\alpha}\Gamma\left(\alpha-\phi_{\mathrm{mod}}^2,\frac{\xi_ih_B}{A_{\mathrm{mod}}h_c}\right),\tag{7}
$$

其中 $\chi=\phi_{\mathrm{mod}}^2(A_{\mathrm{mod}}h_c)^{-\phi_{\mathrm{mod}}^2}$，$\Gamma(\cdot,\cdot)$ 为上不完全 Gamma 函数，$a_i=\theta_i/\sum_{j=1}^{n}\theta_j\Gamma(\alpha)\xi_j^{-\alpha}$，$\xi_i=\frac{\alpha\beta}{x_i}$，$\theta_i=\frac{(\alpha\beta)^\alpha w_ix_i^{-\alpha+\beta-1}}{\Gamma(\alpha)\Gamma(\beta)}$，$n$ 为 Gauss-Laguerre 近似阶数，$w_i$ 与 $x_i$ 分别为 Laguerre 多项式的权重因子与横坐标。

关于 Eve 的信道模型，基于 [36, Appendix B]，可导出其数值近似为

$$
f_{h_E}(h_E)=B'_0\sum_{k=1}^{m}C_kD_k^{\beta}\exp(-D_kh_E)h_E^{\beta-1},\tag{8}
$$

其中 $B'_0=\frac{\sqrt{2\pi}\sigma_{G'}}{B'_1}\exp\left(-\frac{\phi_{\mathrm{mod}}^2}{B'_2}\right)[\Gamma(\beta)]^{-1}$，$B'_1=0.5\phi_{\mathrm{mod}}^2\exp\left(0.5\phi_{\mathrm{mod}}^4\sigma_{G'}^2-\phi_{\mathrm{mod}}^2\mu_{G'}\right)$，$B'_2=\phi_{\mathrm{mod}}^2\sigma_{G'}^2-\mu_{G'}$，$\mu_{G'}=-0.5\ln\left(\frac{\alpha+1}{\alpha}\right)$，$\sigma_{G'}^2=\ln\left(\frac{\alpha+1}{\alpha}\right)+\frac{16\sigma_{\mathrm{mod}}^2d_E^2}{w^4_{L_{\mathrm{eq}}}}$。此外 $C_k=w_k\mathrm{erfc}(x_k)\exp\left(x_k^2+\sqrt2\sigma_{G'}\phi_{\mathrm{mod}}^2x_k\right)$，$D_k=\beta\left[A_{\mathrm{mod}}h_c\exp\left(\sqrt2\sigma_{G'}x_k-\frac{2d_E^2}{w^2_{L_{\mathrm{eq}}}}-B'_2\right)\right]^{-1}$，$m$ 为 Gauss-Hermite 近似阶数，$w_k$ 与 $x_k$ 分别为 Hermite 多项式的权重因子与横坐标。

### C. 采用双阈值/直接检测（DT/DD）的 CV-QKD

关于量子阶段实现的 QKD 协议，我们考虑采用 SIM/BPSK 与双阈值检测器的非相干 CV-QKD 协议。该协议受 BB84 协议启发，具有低复杂度、低实现成本与兼容传统通信设备的优点 [25]。然而需注意，所提方案同样可用于任何 QKD 系统的密钥协商。

图 3 给出所考虑系统的框图。特别地，Alice 首先把随机二进制比特调制为具有小调制深度 $\delta$（$0<\delta<1$）的 SIM/BPSK 信号；调制信号经衰落信道系数 $h(t)$ 与噪声的卫星光链路传输。接收端 Bob 使用 PIN 光电二极管直接检测光信号并转换为电信号。匹配滤波后的解调电信号为 $s(t)=(2i-1)\frac14\mathcal R\delta P_th(t)+n(t)$，其中 $i$ 表示发送比特（$i\in\{0,1\}$），$\mathcal R$ 表示探测器响应度，$P_t$ 为峰值发射功率，$n(t)$ 表示接收噪声。Bob 基于双阈值（DT）$d_0$ 与 $d_1$ 检测接收信号：

$$
b(t)=\begin{cases}0, & \text{若 } s(t)\le d_0,\\ 1, & \text{若 } s(t)\ge d_1,\\ X, & \text{其他},\end{cases}
$$

其中 $b(t)$ 表示 $t$ 时刻的检测结果，"X" 表示 Bob 无法检测到信号。DT 取值为 $d_i=(2i-1)\left(\frac14\mathcal R\delta P_th_c\frac{A_{\mathrm{mod}}\phi_{\mathrm{mod}}^2}{1+\phi_{\mathrm{mod}}^2}+\zeta\sqrt{\sigma_n^2}\right)$ [36]，其中 $\zeta$ 为 DT 尺度系数，$\sigma_n^2$ 为接收噪声方差。

关于接收噪声 $n(t)$，可建模为零均值加性高斯白噪声（AWGN），其方差写为 $\sigma_n^2=\sigma_{\mathrm{sh}}^2+\sigma_{\mathrm{bg}}^2+\sigma_{\mathrm{th}}^2$ [25]。其中 $\sigma_{\mathrm{sh}}^2$、$\sigma_{\mathrm{bg}}^2$、$\sigma_{\mathrm{th}}^2$ 分别为散粒噪声、背景噪声与热噪声的方差。散粒噪声 $\sigma_{\mathrm{sh}}^2=2q\mathcal R\left(\frac14P_t\delta h\right)\Delta f$，其中 $\Delta f=\frac{R_b}{2}$ 表示有效噪声带宽，$R_b$ 为 FSO 信道的数据率。背景噪声 $\sigma_{\mathrm{bg}}^2=2q\mathcal RP_b\Delta f$，其中 $q$ 为电子电荷，$P_b=\frac{\Omega\pi r_a^2}{B_0\lambda^2}c$ 表示平均接收背景辐射功率，$\Omega$ 表示大气层外太阳光谱辐照度，$B_0$ 为光学带宽，$c$ 为光速。热噪声 $\sigma_{\mathrm{th}}^2=\frac{4k_BTF_n}{R_L}\Delta f$，其中 $k_B$ 为 Boltzmann 常数，$T$ 为接收机温度（开尔文），$F_n$ 为放大器噪声系数，$R_L$ 为负载电阻。

**图 3：** 量子阶段实现的基于 SIM/BPSK 与双阈值检测器的自由空间 CV-QKD 协议框图。（来源：原文第 5 页。）

## IV. 所提方法

本节先描述所提盲协商设计（考虑原图 RC-LDPC 码与基于伴随式的错误估计），然后给出基于伴随式错误估计方法的细节。

### A. 盲协商设计

**1）盲协商回顾：** 盲协商使用 RC-LDPC 码族，允许使用高速率码的伴随位来译码更低速率的码。过程开始时，双方从该族最高码率开始；若一次协商尝试失败，则通过公开信道发送更多伴随位。接收端把这些伴随位与之前的伴随位结合以降低码率，从而提高成功协商的概率。协议持续进行，直至筛选块被成功译码，或双方用尽所有可能码率；在后一种情形下双方丢弃其筛选块。

然而，若平均 QBER 较高且初始码率多数时候失败，协议可能需要多轮通信才能达到合适码率。在传播时延很高（毫秒量级）的卫星通信中，这一点被进一步放大。为规避该问题，我们额外考虑基于伴随式的错误估计方法 [38]。所提设计的核心思想是：接收机可利用初始伴随式估计 QBER，并与发送方共享该信息；基于估计的 QBER，发送方可通过调整下一轮通信中的伴随位数量来适配码率。图 4 描述了传统盲协商与所提设计的操作。

**图 4：** 传统盲协商与所提设计的操作流程。（来源：原文第 6 页。）

**2）基于原图的速率兼容（RC）-LDPC 码族：** 为便于盲协商操作，我们考虑由原图构造的 RC-LDPC 码族。原图指含少量节点的二部图，可作为原型用于生成各种尺寸的奇偶校验矩阵，从而在原图层面对 LDPC 码进行高效设计与优化 [39]。

所需 RC-LDPC 码族的原型矩阵可通过码扩展方法构造。该方法通过向高速率码的原型矩阵添加新行、并穷举搜索译码阈值最低者来构造低速率码的原型矩阵 [21]。由此得到 RC-LDPC 码族，其结构如图 5 所示。其中 $N_r$ 表示族中 LDPC 码的数量，$1>R_1>R_2>\cdots>R_{N_r}$ 表示码率，$H_i$（$1\le i\le N_r$）为相应的奇偶校验矩阵。任意的 $H_{i+1}$ 是更高码率矩阵 $H_i$ 与若干行的组合，构成子矩阵 $H_{i+1}^{\Delta}$。这种结构允许通过在 $\mathbf s_i$ 上添加更多伴随位来构造伴随向量 $\mathbf s_{i+1}$，如图 5 所示。

**图 5：** 所提 RC-LDPC 码族及所创建伴随向量如何嵌套的示意。（来源：原文第 7 页。）

**3）操作步骤：** 令 $\mathbf k_A$ 与 $\mathbf k_B$ 分别表示 Alice 与 Bob 的筛选块。所提设计的详细步骤如下：

- **步骤 1：** Alice 创建初始伴随式 $\mathbf s=\mathbf k_AH_1^T$，并通过公开信道发送给 Bob。
- **步骤 2：** Bob 使用修正译码算法 [40] 依据伴随式 $\mathbf s$ 译码其筛选块。修正译码算法的操作与传统译码算法相同，区别在于它把伴随向量 $\mathbf s$ 纳入考虑。特别地，Bob 尝试把 $\mathbf k_B$ 译为 $\hat{\mathbf k}_B$，使得 $\hat{\mathbf k}_BH_1^T=\mathbf s$。若筛选块在预定义迭代次数后成功译码，Bob 通知 Alice，双方保存已协商块；否则进入下一步。
- **步骤 3：** Bob 利用伴随式 $\mathbf s$ 估计其筛选密钥的 QBER，并在 RC-LDPC 码族中选择合适码率（错误估计方法细节见 §IV-B）。随后他把码率的索引 $\epsilon$ 与 Alice 共享。
- **步骤 4：** Alice 置 $i=\epsilon$，并计算增量伴随式 $\Delta\mathbf s$ 为

$$
\Delta\mathbf s=\mathbf k_A\left[\left(H_2^{\Delta}\right)^T\ \cdots\ \left(H_\epsilon^{\Delta}\right)^T\right].\tag{9}
$$

- **步骤 5：** Bob 通过拼接伴随式 $\mathbf s$ 与 $\Delta\mathbf s$ 得到新伴随式 $\mathbf s_\epsilon$，然后用新得到的伴随式再次尝试译码。若译码尝试成功，过程结束；否则进入下一步。
- **步骤 6：** Alice 检查条件 $i=N_r$。若成立，双方丢弃筛选块；否则 Alice 置 $i=i+1$，计算新的增量伴随式 $\Delta\mathbf s=\mathbf k_A(H_i^{\Delta})^T$ 并发送给 Bob，过程返回步骤 5。

### B. 基于伴随式的错误估计

所考虑的基于伴随式的 QBER 估计方法基于 [38] 中利用正则 LDPC 码伴随式的方法。该方法可应用于原图 LDPC 码，原因是在奇偶校验矩阵中，由原型矩阵某一行提升得到的所有行具有相同的行重。

令 $\rho$ 表示 Alice 与 Bob 所考虑筛选块之间的比特翻转概率，$H$ 为由原型矩阵 $B$ 提升得到的 $m\times n$ 奇偶校验矩阵，$\mathbf s_A$ 与 $\mathbf s_B$ 分别为由 $H$ 与 Alice、Bob 筛选块生成的伴随式。记 $\mathbf s_{A,d}\subseteq\mathbf s_A$ 与 $\mathbf s_{B,d}\subseteq\mathbf s_B$ 为由具有相同行重 $d$ 的行生成的伴随位向量。根据注 1，$\mathbf s_{A,d}$ 与 $\mathbf s_{B,d}$ 的长度（记为 $m_d$）的最小值等于提升因子 $n_{\mathrm{lift}}$。

**注 1：** 设 $w$ 为原型矩阵 $B$ 中任意一行，其行重为 $d$。则在奇偶校验矩阵 $H$ 中，至少有 $n_{\mathrm{lift}}$ 行具有行重 $d$，其中 $n_{\mathrm{lift}}$ 为提升因子。

此外，令 $0<\gamma_2<\cdots<\gamma_{\mathrm{th}}\le0.5$ 表示 Alice 用于确定码率的阈值。本文选择阈值使误帧率（FER）低于预定义水平，即 $10^{-3}$。为便于分析，本文基于 LDPC 码的经验性能确定阈值。例如，考虑码率集合为 $\{0.9,0.8,0.7,0.6,0.5\}$ 的 RC-LDPC 码族的 FER 性能（图 6）：该族的奇偶校验矩阵通过两次提升其原型矩阵 $B_{1/2}$ 生成，最终块长为 10,000 比特（两步提升细节与 $B_{1/2}$ 构造分别见 [31] 与附录 A）。可见，各码成员的阈值选为 $\{\gamma_1,\gamma_2,\gamma_3,\gamma_4,\gamma_5\}=\{0.005,0.0135,0.027,0.054,0.0835\}$，对应其 FER 曲线为 $10^{-3}$ 的点。

**图 6：** 在比特翻转概率不同取值下（上 y 轴）所选码率的 FER 性能；用于码率确定的阈值示于下 y 轴，其中 $\{\gamma_1,\gamma_2,\gamma_3,\gamma_4,\gamma_5\}=\{0.005,0.0135,0.027,0.054,0.0835\}$。（来源：原文第 7 页。）

错误估计方法与码率选择的细节如下：

- **步骤 1：** Bob 在原型矩阵 $B$ 的所有行中选择最小行重 $d_{\min}$⁴，并分别基于 $\mathbf s_A$ 与 $\mathbf s_B$ 创建两个向量 $\mathbf s_{A,d_{\min}}$ 与 $\mathbf s_{B,d_{\min}}$；随后计算二者之差 $\Delta\mathbf s=\mathbf s_{A,d_{\min}}\oplus\mathbf s_{B,d_{\min}}$。
- **步骤 2：** Bob 估计伴随位被翻转的概率 $q$，即 $\hat q=\frac w{m_{d_{\min}}}$，其中 $w$ 为 $\Delta\mathbf s$ 的重量。
- **步骤 3：** 给定 $\rho\in[0,0.5]$，$\rho$ 的估计值（记为 $\hat\rho$）表示为 [38]

$$
\hat\rho=\begin{cases}\phi^{-1}(w)=1-\left(1-\frac{2w}{m_{d_{\min}}}\right)^{\frac1d}{}^{2}, & \text{若 }\hat q<1/2,\\ \frac12, & \text{若 }\hat q\ge1/2,\end{cases}\tag{10}
$$

其中 $\phi(\rho)=q$ 为伴随式的理论比特翻转概率，可建模为 Bernoulli 过程 [19]、[38]。因此 $\phi(\cdot)$ 的表达式写为

$$
\phi(\rho)=\sum_{\substack{i=1\\i\equiv1(\mathrm{mod}\,2)}}^{d}\binom{d}{i}\rho^i(1-\rho)^{d-i}=\frac{1-(1-2\rho)^d}{2}.\tag{11}
$$

- **步骤 4：** Bob 选择满足 $\hat\rho\le\gamma_\epsilon$ 的最小整数 $\epsilon\in[2,N_r]$；若没有满足的值，则置 $\epsilon=N_r$。最后，他告知 Alice $\epsilon$ 的取值并结束该过程。

> **脚注 4（原文）：** 这是因为 $d$ 取值越大，估计器的均方误差越大 [38]。

与现有方案相比，所提设计在实现复杂度与实际部署方面具有三项关键优势。第一，现有盲协商设计 [12]–[14]、[16]、[17] 依赖非结构化 LDPC 码，其高度随机的奇偶校验矩阵导致较高硬件实现复杂度；相反，原图 LDPC 码的奇偶校验矩阵继承底层原图结构，可实现高效的硬件译码器 [39]。第二，多数现有工作利用缩短与打孔技术构造 RC-LDPC 码，受辅助比特数约束而限制其覆盖范围 [15]；相反，原图 RC-LDPC 族中的码成员在原图层面对设计与优化，使单一码族覆盖较宽的 QBER 范围 [18]、[21]。第三，我们的错误估计方法比面向非正则 LDPC 码的方法 [19]、[20]（需穷举搜索）简单得多；通过利用在给定行数下具有固定行重的原图 LDPC 码，我们的方法大幅降低了计算复杂度。

## V. 性能分析

本节首先给出传统盲协商（即无错误估计的盲协商）在端到端 SKT 方面的数学框架；在此基础上，我们建立计入不完美错误估计影响的所提设计框架；最后研究 QBER 的统计分布以完善该框架。

### A. 传统盲协商

本节考虑端到端 SKT，其定义为系统每秒产生的平均秘密比特数。传统盲协商的 SKT 可表示为

$$
\mathrm{SKT}=\frac{R_{\sec}}{T_{\mathrm{sf}}}=\frac{N_bn_{\mathrm{sift}}\sum_{i=1}^{N_r}P^{(i)}_{\mathrm{succ}}(\beta_iI_{AB}-I_E)}{\varepsilon_Q+(N_b-1)\max[\varepsilon_Q,\varepsilon_P]+\varepsilon_P},\tag{12}
$$

其中 $R_{\sec}$ 为每超帧的平均秘密比特数，$T_{\mathrm{sf}}$ 为超帧的平均时长，$P^{(i)}_{\mathrm{succ}}$ 为被第 $i$ 个码率纠正的仿真帧比例（可由（19）计算），$n_{\mathrm{sift}}$ 为筛选块的比特长度，$N_r$ 表示族中码率的最大数量，$I_{AB}$ 表示 Alice 与 Bob 筛选密钥之间的互信息，$\beta_i=\frac{C_i}{I_{AB}}$ 为协商效率，$C_i$ 为第 $i$ 个码率，$I_E$ 表示窃听者可通过量子信道获得的信息量（计算见下段）。此外，$\varepsilon_Q$ 为通过量子信道共享一个筛选密钥的平均时间，由（13）给出；$\varepsilon_P$ 为通过公开信道处理一个筛选密钥的平均时间，由（16）给出。

本文考虑 URA，即 Eve 通过窃听并采用检测阈值 $d_{E,\mathrm{th}}=0$ 检测 Alice 的信号来获取密钥信息。因此 Eve 得到她自己的、与 Alice 部分相关的筛选密钥。该过程可等价视为在二进制对称信道上的数据传输，故 Alice 与 Eve 筛选密钥之间的互信息为 $I_E=1-H(p_e)$，其中 $H(\cdot)$ 为二进制熵函数，$p_e$ 为 Eve 错误检测 Alice 发送比特的概率 [36]。此外，$\varepsilon_Q$ 可表示为

$$
\varepsilon_Q=\frac{n_{\mathrm{sift}}}{R_b^{\mathrm{FSO}}P_{\mathrm{sift}}},\tag{13}
$$

其中 $R_b^{\mathrm{FSO}}$ 为 FSO 信道的数据率，$P_{\mathrm{sift}}$ 表示 Bob 可按 §III-C 的规则检测到比特 "0" 与 "1" 的概率。$p_e$ 与 $P_{\mathrm{sift}}$ 的计算可由引理 1 得到。

**引理 1：** Bob 处的平均筛选概率 $P_{\mathrm{sift}}$ 与 Eve 处的平均错误概率 $p_e$ 可分别近似为（14）与（15）。其中 $Q(\cdot)$ 为 Q 函数，$\sigma_{n,k}(x_k)=\sqrt{2q\mathcal R\left(\frac14P_t\delta h_cA_{\mathrm{mod}}x_k+P_b\right)\Delta f+\sigma_{\mathrm{th}}^2}$，$\Upsilon'(a,b,x_k)=(1-2b)i_{a,k}+(2b-1)d_{b,k}$，$i_{a,k}=(2a-1)\frac14\mathcal R\delta P_tx_kh_cA_{\mathrm{mod}}$，$d_{b,k}=(2b-1)\left(\frac14\mathcal R\delta P_th_c\frac{A_{\mathrm{mod}}\phi_{\mathrm{mod}}^2}{1+\phi_{\mathrm{mod}}^2}+\zeta\sqrt{\sigma_{n,k}^2}\right)$，$n'$ 为 Gauss-Laguerre 近似阶数，$w_j$ 与 $x_j$ 分别为 Laguerre 多项式的权重因子与横坐标。

$$
P_{\mathrm{sift}}\approx\phi_{\mathrm{mod}}^2\sum_{a,b\in\{0,1\}}\sum_{j=1}^{n'}\sum_{i=1}^{n}w_j\exp(x_j)Q\left[\frac{\Upsilon'(a,b,x_j)}{\sigma_{n,k}(x_j)}\right]x_j^{\phi_{\mathrm{mod}}^2-1}a_i\xi_i^{\phi_{\mathrm{mod}}^2-\alpha}\Gamma\left(\alpha-\phi_{\mathrm{mod}}^2,\xi_ix_j\right).\tag{14}
$$

$$
p_e\approx B'_0(h_cA_{\mathrm{mod}})^{\beta}\sum_{i=1}^{n}\sum_{k=1}^{m}w_i\exp(x_i)Q\left[\frac{0.25\mathcal R\delta P_tx_ih_cA_{\mathrm{mod}}}{\sigma_{n,k}(x_i)}\right]C_kD_k^{\beta}\exp(-D_kx_ih_cA_{\mathrm{mod}})x_i^{\beta-1}.\tag{15}
$$

**证明：** 见附录 B。■

**注 2：** 近似（14）在近似阶数 $n'=25$ 与 $n=20$ 时快速收敛到精确值；对（15），收敛所需近似阶数约为 $n=m=50$。

此外，$\varepsilon_P$ 可计算为

$$
\varepsilon_P=t_{\mathrm{prop}}+t^{\mathrm{sifting}}_{\mathrm{trans}}+\sum_{i=1}^{N_r}P^{(i)}_{\mathrm{succ}}D_i+P_{\mathrm{fail}}D_{N_r},\tag{16}
$$

其中 $t_{\mathrm{prop}}=\frac Lc$ 为传播时延，$t^{\mathrm{sifting}}_{\mathrm{trans}}$ 表示筛选信息的传输时延，可计算为

$$
t^{\mathrm{sifting}}_{\mathrm{trans}}=\frac{n_{\mathrm{sp}}}{R_b^{\mathrm{RF}}}.\tag{17}
$$

其中 $n_{\mathrm{sp}}$ 为筛选位置信息的长度，$R_b^{\mathrm{RF}}$ 为公开信道的数据率。此外，$D_i$ 为协商在第 $i$ 轮通信完成时的平均时延，表示为

$$
D_i=(2i-1)t_{\mathrm{prop}}+\sum_{j=1}^{i}t^{\mathrm{SYN}_j}_{\mathrm{trans}},\tag{18}
$$

其中 $t^{\mathrm{SYN}_j}_{\mathrm{trans}}=\frac{n_{\mathrm{syn},j}}{R_b^{\mathrm{RF}}}$ 为第 $j$ 个伴随式的传输时延，$n_{\mathrm{syn},j}$ 为第 $j$ 个伴随式的长度，$P_{\mathrm{fail}}=1-\sum_{i=1}^{N_r}P^{(i)}_{\mathrm{succ}}$ 为协商失败的概率。最后，$P^{(i)}_{\mathrm{succ}}$ 可计算为

$$
P^{(i)}_{\mathrm{succ}}=F_\rho(\gamma_i)-F_\rho(\gamma_{i-1}),\tag{19}
$$

其中 $(\gamma_0=0)<\gamma_1<\cdots<\gamma_{\mathrm{th}}\le0.5$ 为码率确定所用的阈值，这些阈值基于 RC-LDPC 码族成员的经验性能定义（图 6）。

此外，$F_\rho(\cdot)$ 为筛选块 QBER 的 CDF。然而需注意，由于每个时隙中所得筛选比特与错误比特取决于瞬时信道衰落系数，该函数的闭式表达并不易得；因此每个有限长度的筛选块可能由不同数量的相干时间、不同错误模式构成。为便于系统分析，我们把筛选块 QBER 的统计分布建模为指数化威布尔（EB）随机变量，其参数通过曲线拟合仿真数据直方图得到；方法细节与与其他统计分布的比较见 §V-C。于是式（19）中筛选块 QBER 的 CDF 可由 EB 分布的 CDF $F_{EW}(x)$ 替代，其表达式见 [41]。

**图 7：** 所考虑系统中低估与高估的示意。（来源：原文第 10 页。）

### B. 计入不完美错误估计的所提设计

本节建立计入不完美错误估计影响的所提设计性能框架。由于错误估计并不完美，估计状态可能与实际状态不符，导致错误的状态判定（如图 7 所示），从而影响系统性能。特别地，令 $\alpha$ 表示实际值 $\rho$ 的状态，$\epsilon$ 表示估计值 $\hat\rho$ 的状态。若 $\alpha<\epsilon$，则 $\hat\rho$ 被低估，Bob 需要更多通信轮才能达到合适码率；另一方面，若 $\alpha>\epsilon$，则 $\hat\rho$ 被高估，协商步骤将泄露比必要量更多的信息。

此时，SKT 可计算为

$$
\mathrm{SKT}_{\mathrm{imp}}=\frac{R_{\mathrm{imp},\sec}}{\varepsilon_Q+(N_b-1)\max[\varepsilon_Q,\varepsilon_{\mathrm{imp},P}]+\varepsilon_{\mathrm{imp},P}},\tag{20}
$$

其中 $R_{\mathrm{imp},\sec}$ 为不完美估计情形下每超帧的平均秘密比特数，表示为

$$
R_{\mathrm{imp},\sec}=N_bn_{\mathrm{sift}}\sum_{\alpha=1}^{N_r}\sum_{\epsilon=1}^{N_r+1}P^{\mathrm{est}}_{\alpha,\epsilon}\left(\beta_\chi I_{AB}-I_E\right),\tag{21}
$$

其中 $P^{\mathrm{est}}_{\alpha,\epsilon}$ 表示实际值 $\rho$ 处于状态 $\alpha$ 且估计值 $\hat\rho$ 处于状态 $\epsilon$ 的概率（其计算见（24）、（25）），$\chi=\max(\alpha,\chi_\epsilon)$ 且 $\chi_\epsilon=\min(\epsilon,N_r)$。至于一个筛选块后处理阶段的平均时间，计算为

$$
\varepsilon_{\mathrm{imp},P}=t_{\mathrm{prop}}+t^{\mathrm{sifting}}_{\mathrm{trans}}+\sum_{\alpha=1}^{N_r+1}\sum_{\epsilon=1}^{N_r+1}P^{\mathrm{est}}_{\alpha,\epsilon}D_{\alpha,\epsilon},\tag{22}
$$

其中 $D_{\alpha,\epsilon}$ 为实际值 $\rho$ 处于状态 $\alpha$、估计值 $\hat\rho$ 处于状态 $\epsilon$ 时的平均时延，可计算为

$$
D_{\alpha,\epsilon}=\begin{cases}[2\min(\alpha,2)-1]t_{\mathrm{prop}}+\sum_{j=1}^{\chi_\epsilon}t^{\mathrm{SYN}_j}_{\mathrm{trans}}, & \epsilon\ge\alpha,\\ \left[3+2(\chi_\alpha-\epsilon)\right]t_{\mathrm{prop}}+\sum_{j=1}^{\chi_\alpha}t^{\mathrm{SYN}_j}_{\mathrm{trans}}, & \epsilon<\alpha,\end{cases}\tag{23}
$$

其中 $\chi_\alpha=\min(\alpha,N_r)$。

为计算 $P^{\mathrm{est}}_{\alpha,\epsilon}$，考虑如下两种可能情形。第一，Bob 使用初始伴随式 $\mathbf s$ 成功协商该筛选块；第二，他首次尝试失败，并使用初始伴随式 $\mathbf s$ 估计 QBER。对于第一种情形，$P^{\mathrm{est}}_{1,\epsilon}$ 的计算可给出为

$$
P^{\mathrm{est}}_{1,\epsilon}=\begin{cases}F_{EW}(\gamma_1), & \epsilon=1,\\0, & \epsilon\ne1.\end{cases}\tag{24}
$$

关于第二种情形（$\alpha\ne1$），$P^{\mathrm{est}}_{\alpha,\epsilon}$ 的表达式为

$$
P^{\mathrm{est}}_{\alpha,\epsilon}=\begin{cases}0, & \epsilon=1,\\P^{\gamma_2}_\alpha, & \epsilon=2,\\P^{0.5}_\alpha-P^{\gamma_{N_r}}_\alpha+P^{\mathrm{fail}}_\alpha, & \epsilon=N_r,\\P^{\gamma_\epsilon}_\alpha-P^{\gamma_{\epsilon-1}}_\alpha, & \text{其他},\end{cases}\tag{25}
$$

其中 $P^\gamma_\alpha$ 为实际值 $\rho$ 处于状态 $\alpha$ 时估计值 $\hat\rho$ 小于任意值 $\gamma$ 的概率，即 $P^\gamma_\alpha=P(\hat\rho\le\gamma\mid\rho\text{ 处于状态 }\alpha)$；$P^{\mathrm{fail}}_\alpha$ 为实际值 $\rho$ 处于状态 $\alpha$ 时 Bob 因 $\frac wm>1/2$ 而无法估计的概率，由（29）给出。$P^\gamma_\alpha$ 可写为

$$
P^\gamma_\alpha=\int_{\gamma_\alpha}^{\gamma_{\alpha+1}}f_{EW}(\rho)P(\hat\rho\le\gamma\mid\rho)\,\mathrm d\rho,\tag{26}
$$

其中 $f_{EW}(\cdot)$ 为 EB 分布的 PDF [41]，最后一式中的概率由引理 2 导出。

**引理 2：** 给定实际值 $\rho$ 时，估计值 $\hat\rho$ 小于任意值 $\gamma\in[0,0.5]$ 的概率的闭式表达为

$$
P(\hat\rho\le\gamma\mid\rho)=I_{1-\phi(\rho)}\left(m-\phi^{-1}(\gamma),\phi^{-1}(\gamma)+1\right),\tag{27}
$$

其中 $I_\cdot(\cdot,\cdot)$ 为正则化不完全 Beta 函数。

**证明：** 见附录 C。■

由于积分在解析上不易处理，我们先把积分区间变换到 $[-1,1]$，再应用 Gauss-Legendre 求积方法 [42]，导出（26）的数值表达。因此（26）可近似为

$$
P^\gamma_\alpha\approx\psi_\alpha\sum_{l=1}^{\ell}w_lf_{EW}(\Xi_l)I_{1-\phi(\Xi_l)}\left[m-\phi^{-1}(\gamma),\phi^{-1}(\gamma)+1\right],\tag{28}
$$

其中 $\psi_\alpha=\frac{\gamma_{\alpha+1}-\gamma_\alpha}{2}$，$\Xi_l=\frac{\gamma_{\alpha+1}-\gamma_\alpha}{2}x_l+\frac{\gamma_\alpha+\gamma_{\alpha+1}}{2}$，$x_l$ 为 Legendre 多项式 $P_n(x)$ 的第 $l$ 个根，$w_l=\frac{2}{(1-x_l)^2[P_n'(x_l)]}$，$\ell$ 为 Gauss-Laguerre 近似阶数。

借助引理 2，$P^{\mathrm{fail}}_\alpha$ 表示为

$$
P^{\mathrm{fail}}_\alpha=\int_{\gamma_\alpha}^{\gamma_{\alpha+1}}f_{EW}(\rho)\Pr\left[W>\frac m2\right]\mathrm d\rho=\int_{\gamma_\alpha}^{\gamma_{\alpha+1}}f_{EW}(\rho)\left[1-I_{1-\phi(p)}\left(\frac m2,\frac m2+1\right)\right]\mathrm d\rho.\tag{29}
$$

应用与式（26）相同的数学处理，可得 $P^{\mathrm{fail}}_\alpha$ 的数值表达为

$$
P^{\mathrm{fail}}_\alpha\approx\psi_\alpha\sum_{l=1}^{\ell}w_lf_{EW}(\Xi_l)\left[1-I_{1-\phi(\Xi_l)}\left(\frac m2,\frac m2+1\right)\right].\tag{30}
$$

**注 3：** 近似（28）与（30）在 $\ell=10$ 之后快速收敛到精确形式，即（26）与（29）。

### C. 筛选块 QBER 的统计分布

本节旨在通过曲线拟合方法导出筛选块 QBER 的统计分布。特别地，我们寻找其 PDF 最能拟合仿真数据直方图的概率分布。为评估某分布与仿真数据的拟合程度，采用众所周知的 $R^2$（R 方）度量 [43]；显然 $R^2$ 越接近 1，所预测概率分布对数据的拟合越好。

表 II 给出在不同 DT 尺度系数 $\zeta$ 的场景下，所考虑概率分布（即正态、对数正态、Weibull 与 EB 分布）的拟合优度结果与拟合参数。其中 $\mu_N$ 与 $\sigma_N$ 分别表示正态分布的均值与方差；$\mu_{LN}$ 与 $\sigma_{LN}$ 为对数正态分布的位置参数与尺度参数；$\beta_W$ 为 Weibull 分布的形状参数，$\eta_W$ 为其尺度参数；$\alpha_{EW}$ 与 $\beta_{EW}$ 表示 EB 分布的形状参数，$\eta_{EW}$ 为其尺度参数。仿真中使用的其他参数见第 VI 节。

对每个场景，我们生成 $10^4$ 个样本⁵并构造 50 个 bin 的直方图，然后使用开源 SciPy 库的 `curve_fit` 函数以所考虑概率分布的 PDF 拟合该直方图。

> **脚注 5（原文）：** 需注意，这样数量的样本可在相对较短的时间（数毫秒）内收集，其间天顶角可合理假定保持不变。

可见，在所考虑的统计分布中 EB 分布的拟合最好，多数场景下 $R^2>0.99$。这是因为 EB 分布有三个参数，具有更高自由度以拟合跨筛选块的随机 QBER 值。因此，本文其余部分采用 EB 分布建模筛选块 QBER 的统计分布。

**表 II：不同参数设置下所考虑概率分布的 GoF 结果与拟合参数。** 参数列为正态 GoF 与 $(\mu_N,\sigma_N)$、对数正态 GoF 与 $(\mu_{LN},\sigma_{LN})$、Weibull GoF 与 $(\beta_W,\eta_W)$、指数化威布尔 GoF 与 $(\alpha_{EW},\beta_{EW},\eta_{EW})$。（来源：原文第 11 页。）

| 参数 | 正态 GoF（$\mu_N,\sigma_N$） | 对数正态 GoF（$\mu_{LN},\sigma_{LN}$） | Weibull GoF（$\beta_W,\eta_W$） | 指数化威布尔 GoF（$\alpha_{EW},\beta_{EW},\eta_{EW}$） |
|---|---|---|---|---|
| $\zeta=1.5$ | 0.9484（0.047, 0.03883） | 0.937（−2.8467, 0.8079） | 0.99（1.571, 0.069） | 0.9903（1.1147, 1.4672, 0.0657） |
| $\zeta=2$ | 0.9512（0.0222, 0.0247） | 0.9672（−3.4325, 1.033） | 0.9972（1.3143, 0.0409） | 0.9983（1.3246, 1.1006, 0.0342） |
| $\zeta=2.25$ | 0.9499（0.0179, 0.02） | 0.9192（−3.62, 1.1027） | 0.9955（1.2744, 0.0331） | 0.9974（0.744, 1.5612, 0.0386） |
| $\zeta=2.5$ | 0.9564（0.0166, 0.0161） | 0.8603（−3.793, 0.9559） | 0.9849（1.371, 0.027） | 0.9969（0.5412, 2.1262, 0.0348） |
| $\zeta=2.75$ | 0.9867（1.8442, 0.0206） | 0.8996（−4.0149, 0.6545） | 0.9799（2.5377, 0.0155） | 0.9859（0.6247, 2.5, 0.024） |
| $\zeta=3$ | 0.9831（0.0131, 0.006） | 0.9585（−4.2743, 0.4644） | 0.989（2.5377, 0.0155） | 0.9902（1.3141, 2.171, 0.0142） |

**图 8：** 不同 DT 尺度系数 $\zeta$（1.5、2.5、3）下筛选块 QBER 的仿真数据直方图与 EB 分布拟合曲线示例。（来源：原文第 11 页。）

## VI. 数值结果与讨论

### A. 参数设置

除另作说明，分析所考虑的参数如下。在 LEO 卫星（Alice）处：卫星高度 $H_s=500$ km、天顶角 $\xi=30^\circ$、发散半角 $\theta=25$ µrad、$\mu_x=\mu_y=0$、抖动角 $\theta_{jt,x}=\theta_{jt,y}=2.5$ µrad、FSO 信道数据率 $R_b^{\mathrm{FSO}}=1$ Gbps、公开信道数据率 $R_b^{\mathrm{Pub}}=1$ Gbps、调制深度 $\delta=0.2$、$F_0=\infty$、发射功率 $P_t=25$ dBm、光波长 $\lambda=1.55$ µm、每超帧筛选密钥块数 $N_b=100$。在地面车辆（Bob 与 Eve）处：车辆高度 $H_v=1.5$ m、接收孔径半径 $r_a=5$ cm、探测器响应度 $\mathcal R=0.9$ A/W、负载电阻 $R_L=1$ kΩ、放大器噪声系数 $F_n=2$、接收机温度 $T=298$ K、光学带宽 $B_0=250$ GHz、Bob 处 DT 尺度系数 $\zeta=2.5$、Bob 与 Eve 之间的最小距离 $d_E=10$ m。关于 FSO 信道：大气层高度 $H_a=20$ km、均方根风速 $v_{\mathrm{wind}}=21$ m/s、地面湍流强度 $C_n^2(0)=10^{-14}$ m$^{-2/3}$、信道相干时间 $t_{\mathrm{coh}}=1$ ms、太阳光谱辐照度 $\Omega=0.1$ W/cm²·µm、云层垂直厚度 $H_c=2$ km、$M_c=1$ mg/m³、$N_c=250$ cm⁻³。

我们考虑两个原图 RC-LDPC 码族，其块长分别为 10,000 与 40,000。这些码族由附录 A 导出的同一原图构造。我们还考虑使用渐进边增长（PEG）算法与循环 PEG 算法的两步提升 [31]：第一次提升因子为 4；第二次提升因子分别为 125 与 500。注意为便于分析，我们考虑该族五个码率，即 $\{0.9,0.8,0.7,0.6,0.5\}$。这些码率的阈值基于这些 LDPC 码在特定长度下的经验性能确定；值得注意的是，块长 10,000 与 40,000 的阈值分别为 $\{0.005,0.0135,0.027,0.054,0.0835\}$ 与 $\{0.0065,0.0175,0.0335,0.0635,0.0896\}$。

### B. 性能比较

首先，图 9 突出展示了所提设计相对传统盲协商的有效性。此处传统盲协商采用与所提方案相同的 RC-LDPC 码族。特别地，图 9(a) 给出不同筛选块长度（即 10,000 与 40,000）下的性能；为便于比较，我们还绘出完美错误估计情形下的 SKT。正如预期，在所考虑的 CLWC 范围内，所提设计均优于盲协商，因为额外的基于伴随式错误估计有助于减少所需通信轮数，从而提高吞吐量。图 9(a) 的另一观察是：SKT 性能可通过增大筛选块长度来提升。这是因为筛选并协商一个筛选块所需时间远长于在量子阶段收集一个筛选块的时间，因此长块长可有效利用量子阶段时间。此外，Monte Carlo 仿真与解析数据吻合良好，进一步确认了理论框架的准确性。

**图 9：** 所提设计与盲协商在不同 (a) 块长 $n_{\mathrm{sift}}$、(b) 公开信道数据率 $R_b^{\mathrm{Pub}}$、(c) RC-LDPC 码族最大码率数 $N_r$ 下 SKT 随 CLWC 的变化。（来源：原文第 12 页。）

图 9(b) 给出公开信道数据率不同取值（250 Mbps 与 2 Gbps）下的性能比较。正如预期，使用较高的 $R_b^{\mathrm{Pub}}$ 可提升 SKT，因为高 $R_b^{\mathrm{Pub}}$ 显著降低筛选数据与伴随位的传输时延，从而降低后处理时延。此外，由于传播时延是后处理时延的主导因素，采用基于伴随式的错误估计方法可实质性改善系统性能。

图 9(c) 研究所提设计与盲协商在 RC-LDPC 码族中不同码率数量下的性能。特别地，我们考虑含三个与七个码率的两个 LDPC 码族：三码率族包含 $\{0.9,0.5,0.7\}$，七码率族额外考虑 $\{0.75,0.65\}$，其阈值分别为 $\{0.0205,0.037\}$。可以观察到，当码率数为七时，盲协商因通信轮数增加而性能退化；相反，所提设计在七码率下的性能优于三码率。这是因为更多码率可在较宽 QBER 范围内保持高密钥协商效率，从而提升 SKT。这凸显了所提设计相对盲协商的另一优势。

### C. 所提设计参数的影响与选择

我们接下来关注公开信道数据率的影响与合理选择。图 10 研究所提系统在不同公开信道数据率下的 SKT。如 §B 中图 9(b) 所讨论，提高数据率可显著改善 SKT；然而当 $R_b^{\mathrm{Pub}}$ 超过某一取值后，传输时延变得不再显著，性能随之饱和。基于该发现，可选择维持特定吞吐水平所需的最小 $R_b^{\mathrm{Pub}}$。例如当 CLWC 为 3 mg/m³ 时，可选公开信道数据率为 0.5 Gbps 以保持 1.25 Mbps 的吞吐水平。

**图 10：** 所提设计吞吐量随公开信道数据率的变化，CLWC 取值 $M_c=3,4,5$ mg/m³。（来源：原文第 12 页。）

我们在图 11 中分析不完美错误估计的影响，该图给出用于错误估计的伴随位数 $m_d$ 不同取值下的吞吐性能，并设 $M_c=5$ mg/m³。如图所示，当公开信道数据率较高（即 $R_b^{\mathrm{Pub}}>500$ Mbps）时，完美估计情形与实际性能之间的差距更加明显。这是因为该区域内传播时延主导传输时延，使低估成为主要问题。因此，在设计实际 QKD 系统时应仔细考虑不完美错误估计；此外，建议在错误估计中纳入尽可能多的伴随位，因为更准确的估计会带来更小的性能退化。

**图 11：** 吞吐量随公开信道数据率的变化，错误估计所用的伴随位数 $m_d$ 取 500 与 100（并给出完美估计与仿真结果）。（来源：原文第 12 页。）

### D. 卫星过境期间的性能考察

本节通过涉及 Starlink LEO 卫星与移动车辆的案例研究考察所提系统性能。特别地，选择 2021 年 12 月 23 日飞越日本的 STARLINK-1293 作为 Alice。注意系统的斜距与天顶角随时间变化；为考察卫星过境时长内的性能，我们根据车辆位置与卫星两行轨道根数（TLE）逐时刻重新计算斜距 $L$ 与天顶角 $\xi$。STARLINK-1293 的 TLE 见 [44]，$L$ 与 $\xi$ 的计算方法见 [31] 附录；计算所需的车辆位置信息（经度、纬度与高度）亦见 [31, Table IV]。所有图形的默认 CLWC 值为 3 mg/m³，其他参数与默认值相同。

图 12(a) 给出不同发射功率（23、25、28 dBm）下所提方案在卫星过境期间的吞吐性能。注意 $t=0$ 对应 2021 年 12 月 23 日 16:09:20（UTC+9）。可见当发射功率从 23 增至 25 dBm 时，卫星过境期间系统吞吐量提升。原因在于高发射功率可降低 Bob 处的平均 QBER，从而使筛选块可用高速率 LDPC 码协商。然而若发射功率过高（如本例中 $P_t=28$ dBm），Eve 处的信号质量也会改善，导致更多信息泄露与更低吞吐。据此可确定使过境期间吞吐最大化的发射功率：例如本例中可在 $t\in[80,160]$ 时选择 $P_t=25$ dBm，其余时段选择 $P_t=28$ dBm。

图 12(b) 给出不同调制深度（0.2、0.4、0.6）下的吞吐性能，卫星发射功率设为 23 dBm。正如预期，$\delta=0.4$ 时的系统性能高于 $\delta=0.2$，因为调制深度越大 Bob 处的 QBER 越低；然而在 $[70,170]$ 区间内 $\delta=0.6$ 的系统性能低于 $\delta=0.4$。这是因为 Eve 处的平均 QBER 也随之改善，从而增加 Eve 通过量子信道可获得的信息量 $I_E$。利用该图，Alice 可在整个卫星过境期间调整调制深度以优化系统性能：特别地，当 $t\in[70,170]$ 时调制深度应设为 0.4，否则应设为 $\delta=0.6$。

最后，我们考察 DT 尺度系数取不同值（1.5、2、3）时系统性能，如图 12(c) 所示。可以观察到 $\zeta=2$ 时的吞吐性能高于 $\zeta=1.5$，这是因为 Bob 的平均 QBER 得到改善，从而提升 SKT。然而设置较高的 $\zeta$ 值可能导致量子阶段持续更久：Bob 收集一个筛选块需要更长时间，形成性能瓶颈。例如当 $\zeta=3$ 时，在 $[100,140]$ 区间系统性能相对 $\zeta=2$ 退化。利用该结果，Bob 可选择适当的 DT 尺度系数以最大化系统性能：本例中 $t\in[100,140]$ 时取 $\zeta=2$，其余时段取 $\zeta=3$。

**图 12：** 卫星过境期间吞吐性能：(a) 不同 LEO 发射功率 $P_t$；(b) 不同调制深度 $\delta$；(c) 不同 DT 尺度系数 $\zeta$。（来源：原文第 13 页。）

## VII. 结论

本文提出了一种用于卫星 FSO/QKD 系统、基于原图 RC-LDPC 码族与基于伴随式错误估计的盲协商协议。我们在计入 FSO 链路上主要不利因素与不完美错误估计的情况下，从 SKT 方面对所提设计性能进行了分析研究，并通过 Monte Carlo 仿真验证了解析框架的正确性。由数值结果，我们得到如下若干发现与设计准则：

1. 所提设计在 SKT 方面优于传统盲协商，尤其当公开信道数据率与码成员数量较高时；代价是额外的错误估计步骤带来复杂度上升。
2. 我们研究了公开信道数据率与不完美错误估计对系统性能的影响，并讨论了不同 CLWC 取值下公开信道数据率的选择。
3. 通过在不同时段合理选择发射功率、调制深度或 DT 尺度系数，可优化所提系统在卫星过境期间的性能。

未来工作将研究所提方法的实际可行性，其中协议正利用 LEO 到地面光链路的实验数据进行验证，初步工作见 [45]。

## 附录

### A. RC-LDPC 码族设计示例

本节给出使用码扩展方法设计码率为 $\{0.9,0.85,\cdots,0.55,0.5\}$ 的 RC-LDPC 码族的示例。为此，我们从母码的原型矩阵出发，逐步扩展以获得每个码成员的原型矩阵。在每一步扩展中，扩展部分通过在所有满足错误平层约束 [46] 的候选中穷举搜索译码阈值最低者确定；设计过程的详细步骤见 [21]。

在我们的示例中，首先构造最高码率（0.9）的原型矩阵，其尺寸选为两行二十列。考虑基矩阵尺寸与线性最小距离增长性质，R4JA 码族 [39] 是合适的起点。随后对码率 1/2 的 R4JA 码应用延长方法以构造所需原型矩阵 [46]。经若干步延长后，得到基矩阵

$$
B_{9/10}=\begin{bmatrix}1&1&1&3&1&2&1&3&1&1&3&1&1&1&3&1&1&1&3&1\\1&2&2&1&2&1&3&1&2&2&1&2&2&2&1&2&2&2&1&3\end{bmatrix}.\tag{31}
$$

为构造下一个码率，我们通过添加一行扩展原型矩阵并穷举搜索最优码。每向基矩阵添加一行，码率为 $\frac{20-(n_{\mathrm{add}}+2)}{20}$，其中 $n_{\mathrm{add}}$ 为所添加行数。我们通过约束第一列可能取值为 $\{0\}$、其他列取值为 $\{0,1\}$ 来简化搜索过程。经若干步扩展与搜索后，得到码率 1/2 的原型矩阵

$$
B_{1/2}=\begin{bmatrix}1&1&1&3&1&2&1&3&1&1&3&1&1&1&3&1&1&1&3&1\\1&2&2&1&2&1&3&1&2&2&1&2&2&2&1&2&2&2&1&3\\0&0&0&1&0&1&1&1&0&0&1&0&0&0&1&0&1&1&1&1\\0&0&0&1&0&1&1&1&0&0&1&0&0&0&1&1&1&1&1&1\\0&0&0&0&0&1&1&1&0&0&1&0&1&1&1&0&1&1&1&1\\0&0&0&0&0&0&0&0&0&0&1&1&0&1&1&0&1&1&1&1\\0&0&0&0&0&0&0&0&0&1&1&0&0&0&1&0&1&1&1&1\\0&0&0&0&0&0&0&0&1&0&1&0&0&0&1&0&1&1&1&1\\0&0&0&0&0&0&0&0&0&0&1&0&1&0&1&0&1&1&1&1\\0&0&0&0&1&0&0&0&0&0&0&0&0&0&0&0&1&1&1&1\end{bmatrix}.\tag{32}
$$

### B. 引理 1 的证明

关于平均筛选概率，其定义为 Bob 能按 §III-C 的 DT 检测规则检测到比特（"0" 或 "1"）的概率。筛选概率可计算为 [25]

$$
P_{\mathrm{sift}}=P_{A,B}(0,0)+P_{A,B}(0,1)+P_{A,B}(1,0)+P_{A,B}(1,1),\tag{33}
$$

其中 $P_{A,B}(a,b)$ 表示 Alice 发送比特 "a" 且 Bob 检测到比特 "b" 的联合概率（$a,b\in\{0,1\}$）。这些联合概率可给出为 [25]

$$
P_{A,B}(a,b)=P_A(a)\int_0^\infty Q\left[\frac{\Upsilon(a,b)}{\sigma_n}\right]f_{h_B}(h_B)\,\mathrm dh_B,\tag{34}
$$

其中 $P_A(a)=0.5$ 表示 Alice 发送比特 "a" 的概率，$\Upsilon(a,b)=(1-2b)i_a+(2b-1)d_b$，$i_a=(2a-1)\frac14\mathcal R\delta P_th_B$，$d_0$ 与 $d_1$ 为 §III-C 定义的 DT。把（7）代入（34），令变量替换 $h'_B=\frac{h_B}{h_cA_{\mathrm{mod}}}$，然后使用 Gauss-Laguerre 多项式近似，可得（14）中 $P_{\mathrm{sift}}$ 的数值表达。

至于 Eve 的错误概率，其定义为 Eve 检测到与 Alice 发送比特不同的比特的概率。因此可表示为 [25]

$$
p_e=P_{A,E}(0,1)+P_{A,E}(1,0),\tag{35}
$$

其中 $P_{A,E}(a,b)$ 表示 Alice 发送比特 "a" 且 Eve 检测到比特 "b" 的联合概率。由于 Eve 采用最优阈值 $d_{E,\mathrm{th}}=0$ 检测接收信号以最大化所获信息，该概率可计算为 [25]

$$
P_{A,E}(0,1)=P_{A,E}(1,0)=\frac12\int_0^\infty Q\left(\frac{\frac14\mathcal R\delta P_th_E}{\sigma_n}\right)f_{h_E}(h_E)\,\mathrm dh_E.\tag{36}
$$

类似地，把（8）代入（36），令变量替换 $h'_E=\frac{h_E}{h_cA_{\mathrm{mod}}}$，并利用 Gauss-Laguerre 多项式近似，可导出（15）中的数值表达。证毕。

### C. 引理 2 的证明

令 $\gamma$ 为 $[0,0.5]$ 范围内的任意值。对给定 $\rho$，估计值 $\hat\rho$ 小于 $\gamma$ 的概率为

$$
P(\hat\rho\le\gamma\mid\rho)=\Pr\left[\phi^{-1}(\hat\rho)\le\phi^{-1}(\gamma)\right]=\Pr\left[W\le\phi^{-1}(\gamma)\right],\tag{37}
$$

第一个变换成立是因为函数 $\phi(\cdot)$ 在区间 $[0,0.5]$ 上严格递增。令 $W$ 表示伴随式 $S$ 重量的随机变量，其概率质量函数（PMF）写为

$$
f_W(w;\rho,m)=\binom mw\phi^w(\rho)\left[1-\phi^w(\rho)\right]^{m-w},\tag{38}
$$

对 $0\le w\le m$。可见随机变量 $W$ 服从二项分布，即 $W\sim\mathrm{Binomial}(m,\phi(\rho))$。因此 $W$ 的 CDF 表示为 [47]

$$
F_W(k;\rho,m)=\Pr[W\le k]=I_{1-\phi(\rho)}(m-k,k+1),\tag{39}
$$

其中 $I_\cdot(\cdot,\cdot)$ 为正则化不完全 Beta 函数。结合（37）与（39）即得（27），证毕。

## 图注与表注

**图 1（原文第 2、3 页）：** 面向安全 IoV 应用的 LEO 卫星 FSO/QKD 系统与 QKD 协议框图。
**图 2（原文第 4 页）：** 所考虑系统的一个超帧示例（量子阶段经量子信道、后处理阶段经公开信道）。
**图 3（原文第 5 页）：** 基于 SIM/BPSK 与双阈值检测器的自由空间 CV-QKD 协议框图。
**图 4（原文第 6 页）：** 传统盲协商与所提设计的操作流程对比。
**图 5（原文第 7 页）：** 所提 RC-LDPC 码族及嵌套伴随向量的构造示意。
**图 6（原文第 7 页）：** 所选码率在不同比特翻转概率下的 FER 性能与码率确定阈值。
**图 7（原文第 10 页）：** 所考虑系统中低估与高估的示意。
**图 8（原文第 11 页）：** 不同 DT 尺度系数下筛选块 QBER 直方图与 EB 分布拟合曲线示例。
**图 9（原文第 12 页）：** SKT 随 CLWC 变化：(a) 不同块长 $n_{\mathrm{sift}}$；(b) 不同公开信道数据率 $R_b^{\mathrm{Pub}}$；(c) 不同最大码率数 $N_r$。
**图 10（原文第 12 页）：** 所提设计吞吐量对公开信道数据率（不同 CLWC）。
**图 11（原文第 12 页）：** 吞吐量对公开信道数据率（不同伴随位数 $m_d$，含完美估计基线）。
**图 12（原文第 13 页）：** 卫星过境期间吞吐性能：(a) 不同 $P_t$；(b) 不同 $\delta$；(c) 不同 $\zeta$。

**表注汇总：** 表 I（原文第 2 页）为相关工作贡献比较（✓ 表示已考虑；列为卫星 QKD 系统、实践如 Starlink 数据、盲协商、原图 LDPC 码、基于伴随式错误估计、吞吐量分析、不完美错误估计）；表 II（第 11 页）为不同 DT 尺度系数下四种概率分布（正态、对数正态、Weibull、指数化威布尔）的 GoF 与拟合参数。两表均已在正文中逐格转录并与 PDF 渲染（第 2、11 页）核对。

## 参考文献（英文原书目）

[1] SpeQtral Pte Ltd: SpeQtral, Securing Global Networks in the Quantum Era. Accessed: Oct. 17, 2024. [Online]. Available: https://speqtralquantum.com/
[2] Q4s. Accessed: Oct. 17, 2024. [Online]. Available: https://www.boeing.com/quantum
[3] T. Jennewein et al., "QEYSSat 2.0—white paper on satellite-based quantum communication missions in Canada," arXiv:2306.02481, 2023.
[4] V. Scarani, H. Bechmann-Pasquinucci, N. J. Cerf, M. Dušek, N. Lütkenhaus, and M. Peev, "The security of practical quantum key distribution," Rev. Modern Phys., vol. 81, no. 3, p. 1301, Sept. 2009.
[5] C.-Y. Lu, Y. Cao, C.-Z. Peng, and J.-W. Pan, "Micius quantum experiments in space," Rev. Modern Phys., vol. 94, no. 3, p. 035001, Jul. 2022.
[6] H. Takenaka, A. Carrasco-Casado, M. Fujiwara, M. Kitamura, M. Sasaki, and M. Toyoshima, "Satellite-to-ground quantum-limited communication using a 50-kg-class microsatellite," Nat. Photonics, vol. 11, no. 8, pp. 502–508, Jul. 2017.
[7] P. V. Trinh and S. Sugiura, "Quantum internet in the sky: Vision, challenges, solutions, and future directions," IEEE Commun. Mag., vol. 62, no. 10, pp. 62–68, Oct. 2024.
[8] G. Brassard and L. Salvail, "Secret-key reconciliation by public discussion," in Advances in Cryptology-Eurocrypt'93, 1993, pp. 410–423.
[9] X. Ai, R. Malaney, S. X. Ng, and L. Hanzo, "Short codes and entanglement-based quantum key distribution via satellite," in Proc. Sensor Signal Process. Defence Conf., Dec. 2017, pp. 1–5.
[10] X. Ai, R. Malaney, and S. X. Ng, "Quantum key reconciliation for satellite-based communications," in Proc. IEEE Global Commun. Conf. (GLOBECOM), 2018, pp. 1–6.
[11] ——, "A reconciliation strategy for real-time satellite-based QKD," IEEE Commun. Lett., vol. 24, no. 5, pp. 1062–1066, May 2020.
[12] J. Martinez Mateo, D. Elkouss Coronas, and V. Martín Ayuso, "Blind reconciliation," Quantum Inf. Comp., vol. 12, no. 9&10, pp. 791–812, May 2012.
[13] E. O. Kiktenko, A. S. Trushechkin, C. C. W. Lim, Y. V. Kurochkin, and A. K. Fedorov, "Symmetric blind information reconciliation for quantum key distribution," Phys. Rev. Appl., vol. 8, no. 4, p. 044017, Oct. 2017.
[14] Z. Liu, Z. Wu, and A. Huang, "Blind information reconciliation with variable step sizes for quantum key distribution," Sci. Rep., vol. 10, no. 1, p. 171, Jan. 2020.
[15] E. O. Kiktenko, A. O. Malyshev, and A. K. Fedorov, "Blind information reconciliation with polar codes for quantum key distribution," IEEE Commun. Lett., vol. 25, no. 1, pp. 79–83, Jan. 2021.
[16] H.-K. Mao, Y.-C. Qiao, and Q. Li, "High-efficient syndrome-based LDPC reconciliation for quantum key distribution," Entropy, vol. 23, no. 11, p. 1440, Nov. 2021.
[17] N. Borisov, I. Petrov, and A. Tayduganov, "Asymmetric adaptive LDPC-based information reconciliation for industrial quantum key distribution," Entropy, vol. 25, no. 1, p. 31, Dec. 2022.
[18] A. Tarable, R. P. Paganelli, and M. Ferrari, "Rateless protograph LDPC codes for quantum key distribution," IEEE Trans. Quantum Eng., Feb. 2024.
[19] E. O. Kiktenko, A. O. Malyshev, A. A. Bozhedarov, N. O. Pozhar, M. N. Anufriev, and A. K. Fedorov, "Error estimation at the information reconciliation stage of quantum key distribution," J. Russ. Laser Res., vol. 39, pp. 558–567, Nov. 2018.
[20] C. Gao, D. Jiang, Y. Guo, and L. Chen, "Multi-matrix error estimation and reconciliation for quantum key distribution," Opt. Express, vol. 27, no. 10, pp. 14 545–14 566, May 2019.
[21] C. T. Nguyen, H. D. Le, V. V. Mai, P. V. Trinh, and A. T. Pham, "Blind reconciliation with protograph LDPC code extension for FSO-based satellite QKD systems," in Proc. Int. Symp. Commun. Syst. Netw. Digit. Signal Process. (CSNDSP), Jul. 2024, pp. 17–22.
[22] I. Capraro et al., "Impact of turbulence in long range quantum and classical communications," Phys. Rev. Lett., vol. 109, no. 20, p. 200502, Nov. 2012.
[23] R. Wolf, Quantum Key Distribution: An Introduction With Exercises. Berlin, Germany: Springer, 2021.
[24] E. Kiktenko, A. Trushechkin, Y. Kurochkin, and A. Fedorov, "Post-processing procedure for industrial quantum key distribution systems," in J. Phys. Conf. Ser., vol. 741, no. 1. IOP Publishing, 2016, p. 012081.
[25] P. V. Trinh, T. V. Pham, N. T. Dang, H. V. Nguyen, S. X. Ng, and A. T. Pham, "Design and security analysis of quantum key distribution protocol over free-space optics using dual-threshold direct-detection receiver," IEEE Access, vol. 6, pp. 4159–4175, Jan. 2018.
[26] M. Almeida, D. Pereira, A. N. Pinto, and N. A. Silva, "Classical channel bandwidth requirements in continuous variable quantum key distribution systems," IET Quantum Commun., Jul. 2024.
[27] D. Li, P. Huang, Y. Zhou, Y. Li, and G. Zeng, "Memory-saving implementation of high-speed privacy amplification algorithm for continuous-variable quantum key distribution," IEEE Photonics J., vol. 10, no. 5, pp. 1–12, Oct. 2018.
[28] M. Milicevic, C. Feng, L. M. Zhang, and P. G. Gulak, "Key reconciliation with low-density parity-check codes for long-distance quantum cryptography," arXiv:1702.07740, 2017.
[29] H. D. Le, H. D. Nguyen, C. T. Nguyen, and A. T. Pham, "FSO-based space-air-ground integrated vehicular networks: Cooperative HARQ with rate adaptation," IEEE Trans. Aerosp. Electron. Syst., vol. 59, no. 4, pp. 4076–4091, Aug. 2023.
[30] A. Leverrier, F. Groisshans, and P. Grangier, "Finite-size analysis of a continuous-variable quantum key distribution," Phys. Rev. A, vol. 81, no. 6, p. 062343, Jun. 2010.
[31] C. T. Nguyen, H. D. Le, C. T. Nguyen, and A. T. Pham, "Toward practical HARQ-based RC-LDPC design for optical satellite-assisted vehicular networks," IEEE Trans. Aerosp. Electron. Syst., vol. 60, no. 6, pp. 8619–8634, Dec. 2024.
[32] Z. Ghassemlooy, W. Popoola, and S. Rajbhandari, Optical wireless communications: system and channel modelling with MATLAB®, 1st ed. Boca Raton, FL, USA: CRC press, 2019.
[33] L. C. Andrews and R. L. Phillips, Laser beam propagation through random media. Washington, USA: SPIE Press, 2005.
[34] A. A. Farid and S. Hranilovic, "Outage capacity optimization for free-space optical links with pointing errors," IEEE/OSA J. Lightwave Technol., vol. 25, no. 7, pp. 1702–1710, July 2007.
[35] R. Boluda-Ruiz, A. García-Zambrana, C. Castillo-Vázquez, and B. Castillo-Vázquez, "Novel approximation of misalignment fading modeled by Beckmann distribution on free-space optical links," OSA Opt. Exp., vol. 24, no. 20, pp. 22 635–22 649, Oct. 2016.
[36] P. V. Trinh, A. Carrasco-Casado, A. T. Pham, and M. Toyoshima, "Secrecy analysis of FSO systems considering misalignments and eavesdropper's location," IEEE Trans. Commun., vol. 68, no. 12, pp. 7810–7823, Dec. 2020.
[37] H. G. Sandalidis, N. D. Chatzidiamantis, and G. K. Karagiannidis, "A tractable model for turbulence-and misalignment-induced fading in optical wireless systems," IEEE Communications Letters, vol. 20, no. 9, pp. 1904–1907, 2016.
[38] G. Lechner and C. Pacher, "Estimating channel parameters from the syndrome of a linear code," IEEE Commun. Lett., vol. 17, no. 11, pp. 2148–2151, Nov. 2013.
[39] D. Divsalar, S. Dolinar, C. R. Jones, and K. Andrews, "Capacity-approaching protograph codes," IEEE J. Sel. Areas Commun., vol. 27, no. 6, pp. 876–888, Aug. 2009.
[40] A. D. Liveris, Z. Xiong, and C. N. Georghiades, "Compression of binary sources with side information at the decoder using LDPC codes," IEEE Commun. Lett., vol. 6, no. 10, pp. 440–442, Oct. 2002.
[41] R. Barrios and F. Dios, "Exponentiated Weibull model for the irradiance probability density function of a laser beam propagating through atmospheric turbulence," Opt. Laser Technol., vol. 45, pp. 13–20, Feb. 2013.
[42] M. Abramowitz and I. A. Stegun, Handbook of Mathematical Functions: With Formulas, Graphs, and Mathematical Tables, 10th ed. New York, NY, USA: Dover, 1972.
[43] H. D. Le, T. V. Nguyen, and A. T. Pham, "Cloud attenuation statistical model for satellite-based FSO communications," IEEE Antennas Wireless Propag. Lett., vol. 20, no. 5, pp. 643–647, May 2021.
[44] "CelesTrak". Accessed: Jan. 16, 2024. [Online]. Available: https://celestrak.org/
[45] C. T. Nguyen, H. D. Le, D. R. Kolev, C.-C. Alberto, K.-o. Toshihiro, H. Tsuji, M. Toyoshima, and A. T. Pham, "Investigation of fade mitigation methods on experimental FSO LEO-to-Ground links," in Proc. IEEE Int. Conf. Space Opt. Syst. Appl. (ICSOS), Oct. 2025.
[46] T. Van Nguyen, A. Nosratinia, and D. Divsalar, "The design of rate-compatible protograph LDPC codes," IEEE Trans. Commun., vol. 60, no. 10, pp. 2841–2850, Oct. 2012.
[47] G. P. Wadsworth and J. G. Bryan, Introduction to probability and random variables. McGraw-Hill New York, 1960, vol. 7.

**本页范围与校对状态：** 本页覆盖 arXiv:2609.25646v1（cs.NI，2026 年 9 月 22 日）全文 16 页：摘要、第 I—VII 节、附录 A（RC-LDPC 码族设计示例）、附录 B（引理 1 证明）、附录 C（引理 2 证明）、图 1—12 图注、表 I—II、式（1）—（39）、参考文献 [1]—[47]（英文原条目）。表格核对：用 `render.py` 渲染 PDF 第 2、11 页并逐格核对表 I（相关工作贡献比较，含 [9]–[11]、[12]–[17]、[18]、[19]/[20]、[21] 与本文的 ✓ 分布）与表 II（$\zeta=1.5$—$3$ 四种分布的 GoF 与拟合参数，共 6 行 × 4 列）；同时核对 §VI-A 参数（$H_s=500$ km、$\xi=30^\circ$、$R_b^{\mathrm{FSO}}=R_b^{\mathrm{Pub}}=1$ Gbps、$\delta=0.2$、$\lambda=1.55$ µm、$N_b=100$、$\zeta=2.5$、$d_E=10$ m、$C_n^2(0)=10^{-14}$ m$^{-2/3}$、$t_{\mathrm{coh}}=1$ ms 等）与案例研究（STARLINK-1293、2021-12-23、CLWC 3 mg/m³）。原文 © 2026 IEEE，DOI 已照录；页首已列 4 处原文疑点（$R_b^{\mathrm{RF}}$/$R_b^{\mathrm{Pub}}$ 记号混用、表 II $\zeta=2.75$ 行正态参数异常、图 9 图例字符损坏、式（20）（21）中 $\chi$ 记号），均按原文照录并加注。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内曲线未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.25646v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}