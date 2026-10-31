---
layout: page
title: "非均匀导频图案下的连续时间 Transformer 信道预测｜中文译稿（许可待核）"
permalink: /papers/translations/2026-10-22-continuous-time-transformer-based-channel-prediction-with-non-uni-0420e0d8/
math: true
toc: true
---

{% raw %}
[← 返回论文库](/papers/) · [对应论文](/papers/items/0420e0d84fe1b48f/) · 原文为期刊正式版（IEEE TWC），许可待核验 · [全部目录](/papers/catalog/)

# 非均匀导频图案下的连续时间 Transformer 信道预测

**原题：** Continuous-Time Transformer Based Channel Prediction with Non-Uniform Pilot Pattern  
**作者：** Yiliang Sang、Ke Ma、Lebin Yao、Pengyu Wang、Zhaocheng Wang（Fellow, IEEE；通讯作者）、Zhu Han（Fellow, IEEE）、Sheng Chen（Life Fellow, IEEE）  
**版本：** 期刊正式版（IEEE Transactions on Wireless Communications，2026-10-22 推荐），本地 PDF 16 页；再传播许可待核验，本页仅作学习用途，不计入可公开全文统计。  
**范围与状态：** 全文中文译稿：摘要、正文第 I–VI 节（含 II-A/B、III-A/B、IV-A–D、V-A/B 全部小节）、结论、附录 A、表 I–XI 逐格、图 1–9 图注、基金与作者单位说明、参考文献 [1]–[64]（英文原条目）按原文结构录入；逐句逐式终校未做。

> **许可与使用说明（保持原文说明不变）：** 本页为 IEEE Transactions on Wireless Communications 期刊正式版的**中文学习译稿**；原文版权归 IEEE 与作者所有，**再传播许可待核验**，故本页**仅作学习用途，不计入可公开全文的统计口径**。原文代码公开于 https://github.com/sangyl23/Continuous-Time-Transformer 。

## 摘要

基于深度学习的信道预测已受到广泛关注，用于缓解高移动性多输入多输出（MIMO）系统中的信道老化（channel aging）。然而现有信道预测方法从**均匀导频**处估计的信道序列中提取时间相关性，这在高移动性场景下需要密集的导频配置以缓解**多普勒混叠**（Doppler aliasing），并带来可观的信道估计开销。为解决该问题，我们提出一种基于**连续时间 Transformer** 与**非均匀导频图案**的信道预测方法，从而仅用少量导频即可实现任意时间尺度上的准确预测。具体地，我们首先设计基于 **Chebyshev 多项式根**的非均匀导频图案，并在"多普勒主导的信道变化 + 用户速度相对稳定"条件下证明其最优性——其中一部分导频被密集配置，以提供更精细的多普勒相位估计分辨率。为适配非均匀图案，进一步提出连续时间 Transformer：它把 Transformer 强大的特征提取能力与神经常微分方程（neural ODE）的连续时间建模能力结合，以灵活处理具有非均匀时间尺度的估计信道序列。更具体地，通过引入 neural ODE 把注意力机制推广到连续时间域，并设计**高频时间编码**以拟合快速时变信道；此外提出**逐元素预测机制**以高效捕获时间相关性并防止过拟合。仿真结果表明，所提方法能在高移动性场景中实现准确的连续时间信道预测，并显著优于现有信道预测方法。

**索引词：** 多输入多输出、信道预测、高移动性场景、多普勒混叠、深度学习。

## I. 引言

多输入多输出（MIMO）是 5G、6G 及未来无线通信系统的基本技术之一 [1]。为充分发挥 MIMO 在下行传输中的潜力，需要在基站（BS）处准确估计无线信道。然而，随着用户设备（UE）数与天线数呈指数增长 [2]、[3]，信道估计会带来巨大的导频开销；此外，为缓解移动场景中的信道老化 [4]，需要周期性地执行信道估计，进一步加剧导频开销问题。为解决上述问题，信道预测被广泛采用——利用历史信道与未来信道之间的时间相关性来预测未来信道序列 [5]。

传统信道预测方法主要包括自回归（AR）模型 [6]、[7]、正弦和（sum-of-sinusoids）模型 [8] 与线性外推模型 [9]。具体地，文献 [6] 设计了带 AR 参数估计的向量 Kalman 滤波器；文献 [7] 利用角度—时延域的信道稀疏性改进 AR 模型性能；文献 [8] 提出用 ESPRIT 估计信号参数的正弦和模型；文献 [9] 推导了基于 Prony 的线性外推预测器。然而这些传统方法通常依赖严格假设（如路径数），可能与实际复杂多径信道不匹配，从而导致严重性能退化。

为解决该问题，基于深度学习的信道预测得到广泛研究 [10]–[17]，得益于深度学习能以数据驱动方式提取信道序列中复杂精细的相关性。具体地，文献 [10] 用经典循环神经网络（RNN）捕获信道序列的时间相关性；文献 [11] 提出 RNN 变体——长短期记忆（LSTM）与门控循环单元（GRU）——以实现更准确的预测。然而这类 RNN 式网络以**串行方式**预测未来信道序列，难以准确捕获长期依赖 [18]，并存在误差累积问题 [19]。相比之下，Transformer 凭借注意力机制有效提取长期依赖、并通过并行预测避免误差累积，已被广泛应用于信道预测 [12]–[14]、信道估计 [20]–[23] 与预测波束成形 [24]–[27]。例如，文献 [12] 提出带并行预测框架的生成式 Transformer；文献 [13] 采用 Transformer 与 GRU 结合的混合预测模型；文献 [14] 设计了仅编码器的线性轻量 Transformer；文献 [15] 比较了不同神经网络的预测性能；此外，文献 [16] 利用 UE 位置信息，提出受物理启发、名为 C-GRBFnet 的模型以实现高效信道表示与预测；文献 [17] 推导了新的信道推断框架，把历史信道序列信息与当前信道的粗估计融合以增强预测鲁棒性。

然而，由于上述方法**未对具体时间间隔建模**，它们只能预测具有**均匀时间尺度**的未来信道序列——即历史与预测信道序列的周期必须严格相等。因此，为缓解高移动性场景中严重的信道老化，需要频繁执行信道估计以获得短预测周期的未来信道序列，这不可避免地带来巨大导频开销。

为在不增加额外信道估计的情况下实现更细时间尺度的预测，**连续时间信道预测**近年来受到广泛关注 [28]–[32]：它从均匀导频处估计的信道序列重建底层连续时间信道。作为连续时间建模的常用方法，神经 ODE 用神经网络拟合信道动力学，并应用数值积分实现任意时间尺度预测：文献 [28] 提出用 RNN 从历史信道序列捕获时间相关性，其输出被 neural ODE 用于连续时间信道预测；文献 [29]、[30] 分别设计 neural ODE 与 LSTM、GRU 的结合；文献 [31] 提出受物理启发的 neural ODE 以有效学习信道动力学；很近的工作 [32] 提出 ODE-Former，支持从任意时隙采样的信道序列进行连续时间预测——它把类 Transformer 结构与 neural ODE 结合以增强学习能力，并利用**积分长度**而非注意力机制来直接确定时间关系。

然而，这些现有基于 neural ODE 的方法面临三个问题，可能显著降低连续时间预测性能。第一，最关键的问题是**多普勒混叠**：信道的时间变化主要源于多普勒相位的旋转，而多普勒相位正比于 UE 速度 [12]、[33]；当 UE 速度增大时，相邻两次信道估计之间多普勒相位可能旋转超过一个完整周期（$2\pi$）。此时根据 Nyquist 准则发生多普勒混叠，意味着用于重建连续时间信道的精确多普勒相位估计变得不可行。为避免多普勒混叠，现有基于 neural ODE 的方法必须密集插入大量均匀导频，导致巨大估计开销。第二，现有基于 neural ODE 的方法一般依赖 RNN 式神经网络提取信道序列内的时间相关性，这使其难以精确捕获长期依赖并导致误差累积。第三，现有基于 neural ODE 的方法把信道向量变换到角度域，然后通过同时利用信道的空间与时间相关性一次性预测其全部元素，称为**向量式（vector-wise）预测机制**。该机制在不同角度域信道向量元素之间强制共享同一时间相关成分（如 Transformer 的注意力权重）。然而不同元素一般对应不同传播路径、呈现多样多普勒频移 [7]，因此同一角度域信道向量内各元素的时间动态通常并不一致；在向量式预测机制中跨不同元素强制共享时间相关成分，会损害预测性能。此外，由于一个元素可能包含其他元素的冗余信息，向量式预测机制可能无意中妨碍对每个元素时间相关性的精确提取并增加过拟合风险。

为解决上述问题，本文提出**带非均匀导频图案的逐元素（element-wise）连续时间 Transformer** 用于信道预测。具体地，提出基于 Chebyshev 多项式根的非均匀导频图案，其中一部分导频以高密度配置——这样，在相同导频开销下，所提非均匀图案可实现比均匀图案精细得多的多普勒相位估计分辨率。此外，在"多普勒主导的信道变化 + UE 速度相对稳定"条件下，我们证明所提非均匀导频图案在**最大范数**意义上最优地促进连续时间信道的精确重建。我们还设计了专用于任意时间尺度准确预测的连续时间 Transformer，把 Transformer 强大的特征提取能力与 neural ODE 的连续时间建模能力结合。与 ODE-Former [32] 通过积分长度直接确定时间关系不同，所提连续时间 Transformer 通过 neural ODE 把注意力机制显式推广到连续时间域，从而实现对连续时间相关性的自适应提取。更具体地，注意力机制中的查询、键、值通过 neural ODE 与闭式插值函数推广为对应的连续时间轨迹；随后这些轨迹之间的相关性由数值积分求解，从而实现连续时间注意力。同时，我们设计**高频时间编码**替代 Transformer 中的标准位置编码，把时间信息显式嵌入网络输入，使高移动性场景中快速时变信道得以有效拟合。此外，受时间序列建模中著名的**通道独立（channel-independent）框架** [19]、[34] 启发，我们提出一次性预测信道向量的每个元素而非整个信道向量，且不同元素的预测共享同一网络参数——该预测机制称为逐元素预测，可生成元素特定的注意力权重以有效捕获时间相关性并缓解过拟合。仿真结果表明，所提方法能在高移动性场景中实现准确的连续时间信道预测，并显著超越传统对应方法。代码已公开于 [35] 以便复现。本文主要贡献如下：

- 我们从 Nyquist 准则角度理论分析连续时间信道预测在高移动性场景下面临的多普勒混叠问题。为解决该问题，提出基于 Chebyshev 多项式根的非均匀导频图案，相比均匀导频图案能提供显著更精细的多普勒相位估计分辨率；并证明所提非均匀导频图案在最大范数意义下对连续时间信道重建最优。
- 我们提出连续时间 Transformer：把注意力机制与 neural ODE 集成以准确提取任意时间尺度上的相关性，并设计高频时间编码以有效跟踪快速时变信道；在此基础上进一步提出逐元素预测机制，使连续时间 Transformer 专注于高效提取每个元素的时间相关性并降低过拟合风险。

**表 I** 简要比较了所提方法与现有基于深度学习的信道预测方法。与这些现有方法相比，我们的方法利用非均匀导频图案有效解决多普勒混叠，把 Transformer 与 neural ODE 集成以实现准确的任意时间尺度预测，并采用逐元素预测机制高效捕获时间相关性。

**表 I　所提方法与现有基于深度学习的信道预测方法比较**

| 方法 | 注意力机制 | 连续时间建模 | 导频图案 | 预测机制 |
|---|---|---|---|---|
| RNN 类 [10]、[11] | × | × | 均匀 | 向量式 |
| Transformer [12]–[14] | √ | × | 均匀 | 向量式 |
| Neural ODE [28]–[31] | × | √ | 均匀 | 向量式 |
| 本文方法 | √ | √ | 非均匀 | 逐元素 |

本文组织如下：第 II 节为系统模型；第 III 节分析连续时间信道预测的多普勒混叠问题并详述所提非均匀导频图案；第 IV 节给出所提连续时间 Transformer 与逐元素预测机制；第 V 节给出仿真结果；最后第 VI 节总结结论。

