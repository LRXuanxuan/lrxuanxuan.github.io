---
layout: page
title: "目标角度不确定下大规模 MIMO ISAC：CRLB 中断分析与鲁棒资源分配｜中文全文译文"
permalink: /papers/translations/2026-09-29-2609-18467-massive-mimo-isac-under-target-angle-uncertainty-crlb-outage-analysis/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/1befed8a0e0a9866/) · [原文 arXiv](https://arxiv.org/abs/2609.18467) · [全部目录](/papers/catalog/)

# 目标角度不确定下大规模 MIMO ISAC：CRLB 中断分析与鲁棒资源分配

**原题：** Massive MIMO ISAC Under Target-Angle Uncertainty: CRLB Outage Analysis and Robust Resource Allocation  
**作者：** Smriti Uniyal（IEEE 研究生会员）、Tianyu Fang（IEEE 研究生会员）、Van-Dinh Nguyen（IEEE 高级会员）、Hien Quoc Ngo（IEEE Fellow）、Markku Juntti（IEEE Fellow）、Nhan Thanh Nguyen（IEEE 高级会员）。原文该 arXiv 版本未在正文给出作者单位与邮箱，故本页不标注单位。  
**版本：** arXiv:2609.18467v1（eess.SP），2026 年 9 月 16 日；原文 14 页。本页对应论文库 2026-09-29 条目。  
**范围与状态：** 全文中文译稿：摘要、第 I—VI 节、图 1—7 图注、算法 1、定理 1—3 与推论 1—3、附录 A—D 全部证明、参考文献 [1]—[38]（英文原条目）。原文为 arXiv 预印本，全文无编号表格；逐句逐式终校未做，不标记为已验收全文。

> **译注：** 原文缩写在本页首次出现时保留英文：ISAC（integrated sensing and communications，通感一体化）、mMIMO（massive multiple-input multiple-output，大规模 MIMO）、UPA（uniform planar array，均匀平面阵列）、CRLB（Cramér–Rao lower bound，克拉美–罗下界）、FIM（Fisher information matrix，Fisher 信息矩阵）、MRT（maximum-ratio transmission，最大比传输）、ZF（zero-forcing，迫零）、CDF（cumulative distribution function，累积分布函数）、SCA（successive convex approximation，连续凸近似）、AO（alternating optimization，交替优化）、MMSE（minimum mean square error，最小均方误差）、AWGN（additive white Gaussian noise，加性高斯白噪声）、TDD（time-division duplex，时分双工）。

## 摘要

在通感一体化（ISAC）中，同一套频谱与硬件资源被两种功能共享。大多数 ISAC 设计假设目标角度信息完美，忽略了角度估计误差——这类误差会引入导向矢量失配、降低感知精度，并可能使确定性的感知保证失效。本文研究目标角度估计不完美下的单站大规模多输入多输出（MIMO）ISAC 系统。我们推导了存在角度不确定性时目标方位角与俯仰角估计的 Cramér–Rao 下界（CRLB）闭式表达式；在高斯、广义均匀与 von Mises 三类角度误差模型下，刻画了 CRLB 的累积分布函数与中断概率。分析表明：在小误差区间，由于发射导向矢量失配，CRLB 随角度误差呈二次增长。为保证可靠感知，我们提出一种鲁棒功率分配框架，联合优化导频训练功率与通信/感知传输功率，以在满足 CRLB 中断约束的同时最大化通信和速率。所得非凸问题通过基于连续凸近似的交替优化算法求解。数值结果验证了所推导的分析，并表明：与传统的非鲁棒方案相比，所提鲁棒设计将方位角与俯仰角 CRLB 中断概率最多降低 60%；在严格的 CRLB 阈值下，其和速率比非鲁棒设计最多提高 45%。

**关键词：** CRLB 中断概率；通感一体化；大规模 MIMO；鲁棒资源分配；感知可靠性；目标角度不确定性。

## I. 引言

通感一体化（ISAC）是未来无线系统的关键技术，它利用共享的频谱与硬件资源同时实现通信与感知 [1]。配备大型天线阵列的大规模 MIMO（mMIMO）系统由于具有高空间分辨率与波束赋形增益，对 ISAC 特别有吸引力，这些增益同时有利于通信与目标感知 [2]、[3]。特别地，离开角、到达角等角度信息在感知、定位与测向系统中起基础性作用，并已被纳入 3GPP NR 等标准化框架 [4]。因此，在 mMIMO-ISAC 系统中，准确的角度信息对波束赋形设计与感知性能评估至关重要。

现有大多数 ISAC 设计假设基站（BS）处的目标角度信息完美。然而在实践中，目标角度由含噪雷达观测估计得到，并受阵列校准误差、同步损伤与模型失配影响 [5]–[7]。这些不完美会在假定目标方向与真实目标方向之间引入导向矢量失配，从而显著降低感知精度并使 CRLB [4]、[8] 等性能指标失真。由于 ISAC 系统要在通信与感知任务之间联合分配资源，这种感知退化也会影响通信—感知折中。这促使我们研究在 mMIMO-ISAC 系统中显式考虑目标角度不确定性的鲁棒资源分配策略。

### A. 相关工作

ISAC 系统的设计与优化近年来受到大量研究关注。一种常见做法分别以可达速率与 CRLB 刻画通信与感知性能 [9]–[13]；基于这些指标，人们发展了多种通信—感知折中分析与资源分配框架。例如，Gan 等人 [14] 提出随机几何框架以刻画感知覆盖与通信性能；Soltani 等人 [15] 通过 CRLB 中断概率与遍历 CRLB 研究感知可靠性。随后，CRLB 约束下的波束赋形与资源分配问题分别借助半定松弛 [1]、交替优化 [16]、连续凸近似（SCA）[17] 与流形优化 [18] 加以解决。

最近，ISAC 与 mMIMO 架构相结合，大型天线阵列同时提供高感知分辨率与可观的通信波束赋形增益 [2]、[3]、[19]–[21]。已有研究考察了功率分配 [2]、[3]、[19]、多目标感知 [20] 以及协作式 mMIMO-ISAC 部署 [21]。特别地，[3] 推导的可达速率与感知 CRLB 闭式表达式，使感知约束下的高效通信—感知资源分配设计成为可能。

上述工作一般假设 BS 处的目标角度信息完美。但在实践中，目标角度估计受位置不确定性 [22]、导向矢量误差 [5]、硬件损伤 [23]、校准误差 [24] 与波束图失配 [4]、[8] 影响。这些不完美造成假定目标方向与真实方向之间的失配，从而降低感知与波束赋形性能。在雷达系统中，相位同步与建模误差的影响已通过 CRLB 分析加以量化 [6]、[7]，而导向矢量失配已被证明会导致雷达性能的显著退化 [8]。对 ISAC 系统，已有研究在角度与信道信息不完美条件下，采用最坏情况与中断约束形式提出鲁棒波束赋形设计 [25]、[26]。最近，Chen 等人 [4] 研究了波束图失配造成的角度估计退化，并提出校准框架以缓解由此产生的误差。

尽管已有上述进展，目标角度不确定性对 mMIMO-ISAC 系统感知性能与资源分配的影响仍基本未被探索。特别是，随机角度误差下感知 CRLB 的退化及其中断行为尚未被刻画。这限制了鲁棒通信—感知资源分配策略的发展，也构成本文的动机。

### B. 动机与贡献

现有大多数基于 CRLB 的 ISAC 框架假设目标角度信息完美，并用确定性 CRLB 约束优化通信—感知资源 [1]、[10]、[12]、[15]、[16]。然而实践中，目标角度由含噪雷达观测估计，不可避免地存在估计误差。此类不确定性引入导向矢量失配，使感知 CRLB 成为随机量而非确定性性能指标。因此，即使满足预设的 CRLB 要求，传统 CRLB 约束设计也可能无法提供可靠的感知保证。在采用均匀平面阵列（UPA）的实用 mMIMO 系统 [2]、[3]、[13] 中，感知性能同时取决于方位角与俯仰角，这一挑战尤为突出。上述观察表明：感知可靠性应由 CRLB 的统计行为与中断概率来刻画，资源分配策略也应显式考虑目标角度不确定性。

受上述考虑驱动，我们研究 UPA 配备的 BS 在目标角度不确定性下的单站下行 mMIMO-ISAC 系统。我们首先刻画方位角与俯仰角的 CRLB 及其中断概率；在此基础上，提出一种在满足概率感知可靠性约束的同时最大化通信速率的鲁棒功率分配框架。利用 mMIMO 系统的信道硬化特性，所提设计仅依赖大尺度衰落系数，因而具有实用可实施性。本文主要贡献总结如下：

- 我们推导了 UPA 配备的 mMIMO-ISAC 系统在目标角度不确定性下，目标方位角与俯仰角感知 CRLB 的闭式表达式。所提表达式显式包含角度误差，适用于最大比传输（MRT）与迫零（ZF）预编码，且仅依赖大尺度衰落系数。
- 我们刻画了目标角度不确定性下感知 CRLB 的统计行为。特别地，对高斯、广义均匀与 von Mises 三类角度误差模型，推导了 CRLB 分布与中断概率的闭式近似，为 mMIMO-ISAC 系统的感知可靠性分析提供了统一框架。
- 我们给出目标角度误差对感知性能影响的基本洞见：在小误差区间，由于导向矢量失配，CRLB 随角度误差呈二次增长；而当发射或接收天线数量增大时，CRLB 中断概率趋于零。
- 我们建立了一个鲁棒功率分配问题：在感知中断约束与总功率约束下，联合优化导频训练功率与通信/感知传输功率以最大化通信和速率。所得非凸问题用交替优化（AO）-SCA 算法求解。
- 大量仿真验证了所推导的分析，并表明所提设计的有效性。特别地，在严重目标角度不确定性下，所提鲁棒方案相比传统非鲁棒设计将方位角与俯仰角 CRLB 中断概率最多降低 60%；在严格的 CRLB 阈值与较宽松的中断阈值下，其和速率比非鲁棒设计最多提高 45%。

值得注意的是，密切相关的文献 [3]、[27] 给出的是完美目标角度信息下的 CRLB 闭式表达式；相比之下，本文给出目标角度不确定性下的 CRLB 闭式表达式，并在小误差区间获得相应近似，还给出不同角度误差分布下 CRLB 中断概率的统一表达式。与 [3]、[27] 不同，我们设计了鲁棒功率分配方案以联合优化导频功率与信号传输/探测功率。因此，[3]、[27] 中关于 CRLB 与优化框架的现有结果不能直接用于本文设计。

### C. 论文结构与符号

本文其余部分组织如下：第 II 节介绍 ISAC 信号模型与发射预编码器；第 III 节给出 ISAC 性能指标的闭式表达式；第 IV 节详述所提鲁棒功率分配方法；第 V 节给出仿真结果；第 VI 节总结全文。

**符号：** 向量与矩阵分别用小写与大写粗体字母表示。$\mathbb E\{\cdot\}$ 表示期望算子，$\mathrm{tr}(\cdot)$ 与 $\mathrm{vec}(\cdot)$ 分别表示迹与向量化算子；$(\cdot)^*$、$(\cdot)^T$、$(\cdot)^H$ 分别表示共轭、转置与共轭转置。记号 $\dot y_x$ 表示 $y$ 关于 $x$ 的偏导数，即 $\dot y_x\triangleq\partial y/\partial x$；$\odot$ 与 $\otimes$ 分别表示 Hadamard 积与 Kronecker 积。$|\cdot|$ 与 $\|\cdot\|$ 分别表示复模与欧几里得范数，$\mathcal{CN}(0,\sigma^2)$ 表示零均值、方差为 $\sigma^2$ 的复高斯分布。

## II. 信号模型

如图 1 所示，考虑由 BS、$K$ 个单天线通信用户与一个感知目标组成的单站下行 mMIMO-ISAC 系统。BS 配备由 $N_t$ 根发射天线与 $N_r$ 根接收天线构成的大型均匀平面阵列（UPA），通过共享发射波形同时支持下行通信与目标感知；目标反射的信号由 $N_r$ 根接收天线接收以进行感知处理。

### A. 通信模型

**1）上行导频训练：** 考虑时分双工（TDD）协议：在每个相干区间内，先进行上行导频训练以进行信道估计，随后进行下行通信与感知传输。令 $\tau_c$ 与 $\tau_p$ 分别表示相干区间长度与导频序列长度，且 $\tau_p<\tau_c$。在上行训练阶段，全部 $K$ 个用户同时向 BS 发送导频信号。具体地，用户 $k$ 发送导频序列 $\sqrt{\tau_p\vartheta_k}\mathbf p_k\in\mathbb C^{\tau_p\times1}$，其中 $\|\mathbf p_k\|^2=1$，$\vartheta_k$ 表示其导频发射功率。因此总导频训练功率为

$$
P_p(\vartheta)=\sum_{k=1}^{K}\vartheta_k\|\mathbf p_k\|^2=\mathbf 1^T_K\vartheta,\tag{1}
$$

其中 $\vartheta\triangleq[\vartheta_1,\dots,\vartheta_K]^T$，最后一个等式由 $\|\mathbf p_k\|^2=1,\forall k$ 得到。

令 $\mathbf h_k\in\mathbb C^{N_t\times1}$ 表示 BS 与用户 $k$ 之间的信道，建模为

$$
\mathbf h_k=\beta_k^{1/2}\bar{\mathbf h}_k,\tag{2}
$$

其中 $\beta_k$ 为大尺度衰落系数，$\bar{\mathbf h}_k\sim\mathcal{CN}(\mathbf 0,\mathbf I_{N_t})$ 表示小尺度 Rayleigh 衰落分量。BS 接收到的导频信号可写为

$$
\mathbf Y_p=\sqrt{\tau_p}\sum_{k=1}^{K}\sqrt{\vartheta_k}\mathbf h_k\mathbf p_k^H+\mathbf N_p,
$$

其中 $\mathbf N_p\in\mathbb C^{N_t\times\tau_p}$ 为 BS 处的加性高斯白噪声（AWGN）矩阵，其元素服从 $\mathcal{CN}(0,\sigma^2)$。为估计 $\mathbf h_k$，把 $\mathbf Y_p$ 投影到 $\mathbf p_k$ 上，得到

$$
\breve{\mathbf y}_k=\mathbf Y_p\mathbf p_k
=\sqrt{\tau_p\vartheta_k}\mathbf h_k+\sqrt{\tau_p}\sum_{j\ne k}\sqrt{\vartheta_j}\mathbf h_j\mathbf p_j^H\mathbf p_k+\breve{\mathbf n}_p,
$$

其中 $\breve{\mathbf n}_p=\mathbf N_p\mathbf p_k$。令 $\hat{\mathbf h}_k$ 表示用最小均方误差（MMSE）得到的 $\mathbf h_k$ 的信道估计。由 [3]、[28]，$\hat{\mathbf h}_k$ 为

$$
\hat{\mathbf h}_k=\frac{\sqrt{\tau_p\vartheta_k}\beta_k}{\tau_p\sum_{j=1}^{K}\vartheta_j\beta_j\left|\mathbf p_j^H\mathbf p_k\right|^2+\sigma^2}\breve{\mathbf y}_k,\tag{3}
$$

其中 $\hat{\mathbf h}_k\sim\mathcal{CN}(\mathbf 0,\xi_k(\vartheta)\mathbf I_{N_t})$，

$$
\xi_k(\vartheta)\triangleq\frac{\tau_p\vartheta_k\beta_k^2}{\tau_p\sum_{j=1}^{K}\vartheta_j\beta_j\left|\mathbf p_j^H\mathbf p_k\right|^2+\sigma^2}.\tag{4}
$$

由（3）可把 $\mathbf h_k$ 建模为 $\mathbf h_k=\hat{\mathbf h}_k+\mathbf e_k$，其中 $\mathbf e_k$ 为信道估计误差。由此 $\mathbf e_k$ 与 $\hat{\mathbf h}_k$ 独立，且 $\mathbf e_k\sim\mathcal{CN}(\mathbf 0,\epsilon_k(\vartheta)\mathbf I_{N_t})$，其中

$$
\epsilon_k(\vartheta)\triangleq\beta_k-\xi_k(\vartheta)
=\frac{\beta_k\left(\tau_p\sum_{j\ne k}\vartheta_j\beta_j\left|\mathbf p_j^H\mathbf p_k\right|^2+\sigma^2\right)}{\tau_p\sum_{j=1}^{K}\vartheta_j\beta_j\left|\mathbf p_j^H\mathbf p_k\right|^2+\sigma^2}.\tag{5}
$$

**2）通信信号模型：** 令 $\mathbf s_m\triangleq[s_{1m},\dots,s_{Km}]^T\in\mathbb C^{K\times1}$ 表示时隙 $m$ 的发射符号向量，$\mathbb E\{\mathbf s_m\mathbf s_m^H\}=\mathbf I_K$。在长度为 $M$（$M<\tau_c$）的一帧上定义 $\mathbf S\triangleq[\mathbf s_1,\dots,\mathbf s_M]\in\mathbb C^{K\times M}$，则当 $M$ 足够大时由大数定律有 $\mathbf S\mathbf S^H\approx M\mathbf I_K$ [1]。

BS 采用线性双功能预编码器 $\mathbf W=\mathbf F\boldsymbol\Gamma+\mathbf u\boldsymbol\eta^T\in\mathbb C^{N_t\times K}$，其中 $\mathbf F\triangleq[\mathbf f_1,\dots,\mathbf f_K]\in\mathbb C^{N_t\times K}$ 为通信预编码矩阵，$\boldsymbol\Gamma\triangleq\mathrm{diag}\left(\sqrt{\gamma_1},\dots,\sqrt{\gamma_K}\right)\in\mathbb C^{K\times K}$ 为相应的用户功率分配矩阵。特别地，$\mathbf f_k$ 与 $\gamma_k$ 分别表示分配给用户 $k$ 的发射波束赋形器与功率。此外，$\mathbf u\in\mathbb C^{N_t\times1}$ 与 $\boldsymbol\eta=[\sqrt{\eta_1},\dots,\sqrt{\eta_K}]^T\in\mathbb C^{K\times1}$ 分别表示感知波束赋形器与与各数据流关联的感知功率分配系数；用户 $k$ 的双功能波束赋形向量对应 $\mathbf W$ 的第 $k$ 列，即 $\mathbf w_k=\sqrt{\gamma_k}\mathbf f_k+\sqrt{\eta_k}\mathbf u$。第 $m$ 个时隙发射的信号向量为 $\mathbf x_m=\mathbf W\mathbf s_m=\sum_{k=1}^{K}\mathbf w_ks_{km}$，发射波形为 $\mathbf X\triangleq[\mathbf x_1,\dots,\mathbf x_M]\in\mathbb C^{N_t\times M}$，等价地 $\mathbf X=\mathbf W\mathbf S$。于是通信用户接收到的信号矩阵为

$$
\mathbf Y_c=\mathbf H^H\mathbf X+\mathbf N_c=\mathbf H^H\mathbf W\mathbf S+\mathbf N_c\in\mathbb C^{K\times M},\tag{6}
$$

其中 $\mathbf H\triangleq[\mathbf h_1,\dots,\mathbf h_K]\in\mathbb C^{N_t\times K}$，$\mathbf N_c$ 为 AWGN 矩阵，其独立元素服从 $\mathcal{CN}(0,\sigma_c^2)$，$\sigma_c^2$ 为通信用户处的噪声方差。用户 $k$ 在时隙 $m$ 的接收信号为

$$
y_{ckm}=\mathbf h_k^H\mathbf w_ks_{km}+\mathbf h_k^H\sum_{j\ne k}\mathbf w_js_{jm}+n_{ckm}.\tag{7}
$$

### B. 雷达模型

BS 在服务通信用户的同时探测感知目标。目标方向由方位角 $\theta\in[-\pi,\pi]$ 与俯仰角 $\phi\in[-\pi/2,\pi/2]$ 刻画，相应回波信号由 BS 接收。UPA 以原点为中心并部署在 $y$–$z$ 平面上（如图 1 所示）。发射导向矢量为 $\mathbf a(\theta,\phi)=\mathbf a_y(\theta,\phi)\otimes\mathbf a_z(\phi)$，其中

$$
\mathbf a_y=\left[e^{-\mathrm j\pi\frac{N_{ty}-1}{2}\upsilon_y},e^{-\mathrm j\pi\frac{N_{ty}-3}{2}\upsilon_y},\dots,e^{\mathrm j\pi\frac{N_{ty}-1}{2}\upsilon_y}\right]^T,\tag{8}
$$

$$
\mathbf a_z=\left[e^{-\mathrm j\pi\frac{N_{tz}-1}{2}\upsilon_z},e^{-\mathrm j\pi\frac{N_{tz}-3}{2}\upsilon_z},\dots,e^{\mathrm j\pi\frac{N_{tz}-1}{2}\upsilon_z}\right]^T.\tag{9}
$$

这里 $\upsilon_y=\sin(\theta)\sin(\phi)$、$\upsilon_z=\cos(\phi)$，$N_{ty}$ 与 $N_{tz}$ 分别为 UPA 沿 $y$ 轴与 $z$ 轴的发射天线数，$N_t=N_{ty}N_{tz}$。BS 处 $N_r$ 根接收天线对应的接收导向矢量 $\mathbf b(\theta,\phi)$ 类似建模。基于此，BS 与目标之间的往返信道为

$$
\mathbf A(\theta,\phi)=\mathbf b(\theta,\phi)\mathbf a^H(\theta,\phi).\tag{10}
$$

于是目标在 BS 处产生的回波信号为

$$
\mathbf Y_s=\beta_s\mathbf A(\theta,\phi)\mathbf X+\mathbf N_s\in\mathbb C^{N_r\times M},\tag{11}
$$

其中 $\beta_s$ 表示目标的复反射系数，$\mathbf N_s\in\mathbb C^{N_r\times M}$ 为感知 AWGN 矩阵，其独立元素服从 $\mathcal{CN}(0,\sigma_s^2)$，$\sigma_s^2$ 为感知接收机处的噪声方差。后续分析中为记号简洁省略 $(\theta,\phi)$。

### C. 双功能发射预编码器

由 $\mathbf X=\mathbf W\mathbf S$，回波信号（11）可重写为

$$
\mathbf Y_s=\beta_s\mathbf b\mathbf a^H(\mathbf F\boldsymbol\Gamma+\mathbf u\boldsymbol\eta^T)\mathbf S+\mathbf N_s
=\beta_s\mathbf b\mathbf a^H\mathbf u\boldsymbol\eta^T\mathbf S+\breve{\mathbf N}_s,\tag{12}
$$

其中 $\breve{\mathbf N}_s\triangleq\beta_s\mathbf b\mathbf a^H\mathbf F\boldsymbol\Gamma\mathbf S+\mathbf N_s$。在目标方向已知完美的情形下，感知波束赋形器理想地取为 $\mathbf u=\mathbf a(\theta,\phi)$。然而，目标方向恰恰是需要估计的量，BS 并不掌握其完美信息。我们假设在感知与通信阶段之前，已在初始雷达搜索阶段获得粗目标角度估计 [1]、[19]。基于这些粗估计，BS 对目标角度进行细化。为此，假设 BS 已知目标角度的含噪估计：具体地，感知波束赋形器用估计角度设计，$\mathbf u=\mathbf a(\hat\theta,\hat\phi)$，其中 $\hat\theta\triangleq\theta+\varepsilon_\theta$、$\hat\phi\triangleq\phi+\varepsilon_\phi$，$\varepsilon_\theta$ 与 $\varepsilon_\phi$ 分别为方位角与俯仰角误差。我们进一步定义角度误差向量 $\boldsymbol\varepsilon\triangleq[\varepsilon_\theta,\varepsilon_\phi]^T$，其统计特性在第 III-C 节给出。对通信，采用广泛使用的线性预编码器 MRT 与 ZF：

$$
\mathbf F=\mathbf F_{\mathrm{bf}}=
\begin{cases}
\hat{\mathbf H}, & \mathrm{bf}=\mathrm{MRT},\\
\hat{\mathbf H}\left(\hat{\mathbf H}^H\hat{\mathbf H}\right)^{-1}, & \mathrm{bf}=\mathrm{ZF},
\end{cases}\tag{13}
$$

其中 $\hat{\mathbf H}=[\hat{\mathbf h}_1,\dots,\hat{\mathbf h}_K]\in\mathbb C^{N_t\times K}$。于是线性双功能发射预编码器为 $\mathbf W_{\mathrm{bf}}=\mathbf F_{\mathrm{bf}}\boldsymbol\Gamma+\mathbf a(\hat\theta,\hat\phi)\boldsymbol\eta^T$，$\mathrm{bf}\in\{\mathrm{MRT},\mathrm{ZF}\}$。该预编码器的平均发射功率为 [3]

$$
P=N_t\boldsymbol\xi_{\mathrm{bf}}^T\boldsymbol\gamma+N_t\rho,\tag{14}
$$

其中 $\rho=\|\boldsymbol\eta\|^2$，

$$
\boldsymbol\xi_{\mathrm{bf}}=
\begin{cases}
\left[\xi_1(\vartheta),\dots,\xi_K(\vartheta)\right]^T, & \mathrm{bf}=\mathrm{MRT},\\[1mm]
\dfrac{1}{N_t(N_t-K)}\left[\dfrac{1}{\xi_1(\vartheta)},\dots,\dfrac{1}{\xi_K(\vartheta)}\right]^T, & \mathrm{bf}=\mathrm{ZF}.
\end{cases}
$$

## III. 通信与感知性能分析

下面推导通信速率、感知 CRLB 与 CRLB 中断概率的闭式表达式，它们是后续资源分配的基础。

### A. 通信和速率

由（7）并遵循 [3]，采用 MRT 或 ZF 预编码器时用户 $k$ 的可达速率可闭式表示为

$$
R_k^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho)=\tau_0\log_2\left(1+\frac{\lambda_k^{\mathrm{bf}}(\vartheta)\gamma_k}{N_t\beta_k\rho+N_t\zeta_k^{\mathrm{bf}}(\vartheta)^T\boldsymbol\gamma+\sigma_c^2}\right),\tag{15}
$$

