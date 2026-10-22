---
layout: page
title: "非均匀导频模式的连续时间 Transformer 信道预测｜中文译稿（逐式补译中）"
permalink: /papers/translations/2026-10-22-continuous-time-transformer-nonuniform-pilots/
math: true
toc: true
---

[← 返回论文库](/papers/)

# 基于非均匀导频模式的连续时间 Transformer 信道预测

**原题：** Continuous-Time Transformer Based Channel Prediction with Non-Uniform Pilot Pattern  
**作者：** Yiliang Sang、Ke Ma、Lebin Yao、Pengyu Wang、Zhaocheng Wang、Zhu Han、Sheng Chen。  
**机构：** 清华大学；休斯敦大学；南安普顿大学。  
**来源：** 上传 PDF TW-Sep-25-2603.pdf，共 16 页。  
**当前范围：** 已录入摘要、I–VI 节正文、公式（1）–（32）的主体内容、表 I–XI、图 1–9 说明与附录推论 1 证明；64 条英文参考文献已补录，部分原文细节尚待逐页终校，**暂不标记为已验收全文**。

## 摘要

基于深度学习的信道预测因能够缓解高移动性多输入多输出（MIMO）系统中的信道老化而受到广泛关注。然而，现有信道预测方法通常从采用均匀导频估计的信道序列中提取时间相关性。在高移动性场景下，为减轻多普勒混叠，需要设置密集导频，从而产生大量估计开销。为解决这一问题，本文提出基于非均匀导频模式和连续时间 Transformer 的信道预测方法，使系统仅借助少量导频即可在任意时间尺度上实现准确预测。

具体而言，首先根据切比雪夫多项式的根设计非均匀导频模式，并在信道变化主要由多普勒效应支配、用户速度相对稳定的条件下证明其最优性；在这一模式中，部分导频被密集部署，以提供更精细的多普勒相位估计分辨率。随后，设计连续时间 Transformer，将 Transformer 优秀的特征提取能力与神经常微分方程（neural ODE）的连续时间建模能力结合，灵活处理非均匀时间间隔的信道估计序列。具体来说，通过引入神经 ODE，将注意力机制扩展至连续时间域，并设计高频时间编码以拟合快速时变信道。此外，提出逐元素预测机制，以高效捕获时间相关性并防止过拟合。仿真表明，所提方法能够在高移动性场景下实现准确的连续时间信道预测，明显优于已有信道预测方法。

**关键词：** 多输入多输出；信道预测；高移动性场景；多普勒混叠；深度学习。

## I. 引言

多输入多输出（MIMO）是 5G、6G 及未来无线通信系统中的基础技术之一 [1]。为充分发挥 MIMO 在下行传输中的潜力，基站（BS）需要准确的信道估计。然而，随着用户设备（UE）和天线数量增加，信道估计带来的导频开销可能非常显著 [2]、[3]。此外，在移动场景下，为缓解信道老化 [4]，必须周期性地执行信道估计，进一步加重导频负担。针对这些问题，信道预测利用历史与未来信道间的时间相关性推断未来信道序列，已获得广泛应用 [5]。

传统信道预测方法主要包括自回归（AR）模型 [6]、[7]、正弦波叠加模型 [8] 和线性外推模型 [9]。文献 [6] 结合 AR 参数估计设计向量卡尔曼滤波器，文献 [7] 借助角度—时延域信道稀疏性改善 AR 模型性能；文献 [8] 基于旋转不变性技术（ESPRIT）估计正弦波叠加模型参数，文献 [9] 推导出基于 Prony 方法的线性外推预测器。然而，传统方法通常依赖传播路径数等严格假设，可能与真实环境中复杂的多径信道不符，从而导致明显的性能退化。

为解决上述问题，基于深度学习的信道预测得到广泛研究 [10]–[17]，其优势在于能够以数据驱动方式提取信道序列中的复杂相关性。文献 [10] 采用循环神经网络（RNN）提取时间相关性，文献 [11] 采用 LSTM 与 GRU 等 RNN 变体以提高预测精度。然而，这些网络按照时间顺序逐步预测未来信道序列，难以准确捕获长期依赖关系，并且可能出现误差累积。相比之下，Transformer 通过注意力机制捕获长期依赖、通过并行预测避免误差累积，已广泛应用于信道预测 [12]–[14]、信道估计 [20]–[23] 和预测波束成形 [24]–[27]。例如，文献 [12] 提出了并行预测的生成式 Transformer，文献 [13] 融合 Transformer 和 GRU，文献 [14] 则使用仅编码器结构的线性轻量 Transformer。文献 [15] 比较了不同神经网络的预测性能，文献 [16] 利用用户位置，提出受物理知识启发的 C-GRBFnet 以高效表示与预测信道，文献 [17] 则将历史信道序列与当前信道粗估计相融合，增强预测鲁棒性。

不过，上述方法没有建模具体时间间隔，因此只能进行均匀时间尺度预测，即历史信道与待预测信道的采样周期需要严格一致。在高移动性场景下，为缓解严重的信道老化，需要频繁进行信道估计，导致巨大导频开销。

近年来，连续时间信道预测受到关注 [28]–[32]，目标是从均匀导频估计的历史信道序列重建潜在的连续时间信道，并实现任意时间尺度预测。神经 ODE 作为广泛采用的连续时间建模方法，使用神经网络拟合信道动态，再通过数值积分实现任意时刻的预测。文献 [28] 利用 RNN 提取时间相关性，并将输出送入神经 ODE；文献 [29]、[30] 分别结合 LSTM、GRU 与神经 ODE；文献 [31] 提出受物理知识启发的神经 ODE，以有效学习信道动态。近期文献 [32] 提出 ODE-Former，结合类似 Transformer 的结构与神经 ODE，以支持从任意时隙采样的信道序列进行连续时间预测，但它直接通过积分长度确定时间关系，而未显式使用注意力机制。

然而，现有神经 ODE 方法面临三个问题。第一，也是最关键的，是**多普勒混叠**。信道时间变化主要来自多普勒相位旋转，且旋转速度与用户速度成比例。随用户速度增加，相邻两次估计之间的多普勒相位可能旋转超过一整周 $2\pi$。此时根据奈奎斯特准则发生多普勒混叠，难以准确恢复多普勒相位。要避免这一问题，现有神经 ODE 方法必须密集地插入大量均匀导频，产生很高的估计开销。

第二，现有神经 ODE 方法多依赖 RNN 类网络提取信道序列中的时间相关性，难以精确捕获长期依赖，还可能产生误差累积。第三，现有方法常先将信道向量变换到角度域，再一次预测其中全部元素，同时利用空间与时间相关性，称为逐向量预测。然而，角度域信道向量的不同元素通常对应具有不同多普勒频移的传播路径，因而它们的时间动态并不一致。强迫不同元素共享一套注意力权重等时间相关性表示，可能降低预测性能。此外，其他元素中的冗余信息也可能干扰目标元素的时间相关性提取，增加过拟合风险。

因此，本文提出采用非均匀导频模式的逐元素连续时间 Transformer。非均匀导频根据切比雪夫多项式的根布置，其中部分导频密集配置，在相同导频开销下比均匀导频具有更细的多普勒相位估计分辨率；当信道变化以多普勒效应为主且 UE 速度相对稳定时，证明其在最大范数准则下有利于最优重建连续时间信道。网络则将 Transformer 特征提取能力与神经 ODE 连续时间建模能力结合，通过神经 ODE 将注意力机制显式扩展至连续时间域，使用高频时间编码捕获快速变化的信道，并采用逐元素预测机制为每个元素产生独立注意力权重，同时共享网络参数，从而降低过拟合风险。

**表 I：所提方法与现有深度学习信道预测方法的比较**

| 方法 | 注意力机制 | 连续时间建模 | 导频模式 | 预测机制 |
|---|:---:|:---:|---|---|
| RNN 类 [10]、[11] | × | × | 均匀 | 逐向量 |
| Transformer [12]–[14] | ✓ | × | 均匀 | 逐向量 |
| 神经 ODE [28]–[31] | × | ✓ | 均匀 | 逐向量 |
| 本文方法 | ✓ | ✓ | 非均匀 | 逐元素 |

