---
layout: page
title: "高速铁路时延-多普勒域信道测量与建模｜中文全文译文"
permalink: /papers/translations/2026-10-21-delay-doppler-domain-channel-measurements-and-modeling-in-high-speed-r-2509-25854/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/44c51f88d1ab5473/) · [原文 arXiv](https://arxiv.org/abs/2509.25854) · [全部目录](/papers/catalog/)

# 高速铁路时延-多普勒域信道测量与建模

**原题：** Delay-Doppler Domain Channel Measurements and Modeling in High-Speed Railways  
**作者：** Hao Zhou（Graduate Student Member, IEEE）、Yiyan Ma（Member, IEEE，通讯作者）、Dan Fei（Member, IEEE）、Weirong Liu、Zhengyu Zhang、Mi Yang、Guoyu Ma、Yunlong Lu、Ruisi He（Senior Member, IEEE）、Guoyu Wang、Cheng Li、Zhaohui Song（Senior Member, IEEE）、Bo Ai（Fellow, IEEE）  
**单位：** 北京交通大学先进轨道交通自主运行全国重点实验室与电子信息工程学院（北京 100044，中国；通讯邮箱 mayiyan@bjtu.edu.cn）；Y. Ma 同时隶属东南大学移动通信国家重点实验室（南京）；D. Fei 同时隶属南京荣才交通技术研究所有限公司；Z. Song 为杭州电子科技大学（杭州 310018，中国）。  
**资助：** 国家自然科学基金（U25A20279、62341127、62221001、62501041）等（详见原文基金说明）。本文早期版本发表于 2025 IEEE/CIC ICCC Workshops。  
**版本：** arXiv:2509.25854v2（eess.SP），2026-06-09，原文 15 页（含表 I—VI、图 1—10）；期刊/会议版本信息待核（原文标注为投稿/预印本形式）。  
**范围与状态：** 全文中文译稿：摘要、索引词、第 I—VI 节、式（1）—（21）、算法 1、表 I—VI（逐格）、图 1—10 图注、参考文献 [1]—[58] 英文原条目均按原文结构录入；逐句逐式终校未做。

> **原文信息核对：** 骨架原写 "arXiv:2509.25854，2026-10-21 推荐"；本地 PDF 为 **arXiv:2509.25854v2 [eess.SP]，2026-06-09**，"2026-10-21" 应为站点推荐日期。本页版本信息按 PDF 更新，请 Lead 核验元数据。

## 摘要

随着下一代无线通信系统需要在高频段与高移动性场景下工作，**时延—多普勒（DD）域多载波（DDMC）**调制方案（如正交时频空间 OTFS）相比正交频分复用（OFDM）展现出更优的可靠性。精确的 DD 域信道建模对 DDMC 系统设计至关重要。然而，传统信道建模方法主要局限于时域、频域与空域，DD 域信道建模原理研究仍很不足。为此，本文在**高速铁路（HSR）**场景提出一套系统的 DD 域信道测量与建模方法。第一，基于铁路长期演进（LTE-R）系统设计一种 DD 域信道测量方法。第二，针对 DD 域信道建模，研究**准平稳区间**、多径分量的统计功率建模，特别是 DD 域信道衰落系数的**准不变区间**。第三，通过 371 km/h 的 LTE-R 测量，以准平稳区间为判决准则，建立 HSR 场景下不同信道时变条件下的 DD 域信道模型。第四，通过 OTFS 传输的误码率（BER）比较验证所提 DD 域信道模型的准确性。此外，仿真验证在 HSR 场景中 DD 域信道衰落系数的准不变区间为**毫秒（ms）量级**，远小于 100 ms 量级的准平稳区间长度。本研究可为高移动性环境下的 DD 域建模提供理论指导，支撑 6G 及未来 DDMC 与通感一体化设计。

**索引词**：高速铁路；时延—多普勒域信道建模；正交时频空间。

## I. 引言

在第六代通信系统（6G）中，高移动性通信场景的规模预计将大幅增长 [1]–[3]，如高速铁路（HSR）通信 [4]、车联网（V2X）[5]–[7]、低空无线网络 [8] 与低轨（LEO）卫星通信 [9]，这对系统传输可靠性提出更高要求。在 4G 与 5G 通信系统中，正交频分复用（OFDM）波形被广泛采用 [10], [11]；但在 6G 所要求、最高速度可达 1000 km/h 的高速场景中 [12]–[14]，其性能会显著退化——高速移动造成显著多普勒扩展，破坏子载波正交性并产生载波间干扰（ICI）[15]。

为应对该挑战，**时延—多普勒（DD）域多载波调制（DDMC）**方案被提出，如正交时频空间（OTFS）调制 [16]。作为基于 DD 域复用的创新技术，DDMC 方案能依据 DD 域信道特性获得全时频域分集增益，从而在高速移动场景中取得优于 OFDM 的传输可靠性 [17]–[20]。因此准确理解 DD 域信道特性对 DDMC 系统设计至关重要。与双选择时频（TF）域信道不同，DD 域信道呈现**准平稳性、稀疏性、可分性与紧致性** [21]–[23]：信道平稳区间内多径衰落系数几乎不变；真实多径数远小于系统可分辨多径数；不同散射体产生的多径可在 DD 域区分；多径的最大时延与最大多普勒之积远小于 1。

针对 DD 域信道测量，[6]、[24]、[25] 已在 V2X 与列车通信场景开展研究。[6] 详述了面向 V2X 的自研毫米波信道探测器，采用全导频 OFDM 与二维傅里叶变换进行 DD 域信道测量，证实了信道的高稀疏性；[24] 提出基于 OFDM 的 DD 域信道参数提取方法，揭示多径分布与散射环境的映射关系；[25] 获得不同场景（含丘陵地区与车站）下列车 DD 域信道实测数据。可以看到，当前主流方法通常依赖**专用全导频 OFDM 波形的主动探测**来获取完整信道响应；但此类主动方法部署成本高，难以在运营中的 HSR 基站上实现；此外这些全带宽 OFDM 探测系统中 ICI 对 DD 域信道特性的影响也不可忽略。

针对 DD 域信道建模，[26] 为城市交叉口建立 60 GHz V2X 车辆信道模型，基于 TF 域测量与正交基函数通过局部散射函数评估 DD 域幅度分布；[27] 对那不勒斯—罗马铁路（列车速度 40 km/h）做时延域建模，在长观测周期上验证 DD 域多径散射以分析传播稳定性；[28] 研究水声 DD 域测量，提出基于生成对抗网络的建模方法，并通过比较相干时间与相干带宽与实测结果验证可行性；[29] 利用实测数据分析 HSR 场景 DD 域信道特性并评估 OTFS 性能。综上，当前 DD 域建模研究聚焦 DD 域幅度分布、环境演化与长周期多径生灭之间的映射，而对准平稳区间内 DD 域多径衰落系数、时延与多普勒的统计建模关注不足。

针对 HSR 信道建模，当前研究主要在时域开展，即对时变信道冲激响应（CIR）建模与分析 [30]–[34]。[35] 建立基于射线追踪的仿真模型以研究 HSR 场景电波传播行为；[36] 为农村宏蜂窝场景宽带 MIMO 高速列车信道提出非平稳几何随机模型，并给出修正等面积法仿真模型；[37] 基于实测数据仿真分析高架桥场景信道；[38]、[39] 对信道测量结果的多径分量（MPC）做聚类与跟踪，并分别对簇间与簇内参数做统计建模。尽管这些研究在刻画 HSR 信道传播、相关性与衰落系数方面取得进展，现有 HSR 信道研究对 DD 域信道特性关注有限，该领域存在明显研究空白。

基于上述分析可以发现：HSR 场景中 DD 域信道参数在准平稳区间内的统计分布鲜受关注，且缺乏系统的 DD 域信道测量与建模理论，这制约了 DDMC 的前沿研究与实现。为填补该空白，本文提出面向 HSR 场景的系统性 DD 域信道测量与建模方法，主要创新包括：

- **提出基于 LTE-R 框架的 DD 域信道测量方法**：不同于需要专用波形的主动探测方法，我们利用现有 LTE-R 标准中的离散 TF 域导频（小区特定参考信号 CRS）。其中，为规避传统 TF 域插值带来的误差，先对 DD 域信道参数做**粗估计**，随后提出时延、多普勒频移与衰落系数的**精确估计**方法，从而使商用 OFDM 系统能够开展 DD 域信道测量。
- **提出准平稳 DD 域信道建模方法**：先设计 DD 域信道准平稳性评估方法，再在准平稳区间内研究 DD 域信道参数的统计建模，最后对信道衰落系数的**准不变区间**建模，以指导 DDMC 方案设计。
- **建立不同时变条件下的 DD 域信道模型**：基于所提测量与建模方法，以准平稳区间为判决准则，在 HSR 高架桥场景建立不同信道时变条件下的 DD 域信道模型。模型给出 DD 域信道的准平稳区间、多径时延、多普勒频移、幅度功率分布，以及各径的最小准不变区间。
- **多维验证框架验证模型保真度**：具体地，验证物理色散参数（均方根 RMS 时延与多普勒扩展）的一致性，并证明模型在高阶调制下的鲁棒性，确保物理与统计精度，表明所建 DD 域信道模型准确捕获真实信道特性；此外验证当满足多径最小准不变区间时 DD 域信道可视为不变，该区间在 HSR 高架桥场景为 ms 量级。

本文组织如下：第 II 节介绍 LTE-R 信道测量方法及基于离散 TF 域导频的信道参数获取方法；第 III 节给出准平稳 DD 域信道建模方法；第 IV 节描述 HSR 高架桥场景不同平稳区间下的 DD 域信道模型；第 V 节验证模型；最后第 VI 节总结并展望。

## II. 基于 LTE-R 的 DD 域信道测量

LTE-R 是为铁路通信设计的 LTE 技术专用变体 [4]。本节先介绍 LTE-R 测量设置，再给出基于离散 TF 域导频的 DD 域信道粗估计方法，最后提出 DD 域信道参数的精确估计方法。

### A. 测量设置

我们在中国京沈高铁沿线的农村地区高架桥开展 HSR 信道测量，测量场景如图 1 所示：起点到终点距离约 1450 m，沿线周边多为农田与低层建筑，测量起止点以蓝色标出。

为接收 LTE-R 信号，我们按 LTE-R 标准改装一台通用软件无线电外设（USRP）作为信道探测器。该 USRP 配备 2 根接收天线与 GPS 时钟；测量期间信道探测器持续接收 LTE-R 基站沿轨道发送的物理下行控制信道（PDCCH）信号。测量系统参数设置见表 I，与 [29] 相同。

**表 I　测量系统参数设置**（按原表逐格转录）

| 参数 | 取值 |
| --- | --- |
| 传输模式 | LTE FDD |
| 子载波间隔 | 15 kHz |
| 发射功率 | 43 dBm |
| 发射天线增益 | 12 dBi |
| 接收天线增益 | 4 dBi |
| 采样率 | 7.68 MHz |
| HSR 车速 | 371 km/h |
| 天线高度 | 4.05 m |
| 基站高度 | 约 40 m |

### B. TF 域信道衰落获取

通过 LTE-R 信道测量，收集接收信号的 I/Q 分量与相应地理信息（时间戳、位置信息与车速）；随后需提取离散导频对应的 TF 域信道衰落。原始数据的具体预处理步骤如下。

**1）小区 ID 检测与帧偏移校正**：设 $r(t)$ 为接收连续时域信号，$r[n]$ 为其采样版本。小区搜索过程可写为

$$
\left(\hat N_{\mathrm{ID}},\Delta_{\mathrm{frame}}\right)=\arg\max_{\left(N_{\mathrm{ID}},\Delta_{\mathrm{frame}}\right)}\left|\sum_{k}r\left[k+\Delta_{\mathrm{frame}}\right]s_{N_{\mathrm{ID}}}^*[k]\right|^2,\tag{1}
$$

其中 $\hat N_{\mathrm{ID}}$ 为检测到的小区 ID，$\Delta_{\mathrm{frame}}$ 为帧偏移，$s_{N_{\mathrm{ID}}}[k]$ 为对应小区 ID $N_{\mathrm{ID}}$ 的同步信号序列，$*$ 表示共轭。随后根据估计的帧偏移 $(\Delta_{\mathrm{frame}})$ 校正帧起始位置：

$$
\hat r[n]=r\left[n+\Delta_{\mathrm{frame}}\right].\tag{2}
$$

**2）资源网格获取**：然后按 LTE-R 标准与小区 ID 去除同步信号；随后把时域信号变换到频域，得到各子载波上的接收符号，形成资源网格。该过程包括去除循环前缀（CP）与执行快速傅里叶变换（FFT）。对第 $n$ 个 OFDM 符号，记去除 CP 后的时域表示为 $r_n[q]$，则第 $n$ 个符号第 $m$ 个子载波的频域资源元素（RE）$Y_n[m]$ 可由 FFT 得到：

$$
Y_n[m]=\frac{1}{\sqrt{N_{\mathrm{FFT}}}}\sum_{q=0}^{N_{\mathrm{FFT}}-1}r_n[q]e^{-j2\pi\frac{mq}{N_{\mathrm{FFT}}}},\tag{3}
$$

其中 $N_{\mathrm{FFT}}$ 为 FFT 点数，$n\in\{0,1,\ldots,N-1\}$、$m\in\{0,1,\ldots,M-1\}$，$N$ 与 $M$ 分别为 OFDM 符号数与子载波数。

随后估计 CRS 对应的 TF 域信道衰落。设资源网格在频域有 $M$ 个子载波、时域有 $N$ 个 OFDM 符号；$Y[m,n]$ 为第 $m$ 个子载波第 $n$ 个 OFDM 符号上的接收信号，$X_p[m,n]$ 为相应发射导频符号。按 [40]、[41]，$Y[m,n]$ 与 $X_p[m,n]$ 的关系为

$$
Y[m,n]=H[m,n]X_p[m,n]+I[m,n]+w[m,n],\tag{4}
$$

其中 $H(m,n)$ 表示 $X_p[m,n]$ 在 $Y[m,n]$ 中的信道衰落，$I[m,n]$ 表示 $Y[m,n]$ 所受 ICI，$w[m,n]$ 为噪声。频域上 ICI 项 $I[m,n]$ 来自多个子载波泄漏分量的叠加；由中心极限定理（CLT），该聚合干扰可近似为复高斯随机变量 [42]，因此 ICI 的表现类似加性噪声。把 ICI 视为总噪声的一部分并使用最小二乘（LS）准则，可得导频位置处 TF 域信道衰落的初始估计：

$$
\hat H_{\mathrm{LS}}[m,n]=\frac{Y[m,n]}{X_p[m,n]}=H[m,n]+\frac{I[m,n]+w[m,n]}{X_p[m,n]}.\tag{5}
$$

得到初始估计后，必须把导频信息与帧的其余部分隔离。LTE 下行帧结构中资源网格是复杂的：除用于信道估计的 CRS 外，网格中还填充物理下行控制信道（PDCCH）、物理下行共享信道（PDSCH）与同步信号（PSS/SSS）。对非导频位置（即 $[m,n]\notin\mathcal P$）的接收信号 $Y[m,n]$，其值是数据或控制信息叠加噪声，而非零；直接使用这些值会给 DD 信道估计带来显著干扰。为此我们执行**算法掩膜（补零）**：保留 CRS 位置的 LS 信道估计，并把其余所有资源元素人为置零。该过程滤除 PDSCH 与 PDCCH 干扰，得到 TF 信道矩阵 $\hat H_{\mathrm{LS}}[m,n]$：

$$
\hat H_{\mathrm{LS}}[m,n]=\begin{cases}\dfrac{Y[m,n]}{X_p[m,n]},&[m,n]\in\mathcal P,\\0,&[m,n]\notin\mathcal P,\end{cases}\tag{6}
$$

其中 $\mathcal P$ 表示时频资源网格中所有导频符号位置集合。所得 $\hat H_{\mathrm{LS}}[m,n]$ 将用于后续 DD 域信道估计。

### C. DD 域信道粗估计

首先，DD 域信道可建模为 [40], [41]：

$$
h(\tau,\nu)=\sum_{i=1}^{P}h_i\delta\left(\tau-\tau_i\right)\delta\left(\nu-\nu_i\right),\tag{7}
$$

其中 $\tau\in[0,\tau_{\max}]$、$\nu\in[-\nu_{\max},\nu_{\max}]$，$\tau_i$、$\nu_i$、$h_i$ 分别为第 $i$ 条多径的时延、多普勒与衰落系数，$P$ 为多径数，$\tau_{\max}$ 与 $\nu_{\max}$ 为最大时延与最大多普勒。归一化时延 $l_i$ 与多普勒 $k_i$ 可写为 [40], [41]：

$$
l_i=M\Delta f\tau_i,\qquad k_i=NT\nu_i.\tag{8}
$$

从 LTE-R 信号中提取信道参数的一个关键挑战是高速列车运动引起的 ICI。但在 DD 域提取语境中，ICI 的影响可被有效管理：由于从 TF 域到 DD 域的变换是酉操作，高斯噪声的统计特性得以保持。因此在 TF 域被建模为高斯噪声的 ICI 项在 DD 域仍服从高斯分布：$I_{\mathrm{DD}}[k,l]\sim\mathcal{CN}(0,\sigma_{I_{\mathrm{CI}}}^2)$。与信道响应能量在 DD 域集中于稀疏多径峰不同，ICI 能量散布在整个时延—多普勒平面，从而使有效噪声底升高为 $\sigma_{\mathrm{eff}}^2=\sigma_w^2+\sigma_{I_{\mathrm{CI}}}^2$。如第 II-D 节将介绍的，我们采用基于阈值的机制：有效多径须超出有效噪声底 6 dB，确保 ICI 作为背景噪声而不遮蔽主要信道特征的提取。基于（4）（6）以及（4）中 $H[m,n]$ 可写成 $\sum_{i=1}^{P}h_ie^{-j2\pi\frac{m\tau_i}{M\Delta f}}e^{j2\pi\frac{n\nu_i}{N T}}$ 的事实，对（6）沿时域做 FFT、沿频域做 IFFT，即得 DD 域信道的粗估计 [40], [41]：

$$
\hat h_{\mathrm{DD}}[k,l]=\mathcal F_{\mathrm{FFT},N}\left\{\mathcal F_{\mathrm{IFFT},M}\left\{\hat H_{\mathrm{LS}}[m,n]\right\}\right\},\tag{9}
$$

其中 $k\in\{0,1,\ldots,N-1\}$、$l\in\{0,1,\ldots,M-1\}$。此外记 CRS 的导频间隔在时域为 $d_t$、频域为 $d_f$，满足 $\mathrm{mod}(M,d_f)=0$ 与 $\mathrm{mod}(N,d_t)=0$。注意 $\hat h_{\mathrm{DD}}[k,l]$ 在时延与多普勒域上为二维周期函数，故记为 $\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l]$ [40], [41]。由于导频在 DD 域上以间隔采样，$\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l]$ 是物理 DD 域信道（7）的采样版本，其中时延采样分量与多普勒采样分量分别由 $C_{\mathrm{Delay}}^{\mathrm{Period}}(l_i,l)$ 与 $C_{\mathrm{Doppler}}^{\mathrm{Period}}(k_i,k)$ 描述。然而 DD 域信道建模需要物理 DD 域信道的精确参数。