其中 $\tau_0\triangleq(\tau_c-\tau_p)/\tau_c$，$\boldsymbol\gamma\triangleq[\gamma_1,\dots,\gamma_K]^T$，且

$$
\lambda_k^{\mathrm{bf}}(\vartheta)=
\begin{cases}
N_t^2\xi_k^2(\vartheta), & \mathrm{bf}=\mathrm{MRT},\\
1, & \mathrm{bf}=\mathrm{ZF},
\end{cases}
\qquad
\zeta_k^{\mathrm{bf}}(\vartheta)=
\begin{cases}
\beta_k\left[\xi_1(\vartheta),\dots,\xi_K(\vartheta)\right]^T, & \mathrm{bf}=\mathrm{MRT},\\[1mm]
\dfrac{\epsilon_k(\vartheta)}{N_t(N_t-K)}\left[\dfrac{1}{\xi_1(\vartheta)},\dots,\dfrac{1}{\xi_K(\vartheta)}\right]^T, & \mathrm{bf}=\mathrm{ZF}.
\end{cases}
$$

与 [3] 不同，式（15）中的可达速率除依赖通信与感知功率分配变量 $\boldsymbol\gamma$、$\rho$ 外，还通过 $\xi_k(\vartheta)$ 显式依赖导频功率分配向量 $\vartheta$。

### B. 目标角度不确定性下的感知 CRLB

为刻画感知性能，我们推导目标方位角与俯仰角的 CRLB。为此，首先推导与未知参数向量相关的 Fisher 信息矩阵（FIM）：

$$
\mathbf y_s=\mathrm{vec}(\mathbf Y_s)=\mathbf v_s+\mathbf n_s,\tag{16}
$$

其中 $\mathbf v_s\triangleq\beta_s\mathrm{vec}(\mathbf A\mathbf X)\in\mathbb C^{N_rM\times1}$、$\mathbf n_s\triangleq\mathrm{vec}(\mathbf N_s)\in\mathbb C^{N_rM\times1}$，且 $\mathbf n_s\sim\mathcal{CN}(\mathbf 0,\sigma_s^2\mathbf I_{N_rM})$。令 $\boldsymbol\omega\triangleq[\theta,\phi,\tilde{\boldsymbol\beta}_s^T]^T\in\mathbb R^{4\times1}$ 表示未知参数向量，其中 $\tilde{\boldsymbol\beta}_s=[\mathrm{Re}(\beta_s),\mathrm{Im}(\beta_s)]^T$。遵循 [3]，由（16）估计 $\boldsymbol\omega$ 的 FIM 为

$$
\mathbf T_{\boldsymbol\omega}=
\begin{bmatrix}
T_{\theta\theta} & T_{\theta\phi} & \mathbf t_{\theta\tilde\beta_s}\\
T_{\theta\phi} & T_{\phi\phi} & \mathbf t_{\phi\tilde\beta_s}\\
\mathbf t_{\theta\tilde\beta_s}^T & \mathbf t_{\phi\tilde\beta_s}^T & \mathbf T_{\tilde\beta_s\tilde\beta_s}
\end{bmatrix},\tag{17}
$$

其中 $\mathbf T_{\boldsymbol\omega}$ 的各元素为

$$
T_{\psi\psi}=\chi_s|\beta_s|^2\,\mathrm{tr}\left(\dot{\mathbf A}_\psi\mathbf R_x\dot{\mathbf A}_\psi^H\right)\in\mathbb R^{1\times1},\tag{18}
$$

$$
T_{\theta\phi}=\chi_s|\beta_s|^2\,\mathrm{tr}\left(\dot{\mathbf A}_\phi\mathbf R_x\dot{\mathbf A}_\theta^H\right)\in\mathbb R^{1\times1},\tag{19}
$$

$$
\mathbf t_{\psi\tilde\beta_s}=\chi_s\mathrm{Re}\left(\beta_s^*\mathrm{tr}\left(\mathbf A\mathbf R_x\dot{\mathbf A}_\psi^H\right)[1,\mathrm j]\right)\in\mathbb R^{1\times2},\tag{20}
$$

$$
\mathbf T_{\tilde\beta_s\tilde\beta_s}=\chi_s\mathrm{tr}\left(\mathbf A\mathbf R_x\mathbf A^H\right)\mathbf I_2\in\mathbb R^{2\times2}.\tag{21}
$$

这里 $\psi\in\{\theta,\phi\}$，$\dot{\mathbf A}_\theta=\dot{\mathbf b}_\theta\mathbf a^H+\mathbf b\dot{\mathbf a}_\theta^H$，$\dot{\mathbf A}_\phi=\dot{\mathbf b}_\phi\mathbf a^H+\mathbf b\dot{\mathbf a}_\phi^H$，

$$
\mathbf R_x\triangleq\frac1M\mathbb E\left\{\mathbf X\mathbf X^H\right\}=\mathbb E\left\{\mathbf W_{\mathrm{bf}}\mathbf W_{\mathrm{bf}}^H\right\}\triangleq\mathbf R_{\mathrm{bf}},\tag{22}
$$

且 $\chi_s\triangleq\frac{2M}{\sigma_s^2}$。由（17），关于 $(\theta,\phi)$ 的等效 FIM 通过关于 $\tilde{\boldsymbol\beta}_s$ 的 Schur 补得到：

