---
layout: page
title: "时分组蜂窝网络的鲁棒波束赋形与时间分配｜中文全文译文"
permalink: /papers/translations/2026-09-27-2601-12725-robust-beamforming-and-time-allocation-for-time-division-cell-free-nea/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/612370cfe0599939/) · [原文 arXiv](https://arxiv.org/abs/2601.12725) · [全部目录](/papers/catalog/)

# 时分组蜂窝网络的鲁棒波束赋形与时间分配

**原题：** Robust Beamforming and Time Allocation for Time-Division Cell-Free Near-Field ISAC  
**作者：** Chaedam Son、Si-Hyeon Lee（IEEE 高级会员，Senior Member, IEEE）。单位：韩国科学技术院（KAIST）电气工程学院，韩国大田 34141（邮箱：scd5929@kaist.ac.kr、sihyeon@kaist.ac.kr）。原文注明：本工作已提交至 IEEE 供可能发表；版权可能在不另行通知的情况下转移，之后本版本可能不再可访问。  
**版本：** arXiv:2601.12725v1（eess.SP），v1 日期 2026 年 1 月 19 日；原文 14 页（IEEE 期刊论文格式）。本页对应论文库 2026-09-27 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—VI 节、附录 A（CRLB 推导）与附录 B（MUSIC 算法）、图 1—9 图注、算法 1—4、式（1）—（22）及附录未编号公式、参考文献 [1]—[38]（英文原条目）。原文全文无编号表格（仅图 1—9），故本页无表格可转录；已用 `render.py` 渲染 PDF 第 1、10 页核对作者/标题、算法 4 与图 4 的版式。逐句逐式终校未做，不标记为已验收全文。

> **译注（术语与记号）：** 原文缩写在本页首次出现时保留英文：ISAC（integrated sensing and communication，通感一体化）、CKM 类概念不涉及；cell-free MIMO（无蜂窝大规模 MIMO）、AP（access point，接入点）、CPU（central processing unit，中心处理单元）、ULA（uniform linear array，均匀线性阵列）、LOS/NLOS、CRLB（Cramér–Rao lower bound，克拉美–罗下界）、FIM（Fisher information matrix，Fisher 信息矩阵）、RCS（radar cross section，雷达截面积）、MSE、SINR、SNR、MRT（maximum ratio transmission，最大比传输）、AO（alternating optimization，交替优化）、SDR/SDP（半定松弛/半定规划）、SCA 不涉及、SOCP（二阶锥规划）、LMI（线性矩阵不等式）、MUSIC（多重信号分类）、AoD/AoA、UAV、6G。记号：正则、粗斜体小写、粗斜体大写分别表示标量、向量、矩阵。$[\mathbf X]_{i,j}$ 表示矩阵第 $(i,j)$ 元，$[\mathbf Y]_{\langle p,q\rangle}$ 表示分块矩阵的第 $(p,q)$ 子块，$[\mathbf a]_i$ 表示向量第 $i$ 元。$\mathbf I_N$、$\mathbf 0_{N\times N}$、$\mathbf 1_{N\times N}$ 分别为 $N\times N$ 单位阵、零阵与全一阵，$\mathbf 0_N$、$\mathbf 1_N$ 为相应向量；$\mathbf X\succeq0$ 表示半正定；$\mathrm{diag}(\cdot)$ 与 $\mathrm{blkdiag}(\cdot)$ 构造对角/分块对角阵；$(\cdot)^T$、$(\cdot)^H$、$\Re\{\cdot\}$、$\Im\{\cdot\}$、$\mathrm{Tr}(\cdot)$ 分别为转置、共轭转置、实部、虚部与迹；$|x|$ 为标量绝对值，$\|\cdot\|$ 对向量为欧氏范数、对矩阵为 Frobenius 范数；$\mathrm{vec}(\cdot)$ 为按列堆叠的向量化；$\mathcal{CN}(\boldsymbol\mu,\boldsymbol\Sigma)$ 为循环对称复高斯分布，$\mathbb E[\cdot]$ 为期望；$(a,b)$ 为开区间。**原文疑点（按原文照录并加注）：** ①算法 2 第 11 行与算法 4 第 11 行在判定 $\eta^{\mathrm{opt}}=\bar\eta$ 之后，仍以 $\eta^{(l-1)}$ 作为输入重新调用 Bi-RBO/Bi-RPO-MRT，而正文称"再执行一次波束赋形优化步"；按逻辑此处疑应传入 $\eta^{\mathrm{opt}}$（即 $\bar\eta$），本页按原文照录并加注；②原文图 4 的纵轴为 $\sqrt{\mathrm{CRLB}}$、横轴为 $P_s^{\max}$，与正文叙述一致；③原文 §II-B 称"CRLB 是 $\eta$ 的递增函数"，与式（2）中分母 $(1-\eta)$ 的关系一致（$\eta$ 增大则感知时间减少、CRLB 增大）。

## 摘要

本文提出一种面向无蜂窝多输入多输出（MIMO）系统的时分组近场通感一体化（ISAC）框架，其中感知与下行通信在时间上分离。在感知阶段，用户位置被估计并用于构造位置感知信道，随后在通信阶段加以利用。通过显式建模感知引起的定位误差与信道估计误差之间的耦合，我们刻画了感知精度与通信吞吐量之间的折中。基于该模型，我们联合优化时间分配比、感知协方差矩阵与不完美信道状态信息（CSI）下的鲁棒下行波束赋形。所得非凸问题在交替优化框架内通过基于半定规划（SDP）的重构求解。为进一步降低计算复杂度，我们还提出两种低复杂度次优设计：误差忽略方案与基于最大比传输（MRT）的方案。仿真结果表明，所提方案相对远场与单站设定显著提升定位精度，从而降低信道估计误差并最终提升可达速率。此外，误差忽略方案在严格感知要求下表现良好，而基于 MRT 的方案通过调整时间分配比在一大类感知要求下保持稳健，尽管存在一定波束赋形损失。

**关键词：** 无蜂窝 MIMO；通感一体化（ISAC）；近场通信；时间分配；鲁棒波束赋形。

## I. 引言

通感一体化（ISAC）已成为第六代（6G）无线网络的关键使能技术 [1]、[2]。通过在共享频谱与硬件框架内同时运行感知与通信功能，ISAC 显著提升频谱效率与整体资源利用率。此外，准确的环境感知有助于改善信道估计并降低导频开销，从而提升通信可靠性 [3]。在此背景下，ISAC 与多输入多输出（MIMO）系统的结合尤为引人注目。大规模天线阵列提供高空间分辨率以进行感知，并使感知辅助信道估计成为可能，从而有效应对 MIMO 通信的核心瓶颈之一。这些互补优势推动了对 ISAC 使能 MIMO 系统在挑战性传播条件下可靠服务质量（QoS）的大量研究 [4]。

然而，随着天线数增加（导致阵列孔径增大）以及通信频率升高，近场效应近来受到越来越多关注 [5]–[7]。在近场机制下，球面波传播使每个阵列响应依赖用户的**绝对位置**而非仅依赖 AoA/AoD。这一特性使得在孔径足够时可直接由阵列响应推断位置，减少对接收信号强度（RSSI）、到达时差（TDoA）或到达时间（ToA）等距离估计技术的依赖。因此，近场 ISAC 受到越来越多的关注 [8]–[10]。文献 [8] 在近场单目标多用户场景下建立优化问题，在用户速率约束下最小化 Cramér–Rao 下界（CRLB）；该工作随后在 [9] 中扩展到多目标设定，聚焦在满足感知与通信信干噪比（SINR）要求的同时最小化能量；在此基础上，[10] 利用球面波前使各天线观测到不同多普勒频移这一近场独有特性，纳入速度估计与波束赋形。

ISAC 系统的性能还可通过多站感知利用空间分集进一步提升：多个空间分离的节点协同执行感知与通信。特别地，无蜂窝架构为实现多站 ISAC 提供了自然而有效的平台，因为地理上分布的接入点（AP）可联合照射目标并从多样化空间视角收集感知回波。由于这些优势，大量既有 ISAC 研究采用无蜂窝多站配置，且主要聚焦远场感知场景 [11]–[13]。[11] 定义了无蜂窝设定下的感知信噪比（SNR）与通信 SINR，并提出以通信或感知性能为目标的优化问题求解方法；[12] 考虑分布式 AP 在服务用户通信需求的同时感知一个窃听者的无蜂窝场景；类似地，[13] 研究了无蜂窝系统中的目标检测算法并优化相应功率分配。然而，尽管远场多站 ISAC 架构已有大量工作，其**近场**对应物直到最近才开始受到关注。[14] 研究了由一个多通信用户与单个感知目标组成的近场多站 ISAC 被动感知系统：多个 AP 联合发送通感信号，指定 AP 收集反射回波以检测并定位目标，且 CSI 仅以不完美形式可得。

然而在实践中，由于系统维数巨大，在无蜂窝架构中获取所有 AP—用户链路的 CSI 尤为困难。在近场机制下，信道估计可有效借助感知完成，因为视距（LOS）分量通常占主导 [8]–[10]，且信道系数可建模为用户位置的确定性函数；一旦用户位置已知，导向矢量与信道增益都可准确重建。这种感知辅助信道估计特别适合多站场景，其中感知误差可显著降低。受这些性质启发，我们为无蜂窝 MIMO 系统提出一种基于分时的近场 ISAC 框架：在专用感知阶段估计用户信道，随后在通信阶段加以利用。通过解耦感知与通信并实现位置感知信道构造，所提框架缓解了近场无蜂窝系统的主要瓶颈之一——信道估计负担——同时避免全联合通感设计固有的高计算复杂度。

本文主要贡献如下：

- **ISAC 框架。** 我们提出时分组无蜂窝近场 ISAC 系统，它与现有依赖固定时间分配比与完美 CSI 假设的分时 ISAC 方法 [15]–[18] 不同。通过显式建模感知引起的定位误差与信道估计误差之间的耦合，我们刻画了如下基本折中：把更多时间分配给感知可改善信道估计精度，但以通信时间减少为代价。通过联合优化时间分配比与信道不确定下的鲁棒下行波束赋形，我们构建了一个兼顾感知精度与通信吞吐的实用集成 ISAC 框架。
- **优化算法。** 我们优化感知协方差矩阵、下行波束赋形与时间分配比。先独立优化感知协方差矩阵；随后在迭代交替优化（AO）[19] 框架中联合优化下行波束赋形与分时比，其中波束赋形向量通过半定规划（SDP）[20] 松弛更新，分时比通过约束裕度最大化精化。该联合设计在不完美 CSI 下有效实现鲁棒收敛。为进一步降低复杂度，我们提出两种次优方案：(i) **误差忽略**设计，假定完美 CSI 来优化波束赋形与分时比；(ii) 基于**最大比传输（MRT）**的方案，利用大天线阵列下近场信道的准正交性质。
- **数值结果。** 仿真结果表明，所提近场多站无蜂窝架构相比传统单小区与远场系统取得更优感知性能。此外，所提算法收敛快，且对参数变化稳健。

**记号：** 标量、向量与矩阵分别用正则、粗小写与粗大写字母表示（如 $x$、$\mathbf x$、$\mathbf X$）。矩阵 $\mathbf X$ 的第 $(i,j)$ 元记为 $[\mathbf X]_{i,j}$，分块矩阵 $\mathbf Y$ 的第 $(p,q)$ 子块记为 $[\mathbf Y]_{\langle p,q\rangle}$，向量 $\mathbf a$ 的第 $i$ 元记为 $[\mathbf a]_i$。$N\times N$ 单位阵、零阵与全一阵分别记为 $\mathbf I_N$、$\mathbf 0_{N\times N}$、$\mathbf 1_{N\times N}$，$N$ 维零向量与全一向量记为 $\mathbf 0_N$、$\mathbf 1_N$。$\mathbf X\succeq0$ 表示 $\mathbf X$ 半正定。$\mathrm{diag}(\cdot)$ 与 $\mathrm{blkdiag}(\cdot)$ 由其参数构造对角与分块对角矩阵。对矩阵 $\mathbf A$，$\mathbf A^T$、$\mathbf A^H$、$\Re\{\mathbf A\}$、$\Im\{\mathbf A\}$ 分别表示转置、共轭转置、实部与虚部，$\mathrm{Tr}(\mathbf A)$ 表示迹。对标量 $x$，$|x|$ 为绝对值；$\|\cdot\|$ 对向量为欧氏范数、对矩阵为 Frobenius 范数。向量化算子 $\mathrm{vec}(\mathbf A)$ 把 $\mathbf A$ 的列堆叠为单个向量。均值 $\boldsymbol\mu$、协方差 $\boldsymbol\Sigma$ 的循环对称复高斯分布记为 $\mathcal{CN}(\boldsymbol\mu,\boldsymbol\Sigma)$，期望算子记为 $\mathbb E[\cdot]$。对两个实数 $a,b$，$(a,b)$ 表示二者之间的开区间。

## II. 系统模型与问题表述

如图 1 所示，我们考虑一个时分组无蜂窝近场 ISAC 系统，由 $M$ 个接入点（AP）与 $K$ 个单天线用户组成，分别索引为 $\mathcal M=(1,2,\dots,M)$ 与 $\mathcal K=(1,2,\dots,K)$。所有 AP 通过容量足够大的理想回传链路连接到中心处理单元（CPU）[21]。每个 AP 工作在全双工模式并具备自干扰消除 [22]，且配备 $N_t=2N+1$ 根均匀线性阵列（ULA）天线，如图 2 所示。

$M$ 个 AP 联合执行用户定位，并同时提供下行通信服务。所提分时 ISAC 框架把每个传输块划分为感知阶段与通信阶段，其中时频资源对所有用户联合使用。每个时长 $T$ 的传输块划分为感知阶段 $T_s=(1-\eta)T$ 与通信阶段

**图 1：** 时分组无蜂窝近场 ISAC 系统。（来源：原文第 2 页。）

$T_c=\eta T$，其中 $\eta\in(0,1)$ 为时间分配比 [17]、[18]。假定 $T$ 足够短，使用户位置——从而信道——几乎不变 [23]、[24]。在感知阶段，系统估计用户位置并重建相应信道，随后用于后续通信阶段的下行通信。此外，获得的位置信息也可直接用于向用户提供基于位置的服务。与分别执行感知与信道估计的传统方法相比，所提集成结构可显著降低导频开销，从而提升整体性能 [23]。通过调整 $\eta$，系统还可根据感知与通信的相对重要性灵活平衡二者性能。

下文各小节给出信道、感知与通信模型的细节以及问题表述。

### A. 信道模型

假设所有 AP 以带环行器的全双工模式工作，使共享天线阵列同时用于发射与接收 [25]。如图 2 所示，ULA 与用户均假定位于 $xy$ 平面上¹。每个 AP 的天线单元间距设为 $d$，故 ULA 孔径为 $D=(N_t-1)d$。区分近场与远场区域的边界由 Rayleigh 距离 $2D^2/\lambda$ 给出 [26]。我们考虑数十 GHz 频段的高频带以及每 AP 数百单元的大天线阵列，此时近场区域可延伸数百米。因此假定所有用户位于所有 AP 的近场区域内 [27]²。在所考虑的高频带中，非视距（NLOS）分量显著弱于视距（LOS）路径 [8]–[10]，故本文只考虑 LOS 信道。

> **脚注 1（原文）：** 与仅考虑二维坐标的先前工作 [8]–[10] 类似，所提系统也可容易地扩展到三维情形。
>
> **脚注 2（原文）：** 若某用户位于特定 AP 的远场区域，则该 AP 与用户间距离足够大；由于毫米波频率的严重衰减，该用户可能无法正常接收信号。因此我们假定所有用户位于所有 AP 的近场区域。

令 AP $m$ 的天线中心坐标为 $(c^{\mathrm{AP},x}_m,c^{\mathrm{AP},y}_m)$，用户 $k$ 的坐标为 $(c^x_k,c^y_k)$，AP $m$ 第 $n$ 个天线单元的坐标为 $(c^{\mathrm{AP},x}_m+nd^x_m,c^{\mathrm{AP},y}_m+nd^y_m)$，$n\in\{-N,\dots,N\}$。这里 $d^x_m,d^y_m$ 为 AP $m$ 相邻天线单元的 $x$、$y$ 坐标差，满足 $\sqrt{(d^x_m)^2+(d^y_m)^2}=d$。于是 AP $m$ 第 $n$ 天线到用户 $k$ 的距离可写为

$$
r_{k,m}(n)=\sqrt{\left(c^x_k-\left(c^{\mathrm{AP},x}_m+nd^x_m\right)\right)^2+\left(c^y_k-\left(c^{\mathrm{AP},y}_m+nd^y_m\right)\right)^2}.
$$

相应地，AP $m$ 第 $n$ 天线与用户 $k$ 之间的信道可表示为 [28]

$$
h_{k,m}(n)=\tilde\beta_{k,m}(n)e^{-\mathrm j\frac{2\pi}{\lambda}r_{k,m}(n)}=\beta_{k,m}(n)e^{-\mathrm j\frac{2\pi}{\lambda}\left(r_{k,m}(n)-r_{k,m}(0)\right)},
$$

其中 $\beta_{k,m}(n)=\tilde\beta_{k,m}(n)e^{-\mathrm j\frac{2\pi}{\lambda}r_{k,m}(0)}$、$\tilde\beta_{k,m}(n)=\sqrt{\lambda/(4\pi r^2_{k,m}(n))}$ [8]。由于信道增益的变化相对相移可忽略 [26]、[29]，我们假定对所有 $n$ 有 $\tilde\beta_{k,m}(n)=\tilde\beta_{k,m}(0)$，并简记 $\beta_{k,m}=\beta_{k,m}(0)$。于是 AP $m$ 到用户 $k$ 的近场信道 $\mathbf h_{k,m}\in\mathbb C^{N_t\times1}$ 可写为

$$
\mathbf h_{k,m}=\left[h_{k,m}(-N),\dots,h_{k,m}(N)\right]^T=\beta_{k,m}\mathbf a_{k,m}\left(r^x_{k,m},r^y_{k,m}\right),\tag{1}
$$

其中 $r^x_{k,m}=c^{\mathrm{AP},x}_m-c^x_k$、$r^y_{k,m}=c^{\mathrm{AP},y}_m-c^y_k$，$\mathbf a_{k,m}(r^x_{k,m},r^y_{k,m})\in\mathbb C^{N_t\times1}$ 表示 AP $m$ 到用户 $k$ 的阵列响应向量，其第 $n$ 元为 $[\mathbf a_{k,m}(r^x_{k,m},r^y_{k,m})]_n=e^{-\mathrm j\frac{2\pi}{\lambda}(r_{k,m}(n-N-1)-r_{k,m}(0))}$。如式（1）所示，准确掌握用户位置即可重建其通信信道。利用这一观察，所提无蜂窝 MIMO 框架利用感知阶段获得的用户位置信息直接推断相应通信信道。

**图 2：** AP $m$ 的天线配置。（来源：原文第 3 页。）

### B. 感知模型

感知的目标是准确确定用户位置。定位精度的评估广泛采用均方误差（MSE）[8]。然而获得该 MSE 的闭式表达极具挑战。因此我们采用 CRLB 作为性能指标，它给出 MSE 的下界 [8]。下面先建立感知阶段的回波信号模型，再推导 CRLB。

在感知阶段，各 AP 持续发送感知信号并接收其回波以实现稳定估计。感知块数记为 $\tau$，由感知时长决定：$\tau=\lfloor(1-\eta)T/\tau_s\rfloor$，其中 $\tau_s$ 为单位感知块时长。由于 $\tau$ 必须为整数，这里采用下取整；当 $\tau_s$ 足够小时量化效应可忽略，故解析上可近似 $\tau\approx(1-\eta)T/\tau_s$。AP $m$ 在时隙 $t$ 发送感知信号 $\mathbf s_m[t]\in\mathbb C^{N_t\times1}$。令 $\mathbf s_m[t]$ 的协方差矩阵为 $\boldsymbol\Psi_m\in\mathbb C^{N_t\times N_t}$，即 $\boldsymbol\Psi_m=\mathbb E[\mathbf s_m[t]\mathbf s_m[t]^H]$。这里假定 AP $m$ 与 AP $m'$ 发送的感知信号不相关，即对 $m\ne m'$ 有 $\mathbb E[\mathbf s_m[t]\mathbf s_{m'}[t]^H]=\mathbf 0_{N_t\times N_t}$。因此时隙 $t$ AP $l$ 处的接收回波为

$$
\mathbf y_l^{\mathrm{AP}}[t]=\sum_{k=1}^{K}\sum_{m=1}^{M}\rho_{k,l,m}\mathbf h_{k,l}\left(r^x_{k,l},r^y_{k,l}\right)\mathbf h_{k,m}^H\left(r^x_{k,m},r^y_{k,m}\right)\mathbf s_m[t]+\mathbf n_l[t]
=\sum_{k=1}^{K}\sum_{m=1}^{M}\alpha_{k,l,m}\mathbf a_{k,l}\left(r^x_{k,l},r^y_{k,l}\right)\mathbf a_{k,m}^H\left(r^x_{k,m},r^y_{k,m}\right)\mathbf s_m[t]+\mathbf n_l[t],
$$

其中 $\rho_{k,l,m}\sim\mathcal{CN}(0,1)$ 建模雷达截面积（RCS）[30]，$\alpha_{k,l,m}=\rho_{k,l,m}\beta_{k,l}\beta_{k,m}$ 表示用户 RCS 与两跳路径 AP $m\to$ 用户 $k\to$ AP $l$ 上感知信道增益的乘积，$\mathbf n_l[t]\sim\mathcal{CN}(\mathbf 0,\sigma^2\mathbf I_{N_t})$ 为加性高斯噪声。感知信号经目标反射后，由于 CPU 通过大容量回传收集所有 AP 的接收信号，可对聚合数据联合执行感知 [11]–[13]。相应地，定义级联接收信号向量 $\mathbf y^{\mathrm{AP}}[t]=[\mathbf y_1^{\mathrm{AP}}[t]^T,\mathbf y_2^{\mathrm{AP}}[t]^T,\dots,\mathbf y_M^{\mathrm{AP}}[t]^T]\in\mathbb C^{MN_t\times1}$，它可表示为

$$
\mathbf y^{\mathrm{AP}}[t]=\sum_k\mathbf H_k\left(c^x_k,c^y_k,\boldsymbol\alpha_k\right)\mathbf s[t]+\mathbf n[t],
$$

其中 $\boldsymbol\alpha_k=(\alpha_{k,1,1},\alpha_{k,1,2},\dots,\alpha_{k,M,M})$，$\mathbf s[t]=[\mathbf s_1[t]^T,\mathbf s_2[t]^T,\dots,\mathbf s_M[t]^T]^T\in\mathbb C^{MN_t\times1}$ 为级联发射感知信号向量，$\mathbf n[t]=[\mathbf n_1[t]^T,\dots,\mathbf n_M[t]^T]^T\in\mathbb C^{MN_t\times1}$ 为所有 AP 接收的堆叠高斯噪声向量，$\mathbf H_k(c^x_k,c^y_k,\boldsymbol\alpha_k)\in\mathbb C^{MN_t\times MN_t}$ 为用户 $k$ 的复合感知信道矩阵，结构为 $M\times M$ 分块矩阵、每块 $N_t\times N_t$。我们把 $\mathbf H_k(c^x_k,c^y_k,\boldsymbol\alpha_k)$ 与 $\mathbf H_k$ 互换使用。$\mathbf H_k$ 的第 $(l,m)$ 块为 $[\mathbf H_k]_{\langle l,m\rangle}=\alpha_{k,l,m}\mathbf a_{k,l}(r^x_{k,l},r^y_{k,l})\mathbf a_{k,m}^H(r^x_{k,m},r^y_{k,m})$，表示由 AP $m$ 发射、经用户 $k$ 反射、由 AP $l$ 接收的感知信道。由于回波信号在整个 $\tau$ 个感知块期间被接收，聚合接收信号 $\mathbf Y^{\mathrm{AP}}\in\mathbb C^{MN_t\times\tau}$ 可表示为

$$
\mathbf Y^{\mathrm{AP}}=\left[\mathbf y^{\mathrm{AP}}[1],\dots,\mathbf y^{\mathrm{AP}}[\tau]\right]=\sum_k\mathbf H_k\left(c^x_k,c^y_k,\boldsymbol\alpha_k\right)\mathbf S+\mathbf N,
$$

其中 $\mathbf S=[\mathbf s[1],\dots,\mathbf s[\tau]]\in\mathbb C^{MN_t\times\tau}$、$\mathbf N=[\mathbf n[1],\mathbf n[2],\dots,\mathbf n[\tau]]\in\mathbb C^{MN_t\times\tau}$。假定块数 $\tau$ 足够大，$\mathbf s[t]$ 的样本协方差矩阵可近似为协方差矩阵 $\boldsymbol\Psi\in\mathbb C^{MN_t\times MN_t}$，即 $\boldsymbol\Psi=\mathrm{blkdiag}(\boldsymbol\Psi_1,\dots,\boldsymbol\Psi_M)=\mathbb E[\mathbf s[t]\mathbf s[t]^H]\approx\frac1\tau\mathbf S\mathbf S^H$。为推导 CRLB，对接收信号矩阵 $\mathbf Y^{\mathrm{AP}}$ 向量化，得

$$
\mathbf u=\mathrm{vec}\left(\mathbf Y^{\mathrm{AP}}\right)\sim\mathcal{CN}\left(\mathrm{vec}\left(\sum_k\mathbf H_k\left(c^x_k,c^y_k,\boldsymbol\alpha_k\right)\mathbf S\right),\ \sigma^2\mathbf I_{MN_t\tau}\right).
$$

待估未知参数向量为 $\boldsymbol\theta=(\mathbf p,\boldsymbol\alpha)$，其中 $\mathbf p=(\mathbf c^x,\mathbf c^y)$、$\boldsymbol\alpha=(\boldsymbol\alpha_{\mathrm{re}},\boldsymbol\alpha_{\mathrm{im}})$；这里 $\mathbf c^x=(c^x_1,\dots,c^x_K)$、$\mathbf c^y=(c^y_1,\dots,c^y_K)$、$\boldsymbol\alpha_{\mathrm{re}}=\Re\{(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_K)\}$、$\boldsymbol\alpha_{\mathrm{im}}=\Im\{(\boldsymbol\alpha_1,\boldsymbol\alpha_2,\dots,\boldsymbol\alpha_K)\}$。用户位置 $\mathbf p$ 的 CRLB 值可表示为 [31]、[32]

$$
\mathrm{CRLB}(\boldsymbol\Psi,\eta)=\frac{\tau_s\sigma^2}{2(1-\eta)T}\mathrm{Tr}\left(\bar{\mathbf J}_{\mathbf p\mathbf p}-\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}^T\bar{\mathbf J}_{\boldsymbol\alpha\boldsymbol\alpha}^{-1}\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}\right)^{-1},\tag{2}
$$

其中 $\bar{\mathbf J}_{\mathbf p\mathbf p}$ 为用户位置的归一化 FIM，$\bar{\mathbf J}_{\boldsymbol\alpha\boldsymbol\alpha}$ 为增益参数（含 RCS）的归一化 FIM，$\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}$ 为二者的耦合。令 $\mathrm{CRLB}(\boldsymbol\Psi)=\sigma^2\mathrm{Tr}(\bar{\mathbf J}_{\mathbf p\mathbf p}-\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}^T\bar{\mathbf J}_{\boldsymbol\alpha\boldsymbol\alpha}^{-1}\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha})^{-1/2}$。CRLB 的详细推导（包括 $\bar{\mathbf J}_{\mathbf p\mathbf p}$、$\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}$、$\bar{\mathbf J}_{\boldsymbol\alpha\boldsymbol\alpha}$ 的显式表达）见附录 A。