### D. DD 域信道精确估计

粗估计依赖直接的辛有限傅里叶变换把 TF 域估计转换到 DD 域，该直接变换本质上受导频图样决定的网格分辨率限制。在 HSR 等高移动性场景中，物理多径分量是连续的且常位于**网格之外**，导致双差分网格上出现严重能量泄漏与混叠，这些问题无法由简单逆变换解决。为此本节提出**精确 DD 域信道估计**，包括基于（9）中 $l_i$、$k_i$、$h_i$ 的多径时延、多普勒频移与路径功率估计。该方法有效使估计精度与导频网格分辨率解耦，实现直接变换方法无法达到的超分辨性能。

首先需从（9）的 $\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l]$ 中提取有效 MPC。具体地，以能量阈值识别有效 MPC，阈值 $T_h$ 按经典信道建模文献 [43] 设为高于噪声底 6 dB；若某 MPC 的功率满足 $\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l]\right|^2>T_h$ 且 $\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l]\right|^2$ 为峰值，则认为该 MPC 有效。记有效 MPC 数为 $\hat P$，其有效 MPC 的时延与多普勒索引汇集为 $\{k_i,l_i\}$（$i$ 为多径编号）；此处假设有效 MPC 的时延或多普勒互不相同。随后按 [40]、[41]、[44] 采用算法 1 联合估计物理 DD 域信道的**非网格时延** $\hat l_i$、多普勒频移 $\hat k_i$ 及相应衰落系数 $\hat h_i$。

