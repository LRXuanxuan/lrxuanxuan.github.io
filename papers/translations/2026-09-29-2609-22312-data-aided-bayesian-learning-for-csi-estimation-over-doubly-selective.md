---
layout: page
title: "仿射预编码叠加训练序列下双选择性 DCO-OTFS MIMO VLC 信道的数助贝叶斯 CSI 估计｜中文全文译文"
permalink: /papers/translations/2026-09-29-2609-22312-data-aided-bayesian-learning-for-csi-estimation-over-doubly-selective/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/c6e694730f4aaecf/) · [原文 arXiv](https://arxiv.org/abs/2609.22312) · [全部目录](/papers/catalog/)

# 仿射预编码叠加训练序列下双选择性 DCO-OTFS MIMO VLC 信道的数助贝叶斯 CSI 估计

**原题：** Data-Aided Bayesian Learning for CSI Estimation over Doubly-Selective DCO-OTFS MIMO VLC Channels with Affine-Precoded Superimposed Training Sequences  
**作者：** Shubham Saxena（Graduate Student Member, IEEE）、Suraj Srivastava（Member, IEEE）、Aditya K. Jagannatham（Senior Member, IEEE）、Lajos Hanzo（Life Fellow, IEEE）。单位：Shubham Saxena 与 Aditya K. Jagannatham 为印度理工学院坎普尔分校电气工程系，Kanpur-208016, India（{shubs20; adityaj}@iitk.ac.in）；Suraj Srivastava 为印度理工学院焦特布尔分校电气工程系，Rajasthan 342030, India（surajsri@iitj.ac.in）；L. Hanzo 为英国南安普顿大学电子与计算机科学学院，Southampton SO17 1BJ, U.K.（lh@ecs.soton.ac.uk）。  
**版本：** arXiv:2609.22312v1（eess.SP），2026 年 9 月 15 日提交，原文 13 页（IEEE 期刊投稿格式，含图 1–4、表 I、算法 1–2、公式 (1)–(81)、参考文献 37 条）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VII 节（含 I-A–C、II-A–C、V-A 等全部小节）、结论、全部图注（图 1–4）、表 I（逐格转录）、算法 1–2、公式 (1)–(81) 与 37 条参考文献英文原条目；原文无附录；逐句逐式终校未做。

## 摘要

本文针对循环前缀（CP）辅助的多输入多输出（MIMO）直流偏置正交时频空间（DCO-OTFS）可见光通信（VLC）链路，提出一种基于正交仿射预编码叠加训练序列（AP-STS）的框架，采用任意收发脉冲成形，在双选择性信道上传输。对每个发光二极管（LED），导频矩阵与数据矩阵在时延–多普勒（DD）域中联合进行仿射预编码并叠加；随后推导统一的端到端 DD 域输入–输出关系。在每个光电二极管（PD）处，利用正交预编码器分离导频分量与数据分量，从而抑制相互干扰。基于该模型，开发了由期望最大化（EM）驱动的 DD 域导频辅助贝叶斯学习（DD-PBL）方案来估计信道状态信息（CSI）；随后提出 DD 域数据辅助贝叶斯学习（DD-DBL）过程，借鉴判决引导信道估计的思想，把检测到的符号当作虚拟导频，以联合精化 CSI 并检测数据。所采用的线性最小均方误差（LMMSE）检测器显式考虑了实际估计误差造成的 CSI 不确定性。此外，本文针对所考虑的 MIMO DCO-OTFS VLC 设定推导了贝叶斯 Cramér–Rao 下界（BCRLB）。数值结果证实：相较近期基准方案，本文方案具有更优的归一化均方误差（NMSE）、更低的导频开销与更低的符号错误率（SER）。

**关键词：** 仿射预编码、贝叶斯学习（BL）、BCRLB、时延–多普勒域信道、光 OTFS、叠加训练序列、可见光通信。

## I. 引言

包括射频（RF）与微波链路在内的传统无线技术，长期以来为移动接入网络及相关无线系统提供泛在连接。然而，无线设备的快速普及与对更高数据速率的持续需求，加剧了人们对 RF 频谱拥塞的担忧。在此背景下，作为一种光无线通信（OWC）形式，可见光通信（VLC）已成为一种补充性无线范式：它利用基于发光二极管（LED）的发射机与光电二极管接收机进行数据传输 [1]–[3]。VLC 通过调制光强来传递信息，从而把宽泛的可见光频段（430 至 790 THz）作为一种基本未被充分利用的资源，用于高容量短距离链路。通过把二进制信息映射为光强变化，VLC 可以提供高吞吐、低电磁干扰、更高安全性与良好能效 [3]–[6]。它与室内照明基础设施的兼容性，加上无需 RF 许可，进一步增强了其实用价值，使 VLC 成为可靠、安全无线接入的有前景方案。

VLC 传播介质通常同时包含视距（LoS）与非视距（NLoS）分量：LoS 分量对应从 LED 到光电检测器（PD）的直接光路，NLoS 分量则由墙壁、物体与其他表面的反射产生。多径 VLC 传播已在 [2], [7]–[9] 中研究。[10] 进一步分析了高阶反射的影响，表明仅考虑有限次反射的信道模型对高速率 VLC 链路可能不足。类似地，[5] 考虑了同时包含 LoS 与 NLoS 分量的多径 VLC 模型。此类多径效应会使接收信号产生时间弥散，Lee et al. [11] 研究了相应的功率时延分布。由此产生的时延扩展会在室内 VLC 系统中造成符号间干扰（ISI）[12], [13]。为缓解 ISI，光正交频分复用（O-OFDM）作为一种面向 LED 基 VLC 的有效多载波调制技术被广泛研究，它提供高频谱效率同时缓解 ISI [9], [14]。此外，强度调制与直接检测（IM/DD）因其实现简单，常被用于 O-OFDM 接收 [9], [15]。

与此同时，正交时频空间（OTFS）调制在受双选择性信道影响的无线链路中，尤其在移动场景下，获得了显著关注 [16]。与可能受多普勒诱导载波间干扰（ICI）影响的正交频分复用（OFDM）不同，OTFS 在时延–多普勒（DD）网格上表示符号，从而提升对时频（TF）选择性的鲁棒性并支持更可靠的信道估计（CE）。尽管 DD 域处理会带来额外复杂度，OTFS 甚至在静态多径条件下也表现出持续优势 [17]。这些观察促使人们在 VLC 中采用光 OTFS（O-OTFS）[18], [19]，尤其在高数据率光无线链路中，多径弥散与时频选择性可能限制传统波形设计的有效性。在这类系统中，可达速率在很大程度上受信道状态信息（CSI）精度的影响。由于传统 CE 流程可能带来高导频开销，且在双选择性光环境中效果下降，近期研究聚焦于更高效的 CSI 获取策略。下面评述最相关的贡献。

### A. 文献综述

由于 VLC 采用 IM/DD，发射波形必须是实值且非负的，这要求对 OTFS 做细致的光域适配。Zhong et al. [18] 通过施加二维 Hermitian 对称性提出了直流偏置光 OTFS（DCO-OTFS），并证明相较直流偏置 O-OFDM（DCO-OFDM），其误比特率（BER）更低、峰均功率比（PAPR）更小。Zheng et al. [19] 把 DCO-OTFS 引入全双工中继辅助的 VLC 架构，并报告相较 DCO-OFDM 可减少循环前缀（CP）开销，从而提升频谱效率。为应对前端非理想性，Sharma et al. [20] 提出一种基于随机傅里叶特征的无超参数接收机，以缓解 O-OTFS VLC 链路中 LED 的非线性。[21] 为静态室内双 LED VLC 场景设计了 O-OTFS 调制；相关研究 [22] 进一步在静态室内四 LED VLC 配置中研究了 O-OTFS。[21], [22] 均报告 O-OTFS 相较 O-OFDM 具有更优性能。此外，Xu et al. [4] 给出了强调带宽、功率与能量效率均优于 O-OFDM 的 O-OTFS 框架，并依赖 DD 域 CSI 估计。在相关方向上，Wang et al. [23] 利用离散 Zak 变换（DZT）导出通用的 DD 到时域（TD）转换表达式，随后在 DD 域表述了最大似然（ML）检测准则。更近期，Cai et al. [24] 为水下 VLC 提出功率与频谱高效的 O-OTFS 设计，而 Chen et al. [25] 研究了利用 DCO-OTFS 对抗衰落与多普勒效应的 IM/DD 卫星光链路。

可靠 CSI 获取在 VLC 中尤为重要，因为 LoS 与 NLoS 分量共同引起时延弥散，而移动性会引入多普勒扩展，形成同时挑战估计与检测的双选择性信道。对光 OFDM，Saxena et al. [15] 为频率选择性 DCO-OFDM 与非对称限幅光 OFDM（ACO-OFDM）VLC 模型开发了基于贝叶斯学习（BL）的 CSI 估计，相较经典估计器取得显著增益。在 OTFS-VLC 设定中，Liao et al. [26] 建立了导频观测与信道之间的 DD 域输入–输出关系，并提出依赖嵌入导频的 BL 估计器。尽管嵌入导频结构免去了专用导频帧，它们仍为导频与保护区域分配了大量资源，这促使人们采用带宽效率更高的训练机制，尤其对多输入多输出（MIMO）VLC 方案而言。

RF OTFS 文献为 DD 域建模与导频开销权衡提供了互补洞见。基于冲激的导频策略（包括其 MIMO 扩展）在各发射天线间分隔导频，以获得无干扰的 DD 观测；但它们通常需要较大的保护区域，并可能依赖经验调优的阈值，二者都会抬高开销并损害鲁棒性 [30]。嵌入导频与数据图案通过共享单个 OTFS 帧降低开销，但导频与保护结构的组合仍可能侵蚀吞吐 [16]。

为进一步提升训练效率，叠加训练序列（STS）辅助技术把导频直接嵌入数据 [27], [28], [31]。在 VLC 中，Estrada et al. [29] 研究了采用直接导频–数据叠加的多输入单输出（MISO）DCO-OFDM 系统的基于最小二乘（LS）的 CSI 估计。然而，直接叠加本质上会产生导频–数据相互干扰，其缓解常常依赖最大后验处理或基于消息传递的检测，同时需要信道质量阶或稀疏水平等先验信息，这可能并不实用 [27], [28]。仿射预编码叠加训练序列（AP-STS）提供了一种结构化的设计替代：通过施加正交仿射预编码器，使导频与数据分量在接收端经由代数投影分离，从而在所有信噪比下完全消除相互干扰。已有研究在 RF 设定中研究过仿射预编码 [32]；但多数现有表述针对时不变信道，并未直接处理双选择性运行。此外，它们忽略了 VLC 固有的 IM/DD 约束与光前端特性。作为补救，数据辅助处理可通过把检测到的数据符号视为可靠性加权的虚拟导频，并在 BL 框架内迭代精化 CSI，从而强化 AP-STS。

受上述知识空白驱动，本文为采用 AP-STS 信令的双选择性 DCO-OTFS MIMO VLC 系统提出面向 CSI 估计的数据辅助 BL 框架。所提方法利用与有限数量主导反射体相关的 DD 域稀疏性，在无需信道质量阶或稀疏水平先验统计知识的前提下提升估计精度。通过把正交仿射预编码带来的无干扰导频提取，与概率加权的数据辅助更新相结合，所提方法在降低归一化均方误差（NMSE）与符号错误率（SER）的同时，也降低了导频开销。此外，所提框架与经典稀疏恢复基线（包括正交匹配追踪（OMP）与 FOCal Underdetermined System Solver（FOCUSS）[15]）对比，并相对贝叶斯 Cramér–Rao 下界（BCRLB）进行评估。表 I 以加粗版式把本工作与代表性既有研究做对比，下一小节详述主要贡献。

**表 I：** 本工作与文献的对比（✓ 表示该文献具备相应特征）。

| 特征 | [3] | [4] | [15] | [18] | [19] | [20] | [22] | [23] | [24] | [25] | [26] | [27] | [28] | [29] | 本文 |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| O-OTFS | | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | | ✓ |
| STS | | | | | | | | | | | | ✓ | ✓ | ✓ | ✓ |
| MIMO VLC | ✓ | | | | | | ✓ | | | | | | | ✓ | ✓ |
| 数据辅助 CE | | | | | | | | | | | | ✓ | ✓ | | ✓ |
| 基于 BL 的 CE | | | ✓ | | | | | | | | ✓ | | | | ✓ |
| BCRLB | | | ✓ | | | | | | | | | | | | ✓ |
| 仿射预编码 | | | | | | | | | | | | | | | ✓ |
| 分数多普勒 | | | | | | | | | | | | | | | ✓ |
| 数据检测中的 CSI 不确定性 | | | | | | | | | | | | | | | ✓ |
| 基于 LMMSE 的修正检测准则 | | | | | | | | | | | | | | | ✓ |

### B. 主要贡献

1）针对采用任意收发脉冲成形的 CP 辅助 MIMO DCO-OTFS，建立了 AP-STS 信令模型。由于仿射预编码器的正交性，导频与数据分量可在接收端通过与相应预编码矩阵相乘以后乘的方式解耦，从而有效缓解导频–数据干扰。
2）针对 MIMO DCO-OTFS 提出了 DD 域导频辅助 BL 方法（DD-PBL），利用 DD 域稀疏性提升 CSI 估计保真度。所提由 EM 驱动的迭代超参数学习避免了人工参数调优，并表现出稳定收敛，进而支撑频谱效率的提升。
3）进一步提出了数据辅助的联合 CSI 估计与数据检测方案，记为 DD-DBL。该方法把修正的数据判决规则与 BL 框架耦合，联合进行 CE 与数据检测，相较仅用导频的方法获得更准确的 CSI。随后，表述了基于 LMMSE 的检测准则，它同时纳入估计的 CSI 与 CE 误差协方差，从而提升检测鲁棒性与可靠性。
4）推导了闭式 BCRLB，用于对 DD-PBL 与 DD-DBL 估计器做解析性能刻画。并以 NMSE、导频长度与 SER 为主要评估指标，在一系列工作条件下进一步验证其优势。

### C. 组织结构与记号

本文余下部分安排如下：第 II 节介绍数据辅助 AP-STS MIMO DCO-OTFS VLC 系统模型；第 III 节针对所考虑的 AP-STS MIMO DCO-OTFS VLC 框架建立稀疏 DD 域 CIR 估计表述；第 IV 节详述所提 CSI 估计方案 DD-PBL，随后给出数据辅助联合 CSI 估计与数据检测方法 DD-DBL 及相应的 MIMO DCO-OTFS VLC 系统 BCRLB 推导；第 VI 节报告仿真结果；第 VII 节给出结论。

**记号：** 记号约定如下：$\mathrm{blkmtx}(\mathbf A_1,\mathbf A_2,\dots,\mathbf A_N)$ 表示主对角线由矩阵 $\mathbf A_1,\mathbf A_2,\dots,\mathbf A_N$ 填充的块对角矩阵，其中各矩阵可以是矩形；上标 $(\cdot)^T$、$(\cdot)^H$、$(\cdot)^*$ 与 $(\cdot)^{-1}$ 分别表示转置、共轭转置、复共轭与矩阵求逆；$\otimes$ 与 $\mathrm{Tr}(\cdot)$ 分别表示 Kronecker 积与矩阵迹算子，$\|\cdot\|_2$ 与 $\|\cdot\|_F$ 分别表示欧氏范数与 Frobenius 范数；$\mathbb E\{\cdot\}$ 表示统计期望。全文中粗体小写与大写符号分别表示列向量与矩阵。向量化算子 $\mathrm{vec}(\mathbf A)$ 依次拼接 $\mathbf A$ 的各列形成列向量，其逆 $\mathrm{vec}^{-1}(\mathbf a)$ 重建相应矩阵。全文使用恒等式 $\mathrm{vec}(\mathbf{ABC})=\left(\mathbf C^T\otimes\mathbf A\right)\mathrm{vec}(\mathbf{B})$。

## II. 数据辅助 AP-STS MIMO DCO-OTFS VLC 系统模型

考虑一个 AP-STS MIMO DCO-OTFS VLC 系统，其帧时长为 $T_d=NT$、带宽为 $B=M\Delta f$，其中 $T$ 与 $\Delta f$ 分别表示符号周期与子载波间隔，且满足 $T\Delta f=1$。参数 $N$ 与 $M$ 分别指定 TF 网格在时间维与频率维上的符号数。相应的 DD 网格以采样间隔 $\Delta\nu=1/T_d$ 与 $\Delta\tau=1/B$ 离散化。MIMO 系统采用 $N_t$ 个发射 LED 与 $N_r$ 个接收 PD。

### A. 数据辅助 AP-STS MIMO DCO-OTFS 调制

对第 $t$ 个 LED（$1\le t\le N_t$），令 $N$ 为偶数，并定义独立多普勒索引集合 $\mathcal K_a=\{1,2,\dots,N/2-1\}$，$N_a=|\mathcal K_a|=N/2-1$。设数据符号矩阵与导频符号矩阵分别为 $\mathbf S^d_t\in\mathbb C^{M\times K_1}$ 与 $\mathbf S^p_t\in\mathbb C^{M\times K_2}$，通常满足 $K_1+K_2=N_a$。$\mathbf S^d_t$ 与 $\mathbf S^p_t$ 的元素均取自适当的星座，平均功率分别为 $\sigma_d^2$ 与 $\sigma_p^2$，即 $\mathbb E\{(\mathbf S^d_t)(\mathbf S^d_t)^H\}=\sigma_d^2K_1\mathbf I_M$，$\mathrm{Tr}\left((\mathbf S^p_t)(\mathbf S^p_t)^H\right)=\sigma_p^2MK_2$，从而 $\sigma_d^2+\sigma_p^2=\tfrac12$。在所提 AP-STS 系统中，数据与导频输入借助半正交发射预编码（TPC）矩阵 $\mathbf D\in\mathbb C^{N_a\times K_1}$ 与 $\mathbf P\in\mathbb C^{N_a\times K_2}$ 在独立多普勒 bin 上做仿射预编码，二者满足

$$
\mathbf P^H\mathbf P=\mathbf I_{K_2\times K_2},\quad
\mathbf D^H\mathbf D=\mathbf I_{K_1\times K_1},\quad
\mathbf P^H\mathbf D=\mathbf 0_{K_2\times K_1},\quad
\mathbf D^H\mathbf P=\mathbf 0_{K_1\times K_2}. \tag{1}
$$

有趣的是，此类 TPC 矩阵 $\mathbf P$ 与 $\mathbf D$ 可由任意酉矩阵 $\mathbf U\in\mathbb C^{N_a\times N_a}$ 方便地得到，即取 $\mathbf D=\mathbf U(:,1:K_1)$、$\mathbf P=\mathbf U(:,K_1+1:N_a)$。于是，为第 $t$ 个 LED 构造的 DD 域 AP-STS 信号表示为

$$
\mathbf S^{\rm dd}_{t,a}=\mathbf S^d_t\mathbf D^H+\mathbf S^p_t\mathbf P^H\in\mathbb C^{M\times N_a}. \tag{2}
$$

为获得 DCO 信令所需的实值时域（TD）波形，我们在长度为 $N$ 的完整 DD 网格上按构造施加多普勒域 Hermitian 对称性，即以 $\mathbf S^{\rm dd}_{t,a}$ 定义 $\mathbf S^{\rm dd}_t\in\mathbb C^{M\times N}$ 的元素。具体地，对每个时延索引 $l\in\{0,\dots,M-1\}$，

$$
\mathbf S^{\rm dd}_t(l,k)=
\begin{cases}
\mathbf S^{\rm dd}_{t,a}(l,k), & k=1,2,\dots,\tfrac{N}{2}-1,\\[2pt]
\left(\mathbf S^{\rm dd}_{t,a}(l,N-k)\right)^*, & k=\tfrac{N}{2}+1,\dots,N-1,\\[2pt]
0, & k=0,\tfrac{N}{2},
\end{cases} \tag{3}
$$

从而保证多普勒域 Hermitian 对称性。随后 DD 域符号经逆辛有限傅里叶变换（ISFFT）[4] 映射到 TF 域：

$$
\mathbf S^{\rm tf}_t(m,n)=\frac{1}{\sqrt{NM}}
\sum_{l=0}^{M-1}\sum_{k=0}^{N-1}
\mathbf S^{\rm dd}_t(l,k)\,e^{j2\pi\left(\frac{nk}{N}-\frac{ml}{M}\right)}, \tag{4}
$$

其中 $\mathbf S^{\rm tf}_t\in\mathbb C^{M\times N}$ 表示 TF 域符号矩阵。等价地，(4) 具有矩阵表示 $\mathbf S^{\rm tf}_t=\mathbf F_M\mathbf S^{\rm dd}_t\mathbf F_N^H$，其中 $\mathbf F_M$ 与 $\mathbf F_N$ 分别为 $M$ 与 $N$ 点酉离散傅里叶变换（DFT）矩阵：

$$
\mathbf S^{\rm tf}_t=\mathbf F_M\mathbf S^{\rm dd}_t\mathbf F_N^H. \tag{5}
$$

设 $p_{\rm tx}(t)$ 表示持续时间为 $T$ 的发射脉冲，则相应的 TD 符号矩阵由 Heisenberg 变换得到 [4], [19], [24]：

$$
\mathbf X_t=\mathbf P_{\rm tx}\mathbf F_M^H\mathbf S^{\rm tf}_t
=\mathbf P_{\rm tx}\mathbf S^{\rm dd}_t\mathbf F_N^H, \tag{6}
$$

其中 $\mathbf P_{\rm tx}=\mathrm{diag}\{p_{\rm tx}(pT/M)\}_{p=0}^{M-1}\in\mathbb R^{M\times M}$。在 (3) 的 Hermitian 对称性下，多普勒轴上的逆 DFT（IDFT）产生实值 TD 波形。具体地，定义 $\tilde\omega_N=e^{j2\pi/N}$，并记 $\tilde x_t[l,n]$ 为 $\mathbf S^{\rm dd}_t\mathbf F_N^H$ 的第 $(l,n)$ 个元素，有 [4], [19], [24]

$$
\begin{aligned}
\tilde x_t[l,n]
&=\frac{1}{\sqrt{N}}\sum_{k=0}^{N-1}\mathbf S^{\rm dd}_t(l,k)\tilde\omega_N^{nk}
=\frac{1}{\sqrt{N}}\sum_{k=1}^{\frac{N}{2}-1}
\left(\mathbf S^{\rm dd}_t(l,k)\tilde\omega_N^{nk}
+\mathbf S^{\rm dd}_t(l,N-k)\tilde\omega_N^{n(N-k)}\right)\\
&=\frac{1}{\sqrt{N}}\sum_{k=1}^{\frac{N}{2}-1}
\left(\mathbf S^{\rm dd}_t(l,k)\tilde\omega_N^{nk}
+\mathbf S^{\rm dd}_t(l,k)^*\tilde\omega_N^{-nk}\right)
=\frac{2}{\sqrt{N}}\Re\left\{
\sum_{k=1}^{\frac{N}{2}-1}\mathbf S^{\rm dd}_t(l,k)\tilde\omega_N^{nk}
\right\},
\end{aligned} \tag{7}
$$

这表明 $\mathbf S^{\rm dd}_t\mathbf F_N^H\in\mathbb R^{M\times N}$，进而因实对角加权 $\mathbf P_{\rm tx}$ 而有 $\mathbf X_t\in\mathbb R^{M\times N}$。随后，TD 符号矩阵 $\mathbf X_t$ 的每一列经并串（P/S）转换独立传送，并在每列上插入长度为 $L$ 的 CP。对 DCO-OTFS 信令，还需加入适当的直流（DC）偏置以保证非负光强；相关的偏置与限幅操作此处从略。下一小节给出在有限多普勒支撑（LDS）假设下的 DD 域 VLC 信道模型。

### B. 有限多普勒支撑（LDS）下的 DD 域 VLC 信道模型

设 $h_{r,t}(\tau,\nu)$ 表示第 $t$ 个 LED 与第 $r$ 个 PD（$1\le r\le N_r$）之间的 DD 域 VLC 信道。由于实际 VLC 环境中主导反射体数量有限，DD 域信道被建模为离散路径的稀疏叠加。此外，室内 VLC 中由有限移动性引起的多普勒扩展有限，故假定多普勒索引位于大小为 $N_\nu\ll N$ 的 LDS 集合 $\mathcal Q\triangleq\left\{-\frac{N_\nu-1}{2},-\frac{N_\nu-1}{2}+1,\dots,\frac{N_\nu-1}{2}\right\}$ 中。于是 DD 域信道表述为 [16], [17], [20]

$$
h_{r,t}(\tau,\nu)=\sum_{i=1}^{L_p}h_{i,r,t}\,\delta(\tau-\tau_i)\,\delta(\nu-\nu_i), \tag{8}
$$

其中 $h_{i,r,t}\in\mathbb R_+$ 表示 VLC 路径增益，$\tau_i$ 与 $\nu_i$ 为相应的时延与多普勒偏移，$L_p$ 表示主导多径分量总数，$\delta(\cdot)$ 为 Dirac delta 函数。如基于 OTFS 的欠扩展信道建模所常用 [16], [17]，可安全假定多径时延为时延分辨率的整数倍，即 $\tau_i=l_i\Delta\tau$，其中 $\Delta\tau=\frac{1}{M\Delta f}$；而多普勒偏移相对多普勒分辨率 $\Delta\nu=\frac{1}{NT}$ 一般可为分数。具体地，第 $i$ 条路径的多普勒偏移表示为 $\nu_i=\frac{k_i}{NT}=k_i\Delta\nu$，其中 $k_i=\mathrm{round}(k_i)+\kappa_i$，$|\kappa_i|<0.5$。这里 $k_i$ 是（可能为分数的）多普勒索引，$\mathrm{round}(k_i)\in\mathbb Z$ 为最近整数多普勒 bin 索引，$\kappa_i$ 表示分数多普勒偏移。在 LDS 假设下，多普勒索引的整数部分被约束为 $\mathrm{round}(k_i)\in\mathcal Q$。此外，对典型欠扩展信道，时延与多普勒索引满足 $l_i\ll M$ 且 $|k_i|\ll N$ [16], [17]。

由于反射 VLC 分量在更长时延上经历更高衰减，功率时延分布（PDP）被建模为随延迟 bin 指数衰减的函数 [15], [26]。于是第 $i$ 个抽头的幅度可表示为

$$
h_{i,r,t}=\frac{e^{-l_{i,r,t}\Delta\tau/\tau_{{\rm rms},r,t}}}
{\sum_{n=0}^{L_p-1}e^{-n\Delta\tau/\tau_{{\rm rms},r,t}}}, \tag{9}
$$

其中 $l_{i,r,t}\in\{0,1,\dots,L_p-1\}$ 为第 $i$ 条路径的延迟 bin 索引，$\tau_{{\rm rms},r,t}$ 表示信道的均方根（RMS）时延扩展 [15], [26]。典型地，$\tau_{{\rm rms},r,t}\in[0.5\Delta\tau,1.5\Delta\tau]$，其取值取决于平均表面反射率与房间几何 [15], [26]。

### C. 数据辅助 AP-STS MIMO DCO-OTFS 解调

设 $\mathbf x_{t,n}\in\mathbb R^{M\times 1}$（$0\le n\le N-1$）表示第 $t$ 个 LED 的 TD 符号矩阵 $\mathbf X_t$ 的第 $n$ 列，$\mathbf r_{r,n}\in\mathbb C^{M\times 1}$ 表示第 $r$ 个 PD 接收到的样本向量。$\mathbf r_{r,n}$ 的第 $p$ 个样本记为 $r_{r,n}(p)$（$0\le p\le M-1$），可表示为

$$
r_{r,n}(p)=\sum_{t=1}^{N_t}\sum_{i=1}^{L_p}
h_{i,r,t}\,e^{j2\pi\frac{k_i(p-l_i)}{MN}}\,
x_{t,n}\left([p-l_i]_M\right)+w_{r,n}(p), \tag{10}
$$

其中 $x_{t,n}(p)$ 表示向量 $\mathbf x_{t,n}$ 的第 $p$ 个元素，$w_{r,n}(p)$ 表示噪声样本。将 $\mathbf r_{r,n}$ 排列为 $\mathbf r_{r,n}=[r_{r,n}(0),r_{r,n}(1),\dots,r_{r,n}(M-1)]^T\in\mathbb C^{M\times 1}$，$\mathbf w_{r,n}$ 类似排列为 $\mathbf w_{r,n}=[w_{r,n}(0),\dots,w_{r,n}(M-1)]^T\in\mathbb C^{M\times 1}$。利用 (10)，接收信号向量 $\mathbf r_{r,n}$ 可写成

$$
\mathbf r_{r,n}=\sum_{t=1}^{N_t}\sum_{i=1}^{L_p}
h_{i,r,t}\left(\bar{\boldsymbol\Pi}\right)^{l_i}
\left(\bar{\boldsymbol\Delta}_{l_i,k_i}\right)\mathbf x_{t,n}
+\mathbf w_{r,n}
=\sum_{t=1}^{N_t}\bar{\mathbf H}_{r,t}\mathbf x_{t,n}+\mathbf w_{r,n}, \tag{11}
$$

其中矩阵 $\bar{\mathbf H}_{r,t}\in\mathbb C^{M\times M}$ 定义为 $\bar{\mathbf H}_{r,t}=\sum_{i=1}^{L_p}h_{i,r,t}\left(\bar{\boldsymbol\Pi}\right)^{l_i}\left(\bar{\boldsymbol\Delta}_{l_i,k_i}\right)$。这里 $\bar{\boldsymbol\Pi}$ 表示 $M$ 阶置换矩阵，$\bar{\boldsymbol\Delta}_{l_i,k_i}\in\mathbb C^{M\times M}$ 由下式给出 [33]：

$$
\bar{\boldsymbol\Delta}_{l_i,k_i}=
\begin{cases}
\mathrm{diag}\left\{1,\omega,\dots,\omega^{M-l_i-1},\omega^{-l_i},\dots,\omega^{-1}\right\}, & l_i\ne0,\\[2pt]
\mathrm{diag}\left\{1,\omega,\dots,\omega^{M-1}\right\}, & l_i=0,
\end{cases} \tag{12}
$$

其中 $\omega_i=e^{j2\pi\frac{k_i}{MN}}$。此外，把输出 $\mathbf r_{r,n}$（$0\le n\le N-1$）拼接为 $\mathbf R_r=[\mathbf r_{r,0},\mathbf r_{r,1},\dots,\mathbf r_{r,N-1}]\in\mathbb C^{M\times N}$，可得

$$
\mathbf R_r=\sum_{t=1}^{N_t}\bar{\mathbf H}_{r,t}\mathbf X_t+\mathbf W_r, \tag{13}
$$

其中 $\mathbf W_r=[\mathbf w_{r,0},\mathbf w_{r,1},\dots,\mathbf w_{r,N-1}]\in\mathbb C^{M\times N}$ 表示拼接的噪声矩阵。随后对 TD 样本矩阵 $\mathbf R_r$ 施加 DCO-OTFS 解调：DCO-OFDM 解调器先施加持续时间为 $T$ 的接收脉冲成形滤波器 $p_{\rm rx}(t)$，再对接收信号矩阵 $\mathbf R_r$ 的每一列执行 $M$ 点快速傅里叶变换（FFT），得到 TF 域解调符号矩阵 $\mathbf Y^{\rm tf}_r\in\mathbb C^{M\times N}$，即

$$
\mathbf Y^{\rm tf}_r=\mathbf F_M\mathbf P_{\rm rx}\mathbf R_r, \tag{14}
$$

其中 $\mathbf P_{\rm rx}=\mathrm{diag}\{p^*_{\rm rx}(pT/M)\}_{p=0}^{M-1}$。接着，对 DCO-OFDM 解调信号 $\mathbf Y^{\rm tf}_r$ 执行辛快速傅里叶变换（SFFT），得到 DD 域解调信号 $\mathbf Y^{\rm dd}_r\in\mathbb C^{M\times N}$：

$$
\mathbf Y^{\rm dd}_r=\mathbf F_M^H\mathbf Y^{\rm tf}_r\mathbf F_N=\mathbf P_{\rm rx}\mathbf R_r\mathbf F_N. \tag{15}
$$

最后，把 $\mathbf R_r$ 与 $\mathbf X_t$ 依次代入 $\mathbf Y^{\rm dd}_r$，得到 AP-STS MIMO DCO-OTFS 系统的简化 DD 域输入–输出关系：

$$
\mathbf Y^{\rm dd}_r=\sum_{t=1}^{N_t}\bar{\mathbf H}^{\rm dd}_{r,t}\mathbf S^{\rm dd}_t+\mathbf W^{\rm dd}_r, \tag{16}
$$

其中 $\bar{\mathbf H}^{\rm dd}_{r,t}=\mathbf P_{\rm rx}\bar{\mathbf H}_{r,t}\mathbf P_{\rm tx}\in\mathbb C^{M\times M}$，可进一步改写为

$$
\bar{\mathbf H}^{\rm dd}_{r,t}=\sum_{i=1}^{L_p}h_{i,r,t}\,\mathbf P_{\rm rx}
\left(\bar{\boldsymbol\Pi}\right)^{l_i}
\left(\bar{\boldsymbol\Delta}_{l_i}\right)^{k_i}\mathbf P_{\rm tx}, \tag{17}
$$

且 $\mathbf W^{\rm dd}_r=\mathbf P_{\rm rx}\mathbf W_r\mathbf F_N$。把所有 PD 对应的输出堆叠，得到输出 $\mathbf Y^{\rm dd}\in\mathbb C^{MN_r\times N}$：

$$
\mathbf Y^{\rm dd}=\left[(\mathbf Y^{\rm dd}_1)^T\ (\mathbf Y^{\rm dd}_2)^T\cdots(\mathbf Y^{\rm dd}_{N_r})^T\right]^T. \tag{18}
$$

于是输入–输出关系为

$$
\mathbf Y^{\rm dd}=\tilde{\mathbf H}^{\rm dd}\mathbf S^{\rm dd}+\mathbf W^{\rm dd}, \tag{19}
$$

其中 $\mathbf S^{\rm dd}=\left[(\mathbf S^{\rm dd}_1)^T\ (\mathbf S^{\rm dd}_2)^T\cdots(\mathbf S^{\rm dd}_{N_t})^T\right]^T\in\mathbb C^{MN_t\times N}$，$\mathbf W^{\rm dd}=\left[(\mathbf W^{\rm dd}_1)^T\cdots(\mathbf W^{\rm dd}_{N_r})^T\right]^T\in\mathbb C^{MN_r\times N}$，而 $\tilde{\mathbf H}^{\rm dd}\in\mathbb C^{MN_r\times MN_t}$ 表示 DD 域 MIMO DCO-OTFS 信道：

$$
\begin{aligned}
\tilde{\mathbf H}^{\rm dd}
&=\mathrm{blkmtx}\left\{\bar{\mathbf H}^{\rm dd}_{r,t}\right\}_{r=1,t=1}^{N_r,N_t}\\
&=\left(\mathbf I_{N_r}\otimes\mathbf P_{\rm rx}\right)
\left[\mathrm{blkmtx}\left\{\bar{\mathbf H}_{r,t}\right\}_{r=1,t=1}^{N_r,N_t}\right]
\left(\mathbf I_{N_t}\otimes\mathbf P_{\rm tx}\right).
\end{aligned} \tag{20}
$$

由于 AP-STS 预编码仅施加在独立多普勒 bin 上，数据–导频分离在相应的 DD 域输出列上进行。设 $\mathbf Y^{\rm dd}_{r,a}$ 表示 DD 域接收矩阵 $\mathbf Y^{\rm dd}_r$ 在独立多普勒 bin 上的受限版本，$\mathbf W^{\rm dd}_{r,a}$ 类似定义。利用 AP-STS 构造 $\mathbf S^{\rm dd}_{t,a}$，受限输入–输出关系变为

$$
\mathbf Y^{\rm dd}_{r,a}=\sum_{t=1}^{N_t}\bar{\mathbf H}^{\rm dd}_{r,t}\mathbf S^{\rm dd}_{t,a}+\mathbf W^{\rm dd}_{r,a}. \tag{21}
$$

把 (2) 中的 $\mathbf S^{\rm dd}_{t,a}$ 代入 (21) 得

$$
\mathbf Y^{\rm dd}_{r,a}=\sum_{t=1}^{N_t}\bar{\mathbf H}^{\rm dd}_{r,t}
\left(\mathbf S^d_t\mathbf D^H+\mathbf S^p_t\mathbf P^H\right)
+\mathbf W^{\rm dd}_{r,a}. \tag{22}
$$

利用 $\mathbf D$ 与 $\mathbf P$ 的半正交性，通过右乘 $\mathbf D$ 得到解耦的数据输出：

$$
\begin{aligned}
\mathbf Y^{\rm dd,d}_r
&=\mathbf Y^{\rm dd}_{r,a}\mathbf D
=\sum_{t=1}^{N_t}\bar{\mathbf H}^{\rm dd}_{r,t}
\left(\mathbf S^d_t\mathbf D^H\mathbf D+\mathbf S^p_t\mathbf P^H\mathbf D\right)
+\mathbf W^{\rm dd}_{r,a}\mathbf D\\
&=\sum_{t=1}^{N_t}\bar{\mathbf H}^{\rm dd}_{r,t}\mathbf S^d_t+\mathbf W^{\rm dd,d}_r,
\end{aligned} \tag{23}
$$

其中 $\mathbf W^{\rm dd,d}_r\triangleq\mathbf W^{\rm dd}_{r,a}\mathbf D$。(23) 的化简利用了 (1) 中的性质。进一步，把所有 PD 对应的输出堆叠，接收机输出 $\tilde{\mathbf Y}^{\rm dd,d}\in\mathbb C^{MN_r\times K_1}$ 表示为

$$
\tilde{\mathbf Y}^{\rm dd,d}=\left[(\mathbf Y^{\rm dd,d}_1)^T\ (\mathbf Y^{\rm dd,d}_2)^T\cdots(\mathbf Y^{\rm dd,d}_{N_r})^T\right]^T. \tag{24}
$$

解耦数据检测的系统模型为

$$
\tilde{\mathbf Y}^{\rm dd,d}=\tilde{\mathbf H}^{\rm dd}\tilde{\mathbf S}^d+\tilde{\mathbf W}^{\rm dd,d}, \tag{25}
$$

其中 $\tilde{\mathbf S}^d=\left[(\mathbf S^d_1)^T\ (\mathbf S^d_2)^T\cdots(\mathbf S^d_{N_t})^T\right]^T\in\mathbb C^{MN_t\times K_1}$，$\tilde{\mathbf W}^{\rm dd,d}=\left[(\mathbf W^{\rm dd,d}_1)^T\cdots(\mathbf W^{\rm dd,d}_{N_r})^T\right]^T\in\mathbb C^{MN_r\times K_1}$。再次，基于 LMMSE 的检测器可表述为

$$
\begin{aligned}
\tilde{\mathbf S}^d_{\rm LMMSE}
&=\left((\tilde{\mathbf H}^{\rm dd})^H\tilde{\mathbf R}^{-1}_{w_d}\tilde{\mathbf H}^{\rm dd}
+\frac{1}{\sigma_d^2}\mathbf I_{MN_t}\right)^{-1}\\
&\quad\times(\tilde{\mathbf H}^{\rm dd})^H\tilde{\mathbf R}^{-1}_{w_d}\tilde{\mathbf Y}^{\rm dd,d},
\end{aligned} \tag{26}
$$

其中 $\tilde{\mathbf R}_{w_d}=\left(\mathbf I_{N_r}\otimes\mathbf R_{w_d}\right)\in\mathbb C^{MN_r\times MN_r}$ 表示噪声协方差矩阵，$\mathbf R_{w_d}=\sigma^2\left(\mathbf P_{\rm rx}\mathbf P_{\rm rx}^H\right)\in\mathbb C^{M\times M}$，$\sigma^2$ 为噪声方差。检测到的符号最终按特定发射星座、用最近邻译码规则解调。

## III. AP-STS MIMO DCO-OTFS VLC 系统的稀疏 DD 域 CIR 估计模型

本节在 LDS 假设下为 AP-STS MIMO DCO-OTFS VLC 系统建立稀疏 CIR 估计模型。由于 AP-STS 预编码仅施加在独立多普勒 bin 上，导频辅助 CSI 估计使用受限到独立多普勒索引的 DD 域输出进行。设 $\mathbf Y^{\rm dd}_{r,a}\in\mathbb C^{M\times N_a}$ 表示第 $r$ 个 PD 在独立多普勒 bin 上的 DD 域接收矩阵，$\mathbf W^{\rm dd}_{r,a}\in\mathbb C^{M\times N_a}$ 类似定义。对 CSI 估计，导频输出 $\mathbf Y^{\rm dd,p}_r\in\mathbb C^{M\times K_2}$ 通过把 $\mathbf Y^{\rm dd}_{r,a}$ 右乘 TPC 矩阵 $\mathbf P$ 而解耦，即 $\mathbf Y^{\rm dd,p}_r=\mathbf Y^{\rm dd}_{r,a}\mathbf P$。利用受限的 DD 域输入–输出关系与 (1)，得

$$
\begin{aligned}
\mathbf Y^{\rm dd,p}_r
&=\mathbf Y^{\rm dd}_{r,a}\mathbf P
=\sum_{t=1}^{N_t}\bar{\mathbf H}^{\rm dd}_{r,t}
\left(\mathbf S^d_t\mathbf D^H\mathbf P+\mathbf S^p_t\mathbf P^H\mathbf P\right)
+\mathbf W^{\rm dd}_{r,a}\mathbf P\\
&=\sum_{t=1}^{N_t}\bar{\mathbf H}^{\rm dd}_{r,t}\mathbf S^p_t+\mathbf W^{\rm dd,p}_r,
\end{aligned} \tag{27}
$$

其中 $\mathbf W^{\rm dd,p}_r\triangleq\mathbf W^{\rm dd}_{r,a}\mathbf P\in\mathbb C^{M\times K_2}$。对 DD 域 MIMO DCO-OTFS VLC 信道，设最大时延扩展为 $M_\tau$，而多普勒支撑局限于集合 $\mathcal Q$，$N_\nu=|\mathcal Q|\ll N$。对欠扩展信道假设，信道参数满足 $l_{\max}=\max(l_i)<M_\tau\ll M$ 与 $k_{\max}=\max(k_j)<\frac{N_\nu-1}{2}\ll N$。为应对分数多普勒效应，考虑维数为 $M_\tau\times G_\nu$ 的细化多普勒网格，其中 $N_\nu=|\mathcal Q|\ll G_\nu$。在此表示中，第 $j$ 个多普勒网格点（$0\le j\le G_\nu-1$）对应多普勒偏移 $\nu_j=\frac{k_j}{NT}$ Hz，其中 $k_j=-\frac{N_\nu-1}{2}+j\frac{(N_\nu-1)}{(G_\nu-1)}$。设 $h_{i,j,r,t}$ 表示第 $r$ 个 PD 与第 $t$ 个 LED 之间、第 $i$ 个时延抽头与第 $j$ 个多普勒抽头的路径增益，即

$$
h_{r,t}(\tau,\nu)=\sum_{i=0}^{M_\tau-1}\sum_{j=0}^{G_\nu-1}
h_{i,j,r,t}\,\delta(\tau-\tau_i)\,\delta(\nu-\nu_j). \tag{28}
$$

把 $\bar{\mathbf H}^{\rm dd}_{r,t}$ 的表达式代入 (27) 并向量化，得

$$
\mathbf y^{\rm dd,p}_r=\sum_{t=1}^{N_t}\mathrm{vec}\left(
\mathbf P_{\rm rx}\left(\sum_{i=0}^{M_\tau-1}\sum_{j=0}^{G_\nu-1}
h_{i,j,r,t}(\bar{\boldsymbol\Pi})^i\bar{\boldsymbol\Delta}_{i,j}\right)
\mathbf P_{\rm tx}\mathbf S^p_t
\right)+\mathbf w^{\rm dd,p}_r, \tag{29}
$$

其中 $\mathbf y^{\rm dd,p}_r=\mathrm{vec}(\mathbf Y^{\rm dd}_{r,a}\mathbf P)\in\mathbb C^{MK_2\times1}$，$\mathbf w^{\rm dd,p}_r=\mathrm{vec}(\mathbf W^{\rm dd}_{r,a}\mathbf P)\in\mathbb C^{MK_2\times1}$，$\bar{\boldsymbol\Delta}_{i,j}\in\mathbb C^{M\times M}$ 表示如 [33] 所示的对角矩阵：

$$
\bar{\boldsymbol\Delta}_{i,j}=
\begin{cases}
\mathrm{diag}\left\{1,\bar\omega_j,\dots,\bar\omega_j^{M-i-1},\bar\omega_j^{-i},\dots,\bar\omega_j^{-1}\right\}, & i\ne0,\\[2pt]
\mathrm{diag}\left\{1,\bar\omega_j,\dots,\bar\omega_j^{M-1}\right\}, & i=0,
\end{cases} \tag{30}
$$

其中 $\bar\omega_j=e^{j2\pi\frac{k_j}{MN}}$。化简 (29) 得

$$
\mathbf y^{\rm dd,p}_r=\sum_{t=1}^{N_t}\sum_{i=0}^{M_\tau-1}\sum_{j=0}^{G_\nu-1}
\boldsymbol\omega^p_{i,j,t}h_{i,j,r,t}+\mathbf w^{\rm dd,p}_r, \tag{31}
$$

其中 $\boldsymbol\omega^p_{i,j,t}=\left(\mathbf I_{K_2}\otimes\mathbf P_{\rm rx}(\bar{\boldsymbol\Pi})^i(\bar{\boldsymbol\Delta}_{i,j})\mathbf P_{\rm tx}\right)\mathbf s^p_t\in\mathbb C^{MK_2\times1}$，$\mathbf s^p_t=\mathrm{vec}(\mathbf S^p_t)\in\mathbb C^{MK_2\times1}$。上述关系也可写成向量化形式

$$
\mathbf y^{\rm dd,p}_r=\sum_{t=1}^{N_t}\boldsymbol\Omega^p_t\mathbf h_{r,t}+\mathbf w^{\rm dd,p}_r, \tag{32}
$$

其中 $\mathbf y^{\rm dd,p}_r$ 表示第 $r$ 个 PD 处、对应全部 LED 的解耦导频观测向量，$\boldsymbol\Omega^p_t\in\mathbb C^{MK_2\times M_\tau G_\nu}$ 是第 $t$ 个 LED 的字典矩阵，即

$$
\boldsymbol\Omega^p_t=\left[\boldsymbol\omega^p_{0,0,t}\cdots\boldsymbol\omega^p_{0,G_\nu-1,t}\cdots\boldsymbol\omega^p_{M_\tau-1,0,t}\cdots\boldsymbol\omega^p_{M_\tau-1,G_\nu-1,t}\right],
$$

而 CIR 向量 $\mathbf h_{r,t}\in\mathbb R_+^{M_\tau G_\nu\times1}$ 为

$$
\mathbf h_{r,t}=\left[h_{0,0,r,t}\cdots h_{0,G_\nu-1,r,t}\cdots h_{M_\tau-1,0,r,t}\cdots h_{M_\tau-1,G_\nu-1,r,t}\right]^T. \tag{33}
$$

上述结果可表示为

$$
\mathbf y^{\rm dd,p}_r=\widetilde{\boldsymbol\Omega}^p\mathbf h_r+\mathbf w^{\rm dd,p}_r, \tag{34}
$$

其中字典矩阵为 $\widetilde{\boldsymbol\Omega}^p=[\boldsymbol\Omega^p_1,\boldsymbol\Omega^p_2,\dots,\boldsymbol\Omega^p_{N_t}]\in\mathbb C^{MK_2\times M_\tau G_\nu N_t}$，第 $r$ 个 PD 的信道系数向量为 $\mathbf h_r=[\mathbf h^T_{r,1},\mathbf h^T_{r,2},\dots,\mathbf h^T_{r,N_t}]^T\in\mathbb R_+^{M_\tau G_\nu N_t\times1}$。

利用 (34) 把所有 PD 对应的输出拼接，所得观测矩阵 $\mathbf y^{\rm dd,p}=[(\mathbf y^{\rm dd,p}_1)^T,(\mathbf y^{\rm dd,p}_2)^T,\dots,(\mathbf y^{\rm dd,p}_{N_r})^T]^T\in\mathbb C^{MK_2N_r\times1}$ 为

$$
\mathbf y^{\rm dd,p}=\boldsymbol\Omega^p\mathbf h+\mathbf w^p, \tag{35}
$$

其中跨全部 PD 的信道系数矩阵为 $\mathbf h=[\mathbf h^T_1,\mathbf h^T_2,\dots,\mathbf h^T_{N_r}]^T\in\mathbb R_+^{M_\tau G_\nu N_tN_r\times1}$，$\boldsymbol\Omega^p=\mathbf I_{N_r}\otimes\widetilde{\boldsymbol\Omega}^p\in\mathbb C^{MK_2N_r\times M_\tau G_\nu N_tN_r}$，相应噪声矩阵为 $\mathbf w^p=[(\mathbf w^{\rm dd,p}_1)^T,\dots,(\mathbf w^{\rm dd,p}_{N_r})^T]\in\mathbb C^{MK_2N_r\times1}$。对 (35) 所示模型，CSI 的常规 LMMSE 估计记为 $\hat{\mathbf h}_{\rm LMMSE}$，为

$$
\hat{\mathbf h}_{\rm LMMSE}
=\left((\boldsymbol\Omega^p)^H\mathbf R^{-1}_{w^p}\boldsymbol\Omega^p
+\mathbf R^{-1}_h\right)^{-1}(\boldsymbol\Omega^p)^H\mathbf R^{-1}_{w^p}\mathbf y^{\rm dd,p}, \tag{36}
$$

其中信道协方差矩阵 $\mathbf R_h=\mathbb E[\mathbf h\mathbf h^H]$ 未知，故设为 $\mathbf I_{M_\tau G_\nu N_tN_r}$；噪声协方差矩阵为 $\mathbf R_{w^p}=\sigma^2\left(\mathbf I_{N_r}\otimes\mathbf I_{K_2}\otimes\mathbf P_{\rm rx}\mathbf P_{\rm rx}^H\right)\in\mathbb C^{MK_2N_r\times MK_2N_r}$。此外，用常规 LMMSE 方法做 DD 域 CSI 估计的另一个显著缺点是它未利用 DD 域信道的稀疏特征，而利用稀疏性可显著提升性能。为克服这些缺点，我们为 MIMO DCO-OTFS VLC 系统构思了 DD 域导频辅助 BL（DD-PBL）流程，以增强稀疏 DD 域 CE，详见下一小节。

## IV. AP-STS MIMO DCO-OTFS VLC 系统的 DD 域导频辅助 BL（DD-PBL）

所提 DD-PBL 技术基于为稀疏多径 VLC CIR 向量 $\mathbf h$（未知）赋予参数化高斯先验 $f(\mathbf h;\boldsymbol\Upsilon)$。$\mathbf h$ 第 $k$ 个分量的先验方差由超参数 $\gamma_k$ 给出，$\boldsymbol\Upsilon=\mathrm{diag}\{\gamma_k\}_{k=1}^{M_\tau G_\nu N_tN_r}\in\mathbb R^{M_\tau G_\nu N_tN_r\times M_\tau G_\nu N_tN_r}$ 为相应的超参数矩阵。当超参数 $\gamma_k$ 趋于零时，等效信道分量 $h_k$ 也趋于零 [15], [34], [35]。因此，估计 VLC CIR 向量 $\mathbf h$ 等价于计算等效超参数向量 $\boldsymbol\gamma=[\gamma_1,\gamma_2,\dots,\gamma_{M_\tau G_\nu N_tN_r}]^T$。此外，似然函数 $f(\mathbf y^{\rm dd,p}|\mathbf h)$ 为

$$
\begin{aligned}
f(\mathbf y^{\rm dd,p}|\mathbf h)
&=(\pi)^{-MK_2N_r}\left(\det\left(\mathbf R_{w^p}\right)\right)^{-1}\\
&\quad\times\exp\left(-\left(\mathbf y^{\rm dd,p}-\boldsymbol\Omega^p\mathbf h\right)^H
\mathbf R^{-1}_{w^p}\left(\mathbf y^{\rm dd,p}-\boldsymbol\Omega^p\mathbf h\right)\right),
\end{aligned} \tag{37}
$$

其中 $\mathbf w^p\sim\mathcal{CN}(\mathbf 0,\mathbf R_{w^p})$ [15], [34], [35]。于是贝叶斯推断为

$$
\begin{aligned}
f(\mathbf y^{\rm dd,p};\boldsymbol\Upsilon)
&=\int f(\mathbf y^{\rm dd,p}|\mathbf h)f(\mathbf h;\boldsymbol\Upsilon)\,d\mathbf h
=(\pi)^{-MK_2N_r}\\
&\quad\times\left(\det(\boldsymbol\Sigma_{\mathbf y^{\rm dd,p}})\right)^{-1}
\exp\left(-(\mathbf y^{\rm dd,p})^H\boldsymbol\Sigma^{-1}_{\mathbf y^{\rm dd,p}}\mathbf y^{\rm dd,p}\right),
\end{aligned} \tag{38}
$$

其中输出 $\mathbf y^{\rm dd,p}$ 的协方差矩阵为

$$
\boldsymbol\Sigma_{\mathbf y^{\rm dd,p}}=\mathbf R_{w^p}+\boldsymbol\Omega^p\boldsymbol\Upsilon(\boldsymbol\Omega^p)^H\in\mathbb C^{MK_2N_r\times MK_2N_r}. \tag{39}
$$

超参数向量 $\boldsymbol\gamma$ 由最大似然（ML）估计得到，其优化目标确定为

$$
\log f(\mathbf y^{\rm dd,p};\boldsymbol\Upsilon)=-MK_2N_r\log(\pi)
-\log\left(\det\left(\boldsymbol\Sigma_{\mathbf y^{\rm dd,p}}\right)\right)
-(\mathbf y^{\rm dd,p})^H\boldsymbol\Sigma^{-1}_{\mathbf y^{\rm dd,p}}\mathbf y^{\rm dd,p}. \tag{40}
$$

(40) 的最大化因其非凹性并伴随多个局部极大而颇具挑战 [34], [35]。为此，采用 EM 算法迭代求解，保证优化目标增量式增长。该方法的稳健收敛，结合所提 DD-PBL 中特定的先验 $f(\mathbf h;\boldsymbol\Upsilon)$，提升了 MIMO DCO-OTFS VLC 系统的稀疏 CE 性能。第 $m$ 次迭代中第 $k$ 个超参数估计记为 $\hat\gamma^{(m)}_k$，$\hat{\boldsymbol\Upsilon}^{(m)}=\mathrm{diag}\{\hat\gamma^{(m)}_k\}_{k=1}^{M_\tau G_\nu N_tN_r}$ 为相应的估计超参数矩阵。同一次迭代中，期望步（E-step）利用完整数据集 $\{\mathbf y^{\rm dd,p},\mathbf h\}$ 计算对数似然 $L(\boldsymbol\Upsilon|\hat{\boldsymbol\Upsilon}^{(m)})$，即 [15], [34], [35]

$$
\begin{aligned}
L(\boldsymbol\Upsilon|\hat{\boldsymbol\Upsilon}^{(m)})
&=\mathbb E_{\mathbf h|\mathbf y^{\rm dd,p};\hat{\boldsymbol\Upsilon}^{(m)}}
\left\{\log f(\mathbf y^{\rm dd,p},\mathbf h;\boldsymbol\Upsilon)\right\}\\
&=\mathbb E_{\mathbf h|\mathbf y^{\rm dd,p};\hat{\boldsymbol\Upsilon}^{(m)}}
\left\{\log f(\mathbf h;\boldsymbol\Upsilon)+\log f(\mathbf y^{\rm dd,p}|\mathbf h)\right\}.
\end{aligned} \tag{41}
$$

由 (37) 可见 $f(\mathbf y^{\rm dd,p}|\mathbf h)$ 不依赖 $\boldsymbol\Upsilon$，因此 (41) 的第二项可略去，最大化步（M-step）通过优化关于 $\boldsymbol\gamma$ 的残差目标来精化超参数向量 $\hat{\boldsymbol\gamma}^{(m)}$ [15], [34], [35]：

$$
\begin{aligned}
\hat{\boldsymbol\gamma}^{(m)}
&=\arg\max_{\boldsymbol\gamma}\ \mathbb E_{\mathbf h|\mathbf y^{\rm dd,p};\hat{\boldsymbol\Upsilon}^{(m)}}
\left\{\log f(\mathbf h;\boldsymbol\Upsilon)\right\}\\
&=\arg\max_{\boldsymbol\gamma}\sum_{k=1}^{M_\tau G_\nu N_tN_r}
\left(-\frac{\mathbb E_{\mathbf h|\mathbf y^{\rm dd,p};\hat{\boldsymbol\Upsilon}^{(m)}}\{|h(k)|^2\}}{2\gamma_k}
-\frac{\log(2\pi\gamma_k)}{2}\right).
\end{aligned} \tag{42}
$$

(42) 中优化目标可整理为 $M_\tau G_\nu N_tN_r$ 个独立子问题，各对应特定超参数 $\gamma_k$。进一步，对 $\gamma_k$ 求导并令其为零，得到估计超参数

$$
\hat\gamma^{(m)}_k=\mathbb E_{\mathbf h|\mathbf y^{\rm dd,p};\hat{\boldsymbol\Upsilon}^{(m)}}\left\{|h(k)|^2\right\}
=\boldsymbol\Sigma^{(m)}_h(k,k)+\left|\boldsymbol\mu^{(m)}_h(k)\right|^2. \tag{43}
$$

多径 VLC CIR $\mathbf h$ 的后验概率密度函数推导如下 [15], [34], [35]：

$$
f(\mathbf h|\mathbf y^{\rm dd,p};\hat{\boldsymbol\Upsilon}^{(m)})\sim\mathcal{CN}
\left(\boldsymbol\mu^{(m)}_h,\boldsymbol\Sigma^{(m)}_h\right), \tag{44}
$$

其中 $\boldsymbol\mu^{(m)}_h=\boldsymbol\Sigma^{(m)}_h(\boldsymbol\Omega^p)^H\mathbf R^{-1}_{w^p}\mathbf y^{\rm dd,p}\in\mathbb C^{M_\tau G_\nu N_tN_r\times1}$ 为均值，协方差矩阵为 $\boldsymbol\Sigma^{(m)}_h=\left((\boldsymbol\Omega^p)^H\mathbf R^{-1}_{w^p}\boldsymbol\Omega^p+(\hat{\boldsymbol\Upsilon}^{(m)})^{-1}\right)^{-1}\in\mathbb C^{M_\tau G_\nu N_tN_r\times M_\tau G_\nu N_tN_r}$。于是收敛后，基于 BL 的方法给出 VLC 信道的稀疏 CSI 估计 $\hat{\mathbf h}_{\rm DD-PBL}=\boldsymbol\mu^{(m)}_h$。随后，估计值 $\hat h_{i,j,r,t}$ 由 $\hat h_{i,j,r,t}=\hat{\mathbf h}_{\rm DD-PBL}[(r-1)N_tM_\tau G_\nu+(t-1)M_\tau G_\nu+iG_\nu+j+1]$ 得到。与第 $r$ 个 PD 和第 $t$ 个 LED 对应的信道矩阵估计 $\hat{\mathbf H}^{\rm dd}_{r,t}$ 为

$$
\hat{\mathbf H}^{\rm dd}_{r,t}=\mathbf P_{\rm rx}
\left[\sum_{i=0}^{M_\tau-1}\sum_{j=0}^{G_\nu-1}
\hat h_{i,j,r,t}\left(\bar{\boldsymbol\Pi}\right)^i
\left(\bar{\boldsymbol\Delta}_i\right)^j\right]\mathbf P_{\rm tx}. \tag{45}
$$

随后，把 (45) 中估计的 CSI $\hat{\mathbf H}^{\rm dd}_{r,t}$ 用于 (26) 所定义的 LMMSE 检测器进行数据检测。注意上述 CSI 估计框架仅利用导频输出 $\mathbf y^{\rm dd,p}$ 做 CE。为进一步提升 CSI 估计，可以利用数据符号矩阵 $\mathbf S^{\rm dd}$ 的估计来迭代精化 CSI 估计 $\hat{\mathbf H}^{\rm dd}_{r,t}$。此外，CSI 估计中由后验协方差矩阵 $\boldsymbol\Sigma^{(m)}$ 刻画的不确定性可用于构造最优 LMMSE 检测器。这促使我们为 AP-STS MIMO DCO-OTFS VLC 系统开发数据辅助 CSI 估计框架，下一节予以描述。

**算法 1　基于 DD-PBL 的 MIMO DCO-OTFS VLC 系统稀疏 CSI 估计**

输入：接收导频向量 $\mathbf y^{\rm dd,p}$、字典矩阵 $\boldsymbol\Omega^p$、噪声协方差矩阵 $\mathbf R_{w^p}$、停止参数 $\epsilon$ 与 $m_{\max}$

输出：估计的堆叠 CSI 向量 $\hat{\mathbf h}_{\rm DD-PBL}$

1. 初始化：$\hat\gamma^{(0)}_k=1,\ \forall 1\le k\le M_\tau G_\nu N_tN_r$，$\hat{\boldsymbol\Upsilon}^{(0)}=\mathbf I_{M_\tau G_\nu N_tN_r}$；置计数器 $m=-1$，$\hat{\boldsymbol\Upsilon}^{(-1)}=\mathbf 0$
2. **while** $\left(\|\hat{\boldsymbol\gamma}^{(m+1)}-\hat{\boldsymbol\gamma}^{(m)}\|_2>\epsilon\ \&\&\ m<m_{\max}\right)$ **do**
3. 　$m\leftarrow m+1$
4. 　E-step：按下式计算后验协方差与均值
5. 　　$\boldsymbol\Sigma^{(m)}_h=\left((\boldsymbol\Omega^p)^H\mathbf R^{-1}_{w^p}\boldsymbol\Omega^p+(\hat{\boldsymbol\Upsilon}^{(m-1)})^{-1}\right)^{-1}$，$\boldsymbol\mu^{(m)}_h=\boldsymbol\Sigma^{(m)}_h(\boldsymbol\Omega^p)^H\mathbf R^{-1}_{w^p}\mathbf y^{\rm dd,p}$
6. 　M-step：更新超参数估计
7. 　**for** $k=1,2,\dots,M_\tau G_\nu N_tN_r$ **do**
8. 　　$\hat\gamma^{(m)}_k=\boldsymbol\Sigma^{(m)}_h(k,k)+|\boldsymbol\mu^{(m)}_h(k)|^2$
9. 　**end for**
10. **end while**
11. **return** $\hat{\mathbf h}_{\rm DD-PBL}=\boldsymbol\mu^{(m)}_h$

## V. AP-STS MIMO DCO-OTFS VLC 系统的数据辅助联合 CE 与数据检测

从 (23) 中的输出 $\mathbf Y^{\rm dd,d}_r$ 出发，把数据从 STS 中解耦，再代入 $\mathbf H^{\rm dd}_{r,t}$ 并向量化，所得表达式为

$$
\mathbf y^{\rm dd,d}_r=\sum_{t=1}^{N_t}\mathrm{vec}\left(
\sum_{i=0}^{M_\tau-1}\sum_{j=0}^{G_\nu-1}
\mathbf P_{\rm rx}h_{i,j,r,t}(\bar{\boldsymbol\Pi})^i(\bar{\boldsymbol\Delta}_{i,j})\mathbf P_{\rm tx}\mathbf S^d_t
\right)+\mathbf w^{\rm dd,d}_r, \tag{46}
$$

其中 $\mathbf y^{\rm dd,d}_r=\mathrm{vec}(\mathbf Y^{\rm dd,d}_r)\in\mathbb C^{MK_1\times1}$，$\mathbf w^{\rm dd,d}_r=\mathrm{vec}(\mathbf W^{\rm dd,d}_r)\in\mathbb C^{MK_1\times1}$。进一步化简 (46) 得

$$
\mathbf y^{\rm dd,d}_r=\sum_{t=1}^{N_t}\sum_{i=0}^{M_\tau-1}\sum_{j=0}^{G_\nu-1}
\boldsymbol\omega^d_{i,j,t}h_{i,j,r,t}+\mathbf w^{\rm dd,d}_r, \tag{47}
$$

其中 $\boldsymbol\omega^d_{i,j,t}=\left(\mathbf I_{K_1}\otimes\mathbf P_{\rm rx}(\bar{\boldsymbol\Pi})^i(\bar{\boldsymbol\Delta}_{i,j})\mathbf P_{\rm tx}\right)\mathbf s^d_t\in\mathbb C^{MK_1\times1}$。上述关系可写成紧凑形式

$$
\mathbf y^{\rm dd,d}_r=\sum_{t=1}^{N_t}\boldsymbol\Omega^d_t\mathbf h_{r,t}+\mathbf w^{\rm dd,d}_r, \tag{48}
$$

其中与第 $t$ 个 LED 对应的字典矩阵 $\boldsymbol\Omega^d_t\in\mathbb C^{MK_1\times M_\tau G_\nu}$ 为

$$
\boldsymbol\Omega^d_t=\left[\boldsymbol\omega^d_{0,0,t}\cdots\boldsymbol\omega^d_{0,G_\nu-1,t}\cdots\boldsymbol\omega^d_{M_\tau-1,0,t}\cdots\boldsymbol\omega^d_{M_\tau-1,G_\nu-1,t}\right].
$$

上述表达式可进一步化简为

$$
\mathbf y^{\rm dd,d}_r=\widetilde{\boldsymbol\Omega}^d\mathbf h_r+\mathbf w^{\rm dd,d}_r, \tag{49}
$$

其中 $\mathbf y^{\rm dd,d}_r$ 表示第 $r$ 个 PD 处、对应全部 LED 的解耦数据观测向量。此外，字典矩阵 $\widetilde{\boldsymbol\Omega}^d\in\mathbb C^{MK_1\times M_\tau G_\nu N_t}$ 为 $\widetilde{\boldsymbol\Omega}^d=[\boldsymbol\Omega^d_1,\boldsymbol\Omega^d_2,\dots,\boldsymbol\Omega^d_{N_t}]$，而对特定 $r$ 的 $\mathbf h_r$ 为 $\mathbf h_r=[\mathbf h^T_{r,1},\mathbf h^T_{r,2},\dots,\mathbf h^T_{r,N_t}]^T\in\mathbb R_+^{M_\tau G_\nu N_t\times1}$。把全部 PD 对应的输出向量 $\mathbf y^{\rm dd,d}_r$ 拼接后，所得观测矩阵 $\mathbf y^{\rm dd,d}=[(\mathbf y^{\rm dd,d}_1)^T,(\mathbf y^{\rm dd,d}_2)^T,\dots,(\mathbf y^{\rm dd,d}_{N_r})^T]^T\in\mathbb C^{MK_1N_r\times1}$ 可表述为

$$
\mathbf y^{\rm dd,d}=\boldsymbol\Omega^d\mathbf h+\mathbf w^d, \tag{50}
$$

其中 $\mathbf h=[\mathbf h^T_1,\mathbf h^T_2,\dots,\mathbf h^T_{N_r}]^T\in\mathbb R_+^{M_\tau G_\nu N_tN_r\times1}$，$\boldsymbol\Omega^d=\mathbf I_{N_r}\otimes\widetilde{\boldsymbol\Omega}^d\in\mathbb C^{MK_1N_r\times M_\tau G_\nu N_tN_r}$，$\mathbf w^d=[(\mathbf w^{\rm dd,d}_1)^T,\dots,(\mathbf w^{\rm dd,d}_{N_r})^T]^T\in\mathbb C^{MK_1N_r\times1}$。为进行基于数据辅助的 AP-STS MIMO-DCO-OTFS CSI 估计，可把 (35) 与 (50) 的输出堆叠，得到联合 CSI 估计与检测模型：

$$
\underbrace{\begin{bmatrix}\mathbf y^{\rm dd,d}\\[2pt]\mathbf y^{\rm dd,p}\end{bmatrix}}_{\mathbf y\in\mathbb C^{MN_aN_r\times1}}
=\underbrace{\begin{bmatrix}\boldsymbol\Omega^d\\[2pt]\boldsymbol\Omega^p\end{bmatrix}}_{\boldsymbol\Phi\in\mathbb C^{MN_aN_r\times M_\tau G_\nu N_tN_r}}\mathbf h
+\underbrace{\begin{bmatrix}\mathbf w^d\\[2pt]\mathbf w^p\end{bmatrix}}_{\mathbf v\in\mathbb C^{MN_aN_r\times1}}. \tag{51}
$$

于是，数据辅助 CSI 估计的紧凑模型为

$$
\mathbf y=\boldsymbol\Phi\mathbf h+\mathbf v, \tag{52}
$$

其中噪声向量 $\mathbf v$ 的协方差矩阵为 $\mathbf R_v=\mathrm{blkdiag}(\mathbf R_{w^d},\mathbf R_{w^p})\in\mathbb C^{MN_aN_r\times MN_aN_r}$。所提用于联合 CSI 估计与数据检测的 DD-DBL 技术如下进行。

对 DD-DBL 框架，为稀疏 DD 域 CSI $\mathbf h$ 赋予与 DD-PBL 框架类似的参数化高斯先验：

$$
p(\mathbf h;\boldsymbol\Upsilon)=\prod_{i=1}^{M_\tau G_\nu N_tN_r}
\frac{1}{\sqrt{2\pi\lambda_i}}
\exp\left(-\frac{|h(i)|^2}{2\lambda_i}\right). \tag{53}
$$

> **原文疑点：** 式 (53) 的高斯先验以 $\lambda_i$ 表示各分量的先验方差；但本框架其余部分（含式 (42)–(43)、(56)、(78)–(79)）统一使用超参数 $\gamma_i$ 并记 $\boldsymbol\Upsilon=\mathrm{diag}\{\gamma_i\}$，此处 $\lambda_i$ 与 $\gamma_i$ 疑为同一量的两种记号。本译按原文照录，未统一记号。

所提 DD-DBL 框架利用 EM 算法联合、迭代地估计超参数矩阵 $\boldsymbol\Upsilon$ 与数据符号矩阵 $\tilde{\mathbf S}^d$。此处完整信息集表示为 $\{\mathbf y,\mathbf h\}$，其中 $\mathbf h$ 为隐变量，$\mathbf y$ 为观测变量。设 $\{\tilde{\mathbf S}^d,\boldsymbol\Upsilon\}$ 表示未知参数集，并设 $\hat{\boldsymbol\eta}^{(m-1)}=\{\hat{\tilde{\mathbf S}}^{d,(m-1)},\hat{\boldsymbol\Upsilon}^{(m-1)}\}$，其中 $\hat{\tilde{\mathbf S}}^{d,(m-1)}$ 与 $\hat{\boldsymbol\Upsilon}^{(m-1)}$ 表示由第 $(m-1)$ 次 EM 迭代得到的数据符号矩阵 $\tilde{\mathbf S}^d$ 与超参数矩阵 $\boldsymbol\Upsilon$ 的估计。对当前第 $m$ 次迭代，E-step 计算完整数据集的对数似然函数 $L(\boldsymbol\eta|\hat{\boldsymbol\eta}^{(m-1)})$：

$$
\begin{aligned}
L(\boldsymbol\eta|\hat{\boldsymbol\eta}^{(m-1)})
&=\mathbb E_{\mathbf h|\mathbf y;\hat{\boldsymbol\eta}^{(m-1)}}
\left\{\log\left[f(\mathbf y,\mathbf h;\boldsymbol\eta)\right]\right\}\\
&=\mathbb E\left\{\log\left[f(\mathbf y|\mathbf h;\tilde{\mathbf S}^d)\right]\right\}
+\mathbb E\left\{\log\left[f(\mathbf h;\boldsymbol\Upsilon)\right]\right\}.
\end{aligned} \tag{54}
$$

在 M-step 中，所得对数似然 $L(\boldsymbol\eta|\hat{\boldsymbol\eta}^{(m-1)})$ 关于未知参数集 $\{\tilde{\mathbf S}^d,\boldsymbol\Upsilon\}$ 联合最大化。注意 (54) 中第一项 $\log[f(\mathbf y|\mathbf h;\tilde{\mathbf S}^d)]$ 只依赖数据矩阵 $\tilde{\mathbf S}^d$，第二项 $\log[f(\mathbf h;\boldsymbol\Upsilon)]$ 只依赖超参数矩阵 $\boldsymbol\Upsilon$。因此，$L(\boldsymbol\eta|\hat{\boldsymbol\eta}^{(m-1)})$ 关于 $\tilde{\mathbf S}^d$ 与 $\boldsymbol\Upsilon$ 的联合最大化退化为对第一、二项分别关于 $\tilde{\mathbf S}^d$ 与 $\boldsymbol\Upsilon$ 的两个独立最大化。超参数更新 $\hat\gamma^{(m)}_i$ 的 M-step 1 可表示为

$$
\hat\gamma^{(m)}_i=\arg\max_{\gamma_i\ge0}\ 
\mathbb E_{\mathbf h|\mathbf y;\hat{\boldsymbol\eta}^{(m-1)}}
\left\{\log\left[f(\mathbf h;\boldsymbol\Upsilon)\right]\right\}, \tag{55}
$$

其中 $1\le i\le M_\tau G_\nu N_tN_r$。与算法 1 的第 7 步类似，可化简为

$$
\hat\gamma^{(m)}_i=\boldsymbol\Sigma^{(m)}(i,i)+\left|\hat{\mathbf h}^{(m)}(i)\right|^2, \tag{56}
$$

其中后验均值向量 $\hat{\mathbf h}^{(m)}\in\mathbb C^{M_\tau G_\nu N_tN_r\times1}$ 与相应协方差矩阵 $\boldsymbol\Sigma^{(m)}\in\mathbb C^{M_\tau G_\nu N_tN_r\times M_\tau G_\nu N_tN_r}$ 确定为

$$
\hat{\mathbf h}^{(m)}=\boldsymbol\Sigma^{(m)}\left(\boldsymbol\Phi^{(m-1)}\right)^H\mathbf R^{-1}_v\mathbf y, \tag{57}
$$
$$
\boldsymbol\Sigma^{(m)}=\left[\left(\boldsymbol\Phi^{(m-1)}\right)^H\mathbf R^{-1}_v\boldsymbol\Phi^{(m-1)}
+\left(\hat{\boldsymbol\Upsilon}^{(m-1)}\right)^{-1}\right]^{-1}. \tag{58}
$$

这里 $\boldsymbol\Phi^{(m-1)}$ 由第 $(m-1)$ 次迭代的数据输入估计 $\hat{\tilde{\mathbf S}}^{d,(m-1)}$ 构造。随后，在 M-step 2 中，数据矩阵的更新 $\hat{\tilde{\mathbf S}}^{d,(m)}$ 为

$$
\hat{\tilde{\mathbf S}}^{d,(m)}=\arg\max_{\tilde{\mathbf S}^d}\ 
\mathbb E\left\{\log\left[f(\mathbf y^{\rm dd,d}|\mathbf h;\tilde{\mathbf S}^d)\right]\right\}, \tag{59}
$$

可进一步表述为

$$
\hat{\tilde{\mathbf S}}^{d,(m)}=\arg\min_{\tilde{\mathbf S}^d}\ 
\mathbb E\left\{\|\mathbf y^{\rm dd,d}-\boldsymbol\Phi^d\mathbf h\|_2^2\right\}
\equiv\arg\min_{\tilde{\mathbf S}^d}\ 
\mathbb E\left\{\|\tilde{\mathbf Y}^{\rm dd,d}-\tilde{\mathbf H}^{{\rm dd},(m)}\tilde{\mathbf S}^d\|_F^2\right\}. \tag{60}
$$

化简 (60) 中的代价函数，得到

$$
\begin{aligned}
&\mathbb E\left[\mathrm{Tr}\left\{(\tilde{\mathbf Y}^{\rm dd,d}-\tilde{\mathbf H}^{{\rm dd},(m)}\tilde{\mathbf S}^d)^H
(\tilde{\mathbf Y}^{\rm dd,d}-\tilde{\mathbf H}^{{\rm dd},(m)}\tilde{\mathbf S}^d)\right\}\right]\\
&=\mathrm{Tr}\Big\{(\tilde{\mathbf Y}^{\rm dd,d})^H(\tilde{\mathbf Y}^{\rm dd,d})
-(\tilde{\mathbf Y}^{\rm dd,d})^H\hat{\mathbf H}^{{\rm dd},(m)}\tilde{\mathbf S}^d
-(\tilde{\mathbf S}^d)^H(\hat{\mathbf H}^{{\rm dd},(m)})^H\tilde{\mathbf Y}^{\rm dd,d}\\
&\qquad+(\tilde{\mathbf S}^d)^H\mathbb E\left[(\tilde{\mathbf H}^{{\rm dd},(m)})^H(\tilde{\mathbf H}^{{\rm dd},(m)})\right]\tilde{\mathbf S}^d\Big\},
\end{aligned} \tag{61}
$$

其中 $\hat{\mathbf H}^{{\rm dd},(m)}$ 是第 $m$ 次迭代的 CSI 估计：

$$
\hat{\mathbf H}^{{\rm dd},(m)}=\mathbb E\left[\tilde{\mathbf H}^{{\rm dd},(m)}\right]
=\mathrm{blkmtx}\left\{\hat{\mathbf H}^{{\rm dd},(m)}_{r,t}\right\}_{r=1,t=1}^{N_r,N_t}, \tag{62}
$$

其中

$$
\hat{\mathbf H}^{\rm dd}_{r,t}=\mathbf P_{\rm rx}
\left[\sum_{i=0}^{M_\tau-1}\sum_{j=0}^{G_\nu-1}
\hat h_{i,j,r,t}\left(\bar{\boldsymbol\Pi}\right)^i
\left(\bar{\boldsymbol\Delta}_i\right)^j\right]\mathbf P_{\rm tx}.
$$

量 $\hat h_{i,j,r,t}$ 是 $h_{i,j,r,t}$ 在第 $m$ 次迭代的估计。量 $\mathbb E[(\tilde{\mathbf H}^{{\rm dd},(m)})^H(\tilde{\mathbf H}^{{\rm dd},(m)})]$ 可化简为

$$
\mathbb E\left[(\tilde{\mathbf H}^{{\rm dd},(m)})^H(\tilde{\mathbf H}^{{\rm dd},(m)})\right]
=\left(\hat{\mathbf H}^{{\rm dd},(m)}\right)^H\hat{\mathbf H}^{{\rm dd},(m)}
+\boldsymbol\Xi^{(m)}, \tag{63}
$$

其中 $\boldsymbol\Xi$ 表示 CE 不确定性，其计算如下。设 $\mathbf h^{\rm dd}_{r,t}\in\mathbb C^{M^2\times1}$ 表示与第 $r$ 个 PD 和第 $t$ 个 LED 对应的向量化等效信道，即

$$
\mathbf h^{\rm dd}_{r,t}=\mathrm{vec}\left(\mathbf H^{\rm dd}_{r,t}\right)
=\mathrm{vec}\left(\sum_{i,j}h_{i,j,r,t}\mathbf P_{\rm rx}(\bar{\boldsymbol\Pi})^i(\bar{\boldsymbol\Delta}_i)^j\mathbf P_{\rm tx}\right)
=\sum_{i=0}^{M_\tau-1}\sum_{j=0}^{G_\nu-1}h_{i,j,r,t}\boldsymbol\phi^j_i, \tag{64}
$$

其中 $\boldsymbol\phi^j_i=\mathrm{vec}\left[\mathbf P_{\rm rx}(\bar{\boldsymbol\Pi})^i(\bar{\boldsymbol\Delta}_i)^j\mathbf P_{\rm tx}\right]\in\mathbb C^{M^2\times1}$。上述方程可表示为 $\mathbf h^{\rm dd}_{r,t}=\boldsymbol\zeta\mathbf h_{r,t}$，其中 $\boldsymbol\zeta\in\mathbb C^{M^2\times M_\tau G_\nu}$ 表示为

$$
\boldsymbol\zeta=\left[\boldsymbol\phi^0_0,\dots,\boldsymbol\phi^{G_\nu-1}_0,\dots,
\boldsymbol\phi^0_{M_\tau-1},\dots,\boldsymbol\phi^{G_\nu-1}_{M_\tau-1}\right], \tag{65}
$$

而 $\mathbf h_{r,t}$ 是 (33) 给出的稀疏 CIR 向量。把 $\tilde{\mathbf H}^{\rm dd}$ 向量化，可得

$$
\begin{aligned}
\tilde{\mathbf h}^{\rm dd}
&=\mathrm{vec}(\tilde{\mathbf H}^{\rm dd})
=\left[(\mathrm{vec}(\mathbf H^{\rm dd}_{1,1}))^T\cdots(\mathrm{vec}(\mathbf H^{\rm dd}_{N_r,N_t}))^T\right]^T\\
&=\left[(\boldsymbol\zeta\mathbf h_{1,1})^T,(\boldsymbol\zeta\mathbf h_{1,2})^T,\dots,(\boldsymbol\zeta\mathbf h_{N_r,N_t})^T\right]^T\\
&=(\mathbf I_{N_rN_t}\otimes\boldsymbol\zeta)
\left[(\mathbf h_{1,1})^T,(\mathbf h_{1,2})^T,\dots,(\mathbf h_{N_r,N_t})^T\right]^T
=(\mathbf I_{N_rN_t}\otimes\boldsymbol\zeta)\tilde{\mathbf h}.
\end{aligned} \tag{66}
$$

$\tilde{\mathbf h}^{\rm dd}$ 的估计记为 $\hat{\tilde{\mathbf h}}^{\rm dd}=\mathrm{vec}(\hat{\tilde{\mathbf H}}^{\rm dd})$。设 $\tilde{\mathbf h}$ 的估计为 $\hat{\tilde{\mathbf h}}$，则 $\hat{\tilde{\mathbf h}}^{\rm dd}$ 与 $\hat{\tilde{\mathbf h}}$ 的关系为 $\hat{\tilde{\mathbf h}}^{\rm dd}=(\mathbf I_{N_rN_t}\otimes\boldsymbol\zeta)\hat{\tilde{\mathbf h}}$，相应误差协方差矩阵 $\boldsymbol\Sigma^{(m)}_h\in\mathbb C^{M^2N_rN_t\times M^2N_rN_t}$ 确定为

$$
\boldsymbol\Sigma^{(m)}_h=\left(\mathbf I_{N_rN_t}\otimes\boldsymbol\zeta\right)
\boldsymbol\Sigma^{(m)}\left(\mathbf I_{N_rN_t}\otimes\boldsymbol\zeta^H\right), \tag{67}
$$

其中 $\boldsymbol\Sigma^{(m)}$ 是由算法 2 的 E-step 得到的误差协方差矩阵。可以证明，对矩阵 $\boldsymbol\Xi$，其第 $(p,q)$ 个元素为

$$
\boldsymbol\Xi^{(m)}(p,q)=\mathrm{Tr}\left[
\boldsymbol\Sigma^{(m)}_h\left((p-1)MN_r+1:pMN_r,\ (q-1)MN_r+1:qMN_r\right)
\right], \tag{68}
$$

其中 $p,q\in\{1,2,\dots,MN_t\}$。据此，M-step 2 通过求解如下正则化迫零（ZF）问题来更新数据矩阵：

$$
\begin{aligned}
\hat{\tilde{\mathbf S}}^{d,(m)}
&=\arg\min_{\tilde{\mathbf S}^d}\left\{
\left\|\tilde{\mathbf Y}^{\rm dd,d}-\hat{\mathbf H}^{{\rm dd},(m)}\tilde{\mathbf S}^d\right\|_F^2
+\left\|\left(\boldsymbol\Xi^{(m)}\right)^{\frac12}\tilde{\mathbf S}^d\right\|_F^2\right\}\\
&=\arg\min_{\tilde{\mathbf S}^d}\left\{
\left\|\begin{bmatrix}\tilde{\mathbf Y}^{\rm dd,d}\\[2pt]\mathbf 0\end{bmatrix}
-\begin{bmatrix}\hat{\mathbf H}^{{\rm dd},(m)}\\[2pt]\left(\boldsymbol\Xi^{(m)}\right)^{\frac12}\end{bmatrix}
\tilde{\mathbf S}^d\right\|_F^2\right\}.
\end{aligned} \tag{69}
$$

注意上述检测规则等价于对数据矩阵 $\tilde{\mathbf S}^d$ 的 ZF 信号检测。进一步，简化后的基于 LMMSE 的数据检测规则表述为

$$
\begin{aligned}
\hat{\tilde{\mathbf S}}^{d,(m)}
&=\Big[\left(\hat{\mathbf H}^{{\rm dd},(m)}\right)^H\hat{\mathbf H}^{{\rm dd},(m)}
+\boldsymbol\Xi^{(m)}
+\frac{\sigma^2}{\sigma_d^2}\left(\hat{\mathbf H}^{{\rm dd},(m)}\right)^H\\
&\qquad\times\left(\mathbf I_{N_r}\otimes\mathbf P_{\rm rx}\mathbf P_{\rm rx}^H\right)^{-1}\hat{\mathbf H}^{{\rm dd},(m)}\Big]^{-1}
\left(\hat{\mathbf H}^{{\rm dd},(m)}\right)^H\tilde{\mathbf Y}^{\rm dd,d}.
\end{aligned} \tag{70}
$$

按本文采用的附加简化，检测器进一步化为

$$
\hat{\tilde{\mathbf S}}^{d,(m)}
=\left[\left(\hat{\mathbf H}^{{\rm dd},(m)}\right)^H\hat{\mathbf H}^{{\rm dd},(m)}
+\boldsymbol\Xi^{(m)}+\frac{\sigma^2}{\sigma_d^2}\mathbf I_{MN_t}\right]^{-1}
\left(\hat{\mathbf H}^{{\rm dd},(m)}\right)^H\tilde{\mathbf Y}^{\rm dd,d}. \tag{71}
$$

随后，用最近邻检测规则把上述矩阵中的每个元素映射为发射星座中的符号。如上所述的 E-step 与 M-step 迭代执行直至算法收敛。DD-DBL 框架的各个步骤汇总于算法 2。

**算法 2　基于 DD-DBL 的 MIMO DCO-OTFS VLC 系统稀疏 CSI 估计**

输入：观测向量 $\mathbf y$、字典矩阵 $\boldsymbol\Phi$、噪声协方差矩阵 $\mathbf R_v$、停止参数 $\epsilon$ 与 $m_{\max}$

输出：估计的 CSI 向量 $\hat{\mathbf h}_{\rm DD-DBL}=\boldsymbol\mu^{(m)}_h$ 与 $\hat{\tilde{\mathbf S}}_{\rm DD-DBL}=\hat{\tilde{\mathbf S}}^{d,(m)}$

1. 初始化：$\hat{\boldsymbol\Upsilon}^{(0)}=\hat{\boldsymbol\Upsilon}^{(m)}_{\rm DD-PBL}$，$\hat{\boldsymbol\Upsilon}^{(-1)}=\mathbf 0$，$m=-1$，$(\boldsymbol\Omega^d)^{(-1)}=(\hat{\boldsymbol\Omega}^d)_{\rm DD-DBL}$，且 $\boldsymbol\Phi^{(-1)}=\begin{bmatrix}(\boldsymbol\Omega^d)^{(-1)}\\ \boldsymbol\Omega^p\end{bmatrix}$
2. **while** $\left(\|\hat{\boldsymbol\gamma}^{(m+1)}-\hat{\boldsymbol\gamma}^{(m)}\|_2>\epsilon\ \&\&\ m<m_{\max}\right)$ **do**
3. 　$m\leftarrow m+1$
4. 　E-step：按下式计算后验协方差与均值
5. 　　$\boldsymbol\Sigma^{(m)}_h=\left((\boldsymbol\Phi^{(m-1)})^H\mathbf R^{-1}_v\boldsymbol\Phi^{(m-1)}+(\hat{\boldsymbol\Upsilon}^{(m-1)})^{-1}\right)^{-1}$，$\boldsymbol\mu^{(m)}_h=\boldsymbol\Sigma^{(m)}_h(\boldsymbol\Phi^{(m-1)})^H\mathbf R^{-1}_v\mathbf y$
6. 　M-step 1：按下式更新超参数估计
7. 　**for** $k=1,2,\dots,M_\tau G_\nu N_tN_r$ **do**
8. 　　$\hat\gamma^{(m)}_k=\boldsymbol\Sigma^{(m)}_h(k,k)+|\boldsymbol\mu^{(m)}_h(k)|^2$
9. 　**end for**
10. 　M-step 2：（1）用 (71) 更新数据估计 $\hat{\tilde{\mathbf S}}^{d,(m)}$；（2）对 $\hat{\tilde{\mathbf S}}^{d,(m)}$ 解调并用其更新 $\boldsymbol\Phi^{(m)}$
11. **end while**
12. **return** $\hat{\mathbf h}_{\rm DD-DBL}=\boldsymbol\mu^{(m)}_h$，$\hat{\tilde{\mathbf S}}_{\rm DD-DBL}=\hat{\tilde{\mathbf S}}^{d,(m)}$

### A. MIMO DCO-OTFS VLC 系统的 BCRLB

下面描述 BCRLB，用于刻画稀疏 CSI 向量 $\mathbf h$ 的任意无偏估计器可达均方误差（MSE）的基本下界。设 $\mathbf T_B\in\mathbb C^{M_\tau G_\nu N_tN_r\times M_\tau G_\nu N_tN_r}$ 表示与 $\mathbf h$ 相关联的贝叶斯 Fisher 信息矩阵（BFIM）。按标准贝叶斯估计论证，BFIM 可表示为

$$
\mathbf T_B=\mathbf T_D+\mathbf T_P, \tag{72}
$$

其中 $\mathbf T_D$ 是对应观测 $\mathbf y$ 的期望 Fisher 信息矩阵（FIM），$\mathbf T_P$ 表示信道先验贡献的先验 FIM。数据信息矩阵定义为

$$
\mathbf T_D=-\mathbb E_{\mathbf y,\mathbf h}
\left\{\frac{\partial^2\log f(\mathbf y|\mathbf h)}{\partial\mathbf h\partial\mathbf h^H}\right\}. \tag{73}
$$

由于 $\mathbf v\sim\mathcal{CN}(\mathbf 0,\mathbf R_v)$，条件似然为

$$
\begin{aligned}
f(\mathbf y|\mathbf h)&=(\pi)^{-MN_aN_r}\left(\det(\mathbf R_v)\right)^{-1}\\
&\quad\times\exp\left(-(\mathbf y-\boldsymbol\Phi\mathbf h)^H\mathbf R^{-1}_v(\mathbf y-\boldsymbol\Phi\mathbf h)\right).
\end{aligned} \tag{74}
$$

因此对数似然可写为

$$
L(\mathbf y|\mathbf h)=\log f(\mathbf y|\mathbf h)=C_1-(\mathbf y-\boldsymbol\Phi\mathbf h)^H\mathbf R^{-1}_v(\mathbf y-\boldsymbol\Phi\mathbf h), \tag{75}
$$

其中常数 $C_1=-MN_aN_r\log(\pi)-\log\left(\det(\mathbf R_v)\right)$ 与 $\mathbf h$ 无关。展开 (75) 中的二次项得

$$
L(\mathbf y|\mathbf h)=C_1-\mathbf y^H\mathbf R^{-1}_v\mathbf y
+\mathbf h^H\boldsymbol\Phi^H\mathbf R^{-1}_v\mathbf y
+\mathbf y^H\mathbf R^{-1}_v\boldsymbol\Phi\mathbf h
-\mathbf h^H\boldsymbol\Phi^H\mathbf R^{-1}_v\boldsymbol\Phi\mathbf h. \tag{76}
$$

把 (76) 代入 (73)，并注意到只有最后一项对 $\mathbf h$ 与 $\mathbf h^H$ 的二阶导数有贡献，得 $\mathbf T_D=\boldsymbol\Phi^H\mathbf R^{-1}_v\boldsymbol\Phi$。设稀疏 CSI 向量服从参数化高斯先验，则先验 FIM 定义为

$$
\mathbf T_P=-\mathbb E_{\mathbf h}
\left\{\frac{\partial^2\log f(\mathbf h)}{\partial\mathbf h\partial\mathbf h^H}\right\}. \tag{77}
$$

对数先验可表示为

$$
L(\mathbf h;\boldsymbol\Upsilon)=\log f(\mathbf h)=C_2-\mathbf h^H\boldsymbol\Upsilon^{-1}\mathbf h, \tag{78}
$$

其中 $C_2=-M_\tau G_\nu N_tN_r\log(\pi)-\log\left(\det(\boldsymbol\Upsilon)\right)$ 与 $\mathbf h$ 无关。把 (78) 代入 (77) 得 $\mathbf T_P=\boldsymbol\Upsilon^{-1}$。因此 BFIM 为

$$
\mathbf T_B=\boldsymbol\Upsilon^{-1}+\boldsymbol\Phi^H\mathbf R^{-1}_v\boldsymbol\Phi. \tag{79}
$$

相应地，任意无偏估计器 $\hat{\mathbf h}$ 的 MSE 的 BCRLB 成为

$$
\begin{aligned}
{\rm MSE}(\hat{\mathbf h})
&=\mathbb E\{\|\hat{\mathbf h}-\mathbf h\|_2^2\}\ge\mathrm{Tr}\left(\mathbf T_B^{-1}\right)\\
&=\mathrm{Tr}\left(\left(\boldsymbol\Upsilon^{-1}+\boldsymbol\Phi^H\mathbf R^{-1}_v\boldsymbol\Phi\right)^{-1}\right).
\end{aligned} \tag{80}
$$

此外，利用 DD 域关系，DD 域 CE $\hat{\tilde{\mathbf h}}^{\rm dd}$ 的 MSE 的 BCRLB 可表示为

$$
{\rm MSE}\left(\hat{\tilde{\mathbf h}}^{\rm dd}\right)
\ge\mathrm{Tr}\left\{(\mathbf I_{N_rN_t}\otimes\boldsymbol\zeta)\mathbf T_B^{-1}
(\mathbf I_{N_rN_t}\otimes\boldsymbol\zeta)^H\right\}. \tag{81}
$$

## VI. 仿真结果

本节针对 AP-STS MIMO DCO-OTFS VLC 系统中的 CSI 恢复，对本文所提 DD-PBL 与 DD-DBL 方法与现有 CIR 估计技术（即 FOCUSS、OMP 与 LMMSE [15]）做对比性能分析。评估以 SER、NMSE 与导频长度为关键性能指标；其中 SER 借助估计出的 CIR 量化接收端检测可靠性。仿真设置中取 $\mathbf R_h=\mathbf I_{M_\tau N_\nu N_tN_r}$，SNR（dB）定义为 ${\rm SNR\,(dB)}=10\log_{10}\left(1/\sigma^2\right)$。DD-PBL 与 DD-DBL 算法采用收敛参数 $\epsilon=10^{-6}$ 与 $m_{\max}=50$，而 OMP 阈值固定为 $\xi=0.1$。FOCUSS 配置采用噪声正则化因子 $\sigma^2$、$p=0.8$ 的 $\ell_p$ 范数，并施加 $10^{-5}$ 的终止准则与最多 800 次迭代。其余仿真参数为：$\Delta f=240$ kHz、$M=64$、$N=64$、$K_2=4$、$L=16$、$L_p=5$、$M_\tau=16$、$N_\nu=15$、$N_r=2$、$N_t=2$ 与 ${\rm BDC}=7$ dB。调制方案为二进制相移键控（BPSK），脉冲形状为矩形 [4], [15], [26]。

> **原文疑点：** 此处原文写作 $\mathbf R_h=\mathbf I_{M_\tau N_\nu N_tN_r}$，即用多普勒支撑大小 $N_\nu$ 作为维度因子；但由 (35)、(50) 与 (33)，稀疏 CIR 向量 $\mathbf h$ 的维度为 $M_\tau G_\nu N_tN_r$，且 (36) 中常规 LMMSE 也将 $\mathbf R_h$ 取为 $\mathbf I_{M_\tau G_\nu N_tN_r}$。疑为原文笔误（$N_\nu$ 应为 $G_\nu$），本译照录并加注，未作改动。

图 1(a) 把所提 DD-PBL 与 DD-DBL 估计器的 NMSE 性能与基准方案比较。NMSE 定义为

$$
{\rm NMSE}=\frac{\|\hat{\mathbf h}-\mathbf h\|_2^2}{\|\mathbf h\|_2^2}.
$$

由图 1(a) 可见，对 AP-STS MIMO DCO-OTFS VLC 系统，基于 BL 的 DD-PBL 与 DD-DBL 取得比 OMP、FOCUSS 与 LMMSE 更低的 NMSE。OMP 性能相对较弱，主要归因于其依赖经验选取的停止准则；相比之下，FOCUSS 受收敛性局限与对正则化参数的明显敏感性影响，鲁棒性下降 [15]。由于常规 LMMSE 估计器未利用 DD 域 CSI 稀疏性，其 NMSE 表现最差。总体而言，非贝叶斯稀疏恢复技术（即 OMP 与 FOCUSS）由于上述缺陷，较基于 BL 的估计器更不可靠。在所考虑的方案中，DD-DBL 性能最优：这一增益源于它除了在有限导频开销下运行外，还能纳入由 (71) 中修正 LMMSE 规则获得的数据估计。值得注意的是，DD-DBL 在高 SNR 下逼近 BCRLB，且不需要信道协方差矩阵的任何先验知识——而这通常是常规 LMMSE 处理所必需的；此外，它也不假设稀疏支撑已知。这些性质凸显了 DD-DBL 对 DCO-OTFS 实现的实用吸引力，因为在这些实现中可靠的先验信息常常不可得。联合 CSI 估计与检测能力进一步通过利用大量数据符号与相对少量导频，增强了性能，使其在高 SNR 区间的行为紧密跟踪 BCRLB。

**图 1：** AP-STS MIMO DCO-OTFS VLC 系统的 (a) NMSE 随 SNR 变化性能；(b) SER 随 SNR 变化性能（对比方案：LMMSE、FOCUSS、OMP、DD-PBL、DD-DBL；另含 BCRLB 与 Perfect CSI 参考）。

图 1(b) 进一步给出用各估计器所提供的 CSI 检测叠加数据符号时的 SER 结果。具体地，SER 是借助上述估计方法产生的 CSI、对嵌入导频的数据符号计算得到的；相应性能还与使用完美 CSI 的理想化接收机比较。如预期，基于 BL 的方法（DD-PBL 与 DD-DBL）的 SER 低于非 BL 基线 OMP 与 FOCUSS，这与图 1(a) 中的 NMSE 趋势一致。此外，DD-DBL 再次给出最优 SER，其曲线接近完美 CSI 基准。这些结果证实了所提 DD-DBL 策略在产生高精度 CSI 以实现可靠数据检测方面的有效性。

图 2(a) 给出 SNR = 10 dB 与 20 dB 时，所提稀疏 CSI 估计方案在 AP-STS MIMO DCO-OTFS VLC 系统中的 NMSE 随导频长度 $K_2$ 的变化。结果表明 NMSE 随 $K_2$ 增大单调下降，这与训练在改善估计质量中的作用一致。具体地，增大 $K_2$ 会增加可用观测数量，从而降低估计误差 [36]。在所考察技术中，DD-DBL 再次取得最低 NMSE，凸显额外利用数据符号的收益。在所提设计中，$MK_2N_t$ 个导频符号被嵌入 $MN_aN_t$ 个符号的块中，因此导频开销为 $\rho=\frac{K_2}{N_a}$。相比之下，嵌入导频（embedded-pilot，EP）途径需要高得多的开销，近似由 $\rho_{\rm EP}\approx\frac{(N_tM_\tau+M_\tau+N_t)(2N_\nu+1)}{MN_aN_t}$ 给出 [37]。对所述参数与 $K_2=4$，这导致 $\rho_{\rm EP}=0.42$，而 $\rho=0.13$，表明所提方案保持了高带宽效率。

**图 2：** AP-STS MIMO DCO-OTFS VLC 系统的 (a) SNR = 10 与 20 dB 时 NMSE 随导频长度 $K_2$ 变化性能；(b) 高阶调制下 SER 随 SNR 变化性能（4/16/64 QAM）。

图 2(b) 比较 DD-DBL、DD-PBL 与 OMP 在 4、16 与 64 QAM 信令下的 SER。在所有情形中，DD-DBL 均取得最低 SER，表明在其产生的 CSI 下检测更可靠。这些结果表明，所提 DD-DBL 在不同调制阶数下依然有效，并在所考虑的 SNR 范围内持续优于 DD-PBL 与 OMP。

为突出所提框架的优势，我们在多组仿真设置下评估 DD-DBL 与 DD-PBL：$\Delta f=480$ kHz、$M=32$、$N=64$、$K_2=6$、$L=8$、$L_p=4$、$M_\tau=8$、$N_\nu=7$，其余参数保持不变。图 3(a) 把所提估计器达到的 NMSE 与该 AP-STS MIMO DCO-OTFS VLC 系统的代表性基准方法比较，其中 DD-DBL 始终表现最佳。图 3(b) 报告相应的 SER 结果，表明 DD-DBL 的 SER 显著低于 DD-PBL、OMP 与 FOCUSS，这归因于其改进的 CSI 质量以及逼近完美 CSI 接收机性能的能力。

**图 3：** AP-STS MIMO DCO-OTFS VLC 系统的 (a) NMSE 随 SNR 变化性能；(b) SER 随 SNR 变化性能（采用 $\Delta f=480$ kHz、$M=32$、$N=64$、$K_2=6$、$L=8$、$L_p=4$、$M_\tau=8$、$N_\nu=7$）。

图 4(a) 与 4(b) 展示所考虑算法在 $G_\nu=32$（可捕捉分数多普勒效应）的 AP-STS MIMO DCO-OTFS VLC 链路中的 NMSE 与 SER。结果表明，DD-DBL 相对基准估计器持续给出更优性能，反映了其改进的 CSI 质量与相应的检测可靠性。此外，增大细多普勒 bin 数 $G_\nu$ 会提升 DD 网格分辨率，从而进一步同时改善估计与检测性能。

**图 4：** 含分数多普勒的 AP-STS MIMO DCO-OTFS VLC 系统的 (a) NMSE 随 SNR 变化性能；(b) SER 随 SNR 变化性能（$G_\nu=32$）。

## VII. 结论

本文针对在双选择性信道上传输的 CP 辅助 MIMO DCO-OTFS VLC 链路，提出了正交 AP-STS 框架。通过在 DD 域中联合仿射预编码并叠加导频矩阵与数据矩阵，推导了统一的端到端 DD 域输入–输出模型；同时，每个 PD 处的正交预编码器实现了可靠的导频/数据分离并抑制相互干扰。基于该模型，开发了由 EM 驱动的 DD-PBL 算法用于 CSI 估计；随后提出 DD-DBL 过程，通过把检测到的符号用作虚拟导频，迭代地精化 CSI 并检测数据。由此得到的 LMMSE 检测器显式纳入了 CSI 不确定性，并针对所考虑的设定推导了 BCRLB。数值结果表明，相较基准方案，本文方法具有更优的 NMSE、更低的导频开销与更低的 SER。

## 参考文献（英文原条目，按原文顺序）

[1] H. Zhu, C.-T. Lam, L. Hu, B. Chen, B. K. Ng, and E. Monteiro, “Intelligent adaptive deep neural network-based signal detection for generalized spatial modulation visible light communication systems,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 12, pp. 5522–5536, 2026.

[2] T. Kepezkaya, R. Dede, Y. I. Tek, and E. Basar, “Predicting the DC bias and optimizing BER and PAPR in DCO-OFDM: An explainable machine learning approach,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 12, pp. 6643–6657, 2026.

[3] M. H. Rahman, M. Z. Chowdhury, I. B. K. Y. Utama, and Y. M. Jang, “Channel estimation for indoor massive MIMO visible light communication with deep residual convolutional blind denoising network,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 9, no. 3, pp. 683–694, 2023.

[4] C. Xu, X. Zhang, P. Petropoulos, S. Sugiura, R. G. Maunder, L.-L. Yang, Z. Wang, J. Yuan, H. Haas, and L. Hanzo, “Optical OTFS is capable of improving the bandwidth-, power- and energy-efficiency of optical OFDM,” *IEEE Transactions on Communications*, vol. 72, no. 2, pp. 938–953, 2023.

[5] S. Saxena, S. Sharma, S. Srivastava, A. K. Jagannatham, and L. Hanzo, “Multiple measurement vector based Bayesian learning for simultaneously sparse time/delay-domain channel estimation in ADO-OFDM visible light systems,” *IEEE Transactions on Vehicular Technology*, pp. 1–16, 2025.

[6] S. I. Mushfique, A. Alsharoa, and M. Yuksel, “Optimization of SINR and illumination uniformity in multi-LED multi-datastream VLC networks,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 6, no. 3, pp. 1108–1121, 2020.

[7] X. Chen and M. Jiang, “Adaptive statistical Bayesian MMSE channel estimation for visible light communication,” *IEEE Transactions on Signal Processing*, vol. 65, no. 5, pp. 1287–1299, 2016.

[8] H. Schulze, J. Mietzner, and P. A. Hoeher, “Dispersive optical wireless indoor channels—from frequency-domain modeling to bit-error-rate prediction,” *IEEE Photonics Journal*, vol. 16, no. 1, pp. 1–13, 2024.

[9] X. You, J. Chen, and C. Yu, “Performance of location-based equalization for OFDM indoor visible light communications,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 5, no. 4, pp. 1229–1243, 2019.

[10] Z. Zhou, C. Chen, and M. Kavehrad, “Impact analyses of high-order light reflections on indoor optical wireless channel model and calibration,” *Journal of Lightwave Technology*, vol. 32, no. 10, pp. 2003–2011, 2014.

[11] K. Lee, H. Park, and J. R. Barry, “Indoor channel characteristics for visible light communications,” *IEEE Communications Letters*, vol. 15, no. 2, pp. 217–219, 2011.

[12] R. Raj, S. Jaiswal, and A. Dixit, “On the effect of multipath reflections in indoor visible light communication links: Channel characterization and BER analysis,” *IEEE Access*, vol. 8, pp. 190 620–190 636, 2020.

[13] J. R. Barry, J. M. Kahn, W. J. Krause, E. A. Lee, and D. G. Messerschmitt, “Simulation of multipath impulse response for indoor wireless optical channels,” *IEEE Journal on Selected Areas in Communications*, vol. 11, no. 3, pp. 367–379, 1993.

[14] A. W. Azim, A. Rullier, Y. Le Guennec, L. Ros, and G. Maury, “Energy efficient M-ary frequency-shift keying-based modulation techniques for visible light communication,” *IEEE Transactions on Cognitive Communications and Networking*, vol. 5, no. 4, pp. 1244–1256, 2019.

[15] S. Saxena, S. Srivastava, S. Sharma, A. K. Jagannatham, and L. Hanzo, “Sparse channel estimation for visible light optical OFDM systems relying on Bayesian learning,” *IEEE Open Journal of the Communications Society*, vol. 4, pp. 2062–2079, 2023.

[16] R. Hadani, S. Rakib, M. Tsatsanis, A. Monk, A. J. Goldsmith, A. F. Molisch, and R. Calderbank, “Orthogonal time frequency space modulation,” in *2017 IEEE Wireless Communications and Networking Conference (WCNC)*. IEEE, 2017, pp. 1–6.

[17] P. Raviteja, E. Viterbo, and Y. Hong, “OTFS performance on static multipath channels,” *IEEE Wireless Communications Letters*, vol. 8, no. 3, pp. 745–748, 2019.

[18] J. Zhong, J. Zhou, W. Liu, and J. Qin, “Orthogonal time-frequency multiplexing with 2D Hermitian symmetry for optical-wireless communications,” *IEEE Photonics Journal*, vol. 12, no. 2, pp. 1–10, 2020.

[19] D. Zheng, H. Zhang, and J. Song, “DCO-OTFS-based full-duplex relay-assisted visible light communications,” *Optics Express*, vol. 29, no. 25, pp. 41 323–41 332, 2021.

[20] A. Sharma, R. Mitra, O. Krejcar, K. Choi, M. Dobrovolny, and V. Bhatia, “Hyperparameter-free RFF-based post-distorter for OTFS VLC system,” *IEEE Photonics Journal*, vol. 15, no. 2, pp. 1–7, 2023.

[21] S. Sinha and A. Chockalingam, “OTFS modulation in dual-LED indoor visible light communication systems,” in *2021 IEEE 94th Vehicular Technology Conference (VTC2021-Fall)*. IEEE, 2021, pp. 1–7.

[22] ——, “Quad-LED OTFS modulation in indoor visible light communication systems,” in *2021 IEEE Global Communications Conference (GLOBECOM)*. IEEE, 2021, pp. 1–6.

[23] Z. Wang, H. Wang, Q. Tang, Q. Peng, Y. Zhang, and M. Cao, “Spectrally efficient optical OTFS with enhanced joint delay-Doppler index modulation,” *IEEE Photonics Technology Letters*, 2025.

[24] C. Cai, X. Hu, Z. Du, B. Zhu, W. Liao, X. Ma, B. Chen, Q. Chen, W. Ge, G. Song et al., “A power- and spectrum-efficient underwater wireless optical communication system based on a hierarchical pre-distorted LACO-OTFS scheme,” *Journal of Lightwave Technology*, 2025.

[25] W. Chen, C. Ju, T. Yuan, J. Li, M. Zhang, and D. Wang, “Optical OTFS modulation for free space optical-based LEO satellite communication systems,” *IEEE Photonics Technology Letters*, 2025.

[26] Y. Liao, J. Pei, W. Dai, J. Song, and Y. Dong, “Sparse Bayesian learning-based channel estimation for indoor OTFS visible light communication,” in *2023 Asia Communications and Photonics Conference/2023 International Photonics and Optoelectronics Meetings (ACP/POEM)*. IEEE, 2023, pp. 1–5.

[27] H. B. Mishra, P. Singh, A. K. Prasad, and R. Budhiraja, “Iterative channel estimation and data detection in OTFS using superimposed pilots,” in *2021 IEEE International Conference on Communications Workshops (ICC Workshops)*. IEEE, 2021, pp. 1–6.

[28] W. Yuan, S. Li, Z. Wei, J. Yuan, and D. W. K. Ng, “Data-aided channel estimation for OTFS systems with a superimposed pilot and data transmission scheme,” *IEEE Wireless Communications Letters*, vol. 10, no. 9, pp. 1954–1958, 2021.

[29] J. C. Estrada-Jiménez, B. G. Guzmán, M. J. F.-G. García, and V. P. G. Jiménez, “Superimposed training-based channel estimation for MISO optical-OFDM VLC,” *IEEE Transactions on Vehicular Technology*, vol. 68, no. 6, pp. 6161–6166, 2019.

[30] M. K. Ramachandran and A. Chockalingam, “MIMO-OTFS in high-Doppler fading channels: Signal detection and channel estimation,” in *2018 IEEE Global Communications Conference (GLOBECOM)*. IEEE, 2018, pp. 206–212.

[31] I. P. Muntane and M. J. F.-G. García, “Optimal estimation of frequency-selective channels in OFDM-based superimposed training schemes,” *IEEE Transactions on Vehicular Technology*, vol. 73, no. 11, pp. 15 969–15 982, 2024.

[32] N. N. Tran, D. H. Pham, H. D. Tuan, and H. H. Nguyen, “Orthogonal affine precoding and decoding for channel estimation and source detection in MIMO frequency-selective fading channels,” *IEEE Transactions on Signal Processing*, vol. 57, no. 3, pp. 1151–1162, 2008.

[33] S. Srivastava, R. K. Singh, A. K. Jagannatham, and L. Hanzo, “Bayesian learning aided sparse channel estimation for orthogonal time frequency space modulated systems,” *IEEE Transactions on Vehicular Technology*, vol. 70, no. 8, pp. 8343–8348, 2021.

[34] D. P. Wipf and B. D. Rao, “Sparse Bayesian learning for basis selection,” *IEEE Transactions on Signal Processing*, vol. 52, no. 8, pp. 2153–2164, 2004.

[35] M. E. Tipping, “Sparse Bayesian learning and the relevance vector machine,” *Journal of Machine Learning Research*, vol. 1, no. Jun, pp. 211–244, 2001.

[36] S. M. Kay, *Fundamentals of Statistical Signal Processing: Estimation Theory*. Prentice-Hall, Inc., 1993.

[37] P. Raviteja, K. T. Phan, and Y. Hong, “Embedded pilot-aided channel estimation for OTFS in delay-Doppler channels,” *IEEE Transactions on Vehicular Technology*, vol. 68, no. 5, pp. 4906–4917, 2019.

**原文插图：** 原 PDF 中的图 1–4 未重传至本页，仅保留中文图注与图中给出的坐标/曲线含义；全部原图可通过页首的 arXiv 页面查看。

---

**本页范围与校对状态：** 本页为 arXiv:2609.22312v1（eess.SP，13 页）的全文中文译稿，覆盖摘要、关键词、正文第 I–VII 节（含 I-A–C、II-A–C、V-A 等全部小节）、结论、全部图注（图 1–4）、表 I（逐格转录，含 16 列特征对比与 ✓ 标记）、算法 1–2、公式 (1)–(81) 与 37 条参考文献英文原条目；原文无附录、无作者简介。**逐句终校未做**：表 I 的 ✓ 分布已用 PDF 页面渲染逐格核对（源文本层无法保留勾选位置）；式 (51) 的堆叠模型维度、(79)–(80) 的 BFIM/BCRLB、式 (7) 的实值化推导已对照页面渲染核对，其余公式按 PDF 文本层录入；但尚未完成逐句逐式的独立复核。页内 2 处“原文疑点”为原文内部不一致：§VI 仿真设置中 $\mathbf R_h=\mathbf I_{M_\tau N_\nu N_tN_r}$ 与 (33)/(36) 的 $M_\tau G_\nu N_tN_r$ 维度不符（$N_\nu$ 疑应为 $G_\nu$）；§V 式 (53) 的高斯先验使用 $\lambda_i$，而全文其余处（含式 (42)–(43)、(56)、(78)–(79)）使用超参数 $\gamma_i$（记 $\boldsymbol\Upsilon=\mathrm{diag}\{\gamma_i\}$），疑为记号混用。以上均按原文照录并加注，未作数值或表述改动。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
