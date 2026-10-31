---
layout: page
title: "基于数字孪生信道的毫米波空间传播特性预测｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-25-digital-twin-channel-based-mmwave-spatial-propagation-characteristics-e519698d/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/e519698d9bbac949/) · 原文为期刊/会议正式版，许可待核验 · [全部目录](/papers/catalog/)

> **许可与用途声明：** 本页依据本地期刊正式版 PDF（IEEE Transactions on Wireless Communications, 2026）作中文全文翻译，**再传播许可待核验**；本页仅作个人学习用途，**不计入“可公开全文”统计**。原文版权归 IEEE 所有，引用请以期刊正式版本为准。

# 基于数字孪生信道的毫米波空间传播特性预测

**原题：** Digital Twin Channel-Based mmWave Spatial Propagation Characteristics Prediction in 6G Multi-Band Communication Systems  
**作者：** Zhen Zhang（Member, IEEE）、Jianhua Zhang（Fellow, IEEE）、Li Yu（Member, IEEE）、Silu Xing、Kai Sun（Member, IEEE）。单位：Z. Zhang、S. Xing、K. Sun 为内蒙古大学内蒙古自治区智能通信与感知及信号处理重点实验室（呼和浩特 010021，中国）；J. Zhang、L. Yu 为北京邮电大学网络与交换技术全国重点实验室（北京 100876，中国）。  
**版本：** 期刊正式版，*IEEE Transactions on Wireless Communications*, vol. 25, 2026, pp. 17306–17321；DOI: 10.1109/TWC.2026.3693236；2025-09-11 收稿，2025-12-24 与 2026-03-24 修回，2026-05-07 录用，2026-05-21 定版；本地 PDF 共 16 页。再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I–V 节（含 II-A–C、III-A–F、IV-A–C 全部小节）、结论、全部图注（图 1–17）、表 I–III（逐格转录）、公式 (1)–(32)、43 条参考文献英文原条目与 5 位作者简介；原文无附录；逐句逐式终校未做。

## 摘要

数字孪生信道（DTC）旨在把物理场景映射为实时数字孪生（DT），并实现人工智能（AI）驱动的信道预测。为满足毫米波系统多样化的信道获取需求，我们提出 TwinPAS——一种面向多频段共存通信的、基于 DT 的分层功率角度谱（PAS）预测方法。TwinPAS 使基站能够通过两个阶段把视觉感知信息转换为空间信道特性：DT 构建与 PAS 预测。首先，在 DT 构建中，静态场景信息由计算机视觉技术获得，而动态环境特征由 sub-6 GHz 信道参数估计得到；为把这两类异构特征融合以构建物理场景的 DT，我们提出一种新的信道表示方法——**信道嵌入（channel embedding）**。随后在 PAS 预测中，开发分层信道预测网络，按路径功率降序预测毫米波 PAS。对网络输出，嵌入的毫米波 PAS 被投影为虚拟距离矩阵，从而解决多径数动态变化时信道参数维数不确定的问题。仿真结果证明了 TwinPAS 方法在 PAS 预测上的优越性与泛化性，展示了其在波束选择等物理层应用中的潜力。

**关键词：** 数字孪生、人工智能、功率角度谱、计算机视觉。

## I. 引言

毫米波（mmWave）频段提供丰富的频谱资源、支持更宽的子载波间隔，能更好满足移动通信系统对高吞吐、超高可靠与低时延的需求 [1]。然而毫米波信号受大气损耗与降雨衰减的严重影响 [2]。为保证足够的毫米波通信质量，需采用大规模天线阵列与定向波束成形技术；但最优波束成形设计通常需要完美信道状态信息（CSI），这颇具挑战 [3]。此外，当毫米波系统出现遮挡时，快速波束管理也需要高效的信道获取技术。因此，现有研究大多聚焦 CSI 估计或波束预测，而能够刻画毫米波信道完整小尺度空间传播特性的**功率角度谱（PAS）预测**却鲜有研究。本文关注确定性场景下的毫米波 PAS 预测。PAS 的准确刻画与预测在毫米波通信中具有基础性作用，因为 PAS 决定波束成形、空间复用与干扰行为。

**相关工作：** 由于角度空间的高维性以及有效多径数目的动态变化，直接预测 PAS 仍然困难。现有系统级研究多关注与 PAS 相关的推理任务，而非显式预测 PAS 本身。许多研究聚焦角度域信道重建 [4] 或波束选择 [5]，其中 PAS 通过稀疏恢复被隐式推断。随着移动通信系统使用的频段越来越多，多频段共存通信已不可避免 [6]。近期研究者发现，与毫米波系统并行工作的 sub-6 GHz 系统能够提供有价值的带外（OOB）信息，有助于建立毫米波链路 [7]；因此利用 sub-6 GHz 信道辅助预测毫米波传播特性被认为是有前景的途径 [8]–[10]。这些工作利用人工智能（AI）[8], [10] 或压缩感知（CS）[9] 等技术，以 sub-6 GHz 信道的空间传播特性来重建或推断毫米波角度功率分布特性。

然而，sub-6 GHz 与毫米波信道仅在某些主要传播路径上高度相似，且这种相似性可能随传播环境变化而下降 [11]。主要传播路径之间的分布规律无法用于预测完整的多径传播特性。完整无线信道由直射路径、反射路径与绕射路径等各种传播路径组成，而路径参数通常受基站（BS）与用户终端（UT）周围散射体的大小、形状、位置与材料影响。因此，无线信道的传播特性主要受真实世界物理环境的影响 [12], [13]。

借助 RGB 相机、激光雷达（LIDAR）、GPS、雷达等各种感知设备，研究者已在计算机视觉（CV）感知辅助通信方面取得广泛进展，如波束预测 [14], [15]、码本设计 [16]、基站选择 [17]、信道协方差矩阵估计 [18]、CSI 预测或反馈 [19], [20]、遮挡预测 [21]、路损预测 [22] 等。此外，在通感一体化（ISAC）系统中还研究了 CSI 驱动的成像：把多径参数映射为等效反射点，并融合多视角信息重建稠密 3D 点云 [23]。

神经辐射场（NeRF）表示已被引入无线通信，以连续且几何感知的方式建模无线电传播 [24], [25]：通过重建无线辐射场，可由辐射能量分布的角度域投影导出 PAS。然而这类方法计算复杂度高、合成速度慢。与传统的感知辅助方法或纯数据驱动方法不同，数字孪生（DT）旨在构建无线传播环境的数字副本，能够反映物理场景的实时变化；与 AI 结合后，数字孪生信道（DTC）可实现实时交互、闭环决策，并主动适应各种信道传播环境的变化 [26], [27]。因此，构建物理层 DT 可扩展无线信道预测能力，进一步增强基站在射频（RF）空间的认知能力。

然而多数现有工作把 DT 环境当作辅助输入特征，并未与无线信道融合为统一的物理表示。当前多模态融合方法主要关注视觉感知与 CSI 的特征级融合 [28], [29]，无法直接用于多维 PAS 预测。同时，现有研究仍缺乏能显式刻画场景几何与多径传播交互的学习驱动物理层 DT 构建方法。一方面，如何从物理环境中有效提取几何、材料属性等静态散射特征仍然困难；另一方面，如何建模动态散射特性并将其整合进统一 DT 框架仍是开放问题。特别是有效路径数目会随位置与环境显著变化，对 PAS 预测精度影响很大；当中继数动态变化时，准确预测多维信道参数仍是现有基于 DT 方法的关键挑战。

**主要贡献：** 本文提出基于 DT 的分层 PAS 预测方法 TwinPAS。与现有信道预测不同，我们采用物理层 DT 联合建模静态 3D 几何与动态 sub-6 GHz 传播，以辅助毫米波 PAS 预测。基于所提 TwinPAS 方法，基站可实现从视觉感知到射频认知的转换，释放物理层信道预测的全部潜力。主要贡献总结如下：

- **信道嵌入（CE）：无线信道与 3D 物理环境的几何保持融合。** 我们提出 CE 方法，把估计的 sub-6 GHz 信道参数转换为虚拟路径点，并嵌入 3D 点云以构建物理环境的 DT。每个虚拟路径点对应一条物理传播路径，其距离与方向编码该路径的功率与角度。所提出的信道表示方法实现了无线信道与 CV 重建 3D 场景之间的几何保持对齐，有效解决了传统融合方法中视觉感知与信道数据失配的问题。
- **分层信道预测网络（HCP-Net）：多分辨率环境与信道交互。** 我们设计了由分层编码器与金字塔解码器组成的 HCP-Net，从多分辨率 DT 输入预测毫米波 PAS。HCP-Net 按功率把传播路径分为主径（dominant）、主要（major）与全路径（full）三级，由粗到细地提取多尺度环境与信道特征；此外我们设计了 HCP-Net 的预训练与微调方案。该分层机制提供了物理可解释的结构，并增强了复杂动态传播环境中的鲁棒性。
- **信道投影：动态多径预测的统一输出表示。** 在 HCP-Net 输出端，我们提出信道投影/反投影机制，把可变数目的毫米波虚拟路径点转换为虚拟距离矩阵与掩码矩阵。掩码矩阵确定有效路径的数目与位置，虚拟距离矩阵预测各位置处的路径功率。信道投影保证输出维数固定、适合网络学习；最后，反投影与逆 CE 把矩阵映射回多径参数，重建预测的毫米波 PAS。

本文余下部分安排如下：第 II 节给出系统模型并对 PAS 预测问题建模；第 III 节详述所提 TwinPAS 方法；第 IV 节给出仿真结果；第 V 节总结全文。

**记号：** 字体 $\mathbf x$、$\mathbf x$、$\mathbf X$ 分别表示标量、向量与矩阵。记 $[\mathbf x]_m$、$[\mathbf X]_{m,n}$、$[\mathbf X]_{m,:}$、$[\mathbf X]_{:,n}$ 分别为向量 $\mathbf x$ 的第 $m$ 个元素、矩阵 $\mathbf X$ 第 $m$ 行第 $n$ 列的元素、矩阵 $\mathbf X$ 的第 $m$ 行与第 $n$ 列。转置与共轭转置分别记作 $(\cdot)^T$ 与 $(\cdot)^H$。期望记作 $\mathbb E[\cdot]$，$\|\cdot\|_p$ 为 $p$ 范数。算子 $\odot$ 表示逐元素乘，$\otimes$ 表示 Kronecker 积。最后，$\mathcal T(\cdot,(B_m,B_n))$ 把向量变换为 $B_m$ 行 $B_n$ 列的矩阵，$|\cdot|$ 表示其自变量的绝对值或集合的基数。

## II. 系统模型与问题建模

考虑图 1 所示的室内办公场景，其中随机分布着桌子、椅子、柜子等散射体。基站与用户终端同时在毫米波与 sub-6 GHz 频段工作 [9], [10]。基站配备两个共址天线阵列，一个工作在毫米波频段、另一个工作在 sub-6 GHz 频段，其位置 $\mathbf p_{\rm BS}=[p^x_{\rm BS},p^y_{\rm BS},p^z_{\rm BS}]$ 已知。用户终端配备两根天线，分别工作在毫米波与 sub-6 GHz 频段。假定毫米波与 sub-6 GHz 通信系统均采用正交频分复用（OFDM）模式。本工作旨在利用 sub-6 GHz 上行信道估计得到的 CSI 来预测基站的毫米波 PAS。全文中，下标 $(\cdot)_s$ 表示 sub-6 GHz 变量，$(\cdot)_m$ 表示毫米波变量。

**图 1：** 双频段多输入多输出（MIMO）通信系统，基站与用户终端均配备共址的 sub-6 GHz 与毫米波天线。

### A. 毫米波系统与信道模型