值得注意的是，CRLB 值是 $\eta$ 的递增函数：换言之，把更多时间分配给通信阶段会导致感知性能退化。我们设计协方差矩阵 $\boldsymbol\Psi$ 以最小化 CRLB，从而改善定位精度的基本极限。基于优化后的感知协方差，用户的实际定位随后用多重信号分类（MUSIC）算法 [33] 完成，细节见附录 B。

### C. 通信模型

在通信阶段，信道基于感知阶段的感知信息估计得到。然而实践中难以实现完美感知。考虑信道不确定性，我们把 AP $m$ 到用户 $k$ 的实际信道建模为 [34]

$$
\mathbf h_{k,m}=\hat{\mathbf h}_{k,m}+\Delta\mathbf h_{k,m},\qquad\left\|\Delta\mathbf h_{k,m}\right\|\le\epsilon_{k,m},\tag{3}
$$

其中 $\hat{\mathbf h}_{k,m}\in\mathbb C^{N_t\times1}$ 为 AP $m$ 到用户 $k$ 的估计信道，$\Delta\mathbf h_{k,m}\in\mathbb C^{N_t\times1}$ 为相应信道估计误差，$\epsilon_{k,m}$ 为误差向量范数的上界。

直观上，定位误差越大，信道估计误差越严重。然而解析量化定位误差引起的信道估计误差颇具挑战，因为如式（1）所示，诱导的信道误差不仅取决于误差幅度，也取决于其方向。因此我们用数值方法研究该关系。具体地，考虑一个位于 $(0,0)$ m 的 AP，固定用户—AP 距离 $r=25$ m。用户位置误差建模为幅度固定为 $\Delta r=\sqrt{(c^x_k-\hat c^x_k)^2+(c^y_k-\hat c^y_k)^2}$、方向在 $[0,2\pi)$ 上均匀随机的随机向量，其中 $(\hat c^x_k,\hat c^y_k)$ 为用户 $k$ 的估计位置。相应的、在位置误差随机方向上取平均的信道误差为 $\Delta h=\mathbb E[\|\mathbf h_{k,m}(c^x_k,c^y_k)-\mathbf h_{k,m}(\hat c^x_k,\hat c^y_k)\|]$，其中期望由 $10^5$ 次 Monte Carlo 实现计算。

