---
layout: page
title: "OTFS-ISAC 中叠加 Sunscape 导频图案的信道估计｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-22-superimposed-sunscape-pilot-pattern-for-channel-estimation-in-otfs-bas-e5fa7705/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e5fa7705f06fee0c/) · 原文为期刊/会议正式版，许可待核验 · [全部目录](/papers/catalog/)

> **许可与用途声明：** 本页依据本地期刊正式版 PDF（IEEE Transactions on Wireless Communications, 2026 后印本）作中文全文翻译，**再传播许可待核验**；本页仅作个人学习用途，**不计入“可公开全文”统计**。原文版权归 IEEE 所有，引用请以期刊正式版本为准。

# OTFS-ISAC 中叠加 Sunscape 导频图案的信道估计

**原题：** Superimposed Sunscape Pilot Pattern for Channel Estimation in OTFS-Based ISAC  
**作者：** Lianet Méndez-Monsanto（Student Member, IEEE）、Andrés Reyes-Castro（Student Member, IEEE）、Kun Chen-Hu（Senior Member, IEEE）、María Julia Fernández-Getino García（Member, IEEE）、Ana García Armada（Fellow, IEEE）。单位：西班牙马德里卡洛斯三世大学（Universidad Carlos III de Madrid）信号理论与通信系，Leganés 28911；K. Chen-Hu 同时隶属西班牙阿尔卡拉大学（Universidad de Alcalá）信号理论与通信系（Alcalá de Henares 28805）。邮箱：lmendezm@pa.uc3m.es、{anreyesc, kchen, mjfgarci, anagar}@ing.uc3m.es。  
**版本：** 期刊正式版后印本（postprint），*IEEE Transactions on Wireless Communications*, vol. 25, 2026, pp. 16680–16696；DOI: 10.1109/TWC.2026.3689779；本地 PDF 共 18 页（含后印本封面页）。再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–VII 节（含 I-A–B、II-A–D、III-A–B、IV-A–D、V-A–B、VI-A–G 全部小节）、结论、全部图注（图 1–15）、表 I–III（逐格转录）、算法 1、公式 (1)–(51)、34 条参考文献英文原条目与 5 位作者简介（已中文化）；原文无附录；逐句逐式终校未做。

## 摘要

正交时频空间（OTFS）是面向未来第六代（6G）及更远网络的有前景波形，它对高移动场景具有鲁棒性，并通过在时延–多普勒（DD）域工作实现感知与通信业务的无缝集成。可靠的信道估计对这两种功能都必不可少；然而传统嵌入导频（EP）方案存在导频开销高、峰均功率比（PAPR）增大的问题。叠加训练（ST）方法已被提出作为缓解这些局限的替代方案，因为导频与数据符号共享相同的 DD 资源。不过现有基于 ST 的技术通常依赖计算昂贵的算法，或通信与感知性能退化。为克服这些限制，本文提出一种新颖的低功率叠加导频设计——**sunscape 图案**，以及专门针对该结构定制的、基于 ST 的信道估计算法。sunscape 图案的核心设计思想是：在 DD 域按类似“海上日出”（seascape with a sun over the sea）的结构化布局分布导频能量。**太阳（sun）**部分实现精确的时延与多普勒检测（整数与分数），而**海（sea）**部分天然支持导频与数据分量之间的干扰平均，从而在无需计算昂贵的迭代干扰消除的情况下抑制自干扰与噪声。仿真结果验证了所提方案：它以低计算复杂度与可控 PAPR 实现准确信道估计和可靠 DD 域检测，在通信与感知性能上均优于现有方法。

**关键词：** 6G、OTFS、感知、信道估计、叠加训练。

## I. 引言

通感一体化（ISAC）已成为未来第六代（6G）网络的关键范式 [1]，其目标是用同一信号与硬件资源同时完成数据传输与环境感知。感知能力必须能够准确定位目标，尤其是在车辆网络、雷达增强无线系统与工业自动化等高度动态场景中，两种功能必须高效共存 [2]。因此，关键挑战之一是选择合适的波形，使其在高移动条件下既能实现足够准确的感知，又能实现有效通信。

近期研究致力于把正交频分复用（OFDM）扩展到这类动态场景。例如 [3] 提出时延–多普勒域信号处理辅助的 OFDM（DD-a-OFDM），在 DD 域处理 OFDM 导频以提升信道估计精度。

在 6G 及更远候选波形中，正交时频空间（OTFS）是有前景的解决方案 [4]：它把发射符号安排在 DD 域，便于 ISAC，并能有效缓解高移动环境中双色散信道的影响 [5]，这一点不同于传统 OFDM。OTFS 的经典信道估计方法基于嵌入导频（EP）[6]（也称导频符号辅助调制，PSAM）。如图 1a 所示，该方案要求在发射的每个导频符号周围设置保护符号以避免相互干扰，因而造成显著的数据速率损失；此外，DD 域中大量功率被分配给孤立导频符号，导致发射机峰均功率比（PAPR）偏高。[7] 给出另一种 EP 形式，即通过串联扩频多址（TSMA）的 OTFS-TSMA：那里用扩频序列作为导频并附加在 DD 域，利用物联网（IoT）中 DD 资源的稀疏使用。

作为 EP 的替代，叠加训练（ST，文献中亦称叠加导频 SP）成为能够规避上述问题的有前景方案。与 EP [6] 不同，ST 允许在同一 DD 资源中同时发送数据与导频符号，从而共享功率域并实现零数据速率损失 [8]。在接收端，数据符号会给信道估计过程引入干扰，可在执行自干扰消除后予以抑制。干扰抑制既可用串行干扰消除（SIC）[9]，也可用统计方法 [8]：前者利用迭代的数据辅助消除过程，与 OTFS 结合时复杂度高、处理时延大；后者借助低复杂度的平均操作滤除数据符号引起的自干扰并降低噪声，利用的正是数据与噪声均为零均值随机变量这一事实。此时主要挑战在于设计一种导频图案，既能支持这种低复杂度平均，又能支撑准确的信道估计。

### A. 关于 ST 的既有工作

聚焦 OTFS 中基于 ST 的信道估计，现有工作大多依赖上述 SIC [9]。这些方法可分为两大类：采用**分散孤立导频**的方案 [10]–[17]，以及使用**结构化导频序列**的方案 [9], [18]–[23]；二者的差异如图 1b 所示。

- **基于分散孤立导频的方法**把功率集中在特定 DD 资源上，因而通常在时延与多普勒检测上精度更高，代价是 PAPR 更高。为缓解这一点，[13] 采用离散傅里叶变换扩频 OTFS（DFT-s-OTFS）降低功率峰值；[14]–[16] 提出组合多个孤立导频以更均匀地分布能量，略微降低 PAPR 但牺牲信道估计精度；[17] 引入高功率中心导频、周围环绕低功率导频的相关方法，实现适度的 PAPR 降低。另外，[12] 与 [16] 引入基于深度学习的估计技术以抑制数据符号的自干扰，但这些方法显著增加接收机复杂度。
- **基于结构化导频序列的方法**占用全部或部分 DD 网格，因而 PAPR 更低，代价是导频间相互干扰增大。[9], [18], [19] 在整个 DD 网格上叠加低功率导频符号，这种设计在导频间引入大量自干扰，恶化时延与多普勒检测性能；为提高估计精度往往需要跨多个 DD 帧迭代精炼，从而增加时延与复杂度。后续工作如 [23] 提出恒包络导频序列以进一步改善 PAPR 特性，但所得信道估计即使在高信噪比（SNR）下也出现误差底（error floor）。为平衡复杂度与性能，[21] 与 [22] 提出部分叠加导频方案，把导频放置限制在 OTFS 帧的少部分区域；然而这些方法假定各帧时延与多普勒频移恒定，在时变信道的某些情形下可能不现实；此外它们仍依赖 SIC，计算负担高。为缓解 OTFS 的 PAPR 问题，[20] 融合了选择性映射（SLM）与部分发送序列（PTS）等传统 PAPR 降低技术，但这些技术进一步增加复杂度且未彻底解决问题。

最后，为解决 SIC 带来的高复杂度，受 [8] 启发的统计方法类工作见 [24], [25]：那里提出周期导频序列，通过在 DD 域平均来抑制干扰。该方法在 PAPR 与估计精度之间取得合理折中，但未妥善处理多普勒检测。

**图 1：** DD 域导频符号分配。(a) EP 方案 [6]；(b) 现有 ST 方案：分散孤立导频（左）与结构化导频序列（右）；(c) 所提 sunscape 导频图案（海导频与太阳导频）。

### B. 方法与贡献

考虑上一小节所述现有 OTFS 的 ST 导频图案与信道估计技术的局限，本文提出一种新的基于 ST 的导频图案——sunscape，以及一种基于统计方法的新信道估计技术。它通过在 DD 域精心设计的低复杂度平均流程实现，以抑制自干扰。所提导频图案与平均流程能够兼顾 I-A 节所述两类 ST 方法的优点（分散孤立导频与结构化导频序列），在获得精确时延与多普勒检测和信道估计的同时，不增加 PAPR 或复杂度负担。

我们的基于 ST 的图案是一种组合设计，由 (i) 单个/孤立导频结构（称**太阳导频**）与 (ii) 周期导频图案（称**海导频**）组成：前者实现精确的时延与多普勒检测（整数与分数），后者利用接收信号的统计特性获得准确信道增益估计，而无需计算密集的 SIC。此外，整体叠加导频图案被设计为低 PAPR。太阳与海导频的构型在视觉上类似“海上日出”的景致，因而得名 **sunscape**（由 “sun” 与 “seascape” 合成）。图 1c 给出所提叠加 sunscape 导频图案，并与 EP [6] 及现有 ST 方案对比。

论文贡献总结如下：

- 提出 DD 域一种新的叠加导频图案——sunscape 图案。太阳导频支持精确的时延与多普勒检测（整数与分数时延/多普勒频移），海导频支持低复杂度平均以精确估计信道增益。两类导频的协同有效降低了发射 PAPR 与接收端信道估计均方误差（MSE）。我们给出理论分析，证明增加太阳导频数目可最小化 PAPR，并导出确定实现该降低所需太阳导频最小长度的闭式表达式。
- 提出一种面向 ISAC 的 DD 域新信道估计算法，专门为 sunscape 图案设计。该方法先用基于阈值的时延与多普勒检测（同时给出信道增益粗估计），随后利用海导频的周期结构精炼信道增益估计。理论分析表明：增加海导频可降低 MSE，增加太阳导频可提升检测概率。据此提出联合最大化信道估计与目标检测性能的优化问题，从而为每个场景确定最优 sunscape 配置；该问题虽非凸，但可用启发式方法离线高效求解。
- 通过计算复杂度分析与仿真评估所提方案的优势，给出计算复杂度、信道估计 MSE、误比特率（BER）、PAPR 与目标检测性能的数值结果。这些结果凸显了所提算法相对非 ST 的 EP 方法与现有 ST 技术在 MSE、PAPR 上的优势，同时所需复杂度更低。

本文余下部分安排如下：第 II 节描述 OTFS 系统模型；第 III 节介绍所提叠加 sunscape 导频图案；第 IV 节给出为 sunscape 图案开发的新信道估计流程；第 V 节分析接收端计算复杂度与 sunscape 导频图案参数；第 VI 节给出数值结果；第 VII 节总结。