**记号。** $\mathbb C^{m\times n}$ 与 $\mathbb R^{m\times n}$ 分别表示 $m\times n$ 复空间与实空间。$\mathcal C^N[a,b]$ 表示闭区间 $[a,b]$ 上 $N$ 次连续可微实值函数构成的空间。$\mathrm j=\sqrt{-1}$ 表示虚数单位。向量与矩阵分别用粗体小写字母与粗体大写字母表示。$[\cdot]_i$ 表示向量的第 $i$ 个元素，$[\cdot]_{i,j}$ 表示矩阵的第 $(i,j)$ 个元素。$(\cdot)^\top$ 表示转置。$\|\cdot\|_2$ 表示向量的 2-范数。$|\cdot|$ 表示模运算，$\lceil\cdot\rceil$ 表示上取整函数。$\|f\|_\infty=\max_{x\in[a,b]}|f(x)|$ 表示函数 $f$ 的一致范数。$a\propto b$ 表示 $a$ 正比于 $b$。$\mathrm{mod}(x,2\pi)$ 表示 $x$ 对 $2\pi$ 取模。$\mathbb N^+$ 为正自然数集合，$\mathcal T$ 表示时隙集合。

## II. 系统模型

本文为简化考虑一个基站服务单个单天线 UE 的场景，但所提信道预测方法可直接扩展到多天线 UE。进一步假设基站配备均匀平面阵列（UPA）的双极化天线，水平与垂直方向天线数分别为 $M_h$ 与 $M_v$，故基站总天线数为 $M=2M_hM_v$。

### A. 信道模型

采用三维时变多径信道模型 [36]（已被现有信道预测工作广泛采用 [37]、[38]）。记时隙 $t$ 的信道向量为 $\mathbf h(t)\in\mathbb C^{M\times1}$，其第 $m$ 个元素 $[\mathbf h(t)]_m$ 可表示为

$$
[\mathbf h(t)]_m=\sum_{l_p=1}^{L_p}\alpha_{l_p}\mathrm e^{\mathrm j2\pi\frac{(\mathbf r_{\mathrm{tx},l_p})^\top\mathbf d_{\mathrm{tx},m}}{\lambda}}\mathrm e^{\mathrm j2\pi f_{D,l_p}t}\mathrm e^{-\mathrm j2\pi f_c\tau_{l_p}}, \tag{1}
$$

其中 $L_p$ 为路径数，$\alpha_{l_p}$、$f_{D,l_p}$、$\tau_{l_p}$ 分别为第 $l_p$ 条路径的复增益、多普勒频移与时延，$\lambda$ 为波长、$f_c$ 为载频，$\mathbf d_{\mathrm{tx},m}$ 表示第 $m$ 根基站天线的位置向量，$\mathbf r_{\mathrm{tx},l_p}$ 表示方位离开角 $\phi_{\mathrm{tx},l_p}$ 与俯仰离开角 $\theta_{\mathrm{tx},l_p}$ 处的球面单位向量：

$$
\mathbf r_{\mathrm{tx},l_p}=\left[\sin\theta_{\mathrm{tx},l_p}\cos\phi_{\mathrm{tx},l_p},\ \sin\theta_{\mathrm{tx},l_p}\sin\phi_{\mathrm{tx},l_p},\ \cos\theta_{\mathrm{tx},l_p}\right]^\top. \tag{2}
$$

式 (1) 中信道的时间变化源于多普勒相位 $2\pi f_{D,l_p}t$ 的旋转，多普勒频移 $f_{D,l_p}$ 可进一步写为 [7]、[12]、[33]

$$
f_{D,l_p}=\frac{f_c\left(\mathbf r_{\mathrm{rx},l_p}\right)^\top\mathbf v}{c}, \tag{3}
$$

其中 $c$ 为光速，$\mathbf r_{\mathrm{rx},l_p}$ 为方位到达角 $\phi_{\mathrm{rx},l_p}$ 与俯仰到达角 $\theta_{\mathrm{rx},l_p}$ 处的球面单位向量（把式 (2) 中 $(\phi_{\mathrm{tx},l_p},\theta_{\mathrm{tx},l_p})$ 换成 $(\phi_{\mathrm{rx},l_p},\theta_{\mathrm{rx},l_p})$ 即得），$\mathbf v$ 为 UE 在方位角 $\phi_v$、俯仰角 $\theta_v$ 处的速度向量：

$$
\mathbf v=v\left[\sin\theta_v\cos\phi_v,\ \sin\theta_v\sin\phi_v,\ \cos\theta_v\right]^\top. \tag{4}
$$

式 (4) 中 $v$ 为 UE 速率。由式 (3)、(4)，随着 UE 速率 $v$ 增大，多普勒频移 $f_{D,l_p}$ 变大，从而导致更剧烈的时间信道变化。

**图 1：** 不同信道预测框架：(a) 均匀导频图案下的均匀时间尺度预测；(b) 均匀导频图案下的连续时间预测；(c) 非均匀导频图案下的连续时间预测。当前时隙定义为 0 ms，均匀与非均匀导频图案的估计时隙分别设为 $\{-80,-70,-60,-50,-40,\cdots,0\}$ ms 与 $\{-80,-78,-60,-42,-40,\cdots,0\}$ ms。

### B. 问题建模

记时隙 $t$ 处估计的信道向量为 $\hat{\mathbf h}(t)\in\mathbb C^{M\times1}$。为缓解移动场景中的信道老化，信道预测通过利用历史估计信道序列获得未来信道序列。多数现有信道预测工作 [10]–[17] 关注如图 1(a) 所示的**均匀时间尺度**预测 $g_{\mathrm{uni}}(\cdot)$。把当前时隙定义为 0，则均匀时间尺度预测可表述为

$$
\left\{\hat{\mathbf h}(pT_e)\right\}_{p=1}^{P}=g_{\mathrm{uni}}\left(\left\{\hat{\mathbf h}\left((j-J)T_e\right)\right\}_{j=1}^{J}\right), \tag{5}
$$

其中 $T_e$ 表示信道估计周期，$J$ 与 $P$ 分别为估计信道序列与预测信道序列的长度，$\hat{\mathbf h}(t)\in\mathbb C^{M\times1}$ 表示时隙 $t$ 的预测信道向量。由于均匀时间尺度预测未对具体时间间隔建模，只能准确预测周期为 $T_e$ 的信道序列。然而在高移动性场景中信道老化变得严重；为解决该问题，均匀时间尺度预测需要缩短估计周期 $T_e$，这会带来巨大导频开销。

为处理该问题，近期工作 [28]–[31] 研究了连续时间信道预测：从历史信道序列重建底层连续时间信道，从而实现任意时间尺度预测。具体地，考虑估计时隙 $\{t_j\}_{j=1}^{J}$（$t_j\le0$）与预测时隙 $\{t_p\}_{p=1}^{P}$（$t_p>0$），连续时间预测 $g_{\mathrm{con}}(\cdot)$ 可表述为

$$
\left\{\hat{\mathbf h}(t_p)\right\}_{p=1}^{P}=g_{\mathrm{con}}\left(\left\{\hat{\mathbf h}(t_j),t_j\right\}_{j=1}^{J},\ \left\{t_p\right\}_{p=1}^{P}\right), \tag{6}
$$

其中时间信息被嵌入网络输入以重建连续时间信道。对这些现有连续时间预测工作，估计信道序列中假设**均匀导频图案**（图 1(b)），即 $t_j=(j-J)T_e$（$j\in\{1,2,\ldots,J\}$）。然而高移动性场景中的连续时间信道预测可能需要密集插入大量均匀导频，原因详见下一节。

## III. 面向连续时间信道预测的非均匀导频图案

本节先介绍高移动性场景中连续时间信道预测面临的多普勒混叠挑战；接着提出如图 1(c) 所示的非均匀导频图案，它提供更精细的多普勒相位估计分辨率以解决多普勒混叠问题；然后在最大范数意义下证明所提非均匀导频图案对连续时间信道重建的最优性。为便于阅读，本节所用记号定义列于表 II。

**表 II　记号定义**

| 记号 | 定义 |
|---|---|
| $J/\tilde J$ | 插入附加导频前/后的信道序列估计长度 |
| $T_e$ | 插入附加导频前的估计周期 |
| $T_{e,\min}$ | 最小估计周期 |
| $T_{\mathrm{che},\min}/T_{\mathrm{uni},\min}$ | 非均匀/均匀导频图案的最小估计周期 |
| $N$ | 插入的附加导频数 |
| $N_{\min}$ | 插入的附加导频最小数 |
| $t_{\mathrm{che}}^{(n)}/t_{\mathrm{che},j}^{(n)}$ | 区间 $[-1,1]$ 与 $[(j-J)T_e,(j+1-J)T_e]$ 内第 $n$ 个插入导频的时隙 |
| $t_{\mathrm{che},j}$ | 插入非均匀导频图案后第 $j$ 个导频的时隙 |

### A. 高移动性场景中的多普勒混叠

从估计信道序列重建底层连续时间信道是实现任意时间尺度准确预测的关键。然而该重建根据 Nyquist 准则对最小信道估计周期 $T_{e,\min}$ 施加约束，由下述定理给出。

**定理 1。** 为避免多普勒混叠，最小信道估计周期 $T_{e,\min}$ 需满足

$$
T_{e,\min}<\frac{c}{f_cv}. \tag{7}
$$

**证明。** 由式 (1) 与 (3)，信道的时间变化部分为解析信号 $\mathrm e^{\mathrm j2\pi\frac{f_c(\mathbf r_{\mathrm{rx},l_p})^\top\mathbf v}{c}t}$；当式 (2) 中的球面单位向量 $\mathbf r_{\mathrm{rx},l_p}$ 与式 (4) 中的 UE 速度向量 $\mathbf v$ 对齐时，多普勒相位的最大旋转为 $2\pi\frac{f_cv}{c}t$。根据解析信号的 Nyquist 准则 [39]，最小信道估计周期 $T_{e,\min}$ 需满足

$$
2\pi\frac{f_cv}{c}T_{e,\min}<2\pi, \tag{8}
$$

其等价于 (7)。■

**注 1：** 图 2 绘出信道时间变化部分 $\mathrm e^{\mathrm j2\pi\frac{f_c(\mathbf r_{\mathrm{rx},l_p})^\top\mathbf v}{c}t}$ 以帮助理解多普勒混叠。由于周期性，只能估计一个完整周期内多普勒相位的旋转，即 $\mathrm{mod}\left(2\pi\frac{f_c(\mathbf r_{\mathrm{rx},l_p})^\top\mathbf v}{c}t,2\pi\right)$。当 $T_{e,\min}\ge\frac{c}{f_cv}$ 时，多普勒相位最大旋转满足 $2\pi\frac{f_cv}{c}T_{e,\min}\ge2\pi$；此时实际的多普勒相位旋转 $2\pi\frac{f_c(\mathbf r_{\mathrm{rx},l_p})^\top\mathbf v}{c}t$ 可能无法从估计的相位旋转 $\mathrm{mod}\left(2\pi\frac{f_c(\mathbf r_{\mathrm{rx},l_p})^\top\mathbf v}{c}t,2\pi\right)$ 中恢复。

**注 2：** 多普勒混叠是实际场景中常见的问题。例如，考虑广泛使用的载频 $f_c=3.5$ GHz 与 UE 速率 $v=60$ km/h，为避免多普勒混叠需 $T_{e,\min}<5.14$ ms。然而根据第三代合作伙伴计划（3GPP）规范 [40]，最大信道估计周期可设为 160 ms，因此该场景中可能发生多普勒混叠。

### B. 基于 Chebyshev 多项式根的非均匀导频

为解决高移动性场景中的多普勒混叠，现有基于均匀导频的连续时间预测方法需缩短估计周期以满足定理 1 的 $T_{e,\min}\le\frac{c}{f_cv}$，这会带来可观的导频开销。所幸实际场景中 UE 通常不会突然剧烈改变速度，根据式 (3)，在若干次信道估计期间相应多普勒频移保持相对稳定。因此我们可在原估计周期 $T_e$ 内插入少量非均匀导频，使导频之间的最小时间间隔满足 $T_{e,\min}<\frac{c}{f_cv}$，从而准确估计 $T_{e,\min}$ 内的多普勒相位旋转。注意为简化记号，下文略微滥用 $T_e$ 的定义，指插入附加导频**之前**的原估计周期。于是由于多普勒频移的平稳性，原估计周期 $T_e$ 内的多普勒相位旋转可由 $T_{e,\min}$ 内准确估计的旋转外推得到，从而有效克服多普勒混叠。