$$
\mathbf T_{\theta,\phi}=
\begin{bmatrix}
T_{\theta\theta}-\mathbf t_{\theta\tilde\beta_s}\mathbf T_{\tilde\beta_s\tilde\beta_s}^{-1}\mathbf t_{\theta\tilde\beta_s}^T &
T_{\theta\phi}-\mathbf t_{\theta\tilde\beta_s}\mathbf T_{\tilde\beta_s\tilde\beta_s}^{-1}\mathbf t_{\phi\tilde\beta_s}^T\\[1mm]
T_{\theta\phi}-\mathbf t_{\phi\tilde\beta_s}\mathbf T_{\tilde\beta_s\tilde\beta_s}^{-1}\mathbf t_{\theta\tilde\beta_s}^T &
T_{\phi\phi}-\mathbf t_{\phi\tilde\beta_s}\mathbf T_{\tilde\beta_s\tilde\beta_s}^{-1}\mathbf t_{\phi\tilde\beta_s}^T
\end{bmatrix}
\triangleq
\begin{bmatrix}
\tilde T_{\theta\theta} & \tilde T_{\theta\phi}\\
\tilde T_{\theta\phi} & \tilde T_{\phi\phi}
\end{bmatrix}.\tag{23}
$$

基于（23），目标方位角与俯仰角的 CRLB 由如下定理给出。

**定理 1：** 目标角度不确定性下，目标方位角与俯仰角 $\psi\in\{\theta,\phi\}$ 的闭式 CRLB 由（24）与（25）给出：

$$
\mathrm{CRLB}_\theta^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho,\boldsymbol\varepsilon)=
\left(
\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_\theta+\rho\hat c_\theta
-\frac{\rho^2\left|\hat c_{\theta\tilde\beta_s}\right|^2}{\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\tilde\beta_s\tilde\beta_s}+\rho\hat c_{\tilde\beta_s\tilde\beta_s}}
-\frac{\left(\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\theta\phi}+\rho\hat c_{\theta\phi}-\frac{\rho^2\hat c_{\theta\tilde\beta_s}\hat c_{\phi\tilde\beta_s}^*}{\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\tilde\beta_s\tilde\beta_s}+\rho\hat c_{\tilde\beta_s\tilde\beta_s}}\right)^2}{\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_\phi+\rho\hat c_\phi-\frac{\rho^2\left|\hat c_{\phi\tilde\beta_s}\right|^2}{\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\tilde\beta_s\tilde\beta_s}+\rho\hat c_{\tilde\beta_s\tilde\beta_s}}}
\right)^{-1},\tag{24}
$$

$$
\mathrm{CRLB}_\phi^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho,\boldsymbol\varepsilon)=
\left(
\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_\phi+\rho\hat c_\phi
-\frac{\rho^2\left|\hat c_{\phi\tilde\beta_s}\right|^2}{\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\tilde\beta_s\tilde\beta_s}+\rho\hat c_{\tilde\beta_s\tilde\beta_s}}
-\frac{\left(\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\theta\phi}+\rho\hat c_{\theta\phi}-\frac{\rho^2\hat c_{\theta\tilde\beta_s}\hat c_{\phi\tilde\beta_s}^*}{\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\tilde\beta_s\tilde\beta_s}+\rho\hat c_{\tilde\beta_s\tilde\beta_s}}\right)^2}{\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_\theta+\rho\hat c_\theta-\frac{\rho^2\left|\hat c_{\theta\tilde\beta_s}\right|^2}{\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\tilde\beta_s\tilde\beta_s}+\rho\hat c_{\tilde\beta_s\tilde\beta_s}}}
\right)^{-1},\tag{25}
$$

其中

$$
c_\psi\triangleq\chi_s|\beta_s|^2\left(\|\dot{\mathbf a}_\psi\|^2N_r+\|\dot{\mathbf b}_\psi\|^2N_t\right),\tag{26}
$$

$$
c_{\theta\phi}\triangleq\chi_s|\beta_s|^2\left(\dot{\mathbf a}_\theta^H\dot{\mathbf a}_\phi N_r+\dot{\mathbf b}_\theta^H\dot{\mathbf b}_\phi N_t\right),\tag{27}
$$

$$
c_{\tilde\beta_s\tilde\beta_s}\triangleq\chi_sN_tN_r,\tag{28}
$$

$$
\hat c_\psi\triangleq\chi_s|\beta_s|^2\left(|g_0|^2\|\dot{\mathbf b}_\psi\|^2+|g_\psi|^2N_r\right),\tag{29}
$$

$$
\hat c_{\theta\phi}\triangleq\chi_s|\beta_s|^2\left(|g_0|^2\dot{\mathbf b}_\theta^H\dot{\mathbf b}_\phi+g_\theta g_\phi N_r\right),\tag{30}
$$

$$
\hat c_{\tilde\beta_s\tilde\beta_s}\triangleq\chi_s|g_0|^2N_r,\tag{31}
$$

$$
\hat c_{\psi\tilde\beta_s}\triangleq\chi_s\beta_s^*(g_0g_\psi)N_r,\tag{32}
$$

且

$$
\|\dot{\mathbf a}_\theta\|^2=\frac{N_t\left(N_{ty}^2-1\right)}{12}\pi^2\cos^2(\theta)\sin^2(\phi),\tag{33}
$$

$$
\|\dot{\mathbf a}_\phi\|^2=\frac{N_t}{12}\pi^2\left(\left(N_{ty}^2-1\right)\sin^2(\theta)\cos^2(\phi)+\left(N_{tz}^2-1\right)\sin^2(\phi)\right),\tag{34}
$$

$$
\|\dot{\mathbf b}_\theta\|^2=\frac{N_r\left(N_{ry}^2-1\right)}{12}\pi^2\cos^2(\theta)\sin^2(\phi),\tag{35}
$$

$$
\|\dot{\mathbf b}_\phi\|^2=\frac{N_r}{12}\pi^2\left(\left(N_{ry}^2-1\right)\sin^2(\theta)\cos^2(\phi)+\left(N_{rz}^2-1\right)\sin^2(\phi)\right),\tag{36}
$$

$$
\dot{\mathbf a}_\theta^H\dot{\mathbf a}_\phi=\frac{N_t\left(N_{ty}^2-1\right)}{48}\pi^2\sin(2\theta)\sin(2\phi),\tag{37}
$$

$$
\dot{\mathbf b}_\theta^H\dot{\mathbf b}_\phi=\frac{N_r\left(N_{ry}^2-1\right)}{48}\pi^2\sin(2\theta)\sin(2\phi),\tag{38}
$$

以及

$$
g_0\triangleq\mathbf u^H\mathbf a=D_{N_{ty}}(\Delta_y)D_{N_{tz}}(\Delta_z),\tag{39}
$$

$$
g_\theta\triangleq\mathbf u^H\dot{\mathbf a}_\theta=\mathrm j\pi\cos(\theta)\sin(\phi)Q_{N_{ty}}(\Delta_y)D_{N_{tz}}(\Delta_z),\tag{40}
$$

$$
g_\phi\triangleq\mathbf u^H\dot{\mathbf a}_\phi
=\mathrm j\pi\sin(\theta)\cos(\phi)Q_{N_{ty}}(\Delta_y)D_{N_{tz}}(\Delta_z)
-\mathrm j\pi\sin(\phi)D_{N_{ty}}(\Delta_y)Q_{N_{tz}}(\Delta_z),\tag{41}
$$

$$
D_{N_{tx}}(\Delta_x)\triangleq\frac{\sin\left(\frac{N_{tx}\pi\Delta_x}{2}\right)}{\sin\left(\frac{\pi\Delta_x}{2}\right)},\tag{42}
$$

$$
Q_{N_{tx}}(\Delta_x)\triangleq\frac{-\mathrm j}{2\sin^2\left(\frac{\pi\Delta_x}{2}\right)}
\left(N_{tx}\cos\left(\frac{N_{tx}\pi\Delta_x}{2}\right)\sin\left(\frac{\pi\Delta_x}{2}\right)
-\sin\left(\frac{N_{tx}\pi\Delta_x}{2}\right)\cos\left(\frac{\pi\Delta_x}{2}\right)\right),\tag{43}
$$

其中 $x\in\{y,z\}$，且

$$
\Delta_x\triangleq
\begin{cases}
\sin(\theta)\sin(\phi)-\sin(\hat\theta)\sin(\hat\phi), & x=y,\\
\cos(\phi)-\cos(\hat\phi), & x=z.
\end{cases}\tag{44}
$$

**证明：** 见附录 A。■

基于（24）与（25），我们进一步研究 CRLB 关于 $N_t$ 与 $N_r$ 的缩放律。为便于解析处理，考虑（14）中通信与感知之间的等功率分配，即 $N_t\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma=N_t\rho=P/2$。缩放律总结于下述推论。

**推论 1：** 对固定的非零目标角度误差与方形 UPA（即 $N_{ty}=N_{tz}=\sqrt{N_t}$、$N_{ry}=N_{rz}=\sqrt{N_r}$），当 $N_t\gg1$ 且 $N_r$ 固定时，CRLB 按 $1/N_t$ 缩放；当 $N_r\gg1$ 且 $N_t$ 固定时，CRLB 按 $1/N_r^2$ 缩放。这意味着即使在目标角度误差存在时，在 BS 部署大规模天线阵列也能实现高精度感知。

**证明：** 见附录 B。■

**推论 2：** 对固定的 $N_t$ 与 $N_r$，在小目标角度误差下，式（24）与（25）中的 CRLB 可近似为

$$
\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon)\approx\mathrm{CRLB}_\psi^{\mathrm{bf}}(0)
+\left(\mathrm{CRLB}_\psi^{\mathrm{bf}}(0)\right)^2\rho\chi_sN_t|\beta_s|^2
\times\underbrace{\left\|\dot{\mathbf b}_\psi-r_\psi\dot{\mathbf b}_{\psi_c}\right\|^2
\left\|\mathbf a(\theta,\phi)-\mathbf a(\hat\theta,\hat\phi)\right\|^2}_{\text{发射导向矢量失配}},\tag{45}
$$

其中 $\psi\in\{\theta,\phi\}$，当 $\psi=\theta$ 时 $\psi_c=\phi$，当 $\psi=\phi$ 时 $\psi_c=\theta$。此外，$\mathrm{CRLB}_\psi^{\mathrm{bf}}(0)$ 表示无目标角度误差时的 CRLB，$\|\mathbf a(\theta,\phi)-\mathbf a(\hat\theta,\hat\phi)\|^2\approx\varepsilon_\theta^2\|\dot{\mathbf a}_\theta\|^2+\varepsilon_\phi^2\|\dot{\mathbf a}_\phi\|^2+2\varepsilon_\theta\varepsilon_\phi\dot{\mathbf a}_\theta^H\dot{\mathbf a}_\phi$，且 $r_\psi\triangleq r_{\mathrm{num}}/r_{\mathrm{den},\psi_c}$。这里 $r_{\mathrm{num}}\triangleq\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\theta\phi}+\rho\chi_s|\beta_s|^2N_t^2\dot{\mathbf b}_\theta^H\dot{\mathbf b}_\phi$，$r_{\mathrm{den},\psi_c}\triangleq\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\psi_c}+\rho\chi_s|\beta_s|^2N_t^2\|\dot{\mathbf b}_{\psi_c}\|^2$。由（45）可见，目标角度误差主要通过发射导向矢量失配增大 CRLB；由于该失配在 $(\varepsilon_\theta,\varepsilon_\phi)$ 上是二次的，CRLB 随目标角度误差呈二次增长。

**证明：** 见附录 C。■

**备注 1：** 对给定 CRLB 阈值 $\mathrm{CRLB}^0_\psi$，定义可行感知功率集 $\mathcal F_\psi(\boldsymbol\varepsilon)\triangleq\{\rho\ge0:\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon,\rho)\le\mathrm{CRLB}^0_\psi\}$ 与 $\mathcal F_\psi(0)\triangleq\{\rho\ge0:\mathrm{CRLB}_\psi^{\mathrm{bf}}(0,\rho)\le\mathrm{CRLB}^0_\psi\}$，其中 $\psi\in\{\theta,\phi\}$。由（45），对给定感知功率 $\rho$ 有 $\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon,\rho)\ge\mathrm{CRLB}_\psi^{\mathrm{bf}}(0,\rho)$。因此若 $\rho\in\mathcal F_\psi(\boldsymbol\varepsilon)$，则 $\mathrm{CRLB}_\psi^{\mathrm{bf}}(0,\rho)\le\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon,\rho)\le\mathrm{CRLB}^0_\psi$，从而 $\mathcal F_\psi(\boldsymbol\varepsilon)\subseteq\mathcal F_\psi(0)$。于是 $\rho^{\min}_\psi(\boldsymbol\varepsilon)\ge\rho^{\min}_\psi(0)$，其中 $\rho^{\min}_\psi(\boldsymbol\varepsilon)\triangleq\inf\mathcal F_\psi(\boldsymbol\varepsilon)$。因此，在目标角度误差下，满足 CRLB 阈值所需的最小感知功率会增加。由（14），对固定下行发射功率，可用于通信的功率满足 $\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma\le P/N_t-\rho^{\min}_\psi(\boldsymbol\varepsilon)\le P/N_t-\rho^{\min}_\psi(0)$。因此，目标角度误差在增加感知功率 $\rho$ 的同时减少了可用于通信的功率。此外，由（15），通信功率的减少会降低分子项 $\lambda_k^{\mathrm{bf}}(\vartheta)\gamma_k$，而 $\rho$ 的增大会使分母项 $N_t\beta_k\rho$ 变大，从而降低可达速率。由此可得出结论：尽管目标角度误差不出现在式（15）的可达速率表达式中，它们仍通过通信与感知功率分配的折中而间接影响速率。

式（24）与（25）的 CRLB 表达式对确定性目标角度误差与随机目标角度误差均成立。由于 $\boldsymbol\varepsilon$ 被建模为随机向量，相应的 CRLB 也是随机的。这促使我们使用 CRLB 中断概率来刻画目标角度不确定性下的感知可靠性。
### C. 角度误差模型与 CRLB 中断分析

为刻画目标角度不确定性下的感知可靠性，我们把方位角与俯仰角误差 $\varepsilon_\theta$、$\varepsilon_\phi$ 建模为相互独立的随机变量 [29]、[30]，并考虑以下误差模型：

- **高斯分布：** 目标角度误差建模为 $\varepsilon_\psi\sim\mathcal N(0,\sigma_\psi^2)$，$\psi\in\{\theta,\phi\}$，其中 $\sigma_\psi$ 表示角度误差的标准差 [29]、[30]。
- **广义均匀分布：** 假设角度误差服从 $\varepsilon_\psi\sim\mathcal U\left(-\frac{\pi}{U_\psi},\frac{\pi}{U_\psi}\right)$，其中 $\frac{\pi}{U_\psi}$ 为最大绝对误差 [31]。$U_\psi$ 越大，误差区间越窄。
- **von Mises 分布：** 目标角度误差服从 von Mises 分布，即 $\varepsilon_\psi\sim\mathrm{VM}(0,\kappa_\psi)$，其中 $\kappa_\psi$ 为集中度参数 [31]。$\kappa_\psi$ 越大，角度误差越集中于零附近。

由于式（24）与（25）的 CRLB 依赖随机角度误差向量 $\boldsymbol\varepsilon$，在上述模型下它们成为随机量。为量化相应的感知可靠性，定义 CRLB 中断概率为

$$
P_{\mathrm{out}\psi}^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho)
\triangleq\Pr\left\{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho,\boldsymbol\varepsilon)>\mathrm{CRLB}^0_\psi\right\}
=1-\Pr\left\{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho,\boldsymbol\varepsilon)\le\mathrm{CRLB}^0_\psi\right\}
=1-F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}\left(\mathrm{CRLB}^0_\psi\right),\tag{46}
$$

其中 $\psi\in\{\theta,\phi\}$，$F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(\cdot)$ 为 $\mathrm{CRLB}_\psi^{\mathrm{bf}}$ 的累积分布函数（CDF），$\mathrm{CRLB}^0_\psi$ 为预设的 CRLB 阈值。为便于推导 $P_{\mathrm{out}\psi}^{\mathrm{bf}}$，下面先给出 $F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(\cdot)$ 的易处理近似。

**定理 2：** 在高斯、广义均匀与 von Mises 三类目标角度误差模型下，随机 CRLB 的 CDF 具有如下统一近似：