**记号：** 矩阵、向量与标量分别用黑体大写、黑体小写与普通字母表示。$\mathbf A[m,n]$ 表示 $\mathbf A$ 第 $m$ 行第 $n$ 列的元素，$\mathbf a[n]$ 表示向量 $\mathbf a$ 的第 $n$ 个元素；$\mathbf I_M$ 为 $M\times M$ 单位阵，$\mathbf 1_{(M\times N)}$ 为 $M\times N$ 全一矩阵；$\mathbf A={\rm diag}(\mathbf a)$ 为以向量 $\mathbf a$ 元素为对角元的对角阵。上标 $(\cdot)^T$ 与 $(\cdot)^H$ 分别表示转置与 Hermitian 运算；$\otimes$ 为 Kronecker 积，$\odot$ 为 Hadamard 积。$\mathbb E\{\cdot\}$ 表示期望；$\mathcal{CN}(\mathbf 0,\sigma^2)$ 表示方差为 $\sigma^2$ 的循环对称零均值复高斯分布；$\chi^2_2$ 为自由度 2 的中心卡方分布；$|\cdot|$ 为复数的绝对值。$\mathbb C^K$ 与 $\mathbb Z^K$ 分别为 $K$ 维复空间与整数空间，$\mathbb C^{K\times K}$ 为 $K\times K$ 维复空间。${\rm vec}(\mathbf A)$ 为矩阵 $\mathbf A$ 的矢量化形式，${\rm vec}^{-1}_{M,N}(\mathbf a)$ 为把向量 $\mathbf a$ 逆矢量化成 $M\times N$ 矩阵；$[n]_M$ 为整数 $n$ 对整数 $M$ 取模；最后 ${\rm circ}[\cdot]$ 表示循环矩阵。

## II. 系统模型

本节介绍图 2 所示的 OTFS 信号模型。考虑由单天线基站与单天线用户设备组成的单输入单输出（SISO）系统，二者进行双向通信，任一端接收的信号都用于执行信道估计。该过程产出用于感知的信道参数估计（时延与多普勒频移）以及用于通信的复信道增益估计。感知参数估计随后可传给更高协议层（即物理层以上），在单站或双站配置下用于用户定位或环境感知。

### A. 基于 ST 的 OTFS 发射机

在发射端，数据与导频符号被放入 DD 域的资源网格 $\mathbf X\in\mathbb C^{M\times N}$（称为 OTFS 帧），它由 $M$ 个时延格（或子载波）与 $N$ 个多普勒格（或多载波符号）组成，元素记为 $\mathbf X[m,n]$，$m=0,\dots,M-1$、$n=0,\dots,N-1$ [26]。特别地，按 ST 方案，数据符号与导频序列在 DD 域叠加为

$$
\mathbf X=\sqrt{\beta}\mathbf X_d+\sqrt{1-\beta}\mathbf X_p\in\mathbb C^{M\times N},\qquad 0\le\beta\le1, \tag{1}
$$

其中 $\mathbf X_d\in\mathbb C^{M\times N}$ 为发射数据符号的 DD 网格（每个复符号属于正交幅度调制（QAM）星座，能量归一化为 1，即 $\mathbb E\{|\mathbf X[m,n]|^2\}=1$，$m=0,\dots,M-1$、$n=0,\dots,N-1$），$\mathbf X_p\in\mathbb C^{M\times N}$ 为叠加导频符号的 DD 网格，$\beta$ 表示分配给数据的功率因子。注意该过程在数据生成阶段完成、先于波形构造，因此不影响时域脉冲形状的选择。

按图 2，发射机通过逆离散 Zak 变换（IDZT）[26] 把 DD 域符号映射为时域样本 $\mathbf s\in\mathbb C^{MN}$。假定发射与接收脉冲为矩形、持续时间为 $T$（见 [9], [13], [26]），则 IDZT 等价于先对 $\mathbf X$ 的行做逆离散傅里叶变换（IDFT）得到时延–时间（DT）域网格 $\mathbf X^{({\rm DT})}\in\mathbb C^{M\times N}$，再逐列做并串转换：

$$
\mathbf X^{({\rm DT})}=\mathbf X\mathbf F^H_N\in\mathbb C^{M\times N},\qquad
\mathbf F_N=\frac{1}{\sqrt N}\left(e^{-j\frac{2\pi}{N}kl}\right)_{k,l=0}^{N-1}, \tag{2}
$$

$$
\mathbf s={\rm vec}\left(\mathbf X^{({\rm DT})}\right)=\left[\mathbf s^T_0,\dots,\mathbf s^T_{N-1}\right]^T\in\mathbb C^{MN}, \tag{3}
$$

其中 $\mathbf F_N$ 为 $N$ 点归一化离散傅里叶变换（DFT）矩阵，$\mathbf s_n\in\mathbb C^M$（$n=0,\dots,N-1$）为长度 $M$ 的多载波符号，占用 $T=1/\Delta f$ 秒（$\Delta f$ 为子载波间隔）。本文采用零填充 OTFS（ZP-OTFS）[26]，即在每个多载波符号 $\mathbf s_n$ 末尾附加长度 $L_{ZP}$ 的零填充（ZP）。最后信号经数模（D/A）转换、上变频后送入无线信道。

### B. 双色散信道模型

发射信号经历频率选择性与时变信道，其在 DD 域可建模为 [26]

$$
h(\tau,\nu)=\sum_{\ell\in\mathcal L}\sum_{\kappa\in\mathcal K_\ell}\nu_\ell(\kappa)\delta(\tau-\ell T/M)\delta(\nu-\kappa\Delta f/N), \tag{4}
$$

其中 $\mathcal L=\{\ell_i\}$（大小 $|\mathcal L|$）与 $\mathcal K_\ell=\{\kappa_i\mid\ell=\ell_i\}$ 分别为归一化时延与多普勒频移集合（$i=0,\dots,L-1$，$L$ 为传播路径数）。每个目标产生一条传播路径（或抽头），全文互换使用这两个术语。时延 $\ell$ 处的多普勒响应 [26] 定义为

$$
\nu_\ell(\kappa)=
\begin{cases}
g_i, & \ell=\ell_i\ \text{且}\ \kappa=\kappa_i,\\
0, & \text{否则}.
\end{cases} \tag{5}
$$

其中 $g_i\sim\mathcal{CN}(0,\sigma^2_i)$ 为复信道增益。假定信道总功率为 $\sigma^2_h$，即 $\sum_{i=0}^{L-1}\sigma^2_i=\sigma^2_h$。第 $i$ 个抽头的时延移位（秒）$\tau_i$ 与多普勒频移（赫兹）$\nu_i$ 可表示为

$$
\tau_i=\frac{\ell_i}{M\Delta f}\le\tau_{\max},\qquad
\nu_i=\frac{\kappa_i}{NT},\quad|\nu_i|\le\nu_{\max}, \tag{6}
$$

其中 $\ell_i$ 与 $\kappa_i$ 分别为归一化时延与多普勒频移。本文同时研究分数（$\ell_i,\kappa_i\in\mathbb R$）与整数（$\ell_i=l_i$、$\kappa_i=k_i\in\mathbb Z$）时延与多普勒频移情形。假定信道为欠扩展的 [9], [13], [27]（$\tau_{\max}\nu_{\max}\ll1$ 且 $T\Delta f=1$），因而归一化时延移位受限于 $\ell_{\max}\le M-1$（$\ell_{\max}\in\mathbb R$ 为最大归一化时延移位，即 $\tau_{\max}=\ell_{\max}/M\Delta f$），归一化多普勒频移受限于 $-N/2\le\kappa_i<N/2$。定义 $\kappa_{\max}\in\mathbb R$ 为最大归一化多普勒频移，$|\kappa_{\max}|\le N/2$。第 $i$ 个目标的距离与速度可定义为 $R_i=\tau_ic$ 与 $V_i=c\nu_i/f_c$，其中 $c$ 为光速（m/s）、$f_c$ 为载频（Hz）。

### C. OTFS 接收机

接收信号 $\mathbf r\in\mathbb C^{MN}$ 经下变频、模数（A/D）转换与 ZP 去除后，通过离散 Zak 变换（DZT）[26] 变换回 DD 域。为此，首先由时域接收信号 $\mathbf r$ 经 (3) 的逆操作得到 DT 域接收网格 $\mathbf Y^{({\rm DT})}$，随后对 $\mathbf Y^{({\rm DT})}$ 的行做 DFT 得到 DD 域接收矩阵 $\mathbf Y$：

$$
\mathbf Y^{({\rm DT})}={\rm vec}^{-1}_{M,N}(\mathbf r)\in\mathbb C^{M\times N},\qquad
\mathbf Y=\mathbf Y^{({\rm DT})}\mathbf F_N\in\mathbb C^{M\times N}. \tag{7}
$$

图 2 所示的通信模块负责均衡。本文在获得信道估计参数后采用 DD 域线性最小均方误差（LMMSE）均衡 [26]；不过如 [28], [29] 所述，其他低复杂度均衡方法同样适用。

### D. 等效 OTFS 矢量化系统

在发射端，考虑到 DFT 的线性性质，矢量化时域发射信号为

$$
\mathbf s=\sqrt{\beta}\mathbf s_d+\sqrt{1-\beta}\mathbf s_p\in\mathbb C^{MN}, \tag{8}
$$

其中 $\mathbf s_d={\rm vec}(\mathbf X^{({\rm DT})}_d)={\rm vec}(\mathbf X_d\mathbf F^H_N)$、$\mathbf s_p={\rm vec}(\mathbf X^{({\rm DT})}_p)={\rm vec}(\mathbf X_p\mathbf F^H_N)\in\mathbb C^{MN}$ 分别为时域数据信号与导频信号。

在接收端，经无线信道传播后，DD 域矢量化接收符号 $\mathbf y={\rm vec}(\mathbf Y)\in\mathbb C^{MN}$ 可由 DD 域等效信道 [9], [13], [26], [27] 建模为

$$
\mathbf y=\mathbf H\mathbf x+\mathbf z\in\mathbb C^{MN}, \tag{9}
$$

其中 $\mathbf z\in\mathbb C^{MN}$ 为加性高斯白噪声（AWGN），分布为 $\mathcal{CN}(\mathbf 0,\sigma^2_z)$；$\mathbf x\in\mathbb C^{MN}$ 为 DD 域发射网格的矢量化形式，即 $\mathbf x={\rm vec}(\mathbf X)\in\mathbb C^{MN}$，可写为 $\mathbf x=\sqrt{\beta}\mathbf x_d+\sqrt{1-\beta}\mathbf x_p$，其中 $\mathbf x_d={\rm vec}(\mathbf X_d)$、$\mathbf x_p={\rm vec}(\mathbf X_p)$。

DD 域等效信道 $\mathbf H\in\mathbb C^{MN\times MN}$ 建模为 [26]

$$
\mathbf H=\left(\mathbf I_M\otimes\mathbf F_N\right)\left(\mathbf P^T\mathbf G\mathbf P\right)\left(\mathbf I_M\otimes\mathbf F^H_N\right), \tag{10}
$$

其中 $\mathbf P\in\mathbb C^{MN\times MN}$ 为置换矩阵 [26]，$\mathbf G\in\mathbb C^{MN\times MN}$ 为时域等效信道矩阵，其非零元由 $\mathbf G[q,q-l]=g_s[l,q]$（$0\le l\le q\le MN-1$）定义；$g_s[l,q]$ 为信道的抽头延迟线形式，其一般表达式为 [26]

$$
g_s[l,q]=\sum_{\ell\in\mathcal L}\left(\sum_{k\in\mathcal K_\ell}\nu_\ell(\kappa)e^{j\frac{2\pi\kappa(q-l)}{MN}}\right){\rm sinc}(l-\ell), \tag{11}
$$

其中 ${\rm sinc}(x)=\sin(\pi x)/(\pi x)$。该表达式可针对所采用的 OTFS 变体（如 ZP-OTFS）具体化 [26]。

**图 2：** 带 ST 的 OTFS 系统模型。信道估计为定位或感知提供时延与多普勒估计。

## III. OTFS 的新颖 sunscape 导频图案

本节介绍面向 OTFS DD 资源网格（$M\times N$）的新颖叠加 sunscape 导频图案设计。图 3 给出 sunscape 图案示意：叠加的孤立太阳导频以黄色标出，叠加的海导频以蓝色标出。我们导出选择太阳导频长度以实现最小 PAPR 的闭式表达式。

### A. Sunscape 导频图案

DD 域所提叠加 sunscape 导频图案（$\mathbf X_p\in\mathbb C^{M\times N}$）如图 3 所示，定义为