此外，在 $T_{e,\min}<\frac{c}{f_cv}$ 约束下，导频图案的时间分布应有利于连续时间信道的准确重建。受 Chebyshev 多项式根在函数插值领域成功应用的启发 [41]，我们在下述引理与定理中提出一种非均匀导频图案。

**图 3：** Chebyshev 非均匀导频图案 $\{t_{\mathrm{che},j}^{(n)}\}_{n=1}^{N}$ 示意，假设插入附加导频数 $N=3$，$\left\{\frac{5\pi}{6},\frac{3\pi}{6},\frac{\pi}{6}\right\}$ 对应式 (12) 中 $t_{\mathrm{che},j}^{(1)}$、$t_{\mathrm{che},j}^{(2)}$、$t_{\mathrm{che},j}^{(3)}$ 的角度 $\frac{2N-2n+1}{2N}\pi$。

**引理 1。** 在所有 $N$ 个互异时隙 $\mathcal T=\{t^{(n)}\}_{n=1}^{N}\subset[-1,1]$ 的选择中，Chebyshev 多项式根

$$
t_{\mathrm{che}}^{(n)}=\cos\left(\frac{2N-2n+1}{2N}\pi\right),\qquad n\in\{1,2,\ldots,N\}, \tag{9}
$$

在最大范数准则下对重建 $\mathcal C^N([-1,1])$ 中的连续时间函数最优。

**证明。** 令 $h(t),\hat h(t)\in\mathcal C^N([-1,1])$ 分别表示目标函数与重建函数。由于实际场景中 $h(t)$ 未知，具体 $\hat h(t)$ 无法由理论分析确定；而时隙 $\mathcal T$ 可预置，且文献 [42]、[43] 已证明

$$
\left\|h(t)-\hat h(t)\right\|_\infty\propto\max_{t\in[-1,1]}\left|\prod_{n=1}^{N}\left(t-t^{(n)}\right)\right|,\qquad t\in[-1,1]. \tag{10}
$$

进一步可导出 [41]

$$
\left\{t_{\mathrm{che}}^{(n)}\right\}_{n=1}^{N}=\arg\min_{\{t^{(n)}\}_{n=1}^{N}}\ \max_{t\in[-1,1]}\left|\prod_{n=1}^{N}\left(t-t^{(n)}\right)\right|, \tag{11}
$$

即选择 $\mathcal T=\{t_{\mathrm{che}}^{(n)}\}_{n=1}^{N}$ 最优地促进 $h(t)$ 的重建。■

**定理 2。** 在第 $j$ 次与第 $(j+1)$ 次信道估计之间的时间区间 $T_j=[(j-J)T_e,(j+1-J)T_e]$ 内，插入导频的时隙 $\mathcal T_{\mathrm{che},j}=\{t_{\mathrm{che},j}^{(n)}\}_{n=1}^{N}$（其中

$$
t_{\mathrm{che},j}^{(n)}=\frac{(2j-2J+1)T_e}{2}+\frac{T_e}{2}\cos\left(\frac{2N-2n+1}{2N}\pi\right) \tag{12}
$$

）在多普勒主导、UE 速度相对稳定的信道变化下对连续时间信道重建最优，其中为避免多普勒混叠所需的最小插入导频数 $N_{\min}$ 需满足

$$
N\ge N_{\min}=\left\lceil\frac{\pi}{2\arccos\left(1-\frac{2c}{f_cvT_e}\right)}\right\rceil. \tag{13}
$$

**证明。** (12) 是 (9) 从 $[-1,1]$ 到 $T_j$ 的仿射变换，因而保持重建连续时间函数的最优性。由于 (12) 所用余弦曲线的形状，导频在 $T_j$ 两端密集配置、中部相对稀疏；$t_{\mathrm{che},j}^{(n)}$ 的示意见图 3。具体最小时间间隔为

$$
T_{\mathrm{che},\min}=\frac{T_e}{2}-\frac{T_e}{2}\cos\left(\frac{\pi}{2N}\right), \tag{14}
$$

即从 $(j-J)T_e$ 到 $t_{\mathrm{che},j}^{(1)}$、或从 $t_{\mathrm{che},j}^{(N)}$ 到 $(j+1-J)T_e$ 的时间间隔。基于定理 1，为避免多普勒混叠，最小插入导频数 $N_{\min}$ 需满足 (13)。■

**注 3：** 基于 Chebyshev 的非均匀导频图案的最优性依赖"多普勒主导的信道变化 + UE 速度相对稳定"这一假设，对较短的估计区间 $T_e$ 通常是现实的。具体地，考虑 3GPP 规范中的典型估计区间（如 $T_e=40$ ms [40]）、UE 速率 $v=60$ km/h 与高加速度 $a=4$ m/s² [44]、[45]，UE 速率最大变化约 $aT_e=0.16$ m/s，可忽略不计——表明在短估计区间 $T_e$ 内 UE 速度相对稳定。此外最大 UE 位移约 $vT_e=0.67$ m，与基站到 UE 的典型距离相比很小。因此多条路径的生灭过程与散射环境变化可忽略，信道变化的主导因素是多普勒频移 [7]、[12]、[14]、[46]。简言之，当估计区间 $T_e$ 较短时，"多普勒主导的信道变化 + UE 速度相对稳定"的假设通常成立，定理 2 的最优性推导有效。然而当估计区间 $T_e$ 较长时，散射环境可能快速变化，或 UE 速度可能突变为；这些场景下基于 Chebyshev 的非均匀导频图案的最优性可能不严格成立，此时应依据感知到的散射环境复杂度与 UE 速度来配置导频图案。

**注 4：** 文献 [47]、[48] 提出基于深度学习的导频信号与信道估计联合设计，其中信道被全连接（FC）层压缩到低维接收信号，其可学习权重被视为导频信号；进一步地，[48] 通过神经网络剪枝在不同正交频分复用（OFDM）符号与子载波上移除最不重要的导频，从而以仅边际的估计性能退化为代价降低导频开销。然而上述导频设计与剪枝针对**给定时间**的信道估计，无法直接推广到本文——本文关注不同时隙上的导频分配以准确捕获信道序列内的时间相关性。另一方面，鉴于深度学习以数据驱动方式感知时间信道变化的能力，把不同时隙上的自适应导频分配结合起来值得未来研究。所提基于 Chebyshev 的非均匀导频图案可作为自适应导频分配的有效初始化，因为它缓解多普勒混叠并促进准确信道预测。

根据定理 2，最终设计的非均匀导频图案为 $\mathcal T_{\mathrm{che}}=\left\{(1-J)T_e,t_{\mathrm{che},1}^{(1)},t_{\mathrm{che},1}^{(2)},\cdots,t_{\mathrm{che},1}^{(N)},(2-J)T_e,\cdots,0\right\}$，其长度为 $\tilde J=J+(J-1)N$。为方便起见，把 $\mathcal T_{\mathrm{che}}$ 的元素重新编号为 $\mathcal T_{\mathrm{che}}=\{t_{\mathrm{che},1},t_{\mathrm{che},2},\cdots,t_{\mathrm{che},\tilde J}\}$，并给出如下推论以表明 $\mathcal T_{\mathrm{che}}$ 在相同开销下比均匀导频图案能提供更精细的多普勒相位估计分辨率（后者为 $\mathcal T_{\mathrm{uni}}=\left\{(1-J)T_e,\left(\frac{N+2}{N+1}-J\right)T_e,\left(\frac{N+3}{N+1}-J\right)T_e,\cdots,0\right\}$）。

**推论 1。** 给定相同的信道估计长度 $\tilde J$，$\mathcal T_{\mathrm{che}}$ 与 $\mathcal T_{\mathrm{uni}}$ 的最小时间间隔满足

$$
T_{\mathrm{che},\min}\le T_{\mathrm{uni},\min},\qquad\forall N\in\mathbb N^+, \tag{15}
$$

其中等号当且仅当 $N=1$ 时成立。

**证明：** 见附录 A。■

总之，基于定理 2，$\mathcal T_{\mathrm{che}}$ 的选择对连续时间信道重建最优；且根据推论 1，相比相同开销的 $\mathcal T_{\mathrm{uni}}$，它具备更强的多普勒混叠缓解能力。

## IV. 逐元素连续时间 Transformer

利用在 $\mathcal T_{\mathrm{che}}$ 处估计的历史信道序列，式 (6) 的连续时间信道预测可进一步改写为

$$
\left\{\hat{\mathbf h}(t_p)\right\}_{p=1}^{P}=g_{\mathrm{con}}\left(\left\{\hat{\mathbf h}(t_{\mathrm{che},j}),t_{\mathrm{che},j}\right\}_{j=1}^{\tilde J},\ \left\{t_p\right\}_{p=1}^{P}\right). \tag{16}
$$

本节聚焦 $g_{\mathrm{con}}(\cdot)$ 的设计：先介绍通过引入 neural ODE 把标准注意力机制推广到连续时间域的连续时间注意力机制；接着提出高频时间编码以准确拟合快速时变信道；最后给出基于逐元素预测机制的连续时间 Transformer 整体架构。为清晰起见，第 IV 节所用记号定义列于表 III。

**表 III　记号定义**

| 记号 | 定义 |
|---|---|
| $\{t_{\mathrm{che},j}\}_{j=1}^{\tilde J}/\{t_p\}_{p=1}^{P}$ | 估计/预测时隙 |
| $\mathbf X/\mathbf X_{\mathrm{tok}}/\mathbf X_{\mathrm{pos}}$ | 输入/词元嵌入/位置嵌入 |
| $\{\tau_l\}_{l=1}^{L}$ | 查询/键/值的采样时隙 |
| $\mathbf q_l/\mathbf k_l/\mathbf v_l$ | $\tau_l$ 处的查询/键/值观测 |
| $\mathbf q_l(t)/\mathbf k_l(t)/\mathbf v_l(t)$ | 基于 $\mathbf q_l/\mathbf k_l/\mathbf v_l$ 的查询/键/值轨迹 |
| $c_{l_1,l_2}$ | 键时隙 $\tau_{l_1}$ 与查询时隙 $\tau_{l_2}$ 处的标准注意力权重 |
| $c(\tau_{l_1},\tau_{l_2})$ | 键时隙 $\tau_{l_1}$ 与查询时隙 $\tau_{l_2}$ 处的连续时间注意力权重 |
| $\bar{\mathbf v}_{l_1}(\tau_{l_2})$ | 值轨迹 $\mathbf v_{l_1}(t)$ 从值时隙 $\tau_{l_1}$ 到查询时隙 $\tau_{l_2}$ 的平均时间影响 |
| $\mathbf o_{l_2}$ | 查询时隙 $\tau_{l_2}$ 处的标准注意力输出 |
| $\mathbf o(\tau_{l_2})$ | 查询时隙 $\tau_{l_2}$ 处的连续时间注意力输出 |

### A. 连续时间注意力机制

作为 Transformer 的基本组件，注意力机制能高效提取序列数据中的时间相关性。具体地，令输入序列为 $\mathbf X=[\mathbf x_1,\mathbf x_2,\cdots,\mathbf x_L]\in\mathbb R^{d_i\times L}$（输入特征维数 $d_i$、序列长度 $L$），对应采样时隙为 $\{\tau_1,\tau_2,\cdots,\tau_L\}$。给定输出特征维数 $d_o$，进一步定义在 $\{\tau_1,\cdots,\tau_L\}$ 处观测到的查询、键、值为 $\{\mathbf q_l\}_{l=1}^{L}$、$\{\mathbf k_l\}_{l=1}^{L}$、$\{\mathbf v_l\}_{l=1}^{L}$，其中 $\mathbf q_l,\mathbf k_l,\mathbf v_l\in\mathbb R^{d_o\times1}$ 分别表示时隙 $\tau_l$ 处的查询、键、值观测，可由 $\mathbf q_l=\mathbf W_q\mathbf x_l$、$\mathbf k_l=\mathbf W_k\mathbf x_l$、$\mathbf v_l=\mathbf W_v\mathbf x_l$ 及相应可训练矩阵 $\mathbf W_q,\mathbf W_k,\mathbf W_v\in\mathbb R^{d_o\times d_i}$ 获得。于是，标准注意力权重 $\{c_{l_1,l_2}\}_{l_1=1}^{L}$（表示所有键时隙 $\{\tau_{l_1}\}_{l_1=1}^{L}$ 到给定查询时隙 $\tau_{l_2}$（$l_2\in\{1,2,\cdots,L\}$）的时间相关性）可由 [12] 计算：

