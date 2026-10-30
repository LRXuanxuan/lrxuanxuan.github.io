---
layout: page
title: "多 LEO 卫星协作波束赋形的定位辅助信道估计｜中文全文译文"
permalink: /papers/translations/2026-09-29-2502-05808-positioning-aided-channel-estimation-for-multi-leo-satellite-cooperati/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/9e83716622f16a90/) · [原文 arXiv](https://arxiv.org/abs/2502.05808) · [全部目录](/papers/catalog/)

# 多 LEO 卫星协作波束赋形的定位辅助信道估计

**原题：** Positioning-Aided Channel Estimation for Multi-LEO Satellite Cooperative Beamforming  
**作者：** Yuchen Zhang、Pinjun Zheng、Jie Ma、Henk Wymeersch、Tareq Y. Al-Naffouri（Yuchen Zhang、Jie Ma、Tareq Y. Al-Naffouri：沙特阿拉伯阿卜杜拉国王科技大学（KAUST）计算机、电气与数学科学与工程学部（CEMSE）电气与计算机工程专业；Pinjun Zheng：加拿大不列颠哥伦比亚大学奥卡纳根校区工学院；Henk Wymeersch：瑞典查尔姆斯理工大学电气工程系）  
**版本：** arXiv:2502.05808v4（eess.SP），v4 于 2026 年 1 月 18 日发布，原文 16 页；本工作部分受 KAUST 赞助研究办公室（OSR）资助（Award RFS-CRG12-2024-6478）、KAUST 全球学者计划（Award RFS-2025-6844）以及欧盟委员会 Horizon Europe/JU SNS 项目 Hexa-X-II（Grant Agreement no. 101095759）资助。  
**范围与状态：** 全文中文译稿：摘要、正文各节、结论、图注表注、参考文献（英文原条目）与附录 A—D 按原文结构录入；逐句逐式终校未做。

## 摘要

本文研究一种同时为地面用户终端提供定位与通信服务的多低地球轨道（LEO）卫星系统。为应对 LEO 卫星系统中准确获取信道状态信息的挑战，本文利用 LEO 卫星信道中**位置相关参数**与**信道增益**固有的不同变化速率，提出一种新的**两时间尺度定位辅助信道估计**框架。借助误设定克拉美–罗界（misspecified Cramér–Rao bound，MCRB）理论，本文系统分析了在星间时钟偏差、载波频偏等实际非理想因素下的定位性能。进一步地，本文通过基于 MCRB 的分析，从理论上证明：即使存在定位误差，由下行定位得到的位置信息也能提升上行信道估计精度。为应对单星通信有限的链路预算与通信速率，本文提出一种用于下行传输的多 LEO 协作波束赋形策略，在利用簇内卫星协作的同时保持较低复杂度。理论分析与数值结果验证了所提框架在下行高精度定位、上行信道估计以及高效下行通信方面的有效性。

**关键词：** LEO 卫星定位与通信；信道估计；MCRB；协作波束赋形。

## I. 引言

移动通信的演进由一个宏伟愿景驱动：在地球上任何地点实现无缝、高速的信息接入。尽管蜂窝网络从 1G 到 5G 及以后各代演进已在基础设施部署具有经济可行性的城市与郊区基本实现了该目标，农村与偏远地区仍存在显著挑战。在这些欠发达地区，可靠的通信与互联网接入往往要么不可用、要么价格高昂，造成日益扩大的**数字鸿沟** [1]。基于非地面网络（NTN）的通信已成为弥合全球连接鸿沟的有前景方案：它利用空中与天基平台（例如高空平台（HAP）与卫星）作为空中接入点 [2]—[7]。在这些平台中，低地球轨道（LEO）卫星因相对中地球轨道（MEO）、地球静止轨道（GEO）卫星与 HAP 的多项优势而尤受关注，包括更低的路径损耗与更小的传播时延、星座设计上更高的灵活性，以及相对更低的部署与发射成本 [8]—[10]。

LEO 卫星全球连接的发展在带来机遇的同时也带来重大挑战，尤其在信道估计方面——这是满足日益苛刻的高速通信需求的关键环节 [11]、[12]。虽然接收机可以通过补偿 LEO 卫星快速运动引起的多普勒频移来有效缓解信道老化 [8]、[11]、[13]，但相比地面网络大得多的传播距离会造成严重的信号功率衰减。该衰减尤其影响基于导频的信道估计方法：它们受限于低接收功率，使有效信道状态信息（CSI）获取变得困难，对功率受限的用户终端（UT，例如上行链路中的移动设备）尤为如此。另一方面，尽管 LEO 卫星的轨道高度低于 MEO 与 GEO 卫星，其通信链路的距离仍远超典型地面通信；更长的信号传播距离加上有限的星上功率资源，显著制约了单颗 LEO 卫星通信系统的链路预算，对实现宽带 NTN 通信宏大的吞吐量目标构成实质障碍 [2]、[12]、[14]。

尽管卫星信道给 CSI 获取带来显著挑战，它们相比地面信道具有鲜明特征，尤其是**强视距（LOS）主导性**与显著几何结构 [14]。这些性质天然与位置信息相关联 [10]，表明合理利用 UT 位置知识有助于缓解 LEO 卫星通信中的信道估计难题，例如通过重建导向矢量等几何相关分量来实现部分信道推断。这一观点自然引出两个关键问题：(i) 如何在 LEO 卫星网络中高效获取准确的 UT 位置信息；(ii) 如何利用该信息改善 LEO 信道估计并最终改善通信性能。另一方面，为克服单星服务固有的链路预算限制，多星协作传输在多种设计目标下已成为有前景的解决方案 [15]—[24]。例如近期工作设计了协作传输方案以主动缓解单载波／统计 CSI 设置下的异步干扰 [22]，把此类处理推广到正交频分复用（OFDM）系统（常采用高复杂度的二次约束二次规划（QCQP）建模）[23]，或强调联合功率分配与用户调度并配以启发式预编码器构造 [24]。尽管这些进展高度相关，它们并不直接契合本文目标——本文把协作波束赋形主要作为一种**受控基线**，用于评估定位辅助 CSI 的效用。此外，尽管多星协作日益受关注，协作波束赋形的**计算可扩展性**仍是关键瓶颈，对资源受限的 LEO 卫星平台尤为如此。

位置信息在提升地面网络通信性能方面的作用已被广泛认识 [25]—[29]。例如 [25] 在 5G 网络中引入位置感知，展示了其在协调通信方案同步方面的潜力；[26] 展示了位置信息如何促进毫米波通信中的波束对准。这些方法通常依赖来自全球导航卫星系统（GNSS）[25]、[26] 或无线电感知 [27]—[29] 的位置信息。然而在 LEO 卫星场景中，通过 LEO 卫星上类似雷达的感知获取地面 UT 位置因往返信号衰减过大而不可行。虽然 GNSS 看似可行——如 [24] 所示，UT 位置经 GNSS 获得并反馈给 LEO 卫星用于下行通信——但定位误差的关键影响以及对过度理想化同步假设的依赖仍未充分研究，值得在实际实现中进一步考察。

与 LEO 卫星通信的进展并行，把 LEO 卫星视为 GNSS 潜在补充或替代的研究兴趣日增 [30]—[34]。该兴趣源于 LEO 卫星相对 GNSS 的固有优势，包括更强的信号接收、广泛的星座与宽泛的频率分集；这些特性也部分促成了 LEO 卫星通信的成功 [31]、[35]、[36]。近期研究已开始探讨 LEO 卫星通信与定位功能的融合。例如 [37] 提出一种大规模多输入多输出（MIMO）LEO 卫星系统，在下行同时支持通信与定位，并设计混合波束赋形以满足两者不同需求。然而该工作主要关注定位与通信性能之间的折中，忽视了二者的互益——例如定位在促进信道估计（LEO 卫星系统中的关键挑战）方面的潜力；此外它未计入 LEO 卫星间不可避免的时钟偏差与载波频偏（CFO），而这些因素可能显著影响定位性能。

本文研究一簇 LEO 卫星（每颗配备均匀平面阵（UPA））同时为多个单天线地面 UT 提供下行定位与通信服务的场景，旨在解决该设置下特有的关键挑战：在实际同步非理想（如星间时钟偏差与 CFO）下刻画定位性能；利用用户位置信息增强信道估计并计入不可避免的定位误差；以及通过精心设计的、优化复杂度较低的协作多星波束赋形方案缓解单星链路预算限制。

本文主要贡献如下。

- 基于 LEO 卫星信道中位置相关参数与随机信道增益的不同变化速率（详见第 II 节），本文提出一种新的**两时间尺度帧结构**：下行定位运行在较长的位置相干时间尺度上，而上行信道估计与下行通信运行在较短的信道增益相干时间尺度上。通过该框架，各过程按其变化速率调度，在最大化资源利用率的同时保留利用定位实现高效信道估计与通信的潜力。
- 为突破以往工作常用的理想同步假设，本文扩展 MCRB 框架，以显式刻画星间时钟偏差与 CFO 的影响。与经典克拉美–罗界（CRB）不同，MCRB 面向模型误设定下的估计 [38]。借此本文严格量化这些同步相关损伤如何扭曲到达时间（TOA）与多普勒测量，进而降低实际 LEO 场景中的定位精度。
- 在所提**定位辅助信道估计（PACE）**框架内，本文展示大时间尺度的定位误差如何传播到小时间尺度的信道估计、形成固有的模型误设定。通过应用 MCRB，本文系统分析定位阶段的不确定性如何转化为上行信道估计的性能损失，从而辨识实际位置辅助设计所需的稳健性裕度。
- 本文提出一种下行通信的协作波束赋形基线：每个 UT 由簇内全部 LEO 卫星同时服务。本文采用加权最小均方误差（WMMSE）框架，并利用块坐标下降（BCD）、强对偶与矩阵求逆结构发展出一种低复杂度解法，以缓解多星协作本将带来的难以承受的计算负担。重要的是，该基线在设计上计算可行，并可通过比较名义（PACE 估计）与真实信道模型下的性能，透明地评估所提 PACE 框架。

本文结构如下：第 II 节给出系统模型；第 III 节通过 MCRB 理论分析下行定位与上行信道估计性能（含 PACE）；第 IV 节详述下行通信的协作波束赋形方法；第 V 节给出数值结果，第 VI 节总结。

**记号：** 标量用普通小写字母表示，向量与矩阵分别用粗体小写与粗体大写字母表示。对向量 $\mathbf a$，其 2-范数记为 $\lVert\mathbf a\rVert$。上标 $T$ 与 $H$ 分别表示转置与 Hermitian 转置。对矩阵 $\mathbf A$，$\operatorname{Tr}(\mathbf A)$ 表示其迹。复数的实部与虚部分别用 $\Re\{a\}$、$\Im\{a\}$ 表示。由矩阵 $\mathbf A_1,\ldots,\mathbf A_N$ 构成的块对角矩阵记为 $\operatorname{blkdiag}\{\mathbf A_1,\ldots,\mathbf A_N\}$。Kronecker 积用 $\otimes$ 表示。统计分布方面，$\mathcal{CN}(\boldsymbol\mu,\mathbf C)$ 表示均值 $\boldsymbol\mu$、协方差矩阵 $\mathbf C$ 的循环对称复高斯分布。

## II. 系统模型

如图 1 所示，考虑 $S$ 颗 LEO 卫星构成的簇服务 $U$ 个 UT，同时提供下行定位与通信服务。本文假设运行期间不发生切换；簇内与簇间切换的影响留待未来研究。每颗 LEO 卫星配备由 $N=N_h\times N_v$ 个半波长间隔天线构成的 UPA，其中 $N_h$、$N_v$ 分别为水平与垂直维天线数。每个 UT 配备单天线（脚注 1）。尽管准确 CSI 对实现高效下行通信至关重要，但天基通信系统因链路预算有限与相干时间短，信道估计颇具挑战，其根源在于星地间长传播距离与卫星高速运动 [12]。下文先介绍所采用的信道模型，随后阐述该模型的**两时间尺度性质**——可用于促进 LEO 卫星侧的高效信道获取，从而增强下行通信。注意 LEO 卫星系统中的切换通常发生在数十秒至数分钟量级，因而跨越多个位置相干的大时间尺度帧（后文进一步讨论）。由于所提 PACE 框架关注**每帧内**定位与通信的融合，本文省略显式切换建模，以避免引入超出本文范围的控制面层与相关冗余；该简化假设也广泛见于 [15]、[16]、[19]、[24] 等先前研究。

> **脚注 1（原文）：** 把单天线 UT 扩展到多天线是值得研究的方向：接收机空间分辨率有助于分离具有不同多普勒与时延的信号并缓解异步干扰 [23]；但严格处理还需修改定位模型以纳入阵列朝向与角度相关测量，超出本文范围，留待未来工作。

### A. 信道模型

考虑工作在 Ku、Ka 等较高频段的卫星通信系统，其中信道由 LOS 传播主导 [14]、[18]（脚注 2）。假设系统采用含 $K$ 个子载波的 OFDM 方案，令 $\Delta f=B/K$、$T=1/\Delta f$ 分别表示子载波间隔与符号时长，其中 $B$ 为信号带宽。第 $s$ 颗 LEO 卫星到第 $u$ 个 UT 在第 $\ell$ 个 OFDM 符号、第 $k$ 个子载波上的信道可表示为（脚注 3）

$$
\mathbf h_{s,u}[\ell,k]=\alpha_{s,u}\,G\left(\theta_{s,u}^{\mathrm{el}}\right)e^{\jmath 2\pi\left(\ell T\upsilon_{s,u}-k\Delta f\tau_{s,u}\right)}\,\mathbf a(\boldsymbol\theta_{s,u}),\tag{1}
$$

其中 $\alpha_{s,u}$ 为复信道增益，$G(\cdot)$ 是仅由仰角决定的对称天线辐射方向图 [39]，$\tau_{s,u}$ 与 $\upsilon_{s,u}$ 分别表示 TOA 与多普勒频移，$\mathbf a(\boldsymbol\theta_{s,u})\in\mathbb C^{N}$ 为 LEO 卫星处导向矢量，$\boldsymbol\theta_{s,u}=[\theta_{s,u}^{\mathrm{az}},\theta_{s,u}^{\mathrm{el}}]^{T}$ 为出发角（AOD），由方位角与仰角组成。不失一般性，假设每颗卫星的 UPA 部署于其本地坐标系的 XY 平面，于是导向矢量可写为

$$
\mathbf a(\boldsymbol\theta_{s,u})=e^{-\jmath 2\pi\phi_{s,u}^{h}\mathbf n(N_h)}\otimes e^{-\jmath 2\pi\phi_{s,u}^{v}\mathbf n(N_v)},\tag{2}
$$

其中 $\mathbf n(N)=[0,\ldots,N-1]^{T}$，$\phi_{s,u}^{h}=d\cos\theta_{s,u}^{\mathrm{az}}\cos\theta_{s,u}^{\mathrm{el}}/\lambda$，$\phi_{s,u}^{v}=d\sin\theta_{s,u}^{\mathrm{az}}\cos\theta_{s,u}^{\mathrm{el}}/\lambda$。这里 $d$ 为每个维度的天线间距，$\lambda$ 为中心载频 $f_c$ 处的波长。

复信道增益可建模为

$$
\alpha_{s,u}=e^{\jmath\psi_{s,u}}\beta_{s,u},\tag{3}
$$

其中 $\psi_{s,u}$ 表示收发端之间的随机相位差 [40]，$\beta_{s,u}$ 表示计入大尺度路径损耗与小尺度衰落的路径损耗（如 [41] 所述）。具体地，以 dB 域表示的路径损耗 $\beta_{s,u}$ 刻画为

$$
-20\log_{10}\beta_{s,u}=\beta_{s,u}^{\mathrm{FS}}+\beta_{s,u}^{\mathrm{SF}}+\beta_{s,u}^{\mathrm{CL}}+\beta_{s,u}^{\mathrm{AB}}+\beta_{s,u}^{\mathrm{SC}}\ \ [\mathrm{dB}],\tag{4}
$$

其中 $\beta_{s,u}^{\mathrm{FS}}$ 为自由空间路径损耗，$\beta_{s,u}^{\mathrm{SF}}$ 为建模为高斯随机变量的阴影衰落，$\beta_{s,u}^{\mathrm{CL}}$ 为杂波损耗，$\beta_{s,u}^{\mathrm{AB}}$ 为大气吸收效应，$\beta_{s,u}^{\mathrm{SC}}$ 为电离层或对流层闪烁造成的衰减。

> **脚注 2（原文）：** 尽管多径效应在密集城区环境中仍可能起显著作用，但 LEO 卫星通信主要面向郊区、农村与偏远地区（如海洋与沙漠），这些区域地面基础设施稀疏或不存在、散射体大幅减少，因此 LOS 传播更加主导。

> **脚注 3（原文）：** 为符号简洁起见未进一步加时间索引；该表达式视为位于一个信道增益相干区间内（后文详述），而 $\upsilon_{s,u}$、$\tau_{s,u}$ 与 $\boldsymbol\theta_{s,u}$ 在多个这样的区间内视为常数。

### B. 时间尺度分析与帧结构

**1）时间尺度分析。** 由式 (1) 可见，LEO 卫星信道由两类参数支配：

- **大时间尺度参数：** 与卫星和 UT 的位置相关，包括多普勒频移、TOA 与 AOD。尽管 LEO 卫星运动很快，其轨道**可预测且已良好确定**；因此主导的确定性多普勒分量与其他几何相关参数（TOA、AOD）协调演化。只要 UT 位置不发生突变（实际中通常如此），这种可预测性在位置相干时间尺度内保持有效；该时间尺度主要由 UT 位置的更新速率而非卫星轨迹决定。因此，典型场景下假设大时间尺度参数在数秒或更长时间尺度上变化是合理的。
- **小时间尺度参数：** 包括信道增益幅度与相位的随机变化；补偿后由于估计误差残留的多普勒波动也归入此类。与几何决定的大时间尺度参数不同，这些小时间尺度效应本质上不可预测且快速波动。此类变化可能来自对流层闪烁——它会依大气与轨道条件在 Ka 波段 LEO 卫星信道中引起亚秒级波动 [42]。此外，尽管 Ku/Ka 波段由 LOS 分量主导，附近移动散射体仍可能产生与 LOS 路径叠加的多径分量，形成在毫秒量级上幅度与相位变化的小尺度衰落复合信道增益 [18]、[28]。

注意类似的双时间尺度效应已在地面系统中被分析与利用 [27]、[43]。在 LEO 卫星信道中，卫星高速运动引起的多普勒频移导致快速的时间相位旋转；虽然接收端载波同步可大幅缓解，仍可能残留小误差 [8]，从而限制其对通信性能的影响。尽管如此，本文在信道模型中保留多普勒频移，因为它是定位的宝贵测量量（后文讨论）。就定位而言，多普勒频移必须在用于通信补偿之前先被显式估计。

**2）两时间尺度帧结构。** 受上述时间尺度分析启发，本文提出一种两时间尺度帧结构，利用 LEO 信道固有的两时间尺度性质实现高效的信道估计／重建，从而促进下行 LEO 传输。如图 2 所示，大时间尺度帧的时长由位置相干时间决定，即 UT 位置信息变得过时的间隔。每个大时间尺度帧以一个用于下行定位的初始子帧开始，其中 UT 位置估计可反馈给 LEO 卫星 [24]、[44]；随后是多个信道增益保持相干的小时间尺度子帧。需强调，该反馈只携带低速率 UT 位置信息（一个三维实向量），并在大时间尺度区间内保持相干，因此开销可忽略、无严格时延要求。此外，主导不确定性是位置估计误差（本文分析已建模），图 5 表明在此条件下基于 PACE 的信道重建在实际区间内是稳健的，故略去显式反馈链路误差。注意采用时分双工（TDD）（脚注 4）区分上下行传输。所提方法利用上下行信道互易性，把上行信道估计用于优化下行通信设计。

为进一步支撑该结构用于 LEO 下行通信的基本依据，本文通过与**无定位**上行信道估计协议的比较来凸显其潜在优势：后者直接由 LEO 卫星使用上行导频估计信道，不需要 UT 位置信息 [11]、[13]。该方法需估计未知信道向量／矩阵，在大规模天线阵下可能带来显著导频开销。而在所提位置信息辅助框架下，向量型信道估计可通过利用信道结构转化为标量型估计。该转化有可能在相同导频开销下获得更高信道估计精度；或者，在达到同等信道估计精度时所需导频开销更少，从而为数据传输保留更多资源。

下文先基于两时间尺度 PACE 进行性能分析，再提出用于下行通信的多 LEO 卫星协作波束赋形方法。

> **脚注 4（原文）：** 当前 NR-NTN 频段（如 n255/n256 [45]）主要为频分双工（FDD），而本文 PACE 框架依赖上下行互易性，故在 TDD 假设下研究。值得注意的是，LEO 的 TDD 已被第三代合作伙伴计划（3GPP）[41] 明确考虑，在 Iridium Next 等系统中有运营先例，并在近期可行性研究中进一步考察 [46]。因此，本文基于 TDD 的设计与 FDD 基线互补，并为未来 NTN 系统中互易性使能方案提供前瞻性洞见。

## III. 两时间尺度定位辅助信道估计

为刻画其性能极限，本文对 PACE 进行两阶段理论性能分析（脚注 5）：第一阶段分析下行多 LEO 卫星定位性能，第二阶段评估上行信道估计性能。

> **脚注 5（原文）：** 对下行定位与上行信道估计，本文均用 MCRB 在模型误设定下理论刻画性能，目的是揭示所提 PACE 框架提升信道估计的潜力。具体估计器的设计超出本文范围，留待未来工作。

注意模型误设定可来自多种硬件非理想因素（脚注 6）。第一，卫星与 UT 之间以及卫星彼此之间的时钟偏差不可避免。尽管为 LEO 卫星配备 GNSS 接收机可实现亚纳秒同步 [48]，接收信号在传播过程中仍受电离层与对流层时延影响 [49]；这些时延受温度、气压、湿度以及卫星相对 UT 仰角影响，对每个卫星–UT 对产生独特偏移，并在信号模型中有效转化为**等效时钟偏差**。第二，低成本振荡器与固有硬件损伤会引入 CFO [50]。许多定位算法为降低分析复杂度而忽略某些因素以简化模型；为刻画这种简化的影响，本文在定位阶段用简化模型估计实际由更真实模型生成之未知量，从而自然引入模型误设定。类似地，第二阶段位置信息辅助信道估计中，UT 位置的估计误差同样导致误设定。因此，此类条件下的性能界可用 MCRB 有效刻画 [38]、[51]。

> **脚注 6（原文）：** 相位噪声与功放非线性等损伤在 Ku/Ka 波段也相关 [47]，但本文聚焦时钟偏差与 CFO，因为它们直接扰动时延与多普勒，在卫星间引入主导定位误差的**确定性偏差**；相比之下，相位噪声与非线性主要表现为**随机失真**，降低有效接收功率，原则上可在单星基础上缓解。

### A. 大时间尺度下行定位

**1）信号模型。** 令 $\mathbf t_s[\ell,k]\in\mathbb C^{U}$ 为第 $s$ 颗 LEO 卫星在第 $\ell$ 个符号、第 $k$ 个子载波上发送的导频（单位模元素）。假设定位阶段各卫星通过时分多址（TDMA）复用 [36]。第 $u$ 个 UT 从第 $s$ 颗卫星接收的基带信号可表示为

$$
\mathbf y_{s,u}[\ell,k]=\mathbf h_{s,u}^{T}[\ell,k]\mathbf F_s\mathbf t_s[\ell,k]+\mathbf z_u[\ell,k]
=\vartheta_{s,u}\gamma[\ell,k]\mathbf a^{T}(\boldsymbol\theta_{s,u})\mathbf f_s[\ell,k]+\mathbf z_u[\ell,k],\tag{5}
$$

其中 $\vartheta_{s,u}=\alpha_{s,u}G(\theta_{s,u}^{\mathrm{el}})$、$\gamma[\ell,k]=e^{\jmath 2\pi(\ell T\upsilon_{s,u}-k\Delta f\tau_{s,u})}$、$\mathbf f_s[\ell,k]=\mathbf F_s\mathbf t_s[\ell,k]$，$\mathbf F_s\in\mathbb C^{N\times U}$ 为波束赋形矩阵，$\mathbf z_u[\ell,k]\sim\mathcal{CN}(0,N_0\Delta f)$ 为单边功率谱密度（PSD）$N_0$ 的加性白高斯噪声（AWGN）。不失一般性，以下推导聚焦第 $u$ 个 UT。

令 $\boldsymbol\eta_{s,u}=[\acute{\boldsymbol\eta}_{s,u}^{T},\grave{\boldsymbol\eta}_{s,u}^{T}]^{T}\in\mathbb R^{6}$ 表示从第 $s$ 颗卫星接收信号中的未知信道域参数，其中 $\acute{\boldsymbol\eta}_{s,u}=[\upsilon_{s,u},\tau_{s,u}]^{T}\in\mathbb R^{2}$ 为用于 UT 定位的参数，$\grave{\boldsymbol\eta}_{s,u}=[\boldsymbol\theta_{s,u}^{T},\Re(\vartheta_{s,u}),\Im(\vartheta_{s,u})]^{T}\in\mathbb R^{4}$ 被视为冗余（nuisance）参数。时延 $\tau_{s,u}$ 与多普勒 $\upsilon_{s,u}$ 直接由 UT 相对卫星的位置与速度决定，是定位最可靠的观测量。相比之下，AOD $\boldsymbol\theta_{s,u}$ 在此不被利用，因为高空运行 LEO 卫星的角分辨率有限，除非使用极大阵列，否则 AOD 估计不可靠。类似地，信道增益 $\vartheta_{s,u}$ 受环境变化与硬件损伤严重影响，除指纹类方法 [40] 外几乎不提供稳定几何信息。

本文进一步把从 $S$ 颗卫星采集的所有利用的信道域参数拼接为 $\acute{\boldsymbol\eta}_u=[\acute{\boldsymbol\eta}_{1,u}^{T},\ldots,\acute{\boldsymbol\eta}_{S,u}^{T}]^{T}\in\mathbb R^{2S}$。因此，在大时间尺度下行定位中，先基于 $\mathbf y_{s,u}[\ell,k]$（$s=1,\ldots,S$、$\ell=1,\ldots,L_p$、$k=1,\ldots,K$）估计 $\acute{\boldsymbol\eta}_u$，其中 $L_p$ 为下行定位导频符号数；随后估计第 $u$ 个 UT 的位置、时钟偏差与 CFO。

**2）$\boldsymbol\eta_{s,u}$ 的 FIM。** 令 $\boldsymbol\mu_{s,u}[\ell,k]$ 表示 $\mathbf y_{s,u}[\ell,k]$ 的无噪版本，并令 $\mathbf G_{s,u}[\ell,k]=[\mathbf g_v[\ell,k],\mathbf g_\tau[\ell,k],\mathbf g_{\theta^{\mathrm{az}}}[\ell,k],\mathbf g_{\theta^{\mathrm{el}}}[\ell,k],\mathbf g_{\vartheta,R}[\ell,k],\mathbf g_{\vartheta,I}[\ell,k]]\in\mathbb C^{N\times6}$，其各列满足

$$
\mathbf g_v[\ell,k]=\vartheta_{s,u}\gamma[\ell,k](\jmath 2\pi\ell T)\mathbf a(\boldsymbol\theta_{s,u}),\tag{6a}
$$

$$
\mathbf g_\tau[\ell,k]=\vartheta_{s,u}\gamma[\ell,k](-\jmath 2\pi k\Delta f)\mathbf a(\boldsymbol\theta_{s,u}),\tag{6b}
$$

$$
\mathbf g_{\theta^{\mathrm{az}}}[\ell,k]=\vartheta_{s,u}\gamma[\ell,k]\frac{\partial\mathbf a(\boldsymbol\theta_{s,u})}{\partial\theta_{s,u}^{\mathrm{az}}},\tag{6c}
$$

$$
\mathbf g_{\theta^{\mathrm{el}}}[\ell,k]=\vartheta_{s,u}\gamma[\ell,k]\frac{\partial\mathbf a(\boldsymbol\theta_{s,u})}{\partial\theta_{s,u}^{\mathrm{el}}},\tag{6d}
$$

$$
\mathbf g_{\vartheta,R}[\ell,k]=\gamma[\ell,k]\mathbf a(\boldsymbol\theta_{s,u}),\tag{6e}
$$

$$
\mathbf g_{\vartheta,I}[\ell,k]=\jmath\gamma[\ell,k]\mathbf a(\boldsymbol\theta_{s,u}).\tag{6f}
$$

基于从第 $s$ 颗卫星接收的信号，$\boldsymbol\eta_{s,u}$ 的 Fisher 信息矩阵（FIM）可由 Slepian–Bangs 公式计算为

$$
\mathbf J_s(\boldsymbol\eta_{s,u})=\frac{2}{N_0\Delta f}\sum_{\ell=1}^{L_p}\sum_{k=1}^{K}\Re\left\{\left(\frac{\partial\boldsymbol\mu_{s,u}[\ell,k]}{\partial\boldsymbol\eta_{s,u}}\right)\left(\frac{\partial\boldsymbol\mu_{s,u}[\ell,k]}{\partial\boldsymbol\eta_{s,u}}\right)^{H}\right\},\tag{7}
$$

$$
=\frac{2}{N_0\Delta f}\sum_{\ell=1}^{L_p}\sum_{k=1}^{K}\Re\left\{\mathbf G_{s,u}^{T}[\ell,k]\mathbf f_s[\ell,k]\mathbf f_s[\ell,k]^{H}\mathbf G_{s,u}^{*}[\ell,k]\right\}.
$$

**3）$\acute{\boldsymbol\eta}_u$ 的 FIM。** 把 $\mathbf J_s(\boldsymbol\eta_{s,u})=[\mathbf X,\mathbf Y;\mathbf Y^{T},\mathbf Z]$ 分块，其中 $\mathbf X\in\mathbb R^{2\times2}$，则可计算全部利用的信道域参数 $\acute{\boldsymbol\eta}_{s,u}$ 的 FIM 为 $\mathbf J_s(\acute{\boldsymbol\eta}_{s,u})=\mathbf X-\mathbf Y\mathbf Z^{-1}\mathbf Y^{T}$。进而得到 $\acute{\boldsymbol\eta}_u$ 的 FIM：

$$
\mathbf J(\acute{\boldsymbol\eta}_u)=\operatorname{blkdiag}\left\{\mathbf J_1(\acute{\boldsymbol\eta}_{1,u}),\ldots,\mathbf J_S(\acute{\boldsymbol\eta}_{S,u})\right\}.\tag{8}
$$

据此可推断，无论采用何种算法，$\acute{\boldsymbol\eta}_u$ 上可达的最低估计误差由高斯分布 $\mathcal N(\mathbf 0,\mathbf J^{-1}(\acute{\boldsymbol\eta}_u))$ 刻画；任何达到该误差协方差矩阵的算法称为**有效估计器**。

**4）MCRB 与 LB 推导。** 假设采用有效估计器估计 $\acute{\boldsymbol\eta}_u$。下面聚焦位置域参数的估计，前述模型误设定即发生于此。考虑每个卫星–UT 对具有不同时钟偏差 $b_{s,u}$ 与 CFO $\delta_{s,u}$ 的场景。为方便，用 $b_u$、$\delta_u$ 表示 $S$ 颗卫星间的平均时钟偏差与 CFO，于是可把各自值重写为 $b_{s,u}=b_u+\Delta b_{s,u}$、$\delta_{s,u}=\delta_u+\Delta\delta_{s,u}$，其中 $\Delta b_{s,u}$、$\Delta\delta_{s,u}$ 表示各自差异。

令 $\mathbf v_s\in\mathbb R^{3}$ 为第 $s$ 颗 LEO 卫星的速度。由于 LEO 卫星速度通常远高于 UT，本文忽略 UT 侧速度贡献。该假设的合理性在于：LEO 卫星速度约 7.6 km/s，而 UT 通常仅以数 m/s（行人）到数百 m/s（车辆／飞机）移动，其速度贡献小两到三个数量级，对多普勒项可忽略。基于底层几何关系，$\acute{\boldsymbol\eta}_u$ 各元素与第 $u$ 个 UT 未知位置之间的前向模型可表示为

$$
\upsilon_{s,u}=\frac{\mathbf v_s^{T}(\mathbf p_u-\mathbf p_s)}{\lambda\lVert\mathbf p_u-\mathbf p_s\rVert}+\delta_u+\Delta\delta_{s,u}\tag{9}
$$

与

$$
\tau_{s,u}=\frac{\lVert\mathbf p_u-\mathbf p_s\rVert}{c}+b_u+\Delta b_{s,u},\tag{10}
$$

本文称之为**真实模型**。其中 $\mathbf p_u\in\mathbb R^{3}$ 与 $\mathbf p_s\in\mathbb R^{3}$ 分别表示第 $u$ 个 UT 与第 $s$ 颗卫星的位置（脚注 7）。

实际应用中，为算法简便常忽略这些时钟偏差与 CFO 差异，即假设所有卫星–UT 对具有相同时钟偏差与 CFO。为计入此类模型误设定的影响，本文推导 MCRB（其基础见附录 A）。忽略各自差异时，**误设定模型**为

$$
\upsilon_{s,u}=\frac{\mathbf v_s^{T}(\mathbf p_u-\mathbf p_s)}{\lambda\lVert\mathbf p_u-\mathbf p_s\rVert}+\delta_u\tag{11}
$$

与

$$
\tau_{s,u}=\frac{\lVert\mathbf p_u-\mathbf p_s\rVert}{c}+b_u.\tag{12}
$$

现假设某估计器基于真实观测 $\acute{\boldsymbol\eta}_u$ 与误设定模型估计第 $u$ 个 UT 的未知位置；误设定模型中的全部未知参数可拼接为 $\mathbf r_u=[\mathbf p_u^{T},\delta_u,b_u]^{T}\in\mathbb R^{5}$。基于真实模型与误设定模型，可分别写出真实似然函数 $\xi_{\mathrm T}$ 与误设定似然函数 $\xi_{\mathrm M}$ 为

$$
\xi_{\mathrm T}(\acute{\boldsymbol\eta}_u;\mathbf r_u)\propto e^{\left(\acute{\boldsymbol\eta}_u-\bar{\mathbf f}(\mathbf r_u)\right)^{T}\boldsymbol\Sigma^{-1}\left(\acute{\boldsymbol\eta}_u-\bar{\mathbf f}(\mathbf r_u)\right)}\tag{13}
$$

与

$$
\xi_{\mathrm M}(\acute{\boldsymbol\eta}_u;\mathbf r_u)\propto e^{\left(\acute{\boldsymbol\eta}_u-\widetilde{\mathbf f}(\mathbf r_u)\right)^{T}\boldsymbol\Sigma^{-1}\left(\acute{\boldsymbol\eta}_u-\widetilde{\mathbf f}(\mathbf r_u)\right)},\tag{14}
$$

其中函数 $\bar{\mathbf f}(\cdot)$ 按真实模型把 $\mathbf r_u$ 映射到 $\acute{\boldsymbol\eta}_u$，函数 $\widetilde{\mathbf f}(\cdot)$ 按误设定模型把 $\mathbf r_u$ 映射到 $\acute{\boldsymbol\eta}_u$。如第 III-A3 节所述，$\acute{\boldsymbol\eta}_u$ 是有效估计器给出的信道域参数估计，即 $\acute{\boldsymbol\eta}_u\sim\mathcal N(\bar{\mathbf f}(\mathbf r_u),\boldsymbol\Sigma)$，其中 $\boldsymbol\Sigma=\mathbf J^{-1}(\acute{\boldsymbol\eta}_u)$。

> **脚注 7（原文）：** 假设 LEO 卫星位置在 UT 处精确已知。该信息可取自两行元素文件中包含的星历，这些文件由北美防空司令部（NORAD）每日更新 [36]。

> **原文疑点：** 式 (13)、(14)（以及式 (22)、(23)）把似然写成 $e^{\,\boldsymbol\epsilon^{T}\boldsymbol\Sigma^{-1}\boldsymbol\epsilon}$ 而未带负号。对高斯观测而言，标准似然应为 $\exp\{-(\cdot)^{T}\boldsymbol\Sigma^{-1}(\cdot)\}$ 形式；此处按 PDF 渲染原样照录，未擅自添加负号，供读者注意。

- **伪真参数：** 按式 (40)，伪真参数（记为 $\widetilde{\mathbf r}_u$）由下式给出

$$
\widetilde{\mathbf r}_u=\arg\min_{\mathbf r_u}\mathcal D\left\{\xi_{\mathrm T}(\acute{\boldsymbol\eta}_u;\bar{\mathbf r}_u)\,\Vert\,\xi_{\mathrm M}(\acute{\boldsymbol\eta}_u;\mathbf r_u)\right\},\tag{15}
$$

$$
=\arg\min_{\mathbf r_u}\left(\bar{\mathbf f}(\bar{\mathbf r}_u)-\widetilde{\mathbf f}(\mathbf r_u)\right)^{T}\boldsymbol\Sigma^{-1}\left(\bar{\mathbf f}(\bar{\mathbf r}_u)-\widetilde{\mathbf f}(\mathbf r_u)\right),
$$

其中上划线用于强调真实的位置域参数与前向模型。该问题可用带回溯线搜索的梯度下降求解，以真实参数为初值 [52]。

- **MCRB：** 按附录 A，广义 FIM 即 $\mathbf A_{\widetilde{\mathbf r}_u}$ 与 $\mathbf B_{\widetilde{\mathbf r}_u}$，可通过求 $\widetilde{\mathbf f}(\mathbf r_u)$ 关于 $\mathbf r_u$ 各元素的一阶与二阶导数得到（详见附录 B）。于是 MCRB 为

$$
\mathrm{MCRB}(\widetilde{\mathbf r}_u)=\mathbf A_{\widetilde{\mathbf r}_u}^{-1}\mathbf B_{\widetilde{\mathbf r}_u}\mathbf A_{\widetilde{\mathbf r}_u}^{-1}.\tag{16}
$$

- **LB：** 最后，估计误差下界（LB）矩阵可计算为

$$
\mathrm{LBM}(\widetilde{\mathbf r}_u)=\mathrm{MCRB}(\widetilde{\mathbf r}_u)+\mathrm{Bias}(\widetilde{\mathbf r}_u),\tag{17}
$$

其中 $\mathrm{Bias}(\widetilde{\mathbf r}_u)=(\bar{\mathbf r}_u-\widetilde{\mathbf r}_u)(\bar{\mathbf r}_u-\widetilde{\mathbf r}_u)^{T}$。基于式 (17)，存在模型误设定时第 $u$ 个 UT 位置估计期望均方根误差（RMSE）的 LB 为

$$
\mathrm{LB}(\mathbf p_u)=\sqrt{\operatorname{Tr}\left([\mathrm{LBM}(\widetilde{\mathbf r}_u)]_{1:3,1:3}\right)}.\tag{18}
$$

### B. 小时间尺度上行信道估计

**1）信号模型。** 获得 UT 位置后，这些大时间尺度参数被反馈给 LEO 卫星。PACE 的第二阶段聚焦通过上行信道估计在 LEO 卫星侧估计小时间尺度参数（即信道增益），随后完成信道重建。

令 $\mathbf d_{s,u}[\ell,k]=\mathbf a(\boldsymbol\theta_{s,u})\sqrt{P_u/K}\,t_u[\ell,k]$，其中 $P_u$ 为第 $u$ 个 UT 的发射功率，$t_u[\ell,k]$ 为第 $u$ 个 UT 在第 $\ell$ 个符号、第 $k$ 个子载波上发送的单位模导频；所有子载波采用均匀功率分配。如前所述，多普勒频移在 LEO 卫星通信中可大幅缓解；为简便，下行定位中利用之后即从上行信道估计与下行通信的信号模型中去除。此处同样假设 UT 采用 TDMA 正交复用。由信道互易性，第 $s$ 颗 LEO 卫星从第 $u$ 个 UT 接收的信号为

$$
\mathbf y_{s,u}[\ell,k]=\underbrace{\vartheta_{s,u}e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\mathbf d_{s,u}[\ell,k]}_{\bar{\mathbf g}_{s,u}[\ell,k]}+\mathbf z_s[\ell,k],\tag{19}
$$

其中 $\mathbf z_s[\ell,k]\sim\mathcal{CN}(0,N_0\Delta f\mathbf I_N)$ 表示 AWGN。可以看到 $\mathbf d_{s,u}[\ell,k]$ 由 UT 位置反馈直接确定；因此不必估计完整信道向量，只需估计两个标量，即信道增益 $\vartheta_{s,u}$ 与 TOA $\tau_{s,u}$（脚注 8）。这显著简化了上行信道估计任务。然而由于位置信息来自估计而非真值，模型误设定再次出现。基于估计位置信息（误设定模型）的接收信号为

$$
\mathbf y_{s,u}[\ell,k]=\underbrace{\vartheta_{s,u}e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\widetilde{\mathbf d}_{s,u}[\ell,k]}_{\widetilde{\mathbf g}_{s,u}[\ell,k]}+\mathbf z_s[\ell,k],\tag{20}
$$

其中 $\widetilde{\mathbf d}_{s,u}[\ell,k]=\mathbf a(\widetilde{\boldsymbol\theta}_{s,u})\sqrt{P_u/K}\,t_u[\ell,k]$。这里 $\widetilde{\boldsymbol\theta}_{s,u}$ 表示基于估计位置 $\widetilde{\mathbf p}_u$ 与几何关系算出的到达角（AOA）：

$$
\widetilde\theta_{s,u}^{\mathrm{az}}=\operatorname{atan2}\left([\widetilde{\mathbf p}_u-\mathbf p_s]_{2},[\widetilde{\mathbf p}_u-\mathbf p_s]_{1}\right),\tag{21a}
$$

$$
\widetilde\theta_{s,u}^{\mathrm{el}}=\arcsin\left(\frac{[(\widetilde{\mathbf p}_u-\mathbf p_s)]_{3}}{\lVert\widetilde{\mathbf p}_u-\mathbf p_s\rVert}\right).\tag{21b}
$$

**2）MCRB 与 LB 推导。** 记全部时频观测为 $\mathbf y_{s,u}=[\mathbf y_{s,u}^{T}[1,1],\ldots,\mathbf y_{s,u}^{T}[1,K],\ldots,\mathbf y_{s,u}^{T}[L_c,K]]^{T}\in\mathbb C^{L_cKN}$，其中 $L_c$ 为上行信道估计所用导频符号数。令 $\boldsymbol\eta_{s,u}=[\Re(\vartheta_{s,u}),\Im(\vartheta_{s,u}),\tau_{s,u}]^{T}\in\mathbb R^{3}$ 汇集上行信道估计中待估参数。真实模型与误设定模型下的似然函数分别为

$$
\xi_{\mathrm T}(\mathbf y_{s,u};\boldsymbol\eta_{s,u})\propto e^{\left\|\mathbf y_{s,u}-\bar{\mathbf g}(\boldsymbol\eta_{s,u})\right\|^{2}}\tag{22}
$$

与

$$
\xi_{\mathrm M}(\mathbf y_{s,u};\boldsymbol\eta_{s,u})\propto e^{\left\|\mathbf y_{s,u}-\widetilde{\mathbf g}(\boldsymbol\eta_{s,u})\right\|^{2}},\tag{23}
$$

其中定义 $\bar{\mathbf g}(\boldsymbol\eta_{s,u})=[\bar{\mathbf g}_{s,u}^{T}[1,1],\ldots,\bar{\mathbf g}_{s,u}^{T}[1,K],\ldots,\bar{\mathbf g}_{s,u}^{T}[L_c,K]]^{T}\in\mathbb C^{L_cKN}$、$\widetilde{\mathbf g}(\boldsymbol\eta_{s,u})=[\widetilde{\mathbf g}_{s,u}^{T}[1,1],\ldots,\widetilde{\mathbf g}_{s,u}^{T}[1,K],\ldots,\widetilde{\mathbf g}_{s,u}^{T}[L_c,K]]^{T}\in\mathbb C^{L_cKN}$。

- **伪真参数：** 按附录 A，伪真参数（记为 $\widetilde{\boldsymbol\eta}_{s,u}$）由下式给出

$$
\widetilde{\boldsymbol\eta}_{s,u}=\arg\min_{\boldsymbol\eta_{s,u}}\mathcal D\left\{\xi_{\mathrm T}(\mathbf y_{s,u};\bar{\boldsymbol\eta}_{s,u})\,\Vert\,\xi_{\mathrm M}(\mathbf y_{s,u};\boldsymbol\eta_{s,u})\right\},
$$

$$
=\arg\min_{\boldsymbol\eta_{s,u}}\left\|\bar{\mathbf g}(\bar{\boldsymbol\eta}_{s,u})-\widetilde{\mathbf g}(\boldsymbol\eta_{s,u})\right\|^{2},\tag{24}
$$

其中参数上划线强调真实值。同样，采用梯度下降并以真实参数为初值，可高效求解上述问题 [52]。

- **MCRB：** 广义 FIM 即 $\mathbf A_{\widetilde{\boldsymbol\eta}_{s,u}}$ 与 $\mathbf B_{\widetilde{\boldsymbol\eta}_{s,u}}$，通过计算 $\widetilde{\mathbf q}(\boldsymbol\eta_{s,u})$ 关于 $\boldsymbol\eta_{s,u}$ 各元素的一阶与二阶导数得到（见附录 C）。据此 MCRB 为

$$
\mathrm{MCRB}(\widetilde{\boldsymbol\eta}_{s,u})=\mathbf A_{\widetilde{\boldsymbol\eta}_{s,u}}^{-1}\mathbf B_{\widetilde{\boldsymbol\eta}_{s,u}}\mathbf A_{\widetilde{\boldsymbol\eta}_{s,u}}^{-1}.\tag{25}
$$

- **LB：** 估计误差 LB 矩阵随后计算为

$$
\mathrm{LBM}(\widetilde{\boldsymbol\eta}_{s,u})=\mathrm{MCRB}(\widetilde{\boldsymbol\eta}_{s,u})+\mathrm{Bias}(\widetilde{\boldsymbol\eta}_{s,u}),\tag{26}
$$

其中 $\mathrm{Bias}(\widetilde{\boldsymbol\eta}_{s,u})=(\bar{\boldsymbol\eta}_{s,u}-\widetilde{\boldsymbol\eta}_{s,u})(\bar{\boldsymbol\eta}_{s,u}-\widetilde{\boldsymbol\eta}_{s,u})^{T}$。对有效估计器，存在模型误设定时信道增益 $\vartheta_{s,u}$ 与 TOA $\tau_{s,u}$ 的期望 RMSE 的 LB 分别为

$$
\mathrm{LB}(\vartheta_{s,u})=\sqrt{\operatorname{Tr}\left([\mathrm{LBM}(\widetilde{\boldsymbol\eta}_{s,u})]_{1:2,1:2}\right)}\tag{27}
$$

与

$$
\mathrm{LB}(\tau_{s,u})=\sqrt{[\mathrm{LBM}(\widetilde{\boldsymbol\eta}_{s,u})]_{3,3}},\tag{28}
$$

> **脚注 8（原文）：** 尽管 TOA $\tau_{s,u}$ 已在 Downlink Positioning 过程中估计过，它仍会在上行信道估计中作为标准 OFDM 处理的一部分被重新估计 [53]。除非 UT 与 LEO 卫星完全时间同步且传播时延精确已知——这在高动态 LEO 卫星环境中很难满足——否则该重估是必要的。

## IV. 下行通信的协作波束赋形

所提两时间尺度 PACE 可实现每颗 LEO 卫星与所有 UT 之间的信道重建，从而使基于 CSI 的下行波束赋形成为可能。为应对单星下行场景中有限的链路预算，本文引入多 LEO 卫星协作波束赋形，使每个 UT 同时由簇内卫星服务。注意本节发展的协作波束赋形优化基于**名义**信号模型：它把经 PACE 估计的信道参数视为真值，并假设卫星间时延／多普勒补偿完美。相反，仿真中的通信速率在**真实**信道参数与非完美补偿条件下评估。这种分离可直接评估 PACE 的有效性：比较用名义（PACE 估计）参数优化的波束成形器所达到的性能，其与真实参数优化波束成形器之间的差距越小，PACE 越可靠。发展显式考虑 CSI 不确定性（如 [27]、[54]、[55]）和／或非完美补偿引起的异步干扰（如 [23]）的稳健波束赋形策略，是重要但正交的研究方向，留待未来工作。

### A. 名义信号模型

在名义信号模型中，假设所有卫星间时延与多普勒补偿完美。该假设下，名义信道（记为 $\widetilde{\mathbf h}_{s,u}=\widetilde{\vartheta}_{s,u}\mathbf a(\widetilde{\boldsymbol\theta}_{s,u})$）是频率平坦的，其中波浪号表示估计值。这允许子载波相干波束赋形，即在所有子载波上应用同一波束成形器，从而降低优化复杂度。具体地，第 $s$ 颗 LEO 卫星在第 $k$ 个子载波上发送的信号为

$$
\mathbf x_s[k]=\mathbf W_s\mathbf s[k],\tag{29}
$$

其中 $\mathbf W_s=[\mathbf w_{s,1},\mathbf w_{s,2},\ldots,\mathbf w_{s,U}]\in\mathbb C^{N\times U}$ 表示第 $s$ 颗 LEO 卫星的波束成形器，$\mathbf s[k]\sim\mathcal{CN}(\mathbf 0,\mathbf I_U)$ 表示在第 $k$ 个子载波上发给 $U$ 个 UT 的数据流。第 $u$ 个 UT 在第 $k$ 个子载波上的接收信号为

$$
\mathbf y_u[k]=\sum_{s=1}^{S}\widetilde{\mathbf h}_{s,u}^{T}\mathbf w_{s,u}s_u[k]+\underbrace{\sum_{m\ne u}^{U}\sum_{s=1}^{S}\widetilde{\mathbf h}_{s,u}^{T}\mathbf w_{s,m}s_m[k]}_{\text{用户间干扰}}+\mathbf z_u[k],\tag{30}
$$

其中 $\mathbf z_u[k]\sim\mathcal{CN}(0,N_0\Delta f)$ 表示 AWGN。第 $u$ 个 UT 在所有子载波上聚合的名义可达通信速率为

$$
\widetilde R_u=B\log_2\left(1+\frac{\left|\sum_{s=1}^{S}\widetilde{\mathbf h}_{s,u}^{T}\mathbf w_{s,u}\right|^{2}}{\sum_{m\ne u}^{U}\left|\sum_{s=1}^{S}\widetilde{\mathbf h}_{s,u}^{T}\mathbf w_{s,m}\right|^{2}+N_0\Delta f}\right).\tag{31}
$$

### B. 问题建模

本文目标是优化各 LEO 卫星的波束成形器以最大化所有 UT 的和速率，优化问题为

$$
\max_{\mathbf W_s}\ \sum_{u=1}^{U}\widetilde R_u\qquad\text{s.t.}\quad\sum_{u=1}^{U}\lVert\mathbf w_{s,u}\rVert^{2}\le\frac{P_s}{K},\ \forall s,\tag{32}
$$

其中 $P_s$ 表示第 $s$ 颗 LEO 卫星的功率预算。

### C. 所提协作波束赋形方法

下面采用 WMMSE 优化框架 [56] 迭代求解 (32)。具体地，引入辅助变量 $\mu_u$ 与 $\omega_u$（分别作为 MMSE 均衡器与权重 [56]），(32) 可等价改写为

$$
\max_{\mu_u,\omega_u,\mathbf W_s}\ \sum_{u=1}^{U}\left(\ln\omega_u-\omega_u\Psi_u\right)\qquad\text{s.t.}\quad\sum_{u=1}^{U}\lVert\mathbf w_{s,u}\rVert^{2}\le\frac{P_s}{K},\ \forall s,\tag{33}
$$

其中 $\Psi_u=\left|1-\mu_u\sum_{s=1}^{S}\widetilde{\mathbf h}_{s,u}^{T}\mathbf w_{s,u}\right|^{2}+\left|\mu_u\right|^{2}\left(\sum_{m\ne u}^{U}\left|\sum_{s=1}^{S}\widetilde{\mathbf h}_{s,u}^{T}\mathbf w_{s,m}\right|^{2}+N_0\Delta f\right)$。问题 (33) 通过迭代更新 $\mathbf W_s$、$\omega_u$、$\mu_u$ 求解，细节如下。

**1）更新 $\mu_u$。** 固定 $\omega_u$ 与 $\mathbf W_s$，令 $\partial\Psi_u/\partial\mu_u=0$ 得最优 $\mu_u$：

$$
\mu_u=\frac{\left(\sum_{s=1}^{S}\widetilde{\mathbf h}_{s,u}^{T}\mathbf w_{s,u}\right)^{*}}{\sum_{m=1}^{U}\left|\sum_{s=1}^{S}\widetilde{\mathbf h}_{s,u}^{T}\mathbf w_{s,m}\right|^{2}+N_0\Delta f}.\tag{34}
$$

**2）更新 $\omega_u$。** 固定 $\mu_u$ 与 $\mathbf W_s$，令 $\partial\Psi_u/\partial\omega_u=0$ 得最优 $\omega_u$：

$$
\omega_u=\frac{1}{\Psi_u}.\tag{35}
$$

**3）更新 $\mathbf W_s$。** 固定 $\mu_u$ 与 $\omega_u$，求最优 $\mathbf W_s$ 的优化问题为

$$
\min_{\mathbf W_s}\ \sum_{u=1}^{U}\omega_u\Psi_u\qquad\text{s.t.}\quad\sum_{u=1}^{U}\lVert\mathbf w_{s,u}\rVert^{2}\le\frac{P_s}{K},\ \forall s.\tag{36}
$$

这里 $\Psi_u$ 可表示为半正定二次型与线性项之和。注意 (36) 关于 $\mathbf W_s$ 是凸 QCQP，可用 CVX 等标准工具箱求解；但该方法因所有卫星的波束成形器联合优化而每次迭代复杂度为 $\mathcal O((SNU)^{3})$。为更好适应计算资源受限的 LEO 场景，本文改而发展一种**低复杂度**方法，策略性地利用 BCD、强对偶与矩阵求逆性质（脚注 9）。这使求解 (36) 的主要复杂度从 $\mathcal O((SNU)^{3})$ 降至 $\mathcal O(SN^{3})$，细节见附录 D。求解 (32) 的整体流程见算法 1，其收敛性直接由算法的 BCD 结构得出。

> **脚注 9（原文）：** 尽管所提方案显著降低了复杂度，优化仍以集中方式（例如在簇头卫星处）进行，网络规模增大时可能出现可扩展性瓶颈。设计把优化分布到各参与卫星的去中心化策略以提升可扩展性，是重要研究方向但超出本文范围。感兴趣读者可参考我们近期关于网络化 LEO 卫星可扩展分布式波束赋形框架的工作 [57]。

**算法 1　求解 (32) 的所提算法**

```text
 1: 初始化: W_s, ∀s;
 2: repeat
 3:     由 (34) 更新 μ_u;
 4:     由 (35) 更新 ω_u;
 5:     for s = 1 : S do
 6:         求 R_s 的特征值分解;
 7:         在 (53) 上通过黄金分割搜索确定 λ;
 8:         由 (54) 确定 w_s 并重排得到 W_s;
 9:     end for
10: until 目标值的下降比例低于预设阈值，或达到预定迭代次数;
11: 输出: W_s, ∀s.
```

### D. 评估模型

如上所述，在用名义信号模型（含 PACE 估计的信道参数与理想星间补偿）求解优化问题得到协作波束成形器后，本文用更**真实**的评估模型评价可达通信性能：该模型采用**真实**信道参数并显式计入实际补偿非理想。这种分离是有意为之：通过考察用名义（PACE 估计）参数优化的波束成形器在真实设置中的表现，可直接评估 PACE 的有效性。

沿用 [18]、[24] 所采用的无多普勒补偿假设，为简便评估模型不依赖发射端显式多普勒预补偿；同时计入非完美时延补偿，它会在子载波间引起残余相位旋转。此外，受 [22]、[23]、[58] 启发，进一步计入多 LEO 协作传输中因各用户链路相关时延失配而产生的**异步干扰**。

具体地，时延预补偿后，第 $u$ 个 UT 在第 $k$ 个子载波上的接收信号建模为（脚注 10）

$$
y_u[k]=\sum_{s=1}^{S}e^{-\jmath 2\pi k\Delta f(\tau_{s,u}-\widetilde\tau_{s,u})}\bar{\mathbf h}_{s,u}^{T}[k]\mathbf w_{s,u}s_u[k]
+\sum_{m\ne u}^{U}\sum_{s=1}^{S}e^{-\jmath 2\pi k\Delta f(\tau_{s,u}-\widetilde\tau_{s,m})}\bar{\mathbf h}_{s,u}^{T}[k]\mathbf w_{s,m}s_m[k]+z_u[k],\tag{37}
$$

其中 $\bar{\mathbf h}_{s,u}[k]=\alpha_{s,u}G(\theta_{s,u}^{\mathrm{el}})\mathbf a(\boldsymbol\theta_{s,u})$ 表示（近似）频率平坦的阵列响应项，而残余时延失配由式 (37) 中依赖子载波的相位旋转显式刻画。

相应地，评估模型下第 $u$ 个 UT 的可达速率为

$$
R_u=\Delta f\sum_{k=1}^{K}\log_2\left(1+\frac{\left|\sum_{s=1}^{S}e^{-\jmath 2\pi k\Delta f(\tau_{s,u}-\widetilde\tau_{s,u})}\bar{\mathbf h}_{s,u}^{T}[k]\mathbf w_{s,u}\right|^{2}}{\sum_{m\ne u}^{U}\left|\sum_{s=1}^{S}e^{-\jmath 2\pi k\Delta f(\tau_{s,u}-\widetilde\tau_{s,m})}\bar{\mathbf h}_{s,u}^{T}[k]\mathbf w_{s,m}\right|^{2}+N_0\Delta f}\right),\tag{38}
$$

它明确显示：即使施加时延预补偿，用户间链路相关的时延失配仍会使异步干扰持续存在。

> **脚注 10（原文）：** 假设 $\widetilde\tau_{s,m}$ 与 $\tau_{s,m}$ 之差小于循环前缀（CP）长度。

## V. 数值结果

### A. 仿真参数

把地球建模为半径 $6400$ km 的球体，并采用以地心为中心的球坐标系。UT 随机分布于地球表面半径 $200$ km 的圆形服务区内 [28]。参与协作的 LEO 卫星位于空间对应的圆形区域内，该区域沿地心到地面服务区中心的连线延伸、轨道高度 $500$ km。每颗卫星以恒定速度 $|\mathbf v_s|=7.6$ km/s 沿与该连线相交的轨道运动，速度向量 $\mathbf v_s$ 与轨道相切，UPA 朝向地心。由于时域与频域同步非理想，每颗卫星与 UT 之间的时钟偏差（分别地，CFO）在 $8$ ns 到 $12$ ns（分别地，$\Delta f/120$ 到 $\Delta f/80$）之间随机取值，并在整个仿真中固定。为避免涉及卫星切换，考虑一个包含 $100$ 个小时间尺度信道增益相干子帧的大时间尺度位置相干帧，其中信道增益在子帧间独立变化；为简便，整个帧内卫星星座拓扑保持不变。下行定位与上行信道估计分别使用 $L_p=10000$ 与 $L_c=1000$ 个导频符号。

每颗 LEO 卫星到每个 UT 的信道增益由式 (3) 在每个信道增益相干时隙独立生成；随机相位 $\psi_{s,u}$ 在 $[0,2\pi]$ 上均匀分布（原文作 "uniformly cooperative"，疑为 "uniformly distributed" 之笔误，见状态段）。构成路径损耗 $\beta_{s,u}$ 的各分量按式 (4) 生成。自由空间路径损耗为 $\beta_{s,u}^{\mathrm{FS}}=20\log_{10}(\lVert\mathbf p_u-\mathbf p_s\rVert)+20\log_{10}(f_c)-147.55$ [dB] [41]。依赖信号频率与卫星仰角的大气吸收 $\beta_{s,u}^{\mathrm{AB}}$ 按国际电信联盟（ITU）建议 [59] 计算，并使用现成 MATLAB 脚本 [36] 配置。在所考虑的 LOS 主导的郊区／农村／偏远场景中，源自近地表结构的杂波损耗 $\beta_{s,u}^{\mathrm{CL}}$ 与阴影衰落 $\beta_{s,u}^{\mathrm{SF}}$ 通常较弱 [60]，因此为方便取 $\beta_{s,u}^{\mathrm{CL}}=0$ dB、$\beta_{s,u}^{\mathrm{SF}}=0$ dB。此外，$6$ GHz 以上频率可忽略电离层闪烁 [41]。对于难以解析建模的对流层闪烁引起的 $\beta_{s,u}^{\mathrm{SC}}$，采用 [36] 建议的示例作为参考值。其余仿真参数列于表 I。

**表 I：仿真参数。**

| 参数 | 取值 |
|---|---|
| 中心载频 $f_c$ | 12.7 GHz（Ku 波段） |
| 子载波间隔 $\Delta f$ | 120 KHz |
| 子载波数 $K$ | 1024 |
| 每颗 LEO 卫星功率预算 | 50 dBm |
| 每个 UT 功率预算 | 40 dBm |
| PSD $N_0$ | −173.855 dBm/Hz |
| 噪声系数 $F$ | 10 dB |
| LEO 卫星数 $S$ | 4 |
| UT 数 $U$ | 8 |
| 天线数 $N=N_h\times N_v$ | 16×16 |
| 天线辐射增益 $G(\cdot)$ | $\sqrt{\frac{3}{4\pi}\cos(\theta)}$ [39] |

### B. 对比方案

**1）下行定位。** 由于不优化波束赋形矩阵 $\mathbf F_s$，它按两条原则直接生成，取决于是否利用位置信息：

- **位置辅助波束赋形（PAB）：** 利用上一位置相干帧获得的 UT 位置信息，每颗 LEO 卫星把 $\mathbf F_s$ 构造为其列对应各 UT 估计方向导向矢量共轭的矩阵，即 $\mathbf F_s=\bar\zeta_s[\mathbf a^{*}(\widehat{\boldsymbol\theta}_{s,1}),\ldots,\mathbf a^{*}(\widehat{\boldsymbol\theta}_{s,U})]$，其中 $\bar\zeta_s$ 为保证满足功率预算的归一化因子。
- **垂直指向波束赋形（VDB）：** 无位置信息时，每颗 LEO 卫星产生指向地心的垂直波束；此时波束赋形矩阵退化为仰角 $\pi/2$ 的导向矢量。

**2）上行信道估计。** 依据 LEO 卫星处位置信息的可用性，考虑三类方案评估上行信道估计性能：

- **PACE：** 所提两时间尺度下行定位 + 上行信道估计混合方案，其性能通过 MCRB 分析严格刻画。
- **Perfect-PACE：** 理想基准，假设 LEO 卫星可获得 UT 的完美位置信息；此时上行信道估计在不含模型误设定的条件下评估，并用 CRB 分析。
- **上行信道估计（UCE）：** 如前所述，无位置信息时信道向量（即 $\mathbf h_{s,u}[k]=e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\alpha_{s,u}G(\theta_{s,u}^{\mathrm{el}})\mathbf a(\boldsymbol\theta_{s,u})$）可在上行用**几何无关**方法直接估计。令 $\mathbf h_{s,u}=\alpha_{s,u}G(\theta_{s,u}^{\mathrm{el}})\mathbf a(\boldsymbol\theta_{s,u})$，本文通过推导 CRB 分析同时估计 $\mathbf h_{s,u}$ 与 $\tau_{s,u}$ 的性能极限。该推导扩展了 [53] 中原本面向单载波系统的方法。

**3）下行通信。** 为评估下行通信性能，用上述信道估计方案得到的 CSI 执行协作波束赋形（如算法 1 所述，因为卫星只能获得估计 CSI）；随后用真实 CSI 测试所得波束成形器，得到实际和速率。另考虑两个基准方案：

- **PAB：** 与下行定位中所述方案相同。
- **无协作（NC）：** 每个 UT 仅由信号最强的那颗 LEO 卫星服务，从而避免星间协作。WMMSE 算法在各卫星处独立应用，仅基于自身对关联 UT 的 CSI 优化其波束成形器，而来自其他卫星的信号被视为干扰。

### C. 下行定位

如图 3 所示，比较 PAB 与 VDB 在不同单星功率预算下的定位误差界与偏差。结果表明：无模型误设定时的定位误差 LB（由完美时频同步卫星下的定位 CRB 表示）随发射功率增大而下降；相反，存在同步失配时 LB 先下降，但最终因不受发射功率影响的持续定位偏差而饱和。这凸显 LEO 卫星间时频同步非理想对定位性能的负面影响 [35]、[37]，可能导致过于乐观的性能评估。此外，PAB 因达到更低 LB 而始终优于 VDB，且在更低但更实用的发射功率水平下增益尤为显著（超过一个数量级）。该优势源于 PAB 能利用位置信息把更多功率分配给 UT（相比 VDB），凸显把先验位置知识纳入定位系统设计的重要性。

图 4 分析卫星–UT 对间时钟偏差与 CFO（二者均假设在 0 与其各自最大值之间均匀分布）变化对（PAB 下）定位误差 LB 的影响。结果表明，任一因素增大都会使定位性能显著恶化；特别地，即使时钟偏差在数十至数百纳秒量级、或 CFO 为数千赫兹，也可能导致超过 $100$ m 的定位误差。这些发现说明两类损伤严重程度相当，并强调在时域与频域同时缓解失配以确保高精度 LEO 定位的关键重要性。

### D. 上行信道估计

图 5(a) 与 (b) 评估所提 PACE 在不同定位误差下信道增益与 TOA 估计的归一化 RMSE（即 RMSE 除以真实参数），并与假设无定位误差模型误设定的 Perfect-PACE 对比。结果表明：定位误差较小时，PACE 的 LB 对两种参数都与 Perfect-PACE 接近；但随着定位误差增大，PACE 性能因模型误设定增大而恶化。对信道增益估计，可观察到 MCRB 引起的误差对定位误差相对不敏感，而偏差分量随定位误差成比例增大，最终成为总体信道增益误差的主要来源。TOA 估计表现不同：其偏差先随定位误差增大而后进入平台，而 MCRB 引起的误差持续增长，最终成为 TOA 总估计误差的主导。尽管如此，结果表明只有当定位误差变得**不切实际地大**（例如超过 1 km）时信道估计才明显退化。这一观察凸显 PACE 在 LOS 主导、卫星高度较高的场景中对定位非理想的稳健性。

图 6(a) 与 (b) 比较所提 PACE 与 UCE 下信道向量与 TOA 估计 RMSE 的 LB 随 UT 功率预算的变化。注意 PACE 估计信道增益 $\alpha_{s,u}$ 与 TOA $\tau_{s,u}$，而 UCE 除 $\tau_{s,u}$ 外还估计信道向量 $\mathbf h_{s,u}=\alpha_{s,u}G(\theta_{s,u}^{\mathrm{el}})\mathbf a(\boldsymbol\theta_{s,u})$（不含 TOA 引起的相位）。为统一比较，本文通过代数变换把 PACE 中信道增益估计 RMSE 的 LB 转换为相应的信道向量估计 RMSE 的 LB（采用 $\widehat{\mathbf h}_{s,u}=\widehat\alpha_{s,u}G(\widehat\theta_{s,u}^{\mathrm{el}})\mathbf a(\widehat{\boldsymbol\theta}_{s,u})$ 的形式）。如图，鉴于定位阶段产生的定位误差可忽略，PACE 的 TOA 估计性能与 UCE 接近。该一致性源于 TOA 估计与另一未知参数是信道增益还是信道向量无关；这一无关性可通过推导 Perfect-PACE 与 UCE 下 TOA 估计的 CRB 直接证明，因篇幅所限从略。相比之下，PACE 在信道向量估计上显著优于 UCE：这一优势归因于 PACE 利用位置信息，把估计向量（UCE 所需）的复杂度降为估计标量，尽管会受定位误差影响。因此，在相同导频长度与功率预算下，PACE 获得更高的信道估计精度。

### E. 下行通信

图 7 比较各方案下行通信和速率随每颗 LEO 卫星天线数的变化。可以看到，算法 1 结合 PACE 显著优于 UCE 与其他基线，和速率接近完美 CSI 下的结果。该优越性能归因于 PACE 更高的信道重建精度以及多 LEO 卫星协作的益处。相反，无论使用 PACE 还是 UCE，NC 下的和速率始终高于 PAB 所得，即便 PAB 利用了星间协作。这凸显准确 CSI 在提升下行通信效率中的关键作用，其效果超出单凭位置信息所能达到的水平。此外，随每颗 LEO 卫星天线数增加，所提方案（PACE 与算法 1 的组合）的性能优势愈发明显，展示其在大规模天线阵下支撑高吞吐 LEO 卫星通信的潜力。

如图 8 所示，比较各方案和速率随每 UT 功率预算的变化。可以看到 PAB 下的和速率与 UT 发射功率无关；相反，随 UT 发射功率增大，算法 1 与 NC 的和速率也增大。这是因为更高发射功率改善信道估计精度，进而减小用于优化波束赋形的信道参数与真实参数之间的失配，从而提升和速率。具体地，算法 1 的和速率显著优于 NC 与 PAB，并逐渐接近完美 CSI 的性能，展示了多 LEO 卫星协作波束赋形的优越性。此外，由于 PACE 信道估计精度更高，其和速率显著高于 UCE，在 UT 发射功率较低时尤为如此。这凸显在 UT 功率预算受限时利用位置信息获得准确 CSI 的重要性，对手机等功率受限设备尤为相关。

## VI. 结论

本文提出一种在多 LEO 卫星系统中融合定位与通信的新框架，利用定位能力增强信道估计以促进通信。借助位置相关参数与信道增益的不同时间尺度变化，提出一种两时间尺度帧结构，策略性地调度下行定位、上行信道估计与下行通信。基于 MCRB 的严格分析刻画了星间时钟偏差与 CFO 等实际非理想对定位精度的影响；此外，通过 MCRB 分析从理论上证明：即使存在不可避免的定位误差，位置信息也能改善上行信道估计。为克服单星下行通信有限的链路预算，本文引入多星协作波束赋形优化方案，在降低复杂度的同时由簇内多颗卫星同时服务每个 UT。数值结果验证了理论发现。

除本文强调的定位辅助通信之外，研究相反方向对后续研究同样重要。例如，UT 间侧行链路通信与测距可实现邻近 UT 间的信息交换，并提供独立的定时与距离参考。此类机制有望缓解星间时钟偏差，从而提升整体定位精度。

## 图注与表注

**图 1：LEO 卫星簇沿轨道运行，同时为 UT 提供定位与通信服务。** 每个 UT 在两项功能上都由簇内全部 LEO 卫星服务。下行定位操作发生在相对较大的时间尺度上，而上行信道估计与下行通信在更小的时间尺度上进行；这些时间尺度的具体定义后文说明。

**图 2：两时间尺度帧结构示意。** 每个大时间尺度帧包含多个小时间尺度子帧；大时间尺度帧由位置相干时间支配，小时间尺度子帧由信道增益相干时间定义。

**图 3：定位 RMSE 下界随每颗 LEO 卫星功率预算的变化。** 图例区分 PAB 与 VDB 的 LB、MCRB、Bias 与 CRB；横轴为 10–80 dBm，纵轴为 RMSE（对数坐标，10⁰–10⁴ m）。

**图 4：定位 RMSE 下界随最大时钟偏差与 CFO 的变化。** 横轴分别为时钟偏差（0–1×10⁻⁶ s）与 CFO（0–10⁴ Hz），纵轴为 RMSE（对数坐标）。

**图 5：上行信道估计 RMSE 下界随定位误差的变化。** (a) 信道向量估计；(b) TOA 估计。图例：Perfect-PACE 的 CRB、PACE 的 LB／MCRB／Bias。

**图 6：上行信道估计 RMSE 下界随每 UT 功率预算的变化。** (a) 信道向量估计；(b) TOA 估计。图例：PACE、Perfect-PACE、UCE。

**图 7：和速率随每颗 LEO 卫星天线数的变化。** 图例：PACE+算法 1、UCE+算法 1、Perfect CSI+算法 1、PAB、PACE+NC、UCE+NC。

**图 8：和速率随每 UT 功率预算的变化。** 图例同图 7。

**图 9：基于 QCQP 与所提低复杂度算法的运行时间与和速率比较。** (a) 运行时间随 LEO 卫星数；(b) 和速率随 LEO 卫星数；(c) 运行时间随每星天线数；(d) 和速率随每星天线数；(e) 运行时间随 UT 数；(f) 和速率随 UT 数。

**表注：** 原文仅含表 I（仿真参数，见第 V-A 节）；其余为图。

## 参考文献（英文原书目）

以下按原文编号逐条转录，条目文字不翻译（共 60 条，源文 pp. 15–16）。

[1] Y. Zhang et al., "Challenges and opportunities of future rural wireless communications," IEEE Communications Magazine, vol. 59, no. 12, pp. 16–22, 2021.

[2] J. G. Andrews et al., "6G takes shape," IEEE BITS the Information Theory Magazine, pp. 1–38, 2024.

[3] G. Pan et al., "Latency versus reliability in LEO mega-constellations: Terrestrial, aerial, or space relay?" IEEE Transactions on Mobile Computing, vol. 22, no. 9, pp. 5330–5345, 2023.

[4] J. An et al., "Electromagnetic situation awareness and modeling for space–air–ground integrated networks," National Science Review, vol. 13, no. 1, p. nwaf492, 11 2025.

[5] T. Li et al., "Ergodic capacity analysis for terrestrial-LEO-GEO relay systems with stochastic orbit modeling," IEEE Transactions on Vehicular Technology, vol. 74, no. 12, pp. 19 737–19 742, 2025.

[6] Y. Li et al., "A signal reacquisition based on cross-entropy and postdetection with data modulation for LEO satellite communications," IEEE Transactions on Aerospace and Electronic Systems, vol. 61, no. 6, pp. 18 067–18 080, 2025.

[7] Z. Ni et al., "LLM aided spectrum-sharing LEO satellite communications," IEEE Journal on Selected Areas in Communications, pp. 1–1, 2025.

[8] A. Papathanassiou et al., "A comparison study of the uplink performance of W-CDMA and OFDM for mobile multimedia communications via LEO satellites," IEEE Personal Communications, vol. 8, no. 3, pp. 35–43, 2001.

[9] S. Liu et al., "LEO satellite constellations for 5G and beyond: How will they reshape vertical domains?" IEEE Communications Magazine, vol. 59, no. 7, pp. 30–36, 2021.

[10] J. Ma et al., "Integrated positioning and communication via LEO satellites: Opportunities and challenges," arXiv preprint arXiv: 2411.14360, 2024.

[11] K.-X. Li et al., "Channel estimation for LEO satellite massive MIMO OFDM communications," IEEE Transactions on Wireless Communications, vol. 22, no. 11, pp. 7537–7550, 2023.

[12] M. Khammassi et al., "Precoding for high-throughput satellite communication systems: A survey," IEEE Communications Surveys & Tutorials, vol. 26, no. 1, pp. 80–118, 2024.

[13] A. M. Darya et al., "Semi-blind channel estimation for massive MIMO LEO satellite communications," IEEE Communications Letters, vol. 29, no. 1, pp. 75–79, 2025.

[14] P.-D. Arapoglou et al., "MIMO over satellite: A review," IEEE Communications Surveys & Tutorials, vol. 13, no. 1, pp. 27–51, 2011.

[15] M. Y. Abdelsadek et al., "Distributed massive MIMO for LEO satellite networks," IEEE Open Journal of the Communications Society, vol. 3, pp. 2162–2177, 2022.

[16] ——, "Broadband connectivity for handheld devices via LEO satellites: Is distributed massive MIMO the answer?" IEEE Open Journal of the Communications Society, vol. 4, pp. 713–726, 2023.

[17] Z. Xiang et al., "Massive MIMO downlink transmission for multiple LEO satellite communication," IEEE Transactions on Communications, vol. 72, no. 6, pp. 3352–3364, 2024.

[18] Y.-Y. He et al., "Physical beam sharing for communications with multiple low earth orbit satellites," IEEE Transactions on Signal Processing, vol. 72, pp. 2783–2798, 2024.

[19] X. Zhang et al., "Multi-satellite cooperative networks: Joint hybrid beamforming and user scheduling design," IEEE Transactions on Wireless Communications, vol. 23, no. 7, pp. 7938–7952, 2024.

[20] D. Kim et al., "Coverage analysis of dynamic coordinated beamforming for LEO satellite downlink networks," IEEE Transactions on Wireless Communications, vol. 23, no. 9, pp. 12 239–12 255, 2024.

[21] Y. Zhang et al., "Distributed integrated sensing, localization, and communications over LEO satellite constellations," IEEE Wireless Communications, pp. 1–1, 2026.

[22] X. Chen et al., "Asynchronous interference mitigation for LEO multi-satellite cooperative systems," IEEE Transactions on Wireless Communications, vol. 23, no. 10, pp. 14 956–14 971, 2024.

[23] S. Wu et al., "Distributed beamforming for multiple LEO satellites with imperfect delay and doppler compensations: Modeling and rate analysis," IEEE Transactions on Vehicular Technology, vol. 74, no. 9, pp. 14 978–14 984, 2025.

[24] S. Kim et al., "Cell-free massive non-terrestrial networks," IEEE Journal on Selected Areas in Communications, vol. 43, no. 1, pp. 201–217, 2025.

[25] R. Di Taranto et al., "Location-aware communications for 5G networks: How location information can improve scalability, latency, and robustness of 5G," IEEE Signal Processing Magazine, vol. 31, no. 6, pp. 102–112, 2014.

[26] N. Gonzalez-Prelcic et al., "Millimeter-wave communication with out-of-band information," IEEE Communications Magazine, vol. 55, no. 12, pp. 140–146, 2017.

[27] F. Jiang et al., "Two-timescale transmission design and RIS optimization for integrated localization and communications," IEEE Transactions on Wireless Communications, vol. 22, no. 12, pp. 8587–8602, 2023.

[28] G. Kwon et al., "Integrated localization and communication for efficient millimeter wave networks," IEEE Journal on Selected Areas in Communications, vol. 41, no. 12, pp. 3925–3941, 2023.

[29] G. Zhou et al., "Individual channel estimation for RIS-aided communication systems—a general framework," IEEE Transactions on Wireless Communications, vol. 23, no. 9, pp. 12 038–12 053, 2024.

[30] Z. M. Kassas et al., "Ad astra: Simultaneous tracking and navigation with megaconstellation LEO satellites," IEEE Aerospace and Electronic Systems Magazine, vol. 39, no. 9, pp. 46–71, 2024.

[31] R. M. Ferre et al., "Is LEO-based positioning with mega-constellations the answer for future equal access localization?" IEEE Communications Magazine, vol. 60, no. 6, pp. 40–46, 2022.

[32] P. Zheng et al., "LEO satellite and RIS: Two keys to seamless indoor and outdoor localization," arXiv preprint arXiv:2312.16946, 2025.

[33] H. K. Dureppagari et al., "NTN-based 6G localization: Vision, role of LEOs, and open problems," IEEE Wireless Communications, vol. 30, no. 6, pp. 44–51, 2023.

[34] D.-R. Emenonye et al., "Fundamentals of LEO-based localization," IEEE Transactions on Information Theory, vol. 71, no. 7, pp. 5277–5311, 2025.

[35] H. Xu et al., "Joint beam scheduling and beamforming design for cooperative positioning in multi-beam LEO satellite networks," IEEE Transactions on Vehicular Technology, vol. 73, no. 4, pp. 5276–5287, 2024.

[36] P. Zheng et al., "LEO- and RIS-empowered user tracking: A riemannian manifold approach," IEEE Journal on Selected Areas in Communications, vol. 42, no. 12, pp. 3445–3461, 2024.

[37] L. You et al., "Integrated communications and localization for massive MIMO LEO satellite systems," IEEE Transactions on Wireless Communications, vol. 23, no. 9, pp. 11 061–11 075, 2024.

[38] S. Fortunati et al., "Performance bounds for parameter estimation under misspecified models: Fundamental findings and applications," IEEE Signal Processing Magazine, vol. 34, no. 6, pp. 142–157, Nov. 2017.

[39] C. A. Balanis, Antenna Theory: Analysis and Design. Wiley-Interscience, 2005.

[40] H. Wymeersch et al., "Radio localization and sensing—part I: Fundamentals," IEEE Communications Letters, vol. 26, no. 12, pp. 2816–2820, 2022.

[41] 3GPP, "Study on New Radio (NR) to support non-terrestrial networks," 3rd Generation Partnership Project, Technical Report TR 38.811, 2020, release 15.

[42] W. Liu et al., "Effect of turbulence layer height and satellite altitude on tropospheric scintillation on Ka-band Earth–LEO satellite links," IEEE Transactions on Vehicular Technology, vol. 59, no. 7, pp. 3181–3192, 2010.

[43] M.-M. Zhao et al., "Intelligent reflecting surface enhanced wireless networks: Two-timescale beamforming optimization," IEEE Transactions on Wireless Communications, vol. 20, no. 1, pp. 2–17, 2021.

[44] M. Röper et al., "Position-based transceiver design for multiple satellite to VSAT downlink," IEEE Open Journal of the Communications Society, vol. 5, pp. 7022–7040, 2024.

[45] 3GPP, "Part 5: Satellite access radio frequency (RF) and performance requirements," 3rd Generation Partnership Project, Technical Report TR 38.101, 2025, release 19.

[46] H. Lee et al., "Can TDD be employed in LEO SatCom systems? Challenges and potential approaches," arXiv preprint arXiv: 2502.08179, 2025.

[47] K. Guo et al., "On the performance of LMS communication with hardware impairments and interference," IEEE Transactions on Communications, vol. 67, no. 2, pp. 1490–1505, 2019.

[48] F. Kunzi et al., "Precise onboard time synchronization for LEO satellites," NAVIGATION: Journal of the Institute of Navigation, vol. 69, no. 3, 2022.

[49] F. S. Prol et al., "Position, navigation, and timing (PNT) through low earth orbit (LEO) satellites: A survey on current status, challenges, and opportunities," IEEE Access, vol. 10, pp. 83 971–84 002, 2022.

[50] J. Zhu et al., "Timing advance estimation in low Earth orbit satellite networks," IEEE Transactions on Vehicular Technology, vol. 73, no. 3, pp. 4366–4382, 2024.

[51] Y. Zhang et al., "Privacy preservation in delay-based localization systems: Artificial noise or artificial multipath?" in GLOBECOM 2024 - 2024 IEEE Global Communications Conference, 2024, pp. 2755–2760.

[52] C. Ozturk et al., "RIS-aided localization under pixel failures," IEEE Transactions on Wireless Communications, vol. 23, no. 8, pp. 8314–8329, 2024.

[53] S. Gezici et al., "Ranging in a single-input multiple-output (SIMO) system," IEEE Communications Letters, vol. 12, no. 3, pp. 197–199, 2008.

[54] Y. Zhang et al., "Distance-angle beamforming for covert communications via frequency diverse array: Toward two-dimensional covertness," IEEE Transactions on Wireless Communications, vol. 22, no. 12, pp. 8559–8574, 2023.

[55] ——, "Robust transceiver design for covert integrated sensing and communications with imperfect CSI," IEEE Transactions on Communications, vol. 73, no. 9, pp. 8016–8031, 2025.

[56] Q. Shi et al., "An iteratively weighted MMSE approach to distributed sum-utility maximization for a MIMO interfering broadcast channel," IEEE Transactions on Signal Processing, vol. 59, no. 9, pp. 4331–4340, 2011.

[57] Y. Zhang et al., "Enabling scalable distributed beamforming via networked leo satellites towards 6G," IEEE Transactions on Wireless Communications, vol. 25, pp. 6666–6680, 2026.

[58] A. M. Hamza et al., "Interference analysis and mitigation for time-asynchronous OFDM CoMP systems," IEEE Transactions on Wireless Communications, vol. 17, no. 7, pp. 4780–4791, 2018.

[59] International Telecommunication Union, "Attenuation by atmospheric gases and related effects," International Telecommunication Union, Geneva, Recommendation P.676-12, 2019.

[60] A. Al-Hourani et al., "On modeling satellite-to-ground path-loss in urban environments," IEEE Communications Letters, vol. 25, no. 3, pp. 696–700, 2021.

## 附录 A：MCRB 基础

本小节简要回顾 MCRB 基础。对参数 $\bar{\boldsymbol\theta}\in\mathbb R^{M\times1}$，误设定估计器的均方误差下界矩阵由 [38] 给出：

$$
\mathrm{LBM}(\widetilde{\boldsymbol\theta})=\underbrace{\mathbf A_{\widetilde{\boldsymbol\theta}}^{-1}\mathbf B_{\widetilde{\boldsymbol\theta}}\mathbf A_{\widetilde{\boldsymbol\theta}}^{-1}}_{\mathrm{MCRB}(\widetilde{\boldsymbol\theta})}+\underbrace{\left(\bar{\boldsymbol\theta}-\widetilde{\boldsymbol\theta}\right)\left(\bar{\boldsymbol\theta}-\widetilde{\boldsymbol\theta}\right)^{\top}}_{\mathrm{Bias}(\widetilde{\boldsymbol\theta})}.\tag{39}
$$

这里 $\widetilde{\boldsymbol\theta}$ 表示伪真参数，由

$$
\widetilde{\boldsymbol\theta}=\arg\min_{\boldsymbol\theta}\mathcal D\left\{\xi_{\mathrm T}(\mathbf y;\bar{\boldsymbol\theta})\,\Vert\,\xi_{\mathrm M}(\mathbf y;\boldsymbol\theta)\right\}\tag{40}
$$

得到，其中 $\mathcal D\{\xi_{\mathrm T}(\mathbf y;\boldsymbol\theta)\Vert\xi_{\mathrm M}(\mathbf y;\widetilde{\boldsymbol\theta})\}$ 表示真实似然函数 $\xi_{\mathrm T}(\mathbf y;\boldsymbol\theta)$ 与误设定似然函数 $\xi_{\mathrm M}(\mathbf y;\widetilde{\boldsymbol\theta})$ 之间的 Kullback–Leibler（KL）散度。此外 $\mathbf A_{\widetilde{\boldsymbol\theta}}$ 与 $\mathbf B_{\widetilde{\boldsymbol\theta}}$ 表示两个广义 FIM，其第 $i$ 行第 $j$ 列元素由 [38] 确定为

$$
[\mathbf A_{\widetilde{\boldsymbol\theta}}]_{i,j}=\mathbb E_{f_{\mathrm T}}\left\{\frac{\partial^{2}\ln\xi_{\mathrm M}(\mathbf y;\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{i}\partial[\boldsymbol\theta]_{j}}\Bigg|_{\boldsymbol\theta=\widetilde{\boldsymbol\theta}}\right\}\tag{41}
$$

$$
=2\Re\left\{\left(\frac{\partial^{2}\boldsymbol\mu(\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{i}\partial[\boldsymbol\theta]_{j}}\right)^{H}\mathbf C_{\mathrm M}^{-1}\boldsymbol\epsilon(\boldsymbol\theta)-\left(\frac{\partial\boldsymbol\mu(\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{i}}\right)^{H}\mathbf C_{\mathrm M}^{-1}\left(\frac{\partial\boldsymbol\mu(\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{j}}\right)\right\}\Bigg|_{\boldsymbol\theta=\widetilde{\boldsymbol\theta}},
$$

$$
[\mathbf B_{\widetilde{\boldsymbol\theta}}]_{i,j}=\mathbb E_{f_{\mathrm T}}\left\{\frac{\partial\ln f_{\mathrm M}(\mathbf y;\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{i}}\Bigg|_{\boldsymbol\theta=\widetilde{\boldsymbol\theta}}\frac{\partial\ln f_{\mathrm M}(\mathbf y;\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{j}}\Bigg|_{\boldsymbol\theta=\widetilde{\boldsymbol\theta}}\right\}\tag{42}
$$

$$
=4\Re\left\{\boldsymbol\epsilon(\boldsymbol\theta)^{H}\mathbf C_{\mathrm M}^{-1}\frac{\partial\boldsymbol\mu(\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{i}}\right\}\Re\left\{\boldsymbol\epsilon(\boldsymbol\theta)^{H}\mathbf C_{\mathrm M}^{-1}\frac{\partial\boldsymbol\mu(\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{j}}\right\}
+2\Re\left\{\left(\frac{\partial\boldsymbol\mu(\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{i}}\right)^{H}\mathbf C_{\mathrm M}^{-1}\left(\frac{\partial\boldsymbol\mu(\boldsymbol\theta)}{\partial[\boldsymbol\theta]_{j}}\right)\right\}\Bigg|_{\boldsymbol\theta=\widetilde{\boldsymbol\theta}},
$$

其中 $\mathbf C_{\mathrm M}$ 表示 $\xi_{\mathrm M}(\mathbf y;\boldsymbol\theta)$ 的协方差矩阵，$\boldsymbol\epsilon(\widetilde{\boldsymbol\theta})=\boldsymbol\kappa(\bar{\boldsymbol\theta})-\boldsymbol\mu(\widetilde{\boldsymbol\theta})$，$\boldsymbol\kappa(\bar{\boldsymbol\theta})$ 与 $\boldsymbol\mu(\widetilde{\boldsymbol\theta})$ 分别为真实模型与误设定模型下的无噪观测 [38]、[52]。

## 附录 B：$\widetilde{\mathbf f}(\mathbf r_u)$ 关于 $\mathbf r_u$ 的导数

**1）非零一阶导数：**

$$
\frac{\partial\upsilon_{s,u}}{\partial\mathbf p_u}=\frac{\mathbf v_s}{\lambda\lVert\mathbf p_u-\mathbf p_s\rVert}-\frac{\left(\mathbf v_s^{T}(\mathbf p_u-\mathbf p_s)\right)(\mathbf p_u-\mathbf p_s)}{\lambda\lVert\mathbf p_u-\mathbf p_s\rVert^{3}},\quad
\frac{\partial\tau_{s,u}}{\partial\mathbf p_u}=\frac{\mathbf p_u-\mathbf p_s}{c\lVert\mathbf p_u-\mathbf p_s\rVert},\quad
\frac{\partial\upsilon_{s,u}}{\partial\delta_u}=1,\quad
\frac{\partial\tau_{s,u}}{\partial b_u}=1.
$$

**2）非零二阶导数：**

$$
\frac{\partial^{2}\upsilon_{s,u}}{\partial\mathbf p_u^{2}}=-\frac{\mathbf v_s(\mathbf p_u-\mathbf p_s)^{T}}{\lambda\lVert\mathbf p_u-\mathbf p_s\rVert^{3}}-\frac{\mathbf v_s(\mathbf p_u-\mathbf p_s)^{T}+\mathbf v_s^{T}(\mathbf p_u-\mathbf p_s)\mathbf I_3}{\lambda\lVert\mathbf p_u-\mathbf p_s\rVert^{3}}
+\frac{3\left(\mathbf v_s^{T}(\mathbf p_u-\mathbf p_s)\right)(\mathbf p_u-\mathbf p_s)(\mathbf p_u-\mathbf p_s)^{T}}{\lambda\lVert\mathbf p_u-\mathbf p_s\rVert^{5}},
$$

$$
\frac{\partial^{2}\tau_{s,u}}{\partial\mathbf p_u^{2}}=\frac{\mathbf I_3}{c\lVert\mathbf p_u-\mathbf p_s\rVert}-\frac{(\mathbf p_u-\mathbf p_s)(\mathbf p_u-\mathbf p_s)^{T}}{c\lVert\mathbf p_u-\mathbf p_s\rVert^{3}}.
$$

## 附录 C：$\widetilde{\mathbf g}(\boldsymbol\eta_{s,u})$ 关于 $\boldsymbol\eta_{s,u}$ 的导数

注意导数 $\partial\widetilde{\mathbf g}(\boldsymbol\eta_{s,u})/\partial[\boldsymbol\eta_{s,u}]_{i}$ 与 $\partial^{2}\widetilde{\mathbf g}(\boldsymbol\eta_{s,u})/(\partial[\boldsymbol\eta_{s,u}]_{i}\partial[\boldsymbol\eta_{s,u}]_{j})$ 可分别由 $\partial\widetilde{\mathbf g}_{s,u}[\ell,k]/\partial[\boldsymbol\eta_{s,u}]_{i}$ 与 $\partial^{2}\widetilde{\mathbf g}_{s,u}[\ell,k]/(\partial[\boldsymbol\eta_{s,u}]_{i}\partial[\boldsymbol\eta_{s,u}]_{j})$ 对 $\ell=1,\ldots,L_c$、$k=1,\ldots,K$ 拼接构造。为简便，下面给出后者。

**1）非零一阶导数：**

$$
\frac{\partial\widetilde{\mathbf g}_{s,u}[\ell,k]}{\partial\Re\{\vartheta_{s,u}\}}=e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\widetilde{\mathbf d}_{s,u}[\ell,k],
$$

$$
\frac{\partial\widetilde{\mathbf g}_{s,u}[\ell,k]}{\partial\Im\{\vartheta_{s,u}\}}=\jmath e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\widetilde{\mathbf d}_{s,u}[\ell,k],
$$

$$
\frac{\partial\widetilde{\mathbf g}_{s,u}[\ell,k]}{\partial\tau_{s,u}}=-\vartheta_{s,u}\jmath 2\pi k\Delta f e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\widetilde{\mathbf d}_{s,u}[\ell,k].
$$

**2）非零二阶导数：**

$$
\frac{\partial^{2}\widetilde{\mathbf g}_{s,u}[\ell,k]}{\partial\Re\{\vartheta_{s,u}\}\partial\tau_{s,u}}=-\jmath 2\pi k\Delta f e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\widetilde{\mathbf d}_{s,u}[\ell,k],
$$

$$
\frac{\partial^{2}\widetilde{\mathbf g}_{s,u}[\ell,k]}{\partial\Im\{\vartheta_{s,u}\}\partial\tau_{s,u}}=2\pi k\Delta f e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\widetilde{\mathbf d}_{s,u}[\ell,k],
$$

$$
\frac{\partial^{2}\widetilde{\mathbf g}_{s,u}[\ell,k]}{\partial\tau_{s,u}^{2}}=-\vartheta_{s,u}(2\pi k\Delta f)^{2}e^{-\jmath 2\pi k\Delta f\tau_{s,u}}\widetilde{\mathbf d}_{s,u}[\ell,k].
$$

## 附录 D：求解 (36) 的低复杂度方法

### A. 提取逐卫星子问题

为降低求解 (36) 的复杂度，本文改采用 BCD 策略：固定其他卫星、依次优化每颗卫星的波束成形器。对第 $s$ 颗卫星，子问题只依赖 $\mathbf w_s=[\mathbf w_{s,1}^{T},\ldots,\mathbf w_{s,U}^{T}]^{T}$，可重写为

$$
\min_{\mathbf w_s}\ -2\sum_{u=1}^{U}\Re\left\{\omega_u\mu_u\mathbf h_{s,u}^{T}\mathbf w_{s,u}\right\}
+\sum_{u=1}^{U}\sum_{m=1}^{U}\omega_u|\mu_u|^{2}\left|\mathbf h_{s,u}^{T}\mathbf w_{s,m}+\Omega_{s,u,m}\right|^{2}\quad
\text{s.t.}\ \lVert\mathbf w_s\rVert^{2}\le\frac{P_s}{K},\tag{47}
$$

其中 $\Omega_{s,u,m}=\sum_{s'\ne s}^{S}\mathbf h_{s',u}^{T}\mathbf w_{s',m}$。令 $\mathbf E_u=[\mathbf 0_{N\times N},\ldots,\underbrace{\mathbf I_N}_{\text{第 }u\text{ 个矩阵}},\ldots,\mathbf 0_{N\times N}]\in\mathbb R^{N\times NU}$ 为选择矩阵。通过代数变换，上式可改写为凸 QCQP：

$$
\min_{\mathbf w_s}\ \mathbf w_s^{H}\mathbf Q_s\mathbf w_s-2\Re\left\{\mathbf b_s^{H}\mathbf w_s\right\}\quad
\text{s.t.}\ \lVert\mathbf w_s\rVert^{2}\le\frac{P_s}{K},\tag{48}
$$

其中

$$
\mathbf R_s=\sum_{u=1}^{U}\omega_u|\mu_u|^{2}\mathbf h_{s,u}^{*}\mathbf h_{s,u}^{T}\succeq\mathbf 0_{N\times N},\tag{49a}
$$

$$
\mathbf Q_s=\mathbf I_U\otimes\mathbf R_s,\tag{49b}
$$

$$
\mathbf b_s=\sum_{u=1}^{U}\omega_u\mu_u^{*}\mathbf E_u^{T}\mathbf h_{s,u}^{*}-\sum_{u=1}^{U}\sum_{m=1}^{U}\omega_u|\mu_u|^{2}\Omega_{s,u,m}\mathbf E_m^{T}\mathbf h_{s,u}^{*}.
$$

### B. 利用强对偶

容易看到，上述问题只含 $\mathbf w_s$，是凸 QCQP。本文不依赖 CVX 之类使用内点法、复杂度为 $\mathcal O((NU)^{3})$ 的凸求解器，而利用问题强对偶进一步降低计算复杂度。具体地，该问题的拉格朗日函数为

$$
\mathcal L(\mathbf w_s,\lambda)=\mathbf w_s^{H}\mathbf Q_s\mathbf w_s-2\Re\left\{\mathbf b_s^{H}\mathbf w_s\right\}-\lambda\left(\lVert\mathbf w_s\rVert^{2}-\frac{P_s}{K}\right),
$$

其中 $\lambda\ge0$ 为功率约束对应的拉格朗日乘子。于是 (48) 的最优解可通过考察其 Karush–Kuhn–Tucker（KKT）条件得到：

$$
(\mathbf Q_s+\lambda\mathbf I_{NU})\mathbf w_s=\mathbf b_s,\tag{50a}
$$

$$
\lVert\mathbf w_s\rVert=\sqrt{\frac{P_s}{K}},\tag{50b}
$$

$$
\lambda\ge0.\tag{50c}
$$

由 (50a) 得

$$
\mathbf w_s=(\mathbf Q_s+\lambda\mathbf I_{NU})^{-1}\mathbf b_s.\tag{51}
$$

因此必须选取 $\lambda$ 使 $\left\|(\mathbf Q_s+\lambda\mathbf I_{NU})^{-1}\mathbf b_s\right\|=\sqrt{P_s/K}$。定义

$$
g(\lambda)=\left\|(\mathbf Q_s+\lambda\mathbf I_{NU})^{-1}\mathbf b_s\right\|^{2}-\frac{P_s}{K}.\tag{52}
$$

由于对 $\lambda_2>\lambda_1\ge0$ 有 $\left\|(\mathbf Q_s+\lambda_2\mathbf I_{NU})^{-1}\mathbf b_s\right\|=\sqrt{\mathbf b_s^{H}(\mathbf Q_s+\lambda_2\mathbf I_{NU})^{-2}\mathbf b_s}<\sqrt{\mathbf b_s^{H}(\mathbf Q_s+\lambda_1\mathbf I_{NU})^{-2}\mathbf b_s}=\left\|(\mathbf Q_s+\lambda_1\mathbf I_{NU})^{-1}\mathbf b_s\right\|$，可知只要 $\mathbf Q_s\succeq\mathbf 0_{NU}$（由 (49a) 与 (49b) 考察可知其恒成立），$g(\lambda)$ 就关于 $\lambda$ 单调递减。基于该性质，可用简单线搜索（如黄金分割搜索）高效确定唯一的 $\lambda$。

### C. 降低矩阵求逆复杂度

注意 (52) 涉及 $NU$ 维矩阵求逆，在每次线搜索迭代中仍带来 $\mathcal O((NU)^{3})$ 的计算复杂度。为降低该复杂度，本文利用结构 $\mathbf Q_s=\mathbf I_U\otimes\mathbf R_s$。令 $\mathbf b_s=[\mathbf b_{s,1}^{T},\ldots,\mathbf b_{s,U}^{T}]^{T}$，其中 $\mathbf b_{s,u}\in\mathbb C^{N}$，则有

$$
g(\lambda)=\left\|\left(\mathbf I_U\otimes\mathbf R_s+\lambda\mathbf I_{NU}\right)^{-1}\mathbf b_s\right\|^{2}-\frac{P_s}{K}
=\left\|\left(\mathbf I_U\otimes(\mathbf R_s+\lambda\mathbf I_N)\right)^{-1}\mathbf b_s\right\|^{2}-\frac{P_s}{K}
$$

$$
=\left\|\left(\mathbf I_U\otimes(\mathbf R_s+\lambda\mathbf I_N)^{-1}\right)\mathbf b_s\right\|^{2}-\frac{P_s}{K}
=\left\|\left(\mathbf I_U\otimes\left(\mathbf U(\boldsymbol\Lambda+\lambda\mathbf I_N)^{-1}\mathbf U^{H}\right)\right)\mathbf b_s\right\|^{2}-\frac{P_s}{K}
$$

$$
=\sum_{u=1}^{U}\left\|\mathbf U(\boldsymbol\Lambda+\lambda\mathbf I_N)^{-1}\mathbf U^{H}\mathbf b_{s,u}\right\|^{2}-\frac{P_s}{K}
=\sum_{u=1}^{U}\sum_{n=1}^{N}\frac{|\varpi_{s,u,n}|^{2}}{(\lambda_n+\lambda)^{2}}-\frac{P_s}{K},\tag{53}
$$

其中 $\boldsymbol\varpi_{s,u}=[\varpi_{s,u,1},\ldots,\varpi_{s,u,N}]^{T}=\mathbf U^{H}\mathbf b_{s,u}$。这里 $\mathbf R_s$ 经特征值分解为 $\mathbf R_s=\mathbf U\boldsymbol\Lambda\mathbf U^{H}$，其中 $\mathbf U\in\mathbb C^{N\times N}$ 为酉矩阵，$\boldsymbol\Lambda=\operatorname{diag}[\lambda_1,\ldots,\lambda_N]$ 为对角特征值矩阵。于是 (51) 重写为

$$
\mathbf w_s=\left(\mathbf I_U\otimes\left(\mathbf U(\boldsymbol\Lambda+\lambda\mathbf I_N)^{-1}\mathbf U^{H}\right)\right)\mathbf b_s,\tag{54}
$$

从而无需 $NU$ 维矩阵求逆，进而降低更新波束成形器的计算复杂度。

### D. 复杂度分析

上述改写表明，矩阵 $\mathbf R_s$ 的特征值分解只需进行一次、复杂度 $\mathcal O(N^{3})$，而不必对每个 $\lambda$ 反复求 $NU$ 维矩阵的逆。黄金分割搜索具有线性收敛速率，可在 $\mathcal O(\log(1/\epsilon))$ 次迭代内找到 $\epsilon$-解；由于每次迭代只需计算一个一维函数，其相关复杂度一般可忽略。因此，特征值分解步骤主导了求解 (47) 的整体复杂度。由于对 $s=1,\ldots,S$ 依次求解 (47)，求解 (36) 的总复杂度从原来的 $\mathcal O((SNU)^{3})$ 降至 $\mathcal O(SN^{3})$。

为进一步展示所提算法的优越性，图 9 在不同 LEO 卫星数、每星天线数与 UT 数下比较基于 QCQP 与所提低复杂度算法的运行时间与和速率。结果表明：所提算法通过 BCD 分解波束成形器更新子问题并利用对偶与线搜索，在保持与原始 QCQP 更新相同和速率性能的同时实现数量级的复杂度降低。这一点尤为值得注意，因为 QCQP 形式给出子问题的最优解，而所提基于 BCD 的结构只收敛到驻点。这些结果验证了所提低复杂度设计的效率。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2502.05808v4 的全文中文译稿，按原文结构译出：摘要与关键词、第 I 节引言（含研究背景、相关工作、两个关键问题与四项贡献、论文结构、记号）、第 II 节系统模型（信道模型、时间尺度分析与两时间尺度帧结构，含脚注 1—4）、第 III 节两时间尺度定位辅助信道估计（下行定位信号模型、FIM、MCRB 与 LB 推导；上行信道估计信号模型与 MCRB/LB，含脚注 5—8）、第 IV 节下行协作波束赋形（名义模型、问题建模、WMMSE 迭代与算法 1、评估模型，含脚注 9—10）、第 V 节数值结果（仿真参数与表 I、三类对比方案、下行定位、上行信道估计、下行通信）、第 VI 节结论、图 1—图 9 图注、60 条英文参考文献，以及附录 A—D（MCRB 基础、两组导数、低复杂度求解）。公式覆盖原文式 (1)—(54)（含 (6a)—(6f)、(21a)—(21b)、(49a)—(49b)、(50a)—(50c) 等子式）。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言前半）→ 第 2 页（引言后半、贡献、论文结构、记号、第 II 节开头）→ 第 3 页（第 II 节、图 1、脚注 1）→ 第 4 页（第 II-A 节信道模型、式 (1)—(4)、第 II-B 节时间尺度分析、图 2）→ 第 5 页（帧结构、第 III 节开头、模型误设定讨论、脚注 4—6、式 (5)）→ 第 6 页（式 (6)—(12)）→ 第 7 页（式 (13)—(18)、第 III-B 节、式 (19)—(24)）→ 第 8 页（式 (25)—(33)、算法 1）→ 第 9 页（式 (34)—(38)、第 IV-D 节、第 V 节开头）→ 第 10 页（表 I、第 V-A/B 节）→ 第 11 页（图 3—图 5、第 V-C/D 节）→ 第 12 页（图 6—图 8、第 V-D/E 节）→ 第 13 页（第 V-E 节结尾、第 VI 节结论、附录 A、式 (39)—(42)、附录 B 开头）→ 第 14 页（附录 B 结尾、附录 C、附录 D、式 (47)—(53)）→ 第 15 页（附录 D 结尾、式 (54)、复杂度分析、图 9、参考文献 [1]—[20]）→ 第 16 页（参考文献 [21]—[60]）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；公式已按 PDF 文本层与第 1、8、10、13、14 页渲染图交叉核对（表 I、式 (7)—(18)、(22)—(28)、(39)—(42)、(47)—(54) 及算法 1 逐项对照）。
2. 表 I 为源 PDF 第 10 页排版表格，文本层抽取后行列错位；本页表格依据该页渲染图像逐格转录（含天线辐射增益 $\sqrt{\frac{3}{4\pi}\cos(\theta)}$ 与全部数值），未改变任何数值。
3. 图 1—图 9 均未上传图片，仅提供中文图注与正文关键数值；图 3—图 9 的曲线不作数字化估算。
4. 原文脚注 1—10 已按原位置以引用块译出（其中与正文直接相关的简化假设保留完整）。
5. **原文疑点 1：** 式 (13)、(14) 与 (22)、(23) 中的似然函数写成 $e^{\boldsymbol\epsilon^{T}\boldsymbol\Sigma^{-1}\boldsymbol\epsilon}$／$e^{\|\mathbf y-\mathbf g\|^{2}}$ 而未带负号；按高斯观测的标准似然应为 $\exp\{-(\cdot)^{T}\boldsymbol\Sigma^{-1}(\cdot)\}$。译文按 PDF 渲染原样照录并加注，未擅自改式。
6. **原文疑点 2：** 第 V-A 节称随机相位 "uniformly cooperative in $[0,2\pi]$"，疑为 "uniformly distributed"（均匀分布）之笔误；译文按"均匀分布"理解并在正文括注，未改动原文含义。
7. **原文疑点 3：** 附录编号从式 (42) 直接跳到 (47)，原式中未见 (43)—(46)；这可能是稿件版本迭代遗留的编号空缺。译文按原文编号保留，不补造公式。
8. 部分公式在源文本抽取中符号错行（如式 (7) 的矩阵形式、式 (53) 的等式链），已按渲染图与数学结构核对后重排；$\boldsymbol\Omega_{s,u,m}$、$\mathbf E_u$、$\lambda_n$ 等记号按上下文统一。
9. 版权：本文为 arXiv 预印本（eess.SP），本页为中文翻译页面，未上传原文 PDF；引用与再传播遵循 arXiv 许可与站点既有做法；页面目录日期 2026-09-29 为站点归档日期，页首"版本"采用 v4（2026-01-18）信息。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