## II. 系统模型

考虑基站服务一个单天线用户的情形，所提方法也可直接扩展至多天线 UE。基站采用双极化均匀平面阵列（UPA），水平与竖直方向的天线数分别为 $M_h$、$M_v$，因此总天线数量为 $M=2M_hM_v$。

### A. 信道模型

采用现有信道预测研究中广泛使用的三维时变多径信道模型。令时隙 $t$ 的信道向量为 $\mathbf h(t)\in\mathbb C^{M\times1}$。其第 $m$ 个元素为

$$
[\mathbf h(t)]_m=\sum_{l_p=1}^{L_p}\alpha_{l_p}
e^{j2\pi\frac{(\mathbf r_{\mathrm{tx},l_p})^\top\mathbf d_{\mathrm{tx},m}}{\lambda}}
e^{j2\pi f_{D,l_p}t}e^{-j2\pi f_c\tau_{l_p}}.\tag{1}
$$

其中，$L_p$ 是传播路径数量；$\alpha_{l_p}$、$f_{D,l_p}$ 和 $\tau_{l_p}$ 分别是第 $l_p$ 条路径的复增益、多普勒频移与传播时延；$\lambda$ 为波长，$f_c$ 为载波频率；$\mathbf d_{\mathrm{tx},m}$ 为基站第 $m$ 根天线的位置向量，$\mathbf r_{\mathrm{tx},l_p}$ 为发射方位角与俯仰角所决定的球面单位向量：

$$
\mathbf r_{\mathrm{tx},l_p}=
[\sin\theta_{\mathrm{tx},l_p}\cos\varphi_{\mathrm{tx},l_p},
\sin\theta_{\mathrm{tx},l_p}\sin\varphi_{\mathrm{tx},l_p},
\cos\theta_{\mathrm{tx},l_p}]^\top.\tag{2}
$$

在式（1）中，时间变化来自多普勒相位 $2\pi f_{D,l_p}t$ 的旋转。多普勒频移可写为

$$
f_{D,l_p}=\frac{f_c(\mathbf r_{\mathrm{rx},l_p})^\top\mathbf v}{c},\tag{3}
$$

其中，$c$ 为光速，$\mathbf r_{\mathrm{rx},l_p}$ 是由到达方位角和到达俯仰角确定的球面单位向量，$\mathbf v$ 是用户速度向量：

$$
\mathbf v=v[\sin\theta_v\cos\varphi_v,
\sin\theta_v\sin\varphi_v,\cos\theta_v]^\top.\tag{4}
$$

随着速度大小 $v$ 增加，多普勒频移增大，信道的时间变化更为剧烈。

### B. 问题表述

令 $\widetilde{\mathbf h}(t)$ 表示时刻 $t$ 的信道估计向量。为了在移动场景中缓解信道老化，需要利用历史估计信道序列预测未来信道。大多数现有方法关注图 1(a) 所示的均匀时间尺度预测。以当前时刻为 0，令 $T_e$ 为信道估计周期，$J$ 与 $P$ 分别为历史估计和未来预测的序列长度，$\widehat{\mathbf h}(t)$ 为预测信道，则传统方法只利用时间间隔相等的估计序列，预测周期也被固定为 $T_e$。由于网络未显式建模时间间隔，为缓解高移动性条件下的信道老化，必须缩短 $T_e$，造成大量导频开销。

连续时间预测方法进一步将历史信道估计的时刻集合 $\{t_j\}_{j=1}^J$ 和未来需要预测的时刻集合 $\{t_p\}_{p=1}^P$ 同时输入预测函数：

$$
\{\widehat{\mathbf h}(t_p)\}_{p=1}^{P}
=g_{\mathrm{con}}\!\left(
\{\widetilde{\mathbf h}(t_j),t_j\}_{j=1}^{J},
\{t_p\}_{p=1}^{P}\right).\tag{6}
$$

其中，时间信息被明确嵌入网络输入，用于重建连续时间信道。然而，现有连续时间研究大多依然假设历史信道采用均匀导频采样：$t_j=(j-J)T_e$，$j=1,\ldots,J$。这使得高移动性条件下仍需额外插入大量高密度均匀导频。

**图 1：** 三种预测框架：(a) 均匀导频与均匀时间尺度预测；(b) 均匀导频与连续时间预测；(c) 非均匀导频与连续时间预测。当前时刻为 0 ms，示例中的均匀导频时刻为 $\{-80,-70,-60,-50,-40,\ldots,0\}$ ms，非均匀导频时刻为 $\{-80,-78,-60,-42,-40,\ldots,0\}$ ms。



上述两类预测器的完整数学形式如下。均匀时间尺度预测固定以间隔 $T_e$ 进行采样与输出：

$$
\{\widehat{\mathbf h}(pT_e)\}_{p=1}^{P}
=g_{\mathrm{uni}}\!\left(
\{\widetilde{\mathbf h}((j-J)T_e)\}_{j=1}^{J}
\right).\tag{5}
$$

这里 $J$ 为历史信道估计长度，$P$ 为未来预测长度。式（6）则在输入端加入全部历史估计与未来预测的具体时间坐标，将网络推广至非均匀时间尺度。

**表 II：非均匀导频模式分析所用记号（与原文一致）**

| 记号 | 定义 |
|---|---|
| $J/\widetilde J$ | 增加导频之前／之后的历史信道估计序列长度 |
| $T_e$ | 增加额外导频之前的原始估计周期 |
| $T_{e,\min}$ | 为避免多普勒混叠所需的最小估计时间间隔 |
| $T_{\mathrm{che},\min}/T_{\mathrm{uni},\min}$ | 非均匀／均匀导频模式的最小相邻时间间隔 |
| $N$ | 在两个原始导频之间新插入的额外导频数量 |
| $N_{\min}$ | 满足避免多普勒混叠条件所需的最少额外导频数 |
| $t_{\mathrm{che}}^{(n)}/t_{\mathrm{che},j}^{(n)}$ | 归一化区间 $[-1,1]$ 中／第 $j$ 个实际估计间隔中的第 $n$ 个新增导频时刻 |
| $t_{\mathrm{che},j}$ | 插入非均匀模式后的第 $j$ 个导频时刻 |

## III. 面向连续时间信道预测的非均匀导频模式

### A. 高移动性场景中的多普勒混叠

从历史估计序列重建潜在连续时间信道，是实现任意时间尺度准确预测的关键。但这一重建根据奈奎斯特准则对最小信道估计间隔提出了限制。

**定理 1。** 为避免多普勒混叠，信道估计的最小时间间隔 $T_{e,\min}$ 必须满足

$$
T_{e,\min}<\frac{c}{f_cv}.\tag{7}
$$

证明思路如下。由式（1）与式（3），信道的时变部分为 $e^{j2\pi f_{D,l_p}t}$；当路径到达方向与速度向量对齐时，多普勒相位旋转最快，其角频率由 $f_cv/c$ 决定。按照解析信号的奈奎斯特准则，要求相邻估计时刻的最大相位变化小于 $2\pi$，即

$$
2\pi\frac{f_cv}{c}T_{e,\min}<2\pi,\tag{8}
$$

从而得到式（7）。

**备注 1。** 多普勒相位具有周期性，因此观测只能确定其模 $2\pi$ 的旋转角。当相邻估计之间真实相位变化达到或超过一周，就可能无法从折叠后的观测恢复实际旋转幅度，发生混叠。

**备注 2。** 多普勒混叠在现实场景中并不少见。例如，当载频为 3.5 GHz、UE 速度为 60 km/h 时，要避免多普勒混叠，$T_{e,\min}$ 必须小于 5.14 ms；而 3GPP 规范中可能采用的信道估计周期长达 160 ms，因此该场景可能发生混叠。

**图 2：** 多普勒相位旋转超过完整周期 $2\pi$ 时，实际相位旋转与模 $2\pi$ 的估计相位之间的差异示意。

### B. 基于切比雪夫多项式根的非均匀导频