$$
\left\{c_{l_1,l_2}\right\}_{l_1=1}^{L}=\sigma\left(\left\{\frac{(\mathbf k_{l_1})^\top\mathbf q_{l_2}}{\sqrt{d_o}}\right\}_{l_1=1}^{L}\right), \tag{17}
$$

其中 $\sigma(\cdot)$ 表示 softmax 操作、$\frac{1}{\sqrt{d_o}}$ 为归一化缩放因子。最终，给定查询时隙 $\tau_{l_2}$ 处的输出 $\mathbf o_{l_2}\in\mathbb R^{d_o\times1}$ 可表述为

$$
\mathbf o_{l_2}=\sum_{l_1=1}^{L}\mathbf v_{l_1}c_{l_1,l_2}, \tag{18}
$$

即基于相应注意力权重 $\{c_{l_1,l_2}\}_{l_1=1}^{L}$ 对值 $\{\mathbf v_{l_1}\}_{l_1=1}^{L}$ 的线性组合。由式 (17)、(18)，当 $\mathbf q_{l_2}$ 与 $\mathbf k_{l_1}$ 对齐越紧密时，注意力权重 $c_{l_1,l_2}$ 越大，表明输出 $\mathbf o_{l_2}$ 与值 $\mathbf v_{l_1}$ 相关性越强。

然而由于标准注意力机制未对具体时间间隔建模，它受限于**均匀时间尺度**的预测。为克服该限制，通过引入 neural ODE [49]–[52] 设计连续时间注意力机制。具体地，标准注意力中的离散观测 $\{\mathbf q_l\}_{l=1}^{L}$、$\{\mathbf k_l\}_{l=1}^{L}$、$\{\mathbf v_l\}_{l=1}^{L}$ 被扩展为相应连续时间轨迹 $\{\mathbf q_l(t)\}_{l=1}^{L}$、$\{\mathbf k_l(t)\}_{l=1}^{L}$、$\{\mathbf v_l(t)\}_{l=1}^{L}$，其中 $\mathbf q_l(t)\in\mathbb R^{d_o\times1}$ 表示基于观测 $\mathbf q_l$ 在时隙 $t$ 的查询轨迹，$\mathbf k_l(t)$、$\mathbf v_l(t)$ 类似。以 $\mathbf q_l(t)$ 为例，其连续时间建模可用两种不同方案实现：一种是采用闭式插值函数 $f_{\mathrm{interp}}(\cdot)$，即

$$
\mathbf q_l(t)=f_{\mathrm{interp}}\left(\left\{\mathbf q_l,\tau_l\right\}_{l=1}^{L}\right), \tag{19}
$$

其中 $f_{\mathrm{interp}}(\cdot)$ 可用线性插值、样条插值或其他插值方法实现；另一种基于 neural ODE：

$$
\mathbf q_l(t)=\int_{\tau_l}^{t}f_{\mathrm{ODE}}\left(\mathbf q_l(z),z\right)\mathrm dz+\mathbf q_l, \tag{20}
$$

其中 $f_{\mathrm{ODE}}(\cdot)$ 为拟合 $\mathbf q_l(t)$ 导数的神经网络，即 $f_{\mathrm{ODE}}(\mathbf q_l(z),z)=\frac{\mathrm d\mathbf q_l(z)}{\mathrm dz}$，积分可由 Euler、Runge–Kutta 等数值方法近似。一方面，neural ODE 能自适应逼近 $\mathbf q_l(t)$ 的动力学，具备更优的连续时间建模能力；另一方面，neural ODE 因积分运算而计算复杂度高 [51]，而基于闭式插值函数的建模可在任意时隙快速计算 $\mathbf q_l(t)$。在注意力机制中，查询与键只需捕获时间相关性，而值负责按式 (17)、(18) 直接建模输入与输出之间的复杂关系。因此我们用式 (19) 的插值函数 $f_{\mathrm{interp}}(\cdot)$ 高效构造 $\mathbf q_l(t)$ 与 $\mathbf k_l(t)$，用式 (20) 的 neural ODE 准确拟合 $\mathbf v_l(t)$。

为感知时间尺度的变化，我们通过显式嵌入时间信息把式 (17) 的标准注意力扩展到连续时间域：

$$
\left\{c(\tau_{l_1},\tau_{l_2})\right\}_{l_1=1}^{L}=\begin{cases}\sigma\left(\left\{\frac{\int_0^{\tau_{l_2}-\tau_{l_1}}\left(\mathbf k_{l_1}(t+\tau_{l_1})\right)^\top\mathbf q_{l_2}(-t+\tau_{l_2})\mathrm dt}{(\tau_{l_2}-\tau_{l_1})\sqrt{d_o}}\right\}_{l_1=1}^{L}\right),&\tau_{l_2}\ne\tau_{l_1},\\[6pt]\sigma\left(\left\{\frac{(\mathbf k_{l_1})^\top\mathbf q_{l_2}}{\sqrt{d_o}}\right\}_{l_1=1}^{L}\right),&\text{其他},\end{cases} \tag{21}
$$

其中 $\{c(\tau_{l_1},\tau_{l_2})\}_{l_1=1}^{L}$ 表示所有键时隙 $\{\tau_{l_1}\}_{l_1=1}^{L}$ 到给定查询时隙 $\tau_{l_2}$（$l_2\in\{1,2,\cdots,L\}$）的连续时间注意力权重。当 $\tau_{l_2}\ne\tau_{l_1}$ 时，$c(\tau_{l_1},\tau_{l_2})$ 量化查询轨迹 $\mathbf q_{l_2}(t)$ 与键轨迹 $\mathbf k_{l_1}(t)$ 在 0 到 $(\tau_{l_2}-\tau_{l_1})$ 时间区间内的对齐程度；归一化因子 $\frac{1}{\tau_{l_2}-\tau_{l_1}}$ 用于确保连续时间注意力专注于建模查询与键轨迹之间的对齐而非时间间隔本身。当 $\tau_{l_2}=\tau_{l_1}$ 时，$c(\tau_{l_1},\tau_{l_2})$ 等于式 (17) 的 $c_{l_1,l_1}$ 以保持连续性。$c(\tau_{l_1},\tau_{l_2})$ 中的积分可用经典数值近似方案（如梯形积分或 Gauss–Legendre 求积）求解：

$$
\int_0^{\tau_{l_2}-\tau_{l_1}}\left(\mathbf k_{l_1}(t+\tau_{l_1})\right)^\top\mathbf q_{l_2}(-t+\tau_{l_2})\mathrm dt\approx\sum_{e=1}^{E}\gamma_e\left(\mathbf k_{l_1}(\tau_{l_e}+\tau_{l_1})\right)^\top\mathbf q_{l_2}(-\tau_{l_e}+\tau_{l_2}), \tag{22}
$$

其中 $E$ 为积分点数、$\gamma_e$ 为积分系数、$\tau_{l_e}$ 为 0 到 $(\tau_{l_2}-\tau_{l_1})$ 区间内的积分点；具体 $\gamma_e$ 与 $\tau_{l_e}$ 取决于所选数值近似方案 [53]，而 $\mathbf q_{l_2}(-\tau_{l_e}+\tau_{l_2})$ 与 $\mathbf k_{l_1}(\tau_{l_e}+\tau_{l_1})$ 可分别在式 (19) 中令 $t=-\tau_{l_e}+\tau_{l_2}$ 与 $t=\tau_{l_e}+\tau_{l_1}$ 获得。

类似地，连续时间值可由

$$
\bar{\mathbf v}_{l_1}(\tau_{l_2})=\begin{cases}\dfrac{\int_{\tau_{l_1}}^{\tau_{l_2}}\mathbf v_{l_1}(t)\mathrm dt}{\tau_{l_2}-\tau_{l_1}},&\tau_{l_2}\ne\tau_{l_1},\\[6pt]\mathbf v_{l_1},&\text{其他},\end{cases} \tag{23}
$$

计算，其中 $\bar{\mathbf v}_{l_1}(\tau_{l_2})$ 表示值轨迹 $\mathbf v_{l_1}(t)$ 从其采样时隙 $\tau_{l_1}$ 到查询时隙 $\tau_{l_2}$ 施加的平均时间影响。利用 $\{\bar{\mathbf v}_{l_1}(\tau_{l_2})\}_{l_1=1}^{L}$ 与相应注意力权重 $\{c(\tau_{l_1},\tau_{l_2})\}_{l_1=1}^{L}$，连续时间注意力机制在查询时隙 $\tau_{l_2}$ 处的最终输出 $\mathbf o(\tau_{l_2})\in\mathbb R^{d_o\times1}$ 可表示为

$$
\mathbf o(\tau_{l_2})=\sum_{l_1=1}^{L}\bar{\mathbf v}_{l_1}(\tau_{l_2})c(\tau_{l_1},\tau_{l_2}). \tag{24}
$$

注意到由于所提连续时间注意力在不同查询时隙处的计算相互独立，可像标准注意力一样采用并行处理以高效计算 [12]。

**注 5：** 根据式 (22)，式 (21) 中连续时间注意力的计算包含两步。第一步，$\mathbf q_{l_2}(-\tau_{l_e}+\tau_{l_2})$ 与 $\mathbf k_{l_1}(\tau_{l_e}+\tau_{l_1})$ 均由闭式插值函数（如线性插值）建模，因而可从观测 $\{\mathbf q_{l_2}\}_{l_2=1}^{L}$ 与 $\{\mathbf k_{l_1}\}_{l_1=1}^{L}$ 以 $\mathcal O(d)$ 计算复杂度快速获得 [42]。此外，由于 $\tau_{l_e}$ 同时是 $\tau_{l_1}$ 与 $\tau_{l_2}$ 的函数 [53]，而注意力机制需对 $\forall l_1,l_2\in[1,L]$ 获得 $\{\mathbf q_{l_2}(-\tau_{l_e}+\tau_{l_2})\}_{e=1}^{E}$ 与 $\{\mathbf k_{l_1}(\tau_{l_e}+\tau_{l_1})\}_{e=1}^{E}$，相应计算复杂度为 $\mathcal O(L^2dE)+\mathcal O(L^2dE)=\mathcal O(L^2dE)$。第二步，利用上述已算得的值，式 (22) 中内积形式的计算复杂度为 $\mathcal O(L^2dE)$。总之，计算式 (21) 连续时间注意力的两步总复杂度为 $\mathcal O(L^2dE)$，由于引入积分算子，比式 (17) 标准注意力的 $\mathcal O(L^2d)$ 更大。

**注 6：** 当序列长度 $L$ 与特征维数 $d$ 较大时，连续时间注意力的计算复杂度 $\mathcal O(L^2dE)$ 变高。为解决该问题，可采用低秩核近似 [54]、[55]、稀疏注意力 [18] 与分块（patching）[34] 等潜在技术来缓解计算负担。

### B. 高频时间编码

由于时隙被纳入查询、键、值的计算，连续时间注意力具备感知时间尺度变化的潜在能力。然而该能力通常不足以实现准确的连续时间预测，原因有二：第一，与标准注意力类似，连续时间注意力仍具有**置换不变性** [19]，即注意力机制未利用序列的顺序信息，从而限制预测性能；第二，高移动性场景中无线信道呈现快速周期性变化特征，注意力机制难以直接学习 [16]、[56]、[57]。

为解决第一个问题，现有 Transformer 模型采用位置编码保留序列顺序信息。具体地，注意力机制输入为 $\mathbf X=\mathbf X_{\mathrm{tok}}+\mathbf X_{\mathrm{pos}}$，其中 $\mathbf X_{\mathrm{tok}}\in\mathbb R^{d_i\times L}$ 为来自序列数据的词元嵌入、$\mathbf X_{\mathrm{pos}}\in\mathbb R^{d_i\times L}$ 为来自位置编码的位置嵌入。标准位置编码用正弦与余弦函数表示顺序信息 [12]：