如图 3(a) 所示，信道误差被画为定位误差的函数（三种不同用户位置）。尽管位置不同，所有曲线表现出几乎相同的增长行为，随定位误差单调递增。这是因为 AP—用户距离被固定以保证信道增益公平，导致信道向量范数相近、误差缩放相似。图 3(b) 固定用户位置、令天线数在 20、40、60 间变化。此时虽对定位误差的依赖趋势相似，但天线更多的阵列其期望信道误差 $\Delta h$ 更大，因为信道向量范数更大（即波束赋形增益更高）。这些结果确认：信道误差近似随定位误差线性增长，并与信道范数成正比。

**图 3：** 信道估计误差对用户定位误差：(a) 固定天线数（$N_t=20$）时不同用户位置；(b) 固定用户位置（$c^x_k=12.5$，$c^y_k=21.7$）时不同天线数。（来源：原文第 5 页。）

由于 CRLB 与定位 MSE 密切相关，我们定义如下信道不确定性界：

$$
\epsilon_{k,m}(\boldsymbol\Psi,\eta)=\alpha_e\sqrt{\mathrm{Tr}\left(\mathrm{CRLB}(\boldsymbol\Psi,\eta)\right)}\left\|\mathbf h_{k,m}\right\|,\tag{4}
$$

其中 $\alpha_e$ 为比例常数。值得注意的是，这里没有使用各用户的单独 CRLB 值，而用 $\mathrm{Tr}(\mathrm{CRLB}(\boldsymbol\Psi,\eta))$ 提供上界。

通过感知获得用户位置与信道信息后，所有 AP 向用户发送通信信号。令 $\mathbf x_m\in\mathbb C^{N_t\times1}$ 为 AP $m$ 发送的通信信号，则可写为 $\mathbf x_m=\sum_k\mathbf w_{k,m}b_k$，其中 $\mathbf w_{k,m}\in\mathbb C^{N_t\times1}$ 为 AP $m$ 对用户 $k$ 的发射波束赋形向量，$b_k\sim\mathcal{CN}(0,1)$ 为用户 $k$ 的信息承载信号。令 $\mathbf w=\{\mathbf w_{k,m}\}_{k\in\mathcal K,m\in\mathcal M}$。用户 $k$ 的接收信号为 $y_k=\sum_m(\mathbf h_{k,m}^H\mathbf w_{k,m}b_k+\sum_{k'\ne k}\mathbf h_{k,m}^H\mathbf w_{k',m}b_{k'})+n_k$，其中 $n_k\sim\mathcal{CN}(0,\sigma^2)$ 为加性高斯噪声。假定 $b_k$ 互不相关，即对 $k\ne k'$ 有 $\mathbb E[b_kb^*_{k'}]=0$。用户 $k$ 的可达速率由 [13] 给出：

$$
R_k(\mathbf w,\eta)=\eta T\log_2\left(1+\frac{\left|\sum_m\mathbf h_{k,m}^H\mathbf w_{k,m}\right|^2}{\sum_{k'\ne k}\left|\sum_m\mathbf h_{k,m}^H\mathbf w_{k',m}\right|^2+\sigma^2}\right)
=\eta T\log_2\left(1+\frac{\left|\sum_m\left(\hat{\mathbf h}_{k,m}+\Delta\mathbf h_{k,m}\right)^H\mathbf w_{k,m}\right|^2}{\sum_{k'\ne k}\left|\sum_m\left(\hat{\mathbf h}_{k,m}+\Delta\mathbf h_{k,m}\right)^H\mathbf w_{k',m}\right|^2+\sigma^2}\right).\tag{5}
$$

注意信道不确定性界（4）与感知精度密切相关。后续各节中，当上下文明确时，速率、CRLB 与误差界对 $\boldsymbol\Psi$、$\mathbf w$、$\eta$ 的函数依赖可能被省略。

### D. 问题表述

所提系统在感知阶段估计用户位置，所得信息既用于提供感知服务，也用于为后续通信阶段构造通信信道。我们的目标是在保证感知服务所需定位精度的同时，最大化所有用户中的最坏情况通信速率。相应优化问题表述如下：

$$
\max_{\boldsymbol\Psi,\mathbf w,\eta}\ \min_k\ \min_{\|\Delta\mathbf h_{k,m}\|\le\epsilon_{k,m}(\boldsymbol\Psi,\eta),\forall m}\ R_k\tag{6a}
$$

$$
\text{s.t.}\quad \mathrm{CRLB}(\boldsymbol\Psi,\eta)\le\mathrm{CRLB}_{\mathrm{th}},\tag{6b}
$$

$$
\sum_k\left\|\mathbf w_{k,m}\right\|^2\le P_{\max},\quad\forall m,\tag{6c}
$$

$$
\mathrm{Tr}\left(\boldsymbol\Psi_m\right)\le P_s^{\max},\quad\forall m,\tag{6d}
$$

$$
\boldsymbol\Psi_m\succeq0,\quad\forall m,\tag{6e}
$$

$$
0<\eta<1,\tag{6f}
$$

其中（6b）确保用户位置估计的 CRLB 值不高于为感知服务预设的阈值 $\mathrm{CRLB}_{\mathrm{th}}$，（6c）与（6d）分别为通信与感知功率约束（对应 $P_{\max}$ 与 $P_s^{\max}$），（6e）保证感知协方差矩阵半正定，（6f）确保感知与通信阶段之间的有效时间分配。问题（6）的一个有趣之处在于：用户速率看起来随 $\eta$ 线性增长；然而随 $\eta$ 增大，感知精度退化，导致误差界 $\epsilon_{k,m}$ 增大。因此用户速率并非 $\eta$ 的简单递增函数，而是在感知与通信之间呈现折中。

## III. 主算法

问题（6）由于感知精度与通信速率之间的复杂耦合而非凸，通常难以直接求解。为应对该挑战，我们提出一种算法：采用交替优化（AO）框架 [19]，并利用 S-过程 [35] 与半定规划（SDP）松弛技术 [20] 求解所得问题。该算法称为**带鲁棒波束赋形与时间分配的时分组 ISAC 算法（TD-ISAC-Main）**。详细流程如下。

### A. 感知矩阵优化

首先，最优感知协方差矩阵不随分时比 $\eta$ 改变，因为假定所有用户的信道在整个时隙 $T$ 内保持不变。因此感知协方差矩阵优化问题可表述为

$$
\min_{\boldsymbol\Psi}\ \mathrm{CRLB}(\boldsymbol\Psi)\quad\text{s.t.}\quad(6d),(6e).\tag{7}
$$

沿用 [36] 的方法，通过引入松弛变量 $\mathbf U$ 把问题（7）重构为

$$
\min_{\boldsymbol\Psi,\mathbf U}\ \mathrm{Tr}\left(\mathbf U^{-1}\right)\tag{8a}
$$

$$
\text{s.t.}\quad\begin{bmatrix}\bar{\mathbf J}_{\mathbf p\mathbf p}-\mathbf U & \bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}\\ \bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}^T & \bar{\mathbf J}_{\boldsymbol\alpha\boldsymbol\alpha}\end{bmatrix}\succeq0,\tag{8b}
$$

$$
(6d),(6e).\tag{8c}
$$

问题（8）是凸的，可用 CVX [37] 求解。

### B. 通信波束赋形与时间分配优化

本小节在给定感知协方差矩阵 $\boldsymbol\Psi$ 时优化通信波束赋形向量 $\mathbf w$ 与时间分配因子 $\eta$。优化问题可表述为

$$
\max_{\mathbf w,\eta}\ \min_k\ \min_{\|\Delta\mathbf h_{k,m}\|\le\epsilon_{k,m},\forall m}R_k\quad\text{s.t.}\quad(6b),(6c),(6f).\tag{9}
$$

问题（9）由于波束赋形向量 $\mathbf w$ 与时间分配比 $\eta$ 之间的耦合而难以直接求解：改变 $\eta$ 会影响信道不确定性界，进而影响鲁棒波束赋形设计。下文先描述在固定一个变量（波束赋形或时间分配）时对另一个变量的优化，然后给出完整的交替优化算法，并讨论其收敛性与计算复杂度。

**1）波束赋形优化：** 首先固定 $\eta$，引入松弛变量 $R$ 把最坏情况速率最大化问题重构为更易处理的形式：

$$
\max_{\mathbf w,R}\ R\tag{10a}
$$

$$
\text{s.t.}\quad \min_{\|\Delta\mathbf h_{k,m}\|\le\epsilon_{k,m},\forall m}R_k\ge R,\quad\forall k,\tag{10b}
$$

$$
(6c),(6f).\tag{10c}
$$

问题（10）由于（10b）中信道不确定性引入的最坏情况速率约束而难以求解。为消去（10b）约束中的 $\min$ 运算，重构如下：

$$
\frac1\gamma\left|\sum_m\left(\hat{\mathbf h}_{k,m}+\Delta\mathbf h_{k,m}\right)^H\mathbf w_{k,m}\right|^2-\sum_{k'\ne k}\left|\sum_m\left(\hat{\mathbf h}_{k,m}+\Delta\mathbf h_{k,m}\right)^H\mathbf w_{k',m}\right|^2-\sigma^2\ge0,\tag{11a}
$$

$$
\left\|\Delta\mathbf h_{k,m}\right\|\le\epsilon_{k,m},\quad\forall k,m,\tag{11b}
$$

其中 $\gamma=2^{R/\eta T}-1$。定义 $\Delta\mathbf h_k=[\Delta\mathbf h_{k,1}^T,\dots,\Delta\mathbf h_{k,M}^T]^T$、$\hat{\mathbf h}_k=[\hat{\mathbf h}_{k,1}^T,\dots,\hat{\mathbf h}_{k,M}^T]^T$、$\mathbf w_k=[\mathbf w_{k,1}^T,\mathbf w_{k,2}^T,\dots,\mathbf w_{k,M}^T]^T$，则（11）可重写为

$$
\Delta\mathbf h_k^H\mathbf M_k\Delta\mathbf h_k+2\Re\left\{\Delta\mathbf h_k^H\mathbf M_k\hat{\mathbf h}_k\right\}+\hat{\mathbf h}_k^H\mathbf M_k\hat{\mathbf h}_k-\sigma^2\ge0,\tag{12a}
$$

$$
\left\|\Delta\mathbf h_{k,m}\right\|\le\epsilon_{k,m},\quad\forall k,m,\tag{12b}
$$

其中 $\mathbf M_k=(1/\gamma)\mathbf W_k-\sum_{k'\ne k}\mathbf W_{k'}$、$\mathbf W_k=\mathbf w_k\mathbf w_k^H$。然而（12a）的不等式仍涉及条件 $\|\Delta\mathbf h_{k,m}\|\le\epsilon_{k,m}$，由于信道扰动可能有无穷多种，该约束难以直接处理。为此我们利用 [35, Theorem 1] 的如下定理。

**定理 1（广义 S-过程）** [35, Theorem 1]：令 $f_0(\mathbf x)=\mathbf x^H\mathbf A_0\mathbf x+2\Re\{\mathbf b_0^H\mathbf x\}+c_0$，对 $i\in\{1,\dots,L\}$ 令 $f_i(\mathbf x)=\mathbf x^H\mathbf A_i\mathbf x+2\Re\{\mathbf b_i^H\mathbf x\}+c_i$，其中 $\mathbf A_i\in\mathbb C^{N\times N}$ 为 Hermitian 矩阵，$\mathbf b_i\in\mathbb C^{N\times1}$、$c_i\in\mathbb R$ 对一切 $i=0,\dots,L$ 成立，$\mathbf x\in\mathbb C^{N\times1}$。若存在标量 $\lambda_i\ge0$ 使
$$
\sum_{i=1}^{L}\lambda_i\begin{bmatrix}\mathbf A_i & \mathbf b_i\\ \mathbf b_i^H & c_i\end{bmatrix}-\begin{bmatrix}\mathbf A_0 & \mathbf b_0\\ \mathbf b_0^H & c_0\end{bmatrix}\succeq0,
$$
则蕴含关系 $f_i(\mathbf x)\le0,\forall i=1,\dots,L\Rightarrow f_0(\mathbf x)\le0$ 成立。

应用定理 1，（12a）中的鲁棒约束可等价重构为

$$
\begin{bmatrix}\mathbf M_k+\boldsymbol\Lambda_k & \mathbf M_k\hat{\mathbf h}_k\\ \hat{\mathbf h}_k^H\mathbf M_k & \hat{\mathbf h}_k^H\mathbf M_k\hat{\mathbf h}_k+\sigma^2-\boldsymbol\lambda_k^T\boldsymbol\epsilon_k\end{bmatrix}\succeq0,\quad\lambda_{k,m}\ge0,\quad\forall k,m,\tag{13}
$$

其中 $\boldsymbol\Lambda_k=\mathrm{blkdiag}(\lambda_{k,1}\mathbf I_{N_t},\dots,\lambda_{k,M}\mathbf I_{N_t})$、$\boldsymbol\lambda_k=[\lambda_{k,1},\dots,\lambda_{k,M}]^T$、$\boldsymbol\epsilon_k=[\epsilon_{k,1}^2,\dots,\epsilon_{k,M}^2]^T$。约束（13）因两个因素而非凸：$\mathbf w_k$ 的二次型，以及波束赋形向量 $\mathbf w_k$ 与速率阈值 $R$ 之间的耦合。为处理第一个因素，我们把波束赋形向量重写为协方差矩阵表示，即 $\mathbf W_k=\mathbf w_k\mathbf w_k^H$，并省略非凸秩一约束以应用 SDP 松弛 [20]。为处理第二个因素，我们利用 $R$ 作为所有用户共同速率阈值这一事实：随 $R$ 增大，所需发射功率单调增长。幸运的是，固定 $R$ 时优化问题变为线性矩阵不等式（LMI）问题。该单调性与凸性支持二分法：对每个固定的 $R$ 求解所得凸可行性问题。该"松弛—搜索"框架可高效计算鲁棒波束赋形矩阵。令 $\mathbf W=\{\mathbf W_k\}_{k\in\mathcal K}$、$\boldsymbol\lambda=\{\boldsymbol\lambda_{k,m}\}_{k\in\mathcal K,m\in\mathcal M}$，优化问题写为

$$
\mathrm{find}\ \mathbf W,\boldsymbol\lambda\tag{14a}
$$

$$
\text{s.t.}\quad\mathbf W_{k,m}\succeq0,\quad\forall k,m,\tag{14b}
$$

$$
\sum_k\mathrm{Tr}\left(\mathbf W_{k,m}\right)\le P_{\max},\quad\forall m,\tag{14c}
$$

$$
(13).\tag{14d}
$$

因此，对给定 $\eta$，可用二分法高效获得波束赋形矩阵 $\mathbf W$。该过程称为**鲁棒波束赋形优化的二分法（Bi-RBO）**，汇总于算法 1。它以 $\eta$、$\mathrm{CRLB}(\boldsymbol\Psi)$、$P_{\max}$、$R_u$ 与 $\epsilon_b$ 为输入，置 $l=0$、$R^{(0)}=R_u$、$R_d=0$ 初始化迭代指标与二分变量。每次迭代求解问题（14）：若问题不可行，更新上界 $R_u=R^{(l)}$；否则更新下界 $R_d=R^{(l)}$，并把速率阈值置为 $R^{(l)}=(R_u+R_d)/2$，其中 $l$ 为迭代指标。该迭代过程持续至收敛，给出给定 $\eta$ 下相应的波束赋形矩阵 $\mathbf W$。

**算法 1：鲁棒波束赋形优化的二分法（Bi-RBO）**

1. **输入：** $\eta$、$\mathrm{CRLB}(\boldsymbol\Psi)$、$P_{\max}$、$R_u$、$\epsilon_b$。
2. 置 $l=0$、$R^{(0)}=R_u$、$R_d=0$。
3. **while** $|R^{(l)}-R^{(l-1)})/R^{(l)}|>\epsilon_b$ **or** $l=0$ **do**
4. 　$l\leftarrow l+1$
5. 　求解问题（14）。
6. 　**if** 问题（14）不可行 **then**
7. 　　$R_u=R^{(l)}$，$R^{(l)}=(R_u+R_d)/2$
8. 　**else**
9. 　　$R_d=R^{(l)}$，$R^{(l)}=(R_u+R_d)/2$
10. 　**end if**
11. **end while**
12. **输出：** $\mathbf W$。

**2）时间分配优化：** 获得 $\mathbf W$ 后，我们优化 $\eta$ 以进一步提升系统性能。然而即使固定 $\mathbf w$，该优化仍然困难，因为 $\epsilon_{k,m}$ 依赖 $\eta$，使问题（9）的凸性分析极为困难。为应对该问题，我们提出通过优化 $\eta$ 来扩大问题（14）的可行集，从而保证性能提升。我们称该方法为**约束裕度最大化算法**，其新颖之处在于它优化时间分配比并非为了直接最大化目标，而是为了扩大可行性。该设计使系统能在不确定性下有效平衡感知与通信。详细流程如下。

在问题（14）中，唯一依赖 $\eta$ 的约束是（13）的 LMI，它难以直接处理。应用 Schur 补 [38]，可重构为

$$
\mathbf A_k(\eta)\succeq0,\quad\forall k,\tag{15}
$$

其中 $\mathbf A_k(\eta)=\hat{\mathbf h}_k^H\mathbf M_k(\eta)\hat{\mathbf h}_k+\sigma^2-\boldsymbol\lambda_k^T\boldsymbol\epsilon_k(\eta)-\hat{\mathbf h}_k^H\mathbf M_k(\eta)(\mathbf M_k(\eta)+\boldsymbol\Lambda_k)^{-1}\mathbf M_k(\eta)\hat{\mathbf h}_k$。若可通过优化 $\eta$ 增大 $\mathbf A_k(\eta)$，约束会变得更松，从而扩大后续 $\mathbf W$ 优化的可行集。因此我们通过求解下式更新 $\eta$：

$$
\eta=\arg\max_{0<\eta<1}\ \min_k\ \mathbf A_k(\eta).\tag{16}
$$

由于 $\mathbf A_k(\eta)$ 形式复杂使问题（16）非凸，我们对 $\eta\in(0,1)$ 采用步长 $\epsilon_\eta$ 的一维搜索。

**3）整体算法：** 遵循标准 AO 框架，我们迭代优化波束赋形矩阵 $\mathbf W$ 与时间分配 $\eta$。为分析收敛性，令 $(\mathbf W^{(l)},\eta^{(l)})$ 为第 $l$ 次迭代的可行解，则（15）对 $(\mathbf W^{(l)},\eta^{(l)})$ 成立。由于增大 $\mathbf A_k$ 会放松 LMI 约束，原解 $\mathbf W^{(l)}$ 对任何更新的 $\eta^{(l+1)}$ 仍然可行。此外，Bi-RBO 对给定 $\eta$ 产生全局最优波束赋形矩阵 $\mathbf W$。因此更新后的解 $\mathbf W^{(l+1)}$ 取得的速率不劣于 $\mathbf W^{(l)}$，从而得到非降序列。由于可达速率上有界（例如受发射功率约束），该序列收敛，保证 $\eta$ 与 $\mathbf W$ 间 AO 过程的单调性与收敛性。

目标值收敛后，还需满足（6b）的 CRLB 约束。令 $\bar\eta$ 表示使（6b）取等号的值，则 $\bar\eta$ 可写为

$$
\bar\eta=1-\frac{\tau_s\sigma^2\mathrm{Tr}\left(\left(\bar{\mathbf J}_{\mathbf p\mathbf p}-\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}^T\bar{\mathbf J}_{\boldsymbol\alpha\boldsymbol\alpha}^{-1}\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}\right)^{-1}\right)}{2T\,\mathrm{CRLB}_{\mathrm{th}}}.\tag{17}
$$