为了避免混叠，均匀导频方法必须按照定理 1 缩短估计周期，这会带来很大的导频开销。但在实际场景中，UE 通常不会在短时间内突然剧烈改变速度，因此几个信道估计周期内的多普勒频移相对稳定。这样，可以在原有周期 $T_e$ 内插入少量非均匀导频，使其中最小时间间隔满足式（7），利用短间隔准确估计多普勒相位变化，再依据多普勒频移的相对平稳性，将其延伸到原有估计周期，恢复原本可能混叠的相位变化。

进一步地，在满足混叠约束的同时，还应优化导频在时间上的分布，以帮助重建连续时间信道。受到函数插值领域切比雪夫多项式根的启发，考虑在区间 $[-1,1]$ 中布置 $N$ 个不同时刻。对最大范数准则而言，优选时刻为

$$
t_{\mathrm{che}}^{(n)}
=\cos\left(\frac{2N-2n+1}{2N}\pi\right),
\quad n=1,\ldots,N.\tag{9}
$$



对于引理 1，原文使用插值误差上界推导节点最优性。令 $h(t)$ 为待重建连续函数、$\widehat h(t)$ 为重建函数，在所考虑的 $N$ 次可微函数空间中，有

$$
\|h(t)-\widehat h(t)\|_\infty
\propto
\max_{t\in[-1,1]}
\left|\prod_{n=1}^{N}(t-t^{(n)})\right|,
\quad t\in[-1,1].\tag{10}
$$

由切比雪夫多项式的极小极大性质，

$$
\{t_{\mathrm{che}}^{(n)}\}_{n=1}^N
=
\underset{\{t^{(n)}\}_{n=1}^{N}}{\operatorname{argmin}}
\ \max_{t\in[-1,1]}
\left|\prod_{n=1}^{N}(t-t^{(n)})\right|.\tag{11}
$$

因此，在给定插值理论的误差控制形式下，切比雪夫根使最大误差界最小。这里的“最优”是这一函数重建准则下的最优，不意味着所有随机无线信道条件下都具有无条件最小的实际预测 NMSE。

**引理 1。** 在 $[-1,1]$ 内的全部 $N$ 个不同采样时刻选择中，式（9）所定义的切比雪夫多项式根，在最大范数意义下对于 $C^N[-1,1]$ 中连续时间函数的重建是最优的。这一结论来自插值误差上界中的节点乘积项 $\max_{t\in[-1,1]}\prod_{n=1}^N|t-t^{(n)}|$ 由切比雪夫根最小化的性质。

**定理 2。** 在第 $j$ 与第 $j+1$ 次原始信道估计之间的区间 $[(j-J)T_e,(j+1-J)T_e]$，插入的非均匀导频时间位置为

$$
t_{\mathrm{che},j}^{(n)}
=\frac{(2j-2J+1)T_e}{2}
+\frac{T_e}{2}\cos\left(\frac{2N-2n+1}{2N}\pi\right).\tag{12}
$$

当信道变化由多普勒主导、用户速度相对稳定时，这种时间分布在连续时间信道重建意义下最优。定理 2 同时给出避免混叠所需的最少额外导频数：

$
N\ge N_{\min}
=\left\lceil
\frac{\pi}{2\arccos\!\left(1-\frac{2c}{f_cvT_e}\right)}
\right\rceil.\tag{13}
$

该式用于原有估计间隔需要新增导频的情形。若原始间隔已满足无混叠条件，则不必据此强制增加导频；$\lceil\cdot\rceil$ 为向上取整。

上述结果是通过将式（9）的 $[-1,1]$ 仿射映射到目标估计区间得到的。由于余弦函数的曲线形状，导频在区间两端较密集、在中间相对稀疏。其最小间隔为

$$
T_{\mathrm{che},\min}
=\frac{T_e}{2}-\frac{T_e}{2}
\cos\left(\frac{\pi}{2N}\right).\tag{14}
$$





**图 3：** 基于切比雪夫根的非均匀导频分布。黑点表示原有导频，蓝色标记表示增加的导频；示例取 $N=3$。

**备注 3（适用条件）。** 最优性依赖多普勒主导、速度相对稳定的条件。例如 $T_e=40$ ms、$v=60$ km/h、加速度 $a=4$ m/s² 时，区间内速度最大变化约 $aT_e=0.16$ m/s；UE 最大位移约 0.67 m，通常远小于 BS—UE 距离，因此可忽略散射环境和路径生灭的显著变化。但当估计周期较长、散射环境急剧变化或 UE 速度突变时，切比雪夫非均匀导频的最优性不一定严格成立，应依据环境复杂度和速度重新配置。

**备注 4。** 已有工作提出使用深度学习联合设计导频信号与信道估计，通过全连接层学习导频或神经网络剪枝减少 OFDM 时频导频。然而，它们主要解决给定时刻的信道估计，而这里研究的是不同时间位置上的导频分配，以捕获信道序列时间相关性。未来可进一步研究由深度学习进行跨时隙自适应导频配置，而切比雪夫模式可作为有效的初始方案。

最终非均匀导频序列长度为 $\widetilde J=J+(J-1)N$。与相同导频开销的均匀模式相比，其最小时间间隔满足

$$
T_{\mathrm{che},\min}\le T_{\mathrm{uni},\min},
\quad N\in\mathbb N^+,\tag{15}
$$

等号当且仅当 $N=1$ 成立（推论 1；原文附录 A 给出证明）。这说明切比雪夫模式除具有重建函数的最优性外，在相同导频开销下还具备更好的多普勒混叠缓解能力。

## IV. 逐元素连续时间 Transformer



采用非均匀导频之后，历史估计时刻构成集合 $\mathcal T_{\mathrm{che}}=\{t_{\mathrm{che},j}\}_{j=1}^{\widetilde J}$，其中 $\widetilde J=J+(J-1)N$。相应的连续时间预测函数写为

$$
\{\widehat{\mathbf h}(t_p)\}_{p=1}^{P}
=g_{\mathrm{con}}\!\left(
\{\widetilde{\mathbf h}(t_{\mathrm{che},j}),t_{\mathrm{che},j}\}_{j=1}^{\widetilde J},
\{t_p\}_{p=1}^{P}\right).\tag{16}
$$

因此，网络不仅需要编码历史 CSI，还必须能够直接处理不均匀时间间隔及任意未来预测时刻。

**表 III：连续时间注意力所用记号（与原文一致）**

| 记号 | 定义 |
|---|---|
| $\{t_{\mathrm{che},j}\}_{j=1}^{\widetilde J}/\{t_p\}_{p=1}^{P}$ | 历史估计／未来预测时刻 |
| $X/X_{\mathrm{tok}}/X_{\mathrm{pos}}$ | 网络输入／token 嵌入／位置嵌入 |
| $\{\tau_l\}_{l=1}^{L}$ | 查询、键和值的采样时刻 |
| $q_l/k_l/v_l$ | 时刻 $\tau_l$ 的查询／键／值观测 |
| $q_l(t)/k_l(t)/v_l(t)$ | 由对应离散观测得到的查询／键／值连续时间轨迹 |
| $c_{l_1,l_2}$ | 键时刻 $\tau_{l_1}$ 与查询时刻 $\tau_{l_2}$ 的标准注意力权重 |
| $c(\tau_{l_1},\tau_{l_2})$ | 两个时刻之间的连续时间注意力权重 |
| $\overline v_{l_1}(\tau_{l_2})$ | 从值的采样时刻 $\tau_{l_1}$ 到查询时刻 $\tau_{l_2}$ 的平均时间影响 |
| $o_{l_2}$ | 查询时刻 $\tau_{l_2}$ 的标准注意力输出 |
| $o(\tau_{l_2})$ | 查询时刻 $\tau_{l_2}$ 的连续时间注意力输出 |

### A. 连续时间注意力

将历史估计时刻改为 $T_{\mathrm{che}}$ 后，连续时间预测函数必须能够处理不均匀历史采样，并在任意未来时刻输出信道。为此，本文首先将标准注意力扩展到连续时间。

令输入序列 $X=[x_1,\ldots,x_L]\in\mathbb R^{d_i\times L}$，对应的采样时刻为 $\{\tau_l\}_{l=1}^L$。查询、键和值为 $q_l=W_qx_l$、$k_l=W_kx_l$、$v_l=W_vx_l$，输出维度为 $d_o$。标准注意力在查询时刻 $\tau_{l_2}$ 的权重与输出分别为