对毫米波系统，基站配备 $N_m=N_{m,h}\times N_{m,v}$ 根天线的均匀平面阵列（UPA），其中 $N_{m,h}$ 与 $N_{m,v}$ 分别为水平与垂直维度的天线数；子载波数为 $K_m$。第 $k$ 个子载波上的下行接收信号为

$$
y_m[k]=\mathbf h_m^H[k]\mathbf x_m[k]+n_m[k],\qquad k=1,\dots,K_m, \tag{1}
$$

其中 $\mathbf h_m[k]\in\mathbb C^{N_m\times1}$ 与 $\mathbf x_m[k]\in\mathbb C^{N_m\times1}$ 分别为第 $k$ 个子载波上的毫米波信道与发射信号，$n_m[k]\in\mathcal{CN}(0,\sigma^2_m)$ 为加性高斯白噪声。

采用 3D 几何信道模型描述信道，毫米波下行信道 $\mathbf h_m[k]$ 可建模为

$$
\mathbf h_m[k]=\sum_{l=1}^{L_m}\sqrt{\frac{\alpha_{m,l}}{K_m}}
e^{j\left(\frac{2\pi k\tau_{m,l}B_m}{K_m}+\psi_{m,l}\right)}
\mathbf a\left(\varphi^{{\rm az},D}_{m,l},\varphi^{{\rm ele},D}_{m,l}\right), \tag{2}
$$

其中 $\alpha_{m,l}$ 表示毫米波信道第 $l$ 条路径的接收功率，$\varphi^{{\rm az},D}_{m,l}$ 与 $\varphi^{{\rm ele},D}_{m,l}$ 分别为第 $l$ 条路径的离开方位角（AoD）与离开俯仰角；$\tau_{m,l}$ 与 $\psi_{m,l}$ 为第 $l$ 条路径的时延与相位；毫米波信道路径数为 $L_m$；$B_m$ 为毫米波信道带宽，$\mathbf a(\varphi^{{\rm az},D}_{m,l},\varphi^{{\rm ele},D}_{m,l})$ 为基站阵列的导向矢量。

### B. Sub-6 GHz 系统与信道模型

Sub-6 GHz 系统为全数字系统，配备 $N_s=N_{s,h}\times N_{s,v}$ 根天线的 UPA，每根天线有独立射频链路；$N_{s,h}$ 与 $N_{s,v}$ 分别为水平与垂直维度的天线数。此外，$K_s$ 为 sub-6 GHz 系统的子载波数。记 $\mathbf h_s[k]\in\mathbb C^{N_s\times1}$ 为第 $k$ 个子载波的 sub-6 GHz 上行信道，$x_s[k]$ 为第 $k$ 个子载波上的发射信号。基站处的上行接收信号为

$$
y_s[k]=\mathbf h_s[k]x_s[k]+n_s[k],\qquad k=1,\dots,K_s, \tag{3}
$$

其中 $n_s[k]$ 为加性高斯白噪声。Sub-6 GHz 的信道模型与毫米波类似，特别地，$\varphi^{{\rm az},A}_{s,l}$ 与 $\varphi^{{\rm ele},A}_{s,l}$ 分别为第 $l$ 条路径的到达方位角（AoA）与到达俯仰角，$\alpha_{s,l}$ 表示第 $l$ 条路径的接收功率，$L_s$ 为 sub-6 GHz 信道的路径数。可用最小二乘（LS）信道估计得到各子载波上的上行信道：$\hat{\mathbf h}_s[k]=\frac{y_s[k]}{x_s[k]}$。

### C. 问题建模

一个 DT 至少需要包含静态与动态两部分，才能模拟物理世界的动态演化。静态部分 $\mathcal D$ 应包含静态场景布局 $F_{\rm lay}$、材料特征 $F_{\rm mat}$ 与固定的基站位置 $\mathbf p_{\rm BS}$；这些静态特征可事先由 CV 获取，与通信系统无关。动态部分至少包含用户终端位置 $\mathbf p_{\rm UT}$ 与移动散射体。具体而言，移动散射体的位置难以实时准确获得；但散射体与用户终端的运动会显著影响多径传播的小尺度参数。作为毫米波系统的带外信息，sub-6 GHz PAS 为实时获取动态特性提供了可能。

受此启发，我们提出利用 CV 获得的静态场景信息与 sub-6 GHz PAS 来预测毫米波 PAS：

$$
\mathbf h^{{\rm pas}}_m=\sum_{l=1}^{L_m}\alpha_{m,l}
\delta\left(\varphi^{\rm az}-\varphi^{{\rm az},D}_{m,l}\right)
\delta\left(\varphi^{\rm ele}-\varphi^{{\rm ele},D}_{m,l}\right). \tag{4}
$$

类似地，由上行 CSI 得到的 sub-6 GHz PAS 为

$$
\mathbf h^{{\rm pas}}_s=\sum_{l=1}^{L_s}\alpha_{s,l}
\delta\left(\varphi^{\rm az}-\varphi^{{\rm az},A}_{s,l}\right)
\delta\left(\varphi^{\rm ele}-\varphi^{{\rm ele},A}_{s,l}\right). \tag{5}
$$

我们需要找到目标模型实现 $\{\mathbf h^{{\rm pas}}_s,\mathcal D\}\xrightarrow{f(\cdot)}\mathbf h^{{\rm pas}}_m$。毫米波 PAS 预测问题表述为

$$
\min_{f(\cdot)}\ \mathbb E\left[
w_a\sum_{l=1}^{L_m}\left(\alpha_{m,l}-\hat\alpha_{m,l}\right)^2
+w_{\rm az}\sum_{l=1}^{L_m}\left(\varphi^{{\rm az},D}_{m,l}-\hat\varphi^{{\rm az},D}_{m,l}\right)^2
+w_{\rm ele}\sum_{l=1}^{L_m}\left(\varphi^{{\rm ele},D}_{m,l}-\hat\varphi^{{\rm ele},D}_{m,l}\right)^2
\right],
$$
$$
\text{s.t.}\quad \hat\alpha_{m,l}\ge0,\quad
-\pi/2\le\hat\varphi^{{\rm az},D}_{m,l}\le\pi/2,\quad
0\le\hat\varphi^{{\rm ele},D}_{m,l}\le\pi, \tag{6}
$$

其中 $\hat\alpha_{m,l}$、$\hat\varphi^{{\rm az},D}_{m,l}$、$\hat\varphi^{{\rm ele},D}_{m,l}$ 分别是目标模型 $f(\cdot)$ 预测的功率、离开方位角与离开俯仰角。为处理功率与角度预测误差之间固有的数值尺度差异，我们引入加权系数 $w_a$、$w_{\rm az}$、$w_{\rm ele}$ 以平衡它们在优化目标中的贡献。

优化问题 (6) 难以高效求解。考虑直接方法：传播路径数 $L_m$ 相对较大，完整 PAS 通常需要获取完整信道，这对大规模 MIMO 不现实。考虑间接方法：路径数 $L_m$ 随传播环境变化，而神经网络（NN）输出维数需随之变化，故难以直接设计 NN 预测 PAS；此外，sub-6 GHz 信道的路径数通常不同于毫米波信道的路径数，无法一一映射。本文旨在提供一种求解 PAS 预测问题的方法：sub-6 GHz PAS 可由 sub-6 GHz 上行信道估计，而毫米波系统框架不受限制。

## III. 所提 TwinPAS 方法

本节详细描述图 2 所示的 TwinPAS 方法。需要强调的是：该方法每 $N_{\rm time}$ 个连续时隙只在开头执行一次完整场景重建；如图 3 所示，在随后的 $N_{\rm time}-1$ 个时隙内跳过重建步骤，只进行 sub-6 GHz 信道估计；到下一个时间周期的开始，再执行新的场景重建以更新环境先验信息。

**图 2：** 所提 TwinPAS 方法的关键步骤。物理层 DT 由静态场景部分（步骤 1）与动态信道部分（步骤 2–3）构建；步骤 4 用信道嵌入把二者整合，以进行毫米波 PAS 预测（步骤 5–6）。

**图 3：** 分别通过 CV 与 sub-6 GHz 信道估计获得的静态与动态信息在时间上的关系。

DT 是连接环境几何与无线传播的物理层孪生。在所提 TwinPAS 中，DT 承担三项关键功能：(i) 表示由 CV 重建的静态 3D 环境；(ii) 映射由 sub-6 GHz 信道获得的动态传播特征；(iii) 作为跨频段桥梁以推断毫米波 PAS。这些部分共同构成环境自适应信道预测框架。表 I 总结了 TwinPAS 方法涉及的部分关键记号。

**表 I：** TwinPAS 方法中使用的关键记号。

| 符号 | 含义 | 类型 / 维数 |
|---|---|---|
| $\mathbf P_{\rm scene}$ | 带几何与材料语义的静态场景重建矩阵 | $\mathbb R^{n_{\rm scene}\times6}$ |
| $\hat{\mathbf S}_s$ | 估计的 sub-6 GHz 上行多径参数序列（到达方位角、到达俯仰角、功率） | $(\hat\varphi^{{\rm az},A}_s,\hat\varphi^{{\rm ele},A}_s,\hat\alpha_s)$ |
| $\mathbf S_m$ | 真实毫米波多径参数标签序列（离开方位角、离开俯仰角、功率） | $(\varphi^{{\rm az},D}_m,\varphi^{{\rm ele},D}_m,\alpha_m)$ |
| $\hat{\mathbf P}^{xyz}_s$ | 信道嵌入后的 sub-6 GHz 虚拟路径点 | $\mathbb R^{N_{\rm peak}\times3}$ |
| $\mathbf P^{\rm Dom}_m,\mathbf P^{\rm Maj}_m,\mathbf P^{\rm Ful}_m$ | 多级毫米波虚拟路径点集（主径/主要/全路径） | $1,\ 5,\ L_m$ |
| $\mathbf P^{\rm Dom},\mathbf P^{\rm Maj},\mathbf P^{\rm Ful}$ | 多分辨率 DT，即 HCP-Net 的输入 | $\mathbb R^{(\cdot)\times6}$ |
| $\mathbf D^{\rm Dom},\mathbf D^{\rm Maj},\mathbf D^{\rm Ful}$ | HCP-Net 预测的虚拟距离矩阵 | $\mathbb R^{N_H\times N_W}$ |
| $\mathbf M^{\rm Dom},\mathbf M^{\rm Maj},\mathbf M^{\rm Ful}$ | HCP-Net 预测的掩码矩阵 | $\{0,1\}^{N_H\times N_W}$ |

### A. 基于 CV 的静态场景重建

静态场景重建包括两部分：静态结构与准静态结构的构建。墙壁、天花板、地板等静态结构具有固定几何与电磁属性；桌子、椅子、柜子等准静态结构可能在长时间后改变位置，但在多个连续相干间隔内保持相对固定。永久静态结构的构建假定结构的位置、尺寸与材料固定且已知，故可构建整个场景中所有静态结构带材料语义分割的 3D 点云 $\mathcal{PC}_{\rm static}$，表示为 $\mathcal{PC}_{\rm static}=\{\mathbf p_{{\rm static},1},\mathbf p_{{\rm static},2},\dots,\mathbf p_{{\rm static},n_{\rm static}}\}$，其中 $\mathbf p_{{\rm static},k}$ 为第 $k$ 个点、$n_{\rm static}$ 为全部静态结构的点总数。点 $\mathbf p_{{\rm static},k}=[p^x_{{\rm static},k},p^y_{{\rm static},k},p^z_{{\rm static},k},p^c_{{\rm static},k},p^p_{{\rm static},k},p^t_{{\rm static},k}]$ 按材料类别做语义分割，其中 $p^c_{{\rm static},k}$、$p^p_{{\rm static},k}$、$p^t_{{\rm static},k}$ 分别为空间坐标 $[p^x_{{\rm static},k},p^y_{{\rm static},k},p^z_{{\rm static},k}]$ 处物体的电导率、介电常数与厚度。