$$
F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(x)\approx\sum_{i=1}^{G_\theta}\sum_{j=1}^{G_\phi}w_{\theta i}w_{\phi j}\frac{1}{1+\exp\left(-\varrho\left(\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho,\mathbf z_{ij})}-\frac1x\right)\right)},\tag{47}
$$

其中 $x>0$，$\psi\in\{\theta,\phi\}$，$G_\theta$ 与 $G_\phi$ 为 Gauss 求积规则的阶数；进一步，$\varrho>0$ 为 sigmoid 近似的锐度参数 [32, (11)]，$\mathbf z_{ij}\triangleq[z_{\theta i},z_{\phi j}]^T$ 与 $\{w_{\theta i},w_{\phi j}\}$ 分别为 Gauss 求积规则的节点与权重，由下式给出：

$$
\left(z_{\psi q},w_{\psi q}\right)\triangleq
\begin{cases}
\left(\frac{\pi}{U_\psi}z_q^{\mathrm{GL}},\ \frac12w_q^{\mathrm{GL}}\right), & \varepsilon_\psi\sim\mathcal U\left(-\frac{\pi}{U_\psi},\frac{\pi}{U_\psi}\right),\\[1mm]
\left(\sqrt2\sigma_\psi z_q^{\mathrm{GH}},\ \frac{1}{\sqrt\pi}w_q^{\mathrm{GH}}\right), & \varepsilon_\psi\sim\mathcal N(0,\sigma_\psi^2),\\[1mm]
\left(\pi z_q^{\mathrm{GL}},\ \frac{1}{2I_0(\kappa_\psi)}w_q^{\mathrm{GL}}\exp\left(\kappa_\psi\cos\left(\pi z_q^{\mathrm{GL}}\right)\right)\right), & \varepsilon_\psi\sim\mathrm{VM}(0,\kappa_\psi),
\end{cases}\tag{48}
$$

其中 $q\in\{i,j\}$，$z_q^{\mathrm{GL}}$ 与 $z_q^{\mathrm{GH}}$ 分别为 Legendre 多项式与 Hermite 多项式的零点，$w_q^{\mathrm{GL}}$ 与 $w_q^{\mathrm{GH}}$ 分别为相应的 Gauss–Legendre 与 Gauss–Hermite 权重 [33, (25.4.29)]、[34, Prop. 2]。

**证明：** 见附录 D。■

由定理 2，把（47）代入（46）即可方便地得到 CRLB 中断概率。

**推论 3：** 当 $\sigma_\psi\to0$、$U_\psi\to\infty$ 或 $\kappa_\psi\to\infty$ 时，只要 $\mathrm{CRLB}_\psi^{\mathrm{bf}}(0)<\mathrm{CRLB}^0_\psi$（其中 $\mathrm{CRLB}_\psi^{\mathrm{bf}}(0)$ 表示无目标角度误差时的 CRLB），则对于足够大的锐度参数 $\varrho$，式（46）中的 CRLB 中断概率趋于零。

**证明：** 当 $\sigma_\psi\to0$ 或 $U_\psi\to\infty$ 时，式（48）中的求积节点满足 $\mathbf z_{ij}\to0$；对 von Mises 分布，当 $\kappa_\psi\to\infty$ 时相应求积权重越来越集中于零误差附近。因此对三种角度误差模型，式（47）中的项 $\mathrm{CRLB}_\psi^{\mathrm{bf}}$ 均满足 $\mathrm{CRLB}_\psi^{\mathrm{bf}}(\mathbf z_{ij})\to\mathrm{CRLB}_\psi^{\mathrm{bf}}(0)$，从而得到 $F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(\mathrm{CRLB}^0_\psi)\to\sum_{i=1}^{G_\theta}\sum_{j=1}^{G_\phi}w_{\theta i}w_{\phi j}\left(1+\exp(-\varrho d_\psi^{(0)})\right)^{-1}$，其中 $d_\psi^{(0)}\triangleq1/\mathrm{CRLB}_\psi^{\mathrm{bf}}(0)-1/\mathrm{CRLB}^0_\psi$。若 $\mathrm{CRLB}_\psi^{\mathrm{bf}}(0)<\mathrm{CRLB}^0_\psi$，则 $d_\psi^{(0)}>0$，故对足够大的 $\varrho$ 有 $\exp(-\varrho d_\psi^{(0)})\to0$。因此 $F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(\mathrm{CRLB}^0_\psi)\to\sum_{i=1}^{G_\theta}\sum_{j=1}^{G_\phi}w_{\theta i}w_{\phi j}$。于是由（46）有 $P_{\mathrm{out}\psi}^{\mathrm{bf}}\to1-\sum_{i=1}^{G_\theta}\sum_{j=1}^{G_\phi}w_{\theta i}w_{\phi j}\approx0$。此处近似成立是因为方位角与俯仰角误差独立分布且 $\sum_iw_{\psi i}\approx1$。例如在高斯情形，利用 Gauss–Hermite 规则 [33, (25.4.46)] 得 $\sum_iw_{\psi i}\approx(1/\sqrt\pi)\int_{-\infty}^{\infty}e^{-x^2}\mathrm dx=1$。该结论对其他所考虑的分布同样成立。■

**备注 2：** 由推论 1，在等功率分配与方形 UPA 下，对足够大的 $N_t$ 或 $N_r$ 有 $\mathrm{CRLB}_\psi^{\mathrm{bf}}\to0$。把该结果代入（47）与（46）可得 $P_{\mathrm{out}\psi}^{\mathrm{bf}}\to1-\sum_{i=1}^{G_\theta}\sum_{j=1}^{G_\phi}w_{\theta i}w_{\phi j}\approx0$。该渐近行为虽在等功率分配假设下推导，但在更一般的功率分配方案下同样成立，第 V 节将加以验证。然而，等功率分配对于平衡通信与感知性能一般是次优的。此外，如备注 1 所述，目标角度误差并不显式影响可达速率，在固定功率分配下只降低感知性能。因此它们对通信—感知折中的影响通过功率分配体现，这促使我们发展下述鲁棒设计。

## IV. 可靠性约束下的鲁棒功率分配

### A. 问题建模

下面在目标角度不确定性下发展一种以通信为中心的鲁棒功率分配方案。联合优化导频训练、通信传输与感知传输功率，以在满足感知中断与总功率约束的同时最大化通信和速率。

由第 III 节的结果，可达速率、CRLB 与 CRLB 中断概率仅通过总感知功率 $\rho$ 依赖感知功率分配向量 $\{\eta_k\}_{k=1}^{K}$。因此，对 $\{\gamma_k,\eta_k\}_{k=1}^{K}$ 的优化可化简为对 $\{\gamma_k\}_{k=1}^{K}$ 与 $\rho$ 的优化。所得优化问题表述为

$$
\max_{\vartheta,\boldsymbol\gamma,\rho}\ \sum_{k=1}^{K}R_k^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho)\tag{49a}
$$

$$
\text{s.t.}\quad P_{\mathrm{out}\theta}^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho)\le P^0_\theta,\tag{49b}
$$

$$
P_{\mathrm{out}\phi}^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho)\le P^0_\phi,\tag{49c}
$$

$$
\mathbf 1_K^T\vartheta+N_t\left(\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma+\rho\right)\le P_t^{\max},\tag{49d}
$$

其中（49b）与（49c）中 $P^0_\theta$ 与 $P^0_\phi$ 分别为方位角与俯仰角 CRLB 的中断阈值，（49d）中 $P_t^{\max}$ 为总功率预算。特别地，约束（49d）刻画了上行导频训练与下行通信/感知传输之间的耦合：增大导频训练功率会改善信道估计质量、从而改善下行通信性能，但会减少后续通信/感知传输可用的功率。

问题（49）因其非凸性而难以求解。具体地，目标函数（49a）关于 $(\vartheta,\boldsymbol\gamma,\rho)$ 非凹，中断约束（49b）与（49c）非凸，且由于 $\boldsymbol\xi_{\mathrm{bf}}(\vartheta)$ 对 $\vartheta$ 的分式依赖，功率约束（49d）非仿射。为应对这些困难，我们基于 SCA [35] 发展交替优化（AO）框架，把原问题分解为关于导频训练与信号传输/探测的易处理功率分配子问题并迭代求解。

### B. 基于 SCA 的导频功率分配

对固定的 $(\bar{\boldsymbol\gamma},\bar\rho)$，先优化导频功率分配向量 $\vartheta$。由于（49）中的目标函数与约束关于 $\vartheta$ 均非凸，我们采用 SCA 框架，在每次迭代用易处理的二次代理函数替换它们。

**1）目标函数（49a）的凸性：** 令 $\mathbf x^{[t]}$ 表示下文迭代算法第 $t$ 次迭代时 $\mathbf x$ 的可行点。由 [35, Lemma 12]，在可行点 $\vartheta^{[t]}$ 附近得到凹的二次下界代理：

$$
R_k^{\mathrm{bf}}(\vartheta)\ge\widetilde R_{k,\vartheta}^{\mathrm{bf}}\left(\vartheta;\vartheta^{[t]}\right)
\triangleq R_k^{\mathrm{bf}}(\vartheta^{[t]})+\nabla_\vartheta R_k^{\mathrm{bf}}(\vartheta^{[t]})^T\left(\vartheta-\vartheta^{[t]}\right)
-\frac{L_{k,\vartheta}^{\mathrm{bf},[t]}}{2}\left\|\vartheta-\vartheta^{[t]}\right\|^2,\tag{50}
$$

其中 $\nabla_\vartheta R_k^{\mathrm{bf}}(\cdot)$ 为速率函数 $R_k^{\mathrm{bf}}$ 关于 $\vartheta$ 的梯度，$L_{k,\vartheta}^{\mathrm{bf},[t]}>0$ 为满足 $R_k^{\mathrm{bf}}(\vartheta)\ge\widetilde R_{k,\vartheta}^{\mathrm{bf}}(\vartheta;\vartheta^{[t]})$ 的常数。

**2）约束（49b）—（49d）的凸性：** 我们利用二次上界代理 [35] 凸化（49b）—（49d）。具体地，对 $\psi\in\{\theta,\phi\}$，在可行点 $\vartheta^{[t]}$ 附近为（49b）与（49c）构造上界代理：

$$
P_{\mathrm{out}\psi}^{\mathrm{bf}}(\vartheta)\le\widetilde P_{\mathrm{out}\psi,\vartheta}^{\mathrm{bf}}\left(\vartheta;\vartheta^{[t]}\right)
\triangleq P_{\mathrm{out}\psi}^{\mathrm{bf}}(\vartheta^{[t]})+\nabla_\vartheta P_{\mathrm{out}\psi}^{\mathrm{bf}}(\vartheta^{[t]})^T\left(\vartheta-\vartheta^{[t]}\right)
+\frac{\ell_{\psi,\vartheta}^{\mathrm{bf},[t]}}{2}\left\|\vartheta-\vartheta^{[t]}\right\|^2
\le P^0_\psi,\quad\psi\in\{\theta,\phi\}.\tag{51}
$$

对（49d），先定义 $P_{\mathrm{tot}}^{\mathrm{bf}}(\vartheta)\triangleq\mathbf 1_K^T\vartheta+N_t\left(\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma+\rho\right)$，与（51）类似，（49d）迭代更新为

$$
P_{\mathrm{tot}}^{\mathrm{bf}}(\vartheta)\le\widetilde P_{\mathrm{tot}\vartheta}\left(\vartheta;\vartheta^{[t]}\right)
\triangleq P_{\mathrm{tot}}^{\mathrm{bf}}(\vartheta^{[t]})+\nabla_\vartheta P_{\mathrm{tot}}^{\mathrm{bf}}(\vartheta^{[t]})^T\left(\vartheta-\vartheta^{[t]}\right)
+\frac{\ell_{p,\vartheta}^{\mathrm{bf},[t]}}{2}\left\|\vartheta-\vartheta^{[t]}\right\|^2
\le P_t^{\max},\tag{52}
$$

其中 $\nabla_\vartheta P_{\mathrm{out}\psi}^{\mathrm{bf}}(\cdot)$ 与 $\nabla_\vartheta P_{\mathrm{tot}}^{\mathrm{bf}}(\cdot)$ 分别表示标量函数 $P_{\mathrm{out}\psi}^{\mathrm{bf}}$ 与 $P_{\mathrm{tot}}^{\mathrm{bf}}$ 关于 $\vartheta$ 的梯度。此外，$\ell_{\psi,\vartheta}^{\mathrm{bf},[t]}>0$ 与 $\ell_{p,\vartheta}^{\mathrm{bf},[t]}>0$ 的选取分别满足 $P_{\mathrm{out}\psi}^{\mathrm{bf}}(\vartheta)\le\widetilde P_{\mathrm{out}\psi,\vartheta}^{\mathrm{bf}}(\vartheta;\vartheta^{[t]})$（$\psi\in\{\theta,\phi\}$）与 $P_{\mathrm{tot}}^{\mathrm{bf}}(\vartheta)\le\widetilde P_{\mathrm{tot}\vartheta}^{\mathrm{bf}}(\vartheta;\vartheta^{[t]})$。

综上，第 $t$ 次迭代求解的（49）中导频功率分配子问题的凸近似为

$$
\mathcal P_1:\ \max_{\vartheta}\ \sum_{k=1}^{K}\widetilde R_{k,\vartheta}^{\mathrm{bf}}\left(\vartheta;\vartheta^{[t]}\right)
\quad\text{s.t.}\quad(51),\ (52).\tag{53}
$$

### C. 通信与感知功率分配

在得到最优 $\vartheta^\star$ 后，我们优化通信与感知功率系数 $(\boldsymbol\gamma,\rho)$。

**1）目标函数（49a）的凸性：** 先把（15）改写为 $R_k^{\mathrm{bf}}(\boldsymbol\gamma,\rho)=\tau_0\log_2\left(1+\frac{S_k^{\mathrm{bf}}(\boldsymbol\gamma)}{I_k^{\mathrm{bf}}(\boldsymbol\gamma,\rho)}\right)$，其中 $S_k^{\mathrm{bf}}(\boldsymbol\gamma)\triangleq\lambda_k^{\mathrm{bf}}(\vartheta)\gamma_k$、$I_k^{\mathrm{bf}}(\boldsymbol\gamma,\rho)\triangleq N_t\beta_k\rho+N_t\boldsymbol\zeta_{k}^{\mathrm{bf},T}(\vartheta)\boldsymbol\gamma+\sigma_c^2$。注意到 $S_k^{\mathrm{bf}}(\boldsymbol\gamma)$ 与 $I_k^{\mathrm{bf}}(\boldsymbol\gamma,\rho)$ 均关于 $(\boldsymbol\gamma,\rho)$ 仿射。于是遵循 [36, Eq. (22)] 的下界变换，在可行点 $(\boldsymbol\gamma^{[t]},\rho^{[t]})$ 附近得到凹代理：

$$
R_k^{\mathrm{bf}}(\boldsymbol\gamma,\rho)\ge\widetilde R_{k,\gamma,\rho}^{\mathrm{bf}}\left(\boldsymbol\gamma,\rho;\boldsymbol\gamma^{[t]},\rho^{[t]}\right)
\triangleq\frac{\tau_0}{\ln2}\left(q_{u,k}^{\mathrm{bf},[t]}-\frac{q_{z,k}^{\mathrm{bf},[t]}}{S_k^{\mathrm{bf}}(\boldsymbol\gamma)}-q_{w,k}^{\mathrm{bf},[t]}I_k^{\mathrm{bf}}(\boldsymbol\gamma,\rho)\right),\tag{54}
$$

其中

$$
q_{u,k}^{\mathrm{bf},[t]}\triangleq\ln\left(1+\frac{S_k^{\mathrm{bf},[t]}}{I_k^{\mathrm{bf},[t]}}\right)+\frac{2S_k^{\mathrm{bf},[t]}}{S_k^{\mathrm{bf},[t]}+I_k^{\mathrm{bf},[t]}},\tag{55}
$$