$$
\left[\mathbf X_{\mathrm{pos}}\right]_{i,l}=\begin{cases}\sin\left(\frac{(l-1)}{10000^{i/d_i}}\right),&i\ \text{为偶数},\\[4pt]\cos\left(\frac{(l-1)}{10000^{i/d_i}}\right),&\text{其他},\end{cases} \tag{25}
$$

其中 $i\in\{0,1,\cdots,d_i-1\}$。可看出固定顺序信息 $l\in\{1,2,\cdots,L\}$ 被编码进 $\mathbf X_{\mathrm{pos}}$ 以打破注意力机制的置换不变性。然而标准位置编码无法感知连续时间预测中时间尺度的变化。

相反，我们提出**时间编码**，显式嵌入时隙 $\tau_l$（$\tau_l\in\{\tau_1,\tau_2,\cdots,\tau_L\}$）而非顺序 $l$，从而有效建模时间尺度的变化。此外，为高效学习高移动性场景中快速周期性信道动态的特征，我们进一步把时间编码扩展到高频，相应时间嵌入 $\mathbf X_{\mathrm{tem}}\in\mathbb R^{d_i\times L}$ 可写为

$$
\left[\mathbf X_{\mathrm{tem}}\right]_{i,l}=\begin{cases}\sin\left(\frac{\omega_0\tau_l}{10000^{i/d_i}}\right),&i\ \text{为偶数},\\[4pt]\cos\left(\frac{\omega_0\tau_l}{10000^{i/d_i}}\right),&\text{其他},\end{cases} \tag{26}
$$

其中 $\omega_0$ 表示频率超参数，设为相对较大的值。这样 $[\mathbf X_{\mathrm{tem}}]_{i,l}$ 随 $\tau_l$ 快速变化，可视为驱动注意力机制有效捕获相应信道动态的预定义、快速周期性时间成分 [58]、[59]。

### C. 带逐元素预测的连续时间 Transformer 架构

本小节给出如何利用上述连续时间注意力机制与高频时间编码，构建基于逐元素预测的连续时间 Transformer。

首先，为充分发挥深度学习强大的特征提取能力，估计信道向量 $\hat{\mathbf h}(t_{\mathrm{che},j})$ 需经离散 Fourier 变换（DFT）变换到角度域：

$$
\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})=\mathbf F_{\mathrm A}\hat{\mathbf h}(t_{\mathrm{che},j}), \tag{27}
$$

其中 $\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})\in\mathbb C^{M\times1}$ 为相应角度域信道向量，$\mathbf F_{\mathrm A}=\mathrm{diag}(\mathbf F_{\mathrm{DFT}},\mathbf F_{\mathrm{DFT}})\in\mathbb C^{M\times M}$ 为双极化方向上的角度域酉矩阵，$\mathbf F_{\mathrm{DFT}}\in\mathbb C^{\frac M2\times\frac M2}$ 为 DFT 矩阵。

**图 4：** 所提带逐元素预测机制的连续时间 Transformer 整体架构，含多尺度 Transformer 编码器与生成式 Transformer 解码器。

现有信道预测方法通常把整个信道向量 $\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})$ 一次性送入网络，并利用空间与时间相关性联合预测其全部元素，称为**向量式预测机制** [28]–[31]。该机制下 $\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})$ 不同元素的预测被强制共享同一注意力权重。然而，由于式 (3) 中不同到达方位角与俯仰角导致各路径多普勒频移不同，角度域信道向量 $\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})$ 中对应不同路径的元素的时间变化可能差异显著；共享注意力权重与元素特定动态之间的不匹配会严重损害时间相关性的提取。此外，随着大规模 MIMO 系统中天线数增长，$\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})$ 不同元素之间的空间相关性变弱 [7]；因此利用空间相关性可能无意中把其他元素的过多无关信息引入目标元素并导致过拟合。

受时间序列建模中通道独立框架有效性的启发 [19]、[34]，我们提出**逐元素预测机制**解决上述问题。具体地，不再送入整个向量 $\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})$，而是对 $m\in\{1,2,\cdots,M\}$ 把每个元素 $[\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})]_m$ 分别送入神经网络。这样每个元素可生成自己的注意力权重以准确捕获时间相关性，同时缓解过拟合风险。此外，逐元素机制中 $m\in\{1,2,\cdots,M\}$ 的 $[\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})]_m$ 预测共享同一网络参数，这有两个优势：第一，模型存储开销可显著降低；第二，$M$ 个元素的计算可通过把批维从 $B$ 扩展到 $BM$ 而并行化，从而提高计算效率。

为有效处理 $[\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})]_m$，连续时间 Transformer 的网络架构如图 4 所示，由**多尺度 Transformer 编码器**与**生成式 Transformer 解码器**两部分组成。网络架构设计的动机在于估计时隙与预测时隙的特性：所提非均匀导频图案中估计时隙 $\{t_{\mathrm{che},j}\}_{j=1}^{\tilde J}$ 保持固定，而连续时间预测的预测时隙 $\{t_p\}_{p=1}^{P}$ 任意。因此我们不采用仅编码器结构 [14]，而采用编码器—解码器结构，把固定估计时隙 $\{t_{\mathrm{che},j}\}_{j=1}^{\tilde J}$ 与任意预测时隙 $\{t_p\}_{p=1}^{P}$ 处的时间相关性提取分别显式分离到编码器与解码器；这样编码器可专注于从固定估计时隙一致且高效地学习时间依赖。具体细节如下。

**1）多尺度 Transformer 编码器。** $[\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},j})]_m$ 首先经词元嵌入（由线性层构成）处理。如 IV-B 小节所述，词元嵌入输出与估计时隙 $\{t_{\mathrm{che},j}\}_{j=1}^{\tilde J}$ 处高频时间编码结果相加，作为标准注意力的输入。经式 (17)、(18) 提取时间相关性后，随后用由多层感知机（MLP）、残差连接与层归一化组成的前馈网络（FFN）精化并聚合特征。该标准注意力与 FFN 的级联结构重复 $N_{\mathrm{enc},1}$ 次以充分捕获特征。但应注意，尽管 $\{t_{\mathrm{che},j}\}_{j=1}^{\tilde J}$ 固定，其非均匀分布的特性要求跨多个尺度提取时间特征。为提取这些多尺度特征，我们**不**采用连续时间注意力——因为估计长度 $\tilde J$ 通常较长以确保获得全面历史信息，这按注 6 的讨论会给连续时间注意力带来可观计算开销。相反，考虑到估计时隙 $\{t_{\mathrm{che},j}\}_{j=1}^{\tilde J}$ 固定，采用带标准注意力的多尺度编码器堆叠策略 [18] 足以以低计算代价捕获多尺度时间特征。具体地，我们把上述级联结构再堆叠 $S$ 层，第 $s$ 层以第 $(s-1)$ 层输出序列的**后半段切片**作为输入；该设计使时间相关性的提取从全序列逐步转向更细尺度的子序列。最后，把 $S$ 个堆叠的输出序列沿序列维拼接，其中包含多尺度时间信息，从而有效表示非均匀估计时隙 $\{t_{\mathrm{che},j}\}_{j=1}^{\tilde J}$ 处的时间特征。

**2）生成式 Transformer 解码器。** 生成式 Transformer 解码器的输入是长度为 $G$ 的历史信道序列与长度为 $P$ 的零填充的组合：$\left\{[\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},\tilde J-G+1})]_m,\cdots,[\hat{\mathbf h}_{\mathrm A}(t_{\mathrm{che},\tilde J})]_m,0,\cdots,0\right\}$，目标是在这些零值对应的时隙处并行生成预测输出。具体地，与编码器类似，解码器输入经词元嵌入处理，其输出与高频时间编码输出相加；此外，由于解码器需为连续时间预测提取任意时间尺度上的时间特征，采用 IV-A 小节详述的连续时间注意力。相应输出用于查询未来预测与多尺度 Transformer 编码器所捕获历史信息之间的相关性，随后级联 FFN 以整合特征。上述级联结构重复 $N_{\mathrm{dec}}$ 次，最终输出为角度域预测结果 $\{[\hat{\mathbf h}_{\mathrm A}(t_p)]_m\}_{p=1}^{P}$。预测完所有 $M$ 个元素后，可通过 (27) 的逆变换得到目标 $\{\hat{\mathbf h}(t_p)\}_{p=1}^{P}$。

### D. 模型训练与性能评估

归一化均方误差（NMSE）被广泛用于优化信道预测模型并评估其性能 [12]、[30]：

$$
\mathrm{NMSE}\left(t_p\right)=\frac{\left\|\mathbf h(t_p)-\hat{\mathbf h}(t_p)\right\|_2^2}{\left\|\mathbf h(t_p)\right\|_2^2},\quad 1\le p\le P,\qquad\mathrm{NMSE}=\frac{1}{P}\sum_{p=1}^{P}\mathrm{NMSE}\left(t_p\right). \tag{28}
$$

为便于模型测试阶段的性能比较，给定预测周期 $T_p$，预测时隙设为 $t_p=pT_p$（$p\in\{1,2,\cdots,P\}$）。相反，在模型训练阶段，预测时隙 $\{t_p\}_{p=1}^{P}$ 从 $(0,PT_p]$ 均匀采样，从而使模型具备任意时间尺度的预测能力 [29]、[30]。

**表 IV　3GPP TR 38.901 数据集的信道参数**

| 参数 | 取值 |
|---|---|
| 小区半径 $r_c$ | 300 m |
| 基站高度 $h_{\mathrm{BS}}$ | 25 m |
| UE 最小/最大高度 $h_{\mathrm{UE},\min}/h_{\mathrm{UE},\max}$ | 1.5/22.5 m |
| 中心频率 $f_c$ | 3.5 GHz |
| 路径数 $L_p$ | 12 |
| 时延扩展 $\tau_s$ | 98.3 ns |
| 基站水平/垂直天线数 $M_h/M_v$ | 4/4 |
| 基站天线数 $M$ | 32 |

**表 V　所提连续时间 Transformer 的结构**

| 模型层 | 结构 |
|---|---|
| 多尺度 Transformer 编码器：词元嵌入 | $d_i=2$，$d_o=64$ |
| 多尺度 Transformer 编码器：标准注意力 | $N_{\mathrm{head}}=8$，$S=2$，$N_{\mathrm{enc},1}=2$，$N_{\mathrm{enc},2}=1$，$d_i=64$，$d_o=64$，FFN、LayerNorm |
| 生成式 Transformer 解码器：词元嵌入 | $d_i=2$，$d_o=64$ |
| 生成式 Transformer 解码器：连续时间注意力 | $N_{\mathrm{head}}=8$，$N_{\mathrm{dec}}=2$，$d_i=64$，$d_o=64$，FFN、LayerNorm |
| 生成式 Transformer 解码器：Neural ODE | $d_{i,t}=1$，$d_{i,f}=64$，$d_o=64$，LayerNorm、Tanh |

## V. 仿真研究

### A. 仿真设置

仿真数据采用 3GPP TR 38.901 城市宏小区场景的信道模型生成 [36]。该模型同时包含视距（LOS）与非视距（NLOS）场景，其中 LOS 概率由 UE 高度 $h_{\mathrm{UE}}$ 与基站—UE 二维距离 $d_{\mathrm{2D}}$ 决定；具体信道参数见表 IV。除另有说明，UE 速率设为 $v=60$ km/h，信道估计信噪比（SNR）为 10 dB。在插入附加导频解决多普勒混叠之前，历史信道估计的原始长度与周期设为 $J=8$、$T_e=40$ ms；$T_e$ 内附加插入的导频数为 $N=3$。于是估计信道序列最终长度为 $\tilde J=J+(J-1)N=29$，非均匀与均匀导频图案对应的估计时隙分别为 $\mathcal T_{\mathrm{che}}=\{-280,-278,-260,-242,-240,\cdots,0\}$ ms 与 $\mathcal T_{\mathrm{uni}}=\{-280,-270,-260,-250,-240,\cdots,0\}$ ms。预测长度设为 $P=8$，模型测试阶段预测周期为 $T_p=5$ ms。

