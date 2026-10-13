---
layout: page
title: "高速公路车载信道 V-TDL 模型与 OTFS 性能评价——中文译文（校对中）"
permalink: /papers/translations/2026-10-13-vtdl-highway-otfs-2026/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [原论文 DOI](https://doi.org/10.1109/TCOMM.2026.3663522)

# 用于 OTFS 性能评估的高速公路车载信道模型

**英文原题：** A Highway Vehicular Channel Model for OTFS Performance Evaluation  
**作者：** A. Compagnoni、R. Tuninato、C. F. Chiasserini、R. Garello、A. Nordio、E. Viterbo  
**来源：** IEEE Transactions on Communications，74（2026），5074–5088，DOI: 10.1109/TCOMM.2026.3663522  
**原件：** 都灵理工大学机构知识库提供的 IEEE 作者接受稿（含知识库封面，PDF 共 16 页）。  

> 本页采用原文的章节编号、公式编号及图表编号，保留原始结果和模型定义。图像不重复存储。该稿仍需逐式核对与网页发布许可核验。

## 摘要

在车载通信中，准确描述真实世界的无线传播信道十分重要。为此，本文提出一种新的随机模型——**车载抽头延迟线（Vehicular-Tapped Delay-Line，V-TDL）**，能够准确刻画多径信道中各路径相关的增益、时延和多普勒频移的统计特性。V-TDL 使用成熟概率分布生成信道实例，支持不同交通状况和道路几何；通过真实几何场景仿真确定概率分布的参数，兼顾基于射线追踪方法的准确性和纯随机方法的低复杂度。

不同于现有模型，V-TDL 显式考虑传播路径间的相关性。分析显示，这种相关性是高速车载环境的固有特征，忽略它会显著高估信道分集度和系统性能。我们将模型与现有方案比较，以评价正交时频空间（OTFS）和正交频分复用（OFDM）两种调制的性能。结果表明，传统 3GPP EVA 等模型不能充分反映交通密度和道路几何改变信道分集度、进而改变 OTFS 和 OFDM 性能的现象；V-TDL 则能捕获这种变化。虽然路径相关性会削弱 OTFS 的性能优势，但 OTFS 在全部考察的车载环境下仍始终优于 OFDM，进一步支持其在高速移动通信中的适用性。

**索引词：** 信道建模、OTFS、5G/6G、网联汽车、移动性。

## I. 引言

无线网络正在向极高移动性场景提供连接能力 [1]–[4]。典型例子是网联汽车：自动驾驶、安全服务等关键应用依赖稳定无线覆盖和可靠的数据传输 [5]、[6]。无线信道知识因而对系统设计和连接配置至关重要，它会影响性能评估，也会影响接入节点的放置、发射功率和调制方案选择等决策。然而，对高速移动终端实时求解电磁方程过于复杂，因此实际设计中通常使用随机信道模型近似无线传播 [7]。

随机模型通常将信道表示为具有固定抽头数和指定功率时延分布的抽头延迟线（Tapped Delay-Line，TDL）。3GPP [8] 定义了适用于低、中、高时延扩展环境的不同版本。扩展车载 A（Extended Vehicular A，EVA）模型用于城市和郊区车辆场景 [9]，但无法刻画不同交通条件的影响，也忽略了传播路径间的相关性；这种相关性已经被证明在高速车载场景中普遍存在，而且会显著影响分集增益和系统性能 [10]。

另一类方案是利用电磁和光学理论的射线追踪 [11]–[13]。其传播刻画准确，但计算量大，且高度依赖具体场景，不适合在大量道路几何及交通情况下做系统设计与性能评估。因此需要既准确又灵活的车载信道模型。

高速移动场景的信道模型对于 OTFS、OFDM 等调制性能评价同样重要。OTFS 近来在高多径、高多普勒车载环境中展现良好表现，而 OFDM 在这种环境中容易因多普勒造成严重载波间干扰（Inter-Carrier Interference，ICI）[14]–[23]。OTFS 在时延—多普勒（Delay-Doppler）域工作，可利用高速移动信道在该域的稀疏性。然而 OTFS 相比 OFDM 在真实车载环境中究竟有多大优势，仍不十分清楚，因为许多研究主要依赖简化 EVA 模型评价。

本文提出专为车载通信设计的 V-TDL 模型：（i）精度接近基于射线追踪的方法；（ii）像 EVA 等 TDL 模型一样易于实现；（iii）支持调整道路几何与交通强度。借助对真实高速移动信道的统计刻画，V-TDL 能用于更公平地比较 OTFS 和 OFDM。

本文主要贡献如下。

**统计分析。** 从基于几何的随机 V-CORE 模型 [10] 出发，该模型利用反射车辆的双基地雷达散射截面积（Bistatic Radar Cross Section，RCS）刻画信道增益。在多种典型高速公路几何和交通密度下对时延、多普勒频移及反射增益取样分析。发现高速车载多径间存在较强相关性，而 EVA 等模型没有考虑它，导致对 OTFS 性能的高估。

**V-TDL 建模。** 将 V-CORE 的统计分析结果转化为可灵活采样的 V-TDL，包括路径数量、时延、多普勒频移以及路径复信道系数的分布；模型可用于不同交通和道路条件。

**OTFS 与 OFDM 的比较。** 在 EVA 与 V-TDL 下评价两种调制。V-TDL 能准确表达路径相关性及交通强度对分集度的影响：随着交通密度增加，OTFS 能受益于更强分集，而 OFDM 却因为 ICI 增大受到损害。EVA 虽然高估 OTFS 性能，但 V-TDL 下 OTFS 仍优于 OFDM。

**V-TDL 与 V-CORE 的比较。** 在相同交通条件下，低复杂度 V-TDL 的性能结果与几何随机 V-CORE 接近。V-TDL 不必显式在道路上生成车辆，也不必逐反射体计算双基地 RCS 和传播路径，只需从简单概率分布采样即可产生信道实例，因此更便于实现和广泛场景测试。

**分集与带宽。** 研究传播路径相关程度及系统带宽对接收机有效信道分集和 OTFS 性能的影响。

论文其余部分依次为：第 II 节相关工作；第 III 节符号、时变多径和 V-CORE；第 IV 节统计分析；第 V 节 V-TDL 模型；第 VI 节仿真；第 VII 节结论。

## II. 相关工作

本文与车载信道测量及建模、车载 OTFS 性能评价两个方向相关。

**车载信道表征与建模。** 文献 [24] 在瑞典隆德进行 V2V 实测，获得时延扩展、功率时延分布及延迟—多普勒谱。这类真实测量通常可靠，但采集成本高，且结果针对特定环境。更灵活的办法是射线发射（Ray Launching，RL）和射线追踪（Ray Tracing，RT）模型。[25] 利用 RL 比较车路通信中的 OTFS/OFDM；[26] 基于 RT 分析高流量城市 V2V 信道的时延扩展和路径损耗；[27] 研究城市交叉路口，说明 RT 功率时延谱与真实探测测量高度相关。虽然 RT 复杂度较高，RL 相对低成本，却通常牺牲一定真实性。

另一条路线是基于几何的随机信道模型（Geometry-Based Stochastic Channel Model，GBSCM）：按统计分布放置反射体，叠加各反射体射线追踪得到的传播响应。[28] 给出 MIMO V2V 的 GBSCM；[29] 采用 ambit 过程理论提高仿真效率和多径传播空间一致性；[30] 利用朗伯辐射模式建模车载可见光通信中的直射路径与另一车辆的反射路径；[31] 以正弦和模型仿真 V2V Rician 衰落，其中移动汽车用双球模型表示，静态环境用椭圆柱模型表示；[32] 在时延—多普勒域建模地面、移动车辆、静态反射体及漫散射分量。

作者先前提出的 V-CORE [10] 是专门针对车载环境的 GBSCM，区别在于使用多辆反射汽车的双基地 RCS 来获得场景特定的实际传播增益。GBSCM 相比纯射线法灵活且较便宜，但仍比纯随机模型复杂，不够便于频繁系统级仿真。

**车载环境中的 OTFS 性能。** 论文 [33] 综述 OTFS 及其变体。[34] 利用车辆交叉路口的毫米波测量分析时延—多普勒稀疏性；[35] 基于维也纳城市车载信道测量评价 OTFS，证明丰富多径下优于 OFDM；[36] 在地下停车场毫米波测量中比较 OTFS 信道估计方法；[37] 面向高速移动 MIMO-OTFS 设计低复杂度零迫（ZF）和最小均方误差（MMSE）接收机；[38] 提出车载 IoT 中的嵌入式时延—多普勒域导频设计以提高频谱效率；[39] 研究上行多点协作车载通信中的 OTFS 稀疏码多址（SCMA），通过正负多普勒分量提高分集度。

**创新性。** 本文着力解决此前模型不能兼顾真实性、灵活性、低复杂度及路径相关性的问题，以更可信地评价 OTFS 相对 OFDM 的优势。

## III. 预备知识

### A. 符号

矩阵 \(A\) 的转置、共轭转置分别记 \(A^\top,A^\dagger\)，其第 \((m,n)\) 元素为 \(A(m,n)\)。\(\operatorname{vec}(A)\) 为按列向量化，\(\operatorname{vec}^{-1}_{M,N}(a)\) 是将向量恢复为 \(M\times N\) 矩阵。归一化 \(N\) 点离散傅里叶变换（DFT）矩阵记 \(F_N\)，元素为 \(F_N(i,k)=e^{-j2\pi ik/N}/\sqrt N\)。概率和期望分别记 \(\Pr(X=x)\)、\(\mathbb E[\cdot]\)；\(\lfloor\cdot\rceil\) 表示取最近整数，\(|a_1-a_2|\) 为欧氏距离。

### B. 时变多径信道与 OTFS

在车载通信中，多个散射体相对于接收机移动，产生具有不同传播时延与多普勒频移的回波。假定有 \(P\) 条路径，第 \(i\) 条路径由复系数 \(h_i\)、时延 \(\tau_i\) 及多普勒频移 \(\nu_i\) 描述，则时延—多普勒域信道响应为 [40]：

$$
h(\tau,\nu)=\sum_{i=1}^P
h_i\,\delta(\tau-\tau_i)\delta(\nu-\nu_i). \tag{1}
$$

这种表示适于高移动多径衰落，因为时延、多普勒频移和增益直接给出信道的全部路径参数。接收机周围通常只有有限条显著多径，因此在时延—多普勒域天然稀疏。它与传统时延—时间域和频率—时间域表示并不矛盾：前者沿时间轴 Fourier 变换可得到该表示，后者经二维辛傅里叶变换也可以转到时延—多普勒域 [23]。

在 OTFS 中，符号排列为 \(M\times N\) 的时延—多普勒网格，\(M\) 是时延单元数，\(N\) 是多普勒单元数，得到 \(X_{\mathrm{dd}}\in\mathbb C^{M\times N}\)。通过逆离散 Zak 变换（Inverse Discrete Zak Transform，IDZT）得到发射时域向量：

$$
s=\operatorname{IDZT}\{X_{\mathrm{dd}}\}
=\operatorname{vec}(X_{\mathrm{dd}}F_N^\dagger). \tag{2}
$$

接收采样向量 \(r\) 被恢复为时延—时间域信号：

$$
Y_{\mathrm{dt}}=\operatorname{vec}^{-1}_{M,N}(r)
\in\mathbb C^{M\times N}. \tag{3}
$$

对于零填充（Zero Padding，ZP）OTFS 与最大比合并（Maximum Ratio Combining，MRC）检测，时延—时间域可以取得性能与复杂度的有效折中 [41]。

对于式（1）中具有不同多普勒频移的路径，传统 OFDM 会受到 ICI。相对地，OTFS 能在时延—多普勒域把可分辨的不同传播路径相干合并，从而利用其多径分集。

### C. V-CORE 信道模型

V-CORE 是专门面向车载场景的几何随机模型 [10]。考虑高速公路中间布设的无线接入点（Point of Access，PoA），它向一辆接收汽车（RX）下行发送信号，周围汽车作为反射体产生多径。目标是刻画车辆反射引起的时延、多普勒频移和增益。

车道编号 \(\ell=1,\ldots,N_L\)，每车道车辆以速率为 \(\rho_\ell\) 的 Poisson 点到达过程进入。车道 1 为最外侧慢车道，车道 \(N_L\) 为最内侧快车道。车道 \(\ell\) 上的车速服从均匀分布 \(\mathcal U(v_\ell^{\min},v_\ell^{\max})\)。

**表 I：V-CORE 默认参数。**

| 参数 | 数值 |
|---|---|
| 车道数 \(N_L\) | 3 |
| 各车道最低速度 | 70、100、130 km/h |
| 各车道最高速度 | 100、130、160 km/h |
| 车辆长度 | 16.0、6.0、4.4 m |
| 平均车间距 \(\mu_d\) | 80 m |
| 安全间距 \(D_s\) | 20 m |
| 车道宽度 \(W\) | 4 m |
| 对向车流间隔 \(D_t\) | 2 m |
| PoA–RX 距离最小值 | 50 m |
| PoA–RX 距离最大值 | 700 m |

图 1 展示相应道路场景及由反射汽车产生的一条非视距路径。以 \(i=1\) 表示直射视距（LoS）路径，其余 \(i=2,\ldots,P\) 为非视距（nLoS）反射路径。LoS 时延和多普勒为

$$
\tau_1=\frac{d_1}{c},\qquad
\nu_1=\frac1{\lambda_c}v_1^\top
\frac{p_A-p_1}{d_1}. \tag{4}
$$

其中 \(d_1=|p_A-p_1|\) 是 PoA 与接收汽车的距离，位置向量为 \(p_A,p_1\)，接收车速度向量为 \(v_1\)，波长为 \(\lambda_c=c/f_c\)，\(f_c\) 为载频、\(c\) 为光速。

对于反射路径 \(i\ge2\)，考虑以 PoA 为发射机、RX 为接收机、其他汽车为反射目标的双基地雷达模型。反射路径总距离为 \(d_i=|p_A-p_i|+|p_i-p_1|\)，时延 \(\tau_i=d_i/c\)。其多普勒由反射目标相对于发射机、以及反射目标相对于接收机的运动共同决定：

$$
\nu_i=\frac1{\lambda_c}
\left[
v_i^\top\frac{p_A-p_i}{|p_A-p_i|}
+(v_1-v_i)^\top\frac{p_i-p_1}{|p_i-p_1|}
\right],\quad i=2,\ldots,P. \tag{5}
$$

\(v_i\) 是反射车辆速度向量。为描述非视距信号衰减，引入反射车辆双基地雷达散射截面积 \(\psi_i=f(\theta_i^{\mathrm{PoA}},\theta_i^{\mathrm{RX}},f_c)\)，表示其截获并向接收机重辐射的等效面积（单位平方米），取决于载频及两端入射／出射方向。复路径系数为 [44]：

$$
h_i=\frac{\lambda_ce^{j\phi_i}}
{(4\pi)^2|p_A-p_i|\,|p_i-p_1|}
\sqrt{4\pi\psi_iG_AG_R}, \tag{6}
$$

其中 \(G_A,G_R\) 为两端天线增益，随机相位 \(\phi_i\sim\mathcal U(0,2\pi)\)。LoS 系数设 \(h_1\sim\mathcal{CN}(0,1)\)，发射功率 \(P_{\rm Tx}\) 调整以保证 0 dB 的 LoS 路径损耗参考 [10]。

V-CORE 由道路几何、车辆运动和双基地 RCS 生成真实性较高的 \((\tau_i,\nu_i,h_i)\)。接下来的统计分析将揭示多径相关性，并据此构建低复杂度 V-TDL。

**图 1：道路场景及反射车辆产生的 nLoS 路径（原文正文第 4 页）。** 图中接入点和接收汽车由绿色虚线反射链路连接；车辆分布体现随机交通场景。[原文 DOI](https://doi.org/10.1109/TCOMM.2026.3663522)

## IV. V-CORE 的统计分析

为构建 V-TDL，首先在不同交通强度及道路几何下，收集 V-CORE 每条路径的时延、多普勒频移与信道增益样本，估计其分布及相关性。

**1）平均路径数。** 对表 I 的车辆场景执行大量 V-CORE 仿真，得到平均路径数 \(\mathbb E[P]\)。四舍五入后的结果为 28 条。为了与固定抽头数的 TDL 模型保持一致，只保留生成路径数恰好等于该平均整数值的场景统计样本。此后用 \(P=\lfloor\mathbb E[P]\rceil\) 表示固定路径数。所有路径按时延从小到大排序，第 \(P\) 条具有最大时延。

**2）各路径平均时延。** 图 2 分别给出 V-CORE 与 EVA 的平均路径时延；由于接收机假设与 LoS 路径同步，所有路径时延都已减去 LoS 时延。V-CORE 中前约 16 条路径的时延几乎相同：这些反射汽车离接收机或 PoA 很近，反射绕行距离极小，时延接近 LoS 的零相对时延；短距离路径通常也有较高能量。第 17 条之后时延近似指数式增大，第 28 条达到约 4.5 微秒。相比之下，EVA 几乎每条路径的时延都能明显区分，可能高估真实车载场景的可分辨分集度。

图 3 说明原因：以 PoA 和 RX 为焦点的同一椭圆对应相同总传播距离，因此位于同一时延单元的多辆汽车不能通过时延区分。图中使用 \(M=512,\Delta f=30\) kHz，路径长度分辨率 \(c/(M\Delta f)\approx19.5\) m，小于同车道安全车距，但相邻车道汽车间距可能更小，因此其反射路径仍会映射到同一个时延单元。图中的前两个椭圆包含许多汽车，验证了短延迟反射路径的相似性。位于同一椭圆附近的汽车相对于 PoA 和 RX 还形成类似的传播方向，使其多普勒也容易相关（见下文）。

**3）多普勒分布。** 图 4 给出第一条 nLoS（路径 2）的估计多普勒分布，其中蓝色表示 PoA 位于道路中心，黄色表示 PoA 位于路边。两者形状相似，仅方差略有差异。估计结果可由**两个等权高斯分布的混合**很好地逼近。其余反射路径也有类似双峰形状。这与 EVA 假设的 Jakes 多普勒谱不同。高速公路不像城市道路存在大量墙面及建筑反射，主要散射体是其他车辆，传播角度不可能在各方向均匀分布，故 Jakes 假设不适合。

双峰来源于相对移动方向：右侧正频移高斯代表 RX 朝 PoA 靠近，左侧负频移代表 RX 远离 PoA。两种情形出现概率各为 0.5。尽管模型考虑双向交通，单向车流仿真也验证这种双峰分布依然存在，因为在不同场景实现中 RX 仍可能向 PoA 接近或远离。

**4）信道增益分布。** 图 5 展示代表性 nLoS（路径 2）的系数模值直方图，形状接近 Rayleigh 分布，因此复系数可用圆对称复高斯模型表示。模值具有 1 的上界，是因为 V-CORE 将 LoS 自由空间路径损耗归一化至 0 dB（1），反射路径由 RCS 导出的传播功率不超过对应的自由空间传播界。但这一上界并不意味着每次信道实现中 LoS 系数模值必大于任意反射路径：因为 \(h_1\sim\mathcal{CN}(0,1)\)，LoS 的瞬时模值本身也是 Rayleigh 随机变量，完全可能很小。

**5）路径间相关性。** 以往 TDL 模型通常假定各路径互相独立。但在高速公路中，反射汽车空间位置接近时，路径参数可能高度相关，尤其是短时延分量。因此作者分别对多普勒频移和信道增益样本计算 Pearson 相关系数矩阵。默认场景 \(P=28\) 下，图 6 显示前约 16 条路径的多普勒高度相关；仅选择 RX 接近 PoA 的场景估计相关矩阵，选择远离 PoA 的场景也得到相同矩阵。[45] 的车载测量也指出，邻近时延单元的多普勒分布形状非常相似。

图 7 给出不同路径增益的相关系数。前约 10 条有不可忽略的相关性，但其程度显著弱于多普勒相关。由此可知，高速移动信道中的多普勒路径相关是减少有效分集的主要因素；所有路径独立的 EVA 等模型不能充分代表高速公路场景。

**表 II：EVA 与 V-CORE 的统计特性比较。**

| 特征 | EVA | V-CORE |
|---|---|---|
| 多普勒分布 | Jakes | 高斯（结合方向产生双峰） |
| 系数模值分布 | Rayleigh | Rayleigh |
| 多普勒路径相关 | 不包含 | 高 |
| 路径增益相关 | 不包含 | 低 |

**图 2–7：** 图 2 对比 V-CORE/EVA 路径平均时延；图 3 用同焦点椭圆表示接收端相同的时延单元；图 4 为多普勒概率密度；图 5 为反射路径模值直方图及 Rayleigh 拟合；图 6 和图 7 分别是多普勒与信道增益的 Pearson 相关矩阵。[原文 DOI](https://doi.org/10.1109/TCOMM.2026.3663522)

## V. V-TDL 模型

本节正式给出为高速车载环境设计的 Vehicular-Tapped Delay-Line（V-TDL）模型。其基础是第 IV 节对 V-CORE 几何随机模型的统计分析。目标是同时取得接近几何模型的准确性和抽头随机模型的简便性。

V-TDL 令不同路径的时延保持固定，而多普勒频移由能够体现多径相关性的多元高斯分布生成。复信道系数也由高斯分布产生。下面说明这些分布如何依赖于道路参数和交通条件，并给出可直接仿真的模型形式。

### A. 从 V-CORE 提取统计参数

使用 V-CORE 在 27 组设置下收集路径时延、多普勒与信道系数样本。这些设置是三个输入参数各取三个值形成的所有组合：载波频率 \(f_c\)、平均车间距 \(\mu_d\)、车道数 \(N_L\)。

**表 III：用于拟合 V-TDL 的 V-CORE 输入。**

| \(f_c\) | \(\mu_d\) | \(N_L\) |
|---|---|---|
| 2 GHz | 30 m | 1 |
| 3 GHz | 110 m | 3 |
| 4 GHz | 190 m | 5 |

对每个三元组 \((f_c,\mu_d,N_L)\)，估计各路径时延、多普勒与增益的经验分布、均值和协方差，再拟合这些统计量对参数三元组的函数关系。最终 V-TDL 能够根据任意输入三元组产生信道实例，并可与相同交通条件下 V-CORE 统计结果比较验证。

在数据收集时，全部设置的车速范围为 70–160 km/h。对于车道 \(\ell\)，随机车速服从 \(\mathcal U(v_\ell^{(\min)},v_\ell^{(\max)})\)，其中

$$
v_\ell^{(\min)}=
\begin{cases}
70\ {\rm km/h},&N_L=1,\\
70+60\frac{\ell-1}{N_L-1}\ {\rm km/h},&N_L>1;
\end{cases}\tag{7}
$$

$$
v_\ell^{(\max)}=
\begin{cases}
160\ {\rm km/h},&N_L=1,\\
v_\ell^{(\min)}+30\ {\rm km/h},&N_L>1.
\end{cases}\tag{8}
$$

车辆长度影响双基地 RCS，因此还模拟不同长度车辆。令可选长度集合 \(\Delta=\{16.0,6.0,4.4\}\ {\rm m}\)，第 \(\ell\) 车道车辆的长度 \(L_\ell\) 从该集合抽取。最外侧慢车道 \(\ell=1\) 的分布为：

$$
\Pr(L_\ell=\Delta(i))=
\begin{cases}
0.2N_L,&i=1,\\
0.5(1-0.2N_L),&i\in\{2,3\};
\end{cases}\qquad \ell=1. \tag{9}
$$

其他车道不允许最大长度（大型卡车）车辆：

$$
\Pr(L_\ell=\Delta(i))=
\begin{cases}
0,&i=1,\\
0.5,&i\in\{2,3\};
\end{cases}\qquad\ell>1. \tag{10}
$$

这样全体车辆中平均有 20% 为最长的大型卡车，且它们只能在慢车道行驶。其他道路参数与表 I 一致。得到统计样本后，按以下步骤构建 V-TDL。

### B. 多普勒频移建模

为简化推导，先考虑 RX 朝 PoA 接近的情况；远离 PoA 时得到对称结果。记 \(\nu^+\in\mathbb R^P\) 为多普勒频移向量，其中第 \(p\) 个分量 \(\nu^+(p)\) 对应路径 \(p\)。第 IV 节表明，V-CORE 的多普勒向量可以用多元高斯近似：

$$
\nu^+\sim\mathcal N(\mu_\nu,\Sigma_\nu). \tag{11}
$$

\(\mu_\nu\in\mathbb R^P\) 为均值向量，\(\Sigma_\nu\in\mathbb R^{P\times P}\) 为协方差矩阵。模型需要为任意 \((f_c,\mu_d,N_L)\) 构造它们。

**1）平均多普勒。** 首先看 LoS 路径均值 \(\mu_\nu(1)\)。图 8 的实线显示，它与 \(f_c\) 基本线性，且在载频为零时应为零。因此设 \(\mu_\nu(1)=af_c\)，其中斜率 \(a\) 随交通条件变化：

$$
a=p_1+p_2N_L+p_3\mu_d+p_4N_L^2+
p_5N_L\mu_d+p_6\mu_d^2. \tag{12}
$$

拟合系数为：

$$
\begin{aligned}
p_1&=3.063\times10^{-3},&
p_2&=1.180\times10^{-2},\\
p_3&=7.214\times10^{-4},&
p_4&=-1.576\times10^{-3},\\
p_5&=1.227\times10^{-5},&
p_6&=-1.977\times10^{-6}.
\end{aligned}\tag{13}
$$

式（13）只在约定单位下使用：\(f_c\) 以 GHz 计，\(\mu_d\) 以 m 计，\(\mu_\nu(1)\) 以 kHz 计。图 8 虚线与实测估计平均值较好吻合。

图 9–11 画出 \(N_L=1,3,5\) 的 27 组场景、不同路径的平均多普勒。若分别为每个场景单独拟合，会使模型过于复杂。为此作者做两个近似：所有场景中最后第 \(P\) 条路径的平均多普勒设为零；所有场景在第 1 条路径附近的平均曲线导数近似零。图中多数曲线支持这两点。

令路径索引 \(p\) 暂时从离散整数放松为连续变量，使用特殊的四次多项式：

$$
f_\nu(p)=\alpha_1p^4+\alpha_2p^2+\alpha_3. \tag{14}
$$

要求满足：

$$
f_\nu(1)=\mu_\nu(1),\quad
f_\nu(P)=0,\quad
\left.\frac{df_\nu}{dp}\right|_{p=1}=0. \tag{15}
$$

展开为线性方程组：

$$
\begin{cases}
\alpha_1+\alpha_2+\alpha_3=af_c,\\
\alpha_1P^4+\alpha_2P^2+\alpha_3=0,\\
4\alpha_1+2\alpha_2=0.
\end{cases}\tag{16}
$$

当 \(P>1\) 时唯一解为：

$$
\begin{aligned}
\alpha_1&=-\frac{af_c}{(P^2-1)^2},\\
\alpha_2&=\frac{2af_c}{(P^2-1)^2},\\
\alpha_3&=\frac{af_cP^2(P^2-2)}{(P^2-1)^2}.
\end{aligned}\tag{17}
$$

V-TDL 由此定义第 \(i\) 条路径的平均多普勒：

$$
\mu_\nu(i)=f_\nu(i),\quad i=1,\ldots,P. \tag{18}
$$

图 9–11 黑色虚线表示拟合值；相较直接逐场景拟合，它对某些曲线的局部准确性较低，但只需要输入 \((f_c,\mu_d,N_L)\) 就能生成全路径均值，并保持足够准确性。

**2）多普勒协方差。** 先为所有对角元素赋相同方差，采用“\(3\sigma\)”规则。作者强调这一假设虽然简单，但系统性能最受影响的是不同路径之间的相关性，而非每条路径方差的细节。根据正态分布：

$$
\Pr\big(\mu_\nu(1)-3\sigma_\nu
\le\nu^+(1)<\mu_\nu(1)+3\sigma_\nu\big)
\approx0.9973. \tag{19}
$$

因为 \(\mu_\nu(1)>0\)，取最大多普勒 \(\nu_{\max}\) 满足：

$$
\sigma_\nu=\frac{\nu_{\max}-\mu_\nu(1)}3. \tag{20}
$$

\(\nu_{\max}=v_{\max}/\lambda_c\)，实验为符合高速公路速度限制统一令 \(v_{\max}=160\) km/h。

图 12 统计各路径多普勒与 LoS 路径多普勒的 Pearson 相关系数。虽然只展示 \(N_L=3\) 的设置，却能代表整体趋势。它可用一个代数 Sigmoid 函数描述：

$$
g_\nu(p)=\frac12-\frac{p-\beta_2}
{\sqrt{\beta_1+4(p-\beta_2)^2}}. \tag{21}
$$

在边界施加 \(g_\nu(1)=0.99\)、\(g_\nu(P)=0.01\)：

$$
g_\nu(1)=0.99,\qquad g_\nu(P)=0.01, \tag{22}
$$

得

$$
\beta_1=\frac{99(P-1)^2}{2401},
\qquad\beta_2=\frac{P+1}{2}. \tag{23}
$$

图 12 中黑色虚线与估计相关系数接近。尚需定义两条非 LoS 路径 \(i,j>1\) 的相关性。从图 6 的高相关黄色方形结构可知，可以把它们的相关系数近似成各自与 LoS 相关系数的较小值。这符合物理解释：路径间相关主要因为各自与 LoS 分量高度相关，所以设：

$$
\Sigma_\nu(i,j)=
\begin{cases}
\sigma_\nu^2,&i=j,\\
\sigma_\nu^2g_\nu(j),&i=1,\ j>1,\\
\sigma_\nu^2g_\nu(i),&i>1,\ j=1,\\
\sigma_\nu^2\min\{g_\nu(i),g_\nu(j)\},&\text{其他}.
\end{cases}\tag{24}
$$

式中 \(i,j=1,\ldots,P\)，\(g_\nu\) 由式（21）、（23）得到。

最后，先由式（11）生成朝向 PoA 的多普勒向量 \(\nu^+\)，再以对称随机符号生成最终向量：

$$
\nu=(2X-1)\nu^+,\qquad X\sim\operatorname{Bernoulli}(1/2). \tag{25}
$$

这样可表示图 4 的双峰分布：正、负两组高斯以相同概率出现。

**图 8–12：** 图 8 比较 LoS 平均多普勒的估计与拟合；图 9、10、11 对应 \(N_L=1,3,5\) 不同路径的平均多普勒曲线；图 12 比较不同路径与 LoS 的相关系数及 Sigmoid 拟合。[查看原文 DOI](https://doi.org/10.1109/TCOMM.2026.3663522)

### C. 路径数建模

下一步拟合平均路径数 \(\mathbb E[P]\) 与交通输入三元组的关系。图 13 展示平均路径数随车间距 \(\mu_d\) 变化的趋势。因为载频对路径数量的影响很小，分析时固定 \(f_c=3\) GHz。采用关于 \(\mu_d\) 的一次多项式：

$$
\mathbb E[P]=\gamma_1\mu_d+\gamma_2, \tag{26}
$$

其中

$$
\begin{aligned}
\gamma_1&=0.0070N_L^2-0.0563N_L-0.0320,\\
\gamma_2&=-1.6068N_L^2+14.1875N_L+10.3568.
\end{aligned}\tag{27}
$$

图 13 的黑色虚线表明，模型能较好逼近不同交通密度下的平均路径数。得到期望后令 \(P=\lfloor\mathbb E[P]\rceil\)，即将路径数量固定在四舍五入的均值。

**图 13：** \(f_c=3\) GHz 时，不同车道数量的平均路径数与车间距关系，实线为 V-CORE 经验统计、黑色虚线为 V-TDL 拟合。

### D. 平均时延建模

V-TDL 为每条路径分配固定时延。图 14 展示不同交通场景中各路径平均时延，近似满足幂律趋势，因此定义：

$$
t_\tau(p)=\epsilon_1(p-1)^{\epsilon_2},
\qquad p=1,\ldots,P. \tag{28}
$$

为确定两个参数，使用末路径时延及该处的导数作为两个约束：

$$
t_\tau(P)=\tau_{\max},\qquad
\left.\frac{dt_\tau}{dp}\right|_{p=P}
=\bar D\frac{\tau_{\max}}{P}, \tag{29}
$$

其中 \(\tau_{\max}\) 是时延扩展，也就是按时延排序后的最大相对时延；\(\bar D\) 为从全部 27 个场景经验估计的归一化平均导数：

$$
\bar D:=\mathbb E\left[
\frac{P}{\tau_{\max}}
\left.\frac{dt_\tau}{dp}\right|_{p=P}
\right]=7.7601. \tag{30}
$$

代入可得到：

$$
\begin{cases}
\epsilon_1(P-1)^{\epsilon_2}=\tau_{\max},\\
\epsilon_1\epsilon_2(P-1)^{\epsilon_2-1}
=\bar D\tau_{\max}/P.
\end{cases}\tag{31}
$$

从而

$$
\begin{aligned}
\epsilon_1&=
\exp\left[
\frac{P\ln\tau_{\max}+\bar D(1-P)\ln(P-1)}{P}
\right],\\
\epsilon_2&=\frac{\bar D(P-1)}P .
\end{aligned}\tag{32}
$$

式（32）中的 \(\tau_{\max}\) 要以 1 ns 为基准归一化，以确保对数自变量无量纲。最终设各路径时延：

$$
\tau_i=t_\tau(i),\quad i=1,\ldots,P. \tag{33}
$$

\(t_\tau\) 由式（28）、（29）计算；\(\tau_{\max}\) 可根据传播场景选定，典型环境参考 [46]。图 14 的虚线表明幂律模型能较准确拟合不同情形下的经验平均时延。

**图 14：** \(N_L=3\) 的不同场景下，各路径平均时延与 V-TDL 幂律拟合曲线。

### E. 路径平均功率建模

在 LoS 功率参考被设为 0 dB 的前提下，拟合各 nLoS 路径的平均功率：

$$
\mathbb E[|h_i|^2],\quad i=2,\ldots,P. \tag{34}
$$

首先研究第 2 条路径的平均功率与载频、车间距的关系。图 15 展示不同 \(f_c,\mu_d\) 下的估计结果；由于车道数对功率分布影响较小，实验固定 \(N_L=3\)。可以使用载频的一次关系：

$$
\mathbb E[|h_2|^2]=bf_c+q, \tag{35}
$$

其中

$$
\begin{aligned}
b&=-9.60\times10^{-7}\mu_d^2
-2.03\times10^{-5}\mu_d+9.54\times10^{-2},\\
q&=8.10\times10^{-7}\mu_d^2
+3.45\times10^{-4}\mu_d-1.20\times10^{-1}.
\end{aligned}\tag{36}
$$

图 15 黑虚线表明拟合较准确。接下来扩展到全部路径。图 16 的经验平均功率曲线可以由路径索引的三次多项式拟合：

$$
J(p)=z_1p^3+z_2p^2+z_3p+z_4,\qquad p=2,\ldots,P. \tag{37}
$$

为确定四个多项式系数，施加：

$$
\begin{cases}
J(2)=\mathbb E[|h_2|^2],\\
J(P)=c_0,\\
J(p_0)=\mathbb E[|h_2|^2]/d_0,\\
\left.\frac{dJ}{dp}\right|_{p=p_0}=0.
\end{cases}\tag{38}
$$

这里 \(c_0=0.0032\)，约相当于 −25 dB，表示信道模型中相对于 LoS 的典型最弱可检测路径功率阈值 [46]。公路测量 [24] 也观察到功率时延谱在 LoS 相对 −25 dB 之上。为了最小化经验与模型曲线之间的均方误差，取最接近最优值的有理参数 \(p_0=\frac{11}{30}(P+2)\)、\(d_0=6\)。代入式（38）可求出四个系数 \(z_1,z_2,z_3,z_4\)，适用于 \(P>2\)；具体闭式式（39）见下文。

定义

$$
E_0=\mathbb E[|h_2|^2],\qquad
D_0=(P-2)(P-p_0)^2(p_0-2)^2.
$$

则原论文式（39）为：

$$
\begin{aligned}
z_1={}&\frac{(1-d_0)E_0(P-p_0)^2+
(d_0c_0-E_0)(p_0-2)^2}{d_0D_0},\\
z_2={}&\frac{(d_0-1)E_0P^3
-3(d_0-1)E_0Pp_0^2
+(2d_0E_0-2d_0c_0)p_0^3}{d_0D_0}\\
&+\frac{(6d_0c_0-6E_0)p_0^2+
8(E_0-d_0c_0)}{d_0D_0},\\
z_3={}&\frac{2(1-d_0)E_0p_0P^3
+3(d_0-1)E_0p_0^2P^2}{d_0D_0}\\
&+\frac{(-d_0E_0+d_0c_0)p_0^4
+12(E_0-d_0c_0)p_0^2
-16(E_0-d_0c_0)p_0}{d_0D_0},\\
z_4={}&\frac{E_0P^3(d_0p_0^2-4p_0+4)
+E_0P^2(-2d_0p_0^3+6p_0^2-8)}{d_0D_0}\\
&+\frac{E_0P(d_0p_0^4-12p_0^2+16p_0)
-2d_0c_0p_0^2(p_0-2)^2}{d_0D_0}.
\end{aligned}\tag{39}
$$

据此，各反射路径的平均功率用 dB 表示为：

$$
\mathbb E[|h_i|^2]_{\rm dB}
=10\log_{10}J(i),\quad i=2,\ldots,P, \tag{40}
$$

而 \(\mathbb E[|h_1|^2]_{\rm dB}=0\) dB。图 16 的黑色虚线是 V-TDL 得到的平均路径功率（以线性尺度作图），与 V-CORE 经验结果相近。

**图 15–16：** 图 15 为第 2 条路径平均功率随载频变化及拟合，图 16 为不同场景中全路径的平均功率曲线与模型拟合。

### F. 生成信道实例

当全部参数确定后，V-TDL 可以针对每个待发送帧独立生成一个新信道实例。每个实例包括 \(P\) 条路径，各路径有时延 \(\tau_i\)、多普勒 \(\nu_i\)、复信道系数 \(h_i\)。

路径数量与时延按第 V-C、V-D 节固定计算。多普勒频移从第 V-B 节的多元分布抽样。复信道系数采用圆对称复高斯分布：

$$
h_i\sim\mathcal{CN}(0,\mathbb E[|h_i|^2]),
$$

方差按第 V-E 节生成。不同路径的复信道系数被视为独立。图 7 表明实际增益只有前几条路径存在相对较低的相关性，因此这一简化在本文的精度与复杂度权衡中有经验依据。请注意，这与**多普勒仍然保持较强相关**并不矛盾：模型对多普勒和增益采用不同的联合统计假设。

### G. 复杂度

V-TDL 的计算复杂度远低于 V-CORE，因为不需模拟道路车辆的具体位置和各反射体的双基地 RCS。与 EVA 等简单随机 TDL 模型相比，V-TDL 的主要额外成本来自利用预计算的协方差矩阵 Cholesky 分解生成相关多普勒，生成阶段的开销大致与路径数的平方成正比。但通常信道模型中的显著路径数很少，因此增加的计算负担较轻，相较整体信道仿真可视为小幅开销。

## VI. 数值结果

本节首先在 V-TDL、V-CORE 和 EVA 下比较 OFDM 与 OTFS 的性能（VI-A）；随后研究不同路径相关程度对 OTFS 的影响（VI-B）；最后分析系统带宽改变有效时延分辨率及信道分集、进而改变 OTFS 性能的规律（VI-C）。

### A. OTFS 与 OFDM

我们将两种调制分别置于三种信道模型下：（i）提出的 V-TDL；（ii）基于几何的随机 V-CORE；（iii）EVA。V-CORE 和 V-TDL 均采用两个不同交通场景 G1 和 G2，其中 G2 由于车辆密度更高、车道数量更多，环境更复杂。EVA 模型只需要最高车速，设置为 160 km/h。

**表 IV：V-CORE 与 V-TDL 测试场景参数。**

| 模型与场景 | 参数 | 取值 |
|---|---|---|
| V-CORE G1 | 全部参数 | 同表 I |
| V-CORE G2 | 车道数 \(N_L\) | 5 |
| V-CORE G2 | 各车道最低车速 | 70、85、100、115、130 km/h |
| V-CORE G2 | 各车道最高车速 | 100、115、130、145、160 km/h |
| V-CORE G2 | 各车道车辆长度 | 16.0、6.0、6.0、6.0、4.4 m |
| V-CORE G2 | 平均车间距 \(\mu_d\) | 40 m |
| V-CORE G2 | 安全车距 \(D_s\) | 15 m |
| V-TDL G1 | \(N_L,\mu_d,\tau_{\max},v_{\max}\) | 3，80 m，4500 ns，160 km/h |
| V-TDL G2 | \(N_L,\mu_d,\tau_{\max},v_{\max}\) | 5，40 m，4500 ns，160 km/h |

除表 IV 列出的变化外，V-CORE 参数同表 I。

以下是 OFDM/OTFS 仿真的共同假设。

**1）整数归一化时延。** 带宽为 \(B\)、帧长为 \(T_f\) 时，第 \(i\) 条路径的归一化时延与多普勒分别为 \(\ell_i=\tau_iB\)、\(\kappa_i=\nu_iT_f\)。可分辨归一化时延的集合 \(\mathcal L=\{\ell_i:i=1,\ldots,P\}\) 通常假定包含于自然数集合，即使用整数时延单元。对应多普勒频移通常并不满足整数假设。

**2）信道估计。** 假定接收机拥有完整信道状态信息（CSI）：包括噪声方差 \(\sigma^2\)、每条路径的复增益 \(h_i\)、归一化时延 \(\ell_i\) 和多普勒 \(\kappa_i\)。实际接收机无法区分映射到同一时延—多普勒单元的物理路径。如果两条路径 \(i,j\) 满足 \(\ell_i=\ell_j\) 且 \(\lfloor\kappa_i\rceil=\lfloor\kappa_j\rceil\)，则视为不可分辨，将它们合并为一条等效路径，其增益 \(h_k=h_i+h_j\)。合并后可分辨路径数为 \(P^\ast\le P\)。

**3）几何信道相干时间。** 假定时延—多普勒信道在一个帧内不变。取 \(M=512\)、\(\Delta f=30\) kHz，路径长度分辨率 \(c/(M\Delta f)\approx19.5\) m。\(N=128\) 时帧长 \(T_f=N/\Delta f\approx4.3\) ms。160 km/h 车辆一帧内位移小于 0.2 m，远小于路径长度分辨率，因此帧长短于几何相干时间，整个帧内时延和多普勒可看作不变。这是 OTFS 应用所需的重要假设。

**4）信噪比。** 平均 SNR 定义为：

$$
\operatorname{SNR}=
\frac{E_s}{\sigma^2}\,\mathbb E[\|h\|^2],
\qquad
\|h\|^2=\sum_{i=1}^{P^\ast}|h_i|^2. \tag{41}
$$

其中 \(E_s\) 是平均符号能量。由于随机衰落，每帧的瞬时信噪比不同。式（41）与多输入单输出（MISO）系统中的最大比传输（MRT）预编码平均信噪比定义一致 [47]；在 OTFS 中，MRC 相干合并各多径，也提供类似的合并增益。

**5）检测。** OFDM 使用单抽头 MMSE 均衡；OTFS 使用时延—时间域 MRC 检测。

**表 V：OFDM/OTFS 仿真系统参数。**

| 参数 | 数值 |
|---|---|
| 带宽 \(B\) | 15.36 MHz |
| 时延单元／子载波 \(M\) | 512 |
| 多普勒单元／时隙 \(N\) | 128 |
| 子载波间隔 \(\Delta f\) | 30 kHz |
| 帧长 \(T_f=N/\Delta f\) | 约 4.2 ms（精确计算约 4.27 ms） |
| 载波频率 \(f_c\) | 3.6 GHz |
| 数据调制 | 无编码 4-QAM |

图 17 比较帧错误率（Frame Error Rate，FER）随平均 SNR 的变化。只要帧内有任何一个比特错误，该帧就判为错误。结果表明 OTFS 在全部模型和场景下都优于 OFDM。

但 EVA 下的 OTFS 相比 V-CORE 和 V-TDL 约有 5 dB 的额外增益。这是因为 EVA 视所有抽头完全独立，人为提高了信道分集；V-CORE 几何仿真表明，高速公路道路结构主要沿水平方向展开，车辆反射产生的多径经常落入相同延迟—多普勒单元，从而降低可分辨分集。此外，V-CORE 由双基地 RCS 决定的功率时延分布通常比 EVA 衰减更快。两个因素共同导致 EVA 高估高速车载场景中的 OTFS 性能。

反之，在 G1 和 G2 下，V-TDL 的 OTFS 结果分别与对应的 V-CORE 结果非常接近；交通强度更高的 G2 比 G1 具有更强分集，OTFS 性能因此更好。V-TDL 使用固定路径数，不像 V-CORE 每次随机产生不同数量的路径。虽然在收集统计量时固定路径数可能带来偏差，但两种模型给出的系统性能接近，说明这一简化并未显著损害用于性能评估的真实性。

这一仿真验证了 V-TDL 对不同车载交通条件下路径相关性的捕获，以及交通密度通过改变分集度影响 OTFS 性能的能力。有趣的是，OFDM 在相同模型和场景下表现出**相反的趋势**：分集度越高，OFDM 面对的多径多普勒成分越丰富，ICI 问题可能越严重。

**图 17：不同车载模型下 OTFS 和 OFDM 的 FER–SNR 曲线。** V-TDL 与 V-CORE 的 G1/G2 性能基本接近；EVA 高估 OTFS 的性能，OTFS 在全部场景仍优于 OFDM。[论文 DOI](https://doi.org/10.1109/TCOMM.2026.3663522)

### B. 不同路径相关程度下的 OTFS 性能

V-TDL 的一项核心特征，是显式描述多径间相关性，而这种相关性不可避免地降低 OTFS 可获取的分集。为进一步量化其影响，作者设计了原 EVA 的三个变体 EVA-1、EVA-2 和 EVA-3，逐步引入不同形式的相关。

**EVA-1：** 各路径仍像 EVA 一样独立，只是多普勒频移的各一维边缘分布改用 V-TDL G1 场景前九条路径所对应的边缘分布。

**EVA-2：** 与 EVA-1 相同，但路径时延整体乘以二，改变时延分辨及路径之间的时延关系。

**EVA-3：** 与 EVA-2 的时延设置相同，但各路径多普勒不再独立抽样，而是服从 V-TDL G1 前九条路径的联合分布，包含协方差矩阵中的非对角项，因此同时存在时延结构与多普勒相关。

三个变体使用与 EVA 相同的功率时延谱。图 18 在表 V 的相同 OTFS 系统下比较 FER。EVA-1 与原始 EVA 的性能接近，说明具体多普勒边缘分布形状并不是主要决定因素；真正重要的是路径是否相互独立。EVA-2 相比 EVA-1 约损失 2 dB，EVA-3 又相比 EVA-2 损失近似幅度。由此验证：提高多径之间的相关程度，会削弱 OTFS 性能。

**图 18：不同路径相关性下 OTFS 的 FER–SNR。** 依次通过 EVA-1、EVA-2、EVA-3 分离和量化边缘多普勒分布、时延关系与多普勒联合相关的影响。[论文 DOI](https://doi.org/10.1109/TCOMM.2026.3663522)

### C. 不同系统带宽下的 OTFS 性能

除路径相关性外，时延分辨率也是决定有效分集的重要因素。时延分辨率与系统带宽 \(B=M\Delta f\) 成反比。该实验固定 G1 环境，对 EVA 和 V-TDL 中的 OTFS 改变带宽并比较性能。

测试三个配置 \(M=32,128,512\)，其余参数均保持表 V 的值。由于不同 \(M\) 会在固定 \(N\) 下改变帧内符号数量，直接比较整帧 FER 不公平。因此改用 OTFS 的**符号错误率（Symbol Error Rate，SER）**。论文将它定义为时延—多普勒网格 \(X_{\rm dd}\) 中、大小为 \(N\) 的行向量的错误率，三种带宽的 \(N\) 保持相同。

图 19 显示：当带宽减少时，接收机时延分辨率下降，更多物理传播路径落入相同的可分辨延迟单元，感知到的分集减少，OTFS 性能因此恶化。对于同样的物理场景，增加带宽能帮助区分更多多径，从而让 OTFS 更好地利用延迟—多普勒分集。

**图 19：不同带宽下 EVA 与 V-TDL G1 的 OTFS SER–SNR。** 带宽减少导致时延分辨能力与可用分集下降。[论文 DOI](https://doi.org/10.1109/TCOMM.2026.3663522)

## VII. 结论与未来工作

本文提出车载抽头延迟线（V-TDL）信道模型，用于准确刻画高速公路车辆环境中的传播变化。它兼有固定抽头随机模型的简洁性和对时延、多普勒频移、信道增益等关键参数的精细统计刻画。结果表明，其系统性能预测与复杂得多的基于几何的模型相近。

不同于假设所有抽头独立、容易高估性能的传统随机模型，V-TDL 显式捕获多径相关性。这一点至关重要，因为相关性改变可分辨信道分集，并可能显著改变通信系统性能。论文还展示系统带宽改变接收机能够感知的时延分集、从而影响 OTFS 性能的机制。尽管如此，OTFS 在全部考察的车载场景中都优于 OFDM，在高流量密度和较大时延扩展等分集较丰富的场景中特别明显。

后续研究方向包括：使用更多类型的双基地 RCS 测量，例如考虑多样化车辆形状，以及收发天线之间不同仰角；将模型扩展至**分数时延**情形；并进一步研究如何利用路径相关性的结构，设计新的 OTFS 信号检测算法。

## 致谢与资助说明

本研究得到欧盟 Horizon Europe SNS JU MultiX 项目（Grant Agreement 101192521）、欧盟 Next Generation EU 意大利国家复苏与韧性计划（NRRP）的“Telecommunications of the Future / RESTART”合作项目、PRIN 2022 PNRR 的 CSI-Future 项目，以及澳大利亚研究理事会（ARC）Discovery 项目 DP200100096 的支持。论文所表达的观点属于作者自身，不代表资助机构立场。

## 参考文献

以下保留原文英文题名、作者与出版信息，以便与 DOI、数据库及原文编号交叉查找。

[1] Wang et al., “On the road to 6G: Visions, requirements, key technologies, and testbeds,” IEEE Communications Surveys & Tutorials, 2023.  
[2] Saad, Bennis and Chen, “A vision of 6G wireless systems: Applications, trends, technologies, and open research problems,” IEEE Network, 2020.  
[3] Giordani et al., “Toward 6G networks: Use cases and technologies,” IEEE Communications Magazine, 2020.  
[4] Wu and Fan, “A survey on high mobility wireless communications: Challenges, opportunities and solutions,” IEEE Access, 2016.  
[5] Noor-A-Rahim et al., “6G for vehicle-to-everything (V2X) communications: Enabling technologies, challenges, and opportunities,” Proceedings of the IEEE, 2022.  
[6] Hakak et al., “Autonomous vehicles in 5G and beyond: A survey,” Vehicular Communications, 2023.  
[7] Tse and Viswanath, *Fundamentals of Wireless Communication*, Cambridge University Press, 2005.  
[8] 3GPP, “Evolved Universal Terrestrial Radio Access (E-UTRA); User Equipment (UE) Radio Transmission and Reception,” TS 36.101.  
[9] ITU, “Rec. ITU-R M.1034-1: Requirements for the radio interface(s) for international mobile telecommunications-2000,” 1997.  
[10] Compagnoni et al., “OTFS vs. OFDM in High-speed Vehicular Traffic Scenarios,” IEEE WCNC, 2025.  
[11] Schaubach, Davis and Rappaport, “A ray tracing method for predicting path loss and delay spread in microcellular environments,” VTS Conference, 1992.  
[12] He et al., “The design and applications of high-performance ray-tracing simulation platform for 5G and beyond wireless communications: A tutorial,” IEEE Communications Surveys & Tutorials, 2019.  
[13] Guan et al., “Towards 6G: Paradigm of realistic terahertz channel modeling,” China Communications, 2021.  
[14] Hadani et al., “Orthogonal Time Frequency Space Modulation,” IEEE WCNC, 2017.  
[15] Wang et al., “Performance Degradation of OFDM Systems due to Doppler Spreading,” IEEE TWC, 2006.  
[16] Groll et al., “Sparsity in the delay-doppler domain for measured 60 GHz vehicle-to-infrastructure communication channels,” IEEE ICC Workshops, 2019.  
[17] Ma et al., “OTFS-TSMA for massive internet of things in high-speed railway,” IEEE TWC, 2022.  
[18] Gaudio, Colavolpe and Caire, “OTFS vs. OFDM in the presence of sparsity: A fair comparison,” IEEE TWC, 2022.  
[19] Ramachandran, Surabhi and Chockalingam, “OTFS: A new modulation scheme for high-mobility use cases,” Journal of the Indian Institute of Science, 2020.  
[20] Raviteja, Viterbo and Hong, “OTFS performance on static multipath channels,” IEEE WCL, 2019.  
[21] Murali and Chockalingam, “On OTFS Modulation for High-Doppler Fading Channels,” ITA, 2018.  
[22] Priya, Hong and Viterbo, “OTFS channel estimation and detection for channels with very large delay spread,” IEEE TWC, 2024.  
[23] Hong, Thaj and Viterbo, *Delay-Doppler Communications Principles and Applications*, Elsevier, 2022.  
[24] Paier et al., “Characterization of vehicle-to-vehicle radio channels from measurements at 5.2 GHz,” Wireless Personal Communications, 2009.  
[25] Wiffen et al., “Comparison of OTFS and OFDM in Ray Launched sub-6 GHz and mmWave Line-of-Sight Mobility Channels,” IEEE PIMRC, 2018.  
[26] Xiong et al., “Vehicle-to-vehicle channel characterization based on ray-tracing for urban road scenarios,” Wireless Communications and Mobile Computing, 2021.  
[27] Nuckelt et al., “Comparison of ray tracing and channel-sounder measurements for vehicular communications,” IEEE VTC Spring, 2013.  
[28] Karedal et al., “A Geometry-Based Stochastic MIMO Model for Vehicle-to-Vehicle Communications,” IEEE TWC, 2009.  
[29] Rakesh and Viterbo, “Geometry Based Stochastic Channel Modeling using Ambit Processes,” IEEE WCNC, 2020.  
[30] Alsalami et al., “Regular-shaped geometry-based stochastic model for vehicle-to-vehicle visible light communication channel,” JEEIT, 2019.  
[31] Yuan et al., “Novel 3D geometry-based stochastic models for non-isotropic MIMO vehicle-to-vehicle channels,” IEEE TWC, 2014.  
[32] Beygi, Ström and Mitra, “Geometry-based stochastic modeling and estimation of vehicle to vehicle channels,” IEEE ICASSP, 2014.  
[33] Deng, Ge and Ding, “A unifying view of OTFS and its many variants,” IEEE Communications Surveys & Tutorials, 2025.  
[34] Blazek et al., “Vehicular Channel Characterization in Orthogonal Time-Frequency Space,” IEEE ICC Workshops, 2019.  
[35] Radovic, Mecklenbräuker and Blazek, “OTFS performance over different measured vehicular 60 GHz millimeter-wave channels,” SoftCOM, 2021.  
[36] Marsalek et al., “Real-world OTFS channel estimation performance evaluation on mmWave vehicular channels,” WSA, 2024.  
[37] Singh et al., “Low-complexity ZF/MMSE MIMO-OTFS receivers for high-speed vehicular communication,” IEEE Open Journal of the Communications Society, 2022.  
[38] Reddy et al., “Spectral efficient modem design with OTFS modulation for vehicular-IoT system,” IEEE IoT Journal, 2023.  
[39] Ge et al., “OTFS signaling for SCMA with coordinated multi-point vehicle communications,” IEEE TVT, 2023.  
[40] Raviteja et al., “Practical pulse-shaping waveforms for reduced-cyclic-prefix OTFS,” IEEE TVT, 2019.  
[41] Thaj and Viterbo, “Low Complexity Iterative Rake Decision Feedback Equalizer for Zero-Padded OTFS Systems,” IEEE TVT, 2020.  
[42] Willis, *Bistatic Radar*, Institution of Engineering and Technology, 2004.  
[43] Rao, Wilton and Glisson, “Electromagnetic Scattering by Surfaces of Arbitrary Shape,” IEEE TAP, 1982.  
[44] Naval Air Warfare Center Weapons Division, *Electronic Warfare and Radar Systems Engineering Handbook*, 4th ed., 2013.  
[45] Acosta, Tokuda and Ingram, “Measured joint Doppler-delay power profiles for vehicle-to-vehicle communications at 2.4 GHz,” IEEE GLOBECOM, 2004.  
[46] 3GPP, “Study on channel model for frequencies from 0.5 to 100 GHz,” Technical Report, 2024.  
[47] Björnson and Demir, *Introduction to Multiple Antenna Communications and Reconfigurable Surfaces*, Now Publishers, 2024.

{% endraw %}
