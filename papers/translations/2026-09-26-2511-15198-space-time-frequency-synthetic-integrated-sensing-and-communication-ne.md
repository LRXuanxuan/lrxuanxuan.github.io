---
layout: page
title: "空时频合成一体化感知与通信｜中文全文译文"
permalink: /papers/translations/2026-09-26-2511-15198-space-time-frequency-synthetic-integrated-sensing-and-communication-ne/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/aec5e22f4f692b2d/) · [原文 arXiv](https://arxiv.org/abs/2511.15198) · [全部目录](/papers/catalog/)

# 空时频合成一体化感知与通信

**原题：** Space-Time-Frequency Synthetic Integrated Sensing and Communication Networks  
**作者：** Henglin Pu、Xuefeng Wang、Lu Su、Husheng Li  
**版本：** arXiv:2511.15198v1（eess.SP），2025-11-19，原文 13 页。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VII 节（含 III-A/B/C、IV-A/B、V-A/B、VI-A/B 全部小节）、结论、附录 A–B（FIM 详细推导与正交性证明）、图 1–8 图注、算法 1（TSIF）逐行、基金与作者单位说明、参考文献 [1]–[26]（英文原条目）按原文结构录入；原文无表格。逐句逐式终校未做。

## 摘要

集成感知与通信（integrated sensing and communication，ISAC）通过共享波形、频谱与硬件来跨感知与数据链路实现高频谱与高功率效率。然而商业蜂窝网络因孔径、带宽与相干观测时间受限，难以提供精细的角度、距离与多普勒分辨率。本文提出一种**空—时—频合成 ISAC 架构**，融合来自分布式发射机与接收机、跨时间区间与频段的观测。我们为多基地与单基地配置建立统一信号模型，推导位置与速度估计的 Cramér–Rao 下界（Cramér–Rao lower bound，CRLB）。分析揭示空间分集、多频段工作与观测调度如何影响 Fisher 信息。我们还比较集中式最大似然估计器（maximum likelihood estimator，MLE）与两阶段信息融合（two-stage information fusion，TSIF）方法的估计性能；后者先估计每条路径的时延与径向速度，再通过 Gauss–Newton 算法求解加权非线性最小二乘问题加以融合。数值结果表明 MLE 在高信噪比（signal-to-noise ratio，SNR）区接近 CRLB，而两阶段方法在中高 SNR 下仍有竞争力、低 SNR 时性能退化。一个核心发现是：**完全合成的网络级处理是必要的**，因为先由各基站（base station，BS）单独估计再融合的做法始终较差，且在低 SNR 下不稳定。该框架为将现有通信基础设施升级为密集感知网络提供了实用指导。

**索引词：** ISAC、合成雷达、多基地感知、CRLB、跳频、传感器融合。

## I. 引言

集成感知与通信（ISAC）[1]–[3] 近年因有望显著提升无线系统的频谱与功率效率而备受关注，已成为下一代无线网络（尤其 6G）的主要主题之一。ISAC 在单一系统基础设施内统一感知与通信，复用共享的频谱与硬件资源；这种集成简化系统部署，并支持环境监测 [4]、自动驾驶 [5]、人机交互 [6] 与智慧城市 [7] 等变革性应用。

在单基地感知中，ISAC 收发机利用反射电磁波推断周围反射体的信息；当通信接收机用接收信号进行感知时，该配置称为**双基地感知**；若多个接收机参与感知（借助 ISAC 的通信能力协作），系统实现**多基地感知**；当多个发射机共同照射环境并捕获散射信号时，该配置构成多输入多输出（multiple-input multiple-output，MIMO）雷达感知系统。在这些配置中，通信与感知在同一电磁波发射周期内完成。由于单一波形同时服务两种用途，带宽与功率消耗显著降低，从而支持需要同时通信与感知的信息物理系统，如自动驾驶与无人机（unmanned aerial vehicle，UAV）网络控制。

由于 ISAC 本质上是把雷达与通信功能集成在共享硬件系统中，部署 ISAC 的一条商业可行路径是利用现有通信基础设施。全球通信塔市场 2024 年达 493 万座，并预计到 2033 年增长至 590 万座 [8]，庞大的已部署基站为附加感知能力提供了巨大潜力，从而支持广泛的实际应用。虽然利用通信网络进行大规模感知的商业收益明确，但关键挑战在于**雷达感知需求与商用通信设备能力之间的错配**。高分辨率感知需要大孔径、宽带宽与长观测时间，而这些特性通常是典型通信硬件难以提供的。

- **精细角度分辨率需要大孔径：** 实现精细角度分辨率需要物理上大孔径。然而商用基站天线尺寸受限，用户设备天线更小，限制了可达波束成形增益。
- **精细距离分辨率需要大带宽：** 高距离分辨率需要宽信号带宽，而当前 5G 系统通常仅提供数百兆赫兹 [9]，远低于亚米级测距所需的多吉赫兹带宽。
- **精细多普勒分辨率需要长时间持续：** 同样，精细多普勒分辨率需要长相干观测时间。然而通信信号往往突发且间歇，难以维持精确速度估计所需的时长。

现有 ISAC 研究通常只处理其中一两个维度，未实现统一的空—时—频合成系统。为弥补该空白，我们提出受合成孔径雷达（synthetic aperture radar，SAR）启发的**空—时—频合成 ISAC 网络**，融合分布式部署于不同位置、工作于异构频段、并跨交错时间区间的多个通信设备的测量。示意如图 1。目标是通过汇集跨分布式基站、跨交错时间区间、跨多个载波频段的测量，组装更大的虚拟感知孔径，同时保持与商用通信协议栈兼容。在频率上，我们通过在一组非连续分量载波上调度跳频来合成带宽；在 5G NR 中这可通过同步信号块（synchronization signal block，SSB）与载波聚合自然支持，使感知可在无需硬件改动的情况下搭载于对业务友好的资源上。在时间上，我们通过拼接跨连续帧与时隙采集的慢时间脉冲串来合成更长相干观测：每个脉冲经过时间参考与相位参考，使聚合的相干处理间隔（coherent processing interval，CPI）在振荡器与信道相干限制内表现为扩展的相干孔径。在空间上，我们通过部署多个基站与用户设备、从不同角度照射与观测共同反射体来合成孔径。每条发射—接收路径贡献由其几何决定的时延与多普勒信息，网络级信息为各路径之和。然而跨不同基站的相干合成颇具挑战，因为感知所需的相位对齐远比通信严格。在基站相距较远的大网络中，在感知容差内共享相位参考往往不切实际。因此我们采用**自相干但基站间非相干**的模型：每个基站在自身脉冲与调度载波之间保持内部相位相干，而来自不同基站的测量在组合时不假设共同相位参考。每个基站执行匹配滤波与波形分离，然后转发复慢时间快照（供完全合成最大似然处理）或带协方差的紧凑逐路径时延与径向速度摘要（供两阶段信息融合 TSIF）。该设计复用现有无线电与调度器，随基站数量与布局扩展，并以适度的时频分集换取距离与多普勒分辨率的大幅合成增益。本文主要贡献概括如下：

- 我们提出统一的空—时—频合成 ISAC 架构，融合来自分布式发射机与接收机、跨时间区间与频段的观测，并可在无需硬件改动的情况下部署于现有通信基础设施。
- 我们建立覆盖多基地与单基地配置的信号模型，推导联合位置与速度估计的闭式 CRLB，并量化合成带宽、相干时间与基站几何如何影响估计精度。分析揭示跳频诱导的时延—速度耦合，并据此得出结论：在该耦合下，应优先增加合成带宽而非延长 CPI 时间。
- 我们提出两阶段信息融合估计器：先估计逐路径时延与径向速度，再通过求解加权非线性最小二乘问题加以融合。与直接作用于网络级原始测量的集中式 MLE 相比，融合方法在中高 SNR 下有竞争力，但在低 SNR 下退化，凸显完全合成处理的必要性，而非先逐基站单独估计再融合。

全文其余部分组织如下：第 II 节综述相关工作；第 III 节介绍通用系统模型，第 IV 节详细推导 CRLB，第 V 节描述 MLE 与 TSIF 等估计方法，第 VI 节给出数值结果，第 VII 节总结。

## II. 相关工作

为缓解通信基础设施对 ISAC 的限制，已有若干研究方向。阵列孔径扩展方面，协作与分布式 ISAC 架构让多个空间分离节点共同模拟更大虚拟阵列。[10] 提出无基站 ISAC 波束成形，其中分布式接入点共同服务用户并感知目标，推导多基地感知 SNR 并优化联合感知/通信预编码器，这是 ISAC 空间合成的典型例子。后续无基站 ISAC 研究分析可扩展检测/跟踪、功率控制与分布式接入点下的多基地检测，强调协调需求与空间分集收益 [11]–[13]。[14] 的 DISAC 愿景主张分布式、智能 ISAC 与跨节点传感器融合，把同步与校准提升为首要设计关注。[15] 为分布式 ISAC 发展空口时频同步，利用多基地互易性在无需严格视距（line-of-sight，LoS）的情况下估计载波频率偏移（carrier frequency offset，CFO）。

当缺乏宽连续频谱时，跳频与多频段设计可有效合成宽带观测。Wan 等 [16] 分析基于 OFDM 的多频段 ISAC，量化分辨率极限并给出在管理相位失真因子的同时拼接非连续频段的算法。Tagliaferri 等 [17]、[18] 在时延—多普勒（双）域把感知分量叠加到 OFDM 上，在保持通信兼容性的同时提升距离—多普勒分辨率。HiSAC [19] 演示多频段 ISAC 原型，通过融合非连续载波（如载波聚合）实现超分辨被动测距，相对基线取得 3–20 倍改善。[20] 的综述文献总结多载波 ISAC，并在非理想性与共享频谱约束下系统化波形/处理，这对在商用协议栈上设计带宽合成很有用。

另一类工作处理短时或突发传输下的多普勒分辨率。Islam 等 [21] 提出带混合模数波束成形的全双工毫米波 ISAC，在发射的同时感知，以严格自干扰抑制为代价提升 CPI 效率。[22]、[23] 通过相干补偿技术与资源占用感知波形设计，研究长距离回波与突发性下的 OFDM-ISAC 处理，以保持多普勒与模糊性能。

## III. 系统模型

考虑由 $M$ 个发射机与 $N$ 个接收机组成的分布式 ISAC 网络。网络以自相干但节点间非相干方式运行：每个 ISAC 基站保持自身脉冲之间的内部相位相干，而不同基站之间不假设共同相位参考。发射与接收 ISAC 节点位于二维平面 $(x,y)$：$M$ 个发射机任意位于坐标 $\mathbf t_k=(x_{t_k},y_{t_k})$（$k=1,\ldots,M$），$N$ 个接收机任意位于 $\mathbf r_\ell=(x_{r_\ell},y_{r_\ell})$（$\ell=1,\ldots,N$）。多基地发射—接收路径总数为 $L=MN$。本文聚焦单目标场景：目标位于未知位置 $\mathbf x=[x\ \ y]^T\in\mathbb R^2$，以未知常速度 $\mathbf v=[v_x\ \ v_y]^T\in\mathbb R^2$ 运动。多目标扩展留待未来工作。我们同时考虑多基地与单基地设置；下文总是从多基地情形开始，因为它更一般，可通过调整几何直接特化到单基地情形。

### A. 目标—路径参数

对每个发射—接收对 $(k,\ell)$，多基地时延为

$$
\tau_{k\ell}(\mathbf x)=\frac{1}{c}\left(\left\|\mathbf x-\mathbf t_k\right\|+\left\|\mathbf x-\mathbf r_\ell\right\|\right), \tag{1}
$$

其中 $c$ 为光速。相应多基地多普勒频移为

$$
f_{k\ell}(\mathbf v)=\frac{f_c}{c}\left(\mathbf u_{t,k}+\mathbf u_{r,\ell}\right)^T\mathbf v, \tag{2}
$$

其中 $f_c$ 为载频，$\mathbf u_{t,k}$ 为从目标指向发射机 $k$ 的单位向量，$\mathbf u_{r,\ell}$ 为从目标指向接收机 $\ell$ 的单位向量。显式地，

$$
\mathbf u_{t,k}=\begin{bmatrix}\cos\phi_k\\ \sin\phi_k\end{bmatrix},\qquad\mathbf u_{r,\ell}=\begin{bmatrix}\cos\varphi_\ell\\ \sin\varphi_\ell\end{bmatrix}, \tag{3}
$$

其中 $\phi_k$ 与 $\varphi_\ell$ 分别为从目标到第 $k$ 个发射机与第 $\ell$ 个接收机的方位角。为方便起见，定义路径几何向量

$$
\mathbf g_{k\ell}\triangleq\mathbf u_{t,k}+\mathbf u_{r,\ell}, \tag{4}
$$

它将用于后续 CRLB 推导。

### B. 发射波形

与实用 ISAC 部署一致，假设每个发射机 $k$ 采用多载波通信波形，具体为 OFDM。每个发射机 $k$ 发射基带波形 $s_k(t)$，假定为中等带宽，有效（均方根）带宽为 $\beta_k$。令 $S_k(f)$ 表示 $s_k(t)$ 的 Fourier 变换，则有效带宽 $\beta_k$ 定义为 [24]

$$
\beta_k^2=\frac{\int_{W_k}f^2\left|S_k(f)\right|^2df}{\int_{W_k}\left|S_k(f)\right|^2df}, \tag{5}
$$

其中 $W_k$ 为占用频带。假设波形相互正交：

$$
\int s_k(t)s_m^*(t)\,dt=0,\qquad k\ne m, \tag{6}
$$

从而接收机匹配滤波后可分离不同发射机的回波而不产生交叉项。该假设显著简化 Fisher 信息矩阵（Fisher information matrix，FIM）结构，后续推导可见。

我们用"快时间"表示用于距离采样的脉冲内时间，用"慢时间"表示一个 CPI 内的脉冲索引。在含 $P_k$ 个慢时间脉冲（$p=1,\ldots,P_k$，标称时刻 $\{t_{k,p}\}$，脉冲重复间隔（pulse repetition interval，PRI）$T_{r,k}$）的 CPI 内，发射机 $k$ 在其标称频带附近使用跳频载波序列 $f_{c,p}^k$。令 $s_p^k(t)$ 对应一个 OFDM 感知块，通常由分配给发射机 $k$ 在第 $p$ 跳的预设计导频符号（以及按需的已知通信符号）构成。则一个 CPI 内的基带发射信号为

$$
s^k(t)=\sum_{p=1}^{P_k}s_p^k\left(t-pT_r\right)e^{j2\pi f_{c,p}^kt}. \tag{7}
$$

每次跳频为窄带，而 $\{f_{c,p}^k\}_{p=1}^{P_k}$ 的并集在频率上合成大得多的有效带宽。该合成发生在多个慢时间脉冲上，从而同时扩展有效相干观测时间并自然增强速度（多普勒）估计能力。注意在跳频方案下，各时隙内基站占用不重叠频带内的互不相交 OFDM 子载波集合；因此发射波形具有互不相交的频谱支撑，并在快时间匹配滤波器下正交。

### C. 接收信号模型

对每条路径 $(k,\ell)$，我们在慢时间上采集 $P_{k\ell}$ 个脉冲，发射时刻为 $t_{k\ell,p}$（$p=0,\ldots,P_{k\ell}-1$，$t_{k\ell,p}=pT_{r,k}$，PRI 为 $T_{r,k}$）。经与正交波形 $s_p^k(t)$ 匹配滤波后，第 $(k,\ell)$ 条路径在第 $p$ 个脉冲的复基带接收信号为

$$
y_{k\ell}[p]=\alpha_{k\ell}s_p^k\left(\tau_{k\ell}\right)e^{-j2\pi f_{c,p}^{k\ell}\tau_{k\ell}}e^{j2\pi f_{D,p}^{k\ell}t_{k\ell,p}}+w_{k\ell}[p], \tag{8}
$$

其中多普勒频移为 $f_{D,p}^{k\ell}=\frac{f_{c,p}^{k\ell}}{c}\mathbf u_{k\ell}^T\mathbf v$，$\alpha_{k\ell}$ 为未知复路径增益，$f_{c,p}^{k\ell}$ 表示 $t_{k\ell,p}$ 处的中心频率，$w_{k\ell}[p]\sim\mathcal{CN}(0,\sigma_w^2)$ 为圆复高斯噪声，在传感器与脉冲间独立。在每个基站内我们假设相干处理间隔，因此所有慢时间相位演化由时延—频率项 $e^{-j2\pi f_{c,p}^{k\ell}\tau_{k\ell}}$ 与多普勒项 $e^{j2\pi f_{D,p}^{k\ell}t_{k\ell,p}}$ 显式捕获；其余与基站相关的相位偏移（本振（local oscillator，LO）与射频（radio frequency，RF）链相位、目标反射相位）不随 $p$ 变化，被吸收进常值复增益 $\alpha_{k\ell}=|\alpha_{k\ell}|e^{j\phi_{k\ell}}$。

## IV. 感知的 CRLB

CRLB 为任何无偏估计器的均方误差（mean squared error，MSE）提供下界。设观测向量 $\mathbf r$ 与似然 $p(\mathbf r\mid\boldsymbol\theta)$，则 Fisher 信息矩阵为

$$
\mathbf J(\boldsymbol\theta)=\mathbb E_{\mathbf r\mid\boldsymbol\theta}\left\{\left[\frac{\partial}{\partial\boldsymbol\theta}\log p(\mathbf r\mid\boldsymbol\theta)\right]\left[\frac{\partial}{\partial\boldsymbol\theta}\log p(\mathbf r\mid\boldsymbol\theta)\right]^T\right\}, \tag{9}
$$

其中 $\mathbb E_{\mathbf r\mid\boldsymbol\theta}\{\cdot\}$ 表示条件期望。CRLB 矩阵定义为

$$
\mathbf C_{\mathrm{CRLB}}=\mathbf J^{-1}(\boldsymbol\theta). \tag{10}
$$

有时更容易计算关于另一向量 $\boldsymbol\eta$ 的 FIM，再应用链式法则导出原始 $\mathbf J(\boldsymbol\theta)$。在我们的情形中，由于接收信号 (8) 是时延 $\tau_{k\ell}$、多普勒频移 $f_{k\ell}$ 与复幅度的函数，由链式法则，$\mathbf J(\boldsymbol\theta)$ 可写成如下替代形式 [25]：

$$
\mathbf J(\boldsymbol\theta)=\mathbf P\mathbf J(\boldsymbol\eta)\mathbf P^T, \tag{11}
$$

其中 $\boldsymbol\eta$ 为未知参数向量，包含时延与多普勒频移；$\mathbf J(\boldsymbol\eta)$ 为关于 $\boldsymbol\eta$ 的 FIM；矩阵 $\mathbf P$ 为 Jacobian：

$$
\mathbf P=\frac{\partial\boldsymbol\eta}{\partial\boldsymbol\theta}. \tag{12}
$$

下面分别建立多基地与单基地情形的 CRLB。

### A. 多基地设置下的 CRLB

未知参数向量定义为

$$
\boldsymbol\theta=\left[\mathbf x\ \ \mathbf v\ \ \Re\{\boldsymbol\alpha\}\ \ \Im\{\boldsymbol\alpha\}\right]^T, \tag{13}
$$

其中 $\boldsymbol\alpha=[\alpha_{11},\ldots,\alpha_{MN}]^T$ 堆叠复幅度，$\Re\{\cdot\}$ 与 $\Im\{\cdot\}$ 表示复值向量/矩阵的实部与虚部。注意我们把复增益表示为实部与虚部，使参数向量为实值——这使 FIM 为实矩阵，并可通过 Schur 补消去冗余增益。我们先用时延而非位置参数化未知量，再用 (11) 的链式法则把 Fisher 信息映射回位置估计，从而简化推导。中间参数为

$$
\boldsymbol\eta=\left[\boldsymbol\tau\ \ \mathbf v\ \ \Re\{\boldsymbol\alpha\}\ \ \Im\{\boldsymbol\alpha\}\right]^T, \tag{14}
$$

其中 $\boldsymbol\tau=[\tau_{11},\ldots,\tau_{MN}]^T$ 堆叠 $L$ 个时延。

**1）逐路径 Fisher 信息。** 我们先推导可观测量的逐路径 FIM（时延与速度）关于中间参数的形式。对第 $k$ 个发射机与第 $\ell$ 个接收机路径，多基地时延见 (1)，$\tau_{k\ell}(\mathbf x)$ 关于 $\mathbf x$ 的梯度为

$$
\nabla_{\mathbf x}\tau_{k\ell}(\mathbf x)=\frac{1}{c}\left(\mathbf u_{t,k}+\mathbf u_{r,\ell}\right). \tag{15}
$$

同一路径的多普勒频移见 (2)，$f_{k\ell}(\mathbf v)$ 关于 $\mathbf v$ 的梯度为

$$
\nabla_{\mathbf v}f_{k\ell}(\mathbf v)=\frac{f_c}{c}\left(\mathbf u_{t,k}+\mathbf u_{r,\ell}\right). \tag{16}
$$

两个导数共享 (4) 中的几何向量 $\mathbf g_{k\ell}$。具体地，

$$
\nabla_{\mathbf x}\tau_{k\ell}(\mathbf x)=\frac{1}{c}\mathbf g_{k\ell},\qquad\nabla_{\mathbf v}f_{k\ell}(\mathbf v)=\frac{f_c}{c}\mathbf g_{k\ell}. \tag{17}
$$

这种结构对称性在简化 FIM 中起核心作用：定位与速度信息矩阵继承相同的几何加权 $\mathbf g_{k\ell}\mathbf g_{k\ell}^T$，仅信号相关尺度因子不同。因此位置与速度的最终 CRLB 自然共享 (4) 中的几何矩阵 $\mathbf g_{k\ell}$，而与逐路径信号强度和处理增益解耦。

现在推导单条发射—接收路径贡献的 Fisher 信息；由波形正交性，网络级 Fisher 信息随后由各路径求和得到。考虑任意一条路径（省略 $k,\ell$ 下标），复基带观测模型为

$$
\mathbf y=\boldsymbol\mu(\boldsymbol\eta)+\mathbf w,\qquad\mathbf w\sim\mathcal{CN}\left(\mathbf 0,\sigma_w^2\mathbf I\right), \tag{18}
$$

其中（记号略作滥用）逐路径参数向量为 $\boldsymbol\eta$，定义为

$$
\boldsymbol\eta\triangleq\left[\tau\ \ \mathbf v\ \ \Re\{\alpha\}\ \ \Im\{\alpha\}\right]^T. \tag{19}
$$

令 $\mathbf s(\tau)\in\mathbb C^{N_t}$ 表示匹配滤波后的快时间向量（相关峰附近样本）。把慢时间与快时间堆叠，均值可分离：

$$
\begin{aligned}
\boldsymbol\mu(\boldsymbol\eta)&=\alpha\left[\left(\mathbf d(\mathbf v)\odot\mathbf a(\tau)\right)\otimes\mathbf s(\tau)\right],\\
\mathbf d(\mathbf v)&=\left[e^{j2\pi f_{D,0}t_0},\ldots,e^{j2\pi f_{D,P-1}t_{P-1}}\right]^T,\\
\mathbf a(\tau)&=\left[e^{-j2\pi f_{c,0}\tau},\ldots,e^{-j2\pi f_{c,P-1}\tau}\right]^T.
\end{aligned}\tag{20}
$$

我们采用实参数的标准复高斯 FIM：

$$
\left[\mathbf J(\boldsymbol\eta)\right]_{ij}=\frac{2}{\sigma_w^2}\Re\left\{\left(\frac{\partial\boldsymbol\mu}{\partial\eta_i}\right)^H\left(\frac{\partial\boldsymbol\mu}{\partial\eta_j}\right)\right\}. \tag{21}
$$

定义快时间能量及其时延导数范数：

$$
E_s\triangleq\left\|\mathbf s(\tau)\right\|_2^2,\qquad\left\|\partial_\tau\mathbf s(\tau)\right\|_2^2=4\pi^2\beta^2E_s, \tag{22}
$$

其中 $\beta$ 为发射波形的（均方根）有效带宽。对慢时间，定义求和

$$
S_0=\sum_{p=0}^{P-1}1=P,\qquad S_1=\sum_{p=0}^{P-1}t_p,\qquad S_2=\sum_{p=0}^{P-1}t_p^2. \tag{23}
$$

则中心化方差可写为

$$
\mathrm{Var}_t\triangleq S_2-\frac{S_1^2}{S_0}=\sum_{p=0}^{P-1}\left(t_p-\bar t\right)^2,\qquad\bar t=\frac{S_1}{S_0}. \tag{24}
$$

我们还定义载波矩

$$
F_1=\sum_{p=0}^{P-1}f_{c,p},\qquad F_2=\sum_{p=0}^{P-1}f_{c,p}^2,\qquad\mathrm{Var}_f=\frac{F_2}{P}-\left(\frac{F_1}{P}\right)^2, \tag{25}
$$

以及混合序列 $z_p=t_pf_{c,p}$ 的方差 $\mathrm{Var}_z=\frac{1}{P}\sum_{p=0}^{P-1}z_p^2-\left(\frac{1}{P}\sum_{p=0}^{P-1}z_p\right)^2$。由 (20) 与乘积法则，

$$
\frac{\partial\boldsymbol\mu}{\partial\Re\{\alpha\}}=\left(\mathbf d(\mathbf v)\odot\mathbf a(\tau)\right)\otimes\mathbf s(\tau), \tag{26}
$$

$$
\frac{\partial\boldsymbol\mu}{\partial\Im\{\alpha\}}=j\left(\mathbf d(\mathbf v)\odot\mathbf a(\tau)\right)\otimes\mathbf s(\tau), \tag{27}
$$

$$
\frac{\partial\boldsymbol\mu}{\partial\tau}=\alpha\left[\left(\mathbf d(\mathbf v)\odot\mathbf a(\tau)\right)\otimes\partial_\tau\mathbf s(\tau)+\left(\mathbf d(\mathbf v)\odot\partial_\tau\mathbf a(\tau)\right)\otimes\mathbf s(\tau)\right], \tag{28}
$$

$$
\frac{\partial\boldsymbol\mu}{\partial\mathbf v}=\alpha\left[\left(\partial_{\mathbf v}\mathbf d(\mathbf v)\odot\mathbf a(\tau)\right)\otimes\mathbf s(\tau)\right]. \tag{29}
$$

应用 (21) 并利用 Kronecker 恒等式，可得：

（i）幅度—幅度块（实/虚基）：

$$
\mathbf J_{\alpha\alpha}=\frac{2}{\sigma_w^2}S_0E_s\mathbf I_2=\frac{2PE_s}{\sigma_w^2}\mathbf I_2, \tag{30}
$$

其中 $\mathbf I_2$ 表示 $2\times2$ 单位阵。

（ii）时延—时延元素：

$$
J_{\tau\tau}=\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\left(\beta^2P+F_2\right). \tag{31}
$$

（iii）速度—速度元素：

$$
\mathbf J_{\mathbf v\mathbf v}=\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\sum_p\left(\frac{f_{c,p}t_p}{c}\right)^2\mathbf g\mathbf g^T. \tag{32}
$$

（iv）时延—幅度与速度—幅度交叉项：

$$
\mathbf J_{\tau\alpha}=\frac{4\pi E_s}{\sigma_w^2}F_1\left[-\Im\{\alpha^*\},-\Re\{\alpha^*\}\right],\qquad
\mathbf J_{\mathbf v\alpha}=\frac{4\pi E_s}{\sigma_w^2}S_1\begin{bmatrix}\Im\{\alpha\}\\-\Re\{\alpha\}\end{bmatrix}\mathbf g^T. \tag{33}
$$

时延—幅度与速度—幅度交叉块可通过一种可逆重参数化（对载波中心与慢时间轴重新中心化）无损地消除。

**a）载波中心化（从时延相位中去除平均载波）。** 定义平均载波

$$
\bar f_c\triangleq\frac{1}{P}\sum_{p=0}^{P-1}f_{c,p}, \tag{34}
$$

并重参数化

$$
\tilde\alpha\triangleq\alpha e^{-j2\pi\bar f_c\tau},\qquad\tilde a_p(\tau)\triangleq e^{-j2\pi(f_{c,p}-\bar f_c)\tau}. \tag{35}
$$

该映射为双射且保持均值向量不变：$\alpha a_p(\tau)=\tilde\alpha\tilde a_p(\tau)$ 对所有 $p$ 成立。在新坐标下 $\sum_p(f_{c,p}-\bar f_c)=0$，故 $F_1=0$，于是时延—幅度交叉块消失：

$$
\mathbf J_{\tau\alpha}=\mathbf 0. \tag{36}
$$

**b）慢时间中心化（平移时间原点）。** 定义慢时间质心

$$
\bar t\triangleq\frac{1}{P}\sum_{p=0}^{P-1}t_p, \tag{37}
$$

并平移采样时刻

$$
\tilde t_p\triangleq t_p-\bar t,\qquad\tilde d_p(\mathbf v)=e^{j2\pi f_{D,p}\tilde t_p},\qquad\tilde\alpha\leftarrow\tilde\alpha e^{j2\pi f_{D,\mathrm{ref}}\bar t}, \tag{38}
$$

其中 $f_{D,\mathrm{ref}}$ 为任意参考多普勒（公共因子被吸收进 $\tilde\alpha$）。该重参数化同样是双射且保持似然不变；它强制 $\sum_p\tilde t_p=0$，即 $S_1=0$，从而消除速度—幅度交叉块：

$$
\mathbf J_{\mathbf v\alpha}=\mathbf 0. \tag{39}
$$

（v）时延—速度交叉项：

$$
\mathbf J_{\tau\mathbf v}=-\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\frac{1}{c}\left(\sum_pt_pf_{c,p}^2\right)\mathbf g^T. \tag{40}
$$

FIM (30)–(33) 与 (40) 的详细导数见附录 A。

**2）消去 $\boldsymbol\alpha$ 后的中间 FIM。** 现通过 Schur 补消去未知复幅度，并跨全部路径组装中间 FIM。如前一小节，先考虑任意单条路径（省略下标），再通过跨路径求和扩展到整个网络。发射波形正交性意味着逐路径 FIM 无交叉项相加，这在附录 B 中证明。

给定 (19) 的逐路径参数向量，块形式的逐路径 FIM 为

$$
\mathbf J(\boldsymbol\eta)=\begin{bmatrix}\mathbf J_{\tau\tau}&\mathbf J_{\tau\mathbf v}&\mathbf J_{\tau\alpha}\\\mathbf J_{\mathbf v\tau}&\mathbf J_{\mathbf v\mathbf v}&\mathbf J_{\mathbf v\alpha}\\\mathbf J_{\alpha\tau}&\mathbf J_{\alpha\mathbf v}&\mathbf J_{\alpha\alpha}\end{bmatrix}. \tag{41}
$$

$(\boldsymbol\tau,\mathbf v)$ 子空间中的消幅信息由 Schur 补给出：

$$
\mathbf J_{(\tau,\mathbf v)|\alpha}=\begin{bmatrix}\mathbf J_{\tau\tau}&\mathbf J_{\tau\mathbf v}\\\mathbf J_{\mathbf v\tau}&\mathbf J_{\mathbf v\mathbf v}\end{bmatrix}-\begin{bmatrix}\mathbf J_{\tau\alpha}\\\mathbf J_{\mathbf v\alpha}\end{bmatrix}\mathbf J_{\alpha\alpha}^{-1}\begin{bmatrix}\mathbf J_{\alpha\tau}&\mathbf J_{\alpha\mathbf v}\end{bmatrix}. \tag{42}
$$

把 (30)–(40) 代入 (42) 得：

$$
J_{\tau|\alpha}=\frac{8\pi^2}{\sigma_w^2}|\tilde\alpha|^2E_sP\left(\beta^2+\mathrm{Var}_f\right),\qquad
\mathbf J_{\mathbf v|\alpha}=\frac{8\pi^2}{\sigma_w^2}|\tilde\alpha|^2E_s\frac{P}{c^2}\left(\mathrm{Var}_z+\mathbb E[z]^2\right)\mathbf g\mathbf g^T. \tag{43}
$$

即使在中心化 $F_1=0$、$S_1=0$ 之后，跳频诱导的 $\tau$—速度耦合通常仍然存在：

$$
\mathbf J_{\tau\mathbf v|\alpha}=-\frac{8\pi^2}{\sigma_w^2}|\hat\alpha|^2E_s\frac{P}{c}\mathrm{Cov}\left(t,f_c^2\right)\mathbf g^T,\qquad\mathrm{Cov}\left(t,f_c^2\right)=\frac{1}{P}\sum_pt_pf_{c,p}^2\ \ (\bar t=0). \tag{44}
$$

为后续紧凑起见，定义逐路径信号权重

$$
w^{(\tau)}\triangleq\frac{8\pi^2}{\sigma_w^2}|\alpha|^2PE_s\left(\beta^2+\mathrm{Var}_f\right),\quad
w^{(\mathrm v)}\triangleq\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\frac{P}{c^2}\mathrm{Var}_z,\quad
w^{(\times)}\triangleq-\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\frac{P}{c}\mathrm{Cov}\left(t,f_c^2\right). \tag{45}
$$

**3）跨路径组装 FIM。** 令 $\mathcal L=\{(k,\ell):k=1,\ldots,M,\ \ell=1,\ldots,N\}$ 索引 $L=MN$ 条路径，并堆叠中间参数 $\boldsymbol\eta=[\boldsymbol\tau,\mathbf v]^T$，其中 $\boldsymbol\tau=[\tau_{k\ell}]_{(k,\ell)\in\mathcal L}$、$\mathbf v=[\mathbf v_{k\ell}]_{(k,\ell)\in\mathcal L}$。波形正交性意味着消幅后的中间 FIM 跨路径以及时延与多普勒之间为块对角：

$$
\mathbf J_{\eta|\alpha}=\begin{bmatrix}\mathbf J_{\tau\tau|\alpha}&\mathbf J_{\tau\mathbf v|\alpha}\\\mathbf J_{\mathbf v\tau|\alpha}&\mathbf J_{\mathbf v\mathbf v|\alpha}\end{bmatrix},\quad
\mathbf J_{\tau\tau|\alpha}=\mathrm{diag}\left(w_{k\ell}^{(\tau)}\right)_{(k,\ell)\in\mathcal L}\in\mathbb R^{L\times L},\quad
\mathbf J_{\mathbf v\mathbf v|\alpha}=\sum_{(k,\ell)\in\mathcal L}w_{k\ell}^{(\mathrm v)}\mathbf g_{k\ell}\mathbf g_{k\ell}^T\in\mathbb R^{2\times2},\quad
\mathbf J_{\tau\mathbf v|\alpha}=\left[w_{k\ell}^{(\times)}\mathbf g_{k\ell}^T\right]_{(k,\ell)\in\mathcal L}\in\mathbb R^{L\times2}. \tag{46}
$$

这里 $w_{k\ell}^{(\tau)}$、$w_{k\ell}^{(\mathrm v)}$ 与 $w_{k\ell}^{(\times)}$ 由 (45) 用第 $(k,\ell)$ 条路径的相应数值得到。因此消幅后的中间 FIM 在 $(\boldsymbol\tau,\mathbf v)$ 坐标下是对角矩阵，其元素可清晰地分解为信号相关权重。

**4）链式法则。** (46) 中的中间 FIM $\mathbf J_{\eta|\alpha}$ 以逐路径时延与速度参数刻画信息；然而最终目标是感兴趣物理参数——目标位置 $\mathbf x=[x\ \ y]^T$ 与速度 $\mathbf v=[v_x\ \ v_y]^T$ 的 CRLB。映射 $\boldsymbol\eta\mapsto(\mathbf x,\mathbf v)$ 是确定性的，FIM 通过链式法则在重参数化下变换：

$$
\mathbf J_{\mathbf x,\mathbf v}=\mathbf G^T\mathbf J_{\eta|\alpha}\mathbf G, \tag{47}
$$

其中

$$
\mathbf G\triangleq\frac{\partial\boldsymbol\eta}{\partial\left[\mathbf x^T\ \ \mathbf v^T\right]}=\begin{bmatrix}\frac{\partial\boldsymbol\tau}{\partial\mathbf x}&\mathbf 0\\\mathbf 0&\mathbf 1\end{bmatrix}. \tag{48}
$$

各路径时延关于位置的偏导数见 (17)。跨全部路径汇集得

$$
\frac{\partial\boldsymbol\tau}{\partial\mathbf x}=\frac{1}{c}\begin{bmatrix}\mathbf g_{11}^T\\\vdots\\\mathbf g_{MN}^T\end{bmatrix}\in\mathbb R^{L\times2}. \tag{49}
$$

由于 $\mathbf J_{\eta|\alpha}$ 块对角且时延与多普勒子块独立，(47) 给出

$$
\mathbf J_{\mathbf x,\mathbf v}=\begin{bmatrix}\frac{1}{c^2}\sum_{(k,\ell)}w_{k\ell}^{(\tau)}\mathbf g_{k\ell}\mathbf g_{k\ell}^T&\frac{1}{c}\sum_{(k,\ell)}w_{k\ell}^{(\times)}\mathbf g_{k\ell}\mathbf g_{k\ell}^T\\\frac{1}{c}\sum_{(k,\ell)}w_{k\ell}^{(\times)}\mathbf g_{k\ell}\mathbf g_{k\ell}^T&\sum_{(k,\ell)}w_{k\ell}^{(\mathrm v)}\mathbf g_{k\ell}\mathbf g_{k\ell}^T\end{bmatrix}. \tag{50}
$$

当交叉权重消失（所有 $(k,\ell)$ 有 $w_{k\ell}^{(\times)}=0$）时，各块解耦，通常的几何加权 $2\times2$ 逆即给出闭式 CRLB；否则，耦合 CRLB 由 (50) 的 $2\times2$ Schur 补得到。

利用 (50) 中组装的中间 Fisher 矩阵，定义几何加权和：

$$
\mathbf G_x\triangleq\sum_{(k,\ell)\in\mathcal L}w_{k\ell}^{(\tau)}\mathbf g_{k\ell}\mathbf g_{k\ell}^T, \tag{51}
$$

$$
\mathbf G_v\triangleq\sum_{(k,\ell)\in\mathcal L}w_{k\ell}^{(\mathrm v)}\mathbf g_{k\ell}\mathbf g_{k\ell}^T, \tag{52}
$$

$$
\mathbf G_\times\triangleq\sum_{(k,\ell)\in\mathcal L}w_{k\ell}^{(\times)}\mathbf g_{k\ell}\mathbf g_{k\ell}^T. \tag{53}
$$

则 $(\mathbf x,\mathbf v)$ FIM 可紧凑写为

$$
\mathbf J_{\mathbf x,\mathbf v}=\begin{bmatrix}\frac{1}{c^2}\mathbf G_x&\frac{1}{c}\mathbf G_\times\\\frac{1}{c}\mathbf G_\times&\mathbf G_v\end{bmatrix}. \tag{54}
$$

矩阵 $\mathbf G_x$、$\mathbf G_v$ 为对称半正定（positive semidefinite，PSD），$\mathbf G_\times$ 为对称阵；当每条路径满足 $\mathrm{Cov}_{k\ell}(t,f_c^2)=0$ 时 $\mathbf G_\times=\mathbf 0$。

**定理 1（多基地情形闭式 CRLB）。** (54) 中的 $(\mathbf x,\mathbf v)$ FIM 可写为

$$
\mathbf J_{\mathbf x,\mathbf v}=\begin{bmatrix}\mathbf A&\mathbf B\\\mathbf B^\top&\mathbf C\end{bmatrix},\qquad\mathbf A=\frac{1}{c^2}\mathbf G_x,\quad\mathbf B=\frac{1}{c}\mathbf G_\times,\quad\mathbf C=\mathbf G_v, \tag{55}
$$

其中 $\mathbf G_x,\mathbf G_v,\mathbf G_\times\in\mathbb R^{2\times2}$ 分别为位置、速度与耦合几何矩阵。假设网络几何使 $\mathbf G_x\succ0$、$\mathbf G_v\succ0$（满秩），则 CRLB 矩阵为 $\mathbf J_{\mathbf x,\mathbf v}^{-1}$，其各块具有闭式

$$
\begin{aligned}
\mathrm{CRLB}(\mathbf x)&=\left(\mathbf A-\mathbf B\mathbf C^{-1}\mathbf B^\top\right)^{-1}=\left(\frac{1}{c^2}\left[\mathbf G_x-\mathbf G_\times\mathbf G_v^{-1}\mathbf G_\times\right]\right)^{-1},\\
\mathrm{CRLB}(\mathbf v)&=\left(\mathbf C-\mathbf B^T\mathbf A^{-1}\mathbf B\right)^{-1}=\left(\mathbf G_v-c^2\mathbf G_\times\mathbf G_x^{-1}\mathbf G_\times\right)^{-1}.
\end{aligned}\tag{56}
$$

此外，由于 $\mathbf G_\times\mathbf G_v^{-1}\mathbf G_\times^\top\succeq0$、$\mathbf G_\times^\top\mathbf G_x^{-1}\mathbf G_\times\succeq0$，该耦合严格降低位置与速度两者的边缘信息，给出界

$$
\mathrm{CRLB}(\mathbf x)\succeq c^2\mathbf G_x^{-1},\qquad\mathrm{CRLB}(\mathbf v)\succeq\mathbf G_v^{-1}, \tag{57}
$$

当且仅当 $\mathbf G_\times=\mathbf 0$ 时取等。

**5）讨论。** 在合成空—时—频设计中，(56) 的 CRLB 表明位置与速度精度由合成带宽、慢时间跨度与网络几何共同控制。与传统雷达/ISAC 设置中时延（距离）与多普勒基本解耦不同，本设计中的跳频使时延与速度耦合，因此加宽合成带宽不仅锐化时延分辨率，也通过更高载波水平增强速度信息。相比之下，延长慢时间跨度主要有利于速度，对位置的增益较温和。实践中，带宽往往在两项界上都带来更大的总体下降，而额外 CPI 提供更稳定的改善。几何仍然关键：增加位置良好的基站并使观测角多样化可减轻精度稀释，且前几个战略性布站收益最大。

**位置（时延）灵敏度：** 时延信息随匹配滤波的有效快时间斜率强烈增长，因此信息的位置块随有效带宽平方（即随 $\beta^2$）放大。扩展合成时间 $T_{\mathrm{syn}}$ 主要增加脉冲数 $P$（近乎线性增益），而增加合成带宽 $B_{\mathrm{syn}}$ 既放大 $\beta$ 又提高载波频率 $\sum_pf_{c,p}^2$，带来显著更大的改善。

**速度（多普勒）灵敏度：** 运动目标每个脉冲累积的相位约为 $\phi_p\approx2\pi(f_{c,p}/c)\mathbf u^\top\mathbf v\,t_p$，故速度信息随 $P\sum_pt_p^2f_{c,p}^2$ 缩放。增加慢时间跨度 $t_p$ 或工作在更高载波 $f_{c,p}$ 都增强信息的速度块。$T_{\mathrm{syn}}$ 固定时，加宽 $B_{\mathrm{syn}}$ 均匀抬高全部 $f_{c,p}^2$ 项，对速度 CRLB 有显著增益；$B_{\mathrm{syn}}$ 固定时，更长孔径仍通过 $t_p^2$ 累积获益。

### B. 单基地设置下的 CRLB

本节把多基地表述特化到单基地情形：每个同址雷达对发射、且只有自身接收机观测回波。快/慢时间信号模型、正交性假设与复高斯 FIM 与第 IV-A 节相同，仅几何映射与路径集合改变。为简洁，我们省略重复推导，只给出所需替换与所得 Fisher 信息与 CRLB。

设有 $L$ 个同址对，由 $\ell\in\{1,\ldots,L\}$ 索引，传感器位置为 $\mathbf s_\ell\in\mathbb R^2$。记目标位置 $\mathbf x\in\mathbb R^2$、速度 $\mathbf v\in\mathbb R^2$、距离 $r_\ell=\|\mathbf x-\mathbf s_\ell\|$、单位视距（LOS）

$$
\mathbf u_\ell\triangleq\frac{\mathbf x-\mathbf s_\ell}{\|\mathbf x-\mathbf s_\ell\|}\in\mathbb R^2. \tag{58}
$$

对单基地传播有

$$
\tau_\ell(\mathbf x)=\frac{2r_\ell}{c},\qquad\nabla_{\mathbf x}\tau_\ell(\mathbf x)=\frac{2}{c}\mathbf u_\ell^T,\qquad f_{D,\ell p}(\mathbf x,\mathbf v)=\frac{2f_{c,\ell p}}{c}\mathbf u_\ell^T\mathbf v,\qquad\nabla_{\mathbf v}f_{D,\ell p}(\mathbf x,\mathbf v)=\frac{2f_{c,\ell p}}{c}\mathbf u_\ell^T, \tag{59}
$$

其中 $f_{c,\ell p}$ 为第 $\ell$ 对在慢时间索引 $p$ 上所用（可能跳频的）载波。相对于多基地几何向量 $\mathbf g_{k\ell}=\mathbf u_{t,k}+\mathbf u_{r,\ell}$，单基地情形相当于替换 $\mathbf g_\ell=2\mathbf u_\ell$，且路径集合从全部 $(k,\ell)$ 缩减为存活的 $\ell$。于是单基地情形的几何加权和为

$$
\bar{\mathbf G}_x\triangleq4\sum_{\ell=1}^{L}w_\ell^{(\tau)}\mathbf u_\ell\mathbf u_\ell^T,\qquad
\bar{\mathbf G}_v\triangleq4\sum_{\ell=1}^{L}w_\ell^{(\mathrm v)}\mathbf u_\ell\mathbf u_\ell^T,\qquad
\bar{\mathbf G}_\times\triangleq4\sum_{\ell=1}^{L}w_\ell^{(\times)}\mathbf u_\ell\mathbf u_\ell^T. \tag{60}
$$

用 (59) 的链式法则，$\left[\mathbf x^T\ \ \mathbf v^T\right]^T$ 的联合 Fisher 信息变为

$$
\mathbf J_{\mathbf x,\mathbf v}^{(\mathrm{mono})}=\begin{bmatrix}\frac{1}{c^2}\bar{\mathbf G}_x&\frac{1}{c}\bar{\mathbf G}_\times\\\frac{1}{c}\bar{\mathbf G}_\times&\bar{\mathbf G}_v\end{bmatrix}. \tag{61}
$$

与多基地表达式相比有两处直接差异：(i) 求和只遍历存活的单基地路径 $\ell$；(ii) 每个外积带因子 4，因为 $\mathbf g_\ell=2\mathbf u_\ell$。

**推论 1（单基地情形 CRLB）。** 在单位视距向量 $\mathbf u_\ell$ 的单基地设置中，双基地方向退化为 $\mathbf g_\ell=2\mathbf u_\ell$；把 (60) 代入定理 1 即得单基地 CRLB。特别地，若 $\bar{\mathbf G}_\times=\mathbf 0$，则 $\mathrm{CRLB}(\mathbf x)=c^2\bar{\mathbf G}_x^{-1}$、$\mathrm{CRLB}(\mathbf v)=\bar{\mathbf G}_v^{-1}$。

## V. 估计算法

本节给出合成 ISAC 网络的参数估计方法，比较两种策略：一是完全非相干 MLE，通过最大化跨基站聚合测量的似然联合估计目标状态；二是两阶段信息融合方法，先形成逐基站（逐路径）估计，再融合得到最终状态。

### A. 最大似然估计

给定 (8) 的接收信号，我们先对已知发射波形 $s^k(t)$ 做快时间匹配滤波，并在相应相关峰附近采样；该操作把快时间维度压缩为每个脉冲的单个复充分统计量。跨 $P$ 个慢时间脉冲堆叠这些样本，第 $(k,\ell)$ 条路径产生长度为 $P$ 的慢时间观测向量

$$
\mathbf y_{k\ell}=\alpha_{k\ell}\boldsymbol\phi_{k\ell}(\mathbf x,\mathbf v)+\mathbf w_{k\ell},\qquad\mathbf w_{k\ell}\sim\mathcal{CN}\left(\mathbf 0,\sigma_w^2\mathbf I_P\right), \tag{62}
$$

其中慢时间导向矢量为

$$
\left[\boldsymbol\phi_{k\ell}(\mathbf x,\mathbf v)\right]_p=e^{\left(-j2\pi f_{c,p}^{k\ell}\tau_{k\ell}(\mathbf x)\right)}e^{\left(j2\pi t_pf_{D,p}^{k\ell}\right)}, \tag{63}
$$

其中 $f_{D,p}^{k\ell}=\frac{f_{c,p}^{k\ell}}{c}\mathbf g_{k\ell}^T\mathbf v$。匹配滤波后，快时间波形形状被吸收进标量增益 $\alpha_{k\ell}$，而时延与多普勒诱导的慢时间结构由 $\boldsymbol\phi_{k\ell}$ 捕获。

假设路径间统计独立、路径内噪声为独立同分布圆高斯，则对数似然为

$$
\mathcal L(\mathbf x,\mathbf v,\boldsymbol\alpha)=\frac{1}{\sigma_w^2}\sum_{(k,\ell)\in\mathcal L}\left\|\mathbf y_{k\ell}-\alpha_{k\ell}\boldsymbol\phi_{k\ell}(\mathbf x,\mathbf v)\right\|_2^2. \tag{64}
$$

对固定 $(\mathbf x,\mathbf v)$，对数似然是复标量 $\alpha_{k\ell}$ 的二次函数，故其 MLE 有闭式解：

$$
\hat\alpha_{k\ell}(\mathbf x,\mathbf v)=\frac{\boldsymbol\phi_{k\ell}(\mathbf x,\mathbf v)^H\mathbf y_{k\ell}}{\left\|\boldsymbol\phi_{k\ell}(\mathbf x,\mathbf v)\right\|_2^2}. \tag{65}
$$

把 (65) 代回 (64) 可集中似然、消去 $\boldsymbol\alpha$，得到不含增益的目标：

$$
\mathcal J(\mathbf x,\mathbf v)\triangleq-\min_{\boldsymbol\alpha}\mathcal L(\mathbf x,\mathbf v,\boldsymbol\alpha)\overset{c}{=}\sum_{(k,\ell)\in\mathcal L}\frac{\left|\boldsymbol\phi_{k\ell}(\mathbf x,\mathbf v)^H\mathbf y_{k\ell}\right|^2}{\left\|\boldsymbol\phi_{k\ell}(\mathbf x,\mathbf v)\right\|_2^2}, \tag{66}
$$

其中 $\overset{c}{=}$ 表示相差一个与 $(\mathbf x,\mathbf v)$ 无关的加性常数。因此 $(\mathbf x,\mathbf v)$ 的 MLE 为

$$
(\hat{\mathbf x},\hat{\mathbf v})\in\arg\max_{\mathbf x,\mathbf v}\mathcal J(\mathbf x,\mathbf v). \tag{67}
$$

(66) 表明所提估计器是跨路径归一化匹配滤波功率之和，且集中后复路径增益不直接起作用。目标 $\mathcal J(\mathbf x,\mathbf v)$ 一般非凸；为控制计算量，可采用由粗到细（多分辨率）搜索：在粗网格上评估 $\mathcal J$，保留最有前景的区域并迭代精化至收敛 [26]。

### B. 两阶段信息融合（TSIF）

由原始复慢时间数据构造的 MLE 渐近有效，但计算代价可能很高。一种实用替代是先形成逐路径的时延与径向速度中间估计及其误差协方差，再以统计最优方式跨全部路径融合，得到 $(\mathbf x,\mathbf v)$ 的估计；我们称该方法为**两阶段信息融合（TSIF）**。在高斯模型与高 SNR 下，逐路径估计器渐近正态、协方差由 Fisher 信息给出，第二阶段融合使用信息加权非线性最小二乘，具有一致性并达到线性化 CRLB。

**1）阶段 A——逐路径集中 ML。** 对路径 $k$（单基地基站或发/收对），令 $\mathbf y_k\in\mathbb C^P$ 为波形分离后的慢时间样本向量。(8) 中第 $(k,\ell)$ 条路径在第 $p$ 个脉冲的复基带接收信号可改写为

$$
y_k[p]=\alpha_ke^{-j2\pi f_{c,p}^k\tau_k}e^{j2\pi\left(f_{c,p}^k/c\right)r_kt_p}+w_k[p], \tag{68}
$$

其中 $\alpha_k$ 为复幅度，$\tau_k$ 为时延，$r_k\triangleq\mathbf g_k(\mathbf x)^T\mathbf v$ 为径向速度，$\{w_k[p]\}$ 为方差 $\sigma_w^2$ 的圆高斯噪声。定义逐路径导向矢量

$$
\boldsymbol\phi_k(\tau,r)\triangleq\mathbf a_k(\tau)\odot\mathbf d_k(r),\qquad\left[\mathbf a_k(\tau)\right]_p=e^{-j2\pi f_{c,p}^k\tau},\qquad\left[\mathbf d_k(r)\right]_p=e^{j2\pi\left(f_{c,p}^k/c\right)rt_p}. \tag{69}
$$

集中消去 $\alpha_k$ 得到广义似然比检验（generalized likelihood ratio test，GLRT）目标：

$$
\hat\tau_k,\hat r_k\in\arg\max_{\tau,r}\ \Lambda_k(\tau,r)\triangleq\frac{\left|\boldsymbol\phi_k(\tau,r)^H\mathbf y_k\right|^2}{\left\|\boldsymbol\phi_k(\tau,r)\right\|_2^2}. \tag{70}
$$

实用估计使用加窗网格。与第 IV 节在真速度向量 $\mathbf v$ 上表达信息不同，这里用逐路径径向速度 $r_k=\mathbf g_k(\mathbf x)^T\mathbf v$ 重参数化多普勒，几何因子 $\mathbf g_k$ 被 Jacobian 吸收，仅留下慢时间方差与协方差项：

$$
\tilde{\mathbf J}_k=\begin{bmatrix}A_k&-B_k\\-B_k&D_k\end{bmatrix},\quad
A_k=\frac{8\pi^2}{\sigma_w^2}|\tilde\alpha_k|^2E_{s,k}P_k\mathrm{Var}_p\left(f_{c,p}^k\right),\quad
B_k=\frac{8\pi^2}{\sigma_w^2}|\tilde\alpha_k|^2E_{s,k}\frac{P_k}{c}\mathrm{Cov}_p\left(t_p,{f_{c,p}^k}^2\right),\quad
D_k=\frac{8\pi^2}{\sigma_w^2}|\tilde\alpha_k|^2E_{s,k}\frac{P_k}{c^2}\mathrm{Var}_p\left(t_pf_{c,p}^k\right), \tag{71}
$$

其中 $|\tilde\alpha_k|$ 为复幅度，$E_{s,k}$ 为每脉冲能量，方差/协方差在 $p=0,\ldots,P_k-1$ 上取（必要时对 $t_p$ 与 $f_{c,kp}$ 中心化）。逐路径协方差为

$$
\mathbf C_k=\tilde{\mathbf J}_k^{-1}=\begin{bmatrix}\sigma_{\tau,k}^2&\sigma_{\tau r,k}\\\sigma_{\tau r,k}&\sigma_{r,k}^2\end{bmatrix}. \tag{72}
$$

**2）阶段 B——加权 Gauss–Newton 融合。** 堆叠逐路径估计 $\mathbf z_k\triangleq[\hat\tau_k,\hat r_k]^T$，并用如下确定性映射建模：

$$
\mathbf h_k(\mathbf x,\mathbf v)=\begin{bmatrix}\tau_k(\mathbf x)\\r_k(\mathbf x,\mathbf v)\end{bmatrix}=\begin{bmatrix}\frac{1}{c}\left(R_{t,k}(\mathbf x)+R_{r,k}(\mathbf x)\right)\\\mathbf g_k(\mathbf x)^T\mathbf v\end{bmatrix}, \tag{73}
$$

其中 $R_{(\cdot),k}(\mathbf x)$ 为雷达到目标的单程距离，且

$$
\mathbf g_k(\mathbf x)=\begin{cases}\dfrac{2(\mathbf x-\mathbf s_k)}{\|\mathbf x-\mathbf s_k\|},&\text{单基地},\\[8pt]\dfrac{\mathbf x-\mathbf t_k}{\|\mathbf x-\mathbf t_k\|}+\dfrac{\mathbf x-\mathbf r_k}{\|\mathbf x-\mathbf r_k\|},&\text{多基地}.\end{cases}\tag{74}
$$

在当前迭代 $(\mathbf x,\mathbf v)$ 处线性化 $\mathbf h_k$ 得 Jacobian：

$$
\mathbf H_k=\begin{bmatrix}\frac{1}{c}\mathbf g_k(\mathbf x)^T&\mathbf 0_{1\times2}\\\left(\mathbf J_{g,k}(\mathbf x)\mathbf v\right)^T&\mathbf g_k(\mathbf x)^T\end{bmatrix},\qquad
\mathbf J_{g,k}(\mathbf x)=\begin{cases}\dfrac{2}{\|\mathbf x-\mathbf s_k\|}\left(\mathbf I-\hat{\mathbf u}_k\hat{\mathbf u}_k^T\right),&\text{单基地},\\[8pt]\dfrac{\mathbf I-\hat{\mathbf u}_{t,k}\hat{\mathbf u}_{t,k}^T}{R_{t,k}}+\dfrac{\mathbf I-\hat{\mathbf u}_{r,k}\hat{\mathbf u}_{r,k}^T}{R_{r,k}},&\text{双基地},\end{cases}\tag{75}
$$

其中 $\hat{\mathbf u}=\frac{\mathbf x-\mathbf s}{\|\mathbf x-\mathbf s\|}$ 表示雷达到目标的单位向量。取权重 $\mathbf W_k=\mathbf C_k^{-1}$，对 $\boldsymbol\theta\triangleq[\mathbf x^T,\mathbf v^T]^T$ 的一次 Gauss–Newton 步求解正规方程：

$$
\left(\sum_k\mathbf H_k^T\mathbf W_k\mathbf H_k\right)\boldsymbol\delta=\sum_k\mathbf H_k^T\mathbf W_k\left(\mathbf z_k-\mathbf h_k(\mathbf x,\mathbf v)\right). \tag{76}
$$

解出 $\boldsymbol\delta$ 后更新估计 $\boldsymbol\theta\leftarrow\boldsymbol\theta+\boldsymbol\delta$，迭代至收敛。

**算法 1　两阶段信息融合（TSIF）**

- **Require：** 慢时间数据 $\{\mathbf y_k\}_{k=1}^K$、脉冲时刻 $\{t_p\}$、载波 $\{f_{c,kp}\}$、几何 $\{\mathbf s_{(\cdot),k}\}$、噪声方差 $\sigma_w^2$、脉冲能量 $\{E_{s,k}\}$、先验 $(\mathbf x^{(0)},\mathbf v^{(0)})$。
- **阶段 A（逐路径）：** 对每个 $k$：
  - 在先验 $(\tau_{0,k},r_{0,k})$ 附近的窗口上按 (70) 计算 $(\hat\tau_k,\hat r_k)$，并局部精化；
  - 按 (71) 构造 $\tilde{\mathbf J}_k$ 并置 $\mathbf C_k=\tilde{\mathbf J}_k^{-1}$。
- **阶段 B（融合）：** 初始化 $(\mathbf x,\mathbf v)\leftarrow(\mathbf x^{(0)},\mathbf v^{(0)})$，重复：
  - 构造残差 $\mathbf r_k=\begin{bmatrix}\hat\tau_k\\\hat r_k\end{bmatrix}-\mathbf h_k(\mathbf x,\mathbf v)$ 与由 (73)–(75) 得到的 Jacobian $\mathbf H_k$；
  - 求解 (76) 得 $\boldsymbol\delta$ 并更新 $(\mathbf x,\mathbf v)$；
  - 当 $\|\boldsymbol\delta\|$ 与代价下降低于阈值时停止。
- **Ensure：** 融合估计 $(\hat{\mathbf x},\hat{\mathbf v})$。

## VI. 仿真结果

本研究中，我们探索具有特定参数的合成 ISAC 系统。除另有说明，载波为 $f_0=28$ GHz，每脉冲载波在 $f_0$ 附近 $\Delta f_{\max}=2$ GHz 的合成跨度上均匀跳变；慢时间孔径由 $P=12$ 个脉冲组成，脉冲重复间隔 $\mathrm{PRI}=1$ ms。几何上，我们主要考虑 $M=N=3$ 个发射机与接收机置于半径 1000 m 的同心环上的多基地网络；当采用单基地配置时，它由 $L=5$ 个同址收发基站均匀置于半径 1000 m 的圆上组成。真值状态为 $\mathbf x=[300,200]$ m、$\mathbf v=[20,15]$ m/s。我们把每脉冲快时间能量归一化为单位能量并设 $E_s=1$。我们报告 $\mathbb E[\|\hat{\mathbf x}-\mathbf x\|_2^2]$ 与 $\mathbb E[\|\hat{\mathbf v}-\mathbf v\|_2^2]$ 的 Monte Carlo MSEE，并叠加推导的 CRLB；除另有说明，每个 SNR 点在 1000 次独立噪声实现上平均，并使用固定随机种子以确保可复现。注意本文聚焦所提合成策略带来的感知增益；通信功能与传统跳频通信系统相同，因此为清晰与篇幅所限，我们不进一步分析通信性能。

我们首先通过计算多基地与单基地配置下的 CRLB 与经验 MSE 来评估所提模型下的 MLE。注意第 IV 节的 CRLB 分析在确定性波形模型下进行，即假定发射信号在感知接收机处完全已知（如专用雷达波形或已知导频/前导）。然而在真正的 ISAC 场景中，发射信号被随机化以承载通信数据。为量化这种随机性的影响，我们还评估了对应于无条件 FIM 的**数据平均 CRLB**。具体地，对给定系统配置与参数向量 $\boldsymbol\theta$，我们按所用调制格式（如 OFDM 子载波上的 16-QAM）抽取多个独立的通信数据符号实现，生成相应的时域发射波形并计算每次实现的 FIM；数据平均 FIM 则通过对这些实现作 Monte Carlo 平均得到。仿真中我们使用 $N_{\mathrm{sub}}=1024$ 个子载波、子载波间隔 1.62 kHz、16-QAM 调制，并对 $5\times10^3$ 个独立数据实现取平均。所得数据平均 CRLB 与确定性波形 CRLB（以 48 MHz 有效带宽计算，该值对应 OFDM 波形经验平均的有效带宽）比较。图 2 与图 3 分别报告位置与速度的 MSE 随 SNR 变化及相应 CRLB（确定性与数据平均两种设置）。我们观察到通信数据随机性导致的数据平均 CRLB 与确定性 CRLB 高度吻合；因此在后续结果中我们以确定性 CRLB 作为性能基准。如预期，在高 SNR 下 MLE 渐近无偏且 MSE 接近 CRLB；在低 SNR 下旁瓣与噪声越来越严重地破坏性能，使 CRLB 不再紧。在我们的设置中，多基地系统取得比单基地系统更低的 CRLB。原因纯粹是信息量上的：$M=3$ 个发射机与 $N=3$ 个接收机时，多基地阵列提供 $MN=9$ 条独立收发路径，而 $L=3$ 个同址对的单基地阵列只产生 $L=3$ 条自回波路径。由于 Fisher 信息跨独立路径相加，路径更少意味着信息矩阵更小、CRLB 更大。若单基地系统采用更多对或更有利的几何/波形设计，该差距会缩小。

我们随后考察合成带宽与时间的联合效应。先把合成慢时间长度固定为 $P\in\{12,36,64\}$ 个脉冲，扫描合成带宽 $B_{\mathrm{syn}}\in[50,2000]$ MHz；再把 $B_{\mathrm{syn}}\in\{200,1000,2000\}$ MHz 固定，扫描慢时间长度 $P\in[4,64]$ 个脉冲。图 4 的 CRLB 趋势表明，无论固定 $P$ 还是 $B_{\mathrm{syn}}$，增大另一参数都会单调降低位置与速度的 CRLB。为进一步可视化联合权衡空间，我们对每个组合扫描 $(B_{\mathrm{syn}},T_{\mathrm{syn}})\in[50,2000]\ \text{MHz}\times[4,64]\ \text{ms}$，并在多基地与单基地两种配置下计算 CRLB；为便于视觉比较，我们在每种配置内对 CRLB 归一化（图 5）。图 5 表明，固定一个轴增大另一个轴时 CRLB 单调下降：(i) 固定 $B_{\mathrm{syn}}$ 时增大 $T_{\mathrm{syn}}$ 降低 CRLB，对位置增益温和、对速度增益更大；(ii) 固定 $T_{\mathrm{syn}}$ 时加宽 $B_{\mathrm{syn}}$ 使位置与速度都大幅下降。该观察与第 IV-A5 节讨论一致，并给出洞见：当带宽与时间相互竞争时，优先合成带宽通常带来更大的总体回报，因为它平方地增强快时间时延信息，同时通过 $f_{c,p}^2$ 因子增强多普勒灵敏度；而延长时间只提供线性增益。该准则对多基地与单基地 ISAC 方案均成立。

我们还评估基站布站与数量对位置与速度 CRLB 的影响。不失一般性，我们聚焦实践中常见的单基地配置。在 $4\ \text{km}\times4\ \text{km}$ 区域 $[-2000,2000]\ \text{m}\times[-2000,2000]\ \text{m}$ 内考虑 3 与 5 两种基站数量。我们比较对称布局（基站均匀置于半径 1000 m 的圆上，见图 6a，红色三角表示发射机、黑色圆表示同址接收机）与随机布局（见图 6c，基站非均匀分布）。对覆盖该区域的网格上每个位置，我们计算每种布局下位置与速度的 CRLB；位置的热图见图 6。注意未显式给出速度估计性能，因为它与位置结果高度一致：如第 IV 节所述，两者共享相同的几何加权结构，故为清晰起见省略。为可视化与覆盖比较，我们对位置 CRLB 设阈值 $2\times10^{-5}\ \text{m}^2$，并叠加标出 CRLB 低于该阈值的区域轮廓。基站数从 3 增至 5 显著扩大了图 6 中的低于阈值区域，表明位置精度明显改善，速度也有同样趋势。当布局偏离对称（图 6c）时，仍保留若干精度较好的局部区域，但总体覆盖相对圆对称部署收缩；当目标观测角非常受限时，性能显著退化。总之，图 4–6 的结果表明，随着合成带宽、CPI 与基站几何的改善，所提空—时—频合成 ISAC 网络显著提升位置与速度精度，明显优于典型的未合成配置。

最后，我们比较 TSIF 与 MLE 的估计性能。考虑由 5 个基站均匀置于半径 1000 m 圆上的单基地网络，评估位置与速度精度随 SNR 的变化（在独立噪声实现上平均）。图 7 与图 8 的结果显示出清晰趋势：在高 SNR 下，TSIF 在位置与速度上都紧密跟随 MLE，且 MLE 接近相应 CRLB；随着 SNR 降到中等区域，TSIF 开始与 MLE 出现差距。该行为与两种方法的结构一致：TSIF 依赖阶段 A 的逐路径时延与径向速度估计及其协方差，再在阶段 B 用 Gauss–Newton 求解加权非线性最小二乘加以融合；当 SNR 较低时，逐路径估计变噪并偶有失效，其误差分布偏离高斯分布、估计协方差可能被错误指定，从而在融合中放大误差传播。相反，集中式 MLE 直接作用于复慢时间数据并联合拟合全局位置与速度，保留了测量中更多信息结构，对早期判决误差更不敏感。该比较证实了我们的核心发现：当可靠性至关重要时，应优先采用对网络测量进行完全合成处理；而 TSIF 在中等至高 SNR 条件下提供了有用的低复杂度替代，其性能仍接近 MLE。

## VII. 结论

本文建立了融合空、时、频观测以克服孔径、带宽与相干观测时间限制的合成 ISAC 框架。我们为多基地与单基地设置构建统一信号模型，推导联合位置与速度的集中 CRLB，并揭示了跳频诱导的时延与速度耦合，从而阐明观测调度的作用。实验表明集中式 MLE 在高 SNR 下接近该下界，而直接融合各基站估计在低 SNR 下很脆弱。这些发现为密集感知网络给出清晰设计指导：优先对网络级测量进行完全合成处理，优先合成带宽而非增加 CPI，通过多样化基站布站扩大几何孔径，并选择使时间与载波使用去相关的跳频调度。该框架为把现有通信基础设施升级为感知系统提供了基础。

## 附录 A：FIM (30)–(33) 与 (40) 的详细推导

**A.1 幅度—幅度块 $\mathbf J_{\alpha\alpha}$（式 (30)）。** 由 (26)、(27) 及 $\|(\mathbf d\odot\mathbf a)\|_2^2=\sum_p|d_p|^2|a_p|^2=P$，有

$$
J_{\Re\alpha,\Re\alpha}=\frac{2}{\sigma_w^2}\left\|(\mathbf d\odot\mathbf a)\otimes\mathbf s\right\|_2^2=\frac{2}{\sigma_w^2}\left\|(\mathbf d\odot\mathbf a)\right\|_2^2\|\mathbf s\|_2^2=\frac{2}{\sigma_w^2}PE_s, \tag{77}
$$

$$
J_{\Im\alpha,\Im\alpha}=\frac{2}{\sigma_w^2}\left\|j(\mathbf d\odot\mathbf a)\otimes\mathbf s\right\|_2^2=\frac{2}{\sigma_w^2}PE_s, \tag{78}
$$

$$
J_{\Re\alpha,\Im\alpha}=0. \tag{79}
$$

于是由 (21) 得

$$
\mathbf J_{\alpha\alpha}=\frac{2PE_s}{\sigma_w^2}\mathbf I_2. \tag{80}
$$

**A.2 时延—时延元素 $J_{\tau\tau}$（式 (31)）。** 把 (28) 拆分为两个正交部分：$\mathbf u_1=(\mathbf d\odot\mathbf a)\otimes\partial_\tau\mathbf s$、$\mathbf u_2=(\mathbf d\odot\partial_\tau\mathbf a)\otimes\mathbf s$，利用 $\|\partial_\tau\mathbf s\|_2^2=4\pi^2\beta^2E_s$ 与载波相位导数项 $\sum_pf_{c,p}^2$，可得

$$
J_{\tau\tau}=\frac{2}{\sigma_w^2}|\alpha|^2\left(\left\|\mathbf u_1\right\|_2^2+\left\|\mathbf u_2\right\|_2^2\right)=\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\left(\beta^2P+F_2\right),
$$

即主文式 (31)。

**A.3 速度—速度块 $\mathbf J_{\mathbf v\mathbf v}$（式 (32)）。** 由 (29) 与 $\partial_{\mathbf v}\mathbf d(\mathbf v)=j2\pi\frac{f_{c,p}}{c}t_p\,\mathbf d(\mathbf v)$，逐元素计算 $\mathbf J_{\mathbf v\mathbf v}$ 得

$$
\mathbf J_{\mathbf v\mathbf v}=\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\sum_p\left(\frac{f_{c,p}t_p}{c}\right)^2\mathbf g\mathbf g^T.
$$
**A.3 速度—速度块 $\mathbf J_{\mathbf v\mathbf v}$（式 (32)）。** 由 (29) 与 $\partial_{\mathbf v}\mathbf d(\mathbf v)=j2\pi\frac{f_{c,p}}{c}t_p\,\mathbf d(\mathbf v)$，逐元素计算 $\mathbf J_{\mathbf v\mathbf v}$ 得

$$
\mathbf J_{\mathbf v\mathbf v}=\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\sum_p\left(\frac{f_{c,p}t_p}{c}\right)^2\mathbf g\mathbf g^T.
$$

**A.4 幅度交叉项 $\mathbf J_{\tau\alpha}$ 与 $\mathbf J_{\mathbf v\alpha}$（式 (33)）。** 由 (21) 与 (26)–(29) 直接计算交叉内积，利用 $\mathbf d^H\partial_\tau\mathbf a=-j2\pi\sum_pf_{c,p}=-j2\pi F_1$ 与 $\mathbf d^H\partial_{\mathbf v}\mathbf d=j2\pi\sum_p\frac{f_{c,p}}{c}t_p\mathbf g^T$ 的实部/虚部结构，即得 (33)。

**A.5 时延—速度交叉块 $J_{\tau\mathbf v}$（式 (40)）。** 计算 $(\partial_\tau\boldsymbol\mu)^H(\partial_{\mathbf v}\boldsymbol\mu)$ 并取 (21) 中的实部，利用 Kronecker 恒等式与 $\sum_pt_pf_{c,p}^2$ 的展开，得

$$
J_{\tau\mathbf v}=-\frac{8\pi^2}{\sigma_w^2}|\alpha|^2E_s\frac{1}{c}\left(\sum_pt_pf_{c,p}^2\right)\mathbf g^T.
$$

## 附录 B：跨路径 FIM 的可加性

本附录证明发射波形正交性 (6) 蕴含逐路径 FIM 无交叉项相加。由 (6)，不同发射机的波形在匹配滤波后正交，故第 $(k,\ell)$ 条路径的观测似然与第 $(k',\ell')$ 条路径的观测在给定各自参数时独立，且关于公共网络参数 $(\mathbf x,\mathbf v)$ 的联合对数似然为各路径对数似然之和：

$$
\log p\left(\left\{\mathbf y_{k\ell}\right\}\mid\mathbf x,\mathbf v,\boldsymbol\alpha\right)=\sum_{(k,\ell)\in\mathcal L}\log p\left(\mathbf y_{k\ell}\mid\mathbf x,\mathbf v,\alpha_{k\ell}\right).
$$

对 $(\mathbf x,\mathbf v)$ 求二阶导并取期望，交叉项 $\mathbb E\left[\partial_{\theta_i}\log p_{k\ell}\partial_{\theta_j}\log p_{k'\ell'}\right]$ 因路径观测独立而为零，故

$$
\mathbf J_{(\mathbf x,\mathbf v)}=\sum_{(k,\ell)\in\mathcal L}\mathbf J_{(\mathbf x,\mathbf v)}^{k\ell},
$$

即网络级 FIM 为逐路径 FIM 之和，与 (46) 的块对角结构一致。证毕。

## 图注与表注

**图 1：** 空—时—频合成 ISAC 网络示意（含多个 ISAC 基站与 RAN1/RAN2/RAN3 切片，展示跨空间、时间与频率的合成观测）。

**图 2：** MLE 的定位 MSE 与 CRLB 随 SNR 的变化（确定性与数据平均两种情况）。

**图 3：** MLE 的速度 MSE 与 CRLB 随 SNR 的变化。

**图 4：** 多基地与单基地设置下，位置与速度 CRLB 随不同合成时间与带宽的变化：（a）多基地位置；（b）多基地速度；（c）单基地位置；（d）单基地速度（横轴合成带宽 500/1000/1500/2000 MHz，纵轴合成时间 20/40/60 ms）。

**图 5：** 多基地与单基地设置下，位置与速度 CRLB 随合成时间与带宽的联合变化（(a)–(d) 对应与图 4 相同的四种组合，CRLB 按配置归一化）。

**图 6：** 单基地设置下不同基站数与布站的位置 CRLB：（a）3 个基站在均匀圆上；（b）5 个基站在均匀圆上；（c）5 个基站随机布站；红色三角为发射机、黑色圆为同址接收机，并叠加低于 CRLB 阈值区域的轮廓。

**图 7：** MLE 与 TSIF 的定位 MSE 随 SNR 的变化（含 CRLB 与 MLE/TSIF 曲线）。

**图 8：** MLE 与 TSIF 的速度 MSE 随 SNR 的变化。

> **原文说明：** 原文全文不含表格（Table），仅有上述 8 幅图与式 (1)–(80)，因此本页不设表格转写。原文首页脚注给出作者单位（普渡大学电气与计算机工程学院、航空航天学院）与 NSF 基金号（2348826、2343465、2343469、2418106）。

## 参考文献（英文原书目）

以下按原文编号照录英文原书目，条目文字不翻译（依据 arXiv v1 第 12–13 页转录；未逐条核对 DOI）。

[1] F. Liu, Y. Cui, C. Masouros, J. Xu, T. X. Han, Y. C. Eldar, and S. Buzzi, "Integrated sensing and communications: Toward dual-functional wireless networks for 6G and beyond," IEEE J. Sel. Areas Commun., vol. 40, no. 6, pp. 1728–1767, 2022.

[2] S. Lu, F. Liu, Y. Li, K. Zhang, H. Huang, J. Zou, X. Li, Y. Dong, F. Dong, J. Zhu, Y. Xiong, W. Yuan, Y. Cui, and L. Hanzo, "Random ISAC signals deserve dedicated precoding," IEEE Signal Process. Mag., vol. 42, no. 1, pp. 20–36, 2025.

[3] Z. Wei, H. Qu, Y. Wang, X. Yuan, H. Wu, Y. Du, K. Han, N. Zhang, and Z. Feng, "Integrated sensing and communication signals toward 5G-A and 6G: A survey," IEEE Internet Things J., vol. 10, no. 13, pp. 11 068–11 092, 2023.

[4] H. Messer, A. Zinevich, and P. Alpert, "Environmental monitoring by wireless communication networks," Science, vol. 312, no. 5774, pp. 713–713, 2006.

[5] M. N. Ahangar, Q. Z. Ahmed, F. A. Khan, and M. Hafeez, "A survey of autonomous vehicles: Enabling communication technologies and challenges," Sensors, vol. 21, no. 3, p. 706, 2021.

[6] R. Zhang, C. Jiang, S. Wu, Q. Zhou, X. Jing, and J. Mu, "Wi-Fi sensing for joint gesture recognition and human identification from single and multi-user ensembles," IEEE Trans. Wireless Commun., 2023.

[7] H. Habibzadeh, T. Soyata, B. Kantarci, A. Boukerche, and C. Kaptan, "Sensing, communication and security planes: A new challenge for a smart city system design," Computer Networks, vol. 144, pp. 163–200, 2018.

[8] IMARC Group, "Telecom tower market size, share & growth report, 2024–2033," 2024.

[9] 3GPP, "5G; NR; User Equipment (UE) radio transmission and reception; Part 1: Range 1 Standalone," Tech. Rep. TS 38.101-1, 2024.

[10] U. Demirhan and A. Alkhateeb, "Cell-free ISAC MIMO systems: Joint sensing and communication beamforming," IEEE Trans. Commun., 2023.

[11] S. Liesegang, S. Buzzi, and C. D'Andrea, "Scalable integrated sensing and communication for cell-free massive MIMO," IEEE Trans. Wireless Commun., 2024.

[12] D. Galappaththige, M. Mohammadi, G. A. Baduge, and C. Tellambura, "Multi-static ISAC with distributed antennas: Joint detection and power allocation," IEEE Trans. Wireless Commun., 2024.

[13] I. W. G. Da Silva, D. P. M. Osorio, and M. Juntti, "Multi-static ISAC in cell-free massive MIMO: Detection and tracking," in Proc. IEEE ICC, 2024.

[14] E. C. Strinati, G. C. Alexandropoulos, N. Amani, M. Crozzoli, G. Mad…, "Distributed intelligent integrated sensing and communication: The DISAC vision," IEEE Commun. Mag., 2024.

[15] K. Han, K. Meng, and C. Masouros, "Over-the-air time-frequency synchronization for distributed ISAC," IEEE Trans. Wireless Commun., 2025.

[16] Y. Wan, Z. Hu, A. Liu, R. Du, T. X. Han, and T. Q. S. Quek, "OFDM-based multiband ISAC: Resolution analysis and algorithm design," IEEE Trans. Signal Process., 2024.

[17] D. Tagliaferri, M. Mizmizi, S. Mura, F. Linsalata, D. Scazzoli, D. Badini, et al., "Integrated sensing and communication in the delay-Doppler domain: A dual-domain waveform design," in Proc. IEEE ICC Workshops, 2023.

[18] D. Tagliaferri, M. Mizmizi, S. Mura, F. Linsalata, D. Scazzoli, D. Badini, et al., "Integrated sensing and communication system via dual-domain waveform design," IEEE Trans. Wireless Commun., 2024.

[19] J. Pegoraro, J. O. Lacruz, M. Rossi, and J. Widmer, "HiSAC: High-resolution sensing with multiband ISAC," IEEE Trans. Wireless Commun., 2024.

[20] V. Koivunen, M. F. Keskin, H. Wymeersch, M. Valkama, and N. González-Prelcic, "Multicarrier ISAC: A tutorial," IEEE Trans. Signal Process., 2024.

[21] M. A. Islam, G. C. Alexandropoulos, and B. Smida, "Integrated sensing and communication with full-duplex mmWave MIMO," IEEE Trans. Wireless Commun., 2024.

[22] L. Wang, Z. Wei, L. Su, Z. Feng, H. Wu, and D. Xue, "Coherent compensation for OFDM-ISAC sensing with long-range echoes," IEEE Trans. Veh. Technol., 2024.

[23] S. Mura, D. Tagliaferri, M. Mizmizi, U. Spagnolini, and A. Petropulu, "Resource-occupancy-aware waveform design for OFDM-ISAC," IEEE Trans. Wireless Commun., 2024.

[24] M. I. Skolnik et al., Introduction to Radar Systems. McGraw-Hill, 2001.

[25] S. M. Kay, Fundamentals of Statistical Signal Processing: Estimation Theory. Prentice Hall, 1993.

[26] J. Y. Hesterman, L. Caucci, M. A. Kupinski, H. H. Barrett, and L. R. Furenlid, "Maximum-likelihood estimation with a contracting-grid search algorithm," IEEE Trans. Nucl. Sci., vol. 57, no. 3, pp. 1077–1084, 2010.

**本页范围与校对状态：** 本页为 arXiv:2511.15198v1 的全文中文译稿：摘要、正文第 I–VII 节（含 III-A/B/C、IV-A/B、V-A/B、VI 全部小节）、结论、附录 A（A.1–A.5，FIM 详细推导）与附录 B（跨路径 FIM 可加性）、图 1–8 图注、算法 1（TSIF）逐行、基金与作者单位说明与参考文献 [1]–[26]。公式编号沿用原文 (1)–(80)：正文 (1)–(76) 全部译入，附录 (77)–(80) 的关键式译入；其中原文未编号的若干派生量（如中间参数向量 $\boldsymbol\eta$ 的重定义、几何加权和 $\mathbf G_x/\mathbf G_v/\mathbf G_\times$ 的显式求和、TSIF 的逐路径协方差与 Jacobian 分块）以与原文一致的记号给出。**原文全文不含表格**，故未设表格转写（已在"图注与表注"节注明）。附录 A/B 的完整逐步代数推导在原 PDF 中篇幅很长，本页按原文结构译出其目标、拆分方式与关键结果，纯代数中间步骤作忠实概述。图内曲线未数字化；逐句逐式对照原 PDF 的终校未做。原文未见需加注的明显笔误。骨架"版本"行原为 2026-09-26（收录日），已按 BRIEF2 结构改为 arXiv:2511.15198v1（2025-11-19，依据 PDF 页眉 "arXiv:2511.15198v1 [eess.SP] 19 Nov 2025"）；作者为 Henglin Pu、Xuefeng Wang、Lu Su、Husheng Li；title 未改。

---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}