**算法 1**　物理 DD 域信道估计

**输入**：$\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l]$、多径数 $\hat P$。
**输出**：$i\in\{1,\ldots,\hat P\}$ 的信道参数 $\hat l_i,\hat k_i,\hat h_i$ 与估计的 DD 域信道 $\hat h_{\mathrm{DD}}^{\mathrm{Est}}$。
1: 初始化 $\hat h_{\mathrm{DD}}^{\mathrm{Est}}[k,l]=0$（$k\in\{0,1,\ldots,N-1\}$、$l\in\{0,1,\ldots,M-1\}$）；
2: **for** $i=1$ 到 $\hat P$ **do**
3: 　$[k_0,l_0]=\{k_i,l_i\}$；
4: 　$l_1=\arg\max_{l\in\{l_0-1,l_0+1\}}\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k_0,l]\right|$；
5: 　$k_1=\arg\max_{k\in\{k_0-1,k_0+1\}}\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l_0]\right|$；
6: 　$\hat l_i=l_0+\dfrac{\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k_0,l_1]\right|}{\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k_0,l_1]\right|+\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k_0,l_0]\right|}\cdot\mathrm{sgn}\left(l_1-l_0\right)$；
7: 　$\hat k_i=k_0+\dfrac{\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k_1,l_0]\right|}{\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k_1,l_0]\right|+\left|\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k_0,l_0]\right|}\cdot\mathrm{sgn}\left(k_1-k_0\right)$；
8: 　基于 $\hat k_i$、$\hat l_i$ 与（9）估计衰落系数 $\hat h_i$；
9: 　基于 $\hat k_i$、$\hat l_i$、$\hat h_i$ 计算第 $i$ 条路径的重建 $\hat h_{\mathrm{DD}}^{\mathrm{Rebuild}}[k',l']$；
10: 　从 $\hat h_{\mathrm{DD}}^{\mathrm{Est}}[k,l]$ 中减去 $\hat h_{\mathrm{DD}}^{\mathrm{Rebuild}}[k',l']$ 以消除多径干扰：$\hat h_{\mathrm{DD}}^{\mathrm{Est}}[k,l]=\hat h_{\mathrm{DD}}^{\mathrm{Est}}[k,l]+\hat h_{\mathrm{DD}}^{\mathrm{Rebuild}}[k',l']$；
11: **end for**
12: 保存 $\hat P$ 条多径的 $\{\hat h_i,\hat k_i,\hat l_i\}$ 与 $\hat h_{\mathrm{DD}}^{\mathrm{Est}}$。

如算法 1 所示，输入除（9）中的 $\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l]$ 外，还包括多径数估计 $\hat P$。步骤 3—7 估计物理多普勒与时延索引 $\hat k_i$ 与 $\hat l_i$：先在 $l\in\{l_0-1,l_0+1\}$ 上检测 $\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k_0,l]$ 的次大值并记相应时延索引为 $l_1$（步骤 4）；然后依据 $N$ 较大时函数 $\sin(x)/\sin(x/N)$ 的最大值与次大值关系 [40], [41], [44]，在步骤 6 估计物理时延 $\hat l_i$；物理多普勒 $\hat k_i$ 同理在步骤 5 与 7 估计。随后步骤 8 基于 $\hat k_i$、$\hat l_i$ 与（9）估计衰落系数 $\hat h_i$；步骤 9 基于 $\hat k_i$、$\hat l_i$、$\hat h_i$ 计算第 $i$ 条路径的重建 $\hat h_{\mathrm{DD}}^{\mathrm{Rebuild}}[k',l']$；步骤 10 从 $\hat h_{\mathrm{DD}}^{\mathrm{Est}}[k,l]$ 中减去新建的重建项以消除多径干扰；最终得到 $\hat P$ 条多径的 $\{\hat h_i,\hat k_i,\hat l_i\}$。

综上，基于上述方法，DD 域信道测量的完整流程可总结为：首先从 HSR 实测数据获取 TF 域信道衰落 $\hat H_{\mathrm{LS}}[m,n]$；然后用 DD 域信道粗估计方法得到 $\hat h_{\mathrm{DD}}[k,l]$ 与 $\hat h_{\mathrm{DD}}^{\mathrm{Period}}[k,l]$；最后用精确估计方法得到 DD 域信道时延 $\hat l_i$、多普勒 $\hat k_i$ 与衰落系数 $\hat h_i$。

## III. 基于 LTE-R 的 DD 域信道建模

本节聚焦 DD 域信道建模方法，重点包括准平稳区间评估、多径幅度分布建模与准不变区间评估。

### A. 准平稳区间评估

按 [45]、[46]，对广义平稳非相关散射（WSSUS）信道，时延域信道相关性可写为

$$
\mathbb E\left\{h(t,\tau)h^*(t',\tau')\right\}=r_h\left(t-t';\tau\right)\delta\left(\tau-\tau'\right),\tag{10}
$$

其中 $r_h(\Delta t;\tau)$ 为时间差 $\Delta t=t-t'$ 与 $\tau$ 的相关函数。在 DD 域，定义**散射函数** $S(\tau,\nu)$ 为 $r_h(\Delta t;\tau)$ 对 $\Delta t$ 的傅里叶变换：

$$
S(\tau,\nu)=\int r_h(\Delta t;\tau)e^{-j2\pi\nu\Delta t}\mathrm d(\Delta t),\tag{11}
$$

其中 $S(\tau,\nu)$ 表示时延 $\tau$ 与多普勒 $\nu$ 处的功率密度，描述该 $(\tau,\nu)$ 处散射信号功率。因此 WSSUS 信道的 DD 域相关性为

$$
\mathbb E\left\{h(\tau,\nu)h^*(\tau',\nu')\right\}=S(\tau,\nu)\delta\left(\tau-\tau'\right)\delta\left(\nu-\nu'\right).\tag{12}
$$

这表明在平稳区间内，DD 域多径的时延与多普勒频移不显著变化，且不发生多径生灭；因此可认为一个平稳区间内多径的统计性能保持不变。基于（12），用**谱距离**度量量化信道平稳性，称为**共线性（collinearity）**[47]：共线性为有界指标 $\gamma\in[0,1]$，比较不同时刻的 DD 域；接近 1 表示功率谱非常相似，接近 0 表示两个频谱密度非常不同。时间共线性 CDD 定义为

$$
\mathrm{CDD}\left(t_i,t_j\right)=\frac{\left|\sum_{p}\sum_{q}P\left(t_i,\tau_p,\nu_q\right)P\left(t_j,\tau_p,\nu_q\right)\right|}{\sqrt{\sum_{p}\sum_{q}P\left(t_i,\tau_p,\nu_q\right)^2}\sqrt{\sum_{p}\sum_{q}P\left(t_j,\tau_p,\nu_q\right)^2}},\tag{13}
$$

其中 $P(t_i,\tau_p,\nu_q)$ 表示时刻 $t_i$、时延 $\tau_p$、多普勒 $\nu_q$ 处 $h(\tau,\nu)$ 的功率，$\tau_p=\frac{p}{M\Delta f}$、$\nu_q=\frac{q}{NT}$。通过构造 CDD 矩阵，可经阈值判定识别 DD 域准平稳区间 $T_{\mathrm{QS}}$。

为量化信道平稳性，使用（13）的 CDD 度量。评估流程主要包括相似度阈值的选择与平稳时长的统计分析。首先，相似度阈值 $\alpha$ 对平稳区域的定义至关重要；沿用近期信道测量文献 [48]、[49] 的做法，选取范围 $\alpha\in[0.7,0.9]$。为确保测量结果有效与所导信道模型的高保真性，最终参数提取与建模优先采用较高阈值 $\alpha=0.9$。如 [48] 所建议，保守阈值对高保真建模必不可少，可严格满足广义平稳（WSS）假设并尽量减少瞬态非平稳状态的混入；而较低阈值（如 $\alpha=0.7$）虽常被用作高动态车辆环境中 WSS 的最低有效性下界 [47]，但依赖它可能因纳入弱平稳段而引入统计估计误差。因此采用 0.9 作为主要判决准则以保证模型精度，同时用低至 0.7 的范围验证鲁棒性。

基于计算的 CDD 值与所选阈值，沿相关矩阵对角线识别平稳区域。令 $\mathcal T_k=\{t_{k,\mathrm{start}},\ldots,t_{k,\mathrm{end}}\}$ 表示第 $k$ 个连续时间段，其中任意两时刻的 CDD 满足 $\mathrm{CDD}(t_i,t_j)\ge\alpha$。第 $k$ 个平稳块的时长为 $T_k=t_{k,\mathrm{end}}-t_{k,\mathrm{start}}$。由于 HSR 信道动态变化，平稳时长在测量轨迹上有所变化；为得到代表性模型参数，对所有识别出的有效时长做统计分析，本文报告的准平稳区间 $T_{\mathrm{QS}}$ 定义为这些时长的统计平均，即 $T_{\mathrm{QS}}=\mathbb E[T_k]$，表示信道统计保持不变的平均时间尺度。

### B. 幅度分布拟合

在平稳区间内，DD 域 MPC 呈现稳定的统计特性（由 WSSUS 性质隐含）。为捕获这些特性，沿多普勒维采用尺寸为 $M\times N$、步长为 $d_t$ 的滑动窗；滑动点数 $a=\left\lfloor(T_{\max}-T_{\min})/d_t\right\rfloor$，其中 $T_{\max}$、$T_{\min}$ 为平稳区间内尺寸 $N\times M$ 的 RE 的最大与最小索引值。基于算法 1，平稳区间内多径的物理时延与多普勒估计按加权系数计算：

$$
\hat l_i^{\mathrm{weighted}}=\frac{\sum_{j=1}^{a}\hat l_i^{(j)}\left|\hat h_i^{(j)}\right|}{\sum_{j=1}^{a}\left|\hat h_i^{(j)}\right|},\tag{14}
$$