所提连续时间 Transformer 的结构见表 V。其中 $d_i$、$d_o$ 分别表示输入与输出特征维数；采用著名的多头注意力以同时关注不同输入方面 [60]，头数记为 $N_{\mathrm{head}}$；使用层归一化加速收敛，并采用 dropout 策略缓解过拟合风险。如 IV-A 小节所述，查询与键的连续时间建模采用线性插值，值的连续时间建模通过 Runge–Kutta 方法的 neural ODE 实现；neural ODE 中构造导数使用基于双曲正切（tanh）激活的 MLP，其中 $d_{i,t}$ 与 $d_{i,f}$ 分别表示嵌入时隙与特征的输入维数。式 (22) 中连续时间注意力的计算采用积分点数 $E=2$ 的梯形积分近似；式 (26) 中默认频率超参数 $\omega_0$ 设为 30。训练集与测试集分别含 12,800 与 2,560 个样本；批大小 $B=128$，整个训练过程 300 个 epoch，使用 Adam 优化器、学习率 $\mathrm{lr}=5\times10^{-4}$。仿真源代码已发布于 [35]。

### B. 仿真结果

**1）连续时间注意力与高频时间编码的验证。** 表 VI 给出不同注意力机制、频率超参数 $\omega_0$ 与编码配置下连续时间信道预测的 NMSE 性能，加粗值表示对应设置的最优性能。可以看到连续时间注意力显著优于标准注意力，表明我们的连续时间注意力能准确建模任意时间尺度上的相关性。当 $\omega_0$ 设为 1 时，连续时间预测的 NMSE 性能显著退化，因为相应时间编码难以跟踪高移动性场景中快速时变的信道；相反，$\omega_0=10/30/50$ 的高频时间编码可有效解决该问题，其中 $\omega_0=30$ 取得最优 NMSE 性能。此外，采用高频时间编码的性能优于无任何编码或采用位置编码的性能，印证了其捕获快速周期性信道动态的强能力。因此，连续时间注意力与 $\omega_0=30$ 的高频时间编码适合我们的连续时间 Transformer。

**表 VI　不同注意力机制、$\omega_0$ 与编码配置下的 NMSE**

| 方法 | NMSE（dB） |
|---|---|
| 标准注意力 [12]，$\omega_0=30$ | −5.45 |
| 连续时间注意力，$\omega_0=1$ | −5.52 |
| 连续时间注意力，$\omega_0=10$ | −6.60 |
| 连续时间注意力，$\omega_0=30$ | **−6.77** |
| 连续时间注意力，$\omega_0=50$ | −6.71 |
| 连续时间注意力（无任何编码） | −4.76 |
| 连续时间注意力（位置编码） | −5.32 |

**2）连续时间 Transformer 不同架构变体的比较。** 表 VII 从 NMSE 与浮点运算量（FLOPs）两方面比较所提连续时间 Transformer 的不同架构变体，原始架构以粗体标出。具体地，我们首先比较插值与 neural ODE 用于查询、键、值连续时间建模的效果：原始混合版本（值用 neural ODE、查询与键用插值）在 NMSE 上显著优于全插值变体，验证了 neural ODE 自适应建模值连续时间动态的必要性；全 ODE 变体预测性能提升边际，但计算复杂度相比原始混合版本显著更高。因此，考虑到其准确预测能力与适中计算代价，我们在所提连续时间 Transformer 中采用混合版本。

接着评估连续时间 Transformer 的稀疏注意力变体：稀疏注意力采用概率稀疏评分机制选择关键查询并构造稀疏注意力矩阵，可把连续时间注意力的计算复杂度从 $\mathcal O(L^2dE)$ 降至 $\mathcal O(L\log(L)dE)$ [18]。可以看到稀疏注意力相比原始架构性能略降，但显著降低计算复杂度。

此外研究 ODE 求解器中步长 $\Delta t$ 的性能影响："固定步长 $\Delta t=0.5$"与"固定步长 $\Delta t=1$"分别对应固定步长 $0.5$ 与 $1$；"Doppler 自适应步长 $\Delta t$"指依据多普勒谱特性从集合 $\{0.5,0.75,1\}$ 中选取固定步长——对较高多普勒频移采用较小 $\Delta t$ 以提高预测精度，对较低多普勒频移场景采用较大 $\Delta t$ 以提升计算效率。相反，原始架构采用带误差控制机制的标准 ODE 求解器 [49]，比较高阶与低阶解的差异并实现 $\Delta t$ 的自适应调整。可以看到"Doppler 自适应步长 $\Delta t$"相比两种固定步长取得更好预测性能，因为它依据多普勒谱特性为 ODE 求解选择了有效 $\Delta t$；原始架构相比这些固定步长变体表现出性能优势，说明基于误差控制自适应 $\Delta t$ 的 ODE 求解更准确，但这种误差控制自适应 $\Delta t$ 带来更高计算复杂度。把 neural ODE 与多普勒谱特性结合以实现准确高效的 ODE 求解值得未来研究。

此外，表 VII 底部研究了不同网络架构："仅编码器"表示把解码器替换为两层 FFN [14]，并把编码器中的标准注意力替换为连续时间注意力；"连续时间编码器"表示编码器采用连续时间注意力，其余结构与原始架构相同。首先可以看到"仅编码器"相比原始架构性能显著退化——因为"仅编码器"的编码器需同时建模固定估计时隙与任意预测时隙处的时间依赖，而后者在模型训练时随机采样且不同训练样本间不同，这种变化会妨碍"仅编码器"的单一编码器充分学习时间相关性。相反，我们的原始架构把固定估计时隙与任意预测时隙处的时间相关性提取分别显式分离到编码器与解码器，从而确保有效学习时间依赖。其次，"连续时间编码器"取得与原始架构几乎相同的 NMSE，但计算复杂度大幅增加，说明原始架构中带标准注意力的多尺度编码器堆叠已足以以较低计算代价准确提取固定估计时隙处的多尺度时间特征。

**表 VII　连续时间 Transformer 不同变体的 NMSE 与计算复杂度**

| 架构变体 | NMSE（dB） | 计算复杂度（MFLOPs） |
|---|---|---|
| 全插值（All-interpolation） | −6.12 | 103.28 |
| 混合（原始，Hybrid） | **−6.77** | **395.59** |
| 全 ODE（All-ODE） | −6.80 | 986.72 |
| 稀疏注意力 [18] | −6.57 | 179.82 |
| 固定步长 $\Delta t=0.5$ | −6.59 | 307.50 |
| 固定步长 $\Delta t=1$ | −6.41 | 269.88 |
| Doppler 自适应步长 $\Delta t$ | −6.69 | 279.27 |
| 仅编码器 [14] | −4.85 | 1866.82 |
| 连续时间编码器 | −6.78 | 1486.50 |

**3）向量式与逐元素预测机制的比较。** 图 5 研究所提连续时间 Transformer 在向量式与逐元素预测机制下的收敛性能。可以看到逐元素预测机制的性能优于向量式预测机制，表明逐元素预测机制在捕获时间相关性方面更有效。此外可观察到向量式预测机制下测试与训练性能之间存在显著差距，意味着存在严重过拟合；而逐元素预测机制下该性能差距显著减小，说明过拟合得到缓解。

我们进一步在表 VIII 中比较各种深度学习模型下向量式与逐元素预测机制的 NMSE 性能：可以看到逐元素预测机制的优越性在多种模型上一致得到验证。因此后续所有仿真均在逐元素预测机制下进行。

**图 5：** 连续时间 Transformer 在向量式与逐元素预测机制下的收敛性能比较。

**表 VIII　不同深度学习模型下向量式与逐元素预测机制的 NMSE**

| 模型 | 向量式 NMSE（dB） | 逐元素 NMSE（dB） |
|---|---|---|
| GRU [11] | −0.50 | −1.12 |
| 原始 Transformer [12] | −0.77 | −1.35 |
| Neural ODE [30] | −0.74 | −2.69 |
| Latent ODE [50] | −1.07 | −3.49 |
| 连续时间 Transformer | −3.83 | −6.77 |

**4）不同导频图案在导频数与 NMSE 方面的研究。** 表 IX 研究均匀、随机与 Chebyshev 确定性非均匀导频图案的导频数与 NMSE 性能。随机导频图案 [61] 表示从整个时段 $[-280\ \mathrm{ms},0\ \mathrm{ms}]$ 随机选择估计时隙，不同样本对应不同估计时隙；为公平起见，预测时隙从 $(0\ \mathrm{ms},40\ \mathrm{ms}]$ 均匀采样。首先可以看到，相比 29 个导频的非均匀图案，29 与 36 个导频的均匀图案因多普勒混叠问题性能显著较差；当导频数从 36 增至 43 时，均匀导频图案的预测性能显著提升——因为估计周期 $\frac{280\ \mathrm{ms}}{43-1}=6.67$ ms 几乎足以满足定理 1 中完全避免多普勒混叠的理论最小要求。然而在可比 NMSE 下，所提非均匀导频图案相比均匀导频图案把导频开销降低 $\frac{43-29}{43}=32.56\%$，表明非均匀导频图案取得更高导频效率。此外可观察到随机导频图案预测性能较差，验证了信道预测网络依赖确定性导频图案以高效提取时间相关性。与信道预测网络联合学习的自适应导频图案有潜力取得比确定性图案更准确的预测，因为它能以数据驱动方式感知信道变化；自适应导频图案设计值得未来研究。

**表 IX　不同导频图案的导频数与 NMSE**

| 导频图案 | 导频数 | NMSE（dB） |
|---|---|---|
| 均匀 [30] | 29 | −1.65 |
| 均匀 [30] | 36 | −2.03 |
| 均匀 [30] | 43 | −6.84 |
| 随机 [61] | 29 | −1.99 |
| 随机 [61] | 36 | −2.17 |
| 随机 [61] | 43 | −2.26 |
| 非均匀（本文） | 29 | **−6.86** |

**5）导频图案与深度学习模型的研究。** 图 6 比较 UE 速率 $v=20$ km/h 与 $80$ km/h 时不同导频图案与深度学习模型在各预测时隙 $t_p$ 的 NMSE 性能。使用 V-A 小节的均匀与非均匀导频图案 $\{\mathcal T_{\mathrm{uni}},\mathcal T_{\mathrm{che}}\}$，根据定理 1，$v=20$ km/h 时连续时间信道预测在图 6(a)、(b) 中均不受多普勒混叠影响；相反在 $v=80$ km/h 时，均匀导频图案图 6(c) 出现多普勒混叠，而所提非均匀导频图案图 6(d) 不出现。

可以看到，包括 neural ODE [30]、latent ODE [50] 与所提连续时间 Transformer 在内的连续时间预测模型显著优于 GRU [11] 与原始 Transformer [12]，因为连续时间预测模型具备建模时间尺度变化的能力。此外，对图 6(a) 中 $v=20$ km/h 的均匀导频图案 $\mathcal T_{\mathrm{uni}}$，连续时间预测模型在预测时隙 $\{10,20,30,40\}$ ms 的 NMSE 性能优于预测时隙 $\{5,15,25,35\}$ ms，因为 $\{10,20,30,40\}$ ms 与 $\mathcal T_{\mathrm{uni}}$ 均匀对齐。当图 6(c) 中 $v=80$ km/h 发生多普勒混叠时，不同预测时隙间的性能差距显著加剧，说明多普勒混叠会严重损害连续时间信道预测精度。相反，图 6(d) 中所提非均匀导频图案使连续时间预测模型在 $v=80$ km/h 时对所有预测时隙都保持精度，验证了所提非均匀导频图案能提升多普勒相位估计分辨率并有效克服多普勒混叠。我们还可观察到所提连续时间 Transformer 一致取得最佳性能，说明 neural ODE 与注意力机制的结合能高效捕获任意时间尺度上的时间依赖。

**图 6：** UE 速率 $v=20$ km/h 与 $v=80$ km/h 时不同导频图案与深度学习模型下的 NMSE 性能：(a) 均匀导频图案 [30]（$v=20$ km/h，无多普勒混叠）；(b) 所提非均匀导频图案（$v=20$ km/h，无多普勒混叠）；(c) 均匀导频图案 [30]（$v=80$ km/h，发生多普勒混叠）；(d) 所提非均匀导频图案（$v=80$ km/h，无多普勒混叠）。