$$
\{c_{l_1,l_2}\}_{l_1=1}^{L}
=\operatorname{softmax}\left(
\left\{\frac{k_{l_1}^\top q_{l_2}}{\sqrt{d_o}}\right\}_{l_1=1}^{L}
\right),\tag{17}
$$

$$
o_{l_2}=\sum_{l_1=1}^{L}v_{l_1}c_{l_1,l_2}.\tag{18}
$$

查询与键越匹配，对应注意力权重越大。但标准注意力并不显式建模时间间隔，因而不能充分适应任意时间尺度。

本文利用神经 ODE 将离散观测 $q_l,k_l,v_l$ 扩展为连续时间轨迹 $q_l(t),k_l(t),v_l(t)$。连续轨迹既可以借助线性、样条等闭式插值函数得到：

$$
q_l(t)=f_{\mathrm{interp}}(\{q_l,\tau_l\}_{l=1}^{L}),\tag{19}
$$

也可以通过神经 ODE 求解：

$$
q_l(t)=q_l+\int_{\tau_l}^{t}f_{\mathrm{ODE}}(q_l(z),z)\,dz.\tag{20}
$$

其中，$f_{\mathrm{ODE}}$ 由神经网络拟合轨迹导数，积分可通过 Euler 或 Runge–Kutta 等方法近似。神经 ODE 的连续时间建模能力更强，但积分计算代价较高；闭式插值则能快速求得任意时刻的特征。在注意力计算中，查询和键主要负责捕获时间相关性，而值直接建模输入—输出之间更复杂的关系。因此，本文采用闭式插值构造查询、键轨迹，并用神经 ODE 拟合值轨迹。

进一步地，将键轨迹和查询轨迹在两个采样时刻之间的积分相关性代入注意力分数，再用区间长度归一化，以刻画轨迹之间的对齐程度，而不是单纯反映时隙间隔。该积分可用梯形积分或 Gauss–Legendre 求积逼近，积分点的数量与权重由所选数值方法确定。

连续时间注意力的**完整定义**如下。对固定查询时刻 $\tau_{l_2}$，把全部候选键时刻的分数统一经过 softmax，并定义

$$
\{c(\tau_{l_1},\tau_{l_2})\}_{l_1=1}^L=
\begin{cases}
\displaystyle
\operatorname{softmax}_{l_1}
\left(
\frac{\int_0^{\tau_{l_2}-\tau_{l_1}}
k_{l_1}(t+\tau_{l_1})^\top
q_{l_2}(-t+\tau_{l_2})\,dt}
{(\tau_{l_2}-\tau_{l_1})\sqrt{d_o}}
\right),
&\tau_{l_2}\ne\tau_{l_1},\\[1.2em]
\displaystyle
\operatorname{softmax}_{l_1}
\left(\frac{k_{l_1}^\top q_{l_2}}{\sqrt{d_o}}\right),
&\tau_{l_2}=\tau_{l_1}.
\end{cases}\tag{21}
$$

这里 softmax 沿全部键的索引 $l_1$ 进行，分段条件针对各个键—查询时刻对分别选择相应的未归一化分数。当 $\tau_{l_2}\ne\tau_{l_1}$ 时，分数衡量查询轨迹 $q_{l_2}(t)$ 与键轨迹 $k_{l_1}(t)$ 在相隔时段内的对齐程度，除以 $\tau_{l_2}-\tau_{l_1}$ 是为避免分数主要由时间间隔长度决定；当两时刻相同时，退化为标准注意力的点积形式，保持连续性。

式（21）中的积分可由梯形法或 Gauss–Legendre 求积近似：

$$
\begin{aligned}
&\int_0^{\tau_{l_2}-\tau_{l_1}}
k_{l_1}(t+\tau_{l_1})^\top
q_{l_2}(-t+\tau_{l_2})\,dt\\
&\quad\approx\sum_{e=1}^{E}\gamma_e\,
k_{l_1}(\tau_{l_e}+\tau_{l_1})^\top
q_{l_2}(-\tau_{l_e}+\tau_{l_2}).
\end{aligned}\tag{22}
$$

其中，$E$ 为积分点数，$\gamma_e$ 为权重，$\tau_{l_e}$ 为相应积分点。它们的取值由数值积分方案决定。轨迹值可以将相应时刻代入式（19）的插值函数得到。

类似地，连续时间**值向量**采用在键时刻与查询时刻之间的平均时间影响：

$$
\overline v_{l_1}(\tau_{l_2})=
\begin{cases}
\displaystyle
\frac{\int_{\tau_{l_1}}^{\tau_{l_2}}v_{l_1}(t)\,dt}
{\tau_{l_2}-\tau_{l_1}},
&\tau_{l_2}\ne\tau_{l_1},\\[1em]
v_{l_1},&\tau_{l_2}=\tau_{l_1}.
\end{cases}\tag{23}
$$

于是查询时刻 $\tau_{l_2}$ 的连续时间注意力输出为

$$
o(\tau_{l_2})
=\sum_{l_1=1}^{L}
\overline v_{l_1}(\tau_{l_2})\,
c(\tau_{l_1},\tau_{l_2}).\tag{24}
$$

由于不同查询时刻的计算相互独立，与标准注意力类似，该操作仍支持并行实现。

**备注 5：计算复杂度。** 式（21）的计算有两步：先对全部键—查询时刻对及 $E$ 个积分点，通过闭式插值分别获得查询与键轨迹，总复杂度为 $O(L^2dE)$；再计算全部轨迹点积，复杂度同样为 $O(L^2dE)$。整体复杂度仍为 $O(L^2dE)$，较标准注意力 $O(L^2d)$ 增加积分点数因子 $E$。

**备注 6：高维问题。** 当序列长度 $L$ 和特征维数 $d$ 都较大时，连续时间注意力的开销较高。可以考虑低秩核近似、稀疏注意力和序列分块（patching）等方法减轻负担。



**原文备注 5：连续时间注意力的计算量。** 根据式（22），连续时间注意力的计算分为两步。首先，查询轨迹在 $-\tau_{l_e}+\tau_{l_2}$ 的值和键轨迹在 $\tau_{l_e}+\tau_{l_1}$ 的值，均由线性插值等闭式插值函数获得。对于单个采样位置，插值计算复杂度为 $O(d)$；由于每一对查询与键都需要 $E$ 个积分采样点，构造全部插值结果的计算量为 $O(L^2dE)$。其次，利用这些插值结果计算式（22）中的内积，同样需要 $O(L^2dE)$ 次运算。因此，连续时间注意力总体复杂度为 $O(L^2dE)$，高于标准注意力式（17）的 $O(L^2d)$。这里 $L$ 是序列长度，$d$ 是特征维度，$E$ 是积分点数。

**原文备注 6：复杂度与模型设计。** 当序列长度 $L$ 和特征维度 $d$ 较大时，连续时间注意力的二次项会带来显著计算开销。为了在任意预测时间尺度建模能力和效率之间取得平衡，本文不将这种机制无差别地用于全部网络层，而是在后续架构中将固定历史观测的特征提取与任意未来时刻的连续时间生成分开处理。这一选择也解释了为什么历史序列编码器仍采用标准注意力，而生成式解码器采用连续时间注意力。

### B. 高频时间编码与逐元素预测

标准 Transformer 的位置编码在高移动性场景下可能无法表示快速变化的多普勒相位。本文采用高频时间编码，明确嵌入信道观测和预测时刻，使用频率超参数 $\omega_0$ 控制时间特征的高频表达能力，便于模型拟合快速周期性变化。

大多数现有信道预测网络一次输入整个角度域信道向量，并联合预测全部元素。这种逐向量预测方式使不同元素共享注意力权重，然而各传播路径的方位角和俯仰角不同，导致其多普勒频移不同；共享权重可能与元素特定的动态不一致，影响时间相关性提取。随着 massive MIMO 天线数量增加，不同角度域元素之间的空间相关性也可能变弱，利用其他元素的信息反而会引入冗余并造成过拟合。