$$
\hat k_i^{\mathrm{weighted}}=\frac{\sum_{j=1}^{a}\hat k_i^{(j)}\left|\hat h_i^{(j)}\right|}{\sum_{j=1}^{a}\left|\hat h_i^{(j)}\right|}.\tag{15}
$$

该过程精化 DD 域内每个 MPC 的时延与多普勒估计，更精确地表示其中心趋势。

平均时延与多普勒参数可有效刻画 MPC 的时间稳定性，但功率特性仍需进一步统计分析。鉴于平稳区间内 MPC 具有相同统计性能，我们聚焦对平稳区间内单个数据包中所有 MPC 的幅度值做概率分布拟合。据文献选择经典概率分布拟合幅度分布 [44]，即 Rician、Rayleigh、Nakagami 与 Weibull 分布，如表 II 所示。

**表 II　概率分布模型**（按原表逐格转录）

| 分布 | 概率密度函数 |
| --- | --- |
| Rician | $f(x\mid s,\sigma)=I_0\left(\frac{xs}{\sigma^2}\right)\frac{x}{\sigma^2}e^{-\frac{x^2+s^2}{2\sigma^2}}$ |
| Rayleigh | $f(x\mid b)=\frac{x}{b^2}e^{-\frac{x^2}{2b^2}}$ |
| Nakagami | $f(x\mid\mu,\omega)=2\left(\frac{\mu}{\omega}\right)^{\mu}\frac{1}{\Gamma(\mu)}x^{(2\mu-1)}e^{-\frac{\mu}{\omega}x^2}$ |
| Weibull | $f(x\mid a,b)=\frac{b}{a}\left(\frac{x}{a}\right)^{b-1}e^{-\left(\frac{x}{a}\right)^b}$ |

为定量评估所选候选分布对观测功率数据的拟合程度，采用 Kolmogorov–Smirnov（KS）检验。KS 检验通过比较样本数据的经验累积分布函数（ECDF）$F_n(x)$ 与理论分布的累积分布函数（CDF）$F(x)$ 之间的最大绝对差 $D_n=\sup_x|F_n(x)-F(x)|$ 做出判断。

### C. 准不变区间评估

平稳区间的核心在于信道统计特性是否发生显著变化，而非 DD 域信道衰落系数 $h_i$ 的波动。即便 DD 域信道衰落系数 $h_i$ 存在轻微随机波动，只要统计特性保持稳定，该区间仍可判定为平稳区间；然而对 DDMC 数据包而言，$h_i$ 的变化并不期望出现，$h_i$ 的过度波动可能降低传输性能。

为此，我们基于已识别的统计平稳区间进一步定义更严格的**准不变区间**：它不仅要求信道保持稳定统计特性，还对 DD 域信道衰落系数施加约束，确保其在时间上无显著变化。具体地，用 **DD 域时间相关系数（DD-TCC）**衡量瞬时 DD 域衰落系数的相似性。按 [48]，我们把时间功率相关系数（TPCC）从时延域推广到 DD 域，定义 DD-TCC，用于衡量每个 MPC 两个 DD 域衰落系数矩阵的线性相似性：

$$
\mathrm{DD\text{-}TCC}(i,t_b,t_c)=\frac{\left|h_i(t_b)\cdot h_i^*(t_c)\right|}{\max\left(\left|h_i(t_b)\right|^2,\left|h_i(t_c)\right|^2\right)},\tag{16}
$$

其中 $i\in\{1,\ldots,\hat P\}$，$h_i(t_b)$ 与 $h_i(t_c)$ 分别为第 $i$ 条多径在第 $b$ 与第 $c$ 个时刻的 DD 域信道衰落系数。通过构造 DD-TCC 矩阵，可经阈值判定识别 DD 域准不变区间 $T_{\mathrm{QI}}$；具体步骤与 III-A 节准平稳区间建模类似：先预设相似度阈值 $\alpha$，再用 DD-TCC 对 DD 域衰落系数分类，最后把连续均匀满足阈值条件的时刻合并为完整准不变区间 $T_{\mathrm{QI}}$。

## IV. HSR 场景 DD 域信道建模

基于上述 DD 域信道测量与建模方法，本节聚焦依据不同平稳区间特征建立 HSR 的 DD 域信道模型，为 HSR 场景中 DDMC 通信系统设计提供理论基础。

本节所用信道数据来自京沈高铁现场测量，覆盖 HSR 高架桥场景——即高出地面 10—20 m 的高架铁路段，周边为农田或低层建筑，如第 II 节所述。基于实测数据，本文把高架桥信道的时变特性划分为三个强度等级，对应不同平稳区间。

1. **弱时变场景**：信道主要由稳定的视距（LoS）路径与少量固定反射路径组成；多普勒谱的分布特性在长时间内无显著偏移，谱峰位置与功率衰减规律保持一致；多径分量生存期长，路径数与幅度分布波动极小。该场景的准平稳区间相对较长。
2. **中等时变场景**：多普勒谱的整体形状在中等时间尺度内保持稳定，但部分弱多径分量存在动态波动，谱峰功率随时间缓慢衰减；多径结构以稳定主径为主，少量次要路径随机生灭。
3. **强时变场景**：多普勒功率谱形状在短时间内显著变化，谱峰的出现与消失是随机的；多径分量生存期短、功率衰减快，新路径不断产生、旧路径快速消失。该场景的准平稳区间较短。

强、中等与弱时变场景的相对位置关系如图 2 所示，与 [30] 中的 HSR 信道特性相似。基于上述三种时变强度场景的分类，本节将开展针对性的 DD 域信道建模：对弱、中等与强时变场景分别采用不同时间窗提取信道特征，最终形成覆盖整个高架桥场景时变特性的 DD 域信道模型。

### A. 弱时变场景

以弱时变场景为例，本节概述本文所用的 DD 域信道建模方法与流程。基于高速铁路高架桥场景数据采集，首先按 II-B 节与 II-C 节提取信道参数；其次按 III-A 节分析准平稳区间，计算结果如图 3 所示。由图 3，当阈值大于 0.9 时信道平稳区间约为 $T_{\mathrm{QS}}=392$ ms，这意味着在该时间长度内，多径的时延、多普勒与功率等主要统计特性可视为常数。

第三，按 II-D 节对多径时延、多普勒与幅度行为建模，如图 4 与表 V 所示。从提取的多径信息看，该测试场景中观测到三条显著多径分量。第一条路径（红色箭头标出）具有近零时延索引与最高归一化幅度，判定为 LoS 信号；主径多普勒频移为 150.54 Hz，此时列车远离基站，LoS 路径的多普勒频移与理论最大多普勒频移大致相同。对第二条多径，时延与功率变化表明信号衰减的传输路径稍长，可能是信号经 HSR 高架结构反射后到达接收端的路径。对第三条多径，考虑测量几何：基站天线安装在约 40 m 高度，列车在高架桥上运行、高度 10—20 m，接收天线安装在车顶以上 4.05 m [50]；由于高度差显著，信号可传播到高架桥下方的地面。因此该具有更大时延与显著功率衰减的多径分量归因于高架桥下方地面地形（如农田或地表杂波）的散射，其传播路径比 LoS 分量更长。

第四，按 III-B 节在平稳区间内做幅度分布拟合，拟合结果如图 5 与表 III 所示，其中 DD 域多径功率之和被归一化。由上述结果可观察到：对第一条多径分量，四种分布中 Rician 分布拟合最佳，拟合参数 $s=0.032$、$\sigma=0.004$，由此可得 K 因子 31.48 dB；对第二条多径分量，最合适的是 Rayleigh 分布，拟合参数 $b=0.0045$；第三条多径分量服从 Weibull 分布，拟合参数 $a=0.0054$、$b=1.1877$。

**表 III　弱时变场景不同概率分布的 KS 检验拟合结果**（按原表逐格转录）

| 路径 | 分布 | 拟合参数 | K-S 统计量 |
| --- | --- | --- | --- |
| 1 | Rician | $s=0.032,\ \sigma=0.004$ | 0.0861 |
| 1 | Rayleigh | $b=0.023$ | 0.4518 |
| 1 | Nakagami | $\mu=16.703,\ \omega=0.001$ | 0.1633 |
| 1 | Weibull | $a=0.034,\ b=7.383$ | 0.2110 |
| 2 | Rician | $s=0.0003,\ \sigma=0.0034$ | 0.1442 |
| 2 | Rayleigh | $b=0.0045$ | 0.0934 |
| 2 | Nakagami | $\mu=1.4462,\ \omega=0$ | 0.1432 |
| 2 | Weibull | $a=0.0065,\ b=2.033$ | 0.1376 |
| 3 | Rician | $s=0.0001,\ \sigma=0.0061$ | 0.4623 |
| 3 | Rayleigh | $b=0.0061$ | 0.4082 |
| 3 | Nakagami | $\mu=0.4052,\ \omega=0.0001$ | 0.2575 |
| 3 | Weibull | $a=0.0054,\ b=1.1877$ | 0.1015 |

最后，按 III-C 节分析准不变区间。以第一条路径为例，其在平稳区间内的准不变区间如图 6 所示。为深入考察不同阈值条件对准不变区间的影响，提取并计算不同阈值下准不变区间的最大值、最小值与平均值，结果列于表 IV。

**表 IV　弱时变场景不同阈值下的准不变区间分析**（按原表逐格转录）

| 阈值 $\alpha$ | $T_{\mathrm{QI}}^{\max}$（ms） | $T_{\mathrm{QI}}^{\min}$（ms） | $T_{\mathrm{QI}}^{\mathrm{mean}}$（ms） |
| --- | --- | --- | --- |
| 0.9 | 314.07 | 9.33 | 191.88 |
| 0.8 | 357.47 | 14.47 | 294.93 |
| 0.7 | 388.73 | 39.67 | 363.65 |

表 IV 揭示了三个阈值下准不变区间 $T_{\mathrm{QI}}^{\max}$、$T_{\mathrm{QI}}^{\min}$、$T_{\mathrm{QI}}^{\mathrm{mean}}$ 的明显规律。随阈值从 0.9 降到 0.7，三项关键指标均呈一致上升趋势：$T_{\mathrm{QI}}^{\max}$ 显著增加，从 0.9 阈值的 317.07 ms 升至 0.7 阈值的 388.73 ms，在该阈值范围内近乎翻倍；$T_{\mathrm{QI}}^{\min}$ 从 9.33 ms 增至 39.67 ms，表明阈值降低时准不变区间下界更稳定；反映整体准不变性能的 $T_{\mathrm{QI}}^{\mathrm{mean}}$ 也从 191.88 ms 攀升至 363.65 ms，说明较低阈值设置对应更长的平均准不变区间。这些趋势共同表明阈值水平与准不变特性之间存在清晰关联。