$$
\mathbf X_p[m,n]=
\begin{cases}
\sqrt{\dfrac{NL_y}{L_s}}\,p_s[m], & m_s\le m\le m_s+L_s-1,\ n=n_s,\\[6pt]
\mathbf X_a[m,n], & m_a\le m\le M-1,\ 0\le n\le N-1,\\[4pt]
0, & \text{否则},
\end{cases} \tag{12}
$$
$$
L_s,L_y,L_a\in\mathbb Z,\quad
1\le L_s\le M-l_{\max}-1,\quad
0\le m_s\le M-2,\ 0\le n_s\le N-1,
$$
$$
L_y=L_s+l_{\max},\quad 1\le L_y\le M-1,\quad
L_a=M-L_y,\quad m_a=L_y,\quad 1\le L_a\le M-1, \tag{13}
$$

其中 $\mathbf p_s\in\mathbb C^{L_s}$ 为太阳导频的垂直序列，$\mathbf X_a\in\mathbb C^{L_a\times N}$ 为海导频结构。按照太阳–海的视觉布局，海导频上方（含太阳导频）的空间称为**天空（sky）**，在时延轴上大小为 $L_y$ 个格。下标 $m_s$ 与 $n_s$ 分别为太阳导频在网格中的起始时延与多普勒索引；类似地，$m_a$ 表示海导频结构在 DD 网格中的起始位置，其延伸至 $N$ 个多普勒格。为避免太阳导频与海导频相互干扰，二者在时延轴上必须保持至少 $l_{\max}$ 格的间隔，即满足 $L_y-L_s\ge l_{\max}$。该图案在发射端按 (1) 叠加到数据上，从而以轻微 SNR 退化为代价实现零资源开销。其设计细节如下。

**1）太阳导频：** 如图 3（黄色）所示，孤立导频序列（太阳导频）由沿时延方向的（垂直）导频序列组成。鉴于 Zadoff–Chu（ZC）序列优异的自相关特性与恒包络性质，太阳导频采用 ZC 序列 [30] 构造，使接收端可做相关处理以改善与数据的分离：

$$
p_s[m]=e^{-j\pi\mu_s\frac{m(m+1)}{L_s}},\qquad m=0,1,\dots,L_s-1, \tag{14}
$$

其中 $\mu_s$ 表示太阳导频 ZC 序列的根。若 $L_s$ 为偶数，则按 $L_s-1$ 个符号构造 ZC 序列，并把首元素循环附加到末尾以补全序列。此外根 $\mu_s$ 必须与所生成导频序列长度 $L_s$ 互素 [30]。

**2) 海导频：** 关于图 3（蓝色）所示海导频，周期导频序列的设计必须支持接收端在 DD 域做平均。因此，定义长度 $L_a$ 的导频序列，并在 DD 资源网格中沿多普勒轴周期重复。设 $\mathbf p_a\in\mathbb C^{L_a}$ 为用根 $\mu_a$、长度 $L_a$ 的 ZC 序列构造的导频序列：

$$
p_a[m]=e^{-j\pi\mu_a\frac{m(m+1)}{L_a}},\qquad m=0,1,\dots,L_a-1. \tag{15}
$$

若 $L_a$ 为偶数，则按 $L_a-1$ 构造序列，并把首元素循环附加到末尾。根 $\mu_a$ 必须与导频序列长度 $L_a$ 互素 [30]。最后，该导频序列在每列多载波符号上重复为

$$
\mathbf X_a={\rm vec}^{-1}_{L_a,N}\left(\mathbf 1_{(N\times1)}\otimes\mathbf p_a\right)\in\mathbb C^{L_a\times N}. \tag{16}
$$

**3）天空区域：** 最后，关于 DD 网格的天空区域，如 (13) 所示，太阳导频与海导频必须充分分离以避免相互干扰。因此必须满足大小为 $L_y$ 的天空区域足够大，即 $L_y\ge L_s+l_{\max}$；由于系统设计将考虑最大时延扩展 $L_{ZP}$，故 $L_y\ge L_s+L_{ZP}$。注意该设计针对 ZP-OTFS 具体化：此时插入 ZP 在 OTFS 多载波符号之间形成保护间隔，防止海导频干扰下一个多载波符号的太阳导频。对基于循环前缀（CP）的 OTFS 或其他变体（如 reduced-CP 或 ZP），这种分离并非天然保证；视具体 ZP/CP 配置，可能需要在太阳与海导频之间增加额外保护以避免导频结构间干扰 [26]。

sunscape 导频图案的 DT 域表示记为 $\mathbf X^{({\rm DT})}_p$，由对 DD 域网格 $\mathbf X_p$ 的每一行做水平 IDFT 得到：

$$
\mathbf X^{({\rm DT})}_p=\mathbf X_p\mathbf F^H_N\in\mathbb C^{M\times N}. \tag{17}
$$

具体地，$m=0,\dots,M-1$、$n=0,\dots,N-1$ 处导频网格 DT 域表示的元素可表示为

$$
\mathbf X^{({\rm DT})}_p[m,n]=
\begin{cases}
\sqrt{\dfrac{L_y}{L_s}}\,p_s[m], & m_s\le m\le m_s+L_s-1,\ 0\le n\le N-1,\\[6pt]
\sqrt{N}\,p_a[m], & m_a\le m\le M-1,\ n=0,\\[4pt]
0, & \text{否则},
\end{cases} \tag{18}
$$

其中 $0\le m_s\le M-2$、$m_a=L_y$。由 (18) 可见，DD 域中太阳导频的垂直 ZC 序列经水平 IDFT 变为在 DT 域所有 $N$ 列上重复的同一 ZC 序列；相反，在 DD 域沿时延轴呈重复图案的海导频，由于 IDFT 操作而在 DT 域收敛为位于 $n=0$ 的单个 ZC 序列。该行为直接来自离散时间 Kronecker delta 与沿变换维度的常数序列之间的著名 DFT 关系。随后，如第 II-D 节所述，对 (18) 做矢量化（并串转换）即得时域导频信号 $\mathbf s_p$。

**图 3：** DD 域中叠加 sunscape 导频图案的示意；颜色表示不同符号相位。

### B. Sunscape 导频图案的 PAPR 分析

本小节分析所提叠加 sunscape 导频图案在时域的 PAPR，并证明通过调整导频图案结构可降低 PAPR。PAPR 评估时域 OTFS 信号 $\mathbf s\in\mathbb C^{MN}$ 的峰值–平均功率行为，定义为

$$
{\rm PAPR}(\mathbf s)=\frac{\max_{0\le q\le MN-1}|\mathbf s[q]|^2}{\frac{1}{MN}\sum_{q=0}^{MN-1}|\mathbf s[q]|^2}. \tag{19}
$$

我们给出 PAPR 关于 sunscape 图案参数 $L_s$ 与功率分配因子 $\beta$ 的解析表达式，并给出可用于选择太阳导频长度 $L_s$ 以最小化整体 PAPR 的闭式表达式。因此我们直接刻画叠加导频分量 $\mathbf s_p\in\mathbb C^{MN}$，即 ${\rm PAPR}(\mathbf s_p)$，以确保 $L_s$ 的选择不会无故增大整体导频与数据信号的 PAPR——否则会在功率放大器作用下对发射信号引入非线性失真。

由 (18) 中 DT 域导频图案的表达式，并串转换给出时域信号（见第 II-D 节）。可以观察到，最大功率峰值可能由太阳导频或海导频引起：即恶化 PAPR 的峰值来自最显著的功率贡献，而主导性可能来自太阳导频结构的最大功率 $L_y/L_s$，也可能来自海导频的最大功率值 $N$。鉴于 (19) 的分母（即时域信号平均功率）在本文中定义为单位值，PAPR 可表示为

$$
{\rm PAPR}(\mathbf s_p,L_s)=\max_{\substack{0\le m\le M-1\\0\le n\le N-1}}\left|\mathbf X^{({\rm DT})}_p[m,n]\right|^2
=\max\left(\frac{L_y}{L_s},N\right). \tag{20}
$$

考虑到分配给导频的功率记为 $(1-\beta)$，并利用 $L_y=L_s+l_{\max}$，有

$$
{\rm PAPR}\left(\sqrt{1-\beta}\mathbf s_p,\beta,L_s\right)
=(1-\beta)\max\left(1+\frac{l_{\max}}{L_s},N\right). \tag{21}
$$

如 (21) 所示，PAPR 取决于两项中的较大者：$1+\frac{l_{\max}}{L_s}$ 与 $N$。为使 PAPR 最小化至其下界 $(1-\beta)N$，第一项不得超过 $N$，由此得到条件

$$
L_s\ge\left\lceil\frac{l_{\max}}{N-1}\right\rceil, \tag{22}
$$

该式直接由 (21) 最大值算子内两项之间的不等式得到。该闭式界给出保证 PAPR 由固定值 $N$ 主导所需的最小太阳导频长度，从而实现与海导频相当的最优性能。该配置的收益将在第 VI 节通过仿真结果验证。

## IV. 基于 Sunscape 图案的信道估计与感知流程

本节介绍基于 sunscape 导频图案的 ISAC 信道估计方法（如图 4 所示，黄色与蓝色块分别表示用太阳导频与海导频执行的操作）。为简便，先针对整数网格情形详述流程，再具体化到分数情形。太阳导频实现基于阈值的时延与多普勒检测；在 DD 域周期排列的海导频支持基于平均的复信道增益精炼，而无需计算密集的 SIC。检测到的时延与多普勒频移随后用于目标感知，给出距离与速度信息；三个参数（时延、多普勒频移与增益）都用于面向通信的信道重建。最后，以信道增益估计的 MSE 与感知性能评估所提方法。

**图 4：** 叠加 sunscape 导频图案下 OTFS 的接收机框图（黄色：太阳导频；蓝色：海导频）。

### A. 时延与多普勒频移的精细检测及信道增益粗估计

利用太阳导频可检测第 $i$ 个抽头（$i=0,\dots,L-1$）的归一化时延与多普勒频移 $l_i$ 与 $k_i$。在导频位置 $m_s+l_i$ 与 $n_s+k_i$（$0\le m_s\le M-2$、$0\le n_s\le N-1$）处，(7) 中 DD 域接收信号 $\mathbf Y\in\mathbb C^{M\times N}$（以归一化时延 $l_i$、归一化多普勒频移 $k_i$ 与信道复增益 $g_i$ 表示）可写为

$$
\mathbf Y[m_s+l_i,n_s+k_i]=g_iz^{k_im_s}\mathbf X[m_s,n_s]+\mathbf Z[m_s+l_i,n_s+k_i], \tag{23}
$$

其中 $0\le m\le M-1$、$0\le n\le N-1$，$z=e^{j\frac{2\pi}{MN}}$，$\mathbf Z={\rm vec}^{-1}_{M,N}(\mathbf z)$ 为 AWGN 的矢量化逆形式。目标数 $L$ 未知。

处理方式取决于太阳导频是**短**还是**长**，其区分规则由 (22) 导出，即基于其对 PAPR 的影响：具体地，若 (22) 成立则视为长太阳导频；细节亦将在第 V 节的表 II 中给出。区分短太阳导频（用于直接检测）与长太阳导频（用于相关）的动机如下：短导频序列把发射功率集中在较少符号上，使每符号的瞬时功率更高，从而可直接从接收信号可靠检测（导频能量仍可与噪声、数据干扰区分），且无需相关处理，降低计算复杂度；相反，长导频序列把功率分散到更多符号上，虽有助于降低 PAPR，却必须通过相关才能可靠提取导频信号。²

² 此外实践中还必须考虑序列的相关特性（即旁瓣电平），以保证基于相关的检测方法的准确度。

**1）短太阳导频：** 为判断是否存在目标，采用阈值准则。令 $b[l,k]$ 表示在时延移位 $l$、多普勒频移 $k$ 处是否存在抽头（$0\le l\le l_{\max}$、$-k_{\max}\le k\le k_{\max}-1$），阈值记为 $\gamma$ [26]：

$$
b[l,k]=
\begin{cases}
1, & \left|\mathbf Y[m_s+l,n_s+k]\right|^2>\gamma,\quad \gamma\in\mathbb R,\ \gamma>0,\\
0, & \text{否则}.
\end{cases} \tag{24}
$$

该阈值准则施加于接收信号，以检测时延与多普勒频移（记为 $\tilde l_i$ 与 $\tilde k_i$）。估计的目标数 $\tilde L$ 随后计算为