为此，本文提出逐元素预测机制：将角度域信道向量每个元素分别送入同一个预测网络，使各元素根据自己的历史序列生成独立注意力权重。不同元素的预测共享同一套网络参数，从而降低模型存储开销；同时可将批大小由 $B$ 扩展为 $BM$，并行预测全部 $M$ 个元素，提高计算效率。



高频时间编码的定义可明确写为下式。标准 Transformer 的位置编码取序列的**顺序索引** $l$，而不是物理采样时刻：

$$
[X_{\mathrm{pos}}]_{i,l}=
\begin{cases}
\displaystyle \sin\!\left(\frac{l-1}{10000^{i/d_i}}\right),
&i\ \text{为偶数},\\[4pt]
\displaystyle \cos\!\left(\frac{l-1}{10000^{i/d_i}}\right),
&\text{否则},
\end{cases}
\quad i=0,\ldots,d_i-1.\tag{25}
$$

这种方法通过顺序信息打破注意力机制的置换不变性，但不能表示不规则样本的实际时间间隔。所提出的高频时间编码直接使用观测时刻 $\tau_l$，并设置频率参数 $\omega_0$：

$$
[X_{\mathrm{tem}}]_{i,l}=
\begin{cases}
\displaystyle \sin\!\left(\frac{\omega_0\tau_l}{10000^{i/d_i}}\right),
&i\ \text{为偶数},\\[4pt]
\displaystyle \cos\!\left(\frac{\omega_0\tau_l}{10000^{i/d_i}}\right),
&\text{否则}.
\end{cases}\tag{26}
$$

其中，$\omega_0$ 取相对较大的值，使编码随物理时间快速变化，形成预先指定的高频周期分量，以帮助注意力机制拟合高移动性信道的快速周期性动态。原文采用 $X=X_{\mathrm{tok}}+X_{\mathrm{tem}}$ 作为网络输入。

在应用逐元素预测之前，将信道估计从空间域变换至角度域：

$$
\widetilde{\mathbf h}_{A}(t_{\mathrm{che},j})
=\mathbf F_A\widetilde{\mathbf h}(t_{\mathrm{che},j}),\qquad
\mathbf F_A=\operatorname{diag}(\mathbf F_{\mathrm{DFT}},\mathbf F_{\mathrm{DFT}})
\in\mathbb C^{M\times M},\tag{27}
$$

其中，$\mathbf F_{\mathrm{DFT}}\in\mathbb C^{(M/2)\times(M/2)}$ 为 DFT 矩阵，$\mathbf F_A$ 对双极化方向采用块对角酉变换。角度域每个元素分别作为网络序列输入，但所有元素共用网络参数。

### C. 网络结构

图 4 给出完整网络，包括多尺度 Transformer 编码器和生成式 Transformer 解码器。原有非均匀导频的历史估计时刻是固定的，而未来预测时刻可以任意指定。因此采用编码器—解码器结构，将固定采样点的历史特征提取与任意预测时刻的特征生成明确分开。

编码器使用 token 嵌入、高频时间编码、标准注意力和前馈网络，按照多尺度堆叠方式处理完整历史序列，并逐步转向更细尺度的子序列，使不同尺度的历史特征得到提取。由于历史序列通常较长、估计时刻又固定，因此编码器不使用计算代价较高的连续时间注意力。

解码器输入最近 $G$ 个历史信道元素和 $P$ 个零填充位置，目标是在这些零位置对应的任意未来时刻并行生成预测结果。经 token 嵌入与高频时间编码后，解码器利用连续时间注意力捕获任意时间尺度的相关性，再利用编码器提取的历史信息和前馈网络生成预测输出。最终，将全部角度域元素合并并逆变换，得到原始信道向量预测。

**图 4：** 逐元素连续时间 Transformer 总体结构，包括多尺度编码器和生成式解码器。编码器使用标准注意力并进行序列减半与多尺度堆叠，解码器使用连续时间注意力在任意预测时刻并行产生输出。

### D. 训练与评价

使用归一化均方误差训练模型并评价性能：

$$
\mathrm{NMSE}(t_p)=
\frac{\|\mathbf h(t_p)-\widehat{\mathbf h}(t_p)\|_2^2}
{\|\mathbf h(t_p)\|_2^2},
\qquad
\mathrm{NMSE}=\frac1P\sum_{p=1}^{P}\mathrm{NMSE}(t_p).\tag{28}
$$

在测试时，为便于比较，预测时刻取 $t_p=pT_p$；在训练时，预测时刻从 $(0,PT_p]$ 区间均匀随机采样，以培养任意时间尺度预测能力。

## V. 仿真研究（已录入部分）

### A. 实验设置

采用 3GPP TR 38.901 城市宏蜂窝（UMa）信道模型构造数据集，包含视距（LOS）和非视距（NLOS）场景。若无特别说明，UE 速度为 60 km/h，信道估计信噪比为 10 dB。原有估计序列长度 $J=8$、估计周期 $T_e=40$ ms，每个周期插入 $N=3$ 个导频，获得 $\widetilde J=8+7\times3=29$ 个估计时刻。非均匀方案的时刻示例为 $\{-280,-278,-260,-242,-240,\ldots,0\}$ ms，均匀方案为 $\{-280,-270,-260,-250,-240,\ldots,0\}$ ms。预测长度 $P=8$，测试阶段的预测周期 $T_p=5$ ms。

**表 IV：3GPP TR 38.901 数据集信道参数**

| 参数 | 数值 |
|---|---|
| 小区半径 | 300 m |
| 基站高度 | 25 m |
| UE 最小/最大高度 | 1.5 / 22.5 m |
| 中心频率 | 3.5 GHz |
| 路径数量 | 12 |
| 时延扩展 | 98.3 ns |
| BS 水平/竖直天线数 | 4 / 4 |
| BS 总天线数 | 32 |

**表 V：连续时间 Transformer 网络结构**

| 模块 | 设置 |
|---|---|
| 多尺度编码器 token 嵌入 | 输入维度 2，输出维度 64 |
| 编码器标准注意力 | 8 头，堆叠数 2，首层编码块数 2、第二层 1，特征维度 64，配合 FFN 与 LayerNorm |
| 生成解码器 token 嵌入 | 输入维度 2，输出维度 64 |
| 解码器连续时间注意力 | 8 头，解码块数 2，特征维度 64，配合 FFN 与 LayerNorm |
| 神经 ODE | 时间输入维度 1，特征输入维度 64，输出维度 64，LayerNorm 与 Tanh |

查询和键使用线性插值，值使用神经 ODE 与 Runge–Kutta 方法。连续时间注意力积分采用两个积分点的梯形近似，默认 $\omega_0=30$。训练集与测试集规模分别为 12,800 和 2,560；批大小 128，训练 300 个 epoch，优化器为 Adam，学习率 $5\times10^{-4}$。原文给出代码公开引用 [35]。



### B. 仿真结果

**连续时间注意力与高频编码的验证。** 表 VI 显示，连续时间注意力优于标准注意力，说明它能够准确建模任意时间尺度上的相关性。当 $\omega_0=1$ 时，编码难以跟踪高移动性场景下的快速时间变化，预测性能较差；当 $\omega_0$ 为 10、30、50 时，高频时间编码有效改善性能，其中 30 最优。与不使用编码或采用一般位置编码的版本相比，高频时间编码也更有利于刻画快速周期性信道动态。

**表 VI：不同注意力与时间编码配置的 NMSE**

| 配置 | NMSE (dB) |
|---|---:|
| 标准注意力，$\omega_0=30$ | −5.45 |
| 连续时间注意力，$\omega_0=1$ | −5.52 |
| 连续时间注意力，$\omega_0=10$ | −6.60 |
| 连续时间注意力，$\omega_0=30$ | −6.77 |
| 连续时间注意力，$\omega_0=50$ | −6.71 |
| 连续时间注意力，不使用任何编码 | −4.76 |
| 连续时间注意力，一般位置编码 | −5.32 |