值得注意的是，图 6 中 $\alpha=0.8$ 阈值下准不变区间曲线的波动模式与 $\alpha=0.9$、$\alpha=0.7$ 有显著不同。该现象可归因于 0.8 阈值位于该高 K 因子场景信道自相关函数的**敏感过渡区**：与捕获高度稳定 LoS 核心的 $\alpha=0.9$ 以及覆盖更宽能量包络的 $\alpha=0.7$ 不同，0.8 阈值恰位于相关衰减最陡的梯度处；在该区域，度量对主导 LoS 路径与次要多径分量之间瞬态相位干涉图样高度敏感，因而微小相位旋转即可使相关系数在阈值附近振荡，产生与更紧或更松阈值显著不同的波动趋势。

### B. 强时变场景

基于弱时变场景的分析，其关键特征为：平稳区间 $T_{\mathrm{QS}}$ 为 392 ms，平均信道衰落功率集中于主径、少量次要路径边界清晰；按表 V 含 3 条多径分量，以 LoS 传播为主。

考虑高架桥场景中多径动态性强、多普勒谱波动剧烈的特性：按 III-A 节准平稳区间评估方法，该场景在 0.9 阈值下准平稳区间 $T_{\mathrm{QS}}$ 为 100.8 ms。基于第 III 节提出的 DD 域信道建模框架，得到该平稳区间内的平均信道系数如图 8 所示；如红色箭头所示，第一条路径为 LoS 信号，是主导传播路径。图 8 清晰呈现 DD 域中的功率聚集特性：多条次要路径分布在主径周围，印证了强时变场景中多径快速变化的特性。

通过信道估计与多径提取方法，得到该场景的信道模型参数如表 V 所示：强时变场景中共有 5 条显著多径分量，多径多普勒频移分布范围很宽，表明高速移动引起的多普勒扩展效应显著；同时最大多径时延差达 2.1 μs，反映复杂散射环境中的多径传播特性。

### C. 中等时变场景

对中等时变场景，多径结构相对稳定但仍呈现动态波动。按 III-A 节准平稳区间评估方法，该场景在 0.9 阈值下准平稳区间 $T_{\mathrm{QS}}$ 为 172.2 ms；该 $T_{\mathrm{QS}}$ 内的平均信道系数如图 7 所示。与弱时变情形类似，时延最小的第一条路径对应 LoS 分量。与弱时变场景相比，图 7 中多径幅度分布更分散，次要路径数量增加、边缘模糊度更高，表明多径动态性增强。用与弱时变场景相同的信道估计与多径提取方法，得到中等时变场景的信道模型参数如表 V 所示：中等时变场景含 4 条主要多径分量，多径多普勒频偏范围从 $-79.82$ Hz 扩展到 147.86 Hz，反映多普勒扩展随时变强度增强而增大的规律；时延分布上最大时延差为 1.47 μs。

### D. DD 域信道模型分析

通过对强、中等、弱三类时变场景的建模与参数提取，HSR 高架桥场景的 DD 域信道模型汇集于表 V。参照抽头延迟线（TDL）模型 [51]，我们把该模型视为**抽头延迟—多普勒线（TDDL）**模型，并分别命名为 TDDL-A、TDDL-B 与 TDDL-C。

**表 V　高架桥下 HSR 的 DD 信道模型**（按原表逐格转录；含平稳区间、多径编号、时延、功率、多普勒、幅度分布与最小准不变区间）

| 模型（场景） | 平稳区间 $T_{\mathrm{QS}}$ | 编号 | 时延（ns） | 功率（dB） | 多普勒（Hz） | 幅度分布 | $T_{\mathrm{QI}}^{\min}$（$\alpha=0.9$） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TDDL-A（强时变） | 100.8 ms | 1 | 0 | 0 | 57.32 | Rician$\sim$(0.063,0.014), $K$=11.04 dB | 2.8 ms |
| TDDL-A（强时变） | 100.8 ms | 2 | 511.11 | −26.33 | −51.96 | Rician$\sim$(0.008,0.001), $K$=25.89 dB | 1.87 ms |
| TDDL-A（强时变） | 100.8 ms | 3 | 842.23 | −23.32 | −82.50 | Rician$\sim$(0.007,0.001), $K$=13.33 dB | 1.4 ms |
| TDDL-A（强时变） | 100.8 ms | 4 | 1802.23 | −26.16 | 152.14 | Rician$\sim$(0.006,0.002), $K$=6.45 dB | 1.4 ms |
| TDDL-A（强时变） | 100.8 ms | 5 | 2102.23 | −28.57 | 106.07 | Weibull$\sim$(0.008,1.38) | 0.93 ms |
| TDDL-B（中等时变） | 172.2 ms | 1 | 0 | 0 | 124.82 | Rician$\sim$(0.044,0.016), $K$=3.81 dB | 4.67 ms |
| TDDL-B（中等时变） | 172.2 ms | 2 | 408.89 | −20.99 | 147.86 | Weibull$\sim$(0.009,1.517) | 1.87 ms |
| TDDL-B（中等时变） | 172.2 ms | 3 | 862.22 | −25.34 | −43.93 | Weibull$\sim$(0.007,1.294) | 0.93 ms |
| TDDL-B（中等时变） | 172.2 ms | 4 | 1471.11 | −27.18 | −79.82 | Weibull$\sim$(0.005,1.353) | 0.93 ms |
| TDDL-C（弱时变） | 392 ms | 1 | 0 | 0 | 150.54 | Rician$\sim$(0.032,0.004), $K$=31.48 dB | 9.33 ms |
| TDDL-C（弱时变） | 392 ms | 2 | 928.88 | −28.74 | 38.57 | Rayleigh$\sim$(0.0045) | 1.87 ms |
| TDDL-C（弱时变） | 392 ms | 3 | 2140 | −30.45 | −21.43 | Weibull$\sim$(0.0054,1.1877) | 0.93 ms |

表 V 结果表明：TDDL-A 模型（100.8 ms 平稳区间、5 条多径）中时延跨度达 2102.23 ns、多普勒范围很宽（$-82.50$ Hz 至 152.14 Hz），平均准不变区间较短（低至 5.81 ms），反映复杂散射与快速信道变化；TDDL-B 模型（172.2 ms 平稳区间、4 条多径）中时延（至 1471.11 ns）与多普勒（$-79.82$ Hz 至 147.86 Hz）范围收窄，幅度分布以 Weibull 为主，平均准不变区间更长（至 30.12 ms），表明散射更规则、变化更慢；TDDL-C 模型（392 ms 平稳区间、3 条多径）中尽管时延达 2140 ns，多径数少、主径占主导，多普勒波动窄（$-21.43$ Hz 至 150.54 Hz），幅度分布以 Rician 为主，平均准不变区间相对较长（至 191.88 ms），呈现随机散射体少、传播稳定的特征。从强到弱时变，多径数下降、平稳区间与准不变区间增大、幅度分布简化、多普勒/功率波动收窄。这些特征与真实传播行为一致，可支撑 6G 及未来 DDMC 与通感一体化设计。

**图 2**：随距离变化的相对位置（强、中等、弱时变场景分布）。
**图 3**：HSR 弱时变场景下 DD 域信道平稳性分析（(a) DD 域共线性；(b) CDD 统计的平稳区间）。
**图 4**：HSR 弱时变场景平稳区间内的平均 DD 域信道衰落。
**图 5**：HSR 弱时变场景 CDF 分布拟合（(a) 第一条路径；(b) 第二条路径；(c) 第三条路径）。
**图 6**：HSR 弱时变场景第一条路径的准不变区间。
**图 7**：中等时变场景的平均 DD 域信道衰落。
**图 8**：强时变场景的平均 DD 域信道衰落。

## V. HSR 中 DD 域信道模型的验证

本节通过物理色散分析与系统级性能评估两方面对所提 DD 域信道模型进行全面验证：先比较 RMS 时延扩展与多普勒扩展与实测统计量，验证模型物理保真度；随后以 BER 性能作为统计效用指标，说明模型准确捕获信道衰落特性。

### A. 色散特性与建模验证

为验证建模保真度，先评估测量数据与所提 TDDL 模型之间物理色散参数的一致性。采用 RMS 时延扩展 $\tau_{\mathrm{rms}}$ 与 RMS 多普勒扩展 $\nu_{\mathrm{rms}}$ 作为量化信道色散的关键基准，定义为 [29], [51]

$$
\tau_{\mathrm{rms}}=\sqrt{\frac{\sum_{i}P_i\tau_i^2}{\sum_{i}P_i}-\left(\frac{\sum_{i}P_i\tau_i}{\sum_{i}P_i}\right)^2},\tag{17}
$$

$$
\nu_{\mathrm{rms}}=\sqrt{\frac{\sum_{i}P_i\nu_i^2}{\sum_{i}P_i}-\left(\frac{\sum_{i}P_i\nu_i}{\sum_{i}P_i}\right)^2},\tag{18}
$$

其中 $P_i$、$\tau_i$、$\nu_i$ 分别为第 $i$ 条多径分量的功率、时延与多普勒频移。

**表 VI　RMS 色散参数比较**（按原表逐格转录）

| 场景 | 数据来源 | RMS 时延（ns） | RMS 多普勒（Hz） |
| --- | --- | --- | --- |
| 强时变（TDDL-A） | $T_{\mathrm{QS}}$ 内实测 | 135.23 | 12.51 |
| 强时变（TDDL-A） | 表 V 建模 | 132.58 | 11.91 |
| 强时变（TDDL-A） | $\tfrac12T_{\mathrm{QS}}$ | 135.92 | 12.47 |
| 强时变（TDDL-A） | $2T_{\mathrm{QS}}$ 内实测 | 162.45 | 15.82 |
| 中等时变（TDDL-B） | $T_{\mathrm{QS}}$ 内实测 | 88.99 | 13.20 |
| 中等时变（TDDL-B） | 表 V 建模 | 86.51 | 12.83 |
| 中等时变（TDDL-B） | $\tfrac12T_{\mathrm{QS}}$ | 86.55 | 12.84 |
| 中等时变（TDDL-B） | $2T_{\mathrm{QS}}$ 内实测 | 76.12 | 9.35 |
| 弱时变（TDDL-C） | $T_{\mathrm{QS}}$ 内实测 | 72.41 | 6.56 |
| 弱时变（TDDL-C） | 表 V 建模 | 72.49 | 6.57 |
| 弱时变（TDDL-C） | $\tfrac12T_{\mathrm{QS}}$ | 74.06 | 6.71 |
| 弱时变（TDDL-C） | $2T_{\mathrm{QS}}$ 内实测 | 89.33 | 4.15 |