$$
\left|\mathbf Y[m'_s+l,n_s+k]\right|^2\substack{\tilde l_i=l,\ \tilde k_i=k\\\gtrless\\\tilde l_i\ne l,\ \tilde k_i\ne k}\gamma,
\qquad
\tilde L=\sum_{l=0}^{l_{\max}}\sum_{k=-k_{\max}}^{k_{\max}-1}b[l,k], \tag{25}
$$

其中 $m_s\le m'_s\le L_s-1$。信道增益的粗估计 $\tilde g_i$ 可由下式获得：

$$
\tilde g_i=\frac{\mathbf Y[m_s+l_i,n_s+k_i]}{\mathbf X_p[m_s,n_s]\,z^{k_im_s}\sqrt{1-\beta}},\qquad i=0,\dots,\tilde L-1, \tag{26}
$$

该估计因数据干扰而较粗。该方法复杂度最低，代价是短太阳导频导致 PAPR 升高（为使接收信号可直接做基于阈值的检测）。

**2）长太阳导频：** 若 $L_s$ 较大，可采用相关方式进行检测：

$$
C[l,k]=\frac{1}{L_s}\sum_{m=0}^{L_s-1}\mathbf Y[m_s+m+l,n_s+k]\,z^{-km_s}p^*_s[m], \tag{27}
$$

其中 $0\le l\le l_{\max}$、$-k_{\max}\le k\le k_{\max}-1$；当存在目标时，相关矩阵 $\mathbf C\in\mathbb C^{(l_{\max}+1)\times(2k_{\max})}$ 中出现相关峰。时延与多普勒频移可通过阈值准则获得（此时施加于相关矩阵）：

$$
\left|C[l,k]\right|^2\substack{\tilde l_i=l,\ \tilde k_i=k\\\gtrless\\\tilde l_i\ne l,\ \tilde k_i\ne k}\gamma,
\qquad
\tilde L=\sum_{l=0}^{l_{\max}}\sum_{k=-k_{\max}}^{k_{\max}-1}b[l,k], \tag{28}
$$

其中 $i=0,\dots,\tilde L-1$，$b[l,k]$ 可类似 (24) 定义于相关矩阵上。此时信道复增益的粗估计为

$$
\tilde g_i=C[l_i,k_i]\left(\sqrt{NL_y(1-\beta)}\right)^{-1},\qquad i=0,\dots,\tilde L-1. \tag{29}
$$

该方法因功率分散到更多太阳导频而显著降低 PAPR，代价是复杂度略有增加。

**3）用海导频进行时延检测：** 当太阳导频段长度短于海导频（即 $L_s<L_a$）时，可利用海导频通过相关进一步改善时延检测 [24]。因此时延检测有两种选择：i) 基于太阳导频（如 IV-A1 与 IV-A2 所述）；ii) 基于海导频（如本节所述），当 $L_s<L_a$ 时后者性能优于 i)。即

$$
C_a[l]=\sum_{m=l}^{L_a-1}y[m]\,p^*_a[m-l],\qquad 0\le l\le l_{\max}, \tag{30}
$$

若存在时延为 $l$ 的抽头则出现相关峰。因此可施加阈值准则：

$$
\left|C_a[l]\right|^2\substack{\tilde l_i=l\\\gtrless\\\tilde l_i\ne l}\gamma,\qquad i=0,\dots,\tilde L-1. \tag{31}
$$

使用更长序列（长度 $L_a$）做相关可带来更鲁棒的时延移位检测 [24]，代价是复杂度略增。

**4）分数时延与分数多普勒频移检测：** 所提 sunscape 图案同时支持分数时延与分数多普勒频移，即 $\tilde\ell_i,\tilde\kappa_i\in\mathbb R$。此时沿用 IV-A1 与 IV-A2 中整数时延/多普勒的同一检测框架（基于短或长太阳导频），但作用于信号的过采样版本 [28]。

定义检测矩阵 $\mathbf D\in\mathbb C^{M\times N}$：对短太阳导频，$\mathbf D=\mathbf Y$（见 (23)）；对长太阳导频，$\mathbf D=\mathbf C$（见 (27)，此时 $\mathbf C$ 需零填充到 $M\times N$）。更高网格分辨率通过下式获得：

$$
\mathbf D_o=\mathbf F^H_{M_o}\mathbf P_M\mathbf F_M\mathbf D\mathbf F^H_N\mathbf P^H_N\mathbf F_{N_o},\qquad \mathbf D_o\in\mathbb C^{M_o\times N_o}, \tag{32}
$$

其中 $M_o=KM$、$N_o=KN$，$K\in\mathbb Z$ 为过采样因子。这里 $\mathbf P_M\in\mathbb C^{M_o\times M}$ 与 $\mathbf P_N\in\mathbb C^{N_o\times N}$ 表示零填充矩阵：$\mathbf P_M=[\mathbf 0^{p_M\times M}\ \mathbf I_M\ \mathbf 0^{(M_o-M-p_M)\times M}]^T$，其中 $p_M=\left\lfloor\frac{M_o-M}{2}\right\rfloor$（沿时延轴），$\mathbf P_N$ 沿多普勒轴类似定义。随后在 $\mathbf D_o$ 上用与 (25)、(28) 相同的阈值准则执行目标检测。当海导频可用于时延检测（$L_a>L_s$）时，可对 (30) 施加同样过采样，同时保留基于太阳导频检测得到的多普勒估计。

由于采样更细且存在分数移位，每条物理路径的能量会散布到多个抽头上，使单个目标出现若干相邻候选峰 [26]。为准确分辨底层分数值，在每个候选峰集合周围施加插值阶段。任何能拟合局部 2D sinc 形 DD 响应的高分辨率技术都可用于精炼时延与多普勒估计；本文沿用 [31] 的方法，用极值点附近的二次函数局部近似，由该抛物线的顶点给出精炼的分数时延或多普勒估计。具体地，识别出候选极大值后，先用峰值周围的三点二次插值精炼时延坐标，然后对相应时延行以相同方式精炼多普勒坐标。³ 注意在分数时延与多普勒频移下，(26) 与 (29) 中的粗信道增益估计需按检测索引处相应时延–多普勒域 sinc 响应的值进行补偿 [26]。对感知或定位而言，准确检测分数移位受益于中等偏大的 $M$ 与 $N$（对应更细的时延与多普勒分辨率）。在这类场景中，全 DD 域 LMMSE 均衡的计算代价很高，因而本文改用 [26] 的分块时域 LMMSE 均衡器，因其相关矩阵保持稀疏、支持降复杂度实现。

³ 一般而言，任何分数时延与多普勒估计器都可作用于过采样接收信号或相关输出，因为所提 sunscape 结构不改变相对 EP 设计 [26] 等传统方案而言的离格效应的基本行为。

### B. 信道增益的精细估计

为在不依赖数据辅助方案或显式 SIC 的情况下缓解数据符号干扰，利用海导频结构带来的统计特性。特别是由于导频的周期性，接收信号呈现**循环平稳**统计特性 [8]，具体表现为周期时变均值。首先对 (7) 中 DD 域矩阵 $\mathbf Y={\rm vec}^{-1}_{M,N}(\mathbf y)\in\mathbb C^{M\times N}$ 施加逐行平均，或等价地定义由 (9) 导出的平均接收向量 $\bar{\mathbf y}$，借助平均矩阵 $\mathbf A\in\mathbb C^{L_a\times L_aN}$ [24]：

$$
\bar{\mathbf y}=\mathbf A\mathbf y_a\in\mathbb C^{L_a},\qquad
\mathbf A=\frac{1}{N}\left(\mathbf I_{L_a}\otimes\mathbf 1_{1\times N}\right), \tag{33}
$$

其中 $\mathbf Y_a[m,n]=\mathbf Y[m,n]$（$m=m_a,\dots,M-1$，$n=0,\dots,N-1$），$\mathbf y_a={\rm vec}(\mathbf Y_a)$。

给定由 IV-A 小节得到的检测时延与多普勒频移 $\{(\tilde l_i,\tilde k_i)\}$ 与信道增益粗估计 $\{\tilde g_i\}$，通过依次移除并重新估计每个抽头（并在 $L_a$ 个样本上做额外平均）来精炼信道增益估计。首先从平均信号中减去除最强抽头（$i=0$）以外的抽头：

$$
\mathbf y'_0=\bar{\mathbf y}-\sum_{r=1}^{\tilde L-1}\tilde g_r\left(\mathbf e^{\tilde k_r}[m-\tilde l_r]\odot\mathbf p_a[m-\tilde l_r]\right), \tag{34}
$$

其中 $\mathbf e^{\tilde k_i}\in\mathbb C^{L_a}$ 为表示多普勒频移的复指数向量，定义为 $\mathbf e^{\tilde k_i}=[1,e^{j\frac{2\pi\tilde k_i}{MN}},\dots,e^{j\frac{2\pi\tilde k_i}{MN}(m-1)},e^{j\frac{2\pi\tilde k_i}{MN}m}]^T\in\mathbb C^{L_a}$，$\mathbf p_a[m-\tilde l_i]$ 为按延迟 $\tilde l_i$ 移位后的海导频向量。对 $i=0,\dots,\tilde L-1$，第 $i$ 个抽头的精估计 $\tilde g'_i$ 随后由多普勒补偿信号上的平均得到：

$$
\tilde g'_i=\frac{1}{L_a-\tilde l_i}\sum_{r=0}^{L_a-\tilde l_i-1}\frac{\mathbf y'_i[r]}{\mathbf e^{\tilde k_i}_p[r]},\qquad i=0,\dots,\tilde L-1, \tag{35}
$$

其中 $\mathbf e^{\tilde k_i}_p=\mathbf e^{\tilde k_i}\odot\mathbf p_a[m-\tilde l_i]$。每得到一个精估计后，通过移除已精炼抽头（$r=0,\dots,i-1$）与其余粗估计抽头（$r=i+1,\dots,\tilde L-1$）来更新信号（对 $i=1,\dots,\tilde L-1$，除待估计的第 $i$ 个抽头，即本步 $r\ne i$）：

$$
\mathbf y'_i=\bar{\mathbf y}-\sum_{r=i+1}^{\tilde L-1}\tilde g_r\left(\mathbf e^{\tilde k_r}[m-\tilde l_r]\odot\mathbf p_a[m-\tilde l_r]\right)
-\sum_{r=0}^{i-1}\tilde g'_r\left(\mathbf e^{\tilde k_r}[m-\tilde l_r]\odot\mathbf p_a[m-\tilde l_r]\right). \tag{36}
$$

该流程支持通过重复 (34)–(36) 固定迭代次数 $N_I$ 进一步迭代精炼；不过在平均步骤完成后，额外迭代只带来边际 MSE 增益。

此外，上述精炼流程在分数时延与多普勒频移下同样适用于海导频。对分数时延情形，平均接收向量 $\bar{\mathbf y}\in\mathbb C^{L_a}$ 被变换为过采样版本 $\mathbf y_o\in\mathbb C^{L_{a,o}}$（$L_{a,o}=KL_a$，$K\in\mathbb Z$）：$\mathbf y_o=\mathbf F^H_{L_{a,o}}[\mathbf F_{L_a}\bar{\mathbf y};\ \mathbf 0_{(L_{a,o}-L_a)\times1}]$。海导频序列 $\mathbf p_a$ 与多普勒参考向量 $\mathbf e^{\tilde k_i}$ 施加同样过采样，使所有量位于同一时延网格，随后在 $\mathbf y_o$ 上等价执行 (34)–(36) 的精炼。这使信道增益精炼流程对分数时延依然有效，其操作与整数情形相同，唯一改动是使用过采样向量。

关于分数多普勒，按 (18)，海导频在 DT 域只占据单个多载波符号（$n=0$），因此它们本质上对时间上的多普勒演化不敏感，因为不跨多个符号。接收端在 $n=0$ 处唯一可观测到的多普勒相关贡献是向量 $\mathbf e^{\tilde k_i}$，它只表现为逐时延的相位旋转。因此海导频不受任何多普勒频移效应影响，也不受离格（分数）多普勒影响。该行为及分数时延与多普勒条件下精度的保持，已在第 VI 节通过仿真确认。