全部准静态结构的构建主要包括两步：3D 点云重建与基于 CV 的材料识别。为进行点云重建与材料识别，首先从整个场景的不同角度采集图像集 $\mathcal I$：如图 4 所示，在办公室内放置 $|\mathcal I|$ 台相机，相机置于办公室边缘并朝向中心，这些相机同时从不同视角采集图像集；随后可用 3D 重建工具 Agisoft Metashape [30]（基于 Structure-from-Motion [31] 与 Multi-View-Stereo [32] 算法）从图像集 $\mathcal I$ 重建点云。该工具以图像集 $\mathcal I$ 为输入，自动输出重建的 3D 点云 $\mathcal{PC}^{xyz}_{\rm quasi}$，其中包含办公室内所有准静态物体的位置与结构信息。重建点云表示为 $\mathcal{PC}^{xyz}_{\rm quasi}=\{\mathbf p^{xyz}_{{\rm quasi},1},\mathbf p^{xyz}_{{\rm quasi},2},\dots,\mathbf p^{xyz}_{{\rm quasi},n_{\rm quasi}}\}$，其中 $\mathbf p^{xyz}_{{\rm quasi},k}$ 为第 $k$ 个点、$n_{\rm quasi}$ 为全部准静态结构的点总数；此外 $\mathbf p^{xyz}_{{\rm quasi},k}=[p^{xyz,x}_{{\rm quasi},k},p^{xyz,y}_{{\rm quasi},k},p^{xyz,z}_{{\rm quasi},k}]$ 仅含准静态结构的空间坐标，缺少材料语义特征。

借助深度学习技术，可在采集的图像集 $\mathcal I$ 上对准静态物体进行材料识别与分类 [33], [34]；随后从预存参数表中查取相应类别的材料参数，并按准静态物体的材料类别为点 $\mathbf p^{xyz}_{{\rm quasi},k}$ 补充材料参数。于是，整个场景中所有准静态结构带材料语义分割的点云可表示为 $\mathcal{PC}_{\rm quasi}=\{\mathbf p_{{\rm quasi},1},\mathbf p_{{\rm quasi},2},\dots,\mathbf p_{{\rm quasi},n_{\rm quasi}}\}$，其中 $\mathbf p_{{\rm quasi},k}=[p^{xyz,x}_{{\rm quasi},k},p^{xyz,y}_{{\rm quasi},k},p^{xyz,z}_{{\rm quasi},k},p^c_{{\rm quasi},k},p^p_{{\rm quasi},k},p^t_{{\rm quasi},k}]$，$p^c_{{\rm quasi},k}$、$p^p_{{\rm quasi},k}$、$p^t_{{\rm quasi},k}$ 分别为电导率、介电常数与厚度。

整个场景的 3D 点云由静态与准静态结构两部分组成，可表示为 $\mathcal{PC}_{\rm scene}=\mathcal{PC}_{\rm static}\cup\mathcal{PC}_{\rm quasi}$。为便于 NN 处理，用矩阵 $\mathbf P_{\rm scene}\in\mathbb R^{n_{\rm scene}\times6}$ 表示集合 $\mathcal{PC}_{\rm scene}$ 中的点，矩阵第 $k$ 行即集合中第 $k$ 个点，$n_{\rm scene}=n_{\rm static}+n_{\rm quasi}$。

**图 4：** 3D 点云生成过程。

### B. Sub-6 GHz 信道参数提取

接下来从估计的 sub-6 GHz CSI 中提取信道参数，作为 DT 的动态特征。采用 2D 离散傅里叶变换（DFT）矩阵 $\mathbf W_{2D}=\mathbf W_v\otimes\mathbf W_h$ 提取 sub-6 GHz PAS 参数，其中 $\mathbf W_v\in\mathbb C^{N_{s,v}\times N_{{\rm sam},v}}$ 与 $\mathbf W_h\in\mathbb C^{N_{s,h}\times N_{{\rm sam},h}}$ 分别为垂直与水平维度的 DFT 矩阵，$N_{{\rm sam},v}$ 与 $N_{{\rm sam},h}$ 分别为垂直与水平维度的角度网格点数。$\mathbf W_v$ 的第 $(m,n)$ 个元素为

$$
[\mathbf W_v]_{m,n}=\frac{1}{\sqrt{N_{s,v}}}e^{j\pi m\left(-1+\frac{2n}{N_{{\rm sam},v}}\right)},
\qquad m=0,1,\dots,N_{s,v}-1,\ n=0,1,\dots,N_{{\rm sam},v}-1. \tag{7}
$$

$\mathbf W_h$ 的元素以类似方式定义。

记 $\hat{\mathbf h}_s[k]$ 为第 $k$ 个子载波上估计的 sub-6 GHz 上行信道，则从 sub-6 GHz 信道提取的空间特征为

$$
\hat{\mathbf h}^a_s=\frac{\sum_{k=1}^{K_s}\left|\hat{\mathbf h}^H_s[k]\mathbf W_{2D}\right|^2}{N_s}. \tag{8}
$$

随后把空间特征 $\hat{\mathbf h}^a_s$ 变换为矩阵 $\hat{\mathbf H}^a_s=\mathcal T(\hat{\mathbf h}^a_s,(N_{{\rm sam},h},N_{{\rm sam},v}))^T$，并在其上执行局部极大值检测与峰值提取：

$$
\mathcal P=\left\{(i,j)\ \middle|\ [\hat{\mathbf H}^a_s]_{i,j}\ge[\hat{\mathbf H}^a_s]_{m,n},\ \forall(m,n)\in\mathcal N(i,j)\right\}, \tag{9}
$$

其中 $\mathcal N(i,j)$ 表示下标对 $(i,j)$ 邻域内的所有点，可写为

$$
\mathcal N(i,j)=\left\{(m,n)\in\mathbb Z^2\ \middle|\ 0<\max\{|m-i|,|n-j|\}\le1\right\}. \tag{10}
$$

具体地，$\hat{\mathbf H}^a_s$ 的每个元素与其 8-连通邻域比较，只有功率大于全部相邻元素的点才作为局部极大值保留；所有局部极大值的下标对记录在 $\mathcal P$ 中。我们把 $\mathcal P$ 中所有局部极大值按降序排列，选取前 $N_{\rm peak}$ 个下标对。第 $k$ 个下标对 $(k_i,k_j)$ 处的功率值为 $\hat\alpha_{s,k}=[\hat{\mathbf H}^a_s]_{k_i,k_j}$，相应的到达俯仰角 $\hat\varphi^{{\rm ele},A}_{s,k}$ 与到达方位角 $\hat\varphi^{{\rm az},A}_{s,k}$ 由下式获得：

$$
\hat\varphi^{{\rm ele},A}_{s,k}=\frac{180}{\pi}\arccos\left(-1+\frac{2(k_i-1)}{N_{{\rm sam},v}}\right),\quad
\hat t_k=\frac{2(k_j-1)-N_{{\rm sam},h}}{N_{{\rm sam},h}\sin\left(\hat\varphi^{{\rm ele},A}_{s,k}\right)},\quad
\hat\varphi^{{\rm az},A}_{s,k}=\frac{180}{\pi}\arcsin\left(\hat t_k\right). \tag{11}
$$

因此，从 sub-6 GHz 上行 CSI 提取的 $N_{\rm peak}$ 组 PAS 参数可存入一个有序序列：

$$
\hat{\mathcal S}_s=\left[
\left(\hat\varphi^{{\rm az},A}_{s,1},\hat\varphi^{{\rm ele},A}_{s,1},\hat\alpha_{s,1}\right),
\left(\hat\varphi^{{\rm az},A}_{s,2},\hat\varphi^{{\rm ele},A}_{s,2},\hat\alpha_{s,2}\right),
\dots,
\left(\hat\varphi^{{\rm az},A}_{s,N_{\rm peak}},\hat\varphi^{{\rm ele},A}_{s,N_{\rm peak}},\hat\alpha_{s,N_{\rm peak}}\right)
\right], \tag{12}
$$

其中 $\hat\alpha_{s,1}\ge\hat\alpha_{s,2}\ge\cdots\ge\hat\alpha_{s,N_{\rm peak}}$。sub-6 GHz 信道参数的提取遵循标准估计流程；但这些参数在 DT 构建中具有不可替代的作用，提供实时的动态环境属性。

> **原文疑点：** 式 (7)–(8) 中 2D DFT 矩阵写作 $\mathbf W_{2D}=\mathbf W_v\otimes\mathbf W_h$，而式 (8) 直接对 $N_s$ 维信道向量做 $\hat{\mathbf h}^H_s[k]\mathbf W_{2D}$ 的乘法；这要求信道向量的矢量化顺序与 Kronecker 积的因子顺序严格匹配（先水平还是先垂直），但原文未说明 $\hat{\mathbf h}_s[k]$ 的矢量化约定，也未说明 $\mathbf W_{2D}$ 的行列排布如何对应 $(m,n)$ 网格。本译按原文照录并加注。

### C. Sub-6 GHz 信道嵌入与 DT 构建

本小节提出一种跨模态信道表示方法——**信道嵌入（CE）**，它能把 sub-6 GHz 信道嵌入静态场景重建中，从而实现视觉感知与射频数据的高效融合。每组功率与角度参数依次被转换为坐标点。首先，以第 $k$ 组功率与角度参数 $(\hat\varphi^{{\rm az},A}_{s,k},\hat\varphi^{{\rm ele},A}_{s,k},\hat\alpha_{s,k})$ 为例，由功率到距离的归一化映射为

$$
\hat d_{s,k}=K^E_s\left(\frac{\hat\alpha_{s,k}}{\alpha_{s,\max}}\right)^{R^E_s}+O^E_s, \tag{13}
$$

其中 $K^E_s$、$O^E_s$、$R^E_s$ 分别为 sub-6 GHz 信道的缩放因子、偏置与指数因子；$\alpha_{s,\max}$ 为 sub-6 GHz 信道中路径功率的最大值。$K^E_s$、$O^E_s$、$R^E_s$ 是约束常数，定义从归一化路径功率到虚拟距离的非线性映射：$K^E_s$ 决定整体距离尺度范围，$O^E_s$ 提供偏移以避免极弱路径在基站处塌缩，$R^E_s$ 控制映射的非线性程度，从而决定主径与弱径如何在 3D 嵌入空间中均匀分布。

随后通过球坐标变换，把到达方位角 $\hat\varphi^{{\rm az},A}_{s,k}$ 与到达俯仰角 $\hat\varphi^{{\rm ele},A}_{s,k}$ 转换为单位方向向量：

$$
\hat{\mathbf u}_{s,k}=
\begin{bmatrix}
\cos\hat\varphi^{{\rm az},A}_{s,k}\sin\hat\varphi^{{\rm ele},A}_{s,k}\\
\sin\hat\varphi^{{\rm az},A}_{s,k}\sin\hat\varphi^{{\rm ele},A}_{s,k}\\
\cos\hat\varphi^{{\rm ele},A}_{s,k}
\end{bmatrix}. \tag{14}
$$

最后，以基站位置 $\mathbf p_{\rm BS}$ 为中心，计算空间中第 $k$ 条路径对应的虚拟路径点位置坐标 $\hat{\mathbf p}_{s,k}=[p^x_{s,k},p^y_{s,k},p^z_{s,k}]$：