$$
q_{z,k}^{\mathrm{bf},[t]}\triangleq\frac{\left(S_k^{\mathrm{bf},[t]}\right)^2}{S_k^{\mathrm{bf},[t]}+I_k^{\mathrm{bf},[t]}},\tag{56}
$$

$$
q_{w,k}^{\mathrm{bf},[t]}\triangleq\frac{S_k^{\mathrm{bf},[t]}}{\left(S_k^{\mathrm{bf},[t]}+I_k^{\mathrm{bf},[t]}\right)I_k^{\mathrm{bf},[t]}},\tag{57}
$$

且 $S_k^{\mathrm{bf},[t]}\triangleq S_k^{\mathrm{bf}}(\boldsymbol\gamma^{[t]})$、$I_k^{\mathrm{bf},[t]}\triangleq I_k^{\mathrm{bf}}(\boldsymbol\gamma^{[t]},\rho^{[t]})$。

**2）约束（49b）与（49c）的凸性：** 与（51）类似，对 $\psi\in\{\theta,\phi\}$，在可行点 $(\boldsymbol\gamma^{[t]},\rho^{[t]})$ 附近为（49b）与（49c）构造如下二次上界代理：

$$
P_{\mathrm{out}\psi}^{\mathrm{bf}}(\boldsymbol\gamma,\rho)\le\widetilde P_{\mathrm{out}\psi,\gamma,\rho}^{\mathrm{bf}}\left(\boldsymbol\gamma,\rho;\boldsymbol\gamma^{[t]},\rho^{[t]}\right)
\triangleq P_{\mathrm{out}\psi}^{\mathrm{bf}}\left(\boldsymbol\gamma^{[t]},\rho^{[t]}\right)
+\nabla_{\boldsymbol\gamma}P_{\mathrm{out}\psi}^{\mathrm{bf}}\left(\boldsymbol\gamma^{[t]},\rho^{[t]}\right)^T\left(\boldsymbol\gamma-\boldsymbol\gamma^{[t]}\right)
$$

$$
+\frac{\partial P_{\mathrm{out}\psi}^{\mathrm{bf}}\left(\boldsymbol\gamma^{[t]},\rho^{[t]}\right)}{\partial\rho}\left(\rho-\rho^{[t]}\right)
+\frac{\ell_{\psi,\gamma,\rho}^{\mathrm{bf},[t]}}{2}\left(\left\|\boldsymbol\gamma-\boldsymbol\gamma^{[t]}\right\|^2+\left|\rho-\rho^{[t]}\right|^2\right)
\le P^0_\psi,\tag{58}
$$

其中 $\nabla_{\boldsymbol\gamma}P_{\mathrm{out}\psi}^{\mathrm{bf}}(\cdot)$ 与 $\partial P_{\mathrm{out}\psi}^{\mathrm{bf}}(\cdot)/\partial\rho$ 分别表示标量函数 $P_{\mathrm{out}\psi}^{\mathrm{bf}}$ 关于 $\boldsymbol\gamma$ 与 $\rho$ 的梯度与导数，$\ell_{\psi,\gamma,\rho}^{\mathrm{bf},[t]}>0$ 的选取满足 $P_{\mathrm{out}\psi}^{\mathrm{bf}}(\boldsymbol\gamma,\rho)\le\widetilde P_{\mathrm{out}\psi,\gamma,\rho}^{\mathrm{bf}}(\boldsymbol\gamma,\rho;\boldsymbol\gamma^{[t]},\rho^{[t]})$。

由上述分析，第 $t$ 次迭代求解的（49）中通信与感知功率分配子问题的凸近似为

$$
\mathcal P_2:\ \max_{\boldsymbol\gamma,\rho}\ \sum_{k=1}^{K}\widetilde R_{k,\gamma,\rho}^{\mathrm{bf}}\left(\boldsymbol\gamma,\rho;\boldsymbol\gamma^{[t]},\rho^{[t]}\right)
\quad\text{s.t.}\quad(49d),\ (58).\tag{59}
$$

所提求解方法需要 $R_k^{\mathrm{bf}}$、$P_{\mathrm{out}\psi}^{\mathrm{bf}}$ 与 $P_{\mathrm{tot}}^{\mathrm{bf}}$ 关于（50）—（52）与（58）中相应优化变量的闭式梯度。得益于（15）、（47）与（49d）中推导的闭式表达式，这些梯度可通过链式法则直接计算，总结于下述定理。

**定理 3：** 对 $\mathrm{bf}\in\{\mathrm{MRT},\mathrm{ZF}\}$ 与 $k,n\in\{1,\dots,K\}$，$\nabla_\vartheta R_k^{\mathrm{bf}}$ 与 $\nabla_\vartheta P_{\mathrm{tot}}^{\mathrm{bf}}$ 的元素为

$$
\frac{\partial R_k^{\mathrm{bf}}}{\partial\vartheta_n}=\frac{\tau_0}{\ln2}\cdot\frac{I_k^{\mathrm{bf}}U_{k,n}^{\mathrm{bf}}-S_k^{\mathrm{bf}}V_{k,n}^{\mathrm{bf}}}{I_k^{\mathrm{bf}}\left(S_k^{\mathrm{bf}}+I_k^{\mathrm{bf}}\right)},\tag{60}
$$

$$
\frac{\partial P_{\mathrm{tot}}^{\mathrm{bf}}}{\partial\vartheta_n}=1+N_t\Omega_n^{\mathrm{bf}},\tag{61}
$$

其中 $\Omega_n^{\mathrm{bf}}\triangleq\partial s^{\mathrm{bf}}/\partial\vartheta_n$，$s^{\mathrm{bf}}\triangleq\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma$，且

$$
U_{k,n}^{\mathrm{MRT}}=2N_t^2\xi_k\gamma_kD_{k,n},\qquad U_{k,n}^{\mathrm{ZF}}=0,
$$

$$
V_{k,n}^{\mathrm{MRT}}=N_t\beta_k\Omega_n^{\mathrm{MRT}},\qquad V_{k,n}^{\mathrm{ZF}}=N_t\sum_{j=1}^{K}\gamma_j\Xi_{j,k,n},
$$

$$
\Omega_n^{\mathrm{MRT}}=\sum_{j=1}^{K}\gamma_jD_{j,n},\qquad
\Omega_n^{\mathrm{ZF}}=-\frac{1}{N_t(N_t-K)}\sum_{j=1}^{K}\frac{\gamma_jD_{j,n}}{\xi_j^2}.
$$

这里 $D_{k,n}$ 与 $\Xi_{j,k,n}$ 计算为

$$
D_{k,n}=\frac{\tau_p\beta_k^2\left(\delta_{kn}\left(\tau_p\sum_{\ell=1}^{K}\vartheta_\ell\beta_\ell\left|\mathbf p_\ell^H\mathbf p_k\right|^2+\sigma^2\right)-\tau_p\vartheta_k\beta_n\left|\mathbf p_n^H\mathbf p_k\right|^2\right)}{\left(\tau_p\sum_{\ell=1}^{K}\vartheta_\ell\beta_\ell\left|\mathbf p_\ell^H\mathbf p_k\right|^2+\sigma^2\right)^2},
$$

$$
\Xi_{j,k,n}=-\frac{1}{N_t(N_t-K)}\left(\frac{D_{k,n}}{\xi_j}+\frac{\epsilon_kD_{j,n}}{\xi_j^2}\right),
$$

其中当 $k=n$ 时 $\delta_{kn}=1$、否则 $\delta_{kn}=0$。

此外，$\nabla_\vartheta P_{\mathrm{out}\psi}^{\mathrm{bf}}$ 与 $\nabla_{\boldsymbol\gamma}P_{\mathrm{out}\psi}^{\mathrm{bf}}$ 的元素以及导数 $\partial P_{\mathrm{out}\psi}^{\mathrm{bf}}/\partial\rho$ 计算为

$$
\frac{\partial P_{\mathrm{out}\psi}^{\mathrm{bf}}}{\partial\vartheta_n}=-\sum_{i=1}^{G_\theta}\sum_{j=1}^{G_\phi}w_{\theta i}w_{\phi j}\varrho\varsigma_{\psi,ij}^{\mathrm{bf}}\left(1-\varsigma_{\psi,ij}^{\mathrm{bf}}\right)\Lambda_{\psi,ij}^{s}\Omega_n^{\mathrm{bf}},\tag{62}
$$

$$
\frac{\partial P_{\mathrm{out}\psi}^{\mathrm{bf}}}{\partial\gamma_n}=-\sum_{i=1}^{G_\theta}\sum_{j=1}^{G_\phi}w_{\theta i}w_{\phi j}\varrho\varsigma_{\psi,ij}^{\mathrm{bf}}\left(1-\varsigma_{\psi,ij}^{\mathrm{bf}}\right)\Lambda_{\psi,ij}^{s}\left[\boldsymbol\xi_{\mathrm{bf}}\right]_n,\tag{63}
$$

$$
\frac{\partial P_{\mathrm{out}\psi}^{\mathrm{bf}}}{\partial\rho}=-\sum_{i=1}^{G_\theta}\sum_{j=1}^{G_\phi}w_{\theta i}w_{\phi j}\varrho\varsigma_{\psi,ij}^{\mathrm{bf}}\left(1-\varsigma_{\psi,ij}^{\mathrm{bf}}\right)\Lambda_{\psi,ij}^{r},\tag{64}
$$

其中定义

$$
\varsigma_{\psi,ij}^{\mathrm{bf}}\triangleq\frac{1}{1+\exp\left(-\varrho\left(\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}\left(s^{\mathrm{bf}},\rho,\mathbf z_{ij}\right)}-\frac{1}{\mathrm{CRLB}^0_\psi}\right)\right)},
$$

$$
\Lambda_{\theta,ij}^{x}\triangleq\tilde c_{\theta\theta,ij}^{x}-\frac{2\tilde T_{\theta\phi,ij}\tilde c_{\theta\phi,ij}^{x}\tilde T_{\phi\phi,ij}-\tilde T_{\theta\phi,ij}^2\tilde c_{\phi\phi,ij}^{x}}{\tilde T_{\phi\phi,ij}^2},
$$

$$
\Lambda_{\phi,ij}^{x}\triangleq\tilde c_{\phi\phi,ij}^{x}-\frac{2\tilde T_{\theta\phi,ij}\tilde c_{\theta\phi,ij}^{x}\tilde T_{\theta\theta,ij}-\tilde T_{\theta\phi,ij}^2\tilde c_{\theta\theta,ij}^{x}}{\tilde T_{\theta\theta,ij}^2},
$$

其中 $x\in\{s,r\}$，且

$$
\tilde c_{\psi\psi,ij}^{s}\triangleq c_{\psi,ij}+\frac{\rho^2\left|\hat c_{\psi\tilde\beta_s,ij}\right|^2c_{\tilde\beta_s\tilde\beta_s,ij}}{\tilde T_{\tilde\beta_s\tilde\beta_s,ij}^2},
\qquad
\tilde c_{\theta\phi,ij}^{s}\triangleq c_{\theta\phi,ij}+\frac{\rho^2\hat c_{\theta\tilde\beta_s,ij}\hat c_{\phi\tilde\beta_s,ij}^*c_{\tilde\beta_s\tilde\beta_s,ij}}{\tilde T_{\tilde\beta_s\tilde\beta_s,ij}^2},
$$

$$
\tilde c_{\psi\psi,ij}^{r}\triangleq\hat c_{\psi,ij}-\frac{2\rho\left|\hat c_{\psi\tilde\beta_s,ij}\right|^2\tilde T_{\tilde\beta_s\tilde\beta_s,ij}-\rho^2\left|\hat c_{\psi\tilde\beta_s,ij}\right|^2\hat c_{\tilde\beta_s\tilde\beta_s,ij}}{\tilde T_{\tilde\beta_s\tilde\beta_s,ij}^2},
$$

$$
\tilde c_{\theta\phi,ij}^{r}\triangleq\hat c_{\theta\phi,ij}-\frac{2\rho\hat c_{\theta\tilde\beta_s,ij}\hat c_{\phi\tilde\beta_s,ij}^*\tilde T_{\tilde\beta_s\tilde\beta_s,ij}-\rho^2\hat c_{\theta\tilde\beta_s,ij}\hat c_{\phi\tilde\beta_s,ij}^*\hat c_{\tilde\beta_s\tilde\beta_s,ij}}{\tilde T_{\tilde\beta_s\tilde\beta_s,ij}^2}.
$$

注意 $\{\tilde T_{\theta\theta,ij},\tilde T_{\phi\phi,ij},\tilde T_{\theta\phi,ij},T_{\tilde\beta_s\tilde\beta_s,ij}\}$ 与 $\{c_{\psi,ij},\hat c_{\psi,ij},c_{\theta\phi,ij},\hat c_{\theta\phi,ij},c_{\tilde\beta_s\tilde\beta_s,ij},\hat c_{\tilde\beta_s\tilde\beta_s,ij},\hat c_{\psi\tilde\beta_s,ij}\}_{\psi\in\{\theta,\phi\}}$ 分别用（65）—（67）、（23）与（26）—（32）计算。

### D. 收敛性与计算复杂度

算法 1 总结求解问题（49）的所提 AO-SCA 框架。（53）中的凸子问题 $\mathcal P_1$ 含 $K$ 个优化变量与三个凸约束，而（59）中的 $\mathcal P_2$ 含 $K+1$ 个优化变量与三个凸约束。因此算法 1 的总计算复杂度为 $\mathcal O\left(I_{\mathrm{AO}}\left(K^3+(K+1)^3\right)\right)$ [37, Sec. 1.3.1]，其中 $I_{\mathrm{AO}}$ 表示 AO 迭代次数。下面讨论算法 1 的收敛性。由（50）有 $\widetilde R_{k,\vartheta}^{\mathrm{bf}}(\vartheta;\vartheta^{[t]})\le R_k^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma^{[t]},\rho^{[t]})$ 且 $\widetilde R_{k,\vartheta}^{\mathrm{bf}}(\vartheta^{[t]};\vartheta^{[t]})=R_k^{\mathrm{bf}}(\vartheta^{[t]},\boldsymbol\gamma^{[t]},\rho^{[t]})$。由于 $\vartheta^{[t+1]}$ 由求解（53）得到，故有 $R^{\mathrm{bf}}(\vartheta^{[t]},\boldsymbol\gamma^{[t]},\rho^{[t]})\le R^{\mathrm{bf}}(\vartheta^{[t+1]},\boldsymbol\gamma^{[t]},\rho^{[t]})$。类似地，由（54）有 $\widetilde R_{k,\gamma,\rho}^{\mathrm{bf}}(\boldsymbol\gamma,\rho;\boldsymbol\gamma^{[t]},\rho^{[t]})\le R_k^{\mathrm{bf}}(\vartheta^{[t+1]},\boldsymbol\gamma,\rho)$，且在 $(\boldsymbol\gamma^{[t]},\rho^{[t]})$ 处取等号。由于 $(\boldsymbol\gamma^{[t+1]},\rho^{[t+1]})$ 由求解（59）得到，故 $R^{\mathrm{bf}}(\vartheta^{[t+1]},\boldsymbol\gamma^{[t]},\rho^{[t]})\le R^{\mathrm{bf}}(\vartheta^{[t+1]},\boldsymbol\gamma^{[t+1]},\rho^{[t+1]})$。因此算法 1 产生非降的目标值序列。由于可达和速率在有限功率预算 $P_t$ 下上有界，所生成的目标序列收敛。

**算法 1：求解（49）的 AO-SCA 算法**