### C. 面向感知的目标检测性能

本节以时延与多普勒频移 $l_i$、$k_i$（$i=0,\dots,L-1$）相关的检测概率与虚警概率分析感知性能。定义表示无目标的零假设 $\mathcal H_0$ 与表示有目标的备择假设 $\mathcal H_1$。为简洁，分析基于太阳导频的相关检测情形（适用于长太阳导频）。检测模型定义为

$$
C[l,k]=
\begin{cases}
\mathcal H_0: & V[l,k],\\
\mathcal H_1: & g_i(1-\beta)(NL_y/L_s)|p_s|^2+V[l,k],
\end{cases} \tag{37}
$$

其中 $0\le l\le l_{\max}$、$-k_{\max}\le k\le k_{\max}-1$，$V\sim\mathcal{CN}(0,\sigma^2_v)$ 表示 (27) 中与太阳导频相关后数据与噪声的残余自干扰，总方差 $\sigma^2_v$ 汇总数据干扰 $\sigma^2_d=\beta$ 与噪声 $\sigma^2_z$。由于通常传播抽头或目标数满足 $L\ll MN$（等价于 $MN\to\infty$），应用基础统计分析可证总干扰为

$$
\sigma^2_v=\frac{\beta+\sigma^2_z}{L_s},\qquad
\frac{1}{MN}\sum_{k=0}^{N-1}\sum_{l=0}^{M-1}|C[l,k]|^2\xrightarrow[MN\to\infty]{}\sigma^2_v, \tag{38}
$$

其中数据与噪声引起的干扰方差经相关后按所用样本数（此处为 $L_s$）成比例减小。该分析可作为 (28) 中阈值选择的依据：阈值应选在高于方差 $\sigma^2_v$ 若干电平 $\gamma_l$ 处，以避开干扰，即

$$
\gamma>\gamma_l\sigma_v,\qquad \gamma_l\in\mathbb R,\ \gamma,\gamma_l>0. \tag{39}
$$

该阈值表达式的判决可解释为一种基本的恒虚警率（CFAR）检测，OTFS 语境下 [32] 亦采用相同做法。实践中，在有杂波或非高斯干扰的感知场景下，一种稳健的阈值选择可由 [32] 给出：

$$
\gamma=N_{tc}\left(P_{FA}^{-1/N_{tc}}-1\right), \tag{40}
$$

其中 $P_{FA}$ 为目标虚警概率，$N_{tc}$ 为用于阈值计算的训练单元（DD 资源）数 [32]。检测器随后为

$$
E=|C[l,k]|^2\substack{\mathcal H_1\\\gtrless\\\mathcal H_0}\gamma. \tag{41}
$$

检验统计量 $E$ 服从分布

$$
E\sim
\begin{cases}
\dfrac{\sigma^2_v}{2}\cdot\chi^2_2, & \mathcal H_0,\\[6pt]
\dfrac{\sigma^2_v+\sigma^2_h(NL_y/L_s)(1-\beta)}{2}\cdot\chi^2_2, & \mathcal H_1.
\end{cases} \tag{42}
$$

因此，虚警概率 $P_{FA}$ 与检测概率 $P_D$ 可按如下确定（其中已代入 (38) 的 $\sigma^2_v$）：

$$
P_{FA}(\beta,L_s)=\exp\left(-\frac{\gamma L_s}{\beta+\sigma^2_z}\right), \tag{43}
$$
$$
P_D(\beta,L_s)=\exp\left(-\frac{\gamma L_s}{\beta+\sigma^2_z+\sigma^2_hN(L_s+l_{\max})(1-\beta)}\right). \tag{44}
$$

实践中检测性能受所用序列自相关特性的影响。(43) 与 (44) 表明：随着太阳导频序列长度 $L_s$ 增大，检测概率 $P_D$ 增大而虚警概率 $P_{FA}$ 减小，从而带来成功的检测性能，这一点已由第 VI 节仿真确认。

### D. 面向通信的信道估计 MSE

本小节在时延与多普勒频移被完美检测（即 $\tilde l_i=l_i$、$\tilde k_i=k_i$）的假设下，分析精炼信道增益估计 $\tilde g'_i$（$i=0,\dots,\tilde L-1$）的 MSE 性能。目标是基于数据与噪声残余干扰的方差，评估海导频估计信道增益的准确度。IV-B 小节的信道增益精炼利用了信号的统计特性：DD 域接收信号 $\mathbf y\in\mathbb C^{MN}$ 呈现循环平稳统计特性（周期时变均值）。因此应用大数定律 [33]：

$$
\frac{\sum_{q=0}^{MN-1}\mathbf x_d[q]}{MN}\xrightarrow[MN\to\infty]{}0,\qquad
\frac{\sum_{q=0}^{MN-1}\mathbf z[q]}{MN}\xrightarrow[MN\to\infty]{}0, \tag{45}
$$

其中 $q=0,\dots,MN-1$；可见平均过程使数据 $\mathbf x_d$ 与噪声 $\mathbf z$ 的影响消失（二者均值为零），而剩余部分趋于受信道影响的导频序列值，可用于信道估计。也就是说，在 $N$ 个符号上平均后的接收向量 $\bar{\mathbf y}$（$m=0,\dots,L_a-1$）渐近趋于下式：

$$
\bar{\mathbf y}\xrightarrow[N\to\infty]{}\sqrt{1-\beta}\sum_{i=0}^{L-1}g_iz^{k_i(m-l_i)}p_a[m-l_i]\in\mathbb C^{L_a}. \tag{46}
$$

此外，为在全部可用资源上做平均（实践中可得到更准确的估计），采用 (34)、(35)、(36) 设计的算法，它支持在 $L_a$ 个符号上做额外平均。该平均所得精估计 $\tilde g'_u$ 渐近趋于其真值：