为严格验证所建三个 TDDL 模型的精度并检验所确定准平稳区间的合理性，我们用三种不同时长的实测数据做比较分析：识别出的准平稳区间（$T_{\mathrm{QS}}$）、其一半（$\tfrac12T_{\mathrm{QS}}$）与两倍（$2T_{\mathrm{QS}}$），结果汇总于表 VI。可以看到，对三个模型，TDDL 模型的 RMS 时延与多普勒扩展与 $T_{\mathrm{QS}}$ 内实测结果一致，确认参数提取的准确性；由较短时长（$\tfrac12T_{\mathrm{QS}}$）得到的统计量与 $T_{\mathrm{QS}}$ 的接近，验证了建模区间内信道统计的稳定性。相反，当观测窗扩展到两倍平稳区间（$2T_{\mathrm{QS}}$）时，色散参数相比模型出现显著偏差：例如强时变场景（TDDL-A）中 $\tau_{\mathrm{rms}}$ 从 135.23 ns 显著增至 162.45 ns。该偏差确认超出所定义 $T_{\mathrm{QS}}$ 后信道特性发生显著变化，从而验证 III 节准平稳区间评估的准确性。

### B. 准平稳区间内 DD 域信道统计分布准确性的验证

用 BER 作为"效用指标"验证信道模型准确性，是当前 5G/6G 高移动性信道建模研究的标准范式 [52]–[54]。系统（OFDM/OTFS）的 BER 性能严格取决于信道的功率时延分布与多普勒功率谱，这些参数的偏差会导致 BER 曲线显著偏移 [55]。因此，模型信道与实测信道的 BER 可有效证明所提模型能否准确捕获物理信道的色散与时间相关性。

由于 DD 域调制系统的 BER 性能与 DD 域信道特性密切相关，我们选用 OTFS 波形作为信道模型验证的示例。在理想波形假设下，OTFS 系统的输入输出关系为 [52], [56]

$$
y[k,l]=\frac{1}{MN}\sum_{k'=0}^{N-1}\sum_{l'=0}^{M-1}x\left[k',l'\right]h_w\left(k-k',l-l'\right)+n[k,l],\tag{19}
$$

其中 $y[k,l]$ 为输出信号、$x[k',l']$ 为输入信号、$n[k,l]$ 为加性噪声、$h_w(\cdot,\cdot)$ 为 DD 域等效信道。基于（19）可得

$$
\mathbf Y_{\mathrm{DD}}=\mathbf H_{\mathrm{DD}}\mathbf X_{\mathrm{DD}}+\mathbf n,\tag{20}
$$

其中 $\mathbf Y_{\mathrm{DD}}\in\mathbb C^{NM\times1}$ 为向量化接收符号、$\mathbf X_{\mathrm{DD}}\in\mathbb C^{NM\times1}$ 为向量化发射符号、$\mathbf H_{\mathrm{DD}}\in\mathbb C^{NM\times NM}$ 为 DD 域等效信道矩阵。经 DD 域信道传输后，接收信号可用最小均方误差（MMSE）准则均衡：

$$
\hat{\mathbf X}_{\mathrm{DD}}=\left(\mathbf H_{\mathrm{DD}}^H\mathbf H_{\mathrm{DD}}+\frac{\sigma^2}{E_{\mathbf X_{\mathrm{DD}}}}\mathbf I\right)^{-1}\mathbf H_{\mathrm{DD}}^H\mathbf Y_{\mathrm{DD}},\tag{21}
$$

其中 $\sigma^2$ 与 $E_{\mathbf X_{\mathrm{DD}}}$ 分别为噪声功率与符号功率。随后比较 $\hat{\mathbf X}_{\mathrm{DD}}$ 与 $\mathbf X_{\mathrm{DD}}$ 即得系统传输 BER。

基于（19）—（21），我们比较 OTFS 系统在实测 DD 域信道与所建模型信道下不同信噪比（SNR）条件的 BER 性能，以验证所导信道模型的准确性。具体细节如下：为验证表 V 所建 DD 域信道模型的准确性，本节比较 OTFS 系统在实测信道与模型信道下、准平稳区间 $T_{\mathrm{QS}}$ 内的 BER 性能。仿真条件方面，假设理想时频同步且接收端具有完美信道状态信息 [57]；需强调实际部署中，绝对 BER 性能不可避免地会受到信道估计误差、同步偏移、载波频偏与硬件非线性等因素影响。然而本仿真的主要目的不是评测实际 OTFS 收发机的性能，而是用 BER 作为"效用指标"验证所提信道模型的统计保真度：通过对实测与模型信道仿真同时假设理想条件，我们严格把信道建模误差与实现相关因素隔离；引入硬件损伤或特定接收机算法会带来可能遮蔽信道模型内在偏差的干扰变量 [58]。因此这里的 BER 结果用于验证测量与建模精度；尽管绝对 BER 值会随不同 OTFS 收发机设计与实际损伤水平而变化，但在受控条件下模型与实测的相对一致性确认了模型的有效性。

对实测信道下的 OTFS 传输，从准平稳区间 $T_{\mathrm{QS}}$ 的实测 DD 域信道中随机选取对应时长 $NT$ 与带宽 $M\Delta f$ 的 DD 域信道；对模型信道下的 OTFS 传输，则按表 V 所建参数与分布生成对应 RE 的 DD 域信道。为验证所建 DD 域信道模型是否仅在准平稳区间内有效，另选时长超过准平稳区间的实测 DD 域信道（如两倍平稳区间 $2T_{\mathrm{QS}}$ 内）作为附加基准。基于上述设置，按（19）—（21）计算不同方案的 BER。下文中取 $M=300$、$N=280$，并采用 QPSK、16QAM 与 64QAM 调制。

不同 DD 域信道条件下 OTFS 调制的 BER 性能如图 9 所示。为全面验证所提 TDDL 模型的通用性与鲁棒性，我们用 QPSK、16QAM 与 64QAM 调制评估系统性能。首先可观察到，对三种调制方案，所提信道模型下 OTFS 的 BER 曲线与从相应准平稳区间随机选取的实测信道下的 BER 曲线高度吻合；尤其在 64QAM 下仍紧密吻合，表明所建 DD 域信道模型准确捕获高阶调制所需的细粒度统计特性与色散特性，说明所提模型在强、中等、弱时变场景中均具有高保真度与鲁棒性。其次，把模型信道下的 BER 曲线与从 $2T_{\mathrm{QS}}$ 时长随机选取的实测信道下的 BER 曲线比较，由于引入 DD 域信道非平稳性而出现 BER 间隙。基于这些观察可得出结论：所提 TDDL-A、TDDL-B 与 TDDL-C 信道模型在相应准平稳区间内有效，可作为真实信道的参考来仿真时长 $NT$（$NT<T_{\mathrm{QS}}$）的数据包的 DD 域信道。

### C. 准不变区间的验证

本小节进一步验证 DD 域信道衰落系数在准不变区间内可视为不变。具体地，用时刻 $t_2$ 的 $\mathbf H_{\mathrm{DD}}$ 做（20）的 OTFS 传输、用时刻 $t_1$ 的 $\mathbf H_{\mathrm{DD}}$ 做（21）的信道均衡，记为 $\mathbf H_{\mathrm{DD}}^{t_2}$ 与 $\mathbf H_{\mathrm{DD}}^{t_1}$（$t_2\le t_1$）；$\mathbf H_{\mathrm{DD}}^{t_2}$ 与 $\mathbf H_{\mathrm{DD}}^{t_1}$ 按相应时刻的实测 DD 域信道生成。仿真中比较强时变场景下三种方案的 BER：第一种称理想情形，$t_2=t_1$，假设信道参数不变，提供 BER 下界用于评估；第二种采用 OTFS 社区常用假设，即 $t_2-t_1$ 可视为准平稳区间 [18]（$T_{\mathrm{QS}}=100.8$ ms，按 III-A 节 CDD、阈值大于 0.9 计算）；第三种采用 III-C 节建模的准不变区间，对应 DD-TCC 阈值 $\alpha=0.9$ 下 5 条主要传播路径的最小准不变区间（即 $t_2-t_1=T_{\mathrm{QI}}^{\min}=2.8,1.87,1.4$ 与 0.93 ms）。该分析采用 QPSK 调制，其他实验参数与 V-B 节相同。

不同 $t_2-t_1$ 方案的 BER 性能如图 10 所示。首先，比较 $t_1=t_2$ 与 $t_2-t_1=T_{\mathrm{QS}}$ 的 OTFS 传输 BER，可注意到若假设 DD 域信道系数在准平稳区间内不变，BER 会显著变差——事实上信道平稳性刻画的是信道的二阶统计量，不能直接由之推断信道系数不变。其次，对按 III-C 节所发现准不变区间设置 $t_1-t_2$ 的 OTFS 传输，随最小准不变区间减小，BER 呈逐步逼近理想情形的趋势，显示所建准不变区间的合理性；特别地 $t_2-t_1=0.93$ ms 的 OTFS 传输 BER 最接近理想情形。据此可观察到 DD 域信道系数即使在 0.93 ms 内也始终是时变的；此外我们建议当满足多径最小准不变区间时可将 DD 域信道视为不变，该区间在 HSR 高架桥强时变场景为 ms 量级。

**图 9**：不同信道条件下 OTFS 调制的 BER（QPSK、16QAM 与 64QAM）。
**图 10**：不同 $t_2-t_1$ 下 OTFS 调制的 BER。

## VI. 结论与未来工作