**模型结构消融。** 表 VII 比较不同连续时间建模方法及其计算复杂度。全部采用插值的方案虽然开销较小，但预测性能较差；全部采用神经 ODE 可以略微改善 NMSE，却显著增加计算量。因此，本文选择对值使用神经 ODE、对查询与键使用插值的混合方案。稀疏注意力可将连续时间注意力的复杂度从 $O(L^2dE)$ 降至 $O(L\log L\,dE)$，但会造成一定性能损失。采用根据多普勒频谱选择的固定积分步长，比简单固定步长更准确；但原始误差控制式自适应 ODE 求解器的精度仍然更好，只是复杂度更高。

**表 VII：架构变体的 NMSE 与复杂度**

| 架构 | NMSE (dB) | 复杂度（MFLOPs） |
|---|---:|---:|
| 全插值 | −6.12 | 103.28 |
| 混合结构（原始） | −6.77 | 395.59 |
| 全 ODE | −6.80 | 986.72 |
| 稀疏注意力 | −6.57 | 179.82 |
| 固定积分步长 $\Delta t=0.5$ | −6.59 | 307.50 |
| 固定积分步长 $\Delta t=1$ | −6.41 | 269.88 |
| 多普勒自适应步长 | −6.69 | 279.27 |
| 仅编码器 | −4.85 | 1866.82 |
| 连续时间编码器 | −6.78 | 1486.50 |


### C. 预测机制的消融与误差分析

表 VIII 比较不同网络的逐向量预测与逐元素预测。所提逐元素机制在每个基线上均获得更低 NMSE；图 5 同时报告了训练和测试误差的收敛曲线：逐向量预测的两条曲线之间存在明显差距，说明过拟合比较严重；逐元素预测显著缩小了这一差距。后续实验均采用逐元素预测。

**表 VIII：不同网络的逐向量与逐元素预测 NMSE（dB）**

| 网络 | 逐向量 | 逐元素 |
|---|---:|---:|
| GRU [11] | −0.50 | −1.12 |
| 原始 Transformer [12] | −0.77 | −1.35 |
| Neural ODE [30] | −0.74 | −2.69 |
| Latent ODE [50] | −1.07 | −3.49 |
| 连续时间 Transformer（本文） | −3.83 | −6.77 |

**图 5：** 所提出的连续时间 Transformer 在逐向量与逐元素预测机制下的训练和测试收敛性能比较。

### D. 导频数量与导频位置的影响

表 IX 比较均匀导频、随机导频和由切比雪夫根确定的非均匀导频。在随机导频中，从 $[-280,0]$ ms 区间随机选择估计时刻，不同样本可使用不同时间点。为保证公平，预测时刻均从 $(0,40]$ ms 内均匀抽样。

**表 IX：导频模式、导频数量与 NMSE**

| 导频模式 | 导频数 | NMSE (dB) |
|---|---:|---:|
| 均匀 [30] | 29 | −1.65 |
| 均匀 [30] | 36 | −2.03 |
| 均匀 [30] | 43 | −6.84 |
| 随机 [61] | 29 | −1.99 |
| 随机 [61] | 36 | −2.17 |
| 随机 [61] | 43 | −2.26 |
| 切比雪夫非均匀（本文） | 29 | −6.86 |

相较于使用 29 个导频的均匀与随机模式，所提方案明显更精确；均匀导频需要增加到 43 个，性能才能接近仅使用 29 个导频的非均匀方案。随机导频没有确定的短间隔分布，不能稳定避免多普勒混叠，因而其导频数增加后的效果仍然有限。

### E. 与现有预测模型的比较

图 6 给出在非均匀与均匀导频设置下，不同模型的 NMSE 随预测时间变化的结果。均匀导频导致多普勒混叠时，神经 ODE、Latent ODE 与其他模型的性能受到明显影响，而切比雪夫非均匀导频使全部模型能够利用更可靠的相位信息。所提连续时间 Transformer 在各预测时刻保持较高准确性，同时以并行预测避免自回归误差累积。

图 7 进一步考虑不同用户速度 $v$。当 $v=20$ km/h 时，均匀与非均匀导频均能避免多普勒混叠，但非均匀模式仍可取得更低 NMSE，支持其在连续时间重建中的优势。当速度增至约 30.86 km/h 及以上时，均匀导频根据定理 1 开始出现混叠，因此在图 7(a) 中从 20 km/h 增至 40 km/h 会导致明显性能退化；而非均匀导频在 $v=80$ km/h 时仍能避免多普勒混叠，使图 7(b) 中性能下降较缓。在全部速度设置下，非均匀模式的预测精度均优于均匀模式。

**图 6：** 两种导频模式下，随未来预测时刻变化的 NMSE，对比 GRU、Transformer、Neural ODE、Latent ODE、ODE-Former 与所提连续时间 Transformer。

**图 7：** 不同 UE 速度下的 NMSE：（a）均匀导频；（b）所提非均匀导频。图中特别标明均匀模式自约 30.86 km/h 起发生多普勒混叠。

图 8 展示使用非均匀导频时，最强角度索引上的连续时间复信道预测，包括实部和虚部。Neural ODE 和 Latent ODE 在预测时刻较大时难以准确拟合未来轨迹，主要原因是其循环式结构存在长期依赖与误差累积问题。所提连续时间 Transformer 在全部预测时刻均较准确地跟踪真实信道轨迹，体现连续时间注意力及并行预测的作用。

**图 8：** 不同连续时间模型的预测波形与真实信道轨迹：（a）实部；（b）虚部，均使用非均匀导频。

### F. 参数量与计算复杂度

**表 X：不同深度学习预测模型的参数量与计算量**

| 模型 | 参数量（百万） | 计算量（MFLOPs） |
|---|---:|---:|
| GRU [11] | 50.24 | 58.84 |
| 原始 Transformer [12] | 173.51 | 100.02 |
| Neural ODE [30] | 66.88 | 64.09 |
| Latent ODE [50] | 83.52 | 122.81 |
| ODE-Former [32] | 169.84 | 305.66 |
| 连续时间 Transformer | 176.13 | 395.59 |

所提模型的参数量与标准 Transformer 相当，但由于连续时间注意力引入了积分运算，其计算复杂度高于其他基线。考虑到前述精度优势，作者认为这种计算成本具有合理性。在资源受限时，还可选择表 VII 中的稀疏注意力或全插值方案。以全插值方案为例，计算量仅为 103.28 MFLOPs，接近标准 Transformer，但在 NMSE 上依然明显优于其他现有模型。

### G. 基于射线追踪信道的研究

为了进一步评估方法在较真实传播环境中的性能，采用基于 Wireless InSite 射线追踪的 DeepMIMO 数据集，使用已有信道预测工作广泛采用的场景。除表 XI 的额外设置外，信道参数大体与 3GPP TR 38.901 数据集的表 IV 相同。

**表 XI：DeepMIMO 数据集的额外信道设置**

| 参数 | 数值 |
|---|---|
| 场景 | Outdoor 1 |
| 基站索引 | 3 |
| 用户区域 | 第 501–1400 行 |

图 9 以信道估计 SNR 为横轴比较多个深度学习模型。在全部 SNR 设置下，连续时间 Transformer 均明显优于其他预测模型，说明性能优势在不同 SNR 和射线追踪信道条件下保持稳定。

**图 9：** 在所提非均匀导频与用户速度 $v=60$ km/h 的条件下，不同模型在 DeepMIMO 数据集上的 NMSE 随信道估计 SNR 的变化。

## VI. 结论

本研究围绕连续时间信道预测做出三项主要贡献。首先，从奈奎斯特准则出发分析了连续时间预测面临的多普勒混叠问题，并提出基于切比雪夫多项式根的非均匀导频模式，以大幅提高多普勒相位的估计分辨率。进一步证明，在最大范数意义下，该模式有利于连续时间信道的最优重建。其次，提出连续时间 Transformer，推导了能够在任意时间尺度捕获时间相关性的连续时间注意力机制，并设计高频时间编码，以跟踪高移动性场景下快速变化的信道。第三，提出逐元素预测机制，使网络能够专注于每个信道元素自身的时间依赖关系并减轻过拟合。仿真验证了所提方法在高移动性场景中的连续时间预测精度及其优于现有方法的性能。

## 附录 A. 推论 1 的证明

**证明。** 切比雪夫模式与均匀模式的最小估计间隔分别为