$$
\frac{1}{L_a}\sum_{r=0}^{L_a-1}\frac{\mathbf y'_i[r]}{\mathbf e^{\tilde k_i}_p[r]}\xrightarrow[L_a\to\infty]{}g_i,\qquad i=0,\dots,\tilde L-1. \tag{47}
$$

因此实践中数据与噪声干扰将按平均所用符号数减小。为简洁，经若干统计运算后，(36) 中平均后数据与噪声残余干扰的方差（分别记为 $\sigma^2_{d'}$ 与 $\sigma^2_{z'}$）为

$$
\sigma^2_T=\sigma^2_{d'}+\sigma^2_{z'},\qquad
\sigma^2_{d'}=\frac{\sigma^2_d}{NL_a}=\frac{\beta}{NL_a},\qquad
\sigma^2_{z'}=\frac{\sigma^2_z}{NL_a}, \tag{48}
$$

其中 $\sigma^2_T$ 表示 (36) 中与海导频相关后数据干扰与噪声的总贡献。定义 $\mathbf g[i]=g_i$ 与 $\hat{\mathbf g}[i]=\tilde g_i$，分别表示在全部已检测目标 $\tilde L$ 中正确检测目标 $\hat L$（即对 $i=0,\dots,\hat L-1$ 有 $\tilde l_i=l_i$、$\tilde k_i=k_i$）的真实与估计信道系数，则 MSE 为

$$
{\rm MSE}=\mathbb E\left\{\|\mathbf g-\hat{\mathbf g}\|^2\right\}. \tag{49}
$$

因此 MSE 下界为

$$
{\rm MSE}(\beta,L_s\mid\tilde l_i=l_i,\tilde k_i=k_i)\ge\sigma^2_T=\frac{\beta+\sigma^2_z}{NL_a}. \tag{50}
$$

这表明对给定检测抽头，其信道复增益 MSE 主要作为海导频长度 $L_a$ 的函数被最小化（前提 $L_a>N$）。考虑到 $L_a=M-L_s-l_{\max}$，MSE 随太阳导频长度 $L_s$ 增大而增大。注意该分析是在 (13) 的参数设计约束（必须满足，故 $L_s\ge1$）下导出的。此外该表达式指检测抽头的 MSE，因为只有在其时延与多普勒被正确识别后估计精度才有意义；检测性能与估计精度的联合影响随后纳入第 V-B 节的参数设计。如第 VI-D 与 VI-F 节的经验评估所示，漏检与虚警对最终 MSE 的影响在通信系统典型相关的 SNR 范围（SNR > 0 dB）内可忽略。

## V. 计算复杂度与参数设计

本节分析新颖 sunscape 导频图案与所提信道估计技术的实践方面。首先以复乘积次数探讨接收端计算复杂度；随后考察 sunscape 导频图案参数（即 $\beta$ 与 $L_s$）的设计。为在信道 MSE、检测性能与 PAPR 方面优化其设计，我们提出一个在满足 PAPR 约束下最小化 MSE、最大化检测性能的优化问题，并用启发式方法离线求解。

### A. 接收端计算复杂度

本节分析采用 sunscape 导频图案的所提信道估计方法的计算复杂度，并在表 I 中与现有方法（特别是 EP [6] 与其他 ST（非 EP）技术）比较。鉴于本文导频取单位幅度，除法（等价于乘以倒数）可简化为相位域的实数加法。这显著降低了计算复杂度，因为唯一额外的操作是把复数从直角坐标转成极坐标；实践中可用 CORDIC 算法 [34] 高效实现。

关于短太阳导频情形（IV-A1）的目标检测复杂度（对表 III 的参数，$L_s\le3$），获得 $\tilde l_i$ 与 $\tilde k_i$ 需计算 (25) 中接收信号相关部分的绝对值，涉及 $(2k_{\max}+1)(l_{\max}+L_s+1)$ 次复乘。为获得粗估计 $\tilde g_i$，(26) 的运算涉及 $2\tilde L$ 次实加。对长太阳导频情形（IV-A2，对表 III 的参数 $L_s>3$），获得 $\tilde l_i$ 与 $\tilde k_i$ 的相关过程涉及 $2(l_{\max}+1)(2k_{\max}+1)L_s$ 次实加，而计算矩阵相关部分涉及 $(2k_{\max}+1)(l_{\max}+1)$ 次复乘；这同时借助 (29) 给出粗估计 $\tilde g_i$。在分数多普勒情形，IV-A4 小节中的过采样与插值流程会涉及更大的 DFT 尺寸 $N_o$。

若用海导频做时延检测、把太阳导频留给多普勒检测（IV-A3），则经 (30) 与海导频相关检测时延 $\tilde l_i$ 仅涉及 $L_a l_{\max}$ 次实加；用太阳导频做多普勒检测涉及 $2\tilde L(2k_{\max}+1)L_s$ 次实加与 $(2k_{\max}+1)(l_{\max}+1)$ 次复乘。

IV-B 小节所述信道增益精炼流程的计算复杂度（以复加计）为 $N_I(L_aN+2L_a\tilde L-L_a+(\tilde L^2-\tilde L)/2)$，其中 $N_I$ 为迭代次数，其值保持较低——如 IV-B 节所述，即使 $N_I=1$ 也已足够。可以证明该流程无需复乘即可实现，从而保证低复杂度，使所提方法在实际实现中更高效。

需指出：使用长太阳导频的相关检测（IV-A2）带来更低 PAPR，而基于海导频的时延检测（IV-A3）提供更鲁棒的性；但两种方法都只带来可忽略的复杂度增加。相反，短太阳导频的阈值检测（IV-A1）复杂度最低，代价是更高 PAPR。表 I 比较了所提方法与现有方法的复杂度（含长太阳导频情形的复乘次数）。对 [9], [13], [19], [21] 的参数，$S$ 表示星座大小，$Q$ 为基扩展模型（BEM）阶数，$N_{IR}$ 为参考工作的迭代次数。所提方法的计算代价与 [6] 中 EP 方案相当，同时具有更高的频谱效率与更低 PAPR；相反，其他基于 ST 的方法因依赖与 OTFS 结合的 SIC 而复杂度显著更高。这些比较在第 VI 节通过仿真验证。

**表 I：** 复乘积次数意义下的复杂度分析。

| OTFS 信道估计方法 | 复乘积次数 |
|---|---|
| 所提 Sunscape | $(2k_{\max}+1)(l_{\max}+1)$ |
| 参考 EP [6] | $(2k_{\max}+1)(l_{\max}+1)+5L$ |
| 参考 SP-NI 与 SP-I [9] | $(L^2MN+L^2+L)+O(L^3)+L(MN+1)+L^2+O(N_{IR}MNLS)$ |
| 参考 SP 迭代 [19] | $O(N_{IR}QMN\log(MN))$ |
| 参考 Single-Pilot-ST [13] | $O(N_{IR}MN\log(MN))$ |
| 参考 Partial-Pilots 1 [21] | $O(N_{IR}l^2_{\max}N^2P)+O(N_{IR}N(2l_{\max}-1)LS)+O(N_{IR}MNPS)$ |
| 参考 Partial-Pilots 2 [22] | $O((NM)^3)$ |

**算法 1：$\beta$ 与 $L_s$ 的优化**

1: **输入：** $\mathcal B$、$\mathcal L$、$P_{\max}$、${\rm PAPR}_{\max}$、$l_{\max}$、$M$
2: **初始化：** $f_{\rm obj}=\infty$
3: **for** 每个 $\beta\in\mathcal B$ **do**
4: 　**for** 每个 $L_s\in\mathcal L$ **do**
5: 　　计算 $L_y=L_s+l_{\max}$；若 $L_y>M$，continue
6: 　　计算 $L_a=M-L_y$
7: 　　生成归一化到 $P_{\max}$ 的信号 $\mathbf s_p$
8: 　　计算 ${\rm PAPR}(\mathbf s_p,\beta,L_s)$
9: 　　若 ${\rm PAPR}(\mathbf s_p,\beta,L_s)>{\rm PAPR}_{\max}$，continue
10: 　　按 (50) 计算 ${\rm MSE}(\beta,L_s)$
11: 　　按 (44)、(43) 计算 $P_D(\beta,L_s)$ 与 $P_{FA}(\beta,L_s)$
12: 　　$f'_{\rm obj}={\rm MSE}(\beta,L_s)/\left[P_D(\beta,L_s)(1-P_{FA}(\beta,L_s))\right]$
13: 　　若 $f'_{\rm obj}<f_{\rm obj}$ **then**
14: 　　　$f_{\rm obj}=f'_{\rm obj}$，$\beta^*=\beta$，$L^*_s=L_s$
15: **return** $\beta^*,L^*_s$

**表 II：** 太阳导频区间及其折中汇总。

| 检测区间 | 短太阳导频 | 长太阳导频 |
|---|---|---|
| 定义（式 (20)） | $1\le L_s\le\left\lceil\frac{l_{\max}}{N-1}\right\rceil$ | $L_s>\left\lceil\frac{l_{\max}}{N-1}\right\rceil$ |
| 抽头检测方法 | 直接对接收信号做阈值判决 | 相关 |
| 海导频（$L_a=M-L_s-l_{\max}$） | 高 | 低 |
| MSE（增益） | ✓✓（更低） | ✓（更高） |
| PAPR | ✓（更高） | ✓✓（更低） |

> **原文疑点：** 表 II 第一行 “Definition (20)” 引用的应为式 (22)：短/长太阳导频的划分规则 $L_s\ge\lceil l_{\max}/(N-1)\rceil$ 由式 (22) 导出，而式 (20) 给出的是 ${\rm PAPR}(\mathbf s_p,L_s)$ 的定义。本译按原文照录并加注。

> **原文疑点：** 按式 (22)，阈值 $\lceil l_{\max}/(N-1)\rceil$ 在表 III 参数下（$l_{\max}=4$、$N=16$）等于 $\lceil 4/15\rceil=1$，即短太阳导频应为 $L_s=1$、长太阳导频应为 $L_s>1$；但第 IV-A 与 V-A 节讨论短/长导频复杂度时称“对表 III 的参数，短太阳导频为 $L_s\le3$、长太阳导频为 $L_s>3$”，第 VI 节的检测结果也按 $L_s=1,2,3$ 作为直接阈值检测处理，与式 (22) 算出的阈值 1 不一致（疑为正文数值阈值笔误，或式 (22) 中 $N$ 的含义与仿真取值不同）。本译按原文照录并加注。

### B. Sunscape 导频图案的参数设计

所提 sunscape 导频图案的性能与有效性在很大程度上取决于两个关键参数的正确选取：太阳导频符号数 $L_s$ 与数据功率分配因子 $\beta$。表 II 汇总了 $L_s$ 选择的折中。时延与多普勒检测、准确信道增益估计与 PAPR 之间的折中，主要由太阳导频序列 $L_s$ 的恰当设计决定；海导频 $L_a$ 则依赖 $L_s$ 的选择以及信道最大时延扩展 $l_{\max}$（如 (13) 所述）。$l_{\max}$ 的取值实践中应按 ZP/CP 长度选择；其恰当选择可避免太阳与海导频之间的干扰。一般可采用标准或系统设计给出的 ZP/CP 长度（其中已含余量以避免欠配置）；过度配置该值可能以更高 PAPR 为代价换取更低 MSE。

因此，为联合优化信道增益估计与目标检测性能，提出如下优化问题：

$$
\min_{\beta,L_s}\ f_{\rm obj}(\beta,L_s)=\frac{{\rm MSE}(\beta,L_s)}{P_D(\beta,L_s)\left(1-P_{FA}(\beta,L_s)\right)}
$$
$$
\text{s.t.}\quad
\frac{1}{MN}\sum_{q=0}^{MN-1}|\mathbf s[q]|^2=P_{\max},\quad
{\rm PAPR}\left(\sqrt{1-\beta}\mathbf s_p,\beta,L_s\right)\le{\rm PAPR}_{\max},
$$
$$
1\le L_s\le M-l_{\max}-1,\ L_s\in\mathbb Z;\quad
0\le\beta\le1,\ \beta\in\mathbb R;\quad
L_y>L_s+l_{\max},\ 1\le L_y\le M-1;\quad
L_a=M-L_y,\ 1\le L_a\le M-1. \tag{51}
$$

(51) 中的目标函数旨在联合优化估计精度与目标检测性能。如第 IV 节所示，需被最小化的信道增益 MSE 本质上依赖目标检测的成功，因此分母把检测概率与虚警概率作为一个联合项：最大化检测同时惩罚虚警。该目标函数确保在鲁棒检测性能条件下实现 MSE 最小化。由于 $L_s\in\mathbb Z$、$\beta\in\mathbb R$，该问题构成混合整数优化问题；目标函数的非凸性也使其无法导出闭式解。为此，我们采用基于两阶段离线穷举搜索的启发式优化策略：先选定固定的 $\beta$，再对 $L_s$ 的可能取值做扫描以确定最优太阳导频长度。伪代码见算法 1，其中 $\mathcal B$ 与 $\mathcal L$ 分别表示 $\beta$ 与 $L_s$ 的输入取值集合。此外，(22) 导出的 $L_s$ 下界闭式表达式可用于选取可作为优化问题输入的最小 $L_s$，并保证 PAPR 约束得到满足。⁴

⁴ 注意该优化问题意在离线执行，作为给定业务配置（给定 $P_D$、$P_{FA}$、MSE、PAPR 上限与最大时延扩展，后者由 ZP/CP 长度给出）的设计步骤。对每类业务或场景，这些工作条件都固定，因此优化在系统设计时只需执行一次。

**表 III：** 仿真参数。

| 参数 | 取值 |
|---|---|
| OTFS 帧尺寸 | $M=512$、$N=16$ |
| 路径数 | $L=4$ |
| 载频 | $f_c=4$ GHz |
| 最大归一化时延移位 | $l_{\max}=4$、$\tau_{\max}=520.83$ ns |
| 子载波间隔 | $\Delta f=15$ kHz |
| 最大归一化多普勒频移 | $k_{\max}=2$、$\nu_{\max}=1875$ Hz |
| 调制 | QPSK |
| 最大距离与速度 | $R_{\max}=156.25$ m、$V_{\max}=506.25$ km/h |
| 数据功率分配因子 | $\beta=0.8,0.85,0.9,0.95$ |
| 信道功率与 ZP 长度 | $\sigma^2_h=1$、$L_{ZP}=40$ |

**图 5：** 目标函数随太阳导频长度 $L_s$ 的变化。

**图 6：** 计算复杂度对比。

具体地，增加 $L_s$ 会延长太阳导频序列，从而改善发射信号的 PAPR 特性；另一方面，减小 $L_s$ 会通过增大 $L_a$ 而增加周期海导频的符号数，从而改善干扰抑制并最小化信道估计 MSE。注意若用太阳导频做相关，实践中必须考虑所选 ZC 序列的旁瓣电平 [30]。参数 $\beta$ 控制导频与数据符号之间的整体功率分配；选择合适的 $\beta$ 对确保通信与感知性能之间有利的折中至关重要。

总体上，该设计保证 1) 借助太阳导频实现准确目标检测；2) 借助海导频降低信道增益估计的 MSE；3) 通过延长太阳导频实现降低且可调的 PAPR。

## VI. 性能评估

本节通过仿真评估采用 sunscape 导频图案的所提信道估计方法的性能。首先，VI-A 小节给出针对给定场景推导最优 sunscape 图案设计的优化问题结果；随后 VI-B 小节给出计算复杂度的数值结果；VI-C 小节评估不同配置下的 PAPR；VI-D 小节给出信道增益估计的 MSE 结果，VI-E 小节评估 BER，VI-F 小节分析感知性能，最后 VI-G 小节研究分数多普勒频移下的性能。为完整起见，评估涵盖与代表性 ST 方法在复杂度与信道增益 MSE 上的比较（这些方法有解析基准与可扩展实现）；对 BER 性能，主要聚焦既有 EP [6] 基准，它为数据检测错误概率提供了有意义的下界，并能在现实工作条件下可靠评估本方法。

除另有说明，仿真参数如表 III 所示。如第 II 节所述，考虑 SISO 系统。⁵ 与 [23]、[26] 类似，归一化时延移位 $l_i$ 在 $[0,l_{\max}]$ 上均匀分布；按广泛采用的 [6]、[9]、[26]，每个目标的多普勒频移按 Jakes 公式 $\nu_i=\nu_{\max}\cos(\theta_i)$ 生成，其中 $\theta_i$ 在 $[-\pi,\pi]$ 上均匀分布。仿真参数同时用于 EP 方法 [6] 与所提 sunscape 方法的导频图案设计：对 EP 方法，导频开销为 $(2L_{ZP}+1)(4k_{\max}+1)$；对所提 sunscape 图案，必须满足 (13) 中 $L_y\ge L_s+L_{ZP}$ 的条件，因此考虑 $L_{ZP}=40$，在 $L_s<50$ 时取 $L_y=80$，而当 $L_s=50$ 时取 $L_y=90$（由 $L_s$ 的最优值驱动）。为确保通信性能不受损，数据传输的功率分配因子约束为 $\beta\ge0.8$。

⁵ 把 sunscape 导频概念扩展到多输入多输出（MIMO）、多用户与多基站 OTFS 场景是未来研究的有前景方向，因为其基于 ZC 序列的结构化设计可能与空间复用兼容并带来有趣的性能优势。

### A. 叠加 sunscape 导频图案的最优设计

图 5 给出使用表 III 仿真参数、经算法 1 求解 (51) 优化问题所得结果。分析在 SNR = 5 dB 下进行，以反映具有挑战性但仍实际的worst-case场景。识别出的最优参数为 $L^*_s=50$ 与 $\beta^*=0.8$，本文其余部分均采用该取值。这些取值给出 MSE $=10^{-4}$、检测概率 $P_D=0.8$、虚警概率 $P_{FA}<10^{-6}$。该优化利用前文导出的闭式解析表达式离线完成，为系统的实际性能提供了有价值的洞见。这些参数的有效性将在后续各节的数值结果中进一步展示。

### B. 计算复杂度