1. **初始化：** 置 $t:=0$，生成初始可行点 $\left(\vartheta^{[0]},\boldsymbol\gamma^{[0]},\rho^{[0]}\right)$。
2. **repeat**
3. 　对给定 $\left(\boldsymbol\gamma^{[t]},\rho^{[t]}\right)$ 求解（53）得到 $\vartheta^\star$；
4. 　更新 $\vartheta^{[t+1]}:=\vartheta^\star$；
5. 　对给定 $\vartheta^{[t+1]}$ 求解（59）得到 $\left(\boldsymbol\gamma^\star,\rho^\star\right)$；
6. 　更新 $\left(\boldsymbol\gamma^{[t+1]},\rho^{[t+1]}\right):=\left(\boldsymbol\gamma^\star,\rho^\star\right)$；
7. 　置 $t:=t+1$；
8. **until** 收敛；
9. **输出：** $\left(\vartheta^\star,\boldsymbol\gamma^\star,\rho^\star\right)$。

## V. 数值结果与讨论

本节验证所发展的分析框架并评估所提鲁棒功率分配方案的性能。除非另有说明，用户在半径为 1000 m 的圆形小区内均匀分布，BS 位于小区中心 $(0,0)$ [3]，感知目标位于 $(\theta,\phi)=\left(\frac{\pi}{8},\frac{\pi}{4}\right)$。用户 $k$ 的大尺度衰落系数建模为 $\beta_k=z_k/(r_k/r_0)^{\nu_{\mathrm{pl}}}$ [28]，其中 $r_0=100$ m，$z_k$ 服从标准差 7 dB 的对数正态分布 [2]，$r_k$ 与 $\nu_{\mathrm{pl}}$ 分别表示用户 $k$ 到 BS 的距离与路径损耗指数。我们设置 $K=8$、$N_t=121$、$N_r=25$、$\nu_{\mathrm{pl}}=3.2$、$M=30$、$\tau_p=K$ [28]、$\tau_c=100$、$\sigma^2=\sigma_c^2=\sigma_s^2=1$ [28]、$\beta_s=1$ [5]。Gauss 求积规则的阶数设为 $G_\psi\in\{60,80\}$，sigmoid 近似的锐度参数与算法 1 的收敛容差分别设为 $\varrho=1$ [32] 与 $10^{-3}$。

所考虑的基准功率分配方案总结如下：

- **等功率（Equal power）：** 先把总功率在（49d）中的 $\mathbf 1_K^T\vartheta$、$N_t\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma$ 与 $N_t\rho$ 之间等分，再设 $\vartheta_1=\cdots=\vartheta_k=\cdots=\vartheta_K$ 与 $\gamma_1=\cdots=\gamma_k=\cdots=\gamma_K$，得到 $(\vartheta_k,\gamma_k,\rho)=\left(\frac{P_t^{\max}}{3K},\frac{P_t^{\max}}{3N_t\sum_{j=1}^{K}[\boldsymbol\xi_{\mathrm{bf}}(\vartheta)]_j},\frac{P_t^{\max}}{3N_t}\right)$（$\forall k$）。
- **Equal C & equal P：** 对 $\vartheta$、$\boldsymbol\gamma$、$\rho$ 进行功率分配，但导频功率与通信功率在用户间平均分配，即在（49）中加入约束 $\vartheta_1=\cdots=\vartheta_K$ 与 $\gamma_1=\cdots=\gamma_K$。
- **非鲁棒（Non-robust）：** 基于在估计角度 $(\hat\theta,\hat\phi)$ 处计算的确定性 CRLB 约束进行功率分配，即用 $\mathrm{CRLB}_\psi^{\mathrm{bf}}\le\mathrm{CRLB}^0_\psi$（$\psi\in\{\theta,\phi\}$）替代（49b）与（49c）中的中断概率约束。

我们首先验证定理 1、推论 2 与定理 2 分别给出的 CRLB、其渐近近似及相应 CDF 的解析表达式。图 2 给出确定性误差值下 CRLB 的解析结果与 Monte Carlo 结果，以及高斯、广义均匀与 von Mises 分布误差下 CDF 的结果。可以看到，在整个所考虑的 $\varepsilon_\psi$ 与 $\mathrm{CRLB}^0_\psi$ 范围内，解析结果与近似均与仿真结果高度吻合，证实了所推导表达式的精度。此外，图 2(b) 表明分析对所考虑的两个锐度参数 $\varrho$ 取值都保持紧致，说明所采用 $\varrho$ 的合理性。

图 3 给出 MRT 与 ZF 预编码下算法 1 在不同 SNR 下的收敛行为。算法以等功率分配初始化，$\left(\vartheta^{[0]}_k,\gamma^{[0]}_k,\rho^{[0]}\right)=\left(\frac{P_t^{\max}}{3K},\frac{P_t^{\max}}{3N_t\sum_{j=1}^{K}[\boldsymbol\xi_{\mathrm{bf}}(\vartheta^{[0]})]_j},\frac{P_t^{\max}}{3N_t}\right)$，该初始化满足（49d）的功率约束。不失一般性，设（50）中 $L_{k,\vartheta}^{\mathrm{bf},[t]}\triangleq L_\vartheta^{[t]},\forall k$，（51）与（52）中 $\ell_{\theta,\vartheta}^{\mathrm{bf},[t]}=\ell_{\phi,\vartheta}^{\mathrm{bf},[t]}=\ell_{p,\vartheta}^{\mathrm{bf},[t]}\triangleq\ell_\vartheta^{[t]}$，（58）中 $\ell_{\theta,\gamma,\rho}^{\mathrm{bf},[t]}=\ell_{\phi,\gamma,\rho}^{\mathrm{bf},[t]}\triangleq\ell_{\gamma,\rho}^{[t]}$。我们采用回溯搜索 [38] 获得参数 $L_\vartheta^{[t]}$、$\ell_\vartheta^{[t]}$ 与 $\ell_{\gamma,\rho}^{[t]}$。为比较，我们也给出固定参数值下的收敛行为。如图 3 所示，采用回溯搜索时算法 1 约在 8—10 次 AO 迭代内收敛，而采用固定参数值则需要 10—30 次迭代。

图 4 展示所提方案与基准方案达到的通信与感知性能及相应功率分配。主要观察如下：

- 图 4(a) 表明，在所考虑的 SNR 范围内，基于 ZF 的所提方案在所有基于 ZF 的方案中始终取得最高和速率，其次是 Equal C & equal P 与等功率基准。在 SNR = 14 dB 时，所提 ZF 方案的和速率相对 ZF 等功率方案与 ZF Equal C & equal P 方案分别提高约 295.5% 与 85.8%；基于 MRT 的方案观察到类似增益，说明所提功率分配设计的有效性。
- 图 4(b) 给出由所推导闭式表达式得到与由 Monte Carlo 仿真得到的 CRLB 中断概率。可以看到所有情形下解析结果与仿真高度吻合，验证了（46）与（47）的分析。
- 由图 4(b) 可见，在低 SNR 区间，等功率方案对角 $\theta$ 给出的中断概率低于所提方案。这与图 4(c) 一致：等功率方案把更大的功率比例分配给感知，从而在低 SNR 时改善中断概率；但随着 SNR 提高，所提方案对 $\theta$ 与 $\phi$ 都给出比等功率方案更低的中断概率。此外，对 MRT 与 ZF，所提方案与 Equal C & equal P 基准具有相似的中断概率，因为二者给出相同的 $\mathbf 1_K^T\vartheta$、$N_t\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma$ 与 $N_t\rho$ 取值，这可由图 4(c) 以及（24）、（25）、（47）看出。

图 5(a) 给出鲁棒与非鲁棒方案的通信和速率随感知 CRLB 阈值的变化。对所有方案，当 CRLB 阈值从 −60 dB 放宽到 −45 dB 时和速率增大，随后逐渐饱和。这是因为更大的 CRLB 阈值放松了感知要求，使更多功率可分配给通信与导频训练。此外，所提鲁棒 ZF 方案始终比 ZF 非鲁棒方案取得更高的和速率，且在严格感知区间增益尤为显著。随着 CRLB 阈值增大，两种方案的和速率差距逐渐减小，因为较宽松的感知要求对功率分配影响较小，两种方案主要把功率用于最大化通信和速率，从而使其和速率趋于一致。

图 5(b) 还给出通信和速率随中断阈值 $P^0_\psi$（$\psi\in\{\theta,\phi\}$）的变化。与图 5(a) 类似，所提鲁棒方案的和速率随 $P^0_\psi$ 先增大后饱和；相反，非鲁棒方案的和速率关于 $P^0_\psi$ 保持不变，因为其设计未考虑目标角度不确定性及相应的中断概率约束。还可以观察到，对相对更严格的中断阈值（例如 $P^0_\psi=0.25$），鲁棒方案的和速率略低于非鲁棒方案，这是因为鲁棒设计需要分配更多功率给感知以在严格中断约束下保证感知可靠性，从而减少可用于通信与导频训练的功率。尽管非鲁棒设计在 $P^0_\psi=0.25$ 时取得略高的和速率，但其代价是感知中断概率高得多，导致非鲁棒方案的通信—感知折中整体更差。图 5(c) 证实了这一观察：鲁棒方案在整个 $P^0_\psi$ 范围内都取得比非鲁棒方案更低的中断概率。基于 MRT 的方案观察到类似趋势。

图 6 给出不同目标角度误差模型下的和速率与 CRLB 中断概率。回顾第 III-C 节，对 $\psi\in\{\theta,\phi\}$，$\sigma_\psi$ 越大对应角度误差越大，而 $U_\psi$ 与 $\kappa_\psi$ 越大对应角度误差越小。由图 6(b) 可见，中断概率随 $\sigma_\psi$ 增大而上升，图 6(a) 中相应和速率则下降。这是因为中断概率增大时，鲁棒设计需要分配更多功率给感知以满足中断约束，从而可用于通信与导频训练的功率减少，和速率下降。在图 6(d) 与 6(f) 中，中断概率分别随 $U_\psi$ 与 $\kappa_\psi$ 增大而下降，图 6(c) 与 6(e) 中的相应和速率则上升，遵循同样的通信—感知功率折中。这些观察与备注 1 及推论 3 一致。

此外，对相对严格的感知约束（即 $P^0_\theta=P^0_\phi=0.25$）与严重的角度误差（如 $(\sigma_\psi,U_\psi,\kappa_\psi)=(8^\circ,18,51)$），非鲁棒设计在图 6(a)、6(c)、6(e) 中的和速率略高于鲁棒设计；但这以感知可靠性为代价，如图 5(b) 所示。在 $(\sigma_\psi,U_\psi,\kappa_\psi)=(8^\circ,18,51)$ 时，鲁棒设计在高斯、均匀与 von Mises 角度误差分布下，分别使方位角与俯仰角的 CRLB 中断概率相对非鲁棒方案降低 (63%, 60%)、(62%, 56%) 与 (62%, 59%)。这表明所提鲁棒设计在所考虑的角度误差分布下取得了更好的速率—可靠性折中。

图 7 展示发射天线数对通信与感知性能的影响。如图 7(a) 所示，增大 $N_t$ 会因更大天线阵列带来更强波束赋形增益而提高所有方案的通信和速率；此外，鲁棒与非鲁棒方案之间的和速率差距随 $N_t$ 增大而逐渐收窄。这一减小与图 7(b) 一致：在高 $N_t$ 时两种方案的感知中断概率都接近零，因此感知中断约束对功率分配影响很小，两种方案都倾向于把功率主要用于提升通信和速率。最后，感知中断概率随 $N_t$ 增大而降低，印证了备注 2 的渐近结果。

## VI. 结论

本文研究了目标角度不确定性下的单站 mMIMO-ISAC 系统。我们推导了高斯、广义均匀与 von Mises 角度误差模型下感知 CRLB、中断概率与通信和速率的闭式表达式；在此结果基础上，建立了在感知中断约束与总功率约束下最大化通信和速率的鲁棒功率分配框架，并提出高效的 AO-SCA 算法求解所得非凸优化问题。解析与仿真结果证明了所发展框架的精度，并揭示了目标角度误差对感知可靠性及通信—感知折中的影响。特别地，与非鲁棒基准相比，所提鲁棒设计在保持有竞争力的通信性能的同时显著降低了感知中断概率，从而实现了更优的通信—感知折中。
## 图注与表注

**图 1（原文第 3 页）：** 目标角度误差下的单站 mMIMO ISAC 系统示意。图中给出配备 UPA 的 BS（$N_t$ 根发射天线、$N_r$ 根接收天线）、$K$ 个单天线通信用户、以方位角 $\theta$ 与俯仰角 $\phi$ 描述方向的感知目标，以及目标反射回波；BS 用估计角度 $\hat\theta=\theta+\varepsilon_\theta$、$\hat\phi=\phi+\varepsilon_\phi$ 设计感知波束。

**图 2（原文第 9 页）：** 验证 (a) $\mathrm{CRLB}_\psi^{\mathrm{bf}}$ 与 (b) $F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}$（$\psi\in\{\theta,\phi\}$）。在等功率分配下，取 $\sigma_\psi=4^\circ$、$U_\psi=2$、$\kappa_\psi=10$ 及不同的锐度参数 $\varrho$ 取值；图中将解析结果与 Monte Carlo 仿真对比。

**图 3（原文第 10 页）：** 算法 1 的收敛行为，参数为 $P^0_\theta=P^0_\phi=0.5$、$\mathrm{CRLB}^0_\theta=-48$ dB、$\mathrm{CRLB}^0_\phi=-40$ dB、$\sigma_\theta=8^\circ$、$\sigma_\phi=6^\circ$、$L_\vartheta^{[t]}=20$、$\ell_\vartheta^{[t]}=20$、$\ell_{\gamma,\rho}^{[t]}=100$；横轴为 AO 迭代次数，纵轴为和速率。

**图 4（原文第 11 页）：** 通信与感知性能，参数为 $P^0_\theta=P^0_\phi=0.5$、$\mathrm{CRLB}^0_\theta=-48$ dB、$\mathrm{CRLB}^0_\phi=-40$ dB、$\sigma_\theta=8^\circ$、$\sigma_\phi=6^\circ$。(a) 通信和速率随 SNR 的变化；(b) 感知中断概率随 SNR 的变化；(c) 功率分配随 SNR 的变化（含图内标注的数值 0.166、0.034 等）。

**图 5（原文第 11 页）：** 通信与感知性能折中，取 SNR = 15 dB、$\sigma_\psi=10^\circ$。(a) 和速率随 CRLB 阈值（−60 至 −35 dB）的变化；(b) 和速率随中断阈值 $P^0_\psi$ 的变化；(c) 感知中断概率随中断阈值的变化。

**图 6（原文第 12 页）：** 不同分布下角度误差对和速率与感知中断概率的影响，参数为 $\mathrm{CRLB}^0_\theta=\mathrm{CRLB}^0_\phi=-55$ dB 且 $P^0_\theta=P^0_\phi$。(a)(b) 高斯分布（横轴为 $\sigma_\psi$ 的度数）；(c)(d) 均匀分布（横轴为 $U_\psi$）；(e)(f) von Mises 分布（横轴为 $\kappa_\psi$）。

**图 7（原文第 12 页）：** 通信与感知性能，参数为 $P^0_\psi=0.4$（$\psi\in\{\theta,\phi\}$）、$\sigma_\psi=10^\circ$、SNR = 10 dB。(a) 和速率随发射天线数 $N_t$ 的变化；(b) 中断概率随 $N_t$ 的变化（含图内标注的数值 0.396、0.398、0.4 等）。

**表注：** 原文全文无编号表格（仅图 1—7），故本页无需转录表格。

## 附录

### 附录 A：定理 1 的证明

对（22）应用与 [3, Appendix C] 类似的步骤，首先得到 $\mathbf R_{\mathrm{bf}}=\boldsymbol\xi_{\mathrm{bf}}^T\boldsymbol\gamma\mathbf I_{N_t}+\rho\mathbf u\mathbf u^H$。随后，利用 $\mathbf a^H\dot{\mathbf a}_\theta=\mathbf a^H\dot{\mathbf a}_\phi=\mathbf b^H\dot{\mathbf b}_\theta=\mathbf b^H\dot{\mathbf b}_\phi=0$ 并把其代入（18）—（21），对任意感知波束赋形器 $\mathbf u$ 有