$$
\hat{\mathbf p}_{s,k}=\mathbf p_{\rm BS}+\hat d_{s,k}\hat{\mathbf u}^T_{s,k}. \tag{15}
$$

于是，有序序列 $\hat{\mathcal S}_s$ 中存储的 $N_{\rm peak}$ 组功率与角度参数可映射为坐标矩阵 $\hat{\mathbf P}^{xyz}_s\in\mathbb R^{N_{\rm peak}\times3}$，其中第 $k$ 行表示 sub-6 GHz 信道第 $k$ 条路径的虚拟路径点。值得一提的是，$\hat{\mathbf P}^{xyz}_s$ 中从第一行到最后一行的路径功率依次递减。此外，虚拟路径点并不对应与该路径相互作用的散射体的真实物理位置，而是在统一几何空间中编码多径参数与 3D 点云。

虚拟路径点的全部材料特征标记为 $-1$，从而把 $\hat{\mathbf P}^{xyz}_s$ 扩展为 $\hat{\mathbf P}_s\in\mathbb R^{N_{\rm peak}\times6}$。当虚拟路径点与静态场景重建矩阵 $\mathbf P_{\rm scene}$ 组合时，即可构建完整场景的 DT $\mathbf P_{\rm Ful}$：

$$
\mathbf P_{\rm Ful}=
\begin{bmatrix}
\mathbf P_{\rm scene}\\
\hat{\mathbf P}_s
\end{bmatrix}
\in\mathbb R^{(n_{\rm scene}+N_{\rm peak})\times6}. \tag{16}
$$

所提 DT 工作在物理层，由 3D 视觉数据重建的静态场景部分与 sub-6 GHz 参数估计得到的动态信道部分组成。静态场景保留物体几何与材料，动态信道反映时变传播；二者通过 CE 整合，使 DT 能同时支持 sub-6 GHz 感知与毫米波预测，提供多频段感知的传播环境表示。

### D. 分层信道预测网络

本小节介绍我们的 HCP-Net，它利用物理场景的 DT 预测毫米波 PAS。图 5 给出 HCP-Net 的完整架构。无线信道建模研究表明，多径分量对整体信道的贡献随其功率而异：在实际通信系统中，高功率主径对波束成形与链路建立至关重要，而低功率路径提供细粒度的角度分集。不同传播路径在信道预测中的重要性程度不同。受这种物理层级启发，所提 HCP-Net 采用分层编码与解码架构。

在分层编码器中，sub-6 GHz 多径分量按功率电平分组，随后被嵌入 3D 点云以构建多分辨率 DT，从而提取多粒度的信道传播与物理环境交互特征。类似地，在金字塔解码器中，毫米波多径分量也按功率电平分组，关键模式通过隐藏特征与预测结果由深层逐步传递到浅层。为便于介绍，我们把 HCP-Net 分为三方面：网络输入、网络输出与网络架构。

**1）网络输入：多径降采样与多分辨率 DT 构建：** 众所周知，每条传播路径的功率决定其对信道重建的贡献。因此我们按功率对路径降采样，把重要性不同的 sub-6 GHz 虚拟路径点与静态场景重建矩阵分层组合，构建不同层级的环境与信道融合特征。首先，把完整场景的 DT $\mathbf P_{\rm Ful}$ 作为第一级输入；随后采样功率最大的前 $\lceil N_{\rm peak}/k_s\rceil$ 条路径，与静态场景重建矩阵 $\mathbf P_{\rm scene}$ 拼接，形成第二级 DT 输入：

$$
\mathbf P_{\rm Maj}=
\begin{bmatrix}
\mathbf P_{\rm scene}\\
\hat{[\mathbf P_s]}_{1:\lceil N_{\rm peak}/k_s\rceil,:}
\end{bmatrix}
\in\mathbb R^{(n_{\rm scene}+\lceil N_{\rm peak}/k_s\rceil)\times6}, \tag{17}
$$

其中 $\lceil\cdot\rceil$ 表示向上取整。再采样功率最大的前 $\lceil N_{\rm peak}/k^2_s\rceil$ 条路径，与重建矩阵 $\mathbf P_{\rm scene}$ 拼接，形成第三级 DT 输入：

$$
\mathbf P_{\rm Dom}=
\begin{bmatrix}
\mathbf P_{\rm scene}\\
\hat{[\mathbf P_s]}_{1:\lceil N_{\rm peak}/k^2_s\rceil,:}
\end{bmatrix}
\in\mathbb R^{(n_{\rm scene}+\lceil N_{\rm peak}/k^2_s\rceil)\times6}. \tag{18}
$$

如图 5 所示，HCP-Net 的三个 DT 输入 $\mathbf P_{\rm Dom}$、$\mathbf P_{\rm Maj}$、$\mathbf P_{\rm Ful}$ 是嵌入了不同重要性多径信息的静态场景。

**2）网络输出：毫米波 CE 与投影：** 毫米波下行信道的功率与角度参数表示为

$$
\mathcal S_m=\left[
\left(\varphi^{{\rm az},D}_{m,1},\varphi^{{\rm ele},D}_{m,1},\alpha_{m,1}\right),
\left(\varphi^{{\rm az},D}_{m,2},\varphi^{{\rm ele},D}_{m,2},\alpha_{m,2}\right),
\dots,
\left(\varphi^{{\rm az},D}_{m,L_m},\varphi^{{\rm ele},D}_{m,L_m},\alpha_{m,L_m}\right)
\right], \tag{19}
$$

其中 $\alpha_{m,1}\ge\alpha_{m,2}\ge\cdots\ge\alpha_{m,L_m}$。

首先，毫米波参数需经 CE 转换为虚拟路径点；随后每个虚拟路径点通过信道投影被投影到虚拟距离矩阵 $\mathbf D$ 与掩码矩阵 $\mathbf M$。信道投影把集合预测转换为固定维数、物理可解释的表示，从而解决多径数可变的问题。与 sub-6 GHz CE 不同，毫米波 CE 在以基站位置为原点的局部坐标系中执行。具体地，以序列 $\mathcal S_m$ 中第 $k$ 组功率与角度参数 $(\varphi^{{\rm az},D}_{m,k},\varphi^{{\rm ele},D}_{m,k},\alpha_{m,k})$ 为例，毫米波信道的归一化距离可定义为

$$
d_{m,k}=K^E_m\left(\frac{\alpha_{m,k}}{\alpha_{m,\max}}\right)^{R^E_m}+O^E_m, \tag{20}
$$

其中 $K^E_m$、$O^E_m$、$R^E_m$ 分别为毫米波信道的缩放因子、偏置与指数因子；$\alpha_{m,\max}$ 为毫米波路径功率的最大值。随后，离开方位角 $\varphi^{{\rm az},D}_{m,k}$ 与离开俯仰角 $\varphi^{{\rm ele},D}_{m,k}$ 将按式 (14) 转换为单位方向向量 $\mathbf u_{m,k}$。最后，第 $k$ 条毫米波路径对应的虚拟路径点坐标由 $\mathbf p_{m,k}=d_{m,k}\mathbf u^T_{m,k}$ 得到。序列 $\mathcal S_m$ 中存储的 $L_m$ 组功率与角度参数可嵌入含 $L_m$ 个虚拟路径点的集合 $\mathbf P^{\rm Ful}_m=\{\mathbf p_m\in\mathbb R^3\}$。

如图 5 所示，在 HCP-Net 输出端，我们同样基于毫米波路径功率执行多级 PAS 预测。定义主径虚拟距离矩阵 $\mathbf D_{\rm Dom}$，把功率最大路径的虚拟路径点投影进去；同时由功率最大的前五条路径 $\mathbf P^{\rm Maj}_m$ 投影出主要虚拟距离矩阵 $\mathbf D_{\rm Maj}$，由全部路径 $\mathbf P^{\rm Ful}_m$ 投影出完整虚拟距离矩阵 $\mathbf D_{\rm Ful}$。三个虚拟距离矩阵的维数均为 $N_H$ 行、$N_W$ 列。同时，每个虚拟距离矩阵配一个掩码矩阵 $\mathbf M$，用于标记 $\mathbf D$ 中有效虚拟路径点的位置（如图 6 所示）。于是我们把虚拟路径点投影进三个虚拟距离矩阵 $\mathbf D_{\rm Dom}$、$\mathbf D_{\rm Maj}$、$\mathbf D_{\rm Ful}$ 及相应掩码矩阵 $\mathbf M_{\rm Dom}$、$\mathbf M_{\rm Maj}$、$\mathbf M_{\rm Ful}$。

具体地，把第 $k$ 条路径的虚拟路径点 $\mathbf p_{m,k}=[p^x_{m,k},p^y_{m,k},p^z_{m,k}]$ 转换为虚拟距离矩阵坐标（第 $i$ 行、第 $j$ 列），投影 $\Pi:\mathbb R^3\mapsto\mathbb R^2$ 为

$$
\begin{pmatrix}i\\j\end{pmatrix}=
\begin{pmatrix}
N_H\left(1-\dfrac{\arcsin\left(p^z_{m,k}d^{-1}_{m,k}\right)+\left|\varphi^{{\rm ele},D}_{m,{\rm down}}\right|}{\varphi^{{\rm ele},D}_{m,{\rm fov}}}\right)\\[10pt]
\dfrac{N_W}{2}\left(1-\dfrac{2}{\pi}\arctan\left(\dfrac{p^y_{m,k}}{p^x_{m,k}}\right)\right)
\end{pmatrix}, \tag{21}
$$

其中 $\varphi^{{\rm ele},D}_{m,{\rm up}}=\pi/2-\varphi^{{\rm ele},D}_{m,\min}$ 与 $\varphi^{{\rm ele},D}_{m,{\rm down}}=\pi/2-\varphi^{{\rm ele},D}_{m,\max}$ 分别为虚拟路径点相对基站的上下垂直视场；$\varphi^{{\rm ele},D}_{m,\min}$ 与 $\varphi^{{\rm ele},D}_{m,\max}$ 分别为毫米波信道中离开俯仰角的最小值与最大值；$\varphi^{{\rm ele},D}_{m,{\rm fov}}=|\varphi^{{\rm ele},D}_{m,{\rm up}}|+|\varphi^{{\rm ele},D}_{m,{\rm down}}|$ 为垂直视场。所有虚拟距离矩阵中存有投影点的距离 $d_{m,k}$，若对应矩阵坐标处无投影点则存 $-1$。在 $\mathbf D_{\rm Maj}$ 与 $\mathbf D_{\rm Ful}$ 这类需要投影多个虚拟路径点的情形，我们按路径功率从小到大顺序投影。

最后，通过反投影与逆嵌入可获得每条路径的预测功率与角度参数。当 HCP-Net 预测出一对完整虚拟距离矩阵 $\hat{\mathbf D}_{\rm Ful}$ 与掩码矩阵 $\hat{\mathbf M}_{\rm Ful}$ 时，我们可反投影计算以基站位置为原点的局部坐标系中的虚拟路径点。当掩码矩阵坐标（第 $i$ 行、第 $j$ 列）的值大于 0.5，即 $[\hat{\mathbf M}_{\rm Ful}]_{i,j}>0.5$ 时，虚拟距离矩阵中该坐标的值 $[\hat{\mathbf D}_{\rm Ful}]_{i,j}$ 可反投影为一个虚拟路径点；假定它对应第 $k$ 条毫米波路径。求解式 (21) 得俯仰角 $\hat\varphi^{\rm pit}_{i,j}=\left(1-\frac{i}{N_H}\right)\varphi^{{\rm ele},D}_{m,{\rm fov}}-\left|\varphi^{{\rm ele},D}_{m,{\rm down}}\right|$ 与方位角 $\hat\varphi^{\rm az}_{i,j}=\frac{\pi}{2}\left(1-\frac{2j}{N_W}\right)$。于是虚拟路径点计算为