**算法 2：带鲁棒波束赋形与时间分配的时分组 ISAC 算法（TD-ISAC-Main）**

1. **输入：** $\eta^{(0)}$、$\epsilon$、$\epsilon_\eta$、$\epsilon_b$、$R_u$、$P_{\max}$、$P_s^{\max}$、$\mathrm{CRLB}_{\mathrm{th}}$。
2. 置 $l=0$。
3. 通过求解问题（8）得到 $\mathrm{CRLB}(\boldsymbol\Psi)$。
4. **while** $|(\eta^{(l)}-\eta^{(l-1)})/\eta^{(l-1)}|>\epsilon$ **or** $l=0$ **do**
5. 　$l\leftarrow l+1$
6. 　$\mathbf W^{(l)}\leftarrow\mathrm{Bi\text{-}RBO}(\eta^{(l-1)},\mathrm{CRLB}(\boldsymbol\Psi),P_{\max},R_u,\epsilon_b)$。
7. 　通过求解问题（16）更新 $\eta^{(l)}$。
8. **end while**
9. 用（18）求最优 $\eta^{\mathrm{opt}}$。
10. **if** $\eta^{\mathrm{opt}}=\bar\eta$ **then**
11. 　$\mathbf W^{(l)}\leftarrow\mathrm{Bi\text{-}RBO}(\eta^{(l-1)},\mathrm{CRLB}(\boldsymbol\Psi),P_{\max},R_u,\epsilon_b)$。
12. **end if**
13. 由 $\mathbf W^{(l)}_k$ 的特征值分解得到 $\mathbf w_k$。
14. **输出：** $\mathbf w$、$\eta$。

令 $\eta^{(L)}$ 表示最后一次迭代 $L$ 返回的 $\eta$ 值。由于（6b）强制上界 $\eta\le\bar\eta$，最终时间分配比 $\eta^{\mathrm{opt}}$ 取为

$$
\eta^{\mathrm{opt}}=\min\{\bar\eta,\eta^{(L)}\},\tag{18}
$$

它对应于把 $\eta^{(L)}$ 投影到可行集上。若（无约束）解 $\eta^{(L)}$ 违反 CRLB 约束，则选择边界值 $\bar\eta$。此外，当 $\eta^{\mathrm{opt}}$ 与 $\bar\eta$ 重合时，先前计算的解 $\mathbf W^{(l)}$ 可能不满足最优性条件；为保证可行性，算法在这种情况下额外执行一次波束赋形优化步（原文算法 2 第 11 行仍传入 $\eta^{(l-1)}$，疑应为 $\eta^{\mathrm{opt}}$，见页首译注 1）。最后，由于 SDP 松弛返回的是波束赋形矩阵 $\mathbf W$ 而非向量 $\mathbf w$，通过特征值分解提取波束赋形向量，即 $\mathbf w_k=\rho_k\sqrt{\lambda_{\max}(\mathbf W^{(l)}_k)}\mathbf v_{\max}(\mathbf W^{(l)}_k)$，其中 $\lambda_{\max}(\cdot)$、$\mathbf v_{\max}(\cdot)$ 为矩阵的最大特征值及对应特征向量，$\rho_k$ 为使解可行的缩放因子，从而完成算法。TD-ISAC-Main 的整体流程汇总于算法 2。

我们分析 TD-ISAC-Main 的计算复杂度。CVX 中采用内点法，其复杂度按 $\mathcal O(V^{3.5})$ 缩放，$V$ 为优化变量数。在（8）中，优化感知协方差矩阵涉及 $M$ 个 $N_t\times N_t$ 矩阵；由于 $N_t\gg K$，额外松弛变量维数相对较小、影响可忽略，故复杂度按 $\mathcal O((MN_t^2)^{3.5})$ 缩放。对通信波束赋形设计，有 $K$ 个维数 $MN_t\times MN_t$ 的矩阵，复杂度为 $\mathcal O((K(MN_t)^2)^{3.5})$。（16）中的时间分配更新由复杂度 $\mathcal O(1/\epsilon_\eta)$ 的一维搜索处理；对每个候选 $\eta$，计算 $\mathbf A_k(\eta)$ 需复杂度 $\mathcal O(K(MN_t)^3)$ 的矩阵求逆，故优化 $\eta$ 的总复杂度为 $\mathcal O((1/\epsilon_\eta)K(MN_t)^3)$。合并各项，总复杂度为 $\mathcal O((MN_t^2)^{3.5}+I((K(MN_t)^2)^{3.5}+(1/\epsilon_\eta)K(MN_t)^3))$，其中 $I$ 为外层迭代次数。

## IV. 低复杂度算法

在主算法（TD-ISAC-Main）中，感知协方差矩阵一步算出并给出全局最优、无需迭代；相反，通信波束赋形与时间分配的优化需要迭代更新。因此该阶段计算开销更高，因为它要在每次二分搜索与 AO 迭代内求解一个 SDP。本节提出两种用于通信波束赋形与时间分配优化的低复杂度次优算法。

### A. 误差忽略波束赋形与时间分配的时分组 ISAC 算法

第一种次优算法称为**误差忽略波束赋形与时间分配的时分组 ISAC 算法（TD-ISAC-EI）**。该算法通过置 $\Delta\mathbf h_{k,m}=\mathbf 0_{N_t}$ 假定完美 CSI，从而避免为考虑信道误差所需的交替优化（AO）框架与 S-过程，降低计算复杂度。因此，当感知约束严格（即定位足够准确）时，TD-ISAC-EI 的性能接近 TD-ISAC-Main；但在大感知误差下性能退化，因为 $\eta$ 与波束赋形向量是在未考虑信道不确定性的情况下优化的。TD-ISAC-EI 的详细流程如下。问题（9）改写为