图 6 给出基于 ST 方法计算复杂度的比较。对 [9], [13], [19], [21]，取 $S=4$、$Q=9$、$N_{IR}=5$（[19] 除外，其 $N_{IR}=75$）。结果按不同子载波/时延格数 $M$ 给出；此处沿用表 I 的记号，对 $M=1024$ 取 $l_{\max}=80$，并对 $M=128$ 与 $M=16$ 按比例缩放其值。所引用方法依赖迭代技术，往往需要涉及大量复乘的数据检测方案。尽管在较小 $M$ 时这些参考方法所需的复乘次数可能相对合理，但可以看到，对更大、也更现实的 $M$，这些最先进算法的计算量变得难以承受。结果是这些方法只能在非常小的 $M$ 与 $N$ 下工作；然而这并不现实，尤其对 $M$ 而言，因为大取值对获得高分辨率时延（距离）检测必不可少。因此可以得出结论：所提基于 sunscape 导频图案的 ISAC 信道估计方案在计算复杂度上改进了现有算法。

### C. PAPR 性能

PAPR 性能如图 7 与图 8 所示，其中 $\gamma_P$ 表示高于平均功率的相对功率（dB）。图 7 在 $\beta^*=0.8$ 下评估不同 $L_s$ 取值的 PAPR，并与 EP [6] 及基于 ST 的技术（仅有海导频的情形与单导频 ST 方法 [13]）比较；后者由叠加在网格中心的单个导频构成。作为基准，图中还绘出无导频 OTFS 信号的 PAPR（虚线），其余情形均指完整时域发射信号 $\mathbf s$。如 [9] 的全导频 ST 图案不会使信号 PAPR 退化，但该方法本身不能检测时延与多普勒频移，需借助 EP 方法 [6]，从而引入 PAPR 退化。尽管存在 [20] 等 PAPR 降低技术，它们会增加复杂度且可施加于任何方法，故为公平比较不予考虑。

如图 7 所示，PAPR 可通过延长太阳导频长度来调整。当该长度足够长时，PAPR 限制由海导频特性决定。因此该图结果展示了 (22) 导出的闭式表达式关于 $L_s$ 的行为。若要进一步降低 PAPR，需减小 $N$ 或 $(1-\beta)$，代价是牺牲通信与感知性能；图 8 亦说明了这一点——它给出不同 $\beta$ 取值下 PAPR（取 $10^{-3}$ 概率处的值）随 $L_s$ 的变化。若去掉海导频结构，叠加导频图案将呈恒包络，使所得信号与无导频 OTFS 情形非常接近；然而由于海导频在信道增益精炼中起重要作用，实践中去除它可能导致 MSE 增大。

### D. 信道增益估计的 MSE

图 9 给出整数多普勒情形下信道增益估计 MSE 性能，比较所提方法与现有方法，包括 [9] 的 SP 非迭代（SP-NI）与迭代数据辅助（SP-I）下界，以及 [13] 的非数据辅助方法；图中还含所提方法的 MSE 下界作为基准，并纳入经典 EP 方案以便完整比较。由于 EP 分配专用导频符号，它在所有比较方案中 MSE 最低；但代价是更高 PAPR 与导频开销，导致频谱效率降低。结果表明，sunscape 导频图案无需复杂 SIC 或数据辅助方案即可实现准确信道估计（不同于参考方法）；这一改进来自利用信号统计特性，而海导频的使用与低复杂度信道增益精炼算法使其成为可能。在 $L_s=50$ 情形需要更大的 $L_y=90$，因而 $L_a$ 更低，导致 MSE 相较 $L_s=1$ 与 $L_s=2$ 略差；后者以更高 PAPR 为代价换取 MSE 上可忽略的改善。

### E. BER 性能

图 10 给出整数多普勒频移下所提方法与其他方案的 BER 性能。本节考虑高功率放大器（HPA）的影响，因为存在 HPA 时 PAPR 高度相关并直接影响 BER。作为基准，图中含无 HPA 的理想 EP 情形——它以糟糕的频谱效率与难以接受的 PAPR 为代价提供准确信道估计。为公平比较，EP 方法被调整到与所提方法相同的 PAPR，此时观察到显著退化（HPA 情形）。此外，图中还纳入 [13] 所用的单导频 ST 叠加图案作为参考，且该比较中不施加信道增益精炼或 SIC；这用于说明仅把功率集中在少数符号上并不够——即便不考虑 HPA 效应，通信性能也会退化。所提 sunscape 导频图案接近理想情形运行，显示其有效性。然而当使用 $L_s=1$ 时，高 SNR 下会出现高平台的误差底。这是因为孤立导频（太阳导频）中的功率集中，在数据检测前减去导频时会放大任何残余信道估计误差。为缓解该问题，把太阳导频延长到 $L_s=2$ 有助于降低误差底水平，但未完全解决；当采用长太阳导频时，基于 ZC 的相关方法有效最小化了导频与数据之间的干扰，从而完全解决该问题。事实上，$L_s^*=50$ 的结果表明该方法确实降低了误差底、改善了高 SNR 性能。因此，鉴于 EP 方案提供了迄今已知最佳 BER 性能 [6], [26]，这些结果确认所提方法接近该基准运行，同时导频开销与 PAPR 显著更低，且相对其他 ST（非 EP）方案具有更低计算复杂度与 MSE（见 VI-B 与 VI-D 小节）。此外，这些结果表明本提案的叠加过程几乎不影响检测性能。

为完整起见，图 11 在 [21] 的设置下（$M=128$、$N=16$、$f_c=3$ GHz、$l_{\max}=5$）把所提 sunscape 图案的 BER 与最先进 EP [6] 及 [9], [21] 的 ST 方案比较；sunscape 参数配置为 $L_s=30$、$L_y=51$、$\beta=0.8$。结果表明 sunscape 方法在保持显著更低计算复杂度的同时取得相当或略优的 BER。

### F. 感知评估：目标检测性能

本节评估所提方法的目标检测性能。图 12 给出不同 $L_s$ 取值下目标的检测概率 $P_D$（并标注虚警概率 $P_{FA}$）。$L_s=1$ 情形取得最佳检测性能（且复杂度最低），其 $P_{FA}$ 未显著受损，代价是更高 PAPR。当 $L_s$ 增至 $2$ 时检测概率下降、$P_{FA}$ 略升；进一步增至 $L_s=3$ 时，由于不使用相关时数据干扰随太阳导频延长而增大，性能退化。$L_s=50$ 时 ZC 相关方法的有效性得到验证：它在极低 $P_{FA}$ 与低 PAPR 下实现令人满意的检测。总体而言，调整 sunscape 导频图案的设计参数可在 PAPR 与感知性能之间折中；不过在多数情形都能取得高度令人满意的检测性能。极低 SNR 下可能出现的少量漏检或虚警大多涉及弱路径；如图 9 所确认，这对最终信道增益 MSE 影响可忽略，因为最强抽头仍被可靠检测，而平均过程即便在噪声与干扰下也能给出准确、鲁棒的信道增益估计。

### G. 分数时延与分数多普勒频移下的性能

我们评估存在分数时延与分数多普勒频移时所提方法的性能。这些分数移位引入实际 OTFS 信道固有的离格失配，并产生额外干扰。为准确刻画该效应，并在代表实际实现与 5G 标准参数配置的参数下运行，我们取 $M=1024$、$N=64$、$\beta=0.9$、$L_{ZP}=80$、$l_{\max}=40$，过采样因子 $K=4$，即 $M_o=4M$、$N_o=4N$。

图 13 给出所得信道增益估计 MSE。EP [6] 作为参考纳入，如预期取得最低 MSE，代价是 PAPR 大幅升高与频谱效率下降。所提 sunscape 方案与 [9]、[13] 中代表性 ST 方法比较（给出其下界 MSE 性能）：sunscape 方法取得相当或更优性能，同时保持 VI-B 节所述显著更低的计算复杂度。因此所提方案对整数与分数多普勒频移均有效。图 14 进一步考察分数移位下海导频的性能，比较整数与分数时延/多普勒情形下的信道估计 MSE：分数时延移位使 MSE 性能略有退化；相反，如 IV-B 节所述，由于海导频的特殊排列，用海导频做信道复增益精炼几乎不受分数多普勒效应影响。结果确认海导频精炼方法可扩展到离格场景，在分数效应下保持信道增益估计的鲁棒性。

最后，图 15 给出发送性能（BER）比较。与图 10 一样，EP 方案 [6] 作为基准纳入，并如 VI-E 节所述评估非线性 HPA 的影响。所提 sunscape 方法在分数时延与多普勒频移下保持可靠 BER 性能，同时以低 PAPR 与低复杂度运行。

**图 7：** OTFS、EP 与基于 ST 的导频方案在 $\beta=0.8$ 下的 PAPR。

**图 8：** 在 $10^{-3}$ 概率处 PAPR 随太阳导频长度 $L_s$ 的变化。

**图 9：** 整数时延与多普勒频移下，sunscape 导频图案、其下界与包括 EP [6] 在内的其他方案的信道增益估计 MSE 随 SNR 的变化。

**图 10：** 所提 sunscape 图案、理想 EP（无 HPA）基准 [6] 与实际 EP 的 BER 随 SNR 变化（整数时延与多普勒频移）。

**图 11：** 所提 sunscape 图案与最先进方法的 BER 随 SNR 对比。

**图 12：** sunscape 图案的检测概率 $P_D$ 随 SNR 变化（以虚警概率 $P_{FA}$ 为参数）。

**图 13：** 分数时延与分数多普勒频移下，sunscape 图案、其下界与其他最先进方案的信道增益估计 MSE 随 SNR 变化。

**图 14：** sunscape 图案（$L_s=200$）的信道增益估计 MSE 随 SNR 变化：整数（Int.）与分数（Fract.）时延及多普勒频移的对比。

**图 15：** 分数时延与分数多普勒频移下，所提 sunscape 图案、理想 EP（无 HPA）基准 [6] 与实际 EP 的 BER 随 SNR 变化。

## VII. 结论

本文提出 DD 域一种新颖的叠加导频图案（称为 sunscape 导频图案），以及面向 OTFS-ISAC 的原创信道估计技术。其名称“sunscape”体现了精心设计：它由孤立导频结构（太阳导频）与周期导频图案（海导频）组成。太阳导频实现时延与多普勒频移（整数与分数）的准确检测，海导频的周期结构则允许在接收端利用信号统计特性获得准确信道增益估计；此外，海导频在特定条件下还可用于增强时延检测。该结构通过恰当的信号平均抑制数据与噪声引起的自干扰。

为设计该叠加 sunscape 导频图案，本文提出最小化信道估计 MSE 并最大化目标检测性能的优化问题，并通过启发式方法求解。仿真结果表明，与现有方法不同，所提方法无需数据辅助干扰消除技术即可实现准确信道估计，从而降低计算复杂度，同时允许 PAPR 调整。因此，所提方法为 OTFS 实现了低复杂度、高精度的信道估计。基于 ST 的新颖 sunscape 导频图案及其信道估计技术，是同时实现高速通信与高分辨率雷达感知的突出候选方案，为 6G 及更远 ISAC 系统提供了实用可行的解决途径。

## 参考文献（英文原条目，按原文顺序）