$$
\begin{bmatrix}\hat p^x_{m,k}\\\hat p^y_{m,k}\\\hat p^z_{m,k}\end{bmatrix}
=[\hat{\mathbf D}_{\rm Ful}]_{i,j}\cdot
\begin{bmatrix}
\cos\left(\hat\varphi^{\rm az}_{i,j}\right)\cdot\cos\left(\hat\varphi^{\rm pit}_{i,j}\right)\\
\sin\left(\hat\varphi^{\rm az}_{i,j}\right)\cdot\cos\left(\hat\varphi^{\rm pit}_{i,j}\right)\\
\sin\left(\hat\varphi^{\rm pit}_{i,j}\right)
\end{bmatrix}. \tag{22}
$$

求解式 (20) 的逆运算，可由预测的归一化距离 $\hat d_{m,k}=[\hat{\mathbf D}_{\rm Ful}]_{i,j}$ 计算第 $k$ 条路径的功率。离开俯仰角与俯仰角之间的运算为 $\hat\varphi^{{\rm ele},D}_{m,k}=\pi/2-\hat\varphi^{\rm pit}_{i,j}$，离开方位角 $\hat\varphi^{{\rm az},D}_{m,k}$ 等于方位角 $\hat\varphi^{\rm az}_{i,j}$。

**3）网络架构：分层编码器与金字塔解码器：** 网络架构由两个基本模块组成：分层编码器与金字塔解码器。在分层编码器中，我们首先引入基本特征提取器——组合多通道提取器（CMCE）。受 3D 点云处理中经典 PointNet [35] 的启发，CMCE 结构针对带材料类别语义的嵌入特征量身设计（如图 7 所示）。CMCE 旨在通过联合编码场景几何与虚拟路径点，捕获环境散射体与传播路径之间的交互。具体地，CMCE 先用卷积 NN（CNN）把每个点编码为多通道的多个维度，再对最后四层输出做最大池化，得到多维度特征向量 $[128-256-512-1024]$；所有特征向量拼接成组合隐向量 $\mathbf l\in\mathbb R^{1920\times1}$，包含从低阶到高阶的特征信息。HCP-Net 中所有卷积层均连接批归一化（BN）与 ReLU 激活函数。

分层编码器的输入是三层 DT $\mathbf P_{\rm Ful}$、$\mathbf P_{\rm Maj}$、$\mathbf P_{\rm Dom}$；三个独立的 CMCE 把这三层 DT 映射为三个隐向量 $\mathbf l_i$（$i=1,2,3$）。不同隐向量表示不同重要性的信道路径与物理环境之间的交互特征。所有隐向量 $\mathbf l_i$ 随后拼接成隐特征模式 $\mathbf L\in\mathbb R^{1920\times3}$，再用一维 CNN 把该隐特征模式整合为最终特征向量 $\mathbf v$。

金字塔解码器以最终特征向量 $\mathbf v$ 为输入，目标是输出毫米波 PAS。为准确预测完整毫米波 PAS，我们设计金字塔解码器分别预测 $\mathbf D_{\rm Dom}$、$\mathbf D_{\rm Maj}$、$\mathbf D_{\rm Ful}$ 及其相应掩码矩阵。全连接（FC）层构成整个解码器的基本网络单元。首先让 $\mathbf v$ 通过三个分别含 $3U$、$2U$、$U$ 个神经元的 FC 层，得到三个基础特征 $\mathbf v_i$（$i=1,2,3$）。功率最大路径的虚拟路径点被视为主径毫米波 PAS $\mathbf P^{\rm Dom}_m$：我们先由最深层 $\mathbf v_3$ 预测虚拟距离矩阵 $\mathbf D_{\rm Dom}$ 与掩码矩阵 $\mathbf M_{\rm Dom}$，再反投影得到 $\mathbf P^{\rm Dom}_m$。功率最大的前五条路径被视为主要毫米波 PAS $\mathbf P^{\rm Maj}_m$，基于 $\mathbf v_2$ 预测；同理，含全路径的毫米波 PAS $\mathbf P^{\rm Ful}_m$ 由 $\mathbf v_1$ 预测。

在金字塔解码器中，设计了多目标全连接（MTFC）网络（如图 8 所示）以预测路径的存在性与功率。预测虚拟距离矩阵 $\mathbf D$ 时，输出依据毫米波 CE 中的缩放因子 $K^E_m$、偏置 $O^E_m$ 与指数因子 $R^E_m$ 加以约束；预测掩码矩阵 $\mathbf M$ 时，输出被限制在 $[0,1]$。金字塔解码器从两方面把信息由深层传递到浅层：隐藏特征与预测输出。在隐藏特征方面，从 $\mathbf v_3$（功率最大路径）提取的隐藏特征被传递给 $\mathbf v_2$，用于预测功率最大的前五条路径；在预测输出方面，浅层 MTFC 网络的预测结果用深层 MTFC 网络所预测虚拟距离矩阵与掩码矩阵的有效值更新。这确保解码器各层输出聚焦于不同重要性的路径。表 II 总结了详细前向计算顺序与信息传递方向。

**表 II：** 金字塔解码器的前向计算流程。

| 预测层级 | 输入 | 主要操作 | 传递 |
|---|---|---|---|
| 主径（最深） | 特征 $\mathbf v_3$ | 映射到主径级特征 $\mathbf e_3$；经 MTFC 预测主径级矩阵 $\mathbf D_{\rm Dom}$ 与 $\mathbf M_{\rm Dom}$ | 无上层传递 |
| 主要（中间） | 特征 $\mathbf v_2$ | 映射到主要级特征 $\mathbf e_2$；经 MTFC 预测主要级矩阵 $\mathbf D_{\rm Maj}$ 与 $\mathbf M_{\rm Maj}$ | 1）隐藏特征传递：把 $\mathbf e_2$ 与 $\mathbf e_3$ 拼接以预测 $\mathbf D_{\rm Maj}$ 与 $\mathbf M_{\rm Maj}$；2）预测输出传递：把 $\mathbf D_{\rm Dom}$ 与 $\mathbf M_{\rm Dom}$ 的 Top-1 条目复制进 $\mathbf D_{\rm Maj}$ 与 $\mathbf M_{\rm Maj}$ |
| 全路径（最浅） | 特征 $\mathbf v_1$ | 映射到全路径级特征 $\mathbf e_1$；经 MTFC 预测全路径级矩阵 $\mathbf D_{\rm Ful}$ 与 $\mathbf M_{\rm Ful}$ | 1）隐藏特征传递：把多级特征 $\mathbf e_1$、$\mathbf e_2$、$\mathbf e_3$ 拼接以预测 $\mathbf D_{\rm Ful}$ 与 $\mathbf M_{\rm Ful}$；2）预测输出传递：把 $\mathbf D_{\rm Maj}$ 与 $\mathbf M_{\rm Maj}$ 的 Top-5 条目复制进 $\mathbf D_{\rm Ful}$ 与 $\mathbf M_{\rm Ful}$ |

金字塔解码器中的所有张量操作（包括特征拼接与预测输出复制）都以可微算子实现，因此来自所有解码层的梯度都能通过传递的隐藏特征与有效预测输出反向传播，联合优化共享参数。此外，三个 MTFC 的神经元数不同，主要差异在 $FC_{d-1}$ 与 $FC_{m-1}$ 层：用于预测 $\mathbf D_{\rm Dom}$ 与 $\mathbf M_{\rm Dom}$ 的 MTFC 神经元数为 $3U$，针对 $\mathbf D_{\rm Maj}$ 与 $\mathbf M_{\rm Maj}$ 的 MTFC 用 $4U$ 个神经元，最后的 MTFC 容量更大，共 $7U$ 个神经元。

**图 5：** 分层信道预测网络（HCP-Net）的架构。

**图 6：** 用掩码矩阵标记虚拟距离矩阵中有效虚拟路径点的位置。

**图 7：** CMCE 的网络结构。

**图 8：** MTFC 的网络结构。

### E. HCP-Net 的预训练与微调

本小节介绍 HCP-Net 的预训练与微调过程，并给出各阶段所用损失函数。首先，金字塔解码器直接预测三级虚拟距离矩阵 $\mathbf D_{\rm Level}$ 与掩码矩阵 $\mathbf M_{\rm Level}$，其中 ${\rm Level}\in\{{\rm Dom},{\rm Maj},{\rm Ful}\}$。因此在预训练阶段，损失由虚拟距离矩阵与掩码矩阵计算。平均虚拟距离（AVD）损失为

$$
\mathcal L^{\rm AVD}_{\rm Level}=\frac{1}{|\mathcal V_{\rm Level}|}\sum_{(i,j)\in\mathcal V_{\rm Level}}
\left|[\hat{\mathbf D}_{\rm Level}]_{i,j}-[\mathbf D_{\rm Level}]_{i,j}\right|, \tag{23}
$$

其中 $\hat{\mathbf D}_{\rm Level}$ 与 $\mathbf D_{\rm Level}$ 分别为预测与真实的虚拟距离矩阵；$\mathcal V_{\rm Level}=\{(i,j)\mid[\mathbf D_{\rm Level}]_{i,j}\ne-1\}$ 为真实虚拟距离矩阵中有效真值坐标的集合。

掩码矩阵决定虚拟距离矩阵中有效值的位置与数目。鉴于其重要性，我们结合加权二元交叉熵（BCE）损失与加权平均绝对误差（MAE）损失联合训练掩码矩阵。由于类别严重不平衡，掩码矩阵预测的损失函数中引入加权系数；此外，由于各级信道路径数不同，需要为各级损失函数设置不同权重系数 $w^B_{\rm Level}$ 与 $w^M_{\rm Level}$。加权 BCE 损失可写为

$$
\mathcal L^{\rm BCE}_{\rm Level}=-\frac{1}{N_HN_W}\sum_{i=1}^{N_H}\sum_{j=1}^{N_W}
\left[
w^B_{\rm Level}\cdot[\mathbf M_{\rm Level}]_{i,j}\cdot\log\left([\hat{\mathbf M}_{\rm Level}]_{i,j}\right)
+\left(1-[\mathbf M_{\rm Level}]_{i,j}\right)\cdot\log\left(1-[\hat{\mathbf M}_{\rm Level}]_{i,j}\right)
\right], \tag{24}
$$

其中 $w^B_{\rm Level}$ 表示正样本的 BCE 权重。加权 MAE 损失计算为

$$
\mathcal L^{\rm MAE}_{\rm Level}=\frac{1}{N_HN_W}\sum_{i=1}^{N_H}\sum_{j=1}^{N_W}
w_{i,j}\cdot\left|[\hat{\mathbf M}_{\rm Level}]_{i,j}-[\mathbf M_{\rm Level}]_{i,j}\right|, \tag{25}
$$

其中坐标 $(i,j)$ 处的权重 $w_{i,j}$ 定义为

$$
w_{i,j}=
\begin{cases}
w^M_{\rm Level}, & [\mathbf D_{\rm Level}]_{i,j}\ne-1,\\
1, & \text{否则}.
\end{cases} \tag{26}
$$

因此，预训练阶段在每一级上定义于虚拟距离矩阵与掩码矩阵的组合损失函数为

$$
\mathcal L^{\rm comb}_{\rm Level}=\lambda_{\rm AVD}\mathcal L^{\rm AVD}_{\rm Level}
+\frac{\lambda_{\rm MASK}}{2}\left(\mathcal L^{\rm BCE}_{\rm Level}+\mathcal L^{\rm MAE}_{\rm Level}\right), \tag{27}
$$

其中 $\lambda_{\rm AVD}$ 与 $\lambda_{\rm MASK}$ 为超参数权重。总之，预训练总损失为