$$
\max_{\mathbf w,\eta}\ \min_k\ R_k\quad\text{s.t.}\quad(6b),(6c),(6f).\tag{19}
$$

此时可达速率 $R_k$ 成为 $\eta$ 的线性函数，因此自然希望最大化 $\eta$ 以增大 $R_k$。然而随 $\eta$ 增大 CRLB 单调上升，故最优 $\eta$ 使（6b）的 CRLB 约束取紧（即取等号）。相应地，最优 $\eta$ 即式（17）给出的 $\bar\eta$。随后进行通信用户波束赋形优化。尽管用户速率表达式 $R_k$ 已被简化，问题（19）仍因其 max–min 结构而困难。与问题（10）类似，引入松弛变量 $\tilde R$ 并重构为

$$
\max_{\mathbf w,\tilde R}\ \tilde R\tag{20a}
$$

$$
\text{s.t.}\quad R_k\ge\tilde R,\quad\forall k,\tag{20b}
$$

$$
(6c).\tag{20c}
$$

然而问题（20）仍因（20b）中的对数函数而非凸。为克服该点，展开对数项并变换速率约束如下：

$$
\left|\hat{\mathbf h}_k^H\mathbf w_k\right|^2\ge\tilde\gamma\left(\sum_{k'\ne k}\left|\hat{\mathbf h}_k^H\mathbf w_{k'}\right|^2+\sigma^2\right),\tag{21}
$$

其中 $\tilde\gamma=2^{\tilde R/(\bar\eta T)}-1$。令 $\mathbf t_k=[|\hat{\mathbf h}_k^H\mathbf w_1|,\dots,|\hat{\mathbf h}_k^H\mathbf w_{k-1}|,|\hat{\mathbf h}_k^H\mathbf w_{k+1}|,\dots,|\hat{\mathbf h}_k^H\mathbf w_K|,\sigma]^T$。利用 $|\hat{\mathbf h}_k^H\mathbf w_k|=|\hat{\mathbf h}_k^H\mathbf w_ke^{\mathrm j\phi}|=\Re\{\hat{\mathbf h}_k^H\mathbf w_k\}$，可将（21）等价写为

$$
\Re\left\{\hat{\mathbf h}_k^H\mathbf w_k\right\}\ge\sqrt{\tilde\gamma}\left\|\mathbf t_k\right\|.\tag{22}
$$

尽管如此，问题（19）仍因 $\tilde R$ 与 $\mathbf w$ 的耦合而非凸。幸运的是，固定 $\tilde R$ 时（22）成为标准二阶锥规划（SOCP）约束。与 TD-ISAC-Main 中的 $R$ 类似，变量 $\tilde R$ 作为所有用户的共同速率阈值；对给定 $\tilde R$，波束赋形向量 $\mathbf w$ 可通过求解如下可行性问题获得：

$$
\mathrm{find}\ \mathbf w\quad\text{s.t.}\quad(22),(6c).\tag{23}
$$

若问题（23）可行则增大 $\tilde R$，否则减小。该过程通过二分搜索给出所需波束赋形向量，TD-ISAC-EI 的流程汇总于算法 3。我们分析 TD-ISAC-EI 的计算复杂度。系统涉及 $K$ 个用户，每个波束赋形向量为 $\mathbf w_k\in\mathbb C^{MN_t\times1}$，故 TD-ISAC-EI 的复杂度按 $\mathcal O((KMN_t)^{3.5})$ 缩放。相比 TD-ISAC-Main（其中 $N_t^2$ 项主导复杂度），这是一个实质性的降低——该项现被 $N_t$ 取代。此外，不再需要约束裕度最大化与优化 $\eta$ 的迭代过程，进一步降低总体计算负担。对 TD-ISAC-EI，由于 $\tilde R$ 是在忽略信道误差下计算的，需要额外后处理步骤来获得考虑信道不确定性的最坏情况速率：给定 TD-ISAC-EI 得到的波束赋形向量 $\mathbf w$，问题（14）退化为以 $\boldsymbol\lambda$ 为优化变量的 LMI 可行性问题，可通过在速率阈值 $R$ 上二分搜索高效求解，从而得到最坏情况速率。

**算法 3：误差忽略波束赋形与时间分配的时分组 ISAC 算法（TD-ISAC-EI）**

1. **输入：** $\epsilon$、$P_{\max}$、$P_s^{\max}$、$\mathrm{CRLB}_{\mathrm{th}}$、$\tilde R_u$。
2. 置 $l=0$、$\tilde R^{(0)}=\tilde R_u$、$\tilde R_d=0$。
3. 通过求解问题（8）得到 $\mathrm{CRLB}(\boldsymbol\Psi)$。
4. 用（17）求最优 $\eta$。
5. **while** $|\tilde R^{(l)}-\tilde R^{(l-1)})/\tilde R^{(l)}|>\epsilon$ **or** $l=0$ **do**
6. 　$l\leftarrow l+1$。
7. 　求解问题（23）。
8. 　**if** （23）不可行 **then**
9. 　　$\tilde R_u=\tilde R^{(l)}$，$\tilde R^{(l)}=(\tilde R_u+\tilde R_d)/2$
10. 　**else**
11. 　　$\tilde R_d=\tilde R^{(l)}$，$\tilde R^{(l)}=(\tilde R_u+\tilde R_d)/2$
12. 　**end if**
13. **end while**
14. **输出：** $\mathbf w$、$\eta$。

### B. MRT 下鲁棒功率与时间分配的时分组 ISAC 算法

第二种次优算法称为 **MRT 下鲁棒功率与时间分配的时分组 ISAC 算法（TD-ISAC-MRT）**。在 TD-ISAC-MRT 中，我们假定波束赋形采用最大比传输（MRT）。随 $N_t$ 增大，用户信道渐近正交，使 MRT 在大天线机制下近最优 [26]，因而是一种有效的次优波束赋形策略。在 MRT 下，剩余优化变量缩减为各 MRT 波束间的功率分配与时间分配比，它们被优化以对信道误差鲁棒。与在完美 CSI 假设下设计波束赋形向量、信道误差较大时可能遭受严重性能损失的 TD-ISAC-EI 相比，TD-ISAC-MRT 在功率与时间分配中显式考虑信道不确定性，从而在保持低复杂度的同时提供更好的鲁棒性。详细流程如下。

在 MRT 中，波束赋形向量基于各 AP 的估计信道设计，定义为 $\mathbf w_{k,m}=\frac{\hat{\mathbf h}_{k,m}}{\|\hat{\mathbf h}_{k,m}\|}\sqrt{P_{k,m}}$，$\forall k,m$，其中 $P_{k,m}$ 为 AP $m$ 分配给用户 $k$ 的功率。令 $\mathbf p_k=[\sqrt{P_{k,1}},\dots,\sqrt{P_{k,M}}]^T$。与（9）类似，对给定 $\eta$，引入松弛变量 $\tilde R^{\mathrm{MRT}}$ 重构优化问题：

$$
\max_{\mathbf p,\tilde R^{\mathrm{MRT}}}\ \tilde R^{\mathrm{MRT}}\tag{24a}
$$

$$
\text{s.t.}\quad\min_{\|\Delta\mathbf h_{k,m}\|\le\epsilon_{k,m},\forall m}R_k\left(\mathbf w^{\mathrm{MRT}}_k,\eta\right)\ge\tilde R^{\mathrm{MRT}},\quad\forall k,\tag{24b}
$$

$$
\sum_kP_{k,m}\le P_{\max},\quad\forall m,\tag{24c}
$$

其中 $\mathbf p=\{\mathbf p_k\}_{k\in\mathcal K}$、$\mathbf w^{\mathrm{MRT}}_k=[\frac{\hat{\mathbf h}_{k,1}}{\|\hat{\mathbf h}_{k,1}\|}\sqrt{P_{k,1}},\dots,\frac{\hat{\mathbf h}_{k,M}}{\|\hat{\mathbf h}_{k,M}\|}\sqrt{P_{k,M}}]^T$。应用定理 1，（24b）可表示为

$$
\begin{bmatrix}\mathbf M^{\mathrm{MRT}}_k+\boldsymbol\Lambda_k & \mathbf M^{\mathrm{MRT}}_k\hat{\mathbf h}_k\\ \hat{\mathbf h}_k^H\mathbf M^{\mathrm{MRT}}_k & \hat{\mathbf h}_k^H\mathbf M^{\mathrm{MRT}}_k\hat{\mathbf h}_k+\sigma^2-\boldsymbol\lambda_k^T\boldsymbol\epsilon_k\end{bmatrix}\succeq0,\quad\lambda_{k,m}\ge0,\quad\forall k,m,\tag{25}
$$

其中 $\mathbf M^{\mathrm{MRT}}_k=-(1/\tilde\gamma^{\mathrm{MRT}})\mathbf W^{\mathrm{MRT}}_k+\sum_{k'\ne k}\mathbf W^{\mathrm{MRT}}_{k'}$、$\mathbf W^{\mathrm{MRT}}_k=\mathbf w^{\mathrm{MRT}}_k(\mathbf w^{\mathrm{MRT}}_k)^H=\mathbf A_k\mathbf p_k\mathbf p_k^H\mathbf A_k^H$、$\mathbf A_k=\mathrm{blkdiag}(\frac{\hat{\mathbf h}_{k,1}}{\|\hat{\mathbf h}_{k,1}\|},\dots,\frac{\hat{\mathbf h}_{k,M}}{\|\hat{\mathbf h}_{k,M}\|})$。与（13）类似，约束（25）因 $\mathbf p_k$ 的二次型及其与共同速率阈值 $\tilde R^{\mathrm{MRT}}$ 的耦合而非凸。为此把功率分配向量重写为协方差矩阵表示，即 $\mathbf P_k=\mathbf p_k\mathbf p_k^H$，并省略非凸秩一约束以应用 SDP 松弛。此外，利用 $\tilde R^{\mathrm{MRT}}$ 与所需发射功率之间的单调关系，可在 $\tilde R^{\mathrm{MRT}}$ 上做二分搜索；固定 $\tilde R^{\mathrm{MRT}}$ 时优化问题退化为 LMI 问题，故问题（24）可由二分法高效处理。相应可行性问题写为

$$
\mathrm{find}\ \mathbf P,\boldsymbol\lambda\quad\text{s.t.}\quad(24c),(25),\tag{26}
$$

其中 $\mathbf P=\{\mathbf P_k\}_{k\in\mathcal K}$。把 Bi-RBO 中第 5 行（求解问题（14））替换为基于 MRT 的形式（求解问题（26））后，优化变量与输出从波束赋形矩阵 $\mathbf W$ 变为功率分配矩阵 $\mathbf P$，算法其余步骤完全不变。我们称 Bi-RBO 的基于 MRT 的变体为 **Bi-RPO-MRT**。

获得基于 MRT 的波束赋形向量后，我们继续优化 $\eta$ 以进一步提升总体系统性能。把 MRT 波束赋形代入（16），$\eta$ 的优化可按与 TD-ISAC-Main 相同的方式进行。具体地，$\eta$ 被优化以最大化约束的可行域，遵循约束裕度最大化算法。因此 $\eta$ 优化问题可表述为

$$
\eta=\arg\max_{0<\eta<1}\ \min_k\ \mathbf A^{\mathrm{MRT}}_k(\eta),\tag{27}
$$

其中 $\mathbf A^{\mathrm{MRT}}_k(\eta)=\hat{\mathbf h}_k^H\mathbf M^{\mathrm{MRT}}_k(\eta)\hat{\mathbf h}_k+\sigma^2-\boldsymbol\lambda_k^T\boldsymbol\epsilon_k(\eta)-\hat{\mathbf h}_k^H\mathbf M^{\mathrm{MRT}}_k(\eta)(\mathbf M^{\mathrm{MRT}}_k(\eta)+\boldsymbol\Lambda_k)^{-1}\mathbf M^{\mathrm{MRT}}_k(\eta)\hat{\mathbf h}_k$。（27）可由步长 $\epsilon_\eta$ 的一维搜索求解。

与 TD-ISAC-Main 类似，功率分配与 $\eta$ 优化迭代更新直至收敛，最优 $\eta^{\mathrm{opt}}$ 由（18）确定；若 $\eta^{\mathrm{opt}}=\bar\eta$，则再次执行二分过程（Bi-RPO-MRT），随后算法终止。TD-ISAC-MRT 的优化流程汇总于算法 4。最后，功率分配向量由 $\mathbf p_k=\rho^{\mathrm{MRT}}_k\sqrt{\lambda_{\max}(\mathbf P^{(l)}_k)}\mathbf u_{\max}(\mathbf P^{(l)}_k)$ 得到，其中 $\rho^{\mathrm{MRT}}_k$ 为缩放因子。在 MRT 波束赋形情形下，整体算法流程与 TD-ISAC-Main 相同，差异仅出现在数学表述上。因此计算 TD-ISAC-MRT 的复杂度只需重新计算（26）的复杂度并代入总体表达式。在 $K$ 个用户与 $M$ 个 AP 下，优化变量总数缩减为 $KM^2$，相应 TD-ISAC-MRT 的复杂度为 $\mathcal O(I((KM^2)^{3.5}+(1/\epsilon_\eta)K(MN_t)^3))$。与由 $(KMN_t)^{3.5}$ 主导的 TD-ISAC-EI 相比，TD-ISAC-MRT 的主导项为 $\frac1{\epsilon_\eta}K(MN_t)^3$。因此，除了 $\epsilon_\eta$ 很小或用户数与 AP 数很少的情形，TD-ISAC-MRT 的复杂度通常低于 TD-ISAC-EI，是所提方案中复杂度最低者。

**算法 4：MRT 下鲁棒功率与时间分配的时分组 ISAC 算法（TD-ISAC-MRT）**