此外，我们在图 7 中关注不同 UE 速率 $v$ 下不同导频图案与深度学习模型的 NMSE 性能。首先，所提连续时间 Transformer 在各 UE 速率下一致优于其他深度学习模型，确认其稳健的性能增益。其次，当均匀与非均匀导频图案在 $v=20$ km/h 均避免多普勒混叠时，非均匀导频图案取得更好 NMSE 性能，验证了用 Chebyshev 多项式根配置导频可促进连续时间信道重建。此外，图 7(a) 中 UE 速率从 $20$ km/h 增至 $40$ km/h 时性能显著退化，因为根据定理 1，均匀导频图案在 $v\ge30.86$ km/h 时发生多普勒混叠；相反，图 7(b) 中所提连续时间 Transformer 的预测性能随 $v$ 增加退化缓慢，因为所提非均匀导频图案即使在 $v=80$ km/h 时也能避免多普勒混叠。总体上，在所有 $v$ 设置下，所提非均匀导频图案比均匀对应方案取得更准确预测，从而确认其稳健性能优势。

**图 7：** 不同导频图案与深度学习模型下 NMSE 性能随 UE 速率 $v$ 的变化：(a) 均匀导频图案 [30]（$v\ge30.86$ km/h 时发生多普勒混叠）；(b) 所提非均匀导频图案。

**6）连续时间预测的显式图示。** 图 8 绘出最强角度索引处、由 neural ODE [30]、latent ODE [50] 与所提连续时间 Transformer 在非均匀导频图案下生成的预测连续时间信道。可以看到当预测时隙 $t_p$ 变大时，neural ODE 与 latent ODE 无法准确拟合未来连续时间信道，原因在于它们依赖 RNN 式架构而受困于长期依赖与误差累积问题；相反，所提连续时间 Transformer 在所有 $t_p$ 上都精确跟踪未来连续时间信道。这说明连续时间注意力机制能准确提取任意时间尺度上的时间依赖，而并行预测框架能有效解决误差累积问题。

**图 8：** 不同连续时间预测模型在所提非均匀导频图案下的连续时间预测显式图示：(a) 连续时间信道实部；(b) 连续时间信道虚部。

**7）模型参数与计算复杂度的比较。** 表 X 比较不同深度学习模型的模型参数与计算复杂度。可以看到所提连续时间 Transformer 的模型参数与原始 Transformer 相当；相反，由于连续时间注意力的积分计算，连续时间 Transformer 的计算复杂度高于其他深度学习模型；然而如前仿真所示，所提连续时间 Transformer 取得比其他深度学习模型准确得多的预测。此外，当计算资源受限时，可采用表 VII 中连续时间 Transformer 的架构变体（如稀疏注意力与全插值版本）：以全插值版本为例，其计算复杂度为 103.28 MFLOPs，接近原始 Transformer，但仍对其他深度学习模型保持显著 NMSE 性能优势。

**表 X　不同深度学习模型的模型参数与计算复杂度**

| 模型 | 模型参数（M） | 计算复杂度（MFLOPs） |
|---|---|---|
| GRU [11] | 50.24 | 58.84 |
| 原始 Transformer [12] | 173.51 | 100.02 |
| Neural ODE [30] | 66.88 | 64.09 |
| Latent ODE [50] | 83.52 | 122.81 |
| ODE-Former [32] | 169.84 | 305.66 |
| 连续时间 Transformer（本文） | 176.13 | 395.59 |

**8）射线追踪信道中的研究。** 为提供更全面、更现实的评估，我们进一步在射线追踪信道中比较不同深度学习模型的预测性能。具体地，采用作为信道预测广泛使用数据集的 DeepMIMO [64]（基于 Wireless InSite）生成射线追踪信道。DeepMIMO 数据集的信道参数与表 IV 中 3GPP TR 38.901 数据集基本一致，其附加信道参数列于表 XI。

**表 XI　DeepMIMO 数据集的信道参数**

| 参数 | 取值 |
|---|---|
| 场景 | Outdoor 1 |
| 基站索引 | 3 |
| UE 位置 | 第 501 ∼ 1400 行 |

**图 9：** DeepMIMO 数据集中不同深度学习模型在变化信道估计 SNR 下的 NMSE 性能（所提非均匀导频图案、UE 速率 $v=60$ km/h）。

图 9 绘出不同深度学习模型的 NMSE 性能随信道估计 SNR 的变化。可以看到所提连续时间 Transformer 在所有 SNR 下显著优于其他深度学习模型，验证了其对不同 SNR 配置与射线追踪信道场景的稳健性能优势。

## VI. 结论

本文研究了连续时间信道预测，贡献有三：第一，我们从 Nyquist 准则角度分析连续时间信道预测中的多普勒混叠问题；为解决该问题，提出基于 Chebyshev 多项式根的非均匀导频图案以提供显著更精细的多普勒相位估计分辨率，并证明所提导频图案在最大范数意义下最优地促进连续时间信道重建。第二，我们提出连续时间 Transformer：推导连续时间注意力机制以有效捕获任意时间尺度上的时间相关性，并设计高频时间编码以准确跟踪高移动性场景中快速时变信道。第三，提出逐元素预测机制以专注于高效提取每个元素的时间依赖并缓解过拟合。仿真结果表明，所提方法能在高移动性场景中实现准确的连续时间信道预测，并显著优于现有信道预测方法。

## 附录 A：推论 1 的证明

**证明：** $\mathcal T_{\mathrm{che}}$ 与 $\mathcal T_{\mathrm{uni}}$ 的最小时间间隔分别为 $T_{\mathrm{che},\min}=\frac{T_e}{2}-\frac{T_e}{2}\cos\left(\frac{\pi}{2N}\right)$ 与 $T_{\mathrm{uni},\min}=\frac{T_e}{N+1}$。我们的目标是证明

$$
T_{\mathrm{che},\min}-T_{\mathrm{uni},\min}=\left(\frac12-\frac12\cos\left(\frac{\pi}{2N}\right)-\frac{1}{N+1}\right)T_e\le0,\qquad\forall N\in\mathbb N^+. \tag{29}
$$

令 $y=\frac1N$，(29) 的证明等价于

$$
\Delta_{\min}(y)=\frac12-\frac12\cos\left(\frac{\pi}{2}y\right)-\frac{y}{y+1}\le0,\qquad y\in(0,1], \tag{30}
$$

其中 $\Delta_{\min}(0)=0$、$\Delta_{\min}(1)=0$。$\Delta_{\min}(y)$ 的二阶导数为

$$
\Delta_{\min}''(y)=\frac{\pi^2}{8}\cos\left(\frac{\pi}{2}y\right)+\frac{2}{(y+1)^3}. \tag{31}
$$

由于 $\cos\left(\frac{\pi}{2}y\right)\ge0$（$y\in(0,1]$），$\Delta_{\min}''(y)$ 满足

$$
\Delta_{\min}''(y)>0,\qquad y\in(0,1]. \tag{32}
$$

因此 $\Delta_{\min}(y)$ 在 $y\in(0,1]$ 上为严格凸函数；基于严格凸性以及 $\Delta_{\min}(0)=\Delta_{\min}(1)=0$ 即可证明 (30)。■

## 参考文献（英文原条目）

以下按原文编号照录英文参考书目，条目文字不翻译；未逐条核对 DOI。原文共 64 条，按 IEEE 期刊格式排列。

[1] E. G. Larsson, O. Edfors, F. Tufvesson, and T. L. Marzetta, “Massive MIMO for next generation wireless systems,” IEEE Commun. Mag. , vol. 52, no. 2, pp. 186–195, Feb. 2014.

[2] 5G PPP Architecture Working Group, “View on 5G architecture (Version 3.0),” 5G PPP Archit. Work. Group, White Paper, Jun. 2019.

[3] J. Yuan, H. Q. Ngo, and M. Matthaiou, “Machine learning-based channel prediction in massive MIMO with channel aging,” IEEE Trans. Wireless Commun., vol. 19, no. 5, pp. 2960–2973, May 2020.

[4] K. T. Truong and R. W. Heath, “Effects of channel aging in massive MIMO systems,” J. Commun. Netw. , vol. 15, no. 4, pp. 338–351, Aug. 2013.

[5] X. Yu, D. Li, Z. Wang, and S. Sun, “An integrated new deep learning framework for reliable CSI acquisition in connected and autonomous vehicles,” IEEE Netw., vol. 37, no. 4, pp. 216–222, Jul./Aug. 2023.

[6] H. Kim, S. Kim, H. Lee, C. Jang, Y . Choi, and J. Choi, “Massive MIMO channel prediction: Kalman filtering vs. machine learning,” IEEE Trans. Commun., vol. 69, no. 1, pp. 518–528, Jan. 2021.

[7] C. Wu, et al. , “Channel prediction in high-mobility massive MIMO: From spatio-temporal autoregression to deep learning,” IEEE J. Sel. Areas Commun., vol. 39, no. 7, pp. 1915–1930, Jul. 2021.

[8] J. Vanderpypen and L. Schumacher, “MIMO channel prediction using ESPRIT based techniques,” in Proc. PIMRC (Athens, Greece), Sep. 2007, pp. 1–5.

[9] H. Yin, H. Wang, Y . Liu, and D. Gesbert, “Addressing the curse of mobility in massive MIMO with Prony-based angular-delay domain channel predictions,” IEEE J. Sel. Areas Commun. , vol. 38, no. 12, pp. 2903–2917, Dec. 2020.

[10] W. Jiang and H. D. Schotten, “Neural network-based fading channel prediction: A comprehensive overview,” IEEE Access, vol. 7, pp. 118112– 118124, Sep. 2019.

[11] W. Jiang and H. D. Schotten, “Deep learning for fading channel prediction,” IEEE Open J. Commun. Soc. , vol. 1, pp. 320–332, 2020.

[12] H. Jiang, M. Cui, D. W. K. Ng, and L. Dai, “Accurate channel prediction based on transformer: Making mobility negligible,” IEEE J. Sel. Areas Commun., vol. 40, no. 9, pp. 2717–2732, Sep. 2022.

[13] S. Zhang, S. Zhang, Y . Mao, L. K. Yeung, B. Clerckx, and T. Q. S. Quek, “Transformer-based channel prediction for rate-splitting multiple accessenabled vehicle-to-everything communication,” IEEE Trans. Wireless Commun., vol. 23, no. 10, pp. 12717–12730, Oct. 2024.

[14] Y . Jin, Y . Wu, Y . Gao, S. Zhang, S. Xu, and C. -X. Wang, “LinFormer: A linear-based lightweight transformer architecture for time-aware MIMO channel prediction,” IEEE Trans. Wireless Commun. , vol. 24, no. 9, pp. 7177–7190, Sep. 2025.

[15] O. Stenhammar, G. Fodor, and C. Fischione, “A comparison of neural networks for wireless channel prediction,” IEEE Wireless Commun. , vol. 31, no. 3, pp. 235–241, Jun. 2024.

[16] Z. Xiao, Z. Zhang, C. Huang, X. Chen, C. Zhong, and M. Debbah, “C-GRBFnet: A physics-inspired generative deep neural network for channel representation and prediction,” IEEE J. Sel. Areas Commun. , vol. 40, no. 8, pp. 2282–2299, Aug. 2022.

[17] Z. Chen, Z. Zhang, Z. Yang, C. Huang, and M. Debbah, “Channel deduction: A new learning framework to acquire channel from outdated samples and coarse estimate,” IEEE J. Sel. Areas Commun. , vol. 43, no. 3, pp. 944–958, Mar. 2025.

[18] H. Zhou, et al. , “Informer: Beyond efficient transformer for long sequence time-series forecasting,” in Proc. AAAI (Vancouver, BC, Canada), Feb. 2021, pp. 11106–11115.

[19] A. Zeng, et al., “Are transformers effective for time series forecasting?” in Proc. AAAI (Washington, DC, USA), Feb. 2023, pp. 11121–11128.

[20] Z. Chen, F. Gu, and R. Jiang, “Channel estimation method based on transformer in high dynamic environment,” in Proc. WCSP (Nanjing, China), Oct. 2020, pp. 817–822.

