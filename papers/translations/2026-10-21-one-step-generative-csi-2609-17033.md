---
layout: page
title: "一步生成式 CSI 预测｜中文逐节译稿（待终校）"
permalink: /papers/translations/2026-10-21-one-step-generative-csi-2609-17033/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/efb1c2b897f3baec/) · [arXiv 原文](https://arxiv.org/abs/2609.17033) · [代码](https://github.com/MehdiSattari/meanflow-csi-prediction)

# 一步生成式 CSI 预测

**原题：** One-Step Generative CSI Prediction  
**作者：** Mehdi Sattari、Javad Aliakbari、Alexandre Graell i Amat、Tommy Svensson  
**机构：** 瑞典查尔姆斯理工大学电气工程系。  
**版本：** arXiv:2609.17033v1（2026 年 9 月 15 日），原文 6 页。  
**译稿说明：** 按 PDF 顺序译出摘要、正文 I–V、公式（1）–（17）、算法 1–2、图 1–4 与表 I–V；参考文献保留英文出版信息。人工独立逐式终校尚未完成，不标记为已验收全文。

## 摘要

信道状态信息（channel state information，CSI）预测已成为缓解无线通信系统信道老化问题的一种有前景的方法。近期，生成模型被用于建立能够刻画未来信道实现不确定性的 CSI 预测框架。然而，此类模型较高的计算复杂度和推理时延仍是实际部署的主要障碍。为解决这些问题，本研究关注一类一步生成模型，即 MeanFlow 模型，其推理只需要一次神经网络函数评估（neural function evaluation，NFE），可显著降低计算成本和时延。为了缓解直接从噪声生成 CSI 的困难，引入**信道信息引导的先验（channel-informed prior）**：生成过程不是从纯高斯噪声初始化，而是从对未来信道具有信息量的估计出发。引入该先验显著改善点预测精度和不确定性校准。进一步，将基于 MeanFlow 的 CSI 预测框架与近期提出的扩散模型方法进行比较。结果表明，MeanFlow 仅通过一次 NFE，就能够获得相近的点预测精度，同时生成校准效果更好的 CSI 预测分布。

**关键词：** CSI 预测；生成模型；流匹配（flow matching）；MIMO。

## I. 引言

大规模多输入多输出（massive MIMO）系统依赖准确的 CSI 来执行预编码和链路自适应。然而，信道老化及导频开销仍是限制无线信道有效利用的主要瓶颈 [1]。CSI 预测根据历史观测预测未来 CSI，已成为缓解这些挑战的重要途径。经典预测方法，包括卡尔曼滤波 [2]、Prony 方法 [3] 和自回归（autoregressive，AR）模型 [4]，已有广泛研究。但这些方法通常依赖对信道动态特性较为严格、且往往不现实的假设，从而限制其在实际无线环境中的性能。

近年来，研究者提出深度学习模型，以直接从数据中逼近最优预测器，并显著提高 CSI 预测精度 [5]–[8]。但大多数现有方法属于确定性方法，只输出未来信道的单一估计。因此，它们不能直接衡量预测不确定性，不利于评估预测可靠性及开展风险感知的链路自适应。此外，它们难以捕捉信道演化的随机性及潜在多模态特征 [9]、[10]。

生成模型通过学习未来 CSI 的完整条件分布来解决上述限制。其中，基于扩散模型的 CSI 预测框架已表现出较强的预测能力 [9]–[11]。然而，其推理过程依赖多步迭代反向去噪，产生较高的计算复杂度与推理时延。流匹配及其一步变体 MeanFlow [12]、[13] 为生成建模提供了更高效的替代方案。MeanFlow 通过学习平均速度场，只用一次 NFE 即可生成样本，因此尤其适合实时 CSI 预测。

尽管推理复杂度较低，MeanFlow 尚未被用于 CSI 预测研究。考虑到它在低时延实际推理方面的潜力，提出基于 MeanFlow 的一步生成式 CSI 预测框架。传统 MeanFlow 从零均值白高斯噪声初始化生成过程。然而，这种不包含信息的源分布不能反映 CSI 的统计结构或时间结构，且可能与未来 CSI 的分布相距甚远，使准确的一步变换难以学习。因此，通过引入**以未来 CSI 的粗略点估计为中心的信道信息源分布**，将 MeanFlow 适配于 CSI 预测。

将所提 MeanFlow 框架与文献 [9] 的扩散式 CSI 预测方法比较，使用归一化均方误差（normalized mean squared error，NMSE）评价点预测精度，并使用预测区间覆盖概率（prediction interval coverage probability，PICP）及连续排序概率得分（continuous ranked probability score，CRPS）等校准指标评价预测不确定性。结果表明，信息先验显著提高了扩散模型和 MeanFlow 生成器的点预测精度。此外，MeanFlow 虽然只需一次 NFE，但在维持相近点预测精度的同时，能够提供比多步扩散生成器显著更好的预测分布校准。增大 MeanFlow 生成器容量还可在仅略微增加推理时延的情况下，使点预测精度超过多步扩散模型。最后，通过速率 CRPS（CRPS-rate）表明，MeanFlow 更好的校准性能能够转化为更准确的可达速率预测。

## II. 问题表述与预备知识

### A. 问题表述

考虑一个 MIMO 系统：基站（BS）配备 $N_t$ 根天线组成的均匀线性阵列（ULA），通过 $N_c$ 个正交频分复用（OFDM）子载波服务单天线用户。时刻 $n$ 的空频域 CSI 记为 $\mathbf H_n\in\mathbb C^{N_t\times N_c}$。给定过去的 CSI 观测序列：

$$
\mathbf H_p=\{\mathbf H_{n-N_p+1},\ldots,\mathbf H_n\}. \tag{1}
$$

目标是预测未来的 CSI 序列：

$$
\mathbf H_f=\{\mathbf H_{n+1},\ldots,\mathbf H_{n+N_f}\}. \tag{2}
$$

在均方误差（MSE）准则下，最优预测器是条件均值：

$$
f^*(\mathbf H_p)=\mathbb E[\mathbf H_f\mid\mathbf H_p]
=\int\mathbf H_f\,p(\mathbf H_f\mid\mathbf H_p)\,d\mathbf H_f. \tag{3}
$$

等价地，条件均值就是最小均方误差（MMSE）预测器：

$$
f^*(\mathbf H_p)=\arg\min_f
\mathbb E\!\left[\|\mathbf H_f-f(\mathbf H_p)\|^2\right]. \tag{4}
$$

由于条件分布 $p(\mathbf H_f\mid\mathbf H_p)$ 未知，且无线信道的内在动态高度非线性、具有随机性，通常无法直接计算 MMSE 预测器。因此，数据驱动方法，尤其是深度学习模型，被广泛用于直接逼近条件均值。

### B. MeanFlow 模型

MeanFlow [13] 是基于流匹配的生成模型，直接估计源分布与目标数据分布之间的平均输运速度。与推理阶段需要多步数值积分的扩散模型和传统流匹配不同，MeanFlow 只用一次网络评估生成样本。

给定数据样本 $\mathbf Y$ 和源样本 $\mathbf S$，MeanFlow 定义插值：

$$
\mathbf H_t=(1-t)\mathbf Y+t\mathbf S,\qquad t\in[0,1]. \tag{5}
$$

其中，$t$ 为插值时间。训练时，还采样另一时间变量 $r\in[0,t]$，指定需要估计输运速度的平均区间 $[r,t]$。MeanFlow 并不直接学习瞬时速度 $\mathbf v=\mathbf S-\mathbf Y$，而是学习平均输运速度：

$$
\mathbf u_\theta(\mathbf H_t,r,t). \tag{6}
$$

该速度使用文献 [13] 中提出的目标函数训练。训练完成后，预测结果为：

$$
\widehat{\mathbf Y}=\mathbf S-\mathbf u_\theta, \tag{7}
$$

只需一次网络评估。

## III. 一步生成式 CSI 预测

图 1 展示了所提一步生成式 CSI 预测方法的整体框架。虽然 MeanFlow 最初针对图像生成提出，但可通过将历史 CSI 提取的时间特征作为生成条件，将其适配为条件 CSI 预测方法。该框架由时间编码器与 MeanFlow 生成器构成。时间编码器学习能够捕捉信道动态特性的潜在表示，MeanFlow 生成器利用这些表示，通过一次网络评估生成未来 CSI。

**图 1：** 使用 MeanFlow 生成器的一步 CSI 预测器。历史 CSI $\mathbf H_p$ 输入时间编码器，得到确定性估计 $\boldsymbol\mu$ 和条件特征 $\mathbf z$；利用 $\mathbf S=\boldsymbol\mu+\sigma\boldsymbol\epsilon$ 构造源分布，MeanFlow 生成器输出预测的下一帧 CSI。

### A. MeanFlow 训练

给定历史 CSI 序列 $\mathbf H_p$，时间编码器提取潜在表示 $\mathbf z$ 以及确定性预测：

$$
\boldsymbol\mu\approx\mathbb E[\mathbf Y\mid\mathbf H_p], \tag{8}
$$

其中，$\mathbf Y$ 表示未来 CSI 的真实值。潜在表示 $\mathbf z$ 捕捉信道的时间动态，并作为 MeanFlow 生成器的条件输入；$\boldsymbol\mu$ 为源分布提供信息先验。

不同于原始 MeanFlow 从零均值高斯分布采样源点的做法，这里将源分布的中心设为编码器预测：

$$
\mathbf S=\operatorname{sg}(\boldsymbol\mu)+\boldsymbol\epsilon,\qquad
\boldsymbol\epsilon\sim\mathcal N(\mathbf0,\sigma^2\mathbf I). \tag{9}
$$

$\operatorname{sg}(\cdot)$ 表示停止梯度（stop-gradient）算子。通过以 $\boldsymbol\mu$ 为中心，生成器可以直接获得可预测的信道成分，主要关注剩余的预测残差。这使源分布更加接近未来 CSI 的条件分布，缩短 MeanFlow 必须学习的输运距离，对一步生成尤为重要。与此同时，高斯扰动 $\boldsymbol\epsilon$ 保留了表征未来信道多种可能实现所需的随机性。

将式（5）定义的插值状态与条件潜在表示 $\mathbf z$ 一同输入 MeanFlow 生成器。按照原始 MeanFlow 方法，利用 MeanFlow 恒等式和雅可比矩阵—向量积（Jacobian–vector product，JVP）计算目标平均速度。与文献 [13] 相同，在目标速度上停止梯度传播，并采用自适应损失加权提高优化稳定性。完整训练流程见算法 1。除了 MeanFlow 目标，时间编码器还使用针对确定性预测 $\boldsymbol\mu$ 的辅助 MSE 损失进行优化。

**算法 1：MeanFlow 训练**

输入：数据集 $\mathcal D=\{(\mathbf X,\mathbf Y)\}$；参数 $\theta=[\theta_{\rm TE},\theta_{\rm G}]$；源噪声尺度 $\sigma$；损失权重 $\lambda,c,p$；SNR 范围 $[\rho_{\min},\rho_{\max}]$。输出：训练后的 $\theta^*$。

1. 对每个训练轮次 $1,\ldots,N_{\rm epochs}$：对每个批次 $(\mathbf X,\mathbf Y)\in\mathcal D$：
2. 从 $[\rho_{\min},\rho_{\max}]$ 上均匀采样 $\rho$。
3. 构造带噪历史输入 $\widetilde{\mathbf X}=\mathbf X+\sigma_\rho\mathbf N$，其中 $\mathbf N\sim\mathcal N(\mathbf0,\mathbf I)$，$\sigma_\rho^2=P_X/10^{\rho/10}$。
4. 由时间编码器计算 $(\mathbf Z,\boldsymbol\mu)=f_{\theta_{\rm TE}}(\widetilde{\mathbf X})$。
5. 采样 $t,r\in[0,1]$，满足 $t\ge r$。
6. 采样 $\boldsymbol\epsilon\sim\mathcal N(\mathbf0,\sigma^2\mathbf I)$，构造 $\mathbf S=\operatorname{sg}(\boldsymbol\mu)+\boldsymbol\epsilon$。
7. 计算 $\mathbf H_t=(1-t)\mathbf Y+t\mathbf S$、$\mathbf v=\mathbf S-\mathbf Y$。
8. 计算 $\mathbf u_\theta=f_{\theta_{\rm G}}(\operatorname{Concat}(\mathbf H_t,\mathbf Z),r,t)$。
9. 计算 $\displaystyle\frac{d\mathbf u_\theta}{dt}=\mathbf v\,\partial_{\mathbf H_t}\mathbf u_\theta+\partial_t\mathbf u_\theta$。
10. 令 $\mathbf u_{\rm tgt}=\mathbf v-(t-r)\frac{d\mathbf u_\theta}{dt}$。
11. 计算自适应权重 $w=(\|\mathbf u_\theta-\mathbf u_{\rm tgt}\|_2^2+c)^{-p}$。
12. 构造损失 $\mathcal L(\theta)=\operatorname{sg}(w)\|\mathbf u_\theta-\operatorname{sg}(\mathbf u_{\rm tgt})\|_2^2+\lambda\|\boldsymbol\mu-\mathbf Y\|_2^2$。
13. 使用 $\nabla_\theta\mathcal L(\theta)$ 更新参数。
14. 遍历全部批次和轮次，返回 $\theta^*$。

### B. 一步自回归推理

推理阶段，时间编码器首先处理已有 CSI 历史，生成条件潜在表示 $\mathbf z$ 和确定性预测 $\boldsymbol\mu$。然后，通过对信息先验施加扰动得到源样本：

$$
\mathbf H_1=\boldsymbol\mu+\sigma\boldsymbol\epsilon,\qquad
\boldsymbol\epsilon\sim\mathcal N(\mathbf0,\mathbf I). \tag{10}
$$

与扩散模型或传统流匹配不同，此过程无需迭代去噪，也不需要常微分方程（ODE）积分。MeanFlow 生成器仅评估一次，估计源分布与目标分布之间的平均输运速度：

$$
\mathbf u_\theta=f_{\theta_{\rm G}}\!\left(
\operatorname{Concat}(\mathbf H_1,\mathbf z),0,1\right), \tag{11}
$$

并恢复下一帧 CSI：

$$
\widehat{\mathbf H}_n=\mathbf H_1-\mathbf u_\theta. \tag{12}
$$

将预测帧添加到历史序列，作为下一次预测的输入。重复该自回归过程，直到达到指定的预测跨度，具体见算法 2。由于每一帧仅需评估一次 MeanFlow 生成器，所提方法每预测一帧只需要一次 NFE，推理复杂度显著低于迭代式生成模型。

**算法 2：MeanFlow 自回归推理**

输入：历史 $\mathbf H_p$；训练后的 $\theta^*=[\theta_{\rm TE}^*,\theta_{\rm G}^*]$；预测跨度 $N_f$；源尺度 $\sigma$。输出：$\{\widehat{\mathbf H}_n\}_{n=1}^{N_f}$。

1. 初始化 $\mathbf H_c\leftarrow\mathbf H_p$。
2. 对 $n=1,\ldots,N_f$：
3. 计算 $(\mathbf Z,\boldsymbol\mu)=f_{\theta_{\rm TE}^*}(\mathbf H_c)$。
4. 采样 $\boldsymbol\epsilon\sim\mathcal N(\mathbf0,\mathbf I)$，计算 $\mathbf H_1\leftarrow\boldsymbol\mu+\sigma\boldsymbol\epsilon$。
5. 计算 $\mathbf u_{\theta^*}\leftarrow f_{\theta_{\rm G}^*}(\operatorname{Concat}(\mathbf H_1,\mathbf Z),0,1)$。
6. 计算 $\widehat{\mathbf H}_n\leftarrow\mathbf H_1-\mathbf u_{\theta^*}$。
7. 更新 $\mathbf H_c\leftarrow\operatorname{Concat}(\mathbf H_c,\widehat{\mathbf H}_n)$。
8. 结束循环，返回预测序列。

## IV. 仿真结果

### A. 数据集设置

利用 Sionna 信道生成器 [14]，根据 3GPP CDL 信道模型在线生成 CSI。每个样本是一个形状为 $[T\times2\times N_t\times N_c]$ 的张量，其中 $T=N_p+N_f$ 是 OFDM 符号数，第二维表示实部与虚部，$N_t$ 为发射天线数，$N_c$ 为子载波数。样本被拆分为历史 CSI $\mathbf X=\mathbf H_p$（$N_p=30$）和未来 CSI $\mathbf Y=\mathbf H_f$（$N_f=10$），因此 $T=40$。对样本进行零均值、单位方差标准化。表 I 给出了数据集参数。

**表 I：数据集参数**

| 参数 | 数值 |
|---|---|
| 载波频率 $f_c$ | 28 GHz |
| 信道模型 | 3GPP CDL-A–E（随机选取） |
| 基站天线数 $N_t$ | 16 |
| 资源块 | 25（300 个子载波） |
| 子载波间隔 | 30 kHz |
| 使用的子载波数 $N_c$ | 16（均匀抽取） |
| 符号时长 | 约 33.3 μs |
| 用户速度 | 30–120 km/h（均匀分布） |
| 时延扩展 | 50–400 ns（均匀分布） |
| 历史/未来长度 | $N_p=30$，$N_f=10$ |

### B. 网络架构和训练

为确保比较受控，扩散模型与 MeanFlow 采用相同的主干网络，仅训练目标不同。单层 ConvLSTM 时间编码器（128 个隐藏通道）将历史序列映射为具有 128 个通道的条件潜变量 $\mathbf Z$ 和具有 2 个通道的点估计 $\boldsymbol\mu$。生成器为二维 U-Net：基础宽度为 32，一个下采样阶段扩展至 64 个通道，每个阶段有两个残差块，并在瓶颈处设置单头自注意力。生成器输入带噪 CSI 帧与 $\mathbf Z$ 的拼接结果，通过正弦形式的 FiLM 嵌入注入时间对 $(r,t)$ 或扩散步数 $t$ 的条件。扩散模型在余弦噪声调度下预测干净帧，并采用 3 步 DDIM 采样；MeanFlow 学习平均速度，仅用一次 NFE 完成采样。编码器与生成器合计约 220 万个参数。

全部模型采用相同训练配置：Adam 优化器、学习率 $2\times10^{-4}$、带预热的余弦调度、批量大小 256、训练 50,000 步；使用梯度裁剪，并在评估时采用权重的指数移动平均。历史输入在随机 SNR 下加入噪声，以模拟不完美 CSI。完整模型和训练配置见作者的 [GitHub 实现](https://github.com/MehdiSattari/meanflow-csi-prediction)。

### C. 评价指标

采用 $K=30$ 个样本 $\{\widehat{\mathbf H}^{(k)}\}_{k=1}^K$，同时评价点预测精度与预测分布质量。全部指标均在还原标准化之前量纲的物理信道空间内计算。对一个实值系数，设 $\{x_k\}_{k=1}^K$ 为样本集合、$x_{(1)}\le\cdots\le x_{(K)}$ 为其次序统计量、$\bar x=K^{-1}\sum_kx_k$ 为集合均值，$y$ 为相应真实值。期望 $\mathbb E[\cdot]$ 表示对系数（天线、子载波和实部/虚部）及批次取平均。采用以下指标：

**NMSE：** 使用集合均值 $\overline{\mathbf H}=K^{-1}\sum_{k=1}^K\widehat{\mathbf H}^{(k)}$ 计算：

$$
\operatorname{NMSE}_n=
\frac{\mathbb E[\|\overline{\mathbf H}_n-\mathbf H_n\|_2^2]}
{\mathbb E[\|\mathbf H_n\|_2^2]}. \tag{13}
$$

**PICP：** 衡量真实值落在预测区间内的频率。对名义置信水平 $p$：

$$
\operatorname{PICP}(p)=
\mathbb E\!\left[
\mathbf1\left\{q_{(1-p)/2}\le y\le q_{(1+p)/2}\right\}\right]. \tag{14}
$$

其中 $q_\alpha$ 为生成样本的经验 $\alpha$ 分位数。校准良好的模型应满足 $\operatorname{PICP}(p)\approx p$。

**CRPS：** 综合预测的准确性与尖锐程度，衡量整个预测分布的质量。对预测累积分布函数（CDF）$F$ 及真实值 $y$：

$$
\operatorname{CRPS}(F,y)=
\int_{-\infty}^{\infty}
\big(F(x)-\mathbf1\{x\ge y\}\big)^2\,dx. \tag{15}
$$

CRPS 越低，概率预测越好。

**可达速率 CRPS：** 为从通信角度评价预测不确定性，考察最大比合并条件下可达速率的预测分布。对信道实现 $\mathbf h$ 及运行 SNR $\gamma$：

$$
C(\mathbf h)=\log_2(1+\gamma\|\mathbf h\|_2^2). \tag{16}
$$

将每个生成的 CSI 样本 $\widehat{\mathbf h}^{(k)}$ 映射为速率 $C(\widehat{\mathbf h}^{(k)})$，再将由此得到的速率分布与真实速率 $C(\mathbf h)$ 比较，计算可达速率 CRPS。全部指标既按每个预测步报告，也按整个预测跨度取平均报告。

### D. 数值结果

**图 2：** 推理 SNR 为 20 dB 时，每个预测步的 NMSE。比较四种配置：$\mu$-MeanFlow、$\mu$-Diffusion、MeanFlow 和 Diffusion。

图 2 显示预测跨度内的 NMSE。对于 Diffusion 和 MeanFlow，分别比较传统高斯源分布和信道信息先验；后者以 $\mu$-Diffusion 和 $\mu$-MeanFlow 表示。引入信息先验使两种模型的平均 NMSE 均改善约 5 dB，而 $\mu$-Diffusion 与 $\mu$-MeanFlow 的性能几乎相同。这表明，以 $\boldsymbol\mu$ 为中心构造 MeanFlow 源分布，或将扩散目标以 $\boldsymbol\mu$ 为中心重定向，都可以将直接从噪声生成 CSI 的困难问题替换为更简单的零均值残差建模任务。没有信息先验 $\boldsymbol\mu$ 时，MeanFlow 虽然需要的 NFE 更少，却获得了比 Diffusion 更好的 NMSE。

**图 3：** 推理 SNR 为 20 dB 时预测区间的可靠性图。横轴是名义覆盖率，纵轴是经验覆盖率；理想校准对应对角线。

图 3 使用可靠性图比较预测分布的校准效果。MeanFlow 更接近理想对角线：名义置信水平为 0.90 时，其覆盖率达到 0.73；相比之下，扩散模型的覆盖率只有 0.18，表现出过度自信，意味着真实 CSI 经常落在预测样本集合所给的区间之外。表 II 同样表明，MeanFlow 在保持与扩散模型近乎相同 NMSE 的同时取得更低 CRPS。这一校准优势在有无信息先验的条件下均存在，说明其主要来源可能是流匹配形式本身，而非信息先验。

**表 II：推理 SNR 为 20 dB 和 5 dB 时的预测精度及校准**

| 模型 | 20 dB NMSE | 20 dB CRPS | 20 dB cov90 | 5 dB NMSE | 5 dB CRPS | 5 dB cov90 |
|---|---:|---:|---:|---:|---:|---:|
| $\mu$-MeanFlow | -10.6 | 0.10 | 0.73 | -9.8 | 0.12 | 0.59 |
| $\mu$-Diffusion | -11.0 | 0.11 | 0.18 | -10.0 | 0.14 | 0.31 |
| MeanFlow | -6.7 | 0.17 | 0.55 | -7.1 | 0.17 | 0.49 |
| Diffusion | -4.5 | 0.28 | 0.10 | -5.5 | 0.25 | 0.19 |

表 III 在不同推理 SNR 下评价概率预测。所有模型的实际覆盖率都低于名义值 0.90。$\mu$-MeanFlow 的覆盖率最接近名义水平，从 0 dB 时的 0.57 增加到 20 dB 时的 0.72；但随着输入 SNR 降低，其区间可靠性也下降。相反，$\mu$-Diffusion 的覆盖率从 20 dB 时的 0.18 提高到 0 dB 时的 0.36，但仍远低于名义水平。在 0–10 dB 时，$\mu$-MeanFlow 也获得最低的可达速率 CRPS；在 20 dB 时，$\mu$-Diffusion 的 CRPS 略低（0.16 比 0.17），但覆盖率要低得多（0.18 比 0.72）。总体而言，$\mu$-MeanFlow 在 CRPS 与覆盖率之间取得了最好的平衡。

**表 III：不同推理 SNR 下的可达速率 CRPS 及 90% 覆盖率**

| 指标和模型 | 0 dB | 5 dB | 10 dB | 20 dB |
|---|---:|---:|---:|---:|
| 可达速率 CRPS：$\mu$-MeanFlow | 0.16 | 0.14 | 0.13 | 0.17 |
| 可达速率 CRPS：$\mu$-Diffusion | 0.21 | 0.18 | 0.16 | 0.16 |
| 可达速率 CRPS：MeanFlow | 0.20 | 0.21 | 0.25 | 0.30 |
| 可达速率 CRPS：Diffusion | 0.76 | 0.77 | 0.76 | 0.71 |
| 90% 覆盖率：$\mu$-MeanFlow | 0.57 | 0.59 | 0.63 | 0.72 |
| 90% 覆盖率：$\mu$-Diffusion | 0.36 | 0.31 | 0.24 | 0.18 |
| 90% 覆盖率：MeanFlow | 0.49 | 0.49 | 0.51 | 0.55 |
| 90% 覆盖率：Diffusion | 0.24 | 0.18 | 0.13 | 0.10 |

为评估更好的校准能否转化为实际通信性能收益，表 III 还给出可达速率 CRPS。带先验的 MeanFlow 在 0–10 dB 的低、中 SNR 范围内取得最低值，优于少步扩散模型。20 dB 时，两种生成模型的性能变得相近，因为可达速率逐渐趋向饱和。这些结果说明，在预测不确定性更加显著的工作区间，MeanFlow 的校准优势能够带来可测量的下游性能收益。

**表 IV：DDIM 采样步数对扩散预测精度及可靠性的影响**

| 模型（每帧 NFE） | NMSE | cov90 |
|---|---:|---:|
| $\mu$-Diffusion（3） | -11.2 | 0.19 |
| $\mu$-Diffusion（10） | -11.1 | 0.37 |
| $\mu$-Diffusion（20） | -10.9 | 0.47 |
| $\mu$-Diffusion（50） | -10.7 | 0.54 |
| $\mu$-MeanFlow（1） | -10.5 | 0.72 |

最后，表 IV 考察扩散模型的过度自信是否主要由 DDIM 只执行 3 步采样造成。增加采样步数可持续改善校准效果，90% 覆盖率从 0.19 增至 0.54。不过，这也会轻微牺牲集合 NMSE（由 -11.2 dB 变为 -10.7 dB），因为更忠实的采样器产生更多样化的样本集合，集合均值因而成为略微更嘈杂的点估计。尽管存在这种折中，即便使用 50 步 DDIM，扩散模型的校准程度仍不如一步 $\mu$-MeanFlow：两者覆盖率分别为 0.54 和 0.72。这说明增加 DDIM 步数能够缓解、但不能消除扩散模型的过度自信。

### E. 推理复杂度与时延

由于 MeanFlow 和扩散模型使用相同的时间编码器和生成器，它们拥有相同的参数量（220 万）；推理成本差异仅来自生成器的评估次数 NFE。分析面向单用户的一步预测成本，这也是实时 CSI 预测对时延最敏感的运行点。由于时间编码器采用循环式 ConvLSTM，每次自回归预测只需要将隐藏状态向前推进一帧。因此，每步计算成本为：

$$
C_{\rm step}=C_{\rm enc}+N_{\rm NFE}C_{\rm gen}. \tag{17}
$$

其中，$C_{\rm enc}$ 表示一次循环编码器更新成本，$C_{\rm gen}$ 表示一次生成器（U-Net）评估成本；MeanFlow 采用 $N_{\rm NFE}=1$，扩散模型则采用 $N_{\rm NFE}\ge3$。

表 V 给出在 NVIDIA A40 上测得的结果。循环编码器一步仅需 0.35 ms，因而是很小的固定开销。MeanFlow 的一步预测耗时 6.8 ms，扩散模型在 3 NFE 时需 19.8 ms，在 50 NFE 时可达 324.7 ms，即时延分别增加 2.9 倍至 47.5 倍。由于编码器成本相对较小，时延比主要由 NFE 决定，因而在相当程度上不依赖硬件。FLOPs 也表现出相同排序。

**表 V：推理复杂度**

| 模型（NFE） | 时延（ms） | FLOPs（M） |
|---|---:|---:|
| MeanFlow（1） | 6.8 | 561 |
| Diffusion（3） | 19.8 | 917 |
| Diffusion（10） | 65.2 | 2162 |
| Diffusion（20） | 130.1 | 3941 |
| Diffusion（50） | 324.7 | 9278 |

最后，由于每步时延主要由生成器评估决定，可以在几乎不增加时延的情况下扩大 MeanFlow 生成器容量，以提高准确性。图 4 绘制了不同规模 MeanFlow 的 NMSE—单步时延曲线，同时给出默认主干下不同 NFE 的扩散模型结果。

**图 4：** 点预测精度与单步推理时延。MeanFlow 的小、中、大三种配置仅改变共享 U-Net 生成器的规模，其基础宽度分别为 24、32、48 通道，模型总参数量分别为 170 万、220 万和 380 万。中等规模模型是文章其他实验使用的默认配置。MeanFlow 的性能前沿始终位于扩散模型的左下方：扩大生成器可沿近乎竖直的低时延曲线降低 NMSE。特别地，最大 MeanFlow 模型的 NMSE 为 -11.67 dB，优于最佳扩散模型配置的 -11.15 dB，而单步时延只有后者约一半（8.1 ms 对 19.8 ms）。因此，对于 CSI 预测，把计算资源用于更大的一步生成器，比用于增加扩散采样步数更加有效。

## V. 结论

提出一种基于 MeanFlow 的一步生成式 CSI 预测框架，以降低实时无线应用中生成模型的推理复杂度和时延。为缓解直接从纯随机噪声生成未来 CSI 的难度，引入信道信息先验，使生成过程从未来信道的信息性估计初始化，从而显著提高点预测精度和不确定性校准效果。

在控制条件下，使用相同编码器及生成器架构，对 MeanFlow 与先进的扩散式 CSI 预测模型进行比较，并通过点预测指标与预测分布质量指标共同评价。结果表明，一步 MeanFlow 可获得与少步扩散模型相近的点预测精度，同时提供明显更好的不确定性校准及下游性能。此外，MeanFlow 在精度与时延之间表现出良好的扩展趋势：增大一步生成器规模仅略微增加时延，却能改善 NMSE，说明提高一步生成器的容量比增加扩散采样步骤更值得投入计算资源。

后续研究将考察**具有信道结构的源先验**：利用无线信道残差在角度—时延域的结构化稀疏性，进一步提高 CSI 生成及不确定性估计质量。

## 参考文献

参考文献保持原作的英文书目信息和编号，避免将译文题名误认为正式出版题名；下列文献表用于原文 [1]–[14] 的定位。

[1] E. G. Larsson, O. Edfors, F. Tufvesson, and T. L. Marzetta, “Massive MIMO for next generation wireless systems,” IEEE Communications Magazine, 52(2), 186–195, 2014.

[2] H. Kim, S. Kim, H. Lee, C. Jang, Y. Choi, and J. Choi, “Massive MIMO channel prediction: Kalman filtering vs. machine learning,” IEEE Transactions on Communications, 69(1), 518–528, 2021.

[3] H. Yin, H. Wang, Y. Liu, and D. Gesbert, “Addressing the curse of mobility in massive MIMO with Prony-based angular-delay domain channel predictions,” IEEE Journal on Selected Areas in Communications, 38(12), 2903–2917, 2020.

[4] K. E. Baddour and N. C. Beaulieu, “Autoregressive modeling for fading channel simulation,” IEEE Transactions on Wireless Communications, 4(4), 1650–1662, 2005.

[5] W. Jiang and H. D. Schotten, “Deep learning for fading channel prediction,” IEEE Open Journal of the Communications Society, 1, 320–332, 2020.

[6] H. Jiang, M. Cui, D. W. K. Ng, and L. Dai, “Accurate channel prediction based on transformer: Making mobility negligible,” IEEE Journal on Selected Areas in Communications, 40(9), 2717–2732, 2022.

[7] Y. Jin, Y. Wu, Y. Gao, S. Zhang, S. Xu, and C.-X. Wang, “Linformer: A linear-based lightweight transformer architecture for time-aware MIMO channel prediction,” IEEE Transactions on Wireless Communications, 2025.

[8] S. Fan, Z. Liu, X. Gu, and H. Li, “CSI-LLM: A novel downlink channel prediction method aligned with LLM pre-training,” IEEE WCNC, 2025, pp. 1–6.

[9] M. Sattari, J. Aliakbari, A. G. i Amat, and T. Svensson, “CSI prediction using diffusion models,” IEEE Transactions on Wireless Communications, vol. 25, pp. 21418–21432, 2026.

[10] M. Sattari, J. Aliakbari, A. G. I. Amat, and T. Svensson, “CSI prediction using autoregressive conditional diffusion models,” in Proc. IEEE International Conference on Communications (ICC), 2026, pp. 1–6.

[11] J. Ho, A. Jain, and P. Abbeel, “Denoising diffusion probabilistic models,” in Advances in Neural Information Processing Systems (NeurIPS), vol. 33, 2020, pp. 6840–6851.

[12] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, and M. Le, “Flow matching for generative modeling,” 2023. https://arxiv.org/abs/2210.02747

[13] Z. Geng, M. Deng, X. Bai, J. Z. Kolter, and K. He, “Mean flows for one-step generative modeling,” 2025. https://arxiv.org/abs/2505.13447

[14] J. Hoydis, S. Cammerer, F. A. Aoudia, A. Vem, N. Binder, G. Marcus, and A. Keller, “Sionna: An open-source library for next-generation physical layer research,” 2023. https://arxiv.org/abs/2203.11854

{% endraw %}