$$
\mathcal L_{\rm pre}=\lambda_{\rm Dom}\mathcal L^{\rm comb}_{\rm Dom}
+\lambda_{\rm Maj}\mathcal L^{\rm comb}_{\rm Maj}
+\lambda_{\rm Ful}\mathcal L^{\rm comb}_{\rm Ful}, \tag{28}
$$

其中 $\lambda_{\rm Dom}$、$\lambda_{\rm Maj}$、$\lambda_{\rm Ful}$ 在训练中动态更新，且满足 $\lambda_{\rm Dom}+\lambda_{\rm Maj}+\lambda_{\rm Ful}=1$。

一旦 HCP-Net 预测出虚拟距离矩阵与掩码矩阵，即可反投影回虚拟路径点。由于虚拟路径点能以物理意义表示传播路径，我们把它作为 HCP-Net 微调的额外目标。于是，我们计算由 HCP-Net 输出反投影得到的虚拟路径点 $\hat{\mathbf P}^{\rm Ful}_m=\{\hat{\mathbf p}_m\in\mathbb R^3\}$ 与由真实路径参数嵌入的虚拟路径点 $\mathbf P^{\rm Ful}_m=\{\mathbf p_m\in\mathbb R^3\}$ 之间的 Chamfer 距离（CD）[36] 损失：

$$
\mathcal L_{\rm CD}=\frac{1}{|\hat{\mathbf P}^{\rm Ful}_m|}\sum_{\hat{\mathbf p}_m\in\hat{\mathbf P}^{\rm Ful}_m}\min_{\mathbf p_m\in\mathbf P^{\rm Ful}_m}\|\hat{\mathbf p}_m-\mathbf p_m\|_2^2
+\frac{1}{|\mathbf P^{\rm Ful}_m|}\sum_{\mathbf p_m\in\mathbf P^{\rm Ful}_m}\min_{\hat{\mathbf p}_m\in\hat{\mathbf P}^{\rm Ful}_m}\|\hat{\mathbf p}_m-\mathbf p_m\|_2^2. \tag{29}
$$

CD 损失的计算通常因最近邻搜索而较慢，因此我们只在全路径 $\mathbf P^{\rm Ful}_m$ 的虚拟路径点上计算 CD 损失。微调阶段的总损失函数为 $\mathcal L_{\rm fine}=\mathcal L_{\rm pre}+\lambda_{\rm CD}\mathcal L_{\rm CD}$，其中 $\lambda_{\rm CD}$ 为 CD 损失的权重系数。尽管已知 CD 损失对大规模点集中的离群点敏感，但在我们的情形中该影响可忽略，因为虚拟路径点对应物理上有效的传播路径；此外多级掩码矩阵滤除无效点，与其他损失项的加权组合保证了稳定、鲁棒的优化。

### F. 复杂度分析

我们通过统计浮点运算（FLOPs）分析所提 HCP-Net 的计算复杂度。具体地，考虑 HCP-Net 中第 $l$ 个卷积层，它使用 $N^c_l$ 个尺寸为 $K^c_{H,l}\times K^c_{W,l}$ 的卷积核，产生尺寸为 $H^{\rm out}_{H,l}\times H^{\rm out}_{W,l}$ 的输出特征图。根据 [37]，第 $l$ 个卷积层的计算复杂度为

$$
\mathcal O\left(K^c_{H,l}\times K^c_{W,l}\times H^{\rm out}_{H,l}\times H^{\rm out}_{W,l}\times N^c_{l-1}\times N^c_l\right). \tag{30}
$$

同时，第 $l$ 个 FC 层的计算复杂度为 $\mathcal O(N^f_{l-1}\times N^f_l)$，其中 $N^f_l$ 表示第 $l$ 个 FC 层的神经元数。因此，所提 HCP-Net 的整体计算复杂度为

$$
\mathcal O\left(\sum_{l\in\mathcal L_f}N^f_{l-1}\times N^f_l
+\sum_{l\in\mathcal L_c}K^c_{H,l}\times K^c_{W,l}\times H^{\rm out}_{H,l}\times H^{\rm out}_{W,l}\times N^c_{l-1}\times N^c_l\right), \tag{31}
$$

其中 $\mathcal L_f$ 为 HCP-Net 中 FC 层数，$\mathcal L_c$ 为卷积层数。归一化、池化与条目替换等操作的计算代价未显式计算，因为它们不影响由 HCP-Net 中卷积层与 FC 层主导的渐近复杂度。

## IV. 仿真设置与结果

本节给出仿真设置以及所提 TwinPAS 方法的性能评估结果。

### A. 场景设置与信道生成

**1）室内办公场景设置：** 我们用 3D 建模软件 Blender [38] 构建 $N_{\rm scene}=300$ 个室内办公场景。每个办公场景的长、宽、高分别固定为 20 m、10 m、3 m。为模拟复杂多变的信道传播场景，我们选取沿办公室长边 2 m 至 16 m 的范围作为散射体随机分布区域（如图 9 所示）。具体地，散射体随机分布区域被划分为多个 $2\ \text{m}\times2\ \text{m}$ 的网格，随机选取 5–8 个网格放置散射体以创建不同场景。每个散射体的长与宽可配置三种可能尺寸：1 m、1.5 m、2 m；高度可从 0.5 m、1 m、3 m 中选择。为生成多样化的场景布局，每个场景中每个散射体的长、宽、高都随机选取。当随机生成的散射体高为 3 m 时，我们把它视为墙柱并使用混凝土材料；其他高度下材料在木材或金属中随机配置。墙壁、地板与天花板由混凝土制成。此外，我们用右侧的开阔空间作为接收机分布区域。

**2）信道生成：** 使用商业射线追踪软件 Wireless InSite [39] 仿真无线信道。Wireless InSite 仿真信道与实测信道之间传播规律的一致性已在 [40] 中得到验证。我们确保 Wireless InSite 中的场景模型与散射体尺寸/位置/材料与 Blender 中完全一致，以产生相应信道。接收机在接收机分布区以 0.5 m 等间隔放置，每个场景含 $7\times19=133$ 个接收机；基站固定在坐标 $\mathbf p_{\rm BS}=(0,5,2)$，接收机位于 1 m 高度。对每对基站与接收机均仿真毫米波与 sub-6 GHz 信道。

$N_{\rm scene}=300$ 个场景共含 $300\times133=39{,}900$ 个共址信道样本。我们用全部样本的 80% 作为训练集（共 31,920 个样本），其余 20% 作为测试集（共 7,980 个样本）。此外，我们构建 $N_{\rm gen}=60$ 个新场景以检验所提方法的泛化性，共 $60\times133=7980$ 个样本作为预留数据集。按信道分簇的概念 [41]，我们把方位角与俯仰角差异均在 1 度以内的路径合并为同一簇。用于射线追踪数据生成与通信系统仿真的主要参数见表 III。

**表 III：** 信道仿真参数。

| 参数 | 毫米波 | Sub-6 GHz |
|---|---|---|
| 载频 | 28 GHz | 3.5 GHz |
| 天线类型 | UPA | UPA |
| 天线数（水平 × 垂直） | 64×16 | 8×8 |
| 天线间隔 | 0.5 波长 | 0.5 波长 |
| 带宽（GHz） | 0.5 | 0.02 |
| OFDM 子载波数 | 512 | 32 |
| 传播模型 | X3D | X3D |
| 最大路径数 | 25 | 25 |

**图 9：** 所构建室内办公通信场景的俯视图。

### B. 方法参数设置

**1）TwinPAS 方法参数：** 我们用 Trimesh [42] 与 Open3D [43] 库把 Blender 中构建的 3D 场景转换为点云数据形式，点数 $n_{\rm scene}=4096$。¹ 在 sub-6 GHz 信道参数提取中，垂直与水平维度的角度网格点数均为 $N_{{\rm sam},v}=N_{{\rm sam},h}=32$。

¹ 3D 点云中使用的材料参数按 sub-6 GHz 频段的材料类别指定。对介电材料，其毫米波响应未被显式建模，而是从数据中学习。

² 4096 个点的选择基于不同点云密度（1024、2048、4096、8192）的额外仿真结果：CD 损失分别下降 4.98%（1024→2048）、6.77%（2048→4096）、1.78%（4096→8192）。由于超过 4096 点后性能提升小于 2%，而点云计算代价几乎翻倍，4096 点在预测精度与效率之间取得良好平衡。

从信道提取的路径数设为 $N_{\rm peak}=25$，降采样率 $k_s=5$。在 sub-6 GHz CE 中，缩放因子、偏置与指数因子分别设为 $K^E_s=1$、$O^E_s=1$、$R^E_s=1/2$；在毫米波 CE 中，上述参数分别为 $K^E_m=1$、$O^E_m=1$、$R^E_m=1/3$。三个 DT 的空间坐标在输入 HCP-Net 前被变换到以基站为原点的局部坐标系，确保 HCP-Net 输入与输出的坐标系一致。虚拟距离矩阵与掩码矩阵的维数均为 $N_H=31$ 行、$N_W=180$ 列。

CMCE 的参数如图 7 所示，神经元单元尺度 $U$ 为 2048。此外，$w^B_{\rm Level}$ 与 $w^M_{\rm Level}$ 分别表示 BCE 与 MAE 损失中正样本的权重，我们设 $w^B_{\rm Dom}=w^M_{\rm Dom}=120$、$w^B_{\rm Maj}=w^M_{\rm Maj}=24$、$w^B_{\rm Ful}=w^M_{\rm Ful}=5$。预训练轮数 $N_{\rm pre}$ 为 100，微调轮数 $N_{\rm fine}$ 为 100。预训练中，当 epoch $<60$ 时设 $\lambda_{\rm Dom}=0.5$、$\lambda_{\rm Maj}=0.3$、$\lambda_{\rm Ful}=0.2$，否则设 $\lambda_{\rm Dom}=0.4$、$\lambda_{\rm Maj}=0.3$、$\lambda_{\rm Ful}=0.3$。微调中，当 epoch $<60$ 时参数设置与预训练最后阶段相同；当 $60\le{\rm epoch}\le100$ 时设 $\lambda_{\rm Dom}=0.3$、$\lambda_{\rm Maj}=0.3$、$\lambda_{\rm Ful}=0.4$。Adam 优化器学习率设为 $2.5\times10^{-4}$，批大小为 16。损失权重 $\lambda_{\rm AVD}$、$\lambda_{\rm MASK}$、$\lambda_{\rm CD}$ 分别为 1、1、0.5。

**2）其他算法参数与指标：** 我们还给出穷举搜索（ExS）方法、环境感知波束训练（ESBT）方案 [5]、基于监督学习的波束预测（SLBP）方法 [8]、同时正交匹配追踪（SOMP）方法以及结构化 logit 加权 SOMP（SLW-SOMP）算法 [9] 的仿真结果作为对比。ExS 是带内波束选择基准，扫描预定义码本中的所有候选波束；ESBT 是基于深度强化学习的波束训练方案，通过序贯反馈利用毫米波信道的带内空间一致性；SLBP 方法利用 NN 基于跨频段空间相关性学习从 sub-6 GHz 信道到最优毫米波波束的非线性映射；SOMP 与 SLW-SOMP 是基于 CS 的算法，恢复毫米波信道的稀疏角度域表示以识别主波束方向，其中 SLW-SOMP 进一步利用 sub-6 GHz 角度先验进行加权恢复。ESBT 方法的动作空间为 $\mathcal A_u=\{(a,b)\mid a=-48,-16,16,48;\ b=48,96,144\}$。SLW-SOMP 与 SOMP 方法中的波束测量数分别为 64 与 512。