[21] S. Singh, A. Trivedi, and D. Saxena, “Channel estimation for intelligent reflecting surface aided communication via graph transformer,” IEEE Trans. Green Commun. Netw., vol. 8, no. 2, pp. 756–766, Jun. 2024.

[22] H. Ju, S. Jeong, B. Lee, and B. Shim, “Transformer-based predictive channel estimation for mmWave massive MIMO systems,” inProc. VTCFall (Washington, DC, USA), Oct. 2024, pp. 1–5.

[23] J. Guo, G. Liu, Q. Wu, and P. Fan, “Parallel attention-based transformer for channel estimation in RIS-aided 6G wireless communications,” IEEE Trans. Veh. Technol., vol. 73, no. 11, pp. 15927–15940, Nov. 2024.

[24] Y . Cui, et al. , “Sensing-assisted high reliable communication: A transformer-based beamforming approach,” IEEE J. Select. Topics Signal Process., vol. 18, no. 5, pp. 782–795, May 2024.

[25] Y . Zhang, S. Li, D. Li, J. Zhu, and Q. Guan, “Transformer-based predictive beamforming for integrated sensing and communication in vehicular networks,” IEEE Internet Things J., vol. 11, no. 11, pp. 20690– 20705, Jun. 2024.

[26] S. Zhang, S. Zhang, W. Yuan, and T. Q. S. Quek, “Transformerempowered predictive beamforming for rate-splitting multiple access in non-terrestrial networks,” IEEE Trans. Wireless Commun. , vol. 23, no. 12, pp. 19776–19788, Dec. 2024.

[27] J. Zhang, et al., “Deep learning-empowered secure predictive beamforming design for integrated sensing and communications systems,” IEEE Trans. Wireless Commun., vol. 24, no. 10, pp. 8565–8580, Oct. 2025.

[28] Z. Xiao, Z. Zhang, Z. Chen, Z. Yang, and R. Jin, “Mobile MIMO channel prediction with ODE-RNN: A physics-inspired adaptive approach,” in Proc. PIMRC (Kyoto, Japan), Sep. 2022, pp. 1301–1307.

[29] K. Ma, F. Zhang, W. Tian, and Z. Wang, “Continuous-time mmWave beam prediction with ODE-LSTM learning architecture,” IEEE Wireless Commun. Lett., vol. 12, no. 1, pp. 187–191, Jan. 2023.

[30] M. Cui, H. Jiang, Y . Chen, Y . Du, and L. Dai, “Continuous-time channel prediction based on tensor neural ordinary differential equation,” China Commun., vol. 21, no. 1, pp. 163–174, Jan. 2024.

[31] Z. Xiao, Z. Zhang, Z. Chen, Z. Yang, C. Huang, and X. Chen, “From data-driven learning to physics-inspired inferring: A novel mobile MIMO channel prediction scheme based on neural ODE,” IEEE Trans. Wireless Commun., vol. 23, no. 7, pp. 7186–7199, Jul. 2024.

[32] Z. Xiao, Y . Huang, Y . Xu, T. Jiao, and D. He, “ODE-Former for mobile channel prediction: A novel learning structure leveraging the physics continuity,” IEEE Wireless Commun. Lett. , vol. 14, no. 7, pp. 2184– 2188, Jul. 2025.

[33] Y . Sang, K. Ma, Z. Wang, and S. Chen, “Dual-band super-resolution channel prediction in high-mobility MIMO systems,” IEEE Trans. Commun., vol. 73, no. 6, pp. 4409–4424, Jun. 2025.

[34] Y . Nie, et al., “A time series is worth 64 words: Long-term forecasting with transformers,” in Proc. ICLR (Kigali, Rwanda), May 2023.

[35] Continuous-time transformer for channel prediction , Implementation Available in the Public Domain. Accessed: 2025. [Online]. Available: https://github.com/sangyl23/Continuous-Time-Transformer

[36] Study on channel model for frequencies from 0.5 to 100 GHz (Release 17), document 3GPP, TR 38.901, 2022, version 17.0.0.

[37] G. Liu, Z. Hu, L. Wang, H. Zhang, J. Xue, and M. Matthaiou, “A hypernetwork based framework for non-stationary channel prediction,” IEEE Trans. Veh. Technol., vol. 73, no. 6, pp. 8338–8351, Jun. 2024.

[38] L. Wang, G. Liu, J. Xue, and K. -K. Wong, “Channel prediction using ordinary differential equations for MIMO systems,” IEEE Trans. Veh. Technol., vol. 72, no. 2, pp. 2111–2119, Feb. 2023.

[39] V . Lesnikov, T. Naumovich, and A. Chastikov, “Dealiasing technique for processing of sub-Nyquist sampled bandpass analytic signals,” in Proc. SIBCON (Tomsk, Russia), May 2021, pp. 1–6.

[40] Radio resource control (RRC) protocol specification (Release 15) , document 3GPP, TS 38.331, 2019, version 15.6.0.

[41] T. J. Rivlin, Chebyshev Polynomials. Mineola, NY , Courier Dover, 2020.

[42] P. J. Davis, Interpolation and Approximation. New York, NY , Blaisdell, 1963.

[43] E. W. Cheney and W. A. Light, A Course in Approximation Theory . Providence, RI, American Mathematical Society, 2009.

[44] A. M. Dizqah, B. Lenzo, A. Sorniotti, P. Gruber, S. Fallah, and J. De Smet, “A fast and parametric torque distribution strategy for four-wheeldrive energy-efficient electric vehicles,” IEEE Trans. Ind. Electron. , vol. 63, no. 7, pp. 4367–4376, Jul. 2016.

[45] R. Liu, X. Zhu, L. Liu, and B. Wu, “Personalized and common acceleration distribution characteristic of human driver,” in Proc. ITSC (Maui, HI, USA), Nov. 2018, pp. 1820–1825.

[46] T. S. Rappaport, Wireless Communications: Principles and Practice, 2nd ed. Upper Saddle River, NJ, Prentice Hall, 2002.

[47] X. Ma and Z. Gao, “Data-driven deep learning to design pilot and channel estimator for massive MIMO,” IEEE Trans. Veh. Technol. , vol. 69, no. 5, pp. 5677–5682, May 2020.

[48] M. B. Mashhadi and D. G ¨und¨uz, “Pruning the pilots: Deep learningbased pilot design and channel estimation for MIMO-OFDM systems,” IEEE Trans. Wireless Commun. , vol. 20, no. 10, pp. 6315–6328, Oct. 2021.

[49] R. T. Q. Chen, et al., “Neural ordinary differential equations,” in Proc. NeurIPS (Montr´eal, QC, Canada), Dec. 2018, pp. 6572–6583.

[50] Y . Rubanova, R. T. Q. Chen, and D. K. Duvenaud, “Latent ODEs for irregularly-sampled time series,” in Proc. NeurIPS (Vancouver, BC, Canada), Dec. 2019, pp. 5320–5330.

[51] J. Morrill, et al. , “Neural rough differential equations for long time series,” in Proc. ICML (Vienna, Austria), Jul. 2021, pp. 7829–7838.

[52] Y . Chen, et al., “ContiFormer: Continuous-time transformer for irregular time series modeling,” in Proc. NeurIPS (New Orleans, LA, USA), Dec. 2023, pp. 47143–47175.

[53] W. H. Press, et al., Numerical Recipes. New York, NY , Cambridge Univ. Press, 1986.

[54] Y . Xiong, et al. , “Nystr ¨omformer: A Nystr ¨om-based algorithm for approximating self-attention,” in Proc. AAAI (Vancouver, Canada), Feb. 2021, pp. 14138-14148.

[55] K. Choromanski, et al., “Rethinking attention with performers,” in Proc. ICLR, May 2021.

[56] M. Raghu, et al. , “On the expressive power of deep neural networks,” in Proc. ICML (Sydney, Australia), Aug. 2017, pp. 2847–2854.

[57] N. Rahaman, et al., “On the spectral bias of neural networks,” in Proc. ICML (Long Beach, CA, USA), Jun. 2019, pp. 5301–5310.

[58] B. Mildenhall, P. P. Srinivasan, M. Tancik, J. T. Barron, R. Ramamoorthi, and R. Ng, “NeRF: Representing scenes as neural radiance fields for view synthesis,” in Proc. ECCV (Glasgow, UK), Aug. 2020, pp. 405– 421.

[59] M. Tancik, et al. , “Fourier features let networks learn high frequency functions in low dimensional domains,” in Proc. NeurIPS (Vancouver, Canada), Dec. 2020, pp. 7537–7547.

[60] P. Wang, K. Ma, Y . Bai, C. Sun, and Z. Wang, “Deep learning assisted mmWave beam prediction with flexible network architecture,” IEEE Trans. Wireless Commun., vol. 24, no. 11, pp. 9435–9448, Nov. 2025.

[61] A. N. Uwaechia, and N. M. Mahyuddin, “A review on sparse channel estimation in OFDM system using compressed sensing,” IETE Tech. Rev., vol. 34, no. 5, pp. 514–531, 2017.

[62] H. Kang, Q. Hu, H. Chen, Q. Huang, Q. Zhang, and M. Cheng, “Crossshaped separated spatial-temporal UNet transformer for accurate channel prediction,” in Proc. IEEE INFOCOM (Vancouver, Canada), May 2024, pp. 2079–2088.

[63] S. Fan, H. Li, X. Liang, Z. Liu, X. Gu, and L. Zhang, “E2ENet: An end-to-end channel prediction neural network based on uplink pilot for FDD systems,” IEEE Wireless Commun. Lett. , vol. 13, no. 5, pp. 1285–1289, May 2024.

[64] A. Alkhateeb, “DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications,” inProc. ITA (San Diego, CA, USA), Feb. 2019, pp. 1–8.

**本页范围与校对状态：** 本页为 IEEE Transactions on Wireless Communications 期刊正式版（本地 PDF 16 页）的全文中文译稿：摘要、正文第 I–VI 节（含 II-A/B、III-A/B、IV-A–D、V-A/B）、结论、附录 A、表 I–XI 逐格、图 1–9 图注、基金与作者单位说明、参考文献 [1]–[64]。公式编号沿用原文 (1)–(32) 全部译入。**表 VI、VII、VIII、IX 已用 PDF 第 11、12 页渲染图逐行逐格核对**；表 I、II、III、IV、V、X、XI 依据抽取文本转录（结构与原文一致，已在表注说明）。**页首"再传播许可待核验、仅学习用途、不计入可公开全文统计"说明保持原文不变**，另加"许可与使用说明"段并保留原文代码链接。图内曲线未做数字化估算；逐句逐式对照原 PDF 的终校未做。原文存在 3 处表述可商榷处，已在下方"原文说明（疑点加注）"标出。作者 7 人已补全；title 未改。

> **原文说明（疑点加注）：** ① 定理 1 与注 2 中 $T_{e,\min}$ 的界：定理 1 写作严格不等式 $T_{e,\min}<\frac{c}{f_cv}$（式 (7)），而第 III-B 节开篇叙述为 $T_{e,\min}\le\frac{c}{f_cv}$，同一条件在"严格/非严格"上表述不一致（注 2 的数值算例用 $<$）。② 第 V-B 节讨论均匀导频图案"29 与 36 个导频"时称其因多普勒混叠性能差，但未给出对应 $T_{e,\min}$ 数值，与定理 1 的定量联系仅为定性描述。③ 表 V 中"标准注意力"行同时给出 $S$、$N_{\mathrm{enc},1}$、$N_{\mathrm{enc},2}$ 三个堆叠参数，而正文 IV-C 节仅解释 $S$（多尺度堆叠层数）与 $N_{\mathrm{enc},1}$（级联重复次数），$N_{\mathrm{enc},2}$ 未在正文说明其含义。以上均按原文保留并如实标注，未改动原文数值。

**补充说明（基金与单位）：** 本工作部分受国家自然科学基金（62471275）、NSF ECCS-2302469、日本科学技术振兴机构（JST）ASPIRE 计划 JPMJAP2326 资助；通讯作者为 Zhaocheng Wang。作者单位：Y. Sang、K. Ma、L. Yao、P. Wang、Z. Wang 就职于清华大学电子工程系（北京 100084）；Z. Han 就职于休斯顿大学电子与计算机工程系；S. Chen 就职于南安普顿大学电子与计算机科学学院。
{% endraw %}