本文对 HSR 高架桥场景的 DD 域信道测量与建模进行了系统研究。借助 LTE-R 框架，提出一种新的测量方法，使商用 OFDM 系统能够提取 DD 参数，并建立了跨多种时变条件的准平稳信道模型。采用物理色散分析与系统级 BER 评估的综合验证确认，所提模型准确捕获真实信道特性。关键地，结果表明 DD 域表示有效把快速时变的 HSR 信道转化为稀疏且准平稳的形式，该特性显著降低信道估计复杂度并保持稳健的误码性能，从而说明下一代高移动性通信偏好 DD 域方法。总之，本工作为未来 DDMC 系统设计提供了可靠的理论与模型支撑。

基于本工作，仍有若干有趣的研究方向有待探索。第一，受测量设置限制，本文未研究 DD 域信道的空间特性，后续研究可考察该方面以加深对 DD 域信道机理的理解。第二，当前工作聚焦 HSR 高架桥场景的 DD 域信道建模，而其他复杂场景（如 HSR 隧道、普通铁路与城市轨道交通）的 DD 域信道特性仍需进一步研究。此外，DD 域信道在各种通感一体化（ISAC）场景中的行为也颇具研究价值；未来应基于所提设计开展研究，为 6G 及未来通信系统中 ISAC 与 DDMC 技术的融合发展提供理论基础与建模支撑。

## 表格

**表 I—VI 说明**：表 I（测量系统参数）已在第 II-A 节逐格转录；表 II（概率分布模型）在 III-B 节；表 III（弱时变 KS 检验）与表 IV（准不变区间分析）在 IV-A 节；表 V（高架桥下 HSR 的 DD 信道模型，含 TDDL-A/B/C 三组）在 IV-D 节；表 VI（RMS 色散参数比较）在 V-A 节。各表均已按原表逐格转录，表 II 与表 V 另用 PyMuPDF 渲染原 PDF 第 6、10 页核对。

## 图注与表注

**图 1**：测量场景示意。
**图 2**：随距离变化的相对位置（强、中等、弱时变场景）。
**图 3**：HSR 弱时变场景 DD 域信道平稳性分析（(a) DD 域共线性；(b) CDD 统计的平稳区间）。
**图 4**：弱时变场景平稳区间内的平均 DD 域信道衰落。
**图 5**：弱时变场景 CDF 分布拟合（三条路径）。
**图 6**：弱时变场景第一条路径的准不变区间。
**图 7**：中等时变场景的平均 DD 域信道衰落。
**图 8**：强时变场景的平均 DD 域信道衰落。
**图 9**：不同信道条件下 OTFS 调制的 BER。
**图 10**：不同 $t_2-t_1$ 下 OTFS 调制的 BER。

**表注**：表 I—VI 均已按原表逐格转录；表 II、表 V 已用 PyMuPDF 渲染原 PDF 第 6、10 页核对。注意原文正文在描述表 IV 时把 $T_{\mathrm{QI}}^{\max}$ 在 0.9 阈值下的值写作 317.07 ms，而表 IV 中该值为 314.07 ms（见"原文疑点"）。

## 参考文献

> 以下按原文编号 [1]—[58] 转录英文原书目，条目文字不翻译；PDF 抽取文本中的变音与断行伪影已按常规写法整理，书目内容未改动。

[1] B. Ai, Y. Lu, Y. Fang, D. Niyato, R. He, W. Chen, J. Zhang, G. Ma, Y. Niu, and Z. Zhong, “6G-enabled smart railways,” Proceedings of the IEEE, vol. 113, no. 10, pp. 1192–1235, 2025.

[2] M. Matthaiou, O. Yurduseven, H. Q. Ngo, D. Morales-Jimenez, S. L. Cotton, and V. F. Fusco, “The road to 6G: Ten physical layer challenges for communications engineers,” IEEE Communications Magazine, vol. 59, no. 1, pp. 64–69, 2021.

[3] B. He, Z. Chen, J. Luo, C. Liu, S. Wang, J. Park, F. Wang, and T. Q. S. Quek, “Toward secure semantic transmission in the era of gen AI: A diffusion-based framework,” IEEE Communications Magazine, pp. 1–8, 2025.

[4] R. He, B. Ai, G. Wang, K. Guan, Z. Zhong, A. F. Molisch, C. Briso-Rodriguez, and C. P. Oestges, “High-speed railway communications: From GSM-R to LTE-R,” IEEE Vehicular Technology Magazine, vol. 11, no. 3, pp. 49–58, 2016.

[5] R. Liu, M. Hua, K. Guan, X. Wang, L. Zhang, T. Mao, D. Zhang, Q. Wu, and A. Jamalipour, “6G enabled advanced transportation systems,” IEEE Transactions on Intelligent Transportation Systems, vol. 25, no. 9, pp. 10564–10580, 2024.

[6] A. F. Molisch, C. F. Mecklenbräuker, T. Zemen, A. Prokes, M. Hofer, F. Pasic, and H. Hammoud, “Millimeter-wave V2X channel measurements in urban environments,” IEEE Open Journal of Vehicular Technology, vol. 6, pp. 520–541, 2025.

[7] C. Li, “Research on time delay Doppler domain channel measurement and modeling methods in high speed mobile scenarios,” Master's thesis, Beijing Jiaotong University, 2024.

[8] H. Li, S. Hao, C. Gong, Q. Li, and X. Dai, “New multiple access and waveform technologies for 6G,” Telecommunications Science, vol. 38, no. 10, pp. 36–45, 2022.

[9] L. Liu, B. Ai, Y. Niu, Z. Han, and N. Wang, “QoS-aware scheduling of airship-assisted millimeter wave communications for high-speed railway,” IEEE Trans. Veh. Technol., vol. 73, no. 12, pp. 1–13, Dec. 2024.（原文截断）

[10] Y. S. Cho, J. Kim, W. Y. Yang, and C. G. Kang, MIMO-OFDM Wireless Communications with MATLAB. John Wiley & Sons, 2010.

[11] Z. Hou, Y. Zhou, L. Tian, J. Shi, Y. Li, and B. Vucetic, “Radio environment map-aided Doppler shift estimation in LTE railway,” IEEE Transactions on Vehicular Technology, vol. 66, no. 5, pp. 4462–4467, 2017.

[12] G. Geraci, A. Garcia-Rodriguez, M. M. Azari, A. Lozano, M. Mezzavilla, S. Chatzinotas, Y. Chen, S. Rangan, and M. D. Renzo, “What will the future of UAV cellular communications be? A flight from 5G to 6G,” IEEE Communications Surveys & Tutorials, vol. 24, no. 3, pp. 1304–1335, 2022.

[13] X. Cheng, Z. Huang, and L. Bai, “Channel nonstationarity and consistency for beyond 5G and 6G: A survey,” IEEE Communications Surveys & Tutorials, vol. 24, no. 3, pp. 1634–1669, 2022.

[14] Z. Qin, F. Gao, B. Lin, X. Tao, G. Liu, and C. Pan, “A generalized semantic communication system: From sources to channels,” IEEE Wireless Communications, vol. 30, no. 3, pp. 18–26, 2023.

[15] A. Sayeed and B. Aazhang, “Joint multipath-Doppler diversity in mobile wireless communications,” IEEE Transactions on Communications, vol. 47, no. 1, pp. 123–132, 1999.

[16] R. Hadani, S. Rakib, M. Tsatsanis, A. Monk, A. J. Goldsmith, A. F. Molisch, and R. Calderbank, “Orthogonal time frequency space modulation,” in 2017 IEEE Wireless Communications and Networking Conference (WCNC), 2017, pp. 1–6.

[17] A. Farhang, A. RezazadehReyhani, L. E. Doyle, and B. Farhang-Boroujeny, “Low complexity modem structure for OFDM-based orthogonal time frequency space modulation,” IEEE Wireless Communications Letters, vol. 7, no. 3, pp. 344–347, 2018.

[18] W. Shen, L. Dai, J. An, P. Fan, and R. W. Heath, “Channel estimation for orthogonal time frequency space (OTFS) massive MIMO,” IEEE Transactions on Signal Processing, vol. 67, no. 16, pp. 4204–4217, 2019.

[19] K. Bao, T. Zhou, and L. Liu, “An OTFS waveform based delay-Doppler domain channel sounding method for high-mobility scenarios,” in 2024 14th International Symposium on Antennas, Propagation and EM Theory (ISAPE), 2024, pp. 1–4.

[20] J. Liu, X. Tang, F. Wang, X. Chen, and W. Xu, “A high-resolution channel estimation method for ICAN systems based on artificial perturbation-OTFS,” IEEE Transactions on Cognitive Communications and Networking, vol. 12, pp. 4561–4576, 2026.

[21] F. Hlawatsch and G. Matz, Wireless Communications over Rapidly Time-Varying Channels. Academic Press, 2011.

[22] Z. Wei, W. Yuan, S. Li, J. Yuan, G. Bharatula, R. Hadani, and L. Hanzo, “Orthogonal time-frequency space modulation: A promising next-generation waveform,” IEEE Wireless Communications, vol. 28, no. 4, pp. 136–144, 2021.

[23] X. Wei, L. Zhang, W. Yuan, F. Liu, S. Li, and Z. Wei, “SDR system design and implementation on delay-Doppler communications and sensing,” in 2023 IEEE Wireless Communications and Networking Conference (WCNC), 2023, pp. 1–6.

[24] M. Hofer, D. Löschenbrand, F. Pasic, D. Radovic, B. Rainer, J. Blumenstein, C. F. Mecklenbräuker, S. Sangodoyin, H. Hammoud, G. Matz, A. F. Molisch, and T. Zemen, “Similarity of wireless multiband propagation in urban vehicular-to-infrastructure scenarios,” in 2024 IEEE 35th International Symposium on Personal, Indoor and Mobile Radio Communications (PIMRC), 2024, pp. 1–6.

[25] P. Unterhuber, M. Walter, U.-C. Fiebig, and T. Kürner, “Stochastic channel parameters for train-to-train communications,” IEEE Open Journal of Antennas and Propagation, vol. 2, pp. 778–792, 2021.

[26] H. Groll, “Millimeter wave channels for vehicular communications: Variability and sparse models,” Ph.D. dissertation, Technische Universität Wien, 2023.

[27] E. M. Bigñotte, P. Unterhuber, A. A. Gómez, S. Sand, and M. M. Errasti, “Measurement based tapped delay line model for train-to-train communications,” IEEE Transactions on Vehicular Technology, vol. 72, no. 4, pp. 4168–4181, 2023.