波束选择性能比较所用指标为平均可达速率（AAR），定义为 ${\rm AAR}=\frac{1}{N_u}\sum_{i=1}^{N_u}\frac{R_{m,i}}{K_m}$，其中 $R_{m,i}$ 为第 $i$ 个毫米波信道的可达速率（AR），$N_u$ 为信道样本数。含波束扫描开销的 AR 定义为

$$
R_{m,i}=\left(1-\frac{N_{\rm bs}T_b}{T_m}\right)\sum_{k=1}^{K_m}
\log_2\left(1+\frac{\left|\mathbf h^H_{m,i}[k]\hat{\mathbf f}_i\right|^2P_m}{\sigma^2_m}\right), \tag{32}
$$

其中 $T_m$ 为一个时隙（相干块）的时长，$T_b$ 表示单次波束扫描的开销。仿真中设 $\frac{T_b}{T_m}=\frac{1}{4096}$。此外，$N_{\rm bs}$ 为波束扫描次数，随不同波束选择算法而变化；$\hat{\mathbf f}_i$ 为各算法预测的第 $i$ 个毫米波信道的波束成形向量，$P_m$ 为发射信号功率。不失一般性，我们还采用成功百分比（SP）作为评估不同方案波束选择精度的指标：${\rm SP}=\frac{1}{N_u}\sum_{i=1}^{N_u}\mathbf 1\left\{\hat{\mathbf f}_i=\mathbf f^*_i\right\}$，其中 $\mathbf 1(\cdot)$ 为指示函数，$\mathbf f^*_i$ 为由整个 DFT 码本得到的第 $i$ 个信道样本的最优波束成形码字。

### C. 结果与讨论

在第一组仿真中，我们展示所提 TwinPAS 方法的训练与预测效果。图 10 给出预训练与微调阶段总损失随 epoch 的变化，其中前 100 个 epoch 为预训练阶段、后 100 个 epoch 为微调阶段。无论哪个阶段，我们都在第 60 个 epoch 调整 $\lambda_{\rm Dom}$、$\lambda_{\rm Maj}$、$\lambda_{\rm Ful}$ 以增大 $\mathcal L^{\rm comb}_{\rm Ful}$ 的权重。由于微调中引入 CD 损失，总损失在微调开始时会上升；但随着微调继续，总损失持续下降直至收敛。此外，CD 损失是直接反映预测虚拟路径点与目标虚拟路径点差异的指标；微调中训练集与测试集的 CD 损失都能良好收敛。接下来我们用若干实际样例展示微调后的预测效果。

图 11 给出测试集中两个不同信道样本的目标 PAS 与预测 PAS。由于信道中路径数量很多，为清晰比较，PAS 被拆分为方位 PAS 与俯仰 PAS 展示。首先，所提 TwinPAS 方法取得了令人满意的预测性能，特别是对信道中功率相对较大的主路径，能准确预测其离开方位角、离开俯仰角与功率值。对功率相对较小的某些路径，所提方法可能出现预测误差，但这对完整 PAS 的影响很小。此外，所提 HCP-Net 存在一定的“幻觉问题”，即预测出真实信道中并不存在的某些路径；但得益于所提分层预测方式，这些本不该存在的预测路径功率都很小。总体而言，所提 TwinPAS 方法能取得理想的 PAS 预测结果。

**图 10：** 预训练与微调阶段总损失随 epoch 的变化。

**图 11：** 测试集中两个信道的方位与俯仰 PAS。

在第二组仿真中，我们研究 TwinPAS 方法各组件对算法性能的影响。消融研究分为两组。第一组研究不同 DT 构建方式对毫米波 PAS 预测的影响，因此设置三种消融变体。无 CE 变体：把 sub-6 GHz 信道每条路径的到达方位角、到达俯仰角与功率直接与静态场景重建矩阵 $\mathbf P_{\rm scene}$ 组合来预测目标输出。无场景变体：从 DT 构建过程中移除静态场景重建矩阵 $\mathbf P_{\rm scene}$。无材料变体：静态场景重建中不补充材料语义分割特征。

图 12 给出完整 TwinPAS 与三种消融变体在测试集上 CD 损失的比较。移除场景使 CD 损失增加 65.33%。在无场景基础上，我们进一步用相邻位置的完美毫米波信道参数替代估计的 sub-6 GHz 信道参数；与无场景情形相比，CD 损失仅降低 4.50%，进一步证明了跨频段 PAS 预测的可行性。去掉材料特征时 CD 损失增加 29.33%。或许更令人惊讶的是，移除 CE 导致 CD 损失显著增加，这意味着在 PAS 预测下信道参数无法与环境信息直接有效地融合。总体而言，第一组消融研究凸显了所提 TwinPAS 框架中 DT 构建策略对准确毫米波 PAS 预测的优越性。

第二组研究不同 NN 架构对毫米波 PAS 预测的影响，设置三种消融变体。在网络输入方面实现两个变体：一个无 CMCE，另一个无分层输入。首先，我们用 PointNet [35] 中的多层感知机（MLP）替代 CMCE 作为特征提取器。对无分层输入的变体，使用含全部 $N_{\rm peak}$ 个虚拟路径点的完整场景 DT $\mathbf P_{\rm Ful}$ 作为网络唯一输入。在网络输出方面，把金字塔输出改为单一输出，直接取消由深层向浅层的特征与结果传递。

图 13 给出这些消融变体的结果。用 MLP 替代 CMCE 使 CD 损失增加 37.33%，凸显 CMCE 在捕获信道路径与物理环境匹配关系方面的有效性。移除分层输入影响最大，CD 损失增加 84.00%，证实了建模多分辨率 DT 表示的必要性。最后，取消金字塔输出使 CD 损失增加 25.33%，表明由深到浅的特征与结果传递在预测过程中能发挥显著作用。第二组消融研究清楚表明 HCP-Net 各组件对准确毫米波 PAS 预测的重要性。

**图 12：** 不同 DT 构建方式对 CD 损失的影响。

**图 13：** 不同 NN 架构对 CD 损失的影响。

在第三组仿真中，我们测试所提 TwinPAS 方法与其他算法在波束选择任务上的性能。图 14 给出所有方案的成功百分比随 sub-6 GHz 信道 SNR 的变化（毫米波信道 SNR 固定为 30 dB）。依赖毫米波信道稀疏性的 SOMP 方案与依赖无线信道空间一致性性质的 ESBT 方法不受 sub-6 GHz 信道影响，因此二者的 SP 均为水平直线：SOMP 的 SP 为 51.13%、ESBT 为 70.09%、SLBP 为 73.44%、SLW-SOMP 为 75.64%，而 TwinPAS 在高 SNR 下升至 83.53%。在三种利用 sub-6 GHz CSI 选择最优毫米波波束的方式中，TwinPAS 的 SP 在所有 SNR 下都始终高于 SLBP 与 SLW-SOMP 方案。

图 15 给出上述算法的 AAR。AAR 上界由 DFT 码本中的最优波束成形向量计算，不受噪声干扰且无训练开销。可以看到 TwinPAS 的 AAR 显著高于 ExS 算法，表明基于 AI 的波束选择在降低开销方面的巨大优势。总体而言，TwinPAS 方法在所有算法中最接近上界。上述仿真表明，所提方法的预测能力可支撑通信系统中的物理层应用。³

**图 14：** 不同 sub-6 GHz 信道 SNR 下各波束选择方法的 SP。

**图 15：** 不同 sub-6 GHz 信道 SNR 下各波束选择方法的 AAR。

³ 为验证所提 TwinPAS 方法的普适性，我们在相同仿真设置下额外进行了用估计的 2.1 GHz 信道参数辅助 28 GHz PAS 预测的仿真；所得 81.95% 的 SP 与 9.59 bit/s/Hz 的 AAR 与 3.5 GHz 辅助结果接近，证实了 TwinPAS 方法的跨频段鲁棒性。

在最后一组仿真中，我们测试训练好的 HCP-Net 在预留数据集上的泛化性。图 16 给出预留数据集中两个不同信道样本的目标 PAS 与预测 PAS。与测试集上的预测效果相比，对功率相对较小路径的预测效果略差，但仍能对功率相对较大的路径保持令人满意的预测效果。图 17 中，预留数据集上的 CD 损失趋势与测试集一致。此外，当 sub-6 GHz 与毫米波系统 SNR 均为 30 dB 时，预留数据集上波束选择的 SP 为 78.80%、AAR 为 9.47 bit/s/Hz；虽然低于测试集上的性能，但仍优于其他波束选择算法。回顾数据生成过程：训练集与测试集是从同一物理场景中不同接收机位置随机选取的信道样本，而预留数据集来自与训练集、测试集所在场景具有一定相似性的新场景中生成的信道样本。基于此，我们发现所提方法取得了令人满意的泛化性。

**图 16：** 预留数据集中两个信道的方位与俯仰 PAS。

**图 17：** 预留数据集上 CD 损失随 epoch 的变化。

## V. 结论

本文提出一种多频段共存通信系统中基于 DTC 的毫米波 PAS 预测方法。借助 CV 与 sub-6 GHz 参数估计，我们提出面向物理层应用的 DT 构建方案，使 DT 能响应实时的物理环境变化；其中提出跨模态信道嵌入方案，可有效整合视觉感知与信道特性。为准确预测毫米波 PAS，设计了 HCP-Net：HCP-Net 基于功率对信道传播路径分类，以实现多分辨率 DT 表示输入与多级毫米波 PAS 输出。仿真结果表明，所提方法取得令人满意的 PAS 预测效果，并在波束选择任务中相对现有方法表现出更优性能。更值得注意的是，所提方法在具有一定相似性的场景中展现出很强的泛化性，例如在同一房间内散射体的位置、尺寸与材料在有限范围内变化的情形。这可能是未来基于 DTC 的无线通信研究中值得进一步探索的方向。

## 参考文献（英文原条目，按原文顺序）