1. **输入：** $\eta^{(0)}$、$\epsilon$、$\epsilon_\eta$、$\epsilon_b$、$R_u$、$P_{\max}$、$P_s^{\max}$、$\mathrm{CRLB}_{\mathrm{th}}$。
2. 置 $l=0$。
3. 通过求解（8）得到 $\mathrm{CRLB}(\boldsymbol\Psi)$。
4. **while** $|(\eta^{(l)}-\eta^{(l-1)})/\eta^{(l-1)}|>\epsilon$ **or** $l=0$ **do**
5. 　$l\leftarrow l+1$
6. 　$\mathbf P^{(l)}\leftarrow\mathrm{Bi\text{-}RPO\text{-}MRT}(\eta^{(l-1)},\mathrm{CRLB}(\boldsymbol\Psi),P_{\max},R_u,\epsilon_b)$。
7. 　通过求解（16）更新 $\eta^{(l)}$。
8. **end while**
9. 用（18）求最优 $\eta^{\mathrm{opt}}$。
10. **if** $\eta^{\mathrm{opt}}=\bar\eta$ **then**
11. 　$\mathbf P^{(l)}\leftarrow\mathrm{Bi\text{-}RPO\text{-}MRT}(\eta^{(l-1)},\mathrm{CRLB}(\boldsymbol\Psi),P_{\max},R_u,\epsilon_b)$。
12. **end if**
13. 由 $\mathbf P^{(l)}_k$ 的特征值分解得到 $\mathbf p_k$。
14. **输出：** $\mathbf P$、$\eta$。

## V. 数值结果

我们给出多种仿真结果以展示所提框架与算法的有效性。设置用户数 $K=4$、AP 数 $M=3$；每个 AP 配备 $N_t=21$ 根天线的 ULA，载频 $f_c=28$ GHz。阵列孔径 $D=0.53$ m [8]、[14]，近场区域约为 $2D^2/\lambda\approx53$ m。噪声方差 $\sigma^2=-70$ dBm。在 $70\ \mathrm m\times70\ \mathrm m$ 的方形区域内，AP 位于 $(30,70)$ m、$(10,20)$ m 与 $(60,30)$ m，用户位于 $xy$ 平面上的 $(20,30)$ m、$(25,40)$ m、$(40,30)$ m 与 $(35,60)$ m。假定 $T=100$ ms、$\tau_s=1$ ms。基于图 3 的数值结果，式（4）中的比例常数 $\alpha_e$ 设为 373。本节为简洁起见，把 TD-ISAC-Main、TD-ISAC-EI、TD-ISAC-MRT 分别称为 **Main**、**EI**、**MRT**。

图 4 给出不同 AP 数下 $\sqrt{\mathrm{CRLB}}$ 随感知功率的变化。为公平比较，$M=1$ 与 $M=2$ 时每个 AP 分别配备 63 与 32 根天线，其感知功率预算分别设为 $M=3$ 情形的 3 倍与 1.5 倍。随感知功率增大，$\sqrt{\mathrm{CRLB}}$ 仅适度下降；而增加 AP 数带来陡峭得多且更一致的下降，导致定位性能显著优于单 AP 基线。这确认了在多用户感知场景中，增加 AP 不仅提供更多天线与更高总功率，还带来内在的多站增益，如增强的信道分集与空间分辨率。

**图 4：** $\sqrt{\mathrm{CRLB}}$ 对 $P_s^{\max}$（不同 AP 数：$M=1,2,3$；横轴感知功率 25—40 dBm，纵轴对数刻度）。（来源：原文第 10 页。）

图 5 展示感知性能：用求解问题（8）得到的优化感知协方差矩阵 $\boldsymbol\Psi$ 运行 2D-MUSIC 算法。归一化 MUSIC 强度以颜色可视化：红色为高于最小强度目标的值，绿色为低于该目标 5 dB 以内，青色为低 5—7 dB，蓝色为低于该目标 7 dB 以上。为模拟远场基准，AP $l$ 到用户 $k$ 的导向矢量建模为 $\mathbf a_{k,l}(r^x_{k,l},r^y_{k,l})=\mathbf a_{k,l}(\theta_{k,l})$，其中 $\theta_{k,l}$ 为 AP $l$ 到用户 $k$ 的离开角（AoD）。如图 5(a) 与 5(c) 所示，近场 MUSIC 算法准确定位用户，仅真实用户位置被标为红色。相反，图 5(b) 与 5(d) 表明远场情形下不仅用户位置、而且若干周围旁瓣也达到红色水平。该模糊性源于：远场中来自同一角度的信号产生相同导向矢量，故在角度域不可区分。例如虽然 $(35,60)$ 与 $(40,30)$ 处的用户被正确检测，但 $(20,30)$ 与 $(25,40)$ 附近的旁瓣产生更高峰值，导致定位误差。这些结果表明所提近场框架比远场对应物提供更准确的用户定位与更可靠的信道重建。

**图 5：** $P_s^{\max}=40$ dBm 时近场与远场场景归一化 MUSIC 谱比较，共 (a)—(d) 四个面板。（来源：原文第 11 页。）

图 6 展示所提算法在不同感知与通信功率预算下的最差用户速率。随通信功率或感知功率增大，所有所提方案的可达速率都提升。特别地，增加感知功率带来的速率增益显著大于增加通信功率。在存在信道估计误差时，增加通信功率只带来有限收益，因为残余信道误差仍约束性能；而增加感知功率直接降低估计误差幅度，从而带来大得多的速率改善。图 7 进一步展示不同 CRLB 阈值与感知功率水平下的该行为。在 $P_s^{\max}=35$ dBm 时，把 $\mathrm{CRLB}_{\mathrm{th}}$ 从 $1\times10^{-11}$ 提高到 $2\times10^{-11}$ 会改善所有方案的速率。这是因为在 $P_s^{\max}=35$ dBm 与 $\mathrm{CRLB}_{\mathrm{th}}=1\times10^{-11}$ 时感知约束严格，迫使 $\eta$ 取小值，从而降低可达速率。然而在其他参数设置下，改变 $\mathrm{CRLB}_{\mathrm{th}}$ 对 Main 与 MRT 的性能影响很小，而 EI 持续遭受速率退化。这表明 Main 与 MRT 一致地调整 $\eta$ 以平衡通信与感知性能，而 EI 仅以满足感知约束（取等号）来确定 $\eta$。因此放松感知约束会增加 EI 方案中的信道误差，进而导致速率下降。

**图 6：** 两个感知功率水平下所提算法的最差用户速率对通信功率（$\mathrm{CRLB}_{\mathrm{th}}=1\times10^{-11}$）。（来源：原文第 11 页。）

**图 7：** 所提算法在 $P_{\max}=30$ dBm、两个感知功率水平下的最差用户速率对 $\mathrm{CRLB}_{\mathrm{th}}$。（来源：原文第 11 页。）

图 8(a) 与 8(b) 展示 Main 算法在初值 $\eta^{(0)}=0.1,0.5,0.9$ 下时间分配比 $\eta$ 与最小用户速率的收敛性。所有情形下算法在四次迭代内收敛到相同的最终 $\eta$ 与速率，与初始化无关。尽管 $\eta$ 并非单调演化（如图 8(a)），图 8(b) 表明最小速率单调上升。这些结果确认 Main 算法数值稳定，且无需穷举一维搜索即可快速收敛到良好的时间分配比。图 9 展示不同方案下 $\eta$ 随感知与通信功率的变化。随感知功率增大，感知精度改善，故可用更短的感知时长 $T_s$ 满足 CRLB 要求，时间分配比 $\eta$ 相应增大。相反，通信功率 $P_{\max}$ 对 $\eta$ 影响很小，而方案选择则有影响：Main、MRT 与 EI 由于 $\eta$ 优化结构不同而给出不同的 $\eta$ 值。特别地，Main 与 MRT 源于 $\eta$ 优化问题的不同表述，而 EI 通过使 CRLB 约束取等号来选择 $\eta$。

**图 8：** Main 算法的收敛性：(a) 不同初值下的 $\eta$；(b) 相应速率，$P_s^{\max}=40$ dBm、$P_{\max}=30$ dBm。（来源：原文第 11 页。）

**图 9：** 所提算法在 $\mathrm{CRLB}_{\mathrm{th}}=2\times10^{-11}$、两个通信功率水平下优化后的时间分配比 $\eta$ 对感知功率 $P_s^{\max}$。（来源：原文第 11 页。）

## VI. 结论

本文为无蜂窝系统提出了一种时分组近场 ISAC 框架，其中感知与下行通信在考虑由定位误差导致的不完美 CSI 的情况下联合设计。数值结果表明，相对单站与远场基线具有显著的定位增益；而次优方案取得有利的复杂度—性能折中：误差忽略设计在严格感知约束下表现良好，基于 MRT 的设计则对感知要求具有鲁棒性。这些结果确认，近场系统比传统远场架构能更有效地利用感知。特别地，在大规模无蜂窝部署中，多站感知通过显著降低信道不确定性有效缓解信道估计瓶颈，从而为下一代网络使能一种新的位置感知信道估计范式。

未来工作将把该框架扩展到用户移动性与异构边缘环境中的动态资源分配。另一个有前景的方向是超越本文采用的纯感知式信道构造，发展联合利用基于导频与基于感知信息的混合信道估计方案，包括最优融合两种估计以进一步提升信道精度的算法。

## 附录

### A. CRLB 推导

沿用 [31]：由于 $\mathbf u$ 为高斯向量，关于 $\boldsymbol\theta$ 的 Fisher 信息矩阵（FIM）$\mathbf J$ 的第 $(p,q)$ 元为 $[\mathbf J]_{p,q}=\frac{2}{\sigma^2}\Re\left\{\frac{\partial\mathbf u^H}{\partial\theta_p}\frac{\partial\mathbf u}{\partial\theta_q}\right\}$，其中 $\theta_p$ 为参数向量 $\boldsymbol\theta$ 的第 $p$ 元。基于这些观察，FIM 可写成分块矩阵形式

$$
\mathbf J=\frac{2}{\sigma^2}\begin{bmatrix}\mathbf J_{\mathbf p\mathbf p} & \mathbf J_{\mathbf p\boldsymbol\alpha}\\ \mathbf J_{\mathbf p\boldsymbol\alpha}^T & \mathbf J_{\boldsymbol\alpha\boldsymbol\alpha}\end{bmatrix},
$$

其中 $\mathbf J_{\mathbf p\mathbf p}$ 为用户位置的 FIM，$\mathbf J_{\boldsymbol\alpha\boldsymbol\alpha}$ 为增益（含 RCS）的 FIM，$\mathbf J_{\mathbf p\boldsymbol\alpha}$ 为位置与增益参数的耦合 FIM。为记号简洁，省略所有函数依赖。

先分析 $\mathbf J_{\mathbf p\mathbf p}$。由于 $\mathbf p$ 堆叠用户 $x$、$y$ 坐标，$\mathbf J_{\mathbf p\mathbf p}$ 具有如下分块形式：

$$
\mathbf J_{\mathbf p\mathbf p}=\begin{bmatrix}\mathbf J_{\mathbf c^x\mathbf c^x} & \mathbf J_{\mathbf c^x\mathbf c^y}\\ \mathbf J_{\mathbf c^x\mathbf c^y} & \mathbf J_{\mathbf c^y\mathbf c^y}\end{bmatrix}.
$$