$$
T_{\theta\theta}\triangleq\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_\theta+\rho\hat c_\theta,
\qquad
T_{\phi\phi}\triangleq\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_\phi+\rho\hat c_\phi,\tag{65}
$$

$$
T_{\theta\phi}\triangleq\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\theta\phi}+\rho\hat c_{\theta\phi},
\qquad
\mathbf t_{\psi\tilde\beta_s}\triangleq\rho\,\mathrm{Re}\left(\hat c_{\psi\tilde\beta_s}(1,\mathrm j)\right),\tag{66}
$$

$$
\mathbf T_{\tilde\beta_s\tilde\beta_s}\triangleq\left(\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma c_{\tilde\beta_s\tilde\beta_s}+\rho\hat c_{\tilde\beta_s\tilde\beta_s}\right)\mathbf I_2=\bar T_{\tilde\beta_s\tilde\beta_s}\mathbf I_2.\tag{67}
$$

这里 $\psi\in\{\theta,\phi\}$，集合 $\{c_\theta,c_\phi,c_{\theta\phi},c_{\tilde\beta_s\tilde\beta_s},\hat c_\theta,\hat c_\phi,\hat c_{\theta\phi},\hat c_{\tilde\beta_s\tilde\beta_s},\hat c_{\psi\tilde\beta_s}\}$ 由（26）—（32）定义，其中 $g_0\triangleq\mathbf u^H\mathbf a$、$g_\theta\triangleq\mathbf u^H\dot{\mathbf a}_\theta$、$g_\phi\triangleq\mathbf u^H\dot{\mathbf a}_\phi$。由（65）—（67）与（23）定义

$$
\mathrm{CRLB}_\theta\triangleq\left(\tilde T_{\theta\theta}-\frac{\tilde T_{\theta\phi}^2}{\tilde T_{\phi\phi}}\right)^{-1},
\qquad
\mathrm{CRLB}_\phi\triangleq\left(\tilde T_{\phi\phi}-\frac{\tilde T_{\theta\phi}^2}{\tilde T_{\theta\theta}}\right)^{-1}.\tag{68}
$$

对 $\mathbf u=\mathbf a(\hat\theta,\hat\phi)$，定义 $\Delta_y\triangleq\sin(\theta)\sin(\phi)-\sin(\hat\theta)\sin(\hat\phi)$、$\Delta_z\triangleq\cos(\phi)-\cos(\hat\phi)$，对 $x\in\{y,z\}$ 定义

$$
D_{N_{tx}}(\Delta_x)\triangleq\sum_{m=-(N_{tx}-1)/2}^{(N_{tx}-1)/2}e^{\mathrm j\pi m\Delta_x},
\qquad
Q_{N_{tx}}(\Delta_x)\triangleq\sum_{m=-(N_{tx}-1)/2}^{(N_{tx}-1)/2}me^{\mathrm j\pi m\Delta_x},\tag{69}
$$

其闭式分别由（42）与（43）给出。为简洁起见，对 $x\in\{y,z\}$ 记 $D_x\triangleq D_{N_{tx}}(\Delta_x)$、$Q_x\triangleq Q_{N_{tx}}(\Delta_x)$。下面计算（29）—（32）所需的 $\{g_0,g_\theta,g_\phi\}$：

**1）计算 $g_0$：** 首先利用恒等式 $(\mathbf p\otimes\mathbf q)^H(\mathbf r\otimes\mathbf s)=(\mathbf p^H\mathbf r)(\mathbf q^H\mathbf s)$ 以及（8）、（9）的结果，把 $g_0$ 写为

$$
g_0=\mathbf u^H\mathbf a=\left(\mathbf a_y^H(\hat\theta,\hat\phi)\mathbf a_y(\theta,\phi)\right)\left(\mathbf a_z^H(\hat\phi)\mathbf a_z(\phi)\right).\tag{70}
$$

这里基于（69）可写出 $\mathbf a_y^H(\hat\theta,\hat\phi)\mathbf a_y(\theta,\phi)=D_y$ 与 $\mathbf a_z^H(\hat\phi)\mathbf a_z(\phi)=D_z$，从而得到（39）中的 $g_0=D_yD_z$。

**2）计算 $g_\theta$：** 接着利用 [3, (88),(90)] 写出 $\dot{\mathbf a}_\theta=\dot{\mathbf a}_{y\theta}\otimes\mathbf a_z$。这里 $\dot{\mathbf a}_{y\theta}=\mathrm j\pi\cos(\theta)\sin(\phi)\mathbf v_{ty}\odot\mathbf a_y$，其中对 $x\in\{y,z\}$ 有 $\mathbf v_{tx}=[-(N_{tx}-1)/2,\dots,(N_{tx}-1)/2]^T$。基于此与（69）有

$$
\mathbf u^H\dot{\mathbf a}_\theta=\left(\mathbf a_y^H(\hat\theta,\hat\phi)\dot{\mathbf a}_{y\theta}\right)\left(\mathbf a_z^H(\hat\phi)\mathbf a_z\right)\tag{71}
$$

$$
=\mathrm j\pi\cos(\theta)\sin(\phi)\mathbf a_y^H(\hat\theta,\hat\phi)\left(\mathbf v_{ty}\odot\mathbf a_y\right)D_z.\tag{72}
$$

这里 $\mathbf a_y^H(\hat\theta,\hat\phi)(\mathbf v_{ty}\odot\mathbf a_y)=Q_{N_{ty}}(\Delta_y)=Q_y$，从而得到（40）中的 $g_\theta=\mathrm j\pi\cos(\theta)\sin(\phi)Q_yD_z$。

**3）计算 $g_\phi$：** 利用 [3, (89)] 写出 $\dot{\mathbf a}_\phi=\dot{\mathbf a}_{y\phi}\otimes\mathbf a_z+\mathbf a_y\otimes\dot{\mathbf a}_{z\phi}$，其中 $\dot{\mathbf a}_{y\phi}=\mathrm j\pi\sin(\theta)\cos(\phi)(\mathbf v_{ty}\odot\mathbf a_y)$、$\dot{\mathbf a}_{z\phi}=-\mathrm j\pi\sin(\phi)(\mathbf v_{tz}\odot\mathbf a_z)$。利用此式与（69）有

$$
\mathbf u^H\dot{\mathbf a}_\phi=\left(\mathbf a_y^H(\hat\theta,\hat\phi)\dot{\mathbf a}_{y\phi}\right)\left(\mathbf a_z^H(\hat\phi)\mathbf a_z\right)
+\left(\mathbf a_y^H(\hat\theta,\hat\phi)\mathbf a_y\right)\left(\mathbf a_z^H(\hat\phi)\dot{\mathbf a}_{z\phi}\right)
$$

$$
=\mathrm j\pi\sin(\theta)\cos(\phi)\mathbf a_y^H(\hat\theta,\hat\phi)(\mathbf v_{ty}\odot\mathbf a_y)D_z
-\mathrm j\pi\sin(\phi)D_y\mathbf a_z^H(\hat\phi)(\mathbf v_{tz}\odot\mathbf a_z).\tag{73}
$$

把（69）应用于 $\mathbf u^H\dot{\mathbf a}_\phi$，即得（41）中的 $g_\phi$。最后，把 $\{g_0,g_\theta,g_\phi\}$ 代入（65）—（67），再利用（68）与（23），即得（24）—（25）与（29）—（32）。此外，在（26）—（32）中，我们利用性质 $\mathbf a_y^H\dot{\mathbf a}_{y\theta}=\mathbf a_y^H\dot{\mathbf a}_{y\phi}=\mathbf a_z^H\dot{\mathbf a}_{z\phi}=\dot{\mathbf a}_{z\theta}=0$ 及 $\mathbf b(\theta,\phi)$ 的类似性质，并结合 [3, (88)—(93)] 的结果得到 $\|\dot{\mathbf a}_\theta\|^2$、$\|\dot{\mathbf a}_\phi\|^2$ 与 $\dot{\mathbf a}_\theta^H\dot{\mathbf a}_\phi$。

### 附录 B：推论 1 的证明

由（14），在等功率设定下有 $\boldsymbol\xi_{\mathrm{bf}}^T(\vartheta)\boldsymbol\gamma=\rho=\mathcal O(N_t^{-1})$。首先考虑 $N_t\gg1$、$N_r$ 固定且非零 $\boldsymbol\varepsilon$ 固定的情形。对 $N_{ty}=N_{tz}=\sqrt{N_t}$，（33）—（37）给出 $\|\dot{\mathbf a}_\theta\|^2,\|\dot{\mathbf a}_\phi\|^2,\dot{\mathbf a}_\theta^H\dot{\mathbf a}_\phi=\mathcal O(N_t^2)$。因此由（26）—（28）得 $c_\theta,c_\phi,c_{\theta\phi}=\mathcal O(N_t^2)$ 且 $c_{\tilde\beta_s\tilde\beta_s}=\mathcal O(N_t)$。进一步，利用（39）—（41）得 $g_0=\mathcal O(1)$、$g_\theta,g_\phi=\mathcal O(\sqrt{N_t})$。于是由（29）—（32）有 $\hat c_\theta,\hat c_\phi,\hat c_{\theta\phi}=\mathcal O(N_t)$、$\hat c_{\tilde\beta_s\tilde\beta_s}=\mathcal O(1)$、$\hat c_{\theta\tilde\beta_s},\hat c_{\phi\tilde\beta_s}=\mathcal O(\sqrt{N_t})$。把这些渐近结果代入（24）与（25），可得 $\mathrm{CRLB}_\psi^{\mathrm{bf}}$ 的分母按 $\mathcal O(N_t)$ 缩放。因此当 $N_t\gg1$ 且 $N_r$ 固定时 $\mathrm{CRLB}_\psi^{\mathrm{bf}}\propto1/N_t$。

其次考虑 $N_r\gg1$、$N_t$ 固定的情形。对 $N_{ry}=N_{rz}=\sqrt{N_r}$，（35）—（38）给出 $\|\dot{\mathbf b}_\theta\|^2,\|\dot{\mathbf b}_\phi\|^2,\dot{\mathbf b}_\theta^H\dot{\mathbf b}_\phi=\mathcal O(N_r^2)$。因此由（26）—（28）与（29）—（32）得 $c_\theta,c_\phi,c_{\theta\phi},\hat c_\theta,\hat c_\phi,\hat c_{\theta\phi}=\mathcal O(N_r^2)$，且 $c_{\tilde\beta_s\tilde\beta_s},\hat c_{\tilde\beta_s\tilde\beta_s},\hat c_{\theta\tilde\beta_s},\hat c_{\phi\tilde\beta_s}=\mathcal O(N_r)$。把这些结果代入（24）与（25），得到当 $N_r\gg1$ 时 $\mathrm{CRLB}_\psi^{\mathrm{bf}}\propto1/N_r^2$。

### 附录 C：推论 2 的证明

考虑 $N_t$ 与 $N_r$ 固定，并假设 $\boldsymbol\varepsilon\to0$。对 $\hat\theta=\theta+\varepsilon_\theta$、$\hat\phi=\phi+\varepsilon_\phi$，一阶 Taylor 展开给出 $\sin\hat\theta\sin\hat\phi=\sin\theta\sin\phi+\varepsilon_\theta\cos\theta\sin\phi+\varepsilon_\phi\sin\theta\cos\phi+\mathcal O(\|\boldsymbol\varepsilon\|^2)$ 与 $\cos\hat\phi=\cos\phi-\varepsilon_\phi\sin\phi+\mathcal O(\|\boldsymbol\varepsilon\|^2)$。把这些近似用于（44），得到

$$
\Delta_y=-\left(\varepsilon_\theta\cos\theta\sin\phi+\varepsilon_\phi\sin\theta\cos\phi\right)+\mathcal O(\|\boldsymbol\varepsilon\|^2),\tag{74}
$$

$$
\Delta_z=\varepsilon_\phi\sin\phi+\mathcal O(\|\boldsymbol\varepsilon\|^2),\tag{75}
$$

这意味着 $\Delta_x=\mathcal O(\|\boldsymbol\varepsilon\|)$（$x\in\{y,z\}$）。进一步，由（42）与（43），对固定 $N$ 有

$$
D_N(\Delta)=N-\frac{\pi^2}{24}N\left(N^2-1\right)\Delta^2+\mathcal O(\Delta^4),\tag{76}
$$

$$
Q_N(\Delta)=-\mathrm j\frac{\pi}{12}N\left(N^2-1\right)\Delta+\mathcal O(\Delta^3).\tag{77}
$$

把（76）—（77）代入（39）—（41）并整理得

$$
|g_0|^2\approx N_t^2-N_t\delta_a(\boldsymbol\varepsilon),
\qquad
g_\psi=q_\psi(\boldsymbol\varepsilon)+\mathcal O(\|\boldsymbol\varepsilon\|^2),\tag{78}
$$

其中 $\delta_a(\boldsymbol\varepsilon)\triangleq\|\mathbf a(\theta,\phi)-\mathbf a(\hat\theta,\hat\phi)\|^2$、$q_\psi(\boldsymbol\varepsilon)\triangleq\dot{\mathbf a}_\psi^H(\mathbf a(\hat\theta,\hat\phi)-\mathbf a(\theta,\phi))$。$|g_\psi|^2$ 的贡献在很大程度上被（24）—（25）中涉及 $\hat c_{\psi\tilde\beta_s}$ 的项抵消，其残余为相对阶 $\mathcal O(N_r^{-1})$，故被省略。把（78）用于（29）—（32）得

$$
\hat c_\psi(\boldsymbol\varepsilon)\approx\hat c_\psi(0)-\chi_s|\beta_s|^2N_t\delta_a(\boldsymbol\varepsilon)\|\dot{\mathbf b}_\psi\|^2,\tag{79}
$$

$$
\hat c_{\theta\phi}(\boldsymbol\varepsilon)\approx\hat c_{\theta\phi}(0)-\chi_s|\beta_s|^2N_t\delta_a(\boldsymbol\varepsilon)\dot{\mathbf b}_\theta^H\dot{\mathbf b}_\phi.\tag{80}
$$

由（24）与（25）定义 $I_\psi(\boldsymbol\varepsilon)\triangleq\left(\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon)\right)^{-1}=T_\psi(\boldsymbol\varepsilon)-S^2(\boldsymbol\varepsilon)/T_{\psi_c}(\boldsymbol\varepsilon)$，其中当 $\psi=\theta$ 时 $\psi_c=\phi$、当 $\psi=\phi$ 时 $\psi_c=\theta$。这里 $T_\psi(\boldsymbol\varepsilon)$ 与 $S(\boldsymbol\varepsilon)$ 由（24）与（25）经代数整理得到，且 $r_{\mathrm{den},\psi}\triangleq T_\psi(0)$、$r_{\mathrm{num}}\triangleq S(0)$。具体地，

$$
T_\psi(\boldsymbol\varepsilon)\approx r_{\mathrm{den},\psi}-\rho\chi_s|\beta_s|^2N_t\delta_a(\boldsymbol\varepsilon)\|\dot{\mathbf b}_\psi\|^2,\tag{81}
$$

$$
S(\boldsymbol\varepsilon)\approx r_{\mathrm{num}}-\rho\chi_s|\beta_s|^2N_t\delta_a(\boldsymbol\varepsilon)\dot{\mathbf b}_\theta^H\dot{\mathbf b}_\phi.\tag{82}
$$

把（81）—（82）代入 $I_\psi(\boldsymbol\varepsilon)$ 得 $I_\psi(\boldsymbol\varepsilon)\approx I_\psi(0)-\rho\chi_s|\beta_s|^2N_t\delta_a(\boldsymbol\varepsilon)\left\|\dot{\mathbf b}_\psi-r_\psi\dot{\mathbf b}_{\psi_c}\right\|^2$，其中 $r_\psi=r_{\mathrm{num}}/r_{\mathrm{den},\psi_c}$。最后，由 $\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon)=\left(I_\psi(\boldsymbol\varepsilon)\right)^{-1}$，对小的 $y$ 使用一阶 Taylor 展开 $(x-y)^{-1}\approx\frac1x+\frac{y}{x^2}$，即得（45）。