$$
T_{\mathrm{che},\min}
=\frac{T_e}{2}-\frac{T_e}{2}\cos\!\left(\frac{\pi}{2N}\right),
\qquad
T_{\mathrm{uni},\min}=\frac{T_e}{N+1}.
$$

需要证明，对全部正整数 $N$，

$$
T_{\mathrm{che},\min}-T_{\mathrm{uni},\min}
=\left[\frac12-\frac12\cos\!\left(\frac{\pi}{2N}\right)
-\frac1{N+1}\right]T_e\le0.\tag{29}
$$

令 $y=1/N$，则式（29）等价于

$$
\Delta_{\min}(y)=
\frac12-\frac12\cos\!\left(\frac{\pi y}{2}\right)
-\frac{y}{y+1}\le0,\quad y\in(0,1],\tag{30}
$$

且 $\Delta_{\min}(0)=\Delta_{\min}(1)=0$。求二阶导数得

$$
\Delta_{\min}''(y)
=\frac{\pi^2}{8}\cos\!\left(\frac{\pi y}{2}\right)
+\frac{2}{(y+1)^3}.\tag{31}
$$

因为 $\cos(\pi y/2)\ge0$ 在 $(0,1]$ 内成立，所以

$$
\Delta_{\min}''(y)>0,\qquad y\in(0,1].\tag{32}
$$

因此，$\Delta_{\min}$ 是该区间上的严格凸函数。结合两个端点的值都为零，得到内部函数值非正，故式（30）成立，推论 1 得证。

> **终校状态：** 已补入式（21）–（27）、（29）–（32）、表 VIII–XI、图 5–9 说明及附录证明。完整参考文献书目与逐页逐式核对仍未完成；不标记为已验收全文。



## 参考文献（原文英文书目）

[1] E. G. Larsson, O. Edfors, F. Tufvesson, and T. L. Marzetta, “Massive MIMO for next generation wireless systems,” *IEEE Commun. Mag.*, vol. 52, no. 2, pp. 186–195, Feb. 2014.

[2] 5G PPP Architecture Working Group, “View on 5G architecture (Version 3.0),” 5G PPP Architecture Working Group, White Paper, Jun. 2019.

[3] J. Yuan, H. Q. Ngo, and M. Matthaiou, “Machine learning-based channel prediction in massive MIMO with channel aging,” *IEEE Trans. Wireless Commun.*, vol. 19, no. 5, pp. 2960–2973, May 2020.

[4] K. T. Truong and R. W. Heath, “Effects of channel aging in massive MIMO systems,” *J. Commun. Netw.*, vol. 15, no. 4, pp. 338–351, Aug. 2013.

[5] X. Yu, D. Li, Z. Wang, and S. Sun, “An integrated new deep learning framework for reliable CSI acquisition in connected and autonomous vehicles,” *IEEE Netw.*, vol. 37, no. 4, pp. 216–222, Jul./Aug. 2023.

[6] H. Kim, S. Kim, H. Lee, C. Jang, Y. Choi, and J. Choi, “Massive MIMO channel prediction: Kalman filtering vs. machine learning,” *IEEE Trans. Commun.*, vol. 69, no. 1, pp. 518–528, Jan. 2021.

[7] C. Wu et al., “Channel prediction in high-mobility massive MIMO: From spatio-temporal autoregression to deep learning,” *IEEE J. Sel. Areas Commun.*, vol. 39, no. 7, pp. 1915–1930, Jul. 2021.

[8] J. Vanderpypen and L. Schumacher, “MIMO channel prediction using ESPRIT based techniques,” in *Proc. PIMRC* (Athens, Greece), Sep. 2007, pp. 1–5.

[9] H. Yin, H. Wang, Y. Liu, and D. Gesbert, “Addressing the curse of mobility in massive MIMO with Prony-based angular-delay domain channel predictions,” *IEEE J. Sel. Areas Commun.*, vol. 38, no. 12, pp. 2903–2917, Dec. 2020.

[10] W. Jiang and H. D. Schotten, “Neural network-based fading channel prediction: A comprehensive overview,” *IEEE Access*, vol. 7, pp. 118112–118124, Sep. 2019.

[11] W. Jiang and H. D. Schotten, “Deep learning for fading channel prediction,” *IEEE Open J. Commun. Soc.*, vol. 1, pp. 320–332, 2020.

[12] H. Jiang, M. Cui, D. W. K. Ng, and L. Dai, “Accurate channel prediction based on transformer: Making mobility negligible,” *IEEE J. Sel. Areas Commun.*, vol. 40, no. 9, pp. 2717–2732, Sep. 2022.

[13] S. Zhang, S. Zhang, Y. Mao, L. K. Yeung, B. Clerckx, and T. Q. S. Quek, “Transformer-based channel prediction for rate-splitting multiple access-enabled vehicle-to-everything communication,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 10, pp. 12717–12730, Oct. 2024.

[14] Y. Jin, Y. Wu, Y. Gao, S. Zhang, S. Xu, and C.-X. Wang, “LinFormer: A linear-based lightweight transformer architecture for time-aware MIMO channel prediction,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 9, pp. 7177–7190, Sep. 2025.

[15] O. Stenhammar, G. Fodor, and C. Fischione, “A comparison of neural networks for wireless channel prediction,” *IEEE Wireless Commun.*, vol. 31, no. 3, pp. 235–241, Jun. 2024.

[16] Z. Xiao, Z. Zhang, C. Huang, X. Chen, C. Zhong, and M. Debbah, “C-GRBFnet: A physics-inspired generative deep neural network for channel representation and prediction,” *IEEE J. Sel. Areas Commun.*, vol. 40, no. 8, pp. 2282–2299, Aug. 2022.

[17] Z. Chen, Z. Zhang, Z. Yang, C. Huang, and M. Debbah, “Channel deduction: A new learning framework to acquire channel from outdated samples and coarse estimate,” *IEEE J. Sel. Areas Commun.*, vol. 43, no. 3, pp. 944–958, Mar. 2025.

[18] H. Zhou et al., “Informer: Beyond efficient transformer for long sequence time-series forecasting,” in *Proc. AAAI* (Vancouver, BC, Canada), Feb. 2021, pp. 11106–11115.

[19] A. Zeng et al., “Are transformers effective for time series forecasting?” in *Proc. AAAI* (Washington, DC, USA), Feb. 2023, pp. 11121–11128.

[20] Z. Chen, F. Gu, and R. Jiang, “Channel estimation method based on transformer in high dynamic environment,” in *Proc. WCSP* (Nanjing, China), Oct. 2020, pp. 817–822.

[21] S. Singh, A. Trivedi, and D. Saxena, “Channel estimation for intelligent reflecting surface aided communication via graph transformer,” *IEEE Trans. Green Commun. Netw.*, vol. 8, no. 2, pp. 756–766, Jun. 2024.

[22] H. Ju, S. Jeong, B. Lee, and B. Shim, “Transformer-based predictive channel estimation for mmWave massive MIMO systems,” in *Proc. VTC-Fall* (Washington, DC, USA), Oct. 2024, pp. 1–5.

[23] J. Guo, G. Liu, Q. Wu, and P. Fan, “Parallel attention-based transformer for channel estimation in RIS-aided 6G wireless communications,” *IEEE Trans. Veh. Technol.*, vol. 73, no. 11, pp. 15927–15940, Nov. 2024.

[24] Y. Cui et al., “Sensing-assisted high reliable communication: A transformer-based beamforming approach,” *IEEE J. Select. Topics Signal Process.*, vol. 18, no. 5, pp. 782–795, May 2024.

[25] Y. Zhang, S. Li, D. Li, J. Zhu, and Q. Guan, “Transformer-based predictive beamforming for integrated sensing and communication in vehicular networks,” *IEEE Internet Things J.*, vol. 11, no. 11, pp. 20690–20705, Jun. 2024.

[26] S. Zhang, S. Zhang, W. Yuan, and T. Q. S. Quek, “Transformer-empowered predictive beamforming for rate-splitting multiple access in non-terrestrial networks,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 12, pp. 19776–19788, Dec. 2024.

[27] J. Zhang et al., “Deep learning-empowered secure predictive beamforming design for integrated sensing and communications systems,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 10, pp. 8565–8580, Oct. 2025.