[1] J. Wang, N. Varshney, C. Gentile, S. Blandino, J. Chuang, and N. Golmie, “Integrated sensing and communication: Enabling techniques, applications, tools and data sets, standardization, and future directions,” *IEEE Internet Things J.*, vol. 9, no. 23, pp. 23 416–23 440, 2022.
[2] F. Liu, C. Masouros, A. P. Petropulu, H. Griffiths, and L. Hanzo, “Joint radar and communication design: Applications, state-of-the-art, and the road ahead,” *IEEE Trans. Commun.*, vol. 68, no. 6, pp. 3834–3862, 2020.
[3] Y. Ma, B. Ai, J. Yuan, S. Li, Q. Cheng, Z. Shi, W. Yuan, Z. Wei, A. Shafie, G. Ma, Y. Lu, M. Yang, and Z. Zhong, “Delay-doppler domain signal processing aided OFDM (DD-a-OFDM) for 6G and beyond,” 2025. [Online]. Available: https://arxiv.org/abs/2508.04253
[4] L. Gaudio, G. Colavolpe, and G. Caire, “OTFS vs. OFDM in the presence of sparsity: A fair comparison,” *IEEE Trans. Wirel. Commun.*, vol. 21, no. 6, pp. 4410–4423, 2022.
[5] R. Hadani and A. Monk, “OTFS: A new generation of modulation addressing the challenges of 5G,” 2018.
[6] P. Raviteja, K. T. Phan, and Y. Hong, “Embedded pilot-aided channel estimation for OTFS in delay–doppler channels,” *IEEE Trans. Veh. Technol.*, vol. 68, no. 5, pp. 4906–4917, 2019.
[7] Y. Ma, G. Ma, N. Wang, Z. Zhong, and B. Ai, “OTFS-TSMA for massive internet of things in high-speed railway,” *IEEE Trans. Wirel. Commun.*, vol. 21, no. 1, pp. 519–531, 2022.
[8] A. Orozco-Lugo, M. Lara, and D. McLernon, “Channel estimation using implicit training,” *IEEE Trans. Signal Process.*, vol. 52, no. 1, pp. 240–254, 2004.
[9] H. B. Mishra, P. Singh, A. K. Prasad, and R. Budhiraja, “OTFS channel estimation and data detection designs with superimposed pilots,” *IEEE Trans. Wirel. Commun.*, vol. 21, no. 4, pp. 2258–2274, Apr. 2022.
[10] V. Yogesh, S. Rao Mattu, and A. Chockalingam, “Iterative channel estimation/detection for DZT-OTFS using superimposed pilot frames,” in *IEEE VTC-Spring*, 2024, pp. 1–6.
[11] W. Yuan, S. Li, Z. Wei, J. Yuan, and D. W. K. Ng, “Data-aided channel estimation for OTFS systems with a superimposed pilot and data transmission scheme,” *IEEE Wirel. Commun. Lett.*, vol. 10, no. 9, pp. 1954–1958, 2021.
[12] C. Yang, J. Wang, Z. Pan, and S. Shimamoto, “Delay-doppler frequency domain-aided superimposing pilot OTFS channel estimation based on deep learning,” in *IEEE VTC-Fall*, 2022, pp. 1–6.
[13] Y. Wu, C. Han, and Z. Chen, “DFT-spread orthogonal time frequency space system with superimposed pilots for terahertz integrated sensing and communication,” *IEEE Trans. Wirel. Commun.*, vol. 22, no. 11, pp. 7361–7376, 2023.
[14] Y. Kanazawa, H. Iimori, C. Pradhan, S. Malomsoky, and N. Ishikawa, “Multiple superimposed pilots for accurate channel estimation in orthogonal time frequency space modulation,” in *IEEE VTC-Fall*, 2023, pp. 1–5.
[15] F. Jesbin, S. Rao Mattu, and A. Chockalingam, “Sparse superimposed pilot based channel estimation in OTFS systems,” in *IEEE WCNC*, 2023, pp. 1–6.
[16] S. Rao Mattu and A. Chockalingam, “Fractional delay-doppler channel estimation in OTFS with sparse superimposed pilots using RNNs,” in *IEEE VTC-Spring*, 2023, pp. 1–6.
[17] M. Zhou, F. Chen, H. Yu, and J. Lu, “Iterative channel estimation for OTFS systems based on low-PAPR hybrid superimposed pilots,” *IEEE Commun. Lett.*, vol. 28, no. 8, pp. 1939–1943, 2024.
[18] M. A. Sheikh, A. Rajoriya, P. Singh, and R. Budhiraja, “Bayesian learning-aided channel estimators for superimposed-pilot based OTFS systems,” *IEEE Trans. Commun.*, pp. 1–1, 2024.
[19] F. Huang, Q. Guo, Y. Zhang, and Y. V. Zakharov, “Message passing-based joint channel estimation and signal detection for OTFS with superimposed pilots,” *IEEE Trans. Veh. Technol.*, vol. 73, no. 8, pp. 11 531–11 542, 2024.
[20] S. Kumari, H. B. Mishra, and S. Mukhopadhyay, “Peak-to-average power ratio analysis for embedded pilot and superimposed pilot aided OTFS waveform,” in *IEEE GCON*, 2023, pp. 1–6.
[21] A. Gao, H. Yu, and H. Wang, “OTFS channel estimation with superimposed pilots based on compressed sensing,” in *WCSP*, 2023, pp. 1114–1119.
[22] R. Ouchikh, A. Alssa–El–Bey, T. Chonavel, and N. Lassami, “Optimal partially superimposed pilot pattern for OTFS communication,” in *IEEE VTC-Spring*, 2024, pp. 01–05.
[23] Z. Chen, X. Zheng, and X. Chen, “Delay-wise superimposed pilot based compressed sensing channel estimation for OTFS systems,” in *IEEE VTC-Fall*, 2023, pp. 1–5.
[24] L. Méndez-Monsanto, K. Chen-Hu, M. J. Fernández-Getino García, and A. García Armada, “Robust integrated sensing and communications in delay-doppler domain using superimposed training,” in *IEEE Globecom Wkshps*, 2023, pp. 1404–1409.
[25] ——, “Deep learning-aided robust integrated sensing and communications with OTFS and superimposed training,” in *IEEE Meditcom*, 2023.
[26] Y. Hong, T. Thaj, and E. Viterbo, *Delay-Doppler Communications: Principles and Applications*. Elsevier, 2022.
[27] W. Shen, L. Dai, S. Han, I. Chih-Lin, and R. W. Heath, “Channel estimation for orthogonal time frequency space (OTFS) massive MIMO,” in *ICC*, 2019, pp. 1–6.
[28] P. Priya, E. Viterbo, and Y. Hong, “Low complexity MRC detection for OTFS receiver with oversampling,” *IEEE Trans. Wirel. Commun.*, vol. 23, no. 2, pp. 1459–1473, 2024.
[29] T. Bacchielli, L. Pucci, E. Paolini, and A. Giorgetti, “A low-complexity detector for OTFS-based sensing,” *IEEE Trans. Wirel. Commun.*, vol. 24, no. 6, pp. 5227–5240, 2025.
[30] D. Chu, “Polyphase codes with good periodic correlation properties (corresp.),” *IEEE Trans. Inf. Theory*, vol. 18, no. 4, pp. 531–532, 1972.
[31] Y. Jitsumatsu, “2D sinc interpolation-based fractional delay and doppler estimation using time and frequency shifted gaussian pulses,” in *ICAIIC*, 2025, pp. 0060–0065.
[32] R. Maršálek, R. Zedka, E. Zöchmann, J. Vychodil, R. Závorka, G. Ghiaasi, and J. Blumenstein, “Persistent homology approach for human presence detection from 60 GHz OTFS transmissions,” *Sensors*, vol. 23, no. 4, 2023.
[33] S. Verdu, “Spectral efficiency in the wideband regime,” *IEEE Trans. Inf. Theory*, vol. 48, no. 6, pp. 1319–1343, Jun 2002.
[34] J. E. Volder, “The CORDIC trigonometric computing technique,” *IEEE Trans. Comput.*, vol. EC-8, no. 3, pp. 330–334, 1959.

## 作者简介

**Lianet Méndez-Monsanto（Student Member, IEEE）** 2021 年与 2023 年分别获西班牙马德里卡洛斯三世大学（UC3M）电信工程学士与电信工程及先进通信技术双硕士学位，现于该校信号理论与通信系攻读博士学位。2024 年获西班牙电信工程师职业协会最佳硕士论文奖，2025 年获 IEEE MeditCom 最佳论文奖。研究兴趣包括无线通信信号处理、信道估计、波形、ISAC，以及用 AI/ML 技术改进这些系统。

**Andrés Reyes-Castro（Student Member, IEEE）** 获厄瓜多尔基多 EPN 大学电子与电信工程学士学位及澳大利亚墨尔本大学电信工程硕士学位，现为西班牙马德里卡洛斯三世大学（UC3M）信号理论与通信系博士生，隶属 Marie Skłodowska-Curie MiFuture 博士网络。2025 年获 IEEE MeditCom 最佳论文奖。研究兴趣包括面向 ISAC 系统的波形设计、信道估计与信号处理。

**Kun Chen-Hu（Senior Member, IEEE）** 2019 年获西班牙马德里卡洛斯三世大学多媒体与通信博士学位，现为西班牙阿尔卡拉大学 Ramón y Cajal 研究员。2019 年获 UC3M 杰出职业奖；曾在丹麦奥尔堡大学做两年博士后，并在法国 EURECOM 与德国德累斯顿工业大学 Vodafone 移动通信系统讲席做访问研究；参与多项与移动通信领域领先企业的合作研究项目。2025 年获 IEEE MeditCom 最佳论文奖。曾任 IEEE GLOBECOM 2021 与 IEEE MeditCom 2024（西班牙马德里）的 Web Chair，并任 IEEE 通信学会在线内容编辑。研究兴趣包括无线通信信号处理技术，如波形设计、信道估计、大规模 MIMO、可重构智能表面，以及 ISAC 与量子通信的安全与隐私。

**M. Julia Fernández-Getino García（Member, IEEE）** 1996 年与 2001 年分别获西班牙马德里理工大学电信工程硕士与博士学位。1996–2001 年在马德里理工大学信号、系统与无线通信系任研究职位；1998 年访问美国新泽西州默里山贝尔实验室，1999 与 2000 年两度访问瑞典隆德大学，2003 与 2004 年访问意大利都灵理工大学，2009 与 2010 年访问葡萄牙阿威罗大学。现为西班牙马德里卡洛斯三世大学信号理论与通信系教授。研究兴趣包括多载波通信、编码与无线系统信号处理。曾获西班牙电信工程师职业协会 1998 年最佳硕士论文奖与 2003 年最佳博士论文奖、1999 年 IEEE PIMRC 学生论文奖、2000 年 IEEE VTC 致谢证书、2004 年马德里理工大学博士特别奖、2004 年 AENA 基金会 Juan de la Cierva 国家奖、2012 年 UC3M 卓越研究奖，以及 2025 年 IEEE MeditCom 最佳论文奖。

**Ana García Armada（Fellow, IEEE）** 现为西班牙马德里卡洛斯三世大学（UC3M）教授，曾在斯坦福大学、贝尔实验室与南安普顿大学做访问学者；已发表会议与期刊论文 300 余篇，持有 7 项专利。研究兴趣包括无线通信信号处理。任 *IEEE Open Journal of the Communications Society* 与 *ITU Journal on Future and Evolving Technologies* 编委；曾任 IEEE Globecom 2021 大会主席等多个会议组织委员会成员。获 UC3M 多项奖励、2014 年贝尔实验室奖第三名、IEEE ComSoc 信号处理与通信电子技术委员会杰出服务奖、IEEE ComSoc 女性通信工程常设委员会杰出服务奖，以及 IEEE ComSoc/KICS 模范全球服务奖。

**原文插图：** 原 PDF 中的图 1–15 未重传至本页，仅保留中文图注与图中关键标注；全部原图可查阅 IEEE Xplore 正式版本。

---

**本页范围与校对状态：** 本页依据本地期刊正式版后印本 PDF（IEEE TWC, vol. 25, 2026, pp. 16680–16696，18 页）作中文全译：摘要、关键词、正文第 I–VII 节（I-A–B、II-A–D、III-A–B、IV-A–D、V-A–B、VI-A–G）、结论、全部图注（图 1–15）、表 I–III（逐格转录）、算法 1、公式 (1)–(51)（连续无缺）、34 条参考文献英文原条目与 5 位作者简介（已中文化）；原文无附录。**再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。****逐句终校未做**：表 I（7 行×2 列）、表 II（5 行×3 列）、表 III（9 行×2 列）均已用 PDF 页面渲染逐格核对；式 (1)–(22)、(23)–(51) 已对照页面文本层核对。页内 2 条“原文疑点”加注：①表 II 第一行 “Definition (20)” 的式号应为 (22)（式 (20) 是 PAPR 定义，而短/长导频划分来自 (22)）；②按式 (22) 与表 III 参数（$l_{\max}=4$、$N=16$）可得阈值 $\lceil4/15\rceil=1$，但正文第 IV-A/V-A 节称短太阳导频为 $L_s\le3$、长太阳导频为 $L_s>3$，两者不一致（疑为数值阈值笔误）。均按原文照录并说明，未作数值或表述改动。

{% endraw %}
