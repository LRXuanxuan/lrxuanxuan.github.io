---
layout: page
title: "一步生成式 CSI 预测｜中文全文译文"
permalink: /papers/translations/2026-10-21-one-step-generative-csi-prediction-2609-17033/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/efb1c2b897f3baec/) · [原文 arXiv](https://arxiv.org/abs/2609.17033) · [全部目录](/papers/catalog/)

# 一步生成式 CSI 预测

> **许可与登记说明：** 原文为 arXiv 预印本（arXiv:2609.17033，eess.SP），按本站流程可登记为「可公开全文」译稿。本页为中文全文译稿，供学习与研究使用；如原文版本更新，以 arXiv 最新版为准。

**原题：** One-Step Generative CSI Prediction  
**作者：** Mehdi Sattari、Javad Aliakbari、Alexandre Graell i Amat、Tommy Svensson（瑞典哥德堡查尔姆斯理工大学电气工程系）  
**版本：** arXiv:2609.17033v1（eess.SP），2026 年 9 月 15 日提交，原文 6 页（信函长度）。  
**范围与状态：** 全文中文译稿：摘要、关键词、正文第 I—V 节、致谢/基金说明、参考文献（英文原条目 14 条）、算法 1—2、表 I—表 V、图 1—图 4 图注；逐句逐式终校未做。

## 摘要

信道状态信息（CSI）预测已成为缓解无线通信系统中**信道老化**的有前景方法。近期，生成模型被用于构建能够刻画未来信道实现**不确定性**的 CSI 预测框架；然而这些模型的**高计算复杂度与推断时延**仍是实际部署的主要障碍。为应对这些挑战，本文关注一类**一步生成模型**，即 **MeanFlow 模型**：其推断只需**一次神经函数评估（NFE）**，显著降低计算成本与时延。为缓解**直接从噪声生成 CSI** 的困难，本文引入**信道告知先验**，从未来信道的一个**有信息估计**而非纯高斯噪声初始化生成过程。引入该信道告知先验后，**点预测精度**与**不确定性校准**都得到实质改善。此外，本文把所提基于 MeanFlow 的 CSI 预测框架与近期基于扩散的方法比较：结果表明，MeanFlow 在**仅一次 NFE** 下取得**可比的点预测精度**，同时产生**校准更好**的 CSI 预测。

**关键词：** CSI 预测；生成模型；流匹配；MIMO。

## I. 引言

大规模多输入多输出（MIMO）系统依赖准确的信道状态信息（CSI）进行预编码与链路自适应。然而，**信道老化**与**导频开销**仍是限制无线信道高效利用的主要瓶颈 [1]。**CSI 预测**——由历史观测预报未来 CSI——已成为缓解这些挑战的有前景方法。经典预测技术包括 Kalman 滤波 [2]、Prony 方法 [3] 与自回归（AR）模型 [4]，已被广泛研究；但这些方法通常依赖对信道动力学的**限制性且常不现实**的假设，从而限制了其在实际无线环境中的性能。

近期，深度学习方法被用于直接从数据近似最优预测器，显著提升了 CSI 预测精度 [5]—[8]。然而，多数现有方法是**确定性**的，只产生未来信道的**单一估计**，因此无法直接度量预测不确定性，难以评估预测可靠性并支持**风险感知**的链路自适应；此外，它们难以刻画信道演化的**随机性**与可能的**多模态**特性 [9]、[10]。

生成模型通过学习未来 CSI 的**完整条件分布**来解决上述局限。其中，基于扩散的 CSI 预测框架已表现出强预测性能 [9]—[11]，但其推断依赖**迭代多步反向去噪**，导致高计算复杂度与推断时延。流匹配及其一步变体 **MeanFlow** [12]、[13] 为生成建模提供了高效替代：通过学习**平均速度场**，MeanFlow 仅用**一次 NFE** 即可生成样本，因而对实时 CSI 预测尤具吸引力。

尽管推断复杂度低，MeanFlow **尚未**被用于 CSI 预测研究。受其在实用低时延推断方面的潜力驱动，本文提出一种基于 MeanFlow 的**一步生成式 CSI 预测框架**。常规 MeanFlow 以零均值白高斯噪声初始化生成过程；但这种**无信息**源分布不反映 CSI 的统计或时间结构，且可能远离未来 CSI 的分布，使准确的一步变换变得困难。因此，本文通过引入以未来 CSI 的**粗点估计为中心**的**信道告知源分布**，把 MeanFlow 适配到 CSI 预测。

本文把所提 MeanFlow 框架与 [9] 中基于扩散的 CSI 预测方案比较，评估**点预测精度**（以归一化均方误差 NMSE 衡量）与**预测不确定性**（用校准指标，包括预测区间覆盖概率 PICP 与连续排序概率分数 CRPS）。结果表明：引入有信息先验显著改善扩散与 MeanFlow 两类生成器的点预测精度；此外，尽管仅需一次 NFE，MeanFlow 生成器产生的预测分布**校准显著更好**，同时保持**可比**的点预测精度。本文进一步表明：通过增大 MeanFlow 生成器容量，可在仅**适度增加**推断时延的情况下把点预测精度提升到**超过**多步扩散；最后证明 MeanFlow 更好的校准可转化为更准确的**可达速率**预测（以 CRPS-rate 衡量）。

## II. 问题公式化与预备知识

### A. 问题公式化

考虑一个 MIMO 系统：配备 $N_t$ 根天线均匀线阵（ULA）的基站（BS）在 $N_c$ 个正交频分复用（OFDM）子载波上服务单天线用户。时刻 $n$ 的空频 CSI 记为 $\mathbf H_n\in\mathbb C^{N_t\times N_c}$。给定过去 CSI 观测序列

$$
\mathbf H_p=\left\{\mathbf H_{n-N_p+1},\ldots,\mathbf H_n\right\},\tag{1}
$$

目标是预测未来 CSI 序列

$$
\mathbf H_f=\left\{\mathbf H_{n+1},\ldots,\mathbf H_{n+N_f}\right\}.\tag{2}
$$

在均方误差（MSE）准则下，最优预测器为条件均值：

$$
f^{*}(\mathbf H_p)=\mathbb E\left[\mathbf H_f\mid\mathbf H_p\right]=\int\mathbf H_f\,p\left(\mathbf H_f\mid\mathbf H_p\right)\mathrm d\mathbf H_f.\tag{3}
$$

等价地，条件均值即最小均方误差（MMSE）预测器：

$$
f^{*}(\mathbf H_p)=\arg\min_{f}\ \mathbb E\left[\left\lVert\mathbf H_f-f(\mathbf H_p)\right\rVert^{2}\right].\tag{4}
$$

计算 MMSE 预测器一般**不可解**，因为条件分布 $p(\mathbf H_f\mid\mathbf H_p)$ 未知，且底层无线信道动力学高度非线性、随机。因此，数据驱动方法（尤其深度学习模型）被广泛用于从数据直接近似条件均值。

### B. MeanFlow 模型

MeanFlow [13] 是一种基于流匹配的生成模型，直接估计**源分布与目标数据分布之间的平均传输速度**。与扩散模型或常规流匹配在推断时需多次数值积分不同，MeanFlow 用**单次网络评估**生成样本。

给定数据样本 $\mathbf Y$ 与源样本 $\mathbf S$，MeanFlow 定义插值

$$
\mathbf H_t=(1-t)\mathbf Y+t\mathbf S,\qquad t\in[0,1],\tag{5}
$$

其中 $t$ 为插值时间。训练时另采样时间变量 $r\in[0,t]$，以定义估计传输速度的**平均区间** $[r,t]$。MeanFlow 不学习**瞬时**速度 $\mathbf v=\mathbf S-\mathbf Y$，而学习**平均传输速度**

$$
\mathbf u_{\boldsymbol\theta}\left(\mathbf H_t,r,t\right),\tag{6}
$$

其训练目标由 [13] 提出。训练完成后，预测由下式给出：

$$
\widehat{\mathbf Y}=\mathbf S-\mathbf u_{\boldsymbol\theta},\tag{7}
$$

仅需一次网络评估。


## III. 一步生成式 CSI 预测

图 1 给出所提一步生成式 CSI 预测方法的整体框架。MeanFlow 最初用于图像生成，本文通过**以历史 CSI 提取的时间特征为条件**，把它适配到**条件** CSI 预测。框架由**时间编码器**与 **MeanFlow 生成器**组成：时间编码器学习刻画信道动力学的潜表示，MeanFlow 生成器利用该表示在一次网络评估中生成未来 CSI。

### A. MeanFlow 训练

给定历史 CSI 序列 $\mathbf H_p$，时间编码器提取潜表示 $\mathbf z$ 与**确定性预测**

$$
\boldsymbol\mu\approx\mathbb E\left[\mathbf Y\mid\mathbf H_p\right],\tag{8}
$$

其中 $\mathbf Y$ 为真值未来 CSI。潜表示 $\mathbf z$ 刻画时间信道动力学并为 MeanFlow 生成器提供条件；$\boldsymbol\mu$ 为源分布提供**有信息先验**。

与原始 MeanFlow 从零均值高斯采样源点不同，本文把源**围绕编码器预测中心化**：

$$
\mathbf S=\operatorname{sg}(\boldsymbol\mu)+\boldsymbol\epsilon,\qquad\boldsymbol\epsilon\sim\mathcal N\left(\mathbf 0,\sigma^{2}\mathbf I\right),\tag{9}
$$

其中 $\operatorname{sg}(\cdot)$ 表示**停止梯度**算子。以 $\boldsymbol\mu$ 为中心后，**可预测成分**被直接提供给生成器，使其主要聚焦于剩余预测残差；这使源分布更接近未来 CSI 的条件分布，并**缩短** MeanFlow 需学习的传输距离——这对一步生成尤为重要。同时，高斯扰动 $\boldsymbol\epsilon$ 保留了表示多种可能未来信道实现所需的**随机性**。

(5) 定义的插值状态与条件潜表示 $\mathbf z$ 一同送入 MeanFlow 生成器。目标平均速度按 MeanFlow 恒等式与 **Jacobian-向量积（JVP）**计算（沿用原始 MeanFlow 表述）。与 [13] 一样，目标速度从梯度传播中**分离**，并采用**自适应损失加权**以改善优化稳定性。完整训练流程见算法 1。除 MeanFlow 目标外，时间编码器还用确定性预测 $\boldsymbol\mu$ 上的辅助 MSE 损失优化。

**算法 1　MeanFlow 训练**

```text
输入: 数据集 D = {(X, Y)}；参数 θ = [θ_TE, θ_G]；源尺度 σ；损失权重 λ, c, p；SNR 范围 [ρ_min, ρ_max]
输出: θ*
1: for epoch = 1, …, N_epochs do
2:     for 每个批 (X, Y) ∈ D do
3:         ρ ∼ U[ρ_min, ρ_max]
4:         X̃ ← X + σ_ρ N, N ∼ N(0, I), σ_ρ² = P_X / 10^(ρ/10)
5:         (Z, μ) ← f_θTE(X̃)
6:         采样 t, r ∈ [0, 1]，且 t ≥ r
7:         ε ∼ N(0, σ² I)
8:         S ← sg(μ) + ε
9:         H_t ← (1 − t)Y + tS, v ← S − Y
10:        u_θ ← f_θG(Concat(H_t, Z), r, t)
11:        du_θ/dt ← v ∂_{H_t} u_θ + ∂_t u_θ
12:        u_tgt ← v − (t − r) du_θ/dt
13:        w ← (‖u_θ − u_tgt‖₂² + c)^(−p)
14:        L(θ) ← sg(w)‖u_θ − sg(u_tgt)‖₂² + λ‖μ − Y‖₂²
15:        用 ∇_θ L(θ) 更新 θ
16:    end for
17: end for
18: Return θ*
```

### B. 一步 AR 推断

推断时，时间编码器先处理可用 CSI 历史，产生条件潜变量 $\mathbf z$ 与确定性预测 $\boldsymbol\mu$；随后通过对**有信息先验**加扰动生成源样本：

$$
\mathbf H_1=\boldsymbol\mu+\sigma\boldsymbol\epsilon,\qquad\boldsymbol\epsilon\sim\mathcal N\left(\mathbf 0,\mathbf I\right).\tag{10}
$$

与扩散模型或常规流匹配不同，此过程**无需迭代去噪或 ODE 积分**：MeanFlow 生成器只被评估一次，以估计源与目标分布间的平均传输速度，

$$
\mathbf u_{\boldsymbol\theta}=f_{\boldsymbol\theta_G}\left(\operatorname{Concat}\left(\mathbf H_1,\mathbf z\right),0,1\right),\tag{11}
$$

下一帧 CSI 由下式恢复：

$$
\widehat{\mathbf H}_n=\mathbf H_1-\mathbf u_{\boldsymbol\theta}.\tag{12}
$$

预测帧被追加到历史并作为下一步预测的输入；该 AR 过程重复至达到期望预测时域，见算法 2。由于每次预测只需一次 MeanFlow 生成器评估，所提方法**每预测帧仅需 1 次 NFE**，推断复杂度显著低于迭代生成模型。

**算法 2　MeanFlow AR 推断**

```text
输入: 历史 H_p；训练好的 θ* = [θ*_TE, θ*_G]；时域 N_f；源尺度 σ
输出: {Ĥ_n}, n = 1…N_f
1: H_c ← H_p
2: for n = 1 to N_f do
3:     (Z, μ) ← f_θ*TE(H_c)
4:     H_1 ← μ + σ ε, ε ∼ N(0, I)
5:     u_θ* ← f_θ*G(Concat(H_1, Z), 0, 1)
6:     Ĥ_n ← H_1 − u_θ*
7:     H_c ← Concat(H_c, Ĥ_n)
8: end for
9: Return {Ĥ_n}, n = 1…N_f
```

**表 I：数据集参数。**

| 参数 | 取值 |
|---|---|
| 载频 $f_c$ | 28 GHz |
| 信道模型 | 3GPP CDL-A–E（随机选择） |
| BS 天线数 $N_t$ | 16 |
| 资源块 | 25（300 个子载波） |
| 子载波间隔 | 30 kHz |
| 使用子载波 $N_c$ | 16（等间隔） |
| 符号时长 | ≈33.3 µs |
| 用户速度 | 30–120 km/h（均匀） |
| 时延扩展 | 50–400 ns（均匀） |
| 过去 / 未来长度 | $N_p=30$ / $N_f=10$ |

## IV. 仿真结果

### A. 数据集设置

本文用 3GPP CDL 信道模型、经 Sionna 信道生成器 [14]**在线生成** CSI。每个样本为形状 $[T\times2\times N_t\times N_c]$ 的张量，其中 $T=N_p+N_f$ 为 OFDM 符号数，随后为实/虚部、$N_t$ 根发射天线与 $N_c$ 个子载波。每个样本切成过去 CSI $\mathbf X=\mathbf H_p$（$N_p=30$）与未来 CSI $\mathbf Y=\mathbf H_f$（$N_f=10$），故 $T=40$；样本标准化为零均值、单位方差。表 I 汇总数据集参数。

### B. 网络架构与训练

为保证**受控比较**，扩散与 MeanFlow 模型共享**同一骨干**，仅在训练目标上不同。时间编码器为单层 **ConvLSTM**（128 个隐藏通道），把历史映射为 128 通道条件潜变量 $\mathbf Z$ 与 2 通道点估计 $\boldsymbol\mu$。生成器为二维 U-Net（基础宽度 32，一级下采样到 64 通道，每级两个残差块，瓶颈处单头自注意力），输入为与 $\mathbf Z$ 拼接的含噪 CSI 帧，并通过正弦 FiLM 嵌入对时间对 $(r,t)$ 或扩散步 $t$ 条件化。扩散在余弦噪声调度下预测干净帧，用 3 步 DDIM 采样；MeanFlow 学习平均速度并以单次 NFE 采样。编码器与生成器合计约 **2.2M** 参数。

所有模型以相同方式训练：Adam（学习率 $2\times10^{-4}$，带 warmup 的余弦调度）、批大小 256、50k 步，采用梯度裁剪与评估时使用的权重指数滑动平均。历史以随机 SNR 加性噪声增强，以模拟不完美 CSI。完整模型与训练配置见 GitHub 实现[^1]。

[^1]: https://github.com/MehdiSattari/meanflow-csi-prediction

### C. 评价指标

本文评估点预测精度与由 $K=30$ 个样本 $\{\widehat{\mathbf H}^{(k)}\}_{k=1}^{K}$ 所得预测分布的质量；所有指标在物理（反归一化）信道空间中计算。对单个实值系数，令 $\{x_k\}_{k=1}^{K}$ 为集合值、$x_{(1)}\le\cdots\le x_{(K)}$ 为其次序统计量、$\bar x=\frac{1}{K}\sum_k x_k$ 为集合均值、$y$ 为对应真值；期望 $\mathbb E[\cdot]$ 表示对系数（天线、子载波与实/虚部）及批的平摊平均。所用指标如下：

- **NMSE。** 用集合均值 $\bar{\mathbf H}=\frac{1}{K}\sum_{k=1}^{K}\widehat{\mathbf H}^{(k)}$ 计算：
$$
\mathrm{NMSE}_n=\frac{\mathbb E\left[\left\lVert\bar{\mathbf H}_n-\mathbf H_n\right\rVert_2^{2}\right]}{\mathbb E\left[\left\lVert\mathbf H_n\right\rVert_2^{2}\right]}.\tag{13}
$$
- **PICP。** PICP 度量真值落入预测区间的频率。对名义置信水平 $p$，
$$
\mathrm{PICP}(p)=\mathbb E\left[\mathbf 1\left\{q_{\frac{1-p}{2}}\le y\le q_{\frac{1+p}{2}}\right\}\right],\tag{14}
$$
其中 $q_\alpha$ 为生成样本的经验 $\alpha$-分位数；校准良好的模型应满足 $\mathrm{PICP}(p)\approx p$。
- **CRPS。** CRPS 兼顾准确性与锐度，评价整个预测分布。对预测累积分布函数 $F$ 与真值 $y$，
$$
\mathrm{CRPS}(F,y)=\int_{-\infty}^{\infty}\left(F(x)-\mathbf 1\{x\ge y\}\right)^{2}\mathrm dx.\tag{15}
$$
CRPS 越低表示概率预测越好。
- **可达速率 CRPS。** 为从通信角度评估预测不确定性，本文评估最大比可达速率的预测分布。对信道实现 $h$ 与工作 SNR $\gamma$，速率为
$$
C(h)=\log_2\left(1+\gamma\lVert h\rVert_2^{2}\right).\tag{16}
$$
每个生成 CSI 样本 $\widehat h^{(k)}$ 映射为相应速率 $C(\widehat h^{(k)})$；可达速率 CRPS 通过比较所得速率分布与真实速率 $C(h)$ 计算。

所有指标按预测步与被预测时域平均报告。

### D. 数值结果

图 2 给出 NMSE 随预测时域的变化。对 Diffusion 与 MeanFlow，本文都比较常规高斯源分布与信道告知先验（记作 $\mu$-Diffusion 与 $\mu$-MeanFlow）。引入有信息先验使两个模型的平均 NMSE 改善约 **5 dB**，且 $\mu$-Diffusion 与 $\mu$-MeanFlow 性能几乎相同。该结果确认：把 MeanFlow 源分布或扩散目标围绕 $\mu$ 中心化，可把"从噪声直接生成 CSI"的困难任务替换为"建模零均值残差"的较简单任务。**有信息先验 $\mu$ 时，MeanFlow 尽管需要更少 NFE，NMSE 仍优于 Diffusion。**

图 3 用可靠性图比较预测分布的校准。MeanFlow 紧贴理想对角线，在名义 0.90 置信水平下覆盖率为 **0.73**；而扩散**过度自信**，覆盖率仅 **0.18**，说明真实 CSI 常落在预测集合之外。与此一致，表 II 显示 MeanFlow 在 NMSE 与扩散几乎相同的情况下取得**最低 CRPS**。此外，该校准优势在**有、无**有信息先验时都存在，表明它主要源于**流匹配表述**而非有信息先验本身。

**表 II：推断 SNR 为 20 dB 与 5 dB 时的预测精度与校准。**

| 模型 | 20 dB NMSE | 20 dB CRPS | 20 dB cov90 | 5 dB NMSE | 5 dB CRPS | 5 dB cov90 |
|---|---|---|---|---|---|---|
| $\mu$-MeanFlow | −10.6 | **0.10** | **0.73** | −9.8 | **0.12** | **0.59** |
| $\mu$-Diffusion | **−11.0** | 0.11 | 0.18 | **−10.0** | 0.14 | 0.31 |
| MeanFlow | −6.7 | 0.17 | 0.55 | −7.1 | 0.17 | 0.49 |
| Diffusion | −4.5 | 0.28 | 0.10 | −5.5 | 0.25 | 0.19 |

**表 III：不同推断 SNR 下的可达速率 CRPS 与 90% 覆盖率。**

| 模型 | 指标 | 0 dB | 5 dB | 10 dB | 20 dB |
|---|---|---|---|---|---|
| $\mu$-MeanFlow | 可达速率 CRPS | **0.16** | **0.14** | **0.13** | 0.17 |
| $\mu$-Diffusion | 可达速率 CRPS | 0.21 | 0.18 | 0.16 | **0.16** |
| MeanFlow | 可达速率 CRPS | 0.20 | 0.21 | 0.25 | 0.30 |
| Diffusion | 可达速率 CRPS | 0.76 | 0.77 | 0.76 | 0.71 |
| $\mu$-MeanFlow | 覆盖率 @0.90 | **0.57** | **0.59** | **0.63** | **0.72** |
| $\mu$-Diffusion | 覆盖率 @0.90 | 0.36 | 0.31 | 0.24 | 0.18 |
| MeanFlow | 覆盖率 @0.90 | 0.49 | 0.49 | 0.51 | 0.55 |
| Diffusion | 覆盖率 @0.90 | 0.24 | 0.18 | 0.13 | 0.10 |

表 III 进一步评估不同推断 SNR 下的概率预测。所有模型都**低于**名义 0.90 水平覆盖：$\mu$-MeanFlow 覆盖率最接近，从 0 dB 的 0.57 到 20 dB 的 0.72，尽管其区间在输入 SNR 降低时可靠性下降；相反，$\mu$-Diffusion 的覆盖率从 20 dB 的 0.18 升到 0 dB 的 0.36，但仍远低于名义水平。$\mu$-MeanFlow 在 0—10 dB 取得**最低**的可达速率 CRPS；在 20 dB，$\mu$-Diffusion 的 CRPS 略低（0.16 对 0.17）但覆盖率低得多（0.18 对 0.72）。总体上，$\mu$-MeanFlow 在 CRPS 与覆盖率之间取得**最佳平衡**。

为评估更好的校准是否能转化为更好的通信性能，本文报告表 III 中的可达速率 CRPS：带先验的 MeanFlow 在低与中等 SNR（0—10 dB）取得最低可达速率 CRPS，优于少步扩散；在 20 dB，两种生成模型性能相当，因为可达速率趋于饱和。这些结果表明 MeanFlow 更好的校准**恰在预测不确定性最显著的区域**转化为可度量的下游性能增益。

最后，表 IV 研究扩散的过度自信是否主要由仅用 3 步 DDIM 采样造成。增加采样步数可**持续改善**校准，90% 覆盖率从 0.19 升到 0.54；但该改善以集合 NMSE 略差为代价（−11.2 到 −10.7 dB），因为更忠实的采样器产生更多样集合、其均值点估计略更嘈杂。尽管有此折中，扩散即使在 **50 步 DDIM** 后仍不如一步 $\mu$-MeanFlow 校准，覆盖率仅 0.54 对 0.72。这表明增加 DDIM 步数可**缓解但无法消除**扩散的过度自信。

**表 IV：DDIM 采样步数对扩散精度与可靠性的影响。**

| 模型（每帧 NFE） | NMSE | cov90 |
|---|---|---|
| $\mu$-Diffusion（3） | −11.2 | 0.19 |
| $\mu$-Diffusion（10） | −11.1 | 0.37 |
| $\mu$-Diffusion（20） | −10.9 | 0.47 |
| $\mu$-Diffusion（50） | −10.7 | 0.54 |
| $\mu$-MeanFlow（1） | −10.5 | **0.72** |

### E. 推断复杂度与时延

由于 MeanFlow 与扩散共享同一时间编码器与生成器，其参数量相同（2.2M），推断成本仅在**生成器评估次数（NFE）**上不同。本文分析单用户单预测步的成本（实时 CSI 预测的时延关键工作点）。由于时间编码器为**循环 ConvLSTM**，每个自回归步把其隐藏状态推进一帧，故每步成本为

$$
C_{\mathrm{step}}=C_{\mathrm{enc}}+N_{\mathrm{NFE}}C_{\mathrm{gen}},\tag{17}
$$

其中 $C_{\mathrm{enc}}$ 为一次循环编码步、$C_{\mathrm{gen}}$ 为一次生成器（U-Net）评估；MeanFlow 取 $N_{\mathrm{NFE}}=1$，扩散取 $N_{\mathrm{NFE}}\ge3$。

表 V 报告在 NVIDIA A40 上测得的上述量。值得注意的是，循环编码步仅 **0.35 ms**，使时间编码器成为可忽略的每步固定成本。MeanFlow 在 **6.8 ms** 完成一个预测步，而扩散用 3 次 NFE 需 **19.8 ms**、用 50 次 NFE 需 **324.7 ms**，对应 **2.9× 到 47.5×** 的更高时延。由于编码器成本可忽略，时延比主要由 $N_{\mathrm{NFE}}$ 决定，因而**基本与硬件无关**；FLOPs 方面观察到相同排序。

最后，由于每步时延由生成器评估主导，MeanFlow 可**几乎不增加时延成本**地扩大生成器以提升精度。图 4 给出 MeanFlow 在不同生成器尺寸、以及扩散在不同 NFE（默认骨干）下的 NMSE 与每步时延关系。

**表 V：推断复杂度。**

| 模型（NFE） | 时延（ms） | FLOPs（M） |
|---|---|---|
| MeanFlow（1） | **6.8** | **561** |
| Diffusion（3） | 19.8 | 917 |
| Diffusion（10） | 65.2 | 2162 |
| Diffusion（20） | 130.1 | 3941 |
| Diffusion（50） | 324.7 | 9278 |

三个 MeanFlow 变体只缩放**共享 U-Net 生成器**：small、medium、large 的基础宽度分别为 24、32、48 通道，总参数分别为 1.7M、2.2M、3.8M；medium 为全文默认。MeanFlow 的前沿完全位于扩散前沿的**下方与左侧**：增大生成器尺寸使 NMSE 沿近乎**垂直的低时延**线下降。特别地，最大 MeanFlow 模型在约**一半**每步时延下（8.1 ms 对 19.8 ms）取得比最佳扩散配置**更低**的 NMSE（−11.67 dB 对 −11.15 dB）。因此，对 CSI 预测而言，把算力花在更大的**一步生成器**上，远比花在扩散的**额外采样步**上更有效。




## V. 结论

本文提出基于 MeanFlow 的**一步生成式 CSI 预测框架**，以降低实时无线应用中生成模型的推断复杂度与时延。为缓解从纯随机噪声生成未来 CSI 的困难，本文引入**信道告知先验**，从未来信道的有信息估计初始化生成过程，显著改善点预测精度与不确定性校准。本文用同时评估**点预测精度**与**预测分布质量**的指标，在时间编码器与生成器架构相同的受控设置下，把所提 MeanFlow 框架与最先进的基于扩散的 CSI 预测模型比较。结果表明：一步 MeanFlow 取得与少步扩散**可比**的点预测精度，同时提供显著更好的校准预测不确定性与下游性能；此外，MeanFlow 具有有利的**精度—时延缩放**特性：增大一步生成器尺寸可在仅轻微增加时延下改善 NMSE，凸显"把算力投入更大的一步生成器而非更多扩散采样步"的优势。

未来工作将研究**信道整形源先验**，利用无线残差在角度—时延域中的**结构化稀疏性**，进一步提升 CSI 生成质量与不确定性估计。

## 参考文献（英文原书目）

以下按原文编号逐条转录（共 14 条，条目文字不翻译）。

[1] E. G. Larsson, O. Edfors, F. Tufvesson, and T. L. Marzetta, "Massive MIMO for next generation wireless systems," IEEE Commun. Mag., vol. 52, no. 2, pp. 186–195, 2014.

[2] H. Kim, S. Kim, H. Lee, C. Jang, Y. Choi, and J. Choi, "Massive MIMO channel prediction: Kalman filtering vs. machine learning," IEEE Trans. Commun., vol. 69, no. 1, pp. 518–528, 2021.

[3] H. Yin, H. Wang, Y. Liu, and D. Gesbert, "Addressing the curse of mobility in massive MIMO with Prony-based angular-delay domain channel predictions," IEEE J. Sel. Areas Commun., vol. 38, no. 12, pp. 2903–2917, 2020.

[4] K. E. Baddour and N. C. Beaulieu, "Autoregressive modeling for fading channel simulation," IEEE Trans. Wireless Commun., vol. 4, no. 4, pp. 1650–1662, 2005.

[5] W. Jiang and H. D. Schotten, "Deep learning for fading channel prediction," IEEE Open J. Commun. Soc., vol. 1, pp. 320–332, 2020.

[6] H. Jiang, M. Cui, D. W. K. Ng, and L. Dai, "Accurate channel prediction based on transformer: Making mobility negligible," IEEE J. Sel. Areas Commun., vol. 40, no. 9, pp. 2717–2732, 2022.

[7] Y. Jin, Y. Wu, Y. Gao, S. Zhang, S. Xu, and C.-X. Wang, "Linformer: A linear-based lightweight transformer architecture for time-aware MIMO channel prediction," IEEE Trans. Wireless Commun., pp. 1–1, 2025.

[8] S. Fan, Z. Liu, X. Gu, and H. Li, "CSI-LLM: A novel downlink channel prediction method aligned with LLM pre-training," in Proc. IEEE Wireless Commun. Netw. Conf. (WCNC), 2025, pp. 1–6.

[9] M. Sattari, J. Aliakbari, A. G. i Amat, and T. Svensson, "CSI prediction using diffusion models," IEEE Trans. Wireless Commun., vol. 25, pp. 21 418–21 432, 2026.

[10] M. Sattari, J. Aliakbari, A. G. I. Amat, and T. Svensson, "CSI prediction using autoregressive conditional diffusion models," in Proc. IEEE Int. Conf. Commun. (ICC), 2026, pp. 1–6.

[11] J. Ho, A. Jain, and P. Abbeel, "Denoising diffusion probabilistic models," in Adv. Neural Inf. Process. Syst. (NeurIPS), vol. 33, 2020, pp. 6840–6851.

[12] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le, "Flow matching for generative modeling," 2023. [Online]. Available: https://arxiv.org/abs/2210.02747

[13] Z. Geng, M. Deng, X. Bai, J. Z. Kolter, and K. He, "Mean flows for one-step generative modeling," 2025. [Online]. Available: https://arxiv.org/abs/2505.13447

[14] J. Hoydis, S. Cammerer, F. A. Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, "Sionna: An open-source library for next-generation physical layer research," 2023. [Online]. Available: https://arxiv.org/abs/2203.11854

## 图注与表注

**图 1：** 使用 MeanFlow 生成器的一步生成式 CSI 预测器。历史 CSI 经时间编码器产生条件潜变量 $\mathbf z$ 与确定性点估计 $\boldsymbol\mu$；源样本取 $\mathbf S=\boldsymbol\mu+\sigma\boldsymbol\epsilon$；MeanFlow 生成器仅评估一次即输出 $\widehat{\mathbf H}_{n+1}$。

**图 2：** 推断 SNR 为 20 dB 时每步 NMSE 随预测步的变化（$\mu$-MeanFlow、$\mu$-Diffusion、MeanFlow、Diffusion）。

**图 3：** 推断 SNR 为 20 dB 时的可靠性图：经验覆盖率随名义覆盖率变化，理想对角线为基准；MeanFlow 贴合对角线（名义 0.90 处覆盖率 0.73），扩散明显过度自信（0.18）。

**图 4：** 精度（NMSE）与每步时延的关系：MeanFlow 按生成器尺寸（small/medium/large，基础宽度 24/32/48，参数 1.7M/2.2M/3.8M）扫描，Diffusion 按 NFE（3/10/20/50）扫描；MeanFlow 前沿位于扩散前沿下方与左侧，最大 MeanFlow 在约一半时延下取得更低 NMSE（−11.67 dB 对 −11.15 dB）。

**表注：** 表 I 为数据集参数（28 GHz、3GPP CDL-A–E、$N_t=16$、25 资源块/300 子载波、30 kHz 间隔、$N_c=16$、30–120 km/h、50–400 ns、$N_p=30$/$N_f=10$）。表 II 为推断 SNR 20 dB 与 5 dB 下的 NMSE、CRPS 与 90% 覆盖率，粗体为各列最优。表 III 为不同推断 SNR（0/5/10/20 dB）下的可达速率 CRPS 与 90% 覆盖率。表 IV 为 DDIM 采样步数对扩散精度与可靠性的影响（并与一步 $\mu$-MeanFlow 对照）。表 V 为推断复杂度（时延与 FLOPs）。

## 本页范围与校对状态

**覆盖范围：** 本页为 arXiv:2609.17033v1（6 页）的全文中文译稿，按原文结构译出：摘要与关键词；第 I 节引言（信道老化、经典与深度学习预测、确定性方法局限、生成模型与扩散的复杂度问题、MeanFlow 与信道告知先验的动机、贡献概述）；第 II 节问题公式化与预备知识（II-A 问题公式化与式 (1)—(4)；II-B MeanFlow 模型与式 (5)—(7)）；第 III 节一步生成式 CSI 预测（III-A MeanFlow 训练与式 (8)—(9)、算法 1；III-B 一步 AR 推断与式 (10)—(12)、算法 2）；第 IV 节仿真结果（IV-A 数据集与表 I；IV-B 网络架构与训练；IV-C 评价指标与式 (13)—(16)；IV-D 数值结果、表 II—表 IV、图 2—图 3；IV-E 推断复杂度与式 (17)、表 V、图 4）；第 V 节结论；基金说明；15 条英文参考文献；图 1—图 4 图注与表 I—表 V 表注。

**源文页码：** 第 1 页（题名、作者、摘要、关键词、引言、基金说明）→ 第 2 页（第 II 节、图 1、第 III-A 节）→ 第 3 页（算法 1、III-B、式 (10)—(12)、算法 2、表 I、第 IV-A/B 节）→ 第 4 页（IV-B/IV-C、式 (13)—(16)、图 2—图 3）→ 第 5 页（IV-D、表 II—表 IV、IV-E、式 (17)）→ 第 6 页（表 V、图 4、第 V 节、参考文献）。

**校对状态与限制：**

1. 逐句逐式人工终校未做；**表 II、表 III、表 IV 的全部数值与表头已按 PDF 第 5 页渲染图逐项核对**（含粗体最优项）；表 I、表 V 按 PDF 文本层转录（表 V 的时延/FLOPs 数值与正文叙述一致）。
2. 图 1—图 4 均未上传图片；本页以"图注与表注"小节统一给出 4 条中文图注与 5 条表注，正文按"图 N/表 N"引用。
3. 公式覆盖原文 (1)—(17)，全部保留原编号、无缺号与重复；算法 1—2 的伪代码按原文逐行译出（含 JVP、自适应权重、停止梯度等记号）。
4. **原文疑点／说明：** ①表 II 中粗体标注为「各列最优」——$\mu$-Diffusion 的 NMSE 在 20 dB 与 5 dB 均优于 $\mu$-MeanFlow，而 $\mu$-MeanFlow 的 CRPS/覆盖率更好，二者是不同指标上的权衡，原文照录；②表 IV 中 $\mu$-MeanFlow（1）的 NMSE（−10.5）略差于 $\mu$-Diffusion（3）的 −11.2，但覆盖率显著更好（0.72 vs 0.19），原文照录；③式 (9) 的 $\operatorname{sg}$（停止梯度）与 (8) 的确定性预测 $\boldsymbol\mu$ 在训练中通过辅助 MSE 损失优化，原文如此；④图 3 的覆盖率 0.73 与表 II 的 cov90=0.73 一致，照录；⑤原文 In summary 处提到「约 5 dB」的 NMSE 改善对应无先验（MeanFlow/Diffusion）与有先验（$\mu$-*）的差，本页照录该表述；⑥算法 1 第 4 行的噪声注入按原文以 SNR 定义 $\sigma_\rho^{2}=P_X/10^{\rho/10}$。
5. **许可与登记：** 原文为 arXiv 预印本（arXiv:2609.17033），按任务要求**可登记为可公开全文译稿**，页面顶部已注明；页面目录日期 2026-10-21 为推荐/归档日期，版本行按 arXiv v1（2026-09-15）标注。
6. 版权：本页为中文翻译页面，未上传原文 PDF；引用遵循 arXiv 学术规范。


---

**登记（2026-10-30）：** 本篇按用户 2026-10-30 新口径登记为“可公开全文译文”——全文覆盖（摘要、正文、结论、图表说明与附录/书目按原文结构）已录入；逐句逐式终校未做。

{% endraw %}