[1] O. Semiari, W. Saad, M. Bennis, and M. Debbah, “Integrated millimeter wave and sub-6 GHz wireless networks: A roadmap for joint mobile broadband and ultra-reliable low-latency communications,” *IEEE Wireless Commun.*, vol. 26, no. 2, pp. 109–115, Apr. 2019.
[2] T. S. Rappaport, Y. Xing, G. R. MacCartney, A. F. Molisch, E. Mellios, and J. Zhang, “Overview of millimeter wave communications for fifth-generation (5G) wireless networks—With a focus on propagation models,” *IEEE Trans. Antennas Propag.*, vol. 65, no. 12, pp. 6213–6230, Dec. 2017.
[3] Y. Teng, L. Jia, A. Liu, and V. K. N. Lau, “A hybrid pilot beamforming and channel tracking scheme for massive MIMO systems,” *IEEE Trans. Wireless Commun.*, vol. 20, no. 9, pp. 6078–6092, Sep. 2021.
[4] C. Qi, Y. Huang, S. Jin, and L. Wu, “Sparse channel estimation based on compressed sensing for massive MIMO systems,” in *Proc. IEEE Int. Conf. Commun. (ICC)*, Jun. 2015, pp. 4558–4563.
[5] J. Zhang, Y. Huang, J. Wang, X. You, and C. Masouros, “Intelligent interactive beam training for millimeter wave communications,” *IEEE Trans. Wireless Commun.*, vol. 20, no. 3, pp. 2034–2048, Mar. 2021.
[6] H. Miao et al., “A survey of new mid-band/FR3 for 6G: Channel measurement, characterization and modeling in outdoor environment,” 2025, arXiv:2504.06727.
[7] N. Gonzalez-Prelcic, A. Ali, V. Va, and R. W. Heath, “Millimeter-wave communication with out-of-band information,” *IEEE Commun. Mag.*, vol. 55, no. 12, pp. 140–146, Dec. 2017.
[8] M. Alrabeiah and A. Alkhateeb, “Deep learning for mmWave beam and blockage prediction using sub-6 GHz channels,” *IEEE Trans. Commun.*, vol. 68, no. 9, pp. 5504–5518, Sep. 2020.
[9] A. Ali, N. González-Prelcic, and R. W. Heath, “Millimeter wave beam-selection using out-of-band spatial information,” *IEEE Trans. Wireless Commun.*, vol. 17, no. 2, pp. 1038–1052, Feb. 2018.
[10] Z. Zhang et al., “Deep reinforcement learning based dynamic beam selection in dual-band communication systems,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 4, pp. 2591–2606, Apr. 2024.
[11] Z. Wu, J. Zhang, L. Tian, Z. Hu, T. Jiang, and W. Li, “Comparison on channel characteristics at 3.5 GHz and 28 GHz,” in *Proc. Eur. Conf. Antenna Propag. (EuCAP)*, Apr. 2018, pp. 1–5.
[12] Z. Zhang, J. Zhang, Y. Zhang, L. Yu, and G. Liu, “AI-based time-, frequency-, and space-domain channel extrapolation for 6G: Opportunities and challenges,” *IEEE Veh. Technol. Mag.*, vol. 18, no. 1, pp. 29–39, Mar. 2023.
[13] J. Zhang, “The interdisciplinary research of big data and wireless channel: A cluster-nuclei based channel model,” *China Commun.*, vol. 13, no. 2, pp. 14–26, Feb. 2016.
[14] K. Patel and R. W. Heath, “Harnessing multimodal sensing for multi-user beamforming in mmWave systems,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 12, pp. 18725–18739, Dec. 2024.
[15] W. Xu, F. Gao, X. Tao, J. Zhang, and A. Alkhateeb, “Computer vision aided mmWave beam alignment in V2X communications,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 4, pp. 2699–2714, Apr. 2023.
[16] J. Chen, F. Gao, X. Tao, G. Liu, C. Pan, and A. Alkhateeb, “Computer vision aided codebook design for MIMO communications systems,” *IEEE Trans. Wireless Commun.*, vol. 22, no. 5, pp. 3341–3354, May 2023.
[17] Y. Oguma, R. Arai, T. Nishio, K. Yamamoto, and M. Morikura, “Proactive base station selection based on human blockage prediction using RGB-D cameras for mmWave communications,” in *Proc. IEEE Global Commun. Conf. (GLOBECOM)*, Dec. 2015, pp. 1–6.
[18] W. Xu, F. Gao, J. Zhang, X. Tao, and A. Alkhateeb, “Deep learning based channel covariance matrix estimation with user location and scene images,” *IEEE Trans. Commun.*, vol. 69, no. 12, pp. 8145–8158, Dec. 2021.
[19] X. Cheng, B. Liu, X. Liu, E. Liu, and Z. Huang, “Foundation model empowered synesthesia of machines (SoM): AI-native intelligent multimodal sensing-communication integration,” *IEEE Trans. Netw. Sci. Eng.*, vol. 13, pp. 762–782, 2026.
[20] Y. Zeng et al., “A tutorial on environment-aware communications via channel knowledge map for 6G,” *IEEE Commun. Surveys Tuts.*, vol. 26, no. 3, pp. 1478–1519, 3rd Quart., 2024.
[21] Y. Yang, F. Gao, X. Tao, G. Liu, and C. Pan, “Environment semantics aided wireless communications: A case study of mmWave beam prediction and blockage prediction,” *IEEE J. Sel. Areas Commun.*, vol. 41, no. 7, pp. 2025–2040, Jul. 2023.
[22] M. Sun, L. Bai, Z. Huang, and X. Cheng, “Multi-modal sensing data-based real-time path loss prediction for 6G UAV-to-ground communications,” *IEEE Wireless Commun. Lett.*, vol. 13, no. 9, pp. 2462–2466, Sep. 2024.
[23] A. Bazzi, M. Ying, O. Kanhere, T. S. Rappaport, and M. Chafii, “ISAC imaging by channel state information using ray tracing for next generation 6G,” *IEEE J. Sel. Topics Electromagn., Antennas Propag.*, vol. 1, no. 1, pp. 135–149, Sep. 2025.
[24] X. Zhao, Z. An, Q. Pan, and L. Yang, “NeRF2: Neural radio-frequency radiance fields,” in *Proc. 29th Annu. Int. Conf. Mobile Comput. Netw.*, New York, NY, USA, Oct. 2023, pp. 1–15.
[25] H. Lu, C. Vattheuer, B. Mirzasoleiman, and O. Abari, “NeWRF: A deep learning framework for wireless radiation field reconstruction and channel prediction,” in *Proc. Int. Conf. Mach. Learn. (ICML)*, Jul. 2024, pp. 33147–33159.
[26] H. Wang et al., “Digital twin channel for 6G: Concepts, architectures and potential applications,” *IEEE Commun. Mag.*, vol. 63, no. 3, pp. 24–30, Mar. 2025.
[27] A. Alkhateeb, S. Jiang, and G. Charan, “Real-time digital twins: Vision and research directions for 6G and beyond,” *IEEE Commun. Mag.*, vol. 61, no. 11, pp. 128–134, Nov. 2023.
[28] H. Zou, J. Yang, H. P. Das, H. Liu, Y. Zhou, and C. J. Spanos, “WiFi and vision multimodal learning for accurate and robust device-free human activity recognition,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. Workshops (CVPRW)*, Jun. 2019, pp. 426–433.
[29] C. Zheng, J. He, C. G. Kang, G. Cai, and H. Wymeersch, “Multimodal radio and vision fusion for robust localization in urban V2I communications,” 2025, arXiv:2508.17640.
[30] Agisoft Metashape. Version 2.2.0. [Online]. Available: https://www.agisoft.com/
[31] J. L. Schönberger and J.-M. Frahm, “Structure-from-motion revisited,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Las Vegas, NV, USA, Jun. 2016, pp. 4104–4113.
[32] J. L. Schönberger, E. Zheng, J. M. Frahm, and M. Pollefeys, “Pixelwise view selection for unstructured multi-view stereo,” in *Proc. Eur. Conf. Comput. Vis.*, 2016, pp. 501–518.
[33] S. Bell, P. Upchurch, N. Snavely, and K. Bala, “Material recognition in the wild with the materials in context database,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Jun. 2015, pp. 3479–3487.
[34] C. Zhao, L. Sun, and R. Stolkin, “A fully end-to-end deep learning approach for real-time simultaneous 3D reconstruction and material recognition,” in *Proc. 18th Int. Conf. Adv. Robot. (ICAR)*, Hong Kong, Jul. 2017, pp. 75–82.
[35] R. Q. Charles, H. Su, M. Kaichun, and L. J. Guibas, “PointNet: Deep learning on point sets for 3D classification and segmentation,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Jul. 2017, pp. 77–85.
[36] H. Fan, H. Su, and L. Guibas, “A point set generation network for 3D object reconstruction from a single image,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Jul. 2017, pp. 2463–2471.
[37] K. He and J. Sun, “Convolutional neural networks at constrained time cost,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Jun. 2015, pp. 5353–5360.
[38] Blender. Version 4.0. [Online]. Available: https://www.blender.org/
[39] Wireless InSite. Version 3.4.4. [Online]. Available: https://www.remcom.com/wireless-insite-em-propagation-software
[40] Z. Yuan, J. Zhang, Y. Ji, G. F. Pedersen, and W. Fan, “Spatial non-stationary near-field channel modeling and validation for massive MIMO systems,” *IEEE Trans. Antennas Propag.*, vol. 71, no. 1, pp. 921–933, Jan. 2023.
[41] J. Li, B. Ai, R. He, M. Yang, Z. Zhong, and Y. Hao, “A cluster-based channel model for massive MIMO communications in indoor hotspot scenarios,” *IEEE Trans. Wireless Commun.*, vol. 18, no. 8, pp. 3856–3870, Aug. 2019.
[42] Trimesh. Version 3.2.0. [Online]. Available: https://trimesh.org/
[43] Q.-Y. Zhou, J. Park, and V. Koltun, “Open3D: A modern library for 3D data processing,” 2018, arXiv:1801.09847.

## 作者简介

**Zhen Zhang（Member, IEEE）** 2017 年获中国石油大学（华东）通信工程学士学位，2023 年获北京邮电大学信息与通信工程博士学位。2021 至 2022 年为香港中文大学（深圳）访问学者。现为内蒙古大学研究员。研究兴趣包括数字孪生通信、信道预测与深度学习。

**Jianhua Zhang（Fellow, IEEE）** 2003 年获北京邮电大学（BUPT）电路与系统博士学位。2016 至 2017 年任 ITU-R IMT-2020（5G）信道模型起草组（DG）主席，主持 IMT.2412 信道模型章节的起草。现为北京邮电大学教授、BUPT–中国移动联合研究院执行院长；任中国 IMT-2030（6G）技术组信道测量与建模子组主席、IEEE ComSoc 信道建模子组主席。已发表论文 200 余篇、授权专利 40 项。研究兴趣包括后 5G 与 6G、人工智能、数据挖掘，尤其是大规模 MIMO 与太赫兹信道建模、信道模拟器与空口（OTA）测试。为中国通信学会会士，曾任 3GPP “5G Channel Model for Bands up to 100 GHz”成员，并因对 ITU-R 4G 信道模型（ITU-R M.2135）、3GPP 中继信道模型（3GPP 36.814）与 3GPP 3D 信道模型（3GPP 36.873）的贡献多次获奖。

**Li Yu（Member, IEEE）** 2023 年获北京邮电大学（BUPT）信息与通信工程博士学位。现为北京邮电大学网络与交换技术全国重点实验室副研究员。研究兴趣包括信道建模与预测、人工智能、环境感知与重建、数字孪生以及无线信道基础模型。

**Silu Xing** 现为内蒙古大学通信工程专业硕士研究生。研究兴趣包括数字孪生通信、信道建模与深度学习。

**Kai Sun（Member, IEEE）** 1999 年与 2002 年分别获内蒙古大学（IMU）通信工程学士与信号与信息处理硕士学位，2009 年获北京邮电大学（BUPT）电路与系统博士学位。现为内蒙古大学教授。研究兴趣包括分布式与协作通信、无线网络规划与优化、无线资源分配与调度。

**原文插图：** 原 PDF 中的图 1–17 未重传至本页，仅保留中文图注与图中关键标注；全部原图可查阅 IEEE Xplore 正式版本。

---

**本页范围与校对状态：** 本页依据本地期刊正式版 PDF（IEEE TWC, vol. 25, 2026, pp. 17306–17321，16 页）作中文全译：摘要、关键词、正文第 I–V 节（II-A–C、III-A–F、IV-A–C）、结论、全部图注（图 1–17）、表 I–III（逐格转录）、公式 (1)–(32)、43 条参考文献英文原条目与 5 位作者简介；原文无附录。**再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。****逐句终校未做**：表 I（9 行×3 列）、表 II（3 层级×4 列）、表 III（8 行×3 列）均已用 PDF 页面渲染逐格核对；式 (1)–(8)、(11)–(22)、(23)–(32) 等关键式已对照页面文本层核对，其余公式按文本层录入。页内 1 条“原文疑点”加注：式 (8) 中 2D DFT 矩阵写作 $\mathbf W_{2D}=\mathbf W_v\otimes\mathbf W_h$，而对 $N_s$ 维信道向量的矩阵乘法要求矢量化顺序与 Kronecker 因子顺序严格匹配，原文未说明该约定。按原文照录并说明，未作数值或表述改动。

{% endraw %}