[28] Z. Xiao, Z. Zhang, Z. Chen, Z. Yang, and R. Jin, “Mobile MIMO channel prediction with ODE-RNN: A physics-inspired adaptive approach,” in *Proc. PIMRC* (Kyoto, Japan), Sep. 2022, pp. 1301–1307.

[29] K. Ma, F. Zhang, W. Tian, and Z. Wang, “Continuous-time mmWave beam prediction with ODE-LSTM learning architecture,” *IEEE Wireless Commun. Lett.*, vol. 12, no. 1, pp. 187–191, Jan. 2023.

[30] M. Cui, H. Jiang, Y. Chen, Y. Du, and L. Dai, “Continuous-time channel prediction based on tensor neural ordinary differential equation,” *China Commun.*, vol. 21, no. 1, pp. 163–174, Jan. 2024.

[31] Z. Xiao, Z. Zhang, Z. Chen, Z. Yang, C. Huang, and X. Chen, “From data-driven learning to physics-inspired inferring: A novel mobile MIMO channel prediction scheme based on neural ODE,” *IEEE Trans. Wireless Commun.*, vol. 23, no. 7, pp. 7186–7199, Jul. 2024.

[32] Z. Xiao, Y. Huang, Y. Xu, T. Jiao, and D. He, “ODE-Former for mobile channel prediction: A novel learning structure leveraging the physics continuity,” *IEEE Wireless Commun. Lett.*, vol. 14, no. 7, pp. 2184–2188, Jul. 2025.

[33] Y. Sang, K. Ma, Z. Wang, and S. Chen, “Dual-band super-resolution channel prediction in high-mobility MIMO systems,” *IEEE Trans. Commun.*, vol. 73, no. 6, pp. 4409–4424, Jun. 2025.

[34] Y. Nie et al., “A time series is worth 64 words: Long-term forecasting with transformers,” in *Proc. ICLR* (Kigali, Rwanda), May 2023.

[35] “Continuous-time transformer for channel prediction,” implementation in the public domain, accessed 2025. https://github.com/sangyl23/Continuous-Time-Transformer.

[36] *Study on channel model for frequencies from 0.5 to 100 GHz* (Release 17), 3GPP TR 38.901, 2022, version 17.0.0.

[37] G. Liu, Z. Hu, L. Wang, H. Zhang, J. Xue, and M. Matthaiou, “A hypernetwork based framework for non-stationary channel prediction,” *IEEE Trans. Veh. Technol.*, vol. 73, no. 6, pp. 8338–8351, Jun. 2024.

[38] L. Wang, G. Liu, J. Xue, and K.-K. Wong, “Channel prediction using ordinary differential equations for MIMO systems,” *IEEE Trans. Veh. Technol.*, vol. 72, no. 2, pp. 2111–2119, Feb. 2023.

[39] V. Lesnikov, T. Naumovich, and A. Chastikov, “Dealiasing technique for processing of sub-Nyquist sampled bandpass analytic signals,” in *Proc. SIBCON* (Tomsk, Russia), May 2021, pp. 1–6.

[40] *Radio resource control (RRC) protocol specification* (Release 15), 3GPP TS 38.331, 2019, version 15.6.0.

[41] T. J. Rivlin, *Chebyshev Polynomials*. Mineola, NY: Courier Dover, 2020.

[42] P. J. Davis, *Interpolation and Approximation*. New York, NY: Blaisdell, 1963.

[43] E. W. Cheney and W. A. Light, *A Course in Approximation Theory*. Providence, RI: American Mathematical Society, 2009.

[44] A. M. Dizqah, B. Lenzo, A. Sorniotti, P. Gruber, S. Fallah, and J. De Smet, “A fast and parametric torque distribution strategy for four-wheel-drive energy-efficient electric vehicles,” *IEEE Trans. Ind. Electron.*, vol. 63, no. 7, pp. 4367–4376, Jul. 2016.

[45] R. Liu, X. Zhu, L. Liu, and B. Wu, “Personalized and common acceleration distribution characteristic of human driver,” in *Proc. ITSC* (Maui, HI, USA), Nov. 2018, pp. 1820–1825.

[46] T. S. Rappaport, *Wireless Communications: Principles and Practice*, 2nd ed. Upper Saddle River, NJ: Prentice Hall, 2002.

[47] X. Ma and Z. Gao, “Data-driven deep learning to design pilot and channel estimator for massive MIMO,” *IEEE Trans. Veh. Technol.*, vol. 69, no. 5, pp. 5677–5682, May 2020.

[48] M. B. Mashhadi and D. Gündüz, “Pruning the pilots: Deep learning-based pilot design and channel estimation for MIMO-OFDM systems,” *IEEE Trans. Wireless Commun.*, vol. 20, no. 10, pp. 6315–6328, Oct. 2021.

[49] R. T. Q. Chen et al., “Neural ordinary differential equations,” in *Proc. NeurIPS* (Montréal, QC, Canada), Dec. 2018, pp. 6572–6583.

[50] Y. Rubanova, R. T. Q. Chen, and D. K. Duvenaud, “Latent ODEs for irregularly-sampled time series,” in *Proc. NeurIPS* (Vancouver, BC, Canada), Dec. 2019, pp. 5320–5330.

[51] J. Morrill et al., “Neural rough differential equations for long time series,” in *Proc. ICML* (Vienna, Austria), Jul. 2021, pp. 7829–7838.

[52] Y. Chen et al., “ContiFormer: Continuous-time transformer for irregular time series modeling,” in *Proc. NeurIPS* (New Orleans, LA, USA), Dec. 2023, pp. 47143–47175.

[53] W. H. Press et al., *Numerical Recipes*. New York, NY: Cambridge University Press, 1986.

[54] Y. Xiong et al., “Nyströmformer: A Nyström-based algorithm for approximating self-attention,” in *Proc. AAAI* (Vancouver, Canada), Feb. 2021, pp. 14138–14148.

[55] K. Choromanski et al., “Rethinking attention with performers,” in *Proc. ICLR*, May 2021.

[56] M. Raghu et al., “On the expressive power of deep neural networks,” in *Proc. ICML* (Sydney, Australia), Aug. 2017, pp. 2847–2854.

[57] N. Rahaman et al., “On the spectral bias of neural networks,” in *Proc. ICML* (Long Beach, CA, USA), Jun. 2019, pp. 5301–5310.

[58] B. Mildenhall, P. P. Srinivasan, M. Tancik, J. T. Barron, R. Ramamoorthi, and R. Ng, “NeRF: Representing scenes as neural radiance fields for view synthesis,” in *Proc. ECCV* (Glasgow, UK), Aug. 2020, pp. 405–421.

[59] M. Tancik et al., “Fourier features let networks learn high frequency functions in low dimensional domains,” in *Proc. NeurIPS* (Vancouver, Canada), Dec. 2020, pp. 7537–7547.

[60] P. Wang, K. Ma, Y. Bai, C. Sun, and Z. Wang, “Deep learning assisted mmWave beam prediction with flexible network architecture,” *IEEE Trans. Wireless Commun.*, vol. 24, no. 11, pp. 9435–9448, Nov. 2025.

[61] A. N. Uwaechia and N. M. Mahyuddin, “A review on sparse channel estimation in OFDM system using compressed sensing,” *IETE Tech. Rev.*, vol. 34, no. 5, pp. 514–531, 2017.

[62] H. Kang, Q. Hu, H. Chen, Q. Huang, Q. Zhang, and M. Cheng, “Cross-shaped separated spatial-temporal UNet transformer for accurate channel prediction,” in *Proc. IEEE INFOCOM* (Vancouver, Canada), May 2024, pp. 2079–2088.

[63] S. Fan, H. Li, X. Liang, Z. Liu, X. Gu, and L. Zhang, “E2ENet: An end-to-end channel prediction neural network based on uplink pilot for FDD systems,” *IEEE Wireless Commun. Lett.*, vol. 13, no. 5, pp. 1285–1289, May 2024.

[64] A. Alkhateeb, “DeepMIMO: A generic deep learning dataset for millimeter wave and massive MIMO applications,” in *Proc. ITA* (San Diego, CA, USA), Feb. 2019, pp. 1–8.