### 附录 D：定理 2 的证明

对 $\psi\in\{\theta,\phi\}$ 与 $x>0$，$\mathrm{CRLB}_\psi^{\mathrm{bf}}$ 的 CDF 为

$$
F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(x)\triangleq\Pr\left\{\mathrm{CRLB}_\psi^{\mathrm{bf}}\le x\right\}
=\Pr\left\{\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}}\ge\frac1x\right\}
=\mathbb E_{\boldsymbol\varepsilon}\left\{\mathbb 1\left\{\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho,\boldsymbol\varepsilon)}-\frac1x\ge0\right\}\right\},\tag{83}
$$

其中 $\mathbb 1\{\cdot\}$ 表示指示函数，即当 $u\ge0$ 时 $\mathbb 1\{u\ge0\}=1$、否则为 0。为记号简洁，记 $\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon)\triangleq\mathrm{CRLB}_\psi^{\mathrm{bf}}(\vartheta,\boldsymbol\gamma,\rho,\boldsymbol\varepsilon)$。假设 $\varepsilon_\theta$ 与 $\varepsilon_\phi$ 相互独立，则（83）可写为

$$
F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(x)=\int_{\mathcal A_\theta}\int_{\mathcal A_\phi}\mathbb 1\left\{\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon)}\ge\frac1x\right\}f_\theta(\varepsilon_\theta)f_\phi(\varepsilon_\phi)\,\mathrm d\varepsilon_\theta\,\mathrm d\varepsilon_\phi
$$

$$
\approx\int_{\mathcal A_\theta}\int_{\mathcal A_\phi}\varsigma_\psi^{\mathrm{bf}}\left(\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon)}-\frac1x\right)f_\theta(\varepsilon_\theta)f_\phi(\varepsilon_\phi)\,\mathrm d\varepsilon_\theta\,\mathrm d\varepsilon_\phi,\tag{84}
$$

其中 $\mathcal A_\psi$ 与 $f_\psi$ 分别表示 $\varepsilon_\psi$ 的积分范围与概率密度函数（PDF）。（84）中的近似由 $\mathbb 1\{u\ge0\}\approx\varsigma(u)\triangleq(1+e^{-\varrho u})^{-1}$（$\varrho>0$）[32] 得到，而积分用 Gauss 求积求解：

**1）高斯情形：** 对 $\varepsilon_\psi\sim\mathcal N(0,\sigma_\psi^2)$，利用变量替换 $\varepsilon_\psi=\sqrt2\sigma_\psi u_\psi$ 有 $f_\psi(\varepsilon_\psi)\mathrm d\varepsilon_\psi=\frac{1}{\sqrt\pi}e^{-u_\psi^2}\mathrm du_\psi$。把该 PDF 代入（84）得

$$
F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(x)\approx\frac1\pi\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}\varsigma_\psi^{\mathrm{bf}}\left(\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon_G)}-\frac1x\right)e^{-u_\theta^2-u_\phi^2}\mathrm du_\theta\mathrm du_\phi,\tag{85}
$$

其中 $\boldsymbol\varepsilon_G=[\sqrt2\sigma_\theta u_\theta,\sqrt2\sigma_\phi u_\phi]^T$。对（85）应用 Gauss–Hermite（GH）求积规则 $\int_{-\infty}^{\infty}e^{-u^2}g(u)\mathrm du\approx\sum_iw_i^{\mathrm{GH}}g(z_i^{\mathrm{GH}})$ [33]，即得高斯情形下的（47）。

**2）广义均匀情形：** 利用 $\varepsilon_\psi=(\pi/U_\psi)u_\psi$，均匀分布误差的 PDF 满足 $f_\psi(\varepsilon_\psi)\mathrm d\varepsilon_\psi=\frac12\mathrm du_\psi$，$u_\psi\in[-1,1]$。把该 PDF 代入（84）得

$$
F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(x)\approx\frac14\int_{-1}^{1}\int_{-1}^{1}\varsigma_\psi^{\mathrm{bf}}\left(\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon_U)}-\frac1x\right)\mathrm du_\theta\mathrm du_\phi,\tag{86}
$$

其中 $\boldsymbol\varepsilon_U=[(\pi/U_\theta)u_\theta,(\pi/U_\phi)u_\phi]^T$。对（86）应用 Gauss–Legendre（GL）求积规则 $\int_{-1}^{1}g(u)\mathrm du\approx\sum_iw_i^{\mathrm{GL}}g(z_i^{\mathrm{GL}})$ [33]，即得均匀情形下的（47）。

**3）von Mises 情形：** 对 $f_\psi(\varepsilon_\psi)=\frac{e^{\kappa_\psi\cos(\varepsilon_\psi)}}{2\pi I_0(\kappa_\psi)}$（$\varepsilon_\psi\in[-\pi,\pi]$），利用 $\varepsilon_\psi=\pi u_\psi$ 有 $f_\psi(\varepsilon_\psi)\mathrm d\varepsilon_\psi=e^{\kappa_\psi\cos(\pi u_\psi)}(2I_0(\kappa_\psi))^{-1}\mathrm du_\psi$，$u_\psi\in[-1,1]$。把该 PDF 代入（84）得

$$
F_{\mathrm{CRLB}\psi}^{\mathrm{bf}}(x)\approx\frac{1}{4I_0(\kappa_\theta)I_0(\kappa_\phi)}\int_{-1}^{1}\int_{-1}^{1}\varsigma_\psi^{\mathrm{bf}}\left(\frac{1}{\mathrm{CRLB}_\psi^{\mathrm{bf}}(\boldsymbol\varepsilon_{\mathrm{VM}})}-\frac1x\right)
\times e^{\kappa_\theta\cos(\pi u_\theta)}e^{\kappa_\phi\cos(\pi u_\phi)}\mathrm du_\theta\mathrm du_\phi,\tag{87}
$$

其中 $\boldsymbol\varepsilon_{\mathrm{VM}}=[\pi u_\theta,\pi u_\phi]^T$。对（87）应用 GL 求积，即得 von Mises 情形下的（47）。

## 参考文献（英文原书目）

[1] F. Liu, Y.-F. Liu, A. Li, C. Masouros, and Y. C. Eldar, "Cramér-Rao bound optimization for joint radar-communication beamforming," IEEE Trans. Signal Process., vol. 70, pp. 240–253, 2021.
[2] B. Liao, H. Q. Ngo, M. Matthaiou, and P. J. Smith, "Power allocation for massive MIMO-ISAC systems," IEEE Trans. Wireless Commun., pp. 1–1, 2024.
[3] N. T. Nguyen et al., "Performance analysis and power allocation for massive MIMO ISAC systems," IEEE Trans. Signal Process., vol. 73, pp. 1691–1707, 2025.
[4] H. Chen, M. Li, A. Pourafzal, H. Huang, Y. Ge, S. S. Petersen, M. Shen, G. C. Alexandropoulos, and H. Wymeersch, "Mismatch analysis and cooperative calibration of array beam patterns for ISAC systems," arXiv preprint arXiv:2602.01293, 2026.
[5] L. Xu, J. Li, and P. Stoica, "Target detection and parameter estimation for MIMO radar systems," IEEE Trans. Aerosp. Electron. Syst., vol. 44, no. 3, pp. 927–939, 2008.
[6] Q. He and R. S. Blum, "Cramer–Rao bound for MIMO radar target localization with phase errors," IEEE Signal Process. Lett., vol. 17, no. 1, pp. 83–86, 2009.
[7] N. D. Tran et al., "MIMO radar in the presence of modeling errors: A Cramér-Rao bound investigation," in Proc. IEEE Int. Conf. Acoust., Speech, Signal Processing. IEEE, 2011, pp. 2780–2783.
[8] W. Jia et al., "Unimodular transmit sequence design for FDA-MIMO radar in the presence of mismatched target steering vectors," IEEE Trans. Antennas Propag., vol. 73, no. 1, pp. 161–173, 2024.
[9] Y. Geng, T. H. Cheng, K. Zhong, K. C. Teh, and Q. Wu, "Joint beamforming for CRB-constrained IRS-aided ISAC system via product manifold methods," IEEE Trans. Wireless Commun., vol. 24, no. 1, pp. 691–705, 2024.
[10] M. Bian, Y. Shi, and X.-L. Huang, "Fundamental CRB-Rate Trade-Off in ISAC systems under correlated communication-sensing channel," IEEE Trans. Commun., 2025.
[11] Y. Guo, Y. Gu, M. Wang, and B. Xia, "Fundamental limits for ISAC: CRB-Rate bound and bound-achieving input distribution," IEEE Trans. Wireless Commun., 2025.
[12] Z. Guang, Y. Liu, Q. Wu, Y.-F. Liu, and Q. Shi, "Communication aided sensing for RIS assisted MU-MIMO system: CRB optimization with guaranteed ergodic rate," IEEE Trans. Signal Process., 2025.
[13] S. Uniyal, N. T. Nguyen, G. Kumar, M. Di Renzo, and M. Juntti, "Sum rate and Cramér-Rao lower bound analysis for RIS-assisted multiuser large-antenna ISAC," in Proc. IEEE Wireless Commun. and Networking Conf. IEEE, 2025, pp. 1–6.
[14] X. Gan et al., "Coverage and rate analysis for integrated sensing and communication networks," IEEE J. Sel. Areas Commun., vol. 42, no. 9, pp. 2213–2227, 2024.
[15] M. Soltani, M. Mirmohseni, and R. Tafazolli, "On stochastic fundamental limits in a downlink integrated sensing and communication network," IEEE Trans. Commun., 2025.
[16] F. Xia et al., "Symbiotic sensing and communication: Framework and beamforming design," IEEE Trans. Wireless Commun., vol. 24, no. 3, pp. 2417–2434, 2025.
[17] T. Fang, M. Ma, M. Juntti, N. Shlezinger, A. L. Swindlehurst, and N. T. Nguyen, "Optimal ISAC beamforming structure and efficient algorithms for sum rate and CRLB balancing," IEEE Trans. Signal Process., 2026.
[18] S. Zargari, D. Galappaththige, C. Tellambura, and H. V. Poor, "A riemannian manifold approach to constrained resource allocation in ISAC," IEEE Trans. Commun., vol. 73, no. 5, pp. 3655–3670, 2024.
[19] H. T. Nguyen et al., "Energy efficiency for massive MIMO integrated sensing and communication systems," IEEE J. Sel. Areas Commun., pp. 1–1, 2025.
[20] O. A. Topal, Ö. T. Demir, E. Björnson, and C. Cavdar, "Multi-target integrated sensing and communications in massive MIMO systems," IEEE Wireless Commun. Lett., vol. 14, no. 2, pp. 345–349, 2024.
[21] K. Meng, K. Han, C. Masouros, and L. Hanzo, "Network-level ISAC: An analytical study of antenna topologies ranging from massive to cell-free MIMO," IEEE Trans. Wireless Commun., vol. 24, no. 12, pp. 10 003–10 018, 2025.
[22] W. Lyu et al., "Dual-robust integrated sensing and communication: Beamforming under CSI imperfection and location uncertainty," IEEE Wireless Commun. Lett., vol. 13, no. 11, pp. 3124–3128, 2024.
[23] H. Chen, M. F. Keskin, S. R. Aghdam, H. Kim, S. Lindberg, A. Wolfgang, T. E. Abrudan, T. Eriksson, and H. Wymeersch, "Modeling and analysis of OFDM-based 5G/6G localization under hardware impairments," IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7319–7333, 2023.
[24] Z. Wang et al., "Over-the-air array calibration of mmWave phased array in beam-steering mode based on measured complex signals," IEEE Trans. Antennas Propag., vol. 69, no. 11, pp. 7876–7888, 2021.
[25] Y.-Y. Hsieh, Y.-C. Liao, Y.-J. Yang, and Y.-W. P. Hong, "Robust beamforming for integrated sensing and communication with angle uncertainty," in Proc. IEEE Int. Conf. Commun. IEEE, 2025, pp. 4032–4037.
[26] R. Zhang et al., "Joint MMSE and CRB-based robust beamforming design for monostatic ISAC systems with channel uncertainty," IEEE Trans. Commun., vol. 74, pp. 3120–3131, 2026.
[27] S. Uniyal, T. Fang, M. D. Renzo, M. Juntti, and N. T. Nguyen, "Performance analysis and joint beamforming for hybrid RIS-aided massive MIMO ISAC," 2026. [Online]. Available: https://arxiv.org/abs/2608.02169
[28] H. Q. Ngo, E. G. Larsson, and T. L. Marzetta, "Energy and spectral efficiency of very large multiuser MIMO systems," IEEE Trans. Commun., vol. 61, no. 4, pp. 1436–1449, 2013.
[29] K. Yu, "3-D localization error analysis in wireless networks," IEEE Trans. Wireless Commun., vol. 6, no. 10, pp. 3472–3481, 2007.
[30] A. Aubry, P. Babu, P. Braca, A. De Maio, and K. Panwar, "Sensor placement strategies for target localization via 3-D AOA measurements," IEEE Trans. Aerosp. Electron. Syst., vol. 61, no. 2, pp. 2134–2148, 2024.
[31] S. Uniyal, N. T. Nguyen, G. Kumar, M. Di Renzo, and M. Juntti, "Outage, symbol error probability, and rate of RIS-assisted MIMO systems with phase errors," IEEE Trans. Commun., 2026.
[32] Y. Shi, A. Konar, N. D. Sidiropoulos, X.-P. Mao, and Y.-T. Liu, "Learning to beamform for minimum outage," IEEE Trans. Signal Process., vol. 66, no. 19, pp. 5180–5193, 2018.
[33] M. Abramowitz, Handbook of Mathematical Functions, With Formulas, Graphs, and Mathematical Tables. USA: Dover Publications, Inc., 1974.
[34] M. D. Renzo, A. Guidotti, and G. E. Corazza, "Average rate of downlink heterogeneous cellular networks over generalized fading channels: A stochastic geometry approach," IEEE Trans. Commun., vol. 61, no. 7, pp. 3050–3071, 2013.
[35] Y. Sun, P. Babu, and D. P. Palomar, "Majorization-minimization algorithms in signal processing, communications, and machine learning," IEEE Trans. Signal Process., vol. 65, no. 3, pp. 794–816, 2016.
[36] T.-V. Nguyen et al., "Short-packet communications in multihop networks with WET: Performance analysis and deep learning-aided optimization," IEEE Trans. Wireless Commun., vol. 22, no. 1, pp. 439–456, 2022.
[37] S. Boyd and L. Vandenberghe, Convex Optimization. Cambridge, U.K.: Cambridge University Press, 2004.
[38] H. Guo, Y.-C. Liang, J. Chen, and E. G. Larsson, "Weighted sum-rate maximization for reconfigurable intelligent surface aided wireless networks," IEEE Trans. Wireless Commun., vol. 19, no. 5, pp. 3064–3076, 2020.

**本页范围与校对状态：** 本页覆盖 arXiv:2609.18467v1（eess.SP）全文 14 页：摘要、第 I—VI 节、图 1—7 图注、算法 1、定理 1—3 与推论 1—3、附录 A—D（式（65）—（87））、参考文献 [1]—[38]（英文原条目，按原编号保留）。原文为 arXiv 预印本，该版本未在正文给出作者单位与邮箱，全文无编号表格，故本页未设表格与单位信息。精度相关处理：用 `render.py` 渲染 PDF 第 1、5、7 页并按图像核对式（18）—（44）、（46）—（52）及作者/标题信息。未发现需单独加注的原文数值矛盾或笔误；正文所有数值（295.5%、85.8%、60%/63%/62%、45%、−60 至 −45 dB 等）均按原文照录。未做逐句逐式的字符级终校（公式上下标、编号交叉引用、表格外的数值独立复算均未做）；图内曲线未数字化转写，图注只给出图中设置与关键结论。因此本页不标记为已验收全文；若需核对具体公式或数值，请以 [原文 PDF](https://arxiv.org/pdf/2609.18467v1) 为准。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