[28] S. Liu, H. Yan, L. Ma, Y. Liu, and X. Han, “UACC-GAN: A stochastic channel simulator for underwater acoustic communication,” IEEE Journal of Oceanic Engineering, vol. 49, no. 4, pp. 1605–1621, 2024.

[29] Y. Ma, G. Ma, B. Ai, D. Fei, N. Wang, Z. Zhong, and J. Yuan, “Characteristics of channel spreading function and performance of OTFS in high-speed railway,” IEEE Transactions on Wireless Communications, vol. 22, no. 10, pp. 7038–7054, 2023.

[30] L. Liu, C. Tao, J. Qiu, H. Chen, L. Yu, W. Dong, and Y. Yuan, “Position-based modeling for wireless channel on high-speed railway under a viaduct at 2.35 GHz,” IEEE Journal on Selected Areas in Communications, vol. 30, no. 4, pp. 834–845, 2012.

[31] X. Yin, X. Cai, X. Cheng, J. Chen, and M. Tian, “Empirical geometry-based random-cluster model for high-speed-train channels in UMTS networks,” IEEE Transactions on Intelligent Transportation Systems, vol. 16, no. 5, pp. 2850–2861, 2015.

[32] J. Ding, “Measurement, modeling, and simulation of time-frequency dispersion characteristics in high-speed railway channels,” Ph.D. dissertation, Beijing Jiaotong University, 2018.

[33] J. Yang, “Research on the analysis and modeling method of fast time varying channel characteristics in high speed railway scenarios,” Ph.D. dissertation, Beijing Jiaotong University, 2019.

[34] J. Ding, L. Zhang, J. Yang, B. Sun, and J. Huang, “Broadband wireless channel in composite high-speed railway scenario: Measurements, simulation, and analysis,” Wireless Communications and Mobile Computing, vol. 2017, no. 1, p. 2897636, 2017.

[35] K. Guan, Z. Zhong, B. Ai, and T. Kurner, “Deterministic propagation modeling for the realistic high-speed railway environment,” in 2013 IEEE 77th Vehicular Technology Conference (VTC Spring), 2013, pp. 1–5.

[36] A. Ghazal, C.-X. Wang, B. Ai, D. Yuan, and H. Haas, “A nonstationary wideband MIMO channel model for high-mobility intelligent transportation systems,” IEEE Transactions on Intelligent Transportation Systems, vol. 16, no. 2, pp. 885–897, 2015.

[37] T. Zhou, C. Tao, L. Liu, and Z. Tan, “A semi-empirical MIMO channel model for high-speed railway viaduct scenarios,” in 2014 IEEE International Conference on Communications (ICC), 2014, pp. 5854–5858.

[38] M. Yang, B. Ai, R. He, L. Chen, X. Li, J. Li, B. Zhang, C. Huang, and Z. Zhong, “A cluster-based three-dimensional channel model for vehicle-to-vehicle communications,” IEEE Transactions on Vehicular Technology, vol. 68, no. 6, pp. 5208–5220, 2019.

[39] M. Yang, “Research on time varying directional channel measurement and modeling for intelligent transportation,” Ph.D. dissertation, Beijing Jiaotong University, 2019.（原文截断）

[40] Y. Ma, B. Ai, G. Ma, A. Shafie, Q. Cheng, M. Yang, J. Li, X. Pang, J. Yuan, and Z. Zhong, “Channel spreading function-inspired channel transfer function estimation for OFDM systems with high mobility,” IEEE Wireless Communications Letters, vol. 14, no. 7, pp. 2169–2173, 2025.

[41] Y. Ma and et al., “Delay-Doppler domain signal processing aided OFDM (DD-A-OFDM) for 6G and beyond,” arXiv preprint arXiv:2508.04253, 2025.

[42] J. A. Rice and J. A. Rice, Mathematical Statistics and Data Analysis. Belmont, CA: Thomson/Brooks/Cole, 2007.

[43] C. Li, K. Yang, J. Yu, F. Li, Y. Shui, F. Chang, and W. Chen, “V2V radio channel performance based on measurements in ramp scenarios at 5.9 GHz,” IEEE Access, vol. 6, pp. 7503–7514, 2018.

[44] Q. Zhang, S. Wang, Y. Shi, and K. Yang, “Measurements and analysis of maritime wireless channel at 8 GHz in the South China Sea region,” IEEE Transactions on Antennas and Propagation, vol. 71, no. 3, pp. 2664–2675, 2023.（原文截断）

[45] G. Matz, “Doubly underspread non-WSSUS channels: Analysis and estimation of channel statistics,” in 2003 4th IEEE Workshop on Signal Processing Advances in Wireless Communications - SPAWC 2003, 2003, pp. 190–194.

[46] A. F. Molisch, Wireless Communications. Chichester, UK: Wiley, 2005.

[47] L. Bernadó, T. Zemen, F. Tufvesson, A. F. Molisch, and C. F. Mecklenbräuker, “The (in-)validity of the WSSUS assumption in vehicular radio channels,” in 2012 IEEE 23rd International Symposium on Personal, Indoor and Mobile Radio Communications (PIMRC), 2012, pp. 1757–1762.

[48] Y. Qin, P. Tang, L. Tian, J. Lin, Z. Chang, P. Liu, J. Zhang, and T. Jiang, “Time-varying channel measurement and analysis at 105 GHz in an indoor factory,” in 2024 18th European Conference on Antennas and Propagation (EuCAP), 2024, pp. 1–5.

[49] F. A. Rodríguez-Corbo, L. Azpilicueta, M. Celaya-Echarri, R. Shubair, and F. Falcone, “mmWave channel stationarity analysis of V2X communications in an urban environment,” IEEE Antennas and Wireless Propagation Letters, vol. 22, no. 6, pp. 1406–1410, 2023.

[50] Y. Niu, J. Ding, D. Fei, Z. Zhong, and Y. Liu, “LTE-based wireless channel modeling on high-speed railway at 465 MHz,” in 2019 27th European Signal Processing Conference (EUSIPCO), 2019, pp. 1–5.

[51] X. Zhang, R. He, M. Yang, J. Ding, R. Chen, S. Gao, Z. Qi, Z. Zhang, B. Ai, and Z. Zhong, “Measurement-based nonstationary Markov tapped delay line channel model for 5G-railways,” IEEE Antennas and Wireless Propagation Letters, vol. 24, no. 8, pp. 2277–2281, 2025.

[52] Z. Wei, W. Yuan, S. Li, J. Yuan, and D. W. K. Ng, “Off-grid channel estimation with sparse Bayesian learning for OTFS systems,” IEEE Transactions on Wireless Communications, vol. 21, no. 9, pp. 7407–7426, 2022.

[53] D. Chatzoulis, C. Chaikalis, D. Kosmanos, K. E. Anagnostou, and G. T. Karetsos, “5G V2X performance comparison for different channel coding schemes and propagation models,” Sensors, vol. 23, no. 5, p. 2436, 2023.

[54] X. Wang, J. Yuan, J. Wang, and K. Huang, “Achieving full multipath diversity by random constellation rotation: A theoretical perspective,” IEEE Transactions on Signal Processing, pp. 1–10, 2026.

[55] S. Li, W. Yuan, Z. Wei, and J. Yuan, “Cross domain iterative detection for orthogonal time frequency space modulation,” IEEE Transactions on Wireless Communications, vol. 21, no. 4, pp. 2227–2242, 2022.

[56] D. Shi, W. Wang, L. You, X. Song, Y. Hong, X. Gao, and G. Fettweis, “Deterministic pilot design and channel estimation for downlink massive MIMO-OTFS systems in presence of the fractional Doppler,” IEEE Transactions on Wireless Communications, vol. 20, no. 11, pp. 7151–7165, 2021.

[57] M. A. Mohsin, M. Umer, A. Bilal, H. Rizwan, S. Bhattacharya, M. A. Jamshed, and J. M. Cioffi, “Transformer-based sparse CSI estimation for non-stationary channels,” arXiv preprint arXiv:2511.01333, 2025.

[58] D. Löschenbrand, M. Hofer, and T. Zemen, “Orthogonal precoding with channel prediction for high mobility massive MIMO,” in 2020 IEEE 31st Annual International Symposium on Personal, Indoor and Mobile Radio Communications, 2020, pp. 1–6.

**本页范围与校对状态：** 本页为从零建立的中文全文译稿，覆盖：摘要与索引词；第 I 节引言（研究背景、DD 域测量/建模/HSR 建模的文献综述、研究空白与四条创新、组织结构）；第 II 节基于 LTE-R 的 DD 域信道测量（A 测量设置，表 I、图 1；B TF 域信道衰落获取，式（1）—（6）；C DD 域信道粗估计，式（7）—（9）；D DD 域信道精确估计，算法 1）；第 III 节基于 LTE-R 的 DD 域信道建模（A 准平稳区间评估，式（10）—（13）；B 幅度分布拟合，式（14）（15）、表 II、KS 检验；C 准不变区间评估，式（16））；第 IV 节 HSR 场景 DD 域信道建模（场景分类、A 弱时变、B 强时变、C 中等时变、D 模型分析，表 III—V，图 2—8）；第 V 节模型验证（A 色散特性验证，式（17）（18）、表 VI；B 统计分布准确性验证，式（19）—（21）、图 9；C 准不变区间验证，图 10）；第 VI 节结论与未来工作；表 I—VI（逐格）；图 1—10 图注；参考文献 [1]—[58] 英文原书目。未完成/未包含：①逐句逐式与 PDF 的终校未做（页尾标注 qa_complete=false）；②图 1—10 图像本体未复制（站点不上传图片），仅中文图注与正文数值/趋势；③表 II 与表 V 已用 PyMuPDF 渲染原 PDF 第 6、10 页逐格核对，其余表按抽取文本逐格转录；④**原文疑点**：正文描述表 IV 时把 0.9 阈值下的 $T_{\mathrm{QI}}^{\max}$ 写作 317.07 ms，而表 IV 中该值为 314.07 ms（两者差 3 ms），已按表格数值转录并在状态段与表注中标注，未擅自改动；⑤参考文献 [9][39][44] 在抽取文本中被截断，已标注"（原文截断）"；⑥原文基金与作者单位信息按首页脚注整理，作者简介未收录；⑦骨架版本 "2026-10-21 推荐" 与 PDF v2 2026-06-09 不同，已按 PDF 更新并加注。**qa_complete=false。**


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