由于用户 $k'\ne k$ 的信道独立于用户 $k$ 的位置参数，用户 $k'$ 信道对 $(c^x_k,c^y_k)$ 的偏导数为零。因此对 $q,r\in\{x,y\}$，$\mathbf J_{\mathbf c^q\mathbf c^r}\in\mathbb R^{K\times K}$ 的第 $(k,k')$ 元为

$$
\left[\mathbf J_{\mathbf c^q\mathbf c^r}\right]_{k,k'}=\Re\left\{\mathrm{vec}\left(\frac{\partial\mathbf H_k}{\partial c^q_k}\mathbf S\right)^H\mathrm{vec}\left(\frac{\partial\mathbf H_{k'}}{\partial c^r_{k'}}\mathbf S\right)\right\}
=\Re\left\{\mathrm{Tr}\left(\mathbf S\mathbf S^H\tilde{\mathbf H}^H_{\mathbf c^q_k}\tilde{\mathbf H}_{\mathbf c^r_{k'}}\right)\right\}=\tau\Re\left\{\mathrm{Tr}\left(\boldsymbol\Psi\tilde{\mathbf H}^H_{\mathbf c^q_k}\tilde{\mathbf H}_{\mathbf c^r_{k'}}\right)\right\},
$$

其中 $\tilde{\mathbf H}_{\mathbf c^q_k}=\partial\mathbf H_k/\partial c^q_k$ 为用户 $k$ 信道矩阵对用户 $k$ 的 $q$ 坐标的偏导。上式成立是因为 $\mathrm{vec}(\mathbf A)^H\mathrm{vec}(\mathbf A)=\mathrm{Tr}(\mathbf A^H\mathbf A)$ 且 $\mathrm{Tr}(\mathbf A\mathbf B\mathbf C)=\mathrm{Tr}(\mathbf C\mathbf A\mathbf B)$。此外，$\mathbf H_k\in\mathbb C^{MN_t\times MN_t}$ 被划分为 $M\times M$ 个 $N_t\times N_t$ 块，第 $(i,j)$ 块为 $[\mathbf H_k]_{\langle i,j\rangle}=\alpha_{k,i,j}\mathbf a_{k,i}\mathbf a_{k,j}^H$。该块对 $c^q_k$ 的偏导写为

$$
\left[\frac{\partial\mathbf H_k}{\partial c^q_k}\right]_{\langle i,j\rangle}=\alpha_{i,j}\left(\frac{\partial\mathbf a_{k,i}}{\partial c^q_k}\mathbf a_{k,j}^H+\mathbf a_{k,i}\frac{\partial\mathbf a_{k,j}^H}{\partial c^q_k}\right).
$$

导向矢量的导数为

$$
\frac{\partial\mathbf a_{k,i}}{\partial c^q_k}=\left[\frac{-\mathrm j\frac{2\pi}{\lambda}\left(c^{\mathrm{AP},q}_i-Nd^q_i-c^q_k\right)}{\sqrt{\left(c^{\mathrm{AP},x}_i-Nd^x_i-c^x_k\right)^2+\left(c^{\mathrm{AP},y}_i-Nd^y_i-c^y_k\right)^2}}a_{k,i}(-N),\ \dots,\ \frac{-\mathrm j\frac{2\pi}{\lambda}\left(c^{\mathrm{AP},q}_i+Nd^q_i-c^q_k\right)}{\sqrt{\left(c^{\mathrm{AP},x}_i+Nd^x_i-c^x_k\right)^2+\left(c^{\mathrm{AP},y}_i+Nd^y_i-c^y_k\right)^2}}a_{k,i}(N)\right]^T,
$$

其中 $a_{k,i}(n)$ 表示 $\mathbf a_{k,i}$ 的第 $n+N+1$ 元，定义为 $a_{k,i}(n)=e^{-\mathrm j\frac{2\pi}{\lambda}(r_{k,i}(n)-r_{k,i}(0))}$，$n\in\{-N,\dots,N\}$。

接着分析路径增益相关的 FIM $\mathbf J_{\boldsymbol\alpha\boldsymbol\alpha}$。该矩阵也是分块矩阵，可表示为

$$
\mathbf J_{\boldsymbol\alpha\boldsymbol\alpha}=\begin{bmatrix}\mathbf J_{\boldsymbol\alpha_{\mathrm{re}}\boldsymbol\alpha_{\mathrm{re}}} & \mathbf 0_{KM^2\times KM^2}\\ \mathbf 0_{KM^2\times KM^2} & \mathbf J_{\boldsymbol\alpha_{\mathrm{im}}\boldsymbol\alpha_{\mathrm{im}}}\end{bmatrix},
$$

且 $\mathbf J_{\boldsymbol\alpha_{\mathrm{re}}\boldsymbol\alpha_{\mathrm{re}}}$ 与 $\mathbf J_{\boldsymbol\alpha_{\mathrm{im}}\boldsymbol\alpha_{\mathrm{im}}}\in\mathbb R^{KM^2\times KM^2}$ 写为

$$
\mathbf J_{\boldsymbol\alpha_{\mathrm{re}}\boldsymbol\alpha_{\mathrm{re}}}=\mathbf J_{\boldsymbol\alpha_{\mathrm{im}}\boldsymbol\alpha_{\mathrm{im}}}=\begin{bmatrix}\mathbf J_{\boldsymbol\alpha_1\boldsymbol\alpha_1} & \mathbf J_{\boldsymbol\alpha_1\boldsymbol\alpha_2} & \cdots & \mathbf J_{\boldsymbol\alpha_1\boldsymbol\alpha_K}\\ \mathbf J_{\boldsymbol\alpha_2\boldsymbol\alpha_1} & \mathbf J_{\boldsymbol\alpha_2\boldsymbol\alpha_2} & \cdots & \mathbf J_{\boldsymbol\alpha_2\boldsymbol\alpha_K}\\ \vdots & \vdots & \ddots & \vdots\\ \mathbf J_{\boldsymbol\alpha_K\boldsymbol\alpha_1} & \mathbf J_{\boldsymbol\alpha_K\boldsymbol\alpha_2} & \cdots & \mathbf J_{\boldsymbol\alpha_K\boldsymbol\alpha_K}\end{bmatrix},
$$

其中块矩阵 $\mathbf J_{\boldsymbol\alpha_k\boldsymbol\alpha_{k'}}\in\mathbb R^{M^2\times M^2}$ 可写为

$$
\begin{bmatrix}J_{\alpha_{k,1,1}\alpha_{k',1,1}} & J_{\alpha_{k,1,1}\alpha_{k',1,2}} & \cdots & J_{\alpha_{k,1,1}\alpha_{k',M,M}}\\ J_{\alpha_{k,1,2}\alpha_{k',1,1}} & J_{\alpha_{k,1,2}\alpha_{k',1,2}} & \cdots & J_{\alpha_{k,1,2}\alpha_{k',M,M}}\\ \vdots & \vdots & \ddots & \vdots\\ J_{\alpha_{k,M,M}\alpha_{k',1,1}} & J_{\alpha_{k,M,M}\alpha_{k',1,2}} & \cdots & J_{\alpha_{k,M,M}\alpha_{k',M,M}}\end{bmatrix}.\tag{28}
$$

由于随机 RCS 使 $\alpha_{k,i,j}$ 跨不同 AP 与用户独立，每个元素定义为

$$
J_{\alpha_{k,i,j}\alpha_{k',l,m}}=\tau\Re\left\{\mathrm{Tr}\left(\boldsymbol\Psi\left(\mathbf D_{i,j}\odot\bar{\mathbf H}_k\right)^H\left(\mathbf D_{l,m}\odot\bar{\mathbf H}_{k'}\right)\right)\right\},
$$

其中 $\odot$ 为 Hadamard 积，$\mathbf D_{i,j}=\mathbf E_{i,j}\otimes\mathbf 1_{N\times N}$ 为分块掩码矩阵，$\mathbf E_{i,j}\in\mathbb R^{M\times M}$ 为第 $(i,j)$ 位置为 1、其余为 0 的选择矩阵，$\bar{\mathbf H}_k$ 为归一化信道矩阵。这里 $\bar{\mathbf H}_k$ 是 $M\times M$ 分块矩阵，第 $(i,j)$ 子块定义为 $[\bar{\mathbf H}_k]_{\langle i,j\rangle}=\mathbf a_{k,i}\mathbf a_{k,j}^H$。由于 $m\ne m'$ 时 $\mathbb E[\mathbf s_m\mathbf s_{m'}^H]=\mathbf 0_{N_t\times N_t}$，$\boldsymbol\Psi$ 为 $M\times M$ 分块对角矩阵。于是可利用分块对角矩阵的迹性质：若 $\mathbf A$ 为分块对角矩阵、$\mathbf B$ 为与 $\mathbf A$ 块维数相同的分块矩阵，则 $\mathrm{Tr}(\mathbf A\mathbf B)=\sum_i\mathrm{Tr}([\mathbf A]_{\langle i,i\rangle}\mathbf B_{\langle i,i\rangle})$。因此

$$
\mathrm{Tr}\left(\boldsymbol\Psi\left(\mathbf D_{i,j}\odot\bar{\mathbf H}_k\right)^H\left(\mathbf D_{l,m}\odot\bar{\mathbf H}_{k'}\right)\right)=\sum_r\mathrm{Tr}\left([\boldsymbol\Psi]_{\langle r,r\rangle}\left[\left(\mathbf D_{i,j}\odot\bar{\mathbf H}_k\right)^H\left(\mathbf D_{l,m}\odot\bar{\mathbf H}_{k'}\right)\right]_{\langle r,r\rangle}\right).
$$

矩阵 $(\mathbf D_{i,j}\odot\bar{\mathbf H}_k)^H(\mathbf D_{l,m}\odot\bar{\mathbf H}_{k'})$ 的对角元仅在掩码指标满足 $i=l$ 且 $j=m$ 时非零，此时非零元出现在第 $(j,j)$ 位置。因此 $\mathbf J_{\boldsymbol\alpha_k\boldsymbol\alpha_{k'}}$ 成为对角矩阵（仅当 $i=l$、$j=m$ 时非零）。于是（28）可重写为

$$
\mathbf J_{\boldsymbol\alpha_k\boldsymbol\alpha_{k'}}=\mathrm{diag}\left(J_{\alpha_{k,1,1}\alpha_{k',1,1}},J_{\alpha_{k,1,2}\alpha_{k',1,2}},\dots,J_{\alpha_{k,M,M}\alpha_{k',M,M}}\right),
$$

其中每个对角元为 $J_{\alpha_{k,i,j}\alpha_{k',i,j}}=\Re\{\mathrm{Tr}(\boldsymbol\Psi_j([\bar{\mathbf H}_k]^H_{\langle i,j\rangle}[\bar{\mathbf H}_{k'}]_{\langle i,j\rangle}))\}$。

最后，$\mathbf J_{\mathbf p\boldsymbol\alpha}$ 可写为

$$
\mathbf J_{\mathbf p\boldsymbol\alpha}=\Re\left\{\begin{bmatrix}\mathbf J_{\mathbf c^x\boldsymbol\alpha_{\mathrm{re}}} & \mathbf J_{\mathbf c^x\boldsymbol\alpha_{\mathrm{im}}}\\ \mathbf J_{\mathbf c^y\boldsymbol\alpha_{\mathrm{re}}} & \mathbf J_{\mathbf c^y\boldsymbol\alpha_{\mathrm{im}}}\end{bmatrix}\right\}.
$$

矩阵 $\mathbf J_{\mathbf c^q\boldsymbol\alpha_{\mathrm{re}}}$、$\mathbf J_{\mathbf c^q\boldsymbol\alpha_{\mathrm{im}}}\in\mathbb R^{K\times KM^2}$ 收集用户 $q\in\{x,y\}$ 坐标与实/虚信道系数之间的交叉信息项，可写为

$$
\mathbf J_{\mathbf c^q\boldsymbol\alpha_{\mathrm{re}}}=\mathrm j\mathbf J_{\mathbf c^q\boldsymbol\alpha_{\mathrm{im}}}=\begin{bmatrix}J_{c^q_1\alpha_{1,1,1}} & J_{c^q_1\alpha_{1,1,2}} & \cdots & J_{c^q_1\alpha_{K,M,M}}\\ J_{c^q_2\alpha_{1,1,1}} & J_{c^q_2\alpha_{1,1,2}} & \cdots & J_{c^q_2\alpha_{K,M,M}}\\ \vdots & \vdots & \ddots & \vdots\\ J_{c^q_K\alpha_{1,1,1}} & J_{c^q_K\alpha_{1,1,2}} & \cdots & J_{c^q_K\alpha_{K,M,M}}\end{bmatrix},
$$

其中

$$
J_{c^q_k\alpha_{k',i,j}}=\tau\mathrm{Tr}\left(\boldsymbol\Psi\tilde{\mathbf H}^H_{\mathbf c^q_k}\left(\mathbf D_{i,j}\odot\bar{\mathbf H}_{k'}\right)\right)=\tau\mathrm{Tr}\left(\boldsymbol\Psi_j\alpha^*_{i,j}\left(\frac{\partial\mathbf a_{k,i}}{\partial c^q_k}\mathbf a_{k,j}^H+\mathbf a_{k,i}\frac{\partial\mathbf a_{k,j}^H}{\partial c^q_k}\right)^H\mathbf a_{k',i}\mathbf a_{k',j}^H\right),
$$

该式成立是因为 $\tilde{\mathbf H}^H_{\mathbf c^q_k}$ 的第 $(j,i)$ 子块与 $(\mathbf D_{i,j}\odot\bar{\mathbf H}_{k'})$ 的第 $(i,j)$ 子块共同贡献第 $(j,j)$ 对角块。根据 [31]，CRLB 表达式可写为

$$
\mathrm{CRLB}=\mathrm{Tr}\left(\left(\mathbf J_{\mathbf p\mathbf p}-\mathbf J_{\mathbf p\boldsymbol\alpha}^T\mathbf J_{\boldsymbol\alpha\boldsymbol\alpha}^{-1}\mathbf J_{\mathbf p\boldsymbol\alpha}\right)^{-1}\right)=\frac{\sigma^2}{2\tau}\mathrm{Tr}\left(\left(\bar{\mathbf J}_{\mathbf p\mathbf p}-\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}^T\bar{\mathbf J}_{\boldsymbol\alpha\boldsymbol\alpha}^{-1}\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}\right)^{-1}\right)=\frac{\tau_s\sigma^2}{2(1-\eta)T}\mathrm{Tr}\left(\left(\bar{\mathbf J}_{\mathbf p\mathbf p}-\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}^T\bar{\mathbf J}_{\boldsymbol\alpha\boldsymbol\alpha}^{-1}\bar{\mathbf J}_{\mathbf p\boldsymbol\alpha}\right)^{-1}\right),
$$

其中 $\bar{\mathbf J}_{ij}=(\sigma^2/2\tau)\mathbf J_{ij}$，$i,j\in\{\mathbf p,\boldsymbol\alpha\}$。

### B. MUSIC 算法

MUSIC 是一种著名定位算法，利用信号子空间与噪声子空间的正交性 [33]。MUSIC 算法的详细流程如下。首先，CPU 计算接收信号向量 $\mathbf y^{\mathrm{AP}}[t]$ 的样本协方差矩阵 $\bar{\boldsymbol\Psi}$：

$$
\bar{\boldsymbol\Psi}=\frac1\tau\mathbf Y^{\mathrm{AP}}\left(\mathbf Y^{\mathrm{AP}}\right)^H=\mathbf U_s\boldsymbol\Lambda_s\mathbf U_s^H+\mathbf U_n\boldsymbol\Lambda_n\mathbf U_n^H,
$$

其中 $\mathbf U_s$ 与 $\mathbf U_n$ 分别表示信号与噪声子空间矩阵，$\boldsymbol\Lambda_s$ 与 $\boldsymbol\Lambda_n$ 为包含信号与噪声特征值的对角矩阵。给定 $K$ 个感知用户，感知回波协方差矩阵 $\bar{\boldsymbol\Psi}$ 的信号子空间由其 $K$ 个最大特征值对应的特征向量张成。由于 $\bar{\boldsymbol\Psi}$ 由所有 AP 的聚合感知回波构造，其信号子空间与所有用户复合导向矢量生成的子空间重合。因此 $\mathbf U_s$ 的每一列 $\mathbf v_k$ 表示用户 $k$ 的导向矢量，可写为

$$
\mathbf v_k=\left[\mathbf a_{k,1}^T\left(r^x_{k,1},r^y_{k,1}\right),\dots,\mathbf a_{k,M}^T\left(r^x_{k,M},r^y_{k,M}\right)\right]^T.
$$

相应地，定义复合导向矢量 $\tilde{\mathbf v}(c^x,c^y)\in\mathbb C^{MN_t\times1}$ 为

$$
\tilde{\mathbf v}(c^x,c^y)=\left[\mathbf a_1^T(c^x,c^y),\dots,\mathbf a_M^T(c^x,c^y)\right]^T,
$$

其中 $\mathbf a_m(c^x,c^y)$ 的第 $(n+N+1)$ 元为 $[\mathbf a_m(c^x,c^y)]_{n+N+1}=e^{-\mathrm j\frac{2\pi}{\lambda}(r_m(n)(c^x,c^y)-r_m(0)(c^x,c^y))}$，这里

$$
r_m(n)=\sqrt{\left(c^x-\left(c^{\mathrm{AP},x}_m+nd^x_m\right)\right)^2+\left(c^y-\left(c^{\mathrm{AP},y}_m+nd^y_m\right)\right)^2},\quad n\in\{-N,\dots,N\}.
$$

当评估点与实际用户位置重合，即 $c^x=c^x_k$、$c^y=c^y_k$ 时，由于信号子空间与噪声子空间正交，如下正交条件成立：

$$
\tilde{\mathbf v}^H(c^x,c^y)\mathbf U_n\mathbf U_n^H\tilde{\mathbf v}(c^x,c^y)=0.
$$

因此，所有 $K$ 个用户的位置估计为 MUSIC 伪谱的 $K$ 个主导峰值：

$$
P_{\mathrm{MUSIC}}(c^x,c^y)=\frac{1}{\tilde{\mathbf v}^H(c^x,c^y)\mathbf U_n\mathbf U_n^H\tilde{\mathbf v}(c^x,c^y)},
$$

其中估计位置 $(\hat c^x_k,\hat c^y_k)$ 对应 $P_{\mathrm{MUSIC}}(c^x,c^y)$ 的 $K$ 个最大峰值。

## 图注与表注

**图 1（原文第 2 页）：** 时分组无蜂窝近场 ISAC 系统：多个 AP 与多用户、感知阶段与通信阶段的时间划分。
**图 2（原文第 3 页）：** AP $m$ 的天线配置（ULA，单元间距 $d$、孔径 $D=(N_t-1)d$）。
**图 3（原文第 5 页）：** 信道估计误差对用户定位误差：(a) 三种用户位置、固定 $N_t=20$；(b) 固定用户位置、$N_t$ 取 20/40/60。（来源：原文第 5 页。）
**图 4（原文第 10 页）：** $\sqrt{\mathrm{CRLB}}$ 对 $P_s^{\max}$，不同 AP 数（$M=1,2,3$）；横轴 $P_s^{\max}$ 25—40 dBm，纵轴对数刻度。
**图 5（原文第 11 页）：** $P_s^{\max}=40$ dBm 时近场与远场场景的归一化 MUSIC 谱比较（(a)—(d) 四个面板）。
**图 6（原文第 11 页）：** 两个感知功率水平下所提算法的最差用户速率对通信功率，$\mathrm{CRLB}_{\mathrm{th}}=1\times10^{-11}$。
**图 7（原文第 11 页）：** 所提算法在 $P_{\max}=30$ dBm、两个感知功率水平下的最差用户速率对 $\mathrm{CRLB}_{\mathrm{th}}$。
**图 8（原文第 11 页）：** Main 算法收敛性：(a) 不同初值下的 $\eta$；(b) 相应速率（$P_s^{\max}=40$ dBm、$P_{\max}=30$ dBm）。
**图 9（原文第 11 页）：** 所提算法在 $\mathrm{CRLB}_{\mathrm{th}}=2\times10^{-11}$、两个通信功率水平下优化后的 $\eta$ 对 $P_s^{\max}$。

**表注：** 原文全文无编号表格（仅图 1—9 与算法 1—4），故本页无需转录表格。

## 参考文献（英文原书目）

[1] A. Liu et al., "A survey on fundamental limits of integrated sensing and communication," IEEE Communications Surveys & Tutorials, vol. 24, no. 2, pp. 994–1034, 2022.
[2] Z. Wei et al., "Integrated sensing and communication signals toward 5G-A and 6G: A survey," IEEE Internet of Things Journal, vol. 10, no. 13, pp. 11 068–11 092, 2023.
[3] J. A. Zhang et al., "An overview of signal processing techniques for joint communication and radar sensing," IEEE Journal of Selected Topics in Signal Processing, vol. 15, no. 6, pp. 1295–1315, 2021.
[4] Z. He, W. Xu, H. Shen, D. W. K. Ng, Y. C. Eldar, and X. You, "Full-duplex communication for ISAC: Joint beamforming and power optimization," IEEE Journal on Selected Areas in Communications, vol. 41, no. 9, pp. 2920–2936, 2023.
[5] H. Li, Z. Wang, X. Mu, Y. Liu, Y. Chen, and P. Zhiwen, "Downlink CRB minimization for near-field integrated sensing and communication," in ICC 2024-IEEE International Conference on Communications. IEEE, 2024, pp. 903–908.
[6] H. Gazzah and J. P. Delmas, "CRB-based design of linear antenna arrays for near-field source localization," IEEE Transactions on Antennas and Propagation, vol. 62, no. 4, pp. 1965–1974, 2014.
[7] P. Sun, H. Zhang, F. Guidi, D. Dardari, B. Wang, and Y. C. Eldar, "Beamfocusing for near-field ISAC systems," in 2024 IEEE 25th International Workshop on Signal Processing Advances in Wireless Communications (SPAWC). IEEE, 2024, pp. 241–245.
[8] Z. Wang, X. Mu, and Y. Liu, "Near-field integrated sensing and communications," IEEE Communications Letters, vol. 27, no. 8, pp. 2048–2052, 2023.
[9] D. Galappaththige, S. Zargari, C. Tellambura, and G. Y. Li, "Near-field ISAC: Beamforming for multi-target detection," IEEE Wireless Communications Letters, 2024.
[10] Z. Wang, X. Mu, and Y. Liu, "Near-field velocity sensing and predictive beamforming," IEEE Transactions on Vehicular Technology, 2024.
[11] U. Demirhan and A. Alkhateeb, "Cell-free ISAC MIMO systems: Joint sensing and communication beamforming," IEEE Transactions on Communications, 2024.
[12] S. Rivetti, E. Björnson, and M. Skoglund, "Secure spatial signal design for ISAC in a cell-free MIMO network," in 2024 IEEE Wireless Communications and Networking Conference (WCNC). IEEE, 2024, pp. 01–06.
[13] Z. Behdad, Ö. T. Demir, K. W. Sung, E. Björnson, and C. Cavdar, "Multi-static target detection and power allocation for integrated sensing and communication in cell-free massive MIMO," IEEE Transactions on Wireless Communications, vol. 23, no. 9, pp. 11 580–11 596, 2024.
[14] J. Chen, Q. Chen, J. Jia, B. Yin, and X. Wang, "Passive sensing in a near-field multi-ISAC system with imperfect CSI," IEEE Transactions on Cognitive Communications and Networking, pp. 1–1, 2025.
[15] Q. Zhang, H. Sun, X. Gao, X. Wang, and Z. Feng, "Time-division ISAC enabled connected automated vehicles cooperation algorithm design and performance evaluation," IEEE Journal on Selected Areas in Communications, vol. 40, no. 7, pp. 2206–2218, 2022.
[16] Y. Zhou, X. Liu, X. Zhai, Q. Zhu, and T. S. Durrani, "UAV-enabled integrated sensing, computing, and communication for internet of things: Joint resource allocation and trajectory design," IEEE Internet of Things Journal, vol. 11, no. 7, pp. 12 717–12 727, 2023.
[17] D. Xu, A. Khalili, X. Yu, D. W. K. Ng, and R. Schober, "Integrated sensing and communication in distributed antenna networks," in 2023 IEEE International Conference on Communications Workshops (ICC Workshops). IEEE, 2023, pp. 1457–1462.
[18] X. Liu, Y. Liu, Z. Liu, and T. S. Durrani, "Fair integrated sensing and communication for multi-UAV-enabled internet of things: Joint 3-D trajectory and resource optimization," IEEE Internet of Things Journal, vol. 11, no. 18, pp. 29 546–29 556, 2024.
[19] M. Razaviyayn, M. Hong, and Z.-Q. Luo, "A unified convergence analysis of block successive minimization methods for nonsmooth optimization," SIAM Journal on Optimization, vol. 23, no. 2, pp. 1126–1153, 2013.
[20] S. P. Boyd and L. Vandenberghe, Convex optimization. Cambridge University Press, 2004.
[21] H. Q. Ngo, A. Ashikhmin, H. Yang, E. G. Larsson, and T. L. Marzetta, "Cell-free massive MIMO versus small cells," IEEE Transactions on Wireless Communications, vol. 16, no. 3, pp. 1834–1850, 2017.
[22] H. V. Nguyen et al., "On the spectral and energy efficiencies of full-duplex cell-free massive MIMO," IEEE Journal on Selected Areas in Communications, vol. 38, no. 8, pp. 1698–1718, 2020.
[23] J. Zhang, S. Yan, and M. Peng, "Joint beam alignment and resource allocation for multi-user mmWave integrated sensing and communication systems," IEEE Transactions on Vehicular Technology, vol. 73, no. 4, pp. 5288–5303, 2023.
[24] L. Wang and L. F. Abanto-Leon, "Resource allocation for ISAC networks with application to target tracking," arXiv preprint arXiv:2412.20314, 2024.
[25] A. Sabharwal, P. Schniter, D. Guo, D. W. Bliss, S. Rangarajan, and R. Wichman, "In-band full-duplex wireless: Challenges and opportunities," IEEE Journal on Selected Areas in Communications, vol. 32, no. 9, pp. 1637–1652, 2014.
[26] Y. Liu, Z. Wang, J. Xu, C. Ouyang, X. Mu, and R. Schober, "Near-field communications: A tutorial review," IEEE Open Journal of the Communications Society, vol. 4, pp. 1999–2049, 2023.
[27] H. Wang, Z. Xiao, and Y. Zeng, "Cramér-Rao bounds for near-field sensing with extremely large-scale MIMO," IEEE Transactions on Signal Processing, vol. 72, pp. 701–717, 2024.
[28] D. Tse and P. Viswanath, Fundamentals of Wireless Communication. Cambridge University Press, 2005.
[29] Y. Liu, J. Xu, Z. Wang, X. Mu, and L. Hanzo, "Near-field communications: What will be different?" IEEE Wireless Communications, vol. 32, no. 2, pp. 262–270, 2025.
[30] S. Liu, M. Li, R. Liu, W. Wang, and Q. Liu, "Joint transmit beamforming and receive filter design for cooperative multi-static ISAC networks," IEEE Wireless Communications Letters, vol. 13, no. 6, pp. 1700–1704, 2024.
[31] S. M. Kay, Fundamentals of Statistical Signal Processing: Estimation Theory. Prentice-Hall, Inc., 1993.
[32] I. Bekkerman and J. Tabrikian, "Target detection and localization using MIMO radars and sonars," IEEE Transactions on Signal Processing, vol. 54, no. 10, pp. 3873–3883, 2006.
[33] R. Schmidt, "Multiple emitter location and signal parameter estimation," IEEE Transactions on Antennas and Propagation, vol. 34, no. 3, pp. 276–280, 1986.
[34] Z. Xiang and M. Tao, "Robust beamforming for wireless information and power transmission," IEEE Wireless Communications Letters, vol. 1, no. 4, pp. 372–375, 2012.
[35] T. Iwasaki, G. Meinsma, and M. Fu, "Generalized S-procedure and finite frequency KYP lemma," Mathematical Problems in Engineering, vol. 6, no. 2-3, pp. 305–320, 2000.
[36] Z. Wang, X. Mu, and Y. Liu, "STARS enabled integrated sensing and communications," IEEE Transactions on Wireless Communications, vol. 22, no. 10, pp. 6750–6765, 2023.
[37] M. Grant and S. Boyd, "CVX: Matlab software for disciplined convex programming, version 2.1," Mar. 2014, accessed: Jan. 15, 2026. [Online]. Available: https://cvxr.com/cvx
[38] Q. Shi, M. Razaviyayn, M. Hong, and Z.-Q. Luo, "SINR constrained beamforming for a MIMO multi-user downlink system: Algorithms and convergence analysis," IEEE Transactions on Signal Processing, vol. 64, no. 11, pp. 2920–2933, 2016.

**本页范围与校对状态：** 本页覆盖 arXiv:2601.12725v1（eess.SP，2026 年 1 月 19 日）全文 14 页：摘要、第 I—VI 节、附录 A（CRLB 推导，含式（28）与未编号公式）、附录 B（MUSIC 算法）、图 1—9 图注、算法 1—4、式（1）—（22）、参考文献 [1]—[38]（英文原条目）。原文为 IEEE 期刊投稿格式（"submitted to the IEEE for possible publication"），全文**无编号表格**（仅图 1—9），故本页无表格可转录。已用 `render.py` 渲染 PDF 第 1、10 页核对作者/标题、算法 4 与图 4 的版式。已按页首译注列出原文疑点：算法 2/4 第 11 行在判定 $\eta^{\mathrm{opt}}=\bar\eta$ 后仍传 $\eta^{(l-1)}$ 调用 Bi-RBO/Bi-RPO-MRT，疑应为 $\eta^{\mathrm{opt}}$（按原文照录并加注）。数值设置（$K=4$、$M=3$、$N_t=21$、$f_c=28$ GHz、$D=0.53$ m、$2D^2/\lambda\approx53$ m、$\sigma^2=-70$ dBm、$70\times70$ m、$T=100$ ms、$\tau_s=1$ ms、$\alpha_e=373$ 等）均按原文照录。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、数值独立复算均未做）；图内曲线未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2601.12725v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
